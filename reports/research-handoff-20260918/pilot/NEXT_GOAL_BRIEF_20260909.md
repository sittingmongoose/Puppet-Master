# Next goal for the research-audit agent (2026-09-09)

Written by Jared's reviewer after the bounded pilot closed. Everything below is grounded in the Decision Log and the pilot's own evidence. Read `Plans/Decision_Log.md` entries DL-035 and DL-036 before starting; they are the authority for the product direction here.

## What changed since your status report

**Decisions are answered.** Jared reviewed the eleven terminal proposals in plain-language form (`DECISIONS_PLAIN_20260909.md`) and answered all of them. Recorded as DL-035:

- P1 declined as proposed. Puppet Master builds its own terminal engine and process host on operating-system APIs. No third-party emulator, parser or PTY-abstraction library in the engine. Alacritty, WezTerm, Ghostty, kitty, foot, Windows Terminal, VS Code's terminal and JetBrains' terminal remain reference subjects: study how they work, do not reuse their code. R1 and R2 become acceptance criteria for our own engine and host.
- P2 accepted for planning, corrected later the same day. Ship a PM-managed, version-pinned Windows console component package with verified provenance and a disclosed fallback to the OS copy. The first answer was "do not bundle"; reading the plain-language sheet reversed it.
- P3 through P10 accepted for planning as PlanUnits under their owners.
- P11 accepted for evaluation only. Selection held until PM Server ownership compatibility is resolved.
- The synthetic Usage packet records no PM decision.

**The production review flow is decided.** DL-036 records how research and audit decisions reach the user in the product: the packet is handed to the user in chat as an artifact holding every item; each item is then presented one at a time as a plain-language decision card answered with exactly one of Approve, Deny, Deny with changes, or Ask a question; the full artifact stays openable; dispositions persist and are never re-asked; text status labels only, no colored border bars, no emoji. It reuses the question card and questionnaire mechanism in `assistant-chat-design.md` section 7.4 with more information per item and this fixed response set. This is the "research-to-feature-review integration" your status report listed as unspecified. It is now specified at the decision level and needs PlanUnits.

**Commit hygiene.** Your September 8 landings were swept into two unrelated commits by a concurrent session (64ee916416 and 08e3bc43be). Git notes and the tag `terminal-research-repairs-2026-09-08` now describe them, and the checker script is committed as 76736ecdc6. From now on, commit each landing yourself, immediately after verification, with a message that says what landed. Do not leave verified Plans edits uncommitted.

**Format.** `DECISIONS_PLAIN_20260909.md` is the template for every future decision packet: plain name, the question in one sentence, why it came up, what you get, what it costs, options, recommendation, blank for the answer. Lead IDs, owner codes, hashes and job numbers go in a footnote or the technical companion. Jared approved this form for bootstrap and audit use.

## The goal

Turn the answered decisions into Plans, and make the research workflow finish its comparison stage. Five deliverables, in this order. Each one is landed, verified, committed with a descriptive message, and reported in one paragraph before the next starts.

1. **Section 15 and Release Supply Chain owner amendments for P1 and P2.** State the PM-owned engine and process host direction, and the bundled, version-pinned console package policy with disclosed OS fallback. Retarget R1 and R2 from candidate-core admission to acceptance criteria for PM's own engine and host. Use the same ledger path and independent review as the September 8 repairs. DL-035's acceptance criteria require this before any engine or host PlanUnit is compiled.

2. **PlanUnits for P3 through P10, and an evaluation task for P11.** Owners: Section 15 for protocol, parser and host behavior; FinalGUI for visible surfaces; UI Command Catalog and Wiring for new actions; Automated Testing for fixtures; Settings for toggles; Server System for P11's ownership question. Take each PlanUnit's acceptance criteria from the acceptance lines already in `DECISIONS.md`. Use the plain-language sheet as the record of user intent and DL-035 as authority. Planning only: no WorkNodes, no NodeSeeds.

3. **PlanUnits for DL-036.** Assistant Chat: the artifact hand-off, the decision card fields, the four responses, the "Ask a question" round trip, and the questionnaire reuse with one-at-a-time presentation as this flow's rule. Planning Wizard: where the flow sits in a planning run and how dispositions feed topics, amendments and Approve And Build. Contracts: the typed envelope. Storage: disposition persistence and the never-re-ask rule. Command Catalog and Wiring: commands. Visual rules are negative constraints: no colored border bars or stripes, no emoji glyphs.

4. **One live run of the stable workflow whose comparison stage completes.** Every comparison job in all four pilot arms timed out at 360 seconds, so the 7.5 of 8 scores came from partial reports and the transport fix has offline evidence only. Run `discovery_to_plan.py` once, live, with a job allowance sized so comparison finishes, on a thin case in a domain where the model's prior knowledge is weak, not Usage. Report: known issues recovered, additional useful discoveries, unsupported conclusions, lost findings between stages, decisions produced, findings landed, and one cost line.

5. **A second reference set from git.** Section 15 at June 11 (f46b0de9b2, 989 lines, 2 units) against July 4 (75cc6d64a1, 9,212 lines, 274 units). Classify each added obligation as necessary correction, optional capability, or product decision, as you proposed. Keep it out of researcher inputs.

## Rules for this goal

- Commit your own landings, immediately, with descriptive messages.
- Time-box workflow changes. Done for deliverable 4 is a live run whose comparison stage completes, not a test count.
- One cost line per report. Link detailed accounting; do not inline it.
- After any Plans edit, regenerate `Plans/_shards` and `Plans/.plan_index` with the standard scripts and revert timestamp-only noise outside the edited documents. Do not reseal Spec Lock, evidence or readiness artifacts without instruction. Report gate state in one line.
- One campaign at a time.
- Bring any new product decision in the plain-language form. Do not re-ask anything answered in DL-035 or DL-036.
- Findings landed is the terminal metric. Report it first.
