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

Required display content:
- effective Persona name,
- selection reason,
- effective platform,
- effective model,
- optional variant/effort,
- skipped Persona controls when relevant.

Example:
- `Persona: Rust Engineer (Auto: repo detected as Rust + code task)`
- `Model: Codex GPT-5.3 (Persona preferred)`
- `Platform: Codex (Available)`

Auto mode MUST NOT display only `Auto` with no resolved Persona.

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

If the active provider cannot honor a requested Persona control, chat must disclose that at least in details/tooltip/history form.

Examples:
- `Skipped: temperature unsupported by Claude Code transport`
- `Skipped: top_p unsupported by Cursor CLI transport`

### 27.8 Chat acceptance criteria addendum

- Assistant chat must support explicit natural-language Persona invocation.
- Auto Persona mode must always disclose the resolved Persona and why it was chosen.
- Current effective Persona/model/platform must be visible in the chat surface.
- Subagent inline blocks must display effective Persona/model/platform rather than only generic role text.
- Manual Persona selection must block submission when the selected Persona cannot be resolved.
- Natural-language Persona requests that do not resolve to a single reliable match must produce clarification or fallback disclosure, not a silent wrong-Persona resolution.
