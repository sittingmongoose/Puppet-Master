Run from `Concepts/chat-assistant-concepts/5.6 Pro` with `playwright` installed in Node's module path and `agent-browser` on PATH.

```sh
node tests/port-suite.mjs --page standalone --build --out /tmp/c56port-tests/standalone
node tests/port-suite.mjs --page pm7 --build --out /tmp/c56port-tests/pm7
node tests/port-suite.mjs --page both --build --out /tmp/c56port-tests/integrated
```

The runner opens GPU browsers sequentially and prints per-suite and per-page totals. Each stage has a log and JSON report; `summary.json` lists failing IDs and owners. `--standalone-file` and `--pm7-file` select existing builds. No built page is committed. A nonzero child exit or missing report fails the run.

For a focused regression pass:

```sh
node tests/port-suite.mjs --page both --only wonderer,layout --wg-only core --pm7-file /tmp/c56port-tests/PMConcept7.html --out /tmp/c56port-tests/regression
node tests/wonderer-grill-verify.mjs --browser --page pm7 --file /tmp/c56port-tests/PMConcept7.html --json /tmp/c56port-tests/r2.json
node tests/carry-over-layout-verify.mjs --page pm7 --file /tmp/c56port-tests/PMConcept7.html --sweep --json /tmp/c56port-tests/layout.json
```

`WGV_ONLY=r2` limits the Wonderer verifier to R2-1–R2-10 and the round's design checks. `--wg-only core` runs the original Wonderer, Grill Me, R1, and R2 checks. The default also runs the newer recorded examples (`rx`) and other Demo Studio examples (`ax`); none are removed. Node-only checks remain `node tests/wonderer-grill-verify.mjs`.

The layout pass measures Crew and Room sheets in all ten looks at 400, 420, 440, 459, 460, 480, 500 and 519 px. `--sweep` measures every integer width in 400–519. `--looks retro-light,retro-dark` narrows layout and neon reruns.

| ID | Assertion |
|---|---|
| CO-HEADER | Shelf title, step numeral and meta text have no overlapping line rectangles; their text clears clipping ancestors and owns its hit-test samples. |
| CO-CHROME | Persona and the Start button's 3 helpers remain present, unclipped and reachable at narrow sheet widths. |
| CO-PLATE-EDGE | At 480 px, the completed Crew plate's “got one checked result” is at least 12 px from its plate edge. |
| CO-PLATE-AFTER | At 480 px, “after both” clears its dependency line by at least 8 px. Missing specimens fail. |

R2-4 still hides the measured text, captures the browser-painted background, composites the actual ink and opacity, and requires 4.5:1 in all ten looks. It runs again on PM7 after token changes.

The host adapter keeps one set of assertions:

| Standalone | PMConcept7 |
|---|---|
| `index.html` | Private `PMConcept7.html?o55=off&pm56test=1` |
| `body[data-theme]`, `PM56_DEMO.setTheme` | `html[data-theme]`, `PM_THEME`, `PM_NIER.preview`; `.pm56-host` must mirror the painted theme |
| Lab editor and `state.activeEditor` | `PM_HOME.active()` and the real `.pmw-tabbody[data-pmw-tab]` |
| Viewport chat breakpoints | Chat-column width through `PMW.chatCol.setWidth`; window-based sheets are measured separately |
| Full chat root | `#chatPanel > #pmw-chat56.pm56-frame > #pmRoot.pm56-host`; overlays at `body > #pmOverlayRoot.pm56-host` |

The adapter reads host state and invokes host APIs. It does not create fake editor tabs or weaken pass conditions. `--cdp` attaches to a caller-owned GPU session; callers stop it. Without it, the helper starts and stops its own `agent-browser`, including on error and SIGTERM. At most one browser is started per suite process; run at most two suite processes per lane.
