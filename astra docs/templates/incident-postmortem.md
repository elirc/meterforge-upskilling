# Incident exercise: <observable user impact>

This template supports synthetic drills. Label simulated events explicitly. Preserve observations and avoid assigning blame to individuals.

- **Exercise or real incident:** <state explicitly>
- **Date / incident lead / status:** <UTC date, owner, open or closed>
- **Build / affected workflow:** <commit, environment, route or worker>

## Impact and current state

<Affected synthetic tenants, time window, requests, and confirmed outcomes. Distinguish known impact, suspected impact, and unknowns. A timeout is not evidence that a charge failed or succeeded.>

## Timeline in UTC

| Time | Observation or action | Evidence | Known then or learned later |
| --- | --- | --- | --- |
| | | | |

## Evidence preserved

<Logical operation IDs, invoice/payment/event IDs, provider references, trace IDs, error codes, and relevant stored state. Use synthetic or appropriately redacted data. Do not include credentials or unnecessary full payloads.>

## Containment and recovery

<What was paused, why the scope was chosen, who acted, and how success was verified. State whether the control actually exists or was simulated. Describe reconciliation and any compensating records without changing immutable history.>

**Resume criteria and decision:** <specific checks, decision maker, time, and unresolved risk>

## Causal explanation

<Trigger, contributing technical conditions, detection gap, and why existing protections did not prevent impact. Separate source-supported facts from hypotheses. Avoid treating “human error” or “a timeout” as a complete explanation.>

## Follow-up actions

| Action | Owner | Due date | Verification evidence | Priority |
| --- | --- | --- | --- | --- |
| <prevent recurrence> | | | <regression or failure drill> | |
| <improve detection or recovery> | | | <observable signal or rehearsal> | |

## Lessons and limits

<What worked? What was surprising? Which result depends on a fake provider or a single process? Which recovery behavior remains untested?>
