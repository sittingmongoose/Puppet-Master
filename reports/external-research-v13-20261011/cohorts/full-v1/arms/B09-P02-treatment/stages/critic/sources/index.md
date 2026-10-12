# Critic source index

This is a bounded navigation index for the independent review. Source IDs S01-S13 retain their exact predecessor identities; reviewer observations are appended under reviewer_checks in [source-map.json](../source-map.json). No ID has been rebound.

Critic recheck window: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z.

Original index: [investigator source index](../../investigator/sources/index.md).

<a id="s01"></a>
## S01 — Efficient Fair Queuing Using Deficit Round-Robin

- URL: https://web.stanford.edu/class/ee384x/EE384X/papers/DRR.pdf
- Version/commit: IEEE/ACM Transactions on Networking, vol. 4 no. 3, 1996
- Locator: Title/abstract; article begins at p. 375; primary PDF landing/open
- Critic check: PDF opened; text extraction returned no lines in this review. Retained only as the predecessor-recorded, qualified packet-fairness analogy.

<a id="s02"></a>
## S02 — Control Group v2 — Linux kernel documentation

- URL: https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html
- Version/commit: Linux kernel documentation tree 7.1; API behavior must be verified on supported installed kernels
- Locator: Delegation section lines 174–179; memory interface lines 639–707; memory events lines 751–785
- Critic check: Independently checked delegation permissions, fork/migration behavior, memory accounting, memory.high and memory.max. Supports MI-2 and the platform caveats.

<a id="s03"></a>
## S03 — JOBOBJECT_EXTENDED_LIMIT_INFORMATION

- URL: https://learn.microsoft.com/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information
- Version/commit: Win32 desktop API; page shows minimum client Windows XP
- Locator: Members ProcessMemoryLimit and JobMemoryLimit, lines 54–72 in opened documentation
- Critic check: Independently checked committed virtual memory semantics and independent process/job limits.

<a id="s04"></a>
## S04 — AssignProcessToJobObject

- URL: https://learn.microsoft.com/windows/win32/api/jobapi2/nf-jobapi2-assignprocesstojobobject
- Version/commit: Win32 desktop API; nested-job behavior changed starting Windows 8 / Server 2012
- Locator: Remarks on existing job, access rights, same session and older Windows versions; lines 51–70
- Critic check: Independently checked assignment rights, existing/nested job constraints, OS-version behavior and child/breakaway conditions. Supports MI-2.

<a id="s05"></a>
## S05 — Job Objects

- URL: https://learn.microsoft.com/windows/win32/procthread/job-objects
- Version/commit: Win32 Job Objects overview; nesting support Windows 8 / Server 2012 onward
- Locator: Managing Job Objects lines 81–90, especially kill-on-job-close and nested process trees
- Critic check: Independently checked kill-on-last-handle and nested-job version conditions.

<a id="s06"></a>
## S06 — Extension Host

- URL: https://code.visualstudio.com/api/advanced-topics/extension-host
- Version/commit: VS Code docs, moving version; access 2026-10-12
- Locator: Extension Host configurations and stability/performance section (official search excerpt; direct open timed out once)
- Critic check: Direct open failed in this review; inherited source excerpt is labeled moving docs and is not needed for findings.

<a id="s07"></a>
## S07 — VS Code Extension API — withProgress

- URL: https://code.visualstudio.com/api/references/vscode-api
- Version/commit: VS Code API reference, current page; access 2026-10-12
- Locator: window.withProgress reference, lines 2140–2150 in opened page
- Critic check: Independently checked withProgress promise lifetime, cancellation token and Notification progress/cancel limits.

<a id="s08"></a>
## S08 — VS Code extHostProgress.ts

- URL: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostProgress.ts
- Version/commit: Repository main branch, moving; commit SHA not exposed in fetched page; not release-pinned
- Locator: withProgress lines 459–469; _withProgress lines 487–523; $acceptProgressCanceled lines 523–535
- Critic check: Independently checked current-main raw source: token passed to callback and cancelled by bridge; returned promise controls completion.

<a id="s09"></a>
## S09 — VS Code mainThreadProgress.ts

- URL: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/browser/mainThreadProgress.ts
- Version/commit: Repository main branch, moving; commit SHA not exposed in fetched page; not release-pinned
- Locator: MainThreadProgress.$startProgress and cancellation callback, lines 444–479; extHostProgress token path, lines 487–535
- Critic check: Independently checked current-main raw source: main-thread progress cancel invokes extension-host cancellation bridge.

<a id="s10"></a>
## S10 — Test view-level progress from an extension (via withProgress API), issue #93822

- URL: https://github.com/microsoft/vscode/issues/93822
- Version/commit: Issue opened 2020-03-31; March 2020 milestone; closed testplan-item
- Locator: Testing section lines 177–208; linked API declaration lines 183–208
- Critic check: Independently checked official issue: manual testplan-item, not a target-app or critic test result.

<a id="s11"></a>
## S11 — Write-Ahead Logging

- URL: https://www.sqlite.org/wal.html
- Version/commit: SQLite current WAL documentation; access 2026-10-12; bug note lists release versions
- Locator: WAL recovery and file behavior; section 11 WAL-reset bug, lines 191–195
- Critic check: Independently checked the WAL-reset bug range and fix versions in current WAL docs.

<a id="s12"></a>
## S12 — SQLite Recent News — Version 3.54.0

- URL: https://www.sqlite.org/news.html
- Version/commit: SQLite 3.54.0 released 2026-10-09; news page as accessed 2026-10-12
- Locator: Recent News lines 21–27; 3.54.0 release entry
- Critic check: Independently checked date-bounded SQLite release history including 3.54.0 dated 2026-10-09.

<a id="s13"></a>
## S13 — SQLite is Transactional

- URL: https://www.sqlite.org/transactional.html
- Version/commit: SQLite current documentation; access 2026-10-12
- Locator: Atomic/consistent/isolated/durable guarantee and regression-harness note, lines 20–28
- Critic check: Independently checked SQLite single-transaction crash guarantee; it does not make external report files atomic.

