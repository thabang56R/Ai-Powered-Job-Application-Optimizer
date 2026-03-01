using System.Text.Json;
using HireLens.Api.Data;
using HireLens.Api.DTOs;
using HireLens.Api.Entities;
using HireLens.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Controllers;

[ApiController]
[Route("api/evaluations")]
[Authorize]
public class EvaluationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AiService _ai;
    private readonly EmbeddingService _embed;

    public EvaluationsController(AppDbContext db, AiService ai, EmbeddingService embed)
    {
        _db = db;
        _ai = ai;
        _embed = embed;
    }

    // Create Job (stores embedding if possible)
    [HttpPost("jobs")]
    public async Task<IActionResult> CreateJob(CreateJobDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");
        if (string.IsNullOrWhiteSpace(dto.Company)) return BadRequest("Company is required.");
        if (string.IsNullOrWhiteSpace(dto.DescriptionText)) return BadRequest("DescriptionText is required.");

        string? embeddingJson = null;
        bool embeddingCreated = false;

        try
        {
            var vec = await _embed.CreateEmbeddingAsync(dto.DescriptionText);
            embeddingJson = JsonSerializer.Serialize(vec);
            embeddingCreated = true;
        }
        catch (InvalidOperationException)
        {
            // OpenAI key missing -> allow job creation anyway
            embeddingJson = null;
            embeddingCreated = false;
        }
        catch
        {
            embeddingJson = null;
            embeddingCreated = false;
        }

        var job = new JobPosting
        {
            Title = dto.Title.Trim(),
            Company = dto.Company.Trim(),
            DescriptionText = dto.DescriptionText,
            EmbeddingJson = embeddingJson
        };

        _db.JobPostings.Add(job);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            job.Id,
            job.Title,
            job.Company,
            job.CreatedAtUtc,
            embeddingCreated
        });
    }

    // Evaluate (uses latest resume text if override is empty)
    [HttpPost]
    public async Task<IActionResult> Evaluate(EvaluateDto dto)
    {
        if (dto.CandidateId == Guid.Empty) return BadRequest("CandidateId is required.");
        if (dto.JobPostingId == Guid.Empty) return BadRequest("JobPostingId is required.");

        var candidate = await _db.Candidates.FindAsync(dto.CandidateId);
        if (candidate is null) return NotFound("Candidate not found.");

        var job = await _db.JobPostings.FindAsync(dto.JobPostingId);
        if (job is null) return NotFound("Job not found.");

        var resumeText = dto.ResumeTextOverride?.Trim();

        // If override not provided, use latest uploaded resume text from DB
        if (string.IsNullOrWhiteSpace(resumeText))
        {
            var latest = await _db.Resumes
                .Where(r => r.CandidateId == candidate.Id)
                .OrderByDescending(r => r.UploadedAtUtc)
                .FirstOrDefaultAsync();

            if (latest is null)
                return BadRequest("No resume found. Upload a resume PDF first, or provide ResumeTextOverride.");

            resumeText = latest.ContentText;
        }

        string rawJson;

        try
        {
            // Note: your AiService signature is EvaluateAsync(resumeText, jobDescription)
            rawJson = await _ai.EvaluateAsync(resumeText, job.DescriptionText);
        }
        catch (InvalidOperationException ex)
        {
            // clean message e.g. "OpenAI API key is not configured."
            return BadRequest(ex.Message);
        }
        catch
        {
            return StatusCode(500, "AI evaluation failed.");
        }

        using var doc = JsonDocument.Parse(rawJson);
        var root = doc.RootElement;

        var eval = new AiEvaluation
        {
            CandidateId = candidate.Id,
            JobPostingId = job.Id,
            MatchScore = root.GetProperty("matchScore").GetInt32(),
            StrengthsJson = root.GetProperty("strengths").GetRawText(),
            MissingSkillsJson = root.GetProperty("missingSkills").GetRawText(),
            RisksJson = root.GetProperty("risks").GetRawText(),
            SuggestionsJson = root.GetProperty("suggestions").GetRawText(),
            EvidenceJson = root.GetProperty("evidence").GetRawText()
        };

        _db.AiEvaluations.Add(eval);
        await _db.SaveChangesAsync();

        return Ok(eval);
    }

    [HttpGet("candidate/{candidateId:guid}")]
    public async Task<IActionResult> GetCandidateEvals(Guid candidateId)
    {
        var list = await _db.AiEvaluations
            .Where(e => e.CandidateId == candidateId)
            .OrderByDescending(e => e.CreatedAtUtc)
            .ToListAsync();

        return Ok(list);
    }
}