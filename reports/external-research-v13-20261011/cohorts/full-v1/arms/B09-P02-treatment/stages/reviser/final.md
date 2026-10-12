# Final proposal — Background extension task admission and fairness

**Status:** Research-backed proposal for the unnamed desktop host. It is not product canon, an approved implementation, a deployment request, or a claim that target behavior was tested. The brief supplies no host repository, runtime, OS minimum, extension trust policy, document-access contract, or persistence choice. Those remain owner inputs.

## Recommendation

Build a small host-owned task manager that owns queue state, admission decisions, cancellation state, recovery, and the only path that makes a report visible. Use fair dispatch by extension, explicit queue and memory reasons, and separate limits for worker count and memory. Keep numeric limits open until representative measurements exist.

For substantial extension-authored or high-memory work, use a task worker with a narrow IPC contract and a task-owned operating-system boundary where the host can establish one. Keep short, bounded, trusted host-owned operations in process only when their work and memory are controlled. On Windows, a configured Job Object can account for and constrain a worker tree's committed memory, but it is not a physical-RAM/RSS cap. On Linux, cgroup v2 memory controls are available only when the memory controller is enabled and the host already has a writable delegated cgroup. If the required boundary cannot be established, either refuse tasks whose contract requires it or run only tasks explicitly allowed to use a clearly labeled best-effort mode. Do not ask for administrator elevation to make the design work.

Use a work-conserving pool as the initial candidate: round-robin dispatch opportunities among extensions, per-extension active and queued caps, bounded preference for short interactive work, and aging for batch/report tasks. Compare a dedicated interactive slot during measurement; it may protect latency but can sit idle, and a long non-preemptive task can still block any shared slot it has borrowed. Fairness means bounded dispatch opportunities, not equal CPU time, memory, or wall-clock completion time.

Keep result publication host-owned and fenced against cancellation and stale workers. Stage outputs privately, validate a complete manifest, then make a committed manifest/catalog entry visible at one serialized state transition. A partial artifact is never listed as a completed report. A cancel accepted before the publication transition prevents publication; after publication begins, show a short “finishing report” state and disable cancellation until that commit ends.

The one-time **Run this task next** action is capability-specific. With a verified worker memory boundary, it may bypass fair queue order and the soft task reservation, while preserving the host/UI floor and the enforced worker cap. Without an enforced worker cap, it is order-only and must still satisfy the soft memory admission check. Show affected queued work, uncertainty, active capability, and the likely consequence. A broader soft-memory bypass without a hard worker boundary remains disabled until an owner explicitly accepts that risk.

## Scope and evidence boundary

The brief describes an existing desktop analysis application but does not name it or provide its repository. No target callers, tests, issue-to-fix history, or release history could therefore be examined without guessing. VS Code API documentation, source, and an issue are used only as bounded extension-host/progress examples; none is evidence about the target. Platform and storage documentation supplies conditional operating-system facts, not application facts.

No implementation, target-app check, experiment, load test, or validation item in this proposal was run. The phased integration and validation sections are future proposals. The exact source identity records and bounded navigation notes are in [sources/index.md](sources/index.md) and [source-map.json](source-map.json); source IDs S01–S13 retain their predecessor identities.

## Task contract and ownership

The host should accept a task record with at least:

- Stable task ID, extension identity and version, task family/class, enqueue time, and attempt/run generation.
- An idempotency key where a task can be safely retried.
- An input snapshot or capability handle plus an input hash/version. Whether extensions need a copied snapshot, a read-only file capability, or live document access is an owner decision; do not let an isolated worker borrow mutable UI objects by assumption.
- Declared memory and duration estimates, preserved as declarations with their source and timestamp. Treat them as advisory features for classification, not as a reservation or safety boundary.
- Progress contract and cancellation token/IPC channel.
- Optional checkpoint/resume contract, checkpoint reference, and completed-artifact manifest.
- Host-owned lifecycle state and a fencing generation that changes on every retry/restart.

The host owns durable transitions and report publication. Extension code can request work and report progress, but cannot set a job to succeeded, make a report visible, or publish using an old generation. Define an output broker or equivalent host-owned capability as the only path into the visible report catalog. Whether that can be enforced depends on the eventual extension trust model and host architecture; it is not established by the brief.

## Fair queueing and user-visible waiting

Maintain a ready FIFO per extension and rotate across non-empty extension queues, granting one dispatch opportunity per extension turn. Add a measured active-job cap and queued-backlog cap per extension. Reaching the backlog cap returns explicit backpressure with a reason and retry guidance; it must not silently drop or reorder work. Equal dispatch turns prevent a single extension burst from consuming all starts, but do not equalize memory or service time.

Separate short interactive inspection from long report/batch work with a bounded interactive preference and age-based batch promotion. Bound how many later interactive starts can pass a waiting batch job, or use an equivalent measured skip/age rule; do not let continuous interactive arrivals erase batch eligibility. Keep FIFO within a lane unless measurement supports another policy. A long task that does not yield still occupies its worker until it completes or is safely stopped, so no scheduler can promise a short wall-clock wait without reserving capacity or requiring cooperative checkpoints.

A dedicated interactive slot is a viable alternative if measured latency targets justify holding capacity idle. A work-conserving shared pool uses idle capacity better but cannot preempt a long job that borrowed a slot. Decide only after measuring the short-task latency benefit and idle-capacity cost.

The waiting view should show task age, extension, lane, and one actionable reason, such as:

- All worker slots are occupied.
- This extension has reached its active-task cap.
- The task's measured reservation does not fit current headroom.
- Host pressure is above the stop threshold.
- The user paused dispatch.
- Older work is ahead in the fair queue.

Offer queued cancellation immediately. Do not display an ETA unless a measured duration distribution supports it; progress stays indeterminate until the task reports meaningful stages.

### Fairness alternatives

| Approach | Benefit | Cost or limitation | Proposal |
|---|---|---|---|
| Global FIFO | Simple arrival order | One extension burst causes head-of-line delay for other extensions | Keep FIFO only within an extension queue |
| Global priority queue | Can serve interactive work promptly | Sustained high-priority work can starve reports; labels can be abused | Do not use as the sole scheduler |
| Extension-keyed round robin | Simple bounded dispatch turns across extensions | Equal starts are not equal CPU, memory, or completion time; non-preemptive work blocks | Baseline candidate |
| Deficit round robin using declared cost | Could account for variable service if cost is predicted well | Declared costs are untrusted; memory and duration differ; opaque jobs cannot be preempted | Research option after measured costs exist; S01 is a packet-flow analogy only |
| Bounded interactive preference plus aging | Responsive short work while preserving a path for batch work | Bound and age threshold need measurement; a running long job still blocks | Baseline candidate |
| Permanently reserved interactive slot | Protects some latency when the slot is available | Can sit idle and does not solve memory admission | Compare if UX measurements show a hard latency need |

The DRR paper describes fair queuing for variable-length packet flows. Its complexity/fairness result does not transfer into a guarantee for task duration, memory, or non-preemptive desktop jobs.

## Execution boundary alternatives and launch rule

| Boundary | Benefit | Limitation | Suitable use |
|---|---|---|---|
| Shared thread or in-process task | Lowest startup and copying cost; direct access to live host objects | No safe general forced cancellation; one task's memory is not isolated | Only short, trusted, bounded host-owned work |
| Shared extension-host process | Separates extension execution from the UI process and amortizes worker startup | One runaway task can affect other work in the shared host; no per-task memory boundary | Compatibility mode, not the high-memory guarantee |
| Per-task worker with a task-owned Job Object or delegated cgroup | Better task-scoped cancellation, crash isolation, descendant accounting, and per-task observations | Startup, IPC, snapshot costs; capability and OS-version constraints; not automatically a security sandbox | Candidate for substantial extension-authored work |

For a hard boundary promise, establish and verify the boundary before extension-controlled code can run or create descendants:

- **Windows:** create and configure the per-task Job Object and its limits/kill-on-close behavior first; create the worker suspended or behind an inert bootstrap; assign it, verify successful assignment and membership, and only then resume/release extension code. AssignProcessToJobObject can fail because of access rights, pre-existing jobs/nesting, session constraints, or older Windows behavior; memory operations before assignment are not examined by assignment. Default CreateProcess children inherit job membership, but breakaway flags and job settings can change that; other process creation paths may not inherit it. For a hard task-tree guarantee, disallow breakaway in the task job, verify the effective boundary, and constrain or account for child-launch paths. If the host cannot establish this, do not call the task hard-limited. [S03][S04][S05]
- **Linux:** require a writable pre-delegated cgroup v2 subtree with the memory controller available and enabled. Launch the worker into its task cgroup before releasing extension code, then verify membership. A child is created in its parent's current cgroup, but moving a worker afterward does not move descendants already created; cgroup v2 also recommends assigning workloads once at startup. Delegation depends on permissions granted by a parent or a configured namespace boundary. If the cgroup is unavailable, a process group is only a weaker cleanup aid and is not a containment guarantee against task code that can detach. Do not present it as a security sandbox. [S02]
- In either OS, a failed assignment or verification either refuses a task whose contract requires that boundary or reports an explicitly weaker mode for tasks whose owner-approved contract permits best-effort operation. Never enumerate or terminate unrelated user processes.

These launch requirements refine the proposal after MI-2. They are preconditions for the intended cancellation and descendant-accounting behavior, not claims that a particular OS setup or target runtime has been implemented.

## Resource admission and measured estimates

Do not use a worker count as a memory bound. Keep two separate controls:

1. A worker-count ceiling, tuned from launch overhead, serialization/copy cost, UI responsiveness, and observed process-management costs.
2. A memory admission ledger, tuned from host headroom and observed task use, with a protected host/UI floor.

For a new task, derive an initial reservation from measured task family, input-size band, extension/runtime version, and OS observations, plus a conservative uncertainty margin. Preserve the extension's declared estimate, but compare it with measured outcomes and never use the declaration as the only guard. Include current host pressure, running workers' observed memory, and a hysteresis threshold: stop dispatching when pressure crosses the high threshold and restart only after pressure falls below a lower threshold. A reservation remains a scheduling estimate; a task can exceed it after start. Enforced worker limits, where available, are a separate boundary.

Platform limits must be named accurately:

- Linux cgroup v2 memory.high throttles and drives reclaim pressure; going over it does not invoke the OOM killer and the threshold can be breached. memory.max is the hard cgroup limit, may be exceeded temporarily, and can invoke the OOM killer within that cgroup if reclaim cannot meet the limit. The memory controller tracks major uses “to a reasonable extent,” not completely watertight accounting. A writable delegation and enabled controller are environmental prerequisites. [S02]
- Windows Job Object process/job memory limits constrain virtual memory that can be committed, and per-process and job-wide limits are independent. Do not label that an RSS or physical-RAM cap. Job assignment and tree membership must be verified before extension code runs. [S03][S04]

If Linux delegation or Windows assignment is unavailable, conservative host-level reservations and pressure pauses remain useful, but they are best-effort admission rather than a hard per-task memory limit.

### Measurements required before selecting numbers

Measure these on representative low- and high-memory Windows and Linux machines and across the relevant task families:

- Host/UI baseline memory and the useful available-memory or pressure signal.
- Peak task and worker-tree memory by OS, task class, input-size band, extension/runtime version; Windows job commit charge alongside process working set; Linux cgroup current/peak and memory events.
- Declared-versus-observed error distributions, including missing, stale, zero, understated, and overstated declarations.
- Worker launch time, IPC overhead, document snapshot/capability cost, and output write size/time.
- Queue waits by lane and extension, dispatch-turn skew, oldest-task age, short-task latency, long-task blocking time, and batch aging under continuous interactive arrivals.
- Cancellation request-to-ack time, forced-stop rate/latency, worker-tree cleanup success, stale worker count, and behavior when an OS boundary cannot be established.
- Restart recovery duration; checkpoint reuse and retry rate; orphan staging cleanup; journal size and durability behavior.
- Host/UI responsiveness, task failure, and report completion under memory pressure.

These observations determine worker ceilings, active and backlog caps, reservation margins, hysteresis thresholds, interactive preference or slot choice, aging, cancellation grace, progress cadence, and retention. The brief supplies no defensible numeric values.

## Cancellation, progress, restart, and publication

Persist a versioned task journal or equivalent durable state before acknowledging queue-changing operations. A local transactional database is one option only if the target already supports it; it is not a dependency requirement. If SQLite WAL is selected, verify the library actually shipped with the host. The SQLite documentation records a rare WAL-reset corruption issue affecting 3.7.0 through 3.51.2 under concurrent write/checkpoint conditions, fixed in 3.51.3 and backported to 3.44.6 and 3.50.7; its current release page at this review lists 3.54.0 dated 2026-10-09. SQLite's transaction guarantee covers a database transaction, not separate report files. [S11][S12][S13]

A useful lifecycle is:

- queued → starting → running
- queued → canceled immediately on accepted queued cancellation
- starting/running → cancel-requested → canceled after acknowledgment or safe task-owned termination
- running → publishing → succeeded
- Any applicable nonterminal state → failed or interrupted with a reason

Record task identity, extension/runtime version, input snapshot/hash, attempt, generation, checkpoint reference, state, and completed-artifact manifest. State changes must be idempotent for a task ID and generation. A formerly running task found after host failure is interrupted, never silently succeeded. Keep queued tasks queued. Automatically resume only when the task declared idempotent checkpoint semantics and input hash, extension/runtime version, and checkpoint all match; otherwise offer an explicit retry. A changed generation fences any stale worker from progress updates and publication.

Cancellation is a request first, not a kill primitive:

- Queued work can be canceled immediately.
- Running work durably enters cancel-requested; the host sends a cooperative token or IPC request and keeps that status visible until acknowledgment or termination.
- After a measured grace interval, the host may terminate only a verified task-owned job/cgroup/process group. In-process work has no safe general force-cancel guarantee.
- Cancellation and publication serialize at one durable gate. If cancellation wins before publishing, fence that run and reject its output. If publishing wins, show “finishing report” and disable cancellation for that short commit operation.
- On shutdown, stop new dispatch, request cancellation, wait a measured interval, and clean up only task-owned workers. On restart reconcile state and files before offering retry or resume.

Progress events carry task ID, monotonically increasing sequence, stage, optional fraction, message, and UTC update time. Show indeterminate progress until a task reports useful stages. A cancellation token or a progress UI is only a signal surface: VS Code's reference API/source bridges a cancellation button to a cooperative token and lets the callback promise control completion; it does not itself promise force termination or durable task state. [S07][S08][S09]

For reports, write to a private task/run staging directory. The worker cannot write into the visible catalog. The host validates a complete output manifest, durably records the publication transition, then exposes a single catalog/manifest pointer only after all required files are present. Consumers list only committed manifests. Partial data remains explicitly incomplete and is never mistaken for a report; canceled outputs are removed or retained only as labeled diagnostics. Reconcile staging, journal entries, and orphan artifacts at startup. A database transaction and a filesystem update are separate resources: validate flush, recovery, and crash windows rather than assuming one rename plus one database write is atomic. If the target lets extension code bypass the broker and write directly to the public report store, the brief supplies no trust or sandbox contract that would prevent that; report visibility therefore depends on an owner-approved broker boundary.

## Manual override: capability matrix

The action is a one-time **Run this task next** choice for an authorized user. The brief does not define a staff role, so no staff-only workflow is assumed. The host floor is never bypassed.

| Runtime capability at the time of the action | What the action may bypass | What remains enforced | What the user sees |
|---|---|---|---|
| Verified task worker has an enforced OS boundary: configured Windows Job Object memory limit or Linux delegated cgroup memory limit | Fair queue order and the ordinary soft task reservation only if current pressure is below the stop threshold and an OS-specific measured capacity calculation shows that the configured worker cap leaves the host/UI floor. For Windows, keep a measured admission margin because the commit limit is not a physical-RAM cap; if no defensible mapping exists, the action is order-only. | Host/UI floor; actual configured OS worker limit; worker ownership and publication fence | Boundary type and measurement basis, declared/measured estimate and uncertainty, which queued tasks this task passes and may delay, and the possibility that the worker is throttled, rejected, or fails at its limit. Explain that Windows commit is not RSS/physical memory; Linux memory.max can cause cgroup-scoped OOM. |
| No enforced worker cap: Linux without writable delegation, Windows assignment failure, or a weaker process-group fallback | Queue order only | Soft reservation, host/UI floor, worker-count ceiling, and ordinary dispatch gates | Explicit “no enforced per-task memory cap” status; estimate uncertainty; named/count of delayed jobs; likely slow host or worker failure if the estimate is wrong. If the reservation does not fit, moving the job next does not start it. |
| The task contract requires a hard worker boundary, but launch probe fails | Nothing; refuse start | No weakening of the task contract | Explain which capability failed and let the owner/user retry later or choose a task explicitly defined for best-effort mode. |

A separate override that bypasses the soft memory reservation without an enforced worker cap remains an owner decision and is not enabled by this proposal. The override never bypasses host headroom, worker hard limits, extension active caps, or task ownership. Queue fairness consequences are shown before the action. No pay-based priority and no administrator elevation are introduced.

## Alternatives for admission

| Policy | Enforces | Weakness | Disposition |
|---|---|---|---|
| Sum declared estimates against one budget | A simple estimate gate | An inaccurate extension can oversubscribe it; ignores changing host pressure | Reject as the sole safety control |
| Dynamic host headroom plus observed task reservations | Adapts new starts to pressure and measured task classes | Still soft; observations lag and current host demand changes | Use for scheduling with margin and hysteresis |
| Per-task OS boundary | Worker-tree limit/accounting where capability exists | Windows commit is not physical RAM; Linux hard control requires delegated cgroup; not universal | Probe at launch and describe accurately |
| Combined measured reservation and OS boundary | Controls starts and constrains each worker where available | More measurement and platform-specific behavior; Linux/Windows fallbacks differ | Preferred research candidate, conditional on capability and owner decisions |

## Phased integration proposal

1. Decide task identity, document snapshot/capability, durable state format, and extension cancellation contract. For one task family, add queue visibility, truthful wait reasons, queued cancellation, progress, and committed-report distinction.
2. Add extension-keyed rotating dispatch, measured active/backlog caps, bounded interactive preference, batch aging, and fairness telemetry. Measure bursts before tuning.
3. Move one high-memory report task to a private worker. Probe Windows Job Object assignment and Linux cgroup delegation. Establish and verify the worker boundary before releasing extension code; report the fallback level or refuse tasks whose contract needs a hard limit.
4. Add durable cancel/publish fencing, host-only manifest publication, restart reconciliation, and opt-in idempotent checkpoint resume.
5. Validate across low/high-memory Windows and Linux configurations; then select numeric limits and decide whether to widen a feature rollout. No full scheduling platform, implementation, or deployment is proposed here.

## Validation plan — proposed, not run

1. **Burst fairness:** Submit a large burst from extension A and one task each from B and C. Verify bounded skipped dispatch turns, per-extension active caps, explicit backlog rejection, no silent drops, and batch aging under continuous interactive submissions. Measure non-preemptive blocking. Compare shared-pool and reserved-slot choices.
2. **Estimate/admission:** Test accurate, missing, zero, stale, understated, and overstated estimates while holding worker count constant. Change host available memory/pressure. Verify the host floor stops starts and hysteresis resumes only below its lower threshold. Confirm count and memory gates are separate.
3. **Windows startup/containment:** Verify the worker is suspended or otherwise inert until job assignment and limits succeed. Test assignment failure under an outer job, nested-job and supported older-Windows conditions, and insufficient rights. Spawn children after release; test breakaway flags allowed and denied, job membership, commit-limit behavior, kill-on-last-handle cleanup, and any child-creation path the host permits. Confirm no child runs outside a promised hard boundary and unrelated processes remain untouched.
4. **Linux startup/containment:** Verify the worker enters its task cgroup before extension code can fork. Test a misconfigured worker that forks before later migration and confirm the existing child does not join; treat that as a failure of the setup. Test child inheritance after correct placement, writable and unavailable delegation, controller availability, memory.high throttling, memory.max limit/OOM events, and cgroup cleanup. Confirm the fallback is labeled best-effort and not a sandbox.
5. **Boundary fallback:** Exercise Windows assignment failure and Linux without delegation. Verify hard-boundary-required tasks are refused and best-effort-compatible tasks are visibly weaker. Verify process-group cleanup targets task-owned work only; do not claim it contains arbitrary code that can detach.
6. **Cancellation/progress:** Cancel queued, starting, cooperative-running, non-cooperative-running, and publishing jobs. Inject races around durable state commits. Verify the UI never says canceled while a worker can publish; progress is indeterminate until meaningful events arrive.
7. **Publication integrity:** Crash before/after staging, manifest validation, publication transition, and catalog exposure. Verify partial output is never listed complete; canceled and stale-generation results stay invisible; restart reconciles orphan files and state.
8. **Restart/resume:** Restart with queued, running, cancel-requested, publishing, and checkpointed jobs. Verify a formerly running task becomes interrupted; only matching declared idempotent checkpoints resume; duplicate retries and stale workers cannot publish.
9. **Load/UX:** Mix short and long tasks on low/high-memory Windows/Linux machines. Record responsiveness, peak memory, throughput, p50/p95 wait, oldest-task age, per-extension dispatch skew, cancel/failure rate, worker and snapshot overhead, disk growth, and recovery time.
10. **Manual override:** Verify the capability matrix, affected queue display, order-only behavior without a worker cap, order plus soft-reservation bypass only with a verified cap, host-floor and worker-limit protection, and clear failure/pressure consequences.

Every item above is a future test proposal. No acceptance threshold, target-app test, source-code test, load experiment, or validation pass is claimed.

## Unresolved owner decisions and limits

- Which application/repository, runtime, OS minimums, and extension trust policy are in scope.
- Whether extensions receive immutable document snapshots, bounded file/capability handles, or another safe input contract.
- Whether tasks that cannot obtain a hard OS memory boundary may run in a disclosed best-effort mode, or must be refused.
- Whether a separate soft-memory override should ever be allowed without a hard worker cap. This proposal keeps it disabled.
- Whether a dedicated interactive slot is justified by measured latency and utilization.
- Which tasks are idempotent/checkpointable and what interrupted artifacts should be retained.
- Whether the host already has a suitable transactional journal/library and its actual shipped version.
- User authorization for the one-time override, desired fairness/latency objectives, representative machine range, and numeric safety targets.

No row should be filled with a guessed product fact. The proposed phases are intended to resolve these decisions with owner input and measurement.

## Critique disposition

The independent critique's two material-incomplete findings are accepted and resolved in this proposal:

- **MI-1 — capability-specific override:** Accepted. The matrix above defines order plus soft-reservation bypass only when a verified per-worker OS memory boundary is active; with no enforced cap, the action is order-only and still passes the soft memory gate. The host floor always remains. The wider no-cap override remains explicitly an owner decision. Linux delegation, memory.high/memory.max, and Windows committed-memory behavior were rechecked in primary documentation. [S02][S03][S04]
- **MI-2 — contain before extension code can spawn:** Accepted. The launch rule requires worker boundary assignment and verification before extension code runs. It distinguishes Linux cgroup inheritance from later migration, and Windows default child-job inheritance from breakaway and assignment conditions. If the boundary fails, refuse hard-boundary tasks or expose a weaker owner-approved mode. Validation now covers pre-assignment fork/spawn, post-assignment children, breakaway paths, and launch failure. [S02][S04][S05]

The critique found no material wrong consequential claim, and I found no primary-source contradiction in those checked claims. I retain the OS caveats rather than flatten them. No material unsupported finding was identified as a recommendation dependency. The DRR PDF's extraction limitation remains disclosed and its use is only an analogy. The VS Code extension-host page was unavailable in the predecessor's direct open, and the cited VS Code source URLs are moving main references without a pinned commit; they remain examples, not target evidence. The VS Code issue is a manual test-plan item, not a test pass. The target app, OS floor, trust model, input contract, persistence/version, role model, and numeric objectives remain honestly unresolved.

## Brief coverage

| Brief obligation | Proposal location |
|---|---|
| A burst from one extension must not make the application unusable or starve other work | Fair queueing, active/backlog caps, aging, bounded dispatch-turn guarantee, load validation |
| Short interactive work and long/high-memory work; estimates may be wrong | Lane alternatives, measurement-based reservations, worker boundary, separate count and memory controls |
| Queue ownership, resource limits, cancellation, progress, restart recovery | Task contract; resource admission; lifecycle sections |
| Show why a task waits and allow queued/running cancellation | Waiting reasons; cancellation model |
| Distinguish complete reports from partial output; canceled tasks cannot publish later | Host broker, private staging, manifest commit, generation/cancel fence |
| Windows/Linux, variable memory, no admin, no pay priority, no unrelated-process termination | Capability-specific OS behavior; non-admin delegation requirement; ownership rule; no-pay policy |
| Useful manual override and its consequences | Capability matrix and override validation |
| Compare fairness and execution boundaries; identify measurements | Alternatives tables and measurement list |
| Phase integration and failure/load validation, without a full platform or deployment | Five phases, ten proposed validation groups, proposal status |

## Exact released plan and clause-by-clause disposition

The complete released plan is reproduced here so the dispositions below remain checkable against its exact clauses:

> The draft creates host-owned queue entries with extension identity, task identifier, priority class, estimated memory and a cancellation token. Interactive tasks have a reserved slot, while report tasks share the remaining worker capacity. A per-extension cap prevents one submitter from occupying every slot. The waiting view exposes the limiting reason and allows cancellation or a temporary staff-selected priority increase.
>
> Admission adds declared memory estimates and compares the total with a configurable budget. The draft assumes extensions provide conservative estimates and has not selected an enforceable mechanism when actual usage exceeds them. Workers are separate processes, but operating-system restrictions and what can safely be terminated remain unresolved. Host shutdown records queued jobs and stops owned workers; running jobs are marked interrupted on restart rather than claimed complete.
>
> Report output is written to a task-specific temporary location, then published with a completion record. Cancellation sets the token and eventually terminates an unresponsive owned worker. The plan leaves the race between cancellation and publication unspecified, as well as fairness when continuous interactive work occupies its reserved capacity. No payment priority or administrator requirement is planned. Proposed validation includes estimate underreporting, burst submission, long-job starvation, cancel/publish races, host restart and low-memory behavior. No load experiment has run. The proposal should compare enforceable admission and fairness policies before choosing defaults.
>
> This is a provisional draft for review after the declared reveal, not an endorsed answer. Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources. No future product deployment is requested.

| Clause | Exact plan clause | Disposition and final proposal |
|---|---|---|
| P1 | “The draft creates host-owned queue entries with extension identity, task identifier, priority class, estimated memory and a cancellation token.” | **Accept and strengthen.** Add task family, extension/runtime version, idempotency key, input snapshot/hash, enqueue time, attempt/generation, checkpoint contract, and result manifest. Estimates are advisory; the host owns transitions and publication. Cancellation is a request, not a kill primitive. |
| P2 | “Interactive tasks have a reserved slot, while report tasks share the remaining worker capacity.” | **Amend; retain as a measured option.** Compare a permanently reserved slot with a work-conserving shared pool using bounded interactive preference and batch aging. A reserved slot can sit idle; a shared pool cannot preempt a long task. Select after latency/utilization measurements. |
| P3 | “A per-extension cap prevents one submitter from occupying every slot.” | **Accept, with measurement.** Use active-task and queued-backlog caps per extension, explicit backpressure, and no pay-based quota. A cap controls dispatch opportunities, not memory. |
| P4 | “The waiting view exposes the limiting reason and allows cancellation or a temporary staff-selected priority increase.” | **Amend.** Give the authorized user concrete wait reasons and queued cancellation. Because no staff role is defined, use a one-time user action. Apply the capability matrix: queue plus soft-reservation bypass only with a verified worker cap; order-only without one. Show consequences and delayed work. |
| P5 | “Admission adds declared memory estimates and compares the total with a configurable budget.” | **Amend.** Keep worker-count and memory admission separate. Use observed task-class reservations, current host pressure, a protected floor, uncertainty margin, and hysteresis; do not use a sum of declarations as the only gate. |
| P6 | “The draft assumes extensions provide conservative estimates and has not selected an enforceable mechanism when actual usage exceeds them.” | **Reject the assumption; resolve conditionally.** Treat declarations as advisory. Use a Windows Job Object commit limit or Linux delegated cgroup limit only when verified. Without capability, admission is best-effort; refuse hard-boundary tasks or run only an explicitly weaker task contract. |
| P7 | “Workers are separate processes, but operating-system restrictions and what can safely be terminated remain unresolved.” | **Amend and resolve as a launch precondition.** Establish and verify a task boundary before extension code can spawn descendants. Windows assignment/nesting and breakaway conditions and Linux inheritance/migration conditions are explicit. A process group is a weaker cleanup aid, not a security sandbox. Terminate only verified task-owned work. |
| P8 | “Host shutdown records queued jobs and stops owned workers; running jobs are marked interrupted on restart rather than claimed complete.” | **Accept and strengthen.** Persist transitions before acknowledgment; stop dispatch and request cancellation on shutdown; reconcile running work as interrupted. Resume only for declared idempotent checkpoints matching input, version, and checkpoint; use a generation fence against stale workers. |
| P9 | “Report output is written to a task-specific temporary location, then published with a completion record.” | **Accept and strengthen.** Use private per-run staging, complete manifest validation, a host-only catalog pointer, and restart reconciliation. Separate filesystem artifacts and journal durability; validate crash windows rather than assume cross-resource atomicity. |
| P10 | “Cancellation sets the token and eventually terminates an unresponsive owned worker.” | **Accept with explicit state.** Persist cancel-requested, signal cooperatively, wait a measured grace, then stop only the verified task boundary. Keep the status pending until acknowledgment or termination. In-process work has no general force-cancel guarantee. |
| P11 | “The plan leaves the race between cancellation and publication unspecified, as well as fairness when continuous interactive work occupies its reserved capacity.” | **Accept and resolve.** Serialize cancel and publish at the durable state gate. Cancellation before publishing fences the generation; once publishing wins, show “finishing report” and disable cancellation. Bound interactive passes and age batch tasks; retain reserved capacity as an alternative. No wall-clock guarantee is claimed behind non-preemptive work. |
| P12 | “No payment priority or administrator requirement is planned.” | **Accept.** No payment-based weighting and no elevation prompt. Linux hard memory enforcement is conditional on already-writable delegation; label the fallback accurately. |
| P13 | “Proposed validation includes estimate underreporting, burst submission, long-job starvation, cancel/publish races, host restart and low-memory behavior.” | **Accept and expand.** The ten proposed groups add startup containment, breakaway, OS capability failure, partial/orphan output, stale generations, cancellation acknowledgment, and manual override. |
| P14 | “No load experiment has run.” | **Accept and preserve.** No experiment, implementation, target test, or validation was run in this stage. |
| P15 | “The proposal should compare enforceable admission and fairness policies before choosing defaults.” | **Accept.** Compare global FIFO/priority, extension rotation, DRR analogy, bounded preference, and reserved capacity; compare declared-only, measured soft reservations, OS boundary, and combined admission. Select numeric defaults after evidence. |
| P16 | “This is a provisional draft for review after the declared reveal, not an endorsed answer.” | **Accept.** This is a research proposal, not approval or product canon. |
| P17 | “Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.” | **Accept.** Recheck consequential OS claims in primary docs. Keep target identity, OS floor, trust/input contract, persistence/version, roles, and numeric objectives open. |
| P18 | “No future product deployment is requested.” | **Accept.** No implementation, migration, deployment, or full scheduling platform is proposed. |

## Source notes

- [S01](sources/index.md#s01) supports only the qualified DRR packet-flow analogy.
- [S02](sources/index.md#s02) covers Linux cgroup v2 delegation, startup inheritance/migration, accounting, and memory controls.
- [S03](sources/index.md#s03), [S04](sources/index.md#s04), and [S05](sources/index.md#s05) cover Windows committed-memory semantics, assignment/nesting, child inheritance, breakaway, and cleanup.
- [S06](sources/index.md#s06)–[S10](sources/index.md#s10) are bounded VS Code product/API/source/issue examples only.
- [S11](sources/index.md#s11)–[S13](sources/index.md#s13) cover SQLite WAL and transaction behavior only if the target chooses SQLite.
- The reviser independently reopened the governing [Linux cgroup v2 documentation](https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html), [Microsoft AssignProcessToJobObject reference](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-assignprocesstojobobject), [Microsoft Job Objects documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), and [Windows job memory-limit structure](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information) for MI-1 and MI-2. See the source-map reviser checks for retrieval details and limitations.
