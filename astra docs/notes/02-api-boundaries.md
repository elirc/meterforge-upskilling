# API boundaries: define what callers can rely on

## Read

Follow [product endpoints](../../src/MeterForge.Api/Catalog/ProductEndpoints.cs), [product contracts](../../src/MeterForge.Contracts/V1/Catalog/ProductContracts.cs), [subscription endpoints](../../src/MeterForge.Api/Subscriptions/SubscriptionEndpoints.cs), [the exception handler](../../src/MeterForge.Api/Errors/BusinessRuleExceptionHandler.cs), and [API tests](../../tests/MeterForge.Api.Tests/Catalog/ProductApiTests.cs).

## Explain

An HTTP contract includes route, method, input shape, status, body, headers, side effects, and retry behavior. A DTO makes the public shape explicit so internal refactoring does not accidentally serialize new domain properties. It does not guarantee compatibility by itself: renaming a JSON property, tightening validation, or changing an error code may affect a caller even when the C# code compiles.

Product creation currently maps a route tenant and request fields into `ProductService`, returns a response DTO, and provides a location. The repository includes tenant identity in lookup keys. This avoids an obvious cross-tenant lookup mistake, but a caller-controlled route value is not proof of authorization. [Program.cs](../../src/MeterForge.Api/Program.cs) does not configure production authentication. A future authorization slice must bind an authenticated principal to allowed tenant access and test a forbidden tenant request.

Validation has several owners. JSON/type binding handles malformed shapes. Domain methods own rules such as positive amounts or legal state transitions. Application logic owns use-case coordination, such as verifying related records through ports. Authorization checks who may perform the operation. Do not return success merely because each individual object is locally valid: inspect [StartAsync](../../src/MeterForge.Application/Subscriptions/SubscriptionService.cs) to see that a nonempty product ID is not a repository-backed product-existence check.

Error contracts deserve deliberate design. The current business-rule handler maps domain exceptions to `422` with a stable `code` and a trace identifier. Subscription amendments parse `If-Match` as an integer and return a custom `400` body when parsing fails. This is a useful exercise in consistency: describe today's wire behavior before proposing one error envelope. If you adopt a different concurrency status or stronger ETag behavior, update examples and API tests together.

Cancellation is cooperative. Passing a request token through the service to storage lets work notice abandonment. It does not undo an operation already committed by a database or remote provider. A client that lost the response may still need safe replay or lookup. This is why API retries and persistence semantics must be designed together.

## Practice: write the contract before the implementation

Choose subscription product amendment. Fill this table using actual endpoint behavior, then create a second column for your proposed behavior:

| Case | Questions to settle |
| --- | --- |
| Valid request | Where does the caller obtain the version? Which fields return? |
| Missing/malformed version | Which status and stable error code are returned? |
| Stale version | Is the response distinguishable from a business-rule rejection? |
| Unknown subscription | Is the resource absent in this tenant? |
| Cross-tenant request | What establishes permission, beyond route scoping? |
| Unknown replacement product | Is existence and tenant membership checked? |
| Response lost | Can the client determine whether the amendment committed? |

Implement one bounded contract improvement, not the entire table at once. Add an HTTP test when serialization, routing, headers, or middleware is part of the guarantee. Keep dense state permutations in Domain tests.

For a second exercise, write a consumer migration note for a validation tightening. Include an example accepted before and rejected afterward, the affected caller assumption, and how a consumer can detect the new behavior.

## Evidence of ownership

Deliver a request/response example, a negative-case test, a compatibility note, and a statement of the authorization model actually present. A reviewer should be able to determine which failures are caller-correctable and whether a retry is safe.

Teach back: “If the client times out after POST, does it know that nothing happened?” Explain the unknown outcome and identify the storage or provider identity that would make recovery possible.
