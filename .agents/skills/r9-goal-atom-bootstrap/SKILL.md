---
name: r9-goal-atom-bootstrap
description: Run exactly one prebound R9 atom through a fresh native Goal and a blocking post-activation waiter.
---

# R9 Goal Atom Bootstrap

Loading this file is control-only. The spawn message contains an exact Goal objective and waiter workdir, but no subject or expected answer. After this file is loaded:

1. Call native `create_goal` once with the exact objective. Require an `active` receipt and retain its `threadId`. Do not call `get_goal`.
2. Call `exec_command` once with `cmd` equal to `python3 -B wait.py THREAD_ID`, replacing only `THREAD_ID`; use the exact spawn-message workdir, `yield_time_ms=30000`, and `max_output_tokens=128`.
3. Treat the successful waiter stdout as the only subject. Solve that one bite-size atom and produce one token matching `^[A-Za-z0-9._:-]{1,48}$`.
4. Call `update_goal({status:"complete"})` once. Require the same Goal to be complete.
5. Return only the token, with no Markdown or prose.

The skill load may precede Goal activation, but no subject byte or subject work may. After loading, the only tools are create, waiter, and completion in that order. Never retry, reuse, resend, relaunch, replace, delegate, call OMP, record the result with another tool, or claim qualification. Any mismatch is consumed and must not be repaired in this task.
