# PM7 shared identities — 2026-10-29

Owner: `pm7-plans`; source branch `t3/plans/pm7-plans-canon`, allocation checked at `dddfe5a763`. Canon follows the decision packet, including recommendations pending Jared's answers. Each change retains the decision IDs below. GUI lanes may use these names now; send additional names to `pm7-plans` and `pm7-build`.

## PlanUnit reservations

| ID | Holds | Work / decisions |
|---|---|---|
| DL-235 | Pip brand, icon assets, tray and notifications | W1; X1, X3, A1–A5, S8 |
| DL-236 | Project box A and switching | W2; B1–B7 |
| DL-237 | Universal loader and motion | W5; X2, L1–L8 |
| DL-238 | Full onboarding with Pip | W3; O1–O12 |
| DL-239 | Chat Pip and parts editor | W4; PC1–PC5, S1–S9 |
| DL-240 | D1: Processes naming | W6 |
| DL-241 | D2: thread process membership | W6 |
| DL-242 | D3: By state and By owner | W6 |
| DL-243 | D4: conditional domain presence | W6 |
| DL-244 | D5: status items and Numbers/Words | W6 |
| DL-245 | D6: panel tabs, pop out; amended by G4/G8 | W6 |
| DL-246 | D7: one projection, glance and deep views | W6 |
| DL-247 | D8: process-group stop, 3 s grace | W6 |
| DL-248 | D9: completion delivery | W6 |
| DL-249 | D10: quit asks; server keeps running | W6 |
| DL-250 | D11: read-only system services | W6 |
| DL-251 | D12: Resources, all servers/environments, open-only sampling; amended by G4/G8 | W6 |
| DL-252 | D13: safe yes/no input; terminal fallback | W6 |
| DL-253 | D14: processes and robot category glyphs; X1 | W6 |
| DL-254 | Chat round: full Activity Detail, widths, Glass plates, clean ring | W7; G1–G3, G9 |
| DL-255 | Work contracts, view-local clearing, deferred surfaces | W6/W7; G5–G7, G10 |
| DL-256 | Demo Studio coverage and verification boundary | W8/W9; SND1, LAND1 |
| F3-660 | One Pip brand and drawing kit | W1/W4; X1, X3, A1–A5 |
| F3-661 | Project box A, keyboard and same-frame chip | W2; B1–B7 |
| F3-662 | Universal loader | W5; X2, L1–L8 |
| F3-663 | Full onboarding Pip: worlds, rig, faces, tips, sound | W3; O1–O12 |
| F3-664 | Platform Agents/Processes/Resources panel | W6; D1–D14, G4, G8–G10 |
| F3-665 | Quit with running work | W6; D10 |
| DR-076 | One brand mark / one Pip kit | W1/W3/W4 |
| DR-077 | One loading indicator | W5 |
| DR-078 | One agents/processes projection and resource owner | W6 |
| SSYS-056 | Pip parts, presets, scope and editor | W3/W4; S1–S9 |
| SSYS-057 | Status bar Numbers/Words | W6; D5 |
| ACD-505 | Processes domain and shared work attention | W6 |
| ACD-506 | Full Activity Detail and wider chat | W7; G1–G3 |
| ACD-507 | Pip sheets, lists, Orbit and interactions | W4; PC1–PC5 |
| CS-105 / UCC-209 | Project box dispatch and local actions | W2 |
| CS-106 / UCC-210 | Work command contracts and navigation | W6 |
| UCC-211 | Pip editor local actions and settings transaction hosts | W4 |
| WM-097 / UIW-045 | PM7 project, Pip and work control closure | W1–W9 |
| SIR-054 | ProcessFacts, completion, input and resource projection | W6; G4, G7 |

## Setting rows

| Key | Label / value | Scope / placement |
|---|---|---|
| `general.visual.pip-parts` | Pip parts; multiselect. Presets Full, Quiet, Still, Plain. No Classic. | Stored per Project; `scope: ["global"]` is applicability metadata, like NieR. App & Input → Theme & colors after NieR rows. |
| `general.interaction.status-bar-words` | Show words in the status bar's agent and process counts; boolean, false = Numbers, true = Words | Window & panels, beside `general.interaction.activity-bar-labels`; global applicability, ordinary Project storage. |

Inventory becomes **1011** (1009 + these two). No Pip on/off, loader-style, voice, music, fixed chat-width-cap or icon-visibility row. Setup voice, app voice and setup music are Pip parts. D9 defaults are typed owner defaults; D10 always asks; finished rows last this session. They introduce no additional Settings rows in this build.

Pip parts affect chat and onboarding only (S9). Brand, app icon, tray, loader and notification faces always use the kit. Agent, helper and Activity row primitives remain Pip even under Plain. Final part IDs come from found's shared registry; count and preset pins will follow it before integration.

## Commands, local actions and keys

| Identity | Contract |
|---|---|
| `cmd.project.switch_active_tab` | Row pick; stable `project_id`; existing workspace tab is switched. |
| `cmd.project.open_in_new_workspace_tab` | Alternate row pick; stable `project_id`; Ctrl/Cmd+Enter on a row. |
| `ui.project_switcher.open` / `.close` / `.all_projects` | Local menu visibility; Ctrl+Shift+P opens; Esc closes. No command dispatch merely to open; .all_projects focuses existing route tab_id projects. |
| `cmd.chat.processes.open` | Open this thread's Processes Activity Detail. |
| `cmd.agents_and_processes.show` | `tab: agents | processes | resources`; status bar opens the matching tab. |
| `cmd.agents_and_processes.pop_out` | Move the same panel view into a window. |
| `cmd.work.stop` | `scope: item | thread | platform`; Stop all is this command with a wider scope and a reviewed target list. No second stop-all command. |
| `cmd.work.restart` | Restart an eligible process through its owner. |
| `cmd.work.send_input` | Answer a current plain yes/no prompt; safe answer first. Other input uses Terminal. |
| `cmd.work.set_completion_delivery` | `agent | user | quiet`; owner writes the per-item delivery policy. |
| `cmd.work.clear_finished` | G6: view-local hiding only, no record deletion; retained navigation_wrapper identity. |
| `cmd.work.quit` | D10: reviewed choice `keep_running | stop_selected`; server owns the work. |
| `ui.work_panel.close` / `.select_tab` / `.filter` / `.sort` / `.expand` / `.select` | Declared view-local panel actions, no runtime write. |
| `ui.work_quit.select` / `.cancel` | Local quit choice/target draft and cancel; confirm dispatches `cmd.work.quit`. |
| `ui.settings.pip_editor.open` / `.close` / `.replay` | Local editor actions; replay = Play: the team works. |
| `cmd.settings.transaction.preview` / `.apply` | All parts/preset and Numbers/Words edits, including hosted Settings rows. |

Reuse `cmd.terminal.open`, existing terminal rerun routing, `cmd.agents.open_thread`, `cmd.agents.open_node`, and the Schedule Manager cancel command. No Home panel tab command in this build (G10); no new work-panel shortcut (G10). All projects uses existing Projects page navigation.

## pm7_control_bindings IDs

| Surface | IDs |
|---|---|
| Project box | `shell.project.open`, `shell.project.close`, `shell.project.pick`, `shell.project.open_new_workspace_tab`, `shell.project.all`, `shell.project.shortcut` |
| Status bar | `statusbar.agents`, `statusbar.processes` (no CPU/RAM item) |
| Work panel | `work.panel.agents`, `work.panel.processes`, `work.panel.resources`, `work.panel.close`, `work.panel.pop_out`, `work.panel.filter`, `work.panel.sort`, `work.panel.expand`, `work.panel.select` |
| Work actions | `work.stop`, `work.stop_all.thread`, `work.stop_all.platform`, `work.restart`, `work.send_input`, `work.answer_terminal`, `work.completion_delivery`, `work.clear_finished`, `work.open_terminal`, `work.open_owner`, `work.open_system_status` |
| Chat Processes | `chat.activity.processes`, `chat.activity.processes.stop_all` |
| Quit | `work.quit.open`, `work.quit.keep_running`, `work.quit.stop_selected`, `work.quit.select_target`, `work.quit.confirm`, `work.quit.cancel` |
| Pip editor | `pip.editor.parts`, `pip.editor.preset`, `pip.editor.open`, `pip.editor.close`, `pip.editor.replay`, `pip.entry.settings`, `pip.entry.wand`, `pip.entry.titlebar` |
| Status words row | `statusbar.words` |

Repeated rows carry stable work/project IDs; these binding IDs identify control families, never array positions. No binding for the decorative title-bar mark or loader. Runtime implementation may expose corresponding data attributes, but binding IDs remain this census's identities.

## Glyph, kit, loader and projection names

- **`processes`**: new console-framed prompt glyph. **`robot`**: existing category glyph, redrawn with lit antenna. Agents ≤16 px/category surfaces use robot; each individual agent is Pip (X1).
- **`PMLogo` / `PMLogo.kit`**: the one drawing kit, head module at `src/logo/pm-logo.js`. Product uses `pip`, never the monogram. Tier is chosen from logical target size consistently across DPR.
- **`PM_PIP_LOADER`**: proposed shared loader owner; context variants `swing`, `think`, `hop`; common opt-in `data-pip-loader`, decorative drawing with busy semantics on host. Found may refine its API and report it; no per-surface loader implementation.
- **`PM_WORK`**: proposed shared OperationalAwareness/ObservableWork projection API; found may refine the API and report it. ProcessFacts stays subordinate; server resource samples carry server/environment identity.
- **Pip parts registry**: found owns its final exported name and option IDs. It is the only option/default/preset table; Plans will mirror its admitted contract.
- **Resources tab glyph**: reuse **`gauge`** if present in the live catalog; otherwise **`server`**. Do not add a third category glyph just for this tab.

## A5 mood → existing status key

| Mood / state | Key | Meaning / limit |
|---|---|---|
| idle | `idle` | Ready, no live work |
| think / working | `working` | Live work; wait drawing is the loader, row state remains st-working |
| happy / done | `complete` | Completed; tray celebration lasts about 10 s |
| alert / wonder / needs you | `waiting` | A question or input is required; wins aggregation |
| error / oops | `failed` | Owner-reported failure; illustrative oops alone never invents a failure |
| sleep / paused | `paused` | Paused when owner says paused; dependency waits map to waiting-dep, queued to pending |
| watch | `idle` | Choice preview/gaze is decorative, not an attention item |
| wink | `complete` | Ready sign-off only, once; decorative elsewhere |
| blocked | `blocked` | Separate from waiting/needs you |
| stopping | `pending` | Show word Stopping; no new mark |
| stopped | `skipped` | Show word Stopped |
| lost | `warning` | Show word Lost; reconcile before asserting |
| scheduled | `pending` | Show word Scheduled |
| unsaved | `change-modified` | Project layout change, separate from run state |

Faces never manufacture runtime state. Typed owner status wins over a decorative expression. Keep all **22** catalog keys: waiting, blocked, failed, warning, offline, recovering, reviewing, working, waiting-dep, pending, mixed, complete, paused, skipped, off, idle, info, change-added, change-modified, change-deleted, change-conflict, change-renamed. The existing `pip-done` tour word is unrelated to the mascot.

Project badge priority (B5): waiting > blocked > working > change-modified > idle. Tray (A3) aggregates every Project; waiting wins; paused applies when remaining work is paused. Never replace a stale feed with a healthy zero.

Part contract (lead adopted, 2026-10-29): `Plans/pip_parts.json`, 25 options, Full = 24 on (app-voice off). Binding rows = 464; Touch = 707 rows / 137 profiles; production wiring = 1269. All projects is local `ui.project_switcher.all_projects`, not the rail-only `cmd.panel.switch`.
