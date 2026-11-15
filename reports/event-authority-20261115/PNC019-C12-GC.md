# PNC-019 C12-GC (lane 17): criterion 12 for goal.blocked, goal.completed, goal_run.blocked and goal_run.stopped

**Criterion 12 PARTIAL → PASS for all four families.** Native execution is NOT_RUN and is a separate claim; a planning PASS is never native proof.

- **Branch:** `plans/ea-pnc-c12-gc-20261114`.
  - Base: s3ao head `29169ee19e`, then `git merge --no-ff origin/plans/ea-pnc-s3d-20261114` at `181efe951e`, giving merge `e4d188a35f`. The merge had no conflicts.
  - Lane commits: `010a4eb3e1` (scripts), `977bef3268` (Plans fixtures and ATS-212/213), `2a1ec5ca10` (first bundle) and `37eb6f4f5e` (schema closure tool), which is the assessed tree. The closure bundle commit follows them.
- **Worktree:** `/home/sittingmongoose/pm-worktrees/pnc-c12-gc`, sparse without `Plans/.audits`. It is kept until the lead says the lane has merged.
- **Not done:**
  - no registry, Decision Log, Spec Lock, `.evidence` or `auto_decisions.jsonl` edit;
  - no edit of the gated tool or of the NUMRULE files;
  - no edit of `pm_goal_guard_sweep.py` or `pm_goal_oracle_common.py` (GH1's);
  - no landing lock, no subagents, no browsers.
- **Ids:** none minted (the lane block SP/CV/ATS-3840..3859 is untouched).

## Result

| Family | C12 before | C12 after | Vector after | Rows (tool-proved / justified singletons / open) |
|---|---|---|---|---|
| `goal_run.stopped` | PARTIAL (s3d 11/12) | **PASS** | `P P P P P P P P P P P P` (12/12) | 142 (128 / 14 / 0) |
| `goal_run.blocked` | PARTIAL (s3d 11/12) | **PASS** | `P P P P P P P P P P P P` (12/12) | 150 (136 / 14 / 0) |
| `goal.blocked` | PARTIAL (s3a 9/12) | **PASS** | `P P P p p P P P P P P P` (10/12) | 120 (100 / 20 / 0) |
| `goal.completed` | PARTIAL (s3a 9/12) | **PASS** | `P P P p p P P P P P P P` (10/12) | 173 (149 / 24 / 0) |

- **Grade file:** `reports/event-authority-20261115/PNC019-C12-GC-grades.json`.
  - Verify with `python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261115/PNC019-C12-GC-grades.json`: `pass`, 4 rows, 174 quotes, 21 files.
  - A changed vector fails at `goal_run.stopped: vector`.
- **What was re-graded:** only criterion 12. The other cells are carried from s3a/s3ao (`goal.*`) and s3d (`goal_run.*`) with every quote re-anchored to this tree.
- **Criteria 4 and 5 of goal.blocked/goal.completed** stay PARTIAL on s3a's registered-row basis. They turn at the S5b registry switch, which is not this lane's.

## Gated proof (the tool `004bdedd63`, real vectors)

| Checker | Tables | Tool PASS | NOT_RUN singletons (justified) | Rows | Tool-proved | Max rows/table |
|---|---:|---:|---:|---:|---:|---:|
| DG-OWN-A `pm_goal_own_a_oracles.py` | 76 | 62 | 14 | 150 | 136 | 8 |
| DG-OWN-B `pm_goal_own_b_oracles.py` | 104 | 79 | 25 | 188 | 163 | 8 |
| **Total** | 180 | 141 | 39 | 338 | **299** | 8 |

- **Tool runs:**
  - Tool failures: none. Lane matrix: 0 problems, so every negative given to the tool fails exactly its own row.
  - Every report's `tool_sha256` is `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`, which is `git show 004bdedd63:scripts/pm_guard_isolation.py`.
- **Final run:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-gc/final/`, run on the committed tree at `977bef3268`.
  - Both suites pass in the discovery pass and in the gated pass, and the gated pass reproduces every discovery outcome.
  - Source drift: none. Every source binding equals its HEAD blob.
  - Regenerating the tables left the tree byte-identical.
- **Justified singletons (39):** each is alone in its own table, with a written proof in `scripts/pm_goal_gc_declarations.py` (`JUSTIFIED`).
  - **presence (23):** the next statement dereferences the guarded member, so with the row cut the checker raises.
  - **entailed (13):** an earlier row refuses first on every input that falsifies the row, stated with that row.
  - **typed (2):** the CV-1100 recipe or the RFC8785 projection itself refuses by raising.
  - **branch (1):** `completed/todo_status` is the refusal of its own branch, so no accepted call reaches it; its negative kills.

## Mutation ledger (declared targets, uncapped)

Every negative case of both suites is in `reports/event-authority-20261115/PNC019-C12-GC-ledger.json`, uncapped. Each entry has its declared target (the suite's authored expected refusal), final call, input SHA-256, cut result and restore result.

| Checker | Negative cases | Kill | Duplicate-set kill | Cut refuses later (no credit) | Cut raises (no credit) | Invalid (listed apart) |
|---|---:|---:|---:|---:|---:|---:|
| DG-OWN-A | 717 | 452 | 146 | 98 | 19 | 2 harness-only |
| DG-OWN-B | 1012 | 654 | 115 | 201 | 42 | 0 |

- **What earns credit:**
  - **Kill:** the cut complete checker accepts and the restored checker refuses with the declared code.
  - **Duplicate-set kill:** the joint cut of the row and its declared later sites accepts (`DUPLICATES`: 24 own-A and 44 own-B declarations, each with its evidence). Each later site has its own single-row kill or a justification. These are not counted as single-row kills.
- **Rows by kill type:**
  - Rows with a single-row kill: own-A 116, own-B 121.
  - Rows with only a duplicate-set kill: own-A 20, own-B 43. Each is alone in its table and proved there from its joint-cut vector.
- **Invalid:** the two harness-only cases are `goal_run.*/prepared_row_rejects_unknown_admission`. They are registry-row schema checks in the test body, not complete calls, and earn nothing.
- **Per family:** see `PNC019-C12-GC-core.json` `families.*.outcome_classes`.

## Per-family coverage matrix

`reports/event-authority-20261115/PNC019-C12-GC-coverage.json` has one entry per row reached by each family. Each entry traces owner unit(s) with their heading `path:line` → row → table and tool status → the family's controls → its negative witness → the cut result (accepts, accepts with a declared duplicate set, or the no-credit class) → restoration → duplicate set or justification.

- **Owner units:**
  - goal_run.*: EP-1110..1112, GRS-200/201/202, GRS-1110, SP-426..428, SP-1110..1112, SP-286, SP-1101, SP-337, CV-420/421 and CV-1110.
  - goal.*: GRS-1120..1122, GRS-050, SP-429, SP-1120..1122, SP-1101, SP-286, CV-1120..1122, EP-1120, HITL-1120, PS-1120 and SIR-1120.
- Every family has `open_rows: 0`.

## Number and date-time corpus (through each family's own checker)

| Family | Corpus cases | Boundaries |
|---|---:|---|
| goal_run.stopped / .blocked | 126 / 126 | request and native, cause and Goal revisions; coherent revisions 2^53-1 (published) / 2^53, 2^60, 4,400 digits (`event/producer_representable`); stored `sequence_id` uint64; `occurred_at_utc` (EventRecord); stored observed/persisted (Storage UTC-Z); `acknowledged_at_utc` (EventRecord, E5-2) |
| goal.blocked / .completed | 121 / 242 | source fence epoch; caller captured epoch (every spelling, including 1.0, 2e0 and -0.0); `producer_sequence_id`; `occurred_at_utc`; stored observed/persisted; `acknowledged_at_utc` |

- **Corpus sources:** `Plans/event_number_recipe_corpus.json` `integer` (14) and `datetime` with the default profile (34) cases.
- **Expectations** come from the corpus, the owner schema minimum, and the Storage UTC-Z rule (no offset, upper-case T and Z).
- **Values that cannot exist at rest**, so have no stored witness:
  - a source carrying an integer past 2^53: the source custody's own canonical JCS recipe refuses it at issuance;
  - floats and Decimals: the physical source codec forbids them;
  - a stored `sequence_id` past 2^64-1: the physical codec refuses it.

  These spellings are covered at the live caller-record and request boundaries.
- **Date-time inventory:** NOT_RUN. The repository-wide gate fails closed on `main` (`scan_exclusions_invalid`, TOOL-ISSUES `C12-DC1-DTGATE-ROTATION`), a known infrastructure result. NUMRULE files are untouched.

## Retained reads and store observations

- **Receipt-selected reads:** retained reads select the original only through its independently sealed receipt (issued at the append transaction) and the installed recipe.
  - own-A `inspect`, `pm_goal_own_a_oracles.py:622`; own-B `resolve`/`inspect`, `pm_goal_own_b_oracles.py:535`.
  - Negatives per family and method: missing, ambiguous, bad seal, bad shape, foreign Storage, unknown recipe, malformed catalog, resealed other original and caller recipe override (and disclosure on own-A).
  - On own-B, `retained/current_disclosure` is entailed by `access/disclosure` and justified.
- **Store observations:** 1,087 read calls record the whole store before and after (`final/retained-store-snapshots.json`).
  - 0 reads changed the store.
  - 30 own-B store changes are the declared owner race: `DisclosureHook` withdraws `content_visible` mid-read, and each such read refuses at `access/disclosure`. They are reported apart.

## Distinct-copy joins

Each independently held copy is changed alone and refuses at its own join row:
- **goal_run.*:** 18 and 20 cases. The envelope copy against the payload copy for the requested and effective account, actor, correlation, `occurred_at_utc` and idempotency key; the cause-owner copy against the payload copy for evidence, settlements, block receipt and preserved work; the frame receipt against the first-custody receipt.
- **goal.*:** 13 and 26 cases. The source fence copy against the live owner fence (manual stop, permission, and the writer, root, maintenance, deletion, hold and secret epochs); the caller record against the source for decision, stop epoch, next attempt and Goal revision.

## Schema closure

Every reachable assertion clause of every owner definition that a checker row validates now has a witness or a checked proof. `scripts/pm-goal-gc-schema-closure.py` runs each suite's complete calls and takes their accepted boundary instances as controls. It then closes each definition root through the exact validator object the row used (every keyword, owner formats, shared date-time profiles, CV-1100 current integers, ECMA patterns). The lead's standard is the one DG6A, DCW, DR and DS15 met.

**Classes:**
- **KILLED:** a valid control plus one single-field defect at the clause's own instance location. The definition refuses and reports the clause. With only that clause cut (the validator's own per-keyword disable context) it accepts, and restored it refuses again.
- **COVERED_LATER:** the clause is reported, but with it cut another named clause still refuses. That clause is named in every entry. No kill credit.
- **UNREACHABLE:** a checked proof that no valid instance reaches the clause. Here every such clause is an item clause of an array whose owner node has `maxItems: 0`.
- **VACUOUS:** `minItems`, `minLength` or `minProperties` of 0, which can refuse nothing (checked on the owner node).
- **Listed apart:** clauses inside an `if` (a selector) or a `not` (whose keyword is the assertion). These never refuse on their own; DG6A grants such selectors no scalar credit either.

**Branch controls** reach the branches the fixtures leave unvisited: optional members, array items, anyOf/oneOf alternatives, and forced `if`/`then`/`else` conditions (with the object's other conditionals re-applied and a sibling enum switched when needed). Every branch control is accepted by the whole definition. They are schema-boundary controls only and earn no row or lifecycle credit.

Counts are clause occurrences: each definition root is its own whole-definition row, so a shared definition counts once per root.

| Checker | Roots | KILLED | COVERED_LATER (same node / other node) | UNREACHABLE | VACUOUS | if/not (apart) | **Uncovered** | Branch controls |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| DG-OWN-A | 25 | 1,561 | 359 (339 / 20) | 0 | 0 | 55 | **0** | 449 |
| DG-OWN-B | 54 | 4,006 | 838 (655 / 183) | 12 | 24 | 91 | **0** | 1,966 |

- **Distinct clauses:** DG-OWN-A has 551 KILLED, 103 COVERED_LATER and 19 apart. DG-OWN-B has 1,559 KILLED, 384 COVERED_LATER, 8 UNREACHABLE, 11 VACUOUS and 33 apart.
- **Per family:** every root the family reaches has 0 uncovered (`PNC019-C12-GC-core.json` `families.*.schema_*`).

| Family | Schema clauses KILLED | COVERED_LATER | Uncovered |
|---|---:|---:|---:|
| goal_run.stopped | 1,230 | 330 | 0 |
| goal_run.blocked | 1,236 | 332 | 0 |
| goal.blocked | 1,206 | 258 | 0 |
| goal.completed | 3,075 | 646 | 0 |

- **COVERED_LATER, same node:** mostly a `type` beside an `enum`/`const`; `minLength`/`maxLength` beside a fixed-width hex `pattern`; uint64 bounds beside the CV-1100 storage `type`; `minLength` beside `format: date-time`.
- **COVERED_LATER, other node:** a conditional `then`/`else` restating a base property (for example the Projection `lifecycle_status` branches that select a row-metadata definition), or a sibling union branch.
- **Superseded:** the earlier occurrence census (`pm-goal-gc-clause-coverage.py`, `PNC019-C12-GC-clauses.json`) is replaced by this closure.
- **Files:** `reports/event-authority-20261115/PNC019-C12-GC-schema-closure.json` holds every clause per root with its class. That is the witness (input SHA-256 prefix, edit, control kind), the named later clause, or the proof. The full outputs, with witness paths and branch-control hashes, are `schema-closure-own_a.json` and `schema-closure-own_b.json` in the evidence folder.

## Original suite replays

| Suite | Result |
|---|---|
| DG-OWN-A `pm_goal_own_a_oracles.py` (ATS-1110..1112) | pass, 949 cases (232 positive), 638 resources and 66,219 refs resolved (s3d: 536) |
| DG-OWN-B `pm_goal_own_b_oracles.py` (ATS-1113..1115) | pass, 1,236 cases (s3a: 571) |
| ATS-213 `pm_goal_lifecycle_successor_oracles.py` | pass, 539 cases, 514 negatives |
| ATS-212 `pm_goal_run_stop_block_oracles.py` | all 494 case verdicts match. The private removal audit reports 23 "unrelated negative passed" diagnostics, caused by s3ao's change to `pm_goal_oracle_common.py` (both passed at s3d). This is GH1's module; it is reported with a proposed patch below. |
| ATS-210 `pm_goal_current_writer_oracles.py` (not a GC family) | all 931 case verdicts match; the same s3ao regression gives 106 diagnostics |

## Tool and fixture defects found (real inputs)

1. **Shared `strict_pattern` uses `re.fullmatch` (`pm_goal_oracle_common.py`).**
   - JSON Schema `pattern` is an unanchored ECMA search. Under `not: {pattern: "[\u0000-\u001f]"}`, a DurableToken `checkpoint_key`, `checkpoint_ref` or `index_dataset_name` carrying a trailing LF passed (s3d's F8 clause).
   - GC fix: `pm_goal_gc_adapter.ecma_pattern`, a search with unescaped `$` read as `\Z` outside character classes.
   - Not edited in common; the proposed patch went to GH1 through the lead.
2. **s3ao's union/enum attribution broke the standalone private removal audit.** It affects ATS-212 and ATS-210.
   - Proposed patch: `drafts/PNC019/c12-gc/proposed-common-fixes-for-gh1.patch`, sha256 `a9a3185a3476cd4a424b33b52b1483ba0369a2760fdf38ac8b39553a27627809`.
3. **DG-OWN-B `physical_value` refused through an `except` path outside any row.** It now refuses only through the gated `physical/bytes` row (`pm_goal_own_b_oracles.py:52`).
4. **CV-1100 conflicts in authored expectations (`977bef3268`).**
   - The ATS-212/213 fixtures accepted the identity revisions `3.0` and `3e0`. The four `canonical_revision_*` cases per suite now refuse.
   - The forked-identity cases keep an integer revision, so they stay single-defect negatives.
   - DG-OWN-A's `equivalent_integral_retry` is now `integral_float_retry_refused` (`retry/semantic`).
   - SP-426/427 already require "written as canonical decimal", so this is not a product choice.
5. **DG-OWN-B's writer-side schema self-checks were refusal rows.** They covered values the checker builds itself: method responses, storage wrappers on write, constructed receipts and results. They are now `assert/write/...` output self-checks: still enforced, never guard rows. The input-side rows (stored reads, requests, owner records) keep their rows and got witnesses.

## How the proof works (and what it does not reuse)

The s3ao conformance review (`reviews/PNC019-s3ao-c12-conformance/REVIEW.md`, G1-G6) is the bar. This lane does not use `pm_goal_guard_sweep.py`, its `prove()`, or its tables, and it does not edit `pm_goal_guard_sweep.py` or `pm_goal_oracle_common.py` (GH1 owns them).

- **Complete checkers.** The base checkers are the families' own suites: DG-OWN-A `scripts/pm_goal_own_a_oracles.py` (ATS-1110..1112) for `goal_run.stopped`/`goal_run.blocked`, and DG-OWN-B `scripts/pm_goal_own_b_oracles.py` (ATS-1113..1115) for `goal.blocked`/`goal.completed`. Their entry points are unchanged; every owner predicate (`require`/`need`) is routed through `pm_goal_gc_adapter.gated`.
- **Complete calls.** Each top-level writer, consumer, reader or schema-boundary call is one complete call. Its sealed input is the whole owner store plus the request (DG-OWN-B's stateful Realm is turned into data). The record keeps the ordered observation of every row it evaluated.
- **Declared targets (G4).** A negative's target is the suite's authored expected refusal, never the observed one.
- **Kill rule (G3b).** The final call of each negative is replayed with only its target row cut.
  - **Kill:** the cut complete checker accepts, and the restored checker refuses with the same code.
  - **No credit:** a later refusal or an exception.
  - **Duplicate-set kill:** the joint cut of a declared later site of the same invariant accepts. These are listed apart from kills (`scripts/pm_goal_gc_declarations.py`).
- **Tables.** The generated phase tables are `scripts/pm_goal_gc_table_*.py`.
  - A table holds the rows that exactly the same accepted evaluations reach, in evaluation order, at most 8 rows.
  - Rows without a single-row kill each get their own table.
  - In the gated pass, every decision comes only from these tables (`pm_goal_gc_adapter._predicate`).
- **Gated proof (G3a).** Each table goes to the gated tool `scripts/pm_guard_isolation.py` (pinned `004bdedd63`, sha256 `e8038992…`) with real observation vectors.
  - **Controls:** accepted complete calls.
  - **Negatives:** the accepted cut runs, in which every other row of the phase was computed on the defective input and held.
  - The lane matrix requires each negative to fail exactly its own row. Credit is copied from the tool's report.
- **Number corpus (G6).** The shared corpus runs through each family's own complete checker:
  - `Plans/event_number_recipe_corpus.json` `integer` cases, plus coherent arbitrary-precision revisions and Storage `sequence_id` uint64 slots;
  - the `datetime` cases at `occurred_at_utc` (EventRecord profile), at stored `observed_at_utc`/`persisted_at_utc` (Storage UTC-Z), and at `acknowledged_at_utc` (EventRecord, E5-2).
- **Retained reads.** Retained reads select the original only through its independently sealed receipt and installed recipe (`pm_goal_retained`). A read that refuses keeps the whole store; every read records the store before and after.
- **Joins.** Each independently held copy is changed alone and refuses at its own join row.
- **Schema keywords (G2).** The packages' schema checks are whole-definition rows, each the shared validator over the whole owner definition with every keyword. `scripts/pm-goal-gc-schema-closure.py` closes every reachable assertion clause per definition root (see "Schema closure").

## s3ao parts relied on

- `scripts/pm_goal_retained.py` (`Owner.authenticated_original`, `resolve`, `binding`, `seal`): the sealed-receipt selector.
- `scripts/pm_goal_oracle_common.py`, read-only:
  - `CurrentValidator` (CV-1100 current integers);
  - `owned_properties` and `timestamp_roles` (shared date-time profiles; E5-2);
  - `FORMATS`, `runtime_schema`, `_keyword_guard`, `schema_registry` and `schema_type_inventory`;
  - `current_integer_number`, `current_revision_text`, `same_json_value`, `semantic_digest`, `canonical`.
- `scripts/pm_event_numbers.py` and `scripts/pm_event_datetime.py`: the shared number and date-time calls.
- Not used: `pm_goal_guard_sweep.py`, `pm_goal_guard_tables.py`, the s3ao tables, witnesses, mutation judge and joint proof.

## Plans and governance

- **Plans edits:** `Plans/goal_lifecycle_successor_fixtures.json` and `Plans/goal_run_stop_block_oracle_fixtures.json` only. No Plans `.md` changed, so no shard or index regeneration.
- **Governance:** neither file is hashed in `Plans/Spec_Lock.json` or `Plans/.evidence`; the plan index cites them by path only.
- **Not run:** the landing check, run-gates and audit-governance belong to landing.

## New test files

None. Nothing was added under `tests/`, and `.gitignore` is untouched.

## Commands

All were run from the worktree under `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`, each after a check for at least 12 GiB available. The long runs used `long-job`.
- `python3 scripts/pm-goal-gc-guard-tables.py --generate --out <evidence>/final`: exit 0, 13 min 18 s.
- `python3 scripts/pm-goal-gc-schema-closure.py --source own_a --out <evidence>/schema-closure-own_a.json` (10 min) and `--source own_b --out <evidence>/schema-closure-own_b.json` (18 min): exit 0.
- `python3 scripts/pm-goal-gc-report.py --run <evidence>/final --closure <evidence>/schema-closure-own_a.json --closure <evidence>/schema-closure-own_b.json`: exit 0.
- `python3 scripts/pm-goal-gc-grades.py --commit 37eb6f4f5e9e2a6c0850454bfaa68770f9588a06`, then `python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261115/PNC019-C12-GC-grades.json`: pass, 4 rows, 174 quotes, 21 files.
- `python3 scripts/pm_goal_own_a_oracles.py`, `pm_goal_own_b_oracles.py`, `pm_goal_lifecycle_successor_oracles.py`: exit 0. `pm_goal_run_stop_block_oracles.py` and `pm_goal_current_writer_oracles.py`: exit 1, from the private-audit diagnostics only.

## Evidence

- **Folder:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-gc/`, with `SHA256SUMS` over every file.
- **Contents:** `final/`, the tool reports `tables/*.json.gz`, the calls, sealed inputs, ledger, store snapshots and summary; plus `schema-closure-own_a.json` and `schema-closure-own_b.json`. The superseded `clause-coverage.json` and the pre-justification `run5/` are kept for the record.
- **Compact bundle:** `reports/event-authority-20261115/PNC019-C12-GC-{core,coverage,ledger,schema-closure,grades}.json`. This report is also at `reports/event-authority-20261115/PNC019-C12-GC.md`.

## For Jared

Nothing new to decide.
