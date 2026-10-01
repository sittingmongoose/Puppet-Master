# Jujutsu v0.22.0 source investigation for a workspace-aware local VCS companion

Pinned target: jj-vcs/jj tag `v0.22.0`, commit `67c2ae0a9e3e445f034a456b299e3f37c4dc4b93`
(`inputs/PIN.json` lines 4-5; original manifest sha256 `6aef9692d7f2fefccee3c9746b46138eadb154b205ce3b8e67b91e8b715e53bf`).
Corpus: 431 original repository files mirrored under `inputs/repository/` (five PNGs byte-exact but never visually inspected - no viewing tool exists on this route), 68 issue bodies captured 2026-09-30 (`inputs/issues/*.json`), 624 raw commit patches since 2024-07-01 (`inputs/commit-patches/*.patch`).
All line references below are local original-line pins verified by bounded `read_file` reads; issue states/bodies are capture-time (2026-09-30) state, not release-time truth. Nothing was executed; every test mentioned is test *source*, not a test run. Proposed validations are UNEXECUTED.

## Question families investigated (from inputs/brief.md)

1. **Observing and changing repository/workspace state while edits or other workspaces exist** - findings F2, F5, F7, plus lead L1 (#4436).
2. **Command completion, interrupted progress delivery, and recovery of workspace state** - findings F1, F3, F4, F6.

---

## F1. Interrupted progress delivery can strand a stale working copy; fixed in v0.22.0 by reordering update-before-report (historical failure, fixed; full chain)

**Claim.** In releases before 0.22.0, a write error during end-of-command reporting (e.g. `jj rebase -s third -d first 2>&1 | head -n 3`) aborted the command *after* the repo transaction but *before* the working-copy update, leaving the working copy permanently stale ("Error: The working copy is stale (not updated since operation 6c9667ecda1f). Hint: Run `jj workspace update-stale`").

**Trace (complete).**
- Report: https://github.com/jj-vcs/jj/issues/4239 (local `inputs/issues/4239.json`, state `closed` line 46, closed 2024-09-22 line 75; reproducible console transcript in body line 112). Labeled `bug`.
- Discussion: https://github.com/jj-vcs/jj/issues/4239#issuecomment-2275287126 (yuja: "this particular scenario can be mitigated by reordering `update_working_copy()` and `report_repo_changes()`"); essiene's draft PR #4517 announced in comment 2365243059 (fetched live via `public_https_get`, 200, 11148 bytes, sha256 `042c4715bde42a5e4a051a215a99613447da791c93a4ddff5f3f3500c80fa5b4`).
- Fix commit: `76f40e5990db2981e7c86986c8af98f22edaccc9` "cli: reorder updating and reporting for consistency." - header lines 1-14 of `inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch`, `Fixes: #4239` at patch line 14; moves `report_repo_changes()` after the working-copy update (patch cli_util.rs hunk, lines 39-63).
- Pinned implementation (present at v0.22.0): `inputs/repository/cli/src/cli_util.rs` `WorkspaceCommandHelper::finish_transaction` - transaction commit at line 1757, then the exact comment "Update working copy before reporting repo changes, so that potential errors while reporting changes (broken pipe, etc) don't leave the working copy in a stale state." lines 1759-1761, `update_working_copy(...)` at 1762-1769, `report_repo_changes(...)` at line 1771.
- Test source: `inputs/repository/cli/tests/test_repo_change_report.rs` pins the new message order ("Working copy now at" lines 35, 54, 69 now precede "New conflicts appeared" lines 40, 74), matching the snapshot updates in patch hunks at lines 98-180; `test_file_chmod_command.rs` ordering updated in patch lines 64-97.

**Mechanism.** jj commits the repo state first (atomic op-log write, `docs/technical/concurrency.md` lines 80-89), then updates the working copy under a lock, then prints. Any error in a *later* stage must not undo *earlier* stages; the pre-fix order violated that.
**Conditions/counter-evidence.** The stale state is not data loss - `jj workspace update-stale` recovers it (`inputs/repository/cli/src/commands/workspace/update_stale.rs` lines 43-108) - but a companion that pipes/streams output must assume output errors are recoverable, not fatal to state.
**Integration implication.** A GUI that renders command progress as a stream must swallow downstream write failures (closed panels, cancelled renders) or it can recreate exactly this bug class through the CLI it drives. Expect v0.22.0+ message ordering: working-copy lines before repo-change report lines; do not parse the old order.

## F2. `jj workspace rename` is transactional and lock-based; the companion can offer safe workspace renames (pinned capability; full chain)

**Claim.** Renaming an existing workspace was requested as FR and landed in v0.22.0 as `jj workspace rename <NAME>`, renaming both the repo-side `WorkspaceId` and the working-copy state inside one op-log transaction.

**Trace (complete).**
- Report: https://github.com/jj-vcs/jj/issues/4342 "FR: Allow renaming of existing workspaces" (`inputs/issues-index.json` lines 217-225: state `closed` at capture, created 2024-08-25).
- Fix commit: `412ef36259426d8d7a8bc33bf076922f2a801c18` "cli: Support renaming workspaces", `fixes #4342` at `inputs/commit-patches/412ef36259426d8d7a8bc33bf076922f2a801c18.patch` line 9; also indexed at `inputs/history-index.json` lines 566-572.
- Pinned implementation: `inputs/repository/cli/src/commands/workspace/rename.rs` lines 31-78 - rejects empty names (36-38), refuses rename when the workspace is no longer tracked in the view (49-59), then takes the working-copy mutation lock (`start_working_copy_mutation`, line 62), calls `LockedWorkingCopy::rename_workspace` (64-66; trait declared `inputs/repository/lib/src/working_copy.rs` lines 110-111), applies `tx.repo_mut().rename_workspace(...)` (68-69) and finishes under the new op id (75).
- Test source: `inputs/repository/cli/tests/test_workspaces.rs` - `test_workspaces_rename_nothing_changed` (1081-1091), `..._new_workspace_name_already_used` (1093-1107, "Workspace second already exists"), `..._rename_forgotten_workspace` (1109-1124, renaming after `workspace forget` errors "not tracked in the repo"), `..._rename_workspace` (1126-1166, both workspaces' logs update).

**Conditions/counter-evidence.** Rename is single-workspace: it renames *the current* workspace only; the library-side view rename error type `RenameWorkspaceError` was wired into `CommandError` in the same patch (lines 39-63). The view-layer implementation in `lib/src/view.rs` was not read (see evidence ledger missing links).
**Integration implication.** Safe to expose a rename button, but the companion must handle "workspace forgotten by another process mid-rename" (the 1109-1124 case) as a first-class UI state, and must treat the *forgotten* workspace directory as still on disk - `jj workspace forget` untracks it without deleting files.

## F3. `jj op undo` / `op restore` now report what they did - completion feedback was a reported gap and is fixed in v0.22.0 (historical, fixed)

**Claim.** FR #4431 asked `jj undo` to print what operation is being undone; v0.22.0 prints an `op_summary` line ("Undid operation <id> <time-range> <description>") after `jj op undo`, and the same summary was added to `op restore`.

**Trace (complete to pinned code).**
- Report: https://github.com/jj-vcs/jj/issues/4431 (`inputs/issues-index.json` lines 387-395: closed 2024-09-15).
- Fix commit: `8e727de2ab3589d1cd5d9530c0809d9793165edd` "undo: Report what operation has been undone in `jj op undo`" (`inputs/commit-patches/8e727de2ab3589d1cd5d9530c0809d9793165edd.patch` lines 1-8; adds the status formatter block to `cli/src/commands/operation/undo.rs` at patch lines 22-60 and the `templates.op_summary` template to `cli/src/config/templates.toml` at patch lines 61-78; updates `cli/tests/test_duplicate_command.rs` expectations at patch lines 79-104 to expect "Undid operation ... duplicate 1 commit(s)").
- Follow-up in same window: `9551794f19d72c2bcb935dd62077ae26c5bc699f` "cli: print operation summary on \"op restore\" as we do for \"undo\"" (`inputs/history-index.json` lines 210-214) and `b30ce36c5553f29bd95d4f06d4c9500f91833a5e` "cli: print operation summary before committing transaction" (history-index lines 217-221); not read in detail.
- Pinned state: `inputs/repository/cli/src/commands/operation/undo.rs` exists with PIN sha256 `4f33418eecd80c91fd402a52411d28bc297a0d34ce23364ffb24470f1f66b26b` (not separately re-read; pinned content asserted from patch post-image).
**Integration implication.** The companion's progress panel can rely on machine-relevant completion summaries for undo/restore; but these are human-formatted strings, not structured events - jj v0.22.0 has no JSON output mode for transactions (unvisited; see U4).

## F4. Divergent operations reconcile automatically, but `jj op show` panicked on them in 0.21/0.22 (pinned panic present; fix link missing/unconfirmed)

**Claim.** Concurrent ops (e.g. `jj abandon` racing `jj edit`) fork the op log; the next command auto-reconciles ("Concurrent modification detected, resolving automatically."). In v0.21.0 - and still at the pinned v0.22.0 tree - `jj op show` on such a merged operation panicked at `revset_engine.rs:972` (`commit_id_to_pos(...).unwrap()` on a commit hidden by the reconcile). `jj op diff` did not panic.

**Trace.**
- Report: https://github.com/jj-vcs/jj/issues/4465 (`inputs/issues/4465.json`: state `closed` line 46, closed **2025-06-12** line 75 - after the v0.22.0 window; reporter version line 112: `jj 0.21.0-6e72b1cfb02b994e738a16f7e965f1d0ebfe7224`; backtrace lines 112 pointing at `lib/src/default_index/revset_engine.rs:972:55` and `jj_cli::commands::operation::diff::compute_operation_commits_diff` via `walk_revs`).
- Pinned implementation verified: `inputs/repository/lib/src/default_index/revset_engine.rs` lines 969-977 - `fn revset_for_commit_ids` with `.map(|id| self.index.commit_id_to_pos(id).unwrap())` at exactly line 972. The panic site exists in the pinned tree.
- Related pinned behavior/tests: `inputs/repository/cli/tests/test_concurrent_operations.rs` - `test_concurrent_operation_divergence` lines 21-64 (stderr "Concurrent modification detected, resolving automatically." lines 61-63; `@` resolving to more than one operation errors with hint lines 34-38), `test_concurrent_operations_wc_modified` lines 109-168 showing the op-log edge labeled "reconcile divergent operations" (line 157). The message rename itself is commit `cc15ecf7c75be9b5a8061013d359ec61365e3344` "op log: change \"resolve concurrent\" to \"reconcile divergent\"" (history-index lines 1456-1460).
- Missing link: the actual fix commit is not in the pinned corpus (corpus ends at the 0.22.0 release commit) and was not identified from official URLs within this task; record as **unconfirmed**.
**Integration implication.** A background panel that renders `op show`/`op diff` data for merged operations sits exactly on this code path. In the pinned version, treat `op show @` after detected divergence as a crash-capable call; prefer `op diff`-style rendering or revset paths that tolerate hidden commits, and never assume every commit id reachable from a merged view resolves in the index.

## F5. Every command pays a snapshot of the working copy first; two open reports say that cost is the price of observation (open, unresolved)

**Claim.** Observation is not free: normal commands snapshot the working copy before doing anything (op-log entries literally named "snapshot working copy"), which is what makes "what changed on disk" trustworthy, and is exactly what the companion would pay on every poll.

**Trace (open reports + pinned mechanism).**
- https://github.com/jj-vcs/jj/issues/4545 "FR: Option to skip snapshotting-before-commands with automatic snapshots" (`inputs/issues/4545.json`: state `open` line 46; body line 70: colocated chromium checkout, `jj log` ~209 ms with Watchman vs ~58 ms with `--ignore-working-copy`; notes `--ignore-working-copy` breaks `jj new` into staleness (#4028) and does not register the Watchman trigger).
- https://github.com/jj-vcs/jj/issues/4508 "On a machine with many cores, snapshotting large repos is very CPU-intensive" (`inputs/issues/4508.json`: state `open` line 57; body line 81: ~150k files, 24-core mac, `jj st` 2.28 s wall / 32 s sys vs 1.13 s / 0.49 s with `RAYON_NUM_THREADS=4`).
- Pinned mechanism: `WorkingCopy::start_mutation` / `LockedWorkingCopy::snapshot` trait surface (`inputs/repository/lib/src/working_copy.rs` lines 64-66, 104-105) with `SnapshotOptions` (base_ignores, fsmonitor, progress callback, `start_tracking_matcher`, `max_new_file_size`, lines 189-211); the CLI snapshots lazily via `workspace_command.maybe_snapshot(ui)` (call site pinned at `cli/src/commands/workspace/update_stale.rs` line 54); auto-tracking of new files became configurable with `jj file track`/`snapshot.auto-track` in-window (`f36f4ad257dbba9057d214a509535f148f13e24f` "cli: make paths to auto-track configurable, add `jj track`", history-index lines 903-907); op-log descriptions "snapshot working copy" appear verbatim in `cli/tests/test_concurrent_operations.rs` lines 80-81, 156, 163, 195-196, 201-202.
**Conditions/counter-evidence.** Watchman/fsmonitor exists as mitigation (`SnapshotOptions.fsmonitor_settings`; `.watchmanconfig` in tree), and `--ignore-working-copy`/`--at-op` exist for read-only paths, but #4545 documents that `--ignore-working-copy` is not a safe general answer because it skips working-copy updates too.
**Integration implication.** The companion must (a) treat a "read-only" status poll as a potentially mutating snapshot, (b) serialize polls against agent-driven commands rather than firing them concurrently, and (c) either adopt Watchman-class fsmonitor or accept per-poll latency; there is no v0.22.0 switch that gives "observe without snapshot".

## F6. A hard power loss can corrupt the op-store view layer with no built-in repair; recovery tooling only covers the working-copy side (open, unresolved)

**Claim.** After a power cycle without sync, a user's repo failed to load ("Internal error: Failed to load the repo / Error when reading object  of type view / Is a directory (os error 21)") because an op-store view object file ended up empty/misnamed; the issue is still open years later.

**Trace.**
- Report: https://github.com/jj-vcs/jj/issues/4423 "hosed jj repo after hard-reboot." (`inputs/issues/4423.json`: state `open` line 34; strace + diagnosis in body line 58; open since 2024-09-08, last updated 2026-08-25 line 40).
- Pinned context: op-store objects are content-addressed files and op-heads are zero-content marker files created-then-renamed so that "transactions are atomic" (`inputs/repository/docs/technical/concurrency.md` lines 116-127); the doc itself concedes the Git backend "is not entirely lock-free" and corruption is possible (#2193) (lines 51-54).
- Pinned recovery surface and its limit: `jj workspace update-stale` can create a "recovery commit" when the working copy's recorded operation id cannot be read (`inputs/repository/cli/src/commands/workspace/update_stale.rs` lines 110-143 and the `OpStoreError::ObjectNotFound` branch at 152-171), but there is no pinned command that repairs a corrupt *view object*; interrupted `SIGINT`/`SIGTERM` cleanup is guarded (`inputs/repository/cli/src/cleanup_guard.rs` lines 13-22, 39-46, 96-100, unix-only), which by design cannot cover `SIGKILL` or power loss.
**Missing links.** No fix commit (issue open); no repair command identified in the pinned tree.
**Integration implication.** "Recover after interruption" for the companion must mean: detect, quarantine, and point the user at backup/manual repair - not promise in-place repair. The atomic op-log limits blast radius (repo refs/commits survive; the failure here is a load-time failure of one object), but the pinned version offers no automated path out.

## F7. Multi-workspace staleness is by design: secondary workspaces never auto-update; detection + recovery is explicit (pinned mechanism, test-anchored)

**Claim.** Each workspace records its working-copy state under its own `.jj/working_copy` and points at the shared repo through a `.jj/repo` *file*; a workspace loaded after another process advanced the op log is stale until someone runs `jj workspace update-stale`, and concurrent checkout is detected rather than prevented.

**Pinned implementation.**
- `inputs/repository/lib/src/workspace.rs`: `WorkspaceLoader` treats `.jj/repo` as a file containing the relative repo path for secondary workspaces (lines 549-563) and errors `RepoDoesNotExist` if the target vanished (560-562); `Workspace::check_out` detects concurrent checkouts by comparing the expected old tree id and returns `CheckoutError::ConcurrentCheckout` (lines 432-440; error type `inputs/repository/lib/src/working_copy.rs` lines 256-259); `LockedWorkspace::finish` publishes the new op id (462-466); `LockedWorkingCopy::recover` exists for broken-state re-checkout (`working_copy.rs` lines 116-118, used by the recovery commit path).
- Staleness handling: `cli/src/commands/workspace/update_stale.rs` lines 43-108 (snapshot on top of the last known working-copy operation, then merge divergent ops; rejects a racing concurrent working-copy operation with "Concurrent working copy operation. Try again." at lines 78-83).
- Workspace creation: `cli/src/commands/workspace/add.rs` - destination must not exist (86-90), workspace-id collision check (103-107), `Workspace::init_workspace_with_existing_repo` (111-118), and a warning that a name-only destination lands *inside* the current directory with `jj workspace forget <name>` as the cleanup (124-132). No `--colocated` option exists in the pinned file.
- Test anchors: `cli/tests/test_concurrent_operations.rs::test_concurrent_snapshot_wc_reloadable` (lines 170-242) simulates another process re-parenting the op head mid-flight (test renames the op-head marker file, lines 214-228) and asserts the snapshot reloaded onto the newer repo so "child2" lands on "child1" (229-241).

**L1 (lead, not a finding).** https://github.com/jj-vcs/jj/issues/4436 "FR: workspaces should also be collocated in --colocate mode" (`inputs/issues-index.json` lines 407-415) is `closed` at capture (updated 2026-09-17) but the closing/fixed commit is unidentified and the body was not read; pinned v0.22.0 `workspace add` (above) has no colocate option, so for the pinned version the limitation stands. Treated as unconfirmed-for-0.22.0.

---

## Synthesis: what the companion must learn before promising safe observation and useful recovery

1. **Observation mutates.** Status/log polls snapshot the working copy (F5) and commit an op-log entry; the GUI's "read" path shares locks and the op log with the agent's "write" path. Serialize them; never run a poll against a workspace mid-agent-command.
2. **Staleness is normal, not exceptional.** Secondary workspaces are pointers (F7); the companion needs a per-workspace freshness read (working-copy op id vs repo op heads - the same comparison `update-stale` makes) before displaying state, and an explicit "update stale" affordance mirroring `update_stale.rs` semantics, including its recovery-commit fallback.
3. **Crash recovery is bounded.** Op-log transactions are atomic (concurrency.md 116-127), so repo state survives crashes better than the working copy; but corrupt op-store objects have no repair (F6) and `SIGINT`-only cleanup (cleanup_guard.rs) covers the common interrupt case, not power loss. Recovery UX = detect + guide, not auto-fix.
4. **Recovery affordances that already exist** and can be surfaced directly: `jj workspace update-stale` (F7), `jj op undo/restore` with completion summaries (F3), automatic divergent-operation merge with visible notice (F4/F7 tests), `jj workspace rename/forget` for workspace lifecycle (F2).
5. **Do not scrape human output for state.** v0.22.0 messages ("Working copy now at", "Undid operation", "Concurrent modification detected") are the only completion signals (F1/F3/F4); their ordering was deliberately changed in this very release (F1), so the companion should prefer the operation log as source of truth over output parsing, or pin the exact CLI version.

**Transfer limits.** All of the above is CLI-process behavior at v0.22.0: jj has no long-lived server/observer API in this tree, so a desktop companion would multiplex short-lived `jj` processes - the lock-free op-log design tolerates that (concurrency.md 35-49), but every guarantee here is per-process; a GUI's long-lived in-memory view of the repo can be arbitrarily stale. Nothing about command-line pipe behavior (F1) proves a GUI's in-process rendering behaves the same; and this is a claim about v0.22.0 only, not the latest release (several fixes, e.g. F4's, demonstrably postdate it).

## Unresolved / unvisited areas (scope kept honest)

- U1: The five `demos/*.png` files are byte-preserved but were never visually inspected (no viewing tool on this route); no claim below rests on them.
- U2: Not read: `lib/src/op_heads_store.rs` / `simple_op_heads_store.rs` internals (lock acquisition, head-merge algorithm), `lib/src/local_working_copy.rs` (lock file format, stale-lock handling), `lib/tests/test_bad_locking.rs`, `lib/tests/test_local_working_copy_concurrent.rs`, `docs/working-copy.md` stale section, git-colocated export loop (`cli/src/commands/git/export.rs`, `lib/src/git.rs`).
- U3: Issue #4465's post-0.22 fix commit and #4436's closing commit: unidentified (missing links recorded in evidence ledger).
- U4: Whether any structured/JSON command-output interface exists for embedding - not investigated; assumed absent from the pinned CLI surface read.
- U5: #4545/#4508 comment threads (4 and 9 comments respectively) not fetched; only bodies and state.

## UNEXECUTED validation proposals

- V1 (F1): Re-run `cli/tests/test_repo_change_report.rs::test_report_conflicts` against a v0.21.0 build and the pinned v0.22.0 build to demonstrate the message-order flip; confirm a failing downstream writer no longer yields "The working copy is stale". Not executed.
- V2 (F4): Reproduce issue #4465's script (`jj abandon ... & jj edit ...` across two workspaces, then `jj op show @`) on the pinned build; expect the `revset_engine.rs:972` panic, and `jj op diff --op @` to succeed. Not executed.
- V3 (F5): Instrument a ~100k-file fixture: compare wall time of `jj log` vs `jj log --ignore-working-copy` vs Watchman-enabled, per #4545's methodology, to size the companion's poll budget. Not executed.
- V4 (F6/F7): Kill (SIGKILL) a `jj commit` mid-`finish_transaction` in a sandbox, then run `jj workspace update-stale` and `jj op log` to verify the detect-and-recover path; separately verify no auto-repair occurs for an emptied op-store view object. Not executed.
- V5 (F2): Drive `workspace rename` while a second process holds the working-copy lock, asserting the "Concurrent working copy operation. Try again." error surfaces to the UI layer. Not executed.
