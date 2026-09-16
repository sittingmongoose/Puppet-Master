# Batch 18 — first UNVERIFIED implementation slice

Scope: Scheduled messages and recurring windows (47 retained worklist identities).
Baseline: exact B17 cumulative HTML SHA-256 8d0f5293687fe2fd0d87508bbcaedb5253fca1372e39202b7e80588497300d0b.
Upstream: f9effd40420e496647a3af6cb2902de1ea08b9d7, separately pinned from local snapshot worktree.

Implemented so far: pure IANA wall-clock resolution, gap/fold policy and calendar recurrence; session-local exact message snapshots, immutable artifact retention, expected-revision edits/cancel, separate dispatch tickets and retries, scope/route/permission/attachment revalidation, missed-time policies, transactional source-composer consumption and transcript append.

Still pending: integrate actual recurring-window boundaries and revalidation with Plan execution; ordinary gallery workflows; all functional, layout, regression and motion verification; final guarded installer and cumulative archive verification. This is not install-ready, not native/production, not formally audited, not accepted.

B17 automated VM result is user-relayed, not a local independent receipt read. Agent omitted the one tracked handoff/node_modules symlink from a separate archive export only. Do not follow or delete it from the real repo. Native print-dialog check remains open and does not require restarting B17 development.
