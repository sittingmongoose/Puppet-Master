# Investigator discovery — B09-P02-treatment

## Scope and evidence boundary

The brief names no existing host application, language, repository, minimum OS version, or extension execution contract. I therefore did not inspect a guessed local repository or claim app-specific callers/tests. This discovery uses the brief alone plus primary operating-system, scheduler, persistence, and extension-API references. The VS Code material is a reference implementation and API example, not the target product. No implementation, app test, load test, or downloaded code was run.

## Working proposal

Treat queue ownership, execution isolation, resource admission, and result publication as one host-owned service with a small task contract. A plugin submits a stable task ID, extension identity/version, input snapshot or snapshot hash, task class, a declared memory/duration estimate, progress callback, cancellation token, and optional checkpoint/resume contract. Estimates guide initial placement only. The host records observed peaks and durations by task class, input-size band, plugin/runtime version, and OS; it must not trust declared estimates or infer a hard memory bound from a worker count.

Use three execution boundaries as explicit alternatives:

| Boundary | Benefits | Limits / use |
|---|---|---|
| Shared thread or in-process task | Lowest startup and data-copy cost; can use live document objects | A blocked/non-cooperative task cannot be safely stopped; host can’t hard-bound one task’s memory. Suitable only for short, trusted, tightly controlled work. |
| Shared extension-host process | Keeps extension code out of UI process; can preserve extension APIs and amortize worker startup | A runaway task can still consume the shared extension host’s memory and interfere with that extension’s other work. A cancellation token is only a request. |
| One worker process per task, assigned to an OS job/cgroup where available | Per-task crash/cancel boundary; child processes can be accounted together; task-local files and memory observations | Startup, IPC, serialization, document access, and OS compatibility become real costs. Linux hard memory control is conditional on a writable pre-delegated cgroup; this is not a universal no-admin guarantee. |

A hybrid is a feasible first proposal: keep tiny host-owned operations in process; run substantial or extension-authored analysis/report work in a task worker with a narrow IPC contract and host-only publication. Send an immutable document snapshot or bounded file/capability handles; do not assume an isolated worker can safely borrow live host objects. This contract is an owner decision because the brief does not say how extensions inspect documents.

For fair starts, maintain a ready FIFO per extension and rotate across non-empty queues, issuing one dispatch opportunity per extension before its next turn. Limit each extension’s active jobs and queued backlog, and give the user an explicit reject/backpressure reason when the backlog cap is reached. Keep interactive inspection and long batch/report work in separate lanes with a bounded short-task preference and age-based promotion for waiting batch work. Do not let task labels or declared durations earn unlimited priority. Deficit round robin is a useful analogy for variable-sized service, but its paper addresses throughput fairness in packet flows; job duration and memory are not packets, declared estimates are unreliable, and dispatch fairness is not a memory guarantee. A long non-preemptive task can still occupy a slot. A reserved interactive slot improves latency but can sit idle; borrowing it improves utilization but cannot preempt its long task. Choose after measurement and make this tradeoff an owner decision.

Admission must distinguish count from resource budget. Set the worker-count ceiling from launch overhead and responsiveness measurements. Separately reserve measured host headroom: current available-memory/pressure signal, task-class reservation, running jobs’ observed usage, and a protected host/UI floor. Stop new starts with hysteresis when pressure is high and show whether the wait is due to the worker ceiling, the extension’s active cap, the memory reservation, a user pause, or older work. On Windows, a Job Object can aggregate a task’s descendants and impose a committed-memory limit, but that is commit charge, not a promise of an equal physical-RAM/RSS ceiling. On Linux, cgroup v2 memory.high throttles and reclaims but is not an OOM cap; memory.max is the hard cgroup limit and may trigger an OOM kill within that cgroup. The kernel docs say major usage is accounted “to a reasonable extent,” not perfectly. A user-writable delegation is needed; never silently require an administrator. Probe this capability. If unavailable, the worker boundary still improves cancellation/crash isolation, but use conservative admission and clearly label the memory guard best-effort. Do not claim equal hard limits on both platforms.

Expose durable states such as queued, starting, running, cancel-requested, publishing, succeeded, failed, canceled, and interrupted. A queued cancel is immediate. A running cancel first sends a cooperative token/IPC request; show “cancel requested” until acknowledgement. After a measured grace interval, terminate only the task-owned worker/job/cgroup if safe. Cancellation and publication need one serialized state transition: once the host moves a task to publishing, show that its result is being committed and disable cancellation; a cancellation accepted earlier must fence off publication. Every run gets a new generation/fencing token so stale workers cannot publish after restart.

Write report data to a task/run-specific staging directory. The worker cannot write into the visible report catalog. The host verifies the output manifest, marks publication in the durable journal, then exposes a single catalog/manifest pointer only after all required files are complete. The UI shows only committed manifests as reports. Partial output remains clearly marked incomplete and is never mistaken for a report; canceled work is removed or retained only as explicitly labeled diagnostics. On startup reconcile filesystem staging against journal state and remove or quarantine orphan output. Do not assume a multi-file rename and a database transaction are one atomic operation.

For restart safety, persist task identity, extension/version, input snapshot/hash, state, attempt, checkpoint reference, run-generation token, and completed artifact manifest. Keep queued work queued. Treat a task found running after a host crash as interrupted; automatically resume only where the task contract declares idempotent checkpoint semantics and the checkpoint/input/version match. Otherwise require an explicit user retry. A local transactional journal (SQLite is one option if already supported) can atomically record each state change; if WAL is selected, pin a maintained fixed release and include its crash-recovery/version constraints. Use platform-owned worker cleanup on Windows with Job Object kill-on-close; on Linux use a cgroup only when delegated, otherwise ensure the app reaps only its own recorded process group and stale workers remain unable to publish.

Show progress as indeterminate until a task reports meaningful stages; then display stage, optional monotonic fraction, message, and last-update time. “Waiting because the extension has reached its active-job cap” and “waiting for about 1.2 GiB of reserved headroom” are better than a bare spinner or an unjustified ETA. Offer a one-time “Run this task next” action that bypasses normal fair ordering and the soft estimate gate only while the non-bypassable host reserve and any worker hard limit remain intact. Show which queued work will wait and the measured/declared estimate plus uncertainty. If no hard OS cap is available, label the soft-guard override as capable of making the application slow or the worker fail from memory pressure; never let an override target unrelated processes or imply safety that the platform cannot provide.

## Alternatives and unresolved owner choices

1. **Execution boundary:** shared extension host versus separate per-task worker. Decide how document access and plugin compatibility cross IPC.
2. **Linux guarantee:** accept capability-gated cgroup-v2 hard limits with best-effort fallback, or change the no-administrator requirement. Do not describe the fallback as a hard cap.
3. **Fairness goal:** fair dispatch opportunities per extension versus fair measured service time; service-time fairness needs a useful measurement signal and still cannot preempt an opaque long task.
4. **Interactive reserve:** reserve a slot for quick work or allow long work to borrow all idle capacity and accept head-of-line blocking.
5. **Resume contract and storage:** which tasks are idempotent/checkpointable; whether a transactional local DB is already available; cleanup/retention for interrupted partial data.
6. **Manual override scope:** bypass only order and soft reservations, or allow a riskier explicit soft-limit override where no hard boundary exists. Keep host headroom protected either way.

## Measurement required before numeric limits

Measure baseline host/UI memory under representative low/high-memory machines; task peak memory and duration across input-size bands; Windows job commit charge vs working set; Linux cgroup current/peak and memory events; worker launch/IPC/snapshot costs; cancellation acknowledgement and forced-kill rates; host responsiveness under pressure; queue wait distributions and oldest-task age; per-extension fairness under a burst; storage growth and recovery time. Measure false/missing estimates and calibrate conservative reservations from observed distributions with explicit uncertainty. Numeric worker counts, caps, headroom, queue limits, progress cadence, grace intervals, and aging thresholds remain proposals until measured.

## Proposed phased integration (not executed)

1. Add a task contract and durable state journal; display queued/running/terminal states, reasons for waiting, queued cancellation, and progress for one representative task family.
2. Add extension-keyed rotating dispatch, per-extension backlog/active caps, a bounded interactive preference with aging, and telemetry for wait/fairness.
3. Introduce a task worker boundary for one high-memory report path; capability-probe Windows Job Objects and Linux cgroup delegation; expose best-effort status when a hard boundary is unavailable.
4. Add cancellation fencing, private staging, manifest-only publication, interrupted-task reconciliation, and opt-in idempotent checkpoint resume.
5. Tune defaults from low/high-memory Windows and Linux load observations; roll out behind a narrow feature flag. This brief requests a proposal, not deployment.

## Validation proposals (not run)

- Fairness: burst many tasks from one extension beside one task each from other extensions; verify bounded dispatch-opportunity skew, active caps, queue-full messaging, batch aging, interactive preference ceiling, and a long non-preemptive task’s measured blocking.
- Estimates/resource admission: missing, zero, stale, understated, and overstated estimates; low-memory host pressure; verify worker count alone never passes admission and host reserve hysteresis stops starts.
- Boundary/cancellation: nested/child process accounting; worker crash; cooperative and non-cooperative cancellation; termination after grace; Windows Job Object assignment failure inside an outer job; Linux without delegated controller. Verify only task-owned processes stop.
- Publication races: cancel before start, mid-run, during staging, at publish boundary, and after success; assert no canceled/partial result becomes visible and success always has a complete manifest.
- Restart/fault injection: terminate host before/after every journal transition, checkpoint write, artifact flush, manifest update, and publication; test stale generation workers and duplicate retries. Keep incomplete artifacts visibly incomplete.
- Load: representative short+long mixes, one extension burst, extreme declared-vs-measured memory, low and high memory systems on Windows and Linux; report responsiveness, peak memory, wait percentiles, oldest-task age, cancellation latency, failures, and storage.
- These are test proposals. No tests or target application checks were executed during discovery.

## Source navigation

See [sources/index.md](sources/index.md) for stable source IDs, exact URLs, versions/commits, locators, access interval, observed operations, conditions, and applicability. Source IDs are fixed to the records in [source-map.json](source-map.json); do not silently rebind them.
