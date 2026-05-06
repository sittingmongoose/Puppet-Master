  - GPT-5.4 repeatedly found newer guidance saying runtime truth belongs in seglog/redb/projections instead.

- **Primary schemas stop at node-level modeling.**
  - Acceptance, evidence, coverage, GUI automation, and test schemas can represent nodes and checks, but not work package, feature seam, lane, promotion class, contamination state, resolution thread, or effective account identity.

- **Storage/event keys are still too thin.**
  - Many contracts have `run_id`, maybe `node_id`, but still lack `project_id`, `attempt_id`, `package_id`, `seam_id`, `lane_id`, `worktree_id`, `safe_point_id`, `promotion_class`, or requested/effective account fields.

## Settings / Provider / Persona / Account Impacts

- **Multi-account is surfaced in UX before it is modeled canonically in runtime records.** GPT-5.4 found account widgets and auth panels, but almost no equivalent requested/effective account fields in runtime/storage/schema contracts.

- **Provider/persona docs still encode old orchestration ownership.** Prompt, persona, model, and provider docs still talk in phase/task/subtask/iteration terms and singular Overseer assumptions, even where runtime records already include `node_id` and `attempt_id`.

- **Fallback behavior is contradictory in core docs.**
  - Persona fallback is split between “bare-context run” and canonical fallback Persona.
  - GitHub auth retry rules conflict with multi-account failover expectations.
  - Docker/media/provider flows usually stop at provider/model, not account-resolution lineage.

- **Settings scopes are still too coarse.** Global/project toggles are common, but package/seam/lane/run/account-aware settings or policy scopes are mostly absent.

## Worktree / SCM / Parallelism Impacts

- **Package-based lane pools are still missing as a canonical concept.** GPT-5.4 found subtask/tier worktrees, branch-per-run flows, and direct merge/PR assumptions across SCM docs, but no stable lane-pool model.

- **Worktree visibility is only partially wired between Source Control and Orchestrator.** Several docs acknowledge shared visibility, yet status models still stop at repo/worktree/branch/tier rather than package/lane ownership, contamination, restore eligibility, or promotion posture.

- **Parallelism is modeled in outdated shapes.**
  - per-thread queues
  - per-provider caps
  - parallel subtasks
  - crews per tier
  None of these cleanly map to package/seam promotion or lane-pool capacity.

- **Contamination policy is still a vocabulary gap.** Safe-point language exists in newer addenda, but contamination classification, restore-before-reuse, and lane quarantine semantics are mostly absent from the main SCM/worktree contracts.

## Cleanup Priorities

- **Priority 1 — Canonical contracts that cannot safely coexist with the new model**
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/plan_graph.schema.json` / `Plans/project_plan_node.schema.json`

- **Priority 2 — Misleading UI/SCM/operator docs**
  - `Plans/FinalGUISpec.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/GitHub_Integration.md`
  - `Plans/Widget_System.md`
  - `Plans/UI_Command_Catalog.md`

- **Priority 3 — Terminology, routing, and anti-drift docs**
  - `Plans/00-plans-index.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/feature-list.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/Project_Output_Artifacts.md`

## Contradictions To Resolve

1. **Lexicographic node selection vs scored ready-set scheduler**
   - Docs involved: `plan_graph.schema.json`, `project_plan_graph_index.schema.json`, `Executor_Protocol.md`
   - Why it matters: this is a direct runtime-selection conflict, not terminology drift.

2. **Tier-boundary HITL vs blocked-node/runtime-overlay HITL**
   - Docs involved: `human-in-the-loop.md`, `Permissions_System.md`, `Project_Output_Artifacts.md`
   - Why it matters: approval ownership, wake semantics, and UI routing differ materially between these models.

3. **Single Overseer vs package overseer + seam overseer**
   - Docs involved: `Executor_Protocol.md`, `Orchestrator_Page.md`, `Personas.md`, `Provider_Stream_Mapping_External_Reference_A2A.md`
   - Why it matters: ownership of scheduling, review, recovery, and promotion becomes ambiguous if both persist.

4. **`requested_persona_id` vs canonical `requested_persona`**
   - Docs involved: `Orchestrator_Page.md`, `Contracts_V0.md`, related UI/runtime docs
   - Why it matters: persisted/runtime field drift is already visible and will worsen when account identity is added too.

5. **Graph-local recovery commands vs canonical runtime action families**
   - Docs involved: `UI_Command_Catalog.md`, `Wiring_Matrix.md`, `Run_Graph_View.md`, `human-in-the-loop.md`
   - Why it matters: the user can otherwise see one command family while runtime/event contracts expect another.

6. **Run/tier/subtask worktrees vs package-based lane pools**
   - Docs involved: `WorktreeGitImprovement.md`, `GitHub_Integration.md`, `feature-list.md`, `FinalGUISpec.md`
   - Why it matters: worktree lifecycle, visibility, and conflict recovery cannot be coherent if both models remain canonical.

7. **Manual review/click approval flows vs automation-first optional HITL**
   - Docs involved: `FinalGUISpec.md`, `newtools.md`, `Containers_Registry_and_Unraid.md`, `assistant-chat-design.md`
   - Why it matters: this changes default behavior, user expectations, and blocked-state routing.

## Suggested Research Follow-Ups

1. **Define the package/seam/lane/promotion object family canonically.**
   - Why it matters: GPT-5.4 found almost no owner docs that actually define these objects, even where many other contracts now depend on them.

2. **Extend requested/effective runtime identity to include account and overseer role.**
   - Why it matters: provider/persona fields exist, but effective account switching and requested/effective execution identity are still mostly unmodeled.

3. **Choose one HITL model and one action family.**
   - Why it matters: tier-boundary approvals, graph-local commands, and blocked-node runtime actions currently coexist as competing canonical mechanisms.

4. **Separate plan structure from mutable runtime state.**
   - Why it matters: GPT-5.4 repeatedly found runtime truth split across plan shards, JSON sidecars, and event/projection docs.

5. **Specify package-based worktree lane pools end-to-end.**
   - Why it matters: SCM, Source Control UI, Orchestrator UI, and recovery policy all depend on it, but no single canonical lane-pool model exists yet.

6. **Normalize recovery vocabulary across safe point, restore point, rollback, contamination, and retry.**
   - Why it matters: GPT-5.4 found these concepts partially modernized but still inconsistently named and scoped across plans.

## GPT-5.3-Codex Sweep Findings

## Highest-Impact Docs

- `Plans/Orchestrator_Page.md`
  - why impacted: still acts like a primary runtime owner for orchestration UX and identity projection.
  - what old assumption is present: `Tiers`, `Phase/Task/Subtask`, singular `Overseer`, and `requested_persona_id` / `effective_persona_id`.
  - what likely new model pressure is: package/seam overseers, package/seam/lane visibility, promotion-class state, requested vs effective execution/account identity.

- `Plans/Executor_Protocol.md`
  - why impacted: still encodes singular scheduler/transition authority and older dispatch assumptions.
  - what old assumption is present: one `Overseer`, lexicographic-style canonical selection language, tier-era ownership.
  - what likely new model pressure is: scored ready-set scheduling, lane pools, package/seam governance split, contamination and safe-point-aware recovery.

- `Plans/Contracts_V0.md`
  - why impacted: core runtime contract already shows drift against UI/runtime consumers.
  - what old assumption is present: tier-boundary HITL payloads, incomplete execution identity, no account fallback fields.
  - what likely new model pressure is: requested/effective account identity, package/seam/lane/promotion objects, blocked/recovery payload normalization.

- `Plans/human-in-the-loop.md` and `Plans/Project_Output_Artifacts.md`
  - why impacted: these still define approval boundaries and workspace/storage identity in legacy terms.
  - what old assumption is present: HITL at tier boundaries, workspace paths under `<phase>/<task>/<subtask>`, deprecated `allowed_actions[]` usage still lingering.
  - what likely new model pressure is: optional HITL boundaries at node/package/seam promotions, lane/worktree identity, mid-run blocked-resolution routing, automation-first default.

- `Plans/WorktreeGitImprovement.md`
  - why impacted: still the main SCM/worktree execution owner.
  - what old assumption is present: `tier_id` / subtask worktree ownership, branch-per-tier flow, merge fallback posture, parallel subtasks as primary parallelism model.
  - what likely new model pressure is: package-based lane pools, contamination quarantine, restore-before-reuse policy, Source Control plus Orchestrator shared visibility.

- `Plans/Run_Graph_View.md`
  - why impacted: graph UI is still heavily tier-shaped even where runtime addenda have modernized.
  - what old assumption is present: `TierTree`, `tier_type`, `View in Tiers`, phase/task/subtask grouping.
  - what likely new model pressure is: first-class seam/package/lane nodes, promotion-class badges, requested/effective execution identity, blocked/recovery action unification.

- `Plans/Prompt_Pipeline.md`, `Plans/Personas.md`, `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - why impacted: these still lock orchestration boundaries and oversight to the old taxonomy.
  - what old assumption is present: `Phase/Task/Subtask/Iteration`, tier-boundary audit flow, single Overseer plus fixed reviewer pattern.
  - what likely new model pressure is: package overseer plus seam overseer split, requested/effective account fallback, promotion-aware provider/event records.

- `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`
  - why impacted: graph schemas are too narrow for the new runtime object family.
  - what old assumption is present: node-only lifecycle, lexicographic selection, no blocked/contaminated/restore-required states.
  - what likely new model pressure is: package/seam/lane IDs, promotion classes, safe-point and contamination lineage, requested/effective execution identity.

- `Plans/00-plans-index.md`, `Plans/Crosswalk.md`, `Plans/Glossary.md`
  - why impacted: anti-drift and ownership docs still operationalize the legacy model.
  - what old assumption is present: tier hierarchy, singular Overseer, tier-boundary HITL, old canonical owner map.
  - what likely new model pressure is: new vocabulary canon, migration guidance, deprecation boundaries, package/seam/lane/promotion terminology ownership.

## GUI / UX Impacts

- `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - impacted surface: Orchestrator page, run graph, widget registry, rebuild checklist.
  - likely issue: UI still presents `Tiers` as a primary mental model and lacks first-class work package, feature seam, lane, promotion, contamination, and resolution-thread surfaces.

- `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/chain-wizard-flexibility.md`
  - impacted surface: Dashboard / chat / interview and chain wizard flows.
  - likely issue: attention routing is thread-local or wizard-local, not explicitly Dashboard -> Orchestrator -> chat-thread for blocked and major-decision paths.

- `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.md`
  - impacted surface: runtime actions and UI control wiring.
  - likely issue: old `cmd.graph.*` recovery actions coexist with canonical `cmd.runtime.*`, and current command envelopes cannot express seam/package/lane promotion actions.

- `Plans/GitHub_Integration.md`
  - impacted surface: Source Control and GitHub worktree views.
  - likely issue: row ownership is still `run/tier`, not package-lane ownership, so Orchestrator and Source Control cannot share a coherent worktree model.

## Runtime / Storage / Contract Impacts

- `Plans/Contracts_V0.md` vs `Plans/Orchestrator_Page.md`
  - impacted contract/runtime/storage area: identity fields.
  - likely issue: `requested_persona` / `effective_persona` are canonical in contracts, but UI still uses `_id` variants; account fallback fields are missing entirely.

- `Plans/Contracts_V0.md` vs `Plans/human-in-the-loop.md`
  - impacted contract/runtime/storage area: HITL request schema.
  - likely issue: `allowed_actions[]` and `allowed_action_ids[]` both appear as canonical depending on document, which will break blocked-action parity.

- `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/test_strategy.schema.json`, `Plans/evidence.schema.json`, `Plans/gui_automation_manifest.schema.json`
  - impacted contract/runtime/storage area: graph and evidence schemas.
  - likely issue: schemas remain run/node/tier-scoped, with no seam/package/lane/promotion/account lineage and no contamination or safe-point restore provenance.

- `Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`
  - impacted contract/runtime/storage area: persisted object identity and workspace layout.
  - likely issue: state and artifact paths still preserve old tier/workspace assumptions and need per-project, per-run, per-package/lane scoping.

- `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/Run_Graph_View.md`
  - impacted contract/runtime/storage area: scheduling and blocked/recovery lifecycle.
  - likely issue: lexicographic dispatch, scored scheduler, blocked overlays, and graph-local retry families still coexist without one canonical model.
