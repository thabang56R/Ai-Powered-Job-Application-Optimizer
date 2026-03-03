using System.Security.Claims;
using HireLens.Api.Data;
using HireLens.Api.DTOs;
using HireLens.Api.Entities;
using HireLens.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Controllers;

[ApiController]
[Route("api/candidates")]
[Authorize]
public class CandidatesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuditService _audit;

    public CandidatesController(AppDbContext db, AuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCandidateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest("FullName is required.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required.");

        var candidate = new Candidate
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),

            // If Candidate.Phone is non-nullable string, don't assign null.
            Phone = string.IsNullOrWhiteSpace(dto.Phone) ? "" : dto.Phone.Trim(),

            Status = "New"
        };

        // Only set RecruiterNotes if your Candidate entity has it
        if (!string.IsNullOrWhiteSpace(dto.Notes))
            candidate.RecruiterNotes = dto.Notes.Trim();

        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync();

        return Ok(candidate);
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var list = await _db.Candidates
            .OrderByDescending(c => c.CreatedAtUtc)
            .ToListAsync();

        return Ok(list);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateCandidateStatusDto dto)
    {
        var candidate = await _db.Candidates.FindAsync(id);
        if (candidate is null) return NotFound("Candidate not found.");

        var allowed = new[] { "New", "Shortlisted", "Interview", "Rejected", "Hired" };
        if (string.IsNullOrWhiteSpace(dto.Status) || !allowed.Contains(dto.Status))
            return BadRequest("Invalid status.");

        var before = new { candidate.Status, candidate.RecruiterNotes };

        candidate.Status = dto.Status;

        // If RecruiterNotes exists and is nullable, this is fine.
        candidate.RecruiterNotes = string.IsNullOrWhiteSpace(dto.RecruiterNotes)
            ? candidate.RecruiterNotes
            : dto.RecruiterNotes.Trim();

        await _db.SaveChangesAsync();

        var after = new { candidate.Status, candidate.RecruiterNotes };

        var actorEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        await _audit.LogAsync(actorEmail, "CandidateStatusChanged", "Candidate", candidate.Id, before, after);

        return Ok(candidate);
    }
}