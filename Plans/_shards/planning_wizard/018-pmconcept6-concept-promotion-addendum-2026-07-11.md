# Shard 018: PMConcept6 Concept Promotion Addendum - 2026-07-11

Source: `Plans/Planning_Wizard.md`

Source lines: L1554-L1609

Source SHA256: `2b9591954871986cc5af23764d026ce102ca67be66634c7d1e49dc6988833d00`

---

## PMConcept6 Concept Promotion Addendum - 2026-07-11

This addendum promotes user-approved PMConcept6 concept behaviors into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`; this addendum creates no WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, runtime artifacts, generated governance artifacts, or production build tasks.

### PWIZ-019 - Embedded Assistant Chat Instances In Wizard Workspace

```yaml
plan_unit_id: PWIZ-019
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard and PRD Builder workspaces embed Assistant Chat instances per topic conversation and per PRD discovery interview. Each embedded instance is the same Assistant Chat component and message pipeline as the global chat panel, rendered from one template and state source in a chrome-reduced embedded mode: the message stream, composer, and quick-reply chips remain, send stays gated by conversation state, and panel-level chrome such as the thread rail, thread search, issues and worktree indicators, persona and model selectors, the mode strip, and panel toggles is omitted. Stream, footer, and suggestion content resolve per thread, and context boxes are thread-scoped. Embedded instances are additive: the separate global Assistant Chat side panel remains the canonical #chatPanel surface, so embedding inside the wizard workspace does not replace or remove the separate chat side panel.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: [PWIZ-013, F3-131, F3-357]
unblocks: []
acceptance_criteria:
- Wizard topic conversations and PRD discovery interviews render embedded Assistant Chat instances backed by the same component, template, and state source as the global chat panel.
- Embedded mode omits the thread rail, thread search, issues and worktree indicators, persona and model selectors, mode strip, and panel toggles while keeping the message stream, composer, quick-reply chips, and gated send.
- The separate global Assistant Chat side panel remains available while embedded instances are active.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this unit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check
risk_class: owner_drift
reasoning_tier: standard
context_scope: planning_wizard_embedded_chat_instances
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: wizard_embedded_assistant_chat_instances
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:concept:pm6-build-2026-07-11
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- Plans/FinalGUISpec.md#F3-420
source_atom_ids: []
decision_refs:
- dec-2026-07-11-pm6-concept-promotion-planunits-seal
correction_refs: []
preserved_exact_tokens:
- Assistant Chat
- embedded
- quick-reply chips
- '#chatPanel'
negative_constraints:
- Do not replace or remove the separate Assistant Chat side panel; embedded instances are additive to the separate panel surface.
- Embedded chat chrome must not require arbitrary-content backdrop blur or SVG filters; color styling must be precomputed rather than runtime color mixing, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
```
