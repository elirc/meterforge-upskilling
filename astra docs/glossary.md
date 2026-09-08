# Word help while you learn

Use this as a lookup, not a list to memorize. Read only the words blocking your current exercise. For any unfamiliar word, find a concrete input and output before reading another abstract explanation.

## Your first lessons

| Word | Plain meaning | Example to picture |
| --- | --- | --- |
| Program | Instructions a computer executes | A small program calculates a total and prints it. |
| Value | A piece of information | `3`, `"Pro"`, or `true`. |
| Type | What kind of value something can hold and which operations make sense | An `int` holds a whole number; a `string` holds text. |
| Variable | A name for a value you can use later | After `int quantity = 2;`, `quantity` is 2. |
| Assignment | Put a value into a variable | `quantity = quantity + 3;` replaces 2 with 5. |
| Condition | A question with a true/false answer | `quantity < 0` asks whether the quantity is negative. |
| Branch | Instructions chosen by a condition | An `if` can reject a negative quantity. |
| Method | Named instructions you can call with inputs | A method takes a quantity and returns a charge. |
| Parameter / argument | A named input slot / the value passed into it | A method declares `quantity`; a caller supplies `150`. |
| Return | Give a result back to the caller | Returning 20 is different from printing 20 on the screen. |
| Class / object | A definition / one instance made from that definition | `Product` describes a product; `new Product(...)` creates one. |
| Constructor | Instructions used when making an object | The `Product` constructor checks its name before accepting it. |
| Property | A named piece of an object's exposed data | `product.Name` reads that product's name. |
| Null | No value/object at this location | A lookup might return `null` when no product was found. |
| Exception | A signal that normal execution cannot continue | An invalid currency throws a business-rule exception here. |
| Stack trace | The chain of method calls associated with a failure | Start with the message, then find a relevant line in your source. |
| Compile / run | Translate and check source / execute the program | A syntax error prevents a build; a bad input can fail while running. |
| Test / assertion | An executable example / its expectation | Create a product, then assert its name is the expected text. |
| Repository / diff | A project's tracked history / a comparison of changes | `git diff` shows what you changed before review. |

Start with [reading C#](foundations/01-reading-csharp.md), then [debugging and Git](foundations/02-debugging-and-git.md). You can complete those exercises without knowing the vocabulary below.

## When you reach requests and stored data

| Word | Plain meaning | MeterForge example |
| --- | --- | --- |
| HTTP request / response | A message asking a server to act / its reply | POST a product description; receive JSON and a status. |
| API / endpoint | A way programs communicate / one exposed operation | The product POST route creates a product. |
| JSON | A text format for structured values | `{"name":"Pro"}` contains a name and its value. |
| Status code | A short category for an HTTP outcome | 201 means created; 404 means the requested resource was not found. |
| Dictionary / key | A lookup collection / the value used to find an entry | The in-memory product repository looks up a tenant and product ID. |
| Tenant | One customer's logical area in the application | `learner-a` and `learner-b` should not read each other's products. |
| In memory / durable | Stored in this process / designed to survive process loss | The default product repository forgets products when the API stops. |
| Row / table | One stored record / a collection of records | A SQL product table can contain a row per product. |
| Primary key / foreign key | A row's identity / a reference to another row | An invoice line refers to its invoice. |
| Query / join | Ask for stored data / combine matching records | Join invoice lines to the header they belong to. |
| Transaction | Group writes so they succeed together or are rolled back | Save an invoice header and its lines together. |

Continue with [requests and data](foundations/03-requests-and-data.md) and, once you can explain a lookup, the [SQL bridge](bridges/01-data-and-sql.md).

## When you begin owning features and systems

| Word | Plain meaning | Question to ask in review |
| --- | --- | --- |
| Invariant | A rule that must stay true | Can an issued invoice change? |
| Domain | The business concepts and rules | Which class owns this price rule? |
| Contract / DTO | Promised behavior and shape / data used to cross a boundary | What response may an API caller depend on? |
| Interface / adapter | An expected set of operations / an implementation of them | Can the same use case work with an in-memory or SQL implementation? |
| Dependency injection | Supply an object's collaborators when it is created | Which repository does `Program.cs` supply to this service? |
| Dependency | Something your code needs to do its job | Does this method need storage, a clock, or only its input? |
| Task / await | A representation of an operation's completion / a way to continue after it finishes | Does this repository return an already-completed task or perform actual asynchronous I/O? |
| Cancellation | A request for ongoing work to stop cooperatively | Does the adapter inspect or forward the cancellation token? |
| Idempotency / replay | Repeating a logical operation without an unintended extra effect / that repeat | Do two copies of a usage event count once? |
| Concurrency / atomicity | Overlapping operations / work that acts as one indivisible operation | Can two callers both read "missing" before either writes? |
| Optimistic concurrency | Apply a write only if the stored version still matches the one you used | What happens to the second writer at version 1? |
| Timeout / unknown outcome | Waiting ended / you do not yet know what the remote side did | Could the provider have succeeded before the reply was lost? |
| Outbox | Work recorded durably alongside a state change for later delivery | Does saving an invoice also save its pending event in one transaction? |
| Reconciliation | Compare evidence to resolve disagreement | Which local and provider records explain the unknown result? |
| Observability | Evidence that helps explain a running system's behavior | Which log, measurement, or trace supports this hypothesis? |
| SLO | A stated service reliability target with a measurement window | What do you measure, for which requests, and over what period? |
| Rollout / rollback | Introduce a change / return to an earlier operating state | Can older code still understand the new stored data? |
| ADR | A short record of a decision and why it was chosen | What alternative was rejected, and when should we reconsider? |

For worked collection, reference, interface, and awaited-call examples, use [reading application code](bridges/04-reading-application-code.md).

Reading these definitions is not an exit test. Choose one term you used today, explain it using a concrete MeterForge example without this page, and ask someone to describe a case your explanation missed. Use the [practice loop](practice-and-feedback.md) to turn that gap into your next task.
