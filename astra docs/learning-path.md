# A practice path from first code to ownership

Start with the [placement tasks](start-here.md) or enter the foundations directly if you are new to programming. This path develops increasingly independent work; it does not assign job titles or promise a completion date. Stages are not weeks. One exercise may take several short sessions, and revisiting prerequisites is part of learning.

Use the [practice and feedback loop](practice-and-feedback.md) throughout: guided example, independent attempt, changed example, and delayed recall. Keep the help used alongside your evidence. A gate means “ready for the next kind of practice,” not a pass/fail judgment about you.

## Foundations: read, run, investigate, and change

No prior C#, web, or database knowledge is required to enter this section. See the [foundation overview](foundations/README.md) for the individual lessons.

| Sequence | Learn before using it | Evidence to keep |
| --- | --- | --- |
| [1. Read C#](foundations/01-reading-csharp.md) | Values, variables, conditions, methods, and objects | A prediction and explanation of both branches of a small method |
| [2. Debugging and Git](foundations/02-debugging-and-git.md) | Expected versus actual behavior, errors, source control, and diffs | One observed mismatch, a next check, and an explanation of a diff |
| [3. Requests and data](foundations/03-requests-and-data.md) | Client/server, HTTP, JSON, and memory versus stored data | A request/response trace in your own words |
| [4. First test](foundations/04-first-test.md) | Arrange, act, assert, and focused test commands | A small assertion with an explanation of what it does and does not prove |
| [5. Small change](foundations/05-small-change.md) | Acceptance examples, scope, verification, and review | A bounded change you can explain line by line |

Use the [first session](first-session.md) to set up and run the app whenever ready. Opening the learning page or observing a successful run is a valid first milestone; changing application code is not required that day. If setup fails, record the first error and continue reading small examples.

**Ready for the next step:** Without following a completed solution, you can explain a small method, inspect an error, run a focused check, and make one bounded change. Then handle a slightly changed example and explain it again after a few days. If one part needs help, repeat that lesson rather than restarting everything.

## Bridges: connect small tasks to independent delivery

The [bridge overview](bridges/README.md) prepares you for larger exercises. Learn terms when they become useful: an **invariant** is a rule that must stay true; a **contract** is behavior a caller can rely on; **persistence** means keeping data beyond a process lifetime; a **transaction** groups database changes that succeed or fail together; **concurrency** means operations can overlap. The notes below deepen these ideas after practical introductions.

- Start with [reading application code](bridges/04-reading-application-code.md) if lists, dictionary lookups, object references, interfaces, or `await` still obscure a service method. Predict a few small examples before following the complete request.
- Complete [independent delivery](bridges/02-independent-delivery.md) before taking on a vertical slice: turn a request into examples, choose scope, implement, verify, and respond to review.
- Complete [data and SQL](bridges/01-data-and-sql.md) before a database lab: practice rows, keys, queries, and transactions before reasoning about races and durable guarantees.
- Complete [system ownership](bridges/03-system-ownership.md) after delivering a slice and before partial-failure or leadership capstones: identify observable behavior, diagnose a problem, plan recovery, and explain tradeoffs.

The bridge gates use artifacts and independent variations. They are not extra reading checkboxes. If you already have evidence for a bridge, use its independent task to check readiness and fill only the gaps.

## Stage 1: make a safe local change

**Prerequisites:** Foundations through a small change. Start the delivery bridge if scoping or review feels unclear. Use the [codebase tour](codebase-tour.md) to trace one product request before inspecting multiple domain models.

**Target:** Understand a bounded rule and implement it without accidental behavior changes. Read [domain modeling](notes/01-csharp-domain-modeling.md) and existing sprints [1](../docs/sprints/sprint-01.md), [2](../docs/sprints/sprint-02.md), and [5](../docs/sprints/sprint-05.md).

Practice an invariant inventory for `Money`, `Subscription`, and `Invoice`. Pick one gap, describe the accepted and rejected input, and add a regression at the owning layer. Choose a modest improvement such as clarifying one invalid transition; avoid rewriting the whole domain model.

Deliver a small diff, a counterexample that fails against the old behavior, and a paragraph explaining why the domain owns the rule. Ask a reviewer to name a case you missed.

**Exit gate:** You can explain the execution path and failure behavior; your test asserts a business outcome; another engineer can review the change without reconstructing your conversation.

## Stage 2: own a vertical slice

**Prerequisites:** Stage 1 and the [delivery bridge](bridges/02-independent-delivery.md). A vertical slice connects the entry point, behavior, and data involved in one user task. Use the [data bridge](bridges/01-data-and-sql.md) before choosing a slice that needs database or concurrency guarantees; a catalog validation slice is a smaller starting option.

**Target:** Make a coherent change across contracts, application logic, and storage. Read [API boundaries](notes/02-api-boundaries.md), [persistence and concurrency](notes/03-persistence-concurrency.md), and sprints [4](../docs/sprints/sprint-04.md) and [8](../docs/sprints/sprint-08.md).

Choose one of these slices:

- A subscription amendment contract with explicit expected-version behavior and tenant-negative tests.
- Usage ingestion that gives concurrent callers one canonical event and defines changed-payload replay behavior.
- A catalog lookup or validation improvement with a clearly documented compatibility decision.

Before writing code, sketch request, response, error, port operation, and atomic boundary. Afterward, write an API example, test successful and rejected calls, and explain which failure could still occur after restart or across multiple processes.

**Exit gate:** You can scope an issue, identify dependencies, implement it, and explain remaining limitations with modest reviewer support. This is stronger evidence of mid-level ownership than adding many disconnected endpoints.

## Stage 3: make a durability claim and prove it

**Prerequisites:** A reviewed vertical slice and the [data and SQL bridge](bridges/01-data-and-sql.md). First explain rows, unique keys, transaction rollback, and the difference between memory and database storage. Database setup and fault tests can take several sessions; split the work below into separate experiments.

**Target:** Replace an assumption with a database-backed guarantee. Read the [persistence note](notes/03-persistence-concurrency.md) and sprints [6](../docs/sprints/sprint-06.md) and [7](../docs/sprints/sprint-07.md).

Design an invoice snapshot replay policy. Choose whether identical repeats are accepted and divergent repeats are rejected; explain how existing header and line inserts behave. Build an isolated database exercise with migration setup, cleanup scoped to its fixtures, and a second connection for verification. Test rollback when a line fails, replay, divergent replay, tenant boundaries, and reload after a process restart if you wire a durable API path.

Treat connecting the adapter, migration execution, configuration, and readiness reporting as separate requirements. Merely constructing a PostgreSQL store is not proof the API uses it.

**Exit gate:** Your artifact identifies transaction boundaries, proves the claim using a real database, and documents setup and recovery so a teammate can reproduce it.

## Stage 4: reason about partial failure

**Prerequisites:** Stage 3 and the [system ownership bridge](bridges/03-system-ownership.md). First distinguish an unsuccessful request from an unknown outcome: a timeout may leave you unsure whether the remote operation happened. Learn the state and recovery vocabulary in the reliability note before implementing retries.

**Target:** Design an operation whose remote outcome can be unknown. Read [distributed reliability](notes/04-distributed-reliability.md), [testing and operations](notes/05-testing-operations.md), and sprints [10](../docs/sprints/sprint-10.md), [11](../docs/sprints/sprint-11.md), and [13](../docs/sprints/sprint-13.md).

Use a fake provider that records success and then throws a timeout. Describe durable intent, stable operation identity, provider lookup or replay, reconciliation, and operator action. Alternatively, design and implement an outbox worker in an isolated exercise. Include the crash after remote success but before local acknowledgment.

Write the state table before introducing retries. Make retry limits, scheduling, observability, and ownership explicit. Separate a replay of the same business operation from a newly authorized operation.

**Exit gate:** You can explain why retries alone do not ensure correctness, demonstrate at least one crash-window test, and give an operator a bounded recovery procedure with verification.

## Stage 5: lead a small engineering decision

**Prerequisites:** Repeated independent delivery, a demonstrated failure/recovery exercise, and practice reviewing an artifact. Start with a small proposal or review before choosing a capstone. Solo work can practice decision writing, but working with others supplies evidence solo exercises cannot.

**Target:** Improve the quality of another person's work and the maintainability of a team decision. Read [technical leadership](notes/06-technical-leadership.md), the [flaw harvest](../docs/quality/FLAW-HARVEST.md), and sprints [14](../docs/sprints/sprint-14.md) and [15](../docs/sprints/sprint-15.md).

Choose a capstone from the table below. Write a one-page proposal with constraints, options, success criteria, and rollout/rollback. Ask another person to challenge it; if no reviewer is available, record that limitation and perform a delayed self-review. Split the work into reviewable slices. Present the result as a ten-minute walkthrough that includes one rejected alternative and one unresolved risk.

| Capstone | Required artifacts | Evidence of judgment |
| --- | --- | --- |
| Durable, replay-safe usage ingestion | Port contract, database uniqueness design, race test, failure analysis | Canonical identity survives races and restarts; conflicting payloads have a policy |
| Invoice snapshot integrity | ADR, migration plan, real-database tests, recovery note | Repeated saves cannot silently alter finalized evidence |
| Recoverable payment collection | State diagram, fault-injecting provider, reconciliation scenario, runbook | Unknown outcome is handled without inventing a second collection |
| Reliable outbox delivery | Atomic-write design, worker slice, duplicate-consumer test, backlog signal | Crash windows and poison-message handling are explicit |

**Exit gate:** A reviewer can state what improved, why the chosen complexity was justified, how to operate the change, and when to revisit the decision. Repeating this across different problems develops evidence associated with senior responsibility; one capstone alone does not establish a level.

## Keep learning measurable

Review one artifact and recall one earlier concept each week of practice. Every two to four weeks, revisit your route and the [competency matrix](competency-matrix.md) when its vocabulary is familiar. Replace unsupported self-ratings with links to artifacts and record help used. Write one explanation from memory and try one changed scenario. At advanced stages, revisit a decision using new evidence and remove unnecessary complexity when you can justify doing so. Measure reduced dependence and better reasoning, not lines of code, notes read, or hours spent.
