# DDBG — sweep part 2A

Branch: `plans/ea-w2-debug-20261104`. Part 2A starts from lane head `e66effc3aa` (sweep part 1) and adds the gated guard tool by merge `c6070a0dac` (`git merge --no-ff 004bdedd632d9463f3535190a6ed5772338cdce1`; it added only the tool's 11 files, none of which this round edits). No rebase onto `main` (SWEEP-P2A rule 6). Machine: the VM, worktree `~/pm-worktrees/sweep-p2a-ddbg` (sparse: Plans, scripts, reports, tests); available memory stayed between 20 and 23 GB, above the 10 GB floor; heavy checkers ran one at a time, except that the lane runner and the authoring precheck (a few minutes each) overlapped proof runs several times, which slowed those runs. Two long-job commands ran past the 2-hour background limit (2h08m and 2h19m; each suite inside stayed under its own 115-minute cap); later groups were stopped at a suite boundary before 2 hours. On 2026-11-08 the lead paused heavy runs (pm7-build ruling, 06:05Z) while stream F needed the VM's memory; the remaining suites ran after the lead's go. A T3 restart and VM reboot (about 16:18Z) stopped the run in progress; the saved results were kept on local disk and that run was repeated.

This is **part 2A, not READY**. Part 2B (NUMRULE adoption) and the single Sol max then Astra max review of the lane remain. Native execution stays NOT_RUN. No admission, registry append, Decision Log entry, `main` push, Spec Lock, `.evidence`, `auto_decisions` or `.gitignore` change, guard-tool edit, pm-mail or subagent. No `Plans/*.md` document changed, so shards and the PlanUnit index were not regenerated (the shard check and index validate still run, below).

## Sweep part 2A: findings and responses

| Item | Response and commit | Location and how to verify |
|---|---|---|
| Take the gated tool | **Done**, merge `c6070a0dac`. | `git diff --stat e66effc3aa c6070a0dac` lists exactly the tool's 11 files. |
| Part 2 item 2: restructure every lane checker into guard tables | **Done** (`f6ca4943af`, `06d3507b53`, `5ae399f990`, `883a62a923`, `376242823a`, `a0a26ab98e`, `e2867895d2`, `714bc8f49f`, `a7a4e79fb1`, `076627624a`, `e9b32807ff`, `31b7a9db4d`). Each checker is a sequence of phases; each phase is a fresh `g.Case` whose check calls `table.validate` (schema rows) and `table.require` (code rows) and returns `True`. `candidate_refusal`, `lifecycle_refusal`, `instrumentation_refusal`, `cleanup_retry_refusal`, `admission_refusal` (was `refusal`), `retained_refusal`, `schema_reference_refusal` (was `resolve_all_schema_refs`) and the writer-policy gate reach a refusal only through a table row. | Phase modules `scripts/pm_debug_investigation_guards_<phase>.py` (22), literal constants `scripts/pm_debug_investigation_guard_constants.py`, production wrappers `scripts/pm_debug_investigation_transitions.py:170` (`run_phase`), proof adapter `scripts/pm_debug_investigation_guard_suites.py`. Verify: `python3 -B scripts/pm-debug-investigation-events.py` (PASS) and the guard-table results below. |
| Lane item: C8-L1, fixture negative 19 "terminal cannot resume" broke two invariants | **Fixed** (`f6ca4943af`). The negative now replaces the payload with one that has `previous_state` failed, `state` active and **no** `stop_reason_code`, plus `lifecycle_source.state` failed: it violates only `lifecycle.terminal`. | `Plans/debug_investigation_event_fixtures.json:10584` (`cases[8].negative_cases[19]`, `"guard": "lifecycle.terminal"`). Lifecycle suite: `lifecycle.terminal` proved; when it is cut its one own negative accepts, the other 42 negatives stay refused by their own rows and the 16 controls stay accepted. |
| Lane item: the batch-2 trial's 9 `lifecycle_source` schema rows with no lane negative | **Fixed** (`f6ca4943af`). One single-defect negative each: `/type` (source is an array), `/required/state`, `/required/phase`, `/required/verification_qualified`, `/required/cleanup_completed`, `/required/documented_preservation_hold` (each member removed), `/properties/state/enum` and `/properties/phase/enum` (`invented`), `/additionalProperties/$boolean` (unknown member). | `Plans/debug_investigation_event_fixtures.json:11177-11281`. Lifecycle suite PASS: 21 of 21 rows proved, including all 12 `lifecycle_source` rows. |
| Two-defect negatives the precheck and tool found | **Fixed** (`f6ca4943af`), 14 negatives rebuilt from a valid case with one change: the nine "oversized invalid inline string" negatives (a 16 KiB+ `operation_id` broke both `maxLength` and the inline-size row; now 257 characters, one past `maxLength`); instrumentation "stale previous collector state" (changed both previous fields, two joins; now only the original source state differs); "original source join …previous_owner_ref" (left `owner_ref` stale, so `instr.owner_unchanged` also refused; both detail owner fields now move together); "second handoff waits for acceptance" (superseded-to-superseded was also an unchanged observation; now a handoff from an active probe whose source still has a handoff pending); started "plan cannot execute" (yolo also lacked the explicit opt-in; now `regular`); and C8-L1 above. The nine "application edition" negatives (scope kind, Project id and partition all application-shaped) are one defect, not three: `envelope.project_join` and `envelope.partition` now apply only to a project-scoped envelope, and `envelope.scope_kind` refuses every other scope. | `Plans/debug_investigation_event_fixtures.json:131`, `:2692`, `:2781`, `:3855`, `:7631`; `scripts/pm_debug_investigation_guards_envelope.py:42`, `:59`. The runner requires, for every negative, that exactly one phase refuses it, by the row it names. |
| Guards the tool would find unproved | **Fixed** (`f6ca4943af`): 386 single-defect fixture negatives for rows with none (payload schema rows of all nine families, `instrumentation_source`, the change detail, the nine `lifecycle_source` rows, and code rows `envelope.project_id`, `envelope.thread_join`, `envelope.payload_run`, `instr.pair_before`, `instr.edge_start`, `instr.retry_ceiling`, `instr.replacement_linked_work`, `payload.target_sha256_hex`), plus 8 typed retry-request schema negatives. Every fixture negative now names its row (`guard`). | Fixture negatives 208 → 594 (+8 retry requests). Each suite below lists 0 rows without a negative. |
| Schema forms the tool cannot cut | **Fixed** (`8931e774f2`). The three nullable detail refs (`proof_ref`, `recovery_ref`, `linked_work_ref`) were `oneOf [string 1..256, null]`; they are now `type [string, null]` with the same bounds, which accepts exactly the same values. The one `pattern` (target_bound `source_sha256`, `^[0-9a-f]{64}$`) stays in the published schema; the payload phase keeps its type and 64-character rows and adds the code row `payload.target_sha256_hex` (lowercase hex characters, a full-match check, so a 64-character value ending in LF fails). | `Plans/debug_investigation_event_payloads.schema.json`; `scripts/pm_debug_investigation_guards_target_payload.py:19`; `scripts/pm_debug_investigation_transitions.py:88` (`documents` refuses any other pattern). The runner checks that the published schema, pattern included, agrees with the payload phase for every negative. |
| Boundaries too large for one proof run | **Split** (`06d3507b53`, `a0a26ab98e`, `e2867895d2`, `a7a4e79fb1`, `e9b32807ff`, `31b7a9db4d`). The tool attributes a schema refusal by testing every row of the root, with a purity snapshot at every internal call, so a suite costs about negatives x rows x rows; the detail suite alone would have run about 4 hours, over the 2-hour command limit. Each large boundary is now judged in exact parts, each its own phase and suite: the change detail in six (structure with the first half of the required list; the second half of the required list; the value constraints of properties 1-5, 6-10, 11-20 and 21-30; a first run of properties 1-10 as one part did not finish under the cap and was stopped); the payloads of instrumentation_state_changed, started, target_bound and state_changed, and the instrumentation source, in two (structure: type, closed members, required list, conditionals; then the property value constraints); and the instrumentation code rows in four (the eleven source joins, then the transition rules in three parts of 12 or 13 rows: status pairs, edges and endings; removal proof, obligations and handoff; receiving owner, retries, attempts and installation). | `scripts/pm_debug_investigation_transitions.py` (`split_properties`, `source_documents`, `detail_documents`) refuses any split that does not recombine to the published definition. Rows, codes and fixture labels are unchanged; the runner's exactly-one-phase check covers the new phases. |
| Type confusion in the mode resolution | **Tightened** (`f6ca4943af`). `mode_resolution` has no schema; a started yolo run now needs `explicit_yolo` exactly `true`, and a regular or yolo run skips the plan-handoff approval only when `from_planning` is exactly `false` and otherwise needs `approval_received` exactly `true`. The old checks read truthiness (`"false"` passed). | `scripts/pm_debug_investigation_guards_family.py:14`, `:28`. |
| Retained history: identity probe was two-defect | **Fixed** (`f6ca4943af`). Forging `payload.operation_id` also changed the semantic digest. The proof now forges the Project scope (identity only). The original admission row compares with the original record's own family; identity and body rows compare within one family, and `retained.family` refuses a foreign record. The old operation-id probe stays in the runner as a whole-checker regression. | `scripts/pm_debug_investigation_transitions.py` (`retained_probes`); `scripts/pm_debug_investigation_guards_retained.py:35`, `:48`. Retained suite PASS 9 of 9. |
| Proof input size | **Projected** (`5ae399f990`, `e2867895d2`, `714bc8f49f`, `376242823a`). Suites not yet run when this was added take inputs projected to the top-level members each phase reads (`PHASE_MEMBERS`); value-part suites keep only the properties the part judges (detail parts: only `payload.detail_ref` and the record it names); envelope inputs keep only the four payload ids the envelope rows read; identical projected controls are kept once. The references suite proves its rows on a 740-byte document (the schema's identifiers and the one definition the probes point into). The lifecycle, family, admission, retained and retry suites ran on full candidates before this and were not rerun. | `scripts/pm_debug_investigation_transitions.py` (`PHASE_MEMBERS`, `projected`, `reference_proof_document`). The runner checks that every phase gives the same row on the full candidate and on its projection, for every negative and transition, and runs the reference probes on the full schema. |
| Lane runner and standing checks | **Updated** (`f6ca4943af`, `5ae399f990`, `e2867895d2`, `759deb18c1`). The runner checks, per negative: valid base, exactly one refusing phase, the named row, the expected code, zero appends, projection equivalence and published-schema agreement; and the domain vocabularies equal their schema enums. Standing checks copy the new modules, mutate the digest field list and body recipe in their new files, and run a probe that corrupts one family with that family's complete oracles (`PM_DDBG_FAMILY`); baseline, restored and reference runs check every family. The first standing-check run failed 18 probes, all one cause: when a probe injected `observed_at_utc`/`persisted_at_utc` into a base, the retained "forged" probe used that same value and forged nothing; each forged Storage value is now the first candidate that differs from the original (`759deb18c1`; the proven retained suite's inputs are unchanged). | `scripts/pm-debug-investigation-events.py`, `scripts/pm-debug-investigation-standing-checks.py`. Results under Verification. |
| Part 2 item 1: NUMRULE | **Part 2B** (not started; NUMRULE has not passed its gates). | Locations under "Part 2B items". |
| Part 2 item 3: the seven unchanged retention adoptions | **Not done in 2A.** Its own text makes it an integration follow-up "when that scope is assigned"; it needs no NUMRULE and no Jared choice, but it edits seven owner contracts and SP-570, which this round was not assigned. | `Plans/Contracts_V0.md:1593` (and the six sibling `PENDING_RETENTION_DECISION` markers), `Plans/storage-plan.md:1069-1095`. |
| Part 2 item 4: final review | **After 2B**: one Sol max then one Astra max review of the lane. | — |

**Domain rule (what a reviewer should check).** A code predicate checks one invariant on inputs inside its schema domain; where an input it reads is outside that domain (not an object, a missing member, a wrong type, a value outside a closed enum or length bound) it passes, and the schema row of the same or an earlier phase refuses that input. No refusal leaves the complete checker. The rule is applied only for schema-owned structure and two semantic domains: the Project joins apply to a project-scoped envelope (`envelope.scope_kind` owns the rest), and the instrumentation edge, cleaned-restart and retry-count rows apply to a change between two legal status pairs (`instr.no_op` and the pair rows own the rest), with the increment rule applying below the retry ceiling (`instr.retry_ceiling` owns the ceiling). No predicate defers to an unrelated semantic row.

**Timestamp fields.** The lane has no timestamp format check: `occurred_at_utc` is one of the caller-supplied fields of the semantic digest, and the Storage-assigned `observed_at_utc` and `persisted_at_utc` are compared for equality with the selected original by `retained.observed` and `retained.persisted`. My own review of these timestamp fields is interim only; the shared rule's date-time gate decides them in part 2B.

## Guard-table result

One suite per phase; each row is a named predicate or a supported schema assertion. **Proved** means the tool's matrix shows each of the row's own negatives refused by that row alone, cutting the row (swapping it to pass) makes every own negative accept while every other control and negative keeps its exact result and guard-call trace, and the uncut restoration repeats the baseline. A suite earns no credit unless every row is proved and every safety check passes. Duplicates declared: none (no two rows check the same field with the same predicate). The per-row cut table (own negatives, flips, other cases unchanged, masked, unrelated changes) is in `reports/event-authority-20261104/DDBG.guard-tables.md`; the tool's JSON and Markdown reports are in the evidence folder.

| Suite | Status | Controls | Proved | Negatives | Evaluations | Cut results | Failure kinds |
|---|---|---:|---|---:|---:|---|---|
| `envelope_suite` | PASS | 2 | 13 / 13 | 63 | 2600 | 63 flips, 0 masked, 0 unrelated changes | none |
| `payload_context_item_added_suite` | PASS | 1 | 36 / 36 | 36 | 4033 | 36 flips, 0 masked, 0 unrelated changes | none |
| `payload_context_item_state_changed_suite` | PASS | 1 | 23 / 23 | 23 | 1680 | 23 flips, 0 masked, 0 unrelated changes | none |
| `payload_exported_suite` | PASS | 1 | 28 / 28 | 28 | 2465 | 28 flips, 0 masked, 0 unrelated changes | none |
| `payload_imported_suite` | PASS | 1 | 24 / 24 | 24 | 1825 | 24 flips, 0 masked, 0 unrelated changes | none |
| `payload_verification_recorded_suite` | PASS | 1 | 23 / 23 | 23 | 1680 | 23 flips, 0 masked, 0 unrelated changes | none |
| `payload_instrumentation_state_changed_suite` | PASS | 31 | 13 / 13 | 13 | 1760 | 13 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_instrumentation_state_changed_suite` | PASS | 31 | 21 / 21 | 21 | 3328 | 21 flips, 0 masked, 0 unrelated changes | none |
| `payload_started_suite` | PASS | 11 | 16 / 16 | 17 | 1372 | 17 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_started_suite` | PASS | 11 | 25 / 25 | 25 | 2736 | 25 flips, 0 masked, 0 unrelated changes | none |
| `payload_target_bound_suite` | PASS | 1 | 9 / 9 | 11 | 336 | 11 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_target_bound_suite` | PASS | 1 | 28 / 28 | 28 | 2465 | 28 flips, 0 masked, 0 unrelated changes | none |
| `payload_state_changed_suite` | PASS | 14 | 9 / 9 | 9 | 644 | 9 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_state_changed_suite` | PASS | 14 | 24 / 24 | 24 | 2774 | 24 flips, 0 masked, 0 unrelated changes | none |
| `family_suite` | PASS | 72 | 4 / 4 | 6 | 1014 | 6 flips, 0 masked, 0 unrelated changes | none |
| `lifecycle_suite` | PASS | 16 | 21 / 21 | 43 | 3776 | 43 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_source_suite` | PASS | 14 | 11 / 11 | 11 | 850 | 11 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_source_values_suite` | PASS | 14 | 19 / 19 | 27 | 2378 | 27 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_suite` | PASS | 36 | 19 / 19 | 19 | 3190 | 19 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_required_suite` | PASS | 36 | 15 / 15 | 15 | 2346 | 15 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_a_suite` | PASS | 3 | 15 / 15 | 15 | 828 | 15 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_d_suite` | PASS | 7 | 15 / 15 | 15 | 1012 | 15 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_b_suite` | PASS | 13 | 10 / 10 | 30 | 1333 | 30 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_c_suite` | PASS | 19 | 16 / 16 | 20 | 1911 | 20 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_joins_suite` | PASS | 36 | 11 / 11 | 11 | 1598 | 11 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_suite` | PASS | 37 | 12 / 12 | 12 | 1813 | 12 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_handoff_suite` | PASS | 36 | 12 / 12 | 12 | 1776 | 12 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_retry_suite` | PASS | 36 | 13 / 13 | 15 | 2040 | 15 flips, 0 masked, 0 unrelated changes | none |
| `retry_request_suite` | PASS | 2 | 10 / 10 | 10 | 372 | 10 flips, 0 masked, 0 unrelated changes | none |
| `admission_suite` | PASS | 9 | 5 / 5 | 54 | 1008 | 54 flips, 0 masked, 0 unrelated changes | none |
| `retained_suite` | PASS | 9 | 9 / 9 | 81 | 2520 | 81 flips, 0 masked, 0 unrelated changes | none |
| `references_suite` | PASS | 1 | 4 / 4 | 5 | 78 | 5 flips, 0 masked, 0 unrelated changes | none |

Totals: 513 rows, 513 proved, 517 controls, 746 negatives, 59541 evaluations.

Per checker (production entry point → its phases):

| Checker | Phases (suites) | Rows | Proved | Unproved |
|---|---|---:|---:|---|
| `candidate_refusal` (current append/retry candidate) | envelope; payload structure/values per family (14 suites); family; lifecycle (state_changed); instrumentation source, source values, detail structure, detail required, detail values A/B/C/D, joins, transitions 1-3 (instrumentation_state_changed) | 485 | 485 | none |
| `cleanup_retry_refusal` | retry request | 10 | 10 | none |
| `admission_refusal` (was `refusal`) | admission | 5 | 5 | none |
| `retained_refusal` | retained history | 9 | 9 | none |
| `schema_reference_refusal` (was `resolve_all_schema_refs`) | references | 4 | 4 | none |

**Unproved rows:** none in any suite. **Cut results:** in every proved row each own negative flipped when the row was cut, no other case changed result or trace, and no negative was masked.

## Part 2B items

Each waits for NUMRULE (CV-1100/1101, SP-1100/1101 and the shared helper) to pass its gates. No lane-local number serializer or numeric cap was added in 2A.

| Item | Exact location | What 2B does |
|---|---|---|
| Semantic digest and identity recipes | `scripts/pm_debug_investigation_guards_retained.py:15` (`semantic_digest`), `:25` (`identity`); digest field list `scripts/pm_debug_investigation_guard_constants.py:161` (`DIGEST_FIELDS`) | Replace the bounded `json.dumps` vectors with the shared canonical encoding; add the alternative-spelling (`1`/`1.0`/`-0`/`1e0`) and range cases, and the original write-time recipe and retained-history cases. |
| Inline body and detail sizing | `scripts/pm_debug_investigation_guards_family.py:60`, `scripts/pm_debug_investigation_guards_instrumentation_detail.py:46` | Measure stored bytes with the shared encoding. |
| Integer fields in the companion schema | `Plans/debug_investigation_event_payloads.schema.json:168`, `:172` (exported `item_count`, `artifact_count`), `:550` (target_bound `binding_revision`), `:758-768` (detail `retry_count_before`, `retry_count_after`, `attempt_number`), `:1011` (source `retry_count`), `:1032` (retry request `retries_used`) | Adopt the shared integer domain and spellings; the type rows already refuse a JSON float such as `1.0` (`type(x) is int` in the predicates and `type: integer` rows). |
| Integer predicates | `scripts/pm_debug_investigation_guards_instrumentation.py:118`, `:386`, `:400`, `:413`, `:423`, `:433`, `:450`; `scripts/pm_debug_investigation_guards_retry.py:30` | Re-check under the shared rule (they already compare exact `int` types and bounds). |
| Timestamp fields | `occurred_at_utc` in `DIGEST_FIELDS`; `observed_at_utc`, `persisted_at_utc` in `retained.observed` / `retained.persisted` (`scripts/pm_debug_investigation_guards_retained.py`) | Adopt the shared date-time rule. My own review of these fields in 2A is **interim only**. |

## What Astra keeps finding: how each was ruled out in this round

| # | Class | How it was ruled out |
|---|---|---|
| 1 | Forged or contradictory inputs | Identities and digests are recomputed in the retained factory from the offered record and the selected original; joins are separate rows per field (eleven instrumentation source joins, eight envelope joins). Negatives: forged Project scope, forged body, each stale join field. |
| 2 | Storage metadata from the payload | Digest field list excludes Storage-assigned fields; `retained.sequence`, `retained.observed`, `retained.persisted` compare with the original. Standing check C6 rejects a digest that includes any of them. |
| 3 | Historical readers wrong either way | The retained phase ignores live owner and source state and the reader-only replay policy (control), and refuses withdrawn, forged, foreign, older-recipe and other-admission records (one negative each, per family). No current-writer row is in the retained table. |
| 4 | One field read two ways | Each domain vocabulary a predicate uses is checked equal to its schema enum by the runner; every predicate checks the exact type (`type(x) is str/int/bool/dict`) before a value. |
| 5 | Unresolved schema references | `schema_reference_refusal` runs first; the references suite proves its four rows with a dormant anchor, non-string, unknown-base, missing-target and non-schema-target reference. Standing check C9 still injects an unvisited dangling reference. |
| 6 | Size limits on part of the value | Payload bytes and the referenced detail's bytes are measured separately (`family.payload_size`, `instr.detail_size`); oversized schema-valid negatives exist for both. |
| 7 | Custody not verified on every path | Retry, retained and admission paths are their own tables; the retry request is typed by its own schema rows; the detail is the record `payload.detail_ref` names. |
| 8 | Masked negatives | The tool's cut and matrix results below; the runner requires exactly one refusing phase and the named row for every negative; the authoring precheck found 23 multi-row negatives before the first tool run: 14 were rebuilt and 9 (the application edition) became single-row under the scope-kind domain rule. |
| 9 | Grades that claim too much | Grades below cite only what the tool proved; an unproved or unrun suite leaves its families PARTIAL. |
| 10, 10a | Numbers written two ways; tightening rejecting history | Part 2B (above). |
| 11 | Types confused | Wrong-type negatives for every typed schema row (generated from the schema) plus the lane's string/number/null/array/object spellings; `mode_resolution` now needs exact `true`. |
| 12 | Formats skipped | The schemas use no `format`; the one `pattern` is checked by a full-match code row (`payload.target_sha256_hex`), with a 64-character value ending in LF as its negative. |

## Tool issues found (rows on `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/TOOL-ISSUES.md`; none makes a real check falsely pass)

| Row | Issue | Effect on this lane |
|---|---|---|
| T129 | Pseudo file names of third-party generated code (`<string>`, `<attrs generated methods …>`) are resolved against the working directory, so with the repository as working directory jsonschema/referencing internals read as unscanned repository code (`runtime_untracked_site`). | Fails closed; suites are run from a working directory outside the repository. |
| T130 | No public single-case entry point: production code that wants to run the proven check must call `GuardTable._bind`/`_restore`. | `run_phase` does so outside every scanned module (`scripts/pm_debug_investigation_transitions.py:170`). |
| T131 | While a schema row's predicate runs, every Python call inside jsonschema and the mutated-view construction triggers a full purity snapshot of the input (77% of sampled run time). | 0.4 to 1.1 s per evaluation on real candidates; proof inputs projected per phase; the detail schema split. |
| T132, T119 | CPython 3.14 stores constant slices (`x[:1]`) as `slice` objects in code constants, which certification refuses (T132); `reversed` (a builtin class) is outside the certified builtins (T119, filed by the lead). | Fails closed (`state_shared_across_cases`); the references factory avoids both. |
| T133 | Inside a predicate, only locals bound by a subscript of a parameter are data names; a local bound by `.get()`, tuple unpacking or a loop target cannot take a method call (`predicate_purity_uncertified`), and every function of a scanned module that no table registers is scanned as checker code. | Usability: predicates read `x = value['k']` after a `type(value.get('k'))` check, and each table has its own module. |
| T149 | A generator that `all()` stops early inside a predicate closes with `GeneratorExit` in the scanned module, which the runtime trace reports as an untracked exception. | Fails closed (the first target_bound payload run); the digest row and `instr.no_op` now build lists (`076627624a`). |

## Family grades before and after part 2A

P=PASS; p=PARTIAL; A=ABSENT. Authored-contract self-grades, not admission or native proof; `DDBG.self-grade.json` holds the cells and evidence.

| Family suffix | Before 2A (sweep part 1) | After 2A | What 2A changed in the cells |
|---|---|---|---|
| context_item_added | 10P / 1p retention / 1A membership | Unchanged | positive_negative_oracles now carries the tool proof of its envelope, payload and family rows |
| context_item_state_changed | 10P / 1p / 1A | Unchanged | same |
| exported | 10P / 1p / 1A | Unchanged | same |
| imported | 10P / 1p / 1A | Unchanged | same |
| started | 10P / 1p / 1A | Unchanged | same; transitions: mode resolution now needs exact `true` |
| target_bound | 10P / 1p / 1A | Unchanged | same; closed_payload_schema: the digest pattern is checked by a full-match row |
| verification_recorded | 10P / 1p / 1A | Unchanged | same |
| instrumentation_state_changed | 11P / 1A | Unchanged | closed_payload_schema: equivalent `type [string, null]` refs; positive_negative_oracles: source, detail and transition rows proved |
| state_changed | 11P / 1A | Unchanged | positive_negative_oracles: all 21 lifecycle rows proved |

Total: **92P / 7p / 9A → 92P / 7p / 9A.** The seven PARTIAL cells are the seven families' unchanged lane retention bindings (part 2 item 3, integration follow-up). No grade is raised in 2A: positive_negative_oracles was already PASS on the lane's oracles; 2A replaces the lane's own proof with the shared tool's, and the cell stays PASS only because every suite below proved every row. The lane is not READY: part 2B and the final review remain.

## Verification

Run on the VM at head `759deb18c1 (code; the report commit follows it)`, worktree `~/pm-worktrees/sweep-p2a-ddbg`; proof suites from a working directory outside the repository (tool issue T129).

| Command | Exit | Result |
|---|---:|---|
| `python3 -B scripts/pm-debug-investigation-events.py` | 0 | PASS, 0 failures (every negative: valid base, exactly one refusing phase, the named row, its code, zero appends, projection equivalence, published-schema agreement) |
| `python3 -B scripts/pm-debug-investigation-standing-checks.py` | 0 | PASS, 187 probes, 0 failures (the first run failed 18, fixed by `759deb18c1`, see the findings table) |
| `python3 -B scripts/pm_guard_isolation.py --adapter scripts/pm_debug_investigation_guard_suites.py:<suite> …`, one per suite, `--max-rss 3072 --pause-when-low 10 --resume-at 11` | 0 each | the 32 suites above, all PASS |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass (99 sources) |
| `python3 scripts/pm-plan-index.py validate` (against `origin/main` `78a1fd64cd`) | 1 | fail, 53 failures, none naming a lane file: 32 `plan_unit_removed_without_ledger_decision` and 21 `plan_unit_removal_ledger_invalid` in documents this branch does not touch (for example ACD-637 to ACD-639 in `Plans/assistant-chat-design.md`, added on `main` after this branch's base `e42ce235b4`). Validate compares with `origin/main`, and this round may not rebase; batch-2 integration rebases |
| `git diff --check` over each commit | 0 | clean |
| Authoring precheck (`matrix.py`, evidence folder; no proof credit) | 0 | every negative refused by exactly one row across all phases, each control by none: 0 bad |

The authoring precheck, the fixture generator and the run scripts are evidence, not repository tools: the precheck evaluates every row's predicate directly (the tool's matrix without its protocol checks) and found the 23 multi-row negatives before the first proof run; the generator built the 386 new negatives from the schema with one change each and kept only those the precheck showed single-row. Proof credit comes only from the tool.

Scope and changes: only lane paths changed (`Plans/debug_investigation_event_payloads.schema.json`, `Plans/debug_investigation_event_fixtures.json`, `scripts/pm-debug-investigation-*.py`, `scripts/pm_debug_investigation_*.py`, this report and its self-grade); the 11 tool files arrived by the merge and are unedited. No `Plans/*.md`, registry, Spec Lock, `.evidence`, `auto_decisions`, `.gitignore` or test file changed.

## Evidence

Copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p2a/` (share nearly full: only what this report cites; JSON gzipped; `SHA256SUMS` beside them): this report, the self-grade, `DDBG.guard-tables.md`, each suite's tool report (`<suite>.json.gz`, `<suite>.md`), the group logs, `verify_runs.json` (each completed suite's recorded inputs, module and tool hashes equal the head's), the lane-runner and standing-check outputs, and the authoring scripts (`update_fixtures.py`, `matrix.py`, `gen_nonguards.py`, `reasons.py`, `run_suites.sh`, `summarize.py`, `verify_runs.py`).

## Sweep part 1 report (history, unchanged below)

Branch: `plans/ea-w2-debug-20261104`. Implementation commit: `c19ffddf8ff2e23b85bcf9c42ad48af8e651265d`. Rebased onto `origin/main` `e42ce235b4711325ced818c777f070c3ee0d7952` from lane head `dd186623ab2cc2809ea5992fd2fcaac362eb1d60`. Rebase conflicts involved generated files only; they were restored rather than hand-merged and the final five owner directories and PlanUnit index were regenerated. Machine: Nas1. Initial available RAM 15 GB and root disk 503 GB; checks ran serially under the existing local heavy-check lock, checking the 6 GB floor before each step. Fifteen ignored currentness-edition files were copied and their source/destination SHA-256s verified.

Both held families are now **prepared without admission**. All nine remain absent from the unchanged family registry. This is **part 1, not READY**: NUMRULE, shared guard-table proof and final Sol/Astra review remain part 2. Native execution is NOT_RUN. No admission, Decision Log entry, registry append, main push, landing lock, governance reseal, pm-mail or subagent occurred. No new PlanUnit ID was minted.

### Sweep part 1: findings and responses

| Item / blocker | Response and implementation commit | Exact location and verification |
|---|---|---|
| Deck 2 3.b / DL-428, prior CV-578 lifecycle conflict | **Fixed** (`c19ffddf8ff2e23b85bcf9c42ad48af8e651265d`). Failed is terminal for exactly six reasons; Cleanup failed stays separate. History opening never restarts work, and new work uses linked investigation lineage. | `Plans/Contracts_V0.md:2631`; `Plans/assistant-chat-design.md:1179`; `scripts/pm_debug_investigation_transitions.py:24`. Run the DDBG checker: all six Failed positives, other-reason negatives, stale before-state/phase, terminal in-place restart, reason and original verification/cleanup cases execute. |
| Deck 2 3.c / DL-429, prior B4 source/domain/transition hold | **Fixed** (`c19ffddf8ff2e23b85bcf9c42ad48af8e651265d`). Complete approved meanings and fourteen-row table are retained verbatim in MiscPlan. CV-574 maps original manifest/MiscPlan fields to event before/after values and reason. It reuses N2-133's exact five scopes, six statuses and five cleanup results; all eight legal pairs and all approved transitions are bounded. | `Plans/Contracts_V0.md:2052`; `Plans/MiscPlan.md:1329`; `scripts/pm_debug_investigation_transitions.py:69`. The fixture executes 37 positive probe cases and 100 negatives, including scope variants, all source alternatives, never-needed proof, actual removal, detach residue, handoff approval/acceptance/uncertainty, retry count/attempt/ceiling and target safety. |
| Fixture stale-copy defects found during this sweep | **Fixed** (`c19ffddf8ff2e23b85bcf9c42ad48af8e651265d`). Previous-state negatives now use an edge with another lawful before pair; the stale cleanup-result case uses inspection's two lawful cleanup-pending pairs. The retry-count negative updates its dependent attempt number, and the original retry-count join negative keeps after-count coherent. The ceiling is tested at initiation, before an attempt/body is allocated. | `Plans/debug_investigation_event_fixtures.json:1424`; `scripts/pm_debug_investigation_transitions.py:60`; `scripts/pm-debug-investigation-events.py:226`. Every negative base must pass the same complete candidate gate before its defect is applied. Four retry-request oracles include both permitted retries, unauthorized initiation and exhausted retries. |
| Eager schema references / history separation | **Fixed** (`c19ffddf8ff2e23b85bcf9c42ad48af8e651265d`). Every definition is checked and every reference resolved, including unvisited branches. Historical original verification bypasses current writer/live-state predicates but checks original identity/body, Storage metadata, original admission and original recipe; withdrawn/forged history refuses. | `scripts/pm_debug_investigation_transitions.py:208`; `scripts/pm-debug-investigation-events.py:108`. The standing runner injects an unresolved unvisited reference; its required result is explicit FAIL/nonzero. Historical positives include retained reader-only replay policy after live state changes. |
| Current retention prerequisite for the two completed families | **Bound to existing canon** (`c19ffddf8ff2e23b85bcf9c42ad48af8e651265d`), with no new retention choice. The exact G02 names already select RP-OPERATIONAL-2555D@1.0.0 in current main; both contracts bind the original investigation terminal-transition anchor, unchanged 2,555-day TTL, per-Project operational bucket, fail-closed overflow and hold/ref/recovery/backup protections. | CV-574/CV-578 and SP-570; current `Plans/storage-plan.md:17594`. Separate native retention oracles require original-clock continuity, protected cleanup and no unexpired/protected eviction. |
| Existing review blockers | Latest Sol cycle 3 and Astra 3 report no blocker in the seven already-prepared families. Their two genuine holds are closed above. Prior B1-B3 stay fixed. | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW-cycle3.md` and `REVIEW-astra-3.md`; no additional product choice is stopped. |

DL-428's approved option says: “Add Failed as the ending state for exactly those six reasons and save the specific reason.” The six unchanged machine reasons are `investigation.verification_failed`, `investigation.no_repro_observed`, `investigation.budget_exhausted`, `investigation.runtime_unavailable`, `investigation.target_unreachable` and `investigation.adapter_unavailable`.

DL-429's approved option says: “Keep the six probe labels and a separate cleanup result. Save each actual change in either value once, with its reason and before/after values.” The owner table also retains whole-lane never-needed proof, no cleaned restart, two retries after the initial attempt, accepted responsibility before another handoff, no retry-ceiling reset, automatic cleanup on replacement, approved durable-fix promotion, target exclusion, recovery snapshots, exact setting restoration and secret scrubbing. Fifteen named technical transition cases split the card's combined retry success/failure row; they add no transition. Initial Planned / Not needed and unchanged observations save no change entry.

The seven existing owner PlanUnits, seven payload definitions and seven complete fixture objects were compared with `dd186623ab` and are unchanged. SP-570's existing seven adoptions preserve their content. Only shared validation coverage needed for the new work is added. Their earlier lane-local retention markers are deliberately preserved under the task's scope; current G02 assignment means this is follow-up integration, not an unanswered Jared choice. The distinct application edition/count bucket and No-project availability remain outside these preserved Project writer drafts; no Project is fabricated.

### Family grades before and after

P=PASS; p=PARTIAL; A=ABSENT; C=CONFLICT. These are authored-contract self-grades, not admission or native proof. Current quotation and file-hash evidence is in `DDBG.self-grade.json`.

| Family suffix | Before (Astra 3) | After sweep part 1 |
|---|---|---|
| context_item_added | 10P / 1p retention / 1A membership | Unchanged |
| context_item_state_changed | 10P / 1p retention / 1A membership | Unchanged |
| exported | 10P / 1p retention / 1A membership | Unchanged |
| imported | 10P / 1p retention / 1A membership | Unchanged |
| started | 10P / 1p retention / 1A membership | Unchanged |
| target_bound | 10P / 1p retention / 1A membership | Unchanged |
| verification_recorded | 10P / 1p retention / 1A membership | Unchanged |
| instrumentation_state_changed | 8P / 3p / 1A; held | 11P / 1A membership; prepared |
| state_changed | 2C / 2p / 8A; held | 11P / 1A membership; prepared |

Total: **78P / 12p / 16A / 2C → 92P / 7p / 9A / 0C**. The seven remaining PARTIAL cells are their unchanged lane retention bindings. Part-2 proof/tool adoption is still required before the lane can be READY; no overall all-PASS claim is made.

### Newly authored technical bindings and premise checks

- **CV-578 independently authors** `owner.debug.investigation.state_changed@1.0.0`, `reader.debug.investigation.state_changed@1.0.0`, `consumer.debug.investigation.state_changed.context@1.0.0` and `.artifacts@1.0.0`, exact Project/investigation/original-operation identity, SP-286/CV-339 full-value v2 first receipt, SP-278 generic source/CAS with nine-field durable-token definition and transient family checkpoint `none_required`, custody, replay and withdrawal. No sibling admission is reused.
- **CV-574 preserves its named producer/readers** and newly binds the source fields, previous values, closed original detail schema, exact N2-133 scope enum and DL-429 transition predicates. It independently retains its own SP-286/CV-339/SP-278 adoptions and operating consumers. Original detail/evidence remains in existing instrumentation-lineage custody; no new persistent projection, checkpoint or storage-value family is introduced.
- **Search scope:** exact-name searches on all tracked live `origin/main` Plans, excluding shards/index/audits/evidence/migration/ledgers. Five current matches for each family; no existing exact named versioned handler/reader found. Reuse existing minima, Chat lifecycle, MiscPlan cleanup, N2-133 scopes, manifest custody, G02 retention and generic Storage prerequisites first. `binding-search.json` pins base, scope, paths and hashes of both archived outputs.
- **Current premises:** DL-045 still lists both exact families and permits bounded technical bindings; DL-428 resolves the current Chat lifecycle omission; DL-429 explicitly closes the current cleanup/source question and chooses no new lifetime. N2-133 still supplies exactly five scopes. Current G02 lists both exact families; the older DL-075 runtime-artifact retention answer is not repurposed. No premise failed and no new owner question is stopped.

### Verification and practical limits

Final whole-checker regression: **PASS, 187 probes, 0 failures**. All nine families have current-writer reader-only-policy negatives, encoded Project partitions, unchanged caller-semantic digest versus Storage-assigned metadata probes, SP-337 body requirements and transient-checkpoint assertions. The two new families additionally cover 15 lifecycle positives and all new transition/source/proof/refusal cases above. Unknown/missing fields and wrong versions fail. Wrong boolean forms (`"false"`, `"0"`, null, arrays, objects) are rejected for new detail/source inputs; no new formatted timestamp field or anchored identifier regex is introduced.

| Final command | Exit | Parsed result |
|---|---:|---|
| `index-generate` | 0 | pass |
| `shard-check` | 0 | pass |
| `index-validate` | 0 | pass |
| `static-check` | 0 | PASS |
| `standing-checks` | 0 | PASS |
| `diff-check` | 0 | clean |

Generated changes are confined to the five edited owners (`contracts_v0`, `storage-plan`, `automated_testing_system`, `assistant-chat-design`, `miscplan`) and `.plan_index`; no unrelated owner shard changes. Index generation's normal clock metadata is regenerated. No test file, ignore rule, event-family registry, Spec Lock, auto-decision, governance evidence or frozen validator changes. The required memory files named in the shared brief do not exist at their Nas1 paths; the on-disk project rules, lane allocation, currentness requirement and full briefs were followed directly.

Static source/detail/proof values are explicit projections, never evidence of actual authenticated reads or an executed cleanup. Each new family has authored native first-receipt/crash, body/detail externalization, original source/proof/digest verification, complete obligation continuity, target exclusion, exact cleanup/detach, historical read, source-generation/CAS, permission/deletion, retention and withdrawal/rebuild obligations. Native execution remains NOT_RUN. The aggregate landing/governance checks and unrelated shared-runtime materialization checker are outside this branch-preparation task and were not rerun.

### Check 11 fixture status and Part 2 items

| Surface | Part-1 result | Remaining proof |
|---|---|---|
| Each negative starting candidate | Complete candidate-gate validation before mutation; source/attempt copies repaired above | Shared tool must prove each individual predicate and schema clause; passing the base alone is not that proof. |
| Retry ceiling | Dedicated typed initiation request, with no hypothetical after-state or allocated attempt | Adopt shared guard table and prove the exact authorization/count predicates. |
| Schema/edge and source-join defenses | Actual negative inputs and expected refusal paths execute through the whole checker | Inventory per-field/conditional duplicates precisely; no unrelated guard set or whole-keyword cut is claimed. |

1. **NUMRULE — part 2.** Adopt CV-1100/1101, SP-1100/1101 and the shared helper after it passes. Exact locations: `scripts/pm-debug-investigation-events.py` `semantic_digest` and `identity` (`json.dumps` currently supplies bounded static vectors, not native RFC 8785 proof); exported/imported count fields; and new detail retry/attempt inputs and body sizing in `scripts/pm_debug_investigation_transitions.py`. Add the shared alternative-spelling/range and original write-time recipe/history cases. No local number serializer or extra numeric cap was invented; the two-retry/three-attempt limits come directly from DL-429.
2. **Guard tables/shared isolation — part 2.** Restructure `candidate_refusal`, `refusal`, `retained_refusal`, `lifecycle_refusal`, `instrumentation_refusal`, `cleanup_retry_refusal`, reference resolution and each applicable schema assertion into named predicate tables and run the approved shared tool. Prove the whole lane, site by site, including real duplicates and every nonduplicate negative. No local guard-proof script or table refactor was added in part 1.
3. **Seven unchanged retention adoptions — integration follow-up.** Reconcile their explicit PENDING_RETENTION_DECISION text with the already-landed G02 assignment when that scope is assigned; no new retention choice is requested. The existing application/No-project edition also retains its separately documented owner scope reconciliation; this two-decision task neither admits it nor changes the seven preserved contracts.
4. **Final review — part 2.** Sol and Astra review once after the two shared tools are adopted. This report does not reuse the earlier seven-family review as approval of the new two-family work.

### Evidence paths and SHA-256

All final artifacts below are retained under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/`.

| Absolute path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/binding-search.json` | `c31f1dd5bf21b9276bc608968248d41ff6c8ff4c80f2dfc9168505151bf8c947` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/debug.investigation.state_changed.current-search.txt` | `ac061e67b7196ac0bdb040757c0153a9a9e2a9ec1a9601b36c268777ef0c3ad1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/debug.investigation.instrumentation_state_changed.current-search.txt` | `c65eaa3bc1bd455bad6fc19d92e0f71de1f8d66e741a81d969cba518ca1634a9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/currentness-sha256.json` | `b0c90c8787154ebc708d8022ff8d13f99a5885e437d65b1037961f77768cfa37` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/shard-generate.json` | `d7cfdf85905b1af45d5817cf77df09f8ece650942ade45163f90dd6f61b3ad68` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/index-generate.json` | `c2d45748c19cec7011e4911c872920861c377af644b9dfd33b3e52aa11d08a1f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/shard-check.json` | `a715ce384c99d89a8b5576fb6a07f92786372746197d08d9bad57c619fec35c1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/index-validate.json` | `a082d4eabbbf34faa07d44c9b330914647e123a9175a4db8e31b8e67651dfd56` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/static-check.json` | `54491411571cf5695eae450f4bed6907da1f83f5c00945c4336c3a30e7c7ef61` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/standing-checks.json` | `744e61b8ebaa464b319d44f30abdd67036edd1dff82d5d601b4d48d7ff09fd60` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/pipeline-exits.json` | `cc9dd40cd68376664f6b5398f3924201221f8c7f0dcb1fbd435bba689d221390` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/diff-check.json` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/sweep-p1/scope-audit.json` | `cf241006848dcc64440dd764629e6f21142f41a95bcb111ab60d1dd9863b0810` |

### Historical lane report through dd186623ab

The following is preserved pre-sweep lineage; its holds, questions, grades and old line numbers are superseded by the sweep section above.

### DDBG — independent investigation event contracts (historical lane report)

Branch: `plans/ea-w2-debug-20261104`. Base: `be4766513f` (fetched origin/main). Initial VM memory check: available 16 GiB. Round 2 preflight: available 18 GiB, root disk 119 GB free. Current implementation: `d77cc98f8f7ae9594efd876bc7e02f733319a085`. Round 3 preflight: available 14 GiB, root disk 109 GB free. Native execution: NOT_RUN. No admission record, event-registry append, Decision Log edit, governance reseal, main push, landing lock, mailbox message or subagent.

### Per-row outcomes

| Event | Owner unit | Outcome / self-grade |
|---|---|---|
| `debug.investigation.context_item_added` | CV-570 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.context_item_state_changed` | CV-571 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.exported` | CV-572 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.imported` | CV-573 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.instrumentation_state_changed` | CV-574 | HELD_FOR_JARED; 8 PASS, 3 PARTIAL, membership ABSENT; no positive transition claim |
| `debug.investigation.started` | CV-575 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.state_changed` | CV-578 | blocked on Jared; CONFLICT |
| `debug.investigation.target_bound` | CV-576 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.verification_recorded` | CV-577 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |

Seven rows are prepared. Instrumentation retains structurally closed draft work and conditional technical bindings under CV-574; it is not prepared. Each prepared row owns its exact producer, closed 1.0.0 payload, Project scope and identity recipe, first-receipt ordering, transient reader, source proof, custody, replay, compatibility and withdrawal text. Shared prerequisite definitions do not stand in for an individual adoption. `state_changed` has no schema or fixture: CV-578 records only its unanswered owner conflict.

### Newly authored bindings and search evidence

For each prepared suffix N, CV-570..577 newly author `owner.debug.investigation.N@1.0.0`, `reader.debug.investigation.N@1.0.0`, `consumer.debug.investigation.N.context@1.0.0` and `consumer.debug.investigation.N.artifacts@1.0.0`. Their role is the exact handler and operating consumer named in that family's unit. The identity is independently specified for each family: SHA-256 of RFC 8785 [exact event type, actual project_id, investigation_id, original operation_id], prefixed `debug:` / `evt_debug_`. `operation_id` is frozen by the original operation before append, never regenerated on retry. `target_bound.target_bindings` is a newly authored closed ref/hash/revision join to the existing target owner record, not a new target identity model.

Each family reuses SP-286/CV-339 full-value v2 first-receipt custody, including DL-270/SP-347, and SP-278's generic index projector/key/schema and atomic frontier CAS. No new family projector or durable checkpoint is invented. Each exact reader has `none_required` family checkpoint because its result and cursor are ephemeral, rebuilt over the complete retained range on every open, and discarded on generation/frontier change. Its source proof is still SP-278; only the nine-field token is durable-eligible and no live snapshot id is stored. This is a history-read contract, not materialization of the deferred investigation record. No new stored value is owned, so no storage-value registry row is added. The preserved Project edition is explicit; CV-365/366 and SP-349's distinct application edition is neither rewritten nor granted Event Authority by this draft.

The per-family searches ran `git grep -n -F <exact name> origin/main -- Plans` excluding generated shards/index, pipeline audits/migrations/evidence and source-memory ledgers. All other live Plans files were included. Each found Contracts section 3.5/CV-123/124 minima; relevant partial owners also include Chat 11.0A/12.0A, Runtime Artifacts 5A, MiscPlan instrumentation cleanup, Storage debug records, and the deferred `tooling_skill_debug_families` registry inventory. Those surfaces do not supply exact versioned producer/consumer/checkpoint identities, closed event schemas or idempotency formulas for these names. No sibling definition was used. The exact-name output for each family is archived separately; hashes follow.

- **debug.investigation.context_item_added:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.context_item_added.search.txt`, SHA-256 `7dbe04fad0b9fe00d74df2c4a2bb80e2901a6f30b0fcf77cdb786907deb0cf04` (3 matches).
- **debug.investigation.context_item_state_changed:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.context_item_state_changed.search.txt`, SHA-256 `5ffc2e3c2533d017b4349666391769df267f1355c4524db1dafd8c293ba0fe18` (2 matches).
- **debug.investigation.exported:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.exported.search.txt`, SHA-256 `79755833a7d076d489a483d9e91ffad936624a33de92a094fc8cae7160be9202` (5 matches).
- **debug.investigation.imported:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.imported.search.txt`, SHA-256 `a64c07957f8899ad4e8dc73890453478b372344a067e9b707b97ac6a6ae62955` (3 matches).
- **debug.investigation.instrumentation_state_changed:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.instrumentation_state_changed.search.txt`, SHA-256 `79ea15cb4719b42e328a5b346bac1c017a36e11650cac24bde64aa11744e950d` (3 matches).
- **debug.investigation.started:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.started.search.txt`, SHA-256 `01bf00748ca38a2c1b420318e0131224c242f01cd9e7d5a559f32a6ab03e7809` (4 matches).
- **debug.investigation.state_changed:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.state_changed.search.txt`, SHA-256 `032ad8c5c1955f7660da4c86a137b287e184b289428f36ff9518f9dfd4bcc387` (3 matches).
- **debug.investigation.target_bound:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.target_bound.search.txt`, SHA-256 `2cb45ae5b8caabec5da3221670fb43fd4aedbaf5ea87881ea0c914f840beb208` (3 matches).
- **debug.investigation.verification_recorded:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.verification_recorded.search.txt`, SHA-256 `3c67dd15ec0dd7570a4809955400434ca2b78f688b5e0ef4eb733acd55bd8a9d` (3 matches).

### Premise checks and questions

DL-045's current exact-name table still names all nine families; Contracts 3.5 still requires persisted EventRecords with those names. Its bounded technical permission remains applicable. No old retention answer is applied. DL-075 names runtime_artifact histories, which remain separate original bodies/groups here; it does not decide investigation-event lifetime. Case L-3 names operational, authority and Chat-content classes without assigning these exact investigation histories. Consequently all nine retention cells remain `PENDING_RETENTION_DECISION`, including the held row. No TTL, cardinality, deletion or orphan-thread policy is chosen. RT/Jared must assign them.

**Jared question (CV-578):** Chat 11.0A's closed lifecycle lists active, blocked, attention_required, verifying, failed_cleanup, resolved, cancelled and superseded. The same section's deterministic final-state mapping says `failed` pairs with six stop reasons. Is `failed` an additional lifecycle state, or should these six outcomes map to an existing state, and which? Both assertions are current owner text, not a stale survey. Contracts requires state_changed to carry the lifecycle state. No technical identity recipe can adjudicate this user-visible choice. Other rows do not decide it or grant lifecycle authority.

### Shared-file hunks and ids

- **Contracts_V0.md:** insert CV-570..578 at the end of section 3.5, before AuthState; preserve the existing rows and prose.
- **storage-plan.md:** insert SP-570 beside the debug investigation records, before key reconciliation notes. Each prepared family gets its own explicit Storage adoption paragraph.
- **Automated_Testing_System.md:** append ATS-285 at the end of the existing acceptance section.
- **Companions:** standalone payload schema, per-family fixture/oracle cases, and `scripts/pm-debug-investigation-events.py`. No tests/ file or ignore rule changed.
- **Derived files:** regenerated shards only for these three owners and repository PlanUnit indexes. No unedited owner's shard changed.
- **Ids used:** CV-570..578, SP-570, ATS-285. Before minting, scanned all 475 fetched origin refs; no id-block conflict. Evidence `id-scan.json` in the draft directory. No other ids minted; no event family was registered.

### Initial verification (before review fixes)

- Static DDBG schema/identity/refusal oracles: exit 0, top-level PASS, eight separate family cases. Each case checks every missing required field, unknown fields, version, pinned identity, scope/operation substitution, changed-body digest conflict, original custody identity, unregistered/pending-retention/withdrawal refusal. Native transition, receipt crash, source-generation/CAS, evidence permission/deletion and withdrawal/rebuild cases are authored per family and remain NOT_RUN.
- Shard generation: exit 0. Shard check: exit 0, parsed top-level pass. No unrelated owner shards changed.
- Index generation: exit 0, parsed top-level pass. Copied all 15 ignored currentness-edition files and verified each source/destination SHA-256 before generation.
- Index validation: exit 0, parsed top-level pass. Initial validation caught the new CV/SP dependency cycle; removed the Contracts-to-SP edge and reran shard generation, index generation, shard check and index validation, all exit 0. SP-570 depends on the family Contracts units.
- Existing shared-runtime materialization checker: exit 1, `shared_runtime_storage_materialization_stale`. Its script, registry and all source schemas are unchanged against the base; do not apply its unrelated materialization. `shared-runtime-input-diff.txt` is empty.
- `git diff --check`: exit 0. No native or runtime readiness claim.

Checks and this report are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/`. Retention and the two explicit owner holds block admission. Each fix worktree is removed after its final branch push; this branch is not landed.

### Check evidence hashes

- **id-scan.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/id-scan.json`, SHA-256 `d20e64f3be5d8db4acb691f07eb2389673335bfb702c3183e5cef438cb5b78f4`.
- **binding-search.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/binding-search.json`, SHA-256 `9bfbebc6d2fe5e4c26db1736ec08a5e467fe2a66bb0cd12280e8a4d503b8941e`.
- **currentness-sha256.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/currentness-sha256.txt`, SHA-256 `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`.
- **pipeline-exits.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/pipeline-exits.json`, SHA-256 `dc78b2c739175d327097d5dba0e3d257f27b44720878fcd9d3ba88469d1b4290`.
- **static-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/static-check.json`, SHA-256 `3c6de024814406fb0ac0fb21cc9ea08e13f4624d0054173f358310d191b097e1`.
- **shard-generate.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shard-generate.txt`, SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- **shard-check.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shard-check.txt`, SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- **index-generate.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/index-generate.txt`, SHA-256 `1a7ab1721398926651b3e0b7dc04716a44c92671efaf19e0a21b29a0c4a8dcc9`.
- **index-validate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/index-validate.json`, SHA-256 `020570393b20489bfdb40e482f7ae7de92a175d45f9f898d20517a508cb696ee`.
- **shared-runtime-check.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shared-runtime-check.txt`, SHA-256 `979a75cb0dbc609ddcbecd4c5e3b0f95ff6cad592869415a92af69a31f066ec7`.
- **shared-runtime-input-diff.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shared-runtime-input-diff.txt`, SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### Review round 1: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW.md` (Sol 6.1 max, NOT_READY, 7 families pass as prepared). Fixes by the stream E lead.

1. **Blocking, fixed in `5271b83e9e`.** `debug.investigation.started` accepted any string for `requested_mode_overlay` and `effective_mode_overlay`, and its positive fixture used `scrubbed`/`scrubbed`/`ask`. `Plans/debug_investigation_event_payloads.schema.json` `#/$defs/started` now closes both fields to the enum in `Plans/assistant-chat-design.md` ("Canonical enum closure", line 2669) and adds two if/then rules from section 1.0B/1.0C: requested `debug` implies effective `debug`; effective `debug` resolves to `regular` or `yolo`, never `ask` or `plan`. The fixture carries `debug`/`debug`/`regular`. `scripts/pm-debug-investigation-events.py` adds six forbidden-tuple negative cases (unknown overlay twice, requested debug with effective plan, debug+ask twice, debug+plan) and two legal-tuple positives (`debug`/`debug`/`yolo`; `none`/`none`/`ask`). Verify: the checker prints PASS at this head; with the previous schema restored it prints FAIL on exactly the six new cases. Self-grade: `closed_payload_schema` and `positive_negative_oracles` for `started` stay PASS with the review's downgrade and this fix recorded.
2. **Note, unchanged.** `debug.investigation.state_changed` stays held for Jared ('failed' as a lifecycle state, or which existing state receives the six outcomes); the review confirms the hold is genuine.
3. **Note, unchanged.** Retention (`PENDING_RETENTION_DECISION`) and admission remain explicit gates.
4. **Note, unchanged.** The shared-runtime materialization failure is pre-existing on `main`.


### Review round 2: findings and responses

Astra final review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW-astra.md`, SHA-256 `e1f08f009621a741afd72e78b87c611e71b0f913f14b3f25979ee6b0e1184672`, reviewed head `5e7faf3870cab5105491541978deca20d046224f`. Implementation commit: `1ace7c32935eee55e147a98a05bbca8091707b0c`. The report/self-grade follow-up records the resulting grades against that exact implementation tree. No finding is disputed.

1. **B1 — fixed (1ace7c3293).** Where: `Plans/debug_investigation_event_payloads.schema.json:379`, `Plans/Contracts_V0.md:2217`, `scripts/pm-debug-investigation-events.py:107`. Cause: round 1 encoded Debug alone. Fix: all seven normalized requested/effective overlays and all four runtimes are bound to Assistant Chat 1.0A/1.0B/1.0C, its enum closure/UI table, and Run_Modes' requested/effective owner projection (`Plans/Run_Modes.md:1714`). Plan/Deep Plan retain their overlay and require runtime `plan`; Debug/Interview/BrainStorm/Crew require `regular` or explicit-opt-in `yolo`; Ask requires `none`. Normalized overlays agree. `none/none/plan` remains lawful for the non-primary runtime entrypoint explicitly permitted at Run_Modes:1716. That round used an exhaustive tuple oracle; Astra 2 found its universal restriction unsupported, and round 3 removes it. The two review counterexamples are explicit fixture negatives at `Plans/debug_investigation_event_fixtures.json:558` and `:568`; previous Debug negatives remain. Verify: targeted checker PASS; substituting the round-1 schema makes the full checker FAIL.
2. **B2 — fixed (1ace7c3293).** Where: `scripts/pm-debug-investigation-events.py:14`, `Plans/Contracts_V0.md:2225`, fixture `:578`. Cause: changing the identity preimage tested key separation without proving a Project join. Fix: compare payload, envelope projection, actual owner record, case Project, investigation identity, optional thread/run, and encoded scope partition. The exact payload-only `project_id=other-project` negative preserves the case Project and expected identities, returns `project_scope_mismatch`, and models zero appends. Separate envelope/owner/investigation/thread/run negatives also run through the same gate. Verify: mutating only the shipped started payload Project makes the full checker FAIL; disabling the join check also fails its negative oracles.
3. **B3 — fixed (1ace7c3293).** Where: unchanged canonical no-op owner rule `Plans/Contracts_V0.md:1699`, fixture `:182`, `scripts/pm-debug-investigation-events.py:137`. Cause: active/active was accepted as the positive transition. Fix: positive is active-to-revoked; an equal-state candidate is schema-valid but returns `no_op`, with zero modeled appends and no receipt. Its native zero-append obligation is authored and NOT_RUN. Verify: restoring the equal-state positive or disabling no-op rejection makes the full checker FAIL.
4. **B4 — stopped for Jared (1ace7c3293 records the hold).** Where: `Plans/Contracts_V0.md:2070`, `Plans/storage-plan.md:1106`, `Plans/Automated_Testing_System.md:7239`, schema `:282`, fixture `:449`. Cause: the old manifest-equality wording did not define a source field, domain, or transition predicate. Current-source search covered every tracked live non-pipeline Plans file (`git grep` excluding shards/index/audits/migration/evidence/ledgers/locks). MiscPlan:1333/6085 requires but does not supply collector transitions; MiscPlan:6427 names `collector_state`/`cleanup_result`; Storage:1049 names manifest `scope`/`state`/`cleanup_outcome`; Runtime Artifacts:189 requires lifecycle/cleanup evidence; feature-list:35 names `planned`, `active`, `collecting`, `cleanup_pending`, `cleaned`, `cleanup_failed` without a mapping or legal edges. No source closes `rollback_state`. Fix: preserve the structural draft and conditional technical bindings; remove preparation/positive-transition claims and refuse all candidates as `instrumentation_mapping_unresolved`. Both the old `scrubbed` labels and the review's invented labels are zero-append negatives. The self-grade keeps transitions/oracles PARTIAL. Verify: falsely marking the family prepared or bypassing its hold makes the full checker FAIL.

   **Exact question:** Which exact source fields and closed value domains map to instrumentation_state_changed.scope_kind, state and rollback_state, and which previous-to-next transitions (including cleanup failure, retry and supersession) emit an event versus no event?
5. **Stale self-grade evidence — fixed in the report/self-grade follow-up.** All 152 evidence quotations now resolve at the edited source bytes, including schema `$id` lines `started:563`, `target_bound:635`, `verification_recorded:683`. Every normative file hash is refreshed; the assessed commit is the implementation SHA above, avoiding a self-referential report-commit hash. Reviewer before-grades are preserved per cell, including all five downgrades; repaired cells are re-graded from current evidence. Verify: `round2-evidence-validation.json` reports PASS, 152 quotes, zero mismatches.
6. **Lifecycle hold — preserved.** `debug.investigation.state_changed` stays unprepared under CV-578 (`Plans/Contracts_V0.md:2587`), with no schema or positive fixture. The exact existing question remains whether `failed` joins the closed lifecycle or which existing state receives the six failed outcomes. This fix selects neither answer.
7. **Retention/admission — preserved.** Every family's `PENDING_RETENTION_DECISION` and absent registry membership remain. No registry, admission, Decision Log, Spec Lock, governance evidence, auto-decision row or frozen validator changed. The product-answer and individual-admission gates still apply.

### Standing checks and bounded scope

Every structural candidate, including held instrumentation, now has a `projector_replay_only` negative and current append/retry refusal `replay_only_not_appendable`. All Project positives carry `scope_partition=project~cDE` (the exact unpadded base64url of `p1`); raw `p1` partitions refuse. The raw owning Project ID remains `p1` in identity preimages. No application writer or application key is introduced, so CV-366 application key formatting is inapplicable. Each exact CV-570..577 unit individually adopts the current 16 KiB inline/SP-337 payload-reference boundary; the schema-valid oversized verification body is refused inline. Native pack/reference durability is expressly NOT_RUN, not modeled as a successful write. Removing all native oracle declarations now fails the checker, addressing the review's optional hardening note.

No new PlanUnit IDs, producer/consumer identities, family projectors or checkpoints were minted. The only new held-candidate refusal token is `instrumentation_mapping_unresolved`; it is a technical fence on an unanswered question, not a lifecycle policy. Existing cleanup, restore-point, residue visibility, retention, custody and permission obligations remain. No native readiness, admission or governance seal is claimed.

### Family grades before and after

Before is Astra's independent grade, not the branch's earlier overstatement. P=PASS, p=PARTIAL, A=ABSENT, C=CONFLICT.

| Family suffix | Before | After | Current outcome |
|---|---|---|---|
| context_item_added | 10P / 1p / 1A | unchanged | prepared |
| context_item_state_changed | 9P / 2p / 1A | 10P / 1p / 1A | prepared |
| exported | 10P / 1p / 1A | unchanged | prepared |
| imported | 10P / 1p / 1A | unchanged | prepared |
| instrumentation_state_changed | 8P / 3p / 1A | unchanged grades; hold now explicit | held for Jared |
| started | 8P / 3p / 1A | 10P / 1p / 1A | prepared |
| target_bound | 10P / 1p / 1A | unchanged | prepared |
| verification_recorded | 10P / 1p / 1A | unchanged | prepared |
| state_changed | 0P / 2p / 8A / 2C | unchanged | held for Jared |

Original eight rows: **75P / 13p / 8A -> 78P / 10p / 8A**. All nine: **75P / 15p / 16A / 2C -> 78P / 12p / 16A / 2C**. Preparation verdict: **5 of 8 pass -> 7 prepared pass, 2 explicit holds across the nine-row lane**. Native execution stays NOT_RUN. IDs remain **CV-570..578, SP-570, ATS-285**; round 2 mints none.

### Round-2 verification

| Check | Exit | Parsed result |
|---|---:|---|
| `python3 -B scripts/pm-debug-investigation-events.py` | 0 | PASS; seven prepared, instrumentation held |
| Full-checker mutation probes | 0 | PASS; 13 probes, 12 injected defects detected |
| Shard generation | 0 | pass |
| Index generation | 0 | pass |
| Shard verification | 0 | pass; only the three edited owner shard directories change |
| Index validation, after final generation | 0 | top-level pass; no failures |
| Self-grade quote/hash validation | 0 | PASS; 152 quotes |
| `git diff --check` | 0 | clean |

The ignored currentness edition was copied and all 15 file SHA-256s matched before index generation. Only CV-570..577 prose additions, SP-570's hold adoption, ATS-285, standalone companions/checker, their derived shards/indexes, and this report/self-grade changed. No test file, unrelated owner shard, registry or governance artifact changed. Aggregate landing checks and native tests were not run by this fix worker.

Round-2 evidence files below are retained; report and self-grade copies overwrite the draft delivery paths. Worktree cleanup follows the final successful branch push.

- **round2-pipeline-exits.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-pipeline-exits.json`, SHA-256 `48bcfe9b9fdd46a30e43f48cef618b00dd3c6712bc572946340212e5b0039da2`.
- **round2-static-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-static-check.json`, SHA-256 `e9bd97b0905f6d15967d12cddc15c35b6bf242d0a0e458d87a29c3b89247cff4`.
- **round2-regression-probes.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-regression-probes.json`, SHA-256 `06069576f02c55d7314a5ac4e9ae8428a8af4493abde5181a98522056570e092`.
- **round2-shard-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-shard-generate.json`, SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- **round2-shard-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-shard-check.json`, SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- **round2-index-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-index-generate.json`, SHA-256 `378a6e93edc253c618d38f08e54a66b4be589134094fb67313d802881c4b2b9c`.
- **round2-index-validate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-index-validate.json`, SHA-256 `fe832becb1df9b2758b5a0cb18f03f79cd44d1b900b830e9b77a39ceffb0ef9d`.
- **round2-evidence-validation.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-evidence-validation.json`, SHA-256 `4aa52895fc32a46935501d61b99ac00c3400c91465ff9be0e0081b51f4bb2969`.


### Review round 3: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW-astra-2.md`, reviewed head `6c3ab9856f65eb95682aee4d6736d0c4776c02cf`. Implementation commit: `d77cc98f8f7ae9594efd876bc7e02f733319a085`. Final allowed fix round; no finding is disputed. Preflight was 14 GiB available RAM and 109 GB root disk free; the later check was 17 GiB and 126 GB. Sparse detached worktree `/home/sittingmongoose/pm-worktrees/DDBG-fix3` came from `~/src/PuppetMaster`; final delivery removes it after pushing the report/grade follow-up.

1. **B1 — fixed (`d77cc98f8f7ae9594efd876bc7e02f733319a085`).** Where: `Plans/Contracts_V0.md:2217`, payload schema `:379`, checker `:136`, fixture `:1829`. Cause: round 2 treated the scope-specific `run.started` projection and Chat's execution-qualified row as universal workflow restrictions. Fix: CV-575 and the schema retain the exact closed enums, selected Debug's `debug/debug` binding, regular/default and explicit-opt-in YOLO posture, and effective planning's read-only runtime. The cited cases independently cover read-only `crew/crew/plan` (Chat:1925-1929, Run_Modes:496-500), explicit inspect/Plan/Deep Plan/Agent resolution (Chat:2675-2680), standard specialized execution (Chat:178), and approved plan/TODO handoff (Chat:114-120). Approval alone does not clear overlays; explicit Agent invocation does. The family does not require all requested/effective overlays to be equal or classify every enum product. Unspecified structural tuples are not proof of launch authority. The `run.started` projection's scope resolves the cited conflict without choosing a new product restriction. Round 2's universal matrix and legal/forbidden totals are superseded and are not grading evidence. Verify: the full checker accepts a Crew/plan positive; restoring the blanket Crew restriction makes it FAIL. The fixture also refuses missing planning approval and missing explicit YOLO opt-in. No mode-owner document changed.
2. **B2 — fixed (`d77cc98f8f7ae9594efd876bc7e02f733319a085`).** Where: payload schema `:514-518`, fixture `:2076`. Cause: `$` accepted the position before a trailing LF. Fix: `source_sha256` requires both minimum and maximum length 64 alongside its lowercase hex pattern. LF, uppercase, short and nonhex negatives run through the candidate gate. Promoting each to the target-bound positive makes the full checker exit 1/FAIL. Recursive schema inspection found no other identifier `pattern` in this payload companion; all seven families additionally reject trailing LF on their exact encoded partition.
3. **B3 — fixed (`d77cc98f8f7ae9594efd876bc7e02f733319a085`).** Where: checker `:14-20`, `:41-42`, `:94`, each prepared family's `negative_cases`. Cause: rejecting reader-only replay did not enforce the family's selected current policy. Fix: both candidate and hypothetical admitted retry require exactly `dedupe_by_idempotency_key`; `projector_replay_only` retains `replay_only_not_appendable`, and `append_once`/`dedupe_by_event_id` return `writer_policy_mismatch`. Every prepared family has three separate full-checker corrupted-positive runs and authored per-family negative vectors. All 21 runs exit 1/FAIL; no policy failure is merely a diagnostic count.
4. **N1 — holds retained.** CV-574, CV-578 and the instrumentation held fixture compare exactly equal to round 2 (excluding relocated line numbers in evidence). `state_changed` remains absent from schema/fixtures. Neither question is answered. Retention remains `PENDING_RETENTION_DECISION` and admission remains absent.
5. **N2 — derived verification passed.** Only Contracts and Automated Testing shards changed in this round; Storage's shard content stayed unchanged. The ignored currentness edition's 15 source/destination hashes match. Shard generation/check and index generation/validation exit 0 with top-level `pass`. Generator-owned index timestamps are regenerated; this report makes no literal byte-equality claim for those timestamps. No unrelated owner shard or governance artifact was edited.

### Standing checks, every prepared family

**P = pass. F = fixed in `d77cc98f8f7ae9594efd876bc7e02f733319a085`.** All cells refer to static full-checker evidence; no cell claims native execution. Each negative below is executed in `scripts/pm-debug-investigation-standing-checks.py`, which creates and removes a bounded disposable tree and verifies both nonzero exit and the checker's top-level FAIL with a diagnostic naming the tested family. It never mutates repository fixtures during the run.

| Family (`debug.investigation.`) | C1 replay | C2 app key | C3 partition | C4 size | C5 LF | C6 semantic body | C7 checkpoint | C8 exit |
|---|---|---|---|---|---|---|---|---|
| context_item_added | F | P (app refused) | P | P (valid oversized) | P (partition; no payload pattern) | F | P (transient) | P |
| context_item_state_changed | F | P (app refused) | P | P (bounded shape) | P (partition; no payload pattern) | F | P (transient) | P |
| exported | F | P (app refused) | P | P (invalid oversized scalar) | P (partition; no payload pattern) | F | P (transient) | P |
| imported | F | P (app refused) | P | P (bounded shape) | P (partition; no payload pattern) | F | P (transient) | P |
| started | F | P (app refused) | P | P (valid oversized) | P (partition; no payload pattern) | F | P (transient) | P |
| target_bound | F | P (app refused) | P | P (invalid oversized scalar) | F (hash) | F | P (transient) | P |
| verification_recorded | F | P (app refused) | P | P (valid oversized) | P (partition; no payload pattern) | F | P (transient) | P |

| Check | Negative that catches the defect, repeated for each prepared family | Whole-checker result |
|---|---|---|
| C1 | Substitute `projector_replay_only`, then `append_once`, then `dedupe_by_event_id` in the positive. Candidate and admitted retry policy checks both run. | 21 runs, exit 1/FAIL. |
| C2 | Substitute `scope_kind=application`, `project_id=null`, partition `app`; this Project-only edition cannot accept an application writer/key. CV-366 is not replaced with a local app recipe. | Seven runs, exit 1/FAIL. |
| C3 | Substitute raw `p1` for `project~cDE` (base64url-unpadded UTF-8 `p1`). | Seven runs, exit 1/FAIL. |
| C4 | Promote a schema-valid encoded body above 16 KiB for context-added, started and verification; for the other four promote an overlong scalar above 16 KiB, refused by the closed schema. | Seven runs, exit 1/FAIL. No external-body success/custody simulation is claimed; SP-337 native durability remains NOT_RUN. Export/count and revision integer domains are not tightened by this fix. |
| C5 | Append LF to each exact encoded partition; for target binding also append LF to the 64-character hash and try uppercase, short and nonhex hashes. | Eleven runs, exit 1/FAIL. Only target_bound has a payload identifier regex; its exact-length guard fixes the actual defect. |
| C6 | Corrupt the semantic digest implementation to include each Storage-assigned field, then to hash payload only; also corrupt a retry oracle to claim Storage metadata causes a changed semantic digest. | Five negative runs per family, exit 1/FAIL. Three metadata-only positive mutations per family correctly remain exit 0/PASS. |
| C7 | Give the transient-reader fixture a durable family checkpoint with a different partition, event type and source generation instead of `none_required`. | Seven runs, exit 1/FAIL. There is no family checkpoint positive/storage identity to reconcile. Shared SP-278 source/CAS identity verification stays native NOT_RUN. |
| C8 | Corrupt the positive schema version; separately add a no-mutation success candidate as a supposed zero-append negative with expected refusal null. | Fourteen runs, exit 1/FAIL; success is never credited as a failure oracle. |

C6 now uses the exact caller semantic field set from Contracts EventRecord: envelope identity/causality/account refs/time/producer sequence/key/schema/redaction/migration fields plus event type, payload and payload_ref. It excludes `sequence_id`, `observed_at_utc`, and `persisted_at_utc`. Field-selection probes distinguish digest changes from complete append adjudication: changing a key/scope is not claimed to be an admissible same-identity retry. These bounded JSON vectors are not native RFC 8785, full-envelope admission, payload-pack, receipt or checkpoint execution evidence.

The final runner reports **134 probes: 110 expected rejection runs, 24 expected successful runs, zero failures**. This includes both baselines and two independent B1 regressions. `python3 -B scripts/pm-debug-investigation-events.py` returns exit 0/PASS; `python3 -B scripts/pm-debug-investigation-standing-checks.py` returns exit 0/PASS. No standing cell is newly open in the static contract/oracle scope. Native obligations remain authored and NOT_RUN.

### Round-3 re-grade and delivery

The before column is Astra 2's independent grade, including all ten downgrades, not round 2's optimistic self-grade. P/p/A/C means PASS/PARTIAL/ABSENT/CONFLICT.

| Family suffix | Before P/p/A/C | After P/p/A/C | Outcome |
|---|---|---|---|
| context_item_added | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| context_item_state_changed | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| exported | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| imported | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| started | 7/2/1/2 | 10/1/1/0 | Prepared without admission |
| target_bound | 8/3/1/0 | 10/1/1/0 | Prepared without admission |
| verification_recorded | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| instrumentation_state_changed | 8/3/1/0 | 8/3/1/0 | Existing hold |
| state_changed | 0/2/8/2 | 0/2/8/2 | Existing hold |

Totals: **68P/20p/16A/4C -> 78P/12p/16A/2C**. Prepared verdict: **0/7 -> 7/7 (self-grade)**; independent re-review is not claimed. Seven membership cells remain ABSENT and retention remains PARTIAL. The assessment pins the implementation commit and refreshes every current source/checker hash and quotation location.

The latest fetched `origin/main` at preflight was `16acf7594a3fe8559af89491b895f440b314b99e`; Chat, Run_Modes, MiscPlan, feature-list and Runtime Artifacts blobs match the reviewed lane, so the relevant current owner premises remain unchanged. The rejected premise was round 2's universal application of the scope-specific `run.started` projection. No historical retention answer is newly applied. Existing technical bindings remain those listed above; no new producer, consumer, checkpoint, product mode, persisted field or event family is introduced. `mode_resolution`, `mode_cases`, `retry_cases` and `family_checkpoint` are static fixture projections/assertions only.

Round-3 shared-file hunks are restricted to **CV-575** and **ATS-285**. The standalone payload schema, fixtures, checker and new full-checker regression runner accompany them. IDs used remain **CV-570..578, SP-570, ATS-285**; round 3 mints none. No admission, registry append, Decision Log, retention answer, governance reseal, main push, test-file edit or subagent. Aggregate landing checks are reserved for integration and were not run.

Workflow deviation: before reading the fix brief's no-mail clause, the worker ran read-only mailbox inbox/who queries. No mailbox messages were sent and no further mailbox calls ran after that clause was read.

Reports, self-grade and final check outputs are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/`; final evidence paths and SHA-256 hashes follow.

- **round3-currentness-sha256.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-currentness-sha256.json`, SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.
- **round3-static-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-static-check.json`, SHA-256 `723acf9abcc32f7d28932b8849809cf0c4f6eb2167b7c8f41d9126c619baf693`.
- **round3-standing-checks.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-standing-checks.json`, SHA-256 `5e4fb649fb7064af5743648a9fd96e2e87bec4f3adda2bf5ef03809d9b844e17`.
- **round3-shard-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-shard-generate.json`, SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- **round3-shard-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-shard-check.json`, SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- **round3-index-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-index-generate.json`, SHA-256 `4a63a5a0aa95c5bd332fd72190e5d808c1a2a3e21fb01bb618b654ee01539740`.
- **round3-index-validate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-index-validate.json`, SHA-256 `3bcb1c7a7a32cc580ad7157c2af5eb956682b173460ca1e1184753d7de5d8432`.
- **round3-evidence-validation.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-evidence-validation.json`, SHA-256 `9adeb4e4f5e7636c6f91fcd774494f29285746aa5906bf39a75fa13ce81a293b`.
- **round3-pipeline-exits.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-pipeline-exits.json`, SHA-256 `36af54b0837b4c7b39ca69de23e8e88c35e7925a11277459b44cc75fa3d7dbe9`.
