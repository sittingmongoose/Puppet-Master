# Run Graph View (Node Graph Display) -- Specification

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Parent-object field-shape direction now discussed
  - Child-record field-shape direction now discussed
  - Orchestrator ownership boundaries
  - Worktree gap is now explicit
  - projection ownership by surface
  - GUI / UX Impacts
  - Cleanup Priorities

#### Source target target-0479
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Parent-object field-shape direction now discussed
  - Child-record field-shape direction now discussed
  - Orchestrator ownership boundaries
  - Worktree gap is now explicit
  - projection ownership by surface
  - GUI / UX Impacts
  - Cleanup Priorities
- Exact required items represented:
  - `work_package` should own membership, lifecycle, requested settings, overseer/delegation/worktree policy refs, baseline lane state, package-governance state, promotion linkage, and package evidence linkage
  - `run` should own execution-session identity/lifecycle, graph linkage, run-level settings snapshot, and active pointers/rollup posture
  - `lane` should persist project/package linkage, worktree binding, lifecycle, contamination state, safe-point linkage, ancestry, and ownership/display grouping for UI separation
  - Define what Orchestrator is allowed to own: page layout and controls, view-model/projections, run control intents; exclude canonical runtime enums, event semantics, scheduler truth.
  - Pin the primary discussion seam first: UI surface/IA vs runtime state model vs cross-surface lineage/receipts vs blocked/recovery/remediation UX.
  - Record explicit boundary between canonical runtime facts, orchestrator projections, and widget/page presentation.
  - Carry forward requested-vs-effective state wherever persona/provider/model fallback can occur.
  - Decide whether worktrees are allocated/owned per node, per package, per seam, or per remediation branch.
  - Resolve package-based worktree preference vs [retired-token-4] for scale/manageability.
  - Record worktree ownership/isolation rules after Orchestrator ownership boundaries are pinned.
  - Expose source-control/worktree handshake as a remaining blind spot.
  - which Orchestrator seam should lead the discussion: runtime ownership boundary, page/tab IA, blocked/remediation UX, lineage across graph/evidence/history/usage
  - Source Control worktree area likely needs top-level partitioning into [retired-token-9] and Other
  - [retired-token-9] section likely needs further subdivision by feature seam
  - Orchestrator page is a high-density information surface with very large detail volume
  - Replace [retired-token-22]-first navigation
  - Define Dashboard→Orchestrator→thread routing contract
  - Add package/seam/lane visualization widgets
  - Define which overseer's thread opens on click
  - Make worktree/lane state visible and navigable
  - Replace or demote [retired-token-15] widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than [retired-token-19].
  - Persona fallback is split between “bare-context run” and canonical fallback Persona.
  - 6. **Run/tier/subtask worktrees vs package-based lane pools**
  - `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Widget_System.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - likely issue: old `cmd.graph.*` recovery actions coexist with canonical `cmd.runtime.*`, and current command envelopes cannot express seam/package/lane promotion actions.
  - cmd.graph.*
  - cmd.runtime.*
  - impacted contract/runtime/storage area: graph and evidence schemas.
  - why it matters: define one canonical field envelope for `{project, run, seam, package, node, attempt, lane, promotion, review, resolution_thread}` so schemas stop drifting independently.
  - {project, run, seam, package, node, attempt, lane, promotion, review, resolution_thread}
  - why it matters: decide how package overseer and seam overseer divide authority across scheduling, review, promotion, remediation, and graph patch requests.
  - which package owns which lane pool
  - `Lane`
  - Lane
  - currently cannot express lane/package/account-bounded permission resolution or approval scope in a multi-lane orchestrator run
  - Approval scope in a multi-lane run must not silently remain "same session" if sessions are per-agent-spawn and lanes are parallel.
  - `Contracts_V0.md` forbids `_persona_id` canonical names while downstream UI/runtime docs still consume or display them.
  - Contracts_V0.md
  - _persona_id
  - inspect lane
  - or owner package/lane with run reference secondary
  - Update Orchestrator contracts so the `[retired-token-21]` tab and `[retired-token-20]` show lane/worktree state through package ownership, not legacy tier ownership.
  - [retired-token-21]
  - [retired-token-20]
  - owning lane
  - `[retired-token-21]`, `[retired-token-20]`, `Evidence`, `History`, and `Ledger` are fixed-purpose tabs with stronger native layouts and interaction contracts
  - Evidence
  - History
  - Ledger
  - `[retired-token-20]` is explicitly not a widget
  - `Orchestrator / [retired-token-20]`
  - Orchestrator / [retired-token-20]
  - seam health projection
  - package activity projection
  - `[retired-token-20]` remains a fixed native surface with right-side inspector, not a widget.
  - `[retired-token-20]`: keep historical graph and current selections visible, but flag when live node state may be stale
  - `Orchestrator_Page.md` says the graph renders when a run is active or a historical run is selected
  - Orchestrator_Page.md
  - `Ledger` filters to the current/selected run
  - any command that implies mutating the current live run context
  - `History` currently includes `Delete Run`, which may conflict with durable historical/audit expectations unless delete semantics are defined carefully.
  - Delete Run
  - Cross-tab deep links must preserve focused `run_id` so History -> Graph -> Evidence -> Ledger stays coherent.
  - run_id
  - graph detail can open Evidence
  - seam
  - node -> `[retired-token-20]` with node selected and inspector open
  - run -> switch `focused_run_id` and open the relevant tab/context
  - focused_run_id
  - This pairs directly with the multi-run seam:
  - seam > package > node
  - package > lane
  - higher-level objects like promotions, concerns, graph patches, recovery records, and lane/worktree lifecycle states are not yet using one shared semantic vocabulary
  - old graph paths should remain visible and clickable even when superseded.
  - `related run`
  - related run
  - `derived run`
  - derived run
  - `retry/recovery run` or continuation lineage if such a concept exists later
  - retry/recovery run
  - `related run` = explicitly linked by user/system relationship metadata
  - `derived run` = intentionally spawned from or based on another run's outputs/graph/contracts
  - History should default to chronological project run history, not lineage history.
  - `derived from run ...`
  - derived from run ...
  - `retry of run ...`
  - retry of run ...
  - `continuation of run ...`
  - continuation of run ...
  - Search results should preserve run identity exactly and avoid collapsing similarly named seams/packages/nodes across unrelated runs.
  - Avoid UI copy like `superseded by newer run` unless there is an explicit relationship proving that.
  - superseded by newer run
  - canonical concern creators are runtime / package overseer / seam overseer / corroboration outcome / graph patch logic
  - graph patch application when it changes canonical graph generation
  - `Create New Lane`
  - Create New Lane
  - apply accepted patch should likely be `hard_gate` or runtime-controlled strong action because it changes canonical graph generation
  - hard_gate
  - `Delete Run` in History looks especially questionable until delete semantics and reversibility are defined more carefully.
  - package review
  - seam review
  - Graph patch likely needs:
  - prerequisite evidence / review / corroboration refs
  - `Run export`
  - Run export
  - `Run export` should include a manifest that ties together:
  - exact-record exports will depend on the record-envelope work from the previous seam
  - Good canonical display groups:
  - if requested == effective and nothing was skipped/clamped, compact display is fine
  - should answer: "what will be requested if I run from here?"
  - `Orchestrator / Graph inspector / run detail`
  - Orchestrator / Graph inspector / run detail
  - The same display grammar should extend beyond provider/model/persona/account.
  - requested run state
  - `Review pass default`
  - Review pass default
  - The user specifically flagged this seam earlier and it still looks underdefined.
  - `Graph patch required`
  - Graph patch required
  - every blocked node in a large run
  - The graph tab already has the strongest explicit scale contract in the current docs.
  - `[retired-token-20]`
  - package lists and node problem lists should expand lazily
  - So the rewrite should not assume the graph is the only heavy surface.
  - historical graph generations must stay accessible without becoming the default visual density
  - This seam reinforces the earlier search/deep-link work:
  - This seam connects directly to the earlier confirmation-policy work.
  - logical lane history
  - Current lane vocabulary still looks right and should be kept:
  - canonical starting lane for a package pool
  - live cleanup must never erase run/lane/worktree lineage from `History`, `Ledger`, or graph-linked inspection
  - `Graph Generation`
  - Graph Generation
  - `Lane Pool`
  - Lane Pool
  - graph `Nodes`
  - Nodes
  - an Interview run may have runtime identity and blocked/remediation state
  - when multiple surfaces present the same active conversational/document-production run, they should consume the same underlying runtime state and expose the same requested/effective visibility fields
  - sharded plan graph is canonical
  - portable package containing multiple records/artifacts plus manifest
  - run evidence bundle
  - `lane`
  - lane
  - `superseded` and `replan_required` matter for graph patch and generation lineage
  - superseded
  - replan_required
  - they should not just be badges, notes, or review leftovers
  - `storage-plan.md` still leans on `tier_id` / `run.tier_*`
  - storage-plan.md
  - tier_id
  - run.tier_*
  - `run.tier_*` -> seam/package/lane-aware runtime events
  - `effective_provider_identity` / display labels are audit/display fields, not routing keys
  - effective_provider_identity
  - Opus strongly reinforces the ledger direction that only `Progress` should remain widget-heavy while Graph / [retired-token-21] / Evidence / History / Ledger become stronger native surfaces
  - Progress
  - prompt/runtime resolution records, usage records, auth events, graph detail panels, and artifact views still do not share one obvious identity disclosure contract
  - graph patch lineage and concern/promotion visibility are now contract-level omissions, not just UI polish gaps
  - `run.started` / `usage.event` / `hitl.*` / config-validation rows in `storage-plan.md` still under-specify or mis-key the runtime identity and execution anchors they are supposed to carry
  - run.started
  - usage.event
  - hitl.*
  - the gap is not just "missing multi-account support" but "mutable display identity used as storage/routing anchor"
  - Run Graph remains under-modeled at the command and struct level:
  - `run.started`
  - Tighten Run Graph and Orchestrator page schemas around canonical runtime objects (`node_id`, `attempt_id`, `lane_id`, `seam_id`, `package_id`) and add the missing governance object hooks/commands.
  - node_id
  - attempt_id
  - lane_id
  - seam_id
  - package_id
  - concern operations should likely be available from multiple surfaces (`Progress`, `[retired-token-21]`, `Evidence`, `History`, `Ledger`, graph inspector), so the same action policy must survive different UI densities
  - widgets may add presentation or sub-filter choices, but they must not secretly select a different run or redefine the operational scope
  - rewrite direction keeps converging on native `[retired-token-21]`, `[retired-token-20]`, `Evidence`, `History`, and `Ledger`
  - `[retired-token-21]`, `[retired-token-20]`, `Evidence`, `History`, and `Ledger` become native surfaces with their own state contracts
  - widgets may not invent independent semantic scope such as their own run selection, their own lane universe, or their own concern-state semantics
  - `storage-plan.md` event rows for `run.started` and `usage.event` still omit those fields by enumeration
  - `GitHub_Integration.md` still lacks effective-account / switch-reason display and requested-vs-effective admin-capability UX
  - GitHub_Integration.md
  - `storage-plan.md` says `run.started` MUST include the full persona/runtime snapshot, but the event table row still enumerates a much thinner field set.
  - add effective-account / switch-reason display
  - Make Run Graph and Orchestrator consume attempt/receipt-based canonical projections and command args already present in `UI_Command_Catalog.md`, instead of re-describing tier-era or node-only action contracts
  - UI_Command_Catalog.md
  - `Plans/Run_Graph_View.md` + `Plans/Runtime_Artifacts_Panel.md`
  - Plans/Runtime_Artifacts_Panel.md
  - no minority-advisory outcome for the now-required 2-of-3 corroboration pattern
  - `input_required` / `input_provided` cannot distinguish node HITL, corroboration pause, or conversational user-input pause
  - input_required
  - input_provided
  - Run Graph still has concrete command/routing contract drift:
  - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch)
  - cmd.graph.approve_hitl
  - deny_hitl
  - request_id
  - cross-surface open commands are required in prose but not bound in the Run Graph command section
  - remediation-linked `finding_refs[]` can carry some node concern rendering immediately
  - finding_refs[]
  - Projection trust and node concern posture still lack a compact canonical contract that page/widget consumers can reuse.
  - Normalize Run Graph onto canonical `cmd.runtime.*` / `cmd.orchestrator.open_in_*` command bindings, add the missing action envelope, and add trust-state gating rules.
  - cmd.orchestrator.open_in_*
  - `usage_event_ref` should be a structured locator, not just a display string.
  - usage_event_ref
  - historical/current run switching must not change layout identity; layout scope is project-level, not run-level
  - active run owner
  - one blocked run should not necessarily flatten the whole project into a generic “red project” without context
  - a single project can legitimately have mixed attention sources at once: blocked run, auth trouble, and background advisory pressure
  - GPT-5.4 sharpened that this now blocks truthful requested-vs-effective runtime inspectors for Orchestrator, Run Graph, and conversational actor surfaces
  - The rewrite now needs a first-class actor envelope, not just a richer run record:
  - Orchestrator/Run Graph identity consumers are still materially below the contract the upstream docs now imply:
  - History is still closer to a run index than to the runtime/account-switch/recovery story the rewrite now needs.
  - Operational identities are declared in Multi-Account, but not carried in the canonical runtime identity bundle.
  - but the requested-side fields should remain queryable/auditable where the run snapshot is shown
  - `Executor_Protocol.md` presents execution as a canonical `Builder` / `Verifier` / `Overseer` loop over graph nodes.
  - Executor_Protocol.md
  - Builder
  - Verifier
  - Overseer
  - Orchestrator consumption still says `Progress, [retired-token-22], History, and [retired-token-20]`
  - Progress, [retired-token-22], History, and [retired-token-20]
  - node execution worker identity
  - approval resolution emits `node.prerequisite_resolved`
  - node.prerequisite_resolved
  - `UI_Command_Catalog.md` still has graph-local `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` entries even though the same file later establishes `cmd.runtime.*` as the canonical recovery namespace.
  - cmd.graph.deny_hitl
  - `checkpoints.hitl.{run_id}` is too coarse once more than one approval can exist in the same run.
  - checkpoints.hitl.{run_id}
  - `execution_role` is now an audit/routing requirement, not a nice-to-have display field.
  - execution_role
  - why a run used or failed to use a tool under a specific account/runtime context
  - Wizard/interview docs are good on blocked/degraded planning lineage, but still weak on the bridge from that lineage into the eventual execution run identity.
  - `workflow_run_id` links the three passes together, but it is not enough by itself to relate the sweep to `wizard_id`, staged requirements state, or the later launched run.
  - workflow_run_id
  - wizard_id
  - current lane lifecycle/status projection
  - `node.blocked` / `node.unblocked`
  - node.blocked
  - node.unblocked
  - `node.prerequisite_resolved`
  - increments only when the node transitions from non-blocked to a new blocked episode
  - `Orchestrator_Page.md` still describes the page as `Progress / [retired-token-22] / [retired-token-20] / Evidence / History / Ledger`, and many data-source rows still bind live state to:
  - Progress / [retired-token-22] / [retired-token-20] / Evidence / History / Ledger
  - Tier-shaped surfaces may still display and group by `tier_id`, but they should resolve through pointers to canonical execution objects rather than using `tier_id` as if it were the durable execution key.
  - `Run_Graph_View.md` calls itself a node graph but still uses `tier_id` for major data-source joins, including Usage and Output filtering.
  - Run_Graph_View.md
  - Evidence and terminal routing are still described as tier-keyed, which will be increasingly wrong once multiple attempts, blocked episodes, and graph generations are first-class.
  - Retarget Run Graph and Usage links toward `node_id` / `attempt_id` semantics, with `tier_id` surviving only as a display/grouping label where needed.
  - The docs are already consistent on one important point: provider/account identity is shared across assistant, interviewer, builders, overseers, and node workers, but that does not by itself explain what the actor was doing.
  - assistant / interviewer / builder / package overseer / seam overseer / node worker / verifier / corroborator / recovery actor
  - Keep usage attribution schema shared across all run kinds, but permit execution-role display/filtering without creating a second usage system.
  - should be attempt-native whenever produced by a node worker/verifier/reviewer flow
  - recovery actions still leak unstable UI labels (`deny`, `manual fix`, `abort node`) even though HITL/runtime docs are closer to a canonical `allowed_action_ids[]` family.
  - deny
  - manual fix
  - abort node
  - allowed_action_ids[]
  - Cross-owner docs implicated by this seam:
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `object_kind = node` or `attempt`
  - object_kind = node
  - attempt
  - `Media_Generation_and_Capabilities.md` vs `orchestrator-subagent-integration.md` still disagree on live capability re-checks vs frozen run snapshots, and `platform.capability_evaluated` remains outside Contracts_V0 event registration.
  - Media_Generation_and_Capabilities.md
  - orchestrator-subagent-integration.md
  - platform.capability_evaluated
  - This seam prevents the route model from swallowing the whole shell.
  - examples: Orchestrator tabs like Progress, [retired-token-21]/[retired-token-22], [retired-token-20], Evidence, History, Ledger
  - Source Control: `active_subview`, selected repo/worktree, compare target, graph filters
  - active_subview
  - This seam is about predictability.
  - `focused_run_id` when run scope is required
  - `object scope = node_id within run`
  - object scope = node_id within run
  - These values cover the reusable detail-pane and drill-in patterns already present across Orchestrator, graph detail, history/ledger pivots, and evidence/artifact surfaces.
  - seam / package / lane / worktree / concern / promotion / graph objects
  - `object_kind = node`
  - `node_id` remains object scope within the run and must not be dropped by the resolver
  - run and node scope remain required resolver context
  - That change is necessary for blocked episodes, scheduler passes, and graph generations to remain intelligible.
  - `object_kind = lane`
  - object_kind = lane
  - Do not add family-specific top-level route fields just because some ids are only unique within run scope.
  - the page still describes a six-tab shell with `Progress`, `[retired-token-22]`, `[retired-token-20]`, `Evidence`, `History`, and `Ledger`
  - [retired-token-22]
  - older graph HITL commands still use `request_id`
  - `request_id` still appears as the HITL approval key in graph commands even though the runtime direction is `blocked_sequence` anchored to the blocked episode.
  - blocked_sequence
  - `[retired-token-22]` survives as a primary Orchestrator tab and as a primary GUI page concept in stale consumer docs even though the rewrite direction is `[retired-token-21]` plus `[retired-token-20]`, with tiers reduced to derived view context.
  - Replace graph HITL command payload identity from `request_id` to blocked-episode anchored identity.
  - Run Graph and Orchestrator consumption still says aggregate by `tier_id` and `attempt_id?`
  - attempt_id?
  - `usage-feature.md` is closer to the rewrite than the tier-era graph docs, but it still carries enough `tier_id` language to reintroduce drift if left untouched.
  - usage-feature.md
  - `[retired-token-21]`, `[retired-token-20]`, `Evidence`, `History`, and `Ledger` native
  - Research Progress - 2026-03-17 - Blocked-family contracts are still uneven across node, wizard, and thread surfaces
  - `node.blocked` is the strongest contract:
  - Run Graph and Orchestrator aggregate by `tier_id` and `attempt_id?`
  - cross-surface node usage via `tier_id`
  - Keep node/attempt identity primary for runtime and graph inspectors.
  - This seam links storage, Usage, Run Graph, and Orchestrator all at once.
  - `Runtime_Artifacts_Panel.md` is now ahead of the main Usage and graph docs on identity rigor.
  - Runtime_Artifacts_Panel.md
  - `run.started` with `tier_id`
  - `run.tier_started`, `run.tier_completed`
  - run.tier_started
  - run.tier_completed
  - `run.verification_result` keyed by `tier`
  - run.verification_result
  - tier
  - canonical runtime events like `scheduler.pass`, `node.blocked`, `safe_point.*`, `remediation.*`
  - scheduler.pass
  - safe_point.*
  - remediation.*
  - graph and Orchestrator command payloads
  - usage and reasoning fields are split in the graph model without clearly tying back to the canonical requested/effective snapshot contract
  - run envelope still says `tier`
  - The next reconciliation pass for graph and Orchestrator should fix field names and scope language together, not separately.
  - it still names `run.tier_started` / `run.tier_completed` and `run.persona_stage_changed`
  - run.persona_stage_changed
  - Fixing consumer docs without fixing this owner-language seam will not hold.
  - `run.tier_started`
  - `run.tier_completed`
  - `run.verification_result`
  - `run.persona_stage_changed`
  - `run.qa_cycle_started`
  - run.qa_cycle_started
  - `run.qa_cycle_completed`
  - run.qa_cycle_completed
  - `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` still take `request_id`
  - `node.blocked`
  - This split now feeds directly into command payloads, graph detail structs, and orchestrator live-status bindings.
  - Reconcile graph and orchestrator approval commands away from `request_id` as the primary action target.
  - graph command payload drift
  - The approval seam is now precise: the docs currently describe two different action targets for the same family of approval/recovery behavior.
  - `UI_Command_Catalog.md` still gives `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` args with `request_id`
  - That ambiguity is no longer harmless because command payloads, restart restore, graph actions, and blocked projections are now split across the two identities.
  - Reconcile `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` away from `request_id` args and toward runtime-native blocked identity.
  - Research Progress - 2026-03-17 - Graph and Orchestrator approval consumers still preserve HITL-request-era fields
  - The graph and Orchestrator surfaces now show a direct mixed-era contract in one place.
  - blocked-state buttons across GUI, chat, graph, and orchestrator MUST map from `allowed_action_ids[]` to canonical `cmd.runtime.*` commands
  - `cmd.graph.approve_hitl`
  - `cmd.graph.deny_hitl`
  - command table uses `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl`
  - graph approval actions target `request_id`
  - `hitl_request_id` remains in the graph view-model even though the surrounding blocked/recovery model is already moving toward blocked-episode identity.
  - hitl_request_id
  - Reconcile graph and Orchestrator approval actions onto canonical runtime commands.
  - Remove `request_id` as the primary action target from graph command payloads.
  - Replace `hitl_request_id` in graph data requirements with blocked/runtime approval identity or explicit compatibility lineage-only fields.
  - `cmd.graph.approve_hitl` args = `{ request_id, node_id, rationale }`
  - { request_id, node_id, rationale }
  - `cmd.graph.deny_hitl` args = `{ request_id, node_id, rationale, resolution? }`
  - { request_id, node_id, rationale, resolution? }
  - `cmd.graph.approve_hitl` args = `{ node_id: string, rationale: string }`
  - { node_id: string, rationale: string }
  - `cmd.graph.deny_hitl` args = `{ node_id: string, rationale: string }`
  - The graph approval commands do not currently have one stable args contract even before considering the broader runtime-model rewrite.
  - Reconcile graph approval controls as wrappers over canonical runtime commands.
  - `Plans/Run_Graph_View.md` does the same in its event-update table:
  - Reconcile the live-status source tables in graph and Orchestrator docs so they consume canonical runtime records/projections first.
  - `tier_type` still appears as a core node UI field even though the broader rewrite direction is to demote tier/phase labels to derived or compatibility-only view context.
  - tier_type
  - Remove request-centric approval identity from the base graph model.
  - Reconcile the HITL callback model so graph actions normalize through canonical runtime action targets rather than graph-local request callbacks.
  - `[retired-token-21]`, `[retired-token-20]`, `Evidence`, `History`, and `Ledger` are native-purpose tabs
  - The `Decision_Log` retry succeeded under `agent-331`; keep `agent-314` recorded as the failed attempt and `agent-331` as the canonical successful run.
  - Decision_Log
  - agent-331
  - agent-314
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - DAE/FileSafe/recovery lineage exactness (`FileSafe`, `MiscPlan`, `Executor_Protocol`, `Run_Modes`)
  - FileSafe
  - MiscPlan
  - Executor_Protocol
  - Run_Modes
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - section `1.1 EventRecord` still lists `run.tier_started` and `run.tier_completed` among events that carry the runtime snapshot
  - 1.1 EventRecord
  - `node.blocked` with `blocked_sequence` and ordered `allowed_action_ids[]`
  - The owner doc is ahead in late addenda and behind in its main body, which makes it a direct source of downstream drift across Orchestrator, Graph, HITL, storage, and command docs.
  - Owner adoption order from this seam:
  - visible labels such as `Reject`, `Cancel Run`, and `Skip`
  - Reject
  - Cancel Run
  - Skip
  - later canonical families `Approve`, `Decline`, `Retry from safe point`, `Start fresh attempt`, `Resume after prerequisite`, `Replan`, `Skip node`, `Abort run`
  - Approve
  - Decline
  - Retry from safe point
  - Start fresh attempt
  - Resume after prerequisite
  - Replan
  - Skip node
  - Abort run
  - The action-label cleanup depends on this file, because it still legitimizes `Reject` / `Cancel Run` / `Skip` as if they were canonical action names rather than surface labels over runtime action families.
  - Usage and Evidence remain tied to `tier_id` in the canonical storage owner, which keeps recreating the same drift in Usage, Graph, and Orchestrator consumers.
  - `Run envelope (tier, mode, selected Persona ID(s), selected model/variant)`
  - Run envelope (tier, mode, selected Persona ID(s), selected model/variant)
  - `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` still exist with `request_id`
  - the opening sections still teach node completion semantics without the newer `Package Overseer` / `Seam Overseer` governance split
  - Package Overseer
  - Seam Overseer
  - verifier activity is scoped to node `tier_id`
  - Run Graph and Orchestrator are still said to aggregate by `tier_id` and `attempt_id?`
  - graph detail and usage pivots aligned to node/attempt/runtime identity
  - settings / requested-vs-effective / identity display grammar
  - 13 matching Opus 4.6 subauditors** over the same seam boundaries
  - named display grammar (`Inherited from`, `Overridden by`, `Requested`, `Effective`, `Reason`, `Support`)
  - Inherited from
  - Overridden by
  - Requested
  - Effective
  - Reason
  - Support
  - worker-policy display under the same requested/effective grammar
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #16 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #17 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #18 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #19 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #20 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #21 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #22 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-032: Concern linkage to adjacent families

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0483
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `concern source event/ref` = review finding, corroboration result, blocked episode, patch result, recovery outcome, etc. that supports the concern
  - concern source event/ref
  - unresolved concern or corroboration tied to outputs from that lane
  - Keep concern separate from review findings, annotations, blocked episodes, and recovery records while allowing rich cross-linking.
  - missing families now matter more because the rewrite depends on concerns, promotions, corroboration, graph patches, and recovery as first-class durable objects
  - `Executor_Protocol.md` has no concern model, no corroboration lifecycle, no wake reasons for concern/promotion/governance boundaries, and no dual-overseer actor model
  - Executor_Protocol.md
  - `UI_Command_Catalog.md` still leaves the runtime command layer under-owned: deprecated graph recovery commands are still presented as live canon, HITL `approve_continue` still has no canonical `cmd.*` mapping, cross-surface pivot payloads still lack rewrite-era structural keys, and there are still no stable `cmd.account.*`, `cmd.concern.*`, or `cmd.promotion.*` families.
  - UI_Command_Catalog.md
  - approve_continue
  - cmd.*
  - cmd.account.*
  - cmd.concern.*
  - cmd.promotion.*
  - Define canonical command families for account operations, concern operations, and promotion operations, and explicitly map HITL `allowed_action_ids` into stable `cmd.*` handlers.
  - allowed_action_ids
  - account/auth controls, concern actions, and promotion actions still have no canonical command-family owner, and command/wiring schemas still cannot encode projection-freshness/health gating for mutating actions.
  - Lane, seam, package, concern, and promotion routes are still mostly implied by UI prose instead of declared as canonical navigation identities.
  - Adjacent owners implicated by this seam:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-032
- Fidelity gap refs: cov-032
- Required fidelity items:
- Exact required item: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact required item: Allow blocked episodes to reference concerns without replacing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-032: Concern linkage to adjacent families` exists in `Plans/Run_Graph_View.md`.
- Exact acceptance check: The `cov-032` repair states the exact requirement: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact acceptance check: The `cov-032` repair states the exact requirement: Allow blocked episodes to reference concerns without replacing concern identity
- Exact acceptance check: The `cov-032` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-038: Focused run and historical routing contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0484
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `History` rows can load a historical run into the graph/evidence
  - History
  - but there is no clear mode contract for what the whole page is in after a historical run is selected
  - distinguish `active run truth` from `focused run context`
  - active run truth
  - focused run context
  - `focus_mode = historical` when the user is inspecting any non-active run
  - focus_mode = historical
  - `Historical Run Mode`
  - Historical Run Mode
  - `History` selection changes the whole page's focused run
  - `Progress` in historical mode must stop pretending to be a live dashboard and instead become a historical summary for that run, or show a reduced/locked state with a switch-back-to-live CTA
  - Progress
  - in historical mode, `Progress` becomes a historical run summary surface
  - Add a first-class `Historical Run Mode` UI contract for Orchestrator.
  - Define how `Progress` behaves when the focused run is historical.
  - The page must not auto-switch focus away from a historical run just because live activity appears.
  - The user should always know whether they are looking at the active run or a historical run.
  - when a result belongs to another run, selecting it should explicitly switch the focused run
  - the UI should disclose that the focused run changed because of the search result
  - Historical results must preserve run context clearly so search does not create silent run-focus jumps.
  - lane may still be historical
  - `historical run` must not imply:
  - historical run
  - `historical run`
  - `historical run` = any non-active/non-focused run retained for the project
  - Cross-run navigation should switch focus to the selected run, not imply that the selected object is part of the currently focused run's lineage.
  - Historical run views should show the frozen requested/effective state from that run, not recompute from current settings.
  - historical run views must stay frozen to historical requested/effective state
  - historical object retained in the model, but not an active live lane
  - `Historical Run`
  - Historical Run
  - historical run package with manifest + linked artifacts/records
  - historical-run mode will feel broken if some `Progress` widgets silently follow live events while others honor the focused historical run
  - remote-mode docs still leave GitHub REST side effects local while remote agents run elsewhere, without a clear orchestration boundary contract
  - This seam is what prevents the new route-target contract from immediately turning back into per-surface deep-link spaghetti.
  - `open_intent` is the caller’s direct purpose for opening the subject. It belongs to the subject-open contract because the same subject can be opened as source, preview, or review entry.
  - open_intent
  - `[retired-token-1]` still has unresolved MVP/gating contradictions, missing rename approval command/event families, no clear plan-mode rule for mutating LSP operations, and no multi-project-tab routing contract.
  - [retired-token-1]
  - This seam is owner-level, not consumer-level. Fixing `[retired-token-3]` or `[retired-token-2]` first would still leave stale routing at the top of the precedence stack.
  - [retired-token-3]
  - [retired-token-2]
  - default search scope = focused run, widening to project/all-runs, and required disclosure when search changes focused run
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-038
- Fidelity gap refs: cov-038
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-038: Focused run and historical routing contract` exists in `Plans/Run_Graph_View.md`.
- Exact acceptance check: The `cov-038` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-038` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-038` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

## 1. Scope and canonical role

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0480
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - review scope, findings counts, unresolved findings, verdict, canonical findings summary ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.

Rules:
- graph nodes are runtime nodes, not tiers
- graph lineage spans generations when graph patching occurs
- blocked/recovery/promotion/corroboration state belongs in graph detail when it pertains to the selected node or related lineage object

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

## 2. Layout
The graph view has three primary regions:
- top header for run scope, generation scope, and trust state
- main graph canvas with minimap/search/overlays
- right-side inspector and table region

Rules:
- current generation is emphasized by default
- superseded and historical branches remain visible and clickable
- large-graph modes use virtualization, level-of-detail reduction, and lineage-focused defaults rather than hiding historical truth

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

## 3. Node detail inspector

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0481
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Serialization should preserve stable work intent, not every UI detail.
  - serialized `resume_url` carries narrow step anchor detail
  - resume_url
  - lane detail:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Acceptance carry-through
- Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Allow blocked episodes to reference concerns without replacing concern identity

## 4. Data model and identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0482
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The docs already define most of the raw data needed for this seam:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Acceptance carry-through
- Use active_run_id/focused_run_id with focus_mode = live | historical
- Keep cross-tab deep links and search pivots coherent on the focused run
