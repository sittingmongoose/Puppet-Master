# LEDGER write rule (mandatory)

Canonical `individual-disposition/LEDGER.jsonl` is a **union** of all disposition rows.

Agents MUST NOT rewrite the whole ledger with only their shard.
Allowed:
- update matching `rows/ROW_*.json` for their events
- write agent-local `deepen/<Agent>/LEDGER.jsonl`
- parent merges into canonical LEDGER

A full replace that drops other cohorts is a campaign integrity failure.

Parent merge MUST preserve immutable `cohort_pins` from `census-adjudication/LEDGER.jsonl` when deepen rows omit multi-cohort pins (e.g. `auth.github.*` must retain `july68`+`july248`).

## Valid buckets (schema)

Canonical rows MAY use `bucket` / `working_bucket`:

- `confirmed_persisted_unregistered`
- `unresolved`
- `august`
- `alias` (**remains valid**; do not fold aliases into unresolved or into the new quarantine bucket)
- `quarantined_not_admitted`

`quarantined_not_admitted` is a valid IndividualDisposition bucket. It is **not admitted** (not registry admit, not denominator admit) and **not unresolved**. Expected disposition is `KEEP_QUARANTINED`. Authority: [`DL-039`](../../../Decision_Log.md), bounded to the exact 54 members pinned by `reports/event-authority-20260911/step-03-holding-bucket-receipt.json`.

Parent merge MUST preserve `quarantined_not_admitted` and `alias` rows. Dropping either cohort, rewriting them back to `unresolved`, or treating them as admitted is a campaign integrity failure.

This write-rule addition does **not** authorize ledger JSONL edits by itself, does **not** claim contract-depth complete, and does **not** claim PNC-019.

Step 5 applies `DL-039` to exactly 54 holding members (28 July40 substantive rows plus 26 emit candidates). Compaction and August2 are excluded from that permission; aliases remain separate. Evidence gaps remain unchanged and classification is not contract-depth closure.
