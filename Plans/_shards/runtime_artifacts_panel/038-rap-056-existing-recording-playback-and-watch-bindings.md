# Shard 038: RAP-056 — Existing Recording Playback and Watch Bindings

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2818-L2877

Source SHA256: `d72d25525291a655b6bcba20605df5c11f6d31181f79e5f031d5bc0a6535e025`

---

## RAP-056 — Existing Recording Playback and Watch Bindings

The existing `cmd.artifacts.play_recording` and `cmd.artifacts.watch_recording`
consume `Plans/artifact_recording_command_contracts.schema.json` definitions
`ArtifactRecordingCommandRequest`, `ArtifactRecordingCommandResult`,
`ArtifactRecordingCommandError`, and `ArtifactRecordingCommandAvailability`.
Their sole planned routes remain `handlers::artifacts::play_recording` and
`handlers::artifacts::watch_recording`; these strings are not native handlers.

Play is record-only: exact terminal recording artifact identity/version/content
hash, capture identity and provenance reference are mandatory. Watch is live-only:
exact in-progress capture session, capture identity/revision and stream generation
are mandatory. Neither command silently substitutes the other or the latest/focused
recording. The owner resolves availability against actual artifact/capture state,
clock alignment, redaction and viewer policy, with the supplied fallback route.
Missing, stale, revoked, redacted or protected-auth subjects cannot be made usable
by an old receipt or a caller assertion. A safe fallback never relaxes those gates.

ATS-048's `EvidenceCommandContext`, metadata-only result/error/availability fields
and shared idempotency primitive are reused by reference. That reuse delegates no
Testing lifecycle authority to Runtime Artifacts. Play/Watch cannot start/stop a
capture, change a test verdict, take Browser control, expose protected-auth content,
or change autoplay/retention policy. A visible Testing session's Open/Watch still
routes to the distinct ATS-048 session commands, not these recording consumers.

Accepted is pending. Completion/no-change carries the exact owner-resolved receipt,
projection and currentness through the central UI response; unknown effects require
reconciliation. Same-binding replay returns original operation/output/receipt with
no second playback/watch lifecycle or event. Both commands retain their receipt-only
domain-event disposition. The richer typed disabled reasons supersede the former
consumer-only `degraded`/`stale_projection` pair; native handler absence, permission,
protected-auth exclusion, redaction, exact source/stream and policy blockers must
remain distinguishable. This is data/wiring integration, not a new viewer design.

```yaml
plan_unit_id: RAP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Existing recording Play and Watch consume RAP-056 exact terminal/live subject contracts and ATS-048 shared metadata/result primitives without acquiring capture or Testing lifecycle authority; receipt-only effects and unavailable native status remain explicit.
gui_related: false
gui_classification_reason: This unit binds existing viewer commands and owner authority without changing presentation or controls.
depends_on: [RAP-048, ATS-048, TCME-004]
unblocks: []
acceptance_criteria:
  - Both commands have positive typed request/result cases and reject swapped terminal/live subjects, protected content, stale bindings and false-success/replay substitutions.
  - Every existing placement resolves to the same typed owner and planned handler with truthful unavailable status.
validation_surfaces: [python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-ui-command-response.py, python3 scripts/pm-touch-closure-verify.py]
risk_class: recording_identity_and_evidence_authority
reasoning_tier: high
context_scope: existing_artifact_recording_command_integration
implementation_surfaces: [Plans/artifact_recording_command_contracts.schema.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: contract_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: ["Plans/Runtime_Artifacts_Panel.md#RAP-048", "Plans/Test_Capture_and_Motion_Evidence.md#TCME-004", "user instruction 2026-09-11 non-design integration"]
negative_constraints:
  - No new command, native viewer, capture lifecycle authority, protected-auth access, GUI design decision, WorkNode, readiness admission or governance seal.
  - Static fixtures do not prove native playback, stream synchronization, persistence, security or runtime recovery.
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-048, ContractName:Plans/Runtime_Artifacts_Panel.md#RAP-048, ContractName:Plans/Test_Capture_and_Motion_Evidence.md#TCME-004
