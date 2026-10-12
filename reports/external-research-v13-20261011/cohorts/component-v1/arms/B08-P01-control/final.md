# B08-P01 control: in-process queue proposal

**Status:** complete proposal for review; no converter deployment is proposed.  
**Target:** CPython 3.13.9, asyncio, Queue(maxsize=20), four workers.  
**Requested route:** Luna Max Standard. T3 runtime metadata reports the Codex harness, gpt-6-luna, max reasoning. The native Goal receipt contains no provider or tier option fields, so the returned route/tier is unknown from that receipt.

## Recommendation

Use one FIFO asyncio queue with maxsize 20 and four long-lived worker tasks, all owned by the component and confined to its event-loop thread. Store small job descriptors (job ID plus component-owned input/output path references) in the queue. Maintain a durable-in-session per-job outcome and progress ledger in the component: accepted IDs and their states remain queryable until the converter session ends. This proposal does not claim restart or crash persistence.

A successful queue insertion is the acceptance point. A submission is accepted only after await queue.put(job) returns. A submission that receives QueueShutDown while waiting for capacity was not accepted. This application-defined boundary makes the accepted count stable and auditable.

Queue maxsize limits waiting jobs to 20. Up to four additional accepted jobs can be held by workers, so the maximum accepted, nonterminal workload is 24: 20 waiting plus four running. This bound assumes each worker holds at most one job. It excludes producer-side inputs that have not yet been accepted, any additional staging buffers, and completed outputs and history. Do not present it as a total-memory bound.

## State, progress, and acknowledgment

Track each accepted job by ID through queued, running, and exactly one terminal state:

- succeeded: conversion finished, output validation passed, and the component published the output at its owned destination;
- failed: conversion, validation, publication, or required cleanup failed;
- cancelled: an active attempt ended after a cancellation request before success was committed;
- abandoned: the job had been accepted but was still waiting when force-stop drained the queue.

Submissions rejected before successful insertion are reported as not accepted; they are not counted as abandoned accepted jobs. Record the terminal state and any diagnostic before acknowledging the queue item.

For every successful get, call task_done exactly once after recording that job's terminal outcome and completing required cleanup. A failed or cancelled attempt still needs this acknowledgment because the attempt has ended; that acknowledgment does not make it a successful conversion. Do not call task_done for a waiting item drained by immediate queue shutdown: CPython's shutdown implementation already reduces unfinished-task accounting for drained items. A duplicate task_done can underflow and raise ValueError. [S1 task_done and shutdown](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L97-L138), [S2 implementation](https://github.com/python/cpython/blob/v3.13.9/Lib/asyncio/queues.py#L204-L258), [S3 shutdown tests](https://github.com/python/cpython/blob/v3.13.9/Lib/test/test_asyncio/test_queues.py#L531-L655)

Use the ledger, not qsize or join, to report user progress. qsize is the current number of waiting queue entries; it excludes the jobs already retrieved by workers, completed records, and producer submissions that have not been accepted. Show accepted, queued, running, succeeded, failed, cancelled, and abandoned counts separately. Keep qsize as a queue-health diagnostic. Queue.join is an accounting barrier, not a success counter: it unblocks as the queue's unfinished-task count reaches zero, and immediate shutdown can reduce that count by discarding waiting jobs. [S1 Queue, join, and qsize](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L24-L95), [S2 qsize and join](https://github.com/python/cpython/blob/v3.13.9/Lib/asyncio/queues.py#L93-L115), [S3 immediate-shutdown tests](https://github.com/python/cpython/blob/v3.13.9/Lib/test/test_asyncio/test_queues.py#L583-L655)

asyncio.Queue is not thread-safe. Make queue access on the event loop only. If a desktop UI or other caller submits from a different OS thread, provide an explicit thread-safe handoff to the loop and apply the same acceptance rule there. [S1 thread-safety note](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L12-L40), [S5 threading guidance](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-dev.rst#L59-L89)

## Graceful stop

1. Close the component's admission gate before yielding control. Calls that have not crossed the successful-put acceptance point are rejected.
2. Call queue.shutdown(immediate=False). New puts fail, and blocked putters wake and receive QueueShutDown. Items already in the queue remain available to workers.
3. Await queue.join after the admission gate is closed, then await all worker tasks. Workers process accepted waiting jobs, record outcomes, acknowledge each retrieved item once, and then exit when get raises QueueShutDown on the empty shut-down queue.
4. Keep published successful outputs and terminal outcomes accessible to the session after workers exit.

The order of admission closure and queue shutdown is part of the lifecycle invariant. It prevents a late submission from being omitted from the accepted-work count. CPython 3.13.9 documents that graceful shutdown stops growth, rejects blocked/future puts, allows loaded items to drain, and makes gets raise QueueShutDown after the queue empties. [S1 shutdown docs](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L97-L124), [S3 normal-shutdown test](https://github.com/python/cpython/blob/v3.13.9/Lib/test/test_asyncio/test_queues.py#L531-L582)

## Force-stop

1. Close admissions and call queue.shutdown(immediate=True) without yielding between those actions. The queue is drained and blocked putters are rejected.
2. From the component's mirrored per-ID state, mark all accepted jobs that were still queued at the shutdown point as abandoned. Keep these separate from jobs that were never accepted.
3. Request cancellation of workers processing active jobs. Each worker uses try/finally cleanup, records cancelled/failed/succeeded accurately, removes its private temporary output when the operation did not publish a valid output, and propagates CancelledError after cleanup. Await worker termination. An active job that completed and committed success before the cancellation request took effect may remain succeeded; every other interrupted active attempt is cancelled or failed, never silently succeeded.
4. If queue.join is used as a final accounting check, interpret it only as confirmation that the queue's unfinished count reached zero under the worker acknowledgment contract. It does not establish that every accepted job succeeded.

The draft's claim that immediate-shutdown join proves all accepted conversions succeeded is false. CPython explicitly warns that immediate shutdown may unblock join when no queued work was done. The implementation removes waiting entries and subtracts their unfinished count. The upstream regression tests show join finishing after an unprocessed waiting item is drained, and separately show that an already-retrieved item still needs its own task_done. The application must mark the drained IDs abandoned and the active IDs according to their actual outcome. [S1 immediate-shutdown warning](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L113-L124), [S2 shutdown implementation](https://github.com/python/cpython/blob/v3.13.9/Lib/asyncio/queues.py#L239-L258), [S3 immediate-shutdown tests](https://github.com/python/cpython/blob/v3.13.9/Lib/test/test_asyncio/test_queues.py#L583-L655)

Cancellation in asyncio is cooperative. CancelledError is delivered at the next opportunity, and a coroutine can run cleanup before propagating it. A force-stop request therefore cannot promise a hard deadline for work that blocks the event loop or suppresses cancellation. Do not claim child-process termination behavior here; the brief assigns external child-process behavior to a separate layer. [S4 task cancellation](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-task.rst#L276-L294), [S5 event-loop and blocking-code behavior](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-dev.rst#L59-L120)

## Output ownership and cleanup

Assign each accepted job an ID and component-owned destination before conversion begins. Write intermediate data to a private temporary path owned by that job. Validate the completed temporary output before publishing it to the final path. Only after publication succeeds should the ledger say succeeded. On conversion, validation, publication, or cancellation failure, remove the job's unpublished temporary output and record cleanup errors separately; do not delete previously published successful outputs during stop.

The chosen publish operation, overwrite/conflict policy, and atomicity must be verified for each supported filesystem. The permitted primary inputs establish queue behavior, not filesystem guarantees. If cleanup itself fails, surface the cleanup failure and preserve a truthful non-success job outcome.

## Throughput and capacity estimates

The 20-entry queue is a waiting-work bound, not a latency estimate. Four workers can each hold one additional accepted job, yielding at most 24 accepted queued-or-running jobs. The ledger may retain terminal rows and output references after this outstanding-work bound is reached.

For exactly 12 jobs available at time zero, four workers, exactly 2 seconds per job, equal service times, zero startup/scheduling/I/O overhead, no retries, and work-conserving assignment, the schedule has three waves: ceil(12 / 4) = 3 waves, so 3 × 2 = 6 seconds. Under continuous saturation with the same exact 2-second service time and no overhead, ideal capacity is 4 / 2 = 2 jobs per second. These are conditional scheduling calculations, not observed throughput. They do not predict variable document sizes, filesystem contention, startup cost, failures, or UI responsiveness.

Asyncio gives concurrency when tasks suspend for I/O; it does not make CPU-bound Python conversion code parallel. If representative conversions are CPU-bound, assess an execution mechanism in the separate execution layer and measure it with the actual converter and supported filesystems. [S5 blocking-code guidance](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-dev.rst#L109-L120)

## Alternatives

- Keep Queue.shutdown for the target CPython 3.13.9 runtime. It supplies an explicit graceful/immediate queue lifecycle and wakes blocked producers with QueueShutDown.
- For Python versions before 3.13, use a sentinel protocol only if those versions become supported: close admissions first, enqueue one sentinel per worker after accepted jobs, and make the accounting rules for sentinels explicit. With a bounded queue, inserting sentinels can wait for worker capacity. A sentinel is an application convention and does not provide immediate shutdown's native drain behavior.
- A sequential worker is simpler but cannot overlap independent I/O waits. More than four workers may improve an I/O-heavy workload or worsen CPU, memory, or storage contention; the queue sources do not decide that tradeoff.
- Do not use queue length as a substitute for the state ledger or estimate real throughput from the ideal formula.

Queue.shutdown was added in 3.13. The sentinel comparison is a design inference from queue FIFO, put/get, and task_done semantics; the source docs do not prescribe an application sentinel protocol. [S1 FIFO and shutdown version](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L24-L40), [S1 put/get/task_done](https://github.com/python/cpython/blob/v3.13.9/Doc/library/asyncio-queue.rst#L56-L138)

## Evidence and validation plan

**Evidence reviewed:** the pinned CPython queue documentation, implementation, and regression tests supplied in the permitted source map, plus the public CPython v3.13.9 tag copies of those primary sources and the v3.13.9 asyncio cancellation and development documentation. The runtime docs state shutdown was added in 3.13; implementation and tests establish what immediate shutdown does to waiting and already-retrieved work.

**No local queue experiment or converter benchmark was run.** The available python3 reported 3.14.4, and python3.13 was not found on PATH. A local run on that interpreter would not establish behavior under the requested 3.13.9 runtime. Upstream regression-test source was inspected, not executed. No actual conversion pipeline, output filesystem, throughput, or memory profile was available.

Before implementation is accepted, run these tests under CPython 3.13.9 with an event-controlled fake converter, then separately exercise representative conversions:

1. Admission: fill 20 waiting slots while four workers are held in-flight; verify the 21st waiting job is not accepted until a slot opens; verify no more than four jobs are active.
2. Acceptance boundary: block a putter, start each stop mode, and verify it receives QueueShutDown and is recorded as not accepted unless put completed first.
3. Graceful stop: zero jobs, queued jobs, active jobs, and a mixed queue; assert all accepted IDs reach one terminal outcome and all successful outputs remain available.
4. Force-stop: nonempty waiting queue plus four in-flight jobs; assert every waiting accepted ID is abandoned, every interrupted active ID is not successful, a completion race is classified from the committed output, and no drained ID gets a second task_done.
5. Accounting and failures: worker exception, cancellation before get, cancellation after get, cleanup failure, duplicate acknowledgment attempt, and queue.join only after every retrieved item is acknowledged. Verify the progress ledger against IDs rather than qsize.
6. Output lifecycle: validation failure, publish failure, destination collision, cancellation during conversion/publish, temporary-file cleanup, and preservation of outputs already published successfully. Verify atomicity and conflict behavior on each supported filesystem.
7. Responsiveness and load: slow and CPU-bound fake work, then representative document sets. Measure queue wait, conversion service time, throughput, memory, event-loop/UI responsiveness, and stop latency. Use those measurements to revisit worker count and queue capacity.

These are planned workload and integration tests, not evidence already obtained. Unknown service-time distributions, output size and filesystem behavior, persistent-across-crash ledger needs, and the UI's desired force-stop wording remain open validation or product questions.

## Draft history retained

The maxsize 20 queue, four workers, per-job outcomes, success-only publication, graceful drain, older-runtime sentinel option, and the 12-job / 6-second ideal calculation remain. The 2 jobs/second statement remains only as an ideal capacity under the exact service-time assumptions. The force-stop sentence equating join with conversion success is rejected and replaced by separate abandoned, cancelled, failed, and succeeded outcomes. The claim of cross-job completion from queue length or immediate-shutdown join is removed. The original statement that no converter pipeline or throughput benchmark ran is preserved; the research does not imply a deployment or measured performance.
