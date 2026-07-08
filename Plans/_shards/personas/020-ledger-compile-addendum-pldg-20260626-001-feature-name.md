# Shard 020: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Personas.md`

Source lines: L3310-L3446

Source SHA256: `aad24d2d1027b60f8a00834429ecfb575a1b1002e3f6e5d269489ce2af2e2abb`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### P-055 - Teacher Persona Teach Boundary

```yaml
plan_unit_id: P-055
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: Teacher is a protected Persona used by Teach, not a standalone feature. Teacher stays in teaching/help
  mode, explains PM concepts and workflows, cites source groups or missing coverage, avoids guessing, and hands
  off when the user asks for implementation/build work, high-reasoning architecture decisions, audit/repair, external
  research beyond available sources, direct execution, or specialty tooling. Handoff cards explain why, suggested
  destination Persona/mode, context to carry forward, and whether a stronger model is recommended.
gui_related: false
gui_classification_reason: Persona identity and scope are assistant behavior, not GUI layout.
depends_on: []
unblocks:
- PP-056
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
risk_class: teacher_persona_scope_drift
reasoning_tier: standard
context_scope: teacher_persona
implementation_surfaces:
- Plans/Personas.md
- future Teacher persona routing
node_compile_hint:
  mode: teacher_persona_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0090
- pldg-20260626-001-feature-name:atom-0121
- pldg-20260626-001-feature-name:atom-0147
- pldg-20260626-001-feature-name:atom-0149
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/Personas.md#RESERVED-PERSONAS
- Plans/Personas.md#CORE-PERSONA-CATALOG
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/Personas.md#11.8-teacher
- Plans/Personas.md#P-040-teacher-core-persona
source_atom_ids:
- atom-0090
- atom-0121
- atom-0147
- atom-0149
decision_refs:
- dec-0018
- dec-0020
- dec-0024
correction_refs:
- corr-0001
- corr-0003
preserved_exact_tokens:
- Teach feature
- Teacher persona
- Teacher is also a persona(used for the teacher feature)
- requested_persona
- effective_persona
- Teacher
- Persona
- low-end/fast default model
- effective model
- PM sources
- current context
- highlight
- open
- route UI surfaces
- hand off
- implementation/build work
- high-reasoning architecture decisions
- audit/repair
- external research
- direct execution
- specialty tooling
- suggested destination Persona
- stronger model
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
- Do not introduce `requested_persona_id` or `effective_persona_id` as canonical fields; those are stale aliases
  in Personas.md.
- Do not make Teacher a hidden subagent for this feature; existing Plans say `teacher` is user-facing and not subagent-only.
- Do not present Teacher as a separate feature detached from Teach.
- Do not let Teacher claim authority without visible source/context disclosure.
- Do not allow Teacher to perform unsafe mutations as teaching gestures.
- Do not let Teacher quietly become a builder or auditor.
- Do not silently switch Persona/model/tool path without disclosure.
- Do not discard Teacher context during handoff.
- Do not certify Teacher on a small happy-path chat only.
- Do not let Teacher answer capability or settings questions without live/source-backed state.
- Do not treat missing coverage as a passing answer unless it is visibly disclosed and routed.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/Prompt_Pipeline.md
- Plans/Contracts_V0.md
- Plans/Models_System.md
- Plans/FinalGUISpec.md
- Plans/Tools.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Automated_Testing_System.md
- Plans/Glossary.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
