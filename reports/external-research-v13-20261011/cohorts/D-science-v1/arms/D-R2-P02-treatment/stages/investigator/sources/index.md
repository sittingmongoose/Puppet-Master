# Source index — investigator discovery

This is a navigable index into source-map.json. Source IDs are stable identifiers; do not rebind an ID to a different page. The map records the exact URL, retrieved version/commit when applicable, locator, access timestamp, observed operation, governing condition/default/exception, and applicability. Browser retrieval timestamps are batch timestamps because individual fetch seconds are not exposed; search-result or JavaScript-limited evidence is called out per record. These are primary product/runtime/platform references and upstream regression/test records. No code from a source was downloaded or executed.

## Extension interfaces and web rendering

- [VSC-CUSTOM](https://code.visualstudio.com/api/extension-guides/custom-editors) — custom editor model/view, readonly preview and lifecycle precedent.
- [VSC-WEBVIEW](https://code.visualstudio.com/api/extension-guides/webview) — renderer capability minimization, CSP and sanitization guidance.
- [VSC-HOST](https://code.visualstudio.com/api/advanced-topics/extension-host) — local Node, browser Worker and remote host configurations. Search excerpt only; see source map.
- [VSC-TRUST](https://code.visualstudio.com/docs/editing/workspaces/workspace-trust) — trust/restricted-mode limits; malicious code can ignore it.
- [ELECTRON-PROCESS](https://www.electronjs.org/docs/latest/tutorial/process-model) — multi-process/utility process overview. Search excerpt only; see source map.
- [ELECTRON-UTILITY](https://www.electronjs.org/docs/latest/api/utility-process) — utility process APIs, inherited defaults, messaging and lifecycle.
- [ELECTRON-SANDBOX](https://www.electronjs.org/docs/latest/tutorial/sandbox) — renderer sandbox defaults, IPC and exceptions.

## WASM/WASI runtime, limits, history and tests

- [WASMTIME-SECURITY](https://github.com/bytecodealliance/wasmtime/blob/main/docs/security.md) — WebAssembly/WASI security model.
- [WASMTIME-WASI](https://github.com/bytecodealliance/wasmtime/blob/main/docs/WASI-tutorial.md) — preopened directory capabilities; search excerpt.
- [WASMTIME-LIMITS](https://docs.wasmtime.dev/api/wasmtime/struct.Config.html) — fuel and epoch interruption behavior.
- [WASMTIME-STORE](https://docs.rs/wasmtime/latest/wasmtime/struct.Store.html) — future resource-growth limits and epoch deadlines.
- [WASMTIME-FS-ADVISORY](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-vqjp-4c8c-hfgg) — symlink/trailing-slash filesystem escape, affected versions and OS/kernel condition.
- [WASMTIME-RES-ADVISORY](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-852m-cvvp-9p4w) — guest-controlled host memory/resource exhaustion and default-limit caveat.
- [WASMTIME-FUEL-ADVISORY](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm) — WASI polling bypass of fuel; advisory body had no parsed text in the browser, so the release fix list is paired below.
- [WASMTIME-RELEASE](https://github.com/bytecodealliance/wasmtime/releases/tag/v49.0.2) — v49.0.2 release/commit and recorded security fixes.
- [WASMTIME-TESTS](https://docs.wasmtime.dev/contributing-testing.html) — upstream WASI test command and test-program paths; guidance only, not run.

## Search/cache storage

- [SQLITE-FTS](https://www.sqlite.org/fts5.html) — external-content FTS sync invariants, rebuild and integrity-check.
- [SQLITE-TX](https://www.sqlite.org/lang_transaction.html) — transaction and busy-writer semantics.
- [SQLITE-ATOMIC](https://www.sqlite.org/atomiccommit.html) — single-database atomic commit scope.

## OS containment and platform constraints

- [APPLE-SANDBOX](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox?changes=_4) — user-selected files and security-scoped access lifetime; source page requires JavaScript.
- [APPLE-PROCESS](https://developer.apple.com/documentation/foundation/process?changes=_8) — child processes inherit parent sandbox; source page requires JavaScript.
- [APPLE-XPC](https://developer.apple.com/documentation/XPC?language=_11) — process separation and privilege isolation; search excerpt.
- [WIN-APPCONTAINER](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation) — capability-based Windows process isolation.
- [WIN-JOB](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) — group resource limits, process termination and breakaway caveats.
- [LINUX-CGROUP](https://www.kernel.org/doc/html/v6.6/admin-guide/cgroup-v2.html) — Linux cgroup v2 CPU/memory controls; versioned v6.6 docs.
- [LINUX-SECCOMP](https://man7.org/linux/man-pages/man2/seccomp.2.html) — syscall filter actions and kernel-version-conditioned flags; search excerpt.

See [source-map.json](../source-map.json) for complete per-source evidence metadata and bounded observations.
