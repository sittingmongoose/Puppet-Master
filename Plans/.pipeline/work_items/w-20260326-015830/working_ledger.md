# Working Ledger

## Work Item
w-20260326-015830

## Mode
research

## Topic / Scope
Worktrees in assistant — thread-level worktree binding in assistant chat, worktree icon in thread selector, Source Control panel redesign for narrow viewport, file manager and LSP worktree context switching.

## Objective
Design and specify:
1. A worktree button in the assistant chat header with dropdown for per-thread worktree binding
2. A settings-level auto-create toggle (Branching tab, default Off)
3. A worktree icon in the thread selector sidebar
4. A redesigned Source Control panel using accordion layout to fix narrow-viewport tab overflow
5. A redesigned Worktrees section using single-column expandable rows
6. File manager worktree context switching with easy toggle-back
7. LSP worktree awareness via root_identity switching

## Constraints / Non-Goals
- No emojis in the GUI — all icons use proper theme-consistent glyphs from the icon set
- The orchestrator worktree list is NOT an option in the assistant chat dropdown — that dropdown is purely about assistant/thread worktrees
- This does not change orchestrator's own worktree management (lanes, tiers) — those remain as designed in WorktreeGitImprovement.md and Orchestrator_Page.md
- Source Control still owns worktree inventory, lineage, and recovery (GitHub_Integration.md §A.4)
- Orchestrator still owns cleanup posture; Source Control owns concrete archive/prune/remove actions
- This does not introduce a new worktree creation backend — it uses the existing `WorktreeManager` from WorktreeGitImprovement.md for `create_worktree`, `remove_worktree`, `list_worktrees`

## Key Facts and Findings

### Current state (from repo research)
- Source Control §A.4 has a Worktrees subview — first-class rows with worktree_id, path, branch, owner run/tier, status (dirty/conflict/orphaned/stale), actions (compare, open, recover, prune, lineage)
- Source Control §A.1 defines 5 subviews: Changes, History, Graph, Worktrees, Branches/Stash — these are currently tabs
- Orchestrator Progress tab has lane/worktree summary widgets; lane identity persists after worktree archived/removed
- Assistant chat header currently has: Platform, Model, Reasoning/effort, Mode selector, Persona, Context indicator — NO worktree awareness
- Thread selector is a persistent sidebar (not floating overlay) with badges: running, queued, blocked, attention_required, branch lineage labels — NO worktree icon
- FinalGUISpec cross-reference: WorktreeGitImprovement.md → Branching tab in Settings (§7.4), worktree recovery in Health tab
- LSP sessions keyed by (host_id, server_id, root_identity) — different worktree path = different root_identity = naturally separate LSP session
- Auto-create worktree setting: project-level, persisted in redb alongside other branching config

### Storage model (existing)
- `worktree_record.v1:{project_id}:{worktree_id}` — already defined in storage-plan.md
- `worktree_projection.v1:{project_id}:{worktree_id}` — already defined
- `thread_state:{thread_id}:persona_override` — existing pattern for per-thread redb state
- `run.background_enqueued` seglog event already has optional `worktree_path` and `branch_name` fields
- `execution_unit_context` in Executor_Protocol.md already has `worktree_id?` field
- Safe points reference `worktree_path` or equivalent execution root
- `project_state` in redb includes `selected repo/worktree, panel subviews`

### FileSafe integration (existing)
- `BaseRunner` receives `working_directory` which may be a worktree path
- `check_file_write` resolves paths relative to `working_directory`
- Guards handle worktree symlinks
- Write-scope checks account for worktree structure
- No worktree-specific changes needed per FileSafe §17 — guard applies to commands executed in worktrees

### Narrow viewport problem (Source Control panel)
- The panel is narrow (side panel width)
- 5 horizontal tabs require horizontal scrolling which is awkward UX
- Within the Worktrees tab, info is squashed, doesn't fit in boxes, looks broken
- Content does not adapt well to narrow width

## Gaps / Problems Identified
- assistant-chat-design.md has no worktree concept at all — needs new section
- FinalGUISpec thread selector spec needs worktree icon addition
- Source Control tab-based layout needs to be replaced with accordion
- WorktreeGitImprovement.md §4 GUI section needs to reference assistant chat integration
- Worktrees section content layout needs complete rethink for narrow viewport
- File manager needs worktree context switching behavior specified
- Thread ↔ worktree binding is a new data model concept — needs storage-plan alignment (new redb key family)
- Cleanup policy for assistant-created worktrees needs spec
- No `thread_state:{thread_id}:worktree_binding` key exists yet
- No seglog events for assistant worktree lifecycle exist yet
- UI_Command_Catalog has no `cmd.chat.worktree.*` commands
- Terminal context (cwd) for worktree-bound threads not specified

## Candidate Fixes / Design Directions

### 1. Assistant Chat Header — Worktree Button

**Placement:** Chat header strip, after the Reasoning/effort control (rightmost existing control). The header strip currently contains: Platform, Model, Reasoning/effort. The Worktree button is appended after these. Mode buttons (Ask, Agent, Debug, Plan, Deep Plan) are separate from the header strip and not adjacent to this button.

**Visual states:**
- **Unbound (default):** Dimmed worktree glyph icon. No label text. Tooltip: "No worktree — click to create"
- **Bound, clean:** Lit/active worktree glyph icon. Tooltip shows branch name. No label text.
- **Bound, dirty:** Lit worktree glyph with a small dot indicator (same pattern as unsaved-file dot in editor tabs). Tooltip: branch name + "uncommitted changes"
- **Bound, conflict:** Lit worktree glyph with warning indicator (triangle). Tooltip: branch name + "merge conflict"

**Dropdown contents when NO worktree bound:**

| Row | Type | Action |
|-----|------|--------|
| `None` | Selected label | No action (current state) |
| `Create Worktree…` | Action row | Opens Create Worktree dialog |

**Dropdown contents when worktree IS bound:**

| Row | Type | Action |
|-----|------|--------|
| Branch name | Info label (e.g. `assistant/fix-auth-bug`) | No action |
| Path | Info sublabel (truncated, e.g. `.puppet-master/worktrees/wt-3`) | No action |
| Status | Pill (clean/dirty/conflict) | No action |
| separator | --- | --- |
| `Unbind` | Action row | Detaches worktree from thread; worktree remains on disk |
| `Merge into Base…` | Action row | Opens merge confirmation dialog (squash/merge/rebase) |
| `Create PR…` | Action row | Opens PR creation panel with pre-filled fields |
| `Remove Worktree` | Action row (destructive) | Detaches AND prunes; shows confirmation if dirty |

**Behavior rules:**
- Changing binding mid-thread is allowed; change applies to the next turn (same semantics as platform/model changes per §1.1)
- While a turn is in-flight, the dropdown is read-only (no binding changes during execution)
- `Unbind` sets thread binding to None; agent's next turn uses main project dir
- `Remove Worktree` calls `WorktreeManager::remove_worktree`, then sets binding to None
- Remove is blocked with error toast if worktree has an active run in any thread or orch tier
- The button is visible in all chat modes (Ask, Agent, Debug, Plan, Deep Plan)

### 2. Settings GUI — Branching Tab

**New settings (project-level, persisted in redb):**

| Setting key (redb) | Type | Default | UI label | Description |
|-----|------|---------|----------|-------------|
| `config:project:{pid}:branching.assistant_auto_worktree` | bool | `false` | "Auto-create worktree for new assistant threads" | When true, new threads auto-create a worktree |
| `config:project:{pid}:branching.assistant_worktree_cleanup_default` | enum(`ask`, `keep`, `remove`) | `ask` | "When deleting a thread with a worktree" | Default cleanup behavior; `ask` shows modal |
| `config:project:{pid}:branching.assistant_worktree_base_ref` | string | `""` (empty = use `base_branch`) | "Base branch for assistant worktrees" | Override base ref; empty inherits from branching.base_branch |
| `config:project:{pid}:file_manager.worktree_follow_thread` | bool | `true` | "File manager follows active thread's worktree" | When true, file manager switches on thread focus; when false, stays on main project root |
| `config:project:{pid}:branching.worktree_warning_threshold` | integer | `10` | "Worktree count warning threshold" | Show advisory toast when total worktrees exceed this count; 0 = disabled |
| `config:project:{pid}:branching.worktree_create_timeout_s` | integer | `30` | "Worktree creation timeout (seconds)" | Abort `git worktree add` if it exceeds this duration |

**UI placement:** Settings > Branching tab, new subsection "Assistant Worktrees" below existing branching controls.

### 3. Thread Selector — Worktree Icon

**Layout within thread row:**
```
┌───────────────────────────────┐
│ [status_badge]                │
│ [worktree_icon]  Thread Title │
│                  subtitle...  │
└───────────────────────────────┘
```

- **Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention)
- **Icon:** Theme-consistent branch/tree glyph from icon set (not emoji)
- **Size:** Same size as status badge icons (consistent visual weight)
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip content:**
  - Line 1: Branch name (e.g. `assistant/fix-auth-bug`)
  - Line 2: Status pill text (e.g. `clean`, `dirty`, `conflict`)
  - Line 3: Worktree path (e.g. `.puppet-master/worktrees/wt-abc123`)
- **Icon color/state:**
  - Clean: default icon color (theme token: `icon-secondary`)
  - Dirty: warning color (theme token: `accent-warning` or equivalent per theme)
  - Conflict: error color (theme token: `accent-error` or equivalent per theme)
  - Note: PM uses token-based theming (three built-in themes: Retro Dark, Retro Light, Basic Modern). Icon colors must resolve through theme tokens, not hardcoded hex values.

### 4. Source Control Panel — Accordion Redesign

**Replace horizontal tab bar** with vertically stacked collapsible section headers (accordion pattern).

**Section order (top to bottom):**
1. Changes
2. Worktrees
3. Branches / Stash
4. History
5. Graph

Rationale for reorder: Changes and Worktrees are the most frequently used in day-to-day work; History and Graph are less frequent. Placing Changes first matches VS Code convention.

**Accordion behavior:**
- Section headers always visible, full panel width
- Click header to expand/collapse
- Multiple sections can be open simultaneously
- Header shows section name + item count badge (e.g. "Changes (3)", "Worktrees (2)")
- Expanded section content gets full panel width, scrolls independently within its region
- When total expanded content exceeds panel height, the accordion itself scrolls vertically (section headers stay in scroll flow, not pinned)

**Default open sections on first load:** Changes (expanded), all others collapsed.

**Persistence:** Section open/close state persisted in redb per project: `config:project:{pid}:source_control.accordion_state` — JSON object of `{ section_id: bool }`.

**Keyboard navigation:**
- Tab between section headers
- Enter/Space to toggle expand/collapse
- Arrow keys to move between headers
- When expanded, Tab moves into section content; Escape returns to header

**Accessible labels:** Each section header gets `accessible-role: button` and `accessible-label: "{section_name}, {item_count} items, {expanded|collapsed}"`.

### 5. Worktrees Section — Single-Column Expandable Rows

**Compact row (default state):**
```
┌─────────────────────────────────────┐
│ [wt_icon] assistant/fix-auth   [>]  │
│           dirty · Thread: Auth fix    │
└──────────────────────────────────────┘
```

- Line 1: worktree glyph icon + branch name (truncated with ellipsis if needed) + expand chevron
- Line 2: status pill + owner label (truncated, tooltip for full)
- Owner format: `Thread: <thread_title>` or `Orch: <tier_label>` or `Manual`
- Full-width click target for expand/collapse (not just the chevron)

**Expanded row:**
```
┌─────────────────────────────────────┐
│ [wt_icon] assistant/fix-auth   [v]  │
│           dirty · Thread: Auth fix  │
│                                     │
│   Path  .puppet-master/worktrees/wt-abc123│
│   Base  main                        │
│   Age   2m ago                      │
│                                     │
│   [Open Files] [Compare] [Merge] [Remove]   │
│   [Create PR] [Open Thread]                  │
└─────────────────────────────────────┘
```

- Detail fields: Path (full, selectable/copyable), Base ref, Created/age
- Action buttons: stacked or wrapped, not crammed into one line
- `Open Files` — opens worktree root in file manager
- `Compare` — opens diff between worktree branch and base
- `Merge` — opens merge confirmation dialog (§48); only shown for assistant-owned and manual worktrees (not orch-owned)
- `Create PR` — opens PR creation panel with pre-filled fields (§48); only shown when project has GitHub remote
- `Remove` — calls remove_worktree (with confirmation if dirty or thread-bound)
- `Open Thread` — navigates to the owning thread in assistant chat (only shown for thread-owned worktrees)
- For orch-owned worktrees: `Open Thread` replaced with `Open Lane` (navigates to Orchestrator lane view)

**Filtering:**
- Filter bar at top of Worktrees section: segmented control with `All | Threads | Orchestrator | Manual`
- Default: `All`
- Filter state persisted per project in redb: `config:project:{pid}:source_control.worktree_filter`
- Empty state per filter: "No {filter} worktrees" with appropriate guidance text

**Sorting:** By creation time descending (newest first). No user-configurable sort in MVP.

### 6. File Manager — Worktree Context Switch

**Trigger:** When user switches to a thread that has a worktree binding, and the setting `file_manager.worktree_follow_thread` is `true` (default), the file manager switches its root to show the worktree's file tree.

**Breadcrumb indicator:**
```
┌─────────────────────────────────────┐
│ [wt_icon] assistant/fix-auth [swap] │
├─────────────────────────────────────┤
│  src/                               │
│  tests/                             │
│  Cargo.toml                         │
│  ...                                │
└─────────────────────────────────────┘
```

- Breadcrumb bar at top of file manager tree shows: worktree glyph + branch name + swap toggle icon
- Clicking swap icon switches to main project root; indicator changes to: folder glyph + "Project Root" + swap icon
- Swap is a binary toggle between worktree root and main project root
- **Accessible label:** "Viewing worktree assistant/fix-auth. Click to switch to project root." (and inverse)

**Behavior rules:**
- Toggle state resets to "show active thread's context" on thread switch (default)
- If `file_manager.worktree_follow_thread` is `false`, file manager always shows main project root regardless of thread
- When thread has no worktree, breadcrumb shows project root with no swap icon
- Open editor tabs are NOT affected by file manager root switch — tabs retain their own paths. The file manager tree view changes, not the editor.
- File manager search scope follows the current file manager root (worktree or project)

**Edge case — thread unbound mid-session:** If user unbinds a worktree while file manager is showing it, file manager falls back to main project root with a brief toast: "Worktree unbound — showing project root."

### 7. LSP — Worktree Awareness

**Mechanism:** LSP sessions are already keyed by `(host_id, server_id, root_identity)` per LSPSupport.md. A worktree has a different filesystem path = different root_identity. No new keying model needed.

**Thread focus change flow:**
1. User switches to thread with worktree binding
2. File manager root changes to worktree path (per §6 rules)
3. LSP client sends `workspace/didChangeWorkspaceFolders` notification (remove old root, add worktree root)
4. Or: if the LSP server doesn't support dynamic workspace folders, a new LSP session is initialized for the worktree root (lazy — only when the user opens a file from that worktree)
5. Diagnostics, hover, completion etc. all operate against the worktree's file state

**Performance concern:** Many worktrees = many potential LSP sessions. Mitigation: LSP sessions for worktrees are lazy-initialized (only when a file from that worktree is opened in the editor) and can be idle-collected after configurable timeout.

**LSP session lifecycle:**
- Created: when first file from worktree is opened in editor
- Active: while files from that worktree are open
- Idle timeout: collected after 5 minutes with no open files from that worktree (configurable)
- Destroyed: when worktree is removed

### 8. Create Worktree Dialog

**Trigger:** "Create Worktree…" action from chat header dropdown.

**Dialog fields:**

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Branch name | Text input | `assistant/thread-<short_id>` (temp name) | Must be valid git branch name; must not already exist (or auto-append suffix) |
| Base ref | Dropdown | Value of `branching.assistant_worktree_base_ref` or `branching.base_branch` if empty | Must be an existing branch/ref |

**Buttons:** `Create` (primary), `Cancel` (secondary)

**Create flow (step by step):**
1. User clicks `Create Worktree…` in dropdown
2. Dialog opens with pre-filled temp branch name and base ref
3. User optionally edits branch name and/or base ref
4. User clicks Create
5. Backend calls `WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)` where `worktree_path` is auto-generated under `.puppet-master/worktrees/`
6. On success: new `worktree_record` written to redb; `thread_state:{thread_id}:worktree_binding` written; `chat.thread_worktree_bound` seglog event emitted; dialog closes; chat header button updates to bound state
7. On failure: dialog shows inline error (e.g. "Branch already exists", "Git error: ..."); dialog stays open for retry
8. Thread selector icon appears immediately on binding

### 9. Auto-Create Flow (when setting is On)

**Trigger:** New thread creation while `branching.assistant_auto_worktree` is `true`.

**Step by step:**
1. User creates new thread (via `cmd.chat.new` or first message in fresh chat)
2. System generates temp branch name: `assistant/thread-<short_id>` where `<short_id>` is first 8 chars of `thread_id`
3. System calls `WorktreeManager::create_worktree(temp_branch_name, base_ref, auto_path)`
4. On success: binding created immediately; thread starts with worktree active
5. On failure: thread created without worktree; warning toast "Could not create worktree: {error}. Thread will use project root."; user can manually create later via dropdown
6. **Title rename flow:** After first assistant response, thread title is auto-generated. System then:
   a. Sanitize title for git branch name (lowercase, replace spaces with hyphens, strip special chars, truncate to 50 chars)
   b. Compute target: `assistant/<sanitized_title>`
   c. If target branch name exists: auto-append `-2`, `-3`, etc. until free
   d. Call `git branch -m <temp_name> <target_name>` inside the worktree
   e. Update `worktree_record` and `thread_state` binding with new branch name
   f. Emit `chat.thread_worktree_renamed` seglog event
   g. On rename failure: keep temp name, no user interruption, log warning

### 10. Thread ↔ Worktree Binding Data Model

**New redb key family:**
- Key: `thread_state:{thread_id}:worktree_binding`
- Value (JSON):
```json
{
  "worktree_id": "wt-abc123",
  "branch_name": "assistant/fix-auth-bug",
  "worktree_path": ".puppet-master/worktrees/wt-abc123",
  "bound_at_utc": "2026-03-26T02:45:00Z",
  "binding_origin": "manual | auto_create",
  "temp_branch_name": "assistant/thread-a1b2c3d4"
}
```

**Inverse lookup (for 1:1 enforcement):**
- Key: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Used to quickly check if a worktree is already bound to another thread

**Worktree record extension (existing `worktree_record.v1`):**
- Add optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_tier_id?`
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_tier_id`, or neither (manual) is set

### 11. Seglog Events (new)

| Event type | Fields | Description |
|------------|--------|-------------|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` (`manual` or `auto_create`) | Thread bound to worktree |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` (`user_unbind`, `user_remove`, `thread_delete`, `path_missing`) | Thread unbound from worktree |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` | Branch renamed after title generation |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` | Worktree creation failed |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy` (`squash`, `merge`, `rebase`), `result_commit_sha` | Worktree branch merged into target |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` (bool) | Merge attempt failed |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` | PR created from worktree branch |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` (`push` or `api`) | PR creation failed (push or API error) |

### 12. Command Catalog (new entries)

| Command ID | Slash command | Parameters | Seglog events | Surface |
|------------|---------------|------------|---------------|---------|
| `cmd.chat.worktree.create` | `/worktree create` | `{ thread_id, branch_name?, base_ref? }` | `chat.thread_worktree_bound` | Assistant chat dropdown, command palette |
| `cmd.chat.worktree.unbind` | `/worktree unbind` | `{ thread_id }` | `chat.thread_worktree_unbound` | Assistant chat dropdown, command palette |
| `cmd.chat.worktree.remove` | `/worktree remove` | `{ thread_id }` | `chat.thread_worktree_unbound` | Assistant chat dropdown, command palette |
| `cmd.chat.worktree.merge` | `/worktree merge [--squash\|--rebase]` | `{ thread_id, strategy?: squash|merge|rebase, target_branch?, message? }` | `chat.thread_worktree_merged` | Assistant chat dropdown, Source Control, command palette |
| `cmd.chat.worktree.pr` | `/worktree pr` | `{ thread_id, title?, body?, target_branch? }` | `chat.thread_worktree_pr_created` | Assistant chat dropdown, Source Control, command palette |
| `cmd.chat.worktree.info` | `/worktree` | `{ thread_id }` | (none, read-only) | Assistant chat, command palette |

Rules:
- `cmd.chat.worktree.create` uses the existing `WorktreeManager` backend — no new worktree creation logic
- `cmd.chat.worktree.remove` is gated: blocked if worktree has active run; shows confirmation modal if dirty
- Slash commands are secondary access; primary access is the chat header dropdown

### 13. Cleanup Flow (thread delete)

**Trigger:** Thread is deleted while it has a worktree binding.

**Integration with existing delete confirmation:** Thread deletion already has a confirmation dialog ("delete permanently with confirmation"). When a worktree binding exists, the cleanup options are **embedded into the existing delete confirmation dialog** — not shown as a separate modal. This prevents a two-dialog sequence.

**Flow (step by step):**
1. User initiates thread delete
2. System checks `thread_state:{thread_id}:worktree_binding`
3. If no binding: show standard delete confirmation ("Delete this thread?"), proceed normally
4. If binding exists, check `branching.assistant_worktree_cleanup_default` setting:
   - `ask` (default): show extended delete confirmation (see below)
   - `keep`: show standard delete confirmation; on confirm, silently unbind, keep worktree on disk
   - `remove`: show standard delete confirmation; on confirm, silently remove worktree if clean; if dirty, fall through to `ask` behavior
5. **Extended delete confirmation UI (when setting is `ask`):**
   - Title: "Delete thread?"
   - Body: "This thread is bound to worktree `assistant/fix-auth-bug`."
   - If dirty: additional warning line: "This worktree has uncommitted changes."
   - Button 1: "Delete and keep worktree" — deletes thread, unbinds, worktree remains as orphaned/manual
   - Button 2: "Delete and remove worktree" — deletes thread, unbinds AND prunes; if dirty, button label becomes "Delete and remove worktree (has changes)" with destructive styling
   - Button 3: "Cancel" — abort delete
6. After cleanup action: `chat.thread_worktree_unbound` seglog event emitted with appropriate `reason`

### 14. FileSafe Integration

**No changes to FileSafe itself.** The existing `working_directory` mechanism handles worktrees:
- When agent runs in a worktree-bound thread, the execution context sets `working_directory` to the worktree path
- `check_file_write` resolves paths relative to `working_directory` (already handles worktree symlinks)
- Write-scope checks account for worktree structure
- This is the same path used by orchestrator tiers — assistant threads just use the same mechanism

**Thread-to-working-directory resolution:**
1. Chat runtime resolves thread's worktree binding from `thread_state:{thread_id}:worktree_binding`
2. If bound: `working_directory = worktree_path`; if not: `working_directory = project_root`
3. This resolution happens once at turn start and is frozen for the duration of the turn
4. Mid-turn binding changes do not affect the in-flight turn

### 15. Terminal Context

When a user opens a terminal from within a worktree-bound thread context:
- Terminal `cwd` is set to the worktree path, not the main project root
- Terminal `cwd_snapshot` in `terminal_session_record` records the worktree path
- If the worktree is later removed, terminal retains its original cwd (which may now be a stale path — terminal shows appropriate error if user tries to execute in removed dir)

### 16. Source Control Changes View Interaction

When a thread with a worktree binding is focused:
- The Source Control `Changes` section continues to show the main project root's changes by default
- Worktree-specific changes are visible within the worktree's row in the Worktrees section (expand to see diff/status)
- **Not MVP:** A future enhancement could allow Changes to scope to the active worktree. For now, Changes always shows main repo changes.

### 17. Error Handling

| Error scenario | User-visible behavior |
|---------------|----------------------|
| `create_worktree` fails (git error) | Dialog stays open with inline error: "{git error message}". User can retry or cancel. |
| Auto-create fails on new thread | Thread created without worktree. Warning toast: "Could not create worktree: {error}". Dropdown shows None. |
| Branch rename fails after title gen | Keep temp branch name. No user interruption. Log warning. Tooltip shows temp name. |
| Worktree path no longer exists (e.g. manual deletion outside PM) | On next thread focus: detect missing path, show warning toast "Worktree path missing — unbinding", auto-unbind, emit `worktree_unbound` with reason `path_missing`. |
| Remove blocked by active run | Error toast: "Cannot remove — worktree has an active run in {owner}". Remove button disabled with tooltip. |
| Branch name collision during create | Auto-append numeric suffix (`-2`, `-3`, …) up to 10 attempts. If all collide: dialog error "Could not find available branch name". |
| 1:1 violation attempt | If user tries to bind a worktree already bound to another thread: error toast "This worktree is already bound to thread '{title}'". Action blocked. |
| Disk space / permission error during create | Dialog inline error with the OS-level error message. |
| Merge fails mid-operation (git error, not conflict) | Dialog shows inline error: "Merge failed: {git error}". Main repo state is unchanged (git merge auto-aborts on error). Dialog stays open for retry or cancel. |
| Merge conflict during squash/merge/rebase | Dialog closes. Conflict markers written to files. Source Control highlights conflicted files. User resolves via conflict editor, then re-triggers merge. |
| Fetch before merge fails (offline, no remote) | Advisory toast: "Could not fetch latest — merging against local state." Merge proceeds with local branch state. |
| Push fails before PR creation | Error toast: "Could not push branch: {error}". PR panel does NOT open. User can retry or push manually. |
| PR API call fails | Error toast: "PR creation failed: {error}". Seglog `chat.thread_worktree_pr_failed` emitted with `phase=api`. |
| No GitHub remote for PR | Error toast: "No GitHub remote configured — cannot create PR." |
| Target branch deleted between dialog open and merge execution | Inline error in dialog: "Target branch '{branch}' no longer exists." Merge aborted. |
| No undo for completed merge | No dedicated undo mechanism. User can `git reset --hard` or `git revert` via terminal or agent bash. Merge is a significant, intentional git operation. |

### 18. Acceptance Criteria

**Chat header worktree button:**
1. Button visible in chat header for all modes (Ask, Agent, Debug, Plan, Deep Plan)
2. Dropdown shows correct options based on binding state
3. Create Worktree dialog creates a working worktree and binds it to the thread
4. Unbind detaches without deleting the worktree from disk
5. Remove detaches and prunes (with dirty confirmation)
6. Icon state updates in real time when worktree status changes (clean→dirty, etc.)
7. Binding change applies to the next turn, not the current in-flight turn
8. Dropdown is read-only while a turn is in-flight

**Settings:**
9. Auto-create toggle creates worktrees for new threads when enabled
10. Cleanup default setting controls modal behavior on thread delete
11. File manager follow setting controls whether file manager tracks thread worktree
12. All settings persist across app restart

**Thread selector icon:**
13. Icon appears immediately when worktree is bound
14. Icon disappears immediately when worktree is unbound
15. Icon color reflects worktree status (clean/dirty/conflict)
16. Hover tooltip shows branch name, status, path

**Accordion redesign:**
17. All 5 Source Control sections are accessible without horizontal scroll
18. Section expand/collapse state persists across sessions
19. Multiple sections can be open simultaneously
20. Keyboard navigation works per accessibility spec

**Worktree section layout:**
21. All worktree info is readable without horizontal scroll
22. Expanded rows show full path, base ref, age, and action buttons
23. Filter between All/Threads/Orchestrator/Manual works correctly
24. Thread-owned worktrees show "Open Thread" action that navigates to the thread

**File manager:**
25. File manager switches to worktree root on thread focus change (when setting enabled)
26. Breadcrumb toggle switches between worktree root and project root
27. Toggle resets on thread switch
28. Editor tabs are not affected by file manager root switch

**LSP:**
29. LSP diagnostics reflect worktree file state, not main project state
30. LSP sessions are lazy-initialized per worktree
31. LSP sessions idle-collected after timeout with no open files

**Lifecycle:**
32. Auto-create uses temp branch name, renames after title generation
33. Branch name collision handled by numeric suffix
34. Cleanup modal appears on thread delete when setting is `ask`
35. 1:1 binding enforced — cannot bind a worktree already bound to another thread

**Edge cases (from sweep):**
36. Worktree button hidden when project has no git repo
37. Remote SSH project: worktree created on remote host, not locally
38. Ask mode: worktree creation allowed (infrastructure, not a file edit)
39. File-edit card paths resolve correctly relative to worktree working_directory
40. Thread export excludes worktree binding metadata
41. Concurrent auto-create serialized per project; no race on branch names or 1:1 keys
42. Soft warning toast at configurable worktree count threshold (default 10)
43. Completed/failed threads retain worktree binding until user deletes thread or unbinds

**Sweep 2 — status, accessibility, loading:**
44. Chat header icon and thread selector icon reflect projection dirty_state/conflict_state reactively
45. Stale projection shows desaturated icon with tooltip suffix
46. Loading indicator visible during worktree creation (button pulse, dialog "Creating…")
47. Screen reader announces worktree creation, unbind, removal, status changes via aria-live="polite"
48. All worktree controls have accessible labels
49. Accordion layout usable at 240px minimum panel width
50. Filter bar degrades to icon-only below 280px
51. `@file` in worktree-bound thread resolves relative to worktree root

**Sweep 3 — integration, correctness, resilience:**
52. Worktree button positioned after Reasoning/effort control in chat header
53. Delete confirmation dialog integrates cleanup options when thread has worktree (no separate modal)
54. On app restart, stale worktree bindings auto-unbind lazily on first thread focus with toast
55. Branch names sanitized via shared helper (lowercase, hyphens, stripped invalid chars, 50-char max)
56. Worktree creation aborts after 30s timeout with cleanup and error message
57. `cmd.chat.revert` correctly restores worktree files via absolute paths in mutation log
58. MCP tools/providers receive worktree path as working_directory
59. Icon colors resolve through theme tokens across all three built-in themes

**Sweep 4 — permissions, persistence, validation, scoping:**
60. Worktree creation/removal not gated by agent permission system (user/system-initiated only)
61. Orchestrator→Assistant handoff creates thread without worktree binding (no orch worktree transfer)
62. Redb worktree binding keys rebuildable from seglog replay of bound/unbound events
63. Settings validation: timeout clamped 5–300s, threshold clamped 0–100, numeric steppers in UI
64. Quick-open (Ctrl+P) remains project-scoped regardless of active worktree context
65. Chat header worktree button (~32px icon) does not break header at narrow panel widths

**Merge-back flow:**
66. "Merge into Base…" action in chat dropdown opens merge confirmation dialog with strategy choice
67. "Create PR…" action in chat dropdown opens PR panel with pre-filled fields from worktree context
68. Source Control worktree expanded row shows Merge and Create PR buttons
69. Slash command `/worktree merge [--squash|--rebase]` and `/worktree pr` work as entry points (no separate squash/rebase commands)
70. Natural language merge requests ("merge my changes into main") show confirmation dialog pre-filled with agent's intent
71. Dirty worktree blocks merge with clear message; merge button disabled
72. Conflict during merge: UI path uses existing conflict resolution; NL path agent resolves conversationally
73. Post-merge modal asks Keep/Remove (follows cleanup_default setting)
74. PR creation requires configured GitHub remote; error toast if missing
75. Post-PR worktree stays bound; no cleanup modal triggered
76. Agent can chain commit→merge→cleanup in single natural language exchange
77. All merge-back actions available in all modes including Debug
78. Merge executes in main repo context (not inside worktree); git operations target main project dir
79. Auto-fetch runs before merge; proceeds with local state if offline (advisory toast)
80. Auto-push runs before PR creation; PR panel does NOT open on push failure
81. `chat.thread_worktree_pr_failed` seglog event emitted on push or API failure with phase field
82. Merge dialog traps focus, supports Escape/Tab/Enter, announces status via aria-live
83. NL merge shows confirmation dialog even in yolo mode — explicit user confirmation required
84. In Ask/Plan mode: user can merge via UI (dropdown/SC); agent cannot trigger merge via NL (mutation guard)
85. No undo for merge — user can `git reset`/`git revert` manually or via agent bash

### 19. Remote SSH Project Worktrees

**Rule:** Worktree creation follows the project's host authority. If the project is a remote SSH project (GitHub_Integration.md §C), `WorktreeManager` executes `git worktree add` on the remote host via the SSH subprocess — the same mechanism used for all remote git operations. The worktree path `.puppet-master/worktrees/` is on the remote filesystem.

**Constraints:**
- No silent local fallback — if the remote host is unreachable, worktree creation fails with an error in the create dialog
- Worktree path resolution, FileSafe `working_directory`, and terminal `cwd` all use the remote path (same as other remote-mode file operations)
- LSP sessions for remote worktrees are remote LSP sessions (already handled by LSPSupport.md's host_id keying)
- File manager shows remote worktree contents via the existing remote file browsing mechanism

### 20. No-Git-Repo Projects

**Rule:** When the active project has no git repository (added as plain folder per GitHub_Integration.md line 640):
- Worktree button is **hidden** in the chat header (not disabled — absent entirely)
- Auto-create setting has no effect (silently skipped, no error)
- Thread selector shows no worktree icon (no worktree possible)
- Source Control panel's Worktrees accordion section shows empty state: "No git repository"

### 21. Bind Existing Worktree

**Rule:** The assistant dropdown does NOT offer "Bind Existing Worktree" in MVP. Rationale:
- Assistant worktrees follow the `assistant/<title>` naming convention and are created under `.puppet-master/worktrees/`
- Binding an arbitrary pre-existing worktree (manual or orch-owned) would break the 1:1 ownership model (orch worktrees have `owner_tier_id`, manual worktrees have no owner)
- Users who want to work in an existing worktree can open it directly in the file manager; the assistant's `working_directory` is specifically about thread-owned worktrees
- **Future enhancement:** A "Bind Existing…" option could be added later with ownership-transfer semantics, but that is not MVP scope

### 22. Thread Lifecycle Terminology Correction

**Correction:** Threads have `delete` (permanent, with confirmation) but NOT `archive` as a lifecycle state. The thread states are: `active`, `attention_required`, `blocked`, `completed`, `failed`.

**Revised cleanup trigger:** Cleanup flow (§13) triggers on **thread delete** only:
- When user deletes a thread that has a worktree binding, the cleanup modal/policy applies
- Completed/failed threads retain their worktree binding indefinitely until the user explicitly deletes the thread or unbinds via the dropdown
- The setting label should read: "When deleting a thread with a worktree" (not "archiving")

### 23. Ask Mode and Worktree Creation

**Rule:** Worktree creation and binding are allowed in all chat modes including Ask mode. Rationale:
- Worktree creation is project infrastructure management, not a file edit — it is orthogonal to the read-only constraint of Ask mode
- A user may create a worktree in Ask mode and then switch to Agent mode to begin coding
- Auto-create (if enabled) fires on thread creation regardless of initial mode
- The agent cannot write files in Ask mode even if a worktree is bound — the read-only constraint of Ask mode still applies to file operations within the worktree

### 24. File-Edit Card Paths in Worktree Context

**Rule:** File-edit cards in assistant chat (e.g. `src/main.rs (+12 −3)`) display paths **relative to the working directory** (which is the worktree root when bound). This is already the natural behavior since the agent operates within `working_directory`. No special path rewriting is needed.

**Click-to-open behavior:** Clicking a file-edit card path opens the file from the worktree's filesystem location (the absolute path is resolved from `working_directory + relative_path`). The file manager / editor resolves this correctly because the file is a real file on disk at the worktree path.

### 25. Thread Export and Worktree Binding

**Rule:** When a thread is exported (via `/export` command), the worktree binding metadata is **excluded** from the export payload. Rationale:
- Worktree binding references local filesystem paths and git state that won't exist in the import context
- Exported thread content (conversation, file edits) is self-contained
- If the exported content is later imported as context into a new thread, that new thread starts with no worktree (user can create one manually)

### 26. Concurrent Auto-Create Race Condition

**Rule:** When two threads are created simultaneously with auto-create enabled, branch name collisions are handled by the existing collision logic (auto-append `-2`, `-3`, etc.). Additionally:
- `WorktreeManager::create_worktree` must be serialized per project (mutex/lock) to prevent two concurrent `git worktree add` commands racing on the same branch name
- The reverse lookup key `worktree_binding_reverse:{worktree_id}` write is atomic (redb transaction) so 1:1 enforcement cannot be violated by concurrent creates
- If a create fails due to race (e.g. branch created between check and create), the auto-create retry logic attempts with the next suffix

### 27. Soft Worktree Limit

**Rule:** No hard maximum on assistant worktrees in MVP. However:
- A **soft warning** appears when total worktrees (assistant + orch + manual) exceeds 10 per project: toast "You have {N} worktrees. Consider removing unused ones to save disk space."
- The warning appears once per session (not on every create)
- The threshold of 10 is a setting: `config:project:{pid}:branching.worktree_warning_threshold` (integer, default 10, 0 = disabled)
- This is advisory only — creation is never blocked by count

### 28. Worktree Status Source (UI Reads)

**Rule:** The chat header button icon state and thread selector worktree icon color read from `worktree_projection.v1:{project_id}:{worktree_id}`, which already includes `dirty_state` and `conflict_state` fields alongside `projection_freshness` and `projection_health`.

**Status mapping:**
- `dirty_state` clean + `conflict_state` none → clean icon (theme secondary color)
- `dirty_state` dirty → dirty icon (theme warning color)
- `conflict_state` present → conflict icon (theme error color, takes precedence over dirty)

**Refresh semantics:** The projection is updated by the existing worktree monitoring path (WorktreeManager reconciliation). The UI subscribes to projection changes via the standard reactive binding model — no new polling or file-watching mechanism needed. When the projection updates, the icon state updates reactively.

**Stale projection:** If `projection_freshness = stale` (e.g. remote host unreachable), the icon shows the last-known state with a subtle desaturation to indicate staleness. Tooltip appends "(status may be outdated)".

### 29. Seglog Event Naming Convention

**Issue:** Existing chat events in storage-plan.md use underscore separator: `chat.thread_created`, `chat.thread_archived`, `chat.thread_deleted`. The proposed worktree events use dot separator: `chat.thread.worktree_bound`.

**Resolution:** Follow existing convention. Rename to underscore-separated:
- `chat.thread_worktree_bound`
- `chat.thread_worktree_unbound`
- `chat.thread_worktree_renamed`
- `chat.thread_worktree_create_failed`

This aligns with `chat.thread_created` etc. The `worktree_` prefix within the event name groups them logically without introducing a new namespace depth.

### 30. Auto-Retrieval / Context Scope in Worktree

**Rule:** Auto-retrieval (Tantivy search, `@file` resolution) remains **project-scoped**, not worktree-scoped. Rationale:
- The Tantivy index is built per-project and indexes the full project directory tree including all worktrees under `.puppet-master/worktrees/`
- A worktree is a subset of the project — files modified in a worktree are still findable via the project index
- `@file` paths resolve relative to the thread's `working_directory` (worktree root when bound), so `@file src/main.rs` resolves to the worktree's copy of that file
- The auto-retrieval search corpus is not narrowed to the worktree — the agent can still find and reference files from the main project tree

**Edge case:** If the user types `@file` and the same relative path exists in both the worktree and main project root, the resolution prefers the thread's `working_directory` (worktree root). This matches the mental model: "I'm working in this worktree."

### 31. Loading State During Worktree Creation

**Rule:** While `WorktreeManager::create_worktree` is in progress (async):
- Chat header button icon shows a **subtle pulse/loading indicator** (same pattern as platform/model switching — reserved space, no layout shift)
- Dropdown is disabled (cannot open) during creation
- The Create dialog shows its Create button in a disabled + loading state ("Creating…") while the backend operation runs
- On success: dialog closes, button transitions to bound state
- On failure: dialog returns to interactive state with inline error
- Auto-create (no dialog): button shows loading indicator between thread creation and worktree bind completion; if creation fails, button transitions to unbound state with warning toast

### 32. Accessibility — Worktree State Announcements

**Rule:** Worktree state changes are announced to screen readers via `aria-live="polite"`:
- Worktree created: "Worktree created on branch {branch_name}"
- Worktree unbound: "Worktree unbound from thread"
- Worktree removed: "Worktree removed"
- Status change (dirty): "Worktree {branch_name} has uncommitted changes"
- Status change (conflict): "Worktree {branch_name} has merge conflicts"
- Creation failed: "Worktree creation failed: {error}"

**Accessible labels for new controls:**
- Chat header worktree button: `aria-label="Worktree: {state_description}"` where state_description is "none", "branch_name, clean", "branch_name, uncommitted changes", "branch_name, merge conflict"
- Thread selector worktree icon: `aria-label="Has worktree: {branch_name}, {status}"`
- File manager swap toggle: already specified in §6

### 33. Accidental Unbind Recovery

**Rule:** No dedicated undo for unbind in MVP. Mitigation:
- `Unbind` in the dropdown does NOT delete the worktree — it remains on disk as an orphaned/manual worktree in the Source Control Worktrees section
- User can re-create a new worktree and manually move/cherry-pick changes, or use git directly
- The worktree row in Source Control shows the unbinded worktree immediately (owner label changes from "Thread: ..." to "Manual")
- **Future enhancement:** A brief undo toast ("Worktree unbound. [Undo]") with 5-second window could be added post-MVP

### 34. Accordion Minimum Width Constraint

**Rule:** The Source Control panel has a minimum width of 240px (FinalGUISpec.md line 489). The accordion layout must work at this minimum:
- Section headers: full panel width, text truncated with ellipsis at small sizes
- Item count badges: always visible (right-aligned, fixed min-width)
- Worktree compact rows: branch name truncated with ellipsis; status pill and owner label on second line
- Worktree expanded rows: fields stack vertically (label above value, not side-by-side); action buttons wrap to multiple lines
- Filter bar: segmented control switches to icon-only at widths below 280px (tooltip on hover for labels)

### 35. Worktree Directory Naming for Assistant Worktrees

**Rule:** Existing orchestrator worktrees use `tier_id` as the directory name: `.puppet-master/worktrees/{tier_id}`. Assistant worktrees follow the same directory structure but use a thread-derived name.

**Naming scheme:** `.puppet-master/worktrees/thread-{short_id}` where `short_id` is the first 8 characters of `thread_id`.

**Directory creation:** The `.puppet-master/worktrees/` parent directory is created by `git worktree add` if it doesn't exist (git handles this). PM does not need to pre-create the directory. If the parent `.puppet-master/` directory doesn't exist, it should be created as part of project init (pre-existing responsibility, not new to this feature).

**Collision handling:** If `thread-{short_id}` directory already exists (stale from previous deletion), append numeric suffix: `thread-{short_id}-2`, etc.

### 36. App Restart — Worktree Binding Revalidation

**Rule:** On PM startup, after thread state is rehydrated from redb/seglog:
1. For each thread with a `thread_state:{thread_id}:worktree_binding` key, verify the worktree path still exists on disk
2. If path exists and `git worktree list` includes it: binding is valid, no action
3. If path does NOT exist: auto-unbind (delete binding key and reverse lookup key), emit `chat.thread_worktree_unbound` with reason `path_missing`
4. This revalidation happens lazily on first thread focus (not eagerly for all threads at startup) to avoid slow startup with many threads
5. Revalidation does NOT silently re-create the worktree — if missing, it unbinds and notifies via toast on next thread focus

**Rationale:** Users may manually remove worktree directories between sessions. Eager revalidation at startup would be slow and wasteful for threads the user never revisits. Lazy check on focus mirrors the existing pattern for runtime identity revalidation (§16 in assistant-chat-design.md).

### 37. Branch Name Sanitization Rules

**Rule:** Branch names for assistant worktrees are sanitized using these concrete rules (to be implemented as a shared `sanitize_branch_name` helper, potentially reusing `BranchStrategyManager::sanitize_id` from WorktreeGitImprovement.md Phase 2):

1. Convert to lowercase
2. Replace spaces with hyphens
3. Replace consecutive hyphens with single hyphen
4. Strip characters invalid in git refs: `~`, `^`, `:`, `\`, `?`, `*`, `[`, `]`, `..`, `@{`
5. Strip leading/trailing hyphens and dots
6. Truncate to 50 characters (after sanitization)
7. If result is empty after sanitization: fall back to `thread-{short_id}`

**Examples:**
- "Fix Auth Bug" → `fix-auth-bug`
- "User's Login (v2)" → `users-login-v2`
- "    " → `thread-a1b2c3d4` (empty after strip)
- "A very long title that exceeds the fifty character maximum limit for branches" → `a-very-long-title-that-exceeds-the-fifty-character`

### 38. Creation Timeout

**Rule:** `WorktreeManager::create_worktree` has a timeout:
- Default: 30 seconds (configurable via `config:project:{pid}:branching.worktree_create_timeout_s`, integer, default 30)
- If `git worktree add` does not complete within the timeout: the operation is aborted, partially-created worktree is cleaned up if possible (`git worktree remove --force`), and the error "Worktree creation timed out after {N}s" is shown in the dialog or as a warning toast (for auto-create)
- This is especially important for remote SSH projects where network latency may cause hangs

### 39. Revert Command and Worktree Paths

**Rule:** The existing `cmd.chat.revert` command uses the canonical file-restore pipeline (FileSafe contract). It operates on **absolute file paths** recorded in the turn's file mutation log — not relative paths resolved via `working_directory`.

**Implication:** Revert already works correctly in worktree contexts because:
- When the agent edits `src/main.rs` in a worktree, the mutation log records the absolute path (e.g. `/project/.puppet-master/worktrees/thread-abc/src/main.rs`)
- `cmd.chat.revert` restores from that absolute path
- No worktree-specific changes needed in the revert pipeline

### 40. MCP Tools / Providers and Worktree Context

**Rule:** MCP tools and CLI-bridged providers receive `working_directory` as part of their execution context (confirmed in CLI_Bridged_Providers spec). When a thread has a worktree binding:
- `working_directory` is set to the worktree path
- Tools that use `cwd` (bash, shell commands) automatically operate in the worktree
- Tools that read the git context (e.g. `git status`) auto-scope to the worktree because git resolves from `cwd`
- No additional provider configuration needed

### 41. Chat History — No Worktree Context Markers (Not MVP)

**Rule:** When a worktree binding changes mid-thread (bind, unbind, rebind), the chat message history does NOT display a visual marker or separator indicating the context change. The seglog records the binding events, but the chat UI does not surface them inline.

**Rationale:** This is a convenience feature, not a correctness issue. The header button and tooltip always show the current binding state. A visual marker in the message stream would add complexity for marginal benefit.

**Future enhancement:** A subtle system message ("Worktree changed to assistant/fix-auth-bug") could be inserted into the message stream, similar to how mode changes might be annotated.

### 48. Merge-Back Flow — Returning Worktree Work to Base Branch

**Four access paths (all equivalent in outcome):**

| Path | Entry point | Notes |
|------|-------------|-------|
| Chat header dropdown | "Merge into Base…" / "Create PR…" actions (§1 bound dropdown) | Primary UI path |
| Source Control worktree section | "Merge" / "Create PR" buttons in expanded worktree row (§5) | Secondary UI path |
| Slash commands | `/worktree merge [--squash\|--rebase]`, `/worktree pr` | Keyboard-driven; `/worktree merge` defaults to squash; `--rebase` selects rebase strategy |
| Natural language in chat | User says "merge my changes into main" or "create a PR for this branch" | Agent triggers merge dialog pre-filled with inferred strategy |

#### Merge Confirmation Dialog

**Trigger:** "Merge into Base…" from dropdown or Source Control, or `/worktree merge`, or natural language request.

**Dialog fields:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Strategy | Segmented control: `Squash` / `Merge` / `Rebase` | `Squash` | Squash = single clean commit on base; Merge = merge commit preserving history; Rebase = replay commits on top of base |
| Target branch | Dropdown | Value of `branching.assistant_worktree_base_ref` or `branching.base_branch` | Must be an existing local branch |
| Commit message | Text area (multi-line) | Auto-generated: squash = concatenated commit messages; merge = "Merge assistant/{title} into {base}"; rebase = N/A | Editable by user; only shown for squash and merge |

**Buttons:** `Merge` (primary, label changes to "Squash" or "Rebase" based on strategy), `Cancel`

#### Pre-merge Guards

| Condition | Behavior |
|-----------|----------|
| Worktree has uncommitted changes (dirty) | **Block merge.** Dialog shows warning: "Worktree has uncommitted changes. Commit or stash changes before merging." Merge button disabled. |
| Worktree has merge conflicts | **Block merge.** Dialog shows warning: "Resolve existing conflicts before merging." Merge button disabled. |
| Active run in worktree | **Block merge.** Same pattern as remove block — "Cannot merge while a run is active." |
| Target branch doesn't exist | Dropdown prevents selection; error if target deleted between dialog open and confirm |

#### Merge Execution (step by step)

**Critical: merge executes in the main repo working tree, NOT inside the worktree.** This is consistent with WorktreeGitImprovement.md `merge_worktree()` which operates from the main repo context. The worktree branch is merged INTO the target branch in the main repo.

1. User confirms strategy + target branch + commit message
2. Dialog shows loading state ("Merging…" / "Squashing…" / "Rebasing…")
3. Backend auto-fetches: `git fetch origin {target}` (in main repo) to ensure target branch is up-to-date with remote. If fetch fails (offline, no remote): proceed with local state and show advisory toast "Could not fetch latest — merging against local state."
4. Backend executes (all commands in **main repo** context, NOT worktree):
   - **Squash:** `git checkout {target}` → `git merge --squash {worktree_branch}` → `git commit -m "{message}"`
   - **Merge:** `git checkout {target}` → `git merge --no-ff {worktree_branch} -m "{message}"`
   - **Rebase:** (in worktree) `git rebase {target}` → (in main repo) `git checkout {target}` → `git merge --ff-only {worktree_branch}`
5. On success: dialog closes; post-merge modal appears (see below)
6. On conflict (during merge/rebase): dialog closes; conflict markers written to files in main repo; Source Control Changes section highlights conflicts; existing `cmd.git.conflict_apply_resolution` flow takes over. After conflicts resolved, user re-triggers merge.
7. On git error (non-conflict failure): dialog shows inline error with git error message; dialog stays open for retry or cancel

**Rebase note:** Rebase is always **non-interactive** (`git rebase`, NOT `git rebase -i`). Interactive rebase (pick/squash/fixup individual commits) is out of scope — use the terminal for that.

**Commit authorship:** The merge/squash commit uses the user's git identity (`user.name` / `user.email` from git config). PM does not override or inject AI co-author attribution for merge commits — these are user-initiated infrastructure operations, not AI-generated code.

#### Post-Merge Behavior

After successful merge, show a modal:
- Title: "Merge complete"
- Body: "Branch `assistant/{title}` has been merged into `{target}`."
- Option 1: **"Keep worktree"** — worktree remains bound; user can continue working
- Option 2: **"Remove worktree"** — unbind + prune worktree; thread continues on project root
- Option 3: **"Cancel"** (dismiss modal; worktree stays as-is)

Default selection follows `branching.assistant_worktree_cleanup_default` setting (same setting as delete cleanup).

#### Conflict Resolution Paths

When merge/rebase hits conflicts:

- **UI-initiated (dropdown/Source Control):** Conflict markers written to worktree files. Source Control Changes section shows conflicted files with standard conflict indicators. User resolves via the existing `cmd.git.conflict_apply_resolution` flow (3-way merge editor). After all conflicts resolved, user can re-attempt merge.
- **Natural-language-initiated:** The agent can resolve conflicts conversationally — it sees the conflict markers in files via `working_directory`, can edit them with its file editing tools, and can stage + continue the merge. User can say "resolve the conflict in src/auth.rs by keeping my changes" and the agent handles it.

#### Create PR Flow

**Trigger:** "Create PR…" from dropdown or Source Control, or `/worktree pr`, or natural language.

**Behavior:** Opens the existing PR creation panel from GitHub_Integration.md §B with pre-filled fields:
- Title: thread title (or branch name if no title)
- Body: concatenated commit messages since divergence from base
- Target branch: value of `branching.assistant_worktree_base_ref` or `branching.base_branch`
- Source branch: worktree branch name (e.g. `assistant/fix-auth-bug`)

**Auto-push:** Before opening the PR panel, the system pushes the worktree branch to the remote: `git push -u origin {worktree_branch}`. If push fails:
- Network error: error toast "Could not push branch to remote: {error}. Push manually before creating PR."
- Auth error: error toast "Authentication failed — check GitHub credentials."
- PR panel does NOT open on push failure.

**Guard:** Requires the project to have a configured GitHub remote. If no remote: error toast "No GitHub remote configured — cannot create PR."

**Post-PR behavior:** Worktree remains bound (PR is open, user may push more commits). No cleanup modal — the PR lifecycle is separate from the worktree lifecycle.

#### Natural Language Merge

**Rule:** The assistant agent can execute merge-back operations when asked in natural language. The agent:
1. Identifies the user's intent (merge, squash, rebase, PR)
2. Checks pre-merge guards (dirty state, conflicts, active run) by reading git status via its tools
3. If guards fail: explains the issue conversationally and suggests remediation ("You have uncommitted changes — want me to commit them first?")
4. If guards pass: triggers the merge confirmation dialog pre-filled with the inferred strategy and target. The user confirms in the dialog before merge executes.
5. If conflicts occur after merge: the agent can resolve them conversationally — reads conflict markers, proposes resolutions, edits files via its standard tools, stages resolved files
6. Reports success/failure in the chat response

**Invocation mechanism:** The agent does NOT execute git merge commands directly via bash (merge must run in the main repo context, not the worktree). Instead, the agent emits a structured action request that the PM runtime routes to `cmd.chat.worktree.merge`. The merge dialog appears for user confirmation. This keeps merge as a **user-confirmed** action regardless of entry path. In yolo mode, the dialog is still shown (merge is a significant git operation warranting explicit confirmation even in auto-approve mode).

**Exception — commit before merge:** The agent CAN use bash to run `git add` and `git commit` in the worktree (its working_directory) when the user asks to "commit and merge." The commit is a normal tool invocation; the merge is the system command that shows the dialog.

**Examples of natural language triggers:**
- "Merge my changes back into main"
- "Squash everything into one commit and merge"
- "Create a PR for this work"
- "Rebase my branch onto develop"
- "I'm done with this worktree, merge and clean up"

The agent has full context: it knows the bound worktree branch, the base ref, the working_directory, and can read git status. This makes natural language merge the most powerful path — it can chain commit → merge → cleanup in one conversational exchange.

### 49. Debug Mode — Worktree Access

**Rule:** Debug Mode has full access to all worktree features, identical to Agent mode. The worktree button, dropdown (including merge-back actions), slash commands, and natural language merge are all available in Debug mode.

**Rationale:** Debug Mode is a workflow overlay on top of `regular` or `yolo` runtime mode (Run_Modes.md). It does not restrict tool access — it adds debugging-specific behavior. Worktree operations are infrastructure, orthogonal to the debugging workflow. A user debugging in a worktree should be able to merge their fix back without switching modes.

### 50. Merge-Back — Operational Details (Sweep 5 Fixes)

**Merge execution location:** All merge/squash/rebase commands execute in the **main repo** working tree, NOT inside the worktree. This is consistent with WorktreeGitImprovement.md `merge_worktree()`. The worktree is the *source* branch; the main repo is where the target branch is checked out and modified.

**Auto-fetch before merge:** Before executing any merge strategy, the backend runs `git fetch origin {target_branch}` in the main repo to ensure the local target is up-to-date. If fetch fails (no remote, offline), merge proceeds with local state and an advisory toast is shown.

**Auto-push before PR:** Before opening the PR panel, the system pushes the worktree branch to the remote (`git push -u origin {branch}`). If push fails, PR creation is aborted with an error toast.

**Rebase is non-interactive only:** The "Rebase" strategy executes `git rebase {target}` (non-interactive). Interactive rebase (`git rebase -i`) with pick/squash/fixup is out of scope for the dialog — users who need interactive rebase should use the terminal.

**Commit authorship:** Merge/squash commits use the user's git identity from git config (`user.name` / `user.email`). PM does not inject AI co-author attribution for merge commits — these are user-initiated infrastructure operations.

**No undo for completed merge:** There is no dedicated undo mechanism for git merge operations. To reverse a merge, the user can run `git reset --hard` or `git revert` via the terminal or ask the agent to do it via bash. This matches the general PM principle that significant git operations are intentional.

**Merge dialog accessibility:** The merge confirmation dialog and post-merge modal follow standard PM dialog patterns: Escape to close, Tab/Enter/Arrow keyboard navigation, focus trapping within dialog, aria-live="polite" announcements for merge status ("Merge complete" / "Merge failed: {reason}").

**NL merge always shows confirmation dialog:** Even when triggered via natural language, the merge dialog appears for user confirmation. The agent pre-fills the strategy/target/message based on intent recognition, but the user must confirm. This applies in all run modes including yolo (merge is significant enough to warrant explicit confirmation).

**Ask/Plan mode and merge:** Worktree creation/bind/unbind are infrastructure (allowed in all modes). Merge is a **git mutation** — it modifies the target branch. However, the merge dialog is a user-initiated UI action (not an agent tool invocation), so it is available in all modes. The key distinction: in Ask/Plan mode, the *agent* cannot trigger a merge via NL (it would need to invoke a mutation), but the *user* can still click "Merge into Base…" in the dropdown directly.

## Impacted Docs
- `Plans/assistant-chat-design.md` — new section for worktree button (§28 or equivalent), thread ↔ worktree binding model, chat header control spec, dropdown spec, slash commands, Ask-mode worktree note, file-edit card path semantics
- `Plans/FinalGUISpec.md` — thread selector worktree icon (§GUI updates #2 addition); Source Control accordion redesign reference; Appendix A cross-ref update for WorktreeGitImprovement
- `Plans/GitHub_Integration.md` — Source Control §A.1 tab→accordion change; §A.4 Worktrees section layout redesign to single-column expandable rows; owner column expansion for thread IDs; accordion behavior rules; §C remote SSH worktree note
- `Plans/WorktreeGitImprovement.md` — §4 GUI section cross-reference to assistant chat; new §2.X for assistant-created worktree lifecycle (temp name, rename, cleanup); owner model expansion; soft worktree limit warning
- `Plans/storage-plan.md` — new redb key families: `thread_state:{thread_id}:worktree_binding`, `worktree_binding_reverse:{worktree_id}`; new seglog event types; settings key additions; worktree_record owner field extension; `worktree_warning_threshold` setting
- `Plans/LSPSupport.md` — worktree root_identity switching on thread focus change; lazy init and idle collection policy for worktree LSP sessions
- `Plans/FileManager.md` — worktree context switching behavior; breadcrumb toggle spec; search scope follows file manager root; edge case for unbound mid-session
- `Plans/Orchestrator_Page.md` — §11 Source Control boundary update: assistant-owned worktrees are now part of the unified worktree inventory alongside orch-owned ones
- `Plans/UI_Command_Catalog.md` — new `cmd.chat.worktree.*` commands (create, unbind, remove, merge, pr, info); slash command mappings

## Decisions Already Resolved
1. Orch worktree list is NOT in the assistant chat dropdown — assistant worktrees only
2. Auto-create default is Off — user must explicitly enable in Settings > Branching
3. Settings is project-level; chat button is per-thread override (same precedence as platform/model)
4. Thread selector worktree icon: icon-only, left side, below status badge, hover for info, absent when no worktree
5. Source Control panel: accordion replaces horizontal tabs
6. Worktree section: single-column expandable rows for narrow viewport
7. File manager: switches with worktree context, toggle back via breadcrumb indicator
8. LSP: worktree-aware via existing root_identity keying
9. Unbind vs Remove as separate actions (unbind leaves worktree on disk, remove prunes)
10. Mid-thread binding change allowed, applies to next turn
11. No emojis in GUI — all icons are proper theme-consistent glyphs
12. Create Worktree dialog: branch name (auto-suggested), base ref (from config), minimal
13. Auto-create branch naming: `assistant/<auto_generated_title>` — uses the thread's auto-generated title as the branch suffix
14. Thread ↔ worktree binding is 1:1 — one worktree per thread, one thread per worktree, no sharing
15. Cleanup policy on thread delete: pop up a modal asking the user what to do with the worktree (keep/remove). Default action configurable in Settings > Branching.
16. Dirty worktree indicator: the worktree button icon in the chat header changes appearance when the bound worktree has uncommitted changes or conflicts (subtle state change, same icon position)
17. Branch name collision: auto-append numeric suffix (`-2`, `-3`, etc.) when `assistant/<auto_title>` already exists
18. Auto-title timing: worktree created with temp name (e.g. `assistant/thread-<short_id>`) before first turn, branch renamed to `assistant/<auto_title>` once title is generated
19. Cleanup modal: "Keep worktree on disk" / "Remove worktree" — Remove shows confirmation sublabel if dirty ("This worktree has uncommitted changes"). Default action configurable in Settings > Branching.
20. File manager toggle: resets on thread switch (always shows active thread's worktree context by default). Setting in Settings GUI to change default behavior (e.g. "always show main project root").
21. Source Control accordion section order: Changes, Worktrees, Branches/Stash, History, Graph
22. Default expanded section on first load: Changes only
23. Worktree section filter default: All
24. Worktree sort: creation time descending (newest first)
25. FileSafe: no changes needed — existing working_directory mechanism handles worktrees
26. Terminal cwd: set to worktree path when opened from worktree-bound thread context
27. Changes section: always shows main repo changes (worktree-specific changes visible in Worktrees section expanded rows) — scoping Changes to active worktree is not MVP
28. LSP idle collection: 5 minutes with no open files from that worktree (configurable)
29. Worktree record extends with optional `owner_thread_id?` field
30. 1:1 enforced via reverse lookup key `worktree_binding_reverse:{worktree_id}`
31. Remote SSH projects: worktree created on remote host via WorktreeManager; no local fallback
32. No-git-repo projects: worktree button hidden entirely (not disabled)
33. No "Bind Existing" in MVP — assistant dropdown only offers Create; adopting existing worktrees is future scope
34. Thread lifecycle: cleanup triggers on thread DELETE only (no archive state exists); completed/failed threads keep binding until deleted
35. Ask mode: worktree creation/binding allowed — it is infrastructure, not a file edit
36. File-edit card paths: already relative to working_directory; no special rewriting needed for worktrees
37. Thread export: worktree binding metadata excluded from export payload
38. Concurrent auto-create: WorktreeManager serialized per project; reverse lookup key is atomic; retry on race
39. Soft worktree limit: warning toast at 10 worktrees per project (configurable, advisory only, never blocks)
40. Canonical worktree path: `.puppet-master/worktrees/` (not `.pm/`)
41. Seglog events use underscore convention: `chat.thread_worktree_bound` (matching `chat.thread_created`)
42. UI reads worktree status from `worktree_projection.v1` `dirty_state`/`conflict_state` fields
43. Auto-retrieval remains project-scoped; `@file` resolves relative to thread's working_directory
44. Loading state during creation: button shows pulse/loading indicator, dropdown disabled, dialog button shows "Creating…"
45. Accessibility: worktree state changes announced via aria-live="polite"
46. No undo for unbind in MVP; worktree remains on disk as manual worktree; future undo toast post-MVP
47. Accordion must work at 240px minimum panel width; filter bar switches to icon-only below 280px
48. Stale projection: icon shows last-known state desaturated with "(status may be outdated)" tooltip suffix
49. Chat header button position: after Reasoning/effort control (rightmost existing control), NOT between Mode and Persona
50. Delete confirmation + cleanup: worktree cleanup options embedded into existing delete confirmation dialog (no two-dialog sequence)
51. Worktree directory name: `thread-{short_id}` under `.puppet-master/worktrees/`; collision appends numeric suffix
52. App restart: worktree binding revalidated lazily on first thread focus, not eagerly at startup
53. Branch sanitization: lowercase, spaces→hyphens, strip invalid git ref chars, truncate 50 chars, shared helper
54. Creation timeout: 30s default (configurable); abort + cleanup on timeout
55. Revert command: operates on absolute paths from mutation log; already works in worktree context
56. MCP tools/providers receive working_directory; auto-scope to worktree via cwd
57. No inline chat history markers for worktree context changes (not MVP)
58. Theme colors via tokens (e.g. `icon-secondary`, `accent-warning`), not hardcoded values; must work across all 3 built-in themes
59. Git submodules in worktrees: out of scope (pre-existing git limitation, not PM-specific)
60. `.puppet-master/` gitignore: pre-existing Phase 3 task, not new to this feature
61. Worktree creation is user/system-initiated only; never agent-tool-gated; Permissions_System.md unaffected
62. Orch→Assistant handoff does NOT transfer worktree; new thread starts unbound; user can auto-create or manually create
63. Redb worktree binding keys are seglog projections; projector replays bound/unbound events to rebuild state
64. Settings validation: `worktree_create_timeout_s` clamped [5, 300], `worktree_warning_threshold` clamped [0, 100]; numeric stepper widgets
65. Quick-open (Ctrl+P/K) always project-scoped; file manager search follows FM root; @file follows working_directory
66. Chat header worktree button is icon-only (~32px); follows existing header overflow/min-width pattern; no separate collapse
67. Thread auto-title generation is a pre-requisite for branch rename flow (§9); if auto-title doesn't exist yet, it must be added
68. Worktree settings are project-scoped (`config:project:{pid}:...`); NOT included in app-level sync bundles (correct — project-specific config shouldn't sync cross-machine)
69. Merge-back available via 4 paths: chat dropdown, Source Control row, slash commands, natural language in chat
70. Default merge strategy: squash (single clean commit on base); user can pick merge (no-ff) or rebase in dialog
71. Dirty worktree blocks merge — user must commit or stash first; dialog shows disabled merge button with explanation
72. Post-merge: ask user "Keep worktree" / "Remove worktree" (same cleanup setting as thread delete)
73. Conflict resolution: UI-initiated falls through to existing `cmd.git.conflict_apply_resolution`; natural-language-initiated agent resolves conversationally via file editing tools
74. PR creation opens existing GitHub_Integration.md PR panel with pre-filled fields; requires configured GitHub remote
75. Post-PR: worktree stays bound (PR is open, user may push more commits); no cleanup modal
76. Natural language merge: agent has full context (branch, base, working_directory, git status) and can chain commit→merge→cleanup conversationally
77. Debug mode has full access to all worktree features including merge-back (it is a workflow overlay, not a restriction)
78. All chat modes (Ask, Agent, Debug, Plan, Deep Plan) can see and use the worktree button and all merge-back actions
79. Merge executes in main repo context, NOT inside the worktree; worktree branch is the source, main repo hosts the target checkout
80. Auto-fetch `git fetch origin {target}` before merge; proceeds with local state if offline (advisory toast)
81. Auto-push `git push -u origin {branch}` before PR creation; PR aborted on push failure
82. Rebase is non-interactive only (`git rebase`, NOT `git rebase -i`); interactive rebase → use terminal
83. Commit authorship: user's git identity (`user.name`/`user.email`); no AI co-author injection for merge commits
84. No undo for completed merge; user can `git reset`/`git revert` via terminal or agent bash
85. NL merge always shows confirmation dialog (even in yolo mode) — user must explicitly confirm merge
86. In Ask/Plan mode, agent cannot trigger merge via NL (mutation); user can still click "Merge into Base…" in dropdown directly
87. `/worktree merge` is one command with `--squash`/`--rebase` flags; no separate squash/rebase commands
88. Missing `chat.thread_worktree_pr_failed` seglog event added; `phase` field distinguishes push vs API failure

### 42. Worktree Creation Is Not Agent-Tool-Gated

**Rule:** Worktree creation and removal are always **user-initiated** (chat header dropdown, slash command) or **system-initiated** (auto-create setting). They are never invoked by the AI agent as a tool call. Therefore:
- No entry in the Permissions_System.md permission key table is needed for worktree operations
- Yolo mode does not affect worktree creation behavior — it is not a tool permission bypass scenario
- The `bash` tool permission (which would gate `git worktree add` if an agent tried it directly) is irrelevant because the agent never runs raw git worktree commands; `WorktreeManager` handles this as system infrastructure

**Clarification:** If a future enhancement allowed agents to request worktree creation (e.g. an agent suggests "I need a worktree for this task"), that would require a new permission key. Not MVP scope.

### 43. Orchestrator → Assistant Handoff Does NOT Transfer Worktree

**Rule:** When an orchestrator run completes or pauses and the user clicks "Continue in Assistant" (§21 in assistant-chat-design.md), a new assistant thread is created with run summary and context injected. The new thread starts **without a worktree binding**, even if the orchestrator run used a tier-owned worktree.

**Rationale:**
- Orchestrator worktrees are owned by tiers (`owner_tier_id`); assistant worktrees are owned by threads (`owner_thread_id`). These are different ownership models.
- Transferring an orch worktree to an assistant thread would violate the orch tier's ownership and the 1:1 constraint.
- The new assistant thread can create its own worktree via auto-create (if enabled) or manual create from the dropdown.
- If the user wants to continue working in the same files, the assistant's worktree can be based on the same branch ref.

### 44. Redb Worktree Binding Key Is a Seglog Projection

**Rule:** The `thread_state:{thread_id}:worktree_binding` and `worktree_binding_reverse:{worktree_id}` keys in redb are **disposable projections** rebuildable from seglog, consistent with storage-plan.md §2.2.1 ("redb, Tantivy, and the JSONL mirror are disposable projections and MUST be rebuildable from seglog").

**Rebuild logic:** The projector replays `chat.thread_worktree_bound` and `chat.thread_worktree_unbound` events in sequence order to reconstruct the current binding state. The last event for a given thread_id determines whether a binding exists and what worktree_id it references.

**Implication:** The seglog events (§11) are the source of truth for worktree binding. The redb keys are a read-optimized cache. This means:
- No separate "worktree binding migration" needed — seglog replay handles it
- If redb is lost/corrupted, bindings are restored from seglog automatically
- The projector for this key family must be registered alongside existing chat thread projectors

### 45. Settings Validation Rules

**Rule:** The new integer settings require validation constraints in the Settings GUI:

| Setting key | Min | Max | Zero behavior | Negative | UI widget |
|-------------|-----|-----|---------------|----------|-----------|
| `branching.worktree_warning_threshold` | 0 | 100 | Disabled (no warning) | Rejected (clamp to 0) | Numeric stepper |
| `branching.worktree_create_timeout_s` | 5 | 300 | Rejected (clamp to 5) | Rejected (clamp to 5) | Numeric stepper |

- Input fields use numeric steppers (not free-text) to constrain input range
- Out-of-range values entered via settings file edit are clamped to nearest valid bound on load with a log warning
- Boolean and enum settings do not need additional validation (toggle and dropdown naturally constrain)

### 46. Quick-Open (Ctrl+P) Remains Project-Scoped

**Rule:** The command palette quick-open file search (`Ctrl+K` / `Ctrl+P`) searches across the **full project** navigation targets, not scoped to the active worktree. This is distinct from:
- File manager search: follows the current file manager root (worktree or project, per §6)
- `@file` resolution in chat: resolves relative to thread's `working_directory` (worktree root when bound, per §30)
- Quick-open: always project-scoped regardless of worktree context

**Rationale:** Quick-open is a project-wide navigation tool (FinalGUISpec §4). Narrowing it to worktree context would reduce its utility. Users can find files across worktrees and main project equally.

### 47. Chat Header Overflow at Narrow Widths

**Rule:** The chat header strip contains: Platform, Model, Reasoning/effort, **Worktree** (new). At very narrow chat panel widths, the header may not have room for all controls inline.

**Behavior:** The worktree button is icon-only (no label text), matching the other header controls' pattern. At narrow widths:
- All header controls remain icon-only (no labels collapse since there are none)
- If the chat panel is narrower than the minimum content width, the header scrolls horizontally (matching existing header overflow behavior) — or the panel enforces a minimum width that prevents this
- The worktree button does NOT collapse into an overflow menu separately — it stays inline with the other controls
- This follows whatever responsive pattern the existing header controls (Platform, Model, Reasoning/effort) already use

**Note:** The chat panel minimum width is governed by FinalGUISpec layout constraints. The worktree button adds ~32px icon width to the header, which is minimal overhead.

## Open Questions / Uncertainties
- (All design questions resolved — including five sweep gap coverage passes)

## Packetization Notes
- Core design fully converged and implementation-ready (five sweeps complete: 10 + 7 + 7 + 6 + 12 additional details addressed).
- Impacted docs list is 9 docs — packetization will need to scope carefully.
- Primary new content: assistant-chat-design.md (worktree button, binding model, dropdown, lifecycle), GitHub_Integration.md (accordion redesign, worktree section layout)
- Secondary updates: FinalGUISpec, WorktreeGitImprovement, storage-plan, LSPSupport, FileManager, Orchestrator_Page, UI_Command_Catalog
- storage-plan.md changes are schema additions (new keys, new events, extended record) — low conflict risk. Note: seglog events must use underscore convention matching existing `chat.thread_created`.
- GitHub_Integration.md §A.1 and §A.4 are the most structurally impactful changes (tab→accordion, section layout)
- Sweep 1: remote SSH, no-git-repo, lifecycle correction, Ask-mode, export, race, soft limit, bind-existing non-goal
- Sweep 2: projection-based status source, seglog naming fix, auto-retrieval scope, loading states, accessibility, unbind recovery, 240px min width, stale projection
- Sweep 3: header button position fix, delete dialog integration, directory naming, restart revalidation, branch sanitization rules, creation timeout, revert path confirmation, MCP provider context, chat history markers non-goal, theme tokens
- Sweep 4: permission model (not needed), orch→assistant handoff (no transfer), redb-as-projection, settings validation ranges, quick-open scoping, header overflow, auto-title dependency, sync bundle exclusion
- Sweep 5: merge execution location (main repo), auto-fetch before merge, auto-push before PR, rebase non-interactive, commit authorship (user's git identity), NL merge always shows dialog, Ask/Plan mode merge gating (UI yes / agent NL no), no undo for merge, dialog a11y, `/worktree merge` unified command with flags, `chat.thread_worktree_pr_failed` event, merge-specific error table entries
- Post-sweep additions: merge-back flow (§48) with full dialog/strategy/PR/NL spec; Debug mode explicit inclusion (§49); §50 operational details consolidation

## Do-Not-Forget Details
- No emojis in GUI — only theme-consistent icon glyphs
- Source Control panel narrow viewport is the root cause of the tab and content layout problems — accordion + single-column expandable rows solve both
- Thread selector icon is below status badge, not replacing it
- File manager toggle resets on thread switch by default; setting to change this behavior
- Auto-create setting is project-level in redb
- Unbind and Remove are distinct actions with different consequences
- Temp branch name created before first turn, renamed to `assistant/<auto_title>` once title exists; if collision, auto-append numeric suffix
- Cleanup modal on thread delete (NOT archive — threads have no archive state): "Keep worktree on disk" / "Remove worktree" with dirty-check confirmation sublabel; default action configurable in Settings > Branching
- 1:1 binding strictly enforced — a worktree already bound to a thread cannot be selected by another thread
- FileSafe requires no changes — working_directory already handles worktrees
- Working directory resolution happens once at turn start and is frozen for the turn
- Dropdown is read-only while a turn is in-flight
- Remove is blocked if worktree has an active run in any thread or orch tier
- Worktree path disappearance (external delete) handled by auto-unbind on next thread focus
- Editor tabs retain their own paths — not affected by file manager root switch
- LSP sessions are lazy-initialized and idle-collected, not eagerly created for every worktree
- Canonical path is `.puppet-master/worktrees/` (not `.pm/`)
- Remote SSH projects: worktree created on remote host via SSH subprocess; no silent local fallback
- No-git-repo projects: worktree button hidden entirely
- No "Bind Existing" in MVP — only Create; adopt semantics are future scope
- Ask mode allows worktree creation (infrastructure, not a file edit)
- Thread export excludes worktree binding metadata
- WorktreeManager::create_worktree must be serialized per project to prevent concurrent race conditions
- Soft warning at 10 worktrees per project (configurable threshold, advisory only)
- Completed/failed threads keep worktree binding indefinitely until user deletes or unbinds
- Seglog `worktree_unbound` reason enum: `user_unbind`, `user_remove`, `thread_delete`, `path_missing`
- Seglog event naming: underscore convention (`chat.thread_worktree_bound`), NOT dot (`chat.thread.worktree_bound`)
- UI reads worktree dirty/conflict status from `worktree_projection.v1`, not by polling git
- Stale projection → desaturated icon + "(status may be outdated)" tooltip
- Loading state: button pulse during creation, dropdown disabled, dialog "Creating…" state
- All worktree state changes announced via aria-live="polite" for screen readers
- All new controls need accessible labels (chat header button, thread selector icon, file manager swap)
- No undo for unbind in MVP — worktree stays on disk as manual, user can re-create
- Accordion must render at 240px minimum; filter bar icon-only below 280px
- Auto-retrieval project-scoped (not narrowed to worktree); @file resolves relative to working_directory
- Deep Plan is single-threaded read-only overlay — no sub-task inheritance concern
- Command palette visibility for worktree commands: enforced by handler registration, no explicit `when` clause needed
- Git operations auto-scope when cwd is set to worktree path; no PM-side path injection needed
- Chat header worktree button position: AFTER Reasoning/effort control, not between Mode and Persona
- Cleanup modal is embedded into the existing delete confirmation dialog, not a separate modal
- Worktree directory name: `thread-{short_id}` (first 8 chars of thread_id); collision appends `-2`, `-3`
- App restart: binding revalidated lazily on first thread focus, not eagerly for all threads
- Branch sanitization: shared helper; lowercase, hyphens, strip invalid refs, truncate 50 chars; empty → fallback to `thread-{short_id}`
- Creation timeout: 30s default; abort + cleanup on timeout; critical for remote SSH
- Revert (`cmd.chat.revert`): works in worktree via absolute paths in mutation log; no changes needed
- MCP tools/providers get working_directory in execution context; worktree-aware by default
- No inline worktree context-change markers in chat history (not MVP)
- Icon colors use theme tokens, not hardcoded values; must work across Retro Dark, Retro Light, Basic Modern
- Git submodules + worktrees: out of scope
- `.puppet-master/` gitignore: pre-existing Phase 3 task, unrelated to this feature
- `.puppet-master/worktrees/` parent dir created by `git worktree add`; PM does not pre-create
- Worktree creation is user/system-initiated only; agents never invoke WorktreeManager directly; no permission key needed
- Orch→Assistant "Continue in Assistant" handoff: new thread starts unbound; orch worktree stays with tier
- Redb binding keys are disposable projections of seglog events; projector must be registered alongside chat thread projectors
- Settings validation: timeout [5, 300]s stepper, threshold [0, 100] stepper; out-of-range file edits clamped with log warning
- Quick-open (Ctrl+P) always searches full project, even when file manager shows worktree root
- Thread auto-title generation is a dependency — the temp→final branch rename flow (§9) requires it to exist
- Worktree settings are project-scoped; they are NOT part of app-level sync bundles
- Chat header worktree button is icon-only; adds ~32px; follows existing header responsive pattern
- Merge-back has 4 access paths: dropdown, Source Control row, slash commands, natural language — all equivalent outcome
- Default merge strategy is squash (clean single commit); merge (no-ff) and rebase also available via dialog
- Dirty worktree blocks merge; user must commit or stash first
- Post-merge asks user Keep/Remove (reuses cleanup_default setting); post-PR keeps worktree bound
- Natural language merge is the most powerful path — agent can chain commit→merge→cleanup in one exchange
- Conflict resolution in NL path: agent reads conflict markers, proposes resolutions, edits files conversationally
- PR creation requires GitHub remote; opens existing PR panel from GitHub_Integration.md §B
- Debug mode has full worktree access (it is a workflow overlay, not a restriction)
- All 5 chat modes (Ask, Agent, Debug, Plan, Deep Plan) can see/use worktree button and merge-back actions
- Merge executes in MAIN REPO context, not inside the worktree; worktree branch is only the source
- Auto-fetch `git fetch origin {target}` before merge; advisory toast if offline, merge proceeds locally
- Auto-push `git push -u origin {branch}` before PR creation; abort PR panel on push failure
- Rebase is non-interactive only (`git rebase`, NOT `-i`); interactive rebase → terminal
- Merge/squash commit authorship: user's git identity; no AI co-author injection
- No undo for completed merge — `git reset`/`git revert` via terminal or agent bash
- NL merge always shows confirmation dialog (even in yolo mode) — explicit user confirmation required
- In Ask/Plan mode: user can merge via UI dropdown; agent cannot trigger merge via NL (mutation guard)
- `/worktree merge` is one command with `--squash`/`--rebase` flags; no separate slash commands
- `chat.thread_worktree_pr_failed` seglog event with `phase` field (push | api) — must not be forgotten
- Merge dialog focus trapping + aria-live announcements — standard PM dialog a11y pattern
