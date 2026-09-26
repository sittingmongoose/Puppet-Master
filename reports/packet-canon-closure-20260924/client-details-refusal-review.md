# Client details local refusal boundary

Status: root review; independent review pending. Snapshot `cb8ebd628`.

Exact scope: `touch_closure_dimensions` identities
`TOUCH-SGAPLOCAL-019/disposition_and_residual_risk` and
`TOUCH-SGAPLOCAL-019/payload_result_error_availability_permissions_disabled_reason`
from immutable matrix `141e43ff3a8c79ed19866823969732ef5dc1370597f17d0fbf6e2cb368b5b587`.
Both concern `ui.client.open_details`, not the four ClientTrust domain commands.

Current Server owner SRV-011 retains a bounded redacted local projection with
an owner-local controller, no domain handler and no domain EventRecord. Its
request binds projection identity, expected generation and exact return context.
Its closed `ClientTrustLocalActionResult` has success presentation fields but
no status, error, disabled reason or refusal alternative. The Touch profile
TCP-CLIENT-TRUST-LOCAL nevertheless names that success-only result as its
`error_schema_ref` and requires visible currentness/controller refusal rather
than simulated success. This is a typed settlement gap, not evidence that a
native controller has failed.

The existing domain `ClientTrustCommandError` and availability records are
bound to `ClientTrustCommandId`, which excludes the local action. The generic
CV-333 response contains error vocabulary including `stale_projection` and
`handler_unavailable`, but its `CommandId` accepts only `cmd.*`. Its
`local_projection` branch requires that command ID. Therefore naming the
generic dispatcher error does not alone establish a complete typed envelope
for this `ui.*` action. This does not justify registering a new domain command,
loosening the central command identity pattern, or duplicating domain errors.

A bounded repair should compose a local refusal/result and exact initiating
context with the retained request, keeping all mutation/handler/event claims
false. It must prove stale or missing projection/controller failure cannot
be reported as successful details and cannot return to another caller. No new
permission policy, persistence, work operation, event or domain handler is
required by this finding. Independent review must confirm the owner mapping
and any existing applicable local carrier before authoring.

Inspected sources: `Plans/Server_System.md` trusted Client management section
and SRV-011; `Plans/server_system_contracts.schema.json` definitions
ClientTrustLocalActionRequest, ClientTrustLocalActionResult,
ClientTrustReturnContext, ClientTrustCommandError and
ClientTrustCommandAvailability; `Plans/touch_closure.json` TCP-CLIENT-TRUST-LOCAL;
`Plans/Contracts_V0.md` UICommandResponse/CV-333; and
`Plans/ui_command_response.schema.json` CommandId and local_projection branch.

No matrix credit, canonical edit, native execution or closure claim is made.
