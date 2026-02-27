## 9. State Management

### 9.1 Architecture

```
Backend (Rust)                              UI (Slint)
+------------------+                        +------------------+
| AppState         |                        | Theme globals    |
| - orchestrator   |  -- properties -->     | Root component   |
| - projects       |  -- VecModel -->       | - views          |
| - chat threads   |  -- callbacks <--      | - panels         |
| - file tree      |                        | - overlays       |
| - usage data     |                        +------------------+
+------------------+
```

### 9.2 Rust-to-Slint Data Flow

- **Scalar properties** (orchestrator status, current phase, theme mode): Set directly on Slint component properties from Rust
- **List data** (chat messages, file tree, output lines, evidence items): Use `Rc<VecModel<T>>` shared between Rust and Slint. Slint's `ModelNotify` automatically triggers re-render when data changes
- **Cross-window sharing:** Same `Rc<VecModel<T>>` bound to both main window and floating panel windows for automatic synchronization

### 9.3 Slint-to-Rust Data Flow

- **Callbacks:** Slint components define callbacks (e.g., `callback send-message(string)`, `callback navigate(int)`). Rust registers handlers via `.on_<callback_name>()`
- Callbacks are thin -- Rust performs logic, updates state, then updates Slint properties

### 9.4 Thread-Safe Updates

Background threads (orchestrator events, usage refresh, auth checks) update the UI via `slint::invoke_from_event_loop`:

```rust
let ui_handle = ui.as_weak();
tokio::spawn(async move {
    let event = receive_event().await;
    let _ = ui_handle.upgrade_in_event_loop(move |ui| {
        ui.set_orchestrator_status(event.status.into());
    });
});
```

**Critical:** Do NOT use timer-based polling (e.g., 50ms or 100ms timers) to sync state. Use event-driven updates via channels + `invoke_from_event_loop`. The current Iced implementation uses 50ms polling via crossbeam channels -- this must NOT be replicated.

### 9.5 Event Channel Architecture

```
Backend Event --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
Tray Action  --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
Auth Change  --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
Usage Update --> tokio channel --> spawn --> invoke_from_event_loop --> UI update
```

All events flow through typed Rust channels. The receiving end calls `invoke_from_event_loop` to update Slint properties on the main thread.

### 9.6 Context Management

**Context compilation:** Each prompt sent to a platform assembles context from multiple sources: conversation history (last N turns + summary of older turns), system instructions (AGENTS.md, project rules), file context (@ mentioned files, recently edited files), and plan state. Context is compiled on the Rust side before invoking the platform CLI.

**Context window tracking:** Token count for each thread is tracked and displayed in the chat footer's context circle (§7.16). When a platform supports streaming token counts, the display updates in real-time during generation.

**Compact session:** User-triggered via `/compact` command or `Ctrl+Shift+C`. Trims the conversation context while preserving key information (system instructions, plan state, last N turns, summary of compacted turns). The compacted portion is replaced with a "Session compacted" marker in the message stream; original messages are preserved in seglog but removed from active context.

**Re-pack on model switch:** When the user changes the model mid-thread (especially to one with a smaller context window), context is automatically re-packed: last N turns retained in full, older turns summarized, and the total is trimmed to fit within the new model's context limit (sourced from `platform_specs`).

**Truncation handling:** When context approaches the model's limit, a warning appears in the chat footer ("Context 95% -- consider compacting"). If context exceeds the limit, automatic truncation removes the oldest non-essential turns (preserving system instructions and plan state) and shows a toast: "Context truncated -- oldest messages removed."

### 9.7 Config Wiring Architecture

The GUI Settings page is the editing surface; the orchestrator reads configuration at run-time. The wiring works as follows:

1. **Edit in GUI:** User changes a value (e.g., Branching > Auto PR toggle). The Slint property updates immediately.
2. **Auto-save to redb:** A debounced callback (200ms) serializes the current config struct and writes to redb `config:v1`. No explicit "Save" button -- settings auto-save. A small "Saved" indicator flashes in the Settings header on write.
3. **Run reads config:** When a run starts, the orchestrator reads `config:v1` from redb, producing an immutable `RunConfig` snapshot. Mid-run config changes do NOT affect the active run.
4. **Reset/defaults:** Each Settings tab has a "Reset to defaults" button (confirm modal). Individual settings have a hover reset icon that resets that single field.

**Config migration:** When the app version introduces new config fields, the loader applies defaults for missing fields and logs a toast: "Settings updated for v{version} -- N new options available."

---

