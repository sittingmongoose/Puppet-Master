## 6. Teach

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0564
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - the later addenda teach attempt/block/runtime-lineage identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Teach defines how users deliberately teach Puppet Master durable codebase knowledge, preferences, and workflow constraints from within chat.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Teach trigger rules:
- Teach may be invoked explicitly via `/teach` or equivalent natural-language intent such as "remember that...", "for this repo always...", or "please prefer..."
- the assistant may recommend Teach when it detects reusable guidance, but persistence requires an explicit user-confirming action before the knowledge is stored
- Teach is a capture workflow, not a separate closed `mode_overlay`; execution posture remains controlled by the thread's current runtime/mode selection unless the user also changes modes

What Teach stores:
- project conventions such as naming, testing, logging, formatting, architecture boundaries, and generated-file rules
- user preferences that materially affect future responses or edits
- recurring environment facts such as canonical commands, repository structure, or approval expectations
- negative constraints such as "never edit derived files" or "always plan before execution for risky tasks"

Persistence scope:
- each taught item MUST declare a scope before commit: `thread`, `project`, or `user`
- `thread` scope persists only with the current thread and its descendants where lineage explicitly carries that memory
- `project` scope persists across future threads in the same project/workspace
- `user` scope persists as a user-level preference only when the content is not project-confidential
- persisted Teach records store at minimum `memory_id`, `scope`, `source_thread_id`, `author_message_id`, `captured_at`, and `normalized_fact`, plus optional `supersedes_memory_id` / `revoked_at`

Effect on future responses:
- taught knowledge is retrieved into future prompt assembly as explicit memory/context rather than as undocumented hidden prompt mutation
- when a taught fact materially changes an answer, plan, or execution choice, the assistant should be able to disclose that the response was influenced by taught memory
- conflicting teachings do not silently overwrite prior knowledge; PM records supersession or revocation so the user can audit why a newer fact won
- taught knowledge may influence future responses, planning posture, tool-selection defaults, and code-generation choices only within its approved persistence scope

Safety and audit rules:
- users can inspect, narrow, supersede, or revoke taught knowledge later
- Teach MUST NOT persist secrets, tokens, passwords, or other credentials
- ordinary one-off chat instructions do not become taught knowledge unless the user explicitly confirms persistence

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md

