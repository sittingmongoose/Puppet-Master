## 4. Session and Crash Recovery

### 4.1 Concept

**Periodic snapshots** of application state (e.g. every 5 minutes) plus **auto-save** of in-progress work (e.g. every 30 seconds) so that after a crash or kill, the user can reopen the app and choose to restore:

- Last window layout and open views
- Current session (e.g. which phase/task/subtask was active, which project, unsent input)
- Optional: last N message or state checkpoints for the active run

Retention policy (e.g. 24 hours of snapshots, 7 days of cleanup) keeps disk use bounded.

### 4.2 Relevance to Puppet Master

- **Long-running orchestrator runs:** If the app crashes during a long PRD execution, restoring "current phase/task/subtask" and progress state (e.g. from progress.txt and prd.json) avoids starting from scratch.
- **Interview:** Restore interview phase and in-progress answers so the user doesn't lose a long session.
- **In-progress run checkpoint:** For doc-generation and Multi-Pass Review runs, persist a run checkpoint (run_type, run_id, step_index, document_index, checkpoint_version) in the recovery snapshot or redb so "Run was interrupted" can offer "Resume from checkpoint" or "Start over." Schema and behavior: Plans/chain-wizard-flexibility.md §3.5 and Plans/interview-subagent-integration.md GUI gaps (Agent activity and progress visibility).
- **GUI state:** Restore selected project, open tabs, and scroll position for a better UX.

### 4.3 Implementation Directions

- **Snapshot format:** Serialize a minimal "recovery" struct: app phase (e.g. dashboard / wizard / orchestrator / interview), project path, orchestrator state (phase/task/subtask ids), interview phase, window size/position, timestamp. Store under e.g. `.puppet-master/recovery/` or in app data dir.
- **Rust module:** e.g. `recovery.rs`: take snapshot on a timer, write to disk; on startup, check for a recent snapshot and offer "Restore?" in the UI. Use existing `state/` and file I/O; avoid blocking the main loop.
- **Cleanup:** Background or startup job to delete snapshots older than 24h (configurable).
- **Panic hook:** Optionally register a panic hook that writes one last snapshot before exiting. **Best-effort only:** A severe crash may not complete the write; rely on periodic timer snapshots as the primary recovery source. See §23.3.
- **Snapshot schema version:** Include a **schema version** (e.g. `recovery_schema_version: 1`) in the snapshot format so future app versions can migrate or skip incompatible snapshots; document in §23.3.
- **Non-blocking I/O:** Snapshot writes must not block the main loop; use background task or non-blocking write so the UI stays responsive.
- **Config:** Document config keys for retention (e.g. `recovery.retention_hours`), snapshot interval (e.g. `recovery.snapshot_interval_sec`), and auto-save interval if implemented.
- **GUI:** On launch, if a recent snapshot exists, show a small "Restore previous session?" dialog; restore only if user confirms.

---

