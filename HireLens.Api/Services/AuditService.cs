using System.Text.Json;
using HireLens.Api.Data;
using HireLens.Api.Entities;

namespace HireLens.Api.Services;

public class AuditService
{
    private readonly AppDbContext _db;
    public AuditService(AppDbContext db) => _db = db;

    public async Task LogAsync(string actorEmail, string action, string entityType, Guid entityId, object beforeObj, object afterObj)
    {
        var log = new AuditLog
        {
            ActorEmail = actorEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            BeforeJson = JsonSerializer.Serialize(beforeObj),
            AfterJson = JsonSerializer.Serialize(afterObj),
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}