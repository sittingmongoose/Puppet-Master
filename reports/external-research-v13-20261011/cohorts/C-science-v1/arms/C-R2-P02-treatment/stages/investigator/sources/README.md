# Bounded primary-source index

Source IDs are stable within this stage. Full identity, access UTC, operation, version, locator, governing condition/default/exception and applicability are in the sibling [`source-map.json`](../source-map.json). Pages were consulted as primary evidence; no full page copies or downloaded code were retained. Research retrieval used the source set below, with no package installation or executable witness.

## Protocol, isolation and resource controls

- **S01** [Language Server Protocol 3.17](https://raw.githubusercontent.com/microsoft/language-server-protocol/gh-pages/_specifications/lsp/3.17/specification.md): capability exchange, progress, cancellation limitations.
- **S02** [Linux cgroup v2](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html): controller availability, hierarchy, CPU, memory, process and I/O controls.
- **S03** [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): child association, breakaway, process-tree teardown.
- **S04** [Windows job memory limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_extended_limit_information): committed virtual memory, per-process and per-job flags.
- **S05** [Windows job CPU rate control](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information): weight, hard cap, min/max and availability condition.
- **S06** [Wasmtime 49.0.2 StoreLimitsBuilder](https://docs.rs/wasmtime/latest/wasmtime/struct.StoreLimitsBuilder.html): per-linear-memory limits and defaults.
- **S07** [Wasmtime 49.0.2 Config](https://docs.rs/wasmtime/latest/wasmtime/struct.Config.html): fuel and epoch interruption.
- **S08** [Wasmtime WASI filesystem preopens](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html): default no filesystem access and explicit directory permissions.
- **S09** [Apple macOS App Sandbox file access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox): selected-file access, scoped access and failures.
- **S10** [Apple App Sandbox inheritance guidance](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html): child helper limits; archived guidance.

## Converter behavior, history and outputs

- **S11** [Pandoc filters](https://pandoc.org/filters.html): JSON executable pipe and embedded Lua alternative; see manual [security note](https://pandoc.org/MANUAL.html#a-note-on-security).
- **S12** [Pandoc 3.8.3 release](https://github.com/jgm/pandoc/releases/tag/3.8.3): versioned regression fixes, commit 568dab1. Retrieved UI displayed a date without a year, flagged in the source map; rely on tag/version and fix notes, not inferred chronology.
- **S13** [Pandoc issue #11275](https://github.com/jgm/pandoc/issues/11275): SVG/WeasyPrint output regression.
- **S14** [Pandoc issue #11256](https://github.com/jgm/pandoc/issues/11256): Typst smart-quote behavior regression.
- **S15** [LibreOffice conversion filter table](https://help.libreoffice.org/latest/en-US/text/shared/guide/convertfilters.html): extension, API filter name, media type and parameter syntax.
- **S16** [Linux rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html): same-filesystem atomic replacement, EXDEV and NFS caveat (man-pages 6.19).
- **S17** [Windows ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew): same-volume requirement and error cases.
- **S18** [Linux fsync(2)](https://www.man7.org/linux/man-pages/man2/fsync.2.html): file versus directory durability and late filesystem errors (man-pages 6.19).
- **S19** [Windows AppContainer isolation](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation): narrowly granted file, registry, network and process access.
- **S20** [Linux Landlock](https://www.kernel.org/doc/html/latest/userspace-api/landlock.html): per-process access rules, runtime ABI/kernel conditions and inherited file descriptor caveat.
- **S21** [Pandoc User Guide security note](https://pandoc.org/MANUAL.html#a-note-on-security): filter/custom-writer filesystem risk and the scope of Pandoc `--sandbox`.
