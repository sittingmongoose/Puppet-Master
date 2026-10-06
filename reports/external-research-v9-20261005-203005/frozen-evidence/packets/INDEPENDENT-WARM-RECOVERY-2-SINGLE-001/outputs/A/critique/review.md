# Critic and recovery report

## Provenance and scope

Provenance: **candidate-authored native self-critique/repair of the prior authenticated same-arm artifacts**, within this combined critique+repair Goal. “Independent critique” here means my own fresh audit attempt against the unchanged brief, criteria, eligible primary-source captures and bounded witness. This report is not a separate independent evaluator, not a Sol source assessment, and does not establish an independent source grade, evaluator PASS, quality validation, or method superiority.

The scientific authority is `inputs/brief.md` (SHA-256 `27311c714607087ce93df4544c37fa3adf871a12ec77e4f9e8896565e0a4e628`), together with the frozen criteria, source access, source separation and output contract. I could not resolve a concrete file path for the admitted `inputs/prior/<origin-job>/` proposal/catalogs. Reading the directory itself is unsupported by the bounded file reader; no claim-by-claim comparison to those artifacts is therefore asserted. This material gap is retained in the replacement proposal and catalog. No other arm, evaluator material, campaign report, hidden answer or supplied correction was used.

## Checks performed

| Area | Check and evidence | Result and limit |
|---|---|---|
| Brief and delivery obligations | Read the unchanged brief and output contract. | Recovered the research-tool scope, complete workflow, large-file target as an engineering goal, source-boundary requirement, separate validation states and four canonical artifact types. |
| OME-NGFF | Public 0.4 specification capture S1; axes and coordinate-transformation sections. | Supports representing named axes and sequential scale/translation transforms in its stated dimensional bounds. It does not prove a particular reader, project format, orientation choice or application behavior. |
| Viewer precedent | Napari 0.9.2 release capture S2 and partial Shapes guide capture S3. | Release identity and the guide's high-level shape-editing scope are supported. The partial guide is not evidence for persistence, mask semantics, performance, accessibility or a complete app architecture. |
| Storage failure chain | Zarr issue #3516 S4, PR #4450 S5, and captured PR file diff S6. | The issue is a reporter account for Zarr 3.1.3/Dask `to_zarr` with ZipStore; PR #4450 was open and unmerged at capture, and its visible diff adds ZipStore tests. This is not a merged/released fix, a passing test result, or a candidate reproduction. The brief's full issue-to-verified-fix chain is not established. |
| Coordinate arithmetic | Candidate execution W1, isolated standard-library calculation. | For the supplied three-axis values, `world = translation + scale × index` gives `[11, 1, 12]`, and the inverse recovers `[3, 4, 8]`; 3 GiB / 64 MiB is 48 blocks. This verifies arithmetic only, not an image library, metadata parser, viewer, storage backend, memory use or throughput. |
| Prior artifact claims | Attempted to resolve the admitted prior namespace. | UNASSESSED: its proposal/catalog claims, exact citations, source selection, numerical statements and omissions could not be compared because no concrete prior file was addressable. The new proposal must not be read as proof that any prior claim was corrected. |

## Changes in the recovery artifacts

- Reframed the proposed product as an incremental research workspace and separated sourced facts, engineering inferences, product choices and proposed/UNEXECUTED validations.
- Restricted NGFF statements to the captured 0.4 axes and transformation contract. The proposal defines an application-level coordinate contract as a choice and marks index-origin conventions and reader interoperability for testing.
- Kept napari as a bounded candidate for interactive display and vector annotation. Avoided treating release marketing or a partial guide as performance, persistence or mask evidence; raster masks and storage need a separately tested component.
- Recast the Zarr report as an unresolved issue/PR/test-source chain. It is used to motivate a storage-risk gate, not as proof of a shipped repair. LocalStore performance or durability is not inferred from the reporter's comparison.
- Made 3 GB access, cancellable progress, crash recovery, relocation, annotation round-trip, exports, undo/redo and accessibility explicit design requirements with proposed validation. None is represented as already demonstrated.
- Kept original-data identity and project recovery as design requirements. Hash checks, staged writes, journal/snapshot policy, rename/fsync behavior and shared-filesystem semantics remain implementation choices requiring platform testing.

## Remaining unknowns and coverage

1. **Prior comparison: UNASSESSED.** Exact same-arm predecessor claims and omissions remain unknown; semantic preservation cannot be certified without addressable predecessor files.
2. **Issue-to-fix applicability: PARTIAL.** The captured PR head `d0958ad03abd9d4b8096b11526789324fbc0b32d` and visible test diff are not evidence of merge, CI success or a released version. Do not rely on ZipStore for durable writes based on this chain.
3. **Compatibility: UNEXECUTED.** Actual microscopy formats, metadata edge cases, pyramids, channel/time axes, physical units, orientation and unsupported-input recovery need representative fixtures and explicit version pins.
4. **Application behavior: UNEXECUTED.** The 16 GB/8-core target, 3 GB bounded access, responsiveness, cancellation, save recovery, multi-machine relocation, exports, annotation persistence, mask behavior and accessibility have not been tested in a full application.
5. **Filesystem guarantees: UNKNOWN.** Atomic replacement and durability differ by local, network and shared filesystems; proposed staged writes and recovery journal require failure-injection tests on supported platforms.
6. **Scope boundary: PARTIAL.** OME-NGFF, napari and Zarr are independently useful standards/component precedents, but the evidence is not a complete interoperability or product comparison. No universal compatibility claim is made.

No aggregate score or outcome label is assigned. This report records candidate-authored checks, changes and unknowns only. The four current final artifacts are authored together in the native-adopted delivery bundle; no content is written to the reserved `out/final/` directory.