# Viewer integration finding — OME-Zarr multi-image collections

## Finding
A viewer integrating OME-Zarr should not silently open only the first image of a
`bioformats2raw.layout` multi-image collection: conforming readers SHOULD make users
aware that the collection contains more than one image, MAY use the `series` attribute
in the `OME` group as the list of valid image groups to display, and MAY offer the user
a choice of images. When neither `series` nor `plate` metadata is present, the viewer
must fall back to consecutively numbered image groups starting at "0" (i.e. "0/",
"1/", "2/", ...), one multiscale group per OME-XML `Image`, in order.

## Exact local source locator
- Primary: `inputs/sources/S003.txt` line 272 — "SHOULD make users aware of the presence of more than one image (i.e. SHOULD NOT default to only opening the first image);"
- Supporting lines in the same capture:
  - line 271 — "Conforming readers:"
  - line 273 — "MAY use the `series` attribute in the `OME` group to determine a list of valid groups to display;"
  - line 274 — "MAY choose to show all images within the collection or offer the user a choice of images, as with HCS plates;"
  - lines 268–270 — if no `series` attribute and no `plate` is present, separate multiscale images MUST be stored in consecutively numbered groups starting from 0, each representing exactly one OME-XML `Image` in order;
  - line 256 — conforming groups MUST have value "3" for the `bioformats2raw.layout` key;
  - line 267 — `series` path order MUST match the order of `Image` elements in `OME/METADATA.ome.xml` if provided.

## Applicable source / version information
- Source capture (only source used): `inputs/sources/S003.txt`, sha256
  `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de`, 36980 bytes, 896 lines.
- Document identified from the capture itself: OME-Zarr specification, Final Community
  Group Report, 8 September 2026; current released version 0.5
  (https://ngff.openmicroscopy.org/0.5/, capture lines 3–8, 25); OME-Zarr Metadata
  version "0.5" under the `ome` namespace (capture lines 150–156).
- Section: § 2.2.3 "Details" of the transitional `"bioformats2raw.layout"` metadata
  (capture lines 254–275).

## Applicability limits
- Applies only to filesets carrying transitional `bioformats2raw.layout` metadata with
  value "3" (multi-image collections converted e.g. by bioformats2raw); it does not
  govern the plain single-image hierarchy of § 1.1.
- The guidance is SHOULD/MAY, not MUST: a reader is still conformant without an image
  picker, but defaulting to only the first image is explicitly discouraged.
- If `plate` metadata is present, it takes precedence and parsing follows § 2.7; images
  are then located per plate/well rules rather than by `series` (capture lines 204–206,
  262–263).
- The metadata is transitional: intended to be removed in a future NGFF version
  (capture lines 60–64), added in v0.4 for datasets already in the wild, with an
  upcoming specification expected to replace it with explicit metadata (capture lines
  180–181). Treat this viewer behavior as compatibility behavior for existing
  0.4/0.5 datasets, subject to change.

## Proposed validation — UNEXECUTED
UNEXECUTED: Build (or obtain) a local `series.ome.zarr` fixture with `ome.version`
"0.5", `bioformats2raw.layout` = 3, and an `OME` group whose `series` lists at least
two image groups; open it in the viewer under test and confirm (a) the UI surfaces
that multiple images exist, (b) each `series` entry is selectable and renders, and
(c) with the `series` attribute removed, the viewer enumerates groups "0", "1", ...
instead of rendering only group "0". No fixture was built and no viewer was run in
this task; this validation has not been executed.
