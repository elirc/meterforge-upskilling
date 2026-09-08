# 2. Explain a failure and keep changes safe

[Foundations](README.md) · Previous: [Reading C#](01-reading-csharp.md) · Next: [Requests and data](03-requests-and-data.md)

**Outcome:** reproduce one specific failure, fix its input, and explain what Git would include in a commit. Keep using lesson 1's temporary console. If you opened a new terminal, restore its `$meterforgePractice` variable using the saved path.

## Words before tools

A **bug** is a mismatch between intended and actual behavior. **Debugging** means collecting evidence to explain that mismatch. An **exception** reports that execution cannot continue normally along its current path. A **stack trace** lists the calls involved in a failure. A **breakpoint** asks a debugger to pause before a line executes. You can learn this debugging process using output first; a debugger is an optional second view.

An exception is not automatically a bug. This worked example deliberately supplies invalid input to a rule that correctly rejects it. The mistake is in our practice caller, and the fix belongs there.

## Worked example: a known failing input

Read the first check in [Money.cs](../../src/MeterForge.Domain/Common/Money.cs). It rejects a blank currency or a trimmed currency whose length is not three. `||` means either condition is enough; `!=` means not equal. `throw` raises an exception and stops this constructor before its assignments.

Replace the practice `Program.cs` with:

```csharp
using MeterForge.Domain.Common;

string currency = "us";
Console.WriteLine($"Before construction: [{currency}], length {currency.Length}");
var price = new Money(19m, currency);
Console.WriteLine($"After construction: {price.Currency}");
```

Predict whether the last line prints, then run:

```powershell
dotnet run --project "$meterforgePractice"
```

Expect `Before construction: [us], length 2`, then an unhandled `BusinessRuleException` saying `Currency must be a three-letter code.` The last line does not print. Exact stack formatting and line numbers may differ. Find the frame mentioning `Money` and then the one mentioning your practice `Program.cs`: the constructor rejected an argument supplied by the caller.

The reasoning is short: the supplied string has length 2; the rule requires 3; the exception occurs before the value is constructed. Change the practice input to `"usd"` and run again. Expect the before line with length 3, followed by `After construction: USD`. The repository rule did not need editing.

If your editor already has a C# debugger, optionally put a breakpoint on `new Money(...)`, launch the practice console in the debugger, and inspect `currency`. **Step over** executes a line without entering its called methods; **step into** can enter `Money` so you can inspect the condition. The console output remains sufficient evidence if you have not configured a debugger yet.

## Guided exercise: inspect the value the rule actually uses

1. Set currency to `" us "`. Predict its raw length and its trimmed length.
2. Add `Console.WriteLine(currency.Trim().Length);` before construction. Run it and record which line throws.
3. Change the input to `" usd "`. Run again and explain why surrounding spaces are acceptable here.

## Git vocabulary and a safe inspection

**Git** records versions of files. Your **working tree** is the files you currently edit. A **diff** shows changed lines. The **staging area** is the selection of changes intended for the next **commit**, a saved version with a message. A **branch** is a name pointing to a line of commits; creating one does not make a backup of every uncommitted edit.

In a terminal at the MeterForge repository root, inspect:

```powershell
git status --short
git diff -- src/MeterForge.Domain/Common/Money.cs
git diff --cached
```

For tracked files, plain `git diff` shows working-tree changes relative to staging; `--cached` shows staged changes relative to the latest commit. Empty output for `Money.cs` means there is no unstaged diff in that file. It does not mean the temporary console was lost: that console is outside this repository. New, untracked files appear as `??` in status and do not appear in ordinary `git diff` until staged. In a short status such as ` M file`, the second column describes the unstaged edit; `M  file` describes a staged edit.

If status already contains work, identify its owner and purpose before including anything in your own commit. Inspecting it is safe. Do not overwrite it or stage the whole repository. In lesson 5 you will select exact files and review the staged diff.

When starting lesson 4's repository edits, a clean working tree lets you create a practice branch with:

```powershell
git switch -c practice/foundations
```

Run that only when you have inspected status and the branch name is unused. If you are already on that branch, continue there. If there are unrelated changes, you can keep reading and using the temporary console while arranging a separate clean checkout with the person whose work is present. Do not use a reset or cleanup command to make the status empty. A dirty working tree can carry edits between branches; a new branch alone does not separate them.

## Your turn: less help

In the practice caller, use `new Money(1.234m, "USD")`. First read the second check in `Money.cs`. Predict the error and whether the last line prints. Produce a successful example by changing only the amount. Keep a diagnosis with the supplied input, the rejecting condition, and the successful input. Also inspect Git's staged diff and explain whether any of your temporary-console work is included.

## Hints: reveal only what you need

**Hint 1:** Raw length includes surrounding spaces; the currency rule compares the length after `Trim()`.

**Hint 2:** `decimal.Round(amount, 2, ...)` returns the amount rounded to two decimal places. Compare that result with the original amount. You do not need to learn rounding tie cases for `1.234m`.

**Hint 3:** Use an amount already expressible in two decimal places. The fix is in the input you chose, not in `Money`'s precision rule.

## Answer key: compare after attempting

`" us "` has raw length 4 and trimmed length 2, so it fails the currency check. `" usd "` has raw length 5 and trimmed length 3, so construction succeeds and stores `USD`.

`1.234m` rounds to `1.23m`, which differs from the input. Construction throws with message `Money supports at most two decimal places.` and business code `money.precision_invalid`; the code is stored on the exception, though an unhandled exception display may only show its message. `new Money(1.23m, "USD")` succeeds. The line after construction runs only in the successful case. A temporary console outside the repository is not part of the repository's staged diff.

**Completion demonstration:** explain a failure as input → condition → result, show a corrected run, and explain the difference between working files, staging, and a commit. Identify any pre-existing changes without altering them.

**Revisit tomorrow:** why would weakening the currency check be the wrong fix for this practice failure? What evidence distinguishes an intended rejection from an application bug?
