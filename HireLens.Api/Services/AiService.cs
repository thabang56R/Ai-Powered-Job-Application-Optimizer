using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace HireLens.Api.Services;

public class AiService
{
    private readonly IConfiguration _config;
    private readonly HttpClient _http = new();

    public AiService(IConfiguration config)
    {
        _config = config;

        var apiKey = _config["OpenAI:ApiKey"];

    if (string.IsNullOrWhiteSpace(apiKey))
       {
    throw new InvalidOperationException("OpenAI API key is not configured.");
       }
    }

    public async Task<string> EvaluateAsync(string resumeText, string jobText)
    {
        var model = _config["OpenAI:Model"] ?? "gpt-4o-mini";

        var payload = new
        {
            model,
            response_format = new { type = "json_object" },
            messages = new object[]
            {
                new { role = "system", content = "Return only valid JSON." },
                new { role = "user", content = $"RESUME:\n{resumeText}\n\nJOB:\n{jobText}" }
            },
            temperature = 0.2
        };

        var json = JsonSerializer.Serialize(payload);
        var res = await _http.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode)
            throw new Exception($"OpenAI error: {res.StatusCode} {body}");

        using var doc = JsonDocument.Parse(body);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "{}";
    }
}