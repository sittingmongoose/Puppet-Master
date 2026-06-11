# Shard 016: PlanUnits

Source: `Plans/Personas.md`

Source lines: L688-L858

Source SHA256: `5e129c7f012d6afb9ec8705e987406f2c4dbf03270001df73844c0aff95d2ab9`

---

## PlanUnits

### P-001 - Personas (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: P-001
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: Plans/Personas.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Personas.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Personas-S0058
preserved_exact_tokens:
- Personas (Canonical SSOT)
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 1. Definitions
- 1.1 Agent
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
- 1.2 Subagent
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md'
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md'
- 1.3 Persona (canonical term)
- 'ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Tools.md'
- 1.4 Separation from provider-native concepts
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/OpenCode_Deep_Extraction.md'
- 2. Storage layout
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 2.1 Project-local
- 2.2 Global
- 2.3 Resolution order
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-VALIDATION'
- 2.4 Built-in scope
- 'ContractRef: ContractName:Plans/Personas.md#RESERVED-PERSONAS, ContractName:Plans/FinalGUISpec.md'
- 3. Persona format (schema)
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md'
negative_constraints:
- Editing Personas in the Puppet Master GUI MUST NOT mutate files under `.claude/`, `.github/`, `.cursor/`, or any other provider-native agent directory. Personas are stored exclusively in the Puppet Master Persona storage layout (§2). Provider-native agent files may be read as a seed source for initi
- Persona selection must be deterministic and must not silently collapse child roles into the parent Persona.
- 'The following integrations are specified by their subsystem SSOTs and MUST NOT be restated here:'
- 'The following Persona IDs are **protected Puppet Master core built-in IDs**. They MUST NOT be used for user-created Personas and MUST NOT be shadowed by project-local or global Persona files. When the corresponding built-in `PERSONA.md` definitions are present, they remain selectable and assignable '
- '**Enforcement:** The Persona validation logic (§3.3) MUST reject creation of user Personas with these IDs. If a built-in Persona with one of these IDs exists in canonical Persona storage, `select_for_node()` and surface-specific resolvers MAY return it only when the target surface is compatible with'
- '**Display normalization:** Natural-language forms such as `Assistant`, `General`, `Overseer`, `Bash`, `Teacher`, `deep researcher`, and `general purpose` normalize to the canonical IDs above. `Document Writer` is legacy/source-lineage wording and MUST NOT resolve to a protected core Persona unless a'
- '**AC-P04:** Editing a Persona in the GUI MUST NOT create, modify, or delete files under `.claude/`, `.github/`, `.cursor/`, or any provider-native agent directory.'
- '- `Plans/Prompt_Pipeline.md` and `/Prompt_Pipeline.md` may still mention tier and tier_id in run-envelope lineage, but persona_override_owner_id must not use tier_id as canonical owner scope.'
- '`assistant` is the default chat Persona. It has broad capability similar to `general-purpose`, but its default style is warmer, more talkative, more collaborative, and more overtly helpful. It is allowed to do real work when action is warranted, but it must not become a hidden worker Persona or a pa'
- '`overseer` is a governance/conductor Persona, not the scheduler personified and not a normal node-worker implementation Persona. It supervises package/seam execution, selects or recommends workers, demands evidence, judges readiness, and prevents incomplete or weakly integrated work from being treat'
- '- subjective audit mechanics such as exact reviewer counts, consensus reduction, forced remediation, and observability are Orchestrator/runtime contracts; Persona prose may mirror the instincts but must not re-own the mechanics.'
- '- actor type outranks stack hints: overseer, reviewer, corroborator, recovery, graph-patch, and node-worker roles must not collapse into implementation Personas just because a language or framework is detected.'
- '`technical-writer` is a specialty/template candidate only. It is not a protected core Persona and MUST NOT be used to recreate `document-writer` by another name; workflow owners may use `collaborator`, `assistant`, `general-purpose`, or a narrow specialty for document drafting according to stage fit'
compatibility_only_notes:
- 'Compatibility guard:'
- '**Display normalization:** Natural-language forms such as `Assistant`, `General`, `Overseer`, `Bash`, `Teacher`, `deep researcher`, and `general purpose` normalize to the canonical IDs above. `Document Writer` is legacy/source-lineage wording and MUST NOT resolve to a protected core Persona unless a'
- '- Interview stage configuration must persist canonical Persona-oriented field names; legacy `phase_subagents` and `phase_secondary_subagents` are migration aliases only.'
- '`researcher` is a read-only Persona that combines local codebase inspection with current external sources. It is appropriate for debugging strange issues, compatibility checks, solution discovery, current documentation review, GitHub issues/PRs, forums, papers, official docs, MCP resources, skills, '
stale_retired_dispositions:
- '`_id` variants are retired from canonical runtime payload examples.'
- '**Display normalization:** Natural-language forms such as `Assistant`, `General`, `Overseer`, `Bash`, `Teacher`, `deep researcher`, and `general purpose` normalize to the canonical IDs above. `Document Writer` is legacy/source-lineage wording and MUST NOT resolve to a protected core Persona unless a'
- '- new content must use the requested/effective runtime naming already established elsewhere; stale `*_persona_id` drift should be normalized during reconciliation.'
- '- `Plans/Contracts_V0.md` and `/Contracts_V0.md` explicitly forbid requested_persona_id and effective_persona_id as parallel canonical fields; Personas.md, Contracts_V0, Contracts_V0.md, and every runtime-facing consumer must treat those names as stale aliases only.'
- '- seek counter-evidence when sources look one-sided, promotional, stale, or repetitive.'
owner_boundary_notes:
- '# Personas (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master Persona system. All other plan documents MUST reference this document by anchor (e.g., `Plans/Personas.md#PERSONA-SCHEMA`) rather than restating Persona definitions, storage layout, schema, or selection rules.
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- Subagent registry (canonical name list): `Plans/orchestrator-subagent-integration.md` §4 (`DRY:DATA:subagent_registry`)'
- '- provider-native agent files may seed or export Persona content, but PM Persona storage remains canonical.'
- '### 1.3 Persona (canonical term)'
- '- enum fields must use the canonical values from their owner systems.'
- 'Persona-related runtime identity fields align to the shared owner contract:'
- '`_id` variants are retired from canonical runtime payload examples.'
- 'Canonical child Persona resolution order:'
- '### 5.4 Cross-references to SSOT subsystems'
- '**Enforcement:** The Persona validation logic (§3.3) MUST reject creation of user Personas with these IDs. If a built-in Persona with one of these IDs exists in canonical Persona storage, `select_for_node()` and surface-specific resolvers MAY return it only when the target surface is compatible with'
- '**Display normalization:** Natural-language forms such as `Assistant`, `General`, `Overseer`, `Bash`, `Teacher`, `deep researcher`, and `general purpose` normalize to the canonical IDs above. `Document Writer` is legacy/source-lineage wording and MUST NOT resolve to a protected core Persona unless a'
- '### 7.1 Canonical `persona_registry`'
- '### 7.2 Canonical `subagent_registry`'
- '- Interview stage configuration must persist canonical Persona-oriented field names; legacy `phase_subagents` and `phase_secondary_subagents` are migration aliases only.'
- 'Canonical persisted/runtime fields remain:'
- '- `requested_persona_id` and `effective_persona_id` are not canonical persisted field names'
- '- blocked-state payloads must use canonical requested/effective Persona identity fields rather than reviving `requested_persona_id` or `effective_persona_id`.'
- '- `Plans/Prompt_Pipeline.md` and `/Prompt_Pipeline.md` may still mention tier and tier_id in run-envelope lineage, but persona_override_owner_id must not use tier_id as canonical owner scope.'
owner_hints:
- Plans/Personas.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

