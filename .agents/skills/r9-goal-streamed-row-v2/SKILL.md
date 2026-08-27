---
name: r9-goal-streamed-row-v2
description: Run one prebound R9 row through a fresh native Goal while an exact reader releases small ordered subject slices and terminalizes failures.
---

# R9 Goal Streamed Row V2

The invoking message is control-only: exact Goal objective, reader workdir, and slice count. It contains no subject bytes. A brief skill-use announcement and this skill read may precede Goal activation; no subject byte or subject work may.

1. Call native `create_goal` once with the exact objective. Require its `active` receipt and retain the `threadId`. If activation fails, return only `ROW_CONSUMED_GOAL_ACTIVATION_FAILURE`.
2. For every zero-padded index from `000` through the declared final index, call `exec_command` once with `cmd` exactly `python3 -B chunk.py THREAD_ID INDEX`, replacing only `THREAD_ID` and `INDEX`. Use the exact reader workdir, `yield_time_ms=30000`, and `max_output_tokens=256`.
3. Treat each successful stdout as the next exact subject slice and concatenate in order. Between slice calls, do not answer, comment, summarize, inspect, plan, or call another tool.
4. If any slice call fails or mismatches, do no subject work and inspect nothing. Call `update_goal({status:"complete"})` exactly once, then return only `ROW_CONSUMED_PROTOCOL_FAILURE`. Never continue or repair the row.
5. After the final successful slice, solve only the concatenated subject. Call `update_goal({status:"complete"})` exactly once, require the same Goal to be complete, and return only the subject answer with no Markdown or prose.

Never call `get_goal`, open another file, browse, delegate, retry, reuse, resend, relaunch, replace, call OMP, or claim qualification. One task owns one Goal and one row.
