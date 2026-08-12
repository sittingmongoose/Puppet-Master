# External Chat and Agent Interface Research

## Scope

This synthesis covers 31 distinct chat, coding-agent, collaborative-assistant, and open-source workflow projects. It records observed product responsibilities and recurring interaction separations. It does not rank the projects and does not prescribe a design for Puppet Master.

The concept agents do not need to repeat this broad sweep. They may perform targeted source inspection when a chosen implementation requires clarification.

## Source inventory

| Project | Category | Observed focus | Primary source |
|---|---|---|---|
| OpenAI Codex | Coding and agent environment | Dedicated agent application, project-scoped threads, changes and evidence inside agent work | https://openai.com/index/introducing-the-codex-app/ |
| ChatGPT | General assistant | Projects, persistent conversations, search, branching and file-supported work | https://help.openai.com/en/articles/10169521-projects-in-chatgpt |
| Claude | General assistant | Conversation plus separate artifact workspace and project context | https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them |
| Claude Code | Coding agent | Tasks, tools, subagents, permissions and execution activity in a terminal-oriented workflow | https://docs.anthropic.com/en/docs/claude-code/overview |
| Gemini Apps | General assistant | Pinned and recent chats, search, rename, branch and delete behavior | https://support.google.com/gemini/ |
| Gemini CLI | Coding agent | Project-scoped history, checkpoints and resumable command-line agent work | https://github.com/google-gemini/gemini-cli |
| Microsoft 365 Copilot | Collaborative assistant | Chat history, thread management and handoff into adjacent work surfaces | https://support.microsoft.com/en-us/copilot |
| GitHub Copilot | Coding assistant | Chat, edits, agents and repository context inside development workflows | https://docs.github.com/en/copilot |
| Visual Studio Code Chat and Agents | Coding environment | Dedicated agent sessions, chat views, edits, tools and mode selection | https://code.visualstudio.com/docs/copilot/overview |
| Cursor | Coding environment | Chat, agent runs, edits, checkpoints, tools and project history | https://docs.cursor.com/ |
| Cline | Coding agent | Task history, checkpoints, tool use, browser actions and file changes | https://docs.cline.bot/ |
| Roo Code | Coding agent | Modes, task history, tools, checkpoints and delegated work | https://docs.roocode.com/ |
| Continue | Coding assistant | Chat, Plan and Agent modes with explicit authority boundaries | https://docs.continue.dev/ide-extensions/agent/quick-start |
| OpenCode | Coding agent | Sessions, tools, provider routing and terminal-first agent interaction | https://opencode.ai/docs/ |
| Windsurf Cascade | Coding agent | Code and chat modes, plans, todo lists, tool calls and checkpoints | https://docs.windsurf.com/windsurf/cascade/cascade |
| Zed Agent Panel | Coding environment | Independent project threads, history, context and agent actions | https://zed.dev/docs/ai/agent-panel |
| Aider | Coding agent | Chat modes, repository map, edits, commits and history management | https://aider.chat/docs/ |
| Warp | Terminal and agent environment | Agent conversations made from queries and terminal blocks across panes and tabs | https://docs.warp.dev/agent-mode/agent-mode |
| JetBrains AI Assistant | Coding assistant | Tool windows, chat history, rename, delete and editor integration | https://www.jetbrains.com/help/idea/ai-assistant.html |
| Sourcegraph Cody | Coding assistant | Repository-aware chat, context, commands and edit workflows | https://sourcegraph.com/docs/cody |
| OpenHands | Open-source coding agent | Conversation-level tool calls, file changes, observations and execution state | https://docs.all-hands.dev/ |
| Goose | Open-source agent | Desktop, command-line and API surfaces with tool and extension activity | https://block.github.io/goose/ |
| LibreChat | Open-source assistant | Multi-provider conversations, branching, presets, agents and artifacts | https://www.librechat.ai/docs |
| Open WebUI | Open-source assistant | Conversation history, tools, task lists, models and workspace features | https://docs.openwebui.com/ |
| LobeChat | Open-source assistant | Assistants, topics, message history, models and knowledge features | https://lobehub.com/docs |
| AnythingLLM | Open-source assistant | Workspace chats and run details with collapsible thinking, tools, files, response and metrics | https://docs.anythingllm.com/ |
| Dify | Workflow and assistant platform | Conversation applications and human-input workflow pauses with resumable forms | https://docs.dify.ai/ |
| Flowise | Workflow and assistant platform | Chatflows, agent flows, execution traces and embedded chat surfaces | https://docs.flowiseai.com/ |
| Langflow | Workflow and assistant platform | Flow execution, playground conversations, traces and component outputs | https://docs.langflow.org/ |
| Pieces | Developer assistant | Long-term context, conversation history and code-oriented workstream memory | https://docs.pieces.app/ |
| GitLab Duo Chat | Coding assistant | Sidebar and editor quick-chat surfaces with project and code context | https://docs.gitlab.com/user/gitlab_duo_chat/ |

## Cross-project observations

### Multiple surface classes

Products frequently provide more than one chat surface: a dedicated agent-first window, a docked sidebar or tool window, and a lighter inline or quick-chat surface. The same product may use different chrome while sharing conversation and run identity. This observation supports the validity of Puppet Master having docked, floating, and embedded mounts, but it does not establish how any concept should arrange them.

### Thread history as a separate responsibility

Thread selection, recent history, pinned items, archived items, search, rename, delete, branching, project grouping, and restoration commonly form a system distinct from reading the active transcript. Products vary substantially in location, density, and presentation.

### Conversation and execution disclosure

Coding and agent products commonly distinguish human-readable answer prose from tool calls, shell activity, file changes, plans, tasks, checkpoints, or run details. Some place execution inline; some use expandable run details; some move it into adjacent views. The recurring fact is separation of responsibility rather than a converged visual arrangement.

### Todo state and running state

Task lists, plans, active command state, child-agent state, and final answer state are frequently modeled as different records. Products vary in whether those records are adjacent, inline, detached, or hidden until requested.

### Artifacts and large outputs

Large outputs often remain linked from the conversation while opening in a separate artifact, editor, preview, file, canvas, or terminal surface. The conversation commonly preserves provenance and a route back to the output rather than duplicating the full payload in prose.

### Long-history storage versus active model context

Several products treat durable conversation history, currently rendered history, and the subset sent to a model as separate concerns. Persistent history may be much larger than the model context or the visible viewport. This distinction aligns with Puppet Master's stored history, virtualization, Context Lens shaping, and user search requirements.

### Human input as an interruption state

Workflow and agent platforms often represent required human input as a paused or waiting execution state rather than an ordinary assistant answer. Forms or questions can resume a run after completion. The products do not converge on one presentation, but they establish that human input has lifecycle consequences.

### Parallel work

Parallel agents may be shown as separate sessions, child tasks, subagent rows, crew boards, tabs, or run details. Products generally preserve a parent-level progress view while allowing deeper inspection. They vary in how much child detail appears inside the parent transcript.

### Explicit mode and authority

Coding assistants frequently distinguish conversational, plan/read-only, agent/editing, debug, or other authority modes. Mode choice is often near the composer or thread controls. The number and placement of controls vary.

### Runtime metadata

Provider, model, token use, cost, duration, tool count, changed files, and status are exposed inconsistently. Some products show them continuously; some place them in details, receipts, logs, or run summaries. This makes metadata priority a design problem rather than a settled pattern.

### Search and restoration

Conversation search ranges from simple text filtering to cross-thread search, project grouping, source retrieval, or exact-message restoration. Products differ in whether search is integrated into the history rail, a dedicated screen, or a popup.

## What the research does not establish

The project sweep does not establish one ideal chat layout, message shape, activity widget, thread rail, question surface, or motion language. It shows repeated separations of responsibility and a wide range of presentations. The four concept agents therefore retain substantial independent design space.
