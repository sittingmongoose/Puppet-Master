# MD-Only Expected-Event Binding Adjudication

**Generated:** 2026-08-12T07:37:10Z

Advisor-2 concern addressed: v3 scan surfaced **31** `md_only` tokens (markdown catalog/matrix expected-event bindings absent from JSON `expected_event_types` reconciliation). Each token now has an explicit adjudication row closing the non-JSON-source gap.

## Summary
- Tokens adjudicated: **31**
- Emit candidates from md_only: **0** (all `emit_candidate=false`)
- Census category changes: **0**

## Adjudication breakdown
- `CONFIRM_CENSUS_PLACEMENT_NOT_EMIT_CANDIDATE`: **30**
- `CONFIRM_EXACT_EXCLUDE_MD_ONLY`: **1**

## Census category breakdown
- `exact_excluded`: **1**
- `persisted_unregistered_quarantine`: **30**

## Note on individual disposition
- Missing from individual-disposition ledger: **['chat.thread.created']** (`chat.thread.created` is `exact_excluded`; md adjudication confirms exclusion, no 12-field admit path).

## Artifact
`MD_ONLY_BINDING_ADJUDICATION.jsonl`
