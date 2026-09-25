# Step 8(d): the goal_run.certified owner anchors, 2026-09-24

**Question.** The `goal_run.certified` row of `Plans/event_family_registry.json` moved to family revision 3.0.0 and the v3 payload schema, and its `source_refs` name GRS-084 and CV-352. Its two owner anchors did not move: `semantic_owner_doc` is still `Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima` and `payload_owner_doc` is still `Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer`. The started and cancelled rows moved theirs to GRS-079/SP-311 and GRS-080/SP-312. The storage registry repairs of 2026-09-23 left the certified row as it was (`reports/storage-registry-repairs-20260923/REPORT.md`, choice 3), because GRS-084 says only the family's "explicit version/payload selection and corresponding source refs advance", and because changing the row would change the approved checkpoint hash.

**What the anchored text said.** Both anchors still resolved, but to text that describes the older version:
- The payload minima table listed the v2 certified fields (`goal_run_id`, `certification_receipt_ref`, `validator_outputs[]`, `worknode_receipt_refs[]`, `unresolved_risk_refs[]`, `final_certifier_decision`) with no pointer to v3. The `goal.created`, `goal.updated` and `goal.cancelled` rows of the same table already carry their "active v3" routing.
- SP-214 carries exact-row routing for eight Goal families but none for any `goal_run` v3 family, and its projection inventory names `goal_run_projection.v1`, while SP-317 defines the certified projection on the `goal_run_projection.v5` dataset.

**Disposition: a bounded owner edit, not a registry change.** The registry row, and so the approved checkpoint `2026-09-11.2` (SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`), stays unchanged. The anchored texts now route readers to the units that govern v3:

| File | Change |
|---|---|
| `Plans/Goal_Runtime_System.md`, payload minima table | The `goal_run.certified` row names the v3 payload and coordinator identity root that GRS-084 selects (schema roots bound by CV-352), within the native-v7/producer-v2 scope, GRS-085 for the mandatory prefix projection, SP-316 for the compact authority families and v7 wrapper routes and SP-317 for the projection/checkpoint families, and keeps the v2 fields as "Retained whole-v2 only". The `goal_run.started` and `goal_run.cancelled` rows get the same "(whole historical v2 only; active v3: ...)" label the `goal.cancelled` row uses, naming GRS-079 with SP-311 and GRS-080 with SP-312. A dated routing note under the table says the listed event-specific fields are unchanged inside the active v3 payloads, that v3 changes the envelope, and that the note changes no payload, schema, registry row, admission or behavior. |
| `Plans/storage-plan.md`, SP-214 | One exact-row paragraph for `goal_run.certified`: GRS-084 and GRS-085, with GRS-085 carrying this unit's mandatory durable per-Workflow-run GoalRun projection role (with D-R20); SP-316 and SP-317; `goal_run_projection.v1` is not its reducer or checkpoint; the native-v7/producer-v2 scope, with earlier editions keeping their closed scope; whole-v2 certified rows keep their historical interpretation. A closing sentence names the started and cancelled v3 registry owners, and criterion `SP-214-A006` states the same. |

**Authority.** The coordinator's Step 8 instruction of 2026-09-24 ((d): "a bounded owner edit or an open question"), relaying Jared's authorization, under DL-045's permission to define technical routing for already specified behavior. GRS-084 already names the governing units; this edit only makes the anchored text say so.

**Checks** (worktree at the branch tip, base `origin/main` `f1ce058ccd`):
- `pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `--check`: pass, 99 documents, 2,722 shards. Only the `goal_runtime_system` and `storage-plan` shard trees change.
- `pm-plan-index.py generate`, then `validate`: pass. PlanUnits stay at 6,721; acceptance units go from 26,233 to 26,234 (`SP-214-A006`). SP-214 is the only PlanUnit whose content changes; the payload minima table sits outside any PlanUnit.
- `pm-plans-verify.py validate-goal-runtime-event-fixtures` (SP-214's validation surface): pass, 0 failures, on the branch and on `main`.
- SP-214's YAML block parses; the new text avoids apostrophes so both the single-quoted `canonical_text` and the plain acceptance criterion read literally.

**Expected at landing.** Governance staleness for the two edited documents, which is a reseal request and not a canon defect:
- Spec Lock `stale_hash` for both `Plans/Goal_Runtime_System.md` and `Plans/storage-plan.md`;
- `pnc019_source_hash_stale` for `Plans/Goal_Runtime_System.md`;
- two `event_authority_currentness_source_drift` rows, one per document;
- 132 `artifact_hash_stale` rows in the live plan-sharding evidence bundle (the two documents and their 130 shards). They make `validate_plan_graph` and `validate_evidence` truncated rises, so the landing check exits 2 until the rises are classified as this staleness, as the `f1ce058ccd` landing did;
- the node readiness report regenerated after the rebase with the ignored currentness edition present (review A-08), never hand-merged;
- the certified-family pins below (A-07);
- the plan-migration snapshot rows for the two documents' units.

The reseal request to the designated Plans agent covers the Spec Lock entries, the live plan-sharding evidence bundle, the PNC-019 hash for `Goal_Runtime_System.md`, a currentness edition for both documents, the plan-migration snapshot, and the certified-family pins.

**Certified-family pins (review A-07).** The edit moves `Plans/Goal_Runtime_System.md` off the whole-file hash and line numbers the certified family pins: the Goal_Runtime_System.md member of `Plans/goal_certified_family_composition.json` (`ccedade9fde5fdf69f10fca4fb7d67eec1869e2d52364f010f95e80c06dcd863`) and the consumer source-citations C01 to C05, whose lines move by two. The cited passages themselves are byte-unchanged. Nothing in the certified contracts changes on this branch. The certified-family owner refreshes those pins at the next reseal, together with the `storage-plan.md` member (`328858615b...`), which was already stale on `main`. This is part of the reseal request above.

**Follow-up, not done here.** Moving the two registry anchors themselves to GRS-084 and SP-316 would change the registry hash and so needs a fresh checkpoint approval. It can ride along with the next registry revision that needs one anyway (for example the first Step 9 admission), so that it costs no separate approval.
