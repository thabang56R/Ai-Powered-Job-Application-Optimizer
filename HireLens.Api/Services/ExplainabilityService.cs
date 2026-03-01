using System.Text.RegularExpressions;

namespace HireLens.Api.Services;

public class ExplainabilityService
{
    // Small stopword list 
    private static readonly HashSet<string> Stop = new(StringComparer.OrdinalIgnoreCase)
    {
        "and","or","the","a","an","to","of","in","on","for","with","as","at","by","from","is","are","was","were",
        "be","been","being","this","that","these","those","it","its","you","your","we","our","they","their",
        "will","would","can","could","should","must","may","might","do","does","did","done",
        "using","use","used","build","built","develop","developed","design","designed",
        "experience","years","year","strong","knowledge","skills","ability","responsible","requirements"
    };

    public (List<string> topTerms, List<(string term, string snippet)> evidence) Explain(string jobText, string resumeText)
    {
        var top = ExtractTopTerms(jobText, 25);

        var evidence = new List<(string term, string snippet)>();

        foreach (var t in top)
        {
            var snip = FindSnippet(resumeText, t);
            if (snip is not null)
                evidence.Add((t, snip));
        }

        return (top, evidence);
    }

    public static List<string> ExtractTopTerms(string text, int take)
    {
        text = (text ?? "").ToLowerInvariant();

       
        text = text.Replace("\r", " ").Replace("\n", " ");

        
        var tokens = Regex.Matches(text, @"[a-z0-9\.\#\+]{2,}")
            .Select(m => m.Value)
            .Where(t => t.Length >= 2 && t.Length <= 25)
            .Where(t => !Stop.Contains(t))
            .ToList();

       
        tokens = tokens.Select(t => t.Trim('.')).Where(t => t.Length >= 2).ToList();

        var freq = tokens
            .GroupBy(t => t)
            .Select(g => new { term = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ThenByDescending(x => x.term.Length)
            .ToList();

        // Prefer tech-ish tokens by simple boosts
        var boosted = freq
            .Select(x => new
            {
                x.term,
                score = x.count
                        + (x.term.Contains(".") ? 2 : 0)
                        + (x.term.Contains("#") ? 2 : 0)
                        + (x.term.Contains("+") ? 2 : 0)
            })
            .OrderByDescending(x => x.score)
            .ThenByDescending(x => x.term.Length)
            .Select(x => x.term)
            .Distinct()
            .Take(take)
            .ToList();

        return boosted;
    }

   
    public static string? FindSnippet(string haystack, string term, int radius = 90)
    {
        if (string.IsNullOrWhiteSpace(haystack) || string.IsNullOrWhiteSpace(term))
            return null;

        var idx = haystack.IndexOf(term, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;

        var start = Math.Max(0, idx - radius);
        var end = Math.Min(haystack.Length, idx + term.Length + radius);

        var snippet = haystack.Substring(start, end - start).Trim();
        snippet = snippet.Replace("\r", " ").Replace("\n", " ");

       
        while (snippet.Contains("  ")) snippet = snippet.Replace("  ", " ");

       
        if (start > 0) snippet = "… " + snippet;
        if (end < haystack.Length) snippet = snippet + " …";

        return snippet;
    }
}