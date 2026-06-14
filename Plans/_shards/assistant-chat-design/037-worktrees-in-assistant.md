# Shard 037: Worktrees in Assistant

Source: `Plans/assistant-chat-design.md`

Source lines: L2659-L3263

Source SHA256: `1ce90168383ca6b17ce94bf183e4b53ac930c59dfc8c4616252156f784b8ae23`

---

## Worktrees in Assistant

This section specifies the W.1-W.17 thread-level worktree binding feature: a per-thread worktree button in the chat header, worktree icon in the thread selector, merge-back flow, pre-merge test gate, and all associated lifecycle, data model, events, commands, settings, and error handling.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.0 Source Control consumer state

Assistant chat deep-links into Source Control without owning its accordion layout. Per-project Source Control section open/close (`/close`) state persists at `config:project:{pid}:source_control.accordion_state` as:

```json
{ "Changes": true, "Worktrees": false, "Branches/Stash": false, "History": false, "Graph": false }
```

Inline diagnostics may render the same persisted object as `json { "Changes": true, "Worktrees": false, "Branches/Stash": false, "History": false, "Graph": false }`.

The fixed section order is Changes, Worktrees, Branches/Stash, History, Graph; user reordering is outside MVP, scroll position is not persisted, and each project's `accordion_state` is independent.

Source Control owns the Worktrees row layout and filters that Assistant Chat links to. The accordion uses a two-level scroll model: expanded sections may scroll internally under their max-height, and the outer accordion container scrolls when combined section content exceeds the panel. The Worktrees filter is `All | Threads | Orchestrator | Manual`; its per-project state persists at `config:project:{pid}:source_control.worktree_filter` as `worktree_filter`, defaults to `All`, and is not shared across projects.

### W.1 Chat header worktree button

**Placement:** Chat header strip, after the Reasoning/effort control (rightmost existing control). The header strip currently contains: Platform, Model, Reasoning/effort. The Worktree button is appended after these. Mode buttons (Ask, Agent, Debug, Plan, Deep Plan) are separate from the header strip and not adjacent to this button.

**Visual states:**
- **Unbound (default):** Dimmed worktree glyph icon. No label text. Tooltip: "No worktree — click to create"
- **Bound, clean:** Lit/active worktree glyph icon. Tooltip shows branch name. No label text.
- **Bound, dirty:** Lit worktree glyph with a small dot indicator (same pattern as unsaved-file dot in editor tabs). Tooltip: branch name + "uncommitted changes"
- **Bound, conflict:** Lit worktree glyph with warning indicator (triangle). Tooltip: branch name + "merge conflict"

Icon colors resolve through theme tokens (`icon-secondary`, `accent-warning`, `accent-error`), not hardcoded hex values. Icon is ~32px and follows existing header overflow/min-width pattern.

Status bindings expose `dirty_state`/`/dirty_state` and `conflict_state`/`/conflict_state` to the icon renderer for compatibility with older state labels; canonical rendering still reads from `worktree_projection.v1:{project_id}:{worktree_id}`. All worktree controls have accessible labels, and create, unbind, remove, dirty-state, conflict-state, and creation-failed changes are announced through `aria-live="polite"`. Narrow Source Control worktree filters and overflow actions degrade to icon-only controls rather than wrapping text into the compact chat header.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

**Dropdown contents when NO worktree bound:**

| Row | Type | Action |
|-----|------|--------|
| `None` | Selected label | No action (current state) |
| `Create Worktree…` | Action row | Opens Create Worktree dialog |

**Dropdown contents when worktree IS bound:**

| Row | Type | Action |
|-----|------|--------|
| Branch name | Info label (e.g. `assistant/fix-auth-bug`) | No action |
| Path | Info sublabel (truncated, e.g. `.puppet-master/worktrees/thread-a1b2c3d4`) | No action |
| Status | Pill (clean/dirty/conflict) | No action |
| separator | --- | --- |
| `Unbind` | Action row | Detaches worktree from thread; worktree remains on disk |
| `Merge into Base…` | Action row | Opens merge confirmation dialog (squash/merge/rebase) |
| `Create PR…` | Action row | Opens PR creation panel with pre-filled fields |
| `Remove Worktree` | Action row (destructive) | Detaches AND prunes; shows confirmation if dirty |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

**Behavior rules:**
- Changing binding mid-thread is allowed; change applies to the next turn (same semantics as platform/model changes per §1.1)
- While a turn is in-flight, the dropdown is read-only (no binding changes during execution)
- `Unbind` sets thread binding to None; agent's next turn uses main project dir
- `Remove Worktree` calls `WorktreeManager::remove_worktree`, then sets binding to None
- Remove is blocked with error toast if worktree has an active run in any thread or orch tier
- The button is visible in all chat modes (Ask, Agent, Debug, Plan, Deep Plan)
- Hidden when the active project has no git repository

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/WorktreeGitImprovement.md

### W.2 Thread-to-worktree binding data model

Thread-to-worktree binding is durable, explicit, and identity-bearing.

**New redb key family:**
- Key: `thread_state:{thread_id}:worktree_binding`
- Value (JSON):
```json
{
  "worktree_id": "wt-abc123",
  "branch_name": "assistant/fix-auth-bug",
  "worktree_path": ".puppet-master/worktrees/thread-a1b2c3d4",
  "bound_at_utc": "2026-03-26T02:45:00Z",
  "binding_origin": "manual | auto_create",
  "temp_branch_name": "assistant/thread-a1b2c3d4"
}
```
`temp_branch_name` tracks the original temporary branch name assigned before title generation. For UI display, always use `branch_name`; `temp_branch_name` is internal bookkeeping only. Assistant thread worktree filesystem paths are generated as `.puppet-master/worktrees/thread-{short_id}` from the bound thread id and append numeric suffixes such as `thread-{short_id}-2` when that directory already exists; `worktree_id` remains the stable record identity and MUST NOT make `wt-*` the filesystem path model.

**Inverse lookup (for 1:1 enforcement):**
- Key: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Used to quickly check whether a worktree is already bound to another thread.

**Binding rebuild logic:** Projectors replay `chat.thread_worktree_bound` and `chat.thread_worktree_unbound` events in sequence order to reconstruct current binding state. The last event for a given `thread_id` determines whether a binding exists and which `worktree_id` it references.

**Worktree record extension (existing `worktree_record.v1`):**
- Add optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_node_id?`.
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_node_id`, or neither (manual) is set.

**Startup revalidation:** After PM startup rehydrates thread state from redb/seglog, the next focus of a thread with `thread_state:{thread_id}:worktree_binding` lazily verifies that the recorded path exists and appears in `git worktree list`. If the path is missing, PM auto-unbinds by deleting the binding and reverse lookup, emits `chat.thread_worktree_unbound` with `reason=path_missing`, and notifies the user; it does not silently re-create the missing worktree.

**Worktree-aware same-file identity rules:**
- The canonical file identity for thread-bound chat, debug, Source Control, and GitHub pivots is `{ repo_id, worktree_id, relative_path }`; path alone is not sufficient.
- The same relative path in two worktrees is treated as two different open subjects unless a compare session explicitly binds them together.
- Thread-scoped opens default to the thread's bound `worktree_id`. If the thread has no bound worktree, the UI may fall back to the currently selected worktree but must label that fallback explicitly.
- Historical cards, receipts, and debug evidence remain pinned to the captured `worktree_id` even if the thread later rebinds to a different worktree.
- Merge-back, compare, and PR creation flows may intentionally bridge the bound worktree to a base branch, but they must preserve both identities rather than collapsing them into one generic path.
- At turn-start, Chat populates and freezes `execution_unit_context.worktree_id` plus `working_directory` for the whole turn; safe points include worktree snapshot fields `worktree_id`, `worktree_path`, `branch_name`, and `HEAD_sha`.
- Project switch marks the worktree binding inactive rather than unbound; the button stays disabled until switch-back, then reactivates against the same binding.

**1:1 enforcement:** One worktree per thread, one thread per worktree. If a user tries to bind a worktree already bound to another thread, the action is blocked with an explicit error and a deep link to the owning thread when available.

**Mode-worktree invariant:** Worktree binding is thread-level state, orthogonal to Ask, Agent, Debug, Plan, and Deep Plan mode. Mode transitions never rebind, unbind, or change the frozen `working_directory` for an in-flight turn; the next turn observes the same bound worktree unless the user explicitly changes the binding.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md
### W.3 Create worktree dialog

**Trigger:** "Create Worktree…" action from chat header dropdown.

**Dialog fields:**

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Branch name | Text input | `assistant/thread-<short_id>` (temp name) | Must be valid git branch name. If branch already exists: advisory warning (user can Create Anyway or change name). |
| Base ref | Dropdown | Value of `branching.assistant_worktree_base_ref` or `branching.base_branch` if empty | Must be an existing branch/ref |

**Buttons:** `Create` (primary), `Cancel` (secondary)

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md

**Create flow:**
1. User clicks `Create Worktree…` in dropdown
2. Dialog opens with pre-filled temp branch name and base ref
3. User optionally edits branch name and/or base ref
4. User clicks Create
5. Backend calls `WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)` where `worktree_path` is auto-generated under `.puppet-master/worktrees/thread-{short_id}` with a numeric suffix such as `thread-{short_id}-2` if the directory already exists
6. On success: new `worktree_record` written to redb; `thread_state:{thread_id}:worktree_binding` written; `chat.thread_worktree_bound` seglog event emitted; dialog closes; chat header button updates to bound state
7. On failure: dialog stays open with inline error (e.g. "Branch already exists", "Git error: ..."); retry or cancel
8. Thread selector icon appears immediately on binding

Worktree creation and removal entrypoints are always user-initiated (chat header dropdown, slash command, or Source Control action) or system-initiated through the auto-create setting. The AI agent never invokes worktree creation or removal as a direct tool call.

**Branch name collision in create dialog:** Warning in dialog: "Branch '{name}' already exists. Creating a worktree on the same branch as another worktree may cause interference." Buttons: "Create Anyway" (proceeds) / "Use Different Branch" (clears field, focuses input). Advisory only.

**Loading state:** While creation is in progress: chat header button icon shows a subtle pulse/loading indicator; dropdown is disabled; dialog Create button disabled + loading ("Creating…"). On success: dialog closes, button transitions to bound. On failure: dialog returns to interactive with inline error.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Wiring_Matrix.md

### W.4 Auto-create flow (when setting is on)

**Trigger:** New thread creation while `branching.assistant_auto_worktree` is `true`.

**Step by step:**
1. User creates new thread (via `cmd.chat.new` or first message in fresh chat)
2. Chat runtime checks `branching.assistant_auto_worktree` setting
3. If true: Chat runtime calls `WorktreeManager::create_worktree(temp_branch_name, base_ref)` synchronously BEFORE first turn dispatch
4. On success: binding created immediately; thread starts with worktree active
5. On failure: thread created without worktree; warning toast "Could not create worktree: {error}. Thread will use project root."; user can manually create later via dropdown
6. **Title rename flow:** Triggered by the `chat.thread_title_generated` event. System then:
   a. Sanitize title for git branch name (lowercase, replace spaces with hyphens, strip invalid chars, truncate to 50 chars). Examples: `Fix Auth Bug` becomes `fix-auth-bug`, `User's Login (v2)` becomes `users-login-v2`, and a title that strips to empty falls back to a `thread-a1b2c3d4`-style short-id seed.
   b. Compute target: `assistant/<sanitized_title>`
   c. If target branch name exists: auto-append `-2`, `-3`, etc. until unique (silent — no user dialog since this is auto-create)
   d. Call `git branch -m <temp_name> <target_name>` inside the worktree
   e. Update `worktree_record` and `thread_state` binding with new branch name
   f. Emit `chat.thread_worktree_renamed` seglog event
   g. On rename failure: keep temp name, no user interruption, log warning

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

**Ownership:** Chat runtime owns the auto-create call. Executor never invokes WorktreeManager directly for thread worktree creation.

**Concurrent auto-create:** `WorktreeManager::create_worktree` is serialized per project (mutex/lock) to prevent racing. The reverse lookup key write is atomic (redb transaction). If a create fails due to race, auto-create retry logic attempts with the next suffix. Auto-create does NOT retry on non-race failures.

Title-less threads keep the temporary branch name `assistant/thread-{short_id}` and worktree path suffix `/thread-{short_id}` indefinitely until the user renames through Git or the title rename flow succeeds.

### W.5 Settings — Branching tab

**New settings (project-level, persisted in redb):**

| Setting key (redb) | Type | Default | UI label | Description |
|-----|------|---------|----------|-------------|
| `config:project:{pid}:branching.assistant_auto_worktree` | bool | `false` | "Auto-create worktree for new assistant threads" | When true, new threads auto-create a worktree |
| `config:project:{pid}:branching.assistant_worktree_cleanup_default` | enum(`ask`, `keep`, `remove`) | `ask` | "When deleting a thread with a worktree" | Default cleanup behavior; `ask` shows modal |
| `config:project:{pid}:branching.assistant_worktree_base_ref` | string | `""` (empty = use `base_branch`) | "Base branch for assistant worktrees" | Override base ref; empty inherits from branching.base_branch |
| `config:project:{pid}:file_manager.worktree_follow_thread` | bool | `true` | "File manager follows active thread's worktree" | When true, file manager switches on thread focus |
| `config:project:{pid}:branching.worktree_warning_threshold` | integer | `10` | "Worktree count warning threshold" | Show advisory toast when total worktrees exceed this count; 0 = disabled |
| `config:project:{pid}:branching.worktree_create_timeout_s` | integer | `30` | "Worktree creation timeout (seconds)" | Abort `git worktree add` if it exceeds this duration |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test` | bool | `true` | "Run tests before merging worktree" | When true, runs test command and blocks merge on failure |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_cmd` | string | `""` (empty = auto-detect) | "Pre-merge test command" | Override auto-detected test command |
| `config:project:{pid}:branching.worktree_pre_merge_test_timeout_s` | integer | `300` | "Pre-merge test timeout (seconds)" | Abort test run if it exceeds this duration |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test_target` | enum(`merged_result`, `branch_only`) | `merged_result` | "What to test before merge" | `merged_result` tests integrated state; `branch_only` tests branch in isolation |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

**UI placement:** Settings > Branching tab, new subsection "Assistant Worktrees" below existing branching controls. Settings grouped into visual sub-groups:
- **Creation:** auto_worktree, base_ref, create_timeout_s
- **Merge & Testing:** pre_merge_test, pre_merge_cmd, pre_merge_test_timeout_s, pre_merge_test_target
- **Behavior:** cleanup_default, file_manager.worktree_follow_thread, warning_threshold

**Namespace note:** `file_manager.worktree_follow_thread` uses the `file_manager.*` namespace (not `branching.*`) because it controls file manager behavior. `assistant_worktree_*` prefix = assistant-specific; `worktree_*` prefix = generic all-worktree settings.

**Settings validation:**

| Setting key | Min | Max | Zero behavior | Widget |
|-------------|-----|-----|---------------|--------|
| `worktree_warning_threshold` | 0 | 100 | Disabled (no warning) | Numeric stepper |
| `worktree_create_timeout_s` | 5 | 300 | Clamp to 5 | Numeric stepper |
| `worktree_pre_merge_test_timeout_s` | 30 | 1800 | Clamp to 30 | Numeric stepper |

Out-of-range values from settings file edits are clamped to nearest valid bound on load with a log warning.

### W.6 Thread selector — worktree icon

**Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention).

- **Icon:** Theme-consistent branch/tree glyph from icon set (not emoji)
- **Compact row slot:** In compact/default thread rows, the worktree glyph occupies the `wt_icon` slot before the branch label (for example, `assistant/fix-auth`) and the chevron; the second line carries status plus owner copy such as `dirty · Thread: Auth fix`.
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip:** Line 1: Branch name. Line 2: Status pill text (clean/dirty/conflict). Line 3: Worktree path.
- **Icon color/state:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`.
- When an owner label is shown, its exact copy is `Thread: <thread_title>`, `Orch: <tier_label>`, or `Manual`; tooltips preserve the full `thread_title` or `tier_label`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Status source:** Chat header icon and thread selector icon read from `worktree_projection.v1:{project_id}:{worktree_id}` which includes `dirty_state` and `conflict_state` fields. UI subscribes to projection changes via standard reactive binding. If `projection_freshness = stale`: icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)".

### W.7 Cleanup flow (thread delete)

**Cleanup-on-delete canon:** Cleanup choices are part of the existing thread-delete confirmation path, not an automatic completed-thread cleanup path. Delete first checks `thread_state:{thread_id}:worktree_binding`; when no binding exists, the standard delete confirmation applies, and when a binding exists, keep/remove behavior follows `branching.assistant_worktree_cleanup_default`. Keep unbinds the thread and leaves the worktree on disk, while remove unbinds and prunes the worktree through `WorktreeManager` after dirty/active-run safeguards.

Thread worktree cleanup is scoped to thread delete, not archive/unarchive lifecycle changes. The extended delete confirmation presents `Keep worktree on disk` and `Remove worktree` choices; dirty worktrees include a dirty-check confirmation sublabel, the default choice is configured in Settings > Branching by `branching.assistant_worktree_cleanup_default`, and after cleanup action completes the system emits `chat.thread_worktree_unbound` with the appropriate `reason`.

When the extended delete confirmation uses explicit button copy, `Delete and keep worktree` deletes the thread, unbinds it, and leaves the worktree on disk as orphaned/manual Source Control inventory. `Delete and remove worktree` deletes the thread, unbinds it, and prunes the worktree; if the worktree is dirty and the user chooses that destructive option, PM uses `git worktree remove --force <path>` plus `git branch -D <branch>` after the warning label has been shown.

Unbind has no dedicated undo in MVP: the worktree remains on disk as a manual worktree, and any future undo toast is post-MVP rather than part of the initial cleanup flow.


**Trigger:** Thread is deleted while it has a worktree binding.

**Integration:** Cleanup options are embedded into the existing delete confirmation dialog — not shown as a separate modal.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

**Flow:**
1. User initiates thread delete
2. System checks `thread_state:{thread_id}:worktree_binding`
3. If no binding: standard delete confirmation, proceed normally
4. If binding exists, check `branching.assistant_worktree_cleanup_default` setting:
   - `ask` (default): show extended delete confirmation
   - `keep`: standard confirmation; on confirm, silently unbind, keep worktree on disk
   - `remove`: standard confirmation; on confirm, silently remove worktree if clean; if dirty, fall through to `ask` behavior
5. **Extended delete confirmation (when `ask`):**
   - Title: "Delete thread?"
   - Body: "This thread is bound to worktree `assistant/fix-auth-bug`."
   - If dirty: additional warning line: "This worktree has uncommitted changes."
   - Button 1: "Delete and keep worktree" (secondary style)
   - Button 2: "Delete and remove worktree" (destructive style; if dirty, label becomes "Delete and remove worktree (has changes)")
   - Button 3: "Cancel" (tertiary style, default focus)
6. Force-remove dirty worktree uses `git worktree remove --force <path>` + `git branch -D <branch>`
7. After cleanup: `chat.thread_worktree_unbound` seglog event emitted with appropriate `reason`

### W.8 Merge-back flow

When a thread reaches `completed` or `failed` status while it still has a bound worktree, Assistant Chat performs no automatic unbind or cleanup. The worktree remains available for Merge and PR creation; dirty completed or failed worktrees surface in Source Control with combined status such as `dirty · completed` or `dirty · failed`, while the thread selector keeps the standard worktree icon. Users release the worktree only through explicit thread delete cleanup or unbind, and completion may toast: "Thread completed. Worktree has uncommitted changes — merge or clean up when ready."

There is no auto-cleanup for `completed` or `failed` threads.

**Four access paths (all equivalent in outcome):**

| Path | Entry point | Notes |
|------|-------------|-------|
| Chat header dropdown | "Merge into Base…" / "Create PR…" actions | Primary UI path |
| Source Control worktree section | "Merge" / "Create PR" buttons in expanded worktree row | Secondary UI path |
| Slash commands | `/worktree merge [--squash\|--rebase]`, `/worktree pr` | Keyboard-driven; default squash |
| Natural language in chat | User says "merge my changes into main" | Agent triggers dialog pre-filled with inferred strategy |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

Compare buttons open committed branch-to-branch review only: worktree branch HEAD against base branch HEAD through `cmd.git.open_diff`. Source Control merge buttons route through the same `cmd.chat.worktree.merge` command with `thread_id=null` for non-thread worktrees; the command handler detects null `thread_id` and omits thread-specific behaviors such as unbind, thread status update, or chat notification.

#### W.8.1 Merge confirmation dialog

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Strategy | Segmented control: `Squash` / `Merge` / `Rebase` | `Squash` | Squash = single clean commit; Merge = merge commit preserving history; Rebase = replay on top of base |
| Target branch | Dropdown | From `branching.assistant_worktree_base_ref` or `branching.base_branch` | Must be existing local branch |
| Commit message | Text area (multi-line) | Auto-generated per strategy | Editable; only shown for Squash and Merge (hidden for Rebase) |

**Buttons:** `Merge` (primary, label changes per strategy), `Cancel`

**Dialog reactive behavior:** Squash selected → commit message visible (concatenated commits). Merge selected → commit message visible ("Merge assistant/{title} into {target}"). Rebase selected → commit message hidden. User edits preserved across strategy switches.

After the user confirms strategy, target branch, and commit message, the dialog enters a strategy-specific loading state ("Merging...", "Squashing...", or "Rebasing..."): the strategy segmented control and target branch dropdown are disabled, the commit message textarea is read-only/greyed when shown, the Merge button shows a loading spinner with a strategy-specific label, and Cancel remains enabled for user abort.

#### W.8.2 Pre-merge guards

| Condition | Behavior |
|-----------|----------|
| Worktree has uncommitted changes | Block merge. Warning: "Worktree has uncommitted changes. Commit or stash before merging." Button disabled. |
| Worktree has merge conflicts | Block merge. Warning: "Resolve existing conflicts before merging." Button disabled. |
| Active run in worktree | Block merge. "Cannot merge while a run is active." |
| Target branch deleted | Error if deleted between dialog open and confirm |
| Worktree on detached HEAD | Block merge/PR, including when a user ran `git checkout <sha>` in the worktree terminal. "Cannot merge: worktree is on a detached HEAD. Checkout a branch first." |
| Main repo dirty (squash/merge + merged_result) | Block. "Cannot run pre-merge test: main repo has uncommitted changes." |

Detached HEAD recovery is explicit: the user can run `git checkout -b <branch>` in a terminal, or unbind and re-creates a named-branch worktree through the normal create flow.

#### W.8.3 Merge execution

**Critical:** Merge executes in the main repo working tree, NOT inside the worktree. This is consistent with WorktreeGitImprovement.md `merge_worktree()` operating from the main repo context: the worktree branch is merged INTO the target branch in the main repo. Exception: Rebase is a two-phase operation: step 1 (`git rebase` / `git rebase {target}`) runs in the worktree, and step 3 (`git merge --ff-only`) runs in the main repo.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

**Exclusive merge lock:** `.git/pm-merge.lock` (main repo). Acquired BEFORE guard checks for atomicity. Guards fail → lock released immediately. Lock held → ALL merge buttons project-wide disabled.

Worktree command when-clause conditions are UI pre-checks only; Merge uses a two-phase check in which `.git/pm-merge.lock` is acquired first, then dirty/conflict/active-run/detached-HEAD guards are re-checked atomically before mutation.

The lock lives under the main repo `.git/` directory; acquiring `.git/pm-merge.lock` is the FIRST merge-execution step and makes the guard-check plus execution atomic.

This guard-to-lock atomicity includes the detached HEAD guard: after the lock is held, PM re-reads the worktree HEAD state before merge, rebase, PR, or pre-merge test mutation proceeds.

The UI pre-check `/disabling` state is advisory only: all pre-checks are re-checked atomically AFTER lock acquisition. For Rebase, the lock covers the ENTIRE sequence from worktree rebase through tests to main repo ff-merge.

**Lock file format:** `{ "pid": <int>, "started_utc": "<ISO8601>", "worktree_id": "<string>", "strategy": "<string>" }`

**Stale lock recovery:** On startup (lazy), if PID dead or lock older than 5 minutes → auto-remove. The stale lock is auto-removed before new merge execution proceeds. Toast: "Stale merge lock cleaned up."

**Execution steps (when pre-merge test disabled):**
- **Squash:** `git checkout {target}` → `git merge --squash {branch}` → `git commit -m "{message}"`
- **Merge:** `git checkout {target}` → `git merge --no-ff {branch} -m "{message}"`
- **Rebase:** (in worktree) `git rebase {target}` → (in main repo) `git checkout {target}` → `git merge --ff-only {branch}`

Canonical command templates may use `{worktree_branch}` for the same source branch: `git merge --squash {worktree_branch}`, `git merge --no-ff {worktree_branch} -m "{message}"`, and `git merge --ff-only {worktree_branch}`.

**Auto-fetch:** Before any merge strategy, the backend runs `git fetch origin {target_branch}` in the main repo so the local target is up-to-date. If fetch fails because there is no remote or the user is offline, merge proceeds with local state and shows an advisory toast.

**Rebase is non-interactive only.** The dialog runs plain `git rebase` / `git rebase {target}`; interactive `git rebase -i`, `-i`, pick/squash/fixup, and `/squash/fixup` workflows are terminal-only.

**Commit authorship:** User's git identity (`user.name`/`user.email`). No AI co-author injection.

**Git hooks:** NOT bypassed. Hook failure = merge failure with Retry/Cancel. Standard commit hooks run at their normal Git trigger points during the merge/commit step after any pre-merge test passes; `pre-merge-commit` runs during `git merge --no-ff` commit and gets the same treatment as pre-commit failure. For `prepare-commit-msg`, PM's provided commit message is the initial value; hooks may append/modify it before the commit is finalized. If hooks modify files, for example auto-formatting in a pre-commit hook, the test gate tests the PRE-hook state; hooks run after test pass as part of the commit pipeline, not the test pipeline.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

#### W.8.4 Post-merge behavior

Modal: "Branch `assistant/{title}` has been merged into `{target}`."
- "Keep worktree" — worktree remains bound
- "Remove worktree" — unbind + prune
- "Cancel" — dismiss, worktree stays

Default follows `branching.assistant_worktree_cleanup_default` setting.

**No undo for completed merge.** User can `git reset`/`git revert` via terminal or agent bash.

#### W.8.5 Conflict resolution

- **UI-initiated:** Conflict markers in files route to `Source Control > Changes` and open the Conflict assistant through `cmd.source_control.open_conflict`; applying a concrete choice may fall through to existing `cmd.git.conflict_apply_resolution`, while lower-level `cmd.git.*` operations may support diff or hunk mechanics but are not the GUI entrypoint
- **Natural-language-initiated (NL-initiated):** Agent resolves conversationally by reading markers, explaining choices, and proposing edits via file editing tools; semantic resolution requires explicit user approval and then follows the Source Control Conflict assistant flow
- **Rebase conflicts during `git rebase {target}`:** Auto-abort (`git rebase --abort`). Dialog shows error. Tests never run. Lock released.

Assistant-bound worktree conflicts consume the Source Control owner flow instead of defining a second chat-local conflict UI. When a merge, `/rebase/worktree`, or worktree operation blocks on conflicts, chat surfaces the affected file list and routes `Open Conflict Assistant` to `Source Control > Changes` through `cmd.source_control.open_conflict`; pre-merge review pivots may open `cmd.source_control.open_review` with the current worktree and target branch as the compare pair. Natural-language assistance may explain conflict choices and propose edits, but semantic resolution still requires explicit user approval and follows the Source Control `/disabled`, `/settings`, and per-project preference rules.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

#### W.8.6 Create PR flow

Opens existing PR creation panel from GitHub_Integration.md §B with pre-filled fields: title (thread title), body (commit messages), target branch, source branch.

**Auto-push:** `git push -u origin {branch}` before PR panel opens. Push failure → error toast, PR panel does NOT open, and Chat emits `chat.thread_worktree_pr_failed` with `phase=push`.

**Guard:** Requires configured GitHub remote.

If the PR API call fails after push, the PR panel does not open; Chat shows "PR creation failed: {error}" and emits `chat.thread_worktree_pr_failed` with `phase=api`.

**Post-PR:** Worktree stays bound (PR open, may push more commits). No cleanup modal.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### W.8.7 Natural language merge

The agent emits a structured system action `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash|merge|rebase", "target_branch": "string", "commit_message": "string" } }`. This follows the same structured-command pattern as `cmd.chat.revert`; the agent does not run merge directly via bash. PM shows dialog pre-filled with agent's parameters. The merge is user-confirmed regardless of entry path: even yolo or auto-approve posture still shows the dialog before mutation.

For example, "merge my changes into main" may emit `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash", "target_branch": "main" } }` after resolving intent and parameters.

Before emitting the action, the agent may run `git status` through its normal tools; the tool context auto-scopes that check to the bound worktree through `working_directory` / `/cwd`.

**Mode guard:** Agent-NL invocation is rejected when the current mode is `ask` or `plan` with the exact error "Merge is not available via assistant in {mode} mode. Use the Merge button in the chat header dropdown." User UI clicks always allowed.

**Chaining:** Agent can chain commit → merge → cleanup in single conversational exchange.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Modes.md

### W.9 Pre-merge test gate

**Purpose:** Before committing a merge, run the project's test suite against the merged result to verify integration.

**Settings:** `branching.assistant_worktree_pre_merge_test` (bool, default true), `branching.assistant_worktree_pre_merge_cmd` (string, default empty = auto-detect), `branching.worktree_pre_merge_test_timeout_s` (int, default 300, clamped [30, 1800]), `branching.assistant_worktree_pre_merge_test_target` (enum `merged_result` (default, recommended) | `branch_only`).

When `branching.assistant_worktree_pre_merge_cmd` is set, PM runs that exact command. When it is empty, PM auto-detects the command from project files using the rules below.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### W.9.1 Auto-detection of test command

When `branching.assistant_worktree_pre_merge_cmd` is empty, detection requires verification that the relevant script/target actually exists, not just that a configuration file is present; rows marked file-presence-sufficient below are explicit convention-backed exceptions.

| File detected | Verification | Inferred command | Priority |
|---------------|-------------|-----------------|----------|
| `package.json` | `scripts.test` field exists and non-empty | `npm test` | 1 |
| `Cargo.toml` | File presence | `cargo test` | 2 |
| `pyproject.toml` | `[tool.pytest]` or `pytest` in deps | `pytest` | 3 |
| `setup.py` or `setup.cfg` | File presence | `python -m pytest` | 4 |
| `Makefile` | Contains `test:` target | `make test` | 5 |
| `build.gradle` or `build.gradle.kts` | File presence | `./gradlew test` | 6 |
| `pom.xml` | File presence | `mvn test` | 7 |
| `Gemfile` | File presence | `bundle exec rake test` | 8 |
| `go.mod` | File presence | `go test ./...` | 9 |

Multiple matches → highest priority. Persisted command overrides auto-detection. Clear setting to re-run auto-detect.

**First run:** Auto-detected command shown pre-filled; "Change" link for inline edit; confirmed command persisted.

**No detection + enabled:** Info row "No test command detected" with Settings link. Test step skipped (merge NOT blocked).

#### W.9.2 Execution flow with test gate

**For `merged_result` target (default):**

| Strategy | Steps |
|----------|-------|
| **Squash** | Fetch → checkout target → `git merge --squash {branch}` → **run tests** (staged, uncommitted) → pass: `git commit` / fail: `git reset --hard HEAD` |
| **Merge** | Fetch → checkout target → `git merge --no-ff --no-commit {branch}` → **run tests** → pass: `git commit` / fail: `git merge --abort` |
| **Rebase** | (worktree) `git rebase {target}` → **run tests** against the post-rebase worktree state → pass: (main) `git checkout {target}` → `git merge --ff-only {branch}` / fail: `git rebase --abort` |

The no-commit invariant for Squash/Merge is that tests run before any merge result is committed: Merge uses explicit `--no-commit`, while Squash uses `git merge --squash` to leave the merged result staged and uncommitted.

**For `branch_only` target:** Tests run in worktree against branch as-is BEFORE any merge/rebase operation. Failure blocks merge (with override). Rebase + branch_only: tests run BEFORE rebase begins. This preserves branch_only semantics: test the branch in isolation before any `/rebase` or merge/rebase mutation starts.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

#### W.9.3 Test dialog UX

Dialog transitions in-place to test phase. Fields become read-only. Live output in scrollable monospace region (~200px max-height). Cancel aborts test + cleanup. Auto-detect VERIFIES script/target existence before first-run prefill; package.json checks `scripts.test`, and Makefile checks for a `test:` target.

- **Pass (exit 0):** Auto-proceed to commit. Brief "Tests passed" indicator.
- **Fail (exit ≠ 0):** Red header "Tests failed" + full output + "Merge Anyway" (secondary/destructive) + "Cancel" (primary). Override proceeds to commit; seglog records override.
- **Timeout:** Same UI as failure.
- **Process error:** Same UI with error message.

Clean abort paths keep the repo out of a half-committed state: Squash cleanup uses `git reset --hard HEAD`, Merge cleanup uses `git merge --abort`, and Rebase cleanup uses `git rebase --abort`.

**Test execution environment:** Working directory depends on strategy and target. Shell: `/bin/sh -c "{command}"` (Unix), `cmd /c "{command}"` (Windows). No PM environment injection. Stdout + stderr merged. Remote SSH: executes on remote host.

**Output handling:** 1MB cap; ANSI stripped; UTF-8 lossy decode; CRLF normalized to LF.

**Crash recovery:** Orphaned test process. Main repo in transitional state. WorktreeManager reconciliation detects `.git/MERGE_HEAD` or `.git/rebase-merge/` on next launch.

**Test gate does NOT apply to PR creation** (delegates to GitHub CI).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.10 Seglog events (11 total)

| Event type | Fields | Description |
|------------|--------|-------------|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` (`manual` \| `auto_create`) | Thread bound to worktree |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` (`user_unbind`, `user_remove`, `thread_delete`, `path_missing`) | Thread unbound from worktree |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` | Branch renamed after title generation |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` | Worktree creation failed |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `result_commit_sha` | Worktree branch merged |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` | Merge attempt failed |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` | PR created |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` (`push` \| `api`) | PR creation failed |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target`, `strategy` | Pre-merge test started |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | Tests passed |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` | Tests failed |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### W.11 Command catalog

| Command ID | Slash command | Parameters | Surface |
|------------|---------------|------------|---------|
| `cmd.chat.worktree.create` | `/worktree create` | `{ thread_id, branch_name?, base_ref? }` | Chat dropdown, command palette |
| `cmd.chat.worktree.unbind` | `/worktree unbind` | `{ thread_id }` | Chat dropdown, command palette |
| `cmd.chat.worktree.remove` | `/worktree remove` | `{ thread_id }` | Chat dropdown, command palette |
| `cmd.chat.worktree.merge` | `/worktree merge [--squash\|--rebase]` | `{ thread_id, strategy?, target_branch?, message? }` | Chat dropdown, SC, command palette |
| `cmd.chat.worktree.pr` | `/worktree pr` | `{ thread_id, title?, body?, target_branch? }` | Chat dropdown, SC, command palette |
| `cmd.chat.worktree.info` | `/worktree` | `{ thread_id }` | Chat, command palette |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

**Command visibility/enablement conditions:**

| Command | Visible when | Enabled when |
|---------|-------------|-------------|
| `cmd.chat.worktree.create` | No binding AND project has git | Always (when visible) |
| `cmd.chat.worktree.unbind` | Has binding | No active run |
| `cmd.chat.worktree.remove` | Has binding | No active run |
| `cmd.chat.worktree.merge` | Has binding (or SC row) | No active run AND no merge lock AND not dirty AND no conflicts AND not detached HEAD |
| `cmd.chat.worktree.pr` | Has binding AND has GitHub remote | No active run AND not detached HEAD |
| `cmd.chat.worktree.info` | Has binding | Always (read-only) |

`/worktree merge` is one command with `--squash` and `--rebase` flags; separate slash commands are not introduced.

### W.12 File manager worktree context

When user switches to a thread with a worktree binding (and `file_manager.worktree_follow_thread` is `true`), the file manager switches root to show the worktree's file tree.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

**Breadcrumb indicator:** Worktree glyph + branch name + swap toggle icon at top of file manager tree. Clicking swap toggles between worktree root and main project root. Binary toggle. Toggle resets on ANY thread switch.

**Accessible label:** "Viewing worktree assistant/fix-auth. Click to switch to project root." (and inverse)

**Rules:**
- Open editor tabs NOT affected by root switch — tabs retain own paths
- File manager search scope follows current file manager root
- `@file` resolves relative to thread's `working_directory` (worktree root when bound)
- MCP tools and `/providers` receive the thread worktree path as `working_directory` when a worktree binding is active.
- Quick-open (Ctrl+P) remains project-scoped regardless of worktree context
- If thread unbound mid-session: file manager falls back to project root with toast "Worktree unbound — showing project root."

File-edit card path semantics follow the same execution context: chat file-edit cards display paths relative to the active `working_directory`, so a bound thread naturally shows worktree-relative paths without rewriting captured absolute mutation-log paths.

### W.13 LSP worktree awareness

LSP sessions are already keyed by `(host_id, server_id, root_identity)`. Different worktree path = different root_identity = naturally separate LSP session. No new keying model needed.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md

**Thread focus change flow:** File manager root changes → LSP client sends `workspace/didChangeWorkspaceFolders` or new session initialized (lazy). Diagnostics/hover/completion operate against worktree file state.

**LSP session lifecycle:** Created on first file open from worktree. Idle-collected after 5 minutes with no open files (configurable). Destroyed when worktree removed.

### W.14 Remote SSH projects

Worktree creation follows project host authority. For remote SSH projects, `WorktreeManager` executes on remote host via SSH subprocess. No silent local fallback. All paths (worktree, FileSafe working_directory, terminal cwd) use remote filesystem.

Remote-mode projects are remote-host-scoped. PM MUST NOT create a silent local checkout `/mirror` as primary authority, and remote editing is not a download-edit-upload flow unless an explicit degraded `/offline` cache path is surfaced. File Manager and `/editor/FileSafe` read and write the remote filesystem, listing uses SFTP by default with SSH `find`/`ls` fallback, terminal sessions bind to remote PTY `/session-supervision`, and provider CLIs execute on the remote host while stdout/stderr stream back over SSH. Exact terminal host/process details belong to `seam-terminal-runtime-environment`, but chat, worktree, and dev-status surfaces must disclose the effective remote host instead of silently launching local equivalents.
Missing remote provider CLIs surface as degraded or unavailable provider capability: PM may probe or run configured provider CLIs on the remote host, but it MUST NOT auto-install a missing provider CLI without explicit user consent and provisioning confirmation, and it MUST NOT retarget provider execution to a local CLI as a silent fallback.

`GitHub_Integration.md §C` remains the owner of remote host identity, SSH reconnect policy, and remote-means-remote execution semantics. Assistant chat consumes that host-scoped context alongside File Manager, editor, terminal, and LSP: chat actions that target remote files use the shared remote-state vocabulary for `offline`, `stale`, `retrying`, `/pending-write`, and `read-only` situations and must never silently substitute local host behavior for a remote-mode project.

The `/file-manager/remote/review/runtime` seam stays implementation-ready through owner-doc handoffs: FileManager owns file-tree identity and remote file operations, Source Control/review owns compare and hunk review, Terminal/runtime owns PTY and process execution, and assistant chat owns only preview, reveal, and confirmation surfaces.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Executor_Protocol.md

### W.15 Error handling

| Error scenario | User-visible behavior |
|---------------|----------------------|
| `create_worktree` fails | Dialog stays open with inline error; retry or cancel |
| Auto-create fails | Thread created without worktree; warning toast |
| Branch rename fails after title gen | Keep temp name; no user interruption; log warning |
| Worktree path no longer exists | On next focus: detect, toast, auto-unbind with reason `path_missing`; PM does not re-create the missing worktree |
| Remove blocked by active run | Error toast; Remove button disabled |
| Branch name collision | Auto-append `-2`, `-3`… up to 10 attempts; dialog error if all collide |
| 1:1 violation attempt | Error toast "Already bound to thread '{title}'" |
| Merge fails mid-operation | Dialog shows inline error, main repo state is unchanged when git merge auto-aborts, and the dialog stays open for Retry or Cancel; after fixing the cause, the user re-triggers merge |
| Merge conflict | Dialog closes; conflict markers in files; SC highlights; existing resolution flow |
| Concurrent merge (lock contention) | Error toast "Another merge in progress"; all Merge buttons disabled |
| Test not found | Dialog shows error; Retry / Merge Anyway / Cancel |
| Test timed out | Dialog shows timeout + Merge Anyway / Cancel |
| Test output > 1MB | "[OUTPUT TRUNCATED]"; does not affect pass/fail |
| Detached HEAD: merge/PR | Dialog error; buttons disabled |
| Git hook rejects commit | "Merge failed: {hook} rejected commit"; Retry / Cancel |
| Stale merge lock at startup | Auto-remove if PID dead or >5 min; advisory toast |
| Project switch with bound worktree | Button disabled; tooltip "Worktree belongs to project '{name}'"; no auto-unbind |
| Worktree unbound mid-merge dialog | `binding-disappears-mid-dialog` FINAL behavior: dialog shows error and closes; no merge executes after the when-clause and binding re-check fail |
| Revert with deleted worktree path | File-not-found error |

### W.16 Acceptance criteria

**Chat header worktree button:** (AC-1) Button visible in all modes; (AC-2) Dropdown correct per binding state; (AC-3) Create dialog works; (AC-4) Unbind detaches without deleting; (AC-5) Remove detaches and prunes; (AC-6) Icon state updates reactively; (AC-7) Binding change applies next turn; (AC-8) Read-only during in-flight turn.

**Settings:** (AC-9) Auto-create toggle works; (AC-10) Cleanup default controls modal; (AC-11) FM follow setting works; (AC-12) Settings persist across restart.

**Thread selector icon:** (AC-13) Appears on bind; (AC-14) Disappears on unbind; (AC-15) Color reflects status; (AC-16) Tooltip shows info.

**File manager:** (AC-25) Switches root on focus change; (AC-26) Breadcrumb toggle works; (AC-27) Toggle resets on switch; (AC-28) Editor tabs unaffected.

**LSP:** (AC-29) Diagnostics reflect worktree state; (AC-30) Lazy-init per worktree; (AC-31) Idle-collected.

**Lifecycle:** (AC-32) Auto-create temp name + rename; (AC-33) Collision suffix; (AC-34) Cleanup modal on delete; (AC-35) 1:1 enforced.

**Merge-back:** (AC-66) Merge dialog with strategy; (AC-67) PR panel with pre-fill; (AC-68) SC row buttons; (AC-69) Slash commands work; (AC-70) NL merge shows dialog; (AC-71) Dirty blocks merge; (AC-72) Conflict resolution; (AC-73) Post-merge cleanup; (AC-77) All modes including Debug; (AC-83) NL merge requires confirmation even in yolo; (AC-84) Ask/Plan NL guard.

**Pre-merge test gate:** (AC-86) Tests merged result; (AC-87) Auto-detect; (AC-88) First-run pre-fill; (AC-89) Failure override UI; (AC-92) Clean rollback; (AC-94) Not for PR; (AC-95) Exclusive lock; (AC-99) Remote SSH executes remotely.

### W.17 Non-goals (explicit)

- No emojis in the GUI
- No changes to orchestrator's own worktree management (lanes, tiers)
- Git submodules out of scope
- No "Bind Existing" in MVP; binding an arbitrary pre-existing manual or orch-owned worktree would break the 1:1 ownership model because orch-owned worktrees carry `owner_node_id` lineage and manual worktrees have no Assistant thread owner
- No undo for unbind or merge in MVP
- No per-merge command override in MVP
- App uninstall does NOT auto-clean worktrees
- No inline chat history markers for worktree context changes
- Terminal context (cwd) for worktree-bound threads follows worktree path; no special terminal management
- Changes section always shows main repo (worktree-scoping Changes is not MVP)
- No thread export of worktree binding metadata
- No orchestrator-to-assistant worktree transfer on handoff
