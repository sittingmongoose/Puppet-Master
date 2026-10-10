# S02 — Oxford Common File Layout (OCFL) specification

- URL: https://ocfl.io/1.1/spec/
- Released version: OCFL 1.1 series; latest release listed during this research was 1.1.1 (tag `1.1.1`, commit `c3f88b3`); see S04. Relevant rules are stable in the 1.1 specification family. The live HTML is an official rendering, accessed 2026-10-10T04:14:43Z.
- Locators: §§3.3, 3.5.1–3.5.3, 3.6, 3.8; especially lines 163–174, 191–220, 231–248, 291–315.
- Observed operation: Read official specification and release-pinned history link; no OCFL validator or implementation was run.

## Evidence and conditions

An OCFL object is a filesystem structure with one or more continuous version directories (`v1`, `v2`, …). Existing versions are expected to be immutable. Every file under a version's designated content directory must appear in that version's inventory manifest. The inventory has a stable object ID (must not change between versions), the digest algorithm, `head`, a manifest mapping digests to stored paths, and per-version state mapping digests to logical paths. Inventory paths use `/` and have path-safety restrictions (`.`, `..`, empty elements, leading/trailing slash, and conflicting paths are prohibited). Each inventory has a matching digest sidecar written after inventory changes. An optional `logs/` directory can hold local records of actions; its format is explicitly outside the object specification.

## Applicability

OCFL offers first-class version history while remaining a transparent filesystem layout, so it can be copied as files. It is more structured and validation-dependent than a single BagIt deposit and requires careful updating of inventories and sidecars. For a small pilot with a few corrected captions it is a credible alternative, but likely excess process unless the gallery wants reconstructable accumulated version states. It does not by itself settle which exhibition assets ought to be included or prove offsite restore success.
