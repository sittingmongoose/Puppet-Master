# Shard 024: Debug investigation instrumentation cleanup addendum (2026-03-23)

Source: `Plans/MiscPlan.md`

Source lines: L1317-L1344

Source SHA256: `d6df972ed7015b1942e58814db32c487fa2c65a26341c2d814e0d08b0f0707a6`

---

## Debug investigation instrumentation cleanup addendum (2026-03-23)

Temporary Debug instrumentation must preserve cleanup lineage and safe recovery behavior.

Required rules:
- before invasive instrumentation or temporary dependency/tooling changes, PM creates or updates a restore point backed by `runtime_artifact.restore_point` that is sufficient to revert the investigation's temporary state if cleanup fails
- every temporary debug mutation lane carries an `instrumentation_id`, declared scope, and explicit cleanup obligation
- cleanup must account for code instrumentation, temporary env flags, dev dependencies, remote host installs, browser mocks, and other reversible debug-only changes
- resolved, cancelled, and superseded investigations attempt cleanup automatically; failed cleanup transitions the investigation to `failed_cleanup` instead of pretending success
- unresolved instrumentation remnants must remain user-visible until cleaned up or explicitly accepted as follow-up work

### Investigation instrumentation lifecycle contract

Cursor-like Debug Mode remains an investigation workflow reference, not automatic MVP scope. `/blog`-sourced reference behavior is hypothesis-first: collect runtime evidence through temporary-instrumentation, local debug-server collection on the editor-side, reproduction, interpretation, small targeted patching, user re-verifies, and cleanup. The fit is regressions, timing `/races`, performance, and "reproduces but unclear from static read"; pure compile-time failures rely on build `/test` capture instead.

Instrumentation-first behavior is not grounded MVP behavior until this contract is implemented. Any temporary-instrumentation patch pipeline must declare an `instrumentation_id`, `collector_state` (`collector-state` in source-lineage/audit vocabulary), collector lifecycle transitions, the install/collect/remove sequence, debug-specific mutation rules, the evidence sink contract, and explicit write `/cleanup/rollback` semantics. Auto-cleanup is mandatory for resolved, cancelled, and superseded investigations; failed residue uses lifecycle `failed_cleanup` with `stop_reason_code = investigation.cleanup_failed`.

Cleanup is per-scope and per instrumentation lane, not just per investigation. A bundle-record must carry the cleanup_summary, including cleanup_summary.residual_items[] / residual_items, stop_reason_code, and any surviving residue. Cleanup state transitions use `superseded` when one owner supersedes another, and PM must not let two active investigations add overlapping temporary instrumentation to the same target.

Env/config activation cleanup must revert the exact temporary flag `/toggle/value` PM introduced. If the temporary change lived only in process env, cleanup occurs by stopping `/restarting` without that env. If PM edited `/config`, treat the edit under the same rollback rules as `temporary source patch instrumentation`.

Secret evidence handling must redact/hash obvious secrets `/tokens`, including `Authorization`, cookies, session IDs, API keys, passwords, private tokens, and other IDs before storage, export, or bundle handoff.

Debug-capable tooling remains shared: `Plans/Tools.md` / `Plans/newtools.md` (`/Tools.md` / `/newtools.md`) own reusable tool registry details and `/tags`, while this plan records the debug investigation roles: target discovery, evidence capture, instrumentation, verification, and bundle-export.

Debugger `/profiler` attach instrumentation must detach the temporary attach/profiler `/session`; if detach fails but no durable workspace mutation remains, keep the failure localized to runtime/session state and do not claim cleanup success.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md
