# Import Completeness Checklist

Use this as the closure gate after importing the packet into the new ledger.

- [ ] Loaded manifest `06_SOURCE_MANIFEST.json`.
- [ ] Loaded full source packet `01_FULL_SOURCE_PACKET.md`.
- [ ] Loaded ledger atom rows `02_LEDGER_READY_ATOMS.jsonl` and counted **113** rows.
- [ ] Created one packet/source event for this import.
- [ ] Preserved GUI-first constraint: PM is not building a CLI; terminal lessons are for the built-in GUI terminal/runtime.
- [ ] Preserved all repo scope: OpenCode v1/v2, Cline, Agent Zero, Pi, Codex, Ghostty, Warp, tmux.
- [ ] Every row below is imported or explicitly dispositioned.

## P0

- [ ] `extrepo-20260703-0001` / `P0-TERMINAL-PROTOCOL-MATRIX` — Built-in GUI terminal protocol coverage
- [ ] `extrepo-20260703-0002` / `P0-TERMINAL-OUTPUT-BACKPRESSURE` — No silent terminal output loss
- [ ] `extrepo-20260703-0003` / `P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR` — Accessible terminal text model separate from renderer
- [ ] `extrepo-20260703-0004` / `P0-PLAN-ACT-PERMISSION-BOUNDARY` — Plan/Act/autonomy boundaries must be runtime enforced
- [ ] `extrepo-20260703-0005` / `P0-TOOL-RESULT-SETTLEMENT` — Partial/truncated/nullable provider tool turns cannot count as success
- [ ] `extrepo-20260703-0006` / `P0-PROVIDER-METADATA-REPLAY` — Provider-native reasoning/thinking/message metadata replay
- [ ] `extrepo-20260703-0007` / `P0-HISTORY-STORAGE-CAPS` — Bounded session/history storage
- [ ] `extrepo-20260703-0008` / `P0-RELEASE-MIGRATION-GATE` — Release, installer, migration, and rollback hardening
- [ ] `extrepo-20260703-0021` / `P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH` — Lazy MCP/tool catalog without lossy results
- [ ] `extrepo-20260703-0022` / `P0-HISTORY-ADMISSION-SANITIZATION` — Malformed provider/tool turns must not poison durable history
- [ ] `extrepo-20260703-0023` / `P0-PROVIDER-CAPABILITY-EPOCH` — Provider capability epoch and model-switch sanitizer
- [ ] `extrepo-20260703-0024` / `P0-REASONING-REPLAY-MATRIX` — Cross-provider reasoning/thinking replay/drop matrix
- [ ] `extrepo-20260703-0025` / `P0-MCP-TYPED-PARAM-FIDELITY` — MCP tools/call native JSON type fidelity
- [ ] `extrepo-20260703-0037` / `P0-CONTEXT-EPOCH-BASELINE` — Add ContextEpoch and stable baseline context
- [ ] `extrepo-20260703-0038` / `P0-PROMPT-CACHE-POLICY` — Add provider-neutral prompt cache policy plus provider adapters
- [ ] `extrepo-20260703-0039` / `P0-CACHE-USAGE-ENVELOPE` — Normalize cache usage/read/write metrics
- [ ] `extrepo-20260703-0040` / `P0-VOLATILE-CONTEXT-QUARANTINE` — Separate volatile context from cacheable baseline
- [ ] `extrepo-20260703-0041` / `P0-STREAM-HISTORY-COALESCER` — Prevent streaming partials from becoming durable duplicate history
- [ ] `extrepo-20260703-0042` / `P0-WEBSOCKET-TRANSPORT-POLICY` — Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP
- [ ] `extrepo-20260703-0043` / `P0-WEBSOCKET-SECURITY-BOUNDARIES` — Add WebSocket origin/auth/CSRF/runtime-id security gates
- [ ] `extrepo-20260703-0055` / `P0-AGENT-CONTROL-PLANE-ENVELOPE` — Agent control / autonomy / effort / resource envelope
- [ ] `extrepo-20260703-0056` / `P0-EFFORT-POLICY-SETTLEMENT` — Reasoning/thinking/effort requested-vs-effective
- [ ] `extrepo-20260703-0057` / `P0-SUBAGENT-EXECUTION-CONTRACT` — Subagent lifecycle, model/effort config, and result authority
- [ ] `extrepo-20260703-0058` / `P0-LOOP-BREAKER-TAXONOMY` — Looping / no-progress / spend control
- [ ] `extrepo-20260703-0059` / `P0-MULTIMODAL-INPUT-SETTLEMENT` — Vision/multimodal input admission and fallback
- [ ] `extrepo-20260703-0060` / `P0-PROVIDER-CAPABILITY-EPOCH-2` — Provider/model capability freshness and route-specific support
- [ ] `extrepo-20260703-0061` / `P0-TOOL-CALL-MALFORMATION-GATE` — Malformed/truncated/partial tool-turn admission
- [ ] `extrepo-20260703-0062` / `P0-LOG-REDACTION-BEFORE-WRITE` — Logging, traces, diagnostics, and privacy
- [ ] `extrepo-20260703-0063` / `P0-SYSTEM-RESOURCE-GOVERNOR` — System memory/process/file-watcher/resource management
- [ ] `extrepo-20260703-0074` / `P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN` — AI-assisted CI/release supply-chain attack surface
- [ ] `extrepo-20260703-0075` / `P0-GOAL-SCOPE-SUBAGENT-ISOLATION` — Goal/subagent identity leakage and rogue continuation
- [ ] `extrepo-20260703-0076` / `P0-PROVIDER-EGRESS-HTTP-POLICY` — User-configurable provider endpoint egress, redirect, timeout, and SSRF policy
- [ ] `extrepo-20260703-0077` / `P0-COMMAND-INVOCATION-CONTRACT` — Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command
- [ ] `extrepo-20260703-0078` / `P0-SESSION-TOOL-NAMESPACE-ACTIVATION` — Runtime-valid plugins/tools that are not actually injected into the session
- [ ] `extrepo-20260703-0079` / `P0-ENTITLEMENT-QUOTA-SETTLEMENT` — Provider/product entitlement, quota, credit, subscription, and rate-limit state
- [ ] `extrepo-20260703-0088` / `P0-SESSION-DRAFT-ATTACHMENT-ISOLATION` — Session draft and attachment isolation
- [ ] `extrepo-20260703-0089` / `P0-MCP-LIFECYCLE-RUNTIME-LIVENESS` — MCP lifecycle plus runtime-call liveness
- [ ] `extrepo-20260703-0090` / `P0-COMMAND-APPROVAL-LEASE` — Command approval lease bound to normalized command identity
- [ ] `extrepo-20260703-0091` / `P0-CREDENTIAL-ROUTE-EPOCH` — Credential/account/entitlement route epoch
- [ ] `extrepo-20260703-0092` / `P0-RUNTIME-SURFACE-READINESS-PROBE` — Runtime surface readiness probe
- [ ] `extrepo-20260703-0093` / `P0-CONTEXT-OBJECT-BUDGET` — Context object/media budget and dedupe
- [ ] `extrepo-20260703-0094` / `P0-TOOL-RESULT-TRUTHFULNESS-GATE` — Tool result truthfulness gate
- [ ] `extrepo-20260703-0100` / `context_epoch` — context_epoch
- [ ] `extrepo-20260703-0101` / `prompt_admission_execution` — prompt_admission_execution
- [ ] `extrepo-20260703-0102` / `provider_policy` — provider_policy
- [ ] `extrepo-20260703-0103` / `provider_metadata_replay` — provider_metadata_replay
- [ ] `extrepo-20260703-0104` / `tool_output_retention` — tool_output_retention
- [ ] `extrepo-20260703-0105` / `tool_heartbeat` — tool_heartbeat
- [ ] `extrepo-20260703-0106` / `desktop_version_handshake` — desktop_version_handshake
- [ ] `extrepo-20260703-0107` / `opencode_v2_delta` — opencode_v2_delta

## P1

- [ ] `extrepo-20260703-0009` / `P1-TERMINAL-CLIPBOARD-PASTE-SAFETY` — Clipboard, pasteboard, bracketed paste, OSC 52
- [ ] `extrepo-20260703-0010` / `P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION` — Global keyboard hook isolation
- [ ] `extrepo-20260703-0011` / `P1-TERMINAL-SESSION-PRESERVE-UPDATE` — Terminal session continuity across relaunch/update
- [ ] `extrepo-20260703-0012` / `P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS` — Resource ceilings for indexers/watchers/background agents
- [ ] `extrepo-20260703-0013` / `P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT` — MCP and external agent config import with trust boundaries
- [ ] `extrepo-20260703-0014` / `P1-CONTEXT-SKILL-BUDGETS` — Skill/context catalog progressive disclosure
- [ ] `extrepo-20260703-0015` / `P1-SECURITY-CREDENTIAL-LOGGING` — Credential and sensitive output redaction timing
- [ ] `extrepo-20260703-0016` / `P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE` — CLI/server/extension protocol compatibility
- [ ] `extrepo-20260703-0017` / `P1-AGENT-FOCUS-WATCHDOG` — Agent focus/progress watchdog for GUI
- [ ] `extrepo-20260703-0026` / `P1-MCP-HEADER-SECRET-HOOKS` — Runtime-only MCP credential/header resolution hooks
- [ ] `extrepo-20260703-0027` / `P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE` — Context budget receipts by source family
- [ ] `extrepo-20260703-0028` / `P1-INTERRUPT-CANCEL-SETTLEMENT` — User stop/interrupt halts active agent and tools safely
- [ ] `extrepo-20260703-0029` / `P1-TERMINAL-SEMANTIC-MARKER-PARSER` — OSC133/633 semantic prompt parser confidence tiers
- [ ] `extrepo-20260703-0030` / `P1-TERMINAL-CHUNK-SPANNING-PARSER` — Terminal parser state spans arbitrary PTY reads
- [ ] `extrepo-20260703-0031` / `P1-TERMINAL-A11Y-RANGE-MIRROR` — Terminal accessibility range mirror
- [ ] `extrepo-20260703-0032` / `P1-TERMINAL-HOST-PROVENANCE-DOCTOR` — Terminal host/mediator provenance and diagnostics
- [ ] `extrepo-20260703-0033` / `P1-TRACE-REDACTION-BEFORE-WRITE` — Trace/debug log redaction before persistence
- [ ] `extrepo-20260703-0034` / `P1-PLUGIN-EXTENSION-POINT-CONTRACTS` — Typed plugin/UI extension points to avoid monkey patching
- [ ] `extrepo-20260703-0044` / `P1-MCP-TOOL-CATALOG-CACHE` — Add lazy/searchable MCP/tool/skill catalog cache with result-path parity
- [ ] `extrepo-20260703-0045` / `P1-COMPACTION-CACHE-EFFECT` — Make compaction cache impact explicit
- [ ] `extrepo-20260703-0046` / `P1-PROVIDER-CAPABILITY-EPOCH-CACHE` — Extend provider capability epoch with cache/freshness/source metadata
- [ ] `extrepo-20260703-0047` / `P1-MODEL-SWITCH-REPLAY-SANITIZER` — Sanitize provider-native reasoning/item/cache metadata on model switch
- [ ] `extrepo-20260703-0048` / `P1-LOCAL-LLM-CONTEXT-CAPS` — Apply context caps to utility/memory/subagent models
- [ ] `extrepo-20260703-0049` / `P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS` — Add bounded queues, overload, retry, and pressure diagnostics
- [ ] `extrepo-20260703-0050` / `P1-TERMINAL-PTY-STREAM-CONTRACT` — Separate PTY bytes, terminal parser state, scrollback, and model-visible excerpts
- [ ] `extrepo-20260703-0064` / `P1-MODEL-SELECTION-ROUTER` — Model selection per role/skill/tool/subagent
- [ ] `extrepo-20260703-0065` / `P1-USAGE-ANOMALY-QUOTA-GUARD` — Token/cost anomalies and quota protection
- [ ] `extrepo-20260703-0066` / `P1-MEMORY-TIERING-CONTRACT` — Agent memory, goal memory, project memory, conversation history
- [ ] `extrepo-20260703-0067` / `P1-PROMPT-CACHE-STABILITY-LINTER` — Prompt/cache/token efficiency hygiene
- [ ] `extrepo-20260703-0068` / `P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS` — Token efficiency for tools, skills, MCP, and docs
- [ ] `extrepo-20260703-0069` / `P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS` — Terminal-bound agent output storms and UI safety
- [ ] `extrepo-20260703-0070` / `P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY` — Fallback captioning/OCR/transcription as explicit route
- [ ] `extrepo-20260703-0071` / `P1-STREAM-HISTORY-COALESCER-REPLAY` — Streaming/admission/replay boundary
- [ ] `extrepo-20260703-0080` / `P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH` — AGENTS/rules/skills/plugin instruction source fidelity and invalid encoding handling
- [ ] `extrepo-20260703-0081` / `P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD` — Terminal side channels: pasteboard, one-time codes, drag/drop, file URLs, and OS autofill
- [ ] `extrepo-20260703-0082` / `P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS` — Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings
- [ ] `extrepo-20260703-0083` / `P1-MEMORY-STORE-CRUD-VERSION-CITATIONS` — Agent memory store management, version history, and citation surfacing
- [ ] `extrepo-20260703-0084` / `P1-PLATFORM-BINARY-COMPATIBILITY-GATE` — Code signing, static binaries, platform packaging, sandbox setup, and OS-specific runtime gates
- [ ] `extrepo-20260703-0085` / `P1-EXTERNAL-AGENT-HANDOFF-IMPORT` — Third-party agent import, continuation, and session provenance
- [ ] `extrepo-20260703-0086` / `P1-UI-HARD-GATE-ENFORCER` — User-defined hard gates for visual QA, artifact delivery, and output modality
- [ ] `extrepo-20260703-0095` / `P1-INSTRUCTION-IMPORT-GRAPH` — Instruction import graph integrity
- [ ] `extrepo-20260703-0096` / `P1-TERMINAL-INPUT-PASTEBOARD-MATRIX` — Terminal input, IME, Unicode, pasteboard matrix
- [ ] `extrepo-20260703-0097` / `P1-UI-PROJECTION-STORE-BUDGET` — Bounded UI projection stores
- [ ] `extrepo-20260703-0098` / `P1-INSTALL-UPDATE-PROVENANCE` — Install/update/package provenance receipts
- [ ] `extrepo-20260703-0108` / `mcp_lazy_tool_exposure` — mcp_lazy_tool_exposure
- [ ] `extrepo-20260703-0109` / `filesystem_boundary_regressions` — filesystem_boundary_regressions
- [ ] `extrepo-20260703-0110` / `provider_error_observability` — provider_error_observability
- [ ] `extrepo-20260703-0111` / `github_update_workflow` — github_update_workflow
- [ ] `extrepo-20260703-0112` / `external_issue_closure` — external_issue_closure

## P2

- [ ] `extrepo-20260703-0018` / `P2-DOCS-GENERATED-LINK-VALIDATION` — Generated docs/release notes link validation
- [ ] `extrepo-20260703-0019` / `P2-BINARY-PROVENANCE-ASSETS` — Binary/provenance/codesigning
- [ ] `extrepo-20260703-0020` / `P2-GUI-NOT-CLI-CONTROL-PLANE` — Translate CLI lessons into GUI adapter contracts
- [ ] `extrepo-20260703-0035` / `P2-RICH-TEXT-RENDERING-FIDELITY` — Rendered GUI text fidelity separate from terminal fidelity
- [ ] `extrepo-20260703-0036` / `P2-CONFIG-SCHEMA-MIGRATION-FIXTURES` — Accepted/retired config schema migration tests
- [ ] `extrepo-20260703-0051` / `P2-CACHE-OBSERVABILITY-DASHBOARD` — Add cache observability dashboard and rollups
- [ ] `extrepo-20260703-0052` / `P2-CACHEABLE-TOOL-OUTPUT-REFS` — Hash-addressed cache refs for stable large tool outputs
- [ ] `extrepo-20260703-0053` / `P2-TRANSPORT-SOAK-TESTS` — Add WS/SSE/terminal/browser/device transport soak tests
- [ ] `extrepo-20260703-0054` / `P2-CACHE-PRIVACY-POLICY` — Expose provider cache retention/privacy boundaries
- [ ] `extrepo-20260703-0072` / `P2-OTEL-EXPORT-OPTIONAL-ADAPTER` — Observability export interoperability
- [ ] `extrepo-20260703-0073` / `P2-MODEL-CATALOG-CONFIDENCE-UI` — Provider/catalog confidence and user explanation
- [ ] `extrepo-20260703-0087` / `P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY` — Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass
- [ ] `extrepo-20260703-0099` / `P2-AI-TRIAGE-CLOSURE-CONFIDENCE` — AI triage closure confidence and reopen policy
- [ ] `extrepo-20260703-0113` / `v2_sdk_stability` — v2_sdk_stability

## Final ledger state

- [ ] Ledger current/handoff/open-items files updated.
- [ ] Open questions are explicit.
- [ ] No Plan docs, PlanUnits, NodeSeeds, WorkNodes, queues, implementation files, or governance artifacts were created by this ingestion unless explicitly requested.
- [ ] Final response reports imported rows, skipped rows, records written, blockers, and next safe stage.
