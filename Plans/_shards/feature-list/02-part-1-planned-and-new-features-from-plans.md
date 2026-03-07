## Part 1 - Planned and New Features (from Plans)

### 1. Rewrite and architecture

**Single deterministic agent loop.** Every backend is a Provider behind one unified session/event store, tool registry, and patch/edit pipeline. OpenCode-style provider abstraction, centralized config, and session orchestration make the main engine deterministic and reliable. Platform-specific "runner" terminology converges on Provider plus unified event model.

**Event-sourced storage (no SQLite).** Storage is seglog as the canonical append-only event ledger, redb for durable KV state/projections/settings, and Tantivy for full-text search over chats, docs, and log summaries. Sessions and runs are replayable from seglog with deterministic projections into redb/Tantivy and checkpointing for resumability. **Analytics scan jobs** scan seglog for tool latency distributions, error rates, and usage; they write **rollups** into redb for the Usage view and dashboard (5h/7d, tool performance, error summaries).

**GUI rewrite (Rust + Slint).** Desktop UI switches to Rust and Slint with winit backend for Windows, macOS, and Linux. Default renderer is winit + Skia; fallback GPU is winit + FemtoVG-wgpu; emergency software fallback is kept for compatibility. Backend selection via Slint BackendSelector or SLINT_BACKEND.

**Theme (locked).** Three themes: Light, Dark, and Basic. Theme switching is supported; app restart is acceptable. Light and Dark preserve the retro look; Basic is plain and easier to read. No Iced commitment; UX requirements only.

**Future thin clients.** Mobile and web clients will be thin and connect back to the desktop app. Stable boundary is the unified event model plus streaming API (runs, events, artifacts) and command API (start run, approve tool, cancel run); no direct provider/tool access from clients.

**Core reliability.** Tools are governed by a central policy engine (permissions, validation, normalized tool results). Edits go through an explicit patch/apply/verify/rollback pipeline (worktrees, branches, sandboxes). Plans/ is the authoritative requirements source for orchestration, safe-edit, subagents, worktree/git, and tooling.

**Provider and CLI.** Claude Code CLI as Provider (stream-json, print mode, optional partials; Claude Code Hooks for tools/telemetry). Cursor Agent CLI as Provider (--print --output-format stream-json, internal parsing into unified event model). **Cursor / ACP (Resolved — Not Needed for MVP):**
Cursor CLI is not ACP-native (confirmed by Cursor staff, January 2026). Cursor supports MCPs, which Puppet Master already uses. An ACP adapter layer is **not needed for MVP**. If Cursor adds ACP support in the future, an adapter can be added as a non-breaking enhancement. Priority: P4 (future/optional). Gemini auth: API key default in UI; explicit exception to "subscription only"; OAuth optional.

**Contract-Locked PlanGraph System.** Canonical node-based plan graph and execution: user-project outputs under `.puppet-master/project/**` (sharded plan graph, Project Contract Pack, acceptance_manifest, auto_decisions; seglog canonical; optional UI wiring artifacts for GUI projects). Progression Gates (GATE-001–GATE-010): schema validation, Spec Lock integrity, drift phrases, evidence, wiring matrix validation; Verifier role; run-gates verifier (`python3 scripts/pm-plans-verify.py run-gates`). Overseer Protocol: Builder/Verifier/Overseer roles, deterministic next-ready selection and status lifecycle for plan_graph nodes; Spec Lock version checks.

Contract layers: Platform vs Project contracts, ProjectContract:* refs in node shards; Spec_Lock.json pins schema versions and locked decisions. UI command layer: stable UICommand IDs (UI_Command_Catalog), Wiring Rules (dispatch only UICommands; one element, one command), Dispatcher boundary, Wiring Matrix (schema-validated). Architecture invariants INV-001–INV-012 (tool correlation, no secrets, UI SSOT/boundary, deterministic ordering, providers isolated, no stringly-typed IDs, GitHub API-only, Cursor transport invisible, naming, wiring coverage).

Contracts V0 as SSOT for event envelope, UICommand, EventRecord, AuthState. Anti-drift: required SSOT reading order (Spec_Lock → Contracts_V0 → Crosswalk → DRY_Rules → Glossary → Decision_Policy → schemas → UI_Command_Catalog → Architecture_Invariants → Progression_Gates → Executor_Protocol → Verifier command). Scope: self-build plan graph (`Plans/plan_graph.*`) vs user-project (`.puppet-master/project/*`); do not conflate. Plans: Project_Output_Artifacts.md, Progression_Gates.md, Executor_Protocol.md, UI_Command_Catalog.md, UI_Wiring_Rules.md, Wiring_Matrix.md, Architecture_Invariants.md, Contracts_V0.md, Crosswalk.md, 00-plans-index.md.


#### Scan additions (auto-import: architecture)
##### Plans/Contracts_V0.md
- **AGENTS.md enforcement (contracted).** AGENTS.md light enforcement as a formal contract: lint + runtime budgets + truncation tracking (Contracts V0 §5.5).
- **Context injection toggles (contracted).** Contracted per-project toggles for Parent Summary / Scoped AGENTS.md / Attempt Journal with GUI exposure (Contracts V0 §5.6).
- **InstructionBundle contract.** Formal contract for assembling Instruction/Work/Memory bundles and scoped AGENTS.md chain handling (Contracts V0 §5).

##### Plans/Crosswalk.md
- **DocumentCheckpoint.** Document-level restore points / coarse undo checkpoints (Crosswalk §3.11).
- **DocumentInlineNotes.** Inline anchored notes with deterministic re-anchoring when text changes (Crosswalk §3.13).
- **DocumentPane.** Live multi-document preview surface with statuses (writing/draft/needs-review/approved) and read-only protections (Crosswalk §3.7).
- **DocumentReviewSurface.** Review routing surface for documents (tri-location review routing) (Crosswalk §3.8).
- **ReviewFindingsSummary.** Structured review findings schema + rendering surface (Crosswalk §3.9).
- **TargetedRevisionPass.** "Resubmit with Notes" targeted revision workflow without triggering full review loop (Crosswalk §3.14).

##### Plans/DRY_Rules.md
- **ContractRef taxonomy registry.** Registry of allowed ContractRef categories with validation rules (DRY_Rules §6).
- **Forbidden drift phrase detection.** Scanner for TBD/open questions/vague terms without measurable behaviors (DRY_Rules §4).
- **Inline requirement tag convention.** Inline Req:FR/Req:NFR tags for readability only, with authoritative refs elsewhere (DRY_Rules §10).
- **Plan-quality gate for missing ContractRefs.** Automated gating rejecting unreferenced operational text / missing ContractRef annotations (DRY_Rules §7-9; ties to gates).
- **Requirement annotation enforcement.** Enforce MUST/SHALL/REQUIRED statements include ContractRef; fail validation otherwise (DRY_Rules §5-7).

##### Plans/Decision_Policy.md
- **Deterministic precedence + autonomous decision logging.** Formal precedence hierarchy for resolving ambiguity (Spec Lock/Crosswalk/DRY/etc.) with auto_decisions.jsonl logging (Decision_Policy §1-5).
- **Requirements quality reporting.** Clarification/quality assessment workflow producing a requirements_quality_report output before runs (Decision_Policy §6.2-6.3).

##### Plans/Document_Packaging_Policy.md
- **00-index.md required fields.** Index must include source path, generation marker, source sha256, split rule summary, and ordered shard listing w/ line ranges (Packaging Policy §1.1).
- **Deterministic shard naming.** Zero-padded numeric prefix + kebab slug from heading text; fallback chunk naming by line ranges (Packaging Policy §1.3).
- **Docset canonical truth rules.** When .docset exists it is canonical; otherwise the .md is canonical (Packaging Policy §7.4).
- **Document Set contract (.docset).** Standard packaged docset directory with 00-index.md, manifest.json, ordered shards, and evidence/ (Packaging Policy §1).
- **Fallback fixed-line chunking.** Deterministic fallback chunking when heading split fails (Packaging Policy §2.2).
- **Heading-aware split rule.** Primary split at ## headings outside fenced code blocks (Packaging Policy §2.1).
- **Losslessness proof audits.** Reconstruction hash equality, line accounting, idempotency, and clean-room determinism proofs required (Packaging Policy §4-5).
- **Multi-audit evidence requirement.** Audits A/B/C must be documented under evidence/ (Packaging Policy §5).
- **Packaging enforcement scope.** Applies to required artifacts under .puppet-master/requirements/** and .puppet-master/project/** (Packaging Policy §6).
- **Pointer stub file.** Deterministic stub at original path pointing to docset + verification command format (Packaging Policy §7.3).
- **Pointer verification discovery rules.** Compliance checks for stubs/docsets: manifest, reconstruction, line coverage, idempotency, clean-room determinism (Packaging Policy §7.5).
- **Size trigger budgets.** Default max_bytes/max_estimated_tokens and fallback_chunk_lines thresholds (Packaging Policy §3).
- **manifest.json schema.** Manifest fields for source metadata + per-shard ranges and hashes (Packaging Policy §1.2).

##### Plans/Executor_Protocol.md
- **Auto-marking verified→done.** When verifier outcome pass + evidence valid, auto-transition verified to done (Executor Protocol §4).
- **Deterministic node readiness predicate.** Readiness requires queued status, blockers done, and Spec Lock schema versions match (Executor Protocol §2).
- **Document packaging gate.** Before finalization, enforce Document_Packaging_Policy compliance for artifacts (Executor Protocol §6.1).
- **Lexicographic ready-node selection.** When multiple nodes are ready, select lexicographically smallest node_id (Executor Protocol §2).
- **Overseer deterministic dispatch algorithm.** Deterministic loop: readiness → lexical select → dispatch builder → verify_pending → dispatch verifier → apply transitions (Executor Protocol §6).
- **Spec Lock version validation in executor.** Reject readiness if required schema version keys mismatch/missing (Executor Protocol §2).
- **Terminal state lifecycle rules.** done and failed are terminal; no further transitions (Executor Protocol §3).
- **Verified transitional state enforcement.** Enforce verified as a required transitional state with outcome+timestamp (Executor Protocol §4).

##### Plans/OpenCode_Coverage_Matrix.md
- **Default .env deny rules.** Canonical defaults treating .env as ask/deny with .env.example allow (Coverage Matrix §7C.6).
- **LSP integration (matrix reference).** LSP integration called out as desktop MVP scope item (Coverage Matrix §7D/refs).
- **MCP integration contract (matrix).** MCP discovery/registry/permission gating/config paths described without SSOT (Coverage Matrix §7D.1).
- **Permissions doom_loop guard.** Threshold-based guard against recursive permission request loops (Coverage Matrix §7C.4).
- **Permissions external_directory guard.** Allowlist for restricting skill/plugin discovery to safe external paths (Coverage Matrix §7C.4).
- **Permissions multi-layer precedence model.** Multi-layer precedence model for permissions resolution beyond flat overlay (Coverage Matrix §7C.1).
- **Provider error classification taxonomy.** Unified classification for retryable/overflow/auth errors with policies (Coverage Matrix §7H.5/§10.3).
- **Provider transform layer.** Standardized provider request/response normalization contract (Coverage Matrix §7H.4/§10.3).
- **Run modes + enforcement.** Mode selection taxonomy with budget enforcement and deterministic kill conditions (Coverage Matrix §7A).
- **Tool lifecycle + hook boundaries.** Tool execution lifecycle with before/after hooks wired via plugins (Coverage Matrix §10.1).

##### Plans/OpenCode_Deep_Extraction.md
- **.env default read permissions.** Default permission patterns treating *.env as ask while *.env.example allow (OpenCode deep extraction §7C.6).
- **Baseline→PM delta hooks set.** Documented delta hooks for Rust-native plan mode, subprocess subagent execution, compaction thresholds, plugin hook aliases, etc. (OpenCode deep extraction §9).
- **Command subtask + model override semantics.** Subtask flag triggers subagent execution; runtime parsing of provider/model override formats (OpenCode deep extraction §7D.4).
- **Contract mapping to PM SSOT.** Detailed mapping tables from upstream contracts to PM SSOT artifacts (OpenCode deep extraction §8).
- **Overflow/error detection patterns.** Context overflow regex patterns + retryability rules across providers (OpenCode deep extraction §7H.5).
- **Plugin tool override precedence rules.** Explicit rules for plugin tool overriding built-ins and PM deltas restricting overrides (OpenCode deep extraction §7G.4/§9G).
- **Provider transform layer details.** Provider-specific stream normalization/schema transforms and quirks handling (OpenCode deep extraction §7H.4).
- **Session compaction mechanics.** Hidden summary agent, prune-protect window, protected tool list, and compaction customization hooks (OpenCode deep extraction §7B.5).
- **Skill permission patterns + prune protection.** Skill-specific permission wildcards and compaction prune protection for skill tool (OpenCode deep extraction §7F.4).
- **Upstream notes capture list.** Upstream notes worth capturing (tools/permissions/provider/session taxonomy) not enumerated in feature list (OpenCode deep extraction §10).

##### Plans/Progression_Gates.md
- **Additional progression gates beyond 001-010.** Canonical doc defines gates up through GATE-014 (incl 011-014) beyond feature-list mention (Progression_Gates).
- **Change budget enforcement details.** Gate-level enforcement of max files/LOC delta and allowed/forbidden paths (GATE-006 details).
- **GATE-011 requirements traceability coverage.** Deterministic gate requiring traceability artifacts and zero uncovered requirements (GATE-011).
- **GATE-012 requirements quality gate.** Gate validates requirements_quality_report PASS and zero needs_user_clarification items (GATE-012).
- **GATE-013 ambiguity marker resolution gate.** Scan AMBIGUOUS markers and require mapping to auto_decisions.jsonl entries (GATE-013).
- **GATE-014 document set packaging gate.** Gate validating shard packaging, reconstruction parity, line accounting, idempotency, determinism, stubs (GATE-014).
- **Verifier role specification.** Deterministic verifier role semantics (must run gates exactly; block on failure) (Progression_Gates §1).

##### Plans/Project_Output_Artifacts.md
- **Deterministic node ID requirements.** Stable node IDs derived from canonical intent (no timestamps/randomness) across sharded graphs (Project_Output_Artifacts §7).
- **Deterministic quickstart.md generation.** Optional derived quickstart.md with verbatim sourcing and size/count limits (Project_Output_Artifacts §12).
- **Docset packaging for large artifacts.** Package large artifacts as .docset directories with pointer stubs when size triggers reached (Project_Output_Artifacts §2.3).
- **Requirements traceability output set.** Traceability outputs: requirements_quality_report.json, requirements_coverage.json, requirements_coverage.md with orphan tracking (Project_Output_Artifacts §11).
- **Schema alignment + field normalization enforcement.** Strict field naming alignment across artifact schemas with DRY integrity rules (Project_Output_Artifacts §3).
- **Seglog canonical artifact persistence contract.** Artifact persistence contract with required fields and regenerable filesystem exports (Project_Output_Artifacts §8).
- **Validation pass report artifacts.** Persist three-pass validation reports (incl Pass 3 write-protection invariant) in seglog as artifacts (Project_Output_Artifacts §10).

##### Plans/Prompt_Pipeline.md
- **Compaction determinism constraints.** Compaction/pruning rules including protected outputs/tool classes (Prompt_Pipeline §2).
- **GUI prompt/injected-context preview.** GUI surfaces for injected-context breakdown and safe prompt preview (Prompt_Pipeline §4).
- **Instruction bundle format contract.** Canonical Instruction Bundle structure including injected-context breakdown (Prompt_Pipeline §1.3).
- **Prompt assembly stage ordering.** Deterministic multi-stage prompt assembly ordering (config→personas→skills→context→bundle→plugins→tool schemas→final) (Prompt_Pipeline §1.2).
- **Run rotation outcome (done.rotated).** Explicit follow-up run spawning on overflow/rotation with outcome taxonomy (Prompt_Pipeline §3).

##### Plans/rewrite-tie-in-memo.md
- **Checkpointing + resume semantics.** Checkpointing contract for resumability after crashes (rewrite memo ¶24).
- **Event replay + deterministic projections.** Explicit session replay from seglog with deterministic projections into redb/Tantivy and replay verification semantics (rewrite memo ¶23-24).
- **Normalized tool results contract.** Central policy engine with normalized tool results into unified event stream (rewrite memo ¶25).
- **Plans as orchestration SSOT sync.** Load and keep orchestration state synced from Plans as authoritative source (rewrite memo ¶26/¶39).
- **Provider streaming parsing contract.** Provider streaming parsing normalized into unified event model (rewrite memo ¶40).
- **Provider trait as stable contract.** Provider trait/tool registry interfaces treated as locked stable contracts (rewrite memo ¶40).
- **Remove experimental toggles enforcement.** Explicit removal/enforcement against experimental settings/toggles in rewrite (rewrite memo ¶44).
- **Transactional patch/apply/verify/rollback pipeline.** Unified transactional edit lifecycle pipeline to prevent silent corruption (rewrite memo ¶25).

##### Plans/storage-plan.md
- **Document bundle persistence keys.** Persist doc-builder bundle state/inline notes/final-review gating in redb (storage-plan §2.3).
- **Event schema registry.** Central registry of event types/payload schemas for docs/validation (storage-plan §7).
- **JSONL mirror generation.** Human-readable JSONL mirror of seglog written by projector (storage-plan §2.4).
- **Per-project seglog isolation option.** Option to store seglog per project under .puppet-master for isolation (storage-plan §7).
- **Scheduled backup/restore.** Scheduled backup/restore flows for redb/seglog to backups directory (storage-plan §7).
- **Seglog rotation/compaction.** Optional seglog segment rotation/compaction to reduce file count (storage-plan §7).
- **Streaming projector to UI.** Projector pushes updates to UI instead of only tail polling (storage-plan §7).
- **Thread checkpoint restoration keys.** Store/restore per-thread restore points for rewind/resume (storage-plan §2.3).
- **Thread/run history export.** Export thread/run history from seglog/JSONL mirror (storage-plan §7).
---

### 2. Chat and assistant

**Chat modes.** Ask (read-only; no edits, no execution). Plan (read-only until execute; clarifying questions required, then research, then plan + todo; execute after approval). Interview (switch to interview flow; reduced phases when from Assistant; at end: Do now or Add to queue). BrainStorm (multi-model, shared context, subagents communicate; on execute chat switches to Agent mode). Crew (invoke crew with Plan; must work together). **Chat controls (OpenCode-style):** platform dropdown, model dropdown (customizable -- dynamic discovery + manage models), reasoning/effort when platform supports it; in chat header or footer; context passed on switch; apply to next turn. Many features require a project.

**Bash capability.** The Assistant can run shell commands (bash) when not in read-only mode (e.g. in Plan execution or Agent mode). Execution is subject to permissions (YOLO vs regular approval) and to FileSafe/guards. Bash output (stdout/stderr) is visible in the thread.

**Plan mode depth and rules.** Depth: Shallow, Regular, or Deep (controls clarifying questions and research length). Clarifying questions always required before plan creation. "Add to queue" only in Interview, not default Plan. Plan panel shows written plan and todo list. Execution after approval via same engine (fresh process per step). Parallelization when possible; user can disable in settings.

**ELI5 (two toggles, independent).** App-level control is **Interaction Mode (Expert/ELI5)** (default: ELI5 **ON**) and selects tooltip/interviewer copy variants. Chat-level control is **Chat ELI5** (default: **OFF**, Expert/default LLM behavior) and only changes assistant style instructions for that chat thread/session. Both toggles are stored and applied separately. In-scope authored copy must be dual-variant (Expert + ELI5) per `Plans/FinalGUISpec.md` §7.4.0 checklist.

**Permissions: YOLO vs Regular.** YOLO: max permissions, no prompts. Regular: approve once or approve for session. Per session/chat. Do not persist "approve for session" across restarts.

**Message submission (Steer vs Queue).** Steer mode: Enter submits now; Tab or "Queue" queues when busy. Queue mode: Enter queues when busy. Interrupt = send new message (steer). Stop = cancel run, no message. Queued messages above input (max 2, FIFO); each with edit, "Send now," remove. Clear queue. Keyboard shortcuts and command palette. Error state: Retry/Cancel; suggest switch platform/model on failure.

**Slash commands and custom commands.** Built-in reserved: /new, /model, /export, /compact, /stop, /resume, /rewind, /revert, /share. Application- and project-wide; user-customizable near Rules. No conflicting names with built-ins.

**Teach.** Assistant explains how Puppet Master works from docs (REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, platform CLI sections, mode descriptions). The documentation that Teach uses must be built when the rest of the project is built so it is always available. Optional tips/snippets and "How does [X] work?" flows in chat. No separate Teach UI.

**Attachments, web search, extensibility.** Files and photos; paste and drag-drop. Web search with citations (inline + Sources list); full spec in newtools. MCP/plugins same as rest of app. All providers support image attachments as input context; image generation is available via Cursor-native generation (Cursor; no key) or Gemini API-backed generation (non-Cursor; requires a Google API key).

**File Manager, IDE-style editor, and @ mention.** @ in prompt opens autocomplete (recent/modified files, folder nav). Insert path or @path; resolve when building prompt. File Manager: pop-out side window; selecting a file opens it in the **in-app IDE-style editor**. **IDE-style editor (MVP):** center-left File Editor strip; **tabs** for open files (GUI setting **max editor tabs**, default e.g. 20-30, for LRU cap); **split panes** (multiple editor groups); **drag editor out to own window and back** (detach/snap, same as File Manager and Chat); editable content, Save (Ctrl+S), unsaved indicator, line numbers, go-to-line/range, basic syntax highlighting; open from File Manager or from chat. **LSP (MVP):** diagnostics, hover, completion, inlay hints, semantic highlighting, code actions, code lens, signature help; status in status bar; per-server enable/disable and custom servers via Settings > LSP (Plans/LSPSupport.md). **Chat Window LSP (MVP):** diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code blocks in messages with hover and click-to-definition; Problems link from Chat (Plans/LSPSupport.md §5.1, assistant-chat-design §9.1). **Additional LSP enhancements (Plans/LSPSupport.md §9.1):** find references, rename symbol, format document/selection; go to type definition, go to implementation, document links, call hierarchy, folding/selection range; Chat "Fix all," "Rename X to Y," "Where is this used?," "Format file," copy type to chat; optional LSP diagnostics verification gate and LSP snapshot in evidence; Interview "structure of file" via documentSymbol; promote lsp tool when ready. **Terminal:** tabs for multiple terminal sessions in bottom panel. **Browser:** multiple browser instances (no in-browser tabs). **Language/framework presets** (JetBrains-style): tools downloaded when project added or from interview flow; run/debug, modal editing, remote SSH, review/1-click apply, etc. Full list in Plans/FileManager.md §10-§11. **Click to open in editor:** clicking a file path (files-touched strip, "Read:" / "Edited:", or code block filename) in chat opens that file in the editor; when line/range is known, scroll to it. Activity "Read: file" and code blocks open in editor; context files as chips; drag file into chat to attach.

**Chat history search.** Human search across chats/history (UI). Agent search via tool/MCP or index in context pipeline for prior messages/sessions.

**Threads and chat management.** Multiple threads in one chat UI. New thread (plus). Thread state (Working/Completed). Rename, archive, delete (with confirm). Resume and rewind (restore to message). Session share (bundle, no secrets). Copy message (selectable/Copy action). Run-complete notification (other thread) with setting to disable. Max concurrent runs per thread (default 10); per-platform concurrency caps also apply (see FinalGUISpec §7.4.7). Plan panel per thread. Persistence: thread list, messages, queue, plan/todo.

**Context usage display.** Streaming when platform supports. Tokens, context window, rate limits in header/strip/status. Rate limit hit: clear message and option to switch platform/model.

**Activity transparency.** Show search query/scope; bash when not read-only (subject to permissions/FileSafe); files read and changed per turn; thinking/reasoning collapsible toggle; revert last agent edit (Git/restore points).

**Subagents and Crew.** Auto or user-requested subagents. Crew via button or "use a crew." Crew + Plan must work (e.g. execute plan with crew).

**Plan + Crew execution.** Plan + todo; execute with single agent, Crew, or agent+subagents; user or manager chooses. "Execute with crew" after plan. Crew can work from existing or new plan; plan format consumable by both.

**Interview phase UX (chat).** Thought stream; message strip; question UI with suggested options and "Something else" freeform.

**Context and truncation.** Minimize truncation; VBW/GSD-style strategies; context compilation for chat; user-triggered "Compact session"; re-pack on model switch (last N turns + summary, platform_specs limits).

**BrainStorm mode.** Single coordinated Q&A/research then one plan; on execute chat switches to Agent mode. Execute by single agent, crew, or agent+subagents. Subagents can "talk to each other" before merge.

**Documentation audience (AI Overseer).** Interview output (PRD, AGENTS.md, etc.) for AI Overseer: unambiguous, wire-explicit, DRY in generated content; no partially complete components.

**Dashboard warnings and CtAs.** Warnings and Calls to Action on Dashboard; addressable via Assistant (e.g. "approve and continue," "run suggested fix"). HITL: CtA on Dashboard plus new thread with appropriate name. "Continue in Assistant" with run summary and context when orchestrator completes or pauses.

**Live testing tools and hot reload.** Assistant can request "start hot reload dev mode" or "run tests in watch mode"; results in IDE panes.


#### Scan additions (auto-import: chat/assistant)
##### Plans/Multi-Account.md
- **Account list with status chips.** Config view lists accounts with active indicator, usage, cooldown/rate-limit, auth chip (Multi-Account §9.2).
- **Account reorder.** Optional reorder affecting next-in-order selection (Multi-Account §9.2).
- **Add account UI flow.** Platform login flow creating new profile/config dir and registry entry (Multi-Account §9.1).
- **Manual path controls for CLI tools.** Manual path checkbox + native file picker for Cursor/Claude rows (Multi-Account §9.1).
- **Per-account usage bars.** Usage view shows 5h/7d usage per account with reset times (Multi-Account §9.3).
- **Provider-specific usage/auth behaviors.** Detailed per-provider usage/auth API behaviors for Claude/Codex/Gemini/Copilot/Cursor (Multi-Account §6).
- **Remove account UI flow.** Remove account with confirmation when active (Multi-Account §9.1).
- **Set active / use for next run.** Control to designate active account or just for next run (Multi-Account §9.2).
- **Setup/Doctor multi-account visibility contract.** Setup and Doctor show consistent per-platform multi-account summaries (active, count, cooldown, auth freshness) (Multi-Account §9.1).
- **Tool readiness integration in Setup.** Setup/Doctor show install state rows for Cursor CLI/Claude CLI/Playwright runtime (Multi-Account §9.1).

##### Plans/Personas.md
- **Global persona storage layout.** Store as ~/.config/puppet-master/personas/<id>/PERSONA.md (Personas §2.2).
- **Persona YAML frontmatter schema.** Frontmatter fields incl default_platform/default_model/default_variant/temperature/top_p/reasoning_effort/default_skill_refs/disabled_plugins/preferred_tools/discouraged_tools/tool_usage_guidance/aliases/tags (Personas §3.1-3.2; Persona Runtime Contract Expansion).
- **Persona context injection pipeline.** Persona markdown body prepended into Instruction Bundle + applies skills/permission profile (Personas §5.2).
- **Persona create/edit form.** GUI editor fields: id/name/description/default_mode/default_permissions_profile/default_platform/default_model/default_variant/temperature/top_p/reasoning_effort/default_skill_refs/preferred_tools/discouraged_tools/tool_usage_guidance/aliases/tags + markdown body (Personas §4.1; Persona Runtime Contract Expansion).
- **Persona resolution order.** Project-local overrides global; warn on unresolved persona selection (Personas §2.3).
- **Persona scope selector.** Choose project-local vs global scope for persona storage (Personas §4.1).
- **Persona validation rules.** ID regex, folder-name matching, reserved IDs, blocking save on validation errors (Personas §3.3/§6).
- **Personas management UI.** Settings card to list/create/edit/delete personas with schema validation (Personas §4.1).
- **Project-local persona storage layout.** Store as .puppet-master/personas/<id>/PERSONA.md (Personas §2.1).
- **Reserved persona ID enforcement.** Reject reserved IDs (e.g., explorer/researcher) in creation/selection logic (Personas §6).
- **Built-in collaboration/research personas.** First-class built-ins include collaborator, general-purpose, explorer, researcher, and deep-researcher, with explorer replacing stale explore naming (Personas Runtime Contract Expansion).
- **Auto/manual/hybrid persona mode.** Major surfaces support manual, auto, and hybrid Persona selection modes with visible effective Persona output (Personas §10.10).
- **Natural-language persona invocation.** Users can summon Personas via phrasing like "Use Explorer", "Switch to Collaborator", or "Be a Rust engineer", with alias/fuzzy matching and scoped overrides (Personas §10.9).
- **Requested vs effective persona runtime state.** Runs/sub-runs/phases/tiers record requested_persona, effective_persona, selection source/reason, and applied/skipped Persona controls (Personas §10.11).

##### Plans/assistant-chat-design.md
- **Context circle pop-out + compact now.** Context usage UI with pop-out detailed breakdown and a "Compact Now" action (Assistant chat design §25).
- **Per-pass validation model/provider selectors.** Settings UI to select provider+model per validation pass (Pass 1/2/3) with audit mirroring to reports (Assistant chat design §26).
- **Chat Persona mode + effective Persona display.** Chat supports manual/auto/hybrid Persona modes and must always show effective Persona + selection reason instead of opaque Auto state (Assistant chat design §27).
- **Natural-language Persona summons in chat.** Chat recognizes explicit requests like "Use Explorer" or "Answer as a technical writer" as Persona overrides with turn/session scope semantics (Assistant chat design §27.3).
- **Chat Persona aliases and fuzzy matching.** Persona requests resolve through canonical IDs, display names, aliases, and normalized natural-language forms (Assistant chat design §27.4).
- **Subagent blocks show effective Persona/model/platform.** In-thread subagent blocks display effective Persona, platform, model, and skipped unsupported Persona controls when relevant (Assistant chat design §27.6-§27.7).
- **Thread attention_required + clarification requests.** Thread state attention_required with structured clarification_request forms (yes/no, single/multi-choice, free text) and bounded clarification loops (Assistant chat design §11).

##### Plans/assistant-memory-subsystem.md
- **Deterministic memory verification.** Auto/manual verification rules tied to evidence (build/test/commits/artifacts), with verified-only injection defaults (Assistant memory subsystem verification).
- **Evidence-backed memory gists.** MemoryGist model with claims, verification states, evidence refs, decay/activation scoring, and capsule assembly (Assistant memory subsystem).
- **Memory gist review UI.** GUI panel to filter/verify/edit/pin/discard gists and manage token budgets + maintenance ops (Assistant memory subsystem UI).

##### Plans/human-in-the-loop.md
- **HITL approve/reject button label contract.** Deterministic button labels and reject CTAs (Approve & Continue / Reject / Cancel Run etc.) (HITL Button Labels).
- **HITL checkpoint/approval persistence schema.** Persist awaiting_approval/approved/rejected state in redb for recovery (HITL redb).
- **HITL seglog event emission.** Emit explicit events for HITL pauses/approvals in seglog ledger (HITL Implementation Hooks).
- **HITL vs PAUSE.md coexistence.** HITL gates and pause-file mechanism are independent and can coexist (HITL relation to existing pause).
- **Optional interview-phase HITL gates.** Future extension: HITL gates for interview flow phases with separate setting (HITL Optional Interview).
- **Run resumption on restore while paused.** On reopen, run remains waiting for approval until user acts (HITL hooks).
- **Tier-boundary HITL semantics.** Explicit phase/task/subtask boundary semantics for approval pause points after end verification (HITL Tier Boundaries).
---

### 3. GUI layout and shell (Composergui6 / Plans/FinalGUISpec.md)

**Master layout.** IDE shell: title bar (28px), activity bar (48px), primary content (flex), side panels (left and right, 240-480px resizable), bottom panel (120-300px collapsible), status bar (24px). Retro-futuristic: paper texture, pixel grid, hard shadows, Orbitron/Rajdhani, neon accents.

**Zones.** Title bar: app name, project dropdown, theme, settings. Activity bar: icon-only vertical nav; reorderable. File Manager: left default; tree, search; detach, dock left/right, snap. **File Editor (IDE-style):** center-left between File Manager and Dashboard; tabs for open files; editable buffers, Save, line numbers, go-to-line/range, syntax highlighting; collapsible. Clicking a file path or code block in chat opens the file here. Dashboard: center; top half = monitoring widgets (orchestrator, progress, budgets, CtAs); bottom half = 4-way terminal grid (2×2), user-adjustable splitters. Chat: right default; thread list + message area; detach, dock left/right, snap. Status bar: mode, platform/model, context usage, notifications.

**File Manager panel.** Header (title, refresh, pop-out), search, file tree (virtualized), optional Git status strip. Selecting a file opens it in the **IDE-style editor** (File Editor strip). Detach/snap same as Chat; default dock left. Integration with Chat: @ opens file picker; context files as chips; **clicking a file path or code block in chat opens that file in the editor** (and scrolls to line/range when known); drag file into chat.

**Chat panel layout.** Header (CHAT, new thread, menu, pop out) → mode tabs (Ask, Plan, Interview, BrainStorm, Crew) → thread selector → **context circle** (OpenCode-style: usage % for thread; hover = tokens/usage %/cost; click = Usage tab for that thread) → thread list adjacent to message area (messages, queue, input, footer). Virtualized message stream; queued messages (max 2); input with @ and attach; **footer: platform dropdown, model dropdown (customizable list, OpenCode-style), reasoning/effort when platform supports it**, context usage. Plan panel when in Plan mode; activity badges. Responsive: narrow width abbreviates tabs; thread list can collapse to dropdown or icon.

**User-rearrangeable layout.** Dashboard widget cards (drag, 2-4 col grid); activity bar icon reorder and separator; side panel left/right; bottom panel tab order. Terminal 2×2 grid with user-adjustable splitters. Not on every screen (simple dialogs fixed). Persistence in redb: ui_layout, dashboard_layout, activity_bar_order.

**Detach/snap behavior.** State machine: Docked (side, width) ↔ Floating (window_id, position, size). Undock: double-click title, drag, or "Pop out." Snap zones (e.g. 25px from main window edge) with visual cue (accent strip). Close floating window → docked (collapsed or last side). Slint: one window per root component; floating panels separate components/windows; shared state via Rust bridge.

**Themes.** Light and Dark (retro): paper texture, pixel grid, scanlines, Orbitron/Rajdhani, palette (PAPER_CREAM, PAPER_DARK, ELECTRIC_BLUE, ACID_LIME, etc.), 2-3px borders, hard shadow. Basic: flat background, no texture/grid/scanlines, system sans-serif, +1px font sizes, line-height 1.6, 1px borders, 4px radius, muted accents (WCAG AA). Theme switch: live for colors/spacing/borders; restart for font family.

**Retro preservation.** Pixel grid and scanline overlays conditional on theme. Fonts: Orbitron (display), Rajdhani (UI). Palette from puppet-master-rs theme. Hard shadows, 2-3px borders; crosshatch/panel styling.

**Navigation.** Activity bar 6-8 icons by group (Home, Run, Config, Health, Data, Chat, Files). Click = default page; long-press/right-click = popover sub-menu; active = 3px left accent. Command palette Ctrl+P / Ctrl+K (fuzzy search pages, commands, settings). Breadcrumb "Group > Page" at top of content. Keyboard shortcuts (Ctrl+1-5, Ctrl+Shift+C/E/`, Ctrl+P/K, Ctrl+N, Ctrl+,).

**Bottom panel.** Tabs: Terminal, Problems, Output, Ports. Resizable 120-300px. Terminal = agent stdout/stderr; **Problems** = LSP diagnostics (MVP) (file, line, message, severity, source; click to open in editor -- Plans/LSPSupport.md, FinalGUISpec §7.20). Output = app logs. Collapse to tab bar; height persisted.

**Settings > LSP (LSP tab).** LSP is **MVP (required)** for desktop release. Full GUI for Language Server Protocol (Plans/LSPSupport.md, FinalGUISpec §7.4.2): **Disable automatic LSP server downloads** (global toggle, default off); **built-in LSP servers** list (all from OpenCode-aligned table) with **Enable** per server (all on by default) and per-server **Environment variables** and **Initialization options**; **Custom LSP servers** (add/edit/remove: name, command, extensions, env, initialization). Persisted in app config; optional project overrides.

**Migration from Iced.** Mapping of current views to new locations: Dashboard, Projects, Wizard, Interview, Config, Setup, Login, Settings, Doctor, Coverage, Tiers, Evidence, Metrics, History, Ledger, Memory; new Chat side panel, File Manager tab, Terminal/Output in bottom panel.


#### Scan additions (auto-import: GUI/layout)
##### Plans/FileManager.md
- **Call hierarchy view.** Incoming/outgoing call hierarchy tree view (FileManager §10.10.7).
- **Color picker for literals.** Swatches + interactive edits for color literals (FileManager §10.10.7).
- **Custom review rules.** Project-level automated code review rules stored in .puppet-master/review-rules (FileManager §10.8).
- **Editor diff view.** Inline/side-by-side diff (buffer vs disk/branches) with revert integration (FileManager §10.9).
- **Editor minimap.** Right-gutter minimap for quick navigation (FileManager §10.1).
- **External drag-and-drop to file manager.** Copy/move between OS and file tree with conflict handling (FileManager §1.1).
- **File watcher invalidation.** Auto-refresh tree on disk changes with optional watch toggle (FileManager §10.7).
- **Git status badges in file tree.** Status badges (M/A/D/R/U/?) integrated into tree (FileManager §13).
- **Semantic folding.** Semantic region folding via LSP (FileManager §10.10.7).
- **Session-scoped editor view state.** Per-thread cursor/scroll/selection state with restore prompt (FileManager §10.7).
- **Snippet/template expansion.** User/preset snippets with triggers/shortcuts (FileManager §10.9).
- **Sticky scroll.** Keep scope headers visible while scrolling (FileManager §10.1).
- **Visual design sidebar.** CSS/HTML drag-and-drop layout control with one-click apply (FileManager §10.6).

##### Plans/FinalGUISpec.md
- **Agent activity pane.** Read-only streaming subagent output pane with virtualization constraints (FinalGUISpec §7.19).
- **Bottom panel multi-tool suite.** Terminal/Problems/Output/Ports/Browser/Debug integrated bottom panel with hot-reload and inspect modes (FinalGUISpec §7.20).
- **Embedded document pane w/ inline notes.** Live multi-doc preview with status badges + highlight/anchored inline notes + targeted resubmit-with-notes flow (FinalGUISpec §7.19-7.19.1).
- **File manager drag-drop + conflict dialogs.** Explicit UI contract for drag/drop + conflict resolution dialogs in file manager panel (FinalGUISpec §7.17).
- **Persona editor compatibility matrix.** Persona editor shows supported / partially supported / unsupported control state per provider (Claude Code, Cursor CLI, OpenCode, Direct/API) (FinalGUISpec §17.1).
- **Persona runtime control editor fields.** GUI support for default_platform/default_model/default_variant/temperature/top_p/reasoning_effort plus tool guidance and aliases (FinalGUISpec §17.2).
- **Surface-level Persona controls.** Chat, Interview, Requirements Builder, Orchestrator, and Multi-Pass expose Persona mode, effective Persona, platform/model display, selection reason, and override/lock controls (FinalGUISpec §17.4-§17.5).
- **Provider-gap disclosure in UI.** GUI must never imply unsupported Persona controls were honored; skipped controls are disclosed inline, via tooltips, or in run/history details (FinalGUISpec §17.7).
- **SSH remote file integration.** Remote file editing via SFTP with connection badge, offline resilience, conflict UI, and reconnect actions (FinalGUISpec §7.18).
- **Slash command catalog.** Reserved slash commands list and behavior contract (FinalGUISpec §7.16.2).
- **Usage page view.** Dedicated Usage view with quota summary and tool usage widgets (FinalGUISpec §7.8).
- **Web search UI with inline citations.** Chat web search with numbered inline citations + sources list UI (FinalGUISpec §7.16.1).

##### Plans/GUI_Rebuild_Requirements_Checklist.md
- **Context usage ring pop-out + compact now.** Enhanced context usage UI including "Compact Now" and detailed pop-out view (Checklist; assistant-chat-design §25).
- **Cross-cutting widget system.** Unified widget catalog with grid resizing defaults and layout persistence (Checklist; references Widget_System).
- **Docker runtime + DockerHub settings.** Advanced settings for docker runtime defaults, registry auth, and publish policy (Checklist; FinalGUISpec/newtools refs).
- **GitHub Actions generation settings.** Settings + templates + preview/apply flow for workflow generation (Checklist; FinalGUISpec/newtools refs).
- **Node graph display (DAG) view contract.** Airflow-style DAG view with detail panel and layout presets (Checklist; references Run_Graph_View).
- **Orchestrator single-page with 6 tabs.** Orchestrator page as single surface with Progress/Tiers/Node Graph/Evidence/History/Ledger tabs (Checklist; references Orchestrator_Page).
- **Preview + build controls UI contract.** Dashboard/orchestrator preview/build controls with artifact + session summaries (Checklist; FinalGUISpec §7.2; newtools).
- **Remove experimental settings section.** Explicit removal of Experimental GUI section/config keys/flags in Slint rewrite (Checklist; rewrite memo).
- **UI scaling migration (Iced→Slint).** Use Slint-native scaling; avoid Iced token multiplication scaling (Checklist; FinalGUISpec/rewrite memo).
- **Widget grid dashboard (card→widget migration).** Migrate dashboard from cards to widget grid with layout persistence and add-widget flow (Checklist; references FinalGUISpec Appendix C).

##### Plans/LSPSupport.md
- **Fallback when LSP unavailable.** Heuristic symbol search/no diagnostics plus optional install hint banner (LSPSupport §5).
- **LSP status indicator UI.** Status bar indicator for LSP server state (Initializing/Ready/Error) with server name (LSPSupport §1/§13).
- **LSP timeouts + cancellation.** Configurable request timeouts and client-side cancellation for stale results (LSPSupport §7/§14.4).

##### Plans/Orchestrator_Page.md
- **Agent terminal widget.** widget.agent_terminal live PTY output with ring buffer/virtualization (Orchestrator_Page §10).
- **CTA stack widget.** widget.cta_stack for HITL approvals, interruptions, rate limits, warnings (Orchestrator_Page §4).
- **Completed prose widget.** widget.completed_prose collapsible reverse-chron summaries of completed tiers (Orchestrator_Page §11).
- **Current task widget.** widget.current_task shows active tier objective, elapsed time, platform/model (Orchestrator_Page §4).
- **Evidence browser widget.** widget.evidence_browser with filters/search/detail preview and evidence types (Orchestrator_Page §7).
- **History list widget.** widget.history_list run history table with sortable columns (Orchestrator_Page §8).
- **Ledger table widget.** widget.ledger_table event ledger with token/cost/duration aggregation (Orchestrator_Page §9).
- **Orchestrator status widget.** widget.orchestrator_status run control surface with state badges and preview/build actions (Orchestrator_Page §4).
- **Progress bars widget.** widget.progress_bars shows phase/task/subtask completion bars (Orchestrator_Page §4).
- **Tier tree widget.** widget.tier_tree interactive tree with state badges, acceptance criteria, iteration count (Orchestrator_Page §5).

##### Plans/Run_Graph_View.md
- **Directed edge rendering contract.** Orthogonal routed edges with arrowheads and state-based coloring (Run_Graph_View §4.3).
- **Graph minimap.** Corner minimap with viewport rectangle and click navigation (Run_Graph_View §4.4).
- **Graph node rendering contract.** Node styling/size, status text, icons, and state-based colors (Run_Graph_View §4.1).
- **Large-graph optimization mode.** Level-of-detail fallback rules for 200+ / 500+ node graphs (Run_Graph_View §9.5).
- **Layout presets (5).** Selectable layout algorithms incl grouped-by-phase and critical path (Run_Graph_View §9).
- **Node detail panel sections.** Detail panel with summary/mapping/worker/verifier/activity/usage/HITL/deps/logs (Run_Graph_View §6).
- **Node graph display tab.** Full-page orchestrator tab showing live-updating DAG of plan execution (Run_Graph_View §1.2).
- **Node table + filtering.** Searchable right-panel node table with state filters and quick toggles (Run_Graph_View §5.2).
- **Two-way selection sync.** Graph↔table selection sync with multi-select via modifiers (Run_Graph_View §5.3).
- **Zoom/pan controls + fit-to-screen.** Wheel zoom, drag pan, fit-to-screen, and zoom indicator (Run_Graph_View §4.5).

##### Plans/UI_Command_Catalog.md
- **UI command catalog (cmd.* IDs).** SSOT catalog of cmd.* UICommand IDs across subsystems (GitHub/LSP/Graph/Widgets/Orchestrator/Chat memory) not enumerated in feature-list (UI_Command_Catalog).

##### Plans/UI_Wiring_Rules.md
- **Dispatcher routing boundary enforcement.** Explicit dispatcher boundary enforcing handler registration by command_id (UI_Wiring_Rules).
- **Element-to-command mapping uniqueness.** Schema-validated uniqueness keyed by ui_element_id in wiring matrix (UI_Wiring_Rules).
- **Expected event emission test coverage.** Tests verifying expected_event_types in matrix are actually emitted (UI_Wiring_Rules).
- **Handler location resolution verification.** Verify handler_location paths resolve to real Rust modules (UI_Wiring_Rules).
- **Handler statelessness verification.** Enforce handlers are stateless with respect to UI concerns (UI_Wiring_Rules).
- **Orphan UI element detection.** Detect interactive elements missing wiring matrix entry (UI_Wiring_Rules Rule 2).
- **Orphan UICommand detection.** Detect command IDs with no handler registration (UI_Wiring_Rules Rule 2).
- **UI pure-function constraint verification.** Verify view layer observes state only and never mutates state directly (UI_Wiring_Rules).
- **UICommand correlation_id requirement.** Require unique correlation_id per invocation in UICommand envelope (UI_Wiring_Rules).
- **Unknown command rejection behavior.** Structured error handling for unrecognized command_id (UI_Wiring_Rules §3.3).

##### Plans/Widget_System.md
- **Add-widget flow + searchable catalog overlay.** UI flow to add widgets via searchable catalog overlay with per-page caps (Widget_System: §4 Add-Widget Flow).
- **Layout persistence + migration.** Persist layouts in redb with versioned keys and auto-migrate legacy layouts (Widget_System: §7 Layout Persistence).
- **Per-widget configuration panel.** Standard widget config UI with widget-specific fields and debounced persistence (Widget_System: §5 Widget Configuration).
- **Preconfigured default layouts + reset.** Ship default layouts per page and allow reset with confirmation (Widget_System: §6 Preconfigured Defaults).
- **Responsive grid layout system for widgets.** Grid layout with responsive columns, snap resizing, row height, reflow rules (Widget_System: §3 Grid Layout System).
- **Standard widget chrome/header contract.** Uniform widget header (drag handle/title/gear/close) and themed content styling (Widget_System: §9 Widget Chrome).
- **Widget UICommand IDs.** Stable cmd.widget.* command IDs for add/remove/move/resize/config/reset_layout (Widget_System: §11 UICommand IDs).
- **Widget accessibility + keyboard navigation.** Keyboard navigation order, resize shortcuts, accessible roles/labels, screenreader announcements (Widget_System: §10 Accessibility).
- **Widget catalog system.** Canonical registry of widget types with stable IDs, metadata, page hosting rules (Widget_System: §2 Widget Catalog).
- **Widget data contracts (push vs pull).** Formal push/pull widget data source mapping and update mechanics (Widget_System: §8 Widget Data Contracts).
---

### 4. Orchestration and subagents

**Automatic task decomposition and orchestration flow.** Session-level prompt: assess → understand → decompose → act → verify. Trivial tasks (1-2 steps) proceed directly; complex (3+ steps) explicit plan → execute → verify. Optional role hints (planner, implementer, reviewer). Single canonical prompt; composition with rules pipeline; platform-compatible injection. No new tiers.

**Tier-level subagent strategy.** Phase: project-manager (default), architect-reviewer, product-manager; parallel possible. Task: by language (rust-engineer, python-pro, javascript-pro, etc.), domain (backend-, frontend-, fullstack-developer, etc.), framework (react-specialist, vue-expert, etc.); priority language → domain → framework; fallback fullstack-developer. Subtask: by type (code-reviewer, test-automator, technical-writer, etc.) and inherited task context. Iteration: by state and error patterns (compilation → debugger, test failure → test-automator + debugger, etc.). ProjectContext (languages, frameworks, domain, task_type, error_patterns); TierContext; SubagentSelector (detect_language, select_for_tier). Plan mode (our own, not provider CLI built-in): default true for all tiers; config and GUI toggle; Cursor --mode=plan, Claude --permission-mode plan; Gemini is Direct-provider (no CLI plan-mode flags).

**Background/async agents.** Multiple parallel runs with bounded queue. Git branch isolation per run (stash, branch, diff/merge). Output isolation; merge conflict detection. Queue manager (Rust); GUI panel for background runs. Main-flow vs background-flow policy; queue state persistence. Reuse WorktreeGitImprovement and MiscPlan.

**Orchestrator integration.** build_tier_context, select_for_tier (with tier overrides and required/disabled validated via subagent_registry), execute_subagent (sequential or parallel per config), build_subagent_invocation via platform_specs, run_with_cleanup at all runner call sites.

**HITL (human-in-the-loop).** Require explicit human approval at selected tier boundaries (phase, task, subtask). Three independent toggles; off by default. Pause after end verification at that tier; before advancing. GUI: one place (Orchestrator/Wizard/Dashboard settings). "Approve & continue" to advance; reject/cancel semantics at implementation. Dashboard CtAs when paused; addressable via Assistant or direct control. Recovery: if app closes while paused, on restore run stays "waiting for approval."


#### Scan additions (auto-import: orchestration)
##### Plans/Run_Modes.md
- **Budget: max_same_shell_failure.** Enforce per-run retry ceiling for repeated shell failures (Run_Modes §4).
- **Budget: max_write_thrashing.** Enforce per-run write-thrashing ceiling for same-file writes (Run_Modes §4).
- **DAE end-of-run scans.** Mandatory end-of-run scans: FileSafe audit, security-filter scan, diff reconciliation (Run_Modes §5.4).
- **DAE strategy (delegated agent execution).** DAE: provider executes tools in jailed workspace with enforcement/reconciliation (Run_Modes §2.2).
- **HTE strategy (hosted tool execution).** HTE: Puppet Master executes tools; provider plans only with zero delegated tool execution (Run_Modes §2.1).
- **Kill condition: hte_tool_observed.** Terminate if tool_use observed in HTE provider stream (Run_Modes §5.2).
- **Kill condition: shell_failure.** DAE terminate if same shell command fails 3+ consecutive times (Run_Modes §5.3).
- **Kill condition: write_thrash.** DAE terminate if same file written >5 times in 10 minutes (Run_Modes §5.3).
- **Mode-specific context compilation deltas.** Ask/plan read-only vs regular/yolo full context with rotation rules (Run_Modes §7).
- **Mode→strategy resolution algorithm.** Deterministic mapping from UI/config/policy to strategy for ask/plan/regular/yolo (Run_Modes §3).

##### Plans/orchestrator-subagent-integration.md
- **Autonomous QA loop pattern integration.** Integrate autonomous test/QA feedback loops into tier execution (orchestrator-subagent-integration).
- **BeforeTier/AfterTier lifecycle hooks.** Hook-based lifecycle middleware for tier boundaries (orchestrator-subagent-integration).
- **Error-pattern-based subagent escalation.** Escalate/select subagents based on detected error patterns (compile/test/security/perf) (orchestrator-subagent-integration).
- **LSP diagnostics-based subagent bias.** Bias subagent selection using current LSP diagnostics for in-scope files (orchestrator-subagent-integration).
- **Overseer AI role in orchestrator.** Explicit Overseer role coordinating tier execution (orchestrator-subagent-integration).
- **Platform capability manager.** Dynamic capability introspection + gating per platform for subagent features (orchestrator-subagent-integration).
- **Puppet Master crews.** Crew-based multi-agent coordination on the same tier with shared messaging (orchestrator-subagent-integration).
- **Tier-level effective Persona/runtime state.** Each tier run records requested/effective Persona, selection reason, requested/effective platform/model/variant, and applied/skipped Persona controls (orchestrator Persona addendum).
- **Tier auto Persona switching without new tiers.** Orchestrator can shift between planning/execution/review Personas inside existing Phase/Task/Subtask/Iteration structure; Iteration remains the lowest tier (orchestrator Persona addendum).
- **Registry normalization to explorer.** Canonical registry and plan language standardize on explorer, not stale explore naming (orchestrator Persona addendum).
- **Sharded-only plan graph consumption.** Orchestrator consumes validated sharded-only plan graph (not monolithic) (orchestrator-subagent-integration).
- **Start/end verification framework.** Start verification (wiring/readiness) and end verification (quality) at tier boundaries (orchestrator-subagent-integration).
- **Tier-level config-wiring validation.** Validate platform/model/effort wiring per tier at start of execution (orchestrator-subagent-integration).
---

### 5. Interview and wizard

**Interview subagent integration.** Phase assignments: Scope & Goals → product-manager; Architecture → architect-reviewer; Product/UX → ux-researcher; Data → database-administrator; Security → security-auditor, compliance-auditor; Deployment → devops-engineer, deployment-engineer; Performance → performance-engineer; Testing → qa-expert, test-automator. Cross-phase: technical-writer, knowledge-synthesizer, debugger, code-reviewer, context-manager, explorer, requirements-quality-reviewer. **42 subagents/personas** (canonical list in orchestrator-subagent-integration.md §4; task tool validates against this list per Tools.md §3.6). SubagentConfig owns phase/research/validation/document toggles plus phase_subagents and phase_secondary_subagents in InterviewOrchestratorConfig.

**Research engine and validation.** BeforeResearch/DuringResearch/AfterResearch; persist results, update phase context. BeforeValidation/DuringValidation/AfterValidation; remediation loop for Critical/Major (max retries, retry on severity). write_phase_document_with_subagent; write_prd_with_crew_recommendations.

**Document generation.** Phase docs, PRD, AGENTS.md for target projects (technology/version constraints, DRY Method, critical-first, size budget, linked docs). Convention templates by stack. Preserve sections when agents update.

**Chain-wizard flexibility: four intents.** New project (greenfield; full product, full interview, new repo, full PRD). Fork & evolve (upstream URL; delta requirements, delta interview, fork, delta PRD). Enhance/rewrite/add (existing project new to PM; delta scope, delta interview, same dir, delta PRD). Contribute (PR) (upstream; feature/fix scope, light interview, fork, branch, PR). State: store selected intent in app state and optionally .puppet-master/; pass to Interview and start chain.

**Requirements step.** Single prompt "Provide your Requirements Document(s)" with: (1) upload single/multiple files, (2) Requirements Doc Builder (opens Assistant with context; user triggers "Done -- hand off to Interview"; output to .puppet-master/requirements/). Framing text varies by intent. Multiple uploads; formats md, pdf, txt, docx; canonical input from all uploads + Builder; storage .puppet-master/requirements/.

**Adaptive interview phases.** Phase selector: AI or phase manager decides which phases to cut, shorten, or double down from intent and early context. Output: phase_id + depth (full | short | skip); optional reorder. Stored in interview state. Defaults: full intent → all full; Contribute → minimal set.

**Project setup and GitHub.** New project: optional "Create GitHub repo" (repo name, visibility, description, .gitignore, license, default branch); GitHub HTTPS API provider flow only. Auth is realm-split: `github_api` (repo/fork/PR API operations) and `copilot_github` (Copilot provider auth realm). Fork & evolve / Contribute: upstream repo; "Create fork for me" or "I'll create fork myself"; clone fork to project path; optional upstream remote. PR start: fork → clone → create feature branch. PR finish: commit, push, open PR (GitHub HTTPS API); "I'll commit and open PR myself" with instructions. Canonical GitHub flows: `Plans/GitHub_API_Auth_and_Flows.md`. Integration with WorktreeGitImprovement and MiscPlan (branch naming, PR body, no secrets).


#### Scan additions (auto-import: interview/wizard)
##### Plans/chain-wizard-flexibility.md
- **Contract unification handoff.** Explicit Requirements → Contracts → Plan → Execution handoff with end-of-interview contract unification pass (Contract layer section).
- **Intent-based workflows.** Wizard/interview flow adapts by intent (New Project / Fork & Evolve / Enhance / Contribute PR) (Intent-based workflows section).
- **No-wizard project management flows.** Project flows (add existing / create local / create GitHub repo) without mandatory chain wizard; wizard can be deferred (No-wizard flows section).
- **Requirements doc builder + review cycle.** Assistant generates requirements doc with optional multi-agent review cycle before user approval (Requirements/doc builder sections).
- **Requirements Builder Persona strategy.** Builder stages map to Personas: Collaborator for intake/clarification, Technical Writer for drafting, domain Personas for specialized fragments, and reviewer Personas for quality/final review (Requirements Builder Persona Strategy Addendum).
- **Per-stage/pass Persona + model selection in Builder.** Requirements Builder supports Persona/platform/model selection by stage or pass with capability-aware fallback and UI visibility of effective runtime choices (Requirements Builder Persona Strategy Addendum).
- **Three-pass canonical validation.** Mandatory multi-pass validation sweep (Document creation → docs+alignment → canonical-only) after contract completion (Three-pass canonical validation section).

##### Plans/interview-subagent-integration.md
- **Interview crews and communication enhancements.** Interview-phase crews, crew-aware plan generation, cross-phase coordination, research crews for tool discovery (Interview subagent integration crews section).
- **Interview lifecycle + quality enhancements.** BeforePhase/AfterPhase hooks, structured handoff validation, cross-session memory, remediation loops (Interview subagent integration lifecycle section).
- **Interview tab GUI gaps widgets.** Interview tab progress/activity visibility for doc creation and multi-pass review (Interview subagent integration GUI gaps).
- **Interview stage-based Persona strategy.** Interview distinguishes questioning, research, validation, drafting, and review Personas; Collaborator is the default questioning Persona and Technical Writer is the default drafting Persona (Interview Persona Stage Strategy Addendum).
- **GUI/UI/UX Interview model preference.** GUI/UI/UX interview work may prefer Gemini by default when available/configured, while remaining user-adjustable and capability-aware (Interview Persona Stage Strategy Addendum).
- **Interview effective Persona/model/platform visibility.** Interview activity panes and chat surfaces show effective Persona, selection reason, effective platform/model, and skipped unsupported Persona controls (Interview Persona Stage Strategy Addendum).
- **Platform-specific subagent invocation wrappers.** Platform-specific invocation wrapper/compat layer and limitations/workarounds (Interview subagent integration invocation).
- **Subagent file management (agent discovery).** Discovery/import module for provider-native agent files (.cursor/agents, .claude/agents, etc.) integrated into interview orchestration; provider-native files are seed material only, while Puppet Master Personas remain the canonical runtime source (Interview subagent integration file management).
- **Testing strategy for subagent integration.** Tests for file management, platform invocation, and integration scenarios (Interview subagent integration testing).
- **User-project output contract (sharded plan_graph).** Canonical output contract crosswalk, event model updates, and validation refs for user artifacts (Interview subagent integration output contract).
---

### 6. Rules, context, and safety

**Agent rules context.** Application-level rules (e.g. "Always use Context7 MCP") apply to every agent everywhere; stored at application level. Project-level rules (e.g. "Always use DRY Method") apply to every agent on that project; stored at project root (.puppet-master-rules.md, PROJECT_RULES.md, or .puppet-master/project-rules.md). Single rules pipeline: get_agent_rules_context(application_config, project_path) returns one formatted block (application + project). Callers: Orchestrator, Interview, Assistant. Order: application first, then project when project path set. GUI: Settings → Application rules; when project selected, Project rules panel. Bootstrap: seed from Puppet Master AGENTS.md if no application rules. Rewrite: single pipeline for providers, tool policy, agent loop; rules injection represented in unified event stream where relevant.

**Tool permissions and FileSafe.** Tool permissions (allow/deny/ask per tool; Plans/Tools.md) are evaluated first; FileSafe (command blocklist, write scope, security filter) runs after for allowed/approved invocations. Single policy entry point recommended: e.g. `may_execute_tool(tool_name, context)` → Allow | Deny | Ask; then FileSafe checks for bash/edit/read. See Tools.md §2.4, §10.6.

**FileSafe Part A -- Command blocklist (BashGuard).** Blocks destructive CLI commands (e.g. migrate:fresh, db:drop, TRUNCATE, git reset --hard, Docker volume prune) before run. Regex patterns from file; case-insensitive. Pattern file resolution: custom path → .puppet-master/destructive-commands.local.txt → bundled config/destructive-commands.txt. Env override PUPPET_MASTER_ALLOW_DESTRUCTIVE=1. Integration: BaseRunner::execute_command before spawn. Event logging (filesafe-events or event log). Config: bash_guard (enabled, allow_destructive, custom_patterns_path); GUI label "Command blocklist."

**FileSafe Part A -- Write scope (FileGuard).** Restricts writes to files declared in the active plan; no writes outside plan scope. Allowed set from request metadata (env, context files, plan). Check in BaseRunner before spawn. Config: file_guard (enabled, strict_mode); GUI label "Write scope."

**FileSafe Part A -- Security filter (SecurityFilter).** Blocks access to sensitive paths (.env*, *secret*, *key*, *.pem, id_rsa, config/secrets.*, etc.). Config: security_filter (enabled, allow_during_interview); GUI label "Security filter."

**FileSafe -- Prompt content checking.** Scan compiled prompt (after context compilation) for destructive commands; extract from code blocks, shell prompts, SQL. Check in platform runner after append_prompt_attachments. Same strategy for all providers.

**FileSafe -- Verification gate integration.** Allow destructive/sensitive operations when request tagged as verification-gate or interview (configurable).

**FileSafe -- Approved-commands whitelist.** Commands from Assistant chat approved by user; stored in FileSafeConfig; BashGuard allows when command matches approved list.

**FileSafe and Assistant YOLO mode.** When YOLO is on, there is no human approval step before tool execution. FileSafe is the primary protection layer for Assistant in YOLO mode. FileSafe settings must be configurable and easy to turn on or off.

**FileSafe Part B -- Context compilation and token efficiency.** Role-specific context compiler: compile_context(phase_id, role, plan_path, working_directory) → .context-{role}.md per role (Phase, Task, Subtask, Iteration). Delta context: "Changed Files (Delta)" from git diff since last phase/commit. Context cache: cache key = paths + mtimes/hashes; skip compile when valid; invalidate on change. Structured handoff schemas: typed JSON for inter-agent messages (phase_progress, task_blocker, etc.). Compaction-aware re-reads: marker file; if absent skip full plan re-read; set on compaction; clear on session start. Skill bundling: parse plan frontmatter skills_used; resolve skill paths; append "Skills Reference" to Task/Iteration context once per phase. Config: context.compiler_enabled, delta_context, context_cache, skill_bundling. Integration: call compiler in platform runner before building prompt.

**Context Compiler Graceful Degradation (Resolved):**
On context compiler failure:
1. **Use stale context** if available (cached result less than 5 minutes old from redb `context:compiled:{project_id}`).
2. If no stale context: **skip context compilation** and proceed with the raw file list (file paths only, no semantic context).
3. Log warning: `context.compiler.degraded` seglog event with failure reason.
4. Never prompt the user for context compiler failures — they are transient infrastructure issues.
5. Config: `context.compiler.stale_cache_ttl_s`, default `300` (5 minutes).

**Hook system.** Events: UserMessageSubmit, PreToolUse, PostToolUse, ContextWarning, CompactionTrigger, SessionStart, SessionEnd, Error. Continue, block, or modify. Hook runner with timeout (e.g. 5s per hook; configurable). PreToolUse hooks can call into FileSafe (Command blocklist) for dangerous-command blocking; one extension point. Config and GUI for hooks per event.

**Auto-compaction and context thresholds.** Warn at usage % (e.g. 75%); auto-compact at threshold; force at critical. Compaction step: summarize + preserve key items (files, decisions, open tasks, errors). Token counting: stream when available, else heuristic. Thresholds configurable; preservation rules. UI: "Compacting..." and context bar. Hooks ContextWarning, CompactionTrigger. Complementary to FileSafe context compiler (conversation compaction vs context compilation).


#### Scan additions (auto-import: rules/safety)
##### Plans/FileSafe.md
- **Chat-approved command whitelist.** User can approve blocked commands in chat and whitelist for future runs (FileSafe §13.4).
- **Delta context section (changed files).** Add Changed Files (Delta) section from git diff to compiled context (FileSafe §14.2).
- **Guard destructive git commands.** Block git reset --hard / force pushes etc. in bash guard (FileSafe §13.1).
- **Prompt SQL-injection pattern detection.** Detect SQL-injection-like prompt patterns (e.g., UNION SELECT/DROP TABLE) (FileSafe §13.2).
- **Rate limiting for blocked commands.** Track repeated guard violations and escalate/lock after thresholds (FileSafe §13.3).

##### Plans/Permissions_System.md
- **Ask-flow semantics once/always/reject.** Distinct ask responses: once (single), always (session rule + cascade), reject (cascade deny) (Permissions_System §6).
- **ELI5/Expert permissions UI toggle.** Permissions UI adapts to Interaction Mode for simplified vs expert views (Permissions_System §10.9).
- **GUI rule editor for permissions.** Interactive rule editor UI (add/delete/reorder, wildcard help) (Permissions_System §10.3).
- **Home expansion + normalization.** Expand ~/$HOME and normalize paths for permission rules (Permissions_System §3.2).
- **Named permission profiles + persona integration.** Named profiles directory and persona default_permissions_profile integration (Permissions_System §9/§10.7).
- **Pattern suggestion + auto-generation.** Derive suggested patterns during always-approve flow with user edit option (Permissions_System §3.4).
- **Permission precedence layers.** Formal layered precedence (mode override/session cache/persona/project/global/default) (Permissions_System §2.4).
- **TOML persistence for permissions.** Global/project TOML persistence locations for permission rules (Permissions_System §9.1).
- **Wildcard pattern syntax + ordering.** Pattern syntax (*,?, space wildcard) with last-match-wins ordering (Permissions_System §3.1).

##### Plans/agent-rules-context.md
- **AGENTS.md light enforcement.** Authoring-time lint + runtime budget enforcement (size/lines/headings) with warnings/blocks and deterministic truncation policy (AGENTS.md Light Enforcement section).
- **Context injection toggles.** User-configurable toggles for Parent Summary / Scoped AGENTS.md / Attempt Journal (Feature Spec section).
- **Tiered context injection bundles.** Tier-specific Instruction/Work/Memory bundle assembly with deterministic scoping and per-tier visibility rules (Feature Spec section).
---

### 7. Usage, recovery, and analytics

**Persistent rate limit and usage visibility.** Always-visible 5h/7d in UI (dashboard, header, or Usage page). Plan type where available. Tier config/setup show usage when selecting platform. Background refresh. State-file-first (usage.jsonl, summary.json); platform APIs augment when configured. Align with usage-feature.md.

**Usage feature (full scope).** Quota and plan visibility (primary); alerts and thresholds (e.g. 80% warning; rate limit hit → clear message, link to Usage); event ledger (platform, operation, tokens, cost, tier/session; filter and export); optional analytics (aggregate by time, platform, project, tier; cost when available; retention). Data sources: usage.jsonl (primary), summary.json (optional), active-subagents/active-agents for enrichment. Per-platform: Cursor API (usage/account only), Copilot GitHub metrics REST API, Claude Admin API + stream-json usage, Gemini Cloud Quotas + error parsing. GUI placement options: dedicated Usage page, or Dashboard + Ledger + quota widget, or compact usage in header + full Usage page. Success criteria: users see 5h/7d and plan without manual command; clear warning on limit; tier config shows current usage. Rewrite: usage as projections/rollups over seglog; durable KV in redb; fast search in Tantivy.

**Multi-Account and Usage page.** Multi-account support: multiple identities per provider, pick-best-by-usage, auto-rotation on rate limit, optional session migrate/resume for Claude; account registry and cooldowns in redb (Plans/Multi-Account.md). Dedicated Usage page is fully widget-composed (grid layout, add-widget flow); Multi-Account widget (`widget.multi_account`) is first-class on Usage and reusable on Dashboard (Plans/usage-feature.md, Plans/Widget_System.md).

**Session and crash recovery.** Periodic snapshots (e.g. 5 min); auto-save (e.g. 30 s). Restore last layout, session, optional message checkpoints. Retention policy. Recovery struct serialization (app phase, project path, orchestrator state, interview phase, window geometry, timestamp). Panic hook (best-effort). Schema version in snapshot. Non-blocking I/O. Config keys. "Restore previous session?" dialog on launch.

**History and rollback (restore points).** Snapshot after each iteration/message (files + content before/after). Rollback = restore files + truncate state. Conflict detection (mtime/hash). Retention (e.g. last 50). Rollback flow with confirmation; optional re-run verification. GUI History/Restore panel. Git alignment. Branching conversations: restore then fork; alternate branches with labels.

**Analytics and usage dashboard.** Aggregate usage by time, project, model/platform. By project: sessions, tokens, cost, last used. **Tool usage widget** on Usage page: per-tool invocation count, latency, error rate from seglog rollups (FinalGUISpec §7.8; Plans/Tools.md). Storage from existing state or redb rollups. "Know where your tokens go" framing. Time range selector; export CSV/JSON. Privacy/local only. Align with usage-feature and state-file-first.


#### Scan additions (auto-import: usage/analytics)
##### Plans/usage-feature.md
- **Alerts history log.** Optional persistent alerts timeline log (e.g., alerts.jsonl) for user review (usage-feature: Enhancement 8).
- **Compact header usage strip.** Optional header strip summarizing key usage (e.g., Cursor 5h / Claude 7d) linking to Usage page (usage-feature: Enhancement 5).
- **Configurable alert thresholds + quiet/dismiss.** User-configurable quota warning thresholds with optional cooldown/quiet period to suppress repeat warnings (usage-feature: Gap 5).
- **Estimated cost display with disclaimer.** Show approximate cost derived from token counts and pricing with explicit disclaimer when provider cost unavailable (usage-feature: Cost when platform doesn't report).
- **Multi-account widget as first-class catalog item.** Dedicated reusable widget for per-platform accounts, active account selection, and cooldown timers (usage-feature: Multi-Account Widget).
- **Per-tier usage breakdown in configuration.** Show per-tier usage metrics in config UI to identify top-consuming tier and adjust settings (usage-feature: Enhancement 3).
- **Per-widget configuration panel (Usage).** Each Usage widget has an independent config panel (time window, platform filters, chart options, columns) with persistent state (usage-feature: Per-Widget Configuration).
- **Platform-specific usage window labels + tooltips.** Show provider-specific window labels (Codex 5h/Claude 7d/etc.) with explanatory tooltips (usage-feature: Problem 4).
- **Reset countdown timer display.** Display “Resets in Xh Ym” for quota windows when reset time is known/derivable (usage-feature: Enhancement 2).
- **Widget-composed Usage page layout.** Usage page as a widget-composed, fully customizable grid with add/remove/move/resize widgets and responsive column behavior (usage-feature: Widget-Composed Page Layout Addendum).
---

### 8. Streaming, protocol, and UI polish

**Protocol normalization (multi-provider streaming).** Single internal stream format (message delta, usage, etc.). One parser/UI pipeline. "Show thinking," "token usage live," "streaming progress" platform-agnostic. Per-platform adapters. Minimal "orchestrator stream" schema (text_delta, thinking_delta, tool_use, tool_result, usage, done, error).

**Stream event visualization and thinking display.** Live stream events as icons/strip; extended thinking in collapsible area. Event types from normalized stream; last N events or sliding window. Accessibility for event strip.

**Bounded buffers and process isolation.** Fixed max size for stream/log buffers (e.g. 10 MB or 1000 lines); drop oldest when full. Process isolation: CLI subprocess only. Shared bounded buffer type and constants (e.g. limits module); document in AGENTS.md.

**Stream timers and segment durations.** Live duration per segment type (Thinking, Bash, Compacting, etc.); short history of last segments. UI "Current: ..." and "Last: ...."

**Interleaved thinking toggle.** Setting to show/hide extended thinking; per-session override. Align with normalized stream.

**Mid-stream token and context updates.** Real-time token count and context % during stream; usage/token-delta events; throttle updates.

**Virtualized conversation/log list.** Virtualized rendering for long lists (e.g. 10k+ items); slice by scroll position; overscan. Reuse for run log, messages, restore-point list.


#### Scan additions (auto-import: streaming/protocol)
##### Plans/CLI_Bridged_Providers.md
- **Auth/UX detection state machine.** Provider auth preflight + in-run error classification mapped to LoggedOut/LoggingIn/LoggedIn/AuthExpired/AuthFailed states (CLI bridged providers auth UX sections).
- **Claude hooks + transcript ingestion.** Ingest Claude Code hooks and transcript JSONL; reconcile with streaming events for usage/tool correlation (CLI bridged providers Claude provider sections).
- **Tool-call reconciler.** Reconciler for malformed/out-of-order/duplicated tool events across stream/hook/transcript sources (CLI bridged providers reconciliation sections).

##### Plans/Provider_OpenCode.md
- **Auth realms split (server vs upstream).** Separate auth realms for server and upstream provider (Provider_OpenCode §5.3).
- **Dynamic model list discovery.** GET /provider models grouped by provider with caching (Provider_OpenCode §7.1-7.2).
- **HTTP+SSE transport.** OpenCode server-bridged transport over HTTP + SSE streaming (Provider_OpenCode §4.2).
- **Health check + preflight auth detection.** GET /global/health and status mapping to auth states (Provider_OpenCode §5.2).
- **No fallback models policy.** Policy: do not hardcode fallback models; error if server unreachable (Provider_OpenCode §7.3).
- **Process isolation via session deletion.** Iteration isolation guarantee by session-per-iteration + deletion (Provider_OpenCode §12).
- **Server discovery + connection config.** Host/port discovery and connection method selection (Provider_OpenCode §5.1).
- **Session lifecycle mapping.** Explicit HTTP session create/delete mapped to run lifecycle (Provider_OpenCode §6.2).
- **Sync vs async invocation shapes.** Sync POST message vs async prompt_async + SSE shapes (Provider_OpenCode §13.1-13.2).
- **Version compatibility tracking.** Record server version and enforce minimum versions (Provider_OpenCode §5.4).

##### Plans/Provider_Stream_Mapping_External_Reference_A2A.md
- **Artifact streaming as text projection pattern.** Pattern for converting incremental artifact updates into text_delta while preserving metadata (A2A §10 Pattern E).
- **Auth-required stream mapping.** Map upstream auth-required transitions into canonical events (A2A §8.4).
- **Deduplication policy for duplicate upstream events.** Rules for deduplicating duplicate upstream events (A2A §8.2).
- **Exactly-one terminal done arbitration.** Rules to emit exactly one terminal done event when upstream emits multiple (A2A §8.8).
- **Input-required pause semantics.** Treat input_required as resumable pause with diagnostics input_required/input_provided (A2A §8.3).
- **Overseer subjective audit protocol instrumentation.** Instrument multi-reviewer audit protocol with consensus/override semantics (A2A §9.1-9.4).
- **Pause/resume continuation without done.** Continuation rules for HITL input without emitting terminal done (A2A §8.3).
- **Raw observation ring buffer retention.** Bounded ring buffer for upstream events with truncation handling (A2A §8.6).
- **Reserved diagnostic instrumentation categories.** Normative reserved diagnostic categories with required detail keys (A2A §5.1-5.2).
- **Tool correlation reconciliation rules.** Synthesize orphaned tool_use/tool_result events and dedup multi-results deterministically (A2A §8.7).
---

### 9. Tools, MCP, and discovery

**Tool permissions.** Per-tool and optional wildcard allow/deny/ask; presets (Read-only, Plan mode, Full). Settings > **Permissions** tab: per-tool list (built-in + MCP-discovered) with permission dropdown; optional wildcard rules (e.g. `mymcp_*: Ask`). Central policy engine applies permission first, then FileSafe (command blocklist, write scope, security filter). Permission data persists via the canonical permissions config/GUI pipeline and the resolved snapshot is loaded at run start. YOLO bypasses ask (approval not prompted); Regular: approve once or for session. Plans/Tools.md (§2, §10 implementation plan); Permissions_System.md; FinalGUISpec §7.4.10.

**Tool usage widget.** Usage page shows per-tool metrics from seglog rollups: tool name, invocation count, latency (e.g. p50/p95), error rate (failed executed calls / total executed calls); optional sort/filter and time window. Canonical windows are `5h`, `24h`, and `7d`; the card also shows rollup freshness / last-updated metadata. Data comes from analytics scan writing `tool_usage.{window}` plus freshness metadata to redb. FinalGUISpec §7.8; storage-plan; Tools.md §8.4.

**newtools -- GUI/testing tool discovery.** Single source of truth: gui_tool_catalog (e.g. interview/gui_tool_catalog.rs or automation/). Per framework: framework ID, display name, detection hints, existing tools (name, description, install/setup, capabilities, doc URL), custom headless default. Research as input only; user always gets catalog-backed options and/or plan for custom headless. Interview flow: GUI stack detection from Architecture; testing phase lookup catalog; options: Playwright (when web), per-framework tools, "Plan/build custom headless GUI tool." Persist generate_playwright_requirements, selected_framework_tools, plan_custom_headless_tool. Test strategy: extend TestStrategyConfig with framework tools and custom headless section.

**Custom headless tool.** Full-featured (like this project): headless execution (e.g. tiny-skia), action catalog, full evidence (timeline, summary, artifacts, manifest). Standard path `.puppet-master/evidence/gui-automation/<run_id>/`; canonical evidence-in-chat layout comes from `Plans/newtools.md` §13. When chosen, tasks cover obtain/set up existing tools and/or plan/implement custom tool; acceptance criteria reference Playwright, framework tools, custom headless, and the canonical evidence/debug-log paths.

**MCP for all providers.** Config and verification for Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini. Canonical settings live in **Settings > Advanced > MCP Configuration**; provider-specific files/flags are derived adapters only when a CLI needs them. Context7 is on by default, API key field is masked, and Save/Test flows must verify provider readiness before a run injects MCP tools. Align with central tool registry/policy engine and Doctor/preflight checks.

**Cited web search.** Single implementation for Assistant, Interview, Orchestrator. Output: inline citations [1],[2] and Sources block (title + URL) using the canonical cited-search result schema. Activity transparency shows the query. Prefer a centrally registered MCP implementation (default server slug `websearch-cited`, tool name `websearch_cited`); support providers (Google, OpenAI, OpenRouter). Config covers enablement, provider/model preference, keys, timeouts, privacy controls, rate limits, auth failures, and no-results behavior.

**Doctor.** Headless tool check when `plan_custom_headless_tool = true`; platform version check per CLI; MCP checks for Context7/provider readiness and cited-search availability; catalog freshness for "catalog as of date X." Doctor/preflight output must distinguish config missing, auth failure, server unreachable, empty tool list, and stale catalog snapshots.

**Capability Introspection (`capabilities.get`).** Internal tool returning the full set of capabilities available to the running Puppet Master instance — both media capabilities (`media.image`, `media.video`, `media.tts`, `media.music`) and provider-tool capabilities (e.g., OpenCode-discovered tools). Each entry includes `enabled`, `disabled_reason`, and `setup_hint`. Assistant and Interviewer call `capabilities.get` when the user asks about available features; when Assistant is operating in the Requirements Doc Builder workflow, the same requirement applies. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§1](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). Registered in tool table: `Plans/Tools.md` §3.1.

**Media Generation (`media.generate` — Image / Video / TTS / Music).** Uniform internal tool for all media generation. Accepts a structured request envelope (`kind`, `prompt`, optional parameters: `count`, `aspect_ratio`, `size`, `resolution`, `duration`, `format`, `voice`, `bpm`, `seed`, `negative_prompt`, `quality`). Backend routing: Cursor-native for images only when Cursor is the active backend (Video/TTS/Music unsupported on Cursor); Gemini media APIs for all kinds on non-Cursor backends (requires Google Gemini API key). Artifacts written to `.puppet-master/artifacts/media/<request_id>/` (artifact paths, not data URIs). Stable error codes (§2.6 of SSOT). Natural-language slot extraction grammar (deterministic regex-based parsing) runs before `media.generate` to produce the request envelope from user prompts. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE), [§3](Plans/Media_Generation_and_Capabilities.md#SLOT-EXTRACTION).

**Per-message model override.** Users can specify a model for a single `media.generate` request inline in their prompt (e.g., "Generate an image using Nano Banana Pro") without changing the persistent model in Settings. The override is ephemeral — it applies only to the current invocation. Resolution: alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. Canonical media model aliases (Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro) are defined in `Plans/Models_System.md` [§6.8](Plans/Models_System.md#MEDIA-ALIASES). Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2.3](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE), `Plans/Models_System.md`.

**Capability picker dropdown.** Composer-area dropdown showing the four media capabilities (Image, Video, TTS, Music). Disabled capabilities are visible but greyed out with a tooltip showing the disabled reason. When a Google API key is missing, a banner/footnote displays "Please provide a free or paid Google API Key." with a "Get API key" link. Clicking an enabled capability inserts a verbatim prompt guiding the user to describe their generation request. Provider-exposed tools (e.g., OpenCode tools) appear in `capabilities.get` output but are NOT part of this media dropdown. Full contract: `Plans/Media_Generation_and_Capabilities.md` [§4](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER), [§5](Plans/Media_Generation_and_Capabilities.md#UI-COPY).


#### Scan additions (auto-import: tools/discovery)
##### Plans/BinaryLocator_Spec.md
- **Binary error taxonomy + UI mapping.** Stable error codes (e.g., NotFound/NotExecutable/BlockedByOSSecurity/Timeout/etc.) mapped to health/install UI states (BinaryLocator spec error taxonomy).
- **BinaryLocator discovery & validation.** Deterministic multi-layer binary discovery + validation (override/PATH/common locations/launchers) with caching and version parsing (BinaryLocator spec).
- **Cursor agent versioned bundle resolution.** Deterministic selection of Cursor agent binary from versioned bundle directories per-OS (BinaryLocator spec probe layers).

##### Plans/Commands_System.md
- **Command storage + override resolution.** Project-local and global command directories with deterministic override/precedence rules (Commands System storage/discovery).
- **Command templates: args/includes/shell-injection.** Template features like $ARGUMENTS/$1, @path includes, and !`shell` expansion integrated with permissions (Commands System templates/permissions).
- **GUI command manager.** GUI surface to create/edit/delete commands, scope selection, dry-run preview, and shortcut bindings (Commands System GUI management).
- **User commands system.** User-authored command presets with YAML frontmatter + template bodies, invocable via slash/command palette (Commands System overview).

##### Plans/Formatters_System.md
- **Built-in formatter catalog.** Built-in formatter support across many ecosystems (Formatters_System §3).
- **Custom formatter definitions.** User-defined formatters with command/env/extensions and $FILE placeholder semantics (Formatters_System §4.3-4.4).
- **Formatter $FILE argument insertion rule.** If $FILE absent in command, append file path as last arg; otherwise substitute (Formatters_System §4.3).
- **Formatter auto-detection.** Auto-detect available formatters via binary checks + config file presence (Formatters_System §3).
- **Formatter error handling + preserve output.** Non-zero exit preserves output and logs a format.error event with stderr/exit code (Formatters_System §2.3).
- **Formatting evidence ledger events.** Record format.applied events and diff metadata to distinguish formatter changes (Formatters_System §2.2).
- **GUI formatter settings tab.** Dedicated GUI tab to manage formatters, scope select, and custom tool entries (Formatters_System §5).
- **Global + project formatter config.** Global config plus per-project override config persistence (Formatters_System §4.5).
- **Per-formatter config fields.** Config fields like disabled/command/environment/extensions with overrides (Formatters_System §4.2).
- **Sequential formatter pipeline.** Run multiple formatters sequentially in registration order after edits (Formatters_System §2.1).

##### Plans/Media_Generation_and_Capabilities.md
- **Disabled-reason precedence ordering.** Deterministic precedence when multiple disabled causes apply (BACKEND_UNSUPPORTED→...→MODEL_UNAVAILABLE) (Media §1.4).
- **Media acceptance criteria suite.** AC-MED01..AC-MED15 covering capabilities.get/media.generate behavior, error codes, storage, and UI compliance (Media §6).
- **Media kind detection + precedence rules.** Pre-processing of control blocks + kind detection via prefixes/keywords/verb fallback and deterministic parameter precedence (Media §3.1-3.3).
- **Media slot-extraction mini-grammar.** Deterministic regex grammar to extract structured media params from prompts (count/aspect/size/duration/format/voice/quality/seed/bpm/negative prompt) (Media §3).
- **Per-field extraction normalization rules.** Detailed per-field regex/normalization for aspect_ratio/duration/voice/BPM/seed/negative_prompt etc. (Media §3.5-3.14).
- **Prompt cleaning after control extraction.** Strip matched control spans and preserve creative prompt text (Media §3.15).

##### Plans/MiscPlan.md
- **Active cleanup operation tracking.** Track active cleanup state in a state file for audit/debugging (MiscPlan §10.6.4).
- **Bulk skill permission by pattern.** Apply permissions to multiple skills matching wildcard patterns with override precedence (MiscPlan §7.11.2).
- **Cleanup coordination via crews.** Crew coordination for cleanup operations, preserving evidence and warning about protected files (MiscPlan §10.5.1).
- **Cleanup dry-run preview.** Optional dry-run/preview listing files to remove before executing cleanup (MiscPlan §9.1.9).
- **Cleanup failure remediation loop.** Automatic retries/escalation with error categorization for cleanup failures (MiscPlan §10.6.5).
- **Cleanup lifecycle hooks.** BeforeCleanup/AfterCleanup hooks tracking cleanup and validating workspace state (MiscPlan §10.6.1).
- **Cross-session cleanup pattern memory.** Persist cleanup patterns/excludes for future optimization (MiscPlan §10.6.3).
- **Keyboard shortcuts editor UI.** GUI to view/edit/reset keyboard shortcuts with search and export/import (MiscPlan §7.7/§7.9).
- **Structured cleanup result schema.** CleanupResult structured output (files_removed, errors, warnings, duration_ms) for validation (MiscPlan §10.6.2).
- **Target-project DRY method seeding.** Interview generates initial AGENTS.md with DRY Method + tech/version constraints for target projects (MiscPlan §1).

##### Plans/Models_System.md
- **Configurable model priority list.** User-configurable model priority ordering array for selection (Models_System §2.1).
- **Model availability refresh action.** Explicit refresh/availability checks at startup/before runs/on-demand (Models_System §4.1).
- **Overflow detection + auto-compaction trigger.** Provider-specific overflow detection patterns that trigger compaction and retry behaviors (Models_System §4.2-4.3).
- **Per-model option overrides.** Model-specific option overrides (temperature/top_p/reasoning_effort) over provider defaults (Models_System §3.2).
- **Provider Persona capability matrix.** Canonical supported / partially_supported / unsupported matrix for Persona prompt/model/variant/effort/temperature/top_p/tool/subagent controls across Claude Code, Cursor CLI, OpenCode, and Direct/API providers (Models_System §10.4).
- **Requested vs effective runtime control state.** Runs persist requested/effective platform/model/variant and effective temperature/top_p/reasoning_effort plus applied/skipped Persona controls (Models_System §10.2-§10.3).
- **Unsupported control disclosure rules.** Persona-requested controls unsupported by the active provider are skipped explicitly and surfaced in editor/runtime UI rather than silently ignored (Models_System §10.5-§10.7).
- **Per-provider model options.** Provider-level default option map (e.g., max_output_tokens, temperature) configurable via provider options (Models_System §3.1).
- **Provider normalization details.** Per-provider message normalization, beta headers, schema transforms, and token enforcement (Models_System §3.4).
- **Standard option fields spec.** Formal supported option fields, types, and defaults (Models_System §3.3).

##### Plans/Plugins_System.md
- **Config-sourced plugin packages.** Plugins.packages config supports package specifiers and file:// URLs for discovery (Plugins_System discovery/storage).
- **Deterministic hook execution order.** Plugin hooks execute in deterministic load-order across runs (Plugins_System load/execution).
- **Hook event catalog.** Defined hook events: tool.execute.before/after, permission.ask, session.start/end, chat.message/params, session.compacting, shell.env, system.prompt.transform (Plugins_System hooks).
- **Hook timeout + error handling.** Hook timeout defaults and panic/error handling semantics with configurable behavior (Plugins_System hook semantics).
- **OpenCode backward-compat mappings.** Compatibility mapping for experimental hook names and prompt injection semantics (Plugins_System baseline/deltas).
- **Per-persona plugin disabling.** Personas can disable plugins via disabled_plugins in persona frontmatter (Plugins_System config/persona integration).
- **PluginContext API.** Standard PluginContext object (register_hook/register_tool/log/data dir, etc.) for plugins (Plugins_System lifecycle).
- **Plugins settings UI (ELI5/Expert).** GUI Plugins tab with ELI5 vs Expert views, timeouts, override flags, and details (Plugins_System GUI).
- **Structured plugin event logging.** Typed events like plugin.loaded/hook.invoked/hook.error/tool.registered, etc. (Plugins_System logging).
- **Tool name collision resolution.** Namespaced aliasing and explicit allow_tool_override rules for plugin tools vs built-ins (Plugins_System tool registration).

##### Plans/Skills_System.md
- **Canonical skill discovery roots.** Deterministic discovery from multiple project/global roots (.puppet-master/.claude/.agents) (Skills_System §3.1).
- **Central skill registry runtime surface.** Runtime registry of discovered skills used by GUI/personas and skill tool resolution (Skills_System §4.1).
- **Invalid skills listed in GUI.** GUI must list invalid skills with validation errors (Skills_System §6).
- **Persona default_skill_refs resolution.** Resolve default_skill_refs at run start; warn on missing refs (Skills_System §4.2).
- **Shadowed skill visibility warnings.** GUI exposes shadowed duplicates (same skill ID) with warnings (Skills_System §3.2).
- **Skill discovery validation.** Validate YAML frontmatter and directory-name-to-skill-id matching during discovery (Skills_System §3.3).
- **Skill source column in GUI.** GUI indicates Project/Global and which root each skill came from (Skills_System §6).
- **skill tool path validation.** skill tool enforces paths under allowed discovery roots (Skills_System §4.3; AC-SK03).

##### Plans/Tools.md
- **Custom tools system.** User/project-defined tools with schema, discovery, and sandboxing (Tools §4).
- **GitHubApiTool (only GitHub HTTPS interface).** Single allowed interface for GitHub HTTPS API calls (Tools §3.7).
- **MCP tool namespacing rules.** Server slug and wildcard matching rules for MCP tool namespacing (Tools §8.6).
- **Per-tool rate limits.** Optional per-tool invocation limits per run/session (Tools §9.2).
- **multiedit tool.** Batch string replacements in a single operation with limits (Tools §3.1).
- **patch tool.** Apply unified diff patches with write-scope validation (Tools §3.1).
- **question tool.** Ask user questions mid-run with options/freeform responses (Tools §3.1).
- **skill tool.** Load skills into context with path validation (Tools §3.1).
- **webfetch tool.** Fetch web content from URL with allowlist/denylist, timeout, and size caps (Tools §3.1).

##### Plans/newtools.md
- **Automation migration contract (Iced→Slint).** Migration boundaries for evidence schema compatibility and backend abstraction (newtools §14.9).
- **Docker runtime + DockerHub contract.** Docker compose orchestration, preflight checks, registry auth/push, settings UI (newtools §14.7).
- **Doctor preflight matrix.** Readiness checks across display runtime/mobile simulators/docker/github actions with failure contracts (newtools §14.10).
- **Evidence-in-chat contract + media rendering.** Schema for gui_automation_manifest + inline media rendering and evidence cards in chat (newtools §13).
- **GitHub Actions generation contract.** Workflow template selection, validation, preview rendering, and generation flows (newtools §14.8).
- **Live visualization execution architecture.** Non-headless automation with real-time status streaming and media capture across platforms (newtools §14).
- **Mobile testing stacks defaults.** Concrete iOS/Android/RN testing defaults with artifact capture strategies (newtools §14.5).
- **Preview/build controls UI contract.** UI command IDs and surfaces for preview/build launch with artifact reporting (newtools §14.6).
- **Research crews for tool discovery.** Multi-agent coordination system for concurrent tool discovery research (newtools §12.7).
- **Tool discovery lifecycle hooks.** BeforeResearch/AfterResearch lifecycle + structured handoff validation + memory persistence for tool choices (newtools §12.8).
---

### 10. Git and worktree

**WorktreeGitImprovement.** Base branch from config.branching.base_branch. active_worktrees persistence: repopulate from list_worktrees() on init/load or fallback worktree_manager.get_worktree_path(tier_id). Merge conflicts: surface worktree path; avoid reusing tier_id until user resolves/discards. Sanitize tier_id and branch name (ref-safe). Branch already exists: check before worktree add -b; if exists use worktree add path branch or safe delete. Detached HEAD: treat missing branch as detached; merge_worktree skip or merge by commit when source_branch empty. worktree_exists: path exists and valid worktree. Recovery when project selected. PR head branch: resolve from worktree when active_worktrees has no entry. merge_worktree: ensure target_branch exists or create/error. Documentation: STATE_FILES subsection on worktrees. Doctor: worktrees check (git worktree list, verify .puppet-master/worktrees, optionally detect_orphaned_worktrees). Optional: re-validate worktree path before building IterationContext.

**Git.** Shared resolution for git binary (path_utils::resolve_git_executable); GitManager and Doctor use it. PR creation uses GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` through the `github_api` realm (independent from `copilot_github`). Branch strategy from config (e.g. branching.strategy); use in create_tier_branch (no hardcoded Feature). Branch naming: single implementation (e.g. BranchStrategyManager); remove duplicate logic in orchestrator. naming_pattern wire into branch name generation or hide and document. Commit format: CommitFormatter::format_iteration_commit for "pm:" convention. git-actions.log align path with REQUIREMENTS and .gitignore policy. Doctor: optional check project dir is repo and basic git works. Empty commit: detect "nothing to commit" and log at debug/info.

**Config wiring (Option B).** At run start build PuppetMasterConfig from current gui_config so run sees latest UI (enable_parallel_execution, branching, etc.) without Save. Branching tab: Enable Git, Auto PR, Branch strategy (MainOnly/Feature/Release); wire Use worktrees, Auto merge on success, Delete on merge; fix/hide naming_pattern. Fields to wire: enable_parallel_execution, enable_git, branching.base_branch, branching.auto_pr, optionally strategy/granularity/naming_pattern. Worktree visibility (optional): list worktrees, "Recover orphaned worktrees" button.


#### Scan additions (auto-import: git/worktrees)
##### Plans/GitHub_API_Auth_and_Flows.md
- **Credential store keying schema.** OS credential store keying/payload schema for GitHub tokens (GitHub auth flows credential storage).
- **Credential-store unavailable fallback mode.** Session-only in-memory token mode when OS store inaccessible; reconnect required after restart (GitHub auth flows).
- **Deterministic device-flow polling.** Polling algorithm handling authorization_pending/slow_down (+5s), expiry deadlines, and response codes (GitHub auth flows device flow section).
- **Failure-state taxonomy + canonical UX copy.** Mapped failure kinds with title/body/actions (GitHub auth flows failure states).
- **GitHub request envelope + rate-limit handling.** Canonical headers + deterministic primary vs secondary rate-limit behavior (GitHub auth flows request envelope).
- **Repo push permission checks.** Pre-PR check for push permissions (API check + fallback to push failure signal) (GitHub auth flows).
- **SSH remote dev server auth context.** Auth behavior considerations for SSH-based development servers (GitHub auth flows stub section).
- **Scope verification + missing-scope UX.** Post-auth scope validation via X-OAuth-Scopes and MissingScopes failure state w/ UI consequences (GitHub auth flows).

##### Plans/GitHub_Integration.md
- **Branch create/switch + stash handling.** Searchable branch switcher, create branch validation, and deterministic stash/discard options (GitHub Integration §A.4).
- **Changes list bulk ops.** Staged/Changes/Untracked groups with bulk stage/unstage/discard and per-file recovery (GitHub Integration §A.2).
- **Commit UI with amend + hook recovery.** Commit form with amend toggle, force-push warnings, and hook failure recovery (GitHub Integration §A.4).
- **Diff preview panel modes.** Side-by-side/unified diff viewer with truncation rules and persisted preferences (GitHub Integration §A.3).
- **Git panel IDE surface.** Full Git UI: status, changes list, diff preview, stage/unstage/commit/push/pull/sync/fetch (GitHub Integration §A).
- **GitHub Actions panel + workflow dispatch.** Runs list/detail, log viewer, download logs, trigger workflow_dispatch with inputs and auto-refresh (GitHub Integration §B.3).
- **GitHub device-code auth UX.** IDE device-code flow UI for github_api realm with OS credential-store-only persistence (GitHub Integration §B.1).
- **No-wizard project management flows.** Add existing / create local / create GitHub repo flows without chain wizard requirement (GitHub Integration §D).
- **PR & issues panel with caching.** PR/issues surfaces with caching/TTL, status columns, and create PR flow (GitHub Integration §B.2).
- **Repo/branch status bar.** Upstream tracking indicators (ahead/behind/diverged/etc.) with repo/branch badges (GitHub Integration §A.1).
- **Reserved UICommand IDs + config keys.** Stable cmd.git/cmd.github/cmd.ssh IDs and config keys reserved for integration panels (GitHub Integration §E-F).
- **SSH remote dev server management.** Add/manage SSH targets, host key verification, status badges, and remote context (GitHub Integration §C).
- **Stash management UI.** Auto-stash with timestamps, stash list dropdown, pop w/ conflict recovery behavior (GitHub Integration §A.4).

##### Plans/WorktreeGitImprovement.md
- **Branch name + tier_id sanitization.** Sanitize tier_id for path safety and sanitize branch names for valid git refs (WorktreeGitImprovement: §2.4).
- **Branching tab GUI wiring.** Branching tab controls (Enable Git, Auto PR, strategy, worktrees toggle, auto-merge, delete-on-merge) wired live without explicit Save (WorktreeGitImprovement: §5.3/Phase 4).
- **Detached HEAD worktree handling.** Treat missing branch as detached; merge logic handles commit-hash-based merges or skips (WorktreeGitImprovement: §2.6).
- **Doctor: worktrees validation check.** Doctor validates worktree state, detects orphans, suggests recovery actions (WorktreeGitImprovement: §2.11).
- **GUI config schema reconciliation at run start.** Resolve mismatch between GuiConfig and PuppetMasterConfig (enable_parallel/strategy/branching) when building run config (WorktreeGitImprovement: §5.1–7.1).
- **GitHub PR creation via HTTPS API realm.** Create PRs using github_api realm (HTTPS API) without relying on GitHub CLI integration (WorktreeGitImprovement: §3.2).
- **Merge conflict worktree recovery UI.** Surface conflicting worktrees, block tier_id reuse until resolved/discarded, and offer recovery UI actions (WorktreeGitImprovement: §2.3).
- **Unified git binary resolution.** Single shared git executable resolution used by GitManager + Doctor for consistency (WorktreeGitImprovement: §3.1).
- **Worktree lifecycle docs in STATE_FILES.** Add STATE_FILES documentation for worktree lifecycle/paths/persistence/recovery mechanics (WorktreeGitImprovement: §2.11).
- **Worktree orphan detection + recovery on project load.** Repopulate active_worktrees from git worktree list and expose recovery UI in Health/project selection (WorktreeGitImprovement: §2.8).
---

### 11. Cleanup and runner contract

**MiscPlan -- Cleanup policy.** Never remove: state files (progress.txt, AGENTS.md, prd.json, etc.); .puppet-master/ except where retention allows pruning; config/discovery under .puppet-master/. May remove: untracked files/dirs in workspace/worktree except allowlisted. Allowlist (DRY:DATA): .puppet-master/, .gitignore, progress.txt, AGENTS.md, prd.json, sensitive patterns, paths.workspace, explicit preserve list; when newtools GUI automation exists: .puppet-master/evidence/gui-automation/. .puppet-master/agent-output/ is clearable by policy. Scope: main repo or worktree path. Mechanism: configurable conservative (known temp/agent-output) vs moderate (git clean -fd with excludes) vs clean ignored (-fdx). Default conservative. Gitignore and security: respect .gitignore; never expose secrets; no git add -f for sensitive paths; cleanup excludes .env, *.pem, etc.; never log/commit/evidence/PR body: tokens, keys, credential contents.

**Runner contract.** prepare_working_directory(work_dir, config): ensure path is git repo; run untracked cleanup only here (git clean -fd with excludes from allowlist); clear agent-output dir when config says; do not reset tracked state unless future config; on failure log warning, continue best-effort. cleanup_after_execution(pid, work_dir, config): terminate process if needed; remove runner temp files only; do not run broad git clean here. run_git_clean_with_excludes(work_dir, clean_untracked, clean_ignored): single helper; uses cleanup_exclude_patterns(); shared git binary. run_with_cleanup(runner, request, config): wrapper prepare → execute → cleanup. All call sites (ExecutionEngine caller, research_engine, start_chain, execute_ai_turn when project known) use wrapper or explicit prepare/cleanup. Runners keep only execute; no prepare/cleanup on PlatformRunner; wrapper is single entry point.

**Module and config.** src/cleanup/: mod.rs, workspace.rs. DRY:DATA allowlist; DRY:FN prepare_working_directory, cleanup_after_execution, run_git_clean_with_excludes, run_with_cleanup. CleanupConfig: untracked, clean_ignored, clear_agent_output, remove_build_artifacts, skip_prepare_for_conversation. IterationContext: cleanup_config; ExecutionEngine gets it and calls prepare/cleanup.

**Agent-output dir.** .puppet-master/agent-output/ (DRY:DATA). Optional run subdirs. Clear in prepare_working_directory when config says; clear contents, keep dir.

**Evidence retention and pruning.** Config: retention_days, retain_last_runs, prune_on_cleanup. prune_evidence_older_than(base_dir, config): DRY:FN; list evidence; remove older than retention; not in cleanup_after_execution hot path.

**Cleanup UX.** Config → Advanced → "Workspace / Cleanup": clean untracked, clean ignored, clear agent-output, remove build artifacts, evidence retention. "Clean workspace now" in Doctor or Advanced: resolve project path from same source as run; run prepare-style run_git_clean_with_excludes; confirmation; optional dry-run (git clean -fd -n) and list. Optional "Clean all worktrees" using worktree list. Widgets: gui-widget-catalog (styled_button, confirm_modal, toggler, etc.).

---

### 12. Extensibility and other

**Plugin and skills extensibility.** Commands, agents/roles, hooks, skills (trigger-based context). Plugin directory (e.g. app data or project .puppet-master/plugins/); manifest (e.g. plugin.json). Loading at startup; invocation by name. Skills: auto-inject when trigger matches (file extension, keyword, regex). GUI Plugins/Extensions section. Bundled default plugin. One-click install from curated catalog: catalog format (id, name, description, type, source URL or bundled path, version); install = copy + enable; updates/uninstall.

**Keyboard-first and command palette.** Shortcuts for major actions (20+). Ctrl/Cmd+P command palette; filtered action list. In-app shortcut docs. Accessibility: focus, screen reader.

**Customizable desktop shortcuts.** GUI (Config → Shortcuts tab or Advanced → Shortcuts) to view, change, and reset keyboard shortcuts for in-app text/composer (defaults: Ctrl+A/E/B/F, Alt+B/F, Ctrl+D/K/U/W, Alt+D, Ctrl+T/G for line/word movement, kill, transpose, cancel). Backend: ShortcutAction, KeyBinding, default_shortcuts (DRY:DATA), build_key_map, GuiConfig.shortcuts; key map wired at app level. Export/import JSON, search/filter in list, shortcut in tooltip/menu label. MiscPlan §7.7, §7.9, §8.8, §7.11.1.

**Agent Skills management.** GUI (Config → Skills tab or Advanced → Skills) to discover, list, add, edit, remove, and set permissions for agent skills (SKILL.md in folders; OpenCode-style discovery paths). Backend: src/skills/ (discovery, load_skill, frontmatter, permissions, list_skills_for_agent); GuiConfig.skill_permissions; first-wins deduplication. Bulk permission by pattern, sort/filter, preview body, last modified, validate all. MiscPlan §7.8, §7.10, §8.9, §7.11.2.

**Database and projections.** Per rewrite: seglog (canonical ledger), redb (durable KV state/projections/settings), Tantivy (full-text search). Queryable history, analytics, and recovery metadata are produced from these; no separate SQLite for run/session/history.

**Branching conversations.** Restore then fork; alternate branches with labels. "Restore and branch" in UI.

**In-app project instructions editor.** Edit AGENTS.md/CLAUDE.md/project rules in-app; optional live markdown preview; save to project root. Support project rules file.

**@ mention system.** @ in prompt opens autocomplete (recent/modified files, folder nav); insert path or @path; resolve when building prompt.

**Multi-tab and multi-window.** Tabs (view + context per tab); multiple windows; optional drag tabs between windows; persist tab list and order.

**Project and session browser.** List projects and per-project sessions/runs; search/filter; optional git status per project; open project or session.

**Instant project switch (OpenCode-style).** Project bar or sidebar; single source of truth for current project; swap context/settings on selection; project list persisted; "Open project..."; what swaps: nav, per-project state, last session per project. Alignment with snapshotting and redb (project_path).

**Built-in browser and click-to-context (Cursor-style).** Launch webapps in-app; click element → send context to Assistant (DOM, attributes, rect). Wry WebView; custom protocol or IPC; modifier or toolbar toggle for capture. Element context schema (tagName, id, className, textContent, role, ariaLabel, rect, parentPath, optional outerHTML; token/size cap). Rust handler → app state → Assistant; "Element sent to chat" toast. Phased: separate window → schema v1 → Assistant integration → optional embedding → polish. Security: validate, sanitize, rate limit.

**Full IDE-style terminal and panes.** Terminal at current project folder (embedded or external). **Terminal tabs:** multiple terminal sessions (new tab, switch, close, optional name); each tab has own cwd and history. Panes: Terminal, Problems, Output, Debug Console, Ports. Single "open terminal at path" helper; project path from app state. See FileManager.md §9.

**Hot reload, live reload, fast iteration.** One-click dev server/watcher; project type detection (Cargo.toml, package.json, etc.); integrated Terminal/Output; state preservation where supported. Assistant-callable ("start hot reload," "run tests in watch"). Project scanners; integrate watchers; error handling → Problems pane.

**Sound effects settings.** Per-event enable/disable and sound selection; user-loaded sounds; built-in + user catalog. Events: Agent, Permissions, Errors, optional HITL/Dev server/Build. Config persistence; accessibility (system silent/reduce motion).

**Updating Puppet Master.** Version visibility; update discovery; upgrade path docs; config/state compatibility across versions.

**Cross-device sync.** Manual export/import + BYOS. Sync payload: config, state, threads, history. Storage options: local/mounted, NAS/SMB/NFS/SFTP/WebDAV, cloud folder; custom config. "Sync now" / "Sync on startup"; conflict policy. No secrets by default; optional encrypted secrets.

**One-click install (no code).** Curated catalog of commands, agents, hooks, skills; install = copy + enable; updates/uninstall; catalog format; default catalog.


#### Scan additions (auto-import: extensibility/other)
##### Plans/newfeatures.md
- **One-click install catalog.** Curated catalog of commands/agents/hooks/skills with install/update/uninstall flows (newfeatures §15.19).
- **Plugin and skills extensibility (plugin dir).** Plugin directory with manifest + startup loading; skills auto-inject on triggers; GUI extensions section (newfeatures §12).
---

