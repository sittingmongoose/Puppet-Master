# Final proposal — Background extension task admission and fairness

**Stage:** B09-P02-control reviser. **Status:** research-backed proposal for comparison and owner review; no implementation, full scheduler platform, or deployment is authorized. This document answers the admitted brief and every sentence of the exact released plan. Sources and independent critic dispositions are indexed in [sources/index.md](sources/index.md) and recorded with full provenance in [source-map.json](source-map.json).

## 1. Scope, recommendation, and evidence status

The brief describes an unnamed Windows and Linux desktop analysis host whose extensions submit document-inspection and report-generation jobs. The design must handle bursts, short interactive and multi-minute memory-heavy work, estimates that may be inaccurate, queue ownership, resource limits, cancellation, progress, restart recovery, visible wait reasons, partial-versus-complete reports, and useful overrides. It must not require administrator rights, use payment for priority, confuse worker count with a memory bound, or terminate unrelated processes. The requested result is a research-backed proposal with alternatives, measurements, phased integration, and proposed failure/load checks.

**Recommended direction to prototype:** a host-owned durable queue and single scheduling authority; bounded global and per-extension queues; independent global worker, per-extension worker, class, and memory admission gates; per-extension FIFO queues served in round-robin turns as a transparent starting point; one isolated worker process per job; Windows Job Object or Linux cgroup v2 boundaries when capability detection confirms they are usable; attempt-scoped output staging and generation-fenced publication; explicit cancel, recovery, progress, and wait states. This is a candidate, not a selected product policy. Compare it with the alternatives below before setting defaults.

The brief identifies no host repository, runtime, extension contracts, caller code, tests, bundled database, supported OS versions, or workload. I could not inspect app-specific callers/tests, bundled SQLite, or actual machine capabilities. Upstream APIs are precedents and boundary documentation, not evidence about the unnamed product. The original investigator/critic research and my focused primary-source recheck are summarized in [the source index](sources/index.md). Direct checks actually performed here were reading the mapped materials and opening the cited official source pages; no downloaded code was executed. No code, product test, workload, crash, performance, or platform-capability experiment was run. All validations below are proposals, not completed checks.

## 2. Complete design proposal

### 2.1 Queue ownership and job record

The host owns admission, lifecycle, cancellation, scheduling, recovery, and report publication. An extension submits a declarative request; it does not choose a host priority or publish a completed report directly into a shared results directory.

Persist at least: host-verified extension identity; host job ID and extension task ID; input/document snapshot identity; task class; enqueue time; the extension-declared estimate; host estimate, confidence, and estimate-model version; observed resource use by attempt; queue and active counts; wait reason; attempt number; progress and last-update time; lifecycle timestamps; cancellation/recovery state; worker boundary identity; artifact manifest/pointer; and an opaque generation/fencing token. Treat duplicate-submission handling and ID format as owner decisions. Never derive scheduling priority from revenue or payment.

Bound both queued and active work globally and per extension. Reject a full queue with a clear reason and retry guidance instead of allowing one extension to accumulate unbounded state. A per-extension active cap limits the count of that extension’s running workers only; it does not guarantee equal CPU, memory, service time, or completion latency. The independent memory gate remains necessary.

A useful durable state model is QUEUED → STARTING → RUNNING → CANCEL_REQUESTED → CANCELED, with SUCCEEDED, FAILED, INTERRUPTED, and NEEDS_REVIEW/RECOVERY_REQUIRED as distinct terminal or recovery states. Persist each transition and attempt. Do not represent a requested cancellation as completed cancellation until the worker is confirmed stopped.

### 2.2 Fairness and the unresolved interactive/report split

Compare four policies before choosing one:

- **One global FIFO:** simple and explainable, but an extension burst delays every other submitter and an ineligible head can leave otherwise usable capacity idle.
- **Strict priority with a reserved interactive slot:** protects interactive starts while capacity exists, but can starve report work; an exclusive slot can sit idle. Lending it to a multi-minute non-preemptible report means the next interactive task may still wait for that report to finish.
- **Per-extension round robin:** gives each ready extension a next-start turn, subject to active and resource caps. Equal turns are not equal CPU, memory, occupancy, or completion time. Several-minute non-preemptible tasks still occupy workers.
- **Weighted deficit round robin (DRR):** can represent deliberate weighted turns based on an estimated service cost. Its packet-flow foundation is an analogy for task jobs; inaccurate cost estimates and non-preemptible work need product experiments before relying on it [S10].

A semaphore can implement a slot gate inside the host scheduler, but it is not the persistent multi-tenant scheduler. Tokio’s documented FIFO permit rule can head-block smaller requests behind a large acquire-many waiter; it does not give the host job identity, durable wait reason, memory-byte limit, cancellation publication fence, or extension-level fairness [R08].

**Concrete fairness candidate for a test, not an owner decision:** keep FIFO order within each extension and maintain a stable round-robin cursor across extensions. Use a bounded lookahead of at most owner-set L candidate jobs to avoid idling capacity behind a temporarily blocked head; record the blocker for each skipped job. Count a bypass only when the host admits a later job that consumes a slot or reservation the older job could use. Once a job has accumulated owner-set K such conflicting bypasses, give it a sticky barrier: reserve one worker slot and its configured memory reservation for that job, and do not start a later job that would consume those reserved resources. Jobs that fit in remaining unreserved capacity may still run. When running work releases the reserved capacity, schedule the barrier job before later conflicting jobs. If the request cannot fit the configured per-job cap or total memory budget, surface it as unable to run under the current policy and request an owner/user action; do not let it block all work forever. A host-pressure pause blocks all new starts and is reported separately.

This candidate makes bypass observable and testable, but gives **no wall-clock start or completion bound**: running work may be non-preemptible or stuck, pressure can persist, and estimates can be wrong. The guarantee under test is only that, after K conflicting later admissions, the scheduler stops admitting work that consumes the barrier’s reserved resources. K, L, class rotation/weights, barrier scope, and how reserved interactive capacity interacts with a barrier remain owner decisions. Compare the barrier against plain round robin, FIFO, strict priority, and weighted DRR on burst and skewed-cost workloads; measure throughput, queue stalls, per-extension starts, and tail wait. Do not claim “no starvation” until a defined metric and experiment support that claim.

The reserved interactive slot is a separate owner decision. Prototype exclusive, idle-only borrowable, and weighted/aged class turns. If borrowed, disclose that a running report is not reclaimed instantly unless its extension supports cooperative checkpoints or a runtime limit. Continuous strict-priority interactive arrivals can starve reports. A priority class must be host-defined and never payment-based.

### 2.3 Estimates, memory limits, and runtime boundaries

A declared memory estimate is an untrusted hint, not a safety guarantee. Keep it for diagnostics, but separately collect host-observed peak use and confidence by task type, input-size class, extension/version, and OS. For unknown or low-confidence tasks, use a conservative fallback and lower concurrency. A candidate reservation formula is the maximum of a measured class baseline and a confidence-adjusted estimate, plus a host-controlled reserve for available memory/pressure. This formula is an unmeasured heuristic; test underreported, missing, stale, and adversarial declarations before considering defaults. Record when actual use exceeds the reservation and recalibrate from measured p50/p95/p99 and outliers.

Admission needs independent gates for global worker slots, per-extension active slots, class policy, and reserved memory under a configurable host budget that also reacts to current available memory/pressure. A concurrency number is only a count of jobs. It is not a byte bound. Do not promise that estimate reservations cap actual aggregate memory.

Compare execution boundaries:

- **In-process async work:** lowest startup/IPC cost, but cancellation is cooperative and a memory-bound or non-cooperative extension shares the host’s crash and responsiveness domain. Keep only for work shown to be bounded and cooperative.
- **One child process per job without OS accounting:** separates crashes and is easier to stop than an in-process task, but descendants may escape and there is no hard memory cap. A same-user process is not a security sandbox.
- **Windows Job Object:** groups associated processes, can terminate members, and can impose a job-wide committed-memory limit [R01, R02]. A normal CreateProcess child inherits membership, but Win32_Process.Create and configured breakaway are exceptions. Create and assign the worker while suspended where supported, configure the job, verify membership, then allow task code to run. Fail closed on assignment errors. Test nested/host-job behavior and supported OS versions. KILL_ON_JOB_CLOSE only terminates members when the last job handle closes; closing the handle is not proof that every escaped or unassociated descendant was captured. Job committed memory is not a system-wide memory guarantee.
- **Linux cgroup v2:** memory.current and memory.peak account a cgroup and descendants; memory.high applies reclaim/throttling and can be exceeded, while memory.max is the hard control and may invoke the OOM killer within the cgroup [R03]. These controls are conditional on the memory controller and writable delegation. systemd documents exclusive cgroup ownership, delegated subtrees, and that Delegate makes requested controllers available but does not itself enable memory [R04]. Manage only a verified host-owned/delegated subtree; never modify systemd-owned cgroups or infer availability from “Linux.” Kernel and Windows memory metrics differ and must not be pooled as if identical.
- **External broker/service:** could add mature durable or distributed scheduling, but introduces installation, account/service, operational, and possibly administrative requirements outside this brief. Keep as a later option only if a real multi-process or multi-machine requirement appears.

Probe the OS boundary at runtime. If unavailable, say plainly that a hard per-worker memory limit is unavailable. Use conservative reservations, low or serialized concurrency, and pause new starts under host pressure only if the owner accepts the residual risk. Those measures are not a hard memory cap. Decide whether heavy jobs should wait for a supported boundary or may run under this disclosed fallback; do not silently claim enforcement.

Measurements required before default limits: per-attempt memory peak, estimate error, runtime, CPU, input/output bytes, startup/IPC cost, host memory and pressure, queue-to-start and interactive latency, worker force-stop time, progress volume, database/checkpoint cost, and recovery time. Separate by OS, job class, input size, extension/version, and boundary capability.

### 2.4 Cancellation, progress, reports, and safe publication

For queued cancellation, atomically make the job ineligible and record CANCELED. For a running job, first commit CANCEL_REQUESTED and invalidate its generation; then signal a cooperative cancellation token and display “cancel requested/stopping.” After an owner-set grace interval, force-stop only the verified job boundary. Mark CANCELED only once the owned worker is confirmed stopped. If it cannot be confirmed stopped, retain RECOVERY_REQUIRED and do not launch a duplicate automatically.

Write each attempt to a private staging directory keyed by job and generation. Validate its manifest and outputs. Readers discover completed reports only through the host’s committed SUCCEEDED record and artifact pointer; until then label output partial or keep it hidden. Publication uses a compare-and-set requiring the current generation, RUNNING state, and valid output. If cancellation commits first, the late worker cannot publish. If success commits first, a later cancel returns “already complete.” This is a single-winner publication design, not exactly-once execution or a claim that a database transaction atomically commits a filesystem write. A crash can leave an unreferenced attempt artifact; collect it only after a grace period and reference check. The host must mediate publication paths if it promises canceled output cannot appear elsewhere.

Progress is optional, structured, rate-limited, and monotonic where totals exist: phase/message, completed/total when meaningful, and last-update time. Show indeterminate progress when the extension cannot provide a meaningful total. Progress is not proof of checkpointability. Show the actual persisted wait blocker—worker slot, extension turn, memory reservation, host-pressure pause, class policy, manual pause—and scope any queue position. Avoid precise ETA claims without measured runtime distributions. VS Code’s progress/cancellation API is a UI precedent only, not a dependency [S16].

A one-job promotion can bypass normal fairness order; show which work it skips, record who/when/why, and expire it after one use and a short owner-set interval. A separate “run despite estimate/pressure gate” override is optional and should be one-use, audited, and offered only with an active OS per-worker hard cap. Explain that the job may fail at that cap and application responsiveness may fall. It must not raise/remove the hard cap, bypass process ownership, kill unrelated processes, or use payment. Which users/roles may override is an owner decision.

### 2.5 Persistence, shutdown, and restart recovery

A same-host embedded SQLite WAL ledger is one candidate for durable state. WAL supports overlapping readers and a writer, but only one writer at a time; it requires same-host access and is not supported on a network filesystem, and long readers can delay checkpoints [R05]. Keep transactions short, handle SQLITE_BUSY, and never hold a transaction while work runs. Pin and inspect the actual bundled SQLite build: the WAL-reset corruption bug is fixed in 3.51.3 and later, with documented backports. The official release history showed 3.54.0 dated 2026-10-09 at this recheck; this does not establish which version the unnamed host bundles [R07]. In WAL mode NORMAL, recent commits may roll back after power loss although database consistency and application-crash durability remain; FULL syncs the WAL at each commit for stronger power-loss durability with extra I/O [R06]. Choose mode from the required queue durability and measured cost. No DB transaction atomically commits arbitrary report files.

**Proposed host-shutdown sequence, added in response to F01:**

1. Stop accepting new jobs and stop dispatching new work. Persist the shutdown phase and keep queued rows QUEUED.
2. Persist a stop request and current generation for each active attempt. Signal cooperative cancellation/worker shutdown and expose the stopping state.
3. Wait only the owner-set grace interval. Then force-stop only a verified per-job process boundary: close/terminate the Windows Job Object with confirmed membership, or stop the Linux worker inside its host-owned delegated cgroup. Do not kill by name or stale PID.
4. Confirm the old worker tree is gone before treating the attempt as stopped. If liveness or membership is uncertain, persist INTERRUPTED/RECOVERY_REQUIRED with its identity and do not start a duplicate. Release/close boundary handles and remove only an empty cgroup owned by this host.
5. On next startup, retain queued rows; reconcile every STARTING/RUNNING/stop-requested attempt against the exact prior boundary; advance its fencing generation before any retry. Retry only when a versioned checkpoint or idempotency contract and input identity permit it. Otherwise show NEEDS_REVIEW and ask the user. Never infer success from shutdown or progress.

The shutdown grace, supported Windows versions, Linux manager/cgroup configurations, exact cleanup behavior, and retry contracts are owner/platform decisions. An in-process task without a verifiable stop boundary cannot be promised to stop on shutdown.

### 2.6 Phased integration and proposed validation

This is a phased plan, not a full scheduler platform:

1. Define the queue record/state/API and host-verified identity/input snapshot contract; bound queued records and make overflow actionable.
2. Build a deterministic, pure scheduling policy. Compare global FIFO, strict priority/reserved slot, per-extension round robin, the bounded-bypass barrier candidate, and weighted DRR. Test extension caps, classes, blocked jobs, aging/bypass accounting, and manual promotion.
3. Add one worker process per job and capability-detected Windows/Linux adapters. Test process assignment, descendants, breakaway, hard-limit behavior, delegated cgroup availability, and disclosed fallback on supported configurations.
4. Add cancel-generation fencing, attempt staging, manifest validation, single-winner publication, and orphan cleanup.
5. Add shutdown/restart reconciliation and only then task-specific idempotency/checkpoint contracts. Verify no unsafe replay.
6. Add wait explanations, structured progress, queued/running cancellation, partial-versus-complete report display, accessible controls, and manual override consequences.

**Proposed checks, none run in this stage:**

- Scheduler properties under one-extension bursts and mixed submitters: queue bounds, per-extension turns, global/per-extension caps, class policy, L-lookahead, K-bypass barrier, impossible-to-fit jobs, pressure pauses, and no payment input. Compare burst fairness, throughput, and p50/p95/p99 queue waits; separate admission turns from CPU, occupancy, and completion-time fairness.
- Estimate robustness with absent, low, high, stale, and adversarial declarations; compare measured per-class/input-size baselines and actual peaks on each OS. Verify that concurrency never substitutes for memory admission.
- Windows boundary behavior on supported versions: suspended start, assignment failure, host already in a job, nesting, grandchildren, Win32_Process.Create, breakaway, job committed-memory limit, KILL_ON_JOB_CLOSE, and exact process identity. Verify unrelated processes are never touched.
- Linux cgroup v2 capability matrix: absent v2, memory controller unavailable/disabled, no/available delegation, systemd ownership, descendants, memory.current/peak, memory.high pressure and memory.max/OOM behavior. Exercise only host-owned/delegated paths and verify fallback disclosure.
- Cancellation/publication races: cancel queued/running at every transition; race cancel against validated success commit; stage output before/after cancellation; confirm at most one visible terminal report and that stale generations cannot publish.
- Shutdown/restart/crash injection before and after state writes and worker launch; with old workers alive; after artifact staging; before/after publication commit; with missing boundary capability; and with full disk. Verify queued survival, stale-worker fencing, no unsafe duplicate side effects, recovery state, partial labels, orphan cleanup, and DB recovery.
- Load and UX on Windows/Linux with low, medium, and high available memory, short interactive tasks and multi-minute reports, extension bursts, leaks, pressure, queue saturation, slow cancellation, and stale progress. Measure peak memory/runtime and tail latency, interactive responsiveness, wait-reason accuracy, force-stop time, cancellation completion, DB/checkpoint/recovery, and user understanding of overrides.
- On the actual bundled SQLite build, verify the 3.51.3-or-fixed-backport floor, one-writer busy handling, checkpointing, selected synchronous mode, and crash/power-loss recovery.

## 3. Exact released-plan clause disposition

Every quoted sentence below is copied from the exact revealed plan. “Retain” preserves its supported direction; “amend” supplies missing contract; “owner decision” keeps product policy open.

### P1 — Queue record, class slots, extension cap, and waiting view

**P1.1 — “The draft creates host-owned queue entries with extension identity, task identifier, priority class, estimated memory and a cancellation token.” — Retain and amend.** Keep host-owned queue identity and a cancellation interface. Persist host-verified extension identity, input snapshot, attempt, state, both declared and host-measured estimate/confidence, wait reason, progress, timestamps, artifact pointer, and generation. A token alone does not persist cancellation or fence a stale worker. Classes are host-defined and cannot depend on payment. ID format and duplicate-submission policy remain owner decisions.

**P1.2 — “Interactive tasks have a reserved slot, while report tasks share the remaining worker capacity.” — Owner decision; prototype alternatives.** A reserved slot can help short interactive work but may idle if exclusive, delay interactive work if borrowed by a long report, or starve reports under strict priority. Compare exclusive, idle-only borrowable, and weighted/aged class turns. Specify how a borrowed slot is reclaimed. There is no hard latency guarantee without a runtime bound or cooperative checkpoint contract. The evidence does not choose the fairness trade-off.

**P1.3 — “A per-extension cap prevents one submitter from occupying every slot.” — Retain and narrow.** An active-per-extension cap bounds its worker count, not CPU, memory, service time, or queue growth. Pair it with bounded global/per-extension waiting queues, global active slots, and an independent memory-reservation gate. Limits require workload measurement and owner selection.

**P1.4 — “The waiting view exposes the limiting reason and allows cancellation or a temporary staff-selected priority increase.” — Retain and specify.** Persist/show the actual wait blocker and scope any position estimate. Permit queued cancellation and running cancel-request escalation. A one-job promotion should report which peer work it jumps, be one-use and expire, and be audited. The separate pressure override is optional and allowed only behind an OS hard worker cap, with visible consequences. Who may override remains an owner decision.

### P2 — Estimate budget, worker boundary, shutdown, and restart

**P2.1 — “Admission adds declared memory estimates and compares the total with a configurable budget.” — Amend.** Keep declarations as untrusted hints. Admission must independently check global slots, extension slots, class policy, and reserved memory using host-measured estimates/confidence plus current pressure/safety reserve. This remains a soft aggregate guard unless actual task boundaries are enforced.

**P2.2 — “The draft assumes extensions provide conservative estimates and has not selected an enforceable mechanism when actual usage exceeds them.” — Reject the conservative-estimate assumption; compare enforceable mechanisms.** The brief explicitly warns estimates may be inaccurate. Use host observations and conservative low-concurrency fallback for unknown tasks, but do not call it a hard cap. Compare Windows Job Objects and Linux cgroup v2, probe actual capabilities, and disclose when no per-job cap is available. Windows Job Object committed memory is job-wide but differs from Linux cgroup accounting [R02, R03]. Linux enforcement depends on controller/delegation state [R03, R04]. Product choices about supported OS versions, heavy-job fallback, and required hard caps remain open.

**P2.3 — “Workers are separate processes, but operating-system restrictions and what can safely be terminated remain unresolved.” — Retain process isolation and resolve as conditional adapters.** Compare a child process without accounting, a Windows Job Object, a Linux cgroup v2 boundary, and the future external broker option. A child process alone is not a hard cap or a complete descendant boundary. Use only verified job-owned process groups; fail closed when attachment/membership cannot be established. No administrator right, security-sandbox, or unrelated-process kill is implied.

**P2.4 — “Host shutdown records queued jobs and stops owned workers; running jobs are marked interrupted on restart rather than claimed complete.” — Retain the queued/interrupted distinction and add shutdown sequencing.** Stop admission/dispatch, persist state, signal active workers, wait the owner-set grace interval, terminate only a verified task boundary, and confirm the worker gone. If confirmation fails, retain RECOVERY_REQUIRED and suppress duplicate launch. On restart, reconcile the exact old boundary, advance generation, and retry only under explicit idempotency or versioned checkpoint contracts. Keep grace, supported cleanup capability, and retry categories open.

### P3 — Publication, cancellation, fairness, constraints, and validation

**P3.1 — “Report output is written to a task-specific temporary location, then published with a completion record.” — Retain and make it safe for readers.** Stage by job/attempt/generation; validate artifact and manifest; publish only by committing SUCCEEDED plus a pointer for the current RUNNING generation. Readers must use that committed pointer rather than scan output directories. Keep unreferenced artifacts partial/orphaned until safe cleanup. Do not claim DB and filesystem atomicity.

**P3.2 — “Cancellation sets the token and eventually terminates an unresponsive owned worker.” — Retain and order.** Commit CANCEL_REQUESTED and invalidate generation before signaling the token; wait a bounded owner-set grace period; force-stop only the verified owned boundary; mark CANCELED only once stopped. Keep “requested/stopping” distinct. Queued jobs can transition directly to CANCELED.

**P3.3 — “The plan leaves the race between cancellation and publication unspecified, as well as fairness when continuous interactive work occupies its reserved capacity.” — Resolve the race; retain fairness as an owner choice with testable candidate.** Serialize cancel and publication in the host state store with a compare-and-set on generation, RUNNING state, and validated artifact. Cancel-first blocks publication; success-first returns “already complete.” This gives one visible result, not exactly-once execution. Use the bounded-bypass rule in §2.2 as a candidate only; it limits conflicting admissions after K bypasses, not wall-clock waiting. Slot borrowing and class policy need owner choice and measurement.

**P3.4 — “No payment priority or administrator requirement is planned.” — Retain as hard constraints.** Payment never enters scheduling. OS boundaries must be capability-detected and must work without requiring administrator elevation in supported configurations; unsupported cases disclose fallback. Never terminate outside the exact job-owned boundary.

**P3.5 — “Proposed validation includes estimate underreporting, burst submission, long-job starvation, cancel/publish races, host restart and low-memory behavior. No load experiment has run.” — Retain and expand as proposed checks.** Add invalid/missing/stale estimates, queue saturation, class contention, barrier behavior, hard-limit crossing, process grandchildren/breakaway, every crash point around state and publication, stale workers, disk-full, UI responsiveness, stale progress, and wait-reason accuracy. Run cross-platform and measure tail distributions. None has been run in this research stage.

**P3.6 — “The proposal should compare enforceable admission and fairness policies before choosing defaults.” — Retain.** The comparison in §2 addresses estimates and resource gates, FIFO/priority/round robin/DRR, semaphore scope, and in-process/child/OS boundary/broker options. It does not nominate unmeasured default limits or claim a winner.

**P3.7 — “This is a provisional draft for review after the declared reveal, not an endorsed answer.” — Retain its non-endorsement.** This final is a research proposal for review. It neither authorizes a product decision nor requests deployment.

## 4. Original-brief coverage

| Brief obligation or constraint | Proposal coverage |
|---|---|
| One extension’s burst must not make the app unusable or starve other work | Bounded queues, per-extension active cap, per-extension turns, bounded lookahead and a testable barrier; no unsupported wall-clock guarantee. |
| Short interactive and multi-minute, memory-heavy work; estimates may be wrong | Class alternatives, declared values as hints, observed memory/runtime calibration, conservative unknown-task behavior, and separate hard boundaries. |
| Queue ownership, resource limits, cancellation, progress, restart | Host-owned durable state, independent gates, generation fencing, structured progress, stop/reconcile/retry lifecycle. |
| Explain why queued; cancel queued or running | Persisted blocker, queued direct cancel, running request/stop/escalation states. |
| Partial versus complete reports; canceled work cannot publish afterward | Attempt-scoped staging, validated manifest, fenced compare-and-set publication and partial/orphan labeling. |
| Windows/Linux desktop, variable memory, no admin requirement | Conditional Job Object/cgroup adapters, capability detection, disclosed fallback, no administrator assumption. |
| Concurrency count is not a memory bound | Worker slots and byte reservations are separate; per-task hard limit only where OS capability confirms it. |
| No payment-based priority; no unrelated-process termination | Kept as hard constraints across scheduler, overrides, and termination. |
| Useful manual override with consequences | One-use promotion and optional pressure override with peer skip, cap, audit, expiry, and visible consequences. |
| Compare fairness and execution boundaries; say what needs measurement | Alternatives and workload measures are explicit; DRR is analogy, not assumed winner. |
| Phased integration/failure-load validation; no full scheduling platform or deployment | Six limited phases and proposed checks; no implementation or deployment occurred. |

**Already covered by the released plan:** host-owned queue records, extension/task identity, class and estimate fields, interactive/report slot split, extension cap, wait reason, cancellation/promotion control, configurable budget, separate workers, interrupted state, task-specific temporary output, eventual stop of an unresponsive owned worker, no payment/admin requirement, and initial validation scenarios.

**Corrected or rejected assumptions:** estimates are not assumed conservative; worker count is not a memory bound; a cancellation token is not a durable publication fence; a temporary file and database row are not one atomic commit; unknown/non-idempotent work is not automatically replayed; a semaphore is not the multi-tenant host scheduler; cgroup availability is not assumed; strict interactive priority is not claimed to be fair; and a kill-by-name or stale-PID policy is excluded.

## 5. Independent critique dispositions

| Critic finding | Disposition | Evidence-based response |
|---|---|---|
| **F01 — Missing shutdown/reaping sequence** | **Accept.** | Added the sequence in §2.5: stop intake/dispatch, persist state, signal, wait owner-set grace, stop only a verified per-job boundary, confirm exit, and prevent duplicate replay when liveness is uncertain. Windows KILL_ON_JOB_CLOSE depends on the last handle and job membership; Linux cleanup is confined to an owned/delegated cgroup [R01–R04]. The grace period and supported cleanup behavior remain owner/platform choices. |
| **F02 — Aging/barrier language did not define a bound** | **Accept and amend.** | §2.2 replaces “aging prevents indefinite skipping” with a round-robin, bounded-lookahead, K-bypass sticky barrier prototype. The defined property is only a bound on later conflicting admissions after K bypasses, once the request can fit policy caps; it makes no finite wall-clock or completion promise. The thresholds and class/slot policy need experiments and owner choice. Tokio FIFO semaphore evidence does not settle extension fairness [R08]. |
| **F03 — SQLite top-release metadata was stale** | **Accept and correct in this stage’s new source record.** | The historical investigator S12 record remains intact and is not silently rebound. My separate R07 check of official history found 3.54.0 dated 2026-10-09; the release history and WAL page identify 3.51.3 as fixing the WAL-reset bug. The actual target bundle remains unknown [R05, R07]. |
| **F04 — Reservation formula is unmeasured** | **Amend; retain only as a candidate.** | The max(class baseline, confidence-adjusted estimate) reservation is explicitly labeled an unmeasured heuristic in §2.3, to be evaluated on each OS against actual peak use and bad declarations. It is not source-derived and is not a guarantee. |
| **F05 — Target app contracts/repository are not identified** | **Retain uncertainty.** | The brief names no host, repo, runtime, callers, tests, database build, supported OS set, or task contracts. No upstream project is substituted for it. These inputs must be resolved against the actual host and workload before choosing defaults. |

No criticism is rejected. Critic agreement is not treated as authority: the consequential Windows, Linux, SQLite, and semaphore conditions were independently checked against the mapped official documentation; the job-level fairness rule is a design proposal and not a source fact.

## 6. Owner decisions that evidence cannot settle

1. Is fairness measured by next-start opportunity, worker occupancy, CPU time, or completion latency? What wait metric counts as unacceptable starvation?
2. Is the interactive slot exclusive, idle-only borrowable, or part of a weighted/aged class rotation? Are report tasks preemptible/checkpointable, and what happens to a borrowed slot?
3. What values for global/per-extension active and queued caps, class weights, lookahead L, bypass threshold K, host safety reserve, per-task cap, pressure threshold, and cancellation grace fit observed users/workloads?
4. Which Windows versions, host-job configurations, Linux cgroup v2/systemd versions, and delegation/controller configurations are supported? Must heavy jobs wait for a hard boundary or may they use a clearly disclosed low-concurrency fallback?
5. Which job classes/extensions promise idempotency or versioned checkpoints? Which external effects can replay, and what automatic retry is safe?
6. Which SQLite version/backport is bundled? Must queue state survive power loss or only app/OS crashes? Is FULL WAL durability worth its sync cost?
7. Which user/staff roles may promote or override a soft estimate/pressure gate? What audit, expiry, and UI consequence copy are required?
8. Which limits and estimates should be defaults? Measure them on real Windows/Linux devices; source documents do not choose product-specific values.

## 7. Evidence and execution record

Primary-source identity, exact URL, release/version, locator, access time, observed operation, applicable conditions, and source limits are in [source-map.json](source-map.json). Stable S00–S16 investigator records and C01–C09 critic records are carried without ID rebinding; R01–R08 are this reviser’s separate rechecks. See the [navigable sources index](sources/index.md).

Proposed validation has been kept separate from checks actually run. This stage read the assigned brief, the frozen discovery/draft/source maps and reveal, the critic review/source map, and the mapped source indexes; it independently opened the relevant official pages listed in R01–R08. It did not inspect an unnamed host repository, execute downloaded code, run tests, measure a machine/workload, or validate target-app capabilities. The actual native Goal activation response and binding check were preserved in native-goal-active.json; native response provenance/freshness is UNKNOWN beyond the response and checker.
