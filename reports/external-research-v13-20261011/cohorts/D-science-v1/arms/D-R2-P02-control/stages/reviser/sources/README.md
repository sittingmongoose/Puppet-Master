# Reviser source index — D-R2-P02-control

The complete source map is ../source-map.json. Its source_records preserve inherited IDs S-01–S-24 and original identity fields. Critic observations are nested as critic_review; critic lineage and its non-rechecked list are retained. New pinned tests are S-25–S-28.

## Stable inherited IDs

- **B-00:** original D-P06 brief.
- **S-01–S-02:** Wasmtime fuel, epoch, Store, and resource-limit API docs.
- **S-03:** WIT component import/export contract.
- **S-04–S-09:** Wasmtime security policy, release notes, and version/API/configuration-specific advisories.
- **S-10–S-12:** overlapping-preopens issue, pinned WASI filesystem specification, and pinned WASI testsuite writing guide.
- **S-13–S-16:** WebAssembly threads proposal, VS Code extension-host/web-extension docs, and public unresponsive-host issue.
- **S-17–S-19:** Electron sandbox, web embeds, and utility-process docs.
- **S-20–S-21:** WHATWG srcdoc, sandbox, and origin rules.
- **S-22–S-24:** Deno permissions, SQLite transaction semantics, and Rust direct-child process API.

The inherited indexes contain detailed locators and access limits. S-14 remains weak search-excerpt evidence.

## Newly inspected pinned test sources

- **S-25 — Wasmtime fuel:** [tests/all/fuel.rs at 49.0.2 commit](https://github.com/bytecodealliance/wasmtime/blob/3c8a3e79aa3188a1a12b3aebbaa097abccceac92/tests/all/fuel.rs). The iloop test configures 10,000 fuel and expects OutOfFuel on loops and bulk operations. It does not exercise this host or every host operation.
- **S-26 — Wasmtime resource limits:** [tests/all/limits.rs at 49.0.2 commit](https://github.com/bytecodealliance/wasmtime/blob/3c8a3e79aa3188a1a12b3aebbaa097abccceac92/tests/all/limits.rs). The growth_trap test applies explicit memory/table limits and checks failed growth.
- **S-27 — WASI Preview 3 traversal:** [filesystem-dotdot.rs at pinned testsuite commit](https://github.com/WebAssembly/wasi-testsuite/blob/5ea11d8fe958beb60fb871d6852ae020e45c0433/tests/rust/wasm32-wasip3/src/bin/filesystem-dotdot.rs). It checks that ../x.cleanup opened from a child descriptor returns NotPermitted; cleanup is confined to fixture-created files.
- **S-28 — WASI Preview 3 rename:** [filesystem-rename.rs at pinned testsuite commit](https://github.com/WebAssembly/wasi-testsuite/blob/5ea11d8fe958beb60fb871d6852ae020e45c0433/tests/rust/wasm32-wasip3/src/bin/filesystem-rename.rs). It checks parent traversal and absolute rename paths under a preopen, then removes its test directory.

S-25–S-28 were retrieved and read at their exact commit paths; no test or code was run. They do not prove process-tree supervision, production cleanup ownership, concurrent-reader safety, or this application's behavior.
