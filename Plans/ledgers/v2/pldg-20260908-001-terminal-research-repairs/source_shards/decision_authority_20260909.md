# September 9 owner-amendment authorization

Jared instructed on 2026-09-09: “Read /mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/NEXT_GOAL_BRIEF_20260909.md and Plans/Decision_Log.md entries DL-035 and DL-036. Set a bounded goal for its five deliverables in that order, following its rules, and get to work.”

This resumes this ledger for deliverable 1 only: land and independently review Section 15 and Release Supply Chain owner prose before any new engine/host PlanUnit compilation. The brief explicitly authorizes standard shard/index regeneration, timestamp-only cleanup outside edited docs, and immediate descriptive commits. Spec Lock/evidence/readiness sealing remains unauthorized. Later deliverables start only after this landing is verified, committed and reported.

## Canonical decision snapshot

### DL-035: Terminal research decisions — own engine, bundled console, and ten accepted proposals

Approved on 2026-09-09 by Jared in conversation. The source records the calendar date but not an exact UTC instant; this entry does not invent one. The proposals are the terminal research decision packet P1–P11 produced by the September 8 discovery-to-plan pilot (`PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md`). This grouped entry records exactly eleven dispositions:

- `P1 declined as proposed` — Puppet Master builds its own terminal engine and process host. The VT parser, grid and scrollback model, selection, command-block overlay, renderer adapter and PTY host are PM-owned code using operating-system APIs directly. No third-party terminal emulator, parser, or PTY-abstraction library is adopted into the engine. Leading terminals (Alacritty, WezTerm, Ghostty, kitty, foot, Windows Terminal, VS Code/xterm.js, JetBrains) remain reference subjects for research: study how they work, do not reuse their code. The R1/R2 conformance checklists retarget from candidate-core admission to acceptance criteria for PM's own engine and host.
- `P2 accepted for planning` — Puppet Master ships a PM-managed, version-pinned Windows console component package (ConPTY/OpenConsole) with verified installation and provenance, and an explicit, disclosed fallback to the operating-system copy when the bundle is absent, untrusted or incompatible. Version-dependent behavior remains disclosed through the host-provenance doctor (SMPFS-132). Bundling does not by itself widen supported Windows versions. Correction recorded later on 2026-09-09: the first recorded disposition was `declined as proposed` (use the OS-shipped ConPTY); Jared reversed it after reviewing the plain-language decision sheet. No other disposition changed.
- `P3 accepted for planning` — optional negotiated enhanced keyboard protocols behind a versioned capability profile.
- `P4 accepted for planning` — richer capability-gated shell context (continuation and right-prompt boundaries, rich shell properties) in the PM-owned parser.
- `P5 accepted for planning` — a provider snapshot adapter that classifies cumulative or rewritten output as append, complete snapshot, rolling snapshot, or final result.
- `P6 accepted for planning` — explicit, per-host, opt-in remote terminal compatibility setup (verified terminfo installation or a disclosed conservative profile).
- `P7 accepted for planning` — pane-local advisory command progress from OSC 9;4 with a deterministic collision rule.
- `P8 accepted for planning` — insert-without-execute and open-retained-output-in-editor actions on existing command cards.
- `P9 accepted for planning` — redacted environment provenance and pending-for-next-launch display tied to explicit session replacement.
- `P10 accepted for planning` — explicit live-pane input protection with a visible state.
- `P11 accepted for evaluation only` — an optional external multiplexer transport adapter may be evaluated for persistent remote shells; selection is held until compatibility with PM Server ownership is resolved, and any adoption must respect the P1/P2 direction that PM's engine and host remain PM-owned.

Section 15 owns the engine, host, protocol and parser decisions; FinalGUI owns visible terminal surfaces; UI Command Catalog and Wiring own new actions; Automated Testing owns acceptance fixtures; Server System owns remote ownership for P11; Settings owns any user-facing toggles. Acceptance authorizes planning those features as PlanUnits under their owners; implementation follows the existing Approve And Build path.

The separate synthetic Usage decision packet (`USAGE-D01`–`USAGE-D13`) concerns a synthetic test fixture, not live Puppet Master, and records no PM decision.

Negative constraints: no third-party emulator, parser, or PTY-abstraction crate in the engine or host; no unverified, unpinned or silently substituted Windows console components, and no undisclosed local fallback; no implementation, WorkNodes, or NodeSeeds from this record; P11 grants no daemon installation, credential authority, or selection; the synthetic Usage packet adopts nothing.

These dispositions authorize planning only. They do not land any owner amendment, prove runtime behavior, or seal governance.

SourceRef: `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md`; `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/evaluator/terminal-premium-decision-draft.md`; Jared, conversation of 2026-09-09.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Server_System.md, ContractName:Plans/Settings_System.md, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Contracts_V0.md


## Source identity

- NEXT_GOAL_BRIEF_20260909.md: SHA-256 `140c8128e3ff4b28c704e873cba69b4cb58fe80ba4f42952cbbaf0c4cdf06c75`; source `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/NEXT_GOAL_BRIEF_20260909.md`
- DECISIONS_PLAIN_20260909.md: SHA-256 `98c7c005b490904a33f1ec0ec88c6402db48f33ec7ce0cb82ee3d01cf87e7847`; source `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md`
- DECISIONS.md: SHA-256 `cd936baf930a4c04c971f56f4df84df3148e8206ddec1d3d2ce2b61c2985cba1`; source `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md`

Historical DECISIONS.md pending/adoption alternatives are source lineage. DL-035 and the answered plain-language sheet supersede their dispositions, including the same-day P2 correction. R1/R2 acceptance lines remain useful; no external library-specific algorithm, limit or timeout is imported.
