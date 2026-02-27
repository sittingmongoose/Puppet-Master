## 16. Migration Mapping

### 16.1 Iced View to Slint Location

| Current Iced View | New Slint Location | Notes |
|-------------------|-------------------|-------|
| `dashboard.rs` | `views/dashboard.slint` (Home group) | Add rearrangeable card grid, 4-split terminal |
| `projects.rs` | `views/projects.slint` (Home group) | Minimal changes |
| `wizard.rs` | `views/wizard.slint` (Run group) | Add agent activity pane, intent selection |
| `interview.rs` | `views/interview.slint` (Run group) | Also available as Chat mode |
| `tiers.rs` | `views/tiers.slint` (Run group) | Minimal changes |
| `config.rs` | **Merged into** `views/settings.slint` (Settings group) | Tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML |
| `settings.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: General |
| `login.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Authentication |
| `doctor.rs` | **Merged into** `views/settings.slint` (Settings group) | Tab: Health |
| `setup.rs` | `views/setup.slint` (Run group) | Minimal changes |
| `metrics.rs` | `views/metrics.slint` (Data group) | Minimal changes |
| `evidence.rs` | `views/evidence.slint` (Data group) | Minimal changes |
| `evidence_detail.rs` | `views/evidence_detail.slint` (Data group) | Minimal changes |
| `history.rs` | `views/history.slint` (Data group) | Minimal changes |
| `ledger.rs` | `views/ledger.slint` (Data group) | Minimal changes |
| `memory.rs` | `views/memory.slint` (Data group) | Minimal changes |
| `coverage.rs` | `views/coverage.slint` (Data group) | Minimal changes |
| `not_found.rs` | `views/not_found.slint` | Minimal changes |
| (new) | `views/usage.slint` (Data group) | New page |
| (new) | `views/file_editor.slint` (Primary content) | New page |
| (new) | `views/agent_activity.slint` (Embedded) | New component |
| (new) | `panels/chat_panel.slint` (Side panel) | New panel |
| (new) | `panels/file_manager_panel.slint` (Side panel) | New panel |

### 16.2 Widget Migration

All 25 current Iced widgets map to Slint equivalents. Key differences:
- **Canvas-based widgets** (pixel_grid, paper_texture, step_circle, budget_donut, usage_chart): Use `SharedPixelBuffer` + `Image` instead of Iced's `canvas::Program`
- **text_editor::Content** (for read-only terminal/log display): Use Slint's `TextEdit` (read-only mode) or custom `ListView` with styled text lines
- **Subscriptions** (50ms polling): Replace with event-driven `invoke_from_event_loop`
- **Context menu:** Custom implementation (Slint has no built-in)
- **Animations** (page transitions, pulsing status dots): Use Slint's property transitions and `animate` keyword
- **Dynamic scaling** (UI scale 0.75-1.5): Use Slint's native global/window scale factor as the only scaling path; do not port Iced token-multiplication layers into Slint view code

ContractRef: ContractName:Plans/Contracts_V0.md#8, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

### 16.3 Data Type Preservation

All current data types (AppTheme, Page, CurrentItem, ProgressState, OutputLine, BudgetDisplayInfo, DoctorCheckResult, etc.) remain in Rust. Only their Slint representations (via properties and models) change. The backend event system, orchestrator state, and persistence remain unchanged.

<a id="16.4"></a>
### 16.4 Clipboard Migration Gate

Clipboard migration gate status is **PASS** only when all required criteria below are true.

**Pass/Fail criteria (all REQUIRED):**
- [ ] Native Copy/Paste/Select All behavior works in File Editor input, chat composer input, and terminal command input (if editable).
- [ ] Read-only terminal/log output supports selection/copy and does not accept editable paste behavior.
- [ ] No custom text-widget clipboard handler remains in the migration target.
- [ ] Non-text copy exceptions remain explicitly scoped to `ClipboardHelper` path/value contexts only.
- [ ] Rebuild branch passes type/build verification.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, SchemaID:Spec_Lock.json#locked_decisions.ui

**Verification command (build):**
```bash
cd puppet-master-rs
cargo check
```

**Scenario checklist (manual or automated GUI harness):**

| Scenario | Expected result |
|----------|-----------------|
| Editor clipboard shortcuts + context menu | Ctrl/Cmd+A/C/X/V and context Copy/Paste/Select All behave natively |
| Chat composer clipboard shortcuts + context menu | Same behavior and parity as editor |
| Terminal command input clipboard actions | Native clipboard behavior on editable command input |
| Terminal/log read-only output copy/paste behavior | Selection/copy works; paste is not treated as editable insertion |
| Non-text Copy Path/Copy Value | Clipboard receives exact path/value via `ClipboardHelper` only |

---

