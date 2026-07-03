# Shard 006: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Contracts_V0.md`

Source lines: L907-L1049

Source SHA256: `0eaafb76ad2c020549f2b0338605377c5a1ddab901b1d3aa3167c39c88382a01`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical shared contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### CV-292 - Provider Route Support Evidence Envelope

```yaml
plan_unit_id: CV-292
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Every provider/model/media route support claim must carry a provider route support evidence envelope with provider_entry_id, provider_family_id, transport_kind, account_profile_ref, credential_profile_kind, model_id, requested_model_id, effective_model_id, requested_effort, effective_effort, support_state, verification_state, proof_kind, proof_timestamp, source_lineage, blocked_reason, and capability gates. Green/implementation-ready support requires local end-to-end prompt output or an explicitly scoped generated-media proof, not catalog visibility, HTTP 200 model listing, or OpenCode-routed proxy behavior alone. Antigravity evidence envelopes must distinguish public `agy` catalog rows from the capability-gated OAuth/internal `gemini-3.1-flash-image` generated-image proof; public `agy` catalog presence alone keeps generated-media output false for that row until row-specific artifact proof exists.
gui_related: false
gui_classification_reason: Shared backend/provider evidence contract rather than visual presentation.
depends_on: [CV-094, MS-113]
unblocks: [MS-114, MGAC-095, F3-400, UF-074]
acceptance_criteria:
  - Support claims distinguish catalog-visible, local-prompt-verified, generated-media-verified, source-lineage-only, unsupported, disabled, capability-gated, and retired/source-lineage states.
  - Proof records do not contain secrets, OAuth URLs, API keys, account identifiers, or local machine state.
  - Direct-provider closure excludes OpenCode-server-routed provider results unless the support target is the OpenCode server route itself.
  - Provider support evidence records preserve requested/effective provider, model, effort, account, and route identity.
  - Antigravity support evidence separates public `agy` CLI rows, private/internal generated-media proof, Gemini Direct API, and retired Gemini CLI lineage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_support_overclaim
reasoning_tier: high
context_scope: provider_support_evidence
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Models_System.md, Plans/Media_Generation_and_Capabilities.md, Plans/usage-feature.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_route_support_evidence_envelope, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0050
  - pldg-20260624-001-provider-updates:atom-0055
  - pldg-20260624-001-provider-updates:atom-0111
  - pldg-20260624-001-provider-updates:atom-0125
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0050, atom-0051, atom-0053, atom-0054, atom-0055, atom-0059, atom-0060, atom-0077, atom-0091, atom-0092, atom-0093, atom-0094, atom-0100, atom-0101, atom-0102, atom-0104, atom-0109, atom-0111, atom-0124, atom-0125, atom-0129, atom-0132, atom-0135, atom-0138, atom-0140, atom-0142, atom-0143]
preserved_exact_tokens: ["no-uncertainty", "local E2E", "output-level success", "catalog presence", "OpenCode server", "OpenCode-routed providers", "verified", "unverified", "capability-gated", "disabled", "source-lineage", "not implementation-ready", "agy models", "gemini-3.1-flash-image", "v1internal:generateContent", "responseModalities: [\"IMAGE\"]", "1024x1024", "image/jpeg"]
negative_constraints:
  - Do not clear a provider on catalog visibility or HTTP 200 model listing alone.
  - Do not store API keys, OAuth URLs, account identifiers, or local secrets in Plans, ledgers, logs, artifacts, or evidence envelopes.
  - Do not use OpenCode server or OpenCode-routed providers as direct-provider closure evidence.
  - Do not collapse public `agy` CLI catalog rows and unofficial/private Antigravity OAuth/internal image-generation rows into one proof state.
owner_hints: [Plans/Contracts_V0.md, Plans/Models_System.md, Plans/usage-feature.md, Plans/Media_Generation_and_Capabilities.md]
```

### CV-293 - Requested Effective Provider Identity And Effort Contract

```yaml
plan_unit_id: CV-293
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider execution envelopes must preserve requested and effective identity for provider, account/profile, model, auth surface, transport, effort level, media route, and tool/capability scope. Requested thinking effort is a user intent that may be honored, skipped, clamped, unsupported, partially supported, or mapped to a provider-specific wire value; the effective result and any fallback or clamp reason must remain queryable by GUI, usage, runtime artifacts, and audit consumers.
gui_related: false
gui_classification_reason: Runtime/request contract; GUI displays it but does not own the schema.
depends_on: [MS-115, CV-292]
unblocks: [ACD-424, F3-400, UF-074, RAP-032]
acceptance_criteria:
  - Requested provider/model/account/effort/media route and effective provider/model/account/effort/media route are recorded separately.
  - Effort mapping includes honored, skipped, clamped, unsupported, and partially supported outcomes.
  - Fallbacks disclose fallback_used and fallback_reason without hiding provider route identity.
  - Consumers can query the same envelope without creating feature-local identity schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: requested_effective_identity_drift
reasoning_tier: high
context_scope: requested_effective_provider_identity
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Prompt_Pipeline.md, Plans/Multi-Account.md, Plans/Models_System.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: requested_effective_provider_identity_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0052
  - pldg-20260624-001-provider-updates:atom-0119
  - pldg-20260624-001-provider-updates:atom-0139
source_atom_ids: [atom-0017, atom-0018, atom-0052, atom-0117, atom-0118, atom-0119, atom-0122, atom-0129, atom-0131, atom-0132, atom-0139, atom-0140]
preserved_exact_tokens: ["requested_account", "effective_account", "requested provider/model/effort", "effective provider/model/effort", "fallback_used", "reasoning_effort", "thinking", "honored", "skipped", "clamped", "unsupported", "partially supported"]
negative_constraints:
  - Do not infer effective provider identity from model name alone.
  - Do not silently drop unsupported thinking effort requests.
  - Do not let GUI, usage, or artifact surfaces invent divergent requested/effective schemas.
owner_hints: [Plans/Contracts_V0.md, Plans/Prompt_Pipeline.md, Plans/Multi-Account.md, Plans/Models_System.md]
```

### CV-294 - Caller-Scoped Capability And Provider-Native Artifact Envelope

```yaml
plan_unit_id: CV-294
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider capabilities and provider-native artifacts are caller-scoped. Capability payloads must include enabled_on_instance, usable_now, blocked_reason, caller_scope, execution_role, provider_entry_id, account_profile_ref, model_id, media_route_id, permission_snapshot_id, redaction_profile, verification_state, artifact_refs, and source_confidence where applicable. Provider-native tools and secrets are mediated through PM permission custody; artifacts may reference provider receipts, streamed logs/events, generated media, model catalogs, route/probe evidence, and adoption/drift/blocked/repair states without storing secrets. Antigravity internal generated-image artifacts may reference non-secret route/probe evidence, model id `gemini-3.1-flash-image`, generated artifact refs, dimensions/hash, and support-state caveats, while public `agy` catalog artifacts remain model-capability evidence rather than generated-media receipts.
gui_related: false
gui_classification_reason: Shared capability/artifact schema and permission custody contract rather than visual presentation.
depends_on: [CV-292, CV-293]
unblocks: [RAP-032, RAP-033, T-164, PS-119, POA-050]
acceptance_criteria:
  - Capability availability is caller-scoped and cannot be inferred from global provider enablement alone.
  - Provider-native tool execution and secret custody pass through PM permission contracts.
  - Runtime artifacts preserve provider receipts, generated media refs, logs/events, model catalogs, route/probe evidence, and drift/blocked states by reference.
  - Secret values, OAuth URLs, and local account material are never stored in artifacts.
  - Antigravity generated-image artifact refs preserve internal-route caveats and never store OAuth/session material.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_capability_artifact_drift
reasoning_tier: high
context_scope: caller_scoped_provider_capabilities
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Tools.md, Plans/Permissions_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
node_compile_hint: {mode: caller_scoped_provider_capability_artifact_envelope, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0117
  - pldg-20260624-001-provider-updates:atom-0120
  - pldg-20260624-001-provider-updates:atom-0121
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0049, atom-0116, atom-0117, atom-0118, atom-0120, atom-0121, atom-0122, atom-0130, atom-0131, atom-0133, atom-0136, atom-0137, atom-0138, atom-0142, atom-0143]
preserved_exact_tokens: ["enabled_on_instance", "usable_now", "blocked_reason", "caller_scope", "execution_role", "providerIdentifier: client", "toolName: pm_echo", "permission_snapshot_id", "redaction_profile", "provider-native", "generated media", "route/probe evidence", "gemini-3.1-flash-image", "1024x1024", "image/jpeg", "a60c8987f42ebb678426affb79d55f49f3efe8feebc8c09ba86772bfa91d9f5d"]
negative_constraints:
  - Do not infer `usable_now` from `enabled_on_instance`.
  - Do not bypass PM permission custody for provider-native tools or secrets.
  - Do not store provider secret material in artifact payloads.
  - Do not store OAuth tokens, refresh tokens, account identifiers, local credential paths, full HTTP payload logs, or secrets in provider-native artifact payloads.
owner_hints: [Plans/Contracts_V0.md, Plans/Tools.md, Plans/Permissions_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
```

Rules:
- Writers SHOULD include `run_id` and `thread_id` whenever available, but `EventEnvelopeV1` does not require them.
- Readers MUST tolerate both envelopes; projectors SHOULD upgrade in-memory to `EventRecord` form.

ContractRef: ContractName:Plans/Contracts_V0.md#EventEnvelopeV1, PolicyRule:Decision_Policy.md§2

---

**Payload schema ownership:** `Contracts_V0.md` owns the canonical persisted envelope (`EventRecord`) and cross-cutting auth/event contracts. Concrete persisted event-type payload schemas are registered in `Plans/storage-plan.md` so writers, projectors, analytics, and generated docs share one payload SSOT.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

---
