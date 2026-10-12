# Critic truth source index — D-R2-P02-treatment

Use [critique.md](../critique.md) for dispositions and [source-map.json](../source-map.json) for exact URLs, versions, locators, observed conditions, applicability, and review timestamps. Existing investigator source IDs retain their original bindings.

## Runtime limits, release history, and path behavior

- **WASMTIME-NOSTDIO** — [GHSA-gqmc-89g8-p25r](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-gqmc-89g8-p25r): affected WASI Preview 2 default sink when stdout/stderr are not configured; bounded stream workaround and exact patch ranges.
- **WASMTIME-RES-ADVISORY** — [GHSA-852m-cvvp-9p4w](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-852m-cvvp-9p4w): host-side resource exhaustion and release-dependent defaults.
- **WASMTIME-FS-ADVISORY** — [GHSA-vqjp-4c8c-hfgg](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-vqjp-4c8c-hfgg): symlink/trailing-slash filesystem escape and OS/kernel exception.
- **WASMTIME-FUEL-ADVISORY** — [GHSA-j366-h8gg-77pm](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm): WASI poll_oneoff fuel issue.
- **WASMTIME-RELEASE** — [Wasmtime v49.0.2](https://github.com/bytecodealliance/wasmtime/releases/tag/v49.0.2): release date/commit and recorded fixes, including both fuel and no-stdio issues.

## Render and process boundaries

- **VSC-WEBVIEW** — [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview): local resource roots, CSP, sanitization, and their limits.
- **ELECTRON-UTILITY** — [Electron utilityProcess API](https://www.electronjs.org/docs/latest/api/utility-process): Node integration, inherited environment/session options, and graceful child termination.
- **WIN-JOB** — [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): process-tree and breakaway conditions.
- **APPLE-PROCESS** — [Foundation Process](https://developer.apple.com/documentation/foundation/process?changes=_8), and **APPLE-XPC** — [Apple XPC documentation](https://developer.apple.com/documentation/XPC?language=_11): platform-specific child/service boundary conditions.

## Search consistency

- **SQLITE-FTS** — [SQLite FTS5](https://www.sqlite.org/fts5.html): external-content synchronization and rebuild invariants.
