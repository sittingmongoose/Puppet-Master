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
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test` | bool | `true` | "Run tests before merging worktree" | When true, runs test command and blocks merge on failure |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_cmd` | string | `""` (empty = auto-detect) | "Pre-merge test command" | Override auto-detected test command; empty = auto-detect from project files |
| `config:project:{pid}:branching.worktree_pre_merge_test_timeout_s` | integer | `300` | "Pre-merge test timeout (seconds)" | Abort test run if it exceeds this duration |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test_target` | enum(`merged_result`, `branch_only`) | `merged_result` | "What to test before merge" | `merged_result` tests the integrated state (recommended); `branch_only` tests the branch in isolation |

**UI placement:** Settings > Branching tab, new subsection "Assistant Worktrees" below existing branching controls. Settings grouped into visual sub-groups:
- **Creation:** auto_worktree, base_ref, create_timeout_s
- **Merge & Testing:** pre_merge_test, pre_merge_cmd, pre_merge_test_timeout_s, pre_merge_test_target
- **Behavior:** cleanup_default, file_manager.worktree_follow_thread, warning_threshold

**Namespace note:** `file_manager.worktree_follow_thread` uses the `file_manager.*` namespace (not `branching.*`) because it controls file manager behavior. See §73 for full naming rationale.

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

**Persistence:** Section open/close state persisted in redb per project: `config:project:{pid}:source_control.accordion_state` — JSON object mapping section names to booleans:
```json
{
  "Changes": true,
  "Worktrees": false,
  "Branches/Stash": false,
  "History": false,
  "Graph": false
}
```
Section order is **fixed** (Changes, Worktrees, Branches/Stash, History, Graph); user cannot reorder sections in MVP. Scroll position within each section is NOT persisted. On first open of a new project, defaults to Changes=true, all others false. Each project's accordion state is independent (no cross-project sharing).

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
- `Open Thread` — navigates to the owning thread in assistant chat (only shown for thread-owned worktrees where the thread still exists). If the thread was deleted but worktree remains as manual, the button does NOT appear (hidden, not disabled). Clicking opens the Chat panel (if closed) and scrolls to the owning thread in the thread list.
- For orch-owned worktrees: `Open Thread` replaced with `Open Lane` (navigates to Orchestrator lane view)

**Filtering:**
- Filter bar at top of Worktrees section: segmented control with `All | Threads | Orchestrator | Manual`
- Default: `All`
- Filter state persisted per project in redb: `config:project:{pid}:source_control.worktree_filter` → string enum (`All`, `Threads`, `Orchestrator`, `Manual`). Each project starts with default `All` unless user changes it; no cross-project sharing.
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
| Branch name | Text input | `assistant/thread-<short_id>` (temp name) | Must be valid git branch name. If branch already exists: advisory warning per §55 (user can Create Anyway or change name). |
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
6. **Title rename flow:** Triggered by the `chat.thread_title_generated` event (fired when auto-title completes after first assistant response). System then:
   a. Sanitize title for git branch name (lowercase, replace spaces with hyphens, strip special chars, truncate to 50 chars)
   b. Compute target: `assistant/<sanitized_title>`
   c. If target branch name exists: auto-append `-2`, `-3`, etc. until unique (silent — no user dialog since this is auto-create; contrast with manual create in §8 which shows §55 advisory warning)
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
`temp_branch_name` tracks the original temporary branch name assigned before title generation. Used internally for: (1) reconciliation — if title generation fails or never fires, the binding can be identified by its temp name; (2) cleanup of stale temp branches if needed. For UI display, always use `branch_name`; `temp_branch_name` is for internal bookkeeping only.

**Inverse lookup (for 1:1 enforcement):**
- Key: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Used to quickly check if a worktree is already bound to another thread

**Worktree record extension (existing `worktree_record.v1`):**
- Add optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_tier_id?`
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_tier_id`, or neither (manual) is set

### 11. Seglog Events (new — 11 total)

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
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target` (`merged_result` or `branch_only`), `strategy` | Pre-merge test run started |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | Pre-merge tests passed |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` (bool) | Pre-merge tests failed; `user_override=true` if user clicked Merge Anyway |

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
| Concurrent merge attempt (lock contention) | Error toast: "Another merge is in progress. Complete or cancel it before starting another." Merge button disabled while lock held. |
| Main repo dirty when test needs checkout (squash/merge + merged_result) | Merge blocked: "Cannot run pre-merge test: main repo has uncommitted changes. Commit or stash your changes, then retry." |
| Test command not found or not executable | Dialog shows: "Test command '{cmd}' not found or not executable." Buttons: Retry / Merge Anyway / Cancel. |
| Test command permission denied | Dialog shows: "Permission denied: '{cmd}' — ensure test script has execute permission." Buttons: Retry / Merge Anyway / Cancel. |
| Test timed out | Dialog shows: "Tests timed out after {N}s" + output collected up to timeout. Buttons: Merge Anyway / Cancel. |
| Test failed (exit code ≠ 0) | Dialog shows: "Tests failed (exit {code})" + full output. Buttons: Merge Anyway / Cancel. Seglog records exit code and override flag. |
| Test output exceeds 1MB | Dialog appends "[OUTPUT TRUNCATED — see terminal for full output]". Truncation does not affect test pass/fail determination. |
| Auto-detect found no test command | Info row in dialog: "No test command detected. Configure in Settings or skip." Test step skipped; merge proceeds. |
| Test abort/cleanup fails | Error toast: "Failed to abort: {error}. Manual `git reset` / `git rebase --abort` may be needed." Dialog closes. |
| PM crash during test execution | WorktreeManager reconciliation detects `.git/MERGE_HEAD` or `.git/rebase-merge/` on next launch. Warning logged. User resolves via terminal. |
| Branch name collision in create dialog (existing branch) | Warning in dialog: "Branch '{name}' already exists. Worktrees on the same branch may interfere." User can Continue or Use Different Branch. |
| Stale merge lock at startup | Auto-remove lock if PID dead or lock older than 5 minutes. Toast: "Stale merge lock cleaned up from previous session." |
| Merge attempted while lock held by another merge | Error toast: "Another merge is in progress. Complete or cancel it first." All Merge buttons project-wide disabled while lock held. |
| Detached HEAD: merge or PR attempted | Dialog error: "Cannot merge: worktree is on a detached HEAD. Checkout a branch first." Merge/PR buttons disabled. |
| Git hook (pre-commit / pre-merge-commit) rejects commit | Dialog shows: "Merge failed: {hook_name} hook rejected the commit." Buttons: Retry / Cancel. Cleanup runs (abort). |
| Branch deleted while PM running | Toast on next thread focus: "Branch '{name}' was deleted. Worktree is now on detached HEAD." Merge/PR disabled. |
| Project switched while worktree bound | Worktree button disabled with tooltip: "Worktree belongs to project '{name}'." No auto-unbind. |
| Worktree unbound while merge dialog open | Dialog shows inline error: "Worktree binding was removed. Merge cancelled." Dialog closes; no merge executed. |
| Thread deleted while merge dialog open | Dialog shows inline error: "Thread was deleted. Merge cancelled." Dialog closes; no merge executed. |
| Rebase conflicts during `git rebase {target}` (before tests) | Rebase aborted (`git rebase --abort` in worktree). Dialog shows: "Rebase failed due to conflicts with {target}. Resolve conflicts first, or use Squash/Merge strategy." Tests never run. Lock released. |

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

**Pre-merge test gate:**
86. When enabled, tests run against merged result (uncommitted) before committing merge
87. Auto-detect test command from project files (npm test, cargo test, pytest, etc.)
88. First merge in project: shows auto-detected command pre-filled with option to change; persists choice
89. Test failure: dialog shows full output + "Merge Anyway" override + "Cancel" (clean rollback)
90. Test timeout shows same override UI as failure
91. No test command detected + enabled: info row in dialog with Settings link, test step skipped (merge not blocked)
92. Test gate does NOT apply to PR creation path (delegates to GitHub CI)
93. Clean rollback on cancel: squash → `git reset --hard HEAD`; merge → `git merge --abort`; rebase → `git rebase --abort`
94. Seglog events: `chat.thread_worktree_pre_merge_test_started`, `chat.thread_worktree_pre_merge_test_passed`, `chat.thread_worktree_pre_merge_test_failed` (with `user_override` field)
95. Exclusive merge lock prevents concurrent merges; error toast if lock contention
96. Main repo dirty check blocks squash/merge test gate when uncommitted changes exist in main repo
97. Test output capped at 1MB; ANSI stripped; invalid UTF-8 replaced; line endings normalized
98. Dialog dismissal during test kills process and runs cleanup (abort); crash recovery via WorktreeManager reconciliation
99. Remote SSH projects: test command executes on remote host via SSH subprocess, not locally
100. Auto-detect verifies script/target existence (not just file presence); Makefile checks for `test:` target
101. Pre-merge test gate runs for user-initiated merges in all modes (Ask, Agent, Debug, Plan, Deep Plan)

**Sweep 7 — lock recovery, execution contract, edge cases:**
102. Stale `.git/pm-merge.lock` auto-removed at startup if PID dead or lock older than 5 minutes
103. All Merge buttons project-wide disabled while merge lock held (not just the merging worktree)
104. Compare button opens branch-to-branch diff (worktree HEAD vs base HEAD) via `cmd.git.open_diff`
105. Each `cmd.chat.worktree.*` command has explicit visibility and enablement conditions (§58)
106. Project switch: worktree binding inactive (not unbound); button disabled; reactivated on switch-back
107. Execution context: Chat populates `execution_unit_context.worktree_id` + `working_directory` at turn-start; frozen for turn
108. Safe points include worktree snapshot (worktree_id, worktree_path, branch_name, HEAD_sha)
109. Detached HEAD blocks merge/PR with clear error message; user must checkout a branch
110. Git hooks run normally during merge commit phase; hook failure = merge failure with Retry/Cancel
111. Branch deletion while running detected via projection; shows detached HEAD; toast on next focus
112. Mode transitions do NOT affect worktree binding (binding is thread-level, orthogonal to mode)
113. Title-less thread keeps temp worktree name indefinitely; user can rename via `git branch -m` in terminal

**Sweep 9 — new section coverage, atomicity, edge cases:**
114. Auto-create called by Chat runtime synchronously before first turn dispatch; Executor never creates thread worktrees (§65)
115. NL merge emits structured `cmd.chat.worktree.merge` system action; PM shows pre-filled confirmation dialog for user approval (§66)
116. NL merge rejected in Ask/Plan mode when invoked via agent-NL; user UI clicks always allowed (§66)
117. Merge dialog commit message field hidden when Rebase selected; visible for Squash/Merge; user edits preserved across strategy switches (§67)
118. Force-remove on thread delete with "Delete and remove worktree" uses `git worktree remove --force` (§68)
119. branch_only + Rebase: tests run BEFORE rebase begins; failure blocks rebase entirely (§69)
120. File manager swap toggle resets on ANY thread switch (§70)
121. Accordion has two-level scroll model: sections scroll at max-height, container scrolls when total exceeds panel (§71)
122. Revert with deleted worktree path fails with file-not-found error (§72)
123. Merge lock acquired BEFORE guard checks (atomic); guards fail → lock released immediately (§51)
124. Rebase conflicts during `git rebase {target}` abort rebase; pre-merge test never runs (§51)
125. Merge dialog transforms in-place during test phase (not a new dialog); fields become read-only (§51)
126. Worktree unbound or thread deleted mid-merge dialog: dialog shows error and closes (§17)
127. Completed/failed threads retain full merge/PR availability via worktree row or thread dropdown (§54)

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

**Critical: merge executes in the main repo working tree, NOT inside the worktree.** This is consistent with WorktreeGitImprovement.md `merge_worktree()` which operates from the main repo context. The worktree branch is merged INTO the target branch in the main repo. **Exception: Rebase is a two-phase operation — step 1 (`git rebase`) runs in the worktree, step 3 (`git merge --ff-only`) runs in the main repo. See §50 for details.**

1. User confirms strategy + target branch + commit message
2. Dialog transitions to loading state ("Merging…" / "Squashing…" / "Rebasing…"): strategy segmented control disabled, target branch dropdown disabled, commit message textarea read-only/greyed, Merge button disabled + shows loading spinner with strategy-specific label, Cancel button remains enabled for user abort
3. Backend auto-fetches: `git fetch origin {target}` (in main repo) to ensure target branch is up-to-date with remote. If fetch fails (offline, no remote): proceed with local state and show advisory toast "Could not fetch latest — merging against local state."
4. **If pre-merge test gate is enabled (§51):** the merge dialog transforms in-place to show test phase — fields remain visible but read-only, dialog body shows test output region, Merge button hidden until test completes. See §51 for full step-by-step.
5. **If pre-merge test gate is disabled:** Backend executes (all commands in **main repo** context, NOT worktree):
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

**Merge execution location:** Squash and Merge (no-ff) commands execute entirely in the **main repo** working tree. Rebase is a two-phase operation: step 1 (`git rebase {target}`) executes in the **worktree**, then step 3 (`git merge --ff-only`) executes in the **main repo**. In all cases, the worktree is the *source* branch; the main repo is the final destination. See §51 for lock scope covering both phases. This is consistent with WorktreeGitImprovement.md `merge_worktree()`.

**Lock-first ordering:** The exclusive merge lock (§51) is acquired as the FIRST step of any merge, BEFORE guard checks or git operations begin. This ensures atomicity — see §51 for the complete sequence.

**Auto-fetch before merge:** Before executing any merge strategy, the backend runs `git fetch origin {target_branch}` in the main repo to ensure the local target is up-to-date. If fetch fails (no remote, offline), merge proceeds with local state and an advisory toast is shown.

**Auto-push before PR:** Before opening the PR panel, the system pushes the worktree branch to the remote (`git push -u origin {branch}`). If push fails, PR creation is aborted with an error toast.

**Rebase is non-interactive only:** The "Rebase" strategy executes `git rebase {target}` (non-interactive). Interactive rebase (`git rebase -i`) with pick/squash/fixup is out of scope for the dialog — users who need interactive rebase should use the terminal.

**Commit authorship:** Merge/squash commits use the user's git identity from git config (`user.name` / `user.email`). PM does not inject AI co-author attribution for merge commits — these are user-initiated infrastructure operations.

**No undo for completed merge:** There is no dedicated undo mechanism for git merge operations. To reverse a merge, the user can run `git reset --hard` or `git revert` via the terminal or ask the agent to do it via bash. This matches the general PM principle that significant git operations are intentional.

**Merge dialog accessibility:** The merge confirmation dialog and post-merge modal follow standard PM dialog patterns: Escape to close, Tab/Enter/Arrow keyboard navigation, focus trapping within dialog, aria-live="polite" announcements for merge status ("Merge complete" / "Merge failed: {reason}").

**NL merge always shows confirmation dialog:** Even when triggered via natural language, the merge dialog appears for user confirmation. The agent pre-fills the strategy/target/message based on intent recognition, but the user must confirm. This applies in all run modes including yolo (merge is significant enough to warrant explicit confirmation).

**Ask/Plan mode and merge:** Worktree creation/bind/unbind are infrastructure (allowed in all modes). Merge is a **git mutation** — it modifies the target branch. However, the merge dialog is a user-initiated UI action (not an agent tool invocation), so it is available in all modes. The key distinction: in Ask/Plan mode, the *agent* cannot trigger a merge via NL (it would need to invoke a mutation), but the *user* can still click "Merge into Base…" in the dropdown directly.

### 51. Pre-Merge Test Gate

**Purpose:** Before committing a merge, run the project's test suite against the *merged result* (or optionally the branch in isolation) to verify the integration doesn't break anything. Enabled by default.

**Settings:**
- `branching.assistant_worktree_pre_merge_test` — bool, default `true`. Master toggle.
- `branching.assistant_worktree_pre_merge_cmd` — string, default empty. When empty, PM auto-detects from project files. When set, this exact command is run.
- `branching.worktree_pre_merge_test_timeout_s` — int, default 300 (5 min), clamped [30, 1800].
- `branching.assistant_worktree_pre_merge_test_target` — enum `merged_result` | `branch_only`, default `merged_result`.

#### Auto-Detection of Test Command

When `branching.assistant_worktree_pre_merge_cmd` is empty, PM inspects the project root for known project files and infers the test command. **Detection requires verification** that the relevant script/target actually exists, not just the config file:

| File detected | Verification | Inferred command | Priority |
|---------------|-------------|-----------------|----------|
| `package.json` | `scripts.test` field exists and is non-empty | `npm test` | 1 |
| `Cargo.toml` | File presence sufficient (cargo test always available) | `cargo test` | 2 |
| `pyproject.toml` | `[tool.pytest]` section or `pytest` in dependencies | `pytest` | 3 |
| `setup.py` or `setup.cfg` | File presence sufficient | `python -m pytest` | 4 |
| `Makefile` | Contains `test:` target (regex match `^test:`) | `make test` | 5 |
| `build.gradle` or `build.gradle.kts` | File presence sufficient (Gradle test task is convention) | `./gradlew test` | 6 |
| `pom.xml` | File presence sufficient (Maven test phase is convention) | `mvn test` | 7 |
| `Gemfile` | File presence sufficient | `bundle exec rake test` | 8 |
| `go.mod` | File presence sufficient | `go test ./...` | 9 |

**Resolution order:** If multiple files match, use the highest priority (lowest number). User can always override by setting `branching.assistant_worktree_pre_merge_cmd`.

**Persisted command overrides auto-detection.** Once the user confirms or edits a command (via first-run or Settings), that persisted value is used for all future merges. To re-run auto-detection, clear the setting in Settings > Branching > Pre-merge test command. Per-merge command override is not MVP.

**No detection result:** If no project file is recognized AND no command configured, and `pre_merge_test` is `true`: the merge dialog shows an info row "No test command detected" with a "Configure" link to Settings > Branching > Assistant Worktrees. The test step is **skipped** (merge is NOT blocked by an unconfigurable test). This avoids punishing projects that don't have a standard test runner.

#### First-Run Experience

On the first merge attempt in a project where `pre_merge_test` is `true` and no command is configured:
1. Auto-detection runs and finds a candidate (or not)
2. If a candidate is found: the merge dialog shows a pre-filled info row: "Will run: `npm test` (auto-detected)" with a small "Change" link
3. Clicking "Change" opens an inline edit field where the user can modify the command
4. The confirmed command is persisted to `branching.assistant_worktree_pre_merge_cmd` so it's used for future merges
5. If no candidate found: shows "No test command detected. Configure in Settings or skip."

#### Merge Execution Flow with Test Gate

**When `pre_merge_test` is `true` AND test command is available:**

**For `merged_result` target (default):**

| Strategy | Steps |
|----------|-------|
| **Squash** | 1. `git fetch origin {target}` (advisory if fails) → 2. `git checkout {target}` → 3. `git merge --squash {branch}` → 4. **Run tests** (on staged merge result, uncommitted) → 5a. Tests pass: `git commit -m "{message}"` → done. 5b. Tests fail: show results + Merge Anyway / Cancel; on cancel: `git reset --hard HEAD` |
| **Merge (no-ff)** | 1. Fetch → 2. `git checkout {target}` → 3. `git merge --no-ff --no-commit {branch}` → 4. **Run tests** (on staged merge result) → 5a. Pass: `git commit -m "{message}"` → done. 5b. Fail: results + Merge Anyway / Cancel; on cancel: `git merge --abort` |
| **Rebase** | 1. (in worktree) `git rebase {target}` → 2. **Run tests** (in worktree, which now has the rebased-onto-target state) → 3a. Pass: (in main repo) `git checkout {target}` → `git merge --ff-only {branch}` → done. 3b. Fail: results + Merge Anyway / Cancel; on cancel: `git rebase --abort` (in worktree) |

**Rebase conflict during step 1:** If `git rebase {target}` encounters conflicts (before tests ever run), the rebase is aborted immediately (`git rebase --abort` in worktree). The merge dialog shows inline error: "Rebase failed due to conflicts with {target}. Resolve conflicts in the worktree first, or use Squash/Merge strategy." Pre-merge tests never execute in this case. Lock is released.

**For `branch_only` target:**

Tests run in the **worktree** directory against the branch as-is, BEFORE any merge operation begins. If tests fail, merge is blocked (with override). If tests pass, merge proceeds with the normal execution flow from §48.

**Abort/cleanup is always clean:** Every strategy has a clean rollback path that restores the repo to its exact pre-merge state. No half-merged state is ever committed.

#### Pre-Merge Guards for Test Gate

**Main repo dirty check (squash/merge strategies only):** For `merged_result` with squash or merge, the test requires `git checkout {target}` in the main repo, which changes the main repo's HEAD. Before initiating this:
1. Check if main repo has uncommitted changes. If dirty: block with "Cannot run pre-merge test: main repo has uncommitted changes. Commit or stash your changes in the main project, then retry."
2. Warn user in dialog before test phase: "Tests will run against the merged result in the {target} branch. Active editors and terminals in the main project may observe temporary branch changes."
3. During test execution, the merge dialog is **modal** — it blocks all other merge dialogs and significant git operations on the main repo.

**Exclusive merge lock:** Merge execution acquires an exclusive lock (file lock on `.git/pm-merge.lock` in the main repo `.git/` directory) regardless of strategy. The lock is acquired as the FIRST step of merge execution, BEFORE any git operations begin. Pre-merge guards (dirty check, conflict check, active run check) run AFTER lock acquisition — this makes guard-check + execution atomic, preventing races where another merge completes between guard check and execution start. If lock acquisition fails (lock already held), the merge is rejected with error toast: "Another merge is in progress. Complete or cancel it before starting another." If guards fail after lock acquisition, the lock is released immediately. Only one merge can execute at a time per project.

**Rebase lock clarification:** Even though rebase step 1 runs in the worktree (`git rebase {target}`), the lock is still `.git/pm-merge.lock` in the main repo — because rebase step 3 (`git merge --ff-only`) operates on the main repo. The lock covers the ENTIRE rebase sequence (worktree rebase → test → main repo ff-merge) to prevent concurrent operations that could conflict.

#### Test Execution in the Merge Dialog

**Dialog flow when tests are enabled:**

1. User confirms strategy + target + message, clicks Merge/Squash/Rebase
2. Dialog transitions to test phase:
   - Strategy preparation runs (checkout, merge --no-commit, etc.)
   - Dialog shows: "Running tests…" with the test command displayed
   - Live output stream from test command shown in a scrollable monospace region (max-height ~200px, scrolls)
   - Cancel button available to abort test early (kills test process, then runs abort/cleanup)
3. Test outcome:
   - **Pass (exit code 0):** Dialog auto-proceeds to commit step. Brief "Tests passed" success indicator shown for 1 second before commit.
   - **Fail (exit code ≠ 0):** Dialog shows:
     - Red header: "Tests failed"
     - Full test output visible (scrollable)
     - Two buttons: **"Merge Anyway"** (secondary/destructive style) + **"Cancel"** (primary)
     - "Merge Anyway" proceeds to commit despite failure. Seglog records that tests failed but user overrode.
   - **Timeout:** Dialog shows: "Tests timed out after {N}s" with same Merge Anyway / Cancel buttons
   - **Process error (command not found, permission denied, etc.):** Dialog shows error; same override option

#### Test Command Execution Environment

- **Working directory:** Depends on strategy and target setting. For `merged_result`: the directory where the merge state exists (main repo for squash/merge, worktree for rebase). For `branch_only`: always the worktree directory.
- **Environment variables:** Inherits from the project environment (same as terminal `cwd` context)
- **Shell:** Runs via the system shell (`/bin/sh -c "{command}"` on Unix, `cmd /c "{command}"` on Windows)
- **No PM environment injection:** The test command runs as a plain shell command. PM does not inject PATH modifications, virtual envs, or other environment setup — the command must work as the user would type it in a terminal.
- **Stdout + stderr:** Both captured and merged in interleaved order (no separation). Displayed in the dialog output region.

**Remote SSH projects:** Test command execution follows the project's host authority (per §19). For remote SSH projects, test commands execute on the **remote host** via the same SSH subprocess mechanism used for all remote git operations. Working directory is resolved on the remote filesystem. Environment variables and PATH are the remote host's defaults (not transferred from local). For projects requiring specific setup (venv activation, nvm use, etc.), include setup in the command or use a wrapper script.

**Output handling:**
- **Size limit:** Test output is capped at 1MB. If exceeded, dialog appends "[OUTPUT TRUNCATED — see terminal for full output]". Remaining output is discarded.
- **Encoding:** Output is decoded as UTF-8 with lossy replacement (U+FFFD) for invalid bytes.
- **ANSI escape codes:** Color and style SGR sequences are stripped. Only text content is displayed. This prevents terminal escape injection and ensures consistent rendering.
- **Line endings:** All line endings (CRLF, LF, CR) normalized to LF.

#### Dialog Dismissal and Crash Recovery

**Dialog dismissal during test:** If user clicks Cancel, presses Escape, or closes the dialog while test is running:
1. Test process is immediately terminated (SIGTERM on Unix, TerminateProcess on Windows)
2. Cleanup runs (same abort path for the strategy: `git reset --hard HEAD` for squash, `git merge --abort` for merge, `git rebase --abort` for rebase)
3. If cleanup succeeds: toast "Merge cancelled — changes rolled back." Dialog closes.
4. If cleanup fails (e.g. permission denied): error toast "Failed to complete abort: {error}. Manual `git reset` / `git rebase --abort` may be required." Dialog closes.

**PM crash during test:** If PM crashes or network disconnects mid-test:
- Test process is orphaned (continues running or terminates after timeout)
- Main repo is left in a transitional state (staged merge, not committed; or mid-rebase)
- On next PM launch: WorktreeManager reconciliation detects incomplete merge/rebase via `.git/MERGE_HEAD` or `.git/rebase-merge/` marker files and logs warning
- User must manually complete (`git commit`) or abort (`git merge --abort` / `git rebase --abort`) via terminal
- This is recoverable — main repo is not corrupted, just in an intermediate git state

#### Seglog Events for Pre-Merge Test

| Event type | Fields | Description |
|------------|--------|-------------|
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target` (`merged_result` or `branch_only`), `strategy` | Test run started |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | Tests passed |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` (bool) | Tests failed; `user_override=true` if user clicked "Merge Anyway" |

#### NL Path with Test Gate

When the agent triggers a merge via natural language and tests are enabled:
1. Agent emits the merge action request → dialog appears
2. Test runs in the dialog as usual — user sees output
3. On failure: dialog shows results + override option. The *user* decides whether to override (the agent does not auto-override).
4. The agent can offer to help fix failing tests if the user cancels ("Tests failed — want me to look at the errors?")

#### Test Gate and PR Path

The pre-merge test gate applies to **direct merge only** (squash/merge/rebase into local branch). It does NOT apply to the "Create PR" flow — PR creation pushes the branch to remote and delegates validation to GitHub CI / branch protection rules. This avoids double-testing.

**Pre-merge test in Ask/Plan mode:** Pre-merge test gate runs for all user-initiated merges in all modes (Ask, Agent, Debug, Plan, Deep Plan). In Ask/Plan mode, agent cannot trigger merge via NL (mutation guard), but user can still click "Merge into Base…" in the dropdown and the full test gate executes normally.

### 52. Source Control Merge for Non-Thread Worktrees

**Rule:** The Source Control expanded worktree row shows "Merge" and "Create PR" buttons for assistant-owned and manual worktrees (not orch-owned, per §5). These buttons trigger the **same merge/PR dialogs** as the chat dropdown — identical UI, identical flow, identical pre-merge test gate.

**Thread context handling:** When the worktree IS thread-owned, the merge dialog reads thread-specific state (cleanup_default setting follows thread's binding). When the worktree is NOT thread-owned (manual worktree):
- `thread_id` is null in command parameters
- Strategy defaults to project setting (squash)
- Target branch defaults to `branching.base_branch`
- Commit message defaults to empty (user must fill)
- Pre-merge test gate runs normally (tests are project-level, not thread-level)
- Post-merge cleanup modal does NOT appear (no thread to unbind from); worktree simply remains on disk as-is after merge

**Command routing:** Source Control merge buttons route through the same `cmd.chat.worktree.merge` command with `thread_id=null` for non-thread worktrees. The command handler detects null thread_id and omits thread-specific behaviors (no unbind, no thread status update, no chat notification).

### 53. Worktree Cleanup on App Uninstall / Data Reset

**Rule:** On app uninstall, PM performs **NO automatic cleanup** of worktrees. Worktrees remain in `.puppet-master/worktrees/` directories under each project root.

**Rationale:** Worktrees contain git branches with user code. Silently deleting them on uninstall could cause data loss. The `.puppet-master/` directory is already part of the pre-existing Phase 3 gitignore plan.

**Recovery paths:**
- User manually removes `.puppet-master/` directories from project roots
- On reinstall: WorktreeManager's Doctor check reports orphaned worktrees and offers "Remove all orphaned worktrees" action
- On project removal from PM (but folder stays on disk): worktrees remain; git considers them valid worktrees regardless of PM state

### 54. Completed/Failed Thread + Dirty Worktree

**Rule:** When a thread reaches `completed` or `failed` status while it has a bound worktree:
- No automatic unbind or cleanup occurs
- The worktree remains available for merge/PR creation even if the owning thread is completed
- If the bound worktree is dirty, the Source Control Worktrees section shows the worktree with combined status: `dirty · completed` (or `dirty · failed`) in the status pill
- Thread selector icon shows the standard worktree icon (not a special completed+worktree variant)
- The user must explicitly delete the thread (triggers cleanup modal per §13) or unbind to release the worktree
- Toast on thread completion if worktree is dirty: "Thread completed. Worktree has uncommitted changes — merge or clean up when ready."
- **Merge/PR fully available:** The worktree remains fully functional for merge/PR even after thread completion. User can merge completed thread's work back to base without deleting the thread first. All 4 merge access paths (dropdown, SC row, slash commands, NL) remain active.

### 55. Branch Name Collision Warning in Create Dialog

**Rule:** When the user enters a branch name in the Create Worktree dialog (§8), before allowing create, check if the branch already exists in the project's git repo (`git rev-parse --verify refs/heads/{branch}`). If it exists:
- Show warning in dialog: "Branch '{name}' already exists. Creating a worktree on the same branch as another worktree may cause interference."
- Buttons: "Create Anyway" (proceeds) / "Use Different Branch" (clears field, focuses input)
- This is advisory only — user can create anyway. Two worktrees on the same branch is technically valid but confusing.

### 56. Stale Merge Lock Recovery

**Rule:** The `.git/pm-merge.lock` file (introduced in §50) may persist if PM crashes during a merge. On PM startup (lazy — when any merge-related action is first attempted):

1. Check if `.git/pm-merge.lock` exists
2. If it exists, read the lock file content (contains PID of lock holder and timestamp)
3. If the PID is no longer running OR the lock is older than 5 minutes: auto-remove the lock file and log warning "Removed stale merge lock from previous session"
4. If the PID IS running (another PM instance?): block with error toast "Another PM instance holds the merge lock"
5. Show advisory toast on first merge attempt after stale lock cleanup: "A previous merge may not have completed cleanly. Check git status before proceeding."

**Lock file format:** JSON: `{ "pid": <int>, "started_utc": "<ISO8601>", "worktree_id": "<string>", "strategy": "<string>" }`

**WorktreeManager Doctor check:** Doctor reports stale `.git/pm-merge.lock` alongside orphaned worktrees and `.git/MERGE_HEAD` / `.git/rebase-merge/` markers.

### 57. Compare Button Diff Scope

**Rule:** The "Compare" button in the Source Control worktree expanded row (§5) opens a **branch-to-branch diff**: worktree branch HEAD vs. base branch HEAD.

- Routes through the existing `cmd.git.open_diff` command
- `compare_origin` = base branch ref (e.g. `main`)
- `compare_target` = worktree branch ref (e.g. `assistant/fix-auth-bug`)
- Shows committed differences only (not working tree changes — those are visible in the Changes section)
- This is a 2-way diff (left=base, right=worktree branch)

### 58. Command Visibility Conditions (When Clauses)

**Rule:** Each worktree command has visibility/enablement conditions:

| Command | Visible when | Enabled when |
|---------|-------------|-------------|
| `cmd.chat.worktree.create` | Thread has NO worktree binding AND project has git repo | Always (when visible) |
| `cmd.chat.worktree.unbind` | Thread HAS worktree binding | No active run in worktree |
| `cmd.chat.worktree.remove` | Thread HAS worktree binding | No active run in worktree |
| `cmd.chat.worktree.merge` | Thread HAS worktree binding (or SC row context) | No active run AND no merge lock held AND worktree not dirty AND no conflicts AND worktree NOT on detached HEAD |
| `cmd.chat.worktree.pr` | Thread HAS worktree binding AND project has GitHub remote | No active run AND worktree NOT on detached HEAD |
| `cmd.chat.worktree.info` | Thread HAS worktree binding | Always (read-only) |

**Merge lock scope:** While `.git/pm-merge.lock` is held, ALL merge buttons across ALL worktrees in the project are disabled with tooltip "Another merge is in progress." This is project-wide, not per-worktree — because merge operations touch the main repo context.

**Detached HEAD scope:** Unbind and Remove have no detached HEAD restriction — they are lifecycle operations, not git mutations. Detached HEAD restriction applies only to merge/PR because they create new commits.

**When-clause vs guard atomicity:** The enablement conditions in the table above are pre-checks for UI state (enabling/disabling buttons). When the user clicks Merge and the lock is acquired, the guards (dirty, conflicts, active run) are re-checked atomically AFTER lock acquisition (see §51). This two-phase check prevents races between UI pre-check and actual execution.

### 59. Project Switch with Worktree-Bound Threads

**Rule:** When the user switches the active project while threads with worktree bindings exist:

1. Worktree bindings are NOT automatically unbound — they remain in thread state
2. The worktree button in the chat header shows the binding state but is **disabled** (grayed) with tooltip "Worktree belongs to project '{old_project}'"
3. If the user switches back to the original project, the binding is reactivated and the button becomes interactive again
4. If an active run is in progress on a worktree-bound thread when the project switches: the run continues (it has a frozen working_directory from turn-start); the next turn will use the new project's context
5. No auto-unbind, no toast — the binding is simply inactive while a different project is focused

**Rationale:** Project switch is a navigation action, not a destructive action. Users may switch projects temporarily and return. Auto-unbinding would be surprising.

### 60. Execution Context Handoff Contract (Chat → Executor)

**Rule:** The data flow for worktree context from Chat runtime to Executor is:

1. **Turn-start:** Chat runtime resolves thread's worktree binding from `thread_state:{thread_id}:worktree_binding`
2. **Population:** If bound: `execution_unit_context.worktree_id = binding.worktree_id` and `execution_unit_context.working_directory = binding.worktree_path`. If unbound: `worktree_id = null`, `working_directory = project_root`
3. **Freeze:** These values are frozen for the turn. Mid-turn binding changes (user clicks Unbind) do NOT affect the in-flight turn
4. **Propagation:** Executor receives `execution_unit_context` and passes `working_directory` to all downstream consumers: FileSafe `check_file_write`, tool invocations (bash cwd, MCP tools), `@file` resolution, auto-retrieval scope context
5. **DAE strategy:** For provider CLI (Delegated Agent Execution), `working_directory` is passed via the provider's execution context JSON payload alongside other run parameters
6. **Rotation/follow-up:** Rotated follow-up runs inherit the parent thread's worktree binding. The next rotation resolves binding fresh from thread state (so a mid-turn unbind takes effect on the next rotation)

**Safe points:** Safe point snapshots for worktree-bound runs include: `worktree_id`, `worktree_path`, `branch_name`, `HEAD_sha` (from `git rev-parse HEAD` in worktree). This allows safe point restoration to verify the worktree is still at the expected state.

### 61. Detached HEAD Handling

**Rule:** If a worktree is on a detached HEAD (e.g. user ran `git checkout <sha>` in the worktree terminal):

- **Merge:** Blocked. Merge dialog shows error: "Cannot merge: worktree is on a detached HEAD. Checkout a branch first." Merge button disabled.
- **PR:** Blocked. Same reason — PR requires a named branch to push.
- **Status display:** Thread selector icon and chat header button show the binding but tooltip displays "detached HEAD at {short_sha}" instead of branch name
- **Detection:** Read from `worktree_projection.v1` which reflects git worktree status (HEAD may be detached)
- **Resolution:** User runs `git checkout -b <branch>` in terminal, or unbinds and re-creates

### 62. Git Hooks and Test Gate

**Rule:** PM does NOT bypass or suppress git hooks during the pre-merge test gate flow. Standard git hooks run at their normal trigger points:

- `pre-commit`: Runs during `git commit` (the final commit step after tests pass). If hook fails, commit fails → merge fails → treated as merge error in dialog
- `pre-merge-commit`: Runs during `git merge --no-ff` commit. Same treatment as pre-commit failure
- `prepare-commit-msg`: Runs and may modify the commit message. PM's provided message is the initial value; hooks can append/modify
- `post-merge`: Runs after successful merge commit. Does not affect merge outcome

**Impact:** If user has hooks that modify files (e.g., auto-formatting pre-commit), the test gate tests the PRE-hook state. Hooks run after test pass, during commit. This is correct behavior — hooks are part of the commit pipeline, not the test pipeline.

**Documentation note:** If test gate passes but commit fails due to hook, the dialog shows "Merge failed: pre-commit hook rejected the commit" with Retry/Cancel options. The merge state is cleaned up (abort path).

### 63. Mode Transitions and Worktree Binding

**Rule:** Changing chat modes (Ask → Agent → Debug → Plan → Deep Plan) does NOT affect the thread's worktree binding. The binding is thread-level state, orthogonal to mode selection.

- Switching from Agent → Ask mid-thread: worktree stays bound; working_directory stays worktree path; agent cannot write files (Ask mode read-only) but worktree context is preserved
- Switching from Ask → Agent: worktree stays bound; agent can now write files in the worktree
- Working_directory resolution is always thread-scoped, never mode-scoped

### 64. Branch Deletion While PM Running

**Rule:** If the user deletes the worktree's branch via terminal (`git branch -d <branch>`) while PM is running:

- The worktree enters a detached HEAD state (git detaches the worktree's HEAD when its branch is deleted)
- PM detects this via `worktree_projection.v1` update (projection refresh picks up the branch→detached transition)
- UI updates: thread selector icon tooltip changes to "detached HEAD"; merge/PR buttons disabled (per §61)
- No auto-unbind — the worktree still exists on disk, just without a named branch
- Toast on next thread focus: "Branch '{name}' was deleted. Worktree is now on detached HEAD."

### 65. Auto-Create Caller and Timing

**Rule:** Auto-create is called by the **Chat runtime** within the thread creation pipeline, synchronously BEFORE the first turn is dispatched.

**Sequence:**
1. User creates thread (via `cmd.chat.new` or first message)
2. Chat runtime checks `branching.assistant_auto_worktree` setting
3. If true: Chat runtime calls `WorktreeManager::create_worktree(branch_name, base_ref)` synchronously
4. WorktreeManager computes path (`{project_root}/.puppet-master/worktrees/thread-{short_id}`) and executes `git worktree add`
5. Timeout from §38 applies (default 30s)
6. On success: binding created, first turn dispatched with worktree as working_directory
7. On failure: thread created WITHOUT worktree, warning toast, first turn dispatched with project root as working_directory
8. Auto-create does NOT retry on failure — user can manually create later

**Ownership:** Chat runtime owns the auto-create call. Executor never invokes WorktreeManager directly for thread worktree creation.

### 66. NL Merge Invocation Mechanism

**Rule:** When the agent determines the user wants a merge, it invokes the merge command as a **structured system action** — the same pattern used by `cmd.chat.revert` and other system commands.

**Mechanism:**
1. Agent receives user message ("merge my changes into main")
2. Agent interprets intent and resolves parameters (strategy=squash, target=main)
3. Agent emits a system action: `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash", "target_branch": "main" } }`
   - Payload schema: `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash|merge|rebase" (optional, default squash), "target_branch": "string" (optional, default from settings), "commit_message": "string" (optional, auto-generated if absent) } }`
   - Missing or null params use dialog defaults
4. PM runtime intercepts the system action and shows the merge confirmation dialog pre-filled with agent's parameters
5. User confirms or cancels in the dialog
6. Dialog result (success/failure/cancel) is returned to the agent's conversation context so it can respond appropriately

**Mode guard:** The `cmd.chat.worktree.merge` handler checks the invocation source. If source is agent-NL AND current mode is `ask` or `plan`: reject with error "Merge is not available via assistant in {mode} mode. Use the Merge button in the chat header dropdown." User-initiated (dropdown click, slash command) bypasses this guard.

**Agent tools for pre-merge checks:** The agent uses its standard bash tool to run `git status` (which auto-scopes to worktree via working_directory/cwd) to check dirty/conflict state before emitting the merge action.

### 67. Merge Dialog Reactive Behavior

**Rule:** The merge dialog fields react to strategy selection:

- **Squash selected:** Commit message field visible. Auto-generated message = concatenated commit messages from worktree branch (since divergence from base).
- **Merge (no-ff) selected:** Commit message field visible. Auto-generated message = "Merge assistant/{title} into {target}".
- **Rebase selected:** Commit message field **hidden** (rebase replays individual commits; no new commit message is created).
- Changing strategy updates the auto-generated message preview immediately.
- **Initial state:** On dialog open, commit message is auto-generated based on default strategy (Squash). If user opens dialog and immediately selects Rebase, the field hides; selecting Squash again restores the auto-generated Squash message.
- User edits to the commit message are preserved in memory when switching between Squash and Merge. Switching to Rebase hides the field (display: none). Switching back from Rebase restores the user's last edit (if they edited), or the auto-generated message (if they hadn't edited).

### 68. Force-Remove Dirty Worktree on Thread Delete

**Rule:** When the user explicitly chooses "Delete and remove worktree" in the extended delete confirmation (§13) and the worktree is dirty:

- The worktree IS force-removed: `git worktree remove --force <path>` + `git branch -D <branch>`
- The user was warned: the button label says "(has changes)" with destructive styling
- This is an intentional, user-confirmed destructive action — no additional confirmation
- If force-remove fails (e.g., locked files): error toast "Could not remove worktree: {error}. Thread deleted; worktree remains as orphaned." Thread deletion proceeds; worktree becomes ownerless.

**Delete dialog button styling:**
- "Delete and keep worktree" — secondary style (the safe option)
- "Delete and remove worktree" / "Delete and remove worktree (has changes)" — destructive style (red/warning)
- "Cancel" — tertiary/ghost style
- Default focus: "Cancel" (prevent accidental destructive action)

### 69. branch_only + Rebase Test Ordering

**Rule:** When `branching.assistant_worktree_pre_merge_test_target` = `branch_only` AND strategy = Rebase (this flow differs from `merged_result`+Rebase in §51 execution table):

- Tests run in the **worktree** against the branch as-is, BEFORE `git rebase {target}` begins
- If tests fail: rebase never starts; user sees failure with Merge Anyway / Cancel
- If tests pass: rebase proceeds normally (worktree `git rebase {target}` → main repo `git merge --ff-only`)
- This is consistent with `branch_only` semantics: "test the branch in isolation, before any merge/rebase operation"

### 70. File Manager Swap Toggle Reset Semantics

**Rule:** The file manager swap toggle resets on ANY thread switch, not just switches to unbound threads.

**Exact behavior:**
- User switches to thread B (from thread A): toggle resets to "show thread B's context"
- If thread B has a worktree: file manager shows worktree root
- If thread B has no worktree: file manager shows project root, no swap icon
- If user had manually toggled to project root in thread A, that toggle state is lost on switch
- Switching back to thread A: toggle resets again to "show thread A's context" (worktree root if bound)
- The `file_manager.worktree_follow_thread` setting controls whether thread switch triggers root change at all; when `false`, file manager always shows project root regardless of thread

### 71. Accordion Scroll Model

**Rule:** The accordion has a two-level scroll model:

1. **Section-level scroll:** Each expanded section has a `max-height` constraint (e.g., 50% of panel height). If a section's content exceeds its max-height, that section scrolls internally (standard CSS `overflow-y: auto`).
2. **Container-level scroll:** If the total height of all section headers + expanded section contents exceeds the panel height, the accordion container scrolls vertically. Section headers scroll with the content (they are NOT pinned/sticky).

These are independent: a user might scroll within a section (to see more worktree rows) AND scroll the outer container (to reach a different section). This is standard accordion behavior in constrained-height panels.

### 72. Revert with Deleted Worktree Path

**Rule:** If a user tries to revert (`cmd.chat.revert`) a file edit from a turn that executed in a worktree, and the worktree has since been removed:

- The mutation log contains the absolute path (e.g., `/project/.puppet-master/worktrees/thread-abc/src/main.rs`)
- The path no longer exists on disk
- Revert fails with inline error: "Cannot restore file: original path no longer exists. The worktree may have been removed."
- This is expected behavior — revert operates on absolute paths and cannot create missing directories
- The user can manually recreate the worktree or apply the changes elsewhere

### 73. Settings Key Naming Rationale

**Rule:** The mixed prefix pattern in settings keys is intentional:

- `assistant_worktree_*` prefix: Settings that are specific to assistant-created worktrees (auto_worktree, cleanup_default, base_ref, pre_merge_test, pre_merge_cmd, pre_merge_test_target). These would NOT apply to orchestrator worktrees.
- `worktree_*` prefix (no `assistant_`): Settings that are generic to ALL worktrees in the project regardless of owner (warning_threshold, create_timeout_s, pre_merge_test_timeout_s). These could apply if orchestrator gets similar features later.
- `file_manager.worktree_follow_thread`: In the `file_manager` namespace because it controls file manager behavior, not branching/worktree behavior.

## Impacted Docs

### MUST CHANGE (new or revised content required)
- `Plans/assistant-chat-design.md` — new section for worktree button (§28 or equivalent), thread ↔ worktree binding model, chat header control spec, dropdown spec, slash commands, Ask-mode worktree note, file-edit card path semantics, merge-back flow, cleanup-on-delete, mode-worktree invariant. **REPLACE: header controls table (exhaustive → add Worktree). REPLACE: thread state model (add worktree binding).**
- `Plans/GitHub_Integration.md` — Source Control §A.1 tab→accordion change; §A.4 Worktrees section layout redesign to single-column expandable rows; owner column expansion for thread IDs; accordion behavior rules; §C remote SSH worktree note. **REPLACE: §A.1 navigation mechanism (tabs → accordion). REPLACE: §A.4 worktree row layout (flat table → expandable rows). REPLACE: owner field ("run/tier" → "run/tier/thread").**
- `Plans/storage-plan.md` — new redb key families: `thread_state:{thread_id}:worktree_binding`, `worktree_binding_reverse:{worktree_id}`; new seglog event types: 8 worktree events + **3 pre-merge test events** (`chat.thread_worktree_pre_merge_test_started/passed/failed`); settings key additions (10 new settings); worktree_record owner field extension; accordion and filter persistence keys. **ADDITIVE to event table and key lists.**
- `Plans/WorktreeGitImprovement.md` — §4 GUI section cross-reference to assistant chat; new §2.X for assistant-created worktree lifecycle (temp name, rename, cleanup); owner model expansion; soft worktree limit warning; Doctor check for orphaned worktrees. **REPLACE: §4 "Orchestrator does not duplicate a raw worktree inventory" → unified inventory statement.**
- `Plans/FinalGUISpec.md` — thread selector worktree icon (§GUI updates #2 addition); Source Control accordion redesign reference; Appendix A cross-ref update for WorktreeGitImprovement; **Settings > Branching > "Assistant Worktrees" subsection with 10 settings in 3 groups**. Additive.
- `Plans/UI_Command_Catalog.md` — new `cmd.chat.worktree.*` commands (create, unbind, remove, merge, pr, info); slash command mappings; when-clause visibility conditions. Additive.
- `Plans/Executor_Protocol.md` — `execution_unit_context.worktree_id` population contract; `working_directory` handoff from Chat runtime; safe point worktree snapshot fields; DAE strategy worktree context passing. Additive.
- `Plans/FileManager.md` — worktree context switching behavior; breadcrumb toggle spec; search scope follows file manager root; edge case for unbound mid-session. **REPLACE: root context (fixed → dynamic). REPLACE: breadcrumb (file>symbol>block → add worktree toggle).**
- `Plans/Contracts_V0.md` — 11 new event type schemas (`chat.thread_worktree_*`) with minimum payloads; 6 new `cmd.chat.worktree.*` UICommand registrations; safe_point.created extended with worktree snapshot fields. Additive to existing event catalog and UICommand registry.
- `Plans/Wiring_Matrix.md` — new wiring entries for 6 `cmd.chat.worktree.*` commands, accordion toggle, file manager worktree swap, SC expanded-row Merge/PR buttons. Additive to SC addendum (lines 349+).

### MUST RECONCILE (consistency updates)
- `Plans/Orchestrator_Page.md` — §11 Source Control boundary update: assistant-owned worktrees are now part of the unified worktree inventory alongside orch-owned ones. **REPLACE: exclusive orch ownership → shared ownership statement.**
- `Plans/Run_Modes.md` — explicit note: mode transitions do not affect worktree binding; worktree binding is thread-level state. Amend DAE "ephemeral jail" wording. Additive.
- `Plans/LSPSupport.md` — worktree root_identity switching on thread focus change; lazy init and idle collection policy for worktree LSP sessions. Additive note.
- `Plans/Glossary.md` — new canonical terms: thread worktree binding, accordion (SC layout), working_directory (execution context), merge lock, pre-merge test gate. Additive.
- `Plans/Crosswalk.md` — new §3.6 for assistant worktree binding ownership boundary (Chat owns binding state; SC owns worktree lifecycle; Executor owns working_directory resolution). Additive.
- `Plans/DRY_Rules.md` — add "thread-worktree binding semantics and lifecycle" to owner-routed concepts list (line 52 area). Additive.
- `Plans/Commands_System.md` — §4.1 (line 215): "active project root" → "active working directory (worktree root or project root)". Minor text fix.
- `Plans/MiscPlan.md` — §3.3-3.4 (lines 110-112): clarify that cleanup contract applies to orchestrator-owned (temporary) worktrees; assistant-owned worktrees are persistent and not cleaned by runner contract. Additive note.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — register Worktrees in Assistant as MVP-promoted feature with scope, integration points, and non-MVP items. Additive.

### MUST VERIFY (check for conflicts, may not need edits)
- `Plans/Permissions_System.md` — verify no drift from Debug Mode worktree access or merge operations (ledger Decision #61 says no changes needed)
- `Plans/CLI_Bridged_Providers.md` — verify existing `working_directory` passthrough (line 144) sufficient for worktree context; no new fields expected
- `Plans/Prompt_Pipeline.md` — verify whether agent needs explicit worktree context in prompt or whether cwd-based execution is sufficient (ledger does not specify prompt injection)
- `Plans/GUI_Rebuild_Requirements_Checklist.md` — verify assistant chat worktree surface doesn't violate "worktree-first Source Control" checklist items (lines 29, 62)
- `Plans/human-in-the-loop.md` — verify merge dialog is a high-risk mutation gate (not HITL); no conflict expected
- `Plans/orchestrator-subagent-integration.md` — verify "only one mutation-capable investigation per worktree" rule (line 95) doesn't conflict with assistant 1:1 binding model
- `Plans/FileSafe.md` — verify no changes needed (working_directory already handles worktrees; confirmed during research)
- `Plans/Personas.md` — verify persona-worktree orthogonality (ledger §63 confirms independence; verify Personas.md doesn't contradict)

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
89. Pre-merge test gate enabled by default (`branching.assistant_worktree_pre_merge_test` = true); tests merged result, not branch in isolation
90. Test command auto-detected from project files (package.json → `npm test`, Cargo.toml → `cargo test`, etc.); user can override
91. Test runs against merged result: squash/merge use `--no-commit`, run tests, then commit or abort; rebase tests post-rebase worktree state
92. Test failure shows output + "Merge Anyway" override + "Cancel" (clean abort restores pre-merge state)
93. Test timeout default 300s, clamped [30, 1800]; timeout treated same as failure (override available)
94. Pre-merge test gate does NOT apply to PR creation (GitHub CI handles that path)
95. NL merge with test gate: dialog shows test output as usual; user confirms override if tests fail; agent does not auto-override
96. `branching.assistant_worktree_pre_merge_test_target` enum: `merged_result` (default, recommended) or `branch_only`
97. First-run: auto-detected command shown pre-filled in dialog; user can change; choice persisted for future merges
98. Exclusive merge lock (`.git/pm-merge.lock`) prevents concurrent merges; one at a time per project
99. Main repo dirty check gates squash/merge test gate; dirty main repo blocks merge with clear message
100. Test output capped at 1MB, ANSI stripped, UTF-8 lossy decode, CRLF normalized
101. Dialog dismissal kills test process and runs cleanup; crash recovery via WorktreeManager reconciliation on next launch
102. Remote SSH: test commands execute on remote host via SSH subprocess, not locally; remote environment, not local
103. Auto-detect verifies script/target existence (package.json must have scripts.test, Makefile must have test: target)
104. Persisted test command overrides auto-detection; clear setting to re-run auto-detect; no per-merge override in MVP
105. SC row "Merge" and "Create PR" buttons use same dialogs as chat dropdown; non-thread worktrees pass thread_id=null
106. App uninstall does NOT clean up worktrees; Doctor reports orphaned worktrees on reinstall
107. Completed/failed threads keep worktree binding; dirty worktree gets status pill `dirty · completed`; no auto-cleanup
108. Branch name collision in create dialog shows advisory warning; user can proceed anyway
109. Accordion section order is fixed (not reorderable in MVP); scroll position not persisted
110. Settings grouped in GUI: Creation / Merge & Testing / Behavior sub-groups within "Assistant Worktrees" subsection
111. Stale `.git/pm-merge.lock` recovery: auto-remove if PID dead or lock older than 5 minutes; Doctor also reports stale locks
112. Compare button: branch-to-branch diff (worktree branch HEAD vs base branch HEAD) via `cmd.git.open_diff`; committed diffs only
113. Merge lock disables ALL merge buttons project-wide (not just the merging worktree) — because merge touches main repo
114. Command when-clauses: each `cmd.chat.worktree.*` has visibility + enablement conditions (§58 table)
115. Project switch: worktree binding becomes inactive (not unbound); button disabled; reactivated on switch-back
116. Execution context handoff: Chat resolves worktree binding at turn-start → populates execution_unit_context.worktree_id + working_directory → frozen for turn
117. DAE strategy: working_directory passed to provider CLI via execution context JSON; same mechanism for worktree-bound and unbound runs
118. Safe points include worktree snapshot: worktree_id, worktree_path, branch_name, HEAD_sha
119. Rotation/follow-up inherits worktree binding from parent thread; resolved fresh from thread state on each rotation
120. Detached HEAD: merge/PR blocked with clear error; tooltip shows "detached HEAD at {sha}"; user must checkout branch
121. Git hooks NOT bypassed during test gate; hook failure = merge failure; hooks run in commit phase, after tests
122. Branch deletion while PM running: detected via projection; UI shows detached HEAD; merge/PR disabled; toast on next focus
123. Mode transitions (Ask↔Agent↔Debug↔Plan↔Deep Plan) do NOT affect worktree binding; binding is thread-level, not mode-level
124. Title-less threads keep temp worktree name (`assistant/thread-{short_id}`) indefinitely; user can rename via terminal
125. Auto-create called by Chat runtime synchronously before first turn dispatch; Executor never creates thread worktrees directly (§65)
126. NL merge: agent emits structured `cmd.chat.worktree.merge` system action; PM shows dialog for user confirmation (§66)
127. NL merge mode guard: handler rejects agent-NL invocation in Ask/Plan mode; user UI clicks always allowed (§66)
128. Merge dialog: commit message field hidden for Rebase strategy (replays commits, no new message); visible for Squash/Merge (§67)
129. Force-remove dirty worktree on thread delete: `git worktree remove --force`; user explicitly confirmed destructive action (§68)
130. branch_only + Rebase: tests run BEFORE rebase begins; failure blocks rebase entirely (§69)
131. File manager toggle resets on ANY thread switch; swap state is never preserved across switches (§70)
132. Accordion two-level scroll: sections scroll internally at max-height; container scrolls when total exceeds panel (§71)
133. Revert with deleted worktree path: standard file-not-found error; no special worktree recovery (§72)
134. Settings key naming: `assistant_worktree_*` for assistant-specific; `worktree_*` for generic all-worktree settings (§73)
135. Merge lock always in `.git/pm-merge.lock` (main repo) regardless of strategy; rebase lock covers both worktree + main repo phases
136. Guard-check and lock acquisition are atomic: lock first, then guards, release if guards fail (prevents race)
137. Branch rename triggered by `chat.thread_title_generated` event (§9 step 6)
138. Detached HEAD added to when-clause: merge and PR commands require worktree NOT on detached HEAD (§58)
139. Unbind/Remove have NO detached HEAD restriction — lifecycle ops, not git mutations (§58 note)
140. When-clause conditions are UI pre-checks; guards re-checked atomically after lock acquisition (§58 + §51)
141. Rebase conflicts during `git rebase {target}` → auto-abort, tests never run, lock released (§51 + error table)
142. Merge dialog transforms in-place during test phase: fields read-only, body shows test output, Merge button hidden until outcome (§48)
143. Worktree unbound or thread deleted mid-merge dialog: dialog closes with error, no merge executed (§17)
144. Completed/failed threads retain full merge/PR availability; no need to reopen thread first (§54)
145. NL merge payload schema: strategy, target_branch, commit_message — all optional; missing params use dialog defaults (§66)
146. `temp_branch_name` field in binding record is internal bookkeeping only; UI always shows `branch_name` (§10)

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
| `branching.worktree_pre_merge_test_timeout_s` | 30 | 1800 | Rejected (clamp to 30) | Rejected (clamp to 30) | Numeric stepper |

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
- (All design questions resolved — including nine sweep gap coverage passes)

## Packetization Notes
- Core design fully converged and implementation-ready (nine sweeps complete: 10 + 7 + 7 + 6 + 12 + ~27 + ~15 + ~14 + ~15 additional details addressed).
- Impacted docs expanded from 11 → 19 after reconciliation pass; additional 8 docs have MUST VERIFY status.
- Primary new content: assistant-chat-design.md (worktree button, binding model, dropdown, lifecycle), GitHub_Integration.md (accordion redesign, worktree section layout)
- Secondary updates: FinalGUISpec, WorktreeGitImprovement, storage-plan, LSPSupport, FileManager, Orchestrator_Page, UI_Command_Catalog, Executor_Protocol, Run_Modes
- storage-plan.md changes are schema additions (new keys, 11 new events, extended record) — low conflict risk. Note: seglog events must use underscore convention matching existing `chat.thread_created`. Includes 3 pre-merge test events.
- **Reconciliation additions (MUST CHANGE):** Contracts_V0.md (11 event schemas, extended object_kind), Wiring_Matrix.md (worktree command wiring entries + accordion wiring)
- **Reconciliation additions (MUST RECONCILE):** Glossary.md (5+ new terms), Crosswalk.md (§3.6 assistant worktree ownership), DRY_Rules.md (thread-worktree binding in owner-routed list), Commands_System.md (§4.1 working_directory update), MiscPlan.md (assistant worktree persistence clarification), Section15_MVP_Promoted_Features_Spec.md (register feature)
- **Reconciliation additions (MUST VERIFY):** Permissions_System.md, CLI_Bridged_Providers.md, Prompt_Pipeline.md, GUI_Rebuild_Requirements_Checklist.md, human-in-the-loop.md, orchestrator-subagent-integration.md, FileSafe.md, Personas.md
- GitHub_Integration.md §A.1 and §A.4 are the most structurally impactful changes (tab→accordion, section layout)
- Sweep 1: remote SSH, no-git-repo, lifecycle correction, Ask-mode, export, race, soft limit, bind-existing non-goal
- Sweep 2: projection-based status source, seglog naming fix, auto-retrieval scope, loading states, accessibility, unbind recovery, 240px min width, stale projection
- Sweep 3: header button position fix, delete dialog integration, directory naming, restart revalidation, branch sanitization rules, creation timeout, revert path confirmation, MCP provider context, chat history markers non-goal, theme tokens
- Sweep 4: permission model (not needed), orch→assistant handoff (no transfer), redb-as-projection, settings validation ranges, quick-open scoping, header overflow, auto-title dependency, sync bundle exclusion
- Sweep 5: merge execution location (main repo), auto-fetch before merge, auto-push before PR, rebase non-interactive, commit authorship (user's git identity), NL merge always shows dialog, Ask/Plan mode merge gating (UI yes / agent NL no), no undo for merge, dialog a11y, `/worktree merge` unified command with flags, `chat.thread_worktree_pr_failed` event, merge-specific error table entries
- Pre-merge test gate (§51): auto-detect test command, test merged result by default, override on failure, 4 new settings, 3 new seglog events, clean abort paths for all strategies
- Sweep 6: exclusive merge lock, main repo dirty guard, remote SSH test execution, auto-detect verification, test output limits/encoding, crash recovery, dialog dismissal cleanup, SC row merge for non-thread worktrees (§52), app uninstall (§53), completed thread + dirty worktree (§54), branch collision warning (§55), accordion/filter redb key schemas, Open Thread deleted-thread behavior, settings sub-grouping, 12 new error table entries
- Sweep 7: stale merge lock recovery (§56), compare button diff scope (§57), command when-clauses (§58), project switch behavior (§59), execution context handoff contract (§60), detached HEAD handling (§61), git hooks + test gate (§62), mode transitions (§63), branch deletion while running (§64), 7 new error table entries, impacted docs expanded to 11
- Sweep 8: rebase lock scope clarification (§50/§51), guard-to-lock atomicity, §8/§55 branch collision reconciliation, auto-create caller (§65), NL merge mechanism (§66), merge dialog reactive behavior (§67), force-remove dirty worktree (§68), branch_only+rebase ordering (§69), file manager toggle reset semantics (§70), accordion scroll model (§71), revert with deleted worktree (§72), settings key naming rationale (§73), detached HEAD in when-clauses (§58), branch rename trigger event
- Sweep 9 (FINAL): acceptance criteria #114-#127 for §65-§73 + new edge cases, rebase conflict handling (abort before tests), merge dialog loading state spec (disabled fields + spinner), test phase in-place transform (not new dialog), binding-disappears-mid-dialog errors (§17), when-clause atomicity note (§58), §54 completed thread merge availability, NL merge payload schema types (§66), §67 initial state + edit preservation, §69 cross-ref to §51, `temp_branch_name` purpose (§10), settings namespace note (§2), §48 rebase exception emphasis, 4 new error table entries, 8 new decisions (#139-#146)

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
- Pre-merge test gate ON by default; tests merged result, not branch in isolation; user can change to branch_only in settings
- Test command auto-detected from project files; user override persisted after first confirmation; empty = no-detect shows info, does NOT block merge
- Test failure shows full output + "Merge Anyway" override (logged to seglog with `user_override=true`) + "Cancel" (clean rollback)
- Test timeout = failure; same override UI; default 300s, clamped [30, 1800]
- Clean abort paths: squash `git reset --hard HEAD`, merge `git merge --abort`, rebase `git rebase --abort` — repo never left in half-committed state
- Pre-merge test does NOT apply to PR creation (GitHub CI handles validation for that path)
- 4 new settings for test gate; all project-scoped like other worktree settings
- 3 new seglog events: `chat.thread_worktree_pre_merge_test_started/passed/failed`
- Exclusive merge lock `.git/pm-merge.lock` — one merge at a time per project; blocks concurrent merge attempts
- Main repo dirty check gates squash/merge test gate — uncommitted changes in main repo block merge (commit/stash first)
- Squash/merge test temporarily changes main repo HEAD — editors/terminals observe branch switch; warn user in dialog
- Test output capped at 1MB; ANSI stripped; UTF-8 lossy decode; line endings normalized to LF
- Dialog dismissal kills test + runs cleanup (abort); crash leaves recoverable intermediate git state
- Remote SSH: test commands execute on REMOTE host, not locally; remote environment inherited
- Auto-detect VERIFIES script/target existence: package.json checks scripts.test, Makefile checks for test: target
- Persisted test command overrides auto-detection; clear to re-detect; no per-merge override in MVP
- SC row Merge/PR buttons use SAME dialogs as chat dropdown; non-thread worktrees pass thread_id=null, no post-merge cleanup modal
- App uninstall does NOT clean up worktrees; Doctor reports orphaned worktrees on reinstall
- Completed/failed thread + dirty worktree: status pill `dirty · completed`; toast suggesting merge/cleanup; no auto-cleanup
- Branch name collision in create dialog: advisory warning, user can proceed
- Accordion section order fixed (not reorderable MVP); scroll position not persisted; per-project independent
- Filter key: `config:project:{pid}:source_control.worktree_filter` → string enum; per-project, default "All"
- Open Thread button hidden (not disabled) when owning thread has been deleted
- Settings GUI: 10 settings in 3 visual sub-groups (Creation / Merge & Testing / Behavior) within "Assistant Worktrees"
- Stale `.git/pm-merge.lock` recovery: auto-remove on startup if PID dead or lock >5 min; Doctor also reports stale locks
- ALL Merge buttons project-wide disabled while any merge lock held (merge touches main repo context)
- Compare button = branch-to-branch diff (worktree HEAD vs base HEAD); committed diffs only; routed through `cmd.git.open_diff`
- Each worktree command has explicit when-clause: visibility requires worktree binding state, enablement requires no active run/no lock/etc.
- Project switch does NOT unbind worktree; binding becomes inactive (button disabled); reactivated on switch-back
- Execution context handoff: Chat resolves binding at turn-start → populates `execution_unit_context.worktree_id` + `working_directory` → Executor receives frozen context
- DAE strategy: `working_directory` passed via execution context JSON to provider CLI
- Safe point snapshots include: `worktree_id`, `worktree_path`, `branch_name`, `HEAD_sha`
- Rotation/follow-up inherits worktree binding; resolved fresh from thread state each rotation
- Detached HEAD: merge and PR blocked with clear error; tooltip shows "detached HEAD at {sha}"
- Git hooks NOT bypassed during test gate; hooks run at commit phase; hook failure = merge failure with Retry/Cancel
- Mode transitions (Ask↔Agent↔Debug↔Plan↔Deep Plan) do NOT affect worktree binding — it is thread-level, not mode-level
- Branch deletion while running: projection detects; UI shows detached HEAD; merge/PR disabled; toast on next focus
- Title-less threads keep temp name indefinitely; user can rename via `git branch -m` in terminal
- Impacted docs expanded to 11: added Executor_Protocol.md and Run_Modes.md
- Auto-create is called by Chat runtime synchronously before first turn dispatch; Executor never creates thread worktrees
- NL merge: agent emits structured `cmd.chat.worktree.merge` system action → PM shows confirmation dialog; same pattern as `cmd.chat.revert`
- NL merge mode guard is handler-level: rejects agent-NL invocation in Ask/Plan mode; user UI clicks always bypass guard
- Merge dialog commit message field HIDDEN for Rebase strategy (replays commits); visible for Squash/Merge
- Force-remove dirty worktree on "Delete and remove": `git worktree remove --force`; user explicitly confirmed destructive action
- branch_only + Rebase: tests run BEFORE rebase starts; failure blocks rebase entirely
- File manager swap toggle resets on ANY thread switch — not preserved across switches
- Accordion scroll is two-level: sections scroll at max-height; container scrolls when total exceeds panel height
- Revert with deleted worktree: standard file-not-found error; no special recovery
- Settings key naming intentional: `assistant_worktree_*` for assistant-specific; `worktree_*` for generic
- Merge lock ALWAYS `.git/pm-merge.lock` in main repo, regardless of strategy; rebase lock covers both worktree + main repo phases
- Guard-check + lock acquisition are ATOMIC: lock acquired first, then guards checked, released if guards fail
- Branch rename triggered by `chat.thread_title_generated` event; not an ad-hoc timer
- Detached HEAD in when-clause: merge and PR commands require worktree NOT on detached HEAD (§58 table)
- Unbind/Remove have NO detached HEAD restriction — they are lifecycle ops not git mutations
- When-clause conditions are UI pre-checks; guards re-checked atomically after lock in execution path (two-phase check)
- Rebase conflicts during `git rebase {target}` → auto-abort + lock release; tests never run; dialog shows error
- Merge dialog transforms IN-PLACE during test phase (not a new dialog); fields become read-only; body shows test output
- Merge dialog loading state: strategy/target/message all disabled; Merge button → spinner + "Merging…"; Cancel stays active
- Worktree unbound or thread deleted while merge dialog open → inline error, dialog closes, no merge executed
- Completed/failed threads retain FULL merge/PR availability — user does not need to reopen thread first
- NL merge payload params all optional (strategy, target_branch, commit_message); missing → dialog defaults
- `temp_branch_name` in binding record is internal bookkeeping; UI always displays `branch_name`
- Merge dialog commit message: user edits preserved across Squash↔Merge switches; Rebase hides field; switching back restores user edit
