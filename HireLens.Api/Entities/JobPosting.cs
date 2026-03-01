namespace HireLens.Api.Entities;

public class JobPosting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "";
    public string Company { get; set; } = "";
    public string DescriptionText { get; set; } = "";
    public string? EmbeddingJson { get; set; } 
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}