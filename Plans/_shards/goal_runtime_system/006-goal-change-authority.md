# Shard 006: Goal change authority

Source: `Plans/Goal_Runtime_System.md`

Source lines: L161-L175

Source SHA256: `62576d2ba5cc5495c0ec34c833274975525938d5686d0e4b45924cbb8a0fed2c`

---

## Goal change authority

Three authority paths write a Goal, and no other path may.

**Creation.** `/goal`, the Goal control, or an explicit natural-language request such as "make that a goal" creates a Goal through `cmd.chat.goal.start`. The agent may create it on the user's explicit request without a second approval dialog, because the request itself is the approval. What the agent may not do is infer a Goal from a long task, from repeated failures, from a Plan Build, or from a schedule. Absent an explicit request there is no Goal.

**Direct user edit.** The user edits `objective_text` in Goal Activity Detail and presses Save. Save *is* the approved change. There is no confirmation dialog, no agent review of the user's own text, and no material-difference analysis presented back to the user. The edit writes revision `n+1` with `change_source: user_direct` and a `source_message_id` of `null`. A direct edit is permitted in `active`, `paused`, and `blocked`; editing an `active` Goal takes effect at the next continuation boundary rather than mutating a turn already in flight.

**Agent-proposed replacement.** The agent may propose a complete replacement objective only after an explicit user instruction to change the Goal. It dispatches `cmd.chat.goal.propose_update`, which returns an `ApprovalRequest` and writes nothing. The existing approval host shows exactly the current objective, the proposed complete replacement objective, `Approve Change`, and `Cancel`. On approval the accepted text is written through `cmd.chat.goal.update` with `change_source: agent_proposed_user_approved` and the originating `approval_id`. Nothing about the Goal changes before approval, and a denied or expired proposal leaves `revision` and `currentness_hash` untouched.

The system must never silently rewrite, narrow, broaden, summarize, reformat, translate, or "clarify" `objective_text`. An agent that believes the objective is wrong proposes; it does not edit. A rejected silent-rewrite attempt is a typed error, not a quiet no-op, so the attempt is visible in audit.

Pause, Resume, and Cancel are user controls. Resume from `paused` is eligible whenever currentness and permissions still resolve; Resume from `blocked` is eligible only when the owner condition named by `blocked_reason_ref` reports that it has cleared, and the control renders disabled with that reason when it has not.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/assistant-chat-design.md
