# Demo Data and Interaction Story

## Source fixture

Use `machine/original_demoData.json` as the baseline. It contains:

- 15 project threads;
- 400 stored messages;
- substantial conversation and long messages;
- scripted responses;
- Goals, Todos, questions, subagents, diffs, artifacts, browser state, and draft recovery.

Do not replace it with shallow placeholder content. It may be adapted to the new workspace architecture and extended through `machine/extended_demo_scenario.json`.

## Thread inventory

Show at least 18 credible thread rows so pinning, search, archive, status, offline, and long-title behavior can be judged.

Suggested thread stories:

```text
Provider and model manager redesign
Assistant Chat selector/access redesign
Usage forecast and provider reset
MCP setup and tool approval
LSP configuration and diagnostics
Memory review and correction
Persona audit
Planning Wizard topic review
PRD source extraction
Worktree collision
Port collision
Browser visual test
Failed unit test and repair
Video attachment route decision
Generated report/artifact
Cross-thread research request
Crew review
Offline queued work / reconnect
```

Include active, waiting for user, Goal running, Goal paused, blocked by approval, child agents working, completed with artifact, failed/retry, archived, branched, and remote/server-continuing states.

## Primary showcase narrative

The main thread should contain at least 18 meaningful message/event groups and enough length to stress real scrolling.

A representative sequence:

1. User submits a long Assistant Chat/provider redesign request.
2. Assistant acknowledges and starts a Goal.
3. BSD Auto briefly evaluates and remains silent or supplies one bounded note.
4. The agent searches current and prior project threads.
5. A compact preparation state becomes a multi-step questionnaire.
6. User answers, skips, revisits, and submits; receipt remains durable.
7. Goal creates at least eight Todos.
8. Agent reads Plans and code, searches/fetches external evidence, and inspects current UI.
9. A port or worktree collision is detected; safe alternative is selected.
10. Three child agents are requested on different provider/account/model routes.
11. Capacity allows two concurrent; one is queued. Show the reason and reserved verification capacity.
12. One child completes, one blocks/waits, one retries or falls back.
13. Activity transitions through files, tools, browser/test, edits, and verification.
14. A provider/cache/privacy warning offers Continue/Branch/Details.
15. A video or ZIP attachment is Native, PM transformed, alternate-routed, or rejected.
16. A three-file diff appears and can expand.
17. Four artifacts are produced; one opens in the left artifact workspace.
18. User pins history while the artifact remains open.
19. The client goes offline; a new message queues and later replays once.
20. User redirects an active turn.
21. Agent sends a typed request to another thread and receives a bounded response.
22. Goal pauses, resumes, replans, blocks, recovers, and completes.
23. Final prose, evidence, elapsed time, route, and completion receipt remain readable.
24. User branches from an earlier point or re-answers the questionnaire as a sibling branch.

## Deterministic demo controller

Provide a test/demo controller outside the proposed production Chat UI. It may be a host drawer, URL state, keyboard command, or development panel.

It must trigger and reset:

```text
History open/close/peek/pin/full/compact
Artifact generate/open/loading/update/error/retry/switch/close
Question prepare/open/answer/next/back/skip/error/cancel/submit/history
Goal start/pause/resume/edit/replan/block/recover/stop/clear/complete
Todo add/run/verify/complete/block/fail/skip/cancel/stale/replan
Subagent request/admit/queue/run/wait/block/retry/fallback/stop/complete
Crew start/waves/member detail/board/reducer/complete
Activity phase advance and retrospective expansion
Diff creation/update/expand
Approval and route-impact cards
Attachment resolution
Context Lens and Compact Now
Thread request/await/response/spawn
Branch/rewind/restore/re-answer
Active-turn redirect
Cross-project grant
Worktree/port/test/debug/resource collision
BSD Off/Auto idle/Auto active/On/silent/advice/timeout/unavailable
Provider install/sign-in/update/repair states
Offline/queued/reconnect/replay/snapshot/server continuing
Notification outcome
Reduced motion and theme/width state
Scenario reset
```

The controller is not a production toolbar.

## Fake send

Allow the evaluator to type and send arbitrary text. Append it exactly, run the fixture's next scripted state sequence, and add the next prewritten response. Do not pretend the prototype understands the arbitrary text.

Demonstrate typing while work is active, Send/Stop state change, active-turn redirect, offline queue, and Stop.

## Demo truthfulness

- No fake provider billing claim.
- No hidden chain-of-thought claim.
- No secrets in authentication states.
- No model-token attribution for local install, browser, capture, LSP, or test work.
- Unknown usage remains unknown.
- A loading state eventually resolves or exposes Retry/Cancel.
- Every visible action works or is truthfully disabled with a reason.
