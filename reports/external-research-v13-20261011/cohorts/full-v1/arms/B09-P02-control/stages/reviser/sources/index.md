# Source index — B09-P02-control reviser

This index is navigable by source ID. Full identity records and conditions are in [source-map.json](../source-map.json). S00–S16 are the investigator’s original, immutable source identities; C01–C09 are independent critic observations; R01–R08 are new reviser observations. Older records are preserved as historical records and were not rebound when current-source details changed.

## Governing input and original investigation

### [S00] Admitted brief
[Local brief](../../inputs/brief.md). Governs the scope and constraints; full record and SHA-256 are in source-map.json.

### [S01] Microsoft Learn — Windows Job Objects
[Official Job Objects documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects). Process association, child inheritance exceptions, breakaway, termination, nested jobs, and last-handle close behavior.

### [S02] Microsoft Learn — JOBOBJECT_BASIC_LIMIT_INFORMATION
[Official Win32 structure reference](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information). Job-wide committed-memory limit, per-process limit, and KILL_ON_JOB_CLOSE.

### [S03] Linux kernel documentation 6.14 — cgroup v2
[Version-pinned kernel documentation](https://docs.kernel.org/6.14/admin-guide/cgroup-v2.html). memory.current/peak/high/max, OOM semantics, controller hierarchy, and delegation.

### [S04] systemd — Control Group APIs and Delegation
[Official systemd guidance](https://systemd.io/CGROUP_DELEGATION/). Single-writer ownership, delegated subtrees, and controller availability versus enablement.

### [S05] systemd — The New Control Group Interfaces
[Official systemd interface guidance](https://systemd.io/CONTROL_GROUP_INTERFACE/). Alternative managed units, delegated subtrees, and accounting capabilities.

### [S06] Tokio 1.53.2 — Semaphore API
[Published semaphore API](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html). FIFO order and acquire_many head-of-line behavior; latest URL is mutable.

### [S07] Tokio 1.53.2 — release-tagged semaphore source
[Tagged implementation source](https://raw.githubusercontent.com/tokio-rs/tokio/tokio-1.53.2/tokio/src/sync/batch_semaphore.rs). Waiter queue and cleanup; commit SHA was not resolved in the inherited record.

### [S08] Tokio 1.53.2 — release-tagged semaphore tests
[Tagged test source](https://raw.githubusercontent.com/tokio-rs/tokio/tokio-1.53.2/tokio/tests/sync_semaphore.rs). Inspected only; no tests run.

### [S09] Tokio issue #4612
[Issue history](https://github.com/tokio-rs/tokio/issues/4612). Non-cooperative task scheduling report; not evidence of broken FIFO semaphore behavior.

### [S10] Shreedhar and Varghese — Deficit Round Robin
[1996 IEEE/ACM paper](https://web.stanford.edu/class/ee384x/EE384X/papers/DRR.pdf). Packet-flow fairness basis; application to extension jobs remains an analogy.

### [S11] SQLite — Write-Ahead Logging
[Official WAL documentation](https://www.sqlite.org/wal.html). Same-host and single-writer constraints, checkpoint behavior, WAL-reset bug and fix.

### [S12] SQLite — Release History
[Official release history](https://www.sqlite.org/changes.html). Historical investigator record said 3.53.4 was top at its access time; that top-release claim is corrected by R07 and not silently rewritten.

### [S13] SQLite — PRAGMA synchronous
[Official pragma reference](https://www.sqlite.org/pragma.html#pragma_synchronous). NORMAL/FULL durability behavior in WAL mode.

### [S14] SQLite — Transactions
[Official transaction reference](https://www.sqlite.org/lang_transaction.html). Transaction modes and write acquisition behavior.

### [S15] SQLite — Result and Error Codes
[Official result-code reference](https://www.sqlite.org/rescode.html#busy). SQLITE_BUSY and the single-writer constraint.

### [S16] Visual Studio Code Extension API
[Official API reference](https://code.visualstudio.com/api/references/vscode-api). Progress/cancellation precedent only.

## Independent critic observations

### [C01] Microsoft Learn — Job Objects
[Official page](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects). Rechecked membership, descendant exceptions, termination, and close semantics; supports F01.

### [C02] Microsoft Learn — Windows job limits
[Official structure reference](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information). Rechecked committed-memory and close-kill limits.

### [C03] Linux kernel documentation 6.14 — cgroup v2
[Version-pinned page](https://docs.kernel.org/6.14/admin-guide/cgroup-v2.html). Rechecked accounting, memory.high/max, and delegation conditions.

### [C04] systemd — cgroup delegation
[Official systemd page](https://systemd.io/CGROUP_DELEGATION/). Rechecked exclusive ownership and controller availability/enablement conditions.

### [C05] SQLite — WAL
[Official WAL page](https://www.sqlite.org/wal.html). Rechecked same-host, one-writer, checkpoint, and fixed-version statements.

### [C06] SQLite — synchronous pragma
[Official pragma page](https://www.sqlite.org/pragma.html#pragma_synchronous). Rechecked NORMAL and FULL durability trade-offs.

### [C07] SQLite — Release History
[Official release history](https://www.sqlite.org/changes.html). At critic access, the page listed 3.54.0 dated 2026-10-09 and the 3.51.3 fix.

### [C08] Tokio — Semaphore API
[Published API](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html). Rechecked FIFO and acquire_many head-of-line effect; does not establish host queue fairness.

### [C09] Visual Studio Code Extension API
[Published API](https://code.visualstudio.com/api/references/vscode-api). Rechecked progress/cancellation precedent only.

## Reviser primary-source rechecks

### [R01] Microsoft Learn — Windows Job Objects
[Official Win32 documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects). Reopened and inspected process assignment, CreateProcess child inheritance, Win32_Process.Create exception, breakaway, termination, nested jobs, and KILL_ON_JOB_CLOSE last-handle condition. Supports the qualified worker shutdown proposal; it does not prove target-host membership.

### [R02] Microsoft Learn — JOBOBJECT_BASIC_LIMIT_INFORMATION
[Official Win32 reference](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information). Reopened and inspected JOB_MEMORY committed-sum and KILL_ON_JOB_CLOSE flags. This is a per-job boundary, not a host-wide memory cap.

### [R03] Linux kernel documentation 6.14 — cgroup v2
[Version-pinned official documentation](https://docs.kernel.org/6.14/admin-guide/cgroup-v2.html). Reopened and checked memory.current, memory.peak, memory.high, memory.max, and delegation. High throttles/reclaims without OOM kill; max is a hard control but may be temporarily exceeded and may invoke OOM within the group. Availability is configuration-dependent.

### [R04] systemd — Control Group APIs and Delegation
[Official systemd documentation](https://systemd.io/CGROUP_DELEGATION/). Reopened and checked the single-writer rule, delegated-subtree boundaries, and the caveat that Delegate requests controllers but does not enable memory itself.

### [R05] SQLite — Write-Ahead Logging
[Official SQLite WAL documentation](https://www.sqlite.org/wal.html). Reopened and checked same-host requirement, single writer, reader-blocked checkpoint progress, and the 3.51.3 WAL-reset fix floor.

### [R06] SQLite — PRAGMA synchronous
[Official SQLite pragma documentation](https://www.sqlite.org/pragma.html#pragma_synchronous). Reopened and compared WAL NORMAL durability after application crash versus power loss and the additional per-commit WAL sync under FULL.

### [R07] SQLite — Release History
[Official SQLite release history](https://www.sqlite.org/changes.html). Reopened at 2026-10-12T01:10:29Z; it lists 3.54.0 dated 2026-10-09 and 3.51.3 dated 2026-03-13 as fixing WAL-reset database corruption. This corrects the old top-release metadata without altering S12.

### [R08] Tokio — Semaphore API
[Published Tokio API](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html). Reopened and checked FIFO acquire order and acquire_many head-of-line blocking. The API is not evidence of extension-queue fairness.
