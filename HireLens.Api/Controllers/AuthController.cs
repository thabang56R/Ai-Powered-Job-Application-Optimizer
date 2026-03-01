using HireLens.Api.Data;
using HireLens.Api.DTOs;
using HireLens.Api.Entities;
using HireLens.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordService _passwords;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, PasswordService passwords, JwtService jwt)
    {
        _db = db;
        _passwords = passwords;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        if (await _db.Users.AnyAsync(x => x.Email == email))
            return BadRequest("Email already registered.");

        var role = string.IsNullOrWhiteSpace(dto.Role) ? "Recruiter" : dto.Role;

        if (role != "Admin" && role != "Recruiter")
            return BadRequest("Role must be Admin or Recruiter.");

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            Role = role,
            PasswordHash = _passwords.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.CreateToken(user);
        return Ok(new { token, user = new { user.Id, user.FullName, user.Email, user.Role } });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await _db.Users.SingleOrDefaultAsync(x => x.Email == email);
        if (user is null) return Unauthorized("Invalid credentials.");

        if (!_passwords.VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials.");

        var token = _jwt.CreateToken(user);
        return Ok(new { token, user = new { user.Id, user.FullName, user.Email, user.Role } });
    }
}