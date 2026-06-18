# Shard 020: Provider/model selection policy and audit addendum

Source: `Plans/Models_System.md`

Source lines: L1160-L1236

Source SHA256: `410b71b44fed676a4dfa161c9560c82c14d686eaa7bbdcc0fa53849107bb4f11`

---

## Provider/model selection policy and audit addendum

This addendum elaborates how the canonical provider/model precedence owner section is surfaced through user-facing policy, capability gating, and audit trail details.

### Persona, execution-unit, and scope policy inputs


1. **Persona axis**: Users select a Persona (e.g., "Code Analyzer", "Documentation Writer") which carries default preferences for model, provider, and mutation_policy.
2. **Execution Unit Type axis**: Different execution unit types (run, node, delegated_subagent) can have scoped policies (e.g., "use GPT-4 for run-level analysis, but Claude for node-level code generation").
3. **Scope axis**: Settings can be scoped to worktree, project, or global level; settings at a tighter scope override broader scopes.

### Precedence chain for provider/model selection

When a unit needs to select a provider and model, resolve in this order:

1. **Explicit run-envelope override**: If the run was launched with `--provider=X --model=Y`, use those.
2. **Scoped owner policy**: If the active execution_unit_type has a policy (e.g., "node-type uses Copilot"), apply it.
3. **Persona preference**: Use the active Persona's default model and provider.
4. **Surface or stage default**: If the UI surface or execution stage has a default (e.g., "code review prefers GPT-4"), use it.
5. **Project or global config default**: Fallback to project-wide or global settings.
6. **Last-used state**: If permitted by settings, use the model/provider from the previous run of the same type.
7. **Provider default**: Use the provider's canonical default model.

### Settings resolution and override semantics


- **Conservative policy**: Use only settings tier 1 (explicit override) or tier 3+ (canonical defaults); do not apply stage defaults or persona preferences.
- **Standard policy** (default): Use tiers 1-5 (explicit override through project defaults); respect all configuration.
- **Aggressive policy**: Use all tiers 1-7; auto-select the cheapest or fastest model if multiple are available and equally suitable.

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
  precedence_tier: number,             // 1-7 indicating which tier was applied
  fallback_reason?: string,            // If a fallback was triggered (capability, cost, unavailability)
  alternatives: Array,                 // Other models that were considered and why they were skipped
  selection_time_utc: string,          // When the decision was made
  execution_unit_id: string,           // Tied to the unit making the selection
}
```

This metadata is logged so inspectors and auditors can trace why a particular model was chosen and what constraints were active.

ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md
