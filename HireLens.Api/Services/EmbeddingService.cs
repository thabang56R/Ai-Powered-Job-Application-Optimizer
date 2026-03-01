using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace HireLens.Api.Services;

public class EmbeddingService
{
    private readonly IConfiguration _config;
    private readonly HttpClient _http = new();

    public EmbeddingService(IConfiguration config)
    {
        _config = config;

        var key = _config["OpenAI:ApiKey"];
        if (!string.IsNullOrWhiteSpace(key))
        {
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", key);
        }
    }

    public async Task<float[]> CreateEmbeddingAsync(string input)
    {
        var key = _config["OpenAI:ApiKey"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("OpenAI API key is not configured.");

        var model = _config["OpenAI:EmbeddingModel"] ?? "text-embedding-3-small";

        // Keep it reasonably sized (embeddings endpoint accepts long text but don't go crazy)
        var trimmed = input.Length > 12000 ? input[..12000] : input;

        var payload = new
        {
            model,
            input = trimmed
        };

        var json = JsonSerializer.Serialize(payload);
        var res = await _http.PostAsync(
            "https://api.openai.com/v1/embeddings",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode)
            throw new Exception($"OpenAI embeddings error: {res.StatusCode}");

        using var doc = JsonDocument.Parse(body);
        var arr = doc.RootElement.GetProperty("data")[0].GetProperty("embedding");

        var vec = new float[arr.GetArrayLength()];
        var i = 0;
        foreach (var v in arr.EnumerateArray())
            vec[i++] = v.GetSingle();

        return vec;
    }
}