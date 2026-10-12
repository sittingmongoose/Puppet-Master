# Independent critic review — D-R1-P02-control

**Disposition:** Strong, scope-faithful research and a useful component plan, with material completion gaps for the reviser. This critique records issues and uncertainty; it is not a final design, does not choose a library, and does not authorize narrowing the brief.

**Reviewed:** original brief; complete discovery, draft, investigator source map and source index; exact released C1–C5 plan and plan-reveal record. The draft quotes and disposition-maps each released clause. See [source-map.json](source-map.json) and [sources/index.md](sources/index.md). Investigator source IDs and records are preserved.

## Findings

### F-01 — Material incomplete — C1 alpha/resampling policy

**Locator:** draft §C1, “Correction — alpha and resampling” and “Condition”; discovery pipeline step 5.

The draft correctly says PNG stores unassociated alpha and asks for alpha-aware resampling and transparent-edge tests. It does not define what “alpha-aware” means. For ordinary filtering, specify that color is filtered in premultiplied-alpha form (then unpremultiplied for output when alpha is nonzero), or document and justify the pinned library’s equivalent behavior. Otherwise hidden RGB from fully transparent pixels can contaminate edge colors and create halos. Keep this as a component policy and test expectation, not a claim that PNG mandates a filter. The proposed hidden-RGB edge fixture is useful but does not settle the algorithm. Current PNG alpha representation is confirmed by CRITIC-PNG-01; candidate behavior remains to be checked on pinned builds.

### F-02 — Material incomplete — C1/C3 current PNG evidence

**Locator:** investigator source-map SRC-PNG-02; source index “Format standards”; draft §§C1 and C3.

SRC-PNG-02 is the W3C PNG Second Edition from 2003. It remains valid for cited facts, including unassociated alpha, but it is no longer the current edition: W3C published the Third Edition on 2025-06-24. The current edition describes eXIf, text and color chunks and discusses privacy. These details affect orientation/metadata conflict handling and the plan’s request to examine actual container mechanisms. SRC-PNG-02 is preserved without rebinding; CRITIC-PNG-01 adds the current source. The newer standard does not prove any library handles every chunk.

### F-03 — Material incomplete — C3 format-by-format sanitization basis

**Locator:** draft §C3, family list/evidence paragraph; source-map SRC-PNG-02, SRC-SHARP-08 and SRC-IM-16.

The denylist-to-allowlist correction is sound, and the draft appropriately refuses a completeness claim from one sample. Its proposed inventory names JPEG application segments and auxiliary/container records but supplies no primary JPEG/container specification or format-specific locator for those mechanisms. PNG evidence also uses the superseded edition (F-02). Supported input/output formats remain an owner decision, so this is not a demand for universal sanitization; each later allowlist and validation claim should be tied to the selected formats and their current metadata structures. Until then, privacy completeness is honestly unresolved. Keep unknown/unparsed data on an explicit fail, strip or review path.

### F-04 — Minor locator/wording — C4 atomic publication condition

**Locator:** draft §C4, “Write each output to a unique staging path and publish atomically.”

Staging and publishing only completed outputs is sound. State that atomic rename/publication depends on the destination filesystem and staging location having the required atomicity semantics. If that cannot be guaranteed, define a commit-marker/state protocol so a partially copied file is never reported as complete. No filesystem publication behavior was tested.

### F-05 — Honestly unresolved external input — ImageMagick patch/revert history

**Locator:** discovery “History that changes risk assessment,” SRC-IM-18; draft C1, C5 and candidate summary.

The ImageMagick issue supports reported differences between LZW-compressed and JPEG-compressed TIFF pages under 7.1.1-29. In the issue view inspected, I saw linked commits but not enough primary evidence to verify the more specific statement that a patch regressed other pages and was reverted. Keep the orientation/compression regression conditional; verify the patch/revert through its linked commit or PR before relying on that chronology. Issue closure does not establish current-release behavior.

## Plan and brief coverage

| Scope | Critic assessment |
|---|---|
| C1 operation order and visual behavior | Correctly rejects resize-then-orient as universal, accounts for decoder orientation paths, output profiles, precision, scaling and flattening choices. The commutation caveat is useful. F-01 and F-02 remain. |
| C2 derivative identity/regeneration | Strong: keeps source digest/preset and adds resolved settings, policy, decoder/codec/color/encoder provenance. It limits reproducibility claims and leaves byte identity/retention to owners. No material error found. |
| C3 metadata roles/privacy | Correctly separates export/internal policies and color-profile treatment, favors re-encoding plus encoded-file inspection, and rejects one-tag/one-sample proof. F-02/F-03 leave format evidence incomplete. |
| C4 limits, failures, batches/cancellation | Strongly improves pixel-only limits with memory, time, disk, concurrency and frame/page controls; preserves successes and makes partial state visible. F-04 is a small publication-contract condition. |
| C5 validation | Proposed fixtures cover orientation/mirrors, profiles, alpha, corrupt/huge inputs, metadata, mixed batches and cancellation. The draft accurately reports that no product fixtures, image code, build, malicious-input test, perceptual review, benchmark or integration ran. Keep all validations labeled proposed. |
| Alternatives and discovery | Preserves three maintained candidates, material defaults/build caveats and issue history without selecting a winner. The draft adds useful selection criteria and retains owner decisions. |
| Original brief | Covers inspection, predictable derivatives, unchanged originals, exports, side-by-side color/orientation risk, provenance, resource rejection, mixed support, cancellation, unsupported/error explanation and no plausible fallback/upload. No brief obligation is silently dropped. |

## Source and claim audit

I independently opened the listed official Sharp input/constructor/operation/output pages, Pillow ImageOps/ImageCms/limits documentation, ImageMagick options/changelog, CIPA’s standards listing, ICC.1:2022, listed upstream issue/PR histories and the current W3C PNG Recommendation. Checked claims about Sharp metadata dimensions/pixel-limit trust/default metadata behavior; Pillow transpose/intent/limits; ImageMagick EXIF auto-orient/resource controls; Pillow 8.3.0 fix history; and Pillow’s YCbCr TIFF history are substantially supported with the stated conditions. The Pillow TIFF PR explains that libtiff previously applied orientation in the YCbCr path and that Pillow changed that path to prevent libtiff from doing so; describe it as version-specific regression/fix history, not permanent current Pillow behavior. The libvips ICC report remains one reported unshared input as the investigator says. ImageMagick chronology is F-05.

SRC-EXIF-01 correctly limits itself to identifying the current Exif edition rather than claiming the listing is the tag-level standard. Pillow 12.3.0 documentation identity is confirmed by CRITIC-PILLOW-01. No material wrong correction was confirmed; the identified gaps concern precision, current format coverage and evidence depth. Candidate behavior and owner-dependent defaults remain conditional.

## Executed versus proposed

**Investigator executed:** desk research and source reading only, per the package.

**Critic executed:** independent review of the specified package; browser review of official documentation/specifications and upstream issue/PR pages listed in the critic source map. No image fixtures, code, build, malicious-input test, benchmark, perceptual comparison, production integration or filesystem-publication behavior was run.

**Proposed only:** product validation matrices in discovery and draft. Do not report them as executed.
