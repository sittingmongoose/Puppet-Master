# Shard 064: Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)

Source: `Plans/assistant-chat-design.md`

Source lines: L24615-L24652

Source SHA256: `6042b076a4835fecf4c2297bc51de70c98e5f604a4552c5ef425289124ebb4b7`

---

## Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)

This design document **consumes** `PM_Assistant_v2_Additive_Correction_v4`. Authority order for
anything below is: this correction, then the implemented v2 branch, then non-conflicting
`Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md`, then older Plans.

- **Question ceilings** are Plan Quick 3 / Standard 6 / Thorough 8 and Deep Plan Thorough 10 /
  Exhaustive 15 / BrainStorm 20, with Grill Me adding 25 for effective maxima of 28, 31, 33, 35,
  40, and 45. One counter serves a whole run and is shared by every participant. The BrainStorm
  base of 15 and the Grill extension of `+10` are retired.
- **Plan progress** is a host-owned projection. Rich Text shows subtle markers and Markdown shows
  a gutter; neither alters approved Plan bytes or the Markdown serialisation.
- **The Build control keeps four labels.** `Building…` covers paused, waiting, failed-attempt,
  attention-required, and recovery-required; the reason is secondary truth beside it. Only
  `Completed` and `Canceled` are terminal.
- **Build as Goal** is in the Plan overflow menu and is `cmd.chat.plan.build` with
  `execution_topology: goal_driven`. It creates one simple Goal, one PlanRun, and one exact Plan
  binding, reusing the existing To-Dos and scoped PlanUnits, and never enters the Orchestrator.
- **Scheduled builds** store one topology of agent, goal_driven, or crew, and create nothing
  until first dispatch. Scheduled **messages** get a thread card with Scheduled/Held/Sent/
  Canceled/Failed/Expired states and immutable input snapshots.
- **Workflow modals are transactions.** Opening, configuring, and cancelling produce no run, no
  provider attempt, no Usage, no card, no setting, and no install. Only a confirmed Start commits.
- **Participants reach stated outcomes**: completed, failed, timed out, unavailable, canceled, or
  explicitly waived. Nothing is silently substituted, a one-reviewer Review never claims quorum,
  and an active Wonderer abstains and leaves the denominator.
- **Browser components revalidate at dispatch** and return typed `stale_capture` on zero,
  multiple, destroyed, or mismatched targets. **Folders** attach through
  `cmd.chat.attachment.add` with `semantic_kind: folder`; `cmd.chat.add_file_reference` survives
  as a file-only alias.
- **To-Do graphs fail closed** on self-parent, cycles, cross-thread references, and unknown or
  duplicate IDs, and a list replacement classifies active work as retained, rebound, canceled, or
  refused before committing.

Everything else in this document — Teach versus Teacher, automatic memory, Debug, independent
ELI5, whole-turn Revert, the top-level Context Lens, the invisible per-thread composer buffer,
empty-composer history, title-model routing, passive spellcheck, and the wand's contents — is
unchanged by this correction.
