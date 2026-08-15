# Shard 013: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/MCP_Integration.md`

Source lines: L2031-L2116

Source SHA256: `207e8320910fd5d969dcb0c794981247d4b9d40a091019c193a6a1b57bdce257`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### MI-032 - P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT

```yaml
plan_unit_id: MI-032
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT (P1) is compiled as canonical Puppet Master intent for MCP and external agent config import with trust boundaries: Add ImportedToolConfigSource records: source app/file, hash, cwd resolution, permission default, secret redaction, first-run review. The preserved PM gap/delta is: Need config-import provenance and trust policy: imported MCP config is a suggestion, not automatically executable. The observed external-repo signal remains source-lineage evidence: Cline emphasizes MCP/plugins and `.clinerules`; Warp changelog says MCP servers detected from third-party agents become visible/spawnable and project MCP servers spawn from repo root; Codex docs expose MCP/skills/plugins surfaces.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Imported MCP server from `.claude`/Codex/Warp config defaults ask/disabled until reviewed.
- Relative command cwd is project-root only when explicitly resolved and shown.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Imported MCP server from `.claude`/Codex/Warp config defaults ask/disabled until reviewed.
- Relative command cwd is project-root only when explicitly resolved and shown.
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
node_compile_hint:
  mode: p1_mcp_and_third_party_config_import
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0017
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0017
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0013/P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT@line=13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0013/P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0017
external_atom_id: extrepo-20260703-0013
source_row_id: P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT
priority: P1
finding_family: MCP and external agent config import with trust boundaries
source_repos:
- cline/cline
- warpdotdev/warp
- agent0ai/agent-zero
- openai/codex
target_docs:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
owner_hints:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
preserved_exact_tokens:
- extrepo-20260703-0013
- P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT
- P1
- MCP and external agent config import with trust boundaries
- cline/cline
- warpdotdev/warp
- agent0ai/agent-zero
- openai/codex
negative_constraints: []
observed_signal: Cline emphasizes MCP/plugins and `.clinerules`; Warp changelog says MCP servers detected from third-party agents become visible/spawnable and project MCP servers spawn from repo root; Codex docs expose MCP/skills/plugins surfaces.
pm_current_coverage: PM has MCP Integration and central tool registry/permission model.
pm_gap_or_delta: 'Need config-import provenance and trust policy: imported MCP config is a suggestion, not automatically executable.'
proposal_or_recommendation: 'Add ImportedToolConfigSource records: source app/file, hash, cwd resolution, permission default, secret redaction, first-run review.'
compile_disposition: create_new_planunit
```
