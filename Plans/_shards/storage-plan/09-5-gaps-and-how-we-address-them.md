## 5. Gaps and how we address them

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0648
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Event-schema precision gaps are wider than the earlier passes suggested:
  - once the remaining structural owner gaps above are explicitly assigned/resolved
  - Close the runtime-governance owner gaps:
  - Runtime-governance closeout sharpened a few final owner gaps:
  - `newtools.md` and assistant-memory still ended with unresolved canonicalization gaps:
  - newtools.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The remaining persistence gaps for the rewrite shell are addressed by explicit owner-aligned state instead of feature-local ad hoc blobs.

### 5.1 Unsaved editor recovery is required, not optional

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0658
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - optional effective persona/platform/model
  - optional disclosure fields
  - `effective_provider_identity` / `provider_identity` / `effective_project_id` are already treated as optional non-secret disclosure fields. That makes them the wrong place to encode actor role or side-effect target identity.
  - effective_provider_identity
  - provider_identity
  - effective_project_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Rules:
- recover-unsaved is required MVP behavior for local and remote-backed buffers
- recovery snapshots store local buffer state, capture metadata, host/path identity, and write availability at capture time
- remote-backed recovery banners must say `Recovered local edits — remote destination not yet synchronized`
- save success is only claimed after the effective destination confirms the write

Implementation spec:
- key: `editor_state.v1:{project_id}:{file_path_hash}`
- stores: cursor position, scroll offset, selection ranges, undo stack reference, and unsaved changes flag
- recovery trigger: on session restore, reload each open editor's state before restoring focus
- conflict handling: if the file changed on disk since the last save, show a diff and let the user choose how to resolve the mismatch

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 5.2 Requested vs effective runtime state must remain visible

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0659
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - runtime blocked reasons like `dirty_worktree` and `worktree_conflict` remain runtime truth, not Source Control-local statuses
  - dirty_worktree
  - worktree_conflict
  - `dirty_worktree` and `worktree_conflict` are canonical blocked reasons and must remain visible in both surfaces without becoming generic SCM errors.
  - historical lineage must remain visible even when live targets disappear
  - `Requested model: claude/sonnet`
  - Requested model: claude/sonnet
  - `Effective model: claude/sonnet`
  - Effective model: claude/sonnet
  - `Reasoning effort: requested high -> skipped`
  - Reasoning effort: requested high -> skipped
  - effective platform/model/variant/auth/account
  - requested and honored exactly
  - requested and clamped
  - requested and skipped
  - not requested at all
  - effective account/auth emphasis, with project-policy and manual-preferred-account source disclosure where relevant
  - effective: what runtime actually used
  - effective runtime result
  - requested vs effective runtime identity
  - If any of those hold, the object should remain `retained`, `suspect`, or `restoring`, not `cleanup_eligible`.
  - retained
  - suspect
  - restoring
  - cleanup_eligible
  - derived exports stay useful, but they must remain visibly derived
  - Sonnet sharpened the identity problem from "requested vs effective is missing" to a more specific structural asymmetry:
  - `preferred` concrete-account requests should remain visible even when runtime legitimately switches away
  - preferred
  - but they do not make the requested vs effective operational identity visible as first-class runtime truth
  - Concern/corroboration/promotion objects remain absent from core runtime protocols.
  - `storage-plan.md` still has both `attempt_record` and `tier_runtime_record`. That may remain acceptable, but only if `tier_runtime_record` becomes clearly derived/view-oriented rather than the place where runtime identity hides.
  - storage-plan.md
  - attempt_record
  - tier_runtime_record
  - `orchestrator-subagent-integration.md` is now sharper than earlier passes suggested: `TierContext` declares runtime identity fields that its own constructor never populates, while active coordination/hook structs remain fully tier-rooted and cannot be joined losslessly to attempt/worktree/permission/runtime records.
  - orchestrator-subagent-integration.md
  - TierContext
  - runtime identity parity and routing-key correctness remain visibly incomplete.
  - Structural owner docs remain actively unsafe:
  - `yolo` is still overstated as approval-free even though non-bypassable step-7 guards remain in force.
  - yolo
  - Make destination-local state reuse conditional on not obscuring the requested target.
  - Domain mutation/runtime commands remain separate again. They act on canonical runtime or domain identity and are not just navigation with a side effect.
  - If graph-local wrappers remain for UX readability, their normalization target and arg derivation must be explicit and consistent with `cmd.runtime.approve` / `cmd.runtime.decline`.
  - cmd.runtime.approve
  - cmd.runtime.decline
  - requested vs effective identity is called out later
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The persistence model stores enough context to reconstruct effective behavior honestly after restart.

Required stored distinctions:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement and attached-server set
- freshness vs health vs write availability for remote-backed projections
- restore outcome for historical Search, LSP, browser, and editor recovery surfaces

Implementation spec:
- key patterns: `{resource_type}_requested.v1:{scope}:{id}` and `{resource_type}_effective.v1:{scope}:{id}`
- requested state is what the user or system asked for; effective state is what actually applies after resolution
- projection freshness is persisted as `current`, `refreshing`, or `stale`
- `current` means just resolved, `refreshing` means re-resolution is in progress, and `stale` means the projection needs refresh before it should be treated as current

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md

### 5.3 Search and Source Control keep separate projection state

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0660
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Search results should not merely highlight text.
  - If there is no explicit relationship, runs should appear as separate entries only.
  - Keep `projects:v1` narrow:
  - projects:v1
  - Keep `account_switch_reason` on effective/runtime snapshots as the current-run disclosure field.
  - account_switch_reason
  - keep `effective_provider_identity` and `provider_identity` exactly what they already are:
  - effective_provider_identity
  - provider_identity
  - they must not invent separate artifact-local identity
  - keep `OpenFile { path... }` for canonical workspace-file opens
  - OpenFile { path... }
  - Search, attention, and usage/artifact pivots all preserve useful local identity, but they still do so in separate feature-specific ways rather than through a shared route-target model.
  - keep the canonical target object small
  - Keep line/range under `OpenFile`.
  - OpenFile
  - Keep wrapper metadata contract-level and narrow:
  - Keep `OpenFile` separate and narrow:
  - Keep blocked-episode identity explicit:
  - keep `OpenFile` narrow
  - Keep `OpenFile` strictly path/editor scoped.
  - keep `WiringEntry` after them
  - WiringEntry
  - Reconcile `allowed_actions[]` versus `allowed_action_ids[]` language so owner docs do not keep teaching two peer action vocabularies.
  - allowed_actions[]
  - allowed_action_ids[]
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Rules:
- Search state stores text query intent and query snapshots
- Source Control state stores repo projections, compare origins, and review context
- diff-local search does not get persisted as project Search state
- editor markers consume Source Control/LSP projections but do not become a substitute owner

Implementation spec:
- keys: `search_projection.v1:{project_id}` and `sc_projection.v1:{project_id}`
- Search projection stores last query, results, filter state, and scope
- Source Control projection stores branch, diff state, staged files, and commit message draft
- editor markers consume these projections but do not own them

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 5.4 Host-aware LSP persistence and restart behavior
Rules:
- LSP lifecycle and restart budgets are persisted by host-aware session key
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable
- remote-mode projects never restore into a silent local fallback path

Implementation spec:
- key: `lsp_server_state.v1:{host_id}:{server_id}:{root_hash}`
- stores: server config, capabilities snapshot, last known status, and restart count
- recovery path: on session restore, restart LSP servers using the persisted config
- persisted restart counts survive reconnects so budget enforcement and degraded-state disclosure remain stable after restart

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

