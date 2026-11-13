# Shard 016: DL-477 — Goal, Review, Certification And Cost Summary Widgets On Home (2026-11-12)

Source: `Plans/Widget_System.md`

Source lines: L1974-L2100

Source SHA256: `ee7020e9012ae96dae030d4199408291d8f3386233eb9e2e6577ce4fa64f740e`

---

## DL-477 — Goal, Review, Certification And Cost Summary Widgets On Home (2026-11-12)

Jared's ruling on the June Dashboard summary (`Plans/Decision_Log.md#DL-477`, pldg-20260616-002 atom-0068) puts it on
the dashboards as widgets of the existing board model, on by default and removable. This addendum adds WS-032, which
owns those five widgets, their two new widget sources, their place in the Home board's default set and their removal.
It amends WS-030 and section 2 with dated notes and uses only WS-030's existing extension point for widget sources. It
creates no widget model, board, engine, layout key, command, event, WorkNodes, NodeSeeds, executable queues,
implementation files or production build tasks.

### WS-032 - Goal, Review, Certification And Cost Summary Widgets On Home

```yaml
plan_unit_id: WS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Jared's ruling of 2026-11-12 (DL-477), verbatim: "I believe those would be widgets on the dashboards that the
  user can put on there. Maybe those ones default to on there and the user can remove them." The June Dashboard
  summary of active goals, stuck goals and blocked goals, verification/repair status, certification state and
  cost/budget warnings is therefore five widgets of WS-030's one board model, and no widget model, board, engine,
  layout key, command or event is added for them. Sources and catalogue: two widget sources join Usage in WS-030's
  one registry under its rule that other sources may follow, each with its label, its catalogue and the way its
  widgets are built, and both follow the same kind contract as every engine widget (WS-017's curated sizes for
  lists, WS-019's gestures and settled transactions, WS-020's records). The Goals source (`goals`, label Goals)
  holds Active goals (`goals:active`) and Stuck or blocked goals (`goals:stuck`). The Workflows source
  (`workflows`, label Workflows) holds Verification and repair status (`workflows:review-status`) and
  Certification state (`workflows:certification-state`). Cost and budget warnings is not a new widget: it is
  Usage's own `widget.alert_thresholds` (Plans/usage-feature.md#UF-058, approaching-limit warnings and threshold
  status), whose content Usage owns. Add widget lists the Goals and Workflows sections after the Usage sections,
  each under its label (WS-030, Plans/FinalGUISpec.md#F3-638). What they show: each reads owner projections for
  its board's own scope, shows current state rather than following the board's range or account scope, refreshes
  under the board's idle rule (a board that is not shown does no work and catches up when shown), says in plain
  words when it has nothing to list, and opens a row's subject only through the existing route/open contract,
  adding no command. Active goals lists the board's visible Goals in state active
  (Plans/Goal_Runtime_System.md#GRS-048), each with its objective and whether its run is working or waiting on a quota or a window, which leaves
  the Goal active (GRS-051). Stuck or blocked goals lists the stuck goals: Goals in state blocked, each with its
  blocked reason (blocked_reason_ref, GRS-048) as the host's continuation left it (GRS-050); a Goal waiting on a
  quota or a window stays in Active goals, and a Goal the user paused or stopped is not stuck and is not listed
  (GRS-051). Neither Goals widget shows a Goal phase, budget, role, verification, repair or certification state,
  because Goals have none (GRS-048, GRS-049), and invisible internal Goals never appear (GRS-053). Verification
  and repair status shows the workflow-owned Review runs of the board's scope (Plans/Collaborative_Workflows.md,
  GRS-049): each run's state and its clean result or attention reason from its completion projection (CWR-029),
  and, for a re-run, the display-only counts of fixed, still open and new findings (CWR-026). Review never repairs
  on its own (CWR-006), and the widget starts, repairs and approves nothing. Certification state shows the latest
  certification decision each workflow that owns a certification step has recorded, with its truthful labels
  (GRS-065, GRS-049); it never shows a Goal's certification. Defaults and removal: Home's own default set
  (`default` for `dashboard:home`, WS-030) holds these five, first and in this order: Active goals, Stuck or
  blocked goals, Verification and repair status, Certification state, Cost and budget warnings; the Usage widgets
  that usage-feature.md names for Home follow them. Metrics', Monitoring's and the Dashboard starter's
  (`host:dashboard`) sets, the Usage room sets, custom dashboards and the Agents board are unchanged. A Home board
  with no saved copy in a project starts with the five; a Home board already saved keeps exactly its widgets and
  is never rewritten to add them, and the user can add them from Add widget or bring in the whole default set
  through Reset widgets or Start from This dashboard. The user removes any of them like any other widget, one
  cmd.widget.remove naming the board in its room field (WS-030); Add widget offers a removed one again, and Reset
  widgets brings back the whole default set. Application boards: WS-031's application Home board uses the same
  default set; its Goals widgets read that scope's application Goals (GRS-086), and Certification state, a
  Project-bound source (GRS-065), shows its owner's reason on an application board instead of an empty result
  (WS-031). The Agents board still projects application Goal and Crew work as agents at work. WS-031's rule that
  the application variant adds no widget source of its own is unchanged; DL-477, not WS-031, admits these two
  sources.
gui_related: true
gui_classification_reason: Defines which Goal, review, certification and cost summary widgets the Add widget catalogue offers, which of them Home shows by default, what each shows and how the user removes them.
split_recommended: false
depends_on: [DL-477, WS-030, WS-031, WS-017, WS-019, WS-020, F3-638, GRS-048, GRS-049, GRS-050, GRS-051, GRS-053, GRS-065, GRS-086, CWR-006, CWR-026, CWR-029, UF-058]
unblocks: [F3-395]
acceptance_criteria:
  - "Add widget offers Active goals and Stuck or blocked goals under Goals and Verification and repair status and Certification state under Workflows, after the Usage sections, and Usage's widget.alert_thresholds in its Usage place; no other widget, board, engine, layout key, command or event is added."
  - "A Home board with no saved copy in a project shows the five first and in the stated order; a saved Home board is not rewritten to add them; Metrics, Monitoring, the Dashboard starter, the Usage room sets, custom dashboards and Agents are unchanged."
  - "Removing any of the five is one ordinary cmd.widget.remove naming the board; Add widget offers it again, and Reset widgets restores the whole default set."
  - "Active goals lists visible active Goals as working or waiting; Stuck or blocked goals lists blocked Goals with their blocked reason and omits waiting, paused and stopped Goals; neither shows a Goal phase, budget, role, verification, repair or certification state, and invisible internal Goals never appear."
  - "Verification and repair status reads Review runs' completion projection and re-run comparison counts, and Certification state reads workflow-owned certification decisions; neither is ever shown as a Goal's, and neither widget starts, repairs, approves or certifies anything."
  - "On an application board the Goals widgets read application Goals and Certification state shows its owner's Project-only reason instead of an empty result."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: dashboard_default_widget_drift
reasoning_tier: high
context_scope: lost_rules_dl477_20261112
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/Goal_Runtime_System.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0068
  - "Plans/Decision_Log.md#DL-477 (Jared 2026-11-12, relayed by pm7-build 1112155957-694d)"
  - /mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/lost-rules/BRIEF.md
preserved_exact_tokens:
  - "I believe those would be widgets on the dashboards that the user can put on there. Maybe those ones default to on there and the user can remove them."
  - "Dashboard"
  - "active goals"
  - "stuck goals"
  - "certification state"
  - "cost"
  - "Active goals"
  - "Stuck or blocked goals"
  - "Verification and repair status"
  - "Certification state"
  - "Cost and budget warnings"
  - "goals:active"
  - "goals:stuck"
  - "workflows:review-status"
  - "workflows:certification-state"
  - "widget.alert_thresholds"
negative_constraints:
  - Do not add a widget model, board, engine, layout key, command, event or second catalogue for these widgets.
  - Do not show a Goal phase, budget, role, verification, repair or certification state.
  - Do not rewrite a saved board to add default widgets.
  - Do not let these widgets start, approve, repair, certify, resume or stop anything.
owner_boundary_notes:
  - "Goal_Runtime_System owns Goal records, lifecycle and continuation; Collaborative_Workflows owns Review runs; the workflow that owns a certification step owns its decision (GRS-065); usage-feature.md owns widget.alert_thresholds and Home's Usage widgets; FinalGUISpec F3-638 owns the dashboard tab; this unit owns only the widgets' hostability, catalogue entries, default placement and removal."
owner_hints:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md#F3-638
  - Plans/Goal_Runtime_System.md
  - Plans/Collaborative_Workflows.md
  - Plans/usage-feature.md#UF-058
```

ContractRef: ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/Goal_Runtime_System.md#GRS-048, ContractName:Plans/Collaborative_Workflows.md#CWR-029, ContractName:Plans/usage-feature.md#UF-058
