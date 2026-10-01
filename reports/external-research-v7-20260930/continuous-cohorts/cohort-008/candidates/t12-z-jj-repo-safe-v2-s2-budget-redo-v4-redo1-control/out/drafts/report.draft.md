# Jujutsu v0.22.0 source investigation — workspace-aware desktop companion (control arm)

Case: t12-z-jj-repo-safe-v2-s2-budget-redo-v4-redo1-control. Documentation-led navigation per TASK.md matched policy; the cached map/index.json and its shards were never opened (see out/map-usage.json).

Pinned corpus: Jujutsu v0.22.0, commit 67c2ae0a9e3e445f034a456b299e3f37c4dc4b93 (inputs/PIN.json:3-5); logical source universe and hashes unchanged from jj-repo-dev-v1 (inputs/source-locator.json:2-5). Issue bodies/states were captured 2026-09-30 and can differ from release-time state (inputs/issues-index.json:687-688).

Access record: every claim below comes from bounded read_file reads of the local corpus plus two official GitHub API GETs (issue #4239 comments; PR #4517 metadata), both HTTP 200. The fixed mechanical operations (line_map x3, cache_source x1) were attempted and all failed with tool errors ("boundary failure: ValueError"); no mechanically derived or map-derived evidence exists. The five PNGs in the corpus (demos/*.png, inventory inputs/PIN.json:255,258,260,262,266) were not visually inspected — no visual claim is made anywhere; visual-dependent questions remain open. Test source was not read and nothing was executed: all validation proposals in section 8 are UNEXECUTED.

## 1. Question families investigated

Family 1 — observing and changing repository/workspace state while edits or other workspaces exist. Derived questions: what does an "observation" command actually mutate (snapshot)? what serialization exists between concurrent actors in one workspace and across workspaces? how is cross-workspace staleness detected and recovered? where are concurrent mutations detected versus silently accepted?

Family 2 — command completion, interrupted progress delivery, and recovery of workspace state. Derived questions: which invariants survive a killed command? which cleanup runs on which signal, and on which platform? how is progress delivered and can a GUI consume it? what recovery paths exist for stale, partially-updated, or unloadable states?

Both families were investigated in the same bounded original public corpus; no alternate repositories and no historical answers were used.

## 2. Material findings

Each finding: Claim / Mechanism with exact local locators and original line ranges / Conditions / Counterevidence / Integration implication.

### F1. Every ordinary command is a snapshot — observation is mutation

Claim: any jj command that is not explicitly excluded snapshots the working copy first, so a companion that "just looks" at state via jj commands creates commits that capture whatever the agent or user is writing at that instant.

Mechanism:
- repository/docs/working-copy.md:10-18 — most commands commit working-copy changes when they changed; added files are implicitly tracked (15-18); `snapshot.auto-track` controls which new paths are tracked (20-27); ignored files never auto-tracked (69-75).
- repository/cli/src/cli_util.rs:853-854 — `may_update_working_copy = loaded_at_head && !ignore_working_copy`; :897-916 — `maybe_snapshot()` snapshots (and imports Git HEAD first in colocated repos) on that path.
- Snapshot core: repository/lib/src/local_working_copy.rs:792-906 — full working-copy traversal building a new tree; directory walk is rayon-parallel (939-958) and skips `.jj`/`.git` (956-958); per-path progress callback (see F6). Cost history: #4508 "On a machine with many cores, snapshotting large repos is very CPU-intensive" (open; inputs/issues-index.json:555-564, title-level only).

Conditions: skipped under `--ignore-working-copy` and `--at-op` (repository/docs/operation-log.md:54-58); but then mutating commands refuse to run: "This command must be able to update the working copy." with hints "Don't use --ignore-working-copy." / "Don't use --at-op." (cli_util.rs:881-895). `SnapshotError::NewFileTooLarge` bounds giant new files via `snapshot.max-new-file-size` (repository/lib/src/working_copy.rs:161-171 and 205-210).

Counterevidence: genuinely non-mutating observation modes exist (`--ignore-working-copy`, `--at-op`), and #4545 (open; inputs/issues/4545.json:11,70) shows real users running read commands in that mode: with Watchman, `jj log` 209 ms vs 58 ms with `--ignore-working-copy` on a Chromium checkout; the same issue records that the skip mode does not register the Watchman trigger and that combining it with `jj new` causes a stale workspace (upstream #4028 — not fetched; see evidence-chains missing links).

Integration implication: the companion must pick per invocation: accept snapshot semantics (observe-with-commit; poll loops will capture mid-edit states) or use skip modes for pure observation, keeping skip-mode processes strictly read-only. "What was saved" must be derived from the recorded operation/snapshot, never assumed.

### F2. Serialization inside one workspace is a single file lock plus atomic state writes — with named platform gaps

Claim: concurrent actors on the same workspace are serialized by one on-disk lock; state files are written atomically; races that slip through are converted to explicit errors; but the atomic-rename layer has documented Windows failure modes.

Mechanism:
- repository/lib/src/local_working_copy.rs:1607-1631 — `start_mutation()` takes `FileLock::lock(state_path.join("working_copy.lock"))` (1608-1609) and re-reads the state after taking the lock (1615).
- repository/lib/src/local_working_copy.rs:660-706 — tree_state saved via `NamedTempFile` + `persist` (683-704); :1693-1702 — checkout proto (operation id + workspace id) written the same way; :1931-1955 — `finish()` writes tree_state then the new checkout state.
- Race detection: repository/lib/src/workspace.rs:432-440 — `CheckoutError::ConcurrentCheckout` when the on-disk tree id no longer matches what the caller expected (declared at repository/lib/src/working_copy.rs:256-259); repository/cli/src/commands/workspace/update_stale.rs:78-83 — "Concurrent working copy operation. Try again." when the known working-copy commit's tree differs from the locked tree.
- Checkout deliberately does not overwrite an untracked file in the way: it records a placeholder and counts `skipped_files` (local_working_copy.rs:1425-1431; stats struct working_copy.rs:232-244; warning + recovery hints printed in cli_util.rs:2362-2392).

Conditions: the lock is per workspace (state lives in that workspace's `.jj/working_copy/`), so it never serializes two different workspaces — cross-workspace safety is the op-log model (F5) plus staleness (F3).

Counterevidence: two in-code TODOs state persist "will (on Windows) fail if the file happened to be open for read" and is not retried (local_working_copy.rs:694-695 and 1699-1700); `update()` has "TODO: Check that the file has not changed before overwriting/removing it." (1440). The actual blocking/timeout semantics of `FileLock` were not read (repository/lib/src/lock.rs unvisited) — unknown.

Integration implication: the companion must never hold open handles on files under `.jj/working_copy/` (preview/indexing/AV/cloud-sync), must treat lock acquisition and `PersistTreeState`/persist errors as retryable surfaced states, and must map `ConcurrentCheckout`/"Concurrent working copy operation" to a user-facing retry, not an error banner.

### F3. Staleness is a precise four-way classification; the recovery command encodes the guards

Claim: "stale working copy" is not a heuristic; it is computable exactly per workspace, and recovery should go through `jj workspace update-stale` because that command embeds the concurrency guards.

Mechanism:
- Docs: cross-workspace edits make the other workspace's files mismatch `@`; remedy is `jj workspace update-stale` (repository/docs/working-copy.md:94-100).
- repository/cli/src/cli_util.rs:2214-2226 — `WorkingCopyFreshness { Fresh, Updated(Operation), WorkingCopyStale, SiblingOperation }`; :2228-2268 — `check_stale_working_copy` first compares the working-copy tree id against the working-copy commit's tree (fast path, 2234-2238); otherwise reads the working copy's recorded operation and finds the closest common ancestor with the repo's operation in the op DAG to distinguish Updated / WorkingCopyStale / SiblingOperation (2240-2267).
- repository/cli/src/commands/workspace/update_stale.rs:43-108 — recovery: snapshot onto the last operation the working copy knows (comment 48-51: the old working-copy commit wins the divergent-op merge), re-check the guard (81-83), check out the desired commit, finish with the new operation id; early-return "Nothing to do (the working copy is not stale)." (72-77).

Conditions: the classification runs against a locked working copy (in update-stale it is taken via `unchecked_start_working_copy_mutation`, update_stale.rs:69-71); `Fresh` is decided by tree equality alone, so identical trees across divergent operations count as Fresh (no repo reload) — precise but tree-based.

Counterevidence: the failure history #4239 shows the stale error text users see — "The working copy is stale (not updated since operation 6c9667ecda1f). Hint: Run `jj workspace update-stale`…" (inputs/issues/4239.json:112) — i.e., the state is surfaced loudly rather than hidden, which is the desired property to mirror in the GUI.

Integration implication: display per-workspace freshness using this exact classification (or by invoking commands that use it); route recovery exclusively through update-stale semantics; never hand-roll a checkout to "fix" staleness, since the command carries the concurrent-mutation check.

### F4. Interrupted commands: repo-side recovery is strong; working-copy-side recovery is partial and destructive-ish

Claim: after any interruption, repository state converges automatically via the operation log, but a working copy caught mid-update has no resume marker; recovery exists (`recover()`, recovery commits) and is reachable through `jj workspace update-stale`.

Mechanism:
- Repo side: each command loads the repo at one operation and appends its operation at the end; divergent operations are detected and merged on the next load — 3-way view merges, conflicts recorded rather than errors (repository/docs/technical/concurrency.md:80-114); op heads are one file per head, new-head file written before old removed so transactions are atomic (116-127); `resolve_op_heads` tolerates transiently empty head sets, double-checks under an optional advisory lock that is "not needed for correctness" (repository/lib/src/op_heads_store.rs:52-56, 63-100, empty-heads comment 71-74).
- Undo/restore of any prior operation is first-class (repository/docs/operation-log.md:16-18).
- Working-copy side: update-stale detects a working copy whose recorded operation object is missing (`OpStoreError::ObjectNotFound`) and builds a recovery commit from on-disk state via `recover()` (update_stale.rs:145-175, esp. 163-170; :110-143); `recover()` clears all file states and re-checks out the target tree (local_working_copy.rs:1553-1557; locked wrapper 1895-1907).
- The gap: an interrupted checkout/sparse update has no resume marker — three in-code TODOs for an unwritten "pending_checkout" file (local_working_copy.rs:1861-1863, 1917-1918, 1953).
- Signal coverage: cleanup guards run on SIGINT/SIGTERM only (repository/cli/src/cleanup_guard.rs:13-46; unix handler 65-93, guard drain 96-100); a second signal is instantly fatal (102-108); the non-unix platform module is a no-op (117-126). SIGKILL, power loss, and Windows GUI termination run no cleanup.

Conditions: `recover()` resets dirstate assumptions (clears file states), so files written during the dead window that are absent from the target tree remain as untracked leftovers rather than being deleted; the recovery-commit path only triggers when the op object is unreadable, not on every interruption.

Counterevidence: maintainers consider stale-after-failed-working-copy-update "expected" — the state is surfaced for the next command (yuja in #4239 comments, fetched via API; see out/evidence-chains.json EC1), i.e., this is designed surfacing, not hidden corruption.

Integration implication: the companion's post-interruption flow should be: reload (op merge is automatic) → classify freshness (F3) → offer `jj workspace update-stale`; it must not try to complete a half-written checkout itself (no marker exists), and must assume no cleanup ran after SIGKILL or on Windows.

### F5. The lock-free operation log has documented corruption and panic histories — one panic site is still live in v0.22.0

Claim: the design promises repo-level durability without locks, but the docs themselves carve out known corruption scenarios, a hard-reboot corruption case exists, and a divergent-operations panic reported on 0.21.0 is still present in the pinned 0.22.0 tree.

Mechanism and histories:
- Docs: with the Git backend "repository corruption is possible because the backend is not entirely lock-free" (upstream #2193, linked at repository/docs/technical/concurrency.md:51-54); rsync/NFS/Dropbox use "not currently thoroughly tested", especially co-located repositories (56-61); the promise that no repo changes are lost, with bookmark conflicts instead of errors, is documented at 40-49 and mechanically grounded in content-addressed op/view storage (116-119) and conflicted RefTargets (99-114).
- #4423 "hosed jj repo after hard-reboot." (open at capture, 18 comments): after a power cycle without sync, an empty-named entry under `.jj/repo/op_store/views/` makes every command fail: "Internal error: Failed to load the repo … Error when reading object of type view … Is a directory (os error 21)" (inputs/issues/4423.json:58; state 34; comments 38).
- #4465 "Panic in `jj op show` on 'reconcile divergent operations'" (created 2024-09-14 on 0.21.0; closed 2025-06-12 — after v0.22.0): divergent operations (concurrent abandon vs edit of one change across two workspaces) crash `jj op show` with an unwrap panic at lib/src/default_index/revset_engine.rs:972 (inputs/issues/4465.json:112). Verified in the pinned tree: `revset_for_commit_ids` maps `commit_id_to_pos(id).unwrap()` at repository/lib/src/default_index/revset_engine.rs:969-977 (the unwrap is on line 972) — the reported panic site is present in v0.22.0.

Conditions: #4465 needs divergent operation heads plus a revset containing a missing commit; #4423 needs a non-atomic crash (hard reboot); both are edge conditions, not ordinary single-machine use.

Counterevidence: the core no-data-loss claim is documented and structurally supported (F4 mechanism); #4239's stale state is recoverable by design; the #4465 crash affects `jj op show` while `jj op diff` worked (issue body) and later commands still run.

Integration implication: run every jj invocation out-of-process with stderr captured so panics cannot take down the GUI; treat repo-load failure as a first-class surfaced state (with #4423-style messages) rather than an unexpected crash; gate op-log/evolog panels behind successful load; do not promise multi-machine/NFS safety the docs themselves withhold.

### F6. Progress exists only as terminal redraws plus an in-process callback — no stream a GUI can subscribe to

Claim: v0.22.0 has no machine-readable progress channel; the CLI draws terminal progress bars, and the library exposes a callback only to in-process embedders.

Mechanism:
- repository/cli/src/progress.rs:19-93 — fetch/push progress via crossterm: "\r" + Clear(CurrentLine) redraws (44-48), 30 Hz updates after a 250 ms initial delay (112-113), a `CleanupGuard` restores cursor state on interrupt (56-63).
- Snapshot progress: an in-process callback `Option<SnapshotProgress>` on `SnapshotOptions` (repository/lib/src/working_copy.rs:200-201, type at 226-227); implementation suppresses output during fast operations (progress.rs:166-199, delay logic 175-190).
- Final summaries are plain text, e.g., "Added N files, modified N files, removed N files" and the skipped-files warning (cli_util.rs:2362-2392).

Conditions: the callback is reachable only when embedding jj-lib (the repo ships embedding examples, cli/examples/custom-*, inventory inputs/PIN.json:36-41); whether any progress is emitted at all when stderr is a pipe (no tty) was not verified — repository/cli/src/ui.rs is unvisited, so non-tty behavior is unknown.

Counterevidence: an embedder can hook `SnapshotProgress` and `git::Progress` directly, so the limitation is CLI-surface only; snapshot progress is per-path (no percentage), so even embedded progress is coarse.

Integration implication: for the pinned version via CLI, the "stream command progress into a small panel" feature must either scrape terminal control sequences (fragile, cursor-state coupled, possibly suppressed on pipes) or restructure around an embedded library build; design the panel to work from final summaries alone.

### F7. Colocated Git repositories add working-copy duplication and phantom-change hazards of their own

Claim: colocated repos (`.git` and `.jj` sharing one working copy) have their own documented duplication and phantom-change risks; the companion should prefer non-colocated workspaces.

Mechanism and histories:
- `maybe_snapshot` imports Git HEAD before snapshotting in colocated repos (cli_util.rs:897-916); `import_git_head` can abandon/replace the working-copy commit and its TODO lists three distinct ways duplicate working-copy commits arise (cli_util.rs:918-949, esp. 934-942).
- Failure histories: #4349 "git submodules in colocated repos create weird phantom file creations/deletions" (inputs/issues-index.json:226-235, title-level only); #4436 "FR: workspaces should also be collocated in --colocate mode" (406-415 — additional workspaces are not colocated); docs' untested-status for colocated multi-machine use (concurrency.md:56-61) and Git-backend corruption note (51-54).

Conditions: applies only when `--colocate`/colocated init is used; the duplication TODOs concern concurrent jj processes observing an external HEAD move.

Counterevidence: colocated interop is a flagship feature with dedicated tests in the corpus (repository/cli/tests/test_git_colocated.rs exists; unvisited) — the listed items are edge/TODO-level, not proof of routine breakage.

Integration implication: default companion-managed workspaces to non-colocated jj checkouts; if colocated, treat the Git side as an independent mutator with its own writes/watches, and expect duplicate working-copy commits after external HEAD moves.

## 3. Failure-history table (issues whose bodies were read; states as captured 2026-09-30)

| Issue | Title (short) | State at capture | Feeds finding |
|---|---|---|---|
| 4239 | Broken pipe in `jj rebase 2>&1 | head` causes stale working copy | closed 2024-09-22 (fix in v0.22.0, EC1) | F3, F4 |
| 4423 | hosed jj repo after hard-reboot | open (18 comments) | F5 |
| 4465 | Panic in `jj op show` on "reconcile divergent operations" | closed 2025-06-12 (post-v0.22.0) | F5 |
| 4545 | FR: option to skip snapshotting-before-commands | open (4 comments) | F1 |

Title-level only (index, no body read): #4508 snapshot CPU cost (open) → F1; #4349 colocated submodule phantom changes (closed) and #4436 colocated workspaces FR (closed) → F7. Full inventory: inputs/issues-index.json (68 issues, 2024-08-01..2024-10-02).

## 4. Counterevidence register

- F1: `--ignore-working-copy` and `--at-op` are genuine non-snapshotting read modes (operation-log.md:54-58); Watchman/fsmatchers reduce snapshot cost (fsmonitor settings in SnapshotOptions, working_copy.rs:196-199; watchman clock persisted in tree state, local_working_copy.rs:651-654, 904).
- F2: races that bypass the lock are converted to explicit errors (ConcurrentCheckout; update-stale guard), not silent corruption.
- F3: freshness classification is exact and cheap (tree-id fast path); `Updated` supports reloading at the working copy's operation rather than treating it as stale (cli_util.rs:2256-2259).
- F4: maintainer position: stale-after-failed-update is expected and surfaced (#4239 comments) — recovery UX, not hidden corruption.
- F5: docs promise rsync/Dropbox merges lose no repo changes (concurrency.md:42-49); residual risk is limited to bookmark pointers in explicitly untested scenarios (58-61).
- F6: in-process progress hooks exist for embedders (SnapshotOptions.progress).
- F7: colocated hazards are TODO/FR-level; interop is heavily used and tested upstream.

## 5. Transfer limits — why CLI evidence does not prove GUI safety

- The CLI model is one foreground command per terminal; a GUI runs many concurrent jj processes per repo and must aggregate per-workspace surfaced states (stale, conflicted bookmarks, skipped files, op divergence) that a terminal user sees one at a time.
- Terminal-coupled behaviors (progress redraws, SIGINT cleanup guards) do not exist for GUI consumers; embedding jj-lib changes the concurrency surface (in-process state, advisory locks) and is a different integration than shelling out.
- Auto-snapshot (F1) assumes a human "finishes" edits before pressing Enter; a background watcher over an agent's live edits has no such boundary, so safe observation cannot be promised without skip modes — and skip modes disable mutation in the same process.
- All claims are pinned to v0.22.0 (commit 67c2ae0a9e3e…). Later upstream changes (e.g., #4465 closed 2025-06-12) do not transfer backwards, and no claim is made about the latest release.

## 6. Unresolved and unvisited areas

- Five demos/*.png retained as exact bytes: never visually inspected in this route; any question requiring their visuals remains open and was not narrowed (inventory inputs/PIN.json:255,258,260,262,266).
- Issue comments/timelines other than #4239's were not fetched (#4423 has 18, #4465 has 1, #4508 and #4545 have 4 each) — comment-level fix attributions remain leads only; a closed issue/title is only a lead.
- Upstream links referenced but not fetched (missing links): #4028 (stale workspace from `--ignore-working-copy` + `jj new`), #2193 (Git-backend corruption), #19 (fileset/type conflict resolution limits, working-copy.md:52-57).
- Source not read: repository/lib/src/lock.rs (+ lock/fallback.rs, lock/unix.rs) — actual FileLock blocking semantics; repository/lib/src/fsmonitor.rs — Watchman trigger registration that #4545 references; repository/lib/src/git_backend.rs; repository/lib/src/transaction.rs; repository/lib/src/repo.rs (op-head merge entry); repository/cli/src/ui.rs (non-tty progress suppression); the four chunked oversized patches and their locator chunks.
- Tests not read (test source is not test execution): repository/cli/tests/test_workspaces.rs, test_concurrent_operations.rs, test_working_copy.rs, test_undo.rs, test_operations.rs; repository/lib/tests/test_workspaces.rs, test_bad_locking.rs, test_local_working_copy_concurrent.rs, test_commit_concurrent.rs, test_operations.rs.
- Mechanical operations unavailable: all four attempts errored ("boundary failure: ValueError"); no line_map/render_sections/cache_source output contributed to any claim.

## 7. How the findings answer the brief's product questions

- "What the companion must learn before promising safe observation": observation mutates by default (F1); safe observation requires skip modes or embedding, and the safety claim must exclude multi-machine/NFS and colocated edge cases (F5, F7).
- "Useful recovery after interruption or workspace changes": reload-and-merge is automatic (F4), staleness is exactly classifiable (F3), the sanctioned recovery actions are `jj workspace update-stale`, `jj op undo`, `jj op restore` (F3, F4, operation-log.md:16-18); there is no mid-checkout resume (F4).
- "Stream command progress into a small panel": not available from the CLI in machine form (F6); plan for summaries or embed.
- "What remains unresolved": conflicts materialize as in-file markers and are parsed back on snapshot (working-copy.md:30-41); directory/file/symlink conflict resolution has documented limits (#19, working-copy.md:52-57) — the "what remains unresolved" panel should be driven by conflicted RefTargets and conflict markers, both machine-detectable.

## 8. UNEXECUTED validation proposals

- V1 (F2): read repository/lib/src/lock.rs, then in a scratch repo hold `.jj/working_copy/working_copy.lock` from a helper process and run `jj st`; record whether FileLock blocks or errors, and the resulting user-visible message. Expectation to falsify: immediate error.
- V2 (F4): start `jj new` on a large tree and SIGKILL mid-checkout; then run `jj st` and `jj workspace update-stale`; verify no pending_checkout marker exists in v0.22.0, that the recovery-commit path triggers only when the recorded operation object is missing, and where on-disk files absent from the target tree end up.
- V3 (F5): reproduce #4465's script under v0.22.0 (two workspaces, concurrent abandon vs edit, `jj op show`); expect the revset_engine.rs:972 unwrap panic while `jj op diff` and subsequent commands still work; then confirm the panic is gone only in later versions.
- V4 (F1): append continuously to a file from a writer process while running `jj st` every 200 ms; diff successive `@` commits to demonstrate intermediate contents being committed by observation.
- V5 (F7): colocated init; move Git HEAD externally while jj is idle; run `jj st`; check for duplicated working-copy commits per cli_util.rs:934-942.
- V6 (F6): capture stderr bytes of `jj git fetch` into a pipe (no tty) and measure whether any progress output is emitted at all; separately verify progress when stderr is a tty, to bound the scraping approach.

## 9. Artifact cross-references

- out/acquisition.json — every read/URL with statuses, sizes, hashes, and finding links.
- out/navigation.json — chronological order of all reads/GETs/mechanical attempts and elapsed-cost accounting (wall-clock unknown; see note inside).
- out/evidence-chains.json — EC1 (#4239 → PR #4517 → pinned source), EC2 (#4465 → pinned panic site), EC3 (docs→implementation trails), plus missing links.
- out/map-usage.json — map/index.json not used; provenance of the navigation mode.
