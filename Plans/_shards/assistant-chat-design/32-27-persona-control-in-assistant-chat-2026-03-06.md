## 27. Persona Control in Assistant Chat (2026-03-06)

This addendum defines Persona behavior for the Assistant chat surface.

### 27.1 Chat Persona modes

Assistant chat supports Persona modes:
- `manual`
- `auto`
- `hybrid`

Definitions:
- **manual:** user selects the Persona directly.
- **auto:** chat resolver selects Persona based on repo/task/message context.
- **hybrid:** auto selects by default, but the user may temporarily or persistently override it.

### 27.2 Current Persona display (required)

Chat UI MUST display the effective Persona even when auto mode is active.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Required display content (imported from shared runtime/Persona fields rather than redefined locally):
- `requested_persona?`
- `effective_persona`
- `persona_selection_source`
- `persona_override_owner_id?`
- `effective_platform`
- `effective_model`
- `effective_talkativeness` when not `model_default`
- optional `effective_variant?` / `effective_effort?`
- skipped Persona controls when relevant

Example:
- `Persona: Rust Engineer (Auto: repo detected as Rust + code task)`
- `Model: Codex GPT-5.3 (Persona preferred)`
- `Platform: Codex (Available)`

Rules:
- Auto mode MUST NOT display only `Auto` with no resolved Persona.
- Assistant Chat consumes the field names owned by `Plans/Personas.md`; it MUST NOT create parallel names such as chat-local selection-source or override-owner aliases.
- Inline subagent cards, child-run receipts, and any persona chip in the chat header use the same imported runtime field set so the user sees one consistent requested/effective Persona story across the thread.
- Reserved Personas remain defined in `Plans/Personas.md`; chat acknowledges them only by reference.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/orchestrator-subagent-integration.md

### 27.3 Natural-language Persona invocation in chat

The Assistant must support user requests such as:
- `Use Explorer`
- `Use Collaborator`
- `Be a Rust engineer`
- `Answer as a technical writer`
- `Switch to security auditor`

#### Scope semantics

Default scope handling:
- `for this`, `for this answer`, `right now` -> turn scope,
- `from now on`, `in this chat`, `for this session` -> session scope.

UI must show when a natural-language override is active, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Explorer (User requested, session lock)`

When the override expires, the UI should return to auto display, for example:
- `Persona: Rust Engineer (Auto: Rust repo + code task)`

### 27.4 Persona aliases and fuzzy matching

Chat Persona invocation should resolve through:
- canonical Persona IDs,
- display names,
- aliases,
- normalized natural-language forms.

Examples:
- `rust engineer` -> `rust-engineer`
- `tech writer` -> `technical-writer`
- `collaborator` -> `collaborator`

If multiple Personas match, chat may request clarification. If exactly one reliable match exists, it should resolve without extra friction.
If no Persona matches:
- **Manual picker:** the selector must reject submission with an inline `Persona not found` validation state.
- **Natural-language request:** chat must ask for clarification (for example, nearest matches or a prompt to pick a Persona) before starting a run; it must not silently pretend a request resolved when it did not.
- **Persisted unresolved reference:** if a stored/manual/auto Persona reference reaches runtime and remains unresolved, the fallback contract in `Plans/Personas.md` §2.3 applies, and chat must surface that the run is proceeding without Persona context.

### 27.5 Chat-level controls

The chat panel should include:
- Persona mode selector (`Auto` / `Manual` / `Hybrid`),
- effective Persona pill/badge,
- optional manual Persona picker,
- selection-reason tooltip or inline sublabel,
- effective talkativeness in Persona details when the active Persona overrides model-default verbosity,
- and a way to lock/unlock the current Persona.

### 27.6 Subagent and child-run display

When chat spawns subagents/child runs, the inline subagent blocks must show:
- effective Persona name,
- task label,
- effective platform,
- effective model,
- elapsed time,
- and if relevant, skipped unsupported Persona controls.

### 27.7 Provider compatibility disclosure in chat

Chat surfaces must disclose requested versus effective runtime choice when the distinction matters to user trust or behavior.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

Required disclosure behavior:
- provider/model for a child run is visible on hover in the collapsed card.
- the expanded child panel may show requested versus effective runtime surface, effective effort, and fallback reason when a remap occurred.
- explicit user-chosen runtime surfaces must not silently fallback without disclosure.
- Copilot-native routing restrictions must surface as incompatibility or denial rather than silently degrading into a different execution path.

Crew-mode disclosure:
- the default crew confirmation surface shows each member as `model -> provider/runtime surface`.
- when Copilot forces crew-wide provider normalization, the UI explains that Copilot is being treated as a crew-level provider constraint.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
### 27.8 Chat acceptance criteria addendum

- Assistant chat must support explicit natural-language Persona invocation.
- Auto Persona mode must always disclose the resolved Persona and why it was chosen.
- Current effective Persona/model/platform must be visible in the chat surface.
- If the active Persona sets `talkativeness` away from `model_default`, chat details must expose the effective setting.
- Subagent inline blocks must display effective Persona/model/platform rather than only generic role text.
- Manual Persona selection must block submission when the selected Persona cannot be resolved.
- Natural-language Persona requests that do not resolve to a single reliable match must produce clarification or fallback disclosure, not a silent wrong-Persona resolution.

