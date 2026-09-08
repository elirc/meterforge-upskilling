# Lab 06: investigate latency and contain an ambiguous payment

**Objective:** produce a reproducible performance finding and an evidence-based incident decision. Suggested time: three sessions; prerequisite: Lab 03. Use the durable variant only after Labs 04–05.

## Starting points and current behavior

Read [in-memory subscription repository](../../src/MeterForge.Infrastructure/Subscriptions/InMemorySubscriptionRepository.cs), [amendment service](../../src/MeterForge.Application/Subscriptions/SubscriptionService.cs), [Program](../../src/MeterForge.Api/Program.cs), [runbook](../../docs/operations/RUNBOOK.md), and [incident drill](../../docs/operations/INCIDENT-DRILL.md). Start correctness checks with [SubscriptionAmendmentTests](../../tests/MeterForge.Application.Tests/Subscriptions/SubscriptionAmendmentTests.cs) and [PaymentAttemptTests](../../tests/MeterForge.Domain.Tests/Payments/PaymentAttemptTests.cs).

The repository uses one mutation lock across all subscriptions. It may limit concurrent throughput, but its existence alone is not a measured bottleneck. The API emits `X-Trace-Id`; it does not configure a telemetry backend. Readiness returns 200 with `durableDefault: false`. The runbook's latency and recovery numbers are candidate objectives, not benchmark results or operated guarantees. The historical incident note is a fictional scenario; the current payment domain already preserves the retry key.

**Proposed extension:** run a controlled subscription-amendment workload, find a measured limiting factor, and improve it only if the evidence justifies a change. Separately rehearse timeout-after-provider-commit with synthetic data.

## Work sequence: performance

1. Record commit, build configuration, machine, workload driver, duration, warmup, concurrency, tenant count, entity count, and payload sizes. Use Release and hold the environment steady between comparisons.
2. Compare a single hot subscription with many independent subscriptions. Specify expected-version handling so conflicts are classified separately from successful amendments. An expected conflict is not a successful mutation in your throughput figure.
3. Measure request count, success/conflict/unexpected-error counts, latency p50/p95/p99, and achieved throughput. State how samples are collected; a closed-loop client measures response latency at its offered load and can conceal waiting during overload.
4. Form one hypothesis, such as lock contention, serialization cost, or a client bottleneck. Gather evidence capable of disproving it. If the global lock is not significant, report that finding rather than replacing it anyway.
5. If optimizing locking, preserve atomic expected-version checks, consider per-entity lock lifecycle and memory growth, and test independent-entity progress as well as competing writers. For the database variant, inspect query plans and transaction contention rather than applying a process-local lock as a multi-instance fix.
6. Repeat the comparable workload and explain noise, regressions, and the practical limits of the result. Do not turn a laptop result into an availability SLO claim.

## Work sequence: incident

1. Use Lab 05's fake provider, or build a small deterministic fixture that commits one synthetic charge and loses its response. Preserve invoice ID, logical payment identity, provider reference, request identity, and UTC timestamps.
2. Write an impact statement that distinguishes known duplicate charges, possible duplicates, and merely retried requests. A timeout by itself proves none of those financial outcomes.
3. Rehearse pausing only the affected synthetic collection workflow. If no runtime switch exists, write the exact proposed control and demonstrate it in the fixture; do not claim an existing operational feature.
4. Reconcile internal records with the fake provider's ledger. Define criteria for safe replay and for resuming traffic. Use linked compensating evidence if simulating a duplicate reversal; preserve finalized history.

## Acceptance criteria and meaningful tests

- Another learner can run the workload using the recorded commands and understand which requests count as successful work.
- Before/after results use comparable conditions and retain the Lab 03 concurrency invariant.
- Tests include two writers on one version and independent subscriptions; a performance assertion based on a fragile millisecond threshold is unnecessary.
- The incident timeline separates observation from inference, preserves stable identities, and records a concrete resume decision.
- Any mitigation has an owner, verification step, and reversal or expiry condition.

## Hints and review questions

Would doubling load expose the same bottleneck? Did the load generator saturate first? Does a passing health endpoint say anything about queue backlog? Which tenant and identity belong in an incident record, and which high-cardinality labels should not be added indiscriminately to metrics? What can you confidently conclude without a durable ledger?

**Submit:** one [evidence packet](../templates/evidence-and-review.md), a benchmark table with limitations, and an [incident postmortem](../templates/incident-postmortem.md). A well-supported decision not to optimize is an acceptable performance result.
