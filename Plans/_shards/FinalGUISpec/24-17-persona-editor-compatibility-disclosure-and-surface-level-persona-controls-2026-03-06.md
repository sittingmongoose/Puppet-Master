## 17. Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls (2026-03-06)

This addendum expands the GUI contract for Persona authoring and runtime visibility.

### 17.1 Persona editor compatibility matrix (required)

The Persona editor MUST show provider support state for Persona controls.

Support states:
- `supported`
- `partially supported`
- `unsupported`

For each control (platform/model/variant/temperature/top_p/reasoning_effort/talkativeness/tool-permission coupling/subagents), the editor must:
- show normal editing when supported,
- show warning styling and explanatory tooltip when partially supported,
- show disabled control plus explanation when unsupported.

`talkativeness` is a Persona instruction-layer control rather than a transport/runtime sampling knob. Its support state follows Persona prompt-body support: if a provider can apply Persona prompt instructions, it can apply `talkativeness`.

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
- `talkativeness`
- `preferred_tools`
- `discouraged_tools`
- `tool_usage_guidance`
- `aliases`

`talkativeness` must be rendered as a fixed single-select with these labels and stored enum values:
- `Talk a lot more` -> `talk_a_lot_more`
- `Talk more` -> `talk_more`
- `Talk a little more` -> `talk_a_little_more`
- `Model default` -> `model_default`
- `Talk a little less` -> `talk_a_little_less`
- `Talk less` -> `talk_less`

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

**§7.4.8A Docker Manage + Unraid publishing addendum:**

Add a contextual **Docker Manage** GUI surface for Docker-related projects. This surface may be implemented as a page or dockable panel, but it MUST behave as a first-class management surface and not merely as a hidden advanced-only dialog.

- **Visibility rule:** show the Docker Manage surface when a Docker-related project is active. Add a setting named **Hide Docker Manage when not used in Project.** Default: enabled.
- **Auth controls:** place a browser-login button near DockerHub settings, retain PAT entry, show helper text that PAT is recommended, and explain/link how to obtain a PAT.
- **Auth state presentation:** show requested auth mode separately from effective capability, along with validated account identity, namespace access, and degraded reason when capability is partial.
- **Repository management controls:** namespace selector, repository selector, refresh action, create-repository action, and create-repository confirmation dialog that displays namespace, repository name, and privacy. Privacy defaults to private and must be visibly labeled as the default.
- **Runtime controls:** build, run/preview, stop, open running container/web UI, open logs, and health/access state.
- **Publish controls:** push image, show digest/tag results, and expose target DockerHub repo summary.
- **Unraid controls:** toggle to auto-generate/update Unraid XML after successful publish (default enabled), toggle to manage template repo (default enabled), template-repo status row, one-click push action, and shortcut into `ca_profile.xml` editing.
- **Template repo setup flow:** allow both create-new and select-existing when no template repo is configured.
- **`ca_profile.xml` editor:** default to shared cross-project maintainer profile with per-project override option; all fields editable; support picture upload or external URL; uploaded pictures default to repo-managed assets.
- **Auto-generated metadata warning:** when `ca_profile.xml` is created automatically, show a visible notice that the user still needs to configure/review the profile.
- **Safety copy:** make it explicit that repository creation cannot be auto-approved by YOLO or autonomy modes.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md#147-docker-runtime--dockerhub-contract, ContractName:Plans/Permissions_System.md

