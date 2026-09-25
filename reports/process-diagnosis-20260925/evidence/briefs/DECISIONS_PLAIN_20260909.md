# Terminal decisions, in plain language — with Jared's answers (2026-09-09)

This is the human-readable companion to `DECISIONS.md`. Same eleven decisions, same evidence, written so that a person can decide without decoding lead IDs or owner codes. Jared's dispositions are recorded canonically in `Plans/Decision_Log.md` as DL-035.

**What the answers mean.** *Declined as proposed* means the question was real but the answer is a different direction, stated below. *Accepted for planning* means the feature may now be written into the Plans as PlanUnits under its owner. It does not mean build it: building still goes through Approve And Build. *Accepted for evaluation only* means investigate and report back; nothing is selected.

**Overall direction from Jared.** Build our own terminal. Do not depend on other people's terminal code. Keep studying the best terminals to learn how they work. Bundling Microsoft's console layer (P2) is a deployment choice, not engine code, and is accepted.

---

## 1. Which terminal engine to use — DECLINED AS PROPOSED: build our own

**The question.** Should Puppet Master adopt an existing terminal engine (the proposal favored Alacritty's core, with WezTerm, Ghostty's library, and others as alternatives), or build its own?

**Why it came up.** Every terminal we studied is built on a reusable core: a parser that understands the escape codes programs emit, a grid that holds the screen and scrollback, and a renderer. Reusing one saves months and inherits years of bug fixes.

**What reuse would get you.** Proven handling of thousands of edge cases: wide characters, reflow on resize, obscure escape sequences, performance under huge output.

**What reuse would cost.** A dependency on someone else's roadmap, license and API changes; an adapter layer to fit PM's model of command cards, movable panes and recovery; and code you cannot fully own or reshape.

**Jared's answer.** Build our own engine and process host. Use the operating system's APIs directly. Do not adopt third-party terminal emulator, parser, or PTY-wrapper libraries. Keep studying Alacritty, WezTerm, Ghostty, kitty, foot, Windows Terminal, VS Code's terminal and JetBrains' terminal to learn how they solve problems, and write our own.

**What this means next.** Section 15 gets an owner amendment stating this direction. The two conformance checklists from the research (R1 rendering fidelity, R2 process-host safety) become acceptance criteria for our own engine rather than tests for admitting someone else's. Honest cost note: a conformant engine is a multi-month build, and the Plans already contain the acceptance matrix it must pass (SMPFS-124, 129, 130, 133), so this closes an open choice rather than adding requirements.

## 2. Whether to ship our own copy of Windows' console layer — ACCEPTED FOR PLANNING: bundle (reversed later the same day)

**The question.** On Windows, terminals talk to programs through ConPTY, a component of the operating system. Windows Terminal and VS Code bundle their own pinned copy so behavior is the same on every machine. Should PM do that too?

**Why it came up.** ConPTY behavior varies by Windows version: resize handling, Unicode, and teardown differ. A bundled copy makes those predictable.

**What bundling would get you.** Reproducible behavior and the ability to fix a bug without waiting for a Windows update.

**What bundling would cost.** Shipping and updating Microsoft binaries, verifying their provenance, and maintaining a compatibility matrix.

**Jared's answer.** Bundle. Ship a PM-managed, version-pinned copy of the Windows console layer with verified provenance, and fall back explicitly to the operating system's copy when the bundle is absent or incompatible. This reverses the first answer given earlier on 2026-09-09, which was "do not bundle"; reading the question in plain language is what changed it.

**What this means next.** Section 15 and Release Supply Chain get owner amendments. Acceptance covers absent, untrusted or incompatible components, console creation failure, the resize, Unicode and teardown matrices, and failed update with rollback. Bundling does not by itself widen the supported Windows versions.

## 3. Support the newer keyboard protocol — ACCEPTED FOR PLANNING

**The question.** Should PM support the enhanced keyboard protocol that kitty introduced and several terminals now offer, which lets programs distinguish key combinations the old protocol cannot?

**Why it came up.** Modern terminal programs (editors, TUIs) increasingly ask for it. Without it, some shortcuts are ambiguous or lost.

**What you'd get.** Precise modifier and key handling, and a clear capability disclosure to programs.

**What it costs.** A negotiation and state stack to implement and test across local, Windows, SSH and tmux paths, plus risk of keyboard and IME regressions. Whether the GUI toolkit exposes the needed key fields end to end is still an open feasibility check.

**Options.** Keep the legacy input profile and report unsupported keys honestly; support a selected subset; or implement fully after conformance evidence. Image protocols are a separate decision and are not included.

**Jared's answer.** Accepted for planning.

## 4. Understand more of what the shell is doing — ACCEPTED FOR PLANNING

**The question.** Should PM's parser understand richer shell signals: where a multi-line command continues, where a right-side prompt sits, and extra shell properties?

**Why it came up.** Command cards depend on knowing where a command starts and ends. Custom prompts and multi-line input confuse the basic markers.

**What you'd get.** Clearer command boundaries and consistent replay after reconnect.

**What it costs.** More parser work and more metadata to store and scrub. Reporting the shell's environment is a separate scope question because it widens what sensitive data PM collects.

**Options.** A small extension of our own parser, or a broader shared shell-capability implementation, compared on the same byte-stream fixtures.

**Jared's answer.** Accepted for planning, within the PM-owned parser.

## 5. Handle tools that rewrite their output instead of appending — ACCEPTED FOR PLANNING

**The question.** Some agent and provider tools resend their whole output, or a rolling window of it, rather than appending. Should PM classify those updates so a repeated preview is never mistaken for a transcript?

**Why it came up.** Text stitching heuristics falsely join repeated text. Providers that resend cumulative output need an explicit rule.

**What you'd get.** Truthful transcripts: updates are classified as append, full snapshot, rolling snapshot, or final result, preferring provider-supplied offsets or revisions.

**What it costs.** A provider-specific contract, revision identity, bounded retention, and consistent display in Chat and Output. Keeping old snapshot versions is a separate retention choice.

**Jared's answer.** Accepted for planning. This approves no particular provider integration.

## 6. Help remote hosts understand our terminal — ACCEPTED FOR PLANNING

**The question.** When a user SSHes into a host that has never heard of PM's terminal type, keys and colors can break. Should PM offer to install its terminal description on that host, or fall back to a conservative, disclosed profile?

**Why it came up.** Ghostty and others ship this as an opt-in step; it is a common first-run failure for new terminals.

**What you'd get.** Fewer remote key and color failures.

**What it costs.** Writing to remote hosts, per-host authorization, verifying what was installed, and maintaining compatibility. Shell overrides risk interfering with the user's setup.

**Options.** Per-host verified install; a disclosed conservative profile; or no feature, with capabilities honestly reported as unsupported.

**Jared's answer.** Accepted for planning. Declining on a host must leave ordinary SSH untouched.

## 7. Show progress for long-running commands — ACCEPTED FOR PLANNING

**The question.** Programs can emit a progress signal (OSC 9;4). PM already recognizes it; should PM display it per pane and define what happens when progress and notifications collide?

**What you'd get.** Useful feedback on long commands without polling.

**What it costs.** Attribution to the right command and session, accessibility, and handling of stale or spoofed output. Progress can never be treated as proof a command finished.

**Options.** Show an indicator; keep diagnostics only; or define notifications separately. Taskbar and dock aggregation is out of scope.

**Jared's answer.** Accepted for planning.

## 8. Reuse a past command safely, and open its output in the editor — ACCEPTED FOR PLANNING

**The question.** Should command cards gain two actions: put a past command on the prompt without running it, and open a command's retained output in the editor?

**Why it came up.** VS Code's shell integration offers both, and they reduce accidental reruns.

**What you'd get.** Command reuse and output inspection with less risk.

**What it costs.** Trustworthy command text, exact working-directory and remote identity, coherent retained output, and catalog and wiring entries. Importing shell history files is excluded.

**Jared's answer.** Accepted for planning. Insertion sends no Enter; unavailable output is never reconstructed.

## 9. Show where a terminal's environment came from — ACCEPTED FOR PLANNING

**The question.** Should PM show which layers set a terminal's environment (system, profile, project, PM itself) and which changes will apply only on the next launch?

**Why it came up.** "Why is my PATH different in here?" is a perennial support question, and PM's settings can change a launch snapshot without restarting the live session.

**What you'd get.** An explanation instead of a surprise, tied to an explicit restart.

**What it costs.** Provenance tracking, redaction of secrets in diagnostics, and more retained metadata. Automatic relaunch and extra environment collection are separate decisions.

**Jared's answer.** Accepted for planning. Unknown provenance stays unknown; nothing mutates a live session.

## 10. Lock a pane so you cannot type into it by accident — ACCEPTED FOR PLANNING

**The question.** Should a pane offer an explicit input lock, with a visible state, while its output keeps flowing?

**Why it came up.** Windows Terminal offers this for monitoring panes; typing into a log viewer by mistake is common.

**What you'd get.** Safer monitoring panes.

**What it costs.** Input-router work, a decision about whether agents' input is also blocked, accessibility, and whether the lock persists.

**Jared's answer.** Accepted for planning. Lock is idempotent; output continues; unlock retains the same session.

## 11. Whether to connect to an external multiplexer for persistent remote shells — ACCEPTED FOR EVALUATION ONLY

**The question.** Should PM be able to attach to a WezTerm-style multiplexer daemon on a remote host so shells survive disconnects?

**Why it came up.** Persistent remote sessions are a real need; WezTerm's mux protocol already solves it.

**What you'd get.** Remote shells that survive network loss behind PM's own presentation.

**What it costs.** Depending on an external daemon and its version skew, credentials, handshake, and reconciling ownership with PM's own Server model.

**Jared's answer.** Accepted for evaluation only, as proposed. Note the tension with the own-code direction in decision 1: attaching to someone else's daemon is integration, not code reuse, but any adoption must keep PM's engine and host PM-owned. Selection is held until PM Server compatibility is resolved.

---

## Not a decision: the synthetic Usage packet

The thirteen "USAGE-D" items concern a made-up test plan used to measure the research process. They are not Puppet Master decisions and nothing is adopted from them.

## Format going forward

Every decision brought to Jared should read like the entries above, in this order: a plain name; the question in one sentence; why it came up; what you'd get; what it costs; the options; the recommendation if there is one; then a blank line for the answer. Lead IDs, owner codes, source hashes and job numbers belong in a footnote or the technical companion, not in the body.

## How this works in production Puppet Master

This sheet is the bootstrap and audit form. In the product, the same packet is handed to the user in chat as an artifact holding every item. Each item is then presented one at a time in the chat window as a card built from the same fields, and the user answers each with one of four responses: Approve, Deny, Deny with changes, or Ask a question. The user can open the full artifact at any time while answering. The cards reuse the planned questionnaire mechanism (`assistant-chat-design.md` section 7.4) with more information per item and this different set of responses. Status is shown with text labels only: no colored border bars, no emoji. Recorded as DL-036.
