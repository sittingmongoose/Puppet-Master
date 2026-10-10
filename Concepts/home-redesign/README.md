# Home redesign: universal panels and the terminal

The new PMConcept7 Home: one universal panel system (an n-ary split tree of tab groups) between the left rail and the
chat column, replacing today's separate editor panels, dashboard and terminal dock. Decisions D1-D28 are in
`/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md`; the host contract every tab kind builds
against is [`CONTRACT.md`](CONTRACT.md).

This package follows the **layer pattern** of the Usage and left-rail redesigns (`Concepts/usage-redesign`,
`Concepts/leftrail-redesign`), not the per-model concept folder of `Concepts/CONCEPT_RULES.md`: it is a build layer over
the published concept, and its review copy is a generated page. The Concept Hub registers it through
`opus-5.5-hub/` (a model-named folder whose page frames the review copy and passes the Hub's theme and Reduced Motion).

## Layout

```
Concepts/home-redesign/
  CONTRACT.md                 the tab-kind registry and host contract (panels thread; the terminal thread builds on it)
  tools/home_layer.py         apply(text, need) -> (text, notes), lint(), syntax_check(text)
  tools/build_home.py         build / --check Concepts/HomeTestPMConcept7.html (--out PATH for private builds)
  src/panels/early/*.js       <script id="pm-home-early"> in <head>: the PM_HOME_WORKSPACE shim, html[data-pmw-home]
  src/panels/js/*.js          the engine, one shared strict scope: window.PM_HOME (public) and window.PMW (internals)
  src/panels/kinds/*.js       the panels' own tab kinds, each in a scope of its own (sees PM_HOME and PMW only)
  src/panels/css/*.css        tokens, panels, shell, menus, parts, looks, NieR, Reduced Motion
  src/terminal/**             the terminal tab kind (terminal thread: window.PMT, pmt-)
  opus-5.5-hub/               the Concept Hub registration
```

## Commands (from the repository root)

```
python3 Concepts/home-redesign/tools/build_home.py            # build Concepts/HomeTestPMConcept7.html
python3 Concepts/home-redesign/tools/build_home.py --check    # rebuild in memory, lint, syntax, byte parity
python3 Concepts/home-redesign/tools/build_home.py --out PATH # a private build (workers, screenshots)
python3 Concepts/ConceptHub/validate.py "Concepts/home-redesign/opus-5.5-hub"
python3 Concepts/onboarding/opus-5.5/tools/build.py --check   # the published concept stays untouched: "check ok"
```

`?home=current` on the review copy shows today's Home (the layer stands down) for an A/B; `?o55=off` skips onboarding.

## What the layer does

`home_layer.apply()` starts from opus-5.5 `build.build_text()` and adds, between `HOME:` markers: the early script and
`<style id="pm-home-css">` before `</head>`, and `<script id="pm-home-js">` before `</body>` (panels core, then each
panels kind in its own scope, then the terminal, then `PM_HOME.boot()`), plus the panels' NieR hook classes in the
Settings script's NieR selector lists, on anchors the Usage and rail layers do not use. One guarded app JS patch
(`homeActive`) lets the chat stay one column on every page. It never edits the page's markup.

At run time the early script defines `PM_HOME_WORKSPACE` before the old Home controller parses, so that controller's own
guard skips it: one Home model. The centre mounts in `#panel-dashboard`; the chat column reuses `#chatPanel` and
`#chatResizer`; the legacy Home nodes are hidden, never removed; old open paths (the file tree, `cmd.file.open`, the demo
facade, the bottom-panel reveals) go through `PM_HOME.open`.

Lint (the build fails on each): emoji, `:has(`, a coloured side border (`border-left`/`border-inline-start` of 2 px or
more, inset side shadows), class names containing `pill`, capsule radii, viewport width `@media` inside the package,
window-size reads outside the narrow ladder, banned copy words, and a top-level name declared twice in one scope.

Publishing into PMConcept7 waits for the planning thread (D28): the NieR showpiece, the 5.6 Pro chat round with the
fonts, the Usage port, the left rail and the hover polish publish first.
