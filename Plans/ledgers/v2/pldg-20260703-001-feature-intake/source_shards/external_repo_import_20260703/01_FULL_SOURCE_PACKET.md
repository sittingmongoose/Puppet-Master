# Puppet Master External Repo Findings — Full Codex Source Packet

Generated: 2026-07-03T19:18:18Z

Purpose: give a Codex agent enough source material to import **all** external repo review findings into a new Puppet Master ledger without relying on chat memory.

Scope covered:

- OpenCode v1/dev/beta and OpenCode v2 specs
- Cline
- Agent Zero
- Pi
- OpenAI Codex
- Ghostty
- Warp
- tmux

Important product constraint: Puppet Master is GUI-first. PM is not building a CLI as its main surface. PM does have a built-in terminal for users and agent-adjacent terminal work; CLI/TUI repo lessons should be translated into GUI-native runtime contracts, terminal protocol fixtures, receipts, and controls.

This packet preserves the raw markdown reports verbatim below. The ledger-ready JSONL rows are in `02_LEDGER_READY_ATOMS.jsonl`; do not treat this markdown packet as only a summary.

## Source artifact inventory

| Source file | Role | Lines | SHA-256 |
|---|---:|---:|---|
| `raw_source_artifacts/opencode_pm_gap_analysis_2026-07-03.md` | full_report | 638 | `d254ecd8bb25037d085a619b4f04c61c13802f69699e53e4a56e11bf7fedce74` |
| `raw_source_artifacts/pm_external_repo_deep_evaluation_2026-07-03.md` | full_report | 492 | `5813f1f88dd3aedc7ec78022d3a223c381b2f529c2c722a3536ba2fb2b767afb` |
| `raw_source_artifacts/pm_second_pass_repo_gap_review_2026-07-03.md` | full_report | 405 | `8a36fc649467e82176c8c4f1b460d38983a940d44b545e332582844076e7e56c` |
| `raw_source_artifacts/pm_context_cache_websocket_repo_pass_2026-07-03.md` | full_report | 477 | `d3d1d17b7d00991e55fc81330a1fb3cd13762609770c4535593e75a9e522e30b` |
| `raw_source_artifacts/pm_missed_domains_repo_pass_2026-07-03.md` | full_report | 526 | `2acbb7669fa480617979713162d2c0a220d31848c81988167c8333498d690cac` |
| `raw_source_artifacts/pm_final_external_repo_closure_pass_2026-07-03.md` | full_report | 341 | `bc118374470d506c22c87f607f8bbc4afa5e4e4cfd9e0a17a2243b177b7f0159` |
| `raw_source_artifacts/pm_one_more_external_repo_pass_2026-07-03.md` | full_report | 332 | `cd62342e88489eec37d72254b89fcaa149d528c5ae4a58d38fdcdb5d20619b9d` |
| `raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl` | backlog_or_matrix | 20 | `9b3c193f081255ef5086b37d16b9cef20d679ab2cdb9bc6da555e306ab9ffd3e` |
| `raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl` | backlog_or_matrix | 16 | `d3a9e83b213d9239c37fee9ede30b050c5aa010d2873622869cf78dfb448f7ed` |
| `raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl` | backlog_or_matrix | 18 | `890239cff46ba5735ba2b58a78e006cda1fdc4dd2cdd3e9dc9e3cfb384d48ac9` |
| `raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl` | backlog_or_matrix | 19 | `87ddb6dced1b30d116d9ff74f19e81851a9ca67b1b1cef577e93498de2533383` |
| `raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl` | backlog_or_matrix | 14 | `076ca82cec29325e67e3bfbd3367ea56345b070ce14934a19fc5a4247d8666ca` |
| `raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl` | backlog_or_matrix | 12 | `0751e4f70f8e6cfca89dded8d9faa2b29a58692f2a714b770243988bd1efaa7b` |
| `raw_source_artifacts/opencode_pm_plan_change_matrix.csv` | backlog_or_matrix | 15 | `22f0a52ad5efe409627e77f2b8cce8b1ae37feeb12316a84586b8f599ac6631e` |
| `raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.csv` | backlog_or_matrix | 21 | `36c8bedfe38b30ec799d5657618d24177c1fc7745569e043aa308b5395411d63` |
| `raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.csv` | backlog_or_matrix | 20 | `5b96dd32ebbbc2b02ed94e0ea72ed1744127305e324ae555c0c5bf7222863573` |
| `raw_source_artifacts/pm_external_repo_evidence_matrix_2026-07-03.json` | backlog_or_matrix | 701 | `f9d3e3d82119d8c7e6921a5d0689c9dbb67f7d4714c550135f7954396e46b635` |
| `raw_source_artifacts/pm_missed_domains_evidence_matrix_2026-07-03.json` | backlog_or_matrix | 122 | `fb581d30bb3ac737ac57770ee5dcd2155f06748ae074bd2f3329a10d3c97736e` |
| `raw_source_artifacts/Handoff Review and Pipeline Update.txt` | pm_context_upload | 2846 | `8303a27ae64a90855507f9bbca4a707c9bec4b4024c2a94b0fe23321f3758ff4` |
| `raw_source_artifacts/Audit of Puppet Master Docs.txt` | pm_context_upload | 1054 | `be1bb41550c82e7eee4b04d90a315695e319f8322aac519c2810836518125163` |
| `raw_source_artifacts/Puppet Master Ledger Design.txt` | pm_context_upload | 335 | `3272385847c816ab930c71fd8704f56a72c1ea480b8600bddcc2654bd4434c38` |
| `raw_source_artifacts/Workflow Planning and Constraints.txt` | pm_context_upload | 44 | `976eb11b5f58b7400981320dfb28f2af28064e4c02aba81741e0dbb975138fd1` |
| `raw_source_artifacts/Planning Wizard Redesign.txt` | pm_context_upload | 104 | `137607cd371fca4611bb60bbd6ea09e6acdc5e3912050c9ba6ff53de56e1bf83` |

## Ledger-ready backlog summary

- Ledger-ready atom rows: **113**
- P0: **50**
- P1: **49**
- P2: **14**

### Backlog IDs by priority

#### P0

- `P0-TERMINAL-PROTOCOL-MATRIX` — Built-in GUI terminal protocol coverage (`extrepo-20260703-0001`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-TERMINAL-OUTPUT-BACKPRESSURE` — No silent terminal output loss (`extrepo-20260703-0002`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR` — Accessible terminal text model separate from renderer (`extrepo-20260703-0003`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-PLAN-ACT-PERMISSION-BOUNDARY` — Plan/Act/autonomy boundaries must be runtime enforced (`extrepo-20260703-0004`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-TOOL-RESULT-SETTLEMENT` — Partial/truncated/nullable provider tool turns cannot count as success (`extrepo-20260703-0005`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-PROVIDER-METADATA-REPLAY` — Provider-native reasoning/thinking/message metadata replay (`extrepo-20260703-0006`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-HISTORY-STORAGE-CAPS` — Bounded session/history storage (`extrepo-20260703-0007`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-RELEASE-MIGRATION-GATE` — Release, installer, migration, and rollback hardening (`extrepo-20260703-0008`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH` — Lazy MCP/tool catalog without lossy results (`extrepo-20260703-0021`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P0-HISTORY-ADMISSION-SANITIZATION` — Malformed provider/tool turns must not poison durable history (`extrepo-20260703-0022`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P0-PROVIDER-CAPABILITY-EPOCH` — Provider capability epoch and model-switch sanitizer (`extrepo-20260703-0023`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P0-REASONING-REPLAY-MATRIX` — Cross-provider reasoning/thinking replay/drop matrix (`extrepo-20260703-0024`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P0-MCP-TYPED-PARAM-FIDELITY` — MCP tools/call native JSON type fidelity (`extrepo-20260703-0025`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P0-CONTEXT-EPOCH-BASELINE` — Add ContextEpoch and stable baseline context (`extrepo-20260703-0037`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-PROMPT-CACHE-POLICY` — Add provider-neutral prompt cache policy plus provider adapters (`extrepo-20260703-0038`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-CACHE-USAGE-ENVELOPE` — Normalize cache usage/read/write metrics (`extrepo-20260703-0039`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-VOLATILE-CONTEXT-QUARANTINE` — Separate volatile context from cacheable baseline (`extrepo-20260703-0040`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-STREAM-HISTORY-COALESCER` — Prevent streaming partials from becoming durable duplicate history (`extrepo-20260703-0041`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-WEBSOCKET-TRANSPORT-POLICY` — Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP (`extrepo-20260703-0042`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-WEBSOCKET-SECURITY-BOUNDARIES` — Add WebSocket origin/auth/CSRF/runtime-id security gates (`extrepo-20260703-0043`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P0-AGENT-CONTROL-PLANE-ENVELOPE` — Agent control / autonomy / effort / resource envelope (`extrepo-20260703-0055`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-EFFORT-POLICY-SETTLEMENT` — Reasoning/thinking/effort requested-vs-effective (`extrepo-20260703-0056`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-SUBAGENT-EXECUTION-CONTRACT` — Subagent lifecycle, model/effort config, and result authority (`extrepo-20260703-0057`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-LOOP-BREAKER-TAXONOMY` — Looping / no-progress / spend control (`extrepo-20260703-0058`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-MULTIMODAL-INPUT-SETTLEMENT` — Vision/multimodal input admission and fallback (`extrepo-20260703-0059`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-PROVIDER-CAPABILITY-EPOCH-2` — Provider/model capability freshness and route-specific support (`extrepo-20260703-0060`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-TOOL-CALL-MALFORMATION-GATE` — Malformed/truncated/partial tool-turn admission (`extrepo-20260703-0061`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-LOG-REDACTION-BEFORE-WRITE` — Logging, traces, diagnostics, and privacy (`extrepo-20260703-0062`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-SYSTEM-RESOURCE-GOVERNOR` — System memory/process/file-watcher/resource management (`extrepo-20260703-0063`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN` — AI-assisted CI/release supply-chain attack surface (`extrepo-20260703-0074`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P0-GOAL-SCOPE-SUBAGENT-ISOLATION` — Goal/subagent identity leakage and rogue continuation (`extrepo-20260703-0075`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P0-PROVIDER-EGRESS-HTTP-POLICY` — User-configurable provider endpoint egress, redirect, timeout, and SSRF policy (`extrepo-20260703-0076`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P0-COMMAND-INVOCATION-CONTRACT` — Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command (`extrepo-20260703-0077`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P0-SESSION-TOOL-NAMESPACE-ACTIVATION` — Runtime-valid plugins/tools that are not actually injected into the session (`extrepo-20260703-0078`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P0-ENTITLEMENT-QUOTA-SETTLEMENT` — Provider/product entitlement, quota, credit, subscription, and rate-limit state (`extrepo-20260703-0079`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P0-SESSION-DRAFT-ATTACHMENT-ISOLATION` — Session draft and attachment isolation (`extrepo-20260703-0088`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P0-MCP-LIFECYCLE-RUNTIME-LIVENESS` — MCP lifecycle plus runtime-call liveness (`extrepo-20260703-0089`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P0-COMMAND-APPROVAL-LEASE` — Command approval lease bound to normalized command identity (`extrepo-20260703-0090`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P0-CREDENTIAL-ROUTE-EPOCH` — Credential/account/entitlement route epoch (`extrepo-20260703-0091`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P0-RUNTIME-SURFACE-READINESS-PROBE` — Runtime surface readiness probe (`extrepo-20260703-0092`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P0-CONTEXT-OBJECT-BUDGET` — Context object/media budget and dedupe (`extrepo-20260703-0093`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P0-TOOL-RESULT-TRUTHFULNESS-GATE` — Tool result truthfulness gate (`extrepo-20260703-0094`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `context_epoch` — context_epoch (`extrepo-20260703-0100`, source `opencode_pm_plan_change_matrix.csv`)
- `prompt_admission_execution` — prompt_admission_execution (`extrepo-20260703-0101`, source `opencode_pm_plan_change_matrix.csv`)
- `provider_policy` — provider_policy (`extrepo-20260703-0102`, source `opencode_pm_plan_change_matrix.csv`)
- `provider_metadata_replay` — provider_metadata_replay (`extrepo-20260703-0103`, source `opencode_pm_plan_change_matrix.csv`)
- `tool_output_retention` — tool_output_retention (`extrepo-20260703-0104`, source `opencode_pm_plan_change_matrix.csv`)
- `tool_heartbeat` — tool_heartbeat (`extrepo-20260703-0105`, source `opencode_pm_plan_change_matrix.csv`)
- `desktop_version_handshake` — desktop_version_handshake (`extrepo-20260703-0106`, source `opencode_pm_plan_change_matrix.csv`)
- `opencode_v2_delta` — opencode_v2_delta (`extrepo-20260703-0107`, source `opencode_pm_plan_change_matrix.csv`)

#### P1

- `P1-TERMINAL-CLIPBOARD-PASTE-SAFETY` — Clipboard, pasteboard, bracketed paste, OSC 52 (`extrepo-20260703-0009`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION` — Global keyboard hook isolation (`extrepo-20260703-0010`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-SESSION-PRESERVE-UPDATE` — Terminal session continuity across relaunch/update (`extrepo-20260703-0011`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS` — Resource ceilings for indexers/watchers/background agents (`extrepo-20260703-0012`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT` — MCP and external agent config import with trust boundaries (`extrepo-20260703-0013`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-CONTEXT-SKILL-BUDGETS` — Skill/context catalog progressive disclosure (`extrepo-20260703-0014`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-SECURITY-CREDENTIAL-LOGGING` — Credential and sensitive output redaction timing (`extrepo-20260703-0015`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE` — CLI/server/extension protocol compatibility (`extrepo-20260703-0016`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-AGENT-FOCUS-WATCHDOG` — Agent focus/progress watchdog for GUI (`extrepo-20260703-0017`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P1-MCP-HEADER-SECRET-HOOKS` — Runtime-only MCP credential/header resolution hooks (`extrepo-20260703-0026`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE` — Context budget receipts by source family (`extrepo-20260703-0027`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-INTERRUPT-CANCEL-SETTLEMENT` — User stop/interrupt halts active agent and tools safely (`extrepo-20260703-0028`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-SEMANTIC-MARKER-PARSER` — OSC133/633 semantic prompt parser confidence tiers (`extrepo-20260703-0029`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-CHUNK-SPANNING-PARSER` — Terminal parser state spans arbitrary PTY reads (`extrepo-20260703-0030`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-A11Y-RANGE-MIRROR` — Terminal accessibility range mirror (`extrepo-20260703-0031`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-HOST-PROVENANCE-DOCTOR` — Terminal host/mediator provenance and diagnostics (`extrepo-20260703-0032`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-TRACE-REDACTION-BEFORE-WRITE` — Trace/debug log redaction before persistence (`extrepo-20260703-0033`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-PLUGIN-EXTENSION-POINT-CONTRACTS` — Typed plugin/UI extension points to avoid monkey patching (`extrepo-20260703-0034`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P1-MCP-TOOL-CATALOG-CACHE` — Add lazy/searchable MCP/tool/skill catalog cache with result-path parity (`extrepo-20260703-0044`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-COMPACTION-CACHE-EFFECT` — Make compaction cache impact explicit (`extrepo-20260703-0045`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-PROVIDER-CAPABILITY-EPOCH-CACHE` — Extend provider capability epoch with cache/freshness/source metadata (`extrepo-20260703-0046`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-MODEL-SWITCH-REPLAY-SANITIZER` — Sanitize provider-native reasoning/item/cache metadata on model switch (`extrepo-20260703-0047`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-LOCAL-LLM-CONTEXT-CAPS` — Apply context caps to utility/memory/subagent models (`extrepo-20260703-0048`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS` — Add bounded queues, overload, retry, and pressure diagnostics (`extrepo-20260703-0049`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-PTY-STREAM-CONTRACT` — Separate PTY bytes, terminal parser state, scrollback, and model-visible excerpts (`extrepo-20260703-0050`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P1-MODEL-SELECTION-ROUTER` — Model selection per role/skill/tool/subagent (`extrepo-20260703-0064`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-USAGE-ANOMALY-QUOTA-GUARD` — Token/cost anomalies and quota protection (`extrepo-20260703-0065`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-MEMORY-TIERING-CONTRACT` — Agent memory, goal memory, project memory, conversation history (`extrepo-20260703-0066`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-PROMPT-CACHE-STABILITY-LINTER` — Prompt/cache/token efficiency hygiene (`extrepo-20260703-0067`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS` — Token efficiency for tools, skills, MCP, and docs (`extrepo-20260703-0068`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS` — Terminal-bound agent output storms and UI safety (`extrepo-20260703-0069`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY` — Fallback captioning/OCR/transcription as explicit route (`extrepo-20260703-0070`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-STREAM-HISTORY-COALESCER-REPLAY` — Streaming/admission/replay boundary (`extrepo-20260703-0071`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH` — AGENTS/rules/skills/plugin instruction source fidelity and invalid encoding handling (`extrepo-20260703-0080`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD` — Terminal side channels: pasteboard, one-time codes, drag/drop, file URLs, and OS autofill (`extrepo-20260703-0081`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS` — Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings (`extrepo-20260703-0082`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-MEMORY-STORE-CRUD-VERSION-CITATIONS` — Agent memory store management, version history, and citation surfacing (`extrepo-20260703-0083`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-PLATFORM-BINARY-COMPATIBILITY-GATE` — Code signing, static binaries, platform packaging, sandbox setup, and OS-specific runtime gates (`extrepo-20260703-0084`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-EXTERNAL-AGENT-HANDOFF-IMPORT` — Third-party agent import, continuation, and session provenance (`extrepo-20260703-0085`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-UI-HARD-GATE-ENFORCER` — User-defined hard gates for visual QA, artifact delivery, and output modality (`extrepo-20260703-0086`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P1-INSTRUCTION-IMPORT-GRAPH` — Instruction import graph integrity (`extrepo-20260703-0095`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P1-TERMINAL-INPUT-PASTEBOARD-MATRIX` — Terminal input, IME, Unicode, pasteboard matrix (`extrepo-20260703-0096`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P1-UI-PROJECTION-STORE-BUDGET` — Bounded UI projection stores (`extrepo-20260703-0097`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `P1-INSTALL-UPDATE-PROVENANCE` — Install/update/package provenance receipts (`extrepo-20260703-0098`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `mcp_lazy_tool_exposure` — mcp_lazy_tool_exposure (`extrepo-20260703-0108`, source `opencode_pm_plan_change_matrix.csv`)
- `filesystem_boundary_regressions` — filesystem_boundary_regressions (`extrepo-20260703-0109`, source `opencode_pm_plan_change_matrix.csv`)
- `provider_error_observability` — provider_error_observability (`extrepo-20260703-0110`, source `opencode_pm_plan_change_matrix.csv`)
- `github_update_workflow` — github_update_workflow (`extrepo-20260703-0111`, source `opencode_pm_plan_change_matrix.csv`)
- `external_issue_closure` — external_issue_closure (`extrepo-20260703-0112`, source `opencode_pm_plan_change_matrix.csv`)

#### P2

- `P2-DOCS-GENERATED-LINK-VALIDATION` — Generated docs/release notes link validation (`extrepo-20260703-0018`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P2-BINARY-PROVENANCE-ASSETS` — Binary/provenance/codesigning (`extrepo-20260703-0019`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P2-GUI-NOT-CLI-CONTROL-PLANE` — Translate CLI lessons into GUI adapter contracts (`extrepo-20260703-0020`, source `pm_external_repo_action_backlog_2026-07-03.jsonl`)
- `P2-RICH-TEXT-RENDERING-FIDELITY` — Rendered GUI text fidelity separate from terminal fidelity (`extrepo-20260703-0035`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P2-CONFIG-SCHEMA-MIGRATION-FIXTURES` — Accepted/retired config schema migration tests (`extrepo-20260703-0036`, source `pm_second_pass_delta_backlog_2026-07-03.jsonl`)
- `P2-CACHE-OBSERVABILITY-DASHBOARD` — Add cache observability dashboard and rollups (`extrepo-20260703-0051`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P2-CACHEABLE-TOOL-OUTPUT-REFS` — Hash-addressed cache refs for stable large tool outputs (`extrepo-20260703-0052`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P2-TRANSPORT-SOAK-TESTS` — Add WS/SSE/terminal/browser/device transport soak tests (`extrepo-20260703-0053`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P2-CACHE-PRIVACY-POLICY` — Expose provider cache retention/privacy boundaries (`extrepo-20260703-0054`, source `pm_context_cache_websocket_backlog_2026-07-03.jsonl`)
- `P2-OTEL-EXPORT-OPTIONAL-ADAPTER` — Observability export interoperability (`extrepo-20260703-0072`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P2-MODEL-CATALOG-CONFIDENCE-UI` — Provider/catalog confidence and user explanation (`extrepo-20260703-0073`, source `pm_missed_domains_backlog_2026-07-03.jsonl`)
- `P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY` — Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass (`extrepo-20260703-0087`, source `pm_final_external_repo_closure_backlog_2026-07-03.jsonl`)
- `P2-AI-TRIAGE-CLOSURE-CONFIDENCE` — AI triage closure confidence and reopen policy (`extrepo-20260703-0099`, source `pm_one_more_external_repo_backlog_2026-07-03.jsonl`)
- `v2_sdk_stability` — v2_sdk_stability (`extrepo-20260703-0113`, source `opencode_pm_plan_change_matrix.csv`)


---

# Full source reports



<!-- BEGIN_SOURCE_FILE: opencode_pm_gap_analysis_2026-07-03.md; SHA256: d254ecd8bb25037d085a619b4f04c61c13802f69699e53e4a56e11bf7fedce74; LINES: 638 -->

# OpenCode → Puppet Master Plans Review

Date: 2026-07-03  
Scope requested: newest OpenCode repo, last-six-month issue/PR/release problem patterns, OpenCode v2, and comparison against the uploaded Puppet Master Plans repo without relying on spot-checking.

## 0. Method and honesty boundary

I treated this as a coverage and architecture review rather than a handful of examples.

OpenCode review sources used:

- Live GitHub repository/release/issue/PR pages for `anomalyco/opencode` and redirecting `sst/opencode` surfaces.
- Current release notes around v1.17.x.
- Recent issue and PR clusters across the last six months, especially issue families around context/token usage, provider/model resolution, storage/session durability, tool execution, permission boundaries, desktop/API state, MCP/config, GitHub/update workflows, SDK/source transparency, and process automation.
- OpenCode `beta/specs/v2` design docs: API, config, provider/model, provider policy, session, tools, instructions, and schema changelog.

Puppet Master review sources used:

- Uploaded repo: `/mnt/data/Puppet-Master-main (111).zip`, extracted to `/mnt/data/pm_repo_extract/Puppet-Master-main`.
- All canonical top-level `Plans/*.md` files were indexed and searched by concern family.
- The generated PlanUnit index was validated and counted.
- The active PRD/Planning Wizard ledger was validated.
- Detailed file/line comparisons were taken from the owner docs with the highest coverage: `Models_System.md`, `Provider_OpenCode.md`, `CLI_Bridged_Providers.md`, `Multi-Account.md`, `storage-plan.md`, `Prompt_Pipeline.md`, `Tools.md`, `Permissions_System.md`, `MCP_Integration.md`, `usage-feature.md`, and GUI/runtime docs.

I did not manually read every individual OpenCode issue body in the repository; the repo has thousands of open issues and over a thousand PRs visible. The review instead maps the recent issue/PR/release/spec surface into durable failure families and compares those families systematically to PM’s Plans. That is the right unit of learning for Puppet Master: prevent the classes of failures, not merely copy single issue fixes.

## 1. PM repo inventory and validation snapshot

Repository snapshot reviewed:

- `Plans/` total files: 3,980.
- Top-level canonical Markdown docs: 71.
- `Plans/.plan_index/plan_units.jsonl`: 5,354 PlanUnits.
- `Plans/.plan_index/acceptance_units.jsonl`: 19,198 acceptance units.
- `python3 scripts/pm-plan-index.py validate`: `status=pass`, `coverage_status=pass`, `node_readiness_status=blocked_runtime_certification_incomplete`.
- `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard`: `status=pass`, 168 atoms, 62 compile queue items, 30 decisions, 15 corrections, 0 questions, 0 warnings.
- `python3 scripts/pm-shard-plans.py --check`: attempted but timed out in this environment, so I am not claiming shard validation success here.

High-signal concern-family scan across `Plans/*.md`:

| Concern family | Approx. top-level hit count | Strong owner/consumer docs |
|---|---:|---|
| provider/model/account/runtime identity | 22,898 | `Models_System.md`, `Provider_OpenCode.md`, `CLI_Bridged_Providers.md`, `Multi-Account.md`, `Contracts_V0.md`, `FinalGUISpec.md` |
| context/token/compaction/usage | 21,396 | `Prompt_Pipeline.md`, `usage-feature.md`, `assistant-chat-design.md`, `storage-plan.md`, `Contracts_V0.md` |
| session/storage/event persistence | 13,373 | `storage-plan.md`, `Contracts_V0.md`, `assistant-chat-design.md`, `Orchestrator_Page.md` |
| tools/output/error/permissions | 11,726 | `Tools.md`, `newtools.md`, `Permissions_System.md`, `FileSafe.md`, `Contracts_V0.md` |
| permissions/security/filesystem boundaries | 26,009 | `Permissions_System.md`, `FileSafe.md`, `Tools.md`, `Decision_Policy.md` |
| config/plugins/MCP/schema | 17,478 | `MCP_Integration.md`, `Plugins_System.md`, `Tools.md`, `Skills_System.md`, `Prompt_Pipeline.md` |
| frontend/API/GUI/session surfaces | 36,935 | `FinalGUISpec.md`, `assistant-chat-design.md`, `Runtime_Artifacts_Panel.md`, `Orchestrator_Page.md` |
| subagents/orchestration/runtime work | 51,517 | `orchestrator-subagent-integration.md`, `Executor_Protocol.md`, `Orchestrator_Page.md`, `Run_Modes.md` |
| observability/closure/evidence | 10,996 | `Runtime_Artifacts_Panel.md`, `Progression_Gates.md`, `Automated_Testing_System.md`, `Completion_Certifier`-adjacent docs |

This means PM already has broad written coverage of the same domains OpenCode is struggling with. The remaining problem is not “PM forgot providers or sessions.” The problem is whether PM’s Plans have the right runtime-contract granularity and tests for the exact failure modes OpenCode is surfacing.

## 2. What OpenCode is strong at

OpenCode’s current strength is speed and product breadth:

1. **Fast release cadence.** Recent release notes repeatedly show fixes across Desktop, V2 session UI, SDK/event streams, tool results, model pickers, MCP, skills, provider integrations, and session operations.
2. **Practical provider breadth.** The project continuously integrates provider/model variants, OpenRouter-style routes, reasoning/thinking modes, Copilot, desktop/CLI/web surfaces, MCP, local models, and browser/voice tools.
3. **User-visible iteration.** Many recent features appear oriented toward actual agent use: desktop tabs, active session handling, snapshots/revert, MCP resources, session context metrics, status output, and insights.
4. **OpenCode v2 is learning from v1 pain.** The v2 specs explicitly separate config, provider catalogs, provider policy, session admission/execution, context epochs, tool registration/settlement, API surfaces, and schema migration notes.
5. **They expose real operational problems early.** The issue tracker is noisy, but it is a valuable feed of failure modes PM should preempt.

The lesson for PM: do not only copy “features.” Copy the operational affordances behind the features: versioned data contracts, failure semantics, typed events, stable provider identity, policy precedence, context-budget transparency, and durable recovery.

## 3. Recent OpenCode failure families and PM lessons

### 3.1 Context and token efficiency

OpenCode issue patterns:

- Simple prompts can consume unexpectedly large token budgets.
- Users ask for a `/context` command or UI to expose token headroom and cache ratio.
- Auto-compaction and pruning behavior can trigger too early or be too aggressive for long-context models.
- Large MCP/tool schemas inflate prompt context.
- Model limits and provider metadata are not always discovered or applied consistently.

Relevant OpenCode corrective direction:

- Session/context metrics in the UI.
- Dynamic model context discovery for local/custom providers.
- MCP lazy loading proposal: compact server list plus on-demand tool search/describe/call instead of dumping every tool schema into the prompt.
- OpenCode v2 session specs define context epochs and automatic compaction against model-visible request size, while retaining durable full history.

PM comparison:

PM is already strong here:

- `Plans/Prompt_Pipeline.md` owns compaction/pruning, context selection, cache, marker-file, skill-bundling, and related algorithms; other docs must not redefine them (`Prompt_Pipeline.md:21-26`).
- PM requires post-compaction preservation of system, persona, and instruction-source commitments (`Prompt_Pipeline.md:228-242`).
- PM has a compaction overflow algorithm that keeps untouchable content intact and emits diagnostics instead of silently dropping it (`Prompt_Pipeline.md:246-267`).
- PM already requires reasoning blocks to survive replay/compaction and records provider `reasoning_tokens` on `UsageEvent` (`Prompt_Pipeline.md:285-287`).
- PM explicitly treats OpenCode synthetic compaction text as a compatibility hazard, not user-authored instruction (`Prompt_Pipeline.md:295`).
- PM emits low-context warnings under a 15% effective-window threshold after tool output or injected context (`Prompt_Pipeline.md:353-358`).
- `usage-feature.md` has a chat context-circle model with hover tokens/usage/cost and click-to-detail/Compact Now behavior (`usage-feature.md:106`, `126`, `159-170`, `1429-1470`).

Remaining PM risk:

PM has good compaction rules but should adopt OpenCode v2’s explicit **Context Epoch** abstraction. Today PM’s context policy is rich, but the repo search did not surface a first-class `context_epoch_id` object equivalent to OpenCode v2’s immutable system-context snapshot + ambient source hash boundary. PM should add a concrete context epoch record that tracks:

- `context_epoch_id`
- model/provider/window inputs
- instruction bundle/source hashes (`AGENTS.md`, skills, prompt policy, user-pinned context)
- provider cache baseline state
- compaction/repack boundary
- reason for epoch change
- model-visible payload hash
- durable history range represented
- tool schema set hash
- MCP registry/tool-list hash

This would prevent the classic “model-visible context changed but session/history believes it did not” failure.

### 3.2 Provider/model identity, variants, and metadata

OpenCode issue patterns:

- Provider fallback and model selection can silently pick the wrong provider/model.
- Model IDs with slashes or provider aliases break validation or routing.
- OpenAI-compatible/custom-provider options may not be forwarded.
- Provider errors can surface generically without actionable HTTP/status/body context.
- Reasoning/thinking metadata, signatures, and provider-native content blocks can be lost or replayed incorrectly.
- Provider-level model variants and hidden route variants are hard to model cleanly.

Relevant OpenCode corrective direction:

- OpenCode v2 defines explicit provider IDs, endpoint types, provider options, model capabilities, variants, costs, limits, status, and enabled/available state.
- V2 explicitly separates provider configuration from provider policy.
- Release notes continue patching stale Copilot item IDs, reasoning flags, model pickers, and V2 runtime model/result bugs.

PM comparison:

PM is already very strong on requested/effective identity:

- `Models_System.md` declares itself the single canonical source of truth for model selection, configuration, and variants (`Models_System.md:11-13`).
- The display grammar must preserve requested versus effective provider, model, variant, effort, auth mode, and account identity (`Models_System.md:42-49`).
- The precedence chain spans explicit run override, scoped owner policy, Persona preference, surface/stage default, project/global config, last-used state, and provider default (`Models_System.md:51-60`).
- Resolver inputs include model metadata, account/profile availability, worktree assignment, execution-role context, and permission ceiling (`Models_System.md:68-77`).
- The resolver emits requested/effective platform, model, variant, auth mode, account identity, execution role, selection reason, matrix entry, worker policy display, and skipped persona controls (`Models_System.md:79-91`).
- `ProviderRequestEnvelope` in `CLI_Bridged_Providers.md` preserves run/thread/parent/child lineage, attempt identity, execution role, requested/effective runtime/provider/model/account descriptors, permission/tool-policy snapshot refs, worktree/working directory, prompt parts, retry, and approval context (`CLI_Bridged_Providers.md:144-148`).
- Provider adapters must preserve provider output, tool-call fragments, errors, truncation markers, ordering/repair evidence, usage/cost observations, and correlation IDs before UI/storage/retry logic consumes them (`CLI_Bridged_Providers.md:150-158`).

Remaining PM risk:

PM should add a first-class **Provider Metadata Replay Policy**. PM already says reasoning blocks survive compaction and provider output must be preserved, but OpenCode’s recent Anthropic-thinking failure class proves that provider-specific opaque metadata must have explicit rules:

- preserve signatures/redacted thinking blocks when a provider requires them for subsequent turns;
- mark metadata as `provider_replay_required`, `provider_replay_forbidden`, `canonicalized`, `summary_only`, or `drop_after_compaction`;
- prohibit replay through model switches unless a compatibility adapter exists;
- include exact failure behavior when a provider-native replay item is missing.

This belongs in `Models_System.md`, `CLI_Bridged_Providers.md`, and `Prompt_Pipeline.md`.

### 3.3 Provider policy vs provider config

OpenCode issue patterns:

- “Configured” does not mean “allowed.”
- Provider/model availability is affected by account, policy, environment, project config, local setup, and session rules.
- Users need clear failure messages when a model is denied by policy rather than unavailable.

OpenCode v2 corrective direction:

- Provider policy is explicitly separate from provider config.
- Policy can deny a provider/model even if credentials and config exist.
- V2 policy defines wildcard matching, last-match behavior, default allow, and cross-file ordering so higher-level user policy can prevent repo policy from silently re-enabling a denied provider.

PM comparison:

PM has a strong permission system, but provider policy is not yet as explicitly separated as OpenCode v2:

- `Permissions_System.md` defines strict path normalization, symlink canonicalization, and fail-closed path comparison (`Permissions_System.md:89-105`).
- PM requires universal `policy.may_execute_tool()` before every tool dispatch; child/subagent/crew context is not a bypass (`Permissions_System.md:114-121`).
- Permission layer precedence includes mode override, parent/run ceiling, session cache, Persona, project, global, and defaults (`Permissions_System.md:196-205`).
- Children inherit ceilings and restrictive argument-pattern rules additively, without widening (`Permissions_System.md:209-212`).
- Scope specificity is lane > seam > package > project > global (`Permissions_System.md:216-227`).
- Account policy override fields narrow authority but do not widen parent/run permission ceiling (`Permissions_System.md:220`).

Remaining PM risk:

PM should introduce a `ProviderPolicyRuleset` as a sibling to tool permission rules, not as an implicit subset of generic permissions. It should explicitly govern:

- provider use;
- model use;
- variant/reasoning effort use;
- direct API vs CLI bridge vs OpenCode server route;
- account pool eligibility;
- free-model usage;
- enterprise/legal/local-only constraints;
- policy source precedence: user-global, org/team, project, repo, run/session, parent/child ceiling.

OpenCode v2’s provider-policy split is one of the cleanest lessons PM should adopt.

### 3.4 Session/storage durability and SQLite pitfalls

OpenCode issue patterns:

- SQLite corruption and WAL/NFS problems.
- JSON-to-SQLite migration can skip incorrectly when `opencode.db` already exists.
- Session list can be empty despite sessions existing in SQLite.
- UI can become unresponsive due to database access on the main UI thread.
- Latest issue snippets show session-message sequence errors such as `session_message.seq` NOT NULL failures.
- Desktop/CLI/session state can disagree.

OpenCode v2 corrective direction:

- Session v2 separates prompt recording/admission from execution.
- `session_input` is a durable admission inbox.
- Execution routing starts from Session ID only.
- Message/tool settlement events carry assistant message ID/tool call ID.
- Running tools from a previous process fail explicitly rather than being replayed as if safe.
- Durable history is retained even when the active model-visible representation is compacted.

PM comparison:

PM’s storage design is materially safer than OpenCode’s SQLite failure pattern:

- PM uses append-only `seglog` plus `redb` projections and `Tantivy` index rather than SQLite as the canonical history store (`storage-plan.md:1877-1899`).
- Corrupt or partial seglog writes use append-only flush, last-complete-record recovery, and mandatory CRC32 validation on read (`storage-plan.md:1836-1841`).
- Redb corruption is recovered from backup or rebuilt from canonical seglog (`storage-plan.md:1840-1841`).
- Migration failure leaves the previous version intact and does not open a half-migrated store (`storage-plan.md:1844-1845`).
- Multiple app instances must acquire an exclusive `pm.lock`; otherwise PM enters read-only viewer mode (`storage-plan.md:1846`, `1915-1922`).
- Projectors checkpoint only after successful commits and restart from last good checkpoint (`storage-plan.md:1842`, `1852-1854`, `1885-1887`).
- Compaction must preserve `seq`, exclude active segment, and preserve replay/projector correctness (`storage-plan.md:1861-1864`).
- Multi-instance prompt/session state must not degrade into last-write-wins flat files; compatibility files must migrate or use atomic writes and file locks with lineage (`storage-plan.md:1950-1952`).

Remaining PM risk:

PM should add the OpenCode v2 **prompt admission and execution state split** explicitly. PM’s seglog/redb design is strong, but the exact failure OpenCode v2 is correcting is not simply “database choice.” It is admission/execution/model-visible boundary confusion.

Add records like:

- `session_prompt_admitted`
- `session_prompt_promoted`
- `session_execution_started`
- `assistant_message_allocated`
- `tool_call_registered`
- `tool_settlement_recorded`
- `session_execution_wake`
- `execution_abandoned_after_crash`

Acceptance criteria should cover duplicate prompt IDs, retry idempotency, prompt replay after crash, running tool cancellation/failure on restart, and non-replay of side-effecting tools.

### 3.5 Tool execution, timeout, output bounding, and failure semantics

OpenCode issue patterns:

- Tool/task execution can hang indefinitely.
- Long-running MCP tools need progress timeout/reset semantics.
- Tool errors can be collapsed into success (`end_turn`) or generic errors.
- Large bodies/tool outputs can exceed request/API limits.
- V2 specs are moving toward bounded tool output and managed storage.

PM comparison:

PM has many good runtime-level tool contracts:

- Shell commands have an initial wait window and hard execution ceiling; hard timeout terminates the process and returns structured `timed_out` output (`Tools.md:323-328`).
- Edit, read, grep, glob, and write have default timeouts and structured timeout outputs (`Tools.md:359-365`, `394-397`, `432-435`, `462-465`).
- Grep partial results are only allowed when the runtime can prove returned hits were fully verified (`Tools.md:432-435`).
- Web actions have default and max timeouts plus total action caps (`Tools.md:680-695`).
- Tool result taxonomy is normalized and provider docs emit observations while storage persists normalized results (`Tools.md:124-140`).
- Web/tool outputs may use `content_ref`, `map_ref`, or summary refs instead of forcing full payloads into visible output (`Tools.md:666-672`).
- Prompt Pipeline must preserve protected tool outputs and skill outputs during compaction (`Prompt_Pipeline.md:421-423`).

Remaining PM risk:

PM should tighten tool failure semantics to match OpenCode v2’s `ToolFailure`/interruption/cancellation model:

- distinguish expected model-visible tool failure from process interruption, cancellation, stale tool call, and storage/retention failure;
- require managed output write success before returning tool success when output is too large for inline display;
- prohibit “lossy success” if output retention fails;
- make interruption never model-visible as a normal tool error;
- bind every tool call to assistant message ID, tool call ID, session ID, agent, and context epoch.

Also add an explicit **ProgressHeartbeat** contract for long-running tools/MCP/subagents:

- heartbeat interval;
- progress-timeout reset behavior;
- maximum silent duration;
- user-visible stalled state;
- cancellation semantics;
- recovery after frontend disconnect.

### 3.6 Filesystem boundaries, symlinks, and prompt-only compliance

OpenCode issue patterns:

- Agents could read outside project directories in Plan mode through read/bash/symlink/search surfaces until fixes were added.
- Big Pickle ignored `AGENTS.md` style rules, showing prompt-only compliance is not sufficient.
- Users want permission checks for agent-authored PRs.

PM comparison:

PM is already stronger here:

- Permission path comparison expands home, resolves absolute path components, resolves symlinks with `realpath()`, and only matches canonical paths (`Permissions_System.md:89-97`).
- `realpath()` failure is fail-closed; PM must not compare unresolved paths as fallback (`Permissions_System.md:100-104`).
- Every tool dispatch, including child/subagent/crew context, must run `policy.may_execute_tool()` (`Permissions_System.md:114-121`).
- External-directory access triggers a separate `external_directory` permission key with default `ask`; allowlist entries are explicit (`Permissions_System.md:374-390`).
- The PlanUnit `PS-026` preserves external directory guard and allowlist as accepted canon (`Permissions_System.md:2617-2624`).

Remaining PM risk:

PM should add regression fixtures copied from the OpenCode issue family:

- read outside workspace via symlink;
- grep/glob outside workspace through path traversal;
- bash read command outside workspace in Plan/Ask modes;
- DAE/child/subagent inherited permission ceiling;
- PR creation/push/comment/update operations require permission snapshots and project/repo/account scope;
- agent rule violations become testable runtime receipts, not just “AGENTS.md says so.”

### 3.7 MCP/config/plugin complexity

OpenCode issue patterns:

- Users request split config files for many MCP servers/providers/agents.
- MCP schemas can create huge tool lists and context bloat.
- MCP tool/server state has lifecycle, timeout, OAuth, remote/local, resource, and provider projection complexity.
- V2 explicitly says not to port legacy config by inertia.

OpenCode v2 corrective direction:

- Config v2 uses review groups: keep, remove, redesign, pending.
- MCP config has explicit local/remote server entries.
- Deprecated/experimental fields should not be carried by inertia.
- Plugin hooks move behavior out of large services but hooks are not dumping grounds.

PM comparison:

PM’s MCP docs are already advanced:

- `MCP_Integration.md` declares itself the SSOT for MCP configuration, naming, availability, credential binding, and invalidation (`MCP_Integration.md:1-4`).
- Stored and permission-facing MCP tool identity is underscore-only; slash/dual naming is retired (`MCP_Integration.md:16`).
- MCP schema handling tracks `$ref`, breaks recursive cycles, enforces max depth 32 and 64 KiB size cap, and preserves provider adapter compatibility facts (`MCP_Integration.md:87`).
- OAuth state is keyed by provider/scope/client, not only server; tokens live in shared credential store and refresh uses compare-and-swap (`MCP_Integration.md:89`).
- Server config supports local and remote MCP entries, `enabled`, `timeout_ms`, command/env, URL, headers, OAuth, and generated no-secret adapter config (`MCP_Integration.md:103`).
- PM has canonical MCP records for server definition, runtime availability, and tool records (`MCP_Integration.md:107-115`).
- MCP resilience includes lazy-load startup, pre-validation before dispatch, cached tool lists as degraded fallback evidence, retry policy, TTL/refresh evidence, and OAuth/auth-state evidence before eviction (`MCP_Integration.md:119`).
- PM forbids subprocess-per-call MCP except disposable diagnostics; long-lived sessions own lifecycle identity and teardown (`MCP_Integration.md:121`).

Remaining PM risk:

PM has “lazy-load startup” but should explicitly add OpenCode’s **lazy tool exposure** pattern:

- do not inject every MCP tool schema into model context by default;
- expose compact server/tool inventory first;
- provide tool discovery actions: `mcp_search`, `mcp_describe`, `mcp_call` or PM-equivalent;
- store schema hashes and context-cost estimates;
- require provider-specific schema adapter tests for Anthropic/OpenAI/Gemini/Bedrock-style subsets.

### 3.8 Desktop, API, SDK, and multi-surface synchronization

OpenCode issue patterns:

- Desktop hangs or LocalServer stops after tasks.
- Desktop and CLI can disagree on version/state.
- Web can lose model/project/session state.
- SDK v2 source/export stability is unclear to consumers.
- V2 releases are patching SDK live events, active session endpoints, paged durable history, permission endpoints, SSE event names, embedded session wake, duplicate model-switch events, and V2 model picker behavior.

PM comparison:

PM has many GUI/runtime artifacts and version/setup docs, but the OpenCode failure family suggests a missing hard contract:

- BinaryLocator focuses CLI discovery/setup health, version-gated probes, WSL/native locations, and setup/health UI mapping (`BinaryLocator_Spec.md:189-198`, `331-353`, `441-448`).
- Runtime artifacts distinguish durable/session-bounded/ephemeral views and evidence classes (`Runtime_Artifacts_Panel.md:836-837`).
- GUI docs include wake reasons and runtime-state exposure (`FinalGUISpec.md:21362`, `21517`).

Remaining PM risk:

Add a **DesktopServerVersionHandshake** and **EmbeddedRuntimeLifecycle** contract:

- desktop build ID;
- embedded server binary path/hash/version;
- CLI protocol version;
- schema version;
- V2/API compatibility version;
- model/provider catalog version;
- health/watchdog state;
- process restart policy;
- LocalServer crash/reconnect behavior;
- session tab/window scoping;
- stale frontend store invalidation;
- Desktop must fail closed or degrade visibly on mismatch.

### 3.9 GitHub/update/workflow and external issue governance

OpenCode issue patterns:

- `opencode upgrade` can fail due GitHub API 403/rate limit.
- Published `github@latest` action package can lag because workflow/tag automation did not run.
- User reports complain about auto-closing issues with `needs:compliance` after a short time.
- Users ask for agent-authored PR permission checks.

PM comparison:

PM has strong GitHub/auth/source-control surfaces, but should learn from OpenCode’s community/process pain:

- Do not close issue/PR feedback merely because it lacks a requested format.
- Do not use bot compliance closure as a substitute for durable triage state.
- Updater/installers must not depend on unauthenticated GitHub API rate limit paths without fallbacks.
- Release/action/package tags must have independent verification that `latest` maps to the actual release.
- Agent-created PR actions must run through repo/account permission snapshots.

Recommended PM addition:

Extend the semantic closure registry concept to external issues and PRs:

- `external_report_id`
- `source_url`
- `report_family`
- `repro_status`
- `needs_user_info_status`
- `bot_closure_allowed=false` unless triage evidence exists
- `closure_reason`
- `linked_plan_unit_ids`
- `linked_test_ids`
- `reopen_conditions`

## 4. OpenCode v2: the big update PM should pay attention to

OpenCode v2 is not just a new UI. It is a runtime-contract reset. The most important v2 lesson is that upstream is moving from loose service behavior toward explicit objects and boundaries:

1. **Config review discipline.** V2 config explicitly labels legacy config fields as keep/remove/redesign/pending instead of porting them by inertia. PM should copy this for legacy Plan fields, provider fields, old tier-era terms, and OpenCode compatibility imports.
2. **Provider catalog + provider policy split.** Provider config says what exists; provider policy says what may be used. PM should add a matching provider-policy owner record, separate from generic tool permissions.
3. **Provider/model capability objects.** V2 models include endpoint, options, capabilities, variants, time/cost/status/enabled/limit. PM already has requested/effective identity, but should add explicit provider endpoint class, capability hash, and variant compatibility fields to PM’s model catalog.
4. **Session input inbox.** V2 separates prompt admission from execution and makes prompts idempotent. PM should add session admission records to seglog.
5. **Context epochs.** V2 persists exact privileged System Context and ambient instructions/skills as context epochs. PM should add a first-class ContextEpoch record.
6. **Compaction as model-visible representation replacement.** V2 keeps durable full history; compaction changes the active representation. PM’s Prompt Pipeline already aligns philosophically, but should make this exact in storage/event records.
7. **Tool definition opacity and scoped registration.** V2 avoids exposing executor internals as public API. PM should ensure provider/plugin/tool registries do not leak internal implementation details into stable contracts.
8. **Tool output bounding and managed storage.** V2 says oversized output must be retained through managed storage and success cannot be lossy if retention fails. PM should adopt that hard line.
9. **Event/API source of truth.** V2 treats SDK/API as source of truth with one route surface and consistent event envelope. PM’s future API/SDK should use generated schema/event contracts rather than GUI-driven assumptions.
10. **Schema changelog as a compatibility artifact.** V2 documents persistent data changes, API shape changes, and tool registry changes. PM should maintain a schema changelog for plan-index, ledger, seglog/redb, provider catalog, tools, and runtime artifacts.

## 5. PM already got many OpenCode lessons right

### 5.1 Provider/model/account identity is far ahead

PM already models requested/effective provider/model/account identity more rigorously than OpenCode v1 issue patterns imply. `Models_System.md`, `CLI_Bridged_Providers.md`, and `Multi-Account.md` have the right owner boundaries and strong identity disclosure requirements.

### 5.2 Storage design avoids the biggest SQLite trap

PM’s append-only seglog + redb projections + Tantivy index is safer than storing mutable session truth directly in SQLite. It also has clearer multi-instance locking and projector recovery rules.

### 5.3 Permissions are stronger than prompt-only compliance

PM’s permission layer treats child/subagent/crew execution as non-bypassable and uses canonical path normalization + symlink resolution + external directory guards. This directly addresses the OpenCode filesystem issue family.

### 5.4 Tool timeouts are already specified

PM already has default and hard timeouts for shell/read/edit/search/glob/web actions. OpenCode’s hanging-tool issue confirms this needs implementation tests, not just prose.

### 5.5 Context visibility and compaction UX are already planned

PM’s context circle, Compact Now, context detail pane, hidden/background usage events, low-context warnings, and prompt compaction protections are directionally right.

### 5.6 MCP resilience is advanced

PM already models MCP local/remote entries, OAuth state, schema caps, lazy startup, pre-validation, cached degraded tool lists, retry/TTL evidence, and long-lived session pooling.

## 6. PM gaps to close before implementation

Priority order:

### P0 — Must add before runtime implementation

1. **ContextEpoch record.** Prevents invisible instruction/model/provider/cache/skills context drift.
2. **SessionPromptAdmission / execution split.** Prevents duplicate prompt replay, crash/restart side effects, and sequence/order bugs.
3. **ProviderMetadataReplayPolicy.** Prevents Anthropic/OpenAI/Copilot reasoning/signature/item-id replay breakage.
4. **ProviderPolicyRuleset separate from provider config.** Prevents configured-but-denied ambiguity.
5. **ToolManagedOutputRef + no-lossy-success rule.** Prevents large-output truncation masquerading as success.
6. **ToolProgressHeartbeat and hard tool/subagent deadlines.** Prevents indefinite hangs and invisible stalled execution.
7. **DesktopServerVersionHandshake.** Prevents Desktop/CLI/server schema/version mismatch.
8. **OpenCode v2 delta matrix.** Prevents PM from anchoring to old OpenCode limits after v2 changes.

### P1 — Add as implementation-test gates

9. Provider IDs with slashes/case/variants/custom endpoints.
10. Model limit discovery and context-window fallback warnings.
11. MCP lazy discovery and provider-specific schema rewrite fixtures.
12. External path/symlink/grep/glob/bash regression tests.
13. Multi-instance store lock/read-only mode tests.
14. Crash recovery: running tools fail visibly, no side effects replayed.
15. Desktop LocalServer restart/reconnect/watchdog tests.
16. GitHub API/update/action-tag verification tests.
17. Agent-authored PR permission snapshots.
18. External issue/PR closure registry.

### P2 — Add as monitoring/research watchlist

19. OpenCode v2 SDK stability and export boundaries.
20. OpenCode v2 API/event route finalization.
21. V2 provider endpoint support expansion for Google/Azure/Bedrock/OpenRouter/Copilot/Vertex/gateway adapters.
22. V2 plugin lifecycle and hot-reload implications.
23. Desktop beta behavior around tabs/windows/session stores.

## 7. Concrete Plan changes recommended

Add a new work item/ledger: **OpenCode v2 divergence import and PM runtime hardening**.

Suggested owner-doc updates:

| PM doc | Add/change |
|---|---|
| `Provider_OpenCode.md` | Add OpenCode v2 delta matrix; distinguish v1 hard limitations from v2 resolved/redesigned/unknown areas. |
| `OpenCode_Deep_Extraction.md` | Add v2 source inventory and status table; do not let old server-global/SSE/session assumptions silently remain current. |
| `Models_System.md` | Add provider endpoint class, provider capability hash, ProviderPolicyRuleset link, ProviderMetadataReplayPolicy. |
| `CLI_Bridged_Providers.md` | Add provider-native metadata replay/retention/drop matrix; include model-switch behavior and provider-specific opaque IDs. |
| `Multi-Account.md` | Add account/policy precedence for provider use, per-request context, cooldown/failover receipts. |
| `Prompt_Pipeline.md` | Add ContextEpoch record; align compaction with durable-history vs model-visible representation split. |
| `assistant-chat-design.md` | Add prompt admission/execution/wake visible states and context-epoch debug surface. |
| `storage-plan.md` | Add session input inbox / prompt admission / execution event records; crash-recovery and idempotency tests. |
| `Tools.md` | Add ToolManagedOutputRef and no-lossy-success; add ProgressHeartbeat; formalize ToolFailure vs interruption vs cancellation vs stale call. |
| `MCP_Integration.md` | Add explicit lazy tool exposure and schema-context-budget policy. |
| `Permissions_System.md` | Add agent-authored PR permission keys and OpenCode v2 provider-policy cross-link. |
| `BinaryLocator_Spec.md` / GUI setup docs | Add DesktopServerVersionHandshake and embedded runtime lifecycle. |
| `GitHub_Integration.md` | Add GitHub API rate-limit fallback and release/action tag currentness checks. |
| `Runtime_Artifacts_Panel.md` | Add display of context epochs, provider metadata replay warnings, managed output refs, heartbeat/stalled states. |
| `Automated_Testing_System.md` | Add regression test families listed above. |

## 8. Proposed new PlanUnits / acceptance criteria

### OPEN-CODE-V2-DELTA-MATRIX

PM maintains a source-backed OpenCode v2 delta matrix with rows for `config`, `provider_model`, `provider_policy`, `session`, `tools`, `api`, `schema_changelog`, `plugin_lifecycle`, `desktop`, and `sdk`. Each row records upstream source, PM owner doc, PM disposition (`adopt`, `monitor`, `reject`, `already_covered`, `superseded_by_PM`), and validation surface.

Acceptance:

- No OpenCode v1 limitation remains a PM hard assumption unless v2 review says it still applies.
- Every v2 adopted lesson has an owner doc and PlanUnit.
- Every monitored v2 unstable area has a watchlist entry and no implementation dependency.

### CONTEXT-EPOCH-RECORD

Every session turn belongs to a `context_epoch_id` that records instruction bundle/source hashes, model/provider/catalog hash, skills/tool schema/MCP registry hash, provider-cache baseline, compaction/repack boundary, and durable-history span represented.

Acceptance:

- Context epoch changes when instructions, skills, provider catalog, model selection, MCP tool set, cache baseline, or compaction boundary changes.
- UI/debug surfaces can explain why current model-visible context differs from durable history.

### SESSION-PROMPT-ADMISSION-INBOX

Session prompts are durably admitted before model execution and promoted to model-visible history only through explicit events. Prompt IDs are idempotent; duplicate prompt IDs are rejected or deduplicated deterministically.

Acceptance:

- Retry after crash does not duplicate side effects.
- Running tools from a crashed process settle as failed/cancelled/stale, not replayed.
- Session list/history can rebuild from seglog records.

### PROVIDER-METADATA-REPLAY-POLICY

Provider adapters classify provider-native metadata into replay-required, replay-forbidden, canonicalized, summary-only, or drop-after-boundary. Reasoning signatures, redacted thinking, response item IDs, tool call IDs, and provider-specific variants must be preserved or intentionally dropped with evidence.

Acceptance:

- Anthropic thinking signatures survive same-provider replay.
- Model switch does not send incompatible provider-native metadata.
- Missing replay-required metadata produces structured provider error, not generic failure.

### TOOL-MANAGED-OUTPUT-REF

Oversized tool output is stored as managed output with opaque references and retention metadata. A tool call cannot return success if required output retention fails.

Acceptance:

- Large tool output never disappears behind “success.”
- Model-visible output receives bounded projection + opaque ref.
- Storage retention failure is a tool failure or runtime blocker.

### TOOL-PROGRESS-HEARTBEAT

Long-running tools, MCP calls, subagents, and browser/device test sessions emit progress heartbeats and obey maximum silent intervals.

Acceptance:

- User can see stalled/running/cancellable states.
- Heartbeat resets progress timeout where appropriate.
- Silent hangs fail deterministically.

### PROVIDER-POLICY-RULESET

Provider/model/variant use is governed by explicit policy rules separate from provider config and credentials.

Acceptance:

- Configured providers can be denied by policy with clear reason.
- Repo policy cannot silently re-enable user/global denied providers.
- Provider-policy decisions are recorded in requested/effective model resolution.

### DESKTOP-SERVER-VERSION-HANDSHAKE

Desktop, embedded server, CLI, API, schema, and provider catalog versions are checked at connection/wake time.

Acceptance:

- Desktop refuses or degrades visibly on incompatible server/CLI/schema version.
- Session/tab state is invalidated or migrated with evidence.
- LocalServer crash/restart is visible and recoverable.

## 9. Pitfalls PM should avoid, directly from OpenCode

1. **Do not use prompt instructions as a security boundary.** Runtime policy and FileSafe must enforce.
2. **Do not rely on one mutable session database as truth without append-only recovery.** Seglog-first is correct.
3. **Do not mix provider config and provider permission.** Use separate policy.
4. **Do not hide provider errors.** Preserve HTTP status, body class, provider request ID, model ID, endpoint type, and retryability.
5. **Do not replay provider-native metadata across incompatible context/model boundaries.** Make replay rules explicit.
6. **Do not inject all MCP tool schemas into every prompt.** Lazy discovery is necessary for token economy.
7. **Do not let tools hang.** Every tool class needs hard timeout, heartbeat, cancellation, and settlement semantics.
8. **Do not count large-output truncation as success.** Use managed refs and retention evidence.
9. **Do not let Desktop/CLI/server versions drift silently.** Handshake and fail visibly.
10. **Do not auto-close user reports without durable triage closure.** It degrades feedback and hides real issues.
11. **Do not assume latest GitHub release/action path is available unauthenticated.** Support rate-limit-safe update flows.
12. **Do not bind to unstable v2 SDK/API exports without a compatibility gate.** Track v2 as moving target.
13. **Do not treat OpenCode v2 changes as just “upstream implementation.”** They are evidence of the abstractions PM needs.

## 10. Most important conclusion

Puppet Master is already stronger than OpenCode v1 in written governance, permission discipline, storage architecture, and source-lineage tracking. The risk is not lack of ambition or missing docs. The risk is that PM’s current Plans are often broad enough to appear to cover a domain while still missing the exact runtime object that prevents a production failure.

OpenCode v2 shows the right direction: split the system into explicit contract objects.

For PM, the highest-value changes are:

1. ContextEpoch.
2. Session prompt admission/execution split.
3. ProviderPolicyRuleset.
4. ProviderMetadataReplayPolicy.
5. ToolManagedOutputRef and no-lossy-success.
6. ToolProgressHeartbeat.
7. DesktopServerVersionHandshake.
8. OpenCode v2 delta matrix.

If PM adds those now, it can avoid much of the operational churn OpenCode is currently burning release cycles on.


<!-- END_SOURCE_FILE: opencode_pm_gap_analysis_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: pm_external_repo_deep_evaluation_2026-07-03.md; SHA256: 5813f1f88dd3aedc7ec78022d3a223c381b2f529c2c722a3536ba2fb2b767afb; LINES: 492 -->

# External Repo Deep Evaluation → Puppet Master Plan Deltas

**Date:** 2026-07-03  
**Requested scope:** Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, tmux; compare against the uploaded Puppet Master repo/Plans; focus on the last six months where possible; include terminal lessons for PM's built-in GUI terminal.

## Method and honesty boundary

This was not a random spot-check pass. I reviewed the live repo landing pages, recent issue lists, recent PR lists, releases/changelogs, and targeted current issue bodies for the requested repositories, then compared recurring failure families to the uploaded PM Plans. The largest repositories expose hundreds to thousands of open issues and PRs through the web UI. This report therefore does **not** claim to be a verbatim hand-read transcript of every individual issue body. It is a systematic failure-family review based on the visible recent surfaces plus targeted drill-downs where the issue/PR titles signaled material architecture risk.

The actionable comparison is at the level PM needs: runtime contracts, data-shape invariants, GUI/terminal semantics, provider/tool/context handling, release/migration process, and concrete PlanUnit/backlog deltas.

## Executive finding

PM's current Plans are already unusually strong in three areas that these projects struggled with:

1. **Identity separation.** PM already separates terminal section/tab/pane/session/dev-session identity and provider requested/effective identity.
2. **Central policy engine.** PM already routes tool execution through permission, FileSafe, terminal binding, execution, and normalized result flow.
3. **Prompt/context ownership.** PM already has a single Prompt Pipeline SSOT for context selection, skill/tool/persona injection, and compaction.

The high-value lesson from this repo pass is not "copy their CLI." PM is GUI-first. The lesson is: **formalize the edge contracts underneath the GUI** so terminal, provider, tool, release, history, and agent-progress failures cannot become invisible state drift.

## PM local evidence baseline

| PM area | Evidence |
|---|---|
| Terminal as GUI shell surface | `Plans/Section15_MVP_Promoted_Features_Spec.md:175-238` defines terminal as canonical interactive shell surface and separates `terminal_section_id`, `terminal_tab_id`, `terminal_pane_id`, `terminal_session_id`, and `dev_session_id`. |
| Terminal interaction modes | `Plans/Section15_MVP_Promoted_Features_Spec.md:242-279` defines `live_input`, `scrollback_review`, `selection_active`, `search_active`, `tui_capture`, PTY passthrough, copy/paste, TUI, alternate-screen behavior. |
| Command metadata honesty | `Plans/Section15_MVP_Promoted_Features_Spec.md:281-346` requires shell-integration tiers and forbids fabricated command boundaries/success semantics when integration is weak. |
| Requested/effective capability state | `Plans/Section15_MVP_Promoted_Features_Spec.md:351-366` applies requested/effective state to terminal renderer, shell integration, detach/windowing, clipboard/IME, accessibility, transcript retention, and remote/local runtime behavior. |
| Terminal architecture | `Plans/Section15_MVP_Promoted_Features_Spec.md:573-627` already splits process host/PTY, terminal engine/transcript buffer, renderer, shell-integration extractor, and workspace chrome. |
| Provider/model identity | `Plans/Models_System.md:35-95` owns requested/effective provider/model/account resolver shape. |
| Provider bridge normalization | `Plans/CLI_Bridged_Providers.md:80-150` says bridge context is not host authority and requires normalized output preservation. |
| Tool policy engine | `Plans/Tools.md:101-120` requires permission → FileSafe → terminal binding → execute/reject → normalized outcome. |
| Storage foundation | `Plans/storage-plan.md:1504-1519` uses seglog/redb/checkpoints/tool usage/usage events. |
| Prompt/context SSOT | `Plans/Prompt_Pipeline.md:20-80` owns context selection, compaction, skill/tool/persona/run-envelope assembly. |

## Most important PM gaps found by comparison

The gaps are not broad feature absence; they are **edge-contract specificity gaps**.

1. **Terminal protocol matrix.** PM covers VT/ANSI/grid/buffer generally, but quick scans did not find explicit live Plan coverage for OSC 52, bracketed paste, DEC synchronized updates, tmux, pasteboard priority, or global-keybind failure isolation. PM does cover OSC 7 and OSC 133-style shell-integration markers, but not enough low-level fixtures.
2. **No silent output loss accounting.** PM says retention/pruning are honest and high-output should not stall UI, but it needs receipts at each ingestion step: PTY accepted bytes, parsed cells, transcript chunks, storage flush, paint/defer/drop.
3. **Accessibility text mirror.** PM has screen-reader labels and requested/effective accessibility support, but terminal GPU/grid accessibility requires a separate text-state projection.
4. **Tool-turn settlement state.** Upstream projects repeatedly fail on truncation, nullable content, large tool results, and redaction ordering. PM needs a no-lossy-success state machine.
5. **Release/migration gates.** Cline, Agent Zero, Pi, Ghostty, Warp, and Codex all show update/migration regressions. PM needs explicit canary, migration, asset provenance, link validation, and rollback contracts.
6. **External config import policy.** MCP/tool configs imported from other agents must be first-class suggestions with provenance and trust gates, not auto-executable facts.
7. **Resource governors.** PM needs unified watcher/indexer/history/MCP/tool-result quotas so GUI background services cannot starve the host.
8. **Agent progress heartbeat.** GUI agents and terminal-bound long commands need checkpoint/progress/next-check/stalled state, not only chat scrollback.

## Repo-by-repo lessons

### 1. Cline

**Strengths to learn from**
- Broad surface strategy: IDE extension, CLI, SDK, Kanban/multi-agent board, scheduled agents, MCP/plugins, rules/skills, and multiple providers.
- Product-grade workflow affordances: Plan/Act, diff review, checkpoints, bash execution, `.clinerules`, skills, plugin ecosystem.
- Active PR stream on provider catalog/capabilities, CLI codesigning, terminal reliability, output-token handling, model reasoning controls, image capability filtering, inline XML tool recovery, and provider history bounds.

**Pitfalls to avoid**
- Release stability and migration: users report critical behavior breaking on update, tasks/chats becoming unusable, and inability to trust automatic updates.
- Plan/Act and approval boundary failures: issue reports show plan-mode work writing files/running Docker/schema changes and destructive shell commands running without approval because model/provider output claimed approval wasn't required.
- Provider/tool normalization fragility: current issues include large MCP tool result crashes, string/array content shape failures, provider ID bugs, and reasoning-only response misclassification.
- Terminal/session lifecycle debt: orphaned terminal sessions and VS Code terminal reliability PRs show shell integration cannot be an afterthought.

**PM delta**
- Runtime-enforced mode ceilings and `AutonomyCeilingReceipt`.
- Large tool result managed-output references.
- Provider model/catalog capability versioning.
- Release rings + state migration tests.

### 2. Agent Zero

**Strengths to learn from**
- Launcher/Docker onboarding and in-thread provider setup reduce first-run friction.
- Web UI and multi-agent customization make agent behavior inspectable.
- Changelog indicates serious work on Responses fallback, MCP image artifacts, stricter tool schema compatibility, ordered replay, large backup reliability, and provider setup.

**Pitfalls to avoid**
- Credential/security concerns need design-time redaction and metadata minimization, not later bug triage.
- CLI/server protocol mismatch can corrupt terminal state, misreport capability, leave orphan processes, and break cooked terminal mode.
- Truncated tool-call turns treated as successful can create unbounded retry loops.
- Chat history bloat and raw JSON context pollution can crash runtimes and degrade model context.
- v2 upgrades and tag/migration flows show state migration must be treated as a product feature.

**PM delta**
- `BridgeHandshakeReceipt` with version/capability/session-mode pre/post.
- No partial/truncated turn can be success.
- History object budgets and context compiler guards.
- Redaction-before-render/persistence ordering.

### 3. Pi

**Strengths to learn from**
- Small, focused harness architecture: CLI, agent-core, and unified provider API.
- Recent provider-factory changes show a cleaner boundary: explicit provider factories rather than inherited selective entrypoints.
- Prompt cache/accounting design demonstrates value of visible usage/cached-token cost tracking.
- PR stream includes SQLite session storage and stable TUI redraw improvements.

**Pitfalls to avoid**
- New model integrations expose edit-tool failures and nullable reasoning/content edge cases.
- Context-window clamping versus max-token policy needs precise semantics.
- Binary packaging/provenance and extension loading require release/installer verification.
- Generated release notes/docs links need validation under each rendering target.

**PM delta**
- Provider-native nullable content/reasoning normalization.
- Context-window/token-budget acceptance tests.
- Binary provenance and generated-link validation in governance seal.
- SQLite/redb session chunking tests for PM storage.

### 4. OpenAI Codex

**Strengths to learn from**
- Goals, subagents, and skills match PM's durable-goal architecture direction: persistent objectives, progress checkpoints, specialized parallel agents, and reusable workflow skills.
- Official skills docs make progressive disclosure explicit and limit initial skill-list context budget.
- Changelog shows hardening around managed permission profile allowlists, skill load warning deduplication, terminal/app UI, Windows native sandbox/proxy behavior, handoff/worktrees, and MCP rendering.
- PR stream shows exact issues PM should copy conceptually: scope model cache by provider/account, harden namespace-aware executable policy matching, one-shot approval for inspected wrappers.

**Pitfalls to avoid**
- Current issues show even official tools can have redaction timing, TUI terminal state, and API surface edge cases.
- Subagents use more tokens and should be explicit and bounded.
- Goal progress reporting must be compact, verifiable, and checkpoint-oriented.

**PM delta**
- Skill catalog budget and omission warnings.
- Goal heartbeat and checkpoint receipts.
- Redaction settlement before transcript rendering.
- Provider/account-scoped model/cache state.
- Namespace-aware executable policy matching.

### 5. Ghostty

**Strengths to learn from**
- Terminal-first engineering discipline: fast native/GPU terminal, platform-native UI, full VT/terminal API focus, detailed release notes, performance and regression patches.
- 1.3.0 release shows the importance of scrollback search, native scrollbars, click-to-move-cursor, and hundreds of terminal correctness/performance fixes.
- 1.3.1 shows realistic regression strategy: patch quickly after a large terminal release.
- Discussions/issues surface deep terminal details PM must account for: screen readers, global keybind/event taps, pasteboard priority, IME crashes, key repeats, mouse/TUI forwarding.

**Pitfalls to avoid**
- GPU rendering alone does not solve accessibility.
- Global keybindings/event taps can harm the entire OS if not isolated.
- Clipboard/pasteboard type priority can cause surprising behavior.
- Terminal shell-integration and prompt markers have complex edge cases across shells/themes.

**PM delta**
- Accessibility text mirror.
- Global shortcut watchdog and kill switch.
- Clipboard/paste safety policy.
- Explicit shell integration fixtures for dynamic/multiline prompts.

### 6. Warp

**Strengths to learn from**
- Warp’s evolution from terminal into agentic development environment shows how terminal, code review, MCP, settings, agent mode, cloud/background agents, and third-party CLI agents can converge into a GUI-ish developer workspace.
- Changelog details are directly useful: TOML settings, long-running shell command snapshots, “last seen by agent,” project MCP cwd defaults, session reopen, WSL PWD restore, alt-screen CLI agent visual fixes, context-window configuration, MCP from third-party agents, and agent/code-review interaction.
- Strong GUI lessons: visible follow-up/steering state, configurable max context per profile, clickable disabled-tool explanations, restore semantics.

**Pitfalls to avoid**
- File watcher/resource exhaustion can damage unrelated tools.
- Focus/stall bugs can make an agent appear working while nothing progresses.
- Open-source release creates huge issue/PR load; triage process matters.
- Terminal agent features can obscure core terminal reliability if the product drifts too hard toward agent UI.

**PM delta**
- Runtime resource governor.
- Agent heartbeat/stall detection.
- MCP config import provenance.
- GUI-first policy: terminal is built in, but PM control plane stays GUI/Goal/PlanUnit driven.

### 7. tmux

**Strengths to learn from**
- Stable abstractions: sessions/windows/panes, detach/reattach, copy mode, scripting/control mode, status/popup/menu, and well-tested UTF-8/mouse/focus behavior.
- CHANGES show decades of protocol correctness work: OSC 133 prompt markers, OSC 52 clipboard, output buffering/backpressure, extended keys, mouse features, UTF-8/zero-width joiners, copy-mode commands, pane/server identities.
- Current issues are specialized and low-volume compared with AI-agent repos, which is a signal: the model is small, durable, protocol-driven, and intensely tested.

**Pitfalls to avoid**
- Prompt metadata like OSC 133 is semantic state, not merely text; clearing a line can accidentally clear command navigation markers.
- Mouse/copy-mode crashes and redraw synchronization are real even in mature terminal software.
- Output speed/client speed mismatch must be explicit.

**PM delta**
- Treat semantic shell markers as grid metadata with lifecycle rules.
- Add control-mode/backpressure-like fairness in terminal ingestion/rendering.
- Terminal session/window/pane invariants should be testable independent of GUI chrome.

## Prioritized action backlog

### P0-TERMINAL-PROTOCOL-MATRIX — Built-in GUI terminal protocol coverage (P0)

**Sources:** ghostty-org/ghostty, tmux/tmux, warpdotdev/warp  
**Observed upstream signal:** Ghostty/tmux current issues and releases revolve around OSC 133 shell integration, pasteboard semantics, mouse/key handling, Unicode/ZWJ crashes, and platform-specific regressions; Warp changelog shows alt-screen CLI-agent contrast, dropped keystrokes, zero-width crash, WSL PWD restore, session reopening, MCP spawn cwd, and settings/autonomy fixes.  
**PM current coverage:** PM Section15 has strong identity/lifecycle/interaction model, shell-integration tiers, cross-platform matrix, and parser-engine gates.  
**Gap:** No explicit terminal protocol test matrix for OSC 52, OSC 8, OSC 9;4, OSC 133, OSC 633, bracketed paste, focus events, SGR/UTF-8 mouse, DEC synchronized updates, pasteboard priority, or terminal-feature negotiation.  
**Plan change:** Add PlanUnits under Section15 or a new Built_In_Terminal_Runtime.md that enumerate VT/xterm/OSC protocol fixtures and acceptance tests. Treat protocols as data fixtures with replayable byte streams, not prose-only requirements.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FinalGUISpec.md, Plans/storage-plan.md, Plans/Automated_Testing_System.md  
**Acceptance tests:**  
- VT replay corpus includes OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate screen, synchronized update sequences.
- Parser output is deterministic across macOS/Linux/Windows/WSL fixtures.
- Weak/unknown protocol support downgrades requested-vs-effective state rather than fabricating command blocks.

### P0-TERMINAL-OUTPUT-BACKPRESSURE — No silent terminal output loss (P0)

**Sources:** tmux/tmux, ghostty-org/ghostty, warpdotdev/warp  
**Observed upstream signal:** tmux history includes backpressure/control-mode buffering design; older issue families report output lines missing when terminal/client can't keep up; Warp/Ghostty issue streams include huge output, rendering, and persisted block edge cases.  
**PM current coverage:** PM says retention/pruning are honest and high-output sessions must not stall UI; parser-engine gates include huge output fixtures.  
**Gap:** PM needs explicit loss accounting: when bytes are accepted by PTY reader, parsed, painted, persisted, pruned, redacted, or dropped/deferred, there must be receipts and user-visible status.  
**Plan change:** Add TerminalIngestionReceipt and TerminalBackpressureState. Differentiate accepted-by-PTY, parsed-to-grid, appended-to-transcript, flushed-to-storage, painted, pruned, redacted, and diagnostic-exported.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md  
**Acceptance tests:**  
- A fast-output fixture records byte counts and no silent loss.
- If retention cap prunes, transcript chunk references prove what remains and what was pruned.
- UI thread never blocks on raw PTY ingestion.

### P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR — Accessible terminal text model separate from renderer (P0)

**Sources:** ghostty-org/ghostty  
**Observed upstream signal:** Ghostty screen-reader discussion notes GPU rendering prevents screen readers from extracting terminal state and calls for direct screen-reader output, terminal-state exposure, cursor navigation support, and spam silencing.  
**PM current coverage:** PM has accessibility requirements and screen-reader-readable labels, plus requested-vs-effective disclosure for accessibility support.  
**Gap:** PM still needs an explicit terminal accessibility text mirror and speech/event throttling model; labels alone are insufficient for a terminal grid.  
**Plan change:** Add TerminalAccessibleBuffer projection from canonical grid/transcript state, with cursor navigation, line/selection reading, output announcement modes, and long-output silence/throttle controls.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FinalGUISpec.md  
**Acceptance tests:**  
- Screen reader projection can read current line, selection, prompt/command boundaries, and latest output without scraping GPU pixels.
- Long-running spam commands throttle announcements without hiding state.

### P0-PLAN-ACT-PERMISSION-BOUNDARY — Plan/Act/autonomy boundaries must be runtime enforced (P0)

**Sources:** cline/cline, openai/codex, warpdotdev/warp  
**Observed upstream signal:** Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.  
**PM current coverage:** PM has central tool policy engine, permission model, FileSafe, and terminal pre-run approval requirements.  
**Gap:** Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema.  
**Plan change:** Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed.  
**Target docs:** Plans/Permissions_System.md, Plans/Tools.md, Plans/Run_Modes.md, Plans/Section15_MVP_Promoted_Features_Spec.md  
**Acceptance tests:**  
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.

### P0-TOOL-RESULT-SETTLEMENT — Partial/truncated/nullable provider tool turns cannot count as success (P0)

**Sources:** agent0ai/agent-zero, cline/cline, earendil-works/pi, openai/codex  
**Observed upstream signal:** Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.  
**PM current coverage:** PM has normalized tool outcomes and provider bridge output preservation requirements.  
**Gap:** Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal.  
**Plan change:** Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success.  
**Target docs:** Plans/Tools.md, Plans/CLI_Bridged_Providers.md, Plans/Models_System.md, Plans/storage-plan.md  
**Acceptance tests:**  
- finish_reason=length with tool call is classified partial_truncated.
- nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata.
- large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.

### P0-PROVIDER-METADATA-REPLAY — Provider-native reasoning/thinking/message metadata replay (P0)

**Sources:** cline/cline, agent0ai/agent-zero, earendil-works/pi, openai/codex  
**Observed upstream signal:** Cline PRs/issues target model catalogs, reasoning effort controls, provider IDs, image capability omission, transient empty model responses, string agent messages, tool invocation repair; Pi issues include thinking-block normalization and Bedrock/OpenAI Responses provider work; Codex PR scopes model cache by provider/account.  
**PM current coverage:** PM has requested/effective provider/model/account identity and provider facade normalization.  
**Gap:** Need a typed provider-native artifact replay/drop/canonicalize policy for thinking blocks, signatures, reasoning IDs, nullable content, model variants, image/video content, provider account scoping.  
**Plan change:** Add ProviderNativeMetadataPolicy table: per provider/model capability, fields to retain, redact, drop-on-cross-provider, replay-only-same-account, or canonicalize. Include cache keys and model catalog version.  
**Target docs:** Plans/Models_System.md, Plans/CLI_Bridged_Providers.md, Plans/Prompt_Pipeline.md, Plans/Multi-Account.md  
**Acceptance tests:**  
- Switching provider/model never replays incompatible native reasoning blocks.
- Model cache scoped by provider+account+capability catalog version.
- Image/tool/reasoning content gates check capabilities before sending.

### P0-HISTORY-STORAGE-CAPS — Bounded session/history storage (P0)

**Sources:** agent0ai/agent-zero, cline/cline, earendil-works/pi  
**Observed upstream signal:** Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.  
**PM current coverage:** PM uses seglog/redb/checkpoints and says transcript retention is bounded/honest.  
**Gap:** Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure.  
**Plan change:** Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context.  
**Target docs:** Plans/storage-plan.md, Plans/Prompt_Pipeline.md, Plans/Runtime_Artifacts_Panel.md  
**Acceptance tests:**  
- 127MB metadata fixture is rejected/segmented before UI or model context load.
- Context compiler emits compact summaries plus refs, not raw massive JSON.
- Large tool results remain retrievable from artifacts with hashes.

### P0-RELEASE-MIGRATION-GATE — Release, installer, migration, and rollback hardening (P0)

**Sources:** cline/cline, agent0ai/agent-zero, earendil-works/pi, ghostty-org/ghostty, warpdotdev/warp, openai/codex  
**Observed upstream signal:** Cline v4 issues report task corruption and release stability concerns; Agent Zero issue list includes missing upgrade tag, v2 regression, Launcher/self-update bugs; Pi has binary/provenance and packaging/link issues; Ghostty 1.3.1 quickly patched 1.3.0 regressions; Warp changelog shows frequent migration/restore fixes; Codex changelog shows frequent CLI/app releases.  
**PM current coverage:** PM has governance gates and protected namespace, but release/migration strategy is not as explicit as runtime specs.  
**Gap:** Need a release compatibility plan: canary/stable rings, artifact provenance, generated-link checks, state migration tests, downgrade/backup restore, extension/CLI/server protocol handshake, terminal session preservation across updates.  
**Plan change:** Add Release_Compatibility_and_Migration.md or PlanUnits under Progression_Gates. All major updates must run state-migration and rollback fixtures before users get them.  
**Target docs:** Plans/Progression_Gates.md, Plans/Project_Output_Artifacts.md, Plans/storage-plan.md, Plans/Goal_Runtime_System.md  
**Acceptance tests:**  
- Major version migration has backup/restore test.
- Generated release links validate.
- Protocol version mismatch blocks with actionable message.
- App update does not orphan terminal/process sessions silently.

### P1-TERMINAL-CLIPBOARD-PASTE-SAFETY — Clipboard, pasteboard, bracketed paste, OSC 52 (P1)

**Sources:** ghostty-org/ghostty, warpdotdev/warp, tmux/tmux  
**Observed upstream signal:** Ghostty issue list includes paste preferring NSURL over plain text; Ghostty 1.3.0 fixed a paste/drag command-execution CVE; tmux CHANGES include OSC 52 clipboard support; Warp issues include copy/paste isolation.  
**PM current coverage:** PM has copy/paste/selection semantics and default copy-on-select disabled.  
**Gap:** Need explicit paste-source priority and pasted-control-character handling, bracketed-paste negotiation, OSC 52 policy, and cross-context clipboard isolation.  
**Plan change:** Add TerminalClipboardPolicy: plain text preference, URI/file types explicit, control-character confirmation, bracketed paste support state, OSC 52 allow/ask/deny, local/remote/container clipboard scope.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Permissions_System.md, Plans/FileSafe.md  
**Acceptance tests:**  
- Pasting mixed URL/plain text chooses plain text unless user selects URI action.
- Pasted Ctrl+C/control chars cannot execute without warning/normalization.
- OSC 52 read/write respects policy and remote trust.

### P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION — Global keyboard hook isolation (P1)

**Sources:** ghostty-org/ghostty, warpdotdev/warp  
**Observed upstream signal:** Ghostty discussion reports system-wide keyboard freezes tied to global quick-terminal keybinding/event tap; Warp changelog includes global hotkey memory leak fixes.  
**PM current coverage:** PM has shortcut conflict disclosure and terminal input ownership states.  
**Gap:** No explicit global-event-tap isolation requirements: hooks must not run on UI/compositor main thread, must auto-disable on stall, and must be observable.  
**Plan change:** Add GlobalShortcutSafety PlanUnit for all app-level hotkeys, not only terminal. Include watchdog, timeout auto-disable, kill switch, and diagnostic banner.  
**Target docs:** Plans/FinalGUISpec.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Permissions_System.md  
**Acceptance tests:**  
- Global hotkey handler stall cannot freeze system input.
- User can disable terminal/global hotkey path from safe mode.
- Diagnostic bundle records hook health.

### P1-TERMINAL-SESSION-PRESERVE-UPDATE — Terminal session continuity across relaunch/update (P1)

**Sources:** warpdotdev/warp, tmux/tmux, ghostty-org/ghostty  
**Observed upstream signal:** Warp issue requests terminal/agent sessions alive across relaunch/app updates; Warp changelog includes reopen closed sessions and restored WSL PWD; tmux's mature value is session/window/pane durability.  
**PM current coverage:** PM says live continuity after app restart is best-effort and explicit when unavailable; historical state is not fake live shell.  
**Gap:** Need a concrete platform matrix for live session survival/reconnect and a UX flow for when only historical review can be restored.  
**Plan change:** Add TerminalSessionRestorePolicy by platform/runtime: local PTY, WSL, SSH, container, devcontainer. Define reconnect tokens, when impossible, and exact banners/actions.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/storage-plan.md, Plans/FinalGUISpec.md  
**Acceptance tests:**  
- Relaunch fixtures prove PWD/profile/layout/transcript restoration.
- If live PTY cannot survive, UI says review-limited and offers restart/rerun, not fake continuity.

### P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS — Resource ceilings for indexers/watchers/background agents (P1)

**Sources:** warpdotdev/warp, agent0ai/agent-zero, cline/cline  
**Observed upstream signal:** Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.  
**PM current coverage:** PM has dirty-layer watcher design and storage rollups but not a global resource-governor narrative for all background services.  
**Gap:** Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation.  
**Plan change:** Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls.  
**Target docs:** Plans/FileManager.md, Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md  
**Acceptance tests:**  
- Large repo cannot allocate unbounded watchers.
- Quota exceeded degrades with warning and exact subsystem, not crash.

### P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT — MCP and external agent config import with trust boundaries (P1)

**Sources:** cline/cline, warpdotdev/warp, agent0ai/agent-zero, openai/codex  
**Observed upstream signal:** Cline emphasizes MCP/plugins and `.clinerules`; Warp changelog says MCP servers detected from third-party agents become visible/spawnable and project MCP servers spawn from repo root; Codex docs expose MCP/skills/plugins surfaces.  
**PM current coverage:** PM has MCP Integration and central tool registry/permission model.  
**Gap:** Need config-import provenance and trust policy: imported MCP config is a suggestion, not automatically executable.  
**Plan change:** Add ImportedToolConfigSource records: source app/file, hash, cwd resolution, permission default, secret redaction, first-run review.  
**Target docs:** Plans/MCP_Integration.md, Plans/Tools.md, Plans/Permissions_System.md, Plans/FileSafe.md  
**Acceptance tests:**  
- Imported MCP server from `.claude`/Codex/Warp config defaults ask/disabled until reviewed.
- Relative command cwd is project-root only when explicitly resolved and shown.

### P1-CONTEXT-SKILL-BUDGETS — Skill/context catalog progressive disclosure (P1)

**Sources:** openai/codex, cline/cline, earendil-works/pi  
**Observed upstream signal:** Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.  
**PM current coverage:** PM Prompt Pipeline owns skill bundling and compaction algorithms.  
**Gap:** Need explicit skill/tool/catalog listing budgets and omission warnings in GUI.  
**Plan change:** Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries.  
**Target docs:** Plans/Prompt_Pipeline.md, Plans/Skills_System.md, Plans/Tools.md, Plans/Models_System.md  
**Acceptance tests:**  
- Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason.
- Selected skill loads full instructions only when chosen.

### P1-SECURITY-CREDENTIAL-LOGGING — Credential and sensitive output redaction timing (P1)

**Sources:** agent0ai/agent-zero, cline/cline, openai/codex  
**Observed upstream signal:** Agent Zero security issue raises credential leakage concerns; Codex issue list has PostToolUse redaction-before-transcript-rendering problem; Cline PRs add credential lifecycle debug logging.  
**PM current coverage:** PM has FileSafe and privileged session metadata minimization.  
**Gap:** Need a redaction-time ordering contract: raw tool output must not hit UI/transcript before redaction policy has a chance to apply, unless explicitly marked sensitive/raw local-only.  
**Plan change:** Add RedactionSettlement stage before UI/render/persistence for tool/terminal/model outputs; keep secure raw vault only when required for replay with explicit policy.  
**Target docs:** Plans/FileSafe.md, Plans/Permissions_System.md, Plans/Tools.md, Plans/storage-plan.md  
**Acceptance tests:**  
- Secret fixture in tool output is redacted before GUI transcript render.
- Privilege metadata logs actor/target/realm/transport without command secrets.

### P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE — CLI/server/extension protocol compatibility (P1)

**Sources:** agent0ai/agent-zero, cline/cline, openai/codex  
**Observed upstream signal:** Agent Zero CLI/server mismatch produced terminal corruption, false code-exec status, timeout, orphan, and cooked-mode issues; Cline CLI package/version issues and codesigning failures; Codex CLI releases patch platform/sandbox/proxy behavior.  
**PM current coverage:** PM has CLI_Bridged_Providers and ProviderRequestEnvelope.  
**Gap:** Need version/capability handshake and terminal-mode restore around all CLI bridges.  
**Plan change:** Add BridgeHandshakeReceipt: protocol version, binary hash, provider version, shell/terminal mode pre/post, cwd, capabilities, keepalive, timeout policy.  
**Target docs:** Plans/CLI_Bridged_Providers.md, Plans/Tools.md, Plans/Section15_MVP_Promoted_Features_Spec.md  
**Acceptance tests:**  
- Version mismatch blocks before raw protocol noise hits terminal.
- Bridge restores cooked mode/echo on crash or timeout.
- Orphan process cleanup receipts written.

### P1-AGENT-FOCUS-WATCHDOG — Agent focus/progress watchdog for GUI (P1)

**Sources:** warpdotdev/warp, cline/cline, openai/codex  
**Observed upstream signal:** Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.  
**PM current coverage:** PM has Goal Runtime and closure registry concepts, but terminal/dev-loop progress integration can be stronger.  
**Gap:** Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering.  
**Plan change:** Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents.  
**Target docs:** Plans/Goal_Runtime_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/Section15_MVP_Promoted_Features_Spec.md  
**Acceptance tests:**  
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.

### P2-DOCS-GENERATED-LINK-VALIDATION — Generated docs/release notes link validation (P2)

**Sources:** earendil-works/pi  
**Observed upstream signal:** Pi issue reports generated release-note relative links broken on GitHub/terminal and suggests improving prompt/tests.  
**PM current coverage:** PM has governance shards/evidence and plan validators.  
**Gap:** Need link-mode validators for generated Markdown across GitHub, local GUI, terminal/plaintext, and app viewer.  
**Plan change:** Add GeneratedMarkdownLinkCheck to governance seal.  
**Target docs:** Plans/Progression_Gates.md, Plans/Project_Output_Artifacts.md  
**Acceptance tests:**  
- Release notes/bootstrap docs validate relative links under repo, GitHub rendered, and app routes.

### P2-BINARY-PROVENANCE-ASSETS — Binary/provenance/codesigning (P2)

**Sources:** earendil-works/pi, cline/cline, openai/codex  
**Observed upstream signal:** Pi issue requests SHA256SUMS/provenance for binaries; Cline has AMFI/codesign killed CLI and Darwin sign PRs; Codex ships npm CLI releases.  
**PM current coverage:** PM has Spec Lock/governance hashes but product release asset provenance is not detailed.  
**Gap:** Need release asset signature/hash/SBOM policy for any PM distributed binary/plugin/bridge.  
**Plan change:** Add ReleaseArtifactProvenance PlanUnit.  
**Target docs:** Plans/Project_Output_Artifacts.md, Plans/Progression_Gates.md  
**Acceptance tests:**  
- Every downloadable binary/plugin has SHA256, signing/provenance, build source ref, and install verification.

### P2-GUI-NOT-CLI-CONTROL-PLANE — Translate CLI lessons into GUI adapter contracts (P2)

**Sources:** warpdotdev/warp, openai/codex, cline/cline, tmux/tmux  
**Observed upstream signal:** Warp became an agentic development environment born out of terminal; Codex offers CLI/app/IDE; Cline offers IDE/terminal/CLI/SDK/Kanban; tmux is terminal-native and scriptable.  
**PM current coverage:** PM is GUI-first and Section15 says terminal is canonical interactive shell surface, not app CLI.  
**Gap:** Need explicit non-goal: do not let a PM CLI become the main product. CLI/terminal lessons feed internal tool/adapter APIs, GUI command catalog, and embedded terminal behavior.  
**Plan change:** Add GUI-first terminal policy note: built-in terminal is a user shell and agent surface; PM command/control remains GUI/Goal/PlanUnit driven.  
**Target docs:** Plans/FinalGUISpec.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md  
**Acceptance tests:**  
- Every terminal action has GUI-visible state and command palette command; no core workflow requires opaque CLI-only state.

## Concrete PlanUnit suggestions

Add or update PlanUnits with these canonical names or equivalents:

| PlanUnit | Owner doc | Purpose |
|---|---|---|
| `TERMINAL-PROTOCOL-OSC-MATRIX` | Section15 / Built_In_Terminal_Runtime | OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate-screen, synchronized updates. |
| `TERMINAL-OUTPUT-BACKPRESSURE-RECEIPTS` | Section15 / storage-plan | Byte/cell/transcript/flush/paint/prune accounting. |
| `TERMINAL-ACCESSIBLE-TEXT-MIRROR` | Section15 / FinalGUISpec | Screen-reader text-state projection independent of renderer. |
| `TERMINAL-CLIPBOARD-PASTE-SAFETY` | Section15 / FileSafe / Permissions | Clipboard type priority, control-character paste, OSC 52, remote trust. |
| `TERMINAL-GLOBAL-HOTKEY-SAFETY` | FinalGUISpec / Section15 | Event-tap isolation, watchdog, safe mode. |
| `TOOL-TURN-SETTLEMENT` | Tools / CLI_Bridged_Providers | Truncation, nullable content, malformed tool calls, redaction, retryability. |
| `PROVIDER-NATIVE-METADATA-POLICY` | Models_System / Prompt_Pipeline | Thinking/reasoning/image/tool metadata replay/drop/canonicalize. |
| `HISTORY-OBJECT-BUDGETS` | storage-plan / Prompt_Pipeline | Per-message/tool-result/history caps and managed refs. |
| `RELEASE-COMPATIBILITY-MIGRATION` | Progression_Gates / Project_Output_Artifacts | Major-version migration, backup/restore, tags/assets/provenance, generated links. |
| `RUNTIME-RESOURCE-GOVERNOR` | FileManager / storage-plan / Runtime Artifacts | Watchers, indexers, transcript, MCP, agent quotas. |
| `AGENT-PROGRESS-HEARTBEAT` | Goal_Runtime_System / Runtime Artifacts | Last action, next check, stalled state, terminal snapshot trigger. |
| `IMPORTED-TOOL-CONFIG-PROVENANCE` | MCP_Integration / Tools | Third-party MCP/config import as reviewed, permissioned suggestions. |

## Terminal-specific “do not ship without” checklist

PM’s built-in terminal should not ship unless these are true:

1. Terminal protocol replay corpus covers OSC 52/8/9;4/133/633, bracketed paste, focus events, SGR mouse, alternate screen, synchronized updates, extended keys, wide/zero-width/grapheme cases.
2. PTY ingestion/render/storage has explicit backpressure and no-silent-loss receipts.
3. Copy/paste is correct for plain text vs URI/file types, control characters, remote trust, and OSC 52.
4. Accessibility has a real terminal text projection, not only labels around a GPU canvas.
5. Global shortcuts cannot freeze OS-wide input and have watchdog/safe-mode escape.
6. Command blocks are never fabricated under weak shell integration.
7. `terminal_session_id` continuity is not confused with tab/pane/dev-session continuity.
8. App update/relaunch/reopen surfaces exact live vs review-limited continuity.
9. TUI mouse/keyboard capture and terminal-level override paths are visible.
10. Terminal diagnostic bundle separates metadata from transcript content and respects secrets.

## GUI-first interpretation

PM should not become a CLI product because Cline, Codex, Warp, Agent Zero, and Pi have CLIs. PM should use their CLI lessons for **internal adapter contracts**:

- a GUI action should have the same deterministic envelope as a CLI command would,
- a terminal-visible shell action should still produce a canonical runtime event,
- imported CLI-agent/MCP configs should be reviewed by GUI policy,
- the built-in terminal is a user shell and agent surface, not the main product control plane,
- every terminal/agent state must be visible in GUI inspectors, command palette, runtime artifacts, and diagnostic bundles.

## Final recommendation

Treat this external repo pass as a new PM ledger input family:

- `external_repo_lesson`
- `terminal_protocol_lesson`
- `provider_tool_failure_lesson`
- `release_migration_lesson`
- `resource_governor_lesson`
- `gui_first_adapter_lesson`

Do **not** blend these into broad prose. Convert the P0/P1 rows into discrete PlanUnits with acceptance criteria and validators. The OpenCode review already showed PM needs stronger provider/session/tool settlement; this pass broadens the evidence: Cline/Agent Zero/Pi/Codex show model/provider/tool/context failure modes, while Ghostty/Warp/tmux show terminal/protocol/session/UI failure modes.



<!-- END_SOURCE_FILE: pm_external_repo_deep_evaluation_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: pm_second_pass_repo_gap_review_2026-07-03.md; SHA256: 8a36fc649467e82176c8c4f1b460d38983a940d44b545e332582844076e7e56c; LINES: 405 -->

# Puppet Master Second-Pass External Repo Gap Review

Date: 2026-07-03  
Window: approximately 2026-01-03 through 2026-07-03, with a few adjacent late-December 2025 issues included when they were still active, still technically material, or repeatedly referenced inside the six-month window.

Repos covered again:

- `anomalyco/opencode`, including current V1/current release surface and the `beta/specs/v2` design set
- `cline/cline`
- `agent0ai/agent-zero`
- `earendil-works/pi`
- `openai/codex`
- `ghostty-org/ghostty`
- `warpdotdev/warp`
- `tmux/tmux`

## Honesty boundary

This was not a random spot check. I re-scanned the current live issue, PR, release, and specification surfaces, then opened targeted high-signal issue/PR bodies where titles, snippets, or previous pass gaps pointed to material PM risk. The largest upstream repos contain thousands of issues and pull requests, so I am not claiming every issue body was manually read line-by-line. The useful output is a second-pass failure-family audit, anchored to specific recent upstream signals and cross-checked against PM's current Plans docs, especially Tools and MCP.

## PM tool/MCP/terminal baseline actually read this pass

The biggest correction from the user's note is that PM already has a lot of the generic tool/MCP foundation. The second-pass deltas below intentionally avoid recommending generic "add MCP" or "add tool permissions" work.

### Tool and MCP current PM coverage

| PM doc evidence | What PM already covers |
|---|---|
| `Plans/Tools.md:6` | Tools is already the canonical plan for built-in tools, custom tools, MCP registry integration, permissions, provider routing, and how MCP fits in. |
| `Plans/Tools.md:23-27` | Built-in, custom, MCP, permission, and thin runtime tool contracts are in scope; MCP-discovered tools integrate with the central registry and policy. |
| `Plans/Tools.md:31-39` | GUI already exposes Settings > Advanced > MCP Configuration, Settings > Permissions, MCP-discovered tool rows, and usage rollups. |
| `Plans/Tools.md:47-63` | Permission action and precedence SSOT is `Plans/Permissions_System.md`; precedence is deterministic: mode override, session cache, persona, project, global, defaults. |
| `Plans/Tools.md:124-140` | Normalized tool results already distinguish success, runtime error, denied, declined, headless ask denied, FileSafe blocked, validation blocked, cancelled, timed out, and post-scan failure. |
| `Plans/Tools.md:6441-6500` | T-077/T-078 already require invalid tool args and truncated tool invocations to close with structured errors rather than synthesized empty/minimal/success-shaped results. |
| `Plans/Tools.md:6973-7090` | T-087/T-089 already define MCP underscore tool naming, wildcard layering, unavailable server structured errors, bounded reconnect, and degraded/unavailable user surfaces. |
| `Plans/MCP_Integration.md:1-7` | MCP Integration is the SSOT for MCP configuration, naming, availability, credential binding, and invalidation. |
| `Plans/MCP_Integration.md:14-37` | Canonical MCP identity is `{server_slug}_{tool_name}` and requested/effective availability are separate enums. |
| `Plans/MCP_Integration.md:87-89` | MCP schema handling already has `$ref` cycle handling, depth 32, 64 KiB cap, provider schema compatibility handling, and OAuth state keyed by provider/scope/client semantics. |
| `Plans/MCP_Integration.md:172-183` | Direct API, CLI bridge, and server bridge statuses are already distinguished in GUI; account/profile isolation applies to MCP bridges. |
| `Plans/MCP_Integration.md:905-953` | Portable entries and provider adapter configs are no-secrets projections; secrets resolve through refs or auth bindings. |
| `Plans/MCP_Integration.md:965-1008` | `/config/override/debug` already shows final effective MCP config/provenance/auth/sync read-only without mutating config, serializing secrets, or bypassing policy. |
| `Plans/MCP_Integration.md:1020-1074` | Canonical records/enums already exist: `mcp_server_record`, `mcp_runtime_availability`, `mcp_tool_record`, transport/scope/ownership/availability/config-sync fields. |
| `Plans/MCP_Integration.md:1205-1253` | MCP managed sessions are pooled by default; subprocess-per-call is prohibited except disposable diagnostic probes. |
| `Plans/MCP_Integration.md:1264-1313` | PM central registry/health/permissions/secrets layer is source of truth; provider-side adapter state is projection/bridge surface. |
| `Plans/MCP_Integration.md:1870-1914` | MCP account/profile isolation keeps auth state, workspace trust, history, approvals, runtime caches, and OAuth residue profile-local unless a safe PM overlay projects them. |
| `Plans/Permissions_System.md:108-120` | Permission system owns allow/ask/deny and policy must be applied before every dispatch, across nesting depth, child-run path, execution strategy, and provider surface. |
| `Plans/Permissions_System.md:124-136` | Mutable permission state requires locks; hooks that modify args/context trigger fresh permission evaluation; discovery is not execution approval. |
| `Plans/Permissions_System.md:1251-1281` | Target-bound approvals, preflight revalidation, provider exposure rules, remote-side-effect receipts, metadata minimization, and no-persist/no-echo rules are already defined. |

### Built-in GUI terminal current PM coverage

| PM doc evidence | What PM already covers |
|---|---|
| `Plans/Section15_MVP_Promoted_Features_Spec.md:175-191` | Terminal is shell-first and session-oriented; chat/output/problems/debug/ports consume terminal/dev-session state instead of owning PTY state. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md:195-214` | Terminal section, tab, pane, session, and dev-session identity are distinct; UI movement/labels never mint runtime identity. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md:729-745` | UI command catalog already exposes show/focus/new-tab/split/move/rename/clear/restart/terminate/kill/detach/reattach and reveals by canonical IDs. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md:760-779` | PM distinguishes guaranteed durable terminal presentation state, best-effort transcript/command metadata, and transient live PTY/TUI/selections/search. |
| `Plans/FinalGUISpec.md:13799-13845` | Terminal core is native screen/buffer state, diff-based painting, off-UI-thread PTY/buffer ingestion; DOM/React/webview terminal cores are non-ship. |
| `Plans/FinalGUISpec.md:13853-13864` | Terminal projections use bounded row windows, max 30fps throttling, 33ms batching, Rust ring buffers, and virtualized high-volume output. |
| `Plans/FinalGUISpec.md:22922-22975` | Terminal cards distinguish Open, Show, Rerun, Detach; Open/Show focus the same live session while Rerun creates a new card. |
| `Plans/FinalGUISpec.md:22978-23021` | Terminal preview cards are bounded, read-only, ref/blob-backed for large payloads, and must not mint pseudo-terminals. |

## What the second pass adds or changes

### 1. MCP lazy catalog/search must be specified as a shared-result-path feature, not just a context-budget optimization

**Upstream signals.** OpenCode has a repeated issue family around MCP tool schemas consuming too much context: several issues ask for lazy/dynamic loading, on-demand search, filtering, and tool/skill cache. OpenCode issue #8277 states that multiple MCP servers can add 50k+ tokens before the user sends a message; #7399 gives a Chrome DevTools MCP example where all 26 tools cost about 17k tokens while a focused agent may need only four; #17480/#17482 ask for dynamic/lazy schema loading; PR #12520 references tool-search requests including #9350, #8625, #8277, #7399, and #9461. Cline issue #9398 reports 20k+ token usage for a simple "hi" when multiple MCP servers are enabled.

**PM current state.** PM has central MCP registry, schema caps, effective availability, managed sessions, and permission rows. It does not yet appear to have an explicit lazy MCP catalog/search/materialization contract.

**Missed/underweighted delta.** Add a first-class `MCPToolCatalogIndex` / `ToolCatalogSearch` contract. It should separate:

- small always-visible tool summaries
- searchable catalog entries
- on-demand full schema materialization
- permission-filtered catalog visibility
- per-context budget receipts
- exact reason why a tool was omitted, hidden, deferred, or materialized

The most important caution from OpenCode PR #12520 is that a lazy path can accidentally bypass the normal MCP result-processing path and flatten images/resources/attachments into text. PM should require all MCP invocation paths — eager, lazy, search-selected, CLI-projected, server-bridge-projected — to converge through the same result settlement parser and rich-output retention contract.

**Target docs.** `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/Prompt_Pipeline.md`, `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`.

**Acceptance tests.** Fixture with 5 MCP servers and 100 tools must keep initial tool context below budget; selecting a tool materializes schema with permission receipt; rich image/resource/blob result from a lazy-selected tool must produce the same normalized result as eager invocation; unavailable/degraded servers still show searchable but non-callable entries with structured reasons.

### 2. Tool/history admission needs a quarantine layer before malformed provider-native tool turns become durable history

**Upstream signals.** Pi issue #3108 showed malformed empty-name tool calls poisoning the session in the prior pass; the second pass found more parser/history variants: Pi issue #952 reports reasoning text appended after tool-call JSON causing `JSON.parse()` crash; Pi issue #4228 says streaming deltas may contain content, reasoning_content, and tool_calls in the same JSON object with no ordering; Pi issue #4226 reports MCP params being converted to strings instead of preserving booleans/numbers; OpenCode issue #8137 shows OpenAI-compatible typed validation failures with a tool call; Agent Zero issue list currently includes truncated tool-call turns treated as successful and v2 tool-call parser regressions.

**PM current state.** PM already has T-077/T-078 for invalid args and truncated invocations. That is strong at dispatch/result level.

**Missed/underweighted delta.** Add a `HistoryAdmissionGate` before session persistence and replay. A tool call or assistant message should not become durable provider replay material until it passes:

- tool name validity
- tool call ID validity
- JSON argument parse and bounded recovery policy
- native type preservation
- no duplicate/empty tool call block
- reasoning/content/tool delta normalization
- provider-specific role-order and reasoning replay requirements

Bad entries should be quarantined as `provider_turn_rejected` or `history_replay_blocked`, not silently repaired into durable history and not replayed forever.

**Target docs.** `Plans/Prompt_Pipeline.md`, `Plans/storage-plan.md`, `Plans/Tools.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`.

**Acceptance tests.** Store/replay fixtures for empty tool name, duplicate tool ID, JSON-with-trailing-reasoning, same-delta content+reasoning+tool_calls, stringified MCP booleans, and length-truncated tool call. None may produce `allowed_succeeded` or poison future turns.

### 3. Provider capability epochs must cover model-switch sanitization, route-specific limits, and stale/ghost catalog entries

**Upstream signals.** Cline PR #10007 corrected MiniMax context window values and notes that other provider sections impose different route-specific limits; Cline PR #11119 intentionally added a static model catalog for a new provider and left dynamic refresh out of scope. Pi issues #2029, #3061, #6206, and #6259 expose hardcoded/stale context windows, impossible `maxTokens > contextWindow`, ghost models, and conflation of context-window clamping with maxTokens. OpenCode PR #27554 auto-discovers local OpenAI-compatible models and limits from `/models` when available.

**PM current state.** Previous OpenCode pass already recommended `ContextEpoch`. PM has model/provider/account requested/effective concepts, but this second pass shows the epoch also needs catalog provenance and route-specific limit identity.

**Missed/underweighted delta.** Extend `ContextEpoch` or add `ProviderCapabilityEpoch` with:

- source of model metadata: static, provider `/models`, user override, local/LAN probe, bridge-provided, cached
- freshness and last validation
- route-imposed context window and max output distinct from provider-native model capability
- account/profile scope
- model-switch sanitizer for images, reasoning blocks, tool histories, max-token params, and system/developer role differences
- ghost/deprecated model handling

**Target docs.** `Plans/Models_System.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Prompt_Pipeline.md`, `Plans/usage-feature.md`.

**Acceptance tests.** Model catalog fixture where direct provider reports 204800 context but route reports 80000; `maxTokens > contextWindow`; static provider catalog stale; local `/models` lacks limits; user switches from vision model to text-only model with image history; thinking model to non-thinking model with reasoning metadata. The effective request must show what was dropped, transformed, or blocked.

### 4. Reasoning/thinking metadata is not one provider quirk; it is now a cross-provider replay contract

**Upstream signals.** OpenCode issues #24722, #25758, #23830, #24190, #10996, #13002, and others repeatedly show `reasoning_content`/`reasoning_details` replay problems across DeepSeek, Kimi, HuggingFace/OpenAI-compatible paths, and GLM. Pi issues #3635/#3636, #3668, #4251, #4505/#4507, and #5309 show the same class across DeepSeek, Kimi, MiMo/Xiaomi, and OpenRouter. Agent Zero issue list currently includes reasoning dropped by a LiteLLM transport.

**PM current state.** Prior pass already recommended provider-native metadata policy. This pass upgrades that to a must-have compatibility matrix and history-admission/replay gate.

**Missed/underweighted delta.** Add a `ProviderNativeReplayMatrix` with explicit fields:

- `requires_reasoning_content_on_assistant_messages`
- `requires_empty_reasoning_content_even_when_absent`
- `forbids_reasoning_details_replay`
- `requires_thinking_signature`
- `requires_user_first_after_system`
- `allows_assistant_first_greeting`
- `allows_images_in_history`
- `tool_call_delta_ordering`
- `system_vs_developer_role_mapping`
- `tool_result_role_mapping`

**Target docs.** `Plans/Models_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Provider_OpenCode.md`.

**Acceptance tests.** Multi-turn replay tests for DeepSeek/Kimi/MiMo/OpenRouter/Claude-compatible/OpenAI-compatible with tool calls and reasoning enabled; model switch from thinking to non-thinking; provider route through generic OpenAI-compatible proxy to Claude requiring user-first order.

### 5. MCP parameter fidelity needs explicit native JSON typing tests

**Upstream signals.** Pi issue #4226 reports MCP parameters converted to strings before `tools/call`, causing standards-compliant servers to reject booleans/numbers. This is not covered by generic schema validation if PM validates pre-dispatch but then serializes through a lossy adapter.

**PM current state.** PM has MCP schema caps and provider schema adapter compatibility, plus invalid args pre-dispatch.

**Missed/underweighted delta.** Add adapter round-trip tests for MCP `tools/call` payload fidelity:

- boolean remains boolean
- integer/number remains number
- array/object remains structured
- null handling is explicit
- no stringification in CLI bridge, HTTP/SSE/streamable HTTP, server bridge, plugin hook, or persisted replay paths

**Target docs.** `Plans/MCP_Integration.md`, `Plans/Tools.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Executor_Protocol.md`.

### 6. MCP credential/header resolution hooks are needed, but must be permission- and secret-safe

**Upstream signals.** Agent Zero PR #1469 adds `resolve_mcp_server_headers` at both streamable HTTP and SSE transport paths and adds settings extension hooks for credential scanning. This is a useful pattern, but also a danger point: plugins must not monkey-patch or read raw secrets casually.

**PM current state.** MCP no-secrets adapter projection and OAuth/token sharing are well specified; plugin hooks and permissions require fresh evaluation after mutation.

**Missed/underweighted delta.** Add an explicit `MCPHeaderResolutionHook` contract:

- secret placeholders resolve only at call/connection construction time
- resolved secrets never enter catalog, model context, debug config, logs, or persisted adapter config
- hook identity is receipted
- hook output is redacted and has a data-class label
- permission policy re-runs after hook mutation
- hook can narrow but not widen scope

**Target docs.** `Plans/MCP_Integration.md`, `Plans/Permissions_System.md`, `Plans/Plugins_System.md`, `Plans/Tools.md`.

### 7. Context-budget accounting must distinguish tool schema, skill instructions, MCP schemas, git/PR instructions, document memory, and retrieved blobs

**Upstream signals.** OpenCode issue #26661 asks to reduce initial system prompt token overhead and links MCP schema bloat and moving git/PR instructions out of bash tool description. OpenCode's repeated MCP lazy-loading issues make the same point. Agent Zero release v1.19 moved long tool instructions into a document-query skill with compact stubs, and Codex Skills official docs use progressive disclosure so only skill names/descriptions/paths are initially loaded while full SKILL.md loads on demand.

**PM current state.** PM has usage, context, tools, and skills concepts; prior pass already added skill/context budgets. The second pass says budgets must be per-source and receipted, not just aggregate.

**Missed/underweighted delta.** Add `ContextBudgetReceipt` source families:

- user prompt
- durable conversation/history
- system/developer instructions
- PM policy/invariants
- tool descriptions
- MCP tool schemas
- skill summaries
- loaded skill bodies
- retrieved files/docs/memory
- terminal/tool outputs
- images/resources/blobs
- provider-native replay metadata

**Target docs.** `Plans/usage-feature.md`, `Plans/Prompt_Pipeline.md`, `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/assistant-memory-subsystem.md`.

### 8. Agent interrupt/cancel semantics must halt tool calls without wiping state or converting cancellation into tool failure

**Upstream signals.** Agent Zero issue #1208 says the only way to stop a looping/stuck agent was restarting the Docker container, and asks for a stop button that halts the active response and tool calls, returns UI to idle, and preserves history up to interruption. OpenCode v2 specs include `sessions.interrupt` and effect interruption in tool invocation context.

**PM current state.** PM has `cancelled` as a normalized tool result and terminal/session lifecycle actions.

**Missed/underweighted delta.** Ensure cancellation is a first-class run/tool settlement state:

- user stop vs timeout vs provider disconnect vs policy denial vs tool self-error are distinct
- cancellation attempts propagate to provider stream, tool subprocess, MCP call, browser/device session, and child run
- partial outputs are retained as partial/cancelled, not success
- history records an interruption boundary and does not replay unfinished tool turns as normal assistant state

**Target docs.** `Plans/Goal_Runtime_System.md`, `Plans/Tools.md`, `Plans/Executor_Protocol.md`, `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`.

### 9. Terminal semantic prompt markers require a region- and pane-aware parser, not just a command-block heuristic

**Upstream signals.** tmux issue #5237 explains why OSC 133 forwarding through tmux needs native parsing, active-pane scoping, visibility scoping, or allowlists rather than raw DCS passthrough; Ghostty issue #10379 shows OSC 133 parser fragility when Claude Code emits a bare key without `=`; Ghostty issue #11138/#12996 family shows shell-native click-to-move and OSC 133 click events interactions; tmux issue #4918 covers overly clearing OSC133 flags; Ghostty issue #5932 calls out row-based vs region-based semantic prompt handling.

**PM current state.** PM's terminal identity and UI state model is strong; the prior report already recommended a broad protocol matrix.

**Missed/underweighted delta.** Specify `TerminalSemanticMarkerParser`:

- markers are regions, not only rows
- markers are scoped by terminal_session_id + pane + alternate-screen state + tmux/ssh/remote mediator path
- malformed/bare-key OSC params are tolerated and classified
- confidence tiers are explicit: native, shell-integrated, tmux-forwarded, passthrough-unverified, heuristic-only
- clearing/repaint operations cannot erase metadata incorrectly without a repair rule

**Target docs.** `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Contracts_V0.md`.

### 10. Terminal byte-stream parsing must be stateful across read chunks

**Upstream signals.** tmux issue #4983 reports DEC synchronized updates leaking structural commands when the begin/end pair spans multiple pane reads. This is a general parser warning: protocol state cannot be chunk-local.

**PM current state.** PM has off-UI-thread PTY/buffer ingestion, ring buffers, and high-output projection throttling.

**Missed/underweighted delta.** Add a terminal parser invariant: escape/control-sequence state spans arbitrary PTY read boundaries. Fixtures must split OSC, DCS, CSI, bracketed paste, synchronized update, hyperlink, and shell-marker sequences at every byte boundary and prove no structural control bytes leak into visible output.

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Executor_Protocol.md`.

### 11. Terminal accessibility mirror needs range/position APIs, not a whole-buffer text blob

**Upstream signals.** Ghostty issue #9932 says accessibility APIs returning the whole terminal blob caused a 3-second query and that screen readers/tools need visible range, range-for-position, and bounds-for-range behavior; Terminal.app returns only the viewport while Ghostty returned all scrollback.

**PM current state.** Prior report already called for an accessibility text mirror. This pass refines the acceptance criteria.

**Missed/underweighted delta.** Add `TerminalAccessibleTextProjection` with:

- visible-range query
- range-for-position query
- bounds-for-range query
- latest command-region query when known
- redaction-aware projection
- throttled updates
- no full scrollback on every accessibility query

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Accessibility.md` if present, `Plans/storage-plan.md`.

### 12. Terminal mediator/provenance diagnostics must cover tmux, SSH, mosh, ConPTY, warpification-like layers, and clipboard/OSC52 paths

**Upstream signals.** Warp issue #10516 shows selection-to-clipboard and OSC 52 failing across SSH+tmux and even after disabling warpification; tmux issue #5237 highlights mux passthrough scoping; Warp issue #11398 points to bundled ConPTY age breaking PowerShell 7.6.x on Windows; Codex issues in the previous pass exposed Windows sandbox helper fragility.

**PM current state.** PM has terminal session identity, restore outcomes, and GUI actions. It still needs a terminal-host/mediator diagnostic matrix.

**Missed/underweighted delta.** Add `TerminalHostProvenance`/doctor receipts:

- OS, shell, PTY backend, ConPTY/OpenConsole/conhost version, pty wrapper, tmux/mosh/ssh nesting, remote local/remote cwd, TERM, terminal feature negotiation
- OSC52 clipboard path: local selection, keyboard copy, OSC52 local, OSC52 remote, tmux passthrough, SSH policy
- user-visible degraded states: clipboard unsupported, prompt markers untrusted, bracketed paste unavailable, ConPTY incompatible

**Target docs.** `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/Automated_Testing_System.md`, `Plans/Runtime_Artifacts_Panel.md`.

### 13. Terminal memory and resource ceilings should include AI-CLI/TUI workloads explicitly

**Upstream signals.** Ghostty issue #10289 reports a severe memory leak with multiple Claude Code CLI sessions, reaching 71.49 GB on a 16 GB system after 20-30 minutes. Pi issue #3148 says synchronous `find` over large roots can freeze the UI/event loop.

**PM current state.** PM has ring-buffered terminal projections and prior backlog included resource quotas. This pass adds concrete workload fixtures.

**Missed/underweighted delta.** Add stress fixtures for:

- multiple AI CLI/TUI sessions in four panes
- long shell-integrated sessions with MCP/tool output
- huge scrollback + accessibility queries
- synchronous file search over `$HOME`
- terminal + browser + subagent workloads concurrently

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Executor_Protocol.md`, `Plans/Automated_Testing_System.md`, `Plans/usage-feature.md`.

### 14. Trace/log redaction must happen before trace persistence, not only before provider transmission or UI export

**Upstream signals.** OpenAI Codex release 0.142.5 fixed a bug where full Responses WebSocket request payloads were written to trace logs.

**PM current state.** Permissions_System already says provider exposure requires data-class labeling and secret-scrub before provider transmission, and persisted/exported/screenshotted artifacts record redaction profile. This is strong but not necessarily specific to internal trace/debug logs.

**Missed/underweighted delta.** Add a `TraceRedactionBeforeWrite` invariant:

- full prompt/request/provider payloads must never be written to trace logs by default
- trace events get bounded summaries and content refs only after scrub policy
- raw local-only debug capture requires explicit opt-in, expiry, encryption, and export warning
- WebSocket/streaming frames are subject to the same rules as HTTP requests

**Target docs.** `Plans/Permissions_System.md`, `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/Privacy_Security.md` if present.

### 15. Plugin/UI extension points should be typed and stable enough to avoid monkey-patching

**Upstream signals.** Agent Zero PR #1469 added per-row sidebar extension points because previous plugin authors had to use MutationObserver, DOM scanning, and monkey-patching internal store methods. The same PR added settings hooks for credential scanning.

**PM current state.** PM has Plugins_System and permission hook revalidation in Permissions_System.

**Missed/underweighted delta.** Add an extension-point compatibility matrix:

- typed UI slots for tool/MCP rows, chat/session rows, terminal/session rows, model/provider rows, runtime artifact rows
- stable context object fields and versioned schema
- forbidden DOM scraping / private-store monkey-patching for privileged surfaces
- mutation hooks must trigger post-hook permission recheck and produce receipts

**Target docs.** `Plans/Plugins_System.md`, `Plans/Permissions_System.md`, `Plans/MCP_Integration.md`, `Plans/FinalGUISpec.md`.

### 16. Rich GUI text rendering fidelity belongs in PM's test matrix, separate from terminal byte fidelity

**Upstream signals.** Warp issue #12923 reports rendered Markdown/rich UI glyph misrendering where source bytes are correct but displayed glyphs are wrong. This is not a terminal PTY issue; it is a GUI rich-text/rendering stack issue.

**PM current state.** PM has GUI and terminal plans but the previous terminal protocol matrix does not cover rendered Markdown/source byte fidelity.

**Missed/underweighted delta.** Add rendered-text fixtures for:

- ASCII ligature-looking sequences (`fi`, `fl`) rendered without source mutation
- bullets, arrows, box drawing, emoji, combining marks, CJK width, zero-width joiners
- raw/source view vs rendered view parity
- copy/paste from rendered views preserving source bytes

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Plan_Document_System.md`, `Plans/Automated_Testing_System.md`.

### 17. Config/schema migration gates should test accepted/retired config names across repo, app, CLI bridge, and server bridge

**Upstream signals.** OpenCode v2 config deliberately drops/reworks legacy fields and discovers `opencode.json`/`opencode.jsonc`; OpenCode issue #8868 reports agents/commands disappearing depending on `opencode.json` vs `opencode.jsonc`. Cline and Agent Zero release issues show upgrade/migration failure and missing tags.

**PM current state.** Previous pass covered release/migration gates. This pass adds concrete config compatibility fixtures.

**Missed/underweighted delta.** Add config-name and schema migration fixtures:

- accepted current names
- retired legacy names with explicit error/help
- JSON vs JSONC handling
- generated bridge config path and cwd/profile root
- server-attached vs PM-managed config projections
- migration dry run and rollback

**Target docs.** `Plans/MCP_Integration.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Release_Process.md` if present.

## Covered items that do not need new generic recommendations

These were re-confirmed as mostly covered by PM's current plans, though some test fixtures above should be added:

- Generic tool permission model: covered by Tools + Permissions.
- MCP central registry and GUI rows: covered by Tools + MCP Integration.
- MCP requested/effective availability and degraded/unavailable status: covered by MCP Integration + T-088/T-089.
- MCP no-secrets adapter projection and OAuth state: covered by MCP Integration.
- Subagent/child-run identity as PM-owned rather than provider-local actor: covered by Tools.
- Terminal shell-first GUI placement and session identity: covered by Section 15.
- Terminal native renderer/anti-flicker and ring-buffer projection: covered by FinalGUISpec.
- Terminal cards versus pseudo-terminal previews: covered by FinalGUISpec.
- Runtime permission hook revalidation: covered by Permissions_System.

## Priority backlog summary

| ID | Priority | New or adjusted? | Target |
|---|---:|---|---|
| P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH | P0 | New / sharper than prior MCP lazy exposure | Lazy catalog/search with shared rich-result settlement path |
| P0-HISTORY-ADMISSION-SANITIZATION | P0 | New | Quarantine malformed provider/tool turns before durable history |
| P0-PROVIDER-CAPABILITY-EPOCH | P0 | Extends previous ContextEpoch/provider metadata recommendations | Capability/source/freshness/route-specific limits/model-switch sanitizer |
| P0-REASONING-REPLAY-MATRIX | P0 | Stronger version of previous provider-native metadata policy | Cross-provider reasoning/thinking replay/drop matrix |
| P0-MCP-TYPED-PARAM-FIDELITY | P0 | New | Native JSON type round-trip for MCP calls |
| P1-MCP-HEADER-SECRET-HOOKS | P1 | New | Runtime-only credential/header resolution hooks with recheck receipts |
| P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE | P1 | Stronger version of prior skill/context budget | Per-source context budget accounting and GUI receipts |
| P1-INTERRUPT-CANCEL-SETTLEMENT | P1 | Extends prior heartbeat/watchdog | Stop active agent/tool calls without wiping history or false success |
| P1-TERMINAL-SEMANTIC-MARKER-PARSER | P1 | Refines prior terminal protocol matrix | OSC133/633 region/pane-aware parser and confidence tiers |
| P1-TERMINAL-CHUNK-SPANNING-PARSER | P1 | New terminal parser invariant | Escape/control state spans arbitrary PTY reads |
| P1-TERMINAL-A11Y-RANGE-MIRROR | P1 | Refines prior accessibility mirror | Visible range/position/bounds APIs, no whole-buffer blob |
| P1-TERMINAL-HOST-PROVENANCE-DOCTOR | P1 | Refines prior terminal platform matrix | tmux/SSH/mosh/ConPTY/OSC52/clipboard diagnostics |
| P1-TRACE-REDACTION-BEFORE-WRITE | P1 | New | No full prompt/request/WebSocket payloads in trace logs |
| P1-PLUGIN-EXTENSION-POINT-CONTRACTS | P1 | New | Typed extension points; no monkey patching privileged UI/store surfaces |
| P2-RICH-TEXT-RENDERING-FIDELITY | P2 | New | GUI rendered Markdown/text glyph and copy/source-byte fidelity |
| P2-CONFIG-SCHEMA-MIGRATION-FIXTURES | P2 | Extends release/migration gate | Accepted/retired config names, JSON/JSONC, bridge projection paths |

## Bottom line

The second pass does not overturn the previous reports. It narrows them. PM already has a strong central tool/MCP and GUI-terminal base. The most valuable additional work is at the boundary where real upstream systems repeatedly failed:

1. lazy tool/MCP cataloging without lossy result handling,
2. malformed provider/tool turn quarantine before history persistence,
3. provider capability epochs and model-switch sanitizers,
4. native JSON/MCP parameter fidelity,
5. terminal protocol state machines and semantic prompt marker confidence,
6. trace redaction before any persistence,
7. typed plugin/config extension points to avoid monkey-patching,
8. rendered-text fidelity separate from terminal-core fidelity.

Those are the places where OpenCode, Cline, Agent Zero, Pi, Codex, Ghostty, Warp, and tmux expose repeat failure patterns that PM can avoid before implementation.


<!-- END_SOURCE_FILE: pm_second_pass_repo_gap_review_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: pm_context_cache_websocket_repo_pass_2026-07-03.md; SHA256: d3d1d17b7d00991e55fc81330a1fb3cd13762609770c4535593e75a9e522e30b; LINES: 477 -->

# PM External Repo Pass — Context, Token Caching, and WebSocket/Streaming Transport

Date: 2026-07-03  
Scope window: approximately 2026-01-03 through 2026-07-03, with adjacent late-2025 issues included only when they remained active or directly informed the six-month findings.

Repos and surfaces re-reviewed:

- `anomalyco/opencode`, including v1/current issue and PR surfaces plus v2/runtime/context specs
- `cline/cline`, including VS Code extension changelog, CLI/SDK changelog, provider/model/cache fixes, and recent issue/PR surfaces
- `agent0ai/agent-zero`, especially prompt assembly, lazy tools, memory/concurrency, WebSocket/session reliability, and local-model context handling
- `earendil-works/pi`, especially OpenAI Responses/Codex transport, prompt caching, WebSocket retry/timeout, stream admission, usage accounting, and context windows
- `openai/codex`, especially app-server, config, skills, usage, compaction, WebSocket transport, and streaming/session issues
- `ghostty-org/ghostty`, `warpdotdev/warp`, and `tmux/tmux`, only where they inform PM’s GUI terminal stream/backpressure/session model and not as LLM provider models

## Honesty boundary

This is a targeted second/third-pass research audit, not a random spot check. I re-read PM’s own current context/cache/tool/MCP/runtime coverage first, then re-scanned upstream issue/PR/release/spec surfaces for the context-token-cache and WebSocket/streaming layers. The largest upstream repos contain thousands of open and closed issues; I am not claiming every issue body was individually hand-read line by line. The output below is a systematic failure-family and plan-delta pass focused on the specific underweighted topics the user flagged.

## Executive conclusion

PM should treat **context efficiency** as a first-class runtime subsystem, not as “some provider prompt caching.” The repo pass shows at least five different concerns that must not be collapsed:

1. **Provider prompt/prefix cache** — provider-side reuse of a stable request prefix, with provider-specific request markers, routing keys, retention, cache-read/write usage fields, and unsupported/unknown states.
2. **PM context assembly cache** — deterministic construction of the model-visible baseline, stable context-source ordering, context epoch identity, and safe admission of changing environment/config/tool facts.
3. **Tool/skill/MCP catalog cache** — progressive disclosure, lazy schema materialization, searchable L2 catalogs, plugin descriptor caches, and permission-filtered materialization.
4. **Durable history/context cache** — compaction, session history projection, model/provider-switch replay policy, and avoiding duplicate/partial stream persistence.
5. **Artifact/output cache** — large tool result/object storage, rich result retention, terminal scrollback, browser/device snapshots, and redaction-before-write.

PM already has good pieces: requested/effective provider identity, usage/ledger thinking, OpenCode SSE bridge policy, MCP schema caps, tool result failure enums, compaction acceptance tests, Firecrawl cache-state lineage, and runtime artifact lineage. The missing piece is a **unified Context + Cache + Transport contract** that makes cache scope, cache epoch, cache hit/miss evidence, stream durability, and WebSocket/SSE fallback visible and testable.

For WebSockets: use them aggressively where they fit PM’s GUI architecture, but not blindly. WebSockets are the right default for **PM GUI ⇄ local runtime/app-server bidirectional control**, terminal/browser/device/control streams, approvals, steering, cancellation, and live run events. They are not automatically the right provider transport when an upstream bridge is explicitly SSE/HTTP or when replay/cursor semantics are missing. WebSocket is a fast duplex pipe, but it still needs bounded queues, origin/auth controls, backpressure strategy, retry/idle timeout, terminal event validation, and a durable event cursor separate from live paint frames.

## PM current coverage that should not be duplicated

These are the PM plan details I re-checked locally before proposing deltas.

| PM document evidence | Existing PM coverage |
|---|---|
| `Plans/Provider_OpenCode.md:16-24` | OpenCode is already defined as a server-bridged provider using local HTTP REST plus SSE. PM currently MUST use HTTP REST + SSE through the provider facade, not CLI bridging or ad hoc WebSocket. |
| `Plans/Provider_OpenCode.md:248-252` | PM already treats OpenCode `setCacheKey`, `store=false`, stripped OpenAI item IDs, and provider-specific cache markers as adapter evidence, not PM storage canon. |
| `Plans/Provider_OpenCode.md:297-303` | PM already has an SSE mapping for OpenCode async/streaming events and emits `done` on completed/failed session status. |
| `Plans/Provider_OpenCode.md:328-332` | PM already notes prompt-cache-friendly separation between stable static agent/provider prompt content and dynamic environment/instruction material. |
| `Plans/Automated_Testing_System.md:1311-1327` | PM already has compaction acceptance tests for context-circle usage/tokens/cost UI, Compact Now, `/compact` parity, compaction event statuses, failure/degraded state, and manual compaction not creating new cache lineage unless logical run lineage changes. |
| `Plans/MCP_Integration.md:87-89` | PM already has MCP `$ref` cycle handling, resolved schema depth cap 32, 64 KiB size cap, provider schema compatibility facts, and OAuth state keyed by provider/scope/client semantics. |
| `Plans/Tools.md:1837-1838` | PM already records Firecrawl cache and usage lineage via `creditsUsed` and `metadata.cacheState` as `firecrawl_credits_used` and `firecrawl_cache_state`. |
| `Plans/Tools.md:2224-2226` | PM already assigns Tools ownership for explicit tool-level cache routing and provider capability decisions while usage, storage, prompt-cache, and provider bridge owners keep narrower contracts. |
| `Plans/Models_System.md:42-80` | PM already distinguishes source/request/execution axes and requires requested/effective provider, model, variant, effort, auth mode, and account identity. |
| `Plans/usage-feature.md` and `Plans/storage-plan.md` | PM already has a usage/seglog direction and shared lineage anchors such as `usage_event_ref`, `provider_attempt_ref`, attempt identity, and rollup/projection separation. |

The new deltas below therefore focus on exact cache/transport contracts rather than repeating generic tool/MCP or usage-visibility recommendations.

## Cross-repo findings

### 1. Provider prompt caching is exact-prefix infrastructure, not a semantic memory feature

OpenAI’s current prompt caching docs say cache hits require exact prefix matches; static content should be placed at the start and dynamic/user-specific content at the end. The same docs state prompts of 1024+ tokens are eligible, expose `cached_tokens` in usage, and can be influenced with `prompt_cache_key` for common prefixes. The Cookbook goes further: repeated system instructions, tool definitions, schemas, and messages are cacheable, but even small early-token changes can break cache hits.

OpenCode’s cache issues show what goes wrong when agent runtimes treat system prompt assembly casually. Issue #29672 argues that `AGENTS.md`, environment info, skill list ordering, workspace root, git status, and the current date change cache hit rate; issue #5224 says fetching 200 files into the environment prompt causes file churn to invalidate context and raise API costs. OpenCode issue #27692 shows explicit-cache providers may need request markers such as `cache_control: { type: "ephemeral" }`; issue #20265 shows Vertex Anthropic and Gemini require different cache telemetry paths and explicit provider checks.

**PM delta.** PM needs a provider-neutral `PromptCachePolicy` and provider-specific `PromptCacheAdapter` layer. It must not treat “cache supported” as boolean. Required statuses:

- `supported_automatic_exact_prefix`
- `supported_explicit_marker`
- `supported_prompt_cache_key`
- `supported_implicit_server_side`
- `supported_but_not_reported`
- `unsupported`
- `unknown`
- `disabled_by_policy`

Required usage fields:

- `prompt_cache_key_requested?`
- `prompt_cache_key_effective?`
- `cache_scope_hash`
- `cache_prefix_hash`
- `context_epoch_id`
- `baseline_context_hash`
- `cached_input_tokens?`
- `cache_read_tokens?`
- `cache_write_tokens?`
- `cache_creation_tokens?`
- `cache_hit_ratio?`
- `cache_miss_reason?`
- `cache_provider_metadata_raw_ref?`
- `cache_reporting_state = reported | not_reported | unsupported | adapter_parse_failed`

**Pitfall to avoid.** Do not display zero cached tokens as “provider did not cache” unless the provider reports a supported cache metric and the adapter parsed it successfully. Several upstream failures are telemetry failures, not actual cache failures.

### 2. ContextEpoch is the missing PM primitive

OpenCode v2’s `CONTEXT.md` is the cleanest external design signal in this pass. It defines Context Source, System Context Registry, Context Epoch, Baseline System Context, Context Snapshot, and Safe Provider-Turn Boundary. It also separates System Context from Session History, states that context changes are admitted lazily at safe provider-turn boundaries, and makes the baseline immutable for provider-cache purposes until compaction/session movement/incompatible context transition.

**PM delta.** Add a first-class `ContextEpoch` object with at least:

```json
{
  "context_epoch_id": "ctxep-...",
  "session_id": "...",
  "run_id": "...",
  "provider_profile_id": "...",
  "model_id": "...",
  "account_id": "...",
  "baseline_system_context_hash": "sha256:...",
  "context_source_registry_hash": "sha256:...",
  "tool_schema_set_hash": "sha256:...",
  "mcp_catalog_snapshot_hash": "sha256:...",
  "skill_list_hash": "sha256:...",
  "provider_capability_epoch_id": "...",
  "compaction_boundary_ref": null,
  "created_reason": "session_start | compaction_completed | incompatible_context_transition | provider_switch | model_switch | policy_switch | manual_reset",
  "prompt_cache_key_requested": null,
  "prompt_cache_key_effective": null,
  "cache_retention_policy": "provider_default | in_memory | extended_24h | ephemeral | none",
  "volatile_sources_excluded_from_baseline": [],
  "admitted_context_update_ids": []
}
```

`ContextEpoch` should sit beside PM’s existing runtime/session/run lineage, not inside a generic prompt string. It is the bridge between context assembly, compaction, provider cache, model switch, usage accounting, and replay policy.

### 3. Stable context sources must be separated from volatile observations

OpenCode and OpenAI both point to the same rule: stable prefix first, dynamic facts later. OpenCode users directly identified today’s date, workspace root, git flag, and generated file lists as cache breakers. OpenAI’s docs warn that small changes in early tokens invalidate exact prefix caching and that dynamic values should go to the end or metadata.

**PM delta.** Define a `ContextSource` registry with source types and cache roles:

- `stable_baseline`: PM identity, immutable product/system instructions, static tools, stable permission ceiling grammar
- `stable_per_project`: project rules, AGENTS-equivalent instructions, stable selected skills
- `stable_per_run`: run mode and requested/effective provider/model where stable for the epoch
- `volatile_turn_update`: cwd changes, git state, time/date, terminal active pane, selected file, workspace file list, browser/device state
- `model_hidden_snapshot`: state used to decide whether a source changed, not sent to provider
- `metadata_only`: timestamps, diagnostics, route refs, tracing IDs that must not touch cacheable prompt text

Admissions happen only at safe provider-turn boundaries after durable input promotion and tool settlement.

**Acceptance test.** A session that crosses midnight, creates `.git`, or adds files must not mutate the baseline prefix. It should either emit a mid-conversation context update or keep the fact discoverable through tools/metadata. The cache prefix hash should stay stable unless a declared baseline source changed.

### 4. Tool, skill, and MCP catalogs need progressive disclosure and cache-aware gating

Cline’s CLI changelog explicitly records plugin descriptor caching per plugin/provider/model, global settings reads keyed by file mtime, and skill visibility behavior. Cline also moved system prompts through a dedicated system option instead of embedding them in message history, added manual/auto compaction, and preserves model output token limits for context math. Codex Skills use progressive disclosure: the initial skills list includes only names/descriptions/paths, full instructions load when selected, and the initial list is capped at 2% of the context window or 8,000 characters when unknown. Agent Zero issue #1328 reports full system prompt rebuilds, all tool descriptions loaded on every iteration, no prompt cache layer, all 14 tools loaded even if only one or two are used, and approximately 1M tokens/hour in moderate usage.

OpenCode issue #15256 proposes an L1/L2 tool/skill cache because long-running agents can carry full tool and skill catalogs every step. The issue was closed as not planned, but the failure mode is real and applies to PM.

**PM delta.** Add `ToolCatalogCache` / `SkillCatalogCache` / `MCPToolCatalogIndex` with:

- small always-visible summaries
- stable deterministic ordering
- permission-filtered visibility
- model/provider-specific descriptor cache
- full schema materialization only when needed
- rich result path shared with eager tools
- LRU or explicit pinning for active tools
- `allowed_tools`/tool-choice style gating that does not reorder or mutate the full tools array when preserving cache prefix matters

**Important distinction.** Lazy catalog loading is not just token optimization. It is a correctness risk: if eager and lazy tool paths use different result parsers, rich outputs such as images, binary artifacts, or MCP resources can be flattened or lost. PM must require all paths to converge through the same tool settlement layer.

### 5. Cache accounting must be provider-native, not estimated from generic token totals

OpenCode issues around Vertex Anthropic, Gemini implicit caching, Alibaba explicit caching, and DeepSeek cache telemetry show that each provider exposes cache data differently or not at all. Cline changelogs show repeated fixes to prompt-cache support, provider cache controls, inflated token counts, context-window limits, and cache support detection from cache-write pricing.

**PM delta.** Usage/Ledger should store a normalized cache envelope with source-specific raw refs. A usable shape:

```json
{
  "usage_event_ref": "usage-...",
  "provider_attempt_ref": "...",
  "provider_id": "...",
  "model_id": "...",
  "context_epoch_id": "...",
  "input_tokens": 0,
  "output_tokens": 0,
  "reasoning_tokens": null,
  "cached_input_tokens": null,
  "cache_write_tokens": null,
  "cache_creation_tokens": null,
  "cache_read_tokens": null,
  "cache_cost_savings_estimate": null,
  "cache_reporting_state": "reported | unsupported | not_reported | parser_failed | estimated",
  "cache_support_state": "automatic | explicit_marker | implicit_server_side | key_routed | unsupported | unknown",
  "provider_cache_metadata_ref": "artifact/ref-or-seglog-ref",
  "cache_miss_reason": null
}
```

**UI rule.** The context circle / usage hover should show: `Cached: 42k read / 8k write` only when measured; otherwise show `Cache: unsupported`, `not reported`, or `unknown`, not `0`.

### 6. Compaction is cache-sensitive and must be lineage-aware

Cline, Codex, Pi, and OpenCode all surface compaction/context-window issues: auto compaction to stay within context windows, manual compaction, history truncation, context window exceeded handling, and all-zero usage after aborted/truncated responses. PM already has compaction acceptance tests, but the cache implication should be more explicit.

**PM delta.** Add `CompactionCacheEffect`:

- compaction normally ends one `ContextEpoch` and starts another
- manual Compact Now does not create new cache lineage unless logical context changes
- compaction summaries must carry source/history hashes and cache invalidation reason
- UI should explain when compaction improves context fit but breaks prior provider cache prefix
- compacted histories must not include transient partial stream frames or raw full tool outputs

### 7. Durable history must not persist streaming partials as cumulative messages

Codex issue #30072 reports cumulative streaming snapshots being persisted as duplicate assistant messages, inflating context to hundreds of thousands of tokens. Cline had duplicate/partial UI and token count fixes. Pi issue #4345 says streams ending before a terminal chunk must be treated as interruption/error, not conversation success; Pi’s later release notes fixed inherited OpenAI Responses streams to fail before missing terminal events.

**PM delta.** Add `StreamHistoryCoalescer`:

- live stream frames are UI/progress only
- durable assistant message is written once, after terminal event and validation
- missing terminal event = retryable transport/provider error
- zero-usage aborted turn is not admitted as normal assistant content
- cumulative snapshot format must be normalized into final content or discarded before durable history
- stream deltas may create activity/progress records, but not replayable model history until settlement

### 8. WebSockets are right for PM’s GUI runtime, but SSE remains correct for some provider bridges

PM is a GUI product with a built-in terminal, browser/device surfaces, testing panes, approvals, run graph, and runtime artifact panels. Those are naturally bidirectional and live. WebSockets are useful because they provide two-way browser/server communication without polling. But browser WebSocket has no built-in backpressure, so incoming messages can fill memory or burn CPU if PM receives terminal output, logs, screenshots, or model events faster than it can process them.

Codex app-server offers JSON-RPC over stdio, experimental WebSocket, Unix-socket WebSocket, and off. Its docs explicitly warn that non-loopback WebSocket listeners are unauthenticated by default during rollout unless auth is configured, and it uses bounded queues that reject ingress when full with `-32001 "Server overloaded; retry later."` Pi’s OpenAI Responses issue argues WebSocket support can reduce per-turn overhead for long-running, tool-heavy workflows while retaining SSE fallback. Pi’s connection-reliability issue shows the opposite failure mode: WebSocket/auto transport waiting indefinitely before the first event, producing zero usage and no UI output until manual abort.

**PM delta.** Define `TransportPolicy` rather than “use WebSockets everywhere.” Decision inputs:

- locality: same-process, local process, local WebView, SSH tunnel, LAN, internet
- directionality: one-way event stream vs bidirectional steering/control
- replay: durable cursor/resume available or live-only
- auth: local-only, origin check, CSRF/runtime ID, capability token, signed bearer, mTLS
- backpressure: bounded queues, ack/resume, drop policy, overload code
- event volume: terminal bytes, screenshots, browser snapshots, model deltas, logs
- provider support: SSE-only, WebSocket supported, WebSocket experimental, SDK-only
- security realm: trusted local app, project server, remote workspace, untrusted browser

**Recommended PM transport defaults.**

| Surface | Recommended transport | Reason |
|---|---|---|
| PM GUI ⇄ PM local runtime event bus | WebSocket over loopback or app-local IPC; Unix socket where native stack supports it | Bidirectional steering, approvals, cancellation, progress, terminal/browser control. |
| PM GUI ⇄ PM runtime over remote tunnel | WebSocket only with origin validation + capability token/signed bearer + TLS/SSH tunnel policy | Fast live UI, but needs security hardening. |
| OpenCode bridge | Keep HTTP REST + SSE as current PM contract | PM plan already locks OpenCode as HTTP/SSE server bridge; changing to WebSocket would be speculative unless OpenCode exposes a stable WS API. |
| OpenAI Responses/Codex direct provider path | Use provider WebSocket where official/SDK-supported and semantically tested; keep SSE fallback | Pi and Codex show WebSocket value for long tool-heavy flows but also stall/reconnect risks. |
| Terminal pane local PTY bytes | Native PTY ingestion in Rust/native process; WebSocket only as UI transport if the renderer is remote/web-based | Preserve byte ordering, terminal parser state, and backpressure; do not make WebSocket the terminal engine abstraction. |
| Browser/device testing stream | WebSocket/WebRTC/CDP as appropriate, with snapshot refs and bounded frame queues | Bidirectional control + visible evidence; use refs for large artifacts. |
| Durable event replay | Cursor-based durable stream; can be SSE or WebSocket protocol above event store | Transport is less important than replay cursor and durable sequence. |

### 9. WebSocket transport requires explicit state machines, not a single reconnect loop

Agent Zero issue #1485 reports long streaming/tool-call-heavy conversations silently dying under concurrent sessions due to exceptions, O(n²) parsing per chunk, and a shared event loop. Cline fixed hub WebSocket idle reconnects. Codex issue #28579 reports fallback from WebSockets to HTTPS after idle timeouts. Pi issue #4945 reports working UI stuck with zero usage when a WebSocket/auto transport waits before first event. Codex’s app-server docs specify bounded queues and retry with exponential delay/jitter.

**PM delta.** Add `WebSocketStreamStateMachine`:

States:

- `connecting`
- `initialized`
- `subscribed_live`
- `subscribed_durable`
- `waiting_first_event`
- `streaming`
- `idle_heartbeat`
- `backpressured`
- `reconnecting`
- `fallback_active`
- `closing`
- `closed_clean`
- `closed_missing_terminal`
- `failed_auth`
- `failed_origin`
- `failed_overloaded`
- `failed_timeout`

Every stream must expose:

- `transport_attempt_id`
- `runtime_attempt_id`
- `provider_attempt_ref?`
- `last_durable_seq?`
- `last_live_frame_seq?`
- `first_event_deadline_at`
- `idle_deadline_at`
- `backpressure_state`
- `fallback_reason?`
- `user_visible_status`

### 10. Terminal repos reinforce byte-stream/backpressure/protocol correctness, not token-cache policy

Ghostty, tmux, and Warp do not add much to provider token caching. Their value is terminal-stream correctness. Ghostty 1.3.0 added scrollback search implemented by a dedicated search thread that locks in small slices to minimize impact on terminal I/O/rendering; it also fixed a paste/drag command-execution CVE. Warp’s 2026 changelog includes context-window crashes, restored agent conversations, streaming memory/CPU improvements, long-running shell-command countdowns, remote SSH reconnect noise reduction, terminal output crashes with long zero-width runs, MCP parameter serialization issues, and TUI redraw problems. tmux/terminal issue surfaces reinforce OSC 52/9;4/133/633, prompt movement, clipboard, and terminal capability edge cases.

**PM delta.** Do not route terminal correctness through provider context/cache design. Add a terminal-specific byte stream contract:

- local PTY byte ingestion off UI thread
- terminal parser preserves escape state across arbitrary chunks
- bounded scrollback storage independent of model context
- accessible text mirror/range APIs independent of renderer
- terminal output may create model-visible snippets only through explicit user/agent selection or bounded summarization receipts
- WebSocket is a transport for remote UI/runtime links, not the authoritative terminal state

## Proposed PM architecture changes

### A. `ContextEpoch` and `ContextSourceRegistry`

Add to `Plans/Prompt_Pipeline.md`, `Plans/storage-plan.md`, `Plans/Models_System.md`, and `Plans/usage-feature.md`.

Core rule:

> Every provider turn is assembled from a declared `ContextEpoch`. The baseline system context is stable, hashable, ordered, and replayable. Dynamic observations enter as chronological admitted updates only at safe provider-turn boundaries.

Acceptance fixtures:

- date changes do not mutate baseline prefix
- git init/delete does not mutate baseline prefix mid-epoch
- file list churn does not mutate baseline prefix
- skill/tool toggle either changes declared catalog epoch or emits mid-conversation update
- compaction creates a new epoch with source-history hashes
- model switch preserves/ends epoch according to compatibility matrix

### B. `PromptCachePolicy` and provider adapters

Add to `Plans/Models_System.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/usage-feature.md`.

Core rule:

> Cache support is provider/model/route/account scoped and must be represented as a capability with source/freshness, request knobs, measurement state, and fallback behavior.

Provider examples to encode:

- OpenAI: exact-prefix caching, `prompt_cache_key`, `prompt_cache_retention`, `cached_tokens`
- Anthropic/Bedrock/Vertex Anthropic: explicit cache-control markers and cache creation/read token metadata
- Gemini/Vertex Gemini: implicit server-side cached content counts when reported
- Alibaba/Qwen/DashScope: explicit `cache_control` markers where required
- OpenAI-compatible routes: default unknown unless adapter proves support
- OpenCode bridge: PM records upstream evidence from OpenCode without treating it as PM-native storage

### C. `ToolCatalogCache` / `MCPToolCatalogIndex`

Add to `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/Prompt_Pipeline.md`.

Core rule:

> Initial model context receives a bounded tool/skill/MCP summary. Full schemas and instructions materialize lazily or by active set, but all materialized paths share the same tool-result settlement and rich-output retention logic.

Acceptance fixtures:

- 100 MCP tools do not exceed initial context budget
- materializing tool schema does not reorder stable baseline tool list unless epoch changes
- disabled/denied/unavailable tools are searchable but not callable, with structured reasons
- rich MCP result from lazy selected tool equals eager-path normalized result
- plugin descriptor cache invalidates by provider/model/plugin hash

### D. `UsageCacheEnvelope`

Add to `Plans/usage-feature.md` and `Plans/storage-plan.md`.

Core rule:

> Usage events record cache metrics as measured provider facts, not generic estimates. Unknown/not-reported/unsupported are distinct states.

Acceptance fixtures:

- provider cache unsupported displays unsupported, not zero
- parser failure produces diagnostic and raw metadata ref
- provider reports cached tokens but PM misses parser -> audit failure
- cache hit rate visible per run/session/model/provider/account/profile
- rollups separate total input, uncached input, cached input, cache write, cache read, output, reasoning

### E. `StreamHistoryCoalescer`

Add to `Plans/Executor_Protocol.md`, `Plans/Prompt_Pipeline.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`.

Core rule:

> Live stream fragments are not replayable conversation history. Only settled turns become durable model history.

Acceptance fixtures:

- cumulative assistant snapshots persist once
- missing terminal event -> transport error, no assistant success
- zero-usage aborted turn remains aborted metadata, not replayable assistant content
- reconnection does not duplicate partial deltas
- SSE and WebSocket produce identical durable message objects for same provider payload

### F. `TransportPolicy` and `WebSocketStreamStateMachine`

Add to `Plans/Executor_Protocol.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/FinalGUISpec.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`.

Core rule:

> PM uses WebSockets for bidirectional GUI/runtime and remote-control streams where authenticated, bounded, and observable; PM uses SSE/HTTP/stdout/unix-socket/provider SDKs where those are the provider’s stable surface. The selected transport is a policy outcome with receipts.

Acceptance fixtures:

- WS origin rejected when wrong origin
- remote/tunnel WS requires capability token or signed bearer before initialize
- inbound queue overflow emits structured overload and retry-after/jitter guidance
- first-event timeout surfaces user-visible transport stall
- idle timeout reconnects or falls back without corrupting history
- live stream and durable cursor stream are separate
- OpenCode remains HTTP/SSE unless upstream contract changes
- terminal PTY high-output stream is bounded and does not freeze GUI or poison model history

## Prioritized backlog

### P0

1. `P0-CONTEXT-EPOCH-BASELINE` — Add `ContextEpoch`, `ContextSourceRegistry`, `BaselineSystemContext`, `ContextSnapshot`, and safe provider-turn admission.
2. `P0-PROMPT-CACHE-POLICY` — Add provider-neutral prompt cache policy plus provider adapters for OpenAI, Anthropic/Bedrock/Vertex, Gemini, Alibaba/Qwen, OpenCode bridge, and OpenAI-compatible unknown routes.
3. `P0-CACHE-USAGE-ENVELOPE` — Normalize cache usage/read/write/creation/hit/miss metrics and preserve raw provider metadata refs.
4. `P0-VOLATILE-CONTEXT-QUARANTINE` — Move time/date/git/file-list/workspace-root/active-pane and similar facts out of baseline prompt unless declared stable.
5. `P0-STREAM-HISTORY-COALESCER` — Ensure stream partials are live-only until terminal event; no duplicate/cumulative assistant persistence.
6. `P0-WEBSOCKET-TRANSPORT-POLICY` — Define WebSocket/SSE/stdout/unix-socket/HTTP selection, fallback, auth, origin, queue, and retry receipts.
7. `P0-WEBSOCKET-SECURITY-BOUNDARIES` — Add origin/CSRF/runtime-ID/capability-token/signed-bearer rules for GUI/runtime and remote/tunnel WebSockets.

### P1

8. `P1-MCP-TOOL-CATALOG-CACHE` — Add tool/skill/MCP L1/L2/progressive disclosure with rich result path parity.
9. `P1-COMPACTION-CACHE-EFFECT` — Make compaction’s cache impact visible in lineage, UI, usage, and acceptance tests.
10. `P1-PROVIDER-CAPABILITY-EPOCH-CACHE` — Extend provider/model capability epoch with catalog source/freshness, route limits, and cache support.
11. `P1-MODEL-SWITCH-REPLAY-SANITIZER` — Drop/retain reasoning, item IDs, cache keys, tool history, and images per provider/model compatibility.
12. `P1-LOCAL-LLM-CONTEXT-CAPS` — Enforce context caps on utility/memory/subagent models, not only the main provider call.
13. `P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS` — Add queue pressure, frame drops/defer, overload codes, and UI status.
14. `P1-TERMINAL-PTY-STREAM-CONTRACT` — Separate PTY byte stream, terminal parser state, scrollback cache, accessible mirror, and model-visible excerpts.

### P2

15. `P2-CACHE-OBSERVABILITY-DASHBOARD` — Add per-provider cache hit/miss/cost-savings views with unknown/unsupported states.
16. `P2-CACHEABLE-TOOL-OUTPUT-REFS` — Hash-addressed object refs for stable large tool outputs, with redaction-before-write and no secret cache.
17. `P2-TRANSPORT-SOAK-TESTS` — Long-running terminal/agent/browser/device WS/SSE soak tests with reconnect, sleep/wake, large-output, and terminal-protocol fixtures.
18. `P2-CACHE-PRIVACY-POLICY` — Make provider cache retention and org/account boundary visible; avoid promising manual cache clearing when provider does not support it.

## Practical design notes

### Do not overfit to WebSocket

“Use WebSockets where applicable” is right, but applicability is specific. For PM, WebSockets are a GUI/runtime transport and provider option, not a universal abstraction. The safest framing is:

- PM internal runtime live control: WebSocket-first.
- Provider SDK/Responses where WebSocket is officially supported and tested: WebSocket-preferred with SSE fallback.
- OpenCode server bridge: keep HTTP/SSE until OpenCode exposes a stable WS provider surface.
- Durable replay: cursor/sequence first; transport second.
- Terminal: PTY/parser state first; WebSocket only as one possible UI transport.

### Do not confuse context cache and memory

Prompt caching reuses provider compute for repeated prefixes. It does not store semantic PM memory, it does not prove storage, and it does not replace PM’s durable ledger/state. The provider cache key and PM context epoch should be linked, but they are not the same object.

### Do not hide cache misses

A cache miss should be inspectable. Useful `cache_miss_reason` values:

- `below_provider_threshold`
- `prefix_changed`
- `tool_schema_changed`
- `skill_list_changed`
- `context_epoch_changed`
- `compaction_epoch_changed`
- `provider_model_changed`
- `account_or_org_changed`
- `cache_retention_expired`
- `provider_overflow_or_reroute`
- `provider_does_not_report`
- `adapter_not_supported`
- `disabled_by_policy`

### Do not let streaming transport corrupt model history

The model-visible history must be derived from settled turns and tool settlements. WebSocket/SSE deltas should feed live UI and progress records; they should not become replayed messages until terminal success.

## Target PM docs for the eventual Plan pass

Recommended owner split:

- `Plans/Prompt_Pipeline.md` — ContextEpoch, ContextSourceRegistry, baseline/admission, StreamHistoryCoalescer, compaction cache effect.
- `Plans/Models_System.md` — provider/model/cache capability epoch, requested/effective cache support, model-switch replay sanitizer.
- `Plans/usage-feature.md` — UsageCacheEnvelope, cache rollups, UI copy, cache hit/miss/unsupported states.
- `Plans/storage-plan.md` — durable context epoch records, cache metadata refs, stream/history coalescing storage, redaction-before-write.
- `Plans/Tools.md` — tool cache routing, tool output cache refs, rich result settlement parity.
- `Plans/MCP_Integration.md` — MCPToolCatalogIndex, lazy schema materialization, provider/model descriptor caches.
- `Plans/Provider_OpenCode.md` — keep SSE/HTTP bridge; enrich OpenCode cache evidence normalization and clarify no WebSocket unless upstream contract exists.
- `Plans/CLI_Bridged_Providers.md` / `Plans/Executor_Protocol.md` — TransportPolicy, WebSocket state machine, fallback receipts.
- `Plans/FinalGUISpec.md` / `Plans/Runtime_Artifacts_Panel.md` — GUI transport indicators, context/cache details, terminal/browser/device stream states.
- `Plans/Automated_Testing_System.md` — cache and WebSocket fixture suite.


<!-- END_SOURCE_FILE: pm_context_cache_websocket_repo_pass_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: pm_missed_domains_repo_pass_2026-07-03.md; SHA256: 2acbb7669fa480617979713162d2c0a220d31848c81988167c8333498d690cac; LINES: 526 -->

# PM Fourth External Repo Pass — Missed Domains: Agent Control, Effort, Providers, Multimodal, Subagents, Logging, Looping, Memory, Resources

Date: 2026-07-03  
Scope window: approximately 2026-01-03 through 2026-07-03, with adjacent active late-2025 issues included only when they remain relevant.

## Scope

This pass re-reviewed the same external surfaces as the prior OpenCode/OpenCode v2, Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, and tmux passes, but with a different lens:

- controlling agents and autonomy
- effort / reasoning / thinking controls
- provider capability and model selection
- vision and multimodal input routing
- subagent lifecycle and result authority
- context management and token efficiency
- tool-call admission and settlement
- logging, telemetry, and trace privacy
- looping / no-progress / quota protection
- agent memory and system memory management
- GUI terminal resource behavior when terminal apps are agentic

This is intentionally not another generic MCP/tools pass. PM already has extensive Tools/MCP plans. The deltas below are the sharper adapter/runtime boundaries that remain easy to miss.

## Method and honesty boundary

I treated upstream repositories as failure-family evidence, not as code to copy. Large public repos contain thousands of open and closed issues; I am not claiming that every individual issue body in every repo was manually read line by line. This pass re-scanned current issue, PR, docs, changelog, and release surfaces for the domain families above, then compared them against the PM Plans repo locally. The output is a set of concrete PM plan deltas with acceptance tests.

## PM current coverage re-checked before proposing deltas

PM is already strong in several of these areas:

| Area | Existing PM coverage observed locally |
|---|---|
| Goal/subagent runtime | `Plans/Goal_Runtime_System.md:732-805` defines model-role policy and provider-neutral escalation; `1056-1137` defines progress fingerprints, hard budgets, max_turns/max_tokens/max_parallel_agents, and parent/child goal scope/budgets; `1917-1938` defines verification repair loops and receipt authority. |
| Provider/model/effort | `Plans/Models_System.md:32-80` owns provider/model precedence across run/seam/package/node/overseer/delegated-subagent scope and requested/effective values; `382-398` records requested effort and effective provider wire values; `4551-4612` covers runtime-qualified effort and GUI disclosure. |
| Tools/MCP | `Plans/Tools.md:1009-1230` and `Plans/MCP_Integration.md` define MCP integration, naming, availability, OAuth/auth state, schema caps, degraded states, and permissions. `Plans/Tools.md:7938-8005` has tool outcome taxonomy. |
| Subagent identity | `Plans/Tools.md:2541-2595` has canonical child run identity for subagents; Goal Runtime has parent/child goal constraints. |
| Vision/media | `Plans/Media_Generation_and_Capabilities.md` has provider media taxonomy, capability telemetry, and Vision Bridge eligibility; `Plans/Models_System.md:7793-7865` has Vision Bridge requested/effective route resolution. |
| Usage/logging/storage | `Plans/usage-feature.md` and `Plans/storage-plan.md` cover seglog, usage records, context breakdown, provider/attempt joins, redb/projectors, CRC/replay, and terminal persistence. |
| Memory | `Plans/assistant-memory-subsystem.md` defines assistant-only memory, scope separation, MemoryGist records, retrieval injection, scoring, maintenance, and storage boundaries. |
| Terminal GUI | `Plans/FinalGUISpec.md` has terminal tab/pane identity, context management, terminal projection throttling/ring buffers, crash recovery, usage projections, and memory/resource risks. |

So the pass does **not** say PM lacks these concepts. It says some concepts need a unified runtime contract so the GUI/runtime can prove what happened instead of relying on scattered prose or provider behavior.

## Cross-repo findings by missed domain

### 1. Agent control must be one runtime envelope, not scattered settings

OpenCode, Cline, Agent Zero, Pi, Codex, and Warp all show the same failure class: the agent may appear to be under control, but one of the child paths, tool paths, provider paths, or UI transport paths escapes the intended limits. External signals include subagent model/effort config not being honored, subagents looping, agents spending budget on no-progress paths, and terminal-bound agents flooding UI/logs.

PM already has the right ingredients: Goal Runtime budgets, provider/model role policy, permission ceilings, and child goal IDs. The missing object is **AgentControlEnvelope**. Every agentic execution unit should carry one envelope from birth to settlement.

### 2. Effort/reasoning controls are now a correctness surface

Reasoning effort is not a cosmetic dropdown. It affects provider payloads, thinking signatures, first-token latency, cost, tool-call quality, and replay compatibility. OpenCode reports subagent reasoning-effort and Anthropic thinking-signature failures. Codex reports effort resets/ignored settings and xhigh stalls. Cline and Pi show model/provider-specific thinking setting hazards.

PM already records requested/effective effort. The delta is **EffortSettlementReceipt**: prove the requested effort, policy effort, effective wire field, provider support, display label, fallback/clamp/ignore state, and reset detection for every attempt and child/subagent.

### 3. Provider capability must be epoch-scoped and multimodal-aware

Provider catalogs are not stable truth. The repos show wrong context windows, route-specific limits, custom provider modality gaps, ghost/incorrect model metadata, prompt-cache marker differences, and usage-field differences. PM’s requested/effective provider system is good; it now needs the next object: **ProviderCapabilityEpoch**.

The epoch should cover account/profile, provider endpoint, route, model, context limit, modalities, reasoning effort support, cache policy, tool support, usage reporting, transport, source confidence, and replay policy.

### 4. Vision/multimodal input is an admission problem

OpenCode and Cline issues show images being sent to text-only models, images rejected by OpenAI-compatible adapters, wrong MIME types, model capability misclassification, and fallback-captioning pressure. PM’s media system is strong on media generation/capability, but model input needs a discrete **MultimodalInputSettlement** before the artifact enters context.

The critical rule: never silently inject unsupported images as base64 or fake text. If a non-vision route uses a caption/transcription/OCR fallback, the GUI and receipt must say that the selected model saw the caption, not the original image.

### 5. Subagents need lifecycle and result settlement, not just invocation

Subagents are useful only when their scope, model/effort, context slice, tool ceiling, timeout, progress heartbeat, result authority, and parent completion policy are explicit. Codex official docs support specialized agents and custom model configs conceptually, but issue surfaces show config and visibility gaps. Cline’s SDK migration explicitly stabilized shared task/session/subagent behavior. Agent Zero release notes show child chats, parallel tools, and await timeouts.

PM has parent/child goals and subagent hard gates in prompts. Add a runtime **SubagentExecutionContract** so the GUI/runtime can tell whether a child is running, stalled, cancelled, settled, orphaned, or authoritative.

### 6. Loop control needs a taxonomy

A single identical-tool-failure guard is not enough. The external repos show at least these loop families:

- empty assistant message loop
- no-tool/no-action reasoning loop
- repeated failed edit loop
- truncated tool-call repair loop
- MCP missing resource/list loop
- compaction no-gain loop
- first-event/transport wait loop
- subagent repeated read/search loop
- search/no-match loop
- spend/quota anomaly loop

PM already has doom-loop guards and progress fingerprints. The delta is a **LoopBreakerRegistry** keyed by loop family, fingerprint, budget, terminal action, and GUI explanation.

### 7. Tool-call settlement must happen before durable history

PM already handles invalid args and truncated tool invocations. The sharper issue from Pi/OpenCode/Cline/Agent Zero is history poisoning: malformed deltas, partial JSON/XML, duplicate/empty tool calls, nullable reasoning/content, or stringified MCP params can enter replayable conversation state if admission happens too early.

Add **ProviderToolTurnAdmissionGate** before tool execution and before durable history writes. Only settled turns should be replayable.

### 8. Logging and telemetry need redaction-before-write and quotas

Codex issues show local logs can contain paths, env vars, account identifiers, and token-like data; another issue shows heavy idle I/O. Warp shows per-character terminal logging can create floods. Pi exposes OpenTelemetry-style hooks. OpenCode integrates with external monitoring headers.

PM has seglog and usage. The delta is **TracePersistencePolicy**: classify/redact before disk, enforce log-volume quotas, prevent terminal per-character info floods, and export only redacted projections to optional OTLP/analytics adapters.

### 9. Agent memory and system memory are different systems

Agent memory failures include huge chat files, slow memory search/consolidation, and stale/superseded facts. System memory failures include GUI renderers, terminal buffers, helper processes, MCP transports, browser/device sessions, file watchers, and logs exhausting memory/CPU.

PM has assistant memory and storage plans. It should add:

- **MemoryTierContract** for transcript, goal state, project/spec ledger, assistant preference memory, artifact/tool memory, and ephemeral working set.
- **RuntimeResourceGovernor** for process/memory/queue/log/file-watcher/terminal/browser/device limits and cleanup.

## Backlog matrix

| ID | Priority | Theme | Proposal |
|---|---:|---|---|
| P0-AGENT-CONTROL-PLANE-ENVELOPE | P0 | Agent control / autonomy / effort / resource envelope | Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs. |
| P0-EFFORT-POLICY-SETTLEMENT | P0 | Reasoning/thinking/effort requested-vs-effective | Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule. |
| P0-SUBAGENT-EXECUTION-CONTRACT | P0 | Subagent lifecycle, model/effort config, and result authority | Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper. |
| P0-LOOP-BREAKER-TAXONOMY | P0 | Looping / no-progress / spend control | Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason. |
| P0-MULTIMODAL-INPUT-SETTLEMENT | P0 | Vision/multimodal input admission and fallback | Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images. |
| P0-PROVIDER-CAPABILITY-EPOCH-2 | P0 | Provider/model capability freshness and route-specific support | Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers. |
| P0-TOOL-CALL-MALFORMATION-GATE | P0 | Malformed/truncated/partial tool-turn admission | Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy. |
| P0-LOG-REDACTION-BEFORE-WRITE | P0 | Logging, traces, diagnostics, and privacy | Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs. |
| P0-SYSTEM-RESOURCE-GOVERNOR | P0 | System memory/process/file-watcher/resource management | Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts. |
| P1-MODEL-SELECTION-ROUTER | P1 | Model selection per role/skill/tool/subagent | Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers. |
| P1-USAGE-ANOMALY-QUOTA-GUARD | P1 | Token/cost anomalies and quota protection | Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution. |
| P1-MEMORY-TIERING-CONTRACT | P1 | Agent memory, goal memory, project memory, conversation history | Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics. |
| P1-PROMPT-CACHE-STABILITY-LINTER | P1 | Prompt/cache/token efficiency hygiene | Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation. |
| P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS | P1 | Token efficiency for tools, skills, MCP, and docs | Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable. |
| P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS | P1 | Terminal-bound agent output storms and UI safety | Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression. |
| P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY | P1 | Fallback captioning/OCR/transcription as explicit route | Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure. |
| P1-STREAM-HISTORY-COALESCER-REPLAY | P1 | Streaming/admission/replay boundary | Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases. |
| P2-OTEL-EXPORT-OPTIONAL-ADAPTER | P2 | Observability export interoperability | Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so. |
| P2-MODEL-CATALOG-CONFIDENCE-UI | P2 | Provider/catalog confidence and user explanation | Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope. |


## Detailed backlog rows

### P0-AGENT-CONTROL-PLANE-ENVELOPE — Agent control / autonomy / effort / resource envelope

**Priority:** P0

**Source Repos:** OpenCode; Cline; Agent Zero; Pi; Codex; Warp

**Observed Signal:** Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.

**Pm Current Coverage:** PM already has Goal Runtime role-policy, progress fingerprints, hard budgets, parent/child goals, verification repair loop, provider/model requested/effective identity, and approval boundaries.

**Gap:** Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry.

**Proposal:** Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs.

**Target Docs:** Plans/Goal_Runtime_System.md; Plans/Models_System.md; Plans/Executor_Protocol.md; Plans/Tools.md; Plans/FinalGUISpec.md; Plans/storage-plan.md

**Acceptance Tests:** Every child run persists AgentControlEnvelope before first provider/tool call. | GUI can show requested/effective autonomy, model, effort, budgets, and authority. | A child/subagent cannot exceed parent ceiling even if model/tool output requests it. | Completion receipts include envelope hash and final budget state.

### P0-EFFORT-POLICY-SETTLEMENT — Reasoning/thinking/effort requested-vs-effective

**Priority:** P0

**Source Repos:** OpenCode; Codex; Cline; Pi

**Observed Signal:** OpenCode issues report subagent reasoning-effort config gaps, Anthropic thinking signature failures, and TUI display mismatches; Codex issues report reasoning resetting, ignored custom model slugs, xhigh stalls, and model/effort change failures; Pi and Cline show provider-specific thinking controls causing errors or stale settings.

**Pm Current Coverage:** Models_System already requires requested effort, effective provider wire value, unsupported/clamped effort disclosure, and runtime-qualified effort capability.

**Gap:** PM needs a settlement object that proves whether effort was honored, clamped, ignored, transformed, blocked, reset during continuation, or unsupported per provider attempt and per child/subagent.

**Proposal:** Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule.

**Target Docs:** Plans/Models_System.md; Plans/Provider_OpenCode.md; Plans/Goal_Runtime_System.md; Plans/usage-feature.md

**Acceptance Tests:** A model switch, compaction, resume, or subagent spawn emits a fresh effort settlement. | Unsupported xhigh/high cannot display as honored. | If provider accepts request but GUI label lags, diagnostic flags display_mismatch. | Stalls before first token/reasoning item are typed separately from ordinary thinking time.

### P0-SUBAGENT-EXECUTION-CONTRACT — Subagent lifecycle, model/effort config, and result authority

**Priority:** P0

**Source Repos:** Codex; OpenCode; Cline; Agent Zero

**Observed Signal:** Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes show child chats/parallel tools and non-destructive await timeouts.

**Pm Current Coverage:** PM has parent/child goal runtime policy, canonical child run identity for subagents, and prompt-packet subagent hard gates.

**Gap:** PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating.

**Proposal:** Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper.

**Target Docs:** Plans/Goal_Runtime_System.md; Plans/Tools.md; Plans/Executor_Protocol.md; Plans/storage-plan.md; Plans/FinalGUISpec.md

**Acceptance Tests:** A child can use a different allowed model/effort only if settlement proves it. | Parent cannot certify complete until all required child results are settled or explicitly waived. | Orphan helpers/processes are reaped on session close/crash/restart. | Subagent loops trip per-child and aggregate budgets.

### P0-LOOP-BREAKER-TAXONOMY — Looping / no-progress / spend control

**Priority:** P0

**Source Repos:** OpenCode; Cline; Agent Zero; Pi; Codex

**Observed Signal:** OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.

**Pm Current Coverage:** Executor has doom-loop guard and Goal Runtime has progress fingerprints, budgets, and verification repair loop.

**Gap:** The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops.

**Proposal:** Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason.

**Target Docs:** Plans/Executor_Protocol.md; Plans/Goal_Runtime_System.md; Plans/Tools.md; Plans/Provider_OpenCode.md; Plans/FinalGUISpec.md

**Acceptance Tests:** Fixtures for each loop family stop within bounded attempts. | Spend/quota caps terminate even when model output appears syntactically successful. | Compaction can run once or configured bounded times but cannot self-loop indefinitely. | GUI shows stopped_for_loop with fingerprint and last safe point.

### P0-MULTIMODAL-INPUT-SETTLEMENT — Vision/multimodal input admission and fallback

**Priority:** P0

**Source Repos:** OpenCode; Cline; Codex; Pi

**Observed Signal:** OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format gaps. Codex IDE officially supports image generation/editing and model/context surfaces.

**Pm Current Coverage:** Media_Generation_and_Capabilities has media route taxonomy, capability telemetry, Vision Bridge eligibility, media tool contracts, and no-stale capability cache. Models_System also has Vision Bridge requested/effective route resolution.

**Gap:** PM’s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context.

**Proposal:** Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images.

**Target Docs:** Plans/Media_Generation_and_Capabilities.md; Plans/Models_System.md; Plans/Tools.md; Plans/FinalGUISpec.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Text-only model + image file yields denied_or_captioned, never hidden prompt bloat. | Wrong MIME is blocked before provider request. | Vision-capable custom provider must prove modality support or fall back. | GUI can show original artifact and caption/fallback provenance.

### P0-PROVIDER-CAPABILITY-EPOCH-2 — Provider/model capability freshness and route-specific support

**Priority:** P0

**Source Repos:** OpenCode; Cline; Pi; Codex

**Observed Signal:** Repos show stale/wrong context-window metadata, route-specific limits, ghost models, model variant quirks, modality gaps, effort support uncertainty, and provider-native reasoning/tool replay drift.

**Pm Current Coverage:** Models_System has provider-owned catalogs, capability/cost gating, requested/effective identity, provider capability matrix application gate, and Vision Bridge route resolution.

**Gap:** Capabilities need epoch identity and source confidence across model catalog, context window, cache support, tool-calling, vision/media, reasoning effort, usage accounting, transport, and provider-native replay.

**Proposal:** Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers.

**Target Docs:** Plans/Models_System.md; Plans/Provider_OpenCode.md; Plans/MCP_Integration.md; Plans/usage-feature.md

**Acceptance Tests:** Changing account/profile/route/model invalidates capability epoch. | Unknown or stale capabilities cannot present controls as supported. | Model limit and cached-token accounting show measured/provider_reported/estimated/unknown. | Provider-native replay rules are keyed by epoch.

### P0-TOOL-CALL-MALFORMATION-GATE — Malformed/truncated/partial tool-turn admission

**Priority:** P0

**Source Repos:** OpenCode; Cline; Agent Zero; Pi

**Observed Signal:** OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.

**Pm Current Coverage:** Tools already has invalid arg/truncated invocation structured failures and a rich tool outcome taxonomy.

**Gap:** Malformed provider output must be stopped before durable history admission, not only before actual tool execution.

**Proposal:** Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy.

**Target Docs:** Plans/Tools.md; Plans/Prompt_Pipeline.md; Plans/Provider_OpenCode.md; Plans/storage-plan.md

**Acceptance Tests:** Partial streamed JSON/tool XML never becomes replayable assistant history. | A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response. | Replayed history never includes malformed or duplicate tool_call IDs.

### P0-LOG-REDACTION-BEFORE-WRITE — Logging, traces, diagnostics, and privacy

**Priority:** P0

**Source Repos:** Codex; OpenCode; Warp; Pi; Agent Zero

**Observed Signal:** Codex issues show raw logs with paths/env/account/token-like data, heavy idle I/O, and stale helper processes; Pi exposes OpenTelemetry hooks; OpenCode supports Helicone/monitoring headers; Warp issue logs show per-character terminal event floods.

**Pm Current Coverage:** PM has seglog, usage records, provider/usage join fields, terminal persistence, and runtime artifact identity.

**Gap:** Observability needs a redaction-before-write and log-volume contract shared by provider traces, WebSockets/SSE, terminal streams, subagents, tools, MCP, memory, and support bundles.

**Proposal:** Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs.

**Target Docs:** Plans/storage-plan.md; Plans/usage-feature.md; Plans/FinalGUISpec.md; Plans/Executor_Protocol.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Raw provider requests/WS payloads are scrubbed before disk. | Terminal huge-output fixture cannot create unbounded per-character logs. | Support bundle validator rejects secrets/env/token-like fields. | Usage/cost/log traces join by attempt_id without exposing hidden content.

### P0-SYSTEM-RESOURCE-GOVERNOR — System memory/process/file-watcher/resource management

**Priority:** P0

**Source Repos:** Ghostty; Warp; Codex; Agent Zero; Cline

**Observed Signal:** Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.

**Pm Current Coverage:** FinalGUISpec and storage-plan include terminal projection throttling/ring buffers, memory-bounds risks, file watcher risk, persistence, and crash recovery.

**Gap:** PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes.

**Proposal:** Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts.

**Target Docs:** Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Goal_Runtime_System.md; Plans/MCP_Integration.md; Plans/Tools.md

**Acceptance Tests:** Closing/crashing PM reaps child helpers or marks them orphaned for cleanup. | Huge terminal output applies backpressure without GUI freeze. | Memory store and chat/session files have size/compaction policies. | Low-memory mode disables optional previews/agents before core runtime fails.

### P1-MODEL-SELECTION-ROUTER — Model selection per role/skill/tool/subagent

**Priority:** P1

**Source Repos:** Codex; OpenCode; Cline

**Observed Signal:** Codex discussions request per-skill model selection and issues show custom subagent model config not honored; OpenCode issues request model variants and subagent model/effort selection; Cline SDK centralizes session/Plan/Act coordination and provider migration.

**Pm Current Coverage:** PM already has provider/model precedence by scope and Goal Runtime model-role policy.

**Gap:** PM should map tasks to model/effort through a scored router instead of static defaults while preserving user policy and certification-tier rules.

**Proposal:** Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers.

**Target Docs:** Plans/Models_System.md; Plans/Goal_Runtime_System.md; Plans/Plan_To_Node_Compilation.md

**Acceptance Tests:** Low-risk summarization can select cheaper model only when certification policy allows. | Verifier/adjudicator model cannot downgrade below risk tier. | Router output is requested/effective and auditable. | User can pin or forbid providers per project/account.

### P1-USAGE-ANOMALY-QUOTA-GUARD — Token/cost anomalies and quota protection

**Priority:** P1

**Source Repos:** OpenCode; Cline; Codex; Agent Zero

**Observed Signal:** OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.

**Pm Current Coverage:** usage-feature has UsageRecord and context breakdown surfaces; Provider_OpenCode maps usage_update into normalized usage events; Goal Runtime exposes max_tokens and usage_limited.

**Gap:** PM needs anomaly detection separate from ordinary usage collection.

**Proposal:** Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution.

**Target Docs:** Plans/usage-feature.md; Plans/Models_System.md; Plans/Goal_Runtime_System.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Provider usage null uses estimator and marks confidence. | Sudden token/cost jump pauses or confirms under policy. | User sees why cost was blocked/allowed. | Cache-miss churn on stable tasks is reported as optimization warning.

### P1-MEMORY-TIERING-CONTRACT — Agent memory, goal memory, project memory, conversation history

**Priority:** P1

**Source Repos:** Agent Zero; Pi; Codex; Cline

**Observed Signal:** Agent Zero reports chat history bloat and memory-search/consolidation timeouts; Pi documents context persistence and handoff to other models; Codex Goals/skills show durable objective and progressive disclosure; Cline SDK moves task history/session handling into shared runtime.

**Pm Current Coverage:** assistant-memory-subsystem is strong on assistant-only memory, scopes, gists, prompt injection, retrieval, scoring, and maintenance. PM bootstrap ledgers also capture durable design memory.

**Gap:** PM should explicitly separate memory tiers: transcript/history, operational goal state, project/spec ledger, assistant preference memory, tool/artifact memory, and ephemeral context working set.

**Proposal:** Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics.

**Target Docs:** Plans/assistant-memory-subsystem.md; Plans/Goal_Runtime_System.md; Plans/storage-plan.md; Plans/Planning_Ledger_System.md

**Acceptance Tests:** A giant chat/session file is compacted or paged before app crash. | Memory search timeout returns degraded result, not hung turn. | Project ledger facts are not injected as personal memory. | Superseded/stale memory cannot silently override current Plan canon.

### P1-PROMPT-CACHE-STABILITY-LINTER — Prompt/cache/token efficiency hygiene

**Priority:** P1

**Source Repos:** OpenCode; Cline; Pi; Codex

**Observed Signal:** OpenCode reports system-environment prompt cache invalidation and provider cache-marker gaps; Pi changelog includes prompt caching and cached-token accounting; Codex skills use progressive disclosure; Cline fixes prompt-cache detection and compaction routing.

**Pm Current Coverage:** Previous pass recommended ContextEpoch/PromptCachePolicy; PM has provider cache metadata boundaries and compaction metadata.

**Gap:** PM should add a linter/diagnostic that explains why cache hit rate is low, not only record usage.

**Proposal:** Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation.

**Target Docs:** Plans/Models_System.md; Plans/Prompt_Pipeline.md; Plans/usage-feature.md; Plans/Tools.md

**Acceptance Tests:** Two identical tasks show stable prefix preserved. | Moving cwd/date/git status to late volatile block improves cache expectation. | Dynamic tool result not placed before stable instructions. | GUI explains cache miss source.

### P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS — Token efficiency for tools, skills, MCP, and docs

**Priority:** P1

**Source Repos:** Codex; OpenCode; Cline; Agent Zero

**Observed Signal:** Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.

**Pm Current Coverage:** PM has MCP schema caps, tool registry, skill/tool GUI surfaces, and tool usage rollups.

**Gap:** PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities.

**Proposal:** Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable.

**Target Docs:** Plans/Tools.md; Plans/MCP_Integration.md; Plans/Models_System.md; Plans/Prompt_Pipeline.md

**Acceptance Tests:** Default context never includes all full MCP schemas. | Tool search can materialize a selected tool without losing rich-result parser path. | Permission changes invalidate catalog slice. | Token budget reports catalog materialization cost.

### P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS — Terminal-bound agent output storms and UI safety

**Priority:** P1

**Source Repos:** Warp; Ghostty; tmux; Codex

**Observed Signal:** Warp reports TUI agent output/CPU/log floods; Ghostty reports memory leaks in long coding-agent terminal sessions; tmux prompt-marker handling shows semantic terminal metadata can be corrupted by middle layers.

**Pm Current Coverage:** PM has terminal protocol, persistence, projection throttling, ring buffers, and output retention honesty.

**Gap:** PM should add agent-specific terminal storm controls: when the terminal runs Claude Code/Codex/OpenCode/etc., PM should know it is agentic output with special backpressure and semantic-marker needs.

**Proposal:** Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression.

**Target Docs:** Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Executor_Protocol.md

**Acceptance Tests:** Running a high-output TUI agent does not freeze GUI or explode logs. | OSC 133/633 marker loss/degradation is visible. | PM never interprets terminal agent text as PM-native tool receipt without adapter proof.

### P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY — Fallback captioning/OCR/transcription as explicit route

**Priority:** P1

**Source Repos:** OpenCode; Cline; Codex

**Observed Signal:** OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.

**Pm Current Coverage:** Vision Bridge/media routes exist, but fallback captioning should be governed separately from native vision.

**Gap:** Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image.

**Proposal:** Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure.

**Target Docs:** Plans/Media_Generation_and_Capabilities.md; Plans/Models_System.md; Plans/usage-feature.md

**Acceptance Tests:** Non-vision model with image shows “caption fallback used,” with caption artifact and cost. | User can disable fallback. | Provider request receipt says selected model saw text caption only.

### P1-STREAM-HISTORY-COALESCER-REPLAY — Streaming/admission/replay boundary

**Priority:** P1

**Source Repos:** OpenCode v2; Pi; Codex; Cline

**Observed Signal:** OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.

**Pm Current Coverage:** Prior pass recommended StreamHistoryCoalescer; storage-plan has seglog replay/checkpoints and context ownership.

**Gap:** Make settled history admission mandatory for all providers, not just context/cache pass.

**Proposal:** Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases.

**Target Docs:** Plans/storage-plan.md; Plans/Prompt_Pipeline.md; Plans/Provider_OpenCode.md; Plans/Models_System.md

**Acceptance Tests:** No partial stream fragment is replayed as a full assistant turn. | Provider native item IDs are kept only where allowed by replay policy. | First-event timeout is a transport failure, not empty assistant success.

### P2-OTEL-EXPORT-OPTIONAL-ADAPTER — Observability export interoperability

**Priority:** P2

**Source Repos:** Pi; OpenCode; Codex

**Observed Signal:** Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.

**Pm Current Coverage:** Seglog is PM’s canonical source; usage/analytics rollups exist.

**Gap:** External observability should be supported without making OTLP canonical or leaking sensitive content.

**Proposal:** Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so.

**Target Docs:** Plans/storage-plan.md; Plans/usage-feature.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Exporter can be disabled globally/project. | Export failure produces degraded status only. | Redacted projection schema is documented and validated.

### P2-MODEL-CATALOG-CONFIDENCE-UI — Provider/catalog confidence and user explanation

**Priority:** P2

**Source Repos:** OpenCode; Cline; Pi

**Observed Signal:** Recent issues show model catalogs with wrong context windows, missing modalities, ghost models, static capability assumptions, and route-specific gaps.

**Pm Current Coverage:** Models_System has provider-owned catalogs and evidence states; GUI disclosure surfaces exist.

**Gap:** Expose capability source confidence in Settings/model picker so users understand why a model shows/hides vision, effort, cache, or context controls.

**Proposal:** Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope.

**Target Docs:** Plans/Models_System.md; Plans/FinalGUISpec.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** A custom OpenAI-compatible model with unknown vision shows unknown/not supported until proven. | User can refresh/retest capability. | Hidden controls include reason.


## Repo signal matrix by domain

| Repo | Domain signals from this pass | PM lesson |
|---|---|---|
| OpenCode v1/current + v2 | Context/tool-output settlement, reasoning/effort quirks, image/modality routing, compaction loops, empty assistant/tool loops, usage/cache fields, SSE/runtime event changes. | Adopt v2-like context/tool settlement concepts but keep PM-owned contracts and use OpenCode bridge as adapter evidence. |
| Cline | SDK session layer, Plan/Act/tool coordination, compaction/mistake limits, task history, disabled/stabilized subagents, context/usage/null reporting, browser/image issues. | Centralize active session state; ensure Plan/Act/autonomy ceilings are runtime-enforced; normalize null/estimated usage. |
| Agent Zero | Chat history bloat, memory timeout/config, XML/tool parser regressions, parallel child chats, MCP/project/global config and wedged transport cleanup. | Memory and child/tool runtimes need timeouts, bounded history, and cleanup; no unbounded chat.json-style state. |
| Pi | Provider API, context persistence/handoff, prompt caching, OpenAI Responses/WebSocket/SSE first-event hangs, provider-scoped thinking controls, no built-in permission system. | Use explicit transport timeout and permission envelopes; track provider-specific cache/effort support by epoch. |
| OpenAI Codex | Goals, subagents, skills progressive disclosure, app/IDE reasoning controls, model selection, logs/privacy, stale helpers, effort reset/ignored, xhigh stalls. | PM Goal Mode should externalize state and receipts; subagent model/effort must settle; logs must be redacted before write. |
| Ghostty | Memory leaks under long-running coding-agent terminals, parser fuzzing/tripwire, terminal correctness under heavy output. | Terminal engine must have fuzz/replay fixtures, resource governor, and no silent output/log growth. |
| Warp | Terminal + agent modes, context-window UI, MCP auto-spawn, context blocks, output/log/CPU freezes, conversation restore. | PM terminal is GUI-native; treat terminal-bound agents as high-output, resumable, resource-governed sessions. |
| tmux | OSC 133/semantic prompt marker pass-through and terminal integration edge cases. | PM terminal should preserve/degrade semantic prompt markers explicitly, especially when nested through shells/multiplexers. |

## What not to duplicate

1. Do not add another generic MCP permission model. PM already has MCP identity, auth, availability, naming, schema caps, degraded states, and permissions. The new work is lazy materialization + settlement + resource governance.
2. Do not make WebSocket the default for every provider. Use WebSockets for PM-owned GUI/runtime control surfaces; provider transport remains adaptive to the provider’s official stable stream.
3. Do not copy CLI product shape from Codex, OpenCode, Warp, or tmux. PM is GUI-native. Borrow runtime contracts, not UX identity.
4. Do not rely on prompt instructions for Plan/Act safety, subagent limits, or loop control. The runtime must enforce ceilings and produce receipts.
5. Do not treat token/cache improvements as correctness. Correctness comes from context identity, durable history, tool settlement, and verification receipts. Cache only improves cost/latency.

## Highest-priority synthesis

The largest missed area is not a single topic from the user list. It is the need for a **unified runtime contract around agentic execution**. The repos show the same bug under many names:

- model/effort not actually honored
- child agent inherits wrong settings
- vision input accepted by wrong route
- tool-call fragment becomes durable history
- compaction or edit failure loops indefinitely
- token/cost usage is missing or wildly wrong
- logs or terminal output overwhelm the app
- helper processes survive after the run
- user sees “thinking” while nothing durable has happened

PM’s Plans already cover many individual pieces. The next improvement should be to bind them into three cross-cutting runtime objects:

1. **AgentControlEnvelope** — who/what may act, with which model/effort/tools/context/budgets/write surfaces.
2. **ProviderCapabilityEpoch** — what the provider/model/route/account actually supports at this moment.
3. **RuntimeSettlementReceipts** — what actually happened for effort, multimodal input, tool turns, streams, subagents, memory, logs, and resources.

If PM adds those three abstractions and the backlog above, it will avoid many failure classes the external repos are still working through.


<!-- END_SOURCE_FILE: pm_missed_domains_repo_pass_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: pm_final_external_repo_closure_pass_2026-07-03.md; SHA256: bc118374470d506c22c87f607f8bbc4afa5e4e4cfd9e0a17a2243b177b7f0159; LINES: 341 -->

# Final External Repo Closure Pass — Puppet Master Deltas

Date: 2026-07-03

## Scope

This is the final closure pass across OpenCode v1/v2, Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, and tmux, incorporating the prior four reports:

- OpenCode → PM gap review
- External repo deep evaluation
- Second-pass repo gap review
- Context/cache/WebSocket focused pass
- Missed-domain pass covering agents, effort, providers, vision/multimodal, subagents, context, tools, logging, looping, token efficiency, model selection, and memory

I treated this as a closure pass, not a repetition pass. The goal was to identify failure families that were still underweighted after the earlier reports. I did not claim that every individual issue body in every large repo was hand-read line-by-line; the method was repo-surface triage over the last ~6 months, current release/changelog review, targeted issue-body inspection for high-risk failure classes, and comparison against the uploaded PM Plans surface and prior report backlog.

## Local PM coverage sanity check

A targeted scan of live Plans docs excluding audits/generated/shard/ledger output showed heavy coverage for context, tools, MCP, providers, terminal, permissions, memory, loops, worktrees, browser, and sandboxing. It showed sparse or no live-plan coverage for the exact terms `supply chain`, `SBOM`, `attestation`, and `computer use`. That does not prove the concepts are absent under other names, but it does justify treating supply-chain/AI-CI and computer-use/session-tool injection as underweighted final-pass deltas.

## Final conclusion

The previous P0 architecture recommendations still stand. PM is already directionally strong on generic Tools/MCP, context/token/cache, provider identity, terminal protocol, model routing, agent control, effort settlement, loop breakers, multimodal admission, logging/redaction, runtime resource governance, and memory tiering. The final pass found missed emphasis in **attack surfaces and runtime proof boundaries**, not in the basic feature areas.

The three most important closure additions are:

1. **Agentic CI / supply-chain guardrails**: untrusted issue/PR text must not become tool-capable agent instructions inside CI/release automation.
2. **Goal/subagent isolation**: child agents need non-inheritable leases so they cannot resume the parent goal, inherit parent cache authority, or spawn their own uncontrolled children.
3. **Provider egress and command invocation contracts**: custom provider URLs and command execution need network/redirect/timeout/cancel/argv-shell receipts, not only model/tool permissions.

## Newly or underweighted backlog

### P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN — P0

**Family:** AI-assisted CI/release supply-chain attack surface

**Source signal:**
- Clinejection: untrusted GitHub issue title reached a Claude issue-triage bot with Bash/Read/Write/Edit access, pivoted through GitHub Actions cache poisoning, and led to unauthorized npm package cline@2.3.0.
- OpenCode github@latest tag drift shows release automation/currentness can silently lag active releases.
- Codex changelog hardens command safety, browser-origin websocket handshakes, and repo-provided Git helper execution.

**PM gap:** Prior PM passes covered permissions and release provenance, but underweighted agentic CI workflows where untrusted issue/PR text becomes model instructions and tool calls inside release-adjacent automation.

**Likely target docs:** GitHub_Integration.md, Permissions_System.md, Decision_Policy.md, Contracts_V0.md, Automated_Testing_System.md, Spec_Lock / governance seal docs, new Supply_Chain_Security.md if owner doc is missing

**Acceptance tests:**
- AI issue/PR triage workflows must default to read-only/no-shell/no-write permissions and require explicit escalation receipts for any tool with filesystem, shell, cache, credential, or release access.
- All untrusted external text entering an agentic CI prompt carries a taint envelope and cannot be interpreted as tool/policy instructions.
- Release workflows that hold publish credentials must not consume untrusted caches; cache provenance and OIDC provenance are validated before publish.
- Package/update artifacts require signed provenance/SBOM/hash/attestation checks and latest-tag drift detection.

**Relation to prior reports:** New P0. Prior binary provenance was too narrow; this adds natural-language-to-CI toxic-flow defense.

### P0-GOAL-SCOPE-SUBAGENT-ISOLATION — P0

**Family:** Goal/subagent identity leakage and rogue continuation

**Source signal:**
- Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread.
- Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes.
- PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.

**PM gap:** AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal.

**Likely target docs:** Goal_Runtime_System.md, orchestrator-subagent-integration.md, Orchestrator_Page.md, Contracts_V0.md, FinalGUISpec.md

**Acceptance tests:**
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.

**Relation to prior reports:** Sharpens AgentControlEnvelope and SubagentExecutionContract into an isolation primitive.

### P0-PROVIDER-EGRESS-HTTP-POLICY — P0

**Family:** User-configurable provider endpoint egress, redirect, timeout, and SSRF policy

**Source signal:**
- Pi issue #6280 requests app-enforced HTTP redirect/error/custom fetch/timeout/cancel policy for provider requests, especially user-configurable OpenAI-compatible URLs.
- Codex changelog references approved OpenAI hosts, short-lived remote-control tokens, and browser-origin websocket handshake rejection.
- Cline/OpenCode/Pi all expose broad OpenAI-compatible/custom provider surfaces.

**PM gap:** ProviderCapabilityEpoch and provider policy covered model/account/capability identity, but did not fully specify network-layer egress rules for custom provider URLs.

**Likely target docs:** Models_System.md, Provider_OpenCode.md, Permissions_System.md, GitHub_Integration.md, Contracts_V0.md, MCP_Integration.md

**Acceptance tests:**
- Provider calls carry ProviderEgressPolicy: redirect behavior, timeout, abort signal, proxy, DNS policy, private-IP/localhost deny-or-allow, certificate policy, allowed host class, and audit receipt.
- Custom provider URLs cannot follow redirects to unexpected hosts or local metadata endpoints by default.
- Provider transport receipts record effective URL, redirect count, timeout/cancel cause, and policy decision without leaking secrets.

**Relation to prior reports:** New P0 network/security edge under the provider work.

### P0-COMMAND-INVOCATION-CONTRACT — P0

**Family:** Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command

**Source signal:**
- Cline issue #12047 reports structured {command: 'ls -la foo'} being posix_spawned as the entire executable, causing ENOENT.
- Codex recent issues include one-shot approval for inspected PowerShell wrappers and command-safety hardening prevents unsafe helpers/hooks/parser execution.
- Ghostty paste security fixes show terminal input can become command execution unexpectedly.

**PM gap:** Terminal protocol/paste safety was covered, but PM still needs an explicit CommandInvocationContract separate from terminal rendering and tool settlement.

**Likely target docs:** Tools.md, Terminal_Integration.md, Executor_Protocol.md, Permissions_System.md, Contracts_V0.md

**Acceptance tests:**
- Every command tool call states invocation_kind=shell_string|argv|powershell_script|pty_input|tui_automation and interpreter identity.
- Approval UI displays the exact effective command form and quoting/escaping interpretation.
- A shell string cannot be silently executed as argv[0], and argv cannot be silently routed through a shell.
- PowerShell wrapper execution requires inspected-wrapper receipts and one-shot approval when configured.

**Relation to prior reports:** New P0; complements terminal and tool-call settlement.

### P0-SESSION-TOOL-NAMESPACE-ACTIVATION — P0

**Family:** Runtime-valid plugins/tools that are not actually injected into the session

**Source signal:**
- Codex issue #31023 described a Computer Use/plugin/cache/runtime configuration that was valid, but session tools were not injected and node_repl did not start.
- Warp and Codex changelogs show explicit tool/plugin/runtime capability stages and immediate tool refreshes.
- Cline and Warp both expose imported third-party agent/tool configs and custom model/provider flows.

**PM gap:** Capability catalogs and tool registries were covered, but not the final active-session namespace proof that a tool family is both configured and injected into this run.

**Likely target docs:** Tools.md, MCP_Integration.md, Browser_Integration.md, Media_Generation_and_Capabilities.md, FinalGUISpec.md, Contracts_V0.md

**Acceptance tests:**
- Each session has ActiveToolNamespaceReceipt with configured, allowed, injected, visible_to_model, visible_to_ui, and startup status per tool namespace.
- Computer-use/browser/device/media tools are denied with explicit reason if model/provider/session does not receive them.
- Tool mentions, UI chips, and model-visible tool schemas are reconciled from the same session namespace snapshot.

**Relation to prior reports:** Sharpens CapabilityCatalogMaterialization and MultimodalInputSettlement.

### P0-ENTITLEMENT-QUOTA-SETTLEMENT — P0

**Family:** Provider/product entitlement, quota, credit, subscription, and rate-limit state

**Source signal:**
- OpenCode recent issues include active subscription reporting as free-tier exceeded.
- Cline recent issues include payment succeeding but no credits.
- Warp fixed quota/credit errors being misclassified as Warp faults.
- Codex issue #20301 shows token-cache/cost anomalies can be operationally severe.

**PM gap:** UsageCacheEnvelope and model/provider identity covered token accounting, but PM also needs billing/entitlement/quota classification and user-visible remediation. 

**Likely target docs:** Models_System.md, Provider_OpenCode.md, FinalGUISpec.md, Runtime_Artifacts_Panel.md, Contracts_V0.md

**Acceptance tests:**
- Every provider attempt returns EntitlementQuotaSettlement: quota_exhausted|billing_inactive|subscription_mismatch|rate_limited|cache_anomaly|provider_fault|pm_fault|unknown.
- Quota/credit/subscription errors are not shown as generic PM faults.
- Usage anomaly guard ties cache-hit drop, context size, selected model, account, and billing state into one diagnostic bundle.

**Relation to prior reports:** New P0 operational UX/cost surface.

### P1-INSTRUCTION-SOURCE-INTEGRITY-EPOCH — P1

**Family:** AGENTS/rules/skills/plugin instruction source fidelity and invalid encoding handling

**Source signal:**
- Codex changelog includes reliable AGENTS loading, invalid UTF-8 warnings, plugin skill path handling, and root marketplace layout fixes.
- Cline/OpenCode expose custom rules/skills/prompts/provider configs that can drift across session/resume/import paths.

**PM gap:** ContextEpoch covered instruction hashes, but the source-integrity side should explicitly track missing/invalid/duplicate/stale instruction sources, encodings, and loaded-scope precedence.

**Likely target docs:** Context_Management.md, Skill_System.md, Goal_Runtime_System.md, Models_System.md, Contracts_V0.md

**Acceptance tests:**
- InstructionSetEpoch includes source path, encoding status, parse status, precedence, hash, loaded scope, and denial reason.
- Invalid UTF-8 or unreadable instruction files generate user-visible warnings and do not silently drop rules.
- Resume/fork/import preserves or intentionally re-resolves instruction scope with a receipt.

**Relation to prior reports:** Refines ContextEpoch with instruction integrity semantics.

### P1-TERMINAL-SENSITIVE-OS-CHANNEL-GUARD — P1

**Family:** Terminal side channels: pasteboard, one-time codes, drag/drop, file URLs, and OS autofill

**Source signal:**
- Ghostty 1.3.0 fixed control-character paste/drag command execution; 1.3.1 notes one-time-code inputs no longer appearing in terminal and mac pasteboard/file-url handling issues.
- Warp continues to fix profile switcher input clearing, file links, and command confirmation/rejection crashes.

**PM gap:** Paste safety and OSC52 were covered; OS autofill/OTP/pasteboard/file URL side channels were not called out enough.

**Likely target docs:** Terminal_Integration.md, FinalGUISpec.md, Permissions_System.md, FileSafe.md

**Acceptance tests:**
- Terminal paste/drop/autofill inputs pass through TerminalInputSanitizer with control-code stripping/escaping policy and user-visible preview for dangerous content.
- OTP/autofill/system pasteboard data is blocked from terminal echo/model context unless explicitly approved.
- File URL paste/drag opens are FileSafe checked and do not implicitly execute or read files.

**Relation to prior reports:** Extends terminal paste/protocol safety.

### P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS — P1

**Family:** Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings

**Source signal:**
- Ghostty 1.3.0 reports AFL++ fuzzing of the terminal escape parser/VT stream processor, terminal recordings over 4GB, renderer lock improvements, and Tripwire error-injection testing.
- tmux issue surface still shows TUI rendering/layout/crash regressions in panes.

**PM gap:** Terminal Protocol Matrix covers cases to support, but needs a permanent terminal replay/fuzz/error-injection corpus and receipts.

**Likely target docs:** Terminal_Integration.md, Automated_Testing_System.md, Runtime_Artifacts_Panel.md, Contracts_V0.md

**Acceptance tests:**
- PM stores minimized terminal replay fixtures for parser bugs, shell markers, giant outputs, unicode/graphemes, bracketed paste, OSC, tmux/zellij/ssh panes, and CLI agents.
- Terminal parser has fuzz tests, chunk-splitting tests, and replay snapshots that compare parse tree, accessible mirror, scrollback, and painted viewport.
- Renderer/scrollback locks are budgeted; oversized recordings degrade with receipts instead of freezing UI.

**Relation to prior reports:** Adds test strategy to prior terminal requirements.

### P1-MEMORY-STORE-CRUD-VERSION-CITATIONS — P1

**Family:** Agent memory store management, version history, and citation surfacing

**Source signal:**
- Warp Oz updates add memory store management commands and memory citations.
- Codex changelog moved memory state to a dedicated SQLite DB and gated dedicated memory tools in config.
- Agent Zero shows memory/history bloat and silent memory consolidation failure risks.

**PM gap:** MemoryTierContract covered layers and budgets, but not enough about memory CRUD/versioning/citations as user-visible objects.

**Likely target docs:** assistant-memory-subsystem.md, Goal_Runtime_System.md, FinalGUISpec.md, storage-plan.md, Contracts_V0.md

**Acceptance tests:**
- User can list/get/update/delete memory stores and individual memories with version history, provenance, redaction, and rollback.
- Model responses that use memories can surface citations or evidence receipts.
- Memory consolidation failures are typed, retryable or surfaced, and never silently drop required memories.

**Relation to prior reports:** Extends memory budget/governance into user-visible store operations.

### P1-PLATFORM-BINARY-COMPATIBILITY-GATE — P1

**Family:** Code signing, static binaries, platform packaging, sandbox setup, and OS-specific runtime gates

**Source signal:**
- Cline recent issue reports macOS AMFI code-signing kill of the CLI binary.
- Warp statically compiled Linux CLI/warpctl for compatibility and fixed Windows GPU/UI lag.
- Codex changelog includes Windows sandbox provisioning and platform-specific sandbox/network behavior.

**PM gap:** Release provenance was covered; platform binary compatibility and OS gate diagnostics need their own receipts.

**Likely target docs:** Automated_Testing_System.md, FinalGUISpec.md, GitHub_Integration.md, Installer/Packaging docs if present, Contracts_V0.md

**Acceptance tests:**
- Every packaged helper/CLI/runtime declares signing/notarization/static-linking/sandbox entitlement state per OS.
- Startup diagnostics distinguish code-signing/AMFI/quarantine/GPU/sandbox/network-deny failures from generic launch failures.
- Platform matrix CI includes macOS quarantine/signature, Windows sandbox/network, Linux static/dynamic library checks.

**Relation to prior reports:** Narrower than binary provenance; covers runtime compatibility failure classes.

### P1-EXTERNAL-AGENT-HANDOFF-IMPORT — P1

**Family:** Third-party agent import, continuation, and session provenance

**Source signal:**
- Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications.
- Codex changelog records external agent import results and Claude Code import support.
- Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.

**PM gap:** MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts.

**Likely target docs:** Goal_Runtime_System.md, Terminal_Integration.md, Provider_OpenCode.md, MCP_Integration.md, FinalGUISpec.md

**Acceptance tests:**
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.

**Relation to prior reports:** Extends external config provenance into full session handoff.

### P1-UI-HARD-GATE-ENFORCER — P1

**Family:** User-defined hard gates for visual QA, artifact delivery, and output modality

**Source signal:**
- Codex recent issue list includes an agent bypassing user-defined hard gates for local artifact delivery and visual QA, and another issue about output-modality constraints.
- Warp and Cline show GUI/agent surfaces where commands, artifacts, and agent outputs cross UI boundaries.

**PM gap:** Permissions/gates are strong, but visual QA/artifact delivery/output modality should be hard runtime predicates, not conversational instructions.

**Likely target docs:** FinalGUISpec.md, Runtime_Artifacts_Panel.md, Media_Generation_and_Capabilities.md, Automated_Testing_System.md, Permissions_System.md

**Acceptance tests:**
- User-defined gates for visual QA, local artifact delivery, screenshot/video proof, and output modality compile into RuntimeHardGate predicates.
- An artifact cannot be delivered/marked complete until required visual/evidence gates settle.
- Bypass attempts become typed gate violations with blocked state and repair route.

**Relation to prior reports:** Refines permission/approval model for GUI artifact workflows.

### P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY — P2

**Family:** Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass

**Source signal:**
- Pi issue #6280 was auto-closed/untriaged despite containing a real architectural request.
- OpenCode issue/PR volume is very high and uses needs-compliance/repro style triage.
- PM already discovered semantic closure registry needs internally.

**PM gap:** PM has a semantic closure registry for plan audits, but external-upstream watch findings need similar durable status/disposition to avoid repeated rediscovery.

**Likely target docs:** Planning_Ledger_System.md, GitHub_Integration.md, Research_Mode / audit prompts, Contracts_V0.md

**Acceptance tests:**
- ExternalRepoFinding records have finding_key, upstream_url, observed_state, PM disposition, reopen conditions, and freshness window.
- Auto-closed upstream issue is not treated as false merely because upstream closed it; PM can keep it as design evidence with status=upstream_auto_closed_pm_relevant.
- Repeated external audits reuse closed findings unless upstream content, PM coverage, or source family changed.

**Relation to prior reports:** Meta-process addition rather than product runtime P0.

## Do not re-open / already sufficiently covered

The closure pass did not find a reason to replace the earlier recommendations for these topics; those recommendations should be carried forward as-is:

- ContextEpoch / BaselineSystemContext / ContextSnapshot
- PromptCachePolicy / UsageCacheEnvelope / volatile-context quarantine
- StreamHistoryCoalescer and history-admission sanitization
- ProviderCapabilityEpoch and reasoning/thinking replay matrix
- Lazy MCP/tool/skill catalog with shared typed result path
- Tool-turn settlement and malformed tool-call gates
- WebSocket transport policy with backpressure/security/fallback
- Terminal protocol matrix, semantic marker parser, chunk-spanning parser, a11y text mirror
- AgentControlEnvelope, EffortSettlementReceipt, SubagentExecutionContract
- LoopBreakerRegistry, RuntimeResourceGovernor, MemoryTierContract
- MultimodalInputSettlement and media fallback/caption policy
- Release migration gates, config/schema migration, binary provenance

## Suggested immediate PM plan action

If this final pass is fed into PM’s ledger/PlanUnit process, the first packet should be a narrow **Security and Runtime Boundary Delta** rather than another broad external-repo report. Suggested first packet order:

1. `P0-AI-CI-UNTRUSTED-CONTENT-SUPPLY-CHAIN`
2. `P0-GOAL-SCOPE-SUBAGENT-ISOLATION`
3. `P0-PROVIDER-EGRESS-HTTP-POLICY`
4. `P0-COMMAND-INVOCATION-CONTRACT`
5. `P0-SESSION-TOOL-NAMESPACE-ACTIVATION`
6. `P0-ENTITLEMENT-QUOTA-SETTLEMENT`

Those six are the highest-leverage additions because they cut across agents, provider/model routing, terminal execution, GUI state, cost/quotas, and security. The P1/P2 items can follow as terminal/memory/platform/import hardening.


<!-- END_SOURCE_FILE: pm_final_external_repo_closure_pass_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: pm_one_more_external_repo_pass_2026-07-03.md; SHA256: cd62342e88489eec37d72254b89fcaa149d528c5ae4a58d38fdcdb5d20619b9d; LINES: 332 -->

# Puppet Master External Repo Review — One More Closure Pass

Date: 2026-07-03

Scope: OpenCode v1/v2, Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, tmux, and the previously reviewed Puppet Master Plans / prompt-packet / ledger-governance materials.

This is an incremental closure pass after the prior OpenCode, external-repo, second-pass, context/cache/WebSocket, missed-domain, and final-closure reports. It intentionally avoids restating the already-covered major recommendations unless a newer issue or PR sharpens the contract. The strongest earlier recommendations still stand: ContextEpoch, ProviderCapabilityEpoch, AgentControlEnvelope, ToolTurnSettlement, StreamHistoryCoalescer, PromptCachePolicy, UsageCacheEnvelope, ProviderEgressPolicy, CommandInvocationContract, ActiveToolNamespaceReceipt, Goal/Subagent leases, semantic closure registry, terminal protocol/a11y/backpressure/fuzzing, and release/governance gates.

## What PM already covers and should not duplicate

PM's own prompt/ledger system already has unusually strong foundations for durable research, routing, target-path hygiene, currentness, subagent hard gates, exact detail preservation, doc-discovery exhaustion, and semantic closure. The retrieved PM materials show:

- PM-LTGS treats ledger transfer as a stateful goal-orchestration problem, not a better-prompt problem. It requires durable state, row-level evidence, parent-only writes, read-only specialist reviewers, semantic evidence certification, and final governance sealing.
- PM already prohibits repeated doc-discovery loops by distinguishing unattempted, stale, and already-exhausted rows. Already-exhausted rows must not go back to worklist building unless row identity/candidate-set identity changes.
- PM already has target-path hygiene, run-currentness, and prompt-process-defect routes that prefer bounded delta repair over broad recomputation.
- PM already has a semantic closure registry design with stable finding keys, closure statuses, reopen conditions, and repair matrices so repeated audit warnings do not become endless rediscovery loops.

That matters because the remaining external lessons are not “add more process.” They are exact runtime proof boundaries that should plug into PM's existing durable state and closure system.

## New or underweighted findings from this pass

### 1. Session composer/draft isolation is a first-class runtime boundary

OpenCode has a very current desktop issue where text/images inserted in one session reappear in another session's composer after the first session was submitted. That is not a provider, MCP, or context-window problem; it is a UI draft/session isolation problem.

**PM delta:** add a `SessionDraftIsolationContract` for every GUI input surface:

- `draft_id`
- `session_id`
- `composer_surface_id`
- `attachment_set_id`
- `created_at`, `submitted_at`, `cleared_at`, `abandoned_at`
- `source_surface` and `source_session` for text/images/files
- explicit state transitions: `draft_created`, `draft_committed`, `draft_cleared`, `draft_abandoned`, `draft_restored`
- invariant: a committed/cleared draft cannot be implicitly reused by a new session
- invariant: attachments cannot be carried across session/view boundaries without a user-visible restore action

This belongs in PM's GUI/session runtime, not just in context management. ContextEpoch tells the model what was visible; draft isolation proves the UI did not accidentally inject stale user input before context assembly.

### 2. MCP readiness needs lifecycle APIs and runtime-call liveness, not just config validation

OpenCode v2 has an issue explicitly asking to port MCP status/connect/disconnect/elicitation surfaces into V2 with tests for failed/unavailable servers. It also has a current MCP tool-call deadlock report where the process remains alive, no LLM or shell command is pending, and the session waits forever for an MCP response that never arrives; the suggested fix class is per-tool-call timeout, interrupt cancellation, and health/stdio EOF heartbeat.

Cline has a separate current issue showing that a hardcoded MCP initialize timeout of 1500ms can fail on slower or loaded machines even when servers are valid. Together, these say PM needs two MCP layers:

- **Lifecycle readiness:** configured, discoverable, authenticated, initialized, connected, unavailable, failed, reconnecting, elicitation-ready.
- **Runtime-call liveness:** per-call timeout, first-event timeout, heartbeat/EOF, cancel/interrupt, synthetic failure settlement, and resumable session loop restoration.

**PM delta:** extend `ActiveToolNamespaceReceipt` into `ActiveToolNamespaceReceipt + RuntimeToolCallLivenessReceipt`.

Required fields:

- `namespace_id`, `server_id`, `transport`, `auth_state`, `init_timeout_ms`, `init_result`
- `runtime_call_timeout_ms`, `first_event_timeout_ms`, `heartbeat_policy`, `last_heartbeat_at`
- `pending_call_ids`, `cancellable`, `interrupt_result`, `synthetic_error_emitted`
- `server_health`: `alive | exited | stdio_eof | stalled | unknown`
- `session_loop_restored`: boolean
- `lost_session`: boolean

### 3. Command approvals need leases bound to exact command identity

Cline's structured-command bug is the clearest example: `{ command: "ls -la /path" }` was treated as the executable name by `posix_spawn`, failing with ENOENT. OpenAI Codex has current PRs around shell approval boundaries, PowerShell wrappers, namespace-aware executable policy, one-shot approval retries, explicit approval purpose, and preserving command identity.

Earlier PM recommendations already included `CommandInvocationContract`, but this pass sharpens approval semantics: approval is not permission for vague command text. It is a **lease over a normalized command identity**.

**PM delta:** add `CommandApprovalLease`.

Required identity fields:

- `invocation_form`: `shell_string | argv | powershell_wrapper | cmd_wrapper | pty_input | tui_automation | browser_action | mcp_tool`
- `executable`, `argv`, `shell`, `shell_flags`, `wrapper_interpreter`
- `cwd`, `env_hash`, `stdin_hash`, `file_surface_hash`
- `namespace`: terminal/session/tool/MCP/provider/browser/device namespace
- `approval_purpose`: install, test, inspect, mutate, network, destructive, unknown
- `lease_scope`: one-shot, retry-same-identity, session-scoped, denied
- `normalized_command_hash`
- `display_command_hash`
- `policy_match_rule_id`
- `attempt_id` and `retry_parent_id`

Hard rule: a retry can reuse approval only if the normalized command identity, namespace, cwd, env hash, and purpose match exactly. Shell-string and argv forms are not interchangeable.

### 4. Credential routes need epochs separate from provider capability

Codex's current issue/PR surface shows credentialed route/proxy/config work, entitlement/signing/release issues, Pro/Free account classification mismatches, and connection/sandbox/tool-call failures. Cline and Agent Zero also show payment/credits/OAuth/provider-auth friction.

ProviderCapabilityEpoch is still necessary, but it is not enough. A model can be capable while the current route/account/proxy/token entitlement is wrong.

**PM delta:** add `CredentialRouteEpoch`.

Required fields:

- `account_id_hash`, `profile_id`, `provider_id`, `route_id`
- `credential_source`: local keychain, env var, OAuth token, app session, proxy, enterprise config
- `credential_state`: present, missing, expired, revoked, refresh_failed, unknown
- `entitlement_state`: allowed, quota_exceeded, plan_mismatch, org_denied, region_denied, unknown
- `billing_bucket` / `quota_bucket`
- `proxy_config_hash`, `route_policy_hash`
- `model_catalog_epoch_id`
- `last_refresh_at`, `validated_at`, `validation_method`
- `failure_class`: auth, entitlement, quota, route, transport, provider, unknown

Every provider attempt should record both `ProviderCapabilityEpoch` and `CredentialRouteEpoch`.

### 5. Restart/readiness probes are required for browser, computer-use, terminal, WSL, and tool namespaces

Codex has current reports where browser port forwarding failed until restart, computer-use/plugin tools were unavailable after restart, WSL-native mode hid Chrome bridge behavior and passed Windows attachment paths to the Linux agent, and threads could get stuck after log/template actions. These are restart/restore/runtime-surface problems.

**PM delta:** add `RuntimeSurfaceReadinessProbe` and make it run after:

- app restart
- workspace restore
- provider/account switch
- MCP config change
- plugin install/update
- browser/device/terminal attachment
- WSL/SSH/container context switch

Probe status should include:

- `surface_id`, `surface_kind`: terminal, browser, device, MCP, computer-use, provider, file watcher, websocket, app-server
- `configured`, `started`, `injected`, `model_visible`, `ui_visible`, `permission_visible`
- `roundtrip_test_result`
- `last_good_at`, `failed_at`, `requires_restart`, `requires_reauth`, `requires_user_action`
- `path_translation_policy` and `effective_path_namespace`

This should feed the GUI before the agent starts spending tokens on tools that are configured but not actually usable.

### 6. Context compaction needs media/object dedupe, not only token budgets

Codex has a current macOS report where compaction checkpoints re-embed screenshots until rollout reaches gigabytes and ingestion uses 10–20 GB RSS. That is a distinct class from text context overflow. PM should distinguish textual prompt tokens from media/object context volume.

**PM delta:** extend `ContextEpoch` with `ContextObjectBudget`.

Track:

- object IDs for screenshots, PDFs, images, terminal snapshots, browser snapshots, videos, logs
- content hashes and dedupe group IDs
- object size bytes, tokenized caption size, retained pixel/media size
- embedded-by-value vs referenced-by-artifact
- replay eligibility and compaction retention reason
- maximum per-turn and per-session object budget
- checkpoint object inventory and dedupe results

Hard rule: compaction may not re-embed identical media objects by value unless explicitly required and budgeted.

### 7. Terminal implementation needs input-method and pasteboard channel policy, not only ANSI/OSC parsing

Earlier reports covered OSC 52/8/9/133/633, terminal backpressure, a11y mirrors, and fuzzing. This pass adds three overlooked terminal GUI edges:

- Pi shows IME candidate-window positioning failures.
- Ghostty shows key-repeat/global-keybind issues and pasteboard priority problems where macOS paste prefers NSURL over plain text, causing SFTP URLs to be pasted.
- Warp shows prompt/viewport behavior after clear/cls, packaging, and Windows/Linux terminal state issues.

**PM delta:** add `TerminalInputAndPasteboardMatrix`.

Required cases:

- IME composition start/update/commit/cancel with candidate-window bounds relative to cursor cell
- dead keys, key repeat, compose keys, Alt/Option-modified text, Ctrl/Meta conflicts
- double-width characters, grapheme clusters, emoji, zero-width joiners, combining marks
- pasteboard flavors: plain text, file URL, URL, rich text, image, proprietary app types
- paste priority policy: prefer safe plain text unless user explicitly chooses URL/file/image paste
- SFTP/file URL paste guard and command-execution guard
- clear/cls viewport/prompt retention cases

### 8. Tool-result placeholder fabrication must be impossible

Pi has current issues/PRs around empty tool outputs producing a fake “see attached image” placeholder and rejecting partial JSON when tool call exit is early. Agent Zero had a current issue where raw JSON from history.server polluted context; Cline/OpenCode both show tool-result and MCP-output complexity.

**PM delta:** add `ToolResultTruthfulnessGate` as a sub-contract under `ToolTurnSettlement`.

Rules:

- empty output must be represented as empty output with typed reason, not a fabricated placeholder
- missing image/resource must be represented as missing artifact, not caption text
- malformed/partial JSON must settle as malformed/partial with raw captured bytes and parse error
- no synthetic success if the result artifact was not retained
- no lossy conversion of typed resource/image/log/message streams into free text without provenance

### 9. Instruction import graphs need integrity/cycle/staleness checks

Pi has a current feature request for AGENTS.md `@path` import syntax. Codex already relies heavily on repo instructions/skills. PM already has instruction/source integrity concepts, but this pass sharpens import handling.

**PM delta:** add `InstructionImportGraph`.

Fields:

- `root_instruction_id`, `import_path`, `resolved_path`, `path_namespace`
- `import_hash`, `import_mtime`, `import_scope`, `permission_scope`
- `cycle_detected`, `max_depth_exceeded`, `missing_import`, `stale_import`
- `trusted_source`: repo, user, plugin, external, unknown
- `included_in_context_epoch`: boolean

Hard rule: imported instructions must be visible in ContextEpoch hashes and replay/audit receipts.

### 10. UI state stores must be bounded and projection-specific

Cline has a current issue surface around huge state/history freezing. Earlier reports covered history budgets. The sharper version is that PM should separate persistent semantic history from GUI state projections.

**PM delta:** add `UIProjectionStoreBudget`.

Separate:

- durable semantic state
- compact visible thread projection
- terminal scrollback projection
- browser/screenshot thumbnails
- debug/raw event store
- model replay history

Each projection needs byte/item limits, eviction policy, restore policy, and user-visible data-loss receipts.

### 11. Packaging/self-update/package-permission receipts belong in PM even if PM is GUI-first

Warp has current issue surface around package tarball ownership; Codex PRs include signing entitlement; Agent Zero has self-update-related issues. PM's GUI-first product still needs installer/update surfaces.

**PM delta:** add `InstallUpdateProvenanceReceipt`.

Fields:

- artifact hash/signature/notarization
- package owner/group/mode inventory
- install path policy
- update channel and rollback point
- self-update source and confirmation state
- migration plan and backup path
- pre/post install validator results

### 12. AI issue triage needs closure confidence and reopen policy

Pi and Ghostty issue lists show auto-closed/untriaged reports mixed with potentially real input/UI bugs. PM's semantic closure registry already solves the internal version of this. The external lesson is to apply the same idea to AI-assisted triage: warnings should not recur forever, but valid reports should not disappear because a bot closed them.

**PM delta:** extend the semantic closure registry to external/user-reported bugs:

- `triage_confidence`
- `closure_actor`: human, bot, agent, validator
- `reopen_on_new_repro`, `reopen_on_version_change`, `reopen_on_user_confirmed_regression`
- `evidence_quality`: exact repro, screenshot/log, environment, duplicate, vague
- `user_visible_closure_reason`

## Additive backlog

The following backlog items are new or materially sharpened by this pass. They are intended to sit beside, not replace, the earlier P0/P1/P2 rows.

| Priority | ID | Summary | Primary sources |
|---|---|---|---|
| P0 | P0-SESSION-DRAFT-ATTACHMENT-ISOLATION | Prevent text/image/file drafts from leaking across GUI sessions/composers. | OpenCode #35214 |
| P0 | P0-MCP-LIFECYCLE-RUNTIME-LIVENESS | Add lifecycle APIs plus per-call liveness, interrupt, heartbeat, synthetic settlement. | OpenCode #34435, #35207; Cline #12044 |
| P0 | P0-COMMAND-APPROVAL-LEASE | Bind approval to exact normalized command identity, shell/argv form, cwd/env, namespace, purpose, retry lineage. | Cline #12047; Codex PR list |
| P0 | P0-CREDENTIAL-ROUTE-EPOCH | Separate account/credential/entitlement/proxy/quota state from provider/model capability. | Codex issues/PRs; Cline/Agent Zero surfaces |
| P0 | P0-RUNTIME-SURFACE-READINESS-PROBE | Prove browser/computer-use/MCP/terminal/WSL surfaces are actually injected and roundtrip-ready after restart/restore. | Codex issues; OpenCode V2 MCP lifecycle |
| P0 | P0-CONTEXT-OBJECT-BUDGET | Deduplicate and budget media/object context separately from text tokens. | Codex compaction screenshot/RSS issue |
| P0 | P0-TOOL-RESULT-TRUTHFULNESS-GATE | Forbid fabricated placeholders and non-lossy success for empty/malformed/missing resource outputs. | Pi issues/PRs; Agent Zero context pollution |
| P1 | P1-INSTRUCTION-IMPORT-GRAPH | Integrity/cycle/staleness/scope checks for imported instruction files. | Pi AGENTS @path request; Codex instructions/skills pattern |
| P1 | P1-TERMINAL-INPUT-PASTEBOARD-MATRIX | IME, key repeat, Unicode, pasteboard type priority, URL/file guard, clear/viewport regressions. | Pi, Ghostty, Warp |
| P1 | P1-UI-PROJECTION-STORE-BUDGET | Bound GUI state projections separately from semantic durable history. | Cline huge history/freezing signals |
| P1 | P1-INSTALL-UPDATE-PROVENANCE | Installer/self-update/package permission/codesigning/channel/rollback receipts. | Warp packaging, Codex signing, Agent Zero self-update |
| P2 | P2-AI-TRIAGE-CLOSURE-CONFIDENCE | Closure confidence/reopen policy for bot/agent triage and recurring warnings. | Pi/Ghostty auto-close surfaces; PM semantic closure design |

## Acceptance-test sketches

### P0-SESSION-DRAFT-ATTACHMENT-ISOLATION

1. Create session A, attach image X and text T, submit.
2. Open session B.
3. Assert composer is empty unless an explicit restore action is selected.
4. Assert ContextEpoch for B contains no X/T unless explicit restore creates a new draft receipt.
5. Crash/restart between steps 1 and 2 and repeat.

### P0-MCP-LIFECYCLE-RUNTIME-LIVENESS

1. Register MCP server with slow init. Assert configurable init timeout and unavailable state.
2. Register MCP server that initializes but hangs during a tool call. Assert first-event/runtime timeout emits synthetic tool failure and restores session loop.
3. Kill MCP child process during pending tool call. Assert EOF/heartbeat failure settles pending calls.
4. Trigger `/interrupt` or GUI cancel. Assert pending call is cancelled or force-settled with no lost session.

### P0-COMMAND-APPROVAL-LEASE

1. Approve `argv=["ls","-la","/tmp"]`. Assert shell-string `"ls -la /tmp"` does not reuse approval.
2. Approve PowerShell wrapper one-shot. Retry with changed args/env/cwd. Assert new approval required.
3. Approve inspect-only command. Attempt mutate/network command with same executable. Assert denied/new approval.
4. Assert receipts include normalized and display command hashes.

### P0-RUNTIME-SURFACE-READINESS-PROBE

1. Start app with browser, MCP, terminal, and computer-use configured.
2. Restart app and restore workspace.
3. Assert readiness probes prove each surface is injected/model-visible/UI-visible or mark unavailable before first agent run.
4. For WSL/SSH/container context, assert path namespace translation is explicit and tested.

### P0-CONTEXT-OBJECT-BUDGET

1. Add the same screenshot to 10 compaction checkpoints.
2. Assert object hash is deduped and referenced, not embedded by value repeatedly.
3. Assert RSS/object budget warning triggers before runaway memory use.
4. Assert object presence is replayable via artifact refs.

### P0-TOOL-RESULT-TRUTHFULNESS-GATE

1. Tool returns empty text and no images. Assert model-visible result says empty, not “see attached image.”
2. Tool returns malformed JSON. Assert malformed/partial settlement with captured raw bytes.
3. Tool returns image reference but artifact retention fails. Assert failure/partial, not success.

## Where these fit in PM's architecture

- `SessionDraftIsolationContract` belongs with GUI session/runtime state and ContextEpoch admission.
- `RuntimeToolCallLivenessReceipt` belongs under ToolTurnSettlement/MCP runtime.
- `CommandApprovalLease` belongs under FileSafe/Permissions/terminal/runtime approvals.
- `CredentialRouteEpoch` belongs under provider/model/account selection and ProviderCapabilityEpoch.
- `RuntimeSurfaceReadinessProbe` belongs at startup, workspace restore, plugin/config change, and before agent run.
- `ContextObjectBudget` belongs under ContextEpoch, compaction, memory/resource governor, and artifact retention.
- `TerminalInputAndPasteboardMatrix` belongs under terminal implementation/testing.
- `InstructionImportGraph` belongs under system/instruction/source integrity and ContextEpoch hashing.
- `UIProjectionStoreBudget` belongs under GUI state persistence and system resource governance.
- `InstallUpdateProvenanceReceipt` belongs under release/update/governance seal.
- `AI triage closure confidence` belongs as an extension of the semantic closure registry.

## Bottom-line synthesis

This pass found fewer broad architectural gaps and more proof-boundary gaps. PM's design is already directionally strong on durable goals, subagent gates, tool/MCP, context/cache, terminal, loop breakers, and semantic closure. The remaining high-risk misses are the ones that happen at runtime edges where the system “looks configured” or “looks approved” but the actual live object is different:

- the composer contains another session's stale draft,
- the MCP server initialized but a runtime call hangs forever,
- the approved command is not the executed command,
- the provider can support a model but the account route cannot,
- the plugin/tool/browser exists in config but is not injected after restart,
- the context budget counts tokens but not media objects,
- the tool result says something was attached when nothing was,
- the terminal parser handles ANSI but not IME/pasteboard/channel priority.

The clean PM principle is: every live runtime surface needs an identity, an epoch, a readiness proof, a budget, an approval/permission lease where applicable, and a settlement receipt. That gives PM a consistent way to absorb these last external lessons without bloating the product shape.


<!-- END_SOURCE_FILE: pm_one_more_external_repo_pass_2026-07-03.md -->


<!-- BEGIN_SOURCE_FILE: opencode_pm_plan_change_matrix.csv; SHA256: 22f0a52ad5efe409627e77f2b8cce8b1ae37feeb12316a84586b8f599ac6631e; LINES: 15 -->

# Raw CSV: opencode_pm_plan_change_matrix.csv

```csv
priority,finding_family,opencode_signal,pm_owner_docs,pm_current_strength,pm_gap,recommended_plan_unit_or_change,validation_surface
P0,context_epoch,"OpenCode v2 session/context epochs, compaction as active representation replacement","Plans/Prompt_Pipeline.md; Plans/storage-plan.md; Plans/assistant-chat-design.md; Plans/usage-feature.md","Compaction rules, context usage UI, low-context warnings, reasoning replay","No first-class ContextEpoch object found in repo scan","Add CONTEXT-EPOCH-RECORD with instruction/tool/MCP/provider/catalog/cache/history hashes","Plan index validate; context epoch replay fixtures; model-switch compaction tests"
P0,prompt_admission_execution,"OpenCode v2 session_input admission inbox and prompt/execution split; session seq/storage bugs","Plans/storage-plan.md; Plans/Contracts_V0.md; Plans/assistant-chat-design.md","Seglog/redb/Tantivy design; exclusive writer lock; projector checkpoints","No explicit session prompt admission inbox/event family","Add SESSION-PROMPT-ADMISSION-INBOX events and idempotency semantics","Crash/retry/duplicate prompt tests; seglog replay tests"
P0,provider_policy,"OpenCode v2 separates provider config from provider policy with wildcard/precedence","Plans/Models_System.md; Plans/Permissions_System.md; Plans/Multi-Account.md","Requested/effective model/account identity and permission ceilings","Provider use policy not separated from generic permissions with same clarity","Add ProviderPolicyRuleset owner section and precedence rules","Provider denied/configured fixtures; repo cannot re-enable user deny"
P0,provider_metadata_replay,"Anthropic thinking/signature preservation PRs; stale provider item ID fixes","Plans/CLI_Bridged_Providers.md; Plans/Prompt_Pipeline.md; Plans/Models_System.md","Bridge preserves normalized provider output; reasoning blocks replay-safe","No explicit provider-native replay-required/forbidden matrix","Add ProviderMetadataReplayPolicy by provider/model/context boundary","Anthropic/OpenAI/Copilot replay/model-switch tests"
P0,tool_output_retention,"OpenCode v2 Tool output bounding/managed storage; large body issues","Plans/Tools.md; Plans/Runtime_Artifacts_Panel.md; Plans/storage-plan.md","Timeouts and content_ref/map_ref patterns exist","No hard no-lossy-success rule for managed tool output retention","Add ToolManagedOutputRef and retention-failure semantics","Large output fixtures; retention failure returns ToolFailure/runtime blocker"
P0,tool_heartbeat,"OpenCode indefinite task/tool hang issues; MCP progress timeout reset fixes","Plans/Tools.md; Plans/Executor_Protocol.md; Plans/MCP_Integration.md; Plans/Automated_Testing_System.md","Timeouts for many tool classes exist","Need uniform ProgressHeartbeat, max silent interval, visible stalled state","Add ToolProgressHeartbeat contract","Long-running MCP/subagent/browser/device tests"
P0,desktop_version_handshake,"OpenCode desktop/local server/session tab/version issues; recent release patches","Plans/BinaryLocator_Spec.md; Plans/FinalGUISpec.md; Plans/Runtime_Artifacts_Panel.md","Setup/Health discovery and version-gated binary probes exist","No explicit DesktopServerVersionHandshake found","Add DesktopServerVersionHandshake and EmbeddedRuntimeLifecycle","Desktop/server/CLI/schema mismatch tests; LocalServer watchdog tests"
P0,opencode_v2_delta,"OpenCode beta/specs/v2 config/provider/session/tools/API are major redesign","Plans/Provider_OpenCode.md; Plans/OpenCode_Deep_Extraction.md; Plans/OpenCode_Coverage_Matrix.md","Existing OpenCode docs and source-lineage boundaries exist","Older OpenCode limitations may remain treated as hard assumptions without v2 review","Add OPEN-CODE-V2-DELTA-MATRIX","Research-mode import; plan index; audit closure registry"
P1,mcp_lazy_tool_exposure,"OpenCode MCP lazy loading PR and v2 config/tool design","Plans/MCP_Integration.md; Plans/Tools.md; Plans/Prompt_Pipeline.md","MCP lazy-load startup and schema caps exist","Need explicit lazy tool exposure to avoid schema prompt bloat","Add MCP lazy discovery actions and schema-context budget policy","Many-MCP-server context budget test; provider schema subset tests"
P1,filesystem_boundary_regressions,"OpenCode Plan-mode outside-project read/symlink/search bug family","Plans/Permissions_System.md; Plans/FileSafe.md; Plans/Tools.md","Path normalization/symlink fail-closed/external_directory guard strong","Need exhaustive fixtures across read/bash/grep/glob/edit and child contexts","Add external path/symlink regression suite","Permission/FileSafe test matrix"
P1,provider_error_observability,"Generic provider returned error issues, custom provider config forwarding bugs","Plans/CLI_Bridged_Providers.md; Plans/Models_System.md; Plans/Runtime_Artifacts_Panel.md","Bridge preserves errors/truncation/usage/correlation IDs","Need provider error detail minimums per endpoint type","Add ProviderErrorEnvelope fields: HTTP/status/body-class/request-id/retryability","Provider error fixtures for OpenAI-compatible, Kimi, OpenRouter, Copilot"
P1,github_update_workflow,"OpenCode upgrade GitHub API 403 and stale github@latest action issues","Plans/GitHub_Integration.md; Plans/BinaryLocator_Spec.md; Plans/FinalGUISpec.md","Broad GitHub/Auth/Setup surfaces exist","Need rate-limit-safe updater and release/action tag currentness guard","Add GitHubUpdateCurrentness and ReleaseTagVerifier","Unauthenticated/authenticated API fallback tests; stale tag detection"
P1,external_issue_closure,"OpenCode needs:compliance auto-close user frustration","Plans/Planning_Ledger_System.md; Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent; audit closure docs","Semantic closure registry exists for audits","External issue/PR closure governance not clearly extended","Add ExternalIssueClosureRegistry","No auto-close without evidence/triage schema; reopen conditions"
P2,v2_sdk_stability,"OpenCode issues ask whether v2 client export/sdk is stable","Plans/Provider_OpenCode.md; Plans/CLI_Bridged_Providers.md","Provider source-lineage boundaries already warn against overclaiming","Need explicit unstable SDK dependency gate","Add V2 SDK compatibility watchlist/status gate","Build blocks on unstable SDK without adopted compatibility proof"

```


<!-- END_SOURCE_FILE: opencode_pm_plan_change_matrix.csv -->


<!-- BEGIN_SOURCE_FILE: pm_external_repo_action_backlog_2026-07-03.csv; SHA256: 36c8bedfe38b30ec799d5657618d24177c1fc7745569e043aa308b5395411d63; LINES: 21 -->

# Raw CSV: pm_external_repo_action_backlog_2026-07-03.csv

```csv
id,priority,theme,source_repos,observed_signal,pm_current_coverage,gap,proposal,target_docs,acceptance_tests
P0-TERMINAL-PROTOCOL-MATRIX,P0,Built-in GUI terminal protocol coverage,ghostty-org/ghostty; tmux/tmux; warpdotdev/warp,"Ghostty/tmux current issues and releases revolve around OSC 133 shell integration, pasteboard semantics, mouse/key handling, Unicode/ZWJ crashes, and platform-specific regressions; Warp changelog shows alt-screen CLI-agent contrast, dropped keystrokes, zero-width crash, WSL PWD restore, session reopening, MCP spawn cwd, and settings/autonomy fixes.","PM Section15 has strong identity/lifecycle/interaction model, shell-integration tiers, cross-platform matrix, and parser-engine gates.","No explicit terminal protocol test matrix for OSC 52, OSC 8, OSC 9;4, OSC 133, OSC 633, bracketed paste, focus events, SGR/UTF-8 mouse, DEC synchronized updates, pasteboard priority, or terminal-feature negotiation.","Add PlanUnits under Section15 or a new Built_In_Terminal_Runtime.md that enumerate VT/xterm/OSC protocol fixtures and acceptance tests. Treat protocols as data fixtures with replayable byte streams, not prose-only requirements.",Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Automated_Testing_System.md,"VT replay corpus includes OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate screen, synchronized update sequences. | Parser output is deterministic across macOS/Linux/Windows/WSL fixtures. | Weak/unknown protocol support downgrades requested-vs-effective state rather than fabricating command blocks."
P0-TERMINAL-OUTPUT-BACKPRESSURE,P0,No silent terminal output loss,tmux/tmux; ghostty-org/ghostty; warpdotdev/warp,"tmux history includes backpressure/control-mode buffering design; older issue families report output lines missing when terminal/client can't keep up; Warp/Ghostty issue streams include huge output, rendering, and persisted block edge cases.",PM says retention/pruning are honest and high-output sessions must not stall UI; parser-engine gates include huge output fixtures.,"PM needs explicit loss accounting: when bytes are accepted by PTY reader, parsed, painted, persisted, pruned, redacted, or dropped/deferred, there must be receipts and user-visible status.","Add TerminalIngestionReceipt and TerminalBackpressureState. Differentiate accepted-by-PTY, parsed-to-grid, appended-to-transcript, flushed-to-storage, painted, pruned, redacted, and diagnostic-exported.",Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/storage-plan.md; Plans/Runtime_Artifacts_Panel.md,"A fast-output fixture records byte counts and no silent loss. | If retention cap prunes, transcript chunk references prove what remains and what was pruned. | UI thread never blocks on raw PTY ingestion."
P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR,P0,Accessible terminal text model separate from renderer,ghostty-org/ghostty,"Ghostty screen-reader discussion notes GPU rendering prevents screen readers from extracting terminal state and calls for direct screen-reader output, terminal-state exposure, cursor navigation support, and spam silencing.","PM has accessibility requirements and screen-reader-readable labels, plus requested-vs-effective disclosure for accessibility support.",PM still needs an explicit terminal accessibility text mirror and speech/event throttling model; labels alone are insufficient for a terminal grid.,"Add TerminalAccessibleBuffer projection from canonical grid/transcript state, with cursor navigation, line/selection reading, output announcement modes, and long-output silence/throttle controls.",Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/FinalGUISpec.md,"Screen reader projection can read current line, selection, prompt/command boundaries, and latest output without scraping GPU pixels. | Long-running spam commands throttle announcements without hiding state."
P0-PLAN-ACT-PERMISSION-BOUNDARY,P0,Plan/Act/autonomy boundaries must be runtime enforced,cline/cline; openai/codex; warpdotdev/warp,Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.,"PM has central tool policy engine, permission model, FileSafe, and terminal pre-run approval requirements.",Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema.,"Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed.",Plans/Permissions_System.md; Plans/Tools.md; Plans/Run_Modes.md; Plans/Section15_MVP_Promoted_Features_Spec.md,"A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode. | Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling."
P0-TOOL-RESULT-SETTLEMENT,P0,Partial/truncated/nullable provider tool turns cannot count as success,agent0ai/agent-zero; cline/cline; earendil-works/pi; openai/codex,Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.,PM has normalized tool outcomes and provider bridge output preservation requirements.,"Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal.","Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success.",Plans/Tools.md; Plans/CLI_Bridged_Providers.md; Plans/Models_System.md; Plans/storage-plan.md,finish_reason=length with tool call is classified partial_truncated. | nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata. | large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.
P0-PROVIDER-METADATA-REPLAY,P0,Provider-native reasoning/thinking/message metadata replay,cline/cline; agent0ai/agent-zero; earendil-works/pi; openai/codex,"Cline PRs/issues target model catalogs, reasoning effort controls, provider IDs, image capability omission, transient empty model responses, string agent messages, tool invocation repair; Pi issues include thinking-block normalization and Bedrock/OpenAI Responses provider work; Codex PR scopes model cache by provider/account.",PM has requested/effective provider/model/account identity and provider facade normalization.,"Need a typed provider-native artifact replay/drop/canonicalize policy for thinking blocks, signatures, reasoning IDs, nullable content, model variants, image/video content, provider account scoping.","Add ProviderNativeMetadataPolicy table: per provider/model capability, fields to retain, redact, drop-on-cross-provider, replay-only-same-account, or canonicalize. Include cache keys and model catalog version.",Plans/Models_System.md; Plans/CLI_Bridged_Providers.md; Plans/Prompt_Pipeline.md; Plans/Multi-Account.md,Switching provider/model never replays incompatible native reasoning blocks. | Model cache scoped by provider+account+capability catalog version. | Image/tool/reasoning content gates check capabilities before sending.
P0-HISTORY-STORAGE-CAPS,P0,Bounded session/history storage,agent0ai/agent-zero; cline/cline; earendil-works/pi,Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.,PM uses seglog/redb/checkpoints and says transcript retention is bounded/honest.,"Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure.",Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context.,Plans/storage-plan.md; Plans/Prompt_Pipeline.md; Plans/Runtime_Artifacts_Panel.md,"127MB metadata fixture is rejected/segmented before UI or model context load. | Context compiler emits compact summaries plus refs, not raw massive JSON. | Large tool results remain retrievable from artifacts with hashes."
P0-RELEASE-MIGRATION-GATE,P0,"Release, installer, migration, and rollback hardening",cline/cline; agent0ai/agent-zero; earendil-works/pi; ghostty-org/ghostty; warpdotdev/warp; openai/codex,"Cline v4 issues report task corruption and release stability concerns; Agent Zero issue list includes missing upgrade tag, v2 regression, Launcher/self-update bugs; Pi has binary/provenance and packaging/link issues; Ghostty 1.3.1 quickly patched 1.3.0 regressions; Warp changelog shows frequent migration/restore fixes; Codex changelog shows frequent CLI/app releases.","PM has governance gates and protected namespace, but release/migration strategy is not as explicit as runtime specs.","Need a release compatibility plan: canary/stable rings, artifact provenance, generated-link checks, state migration tests, downgrade/backup restore, extension/CLI/server protocol handshake, terminal session preservation across updates.",Add Release_Compatibility_and_Migration.md or PlanUnits under Progression_Gates. All major updates must run state-migration and rollback fixtures before users get them.,Plans/Progression_Gates.md; Plans/Project_Output_Artifacts.md; Plans/storage-plan.md; Plans/Goal_Runtime_System.md,Major version migration has backup/restore test. | Generated release links validate. | Protocol version mismatch blocks with actionable message. | App update does not orphan terminal/process sessions silently.
P1-TERMINAL-CLIPBOARD-PASTE-SAFETY,P1,"Clipboard, pasteboard, bracketed paste, OSC 52",ghostty-org/ghostty; warpdotdev/warp; tmux/tmux,Ghostty issue list includes paste preferring NSURL over plain text; Ghostty 1.3.0 fixed a paste/drag command-execution CVE; tmux CHANGES include OSC 52 clipboard support; Warp issues include copy/paste isolation.,PM has copy/paste/selection semantics and default copy-on-select disabled.,"Need explicit paste-source priority and pasted-control-character handling, bracketed-paste negotiation, OSC 52 policy, and cross-context clipboard isolation.","Add TerminalClipboardPolicy: plain text preference, URI/file types explicit, control-character confirmation, bracketed paste support state, OSC 52 allow/ask/deny, local/remote/container clipboard scope.",Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/Permissions_System.md; Plans/FileSafe.md,Pasting mixed URL/plain text chooses plain text unless user selects URI action. | Pasted Ctrl+C/control chars cannot execute without warning/normalization. | OSC 52 read/write respects policy and remote trust.
P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION,P1,Global keyboard hook isolation,ghostty-org/ghostty; warpdotdev/warp,Ghostty discussion reports system-wide keyboard freezes tied to global quick-terminal keybinding/event tap; Warp changelog includes global hotkey memory leak fixes.,PM has shortcut conflict disclosure and terminal input ownership states.,"No explicit global-event-tap isolation requirements: hooks must not run on UI/compositor main thread, must auto-disable on stall, and must be observable.","Add GlobalShortcutSafety PlanUnit for all app-level hotkeys, not only terminal. Include watchdog, timeout auto-disable, kill switch, and diagnostic banner.",Plans/FinalGUISpec.md; Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/Permissions_System.md,Global hotkey handler stall cannot freeze system input. | User can disable terminal/global hotkey path from safe mode. | Diagnostic bundle records hook health.
P1-TERMINAL-SESSION-PRESERVE-UPDATE,P1,Terminal session continuity across relaunch/update,warpdotdev/warp; tmux/tmux; ghostty-org/ghostty,Warp issue requests terminal/agent sessions alive across relaunch/app updates; Warp changelog includes reopen closed sessions and restored WSL PWD; tmux's mature value is session/window/pane durability.,PM says live continuity after app restart is best-effort and explicit when unavailable; historical state is not fake live shell.,Need a concrete platform matrix for live session survival/reconnect and a UX flow for when only historical review can be restored.,"Add TerminalSessionRestorePolicy by platform/runtime: local PTY, WSL, SSH, container, devcontainer. Define reconnect tokens, when impossible, and exact banners/actions.",Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/storage-plan.md; Plans/FinalGUISpec.md,"Relaunch fixtures prove PWD/profile/layout/transcript restoration. | If live PTY cannot survive, UI says review-limited and offers restart/rerun, not fake continuity."
P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS,P1,Resource ceilings for indexers/watchers/background agents,warpdotdev/warp; agent0ai/agent-zero; cline/cline,Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.,PM has dirty-layer watcher design and storage rollups but not a global resource-governor narrative for all background services.,"Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation.","Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls.",Plans/FileManager.md; Plans/storage-plan.md; Plans/Runtime_Artifacts_Panel.md; Plans/FinalGUISpec.md,"Large repo cannot allocate unbounded watchers. | Quota exceeded degrades with warning and exact subsystem, not crash."
P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT,P1,MCP and external agent config import with trust boundaries,cline/cline; warpdotdev/warp; agent0ai/agent-zero; openai/codex,Cline emphasizes MCP/plugins and `.clinerules`; Warp changelog says MCP servers detected from third-party agents become visible/spawnable and project MCP servers spawn from repo root; Codex docs expose MCP/skills/plugins surfaces.,PM has MCP Integration and central tool registry/permission model.,"Need config-import provenance and trust policy: imported MCP config is a suggestion, not automatically executable.","Add ImportedToolConfigSource records: source app/file, hash, cwd resolution, permission default, secret redaction, first-run review.",Plans/MCP_Integration.md; Plans/Tools.md; Plans/Permissions_System.md; Plans/FileSafe.md,Imported MCP server from `.claude`/Codex/Warp config defaults ask/disabled until reviewed. | Relative command cwd is project-root only when explicitly resolved and shown.
P1-CONTEXT-SKILL-BUDGETS,P1,Skill/context catalog progressive disclosure,openai/codex; cline/cline; earendil-works/pi,Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.,PM Prompt Pipeline owns skill bundling and compaction algorithms.,Need explicit skill/tool/catalog listing budgets and omission warnings in GUI.,"Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries.",Plans/Prompt_Pipeline.md; Plans/Skills_System.md; Plans/Tools.md; Plans/Models_System.md,Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason. | Selected skill loads full instructions only when chosen.
P1-SECURITY-CREDENTIAL-LOGGING,P1,Credential and sensitive output redaction timing,agent0ai/agent-zero; cline/cline; openai/codex,Agent Zero security issue raises credential leakage concerns; Codex issue list has PostToolUse redaction-before-transcript-rendering problem; Cline PRs add credential lifecycle debug logging.,PM has FileSafe and privileged session metadata minimization.,"Need a redaction-time ordering contract: raw tool output must not hit UI/transcript before redaction policy has a chance to apply, unless explicitly marked sensitive/raw local-only.",Add RedactionSettlement stage before UI/render/persistence for tool/terminal/model outputs; keep secure raw vault only when required for replay with explicit policy.,Plans/FileSafe.md; Plans/Permissions_System.md; Plans/Tools.md; Plans/storage-plan.md,Secret fixture in tool output is redacted before GUI transcript render. | Privilege metadata logs actor/target/realm/transport without command secrets.
P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE,P1,CLI/server/extension protocol compatibility,agent0ai/agent-zero; cline/cline; openai/codex,"Agent Zero CLI/server mismatch produced terminal corruption, false code-exec status, timeout, orphan, and cooked-mode issues; Cline CLI package/version issues and codesigning failures; Codex CLI releases patch platform/sandbox/proxy behavior.",PM has CLI_Bridged_Providers and ProviderRequestEnvelope.,Need version/capability handshake and terminal-mode restore around all CLI bridges.,"Add BridgeHandshakeReceipt: protocol version, binary hash, provider version, shell/terminal mode pre/post, cwd, capabilities, keepalive, timeout policy.",Plans/CLI_Bridged_Providers.md; Plans/Tools.md; Plans/Section15_MVP_Promoted_Features_Spec.md,Version mismatch blocks before raw protocol noise hits terminal. | Bridge restores cooked mode/echo on crash or timeout. | Orphan process cleanup receipts written.
P1-AGENT-FOCUS-WATCHDOG,P1,Agent focus/progress watchdog for GUI,warpdotdev/warp; cline/cline; openai/codex,Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.,"PM has Goal Runtime and closure registry concepts, but terminal/dev-loop progress integration can be stronger.","Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering.",Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents.,Plans/Goal_Runtime_System.md; Plans/Runtime_Artifacts_Panel.md; Plans/Section15_MVP_Promoted_Features_Spec.md,Long-running shell command exposes next-check countdown and manual snapshot trigger. | Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
P2-DOCS-GENERATED-LINK-VALIDATION,P2,Generated docs/release notes link validation,earendil-works/pi,Pi issue reports generated release-note relative links broken on GitHub/terminal and suggests improving prompt/tests.,PM has governance shards/evidence and plan validators.,"Need link-mode validators for generated Markdown across GitHub, local GUI, terminal/plaintext, and app viewer.",Add GeneratedMarkdownLinkCheck to governance seal.,Plans/Progression_Gates.md; Plans/Project_Output_Artifacts.md,"Release notes/bootstrap docs validate relative links under repo, GitHub rendered, and app routes."
P2-BINARY-PROVENANCE-ASSETS,P2,Binary/provenance/codesigning,earendil-works/pi; cline/cline; openai/codex,Pi issue requests SHA256SUMS/provenance for binaries; Cline has AMFI/codesign killed CLI and Darwin sign PRs; Codex ships npm CLI releases.,PM has Spec Lock/governance hashes but product release asset provenance is not detailed.,Need release asset signature/hash/SBOM policy for any PM distributed binary/plugin/bridge.,Add ReleaseArtifactProvenance PlanUnit.,Plans/Project_Output_Artifacts.md; Plans/Progression_Gates.md,"Every downloadable binary/plugin has SHA256, signing/provenance, build source ref, and install verification."
P2-GUI-NOT-CLI-CONTROL-PLANE,P2,Translate CLI lessons into GUI adapter contracts,warpdotdev/warp; openai/codex; cline/cline; tmux/tmux,Warp became an agentic development environment born out of terminal; Codex offers CLI/app/IDE; Cline offers IDE/terminal/CLI/SDK/Kanban; tmux is terminal-native and scriptable.,"PM is GUI-first and Section15 says terminal is canonical interactive shell surface, not app CLI.","Need explicit non-goal: do not let a PM CLI become the main product. CLI/terminal lessons feed internal tool/adapter APIs, GUI command catalog, and embedded terminal behavior.",Add GUI-first terminal policy note: built-in terminal is a user shell and agent surface; PM command/control remains GUI/Goal/PlanUnit driven.,Plans/FinalGUISpec.md; Plans/Section15_MVP_Promoted_Features_Spec.md; Plans/UI_Command_Catalog.md,Every terminal action has GUI-visible state and command palette command; no core workflow requires opaque CLI-only state.

```


<!-- END_SOURCE_FILE: pm_external_repo_action_backlog_2026-07-03.csv -->


<!-- BEGIN_SOURCE_FILE: pm_missed_domains_backlog_2026-07-03.csv; SHA256: 5b96dd32ebbbc2b02ed94e0ea72ed1744127305e324ae555c0c5bf7222863573; LINES: 20 -->

# Raw CSV: pm_missed_domains_backlog_2026-07-03.csv

```csv
id,priority,theme,source_repos,observed_signal,pm_current_coverage,gap,proposal,target_docs,acceptance_tests
P0-AGENT-CONTROL-PLANE-ENVELOPE,P0,Agent control / autonomy / effort / resource envelope,OpenCode; Cline; Agent Zero; Pi; Codex; Warp,"Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.","PM already has Goal Runtime role-policy, progress fingerprints, hard budgets, parent/child goals, verification repair loop, provider/model requested/effective identity, and approval boundaries.","Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry.","Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs.",Plans/Goal_Runtime_System.md; Plans/Models_System.md; Plans/Executor_Protocol.md; Plans/Tools.md; Plans/FinalGUISpec.md; Plans/storage-plan.md,"Every child run persists AgentControlEnvelope before first provider/tool call. | GUI can show requested/effective autonomy, model, effort, budgets, and authority. | A child/subagent cannot exceed parent ceiling even if model/tool output requests it. | Completion receipts include envelope hash and final budget state."
P0-EFFORT-POLICY-SETTLEMENT,P0,Reasoning/thinking/effort requested-vs-effective,OpenCode; Codex; Cline; Pi,"OpenCode issues report subagent reasoning-effort config gaps, Anthropic thinking signature failures, and TUI display mismatches; Codex issues report reasoning resetting, ignored custom model slugs, xhigh stalls, and model/effort change failures; Pi and Cline show provider-specific thinking controls causing errors or stale settings.","Models_System already requires requested effort, effective provider wire value, unsupported/clamped effort disclosure, and runtime-qualified effort capability.","PM needs a settlement object that proves whether effort was honored, clamped, ignored, transformed, blocked, reset during continuation, or unsupported per provider attempt and per child/subagent.","Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule.",Plans/Models_System.md; Plans/Provider_OpenCode.md; Plans/Goal_Runtime_System.md; Plans/usage-feature.md,"A model switch, compaction, resume, or subagent spawn emits a fresh effort settlement. | Unsupported xhigh/high cannot display as honored. | If provider accepts request but GUI label lags, diagnostic flags display_mismatch. | Stalls before first token/reasoning item are typed separately from ordinary thinking time."
P0-SUBAGENT-EXECUTION-CONTRACT,P0,"Subagent lifecycle, model/effort config, and result authority",Codex; OpenCode; Cline; Agent Zero,Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes show child chats/parallel tools and non-destructive await timeouts.,"PM has parent/child goal runtime policy, canonical child run identity for subagents, and prompt-packet subagent hard gates.","PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating.","Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper.",Plans/Goal_Runtime_System.md; Plans/Tools.md; Plans/Executor_Protocol.md; Plans/storage-plan.md; Plans/FinalGUISpec.md,A child can use a different allowed model/effort only if settlement proves it. | Parent cannot certify complete until all required child results are settled or explicitly waived. | Orphan helpers/processes are reaped on session close/crash/restart. | Subagent loops trip per-child and aggregate budgets.
P0-LOOP-BREAKER-TAXONOMY,P0,Looping / no-progress / spend control,OpenCode; Cline; Agent Zero; Pi; Codex,"OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.","Executor has doom-loop guard and Goal Runtime has progress fingerprints, budgets, and verification repair loop.","The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops.","Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason.",Plans/Executor_Protocol.md; Plans/Goal_Runtime_System.md; Plans/Tools.md; Plans/Provider_OpenCode.md; Plans/FinalGUISpec.md,Fixtures for each loop family stop within bounded attempts. | Spend/quota caps terminate even when model output appears syntactically successful. | Compaction can run once or configured bounded times but cannot self-loop indefinitely. | GUI shows stopped_for_loop with fingerprint and last safe point.
P0-MULTIMODAL-INPUT-SETTLEMENT,P0,Vision/multimodal input admission and fallback,OpenCode; Cline; Codex; Pi,"OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format gaps. Codex IDE officially supports image generation/editing and model/context surfaces.","Media_Generation_and_Capabilities has media route taxonomy, capability telemetry, Vision Bridge eligibility, media tool contracts, and no-stale capability cache. Models_System also has Vision Bridge requested/effective route resolution.",PM’s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context.,"Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images.",Plans/Media_Generation_and_Capabilities.md; Plans/Models_System.md; Plans/Tools.md; Plans/FinalGUISpec.md; Plans/Provider_OpenCode.md,"Text-only model + image file yields denied_or_captioned, never hidden prompt bloat. | Wrong MIME is blocked before provider request. | Vision-capable custom provider must prove modality support or fall back. | GUI can show original artifact and caption/fallback provenance."
P0-PROVIDER-CAPABILITY-EPOCH-2,P0,Provider/model capability freshness and route-specific support,OpenCode; Cline; Pi; Codex,"Repos show stale/wrong context-window metadata, route-specific limits, ghost models, model variant quirks, modality gaps, effort support uncertainty, and provider-native reasoning/tool replay drift.","Models_System has provider-owned catalogs, capability/cost gating, requested/effective identity, provider capability matrix application gate, and Vision Bridge route resolution.","Capabilities need epoch identity and source confidence across model catalog, context window, cache support, tool-calling, vision/media, reasoning effort, usage accounting, transport, and provider-native replay.","Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers.",Plans/Models_System.md; Plans/Provider_OpenCode.md; Plans/MCP_Integration.md; Plans/usage-feature.md,Changing account/profile/route/model invalidates capability epoch. | Unknown or stale capabilities cannot present controls as supported. | Model limit and cached-token accounting show measured/provider_reported/estimated/unknown. | Provider-native replay rules are keyed by epoch.
P0-TOOL-CALL-MALFORMATION-GATE,P0,Malformed/truncated/partial tool-turn admission,OpenCode; Cline; Agent Zero; Pi,"OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.",Tools already has invalid arg/truncated invocation structured failures and a rich tool outcome taxonomy.,"Malformed provider output must be stopped before durable history admission, not only before actual tool execution.","Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy.",Plans/Tools.md; Plans/Prompt_Pipeline.md; Plans/Provider_OpenCode.md; Plans/storage-plan.md,"Partial streamed JSON/tool XML never becomes replayable assistant history. | A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response. | Replayed history never includes malformed or duplicate tool_call IDs."
P0-LOG-REDACTION-BEFORE-WRITE,P0,"Logging, traces, diagnostics, and privacy",Codex; OpenCode; Warp; Pi; Agent Zero,"Codex issues show raw logs with paths/env/account/token-like data, heavy idle I/O, and stale helper processes; Pi exposes OpenTelemetry hooks; OpenCode supports Helicone/monitoring headers; Warp issue logs show per-character terminal event floods.","PM has seglog, usage records, provider/usage join fields, terminal persistence, and runtime artifact identity.","Observability needs a redaction-before-write and log-volume contract shared by provider traces, WebSockets/SSE, terminal streams, subagents, tools, MCP, memory, and support bundles.","Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs.",Plans/storage-plan.md; Plans/usage-feature.md; Plans/FinalGUISpec.md; Plans/Executor_Protocol.md; Plans/Provider_OpenCode.md,Raw provider requests/WS payloads are scrubbed before disk. | Terminal huge-output fixture cannot create unbounded per-character logs. | Support bundle validator rejects secrets/env/token-like fields. | Usage/cost/log traces join by attempt_id without exposing hidden content.
P0-SYSTEM-RESOURCE-GOVERNOR,P0,System memory/process/file-watcher/resource management,Ghostty; Warp; Codex; Agent Zero; Cline,Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.,"FinalGUISpec and storage-plan include terminal projection throttling/ring buffers, memory-bounds risks, file watcher risk, persistence, and crash recovery.","PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes.","Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts.",Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Goal_Runtime_System.md; Plans/MCP_Integration.md; Plans/Tools.md,Closing/crashing PM reaps child helpers or marks them orphaned for cleanup. | Huge terminal output applies backpressure without GUI freeze. | Memory store and chat/session files have size/compaction policies. | Low-memory mode disables optional previews/agents before core runtime fails.
P1-MODEL-SELECTION-ROUTER,P1,Model selection per role/skill/tool/subagent,Codex; OpenCode; Cline,Codex discussions request per-skill model selection and issues show custom subagent model config not honored; OpenCode issues request model variants and subagent model/effort selection; Cline SDK centralizes session/Plan/Act coordination and provider migration.,PM already has provider/model precedence by scope and Goal Runtime model-role policy.,PM should map tasks to model/effort through a scored router instead of static defaults while preserving user policy and certification-tier rules.,"Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers.",Plans/Models_System.md; Plans/Goal_Runtime_System.md; Plans/Plan_To_Node_Compilation.md,Low-risk summarization can select cheaper model only when certification policy allows. | Verifier/adjudicator model cannot downgrade below risk tier. | Router output is requested/effective and auditable. | User can pin or forbid providers per project/account.
P1-USAGE-ANOMALY-QUOTA-GUARD,P1,Token/cost anomalies and quota protection,OpenCode; Cline; Codex; Agent Zero,OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.,usage-feature has UsageRecord and context breakdown surfaces; Provider_OpenCode maps usage_update into normalized usage events; Goal Runtime exposes max_tokens and usage_limited.,PM needs anomaly detection separate from ordinary usage collection.,"Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution.",Plans/usage-feature.md; Plans/Models_System.md; Plans/Goal_Runtime_System.md; Plans/Provider_OpenCode.md,Provider usage null uses estimator and marks confidence. | Sudden token/cost jump pauses or confirms under policy. | User sees why cost was blocked/allowed. | Cache-miss churn on stable tasks is reported as optimization warning.
P1-MEMORY-TIERING-CONTRACT,P1,"Agent memory, goal memory, project memory, conversation history",Agent Zero; Pi; Codex; Cline,Agent Zero reports chat history bloat and memory-search/consolidation timeouts; Pi documents context persistence and handoff to other models; Codex Goals/skills show durable objective and progressive disclosure; Cline SDK moves task history/session handling into shared runtime.,"assistant-memory-subsystem is strong on assistant-only memory, scopes, gists, prompt injection, retrieval, scoring, and maintenance. PM bootstrap ledgers also capture durable design memory.","PM should explicitly separate memory tiers: transcript/history, operational goal state, project/spec ledger, assistant preference memory, tool/artifact memory, and ephemeral context working set.","Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics.",Plans/assistant-memory-subsystem.md; Plans/Goal_Runtime_System.md; Plans/storage-plan.md; Plans/Planning_Ledger_System.md,"A giant chat/session file is compacted or paged before app crash. | Memory search timeout returns degraded result, not hung turn. | Project ledger facts are not injected as personal memory. | Superseded/stale memory cannot silently override current Plan canon."
P1-PROMPT-CACHE-STABILITY-LINTER,P1,Prompt/cache/token efficiency hygiene,OpenCode; Cline; Pi; Codex,OpenCode reports system-environment prompt cache invalidation and provider cache-marker gaps; Pi changelog includes prompt caching and cached-token accounting; Codex skills use progressive disclosure; Cline fixes prompt-cache detection and compaction routing.,Previous pass recommended ContextEpoch/PromptCachePolicy; PM has provider cache metadata boundaries and compaction metadata.,"PM should add a linter/diagnostic that explains why cache hit rate is low, not only record usage.","Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation.",Plans/Models_System.md; Plans/Prompt_Pipeline.md; Plans/usage-feature.md; Plans/Tools.md,Two identical tasks show stable prefix preserved. | Moving cwd/date/git status to late volatile block improves cache expectation. | Dynamic tool result not placed before stable instructions. | GUI explains cache miss source.
P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS,P1,"Token efficiency for tools, skills, MCP, and docs",Codex; OpenCode; Cline; Agent Zero,Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.,"PM has MCP schema caps, tool registry, skill/tool GUI surfaces, and tool usage rollups.","PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities.","Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable.",Plans/Tools.md; Plans/MCP_Integration.md; Plans/Models_System.md; Plans/Prompt_Pipeline.md,Default context never includes all full MCP schemas. | Tool search can materialize a selected tool without losing rich-result parser path. | Permission changes invalidate catalog slice. | Token budget reports catalog materialization cost.
P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS,P1,Terminal-bound agent output storms and UI safety,Warp; Ghostty; tmux; Codex,Warp reports TUI agent output/CPU/log floods; Ghostty reports memory leaks in long coding-agent terminal sessions; tmux prompt-marker handling shows semantic terminal metadata can be corrupted by middle layers.,"PM has terminal protocol, persistence, projection throttling, ring buffers, and output retention honesty.","PM should add agent-specific terminal storm controls: when the terminal runs Claude Code/Codex/OpenCode/etc., PM should know it is agentic output with special backpressure and semantic-marker needs.","Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression.",Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Executor_Protocol.md,Running a high-output TUI agent does not freeze GUI or explode logs. | OSC 133/633 marker loss/degradation is visible. | PM never interprets terminal agent text as PM-native tool receipt without adapter proof.
P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY,P1,Fallback captioning/OCR/transcription as explicit route,OpenCode; Cline; Codex,"OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.","Vision Bridge/media routes exist, but fallback captioning should be governed separately from native vision.",Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image.,"Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure.",Plans/Media_Generation_and_Capabilities.md; Plans/Models_System.md; Plans/usage-feature.md,"Non-vision model with image shows “caption fallback used,” with caption artifact and cost. | User can disable fallback. | Provider request receipt says selected model saw text caption only."
P1-STREAM-HISTORY-COALESCER-REPLAY,P1,Streaming/admission/replay boundary,OpenCode v2; Pi; Codex; Cline,OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.,Prior pass recommended StreamHistoryCoalescer; storage-plan has seglog replay/checkpoints and context ownership.,"Make settled history admission mandatory for all providers, not just context/cache pass.","Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases.",Plans/storage-plan.md; Plans/Prompt_Pipeline.md; Plans/Provider_OpenCode.md; Plans/Models_System.md,"No partial stream fragment is replayed as a full assistant turn. | Provider native item IDs are kept only where allowed by replay policy. | First-event timeout is a transport failure, not empty assistant success."
P2-OTEL-EXPORT-OPTIONAL-ADAPTER,P2,Observability export interoperability,Pi; OpenCode; Codex,Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.,Seglog is PM’s canonical source; usage/analytics rollups exist.,External observability should be supported without making OTLP canonical or leaking sensitive content.,"Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so.",Plans/storage-plan.md; Plans/usage-feature.md; Plans/Provider_OpenCode.md,Exporter can be disabled globally/project. | Export failure produces degraded status only. | Redacted projection schema is documented and validated.
P2-MODEL-CATALOG-CONFIDENCE-UI,P2,Provider/catalog confidence and user explanation,OpenCode; Cline; Pi,"Recent issues show model catalogs with wrong context windows, missing modalities, ghost models, static capability assumptions, and route-specific gaps.",Models_System has provider-owned catalogs and evidence states; GUI disclosure surfaces exist.,"Expose capability source confidence in Settings/model picker so users understand why a model shows/hides vision, effort, cache, or context controls.","Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope.",Plans/Models_System.md; Plans/FinalGUISpec.md; Plans/Provider_OpenCode.md,A custom OpenAI-compatible model with unknown vision shows unknown/not supported until proven. | User can refresh/retest capability. | Hidden controls include reason.

```


<!-- END_SOURCE_FILE: pm_missed_domains_backlog_2026-07-03.csv -->
