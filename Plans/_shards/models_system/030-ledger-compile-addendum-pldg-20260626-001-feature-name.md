# Shard 030: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Models_System.md`

Source lines: L7789-L8028

Source SHA256: `406b3d1e8b4517facac8f80e9b5fe4ae8b535c095a7c337b75ff5e043877d152`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### MS-116 - Vision Bridge Requested Effective Route Resolution

```yaml
plan_unit_id: MS-116
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Vision bridge route resolution selects an eligible vision-capable provider/model/account from PM
  capability records and project/account policy. PM shows requested/effective provider, model, and account; records
  usage/cost refs when available; retries only bounded transient failures; and falls back to another eligible route
  only when policy permits and disclosure permission covers the destination. Catalog visibility or HTTP availability
  alone is not proof that a route currently supports image input.
gui_related: true
gui_classification_reason: Requested/effective provider/model/account states are user-visible model-route disclosure
  for image understanding.
depends_on:
- PS-121
unblocks:
- T-165
- RAP-035
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_model_route_drift
reasoning_tier: high
context_scope: vision_bridge_model_resolution
implementation_surfaces:
- Plans/Models_System.md
- future model route resolver
node_compile_hint:
  mode: vision_bridge_model_resolution
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0074
- pldg-20260626-001-feature-name:atom-0087
- Plans/Media_Generation_and_Capabilities.md
- Plans/Provider_OpenCode.md
- chat:vision-bridge-defaults-answer
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Models_System.md
source_atom_ids:
- atom-0074
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- provider/model capability matrix
- project/account policy
- media_input
- image input
- support-state
- opencode-go
- mimo-v2.5-free
- 2. yes
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
- 'yes'
negative_constraints:
- Do not hardcode OpenCode `opencode-go` or `mimo-v2.5-free` as PM's bridge defaults.
- Do not flatten route-specific media state into a single provider-level boolean.
- Do not clear a route as vision-capable without current provider/model capability evidence.
- Do not depend on OpenCode `auth.json`, OpenCode DB, Bun, or OpenCode CLI dependency for PM bridge routing.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Provider_OpenCode.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```

### MS-117 - Teach Teacher Low End Model Setting

```yaml
plan_unit_id: MS-117
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Teach/Teacher defaults to a low-end/fast model and exposes a GUI-adjustable scoped model setting.
  Teacher threads disclose requested and effective model, fallback/clamp state, setting source, and whether a stronger
  model is recommended for handoff. Setting states cover default, user override, unavailable route, capability clamp,
  policy denial, inherited project/account default, and temporary fallback; Teach model defaults are explained in
  Help/Glossary content.
gui_related: true
gui_classification_reason: Defines visible settings, model chips, fallback states, and requested/effective model
  disclosure for Teach/Teacher.
depends_on:
- P-055
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_model_setting_drift
reasoning_tier: standard
context_scope: teach_teacher_model_setting
implementation_surfaces:
- Plans/Models_System.md
- future Teach settings row
- future Teacher thread model chips
node_compile_hint:
  mode: teach_teacher_model_setting
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0091
- pldg-20260626-001-feature-name:atom-0092
- pldg-20260626-001-feature-name:atom-0100
- pldg-20260626-001-feature-name:atom-0108
- pldg-20260626-001-feature-name:atom-0127
- pldg-20260626-001-feature-name:atom-0136
- pldg-20260626-001-feature-name:atom-0141
- chat:teacher-feature-initial-framing
- Plans/Models_System.md#PERSONA-MODEL-OVERRIDES
- Plans/Models_System.md#7.2-Settings--Models
- Plans/assistant-chat-design.md#1.1-Chat-controls-platform-model-and-reasoningeffort
- Plans/Models_System.md#2
- Plans/Models_System.md#5-Per-Persona-runtime-preferences
- chat:teach-visual-specificity-challenge
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/FinalGUISpec.md#19.5-runtime-display-requirements
- Plans/FinalGUISpec.md#19.7-provider-gap-disclosure-rule
source_atom_ids:
- atom-0091
- atom-0092
- atom-0100
- atom-0108
- atom-0127
- atom-0136
- atom-0141
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
- corr-0003
preserved_exact_tokens:
- default to a low end model
- low end model
- fast
- Smallest/cheapest available model
- setting too in the gui to adjust the model
- Settings > Models
- current defaults and their source
- model precedence chain
- default_model
- default_variant
- requested/effective
- fallback
- warning
- Auto/fast default
- selected override
- Reset to Auto
- Teacher persona
- low-end model
- low-end/fast model
- requested model
- effective model
- provider availability
- fallback reason
- Teacher persona details
- setting too in the gui
- Teacher mode header
- requested/effective Persona
- current surface/context chip
- Teach capture availability
- Start guided walkthrough
- Show sources
- Save as taught memory
- Hand off
negative_constraints:
- Do not silently default Teach/Teacher to a high-cost or high-effort model when the user has not asked for it.
- Do not hardcode one provider-specific low-end model as universal PM canon.
- Do not block Teach if the preferred low-end model is unavailable; follow Models_System fallback and disclosure
  rules.
- Do not hide the Teach/Teacher model default in an uneditable shipped Persona file only.
- Do not let the GUI setting imply a model is applied when provider capability filtering skipped or fell back from
  it.
- Do not duplicate generic Chat model picker behavior without clarifying Teach/Teacher default scope.
- Do not make Teach/Teacher model settings ambiguous about scope or precedence.
- Do not show unavailable low-end preferences as applied when runtime fallback selected something else.
- Do not add a seventh broad user-facing automation model setting when a Teach/Teacher-specific Persona/surface
  override is enough.
- Do not make Teach model configuration invisible in a raw PERSONA.md file only.
- Do not create a broad new automation model class when a scoped Teach/Teacher row is sufficient.
- Do not show fallback model choice as if the requested low-end setting was applied.
- Do not hide fallback from requested model to effective model.
- Do not make Teach model configuration raw-file only.
- Do not reuse a broad automation model setting when a scoped Teach/Teacher setting is intended.
- Do not hide requested/effective model differences.
- Do not let Settings imply a provider honored a Teacher model preference when it was skipped or clamped.
- Do not create a broad seventh automation model setting for Teach.
- Do not invent a separate chat product surface for Teacher.
- Do not hide requested/effective Persona/model state.
- Do not show Save as taught memory unless the content is eligible and user confirmation is still required.
owner_hints:
- Plans/Models_System.md
- Plans/Personas.md
- Plans/Prompt_Pipeline.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
```
