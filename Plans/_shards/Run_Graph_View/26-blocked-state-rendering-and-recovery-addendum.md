## Blocked-State Rendering and Recovery Addendum

### Field name correction

All references to `allowed_actions[]` in this document are replaced by the canonical field name `allowed_action_ids[]`. The deprecated name `allowed_actions[]` MUST NOT be used in new content.

ContractRef: ContractName:Plans/Contracts_V0.md

### Node badge blocked-state rendering

| State | Badge Color | Icon | Label |
|-------|-------------|------|-------|
| `attention_required` | Amber | Warning triangle | "Needs input" |
| `blocked` | Red | Stop circle | "Blocked" |
| `waiting_approval` | Blue | User badge | "Awaiting approval" |

These three states MUST be visually distinct.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

### Concurrent blocked node list

When multiple nodes are blocked simultaneously, the detail panel sidebar MUST provide a scrollable blocked-node list:

1. Sorted by `blocked_sequence` descending (most recently blocked first).
2. Each item shows: node name, `blocked_reason_code` label, time since blocked.
3. Clicking an item selects the node and shows its full detail panel.
4. The list updates in real time as nodes are blocked/unblocked.

### Remediation ceiling exceeded rendering

When a node is blocked with `blocked_reason_code: remediation_ceiling_exceeded`:

1. The node detail panel shows a red "Remediation limit reached" banner.
2. The remediation lineage tree (all generations) remains visible below the banner.
3. Available recovery action buttons: Replan, Manual fix, Abort node.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md
