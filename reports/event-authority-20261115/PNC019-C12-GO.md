# C12-GO: criterion-12 closure for goal.created, restore_point.deleted and run.started (lane 18)

**Result: goal.created and run.started C12 PASS; restore_point.deleted C12 PARTIAL.** Every family's coverage matrix has 0 OPEN rows, and the gated proof, the fabricated-row negative, the number corpus and the retained reads pass. restore_point.deleted leaves **12,601 distinct schema clauses UNCOVERED**: 12,529 were never searched, because two frozen roots exceed any feasible closure budget (G2); 60 were searched without a witness; 12 raise inside the tool. Native execution stays NOT_RUN. The repository-wide date-time inventory is NOT_RUN: this base predates S1's T198 refresh, and no NUMRULE file was edited.

- **Branch:** `plans/ea-pnc-c12-go-20261114`, base GH1's finished branch `origin/plans/ea-pnc-c12-gh1-20261114` at `47d500b75d`. Worktree `~/pm-worktrees/pnc-c12-go` (sparse, no `Plans/.audits`).
- **Commits:** `7cd02c8b91`, `808e0ab7d0` (runner, goal.created boundaries, declared targets, witness search, number corpus, retained reads); `900661094d` (569 generated phase tables and manifest; the gated proof ran on these); `2c1d42c72e` (run.started supplement, declared presence/typed/duplicate-set justifications); `72167de325` to `5f1f1829f2` (16 commits on the schema-closure tool, listed under Defects); the results commit that adds this report.
- **Unchanged:** the gated tool 004bdedd63 (`scripts/pm_guard_isolation.py`, sha256 `e8038992…`), `scripts/pm_goal_guard_sweep.py`, `scripts/pm_goal_oracle_common.py`, GH1's manifest `scripts/pm_goal_guard_rows.json` and its 868 `pm_goal_phase_*` tables, `pm_goal_c12_{targets,witnesses,numbers}.py`, every s3ao source in GH1's ten-source run, NUMRULE files, every `Plans/` file, `.gitignore`, `tests/`. No new SP/CV/ATS/DL ids.

## Grades

| Family | C12 before (s3ao) | C12 after | Matrix CLOSED / CLOSED_BY_PROOF / OPEN | Vector after |
|---|---:|---:|---:|---:|
| `goal.created` | PASS (does not stand) | **PASS** | 136 / 2 / 0 | `P P P P P P P P P P P P` |
| `restore_point.deleted` | PASS (does not stand) | **PARTIAL** | 414 / 23 / 0 | `P P P P P P P P P P P p` |
| `run.started` | PASS (does not stand) | **PASS** | 265 / 13 / 0 | `P P P P P P P P P P P P` |

Only criterion 12 is re-graded; the other eleven cells of each row are carried unchanged from s3ao. s3ao's PASS cells did not stand (`reviews/PNC019-s3ao-c12-conformance/REVIEW.md`: G1–G3, G5, G6 for these three families).

## How GO runs on GH1's machinery without colliding with GH2

`scripts/pm_goal_go_sweep.py` drives GH1's `pm_goal_guard_sweep` functions unchanged (collector, kill judge, co-observation partition, real-vector gated proof, fabricated-row standing negative, ledger summary). It only points the dispatch at GO's own namespace:

- **Manifest** `scripts/pm_goal_go_rows.json`; **tables** `scripts/pm_goal_go_phase_<id>.py` (569 tables, at most 8 rows). GH1's `--replace-generated` deletes only `pm_goal_phase_*`/`pm_goal_table_*`, so GO's tables survive a GH1/GH2 regeneration, and GH1's committed proof still replays (GO edits no file GH1's run imports). Lane GC set the same precedent (`pm_goal_gc_*`).
- **Two passes, two processes:** pass 1 `--generate` (discovery) wrote the tables; pass 2 (a separate capped process) dispatched every decision through the generated phase predicates, re-ran the judge and fed the gated tool the real observation vectors. (The first attempt ran pass 2 as a child inside the same 2 GB scope and was OOM-killed; the passes were then run as separate jobs, identical commands.)
- **Sources:** `pm_goal_go_created`, `pm_goal_go_deleted`, `pm_goal_go_run_started`, `pm_goal_go_shared`.

## What was built, gap by gap

### G5 (goal.created): an executable complete boundary, not four booleans

`scripts/pm_goal_go_created.py`, three complete boundaries over the authored `goal_start` fixtures and every companion they carry:

1. **Original command custody / producer (CV-341, SP-294, GRS-066):** the whole custody wrapper (owner schema, every keyword), then the cross-copy facts: the SP-294 **D identity** (`goal.created.v1:{D}`, `goal.created.command.v1:{D}`, D recomputed from the record and verified on the authored row), the seven SP-294 explicitly-null envelope members and null migration, envelope ← original source (actor, correlation, causation), payload ← record and body commit (goal, project, thread, original action ref, ordered source refs, revision/currentness hashes, objective revision ref, body receipt request and hash), publication ← first receipt, owner result ← record/body commit/publication, outcome digest (sha256 of RFC 8785, verified on the authored row) and logical refs `K#/owner_result`, `K#/creation_receipt`, UI response joins, the three custody digests, CV-1100 at the type-less `const: 1` revision literals, and the **CV-341 order** (source capture, body → first receipt → settlement → response). Every copy is compared with one anchor and changed alone (follower copies change with their anchor), so each join row has a single-row killing witness.
2. **SP-298 passive reader** `storage.goal_created.current_read.v1@1.0.0` over the installed `Plans/goal_created_reader_contracts/` package: request shape; exact resource bytes and lengths for all seven bindings; support-map bindings; role installation (the **supplied support map declares every native role unsupported**, a real `reader_unavailable` negative; positive reads use a TEST_ONLY map identical except for the role bits); authority; SP-278 admission (token, generation/anchor, frontier, dataset, source selection, snapshot, frame sequence under the shared `storage_uint64`, order, value digests over Storage canonical bytes); issued cursor, scope, bound budget, **`stale_cursor`** on every changed generation, frontier, dataset, snapshot, checkpoint, source selection, route contract or installed map; inclusive last-frame revalidation; dispatch on the five route fields; routed payload schema (active v3 and **whole-v2 retained**, a TEST_ONLY v2 original from the owner schema's generator); first-receipt, full-value and body-receipt proofs; observation joins; CV-1100 at the v3 revision literals; response bytes in canonical MessagePack.
3. **SP-298 member resolver** `storage.goal_start_command.resolve_member.v1@1.0.0` (command-members.json): key K, installation, authority, row, wrapper schema, row identity, `member_pending`/`member_unavailable` phases, value presence and the final MemberSuccessV1 reply.

`validate-goal-runtime-event-fixtures` was run on `c7d2d43e17`: **pass** (exit 0). Only the closure tool changed after it.

### G1: a per-family coverage matrix

`scripts/pm_goal_go_matrix.py` writes one row per checker or owner-schema row each family's complete calls evaluate: owner clause (the family's grade-cell citations for the row's concern, plus the owner definition root and its clause closure), predicate (GO phase table, gated status, sites with source text), control, negative (declared attempts by outcome class, best exact witness), cut and restoration, and status. Compact copy `reports/event-authority-20261115/PNC019-C12-GO-coverage.json`.

| Family | Rows | Schema rows | Complete calls | Declared attempts | Exact expected | KILLED | DUP_SET_KILLED | Invalid listed | Distinct-copy joins killed |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `goal.created` | 138 | 15 | 686 | 524 | 524 | 153 | 10 | 0 | 58 |
| `restore_point.deleted` | 437 | 35 | 4807 | 4378 | 924 | 407 | 48 | 3454 | 20 |
| `run.started` | 278 | 37 | 3403 | 3269 | 683 | 335 | 41 | 2586 | 61 |

Open rows:

None.

**CLOSED** = gated tool PASS on real vectors and a KILLED or DUPLICATE_SET_KILLED witness of that family. **CLOSED_BY_PROOF** = a source-bound earlier-clause proof (s3ao's pinned frozen-checker implications, honoured only while every earlier guard is CLOSED in the same family) or a declared justification the run confirms (`scripts/pm_goal_go_declarations.py`, entries in `scripts/pm_goal_go_justifications.json`: **presence** — with the row cut the next checker statement dereferences the guarded member and the run's exact witness raises there, frame and source text recorded by the runner; **typed** — a shared codec or the read postcondition raises; **duplicate_set** — the row only ever refuses inside a declared duplicate set the run killed). None of these earns kill credit.

### G2: schema clause closure (lane GC's standard)

The GO checkers keep whole-definition schema rows (the shared validator over the complete owner definition, every keyword). `scripts/pm_goal_go_schema_closure.py` is lane GC's closure tool (`pm-goal-gc-schema-closure.py` at `c0482747da`), unchanged in its classes, applied to every definition root a GO checker row validates (50 roots: GO's own whole-definition rows and every frozen restore_point.deleted / run.started adoption `Schema` object). GO additions, each marked in the source:
- **Budget and construction:** every validation is counted against the budget (GC charged `repair()` a flat 8); an error-guided branch-control repair, selector flips (single, ancestor and pair switches) when GC's `repair()` cannot build a valid branch control; union-alternative swaps of real controls (the value at an alternative's location replaced by a generated instance of that alternative, then repaired; kept only when the whole definition accepts it); unmodified suite controls get at most 450 of a clause's 900 validations, so branch constructions always run; lone-surrogate pattern and `maxProperties` defects; `contains` operands listed apart like `not` operands; an early stop once a COVERED_LATER witness has had 120 more validations to find a kill.
- **Checked proofs** (each states its premises, read from the walked definition): contradicted branch (an `if` requires a member null that the definition unconditionally requires non-null; or the pins in scope leave a present member of the branch no value), forbidden member (`not: {required: [P]}` unconditionally), case analysis (every value of a required finite selector pins the member away from the `if`), pinned selector (a const/enum pin the reach is always under contradicts the `if`, or makes an `else` never taken), absent location (an ancestor is pinned to values none of which holds the location, e.g. an object pinned `null`), and **COVERED_BY_CONST** (the clause's own location is pinned to one value the clause accepts, so whatever the clause refuses the pin refuses too; no kill credit). A pin applies to a reach when it sits only in union alternatives and branches the reach is also in, or in a branch the reach implies (a conditional whose other branch requires an ancestor of the reach null).
- **Safety rules for the proofs** (standing trials in `--self-test`): no branch proof for a reach whose location is prefix-related to a member the `if` reads, because a single defect there can enter the branch and kill the clause; a clause's own keyword is never its own pin. The earlier GO proof (`cb1be878e0`) broke both (a killable UNREACHABLE and a self-covering COVERED_BY_CONST on the standing trials); no class it produced is carried.
- **Reach walk fixed:** GC's walk keyed a reach's context by (kind, instance depth, index) with no owner node, so a node reached through two different conditionals or unions at the same depth kept only its first reach, and every class that quantifies over a clause's reaches (GC's empty-domain UNREACHABLE and SELECTOR_OR_NEGATED, and GO's proofs) read an incomplete list. A standing trial (`--self-test`) shows the old walk giving a false UNREACHABLE. GO keys contexts by owner node (`eb10b969cf`); every non-witness class in the merged closure was derived by the fixed walk.
- **Carry:** `--carry FILE@COMMIT` copies only witness classes (KILLED, COVERED_LATER: a recorded input and real validations) from earlier reports, with `carried_from` naming the report and the tool commit that produced each, and re-derives every other clause with the current tool. The tool hash is taken at import, so a report names the code that ran.
- **Bounded runs for the two largest frozen roots:** `35d68755` (3,201 clauses, 70 ms per validation) and `51a524bd` (11,747 clauses, 143 ms per validation) need about 56 and 419 hours at GC's 900 validations per clause (neither earlier run finished in 2 h 24 min). They were closed with `--distinct-from` (a clause whose witness, KILLED or COVERED_LATER, is already held by another root of every family of the root is recorded **SEARCHED_ELSEWHERE**, naming that root; the family's distinct count takes that root's class), a lower `--clause-cap` and a wall-clock `--root-seconds`; a clause reached after the wall-clock budget still gets the static classes and proofs and is otherwise UNCOVERED, marked not searched.
- **Operations:** sharding, `--roots`/`--skip-roots`, per-root checkpoints, a merge with per-root provenance, and a seed policy (`authored`: accepted instances of authored complete calls, never search or generated edits; `--seed-cap` raises the per-root count for the closure only, used at 16 for the custody and create-result roots whose ninth authored row was the only one in a branch).

| Family | Roots | KILLED | COVERED_LATER | COVERED_BY_CONST | UNREACHABLE | VACUOUS | if/not/contains (apart) | SEARCHED_ELSEWHERE | UNCOVERED occurrences | Distinct clauses | Distinct UNCOVERED |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `goal.created` | 14 | 1194 | 241 | 6 | 21 | 0 | 44 | 0 | 0 | 1152 | **0** |
| `restore_point.deleted` | 31 | 4562 | 3294 | 49 | 46 | 0 | 556 | 824 | 12613 | 19965 | **12601** |
| `run.started` | 16 | 1042 | 530 | 0 | 0 | 0 | 18 | 0 | 0 | 1314 | **0** |

**Which tool closed each root** (per-root `closure_tool`, matched to the job start times and checked against the hash each report recorded at import):

| Report | Roots | Tool commit | Notes |
|---|---:|---|---|
| `f-main` | 47 | `7c77a0e28f` | every root except c15ebf, 35d68755, 51a524bd; witnesses carried from the earlier reports (each clause names the report and commit that found it) |
| `f-c15ebf` | 1 | `7c77a0e28f` | `frozen:c15ebf…` (restore_point.deleted owner controls); 395 → 54 UNCOVERED once embedded-document refs resolved |
| `f2-small` | 2 | `837c5c9131` | goal_start_command_custody and `frozen:c649…`, with `--seed-cap 16` (custody 6 → 0) |
| `g-35d6`, `g-51a5` | 2 | `5f1f1829f2` | bounded, see below |

The 47 roots in `f-main` have the same clause sets under every walk version used here (checked root by root against the previous run), so the inline-`$id` revert and its restoration (defect 9) do not touch them.

**The two bounded roots** (restore_point.deleted only). `frozen:35d68755…` has 3,201 clauses at 70 ms per validation; `frozen:51a524bd…` has 11,747 clauses at 143 ms. GC's 900 validations per clause would take about 56 and 419 hours. Neither earlier run finished: 59 minutes, then 2 hours 24 minutes. Both were closed with these settings:
- `--distinct-from` the other reports: 412 clauses each are SEARCHED_ELSEWHERE, because another root of the family holds their witness;
- `--clause-cap` 300 and 150;
- `--root-seconds 5400` (90 minutes of search).

Clauses reached after the 90 minutes still got the static classes and proofs and are otherwise UNCOVERED, marked not searched. Result: 35d68755 has KILLED 294, COVERED_LATER 528, UNCOVERED 1,800 (1,782 not searched); 51a524bd has KILLED 129, COVERED_LATER 208, UNCOVERED 10,751 (10,750 not searched). **These 12,529 unsearched clauses are what keeps restore_point.deleted at PARTIAL.** Closing them needs about 475 CPU-hours at GC's budget, or a faster validator for these two frozen roots.

**Searched without a witness (60 distinct clauses).** Each branch is reachable by the schema, but no authored seed is in it, and the constructions (selector flips, error-guided repair, alternative swaps) could not build a valid control:
  - `anonymous/properties/original_B1/properties/result_value/allOf/2/then` (10 clauses)
  - `anonymous/properties/original_B1/properties/result_value/allOf/2/then/properties/result` (12 clauses)
  - `anonymous/properties/original_B1/properties/result_value/properties/result/anyOf/0/oneOf/0` (17 clauses)
  - `anonymous/properties/original_B1/properties/result_value/properties/result/anyOf/0/oneOf/1` (12 clauses)
  - `pm.restore_point.retained_read.v1/properties/creation_result/oneOf/1/properties/value/allOf/0/then` (1 clause)
  - `pm.restore_point.retained_read.v1/properties/creation_result/oneOf/1/properties/value/allOf/3/then` (1 clause)
  - `pm.restore_point.retained_read.v1/properties/creation_result/oneOf/1/properties/value/allOf/4/then` (1 clause)
  - `pm.restore_point_deleted.typed_adapter.v3/properties/authenticated_dispatch/anyOf/0/properties/canonical_result_value/allOf/0/then` (1 clause)
  - `pm.storage_value.restore_point_create_result.v1/$defs/CommandOutcomeRecord/allOf/4/else` (3 clauses)
  - `pm.storage_value.restore_point_create_result.v1/allOf/4/then` (1 clause)
  - `pm.storage_value.restore_point_create_result.v1/allOf/4/then/properties/original_command_outcome` (1 clause)

**Clauses whose search or proof raises (12 more distinct, all in 35d68755):** `PointerToNowhere: /$defs/CommandOutcomeRecord`. The validator resolves an inline `$id` as a new base, and under that base the ref is dangling; no accepted instance reaches it. Each is recorded UNCOVERED with the error:
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/0/else/properties/original_command_outcome` (1 clause)
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/0/then/properties/original_command_outcome` (4 clauses)
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/1/properties/original_command_outcome` (1 clause)
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/1/properties/original_command_outcome/properties/identity` (1 clause)
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/2/then/properties/original_command_outcome` (1 clause)
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/3/then/properties/original_command_outcome` (1 clause)
  - `pm.restore_point.retained_read.v1/allOf/0/else/properties/creation_result/properties/value/allOf/4/then/properties/original_command_outcome` (1 clause)
  - `pm.restore_point.retained_read.v1/properties/creation_result/oneOf/1/properties/value/allOf/3/then/properties/original_command_outcome` (1 clause)
  - `pm.restore_point.retained_read.v1/properties/creation_result/oneOf/1/properties/value/allOf/4/then/properties/original_command_outcome` (1 clause)

The full per-clause report, with every witness's input hash, every proof and every unsearched clause, is `closure/closure-merged.json` in the bundle; the repository copy lists the unsearched clauses per root (`not_searched_wall_clock`).

### G3a: the gated proof on real observation vectors

569 phase tables (max 8 rows), statuses {'PASS': 555, 'NOT_RUN': 14}; 710 rows proved by the gated tool, 12 unproved rows with a source-bound proof, 2 unproved without one. The fabricated-row standing negative passes (pipeline refuses `reviewer/fabricated_guard_no_checker_has_this` as never observed; the gated tool on the host table's real vectors does not prove it). Every tool report's `tool_sha256` is `e8038992…`.

### G3b and G4: declared targets, uncapped ledger, the cut rule

- **Declared before the call** (`scripts/pm_goal_go_declare.py`): authored `rejection` texts resolved to the frozen suites' own refusal labels (literal, or a concatenated label's constant prefix), the pinned banks' `expected_refusal`, source literals, the retained model's first owner check (read from the pinned `fixture_store.py`/`retained_read.py`), static join paths, whole-definition root types. Calls no rule covers stay `undeclared` and earn nothing.
- **Witness search** (`scripts/pm_goal_go_search.py`): for each row with no single-row kill yet, coherent edits (s3ao's Editor v5) of real accepted helper inputs, of run.started-world inputs of the frozen dependency functions, and of whole-checker positives; every attempt is a complete call with the searched row declared first, so it is a ledger entry whatever its outcome. A row whose exact witnesses all refuse later is declared as the duplicate set the joint cuts reach; the judge then requires the joint cut to accept and each site to refuse alone.
- **The frozen bank transferred to run.started:** every pinned frozen-bank defect whose seed function also ran inside run.started adoption calls is replayed on that function's run.started-world input with the bank's declared refusal.
- **Ledger:** 8,326 complete calls over 724 rows, every attempt kept (the ledger is uncapped). Outcomes: control 703, exact_expected 2,131, other_refusal 4,383, accepted 1,083, exception 570, multiple_refusals 4, and undeclared 22 (restore_point.deleted; these earn nothing). Replay results on declared attempts: KILLED 895, DUPLICATE_SET_KILLED 99, COVERED_LATER 640, CUT_EXCEPTION 72. NOT_REPLAYED_CAP 425 comes from GH1's replay cap: at most 4 KILLED and 40 total cut replays per (target, family); every such attempt stays listed. Per family (complete calls / declared attempts / distinct-copy joins killed): goal.created 686 / 524 / 58; restore_point.deleted 4,807 / 4,378 / 20; run.started 3,403 / 3,269 / 61. The run.started supplement (same code and tables) adds 1,459 calls: KILLED 669, DUPLICATE_SET_KILLED 8, COVERED_LATER 201.
- **The 136 restore_point.deleted and 28 run.started rows that failed the cut rule at s3ao** are now each KILLED, DUPLICATE_SET_KILLED or closed by a declared presence/typed justification or s3ao's source-bound implication proof (matrix).

### G6: the shared number corpus through each family's own checker

| Family | Number cases | Agree | Disagree | Crashes | Date-time cases agree |
|---|---:|---:|---:|---:|---:|
| `goal.created` | 430 | 430 | 0 | 0 | 68/68 |
| `restore_point.deleted` | 86 | 86 | 0 | 0 | n/a |
| `run.started` | 173 | 173 | 0 | 0 | n/a |

- **goal.created custody:** goal_revision (payload, body commit, owner result: `const: 1`), accepted_objective_revision, first-receipt sequence_id (four copies), source owner_epoch (two copies); **SP-298 reader:** the matching frame's sequence_id under the shared Storage uint64 admission.
- **run.started consumer:** EventRecord sequence_id (envelope, index, cursor, coverage and index key copies) and producer_sequence_id (nullable; inside the producer digest).
- **restore_point.deleted retained read:** the receipt-selected terminal append receipt sequence_id, held twice (companion and result rows).
- **Expectation fixed before the call** from the corpus case, the owner node at the slot and the shared codecs; every case is a coherent complete original (coupled copies, digests re-derived when the producer could form them). Date-time: the shared corpus' default-profile cases at goal.created `occurred_at_utc` and the first receipt's `acknowledged_at_utc` (EventRecord profile, E5-2), with the CV-341 order as the coupled owner fact.

### Retained reads, store snapshots, original suites

- **SP-1101 retained reads:** the original is selected only through its independently sealed receipt (`pm_goal_retained`); ten declared negatives per family (missing, ambiguous, another original, bad seal, bad shape, wrong original bytes, unknown recipe, foreign store, caller override, access), plus the restore_point.deleted retained model (entry, late, request, snapshot, native recipe, uint64 profile) with whole-store snapshots. Store snapshots: goal.created 11 and run.started 11, all unchanged. restore_point.deleted has 63: 50 unchanged, and 13 changed, each the injected owner race of its declared case (the deleted read harness raises unless a store change is that case's race).
- **Five pinned external suites:** 144 pinned files re-hashed on `c7d2d43e17`, byte-identical to s3ao's `final-pin-check.json`; the pinned regression programs (`scripts/pm_goal_frozen_regressions.py`): PASS, 6/6, frozen bytes unchanged.
- **Self-tests:** on `c7d2d43e17`, the GH1 judge standing trials pass (12) and `pm_event_numbers.py --self-test --scope numbers` passes. The closure tool's standing trials (`--self-test`, 12 cases) pass on the final tool `5f1f1829f2`. After `c7d2d43e17` only `scripts/pm_goal_go_schema_closure.py` changed, and the other tests do not import it.

## Defects found and fixed (oracle tooling; no product decision)

| # | Where | Why it broke | Fix |
|---|---|---|---|
| 1 | s3ao `pm_goal_complete_oracles.run_joins` | its payload and producer digests raise on an event the producer could not digest (GH1 defect class 6); its `{sequence_id:020d}` index key crashes on a 4,400-digit sequence | GO-local total copy (same row names) in `pm_goal_go_run_started.py`; the consumer boundary checks the shared Storage uint64 sequence before any key is formed |
| 2 | s3ao run.started `extra_joins` witnesses | 10 of them are refused by the copies' own owner schemas once the consumer boundary checks every copy (the payload's allOf/oneOf ties requested/effective mode and overlay, strategy and reason) | kept as declared invalid attempts; GO adds schema-valid witnesses by enumerating every coupled assignment both owner schemas accept, declaring the inherently paired joins as duplicate sets |
| 3 | s3ao goal.created adapter | four whole-schema booleans; request/result schemas had only `None` negatives; no joins, reader or member boundary | `pm_goal_go_created.py` (G5 above) |
| 4 | lane GC's closure tool | `repair()` was charged a flat 8 validations however many it ran, so large roots stalled past any budget | every validation counted (GO copy) |
| 5 | lane GC's closure tool `walk()` | a reach's context key `(kind, depth, index)` omits the owner node, so same-depth conditionals/unions collapse to one reach; proofs over "every reach" read an incomplete list (standing trial: false UNREACHABLE) | contexts keyed by owner node, pins scoped to branches the reach also takes, `--self-test`; every non-witness class re-derived; reported to the lead for lane GC |
| 6 | GO closure tool (own) | it hashed its own file when a run ended, so a run recorded the version on disk then, not the code it ran | hash taken at import; merges name each report's tool commit explicitly (matched to job start times) |
| 7 | GO closure proofs (own, `cb1be878e0`) | a pin could be the clause itself (self-covering COVERED_BY_CONST), and a branch proof ignored that a defect at the selector enters the branch (killable UNREACHABLE) | self-pin exclusion and selector-clash rule (`49ead46f0d`), standing trials; every non-witness class re-derived by the final tool |
| 8 | GO closure construction (own) | suite controls that never enter a branch used a clause's whole 900-validation cap, so branch constructions never ran (`construction_attempts` 0) | suite share 450; union-alternative swaps |
| 9 | GO closure construction (own) | `error_repair()` generated missing members, and `holds()` evaluated conditions, with the root validator's resolver, so a `$ref` inside an embedded document (`#/$defs/Id` under its own `$id`) pointed into the root and raised; the caller swallowed it and the branch construction failed silently (the owner-controls `deleted` branch: c15ebf went from 395 to 54 UNCOVERED once fixed) | the walk records the resolver of every node, with an inline `$id` as a new base exactly as the Draft 2020-12 owner validators resolve (`7c77a0e28f`; briefly reverted in `c7d2d43e17` and restored in `5f1f1829f2`); a clause whose search or proof raises is recorded UNCOVERED with the error (root `35d68755` holds a ref that is dangling under the validator's own resolution and that no accepted instance reaches); standing trials for both document cases |

## Observations for owners (not decisions)

- **Type-less integer literals:** goal.created v3 payload `goal_revision` / `accepted_objective_revision`, BodyCommit and SucceededResult `goal_revision` are `const: 1` with no `type`, so JSON-Schema numeric equality alone accepts `1.0`. GO applies CV-1100's shared current-integer call there (`goal.created/current_integers`, `goal.created/reader/route/current_integers`).
- **Sequence bounds:** EventRecord, the event_record_index value and the run-started checkpoint give `sequence_id` minimum 0 and no maximum; the uint64 bound is Storage's (SP-236). The index key recipe `{sequence_id:020d}` presumes it, so GO's consumer boundary applies the shared `storage_uint64` call.
- **SP-298 support map:** every native role is `unsupported`, so the real installation answers `reader_unavailable`; GO's positive reads use a TEST_ONLY installation map.

## New test files

None. Nothing was added under `tests/`; `.gitignore` is unchanged. GO reads s3ao's three existing `tests/fixtures/pnc019_goal_*_helper_witnesses.json` banks unchanged.

## Evidence and replay

Bundle `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-go/` (`SHA256SUMS` pins every file):
- `run/`: pass 1 collection and ledger; `run/proof/`: pass 2 and the gated proof (collection, uncapped ledger, invalid mutations, mutations, signatures, family rows, source bindings with no drift, fabricated-row self-test, tables summary and rows, `gated-reports.tar.gz`).
- `supplement/`: the declared run.started supplement (same code and tables).
- `closure/`: closure reports per group and the merged closure.
- `coverage-matrix.json`, `selftests/` (the first run and `selftests/final/`: judge, numbers, goal runtime fixtures, frozen regressions, pin check, closure standing trials), `tools/`, and `closure/searched-uncovered.json` (the 72 searched or erroring clauses).

Repository files: `reports/event-authority-20261115/PNC019-C12-GO-{core,coverage,schema-closure,grades}.json` and `PNC019-C12-GO.md` (this report).

Replay (12 GB free first, then the 2 GB no-swap scope, as long-jobs):
```sh
python3 -B scripts/pm_goal_go_sweep.py --generate --out RUN            # pass 1: tables (byte-identical to the committed ones)
python3 -B scripts/pm_goal_go_sweep.py --out RUN/proof                  # pass 2: judge + gated proof
python3 -B scripts/pm_goal_go_sweep.py --source pm_goal_go_supplement --out SUP
python3 -B scripts/pm_goal_go_schema_closure.py --self-test
python3 -B scripts/pm_goal_go_schema_closure.py --roots ... --seeds authored --budget 20000 --per-clause 900 --out C_i.json   # groups
python3 -B scripts/pm_goal_go_schema_closure.py --roots|--skip-roots ... --seeds authored --budget 20000 --per-clause 900 --carry C_i.json@COMMIT ... --out F_j.json
python3 -B scripts/pm_goal_go_schema_closure.py --merge F_1.json@COMMIT ... --out closure.json
python3 -B scripts/pm_goal_go_matrix.py RUN/proof --closure closure.json --extra-ledger SUP/ledger.json.gz --out matrix.json
python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261115/PNC019-C12-GO-grades.json
```

## For Jared

- **Nothing to decide.** No new product choice came up.
- **restore_point.deleted stays C12 PARTIAL** on schema clause closure only (matrix 0 OPEN). Two frozen definitions, 35d68755 and 51a524bd, are too large for GC's closure budget on this VM (about 475 CPU-hours). The 72 searched or erroring clauses are listed above.
- **One finding for lane GC** (mailed to the lead): GC's closure walk collapses reaches of the same node through different conditionals at the same depth. Its proof-based classes (empty-domain UNREACHABLE, SELECTOR_OR_NEGATED) may need the same recheck; witness classes are unaffected.
- **Memory rule:** one heavy command (the custody/c649 closure rerun) started with 11 GB available, below the 12 GB rule; it completed within its 2 GB scope.
