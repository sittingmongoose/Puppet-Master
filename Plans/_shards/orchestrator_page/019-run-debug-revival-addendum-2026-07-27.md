# Shard 019: Run & Debug Revival Addendum - 2026-07-27

Source: `Plans/Orchestrator_Page.md`

Source lines: L2627-L2687

Source SHA256: `a678065d5ec532bd6c495df5a4fb52d791586f438ae46d50ecc621c79fe6e49a`

---

## Run & Debug Revival Addendum - 2026-07-27

This addendum resolves the `run_interrupted` CTA card's three action references (`Plans/FinalGUISpec.md` CTA Card Contracts, referenced) to the canonical `cmd.run.*` dispatch ids registered by `Plans/Commands_System.md` Run & Debug Revival Addendum §7.3 (referenced). Run lifecycle semantics remain owned by this document's existing sections and by `Plans/Run_Graph_View.md`; this addendum restates nothing beyond the resolution mapping and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

### OP-034 - Run-Control Command Trio Semantics

```yaml
plan_unit_id: OP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The run_interrupted CTA card's three actions resolve to canonical commands: cmd.run.resume resumes an
  interrupted orchestrator run preserving its run identity and checkpoint lineage (consumed by reference
  from this document's "Current vs historical run behavior", including the focused-run/historical
  routing contract, and "Owner-surface command routing"); cmd.run.view_log reveals the run's log surface
  without mutating run state; cmd.run.stop requests run stop through the existing stop/lifecycle path
  (referenced) with confirmation class two_step per Commands_System §7.3 (referenced); these commands
  never create a new run identity.
gui_related: true
gui_classification_reason: The run_interrupted CTA card's primary and secondary actions are user-visible orchestrator controls.
depends_on: [OP-033]
unblocks: []
acceptance_criteria:
  - The run_interrupted CTA card primary and secondary action ids resolve to cmd.run.resume, cmd.run.view_log, and cmd.run.stop exactly.
  - cmd.run.resume preserves the interrupted run's identity and checkpoint lineage; no dispatch of the trio mints a new run identity.
  - cmd.run.stop carries confirmation class two_step per Commands_System §7.3; cmd.run.resume and cmd.run.view_log carry none.
  - Disabled reasons for the trio come only from the closed set stale_projection, permission_required, unreachable per Commands_System §7.3 (referenced).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future run_interrupted CTA card dispatch fixtures
risk_class: run_control_command_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: run_control_command_trio_semantics
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "user decision 2026-07-27"
  - "Plans/Orchestrator_Page.md:246"
  - "Plans/Orchestrator_Page.md:250"
  - Plans/Commands_System.md (Run & Debug Revival Addendum §7.3; referenced)
preserved_exact_tokens:
  - cmd.run.resume
  - cmd.run.view_log
  - cmd.run.stop
  - run_interrupted
negative_constraints:
  - Do not mint additional cmd.run.* ids here; registration is owned by Plans/Commands_System.md §7.3 and Plans/UI_Command_Catalog.md (referenced).
  - Do not restate run lifecycle semantics beyond the resolution mapping; "Current vs historical run behavior" and "Owner-surface command routing" remain the canon.
  - Do not allow any trio dispatch to create a new run identity or to bypass the cmd.run.stop two_step confirmation.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Commands_System.md
```
