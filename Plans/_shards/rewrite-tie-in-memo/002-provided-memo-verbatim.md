# Shard 002: Provided memo (verbatim)

Source: `Plans/rewrite-tie-in-memo.md`

Source lines: L13-L87

Source SHA256: `cd7f5ba8e7f5b385bfa0787b15b3ea370d3b247b86c8adcd91e518845f542514`

---

## Provided memo (verbatim)

This project is moving to a single, deterministic "agent loop" architecture where every backend is just a **Provider** behind one unified session/event store, tool registry, and patch/edit pipeline (so CLI-bridged providers don't become special-case chaos). This is intentionally adapting much of **OpenCode's architecture** (provider abstraction, centralized config, session orchestration, tool registry) to address current pain points and make the main engine deterministic and reliable. [web:7][web:11][web:69][web:71]

### What's changing (high level)

### Orchestrator rewrite canonicalization lock (2026-03-17)
The orchestrator rewrite is now locked to these cross-doc decisions:
- node graph is the canonical execution model
- `Feature Seam` and `Work Package` are first-class graph-owned objects
- `Node` remains the smallest executable unit
- `Package Overseer` and `Seam Overseer` are governance roles, not hidden schedulers
- `Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct promotion states
- weak integration remains first-class and blocks seam completion when integration quality is insufficient
- graph patching creates a new graph generation while preserving historical superseded paths as visible lineage
- Orchestrator is tab-first with `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- `Progress` is the only widget-composed Orchestrator tab
- Source Control remains compact and worktree-first while Orchestrator carries lane/package/seam operational context
- shared requested/effective runtime identity spans conversational actors and orchestration actors without collapsing them into one ontology
- `route_target` and `OpenSubject` are canonical navigation/source-open primitives

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Crosswalk.md
- **GUI rewrite:** Desktop UI is switching to Rust + Slint, with Slint's cross-platform **winit backend** for Windows/macOS/Linux. [web:149]
- **Renderer decision (locked):** default is **winit + Skia**, fallback GPU is **winit + FemtoVG-wgpu**, and we keep an emergency software fallback for compatibility; selection can be controlled via Slint's backend selection mechanisms (e.g., `BackendSelector` and/or `SLINT_BACKEND`). [web:48][web:149]
- **Theme behavior (locked):** theme switching will be supported, but it's acceptable to require an app **restart**; we will offer both a "Puppet Master default" look and a "Basic theme."
- **Storage rewrite (no SQLite):** storage becomes a multi-store design: `seglog` as the canonical append-only event ledger, `redb` for durable KV state/projections/settings, and Tantivy for full-text search over chats/docs/log summaries. [web:88][web:90][web:82]
- **Search & dashboards:** "fast search for humans + AI" is implemented via Tantivy indexes built from projected events/messages, while heavy analytics scans run off the append-only seglog stream and store rollups into redb. [web:82][web:88][web:90]

### The core reliability plan (what other features must align with)
- The system must be reproducible: sessions/runs are replayable from a canonical event stream (seglog), with deterministic projections into redb/Tantivy and checkpointing for resumability after crashes. [web:88][web:90][web:82]
- Tools are governed by a central policy engine (permissions + validation + normalized tool results), and edits go through an explicit patch/apply/verify/rollback pipeline (often using worktrees/branches/sandboxes) to prevent "silent corruption." (This mirrors the discipline implied by OpenCode-style tool/session separation.) [web:71][web:69]
- The "Plans/" documentation set is intended to be treated as the authoritative requirements source for orchestration states, safe-edit rules, subagents, worktree/git edge cases, and tooling behavior (so implementation doesn't drift via ad-hoc UI wiring). (This is a project governance rule, not a library detail.)
- **Resume semantics (rewrite-level):** resumability means Puppet Master restarts from the last durable safe boundary recorded in canonical storage/projector state. It does not imply provider-process or transport-session reattachment.
- **SSOT routing:** replay/checkpoint/rebuild semantics are owned by `Plans/storage-plan.md`; normalized provider-stream behavior is owned by `Plans/CLI_Bridged_Providers.md`; centralized tool-policy/result normalization is owned by `Plans/Tools.md`.

### Provider + CLI integrations (what's being hardened)
- **Claude Code CLI** is integrated as a Provider using the official CLI's machine-readable streaming mode (`--output-format stream-json`, print mode `-p`, optional partials via `--include-partial-messages`) and uses **Claude Code Hooks** (e.g., `PreToolUse`, `PostToolUse`) to gate tools and enrich telemetry. [page:3]
- **Cursor Agent CLI** is integrated as a Provider using `--print --output-format stream-json` (NDJSON stream) and internal parsing into the unified event model. [web:157]
- **ACP note (important):** Cursor CLI is not ACP-native as of a Cursor staff reply (2026-01-04); Cursor CLI supports MCPs and may add ACP later, so if ACP is needed it's via an adapter layer on our side (not because Cursor suddenly "speaks ACP"). [web:167]

### Gemini auth decision (locked)
- Stale-canon correction: Gemini is not one **DirectApi** `mixed-account` provider. Gemini Direct (`gemini`) and Gemini CLI (`gemini_cli`) are separate provider entries; the older one-provider mixed OAuth/API-key account-pool wording is retired.
- Subscription-first remains the default posture, and the Gemini API key remains the explicit `key-exception` to the broader avoid-API-keys guidance where the selected provider entry supports that path.
- Gemini Direct is key-only/API-key-backed. Gemini CLI is mode-dependent and may resolve OAuth, API-key, or Google/Vertex credential account rows under its own capability and setup policy.
- OAuth, API key, and Google/Vertex credentials are distinct Gemini auth surfaces / quota planes and MUST NOT be presented as the same plan or bucket.
- Requested vs effective auth/account identity MUST be visible across prompt assembly, storage, setup/health, usage, media capabilities, and runtime reporting.
- The rewrite-level `three-bucket` register is `MUST CHANGE`, `MUST RECONCILE`, and `MUST VERIFY`; the Gemini `MUST CHANGE` set includes `Plans/Contracts_V0.md`, `Plans/Multi-Account.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, `Plans/Media_Generation_and_Capabilities.md`, and this memo because requested/effective `/auth-mode`, account-state `/record` shape, mode-aware usage, and anti-`key-centric` copy must align across them.
- Three-bucket packetization meaning is fixed: `MUST CHANGE` docs either define the primary canon directly or own core state/GUI/runtime semantics that would remain misleading if only lightly edited; `MUST RECONCILE` docs are not the primary feature specs, but they contain adjacent semantics, platform assumptions, or command/runtime integration that would drift if left untouched; `MUST VERIFY` docs currently look directionally aligned, but they overlap enough with MCP/skill/tool canon that they must be checked before packet emission.
- Stale-canon retirement is explicit for this rewrite packet: do not preserve the old one-provider Gemini mixed OAuth/API model, CLI-first Codex/Copilot runtime language, `server` / `cli_launcher` OpenCode framing where `Managed Server` / `Attach to Existing Server` owns the meaning, `--user-data-dir` as the canonical Cursor CLI account boundary, `.cursorrules` as the primary Cursor-managed rules artifact, provider-native skill loading as the canonical runtime path, or old bottom-terminal/editor slot concepts that conflict with workgroups/subtabs/split-tree/editor-stack canon.
- Packet candidates must include all `MUST CHANGE` docs, must include `MUST RECONCILE` docs or explicitly justify why a stronger overlapping owner doc eliminates drift risk, and should list `MUST VERIFY` docs as pre-emit checks rather than derived-only outputs. If a packet candidate omits `storage-plan`, `Prompt_Pipeline`, `Contracts_V0`, `FinalGUISpec`, or `Multi-Account`, treat that omission as a likely packet defect because requested/effective vocabulary or GUI/runtime canon will drift; terminal/editor concept deltas from `Concepts/PMConcept.html` must travel with `FinalGUISpec` and terminal command/wiring docs rather than being left as concept-only knowledge.
- Final reconciliation coverage register is locked for packetization at 21 docs across five drift clusters: provider/runtime canon (`Contracts_V0`, `Prompt_Pipeline`, `Multi-Account`, `CLI_Bridged_Providers`, `Provider_OpenCode`, `Models_System`, `Media_Generation_and_Capabilities`), GUI / terminal / editor canon (`FinalGUISpec`, `assistant-chat-design`, `UI_Command_Catalog`, `Wiring_Matrix`), storage and lifecycle canon (`storage-plan`), tool/skill/MCP and mirror docs (`MiscPlan`, `OpenCode_Deep_Extraction`, `newtools`, `Skills_System`, `Tools`), and orchestrator/interview consumers (`orchestrator-subagent-integration`, `interview-subagent-integration`, `rewrite-tie-in-memo`). The highest drift risk clusters are provider identity and requested/effective runtime vocabulary, multi-account plus billing/entity semantics, OpenCode server-profile ontology, MCP/skill ownership vs provider-native projection, `/skill/MCP` ownership, and terminal/editor integration canon after the PMConcept terminal redesign.
- Gemini Direct remaining follow-up is narrowed to quota-fidelity/source-confidence wording and reconciliation of the now-pinned media/capability contract; Media_Generation_and_Capabilities, usage-feature, and Multi-Account own the live quota, usage-source, capability-picker, and requested/effective media/account surfaces.
- `Plans/Contracts_V0.md` and `Plans/Prompt_Pipeline.md` carry the requested/effective auth/account identity needed to make Gemini implementation-ready across storage, usage, and UI consumers.
- Rewrite summaries must not encode stale Gemini canon as an API-key default UI, OAuth-as-optional-fallback, or subscription exception without auth-surface and `/account-policy` nuance.
- Media follows the same requested/effective Gemini provider-entry, auth-surface/account, and quota/usage rules as regular Gemini usage; do not `hard-split` media into `key-only` behavior unless future evidence requires it.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/storage-plan.md
### Future mobile/web clients (impacts architecture now)


- Mobile/web clients will be "thin" and connect back to the desktop app (desktop acts like a local server), so the stable boundary is the unified event model + streaming API (runs/events/artifacts) and command API (start run, approve tool, cancel run), rather than direct access to providers/tools on mobile/web.
- Thin clients MUST NOT call providers, tool executors, or local patch pipelines directly. They consume streamed events/artifacts and send command requests to the desktop-owned core only.

### Implementation directives (required now)
- Implement features against the locked interfaces: **unified event model**, **Provider trait**, **tool registry**, and **event-sourced session store** (seglog -> projections). [web:69][web:88][web:90]
- UI updates must flow through the Slint event loop boundary and must not rely on delayed or ad-hoc polling paths.
- New plan text and implementation notes must use **Provider** terminology for execution integration; do not introduce new platform-runner phrasing in updated sections.
- Persistence and search paths must use seglog/redb/Tantivy contracts directly; do not add SQLite-based alternatives in edited sections.
- The Slint rewrite MUST remove all per-platform experimental settings: Settings > Advanced MUST NOT include an "Experimental features" section or per-platform "Enable Codex/Gemini/Copilot Experimental" toggles, config schemas MUST NOT include per-platform `experimentalEnabled` (or equivalent) keys, and provider invocations MUST NOT rely on provider-side experimental toggles (e.g., Copilot `--experimental` CLI flag, or legacy Gemini experimental settings) for runtime behavior. DirectApi providers (Codex, Copilot, Gemini) MUST expose only stable capabilities through their APIs, and CliBridge providers (Cursor, Claude Code) MUST NOT grow experimental toggles in the GUI or config.
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/FinalGUISpec.md
- Assistant memory is an Assistant-only continuity capability and MUST NOT alter Provider spine contracts, unified event model ownership, or shared rules pipeline semantics; implementation is specified in `Plans/assistant-memory-subsystem.md`.
  Note: Gist generation is artifact-driven (AutoRunBoundary/AutoMilestone) and remains Assistant-only; it does not change system SSOT ownership.
  ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md

---
