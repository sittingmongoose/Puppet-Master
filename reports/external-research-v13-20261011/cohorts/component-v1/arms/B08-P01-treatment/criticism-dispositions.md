# Criticism dispositions — B08-P01 treatment

Each disposition addresses a material claim, omission, or defect in inputs/B08-P01/draft.md. “Primary evidence” identifies pinned upstream CPython documentation, implementation, or tests; the supporting claim map is in source-map.json.

## C01 — Queue cap and total accepted outstanding work

**Decision: ACCEPT WITH SCOPE AMENDMENT.** Queue(maxsize=20) caps waiting entries. Four workers that each hold no more than one retrieved job make a 24-job queue-plus-worker bound for accepted, nonterminal jobs. The cap does not bound concurrent submitter coroutines or input objects retained before their put() succeeds. The final proposal distinguishes pending submissions from accepted jobs and calls for a separate admission limit if total retained payload memory must also be capped.

**Primary evidence and reason:** CPython 3.13.9 docs define positive maxsize and blocked put() at [Queue](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L26-L47); pinned put() checks shutdown/full state and increments unfinished work on insertion [implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L130-L169). The witness reached 20 waiting plus 4 retrieved and left a 25th put() blocked until shutdown rejected it.

## C02 — Queue length as progress

**Decision: ACCEPT AND EXTEND.** qsize() is waiting entries, not accepted total or running work. Maintain per-ID states and expose accepted, queued, running, succeeded, failed, cancelled, abandoned, and pending/rejected submission counts. A terminal/accepted ratio may describe resolution only if success remains separately visible.

**Primary evidence and reason:** Docs describe qsize() as current queue size and a bounded queue as a queue of waiting entries [Queue](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L30-L47); implementation returns the length of the internal deque [qsize](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L101-L123). This does not include retrieved jobs.

## C03 — Event-loop/thread use

**Decision: ACCEPT.** Keep queue operations on the owning asyncio event loop. Do not call queue methods directly from arbitrary UI or worker threads.

**Primary evidence and reason:** The exact 3.13.9 docs say asyncio queues are not thread-safe and designed for async/await use [Queue docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L197-L216).

## C04 — Per-job outcomes and acknowledgment

**Decision: ACCEPT WITH WORDING AMENDMENT.** Record a terminal application outcome before acknowledging a retrieved item. Call task_done() once for every successful get(), including a job that ends failed or cancelled, because the queue acknowledgment means that the application has finished handling the item. Do not call it if no item was returned. The acknowledgment never means the conversion succeeded.

**Primary evidence and reason:** Docs specify a matching task_done() for each retrieved job and ValueError for excess calls; implementation decrements unfinished accounting only [implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L219-L248). Upstream tests exercise underflow and join behavior [tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L461-L501).

## C05 — Graceful shutdown

**Decision: ACCEPT WITH ACCEPTANCE-BARRIER DETAIL.** Use shutdown(immediate=False) after synchronously closing the application admission gate. Existing queued jobs remain drainable; future and blocked puts fail. Await queue accounting and worker termination, then report each real outcome.

**Primary evidence and reason:** The exact docs state normal shutdown allows already loaded tasks to be extracted and rejects future/blocked puts [shutdown docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L103-L120); upstream tests verify a blocked put wakes with QueueShutDown while queued work remains retrievable [shutdown tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L570-L624). A submission becomes accepted only after its put succeeds.

## C06 — Force-stop join() proves success

**Decision: REJECT.** The draft’s statement that after immediate shutdown join() proves all accepted conversions succeeded is false. Its related claim that an empty waiting queue means abandoned jobs would be double-counted as completed is also false. Queue accounting and business outcome are separate.

**Primary evidence and reason:** Docs explicitly warn that immediate shutdown may unblock join() when no work was done on drained items [shutdown docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L122-L134). Implementation drains entries and subtracts their unfinished count [shutdown implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L250-L278). Upstream tests show immediate shutdown with only waiting items can join, while an already retrieved item remains unfinished [tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L626-L700). The executed witness reproduces both cases with zero successful jobs. The final proposal marks queued IDs abandoned from the ledger and uses join() only as accounting synchronization.

## C07 — Worker cancellation and cleanup

**Decision: AMEND.** Require cooperative cancellation handling: record cancellation, clean component-owned temporary outputs, call task_done() exactly once if and only if the worker retrieved a job, then propagate CancelledError. Record any other fatal BaseException as interrupted/failed before re-raising. If cancellation or cleanup does not finish, report pending state instead of stopped/success. A worker failing outside normal stop must not disappear silently while the UI still reports four healthy workers.

**Primary evidence and reason:** At the exact 3.13.9 pin, asyncio cancellation is injected at a cancellation opportunity; docs recommend try/finally cleanup and propagation after cleanup [Task Cancellation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-task.rst#task-cancellation). Queue source documents and enforces task_done() only for unfinished enqueued items [implementation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/queues.py#L219-L237).

## C08 — Temporary output and successful publication

**Decision: ACCEPT AND STRENGTHEN.** Keep output paths component-owned and write to unique temporary destinations. Validate before publication. Make overwrite/collision behavior explicit. On failure or cancellation remove partial outputs and report cleanup failure; only a validated, successfully published output may become SUCCEEDED. Retain successful outputs after stopping.

**Primary evidence and reason:** CPython 3.13.9 documents that os.replace() may fail across filesystems, is atomic if successful on POSIX, and replaces an existing file when permitted [os.replace](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/os.rst#L2884-L2899). tempfile documents secure named temp creation and cleanup behavior [NamedTemporaryFile](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/tempfile.rst#L257-L289). Validation rules, cleanup reporting, and no-accidental-overwrite policy remain application design obligations and require platform-specific tests.

## C09 — Conditional throughput estimate

**Decision: ACCEPT AS A MODEL ONLY.** Under exactly 12 jobs, four workers, identical independent two-second service times, all jobs ready at time zero, and no overhead/retries/contention, the 12-job schedule finishes at 6 seconds and the ideal sustained rate is 2 jobs/second. Preserve these numbers only with those assumptions.

**Primary evidence and reason:** The draft’s arithmetic is independently checked by witnesses/queue_and_capacity_witness.py, which schedules each job onto the earliest-free worker: completion times are four at 2 seconds, four at 4, four at 6; 120 such jobs complete in 60 seconds. It is an executable model, not a converter benchmark.

## C10 — Queue count cannot predict arbitrary latency

**Decision: ACCEPT.** Queue size alone is not a latency estimate for variable documents or service times. Keep the distinction between a deterministic toy schedule and workload measurements.

**Primary evidence and reason:** The counterexample domain in C09 only supplies fixed service times. No source or witness supplies document-converter service-time distributions. Representative workload data is an unresolved validation need, not a reason to invent a latency figure.

## C11 — Sentinel alternative

**Decision: ACCEPT WITH VERSION CONDITION.** Sentinels remain a valid compatibility option for older Python versions, but the target is 3.13.9, where native Queue.shutdown() exists. If used on an older target, close admission, ensure accepted items precede termination tokens, use one sentinel per worker, account for sentinel acknowledgments, and validate force-stop behavior.

**Primary evidence and reason:** Pinned 3.13.9 queue docs mark shutdown() added in 3.13 and define normal/immediate semantics [shutdown docs](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-queue.rst#L103-L134). The sentinel engineering cautions are design conditions, not behavior guaranteed by asyncio.Queue.

## C12 — Worker-count and CPU-bound alternatives

**Decision: ACCEPT WITH QUALIFICATION.** Keep one worker for strict serial/resource-constrained converters; increase concurrency only after measurement. If conversion runs blocking CPU work in an asyncio task, it can delay the entire loop; use an appropriate executor or separate execution layer. Four asyncio tasks alone do not establish CPU parallelism.

**Primary evidence and reason:** The pinned asyncio developer guide says blocking CPU-bound code delays concurrent tasks and describes thread/process executors as ways to avoid blocking the event-loop thread [Running Blocking Code](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-dev.rst#running-blocking-code). The exact execution and cancellation policy is outside this queue proposal.

## C13 — Evidence actually read and run

**Decision: ACCEPT WITH STATUS CLARIFICATION.** The draft correctly says queue docs, implementation, and tests were read. Make clear that the pinned sources were inspected, not that upstream tests were executed. The local witness ran only on CPython 3.14.4.

**Primary evidence and reason:** The source index names exact 3.13.9 copies and SHA-256 values. The executed witness’s saved stdout records CPython 3.14.4; its execution record states stderr was empty. No CPython tests or converter pipeline were run.

## C14 — Validation obligations

**Decision: ACCEPT AND EXPAND.** Preserve the draft’s blocked-admission, worker exception/cancellation, duplicate acknowledgment, empty-queue, slow-job, and cleanup tests. Add force-stop outcome reconciliation, acceptance boundaries, destination collisions, worker death, stop races, target-version/OS coverage, and representative throughput/memory measurement.

**Primary evidence and reason:** CPython’s own tests cover queue-level behavior, not application outcome semantics or filesystem cleanup [upstream tests](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_asyncio/test_queues.py#L536-L700). The executed counterexample shows why app-level success assertions must be separate from queue join assertions.

## C15 — “Durable-in-session” ledger

**Decision: KEEP, WITH UNRESOLVED MEANING.** Retain an application-owned per-session ledger. Do not describe it as durable across process crashes. If crash-surviving job state is required, choose a persistent store and recovery contract in a later design decision.

**Primary evidence and reason:** asyncio.Queue tracks in-memory unfinished work and does not provide persistence. The brief says in-process component; no input establishes a crash-recovery requirement.

## C16 — External child-process behavior

**Decision: KEEP AS A SCOPE BOUNDARY; UNCERTAIN IMPLEMENTATION DETAILS.** Do not claim that cancellation of a worker task terminates a subprocess or another non-cooperative converter. Require the separate adapter to report termination/cleanup completion before this component finalizes cancellation. Actual child-process behavior remains unvalidated because it is explicitly a separate layer.

**Primary evidence and reason:** The task cancellation docs specify coroutine cancellation delivery and cleanup, not application subprocess termination [Task Cancellation](https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-task.rst#task-cancellation). No child-process source or witness was within this component’s evidence.
