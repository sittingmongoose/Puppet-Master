# Critic source index — D-R2-P02-control

No source documents, code, or test artifacts are copied here. Full inherited records and reviewer observations, including exact URLs, versions/commits, locators, access windows, operations, conditions, and applicability, are in [source-map.json](../source-map.json). The inherited investigator index is [here](../../investigator/sources/README.md). Stable S-IDs retain their original identity; critic accesses are supplemental.

## Independently checked sources

- **S-01/S-02:** [Wasmtime Config](https://docs.rs/wasmtime/latest/wasmtime/struct.Config.html) and [StoreLimitsBuilder](https://docs.rs/wasmtime/latest/wasmtime/struct.StoreLimitsBuilder.html): fuel/epoch setup and per-resource limits. Exact 49.0.2 pin was not independently confirmed; cached S-02 result showed 49.0.1.
- **S-03:** [WIT Worlds](https://component-model.bytecodealliance.org/design/worlds.html): import/export boundary and host fulfillment.
- **S-06–S-09:** [Wasmtime advisories](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-j366-h8gg-77pm), [GHSA-gqmc-89g8-p25r](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-gqmc-89g8-p25r), [GHSA-c9gc-w9vx-w86p](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-c9gc-w9vx-w86p), [GHSA-4ch3-9j33-3pmj](https://github.com/bytecodealliance/wasmtime/security/advisories/GHSA-4ch3-9j33-3pmj): version/API/configuration-specific resource and filesystem cases.
- **S-10/S-11:** [Wasmtime overlapping-preopen issue](https://github.com/bytecodealliance/wasmtime/issues/13544) and [pinned WASI filesystem spec](https://github.com/WebAssembly/WASI/blob/90105ffc2a4eed594909f9df2f473596500b49d2/proposals/filesystem/imports.md): path scope and host filesystem variation.
- **S-12:** [Pinned WASI testsuite guide](https://github.com/WebAssembly/wasi-testsuite/blob/5ea11d8fe958beb60fb871d6852ae020e45c0433/doc/writing-tests.md): test roots and cleanup scope; it is a guide, not a concrete test evaluated here.
- **S-15/S-16:** [VS Code Web Extensions](https://code.visualstudio.com/api/extension-guides/web-extensions) and [issue 321901](https://github.com/microsoft/vscode/issues/321901): worker restrictions, tests, and a bounded failure-mode record.
- **S-17/S-19:** [Electron sandbox](https://www.electronjs.org/docs/latest/tutorial/sandbox) and [utilityProcess](https://www.electronjs.org/docs/latest/api/utility-process): IPC caveats, environment and network defaults.
- **S-20/S-21:** [WHATWG iframe srcdoc](https://html.spec.whatwg.org/dev/iframe-embed-object.html) and [sandboxing/origins](https://html.spec.whatwg.org/multipage/browsers.html): browser-origin conditions.
- **S-23/S-24:** [SQLite transactions](https://www.sqlite.org/lang_transaction.html) and [Rust Child process API](https://doc.rust-lang.org/std/process/struct.Child.html): writer/snapshot behavior and direct-child kill/reap.

## Carried records not independently reopened

S-04, S-05, S-13, S-14, S-18, and S-22 retain their original records and limitations. S-14 remains weak search-excerpt evidence as the investigator reported.
