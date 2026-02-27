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

