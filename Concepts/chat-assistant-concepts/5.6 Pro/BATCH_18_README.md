# Batch 18 — Scheduled messages and recurring windows

## Status and scope

A bounded HTML-concept delivery candidate, continuing the applied Batch 17 at `f9effd40420e496647a3af6cb2902de1ea08b9d7`. No Batch 19 work, native implementation, governance seal, formal audit, production readiness, or user acceptance is claimed. The separate delivery report is the executed verification record. Historical B01–B17 reports and the first B18 continuation note are history, not current passes.

Final application HTML SHA-256: `4608b63a85ac39dd4ad339848ba885e2281c1241f99be02a936d824fb93ba47a`. `index.html` and `PM_Chat_Assistant_5.6_Pro_Standalone.html` are byte-identical. The builder also reports a normalized-text digest; external raw SHA-256 above is the custody value.

## Try it

Open the standalone HTML. In **Demo Studio**, choose **Scheduled messages & recurring windows · Batch 18**.

**Send the version you scheduled** prepares one thread, a three-value V1 artifact and an ordinary composer request. It creates no schedule or work. Use the wand → Scheduling → Schedule Message, set May 10, 2027, 22:00, America/New_York, and commit. The source composer clears only after the session-local transaction commits. The manager presents the schedule in Scheduled Messages. Use the guide's local-clock controls to publish V2, disconnect retained V1 and evaluate the due time: the schedule becomes Held rather than substituting V2. Restore V1 and retry; the actual dispatched user message references V1 and a local calculation produces **21**. Repeated delivery returns the original message identity. Open the retained result or Sent link and inspect Details for attempts and exact bindings.

**One build, across two windows** prepares the retained B17 calculation inputs, not an executing Plan. Send, open the Plan, then More → Build At. Configure a recurring 22:00–23:00 America/New_York window. Opening the local test clock admits exactly one PlanRun. Normalization executes and produces a real retained output. Wind-down stops further work at the adapter's bounded safe boundary. The primary remains Building… and the secondary explanation states the pause. The next eligible window resumes that same PlanRun and retains the original normalization output. Completion requires the independent local validation and the shared To-Do outcomes; the result is **9532 cents**. Later occurrences do not start another run. The guide also permits inspecting window plus Usage availability and explicit run-specific consent.

The guide's clock is an explicitly local fixture clock. It evaluates owner calendar rules; it is not a background timer or a service that runs when this page is closed. No global Date override is used.

## Implementation

- The existing Scheduling owner now freezes exact text, destination, runtime route, scope, permissions and immutable artifact revisions. Unknown or unavailable owners refuse; no fallback to the Assistant or latest artifact is invented.
- Creation, edit and delivery have distinct idempotency/currentness domains. Edits preserve schedule identity and increment revision; stale actions fail closed. User-message publication and the schedule receipt share the existing transaction owner. Revalidation after publication helpers prevents partial or stale sends.
- Failed/held attempts remain visible. Identical text/time is not a deduplication key. Transcript insertion uses actual dispatch time, not scheduling time.
- Pure `scheduling-time.js` handles local calendar days, overnight windows, first-occurrence folds, first-valid-instant gaps, wind-down and next occurrence. It has no schedule records or timer authority.
- Plan pause/resume consumes the existing Scheduling predicate and the existing Plan/To-Do owners. One recurring target retains one PlanRun. Manual Stop/Pause, scope/permission/route checks and quota eligibility outrank automatic resumption.
- Schedule Manager retains its four categories, with independent message/window status, search and time-order controls. Technical refs remain in Details and historical message receipts are quiet.
- `freeze.py` now records link-text metadata without traversing symlinks. The unrelated tracked `handoff/node_modules` link need not be deleted to make a byte freeze. This does not make that external dependency portable, installed or tested. Root symlinks and special files still refuse.

## Important open coverage

This is not a 47/47 historical-clause closure. `BATCH_18_COVERAGE.json` preserves all 47 worklist IDs and maps grouped current-owner clauses to bounded implementation/tests, without inventing unavailable original per-ID wording.

**Scheduled Crew execution is still unavailable.** The upstream Plan/Crew path lacks the atomic scheduled-Crew owner adapter required to commit CrewRun, PlanRun and To-Dos together. The picker explicitly disables that option and the owner rejects programmatic requests. Agent and goal-driven scheduled builds are exercised. The refusal is not a successful Crew implementation.

**Collaborative scheduled-message destinations are still unavailable unless a destination owner adapter is registered.** This batch rejects an unknown/ended owner and never silently delivers to Assistant. It does not establish exact-once shared collaboration-transcript delivery. Likewise an attachment without a retained immutable artifact revision, or a live browser-element reference, is refused rather than resolved later; general folder/file snapshot provisioning is not implemented by these demos.

Durable server timers, restart/missed-backlog recovery, provider execution, OS scheduling, webhook execution, cross-host continuation, complete retention/GC and production permissions are not implemented or proved. Best-effort browser persistence is not server authority. Local receipts and `sha-demo` runtime keys are concept data, not native EventRecords or cryptographic storage integrity.

The local work adapter proves bounded arithmetic and safe boundaries between its operations, not arbitrary network/filesystem side-effect recovery. Native time-zone database distribution and changes are not established. The existing full FinalGUISpec owner body remained unavailable through the connector; the applicable Scheduling, Plan, To-Do, Goal, Artifact, Composer and Collaboration ownership was used.

Batch 17's real native print-dialog check remains separately manual/unverified. This batch does not change the print-export implementation or treat a print-observation probe as OS-dialog proof.

## Reproduce

Use external fresh evidence folders. Python Playwright, Chromium, Node, and for recording Xvfb/ffmpeg are required. `/usr/bin/chromium` is the retained test launcher path.

```sh
python3 build.py
python3 -B tests/b18/test_freeze.py
python3 -B tests/b18/freeze.py --root . --manifest /external/new-source-freeze.json
python3 tests/b18/run.py handlers --outdir /external/new-b18-handlers
python3 tests/b18/run.py surfaces --outdir /external/new-b18-surfaces
python3 tests/b18/run.py record --outdir /external/new-b18-record
python3 tests/b18/run.py regressions --outdir /external/new-b18-regressions
python3 -B tests/b18/freeze.py --root . --manifest /external/new-source-freeze.json --verify-only
```

Run heavy browser groups serially. B18 tests execute the entire frozen HTML using set_content, not a mock application. The full regression entry point uses the already documented B17 hash-pinned B01/B02 adaptations; their original files and diffs remain preserved. Read the delivery report for actual group verdicts, including any failures; this README is not a blanket historical-suite pass.

## Delivery and integration

The guarded update is merge-only, using exact before/after hashes, whole-target preflight, external backup and rollback. Extract it outside the repository and run its default read-only preflight in a trusted quiescent isolated worktree. It neither stages, commits nor pushes. Unknown overlapping bytes refuse; there is no force option. The cumulative archive is for rebuild/continuation, not indiscriminate copying over another checkout. Archive absence never instructs deletion.

All supplied B17 source/test paths are retained. Ten protected motion/orbit/variant JS/CSS sources are byte-identical. Raw screenshots, recordings and logs ship in separate evidence, not as repository runtime modules. Installer tests are Linux plus portable negative reparse tests, not native Windows/macOS or hostile-directory-race proof.

## B15 recurring-window test alignment

The original B15 `recurring_reuses_run` case assumed every automatic window pause was the generic manual `paused` attention kind. B18 instead projects the exact `window` reason and `PlanRun.state=waiting_window`; the bound Goal stays active while its run waits. A fresh characterization proved the original first-admission, same-run resume, and manual-pause protections still hold. The adapted test now requires all of those window-specific fields plus the original run identity, rather than merely changing a label check. No application code changes for this adaptation. The original failed receipts and exact driver diff are retained in separate evidence. Final regression reporting distinguishes the original chain from the complete adapted B15 rerun.
