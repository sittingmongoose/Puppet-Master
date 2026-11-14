# Test Capture and Motion Evidence

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

## 0. Status, authority, and proof boundary

This document is the canonical product owner for generic Test Capture, motion synchronization, raw-versus-derived media identity, and capture provenance. `TestCaptureService` is shared infrastructure. It does not belong to Browser, Automated Testing, Runtime Artifacts, a viewer, or an encoder backend.

Owner split:

- this document owns capture modes, target policies, requested/effective capture state, capture sessions, segments, clocks, cadence, health, privacy/masking stages, crash recovery, immutable raw capture, derivation manifests, playback, comparison, and capture provenance;
- `Plans/Section15_MVP_Promoted_Features_Spec.md` owns BrowserRuntimeService, BrowserProgram, BrowserWorkspace, BrowserPage, browser controller leases, Browser-specific routing, and the protected `AuthBrowserSession` exclusion;
- `Plans/Automated_Testing_System.md` owns test-run policy, assertions, test outcomes, and executable acceptance matrices;
- `Plans/Runtime_Artifacts_Panel.md` owns cross-producer artifact inventory, retention presentation, open/watch entry points, and provenance reveal placement;
- `Plans/Shared_Integration_Runtime.md` owns `RuntimeResourceGovernor`, `ObservableWork`, host/environment runtime identity, admission, and shared lifecycle mechanics;
- `Plans/Permissions_System.md`, `Plans/FileSafe.md`, and `Plans/storage-plan.md` own capability grants, safe transfer, retention, deletion, and storage mechanics;
- command and wiring catalogs alone mint `cmd.*` rows and production handlers. Command/event lists in this document are registration requirements, not evidence that those registrations or handlers exist.

Accepted PlanUnits, schemas, fixtures, command inventories, validators, or static checks are not runtime, visual, performance, crash-recovery, platform, or empirical proof. Failures remain failures. Runtime closure requires fresh emitted media, raw receipts, fault injection, fixed acceptance bars, and terminal evidence.

Source lineage for this compile is the current 2026-08-17 Egolite/Hermes/Origin packet family, especially `01_IMPLEMENTATION_PACKET.md`, `03_REQUIREMENTS_COVERAGE_MATRIX.md`, `04_COMMAND_EVENT_WIRING_REGISTER.md`, `07_VALIDATION_AND_ACCEPTANCE.md`, `08_AUTHORITY_AND_SUPERSESSION.md`, and `09_HERMES_BROWSER_USE_INTEGRATION_DELTA.md`. Those sources establish requirement lineage; this live Plan is product canon.

## 1. Service and producer model

One `TestCaptureService` owns generic capture for these target families:

- `browser_page`
- `browser_workspace`
- `android_emulator`
- `android_device`
- `apple_simulator`
- `apple_device`
- `desktop_window`
- `desktop_region`
- `remote_stream`
- `frame_sequence`
- `external_adapter`

A capture producer supplies frames, optional explicitly authorized audio, action/timing anchors, and source health. The service owns capture identity, policy, encoding, segmentation, evidence continuity, recovery, and artifact finalization. A target, viewer, controller, focused tab, browser session, device bridge, or test adapter cannot become a second capture owner.

Exact capture modes are:

`off`, `manual`, `continuous`, `on_failure`, `retain_on_failure`, `rolling_buffer`, `trace_only`, `hybrid_video_trace`, `recording_only`.

Exact target policies are:

`fixed_page`, `follow_controller_page`, `all_pages_parallel`, `workspace_composite`, `application_window`, `explicit_region`.

Rules:

- requested and effective mode, target policy, target identity, engine, visibility, cadence, resolution, codec, audio, masking, and retention are separate fields;
- a target change is explicit, timed, generation-aware, and receipted; focus, tab selection, viewer attachment, client attachment, or window activation never changes a capture target silently;
- `follow_controller_page` follows a receipted controller-generation change, not UI focus;
- `all_pages_parallel` uses distinct stream/segment identities per page and a parent capture identity; it is not one ambiguous recording;
- `workspace_composite` records composition layout and source membership for every segment;
- viewer count cannot create duplicate encoders or change retained evidence quality;
- backgrounding, detaching, changing editor target, or closing a viewer does not stop approved host-side capture;
- an external Project process may submit generic frames/artifact refs with explicit external attribution, but gains no PM BrowserRuntimeService, BrowserWorkspace, controller lease, protected-auth, command, credential, runtime, or conformance authority.

The machine contract is `Plans/test_capture_motion_evidence_contracts.schema.json`; examples and negative cases are in `Plans/test_capture_motion_evidence_contract_fixtures.json`. The schema also owns one generic discriminated request/result/error/availability family for exactly eight `cmd.testing.capture.*` commands plus `cmd.artifacts.create_demonstration_video` and `cmd.artifacts.inspect_capture_provenance`. The seven other session/playback/export commands listed below remain compatible central consumers; they are not duplicated into this ten-ID owner enum.

### Machine schema identity

The schema file is a Draft 2020-12 union-schema document. Its aggregate `$id`, `pm.test_capture_motion_evidence_contracts.schema.v1`, identifies only that schema document and is not a payload schema identity. Every capture record is addressed by exactly one stable `(schema_id, record_kind)` pair:

| `record_kind` | canonical payload `schema_id` |
|---|---|
| `test_capture_session` | `pm.test_capture.session.v1` |
| `capture_target_switch_receipt` | `pm.test_capture.target_switch_receipt.v1` |
| `capture_segment_manifest` | `pm.test_capture.segment_manifest.v1` |
| `capture_health_receipt` | `pm.test_capture.health_receipt.v1` |
| `capture_artifact` | `pm.test_capture.artifact.v1` |
| `raw_test_capture` | `pm.test_capture.raw_capture.v1` |
| `capture_derivation_manifest` | `pm.test_capture.derivation_manifest.v1` |
| `derived_demonstration_video` | `pm.test_capture.demonstration_video.v1` |
| `capture_provenance_selection` | `pm.test_capture.provenance_selection.v1` |
| `capture_playback_comparison_state` | `pm.test_capture.playback_comparison_state.v1` |
| `capture_observable_work_projection` | `pm.test_capture.observable_work_projection.v1` |
| `capture_command_request` | `pm.test_capture.command_request.v1` |
| `capture_command_result` | `pm.test_capture.command_result.v1` |
| `capture_command_error` | `pm.test_capture.command_error.v1` |
| `capture_command_availability` | `pm.test_capture.command_availability.v1` |

Validators and storage routing fail closed when either member is missing, unknown, or mismatched. The former aggregate payload ID is migration input only: an explicit pre-validation migrator must first identify one exact known `record_kind`, rewrite to its canonical ID above, and retain migration provenance; unknown or missing kinds are rejected. The aggregate ID is never persisted as record identity and is not accepted as a compatibility alias during normal validation. All capture record families structurally exclude `AuthBrowserSession`, protected-auth targets/content, credentials, cookie/storage state, and protected-auth capture or inspection authority.

## 2. Engine, cadence, codecs, and audio

For PM-managed CEF windowless/offscreen capture, the preferred accelerated path uses shared textures and `OnAcceleratedPaint`. PM immediately copies accepted pixels into PM-owned bounded rings and composes popup surfaces with recorded bounds. Borrowed or pooled GPU handles are never retained after the callback lifetime.

Backend order is platform-specific and truthful:

- Windows: D3D shared texture, then bounded BGRA copy fallback;
- macOS: IOSurface/Metal, then bounded BGRA copy fallback;
- Linux: dma-buf with Vulkan/EGL interoperability when supported, then bounded BGRA copy fallback;
- other target families use their canonical producer transport and record the requested/effective engine and fallback reason.

Ordinary requested cadence is 30 fps. Motion-sensitive requested cadence is 60 fps. These are requested profiles, not guarantees. Every artifact records requested and effective cadence, delivered frame count, dropped/repeated/black/blank/frozen/stale/corrupt frames, cadence collapse, backpressure, and effective-quality changes.

Codec selection order is hardware AV1 or HEVC encoding first, with H.264 High, VP9 Profile 0 and VP8 as named fallbacks only when no hardware AV1 or HEVC encoder is available. Raw evidence uses durable atomic Matroska segments; MP4 is an export/derived container, never the only crash-recovery source.

Amended 2026-10-31 (DL-270): recordings use hardware AV1 or HEVC encoding, with a thumbnail per recording for lists, as SP-343 in Plans/storage-plan.md owns. The hardware encoder is chosen per platform, and each segment records the requested and effective codec, the encoder and any fallback reason. Recording bytes live in the payload store (SP-337). Matroska segments and MP4-as-export are unchanged.

Audio defaults to `off`. Target audio requires a separate explicit target and capability grant, uses Opus at 48 kHz for raw Matroska capture, and may use AAC-LC only in an MP4 export. Microphone and system audio are never inferred from screen, window, browser, test, or recording permission.

`RuntimeResourceGovernor` owns capture permits and may reduce effective live preview or encoding quality under pressure. Adaptation is receipted. It cannot silently degrade already retained evidence, discard required raw segments, relabel screenshots as video, or claim missing frames were captured.

## 3. Atomic segments and crash recovery

Raw capture is journaled as independently finalizable Matroska segments with a nominal two-second duration. Each segment:

- begins with a keyframe;
- records capture/session/target/stream identity and sequence;
- records wall-clock and monotonic start/end, calibration, drift, and uncertainty;
- records requested/effective cadence, dimensions, codec, audio state, frame health, popup/composite membership, and masking stage;
- records content hash, byte size, prior-segment hash, finalization state, and recovery disposition;
- references action, bookmark, task, Goal, run, browser/device/desktop, Home Server, Execution Host, Environment, Source Location, workspace, project, and actor lineage where applicable.

Finalized segments are immutable. The active segment is written through an atomic journal/finalization protocol. After crash, restart, disconnection, or producer loss, recovery may finalize a structurally complete segment, quarantine a corrupt/incomplete segment, or record a gap. It never repairs a gap by reenactment or fabricates continuity.

Recovery terminals are `finalized`, `recovered_finalized`, `quarantined_corrupt`, `discarded_incomplete`, and `continuity_gap_recorded`. A capture session can finalize as `complete`, `partial_with_gaps`, `failed_no_media`, `cancelled_with_evidence`, or `interrupted_recoverable`. The terminal receipt preserves failures and named residual risk.

## 4. Clocks, motion synchronization, and health

Capture time is calibrated across wall clock, service monotonic clock, producer monotonic clock, encoder timestamps, and optional remote/device clocks. Calibration records offset, drift, uncertainty, method, and validity interval. A timestamp without clock-domain identity is not admissible for synchronized comparison.

Where a producer supports it, the synchronized evidence timeline may bind:

- named browser/test actions and inputs;
- Web Animations and `requestAnimationFrame` samples;
- delivered frame intervals;
- bounds, computed styles, layout shifts, and long tasks;
- console, network, performance, assertion, and lifecycle events;
- viewport, DPR, theme, reduced-motion, resize, and orientation changes;
- target switches, controller generation, capture degradation, and recovery gaps.

Health detectors identify dropped, repeated, black, blank, frozen, stale, corrupt, misordered, and cadence-collapsed frames. A detector finding is an observation with thresholds and evidence refs, not automatic proof of root cause. Health may transition through `healthy`, `degraded`, `recovering`, and `failed`; recovery never erases the prior degraded interval.

## 5. Privacy, redaction, and masking

Capture requires an exact target and capability grant. Device, desktop, window, region, browser, and audio capture cannot silently widen to another target family or a broader region.

Masking stages are distinct:

- `source`: excluded or redacted before frames leave the producer; preferred where available;
- `encoder`: masked in the PM-owned capture pipeline before persistence/export;
- `display_only`: hidden only in a viewer and explicitly insufficient to redact retained or exported media.

Every artifact labels requested and effective masking stage, policy/profile ref, affected spans/regions, review status, and any unmasked interval. Display-only masking can never be presented as source or encoder redaction. Secret/path/raw-ID/code-free `user_step_label` values are shared with Browser Program and test timelines; labels are human summaries, never payload or authorization carriers.

Protected `AuthBrowserSession` is excluded structurally. `TestCaptureService`, agents, Goals, tools, plugins, MCP, Browser Program, test adapters, recorders, viewers, console/network/DOM readers, and ordinary `cmd.browser.*` or `cmd.testing.*` routes cannot enumerate, target, attach to, infer content from, or capture it. Only the redacted lifecycle/denial projection owned by `Plans/protected_auth_browser_contracts.schema.json` may exist.

## 6. Immutable raw and derived identities

`RawTestCapture` is the immutable identity for finalized raw segments, gaps, clocks, actions, lineage, health, redaction, hashes, and retention. It is never overwritten, trimmed in place, or converted into a demonstration identity.

`DerivedDemonstrationVideo` is a distinct immutable artifact derived from one or more admitted raw captures. `CaptureDerivationManifest` records:

- exact raw capture, stream, segment, frame, and time spans;
- cuts, speed changes, crops, masks, annotations, captions, narration, audio changes, and transitions;
- action/bookmark linkage and continuity gaps;
- privacy review identity and disposition;
- tool/version/config identity and output hash;
- `uncaptured_state_introduced: false` with a validation receipt.

A derived artifact never overwrites or masquerades as raw. Reenactment is a new capture with new identity and cannot fill a missing original. Missing original media is admitted explicitly and cannot be hidden by selecting the newest artifact. `latest` is allowed only after exact subject and continuity verification.

Runtime Artifacts and Testing surfaces use the exact human labels **Raw Test Capture**, **Demonstration Video**, **View Source Capture**, and **Inspect Provenance**. They also expose explicit no-recording, partial/gap, source-missing, redaction, and edit-manifest states.

## 7. Playback and comparison

Playback supports normal play/pause/seek plus frame step, bookmarks, action jumps, slow motion including `0.25x`, synchronized evidence panes, before/after, and side-by-side reference-versus-actual comparison.

Comparison never assumes equal clocks, dimensions, DPR, theme, reduced-motion setting, viewport, orientation, masking stage, codec, or cadence. The comparison state shows calibration, alignment method, effective cadence, gaps, degradation, and whether a view is raw or derived. A screenshot can be an aligned reference frame; it cannot substitute for motion evidence.

Closing a viewer, changing focus, or changing editor target does not end the capture or mutate artifacts. Session cards mount in supported editor targets and carry exact capture/session/target/host/environment identity rather than a focused-tab guess.

## 8. ObservableWork, receipts, events, and projections

Every capture session and long derivation exposes an `ObservableWork` projection with queue/admission state, current phase, requested/effective target and quality, segment/frame progress, elapsed time, health, blocked reason, cancellation state, artifact refs, and safe next action. Queued, admitted, visible, recording, finalizing, or artifact-present is never equivalent to test passed, motion verified, or provenance accepted.

Required event registrations are:

`testing.capture.started`, `testing.capture.paused`, `testing.capture.resumed`, `testing.capture.bookmarked`, `testing.capture.clip_saved`, `testing.capture.target_changed`, `testing.capture.stopped`, `testing.capture.segment_finalized`, `testing.capture.segment_recovered`, `testing.capture.segment_corrupt`, `testing.capture.health_degraded`, `testing.capture.health_recovered`, `testing.capture.effective_quality_changed`, `testing.capture.redaction_applied`, `testing.capture.interrupted`, `testing.capture.provenance_verified`, `testing.capture.provenance_rejected`, `artifacts.demonstration_video.created`, `artifacts.demonstration_video.failed`, and `artifacts.capture_provenance.inspected`.

Required command-catalog rows are:

`cmd.testing.capture.start`, `cmd.testing.capture.pause`, `cmd.testing.capture.resume`, `cmd.testing.capture.bookmark`, `cmd.testing.capture.save_clip`, `cmd.testing.capture.target.update`, `cmd.testing.capture.stop`, `cmd.testing.capture.health.inspect`, `cmd.testing.session.open`, `cmd.testing.session.watch`, `cmd.testing.session.background`, `cmd.testing.session.redaction.inspect`, `cmd.testing.export_bundle`, `cmd.artifacts.play_recording`, `cmd.artifacts.watch_recording`, `cmd.artifacts.create_demonstration_video`, and `cmd.artifacts.inspect_capture_provenance`.

Browser recording aliases, if retained, normalize to these generic owners; they do not create a Browser-owned recorder. No Playwright-shaped command, alias, package, capability, Doctor row, capture engine, or support surface is allowed.

For the ten owner-typed IDs, every request is bound to exact lineage, permission, idempotency, return route, and currentness. Start and target-update additionally require an exact ordinary target plus target currentness; session lifecycle actions require the exact capture session; clip and demonstration derivation require immutable raw identity, derivation/privacy refs, and demonstration confirmation; provenance inspection requires an exact subject and candidate identities. Availability and error records name protected-auth, staleness, privacy, resource, catalog, native-handler, and production-wiring blockers without exposing content. `AuthBrowserSession` remains human-only, non-recordable, non-inspectable, and unavailable to agents and capture routes. The allowed engine enum contains no PM Playwright runtime, facade, alias, or compatibility surface.

These command schemas and fixtures are static only. TCME-008 specifies the ten capture-owned central catalog/wiring routes; ATS-048 and RAP-056 bind the seven pre-existing Testing/recording consumers to their own typed families. The capture schema remains exactly ten command IDs and does not accept those seven consumer commands. Central production-intent registration is not native wiring: native encoders/backends/sole handlers, emitted media, crash-recovery execution and runtime receipts remain absent. Event Authority admission is separate and cannot be inferred from these command contracts.

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-048, ContractName:Plans/Runtime_Artifacts_Panel.md#RAP-056, ContractName:Plans/Test_Capture_and_Motion_Evidence.md#TCME-008

GUI projections show human labels and requested/effective state first. Raw IDs, clocks, hashes, segment journals, codec/backend data, masking detail, and lineage live in Technical Details/Inspect Provenance. Settings may expose human capture mode, target policy, rolling retention, requested quality, audio Off/default, health/degradation, storage/retention, and resource/remote limits. Capability `Auto|On|Off` controls capability policy, never access or permission gating.

## 9. Migration and compatibility

Migration rules:

- focused-tab-, viewer-, browser-, encoder-, or newest-recording ownership migrates to `TestCaptureService` plus explicit target policy;
- a fragile single MP4 becomes derived/export media; it is not promoted to raw segmented evidence without source proof;
- browser recording commands normalize to generic testing/artifact commands with typed attribution;
- unverified `latest recording` becomes a provenance selection request and may be rejected;
- reenacted media remains a distinct new capture;
- derived media never replaces raw identity;
- legacy `auth_session` capture references are rejected, not migrated;
- a user Project Playwright suite remains a generic external process and test harness only. It cannot become a PM runtime, command namespace, facade, compatibility layer, browser backend, capture owner, package, port, MCP route, Settings/Doctor capability, or evidence of PM-native Browser Program conformance.

No migration may fabricate missing segments, clocks, lineage, permissions, redaction, continuity, or runtime evidence.

## 10. Scenario coverage and evidence integrity

Evidence for a changed surface identifies the exact subject and configuration and declares the covered system and animation scenarios. Coverage for the surfaces a change touches includes Settings preview/apply/rollback/reset/import/export; theme, Glass transparency, tooltip visibility, and Reduced Motion; each Onboarding path and its interruption/reversal/resize/theme variants; Automatic Preparation pending, measured-running, accepted-ready, owner-failed, and same-operation retry projections without synthetic progress or readiness; Guided Tour; every Doctor remediation mode and exact return; Server and route continuity; Full Server Backup and restore modes; Browser/capture; admitted Source Control routes and retirement refusals (DL-273, Jared 2026-11-01); Named Plan; performance; the Plugins four-tab owner projection, truthful handler-unavailable command path, and Doctor return; global hover entry/exit/collision/dynamic state; and Home-workspace motion. An omitted scenario is missing evidence, not an implicit pass.

Capture cadence and health follow sections 2 and 4; raw and derived identities, provenance, and retention follow section 6 and its named owners. Evidence binds delivered-frame indexes and findings to exact subject, artifact, and configuration identities. Findings identify scenario/frame ranges, severity, disposition, repair, and replacement-capture references. Unresolved findings, missing replacement capture, incomplete review, or stale/mixed hashes cannot pass an evidence gate. Derived contact sheets or exports never replace original capture evidence.

The additional DL-280–300 and ATS-080–085 scenarios are mandatory where touched: the Settings ladder, origin-word Details, Changed plus 1px control outline, offered-level menus, Varies, reset and detached copy/History/Undo; all 38 managers' home/reach/version and readiness states; the Split Projects library/detail states and every New Project source, source-inspection, online-copy, Starter, backup and recovery branch; No project selection, lazy folder, truthful Computer/offline state, full conversion/report/Undo and late-return races; explicit cross-project read coverage/incoming request; app Goal/Crew/Plan/Deep Plan and scheduled task/message cards, exact versions, Schedule Manager and app Pause/Stop; human/mode/build-grant review, live targets, Stop/revocation and No safe Undo; and session-bound computer-use strip/Stop without capturing protected input. Positive availability and typed unavailable/offline/stale/error states are separate cases. Test app and Project Home/board/layout context, all ten built-in look variants, Reduced Motion, narrow/long-content reflow, pointer/keyboard/focus and source-native capture-return identity. A stage awaiting native support remains an explicit not_run/unavailable scenario, never an omitted pass.

Browser-concept evidence never certifies native Slint rendering, real platform integration, production handlers, assistive technology, network/WAN behavior, backup media, SCM providers, old hardware, or native performance. Concept-host costs are reported separately and never subtracted (Plans/Decision_Log.md#DL-217).

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-080, ContractName:Plans/Automated_Testing_System.md#ATS-085, ContractName:Plans/FinalGUISpec.md#F3-668, ContractName:Plans/FinalGUISpec.md#F3-674, ContractName:Plans/UI_Wiring_Rules.md#UIW-048, ContractName:Plans/Tools.md#T-186

## Owner / Consumer Map

| Concern | Canonical owner | Primary consumers |
|---|---|---|
| capture modes, target policy, segments, clocks, health, raw/derived/provenance | this document | Browser, Automated Testing, Runtime Artifacts, GUI, Settings |
| browser runtime/program/workspace/page/controller | `Plans/Section15_MVP_Promoted_Features_Spec.md` | capture target adapter, Testing GUI |
| test outcome/assertion policy | `Plans/Automated_Testing_System.md` | capture timeline, evidence reports |
| artifact inventory/retention presentation | `Plans/Runtime_Artifacts_Panel.md` | Testing, Browser, Assistant |
| admission/resources and progress | `Plans/Shared_Integration_Runtime.md` | capture and derivation services |
| commands and one-handler wiring | command and wiring owner docs | all GUI/DRY projections |
| permission, transfer, persistence | Permissions, FileSafe, storage owners | capture and artifact services |
| scenario coverage, artifact identity, motion evidence integrity, and native-proof boundary | this document's TCME-007 acceptance gate | Automated Testing, Runtime Artifacts, Final GUI, Settings, Onboarding/Doctor |

## PlanUnits

### TCME-001 - Generic TestCaptureService Modes Targets And Recovery

```yaml
plan_unit_id: TCME-001
unit_type: requirement
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: One TestCaptureService owns all admitted target families, exact capture modes and target policies, requested/effective state, explicit timed target switching, atomic two-second Matroska segments, finalization, crash recovery, and truthful continuity gaps; focus and viewer changes never retarget or stop approved host capture.
gui_related: false
gui_classification_reason: This unit owns backend capture identity, policy, segmentation, and recovery rather than visible presentation.
depends_on: [SIR-007, SMPFS-142]
unblocks: [TCME-002, TCME-003, TCME-004]
acceptance_criteria:
  - Every target family and exact mode/policy enum validates through the machine schema.
  - Target switches are explicit and receipted; focus and viewer changes cannot retarget.
  - Finalized segments are immutable, keyframe-started, hashed, clocked, and independently recoverable.
  - Crash recovery preserves corrupt/incomplete/gap truth and never fabricates continuity.
validation_surfaces: [Plans/test_capture_motion_evidence_contract_fixtures.json, future platform and fault-injection capture matrix]
risk_class: capture_owner_target_or_recovery_drift
reasoning_tier: high
context_scope: generic_test_capture_service
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Plans/test_capture_motion_evidence_contracts.schema.json]
node_compile_hint: {mode: capture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-001, source_ref:egolite-requirement:CAP-002, source_ref:egolite-requirement:CAP-003, source_ref:egolite-requirement:CAP-004, source_ref:egolite-requirement:CAP-005, source_ref:egolite-requirement:CAP-006, source_ref:egolite-requirement:CAP-007, source_ref:egolite-requirement:CAP-015, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:100-106]
negative_constraints:
  - Do not make focus, viewer, browser, encoder, or newest artifact the capture owner.
  - Do not call schema or fixture validation runtime capture proof.
```

### TCME-002 - Capture Clocks Motion Health Privacy And Cadence

```yaml
plan_unit_id: TCME-002
unit_type: requirement
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: Capture binds calibrated clock domains, actions, animation/frame/layout/performance signals, requested/effective cadence and quality, frame-health findings, explicit audio, and source/encoder/display-only masking while RuntimeResourceGovernor owns permits and cannot silently degrade retained evidence.
gui_related: true
gui_classification_reason: This unit includes user-visible capture health, masking-stage, effective-quality, and synchronized motion disclosure.
depends_on: [TCME-001]
unblocks: [TCME-003, TCME-004]
acceptance_criteria:
  - Every timestamp names a clock domain and calibration/uncertainty is visible to comparison logic.
  - Requested/effective cadence and quality plus frame-health intervals remain truthful under pressure.
  - Audio remains Off unless the exact target and capability are granted.
  - Display-only masking is never represented as retained-media redaction.
validation_surfaces: [Plans/test_capture_motion_evidence_contract_fixtures.json, future motion synchronization and masking matrix]
risk_class: capture_timing_health_or_privacy_misrepresentation
reasoning_tier: high
context_scope: capture_motion_privacy_health
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md]
node_compile_hint: {mode: capture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-005, source_ref:egolite-requirement:CAP-008, source_ref:egolite-requirement:CAP-009, source_ref:egolite-requirement:CAP-010, source_ref:egolite-requirement:CAP-011, source_ref:egolite-requirement:CAP-013, source_ref:egolite-requirement:CAP-014, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:105-110]
negative_constraints:
  - Do not infer microphone or system audio permission.
  - Do not label screenshots as motion evidence or video.
```

### TCME-003 - Immutable Raw Capture And Derivation Provenance

```yaml
plan_unit_id: TCME-003
unit_type: requirement
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: RawTestCapture and DerivedDemonstrationVideo are separate immutable identities; CaptureDerivationManifest cites exact raw spans and every edit/privacy action, proves no uncaptured state, preserves output hash, and never overwrites raw. Missing originals and reenactments remain explicit.
gui_related: true
gui_classification_reason: Runtime Artifacts exposes exact raw/derived labels, source-capture actions, missing-original state, and provenance inspection.
depends_on: [TCME-001, TCME-002]
unblocks: [TCME-004]
acceptance_criteria:
  - Raw artifacts cannot be overwritten or mutated by derivation.
  - Every derived artifact references an admitted manifest and exact raw spans.
  - Provenance selection rejects unverified latest/continuity matches.
  - Missing original and reenactment never masquerade as original evidence.
validation_surfaces: [Plans/test_capture_motion_evidence_contract_fixtures.json, future no-overwrite and provenance-selection matrix]
risk_class: raw_derived_identity_or_provenance_fabrication
reasoning_tier: high
context_scope: capture_provenance_and_derivation
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: capture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-016, source_ref:egolite-requirement:CAP-017, source_ref:egolite-requirement:CAP-018, source_ref:egolite-requirement:CAP-019, source_ref:egolite-requirement:CAP-020, source_ref:packet:PKT-04/09_HERMES_BROWSER_USE_INTEGRATION_DELTA.md:221-232, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:110-114]
negative_constraints:
  - Do not overwrite raw media with derived media.
  - Do not substitute reenactment or newest media for a missing original.
```

### TCME-004 - Capture Playback Comparison ObservableWork And GUI Projection

```yaml
plan_unit_id: TCME-004
unit_type: requirement
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: Testing and Runtime Artifacts expose independent session cards, ObservableWork, frame-step/bookmark/action-jump/0.25x playback, synchronized evidence panes, before-after and side-by-side comparison, requested/effective target and quality, health, masking, raw/derived identity, source capture, and provenance without treating visibility or artifact presence as test success; the ten lane-owned capture/artifact IDs use one typed request/result/error/availability family with TCME-008 central production-intent routes, while ATS-048 and RAP-056 separately bind the seven existing Testing/recording consumers. Native runtime wiring remains absent.
gui_related: true
gui_classification_reason: This unit owns the visible capture session, playback, comparison, health, provenance, and progress projections.
depends_on: [TCME-001, TCME-002, TCME-003]
unblocks: []
acceptance_criteria:
  - Viewer closure/focus/editor-target changes do not stop capture or alter evidence identity.
  - Playback and comparison disclose clocks, gaps, health, cadence, masking, and raw/derived class.
  - ObservableWork never converts recording/finalizing/artifact-present into a test verdict.
  - GUI actions dispatch through registered generic command rows with exact identities.
  - The exact ten lane-owned command IDs validate action-specific target/currentness/privacy/derivation conditionals and reject protected-auth and PM Playwright-shaped requests.
validation_surfaces: [Plans/test_capture_motion_evidence_contracts.schema.json, Plans/test_capture_motion_evidence_contract_fixtures.json, future five-session GUI and all-theme motion-evidence matrix]
risk_class: capture_gui_or_progress_truth_drift
reasoning_tier: high
context_scope: capture_playback_comparison_gui
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Plans/Runtime_Artifacts_Panel.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: capture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-012, source_ref:egolite-requirement:GUI-003, source_ref:egolite-requirement:GUI-012, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:83-112, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:132-161, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:109-114]
negative_constraints:
  - Do not infer test success from capture visibility, progress, or artifact existence.
  - Do not make a viewer the capture lifecycle owner.
```

### TCME-005 - Capture Security Migration And External Harness Boundary

```yaml
plan_unit_id: TCME-005
unit_type: constraint
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: Capture targets are exact and capability-bound; protected AuthBrowserSession is structurally untargetable; legacy newest/focus/viewer/browser ownership and single-MP4 evidence migrate without invented proof; user Project Playwright remains an external test harness only and creates no PM runtime, command namespace, facade, compatibility, capture ownership, or conformance authority.
gui_related: false
gui_classification_reason: This is a security, migration, dependency, and authority boundary rather than visible presentation.
depends_on: [TCME-001, SMPFS-143, SMPFS-145]
unblocks: []
acceptance_criteria:
  - Protected-auth subjects cannot validate as capture targets, artifacts, playback sources, or provenance selections.
  - Legacy migration preserves missing lineage/gap/failure truth and never fabricates raw evidence.
  - External Project test processes retain explicit external attribution and zero PM browser/capture authority.
  - Prohibited Playwright-shaped PM surfaces remain absent from command, package, capability, Doctor, runtime, and schema namespaces.
validation_surfaces: [Plans/test_capture_motion_evidence_contract_fixtures.json, future security and migration negative matrix]
risk_class: capture_security_or_external_harness_authority_escape
reasoning_tier: high
context_scope: capture_security_migration_boundary
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: capture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:BRW-013, source_ref:egolite-requirement:CAP-015, source_ref:egolite-requirement:CAP-017, source_ref:egolite-requirement:SEC-002, source_ref:egolite-requirement:SEC-003, source_ref:egolite-requirement:SEC-005, source_ref:packet:PKT-04/08_AUTHORITY_AND_SUPERSESSION.md:24-48, source_ref:packet:PKT-04/09_HERMES_BROWSER_USE_INTEGRATION_DELTA.md:234-246]
negative_constraints:
  - Do not capture, enumerate, attach to, or infer protected AuthBrowserSession content.
  - Do not create a PM Playwright runtime, namespace, facade, or compatibility surface.
```

### TCME-006 - Capture Record-Addressable Schema Identity

```yaml
plan_unit_id: TCME-006
unit_type: constraint
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: Every Test Capture payload uses one stable unique schema_id paired with one exact record_kind; the union schema aggregate ID identifies only the schema document, legacy aggregate payload IDs require explicit fail-closed pre-validation migration, and every capture record family structurally excludes AuthBrowserSession and protected-auth state.
gui_related: false
gui_classification_reason: This unit owns record identity, migration, storage addressing, and protected-auth structural exclusion rather than visible presentation.
depends_on: [TCME-001, TCME-005, SMPFS-143]
unblocks: []
acceptance_criteria:
  - All fifteen top-level record branches have unique schema_id constants and unique record_kind constants.
  - A schema_id and record_kind mismatch, missing member, unknown member, or legacy aggregate payload ID fails ordinary validation.
  - Legacy migration resolves one exact known record_kind before rewriting the payload ID and preserves migration provenance; it never guesses.
  - AuthBrowserSession and protected-auth targets, content, credentials, cookie/storage state, capture, and inspection authority remain structurally absent from every capture record family.
validation_surfaces: [Plans/test_capture_motion_evidence_contracts.schema.json, Plans/test_capture_motion_evidence_contract_fixtures.json, future storage registry and migration fixture matrix]
risk_class: capture_record_schema_identity_ambiguity_or_protected_auth_escape
reasoning_tier: high
context_scope: test_capture_record_identity
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Plans/test_capture_motion_evidence_contracts.schema.json]
node_compile_hint: {mode: capture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-016, source_ref:egolite-requirement:CAP-018, source_ref:egolite-requirement:SEC-002, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:144-161]
negative_constraints:
  - Do not persist or route the aggregate union-schema ID as a record schema identity.
  - Do not accept a legacy ID, unknown record kind, mismatched pair, or protected-auth payload by inference.
```

### TCME-007 - Scenario Coverage And Motion Evidence Integrity

```yaml
plan_unit_id: TCME-007
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: |-
  Capture evidence binds declared system and animation scenarios, delivered-frame cadence, review findings, repairs, and replacement captures to exact subject, artifact, and configuration identities. Missing scenarios, unresolved findings, incomplete review, stale or mixed identities, and missing replacement capture remain failures or explicit evidence gaps. Raw/derived identity, capture integrity, provenance, and retention remain governed by TCME-001 through TCME-004 and the named permission, artifact, and storage owners. Browser-concept evidence never becomes native Slint or production-runtime certification. Concept-host costs are reported separately and never subtracted (Plans/Decision_Log.md#DL-217).

  Section 10 also covers the Settings/Projects/No project/app workflow/grant and computer-use scenario matrix approved by DL-280–300 and specified by ATS-080–085. Each capture and finding joins the exact subject bytes/hash, schema/command/binding edition, app or Project/Computer context, theme/motion/viewport, scenario and delivered frame range. Late delivery preserves the original thread and composer destination or refuses before mutation. Report every omitted/not_run/blocked scenario and native gap explicitly. Computer-use consent does not authorize protected authentication capture, persistence of screen frames in chat, or a second capture service.
gui_related: true
gui_classification_reason: This unit governs scenario coverage and the integrity and declared scope of visual, motion, and interaction evidence.
depends_on: [TCME-001, TCME-002, TCME-003, TCME-004]
unblocks: []
acceptance_criteria:
  - Evidence declares every covered system and animation scenario under section 10, including Automatic Preparation pending/measured/ready/failure/same-operation-retry owner projections plus the Plugins owner projection and Doctor route; each report binds to exact subject, artifact, and configuration identities, and omitted scenarios remain missing evidence.
  - Capture targets 60 fps, retains delivered compositor frames, reports actual cadence and degradation, and never represents resampling as native capture cadence.
  - Findings identify exact scenario/frame ranges, severity, evidence, disposition, repair, and replacement-capture references; unresolved findings, missing replacement capture, incomplete review, stale/mixed hashes, or a false native/runtime claim fail the evidence gate.
  - Raw capture, delivered-frame indexes, provenance, and derived artifacts retain distinct identities under TCME-003; a review export or contact sheet cannot replace the original capture.
  - Concept-host costs are reported separately and never subtracted, as recorded in Plans/Decision_Log.md#DL-217.
validation_surfaces:
  - Plans/test_capture_motion_evidence_contracts.schema.json
  - Plans/test_capture_motion_evidence_contract_fixtures.json
  - Scenario, artifact-identity, cadence, provenance, and findings review with separate browser-concept and native verdicts
risk_class: motion_evidence_gap_or_false_certification
reasoning_tier: high
context_scope: capture_scenario_evidence_integrity
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md]
node_compile_hint: {mode: acceptance_evidence_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-005, source_ref:egolite-requirement:CAP-009, source_ref:egolite-requirement:CAP-011, source_ref:egolite-requirement:CAP-012, source_ref:egolite-requirement:CAP-016, source_ref:egolite-requirement:CAP-018, source_ref:egolite-requirement:CAP-019, source_ref:egolite-requirement:CAP-020, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:100-114, source_ref:packet:PKT-04/10_REQUIREMENT_RETENTION_AUDIT.md:20-38]
negative_constraints:
  - Do not call browser capture native Slint, platform, hardware, production-handler, network, backup-media, SCM, or assistive-technology certification.
  - Do not resample footage and claim native 60-fps capture.
  - Do not count omitted scenarios, incomplete review, unresolved findings, missing replacement capture, or stale/mixed artifact identities as passing evidence.
```

## Migration Coverage

TCME-007 applies the capture owner's scenario coverage, artifact identity, and evidence-integrity requirements. Browser-concept observations remain separate from product runtime handlers, encoders, platform backends, native Slint implementation, production wiring, and runtime certification. Central product command/event/wiring registration and native/runtime implementation remain separate owner work. These PlanUnits create no WorkNodes, NodeSeeds, or executable queues.

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 10 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.artifacts.create_demonstration_video` | `handlers::test_capture::artifacts_create_demonstration_video` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.artifacts.inspect_capture_provenance` | `handlers::test_capture::artifacts_inspect_capture_provenance` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.bookmark` | `handlers::test_capture::testing_capture_bookmark` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.health.inspect` | `handlers::test_capture::testing_capture_health_inspect` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.pause` | `handlers::test_capture::testing_capture_pause` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.resume` | `handlers::test_capture::testing_capture_resume` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.save_clip` | `handlers::test_capture::testing_capture_save_clip` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.start` | `handlers::test_capture::testing_capture_start` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.stop` | `handlers::test_capture::testing_capture_stop` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |
| `cmd.testing.capture.target.update` | `handlers::test_capture::testing_capture_target_update` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_error` / `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request/properties/permission_snapshot_ref` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.artifacts.create_demonstration_video`, `cmd.artifacts.inspect_capture_provenance`, `cmd.testing.capture.bookmark`, `cmd.testing.capture.health.inspect`, `cmd.testing.capture.pause`, `cmd.testing.capture.resume`, `cmd.testing.capture.save_clip`, `cmd.testing.capture.start`, `cmd.testing.capture.stop`, `cmd.testing.capture.target.update`.

Exact sole future handler set: `handlers::test_capture::artifacts_create_demonstration_video`, `handlers::test_capture::artifacts_inspect_capture_provenance`, `handlers::test_capture::testing_capture_bookmark`, `handlers::test_capture::testing_capture_health_inspect`, `handlers::test_capture::testing_capture_pause`, `handlers::test_capture::testing_capture_resume`, `handlers::test_capture::testing_capture_save_clip`, `handlers::test_capture::testing_capture_start`, `handlers::test_capture::testing_capture_stop`, `handlers::test_capture::testing_capture_target_update`.

### TCME-008 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: TCME-008
unit_type: command_binding
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: |-
  Test Capture and Motion Evidence owns exactly 10 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.

  Existing ten command IDs and sole handlers remain; the pass adds reverse consumers and explicit scope-aware target/return variants only where the capture owner admits them. A No project capture binds its real Server/Host/Environment/thread/session and permitted target, never the focused Project. Selection or conversion cannot retarget an active capture or late attachment. Native absence and protected-auth exclusion stay unchanged.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 10 commands and their exact disabled reasons.
depends_on: [TCME-004, TCME-007]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 10-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json


## W3C Event Authority phase-1 prepared contracts - 2026-11-05

These new per-family units are proposals prepared without admission. Existing event and storage family registries remain unchanged.


### TCME-1300 - artifacts.capture_provenance.inspected prepared owner contract

```yaml
plan_unit_id: TCME-1300
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `artifacts.capture_provenance.inspected@1.0.0`, prepared
  without admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C
  report). The current exact-name search found only the registration requirement, no full event definition
  or alias. This contract reuses sections 1-9 and the exact `capture_provenance_selection` record definition,
  not another event family''s bindings. Saved fact: The exact requested subject and candidate identities were
  inspected and a provenance selection result was committed; inspection does not assert that provenance was
  accepted.


  Producer: `handlers::test_capture::artifacts_inspect_capture_provenance` under the existing TestCaptureService
  or Testing owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`.
  Capture adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source
  schemas stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json,
  with `.application.v1` identities, null project_id and actual optional run binding; no old Project resource
  is relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source
  capture or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1300; its source_record resolves the immutable actual
  `capture_provenance_selection` record (the new application sibling only for application capture), except
  supplemental bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner
  outcomes and do not invent a second capture service. Before-record is required for a state/quality/target
  change and null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced
  source/request, and its permission ref equals the captured operation. The original request and prior snapshots
  are captured before the effect; post-state and result snapshots are captured only when the genuine outcome
  is committed, preserving the original owner currentness and writer-generation joins. Exact original schema
  IDs, record_kind, subject, actor, target, Server, Host, Environment, source location and scope must agree
  field by field. Verify hashes from actual immutable bytes, not a caller digest. A missing source record or
  late effect is not reconstructed from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Selection subject and candidates equal the original inspection request. (2)
  The committed selection disposition, including rejected or missing-source results, is preserved without upgrading
  it to selected.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1300 before any effect.

  The request captures the original provenance-inspection request with the exact subject and candidate identities
  before inspection. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `artifacts.capture_provenance.inspected@1:` + hex(exact UTF-8
  owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using
  CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.artifacts_capture_provenance_inspected@1.0.0` and `view.runtime_artifacts.artifacts_capture_provenance_inspected@1.0.0`
  read only `reader.artifacts.capture_provenance.inspected@1.0.0`''s verified ref-only projection. Neither
  certifies a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and
  DL-076''s nine-field DurableGenericToken in SP-1300; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspected
  uses schema_id pm.event_payload.artifacts.capture_provenance.inspected.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspectedApplicationV1
  uses schema_id pm.event_payload.artifacts.capture_provenance.inspected.application.v1. Each root enforces
  its own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1300
- SP-1300
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- artifacts.capture_provenance.inspected
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1301 - artifacts.demonstration_video.created prepared owner contract

```yaml
plan_unit_id: TCME-1301
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `artifacts.demonstration_video.created@1.0.0`, prepared
  without admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C
  report). The current exact-name search found only the registration requirement, no full event definition
  or alias. This contract reuses sections 1-9 and the exact `derived_demonstration_video` record definition,
  not another event family''s bindings. Saved fact: A distinct immutable demonstration artifact and its derivation
  manifest were committed from exact admitted raw spans after privacy review and confirmation.


  Producer: `handlers::test_capture::artifacts_create_demonstration_video` under the existing TestCaptureService
  or Testing owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`.
  Capture adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source
  schemas stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json,
  with `.application.v1` identities, null project_id and actual optional run binding; no old Project resource
  is relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source
  capture or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1301; its source_record resolves the immutable actual
  `derived_demonstration_video` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Every raw ID and span resolves to the original admitted raw capture; mixed
  subjects or absent original spans refuse. (2) The manifest has uncaptured_state_introduced=false, overwrites_raw=false,
  immutable=true and accepted privacy review; the output hash and exact media bytes agree. (3) The demonstration
  identity is distinct from all raw identities; output publication follows successful finalization.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1301 before any effect.

  The request captures the original cmd.artifacts.create_demonstration_video request, raw span refs, privacy
  review and confirmation before encoding. Its selected closed request schema is distinct from the completed
  payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `artifacts.demonstration_video.created@1:` + hex(exact UTF-8
  owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using
  CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.artifacts_demonstration_video_created@1.0.0` and `view.runtime_artifacts.artifacts_demonstration_video_created@1.0.0`
  read only `reader.artifacts.demonstration_video.created@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1301; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_created
  uses schema_id pm.event_payload.artifacts.demonstration_video.created.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_createdApplicationV1
  uses schema_id pm.event_payload.artifacts.demonstration_video.created.application.v1. Each root enforces
  its own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1301
- SP-1301
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- artifacts.demonstration_video.created
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1302 - artifacts.demonstration_video.failed prepared owner contract

```yaml
plan_unit_id: TCME-1302
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `artifacts.demonstration_video.failed@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_command_error` record definition, not another event
  family''s bindings. Saved fact: The original demonstration operation ended in a typed failure; no successful
  demonstration output is claimed.


  Producer: `handlers::test_capture::artifacts_create_demonstration_video` under the existing TestCaptureService
  or Testing owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`.
  Capture adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source
  schemas stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json,
  with `.application.v1` identities, null project_id and actual optional run binding; no old Project resource
  is relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source
  capture or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1302; its source_record resolves the immutable actual
  `capture_command_error` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The error belongs to cmd.artifacts.create_demonstration_video and this original
  command instance. (2) The terminal outcome is failure, never success; an external encoder exit code, when
  present in the referenced failure evidence, is nonzero. (3) Partial media remains explicitly partial/quarantined
  under the existing owner and is not exposed as a created demonstration.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1302 before any effect.

  The request captures the original cmd.artifacts.create_demonstration_video request, raw span refs, privacy
  review and confirmation before encoding. Its selected closed request schema is distinct from the completed
  payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `artifacts.demonstration_video.failed@1:` + hex(exact UTF-8
  owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using
  CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept seven years / 220,752,000 seconds from the original saved change it records
  (DL-455, E-CARDS-3 item 3.a, option A). Project records share the existing 2,000,000-entry seven-year
  Project allowance under `RP-OPERATIONAL-2555D@1.0.0` with Storage''s Project first-save anchor adapter;
  application records use `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (count key
  `app:operational_security`). Retrying, reprocessing and restoring never reset the clock. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.artifacts_demonstration_video_failed@1.0.0` and `view.runtime_artifacts.artifacts_demonstration_video_failed@1.0.0`
  read only `reader.artifacts.demonstration_video.failed@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1302; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failed
  uses schema_id pm.event_payload.artifacts.demonstration_video.failed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failedApplicationV1
  uses schema_id pm.event_payload.artifacts.demonstration_video.failed.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1302
- SP-1302
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- artifacts.demonstration_video.failed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1303 - testing.capture.bookmarked prepared owner contract

```yaml
plan_unit_id: TCME-1303
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.bookmarked@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `capture_command_request` record definition, not another event family''s
  bindings. Saved fact: The exact session received a durable bookmark at the requested service clock position,
  with its safe label reference.


  Producer: `handlers::test_capture::testing_capture_bookmark` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1303; its source_record resolves the immutable actual
  `capture_command_request` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The source command is cmd.testing.capture.bookmark and the committed bookmark
  position equals its bookmark_monotonic_ns. (2) The bookmarked position resolves within the exact session
  clock domain and recorded timeline; a position in a missing interval remains labeled as a gap.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1303 before any effect.

  The request captures the original bookmark command with session identity and requested source position before
  bookmark commitment. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.bookmarked@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history `RP-AUTHORITY-INDEFINITE@1.0.0` (DL-453, E-CARDS-3 item 1.a, option A): kept
  permanently, with no age or count expiry and no new count allowance, in Project and application records
  alike; explicit Project and application data deletion and current access still apply, and storage pressure
  refuses new history writes. Canonical original operation/receipt
  authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN and never holds expired
  source history alive. Unknown history policy retains indefinitely/no-count-eviction as materially incomplete,
  without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage holds remain
  unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting a retained
  event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_bookmarked@1.0.0` and `view.runtime_artifacts.testing_capture_bookmarked@1.0.0`
  read only `reader.testing.capture.bookmarked@1.0.0`''s verified ref-only projection. Neither certifies a
  test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1303; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarked
  uses schema_id pm.event_payload.testing.capture.bookmarked.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarkedApplicationV1
  uses schema_id pm.event_payload.testing.capture.bookmarked.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1303
- SP-1303
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.bookmarked
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1304 - testing.capture.clip_saved prepared owner contract

```yaml
plan_unit_id: TCME-1304
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.clip_saved@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `capture_derivation_manifest` record definition, not another event family''s
  bindings. Saved fact: A separately identified immutable clip was saved with exact source raw identity and
  span lineage; raw media was not trimmed in place.


  Producer: `handlers::test_capture::testing_capture_save_clip` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1304; its source_record resolves the immutable actual
  `capture_derivation_manifest` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The source command is cmd.testing.capture.save_clip with exact original raw
  ID, start/end span and privacy review. (2) The saved clip and manifest resolve to those same spans and distinct
  output identity; raw overwrites and uncaptured-state claims refuse.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1304 before any effect.

  The request captures the original save-clip command with exact admitted raw span refs before derivation.
  Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.clip_saved@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_clip_saved@1.0.0` and `view.runtime_artifacts.testing_capture_clip_saved@1.0.0`
  read only `reader.testing.capture.clip_saved@1.0.0`''s verified ref-only projection. Neither certifies a
  test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1304; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_saved
  uses schema_id pm.event_payload.testing.capture.clip_saved.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_savedApplicationV1
  uses schema_id pm.event_payload.testing.capture.clip_saved.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1304
- SP-1304
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.clip_saved
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1305 - testing.capture.effective_quality_changed prepared owner contract

```yaml
plan_unit_id: TCME-1305
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.effective_quality_changed@1.0.0`, prepared
  without admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C
  report). The current exact-name search found only the registration requirement, no full event definition
  or alias. This contract reuses sections 1-9 and the exact `capture_health_receipt` record definition, not
  another event family''s bindings. Saved fact: The service committed a real requested/effective capture-quality
  change under the RuntimeResourceGovernor permit without degrading already retained evidence.


  Producer: `TestCaptureService.commit_effective_quality` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1305; its source_record resolves the immutable actual
  `capture_health_receipt` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) effective_quality_changed is true and at least one effective cadence/dimension/codec/engine
  quality field differs between the referenced before and after session snapshots. (2) The exact governor permit
  and adaptation reason authorize the change; retained_evidence_degraded is false.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1305 before any effect.

  The request captures the original quality observation and prior session/quality snapshot before committing
  effective quality. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.effective_quality_changed@1:` + hex(exact
  UTF-8 owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}`
  using CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_effective_quality_changed@1.0.0` and
  `view.runtime_artifacts.testing_capture_effective_quality_changed@1.0.0` read only `reader.testing.capture.effective_quality_changed@1.0.0`''s
  verified ref-only projection. Neither certifies a test, native runtime or provenance beyond this exact saved
  result. Explicitly adopt SP-278 and DL-076''s nine-field DurableGenericToken in SP-1305; use that family''s
  exact checkpoint key/schema, source-currentness coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild
  and read-time identity checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay
  is passive and cannot execute tools, encoders, commands, network calls, notifications, usage charges or new
  canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changed
  uses schema_id pm.event_payload.testing.capture.effective_quality_changed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changedApplicationV1
  uses schema_id pm.event_payload.testing.capture.effective_quality_changed.application.v1. Each root enforces
  its own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1305
- SP-1305
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.effective_quality_changed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1306 - testing.capture.health_degraded prepared owner contract

```yaml
plan_unit_id: TCME-1306
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.health_degraded@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_health_receipt` record definition, not another event
  family''s bindings. Saved fact: A detector observation committed a worsening health interval and preserved
  its thresholds and evidence, without claiming a root cause.


  Producer: `TestCaptureService.commit_health_observation` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1306; its source_record resolves the immutable actual
  `capture_health_receipt` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The health receipt records healthy to degraded/recovering/failed, degraded
  to failed, or recovering to degraded/failed; an unchanged or improving health observation is not this family.
  (2) The interval clock, stream, frame-health counters, threshold/finding refs and session identity agree
  across the original observation and receipt.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1306 before any effect.

  The request captures the original health observation and prior health/session snapshot before committing
  degradation. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.health_degraded@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_health_degraded@1.0.0` and `view.runtime_artifacts.testing_capture_health_degraded@1.0.0`
  read only `reader.testing.capture.health_degraded@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1306; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degraded
  uses schema_id pm.event_payload.testing.capture.health_degraded.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degradedApplicationV1
  uses schema_id pm.event_payload.testing.capture.health_degraded.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1306
- SP-1306
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.health_degraded
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1307 - testing.capture.health_recovered prepared owner contract

```yaml
plan_unit_id: TCME-1307
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.health_recovered@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_health_receipt` record definition, not another event
  family''s bindings. Saved fact: The service committed recovery of a previously degraded health interval,
  preserving the earlier interval and any gaps.


  Producer: `TestCaptureService.commit_health_observation` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1307; its source_record resolves the immutable actual
  `capture_health_receipt` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The exact health receipt records degraded/recovering/failed to healthy after
  a fresh validating observation. (2) The recovered interval links its prior finding; recovery neither erases
  the degraded interval nor invents missing frames.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1307 before any effect.

  The request captures the original health observation and prior health/session snapshot before committing
  recovery. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.health_recovered@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_health_recovered@1.0.0` and `view.runtime_artifacts.testing_capture_health_recovered@1.0.0`
  read only `reader.testing.capture.health_recovered@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1307; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recovered
  uses schema_id pm.event_payload.testing.capture.health_recovered.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recoveredApplicationV1
  uses schema_id pm.event_payload.testing.capture.health_recovered.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1307
- SP-1307
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.health_recovered
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1308 - testing.capture.interrupted prepared owner contract

```yaml
plan_unit_id: TCME-1308
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.interrupted@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `test_capture_session` record definition, not another event family''s bindings.
  Saved fact: Capture continuity was interrupted by crash, disconnection or producer loss, with the original
  gap and recoverable/partial outcome retained.


  Producer: `TestCaptureService.commit_interruption` under the existing TestCaptureService or Testing owner;
  no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture adopts
  TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas stay exact.
  New application source siblings are in Plans/test_capture_application_records.schema.json, with `.application.v1`
  identities, null project_id and actual optional run binding; no old Project resource is relaxed. Readiness
  stays Project-only as its existing project_id field requires. Missing native source capture or physical admission
  is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1308; its source_record resolves the immutable actual
  `test_capture_session` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The source records an actual producer/transport/crash interruption of the
  exact session, with a gap disposition. (2) No reenactment, repeated frame or newest recording fills the gap;
  ordinary user pause alone is not an interruption.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1308 before any effect.

  The request captures the original interruption trigger, boundary and reason with the prior session before
  the interruption transition. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.interrupted@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept seven years / 220,752,000 seconds from the original saved change it records
  (DL-455, E-CARDS-3 item 3.a, option A). Project records share the existing 2,000,000-entry seven-year
  Project allowance under `RP-OPERATIONAL-2555D@1.0.0` with Storage''s Project first-save anchor adapter;
  application records use `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (count key
  `app:operational_security`). Retrying, reprocessing and restoring never reset the clock. Canonical
  original operation/receipt
  authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN and never holds expired
  source history alive. Unknown history policy retains indefinitely/no-count-eviction as materially incomplete,
  without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage holds remain
  unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting a retained
  event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_interrupted@1.0.0` and `view.runtime_artifacts.testing_capture_interrupted@1.0.0`
  read only `reader.testing.capture.interrupted@1.0.0`''s verified ref-only projection. Neither certifies a
  test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1308; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interrupted
  uses schema_id pm.event_payload.testing.capture.interrupted.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interruptedApplicationV1
  uses schema_id pm.event_payload.testing.capture.interrupted.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1308
- SP-1308
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.interrupted
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1309 - testing.capture.paused prepared owner contract

```yaml
plan_unit_id: TCME-1309
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.paused@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `test_capture_session` record definition, not another event family''s bindings.
  Saved fact: An authorized pause committed the exact existing capture session into paused state.


  Producer: `handlers::test_capture::testing_capture_pause` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1309; its source_record resolves the immutable actual
  `test_capture_session` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The original command is cmd.testing.capture.pause; its prior session is recording
  or degraded and its committed successor is paused. (2) The target, session, stream lineage and existing retained
  media remain the same; viewer close/focus alone is not a pause.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1309 before any effect.

  The request captures the original pause command and prior active session before the pause transition. Its
  selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.paused@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical original
  operation/receipt
  authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN and never holds expired
  source history alive. Unknown history policy retains indefinitely/no-count-eviction as materially incomplete,
  without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage holds remain
  unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting a retained
  event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_paused@1.0.0` and `view.runtime_artifacts.testing_capture_paused@1.0.0`
  read only `reader.testing.capture.paused@1.0.0`''s verified ref-only projection. Neither certifies a test,
  native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s nine-field
  DurableGenericToken in SP-1309; use that family''s exact checkpoint key/schema, source-currentness coverage,
  atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity checks. A
  mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot execute
  tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_paused
  uses schema_id pm.event_payload.testing.capture.paused.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_pausedApplicationV1
  uses schema_id pm.event_payload.testing.capture.paused.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1309
- SP-1309
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.paused
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1310 - testing.capture.provenance_rejected prepared owner contract

```yaml
plan_unit_id: TCME-1310
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.provenance_rejected@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_provenance_selection` record definition, not another
  event family''s bindings. Saved fact: The exact provenance request committed rejected_identity_mismatch,
  rejected_continuity_unverified, original_missing or no_candidate, with no accepted-source claim.


  Producer: `TestCaptureService.commit_provenance_selection` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1310; its source_record resolves the immutable actual
  `capture_provenance_selection` record (the new application sibling only for application capture), except
  supplemental bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner
  outcomes and do not invent a second capture service. Before-record is required for a state/quality/target
  change and null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced
  source/request, and its permission ref equals the captured operation. The original request and prior snapshots
  are captured before the effect; post-state and result snapshots are captured only when the genuine outcome
  is committed, preserving the original owner currentness and writer-generation joins. Exact original schema
  IDs, record_kind, subject, actor, target, Server, Host, Environment, source location and scope must agree
  field by field. Verify hashes from actual immutable bytes, not a caller digest. A missing source record or
  late effect is not reconstructed from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Selection disposition is one of the four non-selected owner dispositions
  and equals the independently evaluated source/continuity evidence. (2) No rejected candidate is exposed as
  verified, original, or a replacement raw capture.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1310 before any effect.

  The request captures the original provenance-selection input with exact subject, candidates and verification
  inputs before committing the rejected disposition. Its selected closed request schema is distinct from the
  completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.provenance_rejected@1:` + hex(exact UTF-8
  owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using
  CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_provenance_rejected@1.0.0` and `view.runtime_artifacts.testing_capture_provenance_rejected@1.0.0`
  read only `reader.testing.capture.provenance_rejected@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1310; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejected
  uses schema_id pm.event_payload.testing.capture.provenance_rejected.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejectedApplicationV1
  uses schema_id pm.event_payload.testing.capture.provenance_rejected.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1310
- SP-1310
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.provenance_rejected
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1311 - testing.capture.provenance_verified prepared owner contract

```yaml
plan_unit_id: TCME-1311
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.provenance_verified@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_provenance_selection` record definition, not another
  event family''s bindings. Saved fact: Exact subject identity, original availability and continuity checks
  committed a selected original capture.


  Producer: `TestCaptureService.commit_provenance_selection` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1311; its source_record resolves the immutable actual
  `capture_provenance_selection` record (the new application sibling only for application capture), except
  supplemental bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner
  outcomes and do not invent a second capture service. Before-record is required for a state/quality/target
  change and null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced
  source/request, and its permission ref equals the captured operation. The original request and prior snapshots
  are captured before the effect; post-state and result snapshots are captured only when the genuine outcome
  is committed, preserving the original owner currentness and writer-generation joins. Exact original schema
  IDs, record_kind, subject, actor, target, Server, Host, Environment, source location and scope must agree
  field by field. Verify hashes from actual immutable bytes, not a caller digest. A missing source record or
  late effect is not reconstructed from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Disposition is selected, identity_verified=true, continuity_verified=true,
  original_available=true and reenactment_substituted=false. (2) selected_capture_id is in the exact requested
  candidate set and resolves to original media with matching subject and content hashes.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1311 before any effect.

  The request captures the original provenance-selection input with exact subject, candidates and verification
  inputs before committing the verified disposition. Its selected closed request schema is distinct from the
  completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.provenance_verified@1:` + hex(exact UTF-8
  owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using
  CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_provenance_verified@1.0.0` and `view.runtime_artifacts.testing_capture_provenance_verified@1.0.0`
  read only `reader.testing.capture.provenance_verified@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1311; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verified
  uses schema_id pm.event_payload.testing.capture.provenance_verified.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verifiedApplicationV1
  uses schema_id pm.event_payload.testing.capture.provenance_verified.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1311
- SP-1311
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.provenance_verified
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1312 - testing.capture.redaction_applied prepared owner contract

```yaml
plan_unit_id: TCME-1312
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.redaction_applied@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_artifact` record definition, not another event family''s
  bindings. Saved fact: A source or encoder masking operation was applied and receipted against exact retained/exported
  spans under the existing privacy policy.


  Producer: `TestCaptureService.commit_retained_redaction` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1312; its source_record resolves the immutable actual
  `capture_artifact` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Effective masking stage is source or encoder; display_only never proves retained
  redaction. (2) Policy/profile, privacy review and masked spans match actual output bytes and disclose every
  unmasked interval. (3) Raw evidence is immutable: any later masked derivative has a distinct identity and
  manifest; a source-stage mask describes what the producer actually delivered.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1312 before any effect.

  The request captures the original retained-redaction request, reviewed mask/selection and original artifact
  refs before applying redaction. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.redaction_applied@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_redaction_applied@1.0.0` and `view.runtime_artifacts.testing_capture_redaction_applied@1.0.0`
  read only `reader.testing.capture.redaction_applied@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1312; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_applied
  uses schema_id pm.event_payload.testing.capture.redaction_applied.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_appliedApplicationV1
  uses schema_id pm.event_payload.testing.capture.redaction_applied.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1312
- SP-1312
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.redaction_applied
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1313 - testing.capture.resumed prepared owner contract

```yaml
plan_unit_id: TCME-1313
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.resumed@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `test_capture_session` record definition, not another event family''s bindings.
  Saved fact: An authorized resume committed the same paused capture session back to recording with truthful
  continuity.


  Producer: `handlers::test_capture::testing_capture_resume` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1313; its source_record resolves the immutable actual
  `test_capture_session` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The original command is cmd.testing.capture.resume; prior state is paused
  and committed successor is recording. (2) Exact target, session and clock lineage continue; any discontinuity
  remains a gap rather than a continuous-media claim.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1313 before any effect.

  The request captures the original resume command and prior paused session before the resume transition. Its
  selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.resumed@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical original
  operation/receipt
  authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN and never holds expired
  source history alive. Unknown history policy retains indefinitely/no-count-eviction as materially incomplete,
  without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage holds remain
  unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting a retained
  event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_resumed@1.0.0` and `view.runtime_artifacts.testing_capture_resumed@1.0.0`
  read only `reader.testing.capture.resumed@1.0.0`''s verified ref-only projection. Neither certifies a test,
  native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s nine-field
  DurableGenericToken in SP-1313; use that family''s exact checkpoint key/schema, source-currentness coverage,
  atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity checks. A
  mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot execute
  tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumed
  uses schema_id pm.event_payload.testing.capture.resumed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumedApplicationV1
  uses schema_id pm.event_payload.testing.capture.resumed.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1313
- SP-1313
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.resumed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1314 - testing.capture.segment_corrupt prepared owner contract

```yaml
plan_unit_id: TCME-1314
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.segment_corrupt@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_segment_manifest` record definition, not another
  event family''s bindings. Saved fact: The service detected a corrupt/incomplete segment and committed quarantine/discard/gap
  truth without presenting playable finalized evidence.


  Producer: `TestCaptureService.commit_segment_recovery` under the existing TestCaptureService or Testing owner;
  no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture adopts
  TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas stay exact.
  New application source siblings are in Plans/test_capture_application_records.schema.json, with `.application.v1`
  identities, null project_id and actual optional run binding; no old Project resource is relaxed. Readiness
  stays Project-only as its existing project_id field requires. Missing native source capture or physical admission
  is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1314; its source_record resolves the immutable actual
  `capture_segment_manifest` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Finalization/recovery evidence identifies corruption and quarantined_corrupt
  or discarded_incomplete; successful finalized evidence cannot select this event. (2) The segment belongs
  to the exact session/stream/sequence and its prior-segment hash chain; missing media remains absent.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1314 before any effect.

  The request captures the original segment recovery observation and prior manifest before committing the corrupt
  disposition. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.segment_corrupt@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept seven years / 220,752,000 seconds from the original saved change it records
  (DL-455, E-CARDS-3 item 3.a, option A). Project records share the existing 2,000,000-entry seven-year
  Project allowance under `RP-OPERATIONAL-2555D@1.0.0` with Storage''s Project first-save anchor adapter;
  application records use `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (count key
  `app:operational_security`). Retrying, reprocessing and restoring never reset the clock. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_segment_corrupt@1.0.0` and `view.runtime_artifacts.testing_capture_segment_corrupt@1.0.0`
  read only `reader.testing.capture.segment_corrupt@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1314; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corrupt
  uses schema_id pm.event_payload.testing.capture.segment_corrupt.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corruptApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_corrupt.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1314
- SP-1314
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.segment_corrupt
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1315 - testing.capture.segment_finalized prepared owner contract

```yaml
plan_unit_id: TCME-1315
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.segment_finalized@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_segment_manifest` record definition, not another
  event family''s bindings. Saved fact: A new immutable structurally complete raw Matroska segment was atomically
  finalized and its exact bytes and manifest were committed.


  Producer: `TestCaptureService.commit_segment_finalization` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1315; its source_record resolves the immutable actual
  `capture_segment_manifest` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Container is Matroska, starts_with_keyframe=true, immutable=true and finalization_state=finalized;
  recovery_disposition is not recovered_finalized. (2) Exact media hash/byte size, stream sequence, previous
  hash, target generation, clocks, frame health and masking equal the source journal and bytes.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1315 before any effect.

  The request captures the original segment sealing input, segment identity and captured span refs before finalization.
  Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.segment_finalized@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_segment_finalized@1.0.0` and `view.runtime_artifacts.testing_capture_segment_finalized@1.0.0`
  read only `reader.testing.capture.segment_finalized@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1315; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalized
  uses schema_id pm.event_payload.testing.capture.segment_finalized.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalizedApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_finalized.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1315
- SP-1315
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.segment_finalized
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1316 - testing.capture.segment_recovered prepared owner contract

```yaml
plan_unit_id: TCME-1316
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.segment_recovered@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_segment_manifest` record definition, not another
  event family''s bindings. Saved fact: Recovery atomically finalized a structurally complete interrupted segment
  as recovered_finalized, preserving original bytes and gaps.


  Producer: `TestCaptureService.commit_segment_recovery` under the existing TestCaptureService or Testing owner;
  no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture adopts
  TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas stay exact.
  New application source siblings are in Plans/test_capture_application_records.schema.json, with `.application.v1`
  identities, null project_id and actual optional run binding; no old Project resource is relaxed. Readiness
  stays Project-only as its existing project_id field requires. Missing native source capture or physical admission
  is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1316; its source_record resolves the immutable actual
  `capture_segment_manifest` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) Recovery disposition is recovered_finalized with finalization evidence, rather
  than ordinary finalization, quarantine or discarded incomplete media. (2) The original interrupted journal,
  session/stream/sequence/hash chain and durable recovered bytes agree; no reenactment or filled gap is admitted.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1316 before any effect.

  The request captures the original segment recovery observation and prior manifest before committing the recovered
  disposition. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.segment_recovered@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_segment_recovered@1.0.0` and `view.runtime_artifacts.testing_capture_segment_recovered@1.0.0`
  read only `reader.testing.capture.segment_recovered@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1316; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recovered
  uses schema_id pm.event_payload.testing.capture.segment_recovered.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recoveredApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_recovered.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1316
- SP-1316
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.segment_recovered
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1317 - testing.capture.started prepared owner contract

```yaml
plan_unit_id: TCME-1317
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.started@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `test_capture_session` record definition, not another event family''s bindings.
  Saved fact: The shared TestCaptureService began recording the exact permitted target with a governor permit
  and one declared encoder stream per admitted target stream.


  Producer: `handlers::test_capture::testing_capture_start` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1317; its source_record resolves the immutable actual
  `test_capture_session` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The original command is cmd.testing.capture.start; captured requested/admitted
  intent precedes the first recording session state. (2) Exact ordinary target, generation, policy, permission
  and resource permit agree; focus, viewer count and editor target do not mint another encoder. (3) Audio is
  off unless its separate exact target grant is current; microphone/system permission is never inferred.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1317 before any effect.

  The request captures the original start command and admitted capture target/request before starting capture.
  Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.started@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical original
  operation/receipt
  authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN and never holds expired
  source history alive. Unknown history policy retains indefinitely/no-count-eviction as materially incomplete,
  without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage holds remain
  unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting a retained
  event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_started@1.0.0` and `view.runtime_artifacts.testing_capture_started@1.0.0`
  read only `reader.testing.capture.started@1.0.0`''s verified ref-only projection. Neither certifies a test,
  native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s nine-field
  DurableGenericToken in SP-1317; use that family''s exact checkpoint key/schema, source-currentness coverage,
  atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity checks. A
  mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot execute
  tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_started
  uses schema_id pm.event_payload.testing.capture.started.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_startedApplicationV1
  uses schema_id pm.event_payload.testing.capture.started.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1317
- SP-1317
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.started
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1318 - testing.capture.stopped prepared owner contract

```yaml
plan_unit_id: TCME-1318
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.stopped@1.0.0`, prepared without admission
  under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report). The current
  exact-name search found only the registration requirement, no full event definition or alias. This contract
  reuses sections 1-9 and the exact `test_capture_session` record definition, not another event family''s bindings.
  Saved fact: The explicit stop operation finalized its capture session with the exact complete, partial_with_gaps,
  failed_no_media, cancelled_with_evidence or interrupted_recoverable result.


  Producer: `handlers::test_capture::testing_capture_stop` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`. Capture
  adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source schemas
  stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json, with
  `.application.v1` identities, null project_id and actual optional run binding; no old Project resource is
  relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source capture
  or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1318; its source_record resolves the immutable actual
  `test_capture_session` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The original command is cmd.testing.capture.stop and names the same nonterminal
  session; finalizing precedes terminal publication where media must finalize. (2) All finalized/quarantined/discarded
  segments and gaps are accounted for before the terminal receipt; no-media/partial/interrupted outcomes cannot
  claim complete. (3) Stop does not imply test passed, motion verified or provenance accepted.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1318 before any effect.

  The request captures the original stop command and prior active session before the stop transition. Its selected
  closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.stopped@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history kept 90 days / 7,776,000 seconds from the first successful save that survives a restart
  (DL-454, E-CARDS-3 item 2.a, option A). Project records share the existing 2,000,000-entry 90-day Project
  allowance under `RP-TELEMETRY-90D@1.0.0`; application records use
  `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (count key `app:routine_observation`). Retrying a save,
  reprocessing old history and restoring a backup never restart the clock. Canonical original
  operation/receipt
  authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN and never holds expired
  source history alive. Unknown history policy retains indefinitely/no-count-eviction as materially incomplete,
  without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage holds remain
  unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting a retained
  event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_stopped@1.0.0` and `view.runtime_artifacts.testing_capture_stopped@1.0.0`
  read only `reader.testing.capture.stopped@1.0.0`''s verified ref-only projection. Neither certifies a test,
  native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s nine-field
  DurableGenericToken in SP-1318; use that family''s exact checkpoint key/schema, source-currentness coverage,
  atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity checks. A
  mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot execute
  tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stopped
  uses schema_id pm.event_payload.testing.capture.stopped.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stoppedApplicationV1
  uses schema_id pm.event_payload.testing.capture.stopped.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1318
- SP-1318
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.stopped
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### TCME-1319 - testing.capture.target_changed prepared owner contract

```yaml
plan_unit_id: TCME-1319
unit_type: interface_contract
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.capture.target_changed@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `capture_target_switch_receipt` record definition, not another
  event family''s bindings. Saved fact: An explicit generation-aware target switch was committed with old/new
  target, exact clock anchors and continuity disposition.


  Producer: `handlers::test_capture::testing_capture_target_update` under the existing TestCaptureService or
  Testing owner; no dispatcher/handler exists by virtue of this binding. Scope is `application_or_project`.
  Capture adopts TCME-008''s real No project Server/Host/Environment/thread/session context. Project source
  schemas stay exact. New application source siblings are in Plans/test_capture_application_records.schema.json,
  with `.application.v1` identities, null project_id and actual optional run binding; no old Project resource
  is relaxed. Readiness stays Project-only as its existing project_id field requires. Missing native source
  capture or physical admission is unavailable, never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1319; its source_record resolves the immutable actual
  `capture_target_switch_receipt` record (the new application sibling only for application capture), except
  supplemental bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner
  outcomes and do not invent a second capture service. Before-record is required for a state/quality/target
  change and null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced
  source/request, and its permission ref equals the captured operation. The original request and prior snapshots
  are captured before the effect; post-state and result snapshots are captured only when the genuine outcome
  is committed, preserving the original owner currentness and writer-generation joins. Exact original schema
  IDs, record_kind, subject, actor, target, Server, Host, Environment, source location and scope must agree
  field by field. Verify hashes from actual immutable bytes, not a caller digest. A missing source record or
  late effect is not reconstructed from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The switch is cmd.testing.capture.target.update or the owner-required receipted
  follow_controller_page generation change; focus_triggered=false. (2) Old target equals the prior session
  target and new target equals the admitted current request/controller target. (3) The effective switch and
  first new-target frame preserve monotonic order and disclosed gaps; no capture target silently widens.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1319 before any effect.

  The request captures the original target-update command, requested target and prior session/target before
  the switch. Its selected closed request schema is distinct from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.capture.target_changed@1:` + hex(exact UTF-8 owner_operation_id);
  app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using CV-366''s actual Server
  and original effect-specific operation identity. Distinct effects reserve distinct operation components before
  commitment. Scope partition remains app or Storage''s reversible project~ encoding. Copy occurred_at_utc
  and producer_sequence_id from the immutable original owner input; all Storage-assigned sequence/timestamps/receipt
  terms come only from authenticated Storage custody. Producer-semantic comparison is exactly EventRecord''s
  caller-owned preimage and excludes Storage metadata. Shared owner number/time editions govern; this lane
  defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns the original
  full value/result without a second capture, encode, bookmark, read audit, notification or event. Different
  digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only as replay_only_not_appendable.
  Historical compatibility-only reads never pass through current-writer admission.


  Retention: history `RP-AUTHORITY-INDEFINITE@1.0.0` (DL-453, E-CARDS-3 item 1.a, option A): kept
  permanently, with no age or count expiry and no new count allowance, in Project and application records
  alike; explicit Project and application data deletion and current access still apply, and storage pressure
  refuses new history writes. Canonical
  original operation/receipt authority uses RP-AUTHORITY-INDEFINITE; the derived family uses RP-PROJECTION-3GEN
  and never holds expired source history alive. Unknown history policy retains indefinitely/no-count-eviction
  as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_capture_target_changed@1.0.0` and `view.runtime_artifacts.testing_capture_target_changed@1.0.0`
  read only `reader.testing.capture.target_changed@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1319; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changed
  uses schema_id pm.event_payload.testing.capture.target_changed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changedApplicationV1
  uses schema_id pm.event_payload.testing.capture.target_changed.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- TCME-001
- TCME-006
- TCME-008
- CV-1319
- SP-1319
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Test_Capture_and_Motion_Evidence.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.target_changed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```
