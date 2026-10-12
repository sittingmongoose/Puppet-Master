# Independent critique — B05-P01 control

## Scope and method

I reviewed the permitted brief, plan, draft, and source index after activation, verified all four copied-file hashes, and independently inspected public CPython 3.13.9 sources at commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0. The downloaded public-file SHA-256 values matched the source index for the five indexed files. The detailed claim map and exact source locators are in source-map.json.

This is a critic plus finalizer review, not an implementation or test run. No treatment cache, preparer source pool, sibling arm, or evaluator was accessed.

## Critical corrections

1. **The proposed memory bound is false.** The draft calls limit=1 MiB a hard cap on communicate() output and then stores all returned stdout/stderr bytes before writing them. CPython documents limit as a StreamReader buffer setting and warns communicate() buffers all output in memory and is unsuitable for large or unlimited output. The implementation returns accumulated byte strings after reading both streams. The draft therefore cannot meet arbitrary output or bounded memory. Use fixed-size reads, a shared 1 MiB raw-byte tail, bounded spool queues, and explicit disk quotas. [S1, lines 64–69 and 193–217; S2, lines 157–188; S8, lines 493–510]

2. **Sequential pipe draining can deadlock.** “Read stdout first to EOF, then stderr” is unsafe. While stdout is being read, a child can fill stderr's OS pipe and block before closing stdout, so stdout never reaches EOF. Async syntax does not drain the other pipe automatically. Start both pumps before awaiting EOF or process exit. [S1, lines 179–217; S2, lines 157–188]

3. **wait_for does not kill the process.** asyncio.wait_for cancels the task it is awaiting and raises TimeoutError. CPython's cancellation regression test explicitly kills the subprocess after cancelling Process.wait(). The draft's claim that timeout or cancellation automatically kills the child and closes pipes is wrong. Keep a manager-owned supervisor, request cancellation through an event, send platform-aware termination, and wait/reap the direct child. [S4, lines 761–780; S5, lines 459–469; S3, lines 504–524]

4. **The per-job tail cap is exceeded.** Retaining the last 1 MiB of each stream allows 2 MiB before object and decoding overhead. A single shared ring or an explicit partition must enforce at most 1,048,576 retained raw log bytes across stdout and stderr. Do not hold the full communicate() result alongside the tail.

5. **Quota exhaustion and storage failure need different outcomes.** A configured quota is an expected truncation condition. It must stop file writes but not stop pipe reads; otherwise the child can block. A real file-write error is an operational failure, not quota truncation and not a clean validation pass. Surface bytes observed/stored and reason flags.

6. **Windows termination differs materially.** CPython's Windows terminate() invokes TerminateProcess; kill() aliases terminate(). The draft's generic terminate-then-kill escalation is not a graceful-then-forceful sequence on Windows. ProactorEventLoop is required, and SelectorEventLoop has no subprocess support. Windows argument sequences are converted to command-line strings; batch files may be launched through a system shell. State those constraints and avoid unsupported quoting guarantees. [S1, lines 222–249 and 289–311; S6, lines 429–439, 767–792, 869–881; S7, lines 49–77]

7. **The direct-child scope is sensible but needs a concrete EOF rule.** Not claiming a sandbox or process-tree supervision is correct. However, descendants that inherit output handles can keep pipes open after the direct child exits. The initial contract should exclude that tool behavior and produce an explicit incomplete-output result after a bounded drain grace, or the implementation should use an independently reviewed pipe-transport/process-management layer. Do not claim that direct-child cleanup proves descendant cleanup.

## Sound parts retained

- Explicit executable plus argv is the right default; preserve the historical rejection of shell-string launch. Add trusted executable/path policy and a Windows batch-file caveat.
- Preserve explicit environment/input handling, secret redaction, manager ownership, separate terminal outcomes, return-code checking, raw logs with replacement decoding only for display, private temporary validation outputs, and the no-sandbox/no-tree guarantee.
- Keep communicate() for genuinely small output, concurrent stream readers for bounded live output, and file redirection as an alternative. Upstream communicate() tests and cancellation tests are not product tests.
- Keep the proposed large-output, launch-failure, nonzero, cancellation, quota, encoding, and Windows tests. Broken-stdin testing is conditional because the selected contract uses DEVNULL; disk-failure, exact quotas, UI-waiter cancellation, and pipe-inheriting descendants should be added.

## Uncertainty and follow-up

The source review proves what the pinned CPython docs, implementation, and tests say; it does not prove component behavior, memory usage, Windows behavior of a particular asset tool, or successful cleanup in this application. The final proposal leaves the actual quota values, EOF grace interval, termination grace interval, UI result schema, and supported executable allowlist for product configuration. Those choices need documented defaults and Linux/Windows tests before implementation approval.
