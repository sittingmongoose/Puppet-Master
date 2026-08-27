---
name: r9-goal-notify-probe
description: Probe one fresh native Goal that receives a tiny subject only through separately bounded notify outputs from one closed orchestration call.
---

# R9 Goal Notify Probe

The invoking message contains only an exact Goal objective, reader workdir, and capsule count. A brief skill announcement and this skill read may precede Goal activation. No subject byte or subject work may.

1. Call native `create_goal` once with the exact objective. Require the `active` receipt and retain its `threadId`.
2. Make one `functions.exec` call. Its source must set `tid` to that `threadId`, `wd` to the exact reader workdir, and loop from index zero through the declared capsule count minus one. Each iteration must call `tools.exec_command` once with `cmd` exactly `python3 -B probe_capsule.py THREAD_ID INDEX`, the exact `workdir`, `yield_time_ms=30000`, and `max_output_tokens=256`. Require return code zero and no session id, then call `notify(r.output)` once. After the loop, call `text("CAPSULES_DELIVERED")`.
3. Concatenate the separately injected notify outputs in index order and solve only that subject. Call `update_goal({status:"complete"})` once, require the same Goal complete, and return only the answer.

If activation or the driver fails, terminalize any active Goal once and return only `ROW_CONSUMED_PROTOCOL_FAILURE`. Never inspect a file, browse, plan, delegate, retry, reuse, resend, relaunch, replace, call OMP, or claim qualification.
