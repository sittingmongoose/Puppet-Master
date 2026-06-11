# Shard 022: PlanUnits

Source: `Plans/Models_System.md`

Source lines: L1244-L1465

Source SHA256: `c21e126a333195a8bcdc1cd0e36aeb481c934defeb85a72b60479c5b519f134c`

---

## PlanUnits

### MS-001 - Models System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: MS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Plans/Models_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Models_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0077
preserved_exact_tokens:
- Models System (Canonical SSOT)
- Canonical owner-section requirements
- Coverage blocker provider/model precedence owner section
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- Provider/model precedence and settings resolution
- Scope and owner boundaries
- Three-axis settings model
- Deterministic precedence by scope
- Resolver inputs and emit shape
- 1. Canonical model identifier
- 1.1 Format
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
- 1.2 Runtime-platform distinction
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md'
- 1.3 Display-name policy
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md'
- 2. Model and runtime selection priority
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
- 3. Model options configuration
- 3.1 Per-provider options
- 3.2 Per-model options
negative_constraints:
- 'Runtime/storage identity fields must keep `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` aligned: `requested_persona` and `effective_persona` are canonical, `_id` variants are compatibility labels, and `/runtime/storage` account fallback fields'
- 'Owner-of-owners cleanup is implementation-relevant: 00-plans-index.md, plans-index, Decision_Log, Decision_Log.md, rewrite-tie-in-memo, rewrite-tie-in-memo.md, feature-list, feature-list.md, newfeatures.md, addendum-to-plan-map, SSOT rows, highest-value owner-of-owners routing, promoted-feature phas'
- Requested/effective runtime identity uses the `requested_*` and `effective_*` field families as canonical cross-system IDs. `Contracts_V0`, `Contracts_V0.md`, `_id` compatibility fields, and `/runtime` consumers may expose those IDs, but they must not collapse requested, effective, account, provider
- Execution object copies are execution-object-level records, not loose GUI hints. The GUI must not-forget node-worker and `/model` ownership when it renders or copies provider/model state for execution objects.
- Help and explanation copy must preserve copy-depth and concept-governance metadata. `Personas.md`, `Models_System`, `Models_System.md`, `FinalGUISpec.md`, `/help`, authored-copy, `Expert`, and `ELI5` outputs may simplify presentation, but they must not simplify the underlying provider/model contract
- Tab identity is scoped. `tab_id` must not be reused for side-panel subviews, browser tab IDs, workspace tab IDs, widget slots, or compare-target variants.
- Worktree visibility records may expose `/worktree/branch/tier` and `/lane`, but package/lane ownership, contamination, restore eligibility, and promotion posture must not stop at legacy tier status.
- Planning and `/output` surfaces consume the same subject-open model as artifact-opening flows. file-opening documentation may realize a chosen subject, but it must not replace the shared subject-open resolver or create provider/model-specific open rules.
- GUI `/disambiguation` uses secondary text such as `/runtime/auth-family/billing` context when a `cleaned-label` collision occurs. Cosmetic display labels, normalized internal keys, and collision-safe grouping must not mutate the stored `provider_id/model_id`.
- Capability checks are data-driven and must not devolve into scattered `if-else` branches. Gemini Direct and Gemini CLI keep distinct capability entries, and Gemini `disableCache` compatibility evidence maps through `cache_control` / `cache_with_oauth` rather than a hidden provider flag.
- Google Vertex Anthropic 1M-context support is runtime-path-specific. PM must not hardcode one universal 1M-context signal because implementation-reference issues disagree on whether the correct signal is a header or a body field depending on endpoint and /runtime path (`#14003`, `#17494`, `#14055`).
- OpenAI/Azure-family API-family selection and API path selection are per-model and `/per-provider` model/runtime compatibility facts. Azure loaders that switch between `responses()` and `chat()` based on `useCompletionUrls` must preserve that choice in provider capability and request metadata; non-Op
- '- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.'
- '- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.'
- '- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl; deployment mode, requested/effective adapter identity, and capability differences remain visible before fallback or recovery.'
- '- DuckDuckGo partial crawl behavior must not disappear'
- '**AC-MOD04:** If a Persona specifies an unavailable model, the system MUST log a warning and fall through to the next priority level. The run MUST NOT be blocked.'
- '- PM must keep adapter policy explicit and must not assume one generic direct-provider loop is sufficient for all model families; OpenAI-like providers therefore use per-surface API-family routing, including explicit `responses` vs `chat` vs `model-language` / plain language model primitive selectio'
- '- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix'
- '- providers/adapters must not hide model-local retry loops inside an already-running attempt'
- '- model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics'
compatibility_only_notes:
- Dispatch context and worktree precedence are part of this owner section. `DispatchContext.provider_id`, `model_id`, and provider/model precedence must cover run, seam, package, node, overseer, delegated-subagent, parallel-node worktree assignment, and ownership transitions. `Plans/Executor_Protocol.
- 'Run Graph consumers must map worker and /verifier identity back to the requested/effective snapshot. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` may display `Provider / Model`, `worker_provider`, `worker_model`, `verifier_provider`, and `verifier_model`, but those are compatibility labels over '
- 'Runtime/storage identity fields must keep `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` aligned: `requested_persona` and `effective_persona` are canonical, `_id` variants are compatibility labels, and `/runtime/storage` account fallback fields'
- Requested/effective runtime identity uses the `requested_*` and `effective_*` field families as canonical cross-system IDs. `Contracts_V0`, `Contracts_V0.md`, `_id` compatibility fields, and `/runtime` consumers may expose those IDs, but they must not collapse requested, effective, account, provider
- Legacy tier-scoped references from `Plans/feature-list.md`, `Plans/00-plans-index.md`, `/feature-list.md`, `/00-plans-index.md`, and feature-list material are compatibility inputs only and cannot override the current provider/model owner contract.
- Adjacent UI and persona compatibility references preserve both full paths and legacy aliases for `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/FinalGUISpec.md`, `/storage-plan.md`, `/Orchestrator_Page.md`, and `/Personas.md`.
- Multi-account and persona compatibility references preserve `Plans/Multi-Account.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/Multi-Account.md`, `/Orchestrator_Page.md`, and `/Personas.md` when provider/account context is displayed beside model selection.
- 'Lifecycle transitions require an event model: the event that causes each state transition must be represented with the execution-unit, provider/model snapshot, blocked-state, and receipt identity that made the transition valid.'
- The legacy four-tier hierarchy from newfeatures.md and the canonical chain-wizard-flexibility / chain-wizard-flexibility.md node-graph model are incompatible execution models; compatibility text must name four-tier and node-graph explicitly instead of blending them.
- Worktree visibility records may expose `/worktree/branch/tier` and `/lane`, but package/lane ownership, contamination, restore eligibility, and promotion posture must not stop at legacy tier status.
- 'The owner-doc cleanup rule is strict: if anchor tables, `/body` prose, addenda, or compatibility examples leave old and new provider/model models both canonical in the same surface, this document must collapse the split-brain rule into one requested/effective resolver statement instead of treating a'
- Executor compatibility keeps `Executor_Protocol`, `Executor_Protocol.md`, `/seam`, `/execution`, execution-unit, and TierContext references mapped to the current execution-unit context and package/seam overseer governance model.
- Tier-native ingestion and active-agent tracking are legacy compatibility inputs. tier-native, active-agent, lane-aware scheduling, and worktree tracking must resolve through package/lane ownership rather than reviving tier-native execution semantics.
- '- Canonical model IDs align with persisted vocabulary in `Plans/Contracts_V0.md` (`/Contracts_V0.md` in legacy path references); contracts may cite the model provider namespace, but they do not redefine this identifier grammar.'
- '- `model_id_raw`, `effort`, `compact_threshold`, `auth_family`, `pool_scope`, `effective_runtime`, and `effective_runtime_snapshot` remain inspectable runtime/model fields when they affect selection, compatibility, or requested/effective disclosure.'
- Capability checks are data-driven and must not devolve into scattered `if-else` branches. Gemini Direct and Gemini CLI keep distinct capability entries, and Gemini `disableCache` compatibility evidence maps through `cache_control` / `cache_with_oauth` rather than a hidden provider flag.
- Compatibility evidence that labels a Google Vertex AI/Google AI cache-marker gap as `cachePoint` is treated as a `cache_control`/`cachedContent` capability issue; PM must emit the native cache marker for the selected route or repeated 5-15K-token prompt spans may be BILLED again instead of reusing c
- OpenAI/Azure-family API-family selection and API path selection are per-model and `/per-provider` model/runtime compatibility facts. Azure loaders that switch between `responses()` and `chat()` based on `useCompletionUrls` must preserve that choice in provider capability and request metadata; non-Op
- OpenCode reference evidence prefers the Responses API for OpenAI, while Chat-Completions-only proxies have known compatibility issues (`#15016`, `#7793`); PM records the selected OpenAI/Azure API family per model/runtime instead of assuming a universal route.
- Model catalog entries carry `model_lifecycle_state` with closed values `active | deprecated | sunset_pending | sunset | removed`. Deprecated models may continue for compatible existing work with a `deprecation_notice_ref?`; `/sunset` or `sunset` models require `sunset_at_utc?` and `replacement_model
- 'For Bedrock, region and `/model-id` rewrite rules are deterministic provider-runtime compatibility facts: PM may add the required regional prefix only through the table below and must honor no-rewrite exemptions for ARNs and provider-native ids that are already canonical.'
- '- Any legacy consumer wording in `Plans/assistant-chat-design.md` or `/assistant-chat-design.md` that treats Gemini effort or Cursor effort as universally unsupported is superseded by this runtime-qualified capability rule.'
stale_retired_dispositions:
- '- ownership transitions between overseer and delegated-subagent levels MUST emit a fresh resolver record instead of silently inheriting stale effective state'
- Model catalog entries carry `model_lifecycle_state` with closed values `active | deprecated | sunset_pending | sunset | removed`. Deprecated models may continue for compatible existing work with a `deprecation_notice_ref?`; `/sunset` or `sunset` models require `sunset_at_utc?` and `replacement_model
- '### 4.2 Pricing metadata and stale-pricing behavior'
- Pricing metadata is versioned. `pricing_version` identifies the pricing table used for cost calculation. User-supplied overrides are applied before warnings. Doctor integration warns when stored pricing metadata is stale relative to the current provider metadata snapshot.
- AWS Bedrock pricing uses the same `pricing_version`, stale-pricing warning, and user-override path as other providers; AWS-specific region-prefix or price-drift evidence is handled by the Bedrock lookup below rather than hardcoded price branches.
- '- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale '
- '- availability or capability gaps without inferring unsupported when discovery is merely silent or stale'
- '- model discovery `/state`, including whether stale cached models remain visible while refresh runs, whether a single provider refresh failed, and whether progress is partial or complete.'
- '- unavailable, silent, or stale discovery should display `Unknown` instead of asserting `Unsupported`.'
- '- Provider/model catalog snapshots carry `boot_refresh_enabled`, `model_catalog_status`, `last_model_refresh_at`, and `selectable_unit_ids[]` / `selectable_unit_ids` so boot-time refresh, stale catalog state, and the selectable units tied to a catalog entry remain inspectable.'
- The generic signal axes remain `signal_source_kinds[]` and `signal_confidence` for signal sources/confidence. `quota_signal_sources[]` plus `quota_signal_confidence` are the quota/account-pressure specialization of those axes for account-pressure interpretation. The resolver treats these as provider
owner_boundary_notes:
- '# Models System (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Coverage blocker provider/model precedence owner section'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master model selection, configuration, and variant system — how models are identified, selected, overridden per Persona, and cycled via variants. All other plan documents MUST reference this document by anchor (e.g., `Plans/Mod
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '### Scope and owner boundaries'
- This section is the single owner section for provider/model precedence across run, seam, package, node, overseer, and delegated-subagent scope.
- '- Ownership transitions between overseer and delegated-subagent levels must stay in this owner section so later addenda elaborate the policy without replacing the canonical resolver contract.'
- 'The canonical precedence chain is:'
- 2. scoped owner policy for the active execution unit (`run`, `seam`, `package`, `node`, `overseer`, or delegated subagent)
- '- parallel-node worktree assignment participates in precedence when a worktree owner constrains the allowed provider/model surface for that node'
- '- scope owner policy (`run`, `seam`, `package`, `node`, `overseer`, delegated-subagent)'
- That emit shape is consumed by runtime snapshots, inspectors, and owner transitions; later sections in this document elaborate, but do not replace, this owner section.
- 'Provider/model concern surfaces share the concern lifecycle vocabulary used by runtime owners: `active`, `acknowledged`, `resolved`, and `dismissed` remain separate states; `resolution_kind` includes `accepted_risk`; and any concern-action confirmation matrix must disclose whether model/provider sel'
- Dispatch context and worktree precedence are part of this owner section. `DispatchContext.provider_id`, `model_id`, and provider/model precedence must cover run, seam, package, node, overseer, delegated-subagent, parallel-node worktree assignment, and ownership transitions. `Plans/Executor_Protocol.
- Node execution settings use requested-vs-effective disclosure across `/model/effort/persona`, `/model/effort`, `/settings`, `/type`, runtime-model policy, node-worker policy, and per-node execution. `feature seam`, `work package`, node, work-package overseers, and overseer-spawned subagents may each
- 'Run Graph consumers must map worker and /verifier identity back to the requested/effective snapshot. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` may display `Provider / Model`, `worker_provider`, `worker_model`, `verifier_provider`, and `verifier_model`, but those are compatibility labels over '
- 'GitHub and project account context are separate selection inputs: `GitHub_Integration`, `GitHub_Integration.md`, `storage-plan`, and `storage-plan.md` consume current-repo, current-account, selected_repo_id, and project-scoped account policy state without moving the provider/model precedence owner o'
- Adjacent owner references repeatedly implicated in provider/model cleanup include `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Multi-Account.md`, `Plans/Widget_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Executor_Protocol.md`, `Plans/Orchestrator_Page.md`, `Plans/Provider_OpenCode.md`
owner_hints:
- Plans/Models_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

