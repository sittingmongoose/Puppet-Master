
## Cleanup Priorities

- **Priority 1 — Lock the runtime schema anchors**
  - Relax or replace stale graph-schema constants (`selection_rule`, tier-rooted breadcrumbs).
  - Add package/seam/lane/worktree/account identity fields to the canonical runtime/event/envelope contracts.
  - Define contamination and safe-point linkage explicitly in storage and blocked-payload contracts.

- **Priority 2 — Establish terminology and ownership**
  - Extend `Glossary.md`, `Crosswalk.md`, `Decision_Policy.md`, and `00-plans-index.md` with first-class ownership for feature seam, work package, package/seam overseers, promotion class, lane pool, contamination, and effective execution identity.
  - Clarify which docs own execution truth vs projections vs UI-only overlays.

- **Priority 3 — Rebuild UI contracts around packages/seams/lanes**
  - Replace or demote tiers-first widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than prose-only references.

- **Priority 4 — Consolidate addenda and normalize payloads**
  - Merge duplicated runtime, model, blocked-state, and worktree addenda into single authoritative sections.
  - Remove legacy `reason_code` / `recovery_options[]` drift and older singular worktree assumptions.

## Contradictions To Resolve

1. **Scored scheduler vs lexicographic schema lock.** Runtime docs define a scored ready-set; graph schemas still hard-code lexicographic node selection.
2. **Automation-first default vs HTE/visible/manual-default behavior.** `Run_Modes.md`, `newtools.md`, and several approval flows still assume interactive or visible execution as the normal baseline.
3. **Single Overseer vs package + seam overseers.** Runtime and UI docs still model one Overseer while the emerging design requires dual governance layers.
4. **Tier authority vs node/package/seam authority.** Tiers remain first-class in widgets, breadcrumbs, HITL boundaries, and state displays even where the graph is already treated as the canonical execution input.
5. **One project / one worktree / one current context vs multi-project, multi-worktree orchestration.** Several storage keys, UI assumptions, and auth flows still treat runtime context as singular.
6. **Legacy blocked payload fields vs normalized blocked-state contract.** Old and new field names coexist across Docker, runtime recovery, and policy docs.

## Suggested Research Follow-Ups

1. **Define the dual-overseer runtime model canonically.** Lock package overseer vs seam overseer authority, spawning rules, corroboration/review responsibilities, and identity/model assignment.
2. **Design the package/seam/lane schema family.** Decide which objects are persisted canonically (`package`, `seam`, `lane`, `promotion`, `review`, `resolution_thread`) and which are projections only.
3. **Unify requested vs effective execution identity.** Extend the existing requested/effective Persona/model pattern to include account, lane/worktree, and overseer class.
4. **Specify package-based worktree lane pools.** Define lane ownership, pool sizing, contamination detection, safe-point restore behavior, and Source Control visibility for PM-owned worktrees.
5. **Normalize safe-point / restore-point / rollback / contamination terminology.** Create one authoritative mapping and event taxonomy across runtime, storage, policy, and UI docs.
6. **Rebuild attention routing.** Specify the canonical event-to-surface path for blocked states, optional HITL boundaries, and side-effect approvals across Dashboard, Orchestrator, and chat-thread.
7. **Migrate the widget/tab model.** Determine what replaces `widget.tier_tree`, phase-grouped run-graph layouts, and singular current-task/current-worktree widgets.
8. **Reconcile automation-first with existing settings and gates.** Classify which gates remain mandatory HITL, which are optional boundaries, and which defaults need to flip at the settings/schema layer.

## GPT-5.2 Sweep Findings

Model-wave synthesis from GPT-5.2 fleet sweep across `Plans/**`. This pass reinforced the same high-risk Orchestrator seams as prior waves, but it was especially strong at surfacing contract drift, schema inconsistencies, and places where the rewrite already partially assumes node-graph execution without fully retiring tier-centric ownership.

## Highest-Impact Docs

- **`Plans/Contracts_V0.md` + `Plans/Executor_Protocol.md` + `Plans/Orchestrator_Page.md`**
  - **Why impacted:** These are the closest thing to the runtime SSOT for attempts, scheduler passes, blocked outcomes, safe points, UI recovery actions, and requested/effective runtime state.
  - **Old assumption:** Tier-rooted identifiers, one Overseer, HTE-by-default run modes, and partially split blocked/HITL contracts.
  - **New model pressure:** Need first-class package/seam/lane/work-package identity, effective account switching, optional HITL boundaries, and package/seam overseer roles with explicit lineage.

- **`Plans/plan_graph.schema.json` + `Plans/project_plan_node.schema.json` + `Plans/project_plan_graph_index.schema.json`**
  - **Why impacted:** These are the executable graph contracts.
  - **Old assumption:** Lexicographic node selection, weak dependency duality (`depends_on` vs `blockers/unblocks`), no package/seam/worktree/account identity.
  - **New model pressure:** Need node/package/seam/lane/promotion/safe-point fields, multi-project scoping, and alignment with scored ready-set scheduling.

- **`Plans/Run_Graph_View.md` + `Plans/FinalGUISpec.md` + `Plans/assistant-chat-design.md`**
  - **Why impacted:** These own the main operational surfaces.
  - **Old assumption:** Tiers, phase-grouped layouts, one current task/worktree/thread context, UI actions keyed to node/tier terms only.
  - **New model pressure:** Must visualize work packages, seams, blocked episodes, safe-point restore, requested/effective identity, and cross-surface attention routing.

- **`Plans/newtools.md` + `Plans/FileSafe.md` + `Plans/WorktreeGitImprovement.md` + `Plans/MiscPlan.md`**
  - **Why impacted:** These are where live execution, evidence, cleanup, FileSafe, worktrees, and side-effect repos meet runtime policy.
  - **Old assumption:** Per-subtask worktrees, project-root artifact paths, visible-mode-first local execution, ad-hoc side-effect steps, and weak contamination language.
  - **New model pressure:** Need package-based lane pools, worktree-aware evidence roots, safe-point-aware live sessions, normalized blocked payloads, and PM-owned worktree visibility in Orchestrator/SCM.

- **`Plans/storage-plan.md` + `Plans/usage-feature.md` + `Plans/Crosswalk.md` + `Plans/Glossary.md`**
  - **Why impacted:** These anchor storage, telemetry, ownership, and terminology.
  - **Old assumption:** Run/tier/session/thread are sufficient scopes, and requested/effective mostly means persona/model/platform.
  - **New model pressure:** Need explicit package/seam/lane/attempt/work-package objects, effective execution identity including account, and canonical ownership for contamination/safe-point/promotion concepts.

## GUI / UX Impacts

- **Attention flow exists, but is fragmented.** GPT-5.2 found strong pieces of Dashboard CtAs, thread badges, blocked node CTAs, and live-run cards, but no single canonical routing contract across Dashboard → Orchestrator → chat-thread.
- **Tiers-first UI is still deeply embedded.** Tiers tab assumptions, phase-grouped run-graph presets, and single-current-task widgets still act like execution authority lives in tier hierarchy rather than the node/package/seam graph.
- **Requested vs effective display is inconsistent.** Persona/model/platform mismatches are sometimes surfaced, but effective account, worktree lane, package/seam scope, and overseer role are usually missing from UI contracts.
- **Mandatory vs optional HITL is not normalized.** Docker repo creation, FileSafe approvals, Multi-Pass review, wizard attention-required, and graph-level HITL all exist, but they are not consistently classified into one boundary model.
- **Source Control / Orchestrator integration is only partially specified.** GPT-5.2 repeatedly found expectations that Orchestrator CTAs preserve worktree lineage while many UI/state docs still assume one active worktree or a single thread-scoped execution context.

## Runtime / Storage / Contract Impacts

- **Schema-level contradictions are active, not hypothetical.**
  - Graph schemas still hard-code lexicographic node ordering while runtime addenda describe scored scheduler tuples.
  - Base provider envelope/spec tables omit node/attempt/safe-point fields that later addenda require.
  - Acceptance/evidence/coverage schemas cannot yet express work-package/seam/promotion/account/lane identity cleanly.
- **Blocked-state normalization is incomplete.** GPT-5.2 repeatedly surfaced legacy `reason_code` / `recovery_options[]` drift against canonical `blocked_reason_code` / `allowed_action_ids[]` rules.
- **Safe-point policy is present but not fully modeled.** Safe-point, restore-point, rollback, and contamination are all referenced, but not unified into one canonical field/event/object family.
- **Runtime identity snapshots stop too early.** Requested/effective persona/platform/model fields exist; requested/effective account and execution identity do not.
- **Package/seam/work-package remain schema ghosts.** The runtime increasingly assumes them conceptually, but core schemas, receipts, and event families still lack the objects and IDs.

## Settings / Provider / Persona / Account Impacts

- **Automation-first conflicts with existing defaults.** `regular`/HTE defaults, `visual_mode = auto` preferring visible runs, and several mandatory approval flows all work against the desired automation-first baseline.
- **Multi-account fallback is still not a first-class contract.** GPT-5.2 found implicit multi-account surfaces and widgets, but no canonical `requested_account` / `effective_account` runtime shape.
- **Provider/persona contracts are closer to the target than account identity.** The existing requested/effective Persona/model rules are a good base, but they need extension rather than a parallel account-only system.
- **Per-project vs global settings remain mixed.** Several runtime-affecting settings are still assumed global or single-project where the emerging model needs project/package/seam/node layers.
- **Docker auth is the clearest requested/effective example.** It should likely be generalized into the shared execution identity pattern instead of remaining a domain-specific one-off.

## Worktree / SCM / Parallelism Impacts

- **Package-based lane pools are the missing parallelism contract.** Many docs already discuss worktree isolation, per-run branches, or per-subtask worktrees, but GPT-5.2 found no stable lane-pool model that unifies them.
- **One-active-worktree assumptions remain widespread.** File trees, active repo indicators, evidence roots, and restore/revert UX still assume a scalar worktree.
- **PM-owned SCM state is not fully visible.** Managed template repos, active git operations, live-run artifact roots, and worktree recovery state need stronger Orchestrator/Source Control registration.
- **Cleanup and restore semantics are not lane-aware yet.** Broad cleanup, conflict worktrees, and revert-last-edit flows still underspecify contamination scope and safe-point prerequisites.
- **Parallel caps are the wrong shape.** Thread caps, provider caps, and simple queue models exist, but package/lane-aware capacity and conflict models do not.

## Cleanup Priorities

- **Priority 1 — Fix canonical contracts and schemas**
  - Reconcile graph ordering rules, dependency representations, and blocked payload field names.
  - Add package/seam/lane/worktree/account identity fields to runtime/event/envelope/schema families.
  - Define one execution identity snapshot that covers account as well as persona/model/platform.

- **Priority 2 — Normalize policy and terminology**
  - Extend `Glossary.md`, `Crosswalk.md`, and `Decision_Policy.md` with feature seam, work package, lane pool, contamination, safe point, promotion class, and effective execution identity.
  - Normalize safe-point vs restore-point vs rollback vs contamination across runtime/storage/UI docs.

- **Priority 3 — Reframe UI around graph-native execution**
  - Replace tiers-first views and single-worktree assumptions with package/seam/lane-aware surfaces.
  - Define one attention-routing model for blocked work, optional HITL, and side-effect approvals.

- **Priority 4 — Consolidate addenda**
  - GPT-5.2 repeatedly found split-brain specs where addenda carry the correct modern model but anchor tables/body text still describe older rules.

## Contradictions To Resolve

1. **Lexicographic graph selection vs scored scheduler tuple.** Runtime addenda and graph schemas disagree on the actual canonical selection rule.
2. **Automation-first vs interactive defaults.** HTE-by-default, visible-first local runs, and mandatory review flows contradict the stated automation-first direction.
3. **Single Overseer vs package + seam overseers.** Existing runtime docs still largely model one Overseer while the emerging design needs dual governance layers.
4. **Tier identifiers vs node/package/seam identity.** Many UI, storage, and envelope contracts still key execution to tier concepts where package/node/seam IDs are now needed.
5. **Single worktree / single project context vs multi-project lane-based orchestration.** Too many surfaces and schemas still assume one active repo/worktree/thread context at a time.
6. **Requested/effective state vs requested/effective execution identity.** The model exists for persona/model/platform but not yet for account or runtime actor identity.

## Suggested Research Follow-Ups

1. **Lock the package/seam/lane object model.** Define canonical IDs, lifecycles, and schema placement for work packages, seams, lanes, promotions, reviews, and resolution threads.
2. **Extend the execution identity contract.** Add requested/effective account, overseer role, worktree/lane, and fallback reason fields to the canonical runtime snapshot.
3. **Specify package-based worktree lane pools.** Include lane allocation, SCM visibility, contamination detection, safe-point restore behavior, and cleanup boundaries.
4. **Unify attention routing.** Define how Dashboard, Orchestrator, chat-thread, and inline cards consume the same blocked/HITL/runtime event families.
5. **Reconcile automation-first with local execution UX.** Decide how `regular`, `visual_mode`, manual confirmations, and optional HITL boundaries map into one coherent mode policy.
6. **Upgrade graph/evidence schemas.** Add work-package/seam/promotion/account/lane identity to the schema bundle and align acceptance/coverage/evidence linkage.
7. **Consolidate addenda into anchor sections.** Prioritize runtime core, graph schemas, Run Graph view, newtools/FileSafe/worktree docs, and policy/terminology docs.

## GPT-5.4 Sweep Findings

Model-wave synthesis from GPT-5.4 fleet sweep across `Plans/**`. This pass surfaced the strongest contradiction map so far: not just stale terminology, but multiple places where old tier-era contracts and newer node/safe-point/runtime addenda are simultaneously marked canonical.

## Highest-Impact Docs

- **`Plans/Orchestrator_Page.md` + `Plans/Executor_Protocol.md` + `Plans/Contracts_V0.md`**
  - **Why impacted:** These remain the practical runtime/UI SSOT for execution, blocked states, recovery actions, identity visibility, terminals, and event families.
  - **What old assumption is present:** Tiers are still first-class UI and contract nouns; HITL still has tier-boundary ancestry; `AttemptJournal`/handoff payloads remain subtask/iteration-shaped; one Overseer still owns orchestration.
  - **What likely new model pressure is:** Need explicit node/package/seam/lane/promotion identity, package overseer + seam overseer authority, requested/effective execution identity including account, and package/lane-aware blocked/recovery semantics.

- **`Plans/storage-plan.md` + `Plans/usage-feature.md` + `Plans/plan_graph.schema.json` + `Plans/project_plan_node.schema.json`**
  - **Why impacted:** These define the canonical event/storage/schema backbone and are still consumed by many downstream docs.
  - **What old assumption is present:** Tier/phase/iteration events, `tier_runtime_record`, `tier_id`-based usage rollups, lexicographic graph dispatch, narrow node status enums, runtime state embedded in plan shards.
  - **What likely new model pressure is:** Need attempt-scoped runtime state, package/seam/lane/promotion fields, blocked lineage, safe-point/restore linkage, and separation between plan structure and mutable runtime projections.

- **`Plans/FinalGUISpec.md` + `Plans/Run_Graph_View.md` + `Plans/Widget_System.md` + `Plans/UI_Command_Catalog.md`**
  - **Why impacted:** These still shape the user’s primary operational mental model.
  - **What old assumption is present:** Tiers tab, phase/task/subtask trees, graph-local retry/approve/deny actions, completed-work prose by phase/task, single-current-task widgets, restore/checkpoint wording.
  - **What likely new model pressure is:** Need package/seam/lane/promotion/resolution-thread surfaces, runtime action families keyed by blocked classification, requested/effective identity including account, and separation of safe points from restore points.

- **`Plans/WorktreeGitImprovement.md` + `Plans/GitHub_Integration.md` + `Plans/Multi-Account.md`**
  - **Why impacted:** These own the hardest intersection: worktrees, SCM state, remote actions, and account resolution.
  - **What old assumption is present:** Worktree ownership is `run/tier/subtask`, branch-per-run or subtask-per-worktree flows, GitHub/project flows are wizard-centric, account switching is still mostly run/iteration-scoped.
  - **What likely new model pressure is:** Need package-based lane pools, worktree visibility shared between Source Control and Orchestrator, effective-account recording per hosted side effect, and package/seam-aware promotion boundaries.

- **`Plans/human-in-the-loop.md` + `Plans/Permissions_System.md` + `Plans/Project_Output_Artifacts.md`**
  - **Why impacted:** These define approvals, blocked states, recovery, and artifact pathing.
  - **What old assumption is present:** Tier-boundary HITL toggles, `tier_boundary_approval`, workspace sidecars under `<phase>/<task>/<subtask>`, permission `ask` behavior tied to current tier boundary.
  - **What likely new model pressure is:** Need node/package/seam/lane-bound optional HITL, canonical blocked episode actions, package/lane artifact pathing, and package/seam-aware recovery/promotion semantics.

## GUI / UX Impacts

- **Tiers are still productized even where node graph is supposed to be canonical.** GPT-5.4 repeatedly found `Tiers` as a primary tab, navigation target, widget namespace, and telemetry dimension.

- **Attention flow is fragmented across surfaces and vocabularies.** Some docs use Dashboard CtAs and blocked cards, others still use modal/toast approvals, graph-local dialogs, or inline chat actions. Resolution-thread ownership is largely missing.

- **Requested vs effective runtime display remains incomplete.** Persona/platform/model are sometimes surfaced, but effective account, fallback reason, lane/worktree identity, package/seam ownership, and overseer role are generally absent.

- **Restore language is still dangerously overloaded.** Several docs still use rollback/checkpoint/revert wording where newer addenda require safe-point-aware retry and explicit “start fresh attempt” semantics.

- **Automation-first is still undermined by approval-heavy UX defaults.** GPT-5.4 repeatedly found phase-complete approvals, manual review steps, modal confirmations, and direct-click approvals that are not yet framed as optional HITL boundaries.

## Runtime / Storage / Contract Impacts

- **Old and new scheduler contracts actively disagree.**
  - Graph schemas still fix lexicographic selection.
  - `Executor_Protocol` addenda require scored ready-set scheduling with wake reasons, lane/capacity awareness, and blocked constraints.

- **Blocked payload and recovery families are inconsistent.**
  - `allowed_actions` vs `allowed_action_ids[]`
  - `blocked_reason` vs `blocked_reason_code`
  - graph-local `Retry/Replan/Reopen/Approve/Deny` vs canonical `cmd.runtime.*` action families

- **Runtime state is stored in the wrong places.**
  - Plan-node shards and project-local JSON sidecars still act like mutable runtime sources in several docs.
