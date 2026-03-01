using HireLens.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuditController(AppDbContext db) => _db = db;

    // Example: /api/audit?entityType=Candidate&entityId=GUID
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string entityType, [FromQuery] Guid entityId)
    {
        if (string.IsNullOrWhiteSpace(entityType)) return BadRequest("entityType required.");
        if (entityId == Guid.Empty) return BadRequest("entityId required.");

        var logs = await _db.AuditLogs
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();

        return Ok(logs);
    }
}