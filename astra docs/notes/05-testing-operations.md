# Testing and operations: connect claims to evidence

## Read

Start with the [testing guide](../../TESTREADME.md), [usage tests](../../tests/MeterForge.Application.Tests/Usage/UsageIngestionTests.cs), [architecture test](../../tests/MeterForge.Architecture.Tests/DependencyDirectionTests.cs), [API composition](../../src/MeterForge.Api/Program.cs), [runbook](../../docs/operations/RUNBOOK.md), and [release checklist](../../docs/operations/RELEASE-CHECKLIST.md).

## Explain

A useful test protects a failure you can name. Choose the lowest layer that owns the guarantee, then add a higher layer only for a distinct risk.

| Risk | Best initial evidence | What that evidence does not prove |
| --- | --- | --- |
| Illegal subscription transition | Domain test with explicit starting state | HTTP mapping or concurrent writers |
| Wrong tenant lookup | Repository/application negative test | Authenticated tenant authorization |
| Broken JSON or header behavior | API integration test | Durable storage after restart |
| Header committed without invoice lines | Real-database rollback test | Backup/restore and deployment behavior |
| Duplicate charge after missing response | Fault-injecting provider test | A real provider's undocumented behavior |
| Domain depends on web framework | Assembly reference test | Every architectural convention in the solution |

Make concurrency tests control the critical interleaving. A test with two tasks is not necessarily concurrent: methods may complete synchronously, or scheduling may accidentally avoid the race. Use an explicit rendezvous at the unsafe read/commit boundary, time-bound waits to fail helpfully, and assertions on both final state and caller-visible results.

Test data should expose the rule. For tiered rating, calculate a small example by hand rather than copying the algorithm into the expected result. For time, use a fixed timestamp with an intentional offset. For tenant isolation, attempt the same resource ID under a different tenant. A successful same-tenant request cannot prove isolation.

Operational signals answer different questions. Liveness asks whether the process can respond. Readiness asks whether it can serve the intended workload. The current readiness response explicitly reports the in-memory default; it is not a database connectivity test. `X-Trace-Id` provides a request correlation value; it does not itself configure a distributed tracing backend or useful logs.

A proposed service objective needs a population, a success definition, a time window, and an owner. For a local exercise you might measure the fraction of valid usage-ingestion requests that receive a canonical result within a chosen duration. That is a hypothesis to test, not a claim about current performance. Avoid a dashboard full of metrics that no one uses to make a decision.

## Practice

1. Pick three guarantees in your current change. For each, name the counterexample, test layer, assertion, and blind spot. Remove duplicate tests that protect no distinct risk.
2. Add one deterministic failure-path test. Confirm that it fails for the intended reason against the old implementation, then passes with the fix.
3. Design structured fields for a usage replay or payment timeout: trace ID, safe tenant identifier, logical operation ID, outcome, duration, and attempt number where appropriate. Avoid recording secrets or full request payloads by default.
4. Write a local incident drill with trigger, initial signal, containment, evidence collection, recovery, and verification. Run it against fictional data and record actual observations. “Restart the service” is incomplete if the default store loses the records needed for recovery.

Useful repository-root commands:

```powershell
dotnet test tests/MeterForge.Domain.Tests --filter FullyQualifiedName~Subscription
dotnet test tests/MeterForge.Application.Tests --filter FullyQualifiedName~UsageIngestion
dotnet test MeterForge.slnx --configuration Release
```

Follow the repository's restore/setup instructions first. Record environment failures separately from behavioral failures and do not describe unexecuted tests as passing.

## Evidence of ownership

Deliver the risk-to-test table, actual command outcomes, and a short drill timeline. State whether the run used in-memory or durable storage. Include one limitation that affects how confidently a teammate should interpret the result.

Teach back: “What could still be broken even though this test passes?” Strong engineers use that question to improve evidence, not to demand exhaustive tests for every small change.
