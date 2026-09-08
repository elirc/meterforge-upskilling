# 4. Write a test that can tell you something

[Foundations](README.md) · Previous: [Requests and data](03-requests-and-data.md) · Next: [Own a small change](05-small-change.md)

**Outcome:** write a test of existing behavior, observe a useful failure, then restore a passing assertion. You should understand the constructor example from lesson 1 and Git inspection from lesson 2. Stop the API if it is still running; these tests do not require it.

## Words before assertions

A **test** runs code and checks a stated expectation. A **test runner** discovers and executes tests. This repository uses **xUnit**, the test library named in [the test project](../../tests/MeterForge.Domain.Tests/MeterForge.Domain.Tests.csproj). `[Fact]` marks a method as a test that the runner can discover. `Assert.Equal(expected, actual)` fails if the observed value differs from the expectation.

**Arrange** means prepare inputs. **Act** means perform the behavior. **Assert** means check the outcome. A **unit test** exercises a small piece of behavior directly; here it constructs a `Product` without sending HTTP or starting a database. One useful test makes a claim another developer can understand from its name, inputs, and assertions.

## Read and run one existing test

Open [ProductTests.cs](../../tests/MeterForge.Domain.Tests/Catalog/ProductTests.cs), and find `Create_NormalizesCodeAndCurrency`. Read its constructor input and two `Assert.Equal` lines before running:

```powershell
dotnet test tests/MeterForge.Domain.Tests --filter FullyQualifiedName~Create_NormalizesCodeAndCurrency
```

Expect one discovered test and a passing result. If the runner reports no matching tests, the filter or test discovery needs fixing; zero tests is not evidence of correct behavior. If a restore/build error appears, tests have not reached their assertions. Read that first error before investigating a product rule.

The existing test acts by constructing a product with code `" pro "` and currency `"usd"`, then checks `PRO` and `USD`. It is useful because it expresses observable output. It does not establish every rule about a product.

## Worked example: name trimming

Inspect `git status --short` and use the clean practice branch preparation in [lesson 2](02-debugging-and-git.md) before editing repository files. Add a new file named `tests/MeterForge.Domain.Tests/Catalog/FoundationsProductTests.cs`. Create it beside `ProductTests.cs`, not inside the application. Use this entire file:

```csharp
using MeterForge.Domain.Catalog;
using MeterForge.Domain.Common;

namespace MeterForge.Domain.Tests.Catalog;

public sealed class FoundationsProductTests
{
    [Fact]
    public void Create_TrimsName()
    {
        // Arrange: choose input with visible spaces at both ends.
        string suppliedName = "  Starter plan  ";

        // Act: construction performs the normalization.
        var product = new Product(
            Guid.NewGuid(), "tenant-a", "STARTER", suppliedName,
            new Money(19m, "USD"));

        // Assert: compare the public result with the expected text.
        Assert.Equal("Starter plan", product.Name);
    }
}
```

The class groups tests. The `void` return type means this method returns no value to its caller. The project supplies xUnit's namespace through its `<Using Include="Xunit" />` setting, so `[Fact]` and `Assert` work without another `using` line in this repository's test file.

Run:

```powershell
dotnet test tests/MeterForge.Domain.Tests --filter FullyQualifiedName~FoundationsProductTests
```

Expect one passing test. [Product.cs](../../src/MeterForge.Domain/Catalog/Product.cs) already has `Name = name.Trim();`, so no application change is necessary.

## Guided exercise: make sure the assertion runs

1. In your new test only, change the expected value to `"Wrong name"`. Predict what will fail.
2. Run the same filtered command. Expect one failed test reporting expected `Wrong name` and actual `Starter plan`. The program compiled and the assertion detected the deliberate mismatch.
3. Restore the expected value to `"Starter plan"` and run again. Expect one passing test.
4. Inspect the file to confirm the deliberately wrong expectation is gone.

Changing an expected value proves this assertion is being executed and can reject a mismatch. It does not prove that every possible implementation bug would be caught. Later exercises teach how to challenge the implementation itself. Keep this first experiment limited to your own test.

## Your turn: less help

Add a second `[Fact]` method to the same class named `Create_PreservesInternalNameSpace`. Use a name with two spaces between `Team` and `plan`, plus at least one space at each end. Assert that trimming removes only the end spaces and keeps the two inside. Choose the other constructor inputs yourself, keeping them valid. Run the class filter and explain why the two tests make different claims.

If an assertion fails, compare the exact strings and count spaces. If there is a compiler error, inspect where you placed the new method: both methods belong inside the class's braces, and neither belongs inside the other.

## Hints: reveal only what you need

**Hint 1:** The independent task checks `product.Name` again. Your test input should look like `" Team  plan "`.

**Hint 2:** The expected value should have no outer spaces and exactly two between the words. Do not change `Product` to make a mistaken expectation pass.

**Hint 3:** Start with the worked test's structure, give the new method its own name, and choose the new input and expectation. Each `[Fact]` needs its own method.

## Answer key: compare after attempting

One valid second method is:

```csharp
[Fact]
public void Create_PreservesInternalNameSpace()
{
    var product = new Product(
        Guid.NewGuid(), "tenant-a", "TEAM", " Team  plan ",
        new Money(5m, "USD"));

    Assert.Equal("Team  plan", product.Name);
}
```

Expect two passing tests under the class filter after restoring the first expectation. The first test checks trimming around ordinary text; the second explicitly protects internal whitespace. Both check a caller-visible value instead of the private steps used to calculate it.

Review your new file in the editor and run `git status --short`. It should appear as an untracked file (`??`) until you stage it. Ordinary `git diff` does not show an untracked file's contents. Lesson 5 includes a precise staging and review sequence. If other changes appear, identify them rather than including them automatically.

**Completion demonstration:** show a recorded assertion failure, the corrected passing run with two discovered tests, and explain which lines arrange, act, and assert. State one behavior these tests do not check, such as rejecting a blank name.

**Revisit tomorrow:** why is a green run with zero discovered tests different from a green run with your two tests? Why can a passing normalization test tell you nothing about HTTP status codes?
