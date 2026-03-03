using Microsoft.AspNetCore.Http;

namespace HireLens.Api.DTOs;

public class ResumeUploadDtos
{
    public Guid CandidateId { get; set; }
    public IFormFile File { get; set; } = default!;
}