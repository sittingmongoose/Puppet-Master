## Executive Summary

FileSafe is the canonical guardrail layer that blocks destructive commands before execution, constrains write scope, filters sensitive file access, validates compiled prompt content, and records guard outcomes in the canonical event stream.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Prompt/context compilation is adjacent but separately owned. `Plans/Prompt_Pipeline.md` owns role-specific context selection, delta compilation, cache heuristics, skill bundling, and compaction behavior. FileSafe consumes compiled output as an input to safety checks; it does not own those algorithms.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

### Part A -- FileSafe

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0241
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Several current docs still blur “which object” and “what part of that object’s UI should be shown.”
  - `blocked_sequence` is part of the runtime-facing identity
  - blocked_sequence
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

1. **FileSafe: Command blocklist** -- Blocks destructive CLI commands before they run.
2. **FileSafe: Write scope** -- Restricts writes to the canonical allowed-file scope for the execution.
3. **FileSafe: Security filter** -- Blocks access to sensitive files and secrets.
4. **Compiled prompt checking** -- Scans the fully assembled prompt before provider dispatch.
5. **Verification and override integration** -- Allows only explicitly authorized override paths and records them canonically.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

### Part B -- Compiled-context safety boundary

- FileSafe checks the fully compiled prompt **after** Prompt Pipeline assembly and **before** provider dispatch.
- FileSafe validates structured attachments, forwarded document selections, and file references against security and write-scope policy.
- FileSafe emits structured allow/block outcomes for these checks into seglog.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

---

