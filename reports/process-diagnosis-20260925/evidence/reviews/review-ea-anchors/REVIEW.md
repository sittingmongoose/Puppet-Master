# Review: plans/ea-certified-anchors-20260924 (tip a8c5ff6a39)

**Verdict: fix_then_land.** 11 findings, 1 blocking. Findings are in `findings.jsonl` and the report comparison is in `RECONCILIATION.md`.

This was a read-only review. Nothing in `/mnt/Cursor/PuppetMaster` was edited, no worktree was created and nothing was pushed. The checks ran on scratch exports under this directory.

## What holds

- **The approach.** It is an owner edit, not a registry change. `Plans/event_family_registry.json` hashes to `0be544181eda...c842` on the base, on `main` and at both branch commits, so the approved checkpoint `2026-09-11.2` is untouched. This is also what GRS-084 requires: "only its explicit version/payload selection and corresponding source refs advance".
- **The cited owners.** GRS-084 selects the payload and the EventRecord root, GRS-085 owns the prefix projection, SP-316 the compact authority families and v7 wrapper routes, and SP-317 the projection and checkpoint families. The started and cancelled labels match their registry owners, GRS-079/SP-311 and GRS-080/SP-312.
- **Preservation.**
  - Every table row keeps its exact field tokens.
  - SP-214's existing canonical text, A001-A005, negative constraints and preserved tokens are unchanged. `goal.*` and `payload schemas` were already missing at base.
  - The new criterion "whole-v2 certified rows keep their historical interpretation" is supported. The certified consumer protocol says "No v2 sibling is cast or skipped" and forbids "v2 upconversion", and GRS-084 says "no existing birth is enrolled or cast".
- **Derived files.**
  - Only the two documents' shard trees and index entries change: 396 plan units change in hash or location only, SP-214 is the only unit whose content changes, and SP-214-A006 is the one acceptance unit added.
  - Regenerating from the branch's documents reproduces every committed derived file byte for byte, apart from timestamps.
  - The shard check passes (99 documents, 2,722 shards). `pm-plan-index.py validate` passes apart from the retention baseline, which needs git and the export has none.
- **Validator.** `validate-goal-runtime-event-fixtures` passes on the branch and on `main`. It reads neither edited file, though (A-10).

## What must change before landing

**A-01 (blocking).** A006 says SP-214 "remains only the payload_owner_doc route" for goal_run.certified, and the new paragraph drops "mandatory". Canon names SP-214, together with D-R20, as the source of the mandatory per-Workflow-run GoalRun projection role:
- GRS-079: "SP-214 and D-R20 require the durable GoalRun projection role"
- GRS-080: "SP214's mandatory per-Workflow-run projection ..."
- GRS-085: "The mandatory started/cancelled/certified per-Workflow-run projection"
- The certified consumer protocol, which GRS-084/085 and SP-316/317 make normative: "Goal Runtime owns the mandatory SP214/D-R20 per-Workflow-run derived projection"

The new criterion therefore narrows an accepted unit against canon.

**Should fix in the same pass:**
- A-02: the table row calls SP-316 "its Storage custody". SP-316 keeps only content-free issuance metadata, and the branch's own SP-214 paragraph words this correctly.
- A-03: the v2-only labels read as if the event-specific fields were v2-only. They are unchanged inside all three v3 payloads.
- A-04 and A-05 (notes): the v7/producer-v2 scope limit and CV-352 are missing. Both are folded into the edits below at no extra cost.
- A-06 (note): "likewise governed" suggests a complete list of owners. The edit rewords it as registry owners.

## Exact edits to land

The patch applies to both `a8c5ff6a39` and `main`+branch (`patch -p1 --dry-run` passes on both). It is saved as `proposed-edits.patch`, and the full edited files are in `proposed/`. With it applied in a scratch tree, the shard generate and check, `pm-plan-index.py generate` and validate, and the fixture validator all pass. The new SP-214 paragraph and A006 parse literally, and neither contains an apostrophe.

```diff
--- a/Plans/Goal_Runtime_System.md
+++ b/Plans/Goal_Runtime_System.md
@@ -2650,11 +2650,11 @@
-| `goal_run.certified` | Active v3: the complete `pm.goal_runtime_event.goal_run_certified.schema.v3` payload and coordinator identity EventRecord root that GRS-084 selects, with GRS-085 governing its started/cancelled/certified prefix projection and SP-316/SP-317 its Storage custody and projection/checkpoint. Retained whole-v2 only: `goal_run_id`, `certification_receipt_ref`, `validator_outputs[]`, `worknode_receipt_refs[]`, `unresolved_risk_refs[]`, `final_certifier_decision`. |
+| `goal_run.certified` | Active v3: the complete `pm.goal_runtime_event.goal_run_certified.schema.v3` payload and coordinator identity EventRecord root that GRS-084 selects (schema roots bound by CV-352), only for a genuine fresh `pm.executor.workflow_source.all_writers.v7` birth and `pm.goal_run_certified.producer_source.v2` prepare.v2 binding, with GRS-085 governing its mandatory started/cancelled/certified prefix projection, SP-316 its compact original authority families and v7 wrapper routes, and SP-317 its projection/checkpoint families. Retained whole-v2 only: `goal_run_id`, `certification_receipt_ref`, `validator_outputs[]`, `worknode_receipt_refs[]`, `unresolved_risk_refs[]`, `final_certifier_decision`. |
 ...
-Routing note, 2026-09-24: ... as the `goal.cancelled` row does. This note changes no payload, schema, registry row, admission or behavior.
+Routing note, 2026-09-24: ... as the `goal.cancelled` row does. For these three `goal_run` rows the listed event-specific fields are unchanged inside the active v3 payloads; v3 changes the envelope (required `expected_goal_run_revision`, `goal_run_revision` and `idempotency_key`; no `expected_goal_revision` or `parent_goal_id`) under GRS-079, GRS-080 and the schema GRS-084 selects. This note changes no payload, schema, registry row, admission or behavior.
--- a/Plans/storage-plan.md
+++ b/Plans/storage-plan.md
@@ -15161,12 +15161,16 @@
   For exactly goal_run.certified, GRS-084 selects the active v3 payload and coordinator identity EventRecord root,
-  GRS-085 governs its started/cancelled/certified prefix projection, SP-316 owns its compact original authority
-  families and v7 wrapper routes, and SP-317 owns its projection and checkpoint families. The goal_run_projection.v1
-  inventory above is not its reducer or checkpoint, and whole-v2 certified rows keep their historical interpretation.
-  The event family registry keeps this unit as the payload_owner_doc route for that family; this paragraph, added
-  2026-09-24, points the route at those owners and changes no payload, schema, registry row, admission or behavior.
-  goal_run.started and goal_run.cancelled v3 are likewise governed by GRS-079 with SP-311 and GRS-080 with SP-312.'
+  and GRS-085 governs the mandatory started/cancelled/certified per-Workflow-run prefix projection that carries
+  the durable GoalRun projection role of this unit (with D-R20) for that family. SP-316 owns its compact original
+  authority families and v7 wrapper routes, and SP-317 owns its projection and checkpoint families. The goal_run_projection.v1
+  inventory above is not its reducer or checkpoint. That family applies only to a genuine fresh pm.executor.workflow_source.all_writers.v7
+  birth and pm.goal_run_certified.producer_source.v2 prepare.v2 binding; earlier native-v6 and producer-v1 source
+  editions keep their original closed scope, no existing birth is enrolled or cast, and whole-v2 certified rows
+  keep their historical interpretation. The event family registry keeps this unit as the payload_owner_doc route
+  for that family; this paragraph, added 2026-09-24, points the route at those owners and changes no payload, schema,
+  registry row, admission or behavior. goal_run.started and goal_run.cancelled v3 keep their registry owners GRS-079
+  with SP-311 and GRS-080 with SP-312.'
@@ -15191,8 +15195,10 @@
-- goal_run.certified v3 is governed by GRS-084 and GRS-085 with SP-316 and SP-317; this unit remains only the
-  payload_owner_doc route in the registry row for that family, and whole-v2 certified rows keep their historical interpretation.
+- goal_run.certified v3 is governed by GRS-084 and GRS-085 with SP-316 and SP-317 within their native-v7 and producer-v2
+  scope; this unit stays the payload_owner_doc route of the registry row for that family, its mandatory durable per-Workflow-run
+  GoalRun projection role is carried by GRS-085 in the two SP-317 families rather than by goal_run_projection.v1,
+  and whole-v2 certified rows keep their historical interpretation.
```

The full, unabridged hunks are in `proposed-edits.patch`. The routing note line above is shortened with "..."; apply the patch file, not this excerpt.

**Report (A-11).** In the report's "Expected at landing", replace the staleness list with:
- Spec Lock `stale_hash` for both Goal_Runtime_System.md and storage-plan.md
- `pnc019_source_hash_stale` for Goal_Runtime_System.md
- two `event_authority_currentness_source_drift` rows, one per document
- 132 `artifact_hash_stale` rows in the live plan-sharding evidence bundle (the two documents plus 130 shards), which make `validate_plan_graph` a truncated rise, so the landing check exits 2 until the rise is classified
- the readiness-report regeneration described in step 2 below
- the certified pins from A-07

## Landing procedure

1. **Apply the edits.** In a worktree on the branch, apply `proposed-edits.patch`. Run `pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `pm-plan-index.py generate`. Commit the two documents and their derived files, then amend the report in its own commit.
2. **Rebase.** Run `git fetch origin && git rebase origin/main`. The rebase conflicts on `Plans/.plan_index/node_readiness_report.json` (both sides changed `generated_at_utc`). Do not hand-merge it. Instead:
   - Before regenerating, copy the ignored currentness edition into the worktree. It is `Plans/.audits/event-authority-2026-08-13-currentness/`: the files `CURRENT_EVENT_SOURCE_INVENTORY.json`, `EVENT_FAMILY_DENOMINATOR_STATUS.json`, `EVENT_OCCURRENCES.jsonl`, `README.md`, `VALIDATOR_RECEIPT.json` and the `adjudication/` directory. Copy them read-only from the shared checkout; they stay ignored. Then run both generators.
   - Why the edition matters (A-08): without it, the report reverts main's reseal rows, and `pm-plan-index.py validate` in the shared checkout fails with `stale_generated_index_artifact`. I reproduced both.
   - The expected result has 21 rows: main's 19 plus two `event_authority_currentness_source_drift` rows for the two documents. Row 8's expected hash changes to the new GRS hash, and 39 GUI-unit line numbers in the two documents shift. Nothing else changes.
3. **Check and land.**
   - Run the shard check in the worktree.
   - In the shared checkout: `git merge --ff-only`, then the shard check, then `pm-landing-check.py --base origin/main`.
   - Expect exit 2 from the truncated plan-graph/evidence rises, plus staleness rows (A-09). All of them name the two documents or their shards. Classify them as staleness, as the `f1ce058ccd` landing did, then push `main`.
4. **Send one reseal request** to the designated Plans agent. It should cover:
   - the Spec Lock (both documents)
   - the live plan-sharding evidence bundle
   - the PNC-019 hash for Goal_Runtime_System.md
   - a new currentness edition for the two documents
   - for the certified-family owner (A-07): the Goal_Runtime_System.md member of `Plans/goal_certified_family_composition.json` and source-citations C01-C05. Both still name `ccedade9...` and the old line numbers, while the cited passages themselves are unchanged. The storage-plan.md member (`328858615b...`) was already stale on main.
5. **Clean up.** Remove the worktree and delete the branch after the fast-forward.

## Not verified

- The coordinator's Step 8 (d) instruction, which is not in the repository.
- The plan-migration snapshot rows.
- `run-gates` and `audit-governance` as a whole; only the plan-graph, path-ref, contractref and banned-phrase subchecks were compared against `main`.
