# Usage Concepts Rebuild — Build Plan

Status: approved, executing. Scope: rebuild the eight usage prototypes in
`Concepts/usage-concepts/` (U3–U8 + new U9; **U1 and U2 are intentionally not
touched**), plus the gallery `index.html`, against the canonical specs in
`Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, `Plans/Multi-Account.md`,
`Plans/assistant-chat-design.md` (ACD-434/439/441/442) and `Plans/UI_Command_Catalog.md`.
This document is the governing build plan for that work; it derives from those
canonical specs and does not replace them. It is not a generated shard.

## Locked decisions
- 5h short window (7d weekly); per-provider window labels per UF-041 (no generic
  5h/7d column where semantics differ).
- New top-tabs concept = family **Deck**; registered in the gallery; `usage-icons.js`
  loaded in `index.html` to fix the five blank family nav icons.
- More-Details = **calm, editorial** (not the scattered PM/opencode pane; not a dense
  dashboard): one stacked bar + collapsible by-role legend, three cost figures,
  per-window remaining, messages collapsed behind "show N" (human-readable-first +
  deep-link), Raw redacted tucked at the bottom.
- Spend = **secondary**, never removed; shown in a Cost section as three projections
  (API-billed / plan-included / combined) — these are GUI projections over the single
  UsageRecord cost authority (UF-087), not a second cost model.
- Purchased extra usage = its own add-on/overage bucket (own used + reset).
- Context-Lens popover = the **one standard popup** for the whole app (ACD-442/439).
- Settings-page scrollbar treatment on every scroller.
- Reduced-motion option kept (manual MOTION toggle **and** `prefers-reduced-motion`).
- No user-facing string may contain `_` (humanize at the view layer via `R.human`).
- No emoji / pictographs as UI or status (SVG only). No left status edge-bars.

## Phase 0 — Shared backbone (build first; everything depends on it)
- `usage-data.js` v2 (additive): canonical token buckets + `counting_semantics` + the
  full projection grammar on every value; nested `windows[]` per provider
  (kind/scope/label/used/usedTokens/resetsAt/cooldown); `addons[]`; `costSplit{}` in
  microdollars (`$` display-only via the 6/4/2 ladder); `sessions[]`, `subagentTokens`,
  `byModel[]`, `bySession[]`, `contextByRole{}` + `ring{}`; richer demo rows from the
  PMConcept7 demo flow. `USdemo` = delegated registry + guard + REASONS + canonical
  `CMD` map (`cmd.widget.*`, `cmd.chat.compact_context`,
  `cmd.chat.open_thread_context_details`, `cmd.nav.open_usage_subject`,
  `cmd.usage.refresh/export`); **retired aliases never registered**. `R.human`,
  `R.humanCap`, `R.projChip`, `R.costMicro`, `R.winBar`.
- `usage-shared.css`: aligned-meter 3-col grid; shared `.us-list`/`.us-kv` grid (rows as
  `display:contents` in ONE grid so right-edge values align and a variable-width chip
  cannot dictate string length; `tabular-nums` everywhere); `.pm-sprout` chrome matching
  the Context-Lens popover exactly; `[data-tip]` tooltip; wide breakpoints
  (2200→5-col, 2500→6-col); motion tokens; Settings-style scrollbar; friendly grid ground
  + glass containment.
- New modules (reusable, host-agnostic so Home/Orchestrator can adopt later):
  - `usage-tabs.js/css` — `PMTabs`: spring ink + magnet hover + directional crossfade.
  - `usage-context.js/css` — `PMContext`: ring popover (glow-only hover, click toggles) +
    the calm More-Details; `mountTriggers()` appends the two pop-out buttons to `#sbChips`
    (each with title + aria-label + data-tip).
  - `usage-widgets.js/css` — `PMWidgets`: `registerType`, catalog, **add-widget picker**
    (choose type + content + size), kebab (focus / S/M/L/XL / close), **free resize with
    coarse-grid snap only on pointer-up**, FLIP no-flash, per-widget gear persisted,
    layout keyed per page-id.
- `usage-chrome.js`: page-width harness reaches 2200/2500 (real-number presets +
  `parseInt` handler + `MAX_W`); demo-action router defers `cmd.*` ids to `USdemo`.

## Motion system (researched: Wikipedia 12 principles, Comeau spring + linear(),
NN/g, Atlassian, MDN easing + reduced-motion, aerotwist FLIP, easings.net)
Easing by role (tokens): entrance `cubic-bezier(0,.4,0,1)` 160–300ms size-proportional;
exit `cubic-bezier(.6,0,.8,.6)` ≈70% of enter; interactive `cubic-bezier(.4,1,.6,1)`
80–140ms; scale-in `cubic-bezier(.4,0,0,1)` 220–300ms; spring = JS spring baked to
`linear(...)` behind `@supports` with cubic-bezier fallback (native `spring()` as
progressive enhancement); pulse 1.6–2s; count-up ease-out 900–1100ms; stagger 30–45ms
capped ~6/group. Choreography: one focal lead per event, others support; never
all-at-once; zero perceived latency (measure in the ~100ms response window); exits
faster than entrances; high-frequency interactions minimal; FLIP (transform+opacity
only; cross-fade inner text rather than scale-distort) for every reorder/resize/relayout;
scroll-reveal via IntersectionObserver on **first paint only** (never on data refresh,
per the no-flicker/no-scroll-jump rule). Performance: compositor-only props, `will-change`
sparingly, `contain:layout` on the resizing widget, no animated full-page backdrop-filter.
Reduced motion collapses all motion tokens to ~0ms. Slint mapping: springs/`linear()` are
web-only enhancements; every motion also carries a duration+easing token mappable to a
Slint state transition; FLIP → state-driven transition; reveal → property toggle.

## Phase 2 — Per-concept U3–U8
Usage-hero pivot (pressure/reset/guards/cache/used-tokens lead; spend → secondary Cost
section with the three projections + add-on + burn/run-out); sortable + date-range ledger
and tables; convert the enumerated misaligned rows to the shared grid (u3
`.u3-crow/.u3-arow/.u3-gt`; u4 `.u4-qmini/.u4-q/.u4-c/.u4-hist` + the two inline `.lb`
overrides; u5 `.u5-qrow/.u5-crow/.u5-fam`; u6 `.u6-qitem/.u6-crow/.u6-row/.u6-gate`; u7
`.u7-qrow/.u7-crow/.u7-acrow/.u7-pgrow/.u7-grow`; u8 `.u8-crow/.u8-pg` + shared `.us-wc`);
kill the wrong-metric "budget" donuts (u5/u6/u8); flex charts/tables to remove dead bands;
value-state + provenance on every numeric; glass/friendly adherence; u5 glyphs → SVG;
u6 duplicate-id; u7/u8 attention line; u8 cache-grid / title-cap / resize-by-area;
humanize the audited underscore offenders via `R.human` (guard titles/kinds, tool names,
`index_used`, `usage_event_ref`, kind/scope enums, raw `spendBasis`, ledger detail values,
pressure reasons, account note/reason, signal text); apply the motion system; every
icon-only control gets title + aria-label + data-tip.

## Phase 3 — New U9 "Deck" + gallery
Top `.pm-tabs` + per-tab `PMWidgets` canvas; family Deck; pop-outs; register in gallery
`CONCEPTS`; load `usage-icons.js` in `index.html`.

## Phase 4 — Verification
Matrix **9 concepts × 8 themes × {900,1280,1700,2200,2500}**: 0 console errors; 0 visible
horizontal overflow; every menu/popout opens in-viewport and unclipped (assert rect); no
squashed non-ellipsis text; right-edge value alignment within each widget (assert equal x);
hover-label presence on every icon-only control; fit-on-resize; reduced-motion path; Slint
non-portable audit (no `:has` / container-query / `backdrop-filter` in concept code, no
`calc()`-in-`transform`, `linear()` behind `@supports`); smoke (drag/resize/focus/
add-widget/picker); visual inspection of screenshot batches.

## Parallelization / environment reality
In this environment the only delegatable agent is read-only `explore` and the browser is a
single session; the build agent type is denied, so code is written by hand in dependency
order and verified with a smoke test before fanning out. Read-only audits and screenshot
visual inspection are parallelized via `explore`; the browser matrix runs via one
parametrized harness. First execution step (now that plan mode is off) was the read-only
repo pull (opencode + the trackers) to confirm computation methods for demo realism.

## Plan-update notes (recorded, NOT applied this pass)
From trackers (post-pull): consider P90 auto-limit, reactive file-watch freshness vs the
5-min poll, session-attributed cost rollup, 5h-block semantics, custom-pricing-override
UX — promote to canonical plans only after review. Spec fragmentation: Antigravity honesty
rules scattered (`:5440/:5535` vs `:281-346`); no explicit `window_kind` per provider
except MiniMax; Ollama/local unnamed; header compact-line vs the fixed placement model;
Glossary missing `settlement_status/source_class/value_state/source_confidence/cost_status`;
UF-034 merges freshness+health (should be two enums); `cache⊆input` not explicit in
Prompt_Pipeline; daily-summaries rollup has no storage owner; CLI_Bridged is not the owner
of Cursor/Copilot/Codex/Gemini honesty labels (CBP-022 = direct providers, not bridges);
`widget.multi_account→Agent-Config` canon lives in usage-feature, not Multi-Account.
Motion: record native `spring()`/`linear()` as the canonical easing approach for a future
spec motion annex.

## Demo-data realism sources (external, computation only — look ignored per user)
ccusage (5h blocks, cache read/write, per-model breakdown, custom pricing), tokscale
(session+model cost grouping, cache/reasoning handling), Claude-Code-Usage-Monitor (burn,
P90/custom limit, run-out, official-vs-estimate provenance), opencode (expanded-context
fields). Look/layout not borrowed.
