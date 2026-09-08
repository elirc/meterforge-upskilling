# Lab 04: prove what an invoice transaction actually guarantees

**Objective:** persist finalized evidence with an explicit replay policy, then verify rollback and restart behavior against PostgreSQL. Suggested time: four sessions; prerequisites: Labs 02–03 and local Docker.

## Starting points and current behavior

Read [Invoice and its rules](../../src/MeterForge.Domain/Invoicing/Invoice.cs), [snapshot and store port](../../src/MeterForge.Application/Persistence/InvoiceSnapshot.cs), [PostgresInvoiceSnapshotStore](../../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs), and [invoice schema](../../src/MeterForge.Infrastructure/Persistence/Migrations/001_invoices.sql). Existing [InvoiceSnapshotTests](../../tests/MeterForge.Application.Tests/Persistence/InvoiceSnapshotTests.cs) exercise conversion; they do not execute PostgreSQL.

The adapter opens a transaction, inserts the header and lines, and commits. Both insert statements use `ON CONFLICT ... DO NOTHING`. Replaying a header with changed content can silently keep the old header; replaying it with new line IDs can append lines. Transactional insertion does not itself establish immutable replay semantics. The [finalize-preview endpoint](../../src/MeterForge.Api/Invoicing/InvoiceEndpoints.cs) returns a computed response without saving. [Program](../../src/MeterForge.Api/Program.cs) does not register this store.

**Proposed extension:** identical snapshots replay successfully; any changed snapshot for an existing tenant/invoice identity conflicts without altering stored evidence. Add an application use case that saves before reporting durable success. Keep preview behavior clearly separate from durable behavior.

## Work sequence

1. Start the lab database with `docker compose up -d postgres`. Inspect [compose configuration](../../docker-compose.yml). It does not define a named data volume; do not treat container replacement as a restore strategy. Use a dedicated test database and the checked-in SQL, never a shared database.
2. Create a database integration test fixture with explicit schema setup and isolation. State whether it requires an externally started database or provisions a disposable one. Mark missing prerequisites clearly instead of silently replacing PostgreSQL with a mock.
3. Save a fixed invoice snapshot and query header plus lines through a new connection. Check amounts, currency, source references, price-version IDs, dates, and tenant scope.
4. Capture the current conflicting-replay counterexample. Design a comparison that includes all immutable fields and the complete line set. Decide whether line order is meaningful; if not, compare in a stable order. A hash is useful only with a documented canonical representation.
5. Enforce the identity decision atomically, including concurrent submissions. A separate existence check outside the transaction leaves a race. Translate only the database conflicts you understand into stable application results.
6. Add a durable use case and explicit runtime configuration if exposing HTTP. A successful durable response must follow commit. A restart must allow reading the same saved evidence; this requires a read path as part of the extension.
7. Inject a line failure after the header insert and verify no header or lines survive. Consider a lost response after commit separately: replay must recover the committed result.

## Acceptance criteria and meaningful tests

- First save persists the exact snapshot; identical save leaves the same row counts and values.
- Changes to header data, an existing line, removed lines, or additional lines reject without partial changes.
- Two concurrent saves of conflicting content yield one canonical snapshot and one documented conflict.
- A foreign-key or deliberately injected write failure rolls back the complete unit of work.
- The same invoice ID in another tenant remains independent; the read path cannot cross tenant scope.
- An application restart retrieves unchanged persisted evidence. Database loss and backup restoration remain separate, unproven scenarios.

Run the new PostgreSQL integration suite with the actual database dependency, plus snapshot and affected API tests. Include exact setup and run commands in your submission because this repository does not yet provide that new suite.

## Hints and review questions

An in-memory fake cannot establish SQL rollback, constraints, numeric storage, or isolation behavior. Can a direct caller construct an invalid `InvoiceSnapshot` without using `From`? Which layer defends that boundary? What can cancellation after commit tell the caller? If readiness says durable mode is active, which configured dependency did it check?

**Submit:** [ADR](../templates/adr.md), schema/adapter/use-case changes, database evidence, and a restart transcript with the same invoice identity. Label backup/restore and whole-system durability as unimplemented unless separately demonstrated.
