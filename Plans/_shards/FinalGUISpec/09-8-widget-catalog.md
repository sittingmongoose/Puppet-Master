## 8. Widget Catalog

All widgets read from `Theme.*` globals rather than hardcoded colors. Each widget must support all four theme variants.

### 8.1 Core Widgets

| Widget | Purpose | Key Properties |
|--------|---------|---------------|
| **StyledButton** | Primary/Secondary/Danger/Warning/Info/Ghost buttons | variant, label, icon, enabled, loading (spinner), onClick callback |
| **StyledInput** | Themed text inputs | placeholder, value, variant (text/password/number), onChanged callback |
| **ComboBox** | Dropdown selection | items (model), selected-index, onSelected callback. **Used for platform and model selection** |
| **SelectableText** | Read-only selectable text — implemented as `TextInput { read-only: true }` (single-line) or `TextEdit { read-only: true }` (multi-line). Slint's `read-only` mode preserves native OS text selection and Ctrl+C copy; no custom clipboard glue required. | text, wrap-mode, font-size, color |
| **StatusBadge** | Status dots and colored badges | status (running/paused/error/complete/idle), label, size |
| **ProgressBar** | Animated progress bars | value (0.0-1.0), variant (phase/task/subtask), animated |
| **Terminal** | Terminal output display | lines (VecModel), auto-scroll, max-lines, color-coding by line type |
| **Modal** | Modal dialogs | title, content, variant (confirm/error/info), onConfirm/onCancel |
| **Toast** | Toast notifications | message, variant (success/error/warning/info), duration, dismissible |
| **PanelCard** | Paper-texture panels | title, collapsible, collapsed, drag-handle, content slot |
| **HelpTooltip** | "?" icon with contextual help | text, position (top/bottom/left/right) |
| **PageHeader** | Page title + action buttons | title, subtitle, actions slot |
| **ContextMenu** | Copy/paste/select-all context menu | items (VecModel), position, onSelect |
| **BudgetDonut** | Donut chart for usage | used, total, label, color |
| **UsageChart** | Bar chart for usage data | data points (VecModel), labels |
| **ActivityBar** | Vertical icon nav | items (VecModel), active-index, onSelect, reorderable |
| **StatusBar** | Bottom status strip | mode, platform, model, context-usage, status. When LSP is active (Plans/LSPSupport.md), **status** includes LSP server name and state (e.g. "rust-analyzer: Ready" or "Initializing..." / "Error: ...") for the current editor context. |
| **Breadcrumb** | Navigation breadcrumb | items (VecModel), onNavigate |
| **CommandPalette** | Fuzzy search overlay | commands (VecModel), filter, onSelect |
| **PixelGridOverlay** | Pixel grid effect | opacity, spacing, color |
| **PaperTextureOverlay** | Paper grain texture | opacity |
| **StepCircle** | Step indicator circles | step-number, status (active/complete/pending) |
| **Icon** | SVG icon system | icon-type (~50 types), size, color |
| **InterviewPanel** | Interview progress side panel | phase, progress, current-question |

### 8.2 Button State Feedback

Every `StyledButton` must support the following visual states:

| State | Visual | Behavior |
|-------|--------|----------|
| **Default** | Normal styling per variant | Clickable |
| **Hover** | Lightened background (`btn-hover`) | Cursor: pointer |
| **Active/Pressed** | Darkened, inset shadow | During click |
| **Loading** | Spinner icon replaces or joins label; button disabled | During async operation |
| **Disabled** | Muted colors, no shadow | Not clickable; cursor: not-allowed |
| **Success** | Brief green flash or checkmark icon (500ms) | After successful operation completes |
| **Error** | Brief red flash (500ms) | After operation fails |

**Implementation:** `StyledButton` has `in property <bool> loading` and `in property <ButtonState> state` that controls visual presentation. The Rust backend sets `loading: true` when an async action starts and `loading: false` + brief `state: success` when it completes.

### 8.3 Toggle State Synchronization

All toggles and stateful controls that reflect server/backend state (e.g., Login/Logout, Install/Uninstall, manual-path enable) must:
1. Update immediately when the backend state changes (via `invoke_from_event_loop`)
2. Show a loading state during the transition (e.g., "Logging in..." spinner)
3. Never show stale state -- if an auth/install/path validation check is in progress, show a spinner, not stale state
4. Use Slint's reactive property system: backend writes to a shared property, UI automatically reflects

---

