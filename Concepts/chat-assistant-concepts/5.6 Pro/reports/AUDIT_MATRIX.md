# Independent audit matrix — Puppet Master Assistant

Generated 2026-09-04 by `tests/independent-audit-v5.mjs`. 481 requirements: 236 from the implemented v2 packet and 245 from `PM_Assistant_v2_Additive_Correction_v4`.

## Method, and what a verdict is worth

Every row below was decided by a probe that drove the built page in a real browser and read the resulting state or rendered DOM. No prior report, delivery manifest, screenshot or fixture toast was an input to any verdict; `REPAIR_STATUS.md`, `DELIVERY_MANIFEST.json` and the packet's own test matrix were deliberately not read by the harness.

| verdict | meaning |
|---|---|
| `pass` | the behaviour was driven and observed on this surface |
| `failed` | the behaviour was driven and the surface did not do it |
| `blocked` | closing it needs a native handler, storage engine, scheduler, provider adapter or branch census that does not exist in a `file://` concept. The blocker is stated per row and is never recorded as a pass |
| `superseded` | a v2 rule the correction explicitly retires. Recorded only with the replacing requirement AND proof that the new value is what the surface holds |
| `not implemented` | absent, with nothing standing in for it |

## Totals

| verdict | count |
|---|---:|
| pass | 443 |
| failed | 1 |
| blocked | 35 |
| superseded | 2 |
| **total** | **481** |

Probes run: 494 (blocked 35, failed 1, pass 456, superseded 2). Console errors during the whole run: 0.

## Readiness, in three independent columns

A concept pass closes the **concept** column only. It never closes the native column, and it never certifies the canonical `Plans/**` owner document.

| column | what this audit establishes |
|---|---|
| canonical (`Plans/**`) | not established here. This audit inspects the concept implementation, not the owner documents. `python3 scripts/pm-plans-verify.py run-gates` owns that verdict. |
| concept (5.6 Pro) | 443 of 481 requirements driven and observed; 2 superseded with the replacement proven; 1 failed; 0 not implemented. |
| native (Puppet Master runtime) | **nothing is closed.** 35 requirements are blocked on native infrastructure and every other row is fixture-backed. Every `cmd.*` this concept names is `handler_unavailable`. |

## Blocked rows, and the exact blocker

| requirement | blocker |
|---|---|
| `ATT-013` | Deletion refusal while an artifact is still referenced by another message, Plan, Goal, workflow, evidence or hold requires a real artifact store with reachability. Nothing is deleted or held in a file:// page. |
| `BSD-020` | BSD command, event, storage and wiring authority closure is a registry property of the implementation branch. This concept renders BSD state and its policy; it registers no native command and admits no event. |
| `CDRY-001` | A branch-current command/schema/event/settings census must be taken against the user’s implemented v2 BRANCH. This concept folder is not that branch: it registers UI actions, not native commands, and every cmd.* it names is handler_unavailable. The census cannot be produced from here. |
| `CDRY-003` | No per-number command is minted here — that half is checkable and holds. The other half (the seven values living in the GENERIC project Settings transaction owner) needs a Settings store that does not exist in this concept: QBASE/QGRILL are module constants. Evidence: {"perNumber":[],"grill":[]} |
| `CDRY-010` | A typed request/result/error/availability contract with a permission snapshot, an idempotency key, a SOLE handler and an effect disposition is a native-dispatcher property. Every cmd.* this concept names is handler_unavailable, so no handler uniqueness or permission snapshot can be observed here. |
| `CDRY-011` | Central EventRecord admission is a registry property of the implementation branch. This concept emits no events; its durable effects are fixture mutations plus visible receipts, which is a receipt-only disposition it can show but not register. |
| `CDRY-012` | Producer → command → sole handler → owner record/event/receipt → projector → every GUI consumer, with reverse orphan coverage, needs the production wiring matrix and a source-hashed native dispatcher. Not producible from a file:// concept. |
| `CDRY-014` | No retired value survives as an active value — that half is checkable and holds. The MIGRATION itself (retiring stored rows while preserving explicit user values) needs a storage engine and a migration runner; nothing migrates in a file:// page. Evidence: {"bases":{"quick":3,"standard":6,"thorough":… |
| `CDRY-015` | Idempotent schema migration, legacy-data preservation, ambiguous-record quarantine and restart-during-migration recovery all require a storage engine. No migration executes in this concept. |
| `CDRY-019` | Refreshing generated indexes, shards, evidence and governance in the correct order is a repository-gate property of Plans/**, outside this concept folder. `python3 scripts/pm-plans-verify.py run-gates` is the owner of that verdict, not this audit. |
| `DRY-003` | Typed request/result/error/availability with one handler, currentness, permission and idempotency is a native-dispatcher property. Every cmd.* this concept names is handler_unavailable. |
| `DRY-004` | Event Authority admission is a registry property of the implementation branch. This concept emits no events; its durable effects are fixture mutations plus visible receipts. |
| `DRY-005` | Forward and reverse GUI wiring coverage is produced from Wiring_Matrix.production.json against a source-hashed dispatcher, neither of which exists in this folder. |
| `DRY-007` | Ordering of generated index/shard/evidence/governance refreshes is a Plans/** repository-gate property, outside this concept folder. |
| `GOAL-013` | Proving that a provider-native goal loop cannot run alongside the PM continuation needs a live adapter exposing that loop. No adapter runs in this concept. |
| `GOAL-014` | Migrating complex v1 Goal records (phases, tranches, child goals, budgets) into the simple record without data loss needs a storage engine and a migration runner. The concept ships only the post-migration shape. |
| `GREPLAY-012` | Requires a live direct/SDK/CLI/server adapter to show a provider-native goal loop being suppressed or disclosed. Contract text only in this concept; no adapter runs here. |
| `PART-024` | Requires a live direct/SDK/CLI/server adapter that cannot guarantee fresh sessions, parallelism or isolation, so its constrained tier can be disclosed before Start and in the artifact. No adapter runs in this concept. |
| `PDET-006` | Retention holds across Wizard/Goal/Crew/Review/Usage/export references need a real artifact store with reachability rules. Nothing in a file:// page deletes or holds an artifact. |
| `PROVIDER-002` | The four-step disposition for a provider-native system needs a live adapter exposing one. No adapter runs in this concept. |
| `PROVIDER-004` | A published adapter capability matrix with source and currentness is adapter-side. This concept exposes model rosters and permission ceilings, not adapter capabilities. |
| `PROVIDER-005` | Full / Constrained / Provider-managed tiers are declared by an adapter for a real run. Nothing here executes through one. |
| `PROVIDER-006` | Preferring host tool execution, isolating delegated execution and falling back to reasoning-only is adapter behaviour at dispatch. No dispatch occurs here. |
| `PROVIDER-011` | Official-CLI-owned authentication versus PM-secured direct API credentials is an adapter and secret-store property. This concept holds no credentials and makes no auth call. |
| `PSCHED-004` | Dispatch-time revalidation of Plan hash, worktree, permission, provider/account/model, tools, window and quota needs a server-owned timer and a live provider. The concept models Held/Failed states and their reasons but never dispatches. |
| `PSCHED-007` | Provider/model/account unavailability AT DISPATCH needs a live adapter. The concept records requested vs effective identity and refuses substitution in its own records, but makes no provider call. |
| `QMAX-018` | Seven factory values (6 bases + Grill 25) must live in the generic project-scoped Settings transaction owner. This concept holds them as module constants (QBASE/QGRILL); there is no Settings store, no search and no reset here. Concept models the values; native ownership is unproven. |
| `QMAX-019` | Migration of untouched factory values (BrainStorm 15 -> 20, Grill +10 -> +25) while preserving explicit user overrides needs a Settings store with a source-of-value field and a migration runner. No migration executes in a file:// page. |
| `ROOM-006` | The transcript is rebuilt identically from the seed, which is the concept's stand-in for durability. Surviving a real host restart needs the storage engine; nothing here persists a run across a page reload. Evidence: {"before":5,"after":5} |
| `SCHED-012` | Both idempotency domains carry keys and that is checkable here. Surviving client closure and a host restart while dispatching exactly once needs the server-owned scheduler; no dispatch runs in this concept. Evidence: {"msgKeys":true,"buildKeys":true} |
| `SMSG-006` | The Sent card links a dispatched_message_id and that link is checkable here, but the DISPATCH itself — inserting the user message at real dispatch time — needs a server-owned timer and the real message pipeline. Concept models the state; it does not run it. Evidence: [{"id":"sm-sent-rollout","msg":"… |
| `SMSG-011` | Requires a live provider to make an explicitly selected model unavailable at dispatch. The concept records requested vs effective route and refuses substitution in its own records, but makes no provider call. |
| `TITLE-008` | Excluding code, paths, URLs, hashes, commands and recognized identifiers from spellcheck is the host spellchecker’s behaviour. The concept sets spellcheck="true" on the composer and adds no Assistant-side checker, so there is nothing here that could implement or violate the exclusion list. |
| `WONDER-008` | Wonderer early and Grill Me near discovery closure inside PRD Builder is the PRD owner's flow. This concept is the Assistant chat surface and hosts no PRD Builder; it can neither implement nor violate that ordering. |
| `WONDER-009` | Wonderer at topic entry and Grill Me near topic closure with global duplicate prevention is the Planning Wizard owner's flow. The Assistant hands off with a receipt and does not run the Wizard. |

## Superseded rows

| v2 requirement | superseded by | proof the replacement is what the surface holds |
|---|---|---|
| `BRAIN-002` | `QMAX-002` | {"retired": "BrainStorm baseline 15", "active": {"base": 20, "def": 20}, "note": "The correction retires 15 and sets 20. Both the Plan owner and the BrainStorm definition hold 20."} |
| `BRAIN-003` | `QMAX-003` | {"retired": "Grill Me default extension +10", "active": {"grill": 25, "def": 25}, "note": "The correction retires +10 and sets exactly +25."} |

## Unclosed rows

| requirement | verdict | evidence |
|---|---|---|
| `CONCEPT-016` | **failed** | {"missing": [], "stale": [{"f": "REPAIR_STATUS.md", "found": ["5a48b5f7db37c57e"], "current": "f2416f0962e51295"}], "current": "f2416f0962e51295"} |

## Full matrix

### ATT — v2 · Attachments, files and artifacts

blocked: 1  pass: 13

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `ATT-001` | pass | FileManager.md | attach bottom-left, tray above | n/a | {"insideBottomLeft": true, "trayAbove": null, "hasTray": false} |
| `ATT-002` | pass | FileManager.md | nine origins distinguished | n/a | {"origins": ["uploaded_snapshot", "project_live_reference", "project_frozen_snapshot", "generated_artifact", "external_live_reference", "external_snapshot", "clipboard", "browser_capture", "source_control_objec… |
| `ATT-003` | pass | FileManager.md | top-edge tracer, not a progress bar | n/a | {"tracer": true, "conventionalBar": false} |
| `ATT-004` | pass | FileManager.md | hover X, body opens | n/a | {"remove": 1, "open": 7, "hoverGated": true} |
| `ATT-005` | pass | FileManager.md | metadata hover-gated | n/a | {"cards": 7, "chrome": 4, "permanentMeta": 0, "hoverKeys": 22} |
| `ATT-006` | pass | FileManager.md | failure keeps siblings, offers retry | n/a | {"failed": {"thread": "attachments", "msg": "attachments-01", "id": "att-mtmcfw00-7-pixdr", "origin": "uploaded_snapshot", "kind": "archive", "state": "failed", "name": "legacy-project.pkg"}, "buttons": ["", "C… |
| `ATT-007` | pass | FileManager.md | live refs keep the materialized revision | n/a | [{"id": "att-mtmcfvzz-1-p0usv", "rev": null, "hash": "360ab09c340d", "mat": 1}, {"id": "att-mtmcfw00-5-rez8q", "rev": null, "hash": "3748bc9034f8", "mat": 1}] |
| `ATT-008` | pass | FileManager.md | changed disclosure does not rewrite history | n/a | [{"id": "att-mtmcfvzz-1-p0usv", "name": "src/analytics/queries.rs", "captured": "360ab09c340d", "fields": []}] |
| `ATT-009` | pass | FileManager.md | download returns the exact stored version | n/a | {"label": "Download exact version"} |
| `ATT-010` | pass | FileManager.md | bounded folder manifest | n/a | {"shown": 4, "total": 6, "truncated": true} |
| `ATT-011` | pass | FileManager.md | More Info fields | n/a | {"missing": [], "len": 1177} |
| `ATT-012` | pass | FileManager.md | visibility != inclusion | n/a | {"statuses": ["materialized", "partially_materialized", "blocked_by_policy"]} |
| `ATT-013` | blocked | FileManager.md | retention holds | needs a storage engine | Deletion refusal while an artifact is still referenced by another message, Plan, Goal, workflow, evidence or hold requires a real artifact store with reachability. Nothing is deleted or held in a file:// page. |
| `ATT-014` | pass | FileManager.md | no second transfer/artifact store | n/a | {"attachmentOwners": ["PM56_ATTACHMENTS"], "api": ["version", "findAttachment", "originMeta", "ORIGINS", "PROCESS_LABELS", "attachmentAdd", "addFileReferenceAlias", "freezeFolderForSchedule", "sources"]} |

### AUTH — v2 · Authority and preservation

pass: 5

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `AUTH-001` | pass | assistant-chat-design.md | precedence stated in the companion | n/a | {"hasSection": true} |
| `AUTH-002` | pass | assistant-chat-design.md | modified in place | n/a | {"modules": 20} |
| `AUTH-003` | pass | assistant-chat-design.md | generated files never hand-edited | n/a | {"out": "Build check passed. Both deliverables match sha256 f2416f0962e51295."} |
| `AUTH-004` | pass | assistant-chat-design.md | three readiness columns | n/a | {"len": 15504} |
| `AUTH-005` | pass | assistant-chat-design.md | accessibility out of scope, nothing removed | n/a | {"app.js": 28, "plans.js": 8, "collaboration.js": 12, "todos.js": 13, "scheduling.js": 9} |

### BRAIN — v2 · BrainStorm

pass: 14  superseded: 2

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `BRAIN-001` | pass | Collaborative_Workflows.md | third Deep Plan option, one Plan out | n/a | {"isDeepChoice": true, "runs": 2, "plansPerRun": [0, 0]} |
| `BRAIN-002` | superseded | Collaborative_Workflows.md | retired by the correction | n/a | {"retired": "BrainStorm baseline 15", "active": {"base": 20, "def": 20}, "note": "The correction retires 15 and sets 20. Both the Plan owner and the BrainStorm definition hold 20."} |
| `BRAIN-003` | superseded | Collaborative_Workflows.md | retired by the correction | n/a | {"retired": "Grill Me default extension +10", "active": {"grill": 25, "def": 25}, "note": "The correction retires +10 and sets exactly +25."} |
| `BRAIN-004` | pass | Collaborative_Workflows.md | shared allowance, no mid-flow reset | n/a | {"beforeAsked": 3, "afterAsked": 3, "beforeEff": 20, "afterEff": 45} |
| `BRAIN-005` | pass | Collaborative_Workflows.md | answered and duplicate are not repeated | n/a | {"first": true, "again": "already_charged", "prior": "reused_answer", "asked": 1, "reused": 1} |
| `BRAIN-006` | pass | Collaborative_Workflows.md | researchable facts go to agents | n/a | {"reason": "research_resolved", "asked": 0, "research": 1} |
| `BRAIN-007` | pass | Collaborative_Workflows.md | read-only against the project | n/a | {"readOnly": true, "tools": null, "writes": 0} |
| `BRAIN-008` | pass | Collaborative_Workflows.md | temporary isolated provisioning is permission-gated | n/a | {"provisioning": [{"id": "rc-1", "capability": "provider-status-checker CLI", "state": "ready", "scope": "run-scoped, temporary", "permissionRequestRef": "perm-req-771", "cleanupRequired": true, "note": "Resolv… |
| `BRAIN-009` | pass | Collaborative_Workflows.md | persistent install needs approval | n/a | {"installs": 0} |
| `BRAIN-010` | pass | Collaborative_Workflows.md | blind independent proposals | n/a | {"independent": true, "phase": "vote"} |
| `BRAIN-011` | pass | Collaborative_Workflows.md | debate, challenge, hybrids | n/a | {"rounds": 2, "hybrid": true} |
| `BRAIN-012` | pass | Collaborative_Workflows.md | vote records the whole shape | n/a | {"tally": ["support", "oppose", "abstain", "ineligible", "denominator", "support_pct", "quorum", "tie"], "voting": "evidence_weighted", "dissent": true, "constraints": true} |
| `BRAIN-013` | pass | Collaborative_Workflows.md | hard constraint disqualifies | n/a | {"hasConstraintGround": true, "field": true} |
| `BRAIN-014` | pass | Collaborative_Workflows.md | synthesis preserves dissent | n/a | {"dissent": 1, "rejected": "single-table with partition pruning", "unresolved": "Compaction ownership remains disputed and is retained, not treated as agreement."} |
| `BRAIN-015` | pass | Collaborative_Workflows.md | card survives the linked Plan | n/a | {"card": true, "panel": true} |
| `BRAIN-016` | pass | Collaborative_Workflows.md | Wonderer and Grill are additive | n/a | {"additive": [{"kind": "wonderer", "required": false}, {"kind": "wonderer", "required": false}, {"kind": "grill_me", "required": false}], "additiveRequired": 0} |

### BROWSER — v2 · Browser capture and DevTools

pass: 9

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `BROWSER-001` | pass | Section15_MVP_Promoted_Features_Spec.md | four capture paths | n/a | {"full": true, "region": true, "component": true, "menu": true} |
| `BROWSER-002` | pass | Section15_MVP_Promoted_Features_Spec.md | isolated immediate payload | n/a | {"hadShot": true, "unchanged": true} |
| `BROWSER-003` | pass | Section15_MVP_Promoted_Features_Spec.md | instruction bar + persisted mode | n/a | {"bar": true, "menu": true, "mode": "send"} |
| `BROWSER-004` | pass | Section15_MVP_Promoted_Features_Spec.md | three component modes | n/a | {"modes": ["insert", "list", "send"]} |
| `BROWSER-005` | pass | Section15_MVP_Promoted_Features_Spec.md | numbered list, distinct from the queue | n/a | {"listActions": ["bc-list-remove", "bc-list-move"], "listMode": true, "queueSurface": true} |
| `BROWSER-006` | pass | Section15_MVP_Promoted_Features_Spec.md | insert sends nothing | n/a | {"before": 59, "after": 59, "mode": "insert"} |
| `BROWSER-007` | pass | Section15_MVP_Promoted_Features_Spec.md | context retains identity | n/a | {"keys": ["id", "demo", "capturedAt", "session", "page", "locator", "fragileLocator", "tag", "role", "name", "text", "component", "source", "rect", "parentPath", "style", "boundedHtml", "crop", "stableId", "fre… |
| `BROWSER-008` | pass | Section15_MVP_Promoted_Features_Spec.md | ordinary DevTools access | n/a | {"devtools": true, "policy": {"navigation": "on", "tabs": "on", "dom": "on", "styles": "on", "console": "on", "network": "ask", "sourceMaps": "on", "performance": "ask", "storage": "ask", "screenshots": "on", "… |
| `BROWSER-009` | pass | Section15_MVP_Promoted_Features_Spec.md | protected auth excluded | n/a | {"sessions": [{"id": "sess-ordinary", "protectedAuth": false}, {"id": "sess-auth", "protectedAuth": true}], "protectedOnes": 1, "refusalBefore": 0, "refusalAfter": 1, "refused": true} |

### BSD — v2 · Back Seat Driver

blocked: 1  pass: 19

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `BSD-001` | pass | Back_Seat_Driver.md | separate passive advisor | n/a | {"inCollab": false, "kinds": ["crew", "brainstorm", "review", "chat_room"], "mode": "auto"} |
| `BSD-002` | pass | Back_Seat_Driver.md | Off/Auto/On, Auto default | n/a | {"mode": "auto", "setters": ["bsd-set-mode"]} |
| `BSD-003` | pass | Back_Seat_Driver.md | deterministic triggers | n/a | {"cooldownTurns": 3, "catchUpSeconds": 30, "sensitivity": "balanced"} |
| `BSD-004` | pass | Back_Seat_Driver.md | isolated session, model, cursor, epoch, Usage | n/a | {"model": {"requested": "Default resolver", "effective": "Claude Sonnet 4.6"}, "cursor": 12, "generation": 14, "usageKeys": ["calls", "noCalls", "held", "cleared", "emitted", "suppressed", "timeouts", "quotaPau… |
| `BSD-005` | pass | Back_Seat_Driver.md | bounded redacted delta + refs | n/a | {"turns": 4} |
| `BSD-006` | pass | Back_Seat_Driver.md | held and reconfirmed | n/a | {"held": ["bsd-f2"]} |
| `BSD-007` | pass | Back_Seat_Driver.md | synchronous safe point delivers | n/a | {"emitted": [{"id": "bsd-f1", "raised": 11, "delivered": 11}]} |
| `BSD-008` | pass | Back_Seat_Driver.md | stale label, cannot fail primary | n/a | {"sim": "bsd-simulate-failure", "before": {"plan": "building", "label": "Building…"}, "after": {"plan": "building", "label": "Building…"}, "bsdState": "failed", "quarantined": true} |
| `BSD-009` | pass | Back_Seat_Driver.md | three severities, no blocker | n/a | {"sev": ["critical", "concern", "nit"]} |
| `BSD-010` | pass | Back_Seat_Driver.md | stable identity, closed stays closed | n/a | {"ids": ["bsd-f1", "bsd-f2", "bsd-f3", "bsd-f4"], "cleared": ["bsd-f3"]} |
| `BSD-011` | pass | Back_Seat_Driver.md | read-only tools | n/a | {"acts": ["bsd-set-mode", "bsd-open-details", "bsd-configure-stages", "bsd-close-dialog", "bsd-toggle-stage", "bsd-open-finding", "bsd-open-transcript", "bsd-open-usage", "bsd-dismiss", "bsd-advance-generation"… |
| `BSD-012` | pass | Back_Seat_Driver.md | quarantine then pause | n/a | {"quarantined": false} |
| `BSD-013` | pass | Back_Seat_Driver.md | failure cannot block primary | n/a | {"failures": 1, "quotaPauses": 1, "state": "idle"} |
| `BSD-014` | pass | Back_Seat_Driver.md | epoch fencing across resets | n/a | {"generation": 14, "cursor": 12} |
| `BSD-015` | pass | Back_Seat_Driver.md | cooldown and bounded catch-up | n/a | {"cooldownTurns": 3, "catchUpSeconds": 30} |
| `BSD-016` | pass | Back_Seat_Driver.md | ten stages | n/a | {"have": ["prd_builder", "planning_wizard", "ledger", "plan_compile", "worknode_create", "worknode_audit", "execution", "verification", "remediation", "certification"], "missing": []} |
| `BSD-017` | pass | Back_Seat_Driver.md | modal freezes stage bindings | n/a | {"bound": ["prd_builder", "planning_wizard", "ledger", "worknode_audit", "execution"]} |
| `BSD-018` | pass | Back_Seat_Driver.md | Context compact + details truthful | n/a | {"mentionsBsd": true, "modeShown": false, "len": 2265} |
| `BSD-019` | pass | Back_Seat_Driver.md | distinct Usage | n/a | {"missing": [], "usage": {"calls": 24, "noCalls": 9, "held": 1, "cleared": 1, "emitted": 1, "suppressed": 1, "timeouts": 0, "quotaPauses": 1, "failures": 1, "inputTokens": 41200, "outputTokens": 3800, "costUsd"… |
| `BSD-020` | blocked | Back_Seat_Driver.md | command/event/storage authority closed | needs a native dispatcher | BSD command, event, storage and wiring authority closure is a registry property of the implementation branch. This concept renders BSD state and its policy; it registers no native command and admits no event. |

### COLLAB — v2 · Shared collaborative workflows

pass: 10

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `COLLAB-001` | pass | Collaborative_Workflows.md | one shared foundation | n/a | {"kinds": ["crew", "brainstorm", "review", "chat_room"], "uniformShape": true, "sample": ["artifacts", "blockedReason", "brainstorm", "chatRoom", "completedAt", "config", "config_fingerprint", "coordinator", "c… |
| `COLLAB-002` | pass | Collaborative_Workflows.md | modal populated from Settings defaults | n/a | {"crew": {"rows": 3, "fromDefaults": true}, "brainstorm": {"rows": 4, "fromDefaults": true}, "review": {"rows": 3, "fromDefaults": true}, "chat_room": {"rows": 4, "fromDefaults": true}} |
| `COLLAB-003` | pass | Collaborative_Workflows.md | requested/effective on every participant | n/a | {"n": 31, "missing": []} |
| `COLLAB-004` | pass | Collaborative_Workflows.md | no silent substitution | n/a | {"subbed": []} |
| `COLLAB-005` | pass | Collaborative_Workflows.md | card, detail, panel, Activity domain | n/a | {"card": true, "expand": true, "panel": true, "domains": ["goal", "todo", "subagents", "crew", "changes", "artifacts"]} |
| `COLLAB-006` | pass | Collaborative_Workflows.md | participant rows open transcripts | n/a | {"open": true, "close": true} |
| `COLLAB-007` | pass | Collaborative_Workflows.md | ordinary composer with chrome | n/a | {"boxes": 1, "dest": {"kind": "workflow", "destinationKind": "crew", "refId": "crew-query-perf", "participantId": null, "label": "Crew · Crew · Query Performance Rollout", "detail": "3 participants", "glyph": "… |
| `COLLAB-008` | pass | Collaborative_Workflows.md | pause/resume/cancel keep truth | n/a | {"paused": "paused", "resumed": "running", "canceled": "canceled", "vocab": ["configuring", "running", "paused", "blocked", "completed", "canceled", "failed"], "msgsKept": true, "artsKept": true} |
| `COLLAB-009` | pass | Collaborative_Workflows.md | ceiling bounded, no self-authorization | n/a | {"refusal": true, "selfAuth": []} |
| `COLLAB-010` | pass | Settings_System.md | four manager tabs | n/a | ["brainstorm", "chat_room", "crew", "review"] |

### COMPOSER — v2 · Composer persistence and targeting

pass: 11

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `COMPOSER-001` | pass | assistant-chat-design.md | one buffer per thread | n/a | {"distinct": true, "aThread": "query", "bThread": "plain", "same": true} |
| `COMPOSER-002` | pass | assistant-chat-design.md | survives switch, no draft UI | needs durable store | {"text": "unsent text", "draftUi": 0, "persisted": true, "key": "pm56-composer-buffers.v1"} |
| `COMPOSER-003` | pass | assistant-chat-design.md | attachments persist independently | n/a | {"text": "", "atts": 1, "browser": 1} |
| `COMPOSER-004` | pass | assistant-chat-design.md | clears only after admission | n/a | {"before": "about to send", "msgsBefore": 56, "msgsAfter": 58, "after": ""} |
| `COMPOSER-005` | pass | assistant-chat-design.md | history only when empty | n/a | {"hasText": true, "blockedByPending": "attachment", "clear": ""} |
| `COMPOSER-006` | pass | assistant-chat-design.md | text-only history | n/a | {"n": 0, "allStrings": true, "anyAttachment": false} |
| `COMPOSER-007` | pass | assistant-chat-design.md | one composer, no second box | n/a | {"boxes": 1, "anyTextarea": 1, "dest": "workflow"} |
| `COMPOSER-008` | pass | assistant-chat-design.md | destination ribbon chrome | n/a | {"ribbon": true, "ribbonText": "To: Crew · Crew · Query Performance Rollout · 3 participants · 3", "hasGlyph": true, "placeholder": "Ask Puppet Master, use natural language, or type / for commands…"} |
| `COMPOSER-009` | pass | assistant-chat-design.md | destination change preserves content | n/a | {"text": "content that must survive", "atts": 1, "hadDest": true} |
| `COMPOSER-010` | pass | assistant-chat-design.md | ended target cannot silently redirect | n/a | {"destStill": "crew-query-perf", "text": "text bound to a workflow", "redirected": false} |
| `COMPOSER-011` | pass | assistant-chat-design.md | queue max two, FIFO, no auto-send | n/a | {"queue": 0, "rows": 0, "edit": false, "sendNow": false, "hasStop": false} |

### CREW — v2 · Crew and Crew Auto

pass: 7

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `CREW-001` | pass | Collaborative_Workflows.md | full crew configuration | n/a | {"missing": [], "keys": ["coordinator", "assignmentStrategy", "memberCount", "parallelism", "autoEnabled", "autoComplexity", "autoMaxMembers", "contextSharing", "synthesisPolicy", "timeLimitMinutes", "tokenLimi… |
| `CREW-002` | pass | Collaborative_Workflows.md | crew executes, not discussion-only | n/a | {"withOutputs": 1, "total": 2, "rooms": 2, "roomOutputs": 0} |
| `CREW-003` | pass | Collaborative_Workflows.md | Crew Auto is a checkable submenu item | n/a | {"toggle": true, "enabled": false} |
| `CREW-004` | pass | Collaborative_Workflows.md | modal before the check | n/a | {"before": false, "afterToggle": false, "opensModal": true, "autoMode": true} |
| `CREW-005` | pass | Collaborative_Workflows.md | criteria cannot widen authority | n/a | {"unchanged": true} |
| `CREW-006` | pass | Collaborative_Workflows.md | Build With Crew binds version + To-Dos | n/a | {"plan": "ap-index", "version": 5, "current": 5} |
| `CREW-007` | pass | Collaborative_Workflows.md | participant rows open transcripts | n/a | {"rows": 3, "participants": 3, "toggled": true} |

### DPLAN — v2 · Deep Plan

pass: 10

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `DPLAN-001` | pass | Assistant_Plan_Runtime.md | exactly Thorough/Exhaustive/BrainStorm | n/a | {"deep": [], "bases": ["brainstorm", "deep_exhaustive", "deep_thorough"]} |
| `DPLAN-002` | pass | Assistant_Plan_Runtime.md | run-scoped ledger | n/a | {"backend": "ledger_bound", "ledger": {"id": "apl-20260903-001", "scope": "run", "entries": 6}} |
| `DPLAN-003` | pass | Assistant_Plan_Runtime.md | ledger produces a readable document | n/a | {"len": 3093, "hasHeadings": true, "hasSteps": true} |
| `DPLAN-004` | pass | Assistant_Plan_Runtime.md | agent-mediated revision before Build | n/a | {"revisable": [{"id": "ap-index", "revise": true}]} |
| `DPLAN-005` | pass | Assistant_Plan_Runtime.md | PlanUnits then To-Dos at Build | n/a | {"units": 6, "materialized": {"at": "9:41 PM", "validated": true, "globalIndex": false, "worknodes": 0, "scope": "ap-cache@V1", "count": 6}, "todosFrom": "planunits", "todos": 8} |
| `DPLAN-006` | pass | Assistant_Plan_Runtime.md | scoped, not global index | n/a | {"m": {"at": "9:41 PM", "validated": true, "globalIndex": false, "worknodes": 0, "scope": "ap-cache@V1", "count": 6}, "scope": "ap-cache@V1"} |
| `DPLAN-007` | pass | Assistant_Plan_Runtime.md | no NodeSeeds/WorkNodes/Compile/SpecLock/Orchestrator | n/a | {"worknodes": 0, "orchestrator": false, "unitsWorknodes": 0, "keys": []} |
| `DPLAN-008` | pass | Assistant_Plan_Runtime.md | promotion carries the evidence | n/a | {"text": "Sent to Planning WizardSession cache stampede · V1 · sha-demo:051c3a08Receipt PWH-ap-cache-V1 · PRD Builder bypassed · Planning Wizard now owns the PlanningRun, Plan Pack, approval, Plan Compile and O… |
| `DPLAN-009` | pass | Assistant_Plan_Runtime.md | Exhaustive scope | n/a | {"bases": {"quick": 3, "standard": 6, "thorough": 8, "deep_thorough": 10, "deep_exhaustive": 15, "brainstorm": 20}, "research": "maximum", "proposals": true} |
| `DPLAN-010` | pass | Assistant_Plan_Runtime.md | BrainStorm is a strict superset | n/a | {"brainstorm": 20, "exhaustive": 15, "extras": {"debate": 2, "voting": "evidence_weighted", "dissent": true}} |

### DRY — v2 · DRY, commands, wiring and proof

blocked: 4  pass: 4

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `DRY-001` | pass | DRY_Rules.md | one owner per semantic system | n/a | {"globals": 27, "dupes": []} |
| `DRY-002` | pass | DRY_Rules.md | mutating action is registered or local view | n/a | {"unregistered": 22, "orphanModuleActions": []} |
| `DRY-003` | blocked | DRY_Rules.md | typed command contract | needs a native dispatcher | Typed request/result/error/availability with one handler, currentness, permission and idempotency is a native-dispatcher property. Every cmd.* this concept names is handler_unavailable. |
| `DRY-004` | blocked | DRY_Rules.md | event admission or receipt-only | needs an event registry | Event Authority admission is a registry property of the implementation branch. This concept emits no events; its durable effects are fixture mutations plus visible receipts. |
| `DRY-005` | blocked | DRY_Rules.md | forward and reverse wiring coverage | needs the wiring matrix | Forward and reverse GUI wiring coverage is produced from Wiring_Matrix.production.json against a source-hashed dispatcher, neither of which exists in this folder. |
| `DRY-006` | pass | DRY_Rules.md | settings route, runtimes own records | n/a | {"leaks": [], "kinds": ["crew", "brainstorm", "review", "chat_room"]} |
| `DRY-007` | blocked | DRY_Rules.md | generated governance refreshed last | needs repository gates | Ordering of generated index/shard/evidence/governance refreshes is a Plans/** repository-gate property, outside this concept folder. |
| `DRY-008` | pass | DRY_Rules.md | packet/canonical/concept/native not conflated | n/a | {"readiness": 15504, "scoped": true} |

### FEATURE — v2 · Teach/Teacher/memory/Debug/ELI5/Revert/Lens

pass: 10

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `FEATURE-001` | pass | assistant-chat-design.md | Teach is durable teaching | n/a | {"records": 1, "actions": ["af-teach-open", "af-teach-narrow", "af-teach-set-scope", "af-teach-cancel", "af-teach-capture", "af-teach-lock", "af-teach-revoke"]} |
| `FEATURE-002` | pass | assistant-chat-design.md | Teacher is a Persona, not Teach | n/a | {"teacherActions": [], "teachActions": ["af-teach-open", "af-teach-narrow", "af-teach-set-scope", "af-teach-cancel", "af-teach-capture", "af-teach-lock", "af-teach-revoke"]} |
| `FEATURE-003` | pass | assistant-chat-design.md | automatic memory at boundaries | n/a | {"memory": ["auto", "nextSeq", "simIndex"]} |
| `FEATURE-004` | pass | assistant-chat-design.md | locked memory not silently overridden | n/a | {"locked": ["af-teach-seed-1"]} |
| `FEATURE-005` | pass | assistant-chat-design.md | ELI5 default + per-thread override | n/a | {"appDefault": false, "perThread": {}} |
| `FEATURE-006` | pass | assistant-chat-design.md | ELI5 changes style only | n/a | {"toggle": "af-eli5-toggle", "hashSame": true, "mdSame": true, "eli5": {"appDefault": false, "perThread": {"plain": true}}} |
| `FEATURE-007` | pass | assistant-chat-design.md | Debug is a primary mode with stages | n/a | {"mode": "Debug", "phases": [0, 1, 2, 3, 4, 5, 6, 7], "finalPhase": 7, "status": "attention_required"} |
| `FEATURE-008` | pass | assistant-chat-design.md | Investigation Context and recovery | n/a | {"evidenceKinds": ["browser", "terminal", "dap"], "bundleField": true, "attention": true, "redacted": true, "target": true} |
| `FEATURE-009` | pass | assistant-chat-design.md | whole-turn Revert, distinct from Rewind | n/a | {"revert": ["af-revert-seed", "af-revert-preview", "af-revert-confirm", "af-revert-retry"], "rewind": ["rewind-to-message", "restore-rewind"], "manifests": 0} |
| `FEATURE-010` | pass | assistant-chat-design.md | Context Lens at the top, not the wand | n/a | {"lens": true, "inHeader": true, "inWand": false, "hasModule": true} |

### GOAL — v2 · Simplified Goal Runtime

blocked: 2  pass: 12

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `GOAL-001` | pass | Goal_Runtime_System.md | objective + revision + four states | n/a | {"keys": ["demo", "id", "projectId", "thread", "objective", "revision", "status", "blockedReason", "activeRunRef", "createdAt", "updatedAt", "currentnessHash", "stopEpoch", "mode", "revisions", "continuations"]… |
| `GOAL-002` | pass | Goal_Runtime_System.md | no retired fields | n/a | {"present": [], "keys": ["demo", "id", "projectId", "thread", "objective", "revision", "status", "blockedReason", "activeRunRef", "createdAt", "updatedAt", "currentnessHash", "stopEpoch", "mode", "revisions", "… |
| `GOAL-003` | pass | Goal_Runtime_System.md | internal use, driven by text only | n/a | {"kinds": ["user_request", "agent_requested_by_user", "plan_build", "internal_workflow"], "internal": true, "lineage": true} |
| `GOAL-004` | pass | Goal_Runtime_System.md | workflow state stays with its owner | n/a | {"goalKeys": ["demo", "id", "projectId", "thread", "objective", "revision", "status", "blockedReason", "activeRunRef", "createdAt", "updatedAt", "currentnessHash", "stopEpoch", "mode", "revisions", "continuatio… |
| `GOAL-005` | pass | Goal_Runtime_System.md | one turn is not completion | n/a | {"continuations": ["continue", "continue", "continue"], "status": "active"} |
| `GOAL-006` | pass | Goal_Runtime_System.md | manual stop beats every auto path | n/a | {"status": "canceled", "errors": ["canceled_is_terminal", "canceled_is_terminal", "canceled_is_terminal", "canceled_is_terminal"]} |
| `GOAL-007` | pass | Goal_Runtime_System.md | direct edit in Activity Detail | n/a | {"edit": ["goal-edit", "goal-save", "goal-open-editor"], "inDom": [], "editor": "function"} |
| `GOAL-008` | pass | Goal_Runtime_System.md | agent replacement needs approval | n/a | {"propose": ["goal-demo-proposal", "goal-approve-proposal", "goal-deny-proposal"]} |
| `GOAL-009` | pass | Goal_Runtime_System.md | explicit request needs no second approval | n/a | {"sources": ["user_direct", "user_direct", "agent_proposed_user_approved"]} |
| `GOAL-010` | pass | Goal_Runtime_System.md | hover controls | n/a | {"pause": true, "resume": true, "cancel": true, "edit": true} |
| `GOAL-011` | pass | Goal_Runtime_System.md | Activity domain, never a card | n/a | {"inTranscript": 0, "anywhere": 0} |
| `GOAL-012` | pass | Goal_Runtime_System.md | cancel keeps minimal history | n/a | {"status": "canceled", "history": ["created", "canceled"], "objective": true} |
| `GOAL-013` | blocked | Goal_Runtime_System.md | no concurrent provider goal loop | needs an adapter | Proving that a provider-native goal loop cannot run alongside the PM continuation needs a live adapter exposing that loop. No adapter runs in this concept. |
| `GOAL-014` | blocked | Goal_Runtime_System.md | v1 migration without data loss | needs a storage engine | Migrating complex v1 Goal records (phases, tranches, child goals, budgets) into the simple record without data loss needs a storage engine and a migration runner. The concept ships only the post-migration shape… |

### GUI — v2 · Concept and GUI integration

pass: 11

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `GUI-001` | pass | FinalGUISpec.md | existing decisions preserved | n/a | {"themes": 8, "recipes": 8, "lens": true, "orbit": true, "menus": true, "history": true, "stop": true} |
| `GUI-002` | pass | FinalGUISpec.md | the nine Activity domains | n/a | {"domains": ["goal", "todo", "subagents", "crew", "changes", "artifacts", "brainstorm", "review", "chat_room"], "missing": []} |
| `GUI-003` | pass | FinalGUISpec.md | Goal/To-Dos Activity-only; workflows and Plans have cards | n/a | {"goalCards": 0, "todoCards": 0, "planCards": 3, "collabCards": 1} |
| `GUI-004` | pass | FinalGUISpec.md | Rich default, exact labels | n/a | {"view": "rich", "labels": ["Build", "Completed", "Canceled"]} |
| `GUI-005` | pass | FinalGUISpec.md | cards expand and open panels | n/a | {"expand": true, "panel": true, "more": true} |
| `GUI-006` | pass | FinalGUISpec.md | participant rows fully clickable | n/a | {"rows": 3, "tag": "BUTTON", "wholeRow": true} |
| `GUI-007` | pass | FinalGUISpec.md | tray, ribbon and quota strip coexist | n/a | {"above": [{"cls": "cs-ribbon", "top": 702, "h": 33}, {"cls": "att-tray", "top": 735, "h": 73}, {"cls": "att-tray-row", "top": 744, "h": 64}], "clipped": [], "composerTop": 844} |
| `GUI-008` | pass | FinalGUISpec.md | tokens, inline SVG, no left accent bars | n/a | {"out": [{"f": "plans.css", "hardColors": 0, "accents": []}, {"f": "collaboration.css", "hardColors": 0, "accents": []}, {"f": "todos.css", "hardColors": 0, "accents": []}, {"f": "scheduling.css", "hardColors":… |
| `GUI-009` | pass | FinalGUISpec.md | Chat updates replaces obsolete truth | n/a | {"saysReplace": true, "changelog": false} |
| `GUI-010` | pass | FinalGUISpec.md | both outputs rebuilt and byte-checked | n/a | {"bytes": 2726526, "identical": true} |
| `GUI-011` | pass | FinalGUISpec.md | no toast-only simulation | n/a | {"before": {"plan": "ready", "todos": 16}, "after": {"plan": "building", "todos": 22, "approved": true}} |

### PLAN — v2 · Regular Assistant Plan

pass: 18

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PLAN-001` | pass | Assistant_Plan_Runtime.md | exactly Quick/Standard/Thorough | n/a | {"opts": ["Quick", "Standard", "Thorough"], "deep": ["Thorough", "Exhaustive", "BrainStorm"], "planGrill": 0, "deepGrill": 1} |
| `PLAN-002` | pass | Assistant_Plan_Runtime.md | Rich default, Markdown toggle, exports | n/a | {"view": "rich", "hasToggle": true, "hasExport": true, "md": 2569} |
| `PLAN-003` | pass | Assistant_Plan_Runtime.md | read-only, agent-mediated Revise | n/a | {"editable": 0, "revise": true} |
| `PLAN-004` | pass | Assistant_Plan_Runtime.md | one current Plan per thread | n/a | {"byThread": {"query": ["ap-index"], "plan-deep": ["ap-cache"]}, "all": [{"id": "ap-index", "t": "query", "cur": true, "st": "ready"}, {"id": "ap-cache", "t": "plan-deep", "cur": true, "st": "building"}, {"id":… |
| `PLAN-005` | pass | Assistant_Plan_Runtime.md | one identity, Vn, immutable history | n/a | {"id": "ap-index", "versions": [1, 2, 3, 4, 5], "current": 5, "oldUnchanged": true} |
| `PLAN-006` | pass | Assistant_Plan_Runtime.md | one control, four labels | n/a | {"ready": "Build", "building": "Building…", "completed": "Completed", "canceled": "Canceled"} |
| `PLAN-007` | pass | Assistant_Plan_Runtime.md | Building… with secondary reason | n/a | {"label": "Building…", "attn": {"plan_run_id": "run-ap-cache-V1", "condition_kind": "window", "line": "Outside execution window", "tone": "info", "reason": "Outside the configured execution window (22:00–06:00)… |
| `PLAN-008` | pass | Assistant_Plan_Runtime.md | Regular creates document + To-Dos only | n/a | {"backend": "direct", "ledger": null, "planunits": null, "worknodes": [], "orchestrator": {"entered": false, "retired": true}} |
| `PLAN-009` | pass | Assistant_Plan_Runtime.md | Build freezes the exact context | n/a | {"version": 5, "hash": "sha-demo:869d26cb", "runtime": "Claude Sonnet 4.6", "permissions": "Auto", "worktree": "feature/query-index"} |
| `PLAN-010` | pass | Assistant_Plan_Runtime.md | Build is idempotent | n/a | {"after1": {"run": "run-ap-index-V5", "todos": 22}, "after2": {"run": "run-ap-index-V5", "todos": 22}, "secondControl": false} |
| `PLAN-011` | pass | Assistant_Plan_Runtime.md | Build With Crew opens a modal, starts atomically | n/a | {"before": {"status": "ready", "runs": 9}, "opened": true, "status": "ready", "runs": 9} |
| `PLAN-012` | pass | Assistant_Plan_Runtime.md | Build At binds exact version; revision invalidates | n/a | {"bound": {"v": 5, "h": "sha-demo:869d26cb"}, "after": {"version": 5, "hash": "sha-demo:869d26cb", "at": "22:10", "invalid": true, "invalidReason": "Bound to V5; the Plan is now V6. Rebind or reschedule explici… |
| `PLAN-013` | pass | Assistant_Plan_Runtime.md | Wizard handoff bypasses PRD | n/a | {"receipt": "PWH-ap-index-V5", "version": 5, "hash": "sha-demo:869d26cb"} |
| `PLAN-014` | pass | Named_Plan_System.md | not automatically a NamedPlan | n/a | [{"id": "ap-index", "named": null}, {"id": "ap-cache", "named": null}, {"id": "ap-auth", "named": null}, {"id": "ap-embeds", "named": null}, {"id": "ap-flags", "named": null}] |
| `PLAN-015` | pass | Assistant_Plan_Runtime.md | new Plan cancels the old, no Superseded | n/a | {"res": {"demo": true, "plan_id": "ap-index", "thread_id": "query", "title": "Tenant-scoped analytics read path", "strategy": "Thorough", "backend": "direct", "version": 5, "revisions": {"1": [{"t": "heading", … |
| `PLAN-016` | pass | Assistant_Plan_Runtime.md | goal-driven only on explicit request | n/a | [{"id": "ap-index", "topology": "agent"}, {"id": "ap-cache", "topology": "agent"}, {"id": "ap-auth", "topology": "agent"}, {"id": "ap-embeds", "topology": "agent"}, {"id": "ap-flags", "topology": "agent"}] |
| `PLAN-017` | pass | Assistant_Plan_Runtime.md | adherence binds to step and To-Do identity | n/a | {"mapped": 8, "total": 8, "planVersion": true} |
| `PLAN-018` | pass | Assistant_Plan_Runtime.md | material divergence needs Revise | n/a | {"kinds": [], "allowed": true, "n": 0} |

### PROVIDER — v2 · Provider control

blocked: 5  pass: 7

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PROVIDER-001` | pass | CLI_Bridged_Providers.md | PM owns the canonical objects | n/a | {"goal": true, "plan": true, "todo": true, "collab": true, "attachments": true} |
| `PROVIDER-002` | blocked | CLI_Bridged_Providers.md | disable/redirect/project/retain order | needs an adapter | The four-step disposition for a provider-native system needs a live adapter exposing one. No adapter runs in this concept. |
| `PROVIDER-003` | pass | CLI_Bridged_Providers.md | provider session ids are correlation only | n/a | {"runIds": ["crew-query-perf", "brainstorm-provider-failover", "review-orchestrator-boundary"], "sessionIds": ["sess-p-2-dxkd", "sess-p-4-h4b1", "sess-p-6-5e7s"], "distinct": true} |
| `PROVIDER-004` | blocked | CLI_Bridged_Providers.md | closed capability matrix | needs an adapter | A published adapter capability matrix with source and currentness is adapter-side. This concept exposes model rosters and permission ceilings, not adapter capabilities. |
| `PROVIDER-005` | blocked | CLI_Bridged_Providers.md | execution control tier disclosed | needs an adapter | Full / Constrained / Provider-managed tiers are declared by an adapter for a real run. Nothing here executes through one. |
| `PROVIDER-006` | blocked | CLI_Bridged_Providers.md | host tool execution preferred | needs an adapter | Preferring host tool execution, isolating delegated execution and falling back to reasoning-only is adapter behaviour at dispatch. No dispatch occurs here. |
| `PROVIDER-007` | pass | CLI_Bridged_Providers.md | provider state cannot mutate canon | n/a | {"accepted": false, "statuses": ["completed", "in_progress", "blocked", "pending", "skipped"]} |
| `PROVIDER-008` | pass | CLI_Bridged_Providers.md | independence evidence or disclosure | n/a | {"withSession": 18, "total": 18, "isolation": ["fresh"]} |
| `PROVIDER-009` | pass | CLI_Bridged_Providers.md | materialization described accurately | n/a | {"seen": ["materialized", "partially_materialized", "blocked_by_policy"]} |
| `PROVIDER-010` | pass | CLI_Bridged_Providers.md | reset truth labelled, never fabricated | n/a | [{"id": "qrc-query-perf", "truth": "unknown", "time": null, "confidence": null}] |
| `PROVIDER-011` | blocked | CLI_Bridged_Providers.md | credential ownership | needs an adapter | Official-CLI-owned authentication versus PM-secured direct API credentials is an adapter and secret-store property. This concept holds no credentials and makes no auth call. |
| `PROVIDER-012` | pass | CLI_Bridged_Providers.md | telemetry is not authority | n/a | {"consents": [{"enabled": false, "epoch": 0}]} |

### REVIEW — v2 · Review and Multi-Pass Review

pass: 12

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `REVIEW-001` | pass | Collaborative_Workflows.md | primary mode, two submenu choices | n/a | {"opts": ["Single Agent", "Multi-Pass Review"], "single": true, "multi": true} |
| `REVIEW-002` | pass | Collaborative_Workflows.md | fresh-context reviewer subagent | n/a | {"session": "sess-p-46-ep7x", "isolation": "fresh", "persona": "Reviewer", "model": "opus5"} |
| `REVIEW-003` | pass | Collaborative_Workflows.md | 1–8 reviewers, default 3, repeats allowed | n/a | {"count": 3, "repeated": true, "keys": ["strategy", "reviewerCount", "blindInitialPass", "peerCorroboration", "preserveDissent", "autoRepair", "timeLimitMinutes", "tokenLimit", "costLimitUsd"]} |
| `REVIEW-004` | pass | Collaborative_Workflows.md | unique attempt + frozen pack | n/a | [{"id": "review-orchestrator-boundary", "frozen": true, "hash": "a1c9f02e", "sessions": 3, "n": 3}, {"id": "run-47", "frozen": true, "hash": "a91c33f0", "sessions": 1, "n": 1}, {"id": "run-55", "frozen": true, … |
| `REVIEW-005` | pass | Collaborative_Workflows.md | concurrent and blind | n/a | [{"id": "review-orchestrator-boundary", "isolation": ["fresh"]}, {"id": "run-47", "isolation": ["fresh"]}, {"id": "run-55", "isolation": ["fresh"]}] |
| `REVIEW-006` | pass | Collaborative_Workflows.md | normalized without losing origin | n/a | {"n": 3, "keyed": true, "origins": true, "evidence": true} |
| `REVIEW-007` | pass | Collaborative_Workflows.md | four dispositions | n/a | {"votes": ["confirmed", "uncertain"], "dispositions": ["confirmed", "uncertain"]} |
| `REVIEW-008` | pass | Collaborative_Workflows.md | unresolved disagreement preserved | n/a | {"uncertain": [{"id": "f2", "dissent": "Reviewer 1 still holds this as a real minor finding; Reviewer 2 could not confirm it from the frozen pack. Recorded as uncertain rather than manufacturing agreement eithe… |
| `REVIEW-009` | pass | Collaborative_Workflows.md | different hashes cannot merge | n/a | {"frozen": "a1c9f02e", "stale": "f77e10bb", "excluded": 1, "mixed": false} |
| `REVIEW-010` | pass | Collaborative_Workflows.md | versioned artifact + concise summary | n/a | [{"id": "review-orchestrator-boundary", "artifacts": [{"kind": "review_report", "v": 2}], "messages": 3}, {"id": "run-47", "artifacts": [{"kind": "review_report", "v": 1}], "messages": 1}, {"id": "run-55", "art… |
| `REVIEW-011` | pass | Collaborative_Workflows.md | read-only, no auto repair | n/a | {"repair": [], "sendFindings": true, "toTodos": true} |
| `REVIEW-012` | pass | Collaborative_Workflows.md | explicit send or convert | n/a | {"before": 9, "after": 9} |

### ROOM — v2 · Chat Room

blocked: 1  pass: 5

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `ROOM-001` | pass | Collaborative_Workflows.md | discussion, distinct from crew | n/a | {"roomOutputs": 0, "roomMessages": 5, "crewKind": "crew", "roomKind": "chat_room"} |
| `ROOM-002` | pass | Collaborative_Workflows.md | full room configuration | n/a | {"missing": [], "keys": ["participantCount", "moderator", "moderatorPersona", "turnPolicy", "mentionsEnabled", "repliesEnabled", "tools", "maxRounds", "stopCondition", "output", "timeLimitMinutes", "costLimitUs… |
| `ROOM-003` | pass | Collaborative_Workflows.md | ordinary targeted composer | n/a | {"boxes": 1, "dest": {"kind": "workflow", "destinationKind": "chat_room", "refId": "chatroom-onboarding", "participantId": null, "label": "Chat Room · Chat Room · Onboarding Redesign Options", "detail": "3 part… |
| `ROOM-004` | pass | Collaborative_Workflows.md | no automatic To-Dos/Plans/Goals | n/a | {"before": {"todos": 0, "plans": 0}, "todos": 0, "plans": 0, "promote": true} |
| `ROOM-005` | pass | Collaborative_Workflows.md | promotion preserves lineage | n/a | {"before": 0, "after": 0, "lineage": []} |
| `ROOM-006` | blocked | Collaborative_Workflows.md | transcript survives restart | needs durable store | The transcript is rebuilt identically from the seed, which is the concept's stand-in for durability. Surviving a real host restart needs the storage engine; nothing here persists a run across a page reload. Evi… |

### SCHED — v2 · Scheduling and quota resume

blocked: 1  pass: 11

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `SCHED-001` | pass | Scheduling_and_Quota_Resume.md | Schedule Message in the wand | n/a | {"open": ["sched-open-message", "sched-create-message"]} |
| `SCHED-002` | pass | Scheduling_and_Quota_Resume.md | schedule freezes its inputs | n/a | {"missing": [], "sample": "sm-nightly-digest"} |
| `SCHED-003` | pass | Scheduling_and_Quota_Resume.md | Build At binds exact identity | n/a | [{"id": "bld-nightly-index", "target": "ap-index", "v": 5, "h": "399c6128"}, {"id": "bld-auth-nightly", "target": "ap-auth", "v": 2, "h": "6fe6b2f9"}, {"id": "bld-crew-embeds", "target": "ap-embeds", "v": 1, "h… |
| `SCHED-004` | pass | Scheduling_and_Quota_Resume.md | revision invalidates rather than retargets | n/a | {"before": [{"id": "bld-nightly-index", "v": 5, "st": "active"}, {"id": "bld-auth-nightly", "v": 2, "st": "invalidated"}, {"id": "bld-crew-embeds", "v": 1, "st": "active"}, {"id": "bld-flags-held", "v": 1, "st"… |
| `SCHED-005` | pass | Scheduling_and_Quota_Resume.md | windows, timezone, DST policy | n/a | [{"id": "bld-nightly-index", "kind": "recurring_window", "tz": "America/Chicago", "start": "22:00", "pause": "02:00", "days": [1, 2, 3, 4, 5], "wind": 600}, {"id": "bld-auth-nightly", "kind": "one_time", "tz": … |
| `SCHED-006` | pass | Scheduling_and_Quota_Resume.md | wind-down to a safe checkpoint | n/a | [{"id": "bld-nightly-index", "wind": 600, "missed": "hold"}, {"id": "bld-auth-nightly", "wind": 600, "missed": "hold"}, {"id": "bld-crew-embeds", "wind": 600, "missed": "hold"}, {"id": "bld-flags-held", "wind":… |
| `SCHED-007` | pass | Scheduling_and_Quota_Resume.md | recurrence resumes one run | n/a | [{"id": "bld-nightly-index", "resume": true, "stopsOnTerminal": true, "fired": 0}] |
| `SCHED-008` | pass | Scheduling_and_Quota_Resume.md | four reset-truth values | n/a | {"q": {"waiting": false, "reason": "Usage exhausted", "scope": "Anthropic work account", "resetAt": "10:00 PM", "resetInMinutes": 192, "resetSource": "provider reported", "resumeAutomatically": false, "userRese… |
| `SCHED-009` | pass | Scheduling_and_Quota_Resume.md | per-run consent, off by default | n/a | [{"id": "qrc-query-perf", "run": "run-query-perf", "enabled": false}] |
| `SCHED-010` | pass | Scheduling_and_Quota_Resume.md | auto-resume revalidates | n/a | [{"id": "bld-nightly-index", "elig": ["window", "quota", "permission", "eligible"]}, {"id": "bld-auth-nightly", "elig": ["window", "quota", "permission", "eligible"]}, {"id": "bld-crew-embeds", "elig": ["window… |
| `SCHED-011` | pass | Scheduling_and_Quota_Resume.md | manual stop overrides everything | n/a | {"stoppedField": true, "epochField": true, "stopped": false, "epoch": 0, "attemptAction": true} |
| `SCHED-012` | blocked | Scheduling_and_Quota_Resume.md | idempotent dispatch across restart | needs a real scheduler | Both idempotency domains carry keys and that is checkable here. Surviving client closure and a host restart while dispatching exactly once needs the server-owned scheduler; no dispatch runs in this concept. Evi… |

### TITLE — v2 · Thread title and spellcheck

blocked: 1  pass: 7

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `TITLE-001` | pass | assistant-chat-design.md | Default \| None \| explicit model | n/a | {"base": "default", "none": "none", "model": "model:sonnet46", "back": "default"} |
| `TITLE-002` | pass | assistant-chat-design.md | deterministic default resolver | n/a | {"attempts": [{"policy": "default", "route": "GPT-5 Mini · Work · openai-work", "outcome": "pending"}, {"policy": "default", "route": "GPT-5 Mini · Work · openai-work", "outcome": "generated"}]} |
| `TITLE-003` | pass | assistant-chat-design.md | explicit model has no silent fallback | n/a | {"outcome": "unavailable", "reason": "The configured model (not-a-real-model) is no longer in the roster.", "policy": "model:not-a-real-model", "substituted": false} |
| `TITLE-004` | pass | assistant-chat-design.md | bounded safe excerpt only | n/a | {"attempts": 2, "titles": ["Analyze the analytics query performance, use", "Analyze the analytics query performance, use"], "longest": 44, "carriesWholeMessage": false, "carriesAttachmentBody": false} |
| `TITLE-005` | pass | assistant-chat-design.md | manual rename locks auto titles | n/a | {"attempts": ["pending", "manual_rename_race", "skipped_locked"], "title": "Renamed while generating", "lockedAfterRename": true, "clearedByExplicit": true} |
| `TITLE-006` | pass | assistant-chat-design.md | late title cannot overwrite a rename | n/a | {"attempts": ["pending", "generated", "manual_rename_race", "skipped_locked"], "locked": true, "title": "Renamed while generating"} |
| `TITLE-007` | pass | assistant-chat-design.md | passive spellcheck only | n/a | {"spellcheck": "true", "spellButtons": []} |
| `TITLE-008` | blocked | assistant-chat-design.md | identifiers excluded | needs a native spellchecker | Excluding code, paths, URLs, hashes, commands and recognized identifiers from spellcheck is the host spellchecker’s behaviour. The concept sets spellcheck="true" on the composer and adds no Assistant-side check… |

### TODO — v2 · To-Do Runtime

pass: 14

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `TODO-001` | pass | ToDo_Runtime.md | one list per thread, no source groups | n/a | {"mine": 16, "other": 8, "overlap": 0, "groupHeaders": 0} |
| `TODO-002` | pass | ToDo_Runtime.md | hierarchy + stable ids | n/a | {"n": 16, "unique": 16, "nested": 12} |
| `TODO-003` | pass | ToDo_Runtime.md | bounded leaf outcomes | n/a | {"leaves": 12, "withOutcome": 12} |
| `TODO-004` | pass | ToDo_Runtime.md | dependencies, parallel, concurrent, out of order | n/a | {"deps": 8, "parallel": 2, "concurrent": 3} |
| `TODO-005` | pass | ToDo_Runtime.md | five statuses | n/a | ["pending", "in_progress", "completed", "blocked", "skipped"] |
| `TODO-006` | pass | ToDo_Runtime.md | dependency wait is pending | n/a | {"waiting": [{"id": "tq-08", "st": "pending"}, {"id": "tq-10", "st": "pending"}, {"id": "tq-12", "st": "pending"}]} |
| `TODO-007` | pass | ToDo_Runtime.md | no verification anywhere | n/a | {"verifyFields": [], "vocab": ["pending", "in_progress", "completed", "blocked", "skipped"], "rejected": "invalid_status"} |
| `TODO-008` | pass | ToDo_Runtime.md | completed inline, no Done section | n/a | {"doneHeader": 0, "completedInline": 0, "strike": true} |
| `TODO-009` | pass | ToDo_Runtime.md | one controller owns mutation | n/a | {"owners": ["PM56_TODOS"], "api": ["applyTransition", "replaceThreadList", "validateGraph", "materializeForPlan"]} |
| `TODO-010` | pass | ToDo_Runtime.md | whole-list replacement cannot complete items | n/a | {"ok": true, "before": ["completed", "completed", "completed", "in_progress", "completed", "in_progress", "in_progress", "completed", "blocked", "blocked", "pending", "skipped", "pending", "pending", "pending",… |
| `TODO-011` | pass | ToDo_Runtime.md | tool success alone does not complete | n/a | {"expected": "Write amplification for the new index is measured and compared against the accepted 8% threshold from the Goal.", "causeKind": "tool_success", "cause": "tool:probe"} |
| `TODO-012` | pass | ToDo_Runtime.md | every completion has a cause | n/a | {"n": 8, "withCause": 8} |
| `TODO-013` | pass | ToDo_Runtime.md | one list, no source headers | n/a | {"sources": ["thread"], "sourceHeaderField": []} |
| `TODO-014` | pass | ToDo_Runtime.md | Activity only | n/a | {"inTranscript": 0} |

### WONDER — v2 · Wonderer and Grill Me

blocked: 2  pass: 7

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `WONDER-001` | pass | Skills_System.md | Persona + Skill, not Hermes | n/a | {"personas": ["Implementer", "Reviewer", "Architect", "Product Manager", "Wonderer", "Teacher"], "wonderer": true, "hermes": false} |
| `WONDER-002` | pass | Skills_System.md | leads tethered to the seed | n/a | {"leads": [{"id": "w1", "seed": "health-checked ring in prop-a", "tether": true}, {"id": "w2", "seed": "account-spend policy in prop-b", "tether": true}]} |
| `WONDER-003` | pass | Skills_System.md | hypothesis until researched or decided | n/a | {"states": ["hypothesis", "hypothesis"]} |
| `WONDER-004` | pass | Skills_System.md | additive everywhere | n/a | {"n": 2, "required": 0} |
| `WONDER-005` | pass | Skills_System.md | shared question frontier | n/a | {"asked": 3, "limit": 45, "shared": true} |
| `WONDER-006` | pass | Skills_System.md | Grill routes research, no authority | n/a | {"votingRole": false, "required": false, "tallyBefore": 4} |
| `WONDER-007` | pass | Skills_System.md | modal option + Deep Plan footer toggle | n/a | {"footer": 1, "modalOption": true} |
| `WONDER-008` | blocked | Skills_System.md | PRD Builder placement | needs the PRD owner | Wonderer early and Grill Me near discovery closure inside PRD Builder is the PRD owner's flow. This concept is the Assistant chat surface and hosts no PRD Builder; it can neither implement nor violate that orde… |
| `WONDER-009` | blocked | Skills_System.md | Planning Wizard placement | needs the Wizard owner | Wonderer at topic entry and Grill Me near topic closure with global duplicate prevention is the Planning Wizard owner's flow. The Assistant hands off with a receipt and does not run the Wizard. |

### BSTALE — v4 · Browser component currentness

pass: 12

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `BSTALE-001` | pass | Section15_MVP_Promoted_Features_Spec.md | every send path revalidates | n/a | {"cap": {"contexts": 3, "captures": 3, "mode": "component", "picked": null}, "fields": ["schema", "attachment_id", "captured_generation", "current_generation", "locator_result_count", "identity_match", "result"… |
| `BSTALE-002` | pass | Section15_MVP_Promoted_Features_Spec.md | exactly one compatible match | n/a | [{"id": "bctx-13-mtmch1kb", "count": 1, "result": "current", "match": true, "reason": null}, {"id": "bctx-15-mtmch268", "count": 1, "result": "current", "match": true, "reason": null}, {"id": "bctx-17-mtmch2rz"… |
| `BSTALE-003` | pass | Section15_MVP_Promoted_Features_Spec.md | four stale reasons, nothing sent | n/a | {"out": [{"case": "zero", "result": "stale_capture", "reason": "zero_matches", "recapture": "cmd.browser.component.pick"}, {"case": "multiple", "result": "stale_capture", "reason": "multiple_matches", "recaptur… |
| `BSTALE-004` | pass | Commands_System.md | recapture reuses the pick command | n/a | {"cmd": "cmd.browser.component.pick", "peer": []} |
| `BSTALE-005` | pass | ComposerBuffer | one stale item blocks only itself | n/a | {"n": 3, "res": {"items": [{"ref_id": "bctx-25-mtmch6tg", "ok": false, "result": {"schema": "pm.browser.component_revalidation_result.v1", "attachment_id": "bctx-25-mtmch6tg", "captured_generation": 1, "current… |
| `BSTALE-006` | pass | Section15_MVP_Promoted_Features_Spec.md | chips keep structured identity | n/a | {"fields": ["id", "demo", "capturedAt", "session", "page", "locator", "fragileLocator", "tag", "role", "name", "text", "component", "source", "rect", "parentPath", "style", "boundedHtml", "crop", "stableId", "f… |
| `BSTALE-007` | pass | Scheduling_and_Quota_Resume.md | no live selector in a schedule | n/a | {"browserish": []} |
| `BSTALE-008` | pass | Section15_MVP_Promoted_Features_Spec.md | isolated immediate-send payload | n/a | {"unchanged": true, "result": "current"} |
| `BSTALE-009` | pass | Runtime_Artifacts_Panel.md | details without protected auth | n/a | {"hasOrigin": true, "leaks": false} |
| `BSTALE-010` | pass | Section15_MVP_Promoted_Features_Spec.md | generation not timestamp | n/a | {"fresh": "current", "cap": 1, "cur": 1, "replacedResult": "stale_capture", "replacedReason": "identity_mismatch"} |
| `BSTALE-011` | pass | Section15_MVP_Promoted_Features_Spec.md | source-map change disclosed | n/a | {"hasSource": true, "baseSource": {"file": "src/features/dashboard/Header.tsx", "line": 18, "col": 5}, "result": "stale_capture", "reason": "source_mapping_changed"} |
| `BSTALE-012` | pass | ComposerBuffer | late resolution fenced by epoch | n/a | {"epoch": 0, "now": 1, "late": {"ok": false, "error": "stale_selection_epoch", "dispatched": false, "retained_as_evidence": true}} |

### CDRY — v4 · Commands, wiring, DRY, migration, proof

blocked: 8  pass: 12

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `CDRY-001` | blocked | Commands_System.md | branch-current census | needs the implementation branch | A branch-current command/schema/event/settings census must be taken against the user’s implemented v2 BRANCH. This concept folder is not that branch: it registers UI actions, not native commands, and every cmd.… |
| `CDRY-002` | pass | Commands_System.md | no progress mutation command | n/a | {"setters": [], "api": [], "named": false} |
| `CDRY-003` | blocked | Settings_System.md | no per-number command | needs Settings owner | No per-number command is minted here — that half is checkable and holds. The other half (the seven values living in the GENERIC project Settings transaction owner) needs a Settings store that does not exist in … |
| `CDRY-004` | pass | Commands_System.md | topology discriminator, atomic crew build | n/a | {"topo": "goal_driven", "peer": [], "crewAction": ["pd-build-crew", "collab-build-with-crew"]} |
| `CDRY-005` | pass | Commands_System.md | one export owner, two content kinds | n/a | {"report": true, "reportIsNotPlan": true, "exportActions": ["pd-export", "pd-export-do"], "peerReport": [], "kinds": []} |
| `CDRY-006` | pass | FinalGUISpec.md | view toggles are local | n/a | {"cmds": 0, "viewish": []} |
| `CDRY-007` | pass | Collaborative_Workflows | one collaboration family | n/a | {"shared": 33, "perKindTopLevel": [], "oneRunStore": true, "oneKindField": true} |
| `CDRY-008` | pass | Scheduling_and_Quota_Resume.md | no state-set command; dispatch is internal | n/a | {"acts": ["sched-card-details", "sched-open-sent", "sched-card-edit", "sched-card-cancel", "sched-open-message", "sched-open-manage", "sched-open-build-at", "sched-close-dialog", "sched-create-message", "sched-… |
| `CDRY-009` | pass | Commands_System.md | attachment and browser ownership not forked | n/a | {"add": "cmd.chat.attachment.add", "recapture": "cmd.browser.component.pick", "folderPeer": [], "recapturePeer": []} |
| `CDRY-010` | blocked | Contracts_V0.md | typed request/result/error/idempotency/sole handler | needs a native dispatcher | A typed request/result/error/availability contract with a permission snapshot, an idempotency key, a SOLE handler and an effect disposition is a native-dispatcher property. Every cmd.* this concept names is han… |
| `CDRY-011` | blocked | Contracts_V0.md | admitted event or receipt-only disposition | needs event registry | Central EventRecord admission is a registry property of the implementation branch. This concept emits no events; its durable effects are fixture mutations plus visible receipts, which is a receipt-only disposit… |
| `CDRY-012` | blocked | UI_Wiring_Rules.md | production wiring both directions | needs a source-hashed dispatcher | Producer → command → sole handler → owner record/event/receipt → projector → every GUI consumer, with reverse orphan coverage, needs the production wiring matrix and a source-hashed native dispatcher. Not produ… |
| `CDRY-013` | pass | Settings_System.md | settings owns settings, runtimes own records | n/a | {"leaks": [], "schedInDefs": false, "defKinds": ["crew", "brainstorm", "review", "chat_room"]} |
| `CDRY-014` | blocked | storage-plan.md | migration retires the old rows | needs a migration engine | No retired value survives as an active value — that half is checkable and holds. The MIGRATION itself (retiring stored rows while preserving explicit user values) needs a storage engine and a migration runner; … |
| `CDRY-015` | blocked | storage-plan.md | idempotent migration, quarantine, restart-safe | needs a migration engine | Idempotent schema migration, legacy-data preservation, ambiguous-record quarantine and restart-during-migration recovery all require a storage engine. No migration executes in this concept. |
| `CDRY-016` | pass | Automated_Testing_System.md | every requirement has a test | n/a | {"covered": 481, "short": []} |
| `CDRY-017` | pass | correction packet | one replacement audit Goal under 4000 chars | n/a | {"chars": 3868} |
| `CDRY-018` | pass | correction packet | three readiness columns | n/a | {"hasThree": true, "conceptDoesNotCloseNative": true} |
| `CDRY-019` | blocked | governance owners | generated artifacts refreshed last | needs repository gates | Refreshing generated indexes, shards, evidence and governance in the correct order is a repository-gate property of Plans/**, outside this concept folder. `python3 scripts/pm-plans-verify.py run-gates` is the o… |
| `CDRY-020` | pass | correction packet | additive to the implemented branch | n/a | {"suites": 15, "missing": [], "bothEras": true} |

### CONCEPT — v4 · 5.6 Pro concept correction

failed: 1  pass: 19

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `CONCEPT-001` | pass | concept folder | modules extended in place | n/a | {"modules": 20, "v2NinePresent": true, "filesExist": true, "siblingConcept": []} |
| `CONCEPT-002` | pass | Chat updates.md | authority corrected in place | n/a | {"activeRetired": [], "grillRetired": [], "statesPrecedence": true} |
| `CONCEPT-003` | pass | concept source/tests | six bases and totals, nothing retired | n/a | {"bases": {"quick": 3, "standard": 6, "thorough": 8, "deep_thorough": 10, "deep_exhaustive": 15, "brainstorm": 20}, "grill": 25, "totals": [28, 31, 33, 35, 40, 45], "bsQuestions": 20, "bsGrill": 25} |
| `CONCEPT-004` | pass | concept source/tests | eight progress conditions on one Plan | n/a | {"states": ["in_progress", "blocked", "skipped", "completed", "pending", "mixed"], "hasMixed": true, "stale": true, "rebuilt": "durable", "mdStable": true, "hashStable": true} |
| `CONCEPT-005` | pass | concept source/tests | failure/recovery under Building… | n/a | {"failed": {"label": "Building…", "line": "Build failed"}, "recovery": {"label": "Building…", "line": "Recovery required"}, "paused": {"label": "Building…", "line": "Paused"}, "quota": {"label": "Building…", "l… |
| `CONCEPT-006` | pass | concept source/tests | Regular vs Deep Details | n/a | {"regularLen": 2944, "deepLen": 5185, "planunitsInTodos": 0} |
| `CONCEPT-007` | pass | concept source/tests | ten renderer kinds + fallbacks | n/a | {"kinds": ["mermaid", "chart", "graph", "image", "diagram", "checklist", "video", "interactive", "cad"], "states": ["ok", "missing", "stale", "denied", "unsupported"], "versioned": true, "sandboxOnlyInteractive… |
| `CONCEPT-008` | pass | concept source/tests | Build as Goal end to end | n/a | {"bound": true, "binding": "set", "paused": {"label": "Building…", "cond": "paused"}, "canceledLabel": "Canceled", "fenced": {"schedules": 0, "consents": 0, "untouched": 2}, "todosBefore": 16, "todosAfter": 22,… |
| `CONCEPT-009` | pass | concept source/tests | three topologies + invalidation | n/a | {"topos": ["agent", "crew", "goal_driven"], "noRuntime": true} |
| `CONCEPT-010` | pass | concept source/tests | six modals open/cancel/start/failure | n/a | {"crew": {"opened": true, "canceled": true}, "brainstorm": {"opened": true, "canceled": true}, "review": {"opened": true, "canceled": true}, "chat_room": {"opened": true, "canceled": true}, "crew_auto": {"opene… |
| `CONCEPT-011` | pass | concept source/tests | participant outcomes demonstrated | n/a | {"outcomes": ["completed", "timed_out", "failed", "explicitly_waived", "unavailable"], "kinds": ["crew", "brainstorm", "review", "chat_room"], "ties": 1, "singleReview": 1, "partial": 1, "wonderer": true} |
| `CONCEPT-012` | pass | concept source/tests | six card states + snapshots | n/a | {"states": ["canceled", "expired", "failed", "held", "scheduled", "sent"], "sentLinked": true, "frozen": 3, "unavailable": 1} |
| `CONCEPT-013` | pass | concept source/tests | stale component currentness | n/a | {"hasRevalidate": true, "hasList": true, "recapture": "cmd.browser.component.pick", "epoch": "number"} |
| `CONCEPT-014` | pass | concept source/tests | folder through the shared tray | n/a | {"folderCmd": "cmd.chat.attachment.add", "aliasRefuses": "unsupported_semantic_kind", "aliasNormalises": "cmd.chat.attachment.add", "sources": ["picker", "drag_drop", "file_manager", "alias"]} |
| `CONCEPT-015` | pass | concept source/tests | test label renamed | n/a | {"oldName": [], "newName": ["todo-runtime-verify.mjs"], "activeReferences": []} |
| `CONCEPT-016` | **failed** | companion files | companions describe what is implemented | n/a | {"missing": [], "stale": [{"f": "REPAIR_STATUS.md", "found": ["5a48b5f7db37c57e"], "current": "f2416f0962e51295"}], "current": "f2416f0962e51295"} |
| `CONCEPT-017` | pass | build.py | deterministic, byte-checked twice | n/a | {"h1": "f2416f0962e51295", "h2": "f2416f0962e51295", "identical": true, "bytes": 2726526} |
| `CONCEPT-018` | pass | concept source | non-conflicting v2 decisions preserved | n/a | {"themes": 8, "recipes": 8, "lens": true, "orbit": true, "menus": true, "transcript": true, "history": false, "contextRing": true, "composer": true, "stop": true} |
| `CONCEPT-019` | pass | concept docs/tests | fixture-backed behaviour is labelled | n/a | {"scoped": true, "threeColumns": true} |
| `CONCEPT-020` | pass | all correction owners | no accessibility requirement raised | n/a | {"ariaAttributesPerFile": [28, 8, 12, 13]} |

### FOLDER — v4 · Folder attachment command

pass: 8

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `FOLDER-001` | pass | UI_Command_Catalog.md | one command, two semantic kinds | n/a | {"file": "cmd.chat.attachment.add", "folder": "cmd.chat.attachment.add", "drop": "cmd.chat.attachment.add", "fm": "cmd.chat.attachment.add", "sources": ["picker", "drag_drop", "file_manager", "alias"]} |
| `FOLDER-002` | pass | UI_Command_Catalog.md | alias is file-only | n/a | {"okFile": {"ok": true, "command": "cmd.chat.attachment.add", "handler": "handlers::chat_attachments::attachment_add", "semantic_kind": "file", "source": "alias", "effect": "AttachmentRef", "folder_manifest_req… |
| `FOLDER-003` | pass | Commands_System.md | no folder-specific surface | needs command census | {"api": ["freezeFolderForSchedule"], "peerActions": [], "addFolderRef": "undefined"} |
| `FOLDER-004` | pass | FileManager.md | bounded manifest | n/a | {"missing": [], "shown": 4, "total": 6, "truncated": true} |
| `FOLDER-005` | pass | Scheduling_and_Quota_Resume.md | scheduled folder freezes its manifest | n/a | {"ok": true, "schema": "pm.schedule.attachment_snapshot.v1", "attachment_id": "att-mtmcfw00-3-mpm3x", "folder_manifest_hash": "sha-demo:f0a31c7b", "root_identity": "project:pm/src/analytics/", "availability": "… |
| `FOLDER-006` | pass | FileManager.md | changed folder is disclosed, history preserved | n/a | {"unchanged": true, "status": "manifest_only", "materialization": [{"turn": "this turn", "status": "partially_materialized", "note": "Bounded manifest only (4 of 6 files listed by name/size) — no recursive file… |
| `FOLDER-007` | pass | FileManager.md | reuse File Manager capabilities | needs FileManager | {"buttons": [{"label": "", "disabled": false, "reason": null}, {"label": "Close", "disabled": false, "reason": null}, {"label": "Download exact version", "disabled": false, "reason": null}, {"label": "Open / pr… |
| `FOLDER-008` | pass | Prompt_Pipeline.md | manifest and extraction are separate identities | n/a | {"manifest_status": "manifest_only", "hash": "sha-demo:f0a31c7b", "receipt": {"turn": "this turn", "status": "partially_materialized", "note": "Bounded manifest only (4 of 6 files listed by name/size) — no recu… |

### GREPLAY — v4 · Simple Goal replay and completion

blocked: 1  pass: 11

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `GREPLAY-001` | pass | Goal_Runtime_System.md | hidden lineage, no visible fields | n/a | {"lineage": {"schema": "pm.goal.origin_lineage.v1", "goal_id": "goal-plan-ap-index-1", "goal_revision": 1, "origin_kind": "plan_build", "origin_label": "an approved Plan was built as a Goal", "source_message_re… |
| `GREPLAY-002` | pass | Goal_Runtime_System.md | four origin kinds | n/a | {"boundKind": "plan_build", "vocab": ["user_request", "agent_requested_by_user", "plan_build", "internal_workflow"], "hasTitle": false} |
| `GREPLAY-003` | pass | storage-plan.md | exact objective revision replay | needs durable store | {"original": "Complete the approved Plan “Tenant-scoped analytics read path” at version V5 exactly as written.", "revisions": 2, "replayedText": "Complete the approved Plan “Tenant-scoped analytics read path” a… |
| `GREPLAY-004` | pass | Goal_Runtime_System.md | host owns completion | n/a | {"modelSetter": [], "api": ["get", "summary", "progress", "phaseNumber", "restore", "fixture", "render", "bound", "boundList", "createBound", "boundTransition", "chip", "sidebar", "originKinds", "originLabel", … |
| `GREPLAY-005` | pass | ToDo_Runtime | no completion with an open required To-Do | n/a | {"planStatus": "building", "goalStatus": "active", "open": 1} |
| `GREPLAY-006` | pass | Goal_Runtime_System.md | no completion with active work | n/a | {"withWork": ["tc-01", "tc-02b"], "open": 4, "planStatus": "building"} |
| `GREPLAY-007` | pass | workflow owners | workflow predicate by reference | needs workflow owners | {"runs": 9, "sample": [{"id": "crew-query-perf", "comp": {"schema": "pm.collaboration.completion_projection.v1", "run_id": "crew-query-perf", "kind": "crew", "required_slots": ["p-1", "p-3", "p-5"], "completed_… |
| `GREPLAY-008` | pass | ToDo_Runtime | skip needs an accepted disposition | n/a | {"skipStatus": "skipped", "cause": "skip:probe", "causeKind": "skip_accepted", "dropOk": true, "dropRefused": []} |
| `GREPLAY-009` | pass | Goal_Runtime_System.md | epoch fencing on every stop | n/a | {"e0": 0, "e1": 1, "e2": 1, "e3": 2} |
| `GREPLAY-010` | pass | Goal_Runtime_System.md | manual stop survives every automatic path | n/a | {"status": "canceled", "refused": {"resume": "canceled_is_terminal", "quota": "canceled_is_terminal", "reconnect": "canceled_is_terminal"}} |
| `GREPLAY-011` | pass | FinalGUISpec.md | compact history, no transcript card | n/a | {"events": ["created", "paused", "active"], "inTranscript": 0, "leaks": []} |
| `GREPLAY-012` | blocked | CLI_Bridged_Providers.md | provider-native goal state noncanonical | needs an adapter | Requires a live direct/SDK/CLI/server adapter to show a provider-native goal loop being suppressed or disclosed. Contract text only in this concept; no adapter runs here. |

### MODAL — v4 · Workflow modal transaction boundary

pass: 18

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `MODAL-001` | pass | Collaborative_Workflows.md | draft only on open | needs run store | {"crew": {"before": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs": 0, "participants": 0}, "during": {"runs": 0, "providerCalls": 0, "usageRecords": … |
| `MODAL-002` | pass | Collaborative_Workflows.md | instrumented zero-effect ledger | needs real provider/Usage | {"before": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs": 0, "participants": 0}, "after": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events… |
| `MODAL-003` | pass | Commands_System.md | configure previews, start admits | needs command registry | {"before": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs": 0, "participants": 0}, "afterConfigure": {"runs": 0, "providerCalls": 0, "usageRecords": 0… |
| `MODAL-004` | pass | FinalGUISpec.md | cancel is local | n/a | {"after": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs": 0, "participants": 0}, "draft": {"kind": "crew", "reconfigureRunId": null, "autoMode": fals… |
| `MODAL-005` | pass | Collaborative_Workflows.md | failed start keeps values | needs dispatch | {"hadStart": true, "before": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs": 0, "participants": 0}, "effects": {"runs": 0, "providerCalls": 0, "usage… |
| `MODAL-006` | pass | Settings_System.md | defaults only via Save as Default | needs Settings owner | {"defsUnchanged": true, "writesBefore": 0, "writesAfter": 0} |
| `MODAL-007` | pass | Collaborative_Workflows.md | card only after admission | n/a | {"t0": 1, "t1": 1, "t2": 1, "modalOpened": true} |
| `MODAL-008` | pass | Settings_System.md | Crew Auto checks only after commit | needs Settings owner | {"before": false, "during": false, "after": false} |
| `MODAL-009` | pass | Collaborative_Workflows.md | target freezes at Start | n/a | [{"id": "review-orchestrator-boundary", "frozenAt": "2026-09-04T02:37:30.437Z", "targetHash": "a1c9f02e"}, {"id": "run-47", "frozenAt": "2026-09-04T02:37:30.437Z", "targetHash": "a91c33f0"}, {"id": "run-55", "f… |
| `MODAL-010` | pass | Collaborative_Workflows.md | stale target needs a decision | n/a | {"runs": 3, "stale": [{"id": "review-orchestrator-boundary", "choices": [{"id": "refresh_to_current", "label": "Refresh to the current target", "target_hash": "f77e10bb"}, {"id": "use_frozen_target", "label": "… |
| `MODAL-011` | pass | ComposerBuffer | pre-send BrainStorm config in the buffer | n/a | {"stored": {"kind": "brainstorm", "questionLimit": 20, "grillMe": true, "wonderer": true}, "roundTrip": {"kind": "brainstorm", "questionLimit": 20, "grillMe": true, "wonderer": true}, "text": "Deep Plan BrainSt… |
| `MODAL-012` | pass | Prompt_Pipeline | NL request held before dispatch | needs provider | {"msgsBefore": 26, "msgsAfterHold": 26, "providerBefore": 0, "providerAfter": 0, "held": "Please brainstorm the storage engine options.", "draftOpened": true, "runs": 9, "restoredText": "Please brainstorm the s… |
| `MODAL-013` | pass | Assistant_Plan_Runtime.md | Build With Crew is one atomic command | n/a | {"before": {"planStatus": "ready", "runs": 9}, "boundPlan": "ap-index", "boundVersion": 5, "effects": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs":… |
| `MODAL-014` | pass | Assistant_Plan_Runtime.md | stale Plan refused at Start | n/a | {"frozenVersion": 5, "nowVersion": 6, "stale": true, "draftVersion": 5} |
| `MODAL-015` | pass | Back_Seat_Driver.md | BSD config creates no binding | needs PRD/Wizard owners | {"policy": {"demo": true, "mode": "auto", "model": {"requested": "Default resolver", "effective": "Claude Sonnet 4.6"}, "persona": {"requested": "Critical Advisor", "effective": "Critical Advisor"}, "sensitivit… |
| `MODAL-016` | pass | Shared_Integration_Runtime.md | provisioning only after Start | needs provisioner | {"before": 0, "after": 0, "capabilityPreview": false} |
| `MODAL-017` | pass | Collaborative_Workflows.md | idempotent start, changed config rejected | n/a | {"keys": [{"id": "crew-query-perf", "key": "crew:query:crew-query-perf:rev1", "fp": "cfg:5a2e8aa0"}, {"id": "brainstorm-provider-failover", "key": "brainstorm:plan-deep:brainstorm-provider-failover:rev1", "fp":… |
| `MODAL-018` | pass | FinalGUISpec.md | view toggles are not commands | needs command census | {"viewish": ["collab-toggle-expand", "collab-toggle-more", "collab-open-panel", "collab-panel-tab", "collab-open-participant", "collab-close-participant", "collab-review-toggle-finding", "collab-brainstorm-togg… |

### PART — v4 · Participant outcomes and quorum

blocked: 1  pass: 23

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PART-001` | pass | Collaborative_Workflows.md | six terminal outcomes | n/a | {"vocab": ["completed", "failed", "timed_out", "unavailable", "canceled", "explicitly_waived"], "results": {"completed": true, "failed": true, "timed_out": true, "unavailable": true, "canceled": true, "explicit… |
| `PART-002` | pass | Collaborative_Workflows.md | required vs optional, waiver identity | n/a | {"required": 3, "optional": 0, "noReasonErr": "waiver_requires_reason", "waiver": {"actor": "user", "reason": "covered by an existing audit", "at": "2026-09-04T02:38:11.471Z", "currentness": 1}} |
| `PART-003` | pass | Provider control | no silent substitution | n/a | {"noReasonErr": "replacement_requires_reason", "ok": true, "rev": 2, "originalLabel": "Claude Sonnet 4.6 · Anthropic", "originalModelId": "sonnet46", "nowModelId": "sonnet46-personal", "nowLabel": "Claude Sonne… |
| `PART-004` | pass | Collaborative_Workflows.md | retry = new attempt, old kept | n/a | {"retried": true, "attempts": 2, "kept": true, "lateErr": "stale_epoch", "rejected": 1} |
| `PART-005` | pass | Commands_System.md | one reconfigure owner | needs command census | {"api": ["retryParticipant", "replaceParticipant", "setOutcome"], "perWorkflowEngines": []} |
| `PART-006` | pass | usage-feature.md | usage retains every attempt | needs Usage subsystem | {"attempts": ["failed", "in_flight", "completed"], "requested": "sonnet46", "effective": "sonnet46", "finalOutcome": "completed", "waivedHasNoAttemptCost": 0} |
| `PART-007` | pass | Collaborative_Workflows.md | one reviewer is not consensus | n/a | {"id": "run-47", "reviewTruth": {"requested_passes": 1, "completed_passes": 1, "failed_passes": 0, "single_pass": true, "partial": false, "claims_corroboration": false, "label": "Single independent pass — no pe… |
| `PART-008` | pass | Collaborative_Workflows.md | partial review discloses counts | n/a | {"id": "run-55", "requested": 3, "completed": 2, "failed": 1, "attention": true, "reason": "required_participants_unresolved", "actions": ["retry", "replace", "waive", "accept_partial", "cancel", "details"], "c… |
| `PART-009` | pass | Collaborative_Workflows.md | only current completed attempts vote | n/a | {"before": {"support": 2, "oppose": 2, "abstain": 2, "ineligible": 0, "denominator": 4, "support_pct": 50, "quorum": "tie", "tie": true}, "after": {"support": 1, "oppose": 2, "abstain": 2, "ineligible": 1, "den… |
| `PART-010` | pass | Collaborative_Workflows.md | disagreement is preserved | n/a | {"tally": {"support": 2, "oppose": 2, "abstain": 2, "ineligible": 0, "denominator": 4, "support_pct": 50, "quorum": "tie", "tie": true}, "dissent": [{"by": "Reviewer", "text": "Append-only segments make compact… |
| `PART-011` | pass | Collaborative_Workflows.md | core vs additive coverage | n/a | {"core": ["p-57", "p-59", "p-61", "p-63"], "additive": [{"id": "p-65", "kind": "wonderer"}, {"id": "p-67", "kind": "grill_me"}], "requiredIncludesAdditive": false} |
| `PART-012` | pass | Personas.md | Wonderer abstains and leaves the denominator | n/a | {"hasWonderer": true, "before": {"support": 2, "oppose": 2, "abstain": 2, "ineligible": 0, "denominator": 4, "support_pct": 50, "quorum": "tie", "tie": true}, "afterForcedSupport": {"support": 2, "oppose": 2, "… |
| `PART-013` | pass | Skills_System | Grill has no automatic vote | n/a | {"base": 4, "forced": 4, "configured": 5} |
| `PART-014` | pass | Collaborative_Workflows.md | ties resolved by recorded reasoning | n/a | {"id": "run-69", "tally": {"support": 2, "oppose": 2, "abstain": 2, "ineligible": 0, "denominator": 4, "support_pct": 50, "quorum": "tie", "tie": true}, "reasoning": {"outcome": "hybrid", "decided_by": "synthes… |
| `PART-015` | pass | Assistant_Plan_Runtime.md | dissent visible, only blockers gate Build | n/a | {"base": true, "nonBlocking": true, "blocking": false, "blockedBy": [{"id": "dis-2", "why": "the storage choice is a build blocker", "source": "plan"}]} |
| `PART-016` | pass | Collaborative_Workflows.md | crew needs every required output | n/a | {"id": "run-79", "outputs": [{"id": "extracted-module", "delivered": true}, {"id": "test-suite", "delivered": true}, {"id": "synthesis-summary", "delivered": false}], "status": "incomplete", "missing": ["synthe… |
| `PART-017` | pass | Collaborative_Workflows.md | coordinator failure is explicit | n/a | {"coordBefore": "{\"kind\":\"parent_assistant\",\"label\":\"Parent assistant (this thread)\"}", "coordAfter": "{\"kind\":\"parent_assistant\",\"label\":\"Parent assistant (this thread)\"}", "coordinatorFailed":… |
| `PART-018` | pass | Collaborative_Workflows.md | failed members produce no messages | n/a | {"failed": "p-34", "msgs": 5, "fromFailedAfterFailure": 0, "roster": [{"id": "p-34", "outcome": "failed"}, {"id": "p-36", "outcome": null}, {"id": "p-38", "outcome": null}]} |
| `PART-019` | pass | Collaborative_Workflows.md | kind-specific completion predicate | n/a | {"kinds": ["crew", "brainstorm", "review", "chat_room"], "shapes": {"crew": ["schema", "run_id", "kind", "required_slots", "completed_slots", "failed_slots", "waived_slots", "unresolved_required", "output_statu… |
| `PART-020` | pass | Collaborative_Workflows.md | cancel fences every callback | n/a | {"err": "run_canceled", "retained": true, "unchanged": true, "rejected": 1} |
| `PART-021` | pass | Provider control | pre-Start unavailability is not a runtime participant | n/a | {"before": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events": 0, "cards": 0, "settingsWrites": 0, "installs": 0, "participants": 0}, "after": {"runs": 0, "providerCalls": 0, "usageRecords": 0, "events… |
| `PART-022` | pass | Collaborative_Workflows.md | same model, independent attempts | n/a | {"slots": ["p-25", "p-27", "p-29"], "uniqueSlots": 3, "sessions": ["sess-p-26-31hq", "sess-p-28-cwsl", "sess-p-30-7yfi"], "uniqueSessions": 3, "models": ["opus5", "glm52", "opus5"]} |
| `PART-023` | pass | FinalGUISpec.md | counts reachable without flooding the transcript | n/a | {"hasCard": true, "participantRows": 0, "showsCounts": true, "genericOnly": false} |
| `PART-024` | blocked | CLI_Bridged_Providers.md | constrained-execution disclosure | needs an adapter | Requires a live direct/SDK/CLI/server adapter that cannot guarantee fresh sessions, parallelism or isolation, so its constrained tier can be disclosed before Start and in the artifact. No adapter runs in this c… |

### PDET — v4 · Plan details, storage, embeds

blocked: 1  pass: 11

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PDET-001` | pass | Assistant_Plan_Runtime.md | Details fields render | needs artifact store | {"found": ["version", "hash", "backend", "source", "currentness"], "missing": [], "len": 2944} |
| `PDET-002` | pass | Assistant_Plan_Runtime.md | Deep-only ledger + PlanUnit details | n/a | {"hasLedger": true, "hasUnits": true} |
| `PDET-003` | pass | Assistant_Plan_Runtime.md | Regular says no ledger/PlanUnits | n/a | {"direct": true, "noLedger": true, "noUnits": true, "sample": ""} |
| `PDET-004` | pass | Runtime_Artifacts_Panel.md | one revision, two projections | n/a | {"parity": {"rich": 20, "markdown": 20, "equal": true, "ids": ["heading-0", "paragraph-1", "heading-2", "paragraph-3", "table-4", "heading-5", "ps-0", "ps-1", "ps-2", "ps-3", "ps-4", "ps-5", "heading-12", "para… |
| `PDET-005` | pass | Named_Plan_System.md | thread-scoped, no auto NamedPlan | needs project store | [{"id": "ap-index", "thread": "query", "named": null}, {"id": "ap-cache", "thread": "plan-deep", "named": null}, {"id": "ap-auth", "thread": "query", "named": null}, {"id": "ap-embeds", "thread": "query", "name… |
| `PDET-006` | blocked | storage-plan.md | retention by reachability, not card visibility | needs storage engine | Retention holds across Wizard/Goal/Crew/Review/Usage/export references need a real artifact store with reachability rules. Nothing in a file:// page deletes or holds an artifact. |
| `PDET-007` | pass | Assistant_Plan_Runtime.md | stable block ids + round trip, no direct editing | n/a | {"kinds": ["heading", "paragraph", "table", "plan_step", "code", "unordered_list", "artifact", "callout"], "stepCount": 6, "dupes": [], "editable": 0} |
| `PDET-008` | pass | Assistant_Plan_Runtime.md | embed freezes exact version | n/a | {"n": 12, "fields": ["t", "block_id", "artifact_id", "artifact_version", "artifact_version_label", "renderer_kind", "display", "caption", "text_summary", "static_fallback_ref", "source_ref", "sandboxed", "state… |
| `PDET-009` | pass | Assistant_Plan_Runtime.md | renderer kinds through one renderer | n/a | {"kinds": ["mermaid", "chart", "graph", "image", "diagram", "checklist", "video", "interactive", "cad"], "blockKinds": ["heading", "paragraph", "table", "plan_step", "code", "unordered_list", "artifact", "callo… |
| `PDET-010` | pass | Permissions_System | interactive runs sandboxed | needs sandbox runtime | {"iframes": [], "interactive": [{"id": "art-latency-explorer", "sandboxed": true, "origin": true}], "nonInteractiveSandboxed": 0} |
| `PDET-011` | pass | Project_Output_Artifacts | PDF static fallback | needs export engine | {"risky": [{"k": "video", "fb": "art-repro-capture@v1-frame.png", "cap": "Reproduction capture, 38s"}, {"k": "interactive", "fb": "art-latency-explorer@v5-table.png", "cap": "Latency explorer"}]} |
| `PDET-012` | pass | Runtime_Artifacts_Panel.md | unavailable is explicit | n/a | {"states": ["ok", "missing", "stale", "denied", "unsupported"], "covered": ["missing", "stale", "denied", "unsupported"], "unavailable": [{"id": "art-deleted-trace", "s": "missing"}, {"id": "art-row-counts", "s… |

### PFAIL — v4 · Plan failure and recovery

pass: 10

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PFAIL-001` | pass | Assistant_Plan_Runtime.md | Building… under every condition | n/a | {"paused": "Building…", "quota": "Building…", "window": "Building…", "attention": "Building…", "failed": "Building…", "recovery": "Building…"} |
| `PFAIL-002` | pass | FinalGUISpec.md | six secondary lines with reason+actions | n/a | {"paused": {"line": "Paused", "tone": "info", "hasReason": true, "acts": ["details", "cancel"]}, "quota": {"line": "Waiting for Usage", "tone": "info", "hasReason": true, "acts": ["details", "cancel"]}, "window… |
| `PFAIL-003` | pass | Assistant_Plan_Runtime.md | failed attempt != completion, no duplicate run | n/a | {"label": "Building…", "runBefore": "run-ap-cache-V1", "runAfter": "run-ap-cache-V1", "status": "building", "attempt": 2} |
| `PFAIL-004` | pass | Assistant_Plan_Runtime.md | resume preserves identity | needs recovery owner | {"runBefore": "run-ap-cache-V1", "paused": true, "afterPause": {"label": "Building…", "run": "run-ap-cache-V1", "cond": "paused"}, "resumed": true, "afterResume": {"label": "Building…", "run": "run-ap-cache-V1"… |
| `PFAIL-005` | pass | Assistant_Plan_Runtime.md | needs attention offers only admitted actions | n/a | {"acts": ["cancel", "details"], "label": "Building…", "status": "building", "line": "Needs attention"} |
| `PFAIL-006` | pass | Assistant_Plan_Runtime.md | cancel fences everything | needs scheduler | {"fenced": {"schedules": 0, "consents": 0, "untouched": 2}, "label": "Canceled", "status": "canceled", "cancelReason": "Cancelled through the bound Goal. The PlanRun and every attempt are fenced at continuation… |
| `PFAIL-007` | pass | Assistant_Plan_Runtime.md | completion predicate | needs work admission | {"eligible": {"revise": false, "build": false, "crew": false, "at": false, "wizard": true, "exportx": true, "cancel": true, "todos": true, "goal": false, "report": true}, "hasCompletionGate": true} |
| `PFAIL-008` | pass | Assistant_Plan_Runtime.md | no hot-swap under an active run | n/a | {"status": "building", "revise": [{"act": "pd-revise", "id": "ap-index", "disabled": false}]} |
| `PFAIL-009` | pass | Assistant_Plan_Runtime.md / storage-plan.md | restore shows Building… + exact reason | needs durable store | {"label": "Building…", "cond": "window", "reason": "Outside the configured execution window (22:00–06:00). The run resumes at the next window; no client timer is authoritative.", "acts": ["resume", "details", "… |
| `PFAIL-010` | pass | Scheduling_and_Quota_Resume.md | immediate build invalidates the schedule | needs scheduler | {"before": 0, "res": {"schedules": 1, "consents": 0, "untouched": 2}} |

### PGOAL — v4 · Build as Goal

pass: 15

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PGOAL-001` | pass | Assistant_Plan_Runtime.md | secondary action, primary stays Build | n/a | {"hasGoalAction": true, "goalIsSecondary": true, "primaryLabel": "Build", "primaryCount": 1} |
| `PGOAL-002` | pass | Commands_System.md | no peer command minted | needs command census | {"peerAction": [], "peerCommandNamed": false} |
| `PGOAL-003` | pass | Goal_Runtime_System.md | atomic Goal+PlanRun+binding | needs transaction | {"before": {"goals": 0, "status": "ready"}, "after": {"goal": {"id": "goal-plan-ap-index-1", "status": "active", "bindingPlan": "ap-index", "run": "run-ap-index-V5", "hash": "sha-demo:869d26cb"}, "planStatus": … |
| `PGOAL-004` | pass | Assistant_Plan_Runtime.md | references, never duplicates | n/a | {"todo_list_ref": "todos:query", "planunit_bundle_ref": null, "todosBefore": 16, "todosAfter": 22, "listRefIsPointer": true, "secondList": 0} |
| `PGOAL-005` | pass | Goal_Runtime_System.md | objective names the version, no Plan copy | n/a | {"objective": "Complete the approved Plan “Tenant-scoped analytics read path” at version V5 exactly as written.", "len": 96, "planLen": 2569, "namesVersion": true, "lineageBound": "ap-index@V5", "containsPlanBo… |
| `PGOAL-006` | pass | Goal_Runtime_System.md | no phases/tranches/child goals/budgets | n/a | {"keys": ["id", "projectId", "thread", "bound", "objective", "revision", "status", "blockedReason", "createdAt", "updatedAt", "currentnessHash", "stopEpoch", "mode", "idempotency_key", "lineage", "binding", "hi… |
| `PGOAL-007` | pass | Goal_Runtime_System.md | pause/resume through the binding | n/a | {"paused": {"label": "Building…", "goal": "paused", "cond": "paused", "reason": "Paused through the bound Goal at a shared safe boundary. The Build control stays Building…."}, "resumed": {"label": "Building…", … |
| `PGOAL-008` | pass | Goal_Runtime_System.md | cancel fences, unrelated schedules survive | needs scheduler | {"label": "Canceled", "goal": "canceled", "msgsBefore": 6, "msgsAfter": 6, "canceledMsgs": 1, "resumeRefused": true} |
| `PGOAL-009` | pass | Goal_Runtime_System.md | plan completion completes the goal once | n/a | {"planStatus": "completed", "first": {"status": "completed", "completion": true, "hist": 1}, "histAfterReplay": 1} |
| `PGOAL-010` | pass | Goal_Runtime_System.md | goal edit never edits the plan | n/a | {"hashSame": true, "mdSame": true, "versionSame": true, "goalRevision": 2} |
| `PGOAL-011` | pass | Assistant_Plan_Runtime.md | fails closed on stale/duplicate | n/a | {"dupOk": false, "dupErr": "active_run_exists", "goalCount": 1} |
| `PGOAL-012` | pass | Assistant_Plan_Runtime.md | idempotent replay | n/a | {"first": true, "g1": "goal-plan-ap-index-1", "replayed": true, "sameGoal": true, "count": 1} |
| `PGOAL-013` | pass | Assistant_Plan_Runtime.md | both backends, unchanged | n/a | {"goalActionOnReady": true, "regBackend": "direct", "regUnits": null, "deepBackend": "ledger_bound", "deepUnits": 6, "regBundle": null, "deepBundle": "ap-cache@V1:planunits"} |
| `PGOAL-014` | pass | FinalGUISpec.md | links both ways, no Goal thread card | n/a | {"detailsNamesGoal": true, "detailsHasBinding": true, "goalCardsInTranscript": 0, "goalInActivity": false} |
| `PGOAL-015` | pass | Scheduling_and_Quota_Resume.md | goal created only at dispatch | needs scheduler | {"builds": 4, "goalDriven": 1, "goalDrivenSnapshots": [{"id": "bld-flags-held", "topo": "goal_driven", "runtime": false}], "boundGoals": []} |

### PPROG — v4 · Real-time Plan progress

pass: 18

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PPROG-001` | pass | Assistant_Plan_Runtime.md | typed projection key | needs projector service | {"keys": ["project_id", "thread_id", "assistant_plan_id", "plan_version", "plan_hash", "plan_run_id", "projection_revision", "currentness_hash", "generated_at", "step_states", "stale", "source"], "plan_hash": "… |
| `PPROG-002` | pass | Assistant_Plan_Runtime.md | sole authority, derived from To-Dos | needs ToDoController | {"step": "cs-4", "beforeState": "pending", "afterState": "in_progress", "hasSetter": "undefined", "cmdExists": "undefined"} |
| `PPROG-003` | pass | Assistant_Plan_Runtime.md | stable step ids, not titles | n/a | {"count": 9, "renamed": 9, "sameIds": true, "sameStates": true} |
| `PPROG-004` | pass | Assistant_Plan_Runtime.md | five leaf states + mixed | n/a | {"words": ["in_progress", "completed", "blocked", "skipped", "pending", "mixed"], "seen": {"cs-0": "in_progress", "cs-1": "completed", "cs-2a": "blocked", "cs-2b": "skipped"}, "states": {"cs-0": "in_progress", … |
| `PPROG-005` | pass | Assistant_Plan_Runtime.md | concurrent + out-of-order | n/a | {"inProg": 3, "lastState": "completed", "firstState": "in_progress"} |
| `PPROG-006` | pass | Assistant_Plan_Runtime.md / ToDo_Runtime | completion is derived | n/a | {"half": "in_progress", "full": "completed", "mixedOk": "completed"} |
| `PPROG-007` | pass | Assistant_Plan_Runtime.md | blocked vs dependency-wait | n/a | {"waiting": "pending", "blockedState": "blocked", "reason": "blocker:probe-owning-condition", "dependentStillPending": "pending"} |
| `PPROG-008` | pass | Assistant_Plan_Runtime.md | step carries refs + deviation | needs evidence store | {"keys": ["state", "todo_ids", "reason", "work", "evidence"], "todo_ids": ["tc-00"], "evidence": ["evidence:tc-00-counters", "receipt:demo-1"], "work": []} |
| `PPROG-009` | pass | FinalGUISpec.md | Rich markers do not rewrite prose | n/a | {"hashSame": true, "mdSame": true} |
| `PPROG-010` | pass | FinalGUISpec.md | Markdown rail, byte-stable | n/a | {"stable": true, "injected": false, "len": 3093} |
| `PPROG-011` | pass | FinalGUISpec.md | one lifecycle control | n/a | {"labels": ["Build", "Building…"], "chips": []} |
| `PPROG-012` | pass | Assistant_Plan_Runtime.md | stale disclosed, mutation refused | n/a | {"freshStale": false, "staleFlag": true, "elig": {"revise": false, "build": false, "crew": false, "at": false, "wizard": true, "exportx": true, "cancel": true, "todos": true, "goal": false, "report": true}} |
| `PPROG-013` | pass | Assistant_Plan_Runtime.md / storage-plan.md | rebuild from durable records | needs durable store | {"sameStates": true, "sameHash": true, "source": "durable"} |
| `PPROG-014` | pass | Assistant_Plan_Runtime.md / ToDo_Runtime | late events fenced | n/a | {"before": "completed", "after": "completed", "errors": {"staleItem": "stale_item_revision", "staleList": "stale_list_revision", "staleWork": "stale_work_binding", "staleVersion": "stale_plan_version"}, "retain… |
| `PPROG-015` | pass | Assistant_Plan_Runtime.md | export excludes live state | n/a | {"hashUnchanged": true, "mdUnchanged": true, "reportIsSeparate": true, "repKeys": ["schema", "demo", "assistant_plan_id", "plan_version", "plan_hash", "plan_run_id", "generated_at", "currentness_hash", "stale",… |
| `PPROG-016` | pass | Runtime_Artifacts_Panel.md | execution report contents | n/a | {"keys": ["schema", "demo", "assistant_plan_id", "plan_version", "plan_hash", "plan_run_id", "generated_at", "currentness_hash", "stale", "is_approved_plan", "step_states", "todo_refs", "deviations", "attention… |
| `PPROG-017` | pass | Assistant_Plan_Runtime.md | two truthful backends | n/a | {"deep": "ledger_bound", "regular": "direct", "deepUnits": {}, "regUnits": null} |
| `PPROG-018` | pass | Commands_System | no progress mutation command | needs command registry | [] |

### PSCHED — v4 · Scheduled Plan build topology

blocked: 2  pass: 12

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `PSCHED-001` | pass | Scheduling_and_Quota_Resume.md | one frozen topology | needs scheduler | [{"id": "bld-nightly-index", "topo": {"schema": "pm.schedule.plan_topology_snapshot.v1", "execution_topology": "agent", "collaboration_definition_ref": null, "eligibility_policy": "window_and_quota_conjunction"… |
| `PSCHED-002` | pass | Scheduling_and_Quota_Resume.md | crew freeze at commit | needs scheduler | [{"schema": "pm.schedule.plan_topology_snapshot.v1", "execution_topology": "crew", "collaboration_definition_ref": "collabdef:crew@rev4", "collaboration_definition_revision": 4, "assignments": [{"slot_id": "coo… |
| `PSCHED-003` | pass | Scheduling_and_Quota_Resume.md | no runtime before dispatch | needs scheduler | {"builds": 4, "anyRuntime": 0, "boundGoals": 0, "runs": 0} |
| `PSCHED-004` | blocked | Scheduling_and_Quota_Resume.md | dispatch revalidation | needs a real timer service | Dispatch-time revalidation of Plan hash, worktree, permission, provider/account/model, tools, window and quota needs a server-owned timer and a live provider. The concept models Held/Failed states and their rea… |
| `PSCHED-005` | pass | Scheduling_and_Quota_Resume.md | immediate build invalidates | n/a | {"status": "building", "sched": {"version": 5, "hash": "sha-demo:869d26cb", "at": "22:10", "invalid": true, "invalidReason": "Build Now started this exact Plan version; the pending schedule is invalidated so no… |
| `PSCHED-006` | pass | Scheduling_and_Quota_Resume.md | revision invalidates old schedules | n/a | {"before": 5, "after": 6, "sched": {"version": 5, "hash": "sha-demo:869d26cb", "at": "22:10", "invalid": true, "invalidReason": "Bound to V5; the Plan is now V6. Rebind or reschedule explicitly."}, "schedulerRo… |
| `PSCHED-007` | blocked | Provider control | no substitution at dispatch | needs a provider adapter | Provider/model/account unavailability AT DISPATCH needs a live adapter. The concept records requested vs effective identity and refuses substitution in its own records, but makes no provider call. |
| `PSCHED-008` | pass | Scheduling_and_Quota_Resume.md | conjunction of window and quota | n/a | {"builds": 4, "withBoth": 4, "sample": [{"id": "bld-nightly-index", "preds": {"window": false, "quota": true, "permission": true}, "eligible": false}, {"id": "bld-auth-nightly", "preds": {"window": true, "quota… |
| `PSCHED-009` | pass | Scheduling_and_Quota_Resume.md | recurrence resumes one run | n/a | {"recurring": 1, "detail": [{"id": "bld-nightly-index", "kind": "recurring_window", "autoResume": true, "run": null, "terminalStops": true}]} |
| `PSCHED-010` | pass | Scheduling_and_Quota_Resume.md | association-scoped invalidation | n/a | {"res": {"schedules": 0, "consents": 0, "untouched": 2}, "msgsUnchanged": true, "buildsBefore": [{"id": "bld-nightly-index", "invalid": false}, {"id": "bld-auth-nightly", "invalid": false}, {"id": "bld-crew-emb… |
| `PSCHED-011` | pass | FinalGUISpec.md | Build stays primary, schedule is secondary | n/a | {"primary": "Build", "labels": ["Build"], "scheduledAsPrimary": false} |
| `PSCHED-012` | pass | Scheduling_and_Quota_Resume.md | edit uses expected revision | n/a | {"hasRevision": true, "hasDispatchGuard": true, "sample": {"id": "bld-nightly-index", "revision": 1, "state": "active"}} |
| `PSCHED-013` | pass | Scheduling_and_Quota_Resume.md | failed admission leaves no orphan | n/a | {"failed": [{"id": "bld-flags-held", "state": "held", "reason": "Admission refused: the worktree feature/flags named by this Plan no longer exists. No PlanRun, Goal or CrewRun was created; the schedule is intac… |
| `PSCHED-014` | pass | Scheduling_and_Quota_Resume.md | two independent idempotency domains | n/a | {"creationKey": "sched:ap-index@V5:recurring_window:22:00:America/Chicago", "dispatchKey": "dispatch:bld-nightly-index:occurrence", "distinct": true} |

### QMAX — v4 · Question budget and Grill Me

blocked: 2  pass: 18

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `QMAX-001` | pass | Assistant_Plan_Runtime.md | plans.js QBASE | needs Settings store | {"quick": 3, "standard": 6, "thorough": 8, "deep_thorough": 10, "deep_exhaustive": 15, "brainstorm": 20} |
| `QMAX-002` | pass | Assistant_Plan_Runtime.md | plans.js QBASE | needs Settings store | {"quick": 3, "standard": 6, "thorough": 8, "deep_thorough": 10, "deep_exhaustive": 15, "brainstorm": 20} |
| `QMAX-003` | pass | Collaborative_Workflows.md | plans.js QGRILL | needs Settings store | 25 |
| `QMAX-004` | pass | Assistant_Plan_Runtime.md | derived total | n/a | [{"k": "quick", "base": 3, "ext": 25, "eff": 28}, {"k": "standard", "base": 6, "ext": 25, "eff": 31}, {"k": "thorough", "base": 8, "ext": 25, "eff": 33}, {"k": "deep_thorough", "base": 10, "ext": 25, "eff": 35}… |
| `QMAX-005` | pass | Assistant_Plan_Runtime.md | per-item admission | n/a | {"after1": 5, "after2": 5} |
| `QMAX-006` | pass | Assistant_Plan_Runtime.md | one run counter | n/a | {"charged": [true, true, true, false], "errors": [null, null, null, "question_budget_exhausted"], "proj": {"schema": "pm.assistant_plan.question_budget_projection.v1", "workflow_id": "t-share", "strategy": "qui… |
| `QMAX-007` | pass | Assistant_Plan_Runtime.md | charge-once by identity | needs durable store | {"a": true, "b": false, "c": false, "reason": "already_charged", "asked": 1} |
| `QMAX-008` | pass | Assistant_Plan_Runtime.md | counter keyed by run not version | n/a | {"beforeRev": 2, "afterRev": 2, "fresh": 0} |
| `QMAX-009` | pass | Assistant_Plan_Runtime.md | setGrillMe raises ceiling | n/a | {"beforeAsked": 3, "beforeRem": 3, "beforeEff": 6, "afterAsked": 3, "afterRem": 28, "afterEff": 31} |
| `QMAX-010` | pass | Assistant_Plan_Runtime.md | disable keeps history | n/a | {"beforeAsked": 10, "afterAsked": 10, "afterEff": 3, "afterRem": 0, "exhausted": true, "nextErr": "question_budget_exhausted", "nextCharged": false, "askedAfterTry": 10} |
| `QMAX-011` | pass | Assistant_Plan_Runtime.md | reused answers do not charge | needs thread store | {"charged": false, "reason": "reused_answer", "asked": 0, "reused": 1} |
| `QMAX-012` | pass | Assistant_Plan_Runtime.md | research does not charge | needs tool runtime | {"charged": false, "reason": "research_resolved", "asked": 0, "research": 1} |
| `QMAX-013` | pass | Assistant_Plan_Runtime.md | ceiling is a max not a target | n/a | {"asked": 2, "remaining": 6, "exhausted": false, "stable": true} |
| `QMAX-014` | pass | Assistant_Plan_Runtime.md | typed exhaustion, run survives | n/a | {"error": "question_budget_exhausted", "ok": false, "run_failed": false, "charged": false, "asked": 3} |
| `QMAX-015` | pass | Assistant_Plan_Runtime.md | only explicit blockers disable Build | n/a | {"base": {"revise": true, "build": true, "crew": true, "at": true, "wizard": true, "exportx": true, "cancel": true, "todos": false, "goal": true, "report": false}, "exhausted": true, "afterExhaust": {"revise": … |
| `QMAX-016` | pass | Assistant_Plan_Runtime.md | projection fields + derivation | needs durable question records | {"keys": ["schema", "workflow_id", "strategy", "strategy_label", "planning_kind", "policy_version", "base_limit", "grill_me_enabled", "grill_me_extension", "effective_limit", "questions_asked", "questions_remai… |
| `QMAX-017` | pass | FinalGUISpec.md | rendered BrainStorm copy | n/a | {"keys": ["crew", "brainstorm", "review", "chat_room"], "bsKeys": ["coreParticipants", "questionLimit", "grillExtension", "externalResearch", "independentProposals", "debateRounds", "voting", "preserveDissent",… |
| `QMAX-018` | blocked | Settings_System.md | seven values via generic Settings owner | needs Settings transaction owner | Seven factory values (6 bases + Grill 25) must live in the generic project-scoped Settings transaction owner. This concept holds them as module constants (QBASE/QGRILL); there is no Settings store, no search an… |
| `QMAX-019` | blocked | Settings_System.md / storage-plan.md | migration preserving user overrides | needs migration engine | Migration of untouched factory values (BrainStorm 15 -> 20, Grill +10 -> +25) while preserving explicit user overrides needs a Settings store with a source-of-value field and a migration runner. No migration ex… |
| `QMAX-020` | pass | PRD_Builder.md / Planning_Wizard.md | owner-scoped +25 | needs PRD/Wizard owners | {"keys": ["quick", "standard", "thorough", "deep_thorough", "deep_exhaustive", "brainstorm"], "hasPrd": false, "grill": 25} |

### SMSG — v4 · Scheduled message projection

blocked: 2  pass: 16

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `SMSG-001` | pass | Scheduling_and_Quota_Resume.md | card after durable commit | needs scheduler | {"n": 6, "allHaveId": true} |
| `SMSG-002` | pass | Scheduling_and_Quota_Resume.md | six states from owner records | n/a | {"vocab": ["scheduled", "held", "sent", "canceled", "failed", "expired"], "seen": ["scheduled", "held", "sent", "failed", "canceled", "expired"]} |
| `SMSG-003` | pass | FinalGUISpec.md | card fields, hashes in Details | n/a | {"keys": ["schema", "scheduled_message_id", "thread_id", "destination_ref", "state", "state_label", "scheduled_at", "timezone", "local_wall_time", "text_preview", "attachment_count", "requested_model_ref", "dis… |
| `SMSG-004` | pass | ComposerBuffer | buffer clears only after commit | n/a | {"beforeSnapshot": {"text": "text that must survive a failed schedule", "atts": 0, "dest": null}, "afterText": "text that must survive a failed schedule", "afterAtts": 0, "failedSchedules": 1} |
| `SMSG-005` | pass | Scheduling_and_Quota_Resume.md | edit/cancel gated by state | n/a | [{"id": "sm-nightly-digest", "state": "scheduled", "edit": true, "cancel": true}, {"id": "sm-route-held", "state": "held", "edit": true, "cancel": true}, {"id": "sm-sent-rollout", "state": "sent", "edit": false… |
| `SMSG-006` | blocked | storage-plan.md | dispatch inserts and links the real message | needs a real pipeline | The Sent card links a dispatched_message_id and that link is checkable here, but the DISPATCH itself — inserting the user message at real dispatch time — needs a server-owned timer and the real message pipeline… |
| `SMSG-007` | pass | Runtime_Artifacts_Panel | attachment snapshots freeze | n/a | {"id": "sm-route-held", "snaps": [{"att": "benchmark.csv", "ver": 1, "hash": "sha-demo:9c14e0d2", "folder": null, "availability": "available"}, {"att": "load-profile.json", "ver": 3, "hash": "sha-demo:2b77af10"… |
| `SMSG-008` | pass | FileManager | missing retained version holds, never substitutes | n/a | {"total": 3, "bad": [{"att": "load-profile.json", "a": "missing", "state": "held", "held": "Recorded destination \"Crew · Query Performance\" is no longer resolvable (the crew run ended), and the retained revis… |
| `SMSG-009` | pass | Browser owner | live selector must be frozen or refused | n/a | {"liveContexts": 0, "scheduledBrowserRefs": []} |
| `SMSG-010` | pass | Collaborative_Workflows | ended destination never falls back | n/a | {"held": [{"id": "sm-route-held", "dest": {"kind": "workflow", "label": "Crew · Query Performance", "detail": "3 agents · coordinator", "unresolvable": true}, "reason": "Recorded destination \"Crew · Query Perf… |
| `SMSG-011` | blocked | Models_System | no silent model fallback at dispatch | needs a provider adapter | Requires a live provider to make an explicitly selected model unavailable at dispatch. The concept records requested vs effective route and refuses substitution in its own records, but makes no provider call. |
| `SMSG-012` | pass | storage-plan.md | history survives and links | needs durable store | {"same": true, "terminal": 4, "sentLinked": true} |
| `SMSG-013` | pass | Scheduling_and_Quota_Resume.md | retry keeps failure evidence | n/a | {"n": 2, "records": [{"id": "sm-route-held", "state": "held", "attempts": ["sda-sm-route-held-1"], "reason": "Recorded destination \"Crew · Query Performance\" is no longer resolvable (the crew run ended), and … |
| `SMSG-014` | pass | Scheduling_and_Quota_Resume.md | independent ids and ordering | n/a | {"total": 6, "uniqueIds": 6, "threadsWithMultiple": 1, "sameClock": true} |
| `SMSG-015` | pass | Scheduling_and_Quota_Resume.md | manual send does not touch a schedule | n/a | {"same": true, "text": "Status check: has the write-amplification measurement for idx_events_tenant_created landed yet? If not, ping Schema Reviewer directly."} |
| `SMSG-016` | pass | Scheduling_and_Quota_Resume.md | run cancel spares user messages | n/a | {"res": {"schedules": 1, "consents": 0, "untouched": 2}, "unchanged": true} |
| `SMSG-017` | pass | storage-plan.md | projection rebuilds without client timers | needs durable store | {"same": true, "heldFields": ["Recorded destination \"Crew · Query Performance\" is no longer resolvable (the crew run ended), and the retained revision of load-profile.json is missing. Holding the dispatch rat… |
| `SMSG-018` | pass | FinalGUISpec.md | creation stays in the wand | n/a | {"creators": ["sched-open-sent", "sched-open-message", "sched-open-manage", "sched-open-build-at", "sched-create-message", "sched-create-build"], "cardCreate": 0} |

### TDG — v4 · To-Do graph and replacement

pass: 16

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `TDG-001` | pass | ToDo_Runtime.md | self-parent rejected | n/a | {"res": {"thread_id": "plan-deep", "candidate_revision": 99, "valid": false, "self_parent_ids": ["tc-00"], "parent_cycles": [["tc-00", "tc-00"]], "dependency_cycles": [], "unknown_refs": [], "cross_thread_refs"… |
| `TDG-002` | pass | ToDo_Runtime.md | parent cycle rejected | n/a | {"res": {"thread_id": "plan-deep", "candidate_revision": 99, "valid": false, "self_parent_ids": [], "parent_cycles": [["tc-00", "tc-01", "tc-00"], ["tc-01", "tc-00", "tc-01"]], "dependency_cycles": [], "unknown… |
| `TDG-003` | pass | ToDo_Runtime.md | dependency cycle rejected | n/a | {"res": {"thread_id": "plan-deep", "candidate_revision": 99, "valid": false, "self_parent_ids": [], "parent_cycles": [], "dependency_cycles": [["tc-00", "tc-02a", "tc-01", "tc-00"], ["tc-01"], ["tc-02a"], ["tc-… |
| `TDG-004` | pass | ToDo_Runtime.md | cross-thread rejected | n/a | {"res": {"thread_id": "plan-deep", "candidate_revision": 99, "valid": false, "self_parent_ids": [], "parent_cycles": [], "dependency_cycles": [], "unknown_refs": [], "cross_thread_refs": ["tc-00"], "duplicate_i… |
| `TDG-005` | pass | ToDo_Runtime.md | unknown and duplicate ids fail closed | n/a | {"unknown": {"thread_id": "plan-deep", "candidate_revision": 99, "valid": false, "self_parent_ids": [], "parent_cycles": [], "dependency_cycles": [], "unknown_refs": ["does-not-exist"], "cross_thread_refs": [],… |
| `TDG-006` | pass | ToDo_Runtime.md | reorder changes only display_order | n/a | {"ok": true, "depsSame": true} |
| `TDG-007` | pass | ToDo_Runtime.md | replacement is an owner operation | n/a | {"bad": {"ok": false, "error": "invalid_graph", "validation": {"thread_id": "plan-deep", "candidate_revision": null, "valid": false, "self_parent_ids": [], "parent_cycles": [], "dependency_cycles": [], "unknown… |
| `TDG-008` | pass | ToDo_Runtime.md | active work classified, never orphaned | n/a | {"dropped": "tc-01", "res": {"ok": false, "error": "active_work_unresolved", "disposition": {"thread_id": "plan-deep", "old_revision": 1, "new_revision": 2, "retained": ["tc-00", "tc-02a", "tc-02b", "tc-03", "t… |
| `TDG-009` | pass | ToDo_Runtime.md | rebind preserves the exact work binding | n/a | {"res": {"ok": true, "rebound": [{"from": "tc-01", "to": "tc-00", "work": ["work-bench-cold"]}]}, "work": ["work-bench-cold"], "targetWork": ["work-bench-cold"], "targetRevision": 4} |
| `TDG-010` | pass | ToDo_Runtime.md | late events need every currentness key | n/a | {"errors": {"item": "stale_item_revision", "list": "stale_list_revision", "work": "stale_work_binding", "plan": "stale_plan_version"}, "retained": 4, "status": "completed"} |
| `TDG-011` | pass | ToDo_Runtime.md | removed children cannot move a parent | n/a | {"res": true, "late": "unknown_todo", "parentStatus": "completed"} |
| `TDG-012` | pass | ToDo_Runtime.md | parent derived, no bulk complete | n/a | {"res": true, "kidStatuses": ["completed", "completed"], "summary": ["total", "completed", "active", "blocked", "skipped", "current", "nextRunnable"]} |
| `TDG-013` | pass | FinalGUISpec.md | virtualized, never truncated | n/a | {"ok": true, "stored": 128, "expected": 128} |
| `TDG-014` | pass | ToDo_Runtime.md | no verification concept | n/a | {"verifyFields": [], "verifyStatus": 0, "badAccepted": false, "badError": "invalid_status", "vocab": ["pending", "in_progress", "completed", "blocked", "skipped"], "statusAfter": "completed"} |
| `TDG-015` | pass | ToDo_Runtime.md | one outcome/cause/evidence per leaf | n/a | {"cause": "msg:plan-deep:42", "kind": "conversational", "status": "completed"} |
| `TDG-016` | pass | Scheduling_and_Quota_Resume | quota wait keeps in_progress | n/a | {"itemStatus": "in_progress", "runCondition": "quota"} |

### WONV — v4 · Wonderer convergence boundary

pass: 8

| requirement | verdict | canonical | concept | native | evidence |
|---|---|---|---|---|---|
| `WONV-001` | pass | Personas.md | Persona + Skill, not profile infrastructure | n/a | {"personas": ["Implementer", "Reviewer", "Architect", "Product Manager", "Wonderer", "Teacher"], "wonderer": "Wonderer", "hermes": false} |
| `WONV-002` | pass | Skills_System.md | leads, not conclusions | n/a | {"leads": [{"id": "lead-1", "lead": "Content-addressed segment names would make replication a copy rather than a protocol.", "seed": "append-only segment proposal", "tether": "Follows directly from the append-o… |
| `WONV-003` | pass | Collaborative_Workflows.md | abstains, excluded from denominator | n/a | {"abstain": 2, "denominator": 4, "votingDenominator": 4, "wondererCounted": true, "pct": 50} |
| `WONV-004` | pass | Collaborative_Workflows.md | reconfiguring makes a NEW role | n/a | {"revBefore": 1, "revAfter": 2, "attempts": 1, "stillWonderer": true, "before": {"support": 2, "oppose": 2, "abstain": 2, "ineligible": 0, "denominator": 4, "support_pct": 50, "quorum": "tie", "tie": true}, "ok… |
| `WONV-005` | pass | Collaborative_Workflows.md | leads need research or a decision before the Plan | n/a | {"leads": [{"id": "lead-1", "state": "hypothesis"}, {"id": "lead-2", "state": "researched"}]} |
| `WONV-006` | pass | Personas.md | Wonderer is additive, never a core replacement | n/a | {"required": false, "inRequired": false, "core": 4} |
| `WONV-007` | pass | Collaborative_Workflows.md | debate without concluding | n/a | {"msgs": 0, "vote": null, "votingRole": false} |
| `WONV-008` | pass | Collaborative_Workflows.md | research handoff before Plan inclusion | n/a | {"total": 2, "entered": [{"id": "lead-2", "state": "researched"}], "unresearchedEntered": 0} |

