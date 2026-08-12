# HANDOFF — Kimi K3 Assistant Chat Concept Workspace (continuation brief)

> **STATUS UPDATE 2026-08-12 — supersedes everything below where they conflict.**
> The build described below as "remaining" is **complete**, twice over: the Revision 2 set
> (2026-07-31) and the **final cumulative packet update** (2026-08-12: route picker, access
> profiles, BSD variants, offline/outbox sync, attachments, spellcheck, typed thread ops,
> Goal/capacity/crew/ops work surfaces, artifact workspace, packet fixtures, full harness).
> - Workspace now lives at `P:\Concepts\chat-assistant-concepts\kimi-k3\` (Windows); the
>   macOS paths below are historical.
> - Verification harness is `harness/` (zero-dependency CDP driver), NOT `verification/`;
>   run steps in `harness/commands.md`; results in `TEST_REPORT.md` + `interaction-test-report.json`.
> - Current truth: `README.md`, `TEST_REPORT.md`, `SPEC_GAPS.md`, `impact-register.json`,
>   `demo-trigger-report.json`, `plan-owner-delta.md`, `candidate-*-delta.json`.
> - All 16 concept modules, `_shared/states.js` (71 driver keys), and all reports exist and pass:
>   1408/1408 matrix, 4544/4544 feature-states, 304/304 packet probes, validate.py exit 0.
> The §4 "Current state" table and remaining-work specs below are kept as historical context only.

---


**For:** any coding agent (any platform) continuing this build. You need zero prior context — this file plus the cited sources are the whole brief.
**Written:** 2026-07-30, mid-build, after the shared foundation + kits + engines were completed and verified. Concept modules, the state driver, verification, and reports remain.

---

## 1. Mission

Build an isolated Assistant Chat concept workspace for Puppet Master:

- **8 chat-window concepts** (chrome: header/selectors, thread history, work-surface arrangement) + **8 chat-thread concepts** (transcript rendering).
- Any thread mounts in any window (**64 pairings**) via a stable composition layer — already designed; do not redesign it.
- Interactive comparison workspace labeled **Kimi K3**: broadcasts 8 themes, width presets 520/750/975/1200 + continuous slider, fake app rail open/closed, reduced-motion toggle, docked/pop-out inspection.
- Central success criterion: **readable sustained conversation at 520px width** while Goal/Todo/subagent/diff/activity/thought/questionnaire/search/Context Lens/artifact/runtime/long-thread detail stays available and truthful.

## 2. Hard constraints (violating these = failed work)

- Work **only** inside `/Users/jaredsmacbookair/Documents/PuppetMaster/Concepts/chat-assistant-concepts/kimi-k3/`.
- Never modify: `Plans/**`, `Concepts/PMConcept7.html`, command catalogs, wiring, schemas, DRY Method contracts, the parallel Usage redesign. Record discoveries in `SPEC_GAPS.md` (gap report), don't fix canon.
- **No emoji anywhere. SVG icons only** (via `K3Icons`). **No colored left-side accent borders** for selection/status/active (use background tint/outline/weight). **Human-readable text** — no underscored enum labels (`awaiting_parent` → "Waiting for parent"); underscores OK only in literal file names.
- Use the PM scrollbar treatment (already in `base.css`: hidden globally, `.k3-scroll` opt-in, themed thumb) and the PM popup family (already in `popups.js`: click-open, corner-origin sprout, one overlay at a time, Esc/outside-click close, viewport-aware, `position:fixed` body portal, reduced-motion instant).
- Reduced motion: every animated interaction must reach the identical final state instantly when `html[data-motion="reduced"]` (global kill-switch exists in `motion.css`; never leave partial transitions, never add JS animation that can't finish instantly).

## 3. Source documents (read in this order)

**Primary canon — the original handoff packet:** `/Users/jaredsmacbookair/Downloads/Puppet_Master_Chat_Concept_Handoff/`
Read these if you need requirements detail beyond §2/§5 of this file (this handoff summarizes but does NOT replace them):
1. `00_START_HERE.md` — assignment, source priority, isolation rules.
2. `01_FIXED_REQUIREMENTS.md` — every fixed behavior (scrollbars, popup family, hover-row contract, Send/Stop, search, Context Lens, Goal, questionnaires, drafts, motion, text/icon policy). Most is already implemented in the shared files — verify against this if you change behavior.
3. `02_PLANS_CANON_AND_SUPERSESSIONS.md` — owner Plans, binding PlanUnits, user supersessions (hover-Copy, Resend retired, no left accent bars…).
4. `07_DEMO_DATA_CONTRACT.md` + `08_TESTING_AND_VISUAL_AUDIT.md` — data and test contracts.
5. `machine/` — `requirements.json`, `testMatrix.json` (32 configs / 28 states / assertions), `demoData.json` (the dataset; already copied into `_shared/`), `relevantPlanUnits.json`, `sourceInventory.json`, `videoTimeline.json`.
6. `09_LATER_CANON_UPDATE_REGISTER.md` — seed content for your `SPEC_GAPS.md`.
7. `prompts/kimi-k3_BUILD_MODE.md` — the original Build Mode assignment this work continues.
8. Neutral evidence only (never design direction): `reference/pm7_chat_open.png`, `reference/pm7_popout.png`, `video_reference/` keyframes, and the two recordings in `~/Downloads/`: `ScreenRecording_07-29-2026 19-24-09_1.mov` (activity/execution, ~36s) and `ScreenRecording_07-29-2026 19-42-23_1.mov` (questionnaire flow, ~20s).

**Repo sources (read-only):**
- `/Users/jaredsmacbookair/Documents/PuppetMaster/AGENTS.md` — repo-level rules; check first.
- `Concepts/PMConcept7.html` — current interaction evidence (Tastebook hover-row structure, theme tables, popup chrome). Already distilled into the shared files; consult only if a contract question arises. **Never modify it.**
- `Concepts/rail-concepts/README.md` — behavioral reference for the gallery/workspace pattern (iframe broadcast, theme/width/reduced-motion).
- `Plans/assistant-chat-design.md`, `FinalGUISpec.md`, `Goal_Runtime_System.md`, `orchestrator-subagent-integration.md`, `UI_Command_Catalog.md`, `UI_Wiring_Rules.md` — canon owners; read for gap-report evidence only.
- `Concepts/chat-assistant-concepts/grok-4-5/` — a parallel agent's workspace. **Do not copy its design.** Its `verification/node_modules` contains vendored `playwright-core` you may copy into `verification/node_modules` (tooling only).

**Secondary:** the approved plan (architecture rationale, concept paradigms, test plan, risks) at
`/Users/jaredsmacbookair/.kimi-code/sessions/wd_jaredsmacbookair_be2fd56f4453/session_eda08316-1a89-4ca8-a046-fc66068963bf/agents/main/plans/starman-crimson-avenger-mantis.md`
(if that session path is gone, this HANDOFF + the packet are sufficient).

**The code itself** — every shared file has a header comment describing its contract.

## 4. Current state (verified 2026-07-30)

| Area | Status |
|---|---|
| `_shared/` — all 23 files | ✅ Done & builder-tested: k3.js (registry/env/ctx), store.js (semantic/view store + persistence), popups.js/.css (locked popup contract + `K3UI.popover`), bridge.js (postMessage), icons.js (72 SVG icons), shell.js/.css (fake PM shell: titlebar, app rail 240/72, dashboard ghost, editor tabs, dock + draggable pop-out float), themes.css (8 theme tables extracted from PMConcept7), base.css (scrollbar contract + primitives), motion.css (keyframes + reduced-motion gate), data.js (facade: search/send/stop/drafts/lens/questionnaires/thread mgmt; 74 node assertions passed), demo-data.js/.json (supplied dataset: 15 threads/400 msgs/22 replies), demo-augment.js (extension overlay: lens examples, extra collapsed long messages, worked≠elapsed, extra activity/thought), composer.js/.css (Send/Stop machine, drafts, questionnaire takeover; 54 assertions), search.js/.css (one-bar two-scope search; ~60 assertions), lens.js/.css (Mute/Focus/Subcompact/Turn Off + banner), questionnaire.js/.css (queue, Skip/Next morph, gated Submit, Cancel; 45 assertions) |
| `threads/_thread-kit.js/.css` | ✅ Done — the shared transcript engine (73 headless-Chrome assertions passed): messages, hover rows, long-message collapse, Context Lens display, activity/thought/subagent/diff/questionnaire-history/artifact/browser renderers, live working region, streaming, scroll anchoring + paging, reveal |
| `windows/_window-kit.js/.css` | ✅ Done — shared chrome (110 assertions passed): selectorRow (Persona/Model/Mode + effort submenu + Worktree), searchBox, lensButton/banner, contextRing, moreMenu, header, historyPanel, goalSurface, todoSurface, workChips, yield-to-questionnaire rule |
| `host.html`, `index.html` | ✅ Done — pairing host (query-param API, remount on mode flip) + comparison workspace (galleries, control bar, broadcast, inspect stage) |
| **16 concept modules** (`windows/w1..w8.*`, `threads/t1..t8.*`) | ❌ **Not started** (specs below in §6) |
| `_shared/states.js` | ❌ Not started (spec §7) — `host.html` already `<script>`-tags it and guards `window.K3States` absence |
| `verification/` | ❌ Empty (harness spec §8) |
| `SPEC_GAPS.md`, `TEST_REPORT.md`, `README.md` | ❌ Not started (spec §9) |

Script/link tags for all missing files already exist in `host.html` — create the files, no HTML edits needed. (Missing scripts 404 harmlessly over http; no JS errors.)

**Integration caveat (important):** every shared file passed its builder's isolated smoke tests (node + headless Chrome, ~500 assertions total), but the **full stack has never been booted end-to-end** — no concept module existed yet to complete a pairing. Expect a small number of integration bugs (API drift between kits/engines/shell/host). Your first task after building W1+T1 is the boot smoke test (§10 step 1); fix whatever surfaces **in place** in the shared files (you may edit anything inside `kimi-k3/`, nothing outside it).

## 5. Architecture contract (do not change)

### Boot & composition
- `host.html` boots: parse query → `K3.setEnv` → `K3Store.loadPersisted()` → `K3Data.init({seed})` → `K3Shell.mount(#k3-app, ctx)` → `mountPairing()`: window module mounts into `shell.dockRoot` (docked) or `shell.floatRoot` (pop-out); host then finds `[data-k3-slot="thread"]` and `[data-k3-slot="composer"]` inside the window's DOM and mounts the thread module + `K3Composer` into them. Mode flip = unmount → remount in other root; semantic state (store) survives.
- **THE ONE HARD RULE:** a window module renders its own chrome and provides exactly one `[data-k3-slot="thread"]` and one `[data-k3-slot="composer"]`. The host fills the slots. Neither module touches the other's DOM; cross-talk only via `ctx.data`/`ctx.store`/events.
- `index.html` embeds `host.html` iframes (window gallery w/N+t/N, thread gallery w1+t/N, inspect stage) and broadcasts `{k3:true,type:'k3-env',env}` via `K3Bridge`.

### Module registration
```js
K3.registerWindow('w1', { meta:{id:'w1', name:'Solo Column', blurb:'…'}, mount(hostEl, ctx) -> {unmount()} });
K3.registerThread('t1', { meta:{id:'t1', name:'Prose Measure', blurb:'…'}, mount(hostEl, ctx) -> {unmount(), reveal(msgId), scrollToLatest(), refresh()} });
```
`ctx = { env, on, off, emit, store:K3Store, data:K3Data, ui:K3UI, shell:K3Shell }`.
`env = { theme, width(520-1200), reducedMotion, mode:'docked'|'popout', railOpen, label:'Kimi K3', windowId, threadId, seed, state, sess }`. Subscribe to env changes: `ctx.on('env', fn)`.

### CSS scoping (enforced by tests)
- Window root: `<section data-k3-window="wN">`; **every** rule in `wN-*.css` starts with `[data-k3-window="wN"]`; classes prefixed `wN-`.
- Thread root: wrapper `<div data-k3-thread="tN">` created by the module (kit does not add it); every rule in `tN-*.css` starts with `[data-k3-thread="tN"]`; classes prefixed `tN-`.
- Shared classes only: `k3-`, `k3t-` (thread kit), `k3w-kit-` (window kit), `k3s-` (shell), `k3c-` (composer), `k3s2-` (search), `k3l-` (lens), `k3q-` (questionnaire).
- Windows size/position regions only — never style inside the thread slot. Threads fill 100%×100% of the slot — never position window chrome.

### Kit APIs you build concepts on (already implemented — read their headers)
- `K3ThreadKit.mount(hostEl, ctx, opts)` — opts: `{groupBy:'none'|'turn'|'chapter', workMode:'inline'|'chip', measure:'full'|'reading', density:'roomy'|'compact', showStageRail:bool, extraClass:'tN'}`. Renders everything transcript-related (hover row contract, collapse, lens, payloads, live region, scroll engine). Thread concepts = thin registration + opts + presentation CSS.
- `K3WindowKit` factories (each returns a fresh element, most with `.unmount()`): `header(ctx,{showSearch,compact})`, `selectorRow(ctx)`, `searchBox(ctx)`, `lensButton(ctx)`, `lensBannerHost(ctx) -> {element,unmount}`, `contextRing(ctx)`, `moreMenu(ctx)`, `historyPanel(ctx)`, `goalSurface(ctx,tid)`, `todoSurface(ctx,tid)`, `workChips(ctx,tid)`. Surfaces auto-yield to active questionnaires.

### Events (K3.emit / ctx.on)
`'env'`; `'data'` with `{type:'message-added'|'working'|'working-step'|'idle'|'stopped'|'lens-changed'|'threads-changed'|'questionnaire-resolved'|'restarted', …}`; `'reveal-message' {threadId,messageId}`; `'questionnaire-active' {threadId,active}`.

### Key testids (asserted by the harness)
Shell: `k3s-titlebar, k3s-rail, k3s-rail-toggle, k3s-tabs, k3s-dock, k3s-float`. Composer: `k3-composer-input, k3-composer-send, k3-composer-stop` (one morphing button), `k3-composer-attach, k3-composer-revisions, k3-composer-clear`. Thread kit: `k3t-scroll, k3t-msg-<id>, k3t-copy, k3t-edit, k3t-more-info, k3t-expand, k3t-activity, k3t-thought, k3t-subagents, k3t-diff, k3t-artifact, k3t-browser, k3t-live, k3t-jump-latest, k3t-subcompact, k3-lens-check`. Window kit: `k3w-kit-persona/model/mode/worktree/search/ring/more/title/history/new-thread/goal/todo`. Search/lens: `k3-search-input/results/scope-current/scope-all/result`, `k3-lens-button/banner/apply/done`. Questionnaire: `k3-quest, k3-quest-prev/next/cancel/skip/submit/option/freeform/note/dots`. Workspace: `k3-ws-theme, k3-ws-width-slider, k3-ws-preset-*, k3-ws-rail, k3-ws-rm, k3-ws-mount, k3-ws-stage-frame`.

## 6. Remaining work A — the 16 concept modules

Pattern for **threads** (thin — behavior lives in the kit):
```js
K3.registerThread('tN', { meta:{id:'tN', name:'…', blurb:'…'}, mount(hostEl, ctx){
  const root = document.createElement('div');
  root.setAttribute('data-k3-thread','tN'); root.className='tN-root'; root.style.height='100%';
  hostEl.appendChild(root);
  return window.K3ThreadKit.mount(root, ctx, { /*opts*/ extraClass:'tN' });
}});
```

| ID | Name | Kit opts | CSS direction (scoped `[data-k3-thread="tN"]`) |
|---|---|---|---|
| t1 | Prose Measure | `groupBy:'none', workMode:'inline', measure:'reading', density:'roomy', showStageRail:false` | Bubble-free prose, 68ch measure centered, 40px gutter monogram chips (`[data-role]::before` content "U"/"A" 26px circles), work records as slim inline entries |
| t2 | Spine Timeline | `groupBy:'none', workMode:'inline', measure:'full', density:'roomy', showStageRail:true` | Left spine: `.k3t-list::before` 2px vertical rule at left:10px (`--border-light`), node dots per message (hollow user / filled assistant), activity stages align as milestones |
| t3 | Turn Units | `groupBy:'turn', workMode:'inline', measure:'reading', density:'roomy'` | `.k3t-turn` as single-level card (`--surface`, `--border-light`, radius), turn head as unit header, messages bubble-free inside, 14px gaps |
| t4 | Two Register | `groupBy:'none', workMode:'inline', measure:'reading', density:'roomy'` | Asymmetric: user msgs right-aligned compact quote blocks (max-width 78%, `--surface-elevated`), assistant full-measure containerless prose, work cards full-width neutral bands |
| t5 | Ledger Rows | `groupBy:'none', workMode:'chip', measure:'full', density:'compact'` | Dense rows, 64px role-tag gutter, hairline row separators, dotted leaders in activity stage rows, mono meta at 50% opacity, work chips as total rows |
| t6 | Margin Notes | `groupBy:'none', workMode:'inline', measure:'reading', density:'roomy'` | `container-type: inline-size`; ≥700px: hover row absolutely positioned in 150px right margin (meta always visible, buttons hover-only); <700px: normal inline flow |
| t7 | Chaptered | `groupBy:'chapter', workMode:'inline', measure:'reading', density:'roomy'` | Prominent sticky chapter dividers (top:0, `--surface` bg), outline chips as mini-TOC pills, messages indented under chapters |
| t8 | Calm Chips | `groupBy:'turn', workMode:'chip', measure:'reading', density:'roomy'` | Most extreme conversation-first: unbordered spacious turns (18px gaps), work chips as quiet pills, largest prose (base +0.5px, lh 1.65), minimal hover row |

Pattern for **windows** (chrome arrangement around the two slots; use `K3WindowKit` factories):

| ID | Name | Arrangement spec |
|---|---|---|
| w1 | Solo Column | Top bar: drawer toggle + `header(ctx)`; `lensBannerHost`; expandable status strip (goal/todo/workChips summary → k3-acc expansion with the surface elements); thread slot (flex 1); composer slot; history = absolute left overlay drawer (min(300px,85%)) with `historyPanel`, slide-in transform + scrim + Esc, `display:none` when closed |
| w2 | Triptych | Persistent history rail (left ~170px, `historyPanel`) + thread slot + conditional third inspector column (goal/todo/workChips) only when `env.width>=975`; below that, surfaces move to a bottom drawer above the composer, toggled by a "Work" button. Subscribe `'env'`. (High width-pressure test host.) |
| w3 | Dock Tabs | Standard `header`; thread slot full width; tabbed dock above composer: tabs Goal/Todo/Agents/Diff/Activity with live count badges (only render tabs with data); each tab pane hosts the matching kit surface |
| w4 | Anchor Cards | Standard `header`; work surfaces as floating cards anchored to the transcript's right edge when `env.width>=975` (absolute, right gutter), collapsing to a `workChips` row at narrower widths |
| w5 | Console Footer | Standard `header`; thread slot; a console strip above the composer: one status line (goal status · todo n/m · working summary) expanding upward into a console panel holding all surfaces |
| w6 | Icon Rail | 48px left mini-rail of icon buttons (Chats/Goal/Todo/Agents) switching a 200px side panel (`historyPanel` or surfaces); thread slot takes remaining width |
| w7 | Vertical Stack | Strict column: header → goalSurface full-width band → todoSurface band → thread slot → composer; surfaces snap in/out via k3-acc; zero side columns ever |
| w8 | Sheet Modal | `header(ctx,{compact:true})`; thread slot; composer; history/surfaces/search open as bottom sheets (absolute bottom overlay, max-height 60%, slide-up, scrim, Esc) via header icon buttons |

Every window: `K3.registerWindow('wN', {meta:{id:'wN', name, blurb}, mount(hostEl, ctx) -> {unmount}})`; mount builds the chrome, provides the two slots, wires kit pieces, returns unmount that cleans everything (kit elements' `.unmount()` + listeners). The kit header already carries the "Kimi K3" agent tag. CSS scoped per §5.

## 7. Remaining work B — `_shared/states.js`

`window.K3States = { apply(key, ctx) }` — the 28 feature-state drive keys for the test harness (called by host boot after mount when `?state=<key>`; must set `window.__k3.stateApplied = key` on success). Drive via `ctx.store`/`ctx.data`, then `K3.emit('data',{type:'threads-changed'})` or select threads as needed:

`baseline` (thread-01), `long-a-collapsed`/`long-a-expanded` (thread-01 t01-m0014, collapsed vs `expandedMessages` set), `long-u-collapsed`/`long-u-expanded` (t03-m0005), `live-activity` (start a fake send on thread-01 via `data.send`), `activity-collapsed`/`activity-expanded` (t05-m0008 activityGroup), `questionnaire` (thread-12), `questionnaire-history` (thread-03), `goal-only` (thread-11 hide todo via surfaceView), `todo-only` (thread-06 hide goal via goalView cleared), `subagents-only` (thread-05), `diff-only` (thread-10 variant), `goal-todo` (thread-11), `all-surfaces` (thread-01), `search-current` (query "retention window nine days" scope current, results open), `search-all` (query "canonical source history" scope all), `lens-select` (thread-02, `setSelecting(true)` mode mute), `lens-applied` (thread-02 defaults from augment), `thought-collapsed`/`thought-expanded` (thread-11, `thoughtPref.keepActiveExpanded` false/true), `stop-visible` (thread-01 mid-working, empty composer), `send-visible` (working + draft text present), `draft-restored` (thread-08 + `simulateRestart()`), `artifact-handoff` (thread-13, push artifact to `openTabs`), `deep-jump` (thread-09, emit reveal-message t09-m0113), `mount-restored` (thread-01 with non-trivial store state already set). Where a key needs a thread without the right payload, pick the closest thread and record the choice in TEST_REPORT.

## 8. Remaining work C — `verification/` harness

Tooling (zero-install): `cp -R ../grok-4-5/verification/node_modules verification/node_modules` (vendored playwright-core; tooling only), system Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Serve with a small node static server (`verification/serve.mjs`, 127.0.0.1:8765) — plain `python3 -m http.server` flakes under Playwright.

Files to create: `package.json` (type:module), `serve.mjs`, `fixtures.mjs` (launch, `openHost(page,{window,thread,theme,width,rail,rm,mode,state,seed,sess})`, console/pageerror trap filtering favicon+font net errors, `waitBoot` waiting `__k3.data.ready`, `setEnv`), `probes.mjs` (noHorizontalOverflow, noConsoleErrors, noEmoji, noUnderscoredLabels with filename exemptions, noLeftAccentBorders, scrollbarNoLeak, popupContract, sendStopMachine, remountPreserves, draftSurvivesRestart, exactJump), `run-pair-smoke.mjs` (**all 64 pairings**: mount, data ready, slots non-empty, ≥3 messages, composer present, "Kimi K3" label, zero console errors), `run-matrix.mjs` (8 windows×default thread + 8 threads in w1 AND w2 hosts; 8 themes×4 widths×rail open/closed per pairing, drive via `setEnv` without reload; probes + screenshots), `run-feature-states.mjs` (28 states × 32 configs on w2+t1, screenshots), `run-reduced-motion.mjs` (motion interactions × full/reduced × 520/1200, final-state parity), `run-mounts.mjs` (remount state preservation, draft restart, scroll anchor, search/lens state), `run-policy-scan.sh` (wraps `scripts/pm-gui-asset-policy.py --source-root …/kimi-k3`), `commands.md`. Results → `verification/results/*.json`, screenshots → `verification/screenshots/{matrix,features,motion,mounts,contact-sheets}/`.

Coverage targets (from machine/testMatrix.json): 32 theme-width configs × rail open/closed for all 8 windows (docked) and all 8 threads (≥1 host, 2 preferred); 64-pair smoke; 28 feature states × 32 configs; mounts; reduced motion; automated assertions incl. emoji scan, underscored labels, left-accent scan, OS-scrollbar leakage, console errors, overflow, Send/Stop machine, draft restore, questionnaire queue order, exact jump, scroll anchor. Then **visual inspection** of screenshot batches (geometry checks are not a substitute) against the packet's 15+3 audit criteria — use subagents per theme batch, write findings, repair, re-run.

## 9. Remaining work D — reports

- `README.md` — concepts table (8+8, no ranking), mount contract, testid contract, coverage table, run instructions (`node verification/serve.mjs` → http://127.0.0.1:8765/ for the workspace; `/host.html?window=w1&thread=t1` for a single pairing; works over file:// too since data ships as JS).
- `SPEC_GAPS.md` — gap report, IDs `K3-GAP-##`, columns: Gap ID | Feature | Description | Evidence source | PlanUnit/command ref | Category (missing/conflicting/stale/ambiguous/implementation-only) | Prototype impact | Later owner | Provisional? Seed with the packet's confirmed gaps: questionnaire `cmd.questionnaire.*` family absent from catalog; `cmd.chat.thread.*` vs `cmd.chat.*` namespace split; investigation-context ID drift; hover-Copy/Resend/left-accent supersessions; questionnaire expiration retirement; width canon reconciliation; underscored-enum display rule; machine-flagged retirements (hover-open context module, header icon row → kebab, beside-ring label, HISTORY→Chats); Friendly/Glass scrollbar width unspecified in FinalGUISpec; dataset thin spots (no lens fields, one collapsed message, worked==elapsed) — prototype augmented via `demo-augment.js` (flag provisional).
- `TEST_REPORT.md` — coverage counts, state→evidence map, host pairings per thread concept, 64-pair smoke result, reduced-motion result, visual-audit findings+repairs, known issues, exact run commands.

## 10. Continuation order (recommended)

1. Build W1+T1 (reference pair) → boot smoke: serve the folder (`node verification/serve.mjs` once it exists, or `python3 -m http.server 8791 --bind 127.0.0.1` for a quick check; the workspace needs an http origin — file:// iframes/localStorage are unreliable), headless Chrome, assert: zero console errors, `__k3.pairing()`, slots filled, messages render, fake send works (type → Send → working region appears), width 520 no horizontal overflow, drawer opens/selects, pop-out remount preserves scroll anchor. Fix integration bugs in shared files (see caveat above).
2. Build remaining 7 windows + 7 threads (parallelize: 2 agents × windows, 2 × threads, bounded per §6).
3. `states.js` (§7).
4. Verification harness (§8) → run pair smoke (64) → matrix → feature states → motion → mounts.
5. Visual audit per theme batch → repairs → re-run affected sweeps.
6. Reports (§9).

**How to view the workspace once running:** serve `kimi-k3/` over http and open `/index.html` (comparison workspace) or `/host.html?window=w1&thread=t1` (single pairing).

## 11. Pitfalls & integration notes (learned during this build)

- The dataset ships as **JS** (`demo-data.js` assigns `window.K3_DEMO_DATA`) so `file://` works; `demo-data.json` is the machine-readable copy. No `fetch` anywhere.
- `demo-augment.js` merges at `K3Data.init` — it flips `collapsedByDefault` on t03-m0005 ("blue lantern checkpoint"), inserts one long message `t09-m0060a` ("canonical source history" near its end), adds lens examples (thread-02 muted/focused, thread-09 subcompacted), worked≠elapsed runtimes, and extra activity/thought payloads. Post-merge stats: 15 threads / **401** messages / 22 replies.
- Composer Send/Stop is **one morphing button** (testid swaps send↔stop). Questionnaire primary action similarly morphs Skip/Next/Submit.
- `K3Search.attach` stamps `k3-search-input` on the input; window-kit re-stamps `k3w-kit-search` — both are asserted in different suites; keep both.
- Search.js grouped view nests subcompact sources under their summary hit (`.k3s2-children`, indent only — no left border).
- Thread kit: hover-row space is always reserved (opacity-gated), user-message meta falls back to the launched reply's runtime, `reveal()` on a subcompacted message auto-rehydrates first, kit `showStageRail` renders a per-message dot strip.
- Window kit: goal surfaces use `goalView.<tid>.statusOverride` for pause/resume/stop; "Thread info" popover defers one tick (menu closes popups after action); ring computes usage from the active thread's last runtime.
- lens.js exposes `K3Lens.button(ctx) -> element` with `.unmount()` on the element.
- All kit factories return fresh DOM per call and most carry `.unmount()` — call it in your module's unmount.
- `host.html` guards `window.K3States` absence; until states.js exists, `?state=` is a no-op.
- Fonts: Google Fonts `<link>` in both HTML files is a preview convenience (same as PMConcept7); offline it falls back to system stacks — fine.
- Two earlier subagent waves died on API quota (HTTP 403); a few files they left behind were audited and kept. If you see quota errors, wait and resume — do not restart completed files from scratch; audit first.
- Port ranges used so far: 8765 (verification server), 8791 (ad-hoc smoke; free now).

## 12. Quick validation commands

```bash
cd /Users/jaredsmacbookair/Documents/PuppetMaster/Concepts/chat-assistant-concepts/kimi-k3
node --check _shared/*.js windows/*.js threads/*.js        # syntax
node verification/serve.mjs &                               # http://127.0.0.1:8765/
# headless smoke (after vendoring playwright-core into verification/):
NODE_PATH=verification/node_modules node your-smoke.mjs
```

**Definition of done** (from the assignment): all 16 concepts selectable in the workspace; demo data + fake sends work; all fixed interactions work; 32-config sweeps + rail states + mounts + 28 feature states + 64-pair smoke + reduced motion all green; zero console errors/overflow/clipping/OS scrollbars/emoji/left accent borders/underscored labels; docked↔pop-out state survives; screenshot/contact-sheet evidence produced; TEST_REPORT.md + SPEC_GAPS.md + README.md complete.
