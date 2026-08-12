# Census Admission Rule v2 — Direct EventRecord/seglog binding

**Effective:** 2026-08-12T04:12:09Z  
**Rule ID:** `DIRECT_EVENT_TYPE_BINDING_REQUIRED`  
**Advisor-2 blocker:** accepted.

## Correction
The prior residual pipeline promoted tokens when a **nearby persistence cue** appeared in a bounded window (`auth_cue_nearby`, `window_persist_cue`). That heuristic produced false-positive pollution (config keys, panel-state keys, rewrite error codes, method calls) and must **not** feed IndividualDisposition or the fresh denominator.

## Required for any persisted-family review promotion
Direct authoritative binding of the **exact token** as an EventRecord / seglog `event_type` (registry/table/enum/EventRecord producer declaration). The citation must show the binding clause itself.

## Insufficient alone
- Nearby persistence vocabulary without binding this token
- `config:project:` / redb config keys (`Plans/storage-plan.md:920-932`)
- Source-control / panel-state keys
- Structured rewrite errors explicitly outside append-only seglog writers (`Plans/FileSafe.md:1455-1464`)
- Method calls (`Plans/FileSafe.md:770-783` `self.log_blocked_command`)
- Negated mentions ("do not use `<tok>` for ordinary append durability")
- Filenames, schema fields, command ids, catalog entries, examples

## Reject sink
`REJECTED_LEXICAL_CANDIDATE` → `closed-world-census/rejected-lexical/`  
**Not** IndividualDisposition rows. **Not** denominator members.

## Examples rejected under this rule
See `../rejected-lexical/REJECTED_LEXICAL_CANDIDATES.json`.


## Amendment — machine-contract emit binding (2026-08-12T04:22:02Z)

Advisor-2 blocker accepted: blanket lexical rejection is wrong when the active machine contract binds the exact token.

**Direct emit binding (blocks `REJECTED_LEXICAL_CANDIDATE`):**
1. `Plans/Wiring_Matrix.production.json` lists the exact token in `expected_event_types`
2. `effect_contract.effect_kind` is `"event"`
3. `effect_contract.receipt_or_event_refs` contains the exact token

**Disposition:** `UNRESOLVED_EMIT_CANDIDATE` → census-adjudication `unresolved` + IndividualDisposition `unresolved` (emit candidate).

**Still required for persisted-family ADMIT:** EventRecord / seglog `event_type` binding. Emit contract ≠ persistence proof.

**Restored under this amendment:** `testing.capability_policy.updated`, `testing.visibility_policy.updated` (see `MACHINE_CONTRACT_EVENT_BINDING_SCAN.json`).

## Amendment — full 180-source triple-bound scan (2026-08-12T07:02:44Z)

Advisor-2 blocker accepted: v1 binding scan only checked 83 rejected-lexical rows against Wiring_Matrix; that is insufficient before partition seal.

**Full scan scope:** all **180** frozen sources in `CURRENT_SOURCE_INVENTORY.json` (107 JSON with Wiring-style `entries.*` contracts).

**Triple-bound emit candidate (per catalog entry):**
1. Token in `expected_event_types`
2. Same entry's `effect_contract.receipt_or_event_refs` contains the token
3. `effect_contract.effect_kind` is `"event"`

**Result:** 77 triple-bound tokens found; 24 were absent from census-adjudication ledger → merged as `unresolved` emit candidates (`TRIPLE_BOUND_EMIT_MERGE.json`). refs-only tokens enumerated in scan only (not emit candidates).

**Partition impact:** census-adjudication **528** rows; unresolved **66** (40 july40 + 26 emit candidates). Denominator still excludes unresolved until persistence proof.

## Amendment — full 180-source binding scan v3 with MD/JSON reconciliation (2026-08-12T07:17:26Z)

Advisor-2 blocker accepted: v2 triple-bound scan used JSON tree co-location and ignored markdown command-catalog / Wiring_Matrix prose bindings.

**v3 scope:** all **180** frozen sources — 107 JSON, 72 MD, 1 JSONL (`readiness_blockers.jsonl` completeness only).

**Markdown parsers:**
- `UI_Command_Catalog.md` / `Commands_System.md`: `Command ID | Expected events` tables → `md_expected_event_binding`
- `Wiring_Matrix.md`: wiring matrix pipe tables (`expected_event_types`) → `md_expected_event_binding`
- JSON code fences inside `.md` → same JSON scan as standalone files
- `.jsonl` line objects → same JSON token scan

**Triple-bound emit candidate (unchanged, JSON `entries.*` only):**
1. Token in `expected_event_types`
2. Same entry's `effect_contract.receipt_or_event_refs` contains the token
3. `effect_contract.effect_kind` is `"event"`

**MD-only binding (`md_expected_event_binding`):** markdown `expected_event_types` / `Expected events` without same-row `effect_contract` — **not** triple_bound; informational reconciliation only unless later JSON triple-bound found on the same token.

**v3 reconciliation block:** `md_tokens`, `json_tokens`, `triple_bound_tokens`, `md_only`, `json_only`, `md_json_overlap` in `MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` (schema v3).

**v3 result:** triple_bound **77** (unchanged vs v2); **31** md-only tokens surfaced (command-catalog / Wiring_Matrix examples not present in JSON `expected_event_types` scan). Census-adjudication ledger already contains all 77 triple-bound tokens (v2's 24 missing were merged; scan does **not** merge ledger rows).

**Disposition:** triple_bound → `UNRESOLVED_EMIT_CANDIDATE`; md_only → informational reconciliation only.

**Partition seal:** denominator close requires v3 scan artifact pass before seal.

## Amendment — explicit md_only binding adjudication (2026-08-12T07:37:00Z)

Advisor-2 concern accepted: v3 `md_only` reconciliation (31 tokens) is not closed by observation alone.

**Requirement before denominator seal:** each `reconciliation.md_only` token MUST have a row in `MD_ONLY_BINDING_ADJUDICATION.jsonl` with:
- `adjudication` disposition (`CONFIRM_CENSUS_PLACEMENT_NOT_EMIT_CANDIDATE` or `CONFIRM_EXACT_EXCLUDE_MD_ONLY`)
- `emit_candidate=false` (md-only bindings are never automatic triple-bound emit candidates)
- `census_category_unchanged=true` matching `census-adjudication/LEDGER.jsonl`

**Validator gate:** `md_only_bindings_adjudicated_ok` on independent validator receipt.

**Result (2026-08-12):** 31/31 adjudicated; 30 confirm july248 quarantine placement; 1 confirms `chat.thread.created` exact exclusion.

