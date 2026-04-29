## 15. Plan Mode + Crew Mode

Plan-mode and crew-mode rules must align with the PM child-run contract.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md

### Plan-mode delegated work

`ask` and `plan` may launch delegated child runs only for read-only research or analysis.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Rules:
- no code-writing, file mutation, or execution child may be launched from `ask` or `plan`.
- required planning dependencies may still be child runs as long as they remain read-only.
- parent mode is a hard ceiling; a child may narrow but must not widen parent authority.
- unresolved required planning children keep the plan provisional rather than falsely complete.

### Crew-mode planning interaction

Crew is an overlay, not a new runtime-mode enum. A crew launched from `plan` remains read-only; a crew launched from `regular` or `yolo` inherits those parent ceilings and guardrails.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md

### Crew selection flow

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0575
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - provider/auth/account selection flow
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

When crew mode is first invoked for a relevant scope:
- if a valid default crew exists, ask whether to use the default crew.
- otherwise ask which models to use.
- after model selection, resolve and confirm provider/runtime mapping where ambiguity or restriction-sensitive mapping exists.
- if any crew member is configured to use Copilot, the entire crew normalizes to Copilot as a crew-level provider constraint.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
