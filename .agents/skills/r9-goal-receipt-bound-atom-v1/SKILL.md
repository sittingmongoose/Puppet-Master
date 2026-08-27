---
name: r9-goal-receipt-bound-atom-v1
description: Run one prebound bite-size R9 atom after a standalone native Goal activation receipt in the same model turn.
---

# R9 Goal Receipt-Bound Atom V1

The invoking message is control-only: it supplies one exact Goal objective and one atom-reader workdir, but no subject bytes. Before Goal activation, do not inspect that workdir or any subject-bearing file.

1. Call `create_goal` exactly once with the supplied objective. This must be a standalone tool call: do not compose the reader or any other tool into that call.
2. Require the returned envelope to contain `goal.status == "active"`, the exact objective, and a nonempty `goal.threadId`. Retain that `goal.threadId`.
3. After the standalone activation call has returned, and still in this same model turn, call `exec_command` exactly once with `python3 -B atom.py THREAD_ID` in the supplied workdir, replacing only `THREAD_ID`. Use `yield_time_ms=10000` and `max_output_tokens=1024`.
4. Solve only the returned atom while that Goal is active. Call `update_goal({status:"complete"})` exactly once before answering. Require its envelope to contain the same `goal.threadId` and `goal.status == "complete"`, then return only the atom answer.
5. Do not call `get_goal`, wait for another turn, use a parent message, or call the reader twice. Never retry, resend, relaunch, replace, delegate, browse, or reuse a task, Goal, atom, or answer.
6. On any mismatch before subject exposure, complete an active Goal once if one exists and return only `ATOM_CONSUMED_PROTOCOL_FAILURE`. Any mismatch after subject exposure consumes the atom with zero credit.

Qualification is always decided outside this task.
