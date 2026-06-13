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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/LSPSupport.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### LSPS-002 - MVP Scope Authority And Phasing

```yaml
plan_unit_id: LSPS-002
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP is in scope for the desktop MVP, including desktop editor integration, full LSP integration in the Chat Window, diagnostics for Assistant and Interview context, and the ordered implementation phases, while full editor implementation details remain owned by FileManager.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-002 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: mvp_scope_authority_and_phasing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0017
preserved_exact_tokens:
- LSP is MVP
- desktop MVP
- full LSP integration in the Chat Window
- LSP in the Chat Window
- Out of scope here
- Phasing
- FileManager.md
- assistant-chat-design.md
negative_constraints:
- Full editor implementation details stay in FileManager.md rather than this LSP-specific plan.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP scope and protocol/client constraints; Plans/FileManager.md owns full editor implementation details.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-003 - Authored Copy Alignment Boundary

```yaml
plan_unit_id: LSPS-003
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Authored tooltip, help, settings, and explanatory LSP copy follows the FinalGUISpec dual ELI5/Expert copy contract, while dynamic server-returned hover and diagnostic payloads are outside authored dual-copy enforcement.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-003 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: authored_copy_alignment_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0001
preserved_exact_tokens:
- ELI5/Expert copy alignment
- tooltip/help text
- FinalGUISpec.md §7.4.0
- server-returned hover/diagnostic payloads
- outside authored dual-copy enforcement
negative_constraints:
- Server-returned hover or diagnostic payloads are dynamic external content and are not authored dual-copy strings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FinalGUISpec.md owns the authored dual-copy contract; LSPSupport owns where that boundary applies to LSP surfaces.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md'
```

### LSPS-004 - Core LSP Capability Inventory

```yaml
plan_unit_id: LSPS-004
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP MVP capability inventory includes diagnostics, hover, autocomplete, navigation, inlay hints, semantic highlighting, code actions, code lens, signature help, timeout/cancellation, LSP status UI, per-server disable, fallback behavior, and diagnostics for LLM/Assistant context.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-004 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: core_lsp_capability_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0002
preserved_exact_tokens:
- Diagnostics
- Hover
- Autocomplete
- Navigation
- Inlay hints
- Semantic highlighting
- Code actions
- Code lens
- Signature help
- Request timeout and cancellation
- LSP status in UI
- Per-server enable/disable
- Fallback when LSP unavailable
- Diagnostics for LLM/Assistant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-005 - Feature Behavior Matrix And Fallback Contract

```yaml
plan_unit_id: LSPS-005
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Each LSP feature preserves its input, output, success, failure, edge-case, config-key, and fallback behavior, including timeout handling, stale-response discard, no-server behavior, and the shared fallback contract when LSP is unavailable.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-005 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: feature_behavior_matrix_and_fallback_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0003
preserved_exact_tokens:
- Feature specification (inputs, outputs, behavior)
- Inputs
- Outputs
- Success
- Failure / edge cases
- Config keys
- Fallback when LSP unavailable
- lsp.<id>.disabled
- 'lsp: false'
- lsp.hoverTimeoutMs
- lsp.completionTimeoutMs
- lsp.workspaceSymbolTimeoutMs
- stale
- Timed out
negative_constraints:
- Unavailable LSP must not fabricate diagnostics, hover, completion, or healthy semantic capability state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
```

### LSPS-006 - LSP Client Product Boundary

```yaml
plan_unit_id: LSPS-006
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Puppet Master is the LSP client and lifecycle owner for mainstream language servers, not a language-analysis engine or custom language server; default servers run as local stdio RPC processes by default, while remote workspaces use SSH placement, host-aware path mapping, and worktree-aware root resolution.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-006 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lsp_client_product_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0004
preserved_exact_tokens:
- LSP client
- language-analysis
- custom language-server
- rust-analyzer
- pyright
- gopls
- clangd
- slint-lsp
- stdio RPC processes
- /SSH
- /worktree-aware
- Semantic /symbols
- negotiated server capabilities
negative_constraints:
- PM must not act as a custom language-analysis engine for mainstream languages.
- Remote workspaces must not use a hidden local mirror as the LSP authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-007 - OpenCode Reference Input Boundary

```yaml
plan_unit_id: LSPS-007
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: OpenCode LSP documentation and behavior are retained as reference input for built-in servers, diagnostics into LLM context, config schema, custom servers, automatic download controls, and license placement notes without making OpenCode the product owner.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-007 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: opencode_reference_input_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0006
preserved_exact_tokens:
- OpenCode Does It
- opencode.ai/docs/lsp/
- LLM can interact with the codebase
- diagnostics
- 30+ languages
- OPENCODE_DISABLE_LSP_DOWNLOAD=true
- Custom servers
- intelephense/license.txt
negative_constraints: []
compatibility_only_notes:
- OpenCode findings are reference input; Puppet Master retains its own supervised host-aware client architecture.
stale_retired_dispositions: []
owner_boundary_notes:
- OpenCode docs are external reference input; Plans/LSPSupport.md owns Puppet Master LSP behavior.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-008 - Server Catalog And Shipping Posture

```yaml
plan_unit_id: LSPS-008
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP server catalog supports the OpenCode-style built-in set plus slint-lsp while separating broad discovery/config support from the out-of-box default-managed or bundled set and from legal, toolchain, download, and manual-provisioning constraints.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-008 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: server_catalog_and_shipping_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0007
preserved_exact_tokens:
- Built-in LSP servers (full table)
- slint-lsp
- Broad catalog support
- GraphQL
- Dockerfile / Docker config
- TOML
- YAML
- Markdown
- /discovery/config
- /bundles/manages
- /auto-install
- /install
- /download
- /legal
- support target
- shipping posture
negative_constraints:
- Broad catalog support does not mean every server is bundled, auto-downloaded, or managed by default.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-009 - Host Aware Root Discovery

```yaml
plan_unit_id: LSPS-009
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP root discovery resolves sessions by host, server, and root identity from file context, server heuristics, explicit overrides, and remote host roots, with fallback to the nearest .git directory only after language-specific markers fail.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-009 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: host_aware_root_discovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0008
preserved_exact_tokens:
- Root discovery
- session reuse key
- (host_id, server_id, root_identity)
- remote host roots
- MUST NOT silently attach against a hidden local mirror
- package.json
- Cargo.toml
- go.mod
- pyproject.toml
- nearest `.git`
negative_constraints:
- Remote-mode projects use remote host roots and MUST NOT silently attach against a hidden local mirror.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md'
```

### LSPS-010 - Extension Conflict Visibility

```yaml
plan_unit_id: LSPS-010
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Overlapping LSP servers are resolved through explicit selection metadata, capability-family ownership, compatible supplementary families, and user-visible effective state in Settings > LSP and status surfaces.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-010 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: extension_conflict_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0009
preserved_exact_tokens:
- selection_mode
- selection_family
- primary_priority
- context_markers
- supplementary_families
- capability_profile
- degraded_attach_rules
- Settings > LSP
- status surfaces
negative_constraints:
- Remote or degraded attach rules must be explicit; the client must not fabricate healthy capability state when a server is disabled, unavailable, or partially attached.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md'
```

### LSPS-011 - Effective ServerSpec Selection Algorithm

```yaml
plan_unit_id: LSPS-011
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Effective ServerSpec selection records selectors, file/context conditions, command/env/init options, root discovery, platform restrictions, version and position-encoding metadata, provisioning hints, lifecycle state, and the closed selection_mode vocabulary before choosing primary and supplementary attachments.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-011 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: effective_serverspec_selection_algorithm
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- ServerSpec
- language/extensions/selectors
- /extensions/selectors
- /files/conditions
- selection_mode
- standalone_primary
- contextual_primary
- supplementary_diagnostics
- standalone_diagnostics
- primary_priority
- server_id
- /specificity
- ts-js
- deno.json
- deno.jsonc
negative_constraints:
- Persisted registry values use underscore spellings rather than ad hoc short names or hyphenated storage values.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-012 - Diagnostics Source Identity And Merge Boundary

```yaml
plan_unit_id: LSPS-012
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Diagnostics integration preserves per-server source identity in storage and merges only for presentation surfaces such as Problems, editor markers, and Assistant/Interview context; diagnostics-only sidecars do not imply full completion, navigation, hover, or semantic capability.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-012 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostics_source_identity_and_merge_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- diagnostics-integration
- per `(server_id, session/root, uri)`
- Problems
- editor markers
- Assistant/Interview context
- supplementary_diagnostics
- standalone_diagnostics
- /cap/truncation
- per-server source identity
negative_constraints:
- Diagnostics integration is not a storage-flattening rule and must not erase per-server source identity.
- Diagnostics-only attachments must not imply full completion, navigation, hover, or semantic capability.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-013 - Native Client Architecture And Protocol Guardrails

```yaml
plan_unit_id: LSPS-013
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Puppet Master owns the LSP client architecture through host, supervisor, session, registry, workspace resolver, document store, sync engine, request broker, capability registry, diagnostics store, intelligence facade, and trace service, with conservative protocol lifecycle and FileSafe routing for mutation-capable edits.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-013 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: native_client_architecture_and_protocol_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- LspHost
- LspSupervisor
- LspSession
- LspSessionRegistry
- LspRegistry
- WorkspaceResolver
- DocumentStore
- DocumentSyncEngine
- LspRequestBroker
- CapabilityRegistry
- DiagnosticsStore
- LanguageIntelligenceFacade
- LspTraceService
- initialize -> initialized -> normal traffic -> shutdown -> exit
- FileSafe
- lsp-types
- tokio
- CancellationToken
negative_constraints:
- Dynamic registration stays disabled until PM can handle /unregister.
- Over-advertising unsupported snippets, resolve support, progress, workspace edit, or workspaceFolders behavior is forbidden.
- Rename, format, code action, and workspace edits always route through FileSafe.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-014 - OpenCode Compatibility Inputs And Rejections

```yaml
plan_unit_id: LSPS-014
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: OpenCode-style registry findings are compatibility input for built-in/custom definitions, stdio transport, lazy spawn, root discovery, and diagnostics into Assistant context, while full-buffer or disk resync, uncontrolled auto-downloads, process duplication, weak status visibility, and unbounded backoff are rejected.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-014 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: opencode_compatibility_inputs_and_rejections
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- OpenCode-style registry findings
- built-in and custom server definitions
- local stdio transport
- lazy spawn
- per-server root discovery
- diagnostics into Assistant context
- /full-buffer-or-disk-resync
- uncontrolled auto-downloads
- session/process duplication
- weak status visibility
- unbounded /backoff/eviction
negative_constraints:
- PM must not copy weak OpenCode behavior such as uncontrolled auto-downloads, duplicate sessions/processes, weak status visibility, or unbounded backoff.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-015 - Tool Internal Event Ownership Boundary

```yaml
plan_unit_id: LSPS-015
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP internal-tool boundaries preserve run-scoped tool event records, mutation_capable apply-edit separation, formatter-vs-LSP ownership, DAE non-triggering host writes, plugin/tool telemetry, workspace-tab routing, and resolver-priority inputs without bypassing adjacent tool subsystems.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-015 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: tool_internal_event_ownership_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- internal-tool
- run_id
- tool.invoked
- 'mutation_capable: bool'
- formatter-vs-LSP ownership
- DAE non-triggering host writes
- Formatters_System.md
- Plugins_System.md
- tool.* telemetry
- plugin tool IDs
- /workspace-tab
- multi-project routing
- apply-edit paths
- Resolver priority inputs
negative_constraints:
- Formatter, plugin, telemetry, policy, workspace-tab, multi-project, mutation-capable, and apply-edit paths must not bypass one another.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-016 - ESLint JS TS Reinforced Support

```yaml
plan_unit_id: LSPS-016
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: ESLint is reinforced as the primary lint and diagnostics LSP for ECMAScript/JavaScript and common TypeScript/Vue projects, with v10 flat-config root discovery, Problems/Assistant diagnostics integration, and JavaScript/TypeScript preset alignment.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-016 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: eslint_js_ts_reinforced_support
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0011
preserved_exact_tokens:
- ESLint
- ECMAScript/JavaScript
- ESLint v10
- flat config only
- eslint.config.js
- eslint.config.mjs
- eslint.config.ts
- 'Node.js: ^20.19.0, ^22.13.0, or >=24'
- VS Code ESLint server
- Problems panel
- LLM/Assistant context
- JavaScript/TypeScript preset
negative_constraints:
- Do not rely on legacy .eslintrc* for ESLint v10 projects.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-017 - Slint LSP Support

```yaml
plan_unit_id: LSPS-017
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Because the GUI rewrite is Rust plus Slint, slint-lsp is included for .slint files with diagnostics, completion, goto definition, live-preview, formatting support, PATH-based command availability, and Settings > LSP toggles/configuration.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-017 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: slint_lsp_support
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0012
preserved_exact_tokens:
- Rust + Slint
- slint-lsp
- .slint
- stdio
- Diagnostics
- code completion
- goto definition
- live-preview
- Code formatting
- cargo install slint-lsp
- Settings > LSP
negative_constraints:
- slint-lsp has no special command-line arguments; editors spawn the binary and use LSP over stdio.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-018 - OpenCode Server Ts Lazy Spawn Model

```yaml
plan_unit_id: LSPS-018
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: OpenCode server.ts remains an implementation reference for id/extensions/root/spawn registry shape, nearest-root discovery, one supervised process per host/server/root identity, lazy spawn, initialize handshake, config overrides, env, and initialization options.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-018 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: opencode_server_ts_lazy_spawn_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0013
preserved_exact_tokens:
- packages/opencode/src/lsp/server.ts
- id
- extensions[]
- root(file, host_context) -> root identity
- spawn(session_key)
- NearestRoot
- one process per effective host/root identity
- Lazy spawn
- initialize handshake
- initializationOptions
negative_constraints:
- The supervised session key remains host-aware even when OpenCode examples use a simpler discovered-root key.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-019 - Rust Client Stack Baseline

```yaml
plan_unit_id: LSPS-019
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The GUI-side LSP client baseline uses lsp-types plus an evaluated async stdio client stack, with tower-lsp and lsp-server style crates reserved for optional custom-server use rather than the desktop client foundation.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-019 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: rust_client_stack_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0014
preserved_exact_tokens:
- Rust Stack (Client Side)
- lsp-types
- lsp-client
- async_lsp_client
- lsp-client-rs
- stdio
- tower-lsp
- lsp-server
- GUI-side client foundation
negative_constraints:
- tower-lsp and lsp-server are server-oriented and rejected as GUI-side client foundations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-020 - Editor DocumentStore And FileSafe Boundary

```yaml
plan_unit_id: LSPS-020
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The editor integrates LSP through a shared authoritative document store, sync barriers, document-scoped request gating, and FileSafe-backed workspace edit paths for rename, format, and code actions while preserving Search, diff/review, and chat restore ownership outside LSP.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-020 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_documentstore_and_filesafe_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0015
preserved_exact_tokens:
- shared authoritative document store
- sole authority for open-document text
- sync barriers
- stale document versions
- workspace edits
- FileSafe-backed mutation path
- LSP never becomes the owner of Search, diff/review, or chat restore semantics
negative_constraints:
- LSP never becomes the owner of Search, diff/review, or chat restore semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-021 - Editor UI Fallback Search And Index Separation

```yaml
plan_unit_id: LSPS-021
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Editor UI integration routes breadcrumbs, outline, symbols, hover, references, code actions, diagnostics, Problems, status copy, fallback navigation, code index, Search, and grep terminology through distinct owners so degraded LSP never masquerades as healthy semantic intelligence.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-021 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_ui_fallback_search_and_index_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0015
preserved_exact_tokens:
- breadcrumbs
- outline
- go-to-symbol
- hover
- references
- code actions
- Problems
- fallback navigation/index behavior
- code index remains a SEPARATE /state-owning subsystem from LSP
- Search remains text-first
- grep
- Status-bar /search-language copy
negative_constraints:
- Fallback navigation/index behavior must not masquerade as healthy LSP state.
- Search remains text-first and must not become a second default symbol browser.
- grep and Search regex acceleration must not be labeled as LSP symbol health.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-022 - Rewrite Era LSP Consumer Routing

```yaml
plan_unit_id: LSPS-022
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Rewrite-era LSP consumers route stale FileManager references, Orchestrator/Tiers compatibility wording, storage/runtime identity, widget layout compatibility, event/addendum supersession, runtime artifacts, Crosswalk/Decision_Log traceability, and project status labels through current owner docs rather than preserving stale ownership.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-022 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: rewrite_era_lsp_consumer_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0015
preserved_exact_tokens:
- Stale references to `FileManager.md §12.1.4`
- current FileManager §10 navigation/fallback contract
- Orchestrator_Page.md
- Tiers
- compatibility inputs only
- widget_layout:v1:orchestrator:progress
- Event/addendum supersession
- Runtime_Artifacts_Panel.md
- Decision_Log.md
- Crosswalk.md
- Project /status labels
negative_constraints:
- Cross-doc LSP consumers must not inherit stale Orchestrator UI ownership or tier-keyed widgets as concrete LSP presentation owners.
- Project health/status, code-index state, LSP attach state, and runtime capability state remain separate.
compatibility_only_notes:
- Legacy FileManager section references and Tiers/task/subtask vocabulary are compatibility inputs only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-023 - Chat LSP Capability And Placement

```yaml
plan_unit_id: LSPS-023
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat LSP provides read-only language-intelligence features in chat and assistant context when a thread has an associated project with running LSP servers, using editor server instances, real file URIs or virtual documents, degraded-state disclosure, Problems placement, status-bar health, and chat as a context/navigation consumer.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-023 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: chat_lsp_capability_and_placement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0016
preserved_exact_tokens:
- Chat LSP
- read-only intelligence
- associated project
- LSP servers running
- code blocks
- virtual-document contract
- /Problems
- status-bar indicator
- chat is a context/navigation consumer
- Problems footer link
- /remote/status/chat
negative_constraints:
- Chat LSP is read-only for MVP and does not spawn a separate chat-only server pool.
- Chat is not another diagnostics owner.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-024 - Diagnostic To Chat Payload And Mutation Boundary

```yaml
plan_unit_id: LSPS-024
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Diagnostic-to-chat packaging uses the same diagnostic entry shape as the LSP evidence schema with session and URI refs; any later quick fix, code action, rename, or workspace edit from chat must open preview/confirmation and apply only through FileSafe-backed workspace/applyEdit.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-024 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostic_to_chat_payload_and_mutation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0016
preserved_exact_tokens:
- Diagnostic-to-chat pipeline behavior
- to-chat
- path
- line
- character
- severity
- message
- source
- code
- Error
- Warning
- Info
- Hint
- read-only for MVP
- preview/confirmation
- workspace/applyEdit
negative_constraints:
- Chat diagnostic context must not mutate directly from the message; later mutation workflows require explicit preview/confirmation and FileSafe-backed workspace/applyEdit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-025 - Registration Before Spawn Invariant

```yaml
plan_unit_id: LSPS-025
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: An LSP server is registered in the session map before its process is spawned; asynchronous startup registers a cancellable lifecycle-tracker before subprocess creation or watcher launch, and spawn or handshake failure marks or cleans up the session record.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-025 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: registration_before_spawn_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0019
preserved_exact_tokens:
- Registration-before-spawn invariant
- MUST be registered
- (host_id, server_id, root_identity)
- lifecycle-tracker
- starting
- ready
- failed
- Acquire the session-map write lock
- Spawn the subprocess
negative_constraints:
- Spawning before registration is forbidden because it creates an untracked process window.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md'
```

### LSPS-026 - Server Failure Timeout Recovery UI

```yaml
plan_unit_id: LSPS-026
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP failure and timeout handling marks server state, clears diagnostics for owned documents, refreshes Problems and gutter, shows Error or Waiting states in status surfaces, offers restart behavior with bounded backoff, logs stderr details, and never blocks the UI thread.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-026 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: server_failure_timeout_recovery_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
preserved_exact_tokens:
- Server crash or exit
- Error
- DiagnosticsCache
- Problems panel
- gutter
- Restart language server
- 1s, 2s, 4s, cap 30s
- Server slow or unresponsive
- Timed out
- Waiting for language server...
- never block UI thread
- stderr tail
negative_constraints:
- LSP requests must never block the UI thread.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-027 - Document Scale And Sync Pressure Controls

```yaml
plan_unit_id: LSPS-027
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP client controls scale pressure by limiting open documents per server, sending didClose on buffer eviction, capping initialize roots, debouncing didChange at the default interval, preferring incremental contentChanges when supported, and avoiding thousands of initialize paths.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-027 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: document_scale_and_sync_pressure_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
preserved_exact_tokens:
- Many open documents
- max 50 open docs per server
- didClose
- Large workspace at init
- capped at 10
- do not send thousands of paths
- didChange flood
- 100 ms
- contentChanges
- full content
negative_constraints:
- Initialize must not send thousands of paths.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-028 - FileManager Fallback Symbol Boundary

```yaml
plan_unit_id: LSPS-028
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: When LSP diagnostics and symbols are unavailable, FileManager remains responsible for regex, heuristic, or indexed fallback symbol navigation and optional install hints, while the LSP client does not own the symbol index path.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-028 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: filemanager_fallback_symbol_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
preserved_exact_tokens:
- Symbol index staleness (without LSP)
- FileManager §10.2
- Diagnostics and symbols come from server
- regex/heuristic symbol path
- optional install hint
- 'Client: No action for index'
- fallback is editor/FileManager responsibility
negative_constraints:
- Fallback symbol behavior must not claim healthy LSP diagnostics or semantic symbol state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FileManager.md owns fallback symbol navigation; Plans/LSPSupport.md owns the LSP unavailable boundary.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-029 - Stdio Bridge TCP Boundary

```yaml
plan_unit_id: LSPS-029
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The MVP LSP client speaks stdio only; TCP-only servers such as Godot are supported through custom stdio bridge commands like godot-lsp-stdio-bridge, while native TCP/socket support remains out of scope for MVP.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-029 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: stdio_bridge_tcp_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0022
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0024
preserved_exact_tokens:
- TCP-only servers
- Godot
- GDScript LSP
- npx godot-lsp-stdio-bridge
- .gd
- .gdshader
- stdio-to-TCP bridge
- Binary-safe buffers
- auto port discovery
- 6005, 6007, 6008
- Windows URI normalization
- Native TCP/socket
- Out of scope for MVP
- use a bridge
negative_constraints:
- Native TCP/socket support is out of scope for MVP.
- The MVP client does not implement TCP transport; it documents bridge usage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-030 - MVP Operation Inventory And Result Envelope

```yaml
plan_unit_id: LSPS-030
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The canonical MVP LSP surface preserves its operation inventory, normalized parameter fields, and result status envelope using operation, query, path, position, newName, status, and the ok, partial, unavailable, or error status values.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-030 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: mvp_operation_inventory_and_result_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0021
preserved_exact_tokens:
- operation
- query
- path
- position
- newName
- status
- ok | partial | unavailable | error
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
negative_constraints:
- Stale aliases, short names, or ad hoc result envelopes are retired in favor of the canonical status envelope.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale aliases, short names, or ad hoc result envelopes are retired in favor of LSPSupport §9.
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-031 - Rename Alias And Approval Gate

```yaml
plan_unit_id: LSPS-031
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The write-capable rename operation is approval-gated, requires path, position, and newName, and treats lsp_rename as a legacy alias for rename rather than a second operation over the nine read-only operation surface.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-031 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: rename_alias_and_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0021
preserved_exact_tokens:
- nine read-only operations
- one write/approval-gated `rename`
- lsp_rename
- legacy alias
- not a second operation
- path + position + newName
- approval-gated
negative_constraints:
- lsp_rename must not become a second operation distinct from rename.
- rename is write-capable and approval-gated.
compatibility_only_notes: []
stale_retired_dispositions:
- The packetization label `10 read-only + 1 write-gated (lsp_rename)` is reconciled by treating `lsp_rename` as a legacy alias.
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-032 - Phase 1 Core LSP Outcome

```yaml
plan_unit_id: LSPS-032
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 1 ships the core LSP client, server registry, document sync, diagnostics, hover, completion, Problems integration, status UI, and explicit fallback behavior as the foundation before navigation and chat enhancements.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-032 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_1_core_lsp_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Phase 1 -- Core LSP
- Rust LSP client crate
- Server registry
- Document sync
- didOpen / didChange
- Diagnostics
- Problems panel
- Hover
- Completion
- LSP status in UI
- Fallback when LSP unavailable
- Phase 1 outcome
negative_constraints:
- Phase 1 must retain explicit fallback behavior when no server is available.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-033 - Phase 2 Editor Chat Settings Outcome

```yaml
plan_unit_id: LSPS-033
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 adds editor navigation and editing features, inlay and semantic features, code actions and code lens, signature help, timeout/cancellation, per-server enable/disable, Settings > LSP, bridge pattern, Chat LSP, and diagnostics for Assistant/Interview context.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-033 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_editor_chat_settings_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Phase 2 -- Editor navigation + Chat LSP
- textDocument/references
- Find references
- Rename with FileSafe
- textDocument/formatting
- Inlay hints
- semantic highlighting
- code actions
- code lens
- signature help
- Settings > LSP
- Chat LSP
- Diagnostics for LLM/Assistant
- Phase 2 outcome
negative_constraints:
- Rename and formatting use FileSafe-backed paths rather than direct mutation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-034 - Phase 3 Optional Evidence And Chat Enhancements

```yaml
plan_unit_id: LSPS-034
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 3 optional enhancements may add the LSP diagnostics verification gate, LSP snapshot in evidence, chat fix/rename/usage/format affordances, lsp tool promotion, and advanced protocol requests without moving optional work into MVP foundations.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-034 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_optional_evidence_and_chat_enhancements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Phase 3 -- Additional enhancements (§9.1)
- LSP diagnostics verification gate
- LSP snapshot in evidence
- Chat "Fix all"
- Rename
- Where is this used?
- Format file
- promote lsp tool
- Go to type definition
- call hierarchy
- document highlight
- Interview "structure of file"
negative_constraints:
- Optional Phase 3 enhancements must not be treated as required before the MVP LSP foundation and Phase 2 surfaces.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-035 - Implementation Checklist Non Executable Guide

```yaml
plan_unit_id: LSPS-035
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The implementation checklist is an ordered non-executable guide that preserves LSP feature and edge-case inventory without creating WorkNodes, queues, node manifests, or production build tasks.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-035 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: implementation_checklist_non_executable_guide
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Implementation checklist
- Choose and integrate Rust LSP client crate
- Implement server registry
- Document sync
- Diagnostics
- Hover
- Completion
- Navigation
- Inlay hints
- Semantic highlighting
- Code actions
- Code lens
- Signature help
- Request timeout and cancellation
- Per-server enable/disable
- Additional enhancements (§9.1)
negative_constraints:
- The checklist is not a WorkNode, NodeSeed, executable queue, final node manifest, or production build task.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-036 - Settings LSP Registry Controls

```yaml
plan_unit_id: LSPS-036
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Settings > LSP is a searchable registry-management surface with global enable/disable, support-catalog search and filtering, per-server toggles, custom server add/edit/remove, command/config validation, and requested versus effective attach-state disclosure.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-036 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: settings_lsp_registry_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0028
preserved_exact_tokens:
- Settings > LSP
- searchable registry-management surface
- globally enable or disable LSP
- search and filter the full support catalog
- enable or disable catalog entries
- add custom servers
- requested vs effective attach state
- Settings > LSP lists all servers and custom entries with validation
- global master toggle
- /filterable
- add custom server /form
- malformed command/config validation
negative_constraints:
- Settings > LSP is not a flat toggle list.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-037 - Registry Row Inspector Metadata

```yaml
plan_unit_id: LSPS-037
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP registry rows and inspector detail panes expose languages, selectors, source and classification badges, install/toolchain provenance, effective state, path/exclusion controls, built-in override and reset actions, canonical names, aliases, provisioning, platform, command/env/init fields, and validation errors.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-037 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: registry_row_inspector_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0028
preserved_exact_tokens:
- /languages
- /selectors
- Microsoft
- OpenCode
- PM
- Custom
- Default managed
- Manual/toolchain
- Experimental
- /install
- /toolchain
- /effective-state
- Override
- Reset to catalog defaults
- two-level Settings navigation model
- /filtering
- /filter/grouping
- lifecycle state
- /provisioning
- platform restrictions
- validation errors
negative_constraints:
- Settings detail panes must not become the SSOT for runtime attachment.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-038 - Cross Surface LSP Owner Boundaries

```yaml
plan_unit_id: LSPS-038
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: File Manager and editor consume LSP state for semantic affordances, Search remains owner of text search and replace-in-files, Problems remains owner of aggregated diagnostics display, and status surfaces disclose freshness, health, and effective capability state.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-038 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: cross_surface_lsp_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0028
preserved_exact_tokens:
- File Manager and editor consume LSP state
- Search remains the owner of text search and replace-in-files
- Problems remains the owner of aggregated diagnostics display
- status surfaces disclose freshness, health, and effective capability state
- degraded attach conditions
negative_constraints:
- LSP must not take ownership of Search text search/replace-in-files or Problems aggregation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FileManager.md and editor surfaces consume LSP state; Search and Problems retain their own owner boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-039 - Worktree Root Identity Lifecycle

```yaml
plan_unit_id: LSPS-039
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP sessions for worktree files are keyed by host, server, and canonical on-host worktree root_identity; worktree sessions may warm-start, shut down when the worktree is removed, and remain alive across thread switches until the worktree lifecycle ends.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-039 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: worktree_root_identity_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0030
preserved_exact_tokens:
- Worktree root_identity handling
- (host_id, server_id, root_identity)
- canonical on-host worktree path
- root_identity = worktree_path
- warm-start
- worktree is removed
- shut down gracefully
- Switching threads does NOT kill LSP sessions
- session lifecycle is tied to worktree existence
negative_constraints:
- A worktree LSP root_identity must not use a raw path copied across hosts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md'
```

### LSPS-040 - Remote SSH Stdio Transport

```yaml
plan_unit_id: LSPS-040
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Remote LSP uses SSH as a stdio tunnel rather than a port-forwarded secondary protocol, spawning remote servers through the SSH connection, multiplexing channels, reinitializing after reconnect, applying a remote timeout multiplier, and avoiding hidden local sync or mirror behavior.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-040 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_ssh_stdio_transport
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Remote LSP over SSH transport
- stdio over SSH
- rather than exposed by port forwarding
- SSH connection established → remote LSP server spawned → stdio streams connected → initialize handshake → ready
- multiplexed channels
- re-initialized
- timeout multiplier
- default `3x`
- no hidden local sync or mirror
negative_constraints:
- Remote LSP does not use a port-forwarded secondary protocol or hidden local sync/mirror for LSP operations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-041 - Remote Identity And Path Mapping

```yaml
plan_unit_id: LSPS-041
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Remote LSP identity preserves user-visible SSH authority, remote-host and working-folder path authority, host-scoped path mapping, and live host/server/root session keys while forbidding hidden mirrors, silent multi-context retargeting, and local-only session-key collisions.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-041 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_identity_and_path_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- user@host:/path/to/project
- /path/to/project
- remote project identity
- remote-host
- working-folder
- user@host:remote/path
- must not create a hidden local `/mirror`
- must not silently retarget `/multi-context` work
- visible `/risk` reason
- stale local-only phrase `(server_id, root)`
- (host_id, server_id, root_identity)
- host-scoped `/path-mapping`
negative_constraints:
- Puppet Master must not create a hidden local mirror, silently retarget multi-context work to local host, or let host-local URI collisions occur.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-042 - Remote Degraded UX And SSH Owner Boundary

```yaml
plan_unit_id: LSPS-042
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Remote LSP degraded and connection-loss states follow FileManager and SSH owner patterns by showing Connection lost, Reconnect, Work offline when a validated cache exists, system keychain/agent credential handling, Settings > SSH capability/degraded copy, and shared read-only/offline vocabulary.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-042 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_degraded_ux_and_ssh_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Connection lost
- Reconnect
- Work offline (cached files only)
- validated cache
- system keychain/agent flows
- ssh_connections
- current SSH remote profile model
- one-auto-retry
- Settings > SSH
- /read-only/offline/refresh
- /offline/degraded
- /enabled
- unavailable vocabulary
negative_constraints:
- Settings > SSH and GUI remote-editor surfaces consume the SSH owner contract instead of redefining it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-043 - Remote Mutation Outage And FileSafe Boundary

```yaml
plan_unit_id: LSPS-043
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: 'Remote LSP mutation and outage modes remain visible and FileSafe-gated: rename, broad format, and multi-file code actions require preview confirmation; partial failures report per-file results; remote modes disclose full, diagnostics-only, or no-LSP state; adjacent Search, Source Control, Problems, buffers, and diffs do not silently fall back.'
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-043 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_mutation_outage_and_filesafe_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Remote mutation and availability modes
- preview `/confirmation`
- partial workspace-edit failure reports per-file results
- read-only, locked, unavailable, or `/degraded`
- full_remote_lsp
- degraded_remote_diagnostics_only
- remote_edit_no_lsp
- unsupported local-LSP-on-remote-paths
- must not silently fall back to local Git
- stale snapshots
- /offline/pending-sync
- Hunk-level `/diff` interaction
negative_constraints:
- Remote Source Control must not silently fall back to local Git.
- Preview-worthy remote mutations require the same safe preview/confirmation path as FileSafe edits.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-044 - Stale Browser And Recovery Exclusion

```yaml
plan_unit_id: LSPS-044
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: 'Browser preview and recovery residue must not re-enter LSP wording: browser-panel tokens stay owned by FileManager, FinalGUISpec, or storage cleanup, while recover-unsaved remains an editor/storage recovery contract outside the LSP session key.'
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-044 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: stale_browser_and_recovery_exclusion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Bottom Panel Browser tab (§7.20)
- preview_mode = browser_panel
- preview_mode
- recover-unsaved
- editor/storage recovery contract
- outside the LSP session key
negative_constraints:
- Browser and recovery residue must not be reintroduced through LSP wording.
compatibility_only_notes:
- Browser-panel and preview_mode tokens are compatibility cleanup residue owned outside LSPSupport.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-045 - Editor Crate LSP Module Layout

```yaml
plan_unit_id: LSPS-045
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP client and registry live in the same crate as the editor under a dedicated src/lsp module with client, registry, session/server_handle, document/sync files and lsp-types plus tokio dependencies, while tower-lsp is unnecessary unless implementing a server.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-045 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_crate_lsp_module_layout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0032
preserved_exact_tokens:
- same crate as the editor
- src/lsp/
- client.rs
- registry.rs
- session.rs
- server_handle.rs
- document.rs
- sync.rs
- lsp-types
- tokio
- No need for tower-lsp unless implementing a server
negative_constraints:
- tower-lsp is not required for the GUI-side LSP client unless Puppet Master implements an LSP server.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-046 - LSP Data Projection Shapes

```yaml
plan_unit_id: LSPS-046
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Core LSP conceptual structures preserve LspSessionKey, LspSessionProjection, and DocumentBinding fields for project, host, server, root, lifecycle, freshness, health, enablement, capability, restart, error, path, version, and attached server identity.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-046 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lsp_data_projection_shapes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0033
preserved_exact_tokens:
- LspSessionKey
- project_id
- host_id
- server_id
- root_identity
- LspSessionProjection
- lifecycle_state
- freshness
- health
- requested_enabled
- effective_enabled
- capability_summary
- restart_budget
- last_error
- DocumentBinding
- document_id
- version
- attached_servers[]
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-047 - Lifecycle State Machine And Resource Limits

```yaml
plan_unit_id: LSPS-047
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP lifecycle uses canonical user/state names and lower-level state transitions from stopped through ready, degraded, stopping, crashed, and restart, with resource limits for server memory and request CPU time.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-047 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lifecycle_state_machine_and_resource_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0033
preserved_exact_tokens:
- Starting
- Initializing
- Ready
- RestartBackoff
- Degraded
- ShuttingDown
- Stopped
- stopped → starting → initializing → ready → degraded → stopping → crashed
- max 3 attempts
- 2s/4s/8s
- 512MB
- 30s
negative_constraints:
- Only Ready emits normal feature traffic; degraded and restart states expose reduced capability or recovery status.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-048 - Supervisor DocumentStore Authority

```yaml
plan_unit_id: LSPS-048
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LspSupervisor plus DocumentStore is the authority boundary for document panes, editor tabs, chat virtual documents, restore/reload, revert, pending-sync state, virtual/real URI identity, and didSave emission after successful shared-store save.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-048 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: supervisor_documentstore_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0033
preserved_exact_tokens:
- LspSupervisor
- DocumentStore
- /document-pane
- editor tabs
- chat virtual documents
- restore/reload
- /revert
- same authoritative buffer
- pending-sync state
- virtual-doc and real-file URI values do not collide
- didSave is emitted only after the shared document store records a successful save
negative_constraints:
- LSP never reads a second document authority for an open file.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-049 - Async Message Flow And UI Dispatch

```yaml
plan_unit_id: LSPS-049
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP message flow covers open, edit, diagnostics, hover, and completion while keeping all protocol I/O on async tasks and routing UI updates through the Slint event loop rather than blocking the interface.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-049 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: async_message_flow_and_ui_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- User opens file
- User edits
- publishDiagnostics
- User hovers
- User triggers completion
- tokio
- slint::invoke_from_event_loop
- Weak::upgrade_in_event_loop
- Never block UI on LSP
negative_constraints:
- UI must never block on LSP protocol I/O.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-050 - Stale Latest Request Contract

```yaml
plan_unit_id: LSPS-050
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Document-scoped LSP responses carry enough identity to discard stale or superseded replies by session epoch, URI, document version, request generation, and request class; discarded UX replies remain trace-visible and are not automatically re-requested.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-050 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: stale_latest_request_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- Stale response policy
- document_version
- session_epoch
- uri
- request_generation
- latest-of-class marker
- discard
- Do not automatically re-request
- trace `/logs`
- request id
negative_constraints:
- Stale document-scoped responses must not update UI, apply completion, navigate, or auto re-request.
compatibility_only_notes: []
stale_retired_dispositions:
- Late replies are discarded in UX but remain visible in trace logs.
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-051 - DocumentUri And Position Encoding Contract

```yaml
plan_unit_id: LSPS-051
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Document identity, freshness, and position conversion use one canonical DocumentUri per document and host, a centralized position-mapping layer, UI 1-based and LSP 0-based boundaries, negotiated position encoding with UTF-16 baseline, and no handler-local code-unit math.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-051 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: documenturi_and_position_encoding_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- DocumentUri
- case
- /slash/drive-letter
- URI spelling
- /path/position
- UI/editor surfaces stay 1-based
- LSP boundary remains 0-based
- position-mapper
- capabilities.positionEncoding
- position_encoding
- UTF-16
- utf-8
- no hand-rolled code-unit math
negative_constraints:
- The same physical file must not gain duplicate identities through case, slash, drive-letter, URI spelling, session/URI pairing, or path/position conversion differences.
- Individual feature handlers must not hand-roll code-unit math.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-052 - Sync Ordering Coalescing And Save Semantics

```yaml
plan_unit_id: LSPS-052
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Sync ordering is FIFO per session, document-scoped requests wait for Ready and sync barriers, soft requests keep only the newest request class, didChange debounce coalesces mutations, whole-document replacement or restart rebases when incremental confidence is lost, and failed saves do not emit didSave or imply synchronization.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-052 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: sync_ordering_coalescing_and_save_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- Sync events are FIFO per session
- Ready
- pending-sync state
- newest pending request per document `/request-class`
- definition, references, rename, format, and `codeAction`
- sync barrier
- resetting `/coalescing`
- whole-document replacement
- restart the session
- Failed save does not emit `didSave`
negative_constraints:
- Failed save does not emit didSave and stale-result handling must not make the UI look saved or synchronized.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-053 - Config Namespace And Legacy Alias

```yaml
plan_unit_id: LSPS-053
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP config uses lsp.enabled and lsp.servers.<id>.* keys for disable, command, extensions, env, and initialization while supporting lsp.<id>.disabled as a read/write compatibility alias aligned with OpenCode schema.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-053 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: config_namespace_and_legacy_alias
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0035
preserved_exact_tokens:
- lsp.enabled
- lsp.servers.<id>.disabled
- lsp.servers.<id>.command
- lsp.servers.<id>.extensions
- lsp.servers.<id>.env
- lsp.servers.<id>.initialization
- lsp.<id>.disabled
- read/write maps
- OpenCode schema
negative_constraints:
- The legacy alias must map to the canonical lsp.servers.<id>.disabled namespace rather than creating a second config family.
compatibility_only_notes:
- lsp.<id>.disabled is a legacy compatibility alias.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-054 - Config Storage And Timeout Controls

```yaml
plan_unit_id: LSPS-054
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP configuration stores app-level and optional project-level overrides with debounced change, hover, completion, workspace symbol, and hover-delay timeout controls documented in Settings or developer-facing implementation guidance.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-054 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: config_storage_and_timeout_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0035
preserved_exact_tokens:
- redb
- config.lsp
- .puppet-master/lsp.json
- lsp.didChangeDebounceMs
- default 100
- range 50-500
- lsp.hoverTimeoutMs
- default 5000
- lsp.completionTimeoutMs
- lsp.workspaceSymbolTimeoutMs
- default 10000
- lsp.hoverDelayMs
- default 300
- range 100-1000
- Settings → Editor or Developer
negative_constraints:
- Timeout and debounce defaults must remain user-configurable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-055 - Trigger And Refresh Behavior

```yaml
plan_unit_id: LSPS-055
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP triggers and refresh behavior cover completion trigger kinds, hover idle delay and cancellation, inlay hint refresh on document activity or visible range, code action requests from UI affordances with diagnostics context, and signature help trigger behavior.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-055 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: trigger_and_refresh_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0036
preserved_exact_tokens:
- Completion
- all characters
- Ctrl+Space
- CompletionContext
- triggerKind
- Hover
- 300 ms
- cancel previous hover request on cursor move
- Inlay hints
- visible range change
- Code actions
- context menu open
- lightbulb click
- CodeActionContext
- Signature help
negative_constraints:
- Hover requests must be delayed and canceled on cursor movement to avoid flooding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-056 - workspaceFolders Initialize Policy

```yaml
plan_unit_id: LSPS-056
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: workspaceFolders initialization sends only roots with at least one open document, capped at ten roots, with single-root fallback when no files are open and no required reinitialize when later opening files in a new root.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-056 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: workspacefolders_initialize_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0037
preserved_exact_tokens:
- workspaceFolders policy
- only roots that have at least one open document
- capped at 10 roots
- If user has no open files, send project root if single-root, else empty list
- Re-initialize not required
- matching host-aware server session
negative_constraints:
- Initialize should not send broad workspaceFolders beyond the open-document root cap.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-057 - Chat Virtual Document Identity And Creation

```yaml
plan_unit_id: LSPS-057
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat code blocks not backed by project files use dedicated virtual-document URIs, one opaque block identity, language tags, and the effective host/root LSP session for that language; code blocks mapped to real project files use the real file URI instead.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-057 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: chat_virtual_document_identity_and_creation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0038
preserved_exact_tokens:
- Virtual documents (Chat code blocks)
- puppet-master-virtual://chat/{language_id}/{opaque_id}
- language_id
- opaque_id
- UUID or message-id + block index
- real file URI
- same `(host_id, server_id, root_identity)`
- effective host context
- textDocument/didOpen
negative_constraints:
- Virtual URI never points to disk and real project-file snippets use the real file URI instead.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-058 - Chat Virtual Document Lifecycle And Immutability

```yaml
plan_unit_id: LSPS-058
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat virtual documents send didOpen only when a block needs LSP, send didClose on view eviction or idle cleanup, may retain a small recent set, do not send didChange for immutable blocks, and create a new opaque identity when edited content changes.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-058 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: chat_virtual_document_lifecycle_and_immutability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0038
preserved_exact_tokens:
- didOpen
- didClose
- scrolls away
- message is collapsed
- Chat view is closed
- 300 s
- last 5
- Do not send `didChange` for virtual docs
- blocks are immutable
- new opaque_id
- one virtual doc per code block instance
negative_constraints:
- Virtual document blocks are immutable for LSP sync; edited message content is treated as a new block identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-059 - ServerSpec Minimum Field Set

```yaml
plan_unit_id: LSPS-059
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: ServerSpec is the canonical machine-friendly catalog record for built-in and custom LSP servers and includes server identity, provenance, language selectors, platform/requirement/root rules, selection metadata, support classification, enablement, provisioning, launch, initialization, host support, and degraded attach fields.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-059 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: serverspec_minimum_field_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0039
preserved_exact_tokens:
- ServerSpec
- server_id
- display_name
- sources[]
- source_names[]
- aliases[]
- kind
- language_tags[]
- extensions[]
- selectors[]
- file_globs[]
- platforms[]
- requirements[]
- root_rules
- root_discovery_mode
- selection_mode
- selection_family
- primary_priority
- support_classification
- host_support
- degraded_attach_rules
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-060 - Catalog Union And Layering SSOT

```yaml
plan_unit_id: LSPS-060
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The effective support catalog is the deduplicated union of Microsoft implementor data, OpenCode catalog data, and Puppet Master overlay metadata; user enablement and custom server settings layer on top, and generated readable/settings/docs views do not replace the registry SSOT.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-060 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: catalog_union_and_layering_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0039
preserved_exact_tokens:
- deduped union
- Microsoft implementor data
- OpenCode catalog data
- Puppet Master overlay metadata
- user enable/disable
- custom-server settings layer on top
- derived prose tables
- /readable
- /settings/docs
- SSOT
negative_constraints:
- Derived prose tables and settings/docs views must not become the catalog SSOT.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-061 - Support Classification And Effective Resolution

```yaml
plan_unit_id: LSPS-061
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Support classification stays separate from server identity and effective state, using supported-by-registry, default-managed, toolchain-bound/manual, experimental/degraded, and deprecated/replaced outcomes layered through catalog base, global override, project override, runtime availability, and effective-state evaluation.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-061 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: support_classification_and_effective_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0039
preserved_exact_tokens:
- Support scope and support classification
- /catalog
- supported-by-registry
- default-managed
- toolchain-bound `/manual`
- experimental `/degraded`
- deprecated or `/replaced`
- catalog base entry
- global override
- project override
- runtime availability
- /effective-state
negative_constraints:
- Support classification outcomes must not fork stable server_id identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-062 - Implementation Foundation Lifecycle And Sync
```yaml
plan_unit_id: LSPS-062
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The implementation phase guide requires a foundation with client crate integration, in-memory registry, config loading, spawn/lifecycle, stdio transport, initialize handshake, shutdown/exit, and document sync with debounce, versioning, didClose, didSave, and incremental sync when supported.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-062 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: implementation_foundation_lifecycle_and_sync
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Foundation
- Spawn and lifecycle
- Document sync
- LSP client crate integrated
- server registry (in-memory)
- config loading
- Spawn server process per (id, root)
- stdio transport
- initialize handshake
- shutdown/exit
- didOpen
- didChange (debounced)
- didClose
- didSave
- version tracking
- incremental sync
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-063 - Diagnostics Problems And Gutter Acceptance
```yaml
plan_unit_id: LSPS-063
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Diagnostics implementation subscribes to publishDiagnostics, stores diagnostics per URI, exposes them to the UI, and accepts completion when Problems shows errors and warnings, gutter markers render, and clicking opens the file at the diagnostic line.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-063 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostics_problems_and_gutter_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Diagnostics
- publishDiagnostics
- store per URI
- expose to UI
- Problems tab
- errors/warnings
- gutter shows markers
- click opens file at line
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-064 - Hover Completion Navigation Acceptance
```yaml
plan_unit_id: LSPS-064
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Hover, completion, documentSymbol, definition, references, breadcrumbs, and go-to-symbol features use LSP when available, enforce timeout/cancel/stale handling, and accept completion when hover, completion, breadcrumbs, symbol, and definition navigation work correctly.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-064 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: hover_completion_navigation_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Hover and completion
- textDocument/hover
- textDocument/completion
- timeout and cancel
- tooltip
- completion list
- stale responses discarded
- Navigation
- documentSymbol
- textDocument/definition
- references
- breadcrumbs
- go-to-symbol
negative_constraints:
- Stale hover/completion/navigation responses must be discarded.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-065 - Editor Semantic Feature Acceptance
```yaml
plan_unit_id: LSPS-065
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Inlay hints, semantic tokens, signature help, code actions, and code lens render or invoke through editor affordances, with code actions and workspace edits routed through FileSafe-backed workspace/applyEdit.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-065 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_semantic_feature_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Inlay hints
- semantic tokens
- signature help
- Code actions and code lens
- codeAction
- codeLens
- workspace/applyEdit through FileSafe
- Quick fixes appear and apply correctly
- code lens links invoke
negative_constraints:
- Code actions and workspace edits must route through FileSafe-backed workspace/applyEdit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-066 - Status Fallback Acceptance
```yaml
plan_unit_id: LSPS-066
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Status and fallback behavior show LSP state in the status bar, honor per-server enable/disable, use heuristic fallback when no server is available, and may show optional install hints without claiming healthy LSP capability.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-066 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: status_fallback_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Status and fallback
- LSP status in status bar
- per-server enable/disable
- fallback to heuristic
- optional install hint
- Status bar shows server state
- disabling server stops LSP
- heuristic outline used when LSP off
negative_constraints:
- Fallback heuristic behavior must not masquerade as healthy LSP state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-067 - LLM Diagnostics Context Acceptance
```yaml
plan_unit_id: LSPS-067
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Current diagnostics are included in Assistant and Interview context so agents receive diagnostic lists for relevant files when composing context.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-067 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: llm_diagnostics_context_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- LLM diagnostics
- Include current diagnostics in Assistant/Interview context
- Agent receives diagnostic list
- relevant files
- composing context
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-068 - Config Location Precedence And Merge Rules
```yaml
plan_unit_id: LSPS-068
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: MVP LSP config closes implementation policy by storing app-level config under config.lsp, project overrides at .puppet-master/lsp.json, applying app then project precedence, replacing arrays, inheriting absent keys, and resolving server-specific settings by server id before language/filetype mapping.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-068 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: config_location_precedence_and_merge_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0042
preserved_exact_tokens:
- config.lsp
- .puppet-master/lsp.json
- Merge order
- app-level `config.lsp`
- project override `.puppet-master/lsp.json`
- scalar keys override
- object keys override by nested key
- arrays replace rather than merge
- absent keys inherit
- server id first
- language/filetype mapping
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-069 - Locked LSP Defaults
```yaml
plan_unit_id: LSPS-069
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The locked LSP defaults are didChangeDebounceMs 100, hoverTimeoutMs 5000, completionTimeoutMs 5000, workspaceSymbolTimeoutMs 10000, hoverDelayMs 300, and workspaceFolders capped at 10 roots with at least one open document.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-069 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: locked_lsp_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0043
preserved_exact_tokens:
- Locked defaults
- didChangeDebounceMs
- '100'
- hoverTimeoutMs
- '5000'
- completionTimeoutMs
- '5000'
- workspaceSymbolTimeoutMs
- '10000'
- hoverDelayMs
- '300'
- workspaceFolders cap
- 10 roots with at least one open document
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-070 - Trigger Refresh Timing Closure
```yaml
plan_unit_id: LSPS-070
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Trigger and refresh policy uses server-advertised completion trigger characters when available, keeps typing and manual invocation fallback, refreshes inlay hints on document open and debounced changes, does not require scroll-only refresh for MVP, and uses canonical hover delay and timeout values.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-070 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: trigger_refresh_timing_closure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0044
preserved_exact_tokens:
- server-advertised trigger characters
- normal typing
- explicit manual invocation
- inlay hints refresh
- document open
- debounced `didChange`
- scroll-only refresh is not required for MVP
- hoverDelayMs
- hoverTimeoutMs
negative_constraints:
- Scroll-only inlay refresh is not required for MVP.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-071 - workspaceFolders Overflow Evidence Policy
```yaml
plan_unit_id: LSPS-071
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: workspaceFolders includes only roots with at least one open document up to the configured cap, and deterministic overflow exclusions are visible in logs and evidence when they affect behavior.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-071 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: workspacefolders_overflow_evidence_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0045
preserved_exact_tokens:
- workspaceFolders
- Only roots containing at least one open document
- cap above
- Overflow roots
- excluded deterministically
- visible in logs/evidence
negative_constraints:
- Overflow workspace roots must not be silently hidden when exclusion affects behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-072 - FileSafe Apply Edit Boundary
```yaml
plan_unit_id: LSPS-072
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: workspace/applyEdit, rename, and code-action application use the same FileSafe-backed apply-edit path as other agent mutations, treating multi-file and destructive edits with the same safety, approval, tool-policy, and blocked-state reporting rules.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-072 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: filesafe_apply_edit_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0046
preserved_exact_tokens:
- workspace/applyEdit
- rename
- code-action application
- FileSafe-backed apply-edit path
- multi-file edits
- multi-file mutations
- destructive edits
- safety and approval rules
- LSP does not bypass FileSafe, tool policy, or blocked-state reporting
negative_constraints:
- LSP does not bypass FileSafe, tool policy, or blocked-state reporting.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-073 - Virtual Document Decision Closure
```yaml
plan_unit_id: LSPS-073
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat and code-block virtual documents keep the existing virtual-document stance and do not reopen that decision; no core runtime LSP behavior remains implementation-defined after the closed implementer decisions section.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-073 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: virtual_document_decision_closure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0047
preserved_exact_tokens:
- Virtual documents
- existing virtual-document stance
- does not reopen that decision
- No core runtime LSP behavior remains implementation-defined
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
```

### LSPS-074 - Non Executable Checklist Acceptance Envelope
```yaml
plan_unit_id: LSPS-074
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The implementation-ready checklist is a non-executable guide with acceptance criteria for prerequisites and phases 1-4, including diagnostics caps, Chat affordances, Problems links, and explicit deferral of optional gate, evidence, subagent-bias, and enhancement work.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-074 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: non_executable_checklist_acceptance_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0048
preserved_exact_tokens:
- single, implementation-ready checklist
- Cross-references
- §5.1
- §9.1
- FinalGUISpec §7.16
- FinalGUISpec §7.20
- FinalGUISpec §7.4.2
- FileManager §10
- Acceptance (done when)
- capped 10 files, 50 diagnostics
- explicitly deferred and documented
negative_constraints:
- The checklist is implementation guidance and must not create WorkNodes, NodeSeeds, queues, manifests, or production build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-075 - Prerequisites Checklist
```yaml
plan_unit_id: LSPS-075
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Prerequisites require choosing a Rust stdio-capable LSP client, adding it to Cargo.toml, defining OpenCode-aligned LSP config schema, storing it in redb, and adding debounce/timeout config keys.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-075 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: prerequisites_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0049
preserved_exact_tokens:
- Prerequisites
- lsp-types
- stdio-capable client
- lsp-client
- async_lsp_client
- Cargo.toml
- OpenCode-aligned
- lsp.enabled
- lsp.servers.<id>.disabled
- command
- extensions
- env
- initialization
- redb
- lsp.didChangeDebounceMs
- lsp.hoverTimeoutMs
- lsp.completionTimeoutMs
- lsp.workspaceSymbolTimeoutMs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-076 - Phase 1 Registry Sync Startup Checklist
```yaml
plan_unit_id: LSPS-076
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 1 checklist implementation includes server registry loading, all built-in servers plus slint-lsp, ESLint and Slint root discovery, document sync, and version tracking.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-076 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_1_registry_sync_startup_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0050
preserved_exact_tokens:
- 'Phase 1: Core LSP'
- server registry
- id, extensions, root finder, spawn
- load config
- all built-in servers from §3.2
- slint-lsp
- ESLint §3.3
- slint-lsp §3.3.1
- didOpen
- didChange
- default 100 ms
- didClose
- didSave
- track document version
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-077 - Phase 1 Diagnostics Hover Completion Status UI Checklist
```yaml
plan_unit_id: LSPS-077
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 1 user-visible checklist implementation maps diagnostics to underlines, gutter markers, and Problems, implements hover, completion, and LSP status examples in the status bar.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-077 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_1_diagnostics_hover_completion_status_ui_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0050
preserved_exact_tokens:
- textDocument/publishDiagnostics
- editor underlines
- gutter markers
- Problems panel
- FinalGUISpec §7.20
- file, line, message, severity, source
- tooltip at cursor
- inline list
- completionItem/resolve
- status bar
- 'rust-analyzer: Ready'
- Initializing...
- 'Error: ...'
- FinalGUISpec §8.1 StatusBar
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-078 - Phase 2 Definition References Symbols Checklist
```yaml
plan_unit_id: LSPS-078
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 editor navigation implements definition, references, breadcrumbs, documentSymbol, and workspace/symbol with documented keyboard and click affordances plus FileManager fallback.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-078 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_definition_references_symbols_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- 'Phase 2: Editor (navigation and editing)'
- textDocument/definition
- Go to definition
- F12
- Ctrl+Click
- File Editor
- 'Fallback: heuristic/index'
- FileManager §10.2
- textDocument/references
- Find references
- References panel
- Shift+F12
- documentSymbol
- workspace/symbol
- breadcrumbs
- Go to symbol
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-079 - Phase 2 Semantic Actions Checklist
```yaml
plan_unit_id: LSPS-079
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 editor semantics implement code actions, code lens, signature help, inlay hints, and semantic tokens with editor affordances and syntax-only fallback where applicable.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-079 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_semantic_actions_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- textDocument/codeAction
- context menu
- lightbulb
- textDocument/codeLens
- actionable links
- textDocument/signatureHelp
- popup
- parameter highlight
- textDocument/inlayHint
- inline decorations
- textDocument/semanticTokens
- fall back to syntax-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-080 - Phase 2 Rename Format FileSafe Checklist
```yaml
plan_unit_id: LSPS-080
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 rename and format implement prepareRename, rename, formatting, and rangeFormatting, show preview where needed, and apply changes through FileSafe-backed workspace/applyEdit.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-080 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_rename_format_filesafe_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- textDocument/rename
- textDocument/prepareRename
- Rename symbol
- F2
- show preview
- workspace/applyEdit (FileSafe)
- textDocument/formatting
- textDocument/rangeFormatting
- Format document / Format selection
- Shift+Alt+F
negative_constraints:
- Rename and format edits must apply through FileSafe-backed workspace/applyEdit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-081 - Phase 2 Timeout Cancel Disable Stale Checklist
```yaml
plan_unit_id: LSPS-081
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 request control honors timeout, cancellation, stale document discard or re-request behavior, per-server enable/disable, lsp.<id>.disabled, and lsp:false.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-081 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_timeout_cancel_disable_stale_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- Request timeout and cancellation
- discard or re-request on stale document version
- Per-server enable/disable
- lsp.<id>.disabled
- 'lsp: false'
- Settings > LSP per FinalGUISpec §7.4.2
negative_constraints:
- Per-server disabled state must stop LSP for that language.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-082 - Phase 2 Settings LSP Surface Checklist
```yaml
plan_unit_id: LSPS-082
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 Settings > LSP exposes per-server enablement and custom entries according to the FinalGUISpec Settings contract.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-082 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_settings_lsp_surface_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- Settings > LSP
- FinalGUISpec §7.4.2
- per-server enable/disable
- all servers and custom entries
- validation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-083 - Phase 2 Lifecycle Restart Bridge Checklist
```yaml
plan_unit_id: LSPS-083
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 server lifecycle spawns on first file open by host/server/root identity, restarts on crash with backoff, supports stdio-to-TCP bridge commands such as Godot, and documents the bridge pattern.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-083 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_lifecycle_restart_bridge_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- Server lifecycle
- spawn on first file open
- (host_id, server_id, root_identity)
- restart on crash with backoff
- Bridge pattern
- custom command
- stdio↔TCP bridge
- Godot
- document for users
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-084 - Phase 3 Assistant Interview Diagnostics Context
```yaml
plan_unit_id: LSPS-084
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat LSP phase 3 includes current LSP diagnostics in Assistant and Interview context with file, line, message, severity, and source for project, at-mentioned, or recently edited files.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-084 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_assistant_interview_diagnostics_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0052
preserved_exact_tokens:
- 'Phase 3: Chat LSP (§5.1)'
- Diagnostics in Assistant context
- Assistant/Interview turn
- file, line, message, severity, source
- project or @'d/recently edited files
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-085 - Phase 3 Chat Symbol And Code Block Navigation
```yaml
plan_unit_id: LSPS-085
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat phase 3 uses LSP workspace/symbol for @ symbol results and supports hover and click-to-definition in chat code blocks through virtual documents or real file URIs.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-085 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_chat_symbol_and_code_block_navigation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0052
preserved_exact_tokens:
- '@ symbol with LSP'
- workspace/symbol
- documentSymbol
- path, line, kind
- Code blocks in messages
- LSP hover
- click-to-definition
- Ctrl+Click
- virtual document
- real file URI
- definition opens in File Editor
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-086 - Phase 3 Problems Link Hint And Fallback
```yaml
plan_unit_id: LSPS-086
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat phase 3 exposes Problems links or badges and optional compact diagnostics hints for at-mentioned files, while fallback uses text/indexed symbol search, no hover/definition, and omitted diagnostics when LSP is unavailable.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-086 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_problems_link_hint_and_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0052
preserved_exact_tokens:
- Problems link from Chat
- N problems
- opens Problems panel
- Optional
- 2 errors in @'d files
- click-through
- Fallback when LSP unavailable
- text-based or indexed symbol search
- code blocks no hover/definition
- omit diagnostics from context
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-087 - Phase 4 Optional Gate Evidence Bias
```yaml
plan_unit_id: LSPS-087
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional phase 4 may add an LSP diagnostics gate, LSP evidence snapshots, and subagent selection bias from LSP diagnostics as optional or explicitly deferred enhancements.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-087 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_gate_evidence_bias
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- 'Phase 4: Optional (§9.1)'
- Optional LSP diagnostics gate
- No LSP errors in scope
- Optional LSP snapshot in evidence
- Optional subagent selection from LSP
- subagent bias
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-088 - Phase 4 Optional Chat Quick Actions
```yaml
plan_unit_id: LSPS-088
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional chat enhancements may expose Fix all, LSP rename with confirmation, where-used references, format file, and copying hover type/signature to Chat.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-088 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_chat_quick_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- Optional/recommended Chat
- Fix all
- quick fixes from Chat
- Rename X to Y
- LSP Rename symbol with confirmation
- Where is this used?
- Find references
- Format this file
- LSP Format document
- Copy type/signature to Chat
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-089 - Phase 4 Optional LSP Tool Promotion
```yaml
plan_unit_id: LSPS-089
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional tool promotion may expose lsp.references, lsp.definition, lsp.hover, and approval-gated lsp.rename and remove or relax OPENCODE_EXPERIMENTAL_LSP_TOOL only when ready.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-089 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_lsp_tool_promotion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- Promote lsp tool to MVP
- Tools.md
- lsp.references
- lsp.definition
- lsp.hover
- lsp.rename with user approval
- OPENCODE_EXPERIMENTAL_LSP_TOOL
negative_constraints:
- lsp.rename remains user-approval gated if promoted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-090 - Phase 4 Optional Interview Advanced Editor Features
```yaml
plan_unit_id: LSPS-090
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional Interview and editor enhancements may include structure-of-file via documentSymbol, diagnostics in interview context, type definition, implementation, document links, call hierarchy, folding range, selection range, and document highlight.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-090 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_interview_advanced_editor_features
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- Interview "Structure of this file"
- documentSymbol
- diagnostics in interview context
- go to type definition
- implementation
- document links
- call hierarchy
- folding range
- selection range
- document highlight
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-091 - Gate Timing Scope Severity Contract
```yaml
plan_unit_id: LSPS-091
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP diagnostics verification gate runs at configured tier boundaries, defaults to phase boundary only, treats iteration-local preflight as advisory only, checks changed_files, open, or project scope, and blocks by configurable error or error_and_warning severity threshold.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-091 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_timing_scope_severity_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0056
preserved_exact_tokens:
- When it runs
- tier boundaries
- phase
- task
- subtask
- 'default: phase boundary only'
- iteration-local preflight
- MUST NOT replace
- changed_files
- open
- project
- No LSP errors
- error
- error_and_warning
negative_constraints:
- Iteration-local preflight MUST NOT replace the configured boundary gate.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-092 - Gate Config Schema Defaults
```yaml
plan_unit_id: LSPS-092
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP gate config lives at verification.lsp_gate with opt-in defaults, changed_files scope, errors-only blocking, phase boundary, 10-second timeout, skip when unavailable, and project override through .puppet-master/config.json.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-092 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_config_schema_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0057
preserved_exact_tokens:
- verification.lsp_gate
- redb
- .puppet-master/config.json
- enabled
- 'false'
- scope
- changed_files
- block_on
- errors
- tier_boundaries
- '["phase"]'
- timeout_seconds
- '10'
- when_unavailable
- skip
- errors_and_warnings
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-093 - Verification Tab LSP Controls
```yaml
plan_unit_id: LSPS-093
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The Verification tab exposes an LSP diagnostics gate subsection with enable, scope, block-on, tier-boundary, and timeout controls bound to the same VerificationConfig blob.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-093 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: verification_tab_lsp_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0057
preserved_exact_tokens:
- GUI
- Verification tab
- LSP diagnostics gate
- Enable checkbox
- Scope dropdown
- Changed files
- Open files
- Whole project
- Block on
- Errors only
- Errors and warnings
- Tier boundaries
- Phase, Task, Subtask
- Timeout (seconds)
- VerificationConfig
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-094 - Gate Failure Orchestrator Flow
```yaml
plan_unit_id: LSPS-094
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: When LSP diagnostics fail the gate, the criterion result carries passed false, met false, and an actual diagnostic summary, then follows standard orchestrator retry, escalation, or stop policy with no special LSP-only gate-runner path.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-094 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_failure_orchestrator_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0058
preserved_exact_tokens:
- Gate fails
- 'passed: false'
- 'met: false'
- actual
- 3 LSP errors in scope
- Orchestrator behavior
- retry
- escalate
- stop
- No special case for LSP gate
negative_constraints:
- The LSP gate must use the standard failed-gate flow rather than a special-case orchestrator path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-095 - Gate Failure User Notification
```yaml
plan_unit_id: LSPS-095
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: User-visible LSP gate failures appear through the standard Dashboard and Gate report path, with optional toast copy and attached evidence for inspection.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-095 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_failure_user_notification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0058
preserved_exact_tokens:
- User notification
- Dashboard/Gate report
- optional toast
- 'LSP gate failed: N errors in scope'
- Evidence
- user can inspect
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-096 - Snapshot Evidence Attachment
```yaml
plan_unit_id: LSPS-096
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Whenever the LSP gate runs, pass or fail, it captures and attaches an LSP diagnostics snapshot as evidence, referenced as lsp_snapshot and stored under the planned LSP snapshots evidence location or embedded in gate report artifacts.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-096 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: snapshot_evidence_attachment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0059
preserved_exact_tokens:
- Evidence attachment
- When the LSP gate runs
- whether it passes or fails
- always capture snapshot
- lsp_snapshot
- .puppet-master/evidence/lsp-snapshots/
- GateReport
- EvidenceStore
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-097 - LspGateVerifier Registry API
```yaml
plan_unit_id: LSPS-097
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LspGateVerifier is registered in VerifierRegistry under lsp or lsp_gate verification_method, runs without changing gate_runner flow, calls the LSP client diagnostics API for resolved paths, and returns VerifierResult with passed, message, and evidence.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-097 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lspgateverifier_registry_api
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0060
preserved_exact_tokens:
- LspGateVerifier
- lsp_gate_verifier
- VerifierRegistry
- register_defaults
- 'verification_method: "lsp"'
- '"lsp_gate"'
- puppet-master-rs/src/verification/lsp_gate_verifier.rs
- Verifier
- verify(criterion)
- get_diagnostics_for_paths
- VerifierResult { passed, message, evidence }
- No change to gate_runner flow
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-098 - VerificationConfig Criterion Evidence Wiring
```yaml
plan_unit_id: LSPS-098
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Implementer wiring extends VerificationConfig with nested lsp_gate, injects lsp criteria at enabled tier boundaries, dispatches by verification method, and uses existing evidence and GateReport aggregation without adding a new GateReport field.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-098 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: verificationconfig_criterion_evidence_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0061
preserved_exact_tokens:
- VerificationConfig
- nested struct
- enabled
- scope
- block_on
- tier_boundaries
- timeout_seconds
- when_unavailable
- build_gate_criteria
- 'verification_method: "lsp"'
- '"lsp_gate"'
- No change to criterion type enum beyond adding this method
- No new GateReport field required
- EvidenceStore
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-099 - Verification Tab Binding
```yaml
plan_unit_id: LSPS-099
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The Verification tab binds LSP diagnostics gate controls to the nested lsp_gate config struct and persists them with the same verification settings blob.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-099 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: verification_tab_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0061
preserved_exact_tokens:
- Verification tab UI
- LSP diagnostics gate subsection
- controls bound to this struct
- Persist in the same blob as other verification settings
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-100 - Prompt Consumable Evidence Cap
```yaml
plan_unit_id: LSPS-100
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Prompt-consumable LSP/debug evidence may auto-ingest at most the top five evidence items by current relevance or severity; after that cap, additional diagnostics or trace material enter summarization-only mode unless the user explicitly opens the full runtime artifact.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-100 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: prompt_consumable_evidence_cap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0062
preserved_exact_tokens:
- Prompt-consumable LSP/debug evidence
- at most the top five evidence items
- current relevance `/severity`
- summarization-only mode
- unless the user explicitly opens the full runtime artifact
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-101 - Diagnostic Entry Schema
```yaml
plan_unit_id: LSPS-101
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Each LSP evidence snapshot diagnostic entry stores path, line, character, severity, message, source, and optional code with severity values Error, Warning, Info, and Hint.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-101 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostic_entry_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0063
preserved_exact_tokens:
- Schema (per diagnostic entry)
- path
- line
- character
- severity
- message
- source
- code
- Error
- Warning
- Info
- Hint
- rust-analyzer
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-102 - Evidence Line Display Protocol Boundary
```yaml
plan_unit_id: LSPS-102
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP diagnostic evidence stores and displays line values as 1-based for evidence and UI while converting to 0-based only at the LSP protocol boundary.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-102 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: evidence_line_display_protocol_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0063
preserved_exact_tokens:
- line
- 0-based or 1-based per LSP spec
- Decision
- Store and display 1-based in evidence and UI
- convert to 0-based only at the LSP protocol boundary
negative_constraints:
- Do not leak protocol 0-based line display into evidence or UI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-103 - Snapshot File Location Object Format
```yaml
plan_unit_id: LSPS-103
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP snapshots are stored under .puppet-master/evidence/lsp-snapshots with unique gate or tier/session filenames and JSON object content containing captured_at, scope, project_root, and diagnostics.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-103 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: snapshot_file_location_object_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0064
preserved_exact_tokens:
- File format and location
- .puppet-master/evidence/lsp-snapshots/
- lsp-snapshot-{gate_id}-{timestamp}.json
- lsp-snapshot-{tier_id}-{session_id}.json
- captured_at
- scope
- project_root
- diagnostics
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-104 - Snapshot Capture Timing
```yaml
plan_unit_id: LSPS-104
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: MVP snapshot capture occurs after an iteration when the gate runs and before promotion, with one after-only snapshot per gate run and no required before-run capture.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-104 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: snapshot_capture_timing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0065
preserved_exact_tokens:
- When captured
- 'Before run: Not required'
- 'After run (when gate runs): Yes'
- after iteration, before promotion
- one snapshot per gate run
- 'MVP: after only'
negative_constraints:
- Before-run LSP snapshot capture is not required for MVP.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-105 - Gate Runner Snapshot Trigger Sequence
```yaml
plan_unit_id: LSPS-105
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The gate runner invokes LspGateVerifier, which gets diagnostics, writes the snapshot JSON, attaches evidence to VerifierResult, and returns pass/fail while EvidenceStore may persist the path and GateReport criteria carry the evidence.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-105 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_runner_snapshot_trigger_sequence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0066
preserved_exact_tokens:
- Who triggers
- Gate runner
- LspGateVerifier
- gets diagnostics from LSP client
- writes snapshot JSON
- .puppet-master/evidence/lsp-snapshots/
- attaches evidence to VerifierResult
- EvidenceStore
- GateReport criteria already carry per-criterion evidence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
```

### LSPS-106 - Subagent Bias Enablement Scope Defaults
```yaml
plan_unit_id: LSPS-106
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Subagent selection from LSP is off by default behind orchestrator.lsp_subagent_bias and, when enabled, uses explicit node file list, changed files, or open files to derive language bias such as rust-analyzer to rust-engineer.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-106 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: subagent_bias_enablement_scope_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0067
preserved_exact_tokens:
- Subagent selection from LSP
- orchestrator.lsp_subagent_bias
- default false
- files in scope
- Changed in last iteration
- Open in editor
- Node's file list
- 'Default: changed in last iteration'
- rust-analyzer → rust-engineer
- pyright → python-pro
- prefer_subagents
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-107 - Subagent Bias Owner Runtime Boundary
```yaml
plan_unit_id: LSPS-107
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: orchestrator-subagent-integration remains owner for subagent-selection wiring and runtime structs must carry rewrite execution identity and concern model when LSP diagnostics bias a node.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-107 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: subagent_bias_owner_runtime_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0067
preserved_exact_tokens:
- Plans/orchestrator-subagent-integration.md
- Subagent selection from LSP
- owner for subagent-selection wiring
- runtime structs
- rewrite execution identity
- concern model
- LSP diagnostics bias a node
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/orchestrator-subagent-integration.md owns subagent-selection wiring; LSPSupport records the LSP diagnostic bias contract.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-108 - Subagent Bias Ranking Explainability Rules
```yaml
plan_unit_id: LSPS-108
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP bias is a ranking hint rather than an absolute selector, yields to explicit plan requirements or required_subagents, uses explicit node file list before changed or open files, defaults to Error threshold, and persists chosen bias inputs and outcomes for explainability.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-108 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: subagent_bias_ranking_explainability_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0067
preserved_exact_tokens:
- Bias rules (canonical)
- tie-breaker / ranking hint
- not an absolute selector
- required_subagents
- Preferred scope order
- explicit node file list
- changed files in current node
- open files
- Default bias threshold
- Error
- Warning when configured
- persisted in run metadata or verification evidence
- explainable
negative_constraints:
- LSP bias must not override explicit plan requirements, node override lists, or required_subagents.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-109 - Gate Failure Modes Implementation Contract
```yaml
plan_unit_id: LSPS-109
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP gate and diagnostics failure modes skip when client is unavailable by default, fail on diagnostics query timeout with partial snapshot if available, treat files without servers as empty diagnostics, follow unavailable config for crashes, pass empty scopes, and implement this in LspGateVerifier and get_diagnostics_for_paths.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-109 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_failure_modes_implementation_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0068
preserved_exact_tokens:
- LSP client not ready
- skip
- 'actual: "LSP client not ready"'
- lsp_gate.when_unavailable
- skip | pass | fail
- default skip
- Timeout when querying diagnostics
- fail
- partial snapshot
- No server for language
- empty list
- Server crash or disconnected
- Empty scope
- passes
- LspGateVerifier
- get_diagnostics_for_paths
negative_constraints:
- The gate does not block on LSP startup by default.
- Timeout querying diagnostics fails the criterion rather than silently passing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
```

### L-001 - LSPSupport Retired Source-Preserving Bridge
```yaml
plan_unit_id: L-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The former LSPSupport source-preserving bridge is retired after Phase 2B atomized LSPSupport-S0001 through S0068 into LSPS-002 through LSPS-109 or structurally/reference dispositioned S0018, S0025, S0026, S0029, S0041, S0054, S0055, and S0069 through S0072. L-001 remains only as migration lineage and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained LSPSupport PlanUnits LSPS-002 through LSPS-109.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- L-001 no longer uses source_preserving_planunit compile mode.
- LSPS-002 through LSPS-109 own product coverage for atomized LSPSupport spans.
- Structural and reference spans are explicit coverage dispositions, not product coverage owned by L-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0071
preserved_exact_tokens:
- L-001
- LSPSupport-S0071
- source_preserving_planunit
- source_preserving_bridge_retired
- LSP Support -- Plan (Rewrite)
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- L-001 must not re-own LSPSupport product coverage.
- L-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- L-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former L-001 residual source-preserving bridge is retired by Phase 2B batch 086.
owner_boundary_notes:
- LSPS-002 through LSPS-109 own atomized LSPSupport product coverage.
- LSPSupport-S0071 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/LSPSupport.md
```
## Migration Coverage

Original hash: `df1a9dcf0546d489cf8823a1592b6896ca423ee12a1274894bb0bd899a297278`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 084 atomized `LSPSupport-S0001` through `LSPSupport-S0017` and `LSPSupport-S0019` into `LSPS-002` through `LSPS-025`, with `LSPSupport-S0018` structurally dispositioned. Phase 2B batch 085 atomized `LSPSupport-S0020` through `LSPSupport-S0024`, `LSPSupport-S0027`, `LSPSupport-S0028`, and `LSPSupport-S0030` through `LSPSupport-S0039` into `LSPS-026` through `LSPS-061`; `LSPSupport-S0025` is a preserved reference-only section, and `LSPSupport-S0026` and `LSPSupport-S0029` are structural parent-heading dispositions. Phase 2B batch 086 atomized `LSPSupport-S0040`, `LSPSupport-S0042` through `LSPSupport-S0053`, and `LSPSupport-S0056` through `LSPSupport-S0068` into `LSPS-062` through `LSPS-109`; `LSPSupport-S0041`, `LSPSupport-S0054`, and `LSPSupport-S0055` are structural parent-heading dispositions. `LSPSupport-S0069`, `LSPSupport-S0070`, and `LSPSupport-S0072` are generated PDS tail/reporting dispositions, and `LSPSupport-S0071` maps only to retired bridge lineage `L-001`. `L-001` no longer uses source-preserving compile mode, and `Plans/LSPSupport.md` has no remaining source-preserving product coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
