# Shard 005: Storage dependency (implementation)

Source: `Plans/usage-feature.md`

Source lines: L35-L93

Source SHA256: `f36a9f06b8895a1798524dc3927ddc35e21f798849f9dcd5a232fc159dafda39`

---

## Storage dependency (implementation)

Usage depends on a **complex storage solution**; the feature cannot deliver 5h/7d, dashboard, and analytics at scale without it. The canonical design is in **Plans/storage-plan.md** (validated by deterministic verifier gates and SSOT evidence contracts). Implementers must have the following in place for Usage to read from rollups and optional search:

| Dependency | Purpose for Usage |
|------------|-------------------|
| **Seglog** (canonical event stream) | All usage-relevant events (tokens, requests, errors, platform, tier, session) are appended here; single source of truth for analytics. |
| **redb** (settings / sessions / runs / checkpoints) | Durable KV for app state; also stores **analytics rollups** (5h/7d counters, tool latency distributions, error rates) that the Usage view and dashboard query. |
| **Projector pipeline** | seglog → JSONL mirror (human-readable), seglog → Tantivy indices (chat/docs/log summaries if Usage includes search), projector checkpoints in redb. |
| **Analytics scan jobs** | Scan seglog (or JSONL mirror) for counters; compute tool latency distributions, error rates, usage-by-window; persist rollups in redb for fast dashboard/Usage queries. |

**Implementation checklist** (from Plans/storage-plan.md; complete before Usage can rely on redb rollups):

- [ ] Implement seglog writer for canonical event stream.
- [ ] Implement redb schema + migrations for settings/sessions/runs/checkpoints.
- [ ] Implement projector pipeline:
  - seglog → JSONL mirror (human-readable)
  - seglog → Tantivy indices (chat/docs/log summaries)
  - persist projector checkpoints in redb
- [ ] Implement "analytics scan" jobs:
  - scan seglog for counters (tool latency distributions, error rates)
  - store rollups in redb for fast dashboard queries

Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it is not the canonical rollup source.

### Usage storage and routing clarifications

- Usage storage-doc dependencies are `Plans/storage-plan.md` and `Plans/FinalGUISpec.md`: seglog owns the append-only event source, redb owns durable KV `/settings/state`, checkpoints, projections, and rollups, Tantivy owns search indices, and any JSONL or `usage.jsonl` output is a projector mirror rather than canonical truth.
- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.
- Usage owns the cross-surface `/quota/alerts/analytics/product-shape`, usage-tracking, and `/runtime/event/GUI` product contract while storage and FinalGUISpec continue to own the persistence stack and shell presentation rules.
- Settings and help surfaces such as `/help/project-status`, `/event/alert`, blocked-sequence, startup-recovery, and DAE policy outcomes must preserve ownership, severity, persistence, and follow-through rather than becoming loose usage warnings.
- `thread_blocked_notice` and `wizard_runtime_state` may preserve `resume_url?` only as compatibility recovery data; Usage opens blocked and wizard subjects through shared route-target payloads rather than storage-plan special-casing.
- GUI deep-links no longer use `run_id/thread_id/timestamp`, `/thread_id/timestamp`, `usage_event_seq`, broad timestamp filters, or tier-based `usage.jsonl` rollups as canonical navigation. They resolve object-first pivots through `usage_event_ref`, UsageRecord identity, runtime object identity, and Ledger/Usage route targets.
- Usage and storage are attempt-centric for runtime attribution and preserve tier-centric labels only as compatibility vocabulary. Durable switch and pressure history uses actor-scoped snapshots plus first-class account-switch and pressure-episode records instead of only per-attempt `recent_switch_reason` or `account_switch_reason` fields.
- Usage export semantics stay distinct: record export returns exact `/records` with stable ids, canonical ids, `/refs`, metadata, and schema-aware payloads; bundle export packages records, Evidence items, attached `/blobs/files`, thread export/share payloads, selected-object bundles, `.pm-bundle` configuration manifests, JSONL/JSON run-history artifacts, and a manifest; view export produces user-facing filtered table/list/chart output, CSV/JSON summaries, search results, analytics views, and graph `/render` convenience output without becoming canonical record truth.
- `runtime-story` and audit surfaces consume append-only `account_switch_event` and `account_pressure_episode` history so Usage, History, Ledger, Orchestrator, Dashboard, and Account/Usage Pressure projections share the same durable facts; switch-history is an owned event family, not an under-owned view-only hint.
- Shared runtime identity and bridged-provider envelopes expose `requested_account_id?`, `effective_account_id?`, execution-scope fields, `actor_kind`, and `execution_role` so Usage can attribute account and actor context without duplicating provider ownership.
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` remains the version-governance dependency for `/account/trust` actor/account/trust categories before those semantics are added to stream fields.
- `Plans/Prompt_Pipeline.md` and `Plans/FinalGUISpec.md` consume Usage runtime details for History, Ledger, and Orchestrator views, including account-switch, pressure, execution-role, and route-target disclosure.
- Bridge-field precedence is explicit: `attempt_id` stays the local runtime anchor; `provider_attempt_ref?` appears on the `attempt_record` as the provider/runtime execution trace handle; `usage_event_ref` is the Usage bridge; and receipt refs remain external side-effect lineage. `opaque-but-real` provider continuity fields must have a legal bridged-provider schema slot so reconnect/replay semantics are not under-specified before account-switch history is joined.
- Tool traces that originate from a provider-backed attempt carry `provider_attempt_ref?` whenever that provider/runtime handle exists; Usage joins that trace through shared usage identity rather than feature-local cost or receipt notions.
- Usage consumes `Plans/Widget_System.md` and `/Widget_System.md` only for widget hostability, layout, and configuration persistence; Widget_System's broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership.
- Usage follows graph-scale guidance across Seams, Evidence, History, and Ledger: filtered CSV is a view export rather than canonical history, JSON summaries are not record exports unless they preserve the exact record envelope, monolithic plan-graph export stays derived, and JSONL mirror export is projection-derived rather than a replacement for seglog ownership. `Orchestrator_Page.md` CSV/JSON exports and `/evidence/history/record-bundle` bundles must preserve the same record/bundle/view distinction.
- Orchestrator `Progress` widgets embedded or linked from Usage inherit `focused_run_id` and page trust state automatically; widget config is limited to local presentation such as collapsed sections, chart style, sort, density, visible columns, or safe subset filters that cannot escape page scope.
- `Plans/Executor_Protocol.md` and `/Executor_Protocol.md` own blocked/runtime recovery mint/ownership rules; Usage consumes those `/runtime` ownership outcomes without inventing a separate blocked or recovery authority.
- Usage follows `Plans/FinalGUISpec.md` and `/FinalGUISpec.md` appendix C.5 for backup-preserving dashboard widget layout migration: `dashboard_layout:v1` and `dashboard_layout` remain backup/migration reads, future reads use `widget_layout:v1:dashboard`, and the active `widget_layout` family takes precedence.
- Quota and pressure detection accept mixed signal sources: runtime outcomes, provider capabilities, heuristic `/log-derived` hints, and explicit `/pressure` evidence. Usage labels incomplete live-API availability rather than presenting inferred pressure as exact provider quota truth.
- project-card usage copy stays compact: one primary line carries current state, owner, and reason; one secondary line carries active/background/historical summary; detailed per-run usage remains in drill-down records rather than being dumped into the card.
- Quiet suppression only affects advisory resurfacing. Attention center and project badges must preserve canonical blocked and `/approval-wait` rows with precise owner and reason metadata, even when a quiet window is active.
- `tool_llm_trace` records carry `attempt_id?`, `provider_attempt_ref?`, and `execution_role?` so tool, runtime, and Usage projections can join the same execution identity without local argument guessing.
- Usage consumes `Project_Output_Artifacts.md` and `Project_Output_Artifacts` through a seglog-first / staging-second artifact model that aligns subject-open routing with canonical record identity before staging views become user-facing.
- `UI_Command_Catalog.md` and `UI_Command_Catalog` wrappers must normalize artifact actions, thread usage actions, panel switches, and Orchestrator pivots into shared route/subject payloads rather than preserving separate local arg sets.
- `storage-plan.md` and `storage-plan` thread/run history export to JSONL/JSON is a coarse export enhancement only; Usage treats it as projection output over canonical records rather than a replacement for the record/bundle/view taxonomy.
- Runtime recovery gate material with the `Runtime Recovery Canonicalization Gate Addendum` label, runtime-lineage checks, and free-floating notes must be integrated into numbered gate canon before Usage relies on it as a blocked/runtime authority.
- Usage freshness is a user-trust requirement: stale values must be visibly marked with `Last updated` and an explicit `Refresh` action so old numbers are never presented as current.
- Usage consumes `/package` and `/worktree` cleanup state only after owner records mark stale lanes or worktrees `cleanup_eligible`: lane/package completion, graph-patch supersession, revoked/reopened flow via `/reopened`, and completed recovery may make old backing removable only when no retention reason remains.
- `Provider_OpenCode.md`, `Provider_OpenCode`, `CLI_Bridged_Providers.md`, and `CLI_Bridged_Providers` must carry account identity and execution-scope attribution before Usage projections consume provider events, so account identity is not silently lost before rollups see the data.
- `cmd.nav.open_usage_subject` resolves canonical Usage/Ledger identity from `usage_event_ref` or an equivalent usage target; domain-specific usage commands are wrappers over the shared route/subject model, not independent argument families.
- `/multi-account` usage surfaces keep configurable thresholds, platform quota visibility, rate-limit/reset countdowns, project-scoped usage storage, dashboard widgets, runtime event persistence, and usage + ledger + analytics rollups in one Usage projection model.
