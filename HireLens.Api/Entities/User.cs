namespace HireLens.Api.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";


    public string PasswordHash { get; set; } = "";

    
    public string Role { get; set; } = "Recruiter";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}