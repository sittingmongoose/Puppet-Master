## Appendix C: Dashboard Widget Grid and Widget Catalog Integration (Addendum -- 2026-02-23)

This appendix extends the Dashboard (section 7.2) from a rearrangeable card grid to a full widget grid with grid-based resizing, and introduces the add-widget flow for the Dashboard.

### C.1 Dashboard Upgrade: Card Grid to Widget Grid

The Dashboard (section 7.2) is upgraded from a simple rearrangeable card grid (drag-to-swap, fixed card sizes) to a full **widget grid** with grid-based resizing:

**What changes from section 7.2:**
- Cards become **widgets** from the widget catalog (Plans/Widget_System.md section 2). Each widget has configurable `col_span` and `row_span`.
- Drag-to-swap is upgraded to **drag-to-reorder** within the grid. Widgets can also be **resized** by dragging their edges (grid-snapping, per Plans/Widget_System.md section 3).
- Grid system follows Plans/Widget_System.md section 3: responsive column counts (2 at <1200px, 3 at 1200-1600px, 4 at >1600px per section 12.3).
- Widget gutters: 8px (MD spacing token) between widgets.

**What stays the same from section 7.2:**
- All existing Dashboard card types remain as default widgets.
- The card visual style is preserved: paper texture on retro themes, drag handle (4px crosshatch pattern in top-left corner), elevated surface for CtA cards with accent-left-border.
- CtA (Calls to Action) behavior: HITL approval, run interrupted, rate limit, warning, and `wizard_attention_required` cards function identically (see §7.2 for full specs).
- Persistence location changes from `dashboard_layout:v1` to `widget_layout:v1:dashboard` (see section C.5 for migration).

ContractRef: ContractName:Plans/Widget_System.md#3

### C.2 Default Dashboard Widget Layout

The default layout preserves the current section 7.2 card set, mapped to Widget Catalog IDs:

| Col | Row | Old Card Name (section 7.2) | Widget Catalog ID | Default Size |
|-----|-----|---------------------------|-------------------|-------------|
| 0 | 0 | Orchestrator Status | `widget.orchestrator_status` | 2x1 |
| 2 | 0 | Current Task | `widget.current_task` | 2x1 |
| 0 | 1 | Progress | `widget.progress_bars` | 4x1 |
| 0 | 2 | Calls to Action | `widget.cta_stack` | 2x2 |
| 2 | 2 | Terminal Output | `widget.terminal_output` | 2x2 |
| 0 | 4 | Interview Panel | `widget.interview_panel` | 1x2 |
| 1 | 4 | Error Display | `widget.error_display` | 1x2 |
| 2 | 4 | Platform Quota | `widget.budget_donuts` | 2x2 |

This matches the current Iced Dashboard layout. On first load, this default is applied. Users can then customize.

ContractRef: ContractName:Plans/Widget_System.md#6.3

### C.3 Add-Widget Flow on Dashboard

The Dashboard has an explicit **"Add Widget"** control:
- **Location**: floating action button in the bottom-right corner of the Dashboard grid area, or in a Dashboard toolbar.
- **Behavior**: opens the Widget Catalog overlay (Plans/Widget_System.md section 4.2) filtered to Dashboard-compatible widgets.
- **Available widgets**: all widgets from the catalog whose "Hostable Pages" includes "Dashboard" -- this includes Usage widgets (`widget.quota_summary`, `widget.budget_donuts`, `widget.analytics_chart`, `widget.tool_usage`, `widget.multi_account`, etc.), Orchestrator Progress widgets (`widget.orchestrator_status`, `widget.current_task`, `widget.progress_bars`, etc.), and others.
- **On add**: widget placed at next available grid position with its default size. Layout persisted immediately.

This enables users to build a customized Dashboard that includes usage information, orchestrator progress, and other data -- all from a single surface.

ContractRef: ContractName:Plans/Widget_System.md#4

### C.4 Widget Catalog vs. Core Widget Catalog

Two distinct catalogs now exist. To avoid confusion:

- **Section 8 of this document** (FinalGUISpec Widget Catalog) = **atomic UI components**: StyledButton, StyledInput, StyledBadge, TreeView, CodeBlock, and other building-block primitives. These are reusable across all views and are NOT page widgets.
- **Plans/Widget_System.md section 2** = **composed page widgets**: OrchestratorStatus, BudgetDonuts, TierTree, LedgerTable, and other content panels built FROM atomic components. These are the widgets users can add/remove/move/resize on the Dashboard, Usage page, and Orchestrator tabs.

The relationship: page widgets (Widget_System.md) are composed of atomic components (FinalGUISpec section 8).

### C.5 redb Key Migration

The existing `dashboard_layout:v1` redb key (section 15.1) stores a simple card-order list. The new widget layout system uses a richer schema. Migration strategy:

1. **On first load** after the widget system upgrade:
   - Check if `dashboard_layout:v1` exists and `widget_layout:v1:dashboard` does NOT exist.
   - If so: read the card ID list from `dashboard_layout:v1`, map each card ID to its corresponding Widget Catalog ID (per the table in C.2), assign default grid positions and sizes, and write the result as `widget_layout:v1:dashboard`.
   - Keep `dashboard_layout:v1` as backup (do NOT delete it).
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
