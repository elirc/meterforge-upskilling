# Bridge 04: read the C# between an endpoint and its data

**Outcome:** explain application code containing collections, interfaces, nullable results, and awaited calls. Start here before the other bridges if these constructs are unfamiliar. Allow two sessions; no database is required.

## Prerequisite self-check

Explain a variable, an `if` statement, a method argument, and a returned value. Predict what a loop does with three numbers. If these are unclear, revisit your beginner exercises before combining them with asynchronous calls. You do not need to know dependency injection internals to read this lesson.

## Worked example 1: a sequence and a lookup

Run each example separately in a scratch console project's `Program.cs`, with standard implicit usings enabled. These synthetic snippets are independent of the billing application. First predict each output line:

```csharp
var codes = new List<string> { "BASIC", "PRO" };
foreach (var code in codes)
    Console.WriteLine(code);

var prices = new Dictionary<string, int> { ["BASIC"] = 10, ["PRO"] = 49 };
Console.WriteLine(prices["PRO"]);
Console.WriteLine(prices.TryGetValue("TEAM", out var amount));
Console.WriteLine(amount);
```

Exact output:

```text
BASIC
PRO
49
False
0
```

A list keeps a sequence; `foreach` visits its elements. A dictionary associates keys with values. Looking up a missing key with its indexer would throw; `TryGetValue` reports absence through its Boolean result and assigns the value type's default, here `0`. That zero is not evidence of a free product.

Searching a list by checking each element may inspect the entire list. Dictionary lookup usually avoids a full scan using a hash of the key, but hashing, equality checks, collisions, and memory matter. This is cost intuition, not a guarantee that a dictionary makes every workload faster. Iterate a dictionary with `foreach (var pair in prices)` and read `pair.Key` and `pair.Value`; do not make this lesson's output depend on its enumeration order.

## Worked example 2: what assignment copies

```csharp
var first = new List<string> { "BASIC" };
var second = first;
second.Add("PRO");
Console.WriteLine(first.Count);

var originalCount = 1;
var copiedCount = originalCount;
copiedCount++;
Console.WriteLine(originalCount);
Console.WriteLine(copiedCount);
```

Exact output is `2`, `1`, `2`, each on its own line. The list variables hold references to the same list; assignment copies the reference, not the list. The integers are values copied independently.

In this repository, [Product](../../src/MeterForge.Domain/Catalog/Product.cs) is a class, while [Money](../../src/MeterForge.Domain/Common/Money.cs) is a `readonly record struct`, a value type. Product's public properties are get-only, so sharing its reference does not mean callers can assign a new name. A value-type copy also need not deeply clone any reference-type members it contains. Read both the type and its exposed operations before assuming it is mutable or independently copied.

## Worked example 3: a task can already be complete

```csharp
Console.WriteLine("before");
var number = await ReadAsync(CancellationToken.None);
Console.WriteLine(number);

using var stop = new CancellationTokenSource();
stop.Cancel();
try
{
    await ReadAsync(stop.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("cancelled");
}

static Task<int> ReadAsync(CancellationToken token)
{
    token.ThrowIfCancellationRequested();
    Console.WriteLine("read");
    return Task.FromResult(7);
}
```

Exact output:

```text
before
read
7
cancelled
```

`Task<int>` represents eventual completion with an integer result; `Task` without a result represents completion alone. `await` obtains the result when ready and propagates failure. Here the task is already complete. With an incomplete task, an async method can suspend until completion. `await` does not automatically run calls in parallel or prove an adapter uses nonblocking I/O.

Cancellation is cooperative: someone requests it, and the operation must observe it. The second call throws before printing `read`. Cancellation does not reverse work already performed or prove that a remote operation failed.

## Trace the actual application call

Open [ProductService and IProductRepository](../../src/MeterForge.Application/Catalog/ProductUseCases.cs). The interface is a contract listing operations an implementation must provide. Its signatures do not promise persistence or atomic multi-step behavior. The service receives a repository through its constructor; [Program](../../src/MeterForge.Api/Program.cs) selects the in-memory implementation.

`CreateAsync` constructs a product, calls `AddAsync`, awaits completion, then returns that product. `.ConfigureAwait(false)` controls whether the continuation attempts to return to a captured context; it does not create another task or guarantee a new thread.

The [in-memory adapter](../../src/MeterForge.Infrastructure/Catalog/InMemoryProductRepository.cs) checks cancellation, stores the product reference under a `(tenant, product ID)` tuple key, and returns `Task.CompletedTask`. Its dictionary work happens synchronously. `GetAsync` uses `TryGetValue` and returns `Task.FromResult(product)`.

`Product?` means a product reference may be null. The service's expression-bodied `GetAsync` forwards the task without needing its own `async` keyword. The [endpoint](../../src/MeterForge.Api/Catalog/ProductEndpoints.cs) awaits it and translates null to 404. Null here means no matching stored product; it is different from a thrown error or a cancelled operation.

## Guided practice, then independent transfer

1. Annotate the product trace with the argument, return type, and possible absence at each hop. Predict a lookup using the correct ID under a different tenant.
2. Explain why adding `await` around two sequential calls does not make them simultaneous. Point to where cancellation is actually checked.
3. Close this guide and trace [UsageIngestionService](../../src/MeterForge.Application/Usage/UsageIngestionService.cs) into its [store](../../src/MeterForge.Infrastructure/Usage/InMemoryUsageEventStore.cs). Explain the existing-event and absent-event branches, their return values, and the complete lookup key. Identify one guarantee you cannot infer from its interface.

## Hints, exit evidence, and revisit

Hints after attempting: the product key includes the tenant, so a different tenant misses. Usage returns `IsReplay = true` for an existing event and `false` after attempting to add a new one. A thread-safe dictionary does not make the service's separate find-and-add sequence atomic. Do not jump into fixing that race before you can explain it.

Submit predicted versus observed snippet outputs and an unaided usage-call trace. Label outputs as predicted if you could not run them. Revisit after a week: explain a different service's interface, nullable result, cancellation path, and actual adapter behavior without translating the entire file line by line.
