namespace HireLens.Api.DTOs;

public record RegisterDto(string FullName, string Email, string Password, string Role);
public record LoginDto(string Email, string Password);