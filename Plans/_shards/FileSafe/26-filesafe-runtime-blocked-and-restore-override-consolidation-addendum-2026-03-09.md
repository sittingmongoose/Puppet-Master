## FileSafe Runtime Blocked and Restore Override Consolidation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0227
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - lane/worktree restore
  - deterministic restore from either `document_id` or `artifact_id`
  - document_id
  - artifact_id
  - Normalize attention-surface target fields so they can restore:
  - Explicitly state that workspace-tab selection, panel docking, and per-project layout restore are shell-state concerns layered underneath canonical routing.
  - 1. restore `project_id`
  - project_id
  - 3. restore destination class from `target_kind`
  - target_kind
  - artifact-backed restore resolves to transient `generated://<artifact_id>` buffers
  - generated://<artifact_id>
  - `preview_subject_id` gives a strong subject-first restore identity
  - preview_subject_id
  - Preview restore identity is subject-first, while the broader route/open owner docs still do not define the named route/open primitives that would explain it consistently.
  - subject-first restore identity
  - `[retired-token-1]` through `[retired-token-3]` are now audit-stable; further broad sweeps are low yield. The only notable caution is that `[retired-token-2]` still carries a live `[retired-token-4]` contradiction in addition to missing structural headings.
  - [retired-token-1]
  - [retired-token-3]
  - [retired-token-2]
  - [retired-token-4]
  - This invocation kept the blocker-family count at eight and the affected-doc count at twenty, removed the overstated `[retired-token-4]` contradiction from `[retired-token-2]`, added exact broken-anchor evidence to `[retired-token-5]` and `[retired-token-6]`, and raised the underlying evidence count to sixty-two.
  - [retired-token-5]
  - [retired-token-6]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section defines fileSafe Action Mapping and Persistence.

### Shared runtime fields
FileSafe blocked payloads MUST use the canonical blocked payload:
- `blocked_reason_code = filesafe_blocked`
- `allowed_action_ids[]`
- `preserved_local_work`
- `requires_safe_point_restore?`
- `detail_ref?`

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Shared vs local actions
Shared runtime action IDs remain the canonical recovery families. Labels such as `Approve and add to allowlist` and `Edit and retry` are FileSafe-local affordances layered on top of shared actions and metadata. They are not new shared runtime action IDs unless the global action enum explicitly adopts them.

Required rules:
- runtime-facing FileSafe blocks use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`
- `recovery_options[]` and `allowed_actions[]` are not canonical shared runtime fields
- child runs blocked by FileSafe remain child runs with canonical lineage and status history
- rerun and restore behavior must preserve canonical child/run/worktree identities

### Restore override
`filesafe_blocked` is not retryable by default.

If a mutation-capable attempt performed local changes before the FileSafe block was finalized, the blocked projection MUST expose:
- `preserved_local_work = true`
- `requires_safe_point_restore = true`

When `requires_safe_point_restore = true`, the only legal rerun path is `restore_safe_point_then_retry`.

### Persistence
A FileSafe block is a persistent blocked runtime episode until resolved or superseded.

Context-shaping and handoff rule:
- FileSafe does not define alternate child continuity or alternate memory behavior.
- any rerun or restore after FileSafe denial uses canonical handoff reconstruction.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
