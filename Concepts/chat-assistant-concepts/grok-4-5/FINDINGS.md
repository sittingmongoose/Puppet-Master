# Findings — Grok 4.5 chat concepts

Authority: handoff testing contract + live measurements. Design law: **peer level, original look**.

Spec gaps: [`SPEC_GAPS.md`](./SPEC_GAPS.md) · Probes: `%TEMP%/pm-grok45-probes/` (not shipped) · Reports: seven packet JSON/MD at concept root · Cache: `?v=39`

## Step 8 — Fixtures, triggers, probes, ConceptHub, reports (2026-08-11)

Cumulative packet finish for Grok 4.5. Shared demo/harness/motion were coordinated with Step2ChromeBsd + Step3to7Features; Step8 finalized DEMO_*, fixture enrichment, motion offline/restore fallbacks, temp probes, and the seven packet reports.

### Shipped

| Area | Change |
|------|--------|
| Demo fixtures | `demo-extend.js` ensures ≥18 history rows (thread-16..18), BSD Auto sample, restore point, offline queued beat, Browser Program activity, notification samples; `DEMO_SCENARIO_MANIFEST.json` + `DEMO_TRIGGER_CONTRACT.json` expanded |
| Harness | Step8 system triggers present (`system.bsd.*`, `system.sync.*`, restore/rewind, notification, Browser Program, provider setup, access limited) — additive cases from Step3 retained |
| Motion | BSD glow only `.is-auto-active` (Step2); Step8 added offline/reconnect chip transitions, restore/rewind flash, reduced-motion opacity fallbacks |
| Probes | `%TEMP%\pm-grok45-probes\` only — **no** shipped `verification/` |
| Reports | Seven packet files at concept root + refreshed `IMPACT_REGISTER.json` |
| Cache | Host scripts bumped `?v=39` (deep polish + verify reopen) |

### Tests

| Suite | Result |
|-------|--------|
| residual-fixes-probe.mjs | **13/13** (branch/lens/fan-out/video+pdf CTAs/bulk persona/cache v39/lens shadow) |
| store-api-probe.mjs | **12/12** |
| offline-idempotency-probe.mjs | **pass** (second replay empty) |
| terminology-grep-probe.mjs | **pass** (no Playwright UI hits) |
| matrix-smoke-probe.mjs | **64/64** theme×width×rm on w6×t1; BSD slots **8/8**; Q structure **8/8** |
| live-spotcheck-probe.mjs | **12/12** pin+artifact, BSD×3, offline, redirect, attachment CTAs, title-bar notifications |
| polish-visual-probe.mjs | **8/8** quieter paradigm/lens, theme first-click, bulk persona PlanningRun section |
| demo-trigger coverage | **94/94** contract triggers covered |
| ConceptHub validate | **passed** (no `verification/` dir) |

### Command census (locked)

- `cmd.chat.history.pin` → reuse `cmd.chat.pin` (**alias/conflict**)
- `cmd.chat.restore_point.create` → reuse `cmd.chat.create_restore_point` (**alias/conflict**)
- `cmd.chat.thread.rewind` → reuse `cmd.chat.rewind` (**alias/conflict**)
- `cmd.chat.context.compact_now` → reuse `cmd.chat.compact_context` (**alias/conflict**)

### Residual verify reopen (2026-08-11)

Functional residuals fixed in-concept (LF):

| Fix | File |
|-----|------|
| `branchThread` honors `fromMessageId` + `initialVisibleMessageCount` | `_shared/store.js` |
| Empty `admittedSources` no longer reseeds | `_shared/context-lens.js` |
| Product UI fan-out max-3 caps removed (harness `FAN_OUT_MAX` kept) | `threads/_thread-kit.js`, `_shared/demo-harness.js` |
| Video CTA **Use Gemini for video** | `_shared/store.js`, `_shared/demo-harness.js` |
| Bulk persona confirm menuitem wired | `_shared/popups.js` |

### Deep polish + verify reopen (2026-08-11)

| Polish | File |
|--------|------|
| Quieter paradigm watermark (weight 600, tracking ↓, muted mix) | `threads/t1.css`–`t8.css` |
| Quieter Context Lens bar (no elev shadow, smaller eye, softer title; glass-dark bar toned) | `_shared/chat-chrome.css`, `_shared/chat-tokens.css` |
| Theme sprout first-click: close menus before apply | `_shared/shell.js` |
| Bulk persona PlanningRun section + short menuitem; confirm keeps full copy | `_shared/popups.js`, `_shared/chat-chrome.css` |
| PDF alternate CTA **Use Gemini for documents** | `_shared/store.js` |

Probe results under `%TEMP%\pm-grok45-probes\`: `residual-fixes-result.json`, `matrix-smoke-result.json`, `live-spotcheck-result.json`, `polish-visual-result.json`.

### ## Honesty items + deeper miss (2026-08-11)

| Area | Change |
|------|--------|
| Goal | Demo-complete pause/resume/stop/clear/edit/replan/complete via store `normalizeGoalCapabilities`; replan note cites GAP-020; no invented catalog IDs |
| Provider/crew | Nested model recover button fixed; atomic `connectionId` on route bind; honest Settings-owned stub CTAs; crew confirm is session-scoped (not “default manager”); More→Crew routes through confirm |
| Composer | Provider-setup disables send with Choose-another-model + Settings-ownership actions |
| Persona | Bulk-apply default label aligned to `Researcher` |
| w×t | No winner declared |

Cache bust: `?v=40`.

Remaining defects / honesty

- Goal strip demo-complete locally; catalog IDs remain GAP-020.
- Full provider/crew **managers** remain Settings redesign / Plans ownership — chat ships enriched route chrome only; stub CTAs state Settings ownership honestly (deep-link not wired).
- No winner recommendation across w×t identities.

### Impact summary

Chat concept now demonstrates packet-required BSD, offline/outbox idempotency, restore/rewind, title-bar notifications, Browser Program terminology, provider-setup and access-limited composer/access states, with durable reports, live matrix/spot-check closeout, residual fixes, and **zero** shipped `verification/` folder (probes live only under `%TEMP%\pm-grok45-probes\`).

---

## Motion + Provider/Crew depth (2026-08-05) — historical

| Area | Change |
|------|--------|
| Q motion | Measured height morph (`pm-q-height-morph`); killed max-height keyframe fight; carousel enter via pending double-rAF; select flash instead of origin-less ripple |
| Artifact / CW | Symmetric close (`is-closing`); status crossfade; CW collapse `is-collapsing` before hide; no smooth-scroll motion |
| Provider | Favorites / Work / Personal; live fav re-sort; bind `providerId`/`accountId`; recover CTA; **thread-model-override** pill when model ≠ default |
| Crew | Human labels; mismatch reason; wave seed/clear; **Use default Crew?** confirm with Use / Not now (cancel toasts) |
| Copy | CSS comments say Slint-portable (not “video-level”) |

### Tests (`?v=36`, historical)

| Suite | Result |
|-------|--------|
| `npm run v2` | **43/43** — height-morph, sections, bind-route, override pill, crew confirm cancel, mismatch reason |
| `npm run motion` | **2/2** |
| `npm run geometry` | **256/256** |
| `SHOT=1 npm run matrix` | **64/64** |

### Residuals as of that pass (superseded by Step 8)

- In-folder `verification/` existed then and was flagged by ConceptHub; **removed before Step 8 ship** — current probes are `%TEMP%\pm-grok45-probes\` only.
- Full provider/crew managers remain Settings / Plans ownership (unchanged).
- Motion is production Slint-portable craft, not reference-video frame tables.

---

## Ship-finished polish (2026-08-05) — historical

Elevated the V2 packet from functional prototype to ship-finished polish in-folder only (w1–w8 × t1–t8 preserved).

### Shipped

| Area | Change |
|------|--------|
| Demo truth | Store hydrate accepts `goal`/`activeGoal`, `todo`/`todos`, `state`/`threadState`; V2 beats always append (`t01-v2-*`); 18 credible history rows |
| Questions | Full per-concept layouts (folio/beat/shelf/yield/condenser/margin/focus/breath); prepare→select→submit morph; no lavender Q / no t2 left accent |
| Chrome | Favorites-first provider menu + persist; Crew card; Lens Included/Left out in bar; Compact Now breakdown; harness human labels |
| Surfaces | Artifact enter motion; CW detail expand; goal strip depth; approval settle; reduced-motion safe |
| ConceptHub | `data-concept-model="Grok 4.5"`; `pm-concept-ready` / `pm-concept-state`; `openPath` = `host.html` (file-only) |
| Bugfix | `injectLensUi` referenced unbound `store` → console errors + broken Compact Now / warnings paint |

### Tests (`?v=34`, historical)

| Suite | Result |
|-------|--------|
| `npm run v2` | **36/36** — hydrate, Q struct uniqueness t1–t8, Lens breakdown, Compact Now Included/Left out, favorites toggle, CW expand-hard |
| `npm run motion` | **2/2** |
| `npm run smoke` | **64/64** |
| `npm run geometry` | **256/256** |
| `SHOT=1 npm run matrix` | **64/64** |

Visual evidence at the time lived under in-folder `verification/screenshots/matrix/` (theme × width × rail). **That directory is no longer shipped**; current probe home is `%TEMP%\pm-grok45-probes\`.

### Residuals as of that pass (superseded by Step 8)

- ConceptHub flagged in-folder `verification/` then; directory later removed for ConceptHub compliance.
- Motion / Provider-Crew polish residuals closed in `?v=35` depth pass.

---

## V2 repair/expansion pass (2026-08-05) — historical

Implemented Assistant Chat Update Packet v2 delta in-place (w1–w8 × t1–t8 preserved).

### Shipped

| Area | Change |
|------|--------|
| History | `session.historyMode` ∈ closed/peek/pinned_compact/pinned_full; pin blocks close/scrim/scroll-dismiss; w1/w3 pin-aware; auto-compact via floor helper; window `update()` always repaints |
| Artifacts | Left sibling workspace (loading/ready/update/error/retry/switch/close); replaces editor-tab toast as primary open |
| Questions | Per-concept structured renderers (`q-folio-leaf-morph` … `q-paired-breath`) with distinct DOM wrappers; Skip≠Cancel; freeform + select types; durable submit path |
| Compact work | Wired `data-cw-expand` chips → detail stack + inline pane; paradigms folio/beats/shelves/yield/condenser/margin/focus/breath |
| Chrome | Access profiles; Crew selector; provider rail + favorites/meta on model menu; Normal/Fast under effort; Compact Now + Included/Left out; cross-project warning; attachment resolver states |
| Spellcheck | Passive underline + context menu with ignore/dictionary persistence; **no toolbar button** |
| Demo | `demo-extend` V2 scenario on thread-01; non-product `demo-harness` (incl. cross_project/crew); manifest/trigger fixtures |
| Docs | `COMPOSITION.md`, `concept-hub.json`, `IMPACT_REGISTER.json` |

### Bugs fixed

- History pin close-fight (w2/w4–w8) and w6 transcript-scroll unpin
- Store `historyMode` updates not repainting windows (partial update paths)
- Q renderer keyed off conversation `thread-NN` → always `q-shared-fallback` (now concept `t1`–`t8`)
- Dead compact-work chips (`data-cw-expand` unbound)
- Subagent harness crash when groups used `agents` without `children`
- Artifact open toast-only façade
- Decorative spellcheck chip; ignore actions that did nothing
- favicon 404 noise in probe console gate

### Tests (historical)

- `npm run v2` → **29/29** (results then stored under in-folder `verification/v2-delta-probe-results.json`; directory since removed)
- `npm run motion` → **2/2**
- `npm run smoke` → **64/64**
- `npm run geometry` → **256/256** (re-run 2026-08-05 against `?v=33` host)

### Residuals / honest limits (then)

- Compact-work chip presence can lag if Goal surfaces only as strip without band (probe records expand soft when no chip)
- Full W×T matrix capture for every new surface not re-shot in this pass
- Motion is Slint-portable morphs — not frame-matched to reference videos
- Provider multi-account catalog depth is concept-demo fidelity, not Settings product UI
- Theme sprout first-click flakiness may remain (pre-existing)

See [`IMPACT_REGISTER.json`](./IMPACT_REGISTER.json) for per-concept solutions and owner-contract conflicts.

---

## Alive polish gap fill (2026-08-01) — historical honest status

Exhaustive live QA + gap fill after the prior Alive pass oversold “video-level everywhere.” Cache **`?v=30`**.

### Shipped in this pass

| ID | Fix |
|----|-----|
| L19 | History ⋯ moved onto status **meta row** (not a full-height side column) — shared list + w1–w8 |
| L1–L3 | Goal strip `z-index` above dock; full-width edit panel; softer dock shadow |
| L4 | Folio Goal is detail-only; strip owns Edit/Pause/Stop/Clear/Replan |
| L5 | w6 compact secondary: `overflow:hidden` + `visibility:hidden` (no ghost hit targets) |
| L6 | Lens select hosts `pointer-events: auto` (input no longer pe:none on the control) |
| L7 | Host URL aliases `w=1`→`w1`, `t=2`→`t2` |
| L8 | Q XOR dock + `is-q-active` root class; composer hidden/disabled while Q open |
| Q | In-place carousel on Skip / mid-Submit; settle pill on final submit |
| Motion | Attach chip exit; More Info / Drafts `leaveThenHide`; work-surface chevrons + open stagger; long-msg `is-expanding`; t4 Yield exit; t7 slide-dir cleanup |
| P1 | Folio stacking isolation; Q dock vs reading space; lingering row ⋯ hide; theme click broadened; Jump/strip flow |

### Still imperfect / known residuals (then)

- Theme apply can still feel flaky if a sprout menu swallows the first click (retry closes menu then applies).
- Geometry/smoke must be re-run after this pass — do not trust `?v=29` scores for `?v=30`.
- Not claiming video-parity motion on every surface; Q carousel/settle and shared exits are wired, not frame-matched to reference video.

### Gates (`?v=30`, historical)

| Suite | Result |
|-------|--------|
| Pair smoke | **64/64** |
| Reduced motion | **2/2** |
| Affordance | **32/32** |
| Geometry | **256/256** |
| Feature states | **896/896** |

Live probes: history meta-row 15/15 (0 side-column More); goal edit full-width (703/703); Edit hit-test reaches strip; `w=1`→`w1`; Q dock XOR (no composer) + `is-q-active`.

Follow-up after Exhaustive live control QA: that pass hit `?v=29` and briefly a wrong `:8765` host. Re-check on Grok `?v=30`: Lens selects work when scrolled into view; L19 is column meta-below-title; hover actions pe:auto. Remaining fixes landed: w6 compact keeps Lens/More/Ring (only search/selectors hide); goal strip uses row+full-width edit panel; Tastebook copy no longer implies composer is live during Q.

## Live visual pass (`:8775` / `?v=30`) — 2026-08-01 — historical

Evidence at the time: in-folder `verification/screenshots/live-visual-v30/*.png`, `verification/live-visual-v30-results.json`, plus browser CDP on the same host. **Those in-folder paths are no longer shipped.**

### Matrix coverage

- w1–w8 × 520/750 (friendly-dark), Q thread on w6@750, glass-dark + retro-dark spot on w4@750
- Interactive rechecks: Interface sprout, Goal Edit panel, Lens select, w2@520 Lens (visible chrome, not drawer ghost)

### Confirmed good (live)

| Area | Evidence |
|------|----------|
| Host / port | Title `Grok 4.5 — Chat Host` on **8775** only (not 8765) |
| Prose visible | Messages render in all matrix shots; CDP `visibleMsgs` > 0 when pocket closed |
| L19 History ⋯ | `metaMore=15`, `sideMore=0`, row `flexDirection: column` |
| Goal strip | Edit/Resume/Stop/Clear/Replan on strip; folio goal actions = 0 |
| Goal edit | Opens; panel ≈ **97%** strip width (679/703 on w4@750); Edit not under composer |
| Q lock | `qCard` + `rootQ`, **composer false** (`w6-q.png`) |
| Lens | Marks present; select increments (`0→3` on host click); bar shows selection |
| w6 compact | After scroll: Lens/More/Ring `pointer-events: auto` |
| Sprouts | Interface menu opens (Filter + personas) on live click |
| Themes | glass-dark / retro-dark apply on spot shots |

### Matrix “bugs” triage (do not treat raw 9 as product P0s)

| Reported | Verdict |
|----------|---------|
| `lens-btn-ghost` w2@520 | **False P0** — first `[data-action=lens]` is in a closed drawer (`pe:none`); visible chrome Lens works |
| `hover-dead` | **False P1** — probe matched idle hover row (`pe:none` / `op:0` until `:hover`); live hover stays pe:auto |
| `sprout-dead` | **Mostly false** — selector `.pm-chat-selector …` misses window-specific Interface triggers; live Interface opens |

### Soft residuals (honest)

- **Paradigm chrome** quieted in deep polish (`?v=39`: weight 600 + muted mix) — still intentional identity label, not a debug overlay.
- **Lens chrome** quieted in deep polish (`?v=39`: no elev shadow, smaller eye, softer title) — still present during selection.
- **Pocket/history open** can dominate the stage (w4 default pocket; matrix leaves history open for L19 shots) — prose is underneath, not missing.
- Theme apply first-click hardened in deep polish (`shell.js` closes sprouts before apply); residual flakiness only if a non-PMMenu overlay intercepts.

### Fix — w2 stuck drawer scrim wash (`?v=31`)

**Cause:** w2 keeps `.w2-scrim` in the DOM when closed, always tagged `pm-scrim-anim`. Shared motion rule ran `pmGrokScrimIn` with `fill-mode: both`, so a closed scrim stayed at **opacity 1** — a light frosted wash (`text-primary` @ 32%) over the whole chat. Not related to Goal Paused.

**Fix:** enter animation only when open (or for mount-only scrims on other windows); dormant w2 scrim forced `opacity: 0` / `animation: none`; `pm-scrim-anim` only attached while drawers are open. Cache **`?v=31`**.

## Missing affordances inventory

Historical inventory once lived at in-folder `verification/affordance-inventory.md` (removed with the `verification/` directory). Concept-owned chrome remains the peer contract; Usage Detail (GAP-006) stays out of scope.
