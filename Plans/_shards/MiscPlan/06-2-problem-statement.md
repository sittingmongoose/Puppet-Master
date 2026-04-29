## 2. Problem Statement

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0358
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Projects page should not try to summarize every problem.
  - The routing/open-by-identity tranche is no longer a broad invention problem.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

**We should be concerned** about accumulation of agent-left-behind content: documents, tests, evidence, and builds can clutter the workspace and evidence directories if there is no cleanup policy. Agents run in fresh processes per iteration (CU-P2-T12). They can leave behind:

- **Docs:** Extra `.md` files (notes, plans, fragments), sometimes in repo root or `src/`.
- **Tests / scripts:** One-off test files, run scripts, or temporary harnesses.
- **Artifacts:** Build outputs (e.g. `target/` if not already ignored), test output dirs, installers from testing.
- **Temp files:** Editor backups, debug logs, or platform-specific temp dirs created in the workspace.

REQUIREMENTS.md specifies "Clean working directory state (git checkout to last commit)" and a runner contract with `prepare_working_directory` and `cleanup_after_execution`, but these are **not implemented** in `puppet-master-rs`. A plain `git checkout` only resets **tracked** files; **untracked** files remain. Without a cleanup policy and implementation, agent-left-behind content accumulates.

---

