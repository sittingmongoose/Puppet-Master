# Batch 13 — Context Lens and Wonderer

This is the cumulative **5.6 Pro Assistant concept**, continuing the supplied
Batch 12 source. It is not a new Puppet Master app, a Plans rewrite, or a
production runtime implementation. Use the guarded delta to install into an
existing checkout. The cumulative source ZIP is a recovery/inspection copy,
not permission to replace or delete other repository files.

## Open the four exercises

Open `index.html` or `PM_Chat_Assistant_5.6_Pro_Standalone.html`, then **Demo Studio
→ Context Lens & Wonderer · Batch 13**. Both HTML files are generated from the
same sources and contain the same bytes.

**Shape, summarize, and restore.** Open the Lens button beside search. Mute an
irrelevant message and seal that operation; Focus a constraint and seal it.
Choose Subcompact, select other messages, and inspect their source-linked
preview before Apply. Cancel changes no effective context. After applying,
Rehydrate sources restores the original content; Collapse reapplies the current
summary; Release removes an operation. Turn Off releases all shaping, reports
the affected counts, and leaves canonical history intact.

**A preview is not a promise.** Select the ranking source and create a preview.
Use the labelled source-revision exercise to revise that message before Apply.
The preview becomes stale and Apply is disabled. A late invocation is rejected
by the same protocol, not just by the button. Refresh makes a new preview tied
to the new content and revision; open its full source and then apply it.

**Follow a connected lead.** Configure the existing BrainStorm modal and Start.
The core roster remains four roles; Wonderer is a fifth, additive participant.
Open leads and evidence. Research the ordering sample, inspect its shared
artifact, and deliberately include the supported lead with a reason. Check
measurement availability and exclude the unsupported performance claim. The
fallback can be included as an explicit user decision, not a researched fact.
Play the recorded core round; only after the core decision and every specialist
disposition are ready can Synthesize Deep Plan create one Plan through the
existing Plan owner. Core dissent remains visible.

**Evidence changes; dissent stays.** Revise the ordering sample while a source
check is pending. The outdated callback is rejected. Recheck the current source
and include it; revising it again removes that inclusion and blocks synthesis
until rechecked or explicitly excluded. The recorded core majority prefers a
network-dependent option, but the hard offline requirement controls the final
choice. All three dissenting votes survive unchanged in the resulting Plan.

Guides can be dismissed without removing the feature controls. The revision
buttons are explicitly local test fixtures, not hidden changes to other threads.

## What the concept actually executes

`lens-protocol.js` is the single owner of session-local selection, operations,
preview binding, source comparison, Apply, release, rehydration, and branch
copying. `lens.js` renders that owner state and dispatches existing Lens actions.
The compact chooser is anchored to the Lens button; the expanded controls and
preview occupy an **in-flow** row rather than covering the transcript.

The local summary is a bounded set of actual source excerpts, **not a model
summary**. Omitted characters are disclosed and full sources remain available.
Small selections may not become smaller; no token saving or model-output quality
is fabricated. `effectiveHistory` is an inspectable local assembly projection,
not proof that a provider received a particular prompt. Focus marks priority
and protection while preserving source chronology. Mute leaves visible history
but omits those messages from that local assembly.

`wonderer-protocol.js` adds lead/evidence/disposition records to the existing
`CollaborativeRun`. It does not create a second run, Plan, artifact store,
workflow engine, or core voting mechanism. The adapter uses the shared modal,
participant roster, artifacts, BrainStorm ingress, and Plan creation path.

The ordering exercise executes a small, fixed JavaScript algorithm over shown
JSON input. It does not execute a Worker or measure latency. Recorded core
proposals and votes reuse the prior BrainStorm exercise. The empty measurement
sample yields **inconclusive**, never a speedup. Research support does not
automatically include a lead; explicit user choices remain labelled as choices.

## Ownership, commands, and UI wiring

No new canonical `cmd.*` IDs are minted by this package. Existing planned Lens
commands remain `cmd.chat.context_lens.toggle`, `.set_mode`, `.turn_off`,
`.toggle_message_selection`, `.clear_selection`, `.apply_subcompact`, and
`.revert_subcompact`. Preview/cancel, opening a source, local disclosure state,
fixture controls, and recorded playback are concept-local actions, not new
product command registrations. The exact adapter mapping is recorded in
`BATCH_13_WIRING.json`.

Configuration and run controls use the existing collaboration owner. Core
proposal, debate, evidence, vote and decision ingestion remains in
`brainstorm-protocol.js`. Wonderer only gates specialist convergence and adds
source-linked, epistemically labelled sections to the existing Plan payload.
Core decisions, steps, votes, hard constraints and dissent are not replaced.
The process card remains after the Plan is created. Duplicate Apply and duplicate
synthesis reuse their original identities.

## Integrity and boundaries

The implementation checks content/revision/source references, scope and epoch,
not just a button state. It rejects stale Apply, stale research completion,
wrong-project/thread evidence, replaced specialist assignments, cancelled or
paused runs, and incomplete synthesis. Changed or revoked evidence removes
eligibility rather than quietly keeping an old inclusion. Source comparisons
are exact local record comparisons; they are not cryptographic attestation.

State is session-local. This package does **not** prove restart/crash durability,
provider isolation, live research, quota/cost measurement, Rust/Slint dispatch,
protected browser security, browser Event Authority admission, or the separate
formal packet audit. No WorkNodes, NodeSeeds, native handlers, governance locks,
or canonical Plans are created or enabled.

The recovered 19-row batch inventory includes Grill Me and PRD/Planning Wizard
placements. Their existing sources/controls are preserved. Batch 13 does not
claim to newly execute the full PRD/Wizard or Grill Me lifecycles. The row-level
coverage delta distinguishes these inherited/out-of-scope clauses. The eight
WONV IDs were recovered without their complete original companion wording;
owner-supported convergence is tested, but that is not an exhaustive per-clause
packet certification. `full_feature_acceptance` remains false, as in prior
bounded demo batches. Batch 14 and later remain planned.

## Reproduce verification

Use Python with Playwright and a local Chromium executable, plus Node. The
launcher installs nothing. Keep outputs outside the concept directory.

```bash
python3 build.py --check
python3 tests/b13/run.py verify --outdir /tmp/pm-b13-verify
python3 tests/b13/run.py boundaries --outdir /tmp/pm-b13-boundaries
python3 tests/b13/run.py record-shape --outdir /tmp/pm-b13-motion-shape
python3 tests/b13/run.py record-dissent --outdir /tmp/pm-b13-motion-dissent
```

Recordings require Xvfb and FFmpeg. Acquisition targets 60 Hz and preserves
actual timestamps without interpolation; RAF timing and long tasks are reported
separately. A 60 Hz capture is not a continuous-60-fps rendering guarantee.
Use the retained `tests/b12/frames.py` to decode every recorded frame into
consecutive contact sheets. Generated sheets do not certify their own visual
quality.

The authoring browser blocks `file://` navigation, so automated tests load the
exact generated HTML bytes through `set_content`. Actual double-click loading
and persistent-origin behavior are not claimed as tested here.

## Preservation and installation

Canonical Plans, Settings/onboarding sources, other concepts, and all ten
protected `motion`, `variants-a/b/c`, and `orbit` source files remain unchanged.
All inherited checkpoint reports retain their original claim boundaries and
hashes; the new checkpoint describes this delivery only. Existing audit evidence
is not retrospectively relabelled as final-build evidence.

`APPLY_BATCH13.py` in the update ZIP defaults to check-only, verifies full-file
before/after hashes, refuses conflicting edits and symlinks, backs up replaced
files outside the checkout, and does not invoke Git. It cannot make a multi-file
install atomic against an unrelated concurrent writer. Coordinate writes, review
the diff, and deliberately stage only the updated paths. Do not use force or a
broad reset to bypass a conflict. No repository branch, commit, push or landing
was performed by this delivery.
