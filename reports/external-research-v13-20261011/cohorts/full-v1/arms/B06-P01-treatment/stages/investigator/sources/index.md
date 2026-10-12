# Source index

Bounded notes from primary project, platform, standards, and release materials inspected for brief-only discovery. Each stable source ID is used in discovery.md and source-map.json. The map records exact URLs, visible versions/commits, locators, observed operations, conditions/defaults/exceptions, applicability, and observed UTC windows.

## Runtime and interface

- WSEC — [Wasmtime security.md at v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/docs/security.md): Wasm import boundary and runtime defense-in-depth caveats.
- WCONFIG — [Wasmtime config.rs at v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/crates/wasmtime/src/config.rs#L3306-L3517): fuel/epoch settings, defaults, and blocking-host-call limitation.
- WLIMIT — [Wasmtime limits.rs at v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/crates/wasmtime/src/runtime/limits.rs#L1017-L1058): guest caps do not account for every host allocation.
- WREL — [Wasmtime 49.0.2 release](https://github.com/bytecodealliance/wasmtime/releases/tag/v49.0.2): pinned release and patch list.
- WFUEL — [WASI Preview 0 fuel advisory](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm): affected call path and patched versions.
- WMEM — [WASI host-allocation advisory](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-gqmc-89g8-p25r): default stream allocation edge case.
- WASI-REL — [WASI release matrix](https://github.com/bytecodealliance/wasi.dev/blob/main/docs/releases/index.md): 0.2/0.3 status and uneven toolchain support.
- WIT — [Component Model WIT guide](https://component-model.bytecodealliance.org/design/wit.html): interface contract language.

## Linux process isolation and resources

- BWRAP-REL — [Bubblewrap 0.13.0 release](https://github.com/containers/bubblewrap/releases/tag/v0.13.0): release commit and kernel/build conditions.
- BWRAP-README — [Bubblewrap README at v0.13.0](https://github.com/containers/bubblewrap/blob/v0.13.0/README.md): namespaces and policy/argument limitations.
- BWRAP-TEST — [Bubblewrap test-run.sh at v0.13.0](https://github.com/containers/bubblewrap/blob/v0.13.0/tests/test-run.sh): network and file-denial test cases; read only, not executed here.
- FP-CALLER — [Flatpak caller source](https://github.com/flatpak/flatpak/blob/main/common/flatpak-run.c#L2842-L2859): higher-level host translates a no-network policy into bwrap arguments; mutable main branch.
- FLATPAK-USERNS — [Flatpak user-namespace requirements](https://github.com/flatpak/flatpak/wiki/User-namespace-requirements): feature availability and fallback tradeoff; dated wiki.
- CGROUP — [Linux cgroup v2 documentation](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html): limits are inactive until configured; host control required.

## Windows process isolation and file access

- WIN-APP — [AppContainer isolation](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation): resource categories and conditions.
- WIN-LAUNCH — [Implementing an AppContainer](https://learn.microsoft.com/en-us/windows/win32/secauthz/implementing-an-appcontainer): process launch attributes and capability SIDs.
- WIN-JOB — [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): limits and process-tree termination caveats.
- WIN-JOB-BASIC — [JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information): explicit time/process limits, kill-on-close, and breakaway flags.
- WIN-JOB-EXTENDED — [JOBOBJECT_EXTENDED_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information): configured job/process memory limits and peak accounting.
- WIN-CAPS — [App capability declarations](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/app-capability-declarations): picker versus broad library permissions.

## File-dialog, protocol, and consent patterns

- XDG-FILE — [XDG FileChooser](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.FileChooser.html): chooser and filter semantics.
- XDG-DOCS — [XDG Documents portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.Documents.html): read/write/persistent document grants.
- JSONRPC — [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification): request IDs, errors, notification and batch semantics.
- MOZ-PERM — [Firefox permission guidance](https://extensionworkshop.com/documentation/develop/request-the-right-permissions/): analogous update/optional-permission user flow.
