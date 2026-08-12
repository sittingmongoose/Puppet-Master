# Plan-Owner Delta — U11 Prism II final cumulative update

Concept: `QwenUsageConcept/u11-prism` · Packet: `PM_Usage_Concept_Update_Final_Cumulative_2026-08-08` §06 · Date: 2026-08-11

Status key: **demonstrated** = U11 now shows the state end-to-end in the concept; **deferred/named-owner** = U11 only represents the state and the real implementation belongs to the named Plan owner.

| Plan owner | What u11 demonstrates | Disposition |
|---|---|---|
| Usage owner docs (`Plans/usage-feature.md`) | Full final-cumulative dataset: BSD silent/advice/duplicate, attachment transform, operational maintenance, host/env lineage, capacity envelope, telemetry-unavailable estimate, complete purpose taxonomy. | demonstrated; production store/projections deferred/named-owner |
| Multi-Account (`Plans/Multi-Account.md`) | Account rows with priority + last-used + "Use next" (cmd.provider.switch_route — future work only, in-flight never moved) and "Open provider console" (provisional candidate). Requested vs used stays visible only when it matters. | demonstrated; production routing policy deferred/named-owner |
| FinalGUISpec (`Plans/FinalGUISpec.md`) | Context ring compact module verified against packet §05 (source colors, inline cache, human labels, zero forbidden labels); new Maintenance & operations widget and estimate row follow the value-state vocabulary; theme/width matrix 8×5 all green. | demonstrated; canonical GUI rules deferred/named-owner |
| Models System (`Plans/Models_System.md`) | Requested/effective model divergence (thread:t-91 switch) and account divergence (ue-608 fallback); vision:true model hosting attachment transform (ue-602). | demonstrated; capability authority deferred/named-owner |
| CLI-bridged providers (`Plans/CLI_Bridged_Providers.md`) | CLI update lifecycle ops-1: check → wait-for-idle → install → verify → rollback; verify model call recorded as separate validation event ue-609 (installer time is never tokens). CLI-owned OAuth profiles stay distinct from API routes. | demonstrated; lifecycle execution deferred/named-owner |
| Goal Runtime (`Plans/Goal_Runtime.md`) | Concurrency envelope on all three runs (hard max / configured / advertised / effective / sustainable); six specialists in three waves; reserved capacity for synthesis/testing/repair. Usage supplies forecast + envelope; admission stays with the runtime. | demonstrated; admission/scheduling deferred/named-owner |
| Orchestrator/Subagents | Run detail inspector shows measured state only and links semantically to Goals/Crew; never a second orchestrator. | demonstrated |
| Planning Wizard / PRD Builder | run:plan-12 (internal visibility) with route plan stages: high-quality conversation route, background extraction routes, reserved synthesis/audit. | demonstrated |
| Free Models/catalogs (`Plans/Free_Models.md`) | Free lens renders cooldown ("Cooldown · back in 40m", fixture 6); unconfigured upstream providers never appear; probes attributed to validation. No Free Models quota ledger. | demonstrated; catalog policy deferred/named-owner |
| Prompt Pipeline | Context segment families (Messages / System / Tools / Skills & MCP / Memory / Summaries / Attachments) with stable-prefix identity + cache epoch + PM-derived tool-schema overhead. | demonstrated |
| Assistant Chat | Mid-turn redirect (interrupt + resume with wasted tokens), thread request lineage, cross-project child with path redaction. | demonstrated |
| Settings registry | U11 is a consumer only: quick-controls sheet reads settingsDefaults, never owns policy; every policy change deep-links to Settings (providers/usage managers). | demonstrated (consumer contract) |
| Media | Attachment transform receipt.jpg → pm_vision_ocr → art-91 with consent/privacy/local-compute fields. | demonstrated |
| MCP/Tools/Skills | mcp_router (ue-603, keyless shared route) + skill_search (ue-604); tool stats + self-recovery receipts (toolops). | demonstrated |
| Testing/Browser/Artifacts | No Playwright-shaped Usage categories (packet §04); verification uses an external harness outside the dataset. | demonstrated |
| Server/Project Sync (`Plans/Server_Project_Sync.md`) | Offline outbox ops-2 → reconnect replay ue-610 (operationalRef); server continuity ops-3 on TrueNAS/Docker while client offline; slow load ≠ provider usage. | demonstrated; sync engine deferred/named-owner |
| Notifications (`Plans/Notifications.md`) | Sound preview ops-4 + notification test-send ops-5 — operational receipts, never model usage. | demonstrated; delivery deferred/named-owner |
| Provider installation lifecycle | Covered by CLI_Bridged_Providers row above (failure class + outcome + affected connections fields on ops-1). | demonstrated |
| Storage/events (`Plans/Storage_events.md`) | Extended attempt schema (event-schema-delta.json), immutable ledger semantics, 90-day retention, removed-account history preservation, export records JSONL with stable IDs. | demonstrated; storage layer deferred/named-owner |
