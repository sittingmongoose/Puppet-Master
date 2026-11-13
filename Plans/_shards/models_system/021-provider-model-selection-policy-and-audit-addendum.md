# Shard 021: Provider/model selection policy and audit addendum

Source: `Plans/Models_System.md`

Source lines: L1327-L1392

Source SHA256: `69f5bed57cd7eee0df3580a8811a098140d306bb4f3005759bb3304512d08765`

---

## Provider/model selection policy and audit addendum

This addendum elaborates how the canonical provider/model precedence owner section is surfaced through user-facing policy, capability gating, and audit trail details.

### Persona, execution-unit, and scope policy inputs


1. **Persona axis**: Users select behaviour, instructions and mutation_policy; the Persona supplies no model/provider/depth default.
2. **Execution Unit Type axis**: Different execution unit types (run, node, delegated_subagent) can have scoped policies (e.g., "use GPT-4 for run-level analysis, but Claude for node-level code generation").
3. **Scope axis**: Model defaults offer Everywhere and optional Project through SSYS-002/059; Computer remains execution context and a capacity ceiling, never an extra model-default store. Worktree/run/owner policies retain their narrower inputs and ceilings.

### Precedence chain for provider/model selection

Resolve through §2 and MS-005/MS-099 only. The order is explicit run, scoped owner policy, surface/stage default, manually selected account default, This project list, Everywhere/factory list. Missing sources fall through; eligibility, ceilings and cost gates always apply.

### Settings resolution and override semantics

`ai.models.resolution-policy` is retired. Conservative policy, Standard policy and Aggressive policy are compatibility-read names only; none may skip or add a rung. Old values are retained for inspection with a retirement notice and omitted from new saves and transfers. Presets are picker shortcuts, not another stored default or precedence policy.

### Provider capability and cost gating

- **Capability check**: Before selecting a provider, verify it supports the required model and inference parameters (context length, output length, reasoning mode, etc.).
- **Multi-account capability check**: Provider capability modeling MUST include multi-account-related behavior before any provider/account pool can be selected or switched. Required capability facts include `supports_multi_account`, signal sources/confidence, cooldown/retry-budget support, reset countdown support, and provider-specific limits that change account pressure interpretation or rotation safety.
- **Cost gating**: If a model exceeds the active Persona's cost budget, skip it and move to the next in the precedence chain.
- **Fallback**: If all preferred models exceed budget or are unavailable, emit a concern (not a silent failure) and suggest cheaper alternatives or escalation.

Clamp/substitution decisions use the `clamp/substitution` reason-code family when the requested provider, model, effort, capability, instruction projection, or skill projection cannot be applied exactly.

Required `clamp/substitution` reason codes:
- `model_unavailable`
- `model_routed_by_provider`
- `model_substituted`
- `effort_unsupported`
- `effort_clamped`
- `auth_family_capability_clamped`
- `capability_unknown`
- `instruction_projection_partial`
- `skill_projection_partial`

Rules:
- `model_unavailable` and `model_routed_by_provider` distinguish PM inability to select a requested model from provider-side rerouting after PM dispatch.
- `model_substituted`, `effort_clamped`, and `auth_family_capability_clamped` are explicit `/substitution` evidence for requested/effective differences caused by model fallback, narrowed effort, or auth-family capability limits.
- `effort_unsupported` and `effort_clamped` distinguish unsupported effort controls from accepted-but-narrowed effort controls.
- `capability_unknown`, `instruction_projection_partial`, and `skill_projection_partial` remain inspectable so the UI does not present a fully honored model/capability/instruction state when PM only has partial or unknown evidence.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md

### Selection reason and audit trail


When a provider and model are selected, emit a `selection_reason` object:
```typescript
selection_reason {
  selected_provider: string,           // e.g., 'openai', 'anthropic', 'github'
  selected_model: string,              // e.g., 'gpt-4', 'claude-3-opus'
  precedence_tier: number,             // 1–6, using the versioned MS-005/099 source order
  fallback_reason?: string,            // If a fallback was triggered (capability, cost, unavailability)
  alternatives: Array,                 // Other models that were considered and why they were skipped
  selection_time_utc: string,          // When the decision was made
  execution_unit_id: string,           // Tied to the unit making the selection
}
```

This metadata is logged so inspectors and auditors can trace why a particular model was chosen and what constraints were active.

ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md
