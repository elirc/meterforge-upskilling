# Lab 01: add a product description through one complete slice

**Objective:** own a small API feature from a caller's JSON to the response, while keeping business policy in the domain. Suggested time: two sessions.

## Starting points and current behavior

Read [ProductEndpoints](../../src/MeterForge.Api/Catalog/ProductEndpoints.cs), [product contracts](../../src/MeterForge.Contracts/V1/Catalog/ProductContracts.cs), [ProductService and repository port](../../src/MeterForge.Application/Catalog/ProductUseCases.cs), [Product](../../src/MeterForge.Domain/Catalog/Product.cs), and [in-memory repository](../../src/MeterForge.Infrastructure/Catalog/InMemoryProductRepository.cs).

Start tests at [ProductApiTests](../../tests/MeterForge.Api.Tests/Catalog/ProductApiTests.cs), [ProductServiceTests](../../tests/MeterForge.Application.Tests/Catalog/ProductServiceTests.cs), and [ProductTests](../../tests/MeterForge.Domain.Tests/Catalog/ProductTests.cs).

Currently POST creates a product with code, name, and monthly money; GET resolves it using tenant and product ID. The constructor trims the name and normalizes the code. The singleton adapter stores objects in memory. No persisted product description exists. A tenant in the URL is data scoping, not proof of an authenticated caller's permission.

**Proposed extension:** accept an optional description, trim surrounding whitespace, treat blank input as absent, and limit the normalized value to 240 .NET UTF-16 code units. Return the normalized value from POST and GET. Requests omitting the field continue to work. This deliberately narrow limit avoids pretending that string length equals human-visible characters.

## Work sequence

1. Draw POST's path through contract, endpoint, service, domain, and adapter. Mark where IDs are generated and cancellation is passed.
2. Capture a successful POST and its GET using the returned `Location`. Capture a negative price response; find where `price.negative` becomes HTTP 422.
3. Write examples for omitted, null, whitespace-only, 240-unit, and 241-unit descriptions. Choose a stable business error code for excessive length and record it before coding.
4. Add the optional field across the slice. Preserve source compatibility for existing test constructors where practical. Put normalization and the limit in the domain so non-HTTP callers receive the same behavior.
5. Follow the existing explicit response mapping. Keep database or HTTP dependencies out of the domain. A new generic repository or mapping framework is unnecessary for this field.
6. Exercise GET under another synthetic tenant. Record the observed 404 and explain the separate authorization problem it does not solve.

## Acceptance criteria and meaningful tests

- Old JSON without a description still returns 201; its GET succeeds.
- A description with surrounding whitespace round-trips in normalized form.
- Domain cases prove the length boundary and blank policy. At least one HTTP case verifies the stable error code and 422 mapping.
- Reading the created ID under another tenant returns 404.
- A process restart is documented as losing this data under the default adapter.

Run the domain, application, and API product test classes with `--filter FullyQualifiedName~Product`, then run the affected projects. Add only the HTTP cases that protect serialization, routing, and error mapping; do not repeat every string permutation over HTTP.

## Hints and review questions

Trace [BusinessRuleExceptionHandler](../../src/MeterForge.Api/Errors/BusinessRuleExceptionHandler.cs) before inventing endpoint-specific error handling. Decide what existing callers see when the response gains a property. Does your test fail if the endpoint forgets to map the new field? Can a direct application call bypass the rule? Which evidence would change if the repository became PostgreSQL-backed?

**Submit:** one request-path sketch, the patch, test evidence, and a [learning note](../templates/learning-note.md) explaining one assumption you corrected.
