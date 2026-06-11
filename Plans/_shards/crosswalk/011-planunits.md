# Shard 011: PlanUnits

Source: `Plans/Crosswalk.md`

Source lines: L486-L655

Source SHA256: `f2f8e870f84d197685516b94bf721a02b4a839ed3d513287213a5168585c0682`

---

## PlanUnits

### C-001 - Crosswalk (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: C-001
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: Plans/Crosswalk.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Crosswalk.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
- Crosswalk (Canonical)
- Canonical owner-section requirements
- Coverage blocker worktree allocation strategy
- Route/open compatibility-only fallback marking
- 0. Scope
- 'ContractRef: Primitive:Crosswalk'
- 1. Precedence (anti-drift)
- 'ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json'
- 2. Primitive index (definitions are DRY)
- 2.1 Canonical primitive entries
- 'ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json'
- Route target navigation rules
- Open subject navigation rules
- 3.3 Navigation and source-open ownership
- 3.4 Source Control and lane/worktree ownership
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md, ContractName:Plans/FileManager.md'
- 3.5 Assistant thread worktree binding ownership
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md'
- 3.6 Projection-state ownership
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md'
- 3.7 Subagent, crew, and context-shaping ownership
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- '- feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field'
- Per-surface docs may narrow these behaviors, but MUST NOT redefine the owners above.
- '- consumer docs may name required permission keys or blocked triggers but MUST NOT redefine the approval-scope contract'
- '- Orchestrator/GUI/chat docs consume remediation state but MUST NOT redefine remediation enums or ceiling behavior'
- '- `Plans/Section15_MVP_Promoted_Features_Spec.md` is the shell-level owner for terminal placement plus shell/session identities across `Plans/**` consumers, including `/session` behavior that downstream docs may route to but must not redefine'
- '- consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives'
- '- Blocking rewrite owners route through existing docs: `Plans/orchestrator-subagent-integration.md` owns the core execution model, `Plans/FinalGUISpec.md` must retire Tiers/linear navigation assumptions, and `Plans/FileSafe.md` must not let a strict Phase/Task/Subtask hierarchy block package-based p'
- '- `FileManager.md` and `/navigation` consumers must not make `OpenFile` the universal navigation primitive; identity-native document, artifact, runtime, and governance opens normalize through `OpenSubject` or object routes first.'
- '- Project and panel navigation stay route-consuming: `cmd.project.open` must not mutate `shell-state`, panel `/subview` entries such as `Source Control` may be landed by route identity, and that route must not become a full serialized `source_control.project_state` owned by the surface.'
- '- Permissioned interview/chat flows route `Plans/Permissions_System.md`, `Plans/assistant-chat-design.md`, and `Plans/interview-subagent-integration.md` as the owner set for approval, chat, and interview behavior; preview/browser `trust_tier` must not be reused as a generic `projection-state` term.'
- '- `Plans/Glossary.md`, `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/human-in-the-loop.md`, and `Plans/interview-subagent-integration.md` remain consumer/owner surfaces for terminology, shell/chat, approval, and interview behavior. `cmd.panel.switch` is panel-centric and too shal'
- '- `operational_identity` records the external side-effect target context in play: GitHub org/repo/workflow/job and `/repo/workflow/job`, Docker context/image/publish target and `/image/publish`, Kubernetes context/namespace/workload and `/namespace/workload`, plus other environment-specific target i'
- '- Attention and `/CtA` surfaces are route consumers: local field conventions must normalize to the generalized `route-target` model, and most identifiers in navigation payloads must not become top-level canonical `route_target` fields. `generated://<artifact_id>` is resolved source transport chosen '
- '- Project/artifact/file surfaces must route by `project_id`, `attempt_id`, generated `/runtime` subject identity, and `/artifact/file` pivots. `resume_url` must not outrank generic `UICommand.args`, and normalized `open in X` / `show in Y` actions become thin wrappers rather than independent navigat'
- '- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes the `/Progression_Gates.md`, `/plan_graph.schema.json`, and '
- '- Orchestrator/Evidence surface copy such as `Open in Editor` must not imply raw-path opens for artifact-backed or report-backed subjects; those actions normalize to `OpenSubject`, `Open Artifact`, `Open Report`, or object routes before any path realization.'
- '- `Send selection to chat` is a thread-scoped chip/handoff path; it must not be collapsed into the durable `/annotation` lifecycle, and it does not create patch-apply semantics.'
- '- Targeted revision MUST NOT trigger Multi-Pass Review.'
- '- V1 is note-based embedded-document review upgraded into structured annotations; direct `patch-apply` behavior is out of scope.'
- '- docs and implementations must not use these terms interchangeably'
- '- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes that contradiction to owner docs and requires one scheduler '
compatibility_only_notes:
- '### Route/open compatibility-only fallback marking'
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- '- Blocking rewrite owners route through existing docs: `Plans/orchestrator-subagent-integration.md` owns the core execution model, `Plans/FinalGUISpec.md` must retire Tiers/linear navigation assumptions, and `Plans/FileSafe.md` must not let a strict Phase/Task/Subtask hierarchy block package-based p'
- '- `FileManager.md` stays the path-based editor realization owner: `OpenFile` handles workspace paths, line/range selection, and editor chrome, while `route-target` / `OpenSubject` own cross-surface identity navigation and `/open-by-identity` compatibility transport.'
- '- Crosswalk owns the navigation `primitive-boundary` declaration for `route-target` and `subject-open` navigation. `route-target` and `subject-open` identify the canonical route/open boundary, while `resume_url` and `/open-by-identity` are transport or compatibility expressions that must serialize t'
- '- The route-target and subject-open primitive boundary covers `/open-by-identity` as compatibility transport when kept tight: one canonical primitive may span route-target navigation and subject-open/open-by-identity behavior only if it preserves the shared route/open identity contract.'
- '- This primitive now covers durable document annotations on the legacy `note_record.v1` substrate.'
- '- legacy packet-era names such as `analysis_id`, `run.scheduler_analysis`, `allowed_actions[]`, and `recovery_options[]` are compatibility terms only'
- '- Source Control and GitHub worktree views stay /worktree-centric while attaching package-lane and /seam/lane-aware visibility; legacy run/tier row ownership is compatibility metadata, not the shared worktree identity model. Archive and /prune/remove cleanup is gated by active-run ownership, unresol'
- '- Source Control reconciles the legacy split across `FinalGUISpec`, `GitHub_Integration`, and `WorktreeGitImprovement`; `Git (GitHub)` is a migration alias only, and live `/surfaces` route through Source Control plus WorktreeGitImprovement rather than preserving a combined Git/GitHub panel.'
- '- Compatibility shorthands such as `/local-git` and `/worktree/push` route through `Primitive:PatchPipeline` and the Source Control owner docs. `conflict-precedence` follows this Crosswalk precedence plus the feature owner docs rather than consumer help text.'
- '- Docker Manager is the umbrella for Docker/Podman/Kubernetes; `/Podman/Kubernetes` wording is a compatibility shorthand for alternate runtime plus project-focused Kubernetes subview ownership, not separate shell ownership.'
- When feature-owner docs disagree, this Crosswalk records the owner precedence and secondary-doc constraints rather than letting consumer wording decide. `newtools.md` owns Docker and Actions doctor IDs plus result payload minima; `doctor.registry.auth` is a deprecated alias only for DockerHub-specif
- '- Secondary broad-pass constraints: chat and file-tree docs remain consumers of the legacy Git/GitHub model and must be reconciled alongside the feature-owner docs; `git*` and `actions*` remain built-in chat command namespaces; Docker/registry/Kubernetes operational identity is not owned by Multi-Ac'
stale_retired_dispositions:
- '**Freshness / health projection:** Thread worktree binding state follows the two-dimensional projection model (freshness=current|refreshing|stale × health=healthy|degraded|unavailable) defined in storage-plan.md §Projection state.'
- '- `Decision_Policy.md` owns behavior when stale, degraded, or unavailable state affects execution or mutation gating'
- '- Strong stale consumers such as `Plans/FinalGUISpec.md` and `Plans/chain-wizard-flexibility.md` must reference the route-target/subject-open boundary rather than continuing surface-local navigation assumptions.'
- '- Downstream navigation fields such as `usage_event_ref`, `wizard_step`, direct artifact/document `IDs`, `/document`, and other special-case top-level fields must normalize to the owner-level route/open model. This seam is owner-level, not consumer-level: fixing `Orchestrator_Page.md`, `Orchestrator'
- '- Conflicting or stale mutating annotations are excluded from automatic revision until resolved.'
- '- Future-phase risk tags for this primitive are explicit and non-blocking: `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.'
- '- stale canonical text must be replaced or retired, not preserved by later additive notes alone'
- When feature-owner docs disagree, this Crosswalk records the owner precedence and secondary-doc constraints rather than letting consumer wording decide. `newtools.md` owns Docker and Actions doctor IDs plus result payload minima; `doctor.registry.auth` is a deprecated alias only for DockerHub-specif
- '- Secondary broad-pass constraints: chat and file-tree docs remain consumers of the legacy Git/GitHub model and must be reconciled alongside the feature-owner docs; `git*` and `actions*` remain built-in chat command namespaces; Docker/registry/Kubernetes operational identity is not owned by Multi-Ac'
owner_boundary_notes:
- '# Crosswalk (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- CANONICAL CROSSWALK
- This document is a **boundary map**, not an implementation plan.
- '### 2.1 Canonical primitive entries'
- This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.
- '- `Primitive:RouteTarget` -- canonical route, focus, and cross-surface target identity boundary for GUI, CLI, help, and service navigation. `resume_url`, `route_target`, and `/open-by-identity` serialize or transport this identity; they do not own it.'
- 'Route targets and open subjects are the canonical way to name destinations and inspection points across GUI, CLI, help, and underlying services. This section clarifies the boundary: ownership and canonical semantics live in Plans/Contracts_V0.md; this section explains how surfaces navigate them.'
- '- `github://owner/repo/path` → GitHub repository (requires auth and branch access)'
- 3. Crosswalk describes which surfaces can open which types; canonical ownership rules are in Contracts_V0.md.
- '`Plans/FileManager.md` owns path-based editor realization only: `OpenFile` handles workspace paths, line/range selection, editor chrome, and code-navigation clicks after a canonical path is known. Cross-surface `route-target` / `OpenSubject` navigation, `/open-by-identity`, and identity-native docum'
- 'Source Control and `Plans/WorktreeGitImprovement.md` own Git/worktree object navigation and worktree lifecycle; `Plans/FileManager.md` only preserves path/root context when handing off to that route. Worktree selection, `open-in-SCM`, and Source Control pivots are object navigation, not pure layout '
- '| Aspect | Owner doc | Consumer docs |'
- Projection freshness/health vocabulary is owned centrally so consumer docs do not invent surface-local degraded-state semantics.
- 'Canonical ownership is:'
- Subagent and crew ownership is intentionally split across owner docs. Each concern has one authoritative home.
- '| Concern | SSOT owner |'
- 'Canonical HITL ownership is:'
- '- `Contracts_V0.md` owns the canonical blocked-episode fields, action ids, and persisted payload shapes'
- 'Canonical debug/investigation ownership is:'
- 'Canonical permission ownership is:'
- '- `Contracts_V0.md` owns canonical blocked payload shapes, `approval_scope_key`, and action-id field names'
owner_hints:
- Plans/Crosswalk.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

