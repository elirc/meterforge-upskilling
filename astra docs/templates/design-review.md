# Design review: <bounded user outcome>

Use before a multi-boundary change, and update it to describe the final design before handoff. Keep it proportional to the problem.

- **Author / reviewer / date:** <names and date>
- **Status:** Draft / Ready for review / Accepted with follow-ups
- **Baseline / linked ADR:** <commit and links>

## Problem and proposed behavior

<Name the caller, triggering request, current outcome, and desired outcome. Include one concrete before/after example.>

## Scope and assumptions

<What will be delivered? What is excluded? Which constraints are measured, given by the exercise, or still assumed? Distinguish an existing service from a proposed component.>

## Invariants and ownership

| Invariant | Owning boundary | Identity / tenant scope | Evidence required |
| --- | --- | --- | --- |
| <example: one canonical finalized snapshot> | <database transaction> | <tenant + invoice ID> | <conflicting concurrent save> |

## Request and failure path

<Describe normal flow, commit point, retry behavior, cancellation, process restart, and lost response. A short sequence diagram is useful if it clarifies who knows what. State whether external outcomes may be unknown.>

## Alternatives and tradeoffs

<Compare at least one simpler viable design. Explain added complexity in terms of a demonstrated requirement. Link an ADR if the choice deserves a lasting record.>

## Compatibility, rollout, and recovery

<Contract and schema compatibility, deployment order, readiness checks, how intake is stopped, and what rollback preserves. Name the operator and the evidence needed to resume.>

## Verification plan

<Map each important risk to the lowest meaningful test layer. Identify real-database tests and fake-provider assumptions. Include an adverse case, not only a demonstration request.>

## Reviewer decisions

| Question or objection | Response / experiment | Owner | Resolved or deferred |
| --- | --- | --- | --- |
| | | | |

**Ready to implement / release because:** <evidence and remaining limits; keep these as separate decisions when implementation is still pending>
