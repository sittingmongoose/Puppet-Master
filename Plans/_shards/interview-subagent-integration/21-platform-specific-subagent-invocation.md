## Platform-Specific Subagent Invocation

Normative rule: Interview resolves an **effective Persona** first, then invokes the Provider facade / platform runner using the canonical requested/effective resolution record. Provider-native prompt syntax, exported agent files, or platform-specific delegation syntax are implementation details behind that facade and are **not** the canonical Interview runtime contract.

The Interview runtime MUST NOT require provider-native agent files or provider-native `/subagent` / `/agent` prompt syntax in order to execute.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/orchestrator-subagent-integration.md

### Interview Persona config contract

Interview Persona configuration is stage-driven and normalized to PM Persona terminology.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Canonical persisted fields:
- `mode`
- `stage_persona_overrides`
- `phase_primary_personas`
- `phase_secondary_personas`
- optional per-stage model/runtime overrides
- optional next-run explicit override

Rules:
- legacy `phase_subagents` names remain migration aliases only.
- validation and persistence must normalize aliases to canonical Persona IDs.
- delegated launch validation still goes through `subagent_registry`.
- stage-level Persona resolution goes through `persona_registry`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md
### Requested/effective Interview contract

Inputs:
- `requested_persona` (canonical Persona ID or `null`)
- `stage`
- `phase_id`
- `provider/platform preferences`
- `capability constraints`

Outputs:
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `persona_override_scope`
- `persona_override_owner_id`
- `effective_platform`
- `effective_model`
- `effective_variant` (when present)
- `effective_reasoning_effort` (when present)
- `effective_talkativeness` (when not `model_default`)
- `applied_persona_controls[]`
- `skipped_persona_controls[]`
- `invocation_mode`

Persist these values in runtime telemetry and expose them in the Interview UI/activity pane.

Migration rule:
- Older names such as `requested_persona_id` and `effective_persona_id` are backward-compatibility aliases only. They MUST be normalized to `requested_persona` and `effective_persona` before persistence, event emission, or UI binding.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md

### Interoperability note for provider-native formats

Provider-native agent exports or prompt syntaxes MAY exist as optional interoperability layers only. They MUST be generated from the canonical effective Persona/runtime selection after resolution, and they MUST NOT become a second source of truth for Interview selection behavior.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md

