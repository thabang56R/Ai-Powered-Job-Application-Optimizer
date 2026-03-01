using HireLens.Api.Services;
using Xunit;

namespace HireLens.Api.Tests;

public class ExplainabilityServiceTests
{
    [Fact]
    public void Explain_FindsEvidence_ForMatchedTerms()
    {
        var svc = new ExplainabilityService();

        var job = "Looking for React, Node.js, SQL and JWT authentication experience.";
        var resume = "Built a React dashboard with Node.js API, JWT auth, and SQL Server database.";

        var (topTerms, evidence) = svc.Explain(job, resume);

        Assert.Contains(topTerms, t => t.Contains("react"));
        Assert.Contains(evidence, e => e.term.Contains("react", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(evidence, e => e.term.Contains("jwt", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Explain_ReturnsMissingTerms_WhenNotInResume()
    {
        var svc = new ExplainabilityService();

        var job = "Kubernetes Docker Terraform";
        var resume = "Built REST APIs with ASP.NET and SQL.";

        var (topTerms, evidence) = svc.Explain(job, resume);

        Assert.True(topTerms.Count > 0);
        Assert.Empty(evidence);
    }
}