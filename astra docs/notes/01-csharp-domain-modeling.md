# C# and domain modeling: make rules visible

## Read

Open [Money](../../src/MeterForge.Domain/Common/Money.cs), [Product](../../src/MeterForge.Domain/Catalog/Product.cs), [Subscription](../../src/MeterForge.Domain/Subscriptions/Subscription.cs), and [Invoice](../../src/MeterForge.Domain/Invoicing/Invoice.cs). Compare the [subscription tests](../../tests/MeterForge.Domain.Tests/Subscriptions/SubscriptionTests.cs) and [invoice tests](../../tests/MeterForge.Domain.Tests/Invoicing/InvoiceTests.cs) with the rules you infer.

## Explain

`Money` is a value: equality should follow amount and currency. Its `readonly record struct` gives value semantics and prevents ordinary property mutation. `Product` and `Subscription` have identity: two subscriptions with matching fields still represent different subscriptions. A record is a language feature, not a substitute for deciding what equality means in the business.

Constructor validation protects normal construction paths. It is not proof that every representable value is valid. A struct has a default value even if its constructor rejects missing currency: inspect `default(Money)` and reason about how it could enter a public method. Also inspect whether the three-character currency check guarantees alphabetic content. These are concrete review questions; they do not imply the teaching model must implement a full currency registry.

Keep the two-decimal money policy explicit. `decimal` represents decimal fractions more directly than binary floating-point, but it does not choose a rounding policy or model every currency's minor units. The [tiered rater](../../src/MeterForge.Domain/Rating/TieredRating.cs) rounds each tier charge and then totals those charges. Rounding each line versus rounding only a final total can produce different results. State the chosen rule before changing arithmetic.

An aggregate groups state whose rules must be maintained together. An invoice owns its lines, rejects negative or mixed-currency lines, and stops accepting new lines after finalization. Returning a read-only collection prevents callers from adding through that interface; reason separately about whether the elements or any referenced objects remain mutable.

A state machine makes allowed changes explicit. `Subscription.Pause()` means more than assigning an enum: it checks the current state and increments the version. `Version` is useful evidence of change, but the domain increment alone cannot prevent two stored writers from racing. That guarantee belongs at the mutation boundary described in the [concurrency note](03-persistence-concurrency.md).

Pure domain logic is easier to test when time and identity are supplied as values. `Invoice.Finalize(finalizedAt)` accepts a timestamp, while the API chooses the current time. This lets a test prove UTC normalization with a fixed value. An injected clock is useful when orchestration has multiple time-dependent decisions; it need not appear in every class.

## Practice

1. Create an invariant table for three types with columns for input, valid examples, invalid examples, owning method, error code, and existing test. Include whitespace, empty IDs, boundary dates, and values constructed outside the normal path.
2. Draw the subscription transition table. For each operation, identify allowed starting states, resulting state, and version change. Choose one missing negative test without duplicating every assertion across HTTP and Domain tests.
3. Audit `PaymentAttempt.Fail()` and `WebhookDelivery.Fail()/Succeed()` in the [payment](../../src/MeterForge.Domain/Payments/PaymentAttempt.cs) and [integration](../../src/MeterForge.Domain/Integrations/IntegrationModels.cs) models. Write the desired terminal-state policy before deciding whether their current permissiveness is acceptable.
4. Extend a rating test with hand-calculated boundary values. Examine finite tiers that do not cover the requested quantity, repeated boundaries, and a negative unit price. Propose a policy and test the smallest change needed; do not silently invent pricing requirements.

## Evidence of ownership

A good deliverable contains one counterexample, a small policy decision, an implementation at the owning boundary, and a regression that names the business outcome. Explain an alternative: for example, keeping a struct with explicit validation versus using a reference value object. Compare correctness, ergonomics, compatibility, and complexity rather than saying one pattern is always better.

Teach back: “Which invalid state could still exist even if all ordinary constructors validate?” A strong answer follows the actual type and call paths, then distinguishes a demonstrated defect from a hypothetical possibility.
