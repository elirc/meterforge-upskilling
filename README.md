# MeterForge

MeterForge is a fifteen-sprint C#/.NET teaching repository for a fictional multi-tenant usage-based subscription billing platform, with an extended junior-to-mid/senior learning pathway. Practice business rules, API design, persistence, concurrency, integrations, testing, operations, and the judgment needed to own changes across a team.

## Start learning

New to programming? Start with [find your starting point](<astra docs/start-here.md>) and the [five beginner lessons](<astra docs/foundations/README.md>). They teach code reading, debugging, requests, tests, and small changes before the advanced billing labs. The [upskilling review](<astra docs/UPSKILLING-REVIEW.md>) explains this learning-focused revision.

Run the API and open [the learning workspace](http://localhost:5012/learn/) for searchable reading, exercises, browser-local progress, and notes. Start with the [first session](<astra docs/first-session.md>) for exact setup and a working API exercise.

The [Astra learning handbook](<astra docs/README.md>) adds a staged [learning path](<astra docs/learning-path.md>), an evidence-based [competency matrix](<astra docs/competency-matrix.md>), a [codebase tour](<astra docs/codebase-tour.md>), [hands-on labs](<astra docs/labs/README.md>), and reusable review templates. The [change report](<astra docs/CHANGE-REPORT.md>) records this expansion and its verification.

Progress means explaining a guarantee, reproducing a failure, implementing a bounded change, and defending it in review. Completing readings alone does not demonstrate role readiness.

It is an original educational product—not a Stripe clone, payment processor, accounting system, or production financial service. All tenants, providers, money flows, and policies are synthetic fixtures.

## What the course teaches

- model money, subscriptions, effective prices, usage, invoices, credits, refunds, and entitlements without framework coupling;
- make tenant scope, idempotency, optimistic concurrency, and immutable financial provenance explicit;
- integrate PostgreSQL and external providers through narrow application ports;
- design versioned APIs with Problem Details, `Idempotency-Key`, `If-Match`, and trace correlation;
- reason about outbox/webhook delivery, retries, ambiguous failures, and reconciliation;
- choose tests by risk and recognize when architecture or delivery ceremony becomes over-engineered.

## Architecture

```text
HTTP / OpenAPI contracts
          |
          v
Application use cases ------> persistence, provider, time, and event ports
          |
          v
Domain rules and financial records
          ^
          |
In-memory, PostgreSQL, and simulated provider adapters
```

The deployable shape is a modular monolith. MeterForge deliberately avoids MediatR, AutoMapper, generic repositories, microservices, and an internal framework.

## Course map

| Sprint | Outcome |
| --- | --- |
| 1 | Product and fixed-price vertical slice |
| 2 | Subscriptions, trials, and lifecycle |
| 3 | Effective-dated price versions |
| 4 | Idempotent usage ingestion |
| 5 | Tiered rating and `v0.5.0` |
| 6 | Invoice calculation and finalization |
| 7 | Transactional PostgreSQL adapter |
| 8 | Concurrent subscription amendments |
| 9 | Discounts, tax boundary, and credits |
| 10 | Payment provider integration |
| 11 | Outbox and webhooks |
| 12 | Entitlements and usage limits |
| 13 | Reconciliation, refunds, and disputes |
| 14 | Security and five-flaw harvest |
| 15 | Operations, retrospective, and `v1.0.0` |

Each outcome has a milestone, four stakeholder issues, ordered commits, a reviewed pull request, CI evidence, and [sprint notes](docs/sprints).

## Run

The repository pins .NET 10 in `global.json`.

```powershell
dotnet restore MeterForge.slnx --locked-mode
dotnet run --project src/MeterForge.Api --launch-profile http
dotnet test MeterForge.slnx --configuration Release
```

OpenAPI is available at `/openapi/v1.json` in Development. Check `/health/live` and `/health/ready`; readiness explicitly reports that the default runtime uses non-durable in-memory adapters. `docker compose up postgres` starts the local database used by the PostgreSQL adapter exercise.

Start with the [learner guide](LEARNER-GUIDE.md), [testing guide](TESTREADME.md), [over-engineering review](OEReadMe.md), and [production-readiness assessment](docs/quality/PRODUCTION-READINESS.md). Documentation links can be checked without .NET: `python tools/check_docs.py`.

## Limits

MeterForge stores no card or bank data and has no production authentication, tax logic, provider credentials, telemetry backend, migration runner, or operated restore process. `v1.0.0` means the curriculum is complete—not that the software should handle real money.
