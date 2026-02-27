## 20. References

- **AGENTS.md:** DRY Method, platform_specs, subagent_registry, Pre-Completion Verification Checklist.  
- **Plans/interview-subagent-integration.md:** Interview phases, document generation, AGENTS.md/DRY for target projects, §5.2 AI-Overseer and wiring/completeness.  
- **Plans/orchestrator-subagent-integration.md:** Subagent selection, crews, execution engine, Plan/Crew execution.  
- **Plans/human-in-the-loop.md:** HITL mode (phase/task/subtask approval gates), GUI settings, Dashboard CtAs.  
- **Plans/agent-rules-context.md:** Application-level rules (Puppet Master) and project-level rules; fed into every agent (orchestrator, interview, Assistant). When building Assistant context, include the shared rules pipeline output (application + project when a project is selected).  
- **Plans/FileSafe.md:** Context compilation (orchestrator/iteration); chat uses separate conversation context.  
- **Plans/Tools.md:** Central tool registry and permission model (allow/deny/ask); YOLO = no ask prompts, Regular = ask (once / approve for session ≈ [OpenCode "always"](https://opencode.ai/docs/permissions/#what-ask-does)); §2.5 cross-plan alignment with FileSafe, FileManager, orchestrator, interview.  
- **Plans/newtools.md:** MCP, web search (cited), GUI tool catalog; **§8.2.1** cited web search (full spec, architecture, provider/auth, errors, security, per-platform, **gaps and potential problems**).
- **Cited web search (references):** Adapt one or combine approaches so Assistant, Interview, and Orchestrator share one implementation. [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited) -- LLM cited search, inline citations + Sources list (Google/OpenAI/OpenRouter). [opencode-websearch](https://www.npmjs.com/package/opencode-websearch) -- Anthropic/OpenAI provider wiring, model selection. [Opencode-Google-AI-Search-Plugin](https://github.com/IgorWarzocha/Opencode-Google-AI-Search-Plugin) -- Google AI Mode via Playwright, markdown + sources. See Plans/newtools.md §8 for full list.  
- **Plans/newfeatures.md §15.15-15.16:** IDE-style terminal and panes (Terminal, Problems, Output, Debug Console, Ports); hot reload, live reload, fast iteration; Assistant can call up live testing tools.  
- **Plans/newfeatures.md §3, §7:** Persistent rate limit and analytics (5h/7d visibility, "know where your tokens go"); use for usage/context display in chat header or status area.  
- **VBW:** https://github.com/yidakee/vibe-better-with-claude-code-vbw (token efficiency, context compilation).  
- **GSD:** https://github.com/gsd-build/get-shit-done (spec-driven development, context engineering).  
- **yume:** https://github.com/aofp/yume (session recovery, native UI for Claude Code).
- **Plans/assistant-chat-design.md §23:** Gaps, competitive comparison (OpenCode, Claude Code, Codex, Gemini CLI, Antigravity, Cursor), and recommended enhancements.
- **Plans/assistant-chat-design.md §24:** Chat thread performance, virtualization, and flicker avoidance (long threads, Slint, virtualized list, stable IDs, incremental stream updates).
- **Plans/newfeatures.md §15.11:** Virtualization for long lists (messages, iterations, logs); overscan, visible slice, placeholder height. **Plans/FinalGUISpec.md**, **Plans/feature-list.md:** Slint + winit, virtualized file tree, backend (Skia).

---

