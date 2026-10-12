# Criticism dispositions — B05-P01 control

This list records the full material criticism disposition for the draft. Decisions are accept, amend, reject, keep, or uncertain, with primary evidence and reasons. Source IDs resolve in source-map.json.

1. **Configured executable and separate argv; shell-string history. — AMEND.** Keep create_subprocess_exec and the original rejection of shell interpolation. Require a validated executable path, argument array, explicit cwd/environment, and redacted diagnostics. This avoids shell-command construction but does not mean every target parser or Windows batch file is safe. CPython defines create_subprocess_exec separately from shell launch and warns about shell quoting for create_subprocess_shell. [S1, lines 60–105; S6, lines 429–439 and 767–792]

2. **The executable and environment come from explicit settings. — AMEND.** Keep the explicit-settings design, but define allowlisted executable resolution, required environment inheritance, and secret redaction policy. The sources document env mappings but do not decide this product's trust policy. [S6, lines 34–82]

3. **The supervisor owns the process, sinks, and temporary output. — ACCEPT.** This is necessary for deterministic cleanup and result reporting. Strengthen it so the supervisor exists independently of the UI waiter and retains a strong process reference through reaping. This is a design inference supported by Process ownership APIs and cancellation behavior. [S1, lines 145–174; S3, lines 504–524]

4. **Use a Proactor-compatible Windows loop. — KEEP.** Correct. Refine it: CPython 3.13.9's default Windows loop is ProactorEventLoop; SelectorEventLoop does not support subprocesses. If an embedding application changes the loop, detect and report the unsupported case. [S1, lines 103–106 and 289–311; S7, lines 49–77]

5. **No arbitrary process-tree containment or OS sandbox claim. — KEEP.** Correct scope statement. Also make clear terminate/kill only address the direct child here, so descendants are not promised to stop. [S1, lines 222–249]

6. **Launch failure, timeout, cancel, and nonzero exit are separate outcomes. — AMEND.** Keep the distinction and add log_io_error, output_incomplete, and supervisor_error. Record exit code and validation-output result separately. asyncio Process exposes returncode; the product must not infer validation success from process creation or a completed wait alone. [S1, lines 179–217 and 279–287]

7. **Validation requires exit code zero and output checks. — KEEP.** Correct and central. Nonzero exit must never become validation success; verify expected outputs before publishing them. [S1, lines 279–287; S6, lines 121–145]

8. **limit=1048576 is a hard cap on complete communicate output. — REJECT.** False. limit sets StreamReader buffer behavior, while communicate buffers the data read in memory and returns complete stdout/stderr byte strings. It is unsuitable for large or unlimited output. [S1, lines 64–69 and 193–217; S2, lines 157–188]

9. **Call communicate, then write both complete byte strings to disk. — REJECT.** This stores arbitrarily large outputs in memory before spooling and violates the brief. Retain communicate only for known-small output. [S1, lines 193–217; S2, lines 173–188]

10. **Retain each last 1 MiB in the UI. — REJECT.** Two independent 1 MiB tails exceed the job's 1 MiB total allowance. Use one shared byte-budgeted tail or explicit partitions totaling no more than 1,048,576 raw bytes; avoid a second retained decoded copy. [Brief; S1, lines 216–217]

11. **Use replacement decoding for display, preserve raw log bytes. — ACCEPT.** Keep it, but decode only bounded display data and do not decode whole unlimited output. The exact encoding and UI representation remain product choices.

12. **For future live view, read stdout to EOF and then stderr because the supervisor is asynchronous. — REJECT.** A child can block writing stderr while the reader waits for stdout EOF. Launch concurrent pumps before awaiting completion. [S1, lines 179–217; S2, lines 157–188]

13. **wait-only with unread pipes may deadlock. — KEEP.** Correct. Add that the remedy for arbitrarily large output is concurrent bounded draining/spooling, not unlimited communicate() buffering. [S1, lines 179–217]

14. **Redirect-to-file is an alternative with low buffering and less live feedback. — AMEND.** Keep as an alternative. It avoids Python stream-buffer accumulation but raw file redirection does not itself enforce a disk quota and does not provide prompt live logs. Separate files preserve channel identity; filesystem quota or a tested enforcement mechanism is still needed. [S1, lines 119–142; S6, lines 149–167]

15. **Concurrent stream reader/spooler for incremental logs. — ACCEPT.** Select this for the brief's unbounded output and live separate channels. Bound read chunks, queue capacity, shared tail, and disk writes. Keep both pumps active during shutdown. Upstream implementation runs stdout/stderr reads in a gather, but product storage and cancellation behavior still need testing. [S2, lines 157–188; S8, lines 493–510]

16. **Small known-bounded output can use communicate. — ACCEPT.** Correct alternative. Do not use it for the asset validator's arbitrary-output contract. [S1, lines 193–217]

17. **Wrap proc.wait() in wait_for and assume process/pipes are automatically killed/closed. — REJECT.** wait_for cancels the awaited task, not the OS process. The CPython test cancels Process.wait, then explicitly kills and waits for the process. Use an explicit cancel/timeout supervisor. [S4, lines 761–780; S5, lines 459–469; S3, lines 504–524]

18. **Record timeout/cancel immediately when the wait task raises. — REJECT.** Do not terminalize before cleanup. Send the direct-child stop request, keep output pumps active, reap the child, flush/close sinks, and report any incomplete output or storage failure. [S1, lines 179–249; S3, lines 504–524]

19. **Terminate then kill on every platform. — AMEND.** On POSIX the methods correspond to SIGTERM and SIGKILL. On Windows terminate uses TerminateProcess and kill is an alias, so describe a platform-specific sequence; CTRL_BREAK is only an optional console/process-group path. [S1, lines 222–249; S6, lines 869–881]

20. **The upstream canceled-wait regression test is relevant but is not an application test. — KEEP.** Correct characterization. It demonstrates cancellation behavior in CPython's own test, not this component's leak-free cleanup. Product tests must assert child reaping independently. [S3, lines 504–524]

21. **Partial validation outputs stay private and are removed on error/cancel. — ACCEPT.** Keep, with per-job exclusive directories and atomic publication only on a valid pass. Logs may be retained for diagnostics under quota; they are separate from partial validation outputs.

22. **Restart cleanup removes only component-owned temporary files. — AMEND.** Keep strict ownership proof. Use an exclusive job directory and validated marker beneath the component root; reject symlinks and unrelated paths. File cleanup does not stop a child surviving application crash, which remains outside the stated direct-child timeout/cancel guarantee.

23. **Do not wait forever for descendants inheriting pipes; disallow that behavior or separately review process groups. — AMEND.** Keep the scope limit, add a bounded EOF/drain policy and visible output_incomplete result. If hard completion with inherited handles is required, high-level Process's documented API is insufficient for per-pipe closure; review low-level transports or OS-specific management. This is not arbitrary tree supervision. [S1, lines 179–249; S2, lines 108–135]

24. **The proposed test list covers large writes, missing executable, broken stdin, nonzero, timeout/cancel, escalation, quota, encoding, EOF, and Windows. — AMEND.** Keep the list and add exact per-job/aggregate quota boundaries, simultaneous stdout/stderr flood, disk-full/write failure, UI waiter cancellation, output publication, descendant-held pipe behavior, and direct-child liveness/reaping. Broken-stdin tests are conditional because this design uses DEVNULL. None of these product tests was run for this review.

25. **The draft's statement that no asset tool, timeout witness, leak test, Windows run, or throughput test was executed. — KEEP.** Preserve this honesty. Upstream source and test inspection is not execution evidence for this component.

## Overall disposition

The corrected final proposal is ready as a planning recommendation, not as verified implementation. Implement only with the supervisor, bounded concurrent pumps, explicit quotas/results, and platform-specific cleanup above; then run the proposed Linux and Windows validation suite.
