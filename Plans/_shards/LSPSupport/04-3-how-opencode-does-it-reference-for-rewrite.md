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

