# Plan-owner delta — chat-assistant/qwen-3-8

Audit of the packet's named owners against this update (final cumulative packet,
`PM_Assistant_Chat_Concept_Update_Final_Cumulative_2026-08-08`). Concept agents record;
never edit canon. One row per owner; impact column describes what this concept pass
changed or surfaced for that owner.

| Owner | Impact from this update |
| --- | --- |
| assistant-chat-design | All new surfaces: BSD chip/popup, provider rail, account rows, sync strip, inbox, grant/capacity/ops/attachment/receipt cards, offline composer states. |
| FinalGUISpec | Theme-token treatments for BSD states, port/worktree chips, capacity chip; bounded glows; reduced-motion paths for every new animation. |
| Models System | Provider rail + setup states (install-required / update-available); disabled-model reason rows; Settings deep link only. |
| Multi-Account | Account identity in the picker: selectable account rows, connection-kind labels, Account footer line; same model under two accounts = two distinct routes. |
| Prompt Pipeline | Context Lens receipt is a projection of admission data; Included/Left out with provenance and sizes; raw prompt never shown. |
| Assistant Memory | Below-threshold memories appear only as a Left-out reason in the receipt. |
| Personas | Persona capsule listed as an Included admission source. |
| Goal Runtime | cmd.chat.goal.* projections; Chat never owns scheduler truth; clear stays local; replan_count surfaced. |
| Orchestrator/Subagents | 5 subagents on 3 routes with queued/blocked/stopped/completed; capacity forecast card defers execution authority. |
| Planning Wizard | No direct impact. |
| PRD Builder | No direct impact. |
| Permissions | Cross-project grant card: read/write distinction, one-time scopes, never persists silently. |
| FileSafe | Receipt keeps FileSafe rulebook hidden; alternate-route consent respects FileSafe boundaries. |
| Tools/MCP/Skills/Plugins | Selected tools in Included; 17 unused tool schemas in Left out. |
| Media | Unsupported video flow (Cancel / Extract in PM / Use Gemini); consent-before-route ordering; transform job metering placeholder. |
| Usage | BSD attribution states; cache-loss warning wording; transform metering placeholder; Usage page stays owner-routed. |
| Worktrees/Git | Worktree state chips + port-collision cards are projections; port 3000 -> 3001 wording per packet example. |
| Testing/Browser/Artifacts | Browser Program terminology sweep; cmd.chat.artifact.* family; artifact cards restored on t1/t2/t5/t6/t7/t8. |
| Server/Project Sync integration | Offline/outbox/reconnect/replay/snapshot states; durable client IDs as idempotency keys; replay exactly once. |
| Notifications | Title-bar inbox boundary; bell + unread count; mark-read; Open thread deep links; no bottom-right stack; no Activity Bar icon (MGR-003). |
| Settings inventory | Provider setup states deep-link to settings:provider; Chat never becomes Provider Manager. |

Notes:

- "No direct impact" rows are recorded per the packet's audit requirement, not omitted.
- Candidate command IDs are provisional (PROC-005); the census in
  `candidate-command-delta.json` is the adjudication input; canon stays untouched.
