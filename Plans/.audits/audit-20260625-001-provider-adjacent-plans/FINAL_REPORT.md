# audit-20260625-001-provider-adjacent-plans

status: FAIL_IMPLEMENTATION_READY
created_on: 2026-06-25
mode: audit-only
write_scope: Plans/.audits/audit-20260625-001-provider-adjacent-plans/
canonical_plans_modified: false

## Scope

This audit reviewed provider-adjacent non-generated Plans for implementation readiness, stale provider assumptions, GUI/provider setup issues, media capability drift, provider/model resolution conflicts, stubs, unsafe ambiguity, and validation gaps.

The audit intentionally did not edit canonical Plans, generated shards, evidence, Spec_Lock, plan graph, auto_decisions, WorkNodes, NodeSeeds, or provider ledgers. Active provider-update ledger material was treated as source-lineage context only, not canonical product prose.

Primary provider-adjacent docs with material findings include:

- `Plans/00-plans-index.md`
- `Plans/assistant-chat-design.md`
- `Plans/BinaryLocator_Spec.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`
- `Plans/newfeatures.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Tools.md`
- `Plans/Permissions_System.md`
- `Plans/usage-feature.md`

## Executive Result

Provider-adjacent Plans are not implementation-ready. The main failure mode is not one bad paragraph; it is a stale provider model replicated across registry, model routing, media, GUI setup, usage, CLI discovery, and provider health. Gemini CLI remains active in canonical Plans while Antigravity has no concrete replacement contract. Cursor is still mostly modeled as CLI/usage-adjacent even though the current provider-update lane is moving toward OAuth/API/subscription-backed direct support. OpenCode is partly specified but still carries unresolved or stale readiness text, route/version assumptions, and catalog-vs-E2E readiness ambiguity.

The repair should be treated as a provider-canon refresh, not a local cleanup. Multi-Account, Models_System, Media_Generation_and_Capabilities, Provider_OpenCode, BinaryLocator_Spec, Prompt_Pipeline, usage-feature, and GUI consumers need synchronized owner-doc edits before implementation starts.

## Findings

### F-001 - P0 blocker - Gemini CLI retired in intent but still active in Plans; Antigravity replacement is missing

gui_related: true

Evidence:

- `Plans/00-plans-index.md:190` preserves Gemini Direct and Gemini CLI as separate active provider entries.
- `Plans/Multi-Account.md:25-26` frames current provider canon around a Gemini Direct/Gemini CLI split and exactly seven provider entries.
- `Plans/Multi-Account.md:167-176` lists `gemini_cli` as one of the seven active entries.
- `Plans/CLI_Bridged_Providers.md:127` defines Gemini CLI account state under `GEMINI_CLI_HOME`.
- `Plans/Contracts_V0.md:9041-9062` defines Gemini Direct/CLI auth behavior, with `gemini_cli` OAuth/API-key/Google-credential semantics.
- `Plans/Models_System.md:229`, `Plans/Models_System.md:263`, and `Plans/Models_System.md:693` keep `gemini_cli` in runtime-platform and model-option behavior.
- `Plans/Media_Generation_and_Capabilities.md:2048-2102` preserves Gemini CLI Nanobanana media routing.
- `Plans/orchestrator-subagent-integration.md:27602-27621` keeps Gemini CLI as a separate provider/runtime entry.
- `Plans/Plan_To_Node_Compilation.md:212-214` preserves Antigravity only as a negative or generic token, not as a concrete provider.
- `Plans/Models_System.md:7428-7539` includes the negative constraint `No Antigravity/Claude Code/Cursor/OpenCode CLI bridge setting in built Puppet Master`.

Problem:

The user's active provider intent says Gemini CLI support must be killed and replaced by Antigravity. Canonical Plans still model Gemini CLI as live across provider registry, auth, model selection, media, setup/health, usage, orchestration, and GUI-facing identity. Antigravity appears only as a comparison/negative token, not as an implementable provider with auth, launcher, model discovery, command protocol, account isolation, media capability, usage/quota, or validation contracts.

Required repair:

- Remove Gemini CLI from active provider canon rather than leaving compatibility notes that implementers can accidentally build.
- Add Antigravity as a real provider entry with provider_id, transport type, auth model, installation/discovery, model discovery, account/session isolation, thinking effort support, media support, setup/health, usage/quota, errors, and E2E validation.
- Preserve retired Gemini CLI terms only in source-lineage/compatibility sections clearly marked not implementable.

### F-002 - P0 blocker - Provider-entry inventory conflicts with first-class direct coding-plan providers

gui_related: true

Evidence:

- `Plans/Multi-Account.md:26` and `Plans/Multi-Account.md:167` assert exactly seven provider entries.
- `Plans/Multi-Account.md:420-429` only models those seven entries in the behavior matrix.
- `Plans/Multi-Account.md:193-195` adds direct coding-plan provider entries and API bases.
- `Plans/Models_System.md:835-848`, `Plans/Models_System.md:877-890`, and `Plans/Models_System.md:918-923` describe Alibaba/MiniMax/Z.AI direct-provider surfaces.
- `Plans/usage-feature.md:359-361` and `Plans/usage-feature.md:605` add coding-plan quota/reset semantics.
- `Plans/orchestrator-subagent-integration.md:27656-27700` says direct coding-plan providers must not be treated as OpenCode-only server entries.

Problem:

The provider registry cannot simultaneously be "exactly seven" and include direct coding-plan providers as first-class provider/model surfaces. This blocks Settings provider lists, setup flows, account profiles, quota display, model pickers, and dispatch validation.

Required repair:

- Make `Plans/Multi-Account.md` the active provider-entry inventory owner.
- Replace "exactly seven" with a current provider taxonomy: core providers, direct API providers, server-bridged providers, CLI/launcher-backed providers, retired compatibility entries, and candidate/unverified providers.
- Add a provider readiness state such as `retired | candidate | first_class_direct_provider | first_class_cli_provider | first_class_server_bridge | disabled_until_verified`.

### F-003 - P0 blocker - Cursor route strategy is stale and split across incompatible CLI/API assumptions

gui_related: true

Evidence:

- `Plans/rewrite-tie-in-memo.md:50-51` preserves Claude/Cursor CLI framing and Cursor-not-ACP-native assumptions.
- `Plans/Multi-Account.md:451-453` says PM still must define the actual `cursor-agent` launch contract rather than only editor-facing `cursor --user-data-dir` workarounds.
- `Plans/usage-feature.md:195-216` treats Cursor API as usage/account metadata only.
- `Plans/usage-feature.md:753-754` says model invocation stays OAuth plus CLI.
- `Plans/FinalGUISpec.md:225` says Cursor CLI must be re-evaluated as ACP-capable first-class backend, but surrounding surfaces still speak in CLI terms.
- `Plans/assistant-chat-design.md:194-195`, `Plans/assistant-chat-design.md:2283-2286`, and `Plans/assistant-chat-design.md:15142-15150` source provider/model lists from `platform_specs` and fallback models, not from account-bound provider/model profiles.

Problem:

Cursor is not locked into one implementable route in canonical Plans. Some text still implies CLI/OAuth invocation, some text treats API as non-invocation metadata, some text asks for ACP evaluation, and the active provider-update lane points toward Cursor subscription/API key/direct capability. The GUI provider/model selector also uses old platform/fallback assumptions that do not align with provider -> models -> account profiles.

Required repair:

- Decide and encode the Cursor implementation route: direct Cursor API/composer route, ACP route, CLI bridge, or a phased combination with strict readiness states.
- Add GUI copy for Cursor API key acquisition from `https://cursor.com/dashboard/` API keys section if the API route is promoted.
- Define requested/effective account, model, auth, media, usage, and error behavior for the chosen route.
- Remove or demote stale CLI-only claims once the route is chosen.

### F-004 - P1 blocker - Media support is stale, Gemini-centered, and cannot express current provider capabilities

gui_related: true

Evidence:

- `Plans/Media_Generation_and_Capabilities.md:238-262` says non-Cursor media follows the Gemini model and includes Gemini CLI/Nanobanana setup language.
- `Plans/Media_Generation_and_Capabilities.md:316` restricts `engine.backend` to `gemini_api | cursor_native`.
- `Plans/Media_Generation_and_Capabilities.md:615` and `Plans/Media_Generation_and_Capabilities.md:678` show GUI copy telling users to sign in with Gemini OAuth or add a key.
- `Plans/Media_Generation_and_Capabilities.md:624-629`, `Plans/Media_Generation_and_Capabilities.md:722-737`, and `Plans/Media_Generation_and_Capabilities.md:777-779` model Cursor image-only and non-Cursor Gemini media modes.
- `Plans/Models_System.md:637-641` lists media aliases only for Gemini/Nano Banana/Veo/TTS.
- `Plans/Provider_OpenCode.md:386-393` states OpenCode media tools are not OpenCode-provided and are backed by Gemini API key or Cursor-native routes.

Problem:

The media plan cannot represent the current provider landscape. It is centered on Gemini plus Cursor-native image generation, retains Gemini CLI, and lacks a provider-by-provider media capability matrix for current OpenAI image generation, Cursor, Gemini Direct API, Antigravity, OpenCode-routed providers, and direct coding-plan providers. The response schema cannot identify richer backend/provider/runtime distinctions.

Required repair:

- Create a provider -> model -> media capability matrix with image input, image generation, video, audio/TTS, file attachment, screenshots, and multimodal prompt support.
- Add current OpenAI image-generation support and any other researched provider media capabilities as concrete provider/model entries.
- Replace `engine.backend` with a backend/provider/model/runtime/auth shape that can express direct API, server bridge, CLI/launcher bridge, and provider-native media.
- Update GUI setup copy so retired Gemini CLI/OAuth media paths do not appear as live instructions.

### F-005 - P1 blocker - OpenCode route, identity, and readiness contracts remain internally inconsistent

gui_related: true

Evidence:

- `Plans/Provider_OpenCode.md:57-58` references `https://github.com/anomalyco/opencode`, which is a currentness risk that must be rechecked before implementation.
- `Plans/Provider_OpenCode.md:67-83` says the session identity issue is both fixed and still active.
- `Plans/Provider_OpenCode.md:233-246` correctly moves OpenCode session IDs into provider-native correlation metadata while preserving PM `thread_id`.
- `Plans/Provider_OpenCode.md:241-242` says OpenCode discovery can surface Alibaba/MiniMax/Z.AI models while warning not to invent separate OpenCode entries.
- `Plans/Provider_OpenCode.md:361-368` treats `GET /provider` connected/catalog visibility as picker input.
- `Plans/Provider_OpenCode.md:411-423` makes Doctor readiness depend heavily on connected provider discovery.
- `Plans/Provider_OpenCode.md:488-535` and `Plans/Provider_OpenCode.md:2419-2539` hardcode server routes such as `POST /session`, `POST /session/{id}/message`, `/prompt_async`, and `GET /event`.
- `Plans/Provider_OpenCode.md:2904-2969` lists acceptance around reachable enabled sessions, discovery, and GUI picker wiring.

Problem:

OpenCode is close, but not implementation-ready. It needs current route/version proof, a stable minimum supported OpenCode version, fixture-backed request/stream semantics, and a readiness rule that requires E2E prompt output rather than catalog visibility. The doc also carries stale unresolved identity-bug prose next to the corrected identity contract.

Required repair:

- Verify and pin the current OpenCode repo, server API routes, event stream shape, model discovery shape, and minimum supported version.
- Split `catalog_visible`, `authenticated`, `prompt_e2e_verified`, and `usable_now` readiness states.
- Rewrite stale P5 identity text as resolved lineage or a precise remaining stream-correlation gap.
- Add fixtures for provider/model discovery, session creation, message send, streaming events, tool-call events, error states, and server/global account opacity.

### F-006 - P1 blocker - BinaryLocator/setup health does not cover the actual provider launcher surface

gui_related: true

Evidence:

- `Plans/BinaryLocator_Spec.md:8`, `Plans/BinaryLocator_Spec.md:82`, and `Plans/BinaryLocator_Spec.md:138` scope locator behavior primarily to Cursor Agent and Claude Code.
- `Plans/BinaryLocator_Spec.md:117-129` delegates candidate binary names to provider-owned SSOT but points to removed legacy `platform_specs.rs`.
- `Plans/BinaryLocator_Spec.md:169-178` delegates common locations to provider-owned SSOT with legacy anchors.
- `Plans/BinaryLocator_Spec.md:243-244` delegates version commands to provider-owned SSOT with legacy anchors.
- `Plans/BinaryLocator_Spec.md:275-276` defers wrong-binary signatures.
- `Plans/BinaryLocator_Spec.md:331-341` and `Plans/BinaryLocator_Spec.md:1355-1365` provide Cursor-specific path handling.

Problem:

Provider launcher discovery is underspecified for the new provider set. Antigravity has no locator contract. OpenCode launcher/server management is not coherently represented. Gemini CLI should be removed, but its replacement discovery and health behavior are absent. This blocks setup UI, Doctor, Settings provider onboarding, and local E2E validation.

Required repair:

- Add provider-owned concrete launcher metadata for Antigravity, Claude Code, Cursor if CLI route remains, OpenCode launcher/server attachment, and any other CLI-backed provider.
- Include binary names, install paths, version commands, auth/session probes, wrong-binary signatures, and GUI remediation copy.
- Stop relying on removed Rust/Iced `platform_specs.rs` as the only concrete source.

### F-007 - P1 blocker - Provider/model selection and capability APIs have competing contracts

gui_related: true

Evidence:

- `Plans/Models_System.md:37-40` says Models_System owns provider/model precedence.
- `Plans/Models_System.md:53-60` and `Plans/Models_System.md:1171-1181` define a scoped-owner-policy precedence chain.
- `Plans/Models_System.md:247-254` and `Plans/Models_System.md:821-831` preserve older precedence chains that omit scoped owner policy or order Persona differently.
- `Plans/Prompt_Pipeline.md:520` mirrors the scoped-owner-policy chain.
- `Plans/assistant-chat-design.md:194-195`, `Plans/assistant-chat-design.md:2272-2273`, and `Plans/assistant-chat-design.md:2286` use `platform_specs` and first-fallback behavior.
- `Plans/FinalGUISpec.md:24745-24765` binds settings lanes to configured providers/accounts/model profiles and blocks missing lanes.
- `Plans/Media_Generation_and_Capabilities.md:60-88` defines `capabilities.get` with `enabled`, `disabled_reason`, and `setup_hint`.
- `Plans/Media_Generation_and_Capabilities.md:5921-5927` later requires `enabled_on_instance`, `usable_now`, `caller_scope`, `execution_role`, and identity disclosure.

Problem:

Implementation can choose different effective provider/model/capability outcomes depending on which section it follows. GUI dropdown fallback, lane-bound settings, runtime resolver precedence, and capability gating disagree.

Required repair:

- Make `Models_System.md` the sole owner for resolver precedence and retire/update older same-doc tables.
- Make GUI consumers use configured provider/account/model profiles, not arbitrary platform fallback lists.
- Replace the old flat capability response with the later caller-scoped availability model everywhere.

### F-008 - P2 - Direct coding-plan provider coverage is not ready for first-class implementation

gui_related: true

Evidence:

- `Plans/Models_System.md:840-845` says verification does not block the core direct-provider architecture.
- `Plans/Contracts_V0.md:946` and `Plans/Contracts_V0.md:7034` warn that unverified Alibaba/MiniMax/Z.AI entries must not be promoted as first-class providers.
- `Plans/Models_System.md:918-923` lists provider IDs/env/base URLs, including `zai-coding-plan` and `zhipuai-coding-plan`.
- `Plans/usage-feature.md:359-361` and `Plans/usage-feature.md:605` define early quota/reset semantics.

Problem:

The docs preserve first-class direct-provider intent but do not yet define enough per-provider evidence for implementation. Provider IDs, env var names, base URLs, model catalogs, auth/quota behavior, usage windows, media support, and validation fixtures need owner-backed proof.

Required repair:

- For Alibaba/Qwen, MiniMax, Z.AI/GLM, Kimi/Moonshot, and any other coding-plan provider, define current provider IDs, base URLs, env vars, auth scheme, models, capabilities, quota/reset semantics, media support, and E2E prompt validation.
- Confirm whether OpenCode provider discovery is only a discovery aid or an implementation source for these providers.

### F-009 - P2 - Thinking effort selection is not consistently provider/model scoped

gui_related: true

Evidence:

- `Plans/Models_System.md:367-371` defines provider-specific `enable_thinking` and reasoning/effort controls.
- `Plans/Models_System.md:693` includes Gemini CLI `thinkingLevel`/`thinkingBudget`.
- `Plans/Models_System.md:1028-1050` shows GUI disclosure examples that disable reasoning effort on Cursor CLI.
- `Plans/Models_System.md:7428-7539` covers plans-to-code model settings while excluding Antigravity/Claude Code/Cursor/OpenCode CLI bridge settings in built Puppet Master.

Problem:

The active requirement says thinking effort level selection applies across all providers and models where supported. The Plans still carry provider-specific or Gemini CLI-centered thinking examples and disabled Cursor CLI examples, with no current provider/model capability matrix or fallback behavior.

Required repair:

- Define a normalized `thinking_effort`/reasoning control model with provider/model capability flags.
- Add provider-specific mappings only behind capability declarations.
- Include GUI behavior for supported, unsupported, defaulted, inherited, clamped, and provider-error states.

### F-010 - P2 - Usage/rate-limit provider surfaces have stale or incomplete currentness

gui_related: true

Evidence:

- `Plans/usage-feature.md:103` references an AGENTS usage-tracking source that no longer matches the live `AGENTS.md` scope.
- `Plans/usage-feature.md:268-277` covers Claude Code Admin API and stream-json usage but not the newer status-line `rate_limits` surface raised in provider-update research.
- `Plans/usage-feature.md:279-314` preserves Gemini Direct/CLI usage paths.
- `Plans/usage-feature.md:341-349` summarizes provider usage sources.
- `Plans/usage-feature.md:550-561` acknowledges missing API data, `N/A`, and polling/rate-limit concerns.
- `Plans/usage-feature.md:396` references `anomalyco/opencode` for OpenCode usage context.

Problem:

Usage display and rate-limit handling cannot be implemented reliably from the current docs. Some providers only have no-data states, some have stale Gemini CLI paths, some have potentially newer local/status sources, and polling behavior could itself consume quota or hit rate limits.

Required repair:

- Add per-provider usage-source contracts, freshness/confidence labels, refresh/backoff rules, quota-safe polling limits, missing-vs-zero fixtures, and active-plan proof requirements.
- Reconcile Claude Code rate-limit surfaces and OpenCode currentness before implementation.

### F-011 - P2 - Provider-native tool and permission boundaries are too permissive or ambiguous

gui_related: false

Evidence:

- `Plans/Tools.md:1093` and `Plans/Tools.md:1183` expose provider-native `ask` tools via allow flags.
- `Plans/Permissions_System.md:508` describes provider-native permission surfaces.
- `Plans/Commands_System.md:276` and `Plans/Commands_System.md:488` preserve command preview/shell-injection behavior.
- `Plans/agent-rules-context.md:22`, `Plans/Contracts_V0.md:1266`, `Plans/Permissions_System.md:596`, `Plans/Tools.md:1560`, `Plans/Tools.md:1036`, and `Plans/Permissions_System.md:7806` carry ambiguous API-key/auth wording.
- `Plans/Tools.md:983`, `Plans/Tools.md:1000`, and `Plans/Tools.md:1001` leave custom tool execution/sandboxing under-modeled.

Problem:

Provider integrations are not just routing. They also expose provider-native tools, shell-ish command behavior, custom tools, and auth material. Current language could allow provider-native capabilities before PM-level approval and may leave secret custody/storage ambiguous.

Required repair:

- Require PM permission mediation before provider-native ask/tool invocation.
- Prohibit raw secret persistence and route all secrets through approved secret custody.
- Define preview/execute separation for shell-like command expansion.
- Define MVP sandbox boundaries for custom tools.

### F-012 - P2 - Runtime artifact/provider-native artifact coverage and schemas are incomplete

gui_related: true

Evidence:

- `Plans/Runtime_Artifacts_Panel.md:244-253` covers Copilot provider-native artifacts but not equivalent provider-native artifacts for current providers.
- `Plans/Runtime_Artifacts_Panel.md:281-287` requires a runtime artifact envelope and per-type schemas.
- Local audit search did not find the expected runtime artifact schema files under top-level Plans.

Problem:

The artifact panel cannot show provider-native files, generated media, logs, tool outputs, or provider-specific receipts consistently if the schema set does not exist and coverage remains Copilot-only.

Required repair:

- Add provider-neutral runtime artifact envelope/schema files or explicitly locate their owner.
- Define provider-native artifact mappings for OpenCode, Cursor, Claude Code, Antigravity, Codex/OpenAI, Gemini Direct, and direct coding-plan providers as applicable.

### F-013 - P3 - Stubs, stale anchors, and compatibility-only language are still easy to implement accidentally

gui_related: true

Evidence:

- `Plans/Multi-Account.md:154` preserves Rust/Iced and `platform_specs.rs` language.
- `Plans/Provider_OpenCode.md:2362` still points to `platform_specs.rs` as SSOT.
- `Plans/BinaryLocator_Spec.md:27-29` correctly marks Rust+Slint and Iced legacy, but later sections still rely on legacy anchors.
- `Plans/Models_System.md:2847-2855` has a structural "Two Gemini providers" section with little usable content.
- `Plans/feature-list.md:25` and `Plans/feature-list.md:352` still include Gemini CLI in user-facing summaries.
- `Plans/newfeatures.md:16`, `Plans/newfeatures.md:221-233`, and `Plans/newfeatures.md:253` preserve Gemini Direct/Gemini CLI split language.

Problem:

The docs contain enough legacy names and compatibility text that an implementer could rebuild retired behavior. The old Rust/Iced/platform_specs anchors are especially risky because the repo explicitly says the old Rust/Iced app was removed and the intended direction is Rust + Slint.

Required repair:

- Convert stale anchors into explicit lineage-only notes or replace them with current owner-doc contracts.
- Remove user-facing Gemini CLI examples from active feature lists and setup flows.
- Add an explicit retired-provider glossary section if historical tokens must be preserved.

## Repair Order

1. Provider inventory and taxonomy: `Multi-Account.md`, `Models_System.md`, `Contracts_V0.md`, `00-plans-index.md`.
2. Retired/replacement providers: remove active Gemini CLI and add Antigravity concrete provider contract.
3. Cursor route decision: choose direct API/composer/ACP/CLI phased route and align GUI/setup/usage.
4. Media capability matrix: provider -> models -> media support, including current OpenAI image generation and non-OpenAI providers.
5. OpenCode currentness and E2E readiness: route/version fixtures, server API, stream semantics, model discovery, and prompt proof.
6. BinaryLocator/setup health: launcher metadata and Doctor probes for all CLI/server-backed providers.
7. Resolver/capability schema cleanup: effective provider/model/account profiles and caller-scoped capability states.
8. Provider usage/rate-limit and runtime artifact schemas.

## Validation Notes

- One parallel agent ran `python3 scripts/pm-shard-plans.py --check`: pass, `docs_checked=56`, `shards_checked=1008`.
- One parallel agent ran `python3 scripts/pm-plans-verify.py verify-spec-lock`: pass.
- One parallel agent ran `python3 scripts/pm-plans-verify.py validate-auto-decisions`: pass.
- One parallel agent ran `python3 scripts/pm-plans-verify.py run-gates`: fail only on stale generated evidence/plan-graph hashes for `Plans/ledgers/v2/ledger_registry.json`, which was already modified before this audit. This audit did not repair generated governance artifacts because governance seal was out of scope.

