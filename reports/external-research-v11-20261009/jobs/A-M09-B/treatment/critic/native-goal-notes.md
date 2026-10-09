# Native Goal lifecycle notes — A-M09-B / treatment / critic

Observed actual lifecycle of the native Goal carrying this stage. Every value below is read
from harness-owned records in this directory (`dispatch-request.json`, `dispatch.json`) or
observed on disk; nothing is hand-fabricated and no receipt JSON was written by the agent.
Fields not observable from inside the Goal are recorded UNKNOWN per assignment §2.

## Identity and activation

- Created by: the parent orchestrator (Luna/Muse side), via one `delegate_task` dispatch —
  `dispatch-request.json`, requestedAt **2026-10-09T18:48:57.100Z**, acceptedAt
  **2026-10-09T18:48:58.406Z**.
- Activation: the dispatched prompt is the GLM top-level **`/goal`** form ("GLM top-level /goal
  activates installed native integration loop"). This session is that integration loop: the
  goal loop has dispatched tickets 1–5 and per-ticket verifications into it.
- Objective: the `/goal` text of `dispatch-request.json` — **512 chars** (<= 4000), and it
  explicitly refers this assignment (`.../treatment/critic/assignment.md`) and input-map path.
- Fresh: one fresh native Goal, single run `...-critic-v1:ordinal:1`; no Goal reuse, no second
  model Goal demanded or created. No R9 atom/stream/receipt skill was invoked (excluded by the
  objective itself).

## Lifecycle state at writing (2026-10-09T19:01:51Z)

- `dispatch.json` (harness-owned): `status: "running"`, `workState: "working"`,
  `latestTerminalStatus: null`, `latestTerminalSummary: null` — the Goal is **active**.
- Completion mechanism (actual supported calls): the agent has no Goal-terminal CLI; the
  harness-owned record is completed by the parent's task-status read once this thread's turn
  ends with its final answer. The agent does not hand-edit `dispatch.json` and has written no
  receipt JSON anywhere. Terminal timestamp: **UNKNOWN from inside** until the harness stamps
  it at turn end.
- Ordering guarantee for acceptance: all required science was saved before any terminal state
  can exist — `critique.md` mtime 18:57, `source-map.json` mtime 18:59, `sources/` 19:00
  (2026-10-09, UTC), plus `ingest-notes.md` 18:51. Terminal can only be stamped after the
  turn that follows these files ends, so terminal > science mtimes holds by mechanism.

## Deadline posture (assignment §3)

- Stage deadline 2026-10-09T19:00:57Z passed at ~19:01Z. All required science was complete and
  on disk before expiry (see mtimes above). Remaining work — Goal completion and final
  delivery — is the mechanical closure §2/§3 permit ("after terminal only mechanical
  delivery"); no substantive research/critique work was done after expiry.

## No fabrication statement

This file is an observation note, not a receipt: it invents no lifecycle fields, uses only
values present in `dispatch-request.json` / `dispatch.json` / filesystem mtimes, and marks the
unobservable terminal timestamp UNKNOWN. The authoritative lifecycle record remains the
harness-owned `dispatch.json`, which the parent reads via its own task-status call.
