---
name: r9-goal-turn-pull-v1
description: Run one prebound R9 row through one fresh native Goal, pulling exactly one bite-size capsule on each automatic Goal continuation.
---

# R9 Goal Turn Pull V1

The invoking message is control-only. It supplies one exact Goal objective and one reader workdir. It contains no subject bytes.

Before Goal activation, read only this skill. Do not inspect the reader workdir, files, memory content, or subject material.

1. Call `create_goal` exactly once with the supplied objective. Require `active`. Return only that exact receipt. Do not call the reader in this turn.
2. On every automatic Goal continuation, call `get_goal` once and require the same active Goal. Then call `exec_command` exactly once with `python3 -B turn.py THREAD_ID` in the supplied workdir, replacing only `THREAD_ID`. Use `yield_time_ms=10000` and `max_output_tokens=1024`.
3. Obey the single returned capsule and end the turn. A subject capsule requires only its exact ACK. A final trigger requires only the subject answer. A closure capsule requires one `update_goal({status:"complete"})` call and only its exact receipt.
4. Never call the reader twice in one turn. Never inspect files, browse, delegate, use a parent message, retry, resend, relaunch, replace, or reuse a task, Goal, capsule, or answer.
5. On any mismatch, do no further subject work. If the Goal is active, complete it once, then return only `ROW_CONSUMED_PROTOCOL_FAILURE`.

The reader output is the sole post-activation work surface. Qualification is always decided outside this task.
