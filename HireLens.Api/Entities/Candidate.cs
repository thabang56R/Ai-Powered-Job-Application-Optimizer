namespace HireLens.Api.Entities;

public class Candidate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Workflow fields
    public string Status { get; set; } = "New"; 
    public string? RecruiterNotes { get; set; }
}