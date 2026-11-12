# Shard 026: Wonderer Persona Stance Addendum (2026-10-16)

Source: `Plans/Personas.md`

Source lines: L3689-L3834

Source SHA256: `89f739fc13a4639be43f3ed8569d8e03342b4fd621622614ec8ab2b72e88f1b3`

---

## Wonderer Persona Stance Addendum (2026-10-16)

DL-218 adapts Wonderer from the Hermes `wonderer` profile. The profile's `SOUL.md` is the stance of the bundled Wonderer Persona, and P-059 fixes that stance. The method itself is the Wonderer methodology Skill (`Plans/Skills_System.md` SS-037), and where Wonderer runs is owned by its consumers.

### P-059 - The Wonderer Persona's Stance

```yaml
plan_unit_id: P-059
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The bundled body of the wonderer team Persona (P-057) carries the stance of the Hermes wonderer
  profile's SOUL.md, shaped per §12.4 (DL-218). Stay loose: the question is a seed, not a cage. The
  Wonderer does not answer questions; it expands them, exploring the periphery of a seed (the adjacent,
  the implied, the overlooked and the surprising) and returning things worth looking into, not things
  worth concluding. Its principles are lateral before deep (the periphery comes first, and depth belongs
  to research); anchored wonder (every new direction traces a path back to the seed, because wonder is
  not drift); premature convergence is the enemy (the most interesting connections sit at the edges of
  the search space); suggestions, not answers (its output is raw material for someone else's synthesis,
  and it does not close the loop); and conditions over protocols (spaciousness, varied inputs,
  permission to be wrong and a clear boundary make wonder likely, and no procedure guarantees it). Its
  default Skill reference is the Wonderer methodology Skill (SS-037), its tool posture is read-only
  search and read, and its handoff is its leads, which others decide on.
gui_related: false
gui_classification_reason: Persona body content, not presentation.
depends_on: [P-057]
unblocks: []
acceptance_criteria:
  - The wonderer Persona body states the five principles and that it returns leads, not conclusions.
  - Its default Skill reference is SS-037 and its tool posture writes nothing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: wonderer_persona_converges
reasoning_tier: standard
context_scope: personas_team_catalog
implementation_surfaces: [Plans/Personas.md, Plans/Skills_System.md]
node_compile_hint: {mode: persona_catalog_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-218
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/hermes-profiles-wonderer-SOUL.md sha256:cb34ac310a3e190e79f74d164963942f9cd5e5f56d2ad2ba4fdfc23974210f4c (hermes-profiles 867a555e13; source lineage, adapted)"
preserved_exact_tokens: ["wonderer", "lateral before deep", "anchored wonder", "premature convergence is the enemy", "suggestions, not answers", "conditions over protocols"]
negative_constraints:
  - Do not give the Wonderer Persona a verdict, recommendation or vote.
  - Do not give the Wonderer Persona a tool that writes.
owner_hints: [Plans/Personas.md, Plans/Skills_System.md]
```

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Decision_Log.md#DL-218

### P-060 - Persona Home, Reach, Whole Versions And Scoped Selection

```yaml
plan_unit_id: P-060
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: Personas owns each Persona as a whole record with stable persona_id, home, reach and revision.
  A library home is Everywhere, kept on the settings home and mirrored read-only to Computers; a Project
  home is the existing Project PERSONA.md root. Computer installation or mirrored availability is not
  a new field-by-field Persona layer. Every project reach includes No project; Only these projects excludes
  application-scope selection. Project switches declare project_switch_ids=[personas.library.disabled-bundled],
  limited to mutable bundled specialties by stable ID; core built-ins cannot be disabled or shadowed.
  Definition fields such as body, tool lists and skills remain whole Persona fields; retired model/provider/preset/effort fields are inert compatibility reads. A version
  for a Project is an entire same-id definition through the existing save-as-override owner action. Save
  writes the current home with expected revision and narrow Undo/re-target feedback. Selection defaults
  use the Settings resolver through Everywhere, Computer, optional Project and thread, then the Models
  owner resolves requested/effective runtime. Copy contributes an exact source hash/revision, destination
  home, protected-ID check, owner apply/readback and compensating rollback to the Settings preview/apply/rollback
  transaction. No-project create offers library, not an invented Project; conversion re-resolves future
  turns and never changes frozen historical Persona inputs. The owner contribution is named in owner_thing_previews;
  scope_model and project_switch_ids describe its manager boundary. settings.follow never grants thing
  mutation or Project content authority. The selected whole-version/copy operation is cmd.persona.save_as_override
  through sole planned handler handlers::persona::save_as_override, with Plans/shared_integration_runtime.schema.json#/$defs/persona_save_as_override_request
  and Plans/shared_integration_runtime.schema.json#/$defs/persona_save_as_override_result. The Settings
  batch invokes this owner contribution, including exact source hash/revision, destination CAS, declared
  reach/switch deltas, readback and eligible compensation; it never writes owner records directly. These
  registrations do not prove native availability; missing schema, handler, trust, installation or currentness
  remains typed unavailable. Save-as-override requires a real destination Project and preserves the same
  eligible persona_id; cmd.persona.duplicate remains the distinct-identity copy route, with its selected
  persona_duplicate_request_v2/persona_duplicate_result_v2 definitions. Neither operation shadows protected
  built-ins.
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- P-013
- P-056
- SSYS-061
- SSYS-062
unblocks: []
acceptance_criteria:
- Editing a library Persona writes its home and shows that target with Undo; making a Project version
  is explicit.
- Protected-ID copies and per-field versions refuse; deleting a Project version reveals the library version.
- No-project selection includes only permitted library reach; conversion records a fresh resolution without
  changing earlier turns.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Personas.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; S8–S11; N12/N25
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md#4.1–4.6;5
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-B02
preserved_exact_tokens:
- persona_id
- PERSONA.md
- project_switch_ids
- personas.library.disabled-bundled
- Everywhere
- Computer
- No project
- owner_thing_previews
- scope_model
- settings.follow
- cmd.persona.save_as_override
- handlers::persona::save_as_override
negative_constraints:
- Do not let Settings write PERSONA.md itself or copy credentials, histories, Goals or Plans as Persona
  settings.
- Do not derive the selected Persona from focus or silently modify siblings or frozen runs.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Personas.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Personas.md#P-060, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365
