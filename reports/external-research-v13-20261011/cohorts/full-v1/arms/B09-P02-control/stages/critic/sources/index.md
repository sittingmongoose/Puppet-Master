# Critic source index — B09-P02-control

This index accompanies source-map.json. C01–C09 are this critic's direct primary-source checks; their IDs are new and do not alter investigator IDs S00–S16. Access UTC, exact versions/URLs, locators, observed operations, conditions and applicability are recorded in source-map.json. Retrieved content was treated as evidence, not instructions.

## Direct sources

- **C01 (investigator S01)** — [Microsoft Learn: Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects). Process association, descendants, breakaway, termination, nested jobs and close behavior.
- **C02 (S02)** — [Microsoft Learn: JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information). Job-wide committed-memory cap and last-handle close-kill semantics.
- **C03 (S03)** — [Linux kernel 6.14: Control Group v2](https://docs.kernel.org/6.14/admin-guide/cgroup-v2.html). memory.current/peak/high/max and cgroup delegation.
- **C04 (S04)** — [systemd: Control Group APIs and Delegation](https://systemd.io/CGROUP_DELEGATION/). Single-writer ownership and conditional controller availability/enablement.
- **C05 (S11)** — [SQLite: Write-Ahead Logging](https://www.sqlite.org/wal.html). WAL host/writer/checkpoint limits and reset-bug fix.
- **C06 (S13)** — [SQLite: PRAGMA synchronous](https://www.sqlite.org/pragma.html#pragma_synchronous). WAL NORMAL/FULL durability behavior.
- **C07 (S12)** — [SQLite: Release History](https://www.sqlite.org/changes.html). 3.54.0 release dated 2026-10-09 and 3.51.3 WAL-reset fix.
- **C08 (S06)** — [Tokio: Semaphore API](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html). FIFO permits and acquire_many head-of-line effect.
- **C09 (S16)** — [VS Code Extension API](https://code.visualstudio.com/api/references/vscode-api). withProgress and cancellation-token precedent.

## Findings index

See [critique.md](../critique.md): F01 shutdown/reaping; F02 fairness rule; F03 SQLite release-history metadata; F04 unmeasured reservation heuristic; F05 unavailable host-specific inputs.

## Limits

The investigator's Tokio source/test files, issue page, and DRR paper were not independently reread in this critic pass; they are non-governing comparison sources and are not relied on for the findings. No target host source, tests, downloaded code, or workload evidence was available or executed.
