# Shard 020: PMConcept6 Shell Sweep Addendum - 2026-07-16

Source: `Plans/Planning_Wizard.md`

Source lines: L1701-L1757

Source SHA256: `e3bd3e17e5ca0dce00a6b7b6776eeec9d67cb2c4283fa8706b180dbfe4604dce`

---

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 wizard replay control into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### PWIZ-020 - Replay Planning Flow Control

```yaml
plan_unit_id: PWIZ-020
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard exposes a user-facing control labelled Replay planning flow that rewinds the wizard view to its intake stage so the user can watch or re-drive the planning flow presentation from the beginning. Replay is view-local: it replays the wizard presentation over already-recorded planning state and does not touch live execution or governance state. The live PlanningRun, ledger records, approvals, and any PlanCompileRun are unaffected; replay performs no ledger mutations, requires no re-approval, and creates no new compile. Leaving replay returns the user to the current live wizard state without loss.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: [PWIZ-013, PWIZ-014]
unblocks: []
acceptance_criteria:
- A control labelled Replay planning flow rewinds the wizard view to its intake stage and replays the planning flow presentation.
- Replay leaves the live PlanningRun, ledger records, approvals, and any PlanCompileRun unchanged, with no ledger mutations, no re-approval, and no new compile.
- Replay state is view-local, and exiting replay restores the current live wizard state without loss.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check
risk_class: owner_drift
reasoning_tier: standard
context_scope: planning_wizard_view_replay_control
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: wizard_view_local_replay_control
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:concept:pm6-build-2026-07-11
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- Concepts/pm6-build/parts/16-page-wizard.part.html
- Concepts/pm6-build/parts/29x-pm6-js-wizard.part.html
- Plans/Planning_Wizard.md:30
- Plans/Planning_Wizard.md#PWIZ-014
source_atom_ids: []
decision_refs:
- dec-2026-07-16-pm6-shell-sweep-promotion-seal
correction_refs: []
preserved_exact_tokens:
- Replay planning flow
- intake
- view-local
negative_constraints:
- Replay must not mutate ledger state, re-trigger approvals, or create PlanCompileRuns; it is a view-local presentation replay.
- Replay must not rewind, fork, or invalidate PlanningRun, topic, approval, or Approve And Build currentness state.
- Wizard replay chrome must not require arbitrary-content backdrop blur or SVG filters; color styling must be precomputed rather than runtime color mixing, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
```
