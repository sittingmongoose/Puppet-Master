# Working Ledger

## Work Item
- `w-20260316-160450`

## Mode
- `research`

## Topic / Scope
- Chat thread miscellaneous features in rewrite planning docs.
- First research seam: whether chat has access to terminal and grep/search-like tools, how outputs appear in chat, whether output is expandable, and whether the UI can optionally pop out to a full terminal.

## Objective
- Determine what is already fully specified in `Plans/**` for chat-thread terminal/tooling surfaces.
- Identify missing contracts, UX gaps, contradictions, and likely doc touchpoints for later reconciliation.

## Constraints / Non-Goals
- Research mode only; do not edit planning docs during this phase.
- Use a targeted reading approach first; avoid a broad repo sweep unless the discussion clearly requires it.
- Working ledger is execution memory only, not canonical and not to be cited in planning docs.

## Key Facts and Findings
- User said this is a brand-new work item, not a reuse of a prior `work_id`.
- The first item to research is specifically chat-thread access to terminal/tool/search surfaces and result presentation behavior.
- `Plans/Tools.md` already defines a canonical tool surface for chat/agents including `bash`, `grep`, `glob`, `chatsearch`, `codesearch`, `logsearch`, and `logread`.
- `bash` is explicitly allowed as a tool in project/workspace scope with timeout/output caps and explicit truncation/timeout disclosure requirements.
- `grep` is a canonical built-in tool; `codesearch` is defined as multi-tier search (Tantivy + LSP + ripgrep fallback).
- `Plans/assistant-chat-design.md` defines agent-callable `chatsearch`, `codesearch`, `logsearch`, and `logread` as project-only search tools.
- `Plans/assistant-chat-design.md` says assistant-invoked live/dev actions route output into canonical shell-owned `terminal/output/ports` surfaces; chat must not invent a parallel dev-output model.
- `Plans/FinalGUISpec.md` defines per-message activity transparency sections in chat: bash/commands, web search, files explored, files changed, code diffs. These sections are collapsible and default-collapsed.
- `Plans/FinalGUISpec.md` explicitly says bash/command entries expand to full command text and output inside the chat message.
- `Plans/FinalGUISpec.md` defines detachable shell panels, including Chat and Bottom panel (`Terminal/Output`), with pop-out triggers at the panel level.
- `Plans/assistant-chat-design.md` references an owning thread being `terminal or non-writable`, implying terminal-associated threads/surfaces exist, but without a full terminal-thread contract in the inspected material.
- Competitive research (official docs preferred) shows a strong cross-product pattern:
  - chat/agent may run tools and terminal commands
  - tool details are usually collapsed by default
  - users can expand inline details in chat
  - the product still preserves a canonical terminal/panel/tool-window surface for full output continuity
- VS Code official docs are the clearest reference pattern:
  - tool call details are collapsed by default and can be expanded in chat
  - terminal commands run in an integrated terminal
  - chat offers `Show Output` inline and `Show Terminal`
  - long-running commands can be moved to background from chat
  - tool approvals have multiple levels (`Default Approvals`, `Bypass`, `Autopilot`)
- Cursor official docs confirm:
  - agent terminal commands are first-class
  - sandboxing and approval/allowlist behavior are explicit
  - native terminal integration is part of the terminal tool contract
- JetBrains official docs confirm:
  - chat/agent modes can generate code, edits, and terminal commands
  - users review/apply results in IDE tool windows
  - Junie can run terminal commands while reporting progress
- OpenCode official docs clearly confirm:
  - canonical tools include `bash`, `grep`, etc.
  - permission model is `allow` / `ask` / `deny`
  - plan agent asks before bash by default
  - IDE integration is terminal-first (`opencode` opens in a split terminal view)
- OpenCode desktop/TUI output-placement details are less explicitly documented than VS Code’s; terminal-first split-view is well supported, but a stronger official citation for “expand inline tool block vs separate panel” was not found in the inspected primary docs.
- Antigravity has weaker evidence quality from the inspected sources; some high-level manager/agent-terminal patterns appear plausible, but confidence is lower than for VS Code, Cursor, JetBrains, and OpenCode.
- User resolved the preferred UX: chat shows a small mini terminal preview with only a few lines visible; the mini terminal is read-only/non-interactive; clicking a button opens the real terminal attached to the agent’s work.
- User resolved follow-on defaults:
  - mini terminal is attached per message/instance that triggered terminal activity
  - collapsed preview shows 5 lines
  - expanded in-chat preview shows 15 lines
  - mini terminal persists after completion
  - metadata should include the full set under discussion (status, cwd, command summary, elapsed time, exit/truncation-style details)
- User further resolved grouping: one mini terminal per command.
- User resolved retry behavior: retries create a new terminal and therefore a new mini terminal card, rather than appending to the old one.
- User resolved long-running/watch-mode handling: treat it the same as any other command card; command cards are live by default while the command is active.
- User resolved copy behavior: copy should work directly from the mini terminal card.
- User clarified the “pop out terminal” behavior: it should use Puppet Master’s built-in terminal system and open a new terminal within Puppet Master, not an external OS terminal window.
- User resolved continuity: the new Puppet Master terminal is a view onto the same live command/session, not a fresh shell.
- User allowed renaming the action label away from “pop out terminal.”
- User resolved repeated-open behavior: `Open in Terminal` should reuse/focus the existing terminal view for that command rather than creating duplicates.
- User resolved failure-state UX: no special extra failure treatment or retry affordance beyond the normal command-card status/meta presentation.
- User resolved placement: mini terminal cards appear inline exactly where the command happened in the assistant message.
- User resolved summary sequencing: a textual summary can appear after the inline mini terminal card.
- User expanded the same inline preview pattern to non-terminal operations: search results should use the same mini-card approach, and code-edit previews/diffs for agent edits should also be specced in the same family.
- User resolved diff-card unit and open behavior: one diff card per edit command; opening it should open the file in the editor and show the diff.
- User resolved search-card behavior:
  - primary action opens a search results view/list rather than jumping directly to a file
  - clicking an individual result opens the file in the editor
  - collapsed preview shows 5 results
  - expanded preview shows 15 results
  - expanded preview may be scrollable when more results exist
  - total result list should cap at 50
- User resolved copy behavior for non-terminal cards: no copy action for search cards or diff cards.
- User resolved diff-card preview sizing: use the same preview bounds as the other card types.
- User resolved that diff/edit cards should also have an inline cap; current working assumption is to mirror the search-card 50-item ceiling unless later differentiated.
- User resolved the diff-cap unit: measure the inline diff cap in lines.
- User indicated “same rules” for the broader inline card family; working interpretation is that search and diff cards inherit the same shared card rules unless a deliberate type-specific exception is specified.

## Gaps / Problems Identified
- Unknown whether existing chat docs already define:
  - terminal access model
  - grep/search tooling model
  - inline result rendering in chat
  - expandable/collapsible result blocks
  - optional pop-out-to-terminal behavior
- Search/tool access is mostly specified, but the distinction between:
  - chat-native tool result rendering,
  - shell-owned terminal/output surfaces,
  - and any true interactive terminal session bound to a chat thread
  is not yet cleanly unified.
- The docs specify expandable bash/result blocks inside chat, but they do not yet clearly define a user action like “open this exact command/session in Terminal” or whether that handoff preserves session continuity.
- Panel detach/pop-out is specified for the Chat panel and Bottom terminal/output panel, but not for an individual inline command-result block.
- A “terminal thread” concept is implied but not fully defined: ownership, writability, lifecycle, and relation to the shell terminal surface remain underspecified.
- Current Puppet Master docs do not yet spell out the stronger VS Code-like bridge actions:
  - show inline output
  - show/open full terminal
  - continue long-running command in background
- Approval UX exists in principle, but the competitive pattern suggests we may want a clearer permission-level ladder rather than only per-command approval cards.
- Competitive evidence suggests that “pop out to full terminal” should likely target the canonical terminal surface/window, not the chat message block itself.
- Need to define whether the mini terminal is attached per message, per active run, or per thread-level active terminal session.
- Need to define session continuity explicitly: opening the terminal should focus the same underlying terminal/session, not create a fresh shell with different state.
- Terminology still needs normalization: “pop out terminal” is misleading now that the behavior is explicitly in-app and same-session.
- Current docs likely need a broader abstraction than “mini terminal”: a generic inline operation-card model spanning terminal output, search results, and edit diffs.
- Type-specific primary actions still need to be clarified:
  - terminal card -> `Open in Terminal`
  - search card -> open/focus search results view/list
  - edit/diff card -> open file in editor with diff visible

## Candidate Fixes / Design Directions
- If underspecified, define a capability matrix for chat thread tools:
  - direct terminal session
  - structured search/grep tools
  - read-only vs mutating commands
  - inline preview vs expanded view vs external terminal handoff
- Separate requested behavior from effective behavior so UI can explain when a thread/tool lacks terminal capability.
- Specify fallback behavior when the environment cannot provide an interactive terminal.
- Recommended framing:
  - `bash`/search tools remain canonical chat-callable tools.
  - Chat renders concise, expandable audit/result blocks for each tool call.
  - Long-running or interactive dev-session output remains owned by shell surfaces (`Terminal`, `Output`, `Ports`) with chat showing status + pointers, not a duplicate live transcript model.
  - If desired, add an explicit “Open in Terminal” handoff contract that opens the owning Bottom panel or detached terminal window for the relevant run/session.
- Competitive recommendation:
  - follow the VS Code pattern most closely for this seam:
    - collapsed tool line by default
    - inline expand for immediate inspection
    - explicit action to open/show canonical terminal
    - explicit backgrounding action for long-running commands
  - borrow Cursor’s stronger permission framing for terminal commands (sandbox/approval/allowlist language) if the product wants a more developer-trust-forward model
  - borrow OpenCode’s terminal-first framing only where the owning surface is already clearly terminal-centric; do not let it blur chat and terminal into one undifferentiated transcript
- If a “terminal thread” concept stays, define whether it is:
  - a specialized thread type bound to a terminal session,
  - a non-writable provenance wrapper around shell activity,
  - or simply a thread whose primary output target is the Bottom panel.
- Preferred answer so far:
  - search tools (`grep`, `codesearch`, `chatsearch`, `logsearch`) stay in-chat by default
  - one-shot `bash` stays in-chat with expandable output
  - interactive or long-running terminal work promotes to canonical terminal surface with a chat pointer/action rather than streaming indefinitely as a giant chat transcript
- Newly preferred terminal UX contract:
  - chat renders a compact mini terminal card/strip for terminal-backed agent activity
  - the mini terminal shows only a small bounded preview of recent lines
  - the mini terminal is read-only in chat
  - the primary action opens/focuses the canonical terminal surface for the same agent/session
  - detach/pop-out, if supported, applies to the canonical terminal surface, not the inline mini preview
- Recommendation: reserve the mini terminal for actual terminal-backed work, not for search tools or simple file-read activity badges.
- Concrete defaults now chosen:
  - collapsed state = 5 visible lines
  - expanded state = 15 visible lines
  - preview persists after completion instead of disappearing
  - show rich metadata on the card rather than a minimal-only caption
  - grouping = one mini terminal per command
  - retries create a fresh terminal/card
  - long-running/watch-mode commands use the same card model as all other commands
  - command cards are live by default while their commands are running
  - copy works directly from the mini terminal card
  - terminal handoff stays inside Puppet Master’s built-in terminal surfaces
  - terminal handoff opens another in-app terminal view onto the same live command/session
  - recommended label normalization: `Open in Terminal`
  - user intent suggests this same template should be the default starting point for search-result cards and edit/diff cards unless later differentiated
  - search cards: 5 collapsed / 15 expanded / scrollable when needed / max 50 total results
  - diff/edit cards: same preview rules as the rest of the card family, with a 50-line inline cap
- New higher-level direction:
  - define a shared inline operation-card pattern across command, search, and edit events
  - align common behaviors (inline placement, persistence, bounded collapsed/expanded preview, copy support, post-card summary)
  - vary only payload rendering and primary open action by card type
  - remaining work is mostly reconciliation/spec wording, not unsettled product design

## Impacted Docs
- Likely: `Plans/assistant-chat-design.md`
- Likely: `Plans/FinalGUISpec.md`
- Confirmed: `Plans/Tools.md`
- Confirmed: `Plans/newfeatures.md`
- Likely follow-on alignment: `Plans/Permissions_System.md`
- Possible external-reference inspiration only (not for citation in plans): VS Code agent tools/docs, Cursor terminal tool docs, JetBrains AI Chat docs, OpenCode tools/IDE docs

## Decisions Already Resolved
- Work item mode is `research`.
- Status should remain `active` during research.
- Topic starts with chat-thread terminal/tool/search access and display behavior.
- Existing docs already support agent/chat access to shell/search tools; this is not a blank slate.
- Existing docs already support inline expandable command/result transparency in chat.
- The unresolved seam is not “does chat have any tool access?” but “what is the exact contract between inline chat results and the canonical terminal/output surfaces?”
- Competitive review supports a layered model rather than a single all-in-chat terminal model.
- Resolved: chat does not host a fully interactive terminal for agent work.
- Resolved: chat hosts a small read-only mini terminal preview.
- Resolved: opening the full terminal is an explicit user action that transfers focus to the canonical terminal surface for that same work.
- Resolved: mini terminal is attached per message/instance that triggered it.
- Resolved: collapsed preview shows 5 lines; expanded preview shows 15 lines.
- Resolved: the mini terminal persists after completion.
- Resolved: the card should expose full relevant metadata, not just a minimal title.
- Resolved: if one assistant message runs multiple terminal commands, each command gets its own mini terminal preview.
- Resolved: retries do not reuse the prior terminal preview; each retry attempt creates a new terminal and a new preview card.
- Resolved: long-running/watch-mode commands do not introduce a separate card type; they reuse the standard command-card model and remain live while active.
- Resolved: users can copy directly from the mini terminal card without opening the full terminal first.
- Resolved: terminal “pop out” does not mean external system terminal; it means opening a new terminal inside Puppet Master.
- Resolved: the opened Puppet Master terminal is attached to the same live command/session.
- Recommended terminology: use `Open in Terminal` as the default action label instead of `Pop Out Terminal`.
- Resolved: repeated `Open in Terminal` actions are idempotent per command/session and should focus the existing terminal view.
- Resolved: failed commands do not get a separate specialized card type or extra retry-specific UI treatment.
- Resolved: command cards render inline in the assistant message flow at the exact point the command occurred, not in a separate activity strip/footer.
- Resolved: the assistant may add a short textual summary after the command card rather than relying on a pre-card summary line.
- Resolved direction: search-result previews and code-edit diff previews belong in the same inline card family as terminal previews, rather than using unrelated presentation models.
- Resolved: diff/edit preview cards are one per edit command, not one per file or one per whole assistant batch.
- Resolved: diff card primary action opens the affected file in the editor with the diff shown.
- Resolved: search cards open a search results list/view first; individual hits from that list open files in the editor.
- Resolved: search-card preview bounds are 5 collapsed, 15 expanded, with scrollability beyond that and a 50-result cap.
- Resolved: copy is terminal-card-only; search cards and diff cards do not expose copy actions.
- Resolved: diff cards use the same collapsed/expanded preview sizing pattern as the other inline operation cards.
- Resolved direction: diff/edit cards should also enforce an inline cap rather than allowing unbounded file/hunk previews in chat.
- Resolved: diff/edit inline cap should be measured in lines rather than files/hunks/regions.
- Resolved direction: shared card-family rules should stay aligned across terminal, search, and diff cards unless an explicit exception is introduced.
- Resolved: diff/edit cards use a 50-line inline cap.
- Resolved: search and diff cards inherit the shared inline-card rules unless explicitly overridden.
- Resolved direction: this seam is effectively design-locked; remaining work is to normalize wording, metadata tables, and terminology in planning docs.

## Open Questions / Uncertainties
- No major product-design questions remain for this seam.
- Remaining reconciliation/spec tasks:
  - write one normalized metadata table for terminal/search/diff cards
  - ensure terminology is consistent (`inline operation card`, `Open in Terminal`, search results view, editor diff open)
  - remove or rewrite stale earlier notes in downstream planning docs that still imply a separate activity strip, external terminal pop-out, or non-unified card behavior

## Packetization Notes
- Preserve concrete terminology, defaults, fallback behavior, and requested-vs-effective capability distinctions if they emerge.
- Track any provider/platform/environment differences that affect whether chat can expose terminal/tooling features.
- Preserve the distinction between:
  - one-shot `bash` tool invocations rendered inline,
  - search tools rendered inline,
  - shell-owned live terminal/output surfaces for longer sessions.
- Preserve confidence levels from web research:
  - high confidence: VS Code, JetBrains, OpenCode tool model, Cursor terminal permissions/sandboxing
  - lower confidence: Antigravity UI specifics, OpenCode desktop output-placement specifics beyond terminal-first integration
- Treat this seam as ready for reconciliation/spec integration once the normalized tables/terminology pass is written.

## Do-Not-Forget Details
- Capture user-visible behavior, not just backend capability.
- Track permission/safety boundaries if terminal/tool access is present.
- Watch for contradictions between chat-thread docs and broader GUI/runtime docs.
- Keep “panel pop-out” separate from “tool-result expansion” and “session handoff to terminal”; they are currently conflated in discussion but are different UX contracts.
- Distinguish:
  - inline expand/collapse
  - show canonical terminal/output
  - continue/background long-running command
  - detach/pop-out window
  as separate actions with separate state implications.
- Distinguish “mini terminal preview in chat” from “full terminal surface”; they are linked views over the same activity, not separate independent sessions.
- Keep failure presentation simple; status/meta already carry failure information, so avoid layering additional bespoke failure widgets unless another requirement emerges.
- Keep command-card placement inline with the assistant narrative; avoid moving terminal previews into a detached post-message activity region.
- Preserve narrative order: command happens inline, mini terminal shows it, then assistant summary/commentary can follow.
- Distinguish internal in-app terminal opening from true detached/external terminal behavior; the current preference is in-app only.
- If this becomes a generic operation-card model, keep the behavior consistent enough that users can predict it across terminal, search, and diff cards.
- Keep the card family coherent without forcing full action parity; copy is intentionally limited to terminal cards.
- Keep preview sizing consistent across terminal, search, and diff cards unless a later requirement forces divergence.
- Keep large diff previews bounded; current working assumption is a 50-item inline ceiling parallel to search results.
- Prefer line-based diff bounds over file/hunk counts; line counts are more predictable for users and easier to implement consistently in preview rendering.
