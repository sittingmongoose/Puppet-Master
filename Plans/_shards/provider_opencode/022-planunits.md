# Shard 022: PlanUnits

Source: `Plans/Provider_OpenCode.md`

Source lines: L710-L876

Source SHA256: `0c79b2e1085dbb56e95d90c05a6bbb966fa1b78d08709f04632790bd7624bed1`

---

## PlanUnits

### PO-001 - Provider: OpenCode (Server-Bridged) Source-Preserving PlanUnit

```yaml
plan_unit_id: PO-001
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: Plans/Provider_OpenCode.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Provider_OpenCode-S0054
preserved_exact_tokens:
- 'Provider: OpenCode (Server-Bridged)'
- Change Summary
- 1. Purpose
- 1.1 Transport + auth taxonomy (normative)
- 'ContractRef: ContractName:Plans/Contracts_V0.md#21-provider-transport-taxonomy, ContractName:Plans/CLI_Bridged_Providers.md'
- 2. Non-goals
- 2.1 PM-native vs OpenCode terminology boundary
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md'
- 3. SSOT References (DRY)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:Decision_Policy.md§1'
- Canonical data-shape reconciliation
- Required data shape
- Acceptance carry-through
- P5 OpenCode provider identity recovery requirements
- 4. Architecture Overview
- 4.1 OpenCode Server Model
- '4.2 Transport: HTTP + SSE (Server-Bridged)'
- 4.3 Why Server-Bridged (not CLI)
- 5. Connection Contract
- 5.1 Server Discovery and Connection
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
- 5.2 Health Check
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
negative_constraints:
- '**Key distinction (locked):** OpenCode is **server-bridged only**. Puppet Master MUST communicate via HTTP REST + SSE through the unified Provider facade; it MUST NOT run OpenCode as a CLI-bridged runtime transport. If OpenCode is enabled, this transport is not optional.'
- '## 2. Non-goals'
- '- PM-native `/web-tool` and provider-capability ownership language stays aligned to `Plans/Tools.md`; OpenCode consumer text must not flatten provider capability differentiation to `native for all` or replace PM-native ownership boundaries.'
- '- PM must not rewrite `thread_id` into an OpenCode session id.'
- '- OpenCode may set `store = false` for OpenAI and GitHub Copilot SDK paths; PM preserves that as provider request metadata and must not infer durable PM storage from it.'
- '- upstream rate-limit/outage errors → emit diagnostics (e.g. `rate_limited`, `provider_outage_or_network`) and/or `done.stop_reason`; MUST NOT expand the auth state enum.'
- 'If dynamic model discovery fails (server unreachable), Puppet Master MUST NOT hardcode fallback models for OpenCode. Instead, surface an error: "Cannot discover models — OpenCode server unreachable."'
- '- **Media tools are NOT OpenCode-provided:** Media generation (`media.image`, `media.video`, `media.tts`, `media.music`) remains a Puppet Master internal capability backed by the Gemini API key (or Cursor-native for images). OpenCode MUST NOT expose or proxy media-generation tools. The media capabil'
- '- attached profiles must not expose lifecycle actions that imply PM owns the remote process.'
- Do not copy OpenCode visuals directly or overclaim OpenCode-derived cost certainty. OpenCode cost handling carries provider-cache and provider-normalization caveats, so PM surfaces OpenCode-style cost as `estimated-cost` unless provider-authoritative pricing is available, and raw/debug evidence pres
- 'OpenCode persistence is provider-local reference state, not PM canonical state: non-atomic writes, shared snapshot indexes, SQLite stores, and NFS-incompatible filesystem assumptions MUST NOT be used as the authoritative PM ledger, event log, or recovery source.'
- '- OpenCode transport reconnect logic may reconnect only to observe an existing attempt; it MUST NOT silently resubmit prompts, reset attempt identity, or invent provider-local fallback loops'
- '- replan invalidation MUST be checked before rerunning a blocked or retried OpenCode attempt; stale attempts from an older `replan_generation` must not resume silently'
- '| Tool-policy refusal, permission denial, FileSafe denial, or external side-effect approval block surfaced through OpenCode-mediated work | Preserve the already-determined canonical runtime class (`permission_denied`, `filesafe_blocked`, `external_side_effect_blocked`, etc.) | The adapter MUST NOT c'
compatibility_only_notes:
- '- `Plans/assistant-chat-design.md` is healthier than the other three: - thread blocked-state addenda already align to blocked/runtime actions - per-thread usage is already one canonical detail surface - search/log APIs already key to `thread_id`, `run_id`, `message_id`, and `event_id` - remaining dr'
- '### 5.4 Version Compatibility'
stale_retired_dispositions:
- '- `Connected (stale discovery)`'
- '- if a previously ready profile disconnects, PM preserves the last-known discovery snapshot and marks it stale rather than blanking the provider/model surface.'
- '- discovery state covers provider, model, and auth refresh together. GUI/status projections may label that grouped readiness as `/models/auth` or `/discovery/auth`; if a cached discovery snapshot is reused after a failed refresh, the row must keep explicit `/stale` labeling alongside the last-known '
- '- Upstream auth exposed by OpenCode is labeled `Connected in OpenCode`; it is not converted into a PM-owned account row. When a profile is disconnected or unhealthy, PM preserves last-known `/providers`, models, and auth facts with explicit `stale-state` labeling rather than blanking the upstream su'
- '| status badges | Show connection, health, discovery, and stale-cache state |'
- '- replan invalidation MUST be checked before rerunning a blocked or retried OpenCode attempt; stale attempts from an older `replan_generation` must not resume silently'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- **Transport taxonomy (SSOT):** `Plans/Contracts_V0.md` (§2.1 Provider transport taxonomy) and the Provider routing policy in `Plans/CLI_Bridged_Providers.md`.'
- '### 2.1 PM-native vs OpenCode terminology boundary'
- '- PM terms such as `websearch`, `webfetch`, `requested_persona`, and `effective_persona` remain canonical'
- '- OpenCode terms may be referenced for alignment, adoption notes, or external context, but not as PM''s canonical owner vocabulary'
- '- PM-native `/web-tool` and provider-capability ownership language stays aligned to `Plans/Tools.md`; OpenCode consumer text must not flatten provider capability differentiation to `native for all` or replace PM-native ownership boundaries.'
- '## 3. SSOT References (DRY)'
- '- **Canonical contracts (events/tools/auth/UICommand):** `Plans/Contracts_V0.md`'
- '- **Platform CLI data SSOT:** `puppet-master-rs/src/platforms/platform_specs.rs`'
- '- **Canonical terms:** `Plans/Glossary.md`'
- '## Canonical data-shape reconciliation'
- '- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id'
- '- In `## Canonical data-shape reconciliation` -> `### Required data shape`, require OpenCode session IDs to live in provider-native correlation fields and never replace canonical `thread_id`.'
- '- `Plans/assistant-chat-design.md` is healthier than the other three: - thread blocked-state addenda already align to blocked/runtime actions - per-thread usage is already one canonical detail surface - search/log APIs already key to `thread_id`, `run_id`, `message_id`, and `event_id` - remaining dr'
- '- Codex confirmed the sharpest provider-side contract bug is still the **OpenCode `thread_id` collision**: - canonical `thread_id` remains PM correlation - OpenCode session ID is still being treated as if it were that canonical field - this must move into provider-native correlation before shared-ru'
- '- The cross-cutting canonical runtime fields already exist elsewhere: - `Contracts_V0.md` and `Prompt_Pipeline.md` already own the requested/effective persona/platform/model/auth/account snapshot contract - `storage-plan.md` already owns canonical runnable identity through `run_id`, `node_id`, `atte'
- '- Later addenda already require the stronger model: - `attempt_id` - `blocked_reason_code` - `allowed_action_ids[]` - `safe_point_id` - remediation lineage identifiers - `replan_generation` - queue-analysis and blocked-state rendering rules keyed to canonical runtime records'
- '- `Provider_OpenCode.md` contains a direct identity-mapping bug at the contract level: - it maps canonical `thread_id` to an OpenCode session ID - while `CLI_Bridged_Providers.md` treats `thread_id` as the stable PM correlation id and separately allows provider-native identifiers - GPT-5.2 sharpened'
- '- `Runtime_Artifacts_Panel.md` calls `artifact_id`, `run_id`, `thread_id`, `task_id`, `linked_artifact_id`, and `logical_artifact_id` the canonical ID set, but that set is still missing the attempt-native/runtime attribution fields the rest of the rewrite now depends on.'
- '- `Runtime_Artifacts_Panel.md` is stronger about canonical runtime identity, but its canonical ID set is still artifact-centric: - `artifact_id` - `run_id` - `thread_id` - `task_id` - `linked_artifact_id` - `logical_artifact_id`'
- '**Runtime boundary (scope clarification):** Puppet Master does not use SDK launch flows for OpenCode runtime transport. CLI path input is launcher/discovery fallback only; run transport remains HTTP/SSE.'
- 'Canonical profile states:'
- '- PM `thread_id`, `run_id`, `parent_run_id`, and `child_run_id` remain canonical PM lineage fields.'
- '- OpenCode''s provider-entry mapping participates in PM''s provider-first and transport-aware `/transport` model, which distinguishes `cli-bridged`, `direct-provider`, and `server-bridged` lanes; OpenCode itself remains `server-bridged`, and the `/backend` effective-state owner remains the OpenCode ru'
owner_hints:
- Plans/Provider_OpenCode.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

