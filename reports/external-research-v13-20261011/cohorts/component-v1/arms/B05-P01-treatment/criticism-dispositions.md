# B05-P01 criticism dispositions

Each disposition refers to the original investigator draft, the finalized proposal, and the pinned primary-source map. “Keep” means the draft point survives review; “amend” means preserve it with the stated correction or boundary; “reject” means remove the draft claim; “uncertain” records a product or implementation question that source text alone does not resolve.

## D01 — Prefer an argument sequence and avoid shell interpolation
**Decision: keep.** Retain create_subprocess_exec(program, *args) as the default and reject a concatenated shell command. CPython's pinned subprocess documentation recommends a sequence and explains that shell commands require quoting; on Windows CPython converts a sequence to the CreateProcess string. The rationale is also consistent with the brief's configured-executable requirement. See S1 lines 83–105 and S6 lines 333–418.

## D02 — Validate executable, arguments, environment, cwd, and stdin
**Decision: amend.** Keep explicit configuration, add fully qualified executable and cwd preferences, and record only a safe executable label. If stdin is not used, use DEVNULL. A configured secret can be redacted from displayed launch settings, but a child may echo it into logs; no blanket output-redaction guarantee is made. A needed stdin protocol must be bounded and must record early close. See S1 lines 128–153 and 208–239; S6 lines 333–388 and 459–468. The exact allowlist and secret handling are application policy.

## D03 — Claim that limit=1048576 hard-caps captured output
**Decision: reject.** The documentation says limit sets the StreamReader wrapper's buffer limit. communicate() returns stdout_data and stderr_data and the docs warn that read data is buffered in memory and the method must not be used for large or unlimited output. The pinned implementation reads each whole stream and returns both results. Replace this with fixed-size concurrent reads, spooling, and fixed tails. See S1 lines 64–77 and 208–239; S2 lines 171–203.

## D04 — Call communicate() for arbitrarily large output, then write returned bytes
**Decision: reject.** This necessarily holds complete captured output in memory before the post-communicate write. Preserve communicate() only as an alternative for genuinely small, known-bounded exchanges. See S1 lines 208–239; S2 lines 188–203.

## D05 — Keep last 1 MiB per stream
**Decision: reject.** That permits 2 MiB of tail bytes per job, against the brief's 1 MiB total. Use fixed 512 KiB stdout and 512 KiB stderr byte rings. Explain that other process memory is outside the tail budget.

## D06 — Read stdout fully and then stderr
**Decision: reject.** Asynchronous code can still block on a full OS pipe. If stderr fills while stdout is being read to EOF, the child may stop writing stdout and never close it. Use concurrent stream pumps, retaining separate stream identity. CPython's communicate implementation schedules both reads concurrently. See S1 lines 193–235; S2 lines 171–203.

## D07 — Avoid wait() alone with unread pipes
**Decision: keep.** Preserve the warning: wait() can deadlock when a child fills a PIPE. The replacement architecture begins both drainers immediately. See S1 lines 193–207.

## D08 — asyncio.wait_for(proc.wait()) kills the process and closes its pipes
**Decision: reject.** wait_for cancels its awaited task on timeout; the waiter implementation awaits the subprocess transport. The upstream regression test cancels Process.wait(), then calls proc.kill() and awaits proc.wait(). Explicitly signal and reap the direct child; do not equate task cancellation with process termination. See S2 lines 135–147; S3 lines 504–525; S4 lines 823–878.

## D09 — Use a retained waiter plus timeout/cancel coordination
**Decision: amend.** Keep a child-wait task alive and race it with a user cancellation event and remaining deadline using asyncio.wait(). At timeout, asyncio.wait() returns pending tasks without canceling them. The supervisor then terminates, escalates if platform semantics support it, and awaits the same child waiter. Add launch-state handling because a stop request during process creation cannot safely discard a Process that has not yet been returned. See S4 lines 881–932; S2 lines 218–229; S3 lines 527–555. Process creation's exact cancellation timing remains an implementation test.

## D10 — Escalate with terminate then kill
**Decision: amend.** On POSIX, terminate sends SIGTERM and kill sends SIGKILL. On Windows, terminate calls TerminateProcess and kill is its alias, so the same two-step semantic escalation is unavailable. Await the direct child and keep ownership through reaping; handle already-exited races. See S1 lines 241–269.

## D11 — Use direct-child ownership and avoid claiming descendant containment
**Decision: keep.** Keep the brief's explicit exclusion for arbitrary descendant supervision and sandboxing. State that this component guarantees reaping for its direct child on handled job paths. A detached descendant may retain inherited pipe handles; initial supported tools must not do that. If support changes, add and review a separate platform process-tree layer. See S1 lines 295–335.

## D12 — Separate timeout, cancel, launch failure, and nonzero exit
**Decision: amend.** Preserve distinct terminal reasons and return code. Add output-check failure, sink failure, cleanup failure, and explicit truncation metadata. A zero exit plus passed product output checks is required for validation success; nonzero always fails. Whether a quota-truncated log can accompany a validation pass remains a product-policy choice. See S1 lines 295–309 and the brief's outcome requirement.

## D13 — Treat a log-write failure as a result that cannot silently pass
**Decision: keep.** Preserve the draft guard and define an explicit log_io_error terminal result. Continue draining/discarding after a sink failure to avoid blocking the child; preserve return code and validation diagnostics separately. Planned quota exhaustion is a distinct, visible truncated-log result.

## D14 — Keep partial validation outputs private and recover only owned files
**Decision: amend.** Retain per-job staging and atomic publication after successful process and output checks. Require ownership metadata for removal during error cleanup or startup recovery; a filename pattern is insufficient. This is a product design constraint, not behavior guaranteed by asyncio.

## D15 — Apply a configured disk quota
**Decision: amend.** Count both streams against an aggregate per-job quota and enforce a global retained-log quota across jobs. Bound the writer queue. Once quota is spent, drain and count discarded bytes. Record disk-full/permission errors distinctly. The output rate, retention rule, quota value, and pass behavior after truncation need product configuration; no numeric disk quota was supplied.

## D16 — Retain binary logs and use replacement decoding for display
**Decision: amend.** Keep raw bytes in files and tails; decode only when rendering. Replacement decoding is appropriate for invalid bytes, and a bounded tail may begin mid-codepoint. Do not decode chunks independently and accidentally treat chunk boundaries as complete text boundaries.

## D17 — Windows Proactor constraint
**Decision: keep.** Require ProactorEventLoop for Windows asyncio subprocesses and reject SelectorEventLoop with a clear error. The pinned CPython docs identify Proactor as the default and Selector as lacking subprocess support. Test the actual desktop loop policy. See S1 lines 312–335.

## D18 — Keep communicate, concurrent pumps, and file redirection as alternatives
**Decision: amend.** Keep all three as alternatives, with accurate conditions: communicate for small bounded output; concurrent pumps for live arbitrary output and tails, with backpressure/EOF complexity; redirected files only where live streaming is unnecessary and storage is still quota-managed. Merging streams loses source identity and is not selected.

## D19 — Preserve the draft's proposed tests and no-test honesty
**Decision: amend.** Retain the original simultaneous pipe writes, missing executable, broken stdin, nonzero exit, timeout/cancel, escalation, quota, invalid encoding, early EOF, and Windows compatibility cases. Add direct-child reaping, spawn-time cancellation, global quota, disk failure, output-check, actual argv round-trip, inherited-pipe, tail byte-cap, partial-output ownership, diagnostic redaction, and retention tests. None were executed here. The upstream CPython tests were inspected as source, not run as component tests. See S3 lines 143–177, 326–370, and 504–555.

## D20 — Decide quota-truncation pass semantics
**Decision: uncertain.** The brief requires saving logs up to a configured quota, which supports an explicit truncation outcome, but it does not specify whether exhausting that quota invalidates validation. Default proposal: a quota-truncated log may coexist with success if exit status is zero and output checks pass, with a prominent incomplete-log warning. If full log retention is an audit requirement, quota exhaustion must instead yield an incomplete/non-success result. Jared/product owner should choose before implementation.

## D21 — Bound EOF waiting when descendants retain handles
**Decision: uncertain.** Descendant-process supervision is explicitly outside scope. A detached descendant can nonetheless retain a pipe handle and delay EOF. The supported-tool contract should forbid descendants that inherit stdout/stderr. Before shipping, test the chosen EOF timeout and parent-side pipe-close implementation under CPython 3.13.9 on both platforms. Avoid relying on an unreviewed private transport attribute. If the product must support that behavior, expand scope to a reviewed low-level/platform process layer.


## D22 — Audit application callers
**Decision: uncertain.** The plan asks for caller review, but no desktop caller source was among the permitted admitted inputs. No caller audit is claimed. Review the eventual caller when implementation code is available; verify cancellation and outcome handling at the UI/integration boundary. CPython API sources describe subprocess mechanics but cannot establish how an application caller uses them.
