# Astra learning library

Use MeterForge to learn from your first code explanation through independent delivery, review, and operation. Begin with small C# examples if you are new, then build toward owning a software change. This library extends the existing fifteen sprints with prerequisites, deliberate practice, feedback, and evidence of increasing independence.

Career levels vary between teams. These materials develop skills associated with mid-level and senior work; finishing exercises does not guarantee a title. The strongest evidence is repeatable judgment, useful feedback from others, and working outcomes.

## Start here

1. Try [Start here](start-here.md) for concrete placement tasks with answer explanations, or begin the [foundations](foundations/README.md) without taking them.
2. Use the [first session](first-session.md) to set up and run the app. A successful run is a useful first win; setup difficulties do not assess your programming ability.
3. Follow the [learning path](learning-path.md): foundations, [bridges](bridges/README.md), then increasingly independent changes. Read the [codebase tour](codebase-tour.md) after learning requests and data.
4. Use [practice and feedback](practice-and-feedback.md) for short sessions, help when stuck, independent variations, and delayed recall. A mentor is optional; AI can review your own attempt one question at a time.
5. Keep evidence and the help used. Use the [competency matrix](competency-matrix.md) once its vocabulary is familiar; it is a reflection tool, not an entrance exam or job-title score.

## Choose reading after prerequisites

The notes below assume you can read a method, trace a request, and explain a test. Start with the foundations if those are unfamiliar. Complete the data and SQL bridge before persistence work and the system ownership bridge before recovery capstones. Each stage in the learning path names the prerequisites it needs.

| Note | Core question | Practice outcome |
| --- | --- | --- |
| [C# and domain modeling](notes/01-csharp-domain-modeling.md) | Where should a rule live, and can invalid state escape? | Invariants, state transitions, and a justified model change |
| [API boundaries](notes/02-api-boundaries.md) | What may callers safely depend on? | A clear contract with negative cases and compatibility evidence |
| [Persistence and concurrency](notes/03-persistence-concurrency.md) | Which operation must succeed atomically? | A race reproduction and a storage guarantee |
| [Distributed reliability](notes/04-distributed-reliability.md) | What if the remote side succeeded but we did not hear back? | A failure matrix and recovery design |
| [Testing and operations](notes/05-testing-operations.md) | How do we prove the guarantee and detect its failure? | Risk-driven tests and a rehearsed operational check |
| [Technical leadership](notes/06-technical-leadership.md) | How do we help a team make and maintain a good decision? | An ADR, actionable review, and measured retrospective |

## Current system versus practice work

The current API is a teaching modular monolith. Its default product, subscription, and usage repositories are in memory; the payment provider is simulated. Invoice finalization is exposed as a preview. PostgreSQL snapshot and outbox building blocks exist, but their presence does not make the API durable or provide a running delivery worker.

Throughout the notes, **Read** refers to actual repository files, **Explain** develops the reasoning behind them, and **Practice** describes proposed work. A practice exercise is not a claim that the repository already implements that behavior. Source files are the final authority when implementation evolves.

Use only fictional tenants, test provider responses, and synthetic billing records. See the existing [production-readiness assessment](../docs/quality/PRODUCTION-READINESS.md) for the concrete gaps between the reference application and an operated billing system.

## Evidence notebook

For the browser interface, document publishing, local notebook behavior, and optional UI verification, see [maintaining the learning portal](portal-maintenance.md).

For a foundation exercise, record your prediction, attempt, help used, observed result, and next variation. As exercises grow, keep this fuller entry in your own notes:

```markdown
Date and exercise:
User-visible problem:
Prediction before running the code:
Source paths and baseline behavior:
Smallest counterexample:
Decision and alternative considered:
Change or design artifact:
Verification command and observed outcome:
What the evidence does not establish:
Reviewer feedback and resulting revision:
Help used and what I reproduced independently:
Changed example and delayed recall result:
Next experiment:
```

Do not mark an exercise complete because you read its solution. First produce an explanation or artifact yourself; use assistance to challenge it, then reproduce the reasoning independently.

The existing [learner guide](../LEARNER-GUIDE.md), [sprint notes](../docs/sprints), [testing guide](../TESTREADME.md), and [over-engineering review](../OEReadMe.md) remain useful companions. This library adds depth and practice choices rather than requiring a second sequential course.

See the [change report](CHANGE-REPORT.md) for the earlier delivered features, verification results, screenshots, and setup details. The [upskilling review](UPSKILLING-REVIEW.md) records the learning gaps and the changes made to address them.
