---
name: r9-goal-streamed-row
description: Run one prebound R9 row through a fresh native Goal while an exact reader releases the subject in small ordered slices.
---

# R9 Goal Streamed Row

The invoking message is control-only. It contains an exact Goal objective, reader workdir, and slice count, but no subject bytes.

1. Call native `create_goal` once with the exact objective. Require an `active` receipt and retain its `threadId`.
2. For each zero-padded slice index from `000` through the declared final index, call `exec_command` once with `cmd` exactly `python3 -B chunk.py THREAD_ID INDEX`, replacing only `THREAD_ID` and `INDEX`. Use the exact reader workdir, `yield_time_ms=30000`, and `max_output_tokens=256`.
3. Treat each successful stdout as the next exact subject slice. Do not answer, summarize, inspect, or call another tool between slices. Concatenate the slices in index order.
4. After the final slice, solve only the concatenated subject. Call `update_goal({status:"complete"})` once, require the same Goal to be complete, and return only the subject answer with no Markdown or prose.

The skill load may precede Goal activation; no subject byte or subject work may. Never call `get_goal`, inspect another file, browse, delegate, retry, reuse the task for another row, resend, relaunch, replace, call OMP, or claim qualification. Any mismatch consumes this row and must not be repaired in this task.
