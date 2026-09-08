# Lab 03: force the race, then move correctness into the port

**Objective:** distinguish a thread-safe collection from an atomic business operation. Suggested time: three sessions; prerequisite: Lab 01.

## Starting points and current behavior

Read [UsageIngestionService](../../src/MeterForge.Application/Usage/UsageIngestionService.cs), [InMemoryUsageEventStore](../../src/MeterForge.Infrastructure/Usage/InMemoryUsageEventStore.cs), [UsageEvent](../../src/MeterForge.Domain/Usage/UsageEvent.cs), and [usage endpoint](../../src/MeterForge.Api/Usage/UsageEndpoints.cs). Start with [UsageIngestionTests](../../tests/MeterForge.Application.Tests/Usage/UsageIngestionTests.cs).

Usage ingestion looks up `(tenantId, externalEventId)` and then adds a newly generated event. The adapter ignores `TryAdd`'s return value. Two calls can both observe absence, construct different IDs, and return `IsReplay = false`, even though only one event is stored. Sequential replay returns the existing event without comparing the incoming payload. A `ConcurrentDictionary` protects its operations; it does not make the service's entire read-then-write sequence atomic.

For comparison, [subscription mutation](../../src/MeterForge.Infrastructure/Subscriptions/InMemorySubscriptionRepository.cs) checks a version and mutates under one repository-wide lock. [SubscriptionAmendmentTests](../../tests/MeterForge.Application.Tests/Subscriptions/SubscriptionAmendmentTests.cs) already contain a concurrent-writer test. That lock coordinates one process, not multiple API instances.

**Proposed extension:** one atomic usage-store operation returns the canonical stored event and whether this call inserted it. Same-key identical payloads replay; same-key differing payloads conflict. Define comparison across subscription ID, meter, quantity, and occurrence instant after intentional normalization.

## Work sequence

1. Build a test adapter with a gate that lets two reads both finish observing absence before either add proceeds. Include a bounded timeout so a broken test cannot hang forever. Do not use sleep to hope for a race.
2. Show that two successful results can expose different event IDs. Read the adapter afterward to identify the actual winner.
3. Replace the split correctness contract with an insert-or-read result. Ensure losing callers receive the stored winner, not their discarded candidate. If using a dictionary factory, remember factories can run more than once; keep side effects outside them.
4. Specify the payload comparison policy and stable conflict code. Inspect domain normalization before choosing what equality means. Never use a new server-generated event ID as the payload fingerprint.
5. Add an API test for one 201 followed by a 200 replay. Choose and document the conflict HTTP mapping: the current global business exception handler maps all business codes to 422, so a new 409 requires an intentional implementation change.
6. Extend the subscription concurrency assertion to check the persisted final product and version after both writers complete. Avoid assuming the returned mutable object is a historical snapshot.

## Acceptance criteria and meaningful tests

- Two forced concurrent identical requests return one identity, with one inserted result and one replay.
- A differing payload under the same tenant/key returns the documented conflict and preserves the original event.
- The same external key in different tenants remains independent.
- A canceled request does not report a successful insert if cancellation prevents the operation; document the cancellation boundary.
- Concurrent subscription writers on one expected version commit exactly one amendment and advance the version once.

Run focused usage and amendment test classes, then the application and affected API tests. A loop of `Task.WhenAll` alone is not the regression: already-completed tasks can run sequentially. Preserve the forced interleaving in the test fixture.

## Hints and review questions

Where is the operation's single decision point? How would a unique database constraint replace the local dictionary decision? What happens to replay records after restart or retention expiry? Does a correct idempotency key establish tenant authorization? If an HTTP response is lost after a successful insert, what should the next caller observe?

**Submit:** a two-caller timeline, deterministic regression, revised port contract, and an [evidence packet](../templates/evidence-and-review.md) that states the remaining single-process and non-durable limits.
