# Final proposal — CPython 3.13.9 offline note search key

**Disposition:** Complete component proposal for review and implementation. The product specification is ready; this arm did not build the note browser or run a CPython 3.13.9 UI or persistence test.

## Decision

Keep each note’s original text as the sole display and editing source. Offer a clearly named **Compatibility caseless** mode whose key is exactly:

`K(s) = unicodedata.normalize("NFKC", s).casefold()`

Use that same operation on both the whole note and the query. Treat it as this product’s versioned pipeline; do not describe it as locale-aware collation, accent removal, visual-confusable detection, or a general Unicode equivalence relation. Python documents NFKC as compatibility decomposition followed by canonical composition, and describes `str.casefold()` as an aggressive, default caseless-matching operation [S1, S2].

The initial draft’s byte-size argument is false. NFKC can expand compatibility characters and casefold can expand a character. A quarter fraction (U+00BC) becomes `1⁄4`: 2 UTF-8 bytes become 5. On the installed CPython 3.14.4 / Unicode 16.0.0 runtime, 820 quarter fractions produce a 4,100-byte key from 1,640 source bytes. A single `ß` remains 2 UTF-8 bytes but becomes two code points, and `ΐ` grows from 2 to 6 UTF-8 bytes under casefold. The executable witness and its limits are recorded in `witnesses/`. The installed runtime is not the requested CPython 3.13.9 target, so this is a counterexample witness, not target-runtime certification.

## Modes and promises

| Mode | Transform of note and query | Promise and trade-off |
|---|---|---|
| Literal | None | Exact, case-sensitive substring search over original text. Preserves distinctions but does not equate different code-point sequences. |
| Canonical normalized | NFC, then exact substring search | Equates canonical representations while preserving compatibility distinctions. Does not remove case distinctions. |
| Compatibility normalized | NFKC, then exact substring search | Also merges compatibility forms. It can erase distinctions important in mathematics or other contexts, so retain Literal and keep originals. Unicode explicitly cautions against blindly applying NFKC to arbitrary text [UAX15, §1.1–1.2]. |
| Caseless | `casefold()` | Uses default Unicode case folding and may expand characters, for example `ß → ss`. It is not locale-specific search [S2, S3]. |
| **Compatibility caseless (selected)** | **NFKC, then `casefold()`** | More recall across compatibility and case distinctions, with corresponding false-equivalence and indexing/highlighting costs. Apply exactly this pipeline to both sides. |

The selected mode intentionally does not promise accent-insensitive matching, language-specific collation, tokenization, stemming, transliteration, or equality of visually confusable text. Do not change behavior based on the machine locale. For example, mixed Latin/Cyrillic lookalikes may remain distinct; Unicode’s confusable-detection mechanism is a separate, security-oriented transform and is not a search-key or display normalization [UTS39, §4].

A query such as `s` can match inside the key `ss` derived from a single original `ß`. That is a consequence of substring search over the transformed key; it must be covered in product examples and in the highlight policy below.

## Input domain and stored representation

- The source of truth is the complete original note text. Index creation, failed transforms, migrations, and search never replace, truncate, or silently discard it.
- The indexed transform accepts Python strings composed of Unicode scalar values and measured with strict UTF-8 encoding. A lone surrogate or encoding error is an explicit input/index error; do not silently use `ignore`, `replace`, or a lossy repair. CPython’s documented `str.encode` default is UTF-8 with strict errors [S2].
- Persist a nullable derived key plus metadata: an algorithm identifier (for example, `pm.nfkc-then-casefold.v1`), the Unicode database version, the producing CPython build/version, and an explicit index state. Keep the original separately and unchanged.
- The cap applies to the fully transformed, strictly UTF-8-encoded **stored key**: `len(key.encode("utf-8", "strict")) <= 4096`. It does not apply to code-point count, grapheme count, UTF-16 units, or the original-note byte count.
- Compute the complete key first, then measure it. Do not infer key size from the original. An original longer than 4096 bytes may still have a storable key; an original shorter than 4096 bytes may produce an over-limit key.
- If the complete key is over 4096 bytes, do not persist a partial key. Keep the note and set an explicit state such as `transformed_key_overflow`. Compatibility-mode search must include these notes through a per-note transient derivation from the original. If a runtime resource failure prevents that fallback, return an explicitly partial result and identify the unsearched notes; never report a clean no-match.
- Literal search continues to use the original independently of key status. Do not make an over-limit compatibility key silently become literal-only.

## Versioning and migration

The target in the brief is CPython 3.13.9. The supplied pinned CPython source is commit `8183fa5e3f78ca6ab862de7fb8b14f3d929421e0`; its Unicode documentation exposes `unicodedata.unidata_version` and points to Unicode 15.1.0 material [S1, S2]. At build or startup, verify the implementation, exact runtime version, and Unicode database version expected by this index generation. If they differ, do not silently combine old keys and new queries.

On an algorithm or Unicode-data version change, rederive keys from originals into a new index generation, validate counts and overflow states, then switch generations atomically. Keep the previous generation until the new one is complete. Normalization has stability guarantees for assigned characters, but unassigned characters may behave differently when assigned in a later Unicode release; explicit version metadata and a deliberate rebuild remain appropriate [UAX15, §3].

## Match spans and display

Never use a transformed-key offset directly as an original-text offset. Casefold expansion already disproves that shortcut; normalization can also decompose, compose, expand, and reorder sequences [S1, S3, S5]. “Nearest original character” is not a safe mapping rule.

- In Literal mode, map the exact source match through the UI’s explicit code-point-to-renderer-offset conversion. Ensure the displayed selection does not split a grapheme cluster.
- In transformed modes, show a result without a span highlight unless a normalization-aware provenance map can map the whole key match to a contiguous original interval. The map must account for decomposition, reordering, composition, and casefold expansion. Expand a valid interval to the chosen grapheme boundaries. If mapping is ambiguous or non-contiguous, suppress the span.
- A partial hit inside an expansion such as one `s` of `ß → ss` maps to the whole original character, never to an invented half-character. UAX #29 defines default extended grapheme boundaries as a closer UI unit than individual code points, while noting that display placement ultimately depends on the text framework and font [UAX29, §2–3].
- Do not ship transformed-mode span highlighting until these rules have implementation tests. A row-level match indicator is the safe initial fallback.

## Validation and release gates

The inspected CPython tests demonstrate representative casefold behavior and provide a normalization-conformance harness; the normalization test checks that its data-file header matches the running Unicode database [S3, S4]. This arm inspected those sources but did not run the target CPython suite, the Unicode conformance data, or application tests.

Before release:

1. Run under the exact CPython 3.13.9 build and confirm `unicodedata.unidata_version == "15.1.0"`; record the actual runtime and build.
2. Run CPython’s pinned normalization and string tests. Run the Unicode 15.1.0 `NormalizationTest.txt` oracle for NFC/NFKC, and the Unicode 15.1.0 case-fold mappings (including full mappings) against the selected implementation. Treat the normalization conformance suite as its own oracle, not as proof of product search semantics [UAX15, §4 C3].
3. Add product tests for ASCII; composed/decomposed marks; compatibility forms such as U+00BC and U+2460; full-fold expansions such as `ß`; Greek and non-Latin text; empty input; exact 4096-byte keys; 4097-byte keys; original text above and below 4096; strict-encoding failure; query matches inside expansions; and version-migration rebuilds.
4. Assert for every test that the original remains byte-for-byte unchanged. Assert that overflow never stores a truncated key, produces the explicit state, and remains covered by the compatibility fallback or a visible partial-search report.
5. Test highlighting with expansion, canonical reordering, composition, combining sequences, and extended grapheme clusters. Require exact source intervals or no span.
6. Test literal, NFC, NFKC, casefold, and combined mode pairs independently. Document which distinctions each mode intentionally collapses. Do not infer general correctness from the examples in the witness.

The bounded witness run in this arm falsifies the draft’s universal byte-nonexpansion and direct-offset claims. It does not establish a global size bound, all-sequence behavior, UI safety, migration correctness, or CPython 3.13.9 execution. Its runtime, code, raw stdout/stderr, and interpretation are preserved in `witnesses/execution.json`.

## Draft history retained and corrected

Retained: preserve original text; expose an explicit compatibility-caseless mode; use NFKC followed by casefold; version the key and deliberately rebuild; preserve literal search; reject using keys for identity or authorization; compare a less aggressive NFC-based alternative; and avoid universal claims from a few examples.

Corrected: measure the completed key instead of assuming transformation shrinks it; use the actual 4096-byte stored-key threshold rather than an original-size proxy; search over-limit notes through a visible transient fallback; prohibit direct key-to-source offsets and “nearest character” guesses; and require the actual pinned runtime plus conformance and UI tests before release.

## Execution and route record

- Requested route: Luna Max Standard.
- Runtime context exposed to this thread: `gpt-6-luna`, max reasoning effort. The native Goal response exposes its objective, thread ID, and active status, but not a provider/tier receipt; actual service tier is **unknown**.
- The one native Goal was created and its raw response saved as `native-goal-create.json`. This final artifact is written before the required terminal update.

## Primary sources

- [S1 — pinned CPython unicodedata documentation](https://raw.githubusercontent.com/python/cpython/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/unicodedata.rst), especially `normalize` and `unidata_version`.
- [S2 — pinned CPython str documentation](https://raw.githubusercontent.com/python/cpython/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/stdtypes.rst), especially `casefold` and `encode`.
- [S3 — pinned CPython casefold tests](https://raw.githubusercontent.com/python/cpython/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_str.py).
- [S4 — pinned CPython normalization tests](https://raw.githubusercontent.com/python/cpython/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/test/test_unicodedata.py).
- [S5 — pinned CPython Unicode casefold implementation](https://raw.githubusercontent.com/python/cpython/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Objects/unicodeobject.c).
- [UAX15 — Unicode Normalization Forms, Unicode 15.1.0](https://www.unicode.org/reports/tr15/tr15-54.html).
- [UAX29 — Unicode Text Segmentation, Unicode 15.1.0](https://www.unicode.org/reports/tr29/tr29-43.html).
- [UTS39 — Unicode Security Mechanisms, Unicode 15.1.0](https://www.unicode.org/reports/tr39/tr39-28.html).

See `source-map.json` for claim-level locators, copied-source hashes, governing scope, and unresolved uncertainties.
