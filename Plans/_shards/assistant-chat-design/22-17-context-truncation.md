## 17. Context & Truncation

- **Goal:** Do our best **not to truncate** important context. Long conversations and large plans should remain usable.
- **Approach:** Use strategies similar to those used by mature AI-coding systems:
  - **VBW (Vibe Better With Claude Code):** Context compilation, role-specific context, compaction awareness, token efficiency. See [VBW manifesto](https://github.com/yidakee/vibe-better-with-claude-code-vbw/tree/main?tab=readme-ov-file#manifesto).  
  - **Get Shit Done (GSD):** Context engineering, sized context files, fresh context per plan. See [GSD](https://github.com/gsd-build/get-shit-done).  
  - **yume:** Session recovery, checkpoints, persistent state. See [yume](https://github.com/aofp/yume).  
- **Application:** Where applicable, implement or plan for: context compilation for chat (e.g. conversation summary + recent turns + plan), compaction-aware re-reads, and clear boundaries so the agent knows what is "current" vs "summarized".
- **User-triggered "Compact session":** The user can trigger **"Compact session"** (or "Summarize and continue") in chat -- e.g. via slash command or menu -- which runs the same compaction pipeline as auto-compact (Plans/newfeatures.md §10), with clear UI feedback (e.g. "Compacting...").

### 17.1 Deterministic bundle ordering (Instruction / Work / Memory)

Rule: For every Assistant turn (and any chat-triggered run), the context pipeline MUST assemble the run context as three explicit bundles, in this deterministic order: (1) Instruction Bundle, (2) Work Bundle, (3) Memory Bundle.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

Rule: The Work Bundle acceptance criteria MUST NEVER be truncated; if truncation is required to fit a model’s window, truncation MUST occur in instruction example/illustrative content first and in conversation summaries/older turns before any acceptance criteria content is removed.

ContractRef: ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 17.2 Injected-context breakdown + truncation transparency (UI)

Rule: The chat UI MUST surface an “Injected Context” breakdown per run/turn, including: included `AGENTS.md` paths + byte counts; parent summary and attempt journal inclusion + byte counts; and whether truncation occurred (and the reason/order that was applied).

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

Rule: The three context injectors MUST be user-configurable (per-project; optional per-run override) with deterministic defaults; budget defaults (bytes/lines/headings) MUST be decided deterministically and recorded via `auto_decisions.jsonl`.

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 17.3 Context re-pack on model switch (Resolved)

When the model changes mid-thread, the context pipeline re-packs the conversation before the next turn is sent:

1. **Preserve unconditionally:** System prompt, Instruction Bundle (`AGENTS.md` chain where enabled), active file references, last 6 turns verbatim (config: `context.repack.verbatim_turns`, default `6`).
2. **Summarize:** All turns older than the last 6 are condensed into a single "Conversation Summary" block (key decisions, file paths mentioned, outcomes).
3. **Truncate:** If the preserved + summarized content exceeds the new model's context window (from `platform_specs`), truncate the summary first, then drop oldest preserved turns until it fits. Never truncate the system prompt or the Work Bundle acceptance criteria.
4. **Normalize:** Provider-specific formatting (e.g., tool call syntax) is normalized to the new provider's expected format.
5. **Timing:** Re-pack runs synchronously before the next turn is sent. The user sees a brief "Repacking context…" indicator.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

Config: `context.repack.verbatim_turns` (default `6`). Max tokens sourced from `platform_specs::context_window(provider)`.

Rule: Any UI affordance that offers “Promote to `AGENTS.md`” (or similar) MUST enforce Promotion rules and `AGENTS.md` lightness enforcement (including budgets) before applying changes.

ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 17.4 Assistant-only memory capsule + retrieval injection (SSOT)

Rule: For Assistant turns with a selected project, chat context assembly MUST call the Assistant-memory SSOT interfaces (`build_capsule(project_id, now)` and `search(project_id, user_message, now, k)`) and MUST enforce the configured capsule/retrieval budgets.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-memory-subsystem.md#8-integration-points, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

Rule: Automatic memory injection in chat MUST apply eligibility gating per the Assistant-memory SSOT (Verified-only by default; any Unverified inclusion requires explicit user action).

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

Rule: Memory injection in chat MUST use summary-only memory text and MUST remain separate from Application/Project rules pipeline assembly.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#3-data-model, ContractName:Plans/agent-rules-context.md

Rule: Assistant memory MUST NOT be forwarded to subagents or non-Assistant execution paths from chat.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

Rule: Gist Review actions in Assistant chat MUST dispatch canonical `cmd.chat.memory.*` UI command IDs from `Plans/UI_Command_Catalog.md` and MUST NOT use ad-hoc command identifiers.
ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#UICommand

---

