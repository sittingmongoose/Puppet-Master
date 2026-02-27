## 6. Evidence Retention & Pruning

Implementation should align with storage-plan.md: evidence lifecycle events in seglog; retention policy and pruning metadata (or indexes) in redb where useful for fast queries.

### 6.1 Purpose

- Avoid unbounded growth of `.puppet-master/evidence/` (test-logs, screenshots, gate-reports, etc.) on long-lived projects.

### 6.2 Policy

- **Retention:** Keep evidence for the last N days, or last M runs per tier, or keep all (configurable).
- **Pruning:** A scheduled or manual job removes evidence older than the retention window. Do not remove evidence for the current run or recent runs still in progress.

### 6.3 Implementation

- **Config schema:** Add to run config (or GuiConfig-derived): `evidence.retention_days: Option<u32>` (None = retain all), `evidence.retain_last_runs: Option<u32>` (None = unused; if set, prefer defining "run" as one iteration or one subtask completion -- see §9.1.7), `evidence.prune_on_cleanup: bool` (run pruning when manual "Clean workspace" or after prepare, not in the hot path of cleanup_after_execution).
- **Concrete function:** `pub async fn prune_evidence_older_than(base_dir: &Path, config: &EvidenceRetentionConfig) -> Result<PruneResult>` in cleanup module (DRY:FN). List `.puppet-master/evidence/` recursively; for each file/dir, check mtime; if older than `retention_days` days (or if using retain_last_runs, sort by mtime and keep only the newest N "runs" -- define run as e.g. one evidence subdir or one timestamped file set), delete. Return count of removed items. Do not block the main iteration path; call from manual action or a background task.
- **Safety:** Never delete evidence for runs that are still referenced in the current prd.json or progress.txt if that's feasible; otherwise rely on retention_days only until "run" is well-defined (§9.1.7).

### 6.4 Docs

- STATE_FILES.md: document retention and that evidence may be pruned; point to config.
- AGENTS.md: note that evidence can be pruned; agents should not rely on very old evidence paths.

---

