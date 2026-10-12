# In-process batch converter queue proposal

**Scope.** This proposal covers the in-process job queue and worker lifecycle for a desktop batch document converter on **CPython 3.13.9**. It uses a bounded asyncio queue, four worker tasks, explicit per-job outcomes, graceful drain, and a force-stop report that distinguishes abandoned waiting work from active work that actually stopped. Conversion implementation and external child-process behavior remain separate layers.

## Recommendation

Use asyncio.Queue(maxsize=20) with four long-lived worker tasks, each processing at most one retrieved job at a time. Give every submission a stable job ID and keep a per-session job ledger owned by the component. The queue carries small job records (ID, input reference, destination, and options), not document contents. Keep input payloads and output paths under component ownership.

In CPython 3.13.9, Queue.shutdown() is available. A positive maxsize makes put() wait when the waiting queue is full; it does not cap the number of producer coroutines or payloads they already hold. With 20 queued items and four active workers, the component has at most **24 accepted, nonterminal jobs** in the queue-plus-worker system. This count assumes each worker owns at most one retrieved job. A blocked, not-yet-accepted put() is outside those 24; report it as a pending submission, or add a separate admission limit if memory for all submitters must also be bounded. The pinned [queue documentation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L26-L47) defines maxsize as queue capacity and says a full bounded queue blocks put(); it also states that asyncio queues are not thread-safe.

## Job states, acceptance, and progress

Use a ledger transition model such as:

SUBMITTING → QUEUED → RUNNING → SUCCEEDED | FAILED | CANCELLED

A force-stop adds QUEUED → ABANDONED; submission rejected before queue insertion ends as REJECTED, not accepted. A job becomes **accepted** only when its await queue.put(job) succeeds. Record that state and increment the session’s accepted total synchronously immediately after that await returns, before the submit coroutine yields again. If put() raises QueueShutDown, it was not accepted. This gives the user a stable receipt boundary and prevents a blocked submitter from being counted as accepted.

All submission and worker state transitions must run on the queue’s event-loop thread. Do not mutate the asyncio queue from a UI or worker thread; marshal requests to the owning loop. The 3.13.9 docs explicitly say asyncio.Queue is not thread-safe ([pinned docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L201-L216)).

Expose separate counts for:

- accepted total for this session;
- queued accepted jobs;
- running jobs;
- succeeded, failed, cancelled, and abandoned terminal jobs;
- submissions still waiting for acceptance or rejected.

For an internally consistent snapshot, accepted_total = queued + running + succeeded + failed + cancelled + abandoned after accounting for any terminal states the product adds. accepted_total is cumulative; queued + running is accepted work still unresolved. qsize() is a useful waiting-queue diagnostic, but it is not a progress total: it excludes running jobs and unaccepted producers. join() is likewise not a success counter. The queue’s own unfinished-task count is private implementation state and should not be used as the product ledger.

Show conversion success separately from resolution. A job is SUCCEEDED only after conversion returns successfully, output validation succeeds, and the component publishes the output under its destination policy. Ordinary conversion errors become FAILED; a worker cancellation that interrupts conversion becomes CANCELLED after cleanup; work removed before a worker starts becomes ABANDONED. Neither queue.task_done() nor an empty queue is a success result.

## Worker and output contract

Each worker follows this pattern:

1. Await queue.get(). If it raises QueueShutDown, exit. If cancellation occurs before a job is returned, there is no retrieved job to acknowledge.
2. Without another await between retrieval and the state update, move the job from QUEUED to RUNNING.
3. Convert to a unique temporary destination owned by the component. Validate the completed artifact before publication. Stage the visible temporary file in the destination directory. Use os.replace() only when the destination policy allows replacement: CPython documents that it may fail across filesystems and is atomic if successful (a POSIX requirement), and that it silently replaces an existing file destination, so enforce collision policy explicitly ([pinned os docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/os.rst#L2884-L2899)). Use a securely created named temporary file and explicit cleanup ([pinned tempfile docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/tempfile.rst#L257-L289)).
4. On success, publish and record SUCCEEDED in one event-loop turn with no intervening await. On an ordinary exception, record FAILED and the diagnostic. On CancelledError, record cancellation after cleanup, then propagate cancellation so the worker task is visibly cancelled. For any other BaseException, record a fatal/interrupted failure before re-raising it; do not let the finalizer acknowledge a job with no application outcome.
5. In a finally path reached only after a successful get(), call task_done() **exactly once**, after the application outcome and cleanup disposition have been recorded.

Use try/finally for cleanup, catch CancelledError separately from ordinary Exception, and do not turn a cancellation or a failed conversion into a success. The upstream API raises ValueError for too many task_done() calls ([implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L219-L237)). Upstream tests cover underflow, normal joins, graceful shutdown, immediate shutdown, and shutdown while a retrieved task remains unfinished ([tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L461-L501), [shutdown cases](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L536-L700)).

For a failure or cancellation before publication, remove the job’s temporary output and other component-owned partial artifacts. Record cleanup failures and their paths; do not hide them under a successful outcome. A force-stopped queued job has not started conversion and should have no job temp output. Keep successful outputs available after queue shutdown. This ledger is durable only for the running application session; it does not promise crash recovery or transactional consistency between an in-memory ledger and a filesystem rename.

## Stop lifecycle

Only one admission controller may submit jobs or change lifecycle state. It must close admission on the same event loop that owns the queue.

**Graceful stop**

1. At a single event-loop transition, change lifecycle state from ACCEPTING to DRAINING and call queue.shutdown(immediate=False).
2. New submissions and any producers blocked in put() receive QueueShutDown and are reported as rejected, not accepted. Items already inserted remain available to workers.
3. Workers continue until the queue is drained; get() then raises QueueShutDown.
4. Await queue.join() and all worker tasks. Return a final report with each accepted job’s actual outcome. “Graceful” means accepted work was allowed to reach a terminal outcome; it does not mean every conversion succeeded.

The 3.13.9 docs specify that graceful shutdown rejects future and blocked puts while permitting already queued work to be retrieved, and that join() unblocks when the remaining items each receive task_done() ([pinned docs, shutdown and task_done](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L103-L150)).

**Force stop**

1. At a single event-loop transition, change state to ABORTING and close admission.
2. Before yielding, use the application ledger to mark all still-QUEUED IDs ABANDONED; the queue API does not return IDs it removes.
3. Call queue.shutdown(immediate=True) to remove waiting items. Cancel active worker tasks so they can clean up and report their actual cancellation outcome. Do not call task_done() for a worker that never obtained an item.
4. Await worker termination and cleanup, then use queue.join() only as an accounting synchronization point. Return separate counts and IDs for abandoned, cancelled, failed, and successful jobs.

The ledger snapshot and queue shutdown must not be separated by an await. Workers must also update QUEUED → RUNNING without an intervening await after get(). This makes the queue contents and ledger classification agree at the stop boundary, given the single-loop ownership rule.

**Critical correction to the investigator draft:** queue.join() after immediate shutdown does **not** prove accepted conversions succeeded. In CPython 3.13.9, immediate shutdown drains waiting entries and subtracts them from the unfinished count; if that makes the count zero, join() can unblock without any work being performed on them. If a worker already retrieved a job, the drained waiting items are abandoned while the active job remains unfinished until the worker acknowledges it. Once the active cancelled/failed job is acknowledged, join() can return even though success count is zero. The docs explicitly warn that immediate shutdown can violate the usual join() invariant ([pinned docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L122-L134)); the implementation shows queue draining and count reduction ([pinned implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L250-L278)); upstream tests distinguish a waiting item from one already retrieved ([pinned tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L662-L700)). Therefore never label a force-stop “completed successfully” based on queue size or join().

Cancellation in asyncio is cooperative: CancelledError is raised at a cancellation opportunity, and the coroutine should clean up in finally and normally propagate cancellation. The pinned task documentation describes this behavior ([Task Cancellation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-task.rst#task-cancellation)). If conversion blocks the event-loop thread or suppresses cancellation, the stop request cannot guarantee prompt termination. Keep blocking conversion work off the event loop; CPython’s asyncio guidance explains that blocking CPU-bound code delays other tasks and recommends an executor where appropriate ([Running Blocking Code](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-dev.rst#running-blocking-code)). Cancellation or termination of an external child process is outside this queue component; its adapter must report whether the external operation actually stopped before this layer reports cleanup complete. If cancellation does not settle, report the job as cancellation-pending and the component as stopping, not stopped.

## Capacity and throughput estimate

The exact count bound is **20 waiting queue entries + at most 4 worker-owned retrieved jobs = 24 accepted nonterminal jobs**. This bound is for this queue-and-worker component, not arbitrary payloads retained by callers while their put() is blocked. The bounded-queue implementation increments unfinished work on successful insertion and blocks/rejects puts according to maxsize and shutdown state ([implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L130-L169), [get and queue-size implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L172-L217)).

For **12 jobs available at time zero**, **four workers**, and **exactly 2 seconds of independent service per job**, a discrete worker schedule assigns jobs in groups of four: the first four finish at 2 seconds, the next four at 4 seconds, and the last four at 6 seconds. The independently run witness assigns each job to the earliest-free worker and returns a 6-second makespan. Extending the same deterministic schedule to 120 jobs yields 60 seconds, or 2 jobs/second. These are model outputs under homogeneous service times, no overhead, no retries, no contention, and a continuously available queue. They are **not measured converter throughput**. Real latency and throughput depend on document mix, service-time distribution, CPU/I/O load, storage, validation, and output publication; measure those with representative files before tuning the worker count.

## Alternatives

- **Sentinels:** Retain as a portability option for Python versions before 3.13. Close admission first, let accepted work drain, and send one sentinel per worker in order. The caller must manage queue capacity, sentinel acknowledgments, and stop races. For the stated CPython 3.13.9 target, native shutdown() expresses graceful and immediate queue shutdown more directly.
- **Unbounded queue:** Simpler submission but no waiting-work backpressure. It does not meet the 20-waiting-job limit.
- **One worker:** Easier ordering and resource control, but no overlap. Consider it if the converter or destination imposes a single-job constraint.
- **More workers:** Can help independent I/O-bound jobs, but may raise memory, CPU, file-descriptor, or storage contention. Keep four until representative workload measurements justify changing it.
- **CPU-bound conversion:** Async worker tasks do not make synchronous Python CPU work parallel. Run blocking code outside the event-loop thread and select thread/process execution based on measured workload and converter constraints. That is a separate execution layer and needs its own cancellation and shutdown contract.

## Validation status and next checks

**Executed evidence:** witnesses/queue_and_capacity_witness.py ran with the installed **CPython 3.14.4**. It confirmed a full 20-entry waiting queue plus four retrieved jobs (24 accepted in the witness), showed a blocked 25th put rejected at graceful shutdown, and demonstrated both immediate-shutdown counterexamples: waiting work can be abandoned with join() returning and zero success; an active job can be cancelled, acknowledged with task_done(), and join() can return with zero success. It also produced the deterministic schedule above. Exact command, full stdout, stderr, runtime, and interpretation are saved under witnesses/. This execution is corroborating evidence on 3.14.4, **not** a run on the target 3.13.9 interpreter. The source and upstream tests inspected are pinned to CPython 3.13.9. No upstream test suite, converter pipeline, filesystem publication path, child-process adapter, GUI, or throughput benchmark was executed.

Before shipping, run the application tests on CPython 3.13.9 and each supported desktop OS for:

- empty, one-job, and full-queue graceful shutdown; new and already blocked producers during stop;
- exactly four active jobs plus 20 waiting, acceptance receipts, and pending producer memory policy;
- force-stop with waiting and in-flight jobs, with outcomes reconciled per ID and no success inferred from join();
- worker exception, cancellation before get(), cancellation during conversion, duplicate acknowledgment protection, and worker task failure;
- cancellation cleanup, partial temp files, destination collision/overwrite policy, validation failure, and output publication;
- progress counters versus qsize(), repeated/idempotent stop requests, and shutdown during submit/worker state transitions;
- representative conversion mixes and sustained load, measuring service-time and queue-wait distributions, completion throughput, memory, and output cleanup.

These tests validate the application state machine and actual workload. The upstream CPython tests establish queue API behavior; they do not establish converter success, the ledger invariant, filesystem safety, cancellation of a child process, or real throughput.

## History and scope limits

The input draft is preserved at inputs/B08-P01/draft.md; this proposal retains its correct bounded queue, four-worker, in-session outcome ledger, graceful-drain, temp-output, sentinel-alternative, and conditional throughput ideas. It corrects the immediate-shutdown success inference and makes acceptance, progress, abandonment, and cancellation cleanup explicit. “Durable-in-session” is treated as a session ledger, not crash-proof persistence. No deployment or discovery-effectiveness claim is made.
