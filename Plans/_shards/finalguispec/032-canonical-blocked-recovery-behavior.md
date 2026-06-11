# Shard 032: Canonical Blocked/Recovery Behavior

Source: `Plans/FinalGUISpec.md`

Source lines: L2948-L2994

Source SHA256: `e7d74c518f43fb85d1bcb78c9f41c6ecf73d29086b5c1f37693b3c4ed79ecdd2`

---

## Canonical Blocked/Recovery Behavior
This section is the canonical GUI summary for blocked and recovery surfaces.

### Dashboard Action Required
Blocked and recovery UI binds to canonical blocked projections and HITL records.
- `wizard_blocked` is a first-class card alongside `wizard_attention_required`
- blocked cards use the fields `card_type`, `wizard_id`, `wizard_step`, `blocked_reason_code`, `report_ref`, `resume_url`, and optional `thread_id`
- `wizard_blocked` uses more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`
- blocked payloads use ordered `allowed_action_ids[]`
- blocked episodes remain distinct when more than one is active
- GUI labels may vary by surface, but command binding always resolves through the shared runtime command catalog
- Blocked and attention-required remain distinct; `wizard-blocked` cards outrank `wizard-attention-required`, thread badges preserve highest severity and blocked counts, usage warnings preserve thresholds, quiet periods, and clear actions, and all-nodes-blocked can escalate by elapsed time.

### Thread and run status taxonomy
`waiting_approval` and other blocked reasons are runtime overlays, not replacement run-graph lifecycle states.
- lifecycle remains the graph-progress contract
- blocked, backoff, retry, remediation, and approval-pending are rendered from runtime projections
- requested vs effective persona/platform/model remains visible where runtime substitution occurred

### Scope rule
The GUI does not synthesize alternate blocked schemas, alternate action arrays, or alternate retry classes for specific surfaces.

The shared blocked/remediation taxonomy preserves actor-specific state machines and object identities: assistant, interview/builder, runtime, and Orchestrator actors consume common blocked fields without collapsing their lifecycle models.

### Visual distinction
- blocked episodes are visually distinct from ordinary paused/idle states
- multiple simultaneous blocked episodes show per-episode controls and a count summary where appropriate
- remediation-ceiling-exceeded and validation-blocked use the same blocked-payload contract as other blocked episodes rather than bespoke one-off UI treatment

### Runtime state presentation
Scheduler surfaces MUST visually distinguish:
- blocked waiting for prerequisite or approval
- retrying/backoff
- remediation in progress
- terminal failure

### Recovery UX rules
- safe points are runtime recovery anchors and MUST NOT be presented as user-facing restore points
- retry controls MUST distinguish `Retry from safe point` from `Start fresh attempt`
- if no valid safe point exists, `Retry from safe point` is disabled with an explanation
- Seam review outputs include a review verdict, failure classes with severity, evidence bundle/rationale, remediation-node or graph-patch recommendations, and corroboration requirement/outcome when invoked.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md
