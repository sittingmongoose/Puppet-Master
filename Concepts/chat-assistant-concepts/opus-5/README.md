# Opus 5 — Assistant Chat concept workspace

An isolated concept comparison workspace for the Puppet Master Assistant Chat. Eight chat-window
concepts and eight chat-thread concepts, freely recombinable, driven by one shared demo dataset,
testable across eight themes and four chat widths.

**This folder is self-contained.** It reads nothing outside itself and modifies nothing outside itself.
No file in `Plans/`, `Concepts/PMConcept7.html`, the UI Command Catalog, the Wiring Matrix, DRY Method
contracts, or the parallel Usage redesign was touched.

---

## Running it

The workspace runs from disk with no build step and no dependencies.

**From a local server (preferred — matches how the tests run):**

```bash
cd "Concepts/chat-assistant-concepts/opus-5" && py -m http.server 8790
```

Then open `http://127.0.0.1:8790/index.html`.

**Straight from disk:** open `index.html` in Chromium. Demo data is preloaded as script bundles
precisely so `file://` works — `fetch` cannot read a sibling file from an opaque origin.

### The three surfaces

| Page | What it is |
|---|---|
| `index.html` | The gallery. Every window and thread concept as a live, interactive preview. |
| `stage.html` | One pairing at full fidelity. Deep-linkable: `stage.html#w=w1&t=t1&theme=glass-dark&width=520` |
| `contact.html` | The selected pairing rendered in all eight themes at once. This is the screenshot target. |
| `tests/runner.html` | The in-page assertion runner. No dependencies, no install. |

### Controls (apply to the workspace chrome and to every hosted concept at once)

- **Theme** — all eight Puppet Master themes
- **Window** and **Thread** — selected independently; any thread mounts in any window
- **Chat width** — the four presets 520 / 750 / 975 / 1200 plus a continuous slider across the range.
  These are concept-testing controls. The product itself has a drag resizer, not preset buttons.
- **Form** — docked or pop-out, sharing one semantic state
- **Application rail** — open or closed. Its width is independent of the chat width.
- **Reduced motion**

### Regenerating the demo bundles

```bash
node demo/build-demo-bundles.mjs
```

Reads `demo/demoData.json` (never writes it) and emits `demo/demoData.bundle.js` and
`demo/demoDataExtension.js` deterministically, then prints measured coverage counts.

---

## Architecture

The load-bearing piece is the **window ↔ thread composition contract** in `CONTRACT.md`. A window owns
outer chrome, layout, and where things live; a thread owns message rendering and the treatment of
everything inside the transcript. They meet through named **regions** and a **capability negotiation**:

- A window exposes `transcript`, `composerHost`, `headerTools`, and `overlayRoot` (all required), plus
  optionally `threadHistory`, `workSurfaceHost`, and `questionHost`.
- A thread reads `ctx.capabilities`. If a host region exists it renders into it; if not, it renders that
  surface inline. Two of the eight windows deliberately provide neither work-surface nor history host,
  so the absent-region path is a first-class arrangement rather than a fallback.

That negotiation is what makes 64 pairings genuinely interoperable instead of 64 special cases.

**Semantic state lives only in the store.** Nothing is read back out of the DOM. A remount — switching
concepts, or changing between docked and pop-out — captures the scroll anchor into the store, destroys
both modules, rebuilds the geometry, remounts, and restores. The eleven state categories the handoff
requires survive by construction rather than by hand-maintenance.

**Themes are set on a stage container, never on the document root.** Every theme selector is a bare
`[data-theme="…"]`, so eight themes can render as eight sibling stages in one document. That is what
makes the contact sheet possible, and it collapses the 32 theme-width configurations from 32 screenshots
to 4.

**CSS scoping is enforced, not conventional.** Every window rule lives under `[data-pmx-window="wN"]`
and every thread rule under `[data-pmx-thread="tN"]`. A test parses each concept stylesheet and fails any
rule outside its own scope. This repo has a documented instance of the prefix-only convention leaking,
so the check is automated.

---

## Folder map

```
CONTRACT.md              the frozen window/thread composition contract
GAP_REPORT.md            specification, command, schema, wiring, and DRY gaps found while building
BUILD_STATUS.md          exact build state, including anything incomplete
index.html               gallery
stage.html               single pairing, deep-linkable
contact.html             eight themes at once

shared/
  SERVICES.md            frozen service API surface
  tokens.css             base scale plus eight theme blocks, container-scopable
  reset.css scrollbars.css motion.css popup.css msg.css chrome.css shell.css workspace.css
  store.js               single source of truth, snapshot and rehydrate
  registry.js            concept registration and instance validation
  compose.js             mount, remount, and state carry-over
  data.js                normalization, formatting, locale rendering
  motion.js popup.js scroll.js listwindow.js
  search.js lens.js questionnaire.js drafts.js runtime.js surfaces.js editorhost.js toast.js
  hoverrow.js moreinfo.js composer.js selectors.js headertools.js threadhistory.js
  shell.js               fake dashboard and application rail
  workspace.js           gallery, stage, and contact surfaces

windows/                 w1..w8, one .js and one .css each
threads/                 t1..t8, one .js and one .css each
demo/                    supplied dataset (unmodified), generated bundles, generator script
tests/                   assert.js, suites.js, runner.html
evidence/                screenshots and contact sheets
```

---

## Demo data

`demo/demoData.json` is the supplied dataset, **byte-identical at 349,661 bytes**. It was never edited.

Everything added lives in `demo/demoDataExtension.js`, generated deterministically. The extension exists
because the supplied data could not exercise several required states: its median message is 105
characters and exactly one of 400 messages exceeds 1200, so long-message collapse could not be judged at
all; two of the three named search phrases were not inside collapsed content; and there was no archived
thread, no deleted diff file, no Goal-only thread, and no message where worked time differs from total
elapsed. The data contract explicitly permits extension provided coverage is not reduced.

Measured after merge: **18 threads, 1052 messages, longest thread 700 messages with 50 initially
visible, 9 messages over 1200 characters, 46 messages with diverging worked and elapsed time.**

---

## Reading the concepts

The sixteen concepts are deliberately different responses to one problem: at 520 pixels, can you still
follow the human conversation while Goal, Todo, subagent, diff, activity, thought, question, search,
Context Lens, artifact, and runtime detail stay available and truthful?

They are not ranked. Each makes a different bet, and the workspace exists so those bets can be compared
side by side rather than argued about in the abstract.
