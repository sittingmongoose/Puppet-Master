---
name: r9-goal-pty-stream-v1
description: Run one prebound R9 row inside one fresh native Goal through one resident pull session that releases small ordered subject slices.
---

# R9 Goal PTY Stream V1

The invoking message is control-only: one exact Goal objective, one reader workdir, and one slice count. Before Goal activation, only a brief skill-use announcement, this complete skill read, and host-mandated memory metadata lookup are allowed. Do not inspect the reader workdir or any subject-bearing source.

1. Call native `create_goal` exactly once with the exact objective. Require the active receipt and retain its `threadId`. On failure, return only `ROW_CONSUMED_GOAL_ACTIVATION_FAILURE`.
2. Call `exec_command` exactly once with command `python3 -B stream.py THREAD_ID`, replacing only `THREAD_ID`; use the exact reader workdir, `tty=true`, `yield_time_ms=250`, and `max_output_tokens=256`. Require a running session ID and the first slice.
3. For every remaining slice, call `write_stdin` exactly once on that same session ID with `chars="NEXT\n"`, `yield_time_ms=250`, and `max_output_tokens=256`. Require one next slice per call; the final call must report normal process exit.
4. Concatenate only the released slice payloads in order and solve only that subject. Between transport calls, do not answer, comment, inspect, plan, or call any other tool.
5. Call `update_goal({status:"complete"})` exactly once, require the same Goal complete, and return only the subject answer.

If the resident session, any slice, or its order fails, do no further subject work. Complete the Goal once and return only `ROW_CONSUMED_PROTOCOL_FAILURE`. Never retry, reuse, resend, relaunch, replace, delegate, browse, call OMP, or claim qualification.

If only `functions.exec` exposes those tools, make one wrapper call per transport operation with exactly one nested tool. For the start emit only `{output:r.output,session_id:r.session_id}`; for each write emit only `{exit_code:r.exit_code,output:r.output,session_id:r.session_id}`. Carry the returned numeric session ID literally; do not use notify, store, a loop, or a second nested tool.
