# Deliverable 2 accepted terminal feature planning

Authority: Plans/Decision_Log.md DL-035. The prerequisite owner amendments landed in commit 93df5c0175abe7fb0fb12e47ff63c2ccde5c3a3d and were verified, committed and reported before this deliverable began. P3–P10 are accepted for planning; P11 is evaluation-only with selection held for PM Server ownership compatibility. Historical pending headers in the original proposal reports are superseded. No implementation, WorkNodes or NodeSeeds.

## User intent, answered plain-language sheet

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


## Acceptance evidence

# Decision drafts and historical dispositions

**Product choices remain pending; supported repairs have separate landing proof.** Root accepted the [independent v1 review](evaluator/v1-comparison-review.md): R1/R2 are conditional candidate-conformance checklists, not demonstrated missing canonical requirements; P1/P2 require measurement, compatibility and license evidence before selection. They preserve proposals from the v1 warmup's [J0005 comparison](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md), whose native outcome was timeout despite a useful report. This is warmup evidence, separate from the amended [v4 trial](TRANSPORT_AMENDMENT.md). P3–P5 preserve three supported terminal/hybrid proposals. The [incomplete terminal/premium audit](evaluator/terminal-current-premium-v4-final-review.md) adds evidence to existing options and six conditional decision directions P6–P11; these are neither newly proven missing capabilities nor a yield count. Both bounded Usage attempts are closed, with a separate synthetic decision packet below. The original P1/P2/R1/R2 entries retain **L-9b450b5ab3e0**; these local labels are not four new leads. The bounded reviews do not certify every source, approve choices, or establish runtime acceptance. O/C/T/H/D references identify the warmup report's owner/consumer table.

## P3 — Optional enhanced terminal protocols

**Pending; neither approved nor landed.** Review a versioned capability profile with optional negotiated kitty keyboard enhancements. Alternatives are the current legacy input profile with honest unsupported results, selected enhancements, or a fuller implementation after conformance evidence. Image protocols remain an independent decision; keyboard adoption would not approve images.

Benefit: more precise modified-key handling and capability disclosure. Dependencies: selected engine, input encoder, shortcut ownership and tested local/Windows/SSH/tmux paths. Tradeoffs: compatibility gains versus negotiation/state-stack complexity and keyboard/IME regressions; image support adds separate decoding, memory and retention work. Acceptance includes non-mutating queries, bounded push/pop, independent normal/alternate stacks, chunk boundaries, reset/crash behavior and one owner per input. Source and exact alternatives: [J9 proposal](runs/terminal-current-hybrid-v4/jobs/J0009-compare/workspace/notes.md), **L-5746f5c667fd**. Existing protocol acceptance is covered; this is a specific optional extension, not a missing generic terminal capability.

Premium's **L-ae203bd99176** adds the same Kitty direction; the late input-path topic, embedded **L-c91a7e42d803** / registry **L-32d391838063**, adds an end-to-end host/toolkit feasibility prerequisite. Core support does not prove pinned Slint/platform field availability. [Consolidation and sources](evaluator/terminal-premium-decision-draft.md) retain the uncertain probe without asserting a Slint defect.

## P4 — Richer shell context and parser implementation

**Pending; neither approved nor landed.** Review capability-gated continuation/right-prompt boundaries and rich shell properties. Compare a minimal parser extension with a shared shell-capability implementation against the same byte-stream fixtures. Environment reporting is a separate scope decision because it broadens sensitive metadata intake.

Benefit: clearer multiline/custom-prompt boundaries and consistent replay. Dependencies: authoritative shell observations, protocol versions, source-qualified metadata and bounded scrubbed storage. Tradeoffs: a small parser adds less dependency weight but duplicates semantics; a shared implementation may reduce drift while adding integration assumptions. Acceptance includes chunk splitting, output before completion, malformed/forged sequences, nested prompts and consistent local/remote/replayed projections. [J13 proposal](runs/terminal-current-hybrid-v4/jobs/J0013-compare/workspace/notes.md), file-local **L-0691010de814**, registry **L-5f393eabe4ff**. Existing lifecycle ordering is already required.

## P5 — Conditional provider snapshot adapter

**Pending; neither approved nor landed.** If PM admits a provider with cumulative or rewritten output, classify updates as append, complete snapshot, rolling/truncated snapshot or final result. Prefer provider offsets/revisions. Without them, one bounded snapshot with disclosed uncertain continuity is a concrete alternative to heuristic text stitching. Keeping multiple snapshot versions is a separate retention decision.

Benefit: prevents repeated or rewritten output from masquerading as an exact transcript. Dependencies: a particular provider contract, invocation/revision identity, settlement, bounded retention and consistent Chat/Output projection. Tradeoffs: snapshot replacement loses earlier preview history; version retention costs storage; stitching can falsely join repeated text. Acceptance includes repeated motifs, shorter rewrites, no overlap, duplicate/late updates, a different final preview and concurrent readers. [J13 proposal](runs/terminal-current-hybrid-v4/jobs/J0013-compare/workspace/notes.md), file-local **L-1703bf453a12**, registry **L-6b1455da4870**. This approves no provider integration and grants no PTY authority to output-only work.

The [bounded hybrid review](evaluator/terminal-current-hybrid-v4-final-review.md) supports these as three material proposals, not three adopted features. The tool-invocation/block association recommendation remains an additional design clarification whose necessity is unresolved. Late research directions and placeholders remain retained in their source reports.

## P1 — Engine and driver selection

**Status: pending product decision; neither approved nor landed.** The warmup's proposed evaluation preference is pinned `alacritty_terminal` Term/vte behind PM's model boundary with a PM-owned renderer/logical-selection adapter; review the supplied loop versus a PM process-host driver separately. Alternatives include wezterm-term, libghostty-vt with host rendering/shaping still required, portable-pty as a complementary process layer, termwiz/parser-only integration, or retaining an unselected core. Neither a PTY layer nor termwiz escape decoding supplies a terminal emulator. The inspected development commit is evidence, not a shipping recommendation.

Benefit: reuse established terminal machinery. Dependencies/tradeoffs: revision/license/API maintenance, Host/Server ownership, Slint integration, logical-history mapping and R1/R2 gates; custom drivers add response/timeout/lifecycle work. No measured speedup is claimed. Acceptance: supported-platform rendering/fallback, IME/accessibility/input, command metadata, and one/multiple-pane latency, memory, lock, flush and cancellation measurements. Owners: Section15 O3–O6, FinalGUI C2, Storage C3, ATS T1, Server H2, Supply Chain D1. Evidence: S00018–23, S00063–65, S00075, S00100–101; [full P1](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#p1--reviewable-proposal-adopt-an-alacritty-engine-adapter-with-driver-choice-explicit).

Premium [candidate evidence](evaluator/terminal-premium-decision-draft.md) adds **L-cc82a3bfe171**, **L-bf66679ef7aa**, and **L-e88369c1c852** to this same choice. Renderer/cache and packed-scrollback ideas remain optional experiments under the existing fidelity/storage obligations. No benchmark win, remote screen-delta protocol, image admission or text-loss policy is implied.

## P2 — Windows console deployment

**Status: pending product decision, independent of P1; neither approved nor landed.** Evaluate PM-managed, version-pinned ConPTY components with verified installation/provenance and explicit OS fallback; alternatives are OS-only or explicit external installation. Package publication does not prove a compatible binary pair or authorize broader OS support.

Benefit: reproducible, independently serviceable behavior. Dependencies/tradeoffs: verified layout/exports/architectures, release ownership, footprint, compatibility matrix and rollback. Acceptance: absent/untrusted/incompatible components, creation failure, resize/Unicode and teardown matrices, failed update/rollback; no backend hot-swap or command replay. Owners: Section15 O6/SMPFS-132, Supply Chain/Shared Runtime D1, Storage C3, ATS T1. Evidence: S00022, S00032–33, S00037, S00073, S00078; [full P2](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#p2--reviewable-proposal-pin-and-own-windows-console-deployment).

## P6–P11 — Additional conditional directions from the stopped premium run

**All remain unapproved and unlanded.** The [concrete decision packet](evaluator/terminal-premium-decision-draft.md) supplies each choice's benefit, dependencies, downsides, alternatives, acceptance evidence, exact lead IDs and source-report links. This table preserves navigation; it does not add executable work or treat a proposal as a proven omission.

| ID | Choice to review | Boundary |
| --- | --- | --- |
| P6 | Explicit remote terminfo installation or a disclosed conservative terminal profile | Per-host authorization and verified capabilities; preserve ordinary SSH when declined. |
| P7 | Pane-local advisory OSC progress and collision policy | Cannot establish command/Goal completion; taskbar aggregation is outside this choice. |
| P8 | Insert a retained command without execution; open retained output in an editor | No shell-history import or automatic execution; coherent backing and source identity remain required. |
| P9 | Redacted environment provenance and pending-for-next-launch display | Unknown provenance stays unknown; no automatic relaunch or added collection authority. |
| P10 | Explicit live-pane input protection | Output continues; agent-input scope and persistence remain product choices. |
| P11 | Evaluate an optional external mux transport adapter | Hold selection until compatibility with PM Server ownership is resolved; no automatic daemon installation. |

The action-palette repair is excluded: FinalGUI F3-413 already requires terminal-action parity. Startup/teardown, whole-input-path feasibility and byte-flow accounting remain existing-contract refinements. Duplicate children, unresolved probes and unrun comparisons remain in the audit rather than becoming extra decisions.

## R1 — Conditional candidate-conformance checklist: adapter fidelity

**Status: reviewed conditional checklist under P1; not approved or landed.** Existing owner obligations are already present; a future implementation packet may bind these checks without a canonical amendment. Preserve existing PM contracts while validating effective geometry, surviving logical selections, coherent snapshots/damage, overlay invalidation, parser/response continuity and faithful text/defaults. This does not select an engine or relax fidelity.

Benefit: avoid corrupt copy/rendering and invalid resize calls. Dependencies/tradeoffs: adapter bookkeeping, bounded text associations and differential/native testing. Acceptance: 0/1/2-column wide-character transitions, exact surviving copy, full-versus-damage rendering, synchronized-update boundaries and explicit degradation. Owners: Section15 O3–O5, ATS-022 T1, FinalGUI C2, Chat C1, Storage C3, Catalog C4. Evidence: S00021–23, S00035, S00063–65; [full R1](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#r1--concrete-repair-admit-the-core-through-a-pm-fidelity-adapter).

## R2 — Conditional candidate-conformance checklist: process host

**Status: reviewed conditional checklist; not approved or landed.** This is candidate admission work, not a demonstrated missing host-safety requirement. Contain spawn/resize failures, clean partial resources, validate cwd at execution, preserve buffered progress, distinguish exit/drain/retention/closure, and retain the responsible reader across shutdown. Candidate lost-wakeup and versioned teardown behavior still require reproduction.

Benefit: prevent crashes, wrong-directory execution, stalls and false completion. Dependencies/tradeoffs: supervision, backend provenance, schema admission and costly native failure/version matrices. Acceptance: error injection, cwd race, barrier-controlled wakeup, sustained output, versioned teardown and Client-independent Server continuity. Owners: Section15 O4/O5, ATS T1, Chat C1, Catalog/Wiring C4/C6, Storage C3, Runtime/Server H1/H2. Evidence: S00022–23, S00033–34, S00036, S00062, S00077, S00102; [full R2](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#r2--concrete-repair-process-host-errors-progress-and-shutdown-are-independent-contracts).




### P6 — Explicit remote terminal compatibility setup

**Unapproved.** Offer per-authenticated-host verified terminfo installation or a tested, disclosed conservative TERM profile, preserving unchanged SSH when declined or unavailable. Benefit: fewer remote key/color/capability failures. Costs/dependencies: remote writes, trust/permission checks, exact environment identity, terminfo provenance and continuing compatibility maintenance; shell overrides risk interference. Alternative: no setup feature, with honest unsupported capabilities. Acceptance: denied/read-only/no-tic hosts, failed transfer, host change and nested SSH/mux; effective advertised capabilities match actual behavior, failed setup does not launch locally. No universal ssh override or silent TERM substitution.

Provenance: J7/J9 **L-4175fac24158**, J9 S00044:125–142, Ghostty 1.2 notes as summarized in [J9](../runs/terminal-current-premium-v4/jobs/J0009-compare/workspace/notes.md). Opt-in/work-in-progress upstream behavior supports evaluating the choice, not its reliability in PM.

### P7 — Pane-local advisory terminal progress

**Unapproved.** Project already-recognized OSC 9;4 as pane-local advisory progress and choose a deterministic progress/notification collision rule. Benefit: useful long-command feedback. Costs/dependencies: parser projection, trustworthy command/session attribution, accessibility and stale/spoofed-output handling. Alternative: retain capability diagnostics without a graphical indicator or keep notification behavior independently defined. Acceptance: malformed/out-of-range/colliding sequences, opaque boundaries, late old-command updates, detach/replacement and conflict with real exit. Only authoritative boundaries clear/rebind command attribution; opaque sessions stay explicitly advisory. OSC success cannot complete a command, Goal or work record. Taskbar/dock aggregation is outside this choice.

Provenance: J7/J9 **L-4175fac24158**, J9 S00044:192–217, [J9](../runs/terminal-current-premium-v4/jobs/J0009-compare/workspace/notes.md). SMPFS-124 already covers protocol fixtures; neither parser recognition nor generic progress truth is new.

### P8 — Safe command reuse and retained-output editor actions

**Unapproved.** Add explicit insert-without-execution and open-retained-output-in-editor actions to existing command history/cards; a new picker is optional presentation, not a prerequisite. Benefit: command reuse and output inspection with fewer accidental reruns. Costs/dependencies: trustworthy command text, current execution authorization, exact cwd/worktree/remote identity, coherent retained backing, catalog/wiring and accessible UI. Alternative: keep current copy/reveal/rerun surfaces; current-session-only scope avoids shell-history import. Acceptance: insertion sends no Enter and executes nothing, unavailable output is not reconstructed, partial output is labeled, and editor routing preserves source identity. Shell-file import, retention expansion and specific quick-fix automation require separate decisions and are excluded.

Provenance: J10/J11 **L-12318245bed6**, J11 S00027:504–543,565–581, VS Code shell integration summarized in [J11](../runs/terminal-current-premium-v4/jobs/J0011-compare/workspace/notes.md). Existing Output/Problems/Ports ownership and provenance are already covered.

### P9 — Redacted environment provenance and pending-change display

**Unapproved.** Show available environment source layers and pending-for-next-launch changes, linked to explicit session replacement. Benefit: explains PATH/profile discrepancies without surprise restart. Costs/dependencies: resolver provenance, secure summary refs, Settings/storage ownership and platform-specific incomplete attribution; more retained metadata and UI complexity. Alternative: show only the existing effective profile/cwd. Acceptance: unknown provenance remains unknown, secrets are absent from default diagnostics, changes do not mutate a live session's launch snapshot, and explicit restart creates a new session. Automatic safe relaunch and additional environment collection remain separate decisions; this display grants neither.

Provenance: J10/J11 **L-775a21ac31f1**, J11 S00028:421–475,547–609, VS Code advanced terminal summarized in [J11](../runs/terminal-current-premium-v4/jobs/J0011-compare/workspace/notes.md). Existing effective-state, routing and clear/restart policies remain conformance obligations. Coordinate additional shell-property intake with P4 if requested.

### P10 — Optional live-pane input protection

**Unapproved.** Provide explicit idempotent enable/disable actions and a visible input-protection state while output continues. Benefit: avoids accidental input to monitoring panes. Costs/dependencies: input router, agent-input scope, accessibility, catalog/wiring and a still-open persistence/scope decision. Alternative: existing focus discipline; historical review-only is not protection for a live process. Acceptance: repeated enable stays enabled, guarded typing/paste cannot reach the child, output keeps draining, unlock retains the exact session, and close follows the selected confirmation policy without implying suspension. No arbitrary pane trees or new group/zoom features are included.

Provenance: J10 **L-98daa34e3284**, S00033:30–82,119–150, Windows Terminal panes summarized in [J10](../runs/terminal-current-premium-v4/jobs/J0010-compare/workspace/notes.md). J11 leaves this lead unresolved; that is not a second confirmation or rejection.

### P11 — Optional external mux transport evaluation

**Unapproved; hold selection until PM Server topology compatibility is resolved.** Evaluate a WezTerm mux adapter within the existing PM session/process-host service, requiring a compatible remote daemon. Benefit: persistent remote shells behind native PM presentation. Costs/dependencies: daemon installation/version skew, protocol handshake, credentials, exact host/session/cursor identity and reconciliation with PM Server ownership. Alternatives: plain SSH or PM-owned Server transport; this is distinct from P1's local PTY driver comparison. Acceptance: actionable version mismatch, reconnect without duplicate shells, no silent local fallback, supported-host lifetime ownership and separate WSL2 tests. No daemon auto-install, new credential authority or predictive echo.

Provenance: J10 **L-07475e18efa1**, S00032:739–791,839–868,893–934, WezTerm multiplexing summarized in [J10](../runs/terminal-current-premium-v4/jobs/J0010-compare/workspace/notes.md). The upstream evolving/compatible-daemon qualifications remain; J11 did not complete this comparison.



## Current scope qualification

Richer environment collection, snapshot version retention, shell-history import, taskbar/dock progress aggregation and actual external mux adoption are excluded or held. P10 agent-input scope and persistence were explicitly unresolved by the original accepted proposal; two plain-form questions were presented to Jared during this deliverable. Neither feature approval nor implementation authority is re-asked.

## User correction during compilation — exact-session persistence

On 2026-09-09 Jared answered the persistence question: **Keep for the same session**. The question explicitly offered exact live-session retention including reconnect with a replacement starting unlocked. This answer adopts that policy; it does not choose the still-pending agent-input scope.
