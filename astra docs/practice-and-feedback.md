# Practice that builds independence

[Start here](start-here.md) · [Learning path](learning-path.md) · [Learning note](templates/learning-note.md)

Choose a task small enough to finish or learn something observable in one sitting. A 20–30 minute session is useful; a lab may take many sessions. Setup, reading, debugging, and review all count as work. Adjust the pace to your available energy and support. There is no completion date that guarantees mid-level or senior responsibility.

## Use four kinds of practice

1. **Guided:** Read a worked example in a foundation, bridge, or lab. Predict the next line or result before revealing it. Explain why it works; copying the example is preparation.
2. **Independent:** Close the example and attempt a similar task. Use ordinary reference documentation, but record hints or generated code. If you needed the solution, repeat a smaller version later before claiming independence.
3. **Transfer:** Change one condition: a different input, a missing value, a second caller, or another part of the repository. Explain which reasoning still holds and which assumption changed. Use a small variation before taking on a whole new architecture.
4. **Delayed retrieval:** A few days later, spend five minutes explaining the idea and reproducing a small example without your earlier solution. Compare afterward and correct gaps. Revisit roughly a week later if the reasoning still needs prompts.

These are evidence categories, not grades. “Guided, with one hint” is more useful than a completion checkbox. A passing command and an explanation from memory demonstrate different things; keep both when practical.

## A short session

| Time available | Do this |
| --- | --- |
| 10 minutes | Recall one idea, predict one example, check it, and note the difference. |
| 20–30 minutes | Spend about 3 minutes recalling, 5 planning and predicting, 12–17 attempting one task, and 5 recording evidence and the next step. |
| 45–60 minutes | Add a focused implementation or transfer attempt and a review. Stop at a clear checkpoint rather than expanding scope. |

For example: predict whether a negative price is accepted, find the condition, run one existing test, and explain what the result establishes. On another day, write or adapt a test yourself. A complete end-to-end feature is not required every session.

Start your next session by recalling the previous idea before opening notes. Keep a stopping note with the file, command, observed result, and next question so restarting is cheap.

## Recover when stuck

After about 10–15 minutes without new evidence, change the approach:

1. State the expected and actual result, using a concrete input or the first error message.
2. Decide whether the obstacle is setup, vocabulary, code behavior, or task scope. Return to the relevant [foundation](foundations/README.md) for an unfamiliar concept; use [first-session troubleshooting](first-session.md#troubleshooting-by-evidence) for environment problems.
3. Reduce the task to one method, one request, or one assertion. Read the surrounding lines and inspect the value at the first place it differs from your prediction.
4. Ask for one hint, then try again. If the hint is insufficient, request a smaller example and explain it before returning to the task.
5. If still blocked, save the observation and stop or switch to a reading exercise. Record the unresolved issue instead of repeatedly changing things at random.

A useful help request is: “I expected __ for input __. I observed __ with command __. I inspected __ and think __. Can you suggest the next observation without solving it?” Remove secrets before sharing logs or code outside your workspace.

## Review with a person, AI, or yourself

A mentor or peer can challenge assumptions and spot misunderstandings; one is not required to begin. Aim for a short review after a meaningful change or every few sessions. Share the acceptance examples, small diff or trace, actual verification output, and one uncertainty. Ask the reviewer for one strength, one correctness concern, and one next experiment. Make a revision or explain why the evidence supports keeping the current approach.

If using AI, first produce your own attempt. This prompt keeps the work with you:

> Act as a reviewer for my learning exercise. Do not write the solution, replacement code, or a complete implementation plan. Check my explanation and evidence against the acceptance criteria. Ask one question at a time. If I am stuck, give the smallest hint and wait for my attempt. Distinguish facts visible in my evidence from assumptions. End with one changed example I should solve independently.

AI feedback can be wrong. Check claims against the source and observed behavior; do not accept code you cannot explain. If you do use a generated solution, label it as assisted practice, then close it and attempt a fresh variation independently. With no reviewer, wait until another session, review your own diff against the criteria, and record that feedback was a self-review. None of these substitutes establishes real team leadership experience by itself.

## Keep small, useful evidence

For foundations, four lines are enough:

```text
Task and prediction:
My attempt and help used:
Observed result and explanation:
Next variation and date to recall it:
```

As work grows, use the fuller [learning note](templates/learning-note.md): include the problem, decision, verification, limitations, review feedback, and revision. An honest failed attempt with a corrected explanation is useful evidence. “I read the chapter” alone is not evidence of independent performance.

At the end of each week of practice, choose one earlier idea to recall and one artifact to review. Every two to four weeks, look at the [learning path](learning-path.md) and, once ready for its vocabulary, the [competency matrix](competency-matrix.md). Move ahead when you can explain and reproduce the current task and handle a small variation with decreasing help. Return to a smaller exercise when you cannot. Ask whether your reasoning and independence improved, not how many pages or hours you accumulated.
