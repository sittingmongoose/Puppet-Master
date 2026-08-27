---
name: r9-goal-notify-atom-v1
description: Execute one prebound bite-size R9 atom inside a fresh native Goal using three separately notified capsules and no task or Goal reuse.
---

# R9 Goal Notify Atom V1

The invoking message contains only an exact Goal objective, atom workdir, and capsule count. A brief skill announcement and this skill read may precede Goal activation. No criterion, subject payload, output contract, or subject work may.

1. Call native `create_goal` once with the exact objective. Require its `active` receipt and retain the `threadId`.
2. Make one `functions.exec` call. Set `tid` to that `threadId`, `wd` to the exact workdir, and `reader` to `/mnt/Cursor/PuppetMaster/tests/r9g33/notify_atom_reader.py`. Loop from integer zero through capsule count minus one. In each iteration set `token = String(i).padStart(3, "0")`; call `tools.exec_command` once with `cmd` exactly `python3 -B ${reader} ${wd} ${tid} ${token}`, `workdir="/mnt/Cursor/PuppetMaster"`, `yield_time_ms=30000`, and `max_output_tokens=256`. Require return code zero and no session id, then call `notify(r.output)` once. After the loop, call `text("CAPSULES_DELIVERED")`.
3. Treat notify output 000 as the acceptance criterion, 001 as the complete subject payload, and 002 as the output contract. Call `get_goal` once and require the same Goal remains active. Perform only that atomic subject work and form only the contract-conforming result.
4. Call `update_goal({status:"complete"})` once, require the same Goal complete, and return only the atom result.

If activation or delivery fails, complete the once-only atom Goal without claiming subject success and return only `ROW_CONSUMED_PROTOCOL_FAILURE`. Never inspect a file, browse, plan, delegate, retry, reuse, resend, relaunch, replace, call OMP, or claim qualification.
