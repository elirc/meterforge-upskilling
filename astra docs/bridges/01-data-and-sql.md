# Bridge 01: reason about rows before building a repository

**Outcome:** explain what a query returns and which database rule protects a write. Allow two or three sessions. This lesson uses synthetic PostgreSQL tables, deliberately separate from MeterForge's migrations and application schema.

## Prerequisite self-check

Without looking up an answer, describe a list of objects, an object's identifier, and the difference between `null` and zero. Trace how [ProductService](../../src/MeterForge.Application/Catalog/ProductUseCases.cs) calls its repository. If that is difficult, use the [tour](../codebase-tour.md) first. SQL syntax can be new; predicting a small collection of values should feel manageable.

## Three ideas in plain words

A table holds rows with named columns. A **key** identifies a row. When IDs are only unique inside a tenant, the complete key includes both tenant and ID. A **foreign key** requires a referenced row to exist; it does not calculate totals or authorize the caller.

A **join** pairs rows satisfying a condition. It can produce several output rows for one invoice because several lines match it. Missing part of the condition can pair unrelated tenants. A **unique constraint** rejects a second row with the same key even when two callers race; checking first in application code is a separate action that can become outdated.

A **transaction** groups database changes: commit makes them permanent together; rollback discards the changes in that transaction. It does not undo an email or establish that a retried request has identical content.

## Worked example: create a disposable playground

Use an empty, dedicated learning database with a PostgreSQL SQL client. If using the repository's [local Compose service](../../docker-compose.yml), start it from the repository root:

```powershell
docker compose up -d postgres
docker compose exec postgres sh
```

Inside the container, create a separate database and enter its client:

```sh
createdb -U "$POSTGRES_USER" bridge_sql_practice
psql -U "$POSTGRES_USER" -d bridge_sql_practice
```

If the database already exists, enter it directly. Do not change or drop an existing database. Run this setup once per new `psql` session; temporary tables disappear when that session closes. No repository migration is needed.

```sql
CREATE TEMP TABLE lesson_invoice (
  tenant text NOT NULL,
  id integer NOT NULL,
  PRIMARY KEY (tenant, id)
);
CREATE TEMP TABLE lesson_line (
  tenant text NOT NULL,
  invoice_id integer NOT NULL,
  id integer NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  PRIMARY KEY (tenant, invoice_id, id),
  FOREIGN KEY (tenant, invoice_id)
    REFERENCES lesson_invoice (tenant, id)
);
INSERT INTO lesson_invoice VALUES ('a', 7), ('b', 7), ('a', 8);
INSERT INTO lesson_line VALUES
  ('a', 7, 1, 10.00), ('a', 7, 2, 5.00), ('b', 7, 1, 99.00);

SELECT i.tenant, i.id, l.amount
FROM lesson_invoice i
JOIN lesson_line l ON l.tenant = i.tenant AND l.invoice_id = i.id
ORDER BY i.tenant, i.id, l.id;
```

The exact result values are:

| tenant | id | amount |
| --- | --- | --- |
| a | 7 | 10.00 |
| a | 7 | 5.00 |
| b | 7 | 99.00 |

Invoice `a/8` has no matching lines, so this inner join omits it. Keeping every invoice requires a left join:

```sql
SELECT i.tenant, i.id, COALESCE(SUM(l.amount), 0)::numeric(10,2) AS total
FROM lesson_invoice i
LEFT JOIN lesson_line l
  ON l.tenant = i.tenant AND l.invoice_id = i.id
GROUP BY i.tenant, i.id
ORDER BY i.tenant, i.id;
```

Expected rows: `a | 7 | 15.00`, `a | 8 | 0.00`, `b | 7 | 99.00`. `SUM` adds matching amounts; `COALESCE` replaces the absent sum with zero. This is a teaching policy for empty invoices, not a billing rule inferred for the app.

## Guided practice: predict, then run

1. Remove `l.tenant = i.tenant AND` from the first join. Predict all rows before running it. Restore the complete join afterward.
2. Run `INSERT INTO lesson_invoice VALUES ('a', 7);` outside a transaction. Expect a duplicate-key error and still three invoices. Run `SELECT count(*) FROM lesson_invoice;` to verify.
3. Execute the following statements interactively, including `ROLLBACK` after the intentional error:

```sql
BEGIN;
INSERT INTO lesson_invoice VALUES ('a', 9);
INSERT INTO lesson_line VALUES ('a', 9, 1, -1.00);
ROLLBACK;
SELECT count(*) FROM lesson_invoice WHERE tenant = 'a' AND id = 9;
```

The line fails its check constraint; after rollback the count is exactly `0`. Explain why an exception alone is not a useful assertion about stored rows.

## Hints and answer discussion

The incomplete join produces six rows: each tenant's invoice 7 matches all three lines. Its sort has a tie between line IDs 1, so do not claim a particular order for those tied rows. Grouping those incorrect matches would report `114.00` for both tenants. Filtering only the invoice tenant does not repair a missing tenant condition on the line join.

The duplicate key fails because `(a,7)` already exists; `(b,7)` is valid because the complete key differs. The failed transaction discards the earlier header insert too. Replacing the duplicate error with `ON CONFLICT DO NOTHING` would skip the insert; it would not compare the old and new content.

## Independent transfer task

Close this guide. On paper, design tenants, projects, and tasks where both tenants use project ID 1. Give one project two tasks and another none. Write a query returning every project's task count and a constraint that prevents a task referencing a missing project. Then implement it in fresh temporary tables and compare actual rows with your prediction. Hint, only after trying: count the matched task ID, not `COUNT(*)`, when using a left join.

## Exit evidence and revisit

Submit setup SQL, predicted and observed rows, the wrong-join explanation, and rollback evidence. Then read the real [invoice migration](../../src/MeterForge.Infrastructure/Persistence/Migrations/001_invoices.sql) and [adapter](../../src/MeterForge.Infrastructure/Persistence/PostgresInvoiceSnapshotStore.cs). Identify their composite keys, transaction boundary, and conflict clauses. These differ from the temporary exercise in types and fields. Explain why the adapter's conflict clauses do not prove immutable replay; [Lab 04](../labs/04-durable-invoice-persistence.md) develops that problem.

A week later, reproduce the transfer query without notes and explain which test needs a real database. If joins still need copying, repeat with two customers and three orders before adding concurrency.
