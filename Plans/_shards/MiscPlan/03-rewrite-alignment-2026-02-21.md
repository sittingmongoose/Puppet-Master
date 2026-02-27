## Rewrite alignment (2026-02-21)

This plan's cleanup/artifact retention requirements remain authoritative, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- Treat cleanup actions, retained artifacts, and evidence as first-class **artifacts/events** in the unified event model (seglog ledger)
- Prefer enforcing cleanup boundaries via the **patch/apply/verify/rollback pipeline** (worktree/sandbox lifecycle), not UI-only affordances
- Any config/file-path examples should be interpreted as projections/import-export paths in the new seglog/redb architecture
- **Artifact retention and evidence:** Emit **cleanup and evidence events** to seglog (e.g. cleanup run started/completed, evidence retained/pruned, manual 'Clean workspace' action). Use redb for retention policy, retention metadata, or rollups (e.g. last cleanup time, evidence count per run) so dashboard and retention logic can query without scanning seglog. See storage-plan.md for projectors and analytics.

**Suggested implementation order (DRY-friendly):**  
1) Add `src/cleanup/` with allowlist (DRY:DATA) and `run_git_clean_with_excludes` (DRY:FN); use shared git binary resolution from Worktree plan when available (§10.1).  
2) Implement `prepare_working_directory` and `cleanup_after_execution` (DRY:FN) in cleanup module.  
3) Add/extend runner contract with default impls delegating to cleanup.  
4) Add `run_with_cleanup` wrapper (DRY:FN) and switch all call sites to it.  
5) Document policy in AGENTS.md; add config toggles and Cleanup UX (using existing widgets); wire cleanup config via same Option B as Worktree plan (§10.1).  
6) Agent-output dir, evidence pruning, manual "Clean workspace" action (worktree list from Worktree plan if "all worktrees" desired).

**Cross-plan:** Section 10 describes how this plan depends on and impacts WorktreeGitImprovement, orchestrator-subagent-integration, and interview-subagent-integration.

**ELI5/Expert copy alignment:** Any authored tooltip/help/discoverability copy in this plan (for example shortcut/tooling hints) must provide both Expert and ELI5 variants and follow `Plans/FinalGUISpec.md` §7.4.0. App-level **Interaction Mode (Expert/ELI5)** selects variant display; chat-level **Chat ELI5** is separate and chat-only.

---

