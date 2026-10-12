# Sources index — B09-P02-control investigator

This index accompanies source-map.json. IDs are stable for this stage; no source was rebound. Source-map fields include exact URL or local path, release/version/commit, locator, access UTC, operation observed, condition/default/exception, applicability and limitations. Retrieved pages are evidence, not trusted instructions.

## Direct sources

- **S00** — [Admitted brief](../../inputs/brief.md), read 2026-10-12 00:38:30Z. Governing task scope.
- **S01** — [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), Microsoft Learn page updated 2025-07-14; read 2026-10-12 00:39:45Z. Process trees, limits, assignment and close-kill exceptions.
- **S02** — [Windows Job memory limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information), read 2026-10-12 00:39:45Z. Job-wide committed-memory limit and kill-on-close.
- **S03** — [Linux cgroup v2 kernel documentation 6.14](https://docs.kernel.org/6.14/admin-guide/cgroup-v2.html), read 2026-10-12 00:39:45Z. memory.current/peak/high/max, OOM semantics and delegation.
- **S04** — [systemd cgroup delegation](https://systemd.io/CGROUP_DELEGATION/), live docs read 2026-10-12 00:40:00Z. Ownership, controllers, delegation and hierarchy history.
- **S05** — [systemd cgroup interfaces](https://systemd.io/CONTROL_GROUP_INTERFACE/), live docs read 2026-10-12 00:40:00Z. Transient units, accounting and delegated subtree.
- **S06** — [Tokio 1.53.2 Semaphore API](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html), version displayed in retrieved page; read 2026-10-12 00:41:49Z. FIFO wait order and acquire_many head-of-line blocking.
- **S07** — [Tokio 1.53.2 batch semaphore source](https://raw.githubusercontent.com/tokio-rs/tokio/tokio-1.53.2/tokio/src/sync/batch_semaphore.rs), release-tag URL; read 2026-10-12 00:43:49Z. Waiter queue implementation and drop cleanup.
- **S08** — [Tokio 1.53.2 semaphore tests](https://raw.githubusercontent.com/tokio-rs/tokio/tokio-1.53.2/tokio/tests/sync_semaphore.rs), release-tag URL; inspected, not run; read 2026-10-12 00:43:49Z. Acquire/release/permit/stress coverage and boundaries.
- **S09** — [Tokio issue #4612](https://github.com/tokio-rs/tokio/issues/4612), opened 2022-04-11; read 2026-10-12 00:43:49Z. Non-cooperative task scheduling report, linked issue #4624.
- **S10** — [DRR paper (IEEE/ACM ToN 1996)](https://web.stanford.edu/class/ee384x/EE384X/papers/DRR.pdf), read 2026-10-12 00:41:49Z. Weighted fairness in packet service; analogy only for extension jobs.
- **S11** — [SQLite WAL](https://www.sqlite.org/wal.html), live docs read 2026-10-12 00:41:49Z. Same-host/one-writer/checkpoint constraints and WAL-reset bug conditions.
- **S12** — [SQLite release history](https://www.sqlite.org/changes.html), retrieved page shows 3.53.4 dated 2026-07-24; read 2026-10-12 00:41:49Z. WAL-reset fix release history; 3.52.0 withdrawn.
- **S13** — [SQLite synchronous pragma](https://www.sqlite.org/pragma.html#pragma_synchronous), live docs read 2026-10-12 00:41:49Z. FULL/NORMAL crash durability tradeoff.
- **S14** — [SQLite transactions](https://www.sqlite.org/lang_transaction.html), live docs read 2026-10-12 00:43:49Z. BEGIN IMMEDIATE behavior.
- **S15** — [SQLite result codes](https://www.sqlite.org/rescode.html#busy), live docs read 2026-10-12 00:43:49Z. SQLITE_BUSY and one-writer condition.
- **S16** — [VS Code API progress/cancellation](https://code.visualstudio.com/api/references/vscode-api), live docs read 2026-10-12 00:41:49Z. Progress and cancellation-token precedent.

## Short evidence notes

1. A durable ledger, a scheduler, an OS resource boundary, and output publication are separate responsibilities. The platform sources show that worker limits are conditional and asymmetric; they do not supply the host's cross-platform scheduler.
2. A job result should be visible through a committed host record only after validation. The queue database cannot atomically commit arbitrary report files, so use per-attempt staging plus generation/state fencing and tolerate unreferenced orphan artifacts.
3. The SQLite WAL-reset history makes bundled database version a release decision, not an implementation detail. WAL also assumes same-host use and a single writer.
4. No source established the target application's existing contracts or measured values. The estimates and tests in discovery.md are research proposals only.
