## 5. Configuration Options

### 5.1 Environment Variable Override

```rust
// Check environment variable
let allow_destructive = std::env::var("PUPPET_MASTER_ALLOW_DESTRUCTIVE")
    .map(|v| v == "1")
    .unwrap_or(false);
```

### 5.2 Config File Toggle

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0240
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - config bundles are clearly defined (`.pm-bundle`)
  - .pm-bundle
  - config sync/export bundles (`.pm-bundle`)
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Add to `puppet-master.yaml`. All FileSafe toggles (Command blocklist, Write scope, Security filter) must be configurable from the GUI and easy to turn on or off in one place (see §13.4 and §15.5).

```yaml
filesafe:
  bashGuard:   # Command blocklist
    enabled: true  # Default: true
    allowDestructive: false  # Default: false
    customPatternsPath: ".puppet-master/destructive-commands.local.txt"  # Optional
  fileGuard:   # Write scope
    enabled: true
    strictMode: true
  securityFilter:
    enabled: true
    allowDuringInterview: false
  approvedCommands: []
```

### 5.3 Project-Specific Patterns

Allow projects to extend patterns via `.puppet-master/destructive-commands.local.txt`:

```rust
// Load default patterns
let mut patterns = load_patterns(&default_patterns_path)?;

// Load project-specific patterns if exists
if let Some(local_path) = &config.custom_patterns_path {
    if local_path.exists() {
        let local_patterns = load_patterns(local_path)?;
        patterns.extend(local_patterns);
    }
}
```

---

