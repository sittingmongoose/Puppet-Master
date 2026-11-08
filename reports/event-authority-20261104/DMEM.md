# DMEM — Sweep part 2A (guard tables) and part 2B numbers

**Branch:** `plans/ea-w2-memory-maintenance-20261104`. **Start:** `1abebee498` (sweep part 1). **Gated guard-tool merge:** `09d35571b6` (tool `004bdedd63`, `--no-ff`, exactly the eleven tool files, none edited). **Gated NUMRULE number-scope merge:** `74e62c0e78` (exactly `a16f67c1ef`, `--no-ff`; it brings no main commit; its 163 conflicts were all generated `Plans/_shards/{contracts_v0,storage-plan}` and `Plans/.plan_index` files, resolved by `pm-shard-plans --generate`, `pm-plan-index generate` and `pm-shard-plans --check`, never by hand). **Implementation head:** `c4669460af`; the delivery head (this report commit) is in the external `HEAD.txt`. **No rebase** onto main this round.

**Result.** Every product refusal of the three DMEM checkers is a named row of one of **176 generated phase tables (288 rows)**; the gated shared tool proves **261 of 288 rows** at the implementation head, with 0 masked negatives and 0 unrelated changes; the 27 unproved rows are each decided first by a named earlier row or schema (listed below). The NUMRULE number scope is adopted (CV-1100 current integers, SP-1100 Storage uint64, the shared corpus through the complete checkers, `--self-test --scope numbers` pass 580/580). AMS-022 now says prune/archive only archives (DL-402). The behaviour differential against the merged part-1 checkers shows **0 outcome changes** for part 2A; every part 2B number change is explained below. `positive_negative_oracles` goes **PASS → PARTIAL** for all twelve families (schema keyword cuts are not ported to the tool, SP-1101 dispatch and the timestamp review stay open), so the totals move from 120 PASS / 12 PARTIAL / 12 ABSENT to **108 PASS / 24 PARTIAL / 12 ABSENT**. Membership stays ABSENT, retention PARTIAL, native NOT_RUN; READY stays false. This section and `DMEM-self-grade.json` supersede every status below.

My own review of this lane's timestamp fields is **interim only** (pm7-build, 2026-11-05 16:50Z); no lane is READY on timestamp fields until the shared date-time gate passes.


## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` as `09d35571b6`: the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat 09d35571b6^1 09d35571b6` lists 11 files; `git diff 09d35571b6 HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_traps.py Plans/guard_isolation_traps.json` is empty. |
| **Part 2 item 5 — guard tables** (fixed, `47143ed0a7`) | Every product refusal of `pm_memory_maintenance_events.py`, `pm_memory_archive_events.py` and `pm_memory_policy.py` is one named row of a generated phase table (176 tables, 288 rows, at most seven each), reached only through `require`/`table_refusal`. One phase is one former refusal site (a `require`, a `guard`, a boolean validator conjunct chain, one policy postcondition); `and`-chains and small literal field loops are split per predicate; sequential sites stay sequential phases, so evaluation order and short-circuit reads are unchanged. Derivation computes observations only (recomputed identities and digests, encoded sizes, schema verdicts, presence, mismatch lists). Variant chains (`op`/`opa`/`aop`, `tg`/`tgs`/`tgo`/`tgoa`, `sgr`/`twr`/`cut`/`cuo`/`bdo`/`apo`/`aao`/`asc`, `sgh`/`hm`) reuse one predicate set under the refusal code of their call site. Both checkers assert that every factory requires its rows in table order. | `scripts/pm_memory_maintenance_events.py:50` (`TABLE_PHASES`), `:95` (`table_refusal`), `:111` (`require`), `:128` (`table_order_errors`), `:466` (`target_check`), `:537` (`operation_check`), `:627` (`start_custody_gate`), `:715` (`_append_current`), `:800` (`accept_check`), `:886` (`_transition`), `:1068` (`history_check`); `scripts/pm_memory_archive_events.py:46`–`:262`; `scripts/pm_memory_policy.py:43`–`:241`; generator `scripts/pm-memory-table-generate.py`; index `scripts/pm_memory_tables.py` | `python3 scripts/pm-memory-table-generate.py scripts --check` (176 tables + index current, 288 rows, exit 0); twelve `--family` checkers exit 0 with the order assertion. |
| **Part 2 item 4 (S4) — shared proof tool; retired machinery** (fixed, `47143ed0a7`, `23b6cb48d1`) | `scripts/pm_memory_guard_isolation.py` (AST rewrite, grouped removal sets, incomplete inventory) is deleted. The archive module's removal machinery is gone: `_REMOVED`, `guard()`, `REASONS`, the `core.require` override, `removed()`, `guard_isolation()` and the `run_guards` removal loop; `run_guards` keeps its control/exact-refusal oracle. The archive start custody gate override is now only its canonical-original branch (`canonical_start_checks`). Check 11 is the tool run: `pm_memory_guard_suites.py` records every witness call of the twelve complete family checkers, segmented at the outermost entry point; the first refusing phase of a refused call gives that row's negative, every passing record a control; `pm-memory-guard-tables.py` checks the uncapped lane matrix and runs the gated tool once per table. | `scripts/pm_memory_guard_suites.py:87` (`Collector`), `:206` (`collect`), `:231` (`lane_matrix`), `:246` (`select`), `:275` (`suite_for`); `scripts/pm-memory-guard-tables.py` | `python3 scripts/pm-memory-guard-tables.py --out <dir>`: one process, serial, MemoryGate 10/11 GB. |
| **Missing negatives for unproved rows** (fixed, `47143ed0a7`, `c4669460af`) | The first collection left 107 rows without a single-row negative. New one-defect witnesses (`pm_memory_guard_witnesses.py`), each an intact control the complete entry point accepts plus one change refused by exactly its row, with every copy that observes the change refreshed (rehashed retained digests, coherent manifests and target ids): start custody gate at its own boundary (SG01–SG03), later originals through history reads (SGL01–SGL04), writer numbers, replay policy, receipts and result fields (AP02, AP05, OP04, OP06, OP07, APO01, APO05, AP14, SGC05, SGC06), the phase model (TR05, TWR01–TWR04, CUT02–CUT04, AC01, AS01, SE02, OPA01, RR03, TGO02, SW03, SW04, SE04–SE07, SE09, TF01, PR01–PR03, SEL01, SEL03, TGS02, TGS03, TGS05), the reduced boundary (BD02, BD17, BDO01–BDO04, BD19), SP-278 (CK01, CK02, CK05, CK07, CK09, CK10), Card 6/1b (DC15, DV12, CG06, PS02, AV08 ×2) and the archive writer (AA04, AA09, AOP03, AOP04, AOP06, AOP07, AAO01, AAO05, AA12, ASC00, ASC01, ASC05–ASC08). Every witness is asserted inside both complete checkers. | `scripts/pm_memory_guard_witnesses.py:69` (`maintenance`), `:282` (`archive`) | Each family's checker output lists its witnesses under `guard_table_witnesses` (36–56 per maintenance family, 13–16 per archive family). |
| **Two-defect negatives the lane matrix reported** (fixed, `47143ed0a7`) | Two sites first held coherent two-row negatives: the canonical start original's reference and reduced bindings (a changed producer field is in both projections) and the archive flag check (post-state cases change one flag on both sides). Each pair is now two sequential phases, exactly as the former short-circuit `and` evaluated them (`sgc_reference` then `sgc_reduced`; `av_before_flags` then `av_after_flags`). Two further rows were restructured: the selector target's source join compares the target's own source revision with itself (the source row is built from it), so that tautology has no row (`target_check(..., source=False)`); the archive canonical payload schema is its own phase before the payload binding. | `scripts/pm_memory_maintenance_events.py:670`; `scripts/pm_memory_archive_events.py:46`, `:131`; `scripts/pm_memory_maintenance_events.py:502` | Lane matrix (uncapped): **0 problems**; tool: 0 masked. |
| **Rows unprovable by construction** (kept as defence in depth, in 19 tables that hold no proved row) | 27 rows, each decided first by a named earlier row or schema: AOP02 (archive operation cap): the closed Card 1b operation schemas bound every field; AOP05 (archive terminal reserve): Card 1b operations have no prepared phase, so the table is never evaluated; AP11 (payload schema at the writer): the payload is a producer field, and AP10 compares it with the payload recomputed from a schema-valid operation first; AP12 and SEL02 (inline and selector caps): the closed schemas bound every field; the largest schema-valid selector encodes to 13,641 bytes, below 16,384; BD16 (boundary row phase): a row outside effect_committed/completed cannot produce the completed payload, so BD12 decides first; CK08 (checkpoint scope kind): both retained envelope editions pin scope_kind to project, so CK01 decides first; EF01/EF02, RR01/RR02, RC01/RC02 (access fences inside effect_fences, retry/replay and recover): the same state passed TR01/TR02 at the start of the same transition; OPA02–OPA07 and TGOA02–TGOA05 (post-state operation): the transition computes receipts, result fields and the copied target itself, and OP05 reserves the terminal size, so only OPA01 is reachable (witnessed with a malformed completion time); SGC07 (reduced start fields): a subset of SGC06, which decides first; TGO01, TGOA01 and TGS01 (target schema inside an operation or selector): the operation and selector schemas embed the closed target schema, so OP01/OPA01/SEL01 decide first. No rule was removed. | the tables named in the guard-table result | Tool: exactly these tables `FAIL unproved_guards` (`aop_reserve` is never evaluated, `NOT_RUN_NO_CONTROL`); every other table `PASS`. |
| **Behaviour unchanged** (`47143ed0a7`, `23b6cb48d1`) | A call-level differential runs the merged part-1 checkers (`74e62c0e78` scripts) and the part-2A checkers (`b0ddf4fcbf`) on the same fixtures and logs every top-level model call (function, SHA-256 of the type-tagged arguments, outcome); the old run's lane-local removal-phase calls are excluded. | `diff-2a/compare-*.json` (evidence) | **0 outcome changes in all twelve families.** New keys are the witnesses; the only old-only keys are 50–53 top-level calls per archive family of the retired boolean helper `memory_fields`, replaced by `missing_memory_fields` inside `archive_candidate`/`archive_observations` (every `archive_validate` outcome unchanged). |
| **ATS-315/316 legacy proof claim** (fixed, `40744abfeb`) | The standing-check-11 paragraph, the Storage uint64 and number-proof sentences, the Card 6 group-predicate sentence (two copies), the ATS-316 removal sentence and its acceptance criterion described the retired removal proof; they now name the generated tables, the runner and the shared tool, and say a schema occurrence is one verdict row. Validation surfaces gain the generator check and the runner. | `Plans/Automated_Testing_System.md:7261`, `:7265`, `:7271`, `:7325`, `:7330`, `:7342` | Shards and index regenerated; only Automated_Testing_System outputs changed; shard check pass. |
| **Lane item: AMS-022 under DL-402** (fixed, `b0ddf4fcbf`; stream E owns it) | §7.2 item 6 is confirmed already fixed (`Plans/assistant-memory-subsystem.md:406`: "archive very low-activation gists only (DL-402) … deletion is only by the user"). Every AMS-022 copy is reworded; the pinned-gist protection is its own clause. Changed lines: **`:1561`** canonical text, from "… all in-process with no external services and pinned gists protected from deletion." to "… all in-process with no external services. Monthly summarize/compress and prune/archive only archive and never delete; a memory is deleted only when the user deletes it (DL-402). Pinned gists stay protected, and neither job archives or merges a pinned gist (DL-402)."; **`:1569`–`:1570`** acceptance, from "Prune/archive never deletes pinned gists." to "Prune/archive only archives and never deletes a memory; a memory is deleted only when the user deletes it (DL-402)." and "Prune/archive never archives a pinned gist (DL-402)."; **`:1594`–`:1595`** negative constraints, from "Prune/archive must never delete pinned gists." to "Prune/archive must only archive and must never delete a memory; deletion is only by the user (DL-402)." and "Prune/archive must never archive a pinned gist (DL-402)." No other copy exists on the branch (`git grep` over the whole tree; the only other hit is a quoted report line in `reports/event-authority-20261104/CA-RET.md:63`). | `Plans/assistant-memory-subsystem.md:406`, `:1561`, `:1569`–`:1570`, `:1594`–`:1595` | Shards and index regenerated; only assistant-memory-subsystem outputs changed; index generate pass (7,522 units, 30,233 acceptance units). |
| **Part 2 items 1–3, 6** | Numbers (S1, S2, item 6, part-1 fixture-pass items 1–2): done in this pass, next section. S3 and part-1 fixture-pass item 3 (selected `created_at`): part 2B (timestamp crossing), listed below. | — | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new; ATS-315/316, AMS-022, CV-658/659 and SP-630–639 change in place.

## Guard-table result

The gated tool ran once per phase table (176 runs) over **565 negatives and 306 controls** drawn from **29444 witness calls** (17212 refused) of the twelve complete family checkers. **261 of 288 rows are proved; 27 are unprovable by construction** (above). Credit is the tool's own `rows[].proved`. Each cut swaps one table row to always-pass; the tool runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. "Own" negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays"). Collection findings: 0. Lane matrix (uncapped, every distinct negative against every row of its table, every control against every row): 0 problems.

| Checker boundary | Tables | Rows | Proved | Unproved | Cut: own flips / own | Cut: stays | Unrelated changes | Masked | Tool negatives / controls | Lane single-row negatives (distinct) |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|
| start_custody_gate (SP-630..637, shared) | 17 | 27 | 26 | SGC07_reduced | 74/74 | 124 | 0 | 0 | 74 / 36 | 374 |
| current writer _append_current (CV-650..657) | 20 | 31 | 28 | AP11_payload_schema, AP12_inline_cap, TGO01_schema | 78/78 | 129 | 0 | 0 | 78 / 46 | 145 |
| phase model _transition (selector, target, effects, custody) | 49 | 74 | 55 | EF01_permission, EF02_withdrawn, OPA02_value_cap, OPA03_started_receipt, OPA04_completed_receipt, OPA05_terminal_reserve, OPA06_result_ref, OPA07_result_digest, RC01_permission, RC02_withdrawn, RR01_permission, RR02_withdrawn, SEL02_value_cap, TGOA01_schema, TGOA02_artifact_order, TGOA03_manifest, TGOA04_source, TGOA05_identity, TGS01_schema | 98/98 | 124 | 0 | 0 | 98 / 91 | 128 |
| history readers (read_history, read_canonical_history) | 5 | 11 | 11 | none | 39/39 | 56 | 0 | 0 | 39 / 11 | 316 |
| reduced boundary accept | 14 | 23 | 22 | BD16_phase | 70/70 | 100 | 0 | 0 | 70 / 23 | 133 |
| SP-278 checkpoint join | 5 | 10 | 9 | CK08_scope_kind | 21/21 | 36 | 0 | 0 | 21 / 8 | 30 |
| Card 1b cutoff gate and archive (DL-402/446/447) | 17 | 32 | 32 | none | 41/41 | 100 | 0 | 0 | 41 / 21 | 41 |
| Card 1b writer and started canonical original | 22 | 32 | 30 | AOP02_value_cap, AOP05_terminal_reserve | 65/65 | 102 | 0 | 0 | 65 / 40 | 100 |
| Card 6 selection policy (DL-446/447) | 5 | 9 | 9 | none | 16/16 | 17 | 0 | 0 | 16 / 5 | 16 |
| Card 6 dedup (DL-444/445) | 22 | 39 | 39 | none | 63/63 | 122 | 0 | 0 | 63 / 25 | 63 |
| **Total** | 176 | 288 | 261 | 27 | 565/565 | 910 | 0 | 0 | 565 / 306 | 1346 |

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`); the complete path is the full checker, which reaches every refusal through the same rows in the same order (asserted). No `NonGuard` other than the `return g.Case(table, check, context)` plumbing return was needed; every table module was prescanned from its text before use. Observations holding a Decimal are never passed to the tool (it reconstructs exact builtin data only); every row still has a tool-safe negative. Per-table reports are in the evidence directory (`tool.tar.gz`: `<phase>.json.gz`, `summary.json`).

## Sweep part 2B numbers: findings and responses

The NUMRULE number scope was merged at exactly `a16f67c1ef` after the guard-tool merge. The date-time code is **not** adopted: no DMEM module imports `pm_event_datetime`, and `datetime_validator`, `date_time` and the inventory gate are not called. NUMRULE's files are not edited.

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Merge the gated number scope** | `git merge --no-ff a16f67c1ef` as `74e62c0e78`; it adds only NUMRULE's files and text; 163 conflicts, all generated (`Plans/_shards/{contracts_v0,storage-plan}`, `Plans/.plan_index`), resolved by regeneration with the 15-file currentness edition present (SHA-256-matched). | merge commit | `git log --format=%P -1 74e62c0e78`; `git diff 74e62c0e78 HEAD -- scripts/pm_event_numbers.py scripts/pm_event_numbers_corpus.py Plans/event_number_recipe_corpus.json` is empty. |
| **S1 — current ingestion; part-1 fixture-pass item 2** (fixed, `b94080a5aa`) | `json_numbers` (the loader and the raw-literal parser) is `loads_current_json`: integer tokens become exact ints, fraction/exponent tokens (`1.0`, `1e0`, `-0.0`) stay exact `ParsedDecimal` carriers and are never folded to an integer, and `01`, `+1`, `-0`, NaN/Infinity and duplicate keys refuse. A raw `0.0` therefore no longer loads as integer `0`. The frozen integer-json-v1 literal grammar survives only as `frozen_json_numbers`, for retained-history oracles. | `scripts/pm_memory_maintenance_events.py:180`, `:191` | Probe P1: a policy expectation `0` written `0.0` makes all four archive family checkers exit 1 at this head; the same edit exits 0 at the part-1 code (the fixed bug). |
| **S1 — CV-1100 current integers, no global ceiling** (fixed, `b94080a5aa`) | `canonical_numbers` admits only exact int primitives through `current_integer`: a float, Decimal or fraction/exponent token refuses (`integer_type`) instead of normalizing, and the global `abs(n) <= 2^53-1` ceiling is removed. The local identity, idempotency, result, target and cutoff recipes keep their IDs, prefixes, preimages and tuple positions (sorted compact UTF-8 JSON); for every exact int they give the same bytes as before. The current envelope profile no longer narrows the EventRecord owner's `producer_sequence_id` (it had added `maximum 9007199254740991`); DMEM's producer writes null there, so a caller value is still refused by the producer join. | `scripts/pm_memory_maintenance_events.py:202` (`canonical_numbers`), `:218` (`number_error`); `Plans/memory_maintenance_event_record.schema.json` (`current`); `scripts/pm_memory_maintenance_events.py:1171` (producer domain oracle) | Probes P3 (restored folding), P4 (restored ceiling), P5 (restored folding loader) and P6 (restored producer ceiling): complete checkers exit 1. |
| **SP-1100 Storage uint64** (fixed, `b94080a5aa`) | AP01 observes `storage_uint64` refusal reasons per present field (`[[field, reason]]`), so `integer_type` and `integer_range` come from the shared call; the outcome is unchanged (exact int, 0..2^64-1). | `scripts/pm_memory_maintenance_events.py:701` (`uint64_refusal`), `:709` | Shared corpus `uint64`: 67 cases through the complete current writer, AP01 gives the corpus reason; probe P7 (cut AP01) exits 1. |
| **S2 — size profile** (fixed, `b94080a5aa`) | `value_size` and the inline payload size call `storage_value_bytes(..., profile=INDEX_BINDING)`, which dispatches to the same SP-278 codec the lane already measured with; the CV-1100 integer gate runs first, the codec normalizes nothing. | `scripts/pm_memory_maintenance_events.py:163`, `:734` | Shared corpus `physical` INDEX_BINDING cases agree byte for byte (floats refused first by the integer gate, as recorded per case). |
| **Retained history keeps its frozen reading** (`b94080a5aa`) | Historical schema verdicts (envelope edition, payload, operation, target) validate the integer-json-v1 view of the retained value (`frozen_view`), so current parsing never narrows a retained original: `1.0`/`1e0` sequence spellings, binary64 old-writer receipts and retained integers up to 2^64-1 stay readable in canonical, replay-only and compatibility modes. | `scripts/pm_memory_maintenance_events.py:256` (`frozen_view`), `:1018` | Canonical-history, write-recipe and boundary-domain reader suites pass in all twelve families. |
| **S2 — exact preservation; part-1 fixture-pass item 1** (fixed, `b94080a5aa`, `c4669460af`) | `same()` compares a Decimal's digits, exponent and numeric kind and a float's zero sign, so `0.0499` respelled `0.04990` or `0.0` flipped to `-0.0` no longer passes as the preserved original. Policy score checks accept the exact `ParsedDecimal` carrier. | `scripts/pm_memory_policy.py:18`, `:85`; `scripts/pm_memory_guard_witnesses.py` (`preserved-score-*`) | Two AV08 witnesses per archive family; probe P2 (restored value-only `same()`) exits 1. |
| **Oracles follow the rule** (`b94080a5aa`) | The numeric-writer suite: `1` appends, `1.0`/`1e0` refuse at AP01, `-0`/`01` refuse in the parser. The boundary number fixture's 36 literals are recomputed from a hand-written statement of the CV-1100 grammar (not the helper): `current_parser_accepts`, `commitment_valid` (integer token, any size), `sequence_valid` (0..2^64-1). The write-recipe fixture names the current recipe `cv1100-exact-integer-write-v3`; the history recipe stays `integer-json-v1`. | `scripts/pm_memory_maintenance_events.py:1133`; `Plans/memory_maintenance_boundary_fixtures.json` (`numeric_cases`, `numeric_rule`); `scripts/pm_memory_boundary_domains.py:110`; `Plans/memory_write_recipe_fixtures.json:17` | Twelve checkers exit 0. |
| **Shared corpus through the complete checker** (`b94080a5aa`) | `pm_memory_number_corpus.py` runs every number-scope case of `Plans/event_number_recipe_corpus.json` that has a DMEM boundary through it, inside each complete family checker, against the corpus's own oracle (typed `returns` or exact reason): `uint64` through the complete current writer (AP01), `integer`/`slot`/`current_json_slot` without bounds at the CV-1100 commitment-number gate (AP02), `current_json` through the loader, INDEX_BINDING `physical` through the size route. | `scripts/pm_memory_number_corpus.py:94` (`run`), `:29` (not-applicable reasons); `scripts/pm_memory_maintenance_events.py:1538` | **100 DMEM-boundary cases agree in each of the twelve families**; the rest of the 580 number-scope cases are counted not applicable with the reason (no JCS or producer digest route, no decoder, retained dispatch is part 2B, bounds, non-number slot types, other profiles). |
| **Self-test** | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | — | exit 0, `"status": "pass"`: 580 case passes of 580 number-scope corpus cases; date-time inventory `NOT_RUN_SEPARATE_SUITE`. Credited exactly as reported. |
| **Owner text** (fixed, `11b8884356`) | The twelve DMEM numeric paragraphs (CV-658, CV-659, SP-630–SP-639) and ATS-315 no longer say current producer projections and identity inputs use safe-integer-write-v2 (an I-JSON safe-range ceiling) or that commitments normalize `1`, `1.0`, `1e0` to 1 and `-0` to 0. They now say: exact integer primitives within the field-owner schema range, no global ceiling, the CV-1100 current JSON integer grammar for raw input, decimal carriers never folded, local recipes unchanged, and the current envelope keeps the EventRecord owner's `producer_sequence_id` domain. The retained-history recipe text is unchanged. | `Plans/Contracts_V0.md:25083`, `:25226`; `Plans/storage-plan.md:29740`, `:29799`, `:29866`, `:29931`, `:29996`, `:30061`, `:30118`, `:30175`, `:30314`, `:30460`; `Plans/Automated_Testing_System.md:7265` | Shards and index regenerated; only these three documents' outputs changed; index generate pass. |
| **S3 — SP-1101 authenticated retained dispatch, and the CV-339 current full-value commitment** | **Part 2B.** DMEM's retained reader selects the envelope edition (`HISTORY_RECIPES` → `compatibility` / `historical_current`), whose schemas carry the date-time format checks; NUMRULE-ADOPTION.md assigns a retained verifier that selects a date-time profile to the date-time suite. Moving current writes to `full_value_commitment` (CV-339) needs that same authenticated per-original selection, so it stays with S3. | listed below | — |

**Not adopted, by design:** `qualified_jcs`, `producer_semantic_bytes`/`_digest` (DMEM has no JCS or CV-317 digest route: retries compare the producer fields exactly) and `RetainedDispatcher` (S3). No new lane serializer, cap or number grammar was added.

**Differential, part 2A → 2B numbers.** The same call-level differential (part-2A code on its fixtures against the head on its fixtures) shows 752 calls change outcome across the twelve families, every one from the number rule: 344 loader keeps exact decimal carriers (1.0, 1e0, -0.0 and score tokens such as 0.0999 stay ParsedDecimal; no folding to int); 132 still refused: a fraction/decimal spelling, now with the shared reason integer_type; 72 malformed token (01, +1, 00): the shared Refusal json_syntax instead of JSONDecodeError; 60 exact integer beyond 2^53-1 accepted: no global safe-integer ceiling; 48 still refused: a Storage sequence_id outside 0..2^64-1 (2^64, -1) is now refused at AP01 by storage_uint64 (integer_range) before the envelope schema verdict (AP03/AA02); 48 NaN/Infinity refused by the current parser (json_nonfinite); 24 -0 refused by the CV-1100 current integer grammar (integer_token); 24 integral decimal spelling no longer folds to an integer (refused integer_type); 0 unexplained. The other key differences are calls whose inputs are now exact decimal carriers instead of folded integers, plus the new corpus and witness calls..

## Timestamp fields — interim only

My own review of the timestamp fields is **interim only** (pm7-build, 2026-11-05 16:50Z); it is not a certification and changes nothing. DMEM validates `format: date-time` through its own mandatory grammar `enforced_formats()` (`scripts/pm_memory_maintenance_events.py:409`), installed in every validator it builds: a full match of `YYYY-MM-DD[Tt]HH:MM:SS[.fraction]([Zz]|±HH:MM)` with a real calendar date and time, hours ≤ 23 and minutes ≤ 59 in an offset, any number of fractional digits, and no leap second. Payload `occurred_at_utc` adds `maxLength 64`; operation `completed_occurred_at_utc` adds the pattern `Z$`; the reduced boundary separately requires a terminal `Z` (BD02). Against CV-1101 this grammar refuses legitimate leap seconds that the default `event_record` profile admits, and admits offsets and lowercase `z` in `observed_at_utc`/`persisted_at_utc`, which the CV-253 `storage_utc_z` profile refuses. Whether each difference is an owner-declared stricter or looser field profile is a part 2B question; no Jared choice is needed yet. Parts 2A and 2B-numbers add no date-time rule and change no timestamp field.

## Part 2B items

- **Timestamp grammar (CV-1101).** `scripts/pm_memory_maintenance_events.py:409` (`enforced_formats`) and every validator built with it (`validator`, `checkpoint_validator`, `envelope_validator`); `scripts/pm_memory_policy.py:43` (`instant`, refusal `selection_timestamp`, rows PT01/PT02); `scripts/pm_memory_write_recipes.py` (`formatted_leaves`, `format_cases`, `DATE_BAD`); the `format: date-time` declarations in `Plans/memory_maintenance_event_payloads.schema.json` (`occurred_at_utc`), `Plans/memory_maintenance_operation.schema.json` (`started_occurred_at_utc`, `completed_occurred_at_utc`, current and `historical_` definitions) and the EventRecord envelope fields through `Plans/memory_maintenance_event_record.schema.json`. Adopt `datetime_validator` at the envelope and timestamp-source boundaries with explicit field profiles once the date-time gate passes.
- **Part-1 fixture-pass item 3 — selected `created_at` read only on fallback.** `scripts/pm_memory_policy.py:60` (`selection_observations`): with both edit and access present, a malformed or wrong-type `created_at` on a selected original is not refused. It belongs to the same date-time adoption.
- **S3 — SP-1101 authenticated retained dispatch (selects the retained envelope edition and its date-time format checks), with the CV-339 current full-value commitment.** `scripts/pm_memory_maintenance_events.py:1014` (`HISTORY_RECIPES`), `:1018` (`historical_envelope_matches`), `:236` (`historical_numbers`), `:256` (`frozen_view`), `:754` (`retained`), `:782` (`retained_check`), `:1068` (`history_check`), `:1079` (`read_canonical_history`); `Plans/memory_write_recipe_fixtures.json`, `Plans/memory_canonical_history_fixtures.json`; the frozen `historical_` and `compatibility` definitions. Compose `RetainedDispatcher` with the authentic original owner and the frozen recipe map; keep the integer-json-v1 positives; then move current full-value commitments to `full_value_commitment`.

These are the timestamp items only: S3 is listed because its recipe selection chooses the date-time format edition together with the number recipe, which NUMRULE-ADOPTION.md assigns to the date-time suite. Separately, and **not** a part 2B item: JSON Schema keyword and format cuts are not ported to the shared tool (each schema occurrence is one verdict row), which keeps the oracle cells PARTIAL.


## What Astra keeps finding, probed

1. **Forged inputs:** every identity, receipt, result reference and digest, target id, manifest, retained full-value digest, checkpoint key and cutoff commitment is recomputed in derivation and compared by its own row (OP03/OP04, OP06/OP07, TG03/TG05, SGR04, HM03, CK04/CK06/CK07, CG08); coherently rehashed forgeries are the custody-matrix and witness negatives; probe P11 (cut SGR04) fails the complete checker. 2. **Storage-assigned metadata:** the producer join excludes `sequence_id`, `observed_at_utc` and `persisted_at_utc`; AP01 uses the shared `storage_uint64`; metadata-only retries still return the original (storage-uint64 suite, 67 corpus `uint64` cases). 3. **Historical readers:** history paths reach only `rh_*`, `hm_*`, `sg*` and `cuo_*` rows, never a current-writer row; retained originals stay readable after live changes and under `1.0`/`1e0`/binary64/2^64-1 spellings through `frozen_view`; withdrawn, revoked, forged and foreign originals refuse; probe P12 (cut HM07) fails. 4. **One field read two ways:** `same()` compares exact representation; `canonical_numbers` admits exact ints only; the loader no longer folds `0.0`; probes P1–P5 fail when any is restored. 5. **Eager references:** `require_resolved_references` still walks every subschema before any instance validation (standing check 9 suite unchanged). 6. **Size:** OP02, OP05, SEL02 and AP12 measure encoded SP-278 bytes of the whole stored value; SEL02 and AP12 are entailed by schema bounds (the largest schema-valid selector encodes to 13,641 bytes). 7. **Custody:** every writer, transition, boundary, history and recovery path runs the start custody gate; probe P9 (cut SG04) fails the complete checker. 8. **Masked negatives:** the uncapped lane matrix finds 0 problems; the tool reports 0 masked and 0 unrelated changes on every proved row. 9. **Grades:** every oracle cell is PARTIAL. 10/10a. **Numbers:** adopted (part 2B numbers above); retained recipes unchanged and readable. 11. **Types:** exact-type rows are separate from value rows (AP06–AP08, BD03–BD05, DC01–DC06, DC10/DC11, ACF01, ACS01, PS01, PT01, DV01–DV07) with the round-11 and part-1 wrong-type sweeps as witnesses. 12. **Formats:** interim only, part 2B.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the sweep-part-1 self-grade at `1abebee498`; after is `DMEM-self-grade.json` at the implementation head `c4669460af`. The only changed cell is `positive_negative_oracles` (PASS → PARTIAL in every family): the retired lane-local proof cut schema keywords one by one, the shared tool proves table rows only (each schema occurrence is one verdict row), and SP-1101 dispatch and the timestamp review are open, as DCH and DR also grade it. Every other cell is carried after re-verifying its quotes.

| Family | Before → after | Witnesses (new) | Shared-corpus cases agreeing |
|---|---|---:|---:|
| `memory.dedup_sweep.completed` | 10P / 1Q / 1A → 9P / 2Q / 1A | 45 | 100 |
| `memory.dedup_sweep.started` | 10P / 1Q / 1A → 9P / 2Q / 1A | 38 | 100 |
| `memory.index.lexical.rebuild.completed` | 10P / 1Q / 1A → 9P / 2Q / 1A | 56 | 100 |
| `memory.index.lexical.rebuild.started` | 10P / 1Q / 1A → 9P / 2Q / 1A | 49 | 100 |
| `memory.index.semantic.rebuild.completed` | 10P / 1Q / 1A → 9P / 2Q / 1A | 56 | 100 |
| `memory.index.semantic.rebuild.started` | 10P / 1Q / 1A → 9P / 2Q / 1A | 49 | 100 |
| `memory.verification_sweep.completed` | 10P / 1Q / 1A → 9P / 2Q / 1A | 43 | 100 |
| `memory.verification_sweep.started` | 10P / 1Q / 1A → 9P / 2Q / 1A | 36 | 100 |
| `memory.monthly_summary.completed` | 10P / 1Q / 1A → 9P / 2Q / 1A | 13 | 100 |
| `memory.monthly_summary.started` | 10P / 1Q / 1A → 9P / 2Q / 1A | 16 | 100 |
| `memory.prune_archive.completed` | 10P / 1Q / 1A → 9P / 2Q / 1A | 13 | 100 |
| `memory.prune_archive.started` | 10P / 1Q / 1A → 9P / 2Q / 1A | 16 | 100 |

120 PASS / 12 PARTIAL / 12 ABSENT → **108 PASS / 24 PARTIAL / 12 ABSENT**. The second PARTIAL of every family is the inherited retention cell. Every evidence quote was re-verified at its line in this tree: 646 part-1 quotes: 213 at the same line, 417 relocated to their moved line, 16 whose text this round replaced, given the new text (the ATS-315/316 group-predicate sentence and the archive flag line); 3 new quotes per family cite the guard-table text.

## Commands and evidence

Heavy runs (checkers, guard tool, differentials, probes) ran one at a time on a frozen snapshot of the head, with at least 10 GB available (the tool MemoryGate pauses below 10 GB and resumes at 11 GB); PM7 work was not waited on or touched. Runs longer than a few minutes ran as `long-job` jobs. Commits: `09d35571b6` (tool merge), `74e62c0e78` (number-scope merge), `47143ed0a7` (guard tables, witnesses, lane proof removed), `23b6cb48d1` (suite adapter and runner), `40744abfeb` (ATS-315/316 proof text), `b0ddf4fcbf` (AMS-022, DL-402), `b94080a5aa` (numbers), `11b8884356` (number owner text), `c4669460af` (producer domain oracle; respelled-score witness), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/sweep-p2a/` (SHA-256 of every file in `SHA256SUMS`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd632d9463f3535190a6ed5772338cdce1` | 0 | clean; 11 tool files (`09d35571b6`) |
| `git merge --no-ff a16f67c1ef21796758f4209ff12c0f4d12b86ce9` | 1 → resolved | 163 generated-file conflicts only, regenerated (`74e62c0e78`) |
| `python3 scripts/pm-memory-table-generate.py scripts --check` | 0 | 177 modules current (176 tables + index), 288 rows |
| `python3 -B scripts/pm_memory_maintenance_events.py --family <f>` ×8 | 0 ×8 | `pass`, including table order, witnesses and the shared number corpus |
| `python3 -B scripts/pm_memory_archive_events.py --family <f>` ×4 | 0 ×4 | `pass`, including table order, witnesses and the shared number corpus |
| `python3 -B scripts/pm-memory-guard-tables.py --out tool` | 1 | 157 tables `PASS`, 18 `FAIL unproved_guards`, 1 never evaluated; 261/288 rows proved; 0 masked; lane matrix 0 problems; collection findings 0; 29444 witness calls (17212 refused); 461.3 s |
| differential, merged part-1 code vs part 2A (12 families) | 0 | 0 outcome changes; new keys are witnesses; old-only keys are the retired `memory_fields` helper (archive) |
| differential, part 2A vs part 2B numbers (12 families) | 0 | 752 calls change outcome across the twelve families, every one from the number rule: 344 loader keeps exact decimal carriers (1.0, 1e0, -0.0 and score tokens such as 0.0999 stay ParsedDecimal; no folding to int); 132 still refused: a fraction/decimal spelling, now with the shared reason integer_type; 72 malformed token (01, +1, 00): the shared Refusal json_syntax instead of JSONDecodeError; 60 exact integer beyond 2^53-1 accepted: no global safe-integer ceiling; 48 still refused: a Storage sequence_id outside 0..2^64-1 (2^64, -1) is now refused at AP01 by storage_uint64 (integer_range) before the envelope schema verdict (AP03/AA02); 48 NaN/Infinity refused by the current parser (json_nonfinite); 24 -0 refused by the CV-1100 current integer grammar (integer_token); 24 integral decimal spelling no longer folds to an integer (refused integer_type); 0 unexplained |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, 580/580 cases |
| probes (`probes.json`, 16 full-process probes) | 0 | 16 of 16 as expected: P1-raw-0.0-expectation-new → exit [1]; P1-raw-0.0-expectation-part1-code → exit [0]; P2-same-value-only → exit [1]; P3-folding-commitment-numbers → exit [1]; P4-global-safe-ceiling → exit [1]; P5-folding-loader → exit [1]; P6-producer-sequence-ceiling → exit [1]; P7-cut-AP01-storage-uint64 → exit [1]; P8-cut-AP04-replay-only (standing check 1, core writer) → exit [1]; P8b-cut-AA03-replay-only (standing check 1, archive writer) → exit [1]; P9-cut-SG04-start-record (Astra 7) → exit [1]; P10-cut-AP13-partition (standing check 3) → exit [1]; P11-cut-SGR04-digest (Astra 1) → exit [1]; P12-cut-HM07-history-binding (standing check 10) → exit [1]; P13-cut-PS05-selection-age (DL-446) → exit [1]; P14-cut-DV09-survivor (DL-444) → exit [1] |
| `python3 scripts/pm-shard-plans.py --generate` / `--check` (after each `Plans/*.md` edit) | 0 | `pass`; only the edited documents' outputs changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files SHA-256-verified first) | 0 | `pass`, 7,522 units, 30,233 acceptance units |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 29 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 8 `plan_unit_removed_without_ledger_decision` (DL-333, DL-335, DL-337–DL-340, DL-349, UCC-230) that main added after this branch's base `2989975e8f`; none names a DMEM file. The same rows appear at the NUMRULE merge before any DMEM edit. Pinned to `2989975e8f` in a scratch clone: status `pass`, 0 failures. |

**IDs:** no new IDs. AMS-022, ATS-315/316, CV-658/659 and SP-630–639 change in place. No pm-mail, subagent, admission, registry append, Decision Log change, governance artifact edit, landing lock or main push. The worktree is removed after publication.

---

Earlier-round material below is **superseded source lineage**, including its grades and its guard-removal tables, which were produced by the retired lane-local method and confer no Method B credit.

# DMEM sweep part 1 (fixture pass)

**Branch:** `plans/ea-w2-memory-maintenance-20261104`. **Fix commit:** `2cd020b60a`. **Start:** text-pass head `3bb362761b`. **Rebase:** none. The text pass did not abort its rebase, so this round stayed on base `2989975e8f`. `origin/main` has moved on since then (see "Index findings").

**Result:** cycle-9 B1, B2, B3 and B4 were each checked against the review. B2, B3 and B4 are fixed as round 11 claimed. B1's reviewed rows are fixed, but its class stayed open in seven places, all now fixed. Family grades are unchanged. No lane is READY until the shared tools pass.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.

## Sweep part 1 (fixture pass): findings and responses

| Item | Round-11 claim | Verdict | Commit |
|---|---|---|---|
| **B1** | Exact primitive types before values | Reviewed rows fixed; residual class fixed here | `2cd020b60a` |
| **B2** | Every fractional digit compared | Holds; no change | `ae04b287ae` |
| **B3** | No-project Project copies coherent | Holds; no change | `ae04b287ae` |
| **B4** | Three group predicates, three negatives | Holds; guards extended with a type predicate | `ae04b287ae`, `2cd020b60a` |

### B1: exact types in preserved fields

**Reviewed rows, rerun:** survivor `pinned` false to `0` refuses `dedup_original_fields`. Unselected `pinned` true to `1` and `archived` false to `0` refuse `dedup_unselected`. An archive score `0` to `false` refuses `selected_fields_preserved` in both jobs. **Verify:** `drafts/DMEM/sweep-p1/fixture-pass/review-row-probes.txt`.

**Residual found by one-field probes at `3bb362761b`, all fixed in `2cd020b60a`:**

| # | Where (now) | Why it broke | Fix |
|---|---|---|---|
| 1 | `scripts/pm_memory_policy.py:105-106` | `{1, True}` is one set element, so hashes `1` and `True` read as one identical group; `7`/`7` also passed. | Exact string test before the set test, same refusal `dedup_identical`. |
| 2 | `scripts/pm_memory_policy.py:108`; `scripts/pm_memory_archive_events.py:145` | Evidence `[1]` and `[true]` collapsed in the union and lost a reference; a string read as characters. | `string_list()` (`pm_memory_policy.py:29`) before the union; refusals `dedup_evidence_type`, `selection_evidence_type`. |
| 3 | `scripts/pm_memory_policy.py:88` | Group `"ab"` read as IDs `a`, `b`. | Exact list test, refusal `dedup_eligible_group`. An array ID no longer raises in `set()`: type and existence now run before uniqueness (`:91-92`). |
| 4 | `scripts/pm_memory_archive_events.py:138` | `selected_ids` of `null`, a number or an array ID raised `TypeError`. | Refusal `selection_ids_type`. |
| 5 | `scripts/pm_memory_policy.py:144`; `scripts/pm_memory_archive_events.py:171` | Project, eligible or selected IDs, capture time and extra fields were never compared in the output. | Predicates `dedup_snapshot`, `snapshot_preserved`, through `same()`. |
| 6 | `scripts/pm_memory_policy.py:123`, `:161`; `scripts/pm_memory_archive_events.py:127`, `:166`, `:194` | Malformed output raised `KeyError`/`TypeError`; an extra merge-record field passed; a survivor could gain a survivor link; prune could drop `summary`. | `dedup_output_shape` (exact record keys), `memory_fields`, survivor clause in `dedup_links`, presence clause in `no_prune_summary`. |
| 7 | `scripts/pm_memory_policy.py:84-86`, `:51-76`; `scripts/pm_memory_archive_events.py:134` | Malformed or absent input fields raised instead of refusing. | `dedup_input_shape`, `memory_fields`, `.get()` reads so each owner predicate refuses. |

**New fixtures:** `Plans/memory_card6_policy_fixtures.json:28308-35385`: 100 templates, each with a `p1f-` name. One is a positive control (`dedup_sweep:p1f-char-id-control`, `:31002`); 99 are negatives. Existing cases are byte-preserved; the file only gains lines. `typed_edits` gains `delete` (`pm_memory_policy.py:171`). `run` gains the archive candidate-refusal path (`:226`).

**Owner text:** ATS-315 and ATS-316 state the rule (`Plans/Automated_Testing_System.md:7271`, `:7328`). Shards and the index are regenerated.

**Verify:**
- `fixture-pass/one-field-type-probes.txt`: 660 dedup, 218 monthly and 176 prune output mutations: 0 accepted, 0 raised. Input mutations still accepted are valid values (a null edit or access falls back to creation; a lower score) or fields the job never reads (dedup `updated_at`, `versions` and unselected originals; archive `version_ref`, input `summary`, prune `kind`), which `same()` then preserves exactly. Selected `created_at` is Part 2 item 3.
- `fixture-pass/full-process-probes.json`: complete `--family` processes, one at a time, for the six policy families. Controls exit 0. Wrong Boolean expected results: 6 of 6 exit 1. Restored `==`: 6 of 6 exit 1. Every removed new guard: exit 1.

### B2: fractional seconds

`instant()` (`scripts/pm_memory_policy.py:34`) compares exact `Fraction` seconds. The review's three rows, rerun: monthly edit `.000000001Z` refuses `selection_age`; prune edit `.000000001Z` refuses `selection_age`; dedup `a-new` at `.000000002Z` makes `z-old` survive, and a coherently built wrong survivor refuses `dedup_survivor`. A 40-digit prune boundary also refuses. Restoring microsecond truncation: 6 of 6 complete processes exit 1. No other parser in the lane drops precision (`grep fromisoformat` finds one call, whole seconds only). **Verify:** `fixture-pass/review-row-probes.txt`, `full-process-probes.json`.

### B3: no-project negative

`dedup_sweep:no-project` (`Plans/memory_card6_policy_fixtures.json:7783`) has all four memory Project copies null. Against the intact control it differs only in the Project fields. Removing only the local validity clause flips only it. Removing only the join flips `dedup_sweep:foreign-project` and the new `p1f-project-missing`. **Verify:** `fixture-pass/removal-dedup.jsonl`.

### B4: eligible group

Intact control `dedup_sweep:fix11-group-control`. Each of `fix11-minimum-group`, `fix11-unique-group` and `fix11-existing-group` differs from it only in `eligible_ids`. Each predicate, removed alone, flips its own negative (`scripts/pm_memory_policy.py:89`, `:91`, `:92`). Both dedup phases exit 1 for each removal. **Inclusion in the shared guard tool stays part 2.** **Verify:** `fixture-pass/removal-dedup.jsonl`, `full-process-probes.json`.

### Guard-removal table for this round's predicates

This is a targeted witness for these predicates, not a whole-lane check-11 claim; that stays S4. Peers stay enabled. No positive fails in any row. "Flip" means the case stops refusing with its own reason: either accepted, or an uncaught error (marked "raises") where later code cannot run without the guard.

| Predicate removed alone | Flips only |
|---|---|
| `dedup_input_shape`: memories object / merge records / member object (raises) | their 2 `p1f-input-*` cases each |
| `dedup_input_shape`: member evidence / member versions | `p1f-input-evidence-missing` / `p1f-input-versions-missing` |
| group list type | `p1f-group-null`, `-number` (raise); `-object`, `-string` (accepted) |
| group type-and-exists | `fix11-existing-group`, `p1f-group-number-id`, `-boolean-id`, `-array-id` |
| hash type | `p1f-hash-integer`, `-number-boolean-alias`, `-null` (accepted); `-array`, `-missing` (raise) |
| `dedup_evidence_type` | the 6 `p1f-evidence-*` cases |
| `dedup_output_shape`, per clause (6 clauses) | its own `p1f-output-*` cases (raise, except the record-field case) |
| `dedup_snapshot` | the 6 `p1f-output-project-*`, `-eligible-changed`, `-extra-field` cases |
| `dedup_links` survivor clause | `p1f-output-survivor-link-added` |
| archive `memory_fields` input / output | 2 cases per job each |
| `selection_ids_type` | 3 cases per job (raise) |
| `selection_evidence_type` | 5 cases per job |
| `snapshot_preserved` | 6 cases per job |
| `no_prune_summary` presence clause | `prune_archive:p1f-output-summary-deleted` |

### Part 2 items added by this round

Recorded with exact locations; no number helper or proof machinery was written.

1. **`same()` numbers of one type:** `scripts/pm_memory_policy.py:26`. `Decimal('0.10')` equals `Decimal('0.1')` and `0.0` equals `-0.0`, so a respelled or sign-flipped preserved number passes. Belongs to S2 (physical profile).
2. **Loader folds a raw `0.0`:** `scripts/pm_memory_maintenance_events.py:62` (`json_numbers`). A file-level wrong `expected` score `0.0` loads as integer `0`, so the four archive families exit 0 on that one probe (`full-process-probes.json`, `wrong-expected-float`). The typed form is still refused through `fix11-preserved-zero-score-float`. Belongs to S1.
3. **Selected `created_at` read only on fallback:** `scripts/pm_memory_policy.py:66-67`. With both edit and access present, a malformed or wrong-type `created_at` on a selected original is not refused. Belongs to the date-time gate.

S1-S4 and the guard-table items below stay as listed.

### Checks

| Check | Exit |
|---|---|
| 8 x `pm_memory_maintenance_events.py --family` | 8 x 0 |
| 4 x `pm_memory_archive_events.py --family` | 4 x 0 |
| Policy corpus per phase (positives / negatives) | dedup 16/200, monthly 39/85, prune 42/83 |
| `pm-shard-plans.py --generate` | 0 |
| `pm-plan-index.py generate` | 0 |
| `pm-shard-plans.py --check` | 0 |
| `pm-plan-index.py validate` | **1**, top-level `fail`, 24 findings |
| `git diff --check` on the commit | 0 |
| Currentness edition | 15 files, hash-identical to the share |

### Index findings

All 24 are **new here and not on `origin/main`**; `origin/main` `6861d332de` validates with exit 0, no findings.

- **Where:** 3 x `plan_unit_removed_without_ledger_decision` (DL-337, DL-338, DL-339), and 21 x `plan_unit_removal_ledger_invalid` (legacy ledger records, read only when a removal is detected).
- **Why:** `pm-plan-index.py:1330` compares against `origin/main`, which gained those three units after this lane's base. No lane removes them.
- **Check:** the same validation with the baseline set in memory to the merge base `2989975e8f` exits 0, no findings. No source or index was edited for it.
- **Fix:** the next rebase onto `origin/main` clears them. This is the cycle-9 N2 pattern.

### Grades and other records

Family grades are carried unchanged: 120 PASS / 12 PARTIAL / 12 ABSENT, as in the table below. Membership stays ABSENT, retention PARTIAL, native NOT_RUN. `DMEM-self-grade.json` keeps its grades; 388 citation lines that the rebase and this commit moved are relocated, each quote re-found at its line, and four quotes follow the rewritten `memory_flags` line.

No Decision Log entry, registry append, admission, seal, `Spec_Lock`, `.evidence`, `auto_decisions`, `.gitignore` or frozen-validator edit. No pm-mail or subagent.

---

# DMEM sweep part 1 — landed-decision citations on current main

**Branch:** `plans/ea-w2-memory-maintenance-20261104`. **Assessed implementation commit:** `91d3ec7a14` (this round). **Base:** rebased from lane head `9aec2fee0c` onto current `origin/main` `2989975e8f` (30 lane commits; every rebase conflict was in `_shards`/`.plan_index` only, resolved on the lane side and then regenerated deterministically). Round-eleven's checker/fixture work is carried unchanged as `ae04b287ae` (the former `7a1b9624d4`); the lane's checker, oracle, proof and fixture files are byte-identical to `9aec2fee0c`. **Baseline:** `reviews/DMEM-sol/REVIEW-cycle9.md` at `9374fdea03` (round-ten head; round-eleven work was ungraded there).

**Worker result:** owner-text and citation work only. Under the lead's scope correction for this worker (2026-11-05), no checker, oracle or proof script is edited and no fixture or negative is rebuilt here; every checker/fixture finding of cycle 9 is listed under "For a Sol worker" with its exact location. The twelve exact-family checkers all exit 0 at this head. Grades are unchanged from round eleven. Membership remains ABSENT, retention PARTIAL, native execution NOT_RUN. No lane is READY until the shared tools pass.

This lane's own review of its timestamp fields is **interim only**; no lane is READY on timestamp fields until the date-time gate passes.

## Deck 2, items 6.a–6.d against the landed Decision Log

Batch 1 landed DL-400..DL-452 on `main`, including DL-444..DL-447 (the lane's four Card 6 items), DL-402/DL-403 and the DL-401/G04 retention assignment. Read at `origin/main:Plans/Decision_Log.md` (`DL-444` at 5445, `DL-445` at 5469, `DL-446` at 5493, `DL-447` at 5517). Jared's verbatim answer in each entry is "i approve all of it"; the recorded fast-reply rule is "`approve all` selects **A** on all 38 items", so each item selects A. The approved option text, quoted exactly from the landed entries:

- **DL-444 (6.a), option A:** Keep the oldest eligible memory by original creation time, breaking a tie by the unchanging note ID. Preserve every original evidence reference and the record of which copies were merged. If pin protection prevents that merge, skip it. You keep the earliest note ID and its history links.
- **DL-445 (6.b), option A:** Archive the other eligible originals, preserving their identities, evidence references, versions and links to the survivor. They remain available in history and are never automatically deleted. You see one active memory for the merged group.
- **DL-446 (6.c), option A:** Allow monthly summary to select Note memories idle for at least 90 days AND with usefulness score below 0.10. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Keep the existing monthly grouping. Create the monthly summary and archive every selected original, retaining all evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project.
- **DL-447 (6.d), option A:** Allow prune/archive to select eligible memories of any kind idle for at least 180 days AND with usefulness score below 0.05. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Archive the selected originals only; retain their evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project.

Application at this head, read against those quotes:

| Item | Landed decision | Where applied | Status |
|---|---|---|---|
| 6.a / DL-444 | quote above | `Plans/assistant-memory-subsystem.md:404` (§7.2 item 4) and the full dedup contract prose at `:3184`, `:3236`, `Plans/Contracts_V0.md:24508`, `:24555`, `Plans/storage-plan.md:29618`, `:29677` | Every decision element present: oldest by original creation time, tie by unchanging note ID (lexical id order), every evidence reference and the merge record preserved, survivor keeps the union of evidence, pin-protection skip. Applied as contract prose, as cycle 9 verified at the round-ten head. |
| 6.b / DL-445 | quote above | the same six dedup contract copies | The DL-445 sentence "They remain available in history and are never automatically deleted." appears byte-for-byte in all six copies; archive disposition, identities, versions, survivor links and user-only deletion all present. |
| 6.c / DL-446 | quote above | `Plans/assistant-memory-subsystem.md:416` and the two exact monthly owner units `Plans/storage-plan.md:30146`, `:30292` | Entire option A **byte-exact** in all three places (counted as exact substring matches of the landed paragraph). |
| 6.d / DL-447 | quote above | `Plans/assistant-memory-subsystem.md:418` and the two exact prune owner units `Plans/Contracts_V0.md:24919`, `:25062` | Entire option A **byte-exact** in all three places. |
| Related: DL-402 | "monthly summary and prune only archive. A memory is deleted only when you delete it. … Neither job archives or merges a pinned memory. Pins do not stop verification, index rebuilds or "out of date" marking, which the plan requires for every memory." | `Plans/assistant-memory-subsystem.md:406` (§7.2 item 6) with `ContractRef: …#DL-402` | Applied faithfully: archive-only, user-only deletion, originals archived with EvidenceRefs, pins excluded but still permitting verification, rebuilds, out-of-date marking. |
| Related: DL-403 | neither job runs until cutoffs exist; the owner's exact cutoff proposal returns to Jared | resolved by landed DL-446/DL-447 supersession ("Answers DL-403's returned-cutoff condition"); `Plans/assistant-memory-subsystem.md:420` keeps activation gated | Consistent: the missing-cutoff decision is resolved by the landed values; admission, operation/result retention and authenticated binding gates remain. |
| Related: DL-401/G04 retention | `RP-OPERATIONAL-2555D@1.0.0` on `origin/main:Plans/storage_value_registry.json` (terminal_transition, 2,555 days, 2,000,000 per Project); main's `Plans/storage-plan.md` G04 list names all twelve families | lane citations at `Plans/Contracts_V0.md:24938`, `:25081`, `Plans/storage-plan.md:30165`, `:30311` | Values agree with the landed registry row; citations reworded to the landed decision (below). |

**Citation disagreements fixed (`91d3ec7a14`).** Seventeen owner-text citations still described landed decisions as living on unlanded answer branches:

- 13× `DL-444 through DL-447 on origin/plans/ea-cards2-answers-20261105` → `DL-444 through DL-447, landed in Plans/Decision_Log.md on main`, at `Plans/assistant-memory-subsystem.md:422`, `:3184`, `:3236`; `Plans/Automated_Testing_System.md:7271`, `:7328`; `Plans/Contracts_V0.md:24508`, `:24555`, `:24921`, `:25064`; `Plans/storage-plan.md:29618`, `:29677`, `:30148`, `:30294`.
- 4× `under DL-401/G04, on unlanded origin/plans/ea-retention-cards1-20261104 at 2663667e…` → `landed in Plans/Decision_Log.md on main with the CA-RET assignment in Plans/storage-plan.md and Plans/storage_value_registry.json (read on this lane at origin/plans/ea-retention-cards1-20261104 2663667e…)`, at `Plans/Contracts_V0.md:24938`, `:25081`, `Plans/storage-plan.md:30165`, `:30311`. The lineage pin is kept; only the unlanded claim and the decision's location were corrected.

The `source_lineage` front-matter pins (`DL-402/DL-403 on origin/plans/ea-cards1-answers-20261104 at b6332f39…`) are left as written: they record where the lane read the decisions and make no claim about current location. The ATS-315 sentence repaired in round eleven (N1) reads correctly against the landed entries at `Plans/Automated_Testing_System.md:7269` ("Card 6 supplies those cutoff values; the independent activation gates remain"), and the stale "No cutoff values are selected" sentence is absent from every owner document.

## Sweep part 1: findings and responses

- **Deck items 6.a–6.d — confirmed (`91d3ec7a14`).** Byte-for-byte and content comparison against the landed entries above. **Verify:** the quotes and the application table; each byte-exact claim is an exact substring of `origin/main:Plans/Decision_Log.md`'s option-A paragraph and of the named owner-doc line.
- **Cycle-9 B1 (cross-type preserved-field comparisons) — for a Sol worker, not edited here.** See below. **State:** round-eleven `ae04b287ae` claims the repair; both dedup phases and all four archive phases exit 0 at this head.
- **Cycle-9 B2 (fractional-second precision in policy comparisons) — for a Sol worker, not edited here.** Same state.
- **Cycle-9 B3 (dedup no-project negative stale Project copies) — for a Sol worker, not edited here.** Fixture content is outside this worker's scope; the fixture file is byte-identical to `9aec2fee0c`.
- **Cycle-9 B4 (dedup eligible-group guard without a negative) — for a Sol worker, not edited here.** Same state.
- **N1 (stale ATS-315 cutoff sentence) — verified still repaired.** `Plans/Automated_Testing_System.md:7269`. Consistent with landed DL-446/DL-447.
- **N2 (index validation failing on 22 inherited rows) — resolved by the rebase.** The pre-rebase failures were main-only DL-302 plus 21 legacy-ledger format records; current `main` carries both, and `pm-plan-index.py validate` exits 0, top-level `pass`, at this head.
- **N3 (generated clocks) — accounted for.** Regeneration again changes `generated_at_utc` fields; no all-byte identity claim is made for them.
- **No other stale claim found.** Sweeps for "unlanded", "not yet landed" and answer-branch locations tied to DL-401/402/403/444..447 across the four owner documents return only the corrected lines above.

## For a Sol worker

Checker, oracle, fixture and proof findings from `reviews/DMEM-sol/REVIEW-cycle9.md`. This worker did not touch any of these files; the round-eleven commit `ae04b287ae` (rebased from `7a1b9624d4`) claims repairs for all four, and the twelve family checkers exit 0 here — whether those repairs fully satisfy the review is for the Sol re-review.

1. **B1 — preserved fields compare equal across Boolean and integer types. Where now:** `scripts/pm_memory_policy.py:18` (`same()`), `:86` (exact-Boolean inputs incl. unselected/protected originals), `:108`–`:135` (`dedup_checks`, `typed_edits`), `:146` (`dedup_validate`); `scripts/pm_memory_archive_events.py:151`–`:166` (`originals/evidence/versions/selected_fields/pins/unselected` preserved through `POLICY.same`). **Review demand:** exact primitive types compared before values recursively (nested fields, evidence, versions, merge lineage, pins, unselected, expected outputs), one-field wrong-type negatives (Boolean/numeric aliases, floats, strings, null, arrays, objects) and full-checker wrong-oracle probes. Cycle-9 quoted `pm_memory_policy.py:93–98,139,159` and `pm_memory_archive_events.py:151–166` at the round-ten head.
2. **B2 — policy comparisons discarded valid fractional-second precision. Where now:** `scripts/pm_memory_policy.py:29` (`instant()`), `:46` (`selection_checks`) and both survivor comparisons. **Review demand:** compare accepted instants and durations with every admitted fractional digit (no truncation, no new precision cap, original spellings/commitments untouched), with one-field submicrosecond cutoff and creation-order negatives. Cycle-9 quoted `:15–18,35–38,66,84` at the round-ten head.
3. **B3 — the dedup no-project negative carried stale Project copies. Where now:** `Plans/memory_card6_policy_fixtures.json:7783` (`dedup_sweep:no-project`); the separate foreign-Project join negative is `:7619`. **Review demand:** every memory Project observation coherently null in that input, derived from an intact scope-consistent control, each of the two predicates (snapshot-local Project validity; selected-original Project join) proved removable alone with peers enabled.
4. **B4 — the dedup eligible-group guard had no authored negative. Where now:** `scripts/pm_memory_policy.py:79`–`:81` (three consecutive `dedup_eligible_group` predicates: minimum two originals, unique IDs, existence of every selected original); fixtures `Plans/memory_card6_policy_fixtures.json:8749` (`dedup_sweep:fix11-minimum-group`), `:8830` (`fix11-unique-group`), `:8913` (`fix11-existing-group`). **Review demand:** an intact control plus separate minimal negatives for each predicate, no merged removal sets, and inclusion in the shared guard-tool adoption.

## Part 2 items

Recorded only; this worker writes no number helper, serializer, recipe selector or proof code.

1. **S1 — CV-1100 current grammar and owner-range dispatch** (NUMRULE, `plans/ea-numrule-20261105`): core `json_numbers`/`canonical_numbers` (`scripts/pm_memory_maintenance_events.py:62`/`:74`), current producer schemas and registry mirrors, the twelve numeric owner paragraphs and ATS-315. Adopt the shared current token/type rule at ingestion and field-owner ranges, preserving the proven full Storage uint64 domain and historical alternatives. The raw-JSON-token `1.0`→integer conversion noted by cycle 9 belongs here.
2. **S2 — SP-1100/CV-1100 physical, semantic and local commitment profiles:** core `canonical_numbers`, `digest`, `historical_numbers`, `historical_digest`, `retained`, `retained_digest`, `within_value_cap` and `_CODEC.binding_bytes` call sites; all twelve full-value commitment paragraphs. Adopt the distinct shared profiles; never normalize physical floats, erase signed zero or rewrite an older commitment.
3. **S3 — SP-1101 authenticated original recipe selection:** core `HISTORY_RECIPES`, `historical_envelope_matches`, `historical_matches`, `read_canonical_history`, frozen definitions and the numeric owner paragraphs. Adopt authentic immutable original issuance/registry selection with unknown/ambiguous/downgrade negatives, keeping exact old results/bytes and the access/withdrawal fences.
4. **S4 — shared check-11 proof tool:** adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`, replacing the lane-local `scripts/pm_memory_guard_isolation.py:74–94,626–690,833–912` machinery (compound/multi-field removal sets, incomplete inventory: cycle 9 recorded exit 1 `AssertionError: unlisted guard` for both monthly and both prune families). Full per-predicate inventory, site-by-site true-duplicate witnesses and complete complement/restoration checks. The B3/B4 fixture defects themselves stay lane work (listed above).
5. **Guard tables:** restructure the lane's checkers into named predicate functions in a table once the shared guard tool passes (sweep part 2; not started here).
6. **Number recipes CV-1100/1101, SP-1100/1101** are adopted in this lane only after their own Astra review passes; the date-time gate is separate and stays required — this lane's timestamp-field review above is interim only.

## Checks, regeneration and resources

| Check | Exit / result |
|---|---|
| Rebase `9aec2fee0c` onto `origin/main` `2989975e8f` | 30/30 commits; conflicts only in `_shards`/`.plan_index` |
| Lane checker/oracle/proof/fixture files vs `9aec2fee0c` | identical (empty diff) |
| 8× `python3 scripts/pm_memory_maintenance_events.py --family <name>` | 8 × 0 |
| 4× `python3 scripts/pm_memory_archive_events.py --family <name>` | 4 × 0 |
| `pm-shard-plans.py --generate` | 0, `pass` (99 sources) |
| `pm-plan-index.py generate` | 0 (7,518 units) |
| `pm-shard-plans.py --check` | 0, `pass` |
| `pm-plan-index.py validate` | 0, top-level `pass` |
| Currentness edition copy | hash-identical to `/mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness` |

Regeneration rebuilt shards for documents this round did not edit — 649 `storage_value_registry` shard files plus main-side portions of `storage-plan`, `contracts_v0`, `automated_testing_system` and `assistant-memory-subsystem` — because the rebase moved the lane onto a `main` that itself changed those documents after the lane's former merge base `be4766513f`. The generator rebuilt deterministically from the merged sources and the shard check passes; this is the expected rebase consequence, not unrelated churn. Resources: start gate 11 GB RAM available / 91 GB disk free; 11–13 GB available throughout; every checker ran one at a time.

No pm-mail, no subagents, no admission, no registry append, no Decision Log entry, no governance edit, no main push. `91d3ec7a14` changes only the four owner documents and regenerated derived files.

## Twelve-family grades (before and after)

Before = independent cycle-9 review; round = round eleven's regrade (carried); this sweep round changes no grade — its edits are owner-text citations inside the same contract units, re-read at `91d3ec7a14`. P/Q/A in rubric order; every family: membership A (no admission), retention Q (operation/result custody retention unresolved), native NOT_RUN.

| Exact family | Cycle 9 | Round 11 | Sweep part 1 |
|---|---|---|---|
| `memory.dedup_sweep.completed` | 9P/2Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.dedup_sweep.started` | 9P/2Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.index.lexical.rebuild.completed` | 10P/1Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.index.lexical.rebuild.started` | 10P/1Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.index.semantic.rebuild.completed` | 10P/1Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.index.semantic.rebuild.started` | 10P/1Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.monthly_summary.completed` | 9P/2Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.monthly_summary.started` | 9P/2Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.prune_archive.completed` | 9P/2Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.prune_archive.started` | 9P/2Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.verification_sweep.completed` | 10P/1Q/1A | 10P/1Q/1A | 10P/1Q/1A |
| `memory.verification_sweep.started` | 10P/1Q/1A | 10P/1Q/1A | 10P/1Q/1A |

Totals: 120 PASS / 12 PARTIAL / 12 ABSENT, unchanged. The oracle cells of the six blocked families rest on round-eleven's checker/fixture repairs, which are Sol's to re-review under "For a Sol worker"; this round's own reading adds only the landed-decision confirmation and citations above.

---

# DMEM fix round 11 — exact preservation and policy instants

**Branch:** `plans/ea-w2-memory-maintenance-20261104`. **Assessed implementation commit:** `7a1b9624d437de5f29c96cfd2c51bae8dfc2fd27`. **Reviewed head:** `9374fdea031beec5553c9f859fe7c2313b8a2567`. **Independent baseline:** `reviews/DMEM-sol/REVIEW-cycle9.md`, compared with `origin/main` `73f2231a9ec1c93190adafcdde51030f028c8c2d`.

**Worker result:** twelve families prepared without admission, pending independent review. All twelve complete exact-family checker runs exit 0. The six blocked oracle cells upgrade PARTIAL → PASS; every other cell is carried after checking its current citations. Membership remains ABSENT, retention PARTIAL, native execution NOT_RUN. Card 6's applied DL-444..DL-447 answers remain byte-exact in all product owner documents. Earlier reports below are source-pinned lineage, including superseded complete-local-proof and open-cutoff claims.

## Review round 11: findings and responses

- **B1 — fixed (`7a1b9624d437de5f29c96cfd2c51bae8dfc2fd27`). Where:** `scripts/pm_memory_policy.py:18`, `:73`, `:108`, `:152`; `scripts/pm_memory_archive_events.py:148`. **Cause:** Python equality accepted Boolean/integer aliases in preserved fields and complete expected results. **Fix:** compare exact primitive types before values recursively, including nested original fields, evidence, versions, merge lineage, pins, unselected originals and expected outputs. Validate every dedup input flag, including unselected/protected originals, as an exact Boolean. Dedup output flags either compare to exact Boolean inputs or use Boolean identity for the permitted archive disposition. Archive post-state score preservation is type-sensitive. Fixture-only typed literal edits retain intentional float mistakes without changing current/historical number ingestion or any identity serializer. **Verify:** 145 new one-field type-negative templates (290 exact-phase executions), including Boolean/numeric aliases, floats, strings, null, arrays, objects and nested metadata; 12 complete wrong Boolean/float expected-result processes exit 1; 6 restored-equality processes exit 1.
- **B2 — fixed (`7a1b9624d437de5f29c96cfd2c51bae8dfc2fd27`). Where:** `scripts/pm_memory_policy.py:29`, `:64` and both survivor comparisons. **Cause:** datetime discarded valid fractional digits beyond microseconds, changing the oldest survivor and exact elapsed 90/180-day decisions. **Fix:** parse whole-second calendar/zone separately, then compare exact rational seconds using every admitted fractional digit. Decimal construction and Fraction conversion introduce no context rounding, timestamp precision cap or integer-string digit limit. Original spellings, retained originals, hashes and history recipes are untouched. **Verify:** 90 new precision templates: early/equal/late boundaries for edit, access, creation fallback and capture at 9/18/40 digits; creation ordering and stable-ID ties at the same precisions; coherently wrong-survivor negatives. Eight direct precision probes reach 10,001 digits, preserve zone equivalence and exact cutoffs. Six restored-microsecond complete processes exit 1.
- **B3 — fixed (`7a1b9624d437de5f29c96cfd2c51bae8dfc2fd27`). Where:** `Plans/memory_card6_policy_fixtures.json:7783`. **Cause:** null snapshot Project disagreed with selected originals. **Fix:** every memory Project observation is coherently null in this input. The independent one-field foreign-Project negative is preserved. **Verify:** remove only local Project validity: only `dedup_sweep:no-project` flips; remove only the Project join: only `dedup_sweep:foreign-project` flips. Each removal leaves all other 149 dedup negatives at their exact refusal, all 15 positive controls passing, and restoration rejects again.
- **B4 — fixed (`7a1b9624d437de5f29c96cfd2c51bae8dfc2fd27`). Where:** `scripts/pm_memory_policy.py:79`; `Plans/memory_card6_policy_fixtures.json:8749` and the following unique/existing-group cases. **Cause:** no authored negative exercised eligible-group validity. **Fix:** retain the same refusal and split its three predicates into consecutive minimum-size, uniqueness and existence guards. Dereference resolved originals only after validating the complete requested group, without changing the caller's selection. Add one intact control and separate minimal negatives. **Verify:** remove each predicate alone with every peer enabled: exactly its own negative flips, all 149 other dedup negatives retain their refusal, all 15 positives pass, and restoration rejects. Both full exact dedup phases fail when any one of the three guards is removed (6 intended assertion exits 1). No merged removal set is used.
- **N1 — fixed in the same implementation commit. Where:** `Plans/Automated_Testing_System.md:7263`, ATS-315. The stale “No cutoff values are selected” sentence now states that Card 6 supplies DL-446/DL-447's values. Independent admission, operation/result retention and authenticated binding gates remain. ATS-315/316 also name the new typed/precision/isolated-group oracles.
- **N2 — integration item.** Actual index validation exits 1, top-level `fail`, with the same exact 22 inherited failures as round ten: main-only DL-302 and 21 untouched legacy-ledger format records. Decision_Log.md is unchanged. Preserve current main at integration and rerun; no unrelated ledger edits.
- **N3 — accounted for.** Normal regeneration changes generated clocks; no literal all-byte identity claim is made for those fields. Only Automated_Testing_System owner shards change. Fifteen currentness files were copied and SHA-256 matched before index generation; the frozen copied input is retained in `fix11/frozen-currentness/` and is the comparison source.

No blocking finding is disputed. No new product choice is made.

## New cases and check-11 boundary

**242 appended templates:** 61 positives and 181 negatives. The existing 123 templates remain unchanged except for B3's Project copies. Total policy corpus: **365 templates**, executed through both exact phases as **192 positives / 538 negatives**. Every invalid post-state/selection reports exactly its authored predicate; input group cases have intact passing controls. New case IDs are `dedup_sweep:fix11-*`, `monthly_summary:fix11-*` and `prune_archive:fix11-*`; the full 242-ID inventory is `fix11/fixture-additions.json`.

| Predicate removed alone | Only negative that flips | Other negatives keep exact refusal | Positives / restoration |
|---|---|---:|---|
| `scope-local` | `dedup_sweep:no-project` | 149 | 15 / yes |
| `scope-join` | `dedup_sweep:foreign-project` | 149 | 15 / yes |
| `group-minimum` | `dedup_sweep:fix11-minimum-group` | 149 | 15 / yes |
| `group-unique` | `dedup_sweep:fix11-unique-group` | 149 | 15 / yes |
| `group-exists` | `dedup_sweep:fix11-existing-group` | 149 | 15 / yes |

This is a targeted five-predicate witness for B3/B4, with all dedup policy complements. It is not a new whole-lane check-11 completion claim. The lane-local proof script is byte-preserved. Incomplete inventory, compound cuts and duplicate-site machinery remain S4 for the shared tool; no unrelated predicates are claimed as duplicates.

## Sweep items S1–S4

1. **S1 — CV-1100 current grammar/range dispatch. Where:** core `json_numbers`/`canonical_numbers` (lines 62/74), producer schemas/registry mirrors, all twelve numeric owner paragraphs and ATS-315. Adopt shared current token/type grammar and field-owner ranges; keep full Storage uint64 and historical alternatives. No local cap/serializer is added.
2. **S2 — SP-1100/CV-1100 physical, semantic and local commitment profiles. Where:** core `canonical_numbers`, `digest`, `historical_numbers`, `historical_digest`, `retained`, `retained_digest`, `within_value_cap`, `_CODEC.binding_bytes` calls and full-value owner paragraphs. Adopt distinct shared profiles. Never normalize physical floats, erase signed zero or rewrite old commitments.
3. **S3 — SP-1101 authenticated original recipe selection. Where:** core `HISTORY_RECIPES`, `historical_envelope_matches`, `historical_matches`, `read_canonical_history`, frozen definitions and numeric owner paragraphs. Adopt authentic immutable original issuance/registry selection with unknown/ambiguous/downgrade negatives. Preserve old results/bytes and custody/access/withdrawal fences.
4. **S4 — shared check-11 proof tool. Where:** `scripts/pm_memory_guard_isolation.py:74–94,626–690,833–912`, its inventory/report, the policy suite and archive guard inventory. Adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`, with full per-predicate inventory, site-by-site true-duplicate witnesses and complete complement/restoration checks. No lane-local proof rebuild. B3's stale input and B4's missing negatives are repaired here rather than deferred.

These sweep items do not independently reduce preparation grades. They remain OPEN_SHARED_SWEEP in the self-grade.

## Twelve-family re-grade

P/Q/A = PASS/PARTIAL/ABSENT. Before is the independent cycle-9 review. All after vectors are `A P P P P P Q P P P P P` in rubric order; membership/retention/native boundaries remain.

| Exact family | Checker exit | Policy positives / negatives | Before P/Q/A | After P/Q/A |
|---|---:|---:|---:|---:|
| `memory.dedup_sweep.completed` | 0 | 15 / 150 | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 0 | 15 / 150 | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 0 | unchanged policy | 10/1/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 0 | unchanged policy | 10/1/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 0 | unchanged policy | 10/1/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 0 | unchanged policy | 10/1/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 0 | 39 / 60 | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.started` | 0 | 39 / 60 | 9/2/1 | 10/1/1 |
| `memory.prune_archive.completed` | 0 | 42 / 59 | 9/2/1 | 10/1/1 |
| `memory.prune_archive.started` | 0 | 42 / 59 | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 0 | unchanged policy | 10/1/1 | 10/1/1 |
| `memory.verification_sweep.started` | 0 | unchanged policy | 10/1/1 | 10/1/1 |

Totals: **114 PASS / 18 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 144 current cells have exact current-source evidence; **646 citations** re-located and mechanically validated at the assessed implementation commit. The six unaffected families retain all twelve grades.

## Verification, authority and limits

- **Complete family checks:** twelve exact `--family` processes, one at a time, all exit 0. Original phase/writer/reader, custody, checkpoint, schema-reference, full Storage uint64, legacy integer/binary64 and enforced-format suites remain enabled. All old fixture files except the named Card 6 repair are byte-preserved.
- **Failure detection:** 30 sequential complete processes exit 1 at intended AssertionErrors: 12 wrong typed expected outputs, 6 restored ordinary-equality defects, 6 restored fractional-truncation defects and 6 removed-group-predicate defects. Syntax/import/resource errors and KeyErrors are not counted as successful refusal evidence.
- **Standing checks / Astra own probes:** 840 direct observations at this head, zero unexpected results. Own mutations cover forged identity/source/ref contradictions, caller-only Storage metadata retry returning the exact original, replay-only current refusal, required envelope fields, encoded Project partitions, history after live changes and its access/withdrawal/forgery fences, representation/case/space/LF errors, dormant schema refs, whole payload/operation limits and both-outcome original-start custody. Old reduced-reader canonical-envelope expectations are omitted because canonical history has its own full endpoint and complete suite; no invalid reduced-reader claim is made. Native Storage receipt authentication remains NOT_RUN. Items 10/10a remain S1–S3, with all retained-old/full-uint64 suites still running. B1's typed and B2's exact-format arithmetic probes address items 4/11/12 without changing format syntax or historical recipes. B3/B4 address new masked/missing negatives; the general proof issue remains S4.
- **Derived checks:** shard generate/check and index generate exit 0, top-level `pass`. Index validation exits 1, top-level `fail`; exact same 22 inherited failures, no new failures. `git diff --check` exits 0. Only ATS owner shards and ordinary generated index outputs change; generated clocks are qualified.
- **Card 6 and custody preservation:** assistant-memory-subsystem.md, storage-plan.md, Contracts_V0.md, Decision_Log.md, the event-family registry and the lane-local proof script are byte-identical to the reviewed head. No retained-original or identity/hash/number function changes. No new timestamp precision limit, number cap, serializer, admission, registry append, Decision Log entry, governance reseal, landing or main push.
- **Resources:** creation gate 116 GB disk free and 8 GB RAM available. Family/probe checks run sequentially with the 6 GB pause / 7 GB resume rule and two-minute rechecks. No resource pause was needed in the recorded family/probe gates. No pm-mail, subagent, browser or server.
- **IDs used:** no new PlanUnit, Decision Log, schema, consumer, checkpoint, identity or recipe ID. Existing AMS-100..107, SP-630..639, CV-650..659, ATS-315/316 and DL-402/403/444..447 remain owner/adoption/answer references. This round edits only ATS-315/316 prose among owner units; the 242 fixture case IDs are listed separately.
- **Remaining:** independent review; S1–S4 shared adoption; current-main/index reconciliation; per-family admission; unresolved operation/result retention and cited unlanded decision/retention integration; native receipt/transaction/flush/crash/backup/GUI/race proof. No outside-Project execution permission is supplied.

## Round-eleven evidence

All cited paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix11/`.

| File | SHA-256 |
|---|---|
| `family-results.json` | `16719434b4a1c4c9901b68bafc4e00e98877e5b24fa23d040591abe8dadeda24` |
| `fixture-additions.json` | `1127702c18ccaa89f689391f09ccb6505c605602112d93975f40f3fb2ef44092` |
| `targeted-probes.json` | `f97869095e38e377037e89db15fa6c63a34953a4c0daa42d782cf71d248981cf` |
| `full-checker-probes.json` | `caad07fce59d61d86d223f98e27d55ef39131907b2158f77fa36ef542250129d` |
| `standing-astra-probes.json` | `3f9a8bc8434a17daebb6c8525d7a2e6bc12cd8151b7002afa57241c669fb50ce` |
| `checks.json` | `27dca6b7913f2881a05dc7c6aa2f238050c5973f9f447070a5e9c839e0d1371e` |
| `currentness-copy.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `shard-generate.json` | `73df7255d834ada9869ec0dab6c959e585d0ea0f2f754c0f5a67268ed6d7a48f` |
| `shard-check.json` | `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69` |
| `index-generate.json` | `a75c283fa76269c7f59ec1c3bb675849c7cdb1a7c6fa6f63d2d6a24b1672b270` |
| `index-validate.json` | `0f990c07da34646f84843a0e2420165c783683fac548054ced1f769353b1353e` |
| `index-baseline-comparison.json` | `88217c8a9e6f39073fc1e0b565b6b1d5f21439957a629ee42a086791c4afa1b2` |
| `regrade-validation.json` | `2f7cb99cfb933222b44173cb50e4be77e3f2a3374ed5af71c238223dacf60175` |
| `resources.json` | `2de3218471acc3f65180936f5ccc4f5cd428f920220b78ef7c838f99f6dcaab4` |
| `probe-resources.json` | `415e02ef893b09db46b80cdb7efa90c9fb425271a78731cbaee7bd36205095ff` |

Report and self-grade copies overwrite `drafts/DMEM/DMEM.md` and `drafts/DMEM/DMEM-self-grade.json`. Reproduction scripts and a complete SHA-256 manifest remain in fix11; redundant outputs are removed. The sparse worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix11` is removed with a literal-path `git worktree remove --force` after both commits are pushed.

---

# Round 10: deck-2 Card 6 applied

**Branch:** `plans/ea-w2-memory-maintenance-20261104`. **Assessed implementation commit:** `66e99fd527764dd8bdc2399718cba4f5d796f316`. **Starting head:** `2b7af59cd2332bfa2e5f3ce275b47fc8a1530cb7`. This round applies Jared's answers; it is not a review fix.

**Result:** all twelve exact families remain prepared without admission. Card 6 resolves the duplicate survivor/disposition and the two cutoff choices. Membership remains **ABSENT**, retention **PARTIAL**, native execution **NOT_RUN**. No automatic job or Memory-panel button gains runtime approval from this draft. Earlier source-pinned reports below are lineage; their open survivor/cutoff questions and report-only proposals are superseded by this section.

**Jared's verbatim answer:** “i approve all of it”. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md` records that answer. The presented deck's fast-reply rule maps it to A on every item; the option wording is the deck author's text, not an additional Jared quote. Card 6 source is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md`, SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`. DL-444..DL-447 are cited on unlanded `origin/plans/ea-cards2-answers-20261105`; this lane writes no Decision Log entry.

## Items and premise checks

| Item | Current premise and applied behavior | Changed owner locations |
|---|---|---|
| **6.a / DL-444** | Section 7.2 still merges eligible identical embed_text_hash memories. Oldest original creation time survives; same-time ties use the unchanging note ID. Preserve every original EvidenceRef and the merge record. Pins remain excluded; skip a merge that pin protection forbids. Existing eligibility is not broadened. | `Plans/assistant-memory-subsystem.md:404`, `:3184`, `:3236`; `Plans/storage-plan.md:29509`, `:29568`; `Plans/Contracts_V0.md:24492`, `:24539` |
| **6.b / DL-445** | Other eligible originals are archived, retain identities/evidence/versions/survivor links and remain in history. Automatic deletion is forbidden; user deletion only. | Same exact dedup units, plus `Plans/memory_maintenance_contracts.json` approved_policy rows and `scripts/pm_memory_policy.py:48` |
| **6.c / DL-446** | Monthly summary remains Note-only with the existing monthly grouping. Select only idle **>=90 days AND usefulness <0.10**, separately inside each Project. Create the summary and archive every selected original with refs/versions retained. | `Plans/assistant-memory-subsystem.md:416`; `Plans/storage-plan.md:30037`, `:30183`; `Plans/memory_archive_contracts.json`; `scripts/pm_memory_policy.py:21` |
| **6.d / DL-447** | Prune/archive remains archive-only and eligible kinds are not narrowed to Notes. Select only idle **>=180 days AND usefulness <0.05**, separately inside each Project. | `Plans/assistant-memory-subsystem.md:418`; `Plans/Contracts_V0.md:24903`, `:25046`; `Plans/memory_archive_contracts.json`; `scripts/pm_memory_policy.py:21` |

For both archive jobs, idle time starts at the later of the last edit and last access, substituting creation independently for each absent value. Compare exact elapsed duration, without rounding down the age or rounding scores. The usefulness ranking remains section 6.3's existing computed value, with captured inputs, per-kind/Done decay and zero for each missing search score. Pins are excluded before scoring. No count trigger or new eligibility condition is introduced.

The entire approved 6.c/6.d option A text is preserved in section 7.2 and in each exact affected family contract, including the no-project rule: if an outside-Project chat later gets its own fully specified/reviewed saved maintenance record and separate recording approval, only that calling chat is evaluated; chats and Projects are never pooled. These choices supply no outside-Project execution permission. AMS-054's scope separation, UCC-085 commands, admission, unresolved operation/result retention, source/CAS/permission/withdrawal and original-start custody gates remain. DL-446/DL-447 answer only DL-403's missing-cutoffs condition; missing authenticated policy binding still refuses `cutoffs_unavailable`. DL-402's archive-only, user-only deletion and pin rules remain. Section 7.2 contains no archive-or-delete wording.

## Exact option and Sources lines inspected

**6.a / DL-444 — deck option A:** Keep the oldest eligible memory by original creation time, breaking a tie by the unchanging note ID. Preserve every original evidence reference and the record of which copies were merged. If pin protection prevents that merge, skip it. You keep the earliest note ID and its history links.

**Sources (verbatim deck line):** `MAIN:Plans/assistant-memory-subsystem.md:398-412`; `DMEM:Plans/assistant-memory-subsystem.md:3156-3174`; `ANS:Plans/Decision_Log.md:4514-4516`; `evidence:reviews/DMEM-sol/REVIEW-astra-2.md:74-80`; `evidence:reviews/DMEM-sol/REVIEW-cycle4.md:3-7`.

**6.b / DL-445 — deck option A:** Archive the other eligible originals, preserving their identities, evidence references, versions and links to the survivor. They remain available in history and are never automatically deleted. You see one active memory for the merged group.

**Sources (verbatim deck line):** `MAIN:Plans/assistant-memory-subsystem.md:404-406`; `ANS:Plans/Decision_Log.md:4514-4516`; `RET:Plans/storage-plan.md:17487-17487`; `evidence:reviews/DMEM-sol/REVIEW-astra-2.md:74-80`; `evidence:reviews/DMEM-sol/REVIEW-cycle4.md:3-7`.

**6.c / DL-446 — deck option A:** Allow monthly summary to select Note memories idle for at least 90 days AND with usefulness score below 0.10. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Keep the existing monthly grouping. Create the monthly summary and archive every selected original, retaining all evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project.

**Sources (verbatim deck line):** `ANS:Plans/Decision_Log.md:4514-4532`; `origin/plans/ea-w2-memory-maintenance-20261104@77323e87d65908dbce2ea655ee344b6185a13ff1:reports/event-authority-20261104/DMEM.md:709-718`; `origin/plans/ea-w2-memory-maintenance-20261104@77323e87d65908dbce2ea655ee344b6185a13ff1:reports/event-authority-20261104/DMEM.md:786-799`; `evidence:reviews/DMEM-sol/REVIEW-cycle4.md:3-7`; `MAIN:Plans/assistant-memory-subsystem.md:344-359`; `MAIN:Plans/assistant-memory-subsystem.md:464-481`; `evidence:reviews/cards2-sol/REVIEW.md:173-173`.

**6.d / DL-447 — deck option A:** Allow prune/archive to select eligible memories of any kind idle for at least 180 days AND with usefulness score below 0.05. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Archive the selected originals only; retain their evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project.

**Sources (verbatim deck line):** `ANS:Plans/Decision_Log.md:4514-4532`; `origin/plans/ea-w2-memory-maintenance-20261104@77323e87d65908dbce2ea655ee344b6185a13ff1:reports/event-authority-20261104/DMEM.md:709-718`; `origin/plans/ea-w2-memory-maintenance-20261104@77323e87d65908dbce2ea655ee344b6185a13ff1:reports/event-authority-20261104/DMEM.md:786-799`; `evidence:reviews/DMEM-sol/REVIEW-cycle4.md:3-7`; `MAIN:Plans/assistant-memory-subsystem.md:344-359`; `MAIN:Plans/assistant-memory-subsystem.md:464-481`; `evidence:reviews/cards2-sol/REVIEW.md:173-173`.

## Oracles and one-defect cases

`Plans/memory_card6_policy_fixtures.json` has **123 templates: 35 positives and 88 negatives**. Running each through its exact started/completed family executes **70 positive and 176 negative policy cases**. The archive fixture corpus also appends **24** selection/corpus negatives. Existing fixtures are preserved after removing only the newly added transient snapshot fields and appended cases; no retained event, operation, digest, receipt, schema, registry value or old mutation changes.

- **Duplicate positives:** oldest creation despite recent edits; order independence; equal creation times with stable-ID tie; equal instants with different zone spelling; unselected pinned original remains unchanged. Ref union, original refs, versions, merge history and archived-copy survivor links are checked independently.
- **Duplicate negatives:** coherently wrong survivor/tie choice updates all dependent lineage/archive/link copies; visible merged copy; missing original; lost survivor/copy evidence; lost version; missing survivor link; changed original metadata; lost current/prior merge evidence; changed pin; pinned/archived/foreign/nonidentical candidates; no-project input; wrong flag types. Each negative has its own defect.
- **Cutoff positives/refusals:** 89/90 and 179/180 days, one second on each side of the inclusive age boundary, score 0.0999/0.10/0.1001 and 0.0499/0.05/0.0501, exact lower scores, independent missing-edit/access fallbacks, recently edited/accessed originals, second Project, pooled/foreign/no-project inputs, pins, already archived originals, Note-only summary and existing non-Note kinds for prune. Crowding bypasses neither condition; an unselected pin needs no score. String/Boolean/null/array/object scores and malformed timestamp/zone/LF/type forms refuse.
- **Actual Project join:** successful settlement joins the captured selection corpus to the operation's Project, in addition to checking each selected memory. A complete foreign corpus cannot pass by relabeling its own snapshot alone (`scripts/pm_memory_archive_events.py:181`).
- **Single-defect accounting:** every new selection/post-state negative enumerates exactly its named failed predicate; input-candidate negatives change one source invariant. Existing archive guard/complement checks remain enabled and cover the appended runtime selection guards. No lane-local proof script was rebuilt. Full shared-tool proof adoption remains a sweep item; this is not a claim that the old lane-local proof now inventories every new assertion.
- **Failure propagation:** six read-only full-checker probes flip one expected archived flag in a passing new oracle; all exit **1** with the intended assertion, never success.

## Per-family outcome and twelve-criterion self-grade

P=PASS, Q=PARTIAL, A=ABSENT. Criterion order is membership_version, owner_doc, producer, closed_payload_schema, scope_identity, replay_idempotency, retention, redaction_custody, transitions, consumers_checkpoints, compatibility_withdrawal, positive_negative_oracles. Each grade vector below supplies all twelve cells; the JSON provides exact current path/line/quote evidence for every cell.

| Exact family | Final checker exit | New policy positives / negatives | Before P/Q/A | After P/Q/A | Twelve cells |
|---|---:|---:|---:|---:|---|
| `memory.dedup_sweep.completed` | 0 | 4 / 19 | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.dedup_sweep.started` | 0 | 4 / 19 | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.index.lexical.rebuild.completed` | 0 | unchanged policy | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.index.lexical.rebuild.started` | 0 | unchanged policy | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.index.semantic.rebuild.completed` | 0 | unchanged policy | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.index.semantic.rebuild.started` | 0 | unchanged policy | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.monthly_summary.completed` | 0 | 14 / 35 | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.monthly_summary.started` | 0 | 14 / 35 | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.prune_archive.completed` | 0 | 17 / 34 | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.prune_archive.started` | 0 | 17 / 34 | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.verification_sweep.completed` | 0 | unchanged policy | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |
| `memory.verification_sweep.started` | 0 | unchanged policy | 10/1/1 | 10/1/1 | A P P P P P Q P P P P P |

Totals remain **120 PASS / 12 PARTIAL / 12 ABSENT**. Six policy-affected families close their Card 6 choices without upgrading admission or unresolved retention. The other six families retain their policies and pass the complete checker. Assessment is the implementation commit above; report-only commits add no product change. Independent review remains required.

## Standing checks and Astra classes

1. **Forged/contradictory inputs:** old coherent identity/digest/custody negatives remain; the new complete-foreign-corpus negative checks operation/selection Project agreement, and wrong-survivor negatives rebind every dependent copy.
2. **Storage metadata:** original uint64 and metadata-only retry suites run unchanged, including exact owner range and bad types. No Storage cap is added.
3. **History in both directions:** old canonical, compatibility and replay-only history positives still run, with access/withdrawal/forgery refusals. Archive history remains readable without today's cutoff resolver; current selection guards never run on old originals.
4. **One field read two ways:** score comparisons consume captured owner numeric values directly; type checks exclude Boolean/string/container authority. No score is normalized through integer identity code.
5. **Dormant refs:** existing eager resolution and unresolved-reference negatives run in every applicable family; no schema reference changes.
6. **Whole-value sizes:** old envelope/operation 16 KiB and SP-337 tests remain. New rich selection snapshots are transient oracle inputs, not additional persisted payload fields or a new storage value.
7. **Custody on every path:** existing before/commit original-start custody, settled failure, retry, replay, recovery, writer and reader suites remain enabled.
8. **Masked negatives:** new predicates have isolated negatives; only one new named postcondition fails per invalid output. Shared guard-isolation adoption is pending rather than rebuilding the lane-local proof machinery.
9. **Honest grades:** admission ABSENT, retention PARTIAL, native NOT_RUN; no native receipt/transaction/flush/crash/backup/GUI/race claim.
10. **Number spellings:** S1/S2 remain for CV-1100/SP-1100 shared adoption. This round adds no number caps or serializers and changes no existing number function, physical-value normalization or signed-zero rule.
10a. **Historical write recipes:** S3 remains for SP-1101 shared adoption. The old retained-number/recipe controls run unchanged; no stricter current predicate reaches retained history.
11. **Types:** old boundary type suites run; new score and dedup flag type negatives refuse. Pins are excluded before scores are read.
12. **Formats:** reuse the owner's already enforced timestamp grammar; new selection-time missing-zone/LF/empty/wrong-type negatives refuse. No new lane-local format/recipe edition is introduced.

The eleven standing checks also retain current-writer replay-only refusal, canonical Application-key refusal, encoded Project partitions, 16 KiB/SP-337, LF guards, semantic-only retry equality, exact checkpoint-storage joins, nonzero failure exit, eager refs, retained-history access and isolated negatives. The existing full owner numeric/format paragraphs and old generic schemas are byte-preserved.

## Checks, resources and remaining boundaries

| Check | Exit / outcome |
|---|---|
| `shard-generate` | 0 / pass |
| `shard-check` | 0 / pass |
| `index-generate` | 0 / pass |
| `index-validate` | 1 / fail: 22 pre-existing failures; no new/removed failures versus fix9/index-validate.json |
| `scope-audit` | 0 / pass |
| `derived-scope` | 0 / pass |
| `failure-propagation` | 0 / pass |
| `regrade-validation` | 0 / pass |
| `git diff --check` | 0 / pass |

Index validation is **not a pass**: the same 22 failures from round nine remain, with zero new or removed rows. They are pre-existing invalid ledger records/current-main retention differences; `index-baseline-comparison.json` records the exact comparison. The four edited owners alone change shard directories (231 shard paths); no unrelated document shard is changed. Fifteen currentness inputs were copied and SHA-256 matched before index generation. Generated clock fields are ordinary regeneration output, not byte-preservation claims.

Initial resources were 57 GB free disk and 13 GiB RAM available. An initial verification-sweep checker and a later prune/archive rerun exited 1 at the below-6-GiB resource guard; no product assertion failed. Work paused, checked again after two minutes and resumed at >=7 GiB. A second pre-check pause occurred at 5 GiB; its two-minute recheck found 15 GiB. All final exact-family checks exit 0 and run one family at a time; affected-family reruns and wrong-oracle probes are also serial.

**Stopped questions:** none for 6.a..6.d; the selected options decide this round's needed behavior. Existing unresolved operation/result retention, separate review/admission, no-project edition/recording approval, shared S1/S2/S3 number/history adoption, S4 shared guard-tool adoption, current-main/index reconciliation and native proof remain integration boundaries. No approval is inferred for any of them.

**IDs used:** existing DL-402, DL-403 and applied DL-444..DL-447; existing AMS-100/101, SP-630/631/638/639, CV-650/651/658/659 and ATS-315/316. No new PlanUnit or Decision Log ID. New fixture identifier `pm.memory.card6.policy_fixtures.v1`; existing contract/fixture editions remain. No new serializer or number/format recipe.

No admission, registry append, Decision Log entry, governance reseal, frozen validator edit, main push, pm-mail or subagent. Only explicit lane paths are committed. The pushed sparse worktree `/home/sittingmongoose/pm-worktrees/DMEM-r10` is removed with a literal-path `git worktree remove --force` after delivery.

## Round-ten evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/family-results.json` — SHA-256 `645311b05ca2e14aeecf823f906c91f3b54b3d3da67bac6e9383dc8a35a9833d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/family-summary.json` — SHA-256 `9d119b67926d87bfcccb32b71874ba36af50e29a97413f1a47ada16ff8534a1b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/checks.json` — SHA-256 `d178d21b6f414436f3224b0f40971da82cc2eae4148ca0a50445124f2a94bf77`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/failure-propagation.json` — SHA-256 `8b02a3cf10f635deb694706e06987fb4547b3aa8fd4bede31dd9703a2db2df5e`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/scope-audit.json` — SHA-256 `579360c6768029da2b89577ac0f9d1adb089ffb4bfa9e96a81735ebde46a29cb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/derived-scope.json` — SHA-256 `a23a30ecd73bf749247cc6b6cd04a0c717f4b5ea025388e5625a7cae9fceb7f4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/card6-source.json` — SHA-256 `022397c651f20b2e0a72ef23895879f836a7a4174e94c59bf18f2fd74e62ba7f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/currentness-copy.json` — SHA-256 `d01349d9da78cf24aa7d5b41291fcde95d139bac12e0e85063dcd82ca8f7a618`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/shard-generate.json` — SHA-256 `73df7255d834ada9869ec0dab6c959e585d0ea0f2f754c0f5a67268ed6d7a48f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/index-generate.json` — SHA-256 `aa0f46ad8bc12c081d3f6084d078f9186f263d19409e47ad7c7ef3cc9a05ab21`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/index-validate.json` — SHA-256 `e892a47d1c826ee5ffa77f7ffc447ff813aa7660bb3378c7fa113f7435ff5162`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/index-baseline-comparison.json` — SHA-256 `62551e1c92ff6101d43b66b548d003fb0e48066cacf8143a59a84c81a8d29a32`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/regrade-validation.json` — SHA-256 `41727cb31afba82b0afd9597b19af0900269cd3930e2810f9b61311bcb2be149`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/initial-family-results.json` — SHA-256 `7589bb0c285fb2bf09bb2aeade38bb733c009b11bbc19a34ddecc3ee8eead0ee`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/pre-final-family-results.json` — SHA-256 `a070977d3932f2b1457fd2f6c106cdbaa738b2524b469e3a347506fbec86aab9`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/resource-pause.json` — SHA-256 `86045268316650dea063f40bdeceb243bbaa833f7718369603969d65def0d8bc`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/resource-stops.json` — SHA-256 `c1ad7df0ee1b11f539044f6ad1875e59d09b097f09fa936ac5e8f14e48f774da`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/changed-paths.json` — SHA-256 `517178e04cd3e05b81c816f8dbe89d7025b9815b914f9cc932b4af6fdec69715`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-monthly_summary-completed.json` — SHA-256 `241a07c21b502bb5d461e737bfbd7db34f4a96ef818ae66281511bead8429b8c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-monthly_summary-started.json` — SHA-256 `aed90e125e707a22b7f7794a94390464114322e87e2e4d483a8b076578bec53a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-prune_archive-completed.json` — SHA-256 `7887687469be38c40d6a6dd8c848407d3d0bbc2a884a6d2189f2449d3dfa72dc`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-prune_archive-started.json` — SHA-256 `4ba2e463ad1f5d7410c8e9d196ab2bf35d4737b46557650ad8ef548d4ea2da28`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-dedup_sweep-completed.json` — SHA-256 `a2f9c534b8a60ebbcc68c295a680b6713d03f2a531477edb3c14c4204f07432f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-dedup_sweep-started.json` — SHA-256 `cb68b2fbe23dcb5d80cb241ecd6cc8b8075e23ce172bd72eeecbd288c9f5b68f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-index-lexical-rebuild-completed.json` — SHA-256 `a835cbe26631a4430a22ab8ab699d497b0bf9320ccf55d440267765d736c8927`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-index-lexical-rebuild-started.json` — SHA-256 `5a8ccd108ef8b58ee06f1beade9761d392d073e5375fa19f70ba73d6c263bec0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-index-semantic-rebuild-completed.json` — SHA-256 `49a02ea028fb4debb1f7870e3bf439f518f24c9194f8ef62323f9d68cdedcbf9`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-index-semantic-rebuild-started.json` — SHA-256 `0f141633d44d272f2f981dc88aa47bfefbbc8ef892a01a30ca6381e6259ae1cd`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-verification_sweep-completed.json` — SHA-256 `ffb50c1cf49997cbda7b96385a4f037d50363a8389fbf6619a0b1898d74f8bf5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-verification_sweep-started.json` — SHA-256 `57eee784cf7d97da6b84bcbdb50f59b8bc0f9d56dd8f6def0a6bef082dedfd38`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-monthly_summary-completed-wrong-oracle.stderr` — SHA-256 `acb96496eded79cb16edb40ff629e0c00de76649b4b00deafcd24e054696470b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-monthly_summary-started-wrong-oracle.stderr` — SHA-256 `acb96496eded79cb16edb40ff629e0c00de76649b4b00deafcd24e054696470b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-prune_archive-completed-wrong-oracle.stderr` — SHA-256 `9311ca87911e53a8ce33533076a106574b3830c187cf01669ffa38f892b5fa10`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-prune_archive-started-wrong-oracle.stderr` — SHA-256 `9311ca87911e53a8ce33533076a106574b3830c187cf01669ffa38f892b5fa10`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-dedup_sweep-completed-wrong-oracle.stderr` — SHA-256 `9351820caeb92e0a2fbfddc5f3837d89e93155d51b8cfd7e9fd0a739e97046dd`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/r10/memory-dedup_sweep-started-wrong-oracle.stderr` — SHA-256 `9351820caeb92e0a2fbfddc5f3837d89e93155d51b8cfd7e9fd0a739e97046dd`.

Report and self-grade copies are in `drafts/DMEM/`; raw evidence is confined to `r10/`.

---

Earlier source-pinned rounds follow as lineage.

# DMEM fix round 9 — Storage exact uint64 metadata

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source commit: `13030242c51899636c4d7416f27a16b14e3a8b7a`. Reviewed head: `0b3181409fc5bf24fce64c7d94fe6b3a4cc9c4ee`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle8.md` (own-cycle8.json and source-audit.json are under its cycle8-evidence/ directory).

Twelve exact families are prepared without admission, pending independent review. Membership remains ABSENT; retention PARTIAL; native execution NOT_RUN. DL-402/DL-403, cutoff unavailability, all retained-history recipes and format enforcement remain unchanged. No cutoff is selected.

## Review round 9: findings and responses

- **B1 — fixed (`13030242c51899636c4d7416f27a16b14e3a8b7a`). Where:** `scripts/pm_memory_maintenance_events.py:467,533,571`; `scripts/pm_memory_archive_events.py:194`; `Plans/memory_maintenance_event_record.schema.json`; the current-number paragraph in each SP-630–639/CV-658–659 and ATS-315 (`Plans/Automated_Testing_System.md:7259`). **Cause:** the current producer safe-integer preflight and envelope maximum incorrectly narrowed Storage sequence_id before semantic projection; full-record digest admission repeated that cap. **Fix:** apply the unchanged producer preflight only after excluding Storage-owned fields. Current sequence_id separately adopts SP-236 exact uint64 with exact integer type, inherited nonnegative schema bound and maximum 18446744073709551615. Full-record custody reuses the existing integer-json-v1 encoding, already byte-identical on all formerly supported current records; no new serializer or lane-invented cap. Both current writers and metadata-only retries accept the full owner domain. Current producer_sequence_id remains producer-owned under Contracts EventRecord section 1.2; its route is unchanged and S1 remains open. **Verify:** all twelve complete --family checkers; `72` fresh positives, `72` metadata-only retry positives, `72` retries against newly stored boundary originals, and `216` isolated current-write/retry negatives. Guard rows below prove every Storage predicate and every complement. No finding is disputed.
- **Review note 2 — integration item. Where:** index retention validation against current origin/main. Actual `pm-plan-index.py validate` exits 1, top-level `fail`, 22 failures; the unchanged starting index reproduces those failures. Preserve current-main Decision Log additions and rerun at integration. No unrelated ledger or baseline is repaired here.
- **Review note 3 — accounted for. Where:** four index JSON generated_at_utc fields. Normal generation is committed; literal byte identity is not claimed for clock fields. Only the three edited owner documents have changed owner shards.

## Number-domain sweep items (recorded only)

These are S1–S3 from cycle 8 / NUMRULE, reserved for shared CV-1100/SP-1100/SP-1101 adoption. None is fixed or counted as a new grade reduction in this round.

1. **S1 — current grammar/range dispatch. Location:** `scripts/pm_memory_maintenance_events.py:62,74`, current schemas/registry mirrors, SP-630–639/CV-658–659 and ATS-315. Adopt CV-1100 exact current integer-token/type grammar and field-owned ranges. The existing producer route still accepts/normalizes some decimal/exponent and signed-zero forms. Keep the exact Decimal boundary and frozen historical alternatives. B1's Storage cap is removed separately.
2. **S2 — physical versus semantic/local recipes. Location:** `scripts/pm_memory_maintenance_events.py:100,74,571,585,52`, `_CODEC.binding_bytes(canonical_numbers(...))` call sites and all twelve full-value commitment paragraphs. Adopt existing SP-1100/CV-1100/CV-339 owner profiles independently for producer semantics, local identity/results and physical/full-value custody. Existing normalized JSON helpers can collapse integer zero and signed/integral floats; no physical-float normalization or signed-zero rewrite is introduced here. The minimum necessary B1 dispatch reuses the existing encoder unchanged.
3. **S3 — authentic original recipe selection. Location:** `scripts/pm_memory_maintenance_events.py:808,812,585,859`, frozen schema definitions and all twelve numeric paragraphs. Adopt SP-1101 immutable authenticated original issuance/registry selection and unknown/ambiguous/downgrade negatives. The known-old synthetic recipe controls keep passing; the supplied frozen witness/map is not the full shared authenticated issuance tuple. Original bytes/results and access/withdrawal fences remain intact.

## uint64 cases and exact results

`sequence_id` is the only Storage-owned uint64 in this EventRecord. SP-236 segment_generation is a frame-prefix field, absent from this record; producer_sequence_id is explicitly part of Contracts EventRecord section 1.2's producer projection. The fixture field list is asserted against the current model. Typed negatives load through standard JSON so 1.0 remains a float; existing current ingestion grammar is S1.

Every family passes fresh-write and metadata-only retry positives at **0, 9007199254740991, 9007199254740992, 9007199254740993, 1152921504606846976, 18446744073709551615**. Fresh outputs retain exact integer type/value; only the append count advances once. Metadata-only retries preserve the original record, digest, append count and full state. A second retry against each newly stored boundary original also returns its exact original metadata.

Every family refuses **18446744073709551616, -1, false, true, typed 1.0 and string "1"**, plus null, array and object controls, on fresh and retry routes. Each negative derives from its own passing canonical control with only sequence_id changed; input state is unchanged and no output escapes. Results: `{"fresh_negatives": 108, "fresh_positives": 72, "high_original_retry_positives": 72, "metadata_only_retry_negatives": 108, "metadata_only_retry_positives": 72}`.

## Complete check-11 guard-removal table

**130 rows; 23,666 negatives; 1,509,274 guard/case evaluations; 13,062 preserved custody-matrix cases.** Every row removes only its named predicate/declared duplicate set, runs the entire family corpus, flips its own negatives, preserves the exact refusal of every complement, restores the guard and rechecks rejection. Runs are serial, one family and one guard at a time. Full case IDs/complements and the 216 new case-by-case repeated-site proofs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/check11.json`; compact ID hashes/examples are in `reports/event-authority-20261104/DMEM-check11-guards.json`.

Storage bool/string/float/null/array/object type exclusions and lower/upper bounds are cut separately. For each new negative, keep each enforcement site alone, remove each alone, then remove its exact repeated sites together. A duplicate removal covers only the same field and predicate, never an unrelated clause. Only the runtime rejects integral float 1.0; repeated schema type/lower-bound checks can also reject newly stored starts. The full proof records which sites actually enforce each case. General envelope-schema removal retains the independent Storage type/min/max predicates. Frozen-reader predicates are modified only when testing their repeated check on a freshly stored current start, never on a retained-history read.

Former large-integer Storage refusals become positive current writes. Their producer preflight witnesses remain at the actual producer-number endpoint; the producer route itself is unchanged. Existing schema-only Storage type witnesses now belong to their precise Storage type rows. Every other earlier case/guard remains, including historical integrality, custody, format, size, replay, access, cutoff and preservation controls. Unsupported producer-number/format/schema probes retain their actual predicate endpoints; no synthetic bytes or evaluation-time repair is introduced.

### maintenance checker

| Guard / predicate | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 15,452 | yes |
| `admission` | 192 | 15,268 | yes |
| `artifacts` | 4 | 15,456 | yes |
| `boundary_acceptance` | 48 | 15,412 | yes |
| `boundary_payload` | 8 | 15,452 | yes |
| `boundary_receipts` | 144 | 15,316 | yes |
| `boundary_request` | 8 | 15,452 | yes |
| `boundary_scope` | 24 | 15,436 | yes |
| `boundary_snapshot` | 192 | 15,268 | yes |
| `boundary_terminal` | 4 | 15,456 | yes |
| `checkpoint_event` | 8 | 15,452 | yes |
| `checkpoint_key` | 8 | 15,452 | yes |
| `checkpoint_storage` | 8 | 15,452 | yes |
| `commitment_numbers` | 368 | 15,092 | yes |
| `custody_binding` | 4,806 | 10,654 | yes |
| `custody_digest` | 1,134 | 14,326 | yes |
| `custody_flush` | 1,038 | 14,422 | yes |
| `custody_presence` | 934 | 14,526 | yes |
| `custody_shape` | 958 | 14,502 | yes |
| `effect_count` | 4 | 15,456 | yes |
| `effect_once` | 16 | 15,444 | yes |
| `envelope_schema` | 216 | 15,244 | yes |
| `formats_enforced` | 2,488 | 12,972 | yes |
| `history_event` | 40 | 15,420 | yes |
| `inline_cap` | 8 | 15,452 | yes |
| `json_number_grammar` | 56 | 15,404 | yes |
| `operation_cas` | 8 | 15,452 | yes |
| `operation_receipt` | 8 | 15,452 | yes |
| `operation_result_digest` | 8 | 15,452 | yes |
| `operation_result_ref` | 8 | 15,452 | yes |
| `operation_schema` | 72 | 15,388 | yes |
| `original_input` | 8 | 15,452 | yes |
| `outcome` | 8 | 15,452 | yes |
| `partition` | 8 | 15,452 | yes |
| `payload_schema` | 40 | 15,420 | yes |
| `permission_or_withdrawal` | 2,218 | 13,242 | yes |
| `phase` | 8 | 15,452 | yes |
| `prior_selector` | 4 | 15,456 | yes |
| `producer_join` | 40 | 15,420 | yes |
| `references_resolve` | 8 | 15,452 | yes |
| `replay_policy` | 8 | 15,452 | yes |
| `request` | 8 | 15,452 | yes |
| `selected_target` | 4 | 15,456 | yes |
| `selector_cas` | 4 | 15,456 | yes |
| `selector_schema` | 4 | 15,456 | yes |
| `selector_scope` | 4 | 15,456 | yes |
| `source` | 8 | 15,452 | yes |
| `storage_uint64_NoneType` | 16 | 15,444 | yes |
| `storage_uint64_bool` | 48 | 15,412 | yes |
| `storage_uint64_dict` | 32 | 15,428 | yes |
| `storage_uint64_float` | 16 | 15,444 | yes |
| `storage_uint64_list` | 32 | 15,428 | yes |
| `storage_uint64_maximum` | 16 | 15,444 | yes |
| `storage_uint64_minimum` | 16 | 15,444 | yes |
| `storage_uint64_str` | 48 | 15,412 | yes |
| `target_identity` | 4 | 15,456 | yes |
| `target_manifest` | 4 | 15,456 | yes |
| `target_order` | 4 | 15,456 | yes |
| `target_schema` | 4 | 15,456 | yes |
| `target_source` | 4 | 15,456 | yes |
| `terminal_custody` | 8 | 15,452 | yes |
### archive checker

| Guard / predicate | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 8,202 | yes |
| `admission` | 100 | 8,106 | yes |
| `boundary_acceptance` | 24 | 8,182 | yes |
| `boundary_payload` | 4 | 8,202 | yes |
| `boundary_receipts` | 72 | 8,134 | yes |
| `boundary_request` | 4 | 8,202 | yes |
| `boundary_scope` | 12 | 8,194 | yes |
| `boundary_snapshot` | 96 | 8,110 | yes |
| `boundary_terminal` | 2 | 8,204 | yes |
| `checkpoint_event` | 4 | 8,202 | yes |
| `checkpoint_key` | 8 | 8,198 | yes |
| `checkpoint_storage` | 8 | 8,198 | yes |
| `commitment_numbers` | 184 | 8,022 | yes |
| `custody_digest` | 864 | 7,342 | yes |
| `custody_flush` | 442 | 7,764 | yes |
| `custody_presence` | 390 | 7,816 | yes |
| `custody_shape` | 398 | 7,808 | yes |
| `cutoff_commitment` | 4 | 8,202 | yes |
| `cutoff_record` | 4 | 8,202 | yes |
| `cutoff_reference` | 4 | 8,202 | yes |
| `cutoff_scope` | 8 | 8,198 | yes |
| `cutoff_unique` | 4 | 8,202 | yes |
| `cutoffs_unavailable` | 328 | 7,878 | yes |
| `effect_once` | 12 | 8,194 | yes |
| `envelope_schema` | 112 | 8,094 | yes |
| `evidence_preserved` | 4 | 8,202 | yes |
| `formats_enforced` | 1,244 | 6,962 | yes |
| `history_event` | 20 | 8,186 | yes |
| `inline_cap` | 4 | 8,202 | yes |
| `json_number_grammar` | 28 | 8,178 | yes |
| `memory_flags` | 352 | 7,854 | yes |
| `no_extra_memories` | 4 | 8,202 | yes |
| `no_prune_summary` | 2 | 8,204 | yes |
| `operation_cas` | 8 | 8,198 | yes |
| `operation_receipt` | 4 | 8,202 | yes |
| `operation_result_digest` | 4 | 8,202 | yes |
| `operation_result_ref` | 4 | 8,202 | yes |
| `operation_schema` | 40 | 8,166 | yes |
| `original_input` | 4 | 8,202 | yes |
| `originals_preserved` | 4 | 8,202 | yes |
| `outcome` | 4 | 8,202 | yes |
| `partition` | 8 | 8,198 | yes |
| `payload_schema` | 98 | 8,108 | yes |
| `permission_or_withdrawal` | 1,044 | 7,162 | yes |
| `phase` | 4 | 8,202 | yes |
| `pins_preserved` | 4 | 8,202 | yes |
| `references_resolve` | 8 | 8,198 | yes |
| `replay_policy` | 8 | 8,198 | yes |
| `request` | 8 | 8,198 | yes |
| `selected_archived` | 4 | 8,202 | yes |
| `selected_fields_preserved` | 12 | 8,194 | yes |
| `selection_exists` | 4 | 8,202 | yes |
| `selection_kind` | 2 | 8,204 | yes |
| `selection_pinned` | 4 | 8,202 | yes |
| `selection_unique` | 4 | 8,202 | yes |
| `semantic_binding` | 2,034 | 6,172 | yes |
| `source` | 8 | 8,198 | yes |
| `storage_uint64_NoneType` | 8 | 8,198 | yes |
| `storage_uint64_bool` | 24 | 8,182 | yes |
| `storage_uint64_dict` | 16 | 8,190 | yes |
| `storage_uint64_float` | 8 | 8,198 | yes |
| `storage_uint64_list` | 16 | 8,190 | yes |
| `storage_uint64_maximum` | 8 | 8,198 | yes |
| `storage_uint64_minimum` | 8 | 8,198 | yes |
| `storage_uint64_str` | 24 | 8,182 | yes |
| `summary_provenance` | 2 | 8,204 | yes |
| `terminal_custody` | 8 | 8,198 | yes |
| `unselected_preserved` | 4 | 8,202 | yes |
| `versions_preserved` | 4 | 8,202 | yes |

## Twelve-family grades before and after

Before is the independent cycle-8 review. P/Q/A = PASS/PARTIAL/ABSENT. Only positive_negative_oracles upgrades PARTIAL → PASS, solely after B1's full-range controls and guard proof. S1–S3 are sweep-only. Other cells agree with the review.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.started` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.completed` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Totals: **108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. Each family remains prepared without admission; retention and native limitations stay explicit. Exact citations are re-pinned at the assessed source commit.

## Checks, preservation and boundaries

- **Complete checkers:** all 12 --family runs exit 0. All old suites remain enabled, including 340 retained-old and 340 live-independent controls, 96 old binary64 controls, 216 old-receipt forgery negatives, 3732 format negatives and 2736 format positives.
- **Standing checks 1–11:** existing replay-only, exact Application-key refusal, encoded Project partition, whole-value 16 KiB/SP-337, identifier LF, semantic-only retry, checkpoint joins, failure-exit, eager-ref, retained-history and full isolation suites run in every applicable family. All 24 restored-B1 complete checker processes exit 1 at the intended owner-valid-large-sequence assertion (whole-event preflight and schema maximum, separately, in every family). No extra native claim.
- **Astra classes:** independent coherent-identity forgery, Storage-only retry, four-mode live-independent history/access, integer-for-hex, dormant ref, whole-value cap, both-outcome missing-start custody, and wrong authority/archive types pass for every family. Whole-corpus check 11 covers masked negatives. Honest preparation grades retain admission/retention/native limits. Number classes 10/10a retain existing history controls and list S1–S3 above; explicit format edges remain enabled for class 12.
- **Preservation:** 56 assertions preserve all old fixtures/contracts/registry rows, generic envelope, current/frozen operation/target schemas, exact Card 1b owner text, history/format/producer-number functions, Decision Log and cutoff proposal. Only thirteen current-number paragraphs change across the three owner docs. No new PlanUnit IDs.
- **Derived files:** shard generate/check and index generate pass. Actual index validation retains its existing current-main integration failures, as reproduced against the untouched starting index. All 15 currentness inputs are SHA-matched before generation and retained under fix9/frozen-currentness for reproduction. Generated clocks are qualified.
- **Resources:** initial disk 96 GB free and RAM 9 GiB available. Initial attempts paused at the unchanged 6 GiB guard; successful checks enforce it per family/guard. Sparse local worktree; no parallel checker, subagent, pm-mail, browser, server, admission, registry append, Decision Log entry, governance reseal, landing lock or main push.
- **IDs used:** no new PlanUnit IDs. Edited existing SP-630–639, CV-658–659, ATS-315. Existing AMS-100–107, CV-650–657 and ATS-316 remain references. New fixture identifier: pm.memory.storage_uint64_fixtures.v1. No new recipe/serializer identifier.
- **Remaining:** independent review; S1–S3 shared adoption; current-main/index reconciliation; per-family admission; operation/result retention and cited unlanded decision/retention integration; Jared's cutoff choice; native receipt/transaction/flush/crash/backup/GUI/race proof. Dedup survivor/disposition remains open.

## Round-nine evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/check11.json` — SHA-256 `d243a1a551e83be8647fc5e069e52f00a70a3b7e02a95d84d69581286484d846`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/family-summary.json` — SHA-256 `960d442de806c2800a7dac545f6adc0022f788f364ba5c39493710833d9d258d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/restored-b1.json` — SHA-256 `3f055337795eaa0e55911417bee8a754056949181b5348a44510f413e49a894e`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/independent-probes.json` — SHA-256 `8faf23d47c629d4460d848866be85bbb48069f50aebc3c4ff514188763a2f6a6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/scope-preservation.json` — SHA-256 `a60058464aa27a10bfea95e0c7857537a953e1901ff53ce1c276a1b427fbf3e8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/currentness-copy.json` — SHA-256 `044c5dff7d5239bd1daadf0be7fdf65f457da8866de3c1fee06067533212242c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/index-validate.json` — SHA-256 `1e38cfac5f90eba5e370254d1ce638cd745ab0c14d3ea4edeb3c47fc5a0e7a60`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix9/index-baseline-equivalence.json` — SHA-256 `13cfbdb7ed8c987a977e81ba5d6353055ee0d4b4f2cd400de079d09826b36542`.

Report/self-grade copies are in drafts/DMEM/. Complete proof IDs/complements remain in fix9/check11.json; redundant run outputs and temporary copies are removed. The sparse worktree is removed with the literal path after both commits are pushed.

---

Earlier source-pinned reports follow as lineage; their cutoff proposal is unchanged.

# DMEM fix round 8 — retained write recipes and enforced formats

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source commit: `ba3880b49cc9c0d6e2d89adfd40b3ca3a7550fd8`. Reviewed head: `e6703d144e85ddd7e566729848666656dfe6f14e`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle7.md`.

Twelve exact families are prepared without admission, pending independent review. Membership remains ABSENT; retention PARTIAL; native execution NOT_RUN. The exact DL-402/DL-403 Card 1b application, original first-start custody gate, all earlier fixtures/failed snapshots and the report-only cutoff proposal remain unchanged. No cutoff is selected.

## Review round 8: findings and responses

- **B1 — fixed (`ba3880b49cc9c0d6e2d89adfd40b3ca3a7550fd8`). Where:** `scripts/pm_memory_maintenance_events.py` historical digest/envelope/operation/target paths, plus retained-original verification during current-writer retries and checkpoint joins; frozen schema definitions; each SP-630–639/CV-658–659 numeric paragraph and ATS-315. **Cause:** the strict current-number domain was applied to retained originals and their immutable operation witnesses. **Fix:** current writes and current identity inputs keep `safe-integer-write-v2`; both retained `pm.event.v0` envelope editions explicitly use frozen `integer-json-v1`. Current writes are a byte-identical subset of that encoding, so changing edition cannot choose weaker hashing. The reader has no caller recipe override; closed schemas reject unknown editions/recipe fields, and repeated edition joins remain. Original hashes/values are never repaired while reading. Frozen `historical_` operation/target definitions equal the actual cycle-6 source, including its int63 artifact bound. Lossless ingestion, exact Boolean types, custody, access and withdrawal stay enforced. Verify all twelve full checkers, 72 actual old-writer receipts (48 integer and 24 integral binary64), 192 four-mode large-integer histories, 96 retained old-binary64 controls, four old-domain rebuild artifacts, 48 verbatim old-writer retained controls, unchanged-commitment decimal/exponent controls, 72 actual old-receipt retry controls and their 216 isolated digest/flush/binding negatives, and forged-history guard rows.
- **Note 2 — integration item. Where:** index retention validation against newer `origin/main`. **Cause:** the branch predates current-main Decision Log additions. **Handling:** Decision_Log.md remains byte-preserved; actual index validation is `fail` with 22 failures. The untouched starting index reproduces the same failures. Preserve current-main decisions during the integration rebase and rerun validation; do not repair unrelated ledgers here.
- **Note 3 — accounted for. Where:** four generated index clock fields. **Cause:** the generator writes `generated_at_utc`. **Handling:** normal generation is committed; no literal byte-identity claim. Only edited owner documents have changed owner shards; schema and fixture inputs are committed directly.
- **Astra item 12 — fixed (`ba3880b49cc9c0d6e2d89adfd40b3ca3a7550fd8`). Where:** optional `FormatChecker` date-time registration on this VM. **Cause:** its installed checker silently lacks `date-time`, despite a format checker being passed. **Fix:** explicit full-input RFC3339 calendar/zone/fraction grammar and UUID grammar at every validator construction. Missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, unsupported leap seconds and empty fractional parts refuse; leap-day and permitted fractional controls pass without rewriting timestamp bytes. All 85 format declarations are visited, including frozen definitions and dormant checkpoint branches. Existing UTC-Z/type/length constraints remain. The declared format contract is enforced in both reader editions; no narrower historical format recipe is introduced.

## Family grades before and after

Before is the independent cycle-7 review. P/Q/A = PASS/PARTIAL/ABSENT. Compatibility/withdrawal and oracles upgrade PARTIAL → PASS after the new legacy-positive, forgery, format and complete-guard proofs. Other cells remain unchanged. Static preparation only.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 8/3/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 8/3/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 8/3/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 8/3/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 8/3/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 8/3/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 8/3/1 | 10/1/1 |
| `memory.monthly_summary.started` | 8/3/1 | 10/1/1 |
| `memory.prune_archive.completed` | 8/3/1 | 10/1/1 |
| `memory.prune_archive.started` | 8/3/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 8/3/1 | 10/1/1 |
| `memory.verification_sweep.started` | 8/3/1 | 10/1/1 |

Totals: **96 PASS / 36 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. The self-grade has exact source citations at the assessed source commit. Absent membership, unresolved retention and native NOT_RUN remain explicit.

## Complete guard table

**114 named guards/duplicate sets; 23,450 negatives; 1,307,922 guard/case evaluations; 13,062 preserved custody-matrix cases.** Every guard runs once per applicable family, including zero-own-case complements, one family and one guard/duplicate set at a time. Every case has a passing control; own negatives flip, all complements keep their exact refusal, and restoration rechecks own negatives. No required-field exemption, evaluation-time input/hash/copy repair or whole-gate bypass.

The current-number and historical-integrality predicates are separate members of the named numeric duplicate set. Only current schemas retain the safe upper bound; frozen schemas retain their original bounds. The 480 former historical safe-range refusals are replaced by original-recipe positives; every current-writer/identity numeric refusal remains. Envelope schema removal also removes only its repeated historical schema_id/schema_version comparisons; its independent format guard stays enabled. Format removal names explicit format checks and UTC/end-of-input patterns on formatted leaves only; unrelated patterns, types, lengths, required fields and lower bounds stay enabled. Existing custody, producer, Boolean-fence and archive-memory duplicate sets are preserved.

Missing-byte/withdrawal witnesses use the actual custody gate. Other custody/legacy-history witnesses use complete entry points. Format, parser, schema, cap and reference witnesses use their actual predicate endpoints; the report does not claim physical receipt authentication or native transactions.

### maintenance checker

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 15,308 | yes |
| `admission` | 192 | 15,124 | yes |
| `artifacts` | 4 | 15,312 | yes |
| `boundary_acceptance` | 48 | 15,268 | yes |
| `boundary_payload` | 8 | 15,308 | yes |
| `boundary_receipts` | 144 | 15,172 | yes |
| `boundary_request` | 8 | 15,308 | yes |
| `boundary_scope` | 24 | 15,292 | yes |
| `boundary_snapshot` | 192 | 15,124 | yes |
| `boundary_terminal` | 4 | 15,312 | yes |
| `checkpoint_event` | 8 | 15,308 | yes |
| `checkpoint_key` | 8 | 15,308 | yes |
| `checkpoint_storage` | 8 | 15,308 | yes |
| `commitment_numbers` | 368 | 14,948 | yes |
| `custody_binding` | 4,806 | 10,510 | yes |
| `custody_digest` | 1,134 | 14,182 | yes |
| `custody_flush` | 1,038 | 14,278 | yes |
| `custody_presence` | 934 | 14,382 | yes |
| `custody_shape` | 958 | 14,358 | yes |
| `effect_count` | 4 | 15,312 | yes |
| `effect_once` | 16 | 15,300 | yes |
| `envelope_schema` | 296 | 15,020 | yes |
| `formats_enforced` | 2,488 | 12,828 | yes |
| `history_event` | 40 | 15,276 | yes |
| `inline_cap` | 8 | 15,308 | yes |
| `json_number_grammar` | 56 | 15,260 | yes |
| `operation_cas` | 8 | 15,308 | yes |
| `operation_receipt` | 8 | 15,308 | yes |
| `operation_result_digest` | 8 | 15,308 | yes |
| `operation_result_ref` | 8 | 15,308 | yes |
| `operation_schema` | 72 | 15,244 | yes |
| `original_input` | 8 | 15,308 | yes |
| `outcome` | 8 | 15,308 | yes |
| `partition` | 8 | 15,308 | yes |
| `payload_schema` | 40 | 15,276 | yes |
| `permission_or_withdrawal` | 2,218 | 13,098 | yes |
| `phase` | 8 | 15,308 | yes |
| `prior_selector` | 4 | 15,312 | yes |
| `producer_join` | 40 | 15,276 | yes |
| `references_resolve` | 8 | 15,308 | yes |
| `replay_policy` | 8 | 15,308 | yes |
| `request` | 8 | 15,308 | yes |
| `selected_target` | 4 | 15,312 | yes |
| `selector_cas` | 4 | 15,312 | yes |
| `selector_schema` | 4 | 15,312 | yes |
| `selector_scope` | 4 | 15,312 | yes |
| `source` | 8 | 15,308 | yes |
| `target_identity` | 4 | 15,312 | yes |
| `target_manifest` | 4 | 15,312 | yes |
| `target_order` | 4 | 15,312 | yes |
| `target_schema` | 4 | 15,312 | yes |
| `target_source` | 4 | 15,312 | yes |
| `terminal_custody` | 8 | 15,308 | yes |
### archive checker

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 8,130 | yes |
| `admission` | 100 | 8,034 | yes |
| `boundary_acceptance` | 24 | 8,110 | yes |
| `boundary_payload` | 4 | 8,130 | yes |
| `boundary_receipts` | 72 | 8,062 | yes |
| `boundary_request` | 4 | 8,130 | yes |
| `boundary_scope` | 12 | 8,122 | yes |
| `boundary_snapshot` | 96 | 8,038 | yes |
| `boundary_terminal` | 2 | 8,132 | yes |
| `checkpoint_event` | 4 | 8,130 | yes |
| `checkpoint_key` | 8 | 8,126 | yes |
| `checkpoint_storage` | 8 | 8,126 | yes |
| `commitment_numbers` | 184 | 7,950 | yes |
| `custody_digest` | 864 | 7,270 | yes |
| `custody_flush` | 442 | 7,692 | yes |
| `custody_presence` | 390 | 7,744 | yes |
| `custody_shape` | 398 | 7,736 | yes |
| `cutoff_commitment` | 4 | 8,130 | yes |
| `cutoff_record` | 4 | 8,130 | yes |
| `cutoff_reference` | 4 | 8,130 | yes |
| `cutoff_scope` | 8 | 8,126 | yes |
| `cutoff_unique` | 4 | 8,130 | yes |
| `cutoffs_unavailable` | 328 | 7,806 | yes |
| `effect_once` | 12 | 8,122 | yes |
| `envelope_schema` | 152 | 7,982 | yes |
| `evidence_preserved` | 4 | 8,130 | yes |
| `formats_enforced` | 1,244 | 6,890 | yes |
| `history_event` | 20 | 8,114 | yes |
| `inline_cap` | 4 | 8,130 | yes |
| `json_number_grammar` | 28 | 8,106 | yes |
| `memory_flags` | 352 | 7,782 | yes |
| `no_extra_memories` | 4 | 8,130 | yes |
| `no_prune_summary` | 2 | 8,132 | yes |
| `operation_cas` | 8 | 8,126 | yes |
| `operation_receipt` | 4 | 8,130 | yes |
| `operation_result_digest` | 4 | 8,130 | yes |
| `operation_result_ref` | 4 | 8,130 | yes |
| `operation_schema` | 40 | 8,094 | yes |
| `original_input` | 4 | 8,130 | yes |
| `originals_preserved` | 4 | 8,130 | yes |
| `outcome` | 4 | 8,130 | yes |
| `partition` | 8 | 8,126 | yes |
| `payload_schema` | 98 | 8,036 | yes |
| `permission_or_withdrawal` | 1,044 | 7,090 | yes |
| `phase` | 4 | 8,130 | yes |
| `pins_preserved` | 4 | 8,130 | yes |
| `references_resolve` | 8 | 8,126 | yes |
| `replay_policy` | 8 | 8,126 | yes |
| `request` | 8 | 8,126 | yes |
| `selected_archived` | 4 | 8,130 | yes |
| `selected_fields_preserved` | 12 | 8,122 | yes |
| `selection_exists` | 4 | 8,130 | yes |
| `selection_kind` | 2 | 8,132 | yes |
| `selection_pinned` | 4 | 8,130 | yes |
| `selection_unique` | 4 | 8,130 | yes |
| `semantic_binding` | 2,034 | 6,100 | yes |
| `source` | 8 | 8,126 | yes |
| `summary_provenance` | 2 | 8,132 | yes |
| `terminal_custody` | 8 | 8,126 | yes |
| `unselected_preserved` | 4 | 8,130 | yes |
| `versions_preserved` | 4 | 8,130 | yes |

## All eleven standing checks

| # | Evidence and limits |
|---|---|
| 1 | Fresh/retry replay-only writer refusals remain for every family; historical replay-only positives use the reader path. |
| 2 | Exact CV-366 Application attempts refuse; these prepared editions remain Project-only. |
| 3 | Encoded project~ positives and raw/foreign/padded partition negatives remain. |
| 4 | Whole payload and separate operation/terminal-reservation caps remain; old cap fixtures are byte-preserved. SP-337 remains authoritative for larger bodies. |
| 5 | Identifier full-input/length and trailing-LF negatives remain; new format grammar uses fullmatch. |
| 6 | Caller-only sequence/observed/persisted retry changes return the unchanged original; semantic conflicts refuse. Physical Storage authentication remains native. |
| 7 | Existing SP-278 checkpoint storage/key/event joins remain; UUID format is now dependency-independent. |
| 8 | Restored historical-number and skipped-format defects each make every complete checker exit 1 at its intended assertion (24/24). Failure is never counted as success. |
| 9 | Eager offline reference walk still covers all used schemas, frozen definitions and registry mirrors; dormant mutations remain. |
| 10 | All prior history suites plus 340 authentic old-recipe controls and 340 live-independent controls pass. New writes remain strict. Forged/withdrawn/foreign originals refuse. |
| 11 | Complete table above, including new legacy-history and format cases; no guard is weakened. |

## All Astra defect classes, including 10a and 12

| Item | Own mutation / disposition |
|---|---|
| 1 Forged/contradictory inputs | Independent coherently rehashed foreign identity refuses for each family; new old-recipe rehashed foreign-source/edition cases and preserved cutoff contradictions refuse. |
| 2 Storage metadata trusted from payload | Independent caller-only Storage sequence/observed/persisted changes return the original (36/36). Synthetic resolver authentication remains a native limitation. |
| 3 History in either direction | All four modes, current-live replacements and absent admission/cutoffs pass. The 72 actual old-writer receipts (48 integer and 24 integral binary64), large retained domains and all typed access/withdrawal/forgery controls pass. |
| 4 One field read two ways | Integer-for-hex, schema type, case/space/LF and exact numeric tests remain; decimal/exponent legacy controls keep the same stored commitment. No timestamp normalization changes hash bytes. |
| 5 Dormant refs | Independent unseen payload ref mutations refuse; whole-schema offline walking includes every new frozen definition. |
| 6 Partial sizes | Whole-value cap mutation refuses; operation/target/selector and terminal-reservation checks remain. No contradictory larger-inline route or owner sentence was added. |
| 7 Custody on every path | Independent succeeded/failed terminal advances with missing starts refuse; all 13,062 prior matrix cells remain. |
| 8 Masked negatives | Complete removal/restoration/complement table passes. Initial diagnostics exposed missing historical integrality and repeated edition comparisons; final tests prove the independent guard and precisely named duplicate constants. |
| 9 Inflated grades | All complete checkers, authentic old-writer controls, restored defects, full table and exact citations are required before upgrading the two cells. Retention/admission/native limits stay explicit. |
| 10 Numeric spellings | Current safe limits and out-of-range decimal/exponent/fraction controls remain; 1/1.0/1e0/-0 agree and 01 refuses. Large retained integers use the frozen domain. |
| 10a Tightening history | Fixed write-recipe map per envelope edition, frozen operation/target schemas, byte-identical current subset, unchanged old receipts and 480 isolated forged-history refusals. Unknown recipe fields/editions cannot select a weaker route. |
| 11 Type confusion | All prior wrong Boolean/number/string/null/array/object boundary cases and coherent input/output archive-flag cases remain in every complete suite and guard proof. |
| 12 Skipped formats | Explicit format implementation plus 3,732 negatives and 2,736 fractional/leap-day positives; all 85 format declarations are visited. No optional package can silently skip these formats. |

## Checks, preservation, resources and remaining work

- **Complete checkers:** 12/12 exit 0, each through --family. New controls: {"current_recipe_refusals": 144, "forged_old_recipe": 480, "format_declarations": 1020, "format_negatives": 3732, "format_positives": 2736, "legacy_binary64_controls": 96, "legacy_number_spellings": 480, "legacy_retry_negatives": 216, "live_independent_old_recipe": 340, "retained_old_recipe": 340}. All prior suites remain enabled; retained-original verification on writer retries uses the frozen recipe while the caller input remains strict.
- **Guard proof:** 114 sets / 23,450 negatives / 1,307,922 evaluations; sequential and no bypass. Full ids/complements are external; the committed compact table pins counts, examples and id-list hashes.
- **Restored defects and independent probes:** 24/24 complete checker failures at intended assertions; independent per-family probes cover existing forgery, Storage retry ownership, history/access, representation, dormant refs, cap, custody, numbers and exact types.
- **Derived files:** shard generation/check and index generation pass. Actual index validation is `fail`; the same failures reproduce from the untouched starting index. Currentness copy: 15/15 SHA-256 matches before generation. Generated clocks are qualified, not restamped.
- **Preservation:** all old fixtures, canonical histories, boundary fixtures, contracts, current operation/target definitions, registry values/profiles, Card 1b owner hunk, Decision Log and generic envelope schema are byte-preserved. Only 13 own numeric/format paragraphs change across the three owner docs. No PlanUnit id changes.
- **Resources:** sparse local worktree; initial disk 70 GB free and RAM 17 GiB available. Every family/guard enforces the 6 GiB gate. No parallel checker, subagent, pm-mail, browser, server, admission, landing lock, governance reseal or main push.
- **IDs:** no new PlanUnit ids. Existing edited ids: SP-630–639, CV-658–659, ATS-315. Existing AMS-100–107, CV-650–657 and ATS-316 remain references. New fixture schema id: pm.memory.write_recipe_fixtures.v1; recipe labels integer-json-v1 and safe-integer-write-v2 name preserved encoding and its strict writer subset.
- **Remaining:** independent review; current-main/index reconciliation at integration; per-family admission; pending operation/result retention and cited unlanded decisions/retention integration; Jared's cutoff choice; native receipt/transaction/flush/crash/backup/GUI/race proof. The dedup survivor/disposition question remains open.

## Evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/check11.json` — SHA-256 `61d4f448bb7d44e56abdc7c6586efffc804fc595facdcbcec3815cb3e281efc7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/family-summary.json` — SHA-256 `985c5501dd534f8195b732e9146c86789e220ffc581cadb05a5909b9d7304906`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/restored-defects.json` — SHA-256 `05fb37e02a1bf12ec04d540e98ae56661c079c9288d9a60c321785f55a9cc6b8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/independent-probes.json` — SHA-256 `8faf23d47c629d4460d848866be85bbb48069f50aebc3c4ff514188763a2f6a6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/scope-preservation.json` — SHA-256 `04f400843ed98ac5d3d5bf2a828b3d1ef4d001615c570c2345efb90446a2aa32`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/currentness-copy.json` — SHA-256 `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/index-validate.json` — SHA-256 `f9ecca138f783c040a0c537d89f3b4863a43d87b88e4c634a05b0b81eb3c3e6b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/index-baseline-equivalence.json` — SHA-256 `0ffb28294c1b19fe46d66ee90a2fa30863ecf75943b2cf512c1cdbdaadbdea44`.

Report and self-grade copies are in drafts/DMEM/. Complete ids and complements remain in check11.json; unneeded run outputs and extracted old-source scratch are removed after verification. The worktree is removed after both commits are pushed.

---

Earlier source-pinned reports follow as lineage; the cutoff proposal is unchanged.

# DMEM fix round 7 — cycle-6 B1, S1 and S2

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source commit: `9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`. Reviewed head: `77323e87d65908dbce2ea655ee344b6185a13ff1`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle6.md`.

Twelve exact families prepared without admission, pending independent review. Membership remains ABSENT; retention PARTIAL; native execution NOT_RUN. The first-start custody gate, withdrawal choice, every `failed_terminal_saved` snapshot, Card 1b application and report-only cutoff proposal are preserved.

## Review round 7: findings and responses

- **B1 — fixed (`9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`). Where:** `json_numbers`, `canonical_numbers`, the lane envelope/operation/target schemas and registry mirrors; own SP-630–639/CV-658–659 paragraphs and ATS-315. **Cause:** binary64 parsing rounded decimal/exponent spellings before normalization. **Fix:** decode decimal/exponent tokens exactly, normalize supported mathematical integers, and refuse fractions/nonfinite values or |n| > 9007199254740991. Existing nonnegative domains retain their lower bounds. Every identity/idempotency/result/target/full-value digest uses this same normalization; encoded-size inputs normalize too. The lane schema inherits all current and frozen compatibility-envelope rules without changing the generic envelope schema. Boundary cases cover ±(2^53−1), ±2^53, ±2^60, all review spellings, near-integer fractions, 1.0, 1e0, -0 and invalid 01. Two old cap fixtures are coherently rebuilt with safe byte lengths, preserving their encoded sizes and refusal targets. Verify the complete per-family checkers, `independent-probes.json`, restored numeric-parser defects and the `commitment_numbers` duplicate-set row.
- **S1 — fixed (`9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`). Where:** `flag`, all writer/access/withdrawal and boundary receipt/source/acceptance conditions. **Cause:** truthiness granted authority to non-Boolean fields. **Fix:** exact Boolean type precedes value evaluation; strings, numeric 0/1, null, arrays and nested objects refuse. The same checks cover phase effects/recovery and reduced/canonical history; history still ignores current admission/cutoffs. Every malformed authority value has an intact typed control and a complete-entry guard witness. Verify each family's domain corpus and restored authority defect (12/12 nonzero checker exits).
- **S2 — fixed (`9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`). Where:** `memory_flags`, `archive_candidate`, `archive_validate`. **Cause:** malformed pinned/archive values were used as memory state. **Fix:** validate every resolved input/output memory's exact Boolean fields before selection and post-state validation. All selected, unselected and pinned originals have wrong-type settlement cases; coherent before/after copies prove post-state refusal without a stale preservation copy. Typed pin/archive policy is unchanged. Verify the four per-family `memory_flags` rows and restored memory-type defects (4/4 nonzero exits).

No finding is disputed or stopped for a new product decision. The cutoff question remains only in the unchanged proposal below; DL-403 keeps those jobs unavailable until approved cutoff records exist.

## Family grades before and after

PASS/PARTIAL/ABSENT, static preparation only. The independent cycle-6 oracle grade is PARTIAL; only that cell upgrades to PASS.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.started` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.completed` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Totals: **108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 144 cells have exact source citations; 532 quotations resolve at the assessed commit. There is no admission or native execution claim.

## Complete guard table

**112 named guards/duplicate sets; 19,502 negatives; 1,068,648 guard/case evaluations; 13,062 preserved custody-matrix cases.** Each family runs in its own sequential process. Every guard for its checker is removed once in every family, including families where it has zero own cases; merging the per-family lists therefore preserves the complete lane complement. Every own negative flips, every other negative keeps its exact refusal, and restoration rechecks the own negatives. No parallel checker/guard jobs or whole-gate bypasses.

The numeric duplicate set names the actual canonical-number refusal/numeric preflights plus integer/safe-upper-bound schema enforcement. Required fields, structural and nonnumeric type checks and existing lower bounds remain enabled. JSON grammar removal suppresses only JSONDecodeError, retaining numeric-domain validation. Authority/receipt groups name flag's exact-type and Boolean-identity checks at every repeated fence site. Existing named custody/producer/schema duplicate sets are preserved. `memory_flags` names its input-selection and input/output-validation sites.

Presence/withdrawal witnesses use the actual common gate without manufacturing absent bytes. Complete phase/writer/boundary/reader entry points cover the other custody and authority cases. Numeric grammar/hash/schema preflight witnesses use their actual predicates: unsupported fractions receive no fabricated retained commitment. Supported numeric forms also run complete writers and all four historical readers. Physical custody, transaction/flush/race and native behavior remain NOT_RUN.

### maintenance checker

Corpus: 12,684 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 12,676 | yes |
| `admission` | 192 | 12,492 | yes |
| `artifacts` | 4 | 12,680 | yes |
| `boundary_acceptance` | 48 | 12,636 | yes |
| `boundary_payload` | 8 | 12,676 | yes |
| `boundary_receipts` | 144 | 12,540 | yes |
| `boundary_request` | 8 | 12,676 | yes |
| `boundary_scope` | 24 | 12,660 | yes |
| `boundary_snapshot` | 192 | 12,492 | yes |
| `boundary_terminal` | 4 | 12,680 | yes |
| `checkpoint_event` | 8 | 12,676 | yes |
| `checkpoint_key` | 8 | 12,676 | yes |
| `checkpoint_storage` | 8 | 12,676 | yes |
| `commitment_numbers` | 688 | 11,996 | yes |
| `custody_binding` | 4,726 | 7,958 | yes |
| `custody_digest` | 1,054 | 11,630 | yes |
| `custody_flush` | 958 | 11,726 | yes |
| `custody_presence` | 934 | 11,750 | yes |
| `custody_shape` | 958 | 11,726 | yes |
| `effect_count` | 4 | 12,680 | yes |
| `effect_once` | 16 | 12,668 | yes |
| `envelope_schema` | 200 | 12,484 | yes |
| `history_event` | 40 | 12,644 | yes |
| `inline_cap` | 8 | 12,676 | yes |
| `json_number_grammar` | 56 | 12,628 | yes |
| `operation_cas` | 8 | 12,676 | yes |
| `operation_receipt` | 8 | 12,676 | yes |
| `operation_result_digest` | 8 | 12,676 | yes |
| `operation_result_ref` | 8 | 12,676 | yes |
| `operation_schema` | 8 | 12,676 | yes |
| `original_input` | 8 | 12,676 | yes |
| `outcome` | 8 | 12,676 | yes |
| `partition` | 8 | 12,676 | yes |
| `payload_schema` | 40 | 12,644 | yes |
| `permission_or_withdrawal` | 2,154 | 10,530 | yes |
| `phase` | 8 | 12,676 | yes |
| `prior_selector` | 4 | 12,680 | yes |
| `producer_join` | 40 | 12,644 | yes |
| `references_resolve` | 8 | 12,676 | yes |
| `replay_policy` | 8 | 12,676 | yes |
| `request` | 8 | 12,676 | yes |
| `selected_target` | 4 | 12,680 | yes |
| `selector_cas` | 4 | 12,680 | yes |
| `selector_schema` | 4 | 12,680 | yes |
| `selector_scope` | 4 | 12,680 | yes |
| `source` | 8 | 12,676 | yes |
| `target_identity` | 4 | 12,680 | yes |
| `target_manifest` | 4 | 12,680 | yes |
| `target_order` | 4 | 12,680 | yes |
| `target_schema` | 4 | 12,680 | yes |
| `target_source` | 4 | 12,680 | yes |
| `terminal_custody` | 8 | 12,676 | yes |

### archive checker

Corpus: 6,818 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 6,814 | yes |
| `admission` | 100 | 6,718 | yes |
| `boundary_acceptance` | 24 | 6,794 | yes |
| `boundary_payload` | 4 | 6,814 | yes |
| `boundary_receipts` | 72 | 6,746 | yes |
| `boundary_request` | 4 | 6,814 | yes |
| `boundary_scope` | 12 | 6,806 | yes |
| `boundary_snapshot` | 96 | 6,722 | yes |
| `boundary_terminal` | 2 | 6,816 | yes |
| `checkpoint_event` | 4 | 6,814 | yes |
| `checkpoint_key` | 8 | 6,810 | yes |
| `checkpoint_storage` | 8 | 6,810 | yes |
| `commitment_numbers` | 344 | 6,474 | yes |
| `custody_digest` | 824 | 5,994 | yes |
| `custody_flush` | 402 | 6,416 | yes |
| `custody_presence` | 390 | 6,428 | yes |
| `custody_shape` | 398 | 6,420 | yes |
| `cutoff_commitment` | 4 | 6,814 | yes |
| `cutoff_record` | 4 | 6,814 | yes |
| `cutoff_reference` | 4 | 6,814 | yes |
| `cutoff_scope` | 8 | 6,810 | yes |
| `cutoff_unique` | 4 | 6,814 | yes |
| `cutoffs_unavailable` | 328 | 6,490 | yes |
| `effect_once` | 12 | 6,806 | yes |
| `envelope_schema` | 104 | 6,714 | yes |
| `evidence_preserved` | 4 | 6,814 | yes |
| `history_event` | 20 | 6,798 | yes |
| `inline_cap` | 4 | 6,814 | yes |
| `json_number_grammar` | 28 | 6,790 | yes |
| `memory_flags` | 352 | 6,466 | yes |
| `no_extra_memories` | 4 | 6,814 | yes |
| `no_prune_summary` | 2 | 6,816 | yes |
| `operation_cas` | 8 | 6,810 | yes |
| `operation_receipt` | 4 | 6,814 | yes |
| `operation_result_digest` | 4 | 6,814 | yes |
| `operation_result_ref` | 4 | 6,814 | yes |
| `operation_schema` | 8 | 6,810 | yes |
| `original_input` | 4 | 6,814 | yes |
| `originals_preserved` | 4 | 6,814 | yes |
| `outcome` | 4 | 6,814 | yes |
| `partition` | 8 | 6,810 | yes |
| `payload_schema` | 98 | 6,720 | yes |
| `permission_or_withdrawal` | 1,012 | 5,806 | yes |
| `phase` | 4 | 6,814 | yes |
| `pins_preserved` | 4 | 6,814 | yes |
| `references_resolve` | 8 | 6,810 | yes |
| `replay_policy` | 8 | 6,810 | yes |
| `request` | 8 | 6,810 | yes |
| `selected_archived` | 4 | 6,814 | yes |
| `selected_fields_preserved` | 12 | 6,806 | yes |
| `selection_exists` | 4 | 6,814 | yes |
| `selection_kind` | 2 | 6,816 | yes |
| `selection_pinned` | 4 | 6,814 | yes |
| `selection_unique` | 4 | 6,814 | yes |
| `semantic_binding` | 1,994 | 4,824 | yes |
| `source` | 8 | 6,810 | yes |
| `summary_provenance` | 2 | 6,816 | yes |
| `terminal_custody` | 8 | 6,810 | yes |
| `unselected_preserved` | 4 | 6,814 | yes |
| `versions_preserved` | 4 | 6,814 | yes |

## All eleven standing checks

| # | Evidence and limits |
|---|---|
| 1 | All twelve complete writer suites retain fresh/retry replay-only refusals. Historical replay-only positives remain separate. |
| 2 | Project-only editions refuse exact CV-366 Application attempts; no Application writer or bucket is invented. |
| 3 | Encoded project~ positives and raw/foreign/padded partition refusals remain. |
| 4 | Entire payload and separate operation cap checks remain; both existing size-only operation controls keep safe byte lengths and their original encoded sizes. SP-337 remains authoritative. |
| 5 | All original identifier cases are covered by the union of --family runs; full-input/LF guards and registry mirrors remain. |
| 6 | Three caller-only Storage metadata changes per family return the unchanged original; semantic conflicts remain. Independent probes reproduce 36/36. |
| 7 | Generic SP-278 storage/key/event identity joins remain, with actual matching storage UUIDs. Native inclusion is not claimed. |
| 8 | Restoring the lossy parser, truthiness authority or malformed-memory acceptance makes the actual complete checker exit 1 in 28/28 sequential processes, with the expected oracle assertion. |
| 9 | Eager offline walking now includes the inherited lane envelope document and every compatibility branch. Dormant reference mutations still fail. |
| 10 | All original 1,104 complete historical cases and reduced history remain; supported numeric forms add four-mode positives. Current live state/admission/cutoffs do not gate old originals; current access, withdrawal, custody and forgery still do. |
| 11 | Complete table above: own flips, exact complete complements and restoration; no missing-field exemptions, reconstructed inputs or whole-gate replacement. |

## All eleven Astra defect classes

| Item | Own mutation / disposition |
|---|---|
| 1 Forged/contradictory inputs | Independently rehashed foreign event ids refuse in every exact reader; the full earlier foreign/cutoff join corpus remains. |
| 2 Storage metadata from payload | Independent sequence/observed/persisted caller-only changes return the unchanged resolved original in 36/36 probes. Physical receipt authentication remains native. |
| 3 Historical readers both ways | All four modes survive unrelated live state and malformed ignored current admission; typed permission denial/withdrawal and forged/missing originals refuse. |
| 4 One field read two ways | Integer-for-hex payload probes refuse. Typed authority checks and exact decimal ingestion remove the two reported ambiguous interpretations. |
| 5 Dormant refs | Own unvisited payload ref mutations fail offline walking for every family; the new schema's inherited current/compatibility refs resolve eagerly. |
| 6 Partial sizes | Whole-value oversize probes refuse. The two rebuilt size fixtures preserve encoded lengths and target cap-only defects; no hidden oversize inline route is introduced. |
| 7 Custody on every path | Independent missing-start advances for succeeded and failed terminal rows refuse; all earlier full custody matrices remain. |
| 8 Masked negatives | Full guard proof removes exact predicates/declared numeric duplicates. Numeric/history type probes avoid stale or fictitious commitments; post-state flag copies are coherent before evaluation. |
| 9 Inflated grades | Only twelve oracle cells upgrade after all checkers, the whole guard table and restored-defect controls pass. Membership, retention and native limits remain explicit. |
| 10 Numeric spellings | Independent signed safe boundaries, exact large equivalent spellings, 2^60, near-integer fractions, 1.0/1e0/-0 and grammar controls reproduce the repaired result. |
| 11 Types confused | String booleans/numbers, 0/1, null, arrays and objects refuse across writer/boundary/four-mode history, plus every archive flag role. The new type guards have their own flipping negatives. |

## Checks, preservation, resources and remaining work

- **Complete family checkers:** 12/12 exit 0. New domain corpus: {'isolated_negative_cases': 4000, 'numeric_writer_cases': 312, 'numeric_reader_cases': 624, 'numeric_commitment_cases': 396}. All existing family suites remain enabled.
- **Restored defects:** 28/28 complete checker processes exit 1 for their intended assertions (12 numeric, 12 authority, 4 archive-memory).
- **Independent probes:** all twelve families pass; custody, writer Storage metadata, live historical independence, refs, cap, exact types and numeric boundaries are independently exercised.
- **Derived outputs:** shard generate/check and index generate pass; top-level statuses are parsed. Index validate exits 1 / top-level fail with 22 failures, all reproduced by the unmodified retention subcheck on the untouched starting revision's index against current origin/main; no PlanUnit ids changed. It reports the missing baseline DL-302 plus 21 pre-existing legacy ledger-record errors. No failure file was edited by this lane. See index-baseline-equivalence.json; this integration issue remains open. Only the edited owner documents' and registry's shards change; normal index clocks are regenerated. Currentness edition: 15/15 copied files SHA-256 matched before generation.
- **Preservation/scope:** `scope-preservation.json` verifies old states (including every failed_terminal_saved), archive fixtures/contracts, registry non-lane values/profiles, the unchanged cutoff proposal and all original per-family case/identifier coverage. No generic envelope schema, admission/event-family registry, Decision Log, .gitignore, Spec Lock, auto-decisions, generated governance evidence or frozen validator edit.
- **Resources:** sparse local worktree; initial disk 83 GB and RAM 9 GiB available. Every family/guard is sequential and checks the 6 GiB RAM gate. No threshold pause occurred. Setup made read-only inbox/who calls before reading the fix brief; no messages or later mailbox calls followed. No subagent, browser, server, landing or main push.
- **IDs:** no new PlanUnit ids. Edited existing SP-630–639, CV-658–659 and ATS-315; all other AMS/CV/ATS adoption ids and reservations are preserved. New companion schema/fixture ids are `https://puppetmaster.local/schemas/memory_maintenance/event_record.v1.schema.json` and `pm.memory.maintenance.boundary_fixtures.v1`.
- **Remaining:** reconcile the pre-existing current-main/index-retention mismatch at integration; independent review, per-family admission, pending operation/result retention and cited unlanded decision/retention integration, Jared's cutoff choice, native receipt/transaction/flush/crash/backup/GUI/race evidence. The original dedup survivor/disposition question stays open.

## Evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/check11.json` — SHA-256 `0980fbb06a945e7d74c3fbc9f111e94b25f4a4005f03595cb0bd0e41e043768f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/checker-summary.json` — SHA-256 `45fd02e4741c405f22fba34e42ef3ee5b5b895eae5fc38813520556e4b02e6aa`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/independent-probes.json` — SHA-256 `8faf23d47c629d4460d848866be85bbb48069f50aebc3c4ff514188763a2f6a6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/restored-defects.json` — SHA-256 `347de583baba36240adbc3e1b36432e7528fbf1dd3889523ea06939d4176098a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/scope-preservation.json` — SHA-256 `9decc18bc3bc8ea8abce941c9e9258e0760cbfaa10e0137d014bbf121743dc82`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/regrade-validation.json` — SHA-256 `390657dafadd7149a439b033e7116fad861196fe00e3ff93a9987de0f5652111`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/currentness-copy.json` — SHA-256 `bd97b1839000f89f22e7760affc41fc37fb11fb1d07382b3b8e7aa4595f8e8d1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/index-validate.json` — SHA-256 `dfc2d23e60931bb1bbc4c954053981ee1d286f0b12b7db7f94b4ec3aa6f0b143`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/index-baseline-equivalence.json` — SHA-256 `457c201b8dab9d2ae4784d87f61c52b8c99bcd5afd58972c6cba416c58f631a4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/verification-summary.json` — SHA-256 `ea558f0910566aaf7644b0bbf30c4ab8f4d97f3337578dfd06290c872cade965`.

Complete ids and complements are in check11.json; the committed compact table pins their counts, examples and id-list hashes. Final source/checker/evidence files are pinned by evidence-sha256.json. Report and self-grade copies are in the parent drafts/DMEM directory. The worktree is removed after both source and report commits are pushed.

---

Earlier source-pinned reports follow as lineage; the cutoff proposal is unchanged.

# DMEM fix round 6 — technical round 1 of 2

Branch: `plans/ea-w2-memory-maintenance-20261104`. Source head: `a997e62c4bb70ae858e9c7eee78cb8efc6018f94`. Reviewed base: `b50da70b3d7d4e382717c12135ccff26c8230c05`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle5.md`.

This section supersedes earlier worker oracle grades and check-11 claims. **Twelve families prepared without admission**, pending independent review. No cutoff value is selected. The first-start gate, withdrawal fence choice, every `failed_terminal_saved` snapshot, Card 1b application and report-only cutoff proposal below are preserved. Retention remains PARTIAL; membership ABSENT; native execution NOT_RUN.

## Review round 6: findings and responses

- **B1 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_guard_isolation.py:55`, archive fixture `family-rehashed` replacements. **Cause:** foreign starts omitted cutoff/month fields, and the proxy suppressed their required-field failures. **Fix:** derive each replacement from its own valid archive start, keep every own structural field, change the family and all derived family/identity/command/schema copies, and rehash. The proxy now removes only the named duplicate event/command constants. All sixteen complete-writer paths refuse normally, accept with binding plus those constants removed, and refuse after restoration; zero required-field errors are bypassed. Verify `b1-surgical.py` and the complete guard table.
- **B2 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_maintenance_events.py:736`, `Plans/memory_canonical_history_fixtures.json`, both complete checkers. **Cause:** reduced phase-model equality could not admit complete retained EventRecords. **Fix:** the canonical history boundary validates full retained records against a resolved frozen write-time operation, through the same original-start custody rule. It selects the exact 2.0.0 or frozen 1.0.0 envelope-reader schema and accepts valid historical replay policy independently of current writers. All 1,104 cases run through the full checkers: authentic ordinary/replay-only/compatibility/compatibility-replay history survives arbitrary live operation, source, request, selector, counter, admission and cutoff changes; missing custody, malformed envelopes/bodies, forged/rehashed foreign values, access revocation and withdrawal refuse unchanged. Twenty-four independently corrupted positive/negative oracle expectations each exit 1.
- **B3 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_archive_events.py:93`, SP-638/SP-639/CV-658/CV-659. **Cause:** the resolver lookup key was never joined to its returned record's own ref. **Fix:** lookup key = resolved self-ref = frozen operation ref, with no duplicate alias record; recomputed content hash and scope/job/Project agree with the operation and copied payloads. Each of four coherently rehashed contradictions first passes operation and original-start controls, then refuses the full settle entry point. Four duplicate-reference negatives independently refuse. Missing cutoffs still keep every current route unavailable under DL-403. No cutoff values are chosen.
- **Finding 4 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_archive_events.py:138`. **Cause:** evidence/version and archived checks omitted the rest of a selected original. **Fix:** `selected_fields_preserved`, together with the independent evidence/version guards, compares the entire original except its permitted archived change. Twelve isolated kind/pinned/extra-field rewrites refuse; each flips only when its own preservation guard is removed.
- **Finding 5 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** ATS-315/ATS-316. **Cause:** an old hold sentence contradicted the four conditional payload definitions. **Fix:** route those families to ATS-316 and state their remaining admission, operation/result-retention and cutoff activation holds explicitly.
- **Finding 6 / Astra item 10 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_maintenance_events.py:56` and all twelve oracles. **Cause:** compact JSON spelled equal integer-valued numbers differently. **Fix:** every synthetic hash recipe recursively canonicalizes mathematical integers; `1`, `1.0`, parsed `1e0` hash as `1`, and `-0` as `0`. Fractional/nonfinite numbers are refused and `01` fails JSON parsing. Sixty current-writer spelling probes and per-family historical spelling/forged-commitment cases run in the complete checkers. The number-rejection guard has its own removal row; no numeric payload or cutoff is invented.

No finding is disputed or stopped for a new Jared decision.

## Family grades before and after

Before is the independent cycle-5 review. P/Q/A = PASS/PARTIAL/ABSENT; only each family's oracle cell changes PARTIAL → PASS. These are static preparation grades.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.started` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.completed` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Totals: **108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 480 self-grade/disposition citations are exact and re-located at the source head.

## Complete guard table

**111 rows; 15,502 negative cases; 842,854 row/case evaluations.** Each case has an intact positive control. For each row, remove only its named predicate or explicit duplicate set, execute the complete checker corpus, require every own negative to pass and every other negative to preserve its exact refusal, restore, and recheck the own negatives. No required-field check is suppressed, and no input, receipt, hash, copy or post-state is repaired during evaluation.

The archive `semantic_binding` duplicate set is: caller envelope/payload semantic joins, retained-value binding, and only the repeated event_type/command_id constants at the start-custody payload-schema boundary. Required fields, shape, digest, full flush, cutoff, phase, access, withdrawal and replay restrictions stay enabled. Replay-policy removal also removes its repeated semantic equality; outcome removal also removes the matching schema status enum; envelope-schema removal covers the selected current or frozen compatibility schema. Other repeated sites implement the same named invariant. `DMEM-check11-guards.json` names these sites and pins the full ids/complements.

Presence and withdrawal witnesses use the actual common custody gate, with no fabricated absent bytes. All other custody and canonical-history witnesses execute their complete model entry point. Schema, size, reference and unsupported-number witnesses use their actual predicate endpoints. Physical custody/authentication, atomicity and races remain native NOT_RUN.

### maintenance checker

Corpus: 10,252 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 10,244 | yes |
| `admission` | 16 | 10,236 | yes |
| `artifacts` | 4 | 10,248 | yes |
| `boundary_acceptance` | 4 | 10,248 | yes |
| `boundary_payload` | 8 | 10,244 | yes |
| `boundary_receipts` | 12 | 10,240 | yes |
| `boundary_request` | 8 | 10,244 | yes |
| `boundary_scope` | 24 | 10,228 | yes |
| `boundary_snapshot` | 16 | 10,236 | yes |
| `boundary_terminal` | 4 | 10,248 | yes |
| `checkpoint_event` | 8 | 10,244 | yes |
| `checkpoint_key` | 8 | 10,244 | yes |
| `checkpoint_storage` | 8 | 10,244 | yes |
| `commitment_numbers` | 24 | 10,228 | yes |
| `custody_binding` | 4,726 | 5,526 | yes |
| `custody_digest` | 1,054 | 9,198 | yes |
| `custody_flush` | 958 | 9,294 | yes |
| `custody_presence` | 934 | 9,318 | yes |
| `custody_shape` | 958 | 9,294 | yes |
| `effect_count` | 4 | 10,248 | yes |
| `effect_once` | 16 | 10,236 | yes |
| `envelope_schema` | 40 | 10,212 | yes |
| `history_event` | 40 | 10,212 | yes |
| `inline_cap` | 8 | 10,244 | yes |
| `json_number_grammar` | 32 | 10,220 | yes |
| `operation_cas` | 8 | 10,244 | yes |
| `operation_receipt` | 8 | 10,244 | yes |
| `operation_result_digest` | 8 | 10,244 | yes |
| `operation_result_ref` | 8 | 10,244 | yes |
| `operation_schema` | 8 | 10,244 | yes |
| `original_input` | 8 | 10,244 | yes |
| `outcome` | 8 | 10,244 | yes |
| `partition` | 8 | 10,244 | yes |
| `payload_schema` | 40 | 10,212 | yes |
| `permission_or_withdrawal` | 1,098 | 9,154 | yes |
| `phase` | 8 | 10,244 | yes |
| `prior_selector` | 4 | 10,248 | yes |
| `producer_join` | 40 | 10,212 | yes |
| `references_resolve` | 8 | 10,244 | yes |
| `replay_policy` | 8 | 10,244 | yes |
| `request` | 8 | 10,244 | yes |
| `selected_target` | 4 | 10,248 | yes |
| `selector_cas` | 4 | 10,248 | yes |
| `selector_schema` | 4 | 10,248 | yes |
| `selector_scope` | 4 | 10,248 | yes |
| `source` | 8 | 10,244 | yes |
| `target_identity` | 4 | 10,248 | yes |
| `target_manifest` | 4 | 10,248 | yes |
| `target_order` | 4 | 10,248 | yes |
| `target_schema` | 4 | 10,248 | yes |
| `target_source` | 4 | 10,248 | yes |
| `terminal_custody` | 8 | 10,244 | yes |

### archive checker

Corpus: 5,250 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 5,246 | yes |
| `admission` | 12 | 5,238 | yes |
| `boundary_acceptance` | 2 | 5,248 | yes |
| `boundary_payload` | 4 | 5,246 | yes |
| `boundary_receipts` | 6 | 5,244 | yes |
| `boundary_request` | 4 | 5,246 | yes |
| `boundary_scope` | 12 | 5,238 | yes |
| `boundary_snapshot` | 8 | 5,242 | yes |
| `boundary_terminal` | 2 | 5,248 | yes |
| `checkpoint_event` | 4 | 5,246 | yes |
| `checkpoint_key` | 8 | 5,242 | yes |
| `checkpoint_storage` | 8 | 5,242 | yes |
| `commitment_numbers` | 12 | 5,238 | yes |
| `custody_digest` | 824 | 4,426 | yes |
| `custody_flush` | 402 | 4,848 | yes |
| `custody_presence` | 390 | 4,860 | yes |
| `custody_shape` | 398 | 4,852 | yes |
| `cutoff_commitment` | 4 | 5,246 | yes |
| `cutoff_record` | 4 | 5,246 | yes |
| `cutoff_reference` | 4 | 5,246 | yes |
| `cutoff_scope` | 8 | 5,242 | yes |
| `cutoff_unique` | 4 | 5,246 | yes |
| `cutoffs_unavailable` | 328 | 4,922 | yes |
| `effect_once` | 12 | 5,238 | yes |
| `envelope_schema` | 24 | 5,226 | yes |
| `evidence_preserved` | 4 | 5,246 | yes |
| `history_event` | 20 | 5,230 | yes |
| `inline_cap` | 4 | 5,246 | yes |
| `json_number_grammar` | 16 | 5,234 | yes |
| `no_extra_memories` | 4 | 5,246 | yes |
| `no_prune_summary` | 2 | 5,248 | yes |
| `operation_cas` | 8 | 5,242 | yes |
| `operation_receipt` | 4 | 5,246 | yes |
| `operation_result_digest` | 4 | 5,246 | yes |
| `operation_result_ref` | 4 | 5,246 | yes |
| `operation_schema` | 8 | 5,242 | yes |
| `original_input` | 4 | 5,246 | yes |
| `originals_preserved` | 4 | 5,246 | yes |
| `outcome` | 4 | 5,246 | yes |
| `partition` | 8 | 5,242 | yes |
| `payload_schema` | 98 | 5,152 | yes |
| `permission_or_withdrawal` | 484 | 4,766 | yes |
| `phase` | 4 | 5,246 | yes |
| `pins_preserved` | 4 | 5,246 | yes |
| `references_resolve` | 8 | 5,242 | yes |
| `replay_policy` | 8 | 5,242 | yes |
| `request` | 8 | 5,242 | yes |
| `selected_archived` | 4 | 5,246 | yes |
| `selected_fields_preserved` | 12 | 5,238 | yes |
| `selection_exists` | 4 | 5,246 | yes |
| `selection_kind` | 2 | 5,248 | yes |
| `selection_pinned` | 4 | 5,246 | yes |
| `selection_unique` | 4 | 5,246 | yes |
| `semantic_binding` | 1,994 | 3,256 | yes |
| `source` | 8 | 5,242 | yes |
| `summary_provenance` | 2 | 5,248 | yes |
| `terminal_custody` | 8 | 5,242 | yes |
| `unselected_preserved` | 4 | 5,246 | yes |
| `versions_preserved` | 4 | 5,246 | yes |

## All eleven standing checks

| Check | Static evidence and limit |
|---|---|
| 1 Replay | Every family retains fresh/retry replay-only writer refusals. Historical replay-only acceptance is a separate reader boundary. |
| 2 Application keys | Project-only editions refuse exact CV-366 Application attempts; no Application writer or invented bucket. |
| 3 Partitions | Encoded `project~` positives; raw, foreign and padded partitions refuse. |
| 4 Size | All twelve complete payload bounds are 2,734–5,002 MessagePack bytes; oversized whole payloads and separate operation values refuse. SP-337 remains the route for separately declared larger bodies. |
| 5 LF | Existing exact-length/full-input schema guards and per-family LF negatives remain; no schema or registry mirror is weakened. |
| 6 Retry | Thirty-six independent caller-only sequence/observed/persisted changes return the unmodified retained source; semantic changes conflict. Source-record authenticity remains native NOT_RUN. |
| 7 Checkpoints | Actual fixture storage UUIDs join positively; foreign storage/key/event identity refuses. No native inclusion/cursor proof is claimed. |
| 8 Failure exits | Twenty-four positive/negative canonical-history expectation mutations and twelve dormant-operation schema mutations exit 1. In-process events have no subprocess-success payload field. |
| 9 Refs | Eager offline resolution includes every schema branch, frozen compatibility definition and own registry mirrors. Twelve complete-process dormant mutations refuse. |
| 10 History | 1,104 full-record cases across all twelve families plus preserved reduced-model history; compatibility and live-state independence pass, forged/foreign/withdrawn cases refuse. |
| 11 Isolation | The complete table above passes; B1's sixteen cases independently pass the surgical witness without required-field suppression. |

## All ten Astra defect classes

The separate own-mutation audit has 316 observations across every exact family; the full checker/table supplies the wider corpus. This is static evidence, not physical Storage authentication.

| Class | Probe and disposition |
|---|---|
| 1 Forged/contradictory inputs | Rehashed forged event identities refuse per family. B3 self-ref and duplicate-ref mutations refuse at full entry points with intact operation and custody controls. |
| 2 Payload-supplied Storage metadata | Change only caller sequence/timestamps; the exact unmodified resolved source is returned in 36/36 probes. The model does not authenticate physical receipts. |
| 3 Historical readers | Ordinary, replay-only and both compatibility modes survive unrelated live state. Each mode also rejects forged/foreign/withdrawn values and missing start custody. |
| 4 One field read two ways | Integer-for-hex, uppercase, whitespace and trailing LF are refused. Numeric spelling is separately normalized below. |
| 5 Dormant refs | Per-family operation branches with unvisited dangling refs fail the eager walk and all twelve complete processes exit 1. |
| 6 Partial sizes / inline prose | Measure the whole encoded payload and separate operation value. Bounds remain below 16 KiB; no payload_ref-null rule is replaced or contradicted. |
| 7 Custody on every path | Preserved twelve-family matrices cover phases, retries, replay, recovery and writers; new full canonical history uses the same gate. Direct succeeded/failed terminal advances with missing starts refuse. |
| 8 Masked negatives | Whole-corpus removal/restoration and the surgical B1 witness pass. The table caught and repaired an initially masked new foreign-read fixture by supplying its intact lookup record; no guard was weakened. Producer/actor binding is factored separately from general custody binding. Canonical-reader probe ids are namespaced from the existing archive corpus, and duplicate ids fail before evaluation. |
| 9 Inflated grades | Oracle upgrades use executed full-reader, guard and failure-exit evidence; membership/retention/native limitations remain explicit. |
| 10 Numeric spellings | Nested digest recipes and current writer/history probes cover 1, 1.0, 1e0, -0 and invalid 01. Equal values commit once; spelling-sensitive forged hashes, fractional and nonfinite numbers refuse. |

## Checks, preservation and remaining boundaries

| Command / audit | Exit / result |
|---|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 / pass, all prior suites plus 736 canonical-history and 40 numeric-writer cases |
| `python3 scripts/pm_memory_archive_events.py` | 0 / pass, all prior suites plus 368 canonical-history, 20 numeric-writer cases and new cutoff/preservation cases |
| `python3 scripts/pm_memory_guard_isolation.py --out <external-path>` | 0 / complete table above |
| Surgical B1 audit | 0 / 16 baseline refusals, 16 binding/const-only flips, 16 restored refusals |
| Full-checker positive/negative expectation mutations | 0 audit / 24 processes exit 1 |
| Full-checker dormant-operation mutations | 0 audit / 12 processes exit 1 |
| Own Astra-class mutations | 0 / 316 observations pass |
| Shared codec unit suite | 0 / 14 tests pass |
| Shard generate/check; index generate/validate | 0 / every top-level status pass; failures empty |
| Currentness input copy | 15/15 SHA-256 matches before index generation |
| Scope/preservation audit | 0 / 50 assertions; all older states, traces, writers, schemas, contracts and registry rows preserved |

Only the three edited owner documents have regenerated shards; index outputs are regenerated normally, including generated clocks. No admission, registry append, Decision Log edit, .gitignore, tests edit, Spec Lock, auto-decisions, governance reseal or main push. No mail, subagent, browser or server. No new consumer, command, checkpoint, scope or retention binding.

**IDs:** no new ids. Edited existing SP-638, SP-639, CV-658, CV-659, ATS-315 and ATS-316. Existing AMS-100–107, SP-630–637 and CV-650–657 remain owner/adoption references. Unused reservations stay unused.

**Remaining:** independent review; per-family admission; operation/result and other pending retention; the existing unlanded decision/retention dependencies; Jared's cutoff choice; native receipt/transaction/flush/crash/backup/GUI/race proof. The DL-403 jobs remain unavailable. The original eight's separate survivor/disposition question is not answered.

## Evidence

- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/check11.json` — SHA-256 `9e1ad6df7b81a5f8593dcec670e2f8442f521f2ff827b4c09d6115d805b579c2`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/b1-surgical.json` — SHA-256 `89707f09075174b377d45126e178a2eb5af170b0156a2cf158928a4c0455967d`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/astra-classes.json` — SHA-256 `108e10f78a173d9cd224d8b52250e2186ee491471d9ebc3058375748b24e57c2`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/full-checker-oracles.json` — SHA-256 `0c7e1ce64412f02733956bcdb1a27a3b5bcb0acc003f8e0cece4da6174a30dcb`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/dormant-full-process.json` — SHA-256 `049198decfb6d0d4d5197ade311d430c88d678d8d54dafea4ebaa5861a70ac32`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/maintenance.json` — SHA-256 `589792505044e78e34954e907760ccf4096a8f76b3715dc45cad1e5fe6e9d3ac`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/archive.json` — SHA-256 `655b5538028ab8f3c045bebe462d4fb6fc07f0c4bbb00d5b2f7909fb5c31decb`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/scope-audit.json` — SHA-256 `7c9b4f88de4e259cb8c25e43eb32cd4c64d5b21870d343e27a77cfa1c1058679`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/regrade-validation.json` — SHA-256 `2b84115d16a8d8705ec728d86a2a06f8c114d0a46154f6b2718c9027c6189a2b`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/checked-inputs.json` — SHA-256 `d02ec3fa4d3376c394632009bd96669daf5f3eeedb1cf8a43ba3e844b2c2799c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/index-validate.json` — SHA-256 `b4b21bdb80f52bd611baad2179763184c85d7d6ee329e9c1d3e550661eb3553c`.

Audit scripts and remaining command outputs are pinned by `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/evidence-sha256.json`, SHA-256 `7f8aeb3c61439960289399a9931164bd658a9b53e201dae2b145e0c9fb8b3479`.

Report/self-grade copies are in `drafts/DMEM/`. The task worktree is removed after the branch and final report are pushed.

---

Earlier source-pinned reports follow as lineage; their cutoff proposal is unchanged.

# DMEM fix round 5 — standing check 11

Branch: `plans/ea-w2-memory-maintenance-20261104`. Source head: `5e1512a7da88d62a760e00f51d86cfbf637efa67`. Base: `bc4f6fef9f1d90bd469824b16eb863e7f19281b5`. Review: Sol cycle 4 at `dc4c46c58c7462f288684a6e672febdf134e3c89`.

This section supersedes the earlier worker check-11 claims and oracle grades below. It repairs B3 across the original eight families and extends the same proof to all four Card 1b families. All other review dispositions hold. The withdrawal fence, every `failed_terminal_saved` snapshot and the cutoff proposal are preserved.

## Review round 5: findings and responses

**B3 — fixed in `5e1512a7da88d62a760e00f51d86cfbf637efa67`. Where:** `Plans/memory_maintenance_event_fixtures.json:86846`, `Plans/memory_archive_event_fixtures.json:10016`, `scripts/pm_memory_maintenance_events.py:448`, and `scripts/pm_memory_guard_isolation.py:524`. **Cause:** one changed retained operation/body left an old commitment, so value binding and integrity failed independently. The Card 1b matrix also held the same compound prototype. **Fix:** start from an intact record, change one semantic value, update every affected operation identity/correlation/envelope copy, and recompute its commitment. Source, operation, storage identity, foreign started family and frozen time now have coherent retained records. A digest negative changes only its digest. The foreign-family witness uses a complete schema-valid start rather than an incomplete terminal body. Standalone changed-start-value retries now carry a fresh digest. Checkpoint storage negatives now keep an intact valid retained checkpoint and rebind the foreign operation, event identities, result commitments and lookup key coherently; key-only negatives use a valid foreign UUID key. ATS-315 describes the repaired inputs and executable proof.

**Verification:** the reviewer’s own terminal-advance witness now accepts in 8/8 families when only value binding is removed, refuses in 8/8 when only digest is removed, and refuses with both enabled. All twelve deliberately restored compound negatives are detected by the isolation oracle. The 400 earlier-finding probes still pass. Equivalent predicate factoring preserves all six original model suites and all 224 boundary outcomes against the pre-fix checker; schemas, contracts, registry rows, states and the withdrawal owner text are unchanged.

**Cycle-4 note 2 — accounted for. Where:** the four index JSON outputs with `generated_at_utc`. **Cause:** the existing generator writes the clock. **Handling:** normal regeneration is committed, including its timestamp changes; no all-byte-equality or hash-restamping claim. Only the edited Automated Testing owner has changed shards.

## Family grades at this source head

P/Q/A = PASS / PARTIAL / ABSENT. The first eight “before” grades are the independent cycle-4 verdict. The four Card 1b “before” grades are the existing worker grades, which had no independent cycle-4 verdict. Their oracle cells remain PASS after obtaining the new granular proof. Membership stays ABSENT, retention PARTIAL, native execution NOT_RUN. No admission or cutoff is selected.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 (review) | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 (review) | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 (review) | 10/1/1 |
| `memory.monthly_summary.completed` | 10/1/1 (worker) | 10/1/1 |
| `memory.monthly_summary.started` | 10/1/1 (worker) | 10/1/1 |
| `memory.prune_archive.completed` | 10/1/1 (worker) | 10/1/1 |
| `memory.prune_archive.started` | 10/1/1 (worker) | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 (review) | 10/1/1 |

Totals: **112 PASS / 20 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 416 source quotations were located again and checked at the source head.

## Guard-removal proof

**13,062 custody matrix cells; 14,534 negatives in the combined checker corpora.** Every negative has an intact positive control. Each row removes only its named logical predicate across repeated sites, executes the entire corpus for that checker, requires its own negatives to accept, requires every other negative to retain its exact refusal, and restores the predicate. The table records 104 guard removals and 746,356 mutation/case evaluations.

Integrity, full flush, closed record fields, absence and semantic-value binding remain separate. In the archive checker, `semantic_binding` names the equivalent caller/retained producer and payload comparisons; the same full semantic value is checked at admission, retained custody and retry. These repeated value comparisons are removed together while digest, flush, shape, schema, replay, permission, cutoff, phase and CAS checks remain enabled. Normal refusal codes are preserved. The old whole-start-gate no-op was removed from the archive audit.

Missing-byte and withdrawal probes call the actual shared custody gate: a reader cannot return absent bytes, and the audit fabricates none. The other custody probes use the complete phase, canonical writer, boundary or history entry point. Schema and primitive witnesses call their actual predicate endpoints. This proves the static contract model; physical custody and atomicity remain native NOT_RUN.

“Flip” and “stay” below are counts of exact case ids. The full lists for every row, including every complement and restoration result, are in the SHA-pinned external `check11.json`; the compact committed `DMEM-check11-guards.json` records examples and list hashes.

### maintenance checker

Corpus: 9,620 negatives.

| Guard removed | Negatives that flip | Negatives that stay rejected |
|---|---:|---:|
| `action` | 8 | 9,612 |
| `admission` | 16 | 9,604 |
| `artifacts` | 4 | 9,616 |
| `boundary_acceptance` | 4 | 9,616 |
| `boundary_payload` | 8 | 9,612 |
| `boundary_receipts` | 12 | 9,608 |
| `boundary_request` | 8 | 9,612 |
| `boundary_scope` | 24 | 9,596 |
| `boundary_snapshot` | 16 | 9,604 |
| `boundary_terminal` | 4 | 9,616 |
| `checkpoint_event` | 8 | 9,612 |
| `checkpoint_key` | 8 | 9,612 |
| `checkpoint_storage` | 8 | 9,612 |
| `custody_binding` | 4,630 | 4,990 |
| `custody_digest` | 926 | 8,694 |
| `custody_flush` | 926 | 8,694 |
| `custody_presence` | 902 | 8,718 |
| `custody_shape` | 926 | 8,694 |
| `effect_count` | 4 | 9,616 |
| `effect_once` | 16 | 9,604 |
| `envelope_schema` | 8 | 9,612 |
| `history_event` | 8 | 9,612 |
| `inline_cap` | 8 | 9,612 |
| `operation_cas` | 8 | 9,612 |
| `operation_receipt` | 8 | 9,612 |
| `operation_result_digest` | 8 | 9,612 |
| `operation_result_ref` | 8 | 9,612 |
| `operation_schema` | 8 | 9,612 |
| `original_input` | 8 | 9,612 |
| `outcome` | 8 | 9,612 |
| `partition` | 8 | 9,612 |
| `payload_schema` | 8 | 9,612 |
| `permission_or_withdrawal` | 970 | 8,650 |
| `phase` | 8 | 9,612 |
| `prior_selector` | 4 | 9,616 |
| `producer_join` | 8 | 9,612 |
| `references_resolve` | 8 | 9,612 |
| `replay_policy` | 8 | 9,612 |
| `request` | 8 | 9,612 |
| `selected_target` | 4 | 9,616 |
| `selector_cas` | 4 | 9,616 |
| `selector_schema` | 4 | 9,616 |
| `selector_scope` | 4 | 9,616 |
| `source` | 8 | 9,612 |
| `target_identity` | 4 | 9,616 |
| `target_manifest` | 4 | 9,616 |
| `target_order` | 4 | 9,616 |
| `target_schema` | 4 | 9,616 |
| `target_source` | 4 | 9,616 |
| `terminal_custody` | 8 | 9,612 |

### archive checker

Corpus: 4,914 negatives.

| Guard removed | Negatives that flip | Negatives that stay rejected |
|---|---:|---:|
| `action` | 4 | 4,910 |
| `admission` | 12 | 4,902 |
| `boundary_acceptance` | 2 | 4,912 |
| `boundary_payload` | 4 | 4,910 |
| `boundary_receipts` | 6 | 4,908 |
| `boundary_request` | 4 | 4,910 |
| `boundary_scope` | 12 | 4,902 |
| `boundary_snapshot` | 8 | 4,906 |
| `boundary_terminal` | 2 | 4,912 |
| `checkpoint_event` | 4 | 4,910 |
| `checkpoint_key` | 8 | 4,906 |
| `checkpoint_storage` | 8 | 4,906 |
| `custody_digest` | 760 | 4,154 |
| `custody_flush` | 386 | 4,528 |
| `custody_presence` | 374 | 4,540 |
| `custody_shape` | 382 | 4,532 |
| `cutoff_commitment` | 4 | 4,910 |
| `cutoff_record` | 4 | 4,910 |
| `cutoff_scope` | 8 | 4,906 |
| `cutoffs_unavailable` | 328 | 4,586 |
| `effect_once` | 12 | 4,902 |
| `envelope_schema` | 8 | 4,906 |
| `evidence_preserved` | 4 | 4,910 |
| `history_event` | 4 | 4,910 |
| `inline_cap` | 4 | 4,910 |
| `no_extra_memories` | 4 | 4,910 |
| `no_prune_summary` | 2 | 4,912 |
| `operation_cas` | 8 | 4,906 |
| `operation_receipt` | 4 | 4,910 |
| `operation_result_digest` | 4 | 4,910 |
| `operation_result_ref` | 4 | 4,910 |
| `operation_schema` | 8 | 4,906 |
| `original_input` | 4 | 4,910 |
| `originals_preserved` | 4 | 4,910 |
| `outcome` | 4 | 4,910 |
| `partition` | 8 | 4,906 |
| `payload_schema` | 82 | 4,832 |
| `permission_or_withdrawal` | 420 | 4,494 |
| `phase` | 4 | 4,910 |
| `pins_preserved` | 4 | 4,910 |
| `references_resolve` | 8 | 4,906 |
| `replay_policy` | 8 | 4,906 |
| `request` | 8 | 4,906 |
| `selected_archived` | 4 | 4,910 |
| `selection_exists` | 4 | 4,910 |
| `selection_kind` | 2 | 4,912 |
| `selection_pinned` | 4 | 4,910 |
| `selection_unique` | 4 | 4,910 |
| `semantic_binding` | 1,930 | 2,984 |
| `source` | 8 | 4,906 |
| `summary_provenance` | 2 | 4,912 |
| `terminal_custody` | 8 | 4,906 |
| `unselected_preserved` | 4 | 4,910 |
| `versions_preserved` | 4 | 4,910 |

## Checks and preserved boundaries

| Check | Exit / result |
|---|---|
| `python3 scripts/pm_memory_guard_isolation.py --out <evidence-path>` | 0 / pass; complete table above |
| `python3 scripts/pm_memory_maintenance_events.py` | 0 / pass; all existing eight-family oracles |
| `python3 scripts/pm_memory_archive_events.py` | 0 / pass; four-family archive/cutoff/reader oracles and granular guard corpus |
| Cycle-4 reviewer isolation witness | 0 / binding alone flips 8/8; digest alone flips 0/8; failed snapshots still exactly reachable |
| Prior findings | 0 / 400 of 400 pass |
| Restored compound controls | 0 audit / all 12 defective coverage claims detected |
| Pre-fix/new checker equivalence | 0 / six full model suites and 224 boundaries equal |
| Shard generate/check; index generate/validate | 0 / every parsed top-level status is pass; no failures |
| Currentness edition | 15 of 15 SHA-256 matches before generation |
| Regrade | 0 / every quotation exact, at most 200 characters |

**Scope:** fixtures, equivalent named predicates, executable isolation audit, ATS-315, its generated shards/index and this report/self-grade. No schema, contract, registry, admission, Decision Log, cutoff, withdrawal protocol, storage owner, test file, Spec Lock, governance evidence or auto-decision is changed. No main push or landing. No new consumer/identity/checkpoint binding. The branch remains prepared without admission. Retention, native proof, the pending cutoff choice and independent review remain open as before.

**IDs used:** no new PlanUnit ids. Existing `ATS-315` is updated; `ATS-316`, `AMS-100–107`, `SP-630–639`, and `CV-650–659` remain the existing twelve-family owner/adoption ids.

## Evidence

Raw evidence: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5`. Manifest: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/evidence-sha256.json`, SHA-256 `26d92413b374185c7e96562dd1b555cc7dc2823a0f7ba4da39b14c7cb0e3ac48`.

- Complete guard ids/complements: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/check11.json`, SHA-256 `b4bda65b2464b301eb5c24e241f991dcfdb86cb85e6236d7ac77d50bb83a191d`.
- Prior findings: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/prior-findings.json`, SHA-256 `33c7b31e763174c9d0f02acd8a8b45af6c1629457b4a302c56627fb6e8edb693`.
- Reviewer witness: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/isolation-witness.json`, SHA-256 `85d8ebf9d3392d758ee73459acd57597e29131b3ad606da06990f9c380c84e5a`.
- Equivalence: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/equivalence.json`, SHA-256 `332f188ca468eb6f5f623bf21d18987c9c0bd7cdefb4e91bf7f9686e00b6f2a3`.
- Restored compound controls: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/compound-controls.json`, SHA-256 `632e149ed9e307f206a577c305244d741722ea517ba3561044650d4b158e6076`.

Report and self-grade copies are in the parent `drafts/DMEM/` directory. The task worktree is removed after the final report push.

---

The earlier source-pinned report follows as lineage. Its cutoff proposal is unchanged.

# DMEM fix round 4 — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head: `e850f298670855b745b0cfe6ee75acd3cf3518f8`. Reviewed head: `009027140a5c3ecab7df7d22214b78a92b7a4ae8` (Astra round 2). Gate redesign: `74995bb921`. Standing check 9: `e850f29867`. This report and the self-grade are a report-only follow-up; the source pin is exact. Earlier reports remain in Git history.

The program lead allowed one extra round: redesign the start-custody gate that failed three times (Astra round 1 B3, Sol cycle 3 B4, Astra round 2 B1) and fix Astra round 2 B2. Nothing else was changed.

## Outcome and family grades

**Worker result: 8/8 prepared**, up from Astra round 2's 0/8, pending independent review. Only the eight `positive_negative_oracles` cells change (PARTIAL → PASS). Membership stays ABSENT and retention PARTIAL. Native execution stays NOT_RUN. The four monthly-summary and prune/archive families stay held and ungraded; their contract rows are byte-identical.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---|---|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Prepared totals move from **72 PASS / 16 PARTIAL / 8 ABSENT** to **80 PASS / 8 PARTIAL / 8 ABSENT**. Including the four preserved held rows, the file holds 84 / 16 / 44. All 392 citations were re-pinned to the source head; every quote is an exact substring of at most 200 characters.

## The start custody gate (one rule)

**Rule.** Every path of a memory-maintenance operation after first start admission must resolve and verify the exact original start record before it appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original. Paths covered: start-append retry, start-row advance, effect/prepare/swap/settle, terminal append, the effect_committed → completed advance, retry and replay of either original, recovery from every phase, canonical writer append/retry, boundary acceptance and the history reader. The start record is the SP-286/CV-339 retained full-value original of `memory.<op>.started@1.0.0` under the operation's canonical key, read through `resolve_full_value.v1`. Five things are verified:

- **Identity.** `event_id`/`idempotency_key` recompute from the started family's recipe.
- **Digest.** The full-value commitment recomputes.
- **Operation.** Correlation and payload fields equal the operation row.
- **Phase.** The event type is exactly the started type, and the row is `accepted` only before the receipt.
- **Receipt.** It is settled under full flush. The row's `started_event_id` and every later original's causation and `started_event_id` name exactly this record.

There must also be no withdrawal fence on either edition. Missing, corrupted, mismatched or withdrawn custody refuses with `start_receipt_missing` (or `permission_or_withdrawal` under a fence), with no append, CAS, effect or output. The operation stays at its last durable phase and is never reissued. The gate is checked on the prior durable state and again on the tentative result immediately before commit. A path that skips an earlier check, or a path added later, therefore still cannot complete without it. The only relaxation is the started family's first append from an accepted row with no receipt and no later original. Even then a record that is present is verified, and the append must leave a verified record.

**Where it is written.** Each family's own storage unit carries its own "Start custody gate for exactly <family>@1.0.0" paragraph, citing SP-286, CV-339 and its own AMS/CV/SP units (SP-630–SP-637, `Plans/storage-plan.md`). Each writer-boundary paragraph's old patched custody sentence now points to it. The checker asserts each paragraph and its citations exist.

**How it is enforced.**

- **Checker.** `scripts/pm_memory_maintenance_events.py` has one `start_custody_gate`. Every earlier custody check calls it, and it is evaluated again at the commit point of `transition` (all ops except `crash`, which only drops volatile state), `append_current`, `accept` and the new `read_history`.
- **Schemas.** The closed operation schemas already require an exact-format `started_event_id` in every phase after `accepted`, and every completed payload requires it. Round 4 adds null, foreign-identity and trailing-LF start-receipt cases for every later phase of all four operation definitions (42 cases).
- **Cross-document equality.** The retained record's equality with the row cannot be expressed in JSON Schema, so the gate carries it.

## Negative matrix

`start_custody_matrix` in `Plans/memory_maintenance_event_fixtures.json` is fixture-declared. Expected outcomes were written from the rule above, not taken from checker output. **938 paths, each run first as a positive control against its authored after-state and output. 9,248 negative cells. All 9,248 refuse exactly, with unchanged state and no output.**

| Model | Paths | Negative cells | What the paths are |
|---|---:|---:|---|
| Phase model (`transition`) | 616 | 6,088 | Every positive non-crash step of every unedited trace, plus retry and replay of every retained original, recovery from every phase, and both terminal advances (succeeded and failed). Ops covered: append_started, advance_started, prepare, swap, settle, append_completed, advance_completed, retry, replay, recover. |
| Canonical writer (`append_current`) | 76 | 812 | Every positive append/retry step. Started families add retries at started, completed and failed_completed. |
| History reader (`read_history`) | 200 | 2,000 | A read of every retained original in every state. |
| Boundary (`accept`) | 46 | 348 | Every positive boundary case, plus new positives at every later phase. |

**Defect kinds** (each applied to the reduced start record, and separately to the started writer's own canonical start):

- missing
- digest zeroed
- value changed without rehash
- other operation, rehashed
- foreign storage identity, rehashed
- wrong event type, rehashed
- changed payload (frozen time), rehashed
- unflushed receipt
- extra record field
- withdrawal fence

**Expected refusal.** `start_receipt_missing`. The one exception is retry/replay of the started event in the phase model, whose own requested-original check already reports `original_missing` first. A withdrawal fence gives `permission_or_withdrawal`, and the boundary gives `false`. Absence is skipped only for first start admission.

**Per family:**

| Family | Paths | Cells |
|---|---:|---:|
| dedup completed | 96 | 951 |
| dedup started | 98 | 956 |
| lexical completed | 136 | 1,351 |
| lexical started | 139 | 1,366 |
| semantic completed | 136 | 1,351 |
| semantic started | 139 | 1,366 |
| verification completed | 96 | 951 |
| verification started | 98 | 956 |

The checker also requires that each family covers every op, every lawful phase in the phase and reader models, and the writer phases, and that its declared cell count matches.

## Review round 4: findings and responses

### Astra round 2 B1 — fixed (`74995bb921`)

**Where:** `transition(op="advance_completed")` in the checker; SP-630–637.
**Cause:** the effect_committed → completed advance checked terminal custody and CAS but not the start record. Each earlier fix (Astra 1 B3 in `accept`, Sol cycle 3 B4 in `append_current`) patched one path and left this one open.
**Fix:** the one gate above, checked at the commit point of every path, plus an explicit call in `advance_completed`. The new `failed_terminal_saved` state adds the failed-outcome advance.
**Verify:**

- Astra's 64 invalid advances (4 defects × 2 outcomes × 8 families) all refuse `start_receipt_missing` with unchanged state; the 16 intact controls advance (`prior-findings.json`, `astra2-B1`).
- Astra's own harness, rerun at this head, reports `invalid_start_advances_accepted: 0` (was 64).
- Astra's added negative trace now passes the full checker (`custody-negative`).
- Restoring the defect (removing the gate from `advance_completed` and the commit point) makes the full checker exit 1 (`restored/astra2-B1-terminal-advance.py`).

### Astra round 2 B2 — fixed (`e850f29867`)

**Where:** `validator()` and `main()` in the checker.
**Cause:** `check_schema` checks syntax only, and instance validation resolves only the references a fixture reaches. Definitions were also validated outside their own document.
**Fix:** before any instance validation, `require_resolved_references()` walks every subschema of the five schema documents the checker uses and the six registry mirrors. It follows nested `$id` bases, resolves every `$ref`/`$dynamicRef` offline (no retrieval) and fails on any unresolved one. Definitions are now validated inside their own documents.

Each family has eight `reference_cases`:

- dormant missing reference
- active missing reference
- dormant resolving reference
- nested-`$id` base
- cross-document resolving reference
- cross-document missing reference
- unknown document
- dormant missing reference in its operation definition

**Verify:**

- Astra's dormant mutation now exits 1 for all eight families, through both Astra's harness and `fix4-audit.py`.
- Active, nested-base, operation-definition and flipped-expectation mutations also exit 1.
- With the walk removed (`restored/astra2-B2-no-reference-walk.py`), the same dormant mutation exits 0. That control shows the walk is what catches it.

### Earlier findings — rerun at this head

| Finding | Rerun result |
|---|---|
| Sol cycle 1 blocker 1 (target custody) | Prepared target required, unknown target field and wrong target identity rejected for all index definitions. Astra 2 harness: 0 target false accepts. |
| Sol cycle 1 blocker 2 (semantic oracles) | Changed terminal result rejected for all four completed families. Null completed start receipt fails the schema. |
| Astra 1 B1 (replay-only) | 16 replay-only refusals and 224 required-field deletions, all refused exactly. |
| Astra 1 B2 (recovery fences) | 32 denied or withdrawn recoveries refuse, succeeded and failed. Restored defect exits 1. |
| Astra 1 B3 (started boundary) | Four exact reproductions return false. Restored defect exits 1. |
| Sol cycle 3 B4 (terminal writer retry) | 20 missing-start writer retries refuse. Restored defect exits 1. |
| Sol cycle 3 N1 / Astra 2 note (timestamps) | Unchanged qualification: four index JSON files carry `generated_at_utc`. |

The reviewers' harnesses were copied unchanged except for their checkout and output paths, and run at this head:

| Harness | Result at this head |
|---|---|
| Sol cycle 2 `independent-probes.py` | 248/248 |
| Sol cycle 3 `cycle3-probes.py` | 665/673; 8 explained below |
| Fix 3 adapted probes | 665/673; same 8 |
| Fix 3 `prior-findings.py` | 180/180 |
| Sol cycle 1 `review-probes.py` | Exits 1 at its setup row (see below) |
| Astra round 2 `review_probes.py` | 444 direct probes with 0 false accepts; full-checker table below |

**The eight `cycle3-probes.py` failures** are all its `regression:old-states-and-traces` probe. That probe requires exact equality of the whole state map, and round 4 adds one state per family (`failed_terminal_saved`). Every older state and trace is unchanged (`scope-audit.json`), so this is an additive change, not a weakening.

**Sol cycle 1's `review-probes.py`** asserts that the defects exist, using a row shape that has lacked the required `started_occurred_at_utc` since fix round 1. It now exits 1 at that setup assertion. Its two findings are re-expressed at this head in `prior-findings.json` (`cycle1-B1`, `cycle1-B2`: 16/16).

**No finding is disputed, and no cell needs a Jared decision.**

## All ten standing checks

Every row is run through the complete checker, once per family. A corrupted expectation must make the process exit 1 with an AssertionError. Exit 0 fails the audit.

| Exact family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Gate |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `memory.dedup_sweep.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.dedup_sweep.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Each cell is backed by three sources: `fix4-audit.py` (23 full-checker mutations per family, 184 in all), Astra round 2's own harness (13 per family, 104 in all; 96 exit 1, and the 8 `custody-negative` runs exit 0 because the added lost-start trace now passes), and the direct probes. `standing-checks.json` holds every exit code.

| # | Negative that must fail the full checker (each family) | Qualification |
|---|---|---|
| 1 | Fresh and retained-original `projector_replay_only` expected to succeed. | Replay-only is never a current writer policy. |
| 2 | Exact CV-366 Application key expected to succeed. | These contracts are Project-only; no Application writer is introduced. |
| 3 | Raw Project partition expected to succeed. | Positives use `project~cHJvamVjdC0x`. |
| 4 | 17,000-character body expected valid. | Bounded inline roots (2,348–2,649 MessagePack bytes); SP-337 stays authoritative for larger bodies. |
| 5 | Trailing-LF identifier expected valid. | 170 guarded pattern declarations unchanged. |
| 6 | Caller-semantic conflict expected to succeed; Storage-assigned sequence expected in the returned original. | |
| 7 | Foreign checkpoint storage expected to join. | Adopted SP-278 generic identity only. |
| 8 | Denied-permission negative expected to accept. | Checker failure propagation; these events have no process-exit field. |
| 9 | Dormant, active, nested-base and operation-definition missing references; flipped reference-case expectation. | |
| 10 | Withdrawn read expected to return; source-changed read expected to refuse; forged read expected to return. | History reader. |
| Gate | Refusal code flipped, cell count changed, a defect kind dropped, a control's after-state changed. | Astra's lost-start trace must pass (exit 0). |

**Restored defects**, one patched checker copy each under `restored/`. Each must make the suite fail:

| Restored defect (patched copy of this head's checker) | Exit | Where the suite fails |
|---|---:|---|
| Astra 2 B1: no gate in `advance_completed` and no commit point | 1 | Matrix `phase:advance_completed@terminal_appended`, missing start |
| Sol cycle 3 B4: writer gate after the original return, no commit point | 1 | `effect_committed-retry-start-missing` |
| Astra 1 B2: recovery without permission/withdrawal check | 1 | `completed-recovery-permission-refusal` |
| Astra 1 B3: boundary acceptance without the gate | 1 | `started-missing-original-start` |
| Gate made a no-op | 1 | `started-missing-original-start` |
| Astra 2 B2 control: reference walk and reference cases removed, dormant `$ref` added | 0 | Defect reproduced; the head exits 1 on the same mutation |

## Checks, scope and limits

| Command / check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 | 224 boundaries; 126 operation cases; 276 traces / 464 steps; 340 writer steps; 129 identifier cases; 32 checkpoint joins; 108 history cases; 64 reference cases; 6 registry mirrors reference-checked; matrix 938 controls / 9,248 negatives. Runs in about 12 s. |
| `fix4-audit.py` (in-process) | 0 | 400/400 direct probes of every earlier finding. |
| `fix4-audit.py` (full checker) | 0 | 190/190 subprocesses as required: 184 standing/gate mutations (176 exit 1; 8 `custody-negative` exit 0) and 6 restored defects. The first B1 restored copy had an empty `if` body; it was fixed and the restored rows rerun (`restored_rerun_note`). |
| Reviewer harness reruns | see above | 248/248; 665/673 twice (8 explained); 180/180; Astra 2: 444 direct probes, 0 false accepts. |
| Shard `--generate`, then index `generate` (each commit) | 0 / 0 | Parsed status pass. Only `automated_testing_system` and `storage-plan` shards and the index changed. |
| Shard `--check --config Plans/sharding_config.json` | 0 | Pass, failures empty; 99 sources / 3,107 shards. |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level pass; failures empty. |
| Scope and preservation audit | 0 | No forbidden or test path. No new PlanUnit id. Lane schemas, contracts and storage-value registry unchanged. Every older case, state, trace and expectation unchanged. Four held rows still `blocked_on_Jared`. |
| Regrade and quote check | 0 | 392 citations re-pinned; eight oracle upgrades only. |
| Currentness copy and owner premises | 0 | 15/15 edition files match. None of the owner documents changed on `origin/main` `16acf7594a` since the merge base. |
| `git diff --check 009027140a e850f29867` | 0 | No whitespace errors. |

**Paths touched.** `Plans/storage-plan.md` (SP-630–637 gate paragraphs), `Plans/Automated_Testing_System.md` (ATS-315), `Plans/memory_maintenance_event_fixtures.json` (additive), `scripts/pm_memory_maintenance_events.py`, and the generated shards and index.

**Not touched.** No test file, event-family registry append, admission, Decision Log, `.gitignore`, Spec Lock, `.evidence`, auto-decisions, frozen validator, landing lock or `main` push. No mail and no subagent. Aggregate landing checks are left to the landing agent.

**Resource gates.** Initial: 109 GB disk free and 16 GB RAM available. The sparse worktree uses `Plans scripts reports tests`.

## IDs and remaining work

**New IDs: none.** Existing lane IDs are retained: AMS-100–107, CV-650–657, SP-630–637 and ATS-315. Only SP-630–637 and ATS-315 prose changed this round. Unused reservations stay unused.

Still open after this round:

- Final independent review.
- Event, operation, selector and target retention (`PENDING_RETENTION_DECISION`). The gate selects no retention period.
- Admission.
- Native receipt, atomicity, flush, crash, backup and read-race proof.
- Applying DL-402/DL-403 to the four held families, which is separate work.

## Evidence and cleanup

Raw outputs and runnable audit scripts are outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix4/`. Key files:

- `targeted-check.json`
- `prior-findings.json`
- `full-checker-mutations.json`
- `standing-checks.json`
- `restored/`
- `rerun/` (each reviewer harness with its `run.log` and outputs)
- `scope-audit.json`
- `premise-checks.json`
- `regrade-validation.json`
- `c1-*` and `c2-*` generate/check/validate outputs
- `currentness-sha256.txt`
- `author_fix4.py` and `owner_fix4.py` (the fixture and owner-text authoring scripts)

SHA-256 values are in `evidence-sha256.json`. The worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix4` is removed with a literal-path `git worktree remove --force` after the report is pushed.


## Card 1b applied

**Source head:** `752d9d47fa28b8c615d6677b7b8eeb60a6e300a7`; base `dc4c46c58c7462f288684a6e672febdf134e3c89`. This section supersedes only this report's earlier statements that the four monthly-summary/prune families remain held. The eight other families are under separate review and their contracts, payload/operation definitions, fixture file, owner units and eight assessment row objects remain unchanged. The old top-level self-grade source pin still governs those eight; the four new rows carry their own exact source pin.

**Result:** four exact families prepared without admission. Each has its own full adoption unit, closed payload, phase-valid operation custody, identity recipe, exact writer/history reader, SP-278 checkpoint adoption, SP-286/CV-339 first-start custody, replay, compatibility/withdrawal and executed oracles. None can currently write. No cutoff exists, membership is ABSENT, and canonical operation/result retention is still pending. Native execution is NOT_RUN.

| Exact family | Before P/Q/A | After P/Q/A | Own unit |
|---|---|---|---|
| `memory.monthly_summary.completed` | 1/2/9 (held) | 10/1/1 | `SP-638` |
| `memory.monthly_summary.started` | 1/2/9 (held) | 10/1/1 | `SP-639` |
| `memory.prune_archive.completed` | 1/2/9 (held) | 10/1/1 | `CV-658` |
| `memory.prune_archive.started` | 1/2/9 (held) | 10/1/1 | `CV-659` |

The event-history retention cell now cites DL-401/G04's `RP-OPERATIONAL-2555D@1.0.0` (2,555 days, 2,000,000 per Project, refusal at cap, stronger holds/refs preserved) on **unlanded** `origin/plans/ea-retention-cards1-20261104` at `2663667e14346235daaa561d193e959422640b6e`, `Plans/storage-plan.md` G04 and “Memory maintenance (DL-402, DL-403)”. It remains PARTIAL because the canonical operation/result custody assignment is still open. No application bucket or app edition is selected.

### Decisions and premise checks

Jared's 2026-11-04 answer was “approve all except 4c B”. Apply **1b-i A** and **1b-ii A** exactly as presented in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md`, SHA-256 `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`. DL-402/DL-403 are on unlanded `origin/plans/ea-cards1-answers-20261104` at `b6332f391a7870bad5f01a29a7e9d080050dac27`; this lane writes no decision entry.

- **DL-402:** both jobs only archive. Only the user deletes memories. Summary originals remain archived with every EvidenceRef and version. Neither job archives or merges a pin; verification, index rebuild and out-of-date marking still apply to pins.
- **DL-403:** automatic and Memory-panel invocation both refuse until cutoffs exist. Both buttons are unavailable and state why. A direct invocation, arbitrary policy argument or Boolean cannot bypass the same cutoff gate. This answer selects no values.
- **Current owner premise:** section 7.2 still names monthly Note consolidation and prune/archive; UCC-085 still names `cmd.chat.memory.summarize_monthly {project_id, month?}` and `cmd.chat.memory.prune_archive {project_id, policy?}`. The exact four names remain in DL-045's authorized list. AMS-054 separates app-thread memory, so these prepared editions stay Project-only. No prior answer is extended to a new scope or a duplicate-sweep policy. Per-family live-canon searches and negative evidence are in `DMEM-card1b-search.json`.
- **Narrow memory-owner edit:** only section 7.2 changes: archive-only/source/pin preservation with DL-402, and unavailable-until-cutoffs with DL-403. All memory-owner text outside that section is byte-identical. No AMS unit is minted or altered.

### Newly authored bindings and adoption

`SP-638` is monthly summary completed; `SP-639` is monthly summary started; `CV-658` is prune/archive completed; `CV-659` is prune/archive started. The last two are full storage/payload adoption contracts in Contracts, each with its own owner_doc; the reservations contain only two remaining SP and two remaining CV ids. Every family individually adopts the appropriate SP-636/SP-637 and CV-656/CV-657 pattern and replaces all exact names, command, schema, operation and reader identifiers. No sibling is treated as admission or as per-family search evidence.

Each exact emitter is `MemoryMaintenance.<job>.<phase>.v1@1.0.0`; each exact reader is `reader.memory.<job>.<phase>.history.v1@1.0.0`. The two new canonical value companions are `memory_monthly_summary_operation` and `memory_prune_archive_operation`, deferred with explicit pending operation retention and the existing canonical `coordination_and_storage` 16 KiB profile. The writer accepts only `dedupe_by_idempotency_key` and the exact new payload URI. Project partition is encoded; current app events are not adopted. Closed payloads and rows freeze cutoff ref/hash, and monthly payloads/rows freeze the exact optional month including null, so crash/retry cannot substitute a newer policy or month. No default-month rule is selected.

**Start custody:** same round-4 rule and predicates, including before/commit checks, full retained original identity/digest/operation/phase/flush checks and both-edition withdrawal fence. The new checker splits canonical schema, producer and payload comparisons into named invariant checks for guard-removal proof; it never repairs or substitutes retained proof. All four models (phase, writer, boundary, reader) exercise the original custody paths. A missing live cutoff refuses current writes/effects/recovery/retry with unchanged input state and no output; historical valid originals remain readable without today's cutoff. Archive post-state oracles preserve originals, evidence, versions, pins and unselected memories; summary provenance preserves all original refs.

`ATS-316` owns the new static suite. The old checker changes only its count of held rows from four to zero, with the newly prepared rows routed to `Plans/memory_archive_contracts.json`; its eight-family semantic code and fixture file are unchanged. The eight contracts/assessment rows and every prior storage value/profile are preserved by 38 assertions.

### Check 11: guard-removal table for all four

**938 negatives; 35 logical guard groups.** Every case first runs from its intact positive control. Remove one guard across its repeated sites, run the entire corpus, require its own negatives to accept, and require every other negative to retain its own exact expected refusal; then restore it. Requested-start custody is classified as start custody even at a requested-original check; terminal-original custody is separate. Canonical/row/payload/hash observational copies for the cutoff scope/commitment negatives are updated coherently, leaving one semantic defect. The table would fail on a masked negative or an unrelated changed refusal.

Exact full names for each row are in `reports/event-authority-20261104/DMEM-card1b-guards.json` and the full external `targeted-check.json` (including each complement). In the table, “other” is exactly the cases whose `guard` differs from that row; samples below are suffixes after the exact family prefix.

| Guard removed | Negatives that flip: count and samples | Other negatives keep exact refusal | Restored |
|---|---|---:|---|
| `admission` | 4; `not-admitted`; `not-admitted` | 934 | yes |
| `checkpoint_join` | 8; `checkpoint-storage_instance_id`; `checkpoint-checkpoint_key` | 930 | yes |
| `cutoff_commitment` | 4; `cutoff-changed-hash`; `cutoff-changed-hash` | 934 | yes |
| `cutoff_record` | 4; `cutoff-boolean-is-not-authority`; `cutoff-boolean-is-not-authority` | 934 | yes |
| `cutoff_scope` | 8; `cutoff-other-job`; `cutoff-other-project` | 930 | yes |
| `cutoffs_unavailable` | 328; `automatic-cutoffs-absent`; `memory-panel-cutoffs-absent` | 610 | yes |
| `effect_once` | 4; `repeated-effect`; `repeated-effect` | 934 | yes |
| `envelope_schema` | 4; `unknown-envelope-field`; `unknown-envelope-field` | 934 | yes |
| `evidence_preserved` | 4; `evidence-lost`; `evidence-lost` | 934 | yes |
| `no_extra_memories` | 4; `extra-memory`; `extra-memory` | 934 | yes |
| `no_prune_summary` | 2; `prune-invented-summary`; `prune-invented-summary` | 936 | yes |
| `operation_cas` | 4; `stale-cas`; `stale-cas` | 934 | yes |
| `operation_valid` | 4; `unknown-operation-field`; `unknown-operation-field` | 934 | yes |
| `original_custody` | 4; `history-forged-digest`; `history-forged-rehashed-payload` | 934 | yes |
| `originals_preserved` | 4; `original-deleted`; `original-deleted` | 934 | yes |
| `partition` | 4; `raw-project-partition`; `raw-project-partition` | 934 | yes |
| `payload_join` | 4; `payload-source`; `payload-source` | 934 | yes |
| `payload_schema` | 78; `payload-extra`; `payload-missing-schema_version` | 860 | yes |
| `permission_or_withdrawal` | 16; `no-permission`; `withdrawn` | 922 | yes |
| `pins_preserved` | 4; `pin-archived`; `pin-archived` | 934 | yes |
| `producer_join` | 4; `producer-actor`; `producer-actor` | 934 | yes |
| `references_resolve` | 4; `dormant-unresolved-ref`; `dormant-unresolved-ref` | 934 | yes |
| `replay_policy` | 4; `replay-only`; `replay-only` | 934 | yes |
| `request` | 4; `request-changed`; `request-changed` | 934 | yes |
| `selected_archived` | 4; `selected-not-archived`; `selected-not-archived` | 934 | yes |
| `selection_exists` | 4; `missing-selection`; `missing-selection` | 934 | yes |
| `selection_kind` | 2; `non-note-summary`; `non-note-summary` | 936 | yes |
| `selection_pinned` | 4; `pinned-selection`; `pinned-selection` | 934 | yes |
| `selection_unique` | 4; `duplicate-selection`; `duplicate-selection` | 934 | yes |
| `source` | 4; `source-changed`; `source-changed` | 934 | yes |
| `start_custody` | 390; `start-custody-missing`; `start-custody-digest` | 548 | yes |
| `summary_provenance` | 2; `summary-lost-evidence`; `summary-lost-evidence` | 936 | yes |
| `terminal_custody` | 4; `terminal-custody`; `terminal-custody` | 934 | yes |
| `unselected_preserved` | 4; `unselected-changed`; `unselected-changed` | 934 | yes |
| `versions_preserved` | 4; `version-lost`; `version-lost` | 934 | yes |

### Standing checks 1–11

1. Replay-only is refused by the current writer; only dedupe is selected. All four have their own refusal oracle.
2. Project-only editions introduce no Application writer or idempotency recipe. CV-366 remains the sole Application key authority; the unchanged adopted base suite also rejects its exact canonical Application case.
3. Writer positives use `project~cHJvamVjdC0x`; raw partitions fail.
4. Maximum MessagePack upper bounds, even with four-byte UTF-8 per allowed string character, are {'memory.monthly_summary.completed': 5002, 'memory.monthly_summary.started': 4091, 'memory.prune_archive.completed': 4959, 'memory.prune_archive.started': 4049}. Every one is below 16 KiB. Oversize inline and unknown success-exit fields fail the closed schema; SP-337 remains the larger-body owner.
5. Patterned identifiers use exact lengths/full-input guards. Trailing-LF negatives cover the new payload hashes and monthly month; no Python `$` loophole.
6. Storage-assigned sequence/observed/persisted fields are excluded from semantic retry comparison; unchanged original return is tested.
7. Checkpoint positives use the event's actual UUID storage instance throughout the source fixture; foreign storage/key negatives reject.
8. Unknown process-success fields reject. Eight full-checker mutations (wrong oracle and dormant operation ref, one of each per family) exit 1; no failure can be counted as a success.
9. All schema documents and the new value mirrors are walked offline, including dormant refs. Each family has an unresolved-ref negative; the four mutated operation definitions also fail the full checker.
10. Every exact reader returns retained valid originals after live source/request/counter changes and with cutoffs absent. Access denial, withdrawal, forged originals and corrupt start custody refuse.
11. The complete table above passes. No historical eight-family negative or expectation is edited.

### Cutoff proposals — report only, for Jared

No numeric proposal below is canonical, an approval, a setting, a selected default or permission to run. **Question: choose A/B/C separately for monthly summary and prune/archive.**

For both jobs, evaluate independently inside one Project, or inside only the calling application thread once that edition is separately bound. Never pool scopes. Proposed age means days since the later of `updated_at` and `last_access_at` (fall back to `created_at` when absent), so recent edits/use reset eligibility. Freeze the maintenance snapshot and use section 6.3's existing activation formula, including per-kind/Done half-lives and missing BM25/ANN scores equal to zero. Pins are excluded before scoring. No count cutoff or count-triggered archival is proposed.

| Job | A — recommended | B — more conservative | C |
|---|---|---|---|
| Monthly summary | Note originals idle at least **90 days AND activation < 0.10**, per exact scope and existing monthly grouping; no count threshold. Archive every original with all evidence refs. | **180 days AND activation < 0.05**, same scope and protections. | Keep disabled; Jared supplies different age/score values or asks for usage evidence first. |
| Prune/archive | Any eligible unpinned gist idle at least **180 days AND activation < 0.05**, per exact scope; no count threshold. Archive only. | **365 days AND activation < 0.02**, same scope and protections. | Keep disabled; Jared supplies different age/score values or asks for usage evidence first. |

**Reason from today's text:** section 7.2 distinguishes older low-activation Note consolidation from very-low-activation pruning. Section 9.2 gives Notes a 45-day half-life: 90/180 days are two/four such half-lives, while 180/365-day kinds decay much more slowly. Section 6.3 already includes access, recency, kind/status and retrieval signals, and Done accelerates decay. Using both age and score respects that distinction; no count trigger forces a recently used or high-value memory out. Card 1b-ii explicitly says there is no usage data yet, so A is a cautious proposal to review, not an inferred product default. The lack of cutoffs continues to disable both jobs after this draft.

### Checks and boundaries

| Check | Exit / status |
|---|---|
| `python3 scripts/pm_memory_archive_events.py` | 0 / pass; 938 negatives, 35 guard rows; 154 authored phase/writer steps, 22 positive boundaries, 16 historical controls each with and without cutoffs, plus all custody-path controls in the negative corpus. |
| `python3 scripts/pm_memory_maintenance_events.py` | 0 / pass; existing eight-family suite unchanged. |
| Full-checker failure propagation | 0 audit / all 8 child processes exit 1 as required. |
| New operation value rows against registry schema; mirrors/profiles | 0 / two schema-valid deferred rows, exact operation mirrors and existing profile adopted. |
| Shard generate / index generate | 0 / top-level pass. Currentness 15-file copy verified by SHA-256 first. |
| Shard check / index validate | 0 / parsed top-level pass, failures empty. |
| Scope/citation audit; `git diff --check` | 0 / 38 preservation assertions; 48 exact four-family citations; whitespace clean. |
| Storage-profile checker | 1 / 41 pre-existing unrelated errors, identical to base; zero new errors. The two missing profiles found during drafting were added before final generation. |
| Assistant contract inspector | 1 / `gaps_found`; `errors=[]`, `projects_refresh_static_failures=[]`, Browser successor check passes. Broader command/wiring/native gaps are outside this lane; no completeness claim. |

Shared-file hunks are additive SP-638/SP-639 in Storage, CV-658/CV-659 in Contracts, ATS-316 in Automated Testing, and two new operation rows/profiles in the storage value registry. Memory's only hunk is section 7.2. Shards changed only for those five edited owners; index regenerated. No `.gitignore`, test file, event-family registry, Decision Log, Spec Lock, auto-decisions, evidence bundle or frozen validator changed. No mail, subagent, landing lock, admission, governance reseal or main push.

**IDs used:** new `SP-638`, `SP-639`, `CV-658`, `CV-659`, `ATS-316`, checked unused across every fetched origin branch before authoring. Existing adoption IDs are reused as references only. No AMS or DL id is created.

**Remaining:** Jared's cutoff decision (proposals above); operation/result custody retention; merge the cited unlanded decisions/retention sources; independent review and per-family admission; native proof. The duplicate-sweep survivor/disposition policy stays open and all eight other family contracts stay under their separate review. All 12 worker rows now total 120 PASS / 12 PARTIAL / 12 ABSENT, without upgrading the old eight.

### Card 1b evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/targeted-check.json` — SHA-256 `d08ad36a6e50c16f10b9e5c4f35170cebdfa5c1726d1d32d34ccdc0faf96caaa`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/eight-family-regression.json` — SHA-256 `c956b542368bed7b5f595aab773c2e1d54f3cb28a9cb33ab104759028fabdbca`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/scope-audit.json` — SHA-256 `080b76b2638d20ec7bd0253ca1e5e15fb39f5d1540311ba6c5067c0df64aaf5a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/failure-propagation.json` — SHA-256 `39f9ef8aa728c463b92e0d80841b58330b50b60e9d1256209540ce7497c0c933`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/index-validate.json` — SHA-256 `a2e9a22f64bde0bb77a6117b9b2f225affcef2451ef0c578d934713bef2fe68d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/storage-profile-baseline.json` — SHA-256 `475eee9e127101fe490e45ac871f90150d429e01e182961b07f85c7ade9b21be`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/operation-registry-schema.json` — SHA-256 `00406d31ac06235eac071d9d5cf0ca6f8ede472fa0727e7188e51f01f79d4757`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/currentness-sha256.json` — SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/regrade-validation.json` — SHA-256 `4c7a0a634e989fc440347a5fb2c6bc7b285c4b5d40248618f3f171fc7a36fc1e`.

All raw authoring/probe outputs remain outside the repository at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b`. The lane report, self-grade, search and compact guard summary are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/`. The task-specific sparse worktree is removed after the report commit is pushed; this does not land the branch.
