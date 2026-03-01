namespace HireLens.Api.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string ActorEmail { get; set; } = "";
    public string Action { get; set; } = ""; 
    public string EntityType { get; set; } = ""; 
    public Guid EntityId { get; set; }

    public string BeforeJson { get; set; } = "{}";
    public string AfterJson { get; set; } = "{}";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}