# Storage owner closeout, 2026-09-24

STATUS: in progress. Task 1(a) committed and pushed (`c21befb8e9`, `af4d1737b6`); Task 1(b) under way.

Branch `plans/storage-owner-closeout-20260924`, sparse worktree `~/pm-worktrees/storage-owner-closeout-20260924` (`Plans scripts reports tests .claude`). Not landed.

Scope, on Jared's authorization relayed by the coordinator (Jared approved the coordinator deciding these on his behalf):
1. The two Storage owner questions left open by `reports/storage-registry-repairs-20260923/REPORT.md` (review findings R-02 and R-05): the `whole_wrapper_sha256` preimage on the three SP-310 stored-profile union members, and `redb_snapshot_id` inside the persisted SP-278 read token.
2. The two stale census tests: `tests/test_shared_runtime_storage_contracts.py` (84 families) and `tests/test_pm_onboarding_phases.py` (88 row bytes).
3. Two rule-file sentences Jared requested for `AGENTS.md` and `.claude/CLAUDE.md`.

Coordinator addition to Task 3 (received 2026-09-24, explicitly requested by Jared): a third sentence in "How to land on main" of both files establishing the landing lock (`mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`, holder file, held through fast-forward, checks, push of `main` and worktree removal, released with `rm -r`, stale after 90 minutes, retry every five minutes, branch pushes need no lock, `main` never pushed without it), in the same commit as the other two; and this branch lands under that lock.

Coordinator confirmations (2026-09-24, on Jared's delegation), after this branch asked:
- `tests/test_pm_browser_workspace_reset.py` may be edited for Task 1(b), and Task 2 covers `tests/test_shared_runtime_storage_contracts.py`. Both are tracked but have no one-per-file exception line in `.gitignore`; those lines are added in the same commit as the rule-file sentences, as an explicitly requested `.gitignore` edit.
- The 1(b) plan stands: the four checkpoint rows persist the nine-field durable token on the `DurableGenericToken` precedent, the live snapshot id is joined again at each read, SP-311's text stays as it is, the hash-pinned `Plans/event_record_index_checkpoint.schema.json` is not touched (each contract carries the projection locally), the frozen Home2 reader copy stays frozen, and readiness gains a rule, with self-tests, that rejects a persisted ten-field token.
- The Decision Log entry quotes the Browser passage's "historical provenance" wording as the reading overridden and SP-311's "never persist" as the reason.
- Currentness drift from the extra documents is expected at landing and lands under the staleness carve-out.

## Task 1(a): `whole_wrapper_sha256`

**Decision: the recipe exists. It is now stated in SP-310, and readiness checks it.**

**How the recipe was found.** The six values (two members for each of `goal_cancel_progress`, `goal_cancel_control_publication` and `goal_cancel_terminal_audit`) live in `Plans/goal_workflow_cancel_contracts/physical-profiles.json`. `git log -S` puts all six in one commit, `de87b6dfc3` ("plans: define original Workflow Goal cancellation coordination and storage profiles"). That commit's machine report, `reports/event-authority-20260911/step-08-goal-workflow-coordinator-checks.json`, pins six source packages by manifest SHA-256. The `physical_source` package is `/home/sittingmongoose/PM-Experiments/goal-workflow-cancel-physical-integration-20260914/v1/`; its manifest's SHA-256 is `1c2a331b8fc097a6215712227e7abb0250a8334ec73dd33401bd92d68f4b8ab2`, which is the value the report records. That manifest pins `build_proposal.py` at `29cf2f89f5f66fcdf2c682c75fb2f648894d584741e3ad45bb39caa81a8679e9`. Line 100 of the script writes:

```python
'whole_wrapper_sha256': hashlib.sha256(dump(ww).encode()).hexdigest()
# with dump = lambda x: json.dumps(x, ensure_ascii=False, indent=2) + '\n'
# and ww = the definition that whole_wrapper_ref resolves to in the goal realm
```

The reviewer tried compact and spaced separators, but not `indent=2`. The recipe applied to the current hash-pinned documents reproduces **all six** declared values. `ensure_ascii` makes no difference here, because the six definitions contain no non-ASCII characters. Sorted keys, compact output and output without the final LF reproduce none of them.

| Family | Member | Wrapper definition | Reproduces |
|---|---|---|---|
| `goal_cancel_progress` | v1 `1.0.0` | `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageProgress` | yes |
| `goal_cancel_progress` | v2 `2.0.0` | `Plans/goal_workflow_cancel_contracts/schemas/goal-workflow-cancel-custody.schema.json#/$defs/StorageProgress` | yes |
| `goal_cancel_control_publication` | v1 | `...goal_cancel_command_custody.schema.json#/$defs/StorageControlPublication` | yes |
| `goal_cancel_control_publication` | v2 | `...goal-workflow-cancel-custody.schema.json#/$defs/StorageControlPublication` | yes |
| `goal_cancel_terminal_audit` | v1 | `...goal_cancel_command_custody.schema.json#/$defs/StorageTerminal` | yes |
| `goal_cancel_terminal_audit` | v2 | `...goal-workflow-cancel-custody.schema.json#/$defs/StorageTerminal` | yes |

**Reasoning, in three sentences.** The digests were never unexplained: the generator that wrote the declaration is still on disk, pinned by the commit's own machine report, and its recipe reproduces every value exactly. Retiring a field that is correct and reproducible would throw away the one pin that binds each reviewed wrapper definition, which the resource map's whole-document hash cannot do once someone refreshes that hash. So the owner text now states the recipe beside SP-310, and readiness checks it: a changed wrapper needs a newly declared digest.

**What changed.**
- `Plans/storage-plan.md`: in SP-310, a dated "2026-09-24 follow-up: member wrapper digests" states the recipe. The digest covers the definition, not the whole document; members stay in document order; indentation is two spaces; non-ASCII is written as UTF-8; there is one final LF; it is not a stored-value hash and not the `pm.goal.cancel_command_json.v1` codec. It cites the generator's provenance and DL-076. The section 2.3.1 sentence that called the recipe an open question now says readiness checks it and keeps the note that it was open until 2026-09-24.
- `scripts/pm-implementation-readiness.py`: `storage_value_whole_wrapper_sha256`, and in the union check a new failure `storage_value_registry_stored_profile_union_member_wrapper_digest_mismatch`. Three self-test checks:
  - `stored_profile_union_member_wrapper_digests_reproduce` (positive): all six digests are present, 64 lowercase hex, and equal the recomputed value.
  - `stored_profile_union_member_wrapper_digest_drift_rejected` (negative): a zeroed declared digest is rejected.
  - `stored_profile_union_edited_wrapper_with_refreshed_document_pin_rejected` (negative): a `$comment` added to the V2 `StorageProgress` definition, with the resource map re-pinned so the document still resolves, is rejected by the digest alone.
- `tests/test_pm_runtime_vocabulary_migration.py`: the representation test names the three checks, 31 in all.
- A mutation run confirms the negatives are not vacuous. A copy of the validator with the digest comparison disabled fails exactly the two negative checks, and the positive check still passes.

`Plans/goal_workflow_cancel_contracts/physical-profiles.json` itself is unchanged, so no resource map, manifest or report pin moves.
