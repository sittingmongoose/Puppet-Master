# Bounded primary-source index — reviser

Source identity, version/commit, locator, access time, operation, governing condition/default/exception, and applicability are in [source-map.json](../source-map.json). IDs S01–S21 retain their investigator bindings. S22 retains the critic-truth binding. B01–B03 retain the critic-breadth bindings. The reviser rechecks are appended as separate observations; no ID is silently rebound.

## Protocol, resources, and process containment

- [S01 — Language Server Protocol 3.17](https://raw.githubusercontent.com/microsoft/language-server-protocol/gh-pages/_specifications/lsp/3.17/specification.md): capability exchange, progress correlation, and cancellation limitations. Pattern only, not an export protocol.
- [S02 — Linux cgroup v2](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html): process membership, controller availability/delegation, overcommit, CPU/memory/I/O controls, and cgroup.kill conditions.
- [S03 — Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): job process membership, descendant behavior, breakaway exceptions, and job termination.
- [S04 — Windows job memory limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information): committed virtual memory and required limit flags.
- [S05 — Windows job CPU rate control](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information): weight/cap policy and availability conditions.
- [S06 — Wasmtime StoreLimitsBuilder](https://docs.rs/wasmtime/latest/wasmtime/struct.StoreLimitsBuilder.html): per-linear-memory limits and defaults.
- [S07 — Wasmtime Config](https://docs.rs/wasmtime/latest/wasmtime/struct.Config.html): opt-in fuel and epoch interruption.
- [S08 — Wasmtime WASI filesystem preopens](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html): explicit directory capabilities.
- [S09 — Apple App Sandbox file access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox): protected resources and selected-file access.
- [S10 — Apple archived App Sandbox inheritance guidance](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html): static inherited rights and dynamic file handoff; archived guidance requiring deployment-version recheck.
- [S19 — Windows AppContainer](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation): least-privilege access controls, separate from Job resource limits.
- [S20 — Linux Landlock](https://www.kernel.org/doc/html/latest/userspace-api/landlock.html): conditional filesystem/network access rules and inherited-handle caveats.
- [S22 — Linux setsid(2)](https://man7.org/linux/man-pages/man2/setsid.2.html): a non-process-group-leader child can create a new session/process group, so original-group signaling does not establish descendant teardown. Direct open timed out; reviser search returned the manual contents.

## Converter behavior, presets, and destination commit

- [S11 — Pandoc filters](https://pandoc.org/filters.html): executable JSON filter and embedded Lua patterns.
- [S12 — Pandoc 3.8.3 release](https://github.com/jgm/pandoc/releases/tag/3.8.3): tagged fixes for output regressions; commit 568dab1.
- [S13 — Pandoc issue 11275](https://github.com/jgm/pandoc/issues/11275): SVG/WeasyPrint regression.
- [S14 — Pandoc issue 11256](https://github.com/jgm/pandoc/issues/11256): Typst smart-quote regression.
- [S15 — LibreOffice conversion filter table](https://help.libreoffice.org/latest/en-US/text/shared/guide/convertfilters.html): distinct extension, filter name, media type, and parameter identity.
- [S16 — Linux rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html): same-filesystem replacement, EXDEV, and NFS retry ambiguity.
- [S17 — Windows ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew): same-volume requirements and partial-failure cases.
- [S18 — Linux fsync(2)](https://www.man7.org/linux/man-pages/man2/fsync.2.html): file and directory durability limits and late errors.
- [S21 — Pandoc security note](https://pandoc.org/MANUAL.html#a-note-on-security): filesystem risk from filters/custom writers and limited sandbox scope.

## Scratch capacity and macOS helper alternatives

- [B01 — Linux kernel XFS documentation](https://docs.kernel.org/admin-guide/xfs.html): user/project quota accounting and optional enforcement; filesystem/mount dependent.
- [B02 — Apple XPC documentation](https://developer.apple.com/documentation/xpc?language=_11): helper IPC, privilege isolation, service types, and process-per-client lifetime. Current indexed official result; direct open returned an unreadable shell.
- [B03 — Apple Foundation Process documentation](https://developer.apple.com/documentation/foundation/process?changes=_8): Process-launched child sandbox inheritance and the XPC alternative. Current indexed official result; direct open was incomplete.
