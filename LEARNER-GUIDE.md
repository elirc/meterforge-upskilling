# Learner guide

Begin with [Start here](<astra docs/start-here.md>) for small placement tasks and explained answers, or go directly to the [foundations](<astra docs/foundations/README.md>) if you are new to programming. Use the [first session](<astra docs/first-session.md>) to run the app when ready. A successful run is a valid first win; advanced test changes can wait.

The [Astra learning path](<astra docs/learning-path.md>) connects beginner practice to independent delivery and system ownership. It develops skills associated with mid-level and senior responsibility without promising a title or a timeline. With the API running, `/learn/` provides the reading library, local progress tracking, and notes. Export your work regularly; browser storage is not a durable portfolio.

## Choose the right stretch

| Your current experience | Practice next | Evidence to keep |
| --- | --- | --- |
| Code syntax and terminal commands are unfamiliar | [Foundations](<astra docs/foundations/README.md>): read C#, investigate errors, trace requests, run a test | A small prediction, observed result, and explanation |
| Read a method and explain a test with help | [A small change](<astra docs/foundations/05-small-change.md>), then an independent variation | A bounded diff, focused check, and help used |
| Make a small change independently | [Independent delivery](<astra docs/bridges/02-independent-delivery.md>) | Acceptance examples, verified implementation, review, and revision |
| Deliver a bounded feature but need storage practice | [Data and SQL](<astra docs/bridges/01-data-and-sql.md>) before persistence labs | Queries, a transaction experiment, and restart explanation |
| Deliver and verify a slice across layers | [System ownership](<astra docs/bridges/03-system-ownership.md>), then recovery exercises | Diagnosis, decision, failure evidence, and recovery steps |
| Explain the cross-boundary tradeoffs | Help another engineer deliver and challenge your own assumptions | Review feedback, a teach-back, and a revised design |

Use the placement tasks to choose a starting point and the [competency matrix](<astra docs/competency-matrix.md>) once its vocabulary is familiar. Work on the first area you cannot yet demonstrate and record help used; neither tenure nor reading speed is the assessment.

## A repeatable study session

Use [practice and feedback](<astra docs/practice-and-feedback.md>): attempt a guided example, close it and try independently, solve a changed example, then recall the idea a few days later. A 20–30 minute session can cover one prediction, experiment, explanation, and next step. Bigger labs take multiple sessions; adjust the workload to your circumstances.

For early practice, write four lines: task and prediction, attempt and help used, observed result and explanation, next variation and recall date. Use a fuller [learning note](<astra docs/templates/learning-note.md>) as changes grow. Seek a short review every few sessions; revisit one earlier idea each week of practice and your route every two to four weeks. Use the [labs](<astra docs/labs/README.md>) after the relevant foundations and bridges.

When stuck, record expected versus actual behavior, identify the first error or unfamiliar term, and shrink the task to one method or assertion. Ask for one hint after 10–15 minutes without new evidence. Setup trouble is a separate problem, and returning to a prerequisite is productive practice.

## Use the original sprints after the foundations

The [sprint notes](docs/sprints) are reference material, not the beginner entry sequence. Once you can read a test and trace a request:

1. Read the milestone and issues before the code.
2. Read commits in order and predict the next design pressure.
3. Start at a failing business-rule test, then trace the use case, adapter, endpoint, and contract.
4. Read review comments as design evidence, not style instructions.
5. Try a bounded variation, verify it, and explain what the evidence establishes.
6. As the bridges introduce them, explain transaction, tenant, retry, and compatibility boundaries in your own words.

Ask what fact must remain true, who owns it, and what evidence supports the choice. You do not need to answer every system-design question at the beginning.

The existing sprint notes describe the original course. The handbook distinguishes guarantees implemented today from hardening exercises still to build. For example, tenant-scoped usage keys exist, but the current find-then-add operation does not establish atomic replay under concurrency. Learn those terms in the data bridge before attempting to fix that behavior. The [testing guide](TESTREADME.md), [over-engineering review](OEReadMe.md), and [earlier change report](<astra docs/CHANGE-REPORT.md>) remain available alongside the [upskilling review](<astra docs/UPSKILLING-REVIEW.md>).

## Use feedback without outsourcing the learning

A mentor or peer is helpful but optional. First make your own prediction or attempt. Ask a reviewer for one correctness concern and one next experiment, then revise and explain the result. If using AI, ask it to review against acceptance criteria, ask one question at a time, and offer only a small hint without providing the solution. The [feedback guide](<astra docs/practice-and-feedback.md#review-with-a-person-ai-or-yourself>) includes a reusable prompt.

Verify suggestions against source and observed behavior. Label generated solutions as assisted practice and attempt a fresh variation without them. Finish with a short explanation from memory. If nobody can review, perform a delayed self-review and record that limitation; real collaboration supplies evidence that solo exercises cannot.
