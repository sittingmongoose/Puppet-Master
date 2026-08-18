# GAP 1 — Keyboard / assistive-technology pass (u11-prism)

Independent audit, 2026-08-17. Read-only against the concept.

- Harness: `audit-evidence/harness/gap1-a11y-keyboard-probe.mjs`
- Raw evidence: `audit-evidence/probes/a11y-keyboard-probe.json`
- Target: `file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html`
- Fixture: theme `friendly-dark`, disclosure `essentials`, scope `scope:all`, viewport 1700x1000
- Page errors during the whole pass: **0**

## Method (why these numbers are admissible)

- Focus is moved by **real** `Tab` / `ArrowDown` / `Enter` / `Space` / `Escape` key events, never by
  `element.focus()` where the measurement depends on `:focus-visible`.
- Computed style is read **while the node actually holds keyboard focus**, and only after a 240 ms
  settle so `opacity` transitions (`--motion-fast`) have landed. The same nodes are then re-measured
  with focus removed, and the two snapshots are diffed — so "has a focus indicator" is a measured
  difference, not an assumption that a CSS rule applies.
- Roles and accessible names come from the Chrome DevTools Protocol accessibility tree
  (`Accessibility.getPartialAXTree` by `objectId`), not from a hand-rolled name algorithm.
- "Reached by Tab" is decided by **element identity** (a marker property stamped on the node), so two
  identical `Duplicate` buttons in different widgets are never conflated.

---

## (a) Full Tab order from document start

**105 unique focus stops**, then focus wraps to the document body. **No focus trap. No cycle.**

Ordered list is in `a_tab_order.order` (idx, tag, CSS path, accessible name, CDP role, `data-*`,
`aria-*`, rect, owning pane). Shape of the sequence:

| Tab stops | What |
|---|---|
| 0–8 | App-shell chrome: `tastebook`, Home, Projects, Planning Wizard, Orchestrator, Usage, Settings, Global search, theme button |
| 9–12 | Usage page header: Usage settings, Refresh usage projections, Export usage, Review |
| 13–22 | Room rail: Overview, Scope, Plans & limits, Costs, Accounts, Free models, Context, Analytics, Ledger, More |
| 23–25 | Disclosure group: ESSEN / STD / ADV |
| 26–92 | Overview room: scope chip, Add widget, Reset layout, then 6 widgets x (Move, Options, body actions, Duplicate, Open Usage settings, Resize) — 67 stops |
| 93–103 | Concept-page dev chrome (all-concepts link, context ring, width presets, page-width slider, MOTION) |
| 104 | **`button#u11PopX` "Close scope picker" — inside the CLOSED scope popover** |

### Unreachable interactive controls

**0.** Of 104 visible, non-negative-tabindex, non-disabled candidates matching
`button, a[href], input, select, textarea, [tabindex], [role=…]`, **all 104 were reached by Tab**
(`a_tab_order.interactive_census.notReachedByTab === 0`). Zero visible controls with `tabindex="-1"`
in the steady state.

### Structural keyboard-cost findings (measured, not stylistic)

1. **DEFECT G1-A1 — no skip link and no `main` landmark.** `landmarks: { nav: 2, main: 0, header: 15,
   h1: 1, h2: 13, skipLinks: 0 }`. Reaching the first Usage widget costs **27 Tab presses**; reaching
   the last Accounts control in the Overview room costs 92. There is no mechanism to jump the shell.
2. **DEFECT G1-A2 — 5 of the 13 rooms are not in the Tab order at all.** Only 8 room buttons plus
   `More` appear (idx 13, 15–21, 22). `attention`, `cache`, `tools`, `signals` sit inside
   `#u11MoreGrp.closed`; `authority` additionally carries `.u11-advonly`. `More` does expose
   `aria-expanded`, so the disclosure itself is announced — but a screen-reader user is never told
   that 5 of 13 sections exist behind it, because the rail is not a tablist (see (c)) and there is no
   count or live region.
3. **DEFECT G1-A3 (new, and the worst thing in this section) — an invisible dead Tab stop inside the
   closed scope popover.** `.u11-pop` is hidden with `opacity: 0; pointer-events: none` only
   (`u11-prism.html:203–208`) — no `visibility: hidden`, no `display: none`, no `hidden` attribute, no
   `inert`. Measured consequences:
   - `button#u11PopX` is the **last Tab stop on the page** (idx 104) while the picker is closed.
   - Measured `minAncestorOpacityWhileFocused: 0` at `aside#u11Pop`, *after* the transition settle —
     the focused control paints nothing.
   - It has **no focus indicator at all** (see (b)).
   - Activating it does nothing: `closePop()` early-returns on `!popOpen` (`u11-prism.html:897`).
   - This is a focusable dead control that is also invisible.

---

## (b) Focus visibility

104 of 105 stops have a measured, visible focus indicator. The single offender is the one above.

| idx | control | focus rule fires? | paints where the user can see it? |
|---|---|---|---|
| 104 | `button#u11PopX` "Close scope picker" | yes — but only the **UA default** `outline: 1px auto rgb(16,16,16)` | **NO** — ancestor `aside#u11Pop` is at `opacity: 0` |

**DEFECT G1-B1 — `#u11PopX` has no authored focus ring, in any state.** A stylesheet sweep
(`b2_outside_us_page`) shows `matchingFocusRules: []` for `button#u11PopX`: no rule in any loaded
sheet gives it a focus style. The shared ring is scoped
`.us-page :is(button,[tabindex],input,select,a):focus-visible` (`_shared/usage-shared.css:218`) and
`#u11Pop` is mounted **outside** `.us-page` (`u11-prism.html:532`, after the `</template>`), so the
close button falls through to the UA default — a 1 px near-black outline, on a dark elevated surface.
The 100 `.u11-pop-row` options *are* covered, by their own rule `u11-prism.html:235`. Only the close
button was missed.

The two structurally similar hosts have the same exposure: `#u11SheetSprout` (9 controls) and
`#u11ExportSprout` are also outside `.us-page`; their `input`/`select` children likewise report
`matchingFocusRules: []`. They are protected today only because both carry the `hidden` attribute
when closed, unlike `#u11Pop`.

---

## (c) The 13-room rail (`u11-prism.html:365`) — every critic claim VERIFIED TRUE

Measured before a room switch, after a pointer switch to Costs, and after a keyboard switch (real
`Enter`) to Ledger.

| Critic claim | Verdict | Measured evidence |
|---|---|---|
| `nav[aria-label]` holding plain buttons | **TRUE** | `nav.u11-rail`, `aria-label="Usage sections"`, 17 child `button`s, no `role`. CDP: `axRole: "navigation"`, `axName: "Usage sections"` |
| NO `role=tablist` | **TRUE** | `document.querySelectorAll('[role="tablist"]').length === 0` |
| NO `role=tab` | **TRUE** | 0 of 13 room buttons; 0 anywhere in the document |
| NO `aria-selected` | **TRUE** | 0 of 13 room buttons. CDP for the active Overview button: `axRole: "button"`, no `selected` property |
| NO `aria-current` | **TRUE** | 0 of 13 room buttons. The document's single `aria-current` lives in the app shell (`header.title-bar>nav.tb-pages>button.tb-page-tab.active`), not in u11 |
| `goTo()` (`:969–1005`) writes no aria at all | **TRUE** | `ariaDiff_pointerSwitch.itemAriaChanges === []`, `paneAriaChanged === false`; same after the keyboard switch. The only thing that moves is `class="active"` (`activeClassMovedFrom: ["overview"] → activeClassMovedTo: ["costs"]`) plus the `.u11-railind` indicator geometry |
| Panes (`:395–524`) have `aria-label` but no `role=tabpanel` / `aria-labelledby` | **TRUE** | 13/13 panes have `aria-label`; 0/13 have `role="tabpanel"`; 0/13 have `aria-labelledby`; 0/13 have an `id`; 0/13 have `aria-hidden`. CDP for the Overview pane: `axRole: "region"` (the implicit role of `section[aria-label]`) |

### Consequential new findings

4. **DEFECT G1-C1 — a room switch produces no accessible state change whatsoever.** The 12 hidden
   panes are hidden with `.pm-hidden` (`display: none`), so they leave the tree — that part is sound.
   But the *incoming* room is announced by nothing: no `aria-selected`, no `aria-current`, no
   `aria-live`. Measured: `aria-live inside rail or panes === 0`; the document's only live region is
   `div#toastStack` in the app shell. A screen-reader user who activates "Ledger" hears the button
   they pressed and receives no confirmation that the surface changed.
5. **DEFECT G1-C2 — the rail has no tablist keyboard model.** `tabindex on room buttons === 0` (no
   roving tabindex), so all reachable room buttons consume separate Tab stops. `ArrowDown` on a
   focused room button was measured to move neither focus nor the active pane
   (`arrowDownOnRail`: focus stays on the Ledger button, active pane stays `ledger`).
6. **Room button accessible names carry live data.** CDP name for the Overview room button is
   `"Overview as of 14:42 EDT"`, for Ledger `"Ledger 45 immutable events"` — the `.u11-imeta` text is
   concatenated into the name. Not a defect, but it means every room label is re-announced in full,
   and the names change as the data changes (see GAP 3 for why `14:42 EDT` is itself wrong here).

---

## (d) The disclosure control `#u11Disc` (`u11-prism.html:383–387`) — claim VERIFIED TRUE

| Claim | Verdict | Evidence |
|---|---|---|
| The active level carries only `class="on"` | **TRUE** | After clicking ADV: `aria-pressed`, `aria-checked`, `aria-current`, `aria-selected` are all `null` on all three buttons; `class="on"` moved from `essentials` to `advanced` |
| No `aria-pressed` / `aria-checked` / `aria-current` / `aria-selected` in the group | **TRUE** | all four counts 0 of 3 |
| Host role is `group`, not `radiogroup` / `tablist` | **TRUE** | `#u11Disc[role="group"][aria-label="Disclosure level"]` |
| Selection state conveyed only visually | **TRUE** | Every button's aria attribute set is empty apart from the host's `role`. State is carried purely by `class="on"` and its computed `background-color` / `color` |

7. **DEFECT G1-D1 — the disclosure level is unobservable to assistive technology.** CDP for the
   active ADV button while advanced is selected: `axRole: "button"`, `axName: "ADV"`, `axProps:
   { invalid: "false", focusable: true, focused: true }` — no `pressed`, no `checked`, no `selected`.
   The three buttons are announced identically whichever one is active. The only measured differences
   between the active and inactive buttons are **purely presentational**: `background-color` moves from
   `rgba(0,0,0,0)` to `color(srgb 0.435 0.776 0.910 / 0.12)` and `color` from `rgb(155,150,164)` to
   `rgb(111,198,232)`. The state change is real — the caption `#u11DiscCap` text moves from
   `"Essentials — decisions & plain language"` to `"Advanced — raw meters, authority, receipts"` — but
   that caption carries no `aria-live` (measured `captionAria: {}`) and is not referenced by
   `aria-describedby` from any of the three buttons, so the change is announced by nothing. A
   three-state exclusive control of this kind needs `role="radiogroup"` with `aria-checked`, or
   `aria-pressed` on the buttons; it has neither.

---

## (e) The 27 "Open Usage settings" widget-footer buttons — **focusable AND dead**

Count reproduced exactly: **27** across the 13 rooms (`[data-u11-act="opensettings"]`, one per mounted
widget in the active pane).

| room | buttons in the active pane |
|---|---|
| overview | 6 |
| plans | 3 |
| ledger | 3 |
| costs, accounts, free, context, analytics | 2 each |
| attention, cache, tools, signals, authority | 1 each |
| **total** | **27** |

Measured properties:

- Every one of the 27 is a real `<button type="button">`; none is `disabled`, `aria-hidden` or
  `aria-disabled`; none carries `tabindex`.
- All 27 are programmatically focusable, and **6 of 6** appear in the real Tab order of the Overview
  room (idx 37, 43, 48, 54, 61, 91).
- Reached by real Tab presses; while focused, `:focus-visible` matches and the outline is
  `2px solid` — and the footer's `opacity: 0` resolves to 1 via `.u11w-foot:focus-within`
  (`u11-widgets.css:60`), so the control does become visible when tabbed to.
- CDP accessibility node: `axRole: "button"`, `axName: "Open Usage settings"`, `axIgnored: false`,
  `axProps: { invalid: "false", focusable: true }`.

**Activation does nothing.** With the button holding real keyboard focus, `Enter` then `Space` were
pressed and the full document state was captured before and after:
`enterChangedNothing === true` — identical `body.innerHTML.length`, `#u11SheetSprout.hidden` still
`true`, `#u11SheetSprout.innerHTML.length` still `0`, open dialogs `0`, toasts `0`, active pane
unchanged, `scrollY` unchanged.

Root cause, confirmed both statically and at runtime: `u11-widgets.js:1219–1221` dispatches
`new CustomEvent('u11:opensettings')` on `document`, and **nothing in the concept listens for it**
(`grep -rn "u11:opensettings"` returns exactly that one dispatch site). The runtime probe attached its
own temporary listener, dispatched the event, and confirmed the round trip works — the event fires,
there is simply no consumer (`listenerProbe.ownListenerFired: true`,
`sproutHiddenAfterBareDispatch: true`).

**Control case proving the harness is not vacuous:** the header settings button `#u11Settings`, focused
and activated the same way, *does* work — `#u11SheetSprout.hidden` flips and its `innerHTML` grows
(`controlCase_headerSettingsButton.wired === true`).

8. **DEFECT G1-E1 (severity raised) — 27 focusable, correctly-named, correctly-roled dead controls.**
   The prior probe found them pointer-dead. They are also keyboard-reachable and announce to a screen
   reader as `button "Open Usage settings"` with no disabled state. This is strictly worse than a
   pointer-dead control: the surface actively advertises 27 actionable affordances to AT users and
   silently discards every activation. The correct answer to the question posed — "which is it?" — is
   **a focusable dead control**, on all 27 instances, in all 13 rooms.

---

## (f) The scope popover `#u11Pop` (`u11-prism.html:925–932`)

Opened by real `Enter` on the rail trigger, then driven by real keys.

**What works:**

- Opening moves real focus into the dialog: `focusMovedIntoPop: true`, landing on the currently
  selected option (`.u11-pop-row.on`, `data-scopeid="scope:all"`, `role="option"`,
  `aria-selected="true"`).
- Arrow keys move **real focus** between options and keep the focused row inside the list viewport
  (`focusedRowInsideListViewport: true`); `End` lands on the last row. Options carry
  `role="option"` + `tabindex="-1"` and the list carries `role="listbox"` + `aria-label="Scopes"` —
  a legitimate roving-real-focus listbox, so **`aria-activedescendant` is correctly absent**
  (`usesAriaActivedescendant: false`, `movesRealFocus: true`).
- **`Escape` returns focus to the trigger in both open paths** — keyboard-opened and pointer-opened:
  `escFromKeyboardOpen.activeIsTrigger: true`, `escFromPointerOpen.activeIsTrigger: true`.
  Selecting a row with `Enter` also closes the popover and returns focus to the trigger
  (`keyboardSelectRow.activeIsTrigger: true`, scope chip updated to `"Coding sprint set"`).

**What is broken:**

9. **DEFECT G1-F1 — no focus trap, and the very first `Tab` throws focus out of the open dialog.**
   From the focused option, one `Tab` press moved focus to `document.body`
   (`firstTabLeftThePopover: true`, `focusTrapPresent: false`) while
   `popStillOn: true`. Because `#u11Pop` is the last focusable region in the document, the next `Tab`
   restarts at the top of the page — i.e. **behind the scrim**, on controls the scrim has made
   pointer-inert (`#u11PopScrim` computed `pointer-events: auto` when on). The dialog stays open the
   whole time. A keyboard user who over-tabs is left navigating an obscured page with a modal open
   over it.
10. **DEFECT G1-F2 — the dialog is not a modal to assistive technology.** Measured on the open
    popover: `aria-modal` is **absent** (`popAriaModal: null`); the rest of the page is neither
    `inert` nor `aria-hidden` (`usPageInertWhileModalOpen: false`,
    `usPageAriaHiddenWhileModalOpen: null`, `bodyAriaHidden: null`). The scrim itself is correctly
    `aria-hidden="true"`, which hides the scrim, not the content behind it.
11. **DEFECT G1-F3 — the trigger never says whether the popover is open.** `[data-scope-open]` carries
    `aria-haspopup="listbox"` but **no `aria-expanded` and no `aria-controls`** — measured `null`
    while open and `null` after `Escape`.
12. **DEFECT G1-F4 — 100 phantom options stay exposed after the picker closes.** `buildPopList()`
    populates 100 `.u11-pop-row` buttons and `closePop()` only removes `class="on"`. Because the
    closed popover is `opacity: 0` and nothing else, the steady-state census **with the picker
    closed** still reports `role="option": 100`, `aria-selected: 100`, and
    `role="dialog"` on `#u11Pop` — measured identically to the census taken with the picker open.
    After a single use of the scope picker, AT users are permanently offered 100 options inside a
    dialog that is not visible and cannot be operated.

---

## (g) Static aria census vs what a 13-room tabbed surface needs

Steady state (scope popover closed), 5193 elements, 719 carrying any `aria-*` or `role`:

| attribute | count | where it lives |
|---|---|---|
| `aria-hidden` | 459 | 429 on decorative `<svg>`, 28 `<span>`, 2 `<div>` — i.e. correct icon hiding |
| `aria-label` | 127 | 108 in panes, 7 page header, 3 `#u11Pop`, 2 rail, 7 other |
| `aria-selected` | 100 | **all 100 in `#u11Pop`** — zero on room tabs |
| `aria-haspopup` / `aria-expanded` | 44 / 44 | 40 widget kebab menus, 2 header, 1 rail (`More`), 1 other |
| `aria-controls` | 3 | 2 page header, 1 other — **none on room buttons** |
| `aria-current` | 1 | app shell page tab, **not u11** |
| `aria-pressed` | 1 | `button#sbRM` in the app shell, **not u11** |
| `aria-live` | 1 | `div#toastStack` (app shell), `polite` |
| `aria-modal` | 1 | not `#u11Pop` |
| roles | `option` 100, `menuitem` 11, `dialog` 5, `menu` 2, `separator` 2, `group` 1, `listbox` 1, `status` 1 | — |
| `role=tablist` / `role=tab` / `role=tabpanel` | **0 / 0 / 0** | — |

What a 13-room tabbed surface requires, against what is present inside the rail and panes:

| needed | required | present |
|---|---|---|
| `role="tablist"` | 1 | **0** |
| `role="tab"` | 13 | **0** |
| `aria-selected` on tabs | 13 | **0** |
| `aria-controls` on tabs | 13 | **0** |
| `role="tabpanel"` | 13 | **0** |
| `aria-labelledby` on panels | 13 | **0** |
| roving `tabindex` on tabs | 13 | **0** |
| `aria-live` room announcement | 1 | **0** |

13. **DEFECT G1-G1 — the tabbed-surface contract is 0/8 satisfied.** Every one of the eight
    structures a 13-room tabbed surface needs is entirely absent from the rail and the panes. The
    100 `aria-selected` attributes the page does own all belong to the scope picker; not one belongs
    to a room. The `aria-current` and `aria-pressed` attributes in the document belong to the
    surrounding app shell.
14. Positive finding worth recording: icon hiding is done correctly and thoroughly (429
    `aria-hidden` `<svg>`), all 13 panes are labelled, all 13 rooms have an `<h2>`, and the widget
    kebab menus are consistently `aria-haspopup` + `aria-expanded` (44/44). The failure is
    specifically in **state** (selection, current, expanded, live announcements), not in **naming**.

---

## GAP 1 defect summary

| id | defect | severity driver |
|---|---|---|
| G1-A1 | No skip link, no `main` landmark; 27 Tab presses to the first widget | navigation cost |
| G1-A2 | 5 of 13 rooms absent from the Tab order behind an unannounced `More` disclosure | discoverability |
| G1-A3 | `#u11PopX` is an invisible dead Tab stop while the popover is closed (`opacity:0` only) | focusable + invisible + inert |
| G1-B1 | `#u11PopX` has no authored focus ring in any sheet (outside `.us-page` scope); UA default 1 px near-black | WCAG 2.4.7 |
| G1-C1 | Room switch emits no accessible state change and no live announcement | WCAG 4.1.2 |
| G1-C2 | Rail has no tablist keyboard model; no roving tabindex; ArrowDown does nothing | expected pattern absent |
| G1-D1 | Disclosure level state is visual-only (`class="on"`); all three buttons announce identically | WCAG 4.1.2 |
| G1-E1 | **27 focusable, correctly-named, dead "Open Usage settings" buttons** — worse than pointer-dead | WCAG 4.1.2 / trust |
| G1-F1 | Open scope dialog has no focus trap; first `Tab` exits to `body`, next restarts behind the scrim | WCAG 2.4.3 |
| G1-F2 | Scope dialog lacks `aria-modal`; page behind it is neither `inert` nor `aria-hidden` | modal semantics |
| G1-F3 | Scope trigger has `aria-haspopup` but no `aria-expanded` / `aria-controls` | WCAG 4.1.2 |
| G1-F4 | 100 phantom `role=option` / `aria-selected` rows remain exposed after the picker closes | AT pollution |
| G1-G1 | Tabbed-surface aria contract 0/8 satisfied | headline |

Claims the critic put forward for (c), (d) and (e): **all VERIFIED TRUE** in the live DOM, before and
after both a pointer and a keyboard room switch. Nothing in the critic's list was refuted.
