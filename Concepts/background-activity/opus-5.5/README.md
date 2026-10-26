# Background activity (Opus 5.5)

Basic concepts for two surfaces that show what is running:

1. **The chat's Running domain**, scoped to one thread: a tenth Activity-bar icon, its hover card, and its view in
   Activity Detail. It lists the processes, scripts, servers, watchers, browser sessions and scheduled runs that the
   thread's agent or its subagents started, and what finished this session.
2. **Running work in the status bar**, scoped to the whole platform: one item with counts, and a pop-out listing every
   agent and subagent (Assistant threads, Orchestrator, Planning Wizard, PRD Builder, Scout), every process and
   scheduled run, and a read-only mirror of system services.

Both read one store (`src/rw-data.js`). In canon that store is the OperationalAwareness projection over ObservableWork;
see `IMPACT_TRACKER.md`. `RESEARCH.md` covers how Codex, Antigravity, OMP, VS Code, OpenHands, T3, Cursor, Qoder,
Claude and Devin do this.

## Pages

Open through the Concept Hub (`Concepts/StartConceptHub.command`): the pages fetch their layer over http.

| Page | Opens with |
|---|---|
| `index.html` | Both surfaces closed, and the lab |
| `thread.html` | The Running view open in Activity Detail, on a migration dry run that waits for an answer |
| `platform.html` | The status bar pop-out open |

Each page frames the published `PMConcept7.html` and injects `src/rw.css` and `src/rw-*.js` (`src/host.js`).
PMConcept7 is not edited. The chat's own classes and its `data-theme` attributes style the injected parts, so every
look applies.

## The lab

The panel at the top left switches:

- **Look**: Basic, Friendly, Retro, Glass, NieR; dark or light; Reduced Motion.
- **Scenario**: Busy (three things need you), No asks, Quiet, Many (40 more processes), Stale feed, After restart.
- **Thread view**: By state, By owner, List + output.
- **Status item**: Words (`16 agents · 10 processes · 3 need you`), Marks (icon and number pairs), One count.
- **Pop-out**: By surface, Needs you first (tabs by state), Task manager (sortable table, CPU and memory, inspector).
- **Domain icon**: Pulse, Terminal, Gauge, Layers.
- **Show Running even when nothing has run**, and **Quit…** for the quit dialog.

What works: hover and click the Running icon, expand rows, answer a prompt (No or Yes), switch When it ends, Stop
(Stopping, then Stopped, with children), Restart a server, Stop all with its list, Clear finished, open ports and owners
(as notices), pop out to a draggable window, sort the table. Times, output tails, progress and CPU update live.

## Decisions to talk through

Each has a recommendation. Their effect on Plans is in `IMPACT_TRACKER.md`.

| # | Question | Recommendation |
|---|---|---|
| D1 | Name | **Running** for the chat domain, **Running work** for the status item. "Background" collides with the `backgrounded` work state, "Tasks" with To-Dos, "Activity" with the Activity bar itself. |
| D2 | What the thread view lists | Processes, scripts, servers, watchers, browser sessions and scheduled runs, including those its subagents started. Subagents stay in Subagents; here they appear only as a process's owner, linked to their domain. |
| D3 | Thread view layout | **By state** (Needs you, Running, Scheduled, Finished this session). By owner is the fallback when many subagents run. |
| D4 | When the icon shows | While anything is running or scheduled, or finished this session. Not when nothing ever ran; a missing icon then means nothing is running. |
| D5 | Status item | **Words**, placed right after Ready. Merge F3-448's orchestrator status chip into it: the Orchestrator becomes a group in the pop-out. |
| D6 | Pop-out layout | **By surface** with an Everything / Needs you switch. Keep the task-manager table as a second view, not a separate surface. Pop out to a window: yes. Panel tab: later. |
| D7 | Agents panel and Home Agents board | One projection and one row anatomy. The pop-out is for a glance and triage; the Agents panel stays the deep view for lanes, queue and lineage. |
| D8 | Stopping | Composer Stop ends the reply only, and the panel says so. Stop per item; Stop all per thread and across the platform, each listing what it stops; stopping an agent stops its subagents and their processes; SIGTERM, then SIGKILL after 3 seconds, to the whole process group. |
| D9 | When it ends | Per item: **Tell the agent** (default for scripts, tests and builds an agent started), **Notify me** (default for servers, watchers and databases), **Quiet**. Never wake a thread the user stopped; coalesce notices. |
| D10 | Quitting | Ask. Default: keep everything running on the server (the window is only a client, SIR §8.2); the other choice stops everything, with a list you can untick. |
| D11 | System services | A read-only, collapsed group linking to System status. They are never stopped from here. |
| D12 | CPU and memory | Only in the task-manager view, sampled while it is open. |
| D13 | Answering prompts | Quick answers only for plain yes/no prompts, with the safe default first; anything else goes to Answer in Terminal. |

## Not in this concept

Narrow chat widths beyond what the chat's own compaction tiers do, the Home panel tab, the OS badge and notification
flows, keyboard shortcuts, and NieR's own readout styling for the new status item.
