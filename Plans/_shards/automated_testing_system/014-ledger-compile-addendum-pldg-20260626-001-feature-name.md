# Shard 014: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Automated_Testing_System.md`

Source lines: L806-L1154

Source SHA256: `8f2865c0517d02b1b852c12f700c373231d771fbcf42d14292d379e633b72159`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### ATS-012 - History MVP Acceptance Tests

```yaml
plan_unit_id: ATS-012
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: History MVP tests cover current-project lock, approved-only default, All history expansion, Include
  archived as extra step, dense row schema, structured filter chips plus text search, Documents and Runs subviews,
  deep compare with rendered/source-lineage/manifest views, export selected rows/multi-select/filtered view with
  manifests and evidence/redaction profile, stale projection read-only warning, rebuild action, blocked authority-sensitive
  actions before rebuild, immutable source preservation, and no WorkNodes/NodeSeeds/executable queues created by
  compile/index.
gui_related: true
gui_classification_reason: Validates user-visible History tables, filters, compare/export actions, degraded states,
  and no-build boundary.
depends_on:
- OP-026
- OP-027
- SP-219
unblocks: []
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_validation_gap
reasoning_tier: standard
context_scope: history_acceptance_tests
implementation_surfaces:
- Plans/Automated_Testing_System.md
- future History GUI and projection tests
node_compile_hint:
  mode: history_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0065
- pldg-20260626-001-feature-name:atom-0066
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0065
- atom-0066
decision_refs:
- dec-0011
- dec-0012
preserved_exact_tokens:
- acceptance tests
- current project
- Approved only
- All history
- Include archived
- Compare versions
- Export
- Rebuild
- 'yes'
- Before compile
- pressure-test
- remaining underspecified History surfaces
negative_constraints:
- Do not compile without acceptance coverage for project scoping, archive visibility, export/redaction, projection
  rebuild, and immutable-history behavior.
- Do not treat validator success as evidence that user-facing History workflows were tested.
- Do not treat this pressure-test as permission to write canonical Plans.
- Do not create Plans/.plan_index, WorkNodes, NodeSeeds, executable queues, Spec_Lock, shards, evidence, plan_graph,
  or auto_decisions.
- Do not compile without a future explicit compile request.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### ATS-013 - Vision Bridge MVP Acceptance Tests

```yaml
plan_unit_id: ATS-013
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Vision bridge MVP tests cover automatic fallback for non-vision models, no bridge when native image
  input is reliable, manual rerun, deterministic source precedence, clipboard and recent OS screenshots in MVP,
  ambiguous screenshot picker, FileSafe project-file guard, disclosure popup reject/accept/always accept, scoped
  revocation, redaction blocking/override policy, fail-closed unavailable results for every degraded reason, structured
  prompt/output including uncertainty/OCR/limitations, cache invalidation and stale labels, provider retry/cost/reroute
  disclosure, and no guessing after failure.
gui_related: true
gui_classification_reason: Validates user-visible image/screenshot bridge workflows, permissions, artifacts, and
  degraded states.
depends_on:
- T-165
- PP-055
- PS-121
- ACD-425
unblocks: []
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_bridge_validation_gap
reasoning_tier: high
context_scope: vision_bridge_acceptance_tests
implementation_surfaces:
- Plans/Automated_Testing_System.md
- future vision bridge tests
node_compile_hint:
  mode: vision_bridge_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0088
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
source_atom_ids:
- atom-0088
decision_refs:
- dec-0016
- dec-0017
preserved_exact_tokens:
- acceptance tests
- automatic fallback
- native image-input routes
- manual rerun with a question
- reject/accept/always-accept
- revocation
- ambiguous recent screenshot
- provider unavailable/no-route
- cache hit/stale/rerun
- redaction blocked/allowed
- artifact/source lineage
- 'yes'
negative_constraints:
- Do not call the vision bridge implementation-ready without acceptance coverage for permission persistence, source
  ambiguity, failure/degraded states, cache invalidation, and artifact lineage.
- Do not let validator success stand in for testing user-visible image bridge workflows.
- Do not omit tests that prove non-vision models do not guess after bridge failure.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
- Plans/Media_Generation_and_Capabilities.md
```

### ATS-014 - Teach Teacher End To End Acceptance Tests

```yaml
plan_unit_id: ATS-014
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Teach/Teacher tests cover help icon launching a new Teacher thread with current-surface context,
  /teach and natural-language summon/disambiguation, low-end model default and GUI setting states, requested/effective
  model disclosure, PM knowledge source disclosure, missing coverage callout, guided overlay happy path and degraded
  states, mutation confirmation, activity cards, memory capture save/cancel/scope/conflict/revoke/unlock, Teacher
  handoff, responsive/overflow/keyboard/screen-reader behavior, Teach Help/Glossary coverage, and a PM knowledge
  pressure test over PM concepts, workflows, settings, models, capabilities, permissions, history, artifacts, Personas,
  skills/plugins, Orchestrator behavior, and Teach memory.
gui_related: true
gui_classification_reason: Validates GUI/thread/help/source/model/memory/handoff behavior across Teach surfaces.
depends_on:
- ACD-426
- P-055
- MS-117
- PP-056
- F3-403
- G-026
- UCC-102
unblocks: []
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_validation_gap
reasoning_tier: high
context_scope: teach_teacher_acceptance_tests
implementation_surfaces:
- Plans/Automated_Testing_System.md
- future Teach/Teacher tests
node_compile_hint:
  mode: teach_teacher_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0101
- pldg-20260626-001-feature-name:atom-0110
- pldg-20260626-001-feature-name:atom-0118
- pldg-20260626-001-feature-name:atom-0133
- pldg-20260626-001-feature-name:atom-0135
- pldg-20260626-001-feature-name:atom-0148
- pldg-20260626-001-feature-name:atom-0149
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/assistant-chat-design.md#6-Teach
- Plans/Personas.md#P-040---Teacher-Core-Persona
- chat:teach-visual-specificity-challenge
- chat:teach-help-glossary-rest-request
- Plans/Glossary.md
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- chat:collaboration-style-correction
- Plans/Personas.md#P-040-teacher-core-persona
source_atom_ids:
- atom-0101
- atom-0110
- atom-0118
- atom-0133
- atom-0135
- atom-0148
- atom-0149
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
- acceptance tests
- default to a low end model
- setting too in the gui
- variety of phrases
- help icon
- new thread
- control the Gui
- PM documentation coverage
- tooltip
- new Teacher thread
- Sources used
- guided overlay
- activity cards
- desktop and mobile
- Teach help entries exist
- related-concept links resolve
- inline/context/full help
- Teacher cites
- missing-help callouts
- source-owner refs
- does not rename canonical terms
- coverage matrix
- one row per Teach entry
- inline help
- context help
- canonical help page
- Teacher citation
- owner source refs
- related concepts
- GUI surface(s)
- missing-state behavior
- no-help-needed
- ok lets work through all those
- all those
- gap map
- filled
- drafted
- open
- decision-needed
- implementation-ready
- help icon launch
- natural-language summon
- disambiguation
- Teach model Settings states
- requested/effective model disclosure
- source disclosure
- missing coverage callout
- mutation confirmation
- memory capture
- Teacher handoff
- responsive/accessibility
- PM knowledge pressure test
- PM concepts
- workflows
- settings
- models
- capabilities
- permissions
- history
- artifacts
- Personas
- skills/plugins
- Orchestrator behavior
- Teach memory
- missing coverage
- avoid guessing
- handoff
negative_constraints:
- Do not call Teach implementation-ready without tests for model default/settings, invocation routing, help-icon
  launch, knowledge substrate behavior, GUI control safety, and activity transparency.
- Do not rely only on Persona existence or Teach memory-capture tests to validate the whole Teach feature.
- Do not mark Teach visually implementation-ready without testing the actual help icon, Teacher thread, source disclosure,
  overlay, activity cards, and model setting states.
- Do not skip responsive/overflow checks for Teacher captions, cards, chips, or settings labels.
- Do not mark Help/Glossary support complete without concrete Teach help-entry coverage tests.
- Do not allow Teacher to cite missing or broken help-entry links as valid sources.
- Do not rely on a freeform list with no coverage matrix.
- Do not mark MVP complete with missing required Teach help rows.
- Do not accept no-help-needed dispositions without owner evidence.
- Do not claim Teach is ready from the Help/Glossary content pack alone.
- Do not treat a gap as closed until its behavior, UI state, source owner, failure mode, and validation are specified
  or explicitly dispositioned.
- Do not mark Teach implementation-ready without exercising the full path across chat, settings, help, guided GUI,
  memory, and handoff.
- Do not skip responsive, overflow, keyboard, or screen-reader checks for the guided overlay and Teacher thread.
- Do not certify Teacher on a small happy-path chat only.
- Do not let Teacher answer capability or settings questions without live/source-backed state.
- Do not treat missing coverage as a passing answer unless it is visibly disclosed and routed.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Models_System.md
- Plans/Personas.md
- Plans/Tools.md
- Plans/Glossary.md
- Plans/Plan_Document_System.md
- Plans/Prompt_Pipeline.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Runtime_Artifacts_Panel.md
```
