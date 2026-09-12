# Shard 031: ATS-048 — Existing Session and Bundle Command Bindings

Source: `Plans/Automated_Testing_System.md`

Source lines: L4286-L4371

Source SHA256: `3ffcbc949af16a26957ce9e08144b835fdbe55f6884a6a109320c4f56254b7b9`

---

## ATS-048 — Existing Session and Bundle Command Bindings

The four existing `cmd.testing.session.open`, `cmd.testing.session.watch`,
`cmd.testing.session.background`, `cmd.testing.session.redaction.inspect` commands
remain visible-session operations under ATS-009/ATS-025. The existing
`cmd.testing.export_bundle` remains a run-scoped export under ATS-025. Neither
family aliases the other, and none of these five commands is a TestCaptureService
capture lifecycle command. Their sole future handler routes remain, respectively,
`handlers::testing::session_open`, `handlers::testing::session_watch`,
`handlers::testing::session_background`, `handlers::testing::session_redaction_inspect`,
and `handlers::testing::export_bundle`. These names describe planned routes, not
implemented native functions.

`Plans/testing_session_command_contracts.schema.json` owns the closed
`TestingSessionCommandRequest`, `TestingSessionCommandResult`,
`TestingSessionCommandError`, and `TestingSessionCommandAvailability` definitions.
The request binds Project/Home Server/Host/Environment, optional source/thread,
paired run/attempt, topology generation, actor and permission snapshot,
initiating Client/session generation, expected currentness, and return context.
Session actions additionally bind the exact session revision and target generation;
Watch binds the stream generation. Export binds the exact run revision and a
non-empty frozen artifact selection (identity, version, content hash), FileSafe
plan, approved preview hash, bundle policy and redaction review. The run subject
must equal the context run. Repeated artifact identity with different versions is
not a valid selection. There is no implicit latest artifact or focused-session
substitution. References are metadata, never raw frames, credentials or file paths.

The owner re-resolves these bindings and all policy references at admission and
settlement. Caller-supplied references, hashes and booleans are not authorization.
Absent native handlers remain `handler_unavailable`; denied permission, stale
Client/currentness/topology/target/stream, unavailable sources, failed redaction,
protected-auth subjects and missing FileSafe approval fail closed. Background
changes only visible-session foreground disposition under its continuation policy:
it does not cancel a run or stop capture. Open/Watch/inspection do not change test
verdicts. All five result contracts prohibit capture-lifecycle mutation, verdict
mutation and protected-content exposure.

Idempotency reuses the shared command-idempotency definition, not the shared
runtime's closed command enum. The binding digest covers command, exact context,
subject, arguments, idempotency key and scope; it excludes transport invocation
identity and replay locators. Same key with another binding rejects; same-binding
retry joins in-flight work or returns the original settled operation, artifacts,
receipt and projection. Accepted/ObservableWork is pending, not completed.
Completed/no-change requires an owner-resolved receipt, projection and currentness;
completed export additionally requires the produced bundle artifact with manifest
projection. No-change may reference existing output but creates none. Failed or
cancelled settlement retains a truthful terminal receipt; unknown effects have no
claimed settlement receipt and require reconciliation before retry. A replay may
not rerun export, mint replacement output or emit a second event.

The central UI response consumes these typed owner results and maps accepted to
pending, completed to succeeded, no-change to no-op, blocked to rejected, failed
to failed, cancelled to cancelled, and effect-unknown to recovery-required. Exact
operation, command, scope, payload digest and receipt joins are mandatory. The
four existing session event obligations consume the ATS-049 emit-only disposition
under DL-039; neither contract admits an event or storage family. Export is receipt-
and-artifact-backed without a new event. Original test/capture records remain
canonical; an exported bundle is not replacement truth.

```yaml
plan_unit_id: ATS-048
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: The five existing session and run-bundle commands consume the exact ATS-048 typed request/result/error/availability contracts, shared metadata and idempotency primitives, and central UI response joins without acquiring capture lifecycle authority or implying native execution.
gui_related: false
gui_classification_reason: This unit binds existing command data and owner authority without choosing presentation or changing controls.
depends_on: [ATS-009, ATS-025, TCME-004]
unblocks: []
acceptance_criteria:
  - Each of the five command IDs has one positive typed request and result and rejects wrong subjects, stale bindings, protected content, false success and replay without its original receipt.
  - Exact owner-state joins reject substituted scope, evidence, policy, currentness, receipts and artifacts; unavailable native handlers cannot report success.
  - All existing placements consume the same owner contract and sole planned handler, with no capture or verdict authority mutation.
validation_surfaces: [python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-ui-command-response.py, python3 scripts/pm-touch-closure-verify.py]
risk_class: evidence_authority_and_false_completion
reasoning_tier: high
context_scope: existing_testing_command_integration
implementation_surfaces: [Plans/testing_session_command_contracts.schema.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: contract_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: ["Plans/Automated_Testing_System.md#ATS-025", "Plans/Test_Capture_and_Motion_Evidence.md#TCME-004", "user instruction 2026-09-11 non-design integration"]
negative_constraints:
  - No new command, native handler, capture lifecycle authority, protected-auth access, GUI design decision, WorkNode, readiness admission or governance seal.
  - Static fixtures are not authenticated owner lookups, playback, persistence or runtime/security proof.
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-025, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Test_Capture_and_Motion_Evidence.md#TCME-004, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md
