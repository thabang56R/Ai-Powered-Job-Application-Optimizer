using Microsoft.AspNetCore.Http;

namespace HireLens.Api.DTOs;

public class ResumeUploadDto
{
    public Guid CandidateId { get; set; }
    public IFormFile File { get; set; } = default!;
}