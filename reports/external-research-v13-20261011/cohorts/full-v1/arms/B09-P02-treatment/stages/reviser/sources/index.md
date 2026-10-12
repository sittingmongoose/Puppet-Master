# Reviser source index

Source IDs S01–S13 preserve the investigator package's identities. The critic's checks and reviser's independent checks are recorded in [source-map.json](../source-map.json). No source ID is silently rebound.

<a id="s01"></a>
## S01 — Efficient Fair Queuing Using Deficit Round-Robin

- Exact URL: https://web.stanford.edu/class/ee384x/EE384X/papers/DRR.pdf
- Released version/commit: IEEE/ACM Transactions on Networking, vol. 4 no. 3, 1996
- Locator: Title/abstract; article begins at p. 375; primary PDF landing/open
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Searched and opened the paper PDF; search-result excerpt exposed abstract and bibliographic details; PDF text extraction had no lines.
- Governing condition/default/exception: Authors describe DRR as an O(1) approximation for fair queuing in variable-length packet flows; applicability to task dispatch is an analogy, not a guarantee for memory or non-preemptive job workloads.
- Applicability: Informs per-extension rotating dispatch and measured-cost fairness alternatives; does not directly specify desktop job scheduling.

- Critic recheck: Opened the cited primary PDF landing document; full text could not be independently extracted in this review.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s02"></a>
## S02 — Control Group v2 — Linux kernel documentation

- Exact URL: https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html
- Released version/commit: Linux kernel documentation tree 7.1; API behavior must be verified on supported installed kernels
- Locator: Delegation section lines 174–179; memory interface lines 639–707; memory events lines 751–785
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened versioned kernel docs; inspected delegation model, memory.high/max, memory.current/peak and events.
- Governing condition/default/exception: Controller files are exposed only if controller is available/enabled; delegating access requires parent permissions; memory.high throttles and does not invoke OOM; memory.max is a hard limit that invokes cgroup OOM when reclaim fails, can temporarily be exceeded; major usage accounting is stated to be reasonable rather than fully watertight.
- Applicability: Supports capability-gated Linux worker memory limits and event-based measurement; no-admin deployment can use only a writable pre-delegated cgroup. OOM action is scoped to cgroup per docs.

- Critic recheck: Opened versioned kernel documentation and checked delegation permissions, process inheritance/migration, memory.high, memory.max, and accounting caveat.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

- Reviser recheck: Independently reopened the versioned primary kernel documentation and inspected process placement, migration, delegation, memory accounting, memory.high, memory.max, and memory events. It states children enter the parent's current cgroup, later migration does not move existing descendants, and recommends assigning at startup. A second direct open returned the same primary page.
- Reviser recheck access UTC: 2026-10-12T01:08:58Z/2026-10-12T01:13:41Z

<a id="s03"></a>
## S03 — JOBOBJECT_EXTENDED_LIMIT_INFORMATION

- Exact URL: https://learn.microsoft.com/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information
- Released version/commit: Win32 desktop API; page shows minimum client Windows XP
- Locator: Members ProcessMemoryLimit and JobMemoryLimit, lines 54–72 in opened documentation
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened API reference and inspected fields and remarks.
- Governing condition/default/exception: PROCESS_MEMORY and JOB_MEMORY limits bound virtual memory that can be committed, not RSS/physical memory. Job and per-process commit limits are independent. Notification-limit path can notify while allowing further commits.
- Applicability: Supports Windows task-descendant committed-memory boundary and calibration; UI must not equate commit cap with physical RAM cap.

- Critic recheck: Opened primary Microsoft Learn API result and checked committed-virtual-memory semantics, independent process/job limits, and peak accounting.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

- Reviser recheck: Opened the primary Microsoft Learn result and read the memory-limit member definitions and remarks; a later direct reload returned an internal error, so the successful search/open content is the basis of this check.
- Reviser recheck access UTC: 2026-10-12T01:08:58Z/2026-10-12T01:13:41Z

<a id="s04"></a>
## S04 — AssignProcessToJobObject

- Exact URL: https://learn.microsoft.com/windows/win32/api/jobapi2/nf-jobapi2-assignprocesstojobobject
- Released version/commit: Win32 desktop API; nested-job behavior changed starting Windows 8 / Server 2012
- Locator: Remarks on existing job, access rights, same session and older Windows versions; lines 51–70
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened API reference and inspected assignment constraints and OS-version exceptions.
- Governing condition/default/exception: Assignment requires a job with assign rights and a process handle with quota/terminate rights. Already-jobbed processes must fit a valid nested hierarchy and cannot use UI limits; before Windows 8 the process could not already be in a job. All processes in a job must be in the same Terminal Services session.
- Applicability: Requires launch-time capability probe; do not assume a worker can be added to a job in every host environment.

- Critic recheck: Opened the primary Microsoft Learn function reference and checked handle rights, same-session and nested-job conditions, pre-Windows-8 behavior, and child/breakaway behavior.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

- Reviser recheck: Found the official Microsoft Learn function page through primary-source search and opened it. Checked assignment rights, nesting/OS-version conditions, pre-assignment memory behavior, and default child association/breakaway. A later direct reload returned an internal error; the successful official page text is retained.
- Reviser recheck access UTC: 2026-10-12T01:08:58Z/2026-10-12T01:13:41Z

<a id="s05"></a>
## S05 — Job Objects

- Exact URL: https://learn.microsoft.com/windows/win32/procthread/job-objects
- Released version/commit: Win32 Job Objects overview; nesting support Windows 8 / Server 2012 onward
- Locator: Managing Job Objects lines 81–90, especially kill-on-job-close and nested process trees
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened overview and inspected handle-close cleanup and nesting conditions.
- Governing condition/default/exception: If JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE is set, closing the last job handle terminates associated processes; nested jobs are available beginning Windows 8 and earlier systems need another process-tree strategy.
- Applicability: Supports task-owned Windows worker cleanup after host crash and cancellation; exact outer-job compatibility remains a runtime check.

- Critic recheck: Opened the primary Job Objects overview and checked kill-on-last-handle behavior and nested-job version boundary.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

- Reviser recheck: Opened the primary Microsoft Learn Job Objects page and checked child association, breakaway configurations, nested-job constraints, and kill-on-close. A later direct reload returned an internal error; the successful official search result/open content is the basis of this check.
- Reviser recheck access UTC: 2026-10-12T01:08:58Z/2026-10-12T01:13:41Z

<a id="s06"></a>
## S06 — Extension Host

- Exact URL: https://code.visualstudio.com/api/advanced-topics/extension-host
- Released version/commit: VS Code docs, moving version; access 2026-10-12
- Locator: Extension Host configurations and stability/performance section (official search excerpt; direct open timed out once)
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Searched official VS Code API docs; attempted direct open, which timed out; observed the official result excerpt.
- Governing condition/default/exception: VS Code uses extension-host processes by runtime/location; docs position the host as separating extension execution from UI concerns. Multiple extensions may share a host; this is not per-task isolation.
- Applicability: Illustrative separate extension-host architecture only; not evidence about the unnamed target application.

- Critic recheck: Direct page open returned an internal error during this review; relied on the predecessor's explicitly bounded search excerpt only.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s07"></a>
## S07 — VS Code Extension API — withProgress

- Exact URL: https://code.visualstudio.com/api/references/vscode-api
- Released version/commit: VS Code API reference, current page; access 2026-10-12
- Locator: window.withProgress reference, lines 2140–2150 in opened page
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened official API reference and read callback, progress increment and cancellation-token semantics.
- Governing condition/default/exception: Progress lifetime follows returned callback promise; only notification progress currently supports discrete progress and cancel button; task receives token to observe user cancellation. API describes signal delivery, not forced worker termination.
- Applicability: Useful user-facing progress/cancel pattern; must be paired with host-owned cancellation and result-publication logic.

- Critic recheck: Opened the official current API reference and inspected promise lifetime, progress increments, token, and cancellable-location support.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s08"></a>
## S08 — VS Code extHostProgress.ts

- Exact URL: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostProgress.ts
- Released version/commit: Repository main branch, moving; commit SHA not exposed in fetched page; not release-pinned
- Locator: withProgress lines 459–469; _withProgress lines 487–523; $acceptProgressCanceled lines 523–535
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened current GitHub source page and inspected extension-host callback/token and cancellation bridge; GitHub showed branch main but no commit SHA.
- Governing condition/default/exception: A CancellationTokenSource is created only for cancellable operations; callback receives its token; completion ends progress; incoming cancel calls source.cancel(). The task promise still controls completion, so no force-kill is implied.
- Applicability: Concrete reference caller/implementation showing cooperative cancellation semantics in a real extension host, not target code.

- Critic recheck: Opened raw current-main source and followed cancellation source creation, token passed to callback, progress end on returned promise settlement, and cancel bridge.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s09"></a>
## S09 — VS Code mainThreadProgress.ts

- Exact URL: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/browser/mainThreadProgress.ts
- Released version/commit: Repository main branch, moving; commit SHA not exposed in fetched page; not release-pinned
- Locator: MainThreadProgress.$startProgress and cancellation callback, lines 444–479; extHostProgress token path, lines 487–535
- Access UTC: 2026-10-12T00:45:10Z/2026-10-12T00:45:35Z
- Observed operation: Opened current GitHub source page; read the main-thread progress listener that invokes $acceptProgressCanceled(handle), and the extension-host code that maps this to CancellationTokenSource.cancel(); the task promise still controls completion.
- Governing condition/default/exception: UI cancellation crosses the extension-host/main-thread RPC bridge and signals a cooperative token. The implementation does not forcibly terminate a worker or provide durable job state; cancellation effectiveness depends on callback behavior.
- Applicability: Reference for UI/process boundary only; not target app code.

- Critic recheck: Opened raw current-main source and checked the main-thread cancellation callback delegates to extension-host $acceptProgressCanceled.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s10"></a>
## S10 — Test view-level progress from an extension (via withProgress API), issue #93822

- Exact URL: https://github.com/microsoft/vscode/issues/93822
- Released version/commit: Issue opened 2020-03-31; March 2020 milestone; closed testplan-item
- Locator: Testing section lines 177–208; linked API declaration lines 183–208
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened official repository issue and read its test procedure.
- Governing condition/default/exception: The issue asks a tester to create an extension/tree view and exercise view progress; it describes only Notification progress as currently offering cancel. It is a manual test-plan item, not a recorded test pass or fix.
- Applicability: Shows an upstream validation pattern to adapt; must not be represented as completed evidence.

- Critic recheck: Opened official GitHub issue and confirmed testplan-item label, manual view-progress procedure, and closed-completed status.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s11"></a>
## S11 — Write-Ahead Logging

- Exact URL: https://www.sqlite.org/wal.html
- Released version/commit: SQLite current WAL documentation; access 2026-10-12; bug note lists release versions
- Locator: WAL recovery and file behavior; section 11 WAL-reset bug, lines 191–195
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened official SQLite WAL documentation and inspected recovery, same-host caveat, retained WAL semantics, and release-fix note.
- Governing condition/default/exception: WAL is part of persistent DB state and must travel with DB; WAL is same-host only; docs say a rare corruption bug affected 3.7.0 through 3.51.2 and is fixed in 3.51.3+ (backports 3.44.6 and 3.50.7), under simultaneous write/checkpoint conditions on multiple connections.
- Applicability: If SQLite WAL is selected for durable job state, pin a fixed maintained release; see S12 for current release at research time. Not a requirement to adopt SQLite.

- Critic recheck: Opened official current WAL docs and checked affected through 3.51.2, fixed 3.51.3 and listed backports.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s12"></a>
## S12 — SQLite Recent News — Version 3.54.0

- Exact URL: https://www.sqlite.org/news.html
- Released version/commit: SQLite 3.54.0 released 2026-10-09; news page as accessed 2026-10-12
- Locator: Recent News lines 21–27; 3.54.0 release entry
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened official release/news page after checking current release history.
- Governing condition/default/exception: Release entry states 3.54.0 includes enhancements and fixes; earlier 3.53.0 entry states WAL-reset fix and 3.51.3 entry lists patch fix. 3.54.0 is a current release, not a fixed promise of future support.
- Applicability: Sets a date-bounded version reference if SQLite is chosen; verify the library actually shipped by the host application.

- Critic recheck: Opened official SQLite release history and checked dated release notes and WAL-reset fix references.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

<a id="s13"></a>
## S13 — SQLite is Transactional

- Exact URL: https://www.sqlite.org/transactional.html
- Released version/commit: SQLite current documentation; access 2026-10-12
- Locator: Atomic/consistent/isolated/durable guarantee and regression-harness note, lines 20–28
- Access UTC: 2026-10-12T00:36:00Z/2026-10-12T00:45:35Z
- Observed operation: Opened official SQLite transaction page and read ACID/crash guarantee and test-harness statement.
- Governing condition/default/exception: SQLite states a single transaction is all-or-none through program, OS, or power failure and says this is extensively checked by a special crash/power-loss harness; actual durability still depends on selected SQLite configuration and storage behavior.
- Applicability: Supports a local state journal option and fault-injection validation proposal; does not make journal and report files one atomic transaction.

- Critic recheck: Opened official transactional guarantee and checked its single-database-transaction scope.
- Critic recheck access UTC: 2026-10-12T00:57:25Z/2026-10-12T01:01:03Z

