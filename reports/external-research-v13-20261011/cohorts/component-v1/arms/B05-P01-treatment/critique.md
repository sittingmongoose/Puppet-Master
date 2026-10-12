# B05-P01 treatment critique

## Material findings

1. **The memory bound is false.** CPython defines create_subprocess_exec(limit=...) as a StreamReader buffer limit for the stdout/stderr readers. communicate() reads both streams to EOF and returns their complete byte strings; the docs explicitly warn that these bytes are buffered in memory and that communicate() is unsuitable for large or unlimited output. A 1 MiB limit does not cap each returned byte string or the job's total captured output. See S1 lines 64–77 and 208–239; S2 lines 171–203.

2. **The tail budget doubles the requirement.** The draft retains the last 1 MiB of each stream, permitting 2 MiB of log-tail bytes in one job. The brief caps the tail at 1 MiB total per job.

3. **The proposed sequential drainer can deadlock.** Reading stdout to EOF before reading stderr allows a child that fills stderr to block before it closes stdout. “The supervisor is asynchronous” does not change OS pipe capacity. The implementation of communicate() reads both streams concurrently. A bounded streaming design needs separate concurrent pumps. See S1 lines 193–235; S2 lines 171–203.

4. **The timeout/cancel cleanup claim is false.** wait_for() cancels its awaited task on timeout; Process.wait() awaits the subprocess transport's wait future. Neither action is an OS process kill. CPython's cancellation regression test cancels Process.wait(), then explicitly kills the process and awaits it. The draft's statement that asyncio automatically kills the process and closes its pipes is unsupported and unsafe. See S2 lines 135–147; S3 lines 504–525; S4 lines 823–878.

5. **The selected wait primitive needs cancellation-aware design.** wait_for() can take longer than its timeout while the wrapped task handles cancellation. asyncio.wait() returns pending tasks at timeout without canceling them, making it suitable for racing a retained child waiter against a job cancel event and deadline. The child still requires explicit terminate/kill and reaping. See S4 lines 881–932.

6. **Process, pipe, and sink lifetimes are underspecified.** The code must start both pumps before waiting, continue draining after quota exhaustion or sink failure, reap the direct child before terminalizing timeout/cancel, and close sinks after pump completion. Otherwise deadlocks, task leaks, or orphaned owned children remain possible.

7. **Quota semantics need a concrete cap.** A per-stream or per-job cap alone does not bound accumulated disk across concurrent jobs. Define both aggregate job and application-level retained-log quotas, account for both streams together, mark truncation, and choose explicit behavior for a write error. Keep draining even when output can no longer be stored.

8. **Tail memory needs a precise boundary.** Fix the byte-tail payload at 512 KiB per stream, 1 MiB combined per job. State that pipe buffers, queue chunks, and metadata are additional memory; do not promise that total process RSS is 1 MiB.

9. **Windows process and argument behavior needs explicit constraints.** Windows subprocess support requires ProactorEventLoop; SelectorEventLoop does not support it. Windows terminate() uses TerminateProcess and kill() aliases terminate(). Argument sequences are converted to a CreateProcess command-line string by CPython. Test those boundaries on the actual target executable. See S1 lines 252–269 and 312–335; S6 lines 333–388.

10. **Secret display redaction is narrower than raw-output protection.** Redacting known configuration secrets from command/environment diagnostics does not prevent the child from echoing secret material into raw output. Preserve redaction while stating the residual exposure and requiring log access/retention controls.

11. **The direct-child guarantee and descendant exclusion must be reconciled with pipe EOF.** A detached descendant can keep inherited pipe handles open after the direct child exits. The initial scope excludes arbitrary descendant supervision, so prohibit that behavior in the supported validator contract and record a bounded EOF/close path as an implementation gate. Do not advertise process-tree cleanup.

12. **Success and log status need separate definitions.** Keep nonzero exit as validation failure and require output checks. Treat expected quota truncation as explicit metadata; decide whether it invalidates validation. A true disk write failure must produce a non-success infrastructure outcome, not silently pass.

13. **Partial-output cleanup needs ownership checks.** Keep staged output private until success and remove only artifacts proven to belong to the component/job. Recovery must not delete files based only on a filename pattern.

14. **The test list is directionally useful but incomplete.** Add simultaneous pipe saturation, tail-bound checks, aggregate quota under concurrent jobs, disk failures, cancellation during spawn, actual direct-child reaping, Windows loop/argv tests, invalid output on exit zero, inherited-handle behavior, cleanup ownership, and diagnostic redaction/retention. Label every test as future work.

15. **Upstream tests are evidence, not application test results.** The source/test text supports API analysis; it does not establish that this desktop component runs correctly. Preserve the draft's statement that no validator, leak, timeout witness, Windows, or throughput test was executed.

## Source basis

The source-map records the pinned public CPython files, exact SHA-256 values for cached source bodies, line locators, scope, and unresolved product or implementation questions. The pin's GitHub commit page identifies commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0 as Python 3.13.9.

16. **No application caller audit is available.** The permitted admitted inputs contain the brief, plan, draft, and CPython primary sources, but no desktop caller code. Keep integration/caller review open; do not imply it was completed.
