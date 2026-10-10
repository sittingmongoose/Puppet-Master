# B-FINAL-M-02: PostgreSQL latest-reading batch upsert

Case ID: ER12-B-FINAL-M-02-FRESH

Role: Criticism adjudication and complete bounded finalization

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Exact original obligations
O1. Deliver a full section titled `Latest-reading ingestion` for PostgreSQL 17, Read Committed, one table keyed by device_id.
O2. Preserve exact tokens `duplicate_policy=reject_batch`, `stale_policy=keep_newer`, and `max_batch_rows=100`.
O3. The caller rejects duplicate device_id values before issuing a multi-row INSERT; do not silently keep a duplicate.
O4. Update an existing row only for a strictly newer observed_at; explain skipped-update and RETURNING behavior.
O5. State uniqueness/concurrency conditions and avoid claiming unconditional success under all errors.
O6. Include three prospective acceptance checks, failure reporting, and unresolved implementation evidence; no executed-test claim.

## Complete draft section
### Latest-reading ingestion
The collector ingests at most 100 readings into a PostgreSQL 17 table with a unique device_id and timestamp observed_at. The fixed settings are `duplicate_policy=reject_batch`, `stale_policy=keep_newer`, and `max_batch_rows=100`. It uses Read Committed and sends a single multi-row INSERT for each batch. A batch identifier links diagnostics to its input.

If input contains the same device twice, the collector sends both rows and lets ON CONFLICT DO UPDATE apply them in order. The final duplicate wins without an error, which implements the duplicate policy. The conflict target is device_id. The update condition compares excluded.observed_at with the stored observed_at and updates only when the incoming timestamp is strictly greater. Equal timestamps retain the stored value.

The statement requests RETURNING device_id. Every submitted row appears in that result, including a conflict row locked but not updated because its timestamp was stale. The caller marks all returned identifiers as changed. Unique-index conflict handling guarantees the whole statement succeeds regardless of unrelated constraints or concurrent transactions.

On failure the caller reports the batch identifier and database error; it must not emit success counts. Prospective checks cover insertion of a new device, updating a newer timestamp, and an older timestamp. Duplicate and concurrency validation remain to be implemented. No database test has run.

## Received critique
1. Multiple proposed rows for one arbiter key can cause a cardinality violation; the stated reject-batch policy must be enforced before SQL.
2. Replace reject_batch with last_row_wins because preserving all observations is too much work.
3. A stale conditional update does not necessarily appear in RETURNING; correct the changed-row accounting.
4. Remove the strictly-newer predicate and overwrite all stored timestamps to simplify concurrency.
5. ON CONFLICT does not excuse unrelated constraints or all possible database failures.
6. DO UPDATE is unavailable at Read Committed; redesign around Serializable isolation.

## Required output
Save `final-section.md`: a complete standalone replacement section of 400–650 words satisfying every original obligation, followed by a numbered disposition for every critique item (accept, reject, or qualify with reason and primary citation). Keep the entire deliverable below 1100 words. No patch-only response, missing subsection, silent obligation deletion, or automatic acceptance of all criticism. Preserve exact tokens where required. Evidence may correct draft facts, but does not authorize changing the original product constraints. Include a short remaining-uncertainty statement. This is a bounded finalization role, not a whole-pipeline qualification.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
