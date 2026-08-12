# Ledger/row integrity (post-owner apply)

**Generated:** 2026-08-12T13:17:00Z

| Check | Result |
|---|---|
| IndividualDisposition rows | 321 unique 321 |
| ROW_*.json 1:1 | 321; missing 0; extra 0 |
| buckets | {'confirmed_persisted_unregistered': 252, 'quarantined_not_admitted': 57, 'alias': 12} |
| dispositions | {'KEEP_QUARANTINED': 309, 'RECLASSIFY_ALIAS': 12} |
| provisional / veto / evidence-gap / unresolved | 0 / 0 / 0 / 0 |
| OWNER_VETOES.jsonl remaining | 0 |
| census rows | 528 |
| census categories | {'registered_keep': 37, 'quarantined_not_admitted': 57, 'persisted_unregistered_quarantine': 252, 'alias': 12, 'exact_excluded': 63, 'non_exact_excluded': 26, 'rejected_lexical_candidate': 81} |
| multi-category event_types | 0 |
| Known37 in live registry | 37/37; extra live [] |
| live registry revision | 2026-08-12.1 n=37 |

No ledger edits in this note.
