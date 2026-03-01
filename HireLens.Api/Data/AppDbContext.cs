using HireLens.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<AiEvaluation> AiEvaluations => Set<AiEvaluation>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();

        modelBuilder.Entity<JobPosting>().Property(x => x.Title).HasMaxLength(200);
        
        modelBuilder.Entity<JobPosting>().Property(x => x.Company).HasMaxLength(200);

        modelBuilder.Entity<Resume>()
            .HasOne(r => r.Candidate)
            .WithMany()
            .HasForeignKey(r => r.CandidateId);

        modelBuilder.Entity<AiEvaluation>()
            .HasOne(e => e.Candidate)
            .WithMany()
            .HasForeignKey(e => e.CandidateId);

        modelBuilder.Entity<AiEvaluation>()
            .HasOne(e => e.JobPosting)
            .WithMany()
            .HasForeignKey(e => e.JobPostingId);
    }
}