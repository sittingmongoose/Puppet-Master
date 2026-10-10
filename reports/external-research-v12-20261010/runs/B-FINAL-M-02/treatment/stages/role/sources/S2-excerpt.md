# S2 evidence — PostgreSQL transaction isolation (PostgreSQL 17)

URL: https://www.postgresql.org/docs/17/transaction-iso.html
Version/scope: PostgreSQL 17 documentation; target Read Committed
Retrieval UTC: 2026-10-10T05:19:15Z
Operation: web_fetch (full page, excerpted here; bounded locator aid, not a mirror)
Locators: 13.2 Transaction Isolation; 13.2.1 Read Committed Isolation Level

## Verbatim short excerpts (source statements)

1. Default level:
> Read Committed is the default isolation level in PostgreSQL.

2. ON CONFLICT DO UPDATE under Read Committed:
> INSERT with an ON CONFLICT DO UPDATE clause behaves similarly. In Read Committed mode, each row proposed for insertion will either insert or update. Unless there are unrelated errors, one of those two outcomes is guaranteed.

3. Conflict from not-yet-visible transaction:
> If a conflict originates in another transaction whose effects are not yet visible to the INSERT, the UPDATE clause will affect that row, even though possibly no version of that row is conventionally visible to the command.

## Applicability note (inference, not source)

Excerpts 1–2 refute redesign around Serializable: DO UPDATE is documented at Read Committed. Excerpt 2's "unless there are unrelated errors" supports stating uniqueness/concurrency conditions without unconditional success. Excerpt 3 informs concurrent-write behavior; it does not promise latency or freedom from all failures.
