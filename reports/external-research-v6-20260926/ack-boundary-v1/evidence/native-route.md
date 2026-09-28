# Observed Muse route and offline qualification boundary

The unchanged Muse driver starts a fresh native session with `session/start`.
Its returned `result.session` contains `sessionId`, `workspaceRoot`, and the
absolute `path` of the native journal. The driver verifies workspace identity
and already reads `session["path"]` while the native turn runs. Its stdout reader
writes each raw MSP line to `muse-msp.jsonl` and calls `flush()` immediately.
No new application method is required for this receiver.

`MuseCompletionFeed(msp_log, workspace_root=...)` reads that existing flushed
MSP capture incrementally. It waits for a session response with the exact bound
workspace, then uses its exact session ID and journal path and stops parsing the
MSP capture. Unrelated workspace session responses before binding are counted and
ignored. Its consumed binding prefix is verified at finalization; later MSP
contents are outside this receiver's evidence route. `CompletionReader.from_session_start(...)` accepts the same response
directly; its constructor also supports an explicit trusted session/path bind for
artificial tests and stopped-log inspection. These are fresh receiver objects,
without resume, persistence or Goal/transport control.

The stopped I2 maintained capture demonstrates the route. MSP physical line 5
contains the session response. The native path it names still exists and has the
same 2,900,405 bytes and SHA-256 as the stopped `muse-session.jsonl` copy. Offline
structural parsing produces 2,093 ordered session records, 101 native calls and
36 completed write proofs, without a stream fault. Non-write results settle their
own lifecycle status and never qualify a path as a completed Write. The MSP
sidecar consumes only the first five raw lines, 3,366 bytes, to bind this stopped
route and parses none of its subsequent provider/result messages. This proves the exposed
route and structural parser compatibility, not a new live run or qualification.

The published marker audit names call batch physical line 1049, effect starts
and successful terminals, and result batch physical line 1196. Calls use
`assistant_tool_calls_committed`, with JSON arguments `path` and `content`.
Effects use `tool_batch_effect`, binding `run_id`, `call_id`, `effect_id`,
`task_id`, `task_stream` and `model_call_index`. A started file-write profile
also binds `workspace:<relative path>`. The success boundary requires terminal
`outcome.kind=completed`, exactly `task_completion={kind:complete}`, one output
reference, and the later matching `tool_result_batch_committed` result
`wrote N bytes to <exact absolute path>`. Native write content is retained only
as UTF-8 byte count and SHA-256, never emitted as payload text.

`pair_proof(payload_path, marker_path)` requires distinct exact paths, one native
write per path, all successful identities above, and payload result completion
strictly before marker start. Each proof carries call/start/terminal/result
sequences and both byte hashes. The Store must compare the completed files with
these requested hashes before valid acknowledgement. Completed available bytes
are snapshotted first, including malformed bytes, to preserve invalid evidence.
A completed wrong or empty marker
still has a completion proof; structural validation decides its invalidity.
File visibility, elapsed time and size stability are never readiness signals.

Partial JSONL records remain pending until the newline arrives. Finalizing with
an unterminated record explicitly faults the stream; missing operations remain
incomplete. A bound journal that is missing or has no complete session record at
finalization explicitly reports `incomplete` with a missing/empty journal reason;
an empty operation list alone cannot establish a closed native stream.
Malformed records, sequence gaps/reordering, conflicting operation
identity, wrong session frames in the bound journal, changed consumed prefixes,
truncation, disappearance and replacement all latch faults that block every
proof once detected. Exact duplicate lifecycle/result notifications do not count additional
native attempts or replace original completion sequences. Actual second calls
to a path are ambiguous and fail that path closed. A conservatively parsed
`edit_file` call with a path also invalidates the original Write provenance, even
if bytes are later restored; it cannot itself qualify a submission. This is a
synthetic adversarial envelope check, not a supported native Edit route claim:
the inspected stopped journal contains no `edit_file` call. Calls, including non-write
calls and failed/pending writes, remain separately counted in `native_attempts`.

Old JSON records are never reparsed. Normal append polls seek to the prior offset
and read only newly appended bytes; unchanged polls perform no read. A same-size
stat change checks the consumed prefix, and finalization performs one full prefix
verification. `bytes_read` counts newly consumed stream bytes;
`integrity_bytes_read` counts the separate verification I/O. Appending trusts the
bound native producer's append-only behavior: an in-place historical rewrite
combined with growth can be detected only at final verification. This reader is
not an authenticated event service or an adversarial filesystem monitor; final
verification must run before the receiver's final result is treated as complete.
Inode replacement and size shrink are detected during ordinary polls. The first permission
transaction frame is unpacked into its ordered child record envelopes; it cannot
hide a sequence gap or foreign session.

The artificial `fixtures/native_events.py` builder produces only bounded native
envelope shapes and synthetic content. Direct offline assertions covered payload
completion, a half-written terminal JSONL line, terminal-without-result pending,
one correct pair, idle parsing counters, live-sidecar binding from synthetic MSP,
and a malformed subsequent record blocking prior proofs. The broader receiver
tests own concurrency, retention, mutation and publication assertions.

Zcode is unqualified: this work observes no corresponding route and invents
none. There were no model, API, native, account, candidate or evaluator calls.
Stopped I2 evidence, files and dispositions were not modified. Payload/source
meaning, research quality and provider charges were not inspected or inferred.

Source pins:

- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/tools/muse_goal_driver.py`
  — SHA-256 `f5af9ef6ef420fbd6452677b11fb31341f17e57a6a0b90b4727dbe3e71adf218`.
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/i2-20260928/runs/I2-M-maintained/native/muse-msp.jsonl`
  — 1,064,043 bytes, SHA-256 `3403222128284794c4573e16caa6176d0fd744ffa3a63486be38c547aa1b756c`.
- `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/i2-20260928/runs/I2-M-maintained/native/muse-session.jsonl`
  — 2,900,405 bytes, SHA-256 `b4dcde0ff3d5fb9281b4f79969a4d396cd7efa206ca758299a19ea7d085827ed`.
- `/home/sittingmongoose/.local/share/muse/sessions/2026/09/28/01a0e7e5-a3a4-7a01-932a-715c99aca81b/session.jsonl`
  — 2,900,405 bytes, SHA-256 `b4dcde0ff3d5fb9281b4f79969a4d396cd7efa206ca758299a19ea7d085827ed`.
- Published `/home/sittingmongoose/pm-worktrees/external-research-v6-20260927/reports/external-research-v6-20260926/i2/checks/marker-order.json`
  — SHA-256 `81efd51f825a3049bb7eab9aa6c45a0a073e7fd22e9891ece8ccf1bc2d8d71a6`.

Paths are evidence citations, not secrets or a newly issued execution packet.
