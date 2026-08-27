---
name: r9-goal-streamed-row-v3
description: Run one prebound R9 row inside one fresh native Goal, receiving the subject only as small ordered post-activation slices.
---

# R9 Goal Streamed Row V3

The invoking message is control-only. It gives one exact Goal objective, one reader workdir, and one slice count; it contains no subject bytes, criteria, choices, or answer.

Before Goal activation, only control bootstrap is allowed: a brief skill-use announcement, reading this skill, and any host-mandated memory/context lookup. Such lookup may inspect only this skill and Codex memory metadata; it must not inspect the reader workdir, source corpus, plan, prior answers, or any subject-bearing artifact. It must not call `chunk.py`, perform subject work, or emit subject bytes. This task is otherwise self-contained.

1. Call native `create_goal` exactly once with the exact objective. Require its `active` receipt and retain its `threadId`. If activation fails, return only `ROW_CONSUMED_GOAL_ACTIVATION_FAILURE`.
2. For each zero-padded index from `000` through the declared final index, call `exec_command` exactly once with command `python3 -B chunk.py THREAD_ID INDEX`, replacing only `THREAD_ID` and `INDEX`. Use the exact reader workdir, `yield_time_ms=30000`, and `max_output_tokens=256`. If only an outer wrapper is available, make one wrapper call per slice with one literal `exec_command`; never batch, loop, or compute several slice calls inside one wrapper.
3. Concatenate each successful stdout in order. Between slice calls, do not answer, comment, summarize, inspect, plan, or call another tool.
4. If a slice fails or mismatches, do no subject work and inspect nothing. Call `update_goal({status:"complete"})` exactly once, then return only `ROW_CONSUMED_PROTOCOL_FAILURE`. The row is consumed permanently.
5. After the final slice, solve only the concatenated subject. Call `update_goal({status:"complete"})` exactly once, require the same Goal to be complete, and return only the subject answer with no Markdown or prose.

Never call `get_goal`, browse after Goal activation, delegate, retry, reuse, resend, relaunch, replace, call OMP, or claim qualification. One fresh task owns one Goal and one row.
