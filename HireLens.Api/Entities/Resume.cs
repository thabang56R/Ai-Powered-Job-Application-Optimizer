namespace HireLens.Api.Entities;

public class Resume
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;

    public string FileName { get; set; } = "";

    public string? EmbeddingJson { get; set; } 

    public string ContentType { get; set; } = "application/pdf";

    public string ContentText { get; set; } = ""; 
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}