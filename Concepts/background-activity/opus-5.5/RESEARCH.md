# Background activity: how other tools show running work

Research for the chat's Running domain and the status bar's Running work. Done 2026-10-26 by Opus 5.5 with eight
research agents. Each agent read source code where it is public and docs, changelogs and issue trackers where it is
not.

## Evidence

The full notes, with file:line citations into the source each agent read, are in
`/mnt/Cursor/PuppetMaster-Evidence/background-activity-research-20261026/notes/`:

| Note | SHA-256 | What was read |
|---|---|---|
| `codex.md` | `de7c894fbe71fa463c24672ba9d54571867204d76390b1dd6e8e2143bb6844d7` | openai/codex at `rust-v0.164.0` (6aaac69); Codex desktop through its app-server protocol, docs and issues |
| `antigravity.md` | `ab561d61a9826c58a58802a7d9a06d490ae4133bf4885bf6b1e8654c2f9d82dd` | `agy` (closed Go binary: symbols and embedded prompts), the ACP SDK, Antigravity docs and app; google-gemini/gemini-cli at 363a131 |
| `omp.md` | `a25c7d67943094f10d307fb7cd874156e8c895ce2d9c9aeab7ab463253d598d9` | can1357/oh-my-pi at `v18.12.6` (45c35e4); upstream pi-mono |
| `vscode.md` | `ee183165649b643f9b8300b49b4a541df049c4b57cbc07b620e91d06be3b2157` | microsoft/vscode main at 6ee9463 (2026-10-26): tasks, terminal, chat agent sessions, agent host, status bar, progress |
| `openhands.md` | `87912104b5315cd145f6eedcf3f686148b94913c2ff3fd6d0a5a99b1048beb56` | OpenHands (Agent Canvas) dbe578d, software-agent-sdk d0d9d81, OpenHands 0.62.0 and 1.11.0, docs |
| `t3.md` | `f78529d8ee4f384c6ad2b75975aca898bbbdc1cced397450642be489da5a3692` | pingdotgg/t3code at `v0.1.3-nightly.20261026.3726` (3f94487, the local build) and `v0.1.2` |
| `cursor-qoder.md` | `a933ac1c2a44b981e80df5c96e5c2a08c67f20ae2a8c3ab32d30553119e16cbd` | Cursor docs, changelog and forum; the cursor-agent CLI bundle 2026.10.22; Qoder docs; `@qoder-ai/qodercli@1.1.79` |
| `claude-devin.md` | `360f5005752fcb3f351dd8c9cfbc50c3e30a9037fbd3d1fee8a995df8d29ee25` | Claude Code CLI bundle strings, docs and changelog; Claude desktop and web; Devin docs and API; Windsurf Cascade |

The source clones (about 2.1 GB) are under `~/PM-Experiments/bg-activity-research-20261026/src/` on the VM until
this discussion closes.

## What each tool shows

| Tool | In one session or thread | Across the whole app | Completion reaches the agent by | Stop |
|---|---|---|---|---|
| **Codex CLI** | Footer `N background terminals running · /ps to view · /stop to close`, zero height when empty. `/ps` lists up to 16, 3 output lines each | `/agents` command center: tabs `All, Needs you, Working, Ready, Inactive` with counts. Root threads only; processes appear nowhere | Polling only. The model sees an exit only if it polls; an idle parent is never woken (#15723) | Esc spares processes. `/stop` kills all of them; there is no per-process stop in the TUI |
| **Codex desktop** | "N background terminals running" and a Background Processes panel with per-row Stop. Read-only Subagents panel with Active and Done lists | Activity view (`Cmd+Opt+U`): unread, running and waiting chats | Same as the CLI | Per row. Reported broken: Stop disabled while the port was still held (#12478) |
| **Antigravity CLI (`agy`)** | Active-items list under the prompt. `/tasks` (Enter streams the log, `k` kills, `x` clears finished) and `/agents` | Status line counts only (`subagents 1 · tasks 0`); Antigravity 2.0 app sidebar shows a needs-attention mark | Pushed as a high-priority inbox message with the exit code and truncated output. The prompt tells the model not to poll | Kill one task, kill a subagent tree, or kill all |
| **Gemini CLI** | Footer `N Background processes`; panel on `Ctrl+B`; `/tasks` | none | Per item `silent`, `notify` or `inject`; the default is silent | `Ctrl+K` kills |
| **OMP** | One pill above the composer: an agents count and a jobs count, words on hover, hidden at zero. Jobs sheet: a thread → subagent → job tree, output tail, Cancel | Agent Hub (`Alt+A`) for agents; `omp ps` for services only | Pushed as a visible `async-result` notice; injected as a new turn when idle | Cancel per job; owner-scoped (a child cannot touch its parent's jobs) |
| **VS Code** | Pills above the chat input ("1 Background Shell"); a transcript line "2 subagents and 1 background command running" | Experimental title-bar counts: unread, needs input, in progress. Status bar shows running tasks as `$(tools) N`, removed at 0 | Injected steering message `[Terminal … notification: command completed with exit code N]`; the tool says "do NOT poll" | Per entry, only where the runtime says it is stoppable |
| **OpenHands** | Read-only Terminal tab; one live chip ("Running: …") derived from actions without observations | Sidebar dots: running pulses, but idle and waiting look the same | Model polls a log file; child conversations come back as a prefixed user message | Stop interrupts the run and sends Ctrl+C to every terminal; nothing per process |
| **T3 Code** | Composer banner "Running: X" or "Waiting on 2 subagents and a monitor", one Stop; details panel "Lineage · N running" | Sidebar status pills ranked by priority, a Working shelf; no status bar | Pushed as a typed notification message; after a restart, one note that the work was cancelled | Stop the whole thread (children depth-first); no per-command stop |
| **Cursor** | A row of pills above the prompt (pending input, Changes, Agents, Terminals, Canvas, Queue); the Terminals pill lists agent shells, each with Stop | Sidebar grouped by status, with Needs Attention and Error groups; dock badge; the quit dialog lists running agents | Background shells are files with a heartbeat header; `Await` with regex and wake-up queue | Archiving a chat stops its shells after a confirm; Stop all for subagents |
| **Qoder** | Task monitor: "Execution activity" grouped as subagents, background processes, side chats, skills, MCP. Hiding a section never stops anything | Quest board (retired 2026-10-15); a macOS Dynamic Island for progress and questions | `notify`, `inject` or `silent` per task; hooks on task created and completed | `k` kills a running task or clears a finished one |
| **Claude Code** | Footer pill that collapses by kind ("2 shells, 1 monitor" or "N background tasks"); `/tasks` dialog with Shells, Monitors, Local agents, Cloud agents and an "Earlier in this session" section | `claude agents` view grouped Pinned, Ready for review, Needs input, Working, Completed; the desktop app has a Tasks pane | Injected `<task-notification>` with id, status, summary, output file and a "no human input" note; quiet check-ins for long runners | Exit dialog: "Exit and stop tasks" or "Move to background and exit" |
| **Devin** | Workspace tabs (shell, browser, editor, planner); a tray with Subagents, Shells and Cloud agents | Kanban by status in the desktop Command Center; web sidebar "Group by status": Working, Ready, Blocked, Inactive | The coordinator is woken when a child finishes or needs input | Kill one (`x`); an interrupt parks subagents instead of killing them |

## What they agree on

1. **One registry feeds every surface.** Claude Code keeps one typed task registry and publishes both edge events and a
   full snapshot, so "a missed bookend cannot wedge a stale running indicator". The tools that kept several registries
   (OMP has four, T3 has four, Antigravity has five status vocabularies) all ship stale-row bugs.
2. **Counts at a glance, detail on click.** Every footer or status item is a count that hides or quiets at zero; the
   list lives one click away. Claude's homogeneous collapse ("2 shells, 1 monitor" against "3 background tasks") and
   OMP's "words on hover" keep the count short.
3. **Needs you is its own state and leads every list.** Codex, Claude, Cursor, Devin and VS Code all rank it first, show
   the literal question and how long it has waited, and count it separately from "running". OpenHands merged it with
   "Working" and its users could not tell them apart.
4. **Stopping the reply is not stopping the processes.** Codex's Esc spares background terminals; T3 and OpenHands
   kill everything; Cursor's Stop leaves background work able to wake the chat again. The good versions offer Stop
   per item, Stop all, and cascade from an agent to what it started.
5. **Completion is pushed to the agent, with a per-item policy.** Gemini and Qoder name the three choices
   (`inject`, `notify`, `silent`). The pushed message carries the id, the exit code and a bounded tail, says no human
   acted, and is suppressed when the user stopped the item.
6. **The lifecycle is stated.** Archive asks before it kills (Cursor), quitting names what stops and what carries on
   (Claude, Cursor), a restart leaves an honest note (T3), and an idle reaper counts live processes (OpenHands and
   Codex killed dev servers silently when a thread went idle).
7. **Output is a separate, bounded stream.** VS Code and T3 subscribe to output only while a row is open; Codex keeps
   head and tail buffers with an omission marker; list rows show the last three lines at most.

## Pitfalls seen in the issue trackers

- **Ghost rows.** Counts that never drop, "Running 8 terminals" with all of them dead, and "Waiting" states that Stop
  cannot clear. Causes: counts derived from transcript events, end events skipped on replay, and no reconciliation
  against real process ids.
- **Killing the wrapper, not the tree.** The shell dies, the dev server is reparented to pid 1 and keeps its port,
  and the row still says Running (Cursor forum 161340, 171517).
- **Background completion waking a stopped thread**: a paused Goal resumed, and on some plans a request was billed
  (Cursor forum 171720, 162729).
- **One notice per child completion** (Antigravity #928). One key that approves in one tool and kills in another.
- **Silent lifecycle kills**: thread unload, idle eviction and restart, all with no row left to say what happened.
- **Unbounded output**: 10 MiB of output crashed VS Code (#342794); rebuilding the whole output per chunk froze it
  (#342975).

## What the concept takes from this

| Idea | From | Where in the concept |
|---|---|---|
| One store, two filters | Claude, OMP job tree, Qoder | `rw-data.js`: the thread surface filters by thread, the status bar reads everything |
| Needs you first, with the question, waiting time and inline answers | Codex, Claude, Cursor, VS Code | Both surfaces; quick answers come from the prompt (`[y/N]` gives No and Yes) |
| Stop per item, Stop all with a list, cascade to children | Cursor, Claude, Antigravity | Row actions; confirm dialogs that name everything they stop |
| Composer Stop does not stop processes, and says so | Codex (Esc), T3 (gap) | Thread panel footer |
| When it ends: Tell the agent, Notify me, or Quiet | Gemini, Qoder, Antigravity | Detail block on every process and scheduled run |
| The reply waits for it, or not | VS Code attached/detached, T3 `awaited` | Detail block |
| Lost, after a restart, with one note to the agent | T3, Cursor (lost state) | After restart scenario |
| Stale feed: dim rows and a strip, never overwrite state | F3-477 (our own canon), Claude snapshots | Stale feed scenario |
| Output tail with an earlier-lines marker | Codex, VS Code | Detail block |
| CPU and memory sampled only while the panel is open | T3 resource monitor | Task manager layout |
| Quit names what stops and offers to keep work running | Claude, Cursor | Lab, Quit… |
