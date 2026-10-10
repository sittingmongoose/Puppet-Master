# Shard 029: Appendix C: Dashboard Widget Grid and Widget Catalog Integration (Addendum -- 2026-02-23)

Source: `Plans/FinalGUISpec.md`

Source lines: L4317-L4407

Source SHA256: `89af5d625a93f858e09bc08d43719674417e38d5c55a34e9f6e16b5befe66d81`

---

## Appendix C: Dashboard Widget Grid and Widget Catalog Integration (Addendum -- 2026-02-23)

This appendix extends the Dashboard (section 7.2) from a rearrangeable card grid to a full widget grid with grid-based resizing, and introduces the add-widget flow for the Dashboard.

Amended 2026-10-09 (DL-180, DL-184): a dashboard is now a tab kind and several boards may be open (F3-638); a dashboard tab can show every Usage widget, Orchestrator widgets after that page's redesign, so C.4's four-entry named catalogue and C.4.1's limit no longer bind dashboard tabs (`Plans/usage-feature.md#UF-062`, `Plans/Widget_System.md#WS-030`); C.1's window-width columns yield to the tab's own width (F3-636, F3-638); and the call-to-action cards' accent-left-border is retired (F3-648). The sentences below that said otherwise are amended in place.

### C.1 Dashboard Upgrade: Card Grid to Widget Grid


The Dashboard (section 7.2) is upgraded from a simple rearrangeable card grid (drag-to-swap, fixed card sizes) to a full **widget grid** with grid-based resizing:

**What changes from section 7.2:**
- Cards become **widgets** from the widget catalog (Plans/Widget_System.md section 2). Each widget has configurable `col_span` and `row_span`.
- Drag-to-swap is upgraded to **drag-to-reorder** within the grid. Widgets can also be **resized** by dragging their edges (grid-snapping, per Plans/Widget_System.md section 3).
- Grid system follows the Usage widget board inside the dashboard tab; its column count follows the tab's own width, never the window (amended 2026-10-09, DL-180; F3-638, WS-030; the window-width counts of section 12.3 are lineage).
- Widget gutters: 8px (MD spacing token) between widgets.

**What stays the same from section 7.2:**
- All existing Dashboard card types remain as default widgets.
- The card visual style is preserved: paper texture on retro themes, drag handle (4px crosshatch pattern in top-left corner), elevated surface for CtA cards (the accent-left-border is retired, amended 2026-10-09, DL-184; F3-648).
- CtA (Calls to Action) behavior: HITL approval, run interrupted, rate limit, warning, and `wizard_attention_required` cards function identically (see §7.2 for full specs).
- Persistence location changes from `dashboard_layout:v1` to `widget_layout:v1:dashboard` (see section C.5 for migration).

ContractRef: ContractName:Plans/Widget_System.md#3

### C.2 Default Dashboard Widget Layout

The default dashboard layout includes:
- **widget-orchestrator-progress** (ID: `orch-progress-v1`): Shows current run progress, node execution status, and lane state.
- **widget-active-lanes** (ID: `lanes-view-v1`): Lists active lanes and worktree allocation state.
- **widget-recent-results** (ID: `results-v1`): Shows recent execution results and artifact links.

### C.3 Add-Widget Flow on Dashboard

Users add widgets via:
1. Dashboard menu → "Add Widget"
2. Select from named widget catalog (see C.4)
3. Confirm placement and sizing
4. Widget appears on dashboard with default configuration

### C.4 Widget Catalog vs. Core Widget Catalog

The current **named widget catalog** includes:
- `widget-orchestrator-progress`: Orchestrator progress view (Puppet Master native).
- `widget-active-lanes`: Active lane browser (Puppet Master native).
- `widget-recent-results`: Recent result summary (Puppet Master native).
- `widget-custom-metrics`: User-defined metric display (user-generated, optional).

**Core widgets** are Puppet Master-owned and part of the default installation. **Custom widgets** are user-generated and optional.

Widget_System consumes this named catalog directly; it does not invent new widget IDs or synthesize missing entries.

### C.4.1 Larger Widget Library Compatibility Note

Earlier Appendix C drafts listed a broader `widget.*` library, including Usage widgets (`widget.quota_summary`, `widget.budget_donuts`, `widget.analytics_chart`, `widget.tool_usage`, `widget.multi_account`, etc.) and Orchestrator Progress widgets (`widget.orchestrator_status`, `widget.current_task`, `widget.progress_bars`, etc.). That list is compatibility/candidate-library lineage only for Dashboard hosting. It is not the Dashboard named catalog, and it does not authorize Widget_System to invent IDs. A Dashboard widget outside the four named entries in C.4 must be promoted by its owning doc before it becomes selectable. Promoted 2026-10-09 (DL-180): every Usage widget is selectable in a dashboard tab (UF-062, F3-638, WS-030); Orchestrator widgets follow after that page's redesign.

Dashboard customization still uses the explicit **"Add Widget"** control from C.3, including menu, floating action button, or toolbar entrypoints, but the selectable set is the named catalog unless an owner promotes a new dashboard widget.

ContractRef: ContractName:Plans/Widget_System.md#4

### C.4.2 Widget Catalog vs. Core Widget Catalog

Two distinct catalogs now exist. To avoid confusion:

- **Section 8 of this document** (FinalGUISpec Widget Catalog) = **atomic UI components**: StyledButton, StyledInput, StyledBadge, TreeView, CodeBlock, and other building-block primitives. These are reusable across all views and are NOT page widgets.
- **Plans/Widget_System.md section 2** = **composed page widgets**: OrchestratorStatus, BudgetDonuts, NodeTree, LedgerTable, and other content panels built FROM atomic components. These are the widgets users can add/remove/move/resize on the Dashboard, Usage page, and Orchestrator `Progress` only.

The relationship: page widgets (Widget_System.md) are composed of atomic components (FinalGUISpec section 8).

### C.5 redb Key Migration


The existing `dashboard_layout:v1` redb key (section 15.1) stores a simple card-order list. The new widget layout system uses a richer schema. Migration strategy:

1. **On first load** after the widget system upgrade:
   - Check if `dashboard_layout:v1` exists and `widget_layout:v1:dashboard` does NOT exist.
   - If so: read the card ID list from `dashboard_layout:v1`, map each card ID to its corresponding named Widget Catalog ID from C.4, assign default grid positions and sizes, and write the result as `widget_layout:v1:dashboard`.
   - Treat `dashboard_layout:v1` as deprecated migration input only; it does not remain canonical after migration completes.
2. **Future reads** use `widget_layout:v1:dashboard` only.
3. If both keys exist, `widget_layout:v1:dashboard` takes precedence.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Widget_System.md#7

### C.6 References (Appendix C)

- Plans/Widget_System.md -- widget catalog, grid system, add-widget flow, layout persistence
- Section 7.2 of this document -- Dashboard (original card grid specification)
- Section 8 of this document -- Core Widget Catalog (atomic UI components)
- Section 12.3 of this document -- Dashboard grid responsive breakpoints
- Section 15.1 of this document -- redb persistence for dashboard layout
- Plans/storage-plan.md -- redb namespaces
