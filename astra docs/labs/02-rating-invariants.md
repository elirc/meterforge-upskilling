# Lab 02: make tier policy explicit before calculating money

**Objective:** turn a plausible arithmetic function into a specified business rule with counterexamples. Suggested time: two sessions; prerequisite: Lab 01.

## Starting points and current behavior

Read [TieredRater](../../src/MeterForge.Domain/Rating/TieredRating.cs), [Money](../../src/MeterForge.Domain/Common/Money.cs), [rating endpoint](../../src/MeterForge.Api/Rating/RatingEndpoints.cs), and [TieredRaterTests](../../tests/MeterForge.Domain.Tests/Rating/TieredRaterTests.cs). Compare [RatingApiTests](../../tests/MeterForge.Api.Tests/Rating/RatingApiTests.cs) for the public boundary.

The rater rejects negative quantity, an empty tier collection, and mixed currencies. It sorts limits, prices each tier, and rounds each tier's charge to two decimals with `MidpointRounding.ToEven`. Money allows at most two decimal places. Existing tests cover a first tier, currency mismatch, and crossing a boundary. The rater does not explicitly require full quantity coverage, positive distinct finite limits, exactly one open-ended tier, or nonnegative unit prices.

**Proposed extension:** define a complete graduated schedule: positive, distinct finite limits; nonnegative unit prices; exactly one open-ended tier; one currency. Preserve sorting, accept unsorted valid input, and reject invalid schedules even when quantity is zero. Preserve the current per-tier rounding policy unless you explicitly document a contract change.

## Work sequence

1. Hand-calculate quantities 0, 99, 100, 101, and 150 for 100 units at USD 1.00 followed by USD 0.50. For 150 the expected result is USD 125.00.
2. Try quantity 150 with only a finite tier ending at 100. Predict the currently unpriced remainder and capture the actual result as a regression baseline.
3. Write a policy table for duplicate limits, negative or zero limits, multiple open-ended tiers, missing open-ended tier, and negative unit prices. Choose stable codes for distinct policy errors.
4. Validate the schedule before allocation. Keep validation independent of whether the particular quantity reaches a bad tier.
5. Assert allocation conservation: for every valid example the sum of rated units equals requested quantity. Assert total equals the sum of rounded charges. Use a fixed table or deterministic generated cases, not a second copy of the implementation as the oracle.
6. Explore rounding with quantity 1 and a first tier of 0.5 units, both tiers priced at USD 0.01. Each half-cent rounds to zero; the total is zero under the current policy, whereas rounding the combined unrounded amount would yield USD 0.01. Record why this is a policy decision.

## Acceptance criteria and meaningful tests

- All invalid schedules above reject with the chosen codes, including at zero quantity.
- Boundary examples conserve units and return the manually derived totals.
- Reordering valid input leaves the result unchanged.
- A rounding regression fixes the intended behavior explicitly; a future refactor cannot silently move rounding to the invoice total.
- One API regression proves the new validation reaches the caller through the existing error contract.

Run `dotnet test tests/MeterForge.Domain.Tests --filter FullyQualifiedName~TieredRater` from the repository root. Then run the rating API tests if you changed public behavior. Keep extremely large decimals and overflow behavior as an explicit follow-up decision if you do not handle them in this change.

## Hints and review questions

Money's acceptance of a value does not establish that it is a valid price for every business operation. Why should validation run before the quantity-based early exit? Is tier rounding a finance policy or a performance optimization? Can a currency's real-world fractional precision be inferred from this teaching Money type? What would break if a price later required sub-cent precision?

**Submit:** worked examples, a small policy [decision record](../templates/adr.md), the failing-before/passing-after regression, and the final patch.
