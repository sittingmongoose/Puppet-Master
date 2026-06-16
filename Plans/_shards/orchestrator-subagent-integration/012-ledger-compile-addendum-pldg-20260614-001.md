# Shard 012: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L30946-L31033

Source SHA256: `f3d48e18324a62c3bb3589925d92cc06651b368d686cea36757e9d9cc56c9084`

---

## Ledger Compile Addendum - pldg-20260614-001

### OSI-425 - Persona-Aware Subagent Configuration Recovery

```yaml
plan_unit_id: OSI-425
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The recovered Subagent Configuration block is a routing/config contract, not Persona storage. SubagentGuiConfig
  serializes subagentConfig with enable_tier_subagents, tier_overrides, disabled_subagents, required_subagents, and an
  advanced_raw_registry_controls flag. The ordinary v1 user flow is Simple Persona-aware overrides by tier; full contextual
  keys stay advanced-only unless later promoted by a PlanUnit.
gui_related: true
gui_classification_reason: The configuration is exposed through user-visible Agent Config and Settings controls even though the persisted record is runtime config.
depends_on: [P-053, OSI-081, OSI-082, OSI-084, OSI-402, OSI-403]
unblocks: []
acceptance_criteria:
  - The Subagent Configuration YAML fence contains actual YAML and closes before unrelated markdown sections.
  - Simple v1 tier override lists can express phase, task, subtask, and iteration Persona preferences.
  - Advanced raw subagent registry controls are available only for advanced/internal use and never replace the Simple v1 flow.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - markdown fence balance review for Plans/orchestrator-subagent-integration.md
risk_class: subagent_config_loss
reasoning_tier: standard
context_scope: orchestrator_subagent_config
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Personas.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: subagent_config_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0014
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0025
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0026
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0027
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0028
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0029
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0033
  - source_ref:chat:subagent-config-recovery-accepted
  - source_ref:local:sed-orchestrator-subagent-configuration
preserved_exact_tokens: ["Subagent Configuration", "subagentConfig", "SubagentGuiConfig", "enable_tier_subagents", "tier_overrides", "disabled_subagents", "required_subagents", "Simple", "Full", "advanced", "phase", "task", "subtask", "iteration"]
negative_constraints:
  - Do not keep unrelated markdown inside the Subagent Configuration YAML fence.
  - Do not store Persona prompt bodies or canonical Persona descriptions in SubagentGuiConfig.
  - Do not expose full contextual override keys as the default v1 user flow.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Personas.md, Plans/FinalGUISpec.md]
```

### OSI-426 - Canonical Subagent Registry Name Recovery

```yaml
plan_unit_id: OSI-426
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The canonical list of subagent names is the subagent_registry entry set. The registry names runnable delegated-subagent
  roles and validates launch requests; each entry resolves to Persona identity through persona_registry and records requested
  versus effective Persona state at runtime. Fixed counts such as 42 subagent types are compatibility/source-lineage only unless
  regenerated registry evidence proves them current.
gui_related: false
gui_classification_reason: Registry identity and launch validation are runtime/config contracts, not visual presentation.
depends_on: [P-053, OSI-091, OSI-212, OSI-403]
unblocks: []
acceptance_criteria:
  - Launch validation uses subagent_registry names, not provider-native /subagent, /agent, /fleet, or /delegate syntax.
  - Every subagent registry entry resolves to a Persona or fails validation with a clear requested/effective identity record.
  - Count-based references such as 42 subagent types remain lineage until generated registry evidence exists.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-001-part-2-cleanup-fable-audit
risk_class: registry_identity_drift
reasoning_tier: standard
context_scope: delegated_subagent_registry
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Tools.md, Plans/Commands_System.md]
node_compile_hint: {mode: registry_name_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0014
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0024
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0034
  - source_ref:chat:subagent-registry-list-recovery-accepted
  - source_ref:Plans/orchestrator-subagent-integration.md:962
preserved_exact_tokens: ["Canonical list of subagent names", "subagent_registry", "persona_registry", "42 subagent types", "provider-native", "/subagent", "/agent", "/fleet", "/delegate"]
negative_constraints:
  - Do not promote a stale inline subagent-name list or count as the registry SSOT.
  - Do not let provider-native delegation syntax become normative PM runtime behavior.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Tools.md, Plans/DRY_Rules.md]
```
