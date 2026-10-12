# Critic source index

This bounded index supports [critique.md](../critique.md). Stable IDs are defined in [source-map.json](../source-map.json), which records exact URLs, visible version/commit, locator, UTC access, observed operation, governing conditions, and applicability.

- **CRIT-WSEC** — [Wasmtime v49.0.2 security guide](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/docs/security.md): Wasm memory/import sandbox model and defense-in-depth; supports CB-01.
- **CRIT-WCONFIG** — [Wasmtime v49.0.2 config source](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/crates/wasmtime/src/config.rs#L3306-L3517): fuel and epoch setup conditions; supports CB-01.
- **CRIT-BWRAP** — [Bubblewrap v0.13.0 README](https://github.com/containers/bubblewrap/blob/v0.13.0/README.md): caller-defined policy and namespace limits; independently reviewed for the cross-platform comparison.
- **CRIT-JSONRPC** — [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification): request/response and notification error behavior; supports CB-02.
- **CRIT-WIT** — [WIT reference](https://component-model.bytecodealliance.org/design/wit.html): typed interface and resource model; supports CB-02.
