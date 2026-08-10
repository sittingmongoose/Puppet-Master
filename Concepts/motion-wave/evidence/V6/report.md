# V6 — Cross-Cutting Motion Wave Verification

**Agent:** V6 (cross-cutting) · **Target:** `Concepts/PMConcept7.html` @ `127.0.0.1:8797`
**Viewport:** 1440×900, Chromium headless · **Engine:** standalone Playwright (REPORT-ONLY — no app files modified)
**Run date:** 2026-08-02

Scope: theme personality matrix (8 themes), reduced-motion full sweep (3 paths), interrupt + resize stress, persistence + hotkeys, console/page errors, aesthetic sweep. Per-panel functional depth was left to V4/V5.

---

## 0. Headline numbers

| Area | Result |
|---|---|
| Theme token matrix (8 themes × 6 tokens) | **48/48 PASS** · live-update yes · 4/4 light/dark twins equal |
| Theme behavioral matrix (4 families × 4 probes) | **16/16 PASS** |
| Reduced-motion W-series panel kill (3 paths) | **PASS** (enter/exit/cascade/menu/flash/chev/kid/segtab all dead; end-states correct; 0 stuck) |
| Reduced-motion — clean / 3 paths equivalent | **NO** (2 cross-cutting defects — see §2) |
| Stress (rapid switch + tab/acc/menu/fm spam + resize storm + scroll storm) | **PASS** |
| Persistence + hotkeys | **PASS** (reorder+hide persist, indicator static on load, tray restore, Ctrl+2..9 = 8/8) |
| Console / page errors / WAAPI warnings | **PASS** (0 / 0 / 0) |
| Aesthetic sweep | **PASS** (no dead element, no jitter/shiver, no >400ms, strong sibling consistency) |

**Overall expert-grade verdict: YES — for the motion wave's own scope.** The new W-series motion system is genuinely polished: per-theme personality is real and distinct, the `.ab-ind` WAAPI FLIP stretch works (16→220 px on long jumps), reduced-motion kills the *entire* panel system, and the system is stress-hardened with zero errors. Two cross-cutting defects keep it from a perfect score, both confined to reduced-motion coverage of **legacy (pm6-era) areas and the running-status breathing dot**, not to the new panel motion code. Detailed below.

---

## 1. Theme personality matrix

Tokens live on `[data-theme]` at `:root` scope → computed values update **without reload** (verified: `--pm-travel` changed on attribute set; no reload needed). Light/dark twins are equal on every motion token.

| theme | --pm-travel | --pm-stagger | --pm-row-step | --ab-hover-scale | --acc-ease (resolved) | --ease-settle | tokens match spec |
|---|---|---|---|---|---|---|---|
| friendly-dark | 12px | 34ms | 26ms | 1.14 | spring `(.34,1.56,.64,1)` | `(.22,1.68,.36,1)` | PASS |
| friendly-light | 12px | 34ms | 26ms | 1.14 | spring | `(.22,1.68,.36,1)` | PASS |
| glass-dark | 14px | 30ms | 24ms | 1.10 | settle `(.24,1.34,.4,1)` | `(.24,1.34,.4,1)` | PASS |
| glass-light | 14px | 30ms | 24ms | 1.10 | settle | `(.24,1.34,.4,1)` | PASS |
| retro-dark | 4px | 12ms | 10ms | 1.04 | snap `(.2,0,0,1)` | `(.3,1.14,.38,1)` | PASS |
| retro-light | 4px | 12ms | 10ms | 1.04 | snap | `(.3,1.14,.38,1)` | PASS |
| basic-dark | 8px | 22ms | 18ms | 1.08 | settle `(.26,1.4,.36,1)` | `(.26,1.4,.36,1)` | PASS |
| basic-light | 8px | 22ms | 18ms | 1.08 | settle | `(.26,1.4,.36,1)` | PASS |

All 4 families distinct where specified; light/dark twins equal on all 6 probed tokens.

### Behavioral probes (open docker from closed → expand row → open #shCtxMenu → hover icon → close)

| family | entry travel | entry mid-flight maxX (overshoot past 0) | accordion dur | accordion easing family | menu animates (not snap) | hover scale = knob |
|---|---|---|---|---|---|---|
| friendly | 12px | +2.64 (from −12) | 0.26s | **spring** (1.56 — strongest) | yes | 1.14/1.14 PASS |
| glass | 14px | +3.07 (from −14) | 0.32s (slowest) | settle (1.34) | yes | 1.10/1.10 PASS |
| retro | 4px (shortest) | +0.88 (from −4) | 0.14s (snappiest) | **snap** (no overshoot) | yes | 1.04/1.04 PASS |
| basic | 8px | +1.76 (from −8) | 0.20s (crisp) | settle (1.40) | yes | 1.08/1.08 PASS |

Personality reads exactly as specified: retro = short travel + snap + fastest; glass = longest travel + slowest; friendly = springy; basic = crisp settle. Menu entry animates via the `@starting-style` sprout on every theme (no snap). Icon hover scale equals the `--ab-hover-scale` knob to within 0.001 on all four.

**Clarification (not a defect):** the spec line "friendly overshoots most" maps to the *easing family*, which holds (friendly's spring 2nd-control = 1.56 > basic 1.40 > glass 1.34 > retro none). The *entry* translateX overshoot at the 70% keyframe scales with `--pm-travel` (0.22×travel), so in absolute px glass (3.07) edges friendly (2.64); both still overshoot past 0 (verified positive mid-flight on all families).

Screenshots: `shots/theme-*-idle.png` (8), `shots/theme-*-enter.png` (4).

---

## 2. Reduced-motion full sweep (3 paths)

Paths: (A) `page.emulateMedia({reducedMotion:'reduce'})`; (B) `data-motion="reduced"`; (C) `data-reduced-motion="1"`. Sequence per path = open 3 panels (files/docker/search → 2 switches), close 1, reopen docker, expand 2 accordions, open #shCtxMenu + pick + close, open fm-context (right-click file row), switch page tabs ×2. Audited after each settle.

| check (every settle) | A emulate | B data-motion | C data-reduced-motion=1 |
|---|---|---|---|
| W-series panel enter/exit dead (`pm-panel-enter/exit`) | PASS | PASS | PASS |
| cascade dead (`shPaneInDir` / `[data-pane]>*`) | PASS | PASS | PASS |
| menu/chev/kid/flash/chip/segtab-ink dead | PASS | PASS | PASS |
| end-states correct (active view, acc open=2, menu closes after pick, ctx closes on Esc, page correct) | PASS | PASS | PASS |
| no stuck `.pm-panel-enter/.pm-panel-exit/.is-closing/.pm-flashing` | PASS (0) | PASS (0) | PASS (0) |
| panel-scope running anims after settle (excl. breathing dot) | 0 | 0 | 0 |
| glass wallpaper ambient (`#glass-bg *`) dies under reduce | — | — | PASS (0 surviving) |

### Cross-cutting DEFECTS found in this sweep

**DEFECT-R1 [MEDIUM] — the three reduced paths are not equivalent; `[data-reduced-motion="1"]` is missing kills that `@media` + `[data-motion="reduced"]` have.** Proven by runtime: path C leaked `pm6-dash-in`, `pm6-proj-in`, `pmTabGlow` while A and B did not. CSS root cause — pm6-era kill blocks enumerate the media query and `[data-motion="reduced"]` but omit the `[data-reduced-motion="1"]` selector:
- `.pm6-dash-card / .pm6-dash-cta / .pm6-dash-catalog-panel / .pm6-dash-row.pm6-row-new` → killed at `10155` (media) + `10157` (`[data-motion]`); **no `[data-reduced-motion="1"]` rule** (grep confirms).
- `.page-projects .pm6-proj-card / .pm6-proj-sheet / .status-badge.pm6-live / .pm6-spin svg` → killed at `10468` (media) + `10474` (`[data-motion]`); **no `[data-reduced-motion="1"]` rule**.
- `.pm-term-wg-tab.pm-term-tab-active` glow (`pmTabGlow`) → `3552` kill present under media/`[data-motion]`, missing under `[data-reduced-motion="1"]`.
Impact: a user who sets `data-reduced-motion="1"` (a supported toggle — see `reduce()` @ `41980`) still sees dashboard/project card entrances and the terminal-tab glow. The new W-series block (`16150–16200`) *is* enumerated for all three selectors — the gap is purely in legacy pm6 sections.

**DEFECT-R2 [MEDIUM-LOW] — `.dot-run` / `dotPulse` (in-panel running-status breathing dot) is not killed on any path.** It lives inside `.side-panel-view` (panel-scoped), so by the task's literal "only FAIL if panel-scoped animation survives" rule this is a survivor (1 infinite pulse per running container, present in all 3 paths). It is an *intentional information-carrying status pulse*, but the inconsistency is the real bug: its sibling `.pm6-dot-run` **is** killed (`15035: [data-motion="reduced"] .pm6-dot-run … { animation: none }`), yet the W-series `.dot-run` (`15136`) has no reduced kill at all. Same class of gap for `.dot` `fmbreathe`. Severity is bounded (small opacity/scale pulse, no positional/vestibular motion), but it breaks both reduced-motion completeness and the kill-parity with `.pm6-dot-run`.

**Note (LOW, outside panel scope): `.code-line.revealing` `editorLineReveal` (editor line stagger) survives all 3 paths (48 concurrent on editor/dashboard navigation); not panel-scoped so not counted as the panel-scope fail, but it is a reveal cascade that should respect reduced motion — no kill rule found for `editorLineReveal`/`.code-line.revealing` (only a `transition:none` on `.code-line` at `9568`).

Screenshots: `shots/reduced-emulate-endstate.png`, `shots/reduced-datamotion-endstate.png`, `shots/reduced-data1-endstate.png`.

---

## 3. Interrupt + resize stress

| test | final state | stuck classes | panel-scope anims (non-pulse) | extra |
|---|---|---|---|---|
| 20 rapid clicks files→docker→search→artifacts→testing | active=`panel-testing` (= last click) ✓ | 0 | 0 | `.ab-ind` on testing icon: **delta = 0 px** (top 268/268, h 16/16) |
| tab spam ×10 (docker, 6 segtabs) | tab=registries = pane=registries ✓ | 0 | 0 | — |
| accordion spam ×10 (6 acc) | all closed (even toggles) ✓ | 0 | 0 | openCount=0 |
| menu open/close ×10 | closed, `display:none`, no `.is-closing` ✓ | 0 | 0 | — |
| fm-context re-target ×5 | open, **on-screen** (159,188) ✓ | 0 | — | — |
| **resize storm** 1440→1100→860→1440 (panel+ink+menu live) | — | 0 | 0 | **ink re-lands = 0 px** at every size; **no `railPanelIn` re-fire** (panelEnterLeft=0); **scrollOverflow=0** (pill-fit refits, no break); menu auto-closes on actual resize (safe) & always on-screen when open |
| **scroll storm** (testing panel) | — | — | pre=0 mid=0 post=0 | scroll triggers **zero** cascades/FLIPs |

No black-flash regression, no layout breakage at narrow widths, no animation storms. Screenshots: `shots/stress-post-panel-spam.png`, `shots/stress-resize-860.png`.

---

## 4. Persistence + hotkeys

- Drag-reorder (artifacts → top): DOM order updated → `localStorage['pm.activity_bar_order:v2']` written.
- Hide-to-More (run → `#abMoreBtn`): run removed from bar, `__more__` sentinel precedes it in LS array: `[…,"agents","__more__","run"]` ✓.
- **Reload:** order persists (`artifacts` first, `run` hidden) ✓; **indicator static on first paint** (`ab-ind` opacity=1, `getAnimations().length=0`, no `ab-icon-land`) ✓.
- **Tray restore post-reload:** More-tray row present, click restores run to the bar ✓.
- **Reset** (`removeItem` + reload): default order restored ✓.
- **Ctrl+2..9** on default order: 8/8 switch to the correct `data-target` panel (search/source/git/docker/testing/run/agents/artifacts) ✓. Hotkeys follow visual order (live-queried `.icon[data-target]`).

Screenshot: `shots/persist-after-reload.png`.

---

## 5. Console + page errors

Collected across all phases (incl. full aesthetic session with warning capture): **0 console errors, 0 page exceptions, 0 WAAPI warnings** (beyond the favicon-404 baseline, which did not even surface). Clean.

---

## 6. Aesthetic sweep (friendly-dark, slow deliberate tour)

Tour `files→search→source→git→docker→testing→run→agents→artifacts` (one tab-switch + one expand + one menu per panel where present). Screenshots `shots/tour-panel-*.png` (9). Grounded findings, ranked by severity:

1. **[info / clarification] entry-overshoot ranking vs spec phrasing** — see §1. Not a defect; the springy personality expresses through the easing curve, the distance through `--pm-travel`. Both intentional.
2. **[none found] dead/instant core element** — panel entry, accordion, menu sprout, ink, indicator, hover-scale all animate in non-reduced motion; nothing in the panel system snaps.
3. **[none found] overshoot jitter / layout shiver** — stress + resize both show 0 overflow, 0 stuck classes, ink delta 0; spring beziers (1.68/1.40/1.34) give tasteful overshoot with no shiver (verified across 20-click spam and resize).
4. **[none found] laggy (>400ms)** — panel entry 340ms, accordion 260ms (friendly), menu sprout transform 300ms, indicator FLIP ≈ `--motion-med` (240ms); all in the 140–340ms band → crisp, not sluggish.
5. **[none found] rushed** — no panel-system element is instant in full-motion mode.
6. **[strong] sibling consistency** — accordion timing identical across all 9 panels (0.26s spring, friendly-dark); segtab ink and chevron rotation consistent.
7. **[positive highlight] `.ab-ind` WAAPI FLIP stretch** — on a long jump the indicator physically grows (rest 16 px → peak 220 px covering from→to) then settles — a premium, intentional touch that works and is interrupt-safe.

Visual review of `theme-friendly-dark-*`, `theme-retro-dark-*` (square corners / hard offsets / neon lime — correctly distinct), `theme-glass-dark-*` (frosted depth + gradient wallpaper), and `stress-resize-860` (page tabs collapse to a chevron, search collapses to icon, terminal labels pill-fit to "+4 more", zero horizontal overflow) confirms high craft across themes and a robust responsive collapse.

---

## 7. Evidence index

27 screenshots in `shots/`: `theme-{8 families}-idle.png`, `theme-{4 dark}-enter.png`, `reduced-{emulate,datamotion,data1}-endstate.png`, `stress-post-panel-spam.png`, `stress-resize-860.png`, `persist-after-reload.png`, `tour-panel-{9}.png`. Raw phase data: `/tmp/opencode/v6/phase{1..7}.json`.

## 8. Failures / repros (summary)

- **R1 (reduced path gap):** set `document.documentElement.dataset.reducedMotion='1'`; navigate `PM_PAGES.go('dashboard')` / `('projects')`; observe `pm6-dash-in` / `pm6-proj-in` running where `data-motion="reduced"` shows none. Fix: add the `[data-reduced-motion="1"]` selector to the kill rules at `10157`, `10474`, and the terminal-tab-active kill near `3552`.
- **R2 (breathing dot):** open docker with a running container under any reduced path; observe `.sh-dot.dot-run` `dotPulse` still `playState=running`. Fix: add `[data-reduced-motion="1"] .dot-run, [data-motion="reduced"] .dot-run { animation: none }` (parity with `.pm6-dot-run` at `15035`), plus `fmbreathe`/`.code-line.revealing` (LOW).

**Verdict restated:** the motion wave's own cross-cutting behavior is expert-grade and stress-hardened; the only blemishes are reduced-motion *coverage parity* gaps in legacy pm6 areas + the running-dot, which are real and should be filed (R1 medium, R2 medium-low) but do not affect any end-state, stress, persistence, hotkey, or full-motion quality result.
