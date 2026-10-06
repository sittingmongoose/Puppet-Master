# Independent DEC019 warm scoped source review

The one current 18185-byte critic report: consequential correction, preservation, source interpretation and physical delivery against admitted original research context

Scoped critic screen: **FAIL_SCREEN**. Final delivery: **INCOMPLETE**; absent-final semantics and full governing proposal: **UNASSESSED**.

## DEC019-WARM-S01 — HIGH

Critic declares atomic-save coverage and that everything outside its listed corrections can stand; D-4 recommends reusing the existing writer for export.

The admitted proposal overwrites each annotations/<id>.json via os.replace before replacing project.json last. A crash after one annotation replacement but before manifest replacement leaves old manifest plus new annotation contents, and possibly a mixture of new and old annotation documents. Deleting temp files and discarding an uncommitted provenance record restores none of the overwritten old bytes. This trace follows the specified operation order; it is logical analysis, not an executed test. Per-file atomic replacement is not an atomic project generation. Even perfect rename/fsync ordering does not close this gap. The asserted previous-generation guarantee therefore does not follow from the design the critic endorses.

A05 recovery and annotation consistency remain critical unresolved dependencies, beyond the export-output caveat. The critic should retain the directory-store alternative but qualify/change the generation-commit protocol; its blanket preservation instruction is unsafe.

## DEC019-WARM-S02 — HIGH

Critic says the identity/relocation/bundle contract is covered and everything else can stand, while P-4 treats QuPath identity-derived claims as preserved.

For OME-Zarr the admitted proposal hashes chunk filenames and sizes plus .zarray/.zattrs, not chunk data bytes. Replacing a chunk with different equal-length sample bytes while retaining its name and metadata leaves that defined identity input unchanged. This is a static counterexample to the specified digest input, not a new executed test and not a hash collision. The resulting digest cannot establish same image samples after relocation/reopen, which the brief and export reference contract require. Hashing a metadata-root listing in §4.2 is weaker still.

The source-change and annotation-reference guarantee is unsupported for an explicitly supported format. Preserve QuPath’s actual identity warning and the need for content identity, but do not endorse this listing hash as content_sha256.

## DEC019-WARM-S03 — MEDIUM

Critic lets the export contract stand apart from export atomicity, including the inherited claim that derived output content_sha256 differs from its source by construction.

A separate derived image identity/op record does not force different content bytes: a no-op/identity operation or identical-format copy may reproduce identical output bytes, and the proposed Zarr listing-only digest can also stay identical after changed samples. Thus content-hash inequality is not guaranteed by a derived label or provenance record. This is a scope/logic counterexample, not an executed data operation.

Derived provenance should be represented by image/op identity and explicit transformation semantics, without requiring an unsupported hash-inequality claim.

## DEC019-WARM-U01 — UNKNOWN

Critic §4 reports three executed checks E-1/E-2/E-3 using execution IDs and abbreviated code/stdout hashes, and confirms W1/W3.

The P1 allowlist contains no candidate check code, sandbox code/input receipts, full critic stdout/stderr artifacts, or independently inspectable execution records. Printed IDs/hash prefixes and inherited catalogs are not those artifacts. Source-checkable arithmetic/source mechanisms can be reviewed, but actual executed code, result integrity and admitted execution provenance remain UNKNOWN before P2. No fabricated execution is alleged.

Do not award verified execution or full A11/Q5 completeness from this packet alone. Preserve the legitimate arithmetic/source insights with execution provenance qualified.

## Supported findings retained

- SUP01: The #4926 issue symptom/reproducer, #5004 mechanism and permutation regression tests, and v0.4.18 release-note anchor form the cited chain in the captured versions. The critic correctly preserves its napari-only/internal-consistency limit, without cross-app or full-workspace credit.

- SUP02: #6636 diff contains per-axis sign normalization, new 3D decomposition/Affine tests and the changed mixed-flipped expectation. The 0.5.0 notes anchor it. The critic correctly retains the missing standalone-issue link rather than upgrading the partial chain.

- SUP03: C-1 correctly identifies internally inconsistent W2 geometry. 64×256×256 chunks against 2048×2048×362 produce grid 32×8×2 and 512 nominal chunks; an aligned 512×512 xy viewport touches 8×2=16 chunks, not 4. 1,482,752 bytes is 2048×362×2, not a full 2048×2048 xy plane (8,388,608 bytes). Choosing 256×256×64 yields grid 8×8×6=384 and four aligned viewport chunks. These are static arithmetic consequences, not newly executed checks. Resource feasibility remains an arithmetic-only illustration, with real decoder/filesystem/RSS behavior UNASSESSED.

- SUP04: QuPath captured documentation supports external path variants and the duplicate-entry identity warning, LUT/data separation, calibration sanity checks and plane-bound annotations. Preserving these facts is useful; they do not independently validate the proposed save protocol or listing digest.

- SUP05: The 0.5.0 release notes state that napari was not using axis-label/unit information at that release. The critic’s captured-version and no-live-refetch limitation is appropriate; it does not establish present-day napari capability. NGFF scale/translation and RFC7946 export qualifications in the inherited proposal have relevant matching captured text, but the entire un-reverified quotation set and chosen architecture remain UNASSESSED.

- SUP06: Every catalog source capture digest maps to an admitted HTTP200 body. There are 14 source records because S5b accompanies S1–S13; the critic’s count of 13 is a minor bookkeeping error. Byte identity supports capture integrity, not semantic correctness or fresh discovery. W4–W7 remain proposed/UNEXECUTED and are not converted into executed app checks.

The JSON report carries exact path/SHA/locator evidence, all 12 obligation states, all eight common dimensions, five qualified current checks and explicit limits. No whole-case PASS, original-pipeline/fresh/matched/causal credit, or verified execution credit is assigned.
