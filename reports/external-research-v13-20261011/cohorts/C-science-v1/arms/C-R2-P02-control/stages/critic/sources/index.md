# Critic evidence index — C-P04 export-worker architecture

Source IDs S01–S13 retain the investigator’s bindings; this review does not silently reassign them. “Access UTC” in the critic source map is the batch review log time after inspection, since per-URL fetch timestamps are not exposed. Direct-open and search-result limitations are stated in each record.

| ID | Primary source | Independent check / applicability |
|---|---|---|
| [S01](#source-s01) | [Pandoc User’s Guide](https://pandoc.org/MANUAL.html) | Verified explicit format options, format listing, extension inference, and HTML fallback. CLI example only. |
| [S02](#source-s02) | [Pandoc Releases](https://pandoc.org/releases.html) | Verified 3.12.1 date, new FODT, ODF loop/OOM and data-loss fixes. Supports versioned behavior/regression rationale. |
| [S03](#source-s03) | [LSP 3.17 specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/) | Verified through the official [Microsoft LSP GitHub copy](https://github.com/Microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.17/specification.md): cancellation response and tokenized progress. Protocol precedent only. |
| [S04](#source-s04) | [WebAssembly Component Model WIT text format](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md) | Verified worlds/imports/exports, package versions, and feature gates. Mutable main, not a pinned release. |
| [S05](#source-s05) | [Wasmtime 49.0.1 StoreLimitsBuilder](https://docs.rs/wasmtime/49.0.1/wasmtime/struct.StoreLimitsBuilder.html) | Official docs.rs indexed content confirms per-linear-memory limit and unlimited default; direct open unavailable. Not total process RSS. |
| [S06](#source-s06) | [Wasmtime-WASI WasiCtxBuilder](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html) | Official docs.rs result confirms no filesystem by default without preopens, scoped permissions, and traversal protection. Latest alias; exact release unpinned here. |
| [S07](#source-s07) | [Linux cgroup v2 documentation, 7.1](https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html) | Verified CPU weights/caps, defaults, memory.max behavior, memory accounting caveat, and child inheritance. Controller/delegation setup matters. |
| [S08](#source-s08) | [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) | Verified process grouping, child association/breakaway conditions, termination, and nested-job OS conditions. |
| [S09](#source-s09) | [Windows Job CPU rate control](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information) | Verified configured CPU cap and suspension until the next interval; not an editor-latency guarantee. |
| [S10](#source-s10) | [Apple App Sandbox file access](https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox) | Verified container/user-selected/security-scoped access and access-denial checks. Does not document a general converter memory cap. |
| [S11](#source-s11) | [Linux rename(2), man-pages 6.19](https://man7.org/linux/man-pages/man2/rename.2.html) | Verified same-filesystem atomic replacement and EXDEV across mounted filesystems. Not semantic or remote durability. |
| [S12](#source-s12) | [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest) | Verified declarative name/version/publisher/engines/entry point/contribution fields. Metadata pattern only, not trust or isolation. |
| [S13](#source-s13) | [Windows JOBOBJECT_BASIC_LIMIT_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information) | Verified job-wide committed-memory and per-process limits, extended-structure requirement, and user-mode job time. |

## Source S01
Pandoc User’s Guide — https://pandoc.org/MANUAL.html  
Version: live official manual; URL not versioned. Locator: Specifying formats, format-list flags, output inference/default.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Opened official manual and read the format-selection/listing sections; no command ran.  
Condition/applicability: Explicit format and listing options are documented. Otherwise extension inference applies, with HTML fallback for stdout or an unknown output extension. This is a CLI example, not a universal converter guarantee.  
Check: Verified.

## Source S02
Pandoc Releases — https://pandoc.org/releases.html  
Version: Pandoc 3.12.1, 2026-10-07; preceding 3.12, 2026-09-27. Locator: 3.12.1 revision history, FODT and ODT reader entries.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked official release history for the date, FODT, cyclic style inheritance, text:s OOM, and silently lost ODF fields/text; no binary ran.  
Condition/applicability: Release notes tie fixes to concrete ODF defects; they do not establish how all converters behave. Supports versioning/regression rationale.  
Check: Verified.

## Source S03
LSP 3.17 specification — https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/  
Version: LSP 3.17; official repository copy is on mutable gh-pages. Locator: cancellation and Progress Support.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Direct spec rendering was sparse; checked the official Microsoft language-server-protocol GitHub copy for cancellation response and tokenized progress.  
Condition/applicability: A canceled request still receives a response; progress token differs from request ID. This does not prove underlying converter work stopped. Protocol precedent only.  
Check: Verified via official mirror; original source binding retained.

## Source S04
WebAssembly Component Model WIT text format — https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md  
Version: mutable main; no commit pin exposed. Locator: Package Names, interfaces/worlds, feature gates.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Opened upstream WIT design text and checked imports/exports, package version syntax, and gates.  
Condition/applicability: Worlds describe imports/exports; optional package semver and source-level gates exist. They do not set runtime limits. Typed interface candidate; pin before implementation.  
Check: Verified content; revision unpinned.

## Source S05
Wasmtime StoreLimitsBuilder — https://docs.rs/wasmtime/49.0.1/wasmtime/struct.StoreLimitsBuilder.html  
Version: Wasmtime 49.0.1. Locator: memory_size API and default.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Direct open unavailable; official docs.rs indexed result identifies 49.0.1 and says the cap applies per linear memory and defaults unlimited. No runtime ran.  
Condition/applicability: Multiple linear memories can each reach the limit; this is not a total runtime/host RSS cap.  
Check: Verified from official versioned result; direct-open limit recorded.

## Source S06
Wasmtime-WASI filesystem context API — https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/struct.WasiCtxBuilder.html  
Version: mutable latest alias. Investigator map associates the inspected result with the 49.0.2 family; this check did not expose that exact release. Locator: preopened_dir and filesystem permissions.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Official docs.rs result confirms no filesystem absent preopens, scoped permissions, and prevention of traversal above the provided path. No runtime ran.  
Condition/applicability: Applies to filesystem calls through the configured WASI context, not arbitrary host imports or other runtime access. Candidate for job-scoped paths; pin a release.  
Check: Content verified; exact version unresolved. Preserve source ID and do not treat latest as a pin.

## Source S07
Linux cgroup v2 — https://docs.kernel.org/7.1/admin-guide/cgroup-v2.html  
Version: kernel documentation 7.1. Locator: process organization, controller availability/delegation, cpu.weight, cpu.max, memory.max, memory accounting.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Opened versioned kernel documentation and searched controller sections.  
Condition/applicability: cpu.weight defaults to 100 and is scheduler-specific; cpu.max defaults to max 100000; memory.max defaults to max, may be exceeded temporarily, and accounting is not fully watertight. Forked children inherit the cgroup; controllers/delegation must be available. Linux resource policy only; no latency guarantee.  
Check: Verified.

## Source S08
Windows Job Objects — https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects  
Version: living Microsoft Learn documentation. Locator: process grouping, CreateProcess children, breakaway, termination, nested jobs.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked official Microsoft Learn results for default child association, breakaway flags, termination, and nested-job support.  
Condition/applicability: Children usually join unless breakaway behavior is configured; nested jobs start with Windows 8 / Server 2012. Membership must be configured and verified. Windows process control, not automatic sandboxing.  
Check: Verified.

## Source S09
Windows Job CPU rate control — https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_cpu_rate_control_information  
Version: living Microsoft Learn API documentation. Locator: CPU rate modes and interval behavior.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked official result for configured CPU cap and interval behavior; no setting applied.  
Condition/applicability: After an interval CPU-cycle limit is reached, job threads do not run until the next interval. Optional control; not an editor-latency promise.  
Check: Verified.

## Source S10
Apple App Sandbox file access — https://developer.apple.com/documentation/security/accessing-files-from-the-macos-app-sandbox  
Version: living Apple Developer documentation. Locator: container, user-selected access, security-scoped URLs/bookmarks, denial caveats.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked official Apple documentation for container and user-selected access, scope, helper sharing, and ACL/MAC denial.  
Condition/applicability: Authority depends on entitlements and user grants; access can still fail. Source does not document a general memory cap. macOS file authority only.  
Check: Verified.

## Source S11
Linux rename(2) — https://man7.org/linux/man-pages/man2/rename.2.html  
Version: Linux man-pages 6.19, 2026-02-08. Locator: rename description and EXDEV error.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked man-page result for atomic replacement and cross-mounted-filesystem EXDEV; no file operation ran.  
Condition/applicability: Supported replacement is atomic; rename across mounted filesystems fails with EXDEV. This does not imply semantic validity or remote persistence. Linux local namespace commit only.  
Check: Verified.

## Source S12
VS Code Extension Manifest — https://code.visualstudio.com/api/references/extension-manifest  
Version: living official VS Code API documentation. Locator: name, publisher, version, engines, main, activation events, contributions.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked official field descriptions; no extension installed.  
Condition/applicability: Metadata and engine compatibility are declarative; do not establish trust, isolation, or saved-preset semantic stability. Discovery pattern only.  
Check: Verified.

## Source S13
JOBOBJECT_BASIC_LIMIT_INFORMATION — https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information  
Version: living Microsoft Learn API documentation. Locator: JOB_OBJECT_LIMIT_JOB_MEMORY, JOB_OBJECT_LIMIT_PROCESS_MEMORY, JOB_OBJECT_LIMIT_JOB_TIME.  
Access UTC: 2026-10-12T02:56:34Z (batch review log; exact per-URL time unavailable).  
Operation: Checked official API result for committed-memory scope, extended-structure requirement, and user-mode job time. No Job Object setting applied.  
Condition/applicability: Job memory caps the job-wide sum of committed memory; process memory is per process; job time counts user-mode execution. Flags and required extended structure must be configured. Windows control, not implicit default or wall-clock timeout.  
Check: Verified.
