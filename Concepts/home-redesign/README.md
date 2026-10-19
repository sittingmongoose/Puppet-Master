# Home redesign: universal panels and the terminal

The new PMConcept7 Home: one universal panel system (an n-ary split tree of tab groups) between the left rail and the
chat column, replacing today's separate editor panels, dashboard and terminal dock. Decisions D1-D28 are in
`/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md`, and D17a and D29-D41 are in the addenda
beside it (`DECISIONS-ADDENDUM-1.md` to `DECISIONS-ADDENDUM-3.md`); the host contract every tab kind builds against is
[`CONTRACT.md`](CONTRACT.md).

This package follows the **layer pattern** of the Usage and left-rail redesigns (`Concepts/usage-redesign`,
`Concepts/leftrail-redesign`), not the per-model concept folder of `Concepts/CONCEPT_RULES.md`: it is a build layer over
the published concept, and its review copy is a generated page. The Concept Hub registers it through
`opus-5.5-hub/` (a model-named folder whose page frames the review copy and passes the Hub's theme and Reduced Motion).

## Layout

```
Concepts/home-redesign/
  CONTRACT.md                 the tab-kind registry and host contract (panels thread; the terminal thread builds on it)
  tools/home_layer.py         apply(text, need) -> (text, notes), lint(), syntax_check(text), published_problems(text)
  tools/build_home.py         build / --check Concepts/HomeTestPMConcept7.html (--out PATH for private builds)
  src/panels/early/*.js       <script id="pm-home-early"> in <head>: the PM_HOME_WORKSPACE shim, html[data-pmw-home]
  src/panels/js/*.js          the engine, one shared strict scope: window.PM_HOME (public) and window.PMW (internals)
  src/panels/kinds/*.js       the panels' own tab kinds, each in a scope of its own (sees PM_HOME and PMW only)
  src/panels/css/*.css        tokens, panels, shell, menus, parts, looks, NieR, Reduced Motion
  src/terminal/**             the terminal tab kind (terminal thread: window.PMT, pmt-)
  opus-5.5-hub/               the Concept Hub registration
```

## Tab kinds (D9)

| File | Kinds | Ids |
|---|---|---|
| `kinds/00-fallbacks.js` | stand-ins for kinds another thread owns (the terminal until `src/terminal/` is present) | `terminal:` |
| `kinds/10-editor.js` | Editor (D21): file and changes views, find, sticky scroll, the minimap scrollbar, Ctrl+P | `file:`, `buffer:` |
| `kinds/20-browser.js` | Browser with docked DevTools and captures | `browser:`, `link:` |
| `kinds/22-tools.js` | Output (one tab, the channel inside, D31), Problems, Ports, Debug Console (one tab, a sub-tab per debug session, D33) | `output`, `output:`, `problems`, `ports`, `debug-console` |
| `kinds/30-dashboard.js` | Dashboard (D10 step one: the page's widgets in dashboard tabs) | `dashboard:` |
| `kinds/40-plan.js` | Plan viewer and Deep Plan discovery | `plan:`, `plan-query`, `deep-discovery:` |
| `kinds/42-document.js` | Documents: rules, notes, revert, debug, lens, wonderer | `teach:`, `memory:`, `revert:`, `debug:`, `lens-*:`, `wonder*:`, `doc:` |
| `kinds/44-artifact.js` | Artifact viewer, every subtype | `artifact:`, `artifact-revision:`, the chat's bare ids |
| `kinds/46-run.js` | Run views: crew, review, chat room, brainstorm, evidence | `collab-run:`, `crew-work:`, `review:`, `room:`, `brainstorm:`, `*-evidence:` |
| `kinds/48-transcript.js` | Agent transcript (read-only live feed) | `thread-` |
| `kinds/50-context.js` | Context detail | `context:` |
| `kinds/52-record.js` | Records: search, MCP calls, the database inspector, work records | `search:`, `mcp:`, `app:`, `work-record:` |
| `kinds/95-standin-chat.js` | the stand-in chat over `#chatPanel` (a scripted conversation that opens every kind) | |

The Guided Tour's workspace chapter (D25) is native to the tour: `open_from_plus`, `open_file_from_rail`, `split_by_drag`
and `widget_action` (Upcoming resets on the Home dashboard board) are defined in
`Concepts/onboarding/opus-5.5/src/js/83-tour-steps.js`, with their copy in that package's `src/copy.json` and NieR's Pod
lines in `src/copy.d/50-nier-tour.json`. What only the panels know (their buttons, menus, tabs, receipts, the Back
snapshots of the panels and boards) stays here as the panels' tour hooks, `PMW.tour` in `js/52-tour.js`, which the
steps look up when they run; it defines and edits no step.

## How the page is built (published)

The Home layer is published. `Concepts/onboarding/opus-5.5/tools/build.py` builds the page in this order: Settings, the
Usage page (`usage_layer`), the left rail (`rail_layer.apply_published`), then this layer (`home_layer.apply`, step 5
of `build_text()`). So `build.py` writes `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html` with the panels and
the terminal, and `build.py --publish-pm7` writes the same bytes to `Concepts/PMConcept7.html`. `build.py` and
`build.py --check` lint this package's sources (`home_layer.lint()`, in `lint_sources()`) and add
`home_layer.published_problems()` to their checks.

The review copy `Concepts/HomeTestPMConcept7.html` (the Concept Hub's `opus-5.5-hub/` frames it) is the same bytes as a
fresh build, so it can never drift from the published page. `build_home.py --check` fails when a source breaks the
layer's rules, a script does not parse, a HOME marker or a kept anchor is not there exactly once, or the review copy,
`TestOpus5.5PmConcept.html` or `PMConcept7.html` differs from a fresh build. Every one of them is generated: after
changing a source, run `build.py --publish-pm7`, then `build_home.py` (and the rail's `build_rail.py`, whose review
copy stacks on the published page).

## Commands (from the repository root)

```
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # build and publish PMConcept7.html with the layer
python3 Concepts/home-redesign/tools/build_home.py                 # write the review copy (the same bytes)
python3 Concepts/leftrail-redesign/tools/build_rail.py             # the rail's review copy, stacked on the page
python3 Concepts/onboarding/opus-5.5/tools/build.py --check        # lint, syntax, markers, both published pages current
python3 Concepts/home-redesign/tools/build_home.py --check         # the same for this layer, plus the review copy
python3 Concepts/home-redesign/tools/build_home.py --out PATH      # a private build (workers, screenshots)
python3 Concepts/onboarding/opus-5.5/tools/build.py --out PATH --no-home  # a private reference page with today's Home
python3 Concepts/ConceptHub/validate.py "Concepts/home-redesign/opus-5.5-hub"
```

`?home=current` shows today's Home (the layer stands down, and the tour's workspace chapter is its orientation alone)
for an A/B; `?o55=off` skips onboarding.

## What the layer does

`home_layer.apply()` runs after the rail and glyphs in opus-5.5 `build.build_text()` and adds, between `HOME:` markers: the early script and
`<style id="pm-home-css">` before `</head>`, and `<script id="pm-home-js">` before `</body>` (panels core, then each
panels kind in its own scope, then the terminal, then `PM_HOME.boot()`). Its `NIER_ENTRIES` dictionary contributes
`cursor`, `chosen`, and `strip` selectors to opus-5.5's `tools/nier_registry.py`; `build.py` emits the
lists after all layers. Edit those entries, not Settings source anchors; a private build without Home contributes none.
Guarded app JS patches let the chat stay one column on every page (`homeActive`) and give the status bar's host item
plain words that NieR's readout finds by an attribute. It never edits the page's markup.

At run time the early script defines `PM_HOME_WORKSPACE` before the old Home controller parses, so that controller's own
guard skips it: one Home model. The centre mounts in `#panel-dashboard`; the chat column reuses `#chatPanel` and
`#chatResizer`; the legacy Home nodes are hidden, never removed; old open paths (the file tree, `cmd.file.open`, the demo
facade, the bottom-panel reveals) go through `PM_HOME.open`.

Lint (the build fails on each): emoji, `:has(`, a coloured side border (`border-left`/`border-inline-start` of 2 px or
more, inset side shadows), class names containing `pill`, capsule radii, viewport width `@media` inside the package,
window-size reads outside the narrow ladder, banned copy words, and a top-level name declared twice in one scope.

Publishing into PMConcept7 followed the order D28 set: the NieR showpiece, the 5.6 Pro chat round with the fonts, the
Usage port, the left rail, the hover polish and the Plans canon first, then the panels and the terminal (2026-10-10).
