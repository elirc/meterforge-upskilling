# Start where you can practice

[Handbook](README.md) · [Learning path](learning-path.md) · [Practice and feedback](practice-and-feedback.md)

You can begin here without knowing C#, APIs, databases, or billing. The aim is to build skills you can use independently, then use them on increasingly unfamiliar problems. Reading every page or completing a capstone does not establish a job title.

If this is your first programming course, start with [reading C#](foundations/01-reading-csharp.md). If you have some experience, try the short tasks below to choose useful practice. You need only paper or a text editor; installation is separate in the [first session](first-session.md). Work for 10–20 minutes, then stop wherever useful. “Not yet familiar” is a route, not a score. Do not total the answers or use them to assign a level.

## Try before reading the explanations

For each task, write an answer, your reason, and any help you used. Looking something up is fine; it tells you which topic needs practice. You can skip a task that uses unfamiliar words.

1. **Read a small program.** A variable stores a value; `return` sends a result back to whoever called a method. What does `AddFee(4)` return? What about `AddFee(0)`? Explain the order of the operations.

   ```csharp
   static int AddFee(int amount)
   {
       if (amount <= 0) return 0;
       return amount + 2;
   }
   ```

2. **Investigate a mismatch.** A requirement says “zero and positive quantities are accepted.” This method accepts `3` but rejects `0`. Name the smallest input that exposes the mismatch, the condition you would inspect, and what you would run after changing it.

   ```csharp
   static bool IsAllowed(int quantity) => quantity > 0;
   ```

3. **Trace data.** A client sends `POST /products` with `{"name":"Notebook"}`. The server responds `201` with `{"id":"p1","name":"Notebook"}`. Which JSON value came from the client? Which was added by the server? Does this response alone prove the product will still exist after restarting the server? Explain.

4. **Explain a test.** Read the test below. What is the input, what action runs, and what result does the assertion check? If it passes, does it also establish what happens for zero or negative input?

   ```csharp
   [Fact]
   public void Adds_fee_to_positive_amount()
   {
       var result = AddFee(4);
       Assert.Equal(6, result);
   }
   ```

5. **Plan a small change.** Someone asks, “Make product names better.” Write two clarification questions, one possible accepted example and one rejected example after choosing a rule. Name how you would check existing behavior and inspect your changes before sharing them. There is more than one useful answer.

## Compare your reasoning and choose a route

Read these after trying. A correct guess with no explanation still points to useful practice. Start at the earliest task where you needed substantial help; revisit just that topic even if later tasks felt familiar.

| Task | Explanation | Practice if unfamiliar |
| --- | --- | --- |
| 1 | `AddFee(4)` returns `6`: the condition is false, so the second return adds two. `AddFee(0)` returns `0`: the condition is true, and the early return ends the method. | [01: Reading C#](foundations/01-reading-csharp.md), including values, conditions, methods, and objects |
| 2 | `0` is the smallest boundary example described by the requirement. Inspect `> 0`; `>= 0` includes zero. Check negative, zero, and positive examples after the change. Record the actual failure before assuming a fix. | [02: Debugging and Git](foundations/02-debugging-and-git.md), including observing a failure and reviewing a diff |
| 3 | The client supplied `name`; the server added `id`. A successful response reports what happened to that request, but does not establish how data is stored. You need a storage explanation and a restart check to claim it survives restart. | [03: Requests and data](foundations/03-requests-and-data.md), including HTTP, JSON, and in-memory storage |
| 4 | Input: `4`. Action: call `AddFee`. Assertion: compare the result to `6`. This one example gives no direct evidence about zero or negatives; those need their own checks. | [04: Your first test](foundations/04-first-test.md) |
| 5 | Useful questions include “Are empty or whitespace-only names allowed?” and “Must existing names change?” A possible agreed rule accepts `Notebook` and rejects whitespace-only input. First read the current validation and tests; then make a bounded change, run relevant checks, and inspect the Git diff. Clarification comes before inventing a rule. | [05: A small change](foundations/05-small-change.md) |

If all five felt familiar, complete the independent exercise in [a small change](foundations/05-small-change.md) before entering the [delivery bridge](bridges/02-independent-delivery.md). If SQL is new, use the [data and SQL bridge](bridges/01-data-and-sql.md) before persistence labs. Familiarity with syntax does not require you to attempt concurrency or payment recovery yet.

## Your next action

Pick one linked lesson and one observable outcome: for example, “predict both branches of a method and explain my correction.” Use the [first session](first-session.md) when you are ready to run the repository. If installation blocks you, continue the reading tasks and keep the first error as setup evidence.

After one guided example, close it and solve a similar problem yourself. Then try a changed example; a few days later, recall the idea without notes. [Practice and feedback](practice-and-feedback.md) explains this loop and how to get useful help when stuck.
