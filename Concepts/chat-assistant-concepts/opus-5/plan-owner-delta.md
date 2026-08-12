# Plan owner delta — Opus 5 Assistant Chat concept

Generated from `impact-register.json` so the two cannot drift. One section per plan owner the
packet names, each stating three things and nothing else: what this concept ASSUMES of the owner,
what it CONTRADICTS, and what it NEEDS from the owner to be implementable.

"Contradicts: nothing" is a real answer and appears where it is true. Padding it with a
hypothetical disagreement would make the sections that do contain one harder to find.

| Owner | Contradicts something | Needs something new |
|---|---|---|
| assistant-chat-design | no | yes |
| FinalGUISpec | no | yes |
| Models System | YES | yes |
| Multi-Account | YES | yes |
| Prompt Pipeline | YES | yes |
| Assistant Memory | no | yes |
| Personas | no | yes |
| Goal Runtime | YES | yes |
| Orchestrator/Subagents | no | yes |
| Planning Wizard | YES | yes |
| PRD Builder | no | yes |
| Permissions | YES | yes |
| FileSafe | no | no |
| Tools/MCP/Skills/Plugins | no | yes |
| Media | YES | yes |
| Usage | no | yes |
| Worktrees/Git | YES | yes |
| Testing/Browser/Artifacts | YES | yes |
| Server/Project Sync integration | YES | yes |
| Notifications | YES | yes |
| Settings inventory | no | yes |

## assistant-chat-design

**Assumes.** Chat owns the transcript, the composer and a thread-local route; every secondary surface is optional and adapts when its host region is absent.

**Contradicts.** Nothing. This concept is a proposal against that owner rather than a departure from it.

**Needs.** A decision on which of the eight window arrangements and eight thread arrangements becomes canonical, and whether the absent-region path stays a first-class arrangement.

## FinalGUISpec

**Assumes.** A fake application shell with a title bar, a left rail and a docked or popped-out chat host; notifications live in the title bar.

**Contradicts.** Nothing structural. The title bar here is scenery sized to create realistic spacing pressure, not a specification of the real one.

**Needs.** Confirmation that app-wide notifications belong to the title bar in the shipped shell, since Chat is built to have no panel of its own.

## Models System

**Assumes.** Reasoning effort and a Fast tier are DECLARED capabilities of a route, absent rather than disabled when unsupported.

**Contradicts.** Any design that presents effort as a fourth peer selector, or that infers a Fast tier from a model name.

**Needs.** An adapter-level capability flag per model for effort levels and for the Fast tier.

## Multi-Account

**Assumes.** A route is the (account, model) pair. The same model under two accounts is two distinct identities with separate setup states.

**Contradicts.** Any model picker keyed on model name alone.

**Needs.** Per-account setup state exposed to the client as one of the setup ladder literals, plus a settings destination that carries a return context.

## Prompt Pipeline

**Assumes.** Context admission is inspectable: an included list with provenance, an omitted list with reasons, and a compaction that preserves ancestry.

**Contradicts.** Any compaction that rewrites stored history or Usage.

**Needs.** An admission receipt from the pipeline that never contains a secret, a policy body, a system prompt or a registry dump.

## Assistant Memory

**Assumes.** Low-relevance memories are an omitted admission category with a stated reason.

**Contradicts.** Nothing.

**Needs.** A relevance signal per memory so the omission reason can be truthful rather than generic.

## Personas

**Assumes.** Persona is a thread-local selector and a persona capsule is an admitted context row.

**Contradicts.** Nothing.

**Needs.** Confirmation that a persona capsule is admissible as its own row rather than being folded into project instructions.

## Goal Runtime

**Assumes.** Chat PROJECTS the Goal: phase index, todo completion, subagent states and a completion receipt. It never owns Goal state.

**Contradicts.** Any second Goal system inside Chat, which this build deliberately does not have.

**Needs.** A phase projection and a completion receipt on the Goal record, plus a gate that refuses an action rather than mutating on an unsupported verb.

## Orchestrator/Subagents

**Assumes.** Subagents carry a route each, and a Crew is thread-local with a shared board and a parent reducer.

**Contradicts.** Nothing.

**Needs.** Per-agent route attribution so Usage can bill each member, and a queued state for a role capacity cannot admit.

## Planning Wizard

**Assumes.** A questionnaire is a queued record with preparing, active, submitting and resolved phases and a durable receipt.

**Contradicts.** Any flow where cancelling leaves no record.

**Needs.** Confirmation that receipts remain in thread history for both submitted and cancelled flows.

## PRD Builder

**Assumes.** Not surfaced in Chat. Artifacts produced elsewhere open in the same left workspace.

**Contradicts.** Nothing.

**Needs.** An artifact identity for any PRD output so it can open by id rather than by path.

## Permissions

**Assumes.** Four access profiles, narrowed by mode, with one effective line. Allow once never writes a persistent grant.

**Contradicts.** Any UI that shows Yolo, or that offers Allow for session without a scope.

**Needs.** Session and Goal scoped grants with an expiry the client can state.

## FileSafe

**Assumes.** Every edit is governed at execution time; the composer never claims authority the profile does not carry.

**Contradicts.** Nothing.

**Needs.** Nothing new. Chat surfaces the outcome, not the policy.

## Tools/MCP/Skills/Plugins

**Assumes.** A tool or MCP change is a material warning class, and unused tool schemas are an omitted admission category.

**Contradicts.** Nothing.

**Needs.** A change signal for the tool set so the warning can name what changed.

## Media

**Assumes.** Attachments resolve to a class and a representation with lineage; an unsupported type offers an alternate route as a decision.

**Contradicts.** Any path that silently substitutes a derived representation without keeping its origin.

**Needs.** A transform table the client can display verbatim, and a video capability flag per route.

## Usage

**Assumes.** Chat reads Usage and never writes it. Compaction does not rewrite it, and a queued send attributes on actual send.

**Contradicts.** Nothing.

**Needs.** Per-account and per-member attribution so a Crew and a two-account route are both attributable.

## Worktrees/Git

**Assumes.** Five human-readable worktree states, and Chat can request a worktree but never remove another owner one.

**Contradicts.** Any conflict action that offers to remove a lease Chat does not own.

**Needs.** Lease ownership exposed with the owning thread and worktree so a conflict card can name it.

## Testing/Browser/Artifacts

**Assumes.** PM-native browser vocabulary only: BrowserWorkspace, Browser Action, Browser Program, Expert Browser Program, BrowserPage, TestCapture.

**Contradicts.** Any surface that names a third-party test runner in PM-owned copy.

**Needs.** Confirmation of the vocabulary in the shipped strings, and an artifact identity for a TestCapture.

## Server/Project Sync integration

**Assumes.** Transport and domain are separate axes; host-owned Goals continue when the client closes; catch-up uses a snapshot.

**Contradicts.** Any status that collapses connection health and service health into one value.

**Needs.** A snapshot boundary the client can show, and a per-entry replay acknowledgement so idempotency is verifiable end to end.

## Notifications

**Assumes.** Chat contributes events and owns no routing. The inbox is the title bar.

**Contradicts.** Any Chat notification panel, bottom-right stack, or rail item.

**Needs.** Destination mapping stays with the Notifications owner; Chat needs only an event contract.

## Settings inventory

**Assumes.** Provider setup, install and update detail live in Settings; Chat offers the exact destination with a return context.

**Contradicts.** Nothing.

**Needs.** A deep-link target per account plus a return context so the user lands back on the thread they left.

## Unresolved questions

These are carried openly rather than decided inside a concept study. A concept may not settle a
question that belongs to a plan owner.

- **Do the eight thread concepts each need a fully distinct question CHOREOGRAPHY, or is a distinct DOM shape plus distinct progress and skip semantics sufficient?**
  The differentiation gate is automated on root class names and DOM shape. The choreography differences named in the plan are per-concept motion work that remains outstanding in this build.

- **Should cmd.chat.history.pin extend cmd.chat.pin rather than sit beside it?**
  The names are one word apart and mean different things. Recorded as alias_risk rather than decided here.

- **Is the artifact open pair a new chat family or an extension of cmd.orchestrator.open_*_artifact?**
  Four artifact-open ids already exist for other kinds. Recorded with related_existing refs.

- **Does a floating artifact capsule overlaying the transcript remain acceptable for the frameless concept?**
  Every other concept keeps the artifact out of the transcript rectangle. w8 overlays it by design and only guarantees the composer stays clear.
