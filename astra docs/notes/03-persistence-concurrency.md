# Persistence and concurrency: find the atomic operation

## Read

Compare the [usage service](../../src/MeterForge.Application/Usage/UsageIngestionService.cs) with its [in-memory store](../../src/MeterForge.Infrastructure/Usage/InMemoryUsageEventStore.cs). Then inspect the [subscription repository](../../src/MeterForge.Infrastructure/Subscriptions/InMemorySubscriptionRepository.cs), [invoice snapshot store](../../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs), and [invoice schema](../../src/MeterForge.Infrastructure/Persistence/Migrations/001_invoices.sql).

## Explain

Thread-safe collections protect their individual operations. They do not automatically make a read-decide-write sequence atomic. To audit usage replay, identify whether lookup and insert form one indivisible store operation and whether a losing caller receives the stored event or its own newly generated event. The current `FindByExternalIdAsync` followed by `AddAsync` design allows this interleaving:

| Step | Caller A | Caller B |
| --- | --- | --- |
| 1 | Finds no event | |
| 2 | | Finds no event |
| 3 | Creates event A and inserts | |
| 4 | | Creates event B; duplicate insert loses |
| 5 | Returns event A as new | Returns event B as new if insertion result is ignored |

One stored row is insufficient if callers observe different identities. The desired guarantee must include both storage and returned results. An atomic get-or-add port is a proposed exercise to close this race; it is not present in the current implementation. Payload-conflict handling and durability remain separate questions.

Optimistic concurrency means “apply this change only if the stored version is still the version I read.” The in-memory subscription repository performs the version check and mutation inside a lock. Inspect the scope of that lock: a single process-wide gate serializes unrelated mutations, and a process lock cannot coordinate separate API instances. Also inspect references returned from `GetAsync`; mutable domain objects can escape a repository's intended mutation path.

For a database extension, express the guarantee with an atomic conditional update, for example `UPDATE ... SET version = version + 1 ... WHERE tenant_id = ... AND id = ... AND version = ...`. Affected-row count tells you whether that condition matched, but zero rows needs an explicit API policy for not-found versus stale-version. Use a transaction when related writes must agree.

Transactions provide all-or-nothing behavior for the writes they contain. The snapshot store wraps invoice header and line inserts in one transaction. Its conflict clauses suppress duplicate-key inserts; they do not compare existing data with the requested snapshot. Replaying the same invoice identity with new line IDs can therefore add lines, and replaying changed fields under existing IDs can hide a conflict. An immutable domain invoice is not enough to enforce immutable persisted evidence.

The schema's composite foreign key keeps each line attached to a header in the same tenant. Other rules, such as matching line and invoice currencies or accepting only identical snapshot replays, need a deliberate enforcement strategy. Avoid assuming every domain invariant is independently enforced by SQL.

## Practice

1. Write the usage-store contract in plain language: canonical identity, new/replay indication, tenant scope, normalized key policy, and changed-payload behavior. Design a single atomic operation if the current port separates lookup and insert.
2. Reproduce a race deterministically with a controlled store/barrier so both reads finish before either insert. Merely calling `Task.WhenAll` against synchronously completed in-memory tasks may execute sequentially and miss the race.
3. Propose a database usage table with uniqueness on the intended tenant/event identity. Demonstrate two connections competing for the same key and assert both returned identity and final stored state.
4. Write a snapshot replay policy and test identical replay, divergent replay, line failure rollback, and tenant isolation against PostgreSQL. Object-to-snapshot unit tests do not execute SQL.

## Evidence of ownership

Provide a timeline, an atomicity claim, a test that exercises the real boundary, and a note on crash/restart behavior. If the database is unavailable, record that the durability claim remains unverified rather than substituting an in-memory test.

Teach back: “Which exact operation must be atomic, and across how many processes?” Answer that before choosing locks, transactions, queues, or additional infrastructure.
