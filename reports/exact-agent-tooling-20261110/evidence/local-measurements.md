# What was run here, and what it showed

Runs of 2026-11-10 UTC. M1 to M7 ran on the VM (Ubuntu, Quadro P1000); the correction pass (M1's re-run, M8, the oracle in M10) ran on Nas1 (UHD 630), and M9 and the M10 sessions on the VM. Small raw outputs are in [`raw/`](raw/) beside this file; everything is on the evidence share, and [`EVIDENCE-INDEX.md`](EVIDENCE-INDEX.md) lists each file by path and SHA-256. The code is in [`../probe/`](../probe/).

**Sizes are UTF-8 bytes** unless a line says characters. The first version of this file reported some string lengths as bytes; they are corrected below, and the differences were under 0.3%.

Token figures are estimates at 4 bytes per token unless a tool states its own number.

## M1. How large is each way of telling an agent what is on the concept's Home?

**Run:** `browser-check run tree-size.check.mjs` on the committed `Concepts/PMConcept7.html` (33,761,359 bytes, SHA-256 `70194b42…8910`), 1920×1080, Home at rest, default look, one GPU browser. Run twice: first on the VM, then again on Nas1 after the script was changed to count UTF-8 bytes and to keep full names. The table is the second run. The page is live, so the full tree differs slightly between runs (3,265 nodes the first time, 3,274 the second). Raw: `raw/pm7-tree-size.json`, `raw/pm7-compact-controls.txt`.

| What the agent would read | Size | About |
|---|---:|---:|
| Chrome's full accessibility tree (`Accessibility.getFullAXTree`), as JSON | 1,119,665 bytes, 3,274 nodes | 280,000 tokens |
| Playwright's aria snapshot of the page body | 15,028 bytes, 371 lines | 3,800 tokens |
| Compact listing: every interactive control that is in view and on top | 5,704 bytes, 150 lines | 1,400 tokens |
| The same, Activity bar only | 397 bytes, 12 controls | 100 tokens |
| The same, main content only | 1,049 bytes, 36 controls | 260 tokens |
| One full screenshot | 391,894 bytes PNG | 2,600 tokens (the tool guide's figure) |

**Addressing, among the 150 reachable controls:**

| Property | Count |
|---|---:|
| Has a DOM `id` | 28 |
| Carries a `cmd.*` or `ui.*` id in an attribute | 2 |
| Carries a `data-action` verb | 32 |
| Has no name | 0 |
| Shares its role and name with at least one other control | 42 |

**What "name" means here:** a name taken from the DOM in this order: `aria-label`, `title`, visible text, value, placeholder. It is not the browser's computed accessible name. The listing prints at most 48 characters of it; the duplicate count is 42 whether the full name or the first 48 characters are compared.

Sample lines from the listing:

```
button #projectMenuBtn [ui.project_switcher.open] "Project: tastebook, 3 items need you" expanded=false
tab #tab-dashboard "Home" selected
treeitem "docker-compose.yml · YAML"
button "Copy relative path"
button "Open in terminal"
treeitem "Dockerfile · Docker file"
button "Copy relative path"
button "Open in terminal"
```

**What it shows:** a scoped compact listing is two to three orders of magnitude smaller than the full tree and smaller than one screenshot. A role and a DOM name do not tell 42 of the 150 controls apart.

**Limits:** one screen, one state, one look. The listing was written for this probe; it is not a kit helper. The whole document has about 1,880 interactive elements; only the 150 in view and on top were listed. Token figures are estimates at 4 bytes per token.

## M2. Slint's embedded MCP server on a 12-control page

**Probe:** a `SettingsPage` window with two buttons, three text fields, two switches, two checkboxes, a slider, a combo box and a toggle button, each with an element id. Built with `SLINT_EMIT_DEBUG_INFO=1 cargo build --features slint/mcp`, run with `SLINT_MCP_PORT=<port> SLINT_BACKEND=headless`, driven with `curl`. Raw: `slint/v1.17.1/`, `slint/v1.18.1/`.

| Measure | Slint 1.17.1 | Slint 1.18.1 |
|---|---:|---:|
| Build with the feature | 1 min 45 s | 1 min 11 s |
| Tools offered | 14 | 18 |
| Tool list, sent once per session | 10,351 bytes | 14,587 bytes |
| Usage instructions, sent once per session | 4,128 bytes | 5,245 bytes |
| `get_element_tree`, whole window | 67,218 bytes, 140 elements | 66,828 bytes, 140 elements |
| Bytes per element | 480 | 477 |
| Elements carrying an id | 110 | 110 |
| Projection to interactive controls only (`project_tree.py`) | 669 bytes, 12 lines | 669 bytes, 12 lines |
| `find_elements_by_id` then `get_element_properties` | 475 bytes | 475 bytes |
| `click_element` round trip | 79 ms | 75 ms |
| `take_screenshot`, no display, software renderer | 45,209 bytes PNG, 429 ms | 45,354 bytes PNG, 482 ms |

The projection, complete:

```
Button [SettingsPage::btn-github-connect] "Connect"
Button [SettingsPage::btn-github-disconnect] "Disconnect" disabled
TextInput [SettingsPage::input-github-host] ""
TextInput [SettingsPage::input-default-branch] "" value="main"
Switch [SettingsPage::sw-draft-prs] "" checked
Switch [SettingsPage::sw-sign-commits] ""
Checkbox [SettingsPage::cb-auto-fetch] "Every" checked
Slider [SettingsPage::sl-fetch-minutes] "" value="15"
Combobox [SettingsPage::combo-merge-method] "" value="Squash"
Checkbox [SettingsPage::cb-review-reminders] "Remind me"
TextInput [SettingsPage::input-protected] "" value="main, release/*"
Button [SettingsPage::btn-toggle-panel] "Toggle panel"
```

**Sequence that worked on both versions:** list windows; get the root element; get the tree; find `SettingsPage::btn-github-connect` by id; read role `Button`, label `Connect`, enabled; click it; read the status text element by id and see `last: cmd.github.connect`; read that Disconnect became enabled; take a screenshot.

**What it shows:**

- The toolkit gives ids, roles, values, geometry, simulated input and screenshots in a test build with no code in the application.
- The raw tree is not compact: 140 elements for 12 controls, because every internal rectangle of every widget is listed. A projection is needed.
- **Corrected in this pass:** the first projection lost the `disabled` marker on Disconnect. The reply is protobuf JSON, which omits false values, and the inline code only marked a control whose `accessibleEnabled` was present and false. The projection is now a script, `probe/slint-test-server/project_tree.py`, which prints `disabled` when an interactive control has no enabled field. Over this transport "disabled" and "not stated" cannot be told apart; the in-process API can (M8).
- **Not offered by the test server in 1.18.1:** `accessible-id` (M7) and any control of the clock. Its 18 tools include none that sets or steps time.
- The element id is `Component::element-id`, straight from the `.slint` source, so the id is also a pointer to the declaration.
- Controls whose label sits in a neighbouring text element (the switches here) have an empty accessible label. Only the id identifies them.

**Limits:** a toy page; the software renderer, not Skia; not Puppet Master's Skia additions; simulated input goes through Slint's event dispatch, not the operating system. Performance, focus, text selection, scroll position and dispatched commands are not in this layer.

## M3. Mock time on Slint's testing backend

**Run:** `cargo test --test mock_time` with `i-slint-backend-testing` at the matching version. Raw: `slint/mock-time-test-1.17.1.log`, `slint/mock-time-test-1.18.1.log`.

A panel animates `x` from 0 to 300 over 300 ms, linear. The test clicks the toggle by id, calls `mock_elapsed_time(150 ms)` twice and reads `x` each time.

| | 1.17.1 | 1.18.1 |
|---|---|---|
| `x` after the first step | 150 | 150 |
| `x` after the second step | 300 | 300 |
| Real time for the test body, start-up excluded | 28 ms | 28 ms |
| Result | pass | pass |

**What it shows:** an animation can be stepped exactly, with no waiting. The 28 ms is measured after the app is created and shown; with start-up the whole test took about 0.15 s. Two runs are not a flake rate.

**Limit:** this backend renders no pixels (the Slint README says so). It proves behaviour and state, never appearance or frame timing.

## M4. A build without the feature has no test server

**Run:** the same source built with plain `cargo build`, started with `SLINT_MCP_PORT=<port> SLINT_BACKEND=headless`. Run twice; the second run's commands and output are kept. Raw: `slint/r2/m4-absence-check.txt`, `slint/v1.18.1-plain-build.log`.

| Check | With `--features slint/mcp` | Without |
|---|---|---|
| String `slint-mcp-embedded` in the binary | 1 | 0 |
| String `SLINT_MCP_PORT` in the binary | 2 | 0 |
| Listener on the port | yes | none (connection refused) |
| Start-up message | `Slint MCP server listening on http://127.0.0.1:…/mcp` | `Could not load rendering backend headless, fallback to default` |
| Element id strings in the binary | 1 | 1 |
| `accessible-id` strings in the binary | 1 | 1 |

**What it shows:** the feature gate removes the server. It also shows the second switch: both builds were compiled with `SLINT_EMIT_DEBUG_INFO=1`, so both carry element ids. A release check has to cover both.

**Limit:** a debug build of a toy. The release check for Puppet Master has to be written against real release binaries.

## M5. Exact's compiler output, run locally

**Run:** Exact's `contract` compiler built from the pinned commit (1 min 55 s) and run on the README's todo app and a copy with two seeded mistakes. Raw: `exact/`.

Human form, both mistakes in one run:

```
broken.contract:16:5 [type-assign] `draft` is `string`, cannot assign `number`
broken.contract:34:24 [lower-unknown-attr] `text` has no attribute `size`; `size` is spelled `font-size` here, the web's name (LLP 1017 §8.1)
```

Machine form, 396 bytes:

```json
[{"col":5,"end_col":10,"file":"broken.contract","id":"type-assign","line":16,"message":"`draft` is `string`, cannot assign `number`","related":[],"severity":"error"},
 {"col":24,"end_col":28,"file":"broken.contract","id":"lower-unknown-attr","line":34,"message":"`text` has no attribute `size`; `size` is spelled `font-size` here, the web's name (LLP 1017 §8.1)","related":[],"severity":"error"}]
```

Source map for the correct app: 8,535 bytes for 17 nodes; each node has file, line, column range, component, and for each style value where it was written. `symbols --name add` returns the action's definition with the state it writes (`"writes":["draft","changed"]`) and each place it is referenced.

**What it shows:** the diagnostic shape is small, complete and stable-id keyed, and the message says what to write instead.

**Not run:** Exact's driver, its web host, its tests and its stale-build refusal. Those claims rest on its source, pinned by line in [`exact-sources.md`](exact-sources.md).

## M7. A dotted wiring id carried as Slint's `accessible-id`

Added after the review. **Run:** two controls in the probe were given `accessible-id: "btn.github.connect"` and `accessible-id: "settings.github.draft_prs"`; built on Slint 1.18.1; one in-process test and one test-server run. Raw: `slint/r2/`.

| Check | Result |
|---|---|
| The `.slint` source compiles with dotted and underscored strings as `accessible-id` | yes |
| In-process: `ElementHandle::accessible_id()` on the two controls | `btn.github.connect`, `settings.github.draft_prs` |
| In-process: a control with no `accessible-id` | none |
| Test server (MCP), `get_element_properties` on the same button | no id field other than `typeNamesAndIds`; the dotted id does not occur anywhere in the tree response |
| Mock-time test in the same run | pass, 150 then 300, 20 ms real |

**What it shows:** `ui_element_id` can be written into the interface as it is, with no renaming rule. In-process tests read it. The 1.18.1 test server does not send it, so a driver over that server would address by `Component::element-id` or need the field added upstream.

**Not tested:** reading the id from outside the process through the operating system's accessibility tree. The Slint source sets it as the AccessKit author id (see `exact-sources.md`, Slint table), and the headless backend used here has no accessibility adapter.

## M8. Focused checks on the adapter, Slint 1.18.1

**Run:** `cargo test --features testkit --test focused -- --nocapture --test-threads=1` in `probe/slint-probe/`, on Nas1, with `slint = "=1.18.1"` (software renderer feature only) and `i-slint-backend-testing = "=1.18.1"` as an optional dependency. Seven tests, seven pass, 0.71 s. Raw: `raw/slint-focused-checks-1.18.1.log`, `raw/slint-dependency-tree.txt`.

| Check | Observed |
|---|---|
| c1 canonical id | `tap("btn.github.connect")` clicked the control whose source id is `SettingsPage::btn-github-connect`; receipt line `{"op":"tap","id":"btn.github.connect","input":"toolkit-pointer","mock_ms":50,"at":[335,110]}`. `btn.github.conect` gave `NoMatch`. A tap on the disabled Disconnect gave `Disabled` and sent nothing. |
| c1 handle count | The adapter's own walk found 1 handle for the id; Slint's `ElementQuery::from_root(..).match_descendants()` with a predicate returned 7 for the same button. |
| c2 duplicates | `tap("dup.save")` gave `Ambiguous` naming both buttons (at 16,566 and 364,566); neither was clicked. `files.row.copy_path` without a key gave `NoMatch`. |
| c3 reordering | `files.row.copy_path#k-docker` copied `k-docker` before and after the rows were reversed and a row added; the row moved from y 732 to 788; the row now at the first row's old position is `k-new`. Four buttons share the label "Copy relative path". |
| c4 pointer on mock time | Tap advanced mock time by 50 ms and opened the panel; `x` read 150 after 150 ms more and 300 after 150 ms more; 350 ms of mock time in 25 ms of real time for the body, 75 ms with start-up. |
| c4 stock `single_click()` | Pending after the press, still pending with no clock change, ready after 50 ms of mock time; the button was clicked once. |
| c5 covered control | With a cover over the window, the pointer tap raised the cover's count to 1 and left the button's at 0; the accessibility action then raised the button's to 1. Receipt inputs: `toolkit-pointer` and `semantic-action`. |
| c6 listing | 15 lines, 1,065 bytes; Disconnect ends in `disabled` before Connect is clicked and not after. |
| c7 build identity | The running binary reported a 64-character digest of its sources, compiled in by `build.rs`. |
| Dependency tree | Without `--features testkit`, `i-slint-backend-testing` does not appear in `cargo tree`; with it, once. |

**Limits:** a toy page on the testing backend, which draws no pixels. One run per check. With this reduced feature set a plain `cargo build` of the probe fails for an unrelated reason (an image-loading function the test crate happens to switch on), so the absence of the test layer is shown by the dependency tree here and by the binary check in M4. Slint 1.17.1 was not re-tested.

## M9. Freshness cases on the concept page

**Run:** `probe/pilot/fresh/run.sh` on the VM: four `browser-check` runs with the pilot's kit, no agent. The kit reads the build id from a `<meta>` tag in the loaded document after every load and at the end of each test, compares it with the id recorded when the page was built, and writes a receipt. Raw: `raw/freshness-results.tsv`.

| Case | Expected exit | Got | Receipt `fresh` | First failure line |
|---|---:|---:|---|---|
| 1 right build | 0 | 0 | true | none |
| 2 the record names one build, the file is another | 1 | 1 | false | opened the expected build: expected 47af3367aca7, loaded 48125a4eecc4 |
| 3 file replaced on disk, then reload | 1 | 1 | false | reloaded the expected build: expected 47af3367aca7, loaded 48125a4eecc4 |
| 4 raw navigation to another build, helper bypassed | 1 | 1 | false | the loaded page is the build this run expects: … 2 of 4 loads did not match |

**Two identities, kept apart:** the receipt's `app` part holds the expected build id, the page file's hash at start, and every load with the id found in the document. The oracle adds a separate `test_identity`: hashes of the check, the config and the kit files, and the tool version (`probe/pilot/oracle.py`).

**Limits:** the build id is a digest of the build's inputs written into the page by the fixture maker; `build.py` does not write one today. A page with no stamp reads as a mismatch. Nothing here compares a build with its sources.

## M10. Pilot calibration: eight sessions

**Run:** four tasks, each once per arm, as section 7 of the report describes. Sessions: Opus 5.5 at high effort, on the VM, two at a time (one task's two arms together), each in its own directory with its own copy of the page and kit. Measured from each session's transcript by `probe/pilot/measure.py`. Oracle: `probe/pilot/oracle.py` on Nas1, each delivered check run twice on the page without the defect and twice on the page with it. The delivered checks are in `probe/pilot/session-checks/`. Raw: `raw/calibration.json`, `raw/oracle-console.log`.

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

**Reading it:** total tokens count every re-read of cached context, so they follow the number of turns; new tokens are cache writes plus output. "Read back" is the characters of tool results the agent received.

**Limits:** one session per cell. Wall time includes model latency and a VM under a load average of about 35 from other work. The oracle ran on a different machine from the sessions. Two sessions ended a turn while their own check run was still going and were resumed by the harness; their wall time includes that wait.

## M6. Checks on the evidence itself

| Check | Result |
|---|---|
| Worker quotes of 40 characters or more found verbatim in the files they cite | A 144 of 149 (97%); B 52 of 56 (93%); C 29 of 31 (94%); D 48 of 53 (91%); E 92 of 103 (89%); F 24 of 32 (75%). Misses were paraphrases, quotes with an ellipsis, or the worker's own words in quotation marks. |
| Plans and tooling passages this report relies on, checked at their lines | 73 of 73 (`plans-citation-check.txt`) |
| Third recheck, of the last two fixes only | Clean (`reviews/REVIEW-r3-sol-high.md`) |
| Recheck of the fixes by the same model, blind | Five confirmed fixed; two new findings in the added text, fixed; all 72 citations and all 55 evidence hashes recomputed and matching (`reviews/REVIEW-r2-sol-high.md`) |
| Blind review by a second model (Sol 6.1 high) | Five real findings, fixed; it sampled 27 Exact links and 30 Plans rows, all passed, and recomputed all 50 evidence hashes (`reviews/REVIEW-r1-sol-high.md`) |
| Exact passages this report relies on, checked at their lines | 52 of 52 (`exact-citation-check.txt`) |

## Baseline already on record in this repository

These are Puppet Master's own numbers, read from the repository and the tool guides. They were not re-measured.

| Number | What it measures | Source |
|---|---|---|
| 3/69 on the P1000, 69/69 on Nas1 | The onboarding scenarios on one unchanged page, with the old time-based waits | `reports/onboarding-harness-waits-20261011/NOTES.md` L109 |
| 69/69 and 7/7, three repetitions on each machine; 456 cases, 3,234 assertions | The same suite after waits on conditions replaced fixed waits | same file, L104-L113 |
| 170 ms and 900 ms | The only fixed sleeps left, which are the behaviour under test | same file, L38-L41 |
| About 2,600 tokens | One full 1080p frame shown to an agent | `browser-check guide` |
| 45–60 KB, 12–15 thousand tokens | One full compact `agent-desktop` snapshot of an Electron or GTK app; a `find` is about 300 bytes | `browser-check guide desktop` |
| 20 s to 60 min | Run time of single kit checks | `Concepts/pm7-tools/browser-check/README.md` |
| None | Tokens, turns or retries per agent test run; flake rate across the kit | Not recorded anywhere found |
