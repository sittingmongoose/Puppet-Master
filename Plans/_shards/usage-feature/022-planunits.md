# Shard 022: PlanUnits

Source: `Plans/usage-feature.md`

Source lines: L926-L1165

Source SHA256: `85a0a8e8e78485774a55d5d4185f3653412cc4c33707817e77b83171fca838b1`

---

## PlanUnits

### UF-001 - Usage Feature -- App/GUI Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: UF-001
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Plans/usage-feature.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- Usage Feature -- App/GUI Plan
- Canonical owner-section requirements
- Export taxonomy and manifest contract
- Projection trust and action gating
- Execution role and operational identity
- Account switch and pressure history
- Identity and blocked-policy transfer cluster
- Bridge-field precedence for attempt/provider/usage/receipt joins
- Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Artifact envelope routing preference
- Plan Document Status
- Rewrite alignment (2026-02-21)
- Storage dependency (implementation)
- Usage storage and routing clarifications
- Executive Summary
- Relationship to Existing Docs
- External References (Competitive & Ecosystem)
- Scope of the Usage Feature
- 1. Quota and plan visibility (primary)
- 2. Alerts and thresholds
- 3. Event ledger (existing concept, under Usage umbrella)
- 4. Optional analytics and reporting
- 5. Per-thread usage in Chat (OpenCode-style)
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
negative_constraints:
- '- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.'
- '- provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI'
- '- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.'
- '- Cursor browser-auth accounts may provide strong local per-run usage, but `/limit` and account-row truth require provider or team API augmentation; PM must not treat inferred per-run data as a `remaining-requests` source.'
- '- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.'
- '- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.'
- '- Team admin APIs such as `/metrics/spending` may inform Copilot pressure, but PM must not promise a simple per-account `remaining-requests` endpoint as account-row truth unless the provider exposes one.'
- '- PM must not reduce Copilot pressure to only `has premium requests left` vs `does not`; provider evidence must preserve whether the account has premium requests left, does not, or is blocked by billing/entity, organization, or runtime-side entitlement policy.'
- '- `usage-record` / `usage_record` fields contain only attribution-relevant additive fields needed for usage owner attribution; `bridge-visible` fields are the subset needed to prove the runtime surface that actually executed the call, while scheduler-internal IDs remain scheduler/effective-resolutio'
- '- API / Console / organization-backed Claude Code limits are org-level and may include monthly spend limits plus shorter-window rate limits such as `RPM` and `/TPM`; subscriber-backed rows must not reuse those hard limit semantics without provider evidence.'
- The provider-doc reconciliation keeps `Plans/CLI_Bridged_Providers.md` as the owner for Gemini CLI runtime transport. Usage must not collapse Gemini into one direct provider with mixed OAuth/API-key pools and no CLI runtime.
- Gemini `/quota` visibility is mode-aware. OAuth-backed rows may surface Gemini-plan / Code Assist-style quota semantics when authoritative evidence exists; API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path. Stale `/AI-Studio-oriented`
- '- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file'
- '- Role-scoped routing must appear in effective-resolution and usage schemas when policy/storage carries role scope; Usage must not rely on policy/storage-only role state for canonical usage attribution.'
- '- Cost-integrity display rules are `/clamp/derived-field` rules: sub-cent and sub-dollar display precision is derived from `cost_microdollars` or exact provider minor-unit receipts when available; the canonical display tiers are `<$0.01 = 6dp`, `<$1 = 4dp`, and otherwise 2dp, while `cost_usd` remain'
- '- Raw-cost provider values are retained as provenance or debug evidence only after normalization to canonical token buckets and `cost_microdollars`; raw-cost fields must not become independent billing authority.'
- '- `usage.jsonl` is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving. If retained for debugging, it follows the same retention policy as seglog.'
- '- the widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.'
- Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.
- '- any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline'
- Bulk-operation receipts preserve the parent/child shape for usage and history. A parent bulk receipt carries aggregate counts for `/failed/blocked/skipped` plus completed targets; child receipts carry `per-target` result, usage_event_ref, rollback or `/undo` expectation, and any blocked reason. Orch
- '- Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage; Usage must not invent feature-local routing semantics when a receipt or runtime artifact already carries the shared subject.'
- '- Quiet-window behavior applies to advisory pressure or `/threshold` warnings only. Blocked states and canonical `action-needed` episodes must not quietly disappear behind the same suppression rule.'
compatibility_only_notes:
- 'Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it '
- '- `thread_blocked_notice` and `wizard_runtime_state` may preserve `resume_url?` only as compatibility recovery data; Usage opens blocked and wizard subjects through shared route-target payloads rather than storage-plan special-casing.'
- '- Usage and storage are attempt-centric for runtime attribution and preserve tier-centric labels only as compatibility vocabulary. Durable switch and pressure history uses actor-scoped snapshots plus first-class account-switch and pressure-episode records instead of only per-attempt `recent_switch_r'
- '- Usage consumes `Plans/Widget_System.md` and `/Widget_System.md` only for widget hostability, layout, and configuration persistence; Widget_System''s broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership.'
- '- Cursor instruction-sync status uses `Cursor Rules` as the user-facing label. PM generates `.cursor/rules/*.mdc` first, tracks compatibility projections such as `cursor/rules/*.mdc` under `/rules/`, and treats `.cursorrules` / `cursorrules` as `/deprecated` compatibility rather than the primary man'
- '- **Compatibility input:** `usage.jsonl` may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.'
- '- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file'
- '- `cost_usd = cost_microdollars / 1_000_000` is derived only at display/export boundaries or compatibility import/migration edges; it is not a persisted UsageRecord authority field.'
- '- Unify on one canonical write path and one `UsageRecord` schema. If `usage.jsonl` persists, it is a mirror / compatibility artifact rather than an independent canonical source.'
- Small-sweep owner precedence is explicit for these hidden cross-cutting contracts. `usage-feature.md` owns cost_usage routing and cost attribution; `newtools.md` owns Docker/Actions readiness and deprecated-alias doctor IDs; Crosswalk owns `/precedence` between feature-owner docs; Docker, GitHub Act
stale_retired_dispositions:
- '- Usage freshness is a user-trust requirement: stale values must be visibly marked with `Last updated` and an explicit `Refresh` action so old numbers are never presented as current.'
- '- Usage consumes `/package` and `/worktree` cleanup state only after owner records mark stale lanes or worktrees `cleanup_eligible`: lane/package completion, graph-patch supersession, revoked/reopened flow via `/reopened`, and completed recovery may make old backing removable only when no retention '
- '- Cursor instruction-sync status uses `Cursor Rules` as the user-facing label. PM generates `.cursor/rules/*.mdc` first, tracks compatibility projections such as `cursor/rules/*.mdc` under `/rules/`, and treats `.cursorrules` / `cursorrules` as `/deprecated` compatibility rather than the primary man'
- '- Codex stale-vs-live provider/model labeling must distinguish last-known upstream provider/model data from the current direct-provider state, and Codex multi-account includes ChatGPT `/OAuth-style` auth and API-key auth side by side.'
- Gemini usage must distinguish the direct provider from Gemini CLI while still allowing family-level pooling when policy permits. Stale-canon wording that reduces Gemini to local counters, a single `mixed-account` provider, or a generic API-key `key-exception` is not sufficient for Usage.
- Gemini `/quota` visibility is mode-aware. OAuth-backed rows may surface Gemini-plan / Code Assist-style quota semantics when authoritative evidence exists; API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path. Stale `/AI-Studio-oriented`
- '- **Retired subagent side files:** In `Plans/usage-feature.md` (`/usage-feature.md`), `active-subagents.json` and other active-subagents `side-file` / `live-state` mirrors are compatibility projections only; they must not be presented as canonical or endorsed usage enrichment sources after side-file'
- '- Use current/refreshing/stale/degraded/unavailable projection states.'
- '- cov-146 stale token retired: allowed_action_ids[]'
- '### Problem 6: Stale data'
- '| 2026-02-21 | Fleshed out: Gaps (5h/7d not in GUI, no live APIs in GUI path, Ledger vs usage_tracker split, quota only from errors, alert threshold, analytics, interview/orchestrator policy); Potential problems (API secrets, rate limits, two tracker types, platform semantics, file size, stale data,'
- '- source-confidence / stale label where needed'
- Small-sweep owner precedence is explicit for these hidden cross-cutting contracts. `usage-feature.md` owns cost_usage routing and cost attribution; `newtools.md` owns Docker/Actions readiness and deprecated-alias doctor IDs; Crosswalk owns `/precedence` between feature-owner docs; Docker, GitHub Act
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Blocked-owner eight-kind taxonomy and escalation ladder surfaces'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'The rewrite described in `Plans/rewrite-tie-in-memo.md` reinforces this plan''s intent: Usage should be implemented as **projections/rollups** over the canonical event ledger (seglog), with durable KV state in redb and fast search in Tantivy--without changing the UX requirements in this document. 5h/'
- Usage depends on a **complex storage solution**; the feature cannot deliver 5h/7d, dashboard, and analytics at scale without it. The canonical design is in **Plans/storage-plan.md** (validated by deterministic verifier gates and SSOT evidence contracts). Implementers must have the following in place
- '| **Seglog** (canonical event stream) | All usage-relevant events (tokens, requests, errors, platform, tier, session) are appended here; single source of truth for analytics. |'
- '- [ ] Implement seglog writer for canonical event stream.'
- 'Until this stack exists, any temporary compatibility path MUST still preserve the canonical pipeline: 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans. `usage.jsonl` may still appear as a human-readable mirror or Ledger compatibility input during migration, but it '
- '- Usage storage-doc dependencies are `Plans/storage-plan.md` and `Plans/FinalGUISpec.md`: seglog owns the append-only event source, redb owns durable KV `/settings/state`, checkpoints, projections, and rollups, Tantivy owns search indices, and any JSONL or `usage.jsonl` output is a projector mirror '
- '- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.'
- '- GUI deep-links no longer use `run_id/thread_id/timestamp`, `/thread_id/timestamp`, `usage_event_seq`, broad timestamp filters, or tier-based `usage.jsonl` rollups as canonical navigation. They resolve object-first pivots through `usage_event_ref`, UsageRecord identity, runtime object identity, and'
- '- Usage export semantics stay distinct: record export returns exact `/records` with stable ids, canonical ids, `/refs`, metadata, and schema-aware payloads; bundle export packages records, Evidence items, attached `/blobs/files`, thread export/share payloads, selected-object bundles, `.pm-bundle` co'
- '- Usage follows graph-scale guidance across Seams, Evidence, History, and Ledger: filtered CSV is a view export rather than canonical history, JSON summaries are not record exports unless they preserve the exact record envelope, monolithic plan-graph export stays derived, and JSONL mirror export is '
- '- project-card usage copy stays compact: one primary line carries current state, owner, and reason; one secondary line carries active/background/historical summary; detailed per-run usage remains in drill-down records rather than being dumped into the card.'
- '- Quiet suppression only affects advisory resurfacing. Attention center and project badges must preserve canonical blocked and `/approval-wait` rows with precise owner and reason metadata, even when a quiet window is active.'
- '- Usage consumes `Project_Output_Artifacts.md` and `Project_Output_Artifacts` through a seglog-first / staging-second artifact model that aligns subject-open routing with canonical record identity before staging views become user-facing.'
- '- `storage-plan.md` and `storage-plan` thread/run history export to JSONL/JSON is a coarse export enhancement only; Usage treats it as projection output over canonical records rather than a replacement for the record/bundle/view taxonomy.'
- '- Usage consumes `/package` and `/worktree` cleanup state only after owner records mark stale lanes or worktrees `cleanup_eligible`: lane/package completion, graph-patch supersession, revoked/reopened flow via `/reopened`, and completed recovery may make old backing removable only when no retention '
- '- `cmd.nav.open_usage_subject` resolves canonical Usage/Ledger identity from `usage_event_ref` or an equivalent usage target; domain-specific usage commands are wrappers over the shared route/subject model, not independent argument families.'
- '| **AGENTS.md -- Usage Tracking & Plan Detection** | Canonical source for per-platform usage sources (Claude Admin API, Copilot metrics, Gemini quotas, Codex/Cursor error parsing), env vars, and error-message parsing. |'
- '| **Plans/assistant-chat-design.md §12** | Context/usage display: **context circle** (OpenCode-style) at top of chat -- hover shows tokens/usage %/cost; thread-scoped detail opens the canonical Context Detail Pane/editor-tab surface. |'
- '- OpenCode message UI is a reference for hover-revealed icon actions and metadata rows on messages, but it does not satisfy PM''s richer per-message info popover requirement; PM keeps the curated inspection and raw payload requirements below as the canonical target.'
- '- selecting `Compact Now` dispatches the canonical compaction command for that thread'
owner_hints:
- Plans/usage-feature.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

