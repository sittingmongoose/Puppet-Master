# Phase 1 apply playbook — event-authority-2026-08-12

**Status:** INERT  
**Generated:** 2026-08-12  
**Audit root:** `Plans/.audits/event-authority-2026-08-12/`  
**Runbook binding:** `FIXED_POINT_CLOSURE_RUNBOOK.md` Phase 1 only  
**This file does not apply anything.** It is a field map and refuse contract for a later executor. No executor script is provided.

Current sheet state at generation: all eight `owner_response` values are `null`. Until that changes, every apply path below is forbidden.

---

## 1. Inertness contract

Do not run any mutation described here until **all eight** required decision IDs have a dict `owner_response` whose `chosen_option` is an **exact member** of that decision's `options` array in `OWNER_DECISION_SHEET.json`.

Required IDs (validator `required_decision_ids`):

1. `AUG-CP-WLC-001`
2. `AUG-CP-TWM-001`
3. `EXCL-OD-done_budget_exceeded`
4. `EXCL-OD-stop_identical_failure`
5. `EMIT-PERSIST-026`
6. `COMPACT-001`
7. `J248-VETO-BATCH-252`
8. `J40-VETO-BATCH`

If any ID is missing, duplicated, option-set drifted, or `owner_response` is `null` / non-dict / missing `chosen_option` / `chosen_option` not in `options[]`, **refuse the entire Phase 1 apply**. Do not apply a subset.

`chosen_option` matching is exact string equality against `options[]`, not token prefix. Parentheticals are part of the option string. Example that **passes** the validator: `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`. Example that **fails**: `AFFIRM_DRAFT_AS_PROPOSED`.

Token prefixes (validator `option_token` / August `normalize_chosen_option`) are used only to map August drafts' `veto_status` after a valid exact `chosen_option` exists.

---

## 2. Non-goals (this playbook and any later executor)

- Do not write `owner_response.chosen_option` (owner writes that; this playbook only consumes it).
- Do not apply defaults from `default_if_no_response`.
- Do not seal (`FRESH_CENSUS_DENOMINATOR.json` `closed` stays `false` in Phase 1).
- Do not admit families into `Plans/event_family_registry.json` as a batch, package, or analogy.
- Do not set `disposition=ADMIT_CANDIDATE`.
- Do not set `bulk_registration=true`, `analogy_used=true`, or `inference_used=true`.
- Do not restamp `freeze_digest_sha256`.
- Do not rewrite canonical `individual-disposition/LEDGER.jsonl` from a shard.
- Do not fold the 12 `RECLASSIFY_ALIAS` rows into `J40-VETO-BATCH`.
- Do not infer `COMPACT-001` from `EMIT-PERSIST-026`.
- Do not invent `consumer_id` / `projector_id` / `checkpoint_key` / `checkpoint_schema` / `checkpoint_version`.
- Do not create an executor script in this documentation task.

Phase 1 step 1 in the runbook ("Record `owner_response` + `applied_at_utc`") is split: the owner already recorded `chosen_option`; a later executor may stamp `owner_response.applied_at_utc` **only after** that decision's option apply succeeds. Never stamp `applied_at_utc` on a refused path. Never invent `chosen_option` in order to stamp it.

---

## 3. Preflight checklist — refuse to run

Run these checks in order. Any failure aborts the whole apply. No ledger writes, no draft writes, no denominator writes.

### 3.1 Sheet presence and option-set pin

- `OWNER_DECISION_SHEET.json` exists and `decisions` is a non-empty list.
- Each required ID appears exactly once.
- Each required ID's `options` token set equals the validator pin:

| decision_id | required option tokens |
|---|---|
| `AUG-CP-WLC-001` | `AFFIRM_DRAFT_AS_PROPOSED`, `VETO_KEEP_REGISTERED_PROVISIONAL`, `RECLASSIFY_OUT_OF_REGISTRY` |
| `AUG-CP-TWM-001` | `AFFIRM_DRAFT_AS_PROPOSED`, `VETO_KEEP_REGISTERED_PROVISIONAL`, `RECLASSIFY_OUT_OF_REGISTRY` |
| `EXCL-OD-done_budget_exceeded` | `CONFIRM_EXACT_EXCLUDE`, `RECLASSIFY_TO_NON_EXACT`, `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE` |
| `EXCL-OD-stop_identical_failure` | `CONFIRM_EXACT_EXCLUDE`, `RECLASSIFY_TO_NON_EXACT`, `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE` |
| `EMIT-PERSIST-026` | `ACCEPT_EMIT_OBLIGATION_ONLY`, `DEMAND_PERSISTENCE_PROOF_BEFORE_ANY_ADMIT`, `PER_ROW_VETO_REQUIRED` |
| `COMPACT-001` | `KEEP_UNREGISTERED_NO_PERSIST`, `ESCALATE_AS_PERSISTED_FAMILY`, `RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY` |
| `J248-VETO-BATCH-252` | `CONFIRM_ALL_QUARANTINE_NO_ADMIT`, `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT`, `PER_ROW_REVIEW_REQUIRED` |
| `J40-VETO-BATCH` | `CONFIRM_UNRESOLVED_NO_ADMIT`, `ESCALATE_SUBSET`, `PER_ROW_REVIEW` |

### 3.2 Refuse if any `owner_response` is null

For every required ID:

- `owner_response` is a dict (not `null`, not a string, not a list).
- `owner_response.chosen_option` is a non-empty string.
- `owner_response.chosen_option` is an exact member of that decision's `options` array.

If any of the eight fails: **refuse**. Do not substitute `default_if_no_response`.

### 3.3 Refuse defaults

| decision_id | `default_if_no_response` (NOT auto-applied) |
|---|---|
| `AUG-CP-WLC-001` | `BLOCKED — no seal, no PNC-019, no runtime` |
| `AUG-CP-TWM-001` | `BLOCKED — no seal, no PNC-019, no runtime` |
| `EXCL-OD-done_budget_exceeded` | `CONFIRM_EXACT_EXCLUDE` |
| `EXCL-OD-stop_identical_failure` | `CONFIRM_EXACT_EXCLUDE` |
| `EMIT-PERSIST-026` | `ACCEPT_EMIT_OBLIGATION_ONLY` |
| `COMPACT-001` | `BLOCKED — no seal, no PNC-019, no runtime` |
| `J248-VETO-BATCH-252` | `CONFIRM_ALL_QUARANTINE_NO_ADMIT` |
| `J40-VETO-BATCH` | `CONFIRM_UNRESOLVED_NO_ADMIT` |

A later executor that writes any of those values because `owner_response` was null has violated this playbook.

### 3.4 Refuse bulk-register

Refuse the entire apply if any of the following would be required to "finish" an option:

- Appending or rewriting more than the owner-listed `event_types` (or any event_types, when the option did not list them) into `Plans/event_family_registry.json`.
- Setting `bulk_registration=true` on any IndividualDisposition row.
- Using package/namespace/sibling inference to register, admit, or deepen rows.
- Treating `ESCALATE_SUBSET*` as authority to register the whole batch.
- Treating `AFFIRM_DRAFT_AS_PROPOSED` as a registry append (those two families are already registered; affirm is consumer/checkpoint depth, not admission).
- Inventing `ADMIT` as an exclusion-sheet option.

Allowed registry edits, if any, are only the coherent single-family amendment paths under `RECLASSIFY_OUT_OF_REGISTRY` or an owner-listed `ESCALATE_SUBSET*` type that already has a complete cited 12-field contract. Those paths still fail closed when evidence is missing (see option maps). They are not bulk-register.

### 3.5 Option-specific refuse gates (still abort the whole apply)

These run only after §3.1–3.4 pass. A fail here still refuses **all** mutations, including other decisions that looked clean.

| Gate | Condition | Action |
|---|---|---|
| August AFFIRM missing IDs | Either August `chosen_option` starts with `AFFIRM_DRAFT_AS_PROPOSED` and `owner_response` lacks non-null `consumer_id`, `projector_id`, `checkpoint_key`, `checkpoint_schema`, `checkpoint_version` | Refuse. Do not invent IDs. Do not set `consumers_checkpoints=PASS`. |
| August AFFIRM uncited IDs | AFFIRM IDs present but no `Plans/` citation per ID (descriptive strings such as `"Home workspace layout projector"` / `"terminal GUI"` are not IDs and not citations) | Refuse. |
| August AFFIRM invented_ids | Would require `invented_ids=true` on the draft | Refuse. |
| J248 escalate, no list | `chosen_option` is `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT (owner lists event_types)` and `owner_response.event_types` is missing, null, empty, or not a list of exact ledger tokens | Refuse. Leave all 252 as `NEEDS_OWNER_VETO`. |
| J248 escalate, unknown token | Listed `event_types` contains a token not in the J248 filter (`bucket=confirmed_persisted_unregistered` AND `disposition=NEEDS_OWNER_VETO`) | Refuse. |
| J40 escalate, no list | `chosen_option` is `ESCALATE_SUBSET` and `owner_response.event_types` is missing/null/empty/not a list of exact J40 tokens | Refuse. Leave all 28 as `NEEDS_OWNER_VETO`. |
| J40 escalate, alias/emit leak | Listed types include any of the 12 alias rows or any EMIT-PERSIST-026 type | Refuse. |
| J248/J40/EMIT per-row | `PER_ROW_REVIEW_REQUIRED` / `PER_ROW_REVIEW` / `PER_ROW_VETO_REQUIRED` | Do not mutate those batches. Do not invent per-row answers. See option maps (fail-closed, ledgers unchanged for that batch). Other decisions still abort if **this** gate is treated as "apply the batch anyway". The correct handling is: record that the option is a no-mutation path, then continue mapping other decisions. Do not convert per-row into quarantine-by-default. |
| COMPACT escalate | `ESCALATE_AS_PERSISTED_FAMILY` | Refuse registry/KEEP_REGISTERED/12-field PASS. Current evidence is declared insufficient on the sheet. |
| Pin/derivation break | Any option would drop `july68`/`july248`/`july40`/`august2` pin coverage or change census category without a coherent pin+census+ledger triple | Refuse. |
| Shard replace | Apply would rewrite `individual-disposition/LEDGER.jsonl` from only the touched rows | Refuse. |
| Seal / admit | Apply would set `closed=true` or append unlisted families to the live registry | Refuse. |

Per-row options are **valid chosen_options**. They do not fail §3.2. They fail closed at apply: no batch ledger mutation, no default quarantine.

---

## 4. Shared write rules (when apply is later authorized)

Canonical IndividualDisposition write rule (`individual-disposition/LEDGER_WRITE_RULE.md`):

- Update matching `individual-disposition/rows/ROW_<event_type>.json`.
- Replace **only** the matching `event_type` line in `individual-disposition/LEDGER.jsonl` (union merge).
- Do not drop other cohorts. Preserve `cohort_pins` (especially `auth.github.*` = `july68`+`july248`).
- Optional agent-local `deepen/<Agent>/LEDGER.jsonl` is not a substitute for the canonical ledger.
- `deepen/FixAugustIndivRows/` is a historical shard; canonical August rows are `individual-disposition/rows/ROW_workspace.layout_changed.json` and `ROW_terminal.workgroup_moved.json`. Do not merge the shard over the canonical rows.

Row object constraints (`INDIVIDUAL_DISPOSITION_SCHEMA.md`):

- Allowed `disposition`: `KEEP_REGISTERED` \| `KEEP_QUARANTINED` \| `RECLASSIFY_TO_EXCLUDED` \| `RECLASSIFY_ALIAS` \| `NEEDS_OWNER_VETO` \| `NEEDS_MORE_EVIDENCE`.
- Forbidden: `ADMIT_CANDIDATE`, copy-paste owner questions, namespace inference, bulk registration.
- All 12 evidence fields remain present with `status` ∈ `{PASS, FAIL, OWNER_REQUIRED, UNKNOWN}`.
- `PASS` requires a concrete `Plans/` citation.
- `independent_of_od_ea_003=true`.

Census-adjudication (`census-adjudication/SCHEMA.md`): update the matching `candidate_id`/`event_type` line only. Categories are disjoint. Independent partition derivation (validator, not `PARTITION.json` self-counts) must still hold after any category change.

Exclusion rows use schema `pm.assurance.event_authority.exclusion_revalidation_row.v1`. Do not restamp the 92 already-passing rows. Do not silently restamp `Contracts_V0.md:13279-13312` (stale landing).

August drafts: exactly one JSONL object per event (`workspace.layout_changed`, `terminal.workgroup_moved`). `veto_status` ∈ `{PENDING, AFFIRM_DRAFT_AS_PROPOSED, VETO_KEEP_REGISTERED_PROVISIONAL, RECLASSIFY_OUT_OF_REGISTRY}`. After owner choice, `veto_status` must equal the normalized mapping of that event's `owner_response.chosen_option`. While `owner_response` is unapplied, drafts must remain `PENDING` (validator `august_checkpoint_veto_status_mismatch_owner_choice`).

---

## 5. Coverage matrix (8 IDs × all options)

| decision_id | option token | apply class | seal-prerequisite effect if applied exactly |
|---|---|---|---|
| `AUG-CP-WLC-001` | `AFFIRM_DRAFT_AS_PROPOSED` | mutate drafts+rows | Can clear this row's provisional + `consumers_checkpoints` depth **only if** IDs+citations exist |
| `AUG-CP-WLC-001` | `VETO_KEEP_REGISTERED_PROVISIONAL` | mutate drafts+rows, leave depth open | `registered_contract_depth_incomplete` and `individual_dispositions_provisional` **remain blocking** |
| `AUG-CP-WLC-001` | `RECLASSIFY_OUT_OF_REGISTRY` | coherent registry+census+ledger or refuse | Depth can clear only after live registry and `registered_keep` partition agree; does not admit |
| `AUG-CP-TWM-001` | `AFFIRM_DRAFT_AS_PROPOSED` | same as WLC | same as WLC for `terminal.workgroup_moved` |
| `AUG-CP-TWM-001` | `VETO_KEEP_REGISTERED_PROVISIONAL` | same as WLC | depth **remains incomplete** |
| `AUG-CP-TWM-001` | `RECLASSIFY_OUT_OF_REGISTRY` | same as WLC | same coherence rule |
| `EXCL-OD-done_budget_exceeded` | `CONFIRM_EXACT_EXCLUDE` | mutate exclusion+census disposition | Contributes to 94/94 if the sibling EXCL-OD also confirms/reclasses coherently |
| `EXCL-OD-done_budget_exceeded` | `RECLASSIFY_TO_NON_EXACT` | pin+census+exclusion triple or refuse | Still not admitted |
| `EXCL-OD-done_budget_exceeded` | `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE` | pin+census+exclusion triple or refuse | No registry admit; still outside admitted denominator |
| `EXCL-OD-stop_identical_failure` | `CONFIRM_EXACT_EXCLUDE` | same pattern | same |
| `EXCL-OD-stop_identical_failure` | `RECLASSIFY_TO_NON_EXACT` | same pattern | same |
| `EXCL-OD-stop_identical_failure` | `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE` | same pattern | same |
| `EMIT-PERSIST-026` | `ACCEPT_EMIT_OBLIGATION_ONLY` | keep `NEEDS_MORE_EVIDENCE` | `individual_dispositions_evidence_gap_blocking` **remains** (option text: keep `NEEDS_MORE_EVIDENCE`) |
| `EMIT-PERSIST-026` | `DEMAND_PERSISTENCE_PROOF_BEFORE_ANY_ADMIT` | keep gap; no admit | evidence-gap **remains**; no registry |
| `EMIT-PERSIST-026` | `PER_ROW_VETO_REQUIRED` | **no batch mutation** | fail-closed; 26 rows stay `NEEDS_MORE_EVIDENCE` until 26 new sheet IDs exist |
| `COMPACT-001` | `KEEP_UNREGISTERED_NO_PERSIST` | rebucket out of admitted set only with pin coherence | Outside admitted denominator; no registry |
| `COMPACT-001` | `ESCALATE_AS_PERSISTED_FAMILY` | **refuse escalation** | evidence-gap remains; do not invent contract |
| `COMPACT-001` | `RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY` | rebucket to unresolved / keep gap | no admit |
| `J248-VETO-BATCH-252` | `CONFIRM_ALL_QUARANTINE_NO_ADMIT` | 252× `KEEP_QUARANTINED` | Clears `NEEDS_OWNER_VETO` for 252; **no registry admit**; rows stay in admitted persisted candidate via bucket |
| `J248-VETO-BATCH-252` | `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT` | listed types only, else refuse | Unlisted → quarantine; listed without complete contract → refuse those types (no bulk-register) |
| `J248-VETO-BATCH-252` | `PER_ROW_REVIEW_REQUIRED` | **no batch mutation** | 252 stay `NEEDS_OWNER_VETO` |
| `J40-VETO-BATCH` | `CONFIRM_UNRESOLVED_NO_ADMIT` | 28× `KEEP_QUARANTINED`, bucket stays `unresolved` | Clears veto-blocking for 28; `unresolved_bucket_not_closed` **remains** (bucket still unresolved; no admit) |
| `J40-VETO-BATCH` | `ESCALATE_SUBSET` | listed types only, else refuse | same no-list refuse as J248 |
| `J40-VETO-BATCH` | `PER_ROW_REVIEW` | **no batch mutation** | 28 stay `NEEDS_OWNER_VETO` |

Alias rows (no sheet ID, do not touch): `chat.subagent_spawned`, `chat.thread.worktree_bound`, `filesafe.snapshot_conflict`, `filesafe.snapshot_created`, `filesafe.snapshot_restore`, `lsp.server_crashed`, `lsp.server_started`, `run.node_blocked`, `run.node_unblocked`, `run.remediation_completed`, `run.remediation_started`, `run.scheduler_analysis`.

---

## 6. Decision maps

Paths below are relative to `Plans/.audits/event-authority-2026-08-12/` unless they start with `Plans/`.

Exact `chosen_option` strings are copied from `OWNER_DECISION_SHEET.json` `options[]`.

---

### 6.1 `AUG-CP-WLC-001` — `workspace.layout_changed`

**Membership:** 1 row. `bucket=august`, `disposition=KEEP_REGISTERED`, `provisional=true`, `evidence.consumers_checkpoints.status=OWNER_REQUIRED`.

**Always-touched if any option applies:**

| File | Field |
|---|---|
| `OWNER_DECISION_SHEET.json` | `decisions[decision_id=AUG-CP-WLC-001].owner_response.applied_at_utc` only (do not write `chosen_option`) |
| `august-checkpoint-drafts/AUGUST_CHECKPOINT_DRAFTS.jsonl` | the object with `event_type=workspace.layout_changed` (cardinality must remain 1) |
| `individual-disposition/rows/ROW_workspace.layout_changed.json` | row fields below |
| `individual-disposition/LEDGER.jsonl` | matching `event_type` line only |
| `individual-disposition/COVERAGE.json` | `provisional_count` / `provisional_events` / `by_disposition` after the row change |
| `august-checkpoint-drafts/SUMMARY.md` | human mirror of `veto_status` / `consumers_checkpoints` (not validator input) |

Do not edit `Plans/event_family_registry.json` on AFFIRM or VETO. Do not edit Known37 artifacts.

#### Option A — `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`

**Extra preflight:** `owner_response` must contain non-null strings `consumer_id`, `projector_id`, `checkpoint_key`, `checkpoint_schema`, `checkpoint_version`, each with a `Plans/` citation. Missing any → refuse (do not invent).

| File | Fields to set |
|---|---|
| `AUGUST_CHECKPOINT_DRAFTS.jsonl` (`workspace.layout_changed`) | `veto_status=AFFIRM_DRAFT_AS_PROPOSED`; `consumers_checkpoints=PASS`; `consumer_id`/`projector_id`/`checkpoint_key`/`checkpoint_schema`/`checkpoint_version` = owner values; `invented_ids=false`; `registry_append_authorized=false`; `admit_candidate=false`; `analogy_used=false`; `inference_used=false`; `required_fields.stable_consumer_or_projector_id.status=PASS` with `value` = owner IDs; `required_fields.checkpoint_key_schema_version.status=PASS` with owner checkpoint triple; other `required_fields` PASS only if owner also cited them — otherwise leave `PARTIAL`/`OWNER_REQUIRED` and **refuse AFFIRM** (AFFIRM that cannot produce 12/12 PASS on the IndividualDisposition row will not clear `registered_contract_depth_incomplete`) |
| `rows/ROW_workspace.layout_changed.json` + ledger line | `provisional=false`; `disposition=KEEP_REGISTERED`; `bucket=august`; `working_bucket=august`; `cohort_pins=["august2"]`; `bulk_registration=false`; `evidence.consumers_checkpoints.status=PASS`; `evidence.consumers_checkpoints.citation=<owner Plans citations>`; remaining 11 evidence fields stay `PASS` with existing citations; `owner_veto=null` |
| `census-adjudication/LEDGER.jsonl` (`workspace.layout_changed`) | `category` stays `registered_keep`; `disposition` stays `KEEP_REGISTERED_AUGUST_LIVE`; `cohort_pins` stays `["august2"]` |
| `Plans/event_family_registry.json` | **no edit** |

Validator expectation: draft `veto_status` equals normalized owner choice `AFFIRM_DRAFT_AS_PROPOSED`. Depth can clear for this row only if all 12 evidence cells PASS with citations and `provisional=false`.

#### Option B — `VETO_KEEP_REGISTERED_PROVISIONAL (retain registered_keep; consumers_checkpoints remain UNKNOWN)`

**This is a successful apply that intentionally leaves depth incomplete.** Do not try to clear `registered_contract_depth_incomplete` or `individual_dispositions_provisional`. Do not seal.

| File | Fields to set |
|---|---|
| `AUGUST_CHECKPOINT_DRAFTS.jsonl` (`workspace.layout_changed`) | `veto_status=VETO_KEEP_REGISTERED_PROVISIONAL`; `consumers_checkpoints=UNKNOWN`; `consumer_id=null`; `projector_id=null`; `checkpoint_key=null`; `checkpoint_schema=null`; `checkpoint_version=null`; `invented_ids=false`; `registry_append_authorized=false`; `admit_candidate=false`; `required_fields.*.status` stay `OWNER_REQUIRED`/`PARTIAL` |
| `rows/ROW_workspace.layout_changed.json` + ledger line | `provisional=true`; `disposition=KEEP_REGISTERED`; `bucket=august`; `evidence.consumers_checkpoints.status=OWNER_REQUIRED` (or `UNKNOWN`); citation may remain `Plans/storage-plan.md:1510-1546` as shared mechanics only; `bulk_registration=false`; `owner_veto=null` |
| `census-adjudication/LEDGER.jsonl` | no category change (`registered_keep` / `KEEP_REGISTERED_AUGUST_LIVE`) |
| `Plans/event_family_registry.json` | **no edit** |

Remaining blockers (expected): `registered_contract_depth_incomplete` (this row still in `registered_like` with non-PASS `consumers_checkpoints` and `provisional=true`); `individual_dispositions_provisional` while this row or the sibling August row is provisional.

#### Option C — `RECLASSIFY_OUT_OF_REGISTRY (requires census + registry amendment)`

**Extra preflight:** `owner_response.target_category` must be one of `persisted_unregistered_quarantine`, `unresolved`, `exact_excluded`, `non_exact_excluded` (not `registered_keep`). Missing → refuse. Independent partition `registered_keep = known37 ∪ august2` and pin `august2` currently require this token. Refuse unless the owner also authorizes a coherent triple:

1. Live registry amendment for `event-family-workspace-layout-changed` (`Plans/event_family_registry.json` family object currently at membership lines 2319–2354).
2. `cohort-pins/IMMUTABLE_COHORT_PINS.json` `august2` pin set amendment (do not silently drop pin coverage).
3. Census + IndividualDisposition category/bucket change to `target_category`.

If any of the three is missing, **refuse**. Do not delete historical custody. Do not admit the family into the denominator by this option.

| File | Fields to set (only if triple authorized) |
|---|---|
| `AUGUST_CHECKPOINT_DRAFTS.jsonl` | `veto_status=RECLASSIFY_OUT_OF_REGISTRY`; `consumers_checkpoints=UNKNOWN`; IDs remain null; `registry_append_authorized=false`; `admit_candidate=false` |
| `Plans/event_family_registry.json` | remove or mark withdrawn the `workspace.layout_changed` family object (single-family amendment, not bulk) |
| `census-adjudication/LEDGER.jsonl` | `category=<target_category>`; `disposition` matching target (not `KEEP_REGISTERED_AUGUST_LIVE`); retain any owner-authorized leftover pins; `multi_cohort_reclass` as required to keep pin coverage |
| `rows/ROW_workspace.layout_changed.json` + ledger line | `bucket` leaves `august` (so the token leaves the admitted candidate unless target is `confirmed_persisted_unregistered`); `disposition` ∈ schema allowed set matching target (`KEEP_QUARANTINED` / `RECLASSIFY_TO_EXCLUDED` / `NEEDS_MORE_EVIDENCE`); `provisional=false` only if the row is no longer `registered_like` (not `KEEP_REGISTERED` and not in live registry); `bulk_registration=false` |
| `census-adjudication/COVERAGE.json`, `PARTITION.json` | regenerate from independent derivation after the category change |
| `individual-disposition/COVERAGE.json` | regenerate counts |
| `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` | do **not** flip `closed`; admitted candidate count may drop from 255 if the row leaves `{confirmed_persisted_unregistered, august}` — that rewrite is Phase 1 step 5, still `closed=false` |

Oracle fixtures under `oracle-harness/fixtures/workspace_layout_changed/` are not silently deleted. If registry withdrawal makes harness coverage claims stale, stop and report; do not restamp harness receipts.

---

### 6.2 `AUG-CP-TWM-001` — `terminal.workgroup_moved`

Same three options and the same refuse gates as §6.1, with these substitutions:

| Role | WLC | TWM |
|---|---|---|
| Sheet ID | `AUG-CP-WLC-001` | `AUG-CP-TWM-001` |
| `event_type` | `workspace.layout_changed` | `terminal.workgroup_moved` |
| Draft JSONL object | same file, other row | same file, other row |
| Canonical row | `rows/ROW_workspace.layout_changed.json` | `rows/ROW_terminal.workgroup_moved.json` |
| Registry family | `event-family-workspace-layout-changed` (registry ~2319–2354) | `event-family-terminal-workgroup-moved` (registry ~2357–2392) |
| Draft `owner_veto_items` | `AUG-CP-WLC-IDS`, `AUG-CP-WLC-BIND` | `AUG-CP-TWM-IDS`, `AUG-CP-TWM-BIND` |
| Owned projection | draft `PARTIAL` (`home_workspace_layout` storage-value only) | draft `OWNER_REQUIRED` / `owned_projection_or_output=null` |
| Do not analogize | — | Do not copy WLC consumer IDs onto TWM |

#### Option A — `AFFIRM_DRAFT_AS_PROPOSED (supply explicit consumer/checkpoint IDs in veto response)`

Same field map as WLC Option A on the TWM draft row and `ROW_terminal.workgroup_moved.json`. TWM currently has `owned_projection_or_output=null`; AFFIRM must supply that binding with a `Plans/` citation or refuse. Do not infer `home_workspace_layout` or `terminal_workgroup_record` as the EventRecord consumer output.

#### Option B — `VETO_KEEP_REGISTERED_PROVISIONAL (retain registered_keep; consumers_checkpoints remain UNKNOWN)`

Same as WLC Option B on the TWM artifacts. Depth remains incomplete for this row. If WLC was AFFIRM and TWM is VETO, `individual_dispositions_provisional` still blocks (one provisional row is enough). `registered_contract_depth_incomplete` still blocks while this registered family is non-PASS / provisional.

#### Option C — `RECLASSIFY_OUT_OF_REGISTRY (requires census + registry amendment)`

Same coherence triple as WLC Option C for the terminal family. Independent of WLC; do not reclassify TWM because WLC was reclassified.

---

### 6.3 `EXCL-OD-done_budget_exceeded` — `done.budget_exceeded`

**Membership:** 1 exclusion row + 1 census row. Not in IndividualDisposition. Not in `event_family_registry.json`, `Wiring_Matrix.production.json`, or `storage_value_registry.json`. `ADMIT` is not a sheet option.

**Current exclusion row:** `disposition=OWNER_DECISION_REQUIRED`, `pass=false`, `expected_category=exact_excluded`, `actual_category=exact_excluded`, `cohort_pin=july68`, `cohort_pins=["july68"]`.

**Do not restamp** the 92 passing exclusion rows. Do not restamp citation `Plans/Contracts_V0.md:13279-13312`.

#### Option A — `CONFIRM_EXACT_EXCLUDE`

| File | Fields to set |
|---|---|
| `exclusion-revalidation/EXCLUSION_REVALIDATION_LEDGER.jsonl` (`done.budget_exceeded`) | `disposition=RECONFIRM_EXCLUDE`; `pass=true`; `issues=[]`; `expected_category=exact_excluded`; `actual_category=exact_excluded`; `cohort_pin=july68`; `cohort_pins=["july68"]`; `multi_cohort_reclass=false`; `notes` may cite sheet ID + `chosen_option`; `revalidated_at_utc` = apply time |
| `exclusion-revalidation/EXCLUSION_REVALIDATION_SUMMARY.json` | recompute `pass_count` / `fail_count` / `failures` / `all_revalidated` from all 94 rows (`all_revalidated=true` only if both EXCL-OD rows pass and `pass_count=94`) |
| `census-adjudication/LEDGER.jsonl` (`done.budget_exceeded`) | `category=exact_excluded`; `disposition=RECONFIRM_EXCLUDE`; `cohort_pins=["july68"]` |
| `census-adjudication/COVERAGE.json`, `PARTITION.json` | regenerate if disposition-only (counts unchanged) |
| IndividualDisposition / registry | **no edit** (token stays outside admitted denominator) |

#### Option B — `RECLASSIFY_TO_NON_EXACT`

Moves the token toward july26 non-exact exclusion. Still not admitted.

Independent derivation today: `exact_excluded = july68 − AUTH_GITHUB`, `non_exact_excluded = july26`. A category flip without pin amendment breaks `census_adjudication_independent_set_equality_ok`.

**Refuse unless** owner authorizes a coherent triple: `IMMUTABLE_COHORT_PINS.json` (remove from july68 pin set, add to july26 pin set), census category `non_exact_excluded`, exclusion row `cohort_pin=july26` / `expected_category=non_exact_excluded` / `actual_category=non_exact_excluded` / `disposition=RECONFIRM_EXCLUDE` / `pass=true`. Do not silently drop july68 coverage. Do not add an IndividualDisposition row. Do not register.

| File | Fields to set (only if triple authorized) |
|---|---|
| `cohort-pins/IMMUTABLE_COHORT_PINS.json` | july68 / july26 pin membership for this token |
| `exclusion-revalidation/EXCLUSION_REVALIDATION_LEDGER.jsonl` | `cohort_pin=july26`; `cohort_pins=["july26"]`; `expected_category=non_exact_excluded`; `actual_category=non_exact_excluded`; `disposition=RECONFIRM_EXCLUDE`; `pass=true`; `issues=[]` |
| `exclusion-revalidation/EXCLUSION_REVALIDATION_SUMMARY.json` | recompute 94-row totals (`july68_pin_count`/`july26_pin_count` if those fields track pins) |
| `census-adjudication/LEDGER.jsonl` | `category=non_exact_excluded`; `disposition=RECONFIRM_EXCLUDE`; `cohort_pins=["july26"]` |
| `census-adjudication/COVERAGE.json`, `PARTITION.json` | regenerate from independent derivation |
| Registry / IndividualDisposition | **no edit** |

#### Option C — `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE`

Leave exact-exclusion as a product stance of "not an EventRecord family"; fail-closed unresolved/quarantine. No registry admit.

Same pin-coherence refuse: independent `exact_excluded` currently includes this july68 token. Moving it to census `unresolved` without pin/derivation amendment fails closed.

**Refuse unless** owner authorizes pin retention (`cohort_pins` still include `july68`) plus census category `unresolved` (or `persisted_unregistered_quarantine` if owner explicitly names quarantine) plus exclusion-ledger outcome that still `pass=true` for revalidation completeness. Do not invent persistence to place it in `confirmed_persisted_unregistered`. Do not add it to the admitted `event_types` set. Do not create a registry family.

If the owner does not specify the destination category, refuse (do not guess unresolved vs quarantine).

| File | Fields to set (only if authorized) |
|---|---|
| `exclusion-revalidation/EXCLUSION_REVALIDATION_LEDGER.jsonl` | `disposition` leaves `OWNER_DECISION_REQUIRED`; `pass=true`; `issues=[]`; `actual_category` matches census destination; retain `july68` in `cohort_pins` if required for pin coverage; `multi_cohort_reclass=true` if dual-pinned |
| `census-adjudication/LEDGER.jsonl` | `category` = owner destination; `disposition` matching (`NEEDS_MORE_EVIDENCE` / `KEEP_QUARANTINED` analog on census); not `registered_keep` |
| IndividualDisposition | add a row **only if** destination is a category that IndividualDisposition tracks (`unresolved` or `confirmed_persisted_unregistered`). New row must be independently reasoned, 12 evidence fields present, `bulk_registration=false`, `analogy_used=false`. If a new row cannot be evidenced without inference → refuse rather than copy a sibling |
| Registry | **no edit** |
| `FRESH_CENSUS_DENOMINATOR.json` | token stays out of admitted `event_types` |

---

### 6.4 `EXCL-OD-stop_identical_failure` — `stop.identical_failure`

Same three options and refuse gates as §6.3, on token `stop.identical_failure`.

Citations to preserve (do not restamp): `Plans/Run_Modes.md:257`, `Plans/Executor_Protocol.md:452`. Same-file emit vs `kill.identical_failure` alias conflict is owner-only; do not resolve it by analogy.

Do not edit `done.budget_exceeded` because this ID was answered, or vice versa.

`exclusion_revalidation_incomplete` clears only when **both** EXCL-OD rows have `pass=true`, ledger length is 94, and `EXCLUSION_REVALIDATION_SUMMARY.json` `all_revalidated=true`.

---

### 6.5 `EMIT-PERSIST-026` — 26 unresolved evidence-gap rows

**Filter:** `bucket=unresolved` AND `disposition=NEEDS_MORE_EVIDENCE` AND `event_type != context.compaction.completed`.

**Exact 26 (do not add/remove):**

- `docker.host.access_open_requested`
- `docker.host.instance_lifecycle_requested`
- `docker.host.instance_retention_recorded`
- `docker.host.preflight_requested`
- `docker.host.profile_saved`
- `docker.host.receipt_opened`
- `docker.host.refresh_requested`
- `docker.host.session_launch_requested`
- `docker.hosts_route_opened`
- `github.actions.dispatch_readiness_validated`
- `github.actions.readiness_compared`
- `github.repo.create_requested`
- `health.route_opened`
- `plan_compile.run_created_or_bound`
- `planning.approval_cas_receipt.written`
- `planning.plan_approved`
- `prd_builder.approval_snapshot.created`
- `prd_builder.prd_pack_approved`
- `project.github_repo_bound`
- `remote.reconnect.requested`
- `testing.capability_policy.updated`
- `testing.session.backgrounded`
- `testing.session.opened`
- `testing.session.redaction_inspected`
- `testing.session.watch_started`
- `testing.visibility_policy.updated`

Canonical files per type: `individual-disposition/rows/ROW_<event_type>.json` + matching `LEDGER.jsonl` line + matching `census-adjudication/LEDGER.jsonl` line (`category=unresolved`, `disposition=NEEDS_MORE_EVIDENCE`, `cohort_pins` includes `emit_restore`).

Do not touch `context.compaction.completed`. Do not touch J40 veto rows. Do not registry-admit. Do not move these 26 into `{confirmed_persisted_unregistered, august}` without new EventRecord/seglog proof (none of the three options supplies that proof).

#### Option A — `ACCEPT_EMIT_OBLIGATION_ONLY (keep NEEDS_MORE_EVIDENCE; no registry admit)`

Literal option text wins: **keep** `disposition=NEEDS_MORE_EVIDENCE`.

| File | Fields to set |
|---|---|
| Each of 26 `rows/ROW_*.json` + ledger lines | `disposition=NEEDS_MORE_EVIDENCE` (unchanged); `bucket=unresolved` (unchanged); `bulk_registration=false`; `analogy_used=false`; `inference_used=false`; 12-field Profile A matrix unchanged (`producer=PASS` with existing Wiring_Matrix citations; other cells stay FAIL/OWNER_REQUIRED); `owner_veto=null`; `disposition_rationale` may cite `EMIT-PERSIST-026` / `ACCEPT_EMIT_OBLIGATION_ONLY` without copying a generic question onto every row |
| `census-adjudication/LEDGER.jsonl` (26) | `category=unresolved`; `disposition=NEEDS_MORE_EVIDENCE` |
| Registry | **no edit** |
| `OWNER_VETOES.jsonl` | **no add** (these are evidence-gap, not veto) |

**Fail-closed consequence:** validator `individual_dispositions_evidence_gap_blocking` **remains** (it keys off `disposition==NEEDS_MORE_EVIDENCE`). `unresolved_bucket_not_closed` **remains**. That is the option. Do not "helpfully" flip to `KEEP_QUARANTINED` to clear the blocker.

Stamp `applied_at_utc` on the sheet after recording the stance; the ledger stance is already the option's end state.

#### Option B — `DEMAND_PERSISTENCE_PROOF_BEFORE_ANY_ADMIT`

No registry admit. No bucket promotion. Persistence proof is not present in current evidence (`EVIDENCE_GAP_PACK.md`: 0/27 closable by citation deepening).

| File | Fields to set |
|---|---|
| Each of 26 rows + ledger lines | keep `NEEDS_MORE_EVIDENCE` / `bucket=unresolved`; `bulk_registration=false`; rationale may state owner demands EventRecord/seglog proof before any admit |
| Census 26 | unchanged category `unresolved` |
| Registry | **no edit** |

**Fail-closed consequence:** evidence-gap and unresolved-bucket blockers remain. Do not invent persistence citations. Do not treat future `event_test_requirements` as executed oracles.

#### Option C — `PER_ROW_VETO_REQUIRED (split into 26 individual decisions)` — FAIL CLOSED

**Do not mutate the 26 ledger rows.** Do not default them to quarantine. Do not invent 26 `chosen_option` values.

| File | Action |
|---|---|
| `individual-disposition/LEDGER.jsonl` and `rows/ROW_*.json` | **no change** |
| `census-adjudication/LEDGER.jsonl` | **no change** |
| `OWNER_VETOES.jsonl` | **no batch rewrite** |
| `OWNER_DECISION_SHEET.json` | do not add 26 new IDs in this playbook's mutation set; report that a follow-on sheet split is required. Do not silently expand `decisions[]` (that would drift `required_decision_ids` unless the validator pin is also changed — out of scope). Stamp `applied_at_utc` only to record that the batch option was the split, not that per-row answers exist |

**Fail-closed consequence:** `individual_dispositions_evidence_gap_blocking` remains (26× `NEEDS_MORE_EVIDENCE`). Seal stays blocked. Treating this option as `ACCEPT_EMIT_OBLIGATION_ONLY` is forbidden.

---

### 6.6 `COMPACT-001` — `context.compaction.completed`

**Membership:** 1 IndividualDisposition row. `bucket=confirmed_persisted_unregistered`, `disposition=NEEDS_MORE_EVIDENCE`, Profile B (`producer=FAIL`, `positive_negative_oracles=PASS`). Independent of EMIT-PERSIST-026. Currently **inside** the admitted candidate set because of its bucket (one of 253 unregistered).

Census drift (do not "fix" by analogy): census row currently `disposition=NEEDS_OWNER_VETO` while IndividualDisposition is `NEEDS_MORE_EVIDENCE`. Apply only the fields this option requires; do not rewrite census to veto because siblings are veto.

Deepened receipt (read-only input): `individual-disposition/deepen/PlanIndivU10/rows/ROW_context.compaction.completed.json`. Canonical write target is `individual-disposition/rows/ROW_context.compaction.completed.json` + ledger line.

Conflicting authorities (do not choose except by this sheet): `Plans/Wiring_Matrix.production.json:2807-2860` (no persist) vs `Plans/UI_Command_Catalog.md:776` and `Plans/Automated_Testing_System.md:1371-1398` (persisted lifecycle token). This playbook does not edit those production Plans files.

#### Option A — `KEEP_UNREGISTERED_NO_PERSIST (treat wiring no-persist as controlling; remain outside admitted denominator)`

The token is currently in `confirmed_persisted_unregistered`, which **is** the admitted-candidate bucket. Remaining outside the admitted denominator requires leaving that bucket.

Independent derivation places all july248 pins in `persisted_unregistered_quarantine`. **Refuse** a category/bucket move that drops `july248` pin coverage.

**Refuse unless** owner authorizes pin retention (`cohort_pins` still include `july248`) together with IndividualDisposition `bucket` leaving `{confirmed_persisted_unregistered, august}` (typically `unresolved`) and census `category` matching, so the token is tracked under `persistence_open_not_admitted` rather than admitted `event_types`.

| File | Fields to set (only if pin-coherent) |
|---|---|
| `rows/ROW_context.compaction.completed.json` + ledger line | `bucket=unresolved` (or owner-named non-admitted bucket); `working_bucket` match; `disposition=KEEP_QUARANTINED` or `NEEDS_MORE_EVIDENCE` (owner may keep gap; default to `KEEP_QUARANTINED` only if owner did not require keeping `NEEDS_MORE_EVIDENCE` — this option does not say keep `NEEDS_MORE_EVIDENCE`); `july_classification` not promoted to registered; `bulk_registration=false`; `cohort_pins` retain `july248`; `provisional=false`; do not set any evidence cell to PASS without a new Plans citation |
| `census-adjudication/LEDGER.jsonl` | `category` matches non-admitted destination; retain `july248` pin; `multi_cohort_reclass` as needed |
| `census-adjudication/COVERAGE.json`, `PARTITION.json` | regenerate; expected counts change; independent derivation/pins must be updated in the same apply or **refuse** |
| Registry | **no edit** |
| `FRESH_CENSUS_DENOMINATOR.json` | Phase 1 step 5: token **not** in admitted `event_types`; `closed=false` |

If pin/derivation cannot be updated coherently: **refuse** and leave the row as `NEEDS_MORE_EVIDENCE` / `confirmed_persisted_unregistered`. Do not drop it from the admitted candidate by deleting the ledger row.

#### Option B — `ESCALATE_AS_PERSISTED_FAMILY (requires owner-backed EventRecord/seglog authority + complete EA contract; not supported by current evidence)` — FAIL CLOSED

Sheet text is binding: current evidence does **not** support this escalation.

| File | Action |
|---|---|
| IndividualDisposition row/ledger | **no promotion** to `KEEP_REGISTERED`; **no** 12-field PASS invented; leave `NEEDS_MORE_EVIDENCE` |
| `Plans/event_family_registry.json` | **no append** |
| Census | **no** `registered_keep` |
| Production Plans (`Wiring_Matrix.production.json`, `UI_Command_Catalog.md`, `Automated_Testing_System.md`) | **no edit** |

Stamp `applied_at_utc` only as "escalation refused for lack of contract". `individual_dispositions_evidence_gap_blocking` remains for this 1 of 27. Do not treat this option as AFFIRM or as KEEP_UNREGISTERED_NO_PERSIST.

#### Option C — `RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY (keep NEEDS_MORE_EVIDENCE / quarantine; no admit)`

Keep `NEEDS_MORE_EVIDENCE`. No admit. Rebucket to `unresolved` so the token is not an admitted persisted family, subject to the same july248 pin-coherence refuse as Option A.

| File | Fields to set (only if pin-coherent) |
|---|---|
| Canonical row + ledger line | `bucket=unresolved`; `disposition=NEEDS_MORE_EVIDENCE`; `bulk_registration=false`; retain `july248` pin; Profile B evidence unchanged |
| Census | `category=unresolved`; `disposition=NEEDS_MORE_EVIDENCE` (this also clears the census veto drift for this token) |
| Registry | **no edit** |

**Fail-closed consequence:** evidence-gap blocking remains (disposition kept). Unresolved bucket remains open for this row. That is the option.

---

### 6.7 `J248-VETO-BATCH-252`

**Filter:** `bucket=confirmed_persisted_unregistered` AND `disposition=NEEDS_OWNER_VETO` = **252**. Enumerated in `individual-disposition/J248_J40_OWNER_PACK.md` and mirrored in `individual-disposition/OWNER_VETOES.jsonl`. Sheet explicit membership 0/252.

Does **not** include `context.compaction.completed` (that is `COMPACT-001`). Includes the five `auth.github.*` dual-pin rows; preserve `cohort_pins=["july68","july248"]`.

These 252 are already in the admitted-candidate buckets. `CONFIRM_ALL_QUARANTINE_NO_ADMIT` means **no live-registry admit**, not "remove from denominator".

#### Option A — `CONFIRM_ALL_QUARANTINE_NO_ADMIT`

| File | Fields to set (252 times, per `event_type`) |
|---|---|
| `individual-disposition/rows/ROW_<event_type>.json` | `disposition=KEEP_QUARANTINED`; `bucket=confirmed_persisted_unregistered` (unchanged); `working_bucket` unchanged; `provisional=false`; `bulk_registration=false`; `analogy_used=false`; `inference_used=false`; `cohort_pins` preserved; 12 evidence cells **not** flipped to PASS; `owner_veto` may remain as historical question object or be set `null` after the batch stance supersedes it — if set null, also drop the matching `OWNER_VETOES.jsonl` object; do not invent new veto questions |
| `individual-disposition/LEDGER.jsonl` | replace those 252 lines only |
| `individual-disposition/OWNER_VETOES.jsonl` | remove or supersede the 252 matching `event_types` objects (file is one object per veto row; `stable_id` may repeat). Remaining veto objects should be the 28 J40 rows if J40 is not also quarantined in the same apply |
| `individual-disposition/COVERAGE.json` | regenerate: `needs_owner_veto_count` drops by 252; add/keep a `KEEP_QUARANTINED` count |
| `census-adjudication/LEDGER.jsonl` (252) | `category=persisted_unregistered_quarantine` (unchanged); `disposition` aligned to quarantine-confirmed (not `NEEDS_OWNER_VETO`); `cohort_pins` preserved; `auth.github.*` stay `multi_cohort_reclass=true` with `july68`+`july248` |
| `census-adjudication/COVERAGE.json` | regenerate dispositions; category counts unchanged |
| Registry | **no edit** |

Do not rewrite the whole IndividualDisposition ledger from these 252 rows.

#### Option B — `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT (owner lists event_types)` — FAIL CLOSED without a list

**If `owner_response.event_types` is missing, null, empty, not a list, or contains any token outside the 252:** refuse this decision (and the whole apply per §3.5). Leave all 252 as `NEEDS_OWNER_VETO`. Do not quarantine-by-default. Do not register anything.

**If a valid list exists:**

- Unlisted members of the 252: apply Option A (`KEEP_QUARANTINED`, no registry) to those types only.
- Listed members: **still refuse bulk-register**. Registry admit of a listed type requires a complete cited 12-field contract, named owner, named producer, payload schema, and live registry family object **already evidenced**. Current J248 rows have `owner_doc=OWNER_REQUIRED` and most other cells `FAIL`. That is not a complete contract.
- Therefore listed types with incomplete evidence: **do not** append `Plans/event_family_registry.json`, **do not** set `KEEP_REGISTERED`, **do not** set evidence PASS. Report them as blocked listed escalations. Do not convert the listed set into a package admit.

If every listed type is evidence-incomplete, the listed branch is a no-mutation fail-closed path and the unlisted branch may still quarantine — but only if the owner list was valid. If the executor cannot split listed vs unlisted without inventing authority, refuse the whole J248 apply.

#### Option C — `PER_ROW_REVIEW_REQUIRED` — FAIL CLOSED

**Do not mutate the 252 rows.** Do not apply Option A as a default. Do not invent 252 sheet IDs inside this apply.

| File | Action |
|---|---|
| IndividualDisposition rows/ledger | **no change** (`NEEDS_OWNER_VETO` remains) |
| `OWNER_VETOES.jsonl` | **no change** |
| Census | **no change** |
| Registry | **no edit** |

**Fail-closed consequence:** `individual_dispositions_owner_veto_blocking` remains (252 of 280). Sheet `chosen_option` may exist (so `owner_decision_sheet_unresolved` can clear) while veto-blocking does not. Seal stays blocked. That is the option.

---

### 6.8 `J40-VETO-BATCH`

**Filter:** `bucket=unresolved` AND `disposition=NEEDS_OWNER_VETO` = **28**. Enumerated in `J248_J40_OWNER_PACK.md`.

Exact 28:

`chat.message.submitted`, `chat.thread_title_generated`, `diag.compaction_immune_overflow`, `docker.auth.browser_login.cancelled`, `docker.auth.browser_login.device_code_issued`, `docker.auth.browser_login.polling`, `docker.auth.browser_login.started`, `docker.auth.browser_login.timed_out`, `docker.auth.capability_validated`, `docker.auth.failed`, `docker.publish.blocked`, `docker.publish.failed`, `docker.repository.create.confirmation_requested`, `filesafe.blocked`, `format.error`, `media.artifact_cleanup_required`, `node.prerequisite_resolved`, `provider.request_cancelled`, `provider.request_queued`, `runtime_continuity.actor_bound`, `runtime_continuity.redaction_applied`, `runtime_continuity.replay_checkpointed`, `runtime_continuity.route_resolved`, `skill.invocation_timed_out`, `subagent.parallel_group_failed`, `unraid.template.generation.completed`, `usage.cost_adjusted`, `usage.cost_clamped`.

**Do not include** the 12 alias rows or the 26 EMIT-PERSIST rows. Census still shows `NEEDS_OWNER_VETO` for `chat.subagent_spawned` / `chat.thread.worktree_bound`; IndividualDisposition is `RECLASSIFY_ALIAS`. Do not fold those two into this batch.

These 28 are **not** in admitted-candidate buckets.

#### Option A — `CONFIRM_UNRESOLVED_NO_ADMIT`

Confirm they remain unresolved / not registry-admitted.

| File | Fields to set (28 times) |
|---|---|
| `rows/ROW_<event_type>.json` + ledger lines | `disposition=KEEP_QUARANTINED`; **`bucket=unresolved` unchanged**; `working_bucket=unresolved`; `cohort_pins` retain `july40`; `bulk_registration=false`; do not flip evidence to PASS; `provisional=false` |
| `OWNER_VETOES.jsonl` | remove/supersede the 28 matching objects |
| `census-adjudication/LEDGER.jsonl` | `category=unresolved` unchanged; `disposition` aligned away from `NEEDS_OWNER_VETO` (quarantine-confirmed unresolved); `cohort_pins=["july40"]` |
| Registry | **no edit** |
| Admitted denominator | these 28 stay out of `event_types` |

**Fail-closed consequence:** validator `unresolved_bucket_not_closed` keys off `bucket==unresolved`, not disposition. This option **does not** empty the unresolved bucket and **does not** clear that blocker. It does clear `NEEDS_OWNER_VETO` for these 28. Do not rebucket into `confirmed_persisted_unregistered` to manufacture seal readiness (that would invent persistence).

#### Option B — `ESCALATE_SUBSET` — FAIL CLOSED without a list

**If `owner_response.event_types` is missing, null, empty, not a list, contains a non-J40 token, contains an alias, or contains an EMIT-PERSIST token:** refuse. Leave all 28 as `NEEDS_OWNER_VETO`.

**If a valid list exists:** unlisted 28-N get Option A (`KEEP_QUARANTINED`, bucket `unresolved`, no admit). Listed types still require a complete cited EA contract before any registry admit; current rows do not have it. Do not bulk-register the listed subset. Evidence-incomplete listed types remain `NEEDS_OWNER_VETO` (fail closed) rather than becoming `KEEP_REGISTERED`.

#### Option C — `PER_ROW_REVIEW` — FAIL CLOSED

**Do not mutate the 28 rows.** Do not default to Option A. Do not invent 28 sheet IDs.

| File | Action |
|---|---|
| IndividualDisposition / census / `OWNER_VETOES.jsonl` | **no change** |
| Registry | **no edit** |

**Fail-closed consequence:** `individual_dispositions_owner_veto_blocking` remains for these 28. `unresolved_bucket_not_closed` remains. Seal stays blocked.

---

## 7. After option maps — Phase 1 steps 5–6 (still not seal, still not admit)

Only if §3 preflight passed and every chosen option's map was applied or honestly fail-closed as specified.

### 7.1 Proposed admitted `event_types` (runbook Phase 1 step 5)

File: `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json`  
Schema: `pm.assurance.event_authority.fresh_census_denominator.v2`

| Field | Required value |
|---|---|
| `closed` | `false` (do not seal) |
| `freeze_digest_sha256` | unchanged (`b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56` at generation; pin to `closed-world-census/CURRENT_SOURCE_INVENTORY.json` `canonical_digest_sha256` — do not restamp) |
| `admitted_persisted_event_families.event_types` | exact set of `individual-disposition/LEDGER.jsonl` `event_type` where `bucket ∈ {confirmed_persisted_unregistered, august}`; nonempty; no duplicates; no extras |
| top-level `event_types` | same set (alias still consumed) |
| `admitted_persisted_event_families.persistence_open_not_admitted` | unresolved / alias / emit-open rows tracked here, **not** in admitted `event_types` |
| `admitted_persisted_event_families.composition.unresolved` | must not be a positive admitted composition (validator `denominator_admitted_includes_unresolved`) |

Do not admit Known37 `registered_keep`, july68/july26 exclusions, rejected lexical candidates, alias rows, or unresolved rows.

If August `RECLASSIFY_OUT_OF_REGISTRY` or COMPACT rebucket removed a token from those buckets, the candidate count will not be 255. Write the exact post-apply set. Do not pad to 255.

If the derived set is empty: **do not write it and do not seal** (`proposed_admitted_event_types_empty` is pre-seal).

### 7.2 Diagnostic validator (runbook Phase 1 step 6)

```bash
python Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py
```

Required before Phase 2, when options actually clear blockers:

- `named_checks.seal_prerequisites_met=true`
- `named_checks.fresh_denominator_closed=false`
- `pass=false` solely from the open-denominator family

This playbook **does not claim** those outcomes. Several valid owner options (VETO_KEEP_REGISTERED_PROVISIONAL, PER_ROW_*, ESCALATE without list, ACCEPT_EMIT_OBLIGATION_ONLY, ESCALATE_AS_PERSISTED_FAMILY, CONFIRM_UNRESOLVED_NO_ADMIT) **intentionally leave** `seal_prerequisites_blocking_errors` nonempty. If they do, **do not seal**. Do not reopen this playbook to invent clearing edits.

---

## 8. Files-touched inventory

### 8.1 Always (sheet stamp only, after successful per-decision apply)

- `OWNER_DECISION_SHEET.json` — `applied_at_utc` only
- `OWNER_DECISION_SHEET.md` — optional human PENDING→applied mirror (validator reads JSON only)

### 8.2 August (`AUG-CP-WLC-001`, `AUG-CP-TWM-001`)

- `august-checkpoint-drafts/AUGUST_CHECKPOINT_DRAFTS.jsonl`
- `august-checkpoint-drafts/SUMMARY.md`
- `individual-disposition/rows/ROW_workspace.layout_changed.json`
- `individual-disposition/rows/ROW_terminal.workgroup_moved.json`
- `individual-disposition/LEDGER.jsonl` (two lines)
- `individual-disposition/COVERAGE.json`
- `census-adjudication/LEDGER.jsonl` (two lines; more if RECLASSIFY)
- `census-adjudication/COVERAGE.json` / `PARTITION.json` (if category changes)
- `Plans/event_family_registry.json` — **only** `RECLASSIFY_OUT_OF_REGISTRY` with pin triple
- `cohort-pins/IMMUTABLE_COHORT_PINS.json` — **only** that same triple

### 8.3 Exclusion (`EXCL-OD-*`)

- `exclusion-revalidation/EXCLUSION_REVALIDATION_LEDGER.jsonl` (two lines max)
- `exclusion-revalidation/EXCLUSION_REVALIDATION_SUMMARY.json`
- `census-adjudication/LEDGER.jsonl` (two lines)
- `census-adjudication/COVERAGE.json` / `PARTITION.json` (if category/pin changes)
- `cohort-pins/IMMUTABLE_COHORT_PINS.json` — only non-exact / unresolved reclass triples
- IndividualDisposition new rows — only unresolved/quarantine reclass if evidenced

### 8.4 EMIT-PERSIST-026

- 26× `individual-disposition/rows/ROW_*.json`
- `individual-disposition/LEDGER.jsonl` (26 lines) — **no change** on `PER_ROW_VETO_REQUIRED`
- 26× census lines — **no change** on `PER_ROW_VETO_REQUIRED`

### 8.5 COMPACT-001

- `individual-disposition/rows/ROW_context.compaction.completed.json`
- `individual-disposition/LEDGER.jsonl` (one line)
- `census-adjudication/LEDGER.jsonl` (one line)
- coverage/partition if bucket/category changes
- **no** production Plans edits; **no** registry append on `ESCALATE_AS_PERSISTED_FAMILY`

### 8.6 J248 / J40

- Up to 252+28 `individual-disposition/rows/ROW_*.json`
- `individual-disposition/LEDGER.jsonl` (those lines only)
- `individual-disposition/OWNER_VETOES.jsonl`
- `individual-disposition/COVERAGE.json`
- matching census lines
- **no** registry edits on CONFIRM / PER_ROW / unlistable ESCALATE
- **no** files on PER_ROW paths

### 8.7 Phase 1 step 5

- `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json` — proposed `event_types` only; `closed=false`; digest unchanged

### 8.8 Never in Phase 1

- `FRESH_CENSUS_DENOMINATOR.json` `closed=true` (Phase 2)
- `Plans/.audits/_semantic_closure_registry.jsonl` append (Phase 6)
- `scripts/**`
- Known37 registry membership edits
- Hash restamps to manufacture readiness
- An executor script that mutates ledgers (this task)

---

## 9. Fail-closed path index (explicit)

| Path | Mutation | Remaining blockers (expected) |
|---|---|---|
| Any `owner_response` null | none (preflight refuse) | `owner_decision_sheet_unresolved` |
| Defaults | none (refuse) | same |
| Bulk-register | none (refuse) | n/a |
| `VETO_KEEP_REGISTERED_PROVISIONAL` (either August ID) | drafts+rows keep provisional / UNKNOWN checkpoints | `registered_contract_depth_incomplete`, `individual_dispositions_provisional` |
| `PER_ROW_REVIEW_REQUIRED` (J248) | none on 252 | `individual_dispositions_owner_veto_blocking` |
| `PER_ROW_REVIEW` (J40) | none on 28 | `individual_dispositions_owner_veto_blocking`, `unresolved_bucket_not_closed` |
| `PER_ROW_VETO_REQUIRED` (EMIT) | none on 26 | `individual_dispositions_evidence_gap_blocking`, `unresolved_bucket_not_closed` |
| `ESCALATE_SUBSET_FOR_REGISTRY_ADMIT` without `event_types` | none on 252 | `individual_dispositions_owner_veto_blocking` |
| `ESCALATE_SUBSET` without `event_types` | none on 28 | `individual_dispositions_owner_veto_blocking`, `unresolved_bucket_not_closed` |
| `ESCALATE_AS_PERSISTED_FAMILY` | none (no contract) | `individual_dispositions_evidence_gap_blocking` |
| `ACCEPT_EMIT_OBLIGATION_ONLY` | stance recorded; disposition kept `NEEDS_MORE_EVIDENCE` | `individual_dispositions_evidence_gap_blocking` |
| `CONFIRM_UNRESOLVED_NO_ADMIT` | 28× `KEEP_QUARANTINED`, bucket stays unresolved | `unresolved_bucket_not_closed` |
| AFFIRM without IDs/citations | none | August pending / depth incomplete |
| RECLASSIFY paths without pin+census+ledger triple | none | existing blockers |

---

## 10. Current inert verdict (2026-08-12)

`OWNER_DECISION_SHEET.json`: eight `owner_response: null`.  
Preflight §3.2 fails. **Do not run this playbook.**
