# Agent-tooling ideas from Expo Exact: what Puppet Master should adopt

Research report, 2026-11-10. Research and report only: no implementation and no canonical Plans were changed.

| Pinned source | Commit |
|---|---|
| Expo Exact, `github.com/expo/exact` | `76cd50f9e863129b3fc75db1673d6ad4bbf79258` (2026-11-10) |
| Puppet Master Plans and tooling | `47d9dc7655d34b07962bf2cb2907e5676c012315` (`origin/main`) |
| Slint, newest release 1.18.1 | `372cf0ee5577c3dfec309a45e7b778ba4e81b734` |
| Slint 1.17.1, the version `Plans/FinalGUISpec.md` line 133 still names | `cf62c975c311e7036d599ed8ed0b7e6a8386a934` |

Jared, 2026-11-10: Puppet Master will build on the newest Slint and Leptos at build time, and the pins in Plans are stale on purpose. Slint findings below are checked on 1.18.1 and on 1.17.1.

Evidence files: [`evidence/exact-sources.md`](evidence/exact-sources.md) (every Exact and Slint claim, commit-pinned), [`evidence/plans-citations.md`](evidence/plans-citations.md) (73 Plans passages, each checked at its line), [`evidence/local-measurements.md`](evidence/local-measurements.md) (what was run here), [`evidence/raw/`](evidence/raw/) (small raw outputs), [`evidence/EVIDENCE-INDEX.md`](evidence/EVIDENCE-INDEX.md) (all raw files by path and SHA-256). Code: [`probe/`](probe/) (the Slint probe and adapter, the pilot kit, oracle and measuring scripts).

**Revised 2026-11-10, correction pass.** Changed: the listing's disabled state (a real bug); what stock Slint's test server does not give; the adapter arrangement and seven focused checks (R1); item keys for repeated controls (R2); freshness checked against the loaded target, with two identities (R3); measurement wording and byte counts; the pilot's design, with eight calibration sessions (section 7).

## 1. Summary

**The main finding is not in Exact.** Exact's best idea is that a test build shows an agent a small text listing of the controls on screen, addressed by stable ids, with time the test controls. Slint already ships most of that: element ids, accessibility properties, simulated pointer and keys, event recording, screenshots, mock time, and an embedded MCP server for agents, behind build features that are off by default. It is split across two routes, though. The in-process test API has ids and mock time but draws no pixels. The test server draws pixels but, in 1.18.1, returns no `accessible-id` and has no clock control. Puppet Master should build on that layer with one small test-only adapter and not design its own hook.

**What Puppet Master has to add is small and specific:**

1. **One id per control, in the running UI.** The wiring matrix already gives every control a stable `ui_element_id`. No rule makes the built interface carry it. Slint has a string property for exactly this, `accessible-id`, which Plans never mention.
2. **A compact listing.** Slint's raw element tree for the 12-control page is 66.8 KB. The 12 interactive controls fit in 669 bytes.
3. **The parts of ATS-067 the toolkit does not give:** active screen, scroll position, each dispatched command with its result, frame timing, redraws, memory, renderer. Focus and text selection are in Slint's accessibility tree but not in its test server's replies.
4. **A build stamp and a refusal.** Receipts must name the revision, but nothing compares the running build with its sources, so a stale build can pass.
5. **Controlled time for behaviour tests only.** Rendering, motion and performance checks stay on real time with the real renderer.

**Demonstrated versus assumed, in one line each:**

- **Demonstrated here:** the Slint layer works on both versions; seven focused checks of id targeting, refusal, repeated controls and pointer input on mock time pass on 1.18.1; the size gap between a full tree and a compact listing; that names do not tell Puppet Master's controls apart (42 of 150 reachable controls on the concept's Home share a role and a name taken from the DOM; 28 have an id); and that a run can detect a wrong or replaced build from the loaded page.
- **Demonstrated by Exact:** agent cost of building one app fell from 17.0M to 6.6M tokens and from 15.2 to 8.1 minutes as its guides, diagnostics and tooling improved. The gain cannot be assigned to any single idea, and round-to-round noise is about ±20%.
- **Demonstrated by Puppet Master's own history:** replacing fixed waits with waits on conditions took the onboarding suite from 3/69 on one machine and 69/69 on another to 69/69 on both, three times.
- **Assumed:** that these ideas cut agent time, tokens and retries on Puppet Master. Eight calibration sessions (section 7) proved the measuring apparatus and showed no difference between the arms; they are far too few, and their tasks too easy, to say more.

Five decisions are needed from Jared before any Plans edit. They are in section 8.

## 2. What exists, what is planned, what is missing

"Exists" means agents use it today on the concept page (`Concepts/PMConcept7.html`) through the browser-check kit, `agent-desktop` or the phone tools. "Planned" means an accepted PlanUnit says it. The repository holds no application code yet, so nothing exists for the Slint or Leptos clients themselves. `P..` numbers point into [`evidence/plans-citations.md`](evidence/plans-citations.md); `E..` into [`evidence/exact-sources.md`](evidence/exact-sources.md); `M..` into [`evidence/local-measurements.md`](evidence/local-measurements.md).

| Idea from Exact | Exists today | Planned in Plans | Missing |
|---|---|---|---|
| **Stable control and command ids** (E01, E12) | 1,333 wiring rows keyed by `ui_element_id`, 1,180 distinct `cmd.*` ids, a validator (P44). On the concept page 28 of 150 reachable controls have a DOM id and 2 carry a command id (M1). | Every control has one command id or one typed local action (`ui.*`), or an explicit view-only disposition (P41, P78, P79, P80). Control census for Home and terminal. Tab ids are stable (P26). | A rule that the built UI carries `ui_element_id`, for command, local-action and view-only controls alike. 1,037 of the 1,333 rows are generated `catalog.*` rows with no real control behind them yet. No id rule for mobile. |
| **Compact listing of what is on screen** (E01, E13) | browser-check has a filtered accessibility query; the full dump goes to a file and is never printed. `agent-desktop` and `agent-device` give trees with refs for native apps; a full desktop snapshot is 45–60 KB. | ATS-067 lists what a test agent can read (P01) but names no format, size or addressing. | The listing itself, its size cap, scoping by region. For the desktop, Slint maps its elements to the operating system's accessibility tree, so `agent-desktop` should be able to read a window; that was not tested here. |
| **Act by id through a short fixed list of operations** (E01, E02) | About 48 browser-check helpers plus Playwright's page API; selectors, not ids. | Four dev-preview commands, test builds only (P46). Cases must drive the visible control by pointer and keyboard (P05) and must not substitute an internal API (P07). | An id-addressed act path, and a ruling on which kind of input counts (section 8, question 3). |
| **UI-to-source map** (E05) | None for the concept. | Each wiring row names its handler as a Rust path (P45). The Slint file tree is named (P32). | Control to declaring component and line. Slint's element id is `Component::element-id`, which is already most of this (M2). Leptos needs a decision. |
| **Structured build diagnostics** (E04, E14) | Plans validators print capped samples (first 50 or 100 failures). | A diagnostic entry shape for user projects: path, line, character, severity, message, source, code (P61), capped for prompts (P62). Output truncation with head, tail, exact size and a file ref (P60). | The same shape for Puppet Master's own builds (cargo, Slint compiler, Gradle, Xcode). All failures in one run. |
| **Scoped state, layout, logs, performance** (E03, E09, E10) | Kit prints one summary line; images cost about 2,600 tokens each; a page sampler has a cost budget. | ATS-067 names frame timing, redraw activity, memory growth and renderer (P01) and says the output is never acceptance by itself (P03). Startup diagnostics for the renderer (P30). | Scoping and a size cap. No application logging contract. No frame, startup or memory budget for the GUI as a whole; budgets exist for single parts, such as 2 ms of CPU per terminal effects frame and 150 ms for the first chat page (P81, P82). |
| **Evidence tied to the running build** (E06, E07, E08) | The kit tests the committed page unless `--set page=` is given (P73); the build tool prints a hash; nothing in the page says which build it is. | Native receipts name revision, platform, toolkit, renderer (P06, P17). Stale receipts are dimmed when files change (P11). A release binds a build id (P54). | A stamp the running target reports, checked after every load; application identity kept apart from test identity; a comparison with the sources; a "current or stale" list of past runs. The first two were built and tested for the concept page in this pass (M9). |
| **Test-controlled time** (E09, E15) | None: waits on conditions, `t.settle()`, Reduced Motion emulation. | None. Capture clocks are calibrated (P63); no injected clock in the application core. | Mock time for behaviour tests, and a single clock in the shared interface model. |
| **One behavioural test, every client** (E02) | None across clients. | Desktop and web share fixtures and scenarios, each with its own screenshots (P10, P27). | A scenario format, a runner per client, and mobile. Plans say two sentences about the Kotlin and Swift clients (P58, P59). |
| **Real input, rendering and performance checks on top** (E11, E16) | browser-check films and pixel checks on a GPU browser; recordings; `agent-desktop`, Cua, Simlock. | Rendered outcome, never a dispatch count (P05, P15, P18). Concept results never certify a native client (P06). Missing runners stay not run (P16). | Nothing in principle. The split between fast behaviour runs and certification runs is not written down. |
| **Friction log that feeds the tool** (E17) | `browser-check report` (272 entries) and the project's tool-issues list. | Not needed in Plans. | Nothing. Already ahead of Exact here. |
| **Agent cost measured from transcripts** (E18) | Review credit counts only. No per-run tokens, turns or retries. | None. | The measuring tool. Section 7 uses it. |

## 3. What Exact demonstrates, and what it does not

**Measured by Exact** ([`bench/agent-framework`](https://github.com/expo/exact/blob/76cd50f9e863129b3fc75db1673d6ad4bbf79258/bench/agent-framework/README.md#L88-L116), E18):

| Round | Tokens (M) | Time (min) | Turns | Tests |
|---|---:|---:|---:|---:|
| 2026-10-30, before the work | 17.04 | 15.2 | 134 | pass |
| Round 1, 2026-10-31 | 10.10 | 12.2 | 102 | 3/3 |
| Round 21, 2026-11-02 | 6.59 | 8.1 | 86 | 5/5 |
| Astro, same benchmark | 3.62 | 6.6 | 63 | pass |

- **What it shows:** sustained work on guides, diagnostics and tooling cut one agent's cost of building one app: tokens by 61%, time by 47%. These are Exact's own figures and were not reproduced here.
- **What it does not show:** which change helped. Exact says rounds 18 to 21 moved less than noise, that medians move ±20% between rounds, and that it is still behind Astro on every agent measure because agents already know Astro.
- **What it does not cover:** testing an existing large interface, flakiness, or a native toolkit. The task is building a small site in a new framework.

**Costs Exact records against its own ideas** (its pitfalls file, each dated; E19 to E26):

| Idea | Recorded cost |
|---|---|
| Clock held by the driver | Dates read 1 January 2026; a live backend sorted test posts wrongly. A screenshot after a change shows the start of a transition. A test passed on the web and failed on iOS because a reply had not landed. A latency test passed at once. |
| Programmatic input | A tap on a row pressed the Like and Repost buttons inside it, on real people's posts. The fix: a tap presses the node it names or is refused. |
| Performance read through the driver | An accessibility client added a 100–200 ms stall the app never makes. In one profile 1,533 of 1,573 empty batches were the driver's own. Under the held clock no frame is presented, so frame timing is measured in a separate real-time window. |
| Screenshots from inside the app | A focus ring never shows; some compositor effects are missing. |
| Stale-build refusal | An evidence file kept beside the app made every build stale until moved. |
| Ten operations | The count held at ten, but each verb grew many forms: the `tap` grammar alone fills several lines of the driver's header (E02). |

These costs are the reason for the limits in section 4: controlled time and programmatic input are for behaviour tests, and never for rendering, motion, performance or certification.

## 4. Recommendations, in priority order

### R1. Use Slint's own test layer for the desktop, through one small adapter. Do not build a hook.

Stock Slint gives three routes to a running interface. None of them does everything, so the choice is which to use for what, plus the smallest piece of code that joins them.

| | In-process test API | Test server (MCP or socket) | Operating system's accessibility tree |
|---|---|---|---|
| Where it runs | Inside a test binary, on Slint's testing backend | Inside a test build of the app, any backend | Outside the app, any build |
| Draws pixels | No | Yes (screenshots, headless too) | Not its job |
| Find by `accessible-id` | Yes (M7, M8) | **No**: the reply has no such field in 1.18.1 (M7) | Yes in the source (author id); not tested here |
| Find by `Component::element-id` | Yes | Yes | No |
| Mock time | Yes (M3, M8) | **No**: no tool sets or steps the clock; it runs on real time | No |
| Pointer input | Simulated through the window's own event dispatch, on mock time (M8) | Simulated, on real time | Real, from an outside tool |
| Accessibility actions | Yes | Yes | Yes |
| Focus and text selection | Not checked | Not in its replies | In the source |
| Ships in a release | Never linked | Compiled out without the feature (M4) | Yes, as normal accessibility |

- **So "Slint already has it" is true only in parts.** The route with ids and mock time has no pixels. The route with pixels has neither `accessible-id` nor mock time. Version 1.17.1 was not re-checked for these two points.
- **The smallest arrangement that covers the gap:**
  1. **A behaviour runner, in-process.** One test-only module over Slint's in-process API. The probe's is 110 lines (`probe/slint-probe/src/testkit.rs`): find one control by its canonical id or refuse; pointer tap on mock time; accessibility action, labelled apart; step the clock; compact listing; report the build id. It is an optional dependency behind a cargo feature, so a build without the feature does not link the test crate at all (0 against 1 in the dependency tree, M8).
  2. **Rendered runs through the stock test server, unchanged**, on real time, for screenshots and for pointer input against the real renderer. Until the server returns `accessible-id`, address by `Component::element-id` there, or carry a one-field patch in the patch set Puppet Master already keeps for its Skia additions (F3-582), or offer it upstream.
  3. **Nothing custom inside the product.** No Puppet Master code runs in the app for testing.
- **Focused checks run here on Slint 1.18.1** (M8; all seven pass):

| Check | Result |
|---|---|
| Target by canonical id | `btn.github.connect` reaches the control whose source id is `SettingsPage::btn-github-connect`. A misspelt id is refused. A control that states it is disabled is refused before any input. |
| Duplicate ids | Two controls sharing `dup.save`: the tap is refused, both candidates are named, no input is sent. |
| Repeated controls across reordering | Three rows, each with a "Copy relative path" button addressed as `files.row.copy_path#<key>`. After the rows are reversed and one is added, the same key reaches the same item at its new position. The row now at the old position is a different item. The id without a key matches nothing. |
| Pointer input on mock time | Press, 50 ms of mock time, release; then a 300 ms animation stepped to 150 and 300. 350 ms of mock time took 25 ms of real time, 75 ms with start-up. |
| Stock `single_click()` on mock time | Stays pending until the runner moves the clock by 50 ms. A runner on mock time must use the mock-time click or step the clock itself. |
| Pointer versus accessibility action on a covered control | The pointer tap hits the cover and the control is not clicked. The accessibility action clicks it anyway. Receipts label the two `toolkit-pointer` and `semantic-action`. |
| Disabled state in the listing | Disconnect is listed `disabled` before Connect is clicked and not after. |

- **Two things the checks turned up:**
  - Slint's stock descendant query returned the same button seven times in this probe. The adapter walks the tree once itself.
  - Over the test server, protobuf JSON omits false values, so "disabled", "not stated" and "not applicable" look alike. The first version of this report's listing dropped the `disabled` marker for that reason. The projection script now prints `disabled` when an interactive control has no enabled field, and says so; the in-process API keeps the three cases apart.
- **How it meets the ATS-067 boundary** (P02, P04): the test server is compiled only with `--features slint/mcp` on the command line and starts only when `SLINT_MCP_PORT` is set; element ids are embedded only when `SLINT_EMIT_DEBUG_INFO=1` at build. A build without the feature had no server and no listener (M4). Release needs a check that both switches were off.
- **Limits to state plainly:**
  - The testing crate is internal and not under semver, and the headless entry point is marked unstable. Between 1.17.1 and 1.18.1 four tools were added and one enum value was removed. With "newest at build time", the adapter and the driver need a re-check on every Slint upgrade.
  - The test server has no authentication and binds to localhost. Test builds must run on fixture data only (P20) and on a port per run.
  - Toolkit pointer input does not pass through the operating system. Certification keeps its own rules (R6).
  - Reading a Slint window through the operating system's accessibility tree was not tested, on stock Slint or on Puppet Master's Skia additions.
- **Wording in Plans to settle:** FinalGUISpec line 261 and ATS-023 list "MCP" among things production must not enable (P09, P20), and `Plans/MCP_Integration.md` forbids a product-owned browser-test MCP (P53). A toolkit test server in test builds is a different thing, but the text should say so (section 8, question 1).

### R2. Make `ui_element_id` the one address for a control, on every client.

- **Why:** the id already exists and is stable by rule (P44). On the concept's Home, names fail to tell controls apart (M1), and Exact reached the same rule after its row-tap incident (E12).
- **How to carry it:** Slint's `accessible-id` takes any string, so `home.dashboard_tab.undo_start_from` can be written as it is (M7). The same string fits a web attribute, a Compose `testTag` and an Apple `accessibilityIdentifier`. Slint's own element ids stay useful as the pointer to the source.
- **Repeated controls need an item key.** One button per file row is one wiring row but many controls. Address it as `<ui_element_id>#<item key>`, with the key taken from the item's own stable identity, never its position. Plans already say this for one surface: "repeated rows use stable IDs, never array positions" (P83). The id without a key must match nothing (M8).
- **Refuse, do not guess:** an address that matches no control, or more than one, is an error that names the candidates and sends no input (M8).
- **Cover every kind of control:** controls bound to a typed local action and view-only controls need an id as much as command controls do (P78, P79, P80). A listing must not invent a command for them.
- **The id then ships in production accessibility metadata**, where it is not spoken or shown (section 8, question 2).

### R3. Stamp every build, check the loaded target, and keep two identities apart.

- **Application build identity:** what the thing under test is. It is read from the running target, never from a file on disk or from what the runner believes it started. The probe app reports a digest of its sources compiled into the binary (M8). The pilot's pages carry a build id in the document, and the runner reads it from the loaded page (M9).
- **Test identity:** what was run against it: the check, the kit files, the fixture, the tool version. It is recorded beside the application identity and never merged with it. A result is current only while both still match.
- **When to verify:** at the first load, after every navigation and reload, and once more at the end of each test; the final receipt lists every load with the id it found.
- **Demonstrated on the concept page** (M9, no agent involved):

| Case | Run result | Receipt |
|---|---|---|
| The right build | Pass | fresh |
| The record names one build and the file is another | Fail at open: "expected 47af3367aca7, loaded 48125a4eecc4" | not fresh |
| The file is replaced on disk mid-test, then reloaded | Fail at reload | not fresh |
| A raw navigation, bypassing the helper, lands on another build | Fail at the end of the test: "2 of 4 loads did not match" | not fresh |

- **This is a correctness property.** It is judged pass or fail by cases like these. It is not part of the pilot's efficiency target.
- **Still missing:** comparing the build id with the sources before a run, as Exact does (E06), and the lister of current and stale runs (E07, 129 lines). Plans already require receipts to name revision, platform, toolkit and renderer (P06) and dim stale receipts in the product (P11).
- **Carry over Exact's lesson:** files that are not build inputs (evidence, logs, drive scripts) must live where the freshness check does not look.

### R4. Give agents a compact, scoped listing, and cap every read.

- **Sizes measured** (M1, M2; UTF-8 bytes):

| What the agent reads | Concept Home, 1920×1080 | Slint probe, 12 controls |
|---|---:|---:|
| Full accessibility tree | 1,119,665 bytes (3,274 nodes) | 66,828 bytes (140 elements) |
| Playwright's aria snapshot | 15,028 bytes (371 lines) | not applicable |
| Compact listing of reachable controls | 5,704 bytes (150 lines) | 669 bytes (12 lines) |
| One region only | 397 bytes (Activity bar, 12 controls) | not applicable |
| One screenshot | about 2,600 tokens | 45 KB PNG |

- **What to build:** a projection, not a new tree. One line per control: role, id, name, value, state, with `disabled` always stated. Scope by region or id. Cap the output and say what was left out, in the form `Plans/Tools.md` already uses for tool output (P60).
- **State, logs and performance the same way:** ask for one path, the lines since the last read, one capped report. ATS-067 already forbids treating this output as acceptance (P03); Exact's profiles show why.

### R5. Control time in behaviour tests only.

- **Desktop:** Slint's mock time, on the testing backend.
- **Web:** Playwright's clock (`page.clock`) and Chrome's virtual-time policy exist. Neither is used by browser-check today. Playwright's clock controls script timers and not CSS transitions, so `t.settle()` and Reduced Motion stay. Whether Chrome's virtual time covers CSS animation was not checked.
- **Application core:** Plans have no injected clock. One clock owned by the shared interface-model crate would let one scenario step time on both clients. This is new canon (section 8, question 4).
- **Never:** frame timing, motion evidence, recordings or performance on controlled time. Use a fixed epoch only when no live service is involved.

### R6. Write behaviour scenarios once, run them at three levels.

1. **Model level:** the scenario against the shared interface-model crate with no interface. Fastest. Covers commands, results and state.
2. **Toolkit level:** the same scenario through each client's test layer, addressed by `ui_element_id`, on controlled time. Slint testing backend; Leptos in a headless browser; later Compose test rules and XCUITest, which have the same three parts (ids, a tree, a test clock in Compose).
3. **Certification level:** the existing rules unchanged: real renderer, real pointer and keyboard, recordings, per-interface screenshots, receipts naming the build.

Plans already require the first two levels to share fixtures and scenarios between desktop and web (P10, P27). The format and the runners are missing. Mobile should wait until Plans say what the mobile clients are.

### R7. One diagnostic shape for Puppet Master's own builds.

- **Shape:** reuse the entry Plans already define for language-server diagnostics (P61), with a stable id and an end column added. Exact's is the same idea (E04; a real sample is in M5).
- **Sources that already emit it:** `cargo --message-format=json`; Gradle and Xcode result bundles. How the Slint compiler's diagnostics surface through cargo was not checked.
- **Rules worth copying from Exact:** every check reports all its failures in one run; judge a build by its exit status, never by searching output for the word "error" (E14, E27).

### R8. Measure agent cost from transcripts.

Exact's bench reads each agent's transcript and reports tokens, turns, time, characters read back by kind of call, and the largest tool results (E18). Puppet Master has no such number for any test tool. The pilot needs this first.

### Not recommended

| Idea | Why not |
|---|---|
| Exact's language, runtime or layout engine | The stack is fixed: Slint with Puppet Master's Skia additions, Leptos, Kotlin and Swift. |
| Programmatic input as the default for certification | ATS-075 requires the visible control, by pointer and keyboard (P05, P07). |
| A product-owned Playwright or browser-test MCP surface | Forbidden (P14, P53). The test layer stays outside the product. |
| Performance or motion evidence under a held clock or through the test layer | Exact's own measurements show the distortion; ATS-067 already forbids it (P03). |
| Exact's diary upload to its vendor | Private project data must not leave. The local friction log already exists. |
| Its rule that agents add no checks or documents | Outside this question, and Puppet Master's governance is a deliberate choice. |

## 5. Affected components and owner documents

No edits were made. This is where each change would land if approved.

| Change | Component | Owner document and unit |
|---|---|---|
| Name the desktop transport; add the items the toolkit lacks; size cap and scoping | Slint client, test builds | `Plans/Automated_Testing_System.md` ATS-067; `Plans/FinalGUISpec.md` line 261 and F3-582 (re-check on upgrade) |
| Say that a toolkit test server in test builds is not the product MCP surface | Wording only | `Plans/Automated_Testing_System.md` ATS-023; `Plans/FinalGUISpec.md` line 261; `Plans/MCP_Integration.md` |
| The built UI carries `ui_element_id` as its accessibility id, for command, local-action and view-only controls | Both clients | `Plans/UI_Wiring_Rules.md` UIW-003, UIW-006, UIW-013, UIW-015; `Plans/Wiring_Matrix.schema.json`; `Plans/FinalGUISpec.md` section 13.4 and F3-583 |
| Which input satisfies "drives the visible production control" | Test runners | `Plans/Automated_Testing_System.md` ATS-075, ATS-076 |
| Build stamp, stale refusal, run record | Build scripts, test driver | `Plans/Automated_Testing_System.md` ATS-026 (receipt fields), ATS-075; `Plans/Release_Supply_Chain.md` RSC-015 |
| Release check that the test layer and debug info are absent | Release pipeline | `Plans/Release_Supply_Chain.md` RSC-012 or RSC-015; ATS-067 acceptance |
| One clock in the shared model | Shared interface-model crate | `Plans/FinalGUISpec.md` F3-583; `Plans/Contracts_V0.md` |
| Scenario format and the three levels | Test runners | `Plans/Automated_Testing_System.md` ATS-023 |
| Diagnostic shape for own builds | Build tooling | `Plans/LSPSupport.md` LSPS-101 (shape reused); `Plans/Tools.md` |
| Compact listing, build stamp and ids on the concept page | browser-check kit, `build.py`, concept sources | `Concepts/pm7-tools/browser-check/`, `Concepts/onboarding/opus-5.5/tools/build.py` (tool and concept work, no Plans) |
| What the mobile clients are, before any mobile test rule | Kotlin and Swift clients | `Plans/Server_System.md` line 1136; `Plans/rewrite-tie-in-memo.md` RTIM-011 |

## 6. Minimal implementation sequence

Each step is useful without the next. Steps 1 and 2 need no application code.

1. **Decide** the five questions in section 8.
2. **Concept tooling, now.** In the kit: a build stamp in the page, checked from the loaded page after every load; a scoped compact listing helper with a size cap; `ui_element_id` attributes on the controls of one surface, with item keys on repeated controls. All three exist as experiment code from this pass (`probe/pilot/`), not in the kit.
3. **Plans, one ledger.** ATS-067 and the MCP wording; the id rule; the build stamp and the release check; the clock; the input ruling. Prose first, then schema and gate companions, as the repository's ledger rule requires.
4. **First desktop code.** The test-only adapter behind a cargo feature and the in-process behaviour runner; the stock test server for rendered runs; the release absence check. `probe/slint-probe/` in this folder is a starting point.
5. **Web client.** The same driver verbs over the browser's accessibility tree and the id attribute.
6. **Scenarios.** The format, then the model-level runner, then the two toolkit-level runners.
7. **Evidence lister.** Current, stale or unchecked for each past run.
8. **Mobile**, after its owner text exists.

## 7. The pilot, revised, and its calibration

**Three questions, kept apart:**

1. **Correctness:** do the checks an agent writes catch a real defect and pass a correct page?
2. **Efficiency:** does an id-addressed compact listing cut the agent's time and tokens?
3. **Freshness:** can a run test the wrong build without noticing? This one is not a pilot question. It is a pass-or-fail property of the tooling, tested by the cases in R3.

**Design**

| Part | What it is |
|---|---|
| Task | Write one check that enforces a stated behaviour. The agent gets one page, which may or may not meet it, and is not told which. |
| Independent oracle | The delivered check is run unchanged on a page without the defect and on a page with the task's seeded defect, twice each. Correct means it passes the first and fails the second every time. Counted separately: false pass, false fail, flaky, timeout or harness error, nothing delivered. The agent's stated verdict is compared with the truth. |
| Arm A | The kit with every existing filtered and scoped tool: Playwright locators and role queries, the filtered accessibility query, hit-test visibility, text, count and style checks, crops, and scratch checks that save page state to a file. |
| Arm B | The same, plus control ids, `byId` with refusal, and the scoped listing (673 bytes for the Activity bar). |
| Same in both arms | The pages (the ids are in the DOM in both), the freshness check, the task text, the model and effort, the rules: real input only, waits on conditions, no reading of the page source. |
| Tasks | Three on the Activity bar (a click opens the panel; a second click closes it and clears `aria-expanded`; Enter opens it from the keyboard) and one on repeated controls (each file row's "Copy relative path" button names its own row). Each defect affects one item of nine, or one row of eight. |
| Measured | Wall time; total tokens and new tokens (cache writes plus output); turns; kit runs by kind; characters read back by kind; the oracle's class. |

**Decision rule for the full campaign, unchanged in size:** adopt on efficiency if median time and median new tokens both fall by at least 25% in arm B. The 25% is a chosen bar, not a statistical one. It applies only if arm B has no more false passes than arm A. Freshness is not part of it.

**Calibration: eight sessions, one per task and arm** (Opus 5.5 at high effort, 2026-11-10, two sessions at a time, one task's two arms together; M10):

| Task | Page given | Arm | Wall (s) | Total tokens | New tokens | Turns | Kit runs: task / scratch / listing | Read back (chars) | Stated verdict | Oracle |
|---:|---|---|---:|---:|---:|---:|---|---:|---|---|
| 1 | meets | A | 253 | 917,173 | 56,859 | 12 | 1 / 1 / 0 | 19,710 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 1 | meets | B | 371 | 1,062,241 | 67,336 | 13 | 1 / 1 / 1 | 36,989 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 2 | defect | A | 256 | 818,677 | 67,132 | 10 | 1 / 2 / 0 | 36,948 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 2 | defect | B | 215 | 647,921 | 47,517 | 9 | 1 / 1 / 1 | 10,482 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 3 | meets | A | 263 | 678,670 | 56,258 | 9 | 1 / 3 / 0 | 16,591 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 3 | meets | B | 222 | 516,297 | 52,342 | 7 | 1 / 1 / 1 | 16,026 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 4 | defect | A | 176 | 765,147 | 79,468 | 9 | 1 / 2 / 0 | 56,488 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| 4 | defect | B | 257 | 796,803 | 64,689 | 10 | 2 / 2 / 1 | 35,536 | right | correct (2/2 pass on good, 2/2 fail on defect) |
| median | | A | 254.5 | 791,912 | 61,995 | 9.5 | | | | 4 of 4 correct |
| median | | B | 239.5 | 722,362 | 58,515 | 9.5 | | | | 4 of 4 correct |

Tasks: 1 a click opens the panel; 2 a second click closes it; 3 Enter opens it; 4 each row's copy button names its own row. False passes: 0. False fails: 0. Flaky: 0. Timeouts: 0.

**What the calibration shows**

- **The apparatus works.** Fixtures, the freshness check, the listing, the oracle and the transcript measurements all ran for every session. My own reference checks pass on every good page and fail on every defective one.
- **No difference between the arms can be read from it.** Arm B was faster on two tasks and slower on two. One session per cell says nothing about a 25% effect.
- **The tasks are too easy.** Every session finished in about three to six minutes, and every check was correct. A campaign on these tasks would measure mostly fixed overhead: 90% to 94% of each session's total tokens were re-reads of cached context.
- **Arm B used what it was given.** All four arm B checks address controls by id, and each session ran the listing once. Arm A found its selectors by writing scratch checks that dump parts of the DOM to a file.
- **Caveats:** the VM was under heavy load from other work (load average about 35), so wall times are noisy. The oracle ran on Nas1, a different machine from the sessions, because new VM browsers were paused by the programme coordinator part-way through.

**Before any full campaign**

- Make the tasks harder: flows across several surfaces, a defect that needs state set up first, and a surface with many more controls than twelve.
- Use new tokens and wall time as the efficiency measures, not total tokens.
- Run one session at a time on a quiet machine, in random order, each in a fresh workspace and session; run the oracle on the same machine.
- Decide the model and the number of runs with the cost in view: these eight sessions used about 6.2 million tokens in total, of which about 0.5 million were new.
- The 40-session campaign was not run.

## 8. Decisions needed from Jared

**The goal:** agents that build and test Puppet Master's interfaces spend their time on the product, not on finding controls, reading megabyte trees, waiting on timers or testing the wrong build. **The gap:** Plans say what a test build shows an agent (ATS-067) but not how, and the toolkit has since shipped most of the how. **The gain:** less design work, and a measurable test before committing to it.

1. **May test builds use Slint's test server (its MCP or socket transport)?** Compiled out of every release, never configurable in production, fixture data only. *Recommended: yes.* Without it the desktop still has the operating system's accessibility tree and real input, which give ids, roles, values and actions, but no mock time, no headless run and no event log.
2. **May every build carry `ui_element_id` as the control's accessibility id?** It is how other toolkits name controls for automation, and it is never spoken or shown, so F3-635's rule that no internal id appears as text is kept (P25). *Recommended: yes.* The alternative is ids in test builds only. Then a tool reading a production build's accessibility tree cannot address a control by `ui_element_id` and falls back to role and name, which were ambiguous for 42 of 150 controls on the concept's Home, or to per-snapshot references. The id must never be copied into a spoken label, a description or hover text.
3. **What counts as "drives the visible production control"?** Options: input simulated by the toolkit and aimed by id; or input from the operating system. *Recommended:* toolkit-simulated for behaviour scenarios; operating-system input for the certification matrices' input cases and a sample of the rest. Accessibility actions alone never count.
4. **One injected clock in the shared interface model?** It is new canon. *Recommended: yes, for model-level and toolkit-level behaviour tests only.*
5. **Run the pilot in section 7 before any Plans edit?** *Recommended: yes.* It is 40 agent runs and one kit change on 12 controls.

## 9. How this was produced

- **Exact:** cloned at the pinned commit and read directly; its compiler was built and run here for the diagnostic, source-map and symbol samples. Its driver was not run: the claims about it come from its source and documents, pinned by line.
- **Plans and current tooling:** six read-only Muse Ember workers at maximum effort, one per owner area. Their quotes were checked mechanically against the files (between 75% and 97% verbatim per worker; counts are in the measurements file); every Plans passage this report relies on was then checked again at its line (73 of 73).
- **Slint:** read at three pinned commits; a probe app built and driven on 1.17.1 and 1.18.1; in the correction pass, an adapter and seven focused checks on 1.18.1.
- **Concept page:** a measurement probe on the committed page, run twice; four freshness cases; eight calibration sessions of the pilot with an independent oracle.
- **Review:** two blind fact-checks by a second model (Sol 6.1 high) found seven real problems in the first version, all fixed, and a third recheck came back clean. The correction pass that followed, from another agent's review, has not been reviewed again. The two larger reviews in the standing review order (Sol 6.1 max, then Astra max) were not run: nothing here changes canon, and they belong with the Plans edits if those go ahead.
- **Code in this folder:** `probe/` holds experiment code. The repository's rule puts experiment code outside the repository; it is here because the reviewing agent asked for reviewable code on the branch. It can be removed before this report lands.
- **Not done:** no Leptos, Kotlin or Swift code was run; no Slint window was read through the operating system's accessibility tree; the test server was not re-run in the correction pass (its saved replies were re-projected); the web-clock and mobile API statements come from vendor documentation, not from a run here; the 40-session campaign was not run.
