# Shard 022: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/00-plans-index.md`

Source lines: L5012-L5261

Source SHA256: `e45160a3bfdc59333e3ba09e8f54016d7df5fa000e8cb7280e2fb5addd786617`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. The ordinary compile did not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal; the later explicit seal phase refreshed generated governance/provenance artifacts without creating runtime or build artifacts.

### 0PI-066 - 0PI-066

```yaml
plan_unit_id: 0PI-066
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The external repo system-wide improvement import from pldg-20260703-001-feature-intake is routed to existing Puppet Master subsystem owners plus the new Release_Supply_Chain owner for release/install/provenance gaps. The compile preserves GUI-first/no-PM-CLI constraints, treats terminal/CLI lessons as GUI-native runtime/provider/tool/context/agent-control contracts, keeps imported rows source-lineage-backed rather than ledger-canonical, and creates no WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks during ordinary compile; the later explicit governance seal refreshes only generated governance/provenance artifacts.
gui_related: false
gui_classification_reason: Index owner-routing metadata, not direct GUI implementation.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- All 113 imported external repo rows and 5 import guardrails have a compiled PlanUnit or existing PlanUnit disposition.
- The 12 rows that arrived with empty target_docs are owner-adjudicated without asking row-by-row.
- Terminal lessons remain GUI-terminal/runtime contracts, not a Puppet Master CLI product surface.
- Only live Plans docs and allowed Plans/.plan_index outputs are changed during ordinary compile; the later explicit governance seal refreshes generated governance/provenance artifacts only.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- git diff --check
risk_class: owner_map_drift
reasoning_tier: high
context_scope: external_repo_system_wide_compile_owner_map
implementation_surfaces:
- Plans/00-plans-index.md
- Plans/00-plans-index.md
- Plans/Automated_Testing_System.md
- Plans/BinaryLocator_Spec.md
- Plans/CLI_Bridged_Providers.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/Plugins_System.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Release_Supply_Chain.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/storage-plan.md
- Plans/usage-feature.md
node_compile_hint:
  mode: external_repo_system_wide_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/current.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/handoff.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/import_completion_recheck_20260703.json
source_atom_ids:
- atom-0001
- atom-0002
- atom-0003
- atom-0004
- atom-0005
- atom-0006
- atom-0007
- atom-0008
- atom-0009
- atom-0010
- atom-0011
- atom-0012
- atom-0013
- atom-0014
- atom-0015
- atom-0016
- atom-0017
- atom-0018
- atom-0019
- atom-0020
- atom-0021
- atom-0022
- atom-0023
- atom-0024
- atom-0025
- atom-0026
- atom-0027
- atom-0028
- atom-0029
- atom-0030
- atom-0031
- atom-0032
- atom-0033
- atom-0034
- atom-0035
- atom-0036
- atom-0037
- atom-0038
- atom-0039
- atom-0040
- atom-0041
- atom-0042
- atom-0043
- atom-0044
- atom-0045
- atom-0046
- atom-0047
- atom-0048
- atom-0049
- atom-0050
- atom-0051
- atom-0052
- atom-0053
- atom-0054
- atom-0055
- atom-0056
- atom-0057
- atom-0058
- atom-0059
- atom-0060
- atom-0061
- atom-0062
- atom-0063
- atom-0064
- atom-0065
- atom-0066
- atom-0067
- atom-0068
- atom-0069
- atom-0070
- atom-0071
- atom-0072
- atom-0073
- atom-0074
- atom-0075
- atom-0076
- atom-0077
- atom-0078
- atom-0079
- atom-0080
- atom-0081
- atom-0082
- atom-0083
- atom-0084
- atom-0085
- atom-0086
- atom-0087
- atom-0088
- atom-0089
- atom-0090
- atom-0091
- atom-0092
- atom-0093
- atom-0094
- atom-0095
- atom-0096
- atom-0097
- atom-0098
- atom-0099
- atom-0100
- atom-0101
- atom-0102
- atom-0103
- atom-0104
- atom-0105
- atom-0106
- atom-0107
- atom-0108
- atom-0109
- atom-0110
- atom-0111
- atom-0112
- atom-0113
- atom-0114
- atom-0115
- atom-0116
- atom-0117
- atom-0118
- atom-0119
- atom-0120
- atom-0121
- atom-0122
decision_refs:
- dec-0002
- dec-0003
- dec-0004
preserved_exact_tokens:
- OpenCode v1/dev/beta
- OpenCode v2 specs
- Cline
- Agent Zero
- Pi
- OpenAI Codex
- Ghostty
- Warp
- tmux
- GUI-first
- not building a CLI
- ContextEpoch
- ProviderCapabilityEpoch
- ToolTurnSettlement
- AgentControlEnvelope
- TerminalBackpressureState
- Command approval is a GUI-visible lease
negative_constraints:
- Do not translate terminal/CLI lessons into a Puppet Master CLI product shape.
- Do not collapse the 113 imported rows into a vague summary.
- Do not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs during ordinary compile; refresh governance outputs only in an explicit seal phase.
owner_hints:
- Plans/00-plans-index.md
- Plans/Automated_Testing_System.md
- Plans/BinaryLocator_Spec.md
- Plans/CLI_Bridged_Providers.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/Plugins_System.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Release_Supply_Chain.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/storage-plan.md
- Plans/usage-feature.md
```
