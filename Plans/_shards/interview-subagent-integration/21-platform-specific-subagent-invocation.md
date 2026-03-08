## Platform-Specific Subagent Invocation

Normative rule: Interview resolves an **effective Persona** first, then invokes the Provider facade / platform runner using the canonical requested/effective resolution record. Provider-native prompt syntax, exported agent files, or platform-specific delegation syntax are implementation details behind that facade and are **not** the canonical Interview runtime contract.

The Interview runtime MUST NOT require provider-native agent files or provider-native `/subagent` / `/agent` prompt syntax in order to execute.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/orchestrator-subagent-integration.md

### Interview Persona config contract

Interview MUST persist Persona settings separately from legacy provider-native subagent interoperability details.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/FinalGUISpec.md#17.8, ContractName:Plans/orchestrator-subagent-integration.md

Required fields:
- `mode` (`manual | auto | hybrid`)
- `stage_persona_overrides` (map of `questioning | research | validation | drafting | review` -> Persona ID)
- `phase_primary_personas` (map of phase_id -> Persona ID)
- `phase_secondary_personas` (map of phase_id -> ordered Persona IDs)
- optional per-stage platform/model overrides
- optional next-run explicit override

If older config names such as `phase_subagents` / `phase_secondary_subagents` are retained for migration/backward compatibility, their values MUST be interpreted as canonical Persona IDs, not as provider-native command names.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md

### Requested/effective Interview contract

Inputs:
- `requested_persona_id`
- `stage`
- `phase_id`
- `provider/platform preferences`
- `capability constraints`

Outputs:
- `effective_persona_id`
- `persona_selection_source`
- `selection_reason`
- `effective_platform`
- `effective_model`
- `effective_variant` (when present)
- `applied_persona_controls[]`
- `skipped_persona_controls[]`
- `invocation_mode`

Persist these values in runtime telemetry and expose them in the Interview UI/activity pane.

### Interoperability note for provider-native formats

Provider-native agent exports or prompt syntaxes MAY exist as optional interoperability layers only. They MUST be generated from the canonical effective Persona/runtime selection after resolution, and they MUST NOT become a second source of truth for Interview selection behavior.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md

