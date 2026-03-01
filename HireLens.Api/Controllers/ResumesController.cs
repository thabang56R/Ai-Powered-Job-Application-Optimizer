using System.Text.Json;
using HireLens.Api.Data;
using HireLens.Api.Entities;
using HireLens.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Controllers;

[ApiController]
[Route("api/resumes")]
[Authorize]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PdfTextExtractor _extractor;
    private readonly EmbeddingService _embed;

    public ResumesController(AppDbContext db, PdfTextExtractor extractor, EmbeddingService embed)
    {
        _db = db;
        _extractor = extractor;
        _embed = embed;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(15_000_000)] // 15MB
    public async Task<IActionResult> Upload([FromForm] Guid candidateId, [FromForm] IFormFile file)
    {
        if (candidateId == Guid.Empty) return BadRequest("candidateId is required.");
        if (file == null || file.Length == 0) return BadRequest("PDF file is required.");

        var candidate = await _db.Candidates.FindAsync(candidateId);
        if (candidate is null) return NotFound("Candidate not found.");

        var contentType = file.ContentType?.ToLower() ?? "";
        var isPdf = contentType.Contains("pdf") || file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);
        if (!isPdf) return BadRequest("Only PDF files are supported.");

        if (file.Length > 15_000_000) return BadRequest("File too large (max 15MB).");

        // 1) Extract text
        string extracted;
        await using (var stream = file.OpenReadStream())
        {
            extracted = _extractor.ExtractTextFromPdf(stream);
        }

        extracted = CleanExtractedText(extracted);

        if (string.IsNullOrWhiteSpace(extracted))
            return BadRequest("Could not extract text from this PDF (it may be scanned images).");

        // 2) Try to create embedding (optional)
        string? embeddingJson = null;
        bool embeddingCreated = false;

        try
        {
            var vec = await _embed.CreateEmbeddingAsync(extracted);
            embeddingJson = JsonSerializer.Serialize(vec);
            embeddingCreated = true;
        }
        catch (InvalidOperationException)
        {
            // OpenAI key missing -> allow upload anyway (embedding remains null)
            embeddingJson = null;
            embeddingCreated = false;
        }
        catch
        {
            // Any embeddings failure should not block upload
            embeddingJson = null;
            embeddingCreated = false;
        }

        // 3) Save resume
        var resume = new Resume
        {
            CandidateId = candidate.Id,
            FileName = file.FileName,
            ContentType = file.ContentType ?? "application/pdf",
            ContentText = extracted,
            EmbeddingJson = embeddingJson
        };

        _db.Resumes.Add(resume);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            resume.Id,
            resume.CandidateId,
            resume.FileName,
            resume.UploadedAtUtc,
            extractedChars = resume.ContentText.Length,
            embeddingCreated
        });
    }

    
    [HttpGet("latest/{candidateId:guid}")]
    public async Task<IActionResult> Latest(Guid candidateId)
    {
        var resume = await _db.Resumes
            .Where(r => r.CandidateId == candidateId)
            .OrderByDescending(r => r.UploadedAtUtc)
            .FirstOrDefaultAsync();

        if (resume is null) return NotFound();

        return Ok(new
        {
            resume.Id,
            resume.CandidateId,
            resume.FileName,
            resume.UploadedAtUtc,
            extractedChars = resume.ContentText.Length,
            embeddingCreated = !string.IsNullOrWhiteSpace(resume.EmbeddingJson)
        });
    }

    private static string CleanExtractedText(string text)
    {
        text = text.Replace("\0", " ");
        text = text.Replace("\r", "\n");

        while (text.Contains("\n\n\n"))
            text = text.Replace("\n\n\n", "\n\n");

        return text.Trim();
    }
}