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
        var candidate = new Candidate
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone.Trim(),
            Status = "New"
        };

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
        if (candidate is null) return NotFound();

        var allowed = new[] { "New", "Shortlisted", "Interview", "Rejected", "Hired" };
        if (!allowed.Contains(dto.Status))
            return BadRequest("Invalid status.");

        var before = new { candidate.Status, candidate.RecruiterNotes };

        candidate.Status = dto.Status;
        candidate.RecruiterNotes = dto.RecruiterNotes;

        await _db.SaveChangesAsync();

        var after = new { candidate.Status, candidate.RecruiterNotes };

        var actorEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        await _audit.LogAsync(actorEmail, "CandidateStatusChanged", "Candidate", candidate.Id, before, after);

        return Ok(candidate);
    }
}