# Bridge 03: choose guarantees you can explain and operate

**Outcome:** choose between a synchronous durable operation and an outbox using requirements and failure evidence. Allow three sessions after the [SQL bridge](01-data-and-sql.md) and an independently delivered slice. Implementation of the advanced design belongs in later labs; this bridge first makes the reasoning concrete.

## Prerequisite self-check

Explain commit, rollback, and a complete tenant-scoped key without notes. State what happens if a client loses the response after a database commit. If your answer is “the database rolls back,” revisit the [persistence note](../notes/03-persistence-concurrency.md): losing a response does not establish the stored outcome. Before claiming you can implement durable behavior, complete the real-database evidence in [Lab 04](../labs/04-durable-invoice-persistence.md).

## Establish the baseline from source

The [invoice adapter](../../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs) inserts a header and lines in a transaction, with conflict clauses that do not establish immutable replay. The [finalize-preview endpoint](../../src/MeterForge.Api/Invoicing/InvoiceEndpoints.cs) computes a response without saving. [Program](../../src/MeterForge.Api/Program.cs) does not register the invoice store or an outbox worker. An [outbox table](../../src/MeterForge.Infrastructure/Persistence/Migrations/002_outbox.sql) is a building block, not evidence that events are being delivered.

Treat both designs below as proposed exercises. Do not attribute their guarantees to the running application.

## Concepts: separate local facts from remote uncertainty

**Durable** means an acknowledged result survives the failures you have specified and tested. Application restart, database restart, and loss of the database disk are different tests. **Synchronous** means the caller waits for completion of the operation. That need not include unrelated remote work.

An **outbox** is a database record saying remote work remains to be done. Save that record in the same transaction as the business change. A worker reads committed records and attempts delivery later. This prevents a local commit from losing its notification intent, but remote delivery can still happen more than once.

**Idempotency** means repeating the same logical operation has the agreed repeated-call behavior. It requires stable identity and a content policy. A random new key on every retry describes new operations and defeats deduplication.

## Worked decision: save a finalized invoice

Assume a requirement: “Confirm an invoice is saved; another internal tool will read it later.” A synchronous database operation is a reasonable initial choice. Validate the snapshot, atomically enforce its replay policy and save it, commit, then report success. Provide a read/replay path so the caller can recover from a missing response. No requirement here demands a delivery worker.

Now add: “A separate receiver must eventually be notified, including when it is unavailable during invoice creation.” Compare the designs before adding machinery:

| Concern | Synchronous database save | Invoice plus outbox, then worker |
| --- | --- | --- |
| Response meaning | Invoice commit completed | Invoice and notification intent committed |
| Receiver unavailable | Outside this operation's guarantee | Work stays pending under retry policy |
| Local atomic boundary | Header, lines, replay decision | Header, lines, replay decision, stable event |
| Extra ownership | Read/replay and database recovery | Also worker claims, retries, backlog, duplicates, terminal failures |

The outbox earns its complexity when recoverable asynchronous notification is required. If the user needs confirmation that the receiver applied its effect, neither a local commit nor “queued” proves that; expose a delivery state or another explicit completion contract.

## Worked failure timeline

Use synthetic invoice `a/7` and stable event `E7`:

1. Begin a local transaction; write invoice and `E7`.
2. Commit both. A crash before dispatch leaves durable pending work.
3. Worker sends `E7`. Receiver records `E7` and applies its effect atomically.
4. Receiver's response is lost. Sender cannot tell whether step 3 succeeded.
5. Worker recovers and resends `E7`. Receiver recognizes the ID and returns the prior outcome without a second effect.
6. Worker records acknowledgment.

Two sends and one effect are possible in this example. This depends on the receiver's atomic deduplication and identity-retention policy; the sender cannot assume every receiver supplies it. A local outbox alone does not prove exactly-once remote effects.

Compare a naive “commit invoice, then send once”: a crash between those actions leaves an invoice with no recoverable notification intent. Sending before commit instead can notify about an invoice that never commits. Keeping a database transaction open during HTTP does not make the remote receiver part of that database transaction.

## Guided practice: predict failures and specify evidence

Complete this table before opening [Lab 05](../labs/05-outbox-and-provider-ambiguity.md):

| Injected failure | Prediction to check | Evidence needed |
| --- | --- | --- |
| Line insert fails before commit | Neither invoice nor event survives | Query both tables on a fresh connection |
| API response disappears after commit | Replay recovers the same invoice/event identity | Client replay and stored row/value comparison |
| Worker stops before send | Event remains available after restart | Worker restart transcript and pending record |
| Receiver commits, response disappears | Duplicate send, one logical effect | Send-attempt log plus receiver effect count |
| Receiver permanently rejects | Bounded attempts and reviewable terminal state | Fake-clock retry trace and recovery procedure |

Mark every row as predicted, observed, or not implemented. A paper timeline is valuable design evidence; it is not a passed crash test. For each observed row, retain the setup, injected failure, and assertion that would catch incorrect behavior.

## Hints and answer discussion

Ask “What durable record will recovery read?” at every crash point. If there is none, retries may rely on memory that disappeared. Marking an event published before sending risks loss; marking it afterward leaves a duplicate window. Recoverable worker claims and receiver deduplication address different problems. The existing [payment simulator](../../src/MeterForge.Infrastructure/Payments/SimulatedPaymentProvider.cs) returns success; it cannot prove timeout-after-charge recovery. Payment ambiguity needs a separate fake-provider experiment.

## Independent transfer and mentorship

Write a one-page [design review](../templates/design-review.md) for a hypothetical report export: save a job, produce a file, notify a requester. Define what “accepted” and “completed” mean. Choose a synchronous design or background workflow, include one rejected alternative, and draw a crash timeline using that problem's identities. Do not assume billing event IDs transfer unchanged.

Ask another person to challenge one assumption and rehearse your recovery note without your narration. Observe where they hesitate, revise the note, then teach them why a timeout is ambiguous using their own example. Record the question, your response, and the revision. If no person is available, mark the handoff and mentorship evidence pending; a self-review or AI conversation cannot establish another person's understanding.

## Exit evidence and revisit

Submit the decision, failure table with honest evidence labels, recovery note, and handoff feedback. Specify who owns a growing backlog, what signal prompts investigation, and how that person verifies recovery without blindly replaying effects. Revisit when latency requirements change, the receiver's deduplication contract changes, or failure evidence contradicts an assumption. Senior ownership is demonstrated repeatedly through sound decisions and helping others succeed, not by choosing the more complicated design.
