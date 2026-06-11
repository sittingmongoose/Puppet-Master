# Shard 016: PlanUnits

Source: `Plans/Multi-Account.md`

Source lines: L779-L941

Source SHA256: `c2870a9b8a7b054a162ad885aa75adee8c875452d0bdcbdc65a6211dd159dd75`

---

## PlanUnits

### MA-001 - Multi-Account Specification Source-Preserving PlanUnit

```yaml
plan_unit_id: MA-001
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: Plans/Multi-Account.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Multi-Account.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Multi-Account-S0037
preserved_exact_tokens:
- Multi-Account Specification
- Canonical owner-section requirements
- Requested/effective account identity contract
- Shared conversational/runtime boundary
- 1. Purpose and scope
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md#42-authpolicy, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/FinalGUISpec.md'
- 2. References
- Canonical data-shape reconciliation
- Required data shape
- Shared actor/runtime boundary
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
- '3. Assessment: what we have and gaps (filled)'
- 3.1 Design sources
- '3.2 Per-provider: what we have vs what we need'
- 3.3 Gaps (resolved)
- 3.4 Rewrite alignment
- 3.5 Current Puppet Master context
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
- 4.1 Provider entry (canonical)
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md'
- 4.2 Account record (canonical)
- 'ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/usage-feature.md'
negative_constraints:
- '- **Non-goal:** Same-provider accounts are not treated as an interchangeable bucket. Provider-aware, account-aware, and execution-role-aware policy is required.'
- '- **Settings-spec and GUI coverage:** multi-account support is both a runtime-policy seam and a settings-spec / GUI coverage requirement. `/runtime-side` behavior may exist at the `/concept` level before the settings `/GUI` is complete, but provider account selection, account pool policy, and switch'
- '- **Requested/effective account gap closure:** requested_account and effective_account must not remain under-specified; `/effective` records preserve both requested and effective account truth.'
- 'Current-canon correction for this inventory: sections `3. Assessment` and `3.2/3.3` must not revive stale CLI-centric assumptions for Codex or GitHub Copilot. Codex and GitHub Copilot are direct providers in PM; Cursor account-isolation uses the runnable `cursor-agent` account boundary under PM-owne'
- '`provider_family_id` is additive grouping metadata only and MUST NOT replace the concrete provider entry id.'
- '- **Soft-threshold boundary:** soft-threshold auto-switch behavior must not switch mid-turn; for soft-threshold pressure, PM waits until a turn/attempt boundary unless hard exhaustion, cooldown, unhealthy account, or another hard failover condition requires in-run retry.'
- For authoritative remaining counters, PM drives `threshold_reached` at `<= configured switch threshold` and drives `exhausted` at `0 remaining` or explicit provider exhaustion. Provider `/accounts` may override these defaults, but the scheduler must not leave the state transition undefined when auth
- Default threshold-aware policy uses warning threshold `20% remaining` and default auto-switch threshold `10% remaining` unless provider/account overrides say otherwise. Per-account observed `/provider-reported` effective limits outrank generic provider-doc defaults, while provider docs preserve docu
- PM must not auto-switch purely on one soft `plan-warning`; repeated `plan-pressure` signals can move the account/profile to `approaching_threshold` before stronger refusal or cooldown evidence marks exhaustion.
- '| **Codex** | Direct-provider account rows separated by `ChatGPT` and `API key` auth families | plan-backed included usage vs API-billed usage are separate buckets | PM must not merge plan-backed and API-billed usage/cooldowns |'
- '- PM-owned provider account roots are keyed by `provider_entry_id`. Linux account data uses `$XDG_DATA_HOME/puppet-master/providers/<provider_entry_id>/`; macOS account data uses `~/Library/Application Support/Puppet Master/providers/<provider_entry_id>/`. Windows account data uses `%APPDATA%\\Puppe'
- '- Codex account roots are isolated with `CODEX_HOME`. A fresh `CODEX_HOME` probe that reports `Not logged in` is clean account-sandbox evidence for that home root rather than global Codex state. Upstream Codex runtime artifacts such as `sessions/`, `models_cache`, `models_cache.json`, `logs_1.sqlite'
- '- GitHub Copilot provider accounts have their own auth-realm; switching GitHub Copilot accounts for provider multi-account must not change Git transport, local Git/worktree state, git remotes, worktree ownership, repository transport state, or GitHub API account binding. Those are independent surfac'
- '- Across all CLI-backed providers, `auth_state`, `history`, `mcp_oauth_tokens`, `extensions runtime state`, `project registry`, `temp chats`, `workspace_trust`, `runtime_cache`, `cooldown_residue`, and `telemetry_state` are denied from sharing by default. PM-managed overlays may be projected separat'
- 'The anti-duplication rule from the older one-card direction is preserved as a no-`pseudo-providers` rule: the GUI may group related Gemini rows under a family surface, but it MUST NOT mint fake OAuth/API-key pseudo-providers that compete with the real `gemini` and `gemini_cli` provider entries. With'
- '- provider-level `Enable/Disable Provider` changes future eligibility only and must not destroy account/profile rows or saved defaults.'
- '- Provider-specific entitlement or `/billing` resolution can keep an account in `Needs setup` after auth succeeds; PM must not collapse that state into `Ready`, `partial-setup`, or `Logging Out`.'
- '- Codex add-account entry choices are `Sign in with ChatGPT` and `Use API Key`; setup copy must not revive the stale browser/device-code/API-key matrix as the primary Codex account model. The ChatGPT path helper text is `Uses Codex through your ChatGPT plan limits`; Codex account identity is auth-fa'
- '- disabling an account/profile MUST NOT delete its root.'
- '`Plans/usage-feature.md` (`/usage-feature.md`) consumes this account/provider owner contract for its `Cursor`, `Codex`, `Copilot`, `Gemini`, and summary-table sections; those Usage sections must not reintroduce stale provider buckets or flatten direct-provider quota context into one generic `account'
- '- launch-time drift rule: `Provider Modified` must not auto-overwrite at launch; PM warns and requires explicit repair or manual override before claiming the target is in sync.'
- '- `Import Existing Auth` copies or seeds only the minimum auth-bearing material needed into the PM-owned root; it must not wholesale clone unrelated provider history, caches, logs, projections, or backups by default.'
- '- Such confirmations MUST NOT change the locked defaults, precedence order, requested/effective field names, or the rule that media follows the same Gemini auth/account model as normal provider usage.'
- '- operational identity state may be displayed alongside provider/account state, but it must not be implied to share the same ownership or token source unless the owning auth contract says so'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- Each provider entry MUST also declare the allowed `auth_surface` values its runtime accepts so PM can validate account compatibility before scheduling and so the HTTP/client layer knows how credentials must be attached or delegated.
- For authoritative remaining counters, PM drives `threshold_reached` at `<= configured switch threshold` and drives `exhausted` at `0 remaining` or explicit provider exhaustion. Provider `/accounts` may override these defaults, but the scheduler must not leave the state transition undefined when auth
- '- Official/current Cursor docs direction treats Project Rules (`.cursor/rules/*.mdc`) as the primary/native rules path, so Cursor docs/rules projection generates `.cursor/rules/*.mdc` first; `Cursor Rules` is the user-facing label, while `.cursorrules` remains supported but legacy/deprecated and roo'
- '- Row-level setup actions use an explicit button-state contract: `Sign In` -> `Signing In...`, `Save Key` -> `Saving...`, `Import` -> `Importing...`, `Validate` -> `Validating...`, `Refresh Usage` -> `Refreshing...`, and `Log Out` -> `Logging Out...`; this applies equally to direct-provider actions '
stale_retired_dispositions:
- 'Current-canon correction for this inventory: sections `3. Assessment` and `3.2/3.3` must not revive stale CLI-centric assumptions for Codex or GitHub Copilot. Codex and GitHub Copilot are direct providers in PM; Cursor account-isolation uses the runnable `cursor-agent` account boundary under PM-owne'
- '- `query_param` for API key in query string; this path is deprecated and PM should warn before use'
- '- Official/current Cursor docs direction treats Project Rules (`.cursor/rules/*.mdc`) as the primary/native rules path, so Cursor docs/rules projection generates `.cursor/rules/*.mdc` first; `Cursor Rules` is the user-facing label, while `.cursorrules` remains supported but legacy/deprecated and roo'
- '- Codex add-account entry choices are `Sign in with ChatGPT` and `Use API Key`; setup copy must not revive the stale browser/device-code/API-key matrix as the primary Codex account model. The ChatGPT path helper text is `Uses Codex through your ChatGPT plan limits`; Codex account identity is auth-fa'
- '- source-confidence, stale, or estimated labels when data is not authoritative'
- '`Plans/usage-feature.md` (`/usage-feature.md`) consumes this account/provider owner contract for its `Cursor`, `Codex`, `Copilot`, `Gemini`, and summary-table sections; those Usage sections must not reintroduce stale provider buckets or flatten direct-provider quota context into one generic `account'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Shared conversational/runtime boundary'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- **Rewrite alignment:** Account selection and env/config wiring are part of the Provider contract. State lives in seglog + redb; secrets remain outside canonical storage. GUI requirements remain UX-only with no Iced/Slint lock-in inside this document.'
- '- **Cross-owner recovery references:** `Plans/Executor_Protocol.md#5. Node execution fields`, `Plans/orchestrator-subagent-integration.md#Tier-Level Subagent Strategy`, `Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)`, and `Plans/UI_Command_Catalog.md#Canonical Runtime Re'
- '- **Shared runtime boundary:** shared-runtime account behavior consumed by CLI_Bridged_Providers, CLI_Bridged_Providers.md, and multi-account records does not make the CLI bridge the account owner.'
- '## Canonical data-shape reconciliation'
- This section owns the canonical requested/effective account identity contract for all provider-using actors.
- '- Retire `provider_account_id` from canonical account-identity naming; keep it only as provider-native metadata that shadows the effective provider handle.'
- '- `requested_account_binding` remains the canonical selector for `none`, `preferred`, or `required` fallback behavior.'
- '#### Shared actor/runtime boundary'
- 'Current-canon correction for this inventory: sections `3. Assessment` and `3.2/3.3` must not revive stale CLI-centric assumptions for Codex or GitHub Copilot. Codex and GitHub Copilot are direct providers in PM; Cursor account-isolation uses the runnable `cursor-agent` account boundary under PM-owne'
- '### 4.1 Provider entry (canonical)'
- '### 4.2 Account record (canonical)'
- '- `auth_surface` = `oauth | api_key` or the provider-specific canonical auth surface'
- '- the canonical account-registration shape is `{ account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }`; additive runtime/health fields may extend this shape without replacing the canonical keys.'
- 'ContractRef: Plans/Contracts_V0.md#4. Auth contracts, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules), Plans/GitHub_API_Auth_and_Flows.md#Credential store keying (canonical), Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/assistant-chat-design.md#Canonical'
- The canonical `account-profile` row schema includes `account_id`, `label`, `auth_surface`, `enabled`, `priority`, `threshold_override`, `switch_mode_override`, `cooldown_policy`, `retry_budget`, `quota_profile_ref`, `allowed_roles`, `disallowed_roles`, `configured_project_id`, `display_identity`, an
- Provider-registry-only discovery timestamps and `/status` caches stay in provider-registry internals, not canonical run snapshots. Per-account shared-overlay advanced knobs may influence candidate preparation, but they remain provider-registry state unless copied into requested/effective runtime evi
- 'Canonical terms and values:'
- '- the canonical account-registration shape is { account_id: ulid, provider_id, display_name, auth_method, credential_ref, created_at, last_used_at, status }'
- '- **Switch boundary:** Switching happens only at attempt/message boundaries. Never switch mid-attempt.'
owner_hints:
- Plans/Multi-Account.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

