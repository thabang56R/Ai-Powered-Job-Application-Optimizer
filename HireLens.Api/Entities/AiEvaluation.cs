namespace HireLens.Api.Entities;

public class AiEvaluation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;

    public Guid JobPostingId { get; set; }
    public JobPosting JobPosting { get; set; } = null!;

    public int MatchScore { get; set; } 
    public string StrengthsJson { get; set; } = "[]";
    public string MissingSkillsJson { get; set; } = "[]";
    public string EvidenceJson { get; set; } = "[]"; 
    public string RisksJson { get; set; } = "[]";
    public string SuggestionsJson { get; set; } = "[]";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}