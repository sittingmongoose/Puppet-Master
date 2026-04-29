## 12. Gaps and Potential Issues

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0223
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - auth/account issues
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 12.1 Pattern Matching Accuracy

**Issue:** Regex patterns may be too broad (blocking safe commands) or too narrow (missing variants).

**Mitigation:**
- Test all patterns against real-world command variations
- Use word boundaries (`\b`) where appropriate
- Document pattern rationale in comments
- Allow project-specific overrides via local patterns file

### 12.2 False Positives

**Issue:** Legitimate commands may match destructive patterns (e.g., `migrate:fresh` in documentation).

**Mitigation:**
- Check prompt context (code block vs documentation)
- Allow override via environment variable
- Log all blocks for review
- Provide clear error messages with override instructions

### 12.3 Performance Impact

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0234
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - That means the performance model must explicitly cover:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

**Issue:** Pattern matching on every command may add latency.

**Mitigation:**
- Compile regex patterns once at initialization
- Use efficient regex engine (Rust's `regex` crate is fast)
- Cache pattern compilation results
- Benchmark and optimize hot paths

### 12.4 Multi-Platform Prompt Checking

**Issue:** Different platforms format prompts differently, making extraction difficult.

**Mitigation:**
- Platform-specific prompt parsers
- Fallback to simple pattern matching
- Document platform-specific behavior
- Test across all providers

### 12.5 Write-scope plan integration

**Issue:** Plans may not always specify exact file paths, making write-scope enforcement too restrictive.

**Mitigation:**
- Prefer directory-level permissions in the allowed list; wildcard patterns are a future enhancement (not MVP)
- Allow directory-level permissions
- Provide clear error messages when writes are blocked
- Allow override for exploratory phases

### 12.6 Implementation-Ready Clarifications (resolved)

AutoDecision: Request metadata uses `ExecutionRequest.env_vars` only; do not add a `tags` field.  
ContractRef: CodePath:puppet-master-rs/src/types/execution.rs, EnvVar:PUPPET_MASTER_OPERATION_TYPE, EnvVar:PUPPET_MASTER_ALLOWED_FILES

AutoDecision: `PUPPET_MASTER_OPERATION_TYPE` values are fixed: `normal` (default), `verification_gate`, `interview`. Guards MAY loosen only for `verification_gate` (never for `normal`).  
ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE

AutoDecision: Allowed write scope is supplied via `PUPPET_MASTER_ALLOWED_FILES` (JSON array of repo-relative paths and/or explicit directories). If missing or empty and `file_guard.enabled == true`: treat as empty allowlist (fail closed); enforcement is `strict_mode`-dependent (block vs warn-only).  
ContractRef: EnvVar:PUPPET_MASTER_ALLOWED_FILES, ConfigKey:filesafe.fileGuard.strictMode

AutoDecision: Owner for allowed-files derivation is `puppet-master-rs/src/core/orchestrator.rs`; orchestrator builds `PUPPET_MASTER_ALLOWED_FILES` when constructing each `ExecutionRequest` (primary source: current subtask's declared file list; context files are implicitly allowed via `request.context_files`).  
ContractRef: CodePath:puppet-master-rs/src/core/orchestrator.rs, CodePath:puppet-master-rs/src/platforms/context_files.rs

AutoDecision: Missing/unreadable custom pattern file is ignored (bundled patterns still apply). If bundled patterns are unavailable at runtime, fall back to an embedded minimal default list and log a warning; do not disable FileSafe.  
ContractRef: ConfigKey:filesafe.bashGuard.customPatternsPath

AutoDecision: `approved_commands` matching is **exact** after normalization (`trim` + collapse whitespace). Do not use prefix/substring matching.  
ContractRef: ConfigKey:filesafe.approvedCommands

AutoDecision: For multi-line or chained commands (`\n`, `&&`, `;`, `||`, `|`), check each segment independently; if any segment is blocked, block the whole invocation.  
ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command

---

