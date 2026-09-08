# Lab 07: own a durable finalization slice through review and recovery

**Objective:** make and defend a bounded engineering decision under conflicting product, reliability, and delivery constraints. Suggested time: five to eight sessions; prerequisites: Labs 01–06.

## Starting points and current behavior

Revisit [Program](../../src/MeterForge.Api/Program.cs), [invoice preview](../../src/MeterForge.Api/Invoicing/InvoiceEndpoints.cs), [snapshot adapter](../../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs), [outbox schema](../../src/MeterForge.Infrastructure/Persistence/Migrations/002_outbox.sql), and [production-readiness assessment](../../docs/quality/PRODUCTION-READINESS.md). Use [InvoiceTests](../../tests/MeterForge.Domain.Tests/Invoicing/InvoiceTests.cs), [InvoiceSnapshotTests](../../tests/MeterForge.Application.Tests/Persistence/InvoiceSnapshotTests.cs), and the [architecture tests](../../tests/MeterForge.Architecture.Tests/DependencyDirectionTests.cs) as existing entry points.

The baseline app has in-memory default repositories, an invoice preview endpoint, a standalone SQL snapshot adapter, and integration models. It does not supply an end-to-end durable finalization workflow or a running outbox publisher. Your Lab 04–05 branch may now have those pieces; audit the actual branch before claiming what is complete.

**Scenario:** a fictional product team needs durable invoice finalization and one local consumer event. Operators need to recover from API or worker restarts. Support needs an auditable explanation of replay conflicts. You have time for a modular-monolith slice, not a replacement platform. All data and receivers remain synthetic.

## Scope and work sequence

1. Write a one-page [design review](../templates/design-review.md): caller, business outcome, invariant, assumptions, alternatives, chosen scope, non-goals, risks, and evidence plan. Explain why this should remain one deployable application or why a different choice is justified.
2. Define request identity and behavior for initial finalization, identical replay, conflicting replay, missing tenant-scoped invoice, and uncertain completion. Specify the HTTP response contract and the commit point. Decide whether the server derives invoice lines or trusts validated teaching inputs; do not quietly claim authoritative rating if callers supply amounts.
3. Reuse or finish the Lab 04 transaction and Lab 05 event delivery. Include a tenant-scoped read path so support can inspect canonical evidence. Keep finalization evidence immutable after commit.
4. Design the migration and rollout sequence. Explain compatibility while old and new code overlap, how durable mode is selected, what readiness proves, and how intake is disabled during a rollback. Rolling back code must not erase finalized records or pending events.
5. Run a failure campaign: two conflicting concurrent finalizations, database unavailability before commit, response loss after commit, worker crash after receiver success, and application restart. Record observed outcomes instead of marking a diagram as proof.
6. Ask a reviewer to challenge the assumptions and choose one objection to resolve with an experiment. Record remaining objections with an owner or explicit deferral.
7. Present a five-minute handoff: what changed for a caller, where truth is stored, how to diagnose replay ambiguity, how to stop safely, and what remains outside the demonstrated guarantees.

## Required acceptance evidence

| Responsibility | Passing evidence |
| --- | --- |
| Business correctness | Finalized amounts and provenance remain unchanged across reads and replays |
| Concurrency | One canonical snapshot survives conflicting concurrent requests |
| Transaction boundary | Invoice and outbox commit together or neither becomes visible |
| External delivery | Lost acknowledgment may cause redelivery; fake receiver applies one logical effect |
| Tenant scope | Same IDs under different tenants do not disclose or mutate each other's evidence |
| Recovery | Restart and replay retrieve the original result, with pending delivery recoverable |
| Compatibility | Existing preview and unrelated contracts behave as documented, or changes are explicitly versioned |
| Operability | A peer follows the run instructions and explains a conflict using stored identity and trace evidence |

## Tests and review gates

Use domain tests for immutable state and arithmetic, real PostgreSQL integration tests for transaction/replay behavior, API tests for routing/status/wiring, and deterministic fake-receiver tests for crash windows. Run the existing architecture tests and the complete solution suite after integration. Record database setup and results separately so a green fast suite cannot conceal an unrun integration suite.

Review using this rubric: **0** = asserted without evidence; **1** = happy path demonstrated; **2** = adverse scenario demonstrated with limits explained. Score correctness, concurrency, durability, delivery, operability, and communication independently. Target 2 in each before calling the learning slice complete; a total score cannot hide a missing correctness gate.

## Hints and review questions

Where could two individually reasonable components disagree on identity? Can an old binary read the new schema? What does support do if an invoice exists but delivery is pending? Which work can be safely deferred without weakening the promised slice? What evidence would be required before expanding beyond synthetic use? Authentication, real-provider behavior, backup restoration, and production security remain separate work unless specifically implemented and tested.

**Submit:** implementation, [ADR](../templates/adr.md), reviewer response, [evidence packet](../templates/evidence-and-review.md), and a short operational handoff. The capstone demonstrates engineering judgment within a stated boundary; it is not production certification.
