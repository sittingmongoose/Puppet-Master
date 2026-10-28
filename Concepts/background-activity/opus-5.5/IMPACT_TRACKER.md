# Background activity: what it changes in Plans, DRY, wiring and commands

A running list of every canon document and machine-readable artifact the chat's Processes domain and the status bar's
agents and processes items will touch. Nothing here is edited yet: the decisions in `README.md` come first, then the
owner prose, then the companions (CLAUDE.md "How to compile a ledger": prose first, companions second). Line numbers
are at `main` 478bac5d64 (2026-10-26).

Every decision is made (Jared, 2026-10-27 and 2026-10-28; the table is in `README.md`). The concept is approved, so
every row below is **ready**, except P6, which is deferred. In short:

- **D1, name:** "Processes" everywhere.
- **D4, when the icon shows:** only while a process runs or needs input.
- **D5, status bar:** two items, agents with questions and processes with needs input. Numbers by default, Words by a
  setting. The orchestrator status chip folds into the agents item.
- **D6, panel:** Agents and Processes tabs; pop out to a window. No Side by side, no Task manager, no panel tab yet.
- **D14, glyphs:** the processes console and the lit robot are approved.
- **D2, D3, D7 to D13:** as recommended.

§9 adds the chat changes from the same review (wider chat, Activity Detail, Glass plates, the context ring, Demo
Studio). `HANDOFF.md` is the build brief for both.

## 1. What already exists and must be reused (DRY)

Both features are projections. Neither owns runtime truth, and neither may start a registry of its own.

| The surfaces need | Canon that already has it | Where |
|---|---|---|
| One record per piece of running work: state, wait reason, parent and children, title, owner, activity time | `ObservableWorkRecord` (`work_state` includes `queued, starting, running, waiting, backgrounded, stalled, …, completed, failed, cancelled, recovery-required`) | `Plans/Shared_Integration_Runtime.md` §8.2 and the Full-Thread addendum (L815–840); `Plans/full_thread_runtime_contracts.schema.json` `#/$defs/ObservableWorkRecord` |
| One cross-surface view of operations, agents, ports, provider processes, freshness (`current, partial, stale, unavailable, conflicted`) | `OperationalAwarenessProjection` | SIR §9.2 (L243); same schema file |
| Agent and subagent rows, lifecycle words, ordering, mirror-stale strip | Agents side panel | `Plans/FinalGUISpec.md` F3-452 (L32948), F3-477 (L34310) |
| Status marks and words | One glyph registry, 22 marks | F3-658 (L49169), F3-585 (L41620), F3-619 (L43588), `Plans/glyph_catalog.json`; DR-051 |
| Terminal identity, Open in Terminal, Rerun | Terminal Session, Dev Session, ACD-502 | `Plans/Glossary.md` L133–135; `Plans/assistant-chat-design.md` §13.3 (L1616), ACD-500 (L27552), ACD-502 (L27869); SMPFS-180 (L12401), SMPFS-182 (L12695) |
| Process birth, termination, crash recovery | Executor process sources | `Plans/Executor_Protocol.md` §7.3 (L488), EP-043 (L3138), EP-119 (L7641) |
| Orphan reaping | CLI providers and Goal runtime | `Plans/CLI_Bridged_Providers.md` CBP-024 (L1561), CBP-026 (L1851); `Plans/Goal_Runtime_System.md` GRS-036 (L4702) |
| Scheduled runs | Schedule Manager, `ScheduledMessageSnapshot`, `scheduled_dispatch.*` | `Plans/Scheduling_and_Quota_Resume.md` (L5, L534, L554, L853) |
| Needs-you items next to the composer | Composer dock: needs you, your move, live runs, next scheduled | `Plans/assistant-chat-design.md` ACD-476 (L26758) |
| Stop in the composer | Stop holds the queue | ACD-471 (L26276) |
| Agents widget on Home | Agents board (all, working, needs, waiting, done) | `Plans/Widget_System.md` WS-030 (L1782) |
| Overlay stacking | One overlay root above the status bar | `Plans/DRY_Rules.md` DR-067 (L3637) |

## 2. Owner documents to amend

| # | Document and unit | Change | Status |
|---|---|---|---|
| P1 | `FinalGUISpec.md` F3-533 (L37743) | Activity domains become ten: add **Processes** after Subagents. Its presence rule differs from the other nine: it shows only while a process runs or needs input, and stays while its hover card or Activity Detail view is open. A scheduled or finished process alone does not keep it. Keep compaction tiers, hover dwell (F3-590) and detail routing. Acceptance line "all nine domains" changes. | ready (D1, D4 decided) |
| P2 | `FinalGUISpec.md` F3-448 (L32722) and §3.1/§3.2 (L1711–1742) | Add two status bar items in their own group between the project folder and source control: **agents** (count, then questions) and **processes** (count, then needs input). Each opens the panel at its own tab. Zero reads "No agents" or "No processes"; a stale feed adds one "stale" item to the group. Add their hover tag words (F3-523, DL-228). Update the ASCII diagram and the zone row. Numbers by default (glyph and number pairs; the words move to the hover tag), Words by the setting in §6. F3-448's orchestrator status chip folds into the agents item; the Orchestrator becomes a group in the Agents tab. | ready |
| P3 | `FinalGUISpec.md`, new unit beside F3-452/F3-477 | The agents and processes panel, with an Agents tab and a Processes tab. Agents lead with **Questions**; an agent with a question is listed there once and counted in its surface's group. Processes lead with **Needs input**; each running process sits under the agent that started it. Then come Scheduled, Finished this session, and System services (read only). An agent row links to its processes. The unit also covers ordering (F3-477's), the stale strip, Stop all, popping out to a window and opening as a panel tab. It mirrors OperationalAwareness and the subagent registry and owns no state. Tabs only: no Side by side or Task manager view (D6, D12). | ready |
| P4 | `FinalGUISpec.md` F3-452/F3-477 | Say how the Agents rail panel and the pop-out divide the work (deep management against glance and triage), and that both use one row anatomy and vocabulary. Possibly widen the Agents panel past the Orchestrator to the Planning Wizard, PRD Builder and Scout. | ready (D7) |
| P5 | `FinalGUISpec.md` F3-585 / F3-658 and `glyph_catalog.json` `surface_words` | Words for the `waiting` mark: an agent waiting on you **Needs you**, and the status bar counts it as a **question**. A process waiting on you **Needs input**, the terminal map's own word for `st-waiting`. Process words: Running, Needs input, Stopping, Stopped, Lost, Scheduled, Done, Failed (exit N). "Lost" maps to `warning`; "Stopping" needs a decision (`pending` with a word, or a new mark). | ready |
| P6 | `FinalGUISpec.md` F3-630 (L44560) | An Agents and processes tab kind beside Terminal, Problems, Output and Ports. | deferred (D6: later) |
| P7 | `assistant-chat-design.md`, new ACD unit after ACD-476 | The Processes domain covers:<br>• what it lists: processes, scripts, servers, watchers, browser sessions and scheduled runs this thread or its subagents started;<br>• what it does not: subagents stay in Subagents;<br>• when it shows (P1);<br>• the hover card and the Activity Detail views (Needs input first);<br>• Stop all in this thread;<br>• the footer line saying composer Stop does not stop these processes;<br>• its glyph lit through the bar's tone tables like the other nine. | ready (D2, D3) |
| P8 | `assistant-chat-design.md` ACD-476 (L26758) | A process waiting on a prompt is a "needs you" dock item; a live process counts toward "live runs". One attention surface, two views. | ready |
| P9 | `assistant-chat-design.md` ACD-471 (L26276) | State plainly: Stop ends the reply and holds the queue; it does not stop background processes. | ready |
| P10 | `assistant-chat-design.md` §13.3 (L1616), ACD-502 | Process rows reuse Open in Terminal and Rerun in Terminal exactly as the command card does. | ready |
| P11 | `Shared_Integration_Runtime.md` §8.2, addendum, §9.2 | Add the Processes domain and the status bar items to the projection's consumers. Add process facts to the work record or a subordinate record (see §4). Completion delivery and "the reply waits for it" as typed fields. | ready (D9) |
| P12 | `Executor_Protocol.md` §7.3, EP-043 | Stop semantics: the whole process group, SIGTERM then SIGKILL after a grace period, identity by (pid, start time), a sticky Stopping until the exit is observed, idempotent stop of an ended item. Prompt detection (a process waiting on stdin with a question). | ready (D8, D13) |
| P13 | `Run_Modes.md` RM-019/RM-020 (L835–841), GRS-036, CBP-026 | After a restart: reconcile, mark what vanished as Lost, tell each owning agent once. Idle unload never kills live processes silently. | ready |
| P14 | `Scheduling_and_Quota_Resume.md` | Scheduled runs appear in both surfaces; Cancel reuses the Schedule Manager's command. | ready |
| P15 | `Server_System.md` / quit lifecycle | What quitting does to running work, with the server keeping server-owned work (SIR §8.2). | ready (D10) |
| P16 | `Run_Graph_View.md` L81 | Retire or redirect the "Background Runs card" to the agents and processes projection. | ready |
| P17 | `Widget_System.md` WS-030 | The Agents board reads the same projection; add processes if the board should show them. | ready (D7) |
| P18 | Notifications: F3-447, F3-453, F3-460, F3-461 | "Notify me" completions go through the alert store; one notice per item, coalesced; needs-you only for the OS badge. | ready |
| P19 | `Glossary.md` | Add: Processes (the chat domain and the status bar item), Question and Needs input (the two needs-you counts), Completion delivery, Lost (work). Add the missing ObservableWork and Operational Awareness entries. Disambiguate "background" (the `backgrounded` work state) from "task" (To-Dos). | ready (D1 decided) |
| P20 | `Decision_Log.md` | One DL entry per decision D1–D14 (Jared, 2026-10-27 and 2026-10-28). | ready |
| P21 | Glyph registry: `Concepts/glyph-system/opus-5.5/src/registry/families/` (`terminal.js`, `objects.js`), `PMGlyphCatalog.html`, `Plans/glyph_catalog.json`, F3-619 / F3-658 glyph lists | A new `processes` glyph (the terminal's `>_` in a console frame; the cursor types in, the prompt nudges). A redraw of `robot` with a lit antenna that blinks, so "agent" keeps one drawing everywhere (DR-051). Both are drawn in the neon grammar and coloured only by status. The concept defines them in `src/rw-glyphs.js` with the same `PMG.def` records. Rebuild the catalog after the family files change. While working, both glyphs loop wherever they stand for live work (the chat's Activity bar, the status bar items, the panel's tab heads); list rows keep their marks still. | ready (D14) |
| P22 | Chat Activity bar inking: `Concepts/chat-assistant-concepts/5.6 Pro/activity-bar.js` (`DOMAINS`, `barTone`, `TONE_*`), `pm56-activity-bar.css` (per-domain `data-hover-domain` rules) | Add `processes` as a domain so the chat itself writes `--ab-ink-processes` and its siblings and draws its backlight and loop. The concept mirrors those rules in `rw.css` because it cannot edit the chat. | ready |

## 3. DRY rules

| Rule | How these features meet it |
|---|---|
| DR-037, DR-040 (L2483): consumers render owner state, never a parallel runtime | Both surfaces read OperationalAwareness; Stop and Restart call the owners' commands |
| DR-041 (L2526): one command identity, one sole handler | One `cmd.work.*` family for Stop, Restart, Send input and Completion delivery, used by both surfaces (see §5) |
| DR-051 (L2982): one icon registry, one status set | The concept draws every mark through PMConcept7's `PMG` and adds its two glyphs with `PMG.def` (P21). Agents reuse the one agent glyph, redrawn, rather than a second one |
| DR-067 (L3637): one overlay root above the status bar | The pop-out, its dialogs and the floating window use it |
| DR-069 (L3828): no side stripes, no emoji, no pill labels | States are a mark and a word; counts are plain numbers; the strips are full borders |
| F3-452 negative constraint: the Agents panel mirrors the subagent registry | The pop-out mirrors it too |
| **New rule, proposed** | "Agents and processes have one projection. The chat's Processes domain, the status bar's agents and processes items and their panel, the Agents panel and the Agents board are filters of it; none keeps its own list, count or status." |

## 4. Schemas and fields

`ObservableWorkRecord` has no process facts. Two shapes; **(a)** is recommended, since it keeps process facts off
non-process work:

- **(a)** A subordinate `ProcessFacts` record referenced from `subject_refs`, owned by the Executor or the terminal owner:
  `pid`, `pid_start_time`, `process_group`, `command`, `cwd`, `ports[]`, `exit_code`, `ended_reason`
  (`exited | stopped_by_user | stopped_by_agent | stopped_with_owner | lost`), `output_ref` (head and tail capped,
  with a count of omitted lines), `stoppable`, `restartable`.
- **(b)** The same fields directly on the work record. Simpler, but it puts process facts on non-process work.

Fields both options need on the work record: `completion_delivery = agent | user | quiet`, `holds_reply` (boolean),
`input_request {prompt, detected_at, quick_answers[]}`, `stopped_by`, and the `owner_thread_id` filter key.

Files: `Plans/full_thread_runtime_contracts.schema.json` and its fixtures, `Plans/shared_runtime_contracts.schema.json`
if the legacy shape is touched, and `Plans/runtime_artifact_subagent_lineage.schema.json` for owner links.

## 5. Commands (proposed IDs, catalog format of `Plans/UI_Command_Catalog.md` §2.0)

| Command ID | Label | command_kind | Owner | Notes |
|---|---|---|---|---|
| `cmd.chat.processes.open` | Open Processes | `navigation_wrapper` | assistant-chat-design (new ACD) | Like `cmd.chat.todos.open` (L12650). Source surfaces: `activity_bar`, `activity_detail` |
| `cmd.agents_and_processes.show` | Show Agents And Processes | `navigation_wrapper` | FinalGUISpec (new unit) | Argument `tab = agents \| processes`; source surface: `status_bar` (two controls, one command) |
| `cmd.agents_and_processes.pop_out` | Pop Out Agents And Processes | `navigation_wrapper` | FinalGUISpec | Floating window; D6 |
| `cmd.agents_and_processes.open_panel_tab` | Open Agents And Processes As A Panel Tab | `navigation_wrapper` | FinalGUISpec F3-630 | Deferred with P6 (D6: later) |
| `cmd.work.stop` | Stop | owner command | SIR ObservableWork, delegating to the Executor, terminal owner, Schedule Manager or Orchestrator | One identity for one item, a thread, or everything (scope argument); DR-041 |
| `cmd.work.restart` | Restart | owner command | Executor / terminal owner | Servers, watchers, databases |
| `cmd.work.send_input` | Answer | owner command | Terminal owner | Quick answers from a detected prompt; D13 |
| `cmd.work.set_completion_delivery` | When It Ends | owner command | SIR | Tell the agent, Notify me, Quiet |
| `cmd.work.clear_finished` | Clear Finished | owner command or `ui.*` local | SIR retention | Decide whether clearing is projection retention or view-local (UIW-018) |
| reuse `cmd.terminal.open` (UCC-201) | Open in Terminal | | ACD-502 | No new command |
| reuse `cmd.agents.open_thread` / `cmd.agents.open_node` (L9954–9956) | Open the owner | | F3-452 | No new command |
| `ui.*` local intents | Filter, sort, expand, select | view-local | UIW-018 (L1237) | Declared, no catalog row |

## 6. Wiring and bindings

For every control above that is not view-local:

1. A row in `Plans/UI_Command_Catalog.md` and its UCC PlanUnit.
2. An entry in `Plans/Wiring_Matrix.production.json` keyed by `ui_element_id`, with `ui_location`, `ui_command_id`,
   `handler_location`, `expected_event_types`, `acceptance_checks`, `evidence_required`, `state_selector`,
   `disabled_reason_projection`, `effect_contract`, `accessibility_contract`, `test_evidence`,
   `event_test_requirements` (model: `catalog.agents_show`), and a WM unit in `Plans/Wiring_Matrix.md`.
3. `Plans/pm7_control_bindings.json`: the two status bar items are the first `statusbar.*` controls
   (`statusbar.agents`, `statusbar.processes`; WM-093); the chat's Processes icon follows the chat's existing
   bindings.
4. `Plans/touch_closure.json`: a row and a profile per control (DR-040, WM-046).
5. `Plans/event_family_registry.json` and payload schemas only for genuinely new events: a completion delivered to
   an agent, and an input request detected. Stop, Restart and state changes reuse the owners' events.
6. `Plans/settings_inventory.json` (owner F3-441): default completion delivery per kind (D9), what quitting does (D10),
   how long finished rows stay, and the status bar's words (D5): `general.interaction.status-bar-words`, a toggle,
   default `false` (Numbers), label "Show words in the status bar's agent and process counts", scope global, tier
   simple, in Settings › Window & panels right after `general.interaction.activity-bar-labels`, which it mirrors in
   shape. The Processes icon's visibility is a rule, not a setting (D4).
7. Validators: `scripts/pm-plans-verify.py validate-wiring-matrix`, `scripts/pm-touch-closure-verify.py`,
   `scripts/pm-shard-plans.py --check`, `scripts/pm-plan-index.py validate`.

## 7. Concept build ownership (for the final build, not this concept)

| Surface | Source that publishes it |
|---|---|
| `#pm7GlobalStatusBar` | `Concepts/onboarding/opus-5.5/base/script/pm7-t23-shell-adjustments.js` `installStatusBar()` (L883–933), CSS `base/style/pm7-t32-final.css` (L8–83), hover words `base/script/pm-hover-tags-js.js` (L214); published by `Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` |
| Other status bar layers | NieR `src/settings/kit.d/20-nier-world.js` L187, Demo Studio `src/js/92-demo-studio-ui.js` L443, home-redesign `src/panels/js/50-pageshell.js`, liquid-glass `src/glass.js` L3148 |
| Chat Activity bar and Activity Detail | `Concepts/chat-assistant-concepts/5.6 Pro/app.js` `ACTIVITY_ORDER` (L1790), `activityScope` (L1837), `activityDefs` (L1933); `activity-bar.js` `CARDS` (L530); `activity-panel.js` `DOMAINS/LABELS/ICONS` (L43–48); ported into PMConcept7 by `pm7-port/tools/chat56_layer.py` |

## 8. Gates to expect at landing

Editing owner prose makes governance stale for the edited documents (Spec Lock hashes, evidence hashes, readiness,
the migration snapshot). That is expected and is reported to Jared as a reseal request; a reseal is its own task.

## 9. The chat round (Jared, 2026-10-28)

The same review asked for changes to the chat in general. They land with this feature's build, so their Plans impact
is tracked here too. Line numbers are at `main` 478bac5d64; re-read each before editing.

| # | Change | Concept source today | Plans to amend |
|---|---|---|---|
| C1 | **The chat can get wider.** The message area is clamped to 400–760 px. | `Concepts/home-redesign/src/panels/js/10-model.js` (`CHAT_W_MIN/MAX`, L44–48), `44-narrow.js` (`LADDER.chatMin/chatMax`, L17), `46-chat.js` (drag clamp, L122 and L147) | The chat column width range wherever FinalGUISpec and the Home workspace units state 760 (search `760` and `chat_column`); `Plans/pm7_control_bindings.json` and the wiring row for `cmd.workspace_layout.resize_surface { surface: 'chat' }` if they carry the bounds |
| C2 | **Activity Detail opens only at full size.** Clicking an Activity-bar icon opens the docked panel at once; the small transient panel goes. | `Concepts/chat-assistant-concepts/5.6 Pro/app.js`: `activityPinnedInLayout()` (L492–496), `renderActivityPanel(transient)` (L2099–2103, and L982), `open-activity`, `pin-activity` and `unpin-activity` (L4674–4679), Esc (L4807) | `assistant-chat-design.md` Activity Detail units (search `Activity Detail`, `pin-activity`, `transient`); F3-533 detail routing; the pin control's row in `Plans/UI_Command_Catalog.md` and `Plans/Wiring_Matrix.production.json` (retired or changed) |
| C3 | **Pinning works, and so does opening the big view.** Likely cause: in PMConcept7 `activityPinnedInLayout()` pins only when the chat frame, less the History gutter, is at least 540 + 280 px, but the chat is clamped to 760 px, so the big view almost never fits and the panel falls back to the small one. C1 and C2 remove the cause; reproduce it first. | as C1 and C2; `pm7-port/js/00-host.js` `PM56_HOST.width()` (L359) | Covered by C2's units |
| C4 | **Glass plates as solid as the persona and model menus.** Activity Detail (hover card and panel), the History panel and the Activity bar's hover cards (the attachment card too) take the menus' plate. | `pm7-port/css/20-controls.css` L88–101 (`.overlay-menu` and the floating plates on `--pmw-pop`), `13-tokens-glass.css` L36–55; the hover cards in `activity-bar.css` (`.ab-card`) and `activity-panel.js` | DR-067's overlay rule and the Glass material rules in FinalGUISpec (search `--pmw-pop`, `menu tint`, `Glass transparency`): one plate token for every floating surface |
| C5 | **The context ring draws clean in Friendly and Glass.** It is broken up and artifacted there. | the ring's renderer in `app.js` (search `ringPct`) and `context.js` L257–275; the Friendly and Glass token sheets `12-tokens-friendly.css`, `13-tokens-glass.css` | Only if the fix changes how the ring is specified (FinalGUISpec or ACD context-meter unit) |
| C6 | **Demo Studio gets this concept's scenarios**, the quit dialog included: Busy, No asks, Quiet, Many, Stale feed, After restart, Quit. | `Concepts/onboarding/opus-5.5/src/js/91-demo-studio.js`, `92-demo-studio-ui.js`, `src/copy.d/75-demo-studio.json`, `DEMO_STUDIO.md` | None (Demo Studio is concept scaffolding), but `DEMO_STUDIO.md` gains the entries |
| C7 | **Settings, commands, wiring and DRY for all of the above**, with this file's §2–§6 | | §2–§6 here, plus any new `ui.*` intents for the wider chat |

