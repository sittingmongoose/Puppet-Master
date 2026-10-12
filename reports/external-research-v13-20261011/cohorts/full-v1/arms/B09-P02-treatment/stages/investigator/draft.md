# Draft — Background extension task admission and fairness

**Status:** Investigator proposal for independent review; not product canon, an approved implementation, or a deployment request.

## Recommendation

Use a small host-owned task manager with durable state, fair admission by extension, explicit waiting reasons, cooperative cancellation, and a host-controlled result publication gate. Add an out-of-process worker for substantial extension-authored or high-memory work; keep short host-owned work in-process only where it is bounded and trusted. On Windows, probe Job Object assignment and use a per-task job for descendant accounting, commit-memory limits, and kill-on-close. On Linux, use cgroup v2 memory controls only when the host has a writable delegated cgroup. Without that capability, process isolation still supports crash/cancel control, but memory admission is best-effort; do not claim a uniform hard cap without changing the no-administrator constraint. Numeric limits, the queue budget, the interactive reserve, worker count, and timeouts remain open until measured.

The brief does not name the host application or repository. The external VS Code references below are examples of an extension-host/progress API, not claims about the target. No target code, caller, test, or issue history was available to inspect. No implementation, load experiment, target test, or validation check was run.

## Clause-by-clause disposition of the released plan

### Paragraph 1

**P1.** “The draft creates host-owned queue entries with extension identity, task identifier, priority class, estimated memory and a cancellation token.” — **Accept and strengthen.** Add task class, extension/runtime version, stable idempotency key, input snapshot/hash, enqueue time, attempt, run-generation token, checkpoint contract/reference, and result manifest. Estimates are advisory and must be compared with observed measurements; a declaration is not a trustworthy reservation. The host owns state transitions and publication. A task token is a request to stop, not a kill primitive. [S07][S08][S09]

**P2.** “Interactive tasks have a reserved slot, while report tasks share the remaining worker capacity.” — **Change; retain as a measured option.** Compare (a) one permanently reserved interactive slot, which protects latency but can sit idle, with (b) a work-conserving shared pool with bounded interactive preference and batch aging, which uses capacity better but cannot preempt a long task that borrowed a slot. Begin with per-extension round-robin dispatch and bounded short-task preference/aging. If measurements establish a hard interactive-latency target, test a reserved slot. Long non-preemptive work can still block unless it yields at safe checkpoints or capacity is held idle. The required tradeoff is unresolved. DRR is relevant as a fairness analogy for variable-size work, but it was developed for packet-flow throughput and does not provide job-time or memory fairness by itself. [S01]

**P3.** “A per-extension cap prevents one submitter from occupying every slot.” — **Accept, with measurement.** Use a per-extension active-task cap and queued-backlog cap. The active cap bounds dispatch opportunities, not memory. Queue overflow must be explicit backpressure, not silent dropping. Set thresholds after burst tests; expose extension identity and age so an older task from another extension is visible. Do not give extensions larger quotas because they pay.

**P4.** “The waiting view exposes the limiting reason and allows cancellation or a temporary staff-selected priority increase.” — **Accept with revised override.** Show one concrete wait reason: all worker slots occupied, this extension at its active cap, memory reservation unavailable, user-paused, or older work ahead. Queued work can be canceled immediately. The brief establishes no staff role, so use an authorized user’s one-time **Run this task next** control rather than inventing staff selection. It may bypass normal fair order and a soft estimate gate only while the protected host-memory floor and every enforced worker cap remain intact. Explain which jobs wait, the estimate and uncertainty, and possible slow execution or worker failure. Whether to permit a separate soft-limit override when no hard OS memory boundary exists is an owner decision; never bypass the protected host floor or imply a hard boundary that is absent.

### Paragraph 2

**P5.** “Admission adds declared memory estimates and compares the total with a configurable budget.” — **Change.** Keep a separate worker-count ceiling and memory admission ledger. Derive a task’s initial reservation from measured task-class/input-size/runtime/OS observations and a conservative uncertainty margin; add running-task observations and current host pressure; preserve a measured host/UI headroom floor. Declared estimates help classify a new task but do not alone decide admission. Stop new starts under high pressure and resume only after a hysteresis threshold to avoid start/stop oscillation. Require measurements before numeric budgets.

**P6.** “The draft assumes extensions provide conservative estimates and has not selected an enforceable mechanism when actual usage exceeds them.” — **Reject the estimate assumption and resolve conditionally.** Never trust an extension’s claim as the only safety control. On Windows, a Job Object can limit a task tree’s committed memory, but commit charge is not an RSS/physical-memory cap; the job and per-process limits are independent. [S03] On Linux, cgroup v2 memory.high is a throttle/reclaim threshold and does not invoke OOM; memory.max is the hard cgroup limit, though it may be exceeded temporarily and may trigger cgroup-scoped OOM. [S02] Because kernel delegation requires permissions granted by a parent, probe for a writable delegation; do not require admin elevation. If unavailable, show that a memory cap is not enforced, use conservative reservations and stop dispatch under pressure. If the product requirement is a hard, equivalent memory boundary on every supported Linux install without elevation, the current constraints conflict and require an owner decision.

**P7.** “Workers are separate processes, but operating-system restrictions and what can safely be terminated remain unresolved.” — **Resolve with a capability-gated worker contract.** A process boundary permits task-scoped termination and crash isolation, but its startup, IPC, and document-snapshot costs need measurement. On Windows, create/assign a Job Object, account for child processes, and use kill-on-close for cleanup only when the host owns the last job handle. Assignment can fail when the host/worker already belongs to a job or a nested hierarchy is unsupported; behavior differs before Windows 8. Probe at launch and fail safely to an explicitly weaker mode or refuse tasks requiring a hard cap. [S04][S05] On Linux, place workers and their descendants in a delegated task cgroup when available. Otherwise a task-owned process group is only a weaker cleanup boundary: require the worker contract to keep children attached, and treat detached descendants as an unresolved containment failure. Terminate only verified task-owned processes and fence stale workers from publication. Never enumerate and terminate unrelated processes. [S02]

**P8.** “Host shutdown records queued jobs and stops owned workers; running jobs are marked interrupted on restart rather than claimed complete.” — **Accept and strengthen.** Persist queue/state transitions before acknowledging them. During graceful shutdown, stop dispatch, request cancellation, and wait a measured interval; terminate only task-owned workers that do not exit. Windows kill-on-job-close helps cleanup after an unclean host exit; Linux cleanup depends on cgroup delegation or a carefully tracked process group. At restart, queued jobs may remain queued; a formerly running job becomes interrupted until reconciled. Resume automatically only when the task declared idempotent checkpoint semantics and the input hash, extension/runtime version, and checkpoint all match. Otherwise offer an explicit retry. A generation/fencing token prevents a stale worker from publishing after restart. [S02][S05][S11][S13]

### Paragraph 3

**P9.** “Report output is written to a task-specific temporary location, then published with a completion record.” — **Accept and strengthen.** Write to a private task/run staging directory. A host-owned broker validates a complete output manifest and is the only component allowed to expose it. Keep reports discoverable through a committed manifest/catalog pointer; do not mark a partial directory as a report. Recovery reconciles staged, orphaned, and committed output. The output filesystem and journal are separate resources, so do not assume one file rename plus one database write is a single atomic operation. [S11][S13]

**P10.** “Cancellation sets the token and eventually terminates an unresponsive owned worker.” — **Accept with an explicit state machine.** Queued cancellation is immediate. Running cancellation records cancel-requested durably, signals a cooperative token/IPC message, and waits for a measured grace interval. If the task is in a process boundary and remains unresponsive, terminate only its assigned job/cgroup/process group. An in-process task has no safe general force-cancel guarantee. Keep UI state at “cancel requested” until acknowledged or terminated; do not report canceled while it can still publish. VS Code’s implementation demonstrates a token bridge, not forced termination: cancellation is propagated to a token and the callback promise controls completion. [S07][S08][S09]

**P11.** “The plan leaves the race between cancellation and publication unspecified, as well as fairness when continuous interactive work occupies its reserved capacity.” — **Resolve the publication race; retain fair-capacity choice as open.** Serialize cancel and publish at a durable state transition. A cancel accepted before publishing fences the worker’s run generation and blocks publication. Once publishing begins, show “finishing report” and disable cancellation for that brief commit window; publication succeeds only after a complete manifest is validated. For fairness, bound how many interactive starts can bypass batch work and age batch tasks; compare that with a reserved slot. A dispatch guarantee can bound skipped turns, but no scheduler can promise a short wall-clock wait behind arbitrary non-preemptive tasks without reserving capacity or making jobs yield. Continuous interactive submission must not erase batch aging.

**P12.** “No payment priority or administrator requirement is planned.” — **Accept.** No pay-based weighting. Keep normal operation at user privilege. Linux hard memory enforcement remains conditional on cgroup delegation already being writable; if not, disclose best-effort admission and ask the owner whether that limitation is acceptable instead of silently prompting for elevation. [S02]

**P13.** “Proposed validation includes estimate underreporting, burst submission, long-job starvation, cancel/publish races, host restart and low-memory behavior.” — **Accept and expand.** The validation plan below turns each into an observable property and adds OS boundary, process ownership, stale worker, partial-report, and crash-window checks. These are proposals only.

**P14.** “No load experiment has run.” — **Accept and preserve.** No load experiment or target-app test was run in this stage. Do not infer performance thresholds from the reference products.

### Review-status and scope clauses

**P15.** “The proposal should compare enforceable admission and fairness policies before choosing defaults.” — **Accept.** Alternatives are compared in this draft. No numeric default is selected because there are no measurements and no named target platform/runtime. The proposed hybrid is a research recommendation, not an endorsed product choice.

**P16.** “This is a provisional draft for review after the declared reveal, not an endorsed answer.” — **Accept.** This package is an investigator draft for independent review.

**P17.** “Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.” — **Accept.** Platform/API conditions and a relevant SQLite release fix are recorded in the source map. The target application’s repository, language, existing persistence, supported OS minimums, document access, and extension trust model are unknown; these remain owner questions, not inferred facts.

**P18.** “No future product deployment is requested.” — **Accept.** The phased work below is a proposal only; no implementation or deployment is requested or performed.

## Fairness and execution-boundary alternatives

| Choice | Advantages | Costs and limits | Disposition |
|---|---|---|---|
| Global FIFO | Simple, preserves arrival order | A burst from one extension creates head-of-line delay; no tenant fairness | Keep only within each extension queue |
| Global priority queue | Can serve interactive work promptly | Sustained high-priority work may starve reports; extension labels can be abused | Do not use as sole scheduler |
| Extension-keyed round robin | Simple bounded dispatch turns; one burst cannot occupy every start opportunity | Equal starts are not equal CPU time or memory; one long task still occupies a worker | Baseline candidate; define fairness in dispatch turns, then measure |
| Deficit round robin using declared cost | Better matches variable service in packet-flow setting [S01] | Current estimates are not trustworthy; memory and duration are distinct resources; opaque tasks cannot be preempted | Research option only after measured cost prediction |
| Bounded interactive preference plus aging | Keeps short work responsive without unlimited priority; gives reports a path forward | A non-preemptive task may still block; aging threshold needs measurements | Baseline candidate |
| Permanently reserved interactive slot | Strongest latency isolation at available capacity | Wastes capacity while idle; does not solve memory admission | Add only if measured UX target justifies it |
| Shared thread/in-process execution | Lowest startup/copy cost | No safe hard termination; cannot isolate task memory | Use only for short host-owned bounded work |
| Shared extension-host process | Protects UI process boundary and amortizes startup | One runaway job affects other work in that host; per-task memory and kill boundary absent | Useful compatibility mode, not enough for high-memory tasks |
| Per-task worker + OS job/cgroup | Stronger crash/cancel boundary and per-task measurement; can include child work | Startup/IPC costs; Windows job assignment may fail; Linux hard memory cap needs delegated cgroup | Candidate for substantial extension jobs; disclose weaker capability fallback |

## Admission alternatives

| Policy | What it enforces | Main weakness | Disposition |
|---|---|---|---|
| Sum only declared estimates against one configurable budget | A simple admission heuristic | Underreporting or stale estimates can oversubscribe memory; it does not account for changing host pressure | Reject as the only guard |
| Dynamic host headroom plus observed task reservations | Adapts dispatch to variable available memory and measured task classes | Soft only; observations lag and headroom can change while a task runs | Use for scheduling, with conservative margin and pressure hysteresis |
| Per-task OS boundary | Caps/accounting of worker-tree resources when supported | Windows cap is commit-based; Linux hard memory control requires delegated cgroup; neither is universal by configuration alone | Use where capability probing succeeds and user-facing limits are accurate |
| Combined reservation and OS boundary | Controls both starts and each worker’s enforced limit where available | More measurement and platform branches; fallback on Linux remains best-effort | Recommended candidate; do not claim the fallback is hard-limited |

## Proposed task lifecycle and UI behavior

Persist each transition with a versioned event or journal row: queued → starting → running → cancel-requested → canceled/failed/interrupted, or running → publishing → succeeded. A state transition must be idempotent by task ID and run generation. Progress events carry a task ID, monotonically increasing sequence, stage, optional fraction, message, and UTC update time. Unknown/indeterminate progress remains indeterminate; do not invent percentages or ETAs. The waiting panel shows queue age, extension, state, limiting reason, and available cancel/override action.

At the report boundary, cancel and publish compete for one durable gate. First, the worker closes and flushes staged outputs and the host validates the complete manifest. Then one journal transition either accepts cancel-requested and fences the run, or changes running to publishing; after publishing begins the UI says “finishing report” and disables cancellation. The host inserts the committed manifest pointer and succeeded state in a single durable transaction only after all files are present. Consumers list reports only through that manifest. A crash before the transaction leaves invisible orphan staging data to reconcile; a crash after it leaves a complete result. This is not a cross-filesystem atomic transaction: flush, journal durability settings, and recovery behavior must be validated on the target storage. If an extension can bypass the host broker and write directly into the public report store, the brief provides no sandbox/trust contract to prevent that; restricting report publication to the broker is an owner requirement.

For the one-time override, describe both consequences before action: it changes fair order and can delay named queued jobs; bypassing a soft estimate can increase pressure or cause worker failure. Keep the minimum measured host/UI reserve and worker hard cap non-bypassable. Do not offer a soft-guard bypass on an unbounded worker without an owner-approved risk policy.

## Required measurements before selecting numeric defaults

- Host/UI baseline and current pressure signal on representative Windows/Linux machines with variable RAM.
- Peak task memory by platform, task class, input size, plugin version, and worker tree; compare Windows job commit charge with process working set and Linux cgroup current/peak/events.
- Declared-vs-measured error distribution; missing, stale, and underreported estimates.
- Worker launch/IPC/document-snapshot overhead; report write size and speed.
- Short-task completion latency, report wait percentiles, oldest-task age, per-extension dispatch skew, and blocking time from non-preemptive work.
- Cancellation request-to-ack and forced-termination latency, process-tree cleanup success, and orphan worker count.
- Restart recovery time; checkpoint reuse vs retry rate; partial/orphan artifact cleanup; journal size.
- Interactive responsiveness and task failure under low-memory pressure.

These observations determine worker ceilings, active/backlog caps, resource reservations and safety margin, interactive lane/reserve, queue aging, cancellation grace, progress update cadence, and retention. The brief provides none of those values.

## Proposed phased integration

1. Decide the task identity, document snapshot/capability, state journal, and extension cancellation contract. Ship queue visibility, truthful wait reasons, queued cancellation, and progress for one representative task.
2. Add fair per-extension dispatch, active/backlog caps, a bounded interactive preference, and aging. Measure burst behavior before tuning.
3. Move one high-memory report path to a private worker boundary. Probe Windows Job Object assignment and Linux cgroup delegation; expose the capability and fallback level.
4. Add durable cancel/publish fencing, host-only manifest publication, host restart reconciliation, and opt-in idempotent checkpoints.
5. Validate on low/high-memory Windows and Linux configurations before selecting defaults or widening rollout. No full scheduling platform or deployment is proposed.

## Validation plan — proposed, not executed

1. **Burst fairness:** Submit a large burst from extension A and one task each from B and C. Verify a configured bound on skipped dispatch turns, per-extension active caps, explicit backlog rejection, and no silent drops. Test both FIFO and bounded interactive priority; verify age promotion under continuous interactive submission. Measure the non-preemptive blocking interval.
2. **Memory admission:** Exercise accurate, missing, understated, overstated, and stale estimates with worker count held constant. Vary available memory/pressure and verify that new starts pause at the protected host floor and resume only after hysteresis. Confirm count limits and byte reservations are separate.
3. **Windows boundary:** Test Job Object assignment, commit-limit notification/failure, child-process accounting, kill-on-close on host exit, and failure under outer/nested jobs and supported older Windows versions. Confirm unrelated processes are untouched.
4. **Linux boundary:** Test memory.high throttle behavior, memory.max OOM/event reporting, descendants, controller-unavailable and non-delegated-user cases. Confirm best-effort mode is labeled and no elevation is required. Confirm only the task group is stopped.
5. **Cancellation:** Cancel queued, cooperative-running, unresponsive-running, and already-publishing tasks. Inject races around every state commit. Verify the UI does not say canceled until work cannot publish and that a completed report cannot be mislabeled canceled.
6. **Publication integrity:** Crash before and after staging, manifest validation, journal transition, and catalog exposure. Verify no partial report is visible as complete; reconcile orphan files and state on restart.
7. **Restart/resume:** Restart host with queued, running, cancel-requested, publishing, and checkpointed tasks. Verify default running state becomes interrupted; only declared idempotent tasks with matching input/version/checkpoint may resume; stale generations cannot publish; duplicate retries are safe.
8. **Load and UX:** Run short and long mixed workloads on low/high-memory Windows/Linux systems; record host responsiveness, peak memory, throughput, p50/p95 wait, oldest-task age, failure/cancel rates, worker overhead, disk growth, and recovery time. Compare the reserved-slot and work-conserving policies.
9. **Manual override:** Verify one-time order/soft-gate bypass disclosure, affected queue display, non-bypassable host reserve/hard cap, and clear failure/pressure consequences.

All items above are future validation proposals. No test was executed, and no acceptance threshold can be responsibly set before a product owner selects the latency/fairness objective and representative machine range.

## Source notes and applicability

- [S01](sources/index.md#s01) supports the DRR analogy only; the workload differs from packet flows.
- [S02](sources/index.md#s02) documents cgroup v2 limit/delegation behavior and conditions.
- [S03](sources/index.md#s03), [S04](sources/index.md#s04), [S05](sources/index.md#s05) document Windows job memory semantics, assignment compatibility, and cleanup.
- [S06](sources/index.md#s06)–[S10](sources/index.md#s10) are VS Code reference docs/code/test-plan evidence, not target-app behavior or executed tests.
- [S11](sources/index.md#s11)–[S13](sources/index.md#s13) support a local transactional journal option. If WAL is chosen, SQLite’s current documentation reports a rare WAL-reset corruption bug through version 3.51.2, fixed in 3.51.3+ and backported to 3.44.6/3.50.7 for a concurrent multi-connection write/checkpoint condition; the release page lists 3.54.0 dated 2026-10-09. The target’s bundled SQLite version/configuration is unknown, and no SQLite dependency is required by this proposal. [S11][S12][S13]
