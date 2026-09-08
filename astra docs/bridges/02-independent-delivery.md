# Bridge 02: turn an unclear request into a reviewable change

**Outcome:** scope, implement, and explain one feature with decreasing help. Allow three sessions. The worked feature is a proposed learning exercise; it is not a claim about current behavior or an instruction to add functionality merely by reading this guide.

## Prerequisite self-check

Trace product creation from [HTTP endpoint](../../src/MeterForge.Api/Catalog/ProductEndpoints.cs) through [service](../../src/MeterForge.Application/Catalog/ProductUseCases.cs) to [domain constructor](../../src/MeterForge.Domain/Catalog/Product.cs). Explain one existing assertion in [ProductApiTests](../../tests/MeterForge.Api.Tests/Catalog/ProductApiTests.cs). If you can navigate but cannot explain the assertion's failure, first make one small domain change and observe its regression test fail and pass.

## Concepts: scope is a technical skill

An ambiguous request mixes a desired outcome with missing decisions. **Acceptance examples** turn it into observations: this input produces that result. A **vertical slice** carries one useful behavior through all necessary layers. Adding every database field first is a horizontal task; letting a caller create and retrieve one new value is a slice.

**Compatibility** asks what happens to an existing caller. **Rollback** asks how to return to an acceptable earlier behavior, including what happens to data and callers. **Review evidence** lets someone check the claim without replaying your entire investigation. These are part of delivery, not paperwork added after coding.

## Worked example: “let customers describe products”

Current products have a code, name, and price. The constructor trims the name, and POST/GET explicitly map a response. The [default repository](../../src/MeterForge.Infrastructure/Catalog/InMemoryProductRepository.cs) holds objects in memory. There is no description field in this baseline.

The request leaves open whether descriptions are required, their limit, whitespace behavior, update support, and whether formatting is allowed. For this exercise, write a small decision record before implementation:

> Add an optional plain string description on creation and return it on POST/GET. Trim surrounding whitespace; treat blank as absent. Limit the normalized value to 240 .NET UTF-16 code units. Omitted input continues to work. Editing existing products, rich text, and durable storage are separate work.

The unit matters: `string.Length` is not a count of human-visible characters. A clear modest contract is easier to verify than an unexplained “240 characters.” See the same proposed feature in [Lab 01](../labs/01-vertical-slice.md).

| Input example | Observable outcome | Best place for core evidence |
| --- | --- | --- |
| Old JSON omits description | Creation remains successful | API compatibility case |
| Description is `"  Starter plan  "` | POST and GET return `"Starter plan"` | Domain rule plus one API round trip |
| Description is whitespace | Normalized value is absent | Domain test |
| Normalized length is 240 / 241 | Accepted / rejected with chosen stable error code | Domain boundary; one API error mapping case |
| Created ID is read under another tenant | 404 | API scoping case |

The last case checks data scoping; it does not prove authorization of a real caller.

Write the implementation route in one sentence: request contract accepts the optional value, endpoint passes it, service supplies it to the domain, domain normalizes and validates it, repository retains the product, response mapping exposes it. You now know where a missing hop could lose information.

The smallest useful slice is create-and-read. A small reviewable sequence is: first agree examples and make the domain behavior explicit; then connect the contract, service, and mappings with API evidence. Each commit should build and remain understandable. Do not introduce a generic mapping or repository framework to avoid passing one field.

## Guided practice: deliver with a checklist, then remove it

1. Create a learning branch and save `git status --short` before editing. Record baseline test results and unrelated existing changes.
2. Write the acceptance table in your own words. Choose an excessive-length error code and state your compatibility assumption. If a real stakeholder is absent, label decisions as exercise assumptions.
3. Add a domain test that exposes a missing rule. Run it and record why it fails. Implement only enough behavior to satisfy the agreed examples, then connect the full slice.
4. Add an API assertion on the returned description, including GET. A status-only test could pass while the mapping drops the value. Reuse focused tests rather than repeating every whitespace permutation over HTTP.
5. From the repository root, run `dotnet test --filter FullyQualifiedName~Product`, then the affected domain, application, contracts-consuming API checks and required repository checks described in the [README](../../README.md). Record actual outcomes; commands you did not run are a plan.
6. Review the diff as a caller: what changes in old requests and new responses? Write a short explanation of the observable behavior, its rule owner, test evidence, and limits.

## Worked rollback and review note

For this isolated branch, a rollback rehearsal means applying a revert of your own feature commits, running the old caller test, then reapplying the feature for the final exercise. Do not reset other people's work. The current in-memory adapter loses products on process restart, so this rehearsal proves code compatibility only. Once a client depends on the description, removal changes its contract; once persistence exists, data retention needs a separate plan.

A useful review note says: “Creation now accepts an optional description, normalizes it in the domain, and returns it on POST and GET. Existing requests remain accepted. Boundary tests and the round trip cover validation and mapping. Storage remains the default in-memory adapter.” Attach actual command outcomes and invite a reviewer to find a missing case. Avoid a list of filenames as the whole explanation.

## Hints and answer discussion

If you do not know where to validate, ask whether a non-HTTP caller should obey the rule. If yes, the domain is a strong candidate; inspect the existing [exception handler](../../src/MeterForge.Api/Errors/BusinessRuleExceptionHandler.cs) for HTTP translation. If the change feels large, remove a separate user outcome from the slice rather than omitting its tests. A “passing” test is weak if deleting the mapping would leave it green.

## Independent transfer task

Without copying the description plan, scope a maximum normalized product-name length as a separate hypothetical request. Choose and justify a bound, identify existing behavior and compatibility risks, write examples, and implement the exercise on an isolated branch. Record one question that truly needs stakeholder input and one routine implementation decision you can make independently. Request review only after a concrete diff and evidence exist.

## Exit evidence and revisit

Submit the acceptance examples, complete slice, failing-then-passing regression, rollback rehearsal, and reviewer feedback with your response. Independent delivery means you can explain and adapt this process on a different feature with modest review help; completing a checklist once is practice.

After a week, scope a new request in 20 minutes without notes. Compare where you still needed help: finding code, choosing behavior, writing tests, or assessing risk. Repeat that specific skill before increasing feature size.
