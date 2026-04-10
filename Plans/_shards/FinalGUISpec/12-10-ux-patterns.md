## 10. UX Patterns

Section 10 defines reusable interaction patterns across pages, panels, dialogs, and editor/runtime surfaces.

### 10.1 Confirmation dialogs

Destructive or irreversible actions require confirmation with explicit consequence copy, especially for delete, reset, merge, publish, repository creation, and credential removal flows.

### 10.2 Undo

Support `Ctrl+Z` / `Cmd+Z` where the owning surface allows reversible edits, including file operations that can be safely reverted, text editing, and message editing. Git-native history actions and external side effects are not mislabeled as editor undo.

### 10.3 Loading states

- skeleton screens for panel/page loads
- inline spinners or progress indicators for discrete actions
- keep prior validated content visible with stale/degraded labels when a refresh is in progress

### 10.4 Error display

- inline errors for field validation
- toast notifications for transient non-blocking failures
- blocking dialogs for failures that prevent forward progress or risk destructive ambiguity

### 10.5 Empty states

Empty panels must show helpful onboarding content, clear next actions, and contextual shortcuts instead of blank chrome.

### 10.6 Blocked and recovery surfaces

Blocked state, retry, remediation, and recovery affordances must use the canonical blocked/recovery contract and stay visually distinct from ordinary paused or idle states.

### 10.7 Event-driven refresh rule

Event-driven updates are canonical. UI state refresh happens on relevant runtime, filesystem, or provider events rather than generic timers.

Exception:
- polling is acceptable for external systems that do not provide push updates, such as GitHub Actions status checks; those intervals are freshness aids only and must not become the correctness model for the rest of the shell

### 10.8 Human-in-the-loop approvals

Sensitive operations requiring approval must present:
- explicit action summary
- affected resources
- approval / deny actions
- audit trail link back to the originating thread, run, or bundle

Approval surfaces must preserve context and never auto-approve hidden follow-up side effects.

### 10.9 Context menus and clipboard

Context menus are the canonical discoverability surface for copy, paste, Add Note, file actions, and selection-scoped operations.

#### 10.9.1 Copy path and copy value

Non-text path/value copy actions must copy the exact underlying value via the shared clipboard helper and must not depend on text rendering quirks.

#### 10.9.2 Text selection and read-only copy

Read-only text, code blocks, logs, and labels must remain selectable and copyable without entering edit mode.

#### 10.9.3 Clipboard safety and feedback

Clipboard actions should provide lightweight success feedback for non-obvious values and must never copy redacted or hidden-secret placeholders as though they were the real value.

### 10.10 LSP-informed affordances
This section consumes the linked owner contract and stays aligned with it.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope; `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` requires `path` + `position` + `newName` with approval gating.

Fields:
- operation
- query
- path
- position
- newName
- status

Labels and values:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- rename

Rules:
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
### 10.11 Loading-to-live transitions

When moving from placeholder to real data, preserve layout footprint and focus so the interface does not jump unexpectedly.

### 10.12 Detached-surface continuity

Detached panels and windows must preserve identity, selection, and keyboard focus expectations when re-docked.

### 10.13 Sound effects

Optional sound effects may reinforce key workflow events such as approvals required, run completion, or error escalation, but they must remain user-controllable, accessible, and never the sole carrier of important information.

