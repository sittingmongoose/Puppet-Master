# Shard 028: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/storage-plan.md`

Source lines: L15185-L15280

Source SHA256: `77b03422fed794c3fcb807b815cba8455acdbccf8ab76d842f86a980735a9022`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### SP-217 - Discovery Index Persistence, Cache Identity, And History Boundaries

```yaml
plan_unit_id: SP-217
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns DiscoveryIndex persistence, cache identity, lifecycle state, and frecency/history boundaries for native DiscoveryService. Discovery indexes are scoped per project, worktree, and remote identity, with separate canonical_path_identity, identity_scope, display_path, normalization_profile, case_sensitivity, symlink_policy, cache_schema_version, ranking_policy_version, policy_hash, ignore_hash, identity_hash, source_manifest_generation, source_index_generation, and remote_identity when applicable. Warm, reindex, teardown, progress, health, stale, fallback, disabled, unsupported, over_budget, and backpressure states are persisted or projected without merging unrelated projects. Frecency/query/open history is on-device, user-scoped, and project/worktree-local by default; reset/disable controls stop future ranking use for the selected identity without deleting durable redacted discovery receipts by default.
gui_related: true
gui_classification_reason: This includes user-visible reset/disable behavior, display_path identity, freshness/fallback projection, and GUI score explanations.
depends_on: [PDS-003, PDS-005, SP-016, SP-017, SP-020, SP-188, SP-206, T-160]
unblocks: [SP-218, F3-399, ATS-011, RAP-031]
acceptance_criteria:
  - Cache keys separate project, worktree, branch, remote, and SSH identity variants.
  - Path identity, display path, normalization, case, and symlink policy are explicit in cached results and receipts.
  - Frecency/history reset or disable removes future ranking use for the selected identity while durable receipts remain under Runtime Artifacts retention/redaction policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future cache identity tests for schema/ranking/policy/ignore/identity/manifest changes.
  - Future frecency reset versus durable receipt retention tests.
risk_class: persistence_identity_drift
reasoning_tier: standard
context_scope: discovery_storage
implementation_surfaces: [Plans/storage-plan.md, future DiscoveryIndex, future Runtime Artifacts receipt store]
node_compile_hint: {mode: discovery_index_persistence, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0023
  - pldg-20260622-001-fff:atom-0024
  - pldg-20260622-001-fff:atom-0040
  - pldg-20260622-001-fff:atom-0042
  - pldg-20260622-001-fff:atom-0053
  - pldg-20260622-001-fff:atom-0062
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0082
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0086
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:state/precision_contract.json#cache_identity_contract_required_fields
  - pldg-20260622-001-fff:state/implementation_gap_defaults.json
source_atom_ids: [atom-0023, atom-0024, atom-0040, atom-0042, atom-0053, atom-0062, atom-0078, atom-0081, atom-0082, atom-0083, atom-0086, atom-0089]
preserved_exact_tokens: ["DiscoveryIndex", "canonical_path_identity", "identity_scope", "display_path", "normalization_profile", "case_sensitivity", "symlink_policy", "cache_schema_version", "ranking_policy_version", "policy_hash", "ignore_hash", "identity_hash", "source_manifest_generation", "source_index_generation", "project-local frecency", "reset/disable", "durable redacted discovery receipts"]
negative_constraints:
  - Do not persist frecency globally across unrelated projects by default.
  - Do not treat display_path as canonical identity.
  - Do not delete durable Runtime Artifacts receipts merely because Assistant Chat activity is hidden or frecency is reset.
owner_hints: [Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/assistant-chat-design.md]
```

### SP-218 - Remote SSH Discovery Manifest Cache And Verification Handoff

```yaml
plan_unit_id: SP-218
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Remote/cache/SSH discovery uses a local DiscoveryService plus SSH remote manifest adapter for MVP. The adapter uses Git-tracked file manifests such as git ls-files when available, or an allowed remote directory walk only inside the authorized remote project root, then normalizes, policy-filters, annotates, and indexes remote entries locally. Cache/index keys derive from normalized remote identity hashes including project_id, remote_kind, host alias or host fingerprint, user/account alias, remote_root, repo_id when available, branch/worktree ref, and index_generation, and must not include secrets or merge unrelated local paths. Exact verification for SSH results reads through the authorized remote identity/path or a provenance-equivalent remote cache entry; it must not verify an unrelated local checkout as if it were the SSH result.
gui_related: false
gui_classification_reason: This defines remote cache and SSH manifest persistence/verification authority, not GUI presentation.
depends_on: [SP-217, W-074, F2-191, PS-118]
unblocks: [ATS-011, GI-033]
acceptance_criteria:
  - SSH-backed project roots can discover candidates without requiring a local checkout.
  - Stale remote_cache or ssh_manifest fallback is explicitly disclosed and never reported as fresh remote truth.
  - Remote cache keys contain no credential or secret material.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future SSH project with no local checkout test.
  - Future stale remote cache and wrong-branch invalidation tests.
risk_class: remote_identity_drift
reasoning_tier: high
context_scope: remote_ssh_discovery_storage
implementation_surfaces: [Plans/storage-plan.md, future SSH remote manifest adapter, future DiscoveryIndex]
node_compile_hint: {mode: remote_manifest_cache_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0054
  - pldg-20260622-001-fff:atom-0061
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0070
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/precision_contract.json#ssh_topology
source_atom_ids: [atom-0054, atom-0061, atom-0069, atom-0070, atom-0079, atom-0083, atom-0085, atom-0091]
preserved_exact_tokens: ["local DiscoveryService plus SSH remote manifest adapter", "git ls-files", "authorized remote project root", "remote_identity", "host_alias_or_host_fingerprint", "credential_handle_ref without secret material", "remote_cache", "ssh_manifest", "no silent local substitution"]
negative_constraints:
  - Do not require a persistent PM remote daemon for MVP.
  - Do not silently fallback from SSH or remote projects to unrelated local filesystem paths.
  - Do not include secrets in cache keys, receipts, diagnostics, or prompts.
owner_hints: [Plans/storage-plan.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```
