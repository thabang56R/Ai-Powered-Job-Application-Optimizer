namespace HireLens.Api.DTOs;

public record CreateJobDto(string Title, string Company, string DescriptionText);
public record EvaluateDto(Guid CandidateId, Guid JobPostingId, string? ResumeTextOverride);