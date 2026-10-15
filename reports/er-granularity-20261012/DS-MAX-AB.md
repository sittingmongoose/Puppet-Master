# DeepSeek V4.1 Flash thinking=max vs high — same-model A/B (2026-10-13)

All prior DeepSeek contexts used `thinking=high`. Two decisive tasks were
re-run verbatim at `thinking=max` (OMP/OpenCode Go), scored identically.
Cost metric per Jared: same-model wall time + output volume.

| Task | high (baseline) | max | Reading |
|---|---|---|---|
| Generic two-axis discovery (case3) | 32 nominations, 21/53 matched vs Sol reference (13/27 + 8/26), 11 valid outside finds, ~6 min, 50 KB | 35 nominations (sha `95a66e58…`), **30/53 matched (17/27 + 13/26)**, 6 outside, ~19 min, 60 KB | Max recovers most blind-spot classes high missed (egui_term, JediTerm, QTermWidget, Konsole, foot, Rio; Claude Code, Codex, OpenHands, Zed, JetBrains, Screen) — 30/53 ≈ Astra's 31/53 in one context, at ~3× wall time of high |
| Gold-free skeleton (case2) | 27 KB, ~33 rows, 9/21 gold-skeleton elements (keyword ruler), few min | 41 KB (sha `606e4511…`), 28 cited seeds, 8/21 by same ruler, ~13 min | No gain: richer prose, same core blind spot (no concrete two-raw-name collision seed in either); keyword ruler understates both DS variants vs Luna's 14/21 |

Verdict: **max is materially better for open-ended discovery breadth**
(recall +9/53, approaching the premium baselines), **no better for
structured skeleton compilation** on this ruler. Both A/Bs are single
runs; discovery variance across runs is large (Phase 10), so treat the
discovery delta as directional, not precise. Recommendation: use
thinking=max for DeepSeek discovery/nomination stages; high is
sufficient for extraction/skeleton-type stages until a second A/B says
otherwise.
