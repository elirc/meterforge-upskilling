# Evidence packet: <change and protected outcome>

Use this as a compact handoff for a lab or review. Report actual outcomes; planned tests belong in the pending-work section.

- **Author / reviewer / date:** <names and UTC date>
- **Baseline / final commit:** <SHAs or explicit uncommitted working tree>
- **Related lab / design / change:** <links>

## Outcome and boundaries

<What changed for a caller, why it matters, and which behavior is still outside scope. Link relevant source and tests.>

## Reproduce

```text
Working directory:
SDK / database / build configuration:
Setup command:
Focused verification command:
Broader verification command:
```

<Include required fixtures, database isolation, and cleanup limited to the exercise's own resources. State whether commands were actually run.>

## Results by risk

| Risk or invariant | Test / experiment | Actual result | Evidence link | Limitation |
| --- | --- | --- | --- | --- |
| | | Pass / Fail / Not run | | |

**Regression evidence:** <why the failing-before case exposes the original defect, and the passing-after result. If this is a new feature, state the old behavior accurately.>

**Performance evidence, if relevant:** <workload, warmup, duration, sample count, percentiles, success/error counts, and comparable before/after conditions>

## Review notes

- **Correctness:** <counterexample reviewed and result>
- **Maintainability:** <ownership, naming, and avoidable complexity>
- **Compatibility and operations:** <contract change, migration, recovery, readiness>
- **Assumptions challenged:** <which one changed and why>

## Pending work and decision

| Unrun check or unresolved concern | Why it matters | Owner / next step |
| --- | --- | --- |
| | | |

**Review result:** <accepted, changes requested, or accepted for the teaching scope with explicit limitations>

Do not collapse “not run” into “pass.” A green fast test suite does not imply that database integration, restart, or external-delivery scenarios ran.
