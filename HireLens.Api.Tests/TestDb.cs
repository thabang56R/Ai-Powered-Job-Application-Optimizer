using HireLens.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HireLens.Api.Tests;

public static class TestDb
{
    public static AppDbContext Create()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(opts);
    }
}