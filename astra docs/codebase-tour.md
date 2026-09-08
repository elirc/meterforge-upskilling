# Codebase tour: follow decisions and data

Start with a running request, then inspect boundaries. Reading every file alphabetically hides the relationships that matter.

## One complete request: create a product

1. [Program.cs](../src/MeterForge.Api/Program.cs) registers `ProductService` as scoped and `IProductRepository` as a singleton in-memory adapter, then maps product routes.
2. [ProductEndpoints.cs](../src/MeterForge.Api/Catalog/ProductEndpoints.cs) receives the tenant route value and a versioned [request contract](../src/MeterForge.Contracts/V1/Catalog/ProductContracts.cs).
3. [ProductUseCases.cs](../src/MeterForge.Application/Catalog/ProductUseCases.cs) creates an ID, constructs `Money` and `Product`, and calls the repository port.
4. [Money.cs](../src/MeterForge.Domain/Common/Money.cs) and [Product.cs](../src/MeterForge.Domain/Catalog/Product.cs) enforce local business rules.
5. [InMemoryProductRepository.cs](../src/MeterForge.Infrastructure/Catalog/InMemoryProductRepository.cs) stores the object under a tenant-and-product key.
6. The endpoint maps the domain object to a response and returns `201 Created` with a resource location. A rejected domain rule is translated through [BusinessRuleExceptionHandler.cs](../src/MeterForge.Api/Errors/BusinessRuleExceptionHandler.cs).

Sketch this route yourself. Label where user-controlled input enters, where invariants run, where state changes, and where HTTP-specific decisions occur. Then trace a GET from a different tenant. Notice that lookup scoping and authentication are different concerns.

## Project responsibilities

| Project | What to study | What belongs elsewhere |
| --- | --- | --- |
| Domain | Rules, values, transitions, calculations | HTTP statuses, SQL connections, provider clients |
| Application | Use cases and ports for required external capabilities | Provider-specific serialization and database commands |
| Contracts | Explicit versioned input/output shapes | Mutable domain entities and implementation exceptions |
| Infrastructure | In-memory repositories, PostgreSQL adapter, simulated payment provider | Business policy hidden inside an adapter |
| API | Composition, routing, serialization, error translation | New business invariants duplicated per route |

These are responsibilities, not a rule that every route requires five new classes. For example, the invoice preview route directly constructs an invoice. Explain its current narrow purpose before deciding whether a new application service adds value. The [architecture test](../tests/MeterForge.Architecture.Tests/DependencyDirectionTests.cs) checks Domain assembly references; it does not enforce every possible project boundary.

## Read in feature pairs

| Feature | Implementation | Evidence and question |
| --- | --- | --- |
| Subscription lifecycle | [Subscription](../src/MeterForge.Domain/Subscriptions/Subscription.cs) | [Domain tests](../tests/MeterForge.Domain.Tests/Subscriptions/SubscriptionTests.cs): which transitions are legal? |
| Subscription amendments | [Application service](../src/MeterForge.Application/Subscriptions/SubscriptionService.cs), [repository](../src/MeterForge.Infrastructure/Subscriptions/InMemorySubscriptionRepository.cs) | [Amendment tests](../tests/MeterForge.Application.Tests/Subscriptions/SubscriptionAmendmentTests.cs): where is the version check atomic? |
| Usage ingestion | [Service](../src/MeterForge.Application/Usage/UsageIngestionService.cs), [store](../src/MeterForge.Infrastructure/Usage/InMemoryUsageEventStore.cs) | [Tests](../tests/MeterForge.Application.Tests/Usage/UsageIngestionTests.cs): what does sequential replay establish? |
| Tiered rating | [TieredRating](../src/MeterForge.Domain/Rating/TieredRating.cs) | [Tests](../tests/MeterForge.Domain.Tests/Rating/TieredRaterTests.cs): are units conserved at a boundary? |
| Finalization and snapshots | [Invoice](../src/MeterForge.Domain/Invoicing/Invoice.cs), [snapshot](../src/MeterForge.Application/Persistence/InvoiceSnapshot.cs), [PostgreSQL store](../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs) | [Snapshot tests](../tests/MeterForge.Application.Tests/Persistence/InvoiceSnapshotTests.cs): distinguish object conversion from database integrity |
| Payments | [Service](../src/MeterForge.Application/Payments/PaymentService.cs), [attempt](../src/MeterForge.Domain/Payments/PaymentAttempt.cs), [simulator](../src/MeterForge.Infrastructure/Payments/SimulatedPaymentProvider.cs) | [Tests](../tests/MeterForge.Domain.Tests/Payments/PaymentAttemptTests.cs): what evidence exists for retry identity versus network failure? |
| Integrations | [Outbox and delivery models](../src/MeterForge.Domain/Integrations/IntegrationModels.cs), [outbox schema](../src/MeterForge.Infrastructure/Persistence/Migrations/002_outbox.sql) | [Model tests](../tests/MeterForge.Domain.Tests/Integrations/IntegrationModelTests.cs): what additional components would actually publish a message? |

## What runs and what is a building block

Read [Program.cs](../src/MeterForge.Api/Program.cs) before making runtime claims. The default composition uses in-memory repositories and a simulated payment provider. `/health/ready` describes this limitation. A PostgreSQL container in [docker-compose.yml](../docker-compose.yml) provides infrastructure for exercises; starting it does not automatically replace the registered adapters.

The [invoice endpoint](../src/MeterForge.Api/Invoicing/InvoiceEndpoints.cs) is named `finalize-preview`; it builds and finalizes an in-process invoice and returns a summary. The [PostgreSQL store](../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs) is a separate capability. Follow the actual call graph rather than assuming two neighboring features are integrated.

Similarly, an outbox table and a delivery model are not a scheduled publisher, durable retry queue, or verified webhook receiver. Those are extension exercises in [distributed reliability](notes/04-distributed-reliability.md).

## Thirty-minute navigation drill

Spend ten minutes tracing a product request, ten minutes finding the strongest and weakest evidence for usage replay, and ten minutes explaining invoice durability to a teammate. Write down one assumption you corrected. If you cannot find a behavior, search both source and tests before concluding it exists or is absent.

Useful repository-root searches:

```powershell
rg "AddSingleton|AddScoped|Map.*Endpoints" src/MeterForge.Api
rg "IUsageEventStore|IngestAsync" src tests
rg "SaveFinalizedAsync|PostgresInvoiceSnapshotStore" src tests
rg "IfMatch|version_conflict|ProblemDetails" src tests
```

For the next feature, repeat the same method: entry point, policy owner, external boundary, observable result, and evidence.
