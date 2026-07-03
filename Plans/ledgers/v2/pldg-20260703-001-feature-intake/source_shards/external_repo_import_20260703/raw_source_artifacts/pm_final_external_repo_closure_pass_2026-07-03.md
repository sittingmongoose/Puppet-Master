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
