# Source inventory

The source records are listed in `../source-map.json`; this directory contains no copied source documents or executable code. IDs below are stable references used by `discovery.md` and the eventual `draft.md`. Access windows and limitations are recorded in the map.

## B-00 — D-P06 software planning brief
- URL/path: ER13_RUNTIME/mechanics/dispatch-v1/admitted/D-R2-P02-control/run/D-R2-P02-control/inputs/brief.md
- Version/identity: D-P06; no explicit release/version in file

## S-01 — Wasmtime Config API
- URL/path: https://docs.rs/wasmtime/latest/wasmtime/struct.Config.html
- Version/identity: docs.rs latest was Wasmtime 49.0.2 at access; release tag commit 3c8a3e79aa3188a1a12b3aebbaa097abccceac92; defaults can vary with Cargo features and target.

## S-02 — Wasmtime StoreLimitsBuilder API
- URL/path: https://docs.rs/wasmtime/latest/wasmtime/struct.StoreLimitsBuilder.html
- Version/identity: Wasmtime 49.0.2 shown by docs.rs at access; release tag commit 3c8a3e79aa3188a1a12b3aebbaa097abccceac92.

## S-03 — WIT Worlds
- URL/path: https://component-model.bytecodealliance.org/design/worlds.html
- Version/identity: Bytecode Alliance online design guide; rolling documentation, no released version/commit exposed.

## S-04 — Wasmtime security-vulnerability policy
- URL/path: https://github.com/bytecodealliance/wasmtime/blob/main/docs/security-what-is-considered-a-security-vulnerability.md
- Version/identity: Wasmtime main branch, opened as rolling policy at access; no immutable commit captured.

## S-05 — Wasmtime CLI 49.0.2 release notes
- URL/path: https://docs.rs/crate/wasmtime-cli/latest/source/RELEASES.md
- Version/identity: Wasmtime CLI 49.0.2, released 2026-10-02; immutable tag commit 3c8a3e79aa3188a1a12b3aebbaa097abccceac92.

## S-06 — Wasmtime GHSA-j366-h8gg-77pm
- URL/path: https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm
- Version/identity: wasmtime-wasi advisory published 2026-10-02; 49.0.0 through <49.0.2 affected, 49.0.2 patched; older branches listed on page.

## S-07 — Wasmtime GHSA-gqmc-89g8-p25r
- URL/path: https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-gqmc-89g8-p25r
- Version/identity: wasmtime-wasi advisory published 2026-10-02; patched in 36.0.17, 48.0.4 and 49.0.2.

## S-08 — Wasmtime GHSA-c9gc-w9vx-w86p
- URL/path: https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-c9gc-w9vx-w86p
- Version/identity: wasmtime-wasi-http advisory published 2026-09-24; 49.0.0 affected and 49.0.1 patched.

## S-09 — Wasmtime GHSA-4ch3-9j33-3pmj
- URL/path: https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-4ch3-9j33-3pmj
- Version/identity: wasmtime-wasi advisory published 2026-06-24; affected branches through 46.0.0, patched versions listed by branch.

## S-10 — Wasmtime issue 13544: overlapping preopens
- URL/path: https://github.com/bytecodealliance/wasmtime/issues/13544
- Version/identity: Public Wasmtime issue #13544; issue record is stable, no release tag.

## S-11 — WASI filesystem interface
- URL/path: https://github.com/WebAssembly/WASI/blob/90105ffc2a4eed594909f9df2f473596500b49d2/proposals/filesystem/imports.md
- Version/identity: Immutable WebAssembly/WASI commit 90105ffc2a4eed594909f9df2f473596500b49d2; interface wasi:filesystem/types@0.3.1.

## S-12 — WASI testsuite writing-tests guide
- URL/path: https://github.com/WebAssembly/wasi-testsuite/blob/5ea11d8fe958beb60fb871d6852ae020e45c0433/doc/writing-tests.md
- Version/identity: Immutable WebAssembly/wasi-testsuite commit 5ea11d8fe958beb60fb871d6852ae020e45c0433.

## S-13 — WebAssembly Threads proposal overview
- URL/path: https://github.com/WebAssembly/threads/blob/main/proposals/threads/Overview.md
- Version/identity: WebAssembly threads proposal main branch as accessed; exact commit not captured.

## S-14 — VS Code Extension Host documentation
- URL/path: https://code.visualstudio.com/api/advanced-topics/extension-host
- Version/identity: Current online VS Code docs; no release version stated. Search snippet was returned; subsequent direct open timed out.

## S-15 — VS Code Web Extensions documentation
- URL/path: https://code.visualstudio.com/api/extension-guides/web-extensions
- Version/identity: Current online VS Code docs; no release version stated.

## S-16 — VS Code issue 321901: extension host unresponsive
- URL/path: https://github.com/microsoft/vscode/issues/321901
- Version/identity: Issue #321901; reporter version 1.125.0, build commit 93cfdd4, Electron 42.2.0, Windows x64; milestone 1.125.1.

## S-17 — Electron Process Sandboxing
- URL/path: https://www.electronjs.org/docs/latest/tutorial/sandbox
- Version/identity: Electron rolling latest docs; states renderer sandbox default since Electron 20; no latest release tag on page.

## S-18 — Electron Web Embeds
- URL/path: https://www.electronjs.org/docs/latest/tutorial/web-embeds
- Version/identity: Electron rolling latest docs; no exact release version exposed.

## S-19 — Electron utilityProcess API
- URL/path: https://www.electronjs.org/docs/latest/api/utility-process
- Version/identity: Electron rolling latest API docs; no immutable release version exposed.

## S-20 — HTML Standard iframe srcdoc
- URL/path: https://html.spec.whatwg.org/dev/iframe-embed-object.html
- Version/identity: WHATWG HTML Edition for Web Developers; living standard snapshot, no semver release.

## S-21 — HTML Standard sandboxing and origins
- URL/path: https://html.spec.whatwg.org/multipage/browsers.html
- Version/identity: WHATWG HTML Living Standard, last updated 2026-10-06.

## S-22 — Deno runtime permissions
- URL/path: https://docs.deno.com/runtime/reference/permissions/
- Version/identity: Current online Deno docs; no runtime release pinned.

## S-23 — SQLite Transactions
- URL/path: https://www.sqlite.org/lang_transaction.html
- Version/identity: SQLite official online documentation, no library version pinned.

## S-24 — Rust std::process::Child
- URL/path: https://doc.rust-lang.org/std/process/struct.Child.html
- Version/identity: Standard library kill API stable since Rust 1.0; docs track current stable Rust, exact compiler release not pinned.
