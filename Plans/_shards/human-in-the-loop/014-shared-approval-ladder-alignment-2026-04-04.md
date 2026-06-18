# Shard 014: Shared approval-ladder alignment (2026-04-04)

Source: `Plans/human-in-the-loop.md`

Source lines: L401-L413

Source SHA256: `9a1e98a6713f49fb21d5ee872176e6931760f952f4e30a255c4d2c8878314e2b`

---

## Shared approval-ladder alignment (2026-04-04)

HITL-specific affordances consume the shared permission ladder instead of defining a shorter local approval menu.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Required alignment:
- approval choices are `deny`, `once`, `for session`, `always`
- batch web review may present one domain-grouped approval surface
- `question` defaults to `allow` only when HITL is available; otherwise it remains ask-gated
- HITL surfaces do not create a competing approval vocabulary
- As an approval/ask-flow consumer, HITL MUST preserve repaired permission/question/terminal block handling exactly: permission prompts, question prompts, and terminal blocked states all resolve through the shared permission ladder and blocked-episode model rather than drifting into local-only action names or terminal-only approval behavior.
- The same alignment applies to `/ask-flow` and `/question/terminal` routes: they are consumer labels over the shared question, permission, and terminal blocked-episode model, not independent HITL-only state machines.
