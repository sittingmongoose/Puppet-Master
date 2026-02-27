## 10. UX Patterns

### 10.1 Button Feedback

See §8.2 for full button state specification. Summary:
- Every button that triggers an async operation must show a loading spinner
- Button is disabled during loading to prevent double-clicks
- Brief success/error visual feedback on completion (500ms)
- Never leave a button in loading state indefinitely -- implement timeouts (default 30s)

**Specific button feedback requirements:**

| Button/Action | Loading State | Success Feedback | Error Feedback |
|---------------|--------------|-----------------|----------------|
| Login/Logout | Spinner replaces icon, "Authenticating..." | Badge flips to new auth state, green flash | Red flash, error toast with message |
| Re-authenticate | Spinner + "Checking auth..." badge | Auth state updates to `LoggedIn` with refreshed timestamp | Auth state updates to `AuthExpired` or `AuthFailed`; retry action remains visible |
| Install/Uninstall (Cursor/Claude/Playwright) | Row spinner + state chip `Installing` or `Uninstalling`; action buttons disabled | State chip flips to `Installed` or `Not Installed`; version/path refresh | State chip `Failed` + inline error + retry action |
| Settings save | "Saving..." in header, checkmark on complete | "Saved" fades in header (2s) | Error toast |
| File upload/attach | Progress bar in attachment area | Thumbnail/filename appears | Error toast with "Retry" |
| Run start | Button transitions: "Start" → spinner → "Running" (disabled) | Status badge updates | Error card on dashboard |
| Doctor check | Per-row spinner during check | PASS/FAIL/WARN badge per row | Error badge with message |
| Import/export | Modal with progress bar | Success toast with file path | Error toast with details |
| Clean workspace | Confirm modal → progress bar → "Cleaned X files" toast | Toast with count | Error toast |

**Toggle sync guarantee:** When a toggle is flipped (e.g., auth login/logout, git enable/disable, filter on/off), the toggle must reflect the actual backend state, not just the UI click. Pattern: flip optimistically → call backend → on failure, flip back with error toast. Never leave a toggle in a state that disagrees with the backend.

### 10.2 Loading States

| Context | Loading Indicator |
|---------|------------------|
| Page navigation | Skeleton placeholder or spinner in content area |
| Data fetch (projects, evidence, history) | Skeleton rows or spinner overlay |
| Auth check | Spinner on auth status badge; "LoggingIn..." or "LoggingOut..." text |
| Install/uninstall operation | Spinner on install-state chip; row actions disabled until completion |
| Manual path validation (Cursor/Claude) | "Validating path..." indicator with `Valid`/`Invalid` badge result |
| Multi-account refresh | Spinner on account status chips; active account and cooldown badges refresh on completion |
| Settings save | Button loading state + success toast |
| Orchestrator start | Button loading state; status badge transitions to "Starting..." then "Running" |

### 10.2.1 Canonical Real-Time State Sets

- **Provider auth states:** `LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`.
- **Install states (Cursor CLI, Claude CLI, Playwright runtime):** `Not Installed`, `Installing`, `Installed`, `Uninstalling`, `Failed`.
- **Manual path validation states (Cursor/Claude only):** `Unchecked`, `Validating`, `Valid`, `Invalid`.

### 10.3 Toast Notifications

- 4 variants: success (lime), error (magenta), warning (orange), info (blue)
- Auto-dismiss after configurable duration (default: 4s for info/success, 8s for warning/error)
- Manual dismiss via close button
- Stack in top-right corner; max 3 visible (older ones dismissed)
- Each toast has a unique ID for deduplication

### 10.4 Modal Dialogs

- Variants: confirm (with confirm/cancel), error (with dismiss), info (with OK)
- Dark overlay behind modal (50% opacity)
- Focus trapped within modal when open
- Escape key closes modal
- Used sparingly -- prefer inline feedback over modals

### 10.5 Empty States

Every view must have a meaningful empty state:
- Brief explanation of what the view shows
- Action to populate it (e.g., "Run your first orchestration to see evidence here" with a button)
- Relevant icon consistent with active theme
- No blank pages -- always communicate what the user can do

**Specific empty states:**

| View/Area | Empty State Message | Action |
|-----------|-------------------|--------|
| Dashboard (no project) | "Select or create a project to get started" | "New Project" button |
| Chat (empty thread) | "Start a conversation -- ask questions, plan tasks, or run commands" | Focus composer input |
| Chat (no threads) | "No chat threads yet" | "New Thread" button |
| File Manager (no project) | "Open a project to browse files" | "Select Project" button |
| File Editor (no files open) | "Open a file from the File Manager or click a file path in chat" | None (informational) |
| Usage (no data) | "Usage data will appear after your first run" | None (informational) |
| Evidence (no evidence) | "Evidence logs will appear after orchestration runs" | "Start a run" link |
| Queue (empty) | "No messages queued -- the assistant will process messages as they arrive" | None |
| Terminal (no output) | Blinking cursor on empty dark background | None |
| Agent Activity (idle) | "No active agents -- start a run to see agent activity here" | None |
| Browser (no page) | "No page loaded -- enter a URL or click a link from the chat" | Show bookmarks if any |
| Debug (no config) | "No debug configuration found -- create one to start debugging" | "Create configuration" button |
| Ports (no servers) | "No active ports -- start a dev server to see it here" | None |
| Catalog (empty) | "Catalog is empty -- check your network connection or refresh" | "Refresh" button |
| SSH (no connections) | "No SSH connections configured" | "Add connection" button |

### 10.6 Error States

- Inline error messages for form validation (below the field, accent-magenta text)
- Error toasts for transient failures (network, auth)
- Error cards on Dashboard for orchestrator errors (red border, clear message, retry button)
- Error pages for unrecoverable states (with "Return to Dashboard" button)
- **Auth token expiry:** When a platform auth token expires mid-run, show inline error in chat/terminal ("[!] Claude Code auth expired -- please re-authenticate") with a "Re-authenticate" button that opens the Authentication tab. Do not silently fail.
- **Network disconnection:** If the app detects network loss during a chat or run, show a persistent banner at the top of the primary content area: "Network disconnected -- reconnecting..." with a spinner. Auto-dismiss on reconnection with brief "Reconnected" toast.
- **File operation failures:** When a file save, rename, or delete fails, show a toast with the specific error ("Permission denied: /path/to/file") and a "Retry" button.
- **Large file timeout:** If a file takes >5 seconds to load, show a progress spinner with "Loading large file..." and a "Cancel" button. If it exceeds 15 seconds, show a timeout error with "File too large -- opened in read-only truncated mode."

### 10.7 Onboarding and First-Run Experience

**First launch default layout:**
- Activity Bar (left)
- Dashboard (primary content, center)
- Chat panel (right, collapsed or 30% width)
- No bottom panel

**Three-step interactive tour (non-blocking, one-time):**
1. "This is your Dashboard" -- highlights primary content
2. "This is the Chat" -- highlights side panel
3. "Use the sidebar to navigate" -- highlights activity bar, mentions Ctrl+K

Each step has "Next" and "Skip tour." Completion persisted; tour never repeats.

**Progressive customization:** Layout customization features surface only after user has completed at least one interaction. Subtle gear icon with tooltip "Customize your layout."

**Layout presets before freeform:** Named presets (Focus, Orchestrator, Editor, Monitor) shown first. Custom layouts available after using presets. Up to 5 custom layouts.

### 10.8 HITL Approval UI

When the orchestrator pauses for HITL approval:
- Dashboard shows a CtA card: "Phase X complete -- approval required"
- Card shows completion status, evidence summary
- "Approve & Continue" button (primary/accent)
- "Reject" or "Cancel" button (secondary)
- Can also be addressed via Chat: user types "approve and continue"
- Toast notification when HITL pause occurs
- Status bar shows "Awaiting approval" indicator

### 10.9 Context Menus

Slint does not have a built-in context menu component, so the popup UI is a custom overlay. However, **clipboard operations are fully native** — Slint's `TextInput` and `TextEdit` handle Ctrl+C/V/X/A at the OS level with no custom key handlers required.

**Popup UI (custom):**
- Triggered on right-click via `TouchArea` with `pointer-event` callback
- Positioned at mouse coordinates, adjusted to stay within window bounds
- Dismissed on click outside or Escape
- Styled per theme (retro: hard shadow + sharp corners; basic: subtle border + 4px radius)

**Clipboard items — call Slint built-in functions, no manual state management:**
- **Copy** → calls `element.copy()` on the focused/targeted `TextInput` or `TextEdit`
- **Paste** → calls `element.paste()`
- **Select All** → calls `element.select-all()`
- **Copy Path / Copy Value** (file-manager or read-only label contexts) → reads `element.text` property and writes to clipboard via `ClipboardHelper` Rust callback (only non-text-widget case requiring custom clipboard access)

**What is NOT needed:**
- No custom Ctrl+C/V/X/A keyboard event interceptors
- No manual `clipboard::read()` / `clipboard::write()` for text widgets
- No `read-only` workaround widgets (use `TextInput { read-only: true }` directly)

<a id="10.9.1"></a>
#### 10.9.1 Native Clipboard Contract (Normative)

Text-entry widgets (`TextInput`, `TextEdit`) MUST use Slint-native clipboard and selection behavior for keyboard shortcuts and context-menu actions.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, SchemaID:Spec_Lock.json#locked_decisions.ui, PolicyRule:Decision_Policy.md§2

Implementations MUST NOT route text-widget copy/paste/select-all behavior through custom Rust clipboard read/write handlers.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

Implementations MUST NOT add custom key interception for Ctrl/Cmd+A/C/X/V on text widgets.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

Non-text copy contexts (for example Copy Path / Copy Value) MAY use `ClipboardHelper`, but this exception MUST remain scoped to non-text widgets only.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9, ContractName:Plans/FileManager.md, PolicyRule:Decision_Policy.md§2

<a id="10.9.2"></a>
#### 10.9.2 Clipboard Surface Coverage Matrix

| Surface | Allowed implementation path | Disallowed glue | Required verification |
|---------|-----------------------------|-----------------|-----------------------|
| File Editor input | Slint `TextInput` / `TextEdit` native keyboard + context-menu clipboard actions | Manual clipboard read/write for text widgets; custom Ctrl/Cmd+A/C/X/V interceptors | Verify Ctrl/Cmd+A/C/X/V + Copy/Paste/Select All context actions behave natively |
| Chat composer input | Slint text widget native clipboard behavior | Message-level clipboard rerouting for text input | Verify parity with File Editor shortcuts and context actions |
| Terminal command input (if editable) | Slint editable text widget native clipboard behavior | Custom clipboard manager for text entry | Verify Ctrl/Cmd+A/C/X/V + context actions on terminal command input |
| Terminal/log read-only output | Read-only Slint text widget selection/copy behavior (or equivalent read-only selectable surface) | Paste routed into read-only output; manual text-widget clipboard read/write | Verify selection and copy work; verify paste is not treated as editable insertion in read-only output |
| Non-text copy contexts (path/value) | `ClipboardHelper` callback only for non-text targets | Reusing non-text helper as a general text-widget clipboard path | Verify copied value equals selected path/value source text |

<a id="10.9.3"></a>
#### 10.9.3 Legacy Glue Removal Checklist

Migration readiness checklist for clipboard behavior:
- [ ] Remove manual clipboard read/write handlers used for text widgets.
- [ ] Remove custom Ctrl/Cmd clipboard key interceptors for text widgets.
- [ ] Remove read-only text workaround glue where native Slint read-only text widgets cover the behavior.
- [ ] Remove manual selection-state plumbing implemented only to support text-widget clipboard actions.
- [ ] Keep `ClipboardHelper` usage scoped to non-text copy contexts (path/value).

This checklist MUST be completed before closing clipboard migration tasks in the rebuild queue.
ContractRef: ContractName:Plans/FinalGUISpec.md#10.9.1, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

### 10.10 Truncation with Expand

Long text (file paths, error messages, thinking streams) truncates with "..." and expands on click. All text remains selectable.

### 10.11 Animation and Transition Specifications

All animations use Slint's built-in `animate` directive with consistent timing:

| Category | Duration | Easing | Examples |
|----------|----------|--------|----------|
| **Micro feedback** | 100ms | ease-out | Button press, toggle flip, checkbox tick |
| **Panel transitions** | 200ms | ease-in-out | Panel collapse/expand, sidebar show/hide, tab switch |
| **Overlays** | 150ms (in), 100ms (out) | ease-out / ease-in | Modal appear/dismiss, toast slide-in, context menu popup |
| **Layout shifts** | 250ms | ease-in-out | Dashboard card reorder, panel dock/undock, split resize |
| **Progress** | continuous | linear | Spinner rotation, indeterminate progress bar, streaming indicator |
| **State transitions** | 150ms | ease-out | Status dot color change, auth status update, orchestrator state change |

**Reduced motion:** When system prefers-reduced-motion is active (detected via platform API on startup), replace all animations with instant transitions (0ms duration). Store override in Settings > General as a toggle ("Reduce animations").

**Scroll animations:** Scroll-to-target (e.g., click-to-open from chat) uses 200ms ease-out. Auto-scroll for new content is instant (no animation) to avoid visual delay.

### 10.12 Progress Bars and Indicators

**Determinate progress bar:** Filled bar showing percentage. Height 4px (inline) or 8px (standalone). Color follows status: `Theme.accent-blue` (normal), `Theme.success-green` (complete), `Theme.warning-amber` (paused).

**Indeterminate progress bar:** Sliding highlight animation (1.5s loop, linear). Used when total is unknown (e.g., agent thinking, web search). Same height as determinate.

**Stalled state:** If a progress bar hasn't updated in 30 seconds, change color to `Theme.warning-amber` and show a subtle pulse animation. Tooltip: "Progress stalled -- last update 45s ago."

**Context gauge (chat):** Circular progress (16px diameter) showing context window usage. Color transitions: blue (0-75%), amber (75-90%), red (90-100%). Hover tooltip shows exact token count and percentage.

**Phase/tier progress:** Stepped progress indicator (circles connected by lines). Each circle shows phase/tier state: empty (pending), half-filled (in-progress with spinning edge), filled (complete), X (failed). Connected line fills left-to-right as phases complete.

### 10.13 Sound Effects (MVP)

Audio feedback for key application events. Uses the `rodio` crate for cross-platform audio playback. All sounds are optional and disabled by default.

**Settings > General toggle:** "Sound effects" (default: off). When off, no audio is played. When on, sub-toggles allow per-event control.

**Event-to-sound mapping:**

| Event | Sound | Duration | Notes |
|-------|-------|----------|-------|
| Run complete (success) | Short ascending chime (3 notes) | ~600ms | Plays when any orchestrator run or chat agent run finishes successfully |
| Run complete (failure) | Low descending tone (2 notes) | ~400ms | Plays when a run fails or is cancelled by error |
| HITL approval needed | Gentle bell / notification ping | ~300ms | Plays when an approval prompt appears; does not repeat until dismissed |
| Rate limit hit | Soft warning tone | ~200ms | Plays once per rate-limit event (not on every retry) |
| Error (critical) | Sharp alert tone | ~250ms | Plays on unrecoverable errors (auth failure, crash recovery prompt) |
| Message received | Subtle click / pop | ~100ms | Plays when a new assistant message arrives in an inactive thread (configurable) |
| Timer milestone | Single soft tick | ~100ms | Plays at configurable intervals during long runs (e.g., every 5 minutes). Off by default. |

**Sound file format:** WAV or OGG files bundled with the application in `assets/sounds/`. File size budget: <50KB per sound, <500KB total. Users can replace sound files by placing custom files in `~/.puppet-master/sounds/` with matching filenames (e.g., `run-complete-success.wav` overrides the built-in sound).

**Volume control:** Master volume slider in Settings > General (0-100%, default 50%). Volume respects system volume. No per-event volume controls in MVP.

**Mute behavior:** When the app is minimized to tray, sounds still play (so the user hears run-complete notifications). When system "Do Not Disturb" or equivalent is active, sounds are suppressed.

**Implementation notes:** Sounds play on a dedicated audio thread (never block the UI thread). `rodio::OutputStream` is created once at startup and reused. If audio device is unavailable (e.g., headless server), skip silently (no error toast).

---

