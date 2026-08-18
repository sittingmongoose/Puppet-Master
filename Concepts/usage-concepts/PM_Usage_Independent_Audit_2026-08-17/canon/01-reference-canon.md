# Reference Canon — Usage preserved features, terminology, supersessions, provider-CLI rules, contradictions

**Mode:** audit / report only. No file under `Concepts/usage-concepts/QwenUsageConcept/**`, either packet, `Plans/**`, PMConcept6/7, `pm6-build/**`, `pm7-tools/**`, or `puppet-master-rs/**` was created, edited, or deleted. No git write commands, no build/assemble scripts, and `u11-verify.mjs` was not run.

**Built from (all read in full):** the six `reference/` handoffs, `REFERENCE_SUPERSESSIONS.md`, `SHARED_PROCESS_RULES.md`, `SOURCE_AND_PRECEDENCE_MAP.md`, `PROVIDER_CLI_FINAL_ADJUDICATION.md`. Core packet files `00`, `01`–`06`, `AUDIT_PROMPT.md`, `IMPLEMENTATION_PROMPT.md`, `PROMPT_USAGE.md`, `PACKET_MANIFEST.json`, `CANDIDATE_COMMAND_ID_REGISTER.json`, `IMPACT_REGISTER.template.json`, `DECISION_COVERAGE.json` (107 topics), and the three remaining correction-packet files were read as the comparison side for Section E.

## Path legend (all citations are `KEY:line`)

| Key | File |
|---|---|
| `HER` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/reference/HERMES_USAGE_HANDOFF.md` |
| `SEC` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/reference/SECOND_USAGE_HANDOFF.md` |
| `ORG` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/reference/ORIGINAL_SETTINGS_USAGE_HANDOFF.md` |
| `SRV` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/reference/SERVER_BACKBONE_USAGE_RETURN.md` |
| `EGO` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/reference/EGOLITE_USAGE_CHAT_RETURN.md` |
| `CR` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/reference/CONCEPT_RULES.md` |
| `SUP` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/REFERENCE_SUPERSESSIONS.md` |
| `SPR` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/SHARED_PROCESS_RULES.md` |
| `SPM` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/SOURCE_AND_PRECEDENCE_MAP.md` |
| `P00`…`P06` | the core packet files `00_START_HERE.md` … `06_PLAN_COMMAND_WIRING_DRY_IMPACT.md` |
| `DEC` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/DECISION_COVERAGE.json` (cited by topic id) |
| `MAN` | `.../PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/PACKET_MANIFEST.json` |
| `ADJ` | `.../PM_Usage_Dependency_and_Work_Correction_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md` |
| `CGP` | `.../PM_Usage_Dependency_and_Work_Correction_2026-08-13/CORRECTION_GOAL_PROMPT.md` |
| `RRR` | `.../PM_Usage_Dependency_and_Work_Correction_2026-08-13/REFERENCE_REVIEW_AND_REPAIR_REQUIREMENTS.md` |
| `RMF` | `.../PM_Usage_Dependency_and_Work_Correction_2026-08-13/00_READ_ME_FIRST.md` |

Precedence applied throughout: `ADJ` + core packet > core browser rule > core Product-Onboarding rule > core server-first rule > latest left Activity Bar canon (`SUP:7-22`), and superseded lineage language is evidence, not requirement (`SUP:24`).

Status tags used in Section A: **[LIVE]** = live requirement from a live reference clause; **[LIVE-CORE]** = live and restated by the core packet; **[LIVE-DEFERRED]** = the clause is live as canon but its owner deferred integration (see C25) — scorable only where the core packet restates it.

---

# A. Live preserved-feature checklist

## A1 — Ownership, boundaries, hierarchy

1. **[LIVE-CORE]** Preserve the three-way ownership boundary verbatim: *Settings decides what should happen next; Chat explains what is about to happen now; Usage explains what actually happened, what it consumed, and what state remains.* — `HER:22-26`; restated `P00:9-18`.
2. **[LIVE-CORE]** Usage stays canonical for: provider/CLI-reported usage; observed token, cache, time, cost, allowance, reset, cooldown history; current balances and pressure projections; execution-time requested/effective route receipts; helper/retry/replay/subagent/transformation attribution; data quality, freshness, settlement, evidence provenance; exports and historical inspection. — `HER:40-46`.
3. **[LIVE-CORE]** Settings stays canonical for provider/account/connection config, model visibility/favorites/aliases/priority/roles, fallback & continuation policy, included-vs-extra behavior, warning preferences, auxiliary-model defaults, probe/catalog refresh policy — Usage must not rebuild any of it. — `HER:28-36`, `HER:48`, `ORG:11`, `P00:20`.
4. **[LIVE]** Usage must not implement a second provider manager, Goal scheduler, Crew editor, or resource allocator; no second provider/Usage/Settings/notification/progress/authentication/installation/browser/Goal system anywhere. — `SEC:401`, `SPR:39`.
5. **[LIVE-DEFERRED]** Usage does not own scheduling, installations, browser execution, capture, Project Move, backup, update, Server connections, or resource governance. — `SRV:7`.
6. **[LIVE-CORE]** The five-level shared hierarchy `Provider family → Account/profile → Connection → Product/entitlement → Models/capabilities` is the organizing model and must not be exposed on every screen. — `HER:52-58`, `ORG:15-21`, `ORG:44`, `P01:5-11`.
7. **[LIVE-CORE]** Free Models is a catalog/routing grouping only — never a quota, billing, account, or usage identity; no Free Models quota ledger; no second account switcher. — `HER:60`, `ORG:408`, `P01:122`, `P01:135`.
8. **[LIVE-CORE]** Deep links target a *semantic destination* (surface, manager, provider_family_id, account_id?, connection_id?, product_id?, model_id?, section ∈ {usage_and_extra_usage, routing, models, diagnostics}, setting_id?, focus_reason) by stable identity. — `HER:687-698`, `SEC:403`.
9. **[LIVE-CORE]** Usage exposes compact read-only projections Settings may consume (included remaining, extra balance, packs + expiration, saved resets, pressure, next reset/cooldown, post-plan rate, last success, last failure, cache read/write + hit rate, run-out projection, source freshness, data-quality status, validation/probe activity); provider billing math never moves into Settings components. — `HER:658-677`, `P03:99-117`.
10. **[LIVE]** Usage non-goals stay non-goals: provider onboarding/credential entry, account profile isolation, favorite/alias/priority editing, approval-policy configuration, FileSafe rule editing, compaction-strategy configuration, tool/MCP enablement, Persona/subagent-role editing, catalog import validation, attachment-routing policy, direct purchase flows. — `HER:746-758`.

## A2 — Event model and attribution

11. **[LIVE-CORE]** One real provider attempt = one immutable usage event, grouped under the logical turn / Goal / PlanningRun / Crew / thread request, never overwritten by the final successful route. — `HER:66`, `SEC:162`, `SEC:426`, `P02:25`.
12. **[LIVE-CORE]** The complete attempt inventory stays individually attributable: primary attempt, failed attempt, fallback replay, model-switch replay, subagent calls, Crew member, Crew reducer/synthesizer, vision helper, compression helper, web extraction helper, approval reviewer, MCP router, skill search, catalog/model validation probe, attachment transformation, MoA reference calls, MoA aggregation, conversation replay after route change. — `HER:72-88`, `SEC:144-160`.
13. **[LIVE-CORE]** Never collapse those into the final successful model, and never double-count them as both helper activity and main-turn activity. — `HER:90`.
14. **[LIVE]** Every event carries the minimum shared identity set (`usage_event_id`, `logical_turn_id`, `attempt_id`, `parent_event_id?`, `session_id`, `thread_id`, `goal_id?`, `run_id?`, `subagent_id?`, provider/requested+effective account/connection/product/requested+effective model, `billing_route`, purpose, conversation_mode, requested+effective access profile, reasoning_effort, speed_mode, started_at, finished_at, settlement_status, source_class, data_quality, receipt_ref). — `HER:96-129`.
15. **[LIVE-CORE]** Every event preserves immutable execution-time snapshots; historical events are never joined to today's Settings; alias, Persona, project/global default, and policy changes must not rewrite old usage. — `HER:92`, `SEC:263`, `SEC:286`, `P01:145`, `DEC:USE-004`.
16. **[LIVE]** Retain the auxiliary purpose taxonomy including `planning_conversation`, `prd_conversation`, `crew_synthesis`, `verification`, and `repair`. — `SEC:166-186`.
17. **[LIVE-CORE]** Default UI may aggregate into human buckets; expanded detail preserves every individual attempt and child. — `HER:471`, `HER:588`, `SEC:188`, `P02:73`.
18. **[LIVE]** Never persist raw credentials, raw CLI token blobs, or directly retrievable secret references in Usage. — `HER:131`, `HER:565`.

## A3 — Context, compaction, cache

19. **[LIVE]** Represent a context-maintenance event with its full semantics: operation_kind (proactive_prune, automatic_compaction, manual_compaction, micro_compaction, context_reselection, rotation_repack, model_switch_repack, cache_rebuild), trigger_kind, engine/strategy/config hash, context_epoch before/after, tokens before/after/reclaimed, protected tail/head, skill markers, cache_effect, status (started, no_gain, soft_deferred, completed, timed_out_discarded, failed), attempt_number, duration, helper event ids, source_class, data_quality, failure/defer reason. — `HER:143-203`.
20. **[LIVE]** No raw compacted prompts or giant technical logs in the main Usage view; default is the compact two-line presentation with expandable why/before-after/helper/cache/committed-or-not detail. — `HER:207-224`.
21. **[LIVE-CORE]** A deterministic local prune with no model call has zero provider tokens and is still a context-maintenance event; zero must stay distinct from unknown. — `HER:226`, `P04:92`.
22. **[LIVE]** `cmd.chat.compact_context` stays a context operation, not fake user work; it must not mutate historical usage totals; helper calls it causes are new events attributed to compression/context_maintenance. — `HER:230`; consistent with `DEC:CTX-004`.
23. **[LIVE-CORE]** Record a prompt-cache snapshot per attempt: requested/effective cache policy, provider marker format + supported, stable_prefix_hash, tool_schema_hash, skill_slice_hash, mcp_surface_hash, context_epoch, cache read/write tokens, expectation vs observed hit, invalidation_reason, source_class, settlement_status, data_quality. — `HER:238-258`, `SEC:214-219`, `P02:79-88`.
24. **[LIVE-CORE]** Retain the material cache-invalidation reason set (provider/account/connection/model/effort/speed-mode/system-or-persona/tool-schema/MCP/skill-slice/memory-or-context-assembly changes, compaction, branch, fallback-or-replay, provider_did_not_honor_marker, unknown). — `HER:262-278`, `SEC:222`, `P02:90`.
25. **[LIVE]** Never infer cache or route support from a model family alone — key it to effective provider, endpoint, connection, adapter, model, and mode, and keep source/version/route evidence (the DeepSeek-on-OpenCode exclusion is the proof case). — `HER:280`, `SEC:224`.
26. **[LIVE]** Purely local context work (selection, pruning, indexing, ZIP extraction, Context Lens inspection) may consume local resources but is not provider usage. — `SEC:208`.
27. **[LIVE]** Provider usage *is* recorded when a provider/model is actually called for compression/summary generation, memory synthesis or verification, provider-backed embedding/index generation, context replay, or attachment transformation. — `SEC:200-207`.
28. **[LIVE]** Rewind changes conversation state and never deletes historical usage; branching creates new branch/thread lineage with ancestry still addressable; branch-with-another-model replay is recorded separately. — `SEC:228-232`.
29. **[LIVE-CORE]** A helper may consume usage even when its result is discarded (timeout, no gain, lock contention): context mutation and provider settlement are separate facts. — `HER:196-224`, `P02:108`.

## A4 — Tool recovery, approvals, active-turn redirects

30. **[LIVE]** Represent tool recovery with its full field set (logical_tool_operation_id, tool_call_id, parent_turn_id, subagent_id?, tool_id, failure_class, retryability, recovery_hint_kind, spill_or_artifact_ref?, visible/full output chars, truncated, cwd_changed, already_applied_noop, ambiguous_match_count, negative_cache_hit, verification_status, retry_tool_call_ids[], final_outcome). — `HER:290-310`.
31. **[LIVE]** Tool-recovery rules: each invocation is an attempt; retries group under one logical tool operation; an already-applied patch success-no-op is not a failed edit and implies no file mutation; reading a spill artifact shows recovery without duplicate command execution; FileSafe/permission denial is not a transient tool failure; local tool calls keep provider cost at zero rather than estimated; spill refs are redacted, bounded, retained, and cleaned per canonical artifact policy. — `HER:314-320`.
32. **[LIVE]** Represent active-turn redirects (original turn + attempts, correction message, provider_support ∈ {native_redirect, interrupt_and_resume, unsupported}, abort_status, visible partial output preserved, `hidden_reasoning_replayed = false`, new/resumed attempt ids, cache_effect, wasted/aborted tokens and cost, settlement_status); group under the user's logical correction and never hide spend because the first attempt was interrupted. — `HER:337-360`, `SEC:237-245`.
33. **[LIVE]** Consume (never own) approval-decision receipts: operation digest/kind, requested/effective access profile, conversation mode, mode ceiling applied, scope summary, decision ∈ {denied, allowed_once, allowed_session, allowed_persistent, auto_approved, filesafe_blocked}, reviewer usage event, consecutive_denial_count, breaker_triggered, filesafe_outcome_ref, policy_source, wait_duration_ms. — `HER:379-403`.
34. **[LIVE]** Usage may display approval wait time, approval-reviewer helper cost, denials and repeated-denial breaker outcomes, Full Access limited by Review mode, and FileSafe blocking after a permissive policy. — `HER:405-411`.
35. **[LIVE]** Usage must not expose raw command arguments, secrets, or protected paths in ordinary summaries; exact redacted detail lives behind the canonical receipt/detail reference. — `HER:413`.

## A5 — Subagents, Goal, Crew, capacity, forecasts

36. **[LIVE-CORE]** Preserve the per-child lifecycle record (child_agent_id, parent goal/turn, role, requested/effective persona, provider/account/connection/model, effort, speed_mode, write_mode, start/finish, status, progress_state, stall/timeout reason, tool_rounds, context_epoch, cache_lineage_ref, input/output/reasoning/cache-read/cache-write tokens, cost_or_allowance, queue_time_ms, active_time_ms, result_delivery_receipt, redacted_trace_ref). — `HER:423-455`, `P03:65-76`.
37. **[LIVE-CORE]** Distinguish configured PM maximum, provider/account advertised-or-discovered maximum, current effective maximum, predicted sustainable maximum, actual peak concurrency, and the three queue reasons (PM policy, provider/account limitation, runtime capacity). — `HER:459-467`, `SEC:54-74`, `P03:7-18`.
38. **[LIVE-CORE]** Unknown or dynamically limited maxima must never render as zero. — `HER:469`.
39. **[LIVE]** Goal identity/lineage per attempt (goal_id/goal_run_id, parent_goal_id, owning_surface, visibility ∈ {visible, internal, orchestrator}, phase, logical_turn_id, attempt_id, route, purpose, timing, status); checkpoint, pause, resume, replan, stop, branch, or restart never erases prior usage, and resumed work keeps the same Goal lineage unless the user explicitly branches. — `SEC:24-48`.
40. **[LIVE-CORE]** Goal admission/forecast receipt fields (requested_children, configured maximum, provider-discovered maximum, current effective maximum, predicted sustainable maximum, admitted, queued, native-usage/cost/elapsed ranges, reserves for parent synthesis + testing + verification/repair, reset/cooldown inputs, confidence, source freshness, recommendation) with requested-vs-admitted-vs-queued reported as a completion forecast, not a hard provider concurrency limit. — `SEC:54-85`, `P03:24-38`.
41. **[LIVE-CORE]** Required specialists remain required: low capacity reduces fan-out but never erases required independent specialist passes (`6 required specialists / 2 concurrent / 3 waves`). — `SEC:87-96`, `P03:20`.
42. **[LIVE-CORE]** Forecasts are advisory and must show confidence and generation time, and may be invalidated by model change, account switch, new child work, throttling, or a reset. — `SEC:135`, `P03:40`.
43. **[LIVE]** Planning Wizard / PRD Builder user discussion is a distinct high-quality purpose; the feasibility forecast reserves capacity for integration, user discussion, testing strategy, final audit, and likely repair before extraction children; Usage reports recommendation inputs and results and never owns scheduling. — `SEC:319-336`.
44. **[LIVE]** Crew record fields (crew/template id, requested vs effective member count, concurrent, queued, wave number, member role + Persona, per-member requested/effective route, member usage, provider-backed coordination, reducer/synthesis usage, downsizing reason); keep requested composition separate from effective execution and never collapse mixed-provider Crew under one member's provider. — `SEC:296-313`.
45. **[LIVE-CORE]** Thread/agent/cross-project lineage (source/target/parent thread, request_id, spawn_reason, agent_id, parent_agent_id, task/Goal lineage); never merge another thread's usage without preserving both identities; cross-project work requires explicit permission and records source/destination project, grant scope, and effective route without exposing sensitive project paths by default. — `SEC:270-284`, `P03:95-97`.
46. **[LIVE]** Thread-local model/account/Persona/effort/Normal-Fast/access/Crew changes apply to future calls in that thread only. — `SEC:286`.

## A6 — Provider-native units, plan/settlement, multi-account, Free Models

47. **[LIVE-CORE]** Do not force every provider into "tokens remaining": support requests, weighted units, credits, dollars, messages, reset windows, packs, or no reliable meter, each with its own quality state. — `SEC:105-118`, `P01:46`, `DEC:USE-005`.
48. **[LIVE-CORE]** Track the provider-native state set: included usage, extra usage balance, usage packs + expiration, saved resets + expiration, free allowance, paid usage after plan, API usage, current post-plan rate, spending guard, next reset/cooldown, current pressure. — `ORG:172-180`, `HER:660-670`, `P01:33-43`.
49. **[LIVE-CORE]** Keep four distinct concepts separate — provider allowance, optional extra usage, API spend, and the PM spending guard — and never ship one universal budget setting. — `ORG:210-219`, `P01:46`, `P05:56`.
50. **[LIVE-CORE]** Render provider-specific continuation choices only when the selected connection/product supports them, with adapter-supplied wording/consequences/rate summary, keeping Codex, Claude API, Alibaba Coding/Token, Z.AI, OpenCode, Kimi, and Free Models product distinctions explicit. — `ORG:221-252`, `P01:78-97`.
51. **[LIVE-CORE]** Group same-provider accounts under the provider family with per-row nickname, owner/type, connection(s), plan/product, active/disabled, pressure/reset/cooldown, what happens next, priority, requested/effective, last successful use; `Use next` changes future routing only and never silently migrates an in-flight request; switches show one plain reason, not a raw policy trace; Settings and Usage use the same routing service; manual selection shows its scope. — `ORG:329-362`, `P01:99-118`.
52. **[LIVE-CORE]** Requested account vs effective account vs connection used stay separable, with expanded details showing Requested, Used, Connection used, product/plan, and switch reason. — `ORG:85-102`, `HER:736`, `P01:26`.
53. **[LIVE-CORE]** A Free Models Usage row identifies model, underlying provider, account/profile, connection/product, selected-through-Free-Models, and free/cooldown/removed state; removed entries persist as *No longer free/available*; the provider list is never a hard-coded permanent enum. — `ORG:386-410`, `P01:124-133`, `DEC:USE-014`.
54. **[LIVE-CORE]** Health/capability probes can consume a free provider's quota; attribute them as probe/validation usage rather than user work, and aggressive probing is not a normal user setting. — `ORG:412`, `HER:527`, `P04:104`.
55. **[LIVE-CORE]** Claude CLI and Antigravity CLI OAuth are CLI-owned profile routes; PM does not present PM-direct OAuth for them; record the exact effective CLI profile, connection, product/plan, and billing/allowance route. — `SEC:364-369`, `SPR:41`, `P01:139-141`, `DEC:PROV-014`.
56. **[LIVE]** "Authenticated" never proves which subscription, plan, API account, or billing path paid; authentication source and observed product/billing route stay separate. — `SEC:371`.
57. **[LIVE]** Each attempt carries a credential-route snapshot without secrets (authentication_method, credential_source_class ∈ {cli_owned_profile, pm_oauth, api_key_secret_ref, vault_ref, command_helper_ref, environment_ref, local_endpoint, no_auth}, account, connection, profile_home_id?, endpoint_or_harness, expected vs actual product/plan, billing_route, route_selection_reason, identity/inference verification times); a silently selected environment key is a material route change and must be visible. — `HER:535-567`.
58. **[LIVE-CORE]** Preserve/reuse the existing command IDs: `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh`, `cmd.usage.export`, and the shared widget commands (`cmd.widget.add/remove/resize/configure/move/reset_layout`). — `ORG:364-368`, `ORG:452-464`, `P06:34-40`.
59. **[LIVE-CORE]** `cmd.provider.usage.open_management` is only a candidate and is not a purchase; any real purchase, pack, saved-reset, or auto-reload execution needs its own typed command, confirmation, permission, result, and receipt, and provider-specific command IDs are not minted before direct execution exists. — `ORG:466-474`, `P06:53-55`.
60. **[LIVE]** Resolve the `cmd.dashboard.add_widget` vs `cmd.widget.add` overlap; the shared widget command stays canonical with host/page context. — `ORG:476`.

## A7 — Data quality and settlement grammar

61. **[LIVE]** Every amount retains `source_class`, `settlement_status`, `projection_freshness` (current/refreshing/stale), and `projection_health` (healthy/degraded/unavailable). — `HER:614-642`, `HER:737`.
62. **[LIVE]** The data rules: absent is not zero; unknown is not unavailable; a missing cache-write field is not `0 cache writes`; failed and aborted attempts stay in history; the provider-reported receipt is retained alongside normalized values; derived/estimated values preserve method and pricing/version snapshot; historical route, price, free-state, and capability interpretation is immutable. — `HER:646-652`.
63. **[LIVE-CORE]** Zero never stands in for unknown, and every value carries a quality state. — `SEC:122-133`, `P04:79-92`, `DEC:USE-006`.
64. **[LIVE-DEFERRED]** Provider readiness and usage-telemetry availability are separate: missing telemetry must not make an otherwise ready connection look unauthenticated. — `SRV:57`; restated `P04:94-98`, `DEC:PROV-027`.
65. **[LIVE-CORE]** Cookie-based telemetry stays optional/experimental and must never gate provider readiness. — `P04:98`, `DEC:PROV-027`.

## A8 — Local, maintenance, and time work that is not model usage

66. **[LIVE-DEFERRED]** Not provider tokens/charges: Browser Program execution; built-in browser CPU/GPU, representations, screenshots, video, traces, retries, artifacts; Git/Jujutsu/SSH/source operations; installation/update/authentication probes; Tool Store work; runtime/cluster/registry connection checks; Project Move, backup/restore, update, indexing, hydration, reconnect traffic; container/Kubernetes execution unless it invokes a separately billed external service. — `SRV:26-34`; overlapping `EGO:7`; restated `P04:40-56`.
67. **[LIVE-DEFERRED]** Only actual model/provider events contribute model tokens, provider quota, plan usage, or provider cost. — `SRV:21`.
68. **[LIVE]** Resource wait, elapsed time, bytes, tool version, recording duration, and failure class may appear in diagnostics/operation receipts but are never mixed into token/cost totals; installer bytes/time never enter token totals. — `EGO:22`, `SRV:36`, `P04:70`.
69. **[LIVE-CORE]** Separate provider-active time, queued-for-provider-capacity, queued-for-worktree/writer-lease, queued-for-port/test/debug resource, waiting-for-approval, waiting-for-reset/cooldown, local tool/runtime time, offline/outbox, reconnect/sync/replay/snapshot, and maintenance from total elapsed — a two-hour Goal with twelve minutes of model execution must read that way. — `SEC:346-356`, `P03:44-58`.
70. **[LIVE]** Browser Program efficiency telemetry (model turns, tool calls, input/output tokens, snapshot count/bytes/token estimate, action count, wall time, success/retry, recording on/off) is retained but kept separate from provider price/plan settlement. — `EGO:26`.
71. **[LIVE]** Ordinary spellcheck is local, never appears in Usage, and uses underlines/suggestions and never automatic replacement; any future cloud/model grammar assistant is a separate opt-in feature attributed as provider usage with privacy, route, and cost disclosure. — `SEC:377-379`.
72. **[LIVE]** Not usage: a memory fading from active recall, a Persona being selected, local history search, local Context Lens selection, local spellcheck. Provider-backed memory summarize/verify/compress/embed calls *are* usage and carry their purpose. — `SEC:249-261`.
73. **[LIVE-CORE]** Catalog-only network refresh is operational telemetry, not provider model usage; retain catalog-refresh evidence (source, version/commit, hash, prior active version, refresh mode, stale_data_served, last_known_good_used, status, failure_backoff_until, added/removed/changed counts, free-state/auth-flow/capability changes, activated_at) and create a separate probe usage event whenever a real model request is sent. — `HER:479-527`, `P04:100-106`.

## A9 — Presentation, density, terminology, GUI, concept-shell rules

74. **[LIVE]** The default Usage page stays human-readable with the recommended top-level grouping: User work / Subagents / Vision and media / Context and compression / Web and research helpers / Tool and MCP helpers / Validation and probes / Retries, fallbacks, and replays. — `HER:573-586`.
75. **[LIVE]** The undifferentiated detailed ledger is inspection/export-only, never the default surface. — `HER:588`.
76. **[LIVE]** Keep the established turn-card and expanded-system-activity density (route line, token line, helper/subagent line; helper rows with their own route and billing). — `HER:592-604`.
77. **[LIVE]** Do not regress the established Usage feature set: separate input/output/reasoning/cache-read/cache-write buckets (`HER:730`); no double counting (`HER:731`); session/project/model/provider/account/subagent/tool grouping (`HER:732`); plan allowance vs API cost/value separation (`HER:733`); resets, cooldowns, overage, packs, saved resets, provider-specific continuation (`HER:734`); burn rate and run-out estimates with provenance (`HER:735`); requested/effective account and model (`HER:736`); current/refreshing/stale and healthy/degraded/unavailable semantics (`HER:737`); the source-authority distinctions (`HER:738`); widgets, responsive layouts, theme coverage, no left-edge color bars, no emojis, Slint 1.17.1 portability (`HER:739`); realistic demo content and wired interactions (`HER:740`). Core restatement of the display half: `P05:38-54`.
78. **[LIVE-CORE]** Progressive disclosure: the default view answers connected? / which plan or connection? / how much is left? / what happens next? / which account or connection ran? / is extra paid usage enabled?; advanced answers why routing switched, which meter or pack was deducted, what rate applies, what source reported it, which policy/version is active; support details answer the rest. — `ORG:484-505`, `P05:5-17`.
79. **[LIVE]** Keep wording human and provider-specific; never expose internal accounting terminology merely because the registry stores it. — `ORG:81`, `ORG:516`.
80. **[LIVE]** No emojis anywhere — inline SVG icons only. — `ORG:515`, `HER:739`, `SPR:47`, `CR:9`, `DEC:VIS-001`.
81. **[LIVE]** Slint 1.17.1 portability is required; avoid Web-only blur/CSS assumptions, arbitrary DOM measurement, unbounded nested scrolling, and nonportable physics in the production contract. — `ORG:514`, `HER:739`, `SPR:48`, `DEC:VIS-004`.
82. **[LIVE]** Accessibility is explicitly not a redesign goal or acceptance category (see contradiction E17 for the reduced-motion tension). — `ORG:513`.
83. **[LIVE]** Theme coverage: Friendly, Glass, Retro, Basic in light and dark plus reduced motion, with SVGs not emoji, tested across supported widths including narrow and very wide, preserving smooth widget move/resize without flashing, dead-space use, alignment, and context-detail behavior. — `CR:9`, `P05:81-83`, `DEC:VIS-002`, `DEC:VIS-003`.
84. **[LIVE]** Concept-delivery obligations: work only in `Concepts/<topic>/<model-folder>/`; keep every requested concept (never reduce a many-concept request to one); expose the exact model name via `data-concept-model`; treat PMConcept7/Plans/ConceptHub/other model folders as read-only; show a quiet simplified PM shell with open/closed/narrow/squeezed states and never remove top/bottom bars for embed mode; make important controls, variants, and configuration choices functional; ship `concept-hub.json` with a width role; test through the shared Hub with an OS-assigned port and a unique temp profile; run `Concepts/ConceptHub/validate.py` before finishing. — `CR:1-10`.
85. **[LIVE]** Use human environment names (`WSL Ubuntu`, `Home TrueNAS`, `This Windows computer`); WSL off is not an alert; container Server operations must not imply desktop proxying. Native Windows is complete without WSL and Docker/TrueNAS/Unraid/Kubernetes forms are full Servers/Execution Hosts. — `EGO:60`, `SPR:43-44`, `P04:19`.
86. **[LIVE]** Authentication surfaces show only redacted lifecycle state; no authorization codes, secrets, CLI profile paths, helper responses, Auth Browser screenshots, page content, DOM, console, or network data in Chat or Usage. — `EGO:47-56`.
87. **[LIVE-DEFERRED]** Usage rows carry stable identities, timestamps, source/freshness/currentness, and confidence, and never embed raw URLs, DOM, cookies, tokens, authorization headers, screenshots, source paths, CLI profile paths, or secrets. — `SRV:55`.
88. **[LIVE-DEFERRED]** Browser vocabulary: `one-action baseline`, `action batch`, `PM Browser Program`, `PM-native Expert Browser Program`, `external Project test command`, `optional external browser adapter`; a repository-owned Playwright suite is an external Project command whose real model/provider calls attribute normally. — `SRV:42-51`; core restatement (partial) `P04:108-110`.

## A10 — Demo/fixture obligations carried by the references

89. **[LIVE]** The 15 Hermes scenarios must be covered: automatic compaction with a helper call; local proactive prune; micro-compaction; model switch + conversation replay; terminal output spill; patch already applied; active-turn redirect; Full Access limited by Review mode; subagent wave with mixed models/accounts; free-model active probe; stale catalog served immediately; same-provider account fallback; vision alternate route; compression timeout discarded; approval reviewer and denial breaker. — `HER:706-722`.
90. **[LIVE]** The 12 Second-handoff states must be exercised: Goal admits 2 of 8 children; six mandatory specialists in three waves; high-quality planning route vs cheap extraction children; model switch replay/cache reduction; Compact Now with separately billed compression helper; branch on another provider preserving ancestry; mid-turn redirect with interrupted + resumed attempts; mixed-provider Crew with separate reducer usage; Goal waiting on port/worktree/test resource with elapsed ≫ provider-active; Claude CLI OAuth attributed to the exact CLI profile with Claude API separate; unknown/stale value not rendered as zero; cross-project child retaining both project and thread lineage. — `SEC:411-422`.

**Section A count: 90 live preserved-feature items** (of which 12 are tagged `[LIVE-DEFERRED]` and scorable only where the core packet restates them).

---

# B. Terminology canon

## B-I — Required exact user-facing strings and label sets

1. `Using Personal OpenAI` + `ChatGPT plan` — the normal-UI route line; the full hierarchy is never printed. `ORG:92-93`, `P01:16-17`.
2. `68% left`, `Resets in 2h 14m` — normal-UI pressure/reset phrasing. `P01:18-19`, `ORG:117-121`.
3. Requested≠effective sentence, canonical form: `You chose Work OpenAI, but Puppet Master used Personal OpenAI because Work OpenAI had reached its limit.` `ORG:99` (core variant at `P01:24` — see E9).
4. `Included with your plan` — ordinary settlement wording; reference API price stays in Details and must not imply actual billing. `P01:62`.
5. `What happens when included usage runs out?` — the provider-supplied continuation section heading. `P01:81`, `ORG:222`.
6. `What happens next` — the routing/continuation summary label (also used as a provider-card row). `ORG:64`, `ORG:123`, `P01:112`.
7. Continuation choices, rendered only when supported: `Stop and wait`, `Use extra balance`, `Use a usage pack`, `Use paid usage after the plan`, `Use saved reset`, `Switch account`, `Switch provider`, `Use free models`, `Use API billing`, `Ask each time`. `P01:84-94` / `ORG:227-238`.
8. Settlement labels: `Included`, `Extra balance`, `Usage pack`, `API billed`, `Free allowance`, `No charge observed`, `Unknown`. `P01:66-74`.
9. Data-quality labels (user-facing form): `Provider reported`, `CLI reported`, `PM observed`, `Derived`, `Estimated`, `Unknown`, `Partial`, `Stale`. `P04:81-90`, `DEC:USE-006`.
10. `Provider ready · Usage details unavailable` — the telemetry-unavailable string. `P04:96`.
11. Context-maintenance default copy: title `Context compacted`, detail `18.2K tokens reclaimed · Cache restarted · 1 helper call`. `HER:212-213`.
12. Tool-recovery copy: `Test command output was truncated` / `Full redacted output was saved and inspected; the command was not rerun.` `HER:325-326`.
13. Turn-card shape: `GPT-5.6 · Personal OpenAI · ChatGPT plan` / `42.1K input · 3.2K output · 18.0K cache read` / `2 helper calls · 1 subagent`. `HER:593-595`.
14. Expanded system-activity rows: `Compression helper`, `Vision helper`, `Fallback replay` with route and billing on the right. `HER:601-603`.
15. The 14-term human label list, used consistently across Settings and Usage: `Provider`, `Account`, `Connection`, `Plan`, `Included usage`, `Extra usage balance`, `Usage pack`, `Paid usage after your plan`, `API usage`, `Free allowance`, `Saved reset`, `Spending limit`, `What happens next`, `Connection used`. `ORG:52-65`.
16. Provider-native state labels as the core packet renders them: `Included usage`, `Extra usage balance`, `Usage packs and expiration`, `Saved resets and expiration`, `Free allowance`, `Paid usage after plan`, `API usage`, `Current post-plan rate`, `Spending guard`, `Next reset/cooldown`, `Current pressure`. `P01:33-43` (drift vs B-I-15 — see E11).
17. Detail-view triad: `Requested`, `Used`, `Connection used` (+ product/plan and reason). `ORG:102`, `P01:26`.
18. Free Models manager block: `Free Models`, `Auto-Add Free Models: On`, `Last checked: 18 min ago`, `10 ready · 3 need setup · 2 temporarily limited`. `ORG:379-382`.
19. Free-model row states: `Ready` / `needs setup` / `cooling down` / `no longer free`; retired entries read `No longer free/available`. `ORG:390`, `ORG:410`, `DEC:USE-014`.
20. Capacity disclosure block: `Requested: 10` / `Admitted concurrently: 2` / `Remaining: queued in waves` / `Reason: completion forecast, not a hard provider concurrency limit`. `SEC:79-82`.
21. Specialist-wave phrasing: `6 required specialists` / `2 concurrent` / `3 waves`. `SEC:92-94`.
22. Access-profile labels: `Ask for approval`, `Auto accept edits`, `Auto`, `Full Access`; conversation mode is a separate ceiling (Plan/Review remain effect-limited). `HER:369-375`.
23. Sign-in lifecycle strings (redacted, the only permitted forms): `Secure sign-in waiting for you`, `Sign-in completed`, `Sign-in expired`, `Could not complete sign-in`. `EGO:52-55`.
24. Environment labels: `WSL Ubuntu`, `Home TrueNAS`, `This Windows computer`. `EGO:60`.
25. Browser vocabulary: `one-action baseline`, `action batch`, `PM Browser Program`, `PM-native Expert Browser Program`, `external Project test command`, `optional external browser adapter`. `SRV:42-48`.
26. `Provider Setup Required` — the runtime-demand outcome string when no compatible provider CLI is ready. `ADJ:43`.
27. `Automatic — show each provider's actual limits` — the replacement label for `ai.usage.usage-windows`. `ORG:261`.
28. `Plans, limits, and extra usage` — the replacement name for `ai.usage.quota-management`. `ORG:279`.
29. Default-view question set (wording anchor for headings/summaries): what am I using / how much is left / when does it reset / what will happen next / which account or connection ran / am I likely to finish / what consumed the most. `P05:7-15`, `ORG:486-492`.
30. Top-level grouping labels: `User work`, `Subagents`, `Vision and media`, `Context and compression`, `Web and research helpers`, `Tool and MCP helpers`, `Validation and probes`, `Retries, fallbacks, and replays`. `HER:578-585`.
31. Separator convention: the middle dot `·` joins compact facts on one line; never a raw pipe or comma-run. Derived from `HER:213`, `HER:594-595`, `P04:96`.
32. Time display: user/system timezone, 24-hour by default, UTC retained in durable records. `P03:60`, `DEC:USE-020`.
33. Free Models identity phrase in a Usage row: `Selected through Free Models` plus the underlying provider/account/connection. `P01:126-133`.
34. Compact-progress vocabulary for maintenance detail: `Installation/host/environment`, `Check/schedule/wait/install/verify/rollback time`, `Failure class`, `Target version`, `Outcome`, `Affected connections`. `P04:60-67`.

## B-II — Forbidden strings, labels, and vocabulary

35. `provider-reported`, `high`, `medium` as labels in ordinary context UI. `P05:32`, `DEC:USE-021`, `DEC:USE-017`.
36. Internal terms in normal UI: `credential route`, `entitlement instance`, `meter policy`, `capacity source`, `continuation policy`, `deduction graph`, `billing entity id`, `route epoch`. `ORG:71-81`.
37. Internal/support-only strings kept out of normal and advanced UI: route epochs, raw provider and entitlement IDs, meter-policy IDs, normalization rules, probe confidence, raw rate-card payloads, parser/adapter settings. `ORG:196-203`.
38. One universal budget control, and any wording of the form `When the budget runs out` applied across every provider. `ORG:219`, `P01:46`, `P05:56`, `DEC:USE-023`.
39. `block_at_limit`, `warn_only`, `allow_overage` as provider-behavior options. `ORG:276`.
40. `PM only supports two agents` (or any phrasing that turns a completion forecast into a hard PM concurrency limit). `SEC:85`.
41. All Playwright vocabulary for PM work: `Playwright-shaped program`, Playwright runtime, facade, compatibility namespace/vocabulary, package, port, command family, MCP route, PM-native capture. `SRV:51`, `P04:108-110`, `SUP:14`, `ADJ:69`, `DEC:PRM-025`.
42. Emoji glyphs of any kind. `ORG:515`, `HER:739`, `SPR:47`, `CR:9`, `DEC:VIS-001`.
43. Left-side/left-edge color accent bars (plus uneven/cutoff text, decorative filler, pills implying the wrong interaction). `HER:739`, `DEC:VIS-001`.
44. `Included with this Server` (or any inclusion wording) for a provider CLI absent a named user-approved exception. `ADJ:78`.
45. Any wording that labels Claude or Antigravity CLI-owned OAuth as PM-direct OAuth. `SEC:369`, `P01:141`, `DEC:PROV-014`.
46. `regular` and `yolo` as access/mode vocabulary. `SUP:24`, `DEC:PROC-008`.
47. Right-side panel vocabulary and IA (left Activity Bar / left side-panel canon is current). `SUP:22-24`, `SPM:27`.
48. `local-first writable replica` / multiple writable homes vocabulary. `SUP:24`, `SPM:13-18`.
49. Zero as a stand-in for unknown, including strings like `0 cache writes` for a missing field. `SEC:133`, `HER:648`, `P04:92`.
50. `authenticated` used to imply which subscription, plan, or billing path paid. `SEC:371`.
51. Raw command arguments, secrets, or protected paths in ordinary summaries. `HER:413`.
52. Raw URLs, DOM, cookies, tokens, authorization headers, screenshots, source paths, CLI profile paths, helper responses, console/network data. `SRV:55`, `EGO:47`.
53. `cmd.settings.bloom.open` as the deep-link contract or interaction model. `HER:683`, `SEC:403`.
54. Raw compacted prompts or giant technical logs in the main Usage view. `HER:207`.
55. Provider-specific purchase/pack/reset command IDs minted before direct execution is actually supported. `ORG:474`, `P06:55`.
56. Raw policy traces as the reason for an automatic switch. `ORG:360`.
57. Sensitive project paths in the default Usage view. `SEC:284`.
58. **Derived** — the abbreviation `PM` in user-facing copy: the reference canon writes `Puppet Master` in user sentences (`ORG:99`) and forbids exposing internal shorthand (`ORG:516`); `P01:24` violates this (see E9).
59. **Derived** — underscored/snake_case schema identifiers in user-facing strings (`user_work`, `source_class`, `provider_reported`, `timed_out_discarded`, …). No reference states "no underscores" literally; the rule follows from the internal-vs-UI split at `ORG:81`, `ORG:516`, the human title-case label set at `P04:81-90`, and "concise human labels" at `P05:33`.
60. **Derived** — the bare abbreviation `BSD` as user-facing text: it is a core-only internal token (`P02:18`, `P02:70`) and conflicts with `ORG:516`; the user-facing treatment is a Back Seat Driver selector/monogram (`P02:110`, `DEC:AGT-021`).
61. Non-wording prohibition kept here because it is often surfaced in concept copy: SQLite remains prohibited. `SPR:46`.

**Section B count: 61 items** (34 required-wording items, 27 forbidden items, of which 3 are explicitly marked Derived).

---

# C. Superseded / non-scorable clauses

## C-I — Superseded (must not be scored as live requirements)

1. Any permissive provider-CLI bundling, pre-seeding, or baseline-inclusion language anywhere in the lineage. **Superseding authority:** `ADJ:5-20`, elevated by `SUP:7-11` and `SPM:7-12`.
2. `00_READ_ME_FIRST.md` (Provider-CLI Final Policy Return Handoffs 2026-08-08) result directing Optimization to accept per-tool provider-CLI baseline eligibility. **Authority:** `ADJ:75`.
3. `01_FINAL_PROVIDER_CLI_ACQUISITION_POLICY.md` §§1–2 and the `included_execution_baseline` provider-CLI route. **Authority:** `ADJ:76`.
4. §4 language allowing PM caching, mirroring, or repackaging as a normal provider-CLI acquisition class. **Authority:** `ADJ:77`.
5. §8 user copy such as **Included with this Server** for provider CLIs. **Authority:** `ADJ:78`.
6. §9's rejection of the provider-specific never-bundled default. **Authority:** `ADJ:79`.
7. `02_RETURN_TO_OPTIMIZATION_IN_PUPPET_MASTER.md` statements calling the stricter provider rule incorrect, and any baseline-size benchmark premised on provider CLIs being included. **Authority:** `ADJ:80`.
8. `03_RETURN_TO_SHARED_INTEGRATION_RUNTIME.md` §§2 and 4 allowing a provider CLI into the baseline by catalog/adapter decision alone. **Authority:** `ADJ:81`.
9. `04_RECONCILIATION_RESULT.md` final interpretation permitting baseline packaging through per-tool acquisition classification. **Authority:** `ADJ:82`.
10. Playwright-familiar language, including `Playwright-shaped program` and any implication Playwright is PM's browser runtime. **Authority:** `SUP:12-14`, `ADJ:69`, `P04:108-110`, `DEC:PRM-025`.
11. Product Onboarding treated as part of Installation/Deployment or Server Claim/Bootstrap. **Authority:** `SUP:15-16`, `SPM:29-31`.
12. Local-first writable-replica / multi-writable-home model. **Authority:** `SUP:17-21`, `SUP:24`, `SPM:13-18`.
13. Right-side panel canon. **Authority:** `SUP:22`, `SUP:24`, `SPM:27`.
14. `regular` and `yolo` mode vocabulary (live access set is `HER:369-372`). **Authority:** `SUP:24`, `DEC:PROC-008`.
15. `ORG:453`'s reuse of `cmd.settings.bloom.open` as the Settings entry contract. **Authority:** `HER:683`, `SEC:403`, `P06:41`, `CANDIDATE_COMMAND_ID_REGISTER.json` ("semantic Settings deep-link").
16. The universal `ai.usage.budget-policy` options `block_at_limit` / `warn_only` / `allow_overage` for provider behavior. **Authority:** `ORG:276` (self-retiring), `P01:46`, `P05:56`, `DEC:USE-023`.
17. Fixed/default "5h and 7d" usage windows. **Authority:** `ORG:260-261`.
18. `ai.usage.subagent-wave-cost`, `ai.usage.max-tool-rounds`, `ai.usage.max-wall-clock`, `ai.usage.max-goal-turns`, `ai.usage.node-timeout` as Usage-owned settings — moved to Automation/Runs/Goal Mode/Orchestrator; Usage may only report that one was hit. **Authority:** `ORG:286-294`, `DEC:USE-023`.
19. A permanent ledger-export format dropdown as the main export concept. **Authority:** `ORG:281`.
20. Any hard-coded free-provider enum, and the "~222 free/free-limited models across 20 providers" figure treated as a spec rather than a moving upstream count. **Authority:** `ORG:410`.
21. Accessibility as a redesign goal or acceptance category. **Authority:** `ORG:513` (but see E17).
22. Unused intermediate cumulative packets, split Plan/Build prompt pairs, and any stacking of their old prompts. **Authority:** `SPR:4`, `SPR:24-32`, `PROMPT_USAGE.md:3-9`, `DEC:PROC-010`.
23. Any reference clause that would create a second provider / Usage / Settings / notification / progress / authentication / installation / browser / Goal system. **Authority:** `SPR:39`.
24. Provider-CLI silent demand installation triggered by Project, model, provider, Goal, Plan, WorkNode, agent, or `Auto`/`On`. **Authority:** `ADJ:12`, `ADJ:53`, `RRR:3`.

## C-II — Not superseded, but not scorable as Usage build requirements

25. `SERVER_BACKBONE_USAGE_RETURN.md` as a whole is a deferred v6 return: "preserve now; integrate only after the current Usage redesign and its Plan updates are finalized. Do not add another current concept iteration" and "Do not implement from this preservation handoff alone." — `SRV:3`, `SRV:61`. Scorable only where the core packet restates it (mostly `P04`). See E13.
26. `EGOLITE_USAGE_CHAT_RETURN.md` §3 Chat progress cards, §4 multi-agent viewer behavior, §7 notification routing — Chat/Notification owners, not Usage. — `EGO:29-45`, `EGO:62-64`.
27. `ORG`'s Settings-side information architecture (provider-family workspace sections, always/conditional/read-only/advanced/internal control tiers, Settings inventory revisions) — Settings owner; the Usage packet forbids editing Settings concepts. — `ORG:11`, `ORG:107-204`, `ORG:256-319`, `P00:37`.
28. `HER` §18 impact-tracking checklist is to be *tracked, not updated*, absent explicit authorization. — `HER:766`.
29. Dashboard/Orchestrator widget catalogs are out of scope; only the domain-neutral widget host is shared. — `ORG:511-512`.
30. All event/DRY names in the handoffs and `P06` are candidate roles to reconcile with existing PlanUnits/schemas, not required identifiers. — `HER:139`, `HER:809`, `P06:94`.

**Section C count: 30 items** (24 superseded + 6 deferred/other-owner).

---

# D. Provider-CLI adjudication requirement list

## D-i — Prohibited implications (19)

1. Provider CLIs are **not bundled in Puppet Master core**. `ADJ:9`.
2. Not included in the default native/server/container/WSL/Kubernetes **execution baseline**. `ADJ:10`.
3. Not **pre-seeded** as a PM-distributed Tool Store package. `ADJ:11`.
4. Not **silently installed** by Project, model, provider, Goal, Plan, WorkNode, agent, or `Auto`/`On` demand. `ADJ:12`.
5. Installation and authentication must **not** be merged into one step. `ADJ:16`, `DEC:PROV-013`.
6. No **implicit** exception: no catalog owner, adapter, or acquisition-class assignment may authorize bundling; only a later **named user-approved exception** for one exact provider CLI/platform/source after redistribution, license, provenance, security, size, update, removal, and support review. `ADJ:18-20`.
7. `Auto` and `On` are **not consent** for initial acquisition — they may only maintain an already approved installation. `ADJ:53`.
8. No user copy implying inclusion, e.g. **Included with this Server**, for a provider CLI absent a named exception. `ADJ:78`.
9. No offline Tool Bundle product. `ADJ:67`.
10. No silent Project-triggered installation. `ADJ:59`.
11. No Playwright runtime, facade, compatibility namespace, package, port, command family, MCP route, or PM-native capture dependency. `ADJ:69`.
12. Do not imply provider CLIs are bundled, pre-seeded, or silently acquired from Project/model demand. `CGP:11`.
13. Do not confuse explicit first acquisition with later automatic update/repair. `CGP:12`, `RRR:3`.
14. Do not attribute local install/update/download/rollback **time or bytes** as model tokens or provider-active inference. `CGP:13`, `P04:70`.
15. Do not hide a **model-backed validation probe** inside local maintenance. `CGP:14`, `P04:56`.
16. Do not lose exact **Host / Environment / Installation / Profile / Connection** identity. `CGP:15`, `ADJ:14`, `ADJ:63`.
17. Do not label Claude or Antigravity CLI-owned OAuth as PM-direct OAuth. `CGP:16`, `DEC:PROV-014`.
18. Do not turn unknown, stale, partial, or unavailable telemetry into zero. `CGP:17`.
19. Do not confuse reference API price with actual plan settlement. `CGP:18`, `DEC:PROV-026`.

## D-ii — Allowed only after explicit user action (post-consent lifecycle) (9 + 11 retained)

**Permissions unlocked by the user starting setup (`ADJ:24`):**
20. Discover and reuse a compatible existing installation. `ADJ:26`.
21. Download through the provider's official installer, release artifact, package feed, or documented package-manager route. `ADJ:27`.
22. Install into the persistent PM Tool Store or another managed host-local location when supported. `ADJ:28`.
23. Verify publisher, provenance, version, architecture, license, and adapter compatibility. `ADJ:29`.
24. Maintain isolated provider-owned profiles. `ADJ:30`.
25. Stage, verify, activate, repair, and roll back later generations. `ADJ:31`.
26. Apply automatic update policy **after** the installation has been explicitly acquired and bound. `ADJ:32`.
27. Framing rule: all of the above is **post-consent lifecycle management**, not permission to prebundle or silently perform first acquisition. `ADJ:34`, `DEC:PROV-009`.
28. Initial acquisition itself is explicit user-triggered Install/Setup in Provider Settings or provider setup, from the official provider/package source, for the exact selected Host/Environment. `ADJ:12-14`, `RRR:3`.

**Retained valid contracts from the superseded bundle (`ADJ:57-69`):**
29. No silent Project-triggered installation. `ADJ:59`.
30. Explicit provider setup. `ADJ:60`.
31. Authentication / profile / account / model / Usage readiness stay separate states. `ADJ:61`.
32. Demand-driven provisioning remains valid for **non-provider** capabilities. `ADJ:62`, `ADJ:86`.
33. Exact Host/Environment separation across native Windows, WSL distributions, macOS, Apple Linux containers, Linux, containers, Kubernetes, and SSH hosts. `ADJ:63`.
34. Persistent Tool Store/profile state outside replaceable images. `ADJ:64`.
35. Coalesced provisioning and stale-continuation rejection. `ADJ:65`.
36. `RuntimeResourceGovernor` and `ObservableWork` integration. `ADJ:66`, `SPR:45`.
37. No offline Tool Bundle product. `ADJ:67`.
38. Protected human-only `AuthBrowserSession`. `ADJ:68`.
39. No Playwright dependency of any shape. `ADJ:69`.
40. Unaffected classes: the general four-class acquisition model for non-provider tools; CEF/Chromium remains bundled core; accepted Git/Jujutsu source-control baseline decisions unchanged. `ADJ:86`.

## D-iii — Runtime-demand sequence (10 ordered steps, `ADJ:40-51`)

41. Requirement detected. `ADJ:41`.
42. Inspect compatible existing installations. `ADJ:42`.
43. Return **Provider Setup Required** when none is ready. `ADJ:43`.
44. Deep-link to the exact Provider Settings/setup row. `ADJ:44`.
45. Preserve the originating operation and its continuation token. `ADJ:45`.
46. Wait for explicit Install or installation selection. `ADJ:46`.
47. Install from the official source. `ADJ:47`.
48. Authenticate separately. `ADJ:48`.
49. Verify provider/model readiness. `ADJ:49`.
50. Resume only when the continuation is still current. `ADJ:50`.

**Section D count: 50 items** (19 prohibited, 21 allowed-after-consent — 9 lifecycle + 12 retained/unaffected, 10 runtime-demand steps).

---

# E. Contradictions between the reference handoffs and core packet files 01–06

Each entry: the conflict, both sides with line evidence, and the resolution the precedence rules force.

1. **Deep-link command identity.** `ORG:453` lists `cmd.settings.bloom.open` under "Reuse"; `HER:683` says "Do not hard-code the old `cmd.settings.bloom.open` interaction as the future contract"; `SEC:403` says target stable identity "rather than the old `cmd.settings.bloom.open` presentation detail"; `P06:41` and `CANDIDATE_COMMAND_ID_REGISTER.json` list only "semantic Settings deep-link". **Resolution:** semantic destination wins; `ORG:453` is superseded (C15).
2. **The named highest-precedence authority is absent from the packet it governs.** `SUP:7` and `SPM:7-12` make `PROVIDER_CLI_FINAL_ADJUDICATION.md` the top authority, but `MAN` `files[]` contains no such path and the file exists only in the 2026-08-13 correction packet; `RMF:5` confirms "was named as highest-precedence authority but omitted from the archive." **Resolution:** the ADJ text in the correction packet governs; any concept built from the 08-08 archive alone was built without its top authority.
3. **Three incompatible data-quality registers.** `HER:616-624` defines `source_class` with 8 values including `provider_header`, `local_estimated`, `pricing_estimated`; `SEC:122-131` defines a flat 8-value list that instead includes `partial` and `stale`; `P04:81-90` defines a single 8-label user-facing list. `provider_header`, `local_estimated`, `pricing_estimated`, and `streaming_partial` appear nowhere in `01`–`06` (verified by grep). Yet `HER:738` marks the `provider_reported | provider_header | cli_reported | local_estimated | pricing_estimated | unknown` distinction as non-regressable. **Resolution:** core list is the UI vocabulary; the finer authority classes must survive in the event schema or `HER:738` is regressed.
4. **`projection_health` dropped.** `HER:737` requires "current/refreshing/stale **and healthy/degraded/unavailable** semantics" be preserved; the strings `healthy` and `degraded` do not occur anywhere in `01`–`06` (grep), and `P04:79-92` folds freshness into the source list. **Resolution:** projection health is a live preserved requirement (A61, A77) that the core packet omits.
5. **Two different axes both named "settlement".** `HER:626-632` `settlement_status` = observed / streaming_partial / settled / adjusted / failed / unknown (a lifecycle); `P01:66-74` "Settlement states" = Included / Extra balance / Usage pack / API billed / Free allowance / No charge observed / Unknown (a funding route). **Resolution:** both are required and must be separate fields; the core packet's reuse of the word erases the lifecycle axis.
6. **Purpose taxonomy divergence.** `SEC:166-186` requires `planning_conversation`, `prd_conversation`, `crew_synthesis`, `verification`, `repair`; `P02:52-71` drops all five and adds `moa_reference`, `moa_aggregator`, `title_generation`, `bsd`. But `P03:35` requires forecasts to reserve "synthesis/testing/repair" capacity and `SEC:319` requires the planning/PRD conversational route be identified distinctly. **Resolution:** the core taxonomy cannot label the very work `P03` reserves for; the union is required.
7. **Source-quality labels: required vs forbidden.** `HER:606` "Use the established source-quality labels"; `P02:131` "Clearly label provider-reported versus PM-derived estimates"; `P05:32` forbids `provider-reported`, `high`, `medium` labels in ordinary context UI. **Resolution:** `DEC:USE-017`/`USE-021` reconcile it — attribute overhead without presenting estimates as provider-reported facts; the prohibition is scoped to ordinary context UI, the requirement to Usage detail with human wording.
8. **Free-provider row visibility.** `P05:21` "Hide unconfigured accounts and free-provider routes from ordinary Usage" and `P01:137` read, on the plain grammar, as hiding *all* free-provider routes — which contradicts `P01:120-133` (a Free Models Usage row must identify model + underlying route), `P05:67-69` fixtures 6 and 7 (free model cooldown; background validation consumes allowance), `HER:716` demo 10, and `ORG:386-410`. `DEC:USE-019` is titled "Accounts shown only when configured". **Resolution:** only *unconfigured* free routes are hidden; the sentence is ambiguous as written and is a real audit trap.
9. **Requested/effective sentence has two canonical forms.** `ORG:99`: "…but **Puppet Master** used Personal OpenAI because **Work OpenAI** had reached its limit." `P01:24`: "…but **PM** used Personal OpenAI because **the Work account** had reached its limit." **Resolution:** `ORG:99` is the user-facing canon; `P01:24`'s `PM` abbreviation also violates `ORG:516`.
10. **Continuation choice string drift.** `ORG:237` `Ask me each time` vs `P01:94` `Ask each time`. **Resolution:** one string must be chosen; both authorities are live, so this is an open terminology defect.
11. **Human label list drift.** `ORG:52-65` fixes `Usage pack`, `Saved reset`, `Paid usage after your plan`, `Spending limit`; `P01:33-43` renders them `Usage packs and expiration`, `Saved resets and expiration`, `Paid usage after plan`, `Spending guard`. **Resolution:** `ORG` owns the human label canon ("Use these labels consistently across Settings and Usage", `ORG:49`); the core list is a state inventory, not a relabeling licence.
12. **Fixture-matrix regression.** `P05:60` says "At minimum" and lists 18 fixtures; `HER:706` ("Add or ensure coverage of these realistic states", 15 scenarios) and `SEC:409` ("At minimum, exercise these states", 12 states) are live. Missing from `P05:62-79`: automatic compaction with a helper call (`HER:708`), local proactive prune with no provider call (`HER:709`), micro-compaction (`HER:710`), terminal output spill (`HER:712`), patch already applied (`HER:713`), active-turn redirect (`HER:714`, `SEC:417`), Full Access limited by Review mode (`HER:715`), subagent wave with mixed models/accounts (`HER:716`), stale catalog served immediately (`HER:718`), compression timeout discarded (`HER:721`), approval reviewer + denial breaker (`HER:722`), Goal admitting 2 of 8 children (`SEC:411`), high-quality planning route vs cheap extraction children (`SEC:413`), Compact Now with separately billed helper (`SEC:415`), branch on another provider preserving ancestry (`SEC:416`), mixed-provider Crew with separate reducer usage (`SEC:418`), Goal waiting on port/worktree/test with elapsed ≫ provider-active (`SEC:419`), Claude CLI OAuth vs Claude API separation (`SEC:420`). **Resolution:** the reference fixtures remain required; the core 18 are a floor, not a replacement.
13. **Deferred-integration timing.** `SRV:3` says integrate only after the current Usage redesign is finalized and "Do not add another current concept iteration"; `SRV:61` says "Do not implement from this preservation handoff alone." `P04` (Server, Network, Maintenance, Data Quality) and `IMPLEMENTATION_PROMPT.md` ("Add server/host/environment lineage…") integrate that content into the current iteration. **Resolution:** the core packet's integration governs; `SRV` content is scorable only through `P04`, not on its own terms.
14. **Browser vocabulary truncated.** `SRV:42-48` mandates six terms; `P04:110` preserves only `PM Browser Program` and `external Project test command`, dropping `one-action baseline`, `action batch`, `PM-native Expert Browser Program`, `optional external browser adapter`. **Resolution:** the full set is the terminology canon (B-I-25); the core file is a subset.
15. **Return-handoff obligations unclosed.** `EGO:66-68` requests a return of Usage event fields, Browser Program comparison metrics, Chat operation cards, multi-session Watch/Open behavior, redaction rules, and human environment labels; `P06:98-107` lists eight required outputs, none of which is a return handoff. **Resolution:** an open closure defect, not a licence to skip `EGO` content that Usage owns (A70, A85, A86).
16. **Concurrency vocabulary.** `SEC:54-72` uses `requested_children` / `admitted_concurrent_children` / `queued_children`; `P03:7-16` renames these to workers and adds `Hard PM safety maximum`, absent from `SEC`. `SEC:85`'s forbidden phrasing is not carried into `P03`. **Resolution:** superset of fields, `SEC` wording rule still binding.
17. **Accessibility excluded but reduced motion required.** `ORG:513` forbids accessibility as a redesign goal or acceptance category; `CR:9` requires reduced-motion support and `DEC:VIS-003` makes "Reduced motion has a complete static/opacity alternative" an acceptance requirement. **Resolution:** reduced motion is scored as a motion/portability requirement, not as an accessibility acceptance category.
18. **The no-emoji / Slint / no-left-edge-bars / theme rules are invisible in the core read order.** `HER:739`, `ORG:514-515`, `SPR:47-48`, `CR:9`, `DEC:VIS-001` carry them, but the strings `emoji`, `Slint`, `left-edge`, `accessib` do not occur anywhere in `01`–`06` (grep), and `P05:85-95` "Hard failures" omits them, while `P00:22-31` defines the read order as `IMPLEMENTATION_PROMPT` + `01`–`06` + registers. **Resolution:** they remain hard requirements (A80, A81, A83); a build that read only the numbered core files would miss them.
19. **Completeness claim vs silently dropped reference clauses.** `P00:3` calls the packet "the final cumulative replacement for every unused Usage delta/handoff from this thread", yet `01`–`06` never mention spellcheck (`SEC:377-379`), memory/gist and Persona exclusions (`SEC:249-263`), rewind/branch usage rules (`SEC:228-232` — only "Branch context build" at `P02:103`), the approval/FileSafe display duties (`HER:405-411`), or tool self-recovery attribution (`HER:288-327` — only a half-sentence at `P02:131`). **Resolution:** these reference clauses remain live (A28, A30–A35, A71, A72); the core packet's silence is not a supersession (`SUP` lists no such supersession).
20. **Compact-context command linkage dropped.** `HER:230` fixes `cmd.chat.compact_context` semantics and `HER:789` requires "compact-context detail linkage" in the command impact set; `P06:34-51` lists no compact-context command or linkage. **Resolution:** the linkage is a live impact-register obligation.
21. **Approval-cost display surface missing.** `HER:379-411` requires Usage to show approval wait, reviewer helper cost, denial-breaker outcomes, Full Access limited by Review mode, and FileSafe blocks; `01`–`06` mention only the `approval_review` purpose (`P02:61`) and "Approval wait" time (`P03:52`). **Resolution:** the display duties survive; the core packet only carries the plumbing.
22. **Widget command overlap left unresolved.** `ORG:476` requires resolving `cmd.dashboard.add_widget` vs `cmd.widget.add`; `P06:38` says only "shared widget commands". **Resolution:** open adjudication item, still owed.
23. **Route-field set narrowed.** `HER:96-129` requires `usage_event_id`, `session_id`, `run_id?`, `subagent_id?`, `billing_route`, `started_at`/`finished_at`, `settlement_status`, `source_class`, `data_quality`, `receipt_ref` on every event; `P02:29-46` lists lineage plus route but drops `billing_route`, `receipt_ref`, the timestamps, and the three quality fields from the "Required route fields" block. **Resolution:** `HER`'s identity block is the floor; `P02` is a subset view.
24. **Cache route-evidence fields dropped.** `HER:238-258` requires `provider_marker_format`, `provider_marker_supported`, `tool_schema_hash`, `skill_slice_hash`, `mcp_surface_hash`, `cache_hit_expectation`; `P02:79-88` keeps only predicted impact, ContextEpoch, stable-prefix identity, actual read/write, hit rate, reason, source. Without the marker/surface fields the rule at `HER:280` (never infer marker support from a model family; keep route evidence) cannot be evidenced. **Resolution:** the fields are required to satisfy a rule the core packet also restates at `P02:90`.
25. **Catalog/probe evidence fields dropped.** `HER:479-525` requires catalog-refresh and probe events with source version/commit, hash, prior active version, refresh mode, `stale_data_served`, `last_known_good_used`, `failure_backoff_until`, and change counts; `P04:100-106` reduces this to three sentences and no fields, and `P05:62-79` has no "stale catalog served immediately" fixture (`HER:718`). **Resolution:** evidence fields plus the fixture remain required.

**Annex (core-only additions, not contradictions — no reference handoff reviewed them):** Back Seat Driver accounting (`P02:110-127`, `DEC:AGT-020/021`), MoA reference/aggregator purposes (`P02:57-58`), `title_generation` (`P02:64`), 24-hour time display (`P03:60`), `Hard PM safety maximum` (`P03:9`), the `Included with your plan` string itself (`P01:62`), and `Provider ready · Usage details unavailable` (`P04:96`). These are live core requirements but have no reference-side lineage, so an audit cannot cross-validate their wording against an owner handoff.

**Section E count: 25 contradictions** (+ a 7-entry annex of core-only additions).
