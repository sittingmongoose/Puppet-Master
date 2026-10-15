# Phase 11 — lever tests against the Sol 6.1 Max bar (2026-10-13)

Premium bar (Phase 10, same prompt as flash): Sol 6.1 Max discovery
33/53 matched, ~30 min/context; Astra 31/53. Every lever from
`PHASE10-LEVERS.md` and the three independent memos
(`reviews/levers-{astra,opus,sol}.md`) was tested where a decisive cheap
test exists; infrastructure levers are marked "build into Phase 12".
Evidence: sandbox `p11/`. Verdicts: ADOPT / ADOPT-WITH-ADJUDICATION /
WEAK / DEFER-TO-P12.

## Discovery levers

| Lever | Test | Result | Verdict |
|---|---|---|---|
| Angled prompts (mine #1) | 3 single-angle Goals: library long-tail (Luna, 21 headings), agent-donor (DeepSeek, ~47 headings), failure-first (GLM, 15 problems) | Each recovered its target blind-spot class: library angle found libtmt, tui-term, XTerm.NET, Avalonia, Godotty, pyte; donor angle found the agent-tool class (Claude Code, Codex, Cline, OpenCode, OpenHands + Aider, Goose, Crush, Amp, Devin, Conductor…); failure-first produced a problem-indexed list (backpressure, ConPTY, pastejacking, XOFF…) no product prompt generates | **ADOPT** — angles beat one generic prompt per model |
| Dry rounds (mine #2) | Round 2 with 102-item seen list (DeepSeek) | **41 more** relevant products (mintty, ConEmu, Tilix, Ptyxis, node-pty, Nushell…). Not dry; tail is long but relevance thins (components already covered via parents). Two dry rounds would need several more rounds | **ADOPT-WITH-CAP** — run to 1 dry round or fixed round budget; relevance-rank the tail host-side |
| Names-only sweep (Astra N6) | Luna, one-line format | 77 lines in ~8 min incl. Black Box, Guake, Mintty, MobaXterm, Hyper — cheap breadth layer feeding dossier stage | **ADOPT** as discovery stage 1 |
| Dependency graph (Opus N1, my #3 snowball) | Host crates.io reverse-deps for 4 crates | 74–635 dependents per crate; hundreds of candidate names no model listed (incl. egui/iced terms). Raw precision low — needs a relevance-filter slice | **ADOPT** as candidate generator + filter slice |
| Capture–recapture (Opus N2) | Lincoln–Petersen on list pairs | Estimates 58–80 vs observed universe 74+ (now ~115 after dry round): independence/homogeneity assumptions fail (famous-item correlation). Not a trustworthy completeness meter here | **WEAK** — prefer empirical dry-round curve |
| Requirement-indexed donors (Opus N3) | Not run standalone; donor-angle prompt partially covers it | — | DEFER-TO-P12 (fold into angle set) |

**Discovery bottom line vs bar:** angled union + dry rounds + depgraph
candidates plausibly exceeds one Sol context on breadth (universe now
>110 names vs Sol-base 40), at flash prices; what premium still does
better per context is *dossier depth per nominee*. The gap to close next
is relevance filtering of the long tail, not more nomination.

## Skeleton lever (the critical one)

Gold-free skeleton compiler (Opus N8 / Astra N1): two flash skeletons
written from brief+plan+records only, scored against the 21 elements of
the gold-informed skeleton (19 seed mutations + restore protocol +
oracle-independence rule):
- **Luna gold-free: 14/21** — including the two-raw-name collision seed
  (the Phase 4 trap) derived from its own records, with per-seed record
  citations. Missing: entry-removed seeds, manifest-text rewrite, wrong-
  exhibition restore, validates-but-unusable, interrupted retrieval,
  explicit restore-protocol steps.
- **DeepSeek gold-free: 9/21** by keyword (33 seeds, differently cut;
  keyword scoring understates it, but it misses the collision seed).
Verdict: **ADOPT-AND-ITERATE** — a flash-compiled skeleton recovers most
of the architecture without gold, but not all; the missing seeds are
exactly what adversaries + a second skeleton pass should add. The
Phase 12 run must use a compiled (never host-handwritten) skeleton.

## Critic / accuracy levers (retrospective, frozen candidates)

| Lever | Test | Result | Verdict |
|---|---|---|---|
| Acceptance-path hunter (mine #8; Sol top pick) | GLM over 7 candidates in ONE context | Found the real F12/F5 defect clusters, but **fabricated its F13 quotes** (copied F12's pre-repair sentences) and flagged 9 arguable owner-risk sentences in passing finals | **ADOPT-WITH-ADJUDICATION, one candidate per context** — multi-file contexts contaminate |
| Hunter calibration (Astra N7 / Opus N14 canaries) | Luna, single planted candidate (6 host-planted defects in F14) | **3/6 plants caught** (waiver, quote-word, version-transfer — with source proof), missed oxum-pass, %-transfer, helper-flip; +1 arguable new find, +1 false positive; quotes accurate this time | Useful pre-grade net, ~50% single-pass recall — panel of 2–3 hunters + adjudication, not a gate |
| Entailment audit (Opus N11) | Luna on F13 inventory claims vs T1/T3 | Correctly labeled the ME05 '%' claim **CONTRADICTED** with exact deciding lines; other claims ENTAILED with precise citations | **ADOPT** — cheapest strong accuracy lever tested |
| Contrast slices (Opus N5) | DeepSeek RFC↔impl on escaping | 20+ behaviors tabled; found divergences beyond ME05 (silent `*` acceptance, tagmanifest path escaping) with line citations | **ADOPT** wherever a spec+implementation pair exists |
| Differential adversary on repair diffs (Opus N12), decision IDs/blast radius (N10), proposed-artifact adversaries (N15) | Not run (time); repair-diff audit already host-practiced | — | DEFER-TO-P12 (build into loop) |

## Extraction levers

| Lever | Test | Result | Verdict |
|---|---|---|---|
| Quote-by-construction (mine #6) | GLM S2 re-run returning chunk IDs (124 host chunks) | 16 claims (vs 12 original), all 20 chunk refs resolvable, **caught checklist fact 6 that both Phase 9C shapes missed**; fabricated quotes impossible by construction | **ADOPT** — replaces quote-check stage |
| Overlapping slices (mine #7) | DeepSeek redo of Luna's S2 cell | 21 claims; hit all 4 S2 checklist facts incl. fact 6 Luna missed. Overlap = measurable completeness gain per cell | **ADOPT** for high-value cells |
| Uncited residue (Opus N4 = Astra N3 = Sol N2) | Luna slice on the barely-used profiles file | 41 claims, 34/42 quotes verbatim (misses = template-variable text) — a whole source file's content the 9C matrix never touched | **ADOPT** — residue sweep after question slices |
| Mechanical matrix (mine #14), slice auto-tuning (#13), model routing (#12), record cache (#11), premise-once store (Astra N2/Sol N1), section-parallel integration (Opus N9), release-membership oracle (Opus N6), executable slices (mine #10), speculative grading (Opus N16), shared-prefix (#16) | Not A/B-tested this phase | Premise-once + mechanical matrix + record cache are build items for the Phase 12 harness; routing/auto-tuning need the standing A/B harness (mine #15) to measure | DEFER-TO-P12 as build list |

## Phase 12 design (what the evidence now supports)

Pre-registered, held-out briefs; discovery = names-only sweep → angled
prompts → dry rounds (capped) → depgraph candidates, union host-deduped;
host pin/cache; mechanical slice matrix + quote-by-construction +
overlap on critical cells + residue sweep; **flash-compiled skeleton**
(no gold anywhere upstream of grading); flash critic panel (hunters,
entailment, adversaries — one file per context) driving bounded repairs
with a fixed budget; premium used once, held-out, as final grader —
plus a Sol premium arm on identical inputs as the bar. Every prompt,
hash and timing archived; same-model wall-time/output recorded per
Jared's cost framing.
