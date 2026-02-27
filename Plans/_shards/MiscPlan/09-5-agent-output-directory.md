## 5. Agent Output Directory

### 5.1 Purpose

- Give agents a single, well-defined place to write one-off docs, scratch plans, or debug output.
- Makes it easy to clear "agent scratch" without touching the rest of the repo or evidence.

### 5.2 Design

- **Directory:** `.puppet-master/agent-output/` (or configurable path under `.puppet-master/`). Define the default path in **one place** (e.g. a constant in the cleanup module, **DRY:DATA**) so cleanup and docs reference the same value.
- **Subdirs (optional):** e.g. `agent-output/run-<session_id>/` so each run has a folder; cleanup can delete run-specific dirs older than N days, or delete all contents between runs.
- **Prompts / AGENTS.md:** Document that agents should write disposable/scratch files only under this directory when possible. Not enforced by tooling; best-effort.

### 5.3 Cleanup

- **When:** Clear only in **prepare_working_directory** (before the run), not in cleanup_after_execution, so agent output from the current run is not deleted before commit. Per config (e.g. `cleanup.clear_agent_output: true`).
- **How:** In `prepare_working_directory`, after git clean (if any), if config says clear agent-output: list contents of `agent_output_dir()` (DRY:DATA path); remove each file and subdir; do not remove the directory itself so agents can write there immediately.
- **Concrete:** Define `pub const AGENT_OUTPUT_SUBDIR: &str = "agent-output"` and `pub fn agent_output_dir(base: &Path) -> PathBuf { base.join(".puppet-master").join(AGENT_OUTPUT_SUBDIR) }` in the cleanup module (DRY:DATA). Use the same base (e.g. work_dir or project root) as the rest of prepare so one place defines the path.

### 5.4 Docs

- STATE_FILES.md: add `.puppet-master/agent-output/` to the state hierarchy with a one-line purpose (scratch area for agent-generated files; may be cleared between runs).
- AGENTS.md: add a short bullet that disposable docs/scratch should go under `.puppet-master/agent-output/` when possible.

---

