# Plan-owner delta — Grok 4.5 Assistant Chat

Packet: PM_Assistant_Chat_Concept_Update_Final_Cumulative_2026-08-08 · updated 2026-08-11.
Concept folder only — **no** edits to Plans, Commands, Wiring, DRY owners, Settings, Usage, or sibling model folders.
Status: **complete** (2026-08-11). Step2/Step3 released shared demo/harness/motion; fixtures, probes, ConceptHub validate, and seven packet reports finalized. Dispositions below remain locked from the plan census.

## Plan-owner audit (packet 08 list)

- **assistant-chat-design** — BSD Off/Auto/On + scopes; offline/outbox/reconnect; restore points/rewind; title-bar notifications; Browser Program activity; thread-local model/Persona/access/BSD/Crew/worktree; access profiles; pinned history; left artifacts; distinct Q systems.
- **FinalGUISpec** — Preserve one left Activity Bar + side-panel slot; notifications stay title-bar; no right-panel resurrection; no Chat notification side panel.
- **Models System** — Chat consumes favorites/account/connection/effort/Normal-Fast; provider setup required defers to Settings; reuse cmd.provider.switch_route.
- **Multi-Account** — Explicit account/connection in picker; reuse cmd.account.select_profile; CLI OAuth remains CLI-owned.
- **Prompt Pipeline** — Context Ring/Lens Included/Left out receipt; Compact Now → cmd.chat.compact_context (alias conflict on packet compact_now).
- **Assistant Memory** — Prior-chat search / lens mute-focus only; no second memory system.
- **Personas** — Thread-local persona freeze; Persona cannot grant Full Access.
- **Goal Runtime** — Visible Goal Mode start/pause/resume/stop/update/replan/blocked/complete; catalog has start/update — pause/resume/stop/replan provisional.
- **Orchestrator/Subagents** — Subagent groups + Crew requested vs effective + capacity warnings.
- **Planning Wizard / PRD Builder** — Demo history rows only; no wizard ownership stolen.
- **Permissions / FileSafe** — Ask for approval / Auto accept edits / Auto / Full Access; Full Access · Limited by Review mode; approvals compact.
- **Tools/MCP/Skills/Plugins** — Activity rows + warnings; managers stay Settings-owned.
- **Media** — Attachment resolve native/PM-transformed/alternate/unsupported; Extract in PM — not a Media redesign.
- **Usage** — Capacity/cost chips only; named-owner-deferred for Usage packet depth.
- **Worktrees/Git** — Worktree collision warning card.
- **Testing/Browser/Artifacts** — Browser Program terminology; artifact workspace left of Chat; never Playwright in product UI copy.
- **Server/Project Sync** — sync.state machine + outbox idempotency projection.
- **Notifications** — Title-bar sprout/count; reuse Settings notification open commands; do not invent Chat notification panel.
- **Settings inventory** — Provider/BSD defaults owned by Settings; Chat is live route/BSD consumer.
- **UI Command Catalog** — Census only — see candidate-command-delta.json alias/conflicts.
- **Wiring Matrix / UI Wiring Rules** — candidate-wiring-delta.json traces only.
- **DRY Method** — candidate-dry-delta.json role map; keep w×t identities.

## Stale canon flags (do not edit Plans from here)

- Retire **Yolo** label wherever seen; product label is **Full Access**.
- Retire **Resend** in Chat message controls (GAP-001).
- Retire **Playwright** product/facade terminology in Chat UI copy; use **Browser Program**.
- Retire right-panel Settings language; left shell only.
- `reference/SERVER_BACKBONE_ASSISTANT_CHAT_RETURN.md` defer language for outbox/sync/thread ops is **superseded** by IMPLEMENTATION_PROMPT requirements (demonstrated in concept).

## Command ID census (locked)

| Intent | Reuse | Packet candidate status |
|--------|-------|-------------------------|
| Pin thread/history | `cmd.chat.pin` | `cmd.chat.history.pin` = alias/conflict |
| Restore point | `cmd.chat.create_restore_point` | `cmd.chat.restore_point.create` = alias/conflict |
| Rewind | `cmd.chat.rewind` | `cmd.chat.thread.rewind` = alias/conflict |
| Compact Now | `cmd.chat.compact_context` | `cmd.chat.context.compact_now` = alias/conflict |
| Goal start/update | `cmd.chat.goal.start`, `cmd.chat.goal.update` | pause/resume/stop/replan provisional |
| Account/provider | `cmd.account.select_profile`, `cmd.provider.switch_route` | reuse required |
| BSD/access/redirect/attachment/crew/cross-project/thread.* | missing in catalog | provisional `cmd.chat.*` candidates |

## Appendix — DECISION_COVERAGE dispositions (114)

Each topic is exactly one of: `demonstrated` | `represented` | `named-owner-deferred` | `missing`.

Summary: {'named-owner-deferred': 29, 'demonstrated': 85}

| ID | Disposition | Note |
|----|-------------|------|
| SET-011 | named-owner-deferred | Named owner: Settings/shell; Chat preserves one left Activity Bar + side-panel slot (no second rail). |
| VIS-001 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| VIS-002 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| VIS-003 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| VIS-004 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| VIS-005 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROV-001 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| PROV-014 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| PROV-016 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| PROV-017 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| PROV-022 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| PROV-026 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| CTX-001 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-002 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-003 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-004 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-005 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-006 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-007 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-008 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-009 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-010 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-011 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-013 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-015 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-017 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-018 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| CTX-020 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| AGT-001 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-002 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-003 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-006 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-009 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-010 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-011 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-012 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-013 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-014 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-015 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-016 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-017 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-018 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-019 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-020 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-021 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| AGT-022 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-001 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-002 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-003 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-004 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-005 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-006 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-007 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-008 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-009 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-010 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-011 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-012 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-013 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-014 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-015 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-016 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-017 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-018 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-019 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-020 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| CHAT-021 | demonstrated | Chat/agent topic demonstrated via store APIs, chrome, and demo triggers in grok-4-5. |
| USE-007 | named-owner-deferred | Named owner: Usage concepts. |
| USE-008 | named-owner-deferred | Named owner: Usage concepts. |
| USE-009 | named-owner-deferred | Named owner: Usage concepts. |
| USE-011 | named-owner-deferred | Named owner: Usage concepts. |
| USE-013 | named-owner-deferred | Named owner: Usage concepts. |
| USE-016 | named-owner-deferred | Named owner: Usage concepts. |
| USE-021 | named-owner-deferred | Named owner: Usage concepts. |
| PRM-005 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-008 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-009 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-010 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-011 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-014 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-015 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-016 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-017 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-018 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-019 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-020 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-022 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-023 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-024 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PRM-025 | demonstrated | Browser Program terminology enforced; no Playwright product UI strings. |
| MGR-003 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-006 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-007 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-011 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-012 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-017 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-018 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-019 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-022 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-023 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-024 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-027 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-028 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| MGR-030 | named-owner-deferred | Named owner: Settings redesign / Models / Multi-Account inventory. |
| ONB-014 | named-owner-deferred | Named owner: Onboarding. |
| PROC-001 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-002 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-003 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-005 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-006 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-007 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-008 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-009 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |
| PROC-010 | demonstrated | Required by IMPLEMENTATION_PROMPT; represented/demonstrated in Chat concept surfaces. |

