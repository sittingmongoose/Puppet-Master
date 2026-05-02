  - **Impacted area:** Gating logic.
  - **Likely issue:** Gates are currently tier-scoped. Need to be redefined around package completion or seam transitions.

## Settings / Provider / Persona / Account Impacts
- `Plans/Multi-Account.md`
  - **Likely issue:** Missing the concept of "Effective Identity" (lane-specific auth) in storage and evidence.
- `Plans/GitHub_Integration.md`
  - **Likely issue:** Assumes single repo/current context. Multi-lane might mean multi-repo or multi-context operations.
- `Plans/Personas.md`
  - **Likely issue:** Needs to define "Overseer" personas and their relation to Lanes.
- `Plans/Models_System.md`
  - **Likely issue:** Model selection might need to be lane-aware (e.g., a "Security Lane" might enforce a specific model).

## Worktree / SCM / Parallelism Impacts
- `Plans/WorktreeGitImprovement.md`
  - **Likely issue:** The per-subtask worktree model is too granular and slow. Parallel toggles vs Lane pools need reconciliation.
- `Plans/MiscPlan.md`
  - **Likely issue:** Cleanup and contamination models are weak. "Safe points" need to be rigorously defined against worktree state.
- `Plans/newfeatures.md`
  - **Likely issue:** Snapshots vs safe points ambiguity. Background agent queue needs to integrate with the new Lane scheduler.

## Cleanup Priorities
- **Priority 1 (Blocking)**
  - `Plans/orchestrator-subagent-integration.md`: The core execution model is invalid.
  - `Plans/FinalGUISpec.md`: The "Tiers" tab and linear navigation are fundamentally wrong for the new model.
  - `Plans/FileSafe.md`: The strict Phase/Task/Subtask hierarchy prevents package-based planning.
- **Priority 2 (Misleading)**
  - `Plans/Run_Graph_View.md`: Visuals are outdated but concepts of dependencies remain.
  - `Plans/WorktreeGitImprovement.md`: Specific branching strategy is obsolete, but the need for worktrees remains.
- **Priority 3 (Terminology)**
  - `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Crosswalk.md`: Need to adopt Seam/Lane/Overseer/Package terminology.

## Contradictions To Resolve
- **Worktree Strategy:** `chain-wizard-flexibility.md` mentions "explicit no-worktrees" while `WorktreeGitImprovement.md` details "per-subtask worktrees".
  - *Why it matters:* Fundamental to performance and isolation strategy.
- **Memory/State:** `assistant-memory-subsystem.md` forbids orchestrator memory, but `newfeatures.md` implies a system-prompt loop with state.
  - *Why it matters:* Defines how smart the orchestrator can be and where state lives.
- **State Authority:** `active-agents.json` (Orchestrator local) vs `seglog`/`redb` (Storage event sourcing).
  - *Why it matters:* Split brain risk. The system cannot have two sources of truth for execution state.

## Suggested Research Follow-Ups
- **Lane Mapping:** How do we map "Lanes" to "Worktrees" exactly? Is it 1:1, or dynamic allocation?
- **Pathing:** What replaces the "Phase/Task/Subtask" path on disk? (Package ID? Seam ID?)
- **Identity Persistence:** How does "Effective Identity" persist across tool calls in a stateless protocol?

## Opus 4.6 Sweep Findings

Model-wave synthesis from Claude Opus 4.6 fleet sweep across Plans/**. Focuses on Orchestrator-model impact from the transition away from Phase/Task/Subtask/Iteration tier hierarchy toward a node-graph / work-package / feature-seam execution model.

## Highest-Impact Docs

- **`Plans/orchestrator-subagent-integration.md`** — Highest pressure of any doc (1201 legacy term hits, 8 addenda). Core body still defines `TierContext`, `TierType`, `select_for_tier`, and a `tier_id`-keyed `active-agents.json` state file. Addenda (2026-03-06 onward) bolt on persona/effective-runtime, scheduler, and remediation concepts but never replace the tier-rooted execution model. Classic split-brain: body is tier-canonical, addenda are node-adjacent.
- **`Plans/FinalGUISpec.md`** — 22 addenda accumulated. Body defines Tiers tab, phase/task/subtask progress bars (3-bar layout), and `widget.tier_tree` as a primary Orchestrator surface. Later addenda introduce dashboard widget grid, rendering surface, scheduler/blocked GUI, but never reconcile the Tiers tab itself. The tab name, progress bar structure, and navigation model all assume linear phase progression.
- **`Plans/Widget_System.md`** — `widget.tier_tree` (Phase/Task/Subtask tree with state badges) and `widget.progress_bars` (phase/task/subtask completion bars) are load-bearing catalog entries. No package/seam/lane-aware widget equivalents exist. The catalog will need new widgets or significant rework of these two.
- **`Plans/Run_Graph_View.md`** — 273 node/graph term hits but 52 legacy tier hits. Grouped-by-phase layouts are rigid. The doc is the closest to node-aware but still frames visualization through a phase lens. Needs swimlane/package-group views.
- **`Plans/orchestrator-subagent-integration.md` + `Plans/Crosswalk.md` + `Plans/Glossary.md`** — Crosswalk and Glossary have near-zero coverage of overseer (package or seam), work package, feature seam, lane, attempt, or effective identity. These are the terminology authorities and their silence makes every other doc's usage inconsistent.
- **`Plans/00-plans-index.md`** and **`Plans/feature-list.md`** — feature-list has 13 addenda and 63 legacy tier hits. Many feature entries still describe tier-scoped behavior. The index links to docs whose execution models are now divergent.

## GUI / UX Impacts

- **Tiers tab is obsolete as specified.** `widget.tier_tree` renders a Phase/Task/Subtask tree; `widget.progress_bars` renders 3 phase-scoped bars. These widgets have no package/seam/lane counterpart in the catalog.
- **Dashboard → Orchestrator attention flow is under-specified.** FinalGUISpec mentions `widget.orchestrator_status` and `widget.current_task` on the Dashboard, but the navigation path from Dashboard summary → Orchestrator detail → active chat thread lacks a defined contract. Which overseer's thread? Which lane's state?
- **Chat thread identity is single-threaded.** `assistant-chat-design.md` shows subagent blocks in thread history but assumes one execution context per thread. Multi-lane concurrency (package overseer A vs. seam overseer B) has no thread-routing model.
- **Wizard/Interview output mismatch.** `chain-wizard-flexibility.md` §11 declares sharded plan-graph nodes as canonical output, but §6.2.3 still frames Interview output as Phase/Task/Subtask/Iteration. The wizard produces the graph that the Orchestrator consumes — this split directly propagates into GUI.
- **HITL approval model assumes tier boundaries.** `human-in-the-loop.md` defines pause gates at phase/task/subtask completion. Under package/seam governance, approval boundaries are package-complete or seam-complete, neither of which maps to the existing HITL toggle set.
- **Run_Graph_View needs layout overhaul.** Grouped-by-phase is the only layout. Package-group swimlanes, seam boundaries, and parallel lane visualization are absent.

## Runtime / Storage / Contract Impacts

- **`active-agents.json` is incompatible with event-sourced state.** The orchestrator body uses a flat JSON file for agent tracking. The storage plan and addenda reference seglog/redb as canonical event stores. Two sources of truth = split-brain risk.
- **Canonical pathing `<phase>/<task>/<subtask>` is embedded in contracts.** `Contracts_V0.md` and `Executor_Protocol.md` use tier-based paths for addressing. No package-id or seam-id pathing exists.
- **Progression gates are tier-scoped.** `Progression_Gates.md` validates plan-graph structure but gates are phase/task boundaries. Package-complete and seam-complete gates are undefined.
- **FileSafe write scope assumes monolithic plan.** FileSafe Part B (§14.6) compiles role-specific context per Phase/Task/Subtask/Iteration. Write scope references "files declared in the active plan" — singular. Sharded node graphs under `.puppet-master/project/plan_graph/` break this assumption.
- **Prompt pipeline carries tier identity.** `Prompt_Pipeline.md` §1.2 embeds tier/mode in the run envelope and instruction bundle. No node-identity, package-identity, or lane-identity fields exist.
- **Storage-plan event names lack new fields.** 39 node/graph references exist but event schemas don't include package_id, seam_id, lane_id, attempt_id, or effective_identity fields.
- **`newfeatures.md` declares tier hierarchy permanent.** §1.1-1.2 explicitly state "four-tier hierarchy" and "no new tiers." This directly contradicts the node-graph canonical output from `chain-wizard-flexibility.md`.
- **MiscPlan cleanup policy is tier-scoped.** Runner contract (prepare/cleanup) references progress.txt, AGENTS.md, and prd.json as tier-era state files. No node-level artifact boundaries or cleanup scopes.

## Settings / Provider / Persona / Account Impacts

- **Requested vs. effective execution identity is partial.** `Multi-Account.md` defines provider-level multi-identity but has no concept of lane-specific or package-specific effective identity. `Personas.md` (line 648) mentions requested/effective visibility but only for persona, not for account/provider/model at the lane level.
- **Persona system has no overseer concept.** `Personas.md` defines personas for subagent selection but has zero references to overseer personas, package-overseer assignment, or seam-overseer assignment. The ledger's earlier research established that overseers need configurable personas — this gap is unaddressed.
- **Model selection is not lane-aware.** `Models_System.md` has 12 node/graph references but no lane-level or package-level model binding. A security-focused lane enforcing a specific model has no mechanism.
- **Per-execution-level settings are missing.** The ledger's research established that feature-seam, work-package, and node should each have independent provider/model/effort settings with defaults plus overrideability. No plan doc defines this settings surface.
- **GitHub integration assumes single repo context.** Multi-lane execution may span branches or worktrees pointing at different states. `GitHub_Integration.md` has no multi-context model.

## Worktree / SCM / Parallelism Impacts

- **Per-subtask worktree model is legacy.** `WorktreeGitImprovement.md` has 121 legacy tier hits vs. 4 node/graph hits. Branching strategy is `tier_id`-keyed. The emerging model wants package-based lane pools with dynamic allocation.
- **Safe-point / restore policy exists but is tier-bound.** `WorktreeGitImprovement.md` §1 defines worktree-native safe points with retry-from-safe-point semantics, and `MiscPlan.md` §1572+ ensures runner cleanup respects them. However, safe points reference "the originating attempt lineage" without defining attempt in a lane/package context.
- **Contamination policy is weak.** No doc defines what happens when a worktree allocated to lane A gets partially committed work from a failed attempt and needs to be reassigned to lane B. The safe-point mechanism handles retry within one lineage but not cross-lane reuse.
- **`chain-wizard-flexibility.md` mentions "explicit no-worktrees"** while `WorktreeGitImprovement.md` details per-subtask worktrees. This contradiction (also flagged by Gemini sweep) is unresolved and fundamental to isolation strategy.
- **Parallel toggles vs. lane pools.** `newfeatures.md` describes background agent queues and snapshot-based recovery. These are single-context concurrency mechanisms, not multi-lane parallelism. The gap between "concurrent agents in one workspace" and "isolated lanes with dedicated worktrees" is undefined.

## Cleanup Priorities

- **P0 — Blocking execution model conflicts:**
  - `orchestrator-subagent-integration.md`: Body-vs-addenda split-brain on tier vs. node execution. The 8 addenda never replace `TierContext`/`TierType`/`select_for_tier`. Needs a single coherent execution model section.
  - `newfeatures.md` §1.1-1.2 "no new tiers" declaration directly contradicts `chain-wizard-flexibility.md` §11 sharded-node canonical output. One of these positions must yield.
  - `Glossary.md`: Zero definitions for overseer (package or seam), work package, feature seam, lane, attempt, effective identity. Every other doc's usage of these terms is ungrounded.

- **P1 — Misleading GUI/widget specs:**
  - `FinalGUISpec.md`: Tiers tab, 3-bar progress, `widget.tier_tree` are specified in detail but describe a defunct model. Addenda pile-up (22) makes the doc hard to navigate.
  - `Widget_System.md`: `widget.tier_tree` and `widget.progress_bars` catalog entries need replacement or respecification for package/seam/lane groupings.
  - `Orchestrator_Page.md`: Tab layout (Progress/Tiers/Node Graph/Evidence/History/Ledger) needs Tiers→Packages or similar rename plus content respec.

- **P2 — Contract/storage field gaps:**
  - `Contracts_V0.md`, `Executor_Protocol.md`: Add node_id, package_id, seam_id, lane_id, attempt_id, effective_identity to addressing and event schemas.
  - `storage-plan.md`: Event schemas need the same new fields.
  - `Prompt_Pipeline.md`: Run envelope / instruction bundle needs node-identity alongside or replacing tier-identity.

- **P3 — Addenda consolidation:**
  - `FinalGUISpec.md` (22 addenda), `orchestrator-subagent-integration.md` (8 addenda), `feature-list.md` (13 addenda) all have duplicate or overlapping addenda that create conflicting local authorities. These need merge-and-dedup passes.

## Contradictions To Resolve

1. **Tier permanence vs. node-graph canon.** `newfeatures.md` §1.1-1.2 declares four-tier hierarchy permanent. `chain-wizard-flexibility.md` §11 declares sharded node graph canonical. These are mutually exclusive execution models.
2. **Single Overseer vs. package + seam overseers.** `orchestrator-subagent-integration.md` body defines one Overseer role within the Orchestrator. Ledger research established package overseers + seam overseers as the target. No plan doc reflects the dual-overseer model.
3. **Worktree on vs. worktree off.** `chain-wizard-flexibility.md` references explicit no-worktrees mode. `WorktreeGitImprovement.md` specifies per-subtask worktrees as mandatory isolation. No doc defines when each applies.
4. **Automation-first vs. manual HITL defaults.** `human-in-the-loop.md` defaults all HITL toggles to OFF (automation-first), but the approval model assumes tier-boundary pauses that imply manual review is the expected pattern at phase transitions. The default posture and the UX design pull in opposite directions.
5. **Memory prohibition vs. stateful orchestration.** `assistant-memory-subsystem.md` uses NullMemoryProvider for all non-Assistant agents including Orchestrator. `newfeatures.md` implies a system-prompt loop carrying state. If the Orchestrator has no memory, how does it maintain coherence across packages?
6. **`active-agents.json` vs. seglog/redb.** Body of orchestrator doc uses a flat file. Storage plan and addenda use event-sourced stores. Both claim to be the source of truth for execution state.
7. **FileSafe monolithic plan vs. sharded node graph.** FileSafe write scope references "the active plan" (singular). Node-graph execution has many concurrent node scopes under `.puppet-master/project/plan_graph/`. Write-scope resolution is undefined for multi-node concurrent execution.

## Suggested Research Follow-Ups

1. **Package/seam overseer spec.** Define the dual-overseer governance model (package overseer + seam overseer) in a canonical doc. Include: spawning rules, validation subagent pair, escalation paths, persona/model assignment.
2. **Widget catalog refresh.** Design replacements for `widget.tier_tree` and `widget.progress_bars` that visualize packages, seams, lanes, and parallel execution. Determine if the Tiers tab is renamed or replaced.
3. **Effective identity contract.** Define how requested vs. effective execution identity (provider, model, account, persona) is tracked, stored, and displayed at each governance level (node, package, seam, lane).
4. **Lane ↔ worktree mapping.** Determine whether lanes get 1:1 dedicated worktrees, draw from a pool, or use a hybrid. Define contamination detection and safe-point restore for cross-lane worktree reuse.
5. **Pathing migration.** Design the replacement for `<phase>/<task>/<subtask>` canonical paths. Candidates: `<package_id>/<node_id>`, `<seam_id>/<package_id>/<node_id>`, or content-addressed.
6. **Addenda consolidation pass.** FinalGUISpec (22), orchestrator-subagent-integration (8), and feature-list (13) need merge-and-dedup. Determine ownership: which addenda content should live in the body vs. be retired.
7. **HITL boundary redesign.** Redefine approval gates for package-complete and seam-complete events rather than phase/task/subtask boundaries. Address automation-first default vs. the UX expectation of manual review.
8. **Dashboard → Orchestrator → Thread attention flow.** Specify the navigation contract: which widget click leads where, which overseer's thread opens, how lane context is carried through the navigation.

## Sonnet 4.6 Sweep Findings

Model-wave synthesis from Claude Sonnet 4.6 fleet sweep across `Plans/**`. Sonnet strongly reinforces the node-graph transition pressure already seen in earlier waves, but it surfaced especially sharp gaps in schema anchors, requested-vs-effective execution identity, worktree/lane visibility, and policy-layer terminology ownership.

## Highest-Impact Docs

- **`Plans/orchestrator-subagent-integration.md` + `Plans/Executor_Protocol.md` + `Plans/Contracts_V0.md`**
  - **Why impacted:** These are the runtime truth owners for scheduling, attempts, blocked states, safe points, and execution identity.
  - **Old assumption:** Single Overseer, tier-rooted execution, phase/task/subtask framing, lexicographic or tier-centric dispatch inputs.
  - **New model pressure:** Need explicit package/seam/lane/package-overseer/seam-overseer support, scored ready-set scheduling, requested/effective account identity, and package-safe remediation lineage.

- **`Plans/FinalGUISpec.md` + `Plans/Run_Graph_View.md` + `Plans/Widget_System.md`**
  - **Why impacted:** These define the Orchestrator-facing UI and its primary widgets.
  - **Old assumption:** Tiers tab, `widget.tier_tree`, grouped-by-phase graph layouts, one current task/worker/worktree at a time.
  - **New model pressure:** Must visualize packages, seams, lanes, contamination state, promotion state, and multiple concurrent overseer/worker identities.

- **`Plans/storage-plan.md` + `Plans/usage-feature.md` + `Plans/assistant-memory-subsystem.md`**
  - **Why impacted:** These are the storage/projection backbone.
  - **Old assumption:** Run/tier/session/thread are the main runtime scopes; one project active at a time; account identity is optional or implicit.
  - **New model pressure:** Need package/seam namespaces, lane/worktree state, contamination events, package-aware usage attribution, and clearer AutoRunBoundary semantics under node/package execution.

- **`Plans/FileSafe.md` + `Plans/WorktreeGitImprovement.md` + `Plans/newtools.md`**
  - **Why impacted:** These govern worktree isolation, write-scope safety, live-run artifacts, and PM-managed side-effect repos.
  - **Old assumption:** Per-subtask worktrees, singular active worktree, project-root artifact paths, and ad-hoc runtime side effects.
  - **New model pressure:** Need package-based lane pools, contamination classification, safe-point-aware live sessions, lane-scoped evidence roots, and Source Control visibility for PM-owned worktrees like template repos.

- **`Plans/Glossary.md` + `Plans/Crosswalk.md` + `Plans/Decision_Policy.md` + `Plans/00-plans-index.md`**
  - **Why impacted:** These are the terminology and ownership authorities.
  - **Old assumption:** Tier vocabulary and pre-existing runtime primitives are sufficient.
  - **New model pressure:** Missing canonical terms and owners for feature seam, work package, package/seam overseers, promotion classes, lane pools, contamination, safe points, and effective execution identity.

## GUI / UX Impacts

- **Tiers-first UI is now misleading.** The Tiers tab, `widget.tier_tree`, phase-grouped graph layouts, and single-current-task widgets all assume execution authority still lives in the tier hierarchy instead of the node/package/seam graph.
- **Attention routing is incomplete.** Sonnet repeatedly found missing or weak routing between Dashboard, Orchestrator, and chat-thread surfaces for blocked states, live-run status, Docker/registry side effects, FileSafe blocks, and optional HITL boundaries.
- **Requested vs effective identity is only partially visible.** Persona/platform/model mismatches are sometimes surfaced, but effective account, lane/worktree, overseer class, and package/seam scope are generally absent from UI contracts.
- **Optional HITL boundaries lack consistent UI treatment.** Existing approval surfaces assume mandatory or tier-boundary review; Sonnet found no unified contract for package-complete, seam-complete, or mandatory side-effect gates.
- **Source Control / Orchestrator worktree visibility is underdefined.** Multiple docs assume one active worktree while the emerging model requires PM-owned worktrees, lane pools, and package-level worktree state to be visible and navigable.

## Runtime / Storage / Contract Impacts

- **Schema contradictions are already live.**
  - `selection_rule = "lexicographic_node_id"` is hard-coded in graph schemas while runtime scheduler addenda define a scored tuple with lexicographic node ID only as the final tiebreak.
  - `HandoffMessage`, graph breadcrumbs, and multiple payloads still use `phase_id` / `task_id` vocabulary where node/package/seam identity is now required.
  - `ProviderRequestEnvelope` and prompt-handoff contracts are split between older V0 anchor tables and newer addenda carrying node/attempt/safe-point fields.
- **Safe-point vs restore-point vs rollback is still not normalized.** Sonnet found the concepts referenced across runtime, policy, interview, and worktree docs, but rarely defined together in one canonical contract.
- **Contamination is a major gap.** Worktree contamination, lane contamination, and restore scope are implied by blocked-reason codes and safe-point rules, but there is no shared event family or state object for contamination itself.
- **Package/seam/lane state is missing from storage.** No coherent `packages` namespace, no lane-pool registry, weak or absent `project_id` scoping in many event and artifact contracts, and insufficient usage/evidence attribution fields for multi-package runs.
- **Blocked payload normalization is inconsistent.** Legacy `reason_code` / `recovery_options[]` shapes still coexist with `blocked_reason_code` / `allowed_action_ids[]` normalization in multiple docs.

## Settings / Provider / Persona / Account Impacts

- **Multi-account fallback is structurally under-specified.** Sonnet found no canonical `requested_account` / `effective_account` shape in the main runtime identity contracts, even where requested/effective Persona and model fields are already standardized.
- **Automation-first default conflicts with existing settings defaults.** `regular`/HTE-by-default in `Run_Modes.md`, `visual_mode = auto` preferring visible runs locally, and mandatory manual gates in several flows all cut against the new automation-first posture.
- **Overseer personas are not modeled cleanly.** Package overseer and seam overseer do not have canonical Persona registry treatment or runtime identity slots in the existing Persona/model-selection contracts.
- **Docker auth is the best existing requested/effective pattern, but isolated.** `requested_auth_mode` / `effective_capabilities[]` / `effective_account_identity` in container flows point toward the right shape, but they are not generalized into the shared execution identity model.
- **Per-project/per-package configuration scope is thin.** Multiple settings systems still assume global or single-project scope when the new model needs project, package, seam, node, overseer, and delegated-subagent override layers.

## Worktree / SCM / Parallelism Impacts

- **Per-subtask worktrees conflict with package-based lane pools.** Sonnet consistently found per-subtask worktree assumptions in worktree, FileSafe, cleanup, and evidence docs, while the new model needs persistent package-scoped lane/worktree behavior.
- **One-active-worktree assumptions are everywhere.** File tree surfaces, current-worktree displays, artifact roots, and safe-point payloads frequently assume a scalar worktree, not a set of active package lanes.
- **PM-managed worktrees are invisible.** Managed Unraid template repos, live-run artifact directories, and other PM-owned git/file roots are not properly registered in Source Control / Orchestrator worktree visibility contracts.
- **Parallelism controls are the wrong shape.** Flat global concurrency caps and provider-only limits do not express per-package lane ceilings, contamination-triggered shrink, or lane-pool allocation rules.
- **SCM lineage is incomplete for node/package execution.** Many contracts carry branch/worktree data only optionally or singularly, making package-level rollback, retry, or cross-surface navigation unreliable.
