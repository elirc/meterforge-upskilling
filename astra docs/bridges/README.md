# Bridges from guided changes to independent ownership

These lessons fill the space between understanding a small C# change and owning a feature or reliability decision. They teach one idea, work an example, then remove the scaffolding. They are practice for your development, not a claim that the application is production ready.

Start after you can trace the product request in the [codebase tour](../codebase-tour.md) and explain a passing and failing test. If those steps still require copying, return to the [first session](../first-session.md). You do not need to understand distributed systems before starting the first bridge.

If collections, interfaces, or `await` make that trace difficult, start with [reading application code](04-reading-application-code.md), then return to the other bridges. The file numbers are identifiers, not a requirement to learn SQL before reading C# application services.

| Bridge | What you will learn to do | Continue with |
| --- | --- | --- |
| [04: Reading application code](04-reading-application-code.md) | Explain collections, references, nullable lookups, interfaces, and awaited calls | [Codebase tour](../codebase-tour.md), then independent delivery below |
| [01: Data and SQL](01-data-and-sql.md) | Predict rows, identify a complete key, and explain rollback using a tiny database example | [Lab 04: invoice persistence](../labs/04-durable-invoice-persistence.md), after its other prerequisites |
| [02: Independent delivery](02-independent-delivery.md) | Turn an ambiguous request into a bounded slice with acceptance, review, and rollback evidence | [Lab 01: vertical slice](../labs/01-vertical-slice.md), then another independent feature |
| [03: System ownership](03-system-ownership.md) | Choose a reliability design from requirements, explain failures, and make recovery usable by someone else | [Lab 05: outbox](../labs/05-outbox-and-provider-ambiguity.md), after Lab 04 |

Work in short sessions: predict before running, compare observations with the worked answer, then attempt the transfer task without the example open. Keep your original wrong prediction alongside the correction; that makes the learning visible. Pause at a failed prerequisite and repeat a smaller task rather than treating confusion as evidence that you cannot progress.

Save evidence in your own [learning note](../templates/learning-note.md). For each lesson, include what you could do unaided, where a hint was needed, the observation that changed your explanation, and the next independent attempt. An AI explanation or a green test is useful feedback; neither demonstrates that you can perform the task without help.

The system ownership bridge requires another person's challenge and a handoff exercise to demonstrate collaboration. If no person is available, complete the technical work and mark the collaboration evidence pending. Use a delayed self-review for practice, while keeping that distinction visible. Revisit the [competency matrix](../competency-matrix.md) using artifacts rather than a title or a count of completed lessons.
