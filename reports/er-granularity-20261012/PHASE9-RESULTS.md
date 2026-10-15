# Phase 9 — wide-net discovery, host pin/cache, MRI-sliced extraction (2026-10-13)

> **Corrections (Phase 10 reviews, host-verified):** the fact both 9C shapes
> missed is in prose (terminal-shell-integration.md:139), not alt-text-only;
> six question-slices do not tile the three whole documents; strict monolith
> score 20/24; "union competitive with one premium pass" is superseded by
> the same-prompt baselines in PHASE10-BASELINES-REVIEWS.md.

Motivation (Jared): the Phase 8 passes were given the topic and the source
bundle, which cannot test unknown-unknowns; discovery must cast a wide net
(category competitors AND feature donors), sources should be fetched/pinned
once into a shared cache reusable across topics, and narrow prompts are
fine only as many MRI-style slices that demonstrably tile the picture.
Fresh topic: embedded terminal for a Rust/Slint agent-orchestration app
(`case3/brief.md`, sandbox-authored, no Plans edits). Runtime:
`~/PM-Experiments/er-granularity-20261012/{case3,discovery2,cache}`.

## 9A — Two-axis discovery, brief-only

Three flash models (one Goal each, live web) + one independent premium
reference (Sol Max, 53 nominations: 27 category + 26 donors, sha
`96668e60…`). Host-scored per-axis recall against the reference:

| Model | Nominations | Axis-1 recall /27 | Axis-2 recall /26 | Valid finds the reference missed |
|---|---|---|---|---|
| DeepSeek V4.1 Flash | 32 (15+17) | 13 | 8 | mosh, dtach/abduco, pueue, dekit/mprocs, claude-squad, Vibe Kanban, pexpect, Tabby, Wave, OSC 133 spec, CI log groups |
| GLM-5.3-Flash | 24 (12+12) | 11 | 8 | mosh, extraterm, atuin, reptyr |
| Luna Max | 18 (9+9) | 9 | 9 | — (nothing outside reference) |
| **Flash union** | **42 distinct** | **15/27** | **13/26** | 14 valid nominations not in the premium list |

Findings:
- **Every "obvious" product was found** (Alacritty, Ghostty, WezTerm, kitty,
  VS Code, Zed, tmux, Zellij by all three). Flash discovery failures are
  omissions in the long tail, not junk: essentially every flash-only find
  is a valid nomination, and the union genuinely extends the premium list
  (mosh — found by two flash models, missed by Sol — is a first-rank donor
  for the no-output-loss requirement). Neither side contains the other;
  combined universe is 67 products.
- **Systematic flash blind spots:** (a) niche embeddable libraries,
  especially UI-toolkit-adjacent Rust ones (`egui_term`, `iced_term`,
  `beamterm`, libtsm, QTermWidget, SwiftTerm, hterm, foot, PuTTY, xterm) —
  ironic, since those are the closest analogs to embedding in Slint;
  (b) agent-tool donors (Claude Code, Cline, OpenCode, OpenHands, Windsurf
  — the products most similar to the brief's own app); (c) session/remote
  infrastructure (Guacamole, Teleport, ttyd, GNU Screen) and shell-side
  donors (fish, PSReadLine). JediTerm appeared only inside GLM's JetBrains
  entry, not as a standalone library nomination.
- **Version/defect leads were much better than Phase 5** when the prompt
  explicitly asked: DeepSeek's stated versions matched host pins exactly
  (Alacritty v0.17.0, tmux 3.8, Mosh 1.4.0), GLM verified versions/licenses
  live via crates.io/GitHub feeds and flagged GPL/LGPL against the brief's
  closed-source constraint unprompted, and all three produced per-product
  defect-history leads. The Phase 5 "no pinning, no defect history"
  failure was a prompt-scope effect, not a model ceiling.
- Recommendation: discovery should run as a **union of ≥2 flash models
  with differently-angled prompts** (category / library-long-tail /
  feature-donor-by-capability), host-deduplicated. Single-model discovery
  caps at roughly one-third to one-half of premium recall per axis; the
  union plus flash-only finds is competitive with one premium pass.

## 9B — Host fetch/pin + shared source cache (prototype works)

`/tmp/er_cache_fetch.py`: for each nominated product, resolve the latest
release (GitHub API; git-tag fallback — Ghostty publishes no GitHub
Releases, pinned `v1.3.1` by tag), fetch README/changelog/manual/docs into
`cache/<slug>/<pinned-version>/` with a `manifest.json` (product, axis,
nominated_by, pinned tag + basis, per-file URL/sha256/bytes, fetch time)
and a top-level `index.json`. Six products cached (Alacritty v0.17.0,
Ghostty v1.3.1, WezTerm 20240203…, tmux 3.8 incl. full manual, VS Code
terminal docs as labeled rolling-main, Mosh mosh-1.4.0), 456 KB total.
Keying by product+version makes the cache directly reusable by the next
topic that touches the same product; rolling sources are labeled rolling
rather than pretending a pin.

## 9C — MRI slices vs one big slice (same cached source)

Source: the 3 cached VS Code terminal doc files. Six narrow questions
(slice matrix in `case3/SLICE-MATRIX.md`), one small Goal each (2 Luna,
2 GLM, 2 DeepSeek), vs one monolith Goal (Luna) answering all six. Host
scored against a 24-fact checklist built from the docs before reading any
output (`case3/HOST-CHECKLIST.md`), plus mechanical verbatim-quote checks:

| Shape | Contexts | Claims | Verbatim quotes | Checklist facts /24 |
|---|---|---|---|---|
| 6 MRI slices | 6 | ~117 | 136/139 (2 of 3 misses adjudicated formatting/meta, ~0 invented) | **23** (miss: decoration context-menu actions, stated only in image alt text) |
| 1 monolith | 1 | 50 | 44/46 (misses are markdown-link normalization) | 21 (also missed the alt-text fact, plus showing-while-disabled cause and keyboard-link facts) |

Read: on shallow docs both shapes get most headline facts; the slices win
on depth (~2.3× claims), condition carriage, and — the MRI point —
**auditable completeness**: the coverage matrix names exactly which cell
is thin, so a follow-up slice can be dispatched at the gap instead of
re-running a big pass and hoping. Both shapes missed a fact that exists
only in image alt text, a useful reminder that source *fetch format*
(bounds what any slice can see.

## Updated end-to-end shape

Brief → 2–3 angled flash discovery Goals (union, host-dedup) → host
fetch/pin into the version-keyed cache (defect-history search per chosen
repo here) → MRI slice matrix per source (host coverage checklist as the
tiling proof; gap slices dispatched at named cells) → pipeline v2 loop
(records → checklist → skeleton → critics/adversaries → bounded repairs →
double blind grade). Still unrun as one unbroken chain on a fresh case;
still no dollar/quota measurement. That single end-to-end run — ideally
two overlapping topics to prove cache reuse — is the remaining gate
before touching the real Puppet Master plans.
