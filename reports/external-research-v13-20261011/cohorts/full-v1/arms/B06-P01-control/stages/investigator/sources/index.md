# Research source index

Bounded index of primary documentation, repository files, tests, and advisories inspected during brief-only discovery. Full-page copies were not retained. IDs are immutable for this stage; additions use new IDs.

| ID | Source | Main use |
|---|---|---|
| S01 | [Figma Plugin Manifest](https://developers.figma.com/docs/plugins/manifest/) | Manifest/API version, domain permissions and iframe caveat. |
| S02 | [Figma network requests](https://developers.figma.com/docs/plugins/making-network-requests/) | Deny-all/allowlist flow, exact domains, user-visible reason. |
| S03 | [Figma UI messages](https://developers.figma.com/docs/plugins/creating-ui/) | Iframe serialization and origin/plugin-ID advice. |
| S04 | [Figma resource links](https://developers.figma.com/docs/plugins/resource-links/) | Remote resource and eval bridge caveat. |
| S05 | [VS Code Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host) | Separate host locations and stability design. |
| S06 | [VS Code runtime security](https://code.visualstudio.com/docs/configure/extensions/extension-runtime-security) | Same permissions, publisher trust and signatures. |
| S07 | [VS Code API reference](https://code.visualstudio.com/api/references/vscode-api) | Edit/apply behavior and confirmation metadata. |
| S08 | [VS Code issue #146964](https://github.com/microsoft/vscode/issues/146964) | Edit failure history and regression precedent. |
| S09 | [WIT Reference](https://component-model.bytecodealliance.org/design/wit.html) | Typed component contract. |
| S10 | [Wasmtime security at v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/docs/security.md) | Import and WASI capability boundary. |
| S11 | [Wasmtime StoreLimitsBuilder](https://docs.wasmtime.dev/api/wasmtime/struct.StoreLimitsBuilder.html) | Explicit resource limits and unpinned dev-doc caveat. |
| S12 | [Wasmtime fuel bypass advisory](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm) | Version/condition-specific issue-to-fix history. |
| S13 | [Wasmtime releases](https://github.com/bytecodealliance/wasmtime/releases) | v49.0.2 patch cadence/artifacts. |
| S14 | [Linux Landlock](https://docs.kernel.org/userspace-api/landlock.html) | Linux filesystem sandbox and ABI limits. |
| S15 | [Windows AppContainer](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation) | Windows OS sandbox options. |
| S16 | [Zed extension development](https://zed.dev/docs/extensions/developing-extensions) | WASM/Rust authoring and toolchain burden. |
| S17 | [Zed tar-symlink advisory](https://github.com/zed-industries/zed/security/advisories/GHSA-59p4-3mhm-qm3r) | Archive-to-host escape and fixed version. |
| S18 | [Zed archive.rs at v0.224.4](https://github.com/zed-industries/zed/blob/v0.224.4/crates/util/src/archive.rs) | Path checks and ZIP traversal tests. |
| S19 | [Zed wasm_host.rs at v0.224.4](https://github.com/zed-industries/zed/blob/v0.224.4/crates/extension_host/src/wasm_host.rs) | WASI preopens, worker loop and containment guard. |
| S20 | [TUF security properties](https://theupdateframework.io/docs/security/) | Rollback/freeze/key risks in update systems. |

No untrusted extension or downloaded executable was installed or executed. No implementation tests or production security audit were performed.