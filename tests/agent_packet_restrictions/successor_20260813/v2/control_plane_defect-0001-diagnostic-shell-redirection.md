# Control-plane defect V2-001 — diagnostic shell redirection escaped the write root

Status: `PRESERVED_FAILURE`

Attempt: `successor-preflight-20260813-v2`

Failed check: `V2-IO-001`

During controller qualification, a read-oriented diagnostic command used shell redirection and created these files outside the exclusive successor write root:

- `/tmp/v1_hist_extract.txt`
- `/tmp/v1_surface_extract.txt`

The command completed after the V2 attempt had begun. The files were not qualifying evidence, but creating them is still an outside-root filesystem mutation. Their later deletion would not cure the breach and was not attempted.

Consequences:

- V2 is permanently `NOT_READY`.
- No V2 PASS credit transfers to a later attempt.
- The previously drafted READY projection is withdrawn before any qualifying checker run.
- Subject/provider/model/route/auth/config/canary/pilot/fleet/reviewer/repair calls remain zero.
- A later attempt must prohibit shell redirection, temporary files, report files, subprocess-spawning validators, and bytecode writes throughout its own attempt window.

This defect is process evidence only. It is not an empirical model result, production enforcement result, release-readiness result, safety certification, or permission to compile Plans or launch subjects.
