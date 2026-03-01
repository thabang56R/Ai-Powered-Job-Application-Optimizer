using HireLens.Api.Services;
using Xunit;

namespace HireLens.Api.Tests;

public class VectorMathTests
{
    [Fact]
    public void CosineSimilarity_SameVector_IsOne()
    {
        var a = new float[] { 1, 2, 3 };
        var b = new float[] { 1, 2, 3 };

        var sim = VectorMath.CosineSimilarity(a, b);

        Assert.True(sim > 0.999);
    }

    [Fact]
    public void CosineSimilarity_Orthogonal_IsZero()
    {
        var a = new float[] { 1, 0 };
        var b = new float[] { 0, 1 };

        var sim = VectorMath.CosineSimilarity(a, b);

        Assert.True(Math.Abs(sim) < 0.0001);
    }

    [Fact]
    public void CosineSimilarity_MismatchedLengths_IsZero()
    {
        var a = new float[] { 1, 2 };
        var b = new float[] { 1, 2, 3 };

        var sim = VectorMath.CosineSimilarity(a, b);

        Assert.Equal(0, sim);
    }
}