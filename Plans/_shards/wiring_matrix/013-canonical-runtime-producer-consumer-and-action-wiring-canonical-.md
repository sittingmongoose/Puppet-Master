# Shard 013: Canonical Runtime Producer Consumer and Action Wiring Canonical Alignment (2026-03-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L338-L375

Source SHA256: `adffa65bcc7e38865d077b5ad538a6bf94c19117a46bece38d8e73c7a359aae0`

---

## Canonical Runtime Producer Consumer and Action Wiring Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical producer/consumer/action section preserves command and action-binding tokens. It remains source-lineage for runtime wiring consolidation and does not create a new executable queue, WorkNode, or NodeSeed surface.

### Context Lens minimum rows

| Producer | Consumer | Payload / Contract | Notes |
| --- | --- | --- | --- |
| `cmd.chat.context_lens.toggle` | Assistant chat header controller | toggle request for the top-right Context Lens icon/dropdown | Opens or closes the Context Lens control to the right of the search bar. |
| `cmd.chat.context_lens.set_mode` | Assistant chat thread projection and selection overlay | mode = `mute` \| `focus` \| `subcompact` | Establishes one active Context Lens mode at a time. |
| `cmd.chat.context_lens.turn_off` | Assistant chat thread projection and selection overlay | clear active mode and clear transient selection state | Mirrors the `Turn Off` dropdown action in the PM concept. |
| `cmd.chat.context_lens.toggle_message_selection` | Thread-local context overlay store | message ids[] selection mutation under the current mode | Multi-select is supported in all Context Lens modes. |
| `cmd.chat.context_lens.clear_selection` | Thread-local context overlay store | clear current selection set for the current mode | Clears pending selection without changing persistent canonical history. |
| `cmd.chat.context_lens.apply_subcompact` | Subcompact summarizer and effective-context assembler | selected message ids[] -> local summary replacement in effective context | `Subcompact` is explicit-apply and remains distinct from automatic dynamic context shrinking. |
| `cmd.chat.context_lens.revert_subcompact` | Thread-local context overlay store and effective-context assembler | restore original selected message block into effective assembly | Rehydration uses canonical source messages rather than already-compressed derivatives. |

ContractRef: Context Lens wiring MUST remain thread-local, must support multi-select in all modes, and must keep `Subcompact` as an explicit apply/revert path distinct from automatic dynamic context shrinking. [Source: assistant-chat-design.md#176-context-lens-mute--focus--subcompact; Prompt_Pipeline.md#dynamic-context-shrinking]

The wiring above is part of the canonical chat control surface and must remain aligned with the command catalog, final GUI placement, and effective-context assembly rules.
ContractRef: Wiring rows for Context Lens MUST remain aligned with command IDs, chat placement, and overlay persistence semantics; a packet may not leave those elements split between unrelated addenda. [Source: UI_Command_Catalog.md#context-lens-command-set; FinalGUISpec.md#context-lens-placement-and-behavior]

Add canonical rows for:
- `node.ready`
- `scheduler.pass`
- `node.blocked`
- `node.unblocked`
- `safe_point.created`
- `safe_point.restored`
- `remediation.spawned`
- `remediation.resolved`

Each row MUST identify:
- producer
- persisted record
- UI consumers
- policy consumers
- replay/recovery expectations
- command surfaces that act on the resulting state
