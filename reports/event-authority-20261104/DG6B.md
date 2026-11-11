# DG6B — Sweep part 2B: the gated shared date-time, number and retained-original rules (2026-11-10)

Task: `lanes/SWEEP-P2B.md` with Addendum 1 (two allowed merge resolutions) and Addendum 2 (the date-time inventory gate in lane trees). Branch `plans/ea-w2-plugins-personas-github-20261104`, start head `7c2ac9c7512f7d0d793c2c01640adc353170c18a` (part 2A), no rebase. Worker: Opus 5.5, T3 delegate, on the VM. Merge `3645b416a9`; adoption `ccebba6aa7` and `56cbd818e5`; owner text `bd888a1efd`; delivery head in the external `HEAD.txt`. Native execution: **NOT_RUN**. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/sweep-p2b/` (`SHA256SUMS`). No Decision Log entry, registry append, admission, seal or reseal; no new PlanUnit ID. `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the guard tool's files and every NUMRULE file are unchanged.

**Result.** The merge took exactly `58c2816ff3` with conflicts only in derived files, regenerated; neither addendum resolution was needed. Every DG6B timestamp field now goes through the shared CV-1101 predicate `pm_event_datetime.date_time` with its owner's profile, every number through the shared CV-1100/SP-1100 calls, and retained originals through SP-1101 custody and the shared `RetainedDispatcher`. Two new guard tables carry the new refusals (`number_qualification` PQ01/PQ02, `history_custody` HR01). The adoption found and fixed one lane crash: a 4,400-digit integer below a schema minimum raised inside jsonschema's error message instead of refusing. All 19 family checkers pass at `bd888a1efd`; `--self-test --scope numbers` passes 580/580; the shared corpus runs through the complete append route in every family with 0 disagreements. The gated guard tool proves **1735/1735 row cells in 820 suites** (176 rows in 78 tables; new PQ01, PQ02, HR01), no failed suite, no masked negative. **Not run in this tree, as Addendum 2 directs:** `datetime_validator` and the date-time inventory gate (the gate fails here on hash drift and unclassified containers; rows below), and so the scope-all self-test refuses before any case. They run at batch-2 integration. Family grades are unchanged: 171 PASS / 38 PARTIAL / 19 ABSENT.

## Sweep part 2B: findings and responses

### Step 1: the merge

`3645b416a9` = `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` (parents `7c2ac9c751`, `58c2816ff3`). DG6B had not merged `a16f67c1ef`, so both gated scopes came in.

| Item | Result | Proof |
|---|---|---|
| Conflicts | 163 paths, all derived: `Plans/_shards/contracts_v0/**`, `Plans/_shards/storage-plan/**`, `Plans/.plan_index/**`. Resolved by regenerating (`pm-shard-plans.py --generate`, then `pm-plan-index.py generate` with the hash-verified currentness edition), never by hand. | Shard regeneration changed only `contracts_v0` (66) and `storage-plan` (91), the two documents both sides changed. Plan units 7,513 → 7,517: exactly CV-1100, CV-1101, SP-1100, SP-1101 added; the readiness delta is those four units. `pm-shard-plans.py --check`: pass, 99 sources, 3,139 shards. |
| Non-derived files | `Plans/Contracts_V0.md` and `Plans/storage-plan.md` merged without conflict. | Every line NUMRULE added (125 and 126) is in the merged file; NUMRULE's one removed `Contracts_V0.md` line is gone. |
| NUMRULE's own files | 22 added files (`scripts/pm_event_numbers*`, `scripts/pm_event_datetime*`, `Plans/event_number_recipe_corpus.json`, `Plans/event_datetime_inventory.json`, its reports). DG6B had no earlier copy of any, so Addendum 1 resolution 1 did not apply. | Each equals `git show 58c2816ff3:<path>` byte for byte (`git diff --quiet 58c2816ff3 HEAD -- <path>` for all 22). |
| Addendum resolutions | Neither used: no add/add conflict, no owner-text conflict. | — |
| DG6B checker at the merge | 19/19 families exit 0, before any part 2B edit. DG6B imported nothing from NUMRULE, so no behaviour changed. | `base/<family>.json` |

The merge was pushed alone first (`7c2ac9c751..3645b416a9` on both push URLs).

### Step 2: the adoption guide

Read `reports/event-authority-20261105/NUMRULE-ADOPTION.md`: "Shared calls", "Number-only adoption", "Authority boundary", "### DG6B", "Validation and limits". The DG6B section names `same_value` (now `digest_of`), `identity`, `record_contract`, `history_contract`, `historical_storage_contract` and the oracle builder `rebuild`; each is covered below.

### Step 3: timestamps (S3)

**The shared check now in force.** `FORMAT` keeps jsonschema's default checkers and registers `date-time` as `event_record_date_time` (`scripts/pm-dg6b-event-contracts.py:553`), which calls `pm_event_datetime.date_time(value, profile=EVENT_RECORD)`. As in the shared `format_checker`, every value the validator treats as a string reaches it (a `str` subclass refuses, `date_time_type`) and a non-string is left to `type`. The lane's own grammar `utc_datetime` (uppercase-Z regex plus `datetime.fromisoformat`) is removed. Storage-assigned fields take CV-253's profile on top, composed into the EventRecord verdict as CV-1101 describes (`storage_field_errors` `:572`, counted into ER01 by `event_record_contract` `:1054`).

| Field | Owner | Shared check and profile | Where checked |
|---|---|---|---|
| EventRecord `occurred_at_utc` | EventRecord (CV-317/CV-1101) | `date_time`, EVENT_RECORD | `event_record_contract` (ER01), on append, retry and retained originals |
| EventRecord `observed_at_utc`, `persisted_at_utc` | Storage (CV-253) | `date_time`, STORAGE_UTC_Z (terminal uppercase `Z` only), on top of EVENT_RECORD | `storage_field_errors` inside ER01, on append, retry and retained originals |
| Payload `ts`, all 19 families (`dg6b_event_contracts.schema.json`, 19 payload definitions) | DG6B family owners (GAAAF-077..081, PLUG-131..138, P-120..125), schema `format: date-time` | `date_time`, EVENT_RECORD | `payload_contract` (PS01), `envelope_payload_schema` (EP01), `payload_types` (PT01) |
| Stored-operation copy of `ts`, all 19 (`<family>_operation` logical branch) | SP-670/671/672 | `date_time`, EVENT_RECORD | `operation_schema` (OP01), `operation_logical_schema` (OG01) |
| `expires_at` (`auth.github.device_code.issued`) and its operation copy | GAAAF-078 (pending auth record), schema `format: date-time` | `date_time`, EVENT_RECORD (no stricter owner rule) | PS01, EP01, OP01, OG01 |

No other schema DG6B validates declares a timestamp: the persona owner request/result closures, `WorkflowScopeV2`, the durable read token and the five closed proof adapters have none (checked by walking every `$ref` closure). `occurred_at_utc = payload.ts` (EJ03) stays an exact string join: SP-670/671/672 require it and say "Join every copied value by type-exact canonical bytes", and CV-1101 preserves every timestamp string; no instant comparison exists in DG6B.

**Witnesses** (`scripts/pm_dg6b_p2b_cases.py:155`–`:188`, every family, complete boundaries): for payload `ts` (and `expires_at` where present), 7 accepted forms (lowercase `t`/`z`, `+05:30`, `-05:00`, `2016-12-31T23:59:60Z`, the same leap second at `+05:30`, a 21-digit fraction, year 0000) through the complete append route with `occurred_at_utc` re-derived; 11 refused forms (`24:00:00Z`, trailing LF, `12:00:60Z` on a non-leap day, comma fraction, `+24:00`, `+05:60`, no zone, 29 February 2026, a leap second at the wrong offset, a leading space, an empty fraction) through the payload stage (PS01), and the same 11 at `occurred_at_utc` through the complete append route (ER01); a `str` subclass refuses (PS01). For `observed_at_utc` and `persisted_at_utc`, 3 accepted forms (uppercase `Z`, a 12-digit fraction, the real leap second) and 6 refused forms (`+00:00`, `-00:00`, lowercase `z`, `+05:30`, `24:00:00Z`, trailing LF) through the complete append route (ER01). Retained originals keep their owner profile: a writer-sealed original whose `ts`/`occurred_at_utc` is lowercase or carries an offset reads (3 forms), and one whose `observed_at_utc` or `persisted_at_utc` is `+00:00`, `-00:00` or lowercase `z` refuses at ER01 (6 cases).

**Lane-local leaks, now refused by the shared check.** DG6B's interim review recorded that `utc_datetime` accepted `2026-11-04T24:00:00Z` (Python 3.14 `fromisoformat` reads it as the next midnight). It now refuses at every timestamp field: `date_time_hour` at `ts`/`expires_at` (PS01), at `occurred_at_utc` (ER01) and at both Storage fields (ER01) — witnesses `datetime/*/refused/0`. A trailing LF refuses at every field (`datetime/*/refused/1`; the shared grammar is a `fullmatch`). The old grammar also refused valid owner forms (`+00:00`, any offset, lowercase `z`, leap seconds) at EventRecord-profile fields, including retained originals; those now read, while CV-253 keeps refusing them at the two Storage fields.

**Fixture expectations changed by the timestamp profile:** none. The fixture pack's malformed-timestamp negatives (`12:00Z`, week date, comma fraction) are refused by the shared predicate too.

**The date-time inventory gate and `datetime_validator`: not called in this tree (Addendum 2).**
- `python3 scripts/pm_event_datetime_inventory.py` exits **1** (277 s): `status fail`, 233 nodes, 0 unclassified nodes, **205 failure rows**: 107 `unclassified_mentioning_container` (95 in `Plans/.plan_migration/pds-20261105-00{2..6}-current-planunit-snapshot/span_map.jsonl`, 14 in `Plans/.plan_index/{plan_units,acceptance_units}.jsonl`, 4 in the ignored local currentness copy `Plans/.audits/event-authority-2026-08-13-currentness/EVENT_OCCURRENCES.jsonl`, 1 in `Plans/dg6b_event_contract_fixtures.json`), 48 `stale_scan_exclusion` and 43 `unreadable_mentioning_container` (`Plans/_shards/storage_value_registry`, `Plans/_shards/decision_log`, `Plans/Decision_Log.md`, `Plans/Contracts_V0.md`, `Plans/usage-feature.md`, `Plans/.plan_index`). They come from main's documents that moved after NUMRULE's base and from this merge's regenerated index. Recorded exactly (`dt-inventory.json`); the inventory and exclusion files are NUMRULE files and were not edited. **DG6B item for batch-2 integration:** classify or exclude the one DG6B container (`Plans/dg6b_event_contract_fixtures.json`, which quotes timestamp field names in fixtures).
- `datetime_validator` is therefore not constructed anywhere in DG6B; DG6B calls `date_time` with each field's profile, as Addendum 2 point 1 directs.
- `python3 scripts/pm_event_numbers.py --self-test` (scope all) exits **1**: `case_execution: NOT_RUN_ADMISSION_REFUSED`, 0 cases run, the one failing check `datetime_inventory_complete_and_classified` (`selftest-all.json`).
- `python3 scripts/pm_event_datetime.py --self-test` is not credited (no entry point; Addendum 2 correction).
- `datetime_validator` and the inventory gate run at batch-2 integration, after the inventory refresh.

**This lane's timestamp review is no longer interim** for the fields in the table above: each is checked by the shared `pm_event_datetime.date_time` with the profile named there.

### Step 4: SP-1101 retained-original dispatch (S2 history item)

DG6B is not in step 4's list, but its own part 2B list carried "authenticated at-write recipe selection for history" (item 10a), and the guide's DG6B section requires it. A retained original's recipe is now selected by its sealed custody, never by the history case:
- **Composition** (`scripts/pm_dg6b_original_custody.py`): the frozen recipe map, one `FrozenRecipe` per family edition (`install_recipe_verifiers` `:169`; every DG6B family has one write-time edition: `pm.event.v0` 2.0.0, payload 1.0.0, the compact-JSON identity recipe of SP-670/671/672, the CV-317 producer recipe, EVENT_VALUE physical bytes; tuple `recipe_tuple` `:65` with the SHA-256 of the five frozen schema resources). `install_original_custody` (`:185`) seals the committed fixture pack's positive retained originals; the run calls it once before any read (`scripts/pm-dg6b-event-contracts.py:1269`). An alternate `--fixtures` pack never seals anything; the case under check never adds to custody. Only the lane's writer-side builders seal what they write (`seal_original` `:176`).
- **Resolution** (`resolve_original` `:198`): the shared `RetainedDispatcher` asks `DG6BOriginalOwner` (`:101`) for the original at `seglog:<event_id>`, with the binding computed from the case. The owner returns custody only for EventRecord bytes sealed there (EVENT_VALUE bytes; result bytes = the logical payload, receipt bytes = the durable read token). The frozen verifier (`frozen_verifier` `:126`) decodes the sealed bytes and recomputes the payload join, the identity under the family recipe, the Storage instance, the operation ID, the scope and the source commitment; no current-writer gate, no live state. `current_append_policy` never runs on an original.
- **Row** `HR01_original_custody` (new table `history_custody`, `scripts/pm-dg6b-table-generate.py:302`): refuses any dispatcher refusal (`original_query`, `original_authority`, `original_binding`, `recipe_unknown`, `original_verification`, or a physical encoding refusal of the bytes). `history_contract` (`scripts/pm-dg6b-event-contracts.py:471`) runs it after the history flags and before the selected edition's at-write validation, which is looked up by custody's recipe tuple (`AT_WRITE_VALIDATORS` `:1062`, `:488`).
- **Witnesses** (`scripts/pm_dg6b_p2b_cases.py:250`–): a coherent forgery of the original (`ts` changed, every copy, identity and the Storage bytes re-derived, nothing sealed) refuses at HR01 (`original_authority`); before part 2B nothing refused it. Sealing those same bytes makes them read. A sealed original with a custody tuple that has no frozen verifier refuses (`recipe_unknown`); a sealed original whose `event_id` the writer did not derive from the recipe refuses (`original_verification`). The Storage record join keeps its own witness: an authentic original with a different Storage frame refuses at HS04. The two history account-custody probes (B1) now seal their writer-built originals, so the at-write account join (EJ08/EJ09) alone refuses them (`scripts/pm_dg6b_full_oracles.py:377`).

**Fixture expectations that changed (custody).** 266 retained-history negatives (14 kinds × 19 families) present an original whose EventRecord bytes Storage never sealed. Custody now refuses them first, with `historical_original_recipe` at HR01, before the row they reached before. Rewritten in `Plans/dg6b_event_contract_fixtures.json` by `tools/history_expectations.py` (each case run through the checker's own history boundary; list in `history-expectation-changes.json`):

| Kind (×19 each) | Before (row) | Custody refusal |
|---|---|---|
| `history_event_id_substitution` | `identity` (ID01) | `original_query` |
| `history_event_type_substitution` | `envelope_source_join` (EJ01) | `original_authority` |
| `history_forged_original`, `replay_only_history_forged_original` | `original_source_join` (FS01) | `original_authority` |
| `history_inline_revision_type_{array,boolean,null,object,string_number}` | `payload_schema` (PS01) | `original_authority` |
| `history_inline_revision_type_decimal` | `payload_schema` (PS01) | `physical_type` (an exact decimal has no EVENT_VALUE bytes) |
| `history_inline_python_equal_bool` | `payload_schema` (PS01) | `original_query` (14), `original_authority` (5) |
| `history_storage_{observed_at_utc,persisted_at_utc,sequence_id}_substitution` | `historical_storage_record` (HS04) | `original_authority` |

Each of those rows keeps a single-defect witness elsewhere; the tool reports none unwitnessed. EJ01's only former witness was the event-type substitution, so part 2B adds an append-path witness (`envelope/event_type`), and HS04 gets `history_storage/record_bytes` (above).

### Step 5: numbers (S2)

| Item | Result | Where |
|---|---|---|
| **Raw ingress** | `strict_json` is the shared `loads_current_json`: a duplicate key is J01; every other refusal (malformed text, non-finite constants, lone surrogates, leading zeros, negative zero) is J02. Integer tokens become exact ints of any length (never Python's 4,300-digit `int()`), fractions exact decimals. The fixture pack parses identically (57 decimal-revision negatives become exact decimals and still refuse at their integer slot). | `scripts/pm-dg6b-event-contracts.py:301` |
| **Integer slots** | The redefined JSON Schema `integer` type is now the shared `current_integer` (`current_integer_slot`), so every integer slot the validator reaches, nested and nullable ones included, refuses runtime floats, exact decimals, booleans and strings; each slot's minimum and maximum stay in its owner schema. Storage `sequence_id` is an exact uint64 through `storage_uint64`, composed into ER01 (the envelope schema sets only `minimum: 0`; `2^64` was accepted on append before). | `:182`, `:572` |
| **Producer projection** | The record digest and the retry body (RY03) are the shared `producer_semantic_digest` over the CV-317 projection, asserted field for field equal to `PRODUCER_FIELDS` (`:877`); this replaces `rfc8785.dumps` and the binding digest of the same projection. New table `number_qualification` qualifies before any join or effect (`number_qualification` `:974`, called at `:1006`): PQ01 the projection has exact JCS bytes (`2^53` accepted; `2^53+1`, `2^60`, uint64 max and the 4,400-digit integer refuse instead of crashing the digest at the end, Astra-4 S2), PQ02 the logical payload has EVENT_VALUE bytes (the part an externalized payload leaves outside the projection). | `:960`, `:974`, `:1051` |
| **Identity recipe** | Unchanged: SP-670/671/672's compact-JSON preimage and SHA-256 are a local recipe, kept exactly (the guide: never replace it with JCS). After PQ01/PQ02 its integer is within uint64, so `json.dumps` renders it exactly. | `identity` `:516` |
| **Physical profiles** | Typed joins (`digest_of` `:136`) and the full Storage record join (`historical_storage_contract` `:493`) use SP-236 general typed MessagePack (`storage_value_bytes`, EVENT_VALUE) instead of the SP-278 binding codec's uint-only domain, as the guide requires; the payload body bytes too (`:1037`). Operation and resolution carriers use APP_PHYSICAL (`store_value` `:385`, sizes `:446`, `:743`, re-encoding check `decoded_body` `:428`). Both profiles give the same bytes as the binding codec for every value it encodes: no fixture byte changed. | as listed |
| **4,400-digit crash** | DG6B had it, in a place the other lanes did not report: jsonschema writes the instance into its error message, so `-10^4399` at `producer_sequence_id` (minimum 0) raised `ValueError: Exceeds the limit (4300 digits)` inside the schema verdict. `error_count` now lifts Python's digit limit only while it computes a verdict and restores it after; no value is converted or capped and the schema decides as before (`:154`). The old `json.loads` path raised on the same token, and the `rfc8785` digest raised on any integer above `2^53`. Now `±10^4399` refuses with a code at `producer_sequence_id` (PQ01 / ER01), `sequence_id` (ER01), payload `revision` (PQ01), a string slot (PS01), the read token's uint64 `frontier_revision` (CK01), a retry candidate (PQ01) and a retained original (HR01, `physical_integer_range`). No route raises. | `:154`; witnesses `scripts/pm_dg6b_p2b_cases.py:207`– |
| **Boundaries** | `producer_sequence_id`: `2^53` appends; `2^53+1`, `2^60`, uint64 max refuse (PQ01). Payload `revision`: `2^53+1`, `2^60`, uint64 max refuse (PQ01). Storage `sequence_id`: `2^53` and uint64 max append; `2^64` refuses (ER01). Externalized payload `revision = 2^64` refuses (PQ02). | `:190`– |

**Shared corpus through the complete checker** (`scripts/pm_dg6b_p2b_cases.py:235`). Every number-scope spelling of `Plans/event_number_recipe_corpus.json` (the raw spellings of its `token`, `parse`, `parse_token`, `slot` and `json_number` cases, the exact integers and other typed values of its `integer` and `uint64` cases, and two 4,400-digit integers: 65 distinct spellings) is written as raw JSON text at `event_record.producer_sequence_id` and at `event_record.sequence_id` of a valid case, parsed by the checker's own raw ingress and run through the complete append route, in all 19 families. Expectations come from the shared helpers alone (`loads_current_json`; `current_integer(minimum=0)` and `qualified_jcs` at the producer slot; `storage_uint64` at the Storage slot), never from the checker. Producer slot: 9 accepted, 22 J02, 1 J01, 26 ER01, 7 PQ01. Storage slot: 12 accepted, 22 J02, 1 J01, 30 ER01. **2,470 complete-route runs, 0 disagreements, 0 crashes** (each negative asserts its exact code and row). The three byte-input parse cases of the corpus are whole-document encodings, not slot spellings, and stay with the shared self-test.

**Self-test.** `python3 scripts/pm_event_numbers.py --self-test --scope numbers`: **exit 0, `"status": "pass"`, 580/580 cases (276 positives, 304 labelled negatives)**. Credited exactly: number recipes only.

**Fixture expectations changed by the number rule:** none in the fixture pack. The probe corpus's two numeric-spelling probes (`numeric/decimal`, `numeric/exponent` at `producer_sequence_id`) refuse at ER01 as before, now through `current_integer`.

### Step 6: guard tables

The gated tool `004bdedd63` (unchanged) ran **820 suites** (one per phase table per family, plus 4 shared-only tables) at `56cbd818e5` (scripts identical at `bd888a1efd`): **1735/1735 row cells proved, 0 failed suites**, 2727 distinct single-row negatives (35 borrowed cells, the same five declared rows as part 2A). 176 distinct rows in 78 tables (part 2A: 173 in 76; new: PQ01, PQ02, HR01). Lane matrix problems: 0. Collection findings: 0. Credit is the tool's own `rows[].proved`.

**Rerun scope.** Adoption changed the observations of nearly every row (every schema verdict now runs the shared predicates; every typed join hashes EVENT_VALUE bytes; RY03 compares producer digests) and added three rows, so the whole tool was rerun rather than a subset. Predicates of the 173 existing rows are unchanged (`pm-dg6b-table-generate.py scripts --check` regenerates only the two new modules).

| Checker | Tables | Rows | Row cells proved | Unproved | Cut: own flips / own | Cut: stays | Unrelated changes | Masked | Borrowed cells |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|
| Shared fences: strict JSON (shared parser), schema references, preparation | 4 | 12 | 50/50 | none | 50/50 | 66 | 0 | 0 | 0 |
| Schema occurrences (one row per validated subject) | 19 | 19 | 268/268 | none | 291/291 | 0 | 0 | 0 | 13 |
| **New** `number_qualification`: PQ01 producer JCS, PQ02 payload EVENT_VALUE | 1 | 2 | 38/38 | none | 57/57 | 57 | 0 | 0 | 0 |
| `append_contract`: replay policy, retry | 2 | 5 | 95/95 | none | 283/283 | 528 | 0 | 0 | 6 |
| `record_contract`: grants, frozen source, scope, partition, identity, envelope, body, read token | 11 | 28 | 518/518 | none | 739/739 | 1758 | 0 | 0 | 16 |
| `semantic`: auth key scope, retry payload, hook block, cadence | 4 | 4 | 20/20 | none | 21/21 | 0 | 0 | 0 | 0 |
| SP-337 byte stages: inline, reference, integrity, operation and resolution carriers | 9 | 21 | 291/291 | none | 701/701 | 1746 | 0 | 0 | 0 |
| `history_contract`: retained flags, **new** HR01 custody, Storage join | 3 | 12 | 228/228 | none | 323/323 | 1026 | 0 | 0 | 0 |
| `persona_semantic`: Persona relational rules and owner copies | 25 | 73 | 227/227 | none | 262/262 | 727 | 0 | 0 | 0 |

Shared fences now hold 50 cells (part 2A: 12): the shared corpus's raw spellings put JSON-row negatives and controls in every family's own suites.

| Family | Suites | Row cells proved | Borrowed cells | Distinct negatives | Failed suites |
|---|---:|---:|---:|---:|---|
| `auth.github.authenticated` | 39 | 79/79 | 3 | 123 | none |
| `auth.github.device_code.issued` | 39 | 79/79 | 3 | 118 | none |
| `auth.github.disconnected` | 39 | 79/79 | 3 | 118 | none |
| `auth.github.failed` | 39 | 79/79 | 3 | 118 | none |
| `auth.github.token.polling` | 40 | 80/80 | 3 | 119 | none |
| `persona.created` | 52 | 118/118 | 2 | 176 | none |
| `persona.deleted` | 54 | 114/114 | 2 | 173 | none |
| `persona.exported` | 49 | 107/107 | 2 | 157 | none |
| `persona.imported` | 54 | 116/116 | 2 | 173 | none |
| `persona.selected` | 61 | 137/137 | 2 | 217 | none |
| `persona.updated` | 53 | 118/118 | 2 | 175 | none |
| `plugin.hook.blocked` | 38 | 78/78 | 1 | 130 | none |
| `plugin.hook.error` | 37 | 77/77 | 1 | 144 | none |
| `plugin.hook.invoked` | 37 | 77/77 | 1 | 144 | none |
| `plugin.load_failed` | 37 | 77/77 | 1 | 126 | none |
| `plugin.loaded` | 37 | 77/77 | 1 | 126 | none |
| `plugin.permission.override` | 37 | 77/77 | 1 | 126 | none |
| `plugin.tool.collision` | 37 | 77/77 | 1 | 126 | none |
| `plugin.tool.registered` | 37 | 77/77 | 1 | 126 | none |
| `shared` | 4 | 12/12 | 0 | 12 | none |

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`); the complete path is the full checker. As lane evidence beyond the tool, each negative was re-run through its whole call with only its refusing row cut: of 13540 negative calls, 7446 are accepted and 6094 are refused later by a distinct invariant watching the same source fact, as in part 2A (counts per kind in `aggregate.json`). Two kinds are new, one per family each: in the `event_record` suites an integer negative cut at ER01 is refused later at PQ01, because the same integer is also outside exact JCS; in the `number_qualification` suites a negative cut at its PQ row reaches the body-byte derivation, which needs the EVENT_VALUE bytes PQ02 proves (`derivation_requires_cut_row:Refusal`). None reaches another row of its own table.

### Step 7: grades

| Cell | Before (part 2A) | After | Why |
|---|---|---|---|
| `positive_negative_oracles`, all 19 | PARTIAL | **PARTIAL** | S2 (numbers) and S3 (timestamps), part 2A's stated reasons, are now adopted in the lane with the witnesses above. It stays PARTIAL only because the shared `datetime_validator` boundary and the date-time inventory gate run at batch-2 integration (Addendum 2), where DG6B's fixture container must also be classified; native NOT_RUN. |
| `closed_payload_schema`, all 19 | PASS | PASS | Timestamps through the shared predicate (EventRecord profile); integer slots through `current_integer`. |
| `replay_idempotency`, all 19 | PASS | PASS | Retry and record digests through `producer_semantic_digest`, qualified before effects. |
| `compatibility_withdrawal`, all 19 | PASS | PASS | Retained originals through SP-1101 custody (HR01); retained timestamps at their owner profile. |
| `retention`, all 19 | PARTIAL | PARTIAL | PENDING_RETENTION_DECISION. |
| `membership_version`, all 19 | ABSENT | ABSENT | No admission. |
| the other six cells, all 19 | PASS | PASS | Unchanged. |

**Timestamps were one of the two reasons the oracle cell was PARTIAL; the shared check now covers every DG6B timestamp field** (table in step 3). Totals unchanged: **171 PASS / 38 PARTIAL / 19 ABSENT**; every family 9 PASS / 2 PARTIAL / 1 ABSENT. Prepared READY: 0/19. Self-grade `DG6B-SWEEP-P2B-20261110`: every status carried; `closed_payload_schema`, `replay_idempotency`, `compatibility_withdrawal` and `positive_negative_oracles` rewritten with part 2B evidence; all 622 evidence quotes re-found at their lines at `bd888a1efd` (0 missing, 0 off-line).

### Owner text

`Plans/storage-plan.md`: in each of the 19 SP-670/671/672 family identity paragraphs, the sentence "Integers use the selected canonical MessagePack integer domain; fractional/exponent number representations, boolean-as-integer and string-number forms refuse." contradicted CV-1100's producer qualification (it admitted the whole MessagePack integer range on the producer route) and is replaced by citations of the shared rules beside the existing owners: CV-1100 raw parse, exact integer slots and JCS qualification (CV-317, CV-366); SP-1100 physical profiles and uint64 `sequence_id` (SP-236, SP-337); CV-1101 per timestamp field; SP-1101 custody selection for retained originals (`bd888a1efd`). No new behaviour, ID or Decision Log answer. Shards regenerated only for `storage-plan` (91); plan units changed only in `storage-plan` (346, `source_doc_sha256` only); readiness changed only its timestamp. ATS-335/336 say "malformed UTC", which still holds; unchanged.

### What Astra keeps finding, probed for part 2B

(4) One field read two ways: `occurred_at_utc` and `ts` join by exact string as the owner requires; a same-instant spelling difference refuses (EJ03). (10) Numbers written two ways: `1.0`, `1e0`, `-0`, `01`, `1.`, `.5`, `+1` and the rest of the corpus refuse at raw ingress or the integer slot (corpus run). (10a) Tightening must not reject history: retained lowercase/offset source timestamps read; retained offset Storage timestamps refuse (CV-253); a retained original's recipe is custody's, not the case's. (12) Formats the validator skips: `date-time` is registered explicitly with the shared predicate; jsonschema's other default checkers stay installed. (1) Forged inputs: a coherent forged original is now refused (HR01). (3) Historical readers: valid retained history reads; forged, unsealed and miswritten originals refuse. (11) Types confused: a `str` subclass timestamp refuses; booleans and exact decimals refuse at integer slots.

### Checks, before and after

| Command | `7c2ac9c751` (part 2A) | `3645b416a9` (merge) | `bd888a1efd` |
|---|---|---|---|
| `python3 scripts/pm-dg6b-event-contracts.py --family <f>` ×19 | 0 ×19 | 0 ×19 | **0 ×19** (18–27 s, peak RSS 257 MB): 3,664 complete-path, 509 round-9 and 3,261 part 2B negatives, 786 part 2B positives |
| `python3 scripts/pm-dg6b-table-generate.py scripts --check` | 0: 76 phases, 173 rows | — | 0: 78 phases, 176 rows |
| gated tool, every suite | 763 PASS | — | **820 PASS: 1735/1735 cells**, 0 masked, 0 unrelated (02:04Z, `tool-run/run.log`) |
| counterexample CLIs (Astra-4's 7 coherent bad positives) | 7/7 refused | — | 7/7 refused through a table row |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | not run | — | **0, `"status": "pass"`, 580/580** |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | not run | — | 1: `NOT_RUN_ADMISSION_REFUSED` (inventory; Addendum 2) |
| `python3 scripts/pm_event_datetime_inventory.py` | not run | — | 1: 205 failure rows (above) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | 0 | 0: 99 sources, 3,139 shards |
| `python3 scripts/pm-plan-index.py validate` (origin/main `47d9dc7655`) | 1: 30 fork-drift findings (origin/main `5cbb92a5aa`) | — | 1: 60 fork-drift findings: 39 `plan_unit_removed_without_ledger_decision` for units only main has (DL-333..341, DL-349, DL-470..472, UCC-230/231, CV-369 and 21 others) and 21 `plan_unit_removal_ledger_invalid` in ledgers this branch never touched; none names a DG6B unit. Integration rebase owns them. |

### Readiness

Part 2B is done for DG6B except the shared `datetime_validator` boundary and the date-time inventory gate, which the lead moved to batch-2 integration (Addendum 2); everything else in the brief ran and passed at `bd888a1efd`. The lane is ready for batch-2 integration and its Sol max and Astra max review, with these integration items: the inventory refresh (including classifying `Plans/dg6b_event_contract_fixtures.json`), then `datetime_validator` and the scope-all self-test. Membership stays ABSENT (no admission), retention PARTIAL, native NOT_RUN.

### Open items and questions

- **Nothing needs Jared** (no DL-045/093/096 choice).
- **Package versions:** this VM has `rfc8785` 0.1.4, `blake3` 1.0.11, `jsonschema` 4.19.2, `referencing` 0.36.2, `markdown-it-py` 3.0.0 and `msgpack` **1.2.4** (the guide names 1.1.2), on CPython 3.14.4. The number self-test and every DG6B run passed with these; DG6B's physical bytes come from the shared `storage_value_bytes`, not from msgpack's encoder, and msgpack only decodes referenced bodies (`decoded_body`, the shared `decode_storage_value`) and builds one deliberately noncanonical witness body (`scripts/pm_dg6b_full_oracles.py:418`).
- **For integration:** the date-time inventory refresh and gate; DG6B's one unclassified container; the 60 fork-drift index findings (rebase).
- **Tool issue candidate (not filed; no false pass):** jsonschema's error messages render the instance, so any lane whose schema verdict can see a 4,400-digit integer at a failing slot may crash the same way DG6B did; the shared corpus's long integers run through `current_integer` only, not through a schema error message.

### Part 2B items from part 2A: outcomes

| Part 2A item | Outcome | Where |
|---|---|---|
| S2 number rule: integer redefinition, `identity` preimage, record digest, `digest_of`/`binding_bytes`, cadence, number tables, oracle `rebuild`, decimal/exponent witnesses, SP-670/671/672 paragraphs | **Done.** Integer slots `current_integer`; identity recipe kept exactly (local compact-JSON recipe, now always within uint64 after PQ01/PQ02); record and retry digests `producer_semantic_digest`; typed joins EVENT_VALUE; cadence `previous + 5` unchanged (exact ints); UC06/DC01/RY01–RY03/CD01 predicates unchanged, RY03 now reads producer digests; `rebuild` uses EVENT_VALUE; the decimal/exponent witnesses refuse at ER01 through `current_integer`; owner paragraphs rewritten (`bd888a1efd`). | `ccebba6aa7`, `bd888a1efd` |
| S2 authenticated at-write recipe selection for history (10a) | **Done.** SP-1101 custody and `RetainedDispatcher`, HR01. | `ccebba6aa7` |
| S3 timestamp formats: `FORMAT`/`utc_datetime`, `event_record.schema.json` date-time, 40 schema occurrences, EJ03, retry Storage-time values | **Done.** Shared `date_time` per field profile; EJ03 stays an exact copy join (owner rule); retry Storage-time fixture values are uppercase-Z and pass STORAGE_UTC_Z. | `ccebba6aa7` |

---

# DG6B — Sweep part 2A (earlier report, unchanged): guard tables on the gated guard tool

Branch `plans/ea-w2-plugins-personas-github-20261104`; part 2A start `e0fe6998d81eae3b416f6c5d3436572e9dee3b33`; gated tool merge `4842b41e5a` (tool `004bdedd63`, eleven files, unchanged); implementation and evidence head **`4cc3643606ec666a7503b0015c7c50a1a99c7410`**; delivery head in the external `HEAD.txt`. No rebase onto main this round. Native execution: **NOT_RUN**.

**All 19 families keep 9 PASS / 2 PARTIAL / 1 ABSENT (171 / 38 / 19).** Part 2A closes S1 (guard tables on the shared tool). `positive_negative_oracles` stays PARTIAL because S2 (shared number rule) and S3 (timestamp formats) are part 2B; `retention` stays PARTIAL (PENDING_RETENTION_DECISION); membership stays ABSENT. Prepared READY: 0/19. Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd632d9463f3535190a6ed5772338cdce1` with `--no-ff` as `4842b41e5a`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat 4842b41e5a^1 4842b41e5a` lists 11 files; `git diff 4842b41e5a HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_dg6b_example.py` is empty. |
| **S1 — guard tables** (fixed, `94eb20e014`, `4cc3643606`) | Every product refusal of the checker is one named row in one of **76 phase tables (173 rows, at most seven each)**, reached only through `require()`. Derivation computes observations (schema error counts, canonical-byte digests via `digest_of`, recomputed identities and expected values) and decides nothing. Or-chains are one row per predicate; a later predicate that would also hold for an input an earlier row refuses carries the earlier rows' pass condition as applicability (retry RY02/RY03, reference RA02–RA04, Persona home PH02, update CAS UC01/UC02, creation CR04, override OO03, EJ07, PR02, PR08), so each defect has exactly one refusing row and the rows together refuse what the original chain refused. The DG6B example's seven retained-history flags are table `history_flags` unchanged in substance. The checker asserts each factory's require order and that no `raise` outside the table remains (harness `KeyError`/`AssertionError` only). | `scripts/pm-dg6b-event-contracts.py:31` (`TABLE_PHASES`), `:80` (`require`), `:98` (`table_order_errors`), `:115` (`refusal_sites`); row spec `scripts/pm-dg6b-table-generate.py`; generated `scripts/pm_dg6b_table_*.py` | `python3 scripts/pm-dg6b-table-generate.py scripts --check` (no stale or extra module); every family CLI `pass`. |
| **S1 — retired machinery** (fixed, `94eb20e014`) | Removed the AST/mutation proof `scripts/pm-dg6b-guard-proof.py` (its `guard_inventory`, `run_family`, cut grouping and reported inventory). Proof is now the gated tool over the tables. | — | `git show 94eb20e014 --stat` |
| **S1 — adapter and runner** (fixed, `73e9bb854e`) | `pm_dg6b_guard_suites` replays the complete checker per family under its recorder: each asserted negative (`expect_failure`: Probe corpus, fixture negatives, round-9 witnesses) supplies the observation of its first refusing phase, targeted at the refusing row; every passing evaluation outside a negative is a control. It re-runs every negative with only its refusing row cut (complete-boundary flip, lane evidence). `pm-dg6b-guard-tables.py` runs the tool once per (phase, family) and copies its credit. | `scripts/pm_dg6b_guard_suites.py:59` (`Collector`), `:116` (`collect`), `:245` (`suite_for`); `scripts/pm-dg6b-guard-tables.py` | `python3 scripts/pm-dg6b-guard-tables.py --family <f> --out <dir> --pool <collect dir>` (one process per family). |
| **Two-defect negatives the tool reported** (fixed, `e0de248c4a`) | The lane matrix reported the 42 `invalid_project_partition_*` stage fixtures (14 non-auth families × 3): each put the same invalid value in the source scope partition and the record partition, so PA01 and PA02 both refused. Each is now two single-defect cases, `/scope` and `/record`. No other negative refused two rows. | `Plans/dg6b_event_contract_fixtures.json` (`stage_cases`) | Lane matrix: 0 problems in every suite; tool: no masked negative. |
| **Missing negatives for unproved rows** (fixed, `94eb20e014`) | Before round 9, 484 row×family cells (75 distinct rows) and 10 of the 12 shared fence rows had no negative of their own. `pm_dg6b_round9_cases` adds one witness per row and family, each from a valid case of its own family with one source change (derived identities, keys and stored carriers re-derived), each asserted to be refused **by its own row** (`expect_failure(..., row=...)`): frozen Storage instance, redaction/scope kind/project/run/node/attempt envelope copies, record partition, payload types and original Server (relational helpers), retry from another Server, operation lookup ref, carrier ref digest/size, undecodable and schema-invalid decoded operations, request-scope schema and copy, Project home rules, every owner request/result/home copy, creation source, update CAS, empty-lineage override and `tier_id` owner, resolution lineage/field copies and carrier integrity, schema reference/metaschema fences and the eight preparation fences. While building them, the RR06 witness exposed a fault in the first draft of the restructure (payload and result field names collided, so the row compared a value with itself); it was fixed before the commit and the generator now refuses a self-join. | `scripts/pm_dg6b_round9_cases.py:41` (`family_cases`), `:142` (`persona_cases`), `:287` (`shared_cases`) | Every suite: `rows_without_negative` empty. |
| **Rows a family cannot reach** (declared, `73e9bb854e`) | Five rows are structurally unreachable on some families' own paths; their suites take one recorded negative of the same table from a named donor family, listed separately (35 cells): SC01 for the 13 non-Persona families (their closed source adapter embeds the same strict WorkflowScopeV2, so AS01 decides it); RY02 and OS01 for the 6 Persona families (the Persona scope key holds the Server, so equal event IDs imply equal keys; Persona identity reads the Server from the typed payload scope); PA01 and EJ07 for the 5 auth families (application scope fixes partition `app` and `project_id` null). | `scripts/pm_dg6b_guard_suites.py:189` (`BORROW`), `:207` (`borrow`) | Per-family table below (borrowed column); `summary.json` `borrowed` per suite. |
| **Clauses removed as already decided** (`94eb20e014`) | Not repeated because an earlier row decides the same predicate on the same values; each is commented in place: record_contract's second WorkflowScopeV2 pass without formats (SC01 runs it with formats); the operation carrier's schema_id/schema_version/event_type header join (OP01 and OG01 bind both copies to the same per-family constants); the operation and resolution carrier `media_type` joins (OP01/RT01 const plus TI03); the Persona request `scope` copy in the request loop (identical to PC02); override owner presence and override membership (persona.selected payload schema). No other refusal was removed. | `scripts/pm-dg6b-event-contracts.py:401`, `:407`, `:568`, `:590`, `:653`, `:874`; `scripts/pm-dg6b-table-generate.py:250`, `:256`, `:272`, `:421` | Reviewer check against the named schema clauses in `Plans/dg6b_event_contracts.schema.json`. |
| **Behaviour changes, none weaker** | A non-hex resolved body and trailing bytes after a MessagePack value used to crash (`ValueError`/`ExtraData` with no code); both now refuse `payload_ref_integrity`. The preparation operation binding compares canonical JSON text (exact typed) instead of Python equality. A metaschema-invalid selected schema now refuses `invalid_schema` instead of raising `SchemaError`; an unresolved reference refuses `unresolved_schema_ref` without the reference text appended. Within `persona_semantic`, writer is checked before access and the storage-instance copy before the other copies (same codes for every single defect). Unknown adapter kinds and fixture stages are harness `KeyError`s. | `scripts/pm-dg6b-event-contracts.py:278` (`resolve_schema_graph`), `:367` (`resolved_body`), `:381` (`decoded_body`), `:811` (`transport`), `:1079` (`preparation_contract`) | Every family CLI pass with unchanged expected codes. |
| **Astra-4 coherent bad positives** (re-run) | The seven coherent bad positives inserted as `append_valid` still make the unchanged family CLI exit nonzero, refused through a table row: plugin.hook.error payload_schema, plugin.hook.invoked payload_schema, persona.selected payload_schema, persona.created protected_identity, persona.deleted protected_identity, persona.imported protected_identity, persona.updated protected_identity. | external `verify/counterexample-cli.json` | 7/7 pass. |
| **S2 — shared number rule** | Part 2B (needs NUMRULE gates). | Listed below | — |
| **S3 — timestamp formats** | Part 2B. Interim only (below). | Listed below | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new. No `Plans/*.md` changed, so no shard or index regeneration.

## Guard-table result

The gated tool ran **763 suites** (one per phase table per family, plus 4 shared-only tables): **1640/1640 row cells proved, 0 failed suites**, 2575 distinct single-row negatives (35 borrowed cells, declared above). 173 distinct rows in 76 tables. Lane matrix problems: 0. Collection findings: 0. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. Own negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays").

| Checker | Tables | Rows | Row cells proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked | Borrowed cells |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|
| Shared fences: strict JSON, schema references, preparation | 4 | 12 | 12/12 | none | 12/12 | 28 | 0 | 0 | 0 |
| Schema occurrences (one row per validated subject) | 19 | 19 | 268/268 | none | 272/272 | 0 | 0 | 0 | 13 |
| `append_contract`: replay policy, retry | 2 | 5 | 95/95 | none | 283/283 | 528 | 0 | 0 | 6 |
| `record_contract`: grants, frozen source, scope, partition, identity, envelope, body, read token | 11 | 28 | 518/518 | none | 777/777 | 1777 | 0 | 0 | 16 |
| `semantic`: auth key scope, retry payload, hook block, cadence | 4 | 4 | 20/20 | none | 21/21 | 0 | 0 | 0 | 0 |
| SP-337 byte stages: inline, reference, integrity, operation and resolution carriers | 9 | 21 | 291/291 | none | 701/701 | 1746 | 0 | 0 | 0 |
| `history_contract`: retained flags, Storage join | 2 | 11 | 209/209 | none | 247/247 | 1140 | 0 | 0 | 0 |
| `persona_semantic`: Persona relational rules and owner copies | 25 | 73 | 227/227 | none | 262/262 | 727 | 0 | 0 | 0 |

Per family (every phase table the family reaches; shared witnesses of the same table ride with each family):

| Family | Suites | Row cells proved | Own-witness cells | Borrowed cells | Distinct negatives | Failed suites |
|---|---:|---:|---:|---:|---:|---|
| `auth.github.authenticated` | 36 | 74/74 | 71 | 3 | 115 | none |
| `auth.github.device_code.issued` | 36 | 74/74 | 71 | 3 | 110 | none |
| `auth.github.disconnected` | 36 | 74/74 | 71 | 3 | 110 | none |
| `auth.github.failed` | 36 | 74/74 | 71 | 3 | 110 | none |
| `auth.github.token.polling` | 37 | 75/75 | 72 | 3 | 111 | none |
| `persona.created` | 49 | 113/113 | 111 | 2 | 168 | none |
| `persona.deleted` | 51 | 109/109 | 107 | 2 | 165 | none |
| `persona.exported` | 46 | 102/102 | 100 | 2 | 149 | none |
| `persona.imported` | 51 | 111/111 | 109 | 2 | 165 | none |
| `persona.selected` | 58 | 132/132 | 130 | 2 | 209 | none |
| `persona.updated` | 50 | 113/113 | 111 | 2 | 167 | none |
| `plugin.hook.blocked` | 35 | 73/73 | 72 | 1 | 122 | none |
| `plugin.hook.error` | 34 | 72/72 | 71 | 1 | 136 | none |
| `plugin.hook.invoked` | 34 | 72/72 | 71 | 1 | 136 | none |
| `plugin.load_failed` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.loaded` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.permission.override` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.tool.collision` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.tool.registered` | 34 | 72/72 | 71 | 1 | 118 | none |
| `shared` (JSON, references, preparation) | 4 | 12/12 | 12 | 0 | 12 | none |

Every row of every table and its per-family cut result are in the per-suite tool reports (`tool/<family>/<phase>__<family>.json`, gzipped when over 20 KB) and `aggregate.json` under the evidence directory.

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`). The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each negative was re-run through its whole call with only its refusing row cut: of 10362 negative calls (the 12 shared fence witnesses re-run in each of the 19 family passes), 6320 are accepted. The rest are refused later by a distinct invariant that watches the same source fact: a wrong-typed flag cut at its adapter row is also not exactly True/False (SG01/SG02, HF01–HF07, HS01, RA03/RA04, DW01, PM01/PM02, PF01, PK01, PV01, PX01); a payload refused by PS01 is the same invalid body inline (EP01, PJ01); a physical operation refused by OP01 still differs from the decoded or expected operation (OG01, OF01/OF02, OJ01); an owner-schema defect also breaks a copy join (PC01, QK03, QK09, RR04, RR07); direct relational-helper probes reach identity and retry rows (ID01, SO01, SS01); and a cut adapter row leaves derivation reading a wrong-typed field (`derivation_requires_cut_row`). Counts per cut row are in `verify/flips.json.gz`. None reaches another row of its own table, so each stays a single-row negative for the tool.

**Shared tool limits met.** One module per table, at most seven rows, each prescanned from its text before use. The only `NonGuard` is the `return g.Case(table, check, context)` plumbing return. The first full run found one static stop: CR06 used `list.count` on a list display, which the purity scan does not certify; it is now one chained comparison (`4cc3643606`), and the evidence run is at that head.

**What Astra keeps finding, probed for part 2A.** (1) Identities and digests are recomputed in derivation and compared by rows (ID01, IK01, TI01, OF05, RF05, OJ01, RJ01); forged copies are the negatives. (2) Storage sequence and times stay outside `semantic_record`; RY03 compares the caller semantic digest, HS04 the full canonical record bytes against the independent Storage record. (3) `history_contract` has no replay-policy row, so retained replay-only history stays readable; withdrawn, foreign and forged history refuse at HF/HS rows. (4) Every former `same_value` join is a `digest_of` exact-typed-bytes comparison; joins that used `!=` keep it. (5) R02 walks every `$ref` including unused definitions; the new dangling-definition witness refuses. (6) Inline body (IS01), physical operation (OV01) and resolution (RZ01) sizes are measured in canonical bytes. (7) Retry validates the original first; operation recovery runs the complete append first; history validates the original record and Storage. (8) Masked negatives: tool `masked` empty on every row; complete-boundary flips reported above. (9) The oracle cell stays PARTIAL. (11) Wrong-type flags refuse at their adapter rows before any truth-value row; integers are exact `int`. (10, 10a, 12) are part 2B.

**Timestamp fields — interim only.** My own review of the timestamp fields is interim only (pm7-build, 2026-11-05 16:50Z); it is not a certification. DG6B passes an explicit `date-time` checker (`utc_datetime`) at every schema occurrence that has timestamps. A probe of it at this head: it accepts `2026-11-04T12:00:00Z`, fractional seconds and lowercase `t`; it refuses lowercase `z`, `+00:00`, a missing zone, a space separator, a trailing LF, `2026-02-30`, `23:59:60` and non-strings; **it accepts `24:00:00Z`** (Python 3.14 `fromisoformat` reads it as the next midnight). Part 2A adds no date-time rule and changes no timestamp field.

## Part 2B items

- **S2 — shared number rule (CV-1100/1101, SP-1100/1101, shared helper).** `scripts/pm-dg6b-event-contracts.py:158` (JSON Schema `integer` redefined as exact `int`), `:455`–`:458` (`identity` preimage: `revision` through `json.dumps`), `:909` (record digest through `rfc8785.dumps`, the 2**53 semantic-digest question), `:127` `digest_of` over `binding_bytes` (`scripts/pm_event_index_binding.py:51`–`:53`: uint64 range, floats unencodable; Storage uint64 boundaries), `:486` (cadence `previous + 5`); tables `scripts/pm_dg6b_table_persona_update_cas.py:36` (UC06 order), `pm_dg6b_table_persona_delete_cas.py:16` (DC01), `pm_dg6b_table_retry.py:16`–`:24` (RY01–RY03), `pm_dg6b_table_cadence.py:16` (CD01); witnesses `scripts/pm_dg6b_full_oracles.py:47`–`:48` (`rebuild` preimage) and `:265`–`:268` (decimal/exponent `producer_sequence_id`); owner identity paragraphs `Plans/storage-plan.md:29624` (SP-670, one per family thereafter), SP-671 at `:29736`, SP-672 at `:29949`.
- **S2 — authenticated at-write recipe selection for history.** `scripts/pm-dg6b-event-contracts.py:417` `history_contract` validates a retained original with the current recipes (`record_contract`); no recorded recipe edition selects them (item 10a).
- **S3 — timestamp formats (interim only, above).** `scripts/pm-dg6b-event-contracts.py:488`–`:495` (`FORMAT`, `utc_datetime`: lowercase `t` and `24:00:00Z` accepted; retained `+00:00` and lowercase-`z` spellings refused regardless of their at-write recipe); `Plans/event_record.schema.json:212` (`date-time` for occurred/observed/persisted); the 40 `date-time` occurrences in `Plans/dg6b_event_contracts.schema.json` (every family `ts`); `scripts/pm_dg6b_table_envelope_a.py:24` (EJ03 joins `occurred_at_utc` to `ts` by string, spelling-sensitive); `scripts/pm-dg6b-event-contracts.py:1003` (retry Storage-time fixture values).

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 1 self-grade at `e0fe6998d8`; after is this part 2A self-grade. Every cell is carried; `positive_negative_oracles` cites the tables and states the proved cells.

| Exact family | Before → after |
|---|---|
| `auth.github.authenticated` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.device_code.issued` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.disconnected` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.failed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.token.polling` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.created` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.deleted` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.exported` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.imported` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.selected` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.updated` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.hook.blocked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.hook.error` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.hook.invoked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.load_failed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.loaded` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.permission.override` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.tool.collision` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.tool.registered` | 9P / 2Q / 1A → 9P / 2Q / 1A |

171 PASS / 38 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals. Every cited quote was re-verified at its line in this tree; the two quotes the restructure removed (`def same_value`, the inline protected-ID test) now cite `digest_of` and row PM03.

## Commands and evidence

Heavy checkers ran one at a time with at least 10 GB available (the tool MemoryGate paused below 10; each step waited below 11). PM7 work was not waited on or touched. Commits: `4842b41e5a` (tool merge), `e0de248c4a`, `94eb20e014`, `73e9bb854e`, `4cc3643606`, then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/sweep-p2a/` (SHA-256 of every file in `MANIFEST.json`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files |
| `python3 scripts/pm-dg6b-table-generate.py scripts --check` | 0 | 76 phases, 173 rows, no stale or extra module |
| `python3 scripts/pm-dg6b-event-contracts.py --family <f>` ×19 (head `4cc3643606`) | 0 ×19 | 19/19 `pass`, 11.2–20.6 s, peak RSS 150 MB (`verify/checker/`) |
| `python3 scripts/pm-dg6b-guard-tables.py --family <f> --out tool/<f> --pool pool` ×19, then `--family shared` | 0 ×20 | 763 suites `PASS`; `tool/<family>/summary.json`, `aggregate.json` |
| collect pass `--collect-only --no-flips` ×19 (donor pool) | 1 ×19 | expected: without the pool the declared borrowed rows have no negative |
| counterexample CLIs (`verify/counterexample-cli.json`) | 0 | 7/7 refused through a table row |
| complete-boundary flips (`verify/flips.json.gz`, lane evidence) | 0 | 10362 negative calls: 6320 accepted, 4042 refused later (reasons above) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3139 shards, 0 failures |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers (carried from part 1) and 9 `plan_unit_removed_without_ledger_decision` for DL-333, DL-335..340, DL-349 and UCC-230, which main added after this branch's base; none names a DG6B file. Integration rebase owns them. |

---

# DG6B — Sweep part 1 (earlier report, unchanged): prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `5cc7c461d08d993c0aa4c0bdeb6ccd4e98131468`. Rebased main: `e42ce235b4711325ced818c777f070c3ee0d7952`. Fix commit: **`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`**. Native execution: **NOT_RUN**.

**B1, B2 and B3 are fixed in part 1. All nineteen family checkers pass. No family is READY: the shared number rule, guard-table tool and subsequent Sol/Astra reviews remain required.** Membership stays ABSENT, retention PARTIAL / PENDING_RETENTION_DECISION, disposition UNDISPOSITIONED.

## Sweep part 1: findings and responses

| Item | Response / exact location | How to verify |
|---|---|---|
| **Deck 2 — none assigned** | No product answer is extended. Landed DL-045 (`Plans/Decision_Log.md:560`) limits technical definitions to “already specified behavior”; landed DL-400 (`:4390`) requires three batch landings with review. These remain boundaries, not new decisions. | `owner-premises.json`; no Decision Log or registry diff from rebased main. |
| **B1 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `scripts/pm_dg6b_full_oracles.py:259` and `:369` add separate requested/effective account negatives for every family. Only one EventRecord account changes; retained Storage bytes authenticate that exact envelope. Existing product comparisons remain intact. | Nineteen full CLIs; 38 single-comparison removals flip only their own append/history pair, keep every other corpus negative at its original refusal and make the formerly surviving full suite fail. `account-regressions.json`. |
| **B2 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `Plans/dg6b_event_contracts.schema.json:1854` / `:7546`; payload/operation enums and selected logical/inline frozen-resolution enums bind 18 existing hook spellings and seven selection sources. The three stored-operation registry copies match. Invalid `tool.before`/`manual` inputs and every dependent byte/digest/size copy are repaired. | Full CLIs for hook.error, hook.invoked and selected; two coherent unknown/retired values plus five wrong types per family. All 18 hook spellings and seven sources have append and exact-byte retained positives. The three original bad-positive CLIs exit 1. |
| **B3 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `scripts/pm-dg6b-event-contracts.py:15` / `:383` verifies the original target against section 6’s nine protected core IDs independently of `protected_id=false`. Update’s source identity changes coherently with its target. | Four mutation families × nine complete protected-ID negatives; removing only that guard accepts each target while protected=true still refuses. Four original coherent assistant bad-positive CLIs exit 1. Protected selection/export and their retained originals remain positive controls. |

No item is disputed or stopped for a new Jared choice. No new hook, selection source, reserved-ID policy, command, retention assignment or PlanUnit ID is introduced.

## Family grades before and after

Before is Astra 4, which supersedes the round-8 author/Sol 9 claims. P=PASS, p=PARTIAL, A=ABSENT. C4/C9 recover nine cells. C12 remains PARTIAL in all nineteen pending complete shared isolation, even though the concrete B1 missing negatives now exist.

| Family | Before | After | Complete negative cases | Prepared state |
|---|---|---|---:|---|
| `auth.github.authenticated` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 168 | NOT_READY — part 2 |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.failed` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 168 | NOT_READY — part 2 |
| `plugin.hook.error` | 7 P / 4 p / 1 A | 9 P / 2 p / 1 A | 173 | NOT_READY — part 2 |
| `plugin.hook.invoked` | 7 P / 4 p / 1 A | 9 P / 2 p / 1 A | 173 | NOT_READY — part 2 |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.loaded` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `persona.created` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 224 | NOT_READY — part 2 |
| `persona.deleted` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 228 | NOT_READY — part 2 |
| `persona.exported` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 211 | NOT_READY — part 2 |
| `persona.imported` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 229 | NOT_READY — part 2 |
| `persona.selected` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 239 | NOT_READY — part 2 |
| `persona.updated` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 227 | NOT_READY — part 2 |

**Totals: 162 PASS / 47 PARTIAL / 19 ABSENT → 171 PASS / 38 PARTIAL / 19 ABSENT. Prepared READY: 0/19 → 0/19.** All self-grade source quotes, line ranges and hashes are refreshed against the rebased source tree.

## B1 guard-removal table

Each row represents two independent predicates, never one duplicate set. For requested_account_ref and effective_account_ref separately, `account_custody/FIELD` and `history_account_custody/FIELD` flip. The other account’s two negatives and every other `family_probes` negative keep their exact stock refusal. The original full CLI corpus also detects either removal. This is a focused replay of Astra’s B1 experiment, not a complete assertion inventory.

| Family | Requested-account targets flip | Effective-account targets flip | Other negatives staying rejected per cut |
|---|---:|---:|---:|
| `auth.github.authenticated` | 2 | 2 | 166 |
| `auth.github.device_code.issued` | 2 | 2 | 163 |
| `auth.github.disconnected` | 2 | 2 | 163 |
| `auth.github.failed` | 2 | 2 | 163 |
| `auth.github.token.polling` | 2 | 2 | 164 |
| `plugin.hook.blocked` | 2 | 2 | 166 |
| `plugin.hook.error` | 2 | 2 | 171 |
| `plugin.hook.invoked` | 2 | 2 | 171 |
| `plugin.load_failed` | 2 | 2 | 164 |
| `plugin.loaded` | 2 | 2 | 164 |
| `plugin.permission.override` | 2 | 2 | 164 |
| `plugin.tool.collision` | 2 | 2 | 164 |
| `plugin.tool.registered` | 2 | 2 | 164 |
| `persona.created` | 2 | 2 | 222 |
| `persona.deleted` | 2 | 2 | 226 |
| `persona.exported` | 2 | 2 | 209 |
| `persona.imported` | 2 | 2 | 227 |
| `persona.selected` | 2 | 2 | 237 |
| `persona.updated` | 2 | 2 | 225 |

The pre-sweep `DG6B.guard-removal-summary.json` and earlier tables are historical evidence of their pinned corpus only. The local proof script is byte-identical to the reviewed head; its completeness claims are not carried forward. Whole-lane inventory and per-site duplicate proof remain S1.

## Part 2 items

1. **S1 — proof machinery / shared tool:** `scripts/pm-dg6b-guard-proof.py:36` (`guard_inventory`, still unused), `:395` (`run_family`), `:419–426` (cut grouping), `:479–508` (reported inventory). Adopt the accepted shared `pm_guard_isolation.py`, expose named guard predicates/tables and reconcile every production/schema assertion with its witness. DG6B is the port’s worked example; no checker restructuring or local proof-engine repair was attempted here.

2. **S2 — number domains and historical recipes:** `scripts/pm-dg6b-event-contracts.py:298`, `:786`, `:260`; `scripts/pm_dg6b_full_oracles.py:50–55`; each SP-670/671/672 identity paragraph. Adopt NUMRULE CV-1100/1101, SP-1100/1101 and the shared helper after acceptance. Cover 2**53 semantic-digest mismatch, JSON number spellings, Storage uint64 boundaries and unforgeable at-write recipe choice. Add no local number cap/serializer; do not cap Storage at 2**53, normalize physical floats or erase signed zero.

3. **S3 — formats and retained spellings:** `scripts/pm-dg6b-event-contracts.py:337` / `:260`, EventRecord date_time_string and every family ts. Bind allowed UTC spellings and authenticated at-write format recipe; preserve exact retained `+00:00` and lowercase-z bytes when their original recipe permits them. Keep malformed/forged alternatives refused. Existing narrowing remains explicitly open; historical bytes are not normalized.

## Verification and integration

19 complete family CLIs pass, exercising **3531** complete negatives. The focused B1 replay checks 38 comparison removals and 76 flipping targets, with unchanged complements and 38 detected weakened full suites. B3 covers 36 protected targets. All seven original Astra coherent bad-positive CLIs now exit 1. These counts overlap and are not added as independent coverage.

| Check | Exit | Result |
|---|---:|---|
| `astra4-regressions` | 0 | see output |
| `shard-generate` | 0 | pass |
| `index-generate` | 0 | pass |
| `shard-check` | 0 | pass |
| `index-validate` | 0 | pass |
| `projects-refresh` | 0 | pass |
| `github-integration` | 0 | pass |
| `primary-command-catalog` | 0 | see output |
| `storage-profile` | 1 | fail; 41 reported errors |
| `diff-check` | 0 | see output |

Shard regeneration changes only the lane’s eight canonical owners: automated_testing_system, contracts_v0, github_api_auth_and_flows, personas, plugins_system, storage-plan, storage_value_registry, ui_command_catalog. Conflicted generated snapshots were discarded during the rebase and regenerated once from final canon; no shard/index was hand-merged. The copied ignored currentness edition has 15 byte/hash-verified files. Index validation’s actual status is recorded above; no global governance PASS or seal is claimed. Storage-profile errors are compared with the same checker reading only the pinned-main registry; the ordered error lists match exactly.

Main advanced during checking to `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`; its only delta from the actual rebase pin is the upstream plan-migration snapshot and landing baseline. No owner, schema, fixture, registry or checker changed. Those governance paths are not edited or refreshed by this lane.

Existing source/frame/token native authentication, native CAS/crash/restart execution, admission and pending retention remain separate obligations. No governance baseline, Spec Lock, evidence bundle, frozen validator, registry admission, Decision Log or test-file edit was made.

Only `persona_semantic` changes among the production checker’s 51 functions. Identity, physical encoding, history and timestamp functions are unchanged. Recurring classes 1–9/11/12 remain covered by the full stock suites; B1 adds custody coverage, B2 closes owner-domain contradictions, and B3 closes protected-ID classification. Numeric/format recipe issues and complete independence proof remain S2/S3/S1 rather than being labelled closed.

## Authority, IDs, resources and evidence

No newly authored binding in this sweep. The nineteen existing exact DL-045 preparations, their own semantic/Storage units, consumer names, per-family searches and original premise evidence remain in branch history and DG6B.authority-audit.json at its recorded historical input. Rebase preserves current main, including Persona P-060/UCC wording. Current hook catalog/alias, Persona source enum, protected-ID and DL-045/DL-400 premises are rechecked in owner-premises.json.

**New IDs: zero.** Whole-lane IDs remain GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691 and ATS-335..336 (26). The two briefing memory files were absent at their named Nas1 paths; no allocation was needed, and currentness copying/hash verification was performed directly.

Initial Nas1 resources: 11 GB available RAM, 495 GB free disk. All checker starts preserve the 6 GB RAM floor. Checks run serially within this worker; heavy index/proof jobs wait for other heavy checkers. Small peer checks may run concurrently. The initial conservative wait was narrowed after observing 30 MB peer checks; the memory floor was never lowered. No mail, subagent, main push, landing lock, browser or server. The worktree and temporary environment are removed after the lane push.

Retained evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/sweep-p1/`. Reproduction scripts and dependency versions are retained there; recreate the literal worktree at this branch to replay. Raw outputs remain outside the repository; only this report, refreshed self-grade and compact checks summary are committed.

| Evidence path (under sweep-p1) | SHA-256 |
|---|---|
| `input-pins.json` | `981b1d5c44d898fb1f53903b43ca3634379ed7da927b08313e76b3e574357b63` |
| `family-checks.json` | `2dd8731bf9d4dc307ff642c888d74e6d24b2bad403ae14addff5aa76fa9a7b6a` |
| `account-regressions.json` | `393fef51b0d084e6e026982e67e69407de34a9baab412385039dcdd1c437632b` |
| `protected-regressions.json` | `2289b260d5172429569c2c8fff70e8a344e32723c8b73e16de856591b65ede94` |
| `counterexample-cli.json` | `7fb8eb3be79a450be26d5793a5e24e182195cec81bed85024ec8a1d6ef2ee67d` |
| `owner-premises.json` | `4059454d0db663145f4abde139523c4cbcaa5e3b9cab33e40cf5f1a71cbdb705` |
| `preservation.json` | `67e85ab20b865c476aa5d32f7ed0b7c2e52e4f72761bacc5ca9395849dc3c03a` |
| `derived-scope.json` | `f20746fca7cf330b12c985867d066261b14fa0c52e88b3d440ed23a644f03c51` |
| `verification.json` | `d28ed981f4036e173f497e1789770a49fe2bb583d1e059412f932bdc650596b8` |
| `storage-profile-baseline.json` | `bd2670420bad9104c197c4bd30395cfd2335c43150c277f7bad52b6e600d0582` |
| `grade-transition.json` | `eb5ebeafc6064ad7a697d0b618285588c4a0d1e8af67f9cc59ea84407fd2ad80` |
