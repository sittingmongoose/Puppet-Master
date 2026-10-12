# Evidence index — investigator discovery

Source IDs are stable within this stage. URLs identify inspected primary sources; mutable/latest sources are labeled in source-map.json. The UTC time records the source-capture log after inspection because per-URL fetch times were not exposed. S13 was added after plan release; discovery.md is unchanged.

| ID | Source | Version / identity | Discovery use |
|---|---|---|---|
| [S01](#source-s01) | [Pandoc User's Guide](https://pandoc.org/MANUAL.html) | Live official manual; release page identifies current release 3.12.1 (2026-10-07); manual URL is not versioned. | Format enumeration, explicit format selection, extension inference |
| [S02](#source-s02) | [Pandoc Releases](https://pandoc.org/releases.html) | Pandoc 3.12.1, dated 2026-10-07; preceding release 3.12 dated 2026-09-27. | Format evolution, OOM/loop/data-loss fixes |
| [S03](#source-s03) | [Language Server Protocol Specification 3.17](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/) | LSP specification 3.17.x; page labels this the previous 3.17.x version. Progress support dates to 3.15.0. | Capability handshake, progress and cancellation precedent |
| [S04](#source-s04) | [WebAssembly Component Model WIT text format](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md) | Mutable main branch; no immutable commit SHA exposed in accessed page. Treat as evolving design text, not a pinned release. | Typed import/export worlds and package versioning |
| [S05](#source-s05) | [Wasmtime StoreLimitsBuilder API](https://docs.rs/wasmtime/49.0.1/wasmtime/struct.StoreLimitsBuilder.html) | Wasmtime crate 49.0.1 (versioned docs.rs search result). | Per-linear-memory limit and default |
| [S06](#source-s06) | [Wasmtime WASI filesystem context API](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html) | Wasmtime-WASI 49.0.2 family from indexed filesystem API result; builder URL uses latest alias and should be pinned before implementation. | Filesystem preopens and permission-limited paths |
| [S07](#source-s07) | [Linux cgroup v2 documentation](https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html) | Linux kernel documentation version 7.1. | CPU weights/caps, memory and PID limits/defaults |
| [S08](#source-s08) | [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) | Living Microsoft Learn API documentation; OS support conditions are stated per feature. | Process trees, termination and nested-job boundary |
| [S09](#source-s09) | [Windows Job CPU rate and memory limits](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information) | Living Microsoft Learn API documentation; CPU rate control minimum supported client Windows 8, server Windows Server 2012. | CPU rate caps and scheduling conditions |
| [S10](#source-s10) | [Accessing files from the macOS App Sandbox](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox) | Living Apple Developer documentation; page calls out macOS 14 and later for code-signature/container association behavior. | User-selected file authority and scoped access |
| [S11](#source-s11) | [Linux rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html) | Linux man-pages 6.19, dated 2026-02-08. | Atomic same-filesystem replacement and EXDEV |
| [S12](#source-s12) | [Visual Studio Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest) | Living official VS Code API documentation; no specific VS Code release pinned in URL. | Declarative extension identity/discovery pattern only |
| [S13](#source-s13) | [JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information) | Living Microsoft Learn API documentation; last updated 2022-08-23; memory/time flags apply when explicitly set. | Explicit job/process memory and user-mode time flags |

## Source S01

- **Title:** Pandoc User's Guide
- **URL:** <https://pandoc.org/MANUAL.html>
- **Version / commit:** Live official manual; release page identifies current release 3.12.1 (2026-10-07); manual URL is not versioned.
- **Locator:** Options: --list-output-formats; -t/--to; output format inference/default behavior.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official manual search result for format enumeration, explicit writer selection and filename-extension inference; no command was run.
- **Condition/default/exception:** Explicit --list-output-formats lists formats. If format is unspecified it is inferred from file extension; if output is stdout or extension is unknown, output defaults to HTML.
- **Applicability:** Concrete CLI converter example. Host should pass target format explicitly and pin executable identity; behavior is not a general guarantee for all converters.

## Source S02

- **Title:** Pandoc Releases
- **URL:** <https://pandoc.org/releases.html>
- **Version / commit:** Pandoc 3.12.1, dated 2026-10-07; preceding release 3.12 dated 2026-09-27.
- **Locator:** Revision history, 3.12.1 lines 18-46; 3.12 lines 130 onward.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Opened official release history and read current release and regression/fix notes; no release binary was executed.
- **Condition/default/exception:** 3.12.1 adds FODT and fixes ODF text:s unbounded expansion that could OOM, cyclic style inheritance looping forever, and silent losses among other reader defects. Release notes include changes that affect interpretation/output and fixes tied to prior behavior.
- **Applicability:** Evidence that format inventories and converter semantics change by release and that hostile input can cause resource exhaustion or silent loss. Not a product selection.

## Source S03

- **Title:** Language Server Protocol Specification 3.17
- **URL:** <https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/>
- **Version / commit:** LSP specification 3.17.x; page labels this the previous 3.17.x version. Progress support dates to 3.15.0.
- **Locator:** Base Protocol > Request cancellation; Progress Support; Lifecycle Messages > initialize.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official specification and Microsoft LSP repository copy for request cancellation/progress/capability handshake; no protocol implementation was run.
- **Condition/default/exception:** Cancellation is a notification naming a request ID; a cancelled request still must return a response and not remain open. Progress is a separate tokenized $/progress notification. Initialize is a one-time capability exchange.
- **Applicability:** Protocol design precedent for asynchronous progress/cancel, not proof that a converter stopped or cleaned outputs. Host must define cancellation acknowledgment, escalation and artifact cleanup.

## Source S04

- **Title:** WebAssembly Component Model WIT text format
- **URL:** <https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md>
- **Version / commit:** Mutable main branch; no immutable commit SHA exposed in accessed page. Treat as evolving design text, not a pinned release.
- **Locator:** Package Names; WIT Interfaces; WIT Worlds; @since gates.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read upstream component-model WIT design document on GitHub; no component was compiled or executed.
- **Condition/default/exception:** WIT worlds describe component imports/exports; package names can include optional full SemVer; @since gates express compatibility expectations. This is interface description/link-time shape validation, not by itself runtime negotiation or resource enforcement.
- **Applicability:** Typed capability contract candidate for a WASM converter API. Pin the specification and component/world version before implementation.

## Source S05

- **Title:** Wasmtime StoreLimitsBuilder API
- **URL:** <https://docs.rs/wasmtime/49.0.1/wasmtime/struct.StoreLimitsBuilder.html>
- **Version / commit:** Wasmtime crate 49.0.1 (versioned docs.rs search result).
- **Locator:** memory_size method; defaults and per-linear-memory scope.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official versioned docs.rs API result for StoreLimitsBuilder; direct open was unavailable in browser tool, so detail is limited to returned indexed excerpt.
- **Condition/default/exception:** memory_size limits each linear memory individually; multiple memories can each grow to the configured amount; default linear memory is unlimited.
- **Applicability:** Runtime-level WASM memory control only. Not a whole-process RSS, host, disk, or aggregate cap; configure explicitly and pair with host/OS limits.

## Source S06

- **Title:** Wasmtime WASI filesystem context API
- **URL:** <https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html>
- **Version / commit:** Wasmtime-WASI 49.0.2 family from indexed filesystem API result; builder URL uses latest alias and should be pinned before implementation.
- **Locator:** WasiCtxBuilder::preopened_dir; filesystem Dir capabilities and FsPerms.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official docs.rs search results for preopened directories and filesystem permissions; no runtime was executed.
- **Condition/default/exception:** No filesystem access is available by default if there are no preopens. A preopen grants a selected host directory under a guest path and permissions; traversal above it is prevented by documented API.
- **Applicability:** Useful for read-only input and write-only staging roots in a WASM worker. Applies only to filesystem operations routed through that WASI context; host imports/runtime must be reviewed.

## Source S07

- **Title:** Linux cgroup v2 documentation
- **URL:** <https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html>
- **Version / commit:** Linux kernel documentation version 7.1.
- **Locator:** Resource Distribution Models; cpu.weight; cpu.max; memory.max; pids.max.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official versioned kernel documentation via web search/open; no cgroup was configured.
- **Condition/default/exception:** cpu.weight default 100, range 1..10000, affects fair-class scheduling; cpu.max default max 100000; memory.max and pids.max default max. Memory accounting is not completely watertight; controller availability/permissions/hierarchy and task attachment matter.
- **Applicability:** Linux process-group resource policy; weights are relative CPU distribution, not interactive latency guarantees. Deployment needs delegated controller support and descendant attachment.

## Source S08

- **Title:** Windows Job Objects
- **URL:** <https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects>
- **Version / commit:** Living Microsoft Learn API documentation; OS support conditions are stated per feature.
- **Locator:** Managing Processes in Jobs; Job Limits and Notifications; Managing a Process Tree; Nested Jobs.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official Microsoft Learn documentation; no Job Object was created.
- **Condition/default/exception:** Job objects group processes and can terminate a group. Child processes created with CreateProcess join by default, subject to breakaway flags. Nested jobs are supported starting Windows 8 / Windows Server 2012; older systems require other process-tree management.
- **Applicability:** Windows process-tree isolation/termination. Limits must be configured and tested against host/OS restrictions.

## Source S09

- **Title:** Windows Job CPU rate and memory limits
- **URL:** <https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information>
- **Version / commit:** Living Microsoft Learn API documentation; CPU rate control minimum supported client Windows 8, server Windows Server 2012.
- **Locator:** JOBOBJECT_CPU_RATE_CONTROL_INFORMATION remarks; related memory limit page https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read Microsoft Learn CPU rate result and basic-limit result; no setting applied.
- **Condition/default/exception:** Configured CPU rate is a cap; after a job reaches the cap for an interval, its threads cannot run until the next interval. Job-wide committed-memory limit requires JOB_OBJECT_LIMIT_JOB_MEMORY and an extended limit structure; it is not an assumed default.
- **Applicability:** Windows resource-control option. Platform/version/RDS scheduler conditions and explicit setup matter; caps do not promise user-perceived responsiveness.

## Source S10

- **Title:** Accessing files from the macOS App Sandbox
- **URL:** <https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox>
- **Version / commit:** Living Apple Developer documentation; page calls out macOS 14 and later for code-signature/container association behavior.
- **Locator:** Overview; Use files in your app’s container; Access files with standard user interactions; security-scoped bookmarks.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official Apple documentation; no entitlements or sandbox were changed.
- **Condition/default/exception:** Sandboxed app has container access; user-selected file access is granted via Open/Save interactions and security-scoped URLs; POSIX ACL/MAC checks can still deny access. App sandbox does not document a generic converter memory cap.
- **Applicability:** macOS file authority is entitlement and user-grant based. Any helper must be configured for the app sandbox; not a cross-platform sandbox guarantee.

## Source S11

- **Title:** Linux rename(2)
- **URL:** <https://man7.org/linux/man-pages/man2/rename.2.html>
- **Version / commit:** Linux man-pages 6.19, dated 2026-02-08.
- **Locator:** DESCRIPTION; ERRORS/EXDEV.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read upstream man-pages documentation; no file replacement was attempted.
- **Condition/default/exception:** If target exists, rename atomically replaces it on supported same-filesystem operation; a cross-mounted-filesystem move returns EXDEV. Atomic namespace replacement alone does not establish semantic validity or remote persistence.
- **Applicability:** Linux same-volume final commit pattern; cross-device/provider paths require a separate copy-and-verify path.

## Source S12

- **Title:** Visual Studio Code Extension Manifest
- **URL:** <https://code.visualstudio.com/api/references/extension-manifest>
- **Version / commit:** Living official VS Code API documentation; no specific VS Code release pinned in URL.
- **Locator:** Manifest fields: name, version, publisher, engines, main, activationEvents, contributes.
- **Access UTC:** 2026-10-12T02:41:07Z
- **Observed operation:** Read official extension manifest reference; no extension was installed.
- **Condition/default/exception:** An extension has package.json metadata with name/version/publisher and an entry point; engines.vscode declares compatibility and cannot be '*'; contributions are declarative metadata.
- **Applicability:** Discovery/package metadata pattern only. Manifest metadata is not capability proof, isolation, trust, or safe execution.

## Source S13

- **Title:** JOBOBJECT_BASIC_LIMIT_INFORMATION
- **URL:** <https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information>
- **Version / commit:** Living Microsoft Learn API documentation; last updated 2022-08-23; memory/time flags apply when explicitly set.
- **Locator:** LimitFlags table: JOB_OBJECT_LIMIT_JOB_MEMORY, JOB_OBJECT_LIMIT_PROCESS_MEMORY, JOB_OBJECT_LIMIT_JOB_TIME; requirements.
- **Access UTC:** 2026-10-12T02:46:32Z
- **Observed operation:** Opened official Microsoft Learn page; no Job Object setting was applied.
- **Condition/default/exception:** JOB_OBJECT_LIMIT_JOB_MEMORY caps the sum of committed memory in the job and requires an extended limit structure; JOB_OBJECT_LIMIT_PROCESS_MEMORY caps each process; JOB_OBJECT_LIMIT_JOB_TIME is a user-mode time limit. These are enabled by flags rather than automatic defaults.
- **Applicability:** Windows enforcement mechanism for native process jobs. It is not equivalent to a wall-clock deadline and must be configured with child containment and OS-specific behavior.
