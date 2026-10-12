# Evidence index — revised export-worker recommendation

Source IDs S01–S13 are carried forward from the investigator/critic maps without reassignment. S14–S16 add reviser checks for filesystem authority. Exact versions, URLs, locators, UTC access logs, operations, conditions, and applicability are recorded in [source-map.json](../source-map.json). A linked official page supports only the behavior and conditions listed here; no source demonstrates the future host.

| ID | Primary source | Use and limit |
|---|---|---|
| [S01](#source-s01) | [Pandoc User’s Guide](https://pandoc.org/MANUAL.html) | Explicit format listing/selection; extension inference is a CLI example. |
| [S02](#source-s02) | [Pandoc Releases](https://pandoc.org/releases.html) | Version-specific format, OOM, loop, and content-loss fixes; not a product choice. |
| [S03](#source-s03) | [LSP 3.17](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/) | Progress/cancellation precedent; response does not mean work stopped. |
| [S04](#source-s04) | [WebAssembly Component Model WIT](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md) | Typed imports/exports and package-version syntax; mutable main, not resource enforcement. |
| [S05](#source-s05) | [Wasmtime StoreLimitsBuilder 49.0.1](https://docs.rs/wasmtime/49.0.1/wasmtime/struct.StoreLimitsBuilder.html) | Per-linear-memory limit/default; not total host/runtime memory. |
| [S06](#source-s06) | [Wasmtime-WASI WasiCtxBuilder, latest alias](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html) | Read-only preopens and path traversal boundary; exact latest version unconfirmed. |
| [S07](#source-s07) | [Linux cgroup v2 7.1](https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html) | CPU/memory control defaults and process inheritance; resource control, not filesystem authority. |
| [S08](#source-s08) | [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) | Process grouping, child membership, termination and breakaway conditions; not file ACLs. |
| [S09](#source-s09) | [Windows Job CPU rate control](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information) | Configured CPU cap behavior; no editor latency promise. |
| [S10](#source-s10) | [macOS App Sandbox file access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox) | Carried review source for entitlements/scopes; direct reviser render was sparse. |
| [S11](#source-s11) | [Linux rename(2), man-pages 6.19](https://man7.org/linux/man-pages/man2/rename.2.html) | Supported same-filesystem atomic replacement and EXDEV; no semantic/remote durability claim. |
| [S12](#source-s12) | [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest) | Declarative package identity/compatibility example only. |
| [S13](#source-s13) | [JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information) | Explicit job/process memory and user-mode time limits. |
| [S14](#source-s14) | [Apple App Sandbox file access, official Markdown result](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox?changes=_4) | User-selected and helper-shared scopes; direct page rendering requires JavaScript; audit helper authority. |
| [S15](#source-s15) | [Windows File Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/fileio/file-security-and-access-rights) | File/directory security descriptors and access-token checks; rights require explicit setup. |
| [S16](#source-s16) | [Linux open(2)](https://man7.org/linux/man-pages/man2/open.2.html) | O_RDONLY applies to one handle; direct page open timed out and full version is not claimed. |

## Source S01

- **Identity:** Pandoc User’s Guide; https://pandoc.org/MANUAL.html; live official manual, URL not versioned (release reference 3.12.1, 2026-10-07).
- **Locator and observation:** --list-output-formats, -t/--to, output inference/default. Official manual reviewed; no command run.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact page fetch time unavailable.
- **Condition/applicability:** Explicit format listing and selection are supported; otherwise extension inference applies with HTML fallback for stdout/unknown extension. CLI example only; host should specify format explicitly.

## Source S02

- **Identity:** Pandoc Releases; https://pandoc.org/releases.html; Pandoc 3.12.1 (2026-10-07), preceding 3.12 (2026-09-27).
- **Locator and observation:** 3.12.1 revision history, FODT and ODF reader fixes. Official release notes reviewed; no binary run.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Release adds FODT and fixes ODF expansion that could exhaust memory, cyclic style inheritance, and silent losses. Evidence of versioned behavior/regression needs, not a selected converter.

## Source S03

- **Identity:** Language Server Protocol 3.17; https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/; previous 3.17.x spec page, progress support from 3.15.
- **Locator and observation:** Request cancellation, progress support, initialize. Official Microsoft repository copy checked after renderer was sparse; no protocol implementation run.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Canceled requests still receive a response; progress uses a separate token. Does not mean converter work stopped or artifacts are clean.

## Source S04

- **Identity:** WebAssembly Component Model WIT text format; https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md; mutable main, no commit pin.
- **Locator and observation:** Package names, interfaces/worlds, feature gates; upstream text read; no component compiled or run.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Worlds describe imports/exports; optional package SemVer and gates are interface/version information, not runtime resource controls. Pin before implementation.

## Source S05

- **Identity:** Wasmtime StoreLimitsBuilder; https://docs.rs/wasmtime/49.0.1/wasmtime/struct.StoreLimitsBuilder.html; Wasmtime 49.0.1.
- **Locator and observation:** memory_size and default, from official versioned docs.rs indexed result; direct open unavailable; no runtime run.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Limit applies per linear memory; default unlimited; multiple memories and total host/runtime RSS require separate policy.

## Source S06

- **Identity:** Wasmtime-WASI WasiCtxBuilder; https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html; latest alias, exact release unresolved (prior indexed result associated with 49.0.2 family, not confirmed here).
- **Locator and reviser operation:** preopened_dir, default filesystem access, FsPerms::ReadOnly, traversal. Official docs.rs page opened and inspected; no runtime run.
- **Access UTC:** Reviser's post-inspection timestamp is in source-map.json; per-page fetch time unavailable.
- **Condition/applicability:** No filesystem access by default absent preopens; a preopen supplies a host directory and permissions, demonstrates read-only, and prevents .. above the supplied path. Applies only to calls through the configured WASI context. Pin an exact version.

## Source S07

- **Identity:** Linux kernel cgroup v2 documentation 7.1; https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html.
- **Locator and reviser operation:** Process organization/controller availability; cpu.weight, cpu.max, memory.max. Official open/find reviewed; no cgroup configured.
- **Access UTC:** Reviser's post-inspection timestamp is in source-map.json; per-page fetch time unavailable.
- **Condition/applicability:** Children inherit cgroup at fork. Controllers must be supported/available/enabled. cpu.weight applies to eligible fair-class/BPF scheduling; cpu.max to fair-class tasks; memory.max defaults to max and may be exceeded temporarily. Resource controls do not establish file authority or fixed latency.

## Source S08

- **Identity:** Windows Job Objects; https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects; living API docs.
- **Locator and reviser operation:** CreateProcess child association, breakaway, TerminateJobObject, nested jobs. Official page opened and inspected; no Job Object created.
- **Access UTC:** Reviser's post-inspection timestamp is in source-map.json; per-page fetch time unavailable.
- **Condition/applicability:** Children normally join unless breakaway settings apply; nested jobs from Windows 8 / Server 2012. Manages process membership/termination, not file ACLs.

## Source S09

- **Identity:** Windows Job CPU rate control; https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information; living Microsoft API docs.
- **Locator and observation:** CPU rate control and interval behavior; official result reviewed; no limit applied.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Configured cap can suspend job threads until next interval; does not guarantee editor latency. Windows/version/setup conditions apply.

## Source S10

- **Identity:** Accessing files from the macOS App Sandbox; https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox; living Apple documentation.
- **Locator and carried observation:** Container, user-selected files, security-scoped bookmarks, denial caveats. Prior critic record independently reviewed the official source. Reviser direct open returned a JavaScript-required placeholder; supplemental official indexed content is recorded as S14.
- **Access UTC:** Critic batch log is recorded in source-map.json; reviser open time is also recorded there.
- **Condition/applicability:** File authority depends on app entitlement/grants and can still be denied by ACL/MAC. Not a generic memory cap or proof of a worker's least authority.

## Source S11

- **Identity:** Linux rename(2); https://man7.org/linux/man-pages/man2/rename.2.html; Linux man-pages 6.19, dated 2026-02-08.
- **Locator and observation:** DESCRIPTION and EXDEV; documentation reviewed, no file replacement attempted.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Supported same-filesystem rename can atomically replace a name; cross-mounted-filesystem move returns EXDEV. Does not prove format completeness or remote durability.

## Source S12

- **Identity:** Visual Studio Code Extension Manifest; https://code.visualstudio.com/api/references/extension-manifest; living official API docs.
- **Locator and observation:** Name, publisher, version, engine compatibility, entry point, contributions; official reference reviewed, no extension installed.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Declarative metadata pattern only; no trust, isolation, or saved-preset semantic guarantee.

## Source S13

- **Identity:** JOBOBJECT_BASIC_LIMIT_INFORMATION; https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information; living Microsoft docs, last updated 2022-08-23.
- **Locator and observation:** Job/process memory flags, job time; official page opened, no setting applied.
- **Access UTC:** 2026-10-12T02:56:34Z critic batch log; exact fetch time unavailable.
- **Condition/applicability:** Job committed-memory, per-process memory and user-mode time limits need explicit flags/structures; not defaults or wall-clock deadlines.

## Source S14

- **Identity:** Accessing files from the macOS App Sandbox, official Apple Markdown/search result; URL in source-map.json; living documentation, not release-pinned.
- **Locator and reviser operation:** Overview, user-selected files, security-scoped bookmarks, access sharing between processes. Official-domain search result returned Markdown content; direct open displayed a JavaScript-required placeholder. No entitlement changed.
- **Access UTC:** Exact reviser post-inspection time is in source-map.json; per-URL fetch time unavailable.
- **Condition/applicability:** App Sandbox limits access to container/granted scopes; open/save interactions or security-scoped bookmarks can extend access, including to a helper process. ACL/MAC can still deny. The helper must receive only intended authority; this page does not prove any worker is read-only.

## Source S15

- **Identity:** File Security and Access Rights; https://learn.microsoft.com/en-us/windows/win32/fileio/file-security-and-access-rights; living Microsoft Learn page, last updated 2025-07-09.
- **Locator and reviser operation:** Security descriptors; file access rights; token/security-descriptor comparison. Official page directly opened; no ACL/token changed.
- **Access UTC:** Exact reviser post-inspection time is in source-map.json; per-URL fetch time unavailable.
- **Condition/applicability:** File/directory access is checked against the caller's access token and object security descriptor/ACL; inheritance and default descriptor conditions apply. Candidate Windows mechanism to configure/test least authority; separate from Job Objects.

## Source S16

- **Identity:** Linux open(2); https://man7.org/linux/man-pages/man2/open.2.html; Linux man-pages page, release not exposed by returned result.
- **Locator and reviser operation:** O_RDONLY/O_WRONLY/O_RDWR access modes and descriptor semantics. Official search result inspected; direct open timed out; no descriptor was created/passed.
- **Access UTC:** Exact reviser post-inspection time is in source-map.json; per-URL fetch time unavailable.
- **Condition/applicability:** O_RDONLY constrains that handle, not path-based access, directory traversal, replacement, or separate handles. A candidate input-handle primitive only, not a complete hostile-worker filesystem boundary.

