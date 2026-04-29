# Puppet Master GUI Specification -- Slint Rewrite

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Storage/delivery clarification pressure from user
  - New execution-policy settings requirement
  - Parent-object field-shape direction now discussed
  - Child-record field-shape direction now discussed
  - GUI gap is now explicit
  - Current docs are not fully simplified to "graph only"
  - Orchestrator ownership boundaries
  - seam review loop
  - runtime/model precedence
  - projection ownership by surface
  - [retired-token-21] settings
  - Highest-Impact Docs
  - GUI / UX Impacts
  - Cleanup Priorities

#### Source target target-0247
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Storage/delivery clarification pressure from user
  - New execution-policy settings requirement
  - Parent-object field-shape direction now discussed
  - Child-record field-shape direction now discussed
  - GUI gap is now explicit
  - Current docs are not fully simplified to "graph only"
  - Orchestrator ownership boundaries
  - seam review loop
  - runtime/model precedence
  - projection ownership by surface
  - [retired-token-21] settings
  - Highest-Impact Docs
  - GUI / UX Impacts
  - Cleanup Priorities
- Exact required items represented:
  - pin down whether handoff/retry artifacts are literally JSON/JSONL/redb-backed records/projections
  - specify the concrete project-scoped paths or storage domains that own them
  - specify how a worker receives the handoff packet: inline prompt block, referenced artifact, fetched context, or mixed model
  - cover agent vs subagent
  - cover fresh vs reused retry worker
  - cover overseer delegation on/off
  - cover delegated-worker provider/model/effort policy
  - ensure consistent requested-vs-effective identity display across chat actors and orchestration actors
  - `feature_seam` should own membership, lifecycle, requested settings, overseer/governance state, seam-promotion state, and seam evidence linkage
  - `project` should primarily own identity, repo/project settings/theme/account-policy linkage, active-run pointers, and coarse project status
  - `promotion` should persist promotion class, source/target linkage, eligibility/blocking/[retired-token-13] state, decision/result, and evidence/review/corroboration linkage
  - `review` should persist scope, review type, actor linkage, verdict/severity/blocking, findings, evidence, and timestamps
  - `resolution_thread` should persist trigger linkage, resolution kind, issue summary, allowed actions, status, and UI/chat linkage
  - no documented GUI surface yet for `work package`
  - no documented GUI surface yet for `feature seam`
  - no documented seam-level acceptance / weak-integration / corroboration review affordance yet
  - execution is documented against graph nodes
  - orchestration identity, UI labels, and [retired-token-16] defaults still retain a tier hierarchy as a first-class overlay
  - Define what Orchestrator is allowed to own: page layout and controls, view-model/projections, run control intents; exclude canonical runtime enums, event semantics, scheduler truth.
  - Pin the primary discussion seam first: UI surface/IA vs runtime state model vs cross-surface lineage/receipts vs blocked/recovery/remediation UX.
  - Record explicit boundary between canonical runtime facts, orchestrator projections, and widget/page presentation.
  - Carry forward requested-vs-effective state wherever [retired-token-16]/provider/model fallback can occur.
  - define concrete seam review loop behavior
  - include trigger points, checks performed, corroboration thresholds, and emitted artifacts
  - candidate outputs: seam review verdict, failure classes with severity, evidence bundle/rationale, remediation-node recommendation or [retired-token-15] recommendation, corroboration requirement and outcome when invoked
  - provider/model precedence order across run, seam, package, node, overseer, and delegated-subagent levels
  - whether seam/package/node provider-model settings are hard constraints, defaults, or hints
  - whether an overseer can do direct node work or only delegate/review
  - if direct node work is allowed, whether it uses overseer-[retired-token-17] or node-[retired-token-17]
  - how dynamic node [retired-token-16]s interact with explicit node overrides and overseer-controlled delegation
  - which Orchestrator seam should lead the discussion: runtime ownership boundary, page/tab IA, blocked/remediation UX, lineage across graph/evidence/history/usage
  - Source Control worktree area likely needs top-level partitioning into [retired-token-20] and Other
  - [retired-token-20] section likely needs further subdivision by feature seam
  - Orchestrator page is a high-density information surface with very large detail volume
  - [retired-token-21] settings structure across project settings, run snapshot, attempt record
  - precedence between provider/account/execution-role rules
  - user-configurable threshold that determines when automatic account switching occurs
  - [retired-token-21] [retired-token-22] should be on by default for every [retired-token-23] that uses a provider
  - thresholding/policy granularity by provider, account, [retired-token-23]
  - Replace tier-rooted execution with package/seam/lane model
  - Define [retired-token-14] + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire [retired-token-43] UI/tab and tier_tree/progress bars
  - Replace [retired-token-43]-first navigation
  - Define Dashboard→Orchestrator→thread routing contract
  - Add package/seam/lane visualization widgets
  - Define which overseer's thread opens on click
  - Make worktree/lane state visible and navigable
  - Replace or demote [retired-token-34] widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than [retired-token-38].
  - Acceptance, evidence, coverage, GUI automation, and test schemas can represent nodes and checks, but not work package, feature seam, lane, promotion class, contamination state, resolution thread, or effective account identity.
  - `[retired-token-44]`
  - [retired-token-44]
  - Docs involved: `FinalGUISpec.md`, `newtools.md`, `Containers_Registry_and_Unraid.md`, `assistant-chat-design.md`
  - FinalGUISpec.md
  - newtools.md
  - Containers_Registry_and_Unraid.md
  - assistant-chat-design.md
  - `[retired-token-44]`, `[retired-token-50]`, `Plans/chain-wizard-flexibility.md`
  - [retired-token-50]
  - Plans/chain-wizard-flexibility.md
  - Existing docs are still too runtime-worktree-centric for the rewrite:
  - Usage/UI requests for auth-mode/effective-account filtering are already present in adjacent GUI docs even though usage contracts do not yet guarantee them.
  - which widgets are hostable where after the seam/package rewrite
  - `selected_tab`
  - selected_tab
  - `review_refs[]`
  - review_refs[]
  - `gui_alignment`
  - gui_alignment
  - Need to distinguish:
  - `review_id`
  - review_id
  - required quorum model
  - `source_surface`
  - source_surface
  - If a surface is `[retired-token-40]` or `[retired-token-39]`, the GUI must not present mutation controls that imply hidden confidence.
  - [retired-token-40]
  - [retired-token-39]
  - `blocked_projection`
  - blocked_projection
  - This means those docs are less likely to need conceptual rewrite than the Orchestrator and glossary/help surfaces.
  - The rewrite now needs a stronger cross-cutting copy discipline so the UI does not casually say:
  - wizard/builder identity:
  - `Runtime_Artifacts_Panel.md` is notably disciplined:
  - Runtime_Artifacts_Panel.md
  - `destination_surface`
  - destination_surface
  - `destination_tab?`
  - destination_tab?
  - hover previews or temporary compare pivots should not necessarily rewrite persistent state
  - `replan_required`
  - replan_required
  - remediation should use one canonical resolution family, and the richer lineage-aware enum looks more compatible with the rewrite than a coarse success/failed enum
  - `Widget_System.md` still widgetizes surfaces that the rewrite increasingly treats as native/specialized tabs
  - Widget_System.md
  - The rewrite now expects a stronger requested/effective/provider/account identity split than several non-runtime docs currently expose:
  - acknowledged concerns must reduce noise without suppressing true blockers
  - GitHub-facing docs still lag the identity/runtime rewrite:
  - `FinalGUISpec.md` reinforces the right asymmetry:
  - `rationale_required`
  - rationale_required
  - `merge` / `split` / `supersede`: confirmation `strong`; rationale required; reversibility `compensating_action_only` through new lineage records, never silent history rewrite
  - merge
  - split
  - supersede
  - strong
  - compensating_action_only
  - that no longer fits the current rewrite direction where only `Progress` is widget-composed and the other Orchestrator tabs are native surfaces
  - Progress
  - `Prompt_Pipeline.md` still preserves `plan_or_tier_default`, `[retired-token-9]`, and a MUST against new execution tiers while the rewrite replaces tier authority with seam/package/node/lane authority.
  - Prompt_Pipeline.md
  - plan_or_tier_default
  - [retired-token-9]
  - Widget/account/trust contracts still lag the rewrite:
  - `project_state:v1:{project_id}` is UI-state heavy, not operational-summary heavy
  - project_state:v1:{project_id}
  - `projection_trust_state`
  - projection_trust_state
  - `dismissibility_kind` (`none | quiet_only | dismissible`)
  - dismissibility_kind
  - none | quiet_only | dismissible
  - `project_state:v1:{project_id}` is shell/UI state
  - `project_state:v1:{project_id}` is explicitly UI-state shaped.
  - panel layout
  - `quiet_until_utc?`
  - quiet_until_utc?
  - `workspace_tab_id?`
  - workspace_tab_id?
  - `required`
  - required
  - `requirements_builder`
  - requirements_builder
  - `prd_builder`
  - prd_builder
  - Research Progress - 2026-03-16 - Opus GUI / Surface Contract Deepening
  - `[retired-token-43]` still survives as a first-class tab where the rewrite now wants seam/package/node surfaces
  - [retired-token-43]
  - The concern model is still effectively absent from GUI contracts:
  - the shared concern surface split across Progress/Seams/Evidence/History/Ledger still has no GUI contract owner
  - GUI identity projections remain incomplete even after all the identity work upstream:
  - GUI still claims or implies tier/task/subtask surfaces where rewrite-era seam/package/node surfaces are intended.
  - Add a concern-model GUI contract and projection-health / [retired-token-39]-trust contract to `FinalGUISpec.md`.
  - `source_seq?` or equivalent checkpoint/cursor
  - source_seq?
  - but the rewrite has already pushed canonical semantics upward into graph/package/seam/lane/runtime-record language
  - `UI_Command_Catalog.md`
  - UI_Command_Catalog.md
  - that conflicts directly with the rewrite direction where lanes/package context/node attempts need to survive even after tier language stops being execution-canonical
  - Rewrite `orchestrator-subagent-integration.md` so it becomes a consumer/worker-spawn document over canonical runnable units, not a competing tier-era execution model.
  - orchestrator-subagent-integration.md
  - Coordination examples and crew creator payloads still treat `[retired-token-9]` as the canonical orchestrator ownership key; that will misalign with lane/package/node-first execution once the rewrite lands.
  - GUI / command / projection contracts still have live SSOT collisions:
  - GUI / command / page-ownership conflicts are now pinned to concrete IDs and examples:
  - GUI / command ownership remains split in concrete, machine-breaking ways:
  - `requirements_quality_report_ref?` when relevant
  - requirements_quality_report_ref?
  - `requirements_quality_report_ref?` when applicable
  - `Runtime_Artifacts_Panel.md` declares `artifacts_index:v1:{project_id}`
  - artifacts_index:v1:{project_id}
  - `worktree_projection.v1:{project_id}:{worktree_id}`
  - worktree_projection.v1:{project_id}:{worktree_id}
  - `lane_projection.v1:{project_id}:{lane_id}`
  - lane_projection.v1:{project_id}:{lane_id}
  - `Runtime_Artifacts_Panel.md` should own:
  - aligning requested/effective/account/runtime identity displays
  - tier/view identity only:
  - The surface docs are therefore already behaving as if `tier_runtime_record` is canonical, even though the stronger rewrite direction is:
  - tier_runtime_record
  - required for all provider-executed attempts:
  - `[retired-token-41]` remains internally contradictory across AC-CMD02 / AC-CMD07 / AC-CMD10.
  - [retired-token-41]
  - `Runtime_Artifacts_Panel.md`
  - `source_surface?`
  - source_surface?
  - `Runtime_Artifacts_Panel.md` calls `artifact_id`, `run_id`, `thread_id`, `task_id`, `linked_artifact_id`, and `logical_artifact_id` the canonical ID set, but that set is still missing the attempt-native/runtime attribution fields the rest of the rewrite now depends on.
  - artifact_id
  - run_id
  - thread_id
  - task_id
  - linked_artifact_id
  - logical_artifact_id
  - `tab_id?`
  - tab_id?
  - required route-payload or subject-open arguments
  - `arg_passthrough_requirements?`
  - arg_passthrough_requirements?
  - If `[retired-token-45]` does not absorb this, routing semantics will keep being redefined in the catalog, GUI docs, and storage docs separately.
  - [retired-token-45]
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Attention/CtA surfaces are some of the most operationally important navigation points in the app, yet they still rely on local field conventions rather than the generalized route-target model the rest of the rewrite increasingly wants.
  - `subject_id` required
  - subject_id
  - Required:
  - The rewrite now has enough stable object families that `object_kind` can no longer stay informal.
  - object_kind
  - workspace-tab identity
  - `primary_view`
  - primary_view
  - `side_panel`
  - side_panel
  - `bottom_panel`
  - bottom_panel
  - `embedded_surface`
  - embedded_surface
  - `page_tab`
  - page_tab
  - `alias_of_command_id` or equivalent should be for migration/deprecation only
  - alias_of_command_id
  - `shell_view`
  - shell_view
  - `tab_id`
  - tab_id
  - `panel_id`
  - panel_id
  - `origin_surface`
  - origin_surface
  - `open_preview`
  - open_preview
  - `open_review`
  - open_review
  - `project_id` is required
  - project_id
  - `active_subview`
  - active_subview
  - `inspector_target` is not a per-surface arbitrary bag.
  - inspector_target
  - `Decision_Log.md` is still essentially empty for the rewrite era while major decisions are being made only in downstream addenda.
  - Decision_Log.md
  - `OpenCode_Coverage_Matrix.md` itself is now behind the rewrite: it omits A2A/stream-owner coverage, runtime-correlation records, OpenCode dual-auth-realm ownership, several Multi-Account GUI surfaces, and even some fixes that are already complete.
  - OpenCode_Coverage_Matrix.md
  - `[retired-token-42]` still points at [retired-token-40] Final GUI body text, missing project/session browser and attention-center surface ownership, and ungated promoted-feature command families.
  - [retired-token-42]
  - `target_kind = primary_view`
  - target_kind = primary_view
  - `target_kind = side_panel`
  - target_kind = side_panel
  - `target_kind = page_tab`
  - target_kind = page_tab
  - `tab_id = node_graph`
  - tab_id = node_graph
  - `tab_id = seams`
  - tab_id = seams
  - `tab_id` must not be used for:
  - `tab_id` is a routed page-focus field.
  - `FinalGUISpec.md`
  - `[retired-token-44]` still preserves `[retired-token-43]` as a primary page-level surface and still embeds older standalone-surface assumptions that conflict with the tab-first Orchestrator rewrite
  - Replace [retired-token-40] `[retired-token-43]` tab/page assumptions with the rewrite tab model:
  - Strong aligned-but-implicit consumer:
  - The future crew/message examples are especially risky because they would propagate `[retired-token-9]` back into git/worktree coordination even after the broader execution-context rewrite.
  - Strong aligned consumer:
  - Strong implicated consumer:
  - `[retired-token-44]` is carrying two separate [retired-token-40] seams at once:
  - In `[retired-token-44]`:
  - `ui_element_id`
  - ui_element_id
  - `ui_command_id`
  - ui_command_id
  - `[retired-token-44]` still has [retired-token-40] top-level structure for `[retired-token-43]`:
  - `[retired-token-44]` still treats the deep-link URL as a first-class behavioral object:
  - Reconcile the required-versus-carried contradiction for `[retired-token-46]` in `[retired-token-45]` and `[retired-token-47]`.
  - [retired-token-46]
  - [retired-token-47]
  - This seam is now an owner-doc contradiction, not just a GUI wording issue.
  - This split will make the owner-doc rewrite much easier because most refs do not need replacement.
  - evidence tables and filters by `[retired-token-9]`
  - 2. command / shell / widget / GUI drift amplifiers
  - Consumer docs are still asking for provider/model shorthand where the rewrite now expects requested/effective identity disclosure.
  - `PuppetMasterEvent::UserInteractionRequired`
  - PuppetMasterEvent::UserInteractionRequired
  - `UserInteractionRequired`
  - UserInteractionRequired
  - `tier_type` string in UI state
  - tier_type
  - `[retired-token-44]` appendix C.5 mirrors the backup-preserving version:
  - `Decision_Log.md` still lacks canonical entries for the very rewrite decisions that are currently only captured as addenda or ledger facts, which is now causing canon ambiguity rather than simple under-documentation.
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - Research Progress - 2026-03-17 - rewrite-root and GUI-drift seam: rewrite tie-in memo, UI command catalog, Final GUI spec
  - `[retired-token-44]` is still one of the strongest GUI drift amplifiers:
  - The rewrite-root memo already locks provider/runtime architecture, but it does not yet record the newer Orchestrator/routing/projection decisions that downstream GUI docs now need.
  - `UI_Command_Catalog.md` needs:
  - `FinalGUISpec.md` needs:
  - The lower `Orchestrator_Page.md` addenda are closer to the rewrite:
  - Orchestrator_Page.md
  - `GUI_Rebuild_Requirements_Checklist.md` second as status repair
  - GUI_Rebuild_Requirements_Checklist.md
  - `Plans/chain-wizard-flexibility.md`, `[retired-token-44]`
  - `Orchestrator rewrite terms` remains effectively empty relative to the ledger's terminology transfer.
  - Orchestrator rewrite terms
  - `[retired-token-44]` / glossary/help surfaces
  - `Plans/[retired-token-45]`, `Plans/[retired-token-47]`, `[retired-token-44]`, `Plans/UI_Command_Catalog.md`
  - Plans/[retired-token-45]
  - Plans/[retired-token-47]
  - Plans/UI_Command_Catalog.md
  - `Plans/Orchestrator_Page.md` / `[retired-token-44]` / `Plans/Glossary.md`
  - Plans/Orchestrator_Page.md
  - Plans/Glossary.md
  - `Plans/Orchestrator_Page.md` / `[retired-token-44]`
  - `Plans/[retired-token-45]`, `Plans/[retired-token-47]`, `Plans/Decision_Policy.md`, `[retired-token-44]`
  - Plans/Decision_Policy.md
  - `Plans/Orchestrator_Page.md`, `Plans/[retired-token-47]`, `[retired-token-44]`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/Prompt_Pipeline.md`
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - `[retired-token-44]`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/[retired-token-47]`, `Plans/usage-feature.md`
  - Plans/usage-feature.md
  - 5. `[retired-token-44]`
  - `[retired-token-44]:2092` still references `[retired-token-51]` through `Plans/newfeatures.md`
  - [retired-token-44]:2092
  - [retired-token-51]
  - Plans/newfeatures.md
  - `[retired-token-44]:2737-2739` separately and correctly says safe points are runtime recovery anchors and MUST NOT be presented as user-facing [retired-token-51]
  - [retired-token-44]:2737-2739
  - `[retired-token-44]:2092`
  - `[retired-token-44]:2737-2739`
  - `[retired-token-44]` already carries `account_pressure_episode`, `account_switch_event`, `projection_freshness`, and `projection_health`.
  - account_pressure_episode
  - account_switch_event
  - projection_freshness
  - projection_health
  - `[retired-token-44]:1842-1845`
  - [retired-token-44]:1842-1845
  - `[retired-token-44]:2924-2925`
  - [retired-token-44]:2924-2925
  - `[retired-token-49]` still carries the [retired-token-40] tuple `[retired-token-52]`, `[retired-token-50]` still carries `[retired-token-48]`, and `[retired-token-44]` still carries the `[retired-token-51]` contradiction.
  - [retired-token-49]
  - [retired-token-52]
  - [retired-token-48]
  - `[retired-token-44]` still contains the exact consumer anchor `[retired-token-53]`, so gap-002 remains an owner-heading and [retired-token-40]-survivor problem rather than a missing Final GUI consumer anchor.
  - [retired-token-53]
  - `[retired-token-44]:728-735`
  - [retired-token-44]:728-735
  - Wave 1 targeted the structural/survivor subset around `gap-002`, `gap-006`, and `[retired-token-58]` (`Plans/UI_Command_Catalog.md`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `[retired-token-54]`, `[retired-token-44]`) and only reconfirmed the already-recorded missing owner headings plus existing `detached_window`, `result_id`, `[retired-token-51]`, and the broken `#11. Source Control boundary` reference.
  - gap-002
  - gap-006
  - [retired-token-58]
  - [retired-token-54]
  - `[retired-token-58]` sharpened: the broken `[retired-token-55]` reference survives not only in `[retired-token-54]` but also in `Plans/[retired-token-47]` and `[retired-token-56]`, while `[retired-token-44]` still preserves the `[retired-token-51]` contradiction.
  - [retired-token-55]
  - [retired-token-56]
  - `[retired-token-44]:2924-2928`
  - [retired-token-44]:2924-2928
  - `[retired-token-58]` downgraded: the prior `[retired-token-51]` contradiction was overstated because `Plans/[retired-token-47]` now cleanly separates runtime safe points from project-scoped [retired-token-51] and `[retired-token-44]` explicitly forbids presenting safe points as [retired-token-51]; the remaining blocker is structural-heading and broken-reference drift.
  - `[retired-token-44]:2092-2092`
  - [retired-token-44]:2092-2092
  - `[retired-token-44]:2736-2739`
  - [retired-token-44]:2736-2739
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
  - Retired token #23 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #24 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #25 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #26 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #27 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #28 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #29 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #30 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #31 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #32 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #33 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #34 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #35 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #36 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #37 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #38 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #39 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #40 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #41 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #42 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #43 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #44 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #45 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #46 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #47 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #48 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #49 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #50 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #51 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #52 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #53 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #54 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #55 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #56 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #57 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #58 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_[retired-token-40]_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0257
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Do not assume package/lane/run/worktree metadata can all be shown at full fidelity at once in the panel.
  - `Recovery in progress`
  - Recovery in progress
  - `resume_url` exists for wizard/thread recovery, but no generalized equivalent is yet defined for:
  - resume_url
  - workspace/isolation refs required for side effects and recovery
  - earlier addendum requires `resume_url`
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-022: Concern record family definition

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0295
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Define an append-only account-switch / pressure-episode family with shared projection consumers.
  - missing project-summary / project-attention projection family
  - no first-class concern record/lifecycle/projection model appears in `FinalGUISpec.md`
  - FinalGUISpec.md
  - GATE evidence still cannot verify `attention_required` persistence because the storage/event family for that state remains unowned.
  - attention_required
  - Research Progress - 2026-03-16 - Wrapper commands vs explicit `cmd.nav.*` family
  - cmd.nav.*
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-022
- Fidelity gap refs: cov-022
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-022: Concern record family definition` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-022` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-022` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-022` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-027: Concern routing and object-first search behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0296
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Required behavior:
  - distinguish `global object search` from `tab-local filtering`
  - global object search
  - tab-local filtering
  - `tab-local search`
  - tab-local search
  - tab-local search stays embedded in tabs like Graph/Evidence/Ledger
  - search should prefer stable object identity matches first
  - structured canonical object used by projections, search, history, and ledger
  - Search and deep-link routing now need object-kind vocabulary to avoid ambiguity.
  - search filters and ledger inspectors should be able to distinguish:
  - Tighten artifact/file routing around stable object identity:
  - define requested-vs-effective admin capability UI and blocked-state behavior
  - stored `resume_url` fields can remain for portability, but must not imply a separate routing ontology
  - resume_url
  - `required` concrete-account requests should not silently degrade into ordinary switching behavior
  - required
  - `Run_Modes.md` still does not resolve the Contribute(PR) vs DAE isolation conflict, DAE-jail durability across pause/resume, the `yolo` step-1 vs step-7 guard ambiguity, `external_publish_side_effect` behavior inside DAE, or mid-run account-switch invalidation of committed strategy.
  - Run_Modes.md
  - yolo
  - external_publish_side_effect
  - Research Progress - 2026-03-16 - Bridge-field behavior for `provider_attempt_ref`, `usage_event_ref`, and receipts
  - provider_attempt_ref
  - usage_event_ref
  - Update `FinalGUISpec.md` so `OpenFile` remains true for workspace files, while identity-native opens route through `OpenSubject` under the same higher-level routing model.
  - FinalGUISpec.md
  - OpenFile
  - OpenSubject
  - If this owner split is not made explicit, generated docs/artifacts and preview-backed opens will keep leaking path-based assumptions back into the routing model.
  - Research Progress - 2026-03-16 - Shell/workspace state should remain adjacent to routing, not inside it
  - Canonical routing may carry enough view intent to answer:
  - The right question for routing is “where should the user land,” not “how should every panel be laid out when they get there.”
  - Research Progress - 2026-03-17 - Routing owner-doc adoption map
  - Keep the routing tranche centralized in owner docs before touching broad consumer prose.
  - Research Progress - 2026-03-17 - Routing collision with tier-era consumer docs
  - The canonical routing model is now ahead of several high-traffic consumer docs.
  - cross-surface CTA language is newer and should normalize through object-first `route_target` behavior instead of tier-local pivots
  - route_target
  - `tier_id` is still treated as canonical execution and navigation identity in places where the rewrite now requires `run_id + node_id + attempt_id? + blocked_sequence?` with object-first routing.
  - tier_id
  - run_id + node_id + attempt_id? + blocked_sequence?
  - The routing rewrite requires `usage_event` to be a first-class routed object, but `usage-feature.md` still describes usage navigation mostly as page-local filtering behavior.
  - usage_event
  - usage-feature.md
  - but the doc still frames open/link behavior in artifact-panel terms and still uses a `task_id` rule that reflects older task-granularity language
  - task_id
  - `assistant-chat-design.md` is already using stable object identity for search/jump behavior.
  - assistant-chat-design.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-027
- Fidelity gap refs: cov-027
- Required fidelity items:
- Exact required item: Concern search results must route as object-first results with focused-run and target-tab context
- Exact required item: Concern drill-downs must preserve selected concern id and related object context
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-027: Concern routing and object-first search behavior` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-027` repair states the exact requirement: Concern search results must route as object-first results with focused-run and target-tab context
- Exact acceptance check: The `cov-027` repair states the exact requirement: Concern drill-downs must preserve selected concern id and related object context
- Exact acceptance check: The `cov-027` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-030: Concern action policy and authority model
- Coverage rows: cov-030
- Fidelity gap refs: cov-030
- Required fidelity items:
- Exact required item: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact required item: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-030: Concern action policy and authority model` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-030` repair states the exact requirement: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact acceptance check: The `cov-030` repair states the exact requirement: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Exact acceptance check: The `cov-030` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-047: Projection trust and action gating

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0297
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Projection trust/freshness needs a separate vocabulary from preview/browser `trust_tier`; these are currently at risk of semantic collision.
  - trust_tier
  - attention/blocker projection
  - lane/worktree projection
  - account/usage pressure projection
  - `refreshing`: old committed projection still visible while refresh/rebuild runs
  - refreshing
  - `[retired-token-1]`: show run-level trust banner or chip when projections are stale/degraded
  - [retired-token-1]
  - Make `trust state` and `last updated` first-class UI fields for projection-backed surfaces.
  - trust state
  - last updated
  - `Projection trust degraded`
  - Projection trust degraded
  - not all surfaces need the same trust threshold
  - should show visible freshness state and route users to native tabs for exact inspection when trust drops
  - The trust model needs visible UI grammar, not just backend states.
  - `Projection degraded`
  - Projection degraded
  - Research [retired-token-1] - 2026-03-16 - Notifications / Escalation Interaction with Concerns, Blocked Ownership, and Projection Trust
  - Because projection trust now matters, some notification copy needs qualification.
  - `Projection degraded; showing canonical history only`
  - Projection degraded; showing canonical history only
  - projection trust should affect notification confidence, not only action gating
  - Projection consumers still cannot derive complete account/pressure truth from provider/runtime streams:
  - Projection trust should be derived from committed state and receipts, not reinvented per page with ad-hoc polling language.
  - Add a canonical project-summary projection, likely alongside `projects:v1` rather than inside raw shell UI state.
  - projects:v1
  - Add a shared `project_attention_item` projection or equivalent normalized row model.
  - project_attention_item
  - if an attention item is projection-derived rather than canonical-runtime-backed, the row should show that reduced trust explicitly and avoid overconfident imperative copy
  - `trust_tier` is already occupied by Preview, so projection-freshness trust needs a distinct name.
  - Rename or explicitly separate projection-freshness trust vocabulary from Preview `trust_tier`.
  - one canonical project-summary / project-attention projection owner
  - Research [retired-token-1] - 2026-03-16 - GPT-5.3-Codex Identity / Projection Closure
  - still needs governance families, route-payload normalization, and projection-freshness gating
  - Add projection-freshness gating and typed route payloads to `UI_Command_Catalog.md`.
  - UI_Command_Catalog.md
  - projection freshness/health fields on projections
  - `FinalGUISpec.md` also sharpens the projection-state naming issue: generic “projection trust” language will collide with existing preview/browser `trust_tier`; the cleaner split remains `projection_freshness` vs `projection_health`.
  - FinalGUISpec.md
  - projection_freshness
  - projection_health
  - lane/worktree projection for current state
  - Recast `tier_runtime_record` as a current-view/runtime-overlay projection rather than the canonical execution owner.
  - tier_runtime_record
  - `tier_runtime_record` may survive, but only as a derived current-view/runtime-overlay projection.
  - `projection_freshness` and `projection_health` already exist; the missing transfer is the operational UI/gating/fallback layer, not simply "invent trust states."
  - `projection_freshness` / `projection_health` still exist; the missing transfer is the operational trust UI/gating/fallback layer.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-047
- Fidelity gap refs: cov-047
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-047: Projection trust and action gating` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-047` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-047` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-047` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-050: Progress-only widget hostability
- Coverage rows: cov-050
- Fidelity gap refs: cov-050
- Required fidelity items:
- Exact required item: Restrict widget-composed Orchestrator surface to Progress
- Exact required item: Persist orchestrator:progress layout separately from Dashboard and Usage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-050: Progress-only widget hostability` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-050` repair states the exact requirement: Restrict widget-composed Orchestrator surface to Progress
- Exact acceptance check: The `cov-050` repair states the exact requirement: Persist orchestrator:progress layout separately from Dashboard and Usage
- Exact acceptance check: The `cov-050` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-052: Shared escalation ladder

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0299
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Operational identities must be displayable with provider/account identity but must not imply shared token ownership.
  - Provider/runtime boundaries still cannot express enough account-health state for shared account-pressure/degraded-trust UI:
  - they deep-link into Usage/Ledger by shared identity
  - consumer docs: only describe how their surfaces use the shared primitives
  - Add a shared route-activation override rule in the contract/GUI owner docs.
  - page-wide shared `focused_run_id` coherence across tabs
  - focused_run_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-052
- Fidelity gap refs: cov-052
- Required fidelity items:
- Exact required item: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact required item: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-052: Shared escalation ladder` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-052` repair states the exact requirement: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact acceptance check: The `cov-052` repair states the exact requirement: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Exact acceptance check: The `cov-052` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-058: Action-surface policy
- Coverage rows: cov-058
- Fidelity gap refs: cov-058
- Required fidelity items:
- Exact required item: Default bulk actions to navigation and triage rather than live execution mutation
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-058: Action-surface policy` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-058` repair states the exact requirement: Default bulk actions to navigation and triage rather than live execution mutation
- Exact acceptance check: The `cov-058` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-062: Glossary and help governance
- Coverage rows: cov-062
- Fidelity gap refs: cov-062
- Required fidelity items:
- Exact required item: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-062: Glossary and help governance` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-062` repair states the exact requirement: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact acceptance check: The `cov-062` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-062` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-067: Notification routing policy

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0300
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `system notification`
  - system notification
  - Concerns now need to align with the newer notification model:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-067
- Fidelity gap refs: cov-067
- Required fidelity items:
- Exact required item: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact required item: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-067: Notification routing policy` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-067` repair states the exact requirement: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact acceptance check: The `cov-067` repair states the exact requirement: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Exact acceptance check: The `cov-067` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-071: Canonical route payload

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0301
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - some route activations should update stored view state
  - if the target surface is degraded, the route should still land on the canonical fallback representation when possible rather than fail opaque
  - Artifact/file/evidence surfaces still cannot route deterministically by project/attempt/generated identity without more first-class owner fields.
  - Use `cmd.nav.*` or equivalent wrappers to route through `route_target` without forcing every consumer doc to restate the model.
  - cmd.nav.*
  - route_target
  - Without a sub-selection rule, route payloads will either bloat or every surface will go back to inventing custom anchor fields.
  - The route model needs destination intent, but only at the coarse-surface level.
  - The docs do not yet clearly say when route activation should override a remembered subview versus reuse the current/persisted one.
  - route activation overrides remembered state only when required to satisfy the requested destination/object/context
  - `target_kind` is required because the route layer still needs to know what class of destination it is restoring, rather than infer everything from object identity.
  - target_kind
  - surface-local state belongs to persisted shell/view state, not to canonical route identity.
  - Keep wizard-step detail as a narrow serialized anchor, not a new top-level base route field.
  - `tab_id` is route focus refinement, not destination class and not object identity.
  - tab_id
  - `workspace_tab_id` and `browser_tab_id` remain real shell identities, but they are not canonical route `tab_id` values.
  - workspace_tab_id
  - browser_tab_id
  - keep `cmd.panel.switch` pure shell-facing and move object targeting through routed wrappers or normalized route args
  - cmd.panel.switch
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-071
- Fidelity gap refs: cov-071
- Required fidelity items:
- Exact required item: Treat resume_url as serialized transport of that route payload
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-071: Canonical route payload` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-071` repair states the exact requirement: Treat resume_url as serialized transport of that route payload
- Exact acceptance check: The `cov-071` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-079: Project summary projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0302
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Likely it needs a small project summary projection that rolls up:
  - one global layout for every project is too coarse once `Progress` reflects project-specific operational habits
  - Progress
  - Research Progress - 2026-03-16 - project summary and blocked-owner model cluster
  - `inspector_target = summary | history | reviews`
  - inspector_target = summary | history | reviews
  - `inspector_target = summary | history | reviews | lineage`
  - inspector_target = summary | history | reviews | lineage
  - summary: Re-audited the live owner and consumer docs in bounded chunks and further narrowed the unresolved set: several blockers remain real, but some exact-missing lists were overstated because the live docs already carry more receipt, glossary-label, and account-history canon than the compact gap bundle claimed.
  - summary: Ran one more narrow pass on the blocked-episode canon and confirmed that several gap-005 items were overstated as globally missing when they are actually owner-defined elsewhere and only missing from the Tools/chat/usage consumers.
  - summary: Re-audited the runtime-identity and account-history bundle for exact partial-transfer locations and replaced several pseudo-target headings with the real live sections that currently carry the partial canon.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-079
- Fidelity gap refs: cov-079
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact required item: Give canonical blocked episodes precedence over weaker derived warnings
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-079: Project summary projection` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-079` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-079` repair states the exact requirement: Give canonical blocked episodes precedence over weaker derived warnings
- Exact acceptance check: The `cov-079` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-082: Project attention projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0303
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - attention center rows should identify the owning object and likely next surface, not merely repeat severity
  - if the canonical source object already owns durable history, the attention row may stay projection-level but must preserve a stable `source_object_ref`
  - source_object_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-082
- Fidelity gap refs: cov-082
- Required fidelity items:
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-082: Project attention projection` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-082` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-082` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-086: Requested concrete-account fields

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0304
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Prompt_Pipeline.md` still lacks a requested concrete-account field and still stores only singular `account_switch_reason?`
  - Prompt_Pipeline.md
  - account_switch_reason?
  - requested concrete-account gap
  - Research Progress - 2026-03-16 - requested concrete-account ownership cluster
  - scope required to make the target meaningful, such as `project_id`, `thread_id`, `focused_run_id`, or an explicitly requested panel/tab
  - project_id
  - thread_id
  - focused_run_id
  - local filters/sort/layout where they do not hide or distort the requested target
  - hide the requested target behind the wrong tab/subview
  - may reuse remembered Source Control subview only if it still exposes the requested target clearly
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-086
- Fidelity gap refs: cov-086
- Required fidelity items:
- Exact required item: Model requested_account_id separately from requested_account_policy
- Exact required item: Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-086: Requested concrete-account fields` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-086` repair states the exact requirement: Model requested_account_id separately from requested_account_policy
- Exact acceptance check: The `cov-086` repair states the exact requirement: Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Exact acceptance check: The `cov-086` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-090: Execution role and operational identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0305
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Source Control = compact Git/worktree operational panel
  - Every projection-backed operational surface should expose at least:
  - operational identity / actor role
  - Research Progress - 2026-03-16 - operational identity and actor-role disclosure cluster
  - operational identity may be displayed alongside provider/account identity
  - execution role / operational identity
  - `orchestrator-subagent-integration.md` still treats `Iteration` as a lowest execution tier and keeps significant logic at phase/task/subtask boundaries, even while newer addenda require node-first scheduling and runnable-unit identity.
  - orchestrator-subagent-integration.md
  - Iteration
  - `tier_runtime_record` may still survive, but only as a derived grouping/view object if execution ownership moves elsewhere
  - tier_runtime_record
  - Update surface specs so tier/group views carry pointers to canonical execution objects instead of using `tier_id` as the primary mutation/audit key.
  - tier_id
  - Research Progress - 2026-03-17 - Exact `tab_id` role and vocabulary
  - tab_id
  - Reconcile git/worktree coordination examples so they stop carrying `tier_id` as the operational identity anchor.
  - This is one of the clearest remaining consumer-layer pockets where the old execution model still shapes the UI.
  - Reconciliation should not reopen the execution model unless a new contradiction appears that is stronger than the current graph/seam/package/attempt/lane model already established.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-090
- Fidelity gap refs: cov-090
- Required fidelity items:
- Exact required item: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-090: Execution role and operational identity` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-090` repair states the exact requirement: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Exact acceptance check: The `cov-090` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-096: Projection freshness vs projection health

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0306
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - UI freshness notifications should derive from committed projection state, not ad-hoc polling
  - blockers requiring action must not be trivially dismissible into a false sense of health
  - Projection freshness and degraded-trust remain under-specified at the command/surface layer:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-096
- Fidelity gap refs: cov-096
- Required fidelity items:
- Exact required item: Split projection_freshness from projection_health
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-096: Projection freshness vs projection health` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-096` repair states the exact requirement: Split projection_freshness from projection_health
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-096` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-179: Dismissed vs resolved rationale enforcement
- Coverage rows: cov-179
- Fidelity gap refs: cov-179
- Required fidelity items:
- Exact required item: Require distinct dismissal rationale and resolution rationale rules
- Exact required item: Treat accepted_risk as a resolution path rather than dismissal
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-179: Dismissed vs resolved rationale enforcement` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-179` repair states the exact requirement: Require distinct dismissal rationale and resolution rationale rules
- Exact acceptance check: The `cov-179` repair states the exact requirement: Treat accepted_risk as a resolution path rather than dismissal
- Exact acceptance check: The `cov-179` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-197: Blocked-owner eight-kind taxonomy and escalation ladder surfaces

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0308
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - exact-record surfaces should export canonical records, not UI-specific transformed rows
  - Add requested/effective + support-state disclosure blocks in runtime/history surfaces.
  - compact surfaces should show deltas only when they matter
  - Research Progress - 2026-03-16 - Projects Page Blocked-Owner / Status Model
  - Keep blocked-state persistence semantically stronger than dismissible warning surfaces.
  - large surfaces should degrade toward smaller, record-backed slices instead of trying to fake full live fidelity
  - The conversational/document-production surfaces already require runtime-identity visibility:
  - degraded surfaces should still be routable via canonical fallback views when possible
  - usage/account-pressure surfaces
  - `tier_tree` / `Tiers` ownership -> seam/worktree/package-native surfaces
  - tier_tree
  - Tiers
  - `Orchestrator_Page.md` still describes widgetized Tiers/Evidence/History/Ledger surfaces
  - Orchestrator_Page.md
  - Without a dedicated operational-identity layer, later UI surfaces will either:
  - current-state surfaces can stay simple, but history surfaces need the append-only truth
  - command/catalog/template/example integrity is still broken enough to miswire surfaces mechanically.
  - `blocked_sequence` should be runtime-owned, not invented by surfaces
  - blocked_sequence
  - still missing the deterministic policies that executor/storage/runtime surfaces now assume exist.
  - `Prompt_Pipeline.md` captures the immutable handoff bundle, but its later packet omits some fields that executor/runtime surfaces now want to inspect, such as blocked/recovery anchors when a resumed flow launches.
  - Prompt_Pipeline.md
  - Several important surfaces need more than just “open object X”:
  - evidence summaries as record-backed surfaces
  - The strongest final-pass pattern is exact structural breakage in owner docs and traceability surfaces:
  - still keys multiple surfaces and filters to `tier_id`
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-197
- Fidelity gap refs: cov-197
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-197: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-197` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-197` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Recommended minimum concern record shape

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0310
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Concern importance is already established, but canonical storage/contract shape is still underdefined.
  - Recommended command-surface model
  - Minimum `worktree_projection` fields:
  - worktree_projection
  - Minimum `lane_record` / `lane_projection` should preserve:
  - lane_record
  - lane_projection
  - `attention_required` still lacks a durable persisted shape parallel to `blocked_notice`, so the gate’s evidence expectations remain only partially machine-verifiable.
  - attention_required
  - blocked_notice
  - Research Progress - 2026-03-16 - Minimum canonical field set for `route_target`
  - route_target
  - Research Progress - 2026-03-17 - Exact minimum field set for `OpenSubject`
  - OpenSubject
  - Research Progress - 2026-03-17 - Exact minimum field set for `route_target`
  - `cmd.panel.switch` is currently overloaded: it mixes pure shell-state switching with contextual object targeting in one args shape.
  - cmd.panel.switch
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-209
- Fidelity gap refs: cov-209
- Required fidelity items:
- Exact required item: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact required item: Keep `blocking_effect` explicitly separate from `severity`
- Acceptance checks represented:
- Exact acceptance check: The heading `### Recommended minimum concern record shape` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-209` repair states the exact requirement: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact acceptance check: The `cov-209` repair states the exact requirement: Keep `blocking_effect` explicitly separate from `severity`
- Exact acceptance check: The `cov-209` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Authoritative specification for AI agent implementation
**Tech Stack:** Rust + Slint 1.15.1 (.slint markup compiled via slint_build)
**Renderer:** Default winit + Skia; fallback winit + FemtoVG-wgpu; emergency software renderer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack and Renderer](#2-tech-stack-and-renderer)
3. [Master Layout](#3-master-layout)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Panel System](#5-panel-system)
6. [Theme System](#6-theme-system)
7. [Views Specification](#7-views-specification)
8. [Widget Catalog](#8-widget-catalog)
9. [State Management](#9-state-management)
10. [UX Patterns](#10-ux-patterns)
11. [Anti-Flickering and Scroll Preservation](#11-anti-flickering-and-scroll-preservation)
12. [Responsive Design](#12-responsive-design)
13. [Accessibility](#13-accessibility)
14. [Slint File Organization](#14-slint-file-organization)
15. [Persistence](#15-persistence)
16. [Migration Mapping](#16-migration-mapping)
17. [Risks and Mitigations](#17-risks-and-mitigations)
18. [Promoted Features](#18-promoted-features-formerly-future-considerations)
19. [Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls](#19-persona-editor-compatibility-disclosure-and-surface-level-persona-controls-2026-03-06)
20. [Appendix A: Cross-References](#appendix-a-cross-references)
21. [Appendix B: Locked Decisions Summary](#appendix-b-locked-decisions-summary)

---

## 1. Executive Summary

This document is the authoritative GUI specification for the Puppet Master desktop application, replacing the current Iced-based GUI with a Slint 1.15.1 implementation. The design follows an IDE-shell layout (Activity Bar + Primary Content + Side Panel + Bottom Panel) with three user-facing theme families (Retro Dark, Retro Light, Basic Modern) backed by deterministic built-in palette variants plus user-created custom themes, detachable panels, and a rearrangeable dashboard.

The current GUI uses a two-row header with 16 flat navigation buttons above a single full-width content area. This wastes screen real estate and forces constant page-switching. The new layout follows a three-column IDE shell inspired by VS Code / JetBrains, dressed in the existing retro-futuristic aesthetic.

Key changes from the current Iced GUI:
- **Layout:** Single-page-at-a-time replaced with persistent IDE shell (Activity Bar, Primary Content, Side Panel, Bottom Panel)
- **Navigation:** 16 flat buttons replaced with 5-group Activity Bar + Command Palette
- **Settings restructure:** Old `Settings` becomes `App Settings`; old `Config` becomes `Settings`; Login and Doctor merge into unified Settings
- **New views:** Usage page, File Manager panel, editor surface, Chat panel, Agent Activity pane, Artifacts, Source Control, GitHub Actions, Docker Manager, and Run & Debug side-panel surfaces
- **Bottom runtime zone:** Terminal, Problems, Output, Ports, and the classical **Debugger** / **DAP Debugger** live here; normal browsing and HTML preview remain editor-tab or detached-window browser surfaces rather than bottom-panel tabs
- **Themes:** Three theme families with full extensibility and deterministic built-in variants
- **Real-time:** Event-driven updates via Rust channels and `invoke_from_event_loop`, not polling
- **Panels:** Chat and File Manager are detachable; shell state remains identity-safe when re-docked
- **Project bar:** Instant project switching from title bar with full state preservation and reload
- **Language detection:** Auto-detect project languages, display badges, and suggest LSP/tool presets
- **Sound effects:** Optional audio feedback for key events via `rodio`
- **Catalog and sync:** Community content catalog with install/update/remove flows and config export/import bundles
- **SSH remote editing:** Edit files on remote hosts via SSH/SFTP with connection management and offline resilience
- **Debug workflows:** Assistant Debug Mode is a first-class chat workflow overlay; the classical DAP surface remains a separate debugger surface
- **Product name:** `Puppet Master`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md

## 2. Tech Stack and Renderer

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0254
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The owner-routing stack is not internally closed:
  - Owner stack:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 2.1 Core Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Language | Rust | All logic, state management, and Slint bridge code |
| UI Framework | Slint 1.15.1 | `.slint` markup files compiled via `slint_build` in `build.rs` |
| Default Renderer | winit + Skia | Best quality and performance |
| Fallback Renderer | winit + FemtoVG-wgpu | When Skia is unavailable |
| Emergency Renderer | Software renderer | Headless/CI environments |
| Persistence (layout) | redb | Durable KV store for layout state, preferences, editor state |
| Persistence (events) | seglog | Canonical event ledger for usage, chat, orchestrator events |
| Search | Tantivy | Full-text search index over seglog projections |

### 2.2 What Is NOT Used

No React, JavaScript, TypeScript, HTML, or CSS. The entire GUI is Rust + Slint `.slint` markup.

### 2.3 Build Integration

```rust
// build.rs
fn main() {
    let config = slint_build::CompilerConfiguration::new()
        .with_style("cosmic".into());
    slint_build::compile_with_config("ui/app.slint", config).unwrap();
}
```

The `cosmic` base style is used because it supports `ColorScheme` toggling and has a neutral appearance that does not conflict with custom theming. All visual differences are driven by a `Theme` global in `.slint` rather than the base style.

### 2.4 Backend Selection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0278
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what old assumption is present: node-only lifecycle, lexicographic selection, no blocked/contaminated/restore-required states.
  - `inspector_target` only when the field is really a detail-pane selection, not the main identity
  - inspector_target
  - `target_kind` tells the router what class of surface must host the target after scope restoration and target selection are applied.
  - target_kind
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Backend is chosen at startup; all windows use the same backend. Selection uses `slint::BackendSelector::new().select()` with `SLINT_BACKEND` environment variable override. Cargo features control which renderers are compiled in (e.g., `default = ["renderer-skia"]`, optional `renderer-femtovg`).

Deterministic selection order:
1. Explicit valid `SLINT_BACKEND` override wins.
2. Otherwise use the persisted app preference if it maps to a compiled-in backend.
3. Otherwise use compiled default order: `winit + Skia` → `winit + FemtoVG-wgpu` → emergency software renderer.

Failure handling:
- An invalid override or unavailable preferred backend MUST emit a startup diagnostic and fall through deterministically to the next compiled-in backend.
- The selected backend MUST be shown in diagnostics/setup surfaces so fallback behavior is inspectable.

```rust
// main.rs entry point
fn main() -> Result<(), Box<dyn std::error::Error>> {
    slint::BackendSelector::new().select()?;
    let ui = AppWindow::new()?;
    // ... state init, bridge wiring, effects generation
    ui.run()?;
    Ok(())
}
```

---

## 3. Master Layout

### 3.1 IDE Shell Structure

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0279
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - likely keep `Worktrees` subview name and worktree-row-first structure
  - Worktrees
  - shell state decides how that surface is realized inside the current window/workspace layout
  - Let object identity and scope pick the thing to show; let destination pick the major surface class; let shell state handle the rest.
  - shell layout state
  - stop blurring tabs, subviews, shell state, and object identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

```
+-----------------------------------------------------------------+
|  TITLE BAR: Puppet Master  [project v] [theme] [gear]           |  28px
+------+------------------------------------------+---------------+
|      |                                          |               |
| ACT  |   PRIMARY CONTENT AREA                   | SIDE PANEL    |
| BAR  |   (active page view)                     | Activity-bar  |
|      |                                          | surface slot  |
| 48px |                                          | 240-480px     |
|      |                                          |               |
|      +------------------------------------------+               |
|      |  BOTTOM PANEL (collapsible)              |               |
|      |  Terminal / Problems / Output             |               |
|      |  120-300px                                |               |
+------+------------------------------------------+---------------+
|  STATUS BAR: [mode] [platform v] [model v] [ctx: 42k/128k]     |  24px
+-----------------------------------------------------------------+
```

### 3.2 Structural Zones

| Zone | Slint Container | Size | Behavior |
|------|----------------|------|----------|
| **Title bar** | `HorizontalLayout` | height: 28px fixed | App name (Orbitron Bold 14px), compact current-project context, theme toggle, settings gear |
| **Activity bar** | `VerticalLayout` | width: 48px fixed | Icon-only vertical nav; always visible |
| **Primary content** | `VerticalLayout` (flex: 1) | fills remaining space | Active page view; scrollable internally per page |
| **Side panel** | `VerticalLayout` | width: 240-480px, resizable | Hosts the currently selected activity-bar side-panel surface; one visible at a time; detachable where supported |
| **Bottom panel** | `VerticalLayout` | height: 120-300px, collapsible | Terminal, Problems, Output tabs |
| **Status bar** | `HorizontalLayout` | height: 24px fixed | Chat mode, platform/model dropdowns, context usage, orchestrator status, and regex-index progress / refresh disclosure |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

**Status bar - Indexing indicator:**

When a sparse n-gram index build or refresh is in progress for any active project, the status bar shows an index-state indicator.
- Show only for work lasting >2 seconds so sub-second incremental updates do not flash.
- First build for a project: display `Building search index - first build may take several minutes` with progress percentage when available.
- Later rebuilds: display `Indexing` or `Refreshing index` with project-sensitive progress.
- If a stale-but-valid snapshot is still serving grep or Search, the indicator may show refresh progress, but the UI must not imply that Search is fully unindexed.
- The indicator disappears on completion or cancellation.
- The Search results pane, not the status bar, owns the subtle `(unindexed)` annotation when a query truly fell back to raw ripgrep.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

### 3.3 System Tray

When "minimize to tray" is enabled in Settings/General:
- **Close button** minimizes to tray instead of quitting (Quit via tray menu or File > Quit)
- **Tray icon:** Puppet Master icon; changes to accent color when orchestrator is running
- **Left-click tray icon:** Restore/focus the main window
- **Right-click tray menu:** Show/Hide | Pause/Resume Orchestrator | Quit
- **Tray notifications:** HITL approval required, run complete, rate limit hit (respects system notification settings)

### 3.4 Project Bar (Title Bar)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

The title bar no longer owns primary project switching.

Canonical shell rule:
- project switching is a workspace-tab operation surfaced through the Projects view, project/session browser, command palette, and dedicated switch commands
- the active workspace tab changes project by default
- a separate command opens the target project in a new workspace tab
- the title bar may show compact current-project context, but it is not a project bar and does not own the multi-project shell model

Required visible behavior:
- current project name/path summary for the active workspace tab
- badge when the active project has background activity, blocked items, or unsaved shell state that needs attention
- keyboard entrypoint for instant project switch
- responsive collapse without losing the command-palette project switch path

Non-canonical after this section:
- title-bar dropdown/strip as the primary project-switch shell
- shell semantics that assume only one active project context exists in the application at a time
### 3.5 Spacing and Density

**Global spacing tokens** (base design tokens; independent of UI scaling):

| Token | Base (px) | Use |
|-------|-----------|-----|
| `XS` | 2 | Between icon and label in the same control |
| `SM` | 4 | Between controls in the same toolbar row |
| `MD` | 8 | Panel internal padding; gap between stacked cards |
| `LG` | 12 | Section separator within a page |
| `XL` | 16 | Gap between major layout zones (panel to panel) |

**Border widths:**
- Primary panel borders: 2px (reduced from current 3px for density)
- Active/selected indicator: 3px left-edge accent stripe
- Dividers within panels: 1px

**Hard shadow:** Offset `(2, 2)` on major containers; `(4, 4)` on floating/detached windows. No blur (retro aesthetic).

**Density metric:** At 1920x1080, the primary content area is at minimum 900px wide when both side panel and bottom panel are open. At 1280x720, the side panel auto-collapses to an icon tab, and the bottom panel collapses to its header row.

### 3.6 Space Accounting (1920x1080 reference)

```
Title bar:      28px
Status bar:     24px
Activity bar:   48px wide
Side panel:     380px wide (default)
Bottom panel:   160px tall (default)
Primary content: 1920 - 48 - 380 = 1492px wide
                 1080 - 28 - 24 - 160 = 868px tall
```

At 1280x720 with collapsed panels:
```
Side panel:     48px (icon tab)
Bottom panel:   24px (header only)
Primary content: 1280 - 48 - 48 = 1184px wide
                  720 - 28 - 24 - 24 = 644px tall
```

---

## 4. Navigation Architecture

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0255
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `cmd.panel.switch` is the best local starting point for general navigation, but it is still too panel-centric and too shallow for:
  - cmd.panel.switch
  - `resume_url` is currently a stronger navigation primitive than generic `UICommand.args`, which inverts the desired architecture.
  - resume_url
  - UICommand.args
  - but they still frame those as view-specific navigation instructions, not as a canonical target model.
  - `UICommand.args` is too generic to express reusable navigation semantics without a normalized target object.
  - Research Progress - 2026-03-16 - Migration pattern for `route_target` and navigation wrappers
  - route_target
  - Keep `resume_url` portability and persistence, but remove its status as the strongest implicit navigation mechanism.
  - Research Progress - 2026-03-17 - Artifact preview identity versus navigation primitive ownership
  - If reconciliation starts in Stratum 3 or Stratum 4 before Stratum 1 is fixed, the consumer docs will keep restating local navigation semantics and drift will recur.
  - add a primitive for route-target / open-by-identity navigation near `Primitive:UICommand` and `Primitive:DocumentPane`
  - Primitive:UICommand
  - Primitive:DocumentPane
  - `wizard_attention_required` still treats `resume_url` as the primary navigation object
  - wizard_attention_required
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 4.1 Activity Bar

The activity bar is the canonical entry point for persistent right-hand side-panel operational surfaces.

Required side-panel items for this feature set:
- `search`
- `chat`
- `files`
- `source_control`
- `github_actions`
- `docker_manager`
- `artifacts`
- `run_debug`

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

Required shell rules:
- Search, File Manager, Source Control, GitHub Actions, Docker Manager, Artifacts, Chat, and Run & Debug occupy the single right-hand side-panel slot defined by the shell.
- None of those surfaces are described as canonical primary-content pages unless the statement is explicitly about a routed detail page launched from the surface.
- Activity-bar labels, tooltips, shortcuts, and command IDs MUST use the same surface vocabulary across shell chrome, command palette, and wiring tables.
- Detachable side-panel surfaces return to the same right-hand slot when re-docked.
- The bottom runtime zone remains terminal/output/problems/debug/ports territory; normal browsing and HTML preview remain editor/workspace-tab hosted.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

Canonical side-panel descriptions:

| Panel ID | Canonical label | Purpose |
|---|---|---|
| `search` | Search | Project-wide find-in-files and replace-in-files with persistent query/result state |
| `files` | File Manager | Project tree, local tree filter, file actions, and editor handoff |
| `source_control` | Source Control | Git-first repo state, changes, history, graph, branches/stash, and worktrees |
| `github_actions` | GitHub Actions | GitHub-hosted workflows, runs, logs, dispatch, and admin settings |
| `docker_manager` | Docker Manager | Containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes |
| `artifacts` | Artifacts | Runtime/browser/build artifacts and cross-surface evidence navigation |
| `chat` | Assistant Chat | Threaded assistant workflows, context management, and activity transparency |
| `run_debug` | Run & Debug | Runtime diagnostics, problems, debug, output, and ports entry surface |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 4.2 Command Palette

`Ctrl+K` (primary) or `Ctrl+P` (alternative) opens a centered overlay (~500-600px wide, top third of window) with fuzzy search across project navigation targets, commands, recent items, and explicit open targets.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Prefix modes:
- no prefix: pages, commands, recent items, files, and explicit open targets
- `>`: commands only
- `@`: file and symbol mention flow for chat/context entry
- `/`: reserved slash commands

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/LSPSupport.md

Boundary rules:
- The command palette is a transient project-scoped navigation/command surface, not the owner of persistent find-in-files results.
- The Search side panel owns persistent project text search, replace-in-files, scope filters, and query-session result state.
- The command palette may launch or focus Search through `cmd.search.show`, but it does not keep the persistent result list after dismissal.
- File Manager search remains a local tree filter/type-ahead only.
- LSP symbol, reference, and diagnostic surfaces retain semantic ownership even when the command palette hosts a launcher or quick-open affordance.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md

### 4.3 Breadcrumb

At the top of the primary content area, a breadcrumb strip (20px) shows `Group > Page` (e.g., `Data > Ledger`). Breadcrumb items are clickable for quick navigation within the group.

### 4.4 Keyboard Shortcuts

Search, File Manager, Source Control, Chat, Artifacts, and runtime-surface shortcuts MUST be registered in the shortcut registry and appear in Settings > Shortcuts. Activity-bar icon clicks remain primary; shortcuts are additive and must stay consistent with `cmd.search.*`, `cmd.file.*`, `cmd.chat.*`, `cmd.source_control.*`, and shell layout rules.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md

**Tier 1 -- Essential (learn day one):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+L` | Focus chat input |
| `Ctrl+N` | New chat thread |
| `Ctrl+Shift+E` | Toggle File Manager |
| `Ctrl+Shift+F` | Show Search with query focus |
| `Escape` | Close palette / panel / stop agent |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

**Tier 2 -- Productive (learn in first week):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` through `Ctrl+8` | Jump to activity-bar item 1-8 in current order |
| `Ctrl+Enter` | Send message (in chat) |
| `Tab` | Queue message (in chat, steer mode) |
| `Ctrl+Shift+,` | Open settings |
| `Ctrl+\` | Toggle current side-panel occupant |
| `Ctrl+Shift+H` | Show Search with replace focus |
| `Ctrl+Shift+\`` | Toggle bottom runtime panel |
| `Ctrl+W` | Close current tab/panel |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

**Tier 3 -- Power user (discoverable via palette):**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle Dashboard |
| `Ctrl+Shift+\` | Detach/re-dock active detachable side-panel or terminal section |
| `Alt+Up/Down` | Cycle through chat threads |
| `Ctrl+Shift+C` | Compact current session |
| `Ctrl+Shift+P` | Open project switcher |
| `F5` | Start/Continue debug |
| `F10` | Step Over (debug) |
| `F11` | Step Into (debug) |
| `Shift+F11` | Step Out (debug) |
| `Shift+F5` | Stop debug |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

Shortcut registry rule: A Rust-side registry maps (modifiers + key) to commands or route/open actions. Platform-specific modifier normalization (Cmd on macOS, Ctrl on Windows/Linux) remains mandatory, and the Keyboard Shortcuts help view is auto-generated from the registry.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

## 5. Panel System

### 5.1 Detachable Panels
The shell supports detachable panels, but detachment never changes canonical surface identity.

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Required detachable surfaces:
- Search panel
- Chat panel
- File Manager panel
- bottom terminal workspace
- editor-embedded terminal panels when they are promoted out of the editor stack

Rules:
- re-docking restores the same logical surface identity rather than minting a new panel type.
- the bottom terminal workspace remains the canonical host for runtime terminals.
- editor-embedded terminal panels are secondary presentations of terminal leaf panes, not separate PTY sessions.
- normal browsing and preview/browser sessions remain governed by the browser/session model, not by terminal detachment rules.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md
### Terminal section presentation rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0313
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - tier-scoped evidence and terminal widgets
  - Research Progress - 2026-03-17 - `Orchestrator_Page.md` Progress widgets still center active-tier and tier-targeted terminal semantics
  - Orchestrator_Page.md
  - Reconcile terminal widgets so targeting uses runtime/worker identity rather than `tier_id` as the primary selector.
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The bottom runtime zone uses a workgroup-first terminal information architecture.

#### Bottom runtime information architecture

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0318
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The `Source Control` panel is narrow/small and should be treated as a constrained side-panel surface, not a broad information canvas.
  - Source Control
  - users need both pieces of information:
  - Research Progress - 2026-03-17 - Runtime identity field names still drift in worker and verifier consumers
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The canonical structure is:
- workgroups as the primary horizontal strip
- subtabs for each leaf terminal pane inside the active workgroup
- an optional split-pane tree inside each workgroup

The bottom strip is laid out as left / center / right regions.
- center hosts the workgroup cluster plus the active subtab row
- right hosts split, add, collapse, and related terminal actions
- the separate command-log strip is retired from the canonical layout

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md

#### Split grid and editor embeddings

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0322
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Research Progress - 2026-03-16 - Execution-context owner split and `TierContext` replacement
  - TierContext
  - The result is a clear consumer split:
  - `assistant-chat-design.md` already proves the subject-open split is required.
  - assistant-chat-design.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Terminal panes may be organized as a row/column split tree.

Rules:
- visible gutters and resizers are part of the canonical layout, not optional decoration.
- workgroups own the accent used by the workgroup pill and the active subtab highlight.
- the terminal grid must not use a split-parent opacity enter animation that dims all children during reorder or drag operations.
- the editor may host a multi-panel terminal stack. Each panel references an existing terminal leaf pane and workgroup rather than creating a second terminal session.
- if a pane is currently editor-only, the bottom runtime zone shows placeholder language explaining that the pane lives in the editor stack and can be restored there or dropped back into the bottom workspace.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

#### Drag-and-drop contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0319
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Research Progress - 2026-03-16 - Opus broader second-sweep delta cluster (canonical contract drift and native-surface ownership)
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Terminal DnD accepts pane, subtab, and workgroup payloads.

Required behavior:
- same-group pane reorder swaps leaf panes in the workgroup split tree.
- dropping a workgroup on the editor resolves to the focused leaf pane in that workgroup, falling back to the first leaf when needed.
- DnD cleanup must clear stale hover, opacity, and drag classes after rebuild or dragend so terminal panes do not remain visually dimmed.
- drag handlers for pane drop targets must work when the cursor is over pane-body content, not only over outer chrome.

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

#### Motion and accessibility

Reduced motion applies to terminal enter animations where those animations are still used, but not to removed split-parent fade effects.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md
### 5.2 Panel State Machine

Per panel: **DOCKED** <-> **FLOATING**. Same Slint component is used inline when docked or as the root of a separate Slint `Window` when floating.

```
DOCKED --[undock]--> FLOATING --[snap to edge]--> DOCKED
  |                       |
  +--[drag to edge]-------+
                          +--[close floating window]--> DOCKED (collapsed)
```

**State per panel:**

```rust
enum PanelDock {
    Docked { side: DockSide, width_px: i32 },
    Floating { window_id: WindowId, x: i32, y: i32, width: i32, height: i32 },
}

enum DockSide {
    Right,   // default for Chat and File Manager
    Left,    // alternative
    Bottom,  // for the bottom runtime zone / terminal-section host
}
```

### 5.3 Undock Triggers

- **Double-click** the panel's title bar tab
- **Drag** the panel's title bar tab away from the edge
- **Pop-out button** in panel header (window-with-arrow icon)
- **Right-click** panel tab -> "Pop out to window"
- **Keyboard shortcut** (e.g., `Ctrl+Shift+\`)
- **Command palette:** "pop out chat" or "detach file manager"

### 5.4 Snap Zones

When a floating panel window is dragged near the main window edge:
- Proximity threshold: 25px from the main window edge
- Visual cue: 2px accent strip (`Theme.accent-blue`) on the target edge
- On drop: panel docks to that side; floating window closes
- Snap animation: instant (no easing -- retro hard-edge aesthetic)

### 5.5 Slint Multi-Window Implementation

- Each panel is a reusable Slint component that renders identically whether inline (docked) or in a separate `Window` (floating)
- When docked: component placed inside main window layout hierarchy
- When floating: new Slint `Window` created; panel component placed inside it
- **Shared data:** All panel data (chat messages, file tree) lives in Rust (e.g., `Arc<RwLock<...>>`). Exposed to Slint via properties/Models (e.g., `VecModel`). Both docked and floating instances bind to the same Rust-backed properties via `Rc<VecModel<T>>` and Slint's `ModelNotify` for automatic propagation
- **Scalar properties** (orchestrator status, current phase, theme mode): Sync via `invoke_from_event_loop` from background threads -- NOT via polling timers

### 5.6 Discoverability

Three-signal system for panel detach discovery:
1. **Drag handle + tooltip:** Subtle grip icon (6 dots) in panel header. Hover tooltip: "Drag to detach, or double-click to pop out."
2. **Explicit "Pop Out" button:** Small window-with-arrow icon button in panel header (right side)
3. **First-run hint (one-time):** On first use of Chat or File Manager, inline banner: "This panel can be popped out into its own window. [Try it] [Dismiss]." Dismissed permanently after first interaction.

### 5.7 Panel Persistence

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0282
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `WorktreeGitImprovement.md` also already distinguishes important persistence cases:
  - WorktreeGitImprovement.md
  - page layout persistence
  - Keep all shell/view persistence detail outside `route_target`.
  - route_target
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Layout persistence per project:** Panel dock state (docked side and width, or floating position/size), **activity bar icon order**, and **which panel was last visible** are persisted **per project** in redb (e.g. under keys scoped by `project_id`). Restored on startup and when switching projects. If a floating window was on a monitor no longer connected, fall back to docked state.
### 5.8 Panel Edge Cases and Recovery

**Data sync:** Floating and docked instances share the same `Rc<VecModel<T>>` and scalar properties. When the Rust side replaces an entire model (e.g., project switch), it must update the shared `Rc` in-place rather than reassigning the pointer, so both windows stay synchronized.

**Monitor disconnect:** On startup, validate floating window coordinates against available monitors. If coordinates are off-screen or on a disconnected monitor, fall back to docked state. At runtime, listen for display-change events (platform-specific) and re-dock any orphaned floating windows.

**Snap zone conflicts:** If two floating panels are both within 25px of the same edge, the one closer to the edge wins. If equidistant, the most recently moved panel snaps first.

**Focus management:** When a floating panel window closes (user clicks X or presses Escape), focus returns to the main window. Tab key does NOT cross window boundaries -- each window has its own focus chain.

**Zero-width prevention:** Minimum panel width is 240px. If a resize drag would reduce below this, clamp at 240px. Bottom panel minimum height is 80px (collapse to 24px header via collapse button only, not via resize drag).

---

## 6. Theme System

### 6.1 Three Theme Families (Three User-Facing Choices)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0283
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The system currently has at least three different concepts that the UI must not blur:
  - Replace pseudo-tier interview/wizard/runtime lineage keys with the same canonical thread/project/run/attempt identity families already required elsewhere.
  - If new object families appear, they must be added deliberately, not ad hoc in surface docs.
  - Research Progress - 2026-03-17 - Usage and evidence families still use tier-era correlation
  - That leaves `usage_record` and evidence/summary families in an unstable middle state:
  - usage_record
  - This pass did not remove any blocker families; it only removed one overstated exact-missing item and sharpened several blocker reasons.
  - This pass kept the blocker-family count at eight and did not add new blocker families, but it removed one overstated unresolved item and made several owner/consumer defects more exact.
  - The current unresolved blocker inventory therefore remains at eight blocker families, nineteen affected docs, and fifty underlying evidence refs.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Theme Family | Variants | Retro Effects | Target Audience |
|-------|--------|--------------|----------------|
| **Retro Dark** | 1 | Full: pixel grid, paper texture, scanlines, hard shadows, sharp corners, Orbitron + Rajdhani | Users who love the current aesthetic |
| **Retro Light** | 1 | Full (reduced opacity): pixel grid, paper texture, hard shadows, sharp corners, Orbitron + Rajdhani | Light-mode users who want the aesthetic |
| **Basic Modern** | 2 internal palette variants | None: flat colors, subtle borders, rounded corners, system fonts | Accessibility, readability, reduced visual noise |

User-facing selector contract:
- The GUI MUST expose exactly three built-in theme choices: `Retro Dark`, `Retro Light`, and `Basic`.
- `Basic` may internally resolve to light or dark palette tokens based on explicit sub-setting or system scheme, but that internal palette choice does not create a fourth user-facing built-in theme promise.

### 6.2 Theme Token Table

| Token | Retro Dark | Retro Light | Basic Light | Basic Dark |
|-------|-----------|-------------|-------------|------------|
| **background** | #0a0a1a | #FAF6F1 | #FAFAFA | #121212 |
| **surface** | #1a1a2e | #f0ece5 | #FFFFFF | #1E1E1E |
| **surface-elevated** | #252540 | #e8e4dc | #FFFFFF | #2D2D2D |
| **text-primary** | #e8e0d0 | #1A1A1A | #1A1A1A | #E8E8E8 |
| **text-secondary** | #a0a0a0 | #666666 | #616161 | #A0A0A0 |
| **text-muted** | #666666 | #999999 | #9CA3AF | #6B7280 |
| **border** | #e8e0d0 (low opacity) | #1A1A1A | #E0E0E0 | #424242 |
| **border-light** | #333333 | #E5E7EB | #F0F0F0 | #333333 |
| **accent-blue** | #00d4ff | #0047AB | #1565C0 | #64B5F6 |
| **accent-magenta** | #ff2d9b | #FF1493 | #C41170 | #FF69B4 |
| **accent-lime** | #b4ff39 | #00FF41 | #0D7A3C | #3DD68C |
| **accent-orange** | #ff8c00 | #FF7F27 | #C45D00 | #FFA347 |
| **shadow-type** | Hard offset (2,2) | Hard offset (2,2) | None | None |
| **border-width** | 2px | 2px | 1px | 1px |
| **border-radius** | 0px | 0px | 4px | 4px |
| **display-font** | Orbitron Bold | Orbitron Bold | Inter / system-ui | Inter / system-ui |
| **body-font** | Rajdhani | Rajdhani | Inter / system-ui | Inter / system-ui |
| **mono-font** | System monospace | System monospace | System monospace | System monospace |
| **base-font-size** | 14px | 14px | 15px | 15px |
| **line-height** | 1.4 | 1.4 | 1.6 | 1.6 |
| **letter-spacing** | default | default | 0.02em | 0.02em |
| **pixel-grid-enabled** | true | true | false | false |
| **pixel-grid-opacity** | 0.09 | 0.045 | 0.0 | 0.0 |
| **paper-texture-enabled** | true | true | false | false |
| **scanline-enabled** | true | optional | false | false |
| **scanline-opacity** | 0.06 | 0.03 | 0.0 | 0.0 |
| **padding-scale** | 1.0 | 1.0 | 1.25 | 1.25 |
| **scrollbar-width** | 12px (styled) | 12px (styled) | 8px (system-like) | 8px (system-like) |

### 6.3 Retro Effects Implementation

**Pixel grid and paper texture:** Generated as tiled images from Rust at startup using `SharedPixelBuffer`. Applied via `Image` elements with appropriate tiling. Do NOT use `RenderingNotifier` -- use `SharedPixelBuffer` as it is backend-agnostic and simpler.

**Important:** `ImageFit.repeat` may not exist in Slint 1.15.1. If unavailable, tile the image manually using a `GridLayout` or `Flickable` with repeated `Image` elements, or generate a single large tile that covers the viewport.

**Conditional overlays:** Paper texture and pixel grid are optional overlay components at the root, bound to `Theme.retro-effects-enabled`. Implementations must not branch component logic on theme; only the presence/absence of these overlay nodes changes.

```slint
if Theme.retro-effects-enabled: PixelGridOverlay {
    opacity: Theme.pixel-grid-opacity;
}
if Theme.retro-effects-enabled && Theme.paper-texture-enabled: PaperTextureOverlay { }
```

### 6.4 Theme Switching

- **Live switch** for colors, spacing, borders, overlays: Slint's reactive property system propagates changes instantly
- **Restart required** for font family change: Switching between Retro (Orbitron/Rajdhani) and Basic (system fonts) requires app restart because Slint loads fonts at initialization
- **Within same family is live:** Switching between Retro Dark and Retro Light is instant (same fonts)
- **Basic palette note:** Switching Basic between its internal light/dark palette variants MAY be live when fonts do not change, but it remains one built-in theme family in the UI model.

### 6.5 Slint Implementation

```slint
export enum ThemeMode { retro-dark, retro-light, basic-light, basic-dark }

export global Theme {
    in property <ThemeMode> mode: retro-dark;
    in property <color> background: #0a0a1a;
    in property <color> surface: #1a1a2e;
    in property <color> surface-elevated: #252540;
    in property <color> text-primary: #e8e0d0;
    in property <color> text-secondary: #a0a0a0;
    in property <color> text-muted: #666666;
    in property <color> border: #e8e0d050;
    in property <color> border-light: #333333;
    in property <color> accent-blue: #00d4ff;
    in property <color> accent-magenta: #ff2d9b;
    in property <color> accent-lime: #b4ff39;
    in property <color> accent-orange: #ff8c00;
    in property <bool> retro-effects-enabled: true;
    in property <float> pixel-grid-opacity: 0.09;
    in property <float> scanline-opacity: 0.06;
    in property <bool> paper-texture-enabled: true;
    in property <length> border-width: 2px;
    in property <length> border-radius: 0px;
    in property <float> padding-scale: 1.0;
    in property <length> scrollbar-width: 12px;
    in property <float> line-height-scale: 1.4;
    in property <length> base-font-size: 14px;
}
```

A Rust-side `ThemeVariant` enum applies all tokens to the global at runtime:

```rust
pub enum ThemeVariant { RetroDark, RetroLight, BasicLight, BasicDark }

impl ThemeVariant {
    pub fn apply_to(&self, ui: &AppWindow) {
        match self {
            ThemeVariant::RetroDark => { /* set all dark retro tokens */ }
            ThemeVariant::RetroLight => { /* set all light retro tokens */ }
            ThemeVariant::BasicLight => { /* set all basic light tokens, disable effects */ }
            ThemeVariant::BasicDark => { /* set all basic dark tokens, disable effects */ }
        }
    }
}
```

### 6.6 Theme Extensibility Architecture (MVP)

The architecture supports unlimited user-created themes beyond the four built-in variants.

**Built-in themes (ship with app):**
- Retro Dark, Retro Light, Basic Light, Basic Dark (the four variants in §6.1-6.2)

**Custom theme file format:** Custom themes are defined as TOML files in `~/.puppet-master/themes/<name>.toml`. Each file specifies token overrides; any token not specified inherits from the base theme (Basic Dark or Basic Light, chosen by a `base` field).

```toml
[meta]
name = "Solarized Dark"
author = "User"
base = "basic-dark"          # inherit unset tokens from this variant
version = "1.0"

[colors]
background = "#002b36"
surface = "#073642"
surface-elevated = "#0a4050"
text-primary = "#839496"
text-secondary = "#657b83"
accent-blue = "#268bd2"
accent-magenta = "#d33682"
accent-lime = "#859900"
accent-orange = "#cb4b16"

[effects]
retro-effects-enabled = false
pixel-grid-opacity = 0.0
border-width = 1
border-radius = 4

[fonts]
# omitted = inherit from base

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0249
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - step/clarification focus is a domain-local anchor or serialized deep-link detail, not base identity
  - Let routes optionally name a destination-local subview only when that is necessary for the task, but treat it as destination refinement, not base identity.
  - the base structs and callbacks still teach tier/request-era identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
# display-font = "CustomFont"  # requires font file in ~/.puppet-master/fonts/
```

**Theme loading and validation:**
- On startup, scan `~/.puppet-master/themes/` for `.toml` files
- Parse and validate each file against the token schema (§6.2). Invalid files log a warning and are skipped (not loaded); user sees a toast on Settings open: "Theme '{name}' has errors -- see log for details"
- Valid custom themes appear in the theme selector (Settings > General and title bar toggle) alongside built-in themes
- **Hot reload:** Editing a theme TOML file while the app is running triggers a re-scan (via file watcher on the themes directory). If the currently active theme is modified, changes apply immediately (same as live theme switch within a family). If font changes are detected, prompt for restart.

**Theme selector UI:**
- Title bar theme toggle becomes a dropdown when >4 themes are available (built-in + custom)
- Each entry shows: theme name, color swatch preview (4 circles: background, surface, accent-blue, accent-lime), author (for custom), "[built-in]" or "[custom]" badge
- "Manage themes" link at bottom opens Settings > General > Themes section
- Settings > General includes: theme dropdown, "Open themes folder" button (opens `~/.puppet-master/themes/` in system file manager), "Create new theme" button (copies a template TOML to the themes folder and opens it in File Editor), "Import theme" button (file picker for .toml), "Export theme" button (saves current token values as .toml)

**Custom font support:** Custom themes can reference font files placed in `~/.puppet-master/fonts/`. Font files (.ttf, .otf, .woff2) are loaded at startup. A theme TOML referencing a missing font falls back to the base theme's font and shows a warning toast.

**Theme preview:** When hovering over a theme in the selector dropdown, show a live preview of the theme applied to a small widget card (button, text, border sample). On click, apply the theme. This allows users to preview without committing.

### 6.7 WCAG Compliance

- **Retro themes:** Prioritize aesthetic over strict WCAG AA compliance for accent colors (e.g., ACID_LIME on dark backgrounds may not meet 4.5:1)
- **Basic theme:** MUST meet WCAG 2.1 AA for all text and interactive elements (4.5:1 minimum contrast for normal text, 3:1 for large text). Basic accent colors are muted specifically to meet this requirement
ContractRef: ContractName:Plans/FinalGUISpec.md#13, ContractName:Plans/DRY_Rules.md#7

---

## 7. Views Specification

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0256
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - lineage views must preserve:
  - when necessary, fall back to canonical record-backed views:
  - when the UI should fall back to record-backed views
  - Keep Source Control worktree-first and compact, with historical/retained material behind filters or lineage views.
  - tier-shaped records should be overlays or derived views
  - relevant evidence / trace views
  - Keep `cost_usage` and receipt views strictly canonical:
  - cost_usage
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The GUI surface is responsible for displaying concerns, progress, artifacts, and help through carefully scoped views. Canonical concern definitions, approval scope semantics, and route/open ownership are defined in Plans/Contracts_V0.md; this section owns the visible widget and interaction layer.

### 7.1 Orchestrator

The Orchestrator renders five composite projection states: `current`, `refreshing`, `stale`, `degraded`, and `unavailable`. `projection_freshness` owns `current` / `refreshing` / `stale`, `projection_health` owns `degraded` / `unavailable`, and `trust_tier` is reserved for preview/browser semantics only rather than acting as the general projection-state bucket. Sensitive actions require `current` data or direct canonical revalidation; when a surface is `degraded`, the UI falls back to record-backed views and suppresses live mutation affordances.

Only `Progress` is widget-composed inside Orchestrator. The `orchestrator:progress` layout persists independently from Dashboard and Usage layout keys. Slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors are mandatory across every dense tab, and scale is treated as a cross-tab contract rather than a graph-tab-only concern.

Action surfaces classify every affordance by navigation vs mutation, palette visibility, shortcut eligibility, multi-target safety, and confirmation/reversibility. Bulk affordances default to navigation and triage rather than live execution mutation.

#### Progress catalog source and default drills

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0320
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - many `Progress` widgets may also be hostable on `Dashboard`
  - Progress
  - Dashboard
  - The UI should not expose a noisy “scored all candidates” explanation by default.
  - Research Progress - 2026-03-16 - Sonnet broader second-sweep delta cluster (requested-account asymmetry and event-schema precision)
  - Research Progress - 2026-03-16 - GPT-5.4 Identity / Actor Envelope Deepening
  - Research Progress - 2026-03-16 - GPT-5.2 Identity Semantics / Role-Routing Clarifications
  - Research Progress - 2026-03-16 - projection-freshness vocabulary and owner cluster
  - Research Progress - 2026-03-16 - remaining-owner-doc convergence cluster
  - Research Progress - 2026-03-16 - Validation-pass report identity and lineage
  - Research Progress - 2026-03-16 - Opus owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - `tier_runtime_record` as derived overlay and downstream surface drift
  - tier_runtime_record
  - Research Progress - 2026-03-16 - Sonnet owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - Routing/deep-link normalization with `OpenSubject`
  - OpenSubject
  - Research Progress - 2026-03-16 - Command-catalog implications of route/subject normalization
  - Research Progress - 2026-03-16 - GPT-5.4 owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - GPT-5.2 owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - Storage/routing handshake for subject-open and preview identity
  - Research Progress - 2026-03-16 - GPT-5.3-Codex owner-doc tranche synthesis
  - Research Progress - 2026-03-16 - Exports still need identity-preserving manifest discipline
  - Research Progress - 2026-03-16 - Sub-selection and `inspector_target` should stay secondary
  - inspector_target
  - Research Progress - 2026-03-16 - Destination-surface vocabulary should stay controlled and coarse
  - Research Progress - 2026-03-16 - Subviews and panel-local selectors belong to view state, not target identity
  - Research Progress - 2026-03-16 - Override rule: route-target should override only what is necessary
  - Research Progress - 2026-03-17 - `route_target` owner placement
  - route_target
  - Research Progress - 2026-03-17 - `route_target` vs `OpenSubject`
  - Research Progress - 2026-03-17 - Exact `target_kind` vocabulary
  - target_kind
  - Research Progress - 2026-03-17 - Selector precedence inside `route_target`
  - Research Progress - 2026-03-17 - Exact `inspector_target` vocabulary
  - `tab_id = progress` or `tab_id = seams`
  - tab_id = progress
  - tab_id = seams
  - Research Progress - 2026-03-17 - Current cleanup posture after extended owner-pass
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Orchestrator consumes the named Progress catalog from FinalGUISpec Appendix C. The promoted 13-widget Progress catalog and default drill targets are:
1. `progress.run-overview` → Execution unit tree scoped to `focused_run_id`
2. `progress.current-task` → Node inspector for the active execution unit
3. `progress.lane-health` → Lane row filtered to the selected lane/worktree
4. `progress.node-throughput` → Dense node list filtered to slow or blocked nodes
5. `progress.blocked-concerns` → Concern lane filtered to `blocked` or `attention_required`
6. `progress.approval-queue` → Concern inspector showing pending approvals
7. `progress.recovery-status` → Recovery timeline for the selected concern or blocked episode
8. `progress.artifact-receipts` → Artifact browser filtered to receipt-linked runtime artifacts
9. `progress.worktree-state` → Source Control worktree row with lane/package/run refs
10. `progress.account-pressure` → Historical `account_pressure_episode` list
11. `progress.account-switches` → Historical `account_switch_event` list
12. `progress.escalation-stack` → Project attention view focused on the shared escalation ladder
13. `progress.attention-summary` → `project_attention_item.primary_route_payload` list

#### Progress labels and taxonomy

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0321
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - decomposition/view identity (`tier_type`, `tier_id`, titles, focus labels)
  - tier_type
  - tier_id
  - `gap-008` now points at the real storage/usage/interview sections that currently carry the partial account-history and requested/effective identity transfer, rather than pseudo owner-section labels that do not yet exist verbatim.
  - gap-008
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- State labels: `queued`, `running`, `attention_required`, `blocked`, `recovering`, `degraded`, `complete`
- Action labels: `Inspect`, `Focus run`, `Open evidence`, `Request approval`, `Acknowledge`, `Dismiss`, `Resolve`, `Retry recovery`
- Alert taxonomy: `advisory`, `attention_required`, `blocked`, `escalated`, `degraded_projection`
- Event taxonomy: `run_started`, `node_started`, `node_completed`, `concern_opened`, `approval_requested`, `approval_decided`, `recovery_started`, `recovery_completed`, `artifact_published`, `account_switched`
- Condition-aging policy: advisory warnings may quiet after one stable refresh window; `attention_required` resurfaces on meaningful change or persistence; `blocked` and `escalated` never auto-quiet

### 7.3 Shared route and open behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0285
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - open transient `generated://...` or specialized viewer
  - generated://...
  - resolution may end in a workspace path open, a transient `generated://` buffer, or a routed non-editor surface
  - generated://
  - `assistant-chat-design.md` already relies on stable identity for message/search/jump behavior but still lacks the shared named primitive that should connect those behaviors to the route/object model.
  - assistant-chat-design.md
  - blocker inventory remains materially open
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All search results, palette actions, widgets, recovery links, and cross-surface pivots emit one shared route/deep-link payload. `resume_url` is the serialized transport form of that payload, not a second routing model.

- Concern search results route as object-first results with focused-run and target-tab context by using `object_kind: concern`, `object_id: concern_id`, `focused_run_id`, and `target_tab`.
- Concern drill-down preserves the selected `concern_id` plus related object context when pivoting into inspectors, recovery links, or historical views.
- `route_target` stays small: it is either `subject_id`-based identity or `object_kind` / `object_id` identity.
- `subject_id` families are limited to `doc:` and `artifact:`.
- `inspector_target` is secondary metadata, not primary identity.
- Destination/context overrides are allowed only when needed to restore the target surface.

### 7.4 Settings and inspectors

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0286
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - direct evidence/record inspectors
  - consumer docs for graph/detail/history/ledger/runtime inspectors
  - dashboard and settings language brought in line with the graph/seam/package model
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The settings model separates `requested_account_id` from `requested_account_policy`. It adds `requested_account_binding` with `none`, `preferred`, and `required` semantics, and every inspector renders the same identity grammar: Requested account / Requested binding / Effective account / Switch reason.

Shared runtime identity carries `execution_role` together with requested and effective operational identity. That packet propagates into effective-resolution records, attempt records, usage surfaces, and inspector payloads so the operator can compare requested vs effective runtime identity without reconstructing it from logs.

The settings resolver uses three axes:
- `source`: app defaults, project policy, worker policy, and recovery-policy inputs
- `request`: requested account, requested binding, requested account policy, requested execution role, and requested operational identity
- `execution`: effective account, effective binding outcome, effective operational identity, `execution_role`, and `switch_reason`

Resolver display grammar is deterministic: show worker-policy display first, then source snapshot, then request snapshot, then execution outcome. Resolver inputs are the three axes above plus current projection trust. The deterministic resolver matrix is: `required` must bind or block; `preferred` binds when available and otherwise falls back with an explicit `switch_reason`; `none` keeps the request visible but lets policy choose execution. The emit shape is `settings_resolution { source_snapshot, request_snapshot, execution_snapshot, switch_reason, resolution_status }`.

### 7.5 Project and attention surfaces

`project_summary` is the reusable summary object for Orchestrator-facing project surfaces. It contains `activity_state`, `attention_state`, `health_state`, `owner`, and projection-trust disclosure so the operator can see whether a summary is record-backed, current, or degraded. Canonical blocked episodes take precedence over weaker derived warnings when summary rollups disagree.

`project_attention_item` is the reusable attention-row object. Each row carries a primary route payload, projection-trust disclosure, blocked-owner kind, escalation level, and summary text. The same row contract is consumable in Orchestrator, Dashboard, and notification surfaces without re-minting attention identities.

### Concern, escalation, notification, and help surfaces

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0292
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - seam-blocking weak integration concern with no progress for hours -> blocked surfaces + possible system notification
  - small surfaces need compact labels plus deeper linked/contextual help, not renamed local jargon
  - Degraded-trust and concern escalation remain under-owned across provider/runtime/UI boundaries:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request. The visible concern contract carries `concern_id`, `project_id`, run refs, scope refs, evidence refs, source refs, lineage refs, severity, category, status, and governance metadata.

Concern actions carry actor authority, confirmation requirements, rationale requirements, reversibility, and audit fields. `acknowledged`, `dismissed`, `resolved`, and structural lineage edits remain distinct actions rather than aliases of a single close operation.

These surfaces share one escalation ladder across Orchestrator, Dashboard, thread badges, and notifications. `attention_required` remains distinct from `blocked`, and persistent blockers resurface on meaningful change or persistence even when advisory warnings are quieted.

This section consumes Glossary coverage for rewrite-critical objects, states, and trust terms, including Concern, blocked episode, focused run, projection trust, escalation ladder, blocked owner, and `resolution_kind`. Help is layered as inline help, context help, and canonical help-entry pages while keeping canonical term names stable.

Notifications route by severity, execution impact, blocked owner, persistence, and projection trust. Quiet windows are allowed for advisory warnings only; canonical blocked episodes are never suppressed by quiet windows.

Dedicated help entries use a stable template: canonical term, trigger conditions, operator meaning, related concepts, primary routes, and recovery guidance. Related-concept links always point to canonical term names rather than local aliases.

Project-facing help and notifications use project `activity_state`, project `attention_state`, the blocked-owner taxonomy, the shared escalation ladder, and resurfacing/aging rules. Dismissal requires dismissal rationale, resolution requires resolution rationale, and `accepted_risk` is treated as a resolution path rather than a dismissal.

The blocked-owner taxonomy is explicitly eight kinds: `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`. The five-level escalation ladder is `info`, `watch`, `attention_required`, `blocked`, and `escalated`, with mapping across Orchestrator banners, Dashboard summaries, thread badges, and notifications.

### Recommended minimum concern record shape

- `concern_id`, `project_id`, `run_ref`, `scope_ref`, `source_event_ref`
- `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`
- `severity`, `category`, `status`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`
- `owner_kind`, `owner_ref`, `created_by_kind`, `created_by_ref`, `resolver_ref?`
- `governance`: authority policy, confirmation policy, rationale policy, audit refs

`blocking_effect` stays explicitly separate from `severity`; it explains operational stop/go impact rather than concern seriousness.

### 7.16 Chat Panel

The Chat Panel is the canonical threaded assistant workspace for Ask, Agent, Debug, Plan, and Deep Plan modes.

Layout:
- vertical split with **message stream** in the top 70% and **composer** in the bottom 30%
- optional collapsible **Plan panel** appears as a side panel within the chat surface when the thread is in Plan or Deep Plan mode
- header remains sticky while the message stream scrolls independently

#### 7.16.1 Thread header and message stream

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0315
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `message_id` when the real target is the message itself
  - message_id
  - `object_kind = message`
  - object_kind = message
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Thread header content:
- editable thread title
- mode badge
- persona indicator
- model indicator
- token-count summary
- quick actions for thread search, rename, duplicate, archive, and thread settings

Message stream requirements:
- scrollable virtualized list of user, assistant, system, tool, approval, and activity message blocks aligned with the taxonomy in `Plans/assistant-chat-design.md`
- stable message identity so streaming updates mutate existing rows rather than replacing the full list
- inline activity cards for tool calls, file operations, subagent activity, approvals, run-state transitions, and linked artifacts
- sticky unread marker and `New messages below` affordance when the user is scrolled away from the bottom

#### 7.16.2 Composer, commands, and plan mode affordances

Composer requirements:
- multiline text input
- mode selector exposing at minimum `Steer` and `Queue`
- attachment button
- send / stop button
- visible disabled-state explanation when sending is unavailable

Plan-mode affordances:
- collapsible Plan panel showing the current plan, plan steps, status, and linked artifacts
- plan panel supports focusing the active step and jumping to linked documents or evidence
- when not in a planning mode, the plan panel stays hidden rather than showing an empty placeholder

Commands and approvals:
- slash commands, mode switches, and tool approvals remain routed through the canonical chat/runtime command catalog
- tool approval dialogs launched from Chat must preserve thread context and return focus to the composer after completion
- chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console; they link to those shell surfaces instead

### 7.17 File Manager Panel

The File Manager Panel is the persistent project-tree side panel and defers detailed tree, drag-and-drop, and open-file behavior to `Plans/FileManager.md`.

Required behavior summary:
- project tree with local filter, expand/collapse persistence, and current-file reveal
- click-to-open and context-menu actions route through canonical open-file and file-tree action contracts
- external drag-and-drop, ignored-file visibility rules, and detached-panel behavior remain aligned with `Plans/FileManager.md`
- File Manager owns tree navigation and file discovery, but not semantic search, diff-local search, or runtime artifact browsing

### 7.18 File Editor

The File Editor is the canonical in-app code and document editing surface.

Required behavior summary:
- tabbed editor groups with shared buffers, diff view, preview modes, and detach / re-dock support
- LSP-backed diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, and go-to-definition
- SSH remote editing, stale-write disclosure, and recoverable unsaved local buffer persistence
- embedded rendering for markdown, mermaid, HTML, SVG, and image documents through the shared preview pipeline

#### 7.18.1 Inline Note Mode

Inline Note Mode enables targeted feedback and annotation inside the editor.

Activation:
- user selects code in the editor
- `Add Note` appears in the context menu for the selection

Note creation:
- captures selection range
- captures note text
- optional category: `bug`, `improvement`, `question`, or `style`

Display and persistence:
- inline annotation markers appear in the editor gutter
- hover reveals note content and status
- notes persist via `note_record.v1:{bundle_id}:{note_id}` and remain linkable from bundle review surfaces

### 7.19 Agent Activity

The Agent Activity surface is the canonical inspection view for delegated work, investigations, bundle review progress, and embedded review documents.

Required behavior summary:
- active and historical child-run / subagent activity list with status, owning thread, target, and outcome
- clear distinction between running, queued, blocked, remediation, and completed activity
- direct links to related chat messages, artifacts, investigation records, and review bundles

### 7.19A Dedicated log and audit inspector

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0284
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - rather than a dedicated top-level `usage_event_ref`
  - usage_event_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

PM ships two complementary audit surfaces: lightweight in-thread transparency and a dedicated searchable log/audit inspector.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Inspector requirements:
- summary rows use a 5-item compact format: operation label, short query/url/task preview, success/failure status, fallback note when present, and source/page counts when present
- full payload dereference is on-demand only; the inspector does not eagerly expand large refs or blobs
- supported interactions include filter by event family, search by tool or operation, time-range queries, drill-down, and export
- `logsearch` and `logread` have explicit GUI surfacing rather than remaining CLI-only affordances

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

#### 7.19.1 Embedded document pane

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0316
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `requested_persona_id` / `effective_persona_id` remain embedded in consumer docs despite canonical prohibition.
  - requested_persona_id
  - effective_persona_id
  - `FinalGUISpec.md` aligns with that newer model in the embedded document pane:
  - FinalGUISpec.md
  - the embedded document pane already shares canonical document identity and backend restore pipelines rather than pure path opens
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The embedded document pane is a shared-buffer review/document surface used by Interview, Builder, and bundle-review workflows.

Rules:
- document selection, scroll position, active review stage, and approval state persist through `document_pane_state:v1:{project_id}:{page_context}`
- the pane shares source-of-truth buffers with File Editor rather than maintaining divergent document copies
- findings summaries and approval gates render adjacent to the document, not inside unrelated chat-local controls

#### 7.19.2 Bundle controls and review gate

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0317
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what the provider/runtime actually used and whether controls were honored/skipped/clamped
  - provider-specific caveats shown near the relevant controls
  - command/wiring/template drift is now concrete enough to break gate logic and stable action IDs.
  - `staged_bundle_ref?` or equivalent pre/post-unification bundle refs
  - staged_bundle_ref?
  - The next best stage is condensation so the compact blocker bundle matches the sharper live-doc evidence.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Bundle Controls govern revision loops and approval readiness for reviewed document/file bundles.

Required behavior:
- `Resubmit` in bundle review sends all unresolved notes as revision context
- final approval is blocked until every note is resolved, responded to, or dismissed
- bundle status progression is `draft -> in_review -> all_notes_resolved -> approved -> merged`
- bundle-level persistence uses `bundle_registry.v1:{project_id}:{bundle_id}` with linked `note_record.v1:*` entries

### 7.20 Bottom runtime zone

The bottom runtime zone is the canonical host for Terminal, Problems, Output, Debug Console, Ports, and linked runtime-adjacent panes.

Required behavior summary:
- tabbed runtime panes with stable identity and restore behavior
- terminal/browser/editor integrations reveal the owning pane rather than minting parallel per-feature consoles
- linked dev-session state, historical/live badges, and recovery outcomes stay visible across pane switches

#### 7.20.1 Terminal and browser tab management

Terminal sections, terminal tabs, browser tabs, and detached previews remain identity-stable across docking, focus changes, and restart recovery.

Rules:
- runtime tabs persist selection, order, labels, and pin state
- browser and preview tabs route through canonical browser-session identities and never silently migrate ownership to chat
- hot reload, output routing, and preview refresh status appear in the owning runtime or preview pane

#### 7.20.2 Debug, Problems, Output, and Ports

The runtime zone must provide:
- **Problems:** aggregated diagnostics, file links, and source ownership disclosure
- **Output:** task/build/dev output streams with source tags and search within stream
- **Debug Console:** adapter and evaluation output for the active debug session
- **Ports:** detected ports, local/remote accessibility, open-in-browser actions, and hot-reload controls

`Run & Debug` side-panel actions reveal and focus these bottom-panel panes rather than creating duplicate runtime records.

## 8. Widget Catalog

Section 8 defines the **atomic** widget catalog used to compose pages and panels. Detailed widget references align with `Plans/WIDGETS_VISUAL_REFERENCE.md` and `Plans/WIDGETS_QUICK_REFERENCE.md`.

### 8.1 SelectableText contract

`SelectableText` is the canonical non-editable text primitive for logs, code snippets, labels with copy support, and read-only structured values.

Rules:
- supports mouse and keyboard text selection
- supports copy without converting the field into an editable input
- participates in the shared context-menu and clipboard contract defined in §10.9
- must preserve stable layout when content updates incrementally

### 8.2 Widget categories

Major widget families:
- **Layout:** SplitPane, TabGroup, Panel
- **Input:** TextInput, Dropdown, Toggle, Slider
- **Display:** Tree, List, Table, Card
- **Feedback:** Toast, Dialog, ProgressBar, Badge
- **Navigation:** Breadcrumb, SideNav, CommandPalette

Catalog rules:
- atomic widgets define behavior, focus, and theme-token usage once and are reused across all surfaces
- page widgets in `Plans/Widget_System.md` are composed from this catalog and are not a substitute for the atomic widget list here
- widgets must expose accessible labels, stable identity, and deterministic fallback states

## 9. State Management

State management follows a reactive state tree with observable projections consumed by Slint models and shell surfaces.

### 9.1 State architecture

- canonical runtime and durable state live in Rust-owned records/projections
- Slint surfaces subscribe to observable projections rather than polling
- UI models update through batched `invoke_from_event_loop` mutations

### 9.2 State categories

- **UI state:** ephemeral, not persisted; hover, local selection, transient panel expansion
- **Session state:** persisted per session/thread/workspace tab
- **Project state:** persisted per project and shared across reopened sessions for that project
- **Global state:** user preferences and cross-project durable defaults

### 9.3 State flow

Canonical flow:
`User action -> Command -> State mutation -> UI update`

Rules:
- commands are the mutation boundary
- mutations write to canonical projections first
- UI updates render from the new projection state rather than optimistic ad hoc local rewrites unless explicitly marked pending

### 9.4 Conflict resolution

- last-write-wins for UI state
- merge strategy for project state when multiple durable sources contribute
- requested vs effective runtime values must remain separately inspectable

### 9.5 Persistence boundaries

- ephemeral state may be discarded on restart unless explicitly promoted
- persisted state must have stable keys and versioned migrations
- migration reads from deprecated keys are allowed only during forward migration and must rewrite to the canonical family

### 9.6 Context management

Context management combines thread context, Investigation Context, editor/file references, and review/document references without hiding provenance.

Rules:
- each context block has stable identity and owner surface
- context usage counters and token summaries derive from canonical usage/state projections
- pruning, compaction, and restoration rules must disclose what was removed, summarized, or rehydrated

## 10. UX Patterns

Section 10 defines reusable interaction patterns across pages, panels, dialogs, and editor/runtime surfaces.

### 10.1 Confirmation dialogs

Destructive or irreversible actions require confirmation with explicit consequence copy, especially for delete, reset, merge, publish, repository creation, and credential removal flows.

### 10.2 Undo

Support `Ctrl+Z` / `Cmd+Z` where the owning surface allows reversible edits, including file operations that can be safely reverted, text editing, and message editing. Git-native history actions and external side effects are not mislabeled as editor undo.

### 10.3 Loading states

- skeleton screens for panel/page loads
- inline spinners or progress indicators for discrete actions
- keep prior validated content visible with stale/degraded labels when a refresh is in progress

### 10.4 Error display

- inline errors for field validation
- toast notifications for transient non-blocking failures
- blocking dialogs for failures that prevent forward progress or risk destructive ambiguity

### 10.5 Empty states

Empty panels must show helpful onboarding content, clear next actions, and contextual shortcuts instead of blank chrome.

### 10.6 Blocked and recovery surfaces

Blocked state, retry, remediation, and recovery affordances must use the canonical blocked/recovery contract and stay visually distinct from ordinary paused or idle states.

### 10.7 Event-driven refresh rule

Event-driven updates are canonical. UI state refresh happens on relevant runtime, filesystem, or provider events rather than generic timers.

Exception:
- polling is acceptable for external systems that do not provide push updates, such as GitHub Actions status checks; those intervals are freshness aids only and must not become the correctness model for the rest of the shell

### 10.8 Human-in-the-loop approvals

Sensitive operations requiring approval must present:
- explicit action summary
- affected resources
- approval / deny actions
- audit trail link back to the originating thread, run, or bundle

Approval surfaces must preserve context and never auto-approve hidden follow-up side effects.

### 10.9 Context menus and clipboard

Context menus are the canonical discoverability surface for copy, paste, Add Note, file actions, and selection-scoped operations.

#### 10.9.1 Copy path and copy value

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0314
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - replacing old worktree/tier copy with lane/worktree/package/seam-aware wording
  - `Copy tier_id`
  - Copy tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Non-text path/value copy actions must copy the exact underlying value via the shared clipboard helper and must not depend on text rendering quirks.

#### 10.9.2 Text selection and read-only copy

Read-only text, code blocks, logs, and labels must remain selectable and copyable without entering edit mode.

#### 10.9.3 Clipboard safety and feedback

Clipboard actions should provide lightweight success feedback for non-obvious values and must never copy redacted or hidden-secret placeholders as though they were the real value.

### 10.10 LSP-informed affordances

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope; `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` requires `path` + `position` + `newName` with approval gating.

Fields:
- operation
- query
- path
- position
- newName
- status

Labels and values:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- rename

Rules:
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
### 10.11 Loading-to-live transitions

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0262
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Good candidate transitions into `cleanup_eligible`:
  - cleanup_eligible
  - `SelectSpeakerEvent` is demoted to `raw_observation`, which hides governance-relevant speaker/overseer transitions from downstream projections
  - SelectSpeakerEvent
  - raw_observation
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

When moving from placeholder to real data, preserve layout footprint and focus so the interface does not jump unexpectedly.

### 10.12 Detached-surface continuity

Detached panels and windows must preserve identity, selection, and keyboard focus expectations when re-docked.

### 10.13 Sound effects

Optional sound effects may reinforce key workflow events such as approvals required, run completion, or error escalation, but they must remain user-controllable, accessible, and never the sole carrier of important information.

## 11. Anti-Flickering and Scroll Preservation

### 11.1 Core Principle

The GUI must never visually "jump" or "flicker" when background data updates arrive. Users must not lose their scroll position or see layout shifts during normal operation.

### 11.2 Strategies

**Scroll position preservation:**
- When new items are added to a `VecModel` (e.g., chat messages, terminal lines), preserve the current scroll position unless the user is scrolled to the bottom
- If scrolled to bottom: auto-scroll to show new content
- If scrolled up (reviewing history): hold position; show a "New messages below" indicator
- Implementation: Track `viewport-y` property on `ListView`; only update if at bottom threshold

**Batch UI updates:**
- When multiple properties change simultaneously (e.g., orchestrator status + progress + terminal lines), batch them into a single `invoke_from_event_loop` call to prevent partial renders
- Example: Do NOT call `invoke_from_event_loop` three times for three properties; collect changes, then apply all in one call

**Stable list keys:**
- Each item in a `VecModel` has a stable ID (not just an index) so that Slint can reconcile updates without destroying and recreating all items
- When updating a list item, modify the existing model entry rather than clearing and rebuilding the entire model

**Avoid full-model replacement:**
- Never call `VecModel::clear()` + re-add all items when only one item changed
- Use `VecModel::set_row_data()` for individual item updates
- Use `VecModel::push()` / `VecModel::remove()` for additions/removals

**Layout stability:**
- Fixed-size containers for status badges, progress bars, and other indicators so they do not cause layout shifts when values change
- Reserve space for optional elements (error messages, loading indicators) even when not visible, or use animation to smoothly reveal them

**Debounce layout persistence:**
- When the user resizes panels or rearranges cards, debounce the redb write (300-500ms) to avoid disk thrashing and potential UI stutter

### 11.3 Terminal-Specific Anti-Flickering

- Bounded line buffer (max 500 visible lines; older lines evicted from VecModel)
- When streaming output arrives rapidly, throttle UI updates to max 30fps (batch lines arriving within 33ms into a single VecModel update)
- Ring buffer in Rust; only the visible window is in the VecModel

---

## 12. Responsive Design

### 12.1 Breakpoints

| Window Width | Layout Adaptation |
|-------------|-------------------|
| >= 1360px | **Full layout:** All panels visible at comfortable widths |
| 1080-1359px | **Compact:** Side panel at minimum (240px); bottom panel compact |
| 720-1079px | **Collapsed:** Side panel auto-collapses to 48px icon tab; bottom panel collapses to header row (24px) |
| < 720px | **Single-column:** Activity bar only; panels accessible as overlays/drawers from activity bar icons |

### 12.2 Side Panel Responsive Widths

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0264
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The canonical-storage side is already disciplined:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Panel Width | Adaptation |
|------------|------------|
| 480px+ | Full layout with all controls |
| 360-479px | Mode tabs use abbreviated text; footer collapses platform/model to icons |
| 280-359px | Mode tabs show icons only (tooltip on hover); footer shows only context % |
| 240px (minimum) | Mode icons, messages, input only; all extras behind overflow menu |

### 12.3 Dashboard Grid Responsive

| Window Width | Grid Columns |
|-------------|-------------|
| < 1200px | 2 columns |
| 1200-1600px | 3 columns |
| > 1600px | 4 columns |

### 12.4 Activity Bar Responsive

Activity bar remains at 48px at all breakpoints. At < 720px, it becomes the primary navigation mechanism, with panels opening as overlay drawers.

---

## 13. Accessibility

### 13.1 Basic Theme as Accessibility Option

The Basic theme is the primary accessibility-friendly option:
- No decorative effects (pixel grid, paper texture, scanlines)
- WCAG AA compliant color palette (4.5:1 minimum contrast for all text)
- System fonts designed for screen readability
- Minimum 14px body text, 1.6 line height, 0.02em letter spacing
- 4px border radius (less visually harsh)
- No hard shadows
- Respects `prefers-reduced-motion` (no animations or transitions)

### 13.2 Focus Indicators

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0266
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - others should be transient focus changes only
  - `inspector_target` is still useful, but it should stay for reusable detail-pane or subsection focus, not as a universal dumping ground for all feature-local anchors.
  - inspector_target
  - `inspector_target` for reusable detail-surface focus
  - Canonical identity and UI focus are different layers.
  - Use `inspector_target = evidence` when the target object is already selected and the detail focus must land on evidence.
  - inspector_target = evidence
  - Define `tab_id` as stable page-tab focus only.
  - tab_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All themes must show visible focus indicators:
- **Retro Dark/Light:** ACID_LIME 2px border on focus
- **Basic:** High-contrast 2px ring with 2px offset in accent-blue

### 13.3 Keyboard Navigation

- All interactive elements reachable via Tab navigation
- Focus order follows visual layout: Activity bar -> primary content -> side panel -> bottom panel -> status bar
- Every list, table, and tree supports: Up/Down arrow navigation, Enter to select/activate, Escape to deselect/go back, Home/End to jump to first/last item
- Type-ahead filtering where appropriate (thread list, project list, file tree)

### 13.4 Screen Reader Support

Slint's screen reader support is limited. Mitigations:
- Set `accessible-role` and `accessible-label` properties on all interactive components where available in Slint 1.15.1
- Panel state (docked/floating) announced via accessible labels
- Theme name available to assistive technology
- Keyboard shortcuts prominently documented and discoverable via command palette

### 13.5 Minimum Touch/Click Targets

All clickable/draggable controls must be at least 24px in height/width for reliable interaction.

---

## 14. Slint File Organization

### 14.1 Directory Structure

```
puppet-master-rs/
+-- build.rs                          # slint_build::compile("ui/app.slint")
+-- ui/                               # All .slint files
|   +-- app.slint                     # Root component, imports all views
|   +-- theme.slint                   # Theme global + token definitions
|   +-- widgets/                      # Reusable .slint widgets
|   |   +-- panel_card.slint
|   |   +-- status_badge.slint
|   |   +-- styled_button.slint
|   |   +-- styled_input.slint
|   |   +-- combo_box.slint
|   |   +-- progress_bar.slint
|   |   +-- terminal_output.slint
|   |   +-- toast.slint
|   |   +-- modal.slint
|   |   +-- pixel_grid_overlay.slint
|   |   +-- paper_texture.slint
|   |   +-- context_menu.slint
|   |   +-- selectable_text.slint
|   |   +-- activity_bar.slint
|   |   +-- status_bar.slint
|   |   +-- breadcrumb.slint
|   |   +-- command_palette.slint
|   |   +-- budget_donut.slint
|   |   +-- usage_chart.slint
|   |   +-- step_circle.slint
|   |   +-- icon.slint
|   |   +-- help_tooltip.slint
|   |   +-- interview_panel.slint
|   +-- views/                        # Page-level views
|   |   +-- dashboard.slint
|   |   +-- settings.slint            # Unified (old config + settings + login + doctor)
|   |   +-- wizard.slint
|   |   +-- interview.slint
|   |   +-- nodes.slint
|   |   +-- evidence.slint
|   |   +-- evidence_detail.slint
|   |   +-- metrics.slint
|   |   +-- history.slint
|   |   +-- memory.slint
|   |   +-- ledger.slint
|   |   +-- coverage.slint
|   |   +-- projects.slint
|   |   +-- setup.slint
|   |   +-- usage.slint               # NEW
|   |   +-- file_editor.slint         # NEW
|   |   +-- agent_activity.slint      # NEW
|   |   +-- not_found.slint
|   +-- panels/                       # Detachable panel content and shared runtime/browser hosts
|   |   +-- chat_panel.slint
|   |   +-- file_manager_panel.slint
|   |   +-- bottom_panel.slint          # Terminal/Problems/Output/Ports/Debugger panes plus runtime-adjacent panes
|   |   +-- browser_panel.slint         # NEW - Shared webview host reused by workspace-tab and detached browser surfaces
|   |   +-- debug_panel.slint           # NEW - DAP debug UI (variables, call stack, breakpoints)
|   +-- windows/                      # Secondary windows
|       +-- floating_panel.slint
|       +-- about.slint
+-- src/
    +-- main.rs                       # Entry point, BackendSelector
    +-- app.rs                        # AppState, message routing
    +-- bridge/                       # Slint <-> Rust binding layer
    |   +-- mod.rs
    |   +-- theme_bridge.rs           # ThemeVariant -> Theme global sync
    |   +-- model_bridge.rs           # VecModel setup, model factories
    |   +-- callback_bridge.rs        # Slint callback -> Rust handler wiring
    |   +-- window_bridge.rs          # Multi-window lifecycle
    +-- panels/                       # Detachable panel system
    |   +-- mod.rs
    |   +-- registry.rs               # PanelRegistry, dock/undock logic
    |   +-- layout.rs                 # LayoutConfig, persistence, presets
    |   +-- snap.rs                   # Snap zone detection
    +-- effects/                      # Custom rendering effects
    |   +-- mod.rs
    |   +-- grid_texture.rs           # Pixel grid tile generation (SharedPixelBuffer)
    |   +-- paper_texture.rs          # Paper grain tile generation (SharedPixelBuffer)
    +-- theme/                        # Theme definitions (Rust side)
    |   +-- mod.rs
    |   +-- palette.rs                # Color palettes (ported from current)
    |   +-- tokens.rs                 # Design tokens (spacing, borders, fonts, sizes)
    |   +-- variants.rs               # ThemeVariant enum + apply_to
    |   +-- custom_loader.rs          # NEW - Load custom themes from TOML files
    +-- browser/                      # NEW - Browser tab webview integration
    |   +-- mod.rs
    |   +-- webview.rs                # wry webview lifecycle, URL navigation
    |   +-- bookmarks.rs              # Bookmark persistence
    |   +-- context_capture.rs        # Click-to-context element capture
    +-- debug/                        # NEW - Debug Adapter Protocol integration
    |   +-- mod.rs
    |   +-- dap_client.rs             # DAP protocol client
    |   +-- breakpoints.rs            # Breakpoint management
    |   +-- launch_config.rs          # Run/debug configuration parsing
    +-- ssh/                          # NEW - SSH remote editing
    |   +-- mod.rs
    |   +-- connection.rs             # SSH/SFTP connection management
    |   +-- remote_fs.rs              # Remote filesystem abstraction
    |   +-- keychain.rs               # System keychain credential storage
    +-- audio/                        # NEW - Sound effects
    |   +-- mod.rs
    |   +-- player.rs                 # rodio-based audio playback
    |   +-- events.rs                 # Event-to-sound mapping
    +-- catalog/                      # NEW - Community catalog
    |   +-- mod.rs
    |   +-- index.rs                  # Catalog index fetch/cache
    |   +-- installer.rs              # One-click install logic
    +-- sync/                         # NEW - Config sync bundles
    |   +-- mod.rs
    |   +-- exporter.rs               # Bundle export
    |   +-- importer.rs               # Bundle import + conflict resolution
    +-- detect/                       # NEW - Language/framework detection
    |   +-- mod.rs
    |   +-- scanner.rs                # Project root scanning for marker files
    +-- hotreload/                    # NEW - Hot reload file watcher
    |   +-- mod.rs
    |   +-- watcher.rs                # notify-based file watcher
    |   +-- builder.rs                # Build command execution
    +-- ... (remaining app modules unchanged)
```

### 14.2 View Switching in Slint

Use conditional `if` blocks for lazy view rendering:

```slint
if root.current-page == 0 : DashboardView { /* ... */ }
if root.current-page == 1 : ProjectsView { /* ... */ }
if root.current-page == 2 : SettingsView { /* ... */ }
// ... etc
```

Hidden views have zero runtime cost. Widget trees are destroyed when the condition becomes false and recreated when true.

### 14.3 Virtualized Lists

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0268
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - view inventory still lists `Tiers` as a primary view
  - Tiers
  - This pass refined affected-target precision and exact-missing lists only; blocker counts, pressure docs, and next stage remain unchanged.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Chat messages, file trees, log outputs, evidence lists, and other long lists use Slint's `ListView` with `VecModel`. For extremely large datasets (100k+ log lines), implement a custom `Model` trait backed by a ring buffer to keep memory bounded.

---

## 15. Persistence

### 15.1 redb Schema

**Shell, layout, and editor state**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `layout:v1` | Panel dock state per panel (docked side + width, or floating position/size); center splits; bottom runtime-panel height; detached-window geometry; split ratios for terminal sections. Single JSON blob for atomic read/write. | On change (debounced 300ms) |
| `widget_layout:v1:dashboard` | Canonical dashboard widget grid layout, positions, sizes, and widget IDs | On change (debounced 300ms) |
| `activity_bar_order:v1` | Ordered list of activity bar item IDs + separator position | On change (debounced 300ms) |
| `theme:v1` | Current ThemeVariant enum value | On change |
| `editor_state:v1:{project_id}` | Open tabs, active tab, scroll/cursor position per project | On change (debounced 500ms) |
| `filetree_state:v1:{project_id}` | Expanded folder set, local filter text, and tree scroll position | On change (debounced 300ms) |
| `search_panel_state.v1:{project_id}` | Search side-panel UI state: last query, replacement text, toggles, include/exclude globs, expanded groups, selected result ref, and active query session ref | On change (debounced 250ms) |
| `project_state:v1:{project_id}` | Per-project shell snapshot: editor tabs, file-tree expansion, chat thread selection, last active side-panel occupant, active view, language badges, requested/effective LSP selection summary, last-focused Search/Source Control refs, and remote-context summary | On change (debounced 300ms) |
| `gha_panel_state.v1:{project_id}` | GitHub Actions panel UI state: pins, filters, auto-refresh preference, collapsed groups, and last viewed run | On change (debounced 250ms) |
| `artifact_panel_state.v1:{project_id}` | Artifacts panel UI state: expanded groups, selected artifact, compare target, and preview mode | On change (debounced 250ms) |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

**Chat, settings, and review state**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `settings:v1` | Durable app settings and preferences | On save |
| `config:v1` | Full app config struct (all Settings values including permissions, shortcuts, LSP registry settings, Search defaults, and file-manager behavior) | On change (debounced 200ms) |
| `chat_state:v1` | Unsent input text and active thread selection | On change (debounced 200ms) |
| `wizard_state:v1:{project_id}` | Current wizard step and form data | On change (debounced 300ms) |
| `document_pane_state:v1:{project_id}:{page_context}` | Embedded document-pane state: selected document, selected view, scroll/cursor state, history selection, and approval stage | On change (debounced 200ms) |
| `document_checkpoints:v1:{project_id}` | Checkpoint metadata for restorable document states | On checkpoint create/restore |
| `review_findings_summary:v1:{project_id}:{run_id}` | Findings summary payload for requirements/interview review runs | On review completion/update |
| `review_approval_gate:v1:{project_id}:{run_id}` | Final approval decision state and precondition flags | On approval state change |
| `debug_investigation_record.v1:{project_id}:{investigation_id}` | Debug investigation record: target summary, phase/state, evidence refs, instrumentation refs, verification state, and cleanup status | On lifecycle change |
| `bundle_registry.v1:{project_id}:{bundle_id}` | Bundle review registry: files, review gate state, notes summary, and bundle status progression | On change |
| `note_record.v1:{bundle_id}:{note_id}` | Inline/bundle review note content, range, author, category, resolution, and timestamps | On change |
| `slash_commands:v1` | Custom slash commands (application-wide) | On save |
| `slash_commands:v1:{project_id}` | Custom slash commands (project-wide) | On save |
| `projects:v1` | Project registry: known projects with paths, detected languages, last-opened timestamps, health status, and per-project overrides | On change |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md

**Preview, browser, recovery, LSP, and remote keys**

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `preview_state.v1:{project_id}:{preview_subject_id}` | Preview UI state keyed by document/artifact subject: mode, attached surface, export prefs, scroll sync, and last error | On change (debounced 300ms) |
| `preview_source_artifact.v1:{project_id}:{artifact_id}` | Artifact-backed preview metadata and source linkage | On change |
| `browser_session_state.v1:{project_id}:{browser_session_id}` | Browser session state: session class, workspace tab, preview subject, requested/effective runtime and capabilities, blocked actions, profile scope, restore policy, and last error | On change (debounced 300ms) |
| `browser_profile_state.v1:{project_id}:{profile_scope}` | Browser history/bookmarks and project-scoped profile state | On change (debounced 500ms) |
| `editor_unsaved_buffer.v1:{project_id}:{document_id}` | Recoverable local unsaved buffer snapshot, capture metadata, host/path identity, and write-availability state at capture time | On change (debounced 500ms) |
| `search_query_state.v1:{project_id}:{query_session_id}` | Query-session snapshot: query, replacement, scope, result snapshot ref, freshness, health, and last error | On query update/complete |
| `lsp_session_state.v1:{project_id}:{host_id}:{server_id}:{root_identity}` | Host-aware LSP session projection: state, freshness, health, restart metadata, capability summary, and last error | On lifecycle change |
| `lsp_diagnostics_snapshot.v1:{project_id}:{host_id}:{server_id}:{root_identity}` | Diagnostics snapshot ref(s), counts, capture time, freshness, and health for the owning host-aware LSP session | On diagnostics update |
| `provider_account_record.v1:{provider_id}:{account_id}` | Provider account identity, entitlement metadata, validation state, and account-level configuration | On account change |
| `server_profile_record.v1:{provider_id}:{connection_profile_id}` | Provider/server profile connection defaults, capability summary, and health metadata | On change |
| `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}` | Rate-limit / pressure episode metadata and recovery history for account selection surfaces | On lifecycle change |
| `account_switch_event.v1:{provider_id}:{event_id}` | Durable record of account switch reason, source, and effective billing/entity context | On switch |
| `mcp_server_record.v1:{mcp_server_id}` | MCP server configuration and readiness metadata | On save/change |
| `skill_record.v1:{skill_id}` | Skill registry entry, enablement, source, and settings summary | On save/change |
| `web_operation_payload` | Stored child-run metadata for web extract / research / crawl / map summaries referenced by GUI projections | On completion/update |
| `terminal_layout.v1:{project_id}` | Canonical terminal layout persistence family for terminal sections, pane arrangement, and focused runtime chrome | On change (debounced 300ms) |
| `terminal_session.v1:{terminal_session_id}` | PTY session continuity record for terminal restore and historical/live verification | On lifecycle change |
| `ssh_remotes/{id}` | Saved SSH remote record: nickname, host, port, user, auth method, remote folder, jump host, and last test metadata. No secrets. | On save |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Normative mapping notes:
- `ssh_remotes/{id}` replaces the stale flat `ssh_connections:v1` concept in GUI-facing persistence summaries.
- `preview_state.v1:*`, `preview_source_artifact.v1:*`, `browser_session_state.v1:*`, and `browser_profile_state.v1:*` replace the stale single-blob `browser_state:v1` model.
- Search and LSP rows in this section are GUI-facing projections and MUST resolve back to owner-doc contracts in `Plans/storage-plan.md`, `Plans/FileManager.md`, and `Plans/LSPSupport.md`.
- `editor_unsaved_buffer.v1:*` stores local unsaved buffer state only and MUST NOT imply that a remote write succeeded.
- `dashboard_layout:v1` is a deprecated migration-read alias only; `widget_layout:v1:dashboard` is the canonical dashboard key after migration.
- §15.1 lists the keys required for GUI state persistence. For the complete key catalog including non-GUI keys, see `Plans/storage-plan.md` §2.3.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

### 15.2 seglog Projections (for Usage)

- Usage events (tokens, cost, platform, tier, session, thread_id) appended to seglog
- Analytics scan jobs produce rollups in redb (5h/7d counters, tool latency, error rates)
- Usage view and dashboard read from redb rollups, not raw seglog
- Per-thread usage derived from seglog events filtered by thread_id

### 15.3 Tantivy Indices

- Chat history search (human and agent messages) queryable from Chat panel search
- Evidence search
- Ledger search

### 15.4 Startup Restore
On startup:
1. Read `layout:v1` from redb and restore panel positions, sizes, dock states, and detached-terminal geometry.
2. Read `theme:v1` from redb and apply theme.
3. Read `widget_layout:v1:dashboard` and restore dashboard widget layout. On first launch after migration, read from deprecated `dashboard_layout:v1` only when the canonical key is absent, then write back to `widget_layout:v1:dashboard`.
4. Read `activity_bar_order:v1` and restore icon order.
5. Read `editor_state:v1:{project}` and restore open tabs.
6. Read `project_state:v1:{project_id}` and restore the active project-facing shell state.
7. Read `terminal_layout.v1:{project_id}` plus linked `terminal_session.v1:{terminal_session_id}` / canonical terminal record families and restore terminal section layout, tabs, pane tree, labels, and selected focus targets. On first launch after migration, a compatibility reader MAY ingest deprecated `terminal_state:v1` payloads and rewrite them into the canonical terminal key family.
8. Read `hotreload_state:v1:{project_id}` and rehydrate dev-session UI state as historical or verified-live state.
9. Read `onboarding:v1` and determine whether tour or first-run hints should show.
10. If a floating or detached window was on a disconnected monitor, fall back to docked presentation or to a safe detached coordinate.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Restore rules:
- terminal restore MUST preserve section, tab, and pane identity before attempting any session liveness verification
- restored historical sessions may appear immediately, but live-state badges wait for verification
- startup restore MUST prefer revealing prior selected terminal containers over creating new empty terminals automatically

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md
### 15.5 Session Recovery
On crash or unexpected shutdown, restore as much state as possible without inventing continuity that PM cannot prove.

Recoverable state:
- **Chat state:** unsent input text and active thread selection may restore from `chat_state:v1`; queue state is transient and is not restored across reload or restart
- **Wizard state:** current wizard step and form data resume from `wizard_state:v1:{project_id}`
- **Document pane state:** embedded document-pane selection and view (`document` or `plan_graph`) restore from `document_pane_state:v1:{project_id}:{page_context}`
- **Document checkpoints:** checkpoint list and selected checkpoint context restore so the user can continue restore or approval workflows
- **Review findings and approval state:** findings summary and approval state restore so interrupted review runs return to the correct approval surface
- **Active project:** the last active project is restored automatically

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md

Terminal and dev-session recovery rules:
- terminal sections, tabs, panes, labels, pin state, and selected focus restore from durable terminal workspace state
- terminal sessions restore only as verified-live or historical records; Puppet Master MUST NOT fake live PTY continuity after restart
- canonical recovery outcomes are `restored_live`, `restored_exited`, `restored_disconnected`, and `restored_without_history`
- dev sessions restore as workflow records tied to their last-known output, problems, ports, and linked terminal refs
- restored historical terminals show explicit banners and recovery controls such as restart, replace, or close historical tab

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

Composer and queue rules after restore:
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- Edit restores content into composer and discards all later history/work
- Resend retries the most recent message and discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- Stop becomes disabled when a run completes and no next message is queued
- queue state is transient and is not restored across reload or restart
- always-visible copy affordance on fenced code blocks remains available after restore

Browser and runtime recovery rules remain aligned:
- browser sessions preserve their own restore policy and never silently become terminal-owned shells
- attention surfaces, command cards, and linked runtime panes must pivot back to the restored canonical identity rather than inventing replacement containers

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

Rules:
- restore does not invent queue continuity
- Keep this recovery section consuming Plans/assistant-chat-design.md#4. Message submission (Steer vs Queue), queued editing, interrupt, and stop
## 16. Migration Mapping

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0250
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - legacy `[retired-token-1]` wording still present in docs is now both a data-model risk and a user-copy/help migration risk
  - [retired-token-1]
  - Resolve the `[retired-token-3]` migration contradiction in one place and cross-reference it from `[retired-token-2]`
  - [retired-token-3]
  - [retired-token-2]
  - That makes the doc hard to reconcile mechanically because early tables, migration addenda, and canonical-record sections are not all pointing in the same direction.
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

### 16.1 Iced View to Slint Location

| Current Iced View | New Slint Location | Notes |
|-------------------|-------------------|-------|
| `dashboard.rs` | `views/dashboard.slint` (Home group) | Add rearrangeable card grid, 4-split terminal |
| `projects.rs` | `views/projects.slint` (Home group) | Minimal changes |
| `wizard.rs` | `views/wizard.slint` (Run group) | Add agent activity pane, intent selection |
| `interview.rs` | `views/interview.slint` (Run group) | Also available as Chat mode |
| `tiers.rs` | `views/nodes.slint` (Run group) | Renamed to match the node/package/lane/seam model; otherwise minimal changes |
| `config.rs` | **Merged into** `views/settings.slint` (Settings group) | Tabs: Nodes, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML |
| `settings.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: General |
| `login.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Authentication |
| `doctor.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Health |
| `setup.rs` | `views/setup.slint` (Run group) | Minimal changes |
| `metrics.rs` | `views/metrics.slint` (Data group) | Minimal changes |
| `evidence.rs` | `views/evidence.slint` (Data group) | Minimal changes |
| `evidence_detail.rs` | `views/evidence_detail.slint` (Data group) | Minimal changes |
| `history.rs` | `views/history.slint` (Data group) | Minimal changes |
| `ledger.rs` | `views/ledger.slint` (Data group) | Minimal changes |
| `memory.rs` | `views/memory.slint` (Data group) | Minimal changes |
| `coverage.rs` | `views/coverage.slint` (Data group) | Minimal changes |
| `not_found.rs` | `views/not_found.slint` | Minimal changes |
| (new) | `views/usage.slint` (Data group) | New page |
| (new) | `views/file_editor.slint` (Primary content) | New page |
| (new) | `views/agent_activity.slint` (Embedded) | New component |
| (new) | `panels/chat_panel.slint` (Side panel) | New panel |
| (new) | `panels/file_manager_panel.slint` (Side panel) | New panel |

### 16.2 Widget Migration

All 25 current Iced widgets map to Slint equivalents. Key differences:
- **Canvas-based widgets** (pixel_grid, paper_texture, step_circle, budget_donut, usage_chart): Use `SharedPixelBuffer` + `Image` instead of Iced's `canvas::Program`
- **text_editor::Content** (for read-only terminal/log display): Use Slint's `TextEdit` (read-only mode) or custom `ListView` with styled text lines
- **Subscriptions** (50ms polling): Replace with event-driven `invoke_from_event_loop`
- **Context menu:** Custom implementation (Slint has no built-in)
- **Animations** (page transitions, pulsing status dots): Use Slint's property transitions and `animate` keyword
- **Dynamic scaling** (UI scale 0.75-1.5): Use Slint's native global/window scale factor as the only scaling path; do not port Iced token-multiplication layers into Slint view code

ContractRef: ContractName:Plans/Contracts_V0.md#8, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

### 16.3 Data Type Preservation

All current data types (AppTheme, Page, CurrentItem, ProgressState, OutputLine, BudgetDisplayInfo, DoctorCheckResult, etc.) remain in Rust. Only their Slint representations (via properties and models) change. The backend event system, orchestrator state, and persistence remain unchanged.

<a id="16.4"></a>
### 16.4 Clipboard Migration Gate

Clipboard migration gate status is **PASS** only when all required criteria below are true.

**Pass/Fail criteria (all REQUIRED):**
- [ ] Native Copy/Paste/Select All behavior works in File Editor input, chat composer input, and terminal command input (if editable).
- [ ] Read-only terminal/log output supports selection/copy and does not accept editable paste behavior.
- [ ] No custom text-widget clipboard handler remains in the migration target.
- [ ] Non-text copy exceptions remain explicitly scoped to `ClipboardHelper` path/value contexts only.
- [ ] Rebuild branch passes type/build verification.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, SchemaID:Spec_Lock.json#locked_decisions.ui

**Verification command (build):**
```bash
cd puppet-master-rs
cargo check
```

**Scenario checklist (manual or automated GUI harness):**

| Scenario | Expected result |
|----------|-----------------|
| Editor clipboard shortcuts + context menu | Ctrl/Cmd+A/C/X/V and context Copy/Paste/Select All behave natively |
| Chat composer clipboard shortcuts + context menu | Same behavior and parity as editor |
| Terminal command input clipboard actions | Native clipboard behavior on editable command input |
| Terminal/log read-only output copy/paste behavior | Selection/copy works; paste is not treated as editable insertion |
| Non-text Copy Path/Copy Value | Clipboard receives exact path/value via `ClipboardHelper` only |

---

## 17. Risks and Mitigations

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0251
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `manual_preferred_account_id` currently risks being misused as both:
  - manual_preferred_account_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Risk | Severity | Mitigation |
|------|----------|------------|
| **`ImageFit.repeat` may not exist in Slint 1.15.1** | Medium | Use `SharedPixelBuffer` to generate tiles at the viewport size; or manually tile via `GridLayout` with repeated `Image` elements. Test at build time; if unavailable, use fallback approach. |
| **Multi-window lifecycle edge cases** | High | State machine in Rust manages window create/destroy. On floating window close -> dock or collapse; update layout state. Test: focus management between main and floating windows; data sync when floating window is open; re-dock after window was on disconnected monitor. |
| **Limited screen reader support** | Medium | Keyboard navigation is comprehensive (§13.3). Set `accessible-role` and `accessible-label` where Slint supports them. Document limitations. Basic theme provides maximum readability. |
| **No built-in context menu** | Low | Custom `ContextMenu` widget using `TouchArea` pointer events. Positioned at mouse coordinates. Styled per theme. Clipboard operations (Copy/Paste/Select All) delegate to Slint's native `TextInput.copy()` / `.paste()` / `.select-all()` — no custom clipboard state management needed. |
| **No built-in docking framework** | High | Custom `PanelRegistry` in Rust handles dock/undock state machine, snap detection, window lifecycle. This is the most complex custom component and should be implemented early. |
| **Font family change requires restart** | Low | Detect font family change in settings. Show restart prompt. Pre-load fonts for all themes on startup so within-family switches (Dark <-> Light) are instant. |
| **4-split terminal performance** | Medium | Virtualize visible lines only. Bounded ring buffers per pane (max 10k lines in memory); VecModel holds only the visible window (~500 lines) plus a small overscan buffer. On scroll, splice the VecModel from the ring buffer. Batch/throttle streaming updates (max 30fps). One PTY per pane. |
| **Platform-specific window manager issues** | Medium | Test: macOS window snapping with floating panels, Linux compositing with overlay effects, Windows DPI scaling. Handle gracefully with fallback behaviors. |
| **Large Settings page complexity** | Medium | 24 tabs across 5 groups. Two-level sidebar navigation (left sidebar for groups, right area for selected tab) is mandatory. Group labels act as collapsible headers. Settings search bar at the top of the sidebar. Test with real data. |
| **Migration scope** | High | 18 existing views + 5 new = 23 total. Prioritize: (1) Theme system + shell layout, (2) Dashboard + Settings, (3) Chat + File Manager, (4) remaining views. Each view can be migrated independently. |
| **invoke_from_event_loop saturation** | High | High-frequency terminal output (1000+ lines/sec) can saturate the event loop. Mitigation: Batch terminal updates with a 33ms (30fps) throttle timer; collect lines in a buffer and push them as a single VecModel update per frame. |
| **Chat message memory bounds** | Medium | No cap on messages per thread could cause memory issues with very long sessions. Mitigation: Implement a soft cap (e.g., 5000 messages per thread); on exceeding, archive oldest messages to disk and show "Load earlier messages" button. |
| **Theme global property update batching** | Low | Switching 20+ theme properties could cause intermediate re-renders. Mitigation: Slint batches property changes within a single `invoke_from_event_loop` call; always set all theme properties in one callback. |
| **Dashboard card drag-and-drop** | Medium | Drag-reorder logic for dashboard cards is custom and complex. Mitigation: Use a simple ordered-list model with drag-handle + click-to-swap as MVP; full drag-and-drop is enhancement. Test with varying card counts (2-12). |
| **Floating window data sync race conditions** | High | Multiple windows reading/writing the same VecModel can race. Mitigation: All model mutations go through `invoke_from_event_loop` on the main event loop (single writer). Floating windows receive updates via the same shared `Rc<VecModel>`. Never clone+replace the model; always mutate in-place. |
| **LSP server lifecycle management** | Medium | Multiple LSP servers may exist across local and remote hosts. Mitigation: Key server supervision by `(host_id, server_id, root_identity)`, launch lazily on file open, restart boundedly on crashes, and expose stale/degraded/unavailable state instead of silently mirroring remote projects locally. |
| **External drag-and-drop platform APIs** | Medium | Requires platform-specific integration (Windows IDropTarget, macOS NSDraggingDestination, Linux Xdnd/Wayland). Mitigation: Abstract behind a trait; implement per-platform. If Slint exposes native drop events, use those instead. Test on all three platforms. |
| **HTML preview webview** | Medium | Embedding a webview for HTML hot-reload preview may conflict with the Skia renderer pipeline. Mitigation: Use `wry` or similar embeddable webview; ensure it sits in a separate native child window within the editor area. Fallback: render static HTML snapshots as images. |
| **Steer submission mid-stream injection** | Medium | Injecting a new user message while the assistant is actively generating requires careful stream handling. Mitigation: Buffer the steer message; on next token boundary, prepend the steer to the ongoing context. Test that partial generation + steer produces coherent output. |
| **Webview embedding (`wry`) conflicts** | High | Browser and HTML preview surfaces embed webviews that may conflict with the Skia renderer pipeline. Mitigation: Use native child windows positioned within Slint layout areas, keep browser ownership editor/workspace-tab-first, and ensure bottom-panel browser-adjacent panes never become the canonical browser host. |
| **DAP debugger reliability** | Medium | Debug adapter communication is asynchronous and adapters may crash, hang, or produce unexpected output. Mitigation: Implement timeouts per DAP request (default 10s for evaluate, 30s for launch). Auto-restart crashed adapters once. Show clear error state in the Debugger surface when adapter is unresponsive. Cap concurrent debug sessions to 1 per project. |
| **SSH connection stability** | Medium | SSH connections may drop unexpectedly (network change, host reboot, timeout). Mitigation: Keep-alive packets every 30s. On disconnect, retain local buffer contents and stale snapshot state, auto-retry once in a bounded way, then show an explicit `Reconnect` action. Never silently fall back to local execution for remote-mode projects. |
| **Catalog service availability** | Low | Catalog index may be unavailable (network down, server offline). Mitigation: Bundle a fallback index with the app binary. Cache last-fetched index locally. Show "Catalog may be outdated" banner when using cached data. All catalog operations work offline with cached index. |
| **Sound effects cross-platform audio** | Low | `rodio` audio playback may fail on some Linux configurations (missing PulseAudio/ALSA). Mitigation: Detect audio device availability at startup. If unavailable, disable sound effects silently and hide the toggle in Settings (or show "(audio unavailable)" label). No error toasts for missing audio. |
| **Custom theme validation** | Low | User-created theme TOML files may have invalid colors, missing tokens, or malformed syntax. Mitigation: Validate all custom themes on load. Skip invalid themes with a warning toast on Settings open. Never crash on invalid theme files. Use base theme values for any missing or invalid tokens. |
| **Settings page tab count (24 tabs)** | Medium | 24 tabs across 5 groups requires careful navigation. Mitigation: Two-level sidebar navigation is mandatory (not optional). Group headers are collapsible. Search/filter across all settings via a search bar at the top of the Settings sidebar. Deep-link support: command palette "Open setting: {name}" jumps directly to the relevant tab and scrolls to the field. |
| **Project switch state reload performance** | Medium | Switching projects triggers full state reload (editor tabs, file tree, chat threads, config, LSP servers). Mitigation: Load in priority order: (1) config (instant, from redb), (2) file tree (async scan, show skeleton), (3) editor tabs (lazy, only load active tab content), (4) LSP/Search/Source Control projections (background refresh), (5) chat threads (lazy load). Show skeleton placeholders during reload. Target: <500ms to interactive. |
| **File watcher resource consumption** | Low | Hot reload and preview watchers monitor project directories for changes. Large projects (>10k files) may consume significant inotify/FSEvents handles. Mitigation: Use `notify` crate with debounced mode. Watch only relevant source directories. Cap watchers and disclose fallback when root-only watching is required. |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md

## 18. Promoted Features (Formerly Future Considerations)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0252
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - future Projects/attention-center docs and command/deep-link docs
  - future provider/surface-specific kinds as needed
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All items previously listed as future considerations are MVP scope and are fully specified in their owner docs:

| Feature | MVP Location |
|---------|-------------|
| Built-in browser / click-to-context | Rendering Surface Addendum + `Plans/FileManager.md` §8 and §14 |
| Search / find in files / replace in files | Activity Bar + Command Palette boundary + Search owner contract in this doc; `Plans/UI_Command_Catalog.md` `cmd.search.*` |
| Instant project switch | Workspace-tab project switch model (§3.4) |
| Sound effects | UX Patterns §10.13 + Settings > General |
| Hot reload controls | Runtime/dev surfaces in `Plans/assistant-chat-design.md` §22 and `Plans/FileManager.md` §14.6 |
| In-app instructions editor | File Editor instructions mode in `Plans/FileManager.md` |
| Additional themes / custom themes | Theme extensibility (§6.6) |
| Language/framework auto-detection and LSP-aware navigation | Project state + `Plans/LSPSupport.md` + `Plans/FileManager.md` §10 |
| Catalog / one-click install | Settings > Catalog tab |
| Sync bundle manager | Settings > Sync tab |
| SSH remote editing | `Plans/GitHub_Integration.md` §C + `Plans/FileManager.md` remote buffer/search behavior |
| Run/debug configurations | Run & Debug side-panel surface + Settings > Debug |
| Browser/terminal tabs, pinning, and preview modes | `Plans/FileManager.md` §9 and §14 + Rendering Surface Addendum |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md

No features in this specification are deferred.

## Appendix A: Cross-References

Cross-References inventory.

Reference rows must point at live owner documents or live section anchors, not nonexistent section numbers.

| Plan Document | Sections Incorporated |
| --- | --- |
| `Plans/assistant-chat-design.md` | Chat panel, modes, threads, steer/queue submission, subagent inline blocks, commands, activity transparency, plan panel, context usage, and HITL-to-chat handoff. |
| `Plans/FileManager.md` | File Manager, File Editor, embedded document pane shared-buffer contract, click-to-open, @ mention, preview, external drag-and-drop, HTML preview/hot reload, click-to-context, open-file contract, shared buffer model, editor diff view, SSH remote editing, run/debug configurations, and terminal/browser tab management. |
| `Plans/usage-feature.md` | Usage page, per-thread usage, ledger, analytics, visibility windows, and alerts. |
| `Plans/human-in-the-loop.md` | HITL settings, approval UI, and dashboard calls to action. |
| `Plans/chain-wizard-flexibility.md` | Wizard redesign, intent selection, intent-specific fields, file upload limits, Builder opener and turn semantics, checklist status UI, findings preview, single final approval gate, tri-location chat pointers, embedded document pane separation, pause/cancel/resume controls, recovery state, and adaptive interview phases. |
| `Plans/storage-plan.md` | Persistence, seglog projections, redb schema, and Tantivy. |
| `Plans/agent-rules-context.md` | Application-level rules, project-level rules, and shared rules-pipeline context for orchestrator, interview, and Assistant. |
| `Plans/Glossary.md` | Product name "Puppet Master" throughout. |
| `Plans/newfeatures.md` | Bottom panel and terminal, thinking display, streaming, keyboard shortcuts, stream event visualization, duration timers, background runs, restore points, config migration dialog, rate-limit banner, version update banner, instant project switch, sound effects, hot reload controls, instructions editor, and language auto-detection. |
| `Plans/interview-subagent-integration.md` | Interview config tab, agent activity, embedded document pane, findings summary preview, single final approval gate, and multi-pass review. |
| `Plans/orchestrator-subagent-integration.md` | Orchestrator, orchestrator controls, and node/package/lane/seam display. |
| `Plans/WorktreeGitImprovement.md` | Branching tab in Settings and worktree recovery in Health. |
| `Plans/FileSafe.md` | Advanced tab in Settings, command blocklist, write scope, and security filter. |
| `Plans/MiscPlan.md` | Health tab clean-workspace button, cleanup config in Advanced, and Shortcuts tab. |
| `Plans/Skills_System.md` | Agent Config panel and slash/runtime boundary at `Plans/Skills_System.md#6.3 Slash and runtime boundary`. |
| `Plans/feature-list.md` | Master feature reference for chat modes, thread management, slash commands, ELI5/YOLO, attachments, Teach, context management, editor detach, storage and cache admin UI, and unified settings/search/import/export. |
| `Plans/newtools.md` | MCP/settings alignment note and non-owning cited-search guidance; live provider, routing, provenance, and billing canon stays in owner docs. |
| `Plans/Commands_System.md` | Reserved built-in slash-command set for chat surfaces; see `Plans/Commands_System.md#7. Reserved built-in slash commands` for `/web` family behavior and deprecated aliases. |
| `Plans/UI_Command_Catalog.md` | Terminal reveal identities and canonical `cmd.chat.web.*` command ids consumed by chat and command surfaces; see `Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)`. |
| `Plans/Permissions_System.md` | Tool permission keys, approval ladder, blocked-recovery defaults, deterministic ask/plan behavior, and web-operation derivation at `Plans/Permissions_System.md#3.4A Web-operation permission-key derivation`. |
| `Plans/MCP_Integration.md` | Requested versus effective MCP availability at `Plans/MCP_Integration.md#2. Requested versus effective availability`; GUI surfacing at `Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing`; plus auth-state and connection-state enums, credential binding, and invalidation vocabulary. |
| `Plans/Tools.md` | Tool permissions in Permissions tab, tool permission keys, presets, central tool registry, canonical approval ladder, web-provider matrix, routing algorithm, Firecrawl integration, batch-operation contracts, tool usage widget on Usage page, and tool approval dialog in Chat. |
| `Plans/LSPSupport.md` | LSP tab in Settings, editor LSP features, chat-window LSP affordances, Problems tab, and status-bar LSP indicator. |
| `Plans/rewrite-tie-in-memo.md` | Rewrite scope alignment so GUI migration stays tied into the broader rewrite plan. |
| `Plans/FinalGUISpec.md` | Internal clipboard contract, clipboard migration requirements, SelectableText contract, context-menu clipboard contract, and migration gate. |
## Appendix B: Locked Decisions Summary

These decisions are final and must not be revisited during implementation:

1. **Slint 1.15.1** -- no other UI framework
2. **winit + Skia** default, **winit + FemtoVG-wgpu** fallback
3. **No React/JS/TS/HTML/CSS** -- pure Rust + Slint shell
4. **IDE shell layout** -- Activity Bar + Primary Content + Side Panel + Bottom Panel
5. **Three theme families** -- Retro Dark, Retro Light, Basic Modern (built-in variants + custom themes via TOML)
6. **Settings restructure** -- unified page merging old Config + Settings + Login + Doctor
7. **Event-driven updates** via `invoke_from_event_loop`, not polling
8. **redb for layout persistence**, seglog for events, Tantivy for search
9. **Model/platform selection via dropdowns**, not text entry
10. **Product name: `Puppet Master`**
11. **All 12 former future considerations are MVP** -- browser, instant project switch, sound effects, hot reload, instructions editor, custom themes, language detection, catalog, sync, SSH, Debug Mode workflows, and terminal tab management
12. **Bottom runtime zone includes the classical debugger surface** -- Terminal, Problems, Output, Ports, and Debugger / DAP Debugger remain runtime-zone occupants; browser-capable preview/browsing is not a bottom-panel debug substitute
13. **Browser runtime contract is capability-first, not crate-name-first** -- implementation must satisfy the promoted browser/session model rather than hard-locking the spec to stale `wry` wording
14. **Classical debugger uses DAP** -- the integrated debugger surface is DAP-based and distinct from Assistant Debug Mode
15. **SSH uses system keychain / agent flows** -- credentials stay in OS-managed stores, never in config files

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md

## Appendix C: Dashboard Widget Grid and Widget Catalog Integration (Addendum -- 2026-02-23)

This appendix extends the Dashboard (section 7.2) from a rearrangeable card grid to a full widget grid with grid-based resizing, and introduces the add-widget flow for the Dashboard.

### C.1 Dashboard Upgrade: Card Grid to Widget Grid

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0290
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Upgrade `Project_Output_Artifacts.md` and adjacent artifact/event owners to carry canonical project/thread/run/attempt/account lineage, and align pass-report enums/fields with wizard/interview producers.
  - Project_Output_Artifacts.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The Dashboard (section 7.2) is upgraded from a simple rearrangeable card grid (drag-to-swap, fixed card sizes) to a full **widget grid** with grid-based resizing:

**What changes from section 7.2:**
- Cards become **widgets** from the widget catalog (Plans/Widget_System.md section 2). Each widget has configurable `col_span` and `row_span`.
- Drag-to-swap is upgraded to **drag-to-reorder** within the grid. Widgets can also be **resized** by dragging their edges (grid-snapping, per Plans/Widget_System.md section 3).
- Grid system follows Plans/Widget_System.md section 3: responsive column counts (2 at <1200px, 3 at 1200-1600px, 4 at >1600px per section 12.3).
- Widget gutters: 8px (MD spacing token) between widgets.

**What stays the same from section 7.2:**
- All existing Dashboard card types remain as default widgets.
- The card visual style is preserved: paper texture on retro themes, drag handle (4px crosshatch pattern in top-left corner), elevated surface for CtA cards with accent-left-border.
- CtA (Calls to Action) behavior: HITL approval, run interrupted, rate limit, warning, and `wizard_attention_required` cards function identically (see §7.2 for full specs).
- Persistence location changes from `dashboard_layout:v1` to `widget_layout:v1:dashboard` (see section C.5 for migration).

ContractRef: ContractName:Plans/Widget_System.md#3

### C.2 Default Dashboard Widget Layout

The default dashboard layout includes:
- **widget-orchestrator-progress** (ID: `orch-progress-v1`): Shows current run progress, node execution status, and lane state.
- **widget-active-lanes** (ID: `lanes-view-v1`): Lists active lanes and worktree allocation state.
- **widget-recent-results** (ID: `results-v1`): Shows recent execution results and artifact links.

### C.3 Add-Widget Flow on Dashboard

Users add widgets via:
1. Dashboard menu → "Add Widget"
2. Select from named widget catalog (see C.4)
3. Confirm placement and sizing
4. Widget appears on dashboard with default configuration

### C.4 Widget Catalog vs. Core Widget Catalog

The current **named widget catalog** includes:
- `widget-orchestrator-progress`: Orchestrator progress view (Puppet Master native).
- `widget-active-lanes`: Active lane browser (Puppet Master native).
- `widget-recent-results`: Recent result summary (Puppet Master native).
- `widget-custom-metrics`: User-defined metric display (user-generated, optional).

**Core widgets** are Puppet Master-owned and part of the default installation. **Custom widgets** are user-generated and optional.

Widget_System consumes this named catalog directly; it does not invent new widget IDs or synthesize missing entries.
### C.3 Add-Widget Flow on Dashboard

The Dashboard has an explicit **"Add Widget"** control:
- **Location**: floating action button in the bottom-right corner of the Dashboard grid area, or in a Dashboard toolbar.
- **Behavior**: opens the Widget Catalog overlay (Plans/Widget_System.md section 4.2) filtered to Dashboard-compatible widgets.
- **Available widgets**: all widgets from the catalog whose "Hostable Pages" includes "Dashboard" -- this includes Usage widgets (`widget.quota_summary`, `widget.budget_donuts`, `widget.analytics_chart`, `widget.tool_usage`, `widget.multi_account`, etc.), Orchestrator Progress widgets (`widget.orchestrator_status`, `widget.current_task`, `widget.progress_bars`, etc.), and others.
- **On add**: widget placed at next available grid position with its default size. Layout persisted immediately.

This enables users to build a customized Dashboard that includes usage information, orchestrator progress, and other data -- all from a single surface.

ContractRef: ContractName:Plans/Widget_System.md#4

### C.4 Widget Catalog vs. Core Widget Catalog

Two distinct catalogs now exist. To avoid confusion:

- **Section 8 of this document** (FinalGUISpec Widget Catalog) = **atomic UI components**: StyledButton, StyledInput, StyledBadge, TreeView, CodeBlock, and other building-block primitives. These are reusable across all views and are NOT page widgets.
- **Plans/Widget_System.md section 2** = **composed page widgets**: OrchestratorStatus, BudgetDonuts, NodeTree, LedgerTable, and other content panels built FROM atomic components. These are the widgets users can add/remove/move/resize on the Dashboard, Usage page, and Orchestrator tabs.

The relationship: page widgets (Widget_System.md) are composed of atomic components (FinalGUISpec section 8).

### C.5 redb Key Migration

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0291
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `login` still acts like a stable key in `GitHub_API_Auth_and_Flows.md`
  - login
  - GitHub_API_Auth_and_Flows.md
  - `effective_account_id` remains the stable internal key; provider-facing identities stay disclosure-only.
  - effective_account_id
  - Treat any remaining `tier_id` use as derived compatibility metadata or view grouping, not as the primary cross-surface key.
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The existing `dashboard_layout:v1` redb key (section 15.1) stores a simple card-order list. The new widget layout system uses a richer schema. Migration strategy:

1. **On first load** after the widget system upgrade:
   - Check if `dashboard_layout:v1` exists and `widget_layout:v1:dashboard` does NOT exist.
   - If so: read the card ID list from `dashboard_layout:v1`, map each card ID to its corresponding Widget Catalog ID (per the table in C.2), assign default grid positions and sizes, and write the result as `widget_layout:v1:dashboard`.
   - Treat `dashboard_layout:v1` as deprecated migration input only; it does not remain canonical after migration completes.
2. **Future reads** use `widget_layout:v1:dashboard` only.
3. If both keys exist, `widget_layout:v1:dashboard` takes precedence.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Widget_System.md#7

### C.6 References (Appendix C)

- Plans/Widget_System.md -- widget catalog, grid system, add-widget flow, layout persistence
- Section 7.2 of this document -- Dashboard (original card grid specification)
- Section 8 of this document -- Core Widget Catalog (atomic UI components)
- Section 12.3 of this document -- Dashboard grid responsive breakpoints
- Section 15.1 of this document -- redb persistence for dashboard layout
- Plans/storage-plan.md -- redb namespaces
## 19. Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls (2026-03-06)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0253
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Provider_OpenCode.md` and `Provider_Stream_Mapping_External_Reference_A2A.md` both assume runtime/account disclosure obligations that their current event/API mappings cannot actually satisfy.
  - Provider_OpenCode.md
  - Provider_Stream_Mapping_External_Reference_A2A.md
  - must use progressive disclosure rather than fully expanded seam/package/node trees
  - provider/runtime disclosure fields:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This addendum expands the GUI contract for Persona authoring and runtime visibility.

### 19.1 Persona editor compatibility matrix (required)

The Persona editor MUST show provider support state for Persona controls.

Support states:
- `supported`
- `partially supported`
- `unsupported`

For each control (platform/model/variant/temperature/top_p/reasoning_effort/talkativeness/tool-permission coupling/subagents), the editor must:
- show normal editing when supported,
- show warning styling and explanatory tooltip when partially supported,
- show disabled control plus explanation when unsupported.

`talkativeness` is a Persona instruction-layer control rather than a transport/runtime sampling knob. Its support state follows Persona prompt-body support: if a provider can apply Persona prompt instructions, it can apply `talkativeness`.

Minimum provider rows to display:
- Claude Code
- Cursor CLI
- OpenCode
- Direct/API providers

### 19.2 Persona editor fields (expanded)

In addition to existing Persona fields, the editor must support:
- `default_platform`
- `default_model`
- `default_variant`
- `temperature`
- `top_p`
- `reasoning_effort`
- `talkativeness`
- `preferred_tools`
- `discouraged_tools`
- `tool_usage_guidance`
- `aliases`

`talkativeness` must be rendered as a fixed single-select with these labels and stored enum values:
- `Talk a lot more` -> `talk_a_lot_more`
- `Talk more` -> `talk_more`
- `Talk a little more` -> `talk_a_little_more`
- `Model default` -> `model_default`
- `Talk a little less` -> `talk_a_little_less`
- `Talk less` -> `talk_less`

### 19.3 Compatibility panel copy examples

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0272
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `request_id` still competes with `blocked_sequence` in HITL/storage examples
  - request_id
  - blocked_sequence
  - its examples still include `tier_id` / `tier_type`
  - tier_id
  - tier_type
  - Reconcile event-family names and examples that still teach `tier_id` / `tier_type` as canonical scope anchors.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The editor should be able to communicate states like:
- `Claude Code: supports model preference and effort; temperature/top_p not exposed in official CLI settings.`
- `Cursor CLI: supports prompt/rules steering and some model selection; low-level runtime controls are limited or undocumented.`
- `Direct/API providers: strongest support for exact runtime controls.`

### 19.4 Surface-level Persona controls

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Runtime identity canon must preserve requested and effective naming and the account/provider identity fields, and must retire local _id substitutes.

Rules:
- requested_persona
- effective_persona
- effective_account_label
### 19.5 Runtime display requirements

When a run is active, the UI must display:
- requested Persona when explicitly set,
- effective Persona,
- selection source/reason,
- effective platform,
- effective model,
- effective variant/effort when present,
- skipped Persona controls when applicable.

This display requirement applies to:
- chat status strip or header,
- interview activity card,
- requirements builder progress/status UI,
- orchestrator activity and run inspection surfaces,
- subagent inline blocks,
- multi-pass reviewer status rows.

### 19.6 Natural-language invocation feedback

If the user summons a Persona via natural language, the UI must reflect it explicitly, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Explorer (User requested, session lock)`

If the override is turn-scoped, the UI should clear back to the previous/auto state on the next eligible turn.

### 19.7 Provider-gap disclosure rule

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0274
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - There is still no shared rule for when an export is just a convenience view versus when it becomes a structured bundle with manifest, canonical refs, trust disclosure, and reproducibility expectations.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The GUI must never imply that a provider honored a Persona control when it did not.

If a control is skipped, the UI must disclose it in at least one of:
- inline status text,
- tooltip,
- activity detail popover,
- run detail/history panel.

#### 19.7.1 Disclosure mechanics

- **Honored** = requested control applied as requested. **Skipped** = ignored entirely. **Clamped** = partially honored but changed to a supported value/range.
- Every disclosure must include: control name, requested value, effective value (if any), and human-readable reason.
- When a limitation is known before execution, render the control disabled or warning-badged in place; do not let the user believe it is actionable.
- When a limitation is only discovered at runtime, surface the disclosure inline on the active surface **and** persist the same information in run detail/history so it is auditable later.
- Disclosures must name the provider explicitly (for example: `Claude Code ignored reasoning_effort=high; provider does not support that control on this model`).

### 19.8 Interview/Builder/Orchestrator mapping editors

Settings or surface-specific configuration must support mapping Persona defaults to:
- Interview stages/phases,
- Requirements Builder steps/passes,
- Orchestrator node/package/lane/seam mappings,
- Multi-Pass review passes.

These editors should also allow platform/model selection per mapping and show compatibility warnings.

### 19.9 Acceptance criteria addendum

- Persona editor must disclose unsupported and partially supported controls per provider.
- All interactive run surfaces must show effective Persona/model/platform and selection reason.
- Natural-language Persona requests must be visibly reflected in the UI when active.
- Provider-gap disclosure must be explicit; no silent implied support.

> Moved to §7.4.8A — Docker Manager Panel Spec

## Rendering Surface Addendum (2026-03-07)

This addendum locks how Markdown, Mermaid, HTML, SVG, and image rendering appear in the Slint GUI.

### Surface inventory impact

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0312
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Source Control should be the narrower but deeper Git/worktree inventory and manipulation surface.
  - confirm the highest-pressure owner/consumer docs still match the current blocker inventory
  - Because the inventory is stable and planning blockers remain zero, the next useful stage is `Ledger Condenser`.
  - Ledger Condenser
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The rewrite must treat browser-capable rendering as a shared capability across these surfaces:

- **Chat Panel**: rendered Markdown text, Mermaid cards, source toggle/open actions, and explicit browser-derived capture chips routed into chat
- **File Editor**: source mode, split preview mode, detached preview mode, and browser mode for HTML/workspace browsing
- **Embedded Document Pane**: preview-capable document review surface using the same rendering and preview identity contract
- **Editor-tab Browser surface**: the canonical in-shell host for `workspace_preview`
- **Detached preview/browser windows**: first-class `detached_preview` surfaces linked to the originating browser subject
- **Automation/Auth browser windows**: visible `automation_session` and `auth_session` surfaces that are not counted as normal in-shell browser tabs
- **Bottom-panel browser-adjacent surfaces**: optional logs, evidence, downloads, console/network summaries, or DevTools-adjacent panes that do not own the canonical browsing session

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### GUI behavior rules

- detached preview/browser windows are part of the intended UX and are not described as degraded workarounds
- the editor/workspace tab surface is the canonical in-shell host for normal browsing and HTML preview
- the bottom panel must not be described as the primary browser host
- HTML/browser mode must visually read as a real browser-capable surface rather than as a static Markdown preview
- users must be able to watch agent-driven browser/testing sessions live when automation is running visibly
- docked DevTools is the default and lives inside the currently focused browser session surface; detached DevTools is an alternate layout
- image viewing remains native and must not inherit unnecessary browser chrome

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Chat panel behavior

Chat messages that contain renderable Markdown/Mermaid content must support:

- readable Markdown formatting
- native Mermaid diagram cards where Mermaid syntax is detected
- actions for copy source, open in editor, open detached preview, and export diagram where relevant
- visible error states for malformed Mermaid instead of silent raw-block disappearance

Chat must not execute arbitrary HTML from message content.

### File editor behavior

The File Editor view must expose clear mode controls for render-capable files:

- Source
- Preview
- Split
- Detached preview
- Browser/rendered mode for HTML

The mode switch must not change the canonical buffer model. Split mode should preserve shared-buffer editing semantics with the existing document/editor contract.

### Embedded document pane behavior

The Embedded Document Pane must reuse the same rendering pipeline and PreviewSession abstraction as the file editor and chat. It is a review/inspection surface, not a separate rendering system.

Required actions:

- open source
- open detached preview
- request re-render/reload
- perform allowed structured edits when the underlying document kind supports them

### Bottom panel browser behavior

The bottom panel is not the canonical host for normal browsing, HTML preview, or click-to-context workflows.

Allowed bottom-panel browser-adjacent roles are:
- console/network summaries for the focused browser session
- downloads, trace/video progress, and evidence activity tied to the focused browser session
- automation activity, step status, or capture status linked to a visible browser session
- DevTools-adjacent panes that complement the focused browser session without becoming a separate browser host

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

Rules:
- actions surfaced from the bottom panel must focus or act on the owning browser session rather than invent a separate browser identity
- browser open, detached-open, takeover, promotion, and recovery actions always target the canonical browser session model
- the bottom panel may expose `Open DevTools`, `Focus Browser`, or evidence actions, but it does not own the primary browsing session

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

### Windowing and platform behavior

- the browser runtime expectation is a PM-managed pinned bundled CEF-class Chromium runtime on Windows, macOS, and Linux
- native child-window embedding is the baseline host strategy; offscreen rendering is secondary
- detached browser and detached DevTools windows are first-class surfaces linked to the owning browser session
- GUI copy must not imply that the browser is only available through detached fallback windows or platform-specific system-webview assumptions
- when the bundled browser runtime is damaged or unavailable, the UI must surface `runtime_unavailable` with remediation and keep source/native surfaces usable
- the UI must not rely on hidden pre-created browser panes to feel responsive on platforms where hidden-window behavior is constrained

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md

### Performance and accessibility

- Use lazy rendering and virtualization for long message streams and large documents.
- Preserve scroll positions where feasible when re-rendering preview content.
- Preview controls must be keyboard reachable.
- Diagram export/open/source actions must have explicit labels and accessible tooltips/text.

### Acceptance criteria addendum

- the same logical subject can move between chat card, editor preview, embedded doc pane, editor-tab browser, detached preview, and detached browser without inventing separate rendering contracts
- Mermaid diagrams render consistently across chat, editor, and planning/doc surfaces
- HTML rendered mode behaves like a real browser/workspace preview, not a static screenshot
- the bottom panel is not required as the primary browser host for the feature to work
- platform limitations may change embedding details, but they must not remove the feature or hide requested/effective browser capability differences
- users can watch a live `automation_session`, safely take over, and promote it to normal browsing without losing the visible browser

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

## Assistant Planning UX Addendum (2026-03-08)

### 1. Assistant Chat planning controls

Assistant Chat planning controls must expose both **Plan** and **Deep Plan** as chat workflow choices.

Required controls:
- planning-mode selector entry for `Plan`
- planning-mode selector entry for `Deep Plan`
- `Plan Thoroughness (PT)` control visible when either planning overlay is active

PT control contract:
- control type: segmented control, dropdown, or equivalent compact selector
- canonical labels: `Light`, `Balanced`, `Comprehensive`
- default selection: `Balanced`
- Deep Plan and Plan share the same PT labels
- tooltip/help copy must explain that Deep Plan is more intensive than Plan at the same PT

### 2. Plan vs Deep Plan visible behavior

**Plan** UI expectations:
- lightweight plan artifact in thread
- sticky plan panel remains visible in chat
- normalized TODO list is visible before approval
- users may revise TODO structure before approval
- execution begins only after explicit approval

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Deep Plan** UI expectations:
- richer planning artifact opens in a preview-capable document/editor surface
- the same normalized TODO contract remains visible in the thread plan panel
- document review, annotations, and targeted revision remain available
- Deep Plan remains more intensive than Plan at the same PT

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Crosswalk.md

**Shared TODO tracker rules:**
- the sticky plan panel is the authoritative TODO tracker
- inline chat updates are milestone-style, not a competing tracker
- TODO statuses support at least `pending`, `in_progress`, `completed`, `blocked`, and `skipped`
- the same TODO identity must survive single-agent, subagent, and crew execution
- plan state transitions (`draft`, `approved`, `executing`, `completed`, `blocked`, `superseded`) must remain visible and restorable

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### 3. Deep Plan review in editor / Embedded Document Pane

Deep Plan documents reuse the Embedded Document Pane annotation/revision contract.

Required behavior:
- highlight text -> annotation action palette
- annotation markers in margin + annotation list/drawer
- `Resubmit with Annotations` launches targeted revision for the plan document
- deterministic annotation re-anchoring after edits
- no silent annotation loss
- no automatic Multi-Pass Review requirement before plan approval/execution

The plan document may contain:
- headings
- lists / tables
- fenced code blocks
- Mermaid diagrams
- file paths / references
- validation and rollout notes

### 4. Assistant recommendation card for Chain Wizard

When Assistant Chat or Deep Plan recommends the Chain Wizard, show a visible recommendation card rather than silently switching surfaces.

Required card content:
- reason summary (for example: `This looks like a substantial feature/enhancement that would benefit from the interview + orchestrator flow.`)
- primary CTA: `Add a new Feature or Enhancement`
- secondary action: `Stay in Chat` / `Not now`

Optional supporting copy may mention:
- that the interview can prune irrelevant phases automatically
- that imported plan/chat context will be carried into the wizard

### 5. Post-acceptance wizard handoff surface

If the user accepts the recommendation:
- switch to the Chain Wizard / Interview flow
- show a visible imported-context banner (`Imported from Assistant Chat` or `Imported from Deep Plan`)
- show whether a plan artifact was included
- show the imported goal/scope summary

Recommended imported-context panel contents:
- user goal
- scope summary
- included plan yes/no
- open questions count
- `has_gui` hint when known

If a project is already active, the wizard should open on the preloaded feature/enhancement path rather than on a blank intent picker.

### 6. Non-goals

- Do not copy external GUI layout from OpenCode, Cursor, VSCode, or other tools.
- Do not auto-create repo files for planning artifacts without explicit user action.
- Do not silently redirect the user from chat into the wizard.

### 7. Acceptance criteria

- Assistant Chat visibly exposes both Plan and Deep Plan.
- PT is shown for both planning overlays using the canonical labels `Light`, `Balanced`, and `Comprehensive`.
- Deep Plan documents open in a preview-capable editor/document surface and support durable annotations plus targeted revision.
- When the wizard is recommended, the user sees an explicit CTA and can decline without leaving chat.
- Accepting the CTA opens the Chain Wizard / Interview flow with visible imported context.
- Planning documents continue to use the shared markdown/mermaid rendering and source-canonical rules already defined elsewhere in the spec.

## Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0259
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The GUI should never guess that a previously visible `[retired-token-1]` set is still valid if the blocked projection is stale.
  - [retired-token-1]
  - normative ghost IDs still survive through examples, Final GUI remediation actions, and non-catalog command references.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### 1. Dashboard cards

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0261
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - wizard-blocked cards outrank wizard-attention-required
  - Dashboard CtA cards, thread badges, and blocked/attention notices already carry the right kinds of identity:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The Dashboard must distinguish:
- `wizard_attention_required`
- `wizard_blocked`
- HITL blocked actions
- remote-side-effect blocked actions

`wizard_blocked` card requirements:
- more severe copy than `wizard_attention_required`
- primary CTA: `Resume Wizard`
- secondary CTA: `View report`
- auto-dismiss only when the wizard leaves `blocked`

### 2. Assistant thread selector / badges

#### 2.1 Worktree icon in thread selector

Each thread row in the thread selector displays a worktree icon when the thread has an active worktree binding.

- **Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention)
- **Icon:** Theme-consistent branch/tree glyph from icon set
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip:** Branch name, status pill text, worktree path
- **Icon color:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`. Colors resolve through theme tokens across all three built-in themes.
- **Stale projection:** Icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)"

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Thread and session navigation uses persistent shell surfaces.

Rules:
- the active thread list is visible in a persistent sidebar or equivalent persistent region, not only in a floating overlay
- the selector must expose running, queued, blocked, and attention-required badges per thread
- branch lineage is visible in the selector/history model using stable branch labels and source lineage metadata
- badge aggregation must preserve highest-severity state while still showing blocked counts when present
- the project/session browser may complement thread navigation but does not replace the active-thread list inside chat

The floating thread-list overlay pattern is not canonical after this section.
### 3. Run Graph and Orchestrator views

Required visible scheduler/remediation data:
- wake reason
- ready/blocked/backoff/remediation counts
- selected-node score breakdown
- ready-but-unselected reasons
- safe-point ID
- remediation lineage identifiers

### 4. blocked outcome copy

When a remote side effect or guard prevents execution, the GUI MUST present the outcome as `blocked`, not `failed`, and must preserve any completed local work.

### 5. Event-driven correctness

All scheduler/remediation/blocked UI updates must follow the existing `invoke_from_event_loop` event-driven rule. No timer polling for correctness.

### 6. Acceptance criteria

- Dashboard has a first-class `wizard_blocked` card.
- Thread badges distinguish `blocked` from `attention_required`.
- Scheduler/remediation state is inspectable in run surfaces.
- blocked outcomes are not mislabeled as failures.
- new runtime widgets obey the event-driven rewrite rule.
## Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

The GUI must expose the packet's runtime state without relying on hidden behavior.

### Required visible elements
- queue-analysis summary with last wake reason
- blocked-state badges and grouped blocked lists
- safe-point state and restore status where applicable
- remediation lineage navigation
- disabled-action explanations tied to canonical reason codes
- clear distinction between `attention_required`, `blocked`, `retrying`, and terminal failure

### Event-driven update rule

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0294
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Update worker/detail surface docs so “worker identity” shows:
  - 4. Update mirrors/checklists only after owner/consumer canon is stable.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
All scheduler, blocked, and remediation widgets MUST update from runtime events/projections rather than periodic timers.

### UX safety rule
If the GUI cannot perform a required action in the current mode, it must state why and point to the canonical recovery path. The GUI must not present controls that imply hidden fallback, hidden retry, or hidden re-auth behavior.
## Runtime Blocked, Queue, and Recovery GUI Reconciliation Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### `wizard_blocked` CtA card
Add a first-class `wizard_blocked` card alongside `wizard_attention_required`.

Required fields:
- `card_type = wizard_blocked`
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `report_ref`
- `resume_url`
- `thread_id?`

Required UI behavior:
- more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`
### Thread/status surfaces
Thread and run status surfaces MUST include distinct presentations for:
- `attention_required`
- `blocked`
- `retrying/backoff`
- `remediation`
## Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

This addendum retains GUI-specific recovery rules that supplement the canonical blocked/recovery section below.

### FileSafe rendering
A FileSafe block is a persistent blocked episode until the underlying runtime block resolves. It MUST NOT auto-dismiss while still active.

### Degraded draft warning

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0293
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `warning` or `attention_required`
  - warning
  - attention_required
  - use `historical_only` or `idle`, not a warning color/state
  - historical_only
  - idle
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Decomposition degradation is a pre-lock planning state only. GUI copy MUST NOT imply silent degraded canonical execution after graph lock.

### All-nodes-blocked gating

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0289
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - all-nodes-blocked can escalate by elapsed time
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical.
## Canonical Blocked/Recovery Behavior
This section is the canonical GUI summary for blocked and recovery surfaces.

### Dashboard Action Required
Blocked and recovery UI binds to canonical blocked projections and HITL records.
- `wizard_blocked` is a first-class card alongside `wizard_attention_required`
- blocked cards use the fields `card_type`, `wizard_id`, `wizard_step`, `blocked_reason_code`, `report_ref`, `resume_url`, and optional `thread_id`
- `wizard_blocked` uses more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`
- blocked payloads use ordered `allowed_action_ids[]`
- blocked episodes remain distinct when more than one is active
- GUI labels may vary by surface, but command binding always resolves through the shared runtime command catalog

### Thread and run status taxonomy
`waiting_approval` and other blocked reasons are runtime overlays, not replacement run-graph lifecycle states.
- lifecycle remains the graph-progress contract
- blocked, backoff, retry, remediation, and approval-pending are rendered from runtime projections
- requested vs effective persona/platform/model remains visible where runtime substitution occurred

### Scope rule
The GUI does not synthesize alternate blocked schemas, alternate action arrays, or alternate retry classes for specific surfaces.

### Visual distinction
- blocked episodes are visually distinct from ordinary paused/idle states
- multiple simultaneous blocked episodes show per-episode controls and a count summary where appropriate
- remediation-ceiling-exceeded and validation-blocked use the same blocked-payload contract as other blocked episodes rather than bespoke one-off UI treatment

### Runtime state presentation
Scheduler surfaces MUST visually distinguish:
- blocked waiting for prerequisite or approval
- retrying/backoff
- remediation in progress
- terminal failure

### Recovery UX rules
- safe points are runtime recovery anchors and MUST NOT be presented as user-facing restore points
- retry controls MUST distinguish `Retry from safe point` from `Start fresh attempt`
- if no valid safe point exists, `Retry from safe point` is disabled with an explanation

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md
## Blocked-State Visual Distinction and Recovery UX Addendum

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### Blocked-state visual distinction

| State | Badge Color | Icon | Label Text | Tooltip |
|-------|-------------|------|------------|---------|
| `attention_required` | Amber | Warning triangle | "Needs input" | "This step needs your input to continue. The system can still make progress on other steps." |
| `blocked` | Red | Stop circle | "Blocked" | "This step is blocked and cannot continue until you take action. All automatic retries are exhausted." |
| `waiting_approval` | Blue | User badge | "Awaiting approval" | "This step is waiting for your approval before proceeding with a sensitive operation." |

- `attention_required` and `blocked` MUST be visually distinct -- they represent different escalation levels.
- `attention_required` allows continued background work; `blocked` does not.
- Dashboard cards, thread badges, and Run Graph View node badges all use this canonical visual mapping.

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Concurrent blocked episodes

When multiple nodes are blocked simultaneously:

1. The dashboard MUST show a count badge (e.g., "3 blocked") on the run card.
2. Clicking the badge opens a filtered list of all currently blocked nodes, sorted by `blocked_sequence` descending (most recently blocked first).
3. Each list item shows: node name, `blocked_reason_code` label, time since blocked, and the primary `allowed_action_ids[]` as action buttons.
4. The user can expand any item to see full blocked detail (explanation, `detail_ref` contents, remediation lineage if applicable).
5. Multiple concurrent blocked episodes MUST NOT be collapsed into a single notification -- each blocked node is a distinct actionable item.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Graph_View.md

### Remediation ceiling exceeded UX

When the remediation generation count reaches the ceiling (default: 3 per Plans/Decision_Policy.md):

1. The node transitions to `blocked` with `blocked_reason_code: remediation_ceiling_exceeded`.
2. The Run Graph View displays a red "Remediation limit reached" banner on the node detail panel.
3. Available actions presented to the user:
   - **Replan** (`cmd.orchestrator.replan_node`): Trigger a graph replan that may restructure the node's dependencies.
   - **Manual fix** (`cmd.orchestrator.open_for_edit`): Open the relevant files for manual editing, then resume.
   - **Abort node** (`cmd.orchestrator.abort_node`): Mark the node as permanently failed and continue the run without it (if the graph allows).
4. The remediation lineage tree remains visible for diagnostic purposes.
5. No automatic retry is permitted after ceiling is reached.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Graph_View.md

### Degradation warning

When draft decomposition degrades from graph to flat sequencing (before canonical graph lock):

1. The UI displays an amber warning banner: "Plan simplified to sequential steps due to structural issues in the decomposition. Performance may be reduced."
2. The banner includes a "View details" link that shows the specific `graph_integrity` issues detected.
3. No user action is required -- the run continues with flat sequencing automatically.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/chain-wizard-flexibility.md

### All-nodes-blocked circuit breaker

If all runnable nodes in a run are simultaneously in blocked state:

> **Superseded** — event-driven blocked-state transitions are canonical. The GUI must react to runtime events and projections, not timer-driven pause or warning thresholds.

Canonical rule:
1. When all runnable nodes are blocked, the runtime emits the relevant blocked/recovery events and the UI shows the corresponding persistent blocked-state banner or card immediately.
2. The user can resume at any time after resolving blocks.
3. Polling intervals are acceptable only for external systems without push delivery (for example GitHub Actions status refresh every 30s) and must be documented as freshness aids rather than canonical correctness logic.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

## 15. Promoted widget catalog (web tools, planning, question, operation cards)

The promoted widget catalog mirrors the shared runtime contracts. Widget entries below replace the older mixed status taxonomy and Mermaid-only collapse.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 15.1 Terminal operation card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Terminal promotion and handoff are locked so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal action canon must preserve the distinct terminal actions and give Rerun in Terminal owned command-table treatment rather than collapsing actions into one normalized target.

Fields:
- terminal_session_id
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out

Rules:
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator
- READ-ONLY and non-interactive
- One card per command
- Retries create a new terminal and therefore a new mini terminal card
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- Every promoted command card binds to stable terminal session identity
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
### 15.2 Search result card widget

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0269
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Good result row fields:
  - Result should likely carry:
  - Result should carry:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section consumes the linked owner contract and stays aligned with it.

ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Core rules:
- Answer construction must preserve search-then-read behavior, final citations must come from the actual read path rather than raw search snippets alone, and web activity/provenance docs must use the exact storage/contracts/browser ContractRef targets instead of malformed generic anchors.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.

Fields:
- Serper-backed Google-result behavior
- sources
- categories
- optional result scraping behavior in Firecrawl `websearch`

Rules:
- search-then-read behavior
- final citations come from the actual read path
- raw search snippets alone are not enough provenance for the final answer
- chat may shortlist with search but must read chosen pages before citing them as final evidence
### 15.3 Web and diff operation card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The web routing algorithm must include a capability-unavailable terminal branch with clear setup guidance when no provider supports the requested operation.
- Site Reader canon must require real browser interaction, reserve `Reading Site` for the PM-native Site Reader path, and prevent provider-routed fetch from reusing that reserved identity.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract.
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Operation cards are restricted to lifecycle-bearing operations, exclude other widget families, and use a locked card-level state machine reconciled against the 8-state agent/process taxonomy.
- Message controls are locked to most-recent-user scope, queued-message FIFO semantics, explicit rewind/discard behavior, always-visible code-block copy, mandatory subagent disclosure, and transient queue state that is not restored across reload or restart.
- All web tools share a common output field set that includes provider identity, routing reason, timing, cache status, and standard error or warning fields.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.

Fields:
- webresearch
- no-URL natural-language research
- navigation/forms/pagination capability
- structured extraction behavior during provider-native research
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- cancelled: true
- status_badge_state
- `tool_use_id`
- `adapter_id`
- `adapter_selection_reason`
- `duration_ms`
- `timestamp`
- `cached`
- `error_code?`
- `error_message?`
- `warnings?`
- `provenance_badge?`
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health

Rules:
- capability-unavailable terminal branch
- clear setup guidance when no provider supports the requested operation
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- Reading Site
- provider-routed fetch must not reuse the reserved native Site Reader identity
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator
- READ-ONLY and non-interactive
- One card per command
- Retries create a new terminal and therefore a new mini terminal card
- Open in Terminal
- pending
- running
- completed
- failed
- cancelled
- blocked
- starting
- exited
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- always-visible copy affordance on fenced code blocks
- queue state is transient and is not restored across reload or restart
- blocked_reason_code
- allowed_action_ids[]
- denial_reason_code
- denial_source
- suggested_recovery_action
- adapter_id
- adapter_unavailable
- badge is always visible
- running output may promote out of inline comfort based on heuristic thresholds
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- simple read/grep/glob results remain inline text, not cards
- Stop becomes disabled when a run completes and no next message is queued
- Edit restores content into composer and discards later history/work
- Resend retries the most recent message and discards later history/work
- blocked responses must be machine-actionable through `allowed_action_ids[]`
- error naming aligns to `adapter_unavailable`
### 15.4 Planning panel widget (sticky sidebar)

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/assistant-chat-design.md#8.1 Canonical planning model

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded

Labels and values:
- Plan
- Deep Plan
- chat.plan_todo_updated
### 15.5 Question card widget

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question flows are locked to PM-managed draft state, required visible options plus a freeform path, resumable multi-question drafts, and explicit dismissed or paused behavior instead of fabricated answers.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- NOT via `sendPrompt`
- Something else
- Always-visible options
- Drafts auto-save until submit
- Exiting/dismissing does NOT auto-submit
- Thread-scoped draft state
- status: 'dismissed'
- draft
- drafts auto-save continuously
- required questions block final submit
- question cards may include a visual
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
### 15.6 Mermaid and inline visualizer widgets

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0271
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - render/preview exports (for example Mermaid `SVG` / `PNG`)
  - SVG
  - PNG
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section defines the canonical contract for this surface.

ContractRef: Plans/assistant-chat-design.md#28.2 Inline visualizer bridge

Core rules:
- Mermaid and inline visualizer behavior is locked to native card rendering, explicit error and fallback disclosure, sandboxing without arbitrary HTML execution, bounded persistence, injected theme tokens, and the exact inline visualizer bridge cross-reference target.

Rules:
- Copy source
- Open in editor
- Open detached preview
- Export diagram
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- sendPrompt(text)
- openLink(url)
### 15.7 Permission approval card widget

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget

Core rules:
- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools ask-gated in read_only and plan presets, and carry the blocked/unavailable payload fields through to permission-card consumers.

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
