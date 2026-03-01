namespace HireLens.Api.DTOs;

public record CreateCandidateDto(string FullName, string Email, string Phone);
public record UpdateCandidateStatusDto(string Status, string? RecruiterNotes);