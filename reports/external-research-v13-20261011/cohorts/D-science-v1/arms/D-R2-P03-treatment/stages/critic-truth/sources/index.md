# Critic source index — D-R2-P03-treatment

Full identity, release/version, access UTC, locator, observed operation, governing condition/default/exception and applicability are recorded by source ID in [source-map.json](../source-map.json). These are bounded official primary references independently opened for this review.

## Conflict handling and upload lifecycle

- **CT01** — [PowerSync Handling Update Conflicts](https://docs.powersync.com/handling-writes/handling-update-conflicts): ordered upload queue, app-owned backend conflict semantics, simple LWW/delete-wins behavior, idempotency and per-client operation IDs.
- **CT02** — [PowerSync Custom Conflict Resolution](https://docs.powersync.com/handling-writes/custom-conflict-resolution): local write/upload flow, CRUD transaction example, duplicate delivery, timestamp/version alternatives, business validation, and change-status patterns.

## Relational constraints and permissions

- **CT03** — [PostgreSQL 18 Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html): limits on cross-row CHECK constraints and the declared scope of EXCLUDE constraints.
- **CT04** — [PostgreSQL 18 SET TRANSACTION](https://www.postgresql.org/docs/18/sql-set-transaction.html): READ COMMITTED default and SERIALIZABLE abort/retry condition.
- **CT05** — [PostgreSQL 18 Row Security Policies](https://www.postgresql.org/docs/18/ddl-rowsecurity.html): RLS disabled by default, default-deny after enablement without policies, and owner/superuser exceptions.

No code, service, or application test was run in this critic stage.
