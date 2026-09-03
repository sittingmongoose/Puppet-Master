# Shard 012: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1557-L1639

Source SHA256: `53d1d3779e9c3f41567c015b7e879c5d021cc372a690db9bfeb6813495145459`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### CBP-024 - P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE

```yaml
plan_unit_id: CBP-024
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE (P1) is compiled as canonical Puppet Master intent for CLI/server/extension protocol compatibility: Add BridgeHandshakeReceipt: protocol version, binary hash, provider version, shell/terminal mode pre/post, cwd, capabilities, keepalive, timeout policy. The preserved PM gap/delta is: Need version/capability handshake and terminal-mode restore around all CLI bridges. The observed external-repo signal remains source-lineage evidence: Agent Zero CLI/server mismatch produced terminal corruption, false code-exec status, timeout, orphan, and cooked-mode issues; Cline CLI package/version issues and codesigning failures; Codex CLI releases patch platform/sandbox/proxy behavior.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Version mismatch blocks before raw protocol noise hits terminal.
- Bridge restores cooked mode/echo on crash or timeout.
- Orphan process cleanup receipts written.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Version mismatch blocks before raw protocol noise hits terminal.
- Bridge restores cooked mode/echo on crash or timeout.
- Orphan process cleanup receipts written.
risk_class: p1_cross_system_runtime_contracts_hardening
reasoning_tier: standard
context_scope: cross_system_runtime_contracts
implementation_surfaces:
- Plans/CLI_Bridged_Providers.md
- Plans/Tools.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p1_cli_bridge_protocol_handshake
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0020
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0020
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0016/P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE@line=16
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0016/P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:16
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0020
external_atom_id: extrepo-20260703-0016
source_row_id: P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE
priority: P1
finding_family: CLI/server/extension protocol compatibility
source_repos:
- agent0ai/agent-zero
- cline/cline
- openai/codex
target_docs:
- Plans/CLI_Bridged_Providers.md
- Plans/Tools.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/CLI_Bridged_Providers.md
- Plans/Tools.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0016
- P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE
- P1
- CLI/server/extension protocol compatibility
- agent0ai/agent-zero
- cline/cline
- openai/codex
negative_constraints: []
observed_signal: Agent Zero CLI/server mismatch produced terminal corruption, false code-exec status, timeout, orphan, and cooked-mode issues; Cline CLI package/version issues and codesigning failures; Codex CLI releases patch platform/sandbox/proxy behavior.
pm_current_coverage: PM has CLI_Bridged_Providers and ProviderRequestEnvelope.
pm_gap_or_delta: Need version/capability handshake and terminal-mode restore around all CLI bridges.
proposal_or_recommendation: 'Add BridgeHandshakeReceipt: protocol version, binary hash, provider version, shell/terminal mode pre/post, cwd, capabilities, keepalive, timeout policy.'
compile_disposition: create_new_planunit
```
