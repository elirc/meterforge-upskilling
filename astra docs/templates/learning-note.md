# Learning note: <specific question or behavior>

Copy this template into your own notes and replace the prompts. Keep observations separate from planned changes. Use one note per useful question, not one per file opened.

- **Date / author:** <UTC date and name>
- **Lab / starting commit:** <link and SHA>
- **Question:** <what did you need to understand?>
- **Prediction:** <what did you expect before running anything?>

## What the code does today

<Describe the concrete trigger, call path, result, and storage boundary. Link the relevant source symbol and test. Include the commit when the behavior may change.>

## Experiment and observation

```text
Command or request:
Inputs and environment:
Observed status / value / identity / error:
Expected result:
```

<Explain what this observation supports and what it cannot establish. An in-memory test does not prove SQL behavior; a tenant-scoped lookup does not prove authorization.>

## Explanation in my own words

<Explain why the result occurred. Name the owner of the invariant and the operation at which the outcome becomes decided. Give one counterexample to an earlier assumption.>

## Change or next experiment

<Separate a proposed extension from implemented behavior. Choose one concrete next action and the evidence that would settle the question.>

## Retrieval practice

Answer these later without reopening the implementation:

1. What failure was this rule or boundary protecting against?
2. What is the smallest test that would expose its removal?
3. What changes if the process restarts or another instance handles the request?

**Reviewer feedback / follow-up date:** <one useful correction and when to revisit it>
