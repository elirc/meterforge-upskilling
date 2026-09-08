# Lab 05: deliver an event when the network cannot tell you what happened

**Objective:** make local invoice/event atomicity and external delivery uncertainty explicit. Suggested time: four sessions; prerequisite: Lab 04.

## Starting points and current behavior

Read [outbox and delivery models](../../src/MeterForge.Domain/Integrations/IntegrationModels.cs), [outbox schema](../../src/MeterForge.Infrastructure/Persistence/Migrations/002_outbox.sql), [webhook retry-preview](../../src/MeterForge.Api/Integrations/IntegrationEndpoints.cs), and [IntegrationModelTests](../../tests/MeterForge.Domain.Tests/Integrations/IntegrationModelTests.cs).

An outbox table and domain records exist. The invoice adapter does not insert outbox rows. The preview route creates a delivery, marks it failed, retries it, and returns an in-memory response; it does not send a webhook. There is no registered delivery worker in [Program](../../src/MeterForge.Api/Program.cs).

Also inspect [PaymentService](../../src/MeterForge.Application/Payments/PaymentService.cs), [PaymentAttempt](../../src/MeterForge.Domain/Payments/PaymentAttempt.cs), [simulated provider](../../src/MeterForge.Infrastructure/Payments/SimulatedPaymentProvider.cs), and [payment tests](../../tests/MeterForge.Domain.Tests/Payments/PaymentAttemptTests.cs). Retry preserves the provider idempotency key, but payment attempts are not durably stored by this service. The simulator returns success; it does not model provider deduplication or timeout-after-commit.

**Proposed extension:** save one stable `invoice.finalized` event with the invoice in the same database transaction, then deliver it to a local fake receiver using bounded retries and recoverable work claims. Model payment ambiguity separately with a fake provider. This exercise does not authorize contacting arbitrary webhook URLs or real payment providers.

## Work sequence

1. Define the event envelope: stable ID, tenant, schema version, subject, UTC occurrence time, and minimal payload. Explain how replay finds the original event rather than generating another event ID.
2. Extend the Lab 04 transaction so invoice and event are committed together. The existing store method owns its own transaction; calling a second independent store afterward cannot supply atomicity. Choose a cohesive application port and adapter transaction boundary.
3. Implement a worker with a bounded batch, cancellation, retry scheduling, and a recoverable claim or lease. Avoid holding a database transaction open throughout network I/O. Explain how two workers avoid claiming the same pending attempt normally, and why crash recovery can still cause redelivery.
4. Build a local receiver that records event IDs atomically and returns the same outcome for a duplicate. Deliver synthetic events only. Use a fake clock for retry and lease tests.
5. Simulate receiver success followed by a lost response before local acknowledgment. Restart the worker and verify the duplicate delivery is harmless at the receiver.
6. Build a fake payment provider that records a charge and then throws a timeout. Reconcile by stable logical identity before retrying; do not generate a fresh key merely because a response is missing. If adding an `Unknown` payment state, document its allowed transitions and durable evidence.

## Failure matrix and required evidence

| Failure point | Required observation |
| --- | --- |
| Before local commit | Neither invoice nor event is visible |
| After commit, before dispatch | Invoice and pending event survive worker restart |
| After receiver commits, before sender records success | Redelivery is possible; receiver applies one logical effect |
| Worker dies while holding a claim | Claim becomes recoverable under the documented lease policy |
| Repeated permanent receiver failure | Attempts are bounded; a reviewable terminal state and manual replay path exist |
| Provider commits, response times out | Internal uncertainty is preserved and reconciled using stable identity |

## Acceptance criteria and meaningful tests

- A database rollback test proves invoice/event atomicity; invoice replay cannot create a second logical event.
- A two-worker test verifies normal claim exclusion, and a crash test verifies eventual recovery after lease expiry.
- The lost-response test observes multiple sends but one receiver effect. Do not describe delivery as exactly once.
- Retry tests use a deterministic clock and verify schedule boundaries, cancellation, and the terminal state.
- A fake-provider regression proves timeout does not automatically mean no charge occurred.

## Hints and review questions

Does `published_at` mean a send was attempted, a receiver acknowledged, or processing completed? Can an event carry enough identity without copying unnecessary billing details? What happens when the receiver's deduplication retention ends? How does the worker shut down between acknowledgment and persistence? Which guarantees belong to your service, the fake receiver, or an external contract you have not tested?

**Submit:** worker and fixtures, failure-matrix results, a [design review](../templates/design-review.md), and a list of remaining delivery, security, and provider assumptions.
