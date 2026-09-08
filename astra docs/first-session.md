# Your first session

[Handbook](README.md) · [Learning path](learning-path.md) · [Codebase tour](codebase-tour.md)

Your first goal is to observe one successful run and explain what you saw. You can stop after that. Choose a 20–30 minute session; installation or restore may need a separate sitting. You do not need to understand every project or change a test today.

If programming is new, begin with [Start here](start-here.md) and [reading C#](foundations/01-reading-csharp.md). This setup guide can be used alongside those lessons. Sections 2 and 3 are optional follow-up sessions after [requests and data](foundations/03-requests-and-data.md); section 4 belongs after [your first test](foundations/04-first-test.md) and [a small change](foundations/05-small-change.md).

All commands below run from the repository root in PowerShell unless stated otherwise. The repository root is the folder containing `MeterForge.slnx` and `global.json`. A terminal runs commands; the .NET SDK supplies the tools to build C#; a dependency is another package the project needs; restore downloads those packages; a test checks an example of expected behavior; the API is the running program that receives requests.

## 1. Establish a baseline

Read [global.json](../global.json): the project selects SDK `10.0.302` with `latestPatch` roll-forward. Install the matching SDK feature band using the [official .NET downloads](https://dotnet.microsoft.com/en-us/download/dotnet/10.0), then reopen your terminal if `dotnet` is unavailable. A runtime-only installation cannot build the project.

```powershell
dotnet --info
dotnet restore MeterForge.slnx --locked-mode
dotnet test MeterForge.slnx --configuration Release
dotnet run --project src/MeterForge.Api --launch-profile http
```

Run one command at a time. `dotnet --info` reports the installed tools; restore prepares dependencies; test builds the solution and runs its automated checks; run starts the API. If a command fails, save the first error and use the table below before continuing. Reading and placement exercises still work without completing setup.

Leave the last command running: a server continues listening until you stop it, so the terminal need not return to a prompt. Open `http://localhost:5012/learn/`. The learning workspace helps you choose a stage, find reading, and record evidence. Progress and notes live in this browser on this origin; export them before clearing browser data or changing machines. The Markdown handbook also works directly in your editor without running the app.

**First win:** Record the command, the listening URL printed in the terminal, and what opened in the browser. In your own words, explain which command started the program and why its terminal is still busy. You may stop here, press `Ctrl+C` in that terminal to stop the API, and continue next time. A successful run is a complete first-session outcome.

For an optional observation, open `http://localhost:5012/health/ready` in your browser. This is a readiness endpoint: a URL that returns information about the running service. Expect `storage: in-memory-default` and `durableDefault: false`. Here, in-memory means the default data lives inside this running process and disappears when it stops. You do not need PostgreSQL or Docker for this session. The machine-readable API description is at `http://localhost:5012/openapi/v1.json` in the supplied development profile.

If port 5012 is occupied, pass `--urls http://localhost:5013` to `dotnet run` and change the URLs below. Use the URL printed by the application as the source of truth.

## 2. Later: send and trace a request

Use this after the requests and data foundation. A product is an item this sample can bill for; a tenant is a fictional customer organization whose data is kept separate. POST asks the API to create something, GET asks to retrieve it, and JSON is the named-value data format in the message. Open a second PowerShell terminal while the API remains running in the first.

```powershell
$meterforgeBase = 'http://localhost:5012'
$meterforgeBody = @{
    code = 'LEARN'
    name = 'Learning plan'
    monthlyAmount = 19
    currency = 'USD'
} | ConvertTo-Json
$meterforgeProduct = Invoke-RestMethod -Method Post `
    -Uri "$meterforgeBase/api/v1/tenants/learner-a/products/" `
    -ContentType 'application/json' -Body $meterforgeBody
$meterforgeProduct
Invoke-RestMethod -Uri "$meterforgeBase/api/v1/tenants/learner-a/products/$($meterforgeProduct.id)"
```

Expect the same product ID and a monthly price of 19 USD. Trace the request through [ProductEndpoints](../src/MeterForge.Api/Catalog/ProductEndpoints.cs), [ProductService](../src/MeterForge.Application/Catalog/ProductUseCases.cs), [Product](../src/MeterForge.Domain/Catalog/Product.cs), and [InMemoryProductRepository](../src/MeterForge.Infrastructure/Catalog/InMemoryProductRepository.cs). Find the separate [response contract](../src/MeterForge.Contracts/V1/Catalog/ProductContracts.cs).

Start by matching `name`, `monthlyAmount`, and `id` between the request and response. Then use the [codebase tour](codebase-tour.md) to write down where the price is checked, where the tenant is used for lookup, and where the product becomes a response. You can split this trace over several sessions. Stop and predict the response before each next experiment.

## 3. Later: compare expected and actual behavior

Change the GET URL to `learner-b` while keeping the product ID. Expect a 404; PowerShell reports that non-success response as an error. This tests a repository lookup boundary, not authenticated tenant authorization. There is no production identity system here.

Repeat the POST with `monthlyAmount = -1`. Expect HTTP 422 with the business code `price.negative`. Find that mapping in [BusinessRuleExceptionHandler](../src/MeterForge.Api/Errors/BusinessRuleExceptionHandler.cs). Inspect `X-Trace-Id` using browser network tools or `Invoke-WebRequest` on a successful GET.

Stop and restart the app. The previously created product is gone. Explain why a successful readiness response did not imply durable data.

## 4. After the foundations: change one thing with evidence

First complete [your first test](foundations/04-first-test.md) and [a small change](foundations/05-small-change.md). You should be able to explain an assertion, run a focused test, and inspect your Git diff before attempting this extension. It is not a first-session requirement.

```powershell
dotnet test tests/MeterForge.Api.Tests --filter FullyQualifiedName~ProductApiTests
dotnet test tests/MeterForge.Domain.Tests --filter FullyQualifiedName~ProductTests
```

Read [ProductApiTests](../tests/MeterForge.Api.Tests/Catalog/ProductApiTests.cs). Explain the setup, action, and assertion in one existing test before adding anything. Add a cross-tenant retrieval test if that case is absent; if it already exists, explain it and choose a missing boundary example. The assertion should protect the observable result, not private dictionary details.

An optional advanced check, after you can isolate and restore your own changes in Git, is to temporarily remove the owning lookup's tenant check and observe the test fail for the expected reason. Immediately restore that specific edit, inspect the diff, and rerun the test. Do not discard unrelated work. This fault-injection exercise belongs after the foundations, with help if needed.

Record the focused command, observed result, and what it establishes in a [learning note](templates/learning-note.md). Review the diff: can you explain every changed line? Use the [independent delivery bridge](bridges/02-independent-delivery.md) before [Lab 1](labs/01-vertical-slice.md), and explain the complete request and the difference between a tested lookup rule and authentication before moving on.

## Troubleshooting by evidence

| Symptom | Next check |
| --- | --- |
| `dotnet` not found | Check SDK installation and terminal PATH; reopen the terminal after installation. |
| SDK selection fails | Compare `dotnet --list-sdks` with `global.json`; do not casually change the project pin. |
| Locked restore fails | Read the first NuGet/network/version error. Do not delete lock files to hide it. |
| Restore reports `NU1100` for every dependency | Run from the repository root so [NuGet.Config](../NuGet.Config) supplies the public feed; check `dotnet nuget list source` and network access. |
| Browser cannot connect | Read the listening URL in the running API terminal and check port conflicts. |
| Product disappears | Default adapters reset on process restart; this is expected. |
| Database exercise fails | Check the explicit connection string and migrations described in the persistence lab; the basic session needs no Docker. |
| Learning library misses a new document | Rebuild the API: learning documents are packaged at build time. |

At the end of your actual session, keep what you observed and your next learning question. A successful run is enough for the first visit; a request trace and negative test are later milestones. On your next visit, explain the last result before opening your notes, then follow the [practice and feedback loop](practice-and-feedback.md).
