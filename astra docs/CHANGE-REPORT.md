# Astra improvement report

Date: 2026-09-07. Scope: strengthen MeterForge as a practical junior-to-mid/senior SWE learning environment. Three Astra subagents contributed the curriculum, labs/templates, and learning portal; the coordinating agent integrated onboarding and verification.

This report records the initial improvement. See the subsequent [learning-focused review](UPSKILLING-REVIEW.md) for the beginner sequence, practice feedback, and later verification.

## What changed

| Area | Delivered | Why it helps |
| --- | --- | --- |
| Learning interface | `/learn/` studio; root redirect; seven challenge cards; search, stage and review filters; progress and next challenge | Makes the next useful practice task easy to find. |
| Reading | Embedded Markdown catalog, document reader, related-guide navigation, plain-text document endpoint | Keeps the handbook available in a published app and connects learning to the repository. |
| Evidence capture | Browser-local notes and review state, validated JSON import, export backup, storage-failure messaging | Gives learners a place to record reasoning and carry evidence between sessions. |
| Orientation | [First session](first-session.md), [learning path](learning-path.md), [codebase tour](codebase-tour.md), [competency matrix](competency-matrix.md) | Replaces a reading-only entry point with a runnable exercise and observable progress criteria. |
| Engineering depth | Six [source-grounded notes](README.md) | Covers modeling, contracts, concurrency, persistence, reliability, testing, operations, and technical leadership. |
| Deliberate practice | Seven [labs](labs/README.md) with acceptance criteria and review questions | Turns current limitations into bounded implementation and investigation assignments. |
| Reusable habits | [Learning note](templates/learning-note.md), [ADR](templates/adr.md), [design review](templates/design-review.md), [postmortem](templates/incident-postmortem.md), [evidence review](templates/evidence-and-review.md) | Makes reasoning, measurement, and communication part of delivery. |
| Maintenance | [Documentation link checker](../tools/check_docs.py), CI integration, expanded root onboarding | Helps keep a much larger learning collection navigable. |
| Reproducible restore | Repository [NuGet.Config](../NuGet.Config) explicitly selects the public package feed | Resolves the observed setup failure when the host has no NuGet sources configured. |
| Consistent formatting | [.gitattributes](../.gitattributes) aligns checkout line endings with the existing LF editor policy | Prevents Windows Git conversion from making otherwise unchanged source fail the formatter. |

## Learning design

The original fifteen sprints remain available. The extension follows a progression from explaining a local invariant to delivering independently, then evaluating cross-boundary failures and supporting other engineers. Reading completion is deliberately separate from demonstrated ability. The competency rubric asks for tests, observations, reviewed decisions, recovery plans, and teach-backs; it does not promise a job title.

The material names real implementation gaps: usage ingestion uses a non-atomic find/add sequence; invoice snapshot conflicts can ignore divergent data; the invoice HTTP route is a calculation/finalization preview; the outbox has models/schema but no operated delivery worker; runtime storage is in-memory. These are documented exercises, not fixes claimed by this change.

## Implementation boundaries

The portal uses existing ASP.NET hosting with local HTML/CSS/JavaScript assets and no added runtime packages or external frontend services. Only Markdown embedded from `astra docs` is in the learning document catalog. Request paths are dictionary keys, not filesystem reads. Documents are served as plain text and displayed as text; related-document buttons only target known catalog entries.

Directory handling owns the `/learn` to `/learn/` redirect. The integration tests exposed a conflicting route that redirected the page to itself; that route was removed, and the static-page test protects the final behavior.

Notes and review checkmarks are stored in localStorage for the current browser and origin. They are not saved by the API or synced across devices. Export/import is the backup and transfer mechanism. Import validates the schema and supported challenge IDs before replacing state. If browser storage is unavailable, the UI explains how to export the current session.

The billing services, persistence wiring, provider behavior, SDK pin, and package dependencies retain their existing behavior. This release adds a learning experience and deeper curriculum; the existing [production-readiness limits](../docs/quality/PRODUCTION-READINESS.md) still apply.

## Verification

Validation used the repository-pinned .NET SDK 10.0.302, installed temporarily outside the checkout because `dotnet` was initially absent from PATH. The first restore exposed missing package sources, and the first format check exposed Windows checkout line-ending conversion; the repository configuration now addresses both.

| Check | Result |
| --- | --- |
| `dotnet restore MeterForge.slnx --locked-mode` | Passed using the repository NuGet configuration; package locks unchanged. |
| `dotnet build MeterForge.slnx --configuration Release --no-restore --disable-build-servers --maxcpucount:1` | Passed with 0 warnings and 0 errors. Build parallelism was limited for this machine. |
| `dotnet format MeterForge.slnx --verify-no-changes --no-restore` | Passed after aligning source checkout line endings with `.editorconfig`; the final routing/test edits also passed focused whitespace checks. |
| `dotnet list MeterForge.slnx package --vulnerable --include-transitive` | No known vulnerable packages reported by the configured source at verification time. |
| `python tools/check_docs.py` | Passed: 252 local links across 55 repository Markdown documents, including screenshots and report navigation. |
| JavaScript syntax checks | Passed for the portal and browser smoke script using `node --check`. |
| `dotnet publish src/MeterForge.Api --configuration Release --no-build --no-restore --output <temporary-directory>` | Passed; published files are outside the repository. |
| Full .NET test suite | All 53 passed, 0 failed, 0 skipped: API 17, Domain 26, Application 9, Architecture 1. Includes 11 new portal cases. |
| Published-app browser smoke | Passed against the published app at `http://127.0.0.1:5187` in Production, outside the source checkout. |

The final live browser run passed search/filtering, review and note persistence, backup import/export and invalid-backup rejection, safe text rendering, related-guide navigation, Escape dismissal, mobile overflow checks, and JavaScript error checks. It used the real published API except for one deliberately substituted unsafe-Markdown response that tested text rendering. Screenshots from this run: [desktop](screenshots/meterforge-learning-desktop.png) and [mobile](screenshots/meterforge-learning-mobile.png).

The final test run executed all four Release test assemblies together without filters, using the following equivalent full-suite invocation after the successful build:

```powershell
$meterforgeTestAssemblies = @(Get-ChildItem -Path 'tests/*/bin/Release/net10.0/MeterForge.*.Tests.dll' -File | ForEach-Object FullName)
dotnet vstest $meterforgeTestAssemblies --Parallel
```

The ordinary `dotnet test MeterForge.slnx --configuration Release` remains the default learner and CI command. The final assertion compares resolved redirect destinations so both relative and absolute `Location` headers are accepted when they point to the same expected origin and path.

To repeat it with an installed Playwright package and Chromium, start the published API, set `METERFORGE_BASE_URL` to its listening URL, then run `node tools/check_learning_portal.cjs`. See [portal maintenance](portal-maintenance.md) for optional browser-tool setup. These browser checks are separate from CI.

The learning collection contains 26 Markdown documents. PostgreSQL durability, real-provider behavior, accessibility with assistive technology, and the proposed lab implementations are not claimed as verified by this change. Those require the distinct evidence described in their exercises.

## Start using the changes

```powershell
dotnet restore MeterForge.slnx --locked-mode
dotnet run --project src/MeterForge.Api --launch-profile http
```

Open `http://localhost:5012/learn/`, choose **Start your first session**, and keep the resulting request trace and negative test in your notebook. Export the notebook when you finish. For editor-first learning, begin at the [handbook](README.md).

On the Windows machine used for this change, the temporary verification SDK is also available without modifying global PATH:

```powershell
$env:DOTNET_ROOT = Join-Path $env:LOCALAPPDATA 'Temp\meterforge-dotnet-10.0.302-python'
& "$env:DOTNET_ROOT\dotnet.exe" run --project src/MeterForge.Api --launch-profile http
```

This temporary path is specific to this verification session and may be cleared by the operating system. Use the [first-session setup](first-session.md) for a regular SDK installation.
