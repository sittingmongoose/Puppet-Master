# Shard 011: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1383-L1555

Source SHA256: `fd152e499c916023ef442a6aee30f924f7bcdf0d00b063a7bc567f86b6b081ff`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical CLI-runtime provider requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### CBP-019 - Gemini CLI Retirement And Antigravity Replacement

```yaml
plan_unit_id: CBP-019
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Gemini CLI support is killed for active PM provider support because Gemini CLI is deprecated/being turned off and locally returned unsupported-client evidence. `gemini_cli`, `Gemini CLI`, and `GEMINI_CLI_HOME` remain compatibility/source-lineage tokens only. Antigravity CLI replaces Gemini CLI for the active Google-owned CLI-runtime lane, while Gemini Direct (`gemini`) remains an active direct API provider.
gui_related: false
gui_classification_reason: Provider transport retirement and compatibility-lineage disposition rather than visual presentation.
depends_on: []
unblocks: [MS-113, MA-062, F3-400]
acceptance_criteria:
  - Active PM provider support contains no Gemini CLI bridge route.
  - Gemini Direct API remains active and is not removed with Gemini CLI.
  - Antigravity CLI is modeled as the replacement CLI-runtime route.
  - Retired Gemini CLI tokens remain auditable as stale/source-lineage terms only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: stale_provider_resurrection
reasoning_tier: high
context_scope: cli_provider_retirement
implementation_surfaces: [Plans/CLI_Bridged_Providers.md, Plans/Models_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: gemini_cli_retirement, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0007
  - pldg-20260624-001-provider-updates:atom-0008
  - pldg-20260624-001-provider-updates:atom-0015
  - pldg-20260624-001-provider-updates:atom-0025
  - pldg-20260624-001-provider-updates:atom-0057
source_atom_ids: [atom-0005, atom-0006, atom-0007, atom-0008, atom-0013, atom-0014, atom-0015, atom-0024, atom-0025, atom-0057]
preserved_exact_tokens: ["Kill Gemini cli support", "It has to be replaced by antigravity", "No, kill Gemini completely", "Gemini direct provider via api is ok to keep", "Gemini Direct", "gemini", "Gemini CLI", "gemini_cli", "GEMINI_CLI_HOME", "UNSUPPORTED_CLIENT", "IneligibleTierError"]
compatibility_only_notes:
  - Gemini CLI names, env vars, and local unsupported-client evidence are retained only for migration/currentness lineage.
negative_constraints:
  - Do not alias `gemini_cli` to `antigravity_cli`.
  - Do not reuse `GEMINI_CLI_HOME` as the Antigravity account root.
  - Do not remove Gemini Direct API while removing Gemini CLI.
owner_hints: [Plans/CLI_Bridged_Providers.md, Plans/Multi-Account.md, Plans/Models_System.md, Plans/Contracts_V0.md]
```

### CBP-020 - Antigravity CLI Verified Runtime Surface

```yaml
plan_unit_id: CBP-020
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Antigravity CLI is an active CLI-runtime provider route with local `agy` verification. PM must model `agy` versioned command discovery, `agy models`, `--model`, `--print-timeout`, prompt-output proofs, multi-model support, plugin surface evidence, HOME/XDG state behavior, Google OAuth/system keyring or ADC setup paths, and route-specific output formats. Current proof covers markers such as `antigravity-default-ok`, `antigravity-model-ok`, `antigravity-claude-ok`, `antigravity-gemini35-ok`, and `antigravity-gemini31-ok`; the current `agy models` catalog exposes Gemini 3.5 Flash and Gemini 3.1 Pro variants plus non-Google models. PM must not claim unsupported JSON/stream formats or media-generation models without local output-level proof. A `--model "Nano Banana"` prompt is not proof because current Antigravity logs show the model name is unrecognized and falls back to `Gemini 3.5 Flash (Medium)`, matching behavior for arbitrary invalid labels.
gui_related: false
gui_classification_reason: CLI runtime command/protocol/auth contract rather than visual presentation.
depends_on: [CBP-019]
unblocks: [BS-026, MA-062, F3-400]
acceptance_criteria:
  - "`agy` binary discovery and command templates are version-gated."
  - Model listing and prompt execution are output-level verified before a row is green.
  - Antigravity is modeled as multi-model, not Gemini-only.
  - Gemini 3.5 Flash and Gemini 3.1 Pro Antigravity rows are verified by model-list presence plus prompt-output markers.
  - Nano Banana / Nanobanana is not green through Antigravity unless `agy models` lists a generated-media model and media artifact E2E proof succeeds.
  - Auth/account setup distinguishes Google OAuth, system keyring, ADC, and local profile roots without storing secrets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: antigravity_runtime_drift
reasoning_tier: high
context_scope: antigravity_cli_runtime
implementation_surfaces: [Plans/CLI_Bridged_Providers.md, Plans/BinaryLocator_Spec.md, Plans/Multi-Account.md, Plans/usage-feature.md]
node_compile_hint: {mode: antigravity_cli_runtime_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0009
  - pldg-20260624-001-provider-updates:atom-0010
  - pldg-20260624-001-provider-updates:atom-0011
  - pldg-20260624-001-provider-updates:atom-0019
  - pldg-20260624-001-provider-updates:atom-0088
  - pldg-20260624-001-provider-updates:atom-0141
source_atom_ids: [atom-0009, atom-0010, atom-0011, atom-0012, atom-0013, atom-0014, atom-0019, atom-0020, atom-0022, atom-0023, atom-0053, atom-0054, atom-0055, atom-0088, atom-0141]
preserved_exact_tokens: ["Antigravity CLI", "agy", "1.0.12", "agy models", "--print-timeout", "--model", "antigravity-default-ok", "antigravity-model-ok", "antigravity-claude-ok", "antigravity-gemini35-ok", "antigravity-gemini31-ok", "Gemini 3.5 Flash (Medium)", "Gemini 3.5 Flash (High)", "Gemini 3.5 Flash (Low)", "Gemini 3.1 Pro (Low)", "Gemini 3.1 Pro (High)", "Nano Banana", "model Nano Banana is not recognized as a known model or custom model in settings", "Claude Sonnet 4.6 (Thinking)", "GPT-OSS 120B (Medium)", "Google OAuth", "Use a Google Cloud project", "system keyring", "USE_ADC=1 agy", "Application Default Credentials (ADC)", "$HOME/.gemini/config", "$HOME/.gemini/antigravity-cli"]
negative_constraints:
  - Do not model Antigravity as Gemini-only.
  - Do not claim Antigravity JSON or streaming output until locally verified.
  - Do not mark Nano Banana, Nanobanana, Imagen, Veo, TTS, or other generated-media models green through Antigravity from an arbitrary successful `--model` prompt; require catalog presence and generated artifact proof.
  - Do not store authorization URLs, tokens, account identifiers, or API keys in Plans, ledgers, logs, or artifacts.
owner_hints: [Plans/CLI_Bridged_Providers.md, Plans/BinaryLocator_Spec.md, Plans/Multi-Account.md, Plans/Contracts_V0.md]
```

### CBP-021 - Claude Code And Cursor CLI Runtime Verification Boundaries

```yaml
plan_unit_id: CBP-021
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Claude Code and Cursor CLI-runtime routes require output-level prompt success, route-specific auth semantics, and protocol-correct automation. Claude Code uses first-party `claude.ai` session proof and print-mode probes rather than `claude doctor` as the noninteractive readiness gate; `--output-format=stream-json` requires `--verbose`. Cursor routes are split: `cursor-agent --print` browser-login/session or API-key execution, `agent acp` JSON-RPC stdio, native Cursor API/SDK/composer-api-style direct routes, and `opencode-cursor` as source-lineage/non-primary. ACP must not be invoked as `cursor-agent --print`.
gui_related: false
gui_classification_reason: CLI/protocol/runtime readiness requirements rather than visual presentation.
depends_on: [MS-113]
unblocks: [MA-062, F3-400, ACD-424]
acceptance_criteria:
  - Claude Code readiness uses prompt output markers and route-specific session/auth state.
  - Cursor ACP is treated as JSON-RPC stdio, separate from print-mode execution.
  - Native Cursor API-key/SDK route remains primary direct-provider planning support after live verification.
  - "`opencode-cursor` does not block native Cursor support."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: cli_protocol_misclassification
reasoning_tier: high
context_scope: claude_cursor_cli_boundaries
implementation_surfaces: [Plans/CLI_Bridged_Providers.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Models_System.md]
node_compile_hint: {mode: claude_cursor_cli_verification_boundaries, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0061
  - pldg-20260624-001-provider-updates:atom-0084
  - pldg-20260624-001-provider-updates:atom-0086
  - pldg-20260624-001-provider-updates:atom-0097
  - pldg-20260624-001-provider-updates:atom-0104
source_atom_ids: [atom-0061, atom-0064, atom-0065, atom-0071, atom-0072, atom-0073, atom-0075, atom-0076, atom-0077, atom-0078, atom-0079, atom-0080, atom-0082, atom-0084, atom-0085, atom-0086, atom-0087, atom-0089, atom-0090, atom-0097, atom-0100, atom-0102, atom-0104]
preserved_exact_tokens: ["claude-ok", "claude-stream-low-ok", "--output-format=stream-json requires --verbose", "claude doctor", "Raw mode is not supported on the current process.stdin", "cursor-agent", "agent acp", "cursor_login", "cursor-oauth-ok", "cursor-oauth-json-ok", "cursor-acp-ok", "apiKeySource: login", "composer-2.5-fast", "opencode-cursor", "14-model fallback catalog"]
negative_constraints:
  - Do not require Anthropic API-key proof for Claude Code first-party session support.
  - Do not use `claude doctor` as the noninteractive readiness gate.
  - Do not call `cursor-agent --print` ACP; ACP is JSON-RPC stdio.
  - Do not let `opencode-cursor` block native Cursor implementation.
owner_hints: [Plans/CLI_Bridged_Providers.md, Plans/Multi-Account.md, Plans/Models_System.md, Plans/Contracts_V0.md]
```

### CBP-022 - Direct Provider CLI Non-Bridge Boundary

```yaml
plan_unit_id: CBP-022
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  Codex/OpenAI, GitHub Copilot direct hosted API, OpenCode server, Kimi For Coding, MiniMax Coding Plan, and Z.AI/Zhipu coding-plan routes are not made active PM CLI-bridge requirements merely because local CLIs or OpenCode-routed probes exist. CLI probes may remain installation, optional-route, or source-lineage evidence, but direct-provider implementation readiness comes from the direct route's authenticated end-to-end prompt output and route contract.
gui_related: false
gui_classification_reason: Provider-transport boundary and evidence disposition rather than visual presentation.
depends_on: [MS-113]
unblocks: [CV-292, PO-048]
acceptance_criteria:
  - Codex and OpenCode are not required CLI bridges for core provider support.
  - GitHub Copilot direct hosted API readiness is not blocked by optional `copilot` or `gh copilot` CLI prompt behavior.
  - OpenCode-server-routed providers are not direct-provider closure evidence.
  - CLI probes are retained only as optional-route, install, or source-lineage evidence unless explicitly promoted.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: direct_provider_cli_bridge_drift
reasoning_tier: high
context_scope: direct_provider_cli_boundary
implementation_surfaces: [Plans/CLI_Bridged_Providers.md, Plans/Provider_OpenCode.md, Plans/Models_System.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: direct_provider_not_cli_bridge_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0059
  - pldg-20260624-001-provider-updates:atom-0060
  - pldg-20260624-001-provider-updates:atom-0091
  - pldg-20260624-001-provider-updates:atom-0129
source_atom_ids: [atom-0059, atom-0060, atom-0068, atom-0069, atom-0070, atom-0091, atom-0093, atom-0125, atom-0129, atom-0132]
preserved_exact_tokens: ["Codex and opencode are direct providers", "bridge their clis", "https://api.githubcopilot.com", "/models", "/chat/completions", "/v1/models", "/v1/chat/completions", "/images/generations", "gpt-4.1", "gpt-5-mini", "claude-sonnet-4.5", "gpt-5.2", "model_not_supported"]
negative_constraints:
  - Do not use OpenCode server or OpenCode-routed providers as direct-provider closure evidence.
  - Do not make stored Copilot CLI auth a blocker for GitHub Copilot direct hosted API support.
  - Do not prepend `/v1` to GitHub Copilot direct hosted routes.
owner_hints: [Plans/CLI_Bridged_Providers.md, Plans/Models_System.md, Plans/Provider_OpenCode.md, Plans/Contracts_V0.md]
```
