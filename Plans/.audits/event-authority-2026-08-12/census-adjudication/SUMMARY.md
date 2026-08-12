# Census Adjudication Summary

```json
{
  "generated_at_utc": "2026-08-12T10:23:31Z",
  "total_rows": 528,
  "category_counts": {
    "exact_excluded": 63,
    "non_exact_excluded": 26,
    "persisted_unregistered_quarantine": 253,
    "registered_keep": 39,
    "rejected_lexical_candidate": 81,
    "alias": 12,
    "unresolved": 54
  },
  "partition_ok": true,
  "collisions": [],
  "admitted_persisted_event_families": 255,
  "auth_github_multi_cohort_ok": true,
  "acceptance_contract_counts_ok": true,
  "individual_disposition_unresolved_bucket_before": 66,
  "individual_disposition_unresolved_bucket_after": 54,
  "individual_disposition_alias_bucket_count": 12,
  "notes": [
    "Reconciled census category rebucket to authoritative individual-disposition ledger.",
    "Census category counts: unresolved=54, alias=12, rejected_lexical_candidate=81, total=528.",
    "Individual-disposition unresolved bucket is 54 (28 NEEDS_OWNER_VETO + 26 NEEDS_MORE_EVIDENCE).",
    "Census unresolved category disposition split: 28 NEEDS_OWNER_VETO + 26 NEEDS_MORE_EVIDENCE.",
    "Census alias category: 12 RECLASSIFY_ALIAS july40 rows with documented alias_target per row."
  ]
}
```
