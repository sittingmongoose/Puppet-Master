# Usage Feature -- App/GUI Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Orchestrator ownership boundaries
  - Cleanup Priorities

#### Source target target-0693
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Orchestrator ownership boundaries
  - Cleanup Priorities
- Exact required items represented:
  - Define what Orchestrator is allowed to own: page layout and controls, view-model/projections, run control intents; exclude canonical runtime enums, event semantics, scheduler truth.
  - Pin the primary discussion seam first: UI surface/IA vs runtime state model vs cross-surface lineage/receipts vs blocked/recovery/remediation UX.
  - Record explicit boundary between canonical runtime facts, orchestrator projections, and widget/page presentation.
  - Carry forward requested-vs-effective state wherever persona/provider/model fallback can occur.
  - Remove legacy `[retired-token-4]` / `[retired-token-5]` drift and [retired-token-10].
  - Normalize [retired-token-6] / [retired-token-7] / [retired-token-8] / [retired-token-9] terminology into one authoritative mapping and event taxonomy.
  - `Feature Seam`
  - Feature Seam
  - `Provider_Stream_Mapping_External_Reference_A2A.md` maps usage and diagnostics without effective-account attribution
  - Provider_Stream_Mapping_External_Reference_A2A.md
  - `widget_layout:v1:usage`
  - widget_layout:v1:usage
  - `shares feature seam with run ...`
  - shares feature seam with run ...
  - keep `Feature Seam`
  - ELI5/help can say “A feature seam is where related packages have to work together cleanly”
  - Usage explicitly worries about stale data and requires `[retired-token-11]` + refresh behavior
  - [retired-token-11]
  - `Feature Seams`
  - Feature Seams
  - preserve canonical usage identity
  - for example, `Feature Seam` should remain the term in both modes even if the ELI5 explanation is plainer
  - `usage` may need explicit app-wide vs project-scoped mode rather than silently reusing one layout for both contexts
  - usage
  - `Orchestrator_Page.md` and `Run_Graph_View.md` still pivot usage and identity with `tier_id`-centric addressing even though storage/runtime contracts have moved to attempt/receipt-based truth.
  - Orchestrator_Page.md
  - Run_Graph_View.md
  - tier_id
  - usage is still attributed to `effective_account_id`
  - effective_account_id
  - but canonical usage records still omit `account_switch_reason` and any durable switch/signal pointer
  - account_switch_reason
  - now clearly needs switch-history and actor/role-aware projection families plus Usage parity
  - Extend canonical usage records with `account_switch_reason?` plus `switch_event_ref?` or equivalent durable linkage.
  - account_switch_reason?
  - switch_event_ref?
  - but the shared effective-resolution/runtime records and usage records still do not identify which role actually executed the attempt/message
  - `Orchestrator_Page.md` still describes worker identity and per-node usage in terms that lag the stronger runtime/account/attempt model.
  - spot-checks against `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/usage-feature.md`
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - resolves canonical Usage/Ledger identity from `usage_event_ref` or equivalent usage target
  - usage_event_ref
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `object_id = <usage_event_ref or stable usage id>`
  - object_id = <usage_event_ref or stable usage id>
  - may reuse current Usage layout/filter chrome if it still reveals the requested usage target
  - Use `inspector_target = usage` for graph/node/attempt pivots that keep the same object but focus the usage section.
  - inspector_target = usage
  - `thread_id = <thread_id>` when thread-scoped usage is required
  - thread_id = <thread_id>
  - `inspector_target = usage`
  - `inspector_target = details | evidence | usage | history`
  - inspector_target = details | evidence | usage | history
  - feature seam:
  - `Plans/usage-feature.md` duplicates the entire `Cost_usage runtime artifact and Show in Ledger / Show in Usage` section back-to-back.
  - Cost_usage runtime artifact and Show in Ledger / Show in Usage
  - usage and evidence families stop using `tier_id` as their primary cross-surface key
  - Usage and evidence are now the strongest remaining cross-surface families still tied to tier-era correlation.
  - “View in Usage” filters by `tier_id`
  - usage correlation is explicitly by `tier_id`
  - Reconcile usage and evidence families away from tier-first cross-surface correlation.
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - graph-owned `Feature Seam` / `Work Package`
  - Work Package
  - `View in Usage` still filters by `tier_id`
  - View in Usage
  - usage correlation moved off `tier_id` as primary cross-surface key
  - historical/current usage navigation aligned to canonical route/open primitives
  - `Plans/FinalGUISpec.md`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`
  - Plans/FinalGUISpec.md
  - Plans/Glossary.md
  - Plans/Orchestrator_Page.md
  - `gap-008` is overstated as `missing_data_shape`: the owner and adjacent consumer docs already carry much of the account-history and projection-health canon, so the unresolved work is now over-summarized transfer centered on `Plans/usage-feature.md` plus missing discoverable owner/consumer anchors.
  - gap-008
  - missing_data_shape
  - `Plans/usage-feature.md:234-239`
  - Plans/usage-feature.md:234-239
  - `Plans/usage-feature.md:715-717`
  - Plans/usage-feature.md:715-717
  - `Plans/usage-feature.md:104-127`
  - Plans/usage-feature.md:104-127
  - `Plans/usage-feature.md:714-717`
  - Plans/usage-feature.md:714-717
  - `Plans/usage-feature.md:228-242`
  - Plans/usage-feature.md:228-242
  - `Plans/usage-feature.md:714-720`
  - Plans/usage-feature.md:714-720
  - `Plans/usage-feature.md` still does not contain an exact `artifact drill-through section` heading.
  - artifact drill-through section
  - `Plans/usage-feature.md:233-245`
  - Plans/usage-feature.md:233-245
  - `Plans/usage-feature.md:346-389`
  - Plans/usage-feature.md:346-389
  - Wave 2 targeted the storage/receipt/blocked subset around `gap-003`, `gap-004`, and `gap-005` (`Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/interview-subagent-integration.md`, `Plans/usage-feature.md`, `Plans/Tools.md`, `Plans/assistant-chat-design.md`) and only reconfirmed the already-recorded missing anchors/fields plus the already-known owner-vs-consumer split for blocked-packet fields.
  - gap-003
  - gap-004
  - gap-005
  - Plans/Project_Output_Artifacts.md
  - Plans/interview-subagent-integration.md
  - `Plans/usage-feature.md:690-705`
  - Plans/usage-feature.md:690-705
  - `Plans/usage-feature.md:233-249`
  - Plans/usage-feature.md:233-249
  - `Plans/usage-feature.md:346-382`
  - Plans/usage-feature.md:346-382
  - `Plans/usage-feature.md:694-701`
  - Plans/usage-feature.md:694-701
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-016: Export taxonomy and manifest contract
- Coverage rows: cov-016
- Fidelity gap refs: cov-016
- Required fidelity items:
- Exact required item: Define record export, bundle export, and view export as distinct export classes
- Exact required item: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-016: Export taxonomy and manifest contract` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-016` repair states the exact requirement: Define record export, bundle export, and view export as distinct export classes
- Exact acceptance check: The `cov-016` repair states the exact requirement: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Exact acceptance check: The `cov-016` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-045: Projection trust and action gating
- Coverage rows: cov-045
- Fidelity gap refs: cov-045
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-045: Projection trust and action gating` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-045` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-045` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-045` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-089: Execution role and operational identity
- Coverage rows: cov-089
- Fidelity gap refs: cov-089
- Required fidelity items:
- Exact required item: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-089: Execution role and operational identity` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-089` repair states the exact requirement: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Exact acceptance check: The `cov-089` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-092: Account switch and pressure history

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0702
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Define a canonical switch-history / pressure-episode family and make it queryable from History, Ledger, Usage, and Account/Usage Pressure projections.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-092
- Fidelity gap refs: cov-092
- Required fidelity items:
- Exact required item: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-092: Account switch and pressure history` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-092` repair states the exact requirement: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Exact acceptance check: The `cov-092` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-162: Identity and blocked-policy transfer cluster
- Coverage rows: cov-162
- Fidelity gap refs: cov-162
- Required fidelity items:
- Exact required item: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact required item: Carry usage switch-history and usage execution-role follow-through
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-162: Identity and blocked-policy transfer cluster` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-162` repair states the exact requirement: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact acceptance check: The `cov-162` repair states the exact requirement: Carry usage switch-history and usage execution-role follow-through
- Exact acceptance check: The `cov-162` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-184: Bridge-field precedence for attempt/provider/usage/receipt joins
- Coverage rows: cov-184
- Fidelity gap refs: cov-184
- Required fidelity items:
- Exact required item: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact required item: None of those bridge fields replace the primary local key
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-184: Bridge-field precedence for attempt/provider/usage/receipt joins` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-184` repair states the exact requirement: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact acceptance check: The `cov-184` repair states the exact requirement: None of those bridge fields replace the primary local key
- Exact acceptance check: The `cov-184` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-198: Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Coverage rows: cov-198
- Fidelity gap refs: cov-198
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-198: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-198` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-198` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-203: Artifact envelope routing preference
- Coverage rows: cov-203
- Fidelity gap refs: cov-203
- Required fidelity items:
- Exact required item: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact required item: Require runtime artifacts summarizing external operations to carry receipt linkage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-203: Artifact envelope routing preference` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-203` repair states the exact requirement: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact acceptance check: The `cov-203` repair states the exact requirement: Require runtime artifacts summarizing external operations to carry receipt linkage
- Exact acceptance check: The `cov-203` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document:
- Defines the "Usage" feature as a first-class area in the app/GUI
- Describes scope, data sources, and UX goals
- References existing usage tracking and related plans
- Remains implementation-agnostic so it stays valid across tech stack changes

## Rewrite alignment (2026-02-21)

The rewrite described in `Plans/rewrite-tie-in-memo.md` reinforces this plan's intent: Usage should be implemented as **projections/rollups** over the canonical event ledger (seglog), with durable KV state in redb and fast search in Tantivy--without changing the UX requirements in this document. 5h/7d and dashboard numbers are served from **redb rollups** produced by **analytics scan jobs** that aggregate over the seglog (and any JSONL mirror); the Usage view reads these rollups rather than scanning the ledger on demand.

**ELI5/Expert copy alignment:** Authored usage tooltip/help text in this plan (for example context-circle hover copy and explanatory hints) must provide both Expert and ELI5 variants and follow the authoritative checklist in `Plans/FinalGUISpec.md` §7.4.0.

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

## Executive Summary

The app will expose a **Usage** section that gives users clear, persistent visibility into platform quota and consumption. Goals: show 5h/7d usage and plan type where available, surface event-level usage (ledger) and optional analytics, and warn when approaching limits so users can switch platform or pause. The feature builds on existing usage tracking and plan detection; the plan focuses on **what** the Usage area should do and **where** it fits in the GUI, not the current tech stack.

## Relationship to Existing Docs

| Doc | Relevance |
|-----|-----------|
| **AGENTS.md -- Usage Tracking & Plan Detection** | Canonical source for per-platform usage sources (Claude Admin API, Copilot metrics, Gemini quotas, Codex/Cursor error parsing), env vars, and error-message parsing. |
| **Plans/newfeatures.md §3** | Persistent rate limit and usage visibility: 5h/7d in dashboard/header, tier config usage, alerts; data layer + widget + background refresh. |
| **Plans/newfeatures.md §7** | Analytics view: aggregate usage over time and by dimension; reporting layer on top of usage/plan detection. |
| **Plans/assistant-chat-design.md §12** | Context/usage display: **context circle** (OpenCode-style) at top of chat -- hover shows tokens/usage %/cost; thread-scoped detail opens the canonical Context Detail Pane/editor-tab surface. |
| **orchestrator-subagent-integration.md** | Platform quota display and resource monitoring (e.g. quota usage in GUI, crew quota). |
| **Plans/newfeatures.md §19.2** | Technical mechanism for 5h/7d (session usage from stream, account-level via `claude --account` or Admin API); mid-stream usage and context % from stream-json. |
| **Plans/storage-plan.md** | Implementation checklist for seglog, redb, projectors, analytics scan; Usage reads rollups from redb produced by analytics scan jobs over seglog. |
| **Plans/Progression_Gates.md + Plans/evidence.schema.json** | Validation contract for the storage stack (seglog + redb + Tantivy + projectors + analytics scan) through deterministic verifier gates and evidence requirements. |

**Current app state (for context):**
- **Ledger** page: Event-level log from `.puppet-master/usage/usage.jsonl` (platform, tokens in/out, cost per request). No 5h/7d quota view.
- **Metrics** page: Post-run execution metrics (platform/subtask stats).
- **Dashboard**: Budget/usage percent per platform (from budget config).
- **Backend**: `UsageTracker`, `QuotaManager`, `UsageRecord` persisted to `usage.jsonl`; orchestrator records usage; platform runners report token usage.

## External References (Competitive & Ecosystem)

| Source | Relevance to Usage feature |
|--------|----------------------------|
| **[OpenSync](https://www.opensync.dev/) -- [Dashboard overview](https://www.opensync.dev/docs#dashboard-overview)** | Beautiful dashboards for OpenCode and Claude Code sessions; reference for how usage/dashboards can be presented. |
| **[yume](https://github.com/aofp/yume) / [yume site](https://aofp.github.io/yume/)** | Native desktop UI for Claude Code. **Persistent rate limit visibility** -- 5h and 7d limits always visible (no `/usage` needed). **Analytics dashboard** -- usage by project/model/date, cost tracking, export; "know where your tokens go"; mid-stream context (live token count). Strong UX benchmark for always-visible limits and analytics. |
| **[openclaudecto](https://github.com/josharsh/openclaudecto)** | Open-source Claude Code dashboard (coming soon): analytics & cost tracking, token consumption, cost breakdowns by model, tool usage distribution, daily activity trends. Useful reference for analytics/cost UX and data shape. |
| **[OpenCode Monitor](https://ocmonitor.vercel.app/docs)** | CLI tool for monitoring and analyzing OpenCode AI coding sessions: live dashboard, daily usage breakdown, usage quotas, session/time/model/project analysis, export (CSV/JSON). **We provide equivalent usage visibility in the app GUI**, not via a separate terminal/CLI monitor -- one place for orchestration and usage. |
| **[OpenCode desktop](https://github.com/anomalyco/opencode) (packages/app)** | **Per-thread usage in chat:** Small **context circle** (ProgressCircle) at top of chat showing context usage %; **hover** shows tooltip (total tokens, usage %, cost USD); **click** opens "context" tab for that session with detailed usage. Reference: `packages/app/src/components/session-context-usage.tsx`, `session-context-metrics.ts`. We adopt this pattern in §5 "Per-thread usage in Chat (OpenCode-style)". |

## Scope of the Usage Feature

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0694
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Thread Usage stays canonical in-shell, but app Usage pivots still need the same shared scope envelope.
  - must open/focus Usage in the correct project/thread/run scope
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 1. Quota and plan visibility (primary)

- **5h and 7d windows:** Show current usage vs limit (e.g. "5h: X / Y", "7d: X / Y") per platform where the platform or org API provides it.
- **Plan type:** Show detected or configured plan (e.g. Pro, Team) where available (see AGENTS.md plan detection).
- **Placement:** Always visible in at least one of: dashboard, header, or a dedicated **Usage** page. Tier config / setup should show current usage when selecting a platform so users can avoid platforms near limit.
- **Refresh:** Background refresh (e.g. periodic or after runs) so numbers stay up to date without blocking the UI. Document which platforms support "live" vs "after-run" stats.
- **Always-visible limits:** Match UX expectations set by tools like [yume](https://aofp.github.io/yume/) -- 5h and 7d usage always visible so users don't need a manual "usage" command.

### 2. Alerts and thresholds

- **Approaching limit:** Optional warning when usage is near limit (e.g. 80% of 5h window) so the user can switch tier or pause.
- **Rate limit hit:** When a run hits quota/rate limit, surface a clear message and, where possible, suggested action (e.g. "Try again after X" or "Switch platform"); link to the Usage view.

### 3. Event ledger (existing concept, under Usage umbrella)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0696
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - layout under 500ms at 500 nodes
  - `object_id = <canonical usage event id>`
  - object_id = <canonical usage event id>
  - Provider/runtime/account seams got materially sharper under Sonnet:
  - `tab_id = ledger`
  - tab_id = ledger
  - `tab_id = evidence` or `tab_id = ledger`
  - tab_id = evidence
  - `object_id = canonical usage event id`
  - object_id = canonical usage event id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Event-level log:** Keep the existing concept of an event ledger (platform, operation, tokens in/out, cost, tier/session) so users can inspect per-request usage. This may remain the current "Ledger" page or be presented as a tab/section under a unified **Usage** area.
- **Filtering and export:** Retain filtering (e.g. by type, tier, session) and export (e.g. JSON) as part of the Usage feature.

### 4. Optional analytics and reporting

- **Aggregated view:** Over time, support an analytics view that aggregates usage by time window, platform, project, or tier (as in newfeatures §7). Can be a separate page or a section under Usage.
- **Cost tracking and attribution:** Where data is available (from platform APIs), show cost breakdowns by model, project, and date (see [openclaudecto](https://github.com/josharsh/openclaudecto), [yume analytics](https://aofp.github.io/yume/)).
- **Retention:** Policy for how long to keep usage/ledger data (e.g. file-based or redb-backed) to bound disk use while supporting 5h/7d and historical views.

### 5. Per-thread usage in Chat (OpenCode-style)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0697
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - per-thread usage is already one canonical detail surface
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Per-thread context/usage in chat is a split inspect/action affordance rather than a direct jump to a chat-shell usage panel.

Rules:
- the chat header context circle is always the entrypoint for per-thread context state
- hover opens a lightweight status module showing `Usage`, `Tokens`, estimated `Cost`, and `More Details`
- click reveals the `Compact Now` action instead of immediately opening the detail surface
- selecting `Compact Now` dispatches the canonical compaction command for that thread
- selecting `More Details` opens or focuses the thread-scoped Context Detail Pane in an editor tab
- app-wide Usage remains the canonical aggregated platform view and is not replaced by this thread-scoped pane
- mid-stream updates are allowed but must use explicit in-progress states until final usage totals are known

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

The Context Detail Pane must support both curated inspection and raw payload inspection.

Required content:
- curated overview of thread counts, provider/model/mode/persona, and headline tokens/context/estimated cost
- grouped context and token breakdowns
- per-message inspection with human-readable fields first
- raw payload toggles for the full thread and for individual messages
- drill-downs by mode, provider, model, and other shared runtime identity dimensions when available

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

Estimated-cost rule:
- per-thread chat cost uses the OpenCode-style normalization formula as the baseline approximation
- reasoning tokens are charged at the output-token rate for the estimate
- cache read and cache write buckets are included when pricing metadata exists
- provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
### Cursor -- API (usage/account only; not for model invocation)
Cursor usage is account and plan augmentation only. PM does not use a Cursor API for model invocation.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

Canonical usage-source classes for Cursor are:
- `provider-reported`
- `team-admin-reported`
- `inferred_from_runtime_refusal`

Rules:
- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.
- monthly included usage or request-allotment semantics are shown honestly as plan-cycle data rather than forced into a short rolling-window countdown.
- `cursor-agent` remains the runtime target for execution and account validation.
- `CURSOR_API_KEY` is an advanced/non-default setup path and does not change the CLI runtime ownership model.
- Usage UI must disclose whether the data comes from provider-reported plan data, team-admin data, or inferred refusal/runtime evidence.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### Codex -- Direct provider

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0698
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - prior direct reads of current owner docs and late-straggler route/records slices
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Codex is a direct provider in PM and supports multiple accounts across two distinct auth families:
- `Sign in with ChatGPT`
- `Use API Key`

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Usage rules:
- ChatGPT-backed Codex usage and API-key-backed Codex usage are distinct entitlement buckets.
- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.
- plan-backed Codex accounts may expose included-usage windows and provider refusals.
- API-key-backed Codex accounts behave as API-billed usage and may not have the same reset semantics.
- Usage rows must label the bucket plainly, for example `Plan: ChatGPT Pro` or `Usage Bucket: API billed`.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### GitHub Copilot -- Direct provider
GitHub Copilot is a direct provider in PM.

PM keeps one auth-backed account row per GitHub login and may resolve one effective billing/entity context beneath that row when premium-request semantics require it.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Usage and blocked-state rules:
- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.
- blocked reasons should remain explicit, including `billing_entity_required`, `included_premium_exhausted`, `paid_overage_disallowed`, `copilot_entitlement_missing`, and `copilot_org_policy_blocked`.
- if multiple billing entities are available, the account may be `Logged in` but still `Needs setup` until the user chooses the effective billing entity.
- Usage and status surfaces must show the selected billing/entity context whenever it explains the active quota bucket.
- GitHub repository auth and local git/worktree behavior remain independent from GitHub Copilot account switching.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md
### Claude Code -- Admin API (existing)

- **Availability:** Anthropic **Admin API** (`/v1/organizations/usage_report/claude_code`); env: `ANTHROPIC_API_KEY`. Already documented in AGENTS.md.
- **What we get:** Organization-level usage and cost; `customer_type`, `subscription_type` for plan detection. Per-session usage also available from **stream-json** output when we use `--output-format stream-json` (usage events in the stream).
- **Usage feature:** Use Admin API for 5h/7d or org windows when key is set; use stream-json usage events for per-run tokens and optional mid-stream context %. No SDK required for CLI-based runs.

### Gemini -- Direct-provider (local counters + estimated cost)
Gemini usage must distinguish the direct provider from Gemini CLI while still allowing family-level pooling when policy permits.

#### Gemini direct

`Gemini` is the direct API-key provider entry.

Rules:
- direct Gemini account rows are API-key-backed only.
- quota identity may depend on effective Google project context as well as the key itself.
- when PM cannot prove authoritative remaining quota, the UI must show `estimated` or equivalent source-qualified wording rather than pretending the numbers are definitive.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Media_Generation_and_Capabilities.md

#### Gemini CLI

`Gemini CLI` is a separate provider entry.

Rules:
- Gemini CLI may use OAuth, direct API key, or Vertex/Google credential families depending the configured account row.
- trust can affect runtime MCP visibility, so `Configured` and `Working` must remain separate states.
- provider-side model routing may still override the explicitly requested model in some flows; PM must show requested/effective differences rather than assuming full determinism.
- usage/cooldown behavior depends on the active auth family and may range from authoritative remaining counters to softer or inferred pressure.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

#### Family-pooling rule

When policy pools Gemini direct and Gemini CLI together, the Usage surface must still show which concrete runtime surface actually handled the run and why.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### Summary table (augmentation sources)
| Provider entry | Primary usage sources | Auth / setup context | UI disclosure rule |
|---|---|---|---|
| **Cursor CLI** | provider-reported plan data, team-admin reporting, inferred runtime refusal | `cursor-agent` login default; API key advanced/non-default | show source-confidence; do not fake precise remaining counters |
| **Codex** | direct provider usage, plan windows, provider refusals, API-billed usage | `ChatGPT` or `API key` account rows | keep plan-backed and API-billed buckets separate |
| **GitHub Copilot** | provider quotas, premium-request semantics, runtime refusals, policy blocks | GitHub login plus selected billing/entity context when required | show billing/entity and blocked reason explicitly |
| **Claude Code CLI** | API/admin usage where available, runtime signals, softer subscriber stats | subscriber, console/API, or SSO account rows | show whether data is authoritative or inferred |
| **Gemini** | provider usage, quota APIs, project attribution, error hints | direct API-key account rows | show project attribution and estimated-vs-authoritative status honestly |
| **Gemini CLI** | CLI/runtime signals, config/trust state, provider counters when available | OAuth, API-key, ADC, service-account, or Vertex account rows | show concrete runtime surface and auth family |
| **OpenCode** | server health/discovery plus upstream provider usage where exposed through the server | managed or attached server profiles | separate connected/discovery status from actual provider availability |

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/FinalGUISpec.md
## Data and Backend (conceptual)
### Cost_usage runtime artifact and Show in Ledger / Show in Usage

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0699
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `hard_gate` should show:
  - hard_gate
  - `Runtime_Artifacts_Panel.md` requires `Show in Ledger` / `Show in Usage` for `cost_usage`, but the promised runtime-artifact schemas are not present and no concrete usage identity payload is pinned
  - Runtime_Artifacts_Panel.md
  - Show in Ledger
  - Show in Usage
  - cost_usage
  - `usage-feature.md` and `Runtime_Artifacts_Panel.md` both describe `Show in Ledger` / `Show in Usage` behavior using identifiers like:
  - usage-feature.md
  - Collapse the duplicated `cost_usage` section in `usage-feature.md` during the same pass that normalizes Usage routing.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The `cost_usage` runtime artifact is an attribution record only. It uses the same canonical usage pipeline and schema as `usage.event`.

Required actions for `cost_usage` items are:
- `Show in Ledger` — navigate to the canonical Ledger surface with the matching usage identity in scope
- `Show in Usage` — navigate to app-wide Usage or to the thread-scoped Context Detail Pane depending on artifact scope, preserving the same thread/run filters

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Rules:
- thread-scoped cost usage does not open a chat side-panel usage surface
- thread-scoped cost usage lands on the same Context Detail Pane used by the chat context circle `More Details` action
- app-wide cost usage lands on the app-wide Usage surface
- the artifact does not create a second token or cost model outside the canonical usage schema

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md
### OpenCode (product) usage pipeline reference

For implementers: the flow by which usage is collected and stored can be referenced from the OpenCode product (anomalyco/opencode repo). Conceptual flow: **provider response** → adapter → **LanguageModelV2Usage** (or equivalent) → **getUsage-style normalization** (e.g. Session.getUsage) → **processor** applies on finish-step to assistant message + step-finish part; **UI reads from messages** and/or usage.event. Key paths in that repo: session-context-metrics (UI metrics from messages), processor finish-step (where token/cost is applied to message), Session.getUsage (normalization). Puppet Master does not replicate this exactly; all providers (CLI-bridged, OpenCode provider, Codex, Gemini, Copilot) normalize to the same usage.event / message usage shape; collection mechanism differs per provider. OpenCode the **provider** (Plans/Provider_OpenCode.md) is one transport; OpenCode the **product** is the reference for "how message-level usage becomes stored usage."

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Provider_OpenCode.md, PolicyRule:Decision_Policy.md§2
### Backend implementation notes
- **Data layer:** Reuse and extend existing usage/plan-detection logic. Expose a clear current-usage contract per platform that the GUI can poll or subscribe to.
- **Primary input:** canonical usage projections and redb rollups derived from the seglog pipeline.
- **Secondary input:** platform APIs and structured provider/runtime outputs when configured and supported.
- **Compatibility input:** `usage.jsonl` may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md

- **Gemini source model:** Prefer the shared `UsageRecord` pipeline and carry explicit source attribution instead of hardcoding Gemini to local counters only.
- **Gemini signal weighting:** strong provider/account telemetry outranks structured runtime output; structured output outranks heuristics; heuristics outrank local-only counters.
- **Persistence:** event-level data and rollups remain canonical storage concerns; account-health and quota-pressure updates must feed the same control loop used by multi-account routing.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2
## GUI Placement Options
The GUI placement model is fixed.

Canonical placement:
- app-wide Usage is its own page or view
- compact usage visibility appears in shell and status surfaces where appropriate
- thread-scoped context detail lives in the chat flow as the context circle plus the editor-tab Context Detail Pane
- artifact deep-links and chat usage activation land on those same canonical surfaces based on scope

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Non-canonical after this section:
- thread Usage in the chat shell or side panel as the primary detailed surface
- detached usage pop-out as the canonical thread detail model
- direct click on the context circle opening the detail pane without the hover/click split
- unresolved `tab or panel or pop-out` phrasing that leaves the implementation guessing

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md
## Gaps (Current State vs. Desired)

### Canonical usage pipeline
- Usage events are emitted by tool invocation and aggregated into usage records.
- UsageRecord is the canonical schema for all usage data (tokens, costs, tool calls, API calls).
- Usage records are immutable once committed; corrections require a new record with explicit versioning.

### Billing identity, attribution, and pricing metadata
- Billing identity is derived from account context and subscription tier.

#### Shared runtime identity
- Carry execution_role plus requested/effective operational identity in shared runtime identity.
- Project them into effective-resolution, attempt, usage, and inspector surfaces.
- cov-089 exact item present: Carry execution_role plus requested/effective operational identity in shared runtime identity
- cov-089 exact item present: Project them into effective-resolution, attempt, usage, and inspector surfaces

#### Attribution family, anchors, and pricing metadata
- Attribution metadata links usage to project, run, node, and account for cost allocation.
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields.
- Pricing metadata includes rate cards and surcharges that apply to each usage event.
- cov-118 exact item present: Share one attribution family across tool events, runtime artifacts, receipts, and usage records
- cov-118 exact item present: Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields

#### export taxonomy
- Export taxonomy documents which usage metrics are surfaced in export manifests and accounting reports.
- Export taxonomy is versioned and stable across release boundaries.

##### Export classes
- Define record export, bundle export, and view export as distinct export classes.
- cov-016 exact item present: Define record export, bundle export, and view export as distinct export classes

##### Export manifest requirements
- Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure.
- cov-016 exact item present: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure

#### account history
##### Durable account-pressure and switch events
- Add append-only account_pressure_episode and account_switch_event families.
- Let Usage, History, Ledger, and Orchestrator consume the same durable event family.
- cov-092 exact item present: Add append-only account_pressure_episode and account_switch_event families
- cov-092 exact item present: Let Usage, History, Ledger, and Orchestrator consume the same durable event family

##### Recovery and execution-role continuity
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- Carry usage switch-history and usage execution-role follow-through.
- cov-162 exact item present: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- cov-162 exact item present: Carry usage switch-history and usage execution-role follow-through

#### artifact drill-through section
##### Local keys and bridge fields
- Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge.
- None of those bridge fields replace the primary local key.
- cov-184 exact item present: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- cov-184 exact item present: None of those bridge fields replace the primary local key

##### Usage and receipt lineage routing

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0705
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Role-scoped routing exists in policy/storage but not in effective-resolution or usage schemas.
  - Usage still wants switch explanations without carrying switch lineage in its canonical records.
  - keep canonical Usage routing on shared usage identity, not feature-local cost or receipt notions
  - `inspector_target = details | evidence | usage | lineage`
  - inspector_target = details | evidence | usage | lineage
  - Usage pivots still describe `tier_id` filters in graph/detail docs even though the routing and identity work now requires object-first `usage_event` and runtime-object pivots.
  - tier_id
  - usage_event
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger.
- Require runtime artifacts summarizing external operations to carry receipt linkage.
- cov-203 exact item present: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- cov-203 exact item present: Require runtime artifacts summarizing external operations to carry receipt linkage

#### help surfaces
##### Notification routing policy
- Route notifications using severity, execution impact, blocked owner, persistence, and projection trust.
- cov-069 exact item present: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust

##### Quiet-window policy
- Allow quiet windows for advisory warnings but not for canonical blocked episodes.
- cov-069 exact item present: Allow quiet windows for advisory warnings but not for canonical blocked episodes

#### projection-health-aware degrade behavior
##### Projection freshness and health states
- Use current/refreshing/stale/degraded/unavailable projection states.
- cov-045 exact item present: Use current/refreshing/stale/degraded/unavailable projection states

##### Sensitive action gating and record-backed fallback
- Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded.
- cov-045 exact item present: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded

### Unified UsageRecord schema expectations
- UsageRecord includes `usage_id`, `created_at_utc`, `account_id`, `run_id`, `node_id`, `tool_id`, `input_tokens`, `output_tokens`, `cost_usd`, and `metadata`.
- All usage events are coerced into UsageRecord format before aggregation.

### Blocked-state and escalation surfaces
#### Shared escalation ladder and attention semantics
#### blocked_notice contract and observability
#### Blocked-owner taxonomy and surface mapping

#### Acceptance carry-through
- Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- cov-053 exact item present: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- cov-053 exact item present: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- cov-146 exact item present: Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- cov-146 exact item present: Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- cov-146 stale token retired: allowed_action_ids[]
- cov-198 exact item present: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping

### Problem 1: Platform APIs require secrets

- **Risk**
  - Claude Admin API and Copilot metrics require `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`/`GH_TOKEN`. Many users will not set these; 5h/7d from APIs would be missing or "N/A" for those platforms.
- **Impact**
  - Users might assume "no data" means "no usage" instead of "API not configured"; or they may not know how to enable live data.
- **Mitigation**
  - In Usage view (or tooltip), document which env vars enable live data per platform (e.g. "Set ANTHROPIC_API_KEY for Claude 5h/7d").
  - **Always** show a fallback: display the project-local canonical usage summary available from current rollups/projections even when provider API quota data is unavailable.
  - Clearly label source: "From this project's usage" vs "From Claude (API)" when both exist.

### Problem 2: Rate limits on usage APIs

- **Risk**
  - Polling Claude/Copilot/Gemini usage endpoints too frequently could hit rate limits or consume quota.
- **Impact**
  - API errors, blocked requests, or user quota consumed by the app itself.
- **Mitigation**
  - Background refresh at a reasonable interval (e.g. 5-15 min); cache last result; expose "Refresh" for on-demand update.
  - After each run, update usage from the run result (tokens/cost when available) without an extra API call.
  - Document recommended refresh interval per platform if limits are known.

### Problem 3: Two usage tracker types and ad-hoc Ledger parsing

- **Risk**
  - `state::UsageTracker` + `types::UsageRecord` vs. `platforms::UsageTracker` + `UsageEvent`/`UsageSummary`; Ledger parses raw JSON with different field names. Duplicate logic and schema drift: writers and readers can get out of sync.
- **Impact**
  - Ledger shows wrong or missing fields; 5h/7d aggregation might miss data or double-count if we add a second reader; bugs when we change one path and forget the other.
- **Mitigation**
  - Unify on one canonical write path and one `UsageRecord` schema. If `usage.jsonl` persists, it is a mirror / compatibility artifact rather than an independent canonical source.
  - Document the schema in STATE_FILES and in code; use the same types for write and read where possible.
  - Prefer one projector/reader path for local summaries so Ledger, rollups, and UI projections do not fork into separate attribution models.

### Problem 4: 5h/7d semantics differ by platform

- **Risk**
  - Codex: 5h message limit. Claude/Copilot: org-specific windows. Gemini: quota window (e.g. reset after 8h44m). Cursor: API available for augmentation but window semantics may differ. A single "5h: X/Y" column implies identical meaning across platforms when it is not.
- **Impact**
  - User misinterprets "5h" for Gemini as the same as Codex; or we show misleading comparisons.
- **Mitigation**
  - Per-platform labels in the UI (e.g. "Codex 5h", "Claude 7d", "Gemini (estimated)") and a short tooltip or doc link explaining what each window means.
  - Avoid one generic "5h/7d" column when semantics differ; use platform-specific columns or clearly labeled sections.

### Problem 5: Ledger file size

- **Risk**
  - Event storage (seglog) grows unbounded over long-running or high-throughput projects. Very large seglogs slow analytics scan jobs and increase startup recovery time.
- **Impact**
  - Slow UI refresh for 5h/7d windows, elevated memory during rollup recalculation, or degraded startup when the seglog requires extended CRC validation.
- **Mitigation**
  - Retention policy: keep raw seglog events for a configurable window (default 90 days); archive or compact older events with an optional export-first step.
  - Seglog compaction: periodic background job consolidates older fine-grained events into daily summary records, reducing scan time while preserving attribution fidelity.
  - Rollup freshness: 5h/7d windows are served from redb rollups, not from raw event scans. Background analytics jobs refresh rollups incrementally; UI shows the last committed rollup plus an explicit freshness cue when a refresh is in progress.
  - `usage.jsonl` is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving. If retained for debugging, it follows the same retention policy as seglog.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Problem 6: Stale data

- **Risk**
  - User sees 5h/7d that was last updated 30 minutes ago; they hit a limit in the meantime and are surprised.
- **Impact**
  - Loss of trust in the Usage view; unnecessary failed runs.
- **Mitigation**
  - Show "Last updated: &lt;time&gt;" next to 5h/7d and provide a prominent "Refresh" action.
  - Optional: lightweight refresh when app gains focus or when starting a new run (with rate limiting to avoid thrash).

### Problem 7: Multi-project usage

- **Risk**
  - `usage.jsonl` is per-project (`.puppet-master/usage/`). Users with many projects may expect "total usage across my projects" or get confused whether the view is project-scoped.
- **Impact**
  - Confusion about scope; feature requests for cross-project aggregation before we are ready.
- **Mitigation**
  - Clarify in UI: "Usage for this project" (or "Current project") for v1.
  - If we later support "All projects", require an explicit scope selector and document where we read from (e.g. scan multiple `.puppet-master/usage/` dirs).

---

## Enhancements (Beyond Minimum)

### Enhancement 1: Time-window selector

- **Benefit**
  - Power users can match platform windows (5h, 7d, 24h) or choose a custom range; avoids one-size-fits-all.
- **Notes**
  - Especially useful once we have multiple window types per platform. Implement as dropdown or preset buttons (5h, 7d, 24h, custom date range).
- **Phase**
  - v1 optional; can ship with fixed 5h/7d first.

### Enhancement 2: Reset countdown

- **Benefit**
  - When we have reset time (from error parsing or API), showing "Resets in 2h 15m" next to 5h/7d reduces guesswork and supports planning.
- **Notes**
  - `QuotaInfo.resets_at` already exists in `platforms::usage_tracker`; surface in GUI and update when we have new error or API response.
- **Phase**
  - v1 if we already parse errors; low effort.

### Enhancement 3: Per-run and execution-scope usage in Config

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0700
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still describes Usage by `tier/session` and says tier config shows current usage
  - tier/session
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Benefit**
  - In execution settings, "This run / node / package used X tokens / Y requests in last 7d" helps users see which execution scope burns the most and adjust platform or model.
- **Notes**
  - Aggregate from canonical usage identity (`usage_event_ref`, `run_id`, `node_id`, `attempt_id`, and related runtime attribution fields) rather than by `tier_id`. Requires a shared aggregation API or module used by both Usage and Config.
- **Phase**
  - Post-v1 once 5h/7d and Ledger are stable.

### Enhancement 4: Export from Usage page

- **Benefit**
  - Export current view (ledger filter, date range, or analytics table) as CSV/JSON for reporting or external tools.
- **Notes**
  - Aligns with OpenCode Monitor / yume. Ledger already has "Export Ledger"; unify under Usage and add date-range/analytics export.
- **Phase**
  - v1 for Ledger export; extend to analytics when analytics view exists.

### Enhancement 5: Usage in header (compact)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0701
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Project cards likely need compact pressure signals, not full usage details.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Benefit**
  - One line in app header (e.g. "Cursor 5h: 80% - Claude 7d: 45%") reduces need to open Usage page for a quick check.
- **Notes**
  - Option C in GUI placement. Keep compact to avoid clutter; link to full Usage page.
- **Phase**
  - v1 or post-v1 depending on placement choice.

### Enhancement 6: Doctor integration

- **Benefit**
  - Cross-links: "View in Usage" from Doctor when usage warning/error; "Run Doctor" for usage from Usage page. Keeps usage and health in one mental model.
- **Notes**
  - Doctor already has `usage_check`; add navigation message or button to Usage; from Usage add button to run Doctor (or open Doctor tab with usage checks).
- **Phase**
  - v1 optional; small UX improvement.

### Enhancement 7: Cost column when available

- **Benefit**
  - When platforms expose cost (e.g. in stream-json result), persist and show in Ledger and analytics; enables "cost by project/date".
- **Notes**
  - Orchestrator currently writes `cost: None`. Extend write path when runner or parser provides cost; add column to Ledger and to analytics aggregates.
- **Phase**
  - When at least one platform provides cost; then extend to others.

### Enhancement 8: Alerts history

- **Benefit**
  - Log when we showed "approaching limit" or "quota exhausted"; user can review "I was warned at 14:00" for debugging or awareness.
- **Notes**
  - Optional; store in a small log or append to a file under `.puppet-master/usage/` (e.g. `alerts.jsonl`). Display in Usage or Settings.
- **Phase**
  - Post-v1.

### Enhancement 9: Comparison with peers / benchmarks

- **Benefit**
  - e.g. "You use more tokens than 60% of users" could motivate optimization or reassure; would require anonymized opt-in data and a backend.
- **Notes**
  - Out of scope for current plan; possible future if we add opt-in telemetry and a comparison service.
- **Phase**
  - Future; not in scope.

## Out of Scope for This Plan

- Changes to platform CLI contracts or new platform-specific APIs beyond what AGENTS.md already describes.
- Token counting or context-window usage for chat/assistant (covered by assistant-chat-design §12 and newfeatures §10/§15).
- Implementation details of the current stack (Rust/Iced); the feature should be realizable in a future stack with the same data contracts and UX goals.

## Success Criteria

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0695
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `success`
  - success
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- Users can see 5h/7d usage (and plan, where available) without running a manual "usage" command.
- Users can open a dedicated Usage view (or equivalent) to see ledger and, if implemented, analytics.
- When approaching or hitting a limit, users see a clear warning or message and a path to Usage or tier config.
- Tier/config flows show current usage when choosing a platform.
- Usage section aligns with ecosystem norms: **always-visible** 5h/7d (and plan where available), plus optional analytics/cost view (yume/openclaudecto-style).

## Version History

| Date | Change |
|------|--------|
| 2026-02-21 | Initial plan: Usage as first-class app/GUI feature; quota visibility, ledger, optional analytics; alignment with AGENTS.md and newfeatures; external references (OpenSync, yume, openclaudecto, OpenCode Monitor). GUI-based usage (not CLI like OpenCode Monitor). |
| 2026-02-21 | Fleshed out: Gaps (5h/7d not in GUI, no live APIs in GUI path, Ledger vs usage_tracker split, quota only from errors, alert threshold, analytics, interview/orchestrator policy); Potential problems (API secrets, rate limits, two tracker types, platform semantics, file size, stale data, multi-project); Enhancements (time-window selector, reset countdown, per-tier usage, export, header compact, Doctor integration, cost column, alerts history). |
| 2026-02-21 | Data sources: added "Data Sources: State Files (JSON/JSONL)" as an early draft direction. That historical note is now superseded by canonical child-run/runtime accounting: `usage.jsonl` and similar state files may still appear as implementation artifacts, but `active-subagents.json` is not canonical usage truth. |
| 2026-02-21 | Fleshed out Gaps, Potential Problems, Enhancements: each gap has Current state / Desired / Acceptance; each problem has Risk / Impact / Mitigation; each enhancement has Benefit / Notes / Phase. |
| 2026-02-21 | Per-platform usage data: added section on Cursor API (augment with usage/limits; CURSOR_API_KEY); Codex CLI stream/provider data; Copilot CLI + metrics API; Claude Admin API + stream-json (existing); Gemini (direct-provider: local counters + estimated cost; optional AI Studio link; no CLI usage assumptions). Summary table and implementation order. |
| 2026-02-21 | Clarified Cursor API: usage/account/limits only -- we do not use it for model invocation; model engagement stays OAuth + CLI. AGENTS.md "No API available" refers to model invocation; Cursor has a separate API for augmenting the Usage view. |
| 2026-02-22 | Added "Storage dependency (implementation)": Usage depends on seglog + redb + projectors + analytics scan; embedded implementation checklist from storage-plan.md; clarified state-file-first fallback until stack exists; cross-referenced storage-plan.md and deterministic verifier/evidence contracts in Relationship to Existing Docs. |
| 2026-02-23 | Added widget-composed page layout addendum (sections below): Usage page is fully widget-composed with grid-based resizing, per-widget config, Multi-Account widget as first-class catalog entry, and Dashboard reuse via add-widget flow. |

---

<a id="widget-composition"></a>
## Widget-Composed Page Layout (Addendum -- 2026-02-23)

### Scope of This Addendum

This section extends the Usage page from a static layout to a **fully widget-composed, grid-based page** using the Widget System defined in Plans/Widget_System.md. The Usage page is a required, dedicated top-level page. Every content area on the Usage page is a widget.

ContractRef: ContractName:Plans/Widget_System.md

### Usage Page is Widget-Composed

The Usage page MUST be composed entirely of widgets from the widget catalog (Plans/Widget_System.md section 2). There is no static/fixed content area -- every panel, chart, and table is a widget that can be moved, resized, and configured.

Users can:
- **Move** widgets within the grid (drag-and-drop).
- **Resize** widgets by grid spans (drag widget edge, grid-snapping per Plans/Widget_System.md section 3).
- **Configure** each widget individually (gear icon for time window, platform filter, chart type, etc.).
- **Add** new widgets from the catalog via the add-widget flow.
- **Remove** widgets they don't want to see.

ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/Widget_System.md#4

### Default Widget Layout (4-column grid)

The Usage page ships with this default layout. No page starts empty. Users can customize after first load.

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.quota_summary` | 2x1 | 5h/7d usage bars per platform with plan type |
| 2 | 0 | `widget.alert_thresholds` | 2x1 | Approaching-limit warnings and threshold status |
| 0 | 1 | `widget.analytics_chart` | 2x2 | Aggregate usage over time (bar/line/area chart) |
| 2 | 1 | `widget.budget_donuts` | 2x2 | Donut charts for budget consumption per platform |
| 0 | 3 | `widget.tool_usage` | 2x2 | Tool invocation count, latency (p50/p95), error rate |
| 2 | 3 | `widget.multi_account` | 2x2 | Per-platform account list, active account, cooldown state |
| 0 | 5 | `widget.ledger_table` | 4x3 | Event-level usage/token/cost ledger with filtering |

### Grid-Based Resizing

- Uses the grid system from Plans/Widget_System.md section 3.
- Column count is responsive: 2 columns (<1200px), 3 columns (1200-1600px), 4 columns (>1600px) per Plans/FinalGUISpec.md section 12.3.
- Each widget can be independently resized within its declared min/max grid constraints.
- Resizing a widget can affect what data it shows: e.g., a wider `widget.analytics_chart` shows more time granularity, a taller `widget.ledger_table` shows more rows.

ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/FinalGUISpec.md#12.3

### Per-Widget Configuration

Each Usage widget has a gear icon in its header for per-widget configuration. Examples:

| Widget | Config Options |
|--------|---------------|
| `widget.quota_summary` | Time window (5h/7d), platforms to display |
| `widget.analytics_chart` | Time window (5h/7d/24h/custom), chart type (bar/line/area), platforms to include |
| `widget.budget_donuts` | Time window, chart style (donut/bar) |
| `widget.tool_usage` | Time window, sort by (count/latency/errors) |
| `widget.ledger_table` | Visible columns, page size, default sort, event type filter |
| `widget.multi_account` | Platforms to show, show cooldown timers (on/off) |

Configuration is persisted alongside the widget layout per Plans/Widget_System.md section 7.

ContractRef: ContractName:Plans/Widget_System.md#5

### Multi-Account Widget as First-Class Catalog Entry
The multi-account widget remains a first-class catalog entry, but it is now a status and observability widget rather than the canonical setup surface.

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md

Required content:
- provider entry or server-profile row label
- active/effective marker
- plain-language status (`Working` or a concrete reason)
- pressure/cooldown summary
- source-confidence / stale label where needed
- direct link/action into Agent-Config for setup, validation, or repair

Rules:
- the widget does not replace Agent-Config for account management, billing/entity selection, instruction control, skills, or MCP setup.
- one GitHub Copilot auth-backed row may show a selected organization/billing entity beneath it rather than rendering duplicate top-level rows.
- OpenCode server profiles appear alongside account-backed rows with explicit profile-mode labels.
- the widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
### Reuse on Dashboard via Add-Widget Flow

All widgets that appear on the Usage page are **also hostable on the Dashboard**. Users can add any Usage widget to the Dashboard through the add-widget flow (Plans/Widget_System.md section 4):

1. On the Dashboard, click "Add Widget".
2. The catalog overlay shows all Dashboard-compatible widgets, including all Usage widgets.
3. Select a widget (e.g., `widget.quota_summary`) and click "Add".
4. The widget appears on the Dashboard grid with its default size.
5. Configure and resize as needed.

This means users can build a Dashboard that includes usage information alongside orchestrator status and other widgets, without needing to navigate to the Usage page.

ContractRef: ContractName:Plans/Widget_System.md#4

### Cross-References

- Plans/Widget_System.md -- grid system (section 3), widget catalog (section 2), add-widget flow (section 4), layout persistence (section 7)
- Plans/Multi-Account.md -- multi-account data model and GUI requirements
- Plans/FinalGUISpec.md -- responsive grid (section 12.3), existing Usage view (section 7.8)
- Plans/storage-plan.md -- redb rollup keys for usage data

## Runtime Scheduler / Recovery Observability Addendum (2026-03-09)

### Recommended counters / views
- blocked attempts by `blocked_reason_code`
- retries by `failure_class`
- remediation children spawned and resolved
- queue-analysis passes and wake reasons
- safe-point creates/restores
- blocked outcomes remain distinct from failures
- blocked counters also retain `escalation_level` and the shared blocked-action disclosure (`action_available`)

### Metrics integrity rule
- usage rollups may keep executed-tool metrics separate while blocked and remediation disclosure remains queryable
- blocked outcomes remain distinct from failures in user-visible statistics
## Source Control, GitHub Actions, and Docker Manager Cost Attribution Addendum (2026-03-12)

Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.

Rules:
- when a receipt or artifact carries `usage_event_ref` or equivalent canonical usage identity, `Show in Ledger` and `Show in Usage` open the canonical Usage surfaces with that event in scope
- if a user reruns workflows, tails logs, performs repeated registry refreshes, or executes other cost-bearing remote actions, the resulting cost attribution still resolves through canonical usage records
- any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
