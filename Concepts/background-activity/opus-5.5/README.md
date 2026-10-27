# Background activity (Opus 5.5)

Concepts for two surfaces that show what is running:

1. **The chat's Processes domain**, scoped to one thread: a tenth Activity-bar icon, its hover card, and its view in
   Activity Detail. It lists the processes, scripts, servers, watchers, browser sessions and scheduled runs that the
   thread's agent or its subagents started, and what finished this session. The icon is there only while a process
   runs.
2. **Agents and processes in the status bar**, scoped to the whole platform: two items in their own group, one for
   agents and their questions, one for processes and what needs input. Either opens one panel listing every agent and
   subagent (Assistant threads, Orchestrator, Planning Wizard, PRD Builder, Scout), every process and scheduled run,
   and a read-only mirror of system services.

Both read one store (`src/rw-data.js`). In canon that store is the OperationalAwareness projection over ObservableWork;
see `IMPACT_TRACKER.md`. `RESEARCH.md` covers how Codex, Antigravity, OMP, VS Code, OpenHands, T3, Cursor, Qoder,
Claude and Devin do this.

## Changes from Jared's review (2026-10-27)

| Feedback | What changed |
|---|---|
| When nothing is running, the chat's icon goes away | The icon shows only while a process runs or waits for input. If its hover card or view is open when the last one ends, it stays until that closes, so it never vanishes under the pointer. A scheduled or finished process alone does not keep it. |
| One word, not "processes" in the status bar and "Running" in the chat | **Processes** everywhere: the Activity-bar label, the Activity Detail tab, the hover card, the status bar and the panel's tab. "Running" is now only a state word on a row. |
| Use the status bar's processes symbol in the chat, in the neon look, and the agents symbol too | New glyphs drawn in the neon grammar through the registry's own `PMG.def` (`src/rw-glyphs.js`). Processes is the terminal's `>_` in a console frame, which carries the same weight as Goal and Subagents and stays distinct from the bare `>_` of a terminal tab. Agents is the robot with a lit antenna. Both are lit by status colour, halo and backlight exactly like the other domain icons, in every look. |
| Organise the status bar and keep agents' questions apart from processes | Two status-bar items in their own group, framed by the bar's dividers, between the project folder and the branch. Each has its own count and its own needs-you count: `16 agents · 2 questions` and `10 processes · 1 needs input`. The panel has an Agents tab that leads with Questions and a Processes tab that leads with Needs input. Each process sits under the agent that started it. |

## Pages

Open through the Concept Hub (`Concepts/StartConceptHub.command`): the pages fetch their layer over http.

| Page | Opens with |
|---|---|
| `index.html` | Both surfaces closed, and the lab |
| `thread.html` | The Processes view open in Activity Detail, on a migration dry run that needs input |
| `platform.html` | The status bar panel open on Agents |

Each page frames the published `PMConcept7.html` and injects `src/rw.css` and `src/rw-*.js` (`src/host.js`).
PMConcept7 is not edited. The chat's own classes and its `data-theme` attributes style the injected parts, so every
look applies.

## The lab

The panel at the top left switches:

- **Look**: Basic, Friendly, Retro, Glass, NieR; dark or light; Reduced Motion.
- **Scenario**: Busy (three things need you), No asks, Quiet (nothing running: the chat's icon is gone), Many (40 more
  processes), Stale feed, After restart.
- **Thread view**: By state, By owner, List + output.
- **Status bar**: Words (`16 agents · 2 questions`) or Numbers (glyph and number pairs, words on hover).
- **Panel**: Tabs, Side by side, Task manager (sortable table, CPU and memory, inspector).
- **Quit…** for the quit dialog.

What works:

- **In the chat:** hover and click Processes, expand a row, answer a prompt (No or Yes), switch When it ends.
- **Stopping:** Stop shows Stopping, then Stopped, and stops the item's children too. Stop all lists everything it
  will stop. Restart works on servers.
- **In the status bar:** click Agents or Processes to open the panel at that tab, and click again to close it.
- **In the panel:** "5 processes" under an agent jumps to that agent's processes. Clear finished works. The panel pops
  out to a draggable window, and the table sorts.
- **Notices only:** opening ports and owners shows a notice instead of navigating.
- **Live:** times, output, progress and CPU update as you watch.

## Decisions

Each has a recommendation; decided ones say so. Their effect on Plans is in `IMPACT_TRACKER.md`.

| # | Question | Status and recommendation |
|---|---|---|
| D1 | Name | **Decided:** Processes for the chat domain and the status bar's item. Agents stay agents. |
| D2 | What the thread view lists | Processes, scripts, servers, watchers, browser sessions and scheduled runs, including those its subagents started. Subagents stay in Subagents; here they appear only as a process's owner, linked to their domain. |
| D3 | Thread view layout | **By state** (Needs input, Running, Scheduled, Finished this session). By owner is the fallback when many subagents run. |
| D4 | When the chat's icon shows | **Decided:** only while a process runs or needs input; it stays while its card or view is open. |
| D5 | Status bar | **Decided:** two items in their own group, agents with questions and processes with needs input. Open: Words or Numbers (recommend Words); merge F3-448's orchestrator chip into the agents item, with the Orchestrator as a group in the panel (recommend yes). |
| D6 | Panel layout | **Tabs** (Agents, Processes), each leading with what waits on you. Side by side as a wide alternative; Task manager kept as a third view. Pop out to a window: yes. Panel tab: later. |
| D7 | Agents panel and Home Agents board | One projection and one row anatomy. The panel is for a glance and triage; the Agents rail panel stays the deep view for lanes, queue and lineage. |
| D8 | Stopping | Composer Stop ends the reply only, and the view says so. Stop per item; Stop all per thread and across the platform, each listing what it stops; stopping an agent stops its subagents and their processes; SIGTERM, then SIGKILL after 3 seconds, to the whole process group. |
| D9 | When it ends | Per item: **Tell the agent** (default for scripts, tests and builds an agent started), **Notify me** (default for servers, watchers and databases), **Quiet**. Never wake a thread the user stopped; coalesce notices. |
| D10 | Quitting | Ask. Default: keep everything running on the server (the window is only a client, SIR §8.2); the other choice stops everything, with a list you can untick. |
| D11 | System services | A read-only, collapsed group at the end of the Processes tab, linking to System status. They are never stopped from here. |
| D12 | CPU and memory | Only in the Task manager view, sampled while it is open. |
| D13 | Answering prompts | Quick answers only for plain yes/no prompts, with the safe default first; anything else goes to Answer in Terminal. |
| D14 | Glyphs | **To confirm:** Processes is `>_` in a console frame; agents is the robot with a lit antenna. In canon, a new `processes` glyph and a redraw of `robot`, so every surface that shows an agent changes with it. |

## Not in this concept

Narrow chat widths beyond what the chat's own compaction tiers do, the Home panel tab, the OS badge and notification
flows, keyboard shortcuts, and NieR's own readout styling for the new status items.
