# C4 corrections — independent review of `plans/c4-corrections-20260917`

I am an Opus 5 agent. I did not write this branch and made no edit to it. The worktree
`~/pm-worktrees/c4-corrections-20260917` was read-only throughout; every regeneration and probe ran under
`~/PM-Experiments/jj-review-20260916/c4/` or my scratchpad, and I ran no git command that changes state. The only
files my runs produced in the worktree are `__pycache__` byte-code, which `.gitignore:117` covers.

Reviewed: twelve commits on `a6162b559b`, which is current `origin/main` and the confirmed merge-base;
fast-forwardable. 52 files: `Plans/**`, `reports/**`, one `scripts/` file, two `tests/` files and one `.gitignore`
line. Nothing outside those trees, no `Spec_Lock`, no `auto_decisions`, no `.evidence/`, no `sharding_config`, no
plan graph, no `Concepts/`, no secrets.

---

## Findings

### Blocking

None.

### Should fix

None.

### Note

**N1. The materialization-order rule enforces relative order but not the presence of a dependency step.**
`scripts/pm-new-contracts-verify.py`, `jujutsu_closure_publishes_a_head_before_its_dependencies`. I probed the rule
against four orders. It correctly rejects `[dependency_objects, activation_markers, operation_heads]`,
`[activation_markers, dependency_objects, operation_heads]` and `[operation_heads, dependency_objects,
activation_markers]`. But `["operation_heads", "activation_markers"]` — an order that declares no dependency step at
all — passes both the schema (`minItems: 2` is satisfied) and the gate, because with `dependency_positions` empty the
first condition is vacuously false and the `elif` only checks that activation markers are last. JJI-008's criterion
says "Dependency objects are transferred and persisted before any head ... that refers to them", which a record naming
no dependency step arguably does not satisfy either. If the owner means the step to be mandatory, one
`"contains": {"const": "dependency_objects"}` on `materialization_order` closes it in the schema, where it belongs.
Narrow, and no fixture or positive depends on the current behaviour.

**N2. The three unenforced obligations name the ledger but not their question ids.** The markers are properly placed —
`Plans/Jujutsu_Integration.md:149` and `:164` put them in the *acceptance criteria themselves* ("an owner obligation
with no validator surface in this landing; it is recorded in the ledger as an open question"), and `:306` and `:624`
repeat them in JJI-006's and JJI-008's `validation_surfaces`. That is stronger than the F107 precedent, which marked
the gap in `validation_surfaces` only. What is missing is one step of followability: the text names
`pldg-20260917-001-jujutsu-continuation4-corrections` but not `q-008`, `q-009` or `q-010`, so a reader matches by
description rather than by id. Consistent with house practice; naming the id would cost four words.

**N3. DL-058's verbatim quote is a truthful prefix, not the whole utterance.** It quotes "I agree with all 7 of your
recommendations. You can do all the next steps." The answers file continues "You can use Opus 5 max for your strong
model." The dropped clause is about experiment tooling, not canon, and the file is cited by SHA-256 `544654e5…` which
I verified, so nothing is misrepresented — but a quote introduced as "verbatim" that stops early would be exact with
an ellipsis. DL-056 and DL-057 quote their card answer whole.

**N4. The new gate branch reads a file; the previous one did not.** `jujutsu_admitted_action_ids()` loads
`Plans/jujutsu_integration_contracts.schema.json` under `lru_cache(maxsize=1)` to build the admitted action-id set.
The `source_control` branch's docstring promised "no ambient file, network, or runtime state"; this one says "no
ambient file, network, or runtime state is consulted beyond the owner schema's own closed vocabularies", so the author
flagged the difference rather than letting it pass. It is the right trade: the alternative is restating thirty-one
command ids plus the owner routes in the script, where they would drift. Recording it because it is a real change in
the branch's purity property, not because it is wrong.

**N5. `graph_states` still admits a five-element list that omits `divergent`.** `prefixItems` has six entries and
`items: false`, but there is no `minItems`, so an array that stops at `remote_bookmarks` validates. That is the
pattern every frozen list in `final_gui_interaction_contracts.schema.json` already uses — `source_control_sections`,
`git_visual_semantics.groups` and the rest all lack `minItems` — so the branch inherited it rather than introducing
it, and the five-element list was equally omittable before. The positive fixture carries all six and the new negative
`jujutsu_graph_states_divergent_position_is_exact` pins position six by rejecting `diverged`. Pre-existing pattern,
recorded for completeness.

**N6. The receipts cite the Part 1 record's prose twin but not its machine twin.**
`evidence-receipts.json` names `ADJUDICATION_PART1.md` with SHA-256 `d6b09e54…`, which I verified, but not
`adjudication-part1.json` beside it, which is the structured form I actually read the seventeen records from. Both are
covered by the directory's own `SHA256SUMS`. A one-line addition; nothing is unverifiable without it.

---

## What I verified

### The thirteen corrections against their adjudicated promises

I read all seventeen records in `~/PM-Experiments/c4-candidates-20260917/adjudication-part1.json` — thirteen to land,
one covered, one rejected, two reclassified — and matched each landed one to its canon edit. Every one names an
existing promise and repairs the contradiction that made it unfalsifiable, and the repairs stay inside that.

The strongest evidence that no capability was added is structural: **not one new root record was minted.** Both edited
schemas' root `oneOf` lists are unchanged. Nine new `$defs` appear, and every one is a component consumed by a record
that already existed — `native_toolchain_identity`, `jj_certified_scenario`, `gc_fence_path_coverage`,
`native_read_pinning`, `store_pointer_resolution`, `store_resolution_environment`,
`native_store_entry_classification`, `closure_expansion`, `closure_expansion_blocker`. Every enum change is purely
additive with nothing removed: `disabled_reason_code` and `error_code` each gain exactly the two codes the answers
authorized (`change_divergent_ambiguous_target`, `interactive_editor_session_required`),
`source_control_command_disabled_reason` gains exactly `conflict_surface_read_only_on_jujutsu`, and `node_state` gains
`divergent`.

Spot-checking the sharpest ones against their records: record 4's `store_pointer_resolution` pins
`objects_info_alternates` to `object_database` and `git_commondir` to `git_directory`, which is precisely the
contradiction the record named ("a single-base implementation resolves the wrong store while satisfying every shipped
fixture"), and JJI-008's new criterion says so in the same words. Record 8's `native_store_entry_classification`
forbids `machine_local` and `ephemeral` from being restored as active state and forbids `unrecognized` from carrying a
source trace, which is the narrowed landing Jared's fourth answer directed — three obligations now, the enumerated
list as `q-008`. Record 13's `closure_expansion_blocker` carries exactly the four blockers the record said existed
only in the unrelated ToDo graph contract: `missing_parent`, `malformed_id`, `self_parent`, `parent_cycle`. Record 7's
`native_read_pinning` turns an `x-` prose string into three fields (`load_mode` const `pinned_operation`, a pinned
operation id, `ignore_working_copy` const true).

**Currentness holds.** The bundle's `currentness-before-edit.json` lists fourteen cited files; I hashed every one
against `a6162b559b` and all fourteen match. It records 46 line references checked, 17 drifted and **0 with changed
text**, attributing the drift to F106, DL-052 to DL-054 and the Source Control passage moving from 308 to 313 — and
its coverage check against F106 to F109 and DL-051 to DL-054 concludes none of the thirteen was already covered. I
confirmed the one covered candidate, `C4D-03`, against `Plans/Source_Control_System.md:313`.

### Schema conditionals, fixtures, and no regression

**350 fixture cases across the two edited packs, 0 bad.** Every positive validates and is semantically clean; every
negative fails at its intended locus, and every semantic negative is structurally valid and returns only its own rule.

**No pre-existing negative changed the constraint that rejects it.** I recomputed the failing schema path of all 182
pre-existing structural negatives under the base schemas and the branch schemas. Twenty differ — and all twenty differ
*only* in the `allOf` ordinal, because new conditionals were inserted ahead of existing ones
(`allOf/2/then/properties/workspace_map_result/enum` → `allOf/5/then/properties/workspace_map_result/enum`). After
normalising the ordinal, **zero of the 182 differ.** The keyword and property at the end of every path are identical.

### The `integrity_verification_level` promotion

Behaviour-identical, and *necessary* rather than cosmetic. The new `$def` carries the five-value enum
character-for-character. Two inline copies became `$ref`s; I enumerated every occurrence of the key in both trees and
those two are the only ones that changed.

The third occurrence was correctly left alone: `backup_receipt/allOf/4/if/properties/integrity_verification_level`
is a **subset** enum of four values omitting `not_run`, used as a discriminator that gates
`verification_receipt_ref`. Replacing it with the `$ref` would have widened the condition to include `not_run` and
changed behaviour. That is exactly the mistake a mechanical "promote and replace all occurrences" refactor makes, and
the author avoided it.

The promotion had to happen because `backup_jj_restore_verification_receipt.object_verification_depth` `$ref`s it
across schemas by absolute `$id` — you cannot `$ref` an inline subschema. The gate passing at 1047/3420 proves the
cross-schema reference resolves in the offline registry.

### The four semantic rules and their tests

The `scripts/` change is one import, four module constants, two functions and one dispatch line. **Nothing else in
that file and no other file under `scripts/` is in the diff**, which is the boundary DL-058 authorizes. Exactly four
rule codes exist, one per authorized record:

| rule | record | negative fixture |
| --- | --- | --- |
| `jujutsu_pointer_resolution_incomplete_for_layout` | 4/5 (pointer chain) | `backup_jj_colocated_layout_resolves_its_whole_pointer_chain` |
| `jujutsu_operation_heads_changed_during_read_only_verification` | 7 | `backup_jj_read_only_verification_leaves_the_operation_heads_alone` |
| `jujutsu_closure_publishes_a_head_before_its_dependencies` | 13 | `backup_jj_closure_persists_dependencies_before_it_publishes_a_head` |
| `jujutsu_recovery_action_not_in_canonical_inventory` | 11 | `command_availability_recovery_floor_names_commands_that_exist` |

Each negative is structurally valid against the schema and returns only its own rule — proven by the gate's own
`semantic_rule` machinery, which fails a case that is malformed instead of semantically wrong, and separately by my
probe. The recovery-floor rule derives its admitted set from the owner schema's own `command_id` enum plus its
declared `x-puppet-master-owner-routes`, rather than restating identifiers. `tests/test_pm_jujutsu_closure_semantics.py`
adds 13 tests, `tests/test_pm_source_control_effects.py` gains coverage to 13, and both pass — the 26 the author
claims. All 38 tests across the three source-control and Jujutsu test modules pass.

### The three Decision Log entries

All three are in both sections, in DL-043's shape — question, why it came up, numbered options, the answer, what it
buys and costs, the planning-only boundary, `SourceRef`, `ContractRef` — in plain language with no lead IDs in the
body. Numbering is right: `DL-055` was taken mid-branch, so the cards took `DL-056` and `DL-057` and the shape answers
`DL-058`, and the bundle explains the non-chronological order rather than leaving it odd.

Both card answers quote Jared verbatim ("Do you recommendations for the choices.") — reproduced as written rather than
tidied — and cite `C4_DECISION_CARDS_20260917.html` with SHA-256 `af57d582…`, which I verified, with the
agent-relayed caveat. DL-058 cites `C4_CANDIDATE_ANSWERS_20260917.md` with `544654e5…`, also verified. See N3 on the
prefix quote.

DL-056 lands what the brief describes: merge editors scoped read-only or built-in on Jujutsu, `merge_editor_available`
defined in SCS-015 as one thing owned by Source Control, the typed reason `conflict_surface_read_only_on_jujutsu`, and
the save-back cluster deferred rather than declined. DL-057 lands the bookmark disclosure on the confirmation record —
`confirmation` gains `disclosed_remote_scope` and `disclosed_remote_identity_refs`, both required, with three
conditionals binding the list to the scope.

### Ledger, questions, and the two things not landed

The ledger validates with 13 atoms, 13 decisions, 13 corrections, 10 questions and 5 events, and fails only on the
three pre-existing governance-coverage errors with zero warnings — as do both 2026-09-16 ledgers, unchanged. Its
compile queue carries 14 rows: eleven correction rows, because records 3+6 share one version-identity block and 4+5
share one pointer vocabulary exactly as the README says, plus three decision rows.

`q-001` to `q-005` are answered citing the answers file by hash with the relay caveat; `q-006` and `q-007` cite the
card by hash with the caveat; `q-008` to `q-010` are open, which is why they carry neither.

**`C4D-02`**: `reports/jujutsu-research-2026-09-11/continuation4/adjudication/` is **not in the diff**. The landed
artifact still carries the superseded reading and the bundle README carries the correction of record, naming the
disagreement, the two-to-one outcome and the fact that the artifact is deliberately unedited. That is the instructed
handling.

**Record 9 and `UNIX_EPOCH`**: every occurrence in the branch is a withdrawal or a prohibition. SCS-014's new
criterion stands entirely on writer-path lock coverage — the three paths each `covered`/`uncovered`/`unknown` with
evidence, an empty enumeration rejected, `partial` when a known path is uncovered — and contains no recency or
op-store-GC claim. The ledger atom carries "Do not cite the withdrawn UNIX_EPOCH op-store GC claim as support for this
rule" as a negative constraint, the operating capsule repeats it, and the commit message states the withdrawal.
**No acceptance criterion, receipt or ledger record cites the withdrawn claim.**

### Derived files, integrity and hygiene

I regenerated shards and index from a fresh copy of the branch tip: **all 2,677 shards and both JSONL indexes are
byte-identical**, and the four remaining `.plan_index` files differ only in timestamps (zero non-timestamp diff lines
each). Index changes are confined to the three edited documents — 96 changed and 3 added PlanUnits (`DL-056`,
`DL-057`, `DL-058`), 418 changed and 34 added acceptance units, **nothing removed and nothing foreign**. The only
`Plans/_shards/` directory touched is `decision_log`, the one edited document that is a sharding source, and those
shards travel in the same commit as the `Decision_Log.md` edit.

Every one of the twelve commits carries the required co-author line. Every commit that edits an owner document also
carries its six regenerated index files; the final commit is a reports-only bundle completion and correctly carries
none. The ledger-registration commit is where the owner units gain their `source_lineage` back-references, which is
the only point at which the atom ids exist. `.gitignore` gains `!/tests/test_pm_jujutsu_closure_semantics.py`, so the
new test file is tracked by the repository's own convention. No secrets; the absolute paths added are evidence and
answer citations under `/mnt/Cursor/PM-Experiments`, `~/PM-Experiments` and `/mnt/Cursor/PuppetMaster-Evidence`, each
carrying a hash.

### Validators, all reproduced

| validator | author's number | mine |
| --- | --- | --- |
| `pm-new-contracts-verify.py` | 1047 / 3420 | pass, 0 findings, **1047 / 3420** (baseline 1041 / 3379) |
| `pm-shard-plans.py --check` | 98 docs, 2677 shards | pass, 0 failures |
| `pm-plan-index.py validate` | 6656 units | pass, **6656** PlanUnits, 25906 acceptance units, 0 failures |
| named tests | 26 | 13 + 13 = **26** on the two touched files; 38 across all three modules |
| all three ledgers | three pre-existing errors only | fail, 0 warnings, the same three errors each |

---

## Verdict

**Land.**

Thirteen corrections, each tied to a named promise and a reproducible contradiction, landed without minting a single
new root record and without removing a single enum value. The two places this kind of wave usually goes wrong, it did
not: the `integrity_verification_level` promotion left the one occurrence that would have changed behaviour alone, and
the twenty apparent failure-path changes are ordinal shifts with the rejecting constraint identical in every case. The
semantic gate stops exactly at the four authorized rules, each proven by a structurally valid negative through the
gate's own machinery rather than by assertion. The three unenforced obligations are written into the acceptance
criteria where a reader meets them, not buried. `C4D-02`'s supersession is recorded without touching the landed
artifact, and the withdrawn `UNIX_EPOCH` leg appears in this branch only as a withdrawal and a prohibition — the wave
carries a correction whose own supporting argument was pruned, and says so.

Nothing is required before landing. Six notes are worth a glance whenever these files are next open: **N1** a
`contains` on `materialization_order` if the dependency step is meant to be mandatory; **N2** naming `q-008` to
`q-010` in the canon text that already marks them; **N3** an ellipsis on DL-058's quote; **N6** adding the Part 1
JSON twin to the receipts. **N4** and **N5** need no change — they record a property that shifted and a pattern that
was inherited.

---

## Commands run

| command | result |
| --- | --- |
| `git fetch`; `git log a6162b559b..origin/plans/c4-corrections-20260917`; `git merge-base` | twelve commits, base is current `origin/main`, fast-forwardable |
| `python3` read of `adjudication-part1.json` records_detail | seventeen records: 13 to land, 1 covered, 1 rejected, 2 reclassified; promise, contradiction, currentness and landing note per record |
| `git diff --name-only` with scope, governance, `_shards`, `scripts` and `Concepts` greps | nothing outside Plans/reports/scripts/tests/.gitignore; one scripts file; only `_shards/decision_log` |
| `python3` structural diff of both edited schemas | 9 added `$defs`, 11 changed, 0 removed, **no new root `oneOf` branch**; every enum change additive |
| `python3` enumeration of every `integrity_verification_level` site, old vs new | two inline→`$ref` (identical enum), the subset-enum discriminator correctly untouched, one `$def` added |
| `git diff -- scripts/pm-new-contracts-verify.py` | one import, four constants, two functions, one dispatch line; four rule codes |
| `probe.py` over all 350 fixture cases in the two packs | 350 total, **0 bad** |
| `probe.py` filtered to the four semantic negatives | each structurally valid, each returning only its own rule |
| failure-path regression over 182 pre-existing structural negatives, raw then with `allOf` ordinals normalised | 20 differ raw, **0 differ normalised** |
| authored probe of four `materialization_order` permutations | three violations caught; the dependency-free order passes (finding N1) |
| `python3 scripts/pm-new-contracts-verify.py` | pass, 0 findings, 1047 / 3420 |
| `pm-shard-plans.py --check`; `pm-plan-index.py validate` | pass 98/2677; pass 6656 units / 25906 acceptance units |
| `python3 -m unittest` on the three source-control and Jujutsu test modules | 13 + 13 + 12 = 38, OK |
| `pm-bootstrap-ledger-validate.py` on all three 2026-09-1x ledgers | each fail, 0 warnings, the same three pre-existing errors |
| `cp -a` fresh copy + regenerate shards and index | 2677 shards and both JSONL byte-identical; four JSON files timestamp-only |
| index scope diff `a6162b559b` → tip | 3 PlanUnits and 34 acceptance units added, all in the three edited docs, none removed, none foreign |
| `sha256sum` of the card, the answers file and `ADJUDICATION_PART1.md` vs the cited hashes | all three match |
| `python3` verification of `currentness-before-edit.json` against base | 14 of 14 files match; 46 line refs checked, 17 drifted, 0 text changed |
| `python3` read of all ten ledger questions | q-001..q-005 answers-hash + caveat; q-006/q-007 card-hash + caveat; q-008..q-010 open |
| `grep` for `UNIX_EPOCH`, `q-008`/`q-009`/`q-010`, `no validator surface` across Plans and the bundle | every UNIX_EPOCH mention is a withdrawal or prohibition; obligations marked at four places |
| `git diff-tree` per commit for co-author line, source and index files | all twelve carry the line; derived files travel with their source edit |
| secrets and absolute-path scan over added lines | no secrets; paths are hashed evidence citations |
