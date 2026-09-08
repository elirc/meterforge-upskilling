# 1. Read and run a tiny C# program

[Foundations](README.md) · Next: [Debugging and Git](02-debugging-and-git.md)

**Outcome:** predict what a short program prints and explain how one input changes the result. First complete [Prepare once](README.md). No application editing is needed.

## Words before code

A **value** is a piece of data, such as `3` or `"Pro"`. A **type** describes which values and operations are allowed: `int` holds whole numbers, `string` holds text, `bool` holds `true` or `false`, and `decimal` holds decimal numbers. The `m` in `19m` marks a C# decimal literal. This repository uses decimals for money amounts.

A **variable** gives a value a name. `=` assigns a value; `==` asks whether two values are equal. A **statement** performs a step and usually ends in `;`. Braces `{ }` group statements. An **expression** produces a value: `count + 1`, for example. `//` starts a comment for the reader; it does not run.

A **method** is a named piece of behavior. A **parameter** is an input name in its definition; an **argument** is the actual value supplied when calling it. `return` sends the result to the caller. A **local function** is a method-like helper declared inside another method or this small program's top-level code. We use one below.

## Make a practice console

A console program prints text to the terminal. The following PowerShell commands create a uniquely named folder under your temporary directory. They leave application source files alone. Run from the repository root in the same terminal:

```powershell
$meterforgeRoot = (Get-Location).Path
$meterforgePractice = Join-Path ([System.IO.Path]::GetTempPath()) ("meterforge-foundations-" + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $meterforgePractice
dotnet add "$meterforgePractice" reference "$meterforgeRoot/src/MeterForge.Domain/MeterForge.Domain.csproj"
$meterforgePractice
```

The last command prints the folder to open in your editor. Save that path in your notes. `dotnet new` creates a project and a starter `Program.cs`. The reference makes the repository's `Product` and `Money` types available to this practice program. If either command reports an error, resolve it before continuing.

To resume in a new terminal, start from the repository root, set `$meterforgeRoot = (Get-Location).Path`, and set `$meterforgePractice` to your saved folder path as a quoted string. Do not run `dotnet new` again unless you want a fresh practice folder.

Replace the practice folder's `Program.cs` with this C# code:

```csharp
int count = 2;
decimal monthlyAmount = 19m;
string name = "Pro";
bool hasProducts = count > 0;

Console.WriteLine(name);
Console.WriteLine(count + 1);
Console.WriteLine(hasProducts);

if (monthlyAmount < 0)
{
    Console.WriteLine("Rejected");
}
else
{
    Console.WriteLine("Allowed");
}

string NormalizeCode(string code)
{
    return code.Trim().ToUpperInvariant();
}

Console.WriteLine(NormalizeCode(" pro "));

for (int attempt = 1; attempt <= 2; attempt++)
{
    Console.WriteLine(attempt);
}
```

Run it from PowerShell:

```powershell
dotnet run --project "$meterforgePractice"
```

Expected printed lines:

```text
Pro
3
True
Allowed
PRO
1
2
```

`Console.WriteLine` prints one value per line. `count + 1` produces `3` but does not assign it back to `count`, which stays `2`. The `if` condition is false because 19 is not negative, so the `else` block runs. `Trim()` removes spaces at the ends, then `ToUpperInvariant()` uppercases the text. A dot accesses a value's property or method. The loop starts at 1, checks `attempt <= 2` before each repetition, and increases the value with `attempt++` afterward. At 3 the condition is false and the loop ends.

If the compiler reports an error, the program has not run successfully. Check the named file and line for missing quotes, semicolons, or braces before comparing output.

## Connect those words to the real source

Open [Product.cs](../../src/MeterForge.Domain/Catalog/Product.cs). A **class** defines a type whose objects hold data and behavior. `new Product(...)` creates one **object**, an instance of that class. A **constructor** is the setup code with the same name as the class. Its checks run before the object is returned. A **property**, such as `Code`, exposes a named value. `{ get; }` lets other code read the property without assigning a new value to it afterward. `public` makes a member accessible to other code. `var` asks the compiler to infer a variable's type; it does not remove type checking.

You can read `Code = code.Trim().ToUpperInvariant();` now: take the constructor input `code`, normalize it, and store the result in the object's `Code` property. C# distinguishes uppercase and lowercase names.

Replace the practice `Program.cs` with:

```csharp
using MeterForge.Domain.Catalog;
using MeterForge.Domain.Common;

var product = new Product(
    Guid.NewGuid(), "tenant-a", " pro ", " Pro ", new Money(19m, "usd"));

Console.WriteLine(product.Code);
Console.WriteLine($"[{product.Name}]");
Console.WriteLine(product.MonthlyPrice.Currency);
```

`using` lets us use types from a named group of code, a **namespace**, without writing the whole name each time. `Guid.NewGuid()` makes an identifier; its exact value is irrelevant here. `new Money(...)` makes the price value passed into `Product`. `$"[{product.Name}]"` inserts the property into text, with square brackets to make surrounding spaces visible. Run again: expect `PRO`, `[Pro]`, and `USD`, each on its own line. [Money.cs](../../src/MeterForge.Domain/Common/Money.cs) explains the currency result.

## Guided exercise

1. Before editing, predict the three printed lines if code becomes `" starter "`, name becomes `" Starter plan "`, and currency becomes `"eur"`.
2. Change only those three inputs in the practice file. Run it.
3. Compare prediction and output. Point to the assignment in `Product` or `Money` that explains each transformation.

## Your turn: less help

Keep the same program structure. Choose a mixed-case code with spaces, a name with an internal space, and lowercase `usd`. Print the name inside brackets and show that its internal space survives. Explain why changing the name does not change the code. Then write a small `if` in the practice file that prints `Free` for a zero amount and `Paid` for a positive amount. Choose the input and show both paths by running twice. This is a separate practice label, not a requested product feature.

## Hints: reveal only what you need

**Hint 1:** `Trim` changes the ends of text. It does not delete every space in the string.

**Hint 2:** The constructor assigns `Code` from `code` and `Name` from `name`; they are separate inputs. For the last task, store an amount in a `decimal` and compare it with `0m` using `==`.

## Answer key: compare after attempting

Guided output is `STARTER`, `[Starter plan]`, `EUR`. `Product` trims and uppercases the code, only trims the name, and receives the currency normalized by `Money`. One independent choice is `" tEaM "`, `" Team plan "`, `"usd"`, which prints `TEAM`, `[Team plan]`, `USD`.

```csharp
decimal amount = 0m;
if (amount == 0m)
{
    Console.WriteLine("Free");
}
else
{
    Console.WriteLine("Paid");
}
```

This prints `Free`; with `amount = 5m` it prints `Paid`. The helper only distinguishes the chosen zero and positive examples; it is not a full money validation rule.

**Completion demonstration:** with the answer closed, explain `=`, `==`, a method call, and the input-to-property transformation. Predict and verify a new example. Keep both outputs in your notes.

**Revisit tomorrow:** why does `Console.WriteLine(count + 1)` leave `count` unchanged, and which statement would actually increase it?
