# What was run here, and what it showed

All runs on the VM (Ubuntu, Quadro P1000), 2026-11-10 UTC. Raw outputs are on the evidence share; [`EVIDENCE-INDEX.md`](EVIDENCE-INDEX.md) lists each by path and SHA-256. Probe code is in `/mnt/Cursor/PM-Experiments/exact-agent-tooling-20261110/`.

Token figures are estimates at 4 bytes per token unless a tool states its own number.

## M1. How large is each way of telling an agent what is on the concept's Home?

**Run:** `browser-check run tree-size.check.mjs` on the committed `Concepts/PMConcept7.html` (33,761,359 bytes), 1920×1080, Home at rest, default look, one GPU browser. Passed in 29.3 s. Raw: `pm7/tree-size.json`, `pm7/compact-controls.txt`, `pm7/aria-snapshot.yaml`.

| What the agent would read | Size | About |
|---|---:|---:|
| Chrome's full accessibility tree (`Accessibility.getFullAXTree`) | 1,110,796 bytes, 3,265 nodes | 278,000 tokens |
| Playwright's aria snapshot of the page body | 15,047 bytes, 371 lines | 3,800 tokens |
| Compact listing: every interactive control that is in view and on top | 5,704 bytes, 150 lines | 1,400 tokens |
| The same, Activity bar only | 397 bytes, 12 controls | 100 tokens |
| The same, main content only | 1,047 bytes, 36 controls | 260 tokens |
| One full screenshot | 395,544 bytes PNG | 2,600 tokens (the tool guide's figure) |

**Addressing, among the 150 reachable controls:**

| Property | Count |
|---|---:|
| Has a DOM `id` | 28 |
| Carries a `cmd.*` or `ui.*` id in an attribute | 2 |
| Carries a `data-action` verb | 32 |
| Has no accessible name | 0 |
| Shares its role and name with at least one other control | 42 |

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

**What it shows:** a scoped compact listing is two to three orders of magnitude smaller than the full tree and smaller than one screenshot. Names alone cannot address the page: 42 controls are ambiguous by role and name.

**Limits:** one screen, one state, one look. The listing was written for this probe; it is not a kit helper. The whole document has 1,869 interactive elements; only the 150 in view and on top were listed.

## M2. Slint's embedded MCP server on a 12-control page

**Probe:** a `SettingsPage` window with two buttons, three text fields, two switches, two checkboxes, a slider, a combo box and a toggle button, each with an element id. Built with `SLINT_EMIT_DEBUG_INFO=1 cargo build --features slint/mcp`, run with `SLINT_MCP_PORT=<port> SLINT_BACKEND=headless`, driven with `curl`. Raw: `slint/v1.17.1/`, `slint/v1.18.1/`.

| Measure | Slint 1.17.1 | Slint 1.18.1 |
|---|---:|---:|
| Build with the feature | 1 min 45 s | 1 min 11 s |
| Tools offered | 14 | 18 |
| Tool list, sent once per session | 10,347 bytes | 14,583 bytes |
| Usage instructions, sent once per session | 4,100 characters | 5,217 characters |
| `get_element_tree`, whole window | 67,218 bytes, 140 elements | 66,828 bytes, 140 elements |
| Bytes per element | 480 | 477 |
| Elements carrying an id | 110 | 110 |
| Projection to interactive controls only | 660 bytes, 12 lines | 660 bytes, 12 lines |
| `find_elements_by_id` then `get_element_properties` | 475 bytes | 475 bytes |
| `click_element` round trip | 79 ms | 75 ms |
| `take_screenshot`, no display, software renderer | 45,209 bytes PNG, 429 ms | 45,354 bytes PNG, 482 ms |

The projection, complete:

```
Button [SettingsPage::btn-github-connect] "Connect"
Button [SettingsPage::btn-github-disconnect] "Disconnect"
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
| Real time for the whole test body | 28 ms | 28 ms |
| Result | pass | pass |

**What it shows:** an animation can be stepped exactly, with no waiting and no timing flake.

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

## M6. Checks on the evidence itself

| Check | Result |
|---|---|
| Worker quotes of 40 characters or more found verbatim in the files they cite | A 144 of 149 (97%); B 52 of 56 (93%); C 29 of 31 (94%); D 48 of 53 (91%); E 92 of 103 (89%); F 24 of 32 (75%). Misses were paraphrases, quotes with an ellipsis, or the worker's own words in quotation marks. |
| Plans and tooling passages this report relies on, checked at their lines | 72 of 72 (`plans-citation-check.txt`) |
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
