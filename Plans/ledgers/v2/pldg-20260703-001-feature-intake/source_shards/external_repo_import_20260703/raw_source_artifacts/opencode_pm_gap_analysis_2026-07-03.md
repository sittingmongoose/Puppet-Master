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
