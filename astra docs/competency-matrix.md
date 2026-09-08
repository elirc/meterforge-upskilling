# Competency matrix and evidence rubric

This matrix describes increasing scope and independence, not an employer's promotion policy. A person can be strong in modeling and inexperienced in operations. Score each dimension separately and use the weakest relevant dimension to select the next exercise.

## Before using the ownership rubric

If you are new to programming, begin with [find your starting point](start-here.md). The table below is your first target; the broader matrix becomes useful after these actions feel familiar.

| Beginner capability | A small demonstration | If it is unfamiliar |
| --- | --- | --- |
| Read code | Predict the values after three assignments, then explain a changed input | [Read C#](foundations/01-reading-csharp.md) |
| Investigate a failure | Name expected versus actual behavior and find the relevant source line | [Debugging and Git](foundations/02-debugging-and-git.md) |
| Follow data | Explain one request body, response, and dictionary lookup | [Requests and data](foundations/03-requests-and-data.md) |
| Check behavior | Write an assertion using an independently derived expectation and make it fail deliberately | [First test](foundations/04-first-test.md) |
| Deliver a small change | Show a narrow diff, a useful test result, and your own explanation | [Small change](foundations/05-small-change.md) |

Needing a worked example is a normal starting point. Repeat with a different input before claiming independence. A green test or a review checkmark alone does not show that you can explain the result.

## Increasing scope of ownership

| Dimension | Foundation: supported implementation | Independent feature ownership | Broader technical ownership | Evidence to collect |
| --- | --- | --- | --- | --- |
| C# and modeling | Explain constructors, records, references, and invariant checks | Choose value/object boundaries and prevent invalid transitions | Revisit model assumptions and coordinate a compatible model change | Invariant inventory, counterexample, rationale, regression |
| API design | Trace DTO mapping and expected status | Define success, failure, replay, and compatibility behavior | Establish consistent contracts and a migration strategy across features | Contract examples, negative tests, compatibility note |
| Data and concurrency | Explain keys, transactions, and expected versions | Reproduce a race and enforce an atomic storage guarantee | Design migration, replay integrity, and recovery across process boundaries | Interleaving trace, database tests, ADR, rollout plan |
| Distributed reliability | Recognize timeout and duplicate-delivery risks | Implement bounded retry around stable business identity | Design reconciliation and operational ownership for ambiguous outcomes | Failure matrix, fault injection, runbook rehearsal |
| Testing | Write focused behavior assertions | Select test layers by risk and avoid false concurrency evidence | Define verification strategy that supports safe evolution | Failing counterexample, test rationale, documented blind spots |
| Operations and security | Distinguish liveness, readiness, tenant scope, and authorization | Add useful signals and verify a recovery procedure | Agree service objectives, prioritize risks, and lead an incident exercise | Signal definitions, tenant-negative test, drill timeline |
| Delivery | Implement a well-specified task | Slice an ambiguous request and manage dependencies | Negotiate scope, tradeoffs, and a staged release across owners | Issue breakdown, reviewable PRs, acceptance evidence |
| Communication and leadership | Explain a change and accept corrections | Give actionable review and document decisions | Improve shared understanding and help others own the system | ADR revisions, review examples, teach-back, retrospective |

## Score with artifacts

Use the following scale for **each dimension**, without averaging into a job title:

- **0 — Unexplored:** No recent evidence; choose a reading and prediction exercise.
- **1 — With guidance:** You can complete a bounded exercise with substantial hints and explain the final result.
- **2 — Independent:** You can identify the risk, implement a bounded solution, and verify it with ordinary review.
- **3 — Repeatable broader ownership:** You can handle ambiguity across boundaries, compare options, help another engineer, and validate an operational outcome on multiple occasions.

A polished document alone is not operational evidence. A passing unit test alone is not durability evidence. A simulated provider alone is not evidence of real-provider integration. Name what each artifact demonstrates and what it leaves unknown.

## Assessment sheet

Copy a row for each dimension into your personal notebook:

| Dimension | Date | Score | Artifact or source link | What I did independently | Feedback | Next evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Persistence/concurrency | YYYY-MM-DD | 1 | Link to experiment | Explained a two-writer interleaving | Need an atomic database operation | Reproduce with two database connections |

Use two pieces of evidence before claiming repeatability: for example, a usage replay race and a subscription version conflict. Record reviewer disagreement; it often identifies a more useful exercise than another self-selected feature.

## Review prompts

For a completed change, ask a reviewer to evaluate five things:

1. **Correctness:** Which guarantee is now true? Which counterexample proves the old behavior was wrong?
2. **Scope:** Is the solution appropriately small? Did the author explain necessary adjacent changes?
3. **Verification:** Could the test pass while the important defect remains? Are external guarantees tested at their real boundary?
4. **Operation:** What happens after timeout, restart, concurrent access, or deployment rollback?
5. **Communication:** Can someone unfamiliar with the work maintain it using the PR, tests, and notes?

An honest “not tested because the environment has no database” is useful evidence of judgment when paired with a reproducible next step. Claiming a guarantee from a test that never exercises its boundary is not.

## Reassessment exercise

Return to an earlier change after two weeks. Explain it without the original notes, identify a new failure mode, and decide whether it requires code, documentation, or no action. Then teach the guarantee to another engineer using one input/output example. This checks retained understanding and the ability to make someone else effective, rather than recall of terminology.
