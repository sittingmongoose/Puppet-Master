# Shard 043: Shared runtime immutable-dispatch binding (2026-08-13)

Source: `Plans/FileSafe.md`

Source lines: L14658-L14741

Source SHA256: `6f8c0184cdefccfaa9c955baf7cb1f1bf7b433ccf7cfdcb7f1608d506597d94a`

---

## Shared runtime immutable-dispatch binding (2026-08-13)

For mutation-capable provider work, FileSafe evaluates the exact mutation evidence
derived from the same immutable finalized provider-request bytes, attachment
manifest bytes/hash/ref, route, effective account, Host/Environment, operation,
attempt, run/node lineage, existing Packet Admission decision, host-local
resource admission, and
generation set consumed by `ProviderDispatchAdmissionService`. The provider
receipt stores refs to existing FileSafe receipts; this addendum creates no
`FileSafeGuardReceipt`, packet receipt, immutable-intent family, or peer FileSafe
authority.

FileSafe and dispatch admission remain independent and compose by intersection.
FileSafe approval cannot issue a provider permit, and a permit cannot authorize a
path or mutation. Any post-gate byte, attachment, route, account, target, policy,
permission, topology, or mutation-evidence change invalidates the dispatch receipt
and requires FileSafe reevaluation wherever the mutation evidence changed. Raw
file contents, raw provider request bytes, secrets, credentials, and protected
`AuthBrowserSession` material are never copied into shared-runtime records.

### F2-208 - Provider Dispatch Independent FileSafe Co-Binding

```yaml
plan_unit_id: F2-208
unit_type: security_contract
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Mutation-capable provider dispatch is independently co-bound to existing
  FileSafe receipt refs over the exact finalized mutation evidence; dispatch
  admission cannot replace FileSafe, FileSafe cannot issue a permit, and any
  relevant post-gate change invalidates the dispatch evidence before network send.
gui_related: false
depends_on: [F2-199, CV-325, PS-134, SIR-009]
unblocks: []
acceptance_criteria:
  - Mutation-capable ProviderDispatchAdmissionReceipt values carry at least one existing FileSafe receipt ref.
  - FileSafe receipts and the dispatch receipt bind the same finalized request hash and exact mutation-affecting identities by reference.
  - Any relevant byte, attachment, route, account, target, policy, permission, topology, or mutation-evidence change invalidates prior dispatch evidence.
  - The structured attachment manifest has an exact hash and artifact ref and is never embedded as raw attachment bytes.
  - No new FileSafe receipt family or shared replacement for FileSafe authority is introduced.
validation_surfaces:
  - future immutable-byte/FileSafe co-binding fixtures
  - future post-gate mutation and no-bypass negative fixtures
risk_class: filesafe_provider_dispatch_bypass
reasoning_tier: high
context_scope: provider_dispatch_filesafe_cobinding
implementation_surfaces: [Plans/FileSafe.md, Plans/shared_runtime_contracts.schema.json]
node_compile_hint: {mode: provider_dispatch_filesafe_cobinding, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not mint FileSafeGuardReceipt, PacketAdmissionReceipt, or ImmutableDispatchIntent.
  - Do not embed raw bytes, paths, secrets, or file contents in shared-runtime records.
owner_hints: [Plans/FileSafe.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-012]'
```

### F2-209 - Protected Auth Browser File And Artifact Denial

```yaml
plan_unit_id: F2-209
unit_type: security_constraint
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: Protected AuthBrowserSession cannot be the source or target of save, export, storage/profile copy, screenshot, recording, artifact, attachment, Chat ingestion, DOM/PageRepresentation, console, network, download/upload automation, clipboard automation, or filesystem mutation. FileSafe rejects protected_auth before path or mutation evaluation and records only redacted denial/lifecycle evidence.
gui_related: false
depends_on: [F2-208, SMPFS-143]
unblocks: []
acceptance_criteria:
  - Every filesystem, attachment, artifact, capture, storage/profile, and Chat path requires an ordinary browser subject.
  - Protected-session rejection occurs before target/path expansion and leaks no URL, title, content, selector, credential, or local path.
  - A permission, approval, lease, provider receipt, or ordinary-browser grant cannot override this structural denial.
validation_surfaces: [protected AuthBrowser FileSafe negative fixtures]
risk_class: protected_auth_browser_filesystem_escape
reasoning_tier: high
context_scope: protected_authbrowser_filesafe
implementation_surfaces: [Plans/FileSafe.md, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: protected_authbrowser_filesafe_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
negative_constraints: [Do not let any ordinary approval override protected_auth denial., Do not evaluate or disclose protected paths/content.]
```
