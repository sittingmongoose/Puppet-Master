## 7. Cleanup UX & Config

Cleanup UX is required: it gives users control over workspace cleanup and evidence retention. It includes: Config → Advanced → "Workspace / Cleanup" (toggles for clean untracked, clean ignored, clear agent-output, remove build artifacts, evidence retention); "Clean workspace now" in Doctor or Advanced (resolve project path, run prepare-style cleanup with confirmation and optional dry-run); optional "Clean all worktrees"; widgets from gui-widget-catalog (styled_button, confirm_modal, toggler). See feature-list.md and newfeatures.md for alignment.

### 7.1 Config Toggles (GUI or YAML)

- **cleanup.untracked:** Run `git clean -fd` (with excludes) in work dir **before each run** (in `prepare_working_directory` only; not after execution -- see §9.1.13) (default: true if implementing Option C).
- **cleanup.ignored:** When cleaning before run, include ignored files, e.g. `git clean -fdx` (default: false).
- **cleanup.clear_agent_output:** Clear `.puppet-master/agent-output/` in prepare (default: true if Section 5 implemented).
- **cleanup.remove_build_artifacts:** In cleanup_after_execution, remove known build dirs (e.g. `target/`) only; default false.
- **evidence.retention_days / evidence.retain_last_runs:** See Section 6 (default: retain all if Section 6 not implemented).

**Config schema (concrete, DRY):** Add a single struct used at run time; do not duplicate cleanup fields in multiple shapes. Recommended: extend the config shape built from GuiConfig at run start (Option B, Worktree plan §5) with a nested `cleanup` and `evidence` block. Example (conceptual):

```yaml
# In the run config (built from GUI or file):
cleanup:
  untracked: true
  clean_ignored: false
  clear_agent_output: true
  remove_build_artifacts: false
evidence:
  retention_days: null   # null = retain all
  retain_last_runs: null
  prune_on_cleanup: false
```

Rust: `CleanupConfig { untracked: bool, clean_ignored: bool, clear_agent_output: bool, remove_build_artifacts: bool }` and optionally `skip_prepare_for_conversation: bool`. Populate from the same place as `enable_parallel`, `branching.base_branch`, etc., so one code path builds the run config and cleanup is included.

### 7.2 Manual "Prune" / "Clean Workspace" Action

- **Doctor or Config page:** Button or command: "Clean workspace now" that:
  - Runs the same **untracked cleanup** as `prepare_working_directory` (e.g. `run_git_clean_with_excludes` with allowlist) in the current workspace (and optionally in all active worktrees). This is **not** the same as `cleanup_after_execution`, which only clears runner temp files; the manual action is for removing agent-left-behind cruft, so it uses the prepare-style broad clean with excludes.
  - Optionally runs evidence pruning (Section 6) if enabled.
- **Confirmation:** For "clean ignored" or "prune evidence", show a short confirmation (e.g. "Remove untracked and ignored files in workspace?") to avoid accidents.

### 7.3 Tooltips / Docs

- Tooltip for "Clean workspace": "Removes agent-left-behind untracked files and optional temp dirs; does not remove .puppet-master/ or state files."
- Document cleanup policy in AGENTS.md and in user-facing docs (e.g. README or docs folder).

### 7.4 DRY for cleanup UX

- **Config:** Cleanup and evidence config (cleanup.untracked, cleanup.ignored, cleanup.clear_agent_output, evidence.retention_days, etc.) live in the **same** config schema and file as the rest of the app (e.g. `PuppetMasterConfig` / discovery). Do not introduce a separate cleanup-only config shape; add fields to the existing config so there is a single source of truth (see WorktreeGitImprovement.md for config wiring).
- **UI:** Use existing widgets from `docs/gui-widget-catalog.md`: e.g. `styled_button` for "Clean workspace", `confirm_modal` for confirmation, `page_header` / `refresh_button` if the action lives on Config or Doctor. Check the catalog before adding new components; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after any widget changes.

### 7.5 GUI gaps and updates (consolidated)

The Config view has **8 tabs**: Tiers, Branching, Verification, Memory, Budgets, **Advanced**, Interview, YAML. Doctor is a separate view. The following GUI updates are required or recommended so cleanup, evidence, and related behavior are visible and wired.

**Where to put cleanup and evidence UI**

- **Option A (recommended):** Add a **"Workspace" or "Cleanup" subsection** inside the **Advanced** tab. Advanced already has Execution, Checkpointing, Loop Guard, Network; add a collapsible section "Workspace / Cleanup" with toggles and the optional "Clean workspace now" action. No new tab; keeps Config tab count at 8. **GuiConfig** would gain `advanced.cleanup` (or a top-level `cleanup` block if preferred for YAML clarity) and `advanced.evidence` (or top-level `evidence`).
- **Option B:** Add a **ninth tab "Workspace"** (or "Cleanup") for cleanup and evidence only. More visible but increases tab count; consider only if Advanced becomes too crowded.
- **Recommendation:** Use Option A: add `CleanupGuiConfig` and `EvidenceRetentionGuiConfig` (or nest under `AdvancedConfig` as `advanced.cleanup` and `advanced.evidence`). When building run config from GuiConfig (Option B in Worktree §5), map these into `CleanupConfig` and evidence retention config so the run sees them.

**Concrete GUI elements to add**

| Element | Location | Purpose |
|--------|----------|---------|
| **Clean untracked before run** | Advanced → Workspace / Cleanup | Toggle: run `git clean -fd` with excludes in prepare_working_directory (default: true). Tooltip: "Remove untracked files in workspace before each iteration; .puppet-master and state files are never removed." |
| **Clean ignored files** | Same subsection | Toggle: include ignored files when cleaning (e.g. `git clean -fdx`); default false. Tooltip: "Also remove ignored files (e.g. target/); use with care." |
| **Clear agent-output dir** | Same | Toggle: clear `.puppet-master/agent-output/` in prepare when Section 5 is implemented (default: true). |
| **Remove build artifacts after run** | Same | Toggle: in cleanup_after_execution, remove known build dirs (e.g. target/) only; default false. |
| **Evidence retention (days)** | Same or separate "Evidence" subsection | Number input or "Retain all"; maps to evidence.retention_days. Optional: "Prune on manual clean" checkbox. |
| **"Clean workspace now" button** | **Doctor** (preferred) or Advanced | Runs prepare-style untracked cleanup (run_git_clean_with_excludes) for current project. Requires **project context**: use same project path as run (e.g. current project from Dashboard or config path). Confirmation modal; optional "Preview" (dry-run) that runs `git clean -fd -n` and shows list. If Doctor: add under a "Workspace" or "Git" category; if Config: under Advanced → Workspace. |
| **"Clean all worktrees"** | Same as above (optional) | When worktrees are in use, offer "Clean current only" vs "Clean all active worktrees"; requires worktree list from worktree_manager (§9.1.8). |

**Project context for Doctor and Clean workspace**

- **Gap:** Doctor checks today may not receive the "active project" path; "Clean workspace now" must run in the **project directory** the user intends (e.g. selected project in Dashboard or the directory of the loaded config). Worktree plan §7.2 and §7.3: when running Doctor or starting a run, pass `current_project.path` or config hint so operations use the correct directory. Implement: when the user clicks "Clean workspace now" from Doctor (or Config), resolve project root from the same source as the run (e.g. `discover_config_path(Some(hint))` then parent dir, or `gui_config.project.working_directory`). Do not use `std::env::current_dir()` unless it is the intended project.

**Cross-plan GUI alignment**

- **Worktree plan:** Branching tab (Enable Git, Auto PR, Branch strategy) and Advanced (Enable parallel execution) are wired via Option B. Cleanup and evidence toggles must be **added to the same GuiConfig and Option B run-config build** so one save persists all; no separate "cleanup config file."
- **Orchestrator plan:** Config has plan-mode and subagent UI (Tiers tab, optional "Enable plan mode for all tiers," Subagents section). Ensure cleanup subsection does not conflict with existing Advanced layout; use a clearly labeled "Workspace / Cleanup" block.
- **Interview plan:** Interview tab has its own GUI gaps (min/max questions, generate_initial_agents_md, etc.); see Interview plan §GUI gaps. No overlap with cleanup UI.

**Potential issues and improvements**

- **Discoverability:** If cleanup lives only in Advanced, some users may miss it. Add a one-line mention in Doctor: "Workspace cleanup runs before each iteration when enabled in Config → Advanced → Workspace."
- **Dry-run UX:** For "Clean workspace now," a "Preview" button could show a scrollable list of paths that would be removed (from `git clean -fd -n`); then "Confirm" runs the real clean. Requires parsing `git clean -n` output and showing in a modal or secondary view.
- **State after clean:** After "Clean workspace now," the UI could show a toast: "Cleaned N files/dirs" or "Nothing to clean." Improves feedback.
- **Missing project context:** When Doctor (or Config) has no project selected and no config path, "Clean workspace now" should be **disabled** with tooltip "Select a project or open a config to clean." Otherwise we might run clean in CWD or an wrong directory. Resolve project path from the same source as the run (current project, config path, or explicit selection).

### 7.6 Leveraging platform CLI capabilities (hooks, skills, plugins, extensions)

Platform CLIs (Cursor, Codex, Claude Code, Gemini, Copilot) support **hooks**, **skills**, **plugins**, **extensions**, and **MCP servers**. These can complement (not replace) Puppet Master's own prepare/cleanup and orchestration.

**Current stance**

- **Prepare and cleanup:** Puppet Master implements prepare_working_directory and cleanup_after_execution **internally** and invokes them via `run_with_cleanup` before/after each `runner.execute()`. Puppet Master does **not** rely on platform-specific hooks or scripts to perform workspace cleanup, so behavior is consistent across all five platforms and does not require the user to install or configure per-platform hooks.
- **Subagents and plan mode:** Subagent names and plan-mode flags are passed in the **prompt or CLI args** (per platform_specs and runners). Puppet Master does not require Cursor plugins or Claude hooks to define subagents; the orchestrator and interview plans define how Puppet Master invokes each platform.

**Ways we might leverage CLI capabilities (optional / future)**

- **Pre-iteration hook (platform-side):** Some CLIs support a "before run" or "session start" hook. We could **document** an optional user-provided hook that runs `git clean -fd -e .puppet-master ...` in the project dir as a **backup** or for platforms we don't control (e.g. when the user runs the CLI manually). Not a replacement for our prepare_working_directory; document in AGENTS.md or user docs as "Optional: if you run the CLI outside Puppet Master, you can add a hook to clean the workspace."
- **Skills for context:** Orchestrator and Interview plans already reference platform **skills** (e.g. `.cursor/skills/`, `.codex/skills/`) for subagent-specific context. We could add a **Puppet Master-authored skill** (e.g. "puppet-master-clean-workspace" or "puppet-master-context") that agents can load when running under Puppet Master, reminding them to write scratch files under `.puppet-master/agent-output/` and to avoid leaving untracked cruft. Implement as a SKILL.md in the project or in a shared location; no change to our cleanup code.
- **Plugins / extensions:** Cursor plugins and Claude/Gemini extensions can add MCP servers, subagents, and hooks. We do not **require** any plugin for core cleanup or orchestration. If a **project** wants to use a platform plugin (e.g. a custom subagent definition), that is project-specific; our runners stay CLI-arg and prompt based. Document in platform_specs or AGENTS.md which platforms support plugins and that we do not depend on them for prepare/cleanup.
- **MCP:** We use MCP for Context7 and other tooling; platform CLIs can also connect to MCP servers. Cleanup and evidence are **not** exposed as MCP tools; they remain internal to Puppet Master. Future: optional MCP tool "clean_workspace" for external orchestration could call our run_git_clean_with_excludes, but that is out of scope for the current plan.

**Summary**

- Puppet Master implements prepare/cleanup internally; does not depend on platform hooks or plugins for workspace cleanup.
- Optionally document or provide a skill/README that tells agents to use `.puppet-master/agent-output/` and to avoid leaving untracked files.
- For full platform capabilities (hooks, plugins, skills, subagent definitions), see **Plans/orchestrator-subagent-integration.md** "Platform-Specific Capabilities & Extensions"; keep platform_specs and AGENTS.md aligned with CLI release notes.

### 7.7 Desktop Shortcuts (GUI screen)

A dedicated **GUI screen** is required to allow users to **change and customize desktop (keyboard) shortcuts** used by the application. This applies to in-app text input and composer behavior (e.g. prompt fields, chat input, any focusable text areas).

**Placement (exact UI location):** Add as a subsection under **Config**: either **Config → Advanced → Shortcuts** or a dedicated **Config → Shortcuts** tab (single canonical location; implementation chooses one). If the app has a **Settings / Preferences** area, Shortcuts may live there instead, but must be reachable from the same config surface as the rest of GuiConfig (Option B). Use existing widgets from `docs/gui-widget-catalog.md` (e.g. `styled_button`, `styled_text_input`, `page_header`); ensure shortcut keys are displayed with `selectable_label` or `selectable_label_mono` so users can copy them.

**Default shortcuts (single source of truth):** The following table defines the default bindings. The GUI must allow viewing and overriding each action's shortcut; persisted overrides live in config (e.g. `GuiConfig.shortcuts` or `~/.config/puppet-master/shortcuts.yaml`).

| Shortcut   | Action |
|------------|--------|
| `Ctrl+A`   | Move to start of current line |
| `Ctrl+E`   | Move to end of current line |
| `Ctrl+B`   | Move cursor back one character |
| `Ctrl+F`   | Move cursor forward one character |
| `Alt+B`    | Move cursor back one word |
| `Alt+F`    | Move cursor forward one word |
| `Ctrl+D`   | Delete character under cursor |
| `Ctrl+K`   | Kill to end of line |
| `Ctrl+U`   | Kill to start of line |
| `Ctrl+W`   | Kill previous word |
| `Alt+D`    | Kill next word |
| `Ctrl+T`   | Transpose characters |
| `Ctrl+G`   | Cancel popovers / abort running response |

**GUI behavior:**

- **List view:** Show each action with its current shortcut (default or user override). Use a table or list; actions and shortcuts should be selectable/copyable.
- **Edit:** "Change" or double-click opens an edit flow: user presses the new key combination; app records it and validates (no duplicate bindings for the same action; optionally warn on conflicts with system or other app shortcuts).
- **Reset:** Per-action "Reset to default" and optionally "Reset all to defaults."
- **Persistence:** Save to the same config surface as the rest of Config (Option B in Worktree §5); no separate shortcuts file unless design explicitly prefers one.
- **DRY:** Define default shortcuts in one place (e.g. `DRY:DATA:default_shortcuts` in `src/config/` or `src/gui/shortcuts.rs`); GUI and key-handling code both read from that source.

**Acceptance criteria (Shortcuts screen):**

- User can open **Config → Shortcuts** (or Config → Advanced → Shortcuts) and see a list of all actions and their current bindings.
- User can change a binding via "Change" or double-click; after recording a new key combo, binding updates and persists; if the key is already bound to another action, show error (see §7.11) and do not save.
- User can reset one action to default or reset all to defaults; persisted overrides are updated and key map is rebuilt.
- Shortcut list reflects the same key map used by Puppet Master (composer, prompt fields); changes take effect immediately after save.

**Data flow:**

- **Config field:** `GuiConfig.shortcuts` (or `keyboard_shortcuts`): map from action id (e.g. `MoveToLineStart`) to `KeyBinding`; only overrides stored; missing key = use default.
- **Key map rebuild:** When user saves a change (edit or reset), update `GuiConfig.shortcuts`, persist config, then call `build_key_map(default_shortcuts(), gui_config.shortcuts)` and store result in app state; all key handling uses this map until next change.

**Error handling:**

- **Duplicate binding (key already used by another action):** Reject with tooltip/toast "Already used by &lt;ActionName&gt;" per §7.11; do not update config.
- **Config load failure (corrupted shortcuts):** Fall back to defaults and show toast per §7.11; see §8.8 for checklist.

**Implementation notes:**

- Key handling in the GUI layer (Slint) must route key events using the configured shortcuts, not hardcoded bindings. On load, load overrides from config and merge with defaults.
- Accessibility: ensure shortcut list is keyboard-navigable and that the "record new shortcut" flow is clearly announced (e.g. "Press the new key combination").
- If the app supports multiple platforms (e.g. macOS), display and store shortcuts in a platform-appropriate form (e.g. Cmd vs Ctrl); the table above uses Ctrl/Alt as the default (Linux/Windows); document or map for macOS (Cmd, Option) in the same DRY data source.

**Checklist (for implementation):**

- [ ] Add `shortcuts` (or `keyboard_shortcuts`) to `GuiConfig` and run config projection.
- [ ] Add DRY:DATA for default shortcut table; use it in both GUI and key-event handling.
- [ ] Add Shortcuts subsection/tab under Config (or Settings); list all actions and current bindings; edit + reset.
- [ ] Persist overrides and load them when building the key map for the app.
- [ ] Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after any new widgets.

### 7.8 Agent Skills (GUI)

A **GUI screen** is required to let users **manage Agent Skills**: discover, list, add, edit, remove, and configure permissions for skills that agents can load. Skills are reusable instruction sets defined as `SKILL.md` files in folders; discovery follows project and global paths compatible with OpenCode and platform CLIs (Cursor, Codex, Claude, etc.). See [OpenCode Agent Skills](https://opencode.ai/docs/skills/) for the canonical model (frontmatter, discovery, permissions).

**Placement:** Add under **Config** (e.g. **Advanced** tab → "Skills" or a dedicated **Skills** tab), or under **Settings**. Use widgets from `docs/gui-widget-catalog.md` (e.g. `page_header`, `styled_button`, `selectable_label` / `selectable_label_mono` for skill names and paths).

**Skill model (aligned with OpenCode baseline per `Plans/OpenCode_Deep_Extraction.md` §7F):**

- **One folder per skill**, with a `SKILL.md` inside. Recognized fields in frontmatter: `name` (required), `description` (required), `license`, `compatibility`, `metadata` (optional map).
- **Discovery paths** (single source of truth in backend, §7.10):
  - Project: `.puppet-master/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` (walk up from cwd to git worktree).
  - Global: `~/.config/puppet-master/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.
- **Name validation (OpenCode-aligned):** Regex `^[a-z0-9]+(-[a-z0-9]+)*$`, 1-64 chars, no leading/trailing `-`, no consecutive `--`; MUST match directory name. **Description:** 1-1024 chars.

**Permissions integration:**

- Skills are **permission-gated** using the `permission.skill` key in `Plans/Permissions_System.md` §5. The `skill` permission key supports per-skill patterns (e.g., `{ "my-skill": "allow", "internal-*": "deny", "*": "allow" }`).
- **Per-Persona overrides:** A Persona's `default_skill_refs` (`Plans/Personas.md` §3.2) lists skill IDs to auto-load. Per-Persona permission profiles (`Plans/Permissions_System.md` §2.4, priority 3) may further restrict or allow specific skills.
- **Disabling skill tool per Persona:** A Persona MAY set the `skill` permission key to `deny` in its permission profile to disable skill loading entirely for runs using that Persona.
- **Skills in tool description:** Skills are listed in the `skill` tool description with `<available_skills>` XML blocks containing name and description. The agent invokes a skill via `skill({ name })` which loads the skill's content on demand. Skills are also registered as invokable commands (so `/skillname` works from the command palette).
- Skill directories are automatically added to the `external_directory` allowlist for permission purposes (`Plans/Permissions_System.md` §3.3).
- Skill tool calls are protected from pruning during compaction.

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS, ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/OpenCode_Deep_Extraction.md

**GUI behavior:**

- **List view:** Show discovered skills (project + global) with name, description (truncated), source path, and permission. Use selectable labels for name/path so users can copy. Indicate source (project vs global).
- **Add:** "Add skill" → user chooses "Create new" (name + directory under project or global path) or "Import from path" (pick existing folder containing `SKILL.md`). Validate name and frontmatter; create or link.
- **Edit:** Open `SKILL.md` in an inline editor or external editor; validate on save (frontmatter + name match dir).
- **Remove:** "Remove" / "Disable" -- either delete the skill folder (with confirmation) or hide via permissions. Do not delete without explicit user confirmation.
- **Permissions:** Per-skill or pattern-based (allow / deny / ask), stored in config (e.g. `GuiConfig.skill_permissions` or `opencode.json`-style `permission.skill`). GUI: list skills with a permission dropdown or edit permission in a modal.
- **Refresh:** "Refresh" button to re-run discovery (e.g. after adding files on disk).

**Integration:** Backend (§7.10) provides discovery, load, and persistence; GUI consumes it. When building prompts or runner context for platforms that support skills, pass the list of allowed skills (and paths) so the platform CLI or SDK can load them (see orchestrator-subagent-integration and platform_specs).

**Acceptance criteria (summary):**

- User can open Skills from Config (Advanced tab or dedicated Skills tab) and see a list of discovered skills with name, description (truncated), source path, and permission.
- User can Add (Create new or Import from path), Edit (inline or external editor), Remove (with confirmation), set Permissions (per-skill or bulk by pattern), and Refresh the list.
- List reflects discovery path order and deduplication (first-wins); source (project vs global) is visible; selectable labels allow copy of name/path.
- Invalid frontmatter, missing SKILL.md, or permission/config write failure surface as clear errors (toast or inline) without corrupting state.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**UI location:**

- **Tab/section:** Config → Advanced → "Skills", or Config → dedicated "Skills" tab. All Skills features (list, add, edit, remove, permissions, bulk permission, sort/filter, preview, validate all) live in this same tab/section.

**Data flow:**

- **Discovery and list refresh:** List is built from `discover_skills(project_root)` using the ordered discovery paths (see §7.10). List is refreshed: (1) on opening the Skills tab; (2) after Add (Create/Import), Edit save, or Remove; (3) when user clicks "Refresh". Do not auto-refresh on a timer; user-initiated or after mutations only.
- **Permissions:** Read from `GuiConfig.skill_permissions`; writes (per-skill or bulk) update config and persist; list re-renders with resolved permission per skill.

**Error handling:**

- **Invalid frontmatter:** On load or save, if YAML frontmatter is missing or malformed, show error (e.g. "Invalid frontmatter in SKILL.md") and do not overwrite file on save; allow user to fix in editor.
- **Missing SKILL.md:** If a discovery path has a directory without `SKILL.md`, either skip it in discovery (no entry in list) or show as "Invalid: missing SKILL.md" per implementation; document in backend.
- **Permission/config write failure:** If saving `skill_permissions` to config fails (e.g. disk full, permission denied), show error toast and keep in-memory state so user can retry or save elsewhere; do not lose edits.

**Checklist (for implementation):**

- [ ] Add **Skills** subsection/tab under Config; list discovered skills; Add / Edit / Remove / Permissions / Refresh.
- [ ] Wire to backend skill discovery and permission config; persist permissions in same config surface as rest of Config.
- [ ] Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after any new widgets.

### 7.9 Backend: Desktop Shortcuts

Backend components required so the Desktop Shortcuts GUI (§7.7) and in-app key handling work.

**Data and types:**

- **ShortcutAction:** Enum or struct identifying each action (e.g. `MoveToLineStart`, `MoveToLineEnd`, ...). One variant per row in the default table in §7.7. Tag **DRY:DATA:shortcut_actions**.
- **Default shortcuts:** A const or fn `default_shortcuts() -> Vec<(ShortcutAction, KeyBinding)>` (or `HashMap<ShortcutAction, KeyBinding>`) as the single source of truth. **DRY:DATA:default_shortcuts.** KeyBinding represents modifier + key (e.g. Ctrl+A, Alt+F); use a type that can be serialized for config and compared for conflicts.
- **Config shape:** `GuiConfig.shortcuts` (or `keyboard_shortcuts`): map from action id (string or enum name) to user key binding. Only overrides are stored; missing key means use default.

**Key map building:**

- **build_key_map(defaults, overrides) -> KeyMap:** Merge defaults with overrides (overrides take precedence). Output a structure the GUI layer (Slint) can use to route key events to actions. Tag **DRY:FN:build_key_map**.
- **Platform mapping:** If supporting macOS, map Ctrl -> Cmd and Alt -> Option when reading/writing config or displaying in GUI; do this in one place (same DRY data or a small platform module).

**Persistence:**

- Load/save `shortcuts` with the rest of `GuiConfig` (Option B in Worktree §5). No separate shortcuts file unless design mandates it. On app startup, load GuiConfig, build key map, install into the app's key event handler.

**Wiring:**

- **App startup:** After loading GuiConfig, call `build_key_map(default_shortcuts(), gui_config.shortcuts)` and store the result in app state (e.g. `App::key_map`). All key events (e.g. in composer, prompt fields) go through this map to resolve to `ShortcutAction` then execute the corresponding behavior.
- **GUI (Shortcuts screen):** Read current binding per action from the same key map (or from defaults + overrides) so the list shows exactly what is active. On "Change", record new key combo, validate (no duplicate action binding; optional conflict check), update GuiConfig.shortcuts and persist; then rebuild key map so the new binding is active immediately.

**Conflict validation (optional but recommended):** Ensure two actions do not share the same binding; optionally warn if the new binding matches a system or well-known shortcut. Implement in a small **DRY:FN:validate_shortcut_binding**.

**Acceptance criteria (backend):**

- `ShortcutAction` and `KeyBinding` types exist; `default_shortcuts()` returns the single source of truth; `build_key_map(defaults, overrides)` merges and returns a KeyMap used by Puppet Master.
- GuiConfig has a `shortcuts` (or `keyboard_shortcuts`) field; only overrides are stored; load/save use the same config path as the rest of GuiConfig.
- On app startup: load GuiConfig; on failure or invalid shortcuts section, fall back to empty overrides and show toast (§7.11); then build key map and install into key event handling.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Data flow (config field names, when key map is rebuilt):**

- **Config field:** `GuiConfig.shortcuts`: type e.g. `HashMap<String, KeyBinding>` or `BTreeMap<ShortcutAction, KeyBinding>`; key = action id (string or enum name); value = user override. Only overrides stored.
- **Key map rebuild:** (1) On app startup after loading GuiConfig; (2) After user saves a change on the Shortcuts screen (edit or reset); (3) After successful import (Replace or Merge). Rebuild = `build_key_map(default_shortcuts(), gui_config.shortcuts)`; store result in `App::key_map` (or equivalent); wire to key event handler.

**Error handling:**

- **Config load:** If shortcuts section is missing, use empty overrides. If it fails to parse or is invalid, fall back to empty overrides, log warning, show toast "Shortcuts reset to defaults due to config error" (§7.11).
- **Validate on edit/import:** Use `validate_shortcut_binding` to reject duplicate action binding (same key bound to two actions); optionally warn on system shortcut.

**Checklist:** See §8.8.

### 7.10 Backend: Agent Skills

Backend components required so the Agent Skills GUI (§7.8) and skill-aware flows (orchestrator, interview, platform runners) work.

> **SSOT cross-references:** Plugin-level skill injection (skills loaded by plugins) is defined in `Plans/Plugins_System.md` §4 (Custom Tool Registration). Skill permissions follow `Plans/Permissions_System.md` §5 (`skill` key). Persona skill refs and per-Persona skill disabling follow `Plans/Personas.md` §3.2. OpenCode baseline for skills is in `Plans/OpenCode_Deep_Extraction.md` §7F.

**Discovery paths (DRY:DATA:skill_search_paths):**

- Define the ordered list of (base_dir, relative_path) or full paths to search for `skills/<name>/SKILL.md`. Include:
  - Project: `.puppet-master/skills`, `.claude/skills`, `.agents/skills` -- resolve relative to project root (walk up from cwd to git worktree or use configured project path).
  - Global: `~/.config/puppet-master/skills`, `~/.claude/skills`, `~/.agents/skills`.
- **discover_skills(project_root: Option<&Path>) -> Vec<SkillInfo>:** Walk each path; for each `<base>/<name>/SKILL.md` found, collect name, path, source (project vs global). Deduplicate by name (first-wins per load order: project paths first, then global; within each, `.puppet-master` before `.claude` before `.agents`). Tag **DRY:FN:discover_skills**.

**Skill content and frontmatter:**

- **SkillInfo:** Struct with at least `name: String`, `description: String`, `path: PathBuf`, `source: SkillSource` (Project | Global), and optionally `license`, `compatibility`, `metadata` from frontmatter.
- **load_skill(path: &Path) -> Result<SkillInfo>:** Read `SKILL.md`, parse YAML frontmatter (first delimited block), validate `name` and `description` (length and name rules per §7.8). Parse body as markdown (keep raw for agent use). Tag **DRY:FN:load_skill**.
- **Name validation:** 1-64 chars, `^[a-z0-9]+(-[a-z0-9]+)*$`, and name must match directory name. Reject or warn on invalid names in GUI and in discovery.

**Permissions:**

- **Config shape:** `GuiConfig.skill_permissions` (or equivalent): map from skill name (or pattern, e.g. `internal-*`) to `allow | deny | ask`. Pattern-based matching supports wildcards (e.g. `internal-*`). Default: e.g. `*: allow` if unset.
- **resolve_skill_permission(name: &str, permissions: &SkillPermissions) -> Permission:** Return allow / deny / ask for a given skill name. Tag **DRY:FN:resolve_skill_permission**.
- When listing skills in GUI or when building agent context, filter or annotate by permission (denied skills hidden or greyed out; ask requires runtime prompt if implemented).

**CRUD and persistence:**

- **Create:** Create directory `<base>/<name>/` and write `SKILL.md` with valid frontmatter and placeholder body. Base chosen by user (project or global).
- **Update:** Overwrite or patch `SKILL.md` at known path; re-validate frontmatter and name.
- **Delete:** Remove skill folder only after user confirmation; optional "Disable" that only sets permission to deny without deleting files.
- Persist only **permissions** and any "pinned" or "favorite" list in config; skill content lives on disk. Discovery is stateless from disk.

**Integration with runners and prompts:**

- When building iteration context or prompt for a platform that supports skills (see platform_specs and orchestrator plan), include allowed skill names and paths (or the loaded content) so the CLI/SDK can load them (e.g. via `skill` tool or equivalent). Backend exposes: `list_skills_for_agent(project_root, permissions) -> Vec<SkillInfo>` that returns only allowed skills with their paths (and optionally loaded content). Tag **DRY:FN:list_skills_for_agent**.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Discovery and platform_specs:**

- How runners receive skills must be explicitly tied to **platform_specs** (or a dedicated doc section referenced from AGENTS.md). **Implementation plan must list per platform (Cursor, Codex, Claude, Gemini, Copilot) how skill paths or content are passed** -- e.g. env var, prompt injection, or tool (e.g. `skill` tool). No implementation of runner wiring without this mapping.

**Error handling (backend):**

- **load_skill:** Invalid frontmatter → return `Err` with message (e.g. "Invalid YAML frontmatter"). Missing SKILL.md → return `Err` ("SKILL.md not found"). Name/description validation failure → return `Err` with field and rule (e.g. "name must match directory").
- **Create:** If target directory already exists and contains SKILL.md → return error; do not overwrite (see §7.11). If directory exists but no SKILL.md, implementation must decide (error vs create SKILL.md only).
- **Update/Delete:** File not found or permission denied → return `Err`; do not corrupt in-memory state.
- **Config write (permissions):** On save failure, return `Err` to caller; GUI shows toast and keeps in-memory edits for retry.

**Module placement:**

- New module `src/skills/` (or under `src/config/`): `mod.rs`, `discovery.rs`, `frontmatter.rs`, `permissions.rs`. Keep discovery and load pure so they can be tested without GUI. Tag all public types and functions with DRY as above.

**Checklist:** See §8.9.

### 7.11 Shortcuts and Skills: gaps, enhancements, implementation readiness

This subsection closes open decisions and documents gaps so an **implementation plan** can be derived without ambiguity. It also lists optional enhancements and states readiness for implementation planning.

**Desktop Shortcuts -- gaps and decisions**

| Gap / risk | Resolution or decision |
|------------|------------------------|
| **Scope of shortcut handling** | Explicitly list all views/widgets that receive shortcut handling: composer (prompt field), chat input, interview text fields, config text inputs, wizard prompts, any other focusable text. Implementation plan should enumerate and wire key map in one central place (e.g. app-level key subscription) or per-widget; prefer central so behavior is consistent. |
| **Slint key event wiring** | Key map must be consulted on every key event in focusable text areas. Slint: use a `FocusScope` (or window-level `key-pressed` handler) at the appropriate level (window or focused widget). Document in implementation plan: where key events are captured and how KeyMap is applied (e.g. `if let Some(action) = key_map.get(event) { ... }`). |
| **"Record new shortcut" flow** | Specify: (1) focus capture so only the new key combo is recorded; (2) ignore the key that opened the dialog (e.g. don't record "Ctrl+K" if user opened via Ctrl+K); (3) Escape cancels without saving; (4) if user presses a key with no modifier, either reject with tooltip "Use a modifier (Ctrl/Alt/Cmd)" or allow (e.g. F-keys). Recommend: require at least one modifier for clarity. |
| **KeyBinding serialization** | Config stores overrides; use a format that is cross-platform and stable (e.g. string `"Ctrl+A"` or structured `{ "modifiers": ["ctrl"], "key": "A" }`). Document in implementation plan; ensure backward compatibility if format changes later. |
| **Conflict validation** | "No duplicate action binding" is required. "Warn on system shortcut" is optional: maintain a small allowlist of well-known system shortcuts (e.g. Ctrl+C, Ctrl+V) and warn when user binds an action to one; or skip for v1. |
| **User presses a key already bound to another action** | **Resolution:** When recording a new shortcut, if the key combo is already bound to a *different* action, either (a) **reject** with tooltip "Already used by &lt;ActionName&gt;" and do not save, or (b) **steal** (assign to new action and remove from old); implementation must decide. **Recommendation:** (a) reject and require user to change or reset the other action first. |
| **Config file corrupted or invalid shortcuts section** | **Resolution:** On load, if `GuiConfig.shortcuts` (or the shortcuts section) fails to parse or is structurally invalid: **fall back to defaults** (empty overrides), log a warning, and **show a toast** ("Shortcuts reset to defaults due to config error"). Do not crash; key map = `build_key_map(default_shortcuts(), empty_overrides)`. Optionally persist the repaired config (defaults) on next save. |
| **Export format versioning** | **Resolution:** Export JSON must include a `version` field (e.g. `1`). On import, if `version` is missing or greater than the highest supported version, **reject** with message "Unsupported shortcut file version" (or "implementation must decide": skip unknown version and attempt to parse known fields for best-effort import). Document supported versions in code or STATE_FILES.md. |
| **Filter: empty query vs no matches** | **Resolution:** **Empty filter** = show all shortcut rows. **Non-empty filter with no matches** = show empty list and a single inline message (e.g. "No shortcuts match 'xyz'") so the user can tell "no match" from "no data." Implementation must not show "No shortcuts" when the filter is the cause. |
| **Tooltip/label when key map not yet loaded** | **Resolution:** Before first `build_key_map` (e.g. config not yet loaded or app init): show action label only, with no "(Key)" suffix, or show placeholder "(Loading...)". Once key map is built, show binding. Avoid blank or "(undefined)" in UI. |
| **Tests** | Add unit tests: `build_key_map` (defaults + overrides merge correctly); `validate_shortcut_binding` (reject duplicate action, optional conflict); round-trip (defaults → config override → build_key_map → same bindings). See §8.8.8. |

**Agent Skills -- gaps and decisions**

| Gap / risk | Resolution or decision |
|------------|------------------------|
| **Deduplication by name** | **Decision:** **First-wins by search order.** Discovery walks paths in a defined order (e.g. project paths first, then global; within each, e.g. `.puppet-master/skills` then `.claude/skills` then `.agents/skills`). First `skills/<name>/SKILL.md` found for a given `name` wins; later duplicates with the same name are skipped (or listed as "shadowed" in GUI). Document this order in DRY:DATA:skill_search_paths. |
| **Create skill: directory already exists** | **Decision:** On "Create new" skill, if the target directory (e.g. `<base>/<name>/`) already exists and contains a `SKILL.md`, **do not overwrite**. Show an error (e.g. "A skill named &lt;name&gt; already exists at this location") and do not create. User must choose a different name or remove/import the existing skill first. Implementation must decide whether to treat "dir exists but no SKILL.md" as error or as partial state (e.g. offer to create SKILL.md only). |
| **Edit: concurrent edit on disk** | **Implementation must decide:** If the user has the skill open in the GUI editor and the file is changed on disk (e.g. by another editor or process), on save: (1) overwrite and warn "File was modified on disk; your version was saved", or (2) detect mtime/content change and prompt "File changed on disk. Reload / Overwrite / Cancel", or (3) lock file for v1 (complex). Recommend (2) for clarity. |
| **Validate all: show only errors vs full table** | **Decision:** Show a **full table** (all discovered skills) with a status column: OK or Error + message. This allows users to see which skills passed and which failed in one view. Summary line: "N OK, M errors." Optional: filter toggle "Show only errors" to collapse to errors-only. Implementation plan may choose errors-only modal for v1 if full table is deferred. |
| **Permission "ask": when and where** | **Defer to later:** "Ask" means prompt user before an agent loads the skill. When implemented: user is prompted **at the moment the runner would load the skill** (e.g. when building iteration context or when platform CLI would invoke the skill)--i.e. in-app, before or at run start, not inside the platform CLI. Where: modal or toast from the app (e.g. "Allow skill 'doc-lookup' for this run?" Allow / Deny / Always / Never). Implementation plan can mark "ask" as phase 2 and leave exact UI location to implementation. |
| **Pattern precedence: explicit vs pattern** | **Decision:** **Explicit per-skill entry wins over pattern.** When resolving permission for a skill name, check explicit entries in `skill_permissions` first; if none match, then apply pattern rules (e.g. `doc-*: allow`). So a skill "doc-release" with explicit "deny" remains denied even if pattern "doc-*" is allow. Document in backend resolve logic and in bulk-permission UI. |
| **"Import from path"** | **Decision:** **Copy into a discovery path.** "Import" means: user picks an existing folder containing `SKILL.md`; we copy that folder into a chosen discovery base (e.g. `.puppet-master/skills/<name>` or `~/.config/puppet-master/skills/<name>`). We do not persist arbitrary external paths (keeps discovery simple and portable). Validate name and frontmatter after copy. |
| **Create skill when no project** | When no project is open (no project root), "Create new" skill: offer **global only** (e.g. `~/.config/puppet-master/skills/<name>`). Disable or hide "project" option when `project_root` is None. |
| **Edit: name change in frontmatter** | **Decision:** **Name in frontmatter must match directory name.** On save, if user changes `name` in frontmatter so it no longer matches the dir name: (1) reject with validation error "Name must match folder name", or (2) offer "Rename folder" to rename dir to match (then save). Prefer (1) for v1 to avoid accidental renames. |
| **How runners receive skills** | **Document per platform:** platform_specs (or orchestrator plan) should state for each platform how skills are passed (paths only vs full content; CLI env var vs prompt injection vs `skill` tool). **Implementation plan must list per platform (Cursor, Codex, Claude, Gemini, Copilot) how skill paths or content are passed (env, prompt, tool).** See §7.10 "Discovery and platform_specs" and §8.9.6. |
| **Tests** | Add unit tests: `discover_skills` (mock dirs, order and deduplication); `load_skill` (valid/invalid frontmatter, name validation, dir-name match); `resolve_skill_permission` (exact + wildcard, default allow). See §8.9.7. |

**Required scope** (fleshed out below in §7.11.1 and §7.11.2)

- **Shortcuts:** Export/import shortcut set; search/filter in list; show shortcut in tooltip or menu label.
- **Skills:** Bulk set permission by pattern; sort/filter list; preview skill body; last modified / version; validate all SKILL.md on disk.

#### 7.11.1 Shortcuts: export/import, search/filter, discoverability

Required. Use existing widgets; tag new helpers with DRY.

**Acceptance (summary):** (1) User can export current overrides to a JSON file and import from file with Replace/Merge and validation. (2) User can filter the shortcut list by action or key string; empty filter = all, non-empty with no match = empty list + "No shortcuts match...". (3) Menus/buttons that trigger shortcut actions show the binding in label or tooltip; when key map not loaded, show label only or "(Loading...)".

**1. Export / import shortcut set**

- **Purpose:** Backup, restore, or share shortcut overrides across machines or with other users.
- **Export:** Button "Export..." on Shortcuts tab opens a file picker (or native save dialog). Serialize current overrides only (or full key map) to JSON. Format: e.g. `{ "version": 1, "overrides": { "MoveToLineStart": "Ctrl+A", ... } }` using the same action-id and KeyBinding serialization as config. Include a `version` field for future compatibility. Write to user-chosen path. Success toast: "Exported N shortcuts."
- **Import:** Button "Import..." opens file picker; user selects a JSON file. Parse and validate: all action ids must exist, all bindings must be valid (no duplicate action binding; optional conflict check). Then either **Replace** (set `GuiConfig.shortcuts` to imported overrides, persist) or **Merge** (imported wins on conflict; merge into existing overrides). Show confirmation modal: "Replace current shortcuts with N from file?" or "Merge N shortcuts from file?" with Cancel / Replace or Merge. On success, rebuild key map and persist; toast "Imported N shortcuts."
- **Backend:** `export_shortcuts_to_json(overrides: &ShortcutOverrides) -> String` (DRY:FN); `import_shortcuts_from_json(json: &str) -> Result<ShortcutOverrides>` with validation (DRY:FN). Reuse same serialization as GuiConfig.shortcuts so format is consistent.
- **Edge cases:** Empty overrides in file → valid (clear overrides if Replace). Unknown action id in file → skip or reject entire import; document to skip unknown and import known only, or reject with "Unknown action: X". **Invalid JSON or unparseable file:** Reject entire import with toast "Invalid shortcut file" (do not apply partial data). **Import would create duplicate binding** (same key for two actions): run `validate_shortcut_binding` after merge; if invalid, reject with "Conflict: key already used by &lt;Action&gt;" or apply and steal; implementation must decide (recommend reject). **Export format version:** Include `version: 1` in export; on import, if version &gt; supported, reject with "Unsupported shortcut file version."

**2. Search / filter in shortcut list**

- **Purpose:** When many actions exist, quickly find by action name or by key binding.
- **GUI:** Text field above the shortcut list (e.g. "Filter by action or shortcut"). As user types, filter the list: show only rows where the action label (e.g. "Move to start of current line") or the shortcut display string (e.g. "Ctrl+A") contains the filter text (case-insensitive substring). Empty filter = show all. Optional "Clear" button or clear on Escape. Use `styled_text_input`; no new widget.
- **Backend:** Filtering is in-memory on the list already built for the view. No new backend type; view holds filter string and filters the list of (ShortcutAction, KeyBinding) before rendering. Optional: `filter_shortcut_list(entries: &[(ShortcutAction, KeyBinding)], query: &str) -> Vec<...>` (DRY:FN) if used in more than one place.
- **Empty filter vs no matches:** Empty filter shows all rows. When filter is non-empty and no row matches, show empty list plus a single inline message (e.g. "No shortcuts match '...'") so the user distinguishes "no match" from "no shortcuts loaded."

**3. Show shortcut in tooltip or menu label**

- **Purpose:** Discoverability--user sees the key binding where the action is available (menus, buttons) without opening the Shortcuts tab.
- **Where:** Any UI that triggers an action that has a shortcut: e.g. menu item "Kill to end of line", button that cancels a popover. Show the binding in the label or in a tooltip: "Kill to end of line (Ctrl+K)" or tooltip "Shortcut: Ctrl+K".
- **Implementation:** When building menu or button labels for actions that have a shortcut, resolve the current binding from the key map (or defaults + overrides) and append to the label or set as tooltip. Single helper: `shortcut_label(action: ShortcutAction, key_map: &KeyMap) -> String` or `format!("{} ({})", action_label, binding_display)`. Use it everywhere we show an action that has a shortcut. DRY:FN or DRY:HELPER.
- **Edge cases:** If user removed the binding (e.g. no shortcut for that action), show only the action label with no "(...)" or show "No shortcut". Keep tooltip/label in sync with key map after changes. **When key map not yet loaded** (e.g. config not loaded at init): show action label only (no key suffix) or placeholder "(Loading...)"; never show blank or "(undefined)".

**Checklist:** See §8.10.1.

#### 7.11.2 Skills: bulk permission, sort/filter, preview, last modified, validate all

Required. Use existing widgets; tag new helpers with DRY.

**1. Bulk set permission by pattern**

- **Purpose:** Set allow/deny/ask for many skills at once (e.g. "Allow all doc-*", "Deny all internal-*").
- **Acceptance criteria:** User enters pattern (e.g. `doc-*`) and selects Allow/Deny/Ask; Apply shows confirmation with count; on confirm, config is updated and persisted; list reflects new permissions; explicit per-skill overrides pattern (see precedence below).
- **GUI:** "Bulk permission" or "Set by pattern" on Skills tab: pattern input (e.g. `doc-*`, `internal-*`) + dropdown (Allow / Deny / Ask) + "Apply" button. On Apply, resolve all discovered skills whose name matches the pattern (same wildcard semantics as `resolve_skill_permission`). Show confirmation modal: "Set Allow for 3 skills matching doc-*?" with Cancel / Apply. On confirm, update `GuiConfig.skill_permissions`: add or update pattern entry (e.g. `"doc-*": "allow"`) or set per-skill entries for each match. Persist config. Toast: "Updated permission for N skills."
- **Precedence:** **Explicit per-skill wins over pattern** (so "doc-release" with explicit "deny" is still denied when pattern "doc-*" is allow). Backend already supports this if we store both pattern and explicit entries and resolve with explicit first. Document in UI (e.g. tooltip or help).
- **Backend:** No new function required if we only add/update pattern entries in skill_permissions. Optional: `apply_bulk_permission(permissions: &mut SkillPermissions, pattern: &str, permission: Permission, discovered: &[SkillInfo])` (DRY:FN) to compute matching names and update config.
- **Error handling:** If config persist fails after Apply, show error toast; do not update in-memory state as "saved" so user can retry.

**2. Sort / filter list**

- **Purpose:** Find skills quickly and order by name, source, or permission.
- **Acceptance criteria:** User can sort by Name, Source, or Permission; filter by text (name/description), source (All / Project / Global), and permission (All / Allow / Deny / Ask); combined filters apply; sort preference persists (session or GuiConfig).
- **Sort:** Column headers or a "Sort by" dropdown: **Name** (alphabetical by skill name), **Source** (project first, then global; within each by name), **Permission** (allow, then ask, then deny; within each by name). Store last-chosen sort in session or in GuiConfig (e.g. `skills_list_sort: "name" | "source" | "permission"`) so it persists across opens.
- **Filter:** (1) Text filter: substring match on name and description (case-insensitive). (2) Source: All | Project only | Global only. (3) Permission: All | Allow | Deny | Ask. Combine filters; show only skills that match all. Use styled_text_input and dropdowns/toggles from widget catalog.
- **Backend:** Sort and filter are in-memory on `discover_skills` + permission resolve result. Optional: `sort_skills(skills: &mut [SkillInfo], by: SortBy, permissions: &SkillPermissions)` and `filter_skills(skills: &[SkillInfo], query: &str, source: Option<SkillSource>, permission: Option<Permission>) -> Vec<SkillInfo>` (DRY:FN) if reused.
- **Data flow:** List is built from `discover_skills(project_root)` then permission-resolved; sort and filter apply in-memory to that list; no re-discovery on sort/filter change.

**3. Preview skill body**

- **Purpose:** View the raw markdown body of a skill without opening the editor.
- **Acceptance criteria:** Selecting a skill in the list shows its body in a read-only pane (Skills tab); content is load-on-demand; user can copy text; "Edit" opens full editor. If load fails (missing file, invalid frontmatter), show error in pane instead of body.
- **GUI:** When user selects a skill in the list (single click or "Preview" button), show the body of `SKILL.md` in a read-only pane (e.g. right panel or bottom drawer, or modal). Content = markdown body only (no frontmatter), or full file with frontmatter collapsed. Use scrollable selectable text (or selectable_label_mono for code-like display) so user can copy. "Edit" button opens the full editor. Load on demand when selection changes; do not load all bodies up front.
- **Backend:** Reuse `load_skill(path)`; expose `.body` or equivalent on SkillInfo. If SkillInfo currently omits body to save memory, add optional `body: Option<String>` populated on demand for preview, or a separate `load_skill_body(path) -> Result<String>` (DRY:FN).
- **Error handling:** If `load_skill` fails for selected skill (e.g. file deleted on disk), show message in preview pane (e.g. "Could not load skill: ...") and optionally refresh list.

**4. Last modified / version**

- **Purpose:** See when a skill was last changed; optional version for semantics.
- **Acceptance criteria:** List shows last modified (date or relative) per skill; preview pane can show same; optional version from frontmatter if we extend it.
- **Last modified:** For each skill, get file mtime: `std::fs::metadata(path).modified()` (or use a crate for cross-platform). Store in SkillInfo as `modified: Option<DateTime<Utc>>` (or SystemTime). Display in list row: "Modified: 2026-02-22" or "Modified: 2 days ago". Show in preview pane as well.
- **Version:** If frontmatter supports an optional `version` field (or under `metadata.version`), parse and show in list or preview. Not required by OpenCode; add only if we extend frontmatter. Otherwise "version" = last modified for display.
- **Backend:** Extend SkillInfo with `modified: Option<DateTime<Utc>>`; set in discovery or in load_skill from path metadata. Optional DRY:FN `skill_modified(path: &Path) -> Option<DateTime<Utc>>`.
- **Error handling:** If mtime cannot be read for a path (e.g. permission denied), show empty or "--" in list; do not exclude skill from list.

**5. Validate all SKILL.md on disk**

- **Purpose:** Check all discovered skills for valid frontmatter, name match, and description length without opening each file.
- **Acceptance criteria:** User clicks "Validate all" on Skills tab; all discovered skills are validated; results show in a full table (all skills) with status OK or Error + message; summary "N OK, M errors"; errors are copy-pasteable (selectable labels). See §7.11 for "show only errors vs full table" decision.
- **GUI:** "Validate all" button on Skills tab. On click, run validation for every discovered skill (same rules as load_skill: frontmatter, name 1-64 chars and regex, name matches dir, description 1-1024 chars). Show results in a **full table** (all discovered skills) with status column: OK or Error + message (e.g. "my-skill: name in frontmatter does not match folder name"). Summary: "N OK, M errors." Use selectable labels for copy-paste of errors. Optional filter: "Show only errors."
- **Backend:** `validate_skill(path: &Path) -> Result<(), ValidationError>` (DRY:FN) that reads SKILL.md, parses frontmatter, checks name and description and dir-name match; returns Ok(()) or Err with message. Then for each skill: `discover_skills` then for each path call `validate_skill`. No write; read-only. Reuse validation logic from load_skill to avoid duplication.
- **Error handling:** If a skill path becomes unreadable during validate-all, show Error with message (e.g. "Could not read file"); do not abort entire run -- continue and report per-skill.

**Checklist:** See §8.10.2.

**Implementation plan readiness**

- **Ready:** The spec (§7.7-§7.10) plus this subsection (§7.11) and checklists (§8.8, §8.9) are **sufficient for an implementer to produce a detailed implementation plan** for Puppet Master. All open decisions above are resolved or scoped (with "defer" or "v1 preference" where needed).

**Implementation plan checklist** (for implementer before drafting the implementation plan)

- [ ] Read §7.7-§7.11.2 (Shortcuts and Skills spec, gaps, and enhancements) and §8.8-§8.10.2 (implementation checklist items for Shortcuts and Skills).
- [ ] Resolve project path for Skills when no project is open: "Create skill" must offer global-only path (e.g. `~/.config/puppet-master/skills/<name>`); disable or hide project option when `project_root` is None (per §7.11 "Create skill when no project").
- [ ] Define Slint key-event integration point: where key events are captured (window vs focused widget, via `FocusScope` or window-level handler) and how KeyMap is applied; document in implementation plan (per §7.11 "Slint key event wiring").
- [ ] Confirm platform_specs (or orchestrator plan) documents how each platform receives skill list (paths vs content; CLI env vs prompt injection); implementation plan references this per platform.

**Dependencies**

- **Requires:** GuiConfig and Option B run config (Worktree plan) for Shortcuts/Skills config persistence and for cleanup config wiring used by the same flows. platform_specs (or equivalent) for skill injection per platform when integrating Skills with runners.
- Shortcuts have no dependency on Skills. Skills backend can stub `list_skills_for_agent` until orchestrator and platform_specs define how runners receive the skill list.

**Recommended implementation order** (integrated with cleanup, worktree, and plan)

1. **Cleanup and run config (foundation):** Core cleanup module (§8.1), wrapper and config wiring (§8.2), GuiConfig/run config with Option B (Worktree plan) so cleanup toggles and later Shortcuts/Skills config are in the same run config shape.
2. **Shortcuts:** After GuiConfig exists, implement in order: (a) backend types and default_shortcuts (§8.8.1-8.8.2); (b) GuiConfig.shortcuts and build_key_map, including config load failure (§8.8.3-8.8.4, 8.8.7); (c) validate_shortcut_binding (§8.8.5); (d) Shortcuts GUI list/edit/reset (§8.6.5, §8.8.6); (e) key event wiring (single subscription + KeyMap, no hardcoded bindings); (f) export/import, search/filter, discoverability (§8.10.1). Tests alongside (§8.8.8).
3. **Skills:** Skills backend can start after project path resolution exists (discovery uses project_root; when None, global-only paths per §7.11). Then Skills GUI (list, add/edit/remove, permissions, refresh); then integration (runners receive skill list per platform_specs). Tests alongside.
4. **Cleanup UX and optional worktree:** Cleanup UX (§8.6), "Clean workspace now," evidence retention (§8.5); optionally "Clean all worktrees" when worktree_manager is available (§9.1.8).
5. **Shortcuts/Skills enhancements:** §8.10.1 (export/import, search/filter, discoverability), §8.10.2 (bulk permission, sort/filter, preview, last modified, validate all).
6. **Pre-completion:** §8.7 (AGENTS.md checklist, Task Status Log).

---

