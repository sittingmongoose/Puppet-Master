# Shard 025: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Personas.md`

Source lines: L3540-L3624

Source SHA256: `a6ac418af5f65fae3ae0c76c0b75d474cc31db20f396a117284b93e34c6fec0c`

---

## Wand Modules Redesign Addendum (2026-09-27)

The 2026-09-27 redesign of the Puppet Master 5.6 Pro wand modules (design spec §8.3 and §8.4, with the participant mark of §4 B1, frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) builds its team presets from Product Manager, Architect, Implementer, Reviewer, Critical Advisor and Wonderer, and offers Grill Me as an addition. The owner's decision DL-133 (card p18, E-35) registers those six for team use and makes Grill Me a Skill. This addendum compiles that decision. It adds no protected core Persona, and it changes no Persona schema field, resolution order or runtime identity rule.

### P-057 - Team Personas For Collaboration

```yaml
plan_unit_id: P-057
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  By the owner's decision DL-133 (card p18, E-35), six first-party team Personas are registered for collaboration teams and the team presets: product-manager (Product Manager), architect (Architect), implementer (Implementer), reviewer (Reviewer), critical-advisor (Critical Advisor) and wonderer (Wonderer). Their IDs are stable lower-kebab keys. They are reserved: no user, project-local, global or imported Persona uses or shadows them, and they are never renamed, because runs record them as requested_persona and effective_persona and presentation may key on them (for example the shape of a participant's mark). They are selectable for a collaboration participant slot and appear in the team presets. This registration makes none of them a default direct-chat Persona and widens no other eligibility, except where an owner already grants it (Wonderer under WONV-001, the Back Seat Driver advisor under Plans/Back_Seat_Driver.md). critical-advisor is the same Persona Back Seat Driver uses as its advisor and is no longer Back Seat Driver-only; that document's spelling critical_advisor normalizes to critical-advisor. Their bodies are first-party bundled definitions shaped per §12.4. Registering product-manager settles the conflict between §12.2 (P-048) and the Wonderer correction in favour of the team Persona, and only for team use.
gui_related: true
gui_classification_reason: The team Personas are offered in collaboration setup and presets, and their IDs key participant presentation.
depends_on: [P-021, P-048, P-056]
unblocks: []
supersedes:
  - P-048 product-manager exclusion only (DL-133); P-048's technical-writer, document-writer, project-manager and context-manager rules stay in force, which is why P-048 stays in depends_on
acceptance_criteria:
  - The six IDs resolve in the Persona registry and can be selected for a collaboration participant slot and in team presets.
  - No user, project-local, global or imported Persona can take or shadow one of the six IDs.
  - Runs record the six only by their canonical IDs; critical_advisor normalizes to critical-advisor.
  - None of the six becomes a default direct-chat Persona through this registration.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: team_persona_identity_drift
reasoning_tier: standard
context_scope: personas_team_catalog
implementation_surfaces: [Plans/Personas.md, Plans/Collaborative_Workflows.md, Plans/Back_Seat_Driver.md]
node_compile_hint: {mode: persona_catalog_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.3, #8.4 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-PER-01 (card p18 E-35) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-133
preserved_exact_tokens: ["product-manager", "architect", "implementer", "reviewer", "critical-advisor", "wonderer", "critical_advisor", "requested_persona", "effective_persona", "DL-133"]
negative_constraints:
  - Do not rename, reuse or shadow a team Persona ID.
  - Do not make a team Persona a default direct-chat Persona through this registration.
  - Do not register project-manager or context-manager.
owner_hints: [Plans/Personas.md, Plans/Collaborative_Workflows.md]
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/Decision_Log.md#DL-133

### P-058 - Grill Me Is A Methodology Skill

```yaml
plan_unit_id: P-058
unit_type: constraint
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  Grill Me is a methodology Skill, not a Persona (DL-133, card p18, E-35), in the same way Wonderer's method is a Skill (WONV-001). No Persona ID exists for it, and "Grill Me", "grill-me" and "grill_me" never resolve to a Persona. In a collaboration run the Grill Me participant is marked by additive_role_kind grill_me (Plans/Collaborative_Workflows.md §9), takes its method from the Grill Me Skill owned by Plans/Skills_System.md, and carries no Persona of its own.
gui_related: false
gui_classification_reason: This unit fixes Persona and Skill identity rather than presentation.
depends_on: [P-057]
unblocks: []
acceptance_criteria:
  - No Persona ID named for Grill Me exists or resolves.
  - A Grill Me participant is identified by additive_role_kind grill_me and the Grill Me Skill.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: skill_registered_as_persona
reasoning_tier: standard
context_scope: personas_team_catalog
implementation_surfaces: [Plans/Personas.md, Plans/Skills_System.md, Plans/Collaborative_Workflows.md]
node_compile_hint: {mode: persona_catalog_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.4 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-PER-01 (card p18 E-35) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-133
preserved_exact_tokens: ["Grill Me", "grill_me", "methodology Skill", "additive_role_kind", "DL-133"]
negative_constraints:
  - Do not register a Grill Me Persona.
owner_hints: [Plans/Personas.md, Plans/Skills_System.md]
```

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Decision_Log.md#DL-133
