# S1 evidence — PostgreSQL INSERT (PostgreSQL 17)

URL: https://www.postgresql.org/docs/17/sql-insert.html
Version/scope: PostgreSQL 17 documentation; target PostgreSQL 17
Retrieval UTC: 2026-10-10T05:19:06Z
Operation: web_fetch (full page, excerpted here; bounded locator aid, not a mirror)
Locators: Description / RETURNING; ON CONFLICT Clause; conflict_action / condition; deterministic statements

## Verbatim short excerpts (source statements)

1. RETURNING:
> Only rows that were successfully inserted or updated will be returned. For example, if a row was locked but not updated because an `ON CONFLICT DO UPDATE ... WHERE` clause condition was not satisfied, the row will not be returned.

2. Atomic outcome with independent-error proviso:
> ON CONFLICT DO UPDATE guarantees an atomic INSERT or UPDATE outcome; provided there is no independent error, one of those two outcomes is guaranteed, even under high concurrency.

3. Conditional update locks all, updates only true:
> Only rows for which this expression returns true will be updated, although all rows will be locked when the ON CONFLICT DO UPDATE action is taken.

4. Deterministic statement / cardinality violation:
> INSERT with an ON CONFLICT DO UPDATE clause is a "deterministic" statement. This means that the command will not be allowed to affect any single existing row more than once; a cardinality violation error will be raised when this situation arises. Rows proposed for insertion should not duplicate each other in terms of attributes constrained by an arbiter index or constraint.

## Applicability note (inference, not source)

Excerpts 1 and 3 support stale-skip RETURNING absence. Excerpt 4 supports pre-SQL duplicate rejection. Excerpt 2 supports no unconditional-success claim. All applied to a single table with a unique device_id arbiter under Read Committed.
