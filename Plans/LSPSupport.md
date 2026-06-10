# LSP Support -- Plan (Rewrite)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Plan -- **LSP is MVP**
**Scope:** LSP (Language Server Protocol) is **in scope for the desktop MVP**. Desktop client integration, server management, **full LSP integration in the Chat Window** (diagnostics in context, @ file/symbol with LSP, code blocks with hover/Go to definition), and **additional enhancements** (Find references, Rename symbol, Format document, optional LSP diagnostics gate, Chat "Fix all"/"Rename"/"Where is this used?", etc.) -- see §9.1.
**Cross-references:** Plans/FileManager.md (§6, §10), Plans/assistant-chat-design.md (§9), Plans/00-plans-index.md, Plans/FinalGUISpec.md (§7.20 Bottom Panel, §7.16 Chat, §8.1 StatusBar), Plans/feature-list.md (§4 Verification gates), OpenCode (anomalyco/opencode) LSP implementation. **LSP gate, evidence, subagent selection (implementation spec):** §17.
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`, `Plans/Tools.md`.

**ELI5/Expert copy alignment:** Authored tooltip/help text in this plan (for example setting hints and UI explanatory copy) must follow the dual-variant contract in `Plans/FinalGUISpec.md` §7.4.0. LSP server-returned hover/diagnostic payloads are dynamic external content and are outside authored dual-copy enforcement.

**Implementation plan summary (top-level guide for agents):** (1) **Prerequisites:** Rust LSP client crate (lsp-types + stdio client), config schema (OpenCode-aligned). (2) **Phase 1 -- Core LSP:** Server registry (§3.2 + slint-lsp), document sync (didOpen/didChange/didClose/didSave, debounce), diagnostics → editor + Problems panel (FinalGUISpec §7.20), hover, completion, status bar (§8.1). (3) **Phase 2 -- Editor:** Go to definition, code actions, code lens, signature help, inlay hints, semantic highlighting; then Find references (References panel, Shift+F12), Rename symbol (F2), Format document/selection (Shift+Alt+F); breadcrumbs/Go to symbol (documentSymbol); timeouts, per-server enable/disable, Settings > LSP (§7.4.2). (4) **Phase 3 -- Chat LSP (§5.1):** Diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code-block hover and click-to-definition; Problems link from Chat (§7.16). (5) **Phase 4 -- Optional (§9.1):** LSP diagnostics gate and LSP snapshot in evidence (optional; feature-list §4); subagent selection from LSP; Chat "Fix all"/Rename/"Where is this used?"/Format; promote lsp tool (Tools.md). **Single checklist:** Appendix: Implementation plan checklist (this document).

**For implementation guide:** The **Appendix: Implementation plan checklist** is the single ordered checklist for implementers (Prerequisites, Phase 1-4). §§13-16 and §12 provide GUI requirements, technical implementation detail, phased build order, and open decisions.

---

## 1. Purpose

LSP support will provide (all MVP):

- **Diagnostics:** Inline and gutter errors/warnings from language servers (replacing or augmenting the "placeholder for future linter/build errors" in FinalGUISpec).
- **Hover:** Rich hover information (types, docs) in the editor.
- **Autocomplete:** Code completion driven by the language server.
- **Navigation:** Accurate go-to-definition, find references, symbol outline (so breadcrumbs and "go to symbol" can use LSP when available instead of regex/heuristics).
- **Inlay hints:** Parameter names, type hints, etc. (`textDocument/inlayHint`).
- **Semantic highlighting:** `textDocument/semanticTokens` when supported; fall back to syntax-only.
- **Code actions:** Quick fixes, refactors (`textDocument/codeAction`); apply via `workspace/applyEdit` (integrate with FileSafe).
- **Code lens:** Inline actionable links above symbols (`textDocument/codeLens`).
- **Signature help:** Function signature and parameter hint in calls (`textDocument/signatureHelp`).
- **Request timeout and cancellation:** Configurable timeouts; LSP cancellation for in-flight requests when user navigates or edits.
- **LSP status in UI:** Status bar or indicator (e.g. "Rust (rust-analyzer)", "Initializing...", "Ready", "Error: ...").
- **Per-server enable/disable:** User can disable a server globally or per project (OpenCode-style `lsp.<id>.disabled` / `lsp: false`).
- **Fallback when LSP unavailable:** Heuristic symbol search and no diagnostics when no server available; optional one-time or dismissible hint to install the server.
- **Diagnostics for LLM/Assistant (OpenCode-style):** Feed current LSP diagnostics (errors/warnings) into Assistant/Interview context so the agent sees linter/type errors and can suggest fixes.

MVP LSP scope is `/cancellation-aware`, version-aware, and fallback-driven: live requests cancel or time out on navigation, edit, and version changes; fallback uses regex, `/grep/index`, and heuristic outline paths when a server is unavailable; formatting-adjacent actions such as format, rename, code actions, and apply-edit stay FileSafe/preview aware; chat code blocks and `@` symbol flows consume the same model.

### 1.1 Feature specification (inputs, outputs, behavior)

For each feature below: **inputs** (what the client sends or user does), **outputs** (what the user sees or context receives), **success/failure behavior**, **config keys** where applicable, **edge cases/failure modes** and required behavior, and **fallback when LSP unavailable**.

| Feature | Inputs | Outputs | Success | Failure / edge cases | Config keys | Fallback when LSP unavailable |
|--------|--------|---------|---------|----------------------|-------------|------------------------------|
| **Diagnostics** | Buffer URI, open/change/close; server sends `publishDiagnostics` | Underlines, gutter markers, Problems panel rows | Errors/warnings shown; click opens file at line | Timeout: show last known or empty; server crash → clear diagnostics, offer "Restart"; no server → no diagnostics | `lsp.<id>.disabled`, `lsp: false` | No diagnostics; optional install hint |
| **Hover** | (URI, position), optional timeout | Tooltip (markdown or plain) | Tooltip at cursor | Timeout → show "Timed out", discard; stale (version changed) → discard; no server → no tooltip | `lsp.hoverTimeoutMs` | No hover; syntax-only if any |
| **Autocomplete** | (URI, position, trigger), optional timeout | Inline completion list | List shows; select applies | Timeout → hide list, discard; stale → discard; no server → no LSP completions | `lsp.completionTimeoutMs` | Heuristic or no completion |
| **Navigation** (go-to-def, outline, breadcrumbs) | (URI, position) or document; server capability | Jump to location or symbol list | Correct location/list | Timeout → show "Timed out", discard; no result → show "No definition"; no server → heuristic/outline | `lsp.workspaceSymbolTimeoutMs` (for workspace/symbol) | Heuristic symbol search, regex outline (FileManager §10.1-§10.2) |
| **Inlay hints** | Document sync + visible range (optional) | Inline decorations (no buffer change) | Hints rendered | Timeout → skip or show cached; no server → no inlay hints | -- | No inlay hints |
| **Semantic highlighting** | Document sync; server supports semanticTokens | Token types for coloring | More accurate colors | Not supported → fall back to syntax-only; no server → syntax-only | -- | Syntax-only highlighting |
| **Code actions** | Range + diagnostics; user invokes | Context menu / lightbulb; apply edit | Edit applied via FileSafe | Timeout → hide actions; apply failure → show error, do not change buffer; no server → no code actions | -- | No code actions |
| **Code lens** | Document open/change | Inline links above symbols | Click invokes (e.g. run test) | Timeout → hide lens; no server → no code lens | -- | No code lens |
| **Signature help** | (URI, position) in call | Popup with signature + param highlight | Popup visible | Timeout → hide; stale → discard; no server → no signature help | -- | No signature help |
| **Request timeout/cancellation** | Per-request timeout; cancel on navigate/edit | -- | Stale work abandoned | Timeout → treat as failure for that request (show "Timed out" or discard) | `lsp.*TimeoutMs` (§14.4) | N/A (client-side) |
| **LSP status in UI** | Server state (Initializing/Ready/Error/None) | Status bar text or indicator | e.g. "Rust (rust-analyzer): Ready" | No server: show nothing (omit) | -- | Show nothing (omit) |
| **Per-server enable/disable** | Config: disabled flag | Server not spawned when disabled | LSP off for that server | -- | `lsp.<id>.disabled`, `lsp: false` | Same as "no server" for that language |
| **Diagnostics for LLM/Assistant** | Current diagnostics for relevant files | Text/summary in Assistant/Interview context | Agent sees errors/warnings | No server → omit diagnostics from context | -- | Omit from context; optional hint to install |

ContractRef: ContractName:Plans/LSPSupport.md
- Feature behavior and fallback: Plans/LSPSupport.md §1.1 (this table), §5 (Integration), §8 (mitigations)
- Chat LSP requirements: Plans/LSPSupport.md §5.1
- GUI surface: Plans/FinalGUISpec.md §7.16 (Chat), §7.20 (Problems), §7.4.2 (Settings > LSP), §8.1 (StatusBar)

This plan is the single place for LSP design and implementation notes. **LSP is MVP** -- implement with the desktop editor and Chat Window from the start (FileManager.md, assistant-chat-design.md).

For Debug Mode, LSP diagnostics may be part of the structured context when the user points PM at a debug target, e.g. a local app, dev server, website, or other runnable surface. The Assistant-facing flow supports a Cursor-like loop from hypothesis to target evidence to workspace fix, and may attach a session `/telemetry` snapshot when it helps the chat agent reason about PM's own run.

---

## 2. LSP Basics (Reference)

- **Protocol:** [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) (JSON-RPC 2.0). Current spec: 3.17.
- **Roles:** Our app is the **LSP client**; we talk to existing **language servers** (e.g. rust-analyzer, pyright, gopls) that we spawn or connect to.
- **Transport:** Typically stdio (spawn server process, stdin/stdout = JSON-RPC). Some setups use TCP/sockets.
- **Product boundary:** For MVP, PM is the LSP client and lifecycle owner, not a `language-analysis` engine and not a custom `language-server` for mainstream languages. Default servers such as rust-analyzer, pyright, gopls, clangd, and slint-lsp run as local stdio RPC processes by default; pylsp-style alternatives remain custom/manual unless cataloged. Remote workspaces use the same model with `/SSH` placement, host-aware path mapping, and `/worktree-aware` server-root resolution instead of a remote web service or hidden local mirror. Semantic `/symbols` and diagnostics come from negotiated server capabilities, not from PM inventing analyzer logic.
- **Document sync:** Client sends `textDocument/didOpen`, `textDocument/didChange`, `textDocument/didClose` (and optionally didSave). Server uses this to keep its view of the file in sync.
- **Key features we care about:**
  - **Diagnostics:** Server sends `textDocument/publishDiagnostics` (params: uri, diagnostics[]). Client renders in editor (underlines, gutter, problem list).
  - **Hover:** Client sends `textDocument/hover` (params: textDocument, position). Server returns contents for tooltip.
  - **Completion:** Client sends `textDocument/completion`. Server returns completion list (items, optional resolve).
  - **Go to definition / references / symbol outline:** Corresponding requests; server returns locations or symbol list.

Capabilities are negotiated at **initialize**: client and server declare what they support; we only use features both sides advertise.

---

## 3. How OpenCode Does It (Reference for Rewrite)


We are aligning with OpenCode-style architecture where useful; their LSP approach is a good reference.

**Official documentation:** [LSP Servers \| OpenCode](https://opencode.ai/docs/lsp/) -- canonical reference for built-in servers, config, and behavior.

### 3.1 Summary from opencode.ai/docs/lsp/

- **Stated purpose:** OpenCode integrates LSP so the **LLM can interact with the codebase**; it uses **diagnostics** to provide feedback to the LLM.
- **Built-in servers:** 30+ languages; see **§3.2** for the full table (server id, extensions, requirements). Each server is enabled when a file's extension matches and the requirement is met.
- **How it works:** When OpenCode opens a file, it (1) starts the appropriate LSP server if not already running, (2) checks the file extension against all enabled LSP servers. Servers are automatically enabled when an extension is detected and requirements are met.
- **Config:** `lsp` section in opencode config. Schema: `https://opencode.ai/config.json`. Per-server properties: `disabled` (boolean), `command` (string[]), `extensions` (string[]), `env` (object), `initialization` (object). Set `lsp: false` to disable all; set `OPENCODE_DISABLE_LSP_DOWNLOAD=true` to disable automatic LSP server downloads.
- **Custom servers:** Add entries with `command` (e.g. `["custom-lsp-server", "--stdio"]`) and `extensions`.
- **PHP Intelephense:** Premium features via license key; place key only in `%USERPROFILE%/intelephense/license.txt` (Windows) or `$HOME/intelephense/license.txt` (macOS/Linux).

### 3.2 Built-in LSP servers (full table)

We support the same set of built-in LSP servers as [OpenCode](https://opencode.ai/docs/lsp/) **plus slint-lsp** for Slint UI (`.slint`). When implementing the server registry, include all of the following so that Puppet Master can provide diagnostics and code intelligence for every listed language. Each row defines server id, file extensions, and requirements (command or dependency).

| LSP Server | Extensions | Requirements |
|------------|------------|--------------|
| astro | .astro | Auto-installs for Astro projects |
| bash | .sh, .bash, .zsh, .ksh | Auto-installs bash-language-server |
| clangd | .c, .cpp, .cc, .cxx, .c++, .h, .hpp, .hh, .hxx, .h++ | Auto-installs for C/C++ projects |
| csharp | .cs | .NET SDK installed |
| clojure-lsp | .clj, .cljs, .cljc, .edn | clojure-lsp command available |
| dart | .dart | dart command available |
| deno | .ts, .tsx, .js, .jsx, .mjs | deno command available (auto-detects deno.json/deno.jsonc) |
| elixir-ls | .ex, .exs | elixir command available |
| eslint | .ts, .tsx, .js, .jsx, .mjs, .cjs, .mts, .cts, .vue | eslint dependency in project |
| fsharp | .fs, .fsi, .fsx, .fsscript | .NET SDK installed |
| gleam | .gleam | gleam command available |
| gopls | .go | go command available |
| hls | .hs, .lhs | haskell-language-server-wrapper command available |
| jdtls | .java | Java SDK (version 21+) installed |
| julials | .jl | julia and LanguageServer.jl installed |
| kotlin-ls | .kt, .kts | Auto-installs for Kotlin projects |
| lua-ls | .lua | Auto-installs for Lua projects |
| nixd | .nix | nixd command available |
| ocaml-lsp | .ml, .mli | ocamllsp command available |
| oxlint | .ts, .tsx, .js, .jsx, .mjs, .cjs, .mts, .cts, .vue, .astro, .svelte | oxlint dependency in project |
| php intelephense | .php | Auto-installs for PHP projects |
| prisma | .prisma | prisma command available |
| pyright | .py, .pyi | pyright dependency installed |
| ruby-lsp (rubocop) | .rb, .rake, .gemspec, .ru | ruby and gem commands available |
| rust | .rs | rust-analyzer command available |
| slint-lsp | .slint | slint-lsp command available (cargo install slint-lsp or PATH; see §3.3.1) |
| sourcekit-lsp | .swift, .objc, .objcpp | swift installed (xcode on macOS) |
| svelte | .svelte | Auto-installs for Svelte projects |
| terraform | .tf, .tfvars | Auto-installs from GitHub releases |
| tinymist | .typ, .typc | Auto-installs from GitHub releases |
| typescript | .ts, .tsx, .js, .jsx, .mjs, .cjs, .mts, .cts | typescript dependency in project |
| vue | .vue | Auto-installs for Vue projects |
| yaml-ls | .yaml, .yml | Auto-installs Red Hat yaml-language-server |
| zls | .zig, .zon | zig command available |

Servers are enabled when a file's extension matches and the requirement is met. Root discovery and spawn logic per server (e.g. Cargo.toml for Rust, package.json for eslint/TypeScript) are in OpenCode's server.ts; we align with that. See §3.3 for reinforced ESLint (JS/TS), §3.3.1 for Slint LSP, §3.4 for implementation notes, §3.5 for the root discovery table, and §3.6 for extension conflict rules.

Broad catalog support includes common config/docs/container families such as GraphQL, Dockerfile / Docker config, TOML, YAML, and Markdown. The catalog must not under-call broad support: `/discovery/config` tracks server discovery/config support, while `/bundles/manages` records which entries PM actually bundles, auto-installs, downloads, or manages by default. The PM-managed/default first-class set is the out-of-box subset with mature cross-platform value: rust-analyzer; TypeScript/JavaScript through `typescript-language-server` when that server is selected; deno lsp for Deno roots; pyright; gopls; clangd; VS Code-equivalent JSON/HTML/CSS servers; YAML through yaml-language-server; Markdown through Marksman; Bash through bash-language-server; Dockerfile language server; TOML through Taplo; and slint-lsp. Broad support in the catalog does not mean every server is bundled or auto-download enabled: `/auto-install`, `/install`, `/download`, and auto-download behavior are governed per server by `/legal`, `/docs/container`, `/binary/toolchain`, toolchain-bound, and manual-provisioning constraints. Support target, shipping posture, and out-of-box default management are separate product decisions.

### 3.5 Root discovery (per-server rules)

Root discovery is host-aware and context-driven.

Rules:
- session reuse key is `(host_id, server_id, root_identity)`
- `root_identity` is resolved from the effective project/worktree/remote root selected for the current document and server rules
- project language detection and preset suggestion are advisory only; actual attachment resolves from file path, effective host context, server rules, and user overrides
- remote-mode projects use remote host roots and MUST NOT silently attach against a hidden local mirror

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Root-selection steps:
1. determine the effective host context for the file
2. resolve candidate roots from file path and server heuristics
3. apply explicit per-project or per-server overrides
4. compute `root_identity` and attach/reuse the matching session if one exists

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md

Language-specific root detection rules:

| Language | Root markers | Priority | Notes |
|---|---|---|---|
| JavaScript/TypeScript | package.json, tsconfig.json | package.json > tsconfig.json | Monorepo: each package.json is a root |
| Rust | Cargo.toml | — | Workspace: root Cargo.toml with [workspace] |
| Go | go.mod | — | Module root |
| Python | pyproject.toml, setup.py, setup.cfg | pyproject.toml > setup.py | venv detection separate |
| Java | pom.xml, build.gradle, build.gradle.kts | — | Multi-module: parent pom |
| C/C++ | CMakeLists.txt, Makefile, compile_commands.json | CMakeLists.txt > Makefile | |
| C# | *.sln, *.csproj | .sln > .csproj | Solution is workspace root |
| Ruby | Gemfile | — | |
| PHP | composer.json | — | |
| Swift | Package.swift, *.xcodeproj | Package.swift > xcodeproj | |

Fallback rule:
- if no language-specific marker is found, use the nearest `.git` directory as the root

### 3.6 Extension conflicts (multiple servers per extension)


Multiple servers may overlap for one language or file kind; overlap is resolved through explicit selection metadata rather than one-off hard-coded exceptions.

Required metadata fields per effective catalog entry:
- `selection_mode`
- `selection_family`
- `primary_priority`
- `context_markers`
- `supplementary_families`
- `capability_profile`
- `degraded_attach_rules`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

Rules:
- one primary server may own a capability family when exclusivity is required
- supplementary servers may coexist only when their capability families are declared compatible
- effective overlap resolution must remain user-visible in Settings > LSP and status surfaces
- remote/degraded attach rules must be explicit; the client must not fabricate healthy capability state when a server is disabled, unavailable, or partially attached

### 3.6.1 Effective server selection metadata
- Each effective `ServerSpec` records `language/extensions/selectors`, `/extensions/selectors`, `/files/conditions`, required markers/files/conditions, `context_exclude`, command `/env/init` options, `root-discovery` mode, optional platform restrictions, `/version` and `position-encoding` metadata, install `/provisioning` hints, and lifecycle status values for `/misconfigured/installing/error`.
- Selection metadata uses the closed `selection_mode` vocabulary `standalone_primary`, `contextual_primary`, `supplementary_diagnostics`, and `standalone_diagnostics`. User-facing copy may hyphenate the primary modes as `standalone-primary` and `contextual-primary`, and may describe `standalone_diagnostics` as `/diagnostics-only`, but persisted registry values use the underscore spellings.
- `capability_profile` declares whether a server provides `/full` `full_language` support, `diagnostics_actions`, diagnostics-only support, or other partial capability families. `may_attach_without_primary` states whether a supplementary diagnostics server may attach when no full primary exists.
- `supplementary_for_families` lists the primary families a supplementary server may attach beside; supplementary attach is denied if the active primary family is absent from that list.
- The generalized selection algorithm gathers enabled and available catalog entries whose selectors match the file, platform, and context; resolves root/context for each candidate; partitions candidates into full primary candidates and supplementary/diagnostics candidates; chooses one effective primary by filetype/framework specificity, satisfied `contextual_primary`, `primary_priority`, then stable `server_id`; then attaches only compatible supplementary servers.
- JavaScript-family overlaps generalize through `/typescript/eslint/oxlint-style` rules rather than one-off Deno/TypeScript/ESLint exceptions. Diagnostics merge only from compatible servers, and code actions from multiple servers are surfaced with source attribution so one server cannot silently override another.
- Selection examples are canonical rather than illustrative placeholders: `selection_mode = standalone_primary` plus `selection_family = ts-js` for generic TypeScript, `selection_mode = contextual_primary` with `context_require = [deno.json, deno.jsonc]` for Deno, `selection_mode = supplementary_diagnostics` with `supplementary_for_families = [ts-js, vue, svelte, astro]` and `may_attach_without_primary = true` for ESLint/Oxlint-style diagnostics, and family-specific `/composite-file` primaries for Vue, Svelte, and Astro. The `/specificity` rule is native filetype/framework first, then contextual markers, then `primary_priority`, then stable `server_id`; `/family` keys such as `/svelte/astro`, `vue`, `svelte`, `astro`, and `ts-js` remain named overlap families rather than one-off exceptions.
- Diagnostics integration is source-preserving; `diagnostics-integration` is the merge/presentation contract, not a storage-flattening rule. Store diagnostics per `(server_id, session/root, uri)` or its normalized `(session, uri)` equivalent; merge only in presentation surfaces such as Problems, editor markers, and Assistant/Interview context. A diagnostics-first sidecar may expose `/actions/status` for its own diagnostics, but a `supplementary_diagnostics` or `standalone_diagnostics` attachment must not imply full `/completion/navigation`, hover, or semantic capability. `/cap/truncation` belongs to the presentation merge/reporting layer and must not erase per-server source identity.
- `LspHost`, `LspSession`, and `DocumentStore` are first-class implementation concepts: the host owns local/remote placement and `/backoff/eviction`, the session owns lifecycle and restart behavior, and the document store owns URI normalization, pending-sync state, stale-result checks, and authoritative text versions.
- PM owns a client-pattern LSP orchestration layer rather than analyzer implementations. The live architecture names `LspHost`, `LspSupervisor`, `LspSession`, `LspSessionRegistry`, `LspRegistry`, `WorkspaceResolver`, `DocumentStore`, `DocumentSyncEngine`, `LspRequestBroker`, `CapabilityRegistry`, `DiagnosticsStore`, `LanguageIntelligenceFacade`, and `LspTraceService`; `/VS` or other upstream client examples are inputs only, while the GUI calls the `/intelligence` facade rather than JSON-RPC plumbing. `LspHost` also owns `/SSH` placement and `/path-mapping`, with all LSP/process I/O off the UI thread and delivered through an event-loop-safe handoff.
- Protocol guardrails are conservative by default: initialize -> initialized -> normal traffic -> shutdown -> exit is the strict lifecycle, dynamic registration stays disabled until PM can handle `/unregister`, and over-advertising unsupported snippets, resolve support, progress, `/code-action/workspace`, or workspaceFolders behavior is forbidden. Restart after `/crash` replays open documents, diagnostics are replacement-per-server plus URI rather than append-only, and rename, `/format/code-action`, and workspace edits always route through FileSafe.
- OpenCode-style registry findings are retained as implementation input without copying weak behavior. PM keeps built-in and custom server definitions, local stdio transport, lazy spawn, per-server root discovery, and diagnostics into Assistant context, while avoiding `/full-buffer-or-disk-resync`, uncontrolled auto-downloads, server-specific fragility, session/process duplication, weak status visibility, and unbounded `/backoff/eviction`. `LspSession` reuse is keyed by `(server_id, discovered_root)` only as a compatibility reading; the canonical supervised key remains host-aware and root-aware. DocumentStore remains editor-authoritative, tracks buffer-version and position-mapping state, and uses per-discovered-root compatibility only as input to the canonical root_identity.
- Native `/client-architecture` is PM-owned. There is no Microsoft-blessed Rust equivalent of `vscode-languageclient` to wrap the desktop-client; official/community inventory is input, not a design owner. The baseline Rust stack is `lsp-types`, `tokio`, `serde_json`, `tokio-util`, `tokio-util::sync::CancellationToken`, `CancellationToken`, and `tracing`, with `async-lsp` permitted only as an internal `/wire` helper if it fits PM's supervisor/session model. `tower-lsp` and `lsp-server` are server-oriented and rejected as GUI-side client foundations.
- Internal-tool LSP boundaries are explicit: `LSPSupport.md` owns LSP `/tooling` behavior for plan-mode and `/interview` context, but `internal-tool` event records use `run_id`, `tool.invoked`, and `mutation_capable: bool`; mixed `lsp` actions remain under-owned until UI-session reads and mutation_capable apply-edit paths are separated.
- Tool subsystem enforcement distinguishes formatter-vs-LSP ownership, DAE non-triggering host writes, and overlapping formatter detectors. `Formatters_System.md`, `Plugins_System`, `Plugins_System.md`, `Formatters_System`, `tool.*` telemetry, plugin tool IDs, TOML namespaces, name-based policy keys, post-permission mutation, run-scoped records, `/workspace-tab` routing, multi-project routing, mutation-capable modes, and apply-edit paths must not bypass one another.
- Model-wave LSP seam evidence from GPT sweeps across `Plans/**` reinforces high-risk node-graph execution seams while retiring tier-centric ownership in LSP-facing contracts.
- Resolver priority inputs are ordered: hard requirements from plan/tier/surface contracts, actor-type bias, operation-type bias, scope-level bias, language/framework/domain hints, `/framework/domain` hints, project default tendencies, and final fallback.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### 3.3 ESLint and ECMAScript/JavaScript (reinforced)

**ESLint** is the primary lint and diagnostics LSP for **ECMAScript/JavaScript** (and commonly used with TypeScript, Vue, etc.) when users build programs with Puppet Master. We explicitly support and reinforce ESLint so that JS/TS projects get first-class linting and quick fixes in the editor and in Assistant/Interview context.

- **Upstream:** [eslint/eslint](https://github.com/eslint/eslint). **ESLint v10** (v10.0.0 / v10.0.1) is the current major line; it uses **flat config only** (`.eslintrc` removed). Config file: `eslint.config.js` or `eslint.config.mjs` / `eslint.config.ts`; lookup starts from the file's directory (monorepo-friendly). Node.js: ^20.19.0, ^22.13.0, or >=24.
- **LSP:** OpenCode's built-in **eslint** server uses the project's `eslint` dependency and runs the VS Code ESLint server (or equivalent) over stdio. Extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue`. Requirement: `eslint` dependency in project.
- **For our implementation:** When adding LSP, include **eslint** in the server registry for JS/TS projects. Root discovery: nearest directory containing `package.json` (or `eslint.config.js` / `eslint.config.mjs` / `eslint.config.ts` for v10). Prefer ESLint v10 flat config when present (`eslint.config.*`); do not rely on legacy `.eslintrc*`. Diagnostics from ESLint feed the Problems panel and LLM/Assistant context (§1, §5).
- **Preset alignment:** The JavaScript/TypeScript preset (FileManager §11) should list ESLint as an expected tool and, when LSP is added, enable the eslint LSP server for that preset. See FileManager.md §11 and preset detection (e.g. `package.json` + `eslint` dep or `eslint.config.*`).

### 3.3.1 Slint LSP (slint-lsp)

Our GUI is **Rust + Slint** (FinalGUISpec); we include **slint-lsp** so that editing `.slint` files in the in-app editor gets diagnostics, completion, goto definition, and live-preview support.

- **Crate:** [slint-lsp](https://crates.io/crates/slint-lsp) (latest stable 1.15.1). LSP implementation for [Slint](https://slint.dev). Binary: `slint-lsp` (or `slint-lsp.exe` on Windows). Communicates via **stdio** (stdin/stdout); no special command-line arguments -- editors spawn the binary and use LSP over stdio.
- **Features:** Diagnostics, code completion, goto definition, **live-preview**. Code formatting is part of the LSP (see [Slint tooling docs](https://snapshots.slint.dev/master/docs/guide/tooling/manual-setup/#slint-lsp)).
- **Install:** `cargo install slint-lsp`, or use pre-built binaries from [Slint GitHub releases](https://github.com/slint-ui/slint/releases). Requirement: `slint-lsp` command available on PATH.
- **Extensions:** `.slint` (Slint UI markup).
- **Root discovery:** For `.slint` files, root can be the file's directory or nearest project root (e.g. directory containing `Cargo.toml` if Slint is used in a Rust project). Many .slint files work with workspace root or file directory.
- **For our implementation:** Include **slint-lsp** in the server registry with id `slint-lsp`, extensions `[".slint"]`, and spawn `slint-lsp` (no args). When the user opens a `.slint` file in the File Editor, the LSP client starts slint-lsp for that root and provides diagnostics, hover, completion, and goto definition in the editor; live-preview can be wired separately if the LSP supports it. Settings > LSP: slint-lsp appears in the built-in list and can be toggled or configured (env, initialization) like other servers.

### 3.4 Implementation (server.ts)

- **Code:** `packages/opencode/src/lsp/server.ts` -- server registry, root discovery, spawn logic for each built-in (including **eslint** for JS/TS).
- **Server model:** One LSP server **process** per **`(host_id, server_id, root_identity)`**. Root discovery still begins from the file context and server heuristics (e.g. "nearest directory containing Cargo.toml" for Rust), but the supervised session key is host-aware.
- **Info shape:** `id`, `extensions[]`, `root(file, host_context) -> root identity`, `spawn(session_key) -> Handle | undefined`. **Handle:** `process` (child process) + optional `initialization` (options sent in LSP `initialize`).
- **Root discovery:** **NearestRoot(includePatterns, excludePatterns)** -- walk up from the file's directory until a target file is found. Exclude patterns avoid wrong server (e.g. Deno vs Node). Some servers use a fixed root (e.g. instance directory).
- **Lifecycle:** On file open, extension is matched to enabled servers; if a server is needed and not yet running for that host/root identity, it is **spawned** (stdio). Initialize handshake and optional `initializationOptions` complete the setup.

**Takeaways for us:**

- Registry of servers by (id, extensions, root-finder, spawn).
- Lazy spawn per `(host_id, server_id, root_identity)`; one process per effective host/root identity.
- Config to disable, override command, set env and initialization options (align with OpenCode's `lsp` schema).
- Optional auto-install (we can defer or limit; e.g. rust-analyzer from PATH, pyright/gopls optional install).

---

## 4. Rust Stack (Client Side)

Our rewrite is Rust/Slint (1.15.1). We only need an **LSP client** in the app.

- **Protocol types:** [lsp-types](https://docs.rs/lsp-types/) -- LSP 3.x types (requests, notifications, capabilities, DocumentUri, Range, Diagnostic, etc.). Use for all LSP data structures.
- **Client implementation:** One of:
  - [lsp-client](https://docs.rs/lsp-client/) -- async, uses jsonrpsee + lsp-types.
  - [async_lsp_client](https://docs.rs/async_lsp_client/) -- async, lifecycle (initialize, shutdown, exit), document sync, hover, completion, goto definition.
  - [lsp-client-rs](https://github.com/sudarshan-reddy/lsp-client-rs) -- TCP/Unix socket + async; used with gopls in examples.
- **Server implementation (optional):** If we ever implement our own LSP server (e.g. for a custom language), [tower-lsp](https://docs.rs/tower-lsp/) / [tower-lsp-server](https://lib.rs/crates/tower-lsp-server) (community fork, active).

Recommendation: use **lsp-types** plus one async LSP **client** crate that supports stdio (spawn process, stdin/stdout). Evaluate `lsp-client` and `async_lsp_client` for lifecycle, document sync, and the few methods we need (diagnostics, hover, completion, goto definition).

---

## 5. Integration with Our Editor (FileManager / Rewrite)

The editor integrates with LSP through a shared authoritative document store and a host-aware session supervisor.

Rules:
- the shared document store is the sole authority for open-document text
- LSP document sync, hover, definition, references, completion, signature help, diagnostics, code actions, rename, and format all operate against that authoritative document state
- feature requests are gated behind sync barriers so stale document versions do not leak into the UI
- workspace edits from rename/format/code action flow through the same FileSafe-backed mutation path as other file edits
- LSP never becomes the owner of Search, diff/review, or chat restore semantics

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md

UI integration rules:
- breadcrumbs, outline, go-to-symbol, hover, references, and code actions are editor/LSP-owned affordances
- diagnostics feed editor markers and Problems, but Problems remains the owner of aggregated problem presentation
- when LSP is unavailable, fallback navigation/index behavior is explicit and MUST NOT masquerade as healthy LSP state
- remote-mode files reuse the same architecture with remote host identity; they are not a second LSP subsystem
- The PM-owned orchestration layer must `/discover` an effective server, `/restart/disable` sessions, bind project `/worktree/root`, sync open `/change/save` document events, and route diagnostics, `/symbols`, and `/navigation/results` into GUI and AI context without turning LSP into a separate AI surface.

Fallback, index, and cross-reference rules:
- Retrieval, `/search/autodetect`, `/search/chat`, and framework/project auto-detection treat project-detection output, code-index freshness/availability, and LSP session health/availability as separate inputs. A detected-language badge is a hint, not exact attached-server truth.
- The code index remains a SEPARATE `/state-owning` subsystem from LSP: it is per-project, `/indexer` backed, watcher-driven, and useful for large-workspace navigation even when LSP is disabled, unavailable, or degraded; per-file LSP sessions attach through the editor document lifecycle and feed editing, diagnostics, semantic navigation, and code-action context. Index feeds search; LSP feeds editing.
- When LSP is unavailable, Puppet Master falls back to code index/text search, `/regex` or heuristic outline where available, and optional `/download` or install hints. The fallback path must not claim diagnostics, semantic features, or healthy attached-server state.
- Stale references to `FileManager.md §12.1.4`, `§12.1.4`, `§12.2.7`, `§12.4`, `§12.5`, `§12.6`, `§11`, `TOC`, and `Projects (§7.3)` / `§7.3` are legacy cross-reference residue. `FinalGUISpec` and FileManager consumers must route to the current FileManager §10 navigation/fallback contract or this LSPSupport section rather than keeping anchors that do not exist.
- The semantic requirements formerly named `§12.1.4 Symbol search without LSP` and `§12.2.7 Symbol index staleness` are retained here as live obligations: fallback symbol search supports regex / heuristic outline and optional indexed-symbol paths; stale index labels, rebuild expectations, and remote degraded/unavailable interactions must be visible in the command palette, Go to symbol, Problems, Search, and chat consumers.
- The LSP indexing/autodetect seam is research-locked around distinct GUI state layers. PM must keep `detected_languages` / project badges, selected preset, requested LSP enablement and server overrides, effective attached LSP sessions, and code index freshness/health separate in product language and state; a detected-language badge is advisory/project-scoped and must not collapse into "LSP ready." Later re-detection happens on project add/open and later project-signal changes, but actual attach remains `/path/root/context-driven`, based on extension, requirement/availability, root discovery, and primary/supplementary conflict resolution. `/cross-reference` consumers must distinguish `/opening` detection from later refresh, optional tool-download guidance, and `/retrieval/index` freshness.
- The FileManager editor-surface map is explicit for LSP consumers: `§10.1 Breadcrumbs / outline` owns the breadcrumb strip and outline, with LSP using `documentSymbol` and fallback using heuristic / regex outline; `§10.2 Go to symbol` owns command-palette and quick-open symbols, with LSP using `documentSymbol` and `workspace/symbol`, while the legacy `§12.1.4` name survives only as a compatibility pointer to this fallback rule. `§10.10 LSP support (MVP)` is the editor-side owner for diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, definition/references, `/rename/applyEdit`, format, `document/workspace symbols`, editor/chat adjacency, and the finer `§10.10.5`, `§10.10.6`, `§10.10.7`, and `§10.10.8` responsibility split. FileManager remains the visible editor owner; LSPSupport owns the LSP protocol/client constraints.
- Search remains text-first. The Search side panel consumes content-search / project code-search output with stable path, `/range/snippet`, and snippet identity, then routes open and `/highlight` through the same shell/editor path as chat, `/file-manager/LSP`, and LSP navigation opens. LSP symbol mode stays in Go to symbol, breadcrumbs, and semantic navigation; the Search panel must not become a second default symbol browser.
- Status-bar /search-language copy in `Plans/LSPSupport.md` (`/LSPSupport.md`) keeps symbol search and regex grep non-conflicting: LSP may report server health, symbol navigation, and fallback state, while `grep` and Search regex acceleration remain text-search vocabulary and must not be labeled as LSP symbol health.
- LSP command routing is route-aware and `/navigation-aware`: a flat `element -> command -> handler` contract is insufficient once diagnostics, symbols, references, code actions, and chat links open through route-target, navigation, and editor owners.
- Storage and runtime consumers must not lag the execution-core rewrite: `storage-plan` and `storage-plan.md` record families consumed by LSP evidence, diagnostics, and apply-edit flows use current execution identity rather than stale route-only or tier-only records.
- Orchestrator consumers of LSP data use `Orchestrator_Page`, `Orchestrator_Page.md`, `/event`, `Seams`, and `/package/seam/lane-native` execution objects; `Tiers` and tier-keyed widgets or event rows are compatibility inputs only.
- rewrite-alignment references are routing inputs, not new LSP owners: `Decision_Log`, `Decision_Log.md`, `rewrite-tie-in-memo`, `rewrite-tie-in-memo.md`, `/packages/lanes/overseers`, `feature-list`, `feature-list.md`, `newfeatures.md`, projection-trust, `/effective`, promoted-feature, and tier-era wording must not misroute LSP or implementation readers.
- Widget layout compatibility is narrow: keep `widget_layout:v1:dashboard`, `widget_layout:v1:usage`, and `widget_layout:v1:orchestrator:progress`; deprecate or remove `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, and `widget_layout:v1:orchestrator:ledger` when LSP-facing Orchestrator surfaces project progress or diagnostics.
- Event/addendum supersession is explicit: `/addendum` records cannot require implementers to diff multiple addenda to know the final field set for LSP event, diagnostic, evidence, or apply-edit flows.
- External audit convergence did not invalidate the LSP direction; it reinforces collapsing overlapping canon and fixing exact broken references, payloads, and command contracts before implementation.
- cross-doc LSP consumers must not inherit stale Orchestrator UI ownership: `Widget_System`, `Widget_System.md`, `Run_Graph_View`, `Run_Graph_View.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` references to `Tiers` or `/task/subtask` trees are compatibility inputs only; LSP-facing UI and diagnostics route through native `/specialized` tab surfaces and must carry `/corroboration/promotion/patch` lineage instead of under-specifies concern, corroboration, promotion, or patch provenance.
- GUI and `FinalGUISpec.md` consumers of LSP status or Problems data must treat seam, package, and `/package/node` surfaces as first-class rewrite-era owners. Dashboard, Appendix C, and any 12-widget rewrite-era Progress set wording may remain source-lineage for `/task/subtask` and `Tiers`, but it cannot define the concrete LSP presentation home.
- Runtime artifact and code-open consumers keep identity and location separate. `Runtime_Artifacts_Panel` / `Runtime_Artifacts_Panel.md` compatibility `task_id` vocabulary must resolve to `node_id`, package, seam, lane, and attempt identity before LSP evidence or diagnostics are attached; file/code open uses `OpenFile { path, line, range }` for concrete workspace `/code` locations, while route/open identity stays with the owning route contract.
- Rewrite owner routing remains traceable before LSP consumers cite it: `Decision_Log`, `Decision_Log.md`, `Crosswalk.md`, and `/Crosswalk` provide the owner-traceability path for high-impact rewrite decisions, while LSPSupport records only how those decisions constrain language-intelligence consumers.
- Runtime identity for LSP-facing execution context keys from node, `/packages/lanes`, package, seam, lane, and higher-level `/runtime` identity rather than active-tier heuristics. `/model/account`, execution-role, and operational-identity disclosure stay visible in diagnostics, Assistant context, and evidence joins when those joins affect attribution.
- Project `/status` labels exposed beside LSP availability must not stay setup-centric. Project health/status, code-index state, LSP attach state, and runtime capability state remain separate so install/setup readiness does not masquerade as current project health or semantic intelligence.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

### 5.1 Chat LSP

Chat LSP provides language intelligence features within the chat and assistant context.

Purpose:
- provide language intelligence features within the chat and assistant context
- let the assistant surface code understanding without requiring the user to leave the chat flow

Capabilities:
- code completion suggestions in chat input
- symbol resolution in code blocks
- hover info for code references in messages
- go-to-definition from chat code blocks

Activation:
- Chat LSP activates when a chat thread has an associated project with LSP servers running
- chat messages containing code blocks are analyzed by the appropriate LSP server based on language detection

Limitations:
- Chat LSP provides read-only intelligence only; no refactoring and no code actions are exposed through this surface
- it uses the same LSP server instances as the editor rather than spawning a separate chat-only server pool

Integration:
- code blocks that map to project files use those real file URIs; other code blocks use the virtual-document contract in §14.8
- when the relevant server is unavailable or degraded, chat surfaces must disclose that reduced state explicitly
- GUI `/placement` stays explicit: `/Problems` is the canonical multi-file diagnostics panel, the status-bar indicator owns current session/runtime health, and chat is a context/navigation consumer. Chat may show diagnostics summaries, `@ symbol` results, code-block hover, `/definition` and `/go-to-definition` affordances, and a Problems footer link, but `/conflicts`, `/empty/error`, `/remote/status/chat`, and degraded states resolve back to editor, Problems, status-bar, or SSH reconnect destinations rather than creating another diagnostics owner.

Diagnostic-to-chat pipeline behavior is a context-packaging contract, not a second diagnostics owner. The `to-chat` payload uses the same diagnostic entry shape as §17.2 (`path`, `line`, `character`, `severity`, `message`, `source`, optional `code`) plus refs to the originating LSP session and URI; severity mapping preserves `Error`, `Warning`, `Info`, and `Hint` labels when chat summarizes or filters diagnostics. Chat LSP remains read-only for MVP; when a separate later-phase chat workflow surfaces a quick fix, code action, rename, or workspace edit from this diagnostic context, it opens explicit preview/confirmation and applies only through FileSafe-backed `workspace/applyEdit`, preserving the code action approval flow rather than mutating directly from the message.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

## 6. Scope and Phasing

- **In scope for LSP MVP (this plan):** All features in §1, §5, and **§5.1 (LSP in the Chat Window)**, including: diagnostics, hover, completion, navigation (definition, references, symbol outline), inlay hints, semantic highlighting, code actions, code lens, signature help, request timeout/cancellation, LSP status in UI, per-server enable/disable, fallback when LSP unavailable (heuristic + optional install hint), **diagnostics in Assistant/Interview context**, **@ symbol with LSP workspace/symbol**, **code blocks in chat with hover and go-to-definition**, **Problems link from Chat**, and optional **inline diagnostics hint for @'d files**. Design and research for client-only integration: protocol usage, OpenCode-style server registry and lifecycle, Rust crates, and how it plugs into the File Manager and Chat.
- **Out of scope here:** Full editor implementation details (tabs, buffers, presets) -- those stay in FileManager.md; this doc only covers LSP-specific bits.
- **Phasing:** **LSP is MVP** -- implement with the desktop editor and Chat from the start. Use LSP when available; fallback to text-based/heuristic navigation and optional project index (FileManager §10.2) when LSP is disabled or unavailable.

---

## 7. Resolved design decisions and implementation constraints

### 7.1 Registration-before-spawn invariant

An LSP server MUST be registered in the session map (keyed by `(host_id, server_id, root_identity)`) before its process is spawned. Spawning before registration creates a window where the process exists but cannot be found, tracked, or shut down.

Any asynchronous LSP startup goroutine or background initialization task is lifecycle-tracked BEFORE spawn: it must register a cancellable `lifecycle-tracker` handle before subprocess creation or watcher launch, and failed handshakes must either mark the existing record `failed` or tear the handle down.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

Required sequence:
1. Acquire the session-map write lock.
2. Insert the session record with status `starting`.
3. Release the write lock.
4. Spawn the subprocess.
5. Transition the record to `ready` or `failed` after handshake completion.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

If spawn fails after registration, the session record is cleaned up or marked `failed` so the slot does not remain permanently occupied.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

## 8. Potential issues and mitigations

Each mitigation is **actionable**: who does what, and when.

| Issue | Mitigation (who, what, when) |
|-------|------------------------------|
| **Server crash or exit** | **Client (LSP layer):** On process exit or broken pipe (e.g. when writing to stdin fails), (1) mark that server's state as Error, (2) clear all diagnostics for documents owned by that server (DiagnosticsCache), (3) notify UI to refresh Problems panel and gutter. **UI:** Show "Error" in status bar for that server; offer "Restart language server" button (or auto-restart with exponential backoff, e.g. 1s, 2s, 4s, cap 30s). **Logging:** Log exit code and stderr tail for debugging. |
| **Server slow or unresponsive** | **Client:** Apply request timeouts (§14.4); on timeout, discard response and show "Timed out". Send LSP cancel on user navigate/edit. **UI:** While a request is in flight and no response yet, show "Waiting for language server..." in status bar; never block UI thread on LSP. **Optional (client):** After N timeouts for a server in a session, throttle or disable heavy features (e.g. workspace symbol) for that server until next restart. |
| **Many open documents** | **Client:** Limit documents pushed to each server (e.g. only currently open tabs, or N most recent per root). **Editor/FileManager:** When a buffer is evicted (FileManager §12.2.1), **client** sends `didClose` for that URI so the server can free memory. **Config:** Optional cap (e.g. max 50 open docs per server) in Settings. |
| **Large workspace at init** | **Client:** At initialize, send only roots that have at least one open document, capped at 10 (§7, §14.6). **When:** During `initialize` request; do not send thousands of paths. |
| **didChange flood** | **Client:** Debounce `didChange` (default 100 ms after last edit; §7, §14.4). When server supports incremental sync, send only `contentChanges`; otherwise full content. **When:** On every buffer edit, start/reset debounce timer; on timer fire, send one `didChange`. |
| **Symbol index staleness (without LSP)** | **FileManager:** fallback symbol navigation lives in §10.2. **When LSP present:** Diagnostics and symbols come from server. **When LSP disabled or unavailable:** Keep regex/heuristic symbol path (FileManager §10.2); optional install hint. **Client:** No action for index; fallback is editor/FileManager responsibility. |
| **TCP-only servers (e.g. Godot)** | **User:** Configures a **command** (e.g. `npx godot-lsp-stdio-bridge`) that speaks stdio to the app and TCP to the real server. **Client:** Spawn that command as the LSP server process; no change to client transport (stdio only). **Docs:** Document bridge pattern in user-facing docs; see §10. |

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

---

## 9. MVP LSP features (summary)

This section defines the canonical contract for this surface.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope. The canonical tool surface is nine read-only operations plus one write/approval-gated `rename`; the packetization label `10 read-only + 1 write-gated (lsp_rename)` is reconciled here by treating `lsp_rename` as a legacy alias for `rename`, not a second operation. `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` / `lsp_rename` requires `path` + `position` + `newName` with approval gating.
- `obl-064` owns this MVP LSP features summary and requires the missing-result envelope `status: ok | partial | unavailable | error`; stale aliases, short names, or ad hoc result envelopes are retired in favor of this section.

Fields:
- operation
- query
- path
- position
- newName
- status

Labels and values:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename

Rules:
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position` (line/character).
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
## 10. Transport alternatives and bridge pattern

Most LSP servers use **stdio** (spawn process, stdin/stdout = JSON-RPC). Some use **TCP** (e.g. Godot's GDScript LSP on port 6005). Tools like OpenCode and Cursor typically expect stdio only, so TCP-only servers don't work without a bridge.

### 10.1 Godot LSP bridge (reference)

- **Context:** [Reddit: Made a Godot LSP bridge because it wasn't working with OpenCode](https://www.reddit.com/r/godot/comments/1qumbhq/made_a_godot_lsp_bridge_because_it_wasnt_working/) -- Godot uses TCP; OpenCode expects stdio; connection kept failing.
- **Project:** [godot-lsp-stdio-bridge](https://github.com/code-xhyun/godot-lsp-stdio-bridge) -- stdio-to-TCP bridge so AI coding tools (OpenCode, Claude Code, Cursor) can use Godot's GDScript LSP. Run with `npx godot-lsp-stdio-bridge`; configure as the LSP "command" for `.gd` / `.gdshader`.
- **Features:** Binary-safe buffers (no data loss on large files); auto port discovery (6005, 6007, 6008); auto reconnection when Godot restarts; Windows URI normalization (`C:\path` → `/C:/path`); notification buffering until initialize response (handles Godot's non-standard ordering); memory limits (10 MB buffer, 1000 message queue); graceful shutdown. Zero dependencies (Node.js).
- **Takeaway for us:** If we support a **custom command** per server (like OpenCode's `lsp.<id>.command`), users can plug in **bridge processes** for TCP (or other) servers. We only speak stdio to the child process; the bridge translates to/from TCP. No need to implement TCP in our client for MVP; document that "use a bridge" is the supported pattern for TCP-only servers.

### 10.2 Our stance

- **MVP:** Client talks stdio only (spawn server process, or spawn a bridge that talks stdio to us and TCP/other to the real server).
- **Native TCP/socket:** **Out of scope for MVP.** No implementation required. Implementer must document the bridge pattern only (e.g. Godot via godot-lsp-stdio-bridge). Later (optional): native TCP client for already-running servers; lower priority.

---

## 11. References

- [LSP Specification (3.17)](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
- [OpenCode LSP docs](https://opencode.ai/docs/lsp/) -- official; built-in servers, config, how it works
- [OpenCode server.ts](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/lsp/server.ts) -- server registry, root discovery, spawn, 30+ languages
- [lsp-types](https://docs.rs/lsp-types/), [lsp-client](https://docs.rs/lsp-client/), [async_lsp_client](https://docs.rs/async_lsp_client/)
- [LSP timeout responsibility (client)](https://github.com/microsoft/language-server-protocol/issues/1916)
- [LSP stale response / versioning](https://github.com/microsoft/language-server-protocol/issues/584)
- [Godot LSP bridge (Reddit)](https://www.reddit.com/r/godot/comments/1qumbhq/made_a_godot_lsp_bridge_because_it_wasnt_working/) -- TCP vs stdio; bridge pattern for OpenCode/Cursor/Claude Code
- [godot-lsp-stdio-bridge](https://github.com/code-xhyun/godot-lsp-stdio-bridge) -- stdio↔TCP bridge, port discovery, reconnection, binary-safe buffers
- [ESLint](https://github.com/eslint/eslint) -- ECMAScript/JavaScript (and TS) linter; v10.0.x flat config only; LSP via vscode-eslint/server or project eslint dep. See §3.3.
- [ESLint v10 migration](https://eslint.org/docs/latest/use/migrate-to-10.0.0) -- flat config, Node requirements.
- [slint-lsp](https://crates.io/crates/slint-lsp) -- LSP server for Slint (.slint); stdio; diagnostics, completion, goto definition, live-preview. See §3.3.1.
- [Slint tooling (slint-lsp, fmt)](https://snapshots.slint.dev/master/docs/guide/tooling/manual-setup/#slint-lsp) -- setup, config, formatting.
- Plans/FileManager.md (§6 out of scope, §10 editor navigation and fallback symbol search, §11 file-tree actions and presets)
- Plans/FinalGUISpec.md (placeholder for linter/build errors when LSP added)

---

## 12. Implementation checklist (when phased in)

### 12.1 Implementation order (phases and dependencies)

Recommended ordering so an implementer can build incrementally with clear dependencies. **Dependencies:** each phase assumes the previous phase is done; within a phase, items are ordered by dependency where applicable.

- **Phase 1 -- Core LSP (must ship first):**
  - **Prerequisites:** Rust LSP client crate (lsp-types + stdio-capable client), config schema (OpenCode-aligned; §14.4).
  - **Client + registry:** Server registry (id, extensions, root finder, spawn); config (disabled, command, env, initialization). Include all built-in servers §3.2 + slint-lsp (§3.3.1); reinforce eslint (§3.3). *Depends on: Prerequisites.*
  - **Document sync:** didOpen / didChange (debounced, incremental when supported) / didClose / didSave; version tracking (§7, §14.2, §14.3). *Depends on: Client + registry.*
  - **Diagnostics:** Subscribe to publishDiagnostics; map to editor underlines + gutter; **Problems panel** (FinalGUISpec §7.20). *Depends on: Document sync.*
  - **Hover:** textDocument/hover at cursor; show tooltip; timeout and stale discard (§1.1, §7). *Depends on: Document sync.*
  - **Completion:** textDocument/completion on trigger; render list and apply on select; timeout and stale discard. *Depends on: Document sync.*
  - **LSP status in UI:** Status bar (server name, Initializing/Ready/Error); §8 crash/restart behavior. *Depends on: Client + registry.*
  - **Fallback when LSP unavailable:** Heuristic symbol search, no diagnostics; optional install hint (FileManager §10.2). *Depends on: Editor/FileManager.*
  - **Phase 1 outcome:** User can open files, see diagnostics in editor and Problems panel, get hover and completion; status bar shows LSP state; fallback when no server.

- **Phase 2 -- Editor navigation + Chat LSP:**
  - **Navigation (editor):** documentSymbol (outline, breadcrumbs, Go to symbol), textDocument/definition; then **textDocument/references** (Find references → References panel), **textDocument/rename** (Rename with FileSafe), **textDocument/formatting** (Format document/selection). *Depends on: Phase 1.*
  - **Inlay hints, semantic highlighting, code actions, code lens, signature help** in editor. *Depends on: Phase 1.*
  - **Request timeout and cancellation; per-server enable/disable; Settings > LSP** (§7.4.2); server lifecycle (restart on crash, backoff); bridge pattern. *Depends on: Phase 1.*
  - **Chat LSP (§5.1):** Diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code-block hover and click-to-definition; Problems link from Chat; optional inline diagnostics hint for @'d files. *Depends on: Phase 1 (diagnostics, hover, definition).*
  - **Diagnostics for LLM/Assistant** in context. *Depends on: Phase 1 diagnostics.*
  - **Phase 2 outcome:** Full editor LSP (definition, references, rename, format, code actions, code lens, signature help, inlay hints); Chat has LSP-aware @ symbol, code-block hover/definition, Problems link; Settings > LSP and fallbacks in place.

- **Phase 3 -- Additional enhancements (§9.1):**
  - **Recommended (high value):** Find references, Rename symbol, Format document (if not already in Phase 2); LSP diagnostics verification gate (optional); LSP snapshot in evidence (optional); Chat "Fix all" / "Rename" / "Where is this used?" / "Format file"; promote lsp tool (Tools.md).
  - **Optional (as capacity allows):** Go to type definition, Go to implementation, document links, call hierarchy, folding range, selection range, document highlight; Interview "structure of file" (documentSymbol); subagent selection from LSP; code lens "Run test" / "N references" click → References panel.
  - **Phase 3 outcome:** Optional verification gates, evidence snapshots, and Chat/Interview/agent-facing enhancements implemented per §9.1 acceptance criteria.

**Summary:** Phase 1 = core client, doc sync, diagnostics, hover, completion, Problems panel, status, fallback. Phase 2 = navigation (definition, references, rename, format), inlay/semantic/code actions/code lens/signature help, Chat LSP (§5.1), timeouts, Settings > LSP. Phase 3 = §9.1 optional/recommended items.

**Edge cases and fallback:** For each checklist item below, success/failure behavior, edge cases (timeout, server crash, stale response), and **fallback when LSP unavailable** are defined in §1.1 (Purpose), §5 (Editor), §5.1 (Chat), §8 (mitigations), and §13 (GUI). Config keys: §14.4.

---

- [ ] Choose and integrate Rust LSP client crate (lsp-types + stdio-capable client).
- [ ] Implement server registry: id, extensions, root finder, spawn; config (disabled, command, extensions, env, initialization). **Include all built-in servers** from §3.2 (OpenCode-aligned table **plus slint-lsp** for `.slint`). **Reinforce eslint** for ECMAScript/JavaScript/TypeScript (§3.3); **include slint-lsp** for Slint UI (§3.3.1); root discovery via package.json or eslint.config.* (v10 flat config), and for .slint via file directory or Cargo.toml root.
- [ ] Document sync: didOpen / didChange (debounced, incremental when supported) / didClose / didSave; version tracking.
- [ ] Diagnostics: subscribe to publishDiagnostics; map to editor UI and optional Problems panel.
- [ ] Hover: textDocument/hover on cursor position; show tooltip.
- [ ] Completion: textDocument/completion on trigger; render list and apply on select.
- [ ] Navigation: documentSymbol (outline/breadcrumbs), textDocument/definition, **textDocument/references** (Find references → References panel), **textDocument/rename** (Rename symbol with FileSafe), **textDocument/typeDefinition**, **textDocument/implementation** (when server supports).
- [ ] Inlay hints: textDocument/inlayHint; render as inline decorations.
- [ ] Semantic highlighting: textDocument/semanticTokens when supported; fall back to syntax-only.
- [ ] Code actions: textDocument/codeAction; context menu/lightbulb; apply via workspace/applyEdit (FileSafe).
- [ ] Code lens: textDocument/codeLens; render and invoke actionable links.
- [ ] Signature help: textDocument/signatureHelp when cursor in a call.
- [ ] Request timeout and cancellation; discard or re-request on stale document version.
- [ ] LSP status in UI: status bar or indicator (server name, Initializing/Ready/Error).
- [ ] Per-server enable/disable: honor lsp.<id>.disabled and lsp: false. **GUI:** Settings > LSP: all built-in servers listed with Enable toggle (default on); user can turn any off. Global "Disable automatic LSP server downloads" toggle; per-server env and initialization options; custom LSP servers (add/edit/remove: command, extensions, env, initialization). See FinalGUISpec §7.4.2.
- [ ] Server lifecycle: spawn on first file open for `(host_id, server_id, root_identity)`; restart on crash with backoff.
- [ ] Support bridge pattern: custom command can be a stdio↔TCP bridge (e.g. Godot); document for users.
- [ ] Fallback: when LSP disabled or server missing, keep heuristic symbol search and no diagnostics; optional install hint (FileManager §10.2).
- [ ] Diagnostics for LLM/Assistant: include current LSP diagnostics in context fed to Assistant/Interview.
- [ ] **Additional enhancements (§9.1):** textDocument/formatting (format document/selection); textDocument/documentLink (clickable imports); optional: LSP diagnostics verification gate, LSP snapshot in evidence, Chat "Fix all" / "Rename" / "Where is this used?" / "Format file"; promote lsp tool when ready.

---

## 13. GUI requirements and cross-references

Settings > LSP is a searchable registry-management surface, not a flat toggle list.

It MUST allow the user to:
- globally enable or disable LSP
- search and filter the full support catalog
- enable or disable catalog entries
- inspect source/classification badges and effective overlap resolution
- add custom servers
- inspect requested vs effective attach state per server and project context
- `Settings > LSP lists all servers and custom entries with validation`; that phrase is a product requirement, not a placeholder. The GUI includes a global master toggle, a searchable `/filterable` full-catalog list, per-server enable/disable, add custom server `/form`, edit custom server action, `/built-in` override/reset behavior, malformed command/config validation, visible distinction among catalog/built-in server, built-in server with user override, user-added custom server, disabled/enabled/misconfigured/unavailable states, command plus args, handled extensions/selectors, env/init options, root-discovery mode, install `/provisioning` notes, and global vs project-scope override. Requested state and effective state must both be shown when a global enablement is masked by a project override or missing binary.
- Registry rows expose `/languages`, `/selectors`, source badges (`Microsoft`, `OpenCode`, `PM`, `Custom`), classification badges (`Default managed`, `Manual/toolchain`, `Experimental`), `/install` and `/toolchain` provenance, explicit `/effective-state`, path and `/exclusion` controls, and built-in `Override` plus `Reset to catalog defaults` actions. Custom rows keep full edit and remove controls; built-in rows keep read-only catalog metadata except for allowed overrides.
- The LSP registry participates in the GUI Settings `/inspectors` pattern and the `two-level` Settings navigation model. Registry `/filtering` and `/filter/grouping` cover at least `/ecosystem`, language, source, requested state, effective state, support classification, and lifecycle state. Detail panes show canonical `/names`, aliases/source names, `/install/download/legal` and `/provisioning` posture, platform restrictions, command/env/init fields, and validation errors without turning Settings into the SSOT for runtime attachment.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

Cross-surface rules:
- File Manager and editor consume LSP state for semantic affordances
- Search remains the owner of text search and replace-in-files
- Problems remains the owner of aggregated diagnostics display
- status surfaces disclose freshness, health, and effective capability state rather than hiding degraded attach conditions

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

## 14. Technical implementation (implementation guide source)

### 14.1 Worktree root_identity handling

LSP sessions are keyed by `(host_id, server_id, root_identity)`. When a file belongs to a worktree rather than the main project root, the LSP root_identity MUST use the canonical on-host worktree path, not a raw path copied across hosts.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

**Behavior:**
- When a thread with a bound worktree is active and the user opens files from that worktree, LSP sessions use `root_identity = worktree_path`
- If an LSP session for `(host_id, server_id, worktree_path)` does not exist, one is started (warm-start on worktree creation if feasible)
- When the worktree is removed, the associated LSP session is shut down gracefully
- Multiple worktrees may each have their own LSP session for the same server_id (each with a different root_identity)

**Thread switch behavior:**
- Switching threads does NOT kill LSP sessions for the previous thread's worktree — they remain available for background diagnostics and are reused if the user switches back
- LSP session lifecycle is tied to worktree existence, not thread focus

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### 14.1.1 Remote LSP over SSH transport

Remote LSP uses SSH as a stdio tunnel instead of a port-forwarded secondary protocol.

Rules:
- transport is stdio over SSH; the remote LSP server stdin/stdout are tunneled through the SSH connection rather than exposed by port forwarding
- connection lifecycle is: SSH connection established → remote LSP server spawned → stdio streams connected → initialize handshake → ready
- multiple LSP servers may share the same SSH connection via multiplexed channels
- Remote paths preserve the user-visible SSH authority: examples such as `user@host:/path/to/project` and `/path/to/project` describe the same remote project identity, not a local mirror. Remote LSP is MVP for remote edit intelligence and diagnostics, but remote run/debug remains outside FileManager's edit contract unless another runtime owner enables it. On connection-loss, LSP state follows the FileManager/GUI pattern: show `Connection lost`, offer `Reconnect` or `Work offline (cached files only)` when a validated cache exists, keep credentials in system keychain/agent flows rather than config, and expose keep-alive/backoff state through `ssh_connections` compatibility lineage or the current SSH remote profile model.
- if SSH disconnects, all remote LSP servers on that connection are marked `degraded`, reconnect is attempted, servers are re-initialized, and pending requests are replayed when safe
- remote LSP has higher latency by design; PM applies a timeout multiplier for remote operations (default `3x`)
- remote LSP uses the remote filesystem directly; there is no hidden local sync or mirror for LSP operations

Remote identity, SSH ownership, and degraded-state locks:
- Remote LSP is part of the `remote-mode-project` model, not a `remote-edit-only` feature and not a broad-sweep local editor patch. This seam is research-locked for implementation transfer. `GitHub_Integration.md §C` is the SSH `/ownership` anchor for `/edit/test/remove`, validation `/auth/host-key`, add-existing-project, remote terminal, remote agents, remote `/providers`, and remote runtime execution. `GitHub_Integration.md §C.3-C.4` / `C.3-C.4` is the operational reconnect authority: keep the 30s keepalive, allow one bounded auto-retry (`one-auto-retry` in older notes), then require explicit `Reconnect`.
- The canonical remote working-folder identity is `user@host:remote/path`; `remote-host`, `working-folder`, and path authority are part of the project/runtime identity. Puppet Master must not create a hidden local `/mirror`, must not silently retarget `/multi-context` work to the local host, and must fail unsupported remote/multi-context launches deterministically with a visible `/risk` reason.
- `Settings > SSH` and GUI remote-editor surfaces expose remote capability, editor-state, and degraded copy, but they consume the SSH owner contract instead of redefining it. `file-editor`, FileManager, Terminal, Source Control, provider, `/debug`, and `/runtime` surfaces share the same `/read-only/offline/refresh`, `/offline/degraded`, `/enabled`, and unavailable vocabulary.
- The stale local-only phrase `(server_id, root)` is retained only as migration contrast. Live LSP attach/session keys are `(host_id, server_id, root_identity)`, and remote documents use host-scoped `/path-mapping` so a file-local URI on host A cannot collide with the same path on host B.
- Diagnostics storage remains per `(server/session, uri)` and per `(session, uri)` and is merged only in presentation. Editor markers and `/gutter` are file-local projections; Problems owns `/merging`; Assistant/Interview and Search consume `/completion/definition/diagnostics`, `/symbols`, and status summaries without becoming the LSP owner.
- Remote install `/provisioning`, `/SSH` placement, large-workspace scaling, and change-annotation behavior are implementation-relevant MVP requirements. Remote LSP stays the same architecture as local LSP, with different host/provisioning/path identity, rather than becoming a second subsystem.
- Remote mutation and availability modes are user-visible. Preview-worthy rename, multi-file code-action, and broad format operations require the same safe preview `/confirmation` path as other FileSafe edits; partial workspace-edit failure reports per-file results, and read-only, locked, unavailable, or `/degraded` targets fail with explicit reason copy. Remote effective modes include `full_remote_lsp`, `degraded_remote_diagnostics_only`, and `remote_edit_no_lsp`; unsupported local-LSP-on-remote-paths behavior must not masquerade as `on-remote-paths` correctness.
- Remote host-placement is explicit: server-originated paths, diagnostics, code actions, and workspace edits are interpreted in the effective remote host context, then passed through host-aware `/path-mapping` before any editor/FileSafe projection. `/degraded/unavailable` remote states keep `/revert/editor`, save, rename, format, and code-action affordances visible only when the same FileSafe and remote write-availability checks would allow the mutation.
- Remote outages affect adjacent consumers without redefining them. Prior Search results may remain as stale snapshots, while new queries that need remote round-trips block or show unavailable; Source Control may expose stale status or `/diff` but must not silently fall back to local Git; Problems and LSP diagnostics may remain visible only when marked stale or unavailable; open remote buffers may retain local text and `/offline/pending-sync` state without implying remote write success. Hunk-level `/diff` interaction, fallback-open actions, read-only reasons, and remote LSP disable/defer decisions use the same capability vocabulary.
- Remote/local parity covers save/dirty state, file watches/reload, diff generation and compare targets, LSP execution/fallback, and rich previews `/renderers`; parity means explicit capability state, not hidden local fallback.
- Browser and recovery residue must not be reintroduced through LSP wording: `Bottom Panel Browser tab (§7.20)`, `preview_mode = browser_panel`, and `preview_mode` are preview/browser migration tokens owned by FileManager/FinalGUISpec/storage-plan cleanup, while `recover-unsaved` remains an editor/storage recovery contract outside the LSP session key.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### 14.2 Module and crate layout

- **Decision:** LSP client and server registry live in the **same crate as the editor** (e.g. `puppet-master-rs/src/`) in a dedicated **submodule `src/lsp/`** containing:
  - `client.rs` -- LSP client wrapper (stdio transport, lifecycle, request/response).
  - `registry.rs` -- Server registry (id, extensions, root finder, spawn); reads config.
  - `session.rs` or `server_handle.rs` -- Per-`(host_id, server_id, root_identity)` process handle and state.
  - `document.rs` or `sync.rs` -- Document version tracking and didOpen/didChange/didClose/didSave.
- **Dependencies:** `lsp-types`, chosen LSP client crate (e.g. `lsp-client` or `async_lsp_client`), `tokio` for async. No need for tower-lsp unless implementing a server.

### 14.3 Core data structures (conceptual)

```text
LspSessionKey {
  project_id
  host_id
  server_id
  root_identity
}

LspSessionProjection {
  key
  lifecycle_state
  freshness
  health
  requested_enabled
  effective_enabled
  capability_summary
  restart_budget
  last_error
}

DocumentBinding {
  document_id
  path
  version
  host_id
  root_identity
  attached_servers[]
}
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

LSP server lifecycle state machine:

Canonical user/state names are `Starting`, `Initializing`, `Ready`, `RestartBackoff`, `Degraded`, `ShuttingDown`, and `Stopped`. Only `Ready` emits normal feature traffic; `Starting` and `Initializing` may queue sync work, `RestartBackoff` exposes countdown plus last error, and `Degraded` can mean paused recovery or diagnostics-only / diagnostics-only attachment. Each document is attached once per session, including virtual-doc buffers, and `didClose` is emitted when the final attachment for that `(session, uri)` disappears. The session/model boundary records `/URI` identity so virtual-doc and real-file URI values do not collide.

The `/supervision` boundary is `LspSupervisor` plus `DocumentStore`: `/document-pane` surfaces, editor tabs, chat virtual documents, restore/reload, and `/revert` all consume the same authoritative buffer and pending-sync state. LSP never reads a second document authority for an open file, and `didSave` is emitted only after the shared document store records a successful save for the current version.

States: `stopped → starting → initializing → ready → degraded → stopping → crashed`

| From | To | Trigger | Action |
|---|---|---|---|
| stopped | starting | file opened matching server's language | spawn server process |
| starting | initializing | process started, stdio connected | send `initialize` request |
| initializing | ready | `initialized` notification received | enable capabilities |
| ready | degraded | server error / timeout / partial failure | reduce capabilities, show warning |
| degraded | ready | server recovers / error clears | restore full capabilities |
| ready | stopping | last file of language closed / user request | send `shutdown` + `exit` |
| stopping | stopped | server process exits | cleanup resources |
| any | crashed | server process dies unexpectedly | log error, attempt restart |
| crashed | starting | auto-restart (max 3 attempts, backoff 2s/4s/8s) | respawn |
| crashed | stopped | restart limit exceeded | show error, require manual restart |

Resource limits:
- max memory per server is configurable, default `512MB`
- max CPU time for a single request is `30s`

### 14.4 Message flow

1. **User opens file** → Editor loads buffer → Resolve (path → extension → server id → effective host/root identity) → If server not running for `(host_id, server_id, root_identity)`, spawn process → Initialize handshake → Send `didOpen` with content + version.
2. **User edits** → Buffer content changes → Increment version; **debounce** (e.g. 100 ms) → Send `didChange` (incremental if supported) with version.
3. **Server sends publishDiagnostics** → Client receives → Update DiagnosticsCache for that URI → Notify UI (main thread) → Problems tab and gutter update.
4. **User hovers** → Editor sends (uri, position) → Client sends `textDocument/hover` (with timeout) → On response, check document version; if stale, discard → Show tooltip.
5. **User triggers completion** → Client sends `textDocument/completion` with context → On response, filter/discard if stale → Show list; on select, apply and optionally `completionItem/resolve`.

All LSP I/O on **async task** (tokio); route UI updates to the Slint event loop (e.g. via `slint::invoke_from_event_loop` or `Weak::upgrade_in_event_loop`). Never block UI on LSP.

**Stale response policy:** When a response arrives for a document-scoped request (hover, completion, definition, references, signatureHelp), the client must check whether the document version has changed since the request was sent. Store the document version (from `DocumentState.version` for that URI) at request time; when the response is received, compare to the current `DocumentState.version`. If the current version is **greater** than the version at request time, **discard** the response (do not show tooltip, do not apply completion, do not navigate). Optionally match by request id so only the correct response is discarded. **Do not** automatically re-request; the user can repeat the action (e.g. hover again, trigger completion again) to get a fresh result. For workspace-level requests (e.g. workspace/symbol), version check is per relevant document or omit if no single document applies.

Document identity, freshness, and `/position` conversion are one contract. Before `didClose`, PM cancels in-flight document-scoped requests for `(session, uri)` and clears diagnostics per `(server/session, uri)`. Each document-scoped request carries `session_epoch`, `uri`, `document_version`, and `request_generation` or an equivalent latest-of-class marker; responses apply only for the same live session epoch, same URI, matching current document version, and latest relevant request class. Late replies are discarded in UX but remain visible in trace `/logs`.

At open time, PM creates one canonical `DocumentUri` per document/host and reuses it consistently. The same physical file must not gain duplicate identities through case, `/slash/drive-letter`, URI spelling, `(session, uri)` pairing, or `/path/position` conversion differences. UI/editor surfaces stay 1-based where already planned; the LSP boundary remains 0-based and uses one position-mapper / position-mapping service backed by `DocumentStore`. `capabilities.positionEncoding` and `position_encoding` are negotiated per session; PM uses compatibility-first position-encoding, keeps UTF-16 as the guaranteed baseline, may prefer `utf-8` only after compatibility proof, and must not hard-code UTF assumptions into hover, `/completion/diagnostics/rename`, diagnostics, rename, or formatting handlers. Conversion uses fast per-line helpers/cache so multi-server correctness, remote `/SSH`, and performance tuning stay protocol-safe.

LSP coordinates use the protocol's code-unit conventions at the boundary; the centralized conversion layer records whether a server uses UTF-16 code-unit offsets, another negotiated encoding, or compatibility fallback, so individual feature handlers never hand-roll code-unit math.

Sync ordering and request-class rules:
- Sync events are FIFO per session. A document-scoped request must not leave the queue until the target session is `Ready`, the prior `didOpen`/`didChange` work for that document in that session has flushed, and the document is no longer in pending-sync state.
- Hover, `/completion/signatureHelp`, and similar soft requests keep only the newest pending request per document `/request-class`; older in-flight or not-yet-ready requests are canceled or dropped on `/close`, cursor movement, or newer input.
- Explicit navigation and editing requests such as definition, references, rename, format, and `codeAction` wait behind the sync barrier once and then execute only if still relevant.
- `didChange` debounce is resetting `/coalescing`, not fixed-window batching. All mutations since the last sent sync for that session/doc become one batch; if incremental confidence is lost, send a whole-document replacement to re-baseline; if confidence is still not trustworthy, restart the session and replay currently attached docs.
- A successful save may emit `didSave` for the current document version/content state. Failed save does not emit `didSave`, and stale-result handling must not make the UI look saved or synchronized.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.5 Config schema and storage

- **Keys:** `lsp.enabled` (bool, default true), `lsp.servers.<id>.disabled` (bool), `lsp.servers.<id>.command` (string array), `lsp.servers.<id>.extensions` (string array), `lsp.servers.<id>.env` (object), `lsp.servers.<id>.initialization` (object). **Decision:** Config namespace is `lsp.servers.<id>.*`; support legacy alias `lsp.<id>.disabled` (read/write maps to `lsp.servers.<id>.disabled`). Align with OpenCode schema for compatibility.
- **Storage:** App-level in **redb** (or existing config YAML) under a key like `config.lsp`. Project-level override: optional file in project root (e.g. `.puppet-master/lsp.json`) or key under project id in redb.
- **Debounce / timeouts:** Store in Settings → Editor or Developer: `lsp.didChangeDebounceMs` (default **100**, range 50-500), `lsp.hoverTimeoutMs` (default **5000**), `lsp.completionTimeoutMs` (default **5000**), `lsp.workspaceSymbolTimeoutMs` (default **10000**), `lsp.hoverDelayMs` (default **300**, range 100-1000, delay before sending hover request). All timeouts user-configurable. Document in implementation guide.

### 14.6 Trigger and refresh behavior

- **Completion:** Trigger on typing (all characters) or on explicit shortcut (e.g. Ctrl+Space). Send `CompletionContext` with `triggerKind`: Invoked or TriggerCharacter.
- **Hover:** Trigger on cursor idle; delay **300 ms** (config `lsp.hoverDelayMs`, default 300) before sending hover request to avoid flooding; cancel previous hover request on cursor move.
- **Inlay hints:** Request on document open and on `didChange` (after debounce); optionally on visible range change (scroll). Server may support refresh on demand.
- **Code actions:** Request on context menu open or lightbulb click; pass current range + diagnostics for that range (`CodeActionContext`).
- **Signature help:** Trigger when cursor enters a call (e.g. after `(`); re-request on cursor move within the call.

### 14.7 workspaceFolders policy (decision)

- **Recommendation:** At initialize, send **only roots that have at least one open document**, capped at **10** roots. If user has no open files, send project root if single-root, else empty list. Reduces startup cost and memory; document in implementation guide. Re-initialize not required when opening a file in a new root; the matching host-aware server session handles that.

### 14.8 Virtual documents (Chat code blocks)


Code blocks in Chat messages (§5.1) that are not backed by a project file use **virtual documents** so hover and go-to-definition can still call the LSP.

- **URI scheme:** Use a dedicated scheme so the client and server can distinguish virtual docs from file paths. Example: `puppet-master-virtual://chat/{language_id}/{opaque_id}` where `opaque_id` is a unique id per block (e.g. UUID or message-id + block index). Language id (e.g. `rust`, `typescript`) comes from the block's language tag.
- **Creation:** When the user focuses or hovers over a code block in a Chat message that has a known language id and the project has an LSP server for that language, create a virtual document: assign a URI, set content to the block text, and attach it to the **server for that language and the effective host/root identity for the current project context** (same session that would handle a real file with that extension). If the block maps to a real project file (e.g. "snippet from src/main.rs"), use the real file URI instead and do not create a virtual doc.
- **Attachment:** Virtual documents are attached to the same `(host_id, server_id, root_identity)` as would be used for a real file of that language in the project. Resolve language id → server id from the registry (e.g. `rust` → rust-analyzer); resolve against the effective host context rather than assuming local project root; then send `textDocument/didOpen` with the virtual URI, language id, and content so the server has the document.
- **Lifecycle:** Send `textDocument/didOpen` when the virtual document is "opened" (e.g. when the user first hovers or requests definition in that block). Send `textDocument/didClose` when the block is no longer needed: when the user scrolls away from that message, when the message is collapsed, or when the Chat view is closed; or after T seconds idle (e.g. 300 s) if implementing eviction by timeout. Optionally retain a bounded set of recently used virtual docs (e.g. last 5) to avoid repeated didOpen/didClose on quick hover. Do not send `didChange` for virtual docs (blocks are immutable); if the user edits the message and the block content changes, treat as a new block (new opaque_id) and close the old virtual doc.
- **Contract for implementer:** (1) Virtual URI never points to disk; (2) one virtual doc per code block instance (same block in UI = same opaque_id); (3) didOpen is sent when the block needs LSP (hover/definition); (4) didClose is sent when the block is evicted or the view is closed; (5) hover/definition requests for that block use the virtual URI and the same `(host_id, server_id, root_identity)` as for that language in the current project context.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.9 Registry contract (ServerSpec)

`ServerSpec` is the canonical machine-friendly catalog record for both built-in and custom servers.

Minimum fields:
- `server_id`
- `display_name`
- `sources[]` (`microsoft`, `opencode`, `pm` for catalog provenance; custom rows use `kind = custom`)
- `source_names[]` / `aliases[]`
- `kind` (`managed_builtin`, `managed_catalog`, `custom`)
- `language_tags[]`
- `extensions[]`
- `selectors[]` / `file_globs[]`
- `platforms[]`
- `requirements[]`
- `root_rules`
- `root_discovery_mode`
- `selection_mode`
- `selection_family`
- `primary_priority`
- `context_require[]`
- `context_exclude[]`
- `supplementary_for_families[]`
- `capability_profile`
- `role_default` (`primary`, `supplementary`, `contextual`)
- `support_classification` (`supported-by-registry`, `default-managed`, `toolchain-bound/manual`, `experimental/degraded`, `deprecated/replaced`)
- `default_enabled`
- `provisioning_strategy`
- `availability_probe`
- `command_template` / launch hint
- `initialization_defaults`
- `notes`
- `host_support`
- `degraded_attach_rules`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

Registry rules:
- the effective support catalog is the deduped union of Microsoft implementor data, OpenCode catalog data, and Puppet Master overlay metadata
- user enable/disable and custom-server settings layer on top of the catalog instead of replacing it
- derived prose tables and `/readable` `/settings/docs` views may be generated from this support-catalog registry, but this structure remains the SSOT and prevents the large union catalog from becoming duplicate-prone prose
- Support scope and support classification stay separate in the `/catalog`: supported-by-registry, default-managed, toolchain-bound `/manual`, experimental `/degraded`, and deprecated or `/replaced` are classification outcomes layered over stable `server_id` identity, not reasons to fork the catalog SSOT. Effective resolution order is catalog base entry, global override, project override, then runtime availability and `/effective-state` evaluation.

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

## 15. Implementation phases and acceptance criteria

Order for an agent to build a step-by-step implementation guide. Each phase has clear deliverables and acceptance criteria.

| Phase | Deliverables | Acceptance criteria |
|-------|--------------|---------------------|
| **1. Foundation** | LSP client crate integrated; server registry (in-memory); config loading (lsp.* from redb/config). | App starts; config can disable LSP globally; registry returns server id by extension. |
| **2. Spawn and lifecycle** | Spawn server process per (id, root); stdio transport; initialize handshake; shutdown/exit on close. | Opening a `.rs` file (with rust-analyzer in PATH) spawns one process; closing all files in that root shuts down server. |
| **3. Document sync** | didOpen, didChange (debounced), didClose, didSave; version tracking; incremental sync when server supports. | Editing file sends didChange after debounce; version increments; no flood of messages. |
| **4. Diagnostics** | Subscribe to publishDiagnostics; store per URI; expose to UI. | Problems tab shows errors/warnings for open files; gutter shows markers; click opens file at line. |
| **5. Hover and completion** | textDocument/hover and textDocument/completion; timeout and cancel; tooltip and completion list in editor. | Hover shows type/docs; completion list appears on trigger; stale responses discarded. |
| **6. Navigation** | documentSymbol, textDocument/definition (and references); breadcrumbs and go-to-symbol use LSP when available. | Breadcrumbs reflect LSP outline; go to symbol/definition jump to correct location. |
| **7. Inlay hints, semantic tokens, signature help** | inlayHint, semanticTokens, signatureHelp; render in editor. | Inlay hints and signature help visible; semantic highlighting improves colors when supported. |
| **8. Code actions and code lens** | codeAction (context menu/lightbulb), codeLens; apply via workspace/applyEdit through FileSafe. | Quick fixes appear and apply correctly; code lens links invoke. |
| **9. Status and fallback** | LSP status in status bar; per-server enable/disable; fallback to heuristic when no server; optional install hint. | Status bar shows server state; disabling server stops LSP for that language; heuristic outline used when LSP off. |
| **10. LLM diagnostics** | Include current diagnostics in Assistant/Interview context. | Agent receives diagnostic list for relevant files when composing context. |

---

## 16. Open points and decisions for implementer
This section closes the remaining implementation-time policy choices for MVP LSP behavior.

### Canonical config location and precedence
App-level configuration lives under `config.lsp`.

Project overrides live at `.puppet-master/lsp.json`.

Merge order:
1. app-level `config.lsp`
2. project override `.puppet-master/lsp.json`

Merge rules:
- scalar keys override
- object keys override by nested key
- arrays replace rather than merge
- absent keys inherit
- server-specific settings resolve by server id first, then by language/filetype mapping only when no explicit server-id override exists

### Locked defaults
| Setting | Value |
|---|---|
| `didChangeDebounceMs` | `100` |
| `hoverTimeoutMs` | `5000` |
| `completionTimeoutMs` | `5000` |
| `workspaceSymbolTimeoutMs` | `10000` |
| `hoverDelayMs` | `300` |
| `workspaceFolders` cap | `10` roots with at least one open document |

### Trigger and refresh behavior
- completion uses server-advertised trigger characters when provided
- when a server does not advertise trigger characters, completion still supports normal typing plus explicit manual invocation
- inlay hints refresh on document open and after debounced `didChange`
- scroll-only refresh is not required for MVP
- hover uses the canonical `hoverDelayMs` and `hoverTimeoutMs` values above

### `workspaceFolders` policy
Only roots containing at least one open document are included, up to the cap above. Overflow roots are excluded deterministically and MUST be visible in logs/evidence when exclusion affects behavior.

### Apply-edit path
`workspace/applyEdit`, rename, and code-action application use the same FileSafe-backed apply-edit path as other agent mutations.
- multi-file edits are treated as multi-file mutations
- destructive edits use the same safety and approval rules as any other file mutation path
- LSP does not bypass FileSafe, tool policy, or blocked-state reporting

### Virtual documents
Chat/code-block virtual documents keep the existing virtual-document stance already defined in §14.7. This section does not reopen that decision.

No core runtime LSP behavior remains implementation-defined after this section.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md
## Appendix: Implementation plan checklist (single ordered list for implementers)


Use this as the **single, implementation-ready checklist** an agent can follow. Cross-references: §5.1 = LSP in the Chat Window; §9.1 = Additional enhancements (optional/recommended). FinalGUISpec §7.16 = Chat, §7.20 = Bottom Panel (Problems), §7.4.2 = Settings > LSP; FileManager §10.

**Acceptance (done when):** Each Phase 1-4 item is done when: (1) **Prerequisites:** App builds with lsp-types + chosen client crate; config schema and keys exist in storage. (2) **Phase 1:** Opening a file with a matching server spawns the server; diagnostics appear in Problems tab and gutter; hover and completion work with timeout/stale discard; status bar shows server state. (3) **Phase 2:** Go to definition, Find references, Rename, Format work; code actions apply via FileSafe; code lens invokes; Settings > LSP lists all servers and custom entries with validation. (4) **Phase 3:** Assistant/Interview context includes diagnostic summary (capped 10 files, 50 diagnostics); @ symbol includes LSP workspace/symbol; code blocks in Chat support hover and click-to-definition; Problems link in Chat footer opens Problems tab. (5) **Phase 4:** Optional gate, evidence snapshot, subagent bias, and Chat/Interview enhancements implemented per §9.1 or explicitly deferred and documented.

### Prerequisites

- [ ] Choose Rust LSP client crate (lsp-types + stdio-capable client; e.g. lsp-client or async_lsp_client). Add to Cargo.toml.
- [ ] Define LSP config schema (OpenCode-aligned: lsp.enabled, lsp.servers.<id>.disabled, command, extensions, env, initialization). Store in redb; document in §14.4.
- [ ] Add config keys for debounce and timeouts (lsp.didChangeDebounceMs, lsp.hoverTimeoutMs, lsp.completionTimeoutMs, lsp.workspaceSymbolTimeoutMs). See §14.4.

### Phase 1: Core LSP

- [ ] Implement server registry: id, extensions, root finder, spawn; load config (disabled, command, extensions, env, initialization). Include all built-in servers from §3.2 (OpenCode table plus slint-lsp). ESLint §3.3, slint-lsp §3.3.1; root discovery per server.
- [ ] Implement document sync: didOpen, didChange (debounced, default 100 ms), didClose, didSave; track document version per buffer; prefer incremental sync when server supports.
- [ ] Subscribe to textDocument/publishDiagnostics; map to editor underlines and gutter markers; add Problems panel in bottom panel (FinalGUISpec §7.20): table with file, line, message, severity, source; click opens file at line.
- [ ] Implement textDocument/hover; show tooltip at cursor (timeout and cancel on navigate/edit).
- [ ] Implement textDocument/completion on trigger; render inline list; apply on select; optional completionItem/resolve.
- [ ] Show LSP status in status bar (e.g. "rust-analyzer: Ready", "Initializing...", "Error: ..."). FinalGUISpec §8.1 StatusBar.

### Phase 2: Editor (navigation and editing)

- [ ] Implement textDocument/definition (Go to definition); F12 or Ctrl+Click opens definition in File Editor. Fallback: heuristic/index (FileManager §10.2).
- [ ] Implement textDocument/codeAction; show context menu or lightbulb; apply via workspace/applyEdit through FileSafe.
- [ ] Implement textDocument/codeLens; render actionable links above symbols; support invoke (e.g. run test).
- [ ] Implement textDocument/signatureHelp when cursor in call; show popup with signature and parameter highlight.
- [ ] Implement textDocument/inlayHint; render as inline decorations (no buffer change).
- [ ] Implement textDocument/semanticTokens when supported; fall back to syntax-only.
- [ ] Implement textDocument/references (Find references); add References panel or inline list in bottom panel; shortcut Shift+F12; click opens file at location.
- [ ] Implement textDocument/rename and textDocument/prepareRename (Rename symbol); F2; show preview; apply via workspace/applyEdit (FileSafe).
- [ ] Implement textDocument/formatting and textDocument/rangeFormatting (Format document / Format selection); shortcut e.g. Shift+Alt+F; apply via workspace/applyEdit.
- [ ] Use documentSymbol (and workspace/symbol) for breadcrumbs and Go to symbol (FileManager §10.1, §10.2). Fallback: regex outline §10.1.
- [ ] Request timeout and cancellation; discard or re-request on stale document version. Per-server enable/disable: honor lsp.<id>.disabled and lsp: false. Settings > LSP per FinalGUISpec §7.4.2.
- [ ] Server lifecycle: spawn on first file open for `(host_id, server_id, root_identity)`; restart on crash with backoff. Bridge pattern: custom command can be stdio↔TCP bridge (e.g. Godot); document for users.

### Phase 3: Chat LSP (§5.1)

- [ ] **Diagnostics in Assistant context:** When building context for next Assistant/Interview turn, include summary of current LSP diagnostics (file, line, message, severity, source) for project or @'d/recently edited files.
- [ ] **@ symbol with LSP:** When LSP is available, @ menu includes symbols from LSP workspace/symbol (and optionally documentSymbol); results show path, line, kind.
- [ ] **Code blocks in messages:** Code blocks in assistant/user messages support LSP hover (tooltip) and click-to-definition (e.g. Ctrl+Click); use virtual document or real file URI when block maps to project file; definition opens in File Editor.
- [ ] **Problems link from Chat:** Chat footer or message area offers link or badge (e.g. "N problems") that opens Problems panel (FinalGUISpec §7.20) filtered to project or context.
- [ ] **Optional:** When user has @'d files, show compact hint (e.g. "2 errors in @'d files") with click-through to Problems or first error.
- [ ] Fallback when LSP unavailable: @ symbol uses text-based or indexed symbol search (FileManager §10.2); code blocks no hover/definition; omit diagnostics from context.

### Phase 4: Optional (§9.1)

- [ ] **Optional LSP diagnostics gate:** Verification criterion at tier boundaries: "No LSP errors in scope" (or "no errors; warnings allowed"). Configurable per tier (e.g. Verification tab). See feature-list §4 Verification gates.
- [ ] **Optional LSP snapshot in evidence:** When collecting evidence for a run, attach LSP diagnostics snapshot (file, line, severity, message, source) for project or changed files; store under .puppet-master/evidence/.
- [ ] **Optional subagent selection from LSP:** When files in scope have LSP errors for a language, prefer subagent that matches that language (e.g. rust-engineer for Rust errors).
- [ ] **Optional/recommended Chat:** "Fix all" / quick fixes from Chat; "Rename X to Y" from Chat (LSP Rename symbol with confirmation); "Where is this used?" (Find references in Chat or References panel); "Format this file" (LSP Format document); Copy type/signature to Chat from editor hover.
- [ ] **Optional:** Promote lsp tool to MVP (Tools.md): agents can call lsp.references, lsp.definition, lsp.hover; optionally lsp.rename with user approval. Remove or relax OPENCODE_EXPERIMENTAL_LSP_TOOL gate when ready.
- [ ] **Optional:** Interview "Structure of this file" via documentSymbol; diagnostics in interview context (same as Assistant). Other §9.1 editor enhancements (go to type definition, implementation, document links, call hierarchy, folding range, selection range, document highlight) as natural next steps.

---

## 17. LSP verification gate, evidence, subagent selection (implementation spec)

This section defines the **contract, config, failure handling, evidence schema, and integration points** for the LSP diagnostics verification gate, LSP snapshot in evidence, and subagent selection from LSP so an agent can implement with no gaps. Cross-reference: Plans/feature-list.md (Verifier registry, LSP additional enhancements), Plans/Tools.md (§3.1 lsp tool), Plans/orchestrator-subagent-integration.md (subagent selection).

### 17.1 LSP diagnostics verification gate

#### Contract

- **When it runs:** At configured **tier boundaries** before promotion. It MAY be enabled for `phase`, `task`, and/or `subtask`; default: **phase boundary only**. Implementations MAY also run an iteration-local preflight, but that is advisory and MUST NOT replace the configured boundary gate.
- **Tier boundaries:** Configurable per tier: phase, task, subtask. At least one of these must be enabled for the gate to run; when the orchestrator reaches that boundary (e.g. "subtask passed"), the LSP gate runs as one of the criteria before the tier is marked passed.
- **Scope:** What files are checked. One of:
  - **`changed_files`** -- Only files that were modified in the last iteration (or in the current subtask). Requires tracking changed paths (e.g. from git diff or execution engine "files touched").
  - **`open`** -- Only files currently open in the editor (or in the run context). Requires LSP client to know "open" set for the run.
  - **`project`** -- All project files that have an LSP server (bounded: e.g. under project root, or only files with open documents). Default: **`changed_files`** to keep checks fast and relevant.
- **"No LSP errors" meaning:** Configurable severity threshold:
  - **`error`** -- Gate passes if there are **no diagnostics with severity Error** in scope. Warnings and Info are ignored.
  - **`error_and_warning`** -- Gate passes if there are **no diagnostics with severity Error or Warning** in scope. Info is ignored.
  - Default: **`error`**.

#### Config

- **Where:** Verification tab (Settings or Config → Verification). Can be **global** (one setting for all tiers) or **per-tier** (override per phase/task/subtask). Recommendation: global `lsp_gate` with optional per-tier override in tier config.
- **Schema (config key `verification.lsp_gate` in redb):**

**LSP Gate Default Values (Resolved):**
- `enabled`: **false** (opt-in per project)
- `scope`: **"changed_files"** (only check files modified in this tier)
- `block_on`: **"errors"** (errors block, warnings do not)
- `tier_boundaries`: **["phase"]** (check at phase boundaries only by default)
- `timeout_seconds`: **10** (LSP query timeout)
- `when_unavailable`: **"skip"** (if LSP server is not running, skip the gate — do not fail)

Config key: `verification.lsp_gate` in redb. All values are overridable per project via `.puppet-master/config.json`.

```json
{
  "lsp_gate": {
    "enabled": false,
    "scope": "changed_files",
    "block_on": "errors",
    "tier_boundaries": ["phase"],
    "timeout_seconds": 10,
    "when_unavailable": "skip"
  }
}
```

| Field | Type | Values | Default |
|-------|------|--------|--------|
| `enabled` | bool | true, false | **false** |
| `scope` | string | `"changed_files"` \| `"open"` \| `"project"` | **`"changed_files"`** |
| `block_on` | string | `"errors"` \| `"errors_and_warnings"` | **`"errors"`** |
| `tier_boundaries` | string[] | `["phase"]`, `["task"]`, `["subtask"]`, or combination | **`["phase"]`** |
| `timeout_seconds` | number | positive integer | **10** |
| `when_unavailable` | string | `"skip"` \| `"fail"` | **`"skip"`** |

- **GUI:** Verification tab: "LSP diagnostics gate" subsection: Enable checkbox; Scope dropdown (Changed files / Open files / Whole project); Block on (Errors only / Errors and warnings); Tier boundaries (checkboxes: Phase, Task, Subtask); Timeout (seconds). Persist in same config blob as `VerificationConfig` (e.g. extend `VerificationConfig` or nested `lsp_gate`).

#### Failure behavior

- **Gate fails (LSP errors in scope):** The gate report for that tier has `passed: false`; the **criterion** for the LSP gate has `met: false` and `actual` set to a summary (e.g. "3 LSP errors in scope (see evidence)").
- **Orchestrator behavior:** Same as for any failed gate: **retry** (next iteration) if retry policy allows; else **escalate** or **stop** per tier config (e.g. `task_failure_style`). No special case for LSP gate.
- **User notification:** Standard gate failure path: Dashboard/Gate report shows failure; optional toast "LSP gate failed: N errors in scope." Evidence (LSP snapshot) is attached so user can inspect.

#### Evidence attachment

- **When:** When the LSP gate **runs** (whether it passes or fails), attach an **LSP diagnostics snapshot** to the gate report. So: **always** capture snapshot at gate run time; store it as evidence linked to that gate run.
- **Where stored:** See §17.2. The snapshot is written to `.puppet-master/evidence/lsp-snapshots/` (or embedded in gate report artifact); the GateReport or EvidenceStore references it (e.g. `evidence_type: "lsp_snapshot"`, path to JSON file).

#### Integration point

- **Who calls LSP:** A new verifier **`LspGateVerifier`** (or **`lsp_gate_verifier`**), registered in `VerifierRegistry` (e.g. in `verifier.rs` `register_defaults`). Criterion type: `verification_method: "lsp"` or `"lsp_gate"`.
- **Where:** New module `puppet-master-rs/src/verification/lsp_gate_verifier.rs`. It implements `Verifier`: on `verify(criterion)`, it reads scope and block_on from criterion (or from a shared LSP gate config injected into the verifier), calls the LSP client to get current diagnostics for the resolved paths, and returns `VerifierResult { passed, message, evidence }`. Evidence contains or references the LSP snapshot.
- **Gate runner:** No change to gate_runner flow: it already dispatches by `criterion.verification_method` to the registry; when the criterion is LSP gate, the registry returns `LspGateVerifier`, which runs.
- **LSP client API:** The LSP client (e.g. in `src/lsp/` or `src/lsp/client.rs`) must expose **get current diagnostics for paths**:
  - Signature (conceptual): `get_diagnostics_for_paths(paths: &[PathBuf], project_root: &Path) -> Result<Vec<LspDiagnosticEntry>, LspGateError>`.
  - Returns: list of diagnostics (path, line, character, severity, message, source) for the given paths. If a path has no server or no diagnostics, it contributes an empty list. The client uses the existing DiagnosticsCache (from `publishDiagnostics`) and/or triggers a request if needed; must respect timeout (e.g. 15 s) and return partial results or error on timeout.

#### Implementer wiring (config and gate report)

- **VerificationConfig:** Extend the existing verification config (e.g. `VerificationConfig` in `config/gui_config.rs` or equivalent) with an optional **`lsp_gate`** field (nested struct matching the schema above: `enabled`, `scope`, `block_on`, `tier_boundaries`, `timeout_seconds`, optional `when_unavailable`). Persist in the same blob as other verification settings. **Verification tab UI:** Add "LSP diagnostics gate" subsection with controls bound to this struct.
- **Criterion injection:** When building gate criteria for a tier (e.g. in `build_gate_criteria` or where acceptance criteria are converted to criteria), if `lsp_gate.enabled` is true and the current tier boundary (phase/task/subtask) is in `lsp_gate.tier_boundaries`, add a criterion with `verification_method: "lsp"` (or `"lsp_gate"`) and pass scope/block_on (in criterion params or from shared config). No change to criterion type enum beyond adding this method.
- **GateReport / evidence:** Use the **existing** evidence pipeline: `VerifierResult` carries `evidence` (e.g. path to snapshot file or artifact id); the gate runner aggregates per-criterion results into `GateReport`; EvidenceStore (if present) persists artifacts per existing rules. No new GateReport field required; LSP snapshot is stored as an artifact referenced by the LSP criterion's result.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md

### 17.2 LSP snapshot in evidence

Prompt-consumable LSP/debug evidence may auto-ingest at most the top five evidence items by current relevance `/severity`; after that cap, additional diagnostics or trace material enter summarization-only mode unless the user explicitly opens the full runtime artifact.

#### Schema (per diagnostic entry)

Store one JSON file per snapshot (e.g. one per gate run). Each entry in the snapshot:

```json
{
  "path": "src/main.rs",
  "line": 1,
  "character": 0,
  "severity": "Error",
  "message": "expected type",
  "source": "rust-analyzer",
  "code": "E0308"
}
```

- **path** -- Relative to project root or absolute; same as LSP URI normalized to path.
- **line** -- 0-based or 1-based per LSP spec (LSP uses 0-based); **Decision:** Store and display 1-based in evidence and UI; convert to 0-based only at the LSP protocol boundary.
- **character** -- Offset in line (0-based).
- **severity** -- "Error" | "Warning" | "Info" | "Hint".
- **message** -- Diagnostic message.
- **source** -- Optional; server name (e.g. rust-analyzer).
- **code** -- Optional; diagnostic code if provided by server.

#### File format and location


- **Directory:** `.puppet-master/evidence/lsp-snapshots/`.
- **Filename:** `lsp-snapshot-{gate_id}-{timestamp}.json` or `lsp-snapshot-{tier_id}-{session_id}.json` so it is unique and tied to the gate run.
- **Content:** Single JSON object: `{ "captured_at": "ISO8601", "scope": "changed_files"|"open"|"project", "project_root": "...", "diagnostics": [ {...}, ... ] }`.

#### When captured

- **Before run:** Not required for gate-only use.
- **After run (when gate runs):** Yes. When the LSP gate verifier runs (at tier boundary), it captures the snapshot **at that moment** (after iteration, before promotion). So: **one snapshot per gate run** at the time the gate is evaluated.
- **Optional "before and after":** For richer audit, config could allow capturing snapshot before iteration and after; then two files per run. MVP: **after only** (at gate run time).

#### Who triggers

- **Gate runner** (via LspGateVerifier). The verifier is invoked by the gate runner when a criterion with `verification_method: "lsp"` is evaluated. The verifier (1) gets diagnostics from LSP client for scope, (2) writes snapshot JSON to `.puppet-master/evidence/lsp-snapshots/`, (3) attaches evidence to VerifierResult (path to snapshot file), (4) returns passed/failed. EvidenceStore (if wired) can also persist the path; GateReport criteria already carry per-criterion evidence from VerifierResult.

ContractRef: ContractName:Plans/LSPSupport.md

### 17.3 Subagent selection from LSP

- **Where in the flow:** When the orchestrator is about to **select a subagent for the next node** (task or subtask), it can optionally query LSP diagnostics for **files in scope** for that node. **Decision:** Default **off**. Config key `orchestrator.lsp_subagent_bias` (bool, default false). When true, call `get_diagnostics_for_paths` and apply bias toward matching-language subagent. If any file has diagnostics (e.g. errors) from a language server X, **prefer** the subagent that matches language X (e.g. rust-analyzer → rust-engineer, pyright → python-pro).
- **"Files in scope" definition:** One of (configurable or fixed):
  - **Changed in last iteration** -- Files modified in the most recent iteration (same as LSP gate scope `"changed_files"` for consistency).
  - **Open in editor** -- Files currently open in the run/context.
  - **Node's file list** -- If the node has an explicit list of files (e.g. from PRD or plan), use that list.
  - Default: **changed in last iteration** for consistency with LSP gate.
- **Documentation:** This behavior is specified in **Plans/orchestrator-subagent-integration.md** (Subagent selection from LSP) and summarized here. Implement in the same place that performs `select_for_node`: after building node context, optionally call LSP client `get_diagnostics_for_paths(scope_paths)`; from the returned diagnostics, derive language(s) from `source` or from file extension → server id mapping; then bias subagent selection toward matching language (e.g. add to ProjectContext or NodeContext: "prefer_subagents": ["rust-engineer"] when Rust errors present).
- `Plans/orchestrator-subagent-integration.md` / `/orchestrator-subagent-integration.md` remains the owner for subagent-selection wiring; its runtime structs must carry the rewrite execution identity and concern model when LSP diagnostics bias a node.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md

Bias rules (canonical):
- LSP bias is a **tie-breaker / ranking hint**, not an absolute selector.
- Explicit plan requirements, node override lists, or hard-coded contract needs (for example `required_subagents`) take precedence over LSP bias.
- Preferred scope order is: explicit node file list -> changed files in current node -> open files.
- Default bias threshold is diagnostics with severity `Error`; implementations MAY optionally include `Warning` when configured.
- The chosen bias inputs and outcome SHOULD be persisted in run metadata or verification evidence so selection remains explainable.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md
### 17.4 Failure modes (LSP gate and diagnostics)

| Failure | Behavior | Evidence / reporting |
|---------|----------|----------------------|
| **LSP client not ready** | Gate does not run, or runs with a **skip** result. **Decision:** When LSP gate is enabled but client not ready: **skip** the criterion; set `actual: "LSP client not ready"`. Config: `lsp_gate.when_unavailable`: `skip` | `pass` | `fail`, default **skip**. Gate does not block on LSP startup. |
| **Timeout when querying diagnostics** | LspGateVerifier uses a timeout (e.g. `timeout_seconds` from config). On timeout: **fail** the criterion with `actual: "LSP diagnostics query timed out"`. Attach partial snapshot if any diagnostics were collected before timeout. |
| **No server for language** | For some files in scope there is no LSP server (e.g. unknown extension). Those files contribute **no diagnostics** (empty list). Gate passes for that file; only files with a server are checked. No special failure. |
| **Server crash or disconnected** | Same as "LSP client not ready": skip or pass per config; do not fail the entire gate unless config says "fail when LSP unavailable". |
| **Empty scope (changed_files/open/project)** | If scope resolves to zero files (e.g. no files changed), gate **passes** (nothing to check). |

ContractRef: ContractName:Plans/LSPSupport.md

Implement these in `LspGateVerifier` and in the LSP client's `get_diagnostics_for_paths` (timeout, not-ready check).
