# Shard 011: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/MCP_Integration.md`

Source lines: L244-L1980

Source SHA256: `c781b2f9be022f5a88d695bc90721ba64c422065e13b0e42b5e7832ce3b83e41`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host MCP projection obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### MI-031 - MCP Containerized Host Runtime Context Projection

```yaml
plan_unit_id: MI-031
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  MCP integration may project containerized-host runtime context to tools and bridged providers as capability context,
  degraded-state context, or setup/preflight context, but MCP records do not become host identity truth or host mutation
  authority. MCP-facing records reference host_capability_ref, host_profile_id, runtime_family, requested/effective
  capability state, permission_snapshot_id, blocked_reason_code, and redaction profile when a tool or provider needs to
  understand a non-default, remote, or containerized environment. Concrete Docker, Kubernetes, registry, SSH, or runtime
  operations still route through Tools, Executor, Permissions, FileSafe, and HostCapabilityCommand envelopes.
gui_related: false
gui_classification_reason: MCP context projection is integration metadata and policy behavior, not GUI presentation.
depends_on: [CV-303, CV-304, T-166, PS-126, F2-194]
unblocks: [CBP-023]
acceptance_criteria:
  - MCP projections can carry host_capability_ref, host_profile_id, runtime_family, capability_state, and blocked_reason_code without serializing raw secrets.
  - MCP availability and projected config do not authorize host execution, container exec, Docker socket access, SSH mutation, Kubernetes apply, or cleanup.
  - Provider/model/account identity remains separate from Docker, Kubernetes, registry, SSH, or host runtime identity.
  - Blocked, degraded, stale, unavailable, and unsupported host states remain visible to consuming tools instead of being silently normalized away.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future MCP host-context projection fixture
risk_class: mcp_host_authority_drift
reasoning_tier: standard
context_scope: containerized_host_mcp_projection
implementation_surfaces:
  - Plans/MCP_Integration.md
  - future MCP tool registry and provider bridge context payloads
node_compile_hint:
  mode: mcp_host_context_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0025
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#core_contracts
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-005-host-capability-command
source_atom_ids: [atom-0025, atom-0040, atom-0044, atom-0047, atom-0081]
preserved_exact_tokens:
  - "tools/MCP"
  - "host_capability_ref"
  - "host_profile_id"
  - "provider bridges"
  - "non-default, remote, or /containerized environments"
negative_constraints:
  - Do not let MCP records become host identity truth.
  - Do not let provider/model/account identity carry Docker, Kubernetes, registry, SSH, or runtime identity.
  - Do not serialize raw secrets, decrypted env values, registry credentials, or SSH material in MCP host context.
owner_hints:
  - Plans/MCP_Integration.md
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Permissions_System.md
```

### MI-003 - Underscore Only MCP Tool Identity

```yaml
plan_unit_id: MI-003
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Canonical MCP tool identity uses underscore form {server_slug}_{tool_name}; slash-form or dual underscore/slash naming canon is retired outside this owner contract, and stored plus permission-facing contracts remain underscore-only.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-003 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: underscore_only_mcp_tool_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0002
preserved_exact_tokens:
- Canonical naming
- /retire
- '{server_slug}_{tool_name}'
- underscore-only
- stored and permission-facing contracts
- Slash-form or dual-format `_` / `/` naming canon is retired
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
negative_constraints:
- Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract.
compatibility_only_notes: []
stale_retired_dispositions:
- Slash-form or dual-format naming residue is retired outside MCP_Integration.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-004 - Friendly Label Join Back Boundary

```yaml
plan_unit_id: MI-004
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Consumer surfaces may display friendly MCP tool labels, but they must join back to the canonical {server_slug}_{tool_name} identity and must not preserve append-only packet or stale consumer wording beside the live owner sections.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-004 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: friendly_label_join_back_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0002
preserved_exact_tokens:
- consumer surfaces may display friendly labels
- must join back to `{server_slug}_{tool_name}`
- Regeneration must repair or replace those sections in place
- must not keep an append-only file-creation packet
- Credential lifecycle still surfaces
negative_constraints:
- Regeneration must not keep an append-only file-creation packet beside the live owner sections.
compatibility_only_notes: []
stale_retired_dispositions:
- Append-only packet and stale consumer wording are retired.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-005 - Requested Effective Availability Enums

```yaml
plan_unit_id: MI-005
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Requested and effective MCP availability remain distinct with requested states authenticated, expired, and not_authenticated and effective states connected, disabled, needs_auth, needs_client_registration, and failed.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-005 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: requested_effective_availability_enums
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0003
preserved_exact_tokens:
- requested and effective MCP availability
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- auth-state tokens
- effective-state tokens
- enabled flag
- auth state
- server health
- project context
- policy/permission state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-006 - Effective State Disclosure Boundary

```yaml
plan_unit_id: MI-006
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The traceability label /effective-state maps to the requested-versus-effective owner section across runtime and GUI surfaces, and consumer-style paraphrases must not replace stored enum values.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-006 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: effective_state_disclosure_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0003
preserved_exact_tokens:
- requested vs effective MCP availability
- runtime and GUI surfaces
- Traceability label `/effective-state`
- consumer-style paraphrases must not replace the stored enum values
- requested availability
- effective availability
negative_constraints:
- Consumer-style paraphrases must not replace the stored enum values.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-007 - Credential Binding And Invalidation

```yaml
plan_unit_id: MI-007
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP credential binding persists tokens securely, binds stored credentials to the effective remote server URL, invalidates credentials when the configured URL changes, surfaces the four auth lifecycle outcomes, and maps /invalidation plus obl-065 to this owner obligation.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-007 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: credential_binding_and_invalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0004
preserved_exact_tokens:
- credential binding
- invalidation
- persist tokens securely
- effective remote server URL
- configured URL changes
- previously stored credentials become invalid
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
- /invalidation
- obl-065
negative_constraints:
- Changing the configured URL invalidates previously stored credentials for that server binding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
```

### MI-008 - MCP Owner Consumer Boundaries

```yaml
plan_unit_id: MI-008
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP_Integration defines how Tools, storage-plan, Permissions_System, newtools, interview integration, Prompt_Pipeline, route/event consumers, and provider/account surfaces consume MCP naming, availability, auth, effective-resolution, subject, and trust vocabulary without redefining it.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-008 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_owner_consumer_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0005
preserved_exact_tokens:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/newtools.md
- GUI summary surfaces
- Plans/interview-subagent-integration.md
- Prompt_Pipeline.md
- TierContext
- canonical `/subject` vocabulary
- blocked-action aliases
negative_constraints:
- MCP integration must not duplicate a thinner subset of Prompt_Pipeline effective-resolution fields directly on TierContext.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-009 - Read Only Debug APM Bridge Trust

```yaml
plan_unit_id: MI-009
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Observability-first MCP bridges for Debug Mode expose read-only APM logs and metrics connectors for production-like failures while keeping that trust model distinct from local probes and without granting mutation authority.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-009 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: read_only_debug_apm_bridge_trust
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0005
preserved_exact_tokens:
- Observability-first MCP bridges
- Debug Mode
- read-only APM `/logs/metrics` connectors
- production-like failures
- data-plane trust model
- distinct from local probes
- does not grant mutation authority
negative_constraints:
- Read-only APM/logs/metrics MCP bridges do not grant mutation authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-010 - Thread Level Provider Account Surfacing

```yaml
plan_unit_id: MI-010
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Thread-level MCP surfacing exposes switch, concern trust, and trust state paths in provider/account views so account visibility, persona naming, stage-to-role mapping, and effective provider context remain visible outside Orchestrator pages.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-010 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: thread_level_provider_account_surfacing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0005
preserved_exact_tokens:
- thread-level MCP surfacing
- switch
- /concern/trust
- trust state paths
- provider/account views
- MCP account visibility
- canonical persona naming
- stage-to-role mapping
- current role vocabulary
- provider context is effective
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-011 - MCP Config Fields

```yaml
plan_unit_id: MI-011
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Canonical MCP server config includes server_id, enabled, timeout_ms, local launch fields, runtime handoff working_directory, remote launch fields, auth binding fields, per-tool enablement independent of connection state, and the /disable trace label for enablement handling.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-011 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_config_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Server config schema
- implementation-facing canon
- server_id
- enabled
- timeout_ms
- command
- args[]
- env?
- working_directory?
- host_id
- remote_command
- remote_args[]
- remote_env?
- OAuth-disabled / auth-state semantics
- per-tool enable/disable entries
- /disable
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-012 - Schema Adapter Compatibility

```yaml
plan_unit_id: MI-012
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP schema handling tracks visited $ref values, breaks recursive cycles with {}, logs warnings, enforces maximum depth 32 and 64 KiB size cap, and preserves provider adapter compatibility facts such as Gemini anyOf-to-oneOf rewrites and unsupported const/contentEncoding handling.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-012 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: schema_adapter_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Schema isolation
- OAuth state
- visited `$ref` values
- substituting `{}`
- logging a warning
- maximum depth of 32
- 64 KiB
- anyOf
- oneOf
- const
- contentEncoding
- Provider schema adapters
- Gemini rewrites
negative_constraints:
- Schemas larger than 64 KiB after resolution are rejected.
compatibility_only_notes:
- Provider schema adapters preserve compatibility facts needed by downstream tool validators.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-013 - OAuth State Listener And Token Sharing

```yaml
plan_unit_id: MI-013
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP OAuth state is keyed by provider, scope, and client semantics; tokens live in the shared credential store, token sharing uses provider+scope, refresh uses compare-and-swap, and PM owns the shared local HTTP listener callback model with explicit bind-address evidence for non-default remote or containerized environments.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-013 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: oauth_state_listener_and_token_sharing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- MCP OAuth state
- provider/scope/client semantics
- shared credential store
- provider+scope
- compare-and-swap
- shared local HTTP listener callback model
- GitHub_API_Auth_and_Flows.md
- bind-address selection
- non-default, remote, or `/containerized` environments
- callback path
- client id
- provider scope
- auth-state evidence
negative_constraints:
- OAuth state is not keyed only by MCP server identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-014 - Portable Entries No Secrets Adapters

```yaml
plan_unit_id: MI-014
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Server-entry config preserves local and remote portable launch shapes, supports OAuth-disabled header-only servers and dynamic client registration, and keeps generated provider adapter config derived and no-secrets by resolving secrets through secret references or auth bindings.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-014 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: portable_entries_no_secrets_adapters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- portable launch shape
- 'type: "local"'
- 'command: string[]'
- 'type: "remote"'
- url
- headers?
- 'oauth?: object | false'
- /header-only
- dynamic client registration
- pre-registered client credentials
- Generated adapter config
- derived/no-secrets
- /no-secrets
- secret references
- auth bindings
negative_constraints:
- Provider-facing adapter files are generated and must not serialize secrets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-015 - Config Override Debug Surface

```yaml
plan_unit_id: MI-015
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The /config/override/debug surface is read-only and shows final effective MCP config, override provenance, auth/client-registration state, and provider projection sync without mutating config, serializing secrets, or bypassing policy.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-015 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: config_override_debug_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- /config/override/debug
- read-only debug surface
- final effective MCP config
- override-layer provenance
- auth/client-registration state
- provider projection sync
- redacted derived values
- does not mutate config
- serialize secrets
- bypass policy
negative_constraints:
- /config/override/debug does not mutate config, serialize secrets, or bypass policy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-016 - Canonical MCP Records And Enums

```yaml
plan_unit_id: MI-016
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Canonical MCP data records are mcp_server_record, mcp_runtime_availability, and mcp_tool_record with exact fields and enum values for transport_kind, scope, ownership, availability_state, and config_sync_state.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-016 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: canonical_mcp_records_and_enums
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- mcp_server_record
- server_id
- label
- description
- transport_kind
- endpoint_or_command
- scope
- ownership
- secret_ref?
- last_health_check_at?
- last_error?
- stdio | sse | http
- global | project | profile | external
- pm_managed | external_managed
- mcp_runtime_availability
- availability_state
- working | not_configured | needs_auth | untrusted_folder | unhealthy | unsupported | external_not_managed
- config_sync_state
- not_needed | in_sync | out_of_sync | sync_failed
- mcp_tool_record
- tool_ref
- permission_scope
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-017 - GUI Lifecycle Label Derivation

```yaml
plan_unit_id: MI-017
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: GUI lifecycle labels derive from canonical availability states without creating a second enum, including Working, Not Configured, Needs Auth, Untrusted Folder, Unhealthy, Install Failed, Unsupported, and External / Not Managed.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-017 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: gui_lifecycle_label_derivation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- GUI lifecycle labels
- canonical availability states
- without creating a second enum
- Working
- Not Configured
- Needs Auth
- Untrusted Folder
- Unhealthy
- Install Failed
- Unsupported
- External / Not Managed
- Install Failed
- unhealthy
- install failure reason code
negative_constraints:
- GUI lifecycle labels must not create a second stored availability enum.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-018 - MCP Resilience Cache And Eviction

```yaml
plan_unit_id: MI-018
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP resilience uses lazy-load startup, pre-validation before tool dispatch or adapter handoff, cached tool lists as degraded fallback evidence, retries transient failures before eviction, stable OAuth state across reconnects, and refresh triggers from config change, user action, and periodic TTL.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-018 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_resilience_cache_and_eviction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- MCP resilience
- lazy-load startup
- pre-validation
- MCP tool dispatch
- provider adapter handoff
- cached tool lists
- degraded fallback evidence
- retries transient startup/health failures before eviction
- stable OAuth state
- reconnects
- Tool-list cache refresh
- config change
- explicit user action
- periodic TTL
- retry policy
- TTL/refresh evidence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-019 - Managed Session Pooling

```yaml
plan_unit_id: MI-019
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP connection pooling is the default for managed server sessions; PM must not use subprocess-per-call for MCP servers except disposable diagnostic probes, and long-lived sessions own lifecycle identity, refresh, health, and teardown state through MCP records.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-019 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: managed_session_pooling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- MCP connection pooling
- default for managed server sessions
- MUST NOT use a subprocess-per-call model
- explicitly disposable diagnostic probes
- long-lived MCP sessions
- lifecycle identity
- refresh
- health
- teardown state
- mcp_server_record
- mcp_runtime_availability
- OC-EXEC-107
- OC-PROV-006
negative_constraints:
- PM MUST NOT use a subprocess-per-call model for MCP servers except explicitly disposable diagnostic probes.
compatibility_only_notes:
- OC-EXEC-107 and OC-PROV-006 are evidence labels, not separate canonical schemas.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-020 - Central Registry Lifecycle Projection

```yaml
plan_unit_id: MI-020
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: PM MCP architecture is host-managed at the central registry, health, permissions, and secrets layer, with provider-side adapter state as projection or bridge surface and a three-level lifecycle of Registered in PM, Configured for provider/runtime, and Operational.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-020 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: central_registry_lifecycle_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- host-managed
- central registry
- health
- permissions
- secrets layer
- /server
- provider-side adapter state
- projection/bridge surface
- Registered in PM
- Configured for provider/runtime
- Operational
- central MCP registry
- provider config as the MCP source of truth
- /per-runtime
- execution surface
negative_constraints:
- Provider-side config is not the MCP source of truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-021 - CLI Provider Profile State

```yaml
plan_unit_id: MI-021
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: CLI provider MCP state remains provider/profile-local for active Claude Code and Cursor CLI surfaces, with profile isolation, structured usage evidence, setup-state models, and PM-managed roots preserving account/root isolation. Gemini CLI MCP/home facts are retired/source-lineage only.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-021 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: cli_provider_profile_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Claude Code CLI
- CLI-provider surface
- profile isolation
- MCP support
- structured usage evidence
- setup-state model
- Gemini CLI remains the heaviest managed home
- .gemini
- profile-local runtime state
- Cursor CLI MCP support
- cursor-agent
- PM-owned home `/XDG` roots
- account/root isolation contract
negative_constraints: []
compatibility_only_notes:
- Gemini CLI MCP/home facts are retained only as source-lineage.
stale_retired_dispositions:
- Active Gemini CLI MCP provider-home management is retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-022 - Retired Gemini CLI MCP Config Commands

```yaml
plan_unit_id: MI-022
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Gemini CLI MCP config and command vocabulary is retired/source-lineage only. PM must not implement Gemini CLI MCP config generation or `gemini mcp add` management as an active provider path; current MCP projection must be proven per active provider/runtime.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-022 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: retired_gemini_cli_mcp_config_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- geminicli.com/docs/tools/mcp-server/
- mcpServers
- settings.json
- ~/.gemini/settings.json
- /.gemini/settings.json
- gemini/settings.json
- gemini mcp add
- --scope user|project
- project -> global -> nested
- --transport stdio|sse|http
- --env
- --header
- --timeout
- --trust
- --include-tools
- --exclude-tools
- list-tools
- ~/.gemini/mcp-server-enablement.json
- /.gemini/mcp-server-enablement.json
- /redaction
negative_constraints:
- Env and header diagnostics must preserve redaction semantics.
- Do not generate active Gemini CLI MCP config.
- Do not run `gemini mcp add` as active PM setup.
compatibility_only_notes:
- Gemini CLI MCP paths and commands are preserved only for source-lineage.
stale_retired_dispositions:
- Gemini CLI MCP config commands are retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-023 - Cursor CLI MCP Evidence Adapter

```yaml
plan_unit_id: MI-023
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Cursor CLI provider-native MCP inspection uses cursor-agent output as availability evidence while central MCP records stay authoritative; PM may generate or refresh .cursor/mcp.json or cursor/mcp.json only when workspace-local MCP visibility is required.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-023 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: cursor_cli_mcp_evidence_adapter
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Cursor CLI provider-native MCP inspection
- cursor-agent mcp list
- central MCP records as authoritative
- .cursor/mcp.json
- cursor/mcp.json
- workspace-local MCP visibility
- derived from central records
- not the MCP source of truth
- /stream-json
- auth status
- MCP management
- model listing
- about `/version` probing
negative_constraints:
- Cursor workspace adapter config is derived and is not the MCP source of truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-024 - DirectApi CLI Bridge Sync

```yaml
plan_unit_id: MI-024
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: DirectApi providers use PM-native MCP only, while CLI-provider bridge state is long-lived provider/profile configuration mapped into project-shared or profile-local MCP records; PM may configure, update, repair, or spawn-time regenerate derived provider files only where workspace visibility requires it.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-024 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: directapi_cli_bridge_sync
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- DirectApi providers
- Gemini
- Codex
- GitHub Copilot
- Alibaba Coding Plan
- MiniMax Coding Plan
- Z.AI Coding Plan
- PM-native MCP only
- provider-side MCP config files
- CLI-provider bridge state
- long-lived provider/profile configuration
- project-shared versus profile-local MCP records
- per-run files
- /workspace
- /configure
- /update
- /repair
- spawn-time regeneration
negative_constraints:
- No provider-side MCP config files are canonical for DirectApi rows.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-025 - Supported Owner Level Flows

```yaml
plan_unit_id: MI-025
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP owner-level flows are exactly auth, list/status, logout, and debug, with auth resolving missing or expired auth, list/status surfacing availability and failures, logout revoking auth binding without deleting server definition, and debug surfacing diagnostics without minting a second status vocabulary.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-025 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: supported_owner_level_flows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0007
preserved_exact_tokens:
- Supported flows
- auth
- list/status
- logout
- debug
- resolves missing or expired auth
- without redefining tool permissions
- requested/effective availability
- last-failure disclosure
- revokes the effective auth binding
- without deleting the server definition
- connection, handshake, and tool-registration diagnostics
- without minting a second status vocabulary
negative_constraints:
- Debug must not mint a second status vocabulary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/newtools.md'
```

### MI-026 - GUI Enum Reuse

```yaml
plan_unit_id: MI-026
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: GUI-facing MCP owner contract reuses auth-state and effective-availability enums for effective tool availability and GUI surfacing, and GUI summary surfaces reference the MCP SSOT instead of re-owning connection-state vocabulary.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-026 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: gui_enum_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Effective tool availability and GUI surfacing
- auth-state
- effective-availability enums
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- GUI summary surfaces
- MCP SSOT
- connection-state vocabulary
negative_constraints:
- GUI summary surfaces must not re-own connection-state vocabulary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-027 - Transport Class GUI Labels

```yaml
plan_unit_id: MI-027
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Transport-class GUI status labels distinguish DirectApi PM Native/Directly Available, CliBridge Bridged/Configured for Provider, and ServerBridge PM Managed Server versus Attached External Server without treating provider-side installation or projected config as hand-managed source truth.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-027 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: transport_class_gui_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Transport-class GUI status labels
- DirectApi
- PM Native
- Directly Available
- Installed on provider
- CliBridge
- Bridged
- Configured for Provider
- ServerBridge
- PM Managed Server
- Attached External Server
- /reflect
negative_constraints:
- DirectApi providers have no provider-side MCP installation concept.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-028 - MCP Configuration GUI Rows Inspectors Actions

```yaml
plan_unit_id: MI-028
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The MCP Configuration GUI lists known servers once with user-facing status, remediation, ownership hint, and primary action, while expanded inspectors show runtime availability, auth, tools, logs, sync state, and actions with pending and terminal labels.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-028 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_configuration_gui_rows_inspectors_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- MCP Configuration GUI
- known servers once
- /status/reason
- Working
- concrete error/status/reason
- mcp_server_record
- one row/card per configured server
- one-line remediation text
- scope `/ownership` hint
- PM managed
- project only
- external
- primary action
- expanded inspector
- settings `/inspectors`
- mcp_runtime_availability
- /auth
- /runtime
- last successful health check
- logs or last error text
- /synced
- Install
- Configure
- Set up
- Repair
- Reconnect
- Disable
- Remove
- View logs
- Installing...
- Configuring...
- Installed
- Configured
- /success/failure
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-029 - MCP Readiness First Run Copy

```yaml
plan_unit_id: MI-029
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Skill and tool readiness checks evaluate effective MCP lifecycle stage and surface Missing Requirement or degraded readiness in GUI, while first-run provider readiness copy distinguishes credentials, trust, and MCP setup.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-029 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_readiness_first_run_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Skill and tool readiness checks
- effective MCP lifecycle stage
- /unhealthy
- unavailable
- missing
- Missing Requirement
- degraded readiness
- GUI
- First-run provider readiness copy
- Credentials ready
- Workspace trust required
- MCP configuration pending
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-030 - MCP Account Profile Isolation

```yaml
plan_unit_id: MI-030
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Account and profile isolation applies to MCP bridges, keeping provider-native auth_state, workspace_trust, project history, approvals, runtime caches, and OAuth residue profile-local unless a PM-managed overlay explicitly projects a safe shared definition.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-030 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_account_profile_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Account/profile isolation
- provider-native state
- auth_state
- workspace_trust
- project history
- mcp approvals
- runtime caches
- MCP OAuth residue
- profile-local
- PM-managed overlay
- safe shared definition
negative_constraints:
- Provider-native MCP state remains profile-local unless a PM-managed overlay explicitly projects a safe shared definition.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-001 - MCP Integration Retired Source-Preserving Bridge

```yaml
plan_unit_id: MI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The former MCP_Integration source-preserving bridge is retired after Phase 2B atomized MCP_Integration-S0001 through S0008 into MI-002 through MI-030 and structurally dispositioned S0009, S0010, and S0012. MI-001 remains only as migration lineage for MCP_Integration-S0011 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained MCP Integration PlanUnits MI-002 through MI-030.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- MI-001 no longer uses source_preserving_planunit compile mode.
- MI-002 through MI-030 own product coverage for atomized MCP_Integration spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by MI-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0011
preserved_exact_tokens:
- MI-001
- MCP_Integration-S0011
- source_preserving_planunit
- source_preserving_bridge_retired
- MCP Integration
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- MI-001 must not re-own MCP_Integration product coverage.
- MI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- MI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former MI-001 source-preserving bridge is retired by Phase 2B batch 087.
owner_boundary_notes:
- MI-002 through MI-030 own atomized MCP_Integration product coverage.
- MCP_Integration-S0011 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/MCP_Integration.md
```
