## 8. History and Rollback (Restore Points)

### 8.1 Concept

**Restore points** are snapshots of "state after message N" (or "after iteration K"). For each point we store:

- Which messages (or iterations) had been completed.
- For file-changing runs: a snapshot of affected files (path + content before the change).

User can **roll back** to a restore point: revert those files to their snapshot content and truncate conversation/state to that point (e.g. for the interview: back to that phase and answer set; for the orchestrator: back to that subtask/iteration). Conflict detection: if a file was changed outside the app (or by another run) since the snapshot, warn and optionally skip or merge.

### 8.2 Relevance to Puppet Master

- **Orchestrator:** "Revert to before this iteration" so a bad subtask can be retried with a different prompt or platform without losing earlier progress.
- **Interview:** "Revert to end of Phase 2" so the user can re-answer Phase 3 without losing Phases 1-2.
- **Evidence:** We already store evidence per run; restore points could reference "evidence up to run X" and we could recompute or mark "valid up to this point".

### 8.3 Implementation Directions

- **When to snapshot:** After each "logical turn" (e.g. after each iteration in the orchestrator, or after each user message in a chat-style flow). Persist: turn id (or message id), list of files touched, and for each file: path, content before, content after (or diff). For critical or destructive tools, the app may take an additional per-tool-call snapshot before the mutation. See §19.12 for detailed technical rollback flow.
- **Storage (redb + seglog):** Restore-point metadata (point ID, project_id, turn_id, timestamp, file list, content hashes) is stored in **redb** (`restore_points` namespace, keyed by `project_id`). File snapshot blobs (full content or diffs) are stored either inline in redb values (for small snapshots) or as files under app-data referenced by redb keys (for large snapshots). **Not** a standalone filesystem directory tree. Creation and pruning emit seglog events (`restore_point.created`, `restore_point.pruned`) so the system can replay and audit restore-point state. See Plans/storage-plan.md §2.2 for event types and §2.3 for redb schema. ContractRef: Primitive:DocumentCheckpoint (Crosswalk §3.11), Plans/storage-plan.md.
- **Retention:** Keep last N restore points (e.g. 50) or last N days to bound disk usage. Pruning is app-initiated and emits `restore_point.pruned` to seglog.
- **Read-only for agents (tool registry constraint):** Restore-point management (create, prune, delete) is app-internal only — no agent tool may delete or overwrite restore points. Agents may query restore points via a read-only tool (e.g. `list_restore_points`) but cannot modify the store. This is enforced as a **tool registry permission** in the central policy engine (per rewrite-tie-in-memo.md), not as storage-layer access control. Only the app (or an explicit user action in the UI) may create or prune restore points.
- **Auto-snapshot before mutating edits:** Before each logical turn that includes mutating tool runs (write file, delete file, rename), the system takes a snapshot of affected files (paths + content) and appends a restore point. Snapshot scope is "files this turn will touch." The default granularity is per-turn; per-tool-call snapshots are reserved for critical operations (e.g. destructive commands that pass FileSafe gates).
- **Agent-requested rollback with user confirmation:** Agents may request a rollback via a designated tool call (e.g. `request_rollback(scope, restore_point_id?)`). The tool is **request-only** — it emits a `rollback.requested` seglog event and the app shows a confirmation UI (affected files, optional diff, conflict status). The app does not perform the restore until the user confirms. On confirm, the app performs the restore and emits `rollback.confirmed` + `rollback.completed`. On cancel, emits `rollback.cancelled`. **Tiered undo scope:**
  - **Narrow:** "Undo my last edit" or "restore to start of current turn" — single-mistake recovery. Still requires user confirmation.
  - **Broader:** "Restore to restore point N" or "restore to message X" — requires user confirmation and optionally limits scope (e.g. only restore points from this session, or last N points) so the agent cannot silently rewind large amounts of work.
  The agent communicates scope via the tool call parameters; the app maps the request to a specific restore point and presents the confirmation UI.
  Cross-reference: assistant-chat-design.md §13 (revert last agent edit), §11 (resume/rewind), §15.2 (branching/fork after restore).
- **Rollback conflict handling:** When computing a rollback (agent- or user-requested), for each file to restore, check whether it was modified outside the app (mtime and/or content hash per §23.4). If any file has a conflict, do not restore silently; show the user a confirmation with affected files and conflict status (and diff where useful) and let the user choose (e.g. skip, overwrite, cancel). See §23.4 for precedence and detailed conflict policy.
- **Interaction with background agents:** If a background run is active on the same project, define whether restore/rollback is disabled, queued, or allowed with a warning; see §23.4.
- **Rollback flow:** See §19.12 for the detailed technical rollback flow (compute file set, conflict check, confirmation, file write-back, state update). The flow is the same for user-initiated and agent-requested rollback; the only difference is the trigger (UI action vs agent tool call) and the mandatory confirmation gate for agent requests.
- **GUI:** A "History" or "Restore" panel listing restore points (e.g. by time and description "After iteration X", "After Phase 2"); click to preview and then confirm rollback. Disable during an active run. The File Editor document pane also offers a "Restore to…" action (see Plans/FileManager.md §2.2, §2.4.1).
- **Git alignment:** Where possible, integrate with git (e.g. "restore point = this commit"); if we already have worktrees/branches, we could expose "restore to branch X" as an alternative to file-level restore. See §15.2 for "Restore and branch" (fork after rollback).

---

