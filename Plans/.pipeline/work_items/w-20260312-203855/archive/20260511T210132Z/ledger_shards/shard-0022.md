  - primary blocked/attention reason
  - blocked owner / attention owner when relevant
  - pressure summary
  - last active / last opened
- Good compact model:
  - `Activity`: `idle | running | paused | queued | background_active`
  - `Attention`: `none | attention_required | blocked | degraded`
  - `Health`: setup/config/repo integrity signal

### Blocked-owner direction
- The user specifically flagged this seam earlier and it still looks underdefined.
- Recommended rule:
  - when a project is in blocked/attention state, the Projects page should show the dominant current owner of that state
- Owner kinds already align with prior ledger work:
  - `Runtime`
  - `Package Overseer`
  - `Seam Overseer`
  - `Corroboration`
  - `Graph Patch`
  - `Recovery`
  - `User`
  - `External Resource`
- This should answer:
  - "who/what is the project waiting on?"

### Primary reason direction
- Projects page should not try to summarize every problem.
- Strong recommendation:
  - show one `primary attention reason` / `primary blocked reason`
  - with optional count badge for additional issues
- Candidate examples:
  - `Waiting on user approval`
  - `Seam integration blocked`
  - `Graph patch required`
  - `Recovery in progress`
  - `Provider/account pressure`
  - `Projection trust degraded`

### Pressure summary direction
- Project cards likely need compact pressure signals, not full usage details.
- Good compact summaries:
  - provider/account pressure present
  - quota pressure severity
  - signal confidence if especially important
- Example:
  - `Gemini pressure: high`
  - `Account switch active`
  - `Quota signal: heuristic`
- This should stay short and deep-link into Usage/Authentication/Orchestrator as needed.

### Active vs historical project posture
- Similar to runs, project cards should not imply that “historical project” is a real semantic class unless the product introduces archiving.
- Better distinction:
  - active workspace/project
  - recently active
  - archived/unregistered project
- If a project has no active runs but lots of historical runs, that is not itself a problem state.

### Background activity direction
- Background activity matters at project-card level.
- Recommended rule:
  - project card should surface background work independently from blocked attention
- Example:
  - a project can be:
    - `background_active`
    - with `attention_required`
    - while still not globally `blocked`

### Relationship to Orchestrator
- Projects page should summarize from canonical project-level projections rather than inventing its own status model.
- Likely it needs a small project summary projection that rolls up:
  - current active run state
  - dominant concern/blocked owner
  - highest-severity attention state
  - current pressure summary
  - health/config integrity

### Contradictions / gaps surfaced
- Current Projects page health/status model is too setup-centric for the rewrite.
- There is no obvious current project-level rollup for blocked-owner and primary attention reason.
- Existing `orchestrator status` (`idle/running/paused`) is too weak on its own to explain why a project needs attention.

### Candidate fixes to carry forward
- Define a project-summary projection with:
  - activity state
  - attention state
  - health state
  - primary blocked/attention owner
  - primary reason
  - pressure summary
- Keep project-card status compact and singular, with deep links for detail.
- Avoid turning project cards into mini dashboards; one dominant reason is better than many badges.

### Do-not-forget details
- blocked ownership should describe the dominant current issue, not every issue in the project
- project health and project attention are different things and should not share one overloaded dot
- a project with only historical runs is not inherently degraded or blocked

## Research Progress - 2026-03-16 - Notifications / Escalation Cadence

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`

### Key findings
- The docs already define many local attention behaviors:
  - Dashboard `Action Required` section
  - thread badges
  - run-graph/node blocked badges
  - warnings/toasts/banners
  - tray/system notifications for some events
  - rate-limit warning banner with dismiss cooldown
  - blocked and attention-required visual distinction
- The current rules are mostly case-by-case.
- What is still missing is a shared escalation ladder across concerns, blocked states, usage pressure, and persistent unresolved conditions.

### Recommended escalation ladder
- Strong recommendation:
  - define one shared progression:
    - `info`
    - `warning`
    - `attention_required`
    - `blocked`
    - `system_notification`
- Working interpretation:
  - `info`
    - visible in local context/history only
  - `warning`
    - in-app banner/card/badge but not necessarily action-blocking
  - `attention_required`
    - user input helpful/needed, but background progress may still continue
  - `blocked`
    - cannot continue meaningfully until required action/precondition changes
  - `system_notification`
    - out-of-app signal for events important enough to interrupt or summon the user

### Surface ladder direction
- Recommended mapping:
  - `History`
    - receives everything chronologically
  - `Progress` / `Dashboard`
    - show active warnings / attention / blocked states
  - badges
    - show compressed counts/severity markers
  - chat/thread surfaces
    - only for things that genuinely need user decision/input
  - system notifications
    - reserved for high-value, sparse events

### Resurfacing / aging direction
- The ledger already established some aging behavior for operational items.
- Strong next-step rule:
  - unresolved conditions should resurface based on severity and persistence, not on every heartbeat/update
- Candidate cadence idea:
  - immediate show on first activation
  - suppress duplicate noise while unchanged
  - resurface only when:
    - severity increases
    - owner changes
    - blocked duration crosses threshold
    - new action becomes available
    - user returns focus after time away

### Persistent blocker direction
- Persistent blockers should not become invisible just because the user dismissed a nearby warning once.
- Good rule:
  - advisory warnings may respect quiet/dismiss windows
  - real blocked states should remain represented until underlying truth changes
- This aligns with earlier concern and blocked-state work:
  - `dismissed` is presentation state, not semantic resolution
  - active blockers must not be dismissible into fake health

### System-notification direction
- System/tray notifications should stay narrow.
- Good candidates:
  - HITL approval required
  - run complete
  - major failure requiring attention
  - maybe severe rate-limit/pressure event when it materially stops progress
- Poor candidates:
  - routine warnings
  - every blocked node in a large run
  - repeated unresolved reminders without new information

### Usage/account-pressure implication
- Usage warnings already suggest:
  - configurable threshold
  - dismiss/quiet window
  - path to Usage/config
- This is a good pattern for non-blocking pressure:
  - warning banner
  - optional toast
  - quiet period
  - escalate further only if it becomes execution-blocking

### Concern / blocked-owner implication
- Concerns and blocked ownership should feed escalation, but not every concern should become a system notification.
- Recommended rule:
