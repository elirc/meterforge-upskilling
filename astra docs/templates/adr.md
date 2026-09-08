# ADR <number>: <decision in plain language>

Use this for a consequential choice with alternatives, such as replay identity or a transaction boundary. A routine field addition usually does not need a full ADR. Describe a decision; do not use the document as proof that the decision was implemented.

- **Status:** Proposed / Accepted / Superseded
- **Date / owner:** <date and accountable person>
- **Scope / commit:** <affected workflow and implementation baseline>
- **Related design / supersedes:** <links or none>

## Context and constraints

<Concrete caller problem, current behavior with source links, and the constraint that makes the choice necessary. Separate measured constraints from assumptions.>

## Decision

<We will do X at boundary Y because Z. State identity, tenant scope, and transaction ownership if relevant. Define the cases the decision intentionally does not cover.>

## Alternatives considered

| Option | Benefit | Cost or failure mode | Why chosen or rejected |
| --- | --- | --- | --- |
| <smallest viable option> | | | |
| <credible alternative> | | | |
| <defer the change> | | | |

## Consequences and limits

<Compatibility, operational work, migration needs, data retention, testing burden, and reversibility. Which guarantee depends on another system? What has not been demonstrated?>

## Evidence and implementation status

- **Existing observations:** <source, test, or measurement links>
- **Required verification:** <counterexamples and acceptance criteria>
- **Implemented in:** <commit/PR, or “not implemented”>
- **Remaining work:** <owner and concrete next step>

## Revisit trigger

<A measurable change or discovered fact that would cause reconsideration, rather than a vague “when we scale.” Record a superseding decision instead of silently rewriting accepted history.>
