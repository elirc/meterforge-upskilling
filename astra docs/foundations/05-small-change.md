# 5. Own a small change from request to review

[Foundations](README.md) · Previous: [Your first test](04-first-test.md) · Next: [Learning path](../learning-path.md)

**Outcome:** finish a bounded change, explain the evidence, and prepare a clean handoff. Use the `FoundationsProductTests.cs` file you created in lesson 4 on your practice branch. This task adds tests and an explanatory note for existing behavior; it does not change billing rules.

## Words before the request

A **requirement** describes a needed outcome. **Acceptance criteria** are concrete checks used to decide whether the work meets it. **Scope** is what a change includes. A **regression** is behavior that used to work and later breaks. A **review** lets another person inspect your proposed change and reasoning. A **handoff** tells that person what changed, how you checked it, and what remains uncertain.

Small work still requires judgment: translate the request into an example, find the existing behavior, add enough evidence, and inspect the actual files being handed over. You do not need to invent a new feature to practice ownership.

## The precise request

> As a maintainer, I want an explicit example proving that a product name containing only spaces is rejected, so future edits do not silently allow blank names. Include a short note explaining the rule and the test command.

Acceptance criteria:

1. A new test constructs a product whose name is `"   "` while all other inputs are valid.
2. The test checks that `BusinessRuleException` is thrown with code `product.name_required`.
3. Your earlier name tests still pass, and a short Markdown note explains the existing behavior with its source path and focused verification command.
4. The final diff contains only the test work and its note. The intentionally wrong expectation from lesson 4 is absent.

## Worked example: translate the request into evidence

Read [Product.cs](../../src/MeterForge.Domain/Catalog/Product.cs). The line calling `string.IsNullOrWhiteSpace(name)` already enforces the requested behavior. You are filling a test/documentation gap. Keep that application file unchanged.

`Assert.Throws<T>(...)` checks that running an action throws an exception of type `T` and returns that exception so you can inspect it. `() =>` below defines a small action with no inputs; it lets the assertion run the constructor and catch its exception. Read this existing pattern in [ProductTests.cs](../../tests/MeterForge.Domain.Tests/Catalog/ProductTests.cs), in `Create_NegativePrice_RejectsRule`.

Add this method inside your `FoundationsProductTests` class:

```csharp
[Fact]
public void Create_WhitespaceName_RejectsRule()
{
    // Arrange: all inputs except the name are valid.
    string suppliedName = "   ";

    // Act and assert: the constructor must reject this name.
    var error = Assert.Throws<BusinessRuleException>(() =>
        new Product(Guid.NewGuid(), "tenant-a", "STARTER", suppliedName,
            new Money(19m, "USD")));

    // Assert: distinguish the intended rule from a different rejection.
    Assert.Equal("product.name_required", error.Code);
}
```

Checking the exception type alone would accept another `BusinessRuleException`, such as `price.negative`. Valid other inputs and the code assertion make this example specifically about the name rule.

## Guided exercise: produce the handoff

1. Run `dotnet test tests/MeterForge.Domain.Tests --filter FullyQualifiedName~FoundationsProductTests`. Expect three passing tests if you completed both lesson 4 tests and added only the worked test here.
2. Create `tests/MeterForge.Domain.Tests/Catalog/FOUNDATIONS-NOTE.md` beside your test file. In plain language, state that names containing only whitespace are rejected while accepted names are trimmed. Include the relative source path `../../../src/MeterForge.Domain/Catalog/Product.cs`, your test method's name, the exact command you ran, and the observed result. If you turn the source path into a Markdown link, resolve it from this note's directory, not from the repository root.
3. Run the domain test project without a filter: `dotnet test tests/MeterForge.Domain.Tests`. Expect all discovered tests to pass. Record the actual summary, not an invented count. This checks nearby domain behavior; it is not proof of every HTTP or storage behavior.
4. Review the two files in the editor, then inspect `git status --short` and `git diff --cached`. If staging already contains unrelated changes, resolve their ownership before preparing your commit. Do not mix them into this task.
5. When staging is clear and your two files contain only your intended work, stage these exact paths and review them:

```powershell
git add -- tests/MeterForge.Domain.Tests/Catalog/FoundationsProductTests.cs tests/MeterForge.Domain.Tests/Catalog/FOUNDATIONS-NOTE.md
git diff --cached --stat
git diff --cached
```

The staged diff should contain your foundations tests, including lesson 4 if you have not already committed it, and your note. Read every added line. If you staged one of your files too early, `git restore --staged -- tests/MeterForge.Domain.Tests/Catalog/FOUNDATIONS-NOTE.md` removes that file from staging while keeping its working contents. This is different from restoring the file itself, which could discard edits.

Once the staged diff is correct, you may save the practice commit:

```powershell
git commit -m "test: cover product name behavior"
git status --short
```

If Git asks for an author identity, use the identity intended for this repository before committing; do not invent an identity or change global settings just for the lesson. You can still keep the staged diff as the review artifact. No push or pull request is needed to complete this local exercise.

## Your turn: less help

Extend the same change with one related case: an empty name `""`. Decide on a method name, use valid other inputs, and check the specific business code. Update the note with the additional case and observed focused result. Re-run the focused tests and the domain project after your edit. If you already committed the guided work, prepare a second small commit; there is no need to rewrite history.

Then write this handoff in your own words:

```text
Request:
Existing behavior and source:
Files changed and why:
Verification command and observed result:
What the tests do not establish:
One question for the reviewer:
```

Have another person review the diff if available. If working alone, put it aside and review it later without the answer key. Mark that as self-review rather than inventing external feedback. Ask whether each assertion matches the acceptance criteria and whether the note overstates what was checked.

## Hints: reveal only what you need

**Hint 1:** Empty text and whitespace-only text are separate inputs accepted by the same rejection condition.

**Hint 2:** Use the worked exception assertion pattern. Change the method name and the input name; keep other inputs valid.

**Hint 3:** If a test reports `tenant.required` or `price.negative`, inspect your setup before changing the expected code. Your input may be failing an earlier check.

## Answer key: compare after attempting

One independent test is:

```csharp
[Fact]
public void Create_EmptyName_RejectsRule()
{
    var error = Assert.Throws<BusinessRuleException>(() =>
        new Product(Guid.NewGuid(), "tenant-a", "STARTER", "",
            new Money(19m, "USD")));

    Assert.Equal("product.name_required", error.Code);
}
```

With the two lesson 4 tests and both lesson 5 tests, the focused class filter discovers four passing tests. A useful note says, for example: "The constructor rejects empty or whitespace-only names with `product.name_required`. For accepted names, it trims the ends and preserves internal spaces. These tests call the constructor directly; they do not check an HTTP response." Follow that with your real command and result.

A useful review question is: "Do the valid and rejected name examples express the rule clearly enough to guide a future change?" Merely asking whether the code looks good gives the reviewer less direction.

**Completion demonstration:** show the small diff or commit, your observed focused and domain-test results, and a handoff that explains every changed line. Given the request again with the answer closed, describe how you would identify the rule and choose a test. This is the first practice of owning a change, not evidence of readiness for senior work by itself.

**Revisit in a week:** if the requirement changed to reject names longer than a specified limit, what information would you need before editing, where would you look, and what boundary examples would you propose? Do not implement that hypothetical change now.

Continue with the [learning path](../learning-path.md) once you can repeat these small tasks with new inputs without copying the solution.
