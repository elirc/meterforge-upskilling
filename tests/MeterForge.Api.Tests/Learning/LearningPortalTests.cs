using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MeterForge.Api.Tests.Learning;

public sealed class LearningPortalTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public LearningPortalTests(WebApplicationFactory<Program> factory) =>
        _client = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Testing"))
            .CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

    [Theory]
    [InlineData("/")]
    [InlineData("/learn")]
    public async Task EntryPoint_RedirectsToLearningStudio(string path)
    {
        var response = await _client.GetAsync(path);

        Assert.True(response.StatusCode is HttpStatusCode.Redirect or HttpStatusCode.MovedPermanently);
        var location = response.Headers.Location;
        Assert.NotNull(location);
        Assert.Equal(new Uri(_client.BaseAddress!, "/learn/"), new Uri(_client.BaseAddress!, location));
    }

    [Theory]
    [InlineData("/learn/", "text/html", "Learning studio")]
    [InlineData("/learn/app.js", "text/javascript", "meterforge.learning.v1")]
    [InlineData("/learn/styles.css", "text/css", "prefers-reduced-motion")]
    public async Task Studio_ServesLocalAssets(string path, string contentType, string expectedContent)
    {
        var response = await _client.GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(contentType, response.Content.Headers.ContentType?.MediaType);
        Assert.Contains(expectedContent, await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task DocumentCatalog_EveryEntryIsAvailableAsPlainText()
    {
        var documents = await _client.GetFromJsonAsync<LearningDocument[]>("/api/learning/documents");

        Assert.NotNull(documents);
        Assert.Contains(documents, document => document.Path == "README.md");
        Assert.Contains(documents, document => document.Path == "labs/01-vertical-slice.md");
        foreach (var document in documents)
        {
            Assert.False(string.IsNullOrWhiteSpace(document.Title));
            var response = await _client.GetAsync($"/api/learning/documents/{document.Path}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("text/plain", response.Content.Headers.ContentType?.MediaType);
            Assert.Contains("nosniff", response.Headers.GetValues("X-Content-Type-Options"));
            Assert.False(string.IsNullOrWhiteSpace(await response.Content.ReadAsStringAsync()));
        }
    }

    [Theory]
    [InlineData("not-a-document.md")]
    [InlineData("appsettings.json")]
    [InlineData("src/MeterForge.Api/Program.cs")]
    [InlineData("%2e%2e%2f%2e%2e%2fappsettings.json")]
    [InlineData("%2e%2e%5cappsettings.json")]
    public async Task Documents_RejectAnythingOutsideEmbeddedCatalog(string path)
    {
        var response = await _client.GetAsync($"/api/learning/documents/{path}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private sealed record LearningDocument(string Path, string Title);
}
