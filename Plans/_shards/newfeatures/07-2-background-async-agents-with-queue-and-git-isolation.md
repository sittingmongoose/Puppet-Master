## 2. Background / Async Agents with Queue and Git Isolation

### 2.1 Concept

Run **multiple agent runs in parallel** (e.g. up to N concurrent) with:

- **Queue:** Jobs (e.g. "run architect", "run implementer") are queued and executed when a slot is free.
- **Git branch isolation:** Each run gets its own branch (e.g. `async-{role}-{id}`). Uncommitted changes are stashed; work is done on the branch; user can diff, merge, or discard.
- **Output isolation:** Each run writes to a dedicated output directory; the main session is not blocked or mixed with background output.
- **Merge conflict detection:** Before suggesting a merge, the system checks for conflicts and can surface them in the UI or block auto-merge.

### 2.2 Relevance to Puppet Master

- **Orchestrator:** We could run "planning" or "exploration" agents in the background while the user continues with the main PRD-driven flow, or run multiple subtasks in parallel (e.g. two subtasks on two branches).
- **Interview:** Background agents could run research or validation (e.g. "explorer" for codebase scan, "guardian" for review) while the main interview continues.
- **Fresh process per run:** Aligns with our policy: each background run is still a new CLI process; we only add queue and concurrency limits.

### 2.3 Implementation Directions

- **Queue manager (Rust):** A module that maintains a bounded queue (e.g. max 4 concurrent), spawns CLI processes, tracks PIDs, and exposes status (queued / running / completed / failed / cancelled). Persist queue state so it survives app restart if desired. The queue must respect **per-platform concurrency caps** from config (global + per-context overrides; see `Plans/FinalGUISpec.md` §7.4.7). These caps exist to avoid both provider rate limits and dev-machine overload (CPU, disk I/O, many concurrent processes).
- **Git integration:** Use existing `src/git/` (worktree, branches). Add: create branch from current HEAD, stash if dirty, run agent on that branch, then offer diff/merge/delete. Conflict detection via `git merge --no-commit --no-ff` or equivalent.
- **Output directory:** e.g. `.puppet-master/agent-output/{run-id}/` for logs and any artifacts; link from queue item so UI can "View output".
- **GUI:** A small panel or view (e.g. "Background runs") listing queued and running jobs, with cancel and "view diff" / "merge" actions. Could live in dashboard or a dedicated view.
- **Platform abstraction:** Reuse existing platform runners; the queue only decides *when* to call the same spawn path we use for the main flow.
- **Main run vs background run on same project (Resolved):**
  - **Allow both with warning:** When the user starts a main run while a background run is active on the same project, show: "A background run is active. Starting a main run may cause file conflicts. [Proceed] [Cancel]."
  - If the user proceeds: both runs execute. If a file conflict is detected (same file modified by both), the main run pauses and surfaces a CtA: "File conflict: [filename] was modified by both runs. [Keep main's version] [Keep background's version] [Diff]."
  - Conflict detection uses content hash (SHA-256) comparison at write time.
- **Queue state persistence:** If queue state survives app restart, define format and path (e.g. `.puppet-master/queue/state.json` or redb) and how to recover PIDs (e.g. treat as failed if process no longer exists).
- **Git and cleanup:** Reuse **WorktreeGitImprovement.md** (branch create/merge/cleanup) and **MiscPlan** (cleanup allowlist, `run_with_cleanup`). Ensure `.puppet-master/agent-output/{run-id}/` is in cleanup allowlist or explicitly excluded by policy; branch naming (e.g. `async-{role}-{id}`) should follow WorktreeGitImprovement branch sanitization.

---

