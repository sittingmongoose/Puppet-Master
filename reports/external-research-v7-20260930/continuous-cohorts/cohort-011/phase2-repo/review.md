# Independent phase 2 acquisition and preservation review

R028, R029, R030 and R031 contain useful source-supported mechanisms, but none establishes a complete safe-observation/recovery recipe or quality-equivalent efficiency result. Native completion and delivery are positively projected for all four. Actual native read/GET acquisition remains UNKNOWN. R028 has a malformed required evidence-chain JSON file; its original bytes were preserved.

This is an additive phase 2 review of the exact frozen T11/T12 cohort. Earlier CURRENT grades were neither read as semantic evidence nor changed. The original two question families and shared obligations remain controlling. Six prospective opportunity families are investigation opportunities, not six mandated deliverables or an invented original22 key.

All 9,615 sealed base files (262,459,774 bytes) and five usage-addendum files authenticate without mismatch. Each report retains all 1,187 input targets and every available output version. Authentication does not establish native acquisition or full semantic quality.

Complete machine-readable assertion, record, condition, transition, source-pin, scope, mechanism and cost tables are in [review.json](review.json). The readable [assertion tables](assertion-tables.md) include every actual assertion carrier and all available version changes. All original exact evidence paths and SHA-256 values are retained in the source catalog and inventory.

| Report | Available outputs | Native/delivery | Carrier | Main preservation limitation |
| --- | ---: | --- | --- | --- |
| R028 | 5 | Native complete, five files delivered | Evidence-chain JSON invalid | Malformed chain; crash-state/panic cause overclaimed; conditional output/recovery scope incomplete. |
| R029 | 10 | Native complete, five files delivered | All required carriers readable/valid | Detailed code coverage; chronology amended; global skip modes and safe tree_state deletion overclaimed. |
| R030 | 6 | Native complete, five files delivered | All required carriers readable/valid | Useful ordering/progress/state pointers; crash-safe snapshot inference and read-scope claims unsupported. |
| R031 | 10 | Native complete, five files delivered | All required carriers readable/valid | Ordering acquired in EC1 but undeveloped in current report; recover() described as disk checkout incorrectly. |

## Acquisition, history and conditions

Semantic acquisition means a source-supported statement is present in an actual candidate artifact. It does not mean that an input file, URL, self-reported HTTP 200, source hash or follow-up evaluator check proves the candidate natively read/fetched it. Supplied docs, indexes and lexical map are original input seeds. Their preparation is not candidate discovery. Unfrozen external PR/comment details and missing predecessor versions remain UNKNOWN.

Every available draft and final is represented. R028 has only the five final artifacts; R030 has five final artifacts and one exact-data line-map draft, with no report predecessor. R029 and R031 each have five drafts plus five final files. No unlisted overwritten versions are inferred.

R029 corrects “predates” to “postdates” for the pinned fix chronology. R031 removes an unverified later-version expectation from a proposed panic check. These are corrections of false or unsupported draft assertions. R028 adds a partial hash erratum in navigation while its original acquisition bytes remain incorrect. No supported-loss rate is derived from these edits.

R031 EC1 contains the supported ordering that conditional working-copy update precedes reporting repository changes. Both available report versions leave the concrete mechanism undeveloped. This is an artifact-content comparison, not proof it was once drafted and deleted or that the native read occurred earlier.

## R028: all emitted finding and shared-condition groups

### F1 — Broken-pipe fix and reporting order

CURRENT report lines 16–27. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Issue body reports a pipe ending after three lines, followed by stale-working-copy error; this is historical evidence rather than a v0.22.0 runtime run.
- Fix patch identifies #4239 and moves report_repo_changes after the working-copy update block. Pinned finish_transaction commits at 1757, conditionally updates at 1762-1769, then reports at 1771.
- Patch changes related test output expectations; the report distinguishes source from executed tests. Demo redaction patch references #4239.

Required conditions and counterevidence:

- External maintainer-comment wording, PR metadata and exact merge events are not independently captured in the admitted bundle; source patch confirms the mechanism but not those external records.
- The update block is conditional on may_update_working_copy and a tracked desired working-copy commit. Earlier progress, immutable-workspace warnings and Git export reports can fail before commit; checkout/finish can fail after commit. Late reporting failure alone is not a general completed/durable-state proof.
- Line 25 overstates that only reporting failure can remain and there can be no stale state. Line 27 proposes UX safeguards; their successful behavior has not been executed.
- Chain line 13 says pre-fix b3ede644 patch is not in the corpus, but that named patch exists in the sealed input inventory. Full historical blob identity/read is a separate unresolved claim.

Evidence: `issue_4239`, `patch_order`, `patch_demo`, `finish`, `update_wc`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F2 — Current-workspace rename

CURRENT report lines 29–44. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- FR body asks for rename and proposes forget/add workaround. Fix patch identifies #4342 and adds the current-workspace command.
- Pinned command rejects empty names, same-id no-ops, rejects forgotten current workspace, stages locked working-copy rename, updates the view, commits, then finishes state.
- View uniqueness check rejects an existing target ID; local finish persists staged workspace ID. Four related rename tests exist in the patch and are source only.
- Workspace IDs are repository metadata; rename does not migrate directories.

Required conditions and counterevidence:

- Exact PR timeline/comment details and all declared followed links lack independent native capture.
- Line 41 misidentifies PIN sha be6d3e32 as workspace/mod.rs; it is the rename.rs hash. Being an ancestor alone would not prove an unreverted final implementation; current code independently confirms it.
- The disk state file is named checkout, not checkout-state. Transaction commit and subsequent local finish remain distinct failure boundaries.
- Safe UI metadata rename and serialization are proposals, not universal runtime guarantees; current-workspace-only command does not rename every workspace in one invocation.

Evidence: `issue_4342`, `patch_rename`, `rename`, `rename_view`, `rename_repo`, `local_lock`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F3 — Snapshotting observation and map navigation

CURRENT report lines 46–55. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Most helper-based default commands can snapshot; ignore-working-copy disables working-copy updates; explicit non-head operation skips them. Line 49 correctly retains --at-op=@ as writable.
- Colocated order is import Git HEAD, snapshot working copy, import Git refs. TODO lists multiple duplicated-working-copy scenarios.
- Snapshot uses ignore rules, automatic tracking matcher, fsmonitor, progress and maximum-new-file-size; changed snapshots rewrite commit and rebase descendants.
- Issue bodies provide reported snapshot timings and threading sensitivity; these are not new-cohort benchmark measurements.

Required conditions and counterevidence:

- Headline every writable command is stronger than most helper-based commands. --ignore-working-copy is not a repository-wide read-only theorem: default repo load can reconcile divergent heads.
- No fix commits exist/improvement unimplemented at pin is broader than open captured issue status and inspected code prove.
- The fsmonitor trigger region is explicitly said not read by candidate; evaluator source qualification does not grant candidate native acquisition.
- Background observation proposals omit path-filter-after-snapshot semantics and cannot promise edit-quiescence safety.

Evidence: `working_docs`, `options`, `default_merge`, `snapshot`, `colocate`, `wc_trait`, `local_snapshot`, `issue_4545`, `issue_4508`, `fsmonitor`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F4 — Freshness and recovery

CURRENT report lines 57–65. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Freshness first compares trees, then operation ancestry for Updated/reload, Stale and Sibling. Snapshot reports distinct errors and hints.
- update-stale normally snapshots the last-known working-copy operation, merges divergent repo state, checks tree consistency, checks out the desired commit and finishes state.
- Missing-operation recovery creates a child of desired working-copy commit/tree, commits, resets recover metadata without changing files, then snapshots disk.
- Hard-reboot issue body records unloadable view error, not an established empty-file/fync diagnosis.

Required conditions and counterevidence:

- Only OpStoreError::ObjectNotFound enters the special recovery route, not arbitrary missing/incomplete working-copy state or any unreadable operation.
- The report claims the full 175-line recovery file was read; acquisition records 1-150. This is internal artifact inconsistency, not independent proof of what was read.
- Safe recovery or retry success is not established as a universal lossless guarantee; dirty files, tracked/ignored state, checkout errors and storage failures matter.
- No fix exists/cannot be repaired in product is an unresolved negative scope claim without a bounded exhaustive repair inventory.

Evidence: `freshness`, `snapshot`, `recovery`, `wc_trait`, `local_checkout`, `issue_4423`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F5 — Ignored/new files and historical loss report

CURRENT report lines 67–72. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Issue body reports an ignored large crash dump becoming visible when switching to a branch without ignore rules, and a later maximum-new-file-size error; claimed .env loss is reporter uncertainty.
- Ignore, tracking and maximum-size filters govern newly tracked files; already tracked files remain subject to snapshot behavior. Report keeps runtime checks unexecuted.

Required conditions and counterevidence:

- Duplicate closure against #323, its closed date and a post-pin auto-tracking fix are uncaptured external claims; they are not supported preservation opportunities.
- Ignore changes alone do not establish loss mechanism or a pinned regression. The report must retain never-tracked versus already-tracked exceptions.
- Line 72 later-fix landed wording is not confirmed by admitted follow-up bytes.

Evidence: `issue_4559`, `working_docs`, `snapshot`, `wc_trait`, `local_snapshot`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F6 — Conflict parsing panic

CURRENT report lines 74–78. Preservation: **UNSUPPORTED_CAUSAL_SEED_REPEATED; DO_NOT_COUNT_AS_SUPPORTED_RETENTION**.

Supported components:

- Issue reports jj 0.20/0.21 panic while resolving conflict, not planned at captured closure; traceback enters parse_conflict and TreeState::get_updated_tree_value.
- Pinned Merge constructor invariant/expect remains visible; malformed adds/removes counts can reach an assertion if its precondition is violated.

Required conditions and counterevidence:

- Presence of panic site does not establish the historical reproducer still panics in v0.22.0; candidate did not run it.
- On-disk checkout-state corruption as a necessary cause is unsupported: the traceback concerns parsing conflict markers in files, not necessarily a corrupt checkout-state file.
- Validation targeting checkout-state fuzzing is a proposal; no demonstrated v0.22.0 outcome or discovered root cause is credited.

Evidence: `issue_4396`, `merge`, `local_snapshot`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F7 — Hidden change prefix panic fix

CURRENT report lines 80–85. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Historical report is jj 0.19 Windows hidden-change prefix panic; patch replaces expect with NoMatch when only hidden change IDs remain.
- Pinned implementation independently retains the NoMatch behavior; patch includes hidden-ID test source. Underlying hidden-checkout origin remains unresolved.

Required conditions and counterevidence:

- Candidate relies on ancestor/manifest rather than direct pinned read; native acquisition remains UNKNOWN.
- Line 85 hidden objects not addressable is overbroad: test source explicitly resolves hidden commits by commit ID while hidden CHANGE prefixes give NoMatch.
- External close-event linkage and maintainer comments are not independently captured; root cause must remain unknown.

Evidence: `issue_4446`, `patch_hidden`, `id_prefix`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### S — Cross-cutting answers, limitations and six proposed checks

CURRENT report lines 87–112. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Seven findings lie within requested five-to-eight format and cover both families to a useful extent; source tests and all validation proposals remain UNEXECUTED.
- Source pin, current captured issue status and some unknown root causes are kept separate. Transfer recommendations are proposals, not an implemented companion.

Required conditions and counterevidence:

- Status path filters follow workspace_helper snapshot: a path-restricted refresh does not scope preceding snapshot. This governing safe-observation constraint is omitted.
- Shared repository operation views and per-workspace files are incompletely explained; filesystem ordering and Git backend/distributed-filesystem concurrency caveats are not developed.
- Line 93 pre-commit interruption leaves convergent operation heads is not generally proven: an uncommitted operation is not the visible committed-head case.
- Operation undo/restore versus other-workspace disk state and ignored/untracked files is incomplete. Full original scope therefore does not receive success credit.
- UNEXECUTED expected no-stale or corrupted-state tests are suggestions only. Incorrect seed implications do not become supported preservation denominators.

Evidence: `brief`, `task`, `options`, `default_merge`, `status`, `finish`, `freshness`, `recovery`, `concurrency_docs`, `operation_docs`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

## R029: all emitted finding and shared-condition groups

### F1 — Observation snapshot costs and skip modes

CURRENT report lines 13–21. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Most default helper-based reads snapshot/rewrite; own-mtime/stat comparison, parallel traversal, ignores, tracking and size limits are supported mechanisms.
- Reported #4545/#4508 timings are versioned user measurements, not this cohort performance. Sparse/fsmonitor matchers can reduce paths examined.
- ignore-working-copy skips snapshot and checkout and can expose stale stored view. Quiescence/user-triggered snapshot recommendations are proposals.

Required conditions and counterevidence:

- Generic --at-op also skips snapshot is missing the --at-op=@ exception. Mutating commands loaded at an earlier operation are not universally refused; working-copy mutation checks are narrower.
- Line 20 says a no-change snapshot only advances recorded operation ID. The snapshot path calls finish using loaded repo operation; advancing ID on tree equality belongs to update_working_copy and is not guaranteed for every snapshot.
- A no-snapshot mode is not globally non-mutating; default divergent operation reconciliation can create a repo operation. Path-filter snapshot scope is omitted.
- Background trigger safety and latency remain unexecuted; declared local read windows are not native proof.

Evidence: `working_docs`, `options`, `default_merge`, `snapshot`, `local_snapshot`, `local_state`, `issue_4545`, `issue_4508`, `fsmonitor`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F2 — Concurrent repository operations

CURRENT report lines 23–30. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Repository view and content-addressed operation history can reconcile divergent operations; optional op-head lock suppresses duplicate work rather than supplying merge correctness.
- Docs retain Git backend corruption risk and distributed-filesystem/colocated caveats. Explicit operation-expression resolution can error on multiple @ heads.
- Historical #4465 is jj 0.21 and closed in 2025; report properly leaves pinned runtime/fix status unresolved.
- Related test source uses directory merge simulation, not a test run in this evaluation.

Required conditions and counterevidence:

- Candidate acquisition window of test_bad_locking 14-103 reaches the test attributes, not the 105-182 scenario body/assertions. Source existence supports intended behavior, but the followed full-body claim is internally overbroad.
- A future sibling operation is outside the view initially loaded; no guarantee every concurrent writer is visible to a command already underway.
- No universal lossless theorem or measured lock/wait latency is supported.

Evidence: `concurrency_docs`, `default_merge`, `op_heads`, `op_walk`, `bad_locking_tests`, `lock`, `issue_4465`, `revset`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F3 — Per-workspace checkout lock

CURRENT report lines 32–37. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Working-copy mutation locks per workspace, rereads state under lock, and checks expected old tree for ConcurrentCheckout.
- Shared repository transactions and per-workspace files need separate serialization decisions; filesystem edits by external editor are not protected by jj lock.
- Untracked blockers can be skipped rather than overwritten; stats/error conditions are surfaced.

Required conditions and counterevidence:

- Named-temp-file persistence concerns individual state files, not an atomic multi-file checkout or crash durability.
- File-level update TODO acknowledges checking for external edits before overwrite/removal is incomplete; a UI lock cannot serialize arbitrary editor writes.
- GUI locking/retry choices remain proposals; locks do not prove native per-call timing.

Evidence: `wc_trait`, `workspace`, `local_lock`, `local_checkout`, `lock`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F4 — Recovery and fix ordering

CURRENT report lines 39–46. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Tree equality precedes operation ancestry; newer working-copy operation reloads repo, stale and sibling are distinct.
- Normal update-stale snapshots last-known working-copy operation, merges, checks tree, then checks out and finishes.
- Special missing-operation path is explicitly ObjectNotFound and creates a recovery child; report retains no-assumption-of-old-tree trait semantics.
- Pinned update-before-report order supports the specific #4239 fix; source evidence is distinct from runtime execution.
- Available draft corrects the false predates chronology to postdates; this is a legitimate amendment rather than loss of supported content.

Required conditions and counterevidence:

- 2025 recovery transcript and maintainer comments are unfrozen external records; exact event truth is UNKNOWN despite local code corroborating a narrower mechanism.
- Whole recovery is not promised by a single successful message: commit, checkout, persisted working-copy state and reporting have separate failure points.
- Cross-workspace disk state and ignored/untracked content are not restored by simply restoring the repository view.

Evidence: `freshness`, `recovery`, `wc_trait`, `local_checkout`, `finish`, `update_wc`, `issue_4239`, `patch_order`, `issue_4423`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F5 — Hard reboot and manual recipes

CURRENT report lines 48–54. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Issue body reports hard-reboot view load failure, repo initialized with older jj, inspected with 0.21. Code maps broken/inaccessible repo reads to errors.
- Docs head visibility ordering covers committed-head cleanup/reconciliation; persistent no heads yields NoHeads.
- Missing tree_state can initialize a new state; this is source capability rather than successful recovery of a corrupted actual repository.
- Report acknowledges original/follow-up versions and no v0.22.0 runtime regression demonstration.

Required conditions and counterevidence:

- Zero-length objects, fsync diagnosis, exact manual op_heads/refs cleanup recipes and later transcripts come from unfrozen comments. They remain unresolved semantic acquisition, not supported-preservation opportunities.
- Deleting tree_state is not proven universally safe: it clears tracking/file state and can alter ignored/tracked classification, and initialized empty-state snapshot is not restoration of all metadata.
- No built-in fsck/repair anywhere is an unbounded negative claim. Current inspected errors demonstrate surfaced failures, not exhaustive absence.
- Automatic repair/copy-before-repair/export proposals lack runtime validation.

Evidence: `issue_4423`, `concurrency_docs`, `op_heads`, `load_error`, `local_state`, `local_snapshot`, `local_checkout`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F6 — Shared repo, rename and secondary workspaces

CURRENT report lines 56–62. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Several separately named workspaces share a repository view while keeping separate files/state; forget leaves files in place.
- Current-workspace rename exists at pin; existing-repo initialization writes .jj/repo pointer and does not create a secondary Git worktree.
- Captured #4436 body reports secondary workspaces lack .git and can disrupt Git/Nix integration. Immutable working-copy commits get per-workspace child handling.

Required conditions and counterevidence:

- Issue closed in 2026 does not alone establish every earlier open status or fix absence; the narrower pinned initialization path supports the present code limitation.
- Expect WorkingCopyStale for any workspace not updated by the GUI is too broad: tree equality can remain Fresh, and Updated/reload is another route.
- Manually managed Git-worktree workaround is proposed, not verified here.

Evidence: `working_docs`, `operation_docs`, `workspace`, `finish`, `rename`, `rename_view`, `issue_4342`, `issue_4436`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F7 — Signal cleanup and progress

CURRENT report lines 64–70. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Unix guards run on normal drop and SIGINT/SIGTERM; signal writes to socketpair, background thread drains guards then restores/re-raises; second signal immediately fatal.
- Non-unix init is a no-op; snapshot progress callback is in-process and not a persisted event protocol.
- Out-of-process or library embedding choices are recommendations, with progress/output failures separate from repository transition.

Required conditions and counterevidence:

- No SIGPIPE behavior in cleanup_guard does not prove none elsewhere in CLI/runtime; current module supports only the named signals.
- Generic CleanupGuard callbacks are not necessarily cosmetic; current progress registration restores cursor/clears display, but cleanup trait can register other functions.
- Streaming or durable UX completion protocol is not implemented or measured by citing the callback type.

Evidence: `cleanup`, `progress`, `wc_trait`, `snapshot`, `ui_progress`, `finish`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### S — Cross-cutting coverage and six proposed checks

CURRENT report lines 72–99. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Report gives seven findings, both question families, simpler integration choices and explicit unresolved sources; no tests executed.
- Conflict markers and file/type conflict limitations are separated from future unresolved-state UI. Source pin/current capture and historical issue version qualifiers are broadly retained.

Required conditions and counterevidence:

- Original scope remains incomplete for status path scope and --at-op=@ exception; operation restore/undo current-workspace disk consequences and ignored/untracked exclusions are not fully developed.
- Acquisition window claims, non-use and omitted-source declarations remain candidate-authored event assertions; absence is not zero acquisition.
- No completed GUI safety/progress/recovery recipe is proven, and negative repairs/fix existence remain unresolved.

Evidence: `task`, `brief`, `status`, `options`, `default_merge`, `working_docs`, `concurrency_docs`, `operation_docs`, `undo`, `restore`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

## R030: all emitted finding and shared-condition groups

### F1 — Freshness detection

CURRENT report lines 13–17. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Tree equality is the freshness fast path. Operation ancestry distinguishes newer/reload, stale and sibling; snapshot reports errors/hints.
- The report captures several distinct working-copy states rather than treating equal op IDs as the sole freshness definition.

Required conditions and counterevidence:

- Every command fails until update-stale is too broad: ignore-working-copy/non-snapshot routes and equal-tree case are exceptions.
- Any unreadable op object does not enter special recovery: only ObjectNotFound; other op-store errors propagate.
- Current-report shorthand loses these important applicability/error conditions even where acquired source pointers retain them.

Evidence: `freshness`, `snapshot`, `recovery`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F2 — Operation-view reconciliation

CURRENT report lines 19–23. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Shared operation-view history uses content-addressed operations/views and divergent-head reconciliation; optional lock prevents duplicate reconciliation work.
- Git corruption and distributed filesystem caveats are explicitly retained; test source indicates intended concurrent child preservation.

Required conditions and counterevidence:

- Candidate says test body asserts both child commits while acquisition reads only lines 1-140; decisive assertions are 177-181. Available source supports intended test, but claimed followed read is broader than log.
- No tests run or universal convergence/atomic-store guarantee follows from source capability.
- Full originally required per-workspace file state and other-workspace staleness remain only partly connected.

Evidence: `concurrency_docs`, `op_heads`, `default_merge`, `bad_locking_tests`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F3 — Per-workspace lock and checkout limits

CURRENT report lines 25–29. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Mutation locks workspace and rereads state; old tree consistency guards exist and separate workspaces have separate lock/state.
- Individual state files use temp persistence; Windows-open-file retry TODO and pending_checkout resume TODO exist.
- Checkout skips untracked blockers and parent file blockers; file-overwrite/removal change check TODO exposes external-edit race.

Required conditions and counterevidence:

- Atomic single-file rename is not atomic materialized checkout or power-loss durability. No pending_checkout implementation in this path is a bounded code conclusion, not an entire product absence proof.
- Read lock dispatch does not establish exact blocking latency or contention outcome.
- Create-parent-dir behavior specifically skips file blockers and rejects other failures; it cannot guarantee every hostile-filesystem safety property.

Evidence: `local_lock`, `local_state`, `local_checkout`, `workspace`, `wc_trait`, `lock`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F4 — Snapshot crash/panic boundaries

CURRENT report lines 31–35. Preservation: **SUPPORTED_SUBMECHANISMS_RETAINED; UNSUPPORTED_CRASH_SAFETY_INFERENCE_REPEATED**.

Supported components:

- Snapshot traversal can write content blobs, build merged tree, alter in-memory file state, then persist working-copy state at finish; error/unwrap sites exist.
- Directory read_dir unwrap and conflict-marker parsing are concrete risky sites. Historical #4396 reports a 0.20/0.21 snapshot conflict panic.

Required conditions and counterevidence:

- Tree write happens inside TreeState::snapshot at 889-892, not solely at finish. Finish persists tree_state/checkout separately.
- Crash mid-snapshot implies harmless orphan blobs/no corruption is not established for all steps. Earlier repo commit versus working-copy finish and checkout failures create other possible residues.
- Historical panic site/source traversal does not prove the reproducer panics in v0.22.0; missing merge.rs read is acknowledged by candidate.
- A safe-observation theorem cannot be drawn from a limited set of in-memory/save paths.

Evidence: `local_snapshot`, `local_state`, `local_lock`, `snapshot`, `merge`, `issue_4396`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F5 — Snapshot cost and skip-mode proposals

CURRENT report lines 37–41. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Most default helper commands snapshot including otherwise observational status/history; automatic tracking and configured fsmonitor govern work.
- Issue #4545 reports timing and trigger/stale-workspace caveats. Library API offers no-snapshot control to an embedding application.

Required conditions and counterevidence:

- Pure reader invocation with ignore-working-copy skips working-copy mutation but can still reconcile default divergent repository operations.
- No background snapshot completed/freshness guarantee is supplied; reported timings are historical, not measurements of these accepted jobs.
- Issue #4508 body was not claimed read by candidate; title-level reference must not become source-supported runtime discovery.
- Status path-restricted output does not restrict preceding snapshot; this material original-scope constraint remains omitted.

Evidence: `working_docs`, `options`, `default_merge`, `snapshot`, `local_snapshot`, `wc_trait`, `issue_4545`, `issue_4508`, `fsmonitor`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F6 — Progress and update-before-report

CURRENT report lines 43–47. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Pinned commit/update/report order includes the #4239 rationale and source fix; current report preserves this supported ordering.
- Progress uses 250ms initial delay, 30Hz nominal cadence and terminal display guards. Unix SIGINT/SIGTERM versus non-unix differences are supported.
- Progress callback/output failures are distinct from operation state; GUI design suggestions remain unexecuted.

Required conditions and counterevidence:

- External exact maintainer comment/PR linkage remains UNKNOWN without independently frozen response bytes.
- Cleanup guards are generic callbacks, not universally cosmetic; the progress-installed guard is display cleanup.
- All post-commit or progress-output failures need event-location qualification; ordering is not an all-command atomic success guarantee.
- Evaluator confirms non-TTY/pager suppression in ui.rs; candidate did not claim acquiring that code, so no native credit.

Evidence: `finish`, `patch_order`, `issue_4239`, `progress`, `cleanup`, `ui_progress`, `wc_trait`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F7 — Workspaces and colocated integration

CURRENT report lines 49–53. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Repository view tracks per-workspace commits; immutable working-copy child handling and forgotten workspace skipping exist.
- Pinned API has workspace rename; report honestly leaves detailed CLI semantics unvisited. Captured #4436 is a secondary-workspace Git integration lead with post-pin closure.

Required conditions and counterevidence:

- Immutable commits are not equivalent to every abandoned/hidden commit. No automatic recovery rule for all such states follows from this loop.
- Source region without Git worktree creation is narrow absence, not exhaustive proof of every implementation path.
- Source shared repository/per-workspace physical state, forgetting versus disk deletion, and cross-workspace stale consequences are not fully developed.

Evidence: `working_docs`, `workspace`, `finish`, `rename`, `issue_4436`, `colocate`, `concurrency_docs`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### S — Failure history, gaps and six proposed checks

CURRENT report lines 55–74. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Seven coherent findings, both families, explicit source gaps and UNEXECUTED runtime checks. Source mechanism is not an implemented GUI.
- #4493 is captured open with indefinite Git-import hang report; #4423 is historical reboot view failure. No automatic successful repair demonstrated.

Required conditions and counterevidence:

- #4493 explicitly reports jj 0.21; pin applicability is unresolved, and current discussion omits that qualifier.
- No automated repair located in visited regions is not proof of absence across the complete original corpus.
- Operation undo/restore limits, status path scope, generic --at-op exception and historical-vs-pinned runtime consequences are incomplete.
- Acquisition logs a successful version-pin read at inputs/repository/PIN.json while navigation reports that path failed; availability of inputs/PIN.json does not repair the candidate log.
- Native read/GET/mechanical occurrence and whether supplied map aided actual navigation remain independently unobserved.

Evidence: `task`, `brief`, `issue_4493`, `issue_4423`, `operation_docs`, `undo`, `restore`, `status`, `options`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

## R031: all emitted finding and shared-condition groups

### F1 — Observation behavior and skip modes

CURRENT report lines 17–34. Preservation: **SUPPORTED_SNAPSHOT_MECHANISM_RETAINED; UNSUPPORTED_READONLY_SEED_REPEATED**.

Supported components:

- Most default helper-based commands snapshot and can rewrite/rebase while an editor continues to change files. Ignore/tracking/fsmonitor constraints matter.
- Historical #4545 timings and stale-workspace/Watchman-trigger caveats are reported, not new benchmark values.
- Current report and draft keep recommendations separate from UNEXECUTED tests.

Required conditions and counterevidence:

- Genuinely non-mutating --ignore-working-copy and generic --at-op is false as a repository-wide guarantee; --at-op=@ remains writable, and default head reconciliation can create repository operations.
- Observation safe during any concurrent editing interval is not proved. Path filters narrow status output after snapshot and are omitted.
- Statement every claim comes from actual read/GET is candidate-authored provenance, not qualified native acquisition.

Evidence: `working_docs`, `options`, `default_merge`, `snapshot`, `local_snapshot`, `issue_4545`, `fsmonitor`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F2 — Checkout lock and materialization

CURRENT report lines 36–50. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Expected-old-tree ConcurrentCheckout check and per-workspace lock reread protect cooperating jj state changes.
- Persist tree_state and checkout uses temp files; Windows retry/persist TODOs and untracked skipped-files behavior are retained.
- External edits before overwrite/removal are an explicit TODO; report leaves actual lock blocking behavior unverified.

Required conditions and counterevidence:

- All races converted to structured errors/all persisted state atomic is overbroad: checkout state read/write unwrap, multi-file writes, external-edit TODO and separate persistence steps remain.
- An exclusive GUI writer cannot lock out arbitrary editors; automatic retry success remains a proposal.
- Fine-grained serialized state update is source behavior rather than observed timing/native execution.

Evidence: `wc_trait`, `workspace`, `local_lock`, `local_state`, `local_checkout`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F3 — Tree-first freshness and normal update-stale

CURRENT report lines 52–65. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Tree equality fast path, operation ancestry classification and surfaced stale/sibling conditions are explained.
- Normal update-stale snapshots on last-known operation, resolves repo head, guards tree consistency, checks out and finishes desired operation.
- No handwritten silent repair recommendation; recovery is a user-visible proposal.

Required conditions and counterevidence:

- Nothing-to-do branch prints a message and exits at normal function end; exact early-return wording is imprecise but does not change the supported main recovery order.
- No universal dirty-file preservation guarantee follows from successful stale classification/commands.
- Typed error location/version and concurrent modification conditions must remain distinct from GUI state.

Evidence: `freshness`, `snapshot`, `recovery`, `workspace`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F4 — Interruption, op-heads and missing-operation recovery

CURRENT report lines 67–82. Preservation: **SUPPORTED_ORDERING_UNDEVELOPED_IN_STANDALONE_CURRENT; INCORRECT_RECOVER_DESCRIPTION_PRESERVED**.

Supported components:

- Divergent committed heads reconcile on later load subject to documented filesystem/backend conditions; old ancestor heads can be pruned.
- Normal stale update and special missing-operation recovery are different; Unix signal cleanup is not an all-platform durable recovery log.
- Candidate EC1 in evidence-chains plus acquisition read record retains the supported update-before-report ordering at pinned cli_util.rs:1765-1771.

Required conditions and counterevidence:

- After ANY interruption repo automatically converges is contradicted by the same report Git corruption/storage caveats; unreadable objects and persistent NoHeads can fail.
- recover() does not construct a recovery commit from disk or re-check out files. Recovery child uses desired commit/tree; recover clears state/reset metadata without touching disk, then maybe_snapshot captures disk.
- Special route is ONLY ObjectNotFound, not any unreadable operation. Files absent from target can be newly tracked later according to ignore/tracking rules, not guaranteed permanently untracked leftovers.
- Standalone CURRENT and its available report draft omit the specific #4239 commit→conditional update→report mechanism despite retaining a fix label and EC1 reference. This is supported companion content left undeveloped, not a verified drafted-then-deleted event.

Evidence: `concurrency_docs`, `op_heads`, `recovery`, `wc_trait`, `local_checkout`, `local_lock`, `cleanup`, `finish`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F5 — Panic and storage failure history

CURRENT report lines 84–97. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Captured #4465 reports jj 0.21 op-show panic while op-diff worked; pinned revset commit-to-position unwrap still exists.
- Git backend corruption and insufficiently tested distributed/colocated filesystems are explicitly acknowledged.
- Hard-reboot body reports load failure, and source can surface such errors rather than silently accept them.

Required conditions and counterevidence:

- Present unwrap is not proof the exact historical reproducer still panics in v0.22.0; test proposal expects an outcome not yet executed.
- Later commands still run is not established by issue body beyond stated op-diff success.
- Core no-data-loss claims must be conditional on filesystem ordering/backend validity; they cannot establish universal interruption convergence.
- Crash root cause, empty files or successful store repair remain unresolved without relevant qualified evidence.

Evidence: `issue_4423`, `issue_4465`, `revset`, `concurrency_docs`, `load_error`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F6 — Progress delivery channels

CURRENT report lines 99–112. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Terminal progress formatter and snapshot callback are in-process mechanisms, not persisted replayable command completion events.
- 250ms delay, 30Hz cadence and guards are source-supported; embedding callback and out-of-process integration are proposals.
- Candidate honestly leaves non-TTY progress suppression unread; evaluator source shows suppression for nonterminal/pager contexts.

Required conditions and counterevidence:

- Only embedding has a progress channel/no machine-readable channel anywhere is an unbounded negative claim based on limited regions.
- UI use of callback is no successfully implemented durable recovery/progress protocol.
- Current progress output may be suppressed and is separate from durable state; no runtime stream test was executed.

Evidence: `progress`, `cleanup`, `wc_trait`, `snapshot`, `ui_progress`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### F7 — Colocated Git coupling

CURRENT report lines 114–126. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Pinned import-Git-HEAD duplicate-working-copy TODO documents three inconsistent/racing stages.
- Submodule/secondary-workspace issue titles are explicitly treated as leads, not full body or fix evidence.
- Backend and multi-machine caveats govern any simplified integration design.

Required conditions and counterevidence:

- TODOs concern more than processes seeing an external HEAD move: own Git HEAD export before repo commit and updated repo versus not-yet-updated working copy are explicit second/third cases.
- Flagship heavily used/tested upstream is not established by code/test-source presence or run receipts.
- Opt-out colocated-mode and reconciliation policy are GUI proposals without demonstrated safety/economics.

Evidence: `colocate`, `issue_4349`, `issue_4436`, `concurrency_docs`, `workspace`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

### S — Current issue table, shared obligations and six checks

CURRENT report lines 128–186. Preservation: **SUPPORTED_COMPONENTS_PRESENT_WITH_QUALIFICATIONS**.

Supported components:

- Seven findings and current issue table preserve several title/body/source role distinctions, current-capture dates, known unread sources and all proposed checks as UNEXECUTED.
- Available report draft removes the unverified expectation that the panic is gone only in later versions; this is proper correction of unsupported speculation.
- Source pin and GUI transfer limits are explicit; byte-preserved PNGs are not visually claimed as evidence.

Required conditions and counterevidence:

- Table fix-in-v0.22.0 label does not supply ordering explanation absent from CURRENT body. References to EC1 cannot fill standalone material coverage.
- Repeated genuine non-snapshotting generic --at-op statements drop @ exception; global non-mutation is unproved.
- Report labels #4508 four comments; frozen issue has nine. macOS 14/15 are OS versions, not jj versions.
- Ordinary foreground CLI usage and autosnapshot assumes human finishes edit are inferred design assumptions, not established source invariants.
- Operation undo/restore versus shared repo/all other workspace disk/ignored files remains incomplete. No full-scope safety/recovery recipe or method success is credited.

Evidence: `task`, `brief`, `issues_index`, `issue_4239`, `issue_4508`, `options`, `default_merge`, `working_docs`, `operation_docs`, `undo`, `restore`, `finish`, `status`. Exact source paths, SHA-256 and governing line ranges are in the source catalog.

## Full original scope

These 14 subdivisions were frozen from source before candidate assertions were opened. They are evaluator-derived and retain all original task/brief obligations; they are not an original numeric answer key. Missing material source constraints are explicit, not concealed by byte availability.

| Governing requirement | R028 | R029 | R030 | R031 |
| --- | --- | --- | --- | --- |
| F1.snapshot | PARTIAL: helper/filters present, governing default scope and concurrency limits incomplete. | SUPPORTED_WITH_QUALIFICATIONS: defaults and filters detailed; no uniform background-safe guarantee. | PARTIAL: source mechanisms present but crash-safe and pure-reader overclaims. | PARTIAL: snapshot detailed, concurrent-edit guarantees unsupported. |
| F1.options | PARTIAL: @ exception retained in F3; repository-wide non-mutation not qualified. | INCOMPLETE: generic --at-op exception and repo reconciliation omitted. | INCOMPLETE: pure-reader interpretation omits repo reconciliation and @ distinction. | INCORRECT: genuinely non-mutating generic --at-op/ignore claims repeated. |
| F1.scope | OMITTED: paths filter output after snapshot, not preceding snapshot. | OMITTED: paths filter output after snapshot, not preceding snapshot. | OMITTED: paths filter output after snapshot, not preceding snapshot. | OMITTED: paths filter output after snapshot, not preceding snapshot. |
| F1.workspaces | PARTIAL: rename useful, separate working-copy state/shared view baseline thin. | SUPPORTED_WITH_LIMITS: shared repo/per-workspace state/forget; unconditional stale inference overbroad. | PARTIAL: immutable handling and colocated limitation; full cross-workspace/disk distinction thin. | PARTIAL: locks/staleness present; per-workspace view/state/forget less developed. |
| F1.concurrency | INCOMPLETE: filesystem visibility/Git backend/distributed FS caveats omitted. | SUPPORTED_WITH_LIMITS: divergent op merging and backend/FS caveats retained. | SUPPORTED_WITH_LIMITS: reconciliation and caveats retained; test read window overclaimed. | MIXED: caveats retained in F5/F7 but ANY interruption convergence contradicts them. |
| F2.order | SUPPORTED_WITH_LIMITS: ordering present; no-stale and precommit residue overclaims. | SUPPORTED_WITH_LIMITS: ordering preserved; earlier writes/cleanup external qualifiers incomplete. | SUPPORTED_WITH_LIMITS: ordering preserved and progress differentiated; guarantees must narrow. | UNDEVELOPED: supported companion EC1 ordering absent from CURRENT standalone body. |
| F2.freshness | SUPPORTED_WITH_LIMITS: tree/ancestry classifications present, recovery applicability overbroad. | SUPPORTED_WITH_LIMITS: classifications clear; unconditional other-workspace stale inference overbroad. | MIXED: classifications present but every-command stale failure overclaims exceptions. | SUPPORTED_WITH_LIMITS: classifications clear; no universal dirty-file/recovery success. |
| F2.normal_recovery | PARTIAL: snapshot→merge→guard→checkout broadly present; full-file read inconsistent. | SUPPORTED_WITH_LIMITS: ordered route/guard retained, external transcript unresolved. | PARTIAL: recovery mentioned but blanket until-repair failure claim broad. | SUPPORTED_WITH_LIMITS: route/guard detailed; success remains conditional. |
| F2.missing_operation | INCOMPLETE: exact ObjectNotFound applicability not consistently retained. | SUPPORTED_WITH_LIMITS: exact ObjectNotFound and child/reset semantics retained. | INCOMPLETE: unreadable-object shorthand too broad. | INCORRECT: recover from disk/re-checkout description contradicted by reset-only implementation. |
| F2.op_recovery | INCOMPLETE: repo view undo/restore versus all workspace disk/ignored/untracked content thin. | INCOMPLETE: repo view undo/restore versus all workspace disk/ignored/untracked content thin. | INCOMPLETE: repo view undo/restore versus all workspace disk/ignored/untracked content thin. | INCOMPLETE: repo view undo/restore versus all workspace disk/ignored/untracked content thin. |
| S.failure_history | MIXED: useful patches/tests, malformed chain and unsupported external/current panic rootcause claims. | MIXED: bounded current code good, external recovery recipes unqualified and test read window overclaimed. | MIXED: historical/captured sources separated, some body-version and test assertion qualifiers missing. | MIXED: titles recognized as leads, EC1 undeveloped and present unwrap overstated as current reproduction. |
| S.transfer | PROPOSALS/UNEXECUTED: useful safeguards, limited by unsupported no-stale/crash-state assumptions. | PROPOSALS/UNEXECUTED: useful alternatives, safe tree_state deletion and generic skip claims need narrowing. | PROPOSALS/UNEXECUTED: useful boundaries, crash-safe snapshot inference unsupported. | PROPOSALS/UNEXECUTED: detailed UI ideas, global readonly and recovery assumptions unsupported. |
| S.version | MIXED: pin/capture explicit, external followup/ancestor-only claims need qualification. | MIXED: chronology corrected, external followup remains uncaptured. | MIXED: pin explicit; #4493 0.21 omitted and PIN path inconsistent. | MIXED: pin/capture explicit, historical unwrap/issue counts unqualified. |
| S.locators | INCOMPLETE: seven findings, many locators, wrong rename/hash/state-file labels and unsupported negatives. | INCOMPLETE: seven findings, locators useful, test read window/external negatives incomplete. | INCOMPLETE: seven findings, locators useful, source-version/read-scope inconsistencies. | INCOMPLETE: seven findings, useful locators, key ordering deferred to companion and conflicting conditions. |

All six opportunity families are assessed separately in the JSON: observation_effects, workspace_state, completion_and_delivery, recovery, failure_history and integration_transfer. Useful supported current-only rename and hidden-change-prefix repair are credited as within-universe novelty; omitted unasked exact phrases are not automatic failures. All four reports leave material originally asked safe-observation/recovery conditions incomplete.

## Mechanism and economic evidence

The map is a host-prepared lexical path/symbol aid available to both arms. Treatment artifacts describe map navigation; control artifacts describe non-use. These self-authored descriptions do not independently establish native invocation or a successful research recipe. R030 delivers a verified exact line map of all 2,093 source lines, which adds no semantic facts beyond supplied source. Its partial displayed/read view is not recovered by assuming every line was acquired. Generic mechanical failures remain in the record; their per-call timing is UNKNOWN. Control non-use cannot erase common host setup cost.

| Report | Inclusive accepted job seconds | Reported input | Reported output lower bound | Reported cache read | Reported total |
| --- | ---: | ---: | ---: | ---: | ---: |
| R028 | 966.163517 | 3,173,448 | 42,491 | 2,955,136 | 3,215,939 |
| R029 | 1438.127653 | 6,353,888 | 64,097 | 6,103,936 | 6,417,985 |
| R030 | 718.014024 | 1,725,033 | 29,629 | 1,582,080 | 1,754,662 |
| R031 | 1217.846587 | 2,427,992 | 70,803 | 2,193,344 | 2,498,795 |

Accepted-job subtotal: **4340.151781 worker-seconds**, with **207,020 reported output tokens**. This is not cohort elapsed time, total campaign spend or an invoice. Cache values are scalar reports and are not added again to total. Reasoning/cache-write scalars are reported as zero, but full child/cancelled/generated usage remains UNKNOWN.

Frozen map input declares first host setup **0.9738001080004324 seconds** outside candidate execution. Independent setup meter and original inside-Goal first-use compliance are not established. Whole-companion operator clocks sum to **7.382168 seconds**; their inner copy clocks are part of the same operation and are not added again. Closed-bundle preparation and seal copy metadata are 10.428360 and 13.320522 seconds respectively, with overlap unknown. Addendum copy metadata is 0.017478727997513488.

Earlier failed, pre-native, capped and repair attempt counts/costs have no positively bound records in this intake and remain UNKNOWN. Source clone/fetch/export, waits, actual cleanup, per-call navigation, rendering/evaluation model usage and account load are also incomplete. Configured caps/reserves are not elapsed events or zero-cost evidence. Internal candidate-reported failed calls are retained individually without invented timings or double-counting.

Raw accepted times are lower for treatment in both T11 and T12, but semantic coverage, source qualification and carrier quality are not equivalent. Missing attempts and meters forbid a winner, price claim, best-of result, no-wait speedup or cost-per-supported-fact conclusion.

## Freeze and limits

Original review start 1790897690.0416684; original deadline 1790903090.0416684; reserved finalization starts 1790901890.0416684; immutable campaign deadline 1790904541. Conservative event charge reserved through final is 116 of 120; exact harness counter and evaluator token/cache/reasoning usage are unexposed. The original clock was not reset.

Only the assigned review directory was written. No Goals/helpers, public fetches, third-party execution, candidate repair, old-grade rewrite, Git/Plans/provider-store access or raw private native receipt/modelIO inspection occurred. A final receipt pins the completed JSON, readable report, complete assertion tables, source scope, integrity proof, exact history diff and reviewer accounting. Publication remains with root.


There are 331 exact CURRENT line carriers, including explicitly excluded structure headings, with line-specific adverse/corrective decisions in [material-adjudications.json](material-adjudications.json). The 92 source-supported component rows include three source-only correction/counterevidence components and shared format/provenance components, which are explicitly excluded from authored supported-seed credit. No preservation percentage uses those rows as a denominator. All ten distinct candidate-declared failed internal calls are listed with duplicate mentions consolidated and costs UNKNOWN.

Final validation reauthenticated all 4,748 exact input-target copies, all 31 output versions, all 60 primary context pins and every assertion/condition reference. All complete carrier counts match; the sole malformed JSON remains R028 line 10 column 777. Two reviewer source-range endpoints were corrected to physical file ends before freezing. Final inclusive evaluator wall time: 2528.442855 seconds; original time remaining at freeze: 2871.557145 seconds. Validation has zero mismatches.
