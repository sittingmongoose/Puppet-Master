# Draft — S09 plugin-workbench (A-M03-B / treatment / research)

Date: 2026-10-09 ~19:41 UTC · Method M03 v1 (researcher pass; a fresh critic-finalizer follows and may correct this draft). Plan revealed 2026-10-09T19:40:48Z via `control/reveal-plan.py`; discovery artifacts were hash-frozen before reveal and re-verified byte-identical after (`discovery.md` sha256 6b24fc78…, `source-map.json` d9171c74…, `sources/index.md` 72920a78…). Source IDs SRC-01…SRC-12 refer to `source-map.json` / `sources/`; per O5, findings are restated in prose here — IDs only point into retained evidence.

## 1. The revealed plan, verbatim

> P1: Run extension scripts as child processes. P2: Pass the dataset path and output directory as arguments. P3: A timeout limits each extension. P4: Store output as the new dataset after success. P5: Load the newest extension version automatically. P6: Test with a sample formatter.

## 2. Per-P disposition (exact; categories per O4: correction / optional enhancement / user decision / already-covered / rejected / uncertain)

| P | Clause (gist) | Disposition |
|---|---|---|
| P1 | Child-process extensions | **Correction** — right isolation *mechanism* for the code tier, wrong trust posture if bare; needs an authority model; plus a declarative tier that removes most need for code at all |
| P2 | Dataset path + output dir as arguments | **Correction** (partially **rejected**) — path arguments are ambient authority; replace with content-passing / single capability directory; no arbitrary writable paths |
| P3 | Timeout limits each extension | **Correction + optional enhancement** — timeout retained and necessary; resource limiting must also cover memory and output size, with defined units and cancel semantics |
| P4 | Store output as new dataset after success | **Correction + conditions** — commit must go through the operation log (undo + reproducibility), and "success" needs defined criteria; privacy condition on exported history |
| P5 | Load newest extension version automatically | **Rejected as stated**; **user decision** on update-check UX — replaced by per-project version pinning + explicit upgrade lifecycle |
| P6 | Test with a sample formatter | **Retained + optional enhancement (partly uncertain)** — keep the smoke test; add the discriminating matrix in §9 |

### P1 — "Run extension scripts as child processes." → Correction

The mechanism is sound and consistent with the strongest evidence gathered: process boundaries give crash isolation, and OpenRefine's contrary choice (extensions as in-process JVM code loaded from `MOD-INF/lib`, with no security model stated anywhere in its extension documentation — SRC-03) is precisely the unrestricted-host-access outcome the brief forbids. But a bare child process runs with *everything the desktop user can do*: read the home directory, the network, every mounted share. Deno's documentation (SRC-01) is the governing example that isolation must be *authority*, not just address space: sensitive I/O denied by default, scoped grants, `NotCapable` on violation — and its own docs warn that `--allow-run`/`--allow-ffi` classes of capability bypass the whole model. A child process whose only limit is a timeout (P3) is OpenRefine's trust model with extra steps.

Correction carried forward: the code tier runs per-extension in a child process **with no ambient authority by default** — either a capability-dropping runtime (Deno worker/subprocess with zero grants plus host-brokered functions) or a WASM sandbox (Wasmtime/Extism model: no ambient authority, everything through explicit imports — SRC-02, SRC-10), with OS-level sandboxing as defense in depth per SRC-01's own guidance. Additionally — and this is the structural correction — most librarian transformations (trim, case/whitespace, splitting, vocabulary mapping, JSON reshaping) should never reach the code tier at all: a declarative expression tier (JSONata-like, SRC-07) with configurable guardrails handles them safely by construction, so the sandboxed-process tier is the exception, not the default path.

### P2 — "Pass the dataset path and output directory as arguments." → Correction (partially rejected)

Rejected part: passing *arbitrary writable paths* as strings. A path argument is ambient authority twice over: the extension learns where the user's data lives (and can read beyond the dataset, since it holds a path in a readable filesystem), and it can write anywhere the passed path allows. The strongest O3 evidence of this pass is exactly a path-handling failure: the wasmtime-wasi filesystem sandbox escape (GHSA-vqjp-4c8c-hfgg, published 2026-08-20, SRC-11) — "a trailing slash could be used in specific circumstances to escape the filesystem sandbox" via symlink handling, patched in 24.0.13/36.0.14/46.0.3/47.0.4, CVSS v4 8.8, no workaround, and notably *not exploitable on Linux ≥ 5.6 with `openat2` `RESOLVE_BENEATH`*. That advisory is about a purpose-built, capability-scoped filesystem layer; plain string paths passed to a child script are strictly weaker. Deno's flag design (`--allow-read=./data` scoping, SRC-01) makes the same point: scope of access must be explicit and minimal.

Correction carried forward: extensions receive the *dataset contents* over stdin (or an equivalent bounded pipe) and return transformed output on stdout — no filesystem knowledge at all for the common case. Where a file-backed exchange is unavoidable (very large collections), the host creates one scratch directory, opens it once, and hands the *opened capability* to a runtime that enforces the boundary (preopened dir in WASI terms), never a writable path string the extension can replay; and the extension gets no network and no other read grants. Figma's manifest-declared network allowlist enforced as CSP errors (SRC-04) is the retained pattern for the rare extension that legitimately needs an external service: user-visible, per-extension, default-deny. Reproducibility condition: the operation recipe records the *transform and its parameters*, never a machine-specific path — OpenRefine's exportable operation history (SRC-12) shows the pattern: history JSON re-applied to another project is the product's core reproducibility promise.

### P3 — "A timeout limits each extension." → Correction + optional enhancement

Retained: yes, every extension invocation gets a timeout — this is exactly what the evidence supports (QuickJS implements CPU timeouts via a regularly called interrupt handler, SRC-09; Extism advertises "runtime limiters and timers", SRC-10; Figma force-cancels a plugin the user aborts and requires `closePlugin()` lifecycle, SRC-04). Correction: a timeout alone is not a resource policy. An extension can allocate until the machine swaps or write gigabytes of output while staying under the wall clock. Carried forward: per invocation — wall-clock timeout (units: seconds, defined per run kind: preview runs get a shorter budget than commits), a memory ceiling (QuickJS `JS_SetMemoryLimit()` analog or runtime limiter), and an output-size cap. Optional enhancement: a live "Running…" affordance with user cancel (SRC-04's model), and the host treating timeout/memory abort as a *first-class preview result* ("extension exceeded 2s/64MB") rather than a silent failure, so librarians can tell a buggy extension from a bad transform.

### P4 — "Store output as the new dataset after success." → Correction + conditions

Retained direction: after a successful transform the workbench's current dataset becomes the transformed data. Correction: how. Replacing the dataset as a side effect of an extension exit code conflicts with the brief's undo and reproducibility requirements. The evidence-backed pattern is OpenRefine's: the unit of work is a *serializable operation*, the history is a log of them, undo is reverting to a log position, "apply" is replaying op-JSON, and the exported history doubles as audit evidence ("useful for showing that your data cleanup didn't distort or manipulate the information in any way" — SRC-12). Carried forward: commit = validate output, then append a replayable operation (extension ID + pinned version + transform parameters) to the project log; the dataset view is a function of the log. Success criteria made explicit: exit 0 *plus* output parses in the dataset schema *plus* the preview diff the user approved matches the committed result (preview/commit parity). Undo then needs no extension cooperation. Privacy condition (retained from SRC-12): any export that bundles history carries *earlier data states* — the manual's own warning — so exported bundles inherit the most sensitive historical state and must be labeled accordingly; offline export ships recipe + current data, with history inclusion an explicit user choice.

### P5 — "Load the newest extension version automatically." → Rejected as stated; user decision on update-check UX

Rejected: silently running the newest installed/newest available version. It breaks the brief on two axes. Reproducibility: replaying last month's cleaning recipe must not change because an extension updated underneath it — the operation log records results, and version drift makes recorded operations non-replayable (the preview/commit parity of P4 becomes undefinable). And the migration evidence says even platform vendors with far bigger plugin ecosystems do *not* do silent version loading: Zotero gates plugins with explicit `strict_min_version`/`strict_max_version` in the manifest, gives extensions an explicit upgrade lifecycle reason (`ADDON_UPGRADE`) and dual-format coexistence windows during migrations, and moved update manifests from RDF to JSON with a compat shim (JSON served from the old `.rdf` URL) rather than changing behavior under running installs (SRC-05). OpenRefine's release chain (SRC-06) adds the reason why: extension-relevant surface moves constantly (new extension types, GREL additions, renderers "3.7+"), and even the vendor's own release train has same-day failures (3.9.4 "failed to build correctly. Please see 3.9.5 instead"). "Newest" is not a safe default anywhere in this evidence.

Replacement carried forward: each project pins the extension versions it was built with (recorded in the operation log); a newer installed version is used only for *new* operations, and a running project can be upgraded explicitly by the user, which re-runs validation and shows the compat range. User decision (genuinely the librarian's call, presented as a workbench setting): whether the workbench *checks* for extension updates automatically (and how visibly). Auto-check is fine; auto-swap is not.

### P6 — "Test with a sample formatter." → Retained + optional enhancement (partly uncertain)

Retained: a sample formatter extension is the right first end-to-end exercise (import → preview → commit → undo → export with one known-good extension). Enhancement: one happy-path formatter would have missed everything this research found; the test set should include the discriminating cases in §9 (limit enforcement under adversarial input, zero-grant assertions, path-escape simulation against the sandboxed file tier, replay determinism). Uncertain part: what "sample formatter" should format — the brief says "small metadata collections" without naming a schema (MARC/MARCXML/JSON-LD/CSV are all live in the domain per SRC-08/SRC-03); that is a product decision recorded in §7, not something this research can settle.

## 3. Retained findings (self-contained prose, per O5)

1. **The negative baseline is a real product, not a strawman:** OpenRefine, the closest existing tool, runs extensions as trusted JVM code (Java command classes via Rhino's `Packages.` bridge; jars auto-loaded from `MOD-INF/lib`) with no sandbox or permission model anywhere in its extension documentation (SRC-03). Anything the workbench does beyond that is the contribution; and OpenRefine's *extension-point shapes* (operation registry, expression functions, importers/exporters, per-project overlay models) are worth copying independent of its trust model.
2. **Isolation must be authority, not just a boundary.** Deno: deny-by-default with scoped grants and `NotCapable`; `eval`/dynamic imports inherit privilege; `--allow-run`/`--allow-ffi` documented as bypassing the sandbox (SRC-01). Wasmtime: bounds-checked linear memory, no ambient authority, guard regions and CFI as mitigation *against possible compiler bugs*, Spectre mitigations "ongoing research", terminal ANSI-escape filtering (SRC-02). QuickJS: memory/stack/timeout ceilings but no authority model at all — safe only when the host exposes nothing dangerous (SRC-09).
3. **The isolation layer itself had a hole, recently and concretely:** wasmtime-wasi filesystem sandbox escape via cap-std trailing-slash/symlink handling (GHSA-vqjp-4c8c-hfgg, 2026-08-20), fixed by coordinated patches across four release lines, unexploitable only on recent Linux with `openat2` `RESOLVE_BENEATH` (SRC-11). Design consequences: default extensions to zero filesystem grants (so a sandbox bug has nothing to reach), pin patched runtime lines, ship host updates, don't rely on one OS mitigation.
4. **The reproducibility pattern already exists in the domain:** OpenRefine's operation history is extractable JSON, re-appliable to other projects, doubles as audit evidence, and its project archives carry earlier data states — a documented privacy hazard (SRC-12). One log can serve preview, undo, and export simultaneously.
5. **Version governance is a solved-but-strict discipline elsewhere:** Zotero's compat ranges, explicit upgrade lifecycle, and shimmed update-manifest migration (SRC-05); OpenRefine's demonstrably moving extension API and same-day failed release superseded by 3.9.5 (SRC-06). Extension APIs drift; releases fail; silent "newest" loading is contradicted by both.
6. **Declarative transformation shrinks the sandbox problem:** JSONata — a lightweight query/transformation language for JSON, embeddable, with configurable guardrails — covers the bulk of cleaning work without arbitrary code (SRC-07). The sandboxed code tier should be the exception.
7. **Domain packaging reality:** MarcEdit — real librarian tooling — is Windows-first with COM-based automation, Wine on macOS, mono on Linux (SRC-08): an argument for bundling a self-contained extension runtime rather than leaning on OS scripting bridges.
8. **UI capability split is a proven pattern:** Figma's document-facing sandbox without browser I/O plus a UI iframe with I/O but no document access, manifest-declared network allowlists enforced as CSP errors, and forced cooperative cancellation (SRC-04).

## 4. Conditions (what each carried-forward design choice assumes)

- Content-over-stdin (P2) assumes collections fit practical pipe/memory limits; above that, the capability-directory path applies with its own (patched-runtime) condition.
- Operation-log undo (P4) assumes extensions are deterministic pure transforms; any extension needing external side effects is out of scope for the log model and should be structurally impossible at tiers T0/T1.
- WASM tier assumes per-extension compile/startup latency is acceptable for interactive preview — **unmeasured** (no runtime this pass).
- JSONata tier assumes a port mature enough for the host's implementation language (the JS reference is the conservative choice; ports are at "varying version levels" — SRC-07).
- Version pinning (P5) assumes the workbench ships an update mechanism good enough that pinning doesn't strand users on vulnerable extensions — the SRC-11 chain is the reminder that the *host runtime* needs updates too, not just extensions.

## 5. Alternatives retained

- **All-WASM (no declarative tier):** simpler mental model, one sandbox; rejected as sole tier because simple expressions become heavyweight to author and most cleaning never needs it.
- **All-in-process QuickJS (no process/WASM tier):** cheapest, fastest startup; retained only as an implementation detail of the declarative/expression engine, not for arbitrary code — no authority boundary (SRC-09).
- **Deno worker tier as the code tier:** best JS ergonomics with real capability gating (SRC-01); conditionally preferable if a JS-native code tier is a hard requirement; costs a bundled runtime in a desktop app (cf. MarcEdit's Wine/mono burden, SRC-08) and requires never granting its escape valves.
- **Snapshot-undo instead of operation-log:** simpler to implement, loses replay/export/audit (SRC-12 shows the log serving all four); rejected as the primary mechanism, retained as a possible fallback for non-loggable operations.
- **Extension UI inside the extension process:** simpler plumbing; rejected in favor of the Figma-style split (SRC-04) because it puts the manifest network allowlist's enforcement point and the data/UI boundary in the right places.

## 6. Optional capabilities and user decisions

- **User decision:** automatic update *checks* (not auto-loading) — on/off, and notification style.
- **User decision:** whether history is included in offline exports (privacy: history carries earlier data states, SRC-12).
- **User decision:** per-extension network allowlist grants (Figma-pattern, SRC-04), requested by the extension manifest, approved per user, revocable.
- **Optional capability:** a scripting/console tier for power users (MarcEdit's COM-for-VBScripts audience, SRC-08) — local, explicitly non-sandboxed for the user's own scripts, clearly separated from third-party extensions.
- **Optional capability:** compare-mode over two datasets using the same operation log (brief's "compare") — natural extension of replay, untested, proposed only.

## 7. Uncertainty register (current at draft time)

1. Extism manifest capability fields unverified (docs 404 at access, SRC-10) — affects T1 interface detail only; the Wasmtime guarantees underneath stand on SRC-02.
2. OpenRefine release *years* not displayed on the releases page (SRC-06) — chain order and content verified, absolute years not.
3. QuickJS upstream maintenance status uninvestigated (SRC-09) — matters if chosen as the expression engine.
4. JSONata port maturity per language (SRC-07) — unresolved implementation choice.
5. WASM startup/preview latency on librarian-class hardware — unmeasured; gating condition for the T1 tier's interactivity.
6. Target metadata schema(s) for the sample formatter and core model (MARC-family vs CSV/JSON) — product decision flagged in P6, unresolved by this research.
7. What the thin plan's "extension scripts" language is meant to cover (arbitrary executables? shell scripts? — affects whether P1's correction needs an interpreter-bundling policy). Uncertain; flagged for the build stage.

## 8. Executed checks vs proposed validations (separated per O6)

**Executed this stage (actual operations performed):** web research and retrieval of 12 primary sources (recorded with timestamps and operations in `source-map.json`, excerpts in `sources/`); the plan reveal (`reveal-plan.py`); hash verification that discovery artifacts were unchanged by the reveal; JSON validation of `source-map.json`. **No code was executed against any extension runtime; no sandbox was exercised; no benchmark ran.** Nothing in §2's dispositions rests on a runtime experiment.

**Proposed (not executed — from discovery §6, carried forward with P-clause hooks):**

1. QuickJS/runtimer ceiling test — memory-bomb and infinite-loop inputs against `JS_SetMemoryLimit` + interrupt-handler timeout (hooks P3): discriminates enforcement under adversarial load.
2. WASI zero-grant + escape simulation on a *patched* wasmtime line (≥ 24.0.13 per SRC-11), trailing-slash/symlink shapes from the advisory against a single preopened dir (hooks P1/P2) — qualified sandbox only, never against host data; discriminates the default-no-grant posture against the known escape class.
3. Deno-worker zero-permission assertion — `fetch`/file/`Deno.run` all `NotCapable`; brokered host function works, net/file still fail (hooks P1/P2).
4. Operation-log round-trip — same op-JSON applied to two dataset copies, byte-compare; truncate (undo) and re-apply (hooks P4): discriminates replay determinism.
5. Preview determinism — identical preview requests produce identical samples/diffs (hooks P4).
6. Manifest allowlist enforcement — declared single host allowed, second host CSP-blocked (hooks P2, optional capability).
7. Sample-formatter end-to-end (P6 retained) — extended with failure-path cases: timeout exceeded, memory exceeded, malformed output, version-mismatch extension (hooks P5).

## 9. Summary of what changed relative to the thin plan

Kept: process-per-extension for code (P1 mechanism), timeouts (P3 core), commit-after-success (P4 direction), sample-formatter test (P6). Corrected: authority model added to P1; path-argument exchange replaced in P2; resource policy completed in P3; commit routed through a reproducible operation log in P4. Replaced: P5's auto-newest with pinned versions and an explicit upgrade lifecycle (auto-*check* remains a user decision). Extended: P6 from one happy-path sample to a discriminating matrix. Added beyond the plan: a declarative no-code tier as the default path, the Figma-style UI/data split, and the privacy condition on exported history.
