## 11. Keyboard-First and Command Palette

### 11.1 Concept

**Keyboard-first UX:** Every major action (new run, switch view, open settings, send message, cancel, refresh) has a shortcut. **Command palette** (e.g. Ctrl/Cmd+P): user types a few characters and gets a filtered list of actions; choose with arrows and Enter. Shortcuts are documented in-app (e.g. "Keyboard shortcuts" in Help or Settings) and, where possible, consistent across platforms (Ctrl vs Cmd).

### 11.2 Relevance to Puppet Master

- **Efficiency:** Power users can drive the app without the mouse.
- **Discoverability:** Command palette surfaces actions that might otherwise be buried in menus.
- **Consistency:** Aligns with common editor/IDE patterns (Ctrl+P, Ctrl+Shift+P, etc.).

### 11.3 Implementation Directions

- **Shortcut registry:** In Rust or in the GUI layer, maintain a map: shortcut → action (message or command). On key event, resolve and dispatch. Support platform-specific modifiers (Cmd on macOS, Ctrl on Windows/Linux).
- **Command palette UI:** A modal or overlay that lists all actions (and optionally recent projects, open tabs). Filter list by typed string (fuzzy or prefix); select with Up/Down, execute with Enter. Reuse existing modal and input widgets.
- **Documentation:** A static list or view "Keyboard shortcuts" (e.g. in Settings or Help) generated from the same registry so we don't drift.
- **Coverage:** Add shortcuts for: new run, switch view (dashboard, config, doctor, wizard, interview, etc.), settings, refresh, cancel run, and any new features (e.g. background runs, restore, analytics). Aim for 20+ actions with shortcuts.
- **Accessibility:** Command palette must support **keyboard-only** use (focus management, Up/Down/Enter/Escape); provide **screen reader labels** so the list and actions are announced. See §23.11.

---

