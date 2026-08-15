# Remaining Runtime Integration — PNC/Event Authority handoff

Status: `EXCLUDED_NOT_ADJUDICATED`

This handoff records observations only. The canon-closure wave did not run,
modify, activate, register, or adjudicate PNC-019/Event Authority; it did not
advance a checkpoint or add an EventRecord family.

## Exact owner-lane observations

1. Production wiring has exactly 27 receipt/projection-only entries that carry
   `missing_event_registration`, `expected_event_types: []`, and a negative
   requirement against emitting an unregistered EventRecord:

   - `cmd.remote.reconnect` (exact-environment compatibility wrapper)
   - `cmd.environment.connect`, `cmd.environment.reconnect`, `cmd.environment.disconnect`
   - `cmd.thread.outbox.retry`, `cmd.thread.outbox.cancel`, `cmd.thread.request`, `cmd.thread.spawn`, `cmd.thread.await`
   - `cmd.capability.ensure`, `cmd.tool.discover`, `cmd.tool.select`
   - `cmd.installation.install`, `cmd.installation.update`, `cmd.installation.repair`, `cmd.installation.rollback`, `cmd.installation.verify`
   - `cmd.authentication.start`, `cmd.authentication.cancel`, `cmd.authentication.resume`
   - `cmd.eval.session.start`, `cmd.eval.session.execute`, `cmd.eval.session.stop`
   - `cmd.mcp.server.connect`, `cmd.mcp.server.reconnect`
   - `cmd.resource.inspect`, `cmd.bsd.set`

   This wave closed command request/result/error/cancel/idempotency schemas and
   preserved those event-neutral effects. Event Authority must decide each
   persisted-event need individually; a bulk registration is not authorized.

2. `cmd.chat.compact_context` has an owner conflict that belongs wholly to this
   lane. `UI_Command_Catalog.md` and `assistant-chat-design.md` name
   `context.compaction.started`, `context.compaction.completed`, and
   `context.compaction.failed`; production wiring declares no persisted event and
   requires a no-persist dispatch receipt. The PNC owner must choose one coherent
   disposition, materialize any admitted payload/producer/consumer/checkpoint
   depth, and update Catalog, Chat, production Wiring, registry, and tests
   atomically. This canon-closure wave intentionally did not choose for that owner.

3. New closed value contracts may contain `event_refs` or `source_event_refs`, but
   those fields do not admit event names. Empty arrays and admitted existing refs
   are valid; an unknown name remains quarantined.

4. The non-PNC storage registry is now structurally `84 total / 66 materialized /
   17 deferred / 1 compatibility alias`. Any PNC/readiness script retaining an
   older fixed denominator is stale, but this handoff does not authorize changing
   it before the PNC owner reopens and reconciles its own currentness inputs.

5. The disposition register is now schema v2: all 163 rows are canon-classified,
   all 163 implementation states are `not_started`, and no runtime evidence is
   claimed. PNC logic must not reinterpret `canon_closed` as an admitted event,
   WorkNode, executable implementation, buildability, or certification proof.

6. The standard `validate-case-l-non-event-materialization` wrapper still invokes
   the protected PNC/readiness owner `scripts/pm-implementation-readiness.py` and
   reports nine stale-assumption failures. It expects the old two-definition
   recovery sidecar, validates detached definitions without their local `$defs`,
   and compares the old partially inlined migration-receipt shape. The current
   task-owned recovery validator passes 22/22 cases, including the corrected rule
   that a no-space blocked preflight emits no terminal receipt while a terminal
   blocked receipt requires an earlier `ready` preflight. Reconcile the protected
   wrapper with the exact transitive receipt bundle after this lane reopens; do
   not weaken or roll back the owner schema to satisfy the stale checker.

## Exact next action for the PNC owner

Reopen the current Event Authority denominator and contract-depth evidence; decide
the Compact Now event/no-persist conflict; adjudicate the 27 command effects
individually; reconcile the protected readiness/Case-L validator with the current
storage denominator and transitive receipt bundle; update registry/currentness
evidence under that lane's own gates; and publish a stable completion marker.
Until that happens, keep every listed command receipt-only and keep global
governance seal work paused.
