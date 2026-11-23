# Shard 055: Workflow Replan v8 source adoption and writer (PNC-019 lane rv8b, 2026-11-14)

Source: `Plans/Executor_Protocol.md`

Source lines: L12886-L13024

Source SHA256: `5ba01ae8ac5e1541aba94efc2f78809afbedf59c605ff179a55f587da865803c`

---

## Workflow Replan v8 source adoption and writer (PNC-019 lane rv8b, 2026-11-14)

### EP-3100 - Fresh all_writers.v8 source adoption and installation boundary

```yaml
plan_unit_id: EP-3100
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14). It adopts the frozen Workflow source pm.executor.workflow_source.all_writers.v8 (external root /mnt/Cursor/PM-Experiments/goal-replan-combined-source-20260921/v3/, manifest SHA-256 9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e, frozen installed_contract_digest 2d69459c1e5ff9c39c3ed234f8b21cd68621b9420b80c1ac9442794a1e4e4155), accepted by the independent review of 2026-11-14 (ACCEPT_WITH_NOTES), as one fresh Workflow source edition for ordinary native execution, original Standard certification and original goal_run.replanned publication. Placement: 70 operative members are byte-identical under Plans/goal_run_replan_contracts/source-v8/ at their package-relative paths; the four case-only duplicate aliases (coordinator/protocol.md, native-v8/protocol.md, producer-combined/protocol.md, replan/protocol.md) are not placed, because a case-insensitive checkout cannot hold a path that differs from its sibling only by case and each alias duplicates that sibling's PROTOCOL.md (replan's is that file minus its four-line Stop preface); the other 1,437 descriptor members resolve only against the frozen root, each authenticated by its preimage SHA-256, never against canon or a newer same-ID resource. Adoption applies the nine explicit corrections C1..C9 of Plans/goal_run_replan_contracts/adoption.json (payload successor, idempotency preimage, descriptor representation, append durability precedence, numbers and date-time, Goal body physical edition, cancel routed to D06, replay recipe, unified run history); no other frozen member is changed, repinned or reinterpreted. Representation: the canon adoption digest is SHA-256 of the sorted-key compact UTF-8 JSON adoption descriptor (CV-352 rule), recorded in adoption-digest.txt; the frozen digest keeps its pretty-printed-bytes rule; the two are distinct and neither substitutes for the other or for a v6 or v7 birth digest. Installation: only a genuine original Workflow birth installs v8, with WorkflowBirth.installed_contract_digest and the combined Enrollment equal to the adoption digest, after every exact method, participant, codec, physical selector, recovery, backup, retention and deletion guard is installed. No v3, v6, v7 or all_writers.stop_block.v1 birth is enrolled, upgraded, cast or late-enrolled. The v8 certified component pm.goal_run_certified.producer_source.v3 and the v8 started, cancelled and source-control dependencies are bound by full original-scope correspondence to their own frozen originals, not by repinning to the v7 certified family. Native installation, runtime execution and Event admission remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- EP-118
- EP-122
- EP-124
- CV-352
- CV-3100
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- Every placed member equals its frozen manifest entry and, where listed, its preimage whole_members entry, byte for byte; the frozen preimage SHA-256 equals 2d69459c1e5ff9c39c3ed234f8b21cd68621b9420b80c1ac9442794a1e4e4155.
- The adoption digest is recomputed from the adoption descriptor under the CV-352 rule and equals adoption-digest.txt; it differs from the frozen digest and is the only digest a v8 birth may record.
- No member outside corrections C1..C9 differs from its frozen bytes, and every correction names its frozen member, its canon replacement and its owner unit.
- No existing birth of another profile is enrolled, cast or late-enrolled, and no v8 header describes a v7 body.
- Static acceptance establishes no installed native authority, native cancellation, runtime execution, Event depth or readiness.
validation_surfaces:
- Plans/goal_run_replan_contracts/adoption.json
- Plans/goal_run_replan_contracts/adoption-digest.txt
- Plans/goal_run_replan_contracts/source-v8/manifest.json
- Plans/goal_run_replan_contracts/source-v8/installed-profile-preimage.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: unlisted_workflow_writer_admission
reasoning_tier: high
context_scope: workflow_all_writers_v8_adoption
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/goal_run_replan_contracts
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PM-Experiments/goal-replan-combined-source-20260921/v3/manifest.json (sha256 9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e)
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (ACCEPT_WITH_NOTES, adoption items 1 to 8 and T-REPLAY)
preserved_exact_tokens:
- "pm.executor.workflow_source.all_writers.v8"
- "2d69459c1e5ff9c39c3ed234f8b21cd68621b9420b80c1ac9442794a1e4e4155"
- "9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e"
negative_constraints:
- No enrollment, upgrade or cast of an existing birth, and no edit of a frozen member outside C1..C9.
- No claim of native installation, runtime execution, native cancellation or Event admission.
owner_hints:
- Plans/Executor_Protocol.md
```

**Why only part of the package is copied.** The frozen package is about 188 MB, mostly composition banks, pinned inputs and original resource banks that authenticate lineage. Copying it would add raw source lineage to this repository. The operative members (protocols, method maps, participant tuples, profile, physical families, stored routes, the nineteen whole schemas, the draft payload and its graph-patch source) are placed; the rest is pinned by the descriptor's own hashes, as the v6 package pins its external source manifest (`Plans/workflow_standard_source_contracts/README.md`).

**Replay (T-REPLAY, correction C8).** The review found that rerunning `compose_whole_banks.py` reorders `changes` in 49 of 1,241 ledger rows, which changes one descriptor member's digest without changing meaning. Adoption therefore authenticates the frozen bytes and never replays authoring scripts or refreshes the descriptor; a future replay must keep the frozen ledger or define a stable order before a newly reviewed descriptor exists. The tool issue is filed in the program's tool-issue list.

**What stays open.** Native installation, original issuer authentication, transaction, codec, flush, interleaving, restore and effect tests, and full native cancellation are separately NOT_RUN. A fresh edition that also lists the EP-200 stop and block writers is not written (GRS-3101).

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-118, ContractName:Plans/Executor_Protocol.md#EP-124, ContractName:Plans/Contracts_V0.md#CV-352, ContractName:Plans/Executor_Protocol.md#EP-3101, ContractName:Plans/Decision_Log.md#DL-080

### EP-3101 - Workflow Replan writer

```yaml
plan_unit_id: EP-3101
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14). It is the Workflow writer listing DL-080 requires for goal_run.replanned, Project edition only. One writer is named: owner.executor.workflow_run.replan.v1, whose entrypoints are exactly the frozen v8 methods draft.replan.prepare.v3, apply_native.v3, finalize_producer.v3, append_original.v3, complete.v3, observe.v3, read_original.v3 and release.v3 in that order, with draft.replan.reconcile.v3 for recovery, draft.replan.project.v3 for the projection participant and draft.replan.enroll_profile.v3 at genuine birth (Plans/goal_run_replan_contracts/source-v8/replan/methods.json). It is reached from handlers::runtime::replan (cmd.runtime.replan) for a live blocked episode whose allowed_action_ids contain replan, and from the bounded manager's own replan decision; each route supplies a genuine BoundedManagerResult, and neither the command nor the writer chooses the graph or the action. Installation: EP-118 keeps refusing every unlisted writer (RequiredOtherWorkflowWriterSource=false); the writer exists only on a genuine all_writers.v8 birth (EP-3100) and claims the run's one exclusive combined slot (combined.claim.v1) before prepare. Order: claim; prepare (complete NativeApplySource, prospective candidates and the durable ProducerIntent before any effect); one native transaction applies graph, RequiredSet, WorkNode dispositions, born members, the checked u32 generation +1 and the native body revision +1; finalize the producer with only the applied graph-patch joins; append through ordinary Storage with SP-286 first-AppendReceipt and CV-339 custody under SP-336/SP-347 durability (C4); complete; observe (D01 observer only); read and project; release, which clears only the publication fence. The command result (RuntimeReplanResult, EP-236) is published only after the first receipt; receipt_ref names it. A next_action of cancel is refused before prepare (C7). A refusal after native application keeps every genuine earlier effect and reports recovery_required, never rollback; a lost acknowledgement resolves from SP-286 retained receipt custody; nothing re-dispatches, re-applies or mints a new event value. Typed args and refusal codes of cmd.runtime.replan are unchanged (EP-236); on a birth without the installed writer the command refuses handler_unavailable and emits nothing.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- EP-118
- EP-119
- EP-236
- EP-3100
- SP-286
- SP-3100
- SP-3101
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- Only owner.executor.workflow_run.replan.v1 appends goal_run.replanned, only on a v8 birth, and only after native application and producer finalization.
- The writer orders claim, prepare, native application, finalization, append with SP-286 first receipt, completion, observation, read and release; no step is reordered or skipped.
- cmd.runtime.replan keeps its typed args (run_id, blocked_sequence, allowed_action_id, node_id, attempt_id?) and closed error codes; it requires allowed_action_id replan on a live blocked episode and refuses handler_unavailable on a birth without the writer.
- next_action cancel is refused before prepare; the writer never performs cancellation, SchedulerStop or effect cleanup.
- A lost acknowledgement resolves through SP-286 retained receipt resolution; the writer never re-applies native state, advances another generation or mints a new key or timestamp.
validation_surfaces:
- Plans/goal_run_replan_contracts/adoption.json
- Plans/goal_run_replan_contracts/cancellation-dependencies.json
- Plans/goal_run_replan_contracts/oracle-fixtures.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-command-payload-defs-check.py
- python3 scripts/pm-plan-index.py validate
risk_class: unlisted_workflow_writer_admission
reasoning_tier: high
context_scope: workflow_run_replan_writer
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption items 2 and 7)
preserved_exact_tokens:
- "owner.executor.workflow_run.replan.v1"
- "RequiredOtherWorkflowWriterSource=false"
- "cmd.runtime.replan"
negative_constraints:
- No completion, certification, cancellation, stop, resume-without-replan or ownership-transfer writer.
- No enrollment of an existing birth and no application-scope writer.
owner_hints:
- Plans/Executor_Protocol.md
```

**Why a listing and an installation together.** EP-200 could only name its writers, because no edition listed them. The v8 descriptor already registers the Replan methods and participants before birth, so naming the principal here and adopting the descriptor in EP-3100 closes both the listing and the installation contract. Native installation itself stays NOT_RUN.

**The command route.** `cmd.runtime.replan` is a Blocked run action (`Plans/Wiring_Matrix.production.json` row `catalog.runtime_replan`). Its handler checks the blocked episode identity (`run_id`, `node_id`, `blocked_sequence`, `allowed_action_id = replan`, `attempt_id` only after an attempt exists), Project permission and that the run's birth installed this writer; then it asks the bounded manager for a decision and hands that decision to the writer. A stale `blocked_sequence` refuses `stale_projection`; no live blocked episode refuses `blocked_state_required`; a missing writer refuses `handler_unavailable`. Its declared effect is the `goal_run.replanned` Event; `goal.replanned` is historical-only (GRS-070) and is never its effect or an alias.

**Separate cancellation.** Full original cancellation (`record_cancellation`, SchedulerStop, native cancel result and origin, effect cleanup and D06) is a separate genuine dependency (`Plans/goal_run_replan_contracts/cancellation-dependencies.json`). The limited execution revocation of the v8 Stop protocol never counts as it.

**Search (DL-045).** Scope: EP-116..124, EP-200, EP-236, GRS-070, GRS-079..085, GRS-200..202, SP-286, SP-309..317, the Known-37 matrix row EA-UND-0019-GOAL, `Plans/workflow_standard_source_contracts/`, `Plans/goal_run_stop_block_contracts/` and the wiring row `catalog.runtime_replan`. Found: EP-118 excludes the optional/replanned materialization route; no unit names a Replan writer, method or entrypoint; the wiring row expected the historical `goal.replanned`. The writer identity is newly authored.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-118, ContractName:Plans/Executor_Protocol.md#EP-3100, ContractName:Plans/Executor_Protocol.md#EP-236, ContractName:Plans/Goal_Runtime_System.md#GRS-3100, ContractName:Plans/Decision_Log.md#DL-080
