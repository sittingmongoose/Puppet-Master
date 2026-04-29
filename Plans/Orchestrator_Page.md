# Orchestrator Page -- Single-Page 6-Tab Specification

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Storage/delivery clarification pressure from user
  - New execution-policy settings requirement
  - Current docs do say Orchestrator consumes the plan/node graph for execution
  - Design discussion now has a concrete recommendation direction
  - Parent-object field-shape direction now discussed
  - Child-record field-shape direction now discussed
  - GUI gap is now explicit
  - Current docs are not fully simplified to "graph only"
  - Orchestrator ownership boundaries
  - Worktree gap is now explicit
  - GUI / UX Impacts
  - Cleanup Priorities

#### Source target target-0406
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Storage/delivery clarification pressure from user
  - New execution-policy settings requirement
  - Current docs do say Orchestrator consumes the plan/node graph for execution
  - Design discussion now has a concrete recommendation direction
  - Parent-object field-shape direction now discussed
  - Child-record field-shape direction now discussed
  - GUI gap is now explicit
  - Current docs are not fully simplified to "graph only"
  - Orchestrator ownership boundaries
  - Worktree gap is now explicit
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
  - Orchestrator must consume canonical runtime fields and event names from shared contracts
  - use plan-graph index and node shard files as required execution inputs
  - treat runnable graph nodes, DAG readiness, and dispatch from a global ready set as the scheduling model
  - define the governing intelligence/control loop in a graph-canonical system
  - resolve whether tiers remain only a derived human-facing lens or retain execution authority
  - `feature_seam` should own membership, lifecycle, requested settings, overseer/governance state, seam-promotion state, and seam evidence linkage
  - `work_package` should own membership, lifecycle, requested settings, overseer/delegation/worktree policy refs, baseline lane state, package-governance state, promotion linkage, and package evidence linkage
  - `run` should own execution-session identity/lifecycle, graph linkage, run-level settings snapshot, and active pointers/rollup posture
  - `resolution_thread` should persist trigger linkage, resolution kind, issue summary, allowed actions, status, and UI/chat linkage
  - no documented GUI surface yet for `work package`
  - no documented GUI surface yet for `feature seam`
  - no documented seam-level acceptance / weak-integration / corroboration review affordance yet
  - execution is documented against graph nodes
  - orchestration identity, UI labels, and persona defaults still retain a tier hierarchy as a first-class overlay
  - Define what Orchestrator is allowed to own: page layout and controls, view-model/projections, run control intents; exclude canonical runtime enums, event semantics, scheduler truth.
  - Pin the primary discussion seam first: UI surface/IA vs runtime state model vs cross-surface lineage/receipts vs blocked/recovery/remediation UX.
  - Record explicit boundary between canonical runtime facts, orchestrator projections, and widget/page presentation.
  - Carry forward requested-vs-effective state wherever persona/provider/model fallback can occur.
  - Decide whether worktrees are allocated/owned per node, per package, per seam, or per remediation branch.
  - Resolve package-based worktree preference vs [retired-token-16] for scale/manageability.
  - Record worktree ownership/isolation rules after Orchestrator ownership boundaries are pinned.
  - Expose source-control/worktree handshake as a remaining blind spot.
  - Replace Tiers-first navigation
  - Define Dashboard→Orchestrator→thread routing contract
  - Add package/seam/lane visualization widgets
  - Define which overseer's thread opens on click
  - Make worktree/lane state visible and navigable
  - Relax or replace stale graph-schema constants `[retired-token-25]` and [retired-token-26].
  - Add package/seam/lane/worktree/account identity fields to canonical runtime/event/envelope contracts.
  - Define contamination and safe-point linkage explicitly in storage and blocked-payload contracts.
  - Replace or demote [retired-token-31] widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than [retired-token-35].
  - `[retired-token-41]`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - [retired-token-41]
  - Plans/Run_Graph_View.md
  - Plans/Widget_System.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - likely issue: attention routing is thread-local or wizard-local, not explicitly Dashboard -> Orchestrator -> chat-thread for blocked and major-decision paths.
  - Orchestrator still references `Tiers` and per-tier worktree ownership
  - Tiers
  - `orchestrator.receipt.{run_id}.{attempt_id}` already carries `repo_id`, `worktree_id`, branch, commit-range, workflow refs, etc.
  - orchestrator.receipt.{run_id}.{attempt_id}
  - repo_id
  - worktree_id
  - Orchestrator should be the stronger lane/worktree operations overview.
  - Orchestrator CTAs should route into Source Control for Git-native operations with exact project/run/package/lane/worktree context preserved.
  - `suspect` and `restoring` are operational states visible in Orchestrator first and in Source Control second
  - suspect
  - restoring
  - Orchestrator may initiate scoped actions on a lane/worktree from run context.
  - `Progress` as the widget-hosting operational tab
  - Progress
  - destructive Git/worktree actions should resolve through Source Control semantics, even if launched from Orchestrator.
  - Orchestrator remains the place where blocked ownership and run consequences are clearest
  - Orchestrator should remain package/seam/lane-first and treat worktrees as backing execution assets shown in context.
  - Orchestrator = package/governance/execution truth
  - Orchestrator should not mirror a raw worktree inventory table.
  - Orchestrator should instead show:
  - `Progress` is the widget-hosting tab
  - `Orchestrator / Progress`
  - Orchestrator / Progress
  - `Orchestrator / Seams`
  - Orchestrator / Seams
  - `Orchestrator / Evidence`
  - Orchestrator / Evidence
  - `Orchestrator / History`
  - Orchestrator / History
  - `Orchestrator / Ledger`
  - Orchestrator / Ledger
  - widgets must consume stable orchestrator projections and canonical record/query contracts
  - widget config must not invent alternate scoping semantics that diverge from the tab's canonical projection rules
  - non-Orchestrator widgets should not be hostable on the Orchestrator page
  - not every Orchestrator tab surface should become a portable widget
  - `widget_layout:v1:orchestrator:progress`
  - widget_layout:v1:orchestrator:progress
  - `widget_layout:v1:orchestrator:tiers`
  - widget_layout:v1:orchestrator:tiers
  - `widget_layout:v1:orchestrator:evidence`
  - widget_layout:v1:orchestrator:evidence
  - `widget_layout:v1:orchestrator:history`
  - widget_layout:v1:orchestrator:history
  - `widget_layout:v1:orchestrator:ledger`
  - widget_layout:v1:orchestrator:ledger
  - still describes `Tiers` as a widget-based tab and carries old default layouts.
  - Make `Progress` the only widget-composed Orchestrator tab.
  - No shared projection freshness schema is currently obvious across Usage, Orchestrator, Source Control, and other projection-backed surfaces.
  - there is no obvious equivalent `orchestrator.project_state.{project_id}` with focused/selected run state
  - orchestrator.project_state.{project_id}
  - `focused_run_id` = the run whose data the Orchestrator tabs are currently showing
  - focused_run_id
  - Orchestrator should surface that without silently replacing the focused context
  - `orchestrator.project_state.{project_id}`
  - all Orchestrator tabs share the same focused `run_id`
  - run_id
  - Current `Progress` tab language is heavily live-run oriented.
  - `Orchestrator search`
  - Orchestrator search
  - seam/package -> `Seams` tab with correct hierarchy expanded
  - Seams
  - Orchestrator search must be run-aware.
  - `Search in this tab`
  - Search in this tab
  - `Search Orchestrator`
  - Search Orchestrator
  - command palette can expose Orchestrator object results, not just commands/pages
  - selecting an object result should route through the same deep-link contract as Orchestrator search
  - `Tantivy` is clearly intended for search, but the object/record side of Orchestrator search is not yet specified enough to rely on full-text alone.
  - Tantivy
  - Define a canonical Orchestrator search result contract with:
  - Search should help the user find the right object, not force them to know which tab owns it first.
  - A narrow Source Control panel reinforces that richer cross-object search belongs more naturally in Orchestrator / command-palette flows than in side-panel SCM UI.
  - every non-trivial Orchestrator export should include a manifest
  - Current Orchestrator usage/evidence export language is too UI-view-centric.
  - export/import of config bundles is already strong; Orchestrator exports should reach similar clarity
  - Candidate resolver inputs for Orchestrator should likely include:
  - Orchestrator should gain the same clarity:
  - orchestrator status (`idle/running/paused`)
  - idle/running/paused
  - a widget should deep-link to the native tab when the user wants dense detail
  - every dense Orchestrator tab needs first-class summarization, filtering, and paging before it needs more visual chrome
  - Orchestrator can expose deep links into those actions, but should not become the main place where raw Git/worktree batch cleanup is fired blindly.
  - There is no shared freshness/trust contract yet for Orchestrator tabs.
  - Orchestrator owns lane-pool truth and cleanup posture in execution context
  - Orchestrator still shows the historical lane/worktree identity
  - glossary/help need to catch up to Orchestrator object semantics before UI copy starts crystallizing around weaker synonyms
  - The shared provider-runtime contract is already broader than Orchestrator:
  - but it is still an interview/document-production run, not an Orchestrator package/node execution record
  - But it also means reconciliation later must avoid accidentally renaming all blocked semantics as “Orchestrator” semantics.
  - assistant/interviewer/builders share provider/account/runtime identity semantics with Orchestrator
  - These families are conceptually different, but the docs still do not give Orchestrator a unified export contract that ties them together.
  - any non-trivial Orchestrator bundle export should carry a manifest
  - `Runtime_Artifacts_Panel.md` provides a good anchor for Orchestrator exports:
  - Runtime_Artifacts_Panel.md
  - Orchestrator still lacks one explicit export contract tying together:
  - `cmd.orchestrator.open_in_source_control`
  - cmd.orchestrator.open_in_source_control
  - `cmd.orchestrator.open_in_github_actions`
  - cmd.orchestrator.open_in_github_actions
  - `cmd.orchestrator.open_in_docker_manager`
  - cmd.orchestrator.open_in_docker_manager
  - `resume_url` is currently stronger than some Orchestrator pivots in terms of specificity, which suggests the more generic routing layer is still underdefined.
  - resume_url
  - Add stable `object_kind` / `object_id` vocabulary for the newer Orchestrator object model and adjacent runtime actors.
  - object_kind
  - object_id
  - Dashboard portability should stay attached to the right widget set, not be used as a reason to widgetize every Orchestrator tab
  - `Widget_System.md` and `[retired-token-42]` continue to treat multiple Orchestrator tabs as widget-composed
  - Widget_System.md
  - [retired-token-42]
  - widget-hostability and widget-layout persistence still imply non-Progress Orchestrator tabs are widget pages
  - Reclassify Orchestrator surfaces so only `Progress` is widget-composed and move non-Progress tabs onto native view-state contracts.
  - it does not yet carry the terms that now need stable cross-doc meaning in Orchestrator, Source Control, search, history, ledger, and help
  - Orchestrator emphasizes lane as operational object
  - `Widget_System.md` is still written for the earlier world where multiple Orchestrator tabs are widget pages.
  - that creates an unresolved question about whether Orchestrator `Progress` layout is app-global, project-scoped, or layered
  - Narrow the widget-hostable Orchestrator surface to `Progress` only.
  - `tab scope`: tab-native filters and object pivots for that surface
  - tab scope
  - Orchestrator deep links already prefer attempt/receipt/worktree/workflow refs
  - but there is still no shared `ProjectionHealth`/trust contract spanning Usage, Orchestrator, Source Control, and widgets
  - ProjectionHealth
  - Orchestrator page contracts still lag the canonical identity model in concrete ways:
  - GitHub and Orchestrator surfaces still do not promote auth/scope/rate-limit issues into concern-aware or trust-aware projections; they remain closer to UI error states than canonical runtime records
  - Orchestrator still uses forbidden `[retired-token-37]` / `[retired-token-36]` names.
  - [retired-token-37]
  - [retired-token-36]
  - Orchestrator already has a strong “requested vs effective must remain visible on fallback” rule; the gap is now the missing account/auth/trust fields and canonical naming alignment.
  - for example, a blocked project card might imply “open Orchestrator”
  - “Show in Usage/Ledger” and Orchestrator pivots still encode object routing as command-specific payloads rather than one shared route structure
  - keep stable object/action command IDs (`cmd.runtime.*`, `cmd.orchestrator.open_in_source_control`, etc.)
  - cmd.runtime.*
  - consumer docs for History / Ledger / Orchestrator runtime detail
  - Research Progress - 2026-03-16 - Opus Orchestrator / Wizard / Worktree Drift Deepening
  - Introduce node/actor/lane-aware execution context into orchestrator runtime structs and active-agent tracking.
  - `WorktreeGitImprovement.md` already recognizes Source Control vs Orchestrator surface separation, but its runtime ownership language is still `tier`-first rather than `lane/worktree` plus canonical execution-unit refs.
  - WorktreeGitImprovement.md
  - tier
  - lane/worktree
  - `FinalGUISpec.md` still has no true Orchestrator page section, still leaves `Tiers` as a standalone run-group view, and still lacks any native concern-model, historical-run-mode, or Progress-only widget-boundary contract.
  - FinalGUISpec.md
  - `chain-wizard-flexibility.md` still leaks orchestrator ownership into pre-run CUP/quality blocking, still omits hard lineage keys from the normalized downstream payload (`project_id`, thread/report identity), and still overstates Contribute(PR) as “no worktrees” rather than a stable-branch policy with isolated runtime execution underneath.
  - chain-wizard-flexibility.md
  - project_id
  - Rebase orchestrator live-context structs around node/attempt/worktree/permission-aware execution envelopes instead of tier-keyed adapters.
  - `FinalGUISpec.md` still conflicts with Orchestrator-page canon by listing standalone `Tiers` / `Evidence` / `History` / `Ledger` views, and still hosts non-canonical `cmd.orchestrator.*` action IDs where `[retired-token-38]` defines different stable IDs.
  - Evidence
  - History
  - Ledger
  - cmd.orchestrator.*
  - [retired-token-38]
  - `[retired-token-38]` now has a concrete template-level contradiction: `[retired-token-39]` references `[retired-token-40]`, but the canonical command catalog does not define it.
  - [retired-token-39]
  - [retired-token-40]
  - `[retired-token-40]` currently appears in the wiring template without existing in the catalog.
  - `orchestrator.receipt.{run_id}.{attempt_id}` already exists
  - `CrewCreator::Orchestrator { [retired-token-12]: format!(\"interview-phase-...\") }`
  - CrewCreator::Orchestrator { [retired-token-12]: format!(\"interview-phase-...\") }
  - Keep wizard/interview separate from Orchestrator ontology, but require them to emit enough canonical identity for downstream consumers to remain truthful without reconstructing context heuristically.
  - `[retired-token-39]` still references `[retired-token-40]`, but `[retired-token-38]` does not define it.
  - `[retired-token-40]` is still referenced without existing in the catalog.
  - cross-surface `orchestrator.receipt.{run_id}.{attempt_id}`
  - `storage-plan.md` currently has only adjacent state like `source_control.project_state.{project_id}` and `orchestrator.receipt.{run_id}.{attempt_id}`; it does not yet define a proper durable worktree record/projection family for lifecycle/history/audit
  - storage-plan.md
  - source_control.project_state.{project_id}
  - This means several surfaces are currently leaning on the same narrow bridge object (`orchestrator.receipt`) to explain more than it should:
  - orchestrator.receipt
  - Keep `orchestrator.receipt` as the cross-surface bridge object, but stop letting it impersonate missing lifecycle records for artifacts or worktrees.
  - `orchestrator.receipt` should remain the cross-surface bridge record, not the substitute for these families.
  - `orchestrator.receipt` already carries `worktree_id?`, which is useful, but without a worktree record/projection family there is nowhere canonical for lifecycle/history to live.
  - worktree_id?
  - `newtools.md` introduces additional ghost command IDs (`cmd.orchestrator.preview_*`, `cmd.orchestrator.build_run`, etc.) and a new `CustomHeadlessTool` ToolID without registering them in the canonical catalog/tool/permission owners.
  - newtools.md
  - cmd.orchestrator.preview_*
  - cmd.orchestrator.build_run
  - CustomHeadlessTool
  - `Run_Modes.md` now sharpens the execution-model seams further: DAE jail vs orchestrator worktree vs Contribute(PR) single-branch isolation are still three incompatible models, and mode resolution remains identity-blind to account/role differences.
  - Run_Modes.md
  - what should the progress tree / compact terminal / high-level tab badges display right now
  - `[retired-token-42]` still describes tab 2 as `Tiers` and uses tier-keyed widgets/event rows even though the rewrite direction is now `Seams` plus node/package/seam/lane-native execution objects.
  - `orchestrator.receipt.{run_id}.{attempt_id}` in `storage-plan.md` is already the bridge object for external operational surfaces:
  - `orchestrator.receipt.{run_id}.{attempt_id}` already bridges Source Control / GitHub Actions / Docker / Kubernetes / Usage
  - Orchestrator with `focused_run_id`, selected node/attempt, tab, inspector target
  - cross-surface commands like `cmd.orchestrator.open_in_source_control` are meaningful UX actions, but their arg shapes are still custom rather than obviously derived from one route schema.
  - preview/build/open-artifact orchestrator command IDs are still exact uncataloged gaps.
  - the missing orchestrator command set now includes `cmd.orchestrator.push_image` in addition to preview/build/open-artifact IDs.
  - cmd.orchestrator.push_image
  - the remaining missing orchestrator command gap set is now tight and explicit.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `[retired-token-38]` mirrors the same fragmentation: artifact actions, thread usage actions, panel switches, and Orchestrator pivots all carry their own local arg sets.
  - evidence tab vs history tab vs review tab within an inspector
  - `cmd.docker.image.push` and `cmd.orchestrator.push_image` still both claim publish authority with the same event family.
  - cmd.docker.image.push
  - If a route needs a panel or tab visible, that should be expressed as destination intent, not as raw shell-state restoration payload.
  - `View in Usage` from Orchestrator Ledger
  - View in Usage
  - `tab_id` remains allowed because top-level tab restoration is part of route/focus behavior.
  - tab_id
  - tab within a routed page that still needs explicit tab selection
  - `page_tab` is currently most needed for Orchestrator, but it should remain general and not be renamed around one page.
  - page_tab
  - Use `page_tab` when the routed destination must land inside a known page and force a specific tab.
  - Some graph/detail pivots still read as tab switches plus local state instead of canonical route restoration.
  - `tab_id` is meaningful only with `target_kind = page_tab` or with a routed page whose visibility depends on a known stable tab family.
  - target_kind = page_tab
  - `tab_id` should stay absent when the destination surface can reveal the target without explicit tab forcing.
  - Start with the Orchestrator tab family as the first canonical enum set.
  - It is not a generic “any tab anywhere” field.
  - tab 2 is still `Tiers`
  - Orchestrator consumes worktree identity, blocked state, and lineage
  - `Tab 2: Tiers`
  - Tab 2: Tiers
  - `orchestrator:tiers`
  - orchestrator:tiers
  - `[retired-token-41]` still asks consumers to bind worker and verifier identity using stale/local names:
  - Orchestrator live-status documentation still uses `TierChanged` / `request_id` language beside newer blocked-projection contracts.
  - TierChanged
  - request_id
  - Reconcile Orchestrator live-status dependencies so request-centric HITL bindings stop competing with blocked-projection bindings.
  - older `[retired-token-6]` streams from the tier-era orchestrator model
  - [retired-token-6]
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - at minimum the owner-boundary decisions that now affect routing, Orchestrator ontology, blocked identity, runtime identity, and projection-trust vocabulary
  - `orchestrator.receipt.{run_id}.{attempt_id}` is attempt-native
  - no first-class `worktree_record` / `lane_record` family even though Orchestrator and Source Control now depend on durable lane/worktree lifecycle
  - worktree_record
  - lane_record
  - `Orchestrator tier override`
  - Orchestrator tier override
  - dashboard/current-task language still uses current tier / phase-task-subtask progress bars as if that were the canonical Orchestrator model
  - Appendix C still expands widgetization around Dashboard and references `Orchestrator tabs` through the widget system
  - Orchestrator tabs
  - the Settings tab inventory still includes `Tiers` and tier-oriented settings language
  - Orchestrator graph/seam/package governance model
  - Research Progress - 2026-03-17 - execution-core and main surface seam: Executor Protocol, Orchestrator Page
  - `[retired-token-41]` remains one of the strongest stale surface owners:
  - `[retired-token-42]` still turns stale ontology into tab structure, widget structure, event sources, filter keys, and worker identity fields.
  - `Open that tier in the [retired-token-19]`
  - Open that tier in the [retired-token-19]
  - data sources still rely on `PuppetMasterEvent::TierChanged`, `[retired-token-12]`, and phase/task/subtask framing for multiple Orchestrator widgets
  - PuppetMasterEvent::TierChanged
  - [retired-token-12]
  - Orchestrator hostability narrowed to `Progress`
  - still lists `Orchestrator single-page with 6 tabs` including `Tiers`
  - Orchestrator single-page with 6 tabs
  - Orchestrator single page with 6 tabs including `Tiers`
  - `[retired-token-41]` / `[retired-token-45]` / `Plans/Glossary.md`
  - [retired-token-45]
  - Plans/Glossary.md
  - `[retired-token-41]` / `[retired-token-45]`
  - `orchestrator.project_state.{project_id}` persistence record
  - `[retired-token-41]`, `[retired-token-48]`, `[retired-token-45]`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/Prompt_Pipeline.md`
  - [retired-token-48]
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - `[retired-token-45]`, `Plans/Glossary.md`, `[retired-token-41]`, `[retired-token-48]`, `Plans/usage-feature.md`
  - Plans/usage-feature.md
  - `Plans/Glossary.md` and `[retired-token-41]` already carry real token/label/behavior blocks, but still lack the required discoverable owner headings in the audited canon clusters.
  - `[retired-token-41]:16-43`
  - [retired-token-41]:16-43
  - `[retired-token-41]:451-474`
  - [retired-token-41]:451-474
  - `[retired-token-41]:258-266`
  - [retired-token-41]:258-266
  - `[retired-token-41]:358-377`
  - [retired-token-41]:358-377
  - `[retired-token-41]:428-475`
  - [retired-token-41]:428-475
  - `[retired-token-46]` still points to a non-existent `[retired-token-41]#11. Source Control boundary`, which sharpens `[retired-token-49]`'s owner-heading defect.
  - [retired-token-46]
  - [retired-token-41]#11. Source Control boundary
  - [retired-token-49]
  - `[retired-token-41]:1-44`
  - [retired-token-41]:1-44
  - `[retired-token-41]:439-446`
  - [retired-token-41]:439-446
  - Wave 1 targeted the structural/survivor subset around `gap-002`, `gap-006`, and `[retired-token-49]` (`Plans/[retired-token-38]`, `Plans/Glossary.md`, `[retired-token-41]`, `[retired-token-46]`, `[retired-token-45]`) and only reconfirmed the already-recorded missing owner headings plus existing `detached_window`, `result_id`, `[retired-token-44]`, and the broken `#11. Source Control boundary` reference.
  - gap-002
  - gap-006
  - Plans/[retired-token-38]
  - `[retired-token-41]:200-209`
  - [retired-token-41]:200-209
  - Wave 2 rechecked the runtime-identity / route-target / glossary / orchestrator cluster and only reconfirmed the already-recorded missing owner anchors, incomplete consumer carry-through, broken `[retired-token-41]#11. Source Control boundary` reference, and live `[retired-token-44]` contradiction without adding any new exact missing item or blocker family.
  - [retired-token-44]
  - summary: Ran a new bounded audit pass after the blocked Ready Check; the first wave produced exact refinements in the runtime-identity, route-target, glossary/help, and orchestrator cross-reference blocker families, and two bounded follow-up sweeps then produced zero new exact missing items.
  - `[retired-token-49]` sharpened: the broken `[retired-token-41]#11. Source Control boundary` reference survives not only in `[retired-token-46]` but also in `[retired-token-48]` and `[retired-token-47]`, while `[retired-token-45]` still preserves the `[retired-token-44]` contradiction.
  - [retired-token-47]
  - `[retired-token-41]:1-150`
  - [retired-token-41]:1-150
  - `[retired-token-54]` sharpened: `[retired-token-48]` still lacks a discoverable `[retired-token-50]` heading even though it contains inline `[retired-token-50] for this feature set...` prose and a `canonical_record.v1:{project_id}:{record_id}` authoritative container, and `[retired-token-41]` still points at the missing `[retired-token-48]#[retired-token-50]` anchor from three different sections.
  - [retired-token-54]
  - [retired-token-50]
  - [retired-token-50] for this feature set...
  - canonical_record.v1:{project_id}:{record_id}
  - [retired-token-48]#[retired-token-50]
  - `gap-006` sharpened: `[retired-token-41]` history and concern sections still point at the missing `Plans/Glossary.md#Orchestrator rewrite terms` anchor, so the glossary/help blocker now includes live broken consumer references in addition to the missing owner headings and incomplete help-entry structure.
  - Plans/Glossary.md#Orchestrator rewrite terms
  - `[retired-token-41]:171-171`
  - [retired-token-41]:171-171
  - `[retired-token-41]:209-209`
  - [retired-token-41]:209-209
  - `[retired-token-41]:230-230`
  - [retired-token-41]:230-230
  - `[retired-token-41]:270-270`
  - [retired-token-41]:270-270
  - `[retired-token-41]:437-437`
  - [retired-token-41]:437-437
  - `[retired-token-54]` sharpened: `[retired-token-51]` still points at the missing `[retired-token-48]#[retired-token-50]` anchor, and both `[retired-token-41]` and `[retired-token-47]` still point at the missing `[retired-token-48]#Restart and stale history` anchor in addition to the already-carried missing `[retired-token-50]` heading.
  - [retired-token-51]
  - [retired-token-48]#Restart and stale history
  - Wave 1 rechecked `gap-006` and `[retired-token-49]` against live glossary and orchestrator docs and only reconfirmed the already-recorded missing glossary/orchestrator owner headings plus the broken `Plans/Glossary.md#Orchestrator rewrite terms` and `[retired-token-41]#11. Source Control boundary` references.
  - `[retired-token-41]:209-230`
  - [retired-token-41]:209-230
  - `cov-034` / `obl-016` remains unresolved because the ledger requires a canonical concern-lifecycle owner section with explicit `active` / `acknowledged` / `resolved` / `dismissed` semantics, `resolution_kind` coverage including `accepted_risk`, and a concern-action confirmation matrix, but the live docs only expose fragments: `[retired-token-41]:12-13` keeps concern and notification surfaces distinct from health/activity, `[retired-token-48]:294` lists `concern_record.v1`, `Plans/GUI_Rebuild_Requirements_Checklist.md:31` calls for first-class concern lifecycle and lineage, and `[retired-token-51]:649` only names `concern` as a routable object. Exact ledger evidence remains at `working_ledger.md:L3070-L3092`, `working_ledger.md:L3170-L3182`, `working_ledger.md:L5990-L6015`, and `working_ledger.md:L6442-L6490`.
  - cov-034
  - obl-016
  - active
  - acknowledged
  - resolved
  - dismissed
  - resolution_kind
  - accepted_risk
  - `[retired-token-41]:12-13`
  - [retired-token-41]:12-13
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
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-003: Owner-first fidelity recovery order
- Coverage rows: cov-003
- Fidelity gap refs: cov-003
- Required fidelity items:
- Exact required item: Apply owner-doc corrections before consumer and mirror cleanup
- Exact required item: Rerun fidelity audit only after owner and consumer corrections are in place
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-003: Owner-first fidelity recovery order` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-003` repair states the exact requirement: Apply owner-doc corrections before consumer and mirror cleanup
- Exact acceptance check: The `cov-003` repair states the exact requirement: Rerun fidelity audit only after owner and consumer corrections are in place
- Exact acceptance check: The `cov-003` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-015: Shared governance/runtime record envelope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0408
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - No shared export-manifest contract is obvious for Orchestrator record families.
  - Define a shared Orchestrator export taxonomy: `record export`, `bundle export`, `view export`.
  - record export
  - bundle export
  - view export
  - `storage-plan.md` still lacks one shared governance-record envelope for concerns/reviews/promotions/corroboration/graph-patch/recovery records
  - storage-plan.md
  - `correlation_id` is part of the canonical envelope in prose but not part of any matrix-verifiable passthrough requirement.
  - correlation_id
  - `Contracts_V0.md` chapter 7 still jumps directly from a thin `UICommand` envelope to `WiringEntry`, which leaves no canonical place for shared route/open payloads.
  - Contracts_V0.md
  - UICommand
  - WiringEntry
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-015
- Fidelity gap refs: cov-015
- Required fidelity items:
- Exact required item: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact required item: Keep record objects distinct from artifacts and rendered summaries
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-015: Shared governance/runtime record envelope` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-015` repair states the exact requirement: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact acceptance check: The `cov-015` repair states the exact requirement: Keep record objects distinct from artifacts and rendered summaries
- Exact acceptance check: The `cov-015` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-021: Concern record family definition
- Coverage rows: cov-021
- Fidelity gap refs: cov-021
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-021: Concern record family definition` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-021` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-021` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-021` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-024: Concern lifecycle and resolution kinds
- Coverage rows: cov-024
- Fidelity gap refs: cov-024
- Required fidelity items:
- Exact required item: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact required item: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-024: Concern lifecycle and resolution kinds` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-024` repair states the exact requirement: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact acceptance check: The `cov-024` repair states the exact requirement: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Exact acceptance check: The `cov-024` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-026: Concern routing and object-first search behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0410
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - What is still missing is a unified Orchestrator search contract that is object-first rather than page-first.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-026
- Fidelity gap refs: cov-026
- Required fidelity items:
- Exact required item: Concern search results must route as object-first results with focused-run and target-tab context
- Exact required item: Concern drill-downs must preserve selected concern id and related object context
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-026: Concern routing and object-first search behavior` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-026` repair states the exact requirement: Concern search results must route as object-first results with focused-run and target-tab context
- Exact acceptance check: The `cov-026` repair states the exact requirement: Concern drill-downs must preserve selected concern id and related object context
- Exact acceptance check: The `cov-026` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-028: Concern action policy and authority model
- Coverage rows: cov-028
- Fidelity gap refs: cov-028
- Required fidelity items:
- Exact required item: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact required item: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-028: Concern action policy and authority model` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-028` repair states the exact requirement: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact acceptance check: The `cov-028` repair states the exact requirement: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Exact acceptance check: The `cov-028` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-031: Concern linkage to adjacent families

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0411
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - now clearly needs switch-event linkage or equivalent durable explanation path
  - likely owners for canonical blocked/approval identity linkage and pressure/switch projection families
  - adjacent owner docs pulled for contradiction checks (`[retired-token-4]`, `[retired-token-7]`, `[retired-token-9]`, `[retired-token-8]`, `[retired-token-1]`, `[retired-token-6]`, `[retired-token-3]`, `[retired-token-2]`, `[retired-token-10]`, `[retired-token-5]`)
  - [retired-token-4]
  - [retired-token-7]
  - [retired-token-9]
  - [retired-token-8]
  - [retired-token-1]
  - [retired-token-6]
  - [retired-token-3]
  - [retired-token-2]
  - `UI_Command_Catalog.md` backfill plus adjacent docs sharpened command/event ownership further:
  - UI_Command_Catalog.md
  - Strong aligned adjacent consumer:
  - Strong adjacent consumer:
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
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-031
- Fidelity gap refs: cov-031
- Required fidelity items:
- Exact required item: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact required item: Allow blocked episodes to reference concerns without replacing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-031: Concern linkage to adjacent families` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-031` repair states the exact requirement: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact acceptance check: The `cov-031` repair states the exact requirement: Allow blocked episodes to reference concerns without replacing concern identity
- Exact acceptance check: The `cov-031` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-035: Promotion classes and gate evidence
- Coverage rows: cov-035
- Fidelity gap refs: cov-035
- Required fidelity items:
- Exact required item: Define lane_to_package, package_to_seam_available, and seam_complete promotions
- Exact required item: Attach exact gate/evidence expectations to each promotion class
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-035: Promotion classes and gate evidence` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-035` repair states the exact requirement: Define lane_to_package, package_to_seam_available, and seam_complete promotions
- Exact acceptance check: The `cov-035` repair states the exact requirement: Attach exact gate/evidence expectations to each promotion class
- Exact acceptance check: The `cov-035` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-037: Focused run and historical routing contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0413
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - all tabs clearly show the focused historical `run_id`
  - run_id
  - If Orchestrator shares one focused run across all tabs, then `Progress` needs an explicit historical behavior.
  - Progress
  - No obvious `orchestrator.project_state.{project_id}` for focused run persistence.
  - orchestrator.project_state.{project_id}
  - Add `orchestrator.project_state.{project_id}` with focused run and per-tab state.
  - evidence/artifact -> `Evidence` with panes focused appropriately
  - Evidence
  - explicit search navigation to a historical run likely should update persisted Orchestrator focused-run state
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-037
- Fidelity gap refs: cov-037
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-037: Focused run and historical routing contract` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-037` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-037` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-037` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-042: Source Control and worktree handshake

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0414
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - likely issue: row ownership is still `run/tier`, not package-lane ownership, so Orchestrator and Source Control cannot share a coherent worktree model.
  - run/tier
  - Source Control as the Git/worktree inventory/manipulation surface
  - Source Control = concrete Git/worktree inspection and mutation surface
  - Source Control rows and tabs must stay information-dense but selective.
  - no lane/package/worktree identity enters the bridged envelope where Source Control / Orchestrator handshake now needs it
  - no single authority is declared between Source Control worktree state and Orchestrator receipt lineage
  - The worktree doc correctly sets the Source Control versus Orchestrator surface boundary, but its identity model still hangs on `tier_id`.
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-042
- Fidelity gap refs: cov-042
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-042: Source Control and worktree handshake` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-042` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-042` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-042` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-046: Projection trust and action gating
- Coverage rows: cov-046
- Fidelity gap refs: cov-046
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-046: Projection trust and action gating` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-046` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-046` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-046` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-049: Progress-only widget hostability
- Coverage rows: cov-049
- Fidelity gap refs: cov-049
- Required fidelity items:
- Exact required item: Restrict widget-composed Orchestrator surface to Progress
- Exact required item: Persist orchestrator:progress layout separately from Dashboard and Usage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-049: Progress-only widget hostability` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-049` repair states the exact requirement: Restrict widget-composed Orchestrator surface to Progress
- Exact acceptance check: The `cov-049` repair states the exact requirement: Persist orchestrator:progress layout separately from Dashboard and Usage
- Exact acceptance check: The `cov-049` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-051: Shared escalation ladder
- Coverage rows: cov-051
- Fidelity gap refs: cov-051
- Required fidelity items:
- Exact required item: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact required item: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-051: Shared escalation ladder` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-051` repair states the exact requirement: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact acceptance check: The `cov-051` repair states the exact requirement: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Exact acceptance check: The `cov-051` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-056: Action-surface policy
- Coverage rows: cov-056
- Fidelity gap refs: cov-056
- Required fidelity items:
- Exact required item: Default bulk actions to navigation and triage rather than live execution mutation
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-056: Action-surface policy` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-056` repair states the exact requirement: Default bulk actions to navigation and triage rather than live execution mutation
- Exact acceptance check: The `cov-056` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-063: Glossary and help governance
- Coverage rows: cov-063
- Fidelity gap refs: cov-063
- Required fidelity items:
- Exact required item: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-063: Glossary and help governance` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-063` repair states the exact requirement: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact acceptance check: The `cov-063` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-063` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-068: Notification routing policy
- Coverage rows: cov-068
- Fidelity gap refs: cov-068
- Required fidelity items:
- Exact required item: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact required item: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-068: Notification routing policy` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-068` repair states the exact requirement: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact acceptance check: The `cov-068` repair states the exact requirement: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Exact acceptance check: The `cov-068` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-078: Project summary projection
- Coverage rows: cov-078
- Fidelity gap refs: cov-078
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact required item: Give canonical blocked episodes precedence over weaker derived warnings
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-078: Project summary projection` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-078` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-078` repair states the exact requirement: Give canonical blocked episodes precedence over weaker derived warnings
- Exact acceptance check: The `cov-078` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-081: Project attention projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0416
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Existing `orchestrator status` (`idle/running/paused`) is too weak on its own to explain why a project needs attention.
  - orchestrator status
  - idle/running/paused
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-081
- Fidelity gap refs: cov-081
- Required fidelity items:
- Exact required item: Define project_attention_item with primary route payload and projection trust disclosure
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-081: Project attention projection` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-081` repair states the exact requirement: Define project_attention_item with primary route payload and projection trust disclosure
- Exact acceptance check: The `cov-081` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-081` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-093: Account switch and pressure history

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0417
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - the system should not silently demote a persistent blocker into history just because time passed
  - filtered CSV is a view export, not canonical history
  - Switch history is still reason fields without a durable event/projection family.
  - it still needs both pressure cause and switch outcome fields; otherwise history will stay ambiguous
  - `cmd.panel.switch`
  - cmd.panel.switch
  - Without that discipline, consumer docs may either freeze old payloads forever or overclaim an immediate canonical switch that downstream docs cannot actually absorb.
  - `thread_id = <thread_id>` when thread-scoped history is required
  - thread_id = <thread_id>
  - `tab_id = node_graph` or `tab_id = history`
  - tab_id = node_graph
  - tab_id = history
  - `tab_id = history`
  - `inspector_target = details | history | reviews`
  - inspector_target = details | history | reviews
  - `UI_Command_Catalog.md` and `FinalGUISpec.md` are the pressure points that will either spread the canonical route/object vocabulary cleanly or re-fragment it.
  - UI_Command_Catalog.md
  - FinalGUISpec.md
  - `cmd.panel.switch` with contextual object refs
  - `Evidence`, `History`, and `Ledger` treated as native tabs
  - Evidence
  - History
  - Ledger
  - Material blocker counts, pressure docs, and next stage remain unchanged.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-093
- Fidelity gap refs: cov-093
- Required fidelity items:
- Exact required item: Add append-only account_pressure_episode and account_switch_event families
- Exact required item: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-093: Account switch and pressure history` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-093` repair states the exact requirement: Add append-only account_pressure_episode and account_switch_event families
- Exact acceptance check: The `cov-093` repair states the exact requirement: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Exact acceptance check: The `cov-093` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-165: Coverage blocker concern lifecycle owner section
- Coverage rows: cov-165
- Fidelity gap refs: cov-165
- Required fidelity items:
- Exact required item: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact required item: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-165: Coverage blocker concern lifecycle owner section` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-165` repair states the exact requirement: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact acceptance check: The `cov-165` repair states the exact requirement: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Exact acceptance check: The `cov-165` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-174: Concern owner vs creator vs resolver separation
- Coverage rows: cov-174
- Fidelity gap refs: cov-174
- Required fidelity items:
- Exact required item: Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority
- Exact required item: Allow ownership changes without changing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-174: Concern owner vs creator vs resolver separation` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-174` repair states the exact requirement: Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority
- Exact acceptance check: The `cov-174` repair states the exact requirement: Allow ownership changes without changing concern identity
- Exact acceptance check: The `cov-174` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-177: Concern source-event vs record vs projection split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0419
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Allow short-term concern rendering to piggyback on `finding_refs[]`, but define a minimal non-remediation `node_concerns[]` projection next.
  - finding_refs[]
  - node_concerns[]
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-177
- Fidelity gap refs: cov-177
- Required fidelity items:
- Exact required item: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-177: Concern source-event vs record vs projection split` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-177` repair states the exact requirement: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Exact acceptance check: The `cov-177` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-178: Dismissed vs resolved rationale enforcement
- Coverage rows: cov-178
- Fidelity gap refs: cov-178
- Required fidelity items:
- Exact required item: Require distinct dismissal rationale and resolution rationale rules
- Exact required item: Treat accepted_risk as a resolution path rather than dismissal
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-178: Dismissed vs resolved rationale enforcement` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-178` repair states the exact requirement: Require distinct dismissal rationale and resolution rationale rules
- Exact acceptance check: The `cov-178` repair states the exact requirement: Treat accepted_risk as a resolution path rather than dismissal
- Exact acceptance check: The `cov-178` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-192: Concern update heuristics
- Coverage rows: cov-192
- Fidelity gap refs: cov-192
- Required fidelity items:
- Exact required item: Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-192: Concern update heuristics` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-192` repair states the exact requirement: Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one
- Exact acceptance check: The `cov-192` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-195: Help entry template and related-concept clusters
- Coverage rows: cov-195
- Fidelity gap refs: cov-195
- Required fidelity items:
- Exact required item: Define a dedicated help-entry template and related-concept linking clusters
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-195: Help entry template and related-concept clusters` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-195` repair states the exact requirement: Define a dedicated help-entry template and related-concept linking clusters
- Exact acceptance check: The `cov-195` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-196: Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Coverage rows: cov-196
- Fidelity gap refs: cov-196
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-196: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-196` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-196` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Fidelity recovery cov-204: Artifact envelope routing preference
- Coverage rows: cov-204
- Fidelity gap refs: cov-204
- Required fidelity items:
- Exact required item: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact required item: Require runtime artifacts summarizing external operations to carry receipt linkage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-204: Artifact envelope routing preference` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-204` repair states the exact requirement: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact acceptance check: The `cov-204` repair states the exact requirement: Require runtime artifacts summarizing external operations to carry receipt linkage
- Exact acceptance check: The `cov-204` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Recommended minimum concern record shape
- Coverage rows: cov-208
- Fidelity gap refs: cov-208
- Required fidelity items:
- Exact required item: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact required item: Keep `blocking_effect` explicitly separate from `severity`
- Acceptance checks represented:
- Exact acceptance check: The heading `### Recommended minimum concern record shape` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-208` repair states the exact requirement: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact acceptance check: The `cov-208` repair states the exact requirement: Keep `blocking_effect` explicitly separate from `severity`
- Exact acceptance check: The `cov-208` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

### Concern ownership / authority direction

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0407
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Stable data-contract direction
  - projection-freshness vocabulary and ownership distinct from Preview `trust_tier`
  - trust_tier
  - `WorktreeGitImprovement.md` has moved the UI boundary in the right direction, but its concrete execution/storage assumptions are still tier-keyed:
  - WorktreeGitImprovement.md
  - Narrow `FileManager.md` to consumer/realization ownership:
  - FileManager.md
  - The doc already proves that subject-first identity is viable through `preview_subject_id`; route/open ownership should align to that instead of inventing a second identity model.
  - preview_subject_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-211
- Fidelity gap refs: cov-211
- Required fidelity items:
- Exact required item: Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`
- Exact required item: Treat `concern resolver` as distinct from owner/source roles
- Exact required item: Allow concern ownership reassignment without changing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Concern ownership / authority direction` exists in `Plans/Orchestrator_Page.md`.
- Exact acceptance check: The `cov-211` repair states the exact requirement: Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`
- Exact acceptance check: The `cov-211` repair states the exact requirement: Treat `concern resolver` as distinct from owner/source roles
- Exact acceptance check: The `cov-211` repair states the exact requirement: Allow concern ownership reassignment without changing concern identity
- Exact acceptance check: The `cov-211` repair is in the owner section for `Plans/Orchestrator_Page.md` and is not only a downstream consumer note.

## 1. Scope and canonical model

Orchestrator is the core scheduling, concern tracking, blocked-state handling, and runtime-identity management system. It is not the UI, CLI, or external provider.

### Search, routing, and action policy

#### Concern routing and object-first search behavior
- Concern search results route as object-first results with focused-run and target-tab context.
- Concern drill-down preserves the selected `concern_id` and related object context.

#### Concern action policy and authority model
- Concern actions define actor authority, confirmation, rationale, reversibility, and audit fields.
- `acknowledged`, `dismissed`, `resolved`, and structural lineage edits remain distinct actions.

#### Projection trust and action gating
- Orchestrator surfaces use the projection states `current`, `refreshing`, `stale`, `degraded`, and `unavailable`.
- Sensitive actions require `current` data or direct canonical revalidation; degraded mode falls back to record-backed views.

#### Progress-only widget hostability
- Widget-composed Orchestrator content is restricted to `Progress`.
- `orchestrator:progress` persists separately from Dashboard and Usage layouts.

#### Action-surface policy
- Every affordance is classified by navigation vs mutation, palette visibility, shortcut eligibility, multi-target safety, and confirmation/reversibility.
- Bulk actions default to navigation and triage rather than live execution mutation.

#### Progress widget catalog and drill mappings
- Orchestrator consumes the same 13-widget Progress catalog from FinalGUISpec Appendix C:
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
- Progress labels/taxonomy transfer with the catalog: state labels `queued|running|attention_required|blocked|recovering|degraded|complete`; action labels `Inspect|Focus run|Open evidence|Request approval|Acknowledge|Dismiss|Resolve|Retry recovery`; alert taxonomy `advisory|attention_required|blocked|escalated|degraded_projection`; event taxonomy `run_started|node_started|node_completed|concern_opened|approval_requested|approval_decided|recovery_started|recovery_completed|artifact_published|account_switched`; condition-aging keeps advisory warnings quietable, resurfaces `attention_required`, and never auto-quiets `blocked` or `escalated`.

#### Artifact envelope routing preference
- Cost-bearing artifact routing prefers `usage_event_ref` instead of timestamp heuristics when linking to Usage and Ledger.
- Runtime artifacts that summarize external operations must carry receipt linkage.

### Current vs historical run behavior

#### Focused run and historical routing contract
- Orchestrator uses `active_run_id` / `focused_run_id` together with `focus_mode = live | historical`.
- Cross-tab deep links and search pivots stay coherent on the focused run rather than jumping back to the active run implicitly.

#### Account switch and pressure history
- Orchestrator stores append-only `account_pressure_episode` and `account_switch_event` families.
- Usage, History, Ledger, and Orchestrator all consume the same durable event family.

### Concern and notification model

#### Concern linkage to adjacent families
- Concerns expose `review_refs`, `corroboration_refs`, `graph_patch_refs`, `recovery_refs`, `blocked_episode_refs`, and `promotion_refs`.
- Blocked episodes may reference concerns without replacing concern identity.

#### Notification routing policy
- Notifications route by severity, execution impact, blocked owner, persistence, and projection trust.
- Quiet windows are allowed for advisory warnings, but never for canonical blocked episodes.

#### Dismissed vs resolved rationale enforcement
- Dismissal requires dismissal rationale and resolution requires resolution rationale.
- `accepted_risk` is a resolution path rather than a dismissal.

#### Concern update heuristics
- Repeated sightings use source/scope/category/lineage-aware heuristics to decide whether to update an existing concern or mint a new concern record.

### Project summary, attention, and escalation

#### Shared escalation ladder
- One escalation ladder is shared across Orchestrator, Dashboard, thread badges, and notifications.
- `attention_required` remains distinct from `blocked`, and persistent blockers resurface on meaningful change or persistence.

#### Orchestrator-wide scale contract
- Slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors are mandatory across dense tabs.
- Scale is a cross-tab contract rather than a graph-tab-only concern.

#### Project summary projection
- `project_summary` contains `activity_state`, `attention_state`, `health_state`, `owner`, and projection-trust disclosure.
- Canonical blocked episodes override weaker derived warnings in summary rollups.

#### Project attention projection
- `project_attention_item` carries a primary route payload and projection-trust disclosure.
- The same attention row is consumable across Orchestrator, Dashboard, and notifications.

#### Help architecture and project status taxonomy
- Help uses a dedicated help-entry architecture with related-concept linking.
- Project taxonomy defines `activity_state`, `attention_state`, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules.

#### Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Blocked-owner kinds are exactly `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- Escalation levels are `info`, `watch`, `attention_required`, `blocked`, and `escalated`, with surface mapping across Orchestrator banners, Dashboard summaries, thread badges, and notifications.

### Source Control boundary

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0422
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `assistant-chat-design.md` strengthens the same surface boundary at a higher level:
  - assistant-chat-design.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Promotion classes and gate evidence
- Promotion classes are `lane_to_package`, `package_to_seam_available`, and `seam_complete`.
- Each promotion class carries exact gate and evidence expectations: promotion gate verdict, lineage refs, required verification evidence, and promotion receipt refs.

#### Source Control and worktree handshake
- Orchestrator remains the lane-pool operational truth, while Source Control is the concrete repo/worktree operator.
- Worktree rows display owning package, lane, and run refs together with lifecycle state and blocked/recovery state.

### glossary/help references

#### Glossary and help governance
- Orchestrator depends on Glossary coverage for rewrite-critical objects, states, and trust terms.
- Help is layered as inline help, context help, and canonical help-entry pages while canonical term names stay stable.

#### Help entry template and related-concept clusters
- Every help entry follows one template: canonical term, trigger conditions, operator meaning, primary routes, related concepts, and recovery guidance.
- Related-concept clusters provide the dedicated linking structure for concept-to-concept navigation.

### Owner-first fidelity recovery order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.

### Shared governance/runtime record envelope
- One shared record envelope carries canonical lineage refs plus artifact and evidence refs.
- Record objects stay distinct from artifacts, receipts, and rendered summaries.

### Concern record family definition
- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- The owner contract defines `concern_id`, `project_id`, run refs, scope refs, evidence/source refs, lineage refs, severity, category, status, and governance metadata.

### Concern lifecycle and resolution kinds
- Lifecycle states are exactly `active`, `acknowledged`, `resolved`, and `dismissed`.
- `resolution_kind` values are exactly `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`.

### Concern lifecycle owner section
- This owner section defines explicit semantics for `active`, `acknowledged`, `resolved`, and `dismissed`.
- It carries `resolution_kind`, including `accepted_risk`, together with a concern-action confirmation matrix for acknowledge, dismiss, resolve, and lineage-edit operations.

### Concern owner vs creator vs resolver separation
- `owner_kind` / `owner_ref` are separate from `created_by_kind` / `created_by_ref`.
- Resolver authority is modeled separately from both owner and creator.
- Ownership may change without changing concern identity.

### Concern source-event vs record vs projection split
- `concern_source_event_ref`, `concern_record`, and `concern_projection` are separate structural layers.
- Source events describe raw sightings, records describe durable state, and projections describe rendered consumer views.

### Recommended minimum concern record shape
- Required fields: `concern_id`, `project_id`, `run_ref`, `scope_ref`, `source_event_ref`, `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`, `severity`, `category`, `status`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect?`.
- `blocking_effect` stays explicitly separate from `severity`.

### Concern ownership / authority direction
- Concern owner surfaces are exactly `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- `concern resolver` is distinct from owner and source roles.
- Concern ownership can be reassigned without changing concern identity.
