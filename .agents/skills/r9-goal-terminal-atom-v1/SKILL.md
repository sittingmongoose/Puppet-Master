---
name: r9-goal-terminal-atom-v1
description: Run one prebound bite-size R9 atom inside one fresh native Goal and complete that Goal before returning the answer.
---

# R9 Goal Terminal Atom V1

The invoking message is control-only. It supplies one exact Goal objective and one atom-reader workdir. It contains no subject bytes.

Before Goal activation, read only this skill. Do not inspect the reader workdir, files, memory content, or subject material.

1. Call `create_goal` exactly once with the supplied objective. Require `active`. Return only that exact receipt. Do not call the reader in this turn.
2. On the automatic Goal continuation, call `get_goal` once and require the same active Goal. Then call `exec_command` exactly once with `python3 -B atom.py THREAD_ID` in the supplied workdir, replacing only `THREAD_ID`. Use `yield_time_ms=10000` and `max_output_tokens=1024`.
3. Solve only that one returned atom while the Goal is active. Call `update_goal({status:"complete"})` exactly once before returning. Require the same Goal to be complete, then return only the atom answer.
4. Never call the reader twice, inspect files, browse, delegate, wait, use a parent message, retry, resend, relaunch, replace, or reuse a task, Goal, atom, or answer.
5. On any mismatch before subject work, complete an active Goal once and return only `ATOM_CONSUMED_PROTOCOL_FAILURE`. After atom exposure, any mismatch consumes the atom with zero credit.

Qualification is always decided outside this task.
