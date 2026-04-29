## 9. Risks & Notes

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0360
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - current ledger escalation/current-vs-historical/blocked-owner notes
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Over-aggressive clean:** Using `git clean -fdx` without a correct exclude list can remove user-ignored but wanted files (e.g. local config). Prefer conservative default and explicit allowlist. **Security:** Without sensitive patterns in the allowlist (§3.6), cleanup could delete `.gitignore`, `.env`, or key files and make secrets more likely to be committed or exposed.
- **Worktree path:** Ensure `work_dir` passed to prepare/cleanup is the actual worktree path when using worktrees, not the main repo path.
- **Config wiring:** If GUI and run-time config differ (as in WorktreeGitImprovement.md), cleanup config must be read from the same config the orchestrator uses at run time.
- **Evidence pruning:** Pruning while a run is still writing evidence could remove in-use files. Run pruning after runs or on a delay; avoid deleting very recent files (e.g. last 1 hour).
- **Secrets to GitHub:** Never force-add ignored files; never log or put tokens/keys in evidence or PR body. See §3.6.

---

