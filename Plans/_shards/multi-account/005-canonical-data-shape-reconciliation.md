# Shard 005: Canonical data-shape reconciliation

Source: `Plans/Multi-Account.md`

Source lines: L80-L107

Source SHA256: `bbbb3f95b27e904ffc3172fe6d2bcaf876fe0d6c888961f8f11319923d1b762d`

---

## Canonical data-shape reconciliation

This section owns the canonical requested/effective account identity contract for all provider-using actors.

### Required data shape

Every runtime, bridged-provider, and permission-facing envelope that carries account identity must preserve:
- `requested_account_id`
- `requested_account_policy`
- `requested_account_binding`
- `effective_account_id`
- `effective_provider_identity`
- `execution_role`
- `operational_identity`

Rules:
- Add `requested_account_id` alongside `requested_account_policy`.
- Add `requested_account_binding` and govern `provider_account_id` as subordinate provider-native metadata.
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes.
- Retire `provider_account_id` from canonical account-identity naming; keep it only as provider-native metadata that shadows the effective provider handle.
- `requested_account_binding` remains the canonical selector for `none`, `preferred`, or `required` fallback behavior.

#### Shared actor/runtime boundary
- Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator.
- They remain distinct actor/run kinds rather than package/seam/node execution objects.
- Cross-surface consumers may reuse the same requested/effective identity envelope, but they must preserve actor kind and execution context instead of collapsing everything into orchestration-only terms.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md
