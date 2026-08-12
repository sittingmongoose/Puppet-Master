# Individual Disposition Ledger Schema (binding)

Advisor-2 correction: mechanical baseline + OD-EA-003 program choice are **not** individual adjudications.

## Coverage required before any admission/materialization
- Every confirmed persisted-unregistered row (July 248 + owner-accepted auth.github reclassifications currently **253**)
- Every unresolved row (**42** = july40 + 2 emit restores)
- Both August rows (**2**)
Total: **297** independently reasoned rows (295 prior + 2 emit restores).

Exclusions (63 exact working + 26 non-exact) already have separate revalidation ledgers; do not substitute them here.

## Forbidden
- Copy-paste OWNER_DECISION questions across rows
- Treating OD-EA-003 / sequenced-program authorization as per-row disposition
- Inferring owner or producer from namespace, sibling rows, or package membership
- ADMIT / registry append / package veto-as-admission
- Package-by-package owner asks (batch all residuals into one sheet)

## Allowed
- Shared spine **reuse** only with exact cited equality to an existing named artifact/policy
- FAIL / UNKNOWN / OWNER_REQUIRED when evidence is absent (fail closed)

## Buckets

Exactly one `bucket` per row. Valid values:

| bucket | meaning |
|---|---|
| `confirmed_persisted_unregistered` | Working persisted-unregistered quarantine (CPU). Denominator-tracked; not live-registry admit. |
| `unresolved` | Still-open residual. Not closed. Not admitted. |
| `august` | August registered families in IndividualDisposition. |
| `alias` | `RECLASSIFY_ALIAS` compatibility tokens. **Remains valid.** Not admitted. Not unresolved. |
| `quarantined_not_admitted` | Owner-closed non-admitted quarantine. **Not admitted.** **Not unresolved.** Not a live-registry admit. Not a denominator admit. |

`quarantined_not_admitted` is authorized by owner decision **`UNRESOLVED-54-CLOSE-PATH`** option `NEW_NON_ADMITTED_QUARANTINE_BUCKET`. Expected disposition is **`KEEP_QUARANTINED`**. It does not reopen `unresolved`, does not fold into `alias`, and does not admit to the registry or the admitted persisted-event-family denominator.

This schema addition does **not** claim contract-depth complete, seal, validator `pass`, or PNC-019.

## Row object
```json
{
  "event_type": "exact.token",
  "bucket": "confirmed_persisted_unregistered|unresolved|august|alias|quarantined_not_admitted",
  "july_classification": "...",
  "disposition": "KEEP_REGISTERED|KEEP_QUARANTINED|RECLASSIFY_TO_EXCLUDED|RECLASSIFY_ALIAS|NEEDS_OWNER_VETO|NEEDS_MORE_EVIDENCE",
  "disposition_rationale": "row-specific, cites why THIS token gets this disposition",
  "evidence": {
    "owner_doc": {"status":"PASS|FAIL|OWNER_REQUIRED","citation":"Plans/...:L-L or null","note":"..."},
    "producer": {"status":"PASS|FAIL|OWNER_REQUIRED","citation":null,"note":"..."},
    "membership_version": {"status":"...","citation":null,"note":"..."},
    "closed_payload_schema": {"status":"...","citation":null,"note":"..."},
    "scope_identity": {"status":"...","citation":null,"note":"..."},
    "replay_idempotency": {"status":"...","citation":null,"note":"..."},
    "retention": {"status":"...","citation":null,"note":"..."},
    "redaction_custody": {"status":"...","citation":null,"note":"..."},
    "transitions": {"status":"...","citation":null,"note":"..."},
    "consumers_checkpoints": {"status":"...","citation":null,"note":"..."},
    "compatibility_withdrawal": {"status":"...","citation":null,"note":"..."},
    "positive_negative_oracles": {"status":"...","citation":null,"note":"..."}
  },
  "citations_checked": [{"citation":"...","status":"ok|missing|drift","notes":"..."}],
  "owner_veto": null,
  "bulk_registration": false,
  "analogy_used": false,
  "inference_used": false,
  "independent_of_od_ea_003": true,
  "source_overlay": "UnregOverlayXX|null"
}
```

### `owner_veto` (only when disposition is NEEDS_OWNER_VETO)
```json
{
  "stable_id": "OV-EA-<bucket>-<slug>",
  "field_or_decision": "owner|producer|retention|...",
  "question": "row-or-cluster-specific irreducible question",
  "options": ["..."],
  "evidence_gap": "what citation is missing",
  "event_types": ["this row; aggregators may merge identical stable_ids later"]
}
```

## Quality bar
A row is **complete** only if:
1. disposition is independently reasoned for that event_type
2. all 12 evidence fields are present with status + note
3. every PASS has a concrete Plans citation
4. owner/producer PASS citations name authority explicitly (no inference)
5. `analogy_used=false` and `inference_used=false`
6. owner_veto uses a stable_id suitable for one batched sheet

Row completeness here is per-row evidence completeness. It is **not** contract-depth complete and is **not** PNC-019.

## Output layout
`C:/Users/sitti/.omp/run/ea-pnc019-20260812/out/IndividualDisposition/`
- `rows/ROW_<event_type>.json`
- `LEDGER.jsonl`
- `OWNER_VETOES.jsonl` (one object per veto; may repeat stable_id across rows for later collapse)
- `COVERAGE.json`


## Emit restores (Advisor-2)

`testing.capability_policy.updated` and `testing.visibility_policy.updated` enter IndividualDisposition as `bucket: unresolved` emit candidates after false lexical reject correction. Persistence still requires adjudication; no ADMIT.

Owner decision **`UNRESOLVED-54-CLOSE-PATH`** (`NEW_NON_ADMITTED_QUARANTINE_BUCKET`) authorizes moving closed emit/J40 residuals from `unresolved` to `quarantined_not_admitted` with `KEEP_QUARANTINED`. That move is **not** admission and **not** an unresolved residual. `alias` is unchanged.
