# Shard 018: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Personas.md`

Source lines: L3189-L3236

Source SHA256: `93a948241c79656528bf10eaeb01e6d82e44ce50b5cabc1981bf22c314950b1e`

---

## Ledger Compile Addendum - pldg-20260614-001

### P-053 - Persona Registry Mutability And Subagent Binding Compile Addendum

```yaml
plan_unit_id: P-053
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Personas.md owns Persona identity, Persona body storage, persona_registry semantics, protected core Personas,
  tweakable built-in Personas, and user-created Personas. Subagent launch records may bind to Personas, but the
  subagent_registry is a runnable delegation registry and must not store canonical Persona prompt bodies. Protected
  platform Personas are locked for platform safety, tweakable built-ins preserve shipped defaults for upgrade and restore,
  and user-created Personas may be edited and bound to user-created subagent entries after validation.
gui_related: true
gui_classification_reason: Persona mutability includes user-visible Persona library/editor and protected/tweakable/user-created UI behavior.
depends_on: [P-005, P-009, P-013, P-021, P-022, P-023, P-046]
unblocks: [OSI-425, OSI-426, F3-388]
acceptance_criteria:
  - The protected v1 Persona list remains assistant, general-purpose, overseer, bash, teacher, collaborator, researcher, deep-researcher, and explorer.
  - Subagent configuration stores selection, visibility, and launch binding only; Persona body edits persist through Persona storage.
  - Tweakable built-ins keep a shipped default target so reset, upgrade merge, and conflict display remain deterministic.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-001-part-2-cleanup-fable-audit
risk_class: persona_registry_drift
reasoning_tier: standard
context_scope: persona_to_subagent_boundary
implementation_surfaces: [Plans/Personas.md, Plans/orchestrator-subagent-integration.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: persona_registry_boundary, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0022
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0023
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0024
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0030
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0031
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0032
  - source_ref:chat:start-subagent-persona-cluster
  - source_ref:chat:persona-simple-v1-advanced-mutability
  - source_ref:chat:protected-persona-list-complete
preserved_exact_tokens: ["Personas", "Persona", "persona_registry", "subagent_registry", "protected", "tweakable", "user-created", "assistant", "general-purpose", "overseer", "bash", "teacher", "collaborator", "researcher", "deep-researcher", "explorer"]
negative_constraints:
  - Do not store canonical Persona body overrides inside SubagentGuiConfig.
  - Do not allow raw subagent registry controls to mutate protected platform Personas.
  - Do not treat provider-native agent directories as canonical Persona storage.
owner_hints: [Plans/Personas.md, Plans/orchestrator-subagent-integration.md, Plans/FinalGUISpec.md]
```
