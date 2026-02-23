# LSP Support -- Plan (Rewrite)

**Date:** 2026-02-22  
**Status:** Plan -- **LSP is MVP**  
**Scope:** LSP (Language Server Protocol) is **in scope for the desktop MVP**. Desktop client integration, server management, **full LSP integration in the Chat Window** (diagnostics in context, @ file/symbol with LSP, code blocks with hover/Go to definition), and **additional enhancements** (Find references, Rename symbol, Format document, optional LSP diagnostics gate, Chat "Fix all"/"Rename"/"Where is this used?", etc.) -- see §9.1.  
**Cross-references:** Plans/FileManager.md (§6, §10, §12.1.4), Plans/assistant-chat-design.md (§9, §9.1 LSP in Chat), Plans/00-plans-index.md, Plans/FinalGUISpec.md (§7.20 Bottom Panel, §7.16 Chat, §8.1 StatusBar), Plans/feature-list.md (§4 Verification gates), OpenCode (anomalyco/opencode) LSP implementation. **LSP gate, evidence, subagent selection (implementation spec):** §17.
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

### 1.1 Feature specification (inputs, outputs, behavior)

For each feature below: **inputs** (what the client sends or user does), **outputs** (what the user sees or context receives), **success/failure behavior**, **config keys** where applicable, **edge cases/failure modes** and required behavior, and **fallback when LSP unavailable**.

| Feature | Inputs | Outputs | Success | Failure / edge cases | Config keys | Fallback when LSP unavailable |
|--------|--------|---------|---------|----------------------|-------------|------------------------------|
| **Diagnostics** | Buffer URI, open/change/close; server sends `publishDiagnostics` | Underlines, gutter markers, Problems panel rows | Errors/warnings shown; click opens file at line | Timeout: show last known or empty; server crash → clear diagnostics, offer "Restart"; no server → no diagnostics | `lsp.<id>.disabled`, `lsp: false` | No diagnostics; optional install hint |
| **Hover** | (URI, position), optional timeout | Tooltip (markdown or plain) | Tooltip at cursor | Timeout → show "Timed out", discard; stale (version changed) → discard; no server → no tooltip | `lsp.hoverTimeoutMs` | No hover; syntax-only if any |
| **Autocomplete** | (URI, position, trigger), optional timeout | Inline completion list | List shows; select applies | Timeout → hide list, discard; stale → discard; no server → no LSP completions | `lsp.completionTimeoutMs` | Heuristic or no completion |
| **Navigation** (go-to-def, outline, breadcrumbs) | (URI, position) or document; server capability | Jump to location or symbol list | Correct location/list | Timeout → show "Timed out", discard; no result → show "No definition"; no server → heuristic/outline | `lsp.workspaceSymbolTimeoutMs` (for workspace/symbol) | Heuristic symbol search, regex outline (§12.1.4) |
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

---

## 2. LSP Basics (Reference)

- **Protocol:** [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) (JSON-RPC 2.0). Current spec: 3.17.
- **Roles:** Our app is the **LSP client**; we talk to existing **language servers** (e.g. rust-analyzer, pyright, gopls) that we spawn or connect to.
- **Transport:** Typically stdio (spawn server process, stdin/stdout = JSON-RPC). Some setups use TCP/sockets.
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

### 3.5 Root discovery (per-server rules)

For each server id (or group), the **root** is the directory used as the project root for that LSP process (one process per (server_id, root)). Root is discovered by walking **up** from the **file's directory** (the directory of the currently opened file) until a directory matching the rule is found. If no such directory is found, the server is not started for that file (or a fallback rule applies where noted).

| Server id | Root discovery rule | Notes |
|-----------|---------------------|--------|
| rust | Nearest directory (walk up from file's dir) containing **Cargo.toml** | One server per Cargo workspace. |
| eslint | Nearest directory containing **package.json** or **eslint.config.js** / **eslint.config.mjs** / **eslint.config.ts** | §3.3; v10 flat config. |
| typescript | Nearest directory containing **package.json** | Node/TS project root. Excluded when deno wins (see §3.6). |
| deno | Nearest directory containing **deno.json** or **deno.jsonc** | Deno project; takes precedence over typescript for same path when both present. |
| slint-lsp | **File's directory**, or nearest directory containing **Cargo.toml** (if one server per Rust project desired) | §3.3.1; default: file's directory. |
| pyright | Nearest directory containing **pyrightconfig.json** or **pyproject.toml** or **package.json** (e.g. Python in JS repo); else file's directory | default |
| gopls | Nearest directory (walk up) containing **go.mod**; else file's directory | default |
| clangd | Nearest directory containing **compile_commands.json** or **CMakeLists.txt** or **Makefile**; else file's directory | default |
| jdtls | Nearest directory containing **pom.xml** or **build.gradle** / **build.gradle.kts**; else file's directory | default |
| csharp, fsharp | Nearest directory containing **\*.sln** or **\*.csproj** / **\*.fsproj**; else file's directory | default |
| php intelephense | Nearest directory containing **composer.json** or **package.json**; else file's directory | default |
| astro, svelte, vue | Nearest directory containing **package.json** | default |
| oxlint | Same as eslint: nearest **package.json** or **eslint.config.\*** | Lint-only; see §3.6. |
| bash, clojure-lsp, dart, elixir-ls, gleam, hls, julials, kotlin-ls, lua-ls, nixd, ocaml-lsp, prisma, ruby-lsp, sourcekit-lsp, terraform, tinymist, yaml-ls, zls | **File's directory** | default when no canonical project file is specified. |

**Invocation:** The client calls the root finder with **path = currently opened file path** (e.g. absolute). The finder derives the file's directory and walks upward until the first directory matching the rule; it returns `Some(root_path)` or `None` if not found (or fallback to file's directory where the table says "else file's directory").

### 3.6 Extension conflicts (multiple servers per extension)

Some file extensions are served by **multiple** LSP servers (e.g. `.ts`/`.tsx` by typescript, eslint, deno, oxlint). The implementer must attach exactly one **primary** server for language features (diagnostics, hover, completion, navigation, etc.) and zero or more **supplementary** servers that contribute **diagnostics only** (and optionally code actions keyed to those diagnostics).

**Rule:**

1. **Primary server (one per file):** For a given opened file path, **at most one** server is the **primary** for that file. The primary server is used for: diagnostics, hover, completion, go-to-definition, document/workspace symbol, signature help, inlay hints, code actions (from its diagnostics), code lens, and all other LSP features. Choice of primary is by **project context**:
   - **deno vs typescript:** If the file's root (from root discovery) contains **deno.json** or **deno.jsonc**, use **deno** as primary for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` in that tree. Otherwise use **typescript** as primary for those extensions (when typescript dependency/requirement is met).
   - **typescript** is primary for TS/JS when not in a Deno root; **deno** is primary when in a Deno root.

2. **Supplementary servers (diagnostics only):** The following servers are **supplementary** for the extensions they share with a primary server. They are **not** used for hover, completion, or navigation; they **only** contribute diagnostics (and optionally code actions tied to those diagnostics). Merge their diagnostics with the primary's in the Problems panel and in LLM/Assistant context.
   - **eslint:** Supplementary for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue` (when eslint requirement is met). Primary for language features remains typescript or deno.
   - **oxlint:** Supplementary for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue`, `.astro`, `.svelte` (when oxlint dependency is met). Primary remains typescript or deno (or svelte/astro/vue where applicable).

3. **Priority order for primary:** When multiple servers could be primary for an extension (e.g. in a Deno repo that also has package.json), **deno** wins over **typescript** when root contains deno.json(c). For other conflicts (e.g. vue vs typescript for .vue), use the **language** server (e.g. **vue** for .vue, **svelte** for .svelte, **astro** for .astro) as primary for that extension; typescript/eslint/oxlint remain supplementary for diagnostics.

4. **Summary for implementer:** For each opened file, (1) resolve root per §3.5 for each server that matches the file's extension; (2) choose **one** primary server by the rules above; (3) attach **all** matching supplementary servers for diagnostics only; (4) spawn one process per (server_id, root) and route requests accordingly (primary: full LSP; supplementary: only publishDiagnostics and optionally codeAction for their diagnostics).

ContractRef: ContractName:Plans/LSPSupport.md

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
- **Server model:** One LSP server **process** per **(language, project root)**. Root is discovered per file (e.g. "nearest directory containing Cargo.toml" for Rust).
- **Info shape:** `id`, `extensions[]`, `root(file) -> root path`, `spawn(root) -> Handle | undefined`. **Handle:** `process` (child process) + optional `initialization` (options sent in LSP `initialize`).
- **Root discovery:** **NearestRoot(includePatterns, excludePatterns)** -- walk up from the file's directory until a target file is found. Exclude patterns avoid wrong server (e.g. Deno vs Node). Some servers use a fixed root (e.g. instance directory).
- **Lifecycle:** On file open, extension is matched to enabled servers; if a server is needed and not yet running for that root, it is **spawned** (stdio). Initialize handshake and optional `initializationOptions` complete the setup.

**Takeaways for us:**

- Registry of servers by (id, extensions, root-finder, spawn).
- Lazy spawn per (language, root); one process per root.
- Config to disable, override command, set env and initialization options (align with OpenCode's `lsp` schema).
- Optional auto-install (we can defer or limit; e.g. rust-analyzer from PATH, pyright/gopls optional install).

---

## 4. Rust Stack (Client Side)

Our rewrite is Rust/Iced. We only need an **LSP client** in the app.

- **Protocol types:** [lsp-types](https://docs.rs/lsp-types/) -- LSP 3.x types (requests, notifications, capabilities, DocumentUri, Range, Diagnostic, etc.). Use for all LSP data structures.
- **Client implementation:** One of:
  - [lsp-client](https://docs.rs/lsp-client/) -- async, uses jsonrpsee + lsp-types.
  - [async_lsp_client](https://docs.rs/async_lsp_client/) -- async, lifecycle (initialize, shutdown, exit), document sync, hover, completion, goto definition.
  - [lsp-client-rs](https://github.com/sudarshan-reddy/lsp-client-rs) -- TCP/Unix socket + async; used with gopls in examples.
- **Server implementation (optional):** If we ever implement our own LSP server (e.g. for a custom language), [tower-lsp](https://docs.rs/tower-lsp/) / [tower-lsp-server](https://lib.rs/crates/tower-lsp-server) (community fork, active).

Recommendation: use **lsp-types** plus one async LSP **client** crate that supports stdio (spawn process, stdin/stdout). Evaluate `lsp-client` and `async_lsp_client` for lifecycle, document sync, and the few methods we need (diagnostics, hover, completion, goto definition).

---

## 5. Integration with Our Editor (FileManager / Rewrite)

- **Editor:** FileManager plan defines the in-app editor (tabs, buffers, save, syntax highlighting). **LSP is MVP** -- integrate from the start. See also **§5.1 LSP in the Chat Window** for Chat-specific integration.
- **Integration (editor + Chat):**
  - **Document sync:** On open/change/close (and save when configured) of a buffer, send the corresponding LSP notifications. **Decision:** Send `didSave` on buffer save by default; config key `lsp.didSave` (bool, default true). for the document URI. Use the same 1-based line/column and encoding as in FileManager. Prefer **incremental sync** in client capabilities when the server supports it (sends only changed ranges in `didChange`); otherwise full sync. Track document version for each buffer and include it in sync messages.
  - **Diagnostics:** Subscribe to `textDocument/publishDiagnostics`; map `Diagnostic` to editor underlines and gutter markers; optionally a "Problems" panel (as in FinalGUISpec placeholder).
  - **Hover:** On hover at (line, col), call `textDocument/hover` and show the result in a tooltip.
  - **Completion:** On trigger (e.g. character or explicit), call `textDocument/completion` and show an inline completion list.
  - **Breadcrumbs / Go to symbol:** Use LSP `documentSymbol` (or workspace/symbol) for outline and breadcrumbs when available (FileManager §10.1, §10.9).
  - **Go to definition:** Use LSP `textDocument/definition` (and optionally references) instead of grep/index-only.
  - **Inlay hints:** Request `textDocument/inlayHint`; render as inline decorations (no buffer change). Enable when server supports it.
  - **Semantic highlighting:** Request `textDocument/semanticTokens` when supported; use for more accurate token types; fall back to syntax-only.
  - **Code actions:** Request `textDocument/codeAction`; show in context menu or lightbulb; apply via `workspace/applyEdit` (through FileSafe/patch pipeline).
  - **Code lens:** Request `textDocument/codeLens`; render actionable links above symbols; support invoke.
  - **Signature help:** Request `textDocument/signatureHelp` when cursor is in a call; show signature and parameter hint.
  - **Request timeout and cancellation:** Apply configurable timeouts per request type; send LSP cancellation when user navigates or edits to avoid stale results.
  - **LSP status in UI:** Show current server and state (e.g. "Rust (rust-analyzer)", "Initializing...", "Ready", "Error: ...") in status bar or dedicated indicator.
  - **Per-server enable/disable:** Honor config to disable a server globally or per project (`lsp.<id>.disabled`, `lsp: false`).
  - **Fallback when LSP unavailable:** When no server is available for a language, keep heuristic symbol search and no diagnostics. **Install hint:** Dismissible banner once per (project, server_id) per session with message "Install \<server\> for diagnostics" and link to Settings > LSP (FinalGUISpec §7.4.2).
  - **Diagnostics for LLM/Assistant:** Include current LSP diagnostics for relevant files in context fed to Assistant/Interview (assistant-chat-design §9.1 LSP support in Chat (MVP), tool context).

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

**Editor feature behavior (inputs, outputs, edge cases, fallback):**

- **Document sync:** *Inputs:* buffer open/change/close (and optionally save); URI, version, content or contentChanges. *Outputs:* server has up-to-date view. *Success:* server acknowledges; *failure:* server crash → clear diagnostics for that server, offer Restart; transport error → log, mark server Error. *Config:* `lsp.didChangeDebounceMs`. *Fallback when LSP unavailable:* no sync; no diagnostics.
- **Diagnostics:** *Inputs:* subscribe to `publishDiagnostics`. *Outputs:* underlines, gutter markers, Problems panel. *Success:* list shows file, line, message, severity; click opens file. *Edge cases:* timeout → keep last known or empty; server crash → clear diagnostics, offer Restart; empty list → show "No problems" when panel open. *Fallback when LSP unavailable:* no diagnostics; optional install hint.
- **Hover:** *Inputs:* (URI, position). *Outputs:* tooltip. *Success:* show content (markdown/plain). *Failure:* timeout → show "Timed out", discard; document version changed → discard; no server → no tooltip. *Config:* `lsp.hoverTimeoutMs`. *Fallback when LSP unavailable:* no hover.
- **Completion:** *Inputs:* (URI, position, trigger). *Outputs:* inline list; select applies. *Failure:* timeout → hide list; stale → discard. *Config:* `lsp.completionTimeoutMs`. *Fallback when LSP unavailable:* no LSP completions (heuristic if any).
- **Breadcrumbs / Go to symbol:** *Inputs:* documentSymbol or workspace/symbol. *Outputs:* outline, breadcrumbs, symbol list. *Failure:* timeout → show "Timed out" or empty list. *Fallback when LSP unavailable:* heuristic/regex outline (FileManager §10.1, §12.1.4).
- **Go to definition:** *Inputs:* (URI, position). *Outputs:* open file at location. *Failure:* timeout → "Timed out", discard; no result → "No definition"; stale → discard. *Fallback when LSP unavailable:* grep/index-only if available.
- **Inlay hints, semantic highlighting, code actions, code lens, signature help:** *Inputs/outputs* per §1.1. *Failure:* timeout → skip or discard; no server → no feature. *Fallback when LSP unavailable:* no inlay hints; syntax-only highlighting; no code actions/code lens/signature help.
- **Request timeout and cancellation:** On timeout → treat request as failed (show "Timed out" or discard); on navigate/edit → send LSP cancel, discard response when it arrives if version changed. *Fallback when LSP unavailable:* N/A.
- **LSP status in UI:** Show server name + state (Initializing/Ready/Error); when no server, show nothing (omit). *Fallback when LSP unavailable:* show nothing (omit).
- **Per-server enable/disable:** Honor `lsp.<id>.disabled`, `lsp: false`; disabled server not spawned. *Fallback when LSP unavailable:* same as no server for that language.
- **Diagnostics for LLM/Assistant:** Include current diagnostics in context; when no server, omit. *Fallback when LSP unavailable:* omit from context.

### 5.1 LSP in the Chat Window (MVP)

The Chat Window must **fully take advantage of LSP** so the user and the Assistant benefit from language intelligence without leaving the chat. All of the following are **MVP** and must be implemented with LSP support.

| Area | LSP usage | Requirement |
|------|-----------|-------------|
| **Diagnostics in Assistant context** | Feed current LSP diagnostics into the Assistant/Interview prompt | When building the context for the next Assistant turn, **include a summary of current LSP diagnostics** for the project (or for files @'d or recently edited): errors and warnings with file, line, message, severity, and source (e.g. rust-analyzer). The agent can then suggest fixes, explain errors, or prioritize work. Same for Interview when the project has open files or @'d files. **Cap:** Limit to **10 files** and **50 diagnostics total** in context; if more, truncate with "... and N more" in the summary to avoid token overflow. |
| **@ file mention** | LSP-aware @ picker | **@ mention** (Plans/assistant-chat-design.md §9) continues to offer file/folder/symbol search. When LSP is available for the project, **@ symbol** (or "symbols" in the @ menu) uses **LSP workspace/symbol** (and optionally documentSymbol for current file) so the user can add a **symbol** (function, class, etc.) to context by name; results show path, line, kind. File list remains the primary @ result; symbols are an additional category when LSP is active. |
| **Code blocks in messages** | Hover and go-to-definition from chat | **Code blocks** in assistant or user messages (inline or fenced) are **LSP-enabled** when the block has a known language and the project has an LSP server for it: **hover** over a symbol in the block shows LSP hover (type, docs) in a tooltip; **click-to-definition** (e.g. Ctrl+Click or Cmd+Click) on a symbol in a code block calls **textDocument/definition** (using a virtual document or the real file if the block maps to a project file) and opens the definition in the File Editor or scrolls to it. If the block is a snippet from a project file, use that file's URI and position for LSP requests; otherwise create a temporary/virtual document for the block and attach it to the appropriate LSP server for that language so hover/definition still work where possible. |
| **Problems panel from Chat** | One-click to Problems | Chat **footer** strip offers a **link** (label: "N problems" when count > 0, "Problems" when zero), placed **right of context usage** (FinalGUISpec §7.16). Click opens the **Problems** tab (FinalGUISpec §7.20) filtered to the current project (or to files in context). **Filter definition:** Show diagnostics for all open files in the current project; when context has @'d files, optionally restrict to those files plus open. Implementer defines "current project" from app state (e.g. active project root or workspace folder). Empty/error states and accessibility: see FinalGUISpec §7.16. |
| **Inline diagnostics for @'d files** | Optional hint in chat | When the user has **@'d** one or more files, optionally show a **compact hint** (e.g. "2 errors in @'d files") with a click-through to the Problems panel or to the first error location in the editor. **Default: off.** Config key `chat.show_at_diagnostics_hint` (bool, default false). |

**Chat LSP -- inputs, outputs, success/failure, edge cases, fallback:**

- **Diagnostics in Assistant context:** *Inputs:* current LSP diagnostics for project or @'d/recent files. *Outputs:* summary in Assistant/Interview prompt (file, line, message, severity, source). *Success:* agent sees errors/warnings. *Failure:* no server → omit from context; timeout → use last known or omit. *Edge case:* token limit → cap to 10 files, 50 diagnostics (§5.1); truncate with "... and N more". **Fallback when LSP unavailable:** Omit diagnostics from context; optional hint to install server.
- **@ symbol (LSP-aware):** *Inputs:* user query in @ picker; workspace/symbol (and optionally documentSymbol). *Outputs:* symbol list (path, line, kind). *Success:* user can add symbol to context. *Failure:* timeout → show "Timed out" or empty list; no server → use text/index search. **Fallback when LSP unavailable:** Text-based or indexed symbol search (FileManager §12.1.4).
- **Code blocks (hover + go-to-definition):** *Inputs:* code block language, symbol position; virtual or real URI. *Outputs:* tooltip on hover; open definition on click. *Success:* hover shows type/docs; click opens file at definition. *Failure:* timeout → show "Timed out", discard; no server → no hover/definition; virtual doc not supported → no LSP for that block. **Fallback when LSP unavailable:** No hover/definition in code blocks.
- **Problems link from Chat:** *Inputs:* current diagnostics count for project/context. *Outputs:* link/badge "N problems" opening Problems panel. *Success:* panel opens filtered. *Failure:* no server → show "0 problems" or hide badge; server crash → clear count, offer Restart. **Fallback when LSP unavailable:** Hide badge or show "0 problems"; link still opens panel (empty or message "Open a file to see diagnostics.").
- **Inline diagnostics for @'d files (optional):** *Inputs:* @'d file URIs, their diagnostics. *Outputs:* compact hint "K errors in @'d files" with click-through. *Success:* user sees hint and can jump to Problems or first error. *Failure:* no server → do not show hint. **Fallback when LSP unavailable:** Do not show hint.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

**Fallback when LSP unavailable:** When no LSP server is active for the project or language, @ symbol falls back to text-based or indexed symbol search (FileManager §12.1.4); code blocks in chat have no hover/definition; diagnostics in context are omitted. Optional one-time or dismissible hint to enable/install the LSP server.

**Reference:** OpenCode uses LSP diagnostics to inform the LLM (opencode.ai/docs/lsp/); we extend that to Chat with diagnostics in prompt, LSP-aware @ symbol, and code-block hover/definition.

**Server selection:** By file path → language (extension) → which server(s) handle that extension → project root for that file. Then one server process per (server id, root). Same idea as OpenCode's Info + root function. For **multi-root** (e.g. monorepo), consider sending only roots that have open files or a bounded set in `workspaceFolders` at initialize to avoid slow startup (see §7, §8).

**Threading:** LSP is async (I/O). Run the client in an async runtime (e.g. tokio); keep UI (Iced) responsive (e.g. send results back to main thread for rendering). Avoid blocking the UI on LSP requests.

---

## 6. Scope and Phasing

- **In scope for LSP MVP (this plan):** All features in §1, §5, and **§5.1 (LSP in the Chat Window)**, including: diagnostics, hover, completion, navigation (definition, references, symbol outline), inlay hints, semantic highlighting, code actions, code lens, signature help, request timeout/cancellation, LSP status in UI, per-server enable/disable, fallback when LSP unavailable (heuristic + optional install hint), **diagnostics in Assistant/Interview context**, **@ symbol with LSP workspace/symbol**, **code blocks in chat with hover and go-to-definition**, **Problems link from Chat**, and optional **inline diagnostics hint for @'d files**. Design and research for client-only integration: protocol usage, OpenCode-style server registry and lifecycle, Rust crates, and how it plugs into the File Manager and Chat.
- **Out of scope here:** Full editor implementation details (tabs, buffers, presets) -- those stay in FileManager.md; this doc only covers LSP-specific bits.
- **Phasing:** **LSP is MVP** -- implement with the desktop editor and Chat from the start. Use LSP when available; fallback to text-based/heuristic navigation and optional project index (FileManager §12.1.4) when LSP is disabled or unavailable.

---

## 7. Gaps and open questions (resolved where decided)

- **Document sync mode:** LSP supports **full sync** (entire document on each change) and **incremental sync** (only changed ranges). We should declare incremental in client capabilities when the server supports it to reduce payload and server work. Incremental requires the client to track version and send correct `contentChanges`; if we miss a change, server state can drift (some servers request full re-sync on version mismatch). **Implementation:** Use **incremental sync** when the server advertises `textDocumentSync.change = Incremental`; otherwise use full sync. Client tracks `DocumentState.version` per buffer and sends `contentChanges` in `didChange`; when the server requests full re-sync (e.g. version mismatch or explicit request), send full content in a single `didChange` and continue from that version. See §14.2 (DocumentState), §14.3 (message flow).
- **Debouncing didChange:** Sending every keystroke can flood the server. **Decision:** Debounce `textDocument/didChange` (default **100 ms** after last edit); configurable in Settings. **Implementation:** On buffer edit, start or reset a debounce timer; when the timer fires, send one `didChange` with all changes since last send (or incremental range edits). No send on close without a pending change. See §14.4 (config), §16 (open points).
- **Multi-root workspace:** When the user has multiple project roots (e.g. monorepo or several folders), LSP initialize sends `workspaceFolders`. Sending a huge list can slow startup and increase memory; some clients only send roots that have open files. **Decision:** Send **only roots that have at least one open document**, capped at **10** roots (§14.6). **Implementation:** At initialize, build `workspaceFolders` from the set of roots of currently open documents; cap at 10 (e.g. by recency of last open). When the user opens a file in a new root, spawn (or attach) server for that root; no need to re-initialize existing servers. Dynamically added roots get a server when a file from that root is opened. **Reference:** [emacs-lsp/lsp-mode #3246](https://github.com/emacs-lsp/lsp-mode/issues/3246), [golang/go #75270](https://go.dev/issue/75270) (gopls multi-workspace).
- **Timeout and cancellation:** The LSP spec does not define timeouts; **the client is responsible** for timing out long-running requests and deciding acceptable latency (e.g. hover vs. workspace/symbol). **Decision:** Implement request timeouts (e.g. 5-10 s for hover/completion, longer for workspace symbol); config keys in §14.4. **Implementation:** Before sending a request, register a timeout (per config); on timeout, treat the request as failed (show "Timed out", discard response), and send LSP `$/cancelRequest` with the request id so the server can stop work. On user navigate or edit, cancel in-flight requests for the previous location (send cancel, discard response when it arrives). **Reference:** [language-server-protocol #1916](https://github.com/microsoft/language-server-protocol/issues/1916).
- **Stale responses:** Responses can be invalidated by user edits before they are received (e.g. go-to-definition returns a location that no longer exists). **Decision:** On receiving a response, compare the response's document version (and optionally request id) to the current `DocumentState.version` for that URI. If the version increased since the request was sent, **discard** the response and do **not** re-request automatically (user can retry). For hover/completion/signatureHelp/definition/references, discard only; re-request only when the user explicitly repeats the action. **Implementation:** See §14.3 (Stale response policy). **Reference:** [LSP stale response / versioning](https://github.com/microsoft/language-server-protocol/issues/584).
- **Security:** The LSP specification does not define sandboxing or process isolation. Language servers run as child processes (or over TCP) and typically have full access to project files and often the ability to run tools. **Decision (unchanged):** We rely on host OS and our spawn environment (cwd, env) for isolation. **Implementation:** Spawn servers with cwd set to project root and env limited to app-provided plus user-configured `lsp.servers.<id>.env`; do not pass full host env by default. No network or filesystem sandbox in MVP. For high-security scenarios, consider running LSP servers in a restricted environment (e.g. limited filesystem access, no network) if we ever support that; **out of scope for initial implementation.**

---

## 8. Potential issues and mitigations

Each mitigation is **actionable**: who does what, and when.

| Issue | Mitigation (who, what, when) |
|-------|------------------------------|
| **Server crash or exit** | **Client (LSP layer):** On process exit or broken pipe (e.g. when writing to stdin fails), (1) mark that server's state as Error, (2) clear all diagnostics for documents owned by that server (DiagnosticsCache), (3) notify UI to refresh Problems panel and gutter. **UI:** Show "Error" in status bar for that server; offer "Restart language server" button (or auto-restart with exponential backoff, e.g. 1s, 2s, 4s, cap 30s). **Logging:** Log exit code and stderr tail for debugging. |
| **Server slow or unresponsive** | **Client:** Apply request timeouts (§14.4); on timeout, discard response and show "Timed out". Send LSP cancel on user navigate/edit. **UI:** While a request is in flight and no response yet, show "Waiting for language server..." in status bar; never block UI thread on LSP. **Optional (client):** After N timeouts for a server in a session, throttle or disable heavy features (e.g. workspace symbol) for that server until next restart. |
| **Many open documents** | **Client:** Limit documents pushed to each server (e.g. only currently open tabs, or N most recent per root). **Editor/FileManager:** When a buffer is evicted (FileManager §12.2.1), **client** sends `didClose` for that URI so the server can free memory. **Config:** Optional cap (e.g. max 50 open docs per server) in Settings. |
| **Large workspace at init** | **Client:** At initialize, send only roots that have at least one open document, capped at 10 (§7, §14.6). **When:** During `initialize` request; do not send thousands of paths. |
| **didChange flood** | **Client:** Debounce `didChange` (default 100 ms after last edit; §7, §14.4). When server supports incremental sync, send only `contentChanges`; otherwise full content. **When:** On every buffer edit, start/reset debounce timer; on timer fire, send one `didChange`. |
| **Symbol index staleness (without LSP)** | **FileManager:** §12.2.7 covers invalidation for heuristic index. **When LSP present:** Diagnostics and symbols come from server. **When LSP disabled or unavailable:** Keep regex/heuristic symbol path (FileManager §12.1.4); optional install hint. **Client:** No action for index; fallback is editor/FileManager responsibility. |
| **TCP-only servers (e.g. Godot)** | **User:** Configures a **command** (e.g. `npx godot-lsp-stdio-bridge`) that speaks stdio to the app and TCP to the real server. **Client:** Spawn that command as the LSP server process; no change to client transport (stdio only). **Docs:** Document bridge pattern in user-facing docs; see §10. |

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md

---

## 9. MVP LSP features (summary)

All of the following are **MVP** (in scope when LSP is phased in). They are specified in §1 (Purpose) and §5 (Integration); this section is a short summary.

| Feature | LSP / behavior |
|--------|-----------------|
| Inlay hints | `textDocument/inlayHint` -- parameter names, type hints; render as inline decorations |
| Semantic highlighting | `textDocument/semanticTokens` when supported; fall back to syntax-only |
| Code actions | `textDocument/codeAction`; show in context menu/lightbulb; apply via `workspace/applyEdit` (FileSafe) |
| Code lens | `textDocument/codeLens`; render and invoke actionable links above symbols |
| Signature help | `textDocument/signatureHelp` when cursor in a call |
| Request timeout/cancellation | Configurable timeouts; send LSP cancellation to avoid stale results |
| LSP status in UI | Status bar or indicator (server name, Initializing/Ready/Error) |
| Per-server enable/disable | `lsp.<id>.disabled`, `lsp: false` (OpenCode-style) |
| Fallback when LSP unavailable | Heuristic symbol search, no diagnostics; optional install hint |
| Diagnostics for LLM/Assistant | Feed current diagnostics into Assistant/Interview context (OpenCode-style) |
| **LSP in the Chat Window** | **§5.1:** Diagnostics in Assistant context; @ symbol with LSP workspace/symbol; code blocks in chat with hover and go-to-definition; Problems link from Chat; optional inline diagnostics hint for @'d files |

*(Content fully specified in §1, §5, and §5.1.)*

### 9.1 Additional enhancements enabled by LSP

With LSP as MVP, the following enhancements become possible. Each is marked **Recommended** (implement in Phase 2 or early Phase 3) or **Optional** (as capacity allows). Acceptance criteria are in **§9.1.1** so an implementer knows when each item is done. LSP methods from the [LSP 3.17 specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/).

#### Editor and navigation

| Enhancement | Status | LSP method(s) | Behavior |
|-------------|--------|---------------|----------|
| **Find references** | **Recommended** | `textDocument/references` | Find references command (e.g. Shift+F12): show all usages of the symbol under cursor in a **References** panel or inline list; click to open file at location. Complements Go to definition. |
| **Rename symbol** | **Recommended** | `textDocument/rename`, `textDocument/prepareRename` | Rename symbol (e.g. F2): rename variable/function/type across the workspace. Show preview; apply via `workspace/applyEdit` (through FileSafe). |
| **Format document / selection** | **Recommended** | `textDocument/formatting`, `textDocument/rangeFormatting` | Format document / Format selection (e.g. Shift+Alt+F): one-click format; apply via workspace/applyEdit. |
| **Go to type definition** | Optional | `textDocument/typeDefinition` | For types/interfaces: "Go to type definition" (e.g. Ctrl+K Ctrl+T) opens the type's definition. |
| **Go to implementation(s)** | Optional | `textDocument/implementation` | For interfaces/abstract members: "Go to implementation(s)" shows implementors; open in editor. |
| **Document links** | Optional | `textDocument/documentLink` | Clickable **imports/includes** in the editor (e.g. `use crate::foo` or `import './bar'`); click opens the target file. |
| **Call hierarchy** (LSP 3.17) | Optional | `textDocument/prepareCallHierarchy`, `callHierarchy/incomingCalls`, `callHierarchy/outgoingCalls` | "Call hierarchy" view: incoming and outgoing calls for the symbol under cursor; useful for impact analysis. |
| **Folding ranges** | Optional | `textDocument/foldingRange` | **Semantic folding** (fold by function/block instead of indent/brace only); improves "Fold all" / "Unfold all". |
| **Selection range** | Optional | `textDocument/selectionRange` | **Expand/shrink selection** to semantic unit (e.g. expression → statement → function); improves multi-cursor and refactors. |
| **Document highlight** | Optional | `textDocument/documentHighlight` | **Highlight all references** to the symbol under cursor in the current file (read-only highlight). |

#### Chat and Assistant

| Enhancement | Status | LSP usage | Behavior |
|-------------|--------|-----------|----------|
| **"Fix all" / quick fixes from Chat** | **Recommended** | Diagnostics + `textDocument/codeAction` | Assistant suggests "Apply quick fix" or "Fix all in file" based on LSP diagnostics; user confirms; apply via workspace/applyEdit (FileSafe). Or one-click "Fix" on a diagnostic in the Problems panel. |
| **"Rename X to Y" from Chat** | **Recommended** | `textDocument/rename` | User or Assistant says "Rename `foo` to `bar` in this file/project"; resolve symbol from context or @'d file; invoke LSP rename with confirmation; apply via FileSafe. |
| **"Where is this used?" from Chat** | **Recommended** | `textDocument/references` | User or Assistant asks "Where is `function_name` used?"; invoke LSP references; show results in Chat (compact list) or open **References** panel with full list. |
| **"Format this file" from Chat** | **Recommended** | `textDocument/formatting` | Assistant or user triggers "Format file X"; invoke LSP format; apply via workspace/applyEdit. |
| **Copy type/signature to Chat** | Optional | Hover / `textDocument/hover` | From editor hover (or right-click on symbol): "Copy type to chat" / "Copy signature to chat" copies LSP hover content so user can paste into the next message. |

#### Verification and orchestrator

| Enhancement | Status | Usage | Behavior |
|-------------|--------|--------|----------|
| **LSP diagnostics verification gate** | Optional | `textDocument/publishDiagnostics` (existing) | **Optional** verification criterion at tier boundaries (e.g. end-of-subtask): "No LSP errors in changed/open files" (or "No errors; warnings allowed"). Configurable per tier (e.g. Verification tab: "LSP: block on errors"). If the project has LSP errors in scope, gate fails and the orchestrator can retry or escalate. |
| **LSP diagnostics in evidence** | Optional | Snapshot of diagnostics | When collecting evidence for a run, **attach an LSP diagnostics snapshot** (file, line, severity, message, source) for the project or changed files before/after the iteration. Stored with gate reports under `.puppet-master/evidence/` for audit and "what broke" analysis. |
| **Subagent selection from LSP** | Optional | Diagnostics + language | When selecting a subagent for a task, if **files in scope have LSP errors** for a given language (e.g. Rust), **prefer** the subagent that matches that language (e.g. rust-engineer) so the right specialist addresses the errors. |

#### Interview

| Enhancement | Status | LSP usage | Behavior |
|-------------|--------|-----------|----------|
| **"Structure of this file"** | Optional | `textDocument/documentSymbol` | When the Interview (or user) asks "What's the structure of this file?", use LSP `documentSymbol` to return an outline (symbols with name, kind, range) so the agent or user sees functions, classes, modules without parsing manually. |
| **Diagnostics in interview context** | **Recommended** | Same as Assistant | When the interview analyzes a codebase (e.g. Architecture phase), **include a summary of current LSP diagnostics** for opened or @'d files so the interviewer can note existing issues or tech debt. |

#### Agent-facing LSP tool (Tools.md)

| Enhancement | Status | LSP methods | Behavior |
|-------------|--------|-------------|----------|
| **Promote `lsp` tool to MVP** | **Recommended** | `goToDefinition`, `hover`, `references`, optional `rename` | The **lsp** tool (Plans/Tools.md) is currently experimental (gated by `OPENCODE_EXPERIMENTAL_LSP_TOOL`). With LSP MVP, consider **promoting** it so agents can call `lsp.references`, `lsp.definition`, `lsp.hover` (and optionally `lsp.rename` with user approval) to reason about code and suggest refactors. Enables "find all usages," "what type is this," "rename with user confirm." |

#### Code lens (extended use)

| Enhancement | Status | LSP usage | Behavior |
|-------------|--------|-----------|----------|
| **"Run test" / "Debug" above tests** | Optional | `textDocument/codeLens` | Many servers (e.g. rust-analyzer, gopls) provide **code lens** above test functions: "Run test", "Debug test". We already specify code lens; ensure we **invoke** these (run the test command in Terminal or debugger). |
| **"N references" click → References panel** | Optional | `textDocument/codeLens` + `textDocument/references` | When a code lens shows "3 references", **click** opens the References panel (or inline list) with results from `textDocument/references`. |

**Summary:** Implement **Find references**, **Rename symbol**, and **Format document** in the editor and (where applicable) from Chat as high-value next steps. Add **LSP diagnostics gate** and **LSP snapshot in evidence** as **optional** verification enhancements (Plans/feature-list.md §4 Verification gates). Use **documentSymbol** for Interview "structure of file" and **references/rename** for the agent lsp tool when promoted. Other items (type definition, implementation, document links, call hierarchy, folding range, selection range, document highlight) are natural editor UX improvements once the LSP client supports them.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md, ContractName:Plans/Tools.md

---

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
- Plans/FileManager.md (§6 out of scope, §10 editor enhancements, §11 presets, §12.1.4 symbol search without LSP, §12.2.7 symbol index staleness)
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
  - **Fallback when LSP unavailable:** Heuristic symbol search, no diagnostics; optional install hint (FileManager §12.1.4). *Depends on: Editor/FileManager.*
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
- [ ] Server lifecycle: spawn on first file open for (server, root); restart on crash with backoff.
- [ ] Support bridge pattern: custom command can be a stdio↔TCP bridge (e.g. Godot); document for users.
- [ ] Fallback: when LSP disabled or server missing, keep heuristic symbol search and no diagnostics; optional install hint (FileManager §12.1.4).
- [ ] Diagnostics for LLM/Assistant: include current LSP diagnostics in context fed to Assistant/Interview.
- [ ] **Additional enhancements (§9.1):** textDocument/formatting (format document/selection); textDocument/documentLink (clickable imports); optional: LSP diagnostics verification gate, LSP snapshot in evidence, Chat "Fix all" / "Rename" / "Where is this used?" / "Format file"; promote lsp tool when ready.

---

## 13. GUI requirements and cross-references

Where each LSP feature appears in the UI. FinalGUISpec and FileManager are authoritative for layout; this section maps LSP behavior to those specs.

| LSP feature | UI location | Spec reference | Notes |
|-------------|-------------|----------------|-------|
| **Diagnostics (list)** | Bottom panel → **Problems** tab | FinalGUISpec §7.20 | Table: file, line, message, severity, source. Click → open file at location. Filter by severity. Empty: "No problems detected" when LSP active with zero diagnostics; "Open a file to see diagnostics" when no LSP server is running. |
| **Diagnostics (inline)** | Editor: underlines + **gutter markers** (left of line numbers) | FileManager §10 (editor enhancements) | Severity colors: error (red), warning (amber), info (blue). Gutter: icon or dot per line with diagnostic. |
| **LSP status** | **Status bar** (bottom strip) | FinalGUISpec §3.2, §7.18, §8.1 StatusBar | Show server name + state: e.g. "rust-analyzer: Ready", "Initializing...", "Error: ...". When no server: show nothing (no "no LSP" indicator). |
| **Hover** | **Tooltip** at cursor (or slightly offset) | Editor UX | Rich content: markdown when server provides it; else plain text. Themed; max width to avoid overflow. |
| **Completion** | **Inline list** below cursor (or above if near bottom) | Editor UX | List of items (label, detail, kind icon); select with arrow keys + Enter; optional resolve on select. Trigger: typing, or explicit (e.g. Ctrl+Space). |
| **Signature help** | **Popup** near cursor (e.g. below line) | Editor UX | Current signature + parameter highlight; optional previous/next overload. Dismiss on cursor move or Escape. |
| **Inlay hints** | **Inline decorations** in editor (no buffer change) | Editor UX | Rendered in a different style (muted, smaller font); do not affect cursor/selection. Refresh on document change or on visible range change. |
| **Code actions** | **Context menu** and/or **lightbulb** icon in gutter or on selection | Editor UX | "Quick fix" / "Refactor" entries; apply via workspace/applyEdit (FileSafe). |
| **Code lens** | **Inline links** above applicable lines (e.g. "Run test", "3 references") | Editor UX | Click to invoke (e.g. run test, show references). Optional toggle to show/hide code lens. |
| **Breadcrumbs** | Above or below editor (path-style: file > symbol > block) | FileManager §10.1 | When LSP available, use `documentSymbol` for outline; else heuristic (§10.1). |
| **Go to symbol** | Command palette / quick open (e.g. Ctrl+Shift+O) + dropdown | FileManager §10.2 | List from LSP `documentSymbol` when available; else regex outline (§12.1.4). |
| **Install hint (fallback)** | **Toast** or **dismissible banner** in editor area | Optional | One-time or per-session: "Install rust-analyzer for full support" with link to docs or Settings. |
| **LSP server error / crash** | Status bar; optional Restart action | FinalGUISpec §7.18, §8.1; LSPSupport §8 | Status bar shows "Error: ..." for current editor context. Offer "Restart language server" (status bar context menu or Problems panel when diagnostics cleared). Do not block UI. |
| **Problems link (Chat)** | Chat footer, right of context usage | FinalGUISpec §7.16, §7.20 | Label "N problems" when count > 0, "Problems" when 0. Placement: immediately right of context usage (context circle / "42k/128k"). Opens Problems tab filtered to project; when no project: "Select a project to see diagnostics". |
| **Editor LSP shortcuts** | Editor, context menu | FinalGUISpec §7.18 | F12 = Go to definition; Shift+F12 = Find references; F2 = Rename; Ctrl+Space = completion; Ctrl+. = code actions; Ctrl+Shift+O = Go to symbol. Discoverable in Settings > Shortcuts. |
| **LSP configuration** | **Settings > LSP** tab | FinalGUISpec §7.4.2 | Full GUI control: see below. |

**Empty states:** Problems tab shows "No problems detected" when LSP active with zero diagnostics; "Open a file to see diagnostics" when no LSP server is running. Chat Problems link shows "Problems" (no number) when count is 0.

**GUI feature behavior (inputs, outputs, edge cases, fallback when LSP unavailable):**

- **Diagnostics (list):** *Inputs:* publishDiagnostics per URI. *Outputs:* Problems tab table (file, line, message, severity, source); click → open file at location. *Edge cases:* Server crash → clear list, offer Restart; empty → "No problems detected" or "Open a file to see diagnostics". **Fallback when LSP unavailable:** No diagnostics; show "Open a file to see diagnostics" or hide/empty panel.
- **Diagnostics (inline):** *Inputs:* same. *Outputs:* Underlines + gutter markers. *Edge cases:* Crash → clear underlines/gutter. **Fallback when LSP unavailable:** No underlines or gutter markers.
- **LSP status:** *Inputs:* Server state (Initializing/Ready/Error). *Outputs:* Status bar text. *Edge cases:* No server → show nothing (or "No LSP" per §1.1). **Fallback when LSP unavailable:** Omit or "No LSP".
- **Hover:** *Inputs:* (URI, position). *Outputs:* Tooltip. *Failure:* Timeout → "Timed out", discard; stale → discard. **Fallback when LSP unavailable:** No tooltip.
- **Completion:** *Inputs:* (URI, position, trigger). *Outputs:* Inline list. *Failure:* Timeout/stale → discard. **Fallback when LSP unavailable:** No LSP completions.
- **Signature help / Inlay hints / Code actions / Code lens:** *Outputs:* Popup, decorations, context menu/lightbulb, inline links. *Failure:* Timeout → skip. **Fallback when LSP unavailable:** No feature.
- **Breadcrumbs / Go to symbol:** *Inputs:* documentSymbol. *Outputs:* Outline, symbol list. **Fallback when LSP unavailable:** Heuristic/regex outline (FileManager §10.1, §12.1.4).
- **Install hint (fallback):** *Outputs:* Toast or dismissible banner. **Fallback when LSP unavailable:** Optional one-time or per-session hint to install server.
- **Problems link (Chat):** *Inputs:* Diagnostics count. *Outputs:* "N problems" or "Problems"; click → Problems tab. **Fallback when LSP unavailable:** Show "Problems" (0) or hide; link still opens panel.

**Config surface (Settings > LSP):** The GUI **must** expose all of the following in **Settings > LSP** (FinalGUISpec §7.4.2):

- **Disable automatic LSP server downloads** -- Global toggle (default: off). When on, the app does not auto-download or auto-install any LSP server. Servers already on PATH or already installed are still used.
- **Built-in servers** -- List of all built-in servers (§3.2). Each server has an **Enable** toggle; **all are on by default**. User can turn any server off individually. Per server, user can **configure**: **Environment variables** (key-value), **Initialization options** (key-value or JSON sent in LSP `initialize`).
- **Custom LSP servers** -- Add / edit / remove custom servers. Each custom entry: **Name** (id), **Command** (array of strings), **Extensions** (comma-separated or list), and optionally **Environment variables** and **Initialization options**. **Edit** and **Remove** per row. Same schema as OpenCode (`command`, `extensions`, `env`, `initialization`).
- **Code lens** -- Toggle to show/hide code lens in the editor (default: on). FinalGUISpec §7.18.
- **Custom LSP server validation:** When adding or editing a custom server: (1) **Command** must be non-empty (at least one string; trim whitespace). If empty, show inline error "Command is required" and disable Save/Apply. (2) **Extensions** must be non-empty (at least one extension). If empty, show "At least one file extension is required" and disable Save/Apply. (3) **Name** (id) must be unique among custom servers; if duplicate, show "Name already used" and disable Save/Apply. Saving or applying with invalid fields is not allowed.
- **Initialization options (JSON):** When the user edits **Initialization options** as JSON (built-in or custom servers), validate on blur or on Save. If invalid JSON: show inline error (e.g. "Invalid JSON: unexpected token at line N"), do **not** persist the value, block Save and focus the field. Do not send invalid JSON to the LSP server (use last known valid value or empty object). FinalGUISpec §7.4.2.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md

Settings are persisted in app config (redb); optional project-level overrides. See FinalGUISpec §7.4.2 for full UX detail.

---

## 14. Technical implementation (implementation guide source)

### 14.1 Module and crate layout

- **Decision:** LSP client and server registry live in the **same crate as the editor** (e.g. `puppet-master-rs/src/`) in a dedicated **submodule `src/lsp/`** containing:
  - `client.rs` -- LSP client wrapper (stdio transport, lifecycle, request/response).
  - `registry.rs` -- Server registry (id, extensions, root finder, spawn); reads config.
  - `session.rs` or `server_handle.rs` -- Per-(server_id, root) process handle and state.
  - `document.rs` or `sync.rs` -- Document version tracking and didOpen/didChange/didClose/didSave.
- **Dependencies:** `lsp-types`, chosen LSP client crate (e.g. `lsp-client` or `async_lsp_client`), `tokio` for async. No need for tower-lsp unless implementing a server.

### 14.2 Core data structures (conceptual)

- **LspConfig:** Global and per-server config (disabled, command, extensions, env, initialization). Loaded from app config / redb; project overrides if supported.
- **ServerHandle:** One per (server_id, root). Fields: process handle, optional initialization options, current state (Initializing / Ready / Error), last error message. Map key: `(server_id, root_path)`.
- **DocumentState:** Per open document: URI, version (monotonically increasing on edit), language id, optional server handle reference. Used for sync and stale-response checks.
- **DiagnosticsCache:** Per document or per server: list of `Diagnostic` (uri, range, severity, message, source). Updated on `publishDiagnostics`; cleared when server exits or document closed.

**Error types and handling:**

- **Spawn failure:** Process failed to start (binary not found, permission denied, etc.). **Action:** Log error with server id and root; set ServerHandle state to **Error**; set last error message (e.g. "Failed to start rust-analyzer: command not found"); show user-visible message in status bar (e.g. "LSP Error: rust-analyzer failed to start") and optionally in a toast. Do not retry automatically; user can use "Restart language server" to retry.
- **Init failure:** `initialize` or `initialized` handshake failed (e.g. server returned error or closed). **Action:** Log error; set state to **Error**; set last error message; clear diagnostics for that server's documents; show user-visible message in status bar. Tear down process (send shutdown/exit if possible, then close stdin). Do not retry automatically; user can Restart.
- **Transport error:** Broken pipe, read/write error, or invalid JSON on stdio. **Action:** Log error; set state to **Error**; clear diagnostics for that server; show "LSP Error: connection lost" in status bar; tear down process. Offer "Restart language server" or trigger restart with backoff per policy below.

**Shutdown (order of operations):**

1. Send `shutdown` request to server; wait for `shutdown` response with a **timeout** (e.g. **5 s**). If timeout, log and proceed.
2. Send `exit` notification.
3. Close stdin (and drop write half of transport) so the server can exit.
4. Wait for process exit (with optional short timeout); if it does not exit, kill the process.
5. Remove ServerHandle from registry; clear DiagnosticsCache for that server's documents.

**Restart backoff:**

- **Policy:** Exponential backoff: 1 s → 2 s → 4 s → 8 s → ... up to **max 60 s**. After a successful request (e.g. first successful response after init), reset backoff to 1 s for the next restart. On user-initiated "Restart language server", reset backoff and attempt restart immediately (no delay).
- **Implementation:** Store per (server_id, root): `restart_attempt_count` or `next_retry_delay`; on crash/error, schedule restart after `min(next_retry_delay, 60_000)` ms; on success after init, set `next_retry_delay = 1000`; on explicit Restart, set delay to 0 and restart now.

### 14.3 Message flow

1. **User opens file** → Editor loads buffer → Resolve (path → extension → server id → root) → If server not running for (id, root), spawn process → Initialize handshake → Send `didOpen` with content + version.
2. **User edits** → Buffer content changes → Increment version; **debounce** (e.g. 100 ms) → Send `didChange` (incremental if supported) with version.
3. **Server sends publishDiagnostics** → Client receives → Update DiagnosticsCache for that URI → Notify UI (main thread) → Problems tab and gutter update.
4. **User hovers** → Editor sends (uri, position) → Client sends `textDocument/hover` (with timeout) → On response, check document version; if stale, discard → Show tooltip.
5. **User triggers completion** → Client sends `textDocument/completion` with context → On response, filter/discard if stale → Show list; on select, apply and optionally `completionItem/resolve`.

All LSP I/O on **async task** (tokio); results sent to **main thread** (e.g. via `iced::Command` or channel) for UI updates. Never block UI on LSP.

**Stale response policy:** When a response arrives for a document-scoped request (hover, completion, definition, references, signatureHelp), the client must check whether the document version has changed since the request was sent. Store the document version (from `DocumentState.version` for that URI) at request time; when the response is received, compare to the current `DocumentState.version`. If the current version is **greater** than the version at request time, **discard** the response (do not show tooltip, do not apply completion, do not navigate). Optionally match by request id so only the correct response is discarded. **Do not** automatically re-request; the user can repeat the action (e.g. hover again, trigger completion again) to get a fresh result. For workspace-level requests (e.g. workspace/symbol), version check is per relevant document or omit if no single document applies.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.4 Config schema and storage

- **Keys:** `lsp.enabled` (bool, default true), `lsp.servers.<id>.disabled` (bool), `lsp.servers.<id>.command` (string array), `lsp.servers.<id>.extensions` (string array), `lsp.servers.<id>.env` (object), `lsp.servers.<id>.initialization` (object). **Decision:** Config namespace is `lsp.servers.<id>.*`; support legacy alias `lsp.<id>.disabled` (read/write maps to `lsp.servers.<id>.disabled`). Align with OpenCode schema for compatibility.
- **Storage:** App-level in **redb** (or existing config YAML) under a key like `config.lsp`. Project-level override: optional file in project root (e.g. `.puppet-master/lsp.json`) or key under project id in redb.
- **Debounce / timeouts:** Store in Settings → Editor or Developer: `lsp.didChangeDebounceMs` (default **100**, range 50-500), `lsp.hoverTimeoutMs` (default **5000**), `lsp.completionTimeoutMs` (default **5000**), `lsp.workspaceSymbolTimeoutMs` (default **10000**), `lsp.hoverDelayMs` (default **300**, range 100-1000, delay before sending hover request). All timeouts user-configurable. Document in implementation guide.

### 14.5 Trigger and refresh behavior

- **Completion:** Trigger on typing (all characters) or on explicit shortcut (e.g. Ctrl+Space). Send `CompletionContext` with `triggerKind`: Invoked or TriggerCharacter.
- **Hover:** Trigger on cursor idle; delay **300 ms** (config `lsp.hoverDelayMs`, default 300) before sending hover request to avoid flooding; cancel previous hover request on cursor move.
- **Inlay hints:** Request on document open and on `didChange` (after debounce); optionally on visible range change (scroll). Server may support refresh on demand.
- **Code actions:** Request on context menu open or lightbulb click; pass current range + diagnostics for that range (`CodeActionContext`).
- **Signature help:** Trigger when cursor enters a call (e.g. after `(`); re-request on cursor move within the call.

### 14.6 workspaceFolders policy (decision)

- **Recommendation:** At initialize, send **only roots that have at least one open document**, capped at **10** roots. If user has no open files, send project root if single-root, else empty list. Reduces startup cost and memory; document in implementation guide. Re-initialize not required when opening a file in a new root (server per root handles that).

### 14.7 Virtual documents (Chat code blocks)

Code blocks in Chat messages (§5.1) that are not backed by a project file use **virtual documents** so hover and go-to-definition can still call the LSP.

- **URI scheme:** Use a dedicated scheme so the client and server can distinguish virtual docs from file paths. Example: `puppet-master-virtual://chat/{language_id}/{opaque_id}` where `opaque_id` is a unique id per block (e.g. UUID or message-id + block index). Language id (e.g. `rust`, `typescript`) comes from the block's language tag.
- **Creation:** When the user focuses or hovers over a code block in a Chat message that has a known language id and the project has an LSP server for that language, create a virtual document: assign a URI, set content to the block text, and attach it to the **server for that language and the project root** (same server that would handle a file with that extension). If the block maps to a real project file (e.g. "snippet from src/main.rs"), use the real file URI instead and do not create a virtual doc.
- **Attachment:** Virtual documents are attached to the same (server_id, root) as would be used for a real file of that language in the project. Resolve language id → server id from the registry (e.g. `rust` → rust-analyzer); use project root for that context. Send `textDocument/didOpen` with the virtual URI, language id, and content so the server has the document.
- **Lifecycle:** Send `textDocument/didOpen` when the virtual document is "opened" (e.g. when the user first hovers or requests definition in that block). Send `textDocument/didClose` when the block is no longer needed: when the user scrolls away from that message, when the message is collapsed, or when the Chat view is closed; or after T seconds idle (e.g. 300 s) if implementing eviction by timeout. Optionally retain a bounded set of recently used virtual docs (e.g. last 5) to avoid repeated didOpen/didClose on quick hover. Do not send `didChange` for virtual docs (blocks are immutable); if the user edits the message and the block content changes, treat as a new block (new opaque_id) and close the old virtual doc.
- **Contract for implementer:** (1) Virtual URI never points to disk; (2) one virtual doc per code block instance (same block in UI = same opaque_id); (3) didOpen is sent when the block needs LSP (hover/definition); (4) didClose is sent when the block is evicted or the view is closed; (5) hover/definition requests for that block use the virtual URI and the same (server_id, root) as for that language.

ContractRef: ContractName:Plans/LSPSupport.md

### 14.8 Registry contract (ServerSpec)

The server registry is the single source of truth for which LSP servers exist and how they are started. Each entry is a **server spec** with the following contract (Rust-friendly types below are conceptual; implement using your crate's `PathBuf`, `Result`, and process handle type).

**ServerSpec (conceptual):**

- **id:** `String` -- Unique server identifier (e.g. `"rust"`, `"eslint"`, `"slint-lsp"`). Used in config as `lsp.servers.<id>.*` and as the process key with root.
- **extensions:** `Vec<String>` -- File extensions this server handles (e.g. `[".rs"]`, `[".ts", ".tsx"]`). Used to match an opened file to a server (see §3.6 for primary vs supplementary).
- **root_finder:** `fn(file_path: &Path) -> Option<PathBuf>` -- Given the **currently opened file path** (absolute), returns the project root for this server, or `None` if no root is found (server will not be started for that file). Implementation: take the parent directory of `file_path`, then walk upward until a directory matching the rule for this server id (§3.5) is found; return `Some(dir)` or, when the table specifies "else file's directory", return the file's directory when no marker is found.
- **spawn:** `fn(root: &Path, config: &LspServerConfig) -> Result<ProcessHandle, SpawnError>` -- Starts the LSP server process with **cwd = root** and config overrides (command, env, initialization). Returns a handle to the process (stdio used for JSON-RPC). Called **lazily**: only when the first document open for that **(id, root)** occurs (see below).
- **init_options:** `Option<Value>` -- Optional JSON object sent in the LSP `initialize` request as `initializationOptions`. May be overridden by config `lsp.servers.<id>.initialization`.

**When root_finder is invoked:** On every **document open** (user opens a file in the editor), the client gets the file path, then for each server whose **extensions** match the file's extension, the client calls that server's **root_finder(file_path)**. If it returns `Some(root)`, the client considers that server a candidate for this file (subject to §3.6 primary/supplementary).

**When spawn is called:** **Lazy, per (id, root).** When the client needs an LSP process for a given **(server_id, root)** (e.g. to send `didOpen` for a file that resolved to that root), it looks up whether a process for **(server_id, root)** already exists. If not, it calls **spawn(root, config)** once, stores the resulting `ProcessHandle` keyed by **(server_id, root)**, and uses that process for all documents under that root for that server. If spawn fails, the client does not retry for that (id, root) until the user retries (e.g. "Restart language server") or the config changes.

**Summary for implementer:** (1) Registry is a list of ServerSpec (id, extensions, root_finder, spawn, optional init_options). (2) On file open: path → extensions → for each matching server, root_finder(path) → Option<root>; then apply §3.6 to pick primary and supplementary servers. (3) For each (id, root) that must run: if no process exists, spawn(root, config) and store handle; then send initialize and didOpen. (4) One process per (server_id, root); reuse for all documents under that root for that server.

ContractRef: ContractName:Plans/LSPSupport.md

---

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

The following should be decided at implementation time and documented in the implementation guide:

- **Exact timeout values** (hover, completion, workspace symbol) and whether they are user-configurable in Settings.
- **Debounce default** for didChange (100 ms recommended; range 50-200 ms).
- **workspaceFolders cap** (10 recommended) and policy when cap exceeded (e.g. LRU by last open).
- **Settings > LSP** is a dedicated tab under Settings (FinalGUISpec §7.4.2); no further location decision needed.
- **Project-level LSP config:** File path and format (e.g. `.puppet-master/lsp.json`) and merge rules with app-level config.
- **Completion trigger characters:** Use server-provided list from capability or default to all.
- **Inlay hint refresh:** On every didChange (after debounce) vs. on visible range change only (performance vs. freshness).
- **Code action apply path:** Exact integration point with FileSafe (e.g. same applyEdit entry as agent edits) and user confirmation for destructive actions.

---

## Appendix: Implementation plan checklist (single ordered list for implementers)

Use this as the **single, implementation-ready checklist** an agent can follow. Cross-references: §5.1 = LSP in the Chat Window; §9.1 = Additional enhancements (optional/recommended). FinalGUISpec §7.16 = Chat, §7.20 = Bottom Panel (Problems), §7.4.2 = Settings > LSP; FileManager §10.10, §12.1.4.

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

- [ ] Implement textDocument/definition (Go to definition); F12 or Ctrl+Click opens definition in File Editor. Fallback: heuristic/index (FileManager §12.1.4).
- [ ] Implement textDocument/codeAction; show context menu or lightbulb; apply via workspace/applyEdit through FileSafe.
- [ ] Implement textDocument/codeLens; render actionable links above symbols; support invoke (e.g. run test).
- [ ] Implement textDocument/signatureHelp when cursor in call; show popup with signature and parameter highlight.
- [ ] Implement textDocument/inlayHint; render as inline decorations (no buffer change).
- [ ] Implement textDocument/semanticTokens when supported; fall back to syntax-only.
- [ ] Implement textDocument/references (Find references); add References panel or inline list in bottom panel; shortcut Shift+F12; click opens file at location.
- [ ] Implement textDocument/rename and textDocument/prepareRename (Rename symbol); F2; show preview; apply via workspace/applyEdit (FileSafe).
- [ ] Implement textDocument/formatting and textDocument/rangeFormatting (Format document / Format selection); shortcut e.g. Shift+Alt+F; apply via workspace/applyEdit.
- [ ] Use documentSymbol (and workspace/symbol) for breadcrumbs and Go to symbol (FileManager §10.1, §10.9). Fallback: regex outline §12.1.4.
- [ ] Request timeout and cancellation; discard or re-request on stale document version. Per-server enable/disable: honor lsp.<id>.disabled and lsp: false. Settings > LSP per FinalGUISpec §7.4.2.
- [ ] Server lifecycle: spawn on first file open for (server, root); restart on crash with backoff. Bridge pattern: custom command can be stdio↔TCP bridge (e.g. Godot); document for users.

### Phase 3: Chat LSP (§5.1)

- [ ] **Diagnostics in Assistant context:** When building context for next Assistant/Interview turn, include summary of current LSP diagnostics (file, line, message, severity, source) for project or @'d/recently edited files.
- [ ] **@ symbol with LSP:** When LSP is available, @ menu includes symbols from LSP workspace/symbol (and optionally documentSymbol); results show path, line, kind.
- [ ] **Code blocks in messages:** Code blocks in assistant/user messages support LSP hover (tooltip) and click-to-definition (e.g. Ctrl+Click); use virtual document or real file URI when block maps to project file; definition opens in File Editor.
- [ ] **Problems link from Chat:** Chat footer or message area offers link or badge (e.g. "N problems") that opens Problems panel (FinalGUISpec §7.20) filtered to project or context.
- [ ] **Optional:** When user has @'d files, show compact hint (e.g. "2 errors in @'d files") with click-through to Problems or first error.
- [ ] Fallback when LSP unavailable: @ symbol uses text-based or indexed symbol search (FileManager §12.1.4); code blocks no hover/definition; omit diagnostics from context.

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

- **When it runs:** After each **iteration** completes (before promoting to next tier). Optionally configurable to run at **subtask** boundary only, **task** boundary only, or **phase** boundary only; default: run at **subtask** boundary (after last iteration of the subtask, before promotion to task).
- **Tier boundaries:** Configurable per tier: phase, task, subtask. At least one of these must be enabled for the gate to run; when the orchestrator reaches that boundary (e.g. "subtask passed"), the LSP gate runs as one of the criteria before the tier is marked passed.
- **Scope:** What files are checked. One of:
  - **`changed`** -- Only files that were modified in the last iteration (or in the current subtask). Requires tracking changed paths (e.g. from git diff or execution engine "files touched").
  - **`open`** -- Only files currently open in the editor (or in the run context). Requires LSP client to know "open" set for the run.
  - **`project`** -- All project files that have an LSP server (bounded: e.g. under project root, or only files with open documents). Default: **`changed`** to keep checks fast and relevant.
- **"No LSP errors" meaning:** Configurable severity threshold:
  - **`error`** -- Gate passes if there are **no diagnostics with severity Error** in scope. Warnings and Info are ignored.
  - **`error_and_warning`** -- Gate passes if there are **no diagnostics with severity Error or Warning** in scope. Info is ignored.
  - Default: **`error`**.

#### Config

- **Where:** Verification tab (Settings or Config → Verification). Can be **global** (one setting for all tiers) or **per-tier** (override per phase/task/subtask). Recommendation: global `lsp_gate` with optional per-tier override in tier config.
- **Schema (config key e.g. `verification.lsp_gate` or `lsp_gate`):**

```json
{
  "lsp_gate": {
    "enabled": true,
    "scope": "changed",
    "block_on": "error",
    "tier_boundaries": ["subtask"],
    "timeout_seconds": 15
  }
}
```

| Field | Type | Values | Default |
|-------|------|--------|--------|
| `enabled` | bool | true, false | false |
| `scope` | string | `"changed"` \| `"open"` \| `"project"` | `"changed"` |
| `block_on` | string | `"error"` \| `"error_and_warning"` | `"error"` |
| `tier_boundaries` | string[] | `["phase"]`, `["task"]`, `["subtask"]`, or combination | `["subtask"]` |
| `timeout_seconds` | number | positive integer | 15 |

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
- **Content:** Single JSON object: `{ "captured_at": "ISO8601", "scope": "changed"|"open"|"project", "project_root": "...", "diagnostics": [ {...}, ... ] }`.

#### When captured

- **Before run:** Not required for gate-only use.
- **After run (when gate runs):** Yes. When the LSP gate verifier runs (at tier boundary), it captures the snapshot **at that moment** (after iteration, before promotion). So: **one snapshot per gate run** at the time the gate is evaluated.
- **Optional "before and after":** For richer audit, config could allow capturing snapshot before iteration and after; then two files per run. MVP: **after only** (at gate run time).

#### Who triggers

- **Gate runner** (via LspGateVerifier). The verifier is invoked by the gate runner when a criterion with `verification_method: "lsp"` is evaluated. The verifier (1) gets diagnostics from LSP client for scope, (2) writes snapshot JSON to `.puppet-master/evidence/lsp-snapshots/`, (3) attaches evidence to VerifierResult (path to snapshot file), (4) returns passed/failed. EvidenceStore (if wired) can also persist the path; GateReport criteria already carry per-criterion evidence from VerifierResult.

ContractRef: ContractName:Plans/LSPSupport.md

### 17.3 Subagent selection from LSP

- **Where in the flow:** When the orchestrator is about to **select a subagent for the next subtask** (or task), it can optionally query LSP diagnostics for **files in scope** for that subtask/task. **Decision:** Default **off**. Config key `orchestrator.lsp_subagent_bias` (bool, default false). When true, call `get_diagnostics_for_paths` and apply bias toward matching-language subagent. If any file has diagnostics (e.g. errors) from a language server X, **prefer** the subagent that matches language X (e.g. rust-analyzer → rust-engineer, pyright → python-pro).
- **"Files in scope" definition:** One of (configurable or fixed):
  - **Changed in last iteration** -- Files modified in the most recent iteration (same as LSP gate scope "changed" for consistency).
  - **Open in editor** -- Files currently open in the run/context.
  - **Task's file list** -- If the task/subtask has an explicit list of files (e.g. from PRD or plan), use that list.
  - Default: **changed in last iteration** for consistency with LSP gate.
- **Documentation:** This behavior is specified in **Plans/orchestrator-subagent-integration.md** (Subagent selection from LSP) and summarized here. Implement in the same place that performs `select_for_tier`: after building tier context, optionally call LSP client `get_diagnostics_for_paths(scope_paths)`; from the returned diagnostics, derive language(s) from `source` or from file extension → server id mapping; then bias subagent selection toward matching language (e.g. add to ProjectContext or TierContext: "prefer_subagents": ["rust-engineer"] when Rust errors present).

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md

### 17.4 Failure modes (LSP gate and diagnostics)

| Failure | Behavior | Evidence / reporting |
|---------|----------|----------------------|
| **LSP client not ready** | Gate does not run, or runs with a **skip** result. **Decision:** When LSP gate is enabled but client not ready: **skip** the criterion; set `actual: "LSP client not ready"`. Config: `lsp_gate.when_unavailable`: `skip` | `pass` | `fail`, default **skip**. Gate does not block on LSP startup. |
| **Timeout when querying diagnostics** | LspGateVerifier uses a timeout (e.g. `timeout_seconds` from config). On timeout: **fail** the criterion with `actual: "LSP diagnostics query timed out"`. Attach partial snapshot if any diagnostics were collected before timeout. |
| **No server for language** | For some files in scope there is no LSP server (e.g. unknown extension). Those files contribute **no diagnostics** (empty list). Gate passes for that file; only files with a server are checked. No special failure. |
| **Server crash or disconnected** | Same as "LSP client not ready": skip or pass per config; do not fail the entire gate unless config says "fail when LSP unavailable". |
| **Empty scope (changed/open/project)** | If scope resolves to zero files (e.g. no files changed), gate **passes** (nothing to check). |

ContractRef: ContractName:Plans/LSPSupport.md

Implement these in `LspGateVerifier` and in the LSP client's `get_diagnostics_for_paths` (timeout, not-ready check).
