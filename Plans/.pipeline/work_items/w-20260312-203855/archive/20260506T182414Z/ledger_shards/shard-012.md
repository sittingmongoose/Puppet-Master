```json
{
  "c2_shard": "c2-shard-012",
  "inventory_id": "inv-c2-20260505-W02-i012",
  "source": "working_ledger.md",
  "source_full_path": "/mnt/Cursor/Puppet Master/Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md",
  "line_start": 2201,
  "line_end": 2400,
  "line_count": 200
}
```

---

  - project/dashboard interaction docs
  - widget/projection contracts
  - glossary/help/labels for lane/worktree terminology

## Research Progress - 2026-03-16 - Terminology Decision

### Confirmed decision
- `Source Control` stays `worktree-first`.

### Implications
- Source Control should keep `Worktrees` as the primary subview/object list rather than flipping to a lane-first list.
- Orchestrator should remain package/seam/lane-first and treat worktrees as backing execution assets shown in context.
- The surfaces therefore stay intentionally asymmetric:
  - Orchestrator = package/governance/execution truth
  - Source Control = concrete Git/worktree inspection and mutation surface

### Recommended UI contract from this decision
- Source Control worktree rows remain concrete and filesystem/Git oriented, but must show enough orchestration metadata to prevent isolation drift:
  - owning package
  - owning lane
  - run reference when relevant
  - lifecycle state
  - blocked/recovery state when relevant
- Orchestrator should not mirror a raw worktree inventory table.
- Orchestrator should instead show:
  - lane/worktree summary in package context
  - worktree health/state badges
  - deep links into Source Control for Git-native operations

### Terminology guardrail
- Do not rename Source Control objects so aggressively that `worktree` becomes hidden or secondary there.
- `Lane` is important for runtime/governance modeling, but in Source Control it should appear as ownership/context metadata for a worktree, not replace worktree as the primary object.

### Follow-on doc impact
- `Plans/GitHub_Integration.md`
  - likely keep `Worktrees` subview name and worktree-row-first structure
  - enrich row metadata with package/lane/run ownership and lifecycle state
- `Plans/Orchestrator_Page.md`
  - make package/lane state primary
  - keep worktree references contextual, actionable, and deep-linkable
- `Plans/FinalGUISpec.md`
  - preserve Source Control as Git/worktree-first
  - sharpen the asymmetry explicitly so Orchestrator does not regress into a duplicate worktree manager

## Research Progress - 2026-03-16 - Source Control Panel Constraint

### Confirmed constraint
- The `Source Control` panel is narrow/small and should be treated as a constrained side-panel surface, not a broad information canvas.

### Implications
- Source Control rows and tabs must stay information-dense but selective.
- Do not assume package/lane/run/worktree metadata can all be shown at full fidelity at once in the panel.
- Prefer:
  - one strong primary line
  - compact status chips/icons
  - expandable row/detail affordances
  - deep-link out to wider surfaces when context gets too large
- This reinforces the surface split:
  - Source Control = compact Git/worktree operational panel
  - Orchestrator = broader operational/governance surface with more room for context

## Research Progress - 2026-03-16 - Widget System Contract

### Targeted docs read
- `Plans/Widget_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`

### Key findings
- `Plans/Widget_System.md` is still heavily aligned to the older orchestrator model:
  - widget catalog is tier-centric
  - `widget.tier_tree` is still canonical for `Orch/Tiers`
  - `widget.current_task`, `widget.completed_prose`, and `widget.agent_terminal` all read as tier/task/subtask oriented
  - push contracts are wired directly to older event names like `TierChanged`, `IterationStart`, and `Progress`
- The doc still assumes multiple Orchestrator tabs are widget-composed pages:
  - persistence keys exist for `orchestrator:progress`, `orchestrator:tiers`, `orchestrator:evidence`, `orchestrator:history`, and `orchestrator:ledger`
  - add/remove/move/resize behavior is described for generic "Orchestrator tabs"
- This now conflicts with current rewrite direction:
  - `Progress` is the widget-hosting tab
  - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are fixed-purpose tabs with stronger native layouts and interaction contracts
  - `Node Graph` is explicitly not a widget
  - `Evidence` has separate evidence/artifact panes
  - `History` and `Ledger` stay distinct for chronology vs exact record inspection

### Recommended widget boundary
- Recommended rule:
  - widgets are allowed on:
    - `Dashboard`
    - `Usage`
    - `Orchestrator / Progress`
  - widgets are not the composition model for:
    - `Orchestrator / Seams`
    - `Orchestrator / Node Graph`
    - `Orchestrator / Evidence`
    - `Orchestrator / History`
    - `Orchestrator / Ledger`
- Practical implication:
  - those non-Progress tabs may internally use reusable view components, but they should not expose general add/remove/move/resize widget behavior
  - only `Progress` should behave like a widget canvas on the Orchestrator page

### Stable data-contract direction
- Recommended rule:
  - widgets must consume stable orchestrator projections and canonical record/query contracts
  - widgets must not define meaning by subscribing directly to legacy event names or tier-specific objects
- Example shift:
  - from `TierChanged` / `IterationStart` / `TierTree`
  - toward projections such as:
    - current run summary
    - current activity projection
    - attention/blocker projection
    - seam health projection
    - package activity projection
    - promotion queue projection
    - lane/worktree projection
    - account/usage pressure projection
    - recent major events projection
- This matters because the widget layer should not have to relearn seam/package/node/lane semantics independently.

### Widget filter / persistence direction
- Strong recommendation:
  - distinguish `page/tab filters` from `widget presentation config`
  - widget config may control presentation and local emphasis
  - widget config must not invent alternate scoping semantics that diverge from the tab's canonical projection rules
- Example:
  - acceptable widget config:
    - compact vs expanded view
    - item count
    - sort mode
    - whether to show durations or cost
  - risky widget config:
    - custom object model
    - custom state classification rules
    - widget-local definitions of blocked/completed/integration status

### Hostability direction
- Current rewrite direction already implies a narrower hostability policy:
  - many `Progress` widgets may also be hostable on `Dashboard`
  - non-Orchestrator widgets should not be hostable on the Orchestrator page
  - not every Orchestrator tab surface should become a portable widget
- Recommendation:
  - `Dashboard` can host a curated subset of `Progress` widgets and some `Usage` widgets
  - `Progress` hosts orchestrator operational summary widgets
  - deep inspection surfaces remain non-hostable native tabs

### Persistence impact
- `Plans/Widget_System.md` currently defines layout keys for multiple Orchestrator tabs.
- Likely rewrite direction:
  - keep:
    - `widget_layout:v1:dashboard`
    - `widget_layout:v1:usage`
    - `widget_layout:v1:orchestrator:progress`
  - likely remove or deprecate:
    - `widget_layout:v1:orchestrator:tiers`
    - `widget_layout:v1:orchestrator:evidence`
    - `widget_layout:v1:orchestrator:history`
    - `widget_layout:v1:orchestrator:ledger`
- The fixed tabs will need their own view-state persistence instead:
  - filters
  - selection
  - split positions
  - inspector state
  - last-focused object

### Contradictions / gaps surfaced
- `Plans/Widget_System.md`
  - still assumes a tier-first widget catalog and broad widgetization of Orchestrator tabs.
- `Plans/Orchestrator_Page.md`
  - still describes `Tiers` as a widget-based tab and carries old default layouts.
- `Plans/FinalGUISpec.md`
  - likely still needs explicit cross-reference that only certain pages/tabs are widget-composed.
- There is no sharp current rule yet for:
  - widget-level filters vs tab-level filters
  - widget action scope vs page-native action scope
  - which widgets are hostable where after the seam/package rewrite

### Candidate fixes to carry forward
- Rewrite the widget catalog around current operational summary widgets rather than tier widgets.
- Make `Progress` the only widget-composed Orchestrator tab.
- Move all widget data contracts off legacy tier events and onto stable projections / canonical records.
- Add explicit hostability rules so `Dashboard` and `Progress` can share summary widgets without turning deep inspection tabs into widget canvases.
- Add a rule that page-native semantics win over widget-local semantics.

### Do-not-forget details
- Source Control being a narrow panel reinforces the need to keep widget usage focused on wider surfaces like `Dashboard` and `Orchestrator / Progress`, not as a universal composition strategy everywhere.
- `Node Graph` remains a fixed native surface with right-side inspector, not a widget.
- `History` vs `Ledger` separation should not be undermined by making both "just widget pages."

## Research Progress - 2026-03-16 - Projection Freshness / Stale-Trust Model

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Contracts_V0.md`

### Key findings
- The storage model already establishes the right underlying posture:
  - `seglog` is canonical
