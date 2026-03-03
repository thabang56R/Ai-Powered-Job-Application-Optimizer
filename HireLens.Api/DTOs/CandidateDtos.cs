namespace HireLens.Api.DTOs;

public class CreateCandidateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}

public class UpdateCandidateStatusDto
{
    public string Status { get; set; } = "New";
    public string? RecruiterNotes { get; set; }
}