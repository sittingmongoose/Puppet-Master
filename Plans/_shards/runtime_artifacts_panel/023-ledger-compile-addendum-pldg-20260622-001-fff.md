# Shard 023: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L965-L1010

Source SHA256: `7b67c3b77b9b01ff15f7d0ef2e1561c9a3c00add9b610c9d4128d52a4c920b7b`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### RAP-031 - Discovery Receipt Browsing, Redaction, And Retention Projection

```yaml
plan_unit_id: RAP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts may browse persisted discovery receipts, fallback summaries, selected opaque ids, redacted candidate counts, freshness/fallback/policy state, remote/SSH identity, permission snapshot, host trust state, elapsed/budget fields, and exact-verification links when receipt persistence is promoted. Runtime Artifacts consumes the DiscoveryService receipt envelope but does not own DiscoveryService behavior. Assistant Chat visibility settings never delete or hide durable audit receipts; frecency/history reset stops future ranking use for the selected identity without deleting durable redacted discovery receipts by default unless a separate retention/export/delete owner action applies.
gui_related: true
gui_classification_reason: This is user-visible receipt browsing, redaction, and artifact projection.
depends_on: [CV-291, SP-217, F2-191, PS-118, ACD-422]
unblocks: [ATS-011]
acceptance_criteria:
  - Discovery receipts remain browseable in Runtime Artifacts/audit views when persisted even if Assistant Chat routine inline activity is hidden.
  - Receipt browsing respects redaction_profile, policy_context, and permission_snapshot_id.
  - Discovery receipts link to exact verification receipts and final relevant summaries when available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Runtime Artifacts receipt browsing tests.
  - Future Assistant Chat inline display off but durable receipt available test.
risk_class: receipt_redaction_retention_drift
reasoning_tier: standard
context_scope: discovery_receipts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, future runtime artifact receipt browser]
node_compile_hint: {mode: receipt_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0067
  - pldg-20260622-001-fff:atom-0086
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#runtime_artifacts_and_audit
source_atom_ids: [atom-0043, atom-0045, atom-0058, atom-0063, atom-0067, atom-0086, atom-0090, atom-0093]
preserved_exact_tokens: ["discovery.invoked", "discovery.candidates_returned", "discovery.selected", "discovery.fallback", "discovery.verified", "candidate_count", "selected_result_ids", "redaction_profile", "permission_snapshot_id", "host trust state", "verification_receipt_ref", "Assistant Chat visibility settings never delete or hide durable audit receipts"]
negative_constraints:
  - Do not make Runtime Artifacts Panel the DiscoveryService behavior owner.
  - Do not bypass redaction.
  - Do not make hiding Assistant Chat routine activity delete durable receipts.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/assistant-chat-design.md]
```
