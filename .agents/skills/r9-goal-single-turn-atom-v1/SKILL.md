---
name: r9-goal-single-turn-atom-v1
description: Run one prebound bite-size R9 atom in the same model turn that creates and completes one fresh native Goal.
---

# R9 Goal Single-Turn Atom V1

The invoking message is control-only: it supplies one exact Goal objective and one atom-reader workdir, but no subject bytes. Before Goal activation, do not inspect that workdir or any subject-bearing file.

1. Call `create_goal` exactly once with the supplied objective. Require the returned Goal to be `active` and retain its exact `threadId`.
2. In this same model turn, immediately call `exec_command` exactly once with `python3 -B atom.py THREAD_ID` in the supplied workdir, replacing only `THREAD_ID`. Use `yield_time_ms=10000` and `max_output_tokens=1024`.
3. Solve only the returned atom while that Goal is active. Call `update_goal({status:"complete"})` exactly once before answering. Require the completed Goal to have the same `threadId`, then return only the atom answer.
4. Do not call `get_goal`, wait for another turn, use a parent message, or call the reader twice. Never retry, resend, relaunch, replace, delegate, browse, or reuse a task, Goal, atom, or answer.
5. On any mismatch before subject exposure, complete an active Goal once if one exists and return only `ATOM_CONSUMED_PROTOCOL_FAILURE`. Any mismatch after subject exposure consumes the atom with zero credit.

Qualification is always decided outside this task.
