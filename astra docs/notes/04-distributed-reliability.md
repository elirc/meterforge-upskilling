# Distributed reliability: treat unknown outcomes as real states

## Read

Inspect [PaymentService](../../src/MeterForge.Application/Payments/PaymentService.cs), [PaymentAttempt](../../src/MeterForge.Domain/Payments/PaymentAttempt.cs), [SimulatedPaymentProvider](../../src/MeterForge.Infrastructure/Payments/SimulatedPaymentProvider.cs), [integration models](../../src/MeterForge.Domain/Integrations/IntegrationModels.cs), and the [outbox migration](../../src/MeterForge.Infrastructure/Persistence/Migrations/002_outbox.sql). Compare them with the fictional [incident drill](../../docs/operations/INCIDENT-DRILL.md).

## Explain

A remote operation can succeed even when the caller receives no result. A timeout describes what the caller observed, not what the provider committed. Model this explicitly before adding automatic retries.

| Failure point | What might have happened remotely? | Required reasoning |
| --- | --- | --- |
| Before request leaves | Nothing | Was durable intent recorded? Can the same operation be retried? |
| Request sent, response missing | Nothing or success | Preserve identity; query/replay using provider-supported semantics |
| Success received, local save fails | Success | Recover the provider reference and reconcile local state |
| Local acknowledgment saved, response to client lost | Success | Return a canonical result for a client replay |

The current payment model preserves `ProviderIdempotencyKey` while retrying and increments `AttemptNumber`. That is a useful local invariant. The simulator always reports success and does not prove deduplication, remote persistence, timeout handling, or safe recovery after restart. `PaymentService` also does not persist attempts. A stable string becomes a reliability guarantee only when the surrounding storage and provider contracts enforce the intended meaning.

Choose idempotency identity at the business-operation level. A retry of one collection should keep its identity; a newly authorized collection is a separate operation. Define the key's scope, payload-conflict behavior, and retention expectations. Do not assume two tenants may safely reuse one provider key unless the provider's namespace or your adapter construction makes that true. For a real integration, verify those details in that provider's current documentation.

An outbox addresses the gap between committing local state and publishing an event. Write the state change and outbox record in the same transaction, then let a worker publish committed records. The table in this repository is a building block; it is not wired into invoice finalization and does not run a worker.

A worker can crash after publishing but before marking a record published. Therefore consumers must tolerate duplicate delivery. “We use an outbox” does not mean every downstream effect happens exactly once. Plan consumer deduplication and ensure its receipt record and business mutation share an appropriate transaction when possible.

Retries need a policy: retryable versus permanent failures, a bounded attempt schedule, delayed work, visibility into exhausted attempts, and an owner for repair. Adding delay without bounding concurrency can still overwhelm a provider. Keep recovery observable and avoid silent infinite loops.

## Practice

1. Build a fake provider that records a charge under a stable key and then throws a timeout. Retry the same logical operation and assert one provider-side effect plus a recoverable canonical result.
2. Write a payment state diagram that includes an unknown outcome. Explain how it differs from the current pending/succeeded/failed model and whether unknown must be stored explicitly or represented by recoverable pending intent.
3. Design an outbox transaction and worker as separate slices. Enumerate crashes before commit, after commit, before send, after send, and before acknowledgment. Add a test for the most dangerous window first.
4. Run a duplicate-delivery consumer exercise. Verify that two deliveries do not apply a credit twice; assert the persisted result, not just the number of handler invocations.

These are extension exercises. Do not connect a real payment provider to complete them; a controllable fake gives better failure evidence for this learning task.

## Evidence of ownership

Deliver a failure matrix, identity policy, fault-injection test, and recovery note. Include which records an operator uses to decide whether a retry is safe. Explain what would need verification before replacing a fake with a real provider.

Teach back: “What happens if the process dies after the provider succeeds?” A complete answer includes durable evidence and recovery, not just a catch block.
