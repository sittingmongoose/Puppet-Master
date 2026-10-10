# S01 — BagIt File Packaging Format (RFC 8493)

- URL: https://www.rfc-editor.org/rfc/rfc8493.html
- Released version: BagIt v1.0; RFC 8493, October 2018.
- Accessed: 2026-10-10T04:14:43Z (read-only browser retrieval; sections below inspected).
- Locators: §§1.1, 2.1.3, 2.2.1–2.2.4, 2.4, 3, 5.4, 6.1.1–6.1.2; in particular RFC text around lines 140–166, 321–378, 384–425, 604–609, 653–707, 847–854, 943–1001.
- Observed operation: Read official RFC text. No BagIt generator or validator was run.

## Evidence and conditions

BagIt is a directory-based wrapping convention for opaque payloads, with metadata tags; users can access payload files without a BagIt-aware tool. A BagIt 1.0 payload manifest lists every payload filename exactly once. Completeness requires all required elements and listed files to exist and every payload file to be listed in every payload manifest. Validity adds successful checksum verification for payload and tag manifests. These are distinct checks and neither expresses a curator's intended content set.

BagIt 1.0 creation/validation tools must support SHA-256 and SHA-512; they should enable SHA-512 by default. Additional tag files are allowed, but implementations that do not understand a custom tag ignore its contents; a listed custom tag is checksum-validated. `bag-info.txt` is optional metadata intended primarily for human reading and editing. Thus a local CSV/README inventory is feasible, but its field meanings and completeness are local choices, not standardized BagIt semantics. Put the CSV in the payload if it must be covered by the payload manifest; otherwise list it in a tag manifest and do not assume generic clients interpret it.

The RFC describes manifests as protection against corruption, not active attacks; signatures or other controls are outside scope. Its interoperability discussion says filesystems and utilities can normalize names differently (notably composed/decomposed Unicode) so a manifest path can fail a simple existence check although the name looks identical. The RFC recommends avoiding case/normalization collisions and tolerating normalization differences; it also requires `/` in manifest paths and discusses Windows/Unix path constraints. This matters to local/offsite copies and motivates exact-path reconciliation plus safe pilot filenames.

## Applicability

A strong fit for an inspectable per-deposit package on ordinary filesystems. BagIt itself does not preserve a succession of corrected versions: use a new immutable, identified package/deposit for each corrected state and a separate version relationship record. A manifest validates listed package bytes; registrar review determines whether the intended exhibition set is complete; a separate restore test determines practical recoverability.
