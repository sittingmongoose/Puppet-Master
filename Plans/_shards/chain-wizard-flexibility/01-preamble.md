# Chain Wizard & Interview Flexibility -- Intent-Based Workflows

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0583
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/chain-wizard-flexibility.md`
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
  - `Resume Wizard`
  - Resume Wizard
  - Wizard / interview / worktree lineage gaps continue to sharpen at the seams:
  - `thread_id: None` in interview examples is now a concrete drift signal, not just omitted detail
  - thread_id: None
  - Wizard / interview / worktree seams still expose the remaining high-risk lineage holes:
  - wizard resume via `wizard_id + step`
  - wizard_id + step
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `object_kind = wizard`
  - object_kind = wizard
  - `puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify`
  - puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify
  - must override to the wizard surface and the correct wizard/step context
  - The concrete wizard deep-link format is defined, but there is still no owner doc that states what class of route data is allowed into serialized transport.
  - The routing model now has a clear owner chain.
  - Reconciliation should follow that owner chain or it will fragment again.
  - concrete `puppet-master://wizard/...` format
  - puppet-master://wizard/...
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `Plans/chain-wizard-flexibility.md`, `Plans/FinalGUISpec.md`
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


