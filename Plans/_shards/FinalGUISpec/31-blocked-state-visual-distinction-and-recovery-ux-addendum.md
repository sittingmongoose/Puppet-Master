## Blocked-State Visual Distinction and Recovery UX Addendum

### Blocked-state visual distinction

| State | Badge Color | Icon | Label Text | Tooltip |
|-------|-------------|------|------------|---------|  
| `attention_required` | Amber | Warning triangle | "Needs input" | "This step needs your input to continue. The system can still make progress on other steps." |
| `blocked` | Red | Stop circle | "Blocked" | "This step is blocked and cannot continue until you take action. All automatic retries are exhausted." |
| `waiting_approval` | Blue | User badge | "Awaiting approval" | "This step is waiting for your approval before proceeding with a sensitive operation." |

- `attention_required` and `blocked` MUST be visually distinct -- they represent different escalation levels.
- `attention_required` allows continued background work; `blocked` does not.
- Dashboard cards, thread badges, and Run Graph View node badges all use this canonical visual mapping.

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Concurrent blocked episodes

When multiple nodes are blocked simultaneously:

1. The dashboard MUST show a count badge (e.g., "3 blocked") on the run card.
2. Clicking the badge opens a filtered list of all currently blocked nodes, sorted by `blocked_sequence` descending (most recently blocked first).
3. Each list item shows: node name, `blocked_reason_code` label, time since blocked, and the primary `allowed_action_ids[]` as action buttons.
4. The user can expand any item to see full blocked detail (explanation, `detail_ref` contents, remediation lineage if applicable).
5. Multiple concurrent blocked episodes MUST NOT be collapsed into a single notification -- each blocked node is a distinct actionable item.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Graph_View.md

### Remediation ceiling exceeded UX

When the remediation generation count reaches the ceiling (default: 3 per Plans/Decision_Policy.md):

1. The node transitions to `blocked` with `blocked_reason_code: remediation_ceiling_exceeded`.
2. The Run Graph View displays a red "Remediation limit reached" banner on the node detail panel.
3. Available actions presented to the user:
   - **Replan** (`cmd.orchestrator.replan_node`): Trigger a graph replan that may restructure the node's dependencies.
   - **Manual fix** (`cmd.orchestrator.open_for_edit`): Open the relevant files for manual editing, then resume.
   - **Abort node** (`cmd.orchestrator.abort_node`): Mark the node as permanently failed and continue the run without it (if the graph allows).
4. The remediation lineage tree remains visible for diagnostic purposes.
5. No automatic retry is permitted after ceiling is reached.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Graph_View.md

### Degradation warning

When draft decomposition degrades from graph to flat sequencing (before canonical graph lock):

1. The UI displays an amber warning banner: "Plan simplified to sequential steps due to structural issues in the decomposition. Performance may be reduced."
2. The banner includes a "View details" link that shows the specific `graph_integrity` issues detected.
3. No user action is required -- the run continues with flat sequencing automatically.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/chain-wizard-flexibility.md

### All-nodes-blocked circuit breaker

If all runnable nodes in a run are simultaneously in blocked state:

1. After 10 minutes with no state change, the run emits `run.all_nodes_blocked_warning` and the UI shows a persistent amber banner: "All steps are blocked. Review blocked items to continue."
2. After 30 minutes with no state change, the run auto-pauses and emits `run.auto_paused` with reason `all_nodes_blocked_timeout`.
3. The user can resume at any time after resolving blocks.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md
