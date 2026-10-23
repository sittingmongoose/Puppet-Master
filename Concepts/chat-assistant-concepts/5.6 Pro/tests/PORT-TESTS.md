Run from `Concepts/chat-assistant-concepts/5.6 Pro` with `playwright` installed in Node's module path and `agent-browser` on PATH.

Build commands use the current checkout. Build the final port from the lead's integrated branch, or pass its immutable page with `--pm7-file` from this tests branch.

```sh
node tests/port-suite.mjs --page standalone --build --out /tmp/c56port-tests/standalone
node tests/port-suite.mjs --page pm7 --build --out /tmp/c56port-tests/pm7
node tests/port-suite.mjs --page both --parallel-pages --build --sweep --out /tmp/c56port-tests/integrated
```

The runner opens GPU browsers sequentially per page and prints per-suite and per-page totals. `--parallel-pages` runs the two page workers together, owning at most two browsers; use it only when this lane has both GPU slots free. Child reports live under `standalone/` and `pm7/`; the root `summary.json` combines them. Each stage has a log and JSON report; `summary.json` lists failing IDs and owners. `run.json` records the source commit, arguments and page SHA-256; each summary row also carries the page hash. `--standalone-file` and `--pm7-file` select existing builds. No built page is committed. A nonzero child exit or missing/empty report fails the run. `--only node` runs the 94 engine/static checks without opening a browser.

The `thought` stage (`thought-verify.mjs`, DL-234) checks the live Thought Stream on both pages: 7 source checks, then the block heading the turn while the reply waits hidden, the six-line Auto window, the fold no later than the answer's first word, reopen by click and Enter, Expanded staying open, the preference round trip through the composer's Thought Stream menu, New chat defaults and (PMConcept7) Settings, Reduced Motion, Stop while thinking, the line's hover tag, both Demo Studio examples, the two polite statuses, and painted-pixel contrast of the reasoning, its line and the folded gist in all ten looks (4.5:1, the R2-4 method). `node thought-verify.mjs --node` runs the source checks alone; `--only <group>` narrows a rerun (auto, expanded, prefs, reduced, stop, hover, studio, contrast).

For a focused regression pass:

```sh
node tests/port-suite.mjs --page both --only wonderer,layout --wg-only core --pm7-file /tmp/c56port-tests/PMConcept7.html --out /tmp/c56port-tests/regression
node tests/wonderer-grill-verify.mjs --browser --page pm7 --file /tmp/c56port-tests/PMConcept7.html --json /tmp/c56port-tests/r2.json
node tests/carry-over-layout-verify.mjs --page pm7 --file /tmp/c56port-tests/PMConcept7.html --sweep --json /tmp/c56port-tests/layout.json
```

`WGV_ONLY=r2` limits the Wonderer verifier to R2-1–R2-10 and the round's design checks. `--wg-only core` runs the original Wonderer, Grill Me, R1, and R2 checks. The default also runs the newer recorded examples (`rx`) and other Demo Studio examples (`ax`); none are removed. Node-only checks remain `node tests/wonderer-grill-verify.mjs`.

`--wg-only b2` isolates the initial Crew intake guards. Its pending-lookup fixture slows the recorded clock after Start, then restores normal speed once the lookup line appears so the recording's own fact timer resolves it. It never injects a fact or bypasses a gate. Hosted disabled controls must remain inert under a real click, including when PM7 makes them keyboard-focusable with ARIA.

`--wg-only b5` stops after the initial Crew and BrainStorm gate checks. `--wg-only rx --rx-scale 1` measures the recorded examples at their normal user pace; the default is the original accelerated scale 3. Both use the same timing thresholds and record the command in run.json. A normal-pace receipt is reported separately from an accelerated run.

`--wg-only contrast` runs the identical R2-4 setup, painted-pixel measurement and 4.5:1 predicate in all ten looks, plus page-error checking. It supports the short rerun after theme inks change; the full R2 path still runs every original guard.

`--wg-only rx-starting` selects Crew Delegate, BrainStorm synthesis/constraint and Room discussion/plan. It runs their original flow, Starting, narration and pacing verdicts, plus page-error checking. The full RX default remains unchanged.

`--wg-only rx-tail` starts at the automatic-round, pause, move and lane-layout guards. It reuses the same assertions and supports completing coverage when an earlier recorded-example run stopped. The full RX path still includes both parts.

AX's existing `AX_ONLY` regex filters examples for a focused rerun, and `AX_SCALE=1` selects normal user pace (default 3). A filter matching no examples fails. For example, `AX_ONLY='Debug|A preview is not a promise|Schedule a frozen Crew' AX_SCALE=1 node tests/port-suite.mjs --page pm7 --only wonderer --wg-only ax --pm7-file /tmp/PMConcept7.html --out /tmp/chat-ax-focused`.

The runner records the three AX filter/pace/width environment variables in run.json alongside command arguments and page hashes.

Record the integrated Crew, Room and BrainStorm examples at their readable real-time pace:

```sh
node tests/wonderer-grill-film.mjs --page pm7 --file /tmp/c56port-tests/integrated/PMConcept7.html --out /tmp/c56port-tests/films
```

`--flow crew|room|brainstorm` selects one film; `--look` selects any of the ten looks. Films use `agent-browser --record` sequentially at the recorder's fixed viewport, click the real Demo Studio tiles and only answer the product's documented user waits. Each session is stopped in `finally` and on termination. `films.json` records page hashes, moves, final run state and page errors; the result PNG supports visual review. Record after the looks, NieR and Demo Studio lanes are integrated, then review frames before accepting the films.

The layout pass measures Crew and Room sheets in all ten looks at 400, 420, 440, 459, 460, 480, 500 and 519 px. `--sweep` measures every integer width in 400–519. `--looks retro-light,retro-dark` narrows layout and neon reruns.

For an explicitly limited time budget, `--sweep --width-step 4` measures every fourth pixel plus 400, 420, 440, 459, 460, 480 and 519 (32 widths per sheet/look). The report records its exact width list; this is sampled coverage. The default sweep remains every integer.

| ID | Assertion |
|---|---|
| CO-HEADER | Shelf title, step numeral and meta text have no overlapping line rectangles; their text clears clipping ancestors and owns its hit-test samples. |
| CO-CHROME | Persona and the Start button's actual configured helper count (Crew 3, Room 4 by default) remain present, unclipped and reachable at narrow sheet widths. |
| CO-PLATE-EDGE | At 480 px, every completed Crew plate label (SVG text and foreignObject HTML fragments) is at least 12 px from both plate sides; the “got one checked result” specimen must be painted. |
| CO-PLATE-LINE | Every label clears every plate stroke by 8 px, including paper outlines, hatch boxes and floor marks, following pmx-verify's geometry set. |
| CO-PLATE-AFTER | At 480 px, “after both” clears its dependency line by at least 8 px. Missing specimens fail. |
| CO-FONT | Hosted NieR sheet/run-view text uses PM NieR Sans, code uses PM NieR Mono, and each used Latin face is loaded. The standalone keeps its own font contract. |

R2-4 still hides the measured text, captures the browser-painted background, composites the actual ink and opacity, and requires 4.5:1 in all ten looks. It runs again on PM7 after token changes.

The PM7-only `host` stage guards editor visibility after collapse, Usage, background opens and close. It also checks the Home browser's remembered participant route for isolated send, insert, list, tray capture and the painted composer Send button after a destination change. Composer intake must restore the remembered route or refuse with feedback while preserving the existing draft and attachment; it cannot silently send to Assistant. Run it alone with `--only host`.

The host adapter keeps one set of assertions:

| Standalone | PMConcept7 |
|---|---|
| `index.html` | Private `PMConcept7.html?o55=off&pm56test=1` |
| `body[data-theme]`, `PM56_DEMO.setTheme` | `html[data-theme]`, `PM_THEME`, `PM_NIER.preview`; `.pm56-host` must mirror the painted theme |
| Visible `.editor-tab.active` matching `state.activeEditor` | Visible selected `.pmw-tab` matching `PM_HOME.active()` and the real `.pmw-tabbody[data-pmw-tab]` |
| Viewport chat breakpoints | Chat-column width through `PMW.chatCol.setWidth`; window-based sheets are measured separately |
| Full chat root | `#chatPanel > #pmw-chat56.pm56-frame > #pmRoot.pm56-host`; overlays at `body > #pmOverlayRoot.pm56-host` |

The adapter reads host state and invokes host APIs. Column measurements allow the host's 1 px internal hairline. Overflow checks compare the chat host's scroll width with its own client width and independently check document overflow. The adapter does not create fake editor tabs. `--cdp` attaches to a caller-owned GPU session; callers stop it. Without it, the helper starts and stops its own `agent-browser`, including on error and SIGTERM, and prints its session ID and CDP endpoint. At most one browser is started per suite process; run at most two suite processes per lane.

The layout verifier's `--section sheets|plate|fonts` supports focused reruns. Hosted `fonts` measures the two NieR looks. Default `all` keeps every section; final narrow-width acceptance requires `--sweep`.

Each browser result includes `sizeContext`, refreshed after load, theme, viewport/column changes and pointer release. It records the actual viewport, column, inner stage and transcript sizes plus the requested size. Hosted column requests use a window at least 2400 px wide and clamp the column to 400–760 px; check names inherited from standalone retain their original wording. Recorder attachments select the session's non-recorder page. A full width sweep has a three-hour stage limit; the complete Wonderer/RX/AX and Neon stages have 90 minutes; other stages have 45 minutes.

Hosted Turn and Orbit witnesses: Send now binds a queue entry ID, measures the busy/two-entry setup in the capture phase of the physical click, and retries only natural-completion/setup races (up to three fresh pages). It uses the existing long structured reply; the original exactly-one-delivery predicate is unchanged. Home row checks wait two animation frames before reading the actual selected visible tab. The hosted Shell guard checks native PMT.card command/status/exit/actions and row-toggle close (D27); standalone prompt/Exit/X checks remain.

Carry-over geometry is measured after finite sheet animations finish, in the same browser task, without freezing motion. Ink rectangles keep a height consistent with their ink top/bottom; the original line-box height remains diagnostic. This targets settled clipping/overlap, with transient re-render FLIP observations retained separately. Hosted History/Neon wide-list fixtures open/pin through actual controls and resize the visible separator after mounting. Questionnaire fixture take changes park the pointer outside activity domains; D7 clicks the settled painted choice and retains the original draft predicates.

A bounded repeat can retain exact failing widths with `--only layout --sweep --width-step 4 --extra-widths 434,442` (34 widths per sheet/look). This is a sample; the default `--sweep` still runs every integer400–519. Reports record every measured width and the exact input hash.

History reads hosted custom properties on the chat root and resets them through `PM56_ROOT_STYLE`, the same facade the product uses for its chat, overlay and effects roots. Neon sets the legacy reduced-motion class on the page body and exercises the real host bridge that mirrors it onto chat hosts; the fixture does not assign the host class. Its zero-running/zero-infinite assertions remain unchanged; outside-chat infinite animations are additional diagnostics. `node neon-verify.mjs --page pm7 --file /absolute/PMConcept7.html --section '^(satellite|reduced body)' --json /tmp/neon-focused.json` runs the original matching section bodies, records the filter, and fails an empty selection. Omit `--section` for full coverage.

History uses the visible standalone lab chip when available; hosted open/pinned History uses its native Close control because its header replaces the chat-header chip. The mid-open readability probe observes the real open transition instead of writing drawer-state attributes. A hosted regression physically clicks a blank drawer strip, requires BODY focus, and checks that Escape closes the floating drawer. Original geometry, animation, pin, scrim and dismissal predicates remain.

History transition traces start in the trusted physical click's capture phase, after Playwright actionability waits. Their original 520/420/400 ms windows, 14 ms sample interval, and distinct-position/interpolation predicates remain; time spent waiting to click is outside the measured transition.

PM7 intentionally widens the column on History pin (F3-637/D3). Hosted drawer and gutter movement therefore use the assistant pane as their coordinate origin; standalone keeps window coordinates. A separate hosted guard requires the message stage to keep its width. It reports the known 200 px drawer versus 240 px host-reservation gap as a failure, with both widths recorded.

Neon's 12a paired glow captures use the actual 90 px specimen rectangle and fail if it moves or scales. A hosted fixed child is positioned by its chat containing block; the page-origin crop can measure unrelated PM7 pixels. The original disc mask and greater-than-1.0 mean-difference predicate remain.

Neon 17b compares chat-neutral glyph ink inside every `.pm56-host` in PM7, including chat overlays and Home panel bodies. Native PM7 Usage/Home glyphs use a separate palette and are counted in `outsideChat` diagnostics. Standalone still scans its whole document. The greater-than-100 sampled-glyph precondition and neutral-ink predicate remain unchanged.

Legacy page adapters default viewport requests to chat-column tests. The explicit `page.setViewportSize(size, 'window')` test bridge preserves actual window dimensions; Neon's native Pod guard uses it for 1440, 1512 and 1920 px window cases. Reports retain both requested and measured window/column dimensions.
