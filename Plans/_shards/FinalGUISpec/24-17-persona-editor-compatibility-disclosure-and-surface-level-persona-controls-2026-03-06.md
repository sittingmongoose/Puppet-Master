## 17. Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls (2026-03-06)

This addendum expands the GUI contract for Persona authoring and runtime visibility.

### 17.1 Persona editor compatibility matrix (required)

The Persona editor MUST show provider support state for Persona controls.

Support states:
- `supported`
- `partially supported`
- `unsupported`

For each control (platform/model/variant/temperature/top_p/reasoning_effort/tool-permission coupling/subagents), the editor must:
- show normal editing when supported,
- show warning styling and explanatory tooltip when partially supported,
- show disabled control plus explanation when unsupported.

Minimum provider rows to display:
- Claude Code
- Cursor CLI
- OpenCode
- Direct/API providers

### 17.2 Persona editor fields (expanded)

In addition to existing Persona fields, the editor must support:
- `default_platform`
- `default_model`
- `default_variant`
- `temperature`
- `top_p`
- `reasoning_effort`
- `preferred_tools`
- `discouraged_tools`
- `tool_usage_guidance`
- `aliases`

### 17.3 Compatibility panel copy examples

The editor should be able to communicate states like:
- `Claude Code: supports model preference and effort; temperature/top_p not exposed in official CLI settings.`
- `Cursor CLI: supports prompt/rules steering and some model selection; low-level runtime controls are limited or undocumented.`
- `Direct/API providers: strongest support for exact runtime controls.`

### 17.4 Surface-level Persona controls

Persona controls are required on the following surfaces:
- Chat
- Interview
- Requirements Builder
- Orchestrator
- Multi-Pass Review

Each surface should expose, at minimum:
- Persona mode (`Auto` / `Manual` / `Hybrid`)
- current effective Persona display
- platform/model display
- selection reason
- manual override control or lock/unlock affordance
- skipped unsupported Persona controls when relevant

Interview/Builder visibility rule:
- The Interview chat surface, Interview activity pane, and Builder activity pane MUST display the same effective-runtime fields for the active run block, even if one surface uses a more compact layout than another.

#### 17.4.1 Persona mode semantics

- **Auto:** Resolver selects the Persona from surface defaults, mappings, and runtime context. User sees the chosen Persona and reason string but does not pin a manual choice.
- **Manual:** User explicitly selects a Persona for the next eligible run/turn on that surface. Manual selection overrides Auto resolution until cleared or replaced.
- **Hybrid:** Resolver proposes a Persona, but the user may override it before execution while still seeing the automatic recommendation and reason text.
- Mode changes apply only to the next eligible run/turn or queued execution on that surface; they do not retroactively change an active run already in progress.

#### 17.4.2 Selection reason and override behavior

- The **effective Persona display** must show the resolved Persona name plus a one-line reason string such as `User requested`, `Stage default`, `Provider fallback`, or `Mapped from Interview phase`.
- Every surface needs a compact **Override Persona** affordance (dropdown, popover, or button+menu) with `Set override`, `Clear override`, and `Return to Auto` actions.
- When overrides are unavailable for the current provider or run state, the control remains visible but locked/disabled with a tooltip explaining why.

#### 17.4.3 Platform/model display scope

- The `platform/model display` requirement may reuse the existing status-bar/footer platform and model controls where those already exist; the surface must not introduce conflicting duplicate controls.
- If a user overrides model/platform independently from the Persona, the UI must show both the requested Persona and the effective platform/model outcome.

### 17.5 Runtime display requirements

When a run is active, the UI must display:
- requested Persona when explicitly set,
- effective Persona,
- selection source/reason,
- effective platform,
- effective model,
- effective variant/effort when present,
- skipped Persona controls when applicable.

This display requirement applies to:
- chat status strip or header,
- interview activity card,
- requirements builder progress/status UI,
- orchestrator activity and run inspection surfaces,
- subagent inline blocks,
- multi-pass reviewer status rows.

### 17.6 Natural-language invocation feedback

If the user summons a Persona via natural language, the UI must reflect it explicitly, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Explorer (User requested, session lock)`

If the override is turn-scoped, the UI should clear back to the previous/auto state on the next eligible turn.

### 17.7 Provider-gap disclosure rule

The GUI must never imply that a provider honored a Persona control when it did not.

If a control is skipped, the UI must disclose it in at least one of:
- inline status text,
- tooltip,
- activity detail popover,
- run detail/history panel.

#### 17.7.1 Disclosure mechanics

- **Honored** = requested control applied as requested. **Skipped** = ignored entirely. **Clamped** = partially honored but changed to a supported value/range.
- Every disclosure must include: control name, requested value, effective value (if any), and human-readable reason.
- When a limitation is known before execution, render the control disabled or warning-badged in place; do not let the user believe it is actionable.
- When a limitation is only discovered at runtime, surface the disclosure inline on the active surface **and** persist the same information in run detail/history so it is auditable later.
- Disclosures must name the provider explicitly (for example: `Claude Code ignored reasoning_effort=high; provider does not support that control on this model`).

### 17.8 Interview/Builder/Orchestrator mapping editors

Settings or surface-specific configuration must support mapping Persona defaults to:
- Interview stages/phases,
- Requirements Builder steps/passes,
- Orchestrator phase/task/subtask/iteration tiers,
- Multi-Pass review passes.

These editors should also allow platform/model selection per mapping and show compatibility warnings.

### 17.9 Acceptance criteria addendum

- Persona editor must disclose unsupported and partially supported controls per provider.
- All interactive run surfaces must show effective Persona/model/platform and selection reason.
- Natural-language Persona requests must be visibly reflected in the UI when active.
- Provider-gap disclosure must be explicit; no silent implied support.
