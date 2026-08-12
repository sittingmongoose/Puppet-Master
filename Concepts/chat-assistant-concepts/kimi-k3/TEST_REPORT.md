# TEST_REPORT.md — Kimi K3 Assistant Chat concept

Headless verification + visual audit results. Harness: `harness/` (zero-dependency CDP driver; `playwright-core` optional) + system Chrome headless. See `harness/commands.md` for run steps and `SPEC_GAPS.md` for gaps. Results/screenshots write to OS temp (`%TMP%/k3h-<pid>/`) — the Hub validator bans them from the model folder.

## Final cumulative packet run (2026-08-12)

| Sweep | Configs | Passed | Result file (OS temp) |
|---|---|---|---|
| Boot smoke (dataset + controller contract) | 7 checks | 7/7 | stdout |
| Pair smoke — all 64 pairings | 64 | 64/64 | pair-smoke/results.json |
| Matrix — 8 themes × 4 widths × rail × 22 pairings | 1408 | 1408/1408 | matrix/results.json |
| Feature states — 71 keys (28 legacy + 43 packet) × 64 pairings | 4544 | 4544/4544 | feature-states/results.json |
| Reduced motion parity | 112 | 112/112 | reduced-motion/results.json |
| Mounts (remount/switch/restart) | 64 | 64/64 | mounts/results.json |
| Packet behavioral probes — 19 probes × 16 configs | 304 | 304/304 | packet-probes/results.json |
| Terminology (PM-native browser vocab; no yolo) | source+rendered | clean | terminology/results.json |
| ConceptHub validation | validate.py | exit 0 | stdout |

**All suites green.** New-behavior spot proofs (offline replay fence, material route warning + branch, BSD glow/On/scope-revert, artifact geometry + draft/scroll preservation, spellcheck menu/skips, thread request/await + cycle rejection, redirect 3-state, notification inbox) are named cases in `interaction-test-report.json`.

### Defects fixed during this update
- `host.html` never recorded `__k3.stateApplied` on initial boot (states applied before the hooks object existed) — hoisted.
- storeSeeds merge skipped `bsdState` entirely (blankSemantic ships `{}`, not null) — subkey merge.
- store.js header wrongly claimed drafts persist under `k3.drafts.<sess>` — corrected.
- w4 Chats card unreachable when unpinned with no work — persistent collapsed chip repair.
- w7 null `activeThreadId` wrote `surfaceView.null.*` — guarded (also w3/w5/w6/w8 pin handlers).
- w8 no-op `actions.addEventListener('click', function () {})` — removed.
- Header sync pill was wiped on every title render (`chipHolder.innerHTML=''`) — persistent chrome.
- Goal route changes silently retargeted running Goals — guard wired through route/access/persona/mode.
- t5 ledger hover row and t6 parked margin meta could exceed the transcript content box at tight widths — clamped.
- `lens.js` receipt view shipped with an undefined `pop` reference (crashed on open) — fixed.
- Artifact was editor-tab handoff only — real left workspace per window idiom.

### Known residuals (honest)
- w7 artifact workspace is an in-flow band (stack), not literal left — documented deviation (packet allows a stack); fallback exists if the auditor rejects it.
- w6 narrow artifact viewing is a deliberate focused overlay; w8's persistent form is the docked strip.
- Hub `tests/test_catalog.py` static card count 91→92 — Hub owner fixture bump (not edited here).
- Hub `server.py` needs the documented `os.getuid` shim on Windows (not edited here).

## Revision 2 run (2026-07-31, historical)


## Coverage summary

| Sweep | Configs | Passed | Result file |
|---|---|---|---|
| Boot smoke (W1×T1 end-to-end) | 17 checks | 17/17 | (stdout) |
| Pair smoke — all 64 window×thread pairings | 64 | 64/64 | `results/pair-smoke-results.json` |
| Matrix — 8 windows×t1 + 8 threads in w1 & w2; 8 themes × 4 widths × rail open/closed | 1408 (22 pairings × 64) | 1408/1408 | `results/matrix-results.json` |
| Feature states — 28 states × 64 configs on w2+t1 | 1792 (28 × 64) | 1792/1792 | `results/feature-state-results.json` |
| Reduced motion — full vs reduced final-state parity @520/1200 | 8 interactions × 2 widths | 8/8 | `results/reduced-motion-results.json` |
| Mounts + behavior | 8 checks | 8/8 | `results/mounts-results.json` |
| GUI asset policy — emoji / unicode pseudo-icons | source scan | clean | `results/policy-scan.log` |

**Total automated assertions: 3297 checks, all green.** Zero console errors, zero horizontal overflow, zero text clipping, zero OS-scrollbar leakage, zero emoji, zero colored left-accent borders, zero underscored labels — across every theme, width, rail state, mount, and feature state.

## Automated assertion probes (per packet §6)
Encoded in `verification/probes.mjs` and run inline by the matrix/feature runners:
- `no-horizontal-overflow` (document + element level)
- `no-text-clipping` (overflow-hidden regions wider than content)
- `no-emoji` (pictograph / symbol / arrow ranges)
- `no-underscored-labels` (snake_case status labels, with file/path exemptions)
- `no-left-accent-borders` (>2px colored left border on active/selected elements)
- `scrollbar-no-leak` (scrollable surfaces not opting into `.k3-scroll`)
- `no-console-errors` (pageerror + console:error, filtering fonts/favicon/404)
- Behavioral: Send/Stop machine, draft-survives-restart, exact-jump, remount-preserves, popup-contract, search/lens/questionnaire state survival.

## State → evidence map (28 feature states)
Host: w2+t1. Full per-config matrix in `results/state-evidence-map.json`. Representative evidence screenshots in `verification/screenshots/features/<state>-friendly-dark-750.png`.

| # | State | Thread | Evidence |
|---|---|---|---|
| 1 | baseline | thread-01 | clean conversation, composer visible (questionnaire dismissed) |
| 2 | long-a-collapsed | thread-01 (t01-m0014) | collapsed long assistant message + expand control |
| 3 | long-a-expanded | thread-01 (t01-m0014) | full prose expanded |
| 4 | long-u-collapsed | thread-03 (t03-m0005) | collapsed long user message |
| 5 | long-u-expanded | thread-03 (t03-m0005) | full user message expanded |
| 6 | live-activity | thread-01 | live working region + "Worked for Xs" timer + Stop |
| 7 | activity-collapsed | thread-05 (t05-m0008) | completed activity card collapsed |
| 8 | activity-expanded | thread-05 (t05-m0008) | expanded: 4 stages with durations 6s/28s/17s/6s |
| 9 | questionnaire | thread-12 | active questionnaire owns composer; 2 queued |
| 10 | questionnaire-history | thread-03 | inline submitted questionnaire in transcript |
| 11 | goal-only | thread-11 | Goal surface, Todo hidden |
| 12 | todo-only | thread-06 | Todo surface, Goal cleared |
| 13 | subagents-only | thread-05 | subagent aggregate + per-agent rows |
| 14 | diff-only | thread-10 | file-change surface with +/- counts |
| 15 | goal-todo | thread-11 | both Goal and Todo |
| 16 | all-surfaces | thread-01 | Goal + Todo + subagents + diff + activity + artifact |
| 17 | search-current | thread-09 | popup, scope Current, "retention window nine days" |
| 18 | search-all | thread-09 | popup, scope All, "canonical source history" |
| 19 | lens-select | thread-02 | Context Lens selection mode (mute) |
| 20 | lens-applied | thread-02 | applied focus/mute shaping |
| 21 | thought-collapsed | thread-11 (t11-m0006) | thought stream auto-collapsed |
| 22 | thought-expanded | thread-11 (t11-m0006) | active thought expanded via keep-active setting |
| 23 | stop-visible | thread-01 | working + empty composer → Stop |
| 24 | send-visible | thread-01 | working + draft present → Send |
| 25 | draft-restored | thread-08 | restored draft after simulated restart |
| 26 | artifact-handoff | thread-13 | artifact shortcut + editor-tab handoff |
| 27 | deep-jump | thread-09 (t09-m0113) | revealed older paged-out message |
| 28 | mount-restored | thread-01 | state restored after mount change |

**Thread substitutions** (where the ideal payload did not exist on a single thread, the closest was chosen): `diff-only` uses thread-10 (subs + diffs + activity; the diff surface is isolated). `subagents-only` uses thread-05 (subagents + activity; activity suppressed). These are faithful to the state intent.

## Host pairings per thread concept (packet §3: ≥1 host, two structurally different hosts preferred)
Every thread concept is audited in **both** w1 (Solo Column, minimum-width reference / spacious) and w2 (Triptych, width-pressure host), across all 32 theme-width configs × rail open/closed. All 8 windows are audited with their default thread (t1).

## Reduced-motion result
8/8 parity checks pass. For each motion-bearing interaction (long-message expand/collapse, w1 history drawer, w8 bottom sheet, persona popup) run under full motion and under `html[data-motion="reduced"]`, the **final state is identical** (same open/closed, same visibility, same content) — no partial transitions left behind, at both 520 and 1200px.

## Visual-audit findings + repairs
Two visual-audit passes were run (subagents using image analysis on the captured screenshots).

**Pass 1 — theme/reference frames (14 frames: 8 themes × w1/w2 × 520/1200):** all **ship-ready, zero defects**. Every theme renders complete (no partially-themed / default-white boxes); no left-accent bars; no emoji; no clipping/overflow; conversation readable at 520px; w2 collapses the inspector correctly under 975px.

**Pass 1 — feature-state frames (28 frames):** the prototype rendered cleanly (no policy violations), but the **screenshot capture pipeline** had two bugs that produced wrong/stale frames for some states:
- *State bleed:* the capture reused one page without resetting, so working sequences and appended messages from earlier states persisted (caused duplicate frames: `long-a-expanded`≡`all-surfaces`, `activity-expanded`≡`subagents-only`).
- *State-driver gaps:* `baseline` showed thread-01's default questionnaire; `send-visible`/`stop-visible` didn't morph the Send/Stop button (the composer reads its live textarea, not the store draft — K3-GAP-017); `activity-expanded` toggled an inert store key (`surfaceView.activityOpen`, K3-GAP-016) instead of expanding the card.

**Repairs applied:**
1. Rewrote `capture-shots.mjs` to reload the page per capture (fresh data facade, no state bleed) and size the viewport before navigation.
2. `states.js`: `baseline` now dismisses thread-01's questionnaire; `send-visible`/`stop-visible` mirror the draft into the live textarea (+ input event) so the Send/Stop morph is real; `activity-expanded` expands the activity card via its header click.
3. Confirmed all 28 captured frames are now distinct (md5-unique).

**Pass 2 — re-audit of the 10 repaired states:** **9/10 pass with direct quoted evidence** (baseline clean, live-activity shows timer "Worked for 7s", diff-only shows file list with +104 -61 etc., draft-restored shows restored text, send-visible shows Send + draft, stop-visible shows Stop, all-surfaces shows multiple surfaces, long-a-expanded fully expanded, activity-collapsed correct). The one apparent failure — `activity-expanded` — was a **vision-model read limitation** (couldn't resolve the small duration text); DOM verification confirms the card IS expanded with 4 stages carrying durations `6s, 28s, 17s, 6s`. No actual defect.

## Comprehensive visual QA pass (per-concept, per-theme, per-size)
A second, deeper visual-QA pass covered every concept at every size and across themes — beyond the per-state audit above. Three reusable harness scripts live in `verification/`: `qa-probe.mjs` (geometry), `qa-shots.mjs` (screenshot matrix), `popup-shots.mjs` (open-menu layering). 478 QA screenshots in `verification/screenshots/qa/`.

**Geometry probe — 96 concept×width combinations (all 8 windows × t1 + all 8 threads × w1 + all 8 threads × w2, each at 520/750/975/1200):**
- **0 FAIL.** No horizontal overflow, no pill/chip overflow (badge content never spills outside its chip), no zero-size regions, no popup-layering failure (every popup at z-1400 sits above all window chrome — drawers/sheets at z-40/41, float at z-900).
- 633 WARN, all verified to be **intended ellipsis truncation** (`text-overflow:ellipsis` on history-row titles and selector labels at narrow widths) — graceful truncation with a visible "…", full text on hover via `title`. Not defects.

**Vision audit — windows (32 shots + 3 wide spot-checks):** all 8 windows × friendly-dark/light × 520/975 ship-ready on all 7 criteria (alignment, squashing, cut-off/spilling, pills/chips, theme, content, header). Deep-dives on the highest-risk elements: w3 dock tabs — all 5 count badges fully contained at 520, no clipped numbers; w2 — inspector correctly hides at 520 with a "Work" drawer trigger; w4 — cards collapse to a tidy chip row at narrow widths.

**Vision audit — threads (48 shots):** all 8 threads × both hosts (w1, w2) × both themes × 520/975 ship-ready. Targeted close-ups on t5 (YOU/ASST gutter tags at 520) and t7 (TOC pills at 520) confirmed no clipping inside pills/badges. Dotted leaders (t5), monogram gutters (t1), spine dots (t2), unit cards (t3), two-register asymmetry (t4), margin metadata (t6), chapter dividers (t7), and calm-chip spacing (t8) all align consistently.

**Menu layering — 6 open-menu shots:** Persona selector, Model+effort submenu, Context Ring popover, thread "more" menu (above the drawer), a popup over an open w8 sheet, and a light-theme popup — all **layering-correct**. Every menu pops out in front of components, fully visible, clear background+shadow, SVG icons only.

**Motion contract review:** all keyframes are transform/opacity (GPU-composited, Slint-portable, no layout thrash) except two sanctioned decorative ones (highlight flash, shimmer). Every animation ends in a state identical to no-animation (content never hidden behind motion). Reduced-motion gate verified to collapse all transitions to ~instant with identical final states (8/8 parity).

## "Alive" motion upgrade — every surface + component
A subsequent pass made the whole workspace feel alive. New motion foundation tokens (`--ease-bounce`, `--ease-elastic`, `--ease-soft-out`, `--ease-soft-spring`, `--motion-xslow`) layer alongside the existing ones (nothing mutated). New keyframes: `k3-rise`, `k3-scale-in`, `k3-check-pop`, `k3-row-in` (stagger), `k3-dot-orbit` (the reference video's four-dot spinner), `k3-spring-settle`, `k3-sheen-soft`, `k3-shake`, `k3-count-up`, `k3-attention-pulse`. New utilities: `.k3-anim-rise/.k3-anim-scale-in`, a `.k3-stagger > *` child-stagger primitive, `.k3-orbit` spinner, `.k3-count`. The `k3-acc` accordion now staggers its children on open — single rule, lights up reveals everywhere. **Motion audit: 12/12 checks passed** (`run-motion-audit.mjs`).

- **Global reveals + alive working states:** surfaces spring/pop in on mount; `k3-acc` children stagger (todo lists, goal sections, activity stages, subagent/diff rows); the live working region gets an entrance + the four-dot orbit spinner + count-up timer + a condense flourish on completion; the questionnaire-yield `yieldWrap` crossfades instead of hard-swapping; hover lifts, springy chevrons, and press depressions across all controls.
- **Goal:** status-dot color transitions; `is-blocked` slow-pulse on the status dot + a one-shot shake on the blocked-detail card to draw the eye; replan feedback (the 1.2s "Replanning" flash) becomes a real status-pill morph + objective shimmer; goal sections stagger in.
- **Todo:** per-item state-transition animations via a previous-state diff (completing → check-pop + lime settle; blocked/failed/cancelled → shake; running → calmer sheen sweep); the "n/m done" count animates.
- **Activity:** staged step reveal (each stage fades+rises, dotted leaders draw in); stage completion check-pop; the live region advances steps with a rise-in/condense.
- **Questionnaire — four distinct choreography variants** (selected per window, shared data API): `morph` (faithful to the reference video: pill↔card height morph, staged option reveal, Skip→Submit morph, orbit preparing beat, spring-back dismiss) for w1/w7; `rise` (calm/airy cascade) for w2/w4; `stack` (playful/tactile elastic) for w3/w6; `inline-strip` (compact) for w5/w8. Each variant ships its own entrance + advance motion. Selection check-pop + Skip→Next→Submit crossfade morph shared across all.
- **All other cards animate:** subagent rows stagger on expand (per-agent status dots animate); diff rows stagger with count-up +/- stats; artifact/browser shortcuts spring in; thought streams rise; the Context Lens banner rises in; search results stagger.
- **Pinnable thread history (idiom-matched):** every window can now keep history visible alongside chat. w3 adds a Chats dock tab; w4 a history anchor card; w5 a Chats console section; w7 a collapsible Chats band; w1/w6/w8 get pin toggles on their existing drawer/panel/sheet; w2 already persistent. Pin state persists via `surfaceView.<tid>.wNHistoryPinned`.
- **Animated status symbols in history rows** (symbol-only, no text): working = orbit spinner; needs-attention = slow-pulsing warning/question glyph; finished = calm static check/dot. Three buckets derived from the existing thread summary (no data change).

All new motion honors the reduced-motion contract: every keyframe ends at the natural resting state, and the global `html[data-motion="reduced"]` gate collapses all durations to ~instant. Verified by the motion audit (full-vs-reduced parity per choreography) and the reduced-motion suite (8/8).


1. **`activity-expanded` vision read** — the per-stage durations (`6s`/`28s`/`17s`/`6s`) are present and correct in the DOM and rendering, but small enough that the image-analysis model mis-read them as absent. Not a defect; documented for audit honesty.
2. **GUI policy scanner false-positives** (K3-GAP-019/020) — `icon_only_controls_require_accessible_labels` flags the centralized `iconButton(name,label,testid)` factory (which does set `aria-label`+`title`); `no_network_or_cdn_icons` flags the sanctioned Google Fonts preview `<link>`. Both are tooling/policy artifacts, not prototype defects.
3. **Provisional data augmentation** (K3-GAP-015) — `demo-augment.js` adds lens examples, a second collapsed long message, and worked≠elapsed runtimes to meet coverage; the canonical dataset owner should confirm.
4. **Feature-state sweep runs states on one page** (no reload between states) for speed; its policy battery (overflow/emoji/labels/borders/console) passes 1792/1792, but state-*specific* feature visibility is validated by the per-state reload capture + visual audit, not the sweep itself.

## Film-level polish pass — defects found and fixed
After the motion upgrade, a skeptical live-audit (two exploration agents + a live Playwright walk-through of 134 frames across every concept × width × theme) found real defects, all now fixed and verified:

1. **yieldWrap doubled height** — when a questionnaire owned the surfaces, both the yield strip AND the (faded) surface stayed in normal flow, doubling the vertical footprint. Fixed: the inactive one now collapses to `max-height:0; overflow:hidden` so exactly one occupies layout. Also fixed a pre-existing surface-orphan leak in w2/w4 `unmountSurfaces` (stale surface nodes accumulated on thread-switch).
2. **Pinnable-history crush at 520px** — w1 drawer-pin covered 85% of the transcript; w6 side panel crushed it to ~272px; w8 Chats-sheet pin covered the composer; w7 pinned band could starve the transcript. Fixed: pinning now reserves layout space (w1 side gutter `min(220px,42%)`; w6 narrow-width breakpoint hiding the 200px panel below 720px unless pinned, capping to a 150px sliver; w8 docks the pinned chats above the composer as an in-flow strip; w7 caps the band at `min(28vh,220px)` + a transcript `min-height:180px` floor). Verified: every window keeps the transcript ≥300px at 520px when pinned.
3. **w3 tabs silent overflow** — the tab strip hid its scrollbar, so overflow at 520px gave no cue. Fixed: a thin themed scrollbar + edge-fade gradients (`is-overflow-left/right`) + active-tab auto-scroll, so all tabs are reachable.
4. **Questionnaire entrance re-played on every docked↔popout toggle** — `firstShown` reset per mount. Fixed: tracked by questionnaire id in a module-level map; a remount of the same active questionnaire no longer replays the 540ms entrance. Verified.
5. **Goal replan-flash lingered 1.2s under reduced motion** — the flashTimer was ungated. Fixed: 0ms under reduced motion so the replan pill doesn't appear-then-vanish.
6. **Tier-2 polish** — stagger delay capped at 8 steps (long lists no longer drag their tail); `.k3w-kit-sel` double-transition consolidated; `.k3w-kit-thread-row.is-active` flicker fixed (dedicated `k3-row-active-settle` keyframe landing on accent-soft); morph/stack questionnaire entrances softened (scaleY .4→.62, elastic→soft-spring) to eliminate any text distortion.

**Live walk-through result:** 134 frames audited (8 windows × 4 widths × 4 themes + 8 threads × 2 hosts × 2 widths + motion states). All prior defects confirmed fixed. No new clipping, crush, misalignment, theme gaps, or mid-animation artifacts found. The one threads-audit flag (jump-to-latest pill clipping at 520px) was verified a false positive via DOM measurement (`right:1262 ≤ slot:1280`).

## Run commands
```bash
cd Concepts/chat-assistant-concepts/kimi-k3
node verification/serve.mjs                       # http://127.0.0.1:8765/  (keep running)
node verification/boot-smoke.mjs                  # 17 checks
node verification/run-pair-smoke.mjs              # 64 pairings
node verification/run-matrix.mjs                  # 1408 configs
node verification/run-feature-states.mjs          # 1792 configs
node verification/run-reduced-motion.mjs          # 8 parity checks
node verification/run-mounts.mjs                  # 8 behavior checks
bash verification/run-policy-scan.sh             # GUI asset policy
node verification/capture-shots.mjs              # refresh screenshot evidence
# quick iteration: QUICK=1 node verification/run-matrix.mjs  (1 theme × 2 widths)
```
