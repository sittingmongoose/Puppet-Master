## Worktrees in Assistant

This section specifies the thread-level worktree binding feature: a per-thread worktree button in the chat header, worktree icon in the thread selector, merge-back flow, pre-merge test gate, and all associated lifecycle, data model, events, commands, settings, and error handling.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.1 Chat header worktree button

**Placement:** Chat header strip, after the Reasoning/effort control (rightmost existing control). The header strip currently contains: Platform, Model, Reasoning/effort. The Worktree button is appended after these. Mode buttons (Ask, Agent, Debug, Plan, Deep Plan) are separate from the header strip and not adjacent to this button.

**Visual states:**
- **Unbound (default):** Dimmed worktree glyph icon. No label text. Tooltip: "No worktree — click to create"
- **Bound, clean:** Lit/active worktree glyph icon. Tooltip shows branch name. No label text.
- **Bound, dirty:** Lit worktree glyph with a small dot indicator (same pattern as unsaved-file dot in editor tabs). Tooltip: branch name + "uncommitted changes"
- **Bound, conflict:** Lit worktree glyph with warning indicator (triangle). Tooltip: branch name + "merge conflict"

Icon colors resolve through theme tokens (`icon-secondary`, `accent-warning`, `accent-error`), not hardcoded hex values. Icon is ~32px and follows existing header overflow/min-width pattern.

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
| Path | Info sublabel (truncated, e.g. `.puppet-master/worktrees/wt-3`) | No action |
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
  "worktree_path": ".puppet-master/worktrees/wt-abc123",
  "bound_at_utc": "2026-03-26T02:45:00Z",
  "binding_origin": "manual | auto_create",
  "temp_branch_name": "assistant/thread-a1b2c3d4"
}
```
`temp_branch_name` tracks the original temporary branch name assigned before title generation. For UI display, always use `branch_name`; `temp_branch_name` is internal bookkeeping only.

**Inverse lookup (for 1:1 enforcement):**
- Key: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Used to quickly check whether a worktree is already bound to another thread.

**Worktree record extension (existing `worktree_record.v1`):**
- Add optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_node_id?`.
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_node_id`, or neither (manual) is set.

**Worktree-aware same-file identity rules:**
- The canonical file identity for thread-bound chat, debug, Source Control, and GitHub pivots is `{ repo_id, worktree_id, relative_path }`; path alone is not sufficient.
- The same relative path in two worktrees is treated as two different open subjects unless a compare session explicitly binds them together.
- Thread-scoped opens default to the thread's bound `worktree_id`. If the thread has no bound worktree, the UI may fall back to the currently selected worktree but must label that fallback explicitly.
- Historical cards, receipts, and debug evidence remain pinned to the captured `worktree_id` even if the thread later rebinds to a different worktree.
- Merge-back, compare, and PR creation flows may intentionally bridge the bound worktree to a base branch, but they must preserve both identities rather than collapsing them into one generic path.

**1:1 enforcement:** One worktree per thread, one thread per worktree. If a user tries to bind a worktree already bound to another thread, the action is blocked with an explicit error and a deep link to the owning thread when available.

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
5. Backend calls `WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)` where `worktree_path` is auto-generated under `.puppet-master/worktrees/`
6. On success: new `worktree_record` written to redb; `thread_state:{thread_id}:worktree_binding` written; `chat.thread_worktree_bound` seglog event emitted; dialog closes; chat header button updates to bound state
7. On failure: dialog stays open with inline error (e.g. "Branch already exists", "Git error: ..."); retry or cancel
8. Thread selector icon appears immediately on binding

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
   a. Sanitize title for git branch name (lowercase, replace spaces with hyphens, strip invalid chars, truncate to 50 chars)
   b. Compute target: `assistant/<sanitized_title>`
   c. If target branch name exists: auto-append `-2`, `-3`, etc. until unique (silent — no user dialog since this is auto-create)
   d. Call `git branch -m <temp_name> <target_name>` inside the worktree
   e. Update `worktree_record` and `thread_state` binding with new branch name
   f. Emit `chat.thread_worktree_renamed` seglog event
   g. On rename failure: keep temp name, no user interruption, log warning

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

**Ownership:** Chat runtime owns the auto-create call. Executor never invokes WorktreeManager directly for thread worktree creation.

**Concurrent auto-create:** `WorktreeManager::create_worktree` is serialized per project (mutex/lock) to prevent racing. The reverse lookup key write is atomic (redb transaction). If a create fails due to race, auto-create retry logic attempts with the next suffix. Auto-create does NOT retry on non-race failures.

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
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip:** Line 1: Branch name. Line 2: Status pill text (clean/dirty/conflict). Line 3: Worktree path.
- **Icon color/state:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Status source:** Chat header icon and thread selector icon read from `worktree_projection.v1:{project_id}:{worktree_id}` which includes `dirty_state` and `conflict_state` fields. UI subscribes to projection changes via standard reactive binding. If `projection_freshness = stale`: icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)".

### W.7 Cleanup flow (thread delete)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0579
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Keep the current research thread focused on owner cleanup and exact consumer drift that directly depends on those owners.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

**Four access paths (all equivalent in outcome):**

| Path | Entry point | Notes |
|------|-------------|-------|
| Chat header dropdown | "Merge into Base…" / "Create PR…" actions | Primary UI path |
| Source Control worktree section | "Merge" / "Create PR" buttons in expanded worktree row | Secondary UI path |
| Slash commands | `/worktree merge [--squash\|--rebase]`, `/worktree pr` | Keyboard-driven; default squash |
| Natural language in chat | User says "merge my changes into main" | Agent triggers dialog pre-filled with inferred strategy |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

#### W.8.1 Merge confirmation dialog

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Strategy | Segmented control: `Squash` / `Merge` / `Rebase` | `Squash` | Squash = single clean commit; Merge = merge commit preserving history; Rebase = replay on top of base |
| Target branch | Dropdown | From `branching.assistant_worktree_base_ref` or `branching.base_branch` | Must be existing local branch |
| Commit message | Text area (multi-line) | Auto-generated per strategy | Editable; only shown for Squash and Merge (hidden for Rebase) |

**Buttons:** `Merge` (primary, label changes per strategy), `Cancel`

**Dialog reactive behavior:** Squash selected → commit message visible (concatenated commits). Merge selected → commit message visible ("Merge assistant/{title} into {target}"). Rebase selected → commit message hidden. User edits preserved across strategy switches.

#### W.8.2 Pre-merge guards

| Condition | Behavior |
|-----------|----------|
| Worktree has uncommitted changes | Block merge. Warning: "Worktree has uncommitted changes. Commit or stash before merging." Button disabled. |
| Worktree has merge conflicts | Block merge. Warning: "Resolve existing conflicts before merging." Button disabled. |
| Active run in worktree | Block merge. "Cannot merge while a run is active." |
| Target branch deleted | Error if deleted between dialog open and confirm |
| Worktree on detached HEAD | Block merge/PR. "Cannot merge: worktree is on a detached HEAD. Checkout a branch first." |
| Main repo dirty (squash/merge + merged_result) | Block. "Cannot run pre-merge test: main repo has uncommitted changes." |

#### W.8.3 Merge execution

**Critical:** Merge executes in the main repo working tree, NOT inside the worktree. Exception: Rebase step 1 (`git rebase {target}`) runs in the worktree; step 3 (`git merge --ff-only`) runs in the main repo.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

**Exclusive merge lock:** `.git/pm-merge.lock` (main repo). Acquired BEFORE guard checks for atomicity. Guards fail → lock released immediately. Lock held → ALL merge buttons project-wide disabled.

**Lock file format:** `{ "pid": <int>, "started_utc": "<ISO8601>", "worktree_id": "<string>", "strategy": "<string>" }`

**Stale lock recovery:** On startup (lazy), if PID dead or lock older than 5 minutes → auto-remove. Toast: "Stale merge lock cleaned up."

**Execution steps (when pre-merge test disabled):**
- **Squash:** `git checkout {target}` → `git merge --squash {branch}` → `git commit -m "{message}"`
- **Merge:** `git checkout {target}` → `git merge --no-ff {branch} -m "{message}"`
- **Rebase:** (in worktree) `git rebase {target}` → (in main repo) `git checkout {target}` → `git merge --ff-only {branch}`

**Auto-fetch:** `git fetch origin {target}` before merge. Proceeds with local state if offline (advisory toast).

**Rebase is non-interactive only.** Interactive rebase → use terminal.

**Commit authorship:** User's git identity (`user.name`/`user.email`). No AI co-author injection.

**Git hooks:** NOT bypassed. Hook failure = merge failure with Retry/Cancel.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

#### W.8.4 Post-merge behavior

Modal: "Branch `assistant/{title}` has been merged into `{target}`."
- "Keep worktree" — worktree remains bound
- "Remove worktree" — unbind + prune
- "Cancel" — dismiss, worktree stays

Default follows `branching.assistant_worktree_cleanup_default` setting.

**No undo for completed merge.** User can `git reset`/`git revert` via terminal or agent bash.

#### W.8.5 Conflict resolution

- **UI-initiated:** Conflict markers in files → Source Control Changes → existing `cmd.git.conflict_apply_resolution` flow
- **NL-initiated:** Agent resolves conversationally — reads markers, proposes resolutions, edits files
- **Rebase conflicts during `git rebase {target}`:** Auto-abort (`git rebase --abort`). Dialog shows error. Tests never run. Lock released.

#### W.8.6 Create PR flow

Opens existing PR creation panel from GitHub_Integration.md §B with pre-filled fields: title (thread title), body (commit messages), target branch, source branch.

**Auto-push:** `git push -u origin {branch}` before PR panel opens. Push failure → error toast, PR panel does NOT open.

**Guard:** Requires configured GitHub remote.

**Post-PR:** Worktree stays bound (PR open, may push more commits). No cleanup modal.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### W.8.7 Natural language merge

The agent emits a structured system action `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash|merge|rebase", "target_branch": "string", "commit_message": "string" } }`. PM shows dialog pre-filled with agent's parameters. User confirms or cancels.

**Mode guard:** Agent-NL invocation rejected in Ask/Plan mode. User UI clicks always allowed.

**Chaining:** Agent can chain commit → merge → cleanup in single conversational exchange.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Modes.md

### W.9 Pre-merge test gate

**Purpose:** Before committing a merge, run the project's test suite against the merged result to verify integration.

**Settings:** `branching.assistant_worktree_pre_merge_test` (bool, default true), `branching.assistant_worktree_pre_merge_cmd` (string, default empty = auto-detect), `branching.worktree_pre_merge_test_timeout_s` (int, default 300, clamped [30, 1800]), `branching.assistant_worktree_pre_merge_test_target` (enum merged_result|branch_only, default merged_result).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### W.9.1 Auto-detection of test command

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
| **Rebase** | (worktree) `git rebase {target}` → **run tests** (worktree has rebased state) → pass: (main) `git checkout {target}` → `git merge --ff-only {branch}` / fail: `git rebase --abort` |

**For `branch_only` target:** Tests run in worktree against branch as-is BEFORE any merge. Failure blocks merge (with override). Rebase + branch_only: tests run BEFORE rebase begins.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

#### W.9.3 Test dialog UX

Dialog transitions in-place to test phase. Fields become read-only. Live output in scrollable monospace region (~200px max-height). Cancel aborts test + cleanup.

- **Pass (exit 0):** Auto-proceed to commit. Brief "Tests passed" indicator.
- **Fail (exit ≠ 0):** Red header "Tests failed" + full output + "Merge Anyway" (secondary/destructive) + "Cancel" (primary). Override proceeds to commit; seglog records override.
- **Timeout:** Same UI as failure.
- **Process error:** Same UI with error message.

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

### W.12 File manager worktree context

When user switches to a thread with a worktree binding (and `file_manager.worktree_follow_thread` is `true`), the file manager switches root to show the worktree's file tree.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

**Breadcrumb indicator:** Worktree glyph + branch name + swap toggle icon at top of file manager tree. Clicking swap toggles between worktree root and main project root. Binary toggle. Toggle resets on ANY thread switch.

**Accessible label:** "Viewing worktree assistant/fix-auth. Click to switch to project root." (and inverse)

**Rules:**
- Open editor tabs NOT affected by root switch — tabs retain own paths
- File manager search scope follows current file manager root
- `@file` resolves relative to thread's `working_directory` (worktree root when bound)
- Quick-open (Ctrl+P) remains project-scoped regardless of worktree context
- If thread unbound mid-session: file manager falls back to project root with toast "Worktree unbound — showing project root."

### W.13 LSP worktree awareness

LSP sessions are already keyed by `(host_id, server_id, root_identity)`. Different worktree path = different root_identity = naturally separate LSP session. No new keying model needed.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md

**Thread focus change flow:** File manager root changes → LSP client sends `workspace/didChangeWorkspaceFolders` or new session initialized (lazy). Diagnostics/hover/completion operate against worktree file state.

**LSP session lifecycle:** Created on first file open from worktree. Idle-collected after 5 minutes with no open files (configurable). Destroyed when worktree removed.

### W.14 Remote SSH projects

Worktree creation follows project host authority. For remote SSH projects, `WorktreeManager` executes on remote host via SSH subprocess. No silent local fallback. All paths (worktree, FileSafe working_directory, terminal cwd) use remote filesystem.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Executor_Protocol.md

### W.15 Error handling

| Error scenario | User-visible behavior |
|---------------|----------------------|
| `create_worktree` fails | Dialog stays open with inline error; retry or cancel |
| Auto-create fails | Thread created without worktree; warning toast |
| Branch rename fails after title gen | Keep temp name; no user interruption; log warning |
| Worktree path no longer exists | On next focus: detect, toast, auto-unbind with reason `path_missing` |
| Remove blocked by active run | Error toast; Remove button disabled |
| Branch name collision | Auto-append `-2`, `-3`… up to 10 attempts; dialog error if all collide |
| 1:1 violation attempt | Error toast "Already bound to thread '{title}'" |
| Merge conflict | Dialog closes; conflict markers in files; SC highlights; existing resolution flow |
| Concurrent merge (lock contention) | Error toast "Another merge in progress"; all Merge buttons disabled |
| Test not found | Dialog shows error; Retry / Merge Anyway / Cancel |
| Test timed out | Dialog shows timeout + Merge Anyway / Cancel |
| Test output > 1MB | "[OUTPUT TRUNCATED]"; does not affect pass/fail |
| Detached HEAD: merge/PR | Dialog error; buttons disabled |
| Git hook rejects commit | "Merge failed: {hook} rejected commit"; Retry / Cancel |
| Stale merge lock at startup | Auto-remove if PID dead or >5 min; advisory toast |
| Project switch with bound worktree | Button disabled; tooltip "Worktree belongs to project '{name}'"; no auto-unbind |
| Worktree unbound mid-merge dialog | Dialog shows error and closes; no merge executed |
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
- No "Bind Existing" in MVP
- No undo for unbind or merge in MVP
- No per-merge command override in MVP
- App uninstall does NOT auto-clean worktrees
- No inline chat history markers for worktree context changes
- Terminal context (cwd) for worktree-bound threads follows worktree path; no special terminal management
- Changes section always shows main repo (worktree-scoping Changes is not MVP)
- No thread export of worktree binding metadata
- No orchestrator-to-assistant worktree transfer on handoff
