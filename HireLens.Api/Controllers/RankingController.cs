using System.Text.Json;
using HireLens.Api.Data;
using HireLens.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Controllers;

[ApiController]
[Route("api/rankings")]
[Authorize]
public class RankingController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmbeddingService _embed;
    private readonly ExplainabilityService _explain;

    public RankingController(AppDbContext db, EmbeddingService embed, ExplainabilityService explain)
    {
        _db = db;
        _embed = embed;
        _explain = explain;
    }

    // GET /api/rankings/jobs/{jobId}/candidates
    [HttpGet("jobs/{jobId:guid}/candidates")]
    public async Task<IActionResult> RankCandidates(Guid jobId)
    {
        var job = await _db.JobPostings.FindAsync(jobId);
        if (job is null) return NotFound("Job not found.");

        // Ensure job embedding exists
        if (string.IsNullOrWhiteSpace(job.EmbeddingJson))
        {
            try
            {
                var vec = await _embed.CreateEmbeddingAsync(job.DescriptionText);
                job.EmbeddingJson = JsonSerializer.Serialize(vec);
                await _db.SaveChangesAsync();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message); // "OpenAI API key is not configured."
            }
            catch
            {
                return StatusCode(500, "Failed to generate job embedding.");
            }
        }

        var jobVec = JsonSerializer.Deserialize<float[]>(job.EmbeddingJson!) ?? Array.Empty<float>();
        if (jobVec.Length == 0) return StatusCode(500, "Job embedding is invalid.");

        var candidates = await _db.Candidates
            .OrderByDescending(c => c.CreatedAtUtc)
            .ToListAsync();

        var ranked = new List<object>();

        foreach (var c in candidates)
        {
            var latestResume = await _db.Resumes
                .Where(r => r.CandidateId == c.Id)
                .OrderByDescending(r => r.UploadedAtUtc)
                .FirstOrDefaultAsync();

            if (latestResume is null) continue;

            // Ensure resume embedding exists
            if (string.IsNullOrWhiteSpace(latestResume.EmbeddingJson))
            {
                try
                {
                    var vec = await _embed.CreateEmbeddingAsync(latestResume.ContentText);
                    latestResume.EmbeddingJson = JsonSerializer.Serialize(vec);
                    await _db.SaveChangesAsync();
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
                catch
                {
                    return StatusCode(500, "Failed to generate resume embedding.");
                }
            }

            var resVec = JsonSerializer.Deserialize<float[]>(latestResume.EmbeddingJson!) ?? Array.Empty<float>();
            if (resVec.Length == 0) continue;

            var sim = VectorMath.CosineSimilarity(jobVec, resVec); // -1..1
            var semanticScore = (int)Math.Round(Math.Max(0, sim) * 100); // clamp 0..100

            ranked.Add(new
            {
                candidateId = c.Id,
                fullName = c.FullName,
                email = c.Email,
                phone = c.Phone,
                status = c.Status,
                semanticScore
            });
        }

        var sorted = ranked
            .OrderByDescending(x => ((dynamic)x).semanticScore)
            .ToList();

        return Ok(new
        {
            jobId = job.Id,
            jobTitle = job.Title,
            company = job.Company,
            ranked = sorted
        });
    }

    // GET /api/rankings/jobs/{jobId}/candidates/{candidateId}/explain
    [HttpGet("jobs/{jobId:guid}/candidates/{candidateId:guid}/explain")]
    public async Task<IActionResult> Explain(Guid jobId, Guid candidateId)
    {
        var job = await _db.JobPostings.FindAsync(jobId);
        if (job is null) return NotFound("Job not found.");

        var candidate = await _db.Candidates.FindAsync(candidateId);
        if (candidate is null) return NotFound("Candidate not found.");

        var latestResume = await _db.Resumes
            .Where(r => r.CandidateId == candidateId)
            .OrderByDescending(r => r.UploadedAtUtc)
            .FirstOrDefaultAsync();

        if (latestResume is null)
            return BadRequest("No resume found for this candidate. Upload a resume first.");

        var (topTerms, evidencePairs) = _explain.Explain(job.DescriptionText, latestResume.ContentText);

        var matched = evidencePairs
            .Select(x => x.term)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(20)
            .ToList();

        var missing = topTerms
            .Where(t => !matched.Contains(t, StringComparer.OrdinalIgnoreCase))
            .Take(20)
            .ToList();

        // Optional: include semantic score if embeddings exist
        int? semanticScore = null;
        if (!string.IsNullOrWhiteSpace(job.EmbeddingJson) && !string.IsNullOrWhiteSpace(latestResume.EmbeddingJson))
        {
            try
            {
                var jobVec = JsonSerializer.Deserialize<float[]>(job.EmbeddingJson!) ?? Array.Empty<float>();
                var resVec = JsonSerializer.Deserialize<float[]>(latestResume.EmbeddingJson!) ?? Array.Empty<float>();
                var sim = VectorMath.CosineSimilarity(jobVec, resVec);
                semanticScore = (int)Math.Round(Math.Max(0, sim) * 100);
            }
            catch
            {
                semanticScore = null;
            }
        }

        var evidence = evidencePairs
            .Take(12)
            .Select(x => new { term = x.term, snippet = x.snippet })
            .ToList();

        return Ok(new
        {
            jobId = job.Id,
            candidateId = candidate.Id,
            candidateName = candidate.FullName,
            semanticScore,
            matchedTerms = matched,
            missingTerms = missing,
            evidence
        });
    }
}