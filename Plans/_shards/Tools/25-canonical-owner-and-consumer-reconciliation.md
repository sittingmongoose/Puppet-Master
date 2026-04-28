## Canonical owner and consumer reconciliation

Tools are defined SSOT in this document. Consumers in other surfaces (UI, CLI, Help, Permissions) reference this document rather than restating tool definitions.

### Consumer propagation

#### Acceptance carry-through
- Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- Under `## Canonical owner and consumer reconciliation` -> `### Consumer propagation`, blocked surfaces must not stop at `blocked_family` plus `allowed_action_ids[]`.
- Consumer propagation must carry `escalation_level`, `action_available` ownership, and usage observability through blocked_notice handling.
- If `allowed_action_ids[]` remains in this subsection, it must be explicitly subordinate to the richer blocked_notice contract rather than the complete surface definition.

### Required data shape

#### Acceptance carry-through
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- Under `## Canonical owner and consumer reconciliation` -> `### Required data shape`, define one attribution family shared across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors together with execution/runtime identity fields in the tool record shape.
- Transfer `execution_role`, `requested_account_id`, `operational_identity`, account-switch ownership, pressure ownership, `blocked_sequence` minting, startup recovery handshake, and DAE jail/approval policy into the owner/consumer contract.
- Require usage switch-history and usage execution-role follow-through in the same reconciled owner data shape.
