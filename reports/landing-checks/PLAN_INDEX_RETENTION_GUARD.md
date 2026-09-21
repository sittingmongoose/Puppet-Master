# PlanUnit retention validation

`python3 scripts/pm-plan-index.py validate` compares live PlanUnit IDs with
`origin/main:Plans/.plan_index/plan_units.jsonl` using read-only `git show`. An ID
lost from live Plans fails with `plan_unit_removed_without_ledger_decision`, the
exact ID, and its baseline owner path, even when regeneration has already made
the local index agree with the loss. This covers all baseline unit statuses.
Existing parse-error, metadata, and generated-artifact checks still apply.

Fetch origin before validation. A missing, unreadable, empty, malformed, or
duplicate-ID baseline fails closed. Validation never fetches, edits Plans,
regenerates artifacts, refreshes governance, or updates the baseline itself.
The shallow-checkout publication workflow explicitly fetches `origin/main`.

An intentional removal requires a current accepted decision in
`Plans/ledgers/v2/<ledger_id>/records/decisions.jsonl`. Use the existing v2 ledger
core fields plus `decision_type: "plan_unit_removal"` and an exact
`removed_plan_unit_ids` array. For example:

```json
{
  "schema_id": "pm.bootstrap_ledger_record.v1",
  "ledger_id": "pldg-20260921-001-example-removal",
  "record_id": "dec-001",
  "record_type": "decision",
  "status": "accepted",
  "decision_type": "plan_unit_removal",
  "removed_plan_unit_ids": ["EXAMPLE-001"],
  "summary": "Approved reason for removing this exact unit.",
  "source_refs": ["Plans/ledgers/v2/pldg-20260921-001-example-removal/source_shards/authorization.md"],
  "created_at_utc": "2026-09-21T00:00:00Z",
  "updated_at_utc": "2026-09-21T00:00:00Z"
}
```

This is a format example, not an authorization or a new ledger. `ledger_id` must
match the containing ledger directory. Nonempty source references, timestamps,
and a reason or summary are required. Draft, rejected, unrelated, or superseded
decisions do not authorize deletion. `superseded_by` invalidates the old record;
an accepted decision's `supersedes` invalidates matching `record_id` or
`decision_id` values in that ledger. Mentions in prose and wildcard strings do
not authorize IDs. Invalid decision files fail validation when removals require
ledger adjudication. Ledger state projections and event history are not read.

Tests use temporary Git repositories and actual generation and validation:
an unquoted criterion beginning with a backtick drops a unit during YAML
extraction and produces the exact retention failure; properly quoted text
retains the unit. A completely deleted block also fails after fresh generation
has made every local artifact consistent with its absence. Accepted removal
decisions and invalid, stale, or unrelated alternatives exercise the exception.

Validation on this branch: all 18 tests in `tests/test_pm_plan_index.py` passed;
the repository's `pm-plan-index.py validate` passed against the existing index.
No canonical documents, generated indexes, shards, or governance artifacts were
changed by this follow-up.
