# S4B-TOKFIX — s4b's 51 Browser checkpoint rows on SP-278's exact durable read token (stream E, PNC-019, 2026-11-15)

**Branch** `plans/ea-pnc-s4b-tokfix-20261115`. **Base** s4b `6b9bd3193c`. **Content head** `7154c94f74`; the report commit follows it. **Why:** INT4 stop D6 (pm-mail `1115132006-033f`), lead decision A (`1115132240-5e06`): rewrite the token and leave the shared checker alone. Planning-data and static-oracle work only. The readiness checker, SP-278, the gated guard tool, the frozen validator and the NUMRULE files are unedited. No reseal; `main` not pushed.

## Result

| Item | Before | After |
|---|---|---|
| **Registry secret-material rows on the 51**, branch | **204**: 102 `storage_value_secret_material_key` on `index_read_token`, 51 on `$defs.durable_read_token`, 51 `storage_value_secret_material_field` on `index_read_token` (rows `families[679..729]`) | **0** |
| **Same, scratch merge into INT4** `1037e6e56d` | **204** (rows `families[685..735]`) | **0** (merge `a693e9e61e`) |
| Other registry data failures | 3 census pins (count, status, tier; D5 re-pins them) | the same 3 |
| **Complete checker** | `pass`, 338 rows, 62 tables | `pass`, **345 rows, 63 tables**, 1020 controls, 45497 negatives (19924 explicit, 25573 generated and credited), 12148 of 12314 pairs witnessed, the same 166 entailed with reasons, 0 failures; also `pass` on the scratch merge |
| **Gated tool** `004bdedd63` | 336/338 proved, 2 entailed, 60/60 PASS | **343/345 proved**, the same 2 entailed rows with the same proofs, **61/61 PASS**, masked 0 |
| **Mutations** | 50/50 | **54/54** (C51..C54 new) |
| **Token-schema mutations** (new) | — | **10/10** on all 51 rows, branch and merge |
| **Grades** | 11/0/1 ×51 | **11/0/1 ×51** unchanged; 50 registry citations moved to their new lines, 1428/1428 quotes at their lines |

## What changed

| Path | Change | Commit |
|---|---|---|
| `Plans/browser_program_event_contracts.schema.json:54` | `$defs.durable_read_token` is now exactly `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token` without `redb_snapshot_id`: no `$ref` primitives, no `(?![\s\S])` anchors, no description. The file's description (`:5`) says so. | `ebd53a4e93` |
| `Plans/storage_value_registry.json` (51 rows, first `family_id` at `:276723`) | Each row's inline `value_schema.$defs.durable_read_token` the same; each row is still the schema file's checkpoint definition plus the closure of its local `$defs` (key sets unchanged). Rewrite tool: `tools/s4b_token_rewrite.py` (`--check` is exit 0 at the head). | `ebd53a4e93` |
| `scripts/pm_s4b_browser_events.py:153-224` | The checker derives SP-278's durable token as readiness does, and refuses to load unless the schema's token equals it and every checkpoint and retired generation names it by one local `$ref` (`durable_token_problems`, `:167`; guard `:181`). `token_full_match` (`:200`) and `checkpoint_tokens_full_match` (`:215`) carry the trailing-LF rule. | `bdeca4000b` |
| `scripts/pm_s4b_browser_events.py:2098` | New row **`derived_token_full_match`** (table `derived_shape`): every pattern string of the current and each retired token full-matches its SP-278 pattern. Its gate is `d_schema` (`:2046`); `d_ok` (`:2052`) now requires it, so the joins stay behind it. 11 witnesses: a trailing LF on each of the 10 pattern fields, plus one on a retired token. | `bdeca4000b` |
| `scripts/pm_s4b_browser_events.py:2023`, `:2196`, `:2266`, `:2308`, `:2365` | `checkpoint_ok` adds the same conjunct, so the read, withdrawal, rebuild and cleanup validity rows refuse what the old token schema refused there. Each gains a trailing-LF witness. | `bdeca4000b` |
| `scripts/pm_s4b_browser_events.py:2223` | New table **`read_token`**: six read joins (`read_token_storage_instance_id`, `_checkpoint_key`, `_checkpoint_ref`, `_generation_anchor_hash`, `_index_dataset_name`, `_source_selection`, code `token_stale`), 10 witnesses (see "Finding"). `read_token_generation_id`'s witness (`:2211`) now changes the stored generation alone. | `7154c94f74` |
| `scripts/pm_s4b_browser_events.py:3057`, `:3118` | `registry_row_problems` (in `spec_consistency`): each registry row is the schema file's definition by value and carries the SP-278 token by `$ref`. | `bdeca4000b` |
| `scripts/pm_s4b_table_{derived_shape,read,withdrawal,rebuild,cleanup,read_token}.py` | Regenerated; `--check` reports 63 tables, 345 rows, none stale. | `bdeca4000b`, `7154c94f74` |
| `scripts/pm-s4b-mutations.py:122-129` | C51..C54. | `bdeca4000b`, `7154c94f74` |
| `scripts/pm-s4b-token-mutations.py` | New: token-schema mutations over all 51 rows. | `bdeca4000b` |
| `Plans/_shards/storage_value_registry/**`, `Plans/.plan_index/**` | Regenerated; nothing else moved. | `9878ad048d` |
| `reports/event-authority-20261114/S4B-self-grade.json` | 50 `line_start`/`line_end` pairs for registry `family_id` quotes; nothing else. | `02cde82baf` |

Owner prose needed no edit. SP-2500..2550 say "the nine-field durable read token (DL-076)", and ATS-2500 lists "schema ... durable token" and "token currency". Both still hold.

## Why a row and not the schema (the W3A precedent)

SP-278's patterns are `^...$`. Under Python's validator a `pattern` is a search and `$` also matches before one final LF, so the canonical token accepts `<hex64>\n` (FIX-ROUND standing check 5). s4b's `(?![\s\S])` anchors refused it inside the schema. That is exactly what made the token non-canonical. As in W3A's INT3 repair (`0d8bed4ea2`, `CP16_token_full_match`), the refusal moves to its own guard: `derived_token_full_match` on the derived boundary, and the `checkpoint_ok` conjunct on the other four.

**Where the 19 schema-walk defects per family went** (`walk-s4b-head.json` vs `walk-tokfix.json`, `browser.program.completed`; the same 19 for every family, hence −969 generated credits). Each is still refused at exactly one row, and none is accepted:

| Defect at `/index_read_token/...` | Before | Now |
|---|---|---|
| trailing LF on the 10 pattern fields | `derived_value_schema` | `derived_token_full_match` |
| trailing LF, overlong, space on `checkpoint_key`, `checkpoint_ref`, `index_dataset_name` (9) | `derived_value_schema` | `derived_token_<field>` (join) |

## Finding: the read did not join six of the nine token fields (pre-existing; closed here)

SP-2500 Read: the reader discloses "only from a `current` checkpoint whose token joins the current SP-278 selection". The read joined only `generation_id`, `frontier_revision` and `frontier_sha256`.
- **At s4b's head:** a stored token with a foreign but well-formed value in any of the other six fields was accepted (`read-gap-s4b-head.json`: all six `[]`).
- **After the rewrite alone:** SP-278's token takes `minLength: 1` names and `format: uuid`. A malformed name, dataset or uppercase instance in a stored token was then accepted too, where the old lane schema had refused it (`name-probe-*`).
- **Now:** each field is joined, and every such case is refused at its own join (`read-gap-tokfix.json`).

| Boundary (stored/proposed token defect) | s4b head | now |
|---|---|---|
| derived: `checkpoint_key` LF / dataset space / uppercase instance | `derived_value_schema` | `derived_token_checkpoint_key` / `_index_dataset_name` / `_storage_instance_id` |
| read: same three | `read_checkpoint_valid` | `read_token_checkpoint_key` / `_index_dataset_name` / `_storage_instance_id` |
| withdrawal | `withdrawal_value_valid` | `withdrawal_core_unchanged` |
| rebuild | `rebuild_value_valid` | `rebuild_token` |
| cleanup | `cleanup_values_valid` | `cleanup_current_unchanged` |
| read: well-formed foreign value in the six fields | accepted | `read_token_*` |

**Residual:** a malformed *name* field inside a **retired** generation's token is no longer refused by the read. The read discloses only the current value. Derived, withdrawal, rebuild and cleanup still refuse it through their retired-history joins. Pattern fields of retired tokens stay under the full-match rule everywhere.

## Token-schema mutations (`scripts/pm-s4b-token-mutations.py`, all 51 rows, branch and merge)

Each edit is applied to deep copies of all 51 rows and of the schema file. Three verdicts must equal the stated ones on every row: readiness `storage_value_registry_data_failures` for that row, the checker's load guard `durable_token_problems`, and `registry_row_problems`. A self-check with a deliberately wrong expectation fails, as it should.

| Id | Mutation | Readiness (per row) | Load guard | Row check | Result |
|---|---|---|---|---|---|
| TM00 | unmutated | none | none | none | pass |
| TM01 | s4b's old `(?![\s\S])` anchor on `generation_id` | 3 key (`index_read_token` ×2, `durable_read_token`) + 1 field | `durable_read_token_not_sp278` | `storage_registry_durable_read_token` | pass |
| TM02 | a token member by `$ref` to a lane primitive | same 4 | same | same | pass |
| TM03 | a description added | same 4 | same | same | pass |
| TM04 | stricter-but-equivalent narrowing (`maxLength`) | same 4 | same | same | pass |
| TM05 | live ten-field token with `redb_snapshot_id` | `storage_value_registry_live_snapshot_fence_persisted` | same | same | pass |
| TM06 | secret-bearing member `session_token` | the 4 + key `session_token` | same | same | pass |
| TM07 | field renamed `index_token` | 2 key + 1 field on `index_token` | `index_read_token_not_durable_ref` ×2 | same | pass |
| TM08 | two-hop alias | key `index_read_token`, key `read_token_alias`, field | `index_read_token_not_durable_ref` | same | pass |
| TM09 | SP-278 token inline (readiness positive) | none | `index_read_token_not_durable_ref` (the lane pins the `$ref` form) | same | pass |

## Checker mutations added (`scripts/pm-s4b-mutations.py`)

| Id | Row | Mutation | Result |
|---|---|---|---|
| C51 | `derived_token_full_match` | `re.fullmatch` → `re.search` | killed: the LF witness is refused at `derived_token_generation_id` |
| C52 | `read_checkpoint_valid` | conjunct dropped from `checkpoint_ok` | killed: refused at `read_token_frontier_hash` |
| C53 | `derived_token_full_match` | retired tokens skipped | killed: refused at `derived_retired` |
| C54 | `read_token_checkpoint_key` | joined to itself | killed: witness accepted |

C01..C50 are all still killed (54/54).

## Gated guard tool (`004bdedd63`)

How it was run:
- `python3 scripts/pm-s4b-guard-proof.py collect --out D`.
- Then `run --out D --table ...` in four table groups, so at most four tool processes ran at once, each job under `MemoryMax=2G`, `MemorySwapMax=0`.
- Then `run --out D --resume` for the summary over all tables. Each group's own exit was 1 only because its summary counted tables the other groups had not yet finished.

The tool is `scripts/pm_guard_isolation.py`, sha256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8` (unedited, the same as s4b's run). Each table's tool report names exactly its own module in `static.files`, at that module's current sha256.

| Result | s4b | now |
|---|---:|---:|
| Tables | 62 | 63 |
| Rows | 338 | 345 |
| Proved by the tool | 336 | 343 |
| Unproved (entailed, alone in own tables, written proofs unchanged) | 2 | 2 (`append_json_budget`, `retained_resolved`) |
| Run tables PASS | 60 / 60 | 61 / 61 |
| Masked negatives | 0 | 0 |

**Changed or new tables:**

| Table | Rows proved | Negatives / controls |
|---|---:|---|
| `derived_shape` | 5/5 | 14 / 6 |
| `read` | 6/6 | 6 / 1 |
| `read_token` | 6/6 | 10 / 1 |
| `withdrawal` | 6/6 | 21 / 6 |
| `rebuild` | 2/2 | 5 / 6 |
| `cleanup` | 5/5 | 5 / 1 |

## Checks (exit codes), head `7154c94f74`

| Command | Exit | Result |
|---|---:|---|
| registry probe (`tools/tokprobe.py`: readiness `storage_value_registry_data_failures`) | — | branch 3 failures, 0 secret; merge `a693e9e61e` 3, 0 secret; INT4 `1037e6e56d` alone 207, 204 secret; s4b `6b9bd3193c` 207, 204 secret |
| `python3 scripts/pm_s4b_browser_events.py --json` | 0 | `pass` (above); merge: `pass`, the same counts |
| `python3 scripts/pm-s4b-table-generate.py --check` | 0 | 63 tables, 345 rows, 2 entailed, none stale (also on the merge) |
| `python3 scripts/pm-s4b-guard-proof.py collect --out D` | 0 | `pass`: 1020 controls, 45497 negatives, 0 findings, 0 matrix problems; only the 2 entailed rows lack negatives |
| `python3 scripts/pm-s4b-guard-proof.py run --out D` (4 table groups, then `--resume`) | 0 | 61/61 tables PASS, 343/345 rows proved, 2 entailed with proofs, masked 0 |
| `python3 scripts/pm-s4b-mutations.py --scratch S` | 0 | 54/54 killed |
| `python3 scripts/pm-s4b-token-mutations.py` | 0 | 10/10 (also on the merge) |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass` |
| `python3 scripts/pm-browser-event-admission.py` | 0 | `pass` (also on the merge) |
| `python3 -m unittest tests.test_pm_browser_event_admission` | 0 | 39 tests OK |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass` (also on the merge after regeneration) |
| `tools/s4b_token_rewrite.py <tree> --check` | 0 | schema and registry up to date (also on the merge) |
| `tools/grade_citations.py <tree>` | 0 | 1428 quotes, all at their cited lines |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | pre-existing, see below |
| `python3 scripts/pm-plan-index.py validate` | 1 | pre-existing, see below |

## Pre-existing failures this lane does not cause (identical at s4b's head)

- **Date-time inventory:**
  - **What fails:** it stops at `scan_exclusions_invalid` (0 nodes scanned). `scripts/pm_event_datetime_exclusions.json` cites 8 contracts_v0, section15 and storage-plan shards by their old numbers; s4b's Plans inserts renumbered them (for example `066-closed-collaborative-...` is now `067-...`). That file is NUMRULE's, so I did not edit it.
  - **Diagnostic:** with scratch-only copies at the 8 old names, the scan runs (290 nodes, 0 unclassified). Its 934 failures (stale exclusions, unreadable and unclassified mentioning containers) are the same set at `6b9bd3193c` and at `7154c94f74` (`dti-diag-*.json`). The token has no date-time node.
  - **Needs:** an integration refresh of the exclusions citations.
- **Plan-index validate:** 195 failures, the same set at `6b9bd3193c` and `7154c94f74` against the same `origin/main` `6385c1c3d3` (`piv-*.json`). 174 are DL units `main` gained after s4b's base (DL-511 on: `plan_unit_removed_without_ledger_decision`); 21 are `plan_unit_removal_ledger_invalid` on `main`'s ledgers.

## Notes for INT4 (late joiner)

- Merge `plans/ea-pnc-s4b-tokfix-20261115` at the report head.
- **Conflicts:** only in `Plans/_shards/storage_value_registry/**` and `Plans/.plan_index/**`. `Plans/storage_value_registry.json` merges cleanly. Regenerate (`pm-shard-plans.py --generate`, then `pm-plan-index.py generate`); never hand-merge.
- **Verified on the scratch merge** `a693e9e61e`: registry 0 secret rows, the s4b checker `pass`, tables not stale, token mutations 10/10, admission `pass`.
- **Registry still reports 3 rows:** the census pins (family, status and tier counts). D5 re-pins them, as before.
- **Not landing-blocking for this lane:** the date-time exclusions citations above.

## Commits

- `7154c94f74 scripts: s4b-tokfix - the read joins every durable-token field to the current SP-278 selection`
- `02cde82baf reports: s4b-tokfix - move the 50 registry citations of the s4b self-grade to their current lines`
- `9878ad048d plans: s4b-tokfix - regenerate the registry shards and the plan index`
- `bdeca4000b scripts: s4b-tokfix - the checker loads only SP-278's durable token; the trailing-LF rule moves to its own row`
- `ebd53a4e93 plans: s4b-tokfix - the 51 Browser checkpoint rows carry SP-278's exact nine-field durable read token`

## Evidence (`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4b-tokfix/`, with `SHA256SUMS`)

- **Branch runs:** `checker.json`, `guard/` (collect summary, per-table tool reports and summaries, `summary.json`), `mutations.json`, `token-mutations.json`, `registry-probe.json`, `numbers-selftest.json`, `browser-event-admission.json`, `unittest-admission.txt`.
- **Scratch merge:** `merge-head.txt`, `merge-checker.json`, `merge-token-mutations.json`, `merge-admission.json`, `merge-registry-probe.json`.
- **Before:** `int4-before-registry-probe.json`, `s4b-head-registry-probe.json`.
- **Comparisons:** `walk-*.json`, `name-probe-*.json`, `read-gap-*.json`, `dti-diag-*.json`, `datetime-inventory-7154c94f74.json`, `piv-*.json`.
- **Tools:** `tools/` (`s4b_token_rewrite.py`, `tokprobe.py`, `grade_citations.py`, `walk_diff.py`, `name_probe.py`, `read_gap.py`).
