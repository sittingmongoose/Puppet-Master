# fable Settings Bakeoff — Shared Contract

Binding API and conventions for every file in this folder. Concept pages depend on `_shared/` exactly as specified here; `_shared/` implements exactly this. Anything not specified is per-concept freedom (and divergence is required).

## Ground rules (from packet + CONCEPT_RULES — non-negotiable)

- Work ONLY inside `Concepts/settings-redesign-concepts/fable/`.
- No emoji anywhere (source or rendered). Inline SVG only.
- No colored left-side borders for status/selection/active nav.
- No primary category controls shaped like filter pills.
- No raw internal enums/underscores/IDs in ordinary UI copy.
- No hover-only critical meaning; keyboard focus must reach everything hover reveals.
- No fake no-op actions: anything that cannot really run returns an honest simulated receipt (`PMState.receipt`).
- Never show an unqualified "Free" badge; never show a universal "when budget runs out" setting.
- Access modes are `Full Access / Auto / Auto accept edits / Ask for approval` (never "Yolo"); Plan and Review are effect-limited, not tool-free.
- Blank text inputs never mean auto/inherit/disabled/not-configured — those render explicit value chips.
- All 8 themes + reduced motion; calm state has zero permanent animation.
- The fake PM shell stays visible and quiet in every state, including `?hub=1` previews.

## Page skeleton (every concept page + index)

```html
<!doctype html>
<html lang="en" data-theme="friendly-dark" data-motion="full" data-density="comfortable">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>fable · <Concept Name> — Puppet Master Settings</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Orbitron:wght@700&family=Quicksand:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="_shared/pm-shell.css">
  <link rel="stylesheet" href="c<N>-<name>.css">
</head>
<body>
  <!-- static shell skeleton (below) with data-concept-model="fable" literal in markup -->
  <script src="_shared/pm-icons.js"></script>
  <script src="_shared/pm-demo-data.js"></script>
  <script src="_shared/pm-state.js"></script>
  <script src="_shared/pm-scrollspy.js"></script>
  <script src="_shared/pm-spell.js"></script>
  <script src="_shared/pm-shell.js"></script>
  <script src="c<N>-<name>.js"></script>
</body>
</html>
```

`index.html` uses the same skeleton with its own inline styles/script allowed.

## Static shell skeleton

Every page pastes this literally (concept content goes in `.pm-stage`); `PMShell.init()` hydrates it. Do not remove the top or bottom bars in any mode.

```html
<div class="pm-shell" id="pmShell">
  <header class="pm-titlebar">
    <span class="pm-app-name">Puppet Master</span>
    <span class="pm-model-badge" data-concept-model="fable">fable · <Concept Name></span>
    <nav class="pm-page-tabs" aria-label="Pages">
      <span class="pm-page-tab">Dashboard</span><span class="pm-page-tab">Projects</span>
      <span class="pm-page-tab">Wizard</span><span class="pm-page-tab">Orchestrator</span>
      <span class="pm-page-tab">Usage</span><span class="pm-page-tab is-active" aria-current="page">Settings</span>
    </nav>
    <div class="pm-tb-controls">
      <button class="pm-tb-btn" id="pmRailToggle" aria-pressed="true" title="Toggle left rail"><i data-ico="rail"></i><span class="pm-visually-hidden">Toggle left rail</span></button>
      <button class="pm-tb-btn" id="pmChatToggle" aria-pressed="false" title="Toggle Assistant panel"><i data-ico="chat"></i><span class="pm-visually-hidden">Toggle Assistant panel</span></button>
      <button class="pm-tb-btn" id="pmMotionToggle" aria-pressed="false" title="Toggle reduced motion"><i data-ico="motion"></i><span class="pm-visually-hidden">Toggle reduced motion</span></button>
      <div class="pm-theme-wrap">
        <button class="pm-tb-btn" id="pmThemeBtn" aria-haspopup="menu" aria-expanded="false" title="Theme"><i data-ico="palette"></i><span class="pm-visually-hidden">Theme</span></button>
        <div class="pm-theme-menu" id="pmThemeMenu" role="menu" hidden></div>
      </div>
    </div>
  </header>
  <div class="pm-main">
    <aside class="pm-rail" id="pmRail" aria-label="Activity"><!-- PMShell fills quiet rail icons --></aside>
    <main class="pm-stage" id="pmStage"><!-- CONCEPT RENDERS HERE --></main>
    <aside class="pm-chat" id="pmChat" hidden aria-label="Assistant">
      <div class="pm-chat-head">Assistant<button class="pm-tb-btn" id="pmChatOverflow" aria-haspopup="menu" title="Thread options"><i data-ico="more"></i><span class="pm-visually-hidden">Thread options</span></button></div>
      <div class="pm-chat-body" id="pmChatBody"><!-- PMShell fills quiet placeholder + spellcheck demo composer --></div>
    </aside>
  </div>
  <footer class="pm-statusbar"><span id="pmStatusLeft">Ready</span><span id="pmStatusRight"></span></footer>
</div>
```

## `_shared/pm-shell.css`

- PM7 SECTION 2 token contract, extracted verbatim-adapted (source lineage: `Concepts/PMConcept7.html` SECTION 2 core-css; canonical spec Plans/FinalGUISpec.md Theme System Addendum). `:root` + all 8 `[data-theme="…"]` blocks: `friendly-dark` (default), `friendly-light`, `glass-dark`, `glass-light`, `retro-dark`, `retro-light`, `basic-dark`, `basic-light`. Token names preserved: `--background --surface --surface-elevated --surface-alt --text-primary --text-secondary --text-muted --border --border-light --accent-primary --accent-primary-rgb --accent-soft --accent-glow --accent-blue --accent-magenta --accent-lime --accent-orange --accent-warning --accent-error --radius-xs --radius-sm --radius-md --radius-lg --radius-xl --radius-pill --border-radius --border-width --elev-1 --elev-2 --elev-3 --shadow --motion-fast --motion-med --motion-slow --ease-out --ease-spring --ease-smooth --ease-snap --ease-default --fs-2xs --fs-xs --fs-sm --fs-md --fs-lg --fs-xl --fs-2xl --fs-3xl --display-font --body-font --mono-font --xs --sm --md --lg --xl --2xl --3xl --glass-alpha --glass-tint-rgb --panel-blur`. Glass wallpaper is a plain CSS gradient (no webp payloads, max ONE backdrop-filter layer anywhere).
- Shell layout: titlebar 40px, statusbar 24px, rail 72px (36px when `.pm-shell.rail-collapsed`), chat panel 380px (`.pm-shell.chat-open`), `.pm-stage` flexes. Shell chrome is deliberately quiet: `--surface-alt` fills, no decoration, muted text.
- Width plumbing: `body { display:flex; justify-content:center; background:var(--background) }`, `.pm-shell { width:min(100vw, var(--hub-viewport-width, var(--hub-page-width, 100vw))); height:100vh }`.
- Reduced motion: three equivalent kill switches — `@media (prefers-reduced-motion: reduce)`, `html[data-motion="reduced"]`, `html[data-reduced-motion="1"]` — each forcing `animation-duration:.01ms; animation-iteration-count:1; transition-duration:.01ms; transition-delay:0ms; scroll-behavior:auto` with `!important`.
- Utility classes: `.pm-visually-hidden`, `.pm-focus-flash` (backgroundtint decay, no flashing loop), value chips `.pm-chip-value[data-kind="auto|inherited|not-configured|managed|default|recommended|custom|unavailable|differs"]` (neutral silhouettes, NOT pill-primary-nav — these are small value annotations, allowed), status words `.pm-status-word[data-tone="attention|setup|recommended|ok|muted"]` (weight/underline/icon differences, never color-only).

## `_shared/pm-shell.js` — `window.PMShell`

- `PMShell.init({concept, onWidthChange?, onThemeChange?})`: hydrates icons (`PMIcons.hydrate(document)`), wires rail/chat/motion/theme controls, restores per-concept persisted UI prefs, fills quiet rail + Assistant placeholder (Assistant body includes one `contenteditable` composer wired with `PMSpell.attach` and an overflow menu containing "Turn off spellcheck for this thread"), mounts the hub bridge.
- Hub bridge (validate.py contract): listens for `message` events where `data.source === "pm-concept-hub" && data.type === "pm-concept-state"`; applies `state.theme` → `data-theme` + `colorScheme`, `state.reducedMotion` → `data-reduced-motion` + `data-motion`, numeric `state.testWidth` → `--hub-test-width` + `--hub-<widthRole>-width`, numeric `state.viewportWidth` → `--hub-viewport-width`. On DOMContentLoaded posts `{source:"pm-concept", type:"pm-concept-ready", version:1, capabilities:{theme:true, reducedMotion:true, testWidth:true}}` to `window.parent` when framed. (The literal strings `pm-concept-ready` and `pm-concept-state` live in this file — required.)
- Theme menu: 8 entries (Friendly/Glass/Retro/Basic × Dark/Light), SVG swatches, roving focus, Esc closes.
- localStorage ONLY under `pm.settingsConcepts.fable.<concept>.<key>`.
- `PMShell.status(msg)` writes the statusbar left slot; `PMShell.toast(msg)` transient non-blocking toast.

## `_shared/pm-icons.js` — `window.PMIcons`

- `PMIcons.get(name)` → raw `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">…</svg>` string; `PMIcons.hydrate(root)` fills every `i[data-ico]` descendant (`display:inline-flex`, sized by CSS).
- Required names: `rail chat motion palette more search gear brain shield terminal puzzle clipboard branch film globe masks toolbox plug bolt warning info check checkCircle close refresh star starFill pin lock unlock folder eye eyeOff play pause plus minus chevR chevL chevD chevU arrowR arrowL external doc history layers gauge wave sparkle scales key user users server cloud wrench trash edit copy filter grid list link mic camera clock calendar upload download`.

## `_shared/pm-demo-data.js` — `window.PM_DATA` (inert data, no DOM)

Top-level: `{ version, generated, taxonomy, settings, notices, recents, providers, roles, freeRoutes, memory, personas, crew, contextSources, mcp, lsp, skills, plugins, tools, commandsInfo, terminalProfiles, media, spell, usageSnapshot, operational }`.

- `taxonomy`: **11 domains** (packet §01 list, humanized): `[{id, num:"1".."11", title, blurb, icon, subs:[{id, title, blurb, settingIds:[canonicalId…]}]}]` — 3–5 subs each. Domain ids: `general, appearance, agents, permissions, code, context, planning, collaboration, extensions, media, system`.
- `settings`: map keyed by **canonical dotted id** (reuse real ids from `Plans/settings_inventory.json` where one exists; ~120 total; every domain represented). Each: `{id, label, desc, type:"toggle|select|number|text|radio|slider|action|path|list|keyvalue|multiselect", options?, default, value, effective?, valueSource:"default|custom|inherited|auto|managed|recommended|not-configured", exposure:"standard|advanced|expert|managed|diagnostic|unavailable", scope:["global"|"project"|"thread"|"turn"|"goal"], scopeNote?, managedReason?, unavailableReason?, riskNote?, flags:{restart?,reconnect?,cost?,privacy?,safety?,perf?}, recommended?, search:[...], src}`. Must include: all nine value-states somewhere; the access-mode radio (`Full Access/Auto/Auto accept edits/Ask for approval`); thread-scoped override rows (model/account/persona/effort/speed/access/crew/context) with `scope:["thread"]`; `planning.goal.concurrency-ceiling` (number) paired with read-only `planning.goal.sustainable-now` (managed, from `operational`); cross-project policy rows (off by default, once/thread/goal/persistent, read vs write separate, child-inheritance); spellcheck block (`Check spelling On / Language Automatic / Dictionary source Automatic / Personal dictionary Manage / Project dictionary…` + advanced `Check technical prose Off / Underline unknown names Off / packs / overrides`).
- `notices`: `[{id, kind:"attention"|"setup"|"recommended", statusWord, headline, consequence, primary:{label, act}, secondary?, target:{domain, sub?, settingId?, manager?}}]` — ≥3 attention, ≥2 setup, ≥2 recommended in the `attention-heavy` scenario.
- `providers`: `[{id, name, family, groupKind:"tool"|"account"|"api"|"server"|"free", status:"ready|not-installed|signed-out|auth-no-invoke|degraded|refreshing", statusNote, defaultAnswerBlock:{connected, accountInUse, billingRoute, remaining, onExhaust, modelsAvail, attention}, accounts:[{id, nickname, identity, authOwner:"cli-profile"|"pm-direct-oauth"|"api-key"|"server"|"none", isolation:"native-profile"|"cli-home"|"auth-isolated"|"pm-managed"|"credential-pool"|"single-login", enabled, priority, useNext?, sticky?, health, usage:{includedRemaining, extra, resetAt, pressure, lastUse}, projection?}], connections:[…], models:[{id, name, fav, alias?, hidden, priority, ctx, modalities, effort:["low","medium","high"]?, fast:true|false, toolSupport, evidence:[{cap, state:"supported|unsupported|likely|unverified|temporarily-unavailable|via-transformation|via-other-route", source, at}], unavailableReason?, requested?, effectiveRoute?}], plans:[…], catalog:{lastChecked, lastActivated, sourceVersion, state:"fresh|refreshing|stale", lastKnownGood:true}, whatNext:["stop-wait"|"extra-balance"|"paid-after-plan"|"saved-reset"|"switch-account"|"free-models"|"api-billing"|"ask"] (only supported ones), oauthNote?}]`. Must include: Claude (CLI profile + separate API route, no PM-direct OAuth note), Antigravity CLI (same), OpenAI/Codex (PM-direct OAuth), GitHub Copilot, OpenRouter (API), a local server (server), and a Free & community group.
- `freeRoutes`: `[{id, modelRef, qualifier:"rate-limited|promotional|account-required|keyless|data-sharing|subscription-included|temporarily-unavailable", setupSteps:[{title, body}] , underlyingProviderId}]`.
- `roles`: `[{id, label, assignedRoute, quality:"high"|"standard", lockedHigh?:true, note}]` — includes PRD/Planning conversation with `lockedHigh:true` + no-silent-downgrade note.
- `memory`: gists `[{id, text, kind, scope, state:"verified"|"awaiting-review", pinned, halfLife, lastRecall, versions:[…], evidence:[{source, quote}]}]` (≥8).
- `personas`: `[{id, name, role, childOnly?, definitionSummary, runtime:{eligible, footprint}, capsulePreview, scopeDefault:"thread"}]` — include Assistant, Collaborator, General, Overseer, Researcher, Explorer, Bash, Teacher; ≥1 childOnly.
- `crew`: templates `[{id, name, purpose, members:[{role, persona, routeCandidates}], routePolicy:"strict"|"adaptive", minMembers, maxMembers, requestedConcurrency, effectiveConcurrency, queuedWaves, guards:{usage, time}, reserve, isolation:{worktree, paths}, board, consensus, spawning:{depth}, failure}]` — one with requested 5 / effective 2 + queued waves.
- `contextSources`: `{normalControls:[settingIds…], lastTurn:{admitted:[{source, tokens, why}], omitted:[{source, why}]}, agentsChain:[{path, precedence}], personaFootprint, toolsSelectedVsInstalled:{selected:[], installed:[]}}`.
- `mcp`: servers `[{id, name, transport, protocol:{requested, negotiated}, auth, health, scope, tools:[{name, exposed}], lazyExposure:true, approval:{mode:"once"|"session"|"persistent", perTool?}, logsSample:[…]}]`.
- `lsp`: `[{id, language, state:"detected"|"installed"|"missing", version, scope, startup, capabilities, conflicts?}]`.
- `skills`/`plugins`/`tools`: skills `[{id,name,source,permissions,enabled,trusted,scope}]`; plugins `[{id,name,lifecycle,compat,permissions,channel,failed?}]`; tools funnel `[{id,name,installed,projectEnabled,available,selectedThisTurn,invokedRecently,risk,approval}]`.
- `terminalProfiles`: `[{id,name,shell,shellSource:"auto-detected"|"custom"|"inherit", font,fontSize,lineHeight, fg,bg, ansi:[16], opacity, cursor, selection, copyOnSelect, cwdPolicy, envPolicy, retention, renderer, startup, default?}]` (≥3).
- `media`: `[{id, providerRef, purpose:"image-gen|vision|audio-in|audio-out|video", native:true|false, transformNote?, output:{location,format}, safety, costRoute, fallbackRef?, history:[{at, what, ok}]}]`.
- `spell`: `{personal:["…"], project:["…"], packs:[{lang, installed}], misspellings:{"teh":"the", "recieve":"receive", "seperate":"separate", "definately":"definitely", "occured":"occurred"}}`.
- `usageSnapshot`: compact read-only per-provider `{includedRemaining, extra, resetAt, pressure, lastUse, projection, freshness}` + deep-link marker `{usagePage:true}`.
- `operational`: `{configuredCeiling:8, sustainableNow:2, reason, waveWarning:"Starting eight agents now is unlikely to finish before the provider resets. PM recommends two concurrent agents and three waves."}`.

All copy is realistic product English — no lorem ipsum, no internal enum leakage in labels.

## `_shared/pm-state.js` — `window.PMState`

- `PMState.init(conceptId)` → returns `store`: `{get(k), set(k,v), on(evt,fn), emit(evt,payload), data}` where `data` is a deep-cloned working copy of `PM_DATA` (mutations never touch `PM_DATA`).
- `PMState.resolveRowState(setting)` → `{valueLabel, valueKind, sourceLabel, chips:[{kind,label}], flags:[{icon,label}], exposure, editable, statusTone}` — THE single semantics resolver; all four concepts render from it (markup/CSS per concept).
- `PMState.resolveNotice(notice)` → `{tone, statusWord, headline, consequence, primary, secondary}`.
- Scenarios: `PMState.scenarios` = `[{id:"baseline", label:"Baseline (mixed states)"}, {id:"calm"}, {id:"attention-heavy"}, {id:"usage-exhausted"}, {id:"invocation-failed"}, {id:"managed-workspace"}]`; `PMState.applyScenario(id)` mutates `store.data` + emits `scenario`. Baseline already exhibits every co-existable row/provider state.
- Transient triggers: `PMState.trigger("provider-refresh"|"catalog-refresh"|"reconnect"|"invoke-test", ref)` → staged async state changes (loading → done) preserving last-known-good rows, emitting `provider`/`catalog` events.
- `PMState.receipt(actionLabel, detail)` → `{simulated:true, message}` + emits `receipt` (concepts surface via toast/inline). Used by every action that cannot truly run.
- `PMState.mountStatesDrawer(store)` → floating "States" button (bottom-right, above statusbar) opening a drawer: scenario radio list, transient trigger buttons, note that widths come from the Hub. Keyboard reachable, Esc closes.
- `PMState.search(query, data)` → shared fuzzy search over settings/managers/actions: tokenized, every token must match (label > synonyms > category > desc ladder, curated/simple bonuses), returns `[{kind:"setting"|"manager"|"action", id, label, domainId, subId, score, exposure}]` capped at 60. Concepts own presentation.

## `_shared/pm-scrollspy.js` — `window.PMSpy`

- `PMSpy.attach({scroller, getSections, onChange})` → controller `{refresh(), jumpTo(id, {focusEl?}), dispose(), state}`; `state = {sections:[{id, offset, height}], activeId, scrollFraction, isProgrammaticScroll}`.
- Mechanism: cached offsets recomputed on ResizeObserver + refresh(); active = last section whose offset ≤ scrollTop + 28% viewport, with deadband hysteresis; programmatic scrolls set `isProgrammaticScroll` and suppress onChange until settle (double rAF after scrollend/fallback timer).
- `PMSpy.reveal({controller, ensure:[fn…], targetId, focusEl})` — awaits each `ensure` (category load, disclosure expansion), double-rAF settle, `jumpTo`, then `PMSpy.focusFlash(focusEl)` (adds `.pm-focus-flash`, removes after decay; reduced motion → single short opacity step).

## `_shared/pm-spell.js` — `window.PMSpell`

- `PMSpell.attach(el, {store, projectDict:true})` on `contenteditable` fields (`spellcheck="false"` set by the module). Underlines matches of `PM_DATA.spell.misspellings` (subtle wavy underline span, theme-aware); context-menu (right-click or keyboard menu key / Cmd+.) shows: replace-once suggestion(s), Ignore once, Ignore for draft, Add to personal dictionary, Add to project dictionary. NEVER auto-replaces. Skips content inside `code`, links, path-like tokens (`/`, `\\`, `.` heavy), ALL-CAPS/hash-like tokens, and known provider/model/persona names from data. Dictionary adds persist to the namespace and emit `receipt`.

## Rendering discipline (all concepts)

- Render from data models; long lists (>40 rows) materialize lazily (window near viewport or explicit "Show more" pages) — never hundreds of eagerly instantiated rows. Note web-only effects + Slint equivalent as comments where relevant.
- Semantic state lives in JS state (store/spy state), never derived from DOM geometry except through PMSpy's documented mapping.
- Every interactive control: keyboard operable, visible focus, `aria-pressed`/`aria-expanded`/`role` as appropriate.
- Category switch loads ONE domain's continuous document; search deep-links via `PMSpy.reveal`.
