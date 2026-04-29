## 1. Definitions and concepts
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

### Additional shell/runtime identities required by the promoted Section 15 feature set

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0662
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - evidence set / source refs
  - event/addendum supersession should be explicit enough that implementers do not need to diff three addenda to know the final field set
  - they do not yet expose the non-provider operational identities that live on top of or beside those credentials
  - Keep the initial canonical set deliberately small:
  - The canonical `object_kind` set is:
  - object_kind
  - After this merge, the entire remaining partial set should sit uniformly at `Gemini + Opus + Sonnet`; there is no longer any unevenness inside the tail.
  - Gemini + Opus + Sonnet
  - These should be treated as **secondary** findings behind the ledger-backed missed-transfer set above.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The storage model MUST treat the following as first-class identities when the feature is enabled:
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

- `workspace_tab_id`
- `window_id`
- `browser_tab_id`
- `preview_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `branch_id` for branched conversation/session lineage

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

Identity rules:
- `project_id` is stable across path rebinding and restore operations; raw path is not the canonical identity
- `workspace_tab_id` is distinct from `project_id`
- `browser_tab_id` is distinct from `preview_session_id`
- `terminal_section_id` owns presentation continuity and dock or detach realization
- `terminal_tab_id` owns tab continuity, label, pin state, and order within a terminal section
- `terminal_pane_id` owns split-tree slot continuity and visible binding location
- `terminal_session_id` owns exact PTY continuity
- `dev_session_id` owns higher-level dev workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required
- detached windows and ephemeral automation/auth sessions have separate persistence scope from workspace-tab shell state

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Additional terminal identity rule:
- command-block and transcript metadata may reference stable per-session command-block identifiers, but command-block identity is subordinate to `terminal_session_id` rather than a peer replacement for it

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md
