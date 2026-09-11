# Batch 15 — verification and installation boundaries

## Delivery status

**Completed bounded HTML-concept workflows; user installation and acceptance are pending.** Batch 16 has not started. No GitHub push, shared-worktree mutation, native Rust/Slint implementation, governance sealing, Event Authority admission/completion, or formal/global audit completion is claimed.

Final generated `index.html` and `PM_Chat_Assistant_5.6_Pro_Standalone.html` are byte-identical:

```text
Bytes:       3319597
SHA-256:     fbc28efc7b8e1d041d0158e454a05e1eb97e2aba46c32c51937ce5b4420dec1c
Git blob:    71d456f3b60baad66154c0ba5f33a76f88394fd6
```

The clean build check deletes **both** generated outputs and compares raw bytes. `build.py --check` also passes, but its normalized comparison is not substituted for raw equality. The final cumulative ZIP and actual guarded installer have their own extraction/rebuild receipts in the separate evidence; an inventory alone is not installation proof.

## Repository and recovery

The GitHub connector was used to read current AGENTS.md and Plans index and pin implementation to `79464dc0311b6e99dcef2e659d6c226a6f02348b`. The bounded workspace/branch/source check found no usable saved B15 source. The ten recovered images were not used as source or final-build evidence. Implementation started from the verified B14 archive SHA-256 `cc3831bb63e90220ed7997f6bed1097a1aa75794ad32b9be433a8e7bed6f11bf`.

Affected existing source and metadata identities were compared with the pin by Git blob. A later connector recheck observed `f12cc3d305a942a9a61c6860a5425c4e43384c18`, nine commits ahead. The comparison contained no overlapping Assistant source/metadata changes or changes to AGENTS.md/the index. The Goal owner acquired 11 lines promoting 21 payload schemas under DL-039. That owner change was read: it did not change validation rules, admit events, enable execution, certify depth, or restore retired Goal constructs. Those newer Plans/report/schema/script changes are not in this package.

On release continuation, the connector observed `900bf485393eaafa8ddea8f7e2fd7abc5d215736`, 26 commits beyond that prior recheck. Current AGENTS.md and Plans index were re-read. Exact live Git blobs for goals.js, plans.js, scheduling.js, todos.js, app.js, build.py and threadops.js still matched the verified B14 baseline. TDR-012 / DL-042 was reviewed in the current To-Do owner: historical chat.plan_todo_updated remains readable without aliasing or new append authority; future per-item events remain individually admission-gated. That addition explicitly changes no GUI behavior and does not relax the controller/evidence rules. This package does not implement or claim that historical migration, allocate missing event bindings, or replace the newer Jujutsu/source-control/Event Authority owner work. The recheck is bounded, not a fresh global Plans audit. See separate evidence repository-recheck/RESULT.json.

The cumulative source archive is not a repository snapshot or deletion list. The installer refuses unknown overlapping working-tree bytes and preserves unlisted newer work. The original B14 manifest is preserved verbatim under `history/`; its historical unpublished-at-delivery statement is not presented as current publication truth.

## Implemented and exercised

One Goal owner holds a concise objective, accepted revisions and four lifecycle states. Direct Save is explicit user authorization. A requested replacement remains a proposal until Approve Change; Cancel preserves the accepted objective. Approval never silently resumes paused work. Captured revision/hash, Goal/run identity, scope, binding, generation and stop epoch are checked again at continuation dispatch, not only at evaluation.

The shared Plan Build handler handles `cmd.chat.plan.build` with `execution_topology: goal_driven`; there is no separate Build-as-Goal domain command. Goal creation, shared To-Do materialization, approved PlanRun, exact-version binding and matching schedule invalidation are journaled together. Failure injection after real writes tests the owner boundaries. Deferred timer/UI/storage effects run only after the synchronous concept transaction commits. Compare-and-swap rollback preserves newer intervening changes and reports partial conflicts rather than overwriting them. This is not crash-safe native storage.

Normal primary Build does not create a Goal. Deep Plan Build-as-Goal reuses the actual existing scoped bundle, ledger and per-thread To-Do list; reciprocal Plan/Goal navigation deduplicates the Plan tab. Deep execution without an adapter blocks honestly. Goal pause keeps a bound Plan Building with a Paused secondary state; recovery cannot override the inactive Goal. Material objective changes stop incompatible bound work and expose the existing Revise route, without rewriting approved Plan bytes or claiming automatic reconciliation.

Schedules freeze topology and exact Plan authority, but do not create a Goal or To-Dos at schedule creation. Admitted dispatch creates them through the same transaction. Stale, cancelled and duplicate dispatches are fenced; recurring windows reuse the current run. The local clock control is labelled as a demonstration, not a background server. Quota-reset consent uses shared Scheduling ownership and cannot override a newer manual stop.

The local order-export adapter performs actual dependent transformations: supplied JSON → integer-cent normalization → quoted CSV → independent parse verification. Five rows total 22,324 cents. Commas, quotes, an embedded newline, Unicode and a trailing space survive export, and source bytes remain unchanged. The stored CSV is downloaded through an ordinary control and compared byte-for-byte with the artifact; Python independently checks rows and totals. Accepted To-Do outcomes bind to actual current outputs. Generic unsupported objective edits remain accepted text but block the old task rather than pretending a general model ran.

## Final application tests

| Test family | Cases/journeys | Assertions/checks | Result |
| --- | ---: | ---: | --- |
| Actual application-handler boundaries | 34 | 134 | Pass |
| Deep binding, reciprocal routes, Activity and Step Rail Simple | 2 | 21 | Pass |
| Ordinary-control size-specific journeys | 7 | 133 | Pass |
| Cumulative B1–B14, including the post-B11 repair | Included cumulative entrypoints | Kept in per-suite reports, not inflated into one total | Pass |
| JavaScript syntax | 62 modules | All exit 0 | Pass |
| Protected animation sources | 10 files | Exact B14 byte equality | Pass |

There are **five distinct ordinary scenarios**, not seven unique workflows. The additional two journeys are size-specific repetitions.

| Scenario | Viewport | Checks | Result |
| --- | --- | ---: | --- |
| authority | 700 × 1000 | 20 | Pass |
| authority | 900 × 1000 | 20 | Pass |
| normal | 1440 × 1000 | 17 | Pass |
| plan | 1440 × 1000 | 19 | Pass |
| plan | 700 × 1000 | 19 | Pass |
| scheduled | 900 × 1000 | 22 | Pass |
| simple | 1440 × 1000 | 16 | Pass |

Handler adversarial coverage includes stale/expired/replayed approval; stop between evaluation and dispatch; wrong project/thread/worktree and provider/permission refusal; duplicate admission; incomplete or unaccepted output evidence; five actual Plan admission seams; schedule outer rollback after nested admission; exact-target invalidation; manual stop versus recurring/quota admission; branch/restore/rewind fences; missing restored owner; and intervening edits with explicit rollback conflict. See `final-b15/boundaries/RESULT.json` for the exact 34 cases rather than treating the summary as additional tests.

All final application runs use the complete generated HTML, not protocol-only mocks. Both ordinary `file://` and loopback HTTP navigation were actually retried, and this environment blocked them before application load with `ERR_BLOCKED_BY_ADMINISTRATOR`. Complete-HTML `set_content` boots and drives the actual handlers. Ordinary navigation in an unrestricted browser is therefore not independently proved here. No page errors or undeclared action collisions occurred in the final B15 journeys/surface tests.

## Visual and motion assessment

Desktop, 900-pixel and 700-pixel states were inspected, including objective editing/history, proposed replacement approval, pinned/transient Activity, Plan/Goal links, scheduling, working state and files. Native-resolution review of the prior build exposed a clipped shortcut at three-column desktop width. The final header wrap repairs it; the final ordinary tests now measure every work-card shortcut against its actual header bounds. Cumulative tests and recordings were rerun after that CSS change. The ten protected animation files remain byte-identical to B14.

Four final workflows were captured from ordinary Send/admission through completion and CSV download. Demo input selection precedes recording. Original MKVs are retained; MP4 copies are lossless container remuxes, not frame-rate conversions. Acquisition target, encoded presentation timestamps, identical decoded frames, browser callbacks and visual interpretation are separate measurements. Every decoded full-size frame was hashed; identical pairs include legitimately static screens and are not proof of dropped painting. There is no actual-paint instrumentation.

| Recording | Decoded frames | Observed average frames/s | Maximum encoded interval | Maximum browser rAF interval |
| --- | ---: | ---: | ---: | ---: |
| authority-900 | 842 | 60.00 | 25.0 ms | 33.4 ms |
| plan-700 | 872 | 60.00 | 29.0 ms | 66.7 ms |
| scheduled-1440 | 1023 | 60.00 | 29.0 ms | 66.7 ms |
| simple-1440 | 633 | 60.00 | 76.0 ms | 66.7 ms |

The inspected working sequences preserve the existing Orbit motion and panel geometry without a new whole-application blackout or clipped action controls. Encoded average cadence is approximately 60 frames/s, but that is not proof of uniformly smooth rendering: the original Simple Goal capture contains a 76-ms presentation interval; Plan and scheduled captures reach 29 ms, while authority reaches 25 ms. Browser requestAnimationFrame intervals reach approximately 33.4 ms for objective authority and 66.7 ms for the other recordings. Scheduled execution records four long tasks, the longest 64 ms. These are real measurements from the final-byte runs; application work, screenshot/testing overhead and capture overhead have not been isolated into a clean performance benchmark. I do not accept a uniform smooth-60-fps claim.

The review comprises four whole-workflow overview sheets, four 16-consecutive-frame sheets, and the selected native-resolution frames listed in `VISUAL_REVIEW.json`; it is not exhaustive native inspection of every frame. The measured gaps/long tasks remain in evidence. **Uniform smooth 60 fps and global motion acceptance are not claimed.**

Remaining visual limits: Visual review is bounded to the listed samples and native frames, not every frame, every theme or every possible layout. Original recordings retain Chromium fullscreen/download hints and a pale transient overlay near startup; they were not edited away. Informational toasts also briefly cover parts of the upper transcript during rapid actions. Encoded timestamps, identical-frame hashes and browser callbacks are not actual-paint instrumentation. Static repeated frames are not by themselves evidence of dropped animation. Ordinary file and loopback HTTP navigation was blocked before application load by this environment; unrestricted-browser navigation remains unproved. Installer execution was tested on Linux. Native Windows/macOS installation and cross-host/restart durability remain unproved.

## Guarded installer and package proof

Use only the guarded merge update on an isolated local worktree. Default invocation is read-only preflight. Explicit apply requires a new external backup; there is no force option. The tested installer implementation passed 35 checks against an extracted package, including a real linked worktree whose Git index resides outside the install root. The final delivered ZIP is tested again after all metadata/manifests are frozen; its actual hash and results are external in `final-installer/RESULT.json` and `final-package/RELEASE_RECEIPT.json`, avoiding circular package self-certification.

The checks cover full preflight, exact payload, unknown overlaps, corrupt/unlisted payloads, absolute/traversal/backslash/case-colliding/Git paths, symlink parents/targets/payloads, root symlinks, external backups, idempotency, failed-write automatic rollback, newer intervening changes, corrupt original backups, both-output clean rebuilding, and exact preservation of HEAD/index/staged overlapping content in ordinary and linked worktrees. A portable negative shim checks the Windows reparse-attribute branch even without `Path.is_junction`; native Windows/macOS installation was not tested. The tested OS is Linux.

Hash guards are not a lock against a malicious process concurrently renaming directories. Install in a trusted quiescent worktree. Individual file replacements are atomic; a multi-file update is backed up and recoverable, not an operating-system atomic multi-file transaction. Git staging is preserved, **not synchronized**: deliberately inspect and stage intended repaired working-tree versions afterward.

## DRY, wiring and scope

`BATCH_15_WIRING.json` records forward actions, command correspondence, payload/currentness guards, sole shared owners, results/refusals, reverse projections/return routes, tests and all thirteen review dimensions. No new canonical command is minted; concept object navigation is not claimed as native `route_target` registration. UI handler tests do not certify central command registration, event admission or repository-wide wiring.

All 43 worklist identities are accounted for, but some original GREPLAY/PGOAL/APR packet wording remains unavailable. The current-owner behavior demonstrated here is not a fabricated reconstruction or blanket full-clause acceptance. General-purpose model/provider execution, cross-host persistence/restart, native migration, governance and global formal-audit proof remain outside this concept delivery.
