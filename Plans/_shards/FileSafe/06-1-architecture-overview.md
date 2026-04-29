## 1. Architecture Overview

### 1.1 Three-Layer Defense

| Layer | Type | When It Fires | Reliability |
|-------|------|---------------|-------------|
| **Pre-execution guard** | Rust module | Before every Bash/command call | Deterministic (regex match) |
| **Agent prompt rules** | Behavioral guidance | When agent reads instructions | Probabilistic (model compliance) |
| **Post-execution audit** | Event log check | After command execution | Deterministic but reactive |

**Layer 1 is the fix.** It blocks destructive commands before they execute, regardless of what the model decides to do.

### 1.2 Integration Point

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0229
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - This means the branch is past the point where isolated consumer cleanup would be reliable.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The guard integrates into `BaseRunner::execute_command()` in `puppet-master-rs/src/platforms/runner.rs`:

ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command

```rust
// Before spawning the process (line ~266)
// Add guard check here
if let Err(e) = self.bash_guard.check_command(&full_command_string) {
    return Err(anyhow!("Destructive command blocked: {}", e));
}
```

---

