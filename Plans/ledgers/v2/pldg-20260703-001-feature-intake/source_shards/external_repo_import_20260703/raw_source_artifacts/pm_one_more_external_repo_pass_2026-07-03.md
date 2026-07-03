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
