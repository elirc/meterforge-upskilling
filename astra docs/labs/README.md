# Practice labs: turn explanations into evidence

These labs extend the checked-in teaching application. They are assignments, not a claim that the extensions already exist. Work on a branch and record the starting commit: another learner's branch may behave differently. Use only synthetic tenants and provider fixtures.

| Lab | Main responsibility | Suggested sessions | Prerequisite | Evidence to submit |
| --- | --- | --- | --- | --- |
| [01: Product vertical slice](01-vertical-slice.md) | Trace and change a feature across layers | 2 x 60–90 min | Run the API and tests | Request trace, patch, boundary tests |
| [02: Rating invariants](02-rating-invariants.md) | Define policy before implementing arithmetic | 2 x 60–90 min | Lab 01 | Worked examples, validation policy, regression |
| [03: Idempotency and concurrency](03-idempotency-and-concurrency.md) | Make simultaneous operations correct | 3 x 60–90 min | Lab 01 | Forced race, atomic port, conflict contract |
| [04: Durable invoice persistence](04-durable-invoice-persistence.md) | Own a transaction and its recovery behavior | 4 x 60–90 min | Labs 02–03; local Docker | Database integration tests, replay decision, restart proof |
| [05: Outbox and provider ambiguity](05-outbox-and-provider-ambiguity.md) | Handle failure across process boundaries | 4 x 60–90 min | Lab 04 | Crash matrix, delivery worker, fake-provider evidence |
| [06: Performance and incident](06-performance-and-incident.md) | Diagnose a measurable operational problem | 3 x 60–90 min | Lab 03; labs 04–05 for durable variant | Baseline, controlled experiment, incident record |
| [07: Senior capstone](07-senior-capstone.md) | Make a bounded design and release decision | 5–8 x 60–90 min | Labs 01–06 | Design, implementation, failure proof, review |

Session estimates are planning aids. Stop at a coherent checkpoint rather than dropping a regression because the timebox expired. Lab 02 and Lab 03 can be taken in either order; the durability and delivery labs build on each other.

## Before the first lab

Read the [learner guide](../../LEARNER-GUIDE.md), [test guide](../../TESTREADME.md), and [production-readiness assessment](../../docs/quality/PRODUCTION-READINESS.md). From the repository root:

```powershell
git status --short
git rev-parse HEAD
dotnet --version
dotnet restore MeterForge.slnx --locked-mode
dotnet test MeterForge.slnx --configuration Release
dotnet run --project src/MeterForge.Api
```

Record the actual listening URL printed by the API; do not assume a port. Use a second terminal for requests. SDK requirements are in [global.json](../../global.json). Docker is needed only for the database exercises. Baseline tests demonstrate the behavior they assert; they do not certify durability, authorization, throughput, or external-provider correctness.

## The working rhythm

1. Read the linked implementation and tests. Write down the current behavior in your own words.
2. Select a concrete counterexample or new business requirement. Predict the result before running it.
3. Capture the baseline, including a failing regression when repairing a defect.
4. Implement the smallest cohesive change at the boundary that owns the rule.
5. Verify the targeted risk, then run the affected project and the solution checks appropriate to the change.
6. Explain the remaining limitations and have someone review the evidence.

Keep [learning notes](../templates/learning-note.md), a [decision record](../templates/adr.md) when a consequential choice is made, and an [evidence packet](../templates/evidence-and-review.md). The templates are prompts to copy and fill, not mandatory ceremony for every tiny change.

## Readiness gates

- **Junior foundation:** explain the request path, own a small change, and write a test that catches a real mistake.
- **Mid-level ownership:** define the contract, handle collisions and failures, and prove the behavior at the actual storage or HTTP boundary.
- **Senior practice:** expose assumptions, choose a sensible scope, reconcile conflicting constraints, and justify rollout and recovery using evidence.

Completing a checklist is not a promotion guarantee. The strongest submission lets a reviewer reproduce both the failure and its correction without relying on the author's confidence.
