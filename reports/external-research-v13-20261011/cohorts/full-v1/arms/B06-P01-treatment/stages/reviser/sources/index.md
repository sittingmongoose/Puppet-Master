# Reviser source index

Use [final.md](../final.md) for the complete proposal and dispositions. [source-map.json](../source-map.json) contains the canonical stable-ID records used by the final proposal, the reviser's recheck observations, and complete unchanged copies of each predecessor source map.

## Runtime and Wasm

- **WSEC** — [Wasmtime security guide, v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/docs/security.md): checked guest memory and explicit imports; runtime and embedder caveats.
- **WCONFIG** — [Wasmtime config source, v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/crates/wasmtime/src/config.rs#L3306-L3517): fuel defaults, epochs, and blocked host calls.
- **WLIMIT** — [Wasmtime resource limits, v49.0.2](https://github.com/bytecodealliance/wasmtime/blob/v49.0.2/crates/wasmtime/src/runtime/limits.rs#L1017-L1058): guest allocation controls versus host allocations.
- **WREL**, **WFUEL**, **WMEM** — [Wasmtime 49.0.2 release](https://github.com/bytecodealliance/wasmtime/releases/tag/v49.0.2), [fuel advisory](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm), and [host-allocation advisory](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-gqmc-89g8-p25r): runtime fixes and affected conditions.
- **WASI-REL** — [WASI release and toolchain matrix](https://github.com/bytecodealliance/wasi.dev/blob/main/docs/releases/index.md): component/toolchain support status.
- **WIT** — [Component Model WIT reference](https://component-model.bytecodealliance.org/design/wit.html): typed interfaces and resources; does not define application authorization/invariants.

## Linux isolation and temporary storage

- **BWRAP-REL**, **BWRAP-README**, **BWRAP-TEST** — [Bubblewrap v0.13.0 release](https://github.com/containers/bubblewrap/releases/tag/v0.13.0), [tagged README](https://github.com/containers/bubblewrap/blob/v0.13.0/README.md), and [tagged security tests](https://github.com/containers/bubblewrap/blob/v0.13.0/tests/test-run.sh): kernel/build conditions, caller-defined policy, namespace and mount caveats, and upstream test examples (read only; not run here).
- **FP-CALLER** — [Flatpak caller source](https://github.com/flatpak/flatpak/blob/main/common/flatpak-run.c#L2842-L2859): example policy-to-bubblewrap argument construction; mutable main branch.
- **FLATPAK-USERNS** — [Flatpak user-namespace requirements](https://github.com/flatpak/flatpak/wiki/User-namespace-requirements): unprivileged namespace prerequisites and fallback tradeoff.
- **CGROUP** — [Linux cgroup v2 documentation](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html): controller setup and CPU/memory/process controls; memory limits are not disk quotas.
- **TMPFS** — [Linux kernel tmpfs documentation](https://cdn.kernel.org/doc/html/latest/filesystems/tmpfs.html): explicit byte and inode sizing options for the proposed private temporary filesystem.

## Windows isolation and process lifecycle

- **WIN-APP** — [Microsoft AppContainer isolation](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation): file, process, and device conditions, including container-local files.
- **WIN-LAUNCH** — [Implementing an AppContainer](https://learn.microsoft.com/en-us/windows/win32/secauthz/implementing-an-appcontainer): launch attributes and capabilities.
- **WIN-JOB**, **WIN-JOB-BASIC**, **WIN-JOB-EXTENDED** — [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [basic limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information), and [extended limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information): child association, last-handle kill behavior, breakaway/nesting, and configured resource controls.

## File selection, protocol, and permission UX

- **WIN-CAPS** — [Windows capability declarations](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/app-capability-declarations): picker versus broad library access.
- **XDG-FILE** — [XDG FileChooser portal v4](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.FileChooser.html): selected-file access and filter semantics.
- **XDG-DOCS** — [XDG Documents portal v5](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.Documents.html): session/permanent grants and host-path exposure.
- **JSONRPC** — [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification): request/response, notification, and batch semantics.
- **MOZ-PERM** — [Firefox permission/update UX guidance](https://extensionworkshop.com/documentation/develop/request-the-right-permissions/): UI precedent only, not a desktop security control.

## Independent breadth review records

The final proposal resolves the three breadth findings directly. Their separate IDs remain available in source-map.json and their complete source records are preserved under the critic-breadth predecessor map.

- **CRIT-WSEC** — Wasmtime memory/import boundary for the in-process comparator.
- **CRIT-WCONFIG** — fuel/epoch configuration conditions.
- **CRIT-BWRAP** — bubblewrap policy-construction limits.
- **CRIT-JSONRPC** — request/response and notification behavior.
- **CRIT-WIT** — typed interfaces/resources versus domain authorization.
