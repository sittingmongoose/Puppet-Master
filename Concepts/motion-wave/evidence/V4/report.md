# V4 — Verification: #panel-git + #panel-docker (PM7 Motion Wave)

Agent V4 (report-only). Target `Concepts/PMConcept7.html` served at 127.0.0.1:8795,
standalone Playwright chromium headless 1440x900. Built file NOT modified. Motion proven
via `el.getAnimations()` sampled mid-flight (rAF polling 15–560ms, max-capture), computed
transition timing functions, WAAPI ink sampling, and class-state assertions. Toasts proven
by wrapping `window.toast` (the delegated router's sink). Reduced motion verified via BOTH
`emulateMedia({reducedMotion:'reduce'})` and the `data-motion="reduced"` attribute path.

## RESULT: 84 / 86 PASS — 2 FAIL (1 minor UX defect, 1 content gap)

Console: zero errors beyond favicon baseline in every mode (normal, both reduced paths,
all three themes, all interrupt-stress runs). 86 checks total across 16 scope items.

## The two failures

### X.reasons — aria-disabled buttons swallow their specific reason text [FAIL, minor UX]
- Repro: open ACTIONS → Workflows → expand "CI — build + test and publish" → click
  **Run workflow** (aria-disabled, `data-demo-reason="missing workflow scope"`).
  Expected: toast carrying the reason. Observed: **"Outside the Tastebook demo script —
  everything in the main story is clickable though."** Same for:
  - docker-publish **Run workflow** ("missing workflow scope")
  - DOCKER → Publish → **Push** (`data-demo-reason="image not built yet"`)
  - DOCKER → Compose → SCENARIOS → import-load x3 → **Run** (`data-demo-reason="compose_invalid — repair the scenario first"`)
- Root cause: the delegated router's disabled branch
  (PMConcept7.html ~30488: `say(guard.reason(code))` with `code = el.dataset.demoReason`)
  feeds the free-text reason into `guard.reason` (~28563), which does
  `REASONS[code] || REASONS.demo_scope`. REASONS keys are enum tokens
  (unsupported/busy/stale/…), so every human-readable `data-demo-reason` string misses
  the map and falls through to the generic demo_scope copy — which is misleading here
  (these controls ARE in the story; they're gated for a stated reason).
- Guard itself works correctly: no action fires, exactly one toast. The static footnote
  ("Dispatch is blocked: not configured (workflow scope)…") still explains the CI case.
- Suggested fix: `reason: function (code) { return REASONS[code] || code || REASONS.demo_scope; }`
  so free-text reasons surface verbatim.
- Severity: minor (feedback copy only; state/airdisability correct).

### 7.exec-gap — crash-loop container row lacks Exec [FAIL, content gap]
- Repro: DOCKER → Containers → expand **import-worker** (is-running, crash loop).
  Actions: `["Logs","Stop","Restart"]`. Its running siblings (tastebook-api-batch,
  postgres-primary, web-mirror, import-worker-1, registry-cache) all carry
  `["Logs","Stop","Restart","Exec"]`. Brief expects Exec on the crash-loop row too.
- All three present actions toast correctly; this is purely a missing 4th button in the
  static markup (line ~17597 has no `attach_shell` action). Severity: trivial.

## Per-item results

### PANEL-GIT
- **1 Lifecycle + tabs** — 4/4. Rail open fires `pm-panel-enter` (railPanelIn .34s, sampled);
  close fires `pm-panel-exit` (.13s) then slot hides, classes cleaned; git↔docker switch shows
  exit on outgoing + enter on incoming, no stuck classes. Runs→Workflows→Settings→Runs: WAAPI
  ink on every jump (mid-flight sampled), lands ≤1px (dl/dw measured), `--pm-pane-dir` = 1/1/-1,
  shPaneInDir cascade on row-bearing panes (settings pane is shelf-only — cascade n/a by CSS).
- **2 Runs pane (7 rows)** — 17/17. Every header toggles with live `grid-template-rows`
  transition (per-theme --acc-ease), chevron `pm-chev-open` overshoot mid-flight, and inner
  `pmKidIn` cascade on `.pm-acc-inner` children (stagger 26ms via --pi: delays 0/.026/.052…).
  success #312/#311/#309/#307 Rerun/Logs/Browser toast; failed #310 Rerun failed*/Rerun/Last
  good/Logs/Browser; failed #306 Rerun failed*/Rerun/Logs/Browser; running #308 Cancel*/Logs/
  Browser + `dotPulse` infinite with paired delays (header 0s vs job .35s); #309 live artifact
  toasts, `.sh-art.expired` fully inert (zero toasts, no toggle); STATUS CHECKS empty-state text
  present. (* = pm-btn-primary verified.)
- **3 Workflows pane** — 5/5. 4 rows expand with cascade. CI: #shDispRefCI opens animated
  (is-open + pm-menu-in, trigger pm-trigger-open + aria-expanded, item stagger 12ms), pick
  orch/lane-b-api → label updates + pm-sel-pop + clean close; file span toasts; Run workflow
  guarded (toast fires — text defect tracked under X.reasons). docker-publish: #shDispRefDkr
  (2 refs) + #shDispPlatDkr (3 platforms) both animated with chevron flips; Release #145 and
  nightly #147 expand to footnotes only ("Tag-triggered only…", "Schedule-only…"), no dispatch
  forms, file spans toast.
- **4 Settings pane** — 3/3. Jump ink+cascade n/a (shelf pane); Reconnect+workflow toasts;
  6 secret kv rows rendered; Manage on GitHub toasts.

### PANEL-DOCKER
- **5 Tabs (6)** — 4/4. 8 jumps incl. non-adjacent Containers→Publish→Containers: WAAPI ink
  every jump, land ≤1px, dirs [1,1,1,1,1,-1,1,-1], cascade on all row-bearing panes (publish
  pane is a single shelf of sh-stage — not cascade-eligible by CSS). At the fixed 240px panel
  width PMPillFit sets `data-fit="abbr"`: full labels hidden, Ctrs/Imgs/Comp/Regs/Bld/Pub shown,
  no overflow, ink aligned. Viewport 900px auto-collapses the slot (app behavior); after restore
  ink re-aligns ≤1px.
- **6 Context sprout #shCtxMenu** — 3/3. 4 items incl. diagnostic row; open animated with 12ms
  item cascade + trigger chevron; pick colima → label updates to "colima", item pm-sel-pop,
  is-selected moves, clean close; diagnostic row toasts, exit via is-closing, no stuck classes.
- **7 Containers pane (9 rows)** — 22/24. Every header expands with grid-rows anim + pmKidIn
  cascade. Port chips 8080/5432/8081/5001 toast + have hover transitions; Copy id/Copy ref toast
  on all 9 rows; running rows Logs/Stop/Restart/Exec toast; exited redis/replica Start/Logs;
  squash scale(.97) verified under real press (matrix 0.97); FLEET SUMMARY: `width .6s` bar
  transition wired, Images/Compose/Cleanup toast. **FAIL 7.exec-gap** (crash-loop row missing
  Exec, above). Note 7.fleet: bar width transition never fires on panel enter because entry is
  transform-based and slot width is fixed — no %-width delta exists to animate (mechanism
  correct, nothing to observe in this layout).
- **8 Images pane** — 4/4. dangling chipbtn toasts with press squash; row order unchanged after
  click (no reorder — by design, verified); 8 rows expand (anim+cascade) with Tag/Push/Inspect/
  Delete, Push absent on exactly 3 (postgres:16-alpine, redis:7-alpine, postgres:16.3-alpine3.19);
  footer Pull/Cleanup toast.
- **9 Compose pane** — 5/5. Open-file minibtn toasts; 7 service rows expand — db/cache/web/
  worker/import-worker/registry-cache get Logs/Restart/Up subset/Down subset, migrations exactly
  Logs/Up subset; project eqrow Up(primary)/Down/Restart toast; SCENARIOS dev + multi-arch
  Run/Edit/Delete toast, import-load x3 stale Run aria-disabled → guard toast + Repair primary
  toasts (reason text defect tracked under X.reasons).
- **10 Registries** — 6/6. Jump ink+cascade; 5 rows expand; Docker Hub/localhost:5000/unraid/
  quay Browse/Reconnect/Disconnect toast; ghcr.io Login(browser)* + Save PAT toast; footer
  Browse jared/tastebook toasts.
- **11 Build** — 2/2. Jump ok; Advanced disclosure expands with cascade (kidIn=4) + Open
  Dockerfile minibtn toasts; Build image primary toasts.
- **12 Publish** — 4/4. Jump ink ok (cascade n/a, shelf pane); 5 stage rows expand with grid-rows
  anim; chips pending/pending/exists/ready/waiting; stage 1 `.now` halo `shPulse` running on
  ::after; Push aria-disabled → guard toast (text defect under X.reasons); Commit tpl/Push tpl toast.
- **13 Reduced motion** — 2/2. emulateMedia path: panel/tab/accordion/menu/toasts all functional,
  side-panel `getAnimations({subtree})` = 0, zero console errors (doc-wide leftover = 108
  `editorLineReveal` in the code editor — outside V4 scope; `data-motion` not auto-set by the
  media query). Attribute path: functional, slot animations = 0, motion restored on removal.
- **14 Themes** — 2/2. Accordion `transition-timing-function` on a run row: friendly-dark
  spring cubic-bezier(.34,1.56,.64,1) / retro-light snap (.2,0,0,1) / basic-light settle
  (.26,1.4,.36,1); running-dot delay offsets persist under themes (head 0s / job .35s).
- **15 Interrupt stress** — 3/3. Accordion ×8 settles to start state, 0 in-flight anims; tab ×6
  settles on last tab, ink dl/dw ≤0.33px, exactly one visible pane, no stuck enter/exit; menu ×5
  settles open (odd parity), Escape closes, no is-closing stuck.
- **16 Console** — 1/1. Zero errors beyond favicon baseline across all modes.

## Motion-quality observations
- Ink stretch is genuinely WAAPI (getAnimations live mid-flight) and lands pixel-perfect (≤0.33px)
  even after spam and refit — strongest element of the wave.
- Accordion personality knob works: the same grid-rows transition audibly differs per theme
  (spring overshoot vs snap vs settle). Inner pmKidIn cascade stagger is consistent (26ms friendly).
- Pane direction is correct for every jump including non-adjacent; shelf-only panes (settings,
  publish) legitimately have no row cascade — not a gap.
- Minor gaps: (a) reason-toasts fall back to generic copy (X.reasons); (b) sprout-menu label
  changes pop only via item pm-sel-pop, never pmFlash on the label itself (consistent, but the
  brief's "pmFlash on real state changes" reads as label-level); (c) fleet occupancy bars'
  width transition is dead code in this layout (nothing reflows on enter).

## Evidence
- `results.json` — machine output (86 checks).
- `shots/v4-01-git-runs.png` … `v4-12-narrow-tabs.png` — 12 screenshots: git runs expanded,
  workflows dispatch, settings, docker containers, ctx menu open, images, compose, publish chain,
  ink mid-flight, reduced motion, retro theme, narrow/abbr tabs.
