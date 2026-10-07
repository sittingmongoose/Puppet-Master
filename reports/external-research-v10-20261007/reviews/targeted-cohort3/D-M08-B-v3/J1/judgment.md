# D-M08-B / J1 independent full declared-source judgment

**Verdict: FullSourceFAIL.** The complete declared scientific scope was assessed, including all six brief obligations, all seven material critique findings, every consequential recommendation, and the supplied rewrite-to-final transition. The failure is a material mask-selection scope/precedence defect at final.md:9, carried into its acceptance of critique finding 3. The categorical policy, transform recommendation, optional continuous-band advice, and justified uncertainty otherwise remain supported. This is not a blanket rejection.

The reviewed final is SHA-256 `adba86b75bdef82e9507fd4f334bd959591633243045b7dbb2c6c0d69c0cd921`; the rewrite is `76521e8409a8d746ed33c3b95169b1194c353895289f7d9c8642db81ee99147d`. All nine scientific input hashes matched INPUT_MAP.json, and all three frozen primary captures matched newly fetched bytes at their exact release URLs.

Only the permitted map, brief, manifest, three frozen sources, two common scientific predecessors, and this final/rewrite were read locally. Additional reads were narrowly selected public release-source files. Blinding is incomplete: the map itself exposes a `control/coherent-rewrite-check-final-v3` pathname. The permitted documents also contain incidental timing/lifecycle run records; these were encountered but excluded from scientific judgment. No sibling answer, evaluator judgment, parent/lineage thread, account/configuration, repository canon, or campaign history was inspected. Native lifecycle, budget, and billing quality are outside this judgment.

## 1. Required brief obligations

| Original obligation | Coverage and determination |
| --- | --- |
| Resolve all material critique findings explicitly | Final:19-25 gives seven corresponding dispositions. Findings 1, 2, 4, 5, 6, and 7 are substantively handled; finding 3 is explicitly accepted but its mask-precedence scope is not repaired. |
| Bind class labels and nodata/mask interpretation | Final:7 requires authoritative mapping, allowed valid codes, separate validity, and collision resolution; unavailable schema and mask authority remain honestly conditional. Polarity and external-mask priority are supported. The API/precedence defect at final:9 prevents full satisfaction. |
| Check changed resampling and dependent validity claims | Final:5,11 restrict nearest to sampled-class intent; dominant-class invalid-contributor/tie policy remains separate. Same-location validity is a proposal, with any/all contributor policies distinguished and actual operation behavior unverified. The changed mask-selection wording is the unsupported consequential exception. |
| Preserve output transform/resolution obligations | Final:13,23,29 retains actual-shape ratios, existing-footprint restriction, origin/rotation, outer corners, and separate destination-grid requirements for different bounds/alignment or CRS. Supported. |
| Retain distinct optional continuous-band advice | Final:15,24 retains qualified bilinear/cubic and goal-dependent average, chosen per continuous band independently of categorical handling. Supported. |
| Distinguish uncertainty and proposed/performed tests | Final:29-31 explicitly distinguishes proposed raster tests from source review and identifies the unknown grid, class mapping, sentinel collision, mask provenance, and output-validity rule. Supported within the supplied record. |

The final has seven material dispositions and approximately 850 whitespace-delimited words including its source/run record, within the brief's soft bounds. Neither inventing unavailable dataset settings nor an application plan is necessary to satisfy this diagnostic module.

## 2. Consequential claims and governing conditions

**D1: dataset-level precedence is generalized to mask reads, and the RGBA fallback loses its ordering condition.** Final:9 says an existing alpha/internal/external mask takes precedence over nodata for mask reads, then says shadow-nodata RGBA `dataset_mask()` instead uses band 4. These are not interchangeable API rules.

Frozen **S2:222-236** expressly orders the dataset-wide selection and distinguishes it from per-band masks. A qualifying dataset mask is considered first; RGBA/shadow-nodata is a fallback. **P4:1061-1065** checks the first band's `per_dataset` flag before the four-band/red branch, which returns `read_masks(4)`, not unconditional raw alpha values. The RGBA condition cannot override that earlier branch. The final needs this governing condition even if its two adjacent sentences could be read charitably as an abbreviated hierarchy.

For per-band reads, **P4:249-262,967-974** obtains GDAL mask bands and warns about nodata shadowing alpha. **P8:70-76,88-93** contains release-authored expectations for nodata flags without alpha/per-dataset flags, and a warning on `read_masks()`. **P6:7299-7311,7344-7353** places a band's in-range nodata rule ahead of RGBA alpha in GDAL 3.9.0's default implementation.

A concrete static counterexample is an RGBA pixel with red value 0, alpha 255, declared nodata 0, and no overriding mask: the per-band red validity follows nodata, despite nonzero alpha. Calling an existing alpha band the effective dataset-wide mask requires checking its actual flags; the final does not bind that condition. This counterexample follows the released branches; it was not executed. GDAL 3.9.0 is the checked comparison version, not an assumed runtime bundled with every Rasterio 1.3.10 installation.

The other side of the same defect concerns a recognized dataset-wide .msk/internal mask on RGBA: the first dataset-mask branch remains authoritative even when shadow nodata also exists. **P7:131-139,181-184** separately encodes an RGBA external-mask-over-alpha expectation; that supplied test does not itself cover the combined shadow-nodata case. The combined case's ordering follows P4, not a claimed executed test. Using alpha as the authority where an external mask disagrees can change which output classes are valid.

The remaining consequential claims were independently assessed:

| Final claim / critique connection | Primary evidence and assessment |
| --- | --- |
| Nearest as a proposed sampled-class baseline; no numeric interpolation of class IDs; dominant-class policy separate (final:5,19; critique 1) | S1:56-68 gives general guidance rather than a categorical guarantee. P5:53-66 identifies nearest, average, and mode. The categorical conclusion is a disclosed semantic inference: arithmetic on arbitrary identifiers is inappropriate. It is not a guarantee of class-domain membership for every driver, dtype, overview, or input. Conditions and separate tie/invalid-contributor choices are preserved. |
| Class mapping, valid-code set, nodata collision, and separate validity (final:7,20; critique 2) | S2:85-92 illustrates meaningful values rounded to declared zero nodata; S2:111-124,182-183 shows mask-based validity can override value-based nodata without changing values. A scalar sentinel alone cannot disambiguate a collision. Checking valid outputs rather than requiring every stored invalid pixel to be a class is correct. |
| Mask polarity, per-band versus dataset-wide meaning, and nodata-driven OR (final:9,21; critique 3) | S2:7-15,49-55,203-216 supports nonzero-valid versus True-invalid. S2:232-236 supports OR only after higher-priority dataset rules do not apply. Some-band-valid is not all-bands-valid. These portions remain supported; D1 concerns API scope and earlier precedence conditions. |
| Output-validity alternatives and no automatic propagation guarantee (final:11,22; critique 4) | S2 describes mask representations/selection, not a universal footprint-validity contract. Same-location, any-valid, and all-valid policies are distinct. Preserving an unverified selected-operation statement is justified; no operation or raster was supplied. |
| Transform and grid (final:13,23; critique 5) | S1:35-48 uses actual array dimensions and right-composed affine scaling; S3:15-32 gives origin, pixel vectors/rotation, and outer-corner coordinates. For positive output dimensions resizing the full existing grid, T' = T * Scale(W/w,H/h) maps (w,h) to T(W,H), including rotation, and preserves the origin. Different bounds/alignment or CRS need their own grid definition. |
| Optional continuous recommendation (final:15,24; critique 6) | S1:62-68 directly supports qualified bilinear/cubic and goal-dependent average. No universal superiority or mass-conservation promise is added. Continuous advice remains optional and separate. |
| Verification/uncertainty record (final:25,29-31; critique 7) | The proposed checks cover allowed codes, mask rule/polarity, selected operation, external masks, per-band disagreement, edges and invalid neighborhoods, output shape/corners, and continuous output. The available sources do not supply the missing product/data choices or observed runtime results. |

Source identities and locators below use **raw-byte file line numbers**, not the browser parser's sometimes compressed line numbering. Capture date is 2026-10-07 for every source; all raw HTTP fetches returned 200.

| ID | Exact primary URL/version | SHA-256 | Inspected extent |
| --- | --- | --- | --- |
| S1 | [Rasterio 1.3.10 resampling.rst](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst) | `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727` | Full frozen file, lines 1-68; remote bytes matched. |
| S2 | [Rasterio 1.3.10 masks.rst](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst) | `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9` | Full frozen file, lines 1-250; remote bytes matched. |
| S3 | [GDAL v3.9.0 geotransforms_tut.rst](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst) | `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc` | Full frozen file, lines 1-38; remote bytes matched. |
| P4 | [Rasterio 1.3.10 _io.pyx](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx) | `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190` | Read/read-mask call path, mask warning, and dataset_mask docstring/branches: especially 249-262, 407-455, 587-627, 742-819, 962-976, 984-1076. |
| P5 | [Rasterio 1.3.10 enums.py](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py) | `4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b` | Resampling definition and availability notes, 48-132. |
| P6 | [GDAL v3.9.0 gdalrasterband.cpp](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/gcore/gdalrasterband.cpp) | `984a2fb02108d2c45b05225b8afe601486dc3d559af7cbea36488a848e348797` | Default GetMaskBand contract/implementation, 7099-7386; recognized sidecar conditions 7121-7130. Driver overrides remain possible. |
| P7 | [Rasterio 1.3.10 test_dataset_mask.py](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/tests/test_dataset_mask.py) | `be08cd3b7bdf8878f8549f62df1eb762c0f4d544bfb125262401ee5b3edc58ee` | Static source inspection: pixel arrays, relevant fixtures and dataset-mask expectations; especially 14-36, 101-108, 131-139, 156-184. Tests not run. |
| P8 | [Rasterio 1.3.10 test_band_masks.py](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/tests/test_band_masks.py) | `fd4d4417c618c8c0cc50a05b1a3bbe1629ef5459d9ddc0a1c6d6bcd489601da4` | Targeted alpha/shadow/sidecar fixtures, flags, warning and mask assertions, principally 13-93 and 157-170. Tests not run. |

## 3. Bounded useful discovery and optional leads

The additional release checks were useful for resolving a disputed API condition; they were not citation-count checking. Released implementation is stronger evidence for release behavior than a generalized reading of the topic page. The extra files also identify mode as a most-frequent-sampled-value algorithm, but do not by themselves settle the product's footprint, invalid-contributor, or tie contract. The candidate was not required to discover or prescribe mode.

The supported continuous-band lead is retained without conflating it with class IDs. Unknown schema, target grid and mask authority are actionable remaining inputs, not reasons to discard the whole recommendation. No exhaustive claim about discovering every possible algorithm, driver interaction, or unknown defect is made.

## 4. Incorrect rejection or correction

The final does not incorrectly reject the nearest baseline, the affine formula, the continuous methods, or the critique's useful validation requests. Its amendments appropriately limit assertions and preserve data-dependent choices.

The problematic correction is acceptance of critique finding 3's broad mask-precedence statement without restricting its API scope. That issue originates in draft:11 and critique:15, continues at rewrite:9, and becomes more categorical in final:9 through the unqualified RGBA fallback wording. D1 is one linked mask-authority defect, not several separately weighted penalties. The no-runtime-tests caveat does not correct a positive source-selection claim elsewhere in the answer. The full-source failure does not imply the six other critique dispositions are wrong.

## 5. Final preservation of supported material, criticism, identity, and uncertainty

The complete rewrite-to-final diff was inspected. Sampled-class intent, dominant-class invalid/tie rules, allowed codes and collisions, opposite mask polarities, conditional OR, output-validity alternatives, existing-footprint grid restrictions, continuous methods, all seven dispositions, source versions/hashes, and the proposed-test status survive.

The mask paragraph changes from a separate RGBA rule in rewrite:9 to an unqualified override-like sentence in final:9; the API-scope error is inherited and the ordering ambiguity is strengthened. This is consequential meaning preservation failure, not merely a stylistic change. The final's verification paragraph makes the selected-operation nodata/mask test more explicit, which is a supported clarification.

The original draft's explicit continuous/categorical grid-alignment reminder is compressed out of both rewrite and final. Their common destination-grid discussion retains the scientific grid constraint, but the per-band alignment reminder is less explicit; this is a minor clarity loss, not a separate material failure. The final also omits the rewrite's standalone word "footprint" in the changed-bounds/alignment exception, while expressly retaining the existing-footprint restriction in the preceding sentence and disposition 5. That does not change the governing resize condition.

All three cited source identities remain exact and verified. No supported optional continuous advice is rejected, and no claimed empirical validation is substituted for uncertainty.

## 6. Proposed versus executed checks

**Candidate record:** final:29-31 reports documentation review only; representative-raster tests remain proposed. The supplied scientific artifacts contain no claim that those tests passed. Candidate runtime history was not independently audited, and no excluded history was consulted.

**Actually performed by this reviewer:** full permitted scientific reads and hash comparisons; three frozen-source URL/hash confirmations; targeted public release implementation/enumeration/test-source inspection; a complete rewrite/final diff; and reviewer-authored exact-rational affine arithmetic for a rotated/sheared 9x15 to 3x5 resize. All four outer corners matched the corresponding source corners. This arithmetic used no downloaded project code and verifies the transform reasoning, not Rasterio execution.

**Not executed:** Rasterio/GDAL processing, downloaded tests, real raster exports, external-mask round trips, resampling benchmarks, dominant-class/tie experiments, and continuous-band data tests. Released test assertions are documentary evidence, not observed test passes. The chosen operation, GDAL runtime/driver, raster schema, mask authority and dataset-specific behavior remain unverified.

No declared scientific portion was left UNASSESSED. Empirical behavior and native lifecycle/budget are explicitly outside the available evidence, rather than silently credited. The narrow source defect above is sufficient for the stated verdict; the otherwise supported recommendation and justified uncertainty are retained.
