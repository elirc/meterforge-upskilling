# 3. Send a request and find its data

[Foundations](README.md) · Previous: [Debugging and Git](02-debugging-and-git.md) · Next: [Your first test](04-first-test.md)

**Outcome:** create a product, read it back, and explain why one lookup succeeds and another fails. You need the completed setup from [Foundations](README.md). You can leave the temporary console aside for this lesson.

## Words before requests

A **server** is a running program that receives requests. A **client** sends them; here your PowerShell terminal is the client. **HTTP** is the request/response protocol used by this API. An **API** is an interface programs use to communicate. A **URL** identifies where to send a request, and an **endpoint** is the method-and-path combination the server handles.

`POST` asks this API to create a product. `GET` asks it to return one. A request **body** carries input data. **JSON** is a text format with named fields, such as `{"name":"Pro"}`. A response has a **status code** describing its outcome and may have a body. Here `201` means created, `200` means the read succeeded, and `404` means the requested lookup found nothing.

A **tenant** is one customer organization's scope in this example. We use fictional names such as `learner-a`. A **dictionary** stores values under keys, like a contact list indexed by name. This repository's product key is a pair: tenant ID and product ID. **In memory** means held in the running process rather than saved durably for its next start.

## Worked example: start a server and create one object

In terminal A, from the repository root:

```powershell
dotnet run --project src/MeterForge.Api --launch-profile http
```

Wait for the printed listening URL. The supplied profile uses `http://localhost:5012`. Leave terminal A running; it is now occupied by the server. If startup fails, use the first error and [setup troubleshooting](../first-session.md) before sending requests. If you use a different listening URL, update `$meterforgeBase` below.

Open terminal B at the repository root. Run:

```powershell
$meterforgeBase = 'http://localhost:5012'
$meterforgeBody = @{
    code = ' pro '
    name = ' Practice plan '
    monthlyAmount = 19
    currency = 'usd'
} | ConvertTo-Json
$meterforgeCreated = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$meterforgeBase/api/v1/tenants/learner-a/products/" -ContentType 'application/json' -Body $meterforgeBody
$meterforgeCreated.StatusCode
$meterforgeProduct = $meterforgeCreated.Content | ConvertFrom-Json
$meterforgeProduct | ConvertTo-Json -Depth 4
```

PowerShell variables begin with `$`. `@{ ... }` creates named values. `|` passes one command's output into the next command. `ConvertTo-Json` makes the request text; `ConvertFrom-Json` turns response text back into an object whose fields you can read. `Invoke-WebRequest` sends the request and keeps status, headers, and content available for inspection. `-UseBasicParsing` supports this exercise in Windows PowerShell as well as newer PowerShell.

Expect status `201` and a response containing a newly generated `id`, tenant `learner-a`, code `PRO`, name `Practice plan`, and `monthlyPrice` containing amount `19` and currency `USD`. The ID varies each run. Compare those transformations with lesson 1.

Read back the returned ID:

```powershell
$meterforgeReadUrl = "$meterforgeBase/api/v1/tenants/learner-a/products/$($meterforgeProduct.id)"
$meterforgeRead = Invoke-WebRequest -UseBasicParsing -Uri $meterforgeReadUrl
$meterforgeRead.StatusCode
$meterforgeRead.Content
```

Expect `200` and the same product data. `$($meterforgeProduct.id)` inserts the returned ID into the URL. A GET without an explicit `-Method` uses GET here. Repeating GET reads the stored product; repeating POST creates another product with another ID.

## Follow the data in four small steps

1. [ProductEndpoints.cs](../../src/MeterForge.Api/Catalog/ProductEndpoints.cs) matches the URL and calls `service.CreateAsync(...)`. [ProductContracts.cs](../../src/MeterForge.Contracts/V1/Catalog/ProductContracts.cs) names the request and response fields. A **contract** here is the data shape exchanged with a caller.
2. [ProductUseCases.cs](../../src/MeterForge.Application/Catalog/ProductUseCases.cs) constructs a `Product` with a new ID and a `Money` value, asks the repository to add it, and returns it. A **repository** here is the object used to store and retrieve products; it is a different use of the word from a Git repository.
3. [Product.cs](../../src/MeterForge.Domain/Catalog/Product.cs) checks the input and normalizes the text. [InMemoryProductRepository.cs](../../src/MeterForge.Infrastructure/Catalog/InMemoryProductRepository.cs) stores the object in `_products[(product.TenantId, product.Id)]`.
4. The endpoint maps the object to the response and returns `Results.Created(...)`. GET follows the corresponding `GetAsync` calls and uses `Results.Ok(...)` or `Results.NotFound()` depending on whether a product was found.

For this trace, `async`, `await`, and `Task` mean a method can represent work whose result is obtained through asynchronous calls. Follow the call and returned value first; you do not need scheduling details to complete this lesson. `Product?` means the result may be a product or `null`, the absence of an object. The expression `condition ? first : second` chooses one of two results.

The dictionary's type is `ConcurrentDictionary<(string TenantId, Guid ProductId), Product>`. Read the key/value shape: a pair of tenant and product identifiers maps to one `Product`. `TryGetValue` attempts that lookup and supplies the found value through `out var product`; a missing product leaves it `null` here. Learning concurrent access is a later topic.

## Guided exercise: change one part of the key

Keep the ID but change the tenant to `learner-b`. Predict the response, then run in terminal B:

```powershell
try {
    Invoke-WebRequest -UseBasicParsing -Uri "$meterforgeBase/api/v1/tenants/learner-b/products/$($meterforgeProduct.id)" -ErrorAction Stop
}
catch {
    if ($null -ne $_.Exception.Response) {
        [int]$_.Exception.Response.StatusCode
    }
    else {
        $_.Exception.Message
    }
}
```

`try` runs code that may fail; `catch` handles a reported error. PowerShell reports non-success HTTP responses as errors, so this block prints the status if available. Expect `404`. If it prints a connection message, first check terminal A: no HTTP response is different from a server returning 404. Explain the missing dictionary key as `(learner-b, same ID)` instead of `(learner-a, same ID)`. This demonstrates scoped lookup; it does not establish authenticated access control.

## Your turn: less help

Create a second product under `learner-b` with code `" team "` and a name you choose. Store that response in a different PowerShell variable. Read the new ID under `learner-b`, then under `learner-a`. Record predictions and actual statuses.

Finally, stop terminal A with Ctrl+C, start the same server command again, and request one previously created ID under its original tenant. Reuse the `try/catch` shape to inspect the response. Explain the result using [Program.cs](../../src/MeterForge.Api/Program.cs), which registers `InMemoryProductRepository`, and the dictionary's initialization in that repository. No database is needed for this exercise.

## Hints: reveal only what you need

**Hint 1:** Duplicate the POST example, change the tenant in the URL, and choose a new response variable so you retain the first ID.

**Hint 2:** Both parts of the key must match. A valid product ID alone is not enough.

**Hint 3:** The dictionary is initialized with `new()` in a repository object belonging to the running server. Ask whether restarting reuses that object or constructs a new one.

## Answer key: compare after attempting

The first guided request returns `404`. The independent POST returns `201` and code `TEAM`. Reading its ID under `learner-b` returns `200`; using that ID under `learner-a` returns `404`. After restarting the default server, reading either old product returns `404`, even under its original tenant: the new process has a new empty dictionary. The creation response proved that the earlier server accepted and stored the object in memory, not that it would survive a restart.

**Completion demonstration:** keep the POST status and returned ID, the two lookup statuses, and the restart result. Explain the request-to-storage-to-response path using the four exact source files above. Distinguish an HTTP failure status from a connection failure.

**Revisit tomorrow:** why can two requests with the same product ID return different results? What would need to change for products to survive a server restart?
