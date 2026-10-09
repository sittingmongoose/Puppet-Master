# Native Goal lifecycle record — A-M12-B/control/critic

Written BEFORE Goal terminal completion (snapshot time 2026-10-09T19:05:51Z–19:06Z).
Mechanism honesty rule: only actually-exposed calls are recorded; no receipt JSON is
handwritten; parent-held terminal fields are marked UNKNOWN from this side until they
exist.

## 1. Goal creation — actual calls observed

One actual fresh native Goal was created by the orchestrator via the T3-code
`delegate_task` call (the exposed native integration route for this harness):

- clientRequestId: `er11-116bb1e4-A-M12-B-control-critic-v1`
- mode: async, role: general, title: `ER11 A-M12-B control critic`
- target: providerInstanceId `zcode`, model `builtin:zai-coding-plan\GLM-5.3-Flash`
- task text begins with top-level `/goal` — per assignment this activates the installed
  native integration loop; the goal-loop dispatch/verify rounds received by this thread
  (tickets 1/4 → 4/4, each with an independent verification pass) ARE that loop live.
- Evidence files: `dispatch-request.json` (the actual call args) and `dispatch.json`
  (task/child ids): taskId
  `node:delegated-task:command%3Amcp%3A0007e9fc-…%3Adelegate-task%3Aer11-116bb1e4-A-M12-B-control-critic-v1`,
  childThreadId `thread:delegated-task:…er11-116bb1e4-A-M12-B-control-critic-v1`,
  status `running`, workState `working` at snapshot time.
- No second model Goal demanded (assignment forbids it). The `muse` CLI on PATH exposes
  no goal subcommand (help checked 19:05Z); it is not the native Goal route here.

## 2. Objective bound to the Goal

Objective = the dispatch task text, 508 chars (`wc -c` equivalent ≤ 4000 PASS),
references this assignment (`critic/assignment.md`) and exact `input-map.json`.

## 3. Science saved BEFORE terminal completion (ordering proof)

All required scientific artifacts written and accepted before this record, i.e.
before any terminal completion (parent-held terminal fields were null at snapshot):

| artifact | mtime (UTC) | sha256 (16) |
|---|---|---|
| ingestion-checklist.md | 18:55:24 | — |
| sources/critic-audit-excerpts.md | 18:58:21 | — |
| sources/index.md | 18:58:29 | — |
| source-map.json | 18:59:37 | 5c27e74c70ce0b5a |
| critique.md | 19:04:28 | 2a085536319b2f84 |

Tickets 1–3 each returned VERDICT: met and passed independent verification rounds.
Terminal completion can only occur at the end of this turn or later — strictly after
every mtime above.

## 4. Unavailable fields — UNKNOWN (not fabricated)

- Native Goal UUID (if any exists beyond the taskId/childThreadId above): UNKNOWN.
- Parent-side terminal record (latestTerminalRunId / latestTerminalStatus /
  latestTerminalSummary): UNKNOWN to this thread; null at snapshot; written only by
  the parent after this thread's turn ends.
- Usage/billing: unobserved → null/UNKNOWN per assignment.
- Exported native answer: the complete native answer is exported verbatim in
  `native-final-answer.md` as the predeclared fallback BEFORE terminal; after terminal,
  delivery is mechanical only. A short status must not replace it.

## 5. Post-terminal rule

After the Goal terminalizes, only mechanical delivery happens: no further substantive
work, no artifact edits, no second Goal, no receipt fabrication.
