# F110 landing bundle - 2026-09-16

Branch `plans/jj-f110-20260916`, based on `b0977cd8518145dea45bc242dc5f221b5e62f141`, the `main` that
already carries the continuation 3 corrections. Nothing here is landed on `main`; the branch stops for
an independent review.

`verification.json` is the machine record. `canonical-outputs.json` carries the SHA-256 of every file
the branch changed. This bundle is a result record, not canon.

## What is in the branch

**Two Decision Log entries.** `DL-050` was the highest number on the base commit, so the answers are
`DL-051` and `DL-052`, each written in both sections of `Plans/Decision_Log.md`.

`DL-051` records the answer to research finding F110, verbatim: "Add the picker as described,
evidence-gated." It is an optional capability accepted for planning. It grants no change to the default
object format, no cross-format migration, and no promise that SHA-256 is universally supported, because
the proposal itself excluded all three.

`DL-052` records the answer to the parent-bound question the corrections landing left open, verbatim:
"for the parent referenced bound, lets do 32 then the ability to fetch the rest."

**The picker, planned under its owners.** `SCS-022` in `Plans/Source_Control_System.md` owns the setup
surface: where the choice appears, what a disabled choice says, what an existing repository shows, and
what cancelling leaves behind. `JJI-021` and `JJI-022` in `Plans/Jujutsu_Integration.md` own the typed
new-repository request extension and the owner-held format evidence with its certified engine, library,
transport and provider profiles. The existing requirement for exact engine, command-line and
repository-format qualification with truthful unsupported states is a prerequisite; it is referenced,
not restated.

Two typed records carry the capability in `Plans/source_control_contracts.schema.json`, with six
positive and thirteen negative fixtures: `new_repository_object_format_selection` and
`repository_object_format_profile`. No command, handler, event or request meaning is admitted, and the
Jujutsu request enum stays at exactly 31. `SCS-018` admission still gates anything runnable. The
planning lineage is the new ledger `pldg-20260916-002-jujutsu-object-format-picker`, registered as
compiled.

**The two SCS-017 relations are now gate-enforced.** The authorized `source_control_contracts` branch in
`contract_semantic_failures` inside `scripts/pm-new-contracts-verify.py` evaluates the count arithmetic
and the in-page `node_ref` rule that JSON Schema cannot express. One authored negative fixture per rule,
each structurally valid against the schema and each returning exactly its own rule, so none can pass by
being malformed. The "unenforced until then" sentence is gone from `SCS-017`, replaced by a statement
naming the branch that enforces the rules.

The `node_ref` rule is enforced exactly as `SCS-017` states it: two nodes on one page cannot share a
`node_ref` while carrying different `revision_ref` values. Two rows that repeat a `node_ref` and agree
on `revision_ref` are not rejected, because the owner criterion does not forbid that case. The gate is
deliberately not stricter than canon, and a test records the boundary.

Nothing else under `scripts/` was touched. The named test file
`tests/test_pm_source_control_effects.py` was already tracked, so it was extended rather than replaced,
and no `.gitignore` exception was needed.

**The parent bound is the owner's 32.** `parent_refs` is capped at 32 per node. A node with more parents
sets `parent_refs_truncated` and carries a non-null `parent_expansion_cursor_ref`; a node that is not
truncated carries a null one. Both conditions are typed, not prose. The remaining parents are fetched by
`source_graph_parent_expansion_request`, a bounded read fenced exactly as page continuation is: the same
repository, workspace, backend, selected revision and projection identity, the same projection
generation, at most 32 references per request, and admitted only while the projection is current. The
two parent-bound fixtures move from 600 and 601 to 32 and 33 and drop "provisional" from their names.
`q-001` is closed in `pldg-20260916-001-jujutsu-continuation-corrections` with the answer, and `q-002`
is recorded there as implemented.

**The earlier landing bundle now names the landed hashes.**
`reports/jujutsu-research-2026-09-11/continuation3-landing/verification.json` gains `landed_commits`
naming `fdddacea20` and `b0977cd851`. The reviewed branch `plans/jj-corrections-20260916` and reviewed
commit `b83abd9396` are kept exactly as they were, labelled as what was reviewed; both are now deleted
refs because the branch was rebased over two unrelated commits before it landed.

## Results

| check | result |
| --- | --- |
| `python3 scripts/pm-new-contracts-verify.py` before the branch | pass, 0 findings, 1033 positive / 3353 negative |
| `python3 scripts/pm-new-contracts-verify.py` after the semantic branch alone | pass, 0 findings, 1033 positive / 3356 negative |
| `python3 scripts/pm-new-contracts-verify.py` at the branch tip | pass, 0 findings, 1041 positive / 3377 negative |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 98 docs, 2676 shards |
| `python3 scripts/pm-plan-index.py validate` | pass, 6649 PlanUnits, 25844 acceptance units |
| `python3 -m unittest tests.test_pm_source_control_effects tests.test_pm_source_control_response` | pass, 24 tests |
| `pm-bootstrap-ledger-validate.py` on both 2026-09-16 ledgers | fail on three pre-existing governance-coverage omissions and nothing else |

The ledger validator's three errors say that `Plans/Jujutsu_Integration.md` and
`Plans/Source_Control_System.md` are missing from `sharding_config` sources, `Spec_Lock` coverage and
`plan_graph` coverage. They were already failing that way before this branch, the branch changed none of
those three artifacts, and the designated Plans agent owns that coverage and any reseal.

## Claim boundary

Static schema, fixture, shard, index and ledger integrity only. No governance seal, no runtime or native
certification, no engine-version certification, no command admission, no readiness claim. The owner
answers recorded here were relayed by the reviewer and are not verifiable from inside this repository.
