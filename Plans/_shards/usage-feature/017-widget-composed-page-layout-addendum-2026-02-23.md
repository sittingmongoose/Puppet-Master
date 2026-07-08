# Shard 017: Widget-Composed Page Layout (Addendum -- 2026-02-23)

Source: `Plans/usage-feature.md`

Source lines: L759-L864

Source SHA256: `72bdae3668eee969c2de469ca4d8ce227c67636de732ddbee56c90f385d2122e`

---

## Widget-Composed Page Layout (Addendum -- 2026-02-23)

### Scope of This Addendum

This section extends the Usage page from a static layout to a **fully widget-composed, grid-based page** using the Widget System defined in Plans/Widget_System.md. The Usage page is a required, dedicated top-level page. Every content area on the Usage page is a widget.

ContractRef: ContractName:Plans/Widget_System.md

### Usage Page is Widget-Composed

The Usage page MUST be composed entirely of widgets from the widget catalog (Plans/Widget_System.md section 2). There is no static/fixed content area -- every panel, chart, and table is a widget that can be moved, resized, and configured.

Users can:
- **Move** widgets within the grid (drag-and-drop).
- **Resize** widgets by grid spans (drag widget edge, grid-snapping per Plans/Widget_System.md section 3).
- **Configure** each widget individually (gear icon for time window, platform filter, chart type, etc.).
- **Add** new widgets from the catalog via the add-widget flow.
- **Remove** widgets they don't want to see.

ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/Widget_System.md#4

### Default Widget Layout (4-column grid)

The Usage page ships with this default layout. No page starts empty. Users can customize after first load.

### Analytics signal contract

Usage analytics consumers interpret grep/Search acceleration through `tool.invoked.index_used`: `true` counts queries served by sparse-n-gram candidate narrowing, while `false` counts raw ripgrep fallback or another unindexed path.

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.quota_summary` | 2x1 | 5h/7d usage bars per platform with plan type |
| 2 | 0 | `widget.alert_thresholds` | 2x1 | Approaching-limit warnings and threshold status |
| 0 | 1 | `widget.analytics_chart` | 2x2 | Aggregate usage over time (bar/line/area chart) |
| 2 | 1 | `widget.budget_donuts` | 2x2 | Donut charts for budget consumption per platform |
| 0 | 3 | `widget.tool_usage` | 2x2 | Tool invocation count, latency (p50/p95), error rate, and grep/Search `index_used` fallback mix |
| 2 | 3 | `widget.multi_account` | 2x2 | Per-platform account list, active account, cooldown state |
| 0 | 5 | `widget.ledger_table` | 4x3 | Event-level usage/token/cost ledger with filtering |

### Grid-Based Resizing

- Uses the grid system from Plans/Widget_System.md section 3.
- Column count is responsive: 2 columns (<1200px), 3 columns (1200-1600px), 4 columns (>1600px) per Plans/FinalGUISpec.md section 12.3.
- Each widget can be independently resized within its declared min/max grid constraints.
- Resizing a widget can affect what data it shows: e.g., a wider `widget.analytics_chart` shows more time granularity, a taller `widget.ledger_table` shows more rows.

ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/FinalGUISpec.md#12.3

### Per-Widget Configuration

Each Usage widget has a gear icon in its header for per-widget configuration. Examples:

| Widget | Config Options |
|--------|---------------|
| `widget.quota_summary` | Time window (5h/7d), platforms to display |
| `widget.analytics_chart` | Time window (5h/7d/24h/custom), chart type (bar/line/area), platforms to include |
| `widget.budget_donuts` | Time window, chart style (donut/bar) |
| `widget.tool_usage` | Time window, sort by (count/latency/errors/index_used fallback rate) |
| `widget.ledger_table` | Visible columns, page size, default sort, event type filter |
| `widget.multi_account` | Platforms to show, show cooldown timers (on/off) |

Configuration is persisted alongside the widget layout per Plans/Widget_System.md section 7.

ContractRef: ContractName:Plans/Widget_System.md#5

### Multi-Account Widget as First-Class Catalog Entry
The multi-account widget remains a first-class catalog entry, but it is now a status and observability widget rather than the canonical setup surface.

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

Required content:
- provider entry or server-profile row label
- active/effective marker
- plain-language status (`Working` or a concrete reason)
- internal readiness may still record an `Operational` layer, but the GUI keeps that layer separate from the user-facing status
- pressure/cooldown summary
- source-confidence / stale label where needed
- direct link/action into Agent-Config for setup, validation, or repair

Rules:
- the widget does not replace Agent-Config for account management, billing/entity selection, instruction control, skills, or MCP setup.
- one GitHub Copilot auth-backed row may show a selected organization/billing entity beneath it rather than rendering duplicate top-level rows.
- OpenCode server profiles appear alongside account-backed rows with explicit profile-mode labels.
- the widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### Reuse on Dashboard via Add-Widget Flow

All widgets that appear on the Usage page are **also hostable on the Dashboard**. Users can add any Usage widget to the Dashboard through the add-widget flow (Plans/Widget_System.md section 4):

1. On the Dashboard, click "Add Widget".
2. The catalog overlay shows all Dashboard-compatible widgets, including all Usage widgets.
3. Select a widget (e.g., `widget.quota_summary`) and click "Add".
4. The widget appears on the Dashboard grid with its default size.
5. Configure and resize as needed.

This means users can build a Dashboard that includes usage information alongside orchestrator status and other widgets, without needing to navigate to the Usage page.

ContractRef: ContractName:Plans/Widget_System.md#4

### Cross-References

- Plans/Widget_System.md -- grid system (section 3), widget catalog (section 2), add-widget flow (section 4), layout persistence (section 7)
- Plans/Multi-Account.md -- multi-account data model and GUI requirements
- Plans/FinalGUISpec.md -- responsive grid (section 12.3), existing Usage view (section 7.8)
- Plans/storage-plan.md -- redb rollup keys for usage data
