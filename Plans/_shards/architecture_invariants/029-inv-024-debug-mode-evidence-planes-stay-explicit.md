# Shard 029: INV-024 -- Debug Mode evidence planes stay explicit

Source: `Plans/Architecture_Invariants.md`

Source lines: L388-L403

Source SHA256: `a1488a98949bf363a0c763a51dae6dc4db5261708c7828eeca492e65f251c543`

---

## INV-024 -- Debug Mode evidence planes stay explicit

**Rule:** Debug Mode MUST preserve the difference between local ephemeral investigation, hosted runtime verification, production/data-plane observability, assistant-session diagnostics, terminal/test observe loops, and DAP-grade interactive inspection.

- Devin-style bug-from-report playbooks and MCP-to-observability flows are production/data-plane examples: they may inform imported evidence and external observability adapters, but they are fleet telemetry rather than the local ephemeral probes PM uses for an in-worktree investigation. Reference URL: `https://docs.devin.ai/use-cases/gallery/fix-bug-from-report`.
- Replit-style hosted runtime + verification, including agent self-testing and console/Ask AI feedback, is a tight feedback loop but remains cloud-coupled; PM MUST NOT make desktop Debug Mode depend on hosted runtime ownership or a remote desktop extension log server.
- OSS agents such as OpenHands, SWE-agent / mini-swe-agent, Cline, Roo Code, Continue, and Aider mainly establish the terminal/test observe loop + edits pattern. Continue additionally contributes rich LLM interaction logging at PR level plus debugger/stack context threads; that still does not become Cursor-style packaged instrumentation server behavior. Reference URL: `https://github.com/continuedev/continue/issues/4619`.
- Research-grade directions such as InspectCoder / InspectWare (arXiv 2510.18327, OSS framework) point toward LLM-to-interactive-debugger loops using breakpoints, state inspection, and perturbations, closer to DAP-grade feedback than printf loops. `snooper-ai` and PySnooper-style trace-to-LLM flows remain trace alternatives, not replacements for DAP, browser, terminal, or imported-bundle target identity.
- Debug Mode is a chat/workflow overlay, not a new execution-posture enum. `Plans/assistant-chat-design.md` may expose Debug alongside Ask, Agent, Plan, and Deep Plan, while `Plans/Run_Modes.md` keeps runtime posture separate and shared tools stay debug-capable across Assistant, `/Orchestrator/Interview`, and other owner flows.
- Deep Plan is a single-threaded read-only planning overlay in the same posture model; selecting it does not create a sub-task inheritance path or widen child authority.
- Debug Mode is MVP only when it preserves existing authority boundaries: remote targets keep `/no-local-fallback`, requested `/effective` capability `/state` stays visible, and the drift-risk seams for `investigation_id`, `instrumentation_id`, storage, `/contracts/prompt`, permissions, and browser evidence are owned explicitly rather than inferred from a debug label.
- Any browser evidence auto-feed must be a visible attach `/bundle` contract and must not contradict the no hidden browser-to-chat injection rule. A browser-backed investigation can auto-feed bounded evidence only through visible Investigation Context state, consented attach/revoke affordances, and owner-routed browser capture events.
- In-scope tool-emitted evidence for an active investigation enters the Investigation Context as `active` unless redaction, trust, or `/truncation` policy forces a narrower state; out-of-scope evidence remains referenced or rejected instead of being silently injected.
- Debug verification heuristics included in exported or replayed investigation evidence carry `heuristic_version = debug_verify.v1`; future `debug_verify` tuning must increment or preserve `heuristic_version` so older bundles remain interpretable.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md
