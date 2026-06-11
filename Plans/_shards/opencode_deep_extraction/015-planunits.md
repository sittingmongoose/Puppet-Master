# Shard 015: PlanUnits

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L786-L960

Source SHA256: `a34ba16b8d9204278f712a7d59bd7dfc26ec3b7b2f489b3fd2b5ffb53616db21`

---

## PlanUnits

### ODE-001 - OpenCode Deep Extraction (for Puppet Master) Source-Preserving PlanUnit

```yaml
plan_unit_id: ODE-001
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: Plans/OpenCode_Deep_Extraction.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:OpenCode_Deep_Extraction-S0070
preserved_exact_tokens:
- OpenCode Deep Extraction (for Puppet Master)
- Baseline Reference
- 1. Goal
- 2. Hard constraints
- 2A. Transfer Fidelity Notes
- 3. Inputs
- 4. Deterministic extraction procedure
- 5. Output format (for downstream agents)
- 6. Acceptance criteria
- 7. Expanded Extraction Coverage
- 7A. Run Modes and Enforcement
- 7A.1 Plan mode
- 7A.2 Agent/mode switching
- 7A.3 Ask/approval semantics
- 7B. Subagents, Roles/Personas, and Context Injection
- 7B.1 Agent definitions and fields
- 7B.2 Subagent invocation mechanism
- 7B.3 Explore agent baseline
- 7B.4 Prompt assembly pipeline
- 7B.5 Compaction triggers and continuation summaries
- 7C. Permissions and Approval Mechanics
- 7C.1 Permission resolution algorithm
- 7C.2 Granular object-syntax matching
- 7C.3 Wildcard matching
negative_constraints:
- '- Permission-preset deltas must not narrow PM planning/research defaults below the product tool surface; read-only and Plan modes retain `/question/skill/LSP/todo/subagent` assistance through the owning Tools and permission contracts while keeping mutation tools gated.'
- Coverage extraction hazards include /examples, filename-shaped strings, cmd.*, and /false values; extraction verifiers must not treat those as product commands without an owning command or coverage record.
compatibility_only_notes:
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- Runtime persona compatibility keeps _persona_id, Contracts_V0, Contracts_V0.md, and /runtime visible as extraction evidence while requested/effective persona ownership remains in the contract/runtime docs.
- Node attempt lane evidence preserves /node/attempt/lane, orchestrator-subagent-integration, orchestrator-subagent-integration.md, and TierContext compatibility references.
- Runtime owner-level evidence preserves /runtime, owner-level, and tier as compatibility labels when older extraction language is compared with current owner docs.
- 'Legacy tier-construction snippets preserve `CrewCreator::Orchestrator { tier_id: format!("interview-phase-...") }`, `CrewCreator::Orchestrator { tier_id: format!(\"interview-phase-...\") }`, CrewCreator, `to_tier_id: Some(format!("interview-phase-..."))`, `to_tier_id: Some(format!(\"interview-phase-'
- 'Additional fields from the spec (`license`, `compatibility`, `metadata`) may appear in frontmatter but are not used by the core loading logic -- only `name` and `description` are validated via `Info.pick({ name: true, description: true }).safeParse()`.'
- '- `schema()`: Transforms tool JSON schemas for provider compatibility.'
- 2. **Compatibility roots:** PM maintains its own canonical roots and also imports compatible roots such as `.claude/skills` and `.agents/skills` per the PM skill system. Compatibility import does not make those external roots canonical.
- 3. **Projection posture:** Provider-native or tool-native skill projection is optional compatibility only. PM should not require Codex-specific or GitHub-Copilot-specific skill packaging inside OpenCode because OpenCode itself applies one skill system above its provider list.
- 4. **Discovery vs runtime:** OpenCode-style discovery compatibility is useful, but PM runtime correctness still depends on PM registry resolution, readiness validation, context bundling, and the PM `skill` tool.
- '- Notable delta vs Puppet Master assumptions: a significant amount of "provider compatibility" lives in the transform layer (not in the core session stream), so don''t assume upstream tool/message parts map 1:1 to any single provider''s API.'
- '- Message schema (legacy/simple): `packages/opencode/src/session/message.ts` (parts: `text`, `reasoning`, `tool-invocation`, `file`, ...)'
stale_retired_dispositions: []
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- Extract reusable, implementation-grade guidance from OpenCode (run modes, agents, permissions, commands, formatters, skills, plugins, models, provider streams, UI command patterns, storage/event envelope conventions) and map those findings into Puppet Master's SSOT plans **without** importing drift-
- '- Generated adapter config remains derived and `/no-secrets`; extracted provider/tool findings land in `Plans/Tools.md` (`/Tools.md`), `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`), or a dedicated MCP `SSOT` when one is created, rather than making this OpenCode reference doc the owner.'
- '- OpenCode material is baseline-only reference lineage. Session-wide approval examples remain external baseline observations unless an owner doc explicitly adopts them; live PM runtime and permission canon stay in `Plans/Permissions_System.md`, `Plans/Run_Modes.md`, `Plans/Tools.md`, and `Plans/Cont'
- Runtime agent state is /event-sourced. active-agents and active-agents.json describe derived runtime state for `Plans/orchestrator-subagent-integration.md` and `/orchestrator-subagent-integration.md`, not a local owner in this extraction document.
- Usage linkage preserves usage.event, storage-plan, storage-plan.md, usage-feature, usage-feature.md, /account/model, and UsageRecord references so account/model usage lineage can be reconciled without moving the UsageRecord owner here.
- Promoted-feature references preserve `Plans/Section15_MVP_Promoted_Features_Spec.md`, `/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Skills_System.md`, `Plans/Plugins_System.md`, `/Skills_System.md`, and `/Plugins_System.md` for MVP/promoted-feature linkage without making this extraction documen
- Projection references preserve /projection, storage-plan, and storage-plan.md evidence while keeping projection ownership in storage and downstream owner docs.
- Executor package/seam/lane evidence preserves /package/seam/lane, Executor_Protocol, Executor_Protocol.md, orchestrator-subagent-integration, and orchestrator-subagent-integration.md as downstream owner references.
- Owner-of-owners evidence preserves DRY_Rules, owner-of-owners, newfeatures, OpenCode_Coverage_Matrix, Decision_Log, feature-list, and rewrite-tie-in-memo references as extraction lineage for audit routing.
- Runtime owner-level evidence preserves /runtime, owner-level, and tier as compatibility labels when older extraction language is compared with current owner docs.
- Run graph handoff references preserve Run_Graph_View, Run_Graph_View.md, Orchestrator_Page, Orchestrator_Page.md, human-in-the-loop, and human-in-the-loop.md as downstream owner references.
- 'Reconciliation-readiness evidence preserves `/Crosswalk` and `/routing` dispute risk: Glossary/Crosswalk remain too weak to resolve term/routing disputes cleanly, which keeps downstream addenda accumulating instead of reconciling; this extraction baseline carries enough owner-routing, contradiction,'
- '- Puppet Master Plans directory (SSOT).'
- '3) **Extract canonical artifacts** (ordered):'
- '5) **Map findings into Puppet Master SSOT docs**:'
- '- Never duplicate: add a reference to the correct SSOT doc instead of copying long definitions.'
- '- Every adopted/adapted item is mapped to a single Puppet Master SSOT doc section.'
- '## 8. Contract Mapping to Puppet Master SSOT (DRY)'
- This section is the canonical mapping from OpenCode extraction categories to Puppet Master contract sections. Use these targets instead of duplicating definitions.
- '| # | Extracted Topic | OpenCode Primary File(s) | Puppet Master SSOT Target | Contract Section(s) |'
- 1. **Architecture pattern, not ownership transfer:** OpenCode's skills system is a useful reference because it sits above the provider layer. Puppet Master should follow that pattern architecturally while keeping PM-native skills as the canonical runtime path.
- 2. **Compatibility roots:** PM maintains its own canonical roots and also imports compatible roots such as `.claude/skills` and `.agents/skills` per the PM skill system. Compatibility import does not make those external roots canonical.
- '5. **Debug model/memory boundary**: Debug or OpenCode-derived extraction must verify model assumptions against `Plans/Models_System.md` (`/Models_System.md`) and Assistant-only memory assumptions against `Plans/assistant-memory-subsystem.md` (`/assistant-memory-subsystem.md`); this baseline referenc'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

