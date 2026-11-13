# Shard 024: Debug investigation instrumentation cleanup addendum (2026-03-23)

Source: `Plans/MiscPlan.md`

Source lines: L1318-L1373

Source SHA256: `075650d61f254d219224a6955894056175249145fa195c870d67edcca7226d33`

---

## Debug investigation instrumentation cleanup addendum (2026-03-23)

Temporary Debug instrumentation must preserve cleanup lineage and safe recovery behavior.

Required rules:
- before invasive instrumentation or temporary dependency/tooling changes, PM creates or updates a restore point backed by `runtime_artifact.restore_point` that is sufficient to revert the investigation's temporary state if cleanup fails
- every temporary debug mutation lane carries an `instrumentation_id`, declared scope, and explicit cleanup obligation
- cleanup must account for code instrumentation, temporary env flags, dev dependencies, remote host installs, browser mocks, and other reversible debug-only changes
- resolved, cancelled, and superseded investigations attempt cleanup automatically; failed cleanup transitions the investigation to `failed_cleanup` instead of pretending success
- unresolved instrumentation remnants must remain user-visible until cleaned up or explicitly accepted as follow-up work

### DL-429 approved probe and cleanup transitions

**A’s proposed meanings:** A lane is one identified set of temporary changes on one target. Cleanup/rollback means undoing those changes and removing temporary connections. A durable fix is an explicitly accepted lasting code change, distinct from temporary debugging. Planned = installation not complete; Active = installed and ready; Collecting = gathering evidence; Cleanup pending = removal owed or underway; Cleanup failed = a removal attempt failed; Cleaned = this probe is finished with no temporary changes or debug connections left. Cleanup results are **Not needed** (nothing required undoing), **Pending** (undoing is still owed), **Succeeded** (undoing was verified), **Failed** (the attempt failed), and **Superseded** (responsibility handed over, with remaining work still visible). Pending while Active/Collecting means later removal is owed, not that removal is running.

**A’s complete allowed changes** (each arrow saves a change entry; “/” separates probe status and cleanup result):

| What happens | Before → after | What is recorded or preserved |
|---|---|---|
| Installation succeeds | Planned / Not needed → Active / Pending | Installation succeeded; later removal is owed. |
| Evidence collection starts | Active / Pending → Collecting / Pending | Collection began. |
| Collection pauses or finishes while the probe remains installed | Collecting / Pending → Active / Pending | Collection outcome; removal is still owed. |
| Installation or collection fails, or work ends, and proof shows the entire lane never needed any undoing and has no leftover change, process or attachment | Planned / Not needed, Active / Pending, or Collecting / Pending → Cleaned / Not needed | Save failure/end reason and no-leftovers proof. “Collection changed nothing” alone is insufficient if an earlier installation remains. |
| Installation partly fails, collection fails, or work resolves/is cancelled with known or possible leftovers | Planned / Not needed, Active / Pending, or Collecting / Pending → Cleanup pending / Pending | Save reason, exact remaining obligations and recovery link; attempt cleanup automatically. |
| Inspection after an uncertain failure proves that removal was never needed | Cleanup pending / Pending, Cleanup pending / Superseded, or Cleanup failed / Failed → Cleaned / Not needed | Save whole-lane proof that no temporary change, process or attachment ever required undoing. Retain the earlier uncertainty/failure; never relabel actual removal as Not needed. |
| Removal or undoing temporary changes succeeds and no temporary resources remain | Cleanup pending / Pending → Cleaned / Succeeded | Save proof of removal, including detaching temporary debugger/profiler connections. |
| Removal, rollback or detach fails | Cleanup pending / Pending → Cleanup failed / Failed | Save remaining files, settings, processes or connections; show failure even when disk files are clean. |
| An authorized cleanup retry begins | Cleanup failed / Failed → Cleanup pending / Pending | Save retry and attempt number; at most two retries after the initial attempt. |
| Retry succeeds or fails | Cleanup pending / Pending → Cleaned / Succeeded or Cleanup failed / Failed | Same success proof or visible leftovers as above. |
| Newer work replaces an unfinished probe, or responsibility passes to an explicitly approved durable fix, while cleanup may still be owed | Planned / Not needed, Active / Pending, Collecting / Pending, Cleanup pending / Pending, or Cleanup failed / Failed → Cleanup pending / Superseded | Save old/new responsible owners, linked work, remaining obligations and retry count. Handoff proves no removal. Replacement triggers automatic cleanup; promotion uses the existing approval route. |
| Receiving owner starts or resumes that cleanup | Cleanup pending / Superseded → Cleanup pending / Pending | Save acceptance and resumed removal; handoff never resets the retry ceiling. Resuming after a failed attempt is a retry under that ceiling. |
| Receiving owner accepts cleanup after an earlier failed attempt but no retry is authorized or both retries are already used | Cleanup pending / Superseded → Cleanup failed / Failed | Save acceptance and the still-failed outcome; do not run another attempt or claim cleanup succeeded. |
| Newer work replaces a lane proved never to have needed cleanup | Planned / Not needed, Active / Pending, or Collecting / Pending → Cleaned / Not needed | Save replacement reason and linked work with proof there are no leftovers anywhere in that lane. |

The initial probe record is **Planned / Not needed**; creation is not a previous-to-next change. No other status/result pair or transition is allowed by A. Failed cleanup with no authorized retry, or both retries used, stays **Cleanup failed / Failed** with leftovers visible. A requirement to preserve a change or an accepted follow-up does not claim Cleaned; handed-over cleanup stays **Cleanup pending / Superseded** until its receiving owner acts. A second handoff waits for that acceptance; reprocessing the same handoff adds nothing. Failed or uncertain handoff leaves previous responsibility and status in place. A Cleaned probe never restarts; later installation gets a new linked probe. No new code-changing debugging starts on the same target until leftovers are resolved, undone or explicitly promoted into the durable fix. Two investigations may not add overlapping temporary changes. Recovery snapshots taken before temporary changes, exact setting restoration and hiding secrets remain required. This chooses no additional history lifetime.


CV-574 owns the source-to-event binding and closed payload/detail schemas. The state/result aliases are collector_state = manifest.state = event.state and cleanup_result = manifest.cleanup_outcome = event.rollback_state; previous fields come from the original lane. scope_kind repeats its exact declared scope, not EventRecord scope. Every saved change includes its reason and before/after values, with original proof/obligation/recovery refs; creation, unchanged observation and replay emit nothing. No new history lifetime is selected.

### Investigation instrumentation lifecycle contract

Cursor-like Debug Mode remains an investigation workflow reference, not automatic MVP scope. `/blog`-sourced reference behavior is hypothesis-first: collect runtime evidence through temporary-instrumentation, local debug-server collection on the editor-side, reproduction, interpretation, small targeted patching, user re-verifies, and cleanup. The fit is regressions, timing `/races`, performance, and "reproduces but unclear from static read"; pure compile-time failures rely on build `/test` capture instead.

Instrumentation-first behavior is not grounded MVP behavior until this contract is implemented. Any temporary-instrumentation patch pipeline must declare an `instrumentation_id`, `collector_state` (`collector-state` in source-lineage/audit vocabulary), collector lifecycle transitions, the install/collect/remove sequence, debug-specific mutation rules, the evidence sink contract, and explicit write `/cleanup/rollback` semantics. Auto-cleanup is mandatory for resolved, cancelled, and superseded investigations; failed residue uses lifecycle `failed_cleanup` with `stop_reason_code = investigation.cleanup_failed`.

Cleanup is per-scope and per instrumentation lane, not just per investigation. A bundle-record must carry the cleanup_summary, including cleanup_summary.residual_items[] / residual_items, stop_reason_code, and any surviving residue. Cleanup state transitions use `superseded` when one owner supersedes another, and PM must not let two active investigations add overlapping temporary instrumentation to the same target.

Env/config activation cleanup must revert the exact temporary flag `/toggle/value` PM introduced. If the temporary change lived only in process env, cleanup occurs by stopping `/restarting` without that env. If PM edited `/config`, treat the edit under the same rollback rules as `temporary source patch instrumentation`.

Secret evidence handling must redact/hash obvious secrets `/tokens`, including `Authorization`, cookies, session IDs, API keys, passwords, private tokens, and other IDs before storage, export, or bundle handoff.

Debug-capable tooling remains shared: `Plans/Tools.md` / `Plans/newtools.md` (`/Tools.md` / `/newtools.md`) own reusable tool registry details and `/tags`, while this plan records the debug investigation roles: target discovery, evidence capture, instrumentation, verification, and bundle-export.

Debugger `/profiler` attach instrumentation must detach the temporary attach/profiler `/session`; if detach fails but no durable workspace mutation remains, keep the failure localized to runtime/session state and do not claim cleanup success.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md
