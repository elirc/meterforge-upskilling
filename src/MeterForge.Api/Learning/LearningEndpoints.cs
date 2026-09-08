using System.Reflection;

namespace MeterForge.Api.Learning;

public static class LearningEndpoints
{
    // Only explicitly embedded learning documents are addressable. No request path
    // is ever passed to the filesystem; the same catalog works after publishing.
    private static readonly IReadOnlyDictionary<string, LearningDocument> Documents = LoadDocuments();

    public static IEndpointRouteBuilder MapLearningEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/", () => Results.Redirect("/learn/"));
        // UseDefaultFiles owns the /learn directory redirect. Mapping that route
        // also matches /learn/ and prevents static-file middleware from serving it.
        endpoints.MapGet("/api/learning/documents", () => Results.Ok(
            Documents.Values.OrderBy(document => document.Path, StringComparer.Ordinal)
                .Select(document => new { document.Path, document.Title })));
        endpoints.MapGet("/api/learning/documents/{**path}", (string path, HttpContext context) =>
        {
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            return Documents.TryGetValue(path, out var document)
                ? Results.Text(document.Content, "text/plain; charset=utf-8")
                : Results.NotFound();
        });
        return endpoints;
    }

    private static IReadOnlyDictionary<string, LearningDocument> LoadDocuments()
    {
        var assembly = typeof(LearningEndpoints).Assembly;
        const string prefix = "LearningDocs/";
        return assembly.GetManifestResourceNames()
            .Where(name => name.StartsWith(prefix, StringComparison.Ordinal))
            .Select(name => ReadDocument(assembly, name, prefix.Length))
            .ToDictionary(document => document.Path, StringComparer.Ordinal);
    }

    private static LearningDocument ReadDocument(Assembly assembly, string resourceName, int prefixLength)
    {
        using var stream = assembly.GetManifestResourceStream(resourceName)!;
        using var reader = new StreamReader(stream);
        var content = reader.ReadToEnd();
        var path = resourceName[prefixLength..].Replace('\\', '/');
        var heading = content.Split('\n').FirstOrDefault(line => line.StartsWith("# ", StringComparison.Ordinal));
        return new LearningDocument(path, heading?[2..].Trim() ?? path, content);
    }

    private sealed record LearningDocument(string Path, string Title, string Content);
}
