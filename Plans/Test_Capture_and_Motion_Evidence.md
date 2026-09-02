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

Codec selection order is H.264 High, VP9 Profile 0, VP8, then certified/offline AV1. HEVC is export-only. Raw evidence uses durable atomic Matroska segments; MP4 is an export/derived container, never the only crash-recovery source.

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

These command schemas and fixtures are static only. Central catalog rows, Event Authority admissions, native encoders/backends/sole handlers, production wiring and reverse coverage, emitted media, crash-recovery execution, and runtime receipts remain absent.

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

## 10. PMConcept7 integration evidence campaign

The Settings, Product Onboarding, Guided Tour, Doctor, hover-tag, Server/remote, Backup/Restore, Browser/testing/capture, SCM/Origin, Named Plan, performance, Plugins owner projection, and Home-workspace integration closes with one consolidated browser-concept evidence campaign after the generated artifact and canonical content freeze. The campaign exercises every touched system and every modified animation, including Settings preview/apply/rollback/reset/import/export; theme, Glass transparency, tooltip visibility, and Reduced Motion; each Onboarding path and its interruption/reversal/resize/theme variants; Automatic Preparation pending, measured-running, accepted-ready, owner-failed, and same-operation retry projections without synthetic progress or readiness; Guided Tour; every Doctor remediation mode and exact return; Server and route continuity; Full Server Backup and restore modes; Browser/capture; source-control and Origin routes; performance fixtures; the Plugins four-tab owner projection, truthful handler-unavailable command path, and Doctor return; global hover entry/exit/collision/dynamic state; and T48 Home motion. A chapter omitted from the scenario manifest is missing evidence, not an implicit pass.

The requested capture target is `60 fps`, and capture attempts to retain every delivered compositor frame. Reports record requested and actual cadence, delivered timestamps, P50/P95/P99 intervals, delayed/dropped/repeated-frame estimates, and capture degradation. Frames are never resampled and then represented as natively captured at 60 fps. Durable campaign material includes lossless source frames, per-frame hashes, a frame index, an FFV1 Matroska master, a review MP4, action/scenario manifests, browser/runner/artifact/configuration hashes, console/network/performance logs, and explicit gap or encoder failure receipts. A derived contact sheet or MP4 never replaces the full-resolution source frame or raw master.

Every full-resolution delivered frame receives at least one recorded review. Onboarding choreography, Retro and Reduced Motion boundaries, Guided Tour, hover entry/exit, interruption/reversal, responsive transitions, theme changes, and any defect span receive two independent reviewers. Review assignments use non-overlapping ordinary ranges where possible; high-risk overlap is explicit. The primary integrator reviews every contact or multi-view sheet and every defect candidate. Findings identify exact chapter/frame ranges, severity, evidence, disposition, repair, and replacement-capture references. Coverage alone cannot close review: unresolved findings, repaired findings without an admitted replacement capture, missing primary review, hash drift, or incomplete frame coverage fail the terminal review gate. A repaired chapter is re-recorded and the affected aggregate checks rerun before closure.

Deterministic Playwright with system Chrome, an interactive enabled ChatGPT Chrome-extension pass, and a separate Codex in-app-browser pass each bind to the exact artifact SHA and record browser identity, scenarios, observations, screenshots, and disposition. These are distinct browser-concept evidence lanes. They do not certify native Slint 1.17.1 rendering, real platform integration, production handlers, assistive technology, network/WAN behavior, backup media, SCM providers, old hardware, or native performance.

All screenshots, recordings, source frames, extracts, reports, and temporary harness material are approval-gated evidence. They remain intact until the user explicitly approves cleanup. Cleanup then removes only enumerated temporary/evidence paths, writes a cleanup receipt with pre-delete hashes and recovery disposition, preserves reusable regression tests, compact audit results, Touch Closure coverage, scenario/timing manifests, evidence hashes, and findings, and reruns reproducibility plus governance gates. Neither campaign completion nor user review alone authorizes cleanup.

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
| PMConcept7 consolidated capture, frame review, defect recapture, interactive-browser receipts, approval cleanup | this document's TCME-007 acceptance lane; no product-runtime ownership | PMConcept7 build/audit pipeline, Final GUI, Settings, Onboarding/Doctor |

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
canonical_text: Testing and Runtime Artifacts expose independent session cards, ObservableWork, frame-step/bookmark/action-jump/0.25x playback, synchronized evidence panes, before-after and side-by-side comparison, requested/effective target and quality, health, masking, raw/derived identity, source capture, and provenance without treating visibility or artifact presence as test success; the ten lane-owned capture/artifact IDs use one typed request/result/error/availability family while central registration and native runtime wiring remain absent.
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

### TCME-007 - Consolidated PMConcept7 Motion Evidence And Approval-Gated Cleanup

```yaml
plan_unit_id: TCME-007
unit_type: acceptance_gate
status: accepted
owner_doc: Plans/Test_Capture_and_Motion_Evidence.md
canonical_text: The final PMConcept7 integration campaign binds one exact generated artifact to complete system and animation scenarios, actual delivered-frame cadence, lossless frame and FFV1 evidence, independent full-resolution frame review, defect repair and replacement capture, separate system-Chrome/Chrome-extension/in-app-browser receipts, and user-approval-gated cleanup followed by fresh gates; browser evidence never becomes native Slint or production-runtime certification.
gui_related: true
gui_classification_reason: This unit governs visual, motion, interaction, accessibility, and browser review evidence for every touched PMConcept7 surface.
depends_on: [TCME-001, TCME-002, TCME-003, TCME-004]
unblocks: []
acceptance_criteria:
  - The immutable campaign manifest covers every touched system and modified animation, including Automatic Preparation pending/measured/ready/failure/same-operation-retry owner projections plus the Plugins owner projection and Doctor route, and every report binds to one exact generated-artifact hash.
  - The aggregate gate requires ten exact browser runs, including the standalone Plugins projection matrix; removing or demoting that run is a census failure rather than an optional-evidence disposition.
  - Capture targets 60 fps, retains delivered compositor frames, reports actual cadence and degradation, and never represents resampling as native capture cadence.
  - Lossless frames, per-frame hashes/index, FFV1/MKV, review MP4, traces, console/network logs, action/scenario manifests, and provenance hashes are retained.
  - Every full-resolution frame receives one reviewer, high-risk spans receive two independent reviewers, and the primary integrator reviews every contact sheet and defect candidate.
  - Unresolved findings, missing replacement capture, incomplete review, missing interactive-browser receipts, stale/mixed hashes, or a false native/runtime claim fail the aggregate gate.
  - Evidence remains until explicit user approval; enumerated cleanup writes a receipt and is followed by reproducibility and governance gates.
validation_surfaces: [Concepts/pm7-tools/verify/final_campaign_capture.mjs, Concepts/pm7-tools/verify/review_capture_frames.py, Concepts/pm7-tools/verify/final_evidence_gate.py, final campaign and interactive-browser receipts]
risk_class: motion_evidence_gap_or_false_certification
reasoning_tier: high
context_scope: pmconcept7_final_evidence_and_cleanup
implementation_surfaces: [Plans/Test_Capture_and_Motion_Evidence.md, Concepts/pm7-tools/verify]
node_compile_hint: {mode: acceptance_evidence_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:CAP-005, source_ref:egolite-requirement:CAP-009, source_ref:egolite-requirement:CAP-011, source_ref:egolite-requirement:CAP-012, source_ref:egolite-requirement:CAP-016, source_ref:egolite-requirement:CAP-018, source_ref:egolite-requirement:CAP-019, source_ref:egolite-requirement:CAP-020, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:100-114, source_ref:packet:PKT-04/10_REQUIREMENT_RETENTION_AUDIT.md:20-38]
negative_constraints:
  - Do not call browser capture native Slint, platform, hardware, production-handler, network, backup-media, SCM, or assistive-technology certification.
  - Do not resample footage and claim native 60-fps capture.
  - Do not close review while any frame, high-risk overlap, primary review, or defect replacement is missing.
  - Do not delete approval-gated evidence before explicit user approval.
```

## Migration Coverage

This canonical compile plus TCME-007 records the acceptance contract consumed by the authored PMConcept7 build, browser campaign, frame-review, and aggregate-evidence tools. Those tools are browser-concept verification infrastructure, not product runtime handlers, encoders, platform backends, native Slint implementation, production wiring, WorkNodes, NodeSeeds, executable queues, or runtime certification. Central product command/event/wiring registration and native/runtime implementation remain separate owner work; the final governance seal may index this accepted PlanUnit only after content and evidence stabilize.

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
canonical_text: >-
  Test Capture and Motion Evidence owns exactly 10 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
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
