# V5 — Verification: #panel-run (Debug) + #panel-testing + #panel-agents + #panel-artifacts (PM7 Motion Wave)

Agent V5 (report-only). Target `Concepts/PMConcept7.html` served at 127.0.0.1:8796, standalone
Playwright chromium headless 1440x900. Built file was NOT modified. Motion proven via
`el.getAnimations()` sampled mid-flight (WAAPI keyframes + CSSTransition `transitionProperty`),
computed transforms mid-press/mid-hover, and class-state assertions. Toasts proven by wrapping
`window.toast`. Reduced motion verified via BOTH `emulateMedia({reducedMotion:'reduce'})` and the
`data-motion="reduced"` attribute path.

Note on sampling targets discovered during verification:
- Accordion grid-rows transitions live on the BODY child (`:scope > .sh-accb`), not the `[data-acc]` host (base.css rule, ~15239).
- Press squash is a transform TRANSITION to `scale(.97)` (`.side-panel-view .pm-btn:active`, ~15661) — must be sampled ~60ms into the hold, not at pointerdown.
- Panel enter (`railPanelIn` .34s) is gated behind the outgoing panel's `railPanelOut` (.13s) — poll, don't single-sample.

## RESULT: 80 / 83 PASS — 3 FAIL (one shared root-cause defect, item D1)

Console: zero errors beyond the favicon baseline in every mode (normal, both reduced-motion
paths, three themes, all interrupt-stress runs).

## The failure (one defect, three surfaces)

### D1 — aria-disabled buttons toast the generic "demo_scope" message instead of their specific reason  [FAIL: 4d, 6c, 7g]
- Repro (any of):
  1. Run panel → SESSION shelf → click **Pause** (`aria-disabled="true" data-demo-reason="session already paused"`) or **Disconnect** (`"focused session is a launch session"`).
  2. Testing → LAST RUN → Receipt details → **Cancel** (`data-demo-reason="tr-2214 already completed"`).
  3. Testing → RUNS → tr-2219 row → **Quarantine** (`data-demo-reason="already quarantined 2d"`).
  Expected: the specific reason string is toasted. Observed (all): toast =
  **"Outside the Tastebook demo script — everything in the main story is clickable though."**
- Root cause: the delegated router's disabled guard (`routerHandler`, PMConcept7.html ~30487) does
  `var code = el.dataset.demoReason || el.dataset.demoDisabled || 'demo_scope'; say(guard.reason(code));`
  and `guard.reason` (~28563) is `REASONS[code] || REASONS.demo_scope`. `REASONS` (~28545) only
  contains token keys (`busy`, `stale`, `already_done`, …). Every side-panel disabled button carries
  free-text reasons, so the lookup always misses and falls back to `demo_scope`.
- Same defect also eats the `demo.reason` action path (~30589: returns `reason: argOf(ctx)` →
  `guard.reason(res.reason)` → same fallback) and `data-demo-disabled="1"` buttons.
- Blast radius beyond my scope (same pattern in markup): git worktree Remove (`blocked_preserved — owned by run #47`),
  GitHub Actions "Run workflow" x2 (`missing workflow scope`), docker Push (`image not built yet`),
  scenario Run (`compose_invalid …`).
- The message is actively misleading here: these ARE in-scope controls with intentional disabled
  states, yet the toast claims everything in the story is clickable.
- Impact: minor (feedback copy only). Disabled styling, `aria-disabled`, and `not-allowed` cursor
  are all correct; no state corruption. Suggested fix:
  `var r = el.dataset.demoReason; say(REASONS[r] || r || REASONS.demo_scope);`

## Per-item results

### PANEL-RUN (Debug)
- **1a open + enter anim** PASS — `pm-panel-enter` + `railPanelIn` caught mid-flight (enter starts ~60–100ms after click, after the outgoing panel's exit).
- **1b close: exit anim + hides** PASS — `pm-panel-exit` + `railPanelOut` observed; `.active` cleared.
- **1c reopen** PASS.
- **2a #rdCfgMenu sprout** PASS — `.is-open` + own animation + `pm-menu-in` cascade with `--pi` = 0,1,2,3,4,5 (6 items: 4 configs + Add + Edit file); trigger chevron flips.
- **2b pick config → label update + close** PASS — label → "vite dev — tastebook-web", `aria-expanded=false`, label pop fired.
- **2c "Add Configuration…" reveals #rdAddForm** PASS — `pm-hidden` removed, form visible (disclosure).
- **2d #rdAfAdapter menu** PASS — 3 items, open + cascade. **2e** pick → "Node.js" PASS.
- **2f Program/Cwd inputs** PASS — typing works; `.pm-input` focus-ring transition = `border-color, box-shadow`.
- **2g #rdAfStopOnEntry** PASS — toggles. **2h Save** PASS — toast. **2i #rdAddCancel** PASS — form hides.
- **3a #rdSessMenu** PASS — 2 items open + cascade. **3b** pick → "import worker", closes. PASS.
- **3c #rdBpMode** PASS — 3 items. **3d** pick → "Hit Count". **3e** condition input types (`qty > 42`). **3f** Apply/Cancel toasts. All PASS.
- **4a 4 shelf headers** PASS — grid-template-rows CSSTransition caught on all 4 bodies (4/4).
- **4b inner cascade** PASS — `.pm-kid-in` (pmKidIn stagger) on all 4 (4/4).
- **4c transport** PASS — Continue/Step Over/Step Into/Step Out/Restart/Stop toast (6/6; note: session state is LIVE — picking the running session in 3b re-disables Continue and enables Pause, proving state-aware transport); **Reveal Output** performs a real action (`revealBottomTab('debug')` — #bottomPanel uncollapsed, no toast by design).
- **4d Pause/Disconnect feedback** FAIL → see D1 (buttons respond, toast fires, wrong message).
- **4e session rows** PASS — both select + toast. **4f** shelf-header minibtns (stop-all, add-watch, show-exec-point, +3 bp headers) PASS.
- **4g watch edit/remove** PASS (4/4). **4h** variable row buttons PASS (9/9). **4i** nested `cfg` var expands w/ anim. **4j** Locals/Globals scopes collapse+expand. **4k** 4 call-stack frames + "Show 3 more" PASS. **4l** 4 bp toggles + 4 goto-source PASS. **4m** exception checkboxes toggle + toast. **4n** Start Debugging / Run Without Debugging / cog toast + press squash (`scale(.97)` mid-hold). All PASS.
- **5 live dots** PASS — `.sh-sdot.is-running` runs `liveRail` animation.

### PANEL-TESTING
- **6a LAST RUN** PASS — Run tests (primary) + Watch toast; squash caught.
- **6b Receipt details expand** PASS — body anims `[grid-template-rows, opacity]` + kid cascade.
- **6c Receipt/Export/Cancel** PARTIAL→FAIL — Receipt + Export toast correctly; Cancel (aria-disabled) toasts, but wrong message → D1.
- **7a RUNS 10 headers** PASS — all 10 toggle with grid-rows anim (10/10) + cascade (10/10).
- **7b #tstLiveElapsed** PASS — 85.0s → 86.0s over 1.1s.
- **7c running tr-2221** PASS — Watch (primary)/Cancel toast; `.dot-run` runs `dotPulse`.
- **7d** passed tr-2214 Receipt/Output/Re-run PASS. **7e** flaky tr-2217 Quarantine PASS. **7f** errored tr-2218 Re-run PASS.
- **7g tr-2219 Quarantine (aria-disabled)** FAIL → D1 (toasts generic scope message, not "already quarantined 2d").
- **7h** cancelled tr-2212 Re-run PASS. **7i** failed tr-2199 "Rerun failed only" PASS.
- **8a QUARANTINED shelf** PASS — expands w/ anim; Release + Receipt toast.
- **8b EVIDENCE shelf** PASS — expands; Inspect profile toasts; **Open in Artifacts** (`cmd.panel.switch`) lands on `#panel-artifacts.active`. **8c** return via rail PASS.
- POLICY shelf display verified (static, renders).

### PANEL-AGENTS
- **9a** PASS — all 7 rows (4 active subagents + 3 queued work) expand with grid-rows anim (7/7) + cascade (7/7).
- **9b occupancy bars** PASS — widths 62%/74% (rows) + 80%/40%/20% (LANE CAPACITY), `bar warn` variant on hot lanes.
- **9c Open chat** PASS — toasts per `cmd.chat.open_thread` registration (toast-only by design, no side-panel swap; verified against `reg()` at ~44919).
- **9d** PASS — all 17 Open node/Open thread/Open chat buttons respond (17/17).
- **9e LANE CAPACITY** PASS — `.pm-sumcard` expands w/ anim, 3 lane bars.
- **10a** PASS — 3 completed rows (Test Sleuth/Docs Writer/Fixture Miller) expand w/ anim (3/3); "…3 more" `.sh-row.flat` toasts.
- **10b Open Chat** PASS — `cmd.panel.switch -> chat` toggles `#chatPanel.hidden` (verified before/after).

### PANEL-ARTIFACTS
- **11a** PASS — 15 cards present. **11b Web tab** PASS — FLIP caught mid-flight (surviving cards' WAAPI keyframes `translate(0px, 477px) → none`, 2 inline transforms sampled), filter correct (2 web visible). **11c** `pm-flashing` shelf flash caught. **11d** active chip. **11e** Browser = 3. **11f** Evidence = 10 + `.pm-empty` placeholder present. **11g** All restores 15/15. All PASS.
- **12a sort sprout** PASS — 3 items, open + cascade. **12b Oldest first** PASS — full reverse of data-ts order (`14:31:02…` → `13:20:07…`), mid-flight animations counted. **12c** zero leftover inline transforms after settle. **12d By family** PASS — contiguous family runs (`web,web,browser×3,evidence×10`).
- **13a** PASS — all 15 card headers expand with grid-rows anim (15/15) + cascade (15/15).
- **13b #artLiveElapsed** PASS — 90.0s → 91.0s. **13c** live card Watch + `.sh-play` toast.
- **13d** PASS — all 55 card-body buttons respond (53 toasts + 2 `#chatPanel` toggles from the Chat prov buttons).
- **13e expired card** PASS — exactly one action: `["Copy"]` (Pin/Open/Prov absent by design).
- **14 hover sheen** PASS — `.sh-thumb::after` transition = `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)`, mid-hover transform `matrix(1,0,0,1,135.5,0)` (translateX sweep in progress); card lift transition on `transform, box-shadow`.
- **15a** PASS — 6 trail rows (baseline/repro/diagnose/fix/verify/notes) toast (6/6); status chips render. **15b** Open in Orchestrator (`page.go`) — no console error, page activates. **15c** return via rail PASS (required a JS click fallback — see observation O2).
- **16a reduced motion (emulateMedia)** PASS — all 4 panels open, family filter correct, FLIP instant (0 running animations, 0 inline transforms), accordions still toggle with 0 animations.
- **16b data-motion="reduced"** PASS — same guarantees via the attribute path (flipAnims=0).
- **17a theme personality** PASS — per-theme knobs confirmed in CSS: friendly-dark `--acc-ease:var(--ease-spring)` + `--pm-chev-deg:90deg` + `--ease-settle:cubic-bezier(.22,1.5,.36,1)`; retro-light `--acc-ease:var(--ease-snap)` + `--ease-settle:cubic-bezier(.3,1.14,.38,1)`; `railPanelIn` captured on friendly-dark. (Mid-flight sampling at 450ms is past the 340ms enter on retro — CSS-var evidence used.)
- **17b basic-light items 11+12** PASS — 4 family filters + Oldest-first FLIP reverse all correct.
- **18a family-tab spam x8** PASS — settles on last tab (evidence), filter correct, 0 stuck inline transforms.
- **18b sort spam x5** PASS — 0 stuck transforms/animations, menu neither `is-open` nor `is-closing` at rest.
- **18c accordion spam x8** PASS — no stuck `pm-flashing`/`is-closing` classes; card state coherent.
- **19 console** PASS — zero errors beyond favicon baseline across all modes.

## Observations (not failures)

- **O1 — Live session state machine**: picking the running attach session (rd-2) correctly re-renders the transport bar — Continue/Steps become `aria-disabled` with reasons, Pause enables, session dot/status update. The disabled-feedback copy is the only gap (D1).
- **O2 — Orchestrator return path**: after `page.go('orchestrator')`, a real mouse click on the activity-bar rail icon does not reopen a side panel (the rail appears to be overlaid/inert on that page); a direct JS `.click()` works. Returning from orchestrator is presumably owned by the page's own back-nav, so this is a navigation note, not a motion-wave defect.
- **O3 — Reveal Output / Open Chat semantics**: `cmd.run_debug.console.reveal` opens the real bottom Debug tab (no toast — correct), and `cmd.panel.switch -> chat` toggles `#chatPanel` visibility rather than swapping side panels (matches its registration).
- Motion quality: menu cascades land in ~60–100ms (`--pi` × 12ms, cap 8); accordion bodies spring on `grid-template-rows` with per-theme `--acc-ease` and an inner `pmKidIn` cascade; chevron overshoot (`pm-chev-open`) fires on every open; FLIP cleans up its inline transforms via `onfinish`/`oncancel` even under spam; live tickers advance in clean 1.0s steps; sheen sweep is a single 0.7s translateX with a fast-out bezier.

## Evidence files
- `results.json` — machine-readable 83-item results with per-check notes.
- Screenshots: `01-run-panel`, `02-cfg-menu-open` (sprout+cascade), `03-add-form-reveal` (disclosure), `04-testing-panel`, `05-agents-panel`, `06-artifacts-panel`, `07-flip-filter` (post-FLIP filtered set), `08-sort-reordered`, `09-card-cascade` (open cards), `10-sheen-hover` (thumbnail sheen), `11-theme-retro-light`, `12-theme-basic-light`, `13-stress-final`.
