# Technical leadership: make decisions easier to maintain

## Read

Use the [over-engineering review](../../OEReadMe.md), [production-readiness assessment](../../docs/quality/PRODUCTION-READINESS.md), [retrospective](../../docs/curriculum/RETROSPECTIVE.md), and [flaw harvest](../../docs/quality/FLAW-HARVEST.md). Ground your own decision in a real source boundary such as the [usage store](../../src/MeterForge.Infrastructure/Usage/InMemoryUsageEventStore.cs) or [snapshot adapter](../../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs).

## Explain

Technical leadership often looks like making a confusing problem small enough for others to act on. Identify the user impact, separate observed behavior from assumptions, compare viable options, and leave a record that another engineer can revise.

For example, “make billing reliable” is too broad to review. “Ensure concurrent requests for the same tenant/event identity return one canonical usage event” names a bounded guarantee. It can be split into a reproduction, port contract, adapter implementation, and compatibility example. A separate durability issue can then describe what happens after restart. This avoids pretending one local fix solves the entire reliability problem.

An architecture decision record is useful when alternatives have lasting consequences. It is less useful when it documents a routine naming choice. A snapshot replay policy is a good candidate because rejecting divergent replays affects persistence, caller behavior, repair procedures, and migration of old data.

Use this compact format:

```markdown
Decision: [specific action]
Status and owner: [proposed/accepted; responsible person or team]
Problem: [observed behavior and user impact]
Constraints: [compatibility, time, data, operational capacity]
Options: [two or three viable approaches]
Choice and reason: [which requirement determines the choice]
Consequences: [benefits, costs, known gaps]
Verification: [evidence required before rollout]
Rollout and rollback: [ordered steps and data implications]
Revisit when: [specific new evidence or scale threshold]
```

A good review comment names a concrete risk and a possible next step. Instead of “this is not thread-safe,” write: “Two callers can both observe no event before insert. Can the store return the canonical winner atomically? A barrier-controlled test would expose the differing returned IDs.” Mark the distinction between a blocking correctness issue, a clarification, and a preference.

Tradeoffs should include operating cost and teammate comprehension. Before proposing a broker, generic repository, or new framework, ask which observed problem requires it, what a smaller approach cannot do, and who will maintain it. A modular monolith with clear transaction boundaries can be a stronger learning outcome than a collection of services without recovery evidence.

Incidents are opportunities to improve a system of work. Describe the timeline, contributing conditions, detection gap, containment, and follow-up verification. Avoid stopping at “someone forgot a test.” Ask why the guarantee was unclear or why the available test could pass while the failure remained.

## Practice

1. Write a one-page proposal for immutable invoice snapshot replay. Compare at least two policies and include a concrete divergent replay example. Have a reviewer challenge both correctness and deployment cost.
2. Split the proposal into three reviewable changes with acceptance evidence and dependencies. Keep each slice useful or explicitly preparatory; avoid shipping a partial API that claims an unimplemented guarantee.
3. Review a source file and write three comments: one correctness risk, one question, and one optional improvement. Tie each to a line of reasoning or testable behavior.
4. Lead a ten-minute teach-back on an unknown payment outcome. Ask the listener to explain the recovery path in their own words. Revise your explanation if they cannot identify the durable operation identity.
5. Write a retrospective with one decision that worked, one that changed after evidence, and one bounded follow-up. Give each follow-up an owner and a verification method rather than “improve testing.”

## Evidence of broader ownership

Collect the initial proposal, reviewer feedback, revised decision, implementation evidence, and one example of another person succeeding using your explanation. If working alone, record the absence of independent feedback rather than treating an assistant-generated review as a substitute for team outcomes.

Teach back: “What changed in someone else's ability to own this system because of your work?” More documentation helps when it answers a real question and stays connected to code; volume alone is not leadership evidence.
