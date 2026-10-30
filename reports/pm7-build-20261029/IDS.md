# PM7 shared identities — 2026-10-29

Owner: `pm7-plans`; source branch `t3/plans/pm7-plans-canon`, allocation checked at `dddfe5a763`. Canon follows Jared’s confirmed and revised decisions of 2026-10-30 in the decision packet; no PM7 card remains pending. Each change retains the decision IDs below. GUI lanes may use these names now; send additional names to `pm7-plans` and `pm7-build`.

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
| DR-079 | One shared menu sprout owner; closes duplicate implementations | L8 B, Jared 2026-10-30 |
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

Pip parts affect chat and onboarding only (S9). Brand, app icon, tray, loader and notification faces always use the kit. Agent, helper and Activity row primitives remain Pip even under Plain. The joined PM_PIP_PARTS registry has 25 stable IDs, 24 default-on parts and four admitted presets; counts/defaults/labels are pinned in companions.

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
| `ui.activity_detail.pin` | G1 B, Jared 2026-10-30: view-local boolean pinned, default false; pinned survives thread switches and follows new-thread data, unpinned closes on switch. No saved layout/Settings/runtime write. |
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
| Activity Detail Pin | `chat.activity.pin` → `ui.activity_detail.pin` (G1 B) |
| Chat Processes | `chat.activity.processes`, `chat.activity.processes.stop_all` |
| Quit | `work.quit.open`, `work.quit.keep_running`, `work.quit.stop_selected`, `work.quit.select_target`, `work.quit.confirm`, `work.quit.cancel` |
| Pip editor | `pip.editor.parts`, `pip.editor.preset`, `pip.editor.open`, `pip.editor.close`, `pip.editor.replay`, `pip.entry.settings`, `pip.entry.wand`, `pip.entry.titlebar` |
| Status words row | `statusbar.words` |

Repeated rows carry stable work/project IDs; these binding IDs identify control families, never array positions. No binding for the decorative title-bar mark or loader. Runtime implementation may expose corresponding data attributes, but binding IDs remain this census's identities.

## Glyph, kit, loader and projection names

- **`processes`**: new console-framed prompt glyph. **`robot`**: existing category glyph, redrawn with lit antenna. Agents ≤16 px/category surfaces use robot; each individual agent is Pip (X1).
- **`PMLogo` / `PMLogo.kit`**: the one drawing kit, head module at `src/logo/pm-logo.js`. Product uses `pip`, never the monogram. Tier is chosen from logical target size consistently across DPR.
- **`PM_PIP_LOADER`**: confirmed shared loader owner (html/mount/busy/refresh/motion/hold/held/clock/stats); context variants `swing`, `think`, `hop`; common opt-in `data-pip-loader`, decorative drawing with busy semantics on host. Code uses pml-ld, data-pip-px, data-pml-run and data-pml-redraw with PMLogo.MOTION/period/clock; no per-surface loader implementation.
- **`PM_WORK`**: joined shared OperationalAwareness/ObservableWork projection API; PM7_WORK_UI owns its visible platform panel/Stop/Quit/System status adapters. ProcessFacts stays subordinate; server resource samples carry server/environment identity.
- **Pip parts registry**: PM_PIP_PARTS / PM_PIP_PARTS_STORE is the only option/default/preset table and Settings adapter; PM_PIP_EDITOR open/popup/close/replay is the single editor. Stable IDs/def/lowercase preset IDs map to canon IDs/default_enabled/Full–Quiet–Still–Plain; Settings stores labels.
- **Resources tab glyph**: reuse the admitted **`gauge`** in the live catalog. Do not add a third category glyph just for this tab.

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
| unsaved | `change-modified` | Unsaved changes in active-Project Home buffers; layout autosaves |

Faces never manufacture runtime state. Typed owner status wins over a decorative expression. Keep all **22** catalog keys: waiting, blocked, failed, warning, offline, recovering, reviewing, working, waiting-dep, pending, mixed, complete, paused, skipped, off, idle, info, change-added, change-modified, change-deleted, change-conflict, change-renamed. The existing `pip-done` tour word is unrelated to the mascot.

Project badge priority (B5): waiting > blocked > working > change-modified > idle. Tray (A3) aggregates every Project; waiting wins; paused applies when remaining work is paused. Never replace a stale feed with a healthy zero.

Part contract (lead adopted, 2026-10-29): `Plans/pip_parts.json`, 25 options, Full = 24 on (app-voice off). Binding rows = 477; Touch = 715 rows / 140 profiles; production wiring = 1269. All projects is local `ui.project_switcher.all_projects`, not the rail-only `cmd.panel.switch`.

Review completion allocation: **G-031** owns the durable PM7 help-entry records (Pip, Project box, Processes, Question, Needs input, Completion delivery, Lost, ObservableWork, Operational Awareness, Backgrounded, Resources). Resources reuses the existing **gauge** glyph. A5 per-surface face tables and A3 complete tray precedence are now explicit in canon and the catalog; the original 22 status keys remain.

S2 storage ruling, 2026-10-30: `general.visual.pip-parts` options/default and new Settings writes use the part LABELS from PM_PIP_PARTS (for example Sheet hosts). The 25 stable IDs and internal preset arrays remain in pip_parts.json with the one-to-one label map; compatibility reads may accept IDs.

Jared’s decision answers, 2026-10-30: all packet recommendations are confirmed except X3 B, A2 B, L8 B, clarified O2 A/O6, O12 B, G1 B and SND1 B. Canon uses eyes through every NieR band, an always-on tray, one menu sprout owner, concept-faithful bounded motion with implementation technique open, silent look hover with click selection, last-block Creating wait (Reduced Motion instant), restored view-local Activity Pin, and sound-tool numbers with listening later in the product. Step4 remains the later merged-GUI name alignment.

Step4 System status: ui.system_status.open / ui.system_status.close (view-local); statusbar.system_status, existing work.open_system_status, system_status.close, system_status.service.open_settings. Service links reuse ui.settings.route.open for code.editing.lsp-server-catalog, system.mcp.server-list or web.index.enable; no write or new production command. Code-source anchors in the bindings remain concept-only evidence. PM6_SPROUT is the shared menu lifecycle (DR-079); PMLogo.MOTION is the family motion token row. B5 says Unsaved changes for dirty active-Project Home buffers, never autosaved layout.

Step4 L8 B review-fix names (integration 4c49e10567): PM6_SPROUT.open(el, afterOpen, anchor, opts), close(el, done, opts), morph(el, from, to, opts); shared origin/shown/instant/fade inputs per DR-079. A4 A Friendly notification classes are .pmn-tile-pip and .pmn-kind; decorative, no binding added.

Step4 final GUI e9b15abc64: PM7_WORK_UI.list / agentGroup / agentSummary supply rail and Home Agents. New binding families chat.work_dock.process_open (cmd.chat.processes.open, optional exact work_id) and chat.work_dock.agent_review (ordinary local Subagents selection, no action ID) map work-dock-review in activity-panel.js. There are 51 source-anchored PM7 families. Resources Time uses ui.work_panel.sort / startedAt and a 2 s visible-only sampler. Pip sound tooling is sound_render.mjs --pip-only, sound_catalog.py --pip, sound_board.py --pip / --pip-page; separate pip_sound_* tools are retired.

Companion fix cycle 1 (D7/D8/D13/G4/D10): work.open_owner is local ui.work_panel.select. New bindings: work.open_thread (cmd.chat.open_thread), work.open_surface (ui.work_panel.open_surface), work.copy_command (ui.work_panel.copy_command), work.open_port (cmd.browser.open_workspace_preview), work.cancel_scheduled (cmd.chat.schedule_message.cancel), work.rerun (cmd.terminal.rerun), work.stop_all.scope (ui.work_quit.select). Two new local actions only; no new command. Totals: 477 bindings / 58 PM7 source families, 715 Touch rows / 137 profiles, 1269 production rows. Working chat agents use public working rendered as dots; reviewing/recovering stay think.

Final direct fixes (Astra r2 N1/N2; D7/D8/D13, 2026-10-30): reused-owner Touch profiles are `TCP-PM7-BROWSER-OPEN`, `TCP-PM7-TERMINAL-RERUN`, and `TCP-PM7-SCHEDULE-CANCEL`; each is scoped to its one existing command. Teacher/help uses the `settings_teacher_help` consumer and Work detail uses `work_detail`, with exact Settings or invoking Work return/focus respectively. Current totals: 715 rows / 140 profiles; bindings and commands unchanged. Browser/Terminal catalog body validation remains uncompiled; identity-only fences do not certify native effects.

Final GUI f99ad183d2 (F3-3): `PM_BUSY()` may return `drag` after cover reasons; `PM_BUSY.drag()` and `PM_BUSY.idle(fn, timeout)` name the existing shared drag guard/admission. `pm-idle` remains the existing event. F3-4 changes checkbox paint only. No new command, binding, setting or event family. G2 squeeze and F3-1 toast placement are decided by Jared’s follow-up below.

G2 / F3-1, Jared follow-ups 2026-10-30 (mail 1030125602-d03d): widen first; at the column limit dock/squeeze if at least 360 px of messages remain, else full-height cover, never the small panel. Notices hang tight below the title bar at the bell; the first card uses the theme-menu gap on every page and may cover controls/chat head. Entering cards take no clicks; Reduced Motion settles instantly. The old --pmn-clear / control-clearance placement and G2 deviation are superseded. Lead ruling 1030131044-4c44 retains the existing --pmn-push while the shared inbox is open, placing the stage under that bell-anchored inbox; this exception is listed for Jared and is not quoted as his new words. No command, binding, setting, event, Touch profile or persisted geometry name is added. `PresentationPolicy` is a static fixture descriptor only.

F3-1 exact final anchor, GUI 70b30f482f (lead mail 1030133128-afab): with inbox closed, first card top matches the theme menu’s resting top: #themeMenuWrap bottom + MENU_GAP (6 px), not title-bar bottom + 6 px. Negative stage drop is permitted. Without a drawn selector, the prior title-bar/nonnegative-drop fallback remains. --pmn-clear is gone; --pmn-push and the entering-card click guard remain. No new ID or persisted field.

F3-1/F3-5/F3-6 final GUI5abe285507 (lead mail1030142505-c4b0): pmn-entering is set before card mount and, together with pmn-leaving, suppresses card clicks on every page including Usage; a late arrival callback never reactivates exit. The existing --pmn-push reads resting/destination layout height after PM6_SPROUT.open, on reopen and content/resize updates, and clears on close. These are existing rendering states/owners, not new commands, controls, settings or persisted fields.


## QA round 2 — Q22 and Q11 (Jared, 2026-10-30)

Canonical source: `78af23f393d730766d7a354cea57bdcf34505bea`. Q22 owner decision: **DL-257**, amending SSYS-043, F3-425/082/598, DR-056 and the existing onboarding/appearance owners.

| Name | Current contract |
| --- | --- |
| Family order | `basic`, `friendly`, `glass`, `retro`, `nier` |
| NieR variants | `nier-dark`, `nier-light`; Theme inventory has ten ordered Dark/Light choices |
| Settings | `general.visual.theme` selects NieR; `general.visual.theme-mode` keeps Light/Dark/Auto. `general.visual.nier-mode` is migration-only and removed from the inventory: 1010 physical rows. |
| Retained Adjust | `general.visual.nier-parts` (29) and `general.visual.nier-background` (8 scenes); visible for NieR themes. Label **Adjust NieR**, title menu **Adjust NieR…**. |
| Retired checkbox bindings | `shell.nier.mode`, `tour.nier.mode`, `onboarding.nier.mode`: non_dispatch tombstones with no action/setting/production entry |
| Family bindings | Existing `shell.theme.family`; census adapters `tour.theme.family`, `onboarding.theme.family`. Total 479 census records. |
| Commands/actions | Existing Settings preview/apply pair. Onboarding `ui.onboarding.choose_look` / intent `choose_look`; `preview_nier` and independent `nier_mode` retire. No command added. |
| Editor | Existing `nier.editor.*` and `ui.settings.nier_editor.*`; `nier.editor.turn_on` reads **Use the NieR theme**, a family pick. |
| Runtime names | `PMLogo.look()` → `nier-<scheme>`; Basic CSS paint with `data-theme='basic-<scheme>'` and derived `html[data-o55-nier='on']`; no independent override |
| Transition | Enter NieR with Reboot part → shared Reboot; all other entries/exits and NieR Light/Dark changes → standard cover |
| Q11 | DL-253/L1/DR-077/078: live rows animate on the shared clock in all ten looks; visibility/drag/hidden/Reduced Motion holds; NieR working agent uses Diamond/fallback, never animated Pip. |

Glyph ids and the 22 pinned status keys are unchanged. Q11 changes presentation eligibility, with no new state, command, event, key or clock. GUI QA2 names/coverage are reconciled after the lead’s head.
