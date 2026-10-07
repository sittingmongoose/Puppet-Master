# D-M01-B — prospective paired review repair

X and Y each provide a supported **conditional all-required-band recommendation** and address all six obligations. Both remain subject to explicit source/fixture precision qualifications. The central nonzero intersection is sound when the land-cover computation requires all three bands; the brief does not decide missing-band tolerance. This is a complete semantic review with qualifications, not an unconditional accuracy certification, a new grade, or a ranking.

The immutable original review is **97,761 bytes**, SHA-256 `78e53eba2e989b732aa5ab7e0a3a659db39f20a311ec38e074b83d6568d238cc`. Its original numeric/pass fields remain null and its bytes are preserved. This repair explicitly delivers the readable judgment that the original closeout left incomplete.

## Coverage and delivery

| Item | Actual coverage |
|---|---|
| Frozen artifacts | 7/7 read in full; all declared hashes match |
| Required obligations | 6/6 per arm; 12/12 total |
| Consequential claim groups | 29 per arm; 58/58 dispositioned in REVIEW.json |
| Prior findings | 9/9 independently resolved |
| Proposed fixtures | X: 3; Y: 4; all 7 semantically assessed; 0 raster fixtures executed |
| Frozen sources | Both identity/hash checked and freshly retrieved from their pinned public URLs |
| Additional primary checks | GDAL v3.8.5 RFC 15; NumPy v1.26.4 all/reduce sources; independently retrieved and hashed |
| Remaining verification gaps | Four historical execution/nonexecution fact groups; actual tiles/product semantics; exact dispatch timestamp |

No consequential semantic group is omitted. Historical read/hash calls and claims of nonexecution cannot be certified from present artifact text. X final and intermediate-3 are byte-identical; both were included. Each final has six findings and fits the soft ceiling: X 818 words, Y 697, counted by whitespace. Neither supplies a full application plan or claims an executed raster fixture.

| Brief obligation | X final | Y final |
|---|---|---|
| Band vs dataset masks | Addressed; executable OR is broader than nodata-only shorthand. Common-mask flag is stated; optional four-band wording needs precision. | Addressed with shared-sidecar qualification; per-band versus OR distinction is correct. |
| Polarity / masked arrays | Addressed; quoted exact-byte identity needs 0/255 qualification, while nonzero intersection remains correct. | Addressed; inverse boolean convention correct, generic exact-byte proposed assertion needs 0/255 qualification. |
| External .msk and nodata | Addressed with recognition/shared-mask condition and independent authority/alignment uncertainty. | Addressed with recognition and shared-mask qualifications; used-sidecar heading helps but existence wording remains broader than implementation. |
| Low-value / 8-bit ambiguity | Addressed; nodata masks cannot recover rounded valid zeros and actual scaling/nodata value are not presumed. | Addressed; no inference that every zero is valid or that these tiles were scaled. |
| Product multiband validity | Addressed; all-three AND only under algorithm requirement; partial-band contribution belongs to product. | Addressed; every required-band AND is explicitly a product rule, with missing-band tolerance unresolved. |
| Fixtures / metadata uncertainty | Addressed; three feasible proposals, actual tile checks left proposed. Intermediate splitting necessity was overcorrected. | Addressed; four feasible proposals, canonical-byte polarity qualification and initial miscount/novelty slips separately assessed. |

## Governing primary facts

All line numbers below are one-based **raw source lines**, not web-rendered offsets. Released executable implementation governs the selected Rasterio release.

| Fact | Primary evidence |
|---|---|
| Band selection yields per-band masks; dataset mask is 2D | R2:742–753, 804–836, 984–986 |
| Direct common-mask path tests band-1 `per_dataset`; otherwise three-band fallback ORs returned band masks | R2:1061–1076 |
| Nonzero GDAL mask bytes are valid; masked-array True is invalid | R1:7–15; R2:659–662; G:24–29 |
| Recognized external masks can be shared or per-band; recognition needs naming/band-count/flag metadata | G:58–70, 102–121 |
| Recognized masks precede nodata for affected bands, without rewriting samples/nodata | R1:111–124; G:78–110; R2:1935–1996 |
| Rounded uint8 zeros can collide with zero nodata; source intent cannot be recovered from values alone | R1:85–92 |
| Quoted exact-byte inversion identity requires 0/255 masks; bool conversion loses valid intensities | R1:203–216; R2:269–283, 659–662, 1988–1996 |
| `write_mask()` uses a shared mask; this does not prohibit a generic N-band external mask | R2:1961–1965; G:65–70, 102–121 |
| No-nodata all-valid case additionally assumes no applicable explicit/alpha mask | G:78–90; R2:1061–1076 |
| Both final reductions operate on the band axis | N-all:2422–2434, 2503–2505; N-reduce:5260–5288 |


The dataset-mask code has no separate nodata test in its OR branch. Thus an independently differing recognized sidecar can override nodata per band and still take the OR branch. Four-band guide shorthand also differs from exact code: the branch tests count==4 and first color red, then reads the **band-4 mask**, without directly testing alpha or shadow nodata. These optional four-band details do not change the stated three-band conclusion.

## Explicit resolution of the prior findings

| Prior finding | Independent resolution | Effect on final/core rule |
|---|---|---|
| X-F1 | Confirmed: documented equality is canonical-byte normalization, not general byte preservation; core nonzero predicate remains correct. | Final quote needs canonical-byte qualification; core predicate sound. |
| X-F2 | Confirmed: split is useful but generic combined fixture was not disproved. N-band external masks are permitted by the normative contract; no runtime witness claimed. | Useful final split retained; intermediate necessity claim unsupported. |
| X-F3 | Confirmed: authorization wording warranted clarification, but predecessor already permitted a separate partial-band policy. | Final categorical attribution is overstated; final product condition sound. |
| X-F4 | Confirmed: actual four-band test is count 4/first red; this does not affect declared three-band input. | Optional branch description lacks exact code condition; no three-band effect. |
| Y-F1 | Confirmed: sidecar recognition and direct per_dataset selection are distinct; some recognized per-band masks take OR. | Final needs direct shared-mask and recognition conditions; core predicate sound. |
| Y-F2 | Confirmed with fixture qualification: canonical 0/255 setup is valid; generic assertion lacks the condition. | Final generic assertion needs canonical-byte condition; canonical proposed setup works. |
| Y-F3 | Confirmed and resolved in final: two-valid-band fixture was mislabeled one-valid in draft; predicate expectations unchanged. | Final removes miscount; expected mixed-case outcome unchanged. |
| Y-F4 | Confirmed: no-nodata fixture and conditional product rule were already present; final retains rather than newly discovers them. | Content preserved; critique novelty credit is not warranted. |
| Y-F5 | Confirmed: four-band guide shorthand differs from code, and final correctly excludes it from three-band conclusion. | Final correctly excludes four-band input; optional name is guide shorthand. |

For X, the precursor already allowed a separate partial-band policy despite saying the brief did not authorize it. Rejecting that precursor as categorical overstates the textual delta. Its generic differing-mask/explicit-valid-zero fixture did not name `write_mask()`: that writer's shared output cannot prove every combined external-mask construction impossible. GDAL's N-band mask contract supports the possibility, subject to actual driver construction that was not executed.

For Y, a fixture with only band 1 nodata has **two** valid bands. The final removes the draft's one-valid-band misdescription without changing the correct OR/AND expectation. The no-nodata fixture and conditional product rule already appeared in its first draft; the critique's expansion/amendment labels do not establish new discoveries. The final retains the material scope.

## Preservation, optional yield and checks

X preserves all six obligations, the conditional intersection, OR contrast, mask polarity, sidecar/metadata uncertainty, low-value ambiguity, source identities and three fixture intentions. Supported added clarity includes recognized shared-mask selection, inability of nodata masks to recover rounded valid zeros, fixed sample/nodata sidecar comparison, and avoidance of unevidenced zero/sieve heuristics. Splitting fixtures is useful presentation but is not proven universally necessary.

Y preserves all six obligations and all four fixture intentions, with no material drop detected. Supported optional content includes mixed and extreme validity cases, both zero-valid and nonzero-invalid sidecar cases, and the no-nodata/no-mask fallback. These were substantially present in the first draft; preservation is not novelty.

| Proposed fixture | Source-level result | Execution status |
|---|---|---|
| X mixed nodata-only bands | OR accepts mixed validity, all-band AND rejects; either mixed arrangement discriminates | Proposed only |
| X common sidecar marks data zero valid | Fixed values/nodata comparison discriminates recognized sidecar precedence | Proposed only |
| X differing nodata masks / masked-array polarity | Feasible separate check; final writer caveat is true | Proposed only |
| Y mixed/all-invalid/all-valid nodata cases | OR/AND expectations correct; extremes agree | Proposed only |
| Y sidecar reverses zero/nonzero validity | Discriminates recognized sidecar from nodata-derived masks | Proposed only |
| Y exact-byte polarity equality | Valid for canonical 0/255 fixtures; not a universal nonzero-byte identity | Proposed only |
| Y no-nodata/no-mask fallback | All-255 expectation supported under both conditions | Proposed only |


I actually read the mapped materials, recomputed every declared hash, fetched five pinned public primary files as text, and checked cited raw ranges and actual implementation conditions. A reviewer-authored pure Python arithmetic witness also passed four assertions: OR and AND differ on six of eight three-band validity patterns; valid bytes 1, 2 and 254 retain boolean validity but reconstruct as 255. This was a logical model, **not** a Rasterio/NumPy/GDAL execution, mask storage round trip or supplied-tile test. No downloaded code was imported/executed, no installer or host credentials were used, and no delegated worker, Goal or candidate modification was performed.

All X/Y historical reading/hash/nonexecution claims remain self-reports. Current matching hashes do not prove past tool activity. The prior review contained an X-specific artifact/extra-hash sentence reused under Y; this repair records Y's own three artifacts and two-source-hash self-report. No candidate feedback or scientific rescue was attempted.

## Blinding, uncertainty and time contract

The explicitly mapped prior structured review was visible, including prior dispositions and conclusions, so this repair is **not blind to prior findings**. Method clues are also visible: X intermediate titles say control, Y critique says treatment, intermediate counts differ, and predecessor/critique language and X inline source-read clocks appear in permitted text. I did not open case cards, private identity maps, parent state, other reviews, or timing/lifecycle files. Existing writable-directory entry names were listed solely to avoid overwriting; their contents were not read or statted for timing.

Actual nodata values, returned mask bytes/flags, sidecar recognition/coverage/alignment/provenance, upstream scaling history, required bands, missing-band contribution and deployed GDAL/NumPy/driver configuration remain unresolved. The brief supports conditional policy and proposed discriminators, not production validation. Source contracts permit the sidecar counterexample; no driver-runtime construction is claimed.

The original contract was **20 minutes**. Root's prior generic 15-minute statement was a mistake and does not retroactively change it. The user reports that original review exceeded its original envelope and was intentionally interrupted. This one authorized prospective repair has a separate **20-minute allowance including checks, writing and delivery, from actual dispatch, without reset**. First reviewer clock observation was 2026-10-07 19:40:15 UTC. Actual dispatch time was not supplied in the permitted message; dispatch/lifecycle files were not opened, so exact dispatch-based compliance is not independently certified. Completion time and observed elapsed duration are recorded in JSON at integrity closeout. Token usage and cost are null because unknown.

## Source identities and reviewed hashes

| ID | Pinned primary source | SHA-256 |
|---|---|---|
| R1 | [Rasterio 1.3.10](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst) | `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9` |
| R2 | [Rasterio 1.3.10](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx) | `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190` |
| G | [GDAL v3.8.5 adopted RFC 15](https://raw.githubusercontent.com/OSGeo/gdal/v3.8.5/doc/source/development/rfc/rfc15_nodatabitmask.rst) | `4c326c13b339f243d78eabaf8d2bca12e10f07b28947a669e3984c98f7d042f4` |
| N-all | [NumPy v1.26.4](https://raw.githubusercontent.com/numpy/numpy/v1.26.4/numpy/core/fromnumeric.py) | `60cb71381839d5531e9b7f401d716cfb8fef39bd69e3c7a2ee78d77584d127f4` |
| N-reduce | [NumPy v1.26.4](https://raw.githubusercontent.com/numpy/numpy/v1.26.4/numpy/core/_add_newdocs.py) | `dfd24569e0cf376390952c1fa58ebf26af5f3b9bcc2fc64c17c278653c7f9ebb` |

All captures are dated 2026-10-07 UTC. Both frozen Rasterio captures matched fresh HTTP retrieval bytes. Extra GDAL/NumPy sources are pinned corroboration; those deployed versions were not supplied. Complete retrieval timestamps, raw ranges, paths and limitations are in REVIEW.json.

| Reviewed artifact | SHA-256 |
|---|---|
| X/final.md | `9c2765752bcb98f35a5e2c9ddca531ced5a064f4e97f7495dc196427aeb6e1a0` |
| X/intermediate-1.md | `76be70f9fdbbc84b6f86f85768a3d4c7c86ba5afba4b3835b309423718020c50` |
| X/intermediate-2.md | `0294f5851537ea90d5a6bfe5ee425c6773bd11cec5acc2ec3f3de2bf578b0629` |
| X/intermediate-3.md | `9c2765752bcb98f35a5e2c9ddca531ced5a064f4e97f7495dc196427aeb6e1a0` |
| Y/final.md | `b3e9dd4b36bd3b6cfa918db0813599bb17c165e08aa7ee685ece5b22eb567729` |
| Y/intermediate-1.md | `9aec1bfc002af2283c726309d6fd2b065ef4f395cb4a753ac21fac12565582d8` |
| Y/intermediate-2.md | `88f8c2974ecea2c687f836b4d57d7021d72ca00335b75a797be0dbcaf13eb442` |

Brief SHA-256: `74eb0f398c720e2351ebd1b7b3ba7a1d8c33606b289d2037ca9e35d87d60b33c`. Source manifest SHA-256: `16e0fee3899c9be5758075670a89e7e457bbd8f4a910ae9f6b0366d355a26ea5`. Exact reviewed file paths, all 58 claim/condition dispositions and complete source references are recorded in REVIEW.json. The original review and all frozen originals remain unchanged.
