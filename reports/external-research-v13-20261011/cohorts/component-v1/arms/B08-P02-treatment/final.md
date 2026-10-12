# B08-P02 treatment — final search-key proposal

## Decision

Keep the original note text as the only editable and display representation. Offer separate literal and compatibility-caseless substring search modes. Define the latter as the project’s exact, versioned one-pass pipeline:

```python
def compatibility_key(text):
    return unicodedata.normalize("NFKC", text).casefold()
```

For the target CPython 3.13.9 build, record the algorithm identifier (for example, `nfkc-casefold-v1`), CPython version, and `unicodedata.unidata_version` with the index. The pinned CPython documentation identifies its Unicode Character Database as 15.1.0 [S1]. Use the same active pipeline and version for note keys and queries. A future algorithm or Unicode-data change is a deliberate index migration: keep originals, build the replacement index, then switch it as one migration. Do not mix keys from different versions.

This is a product-defined compatibility-caseless key. The proposal does not promise locale-specific collation, accent-insensitive search, Unicode’s separately named `NFKC_Casefold` operation, or detection of visual confusables. NFKC intentionally collapses some compatibility distinctions; users can switch to literal search when those distinctions matter. Casefold is the default, locale-independent CPython operation described for caseless matching [S2].

## Representations and search modes

| Mode | Search value | Promise |
|---|---|---|
| Literal | Original text and query as decoded Unicode strings | Direct, case-sensitive substring matching; no normalization or case folding. The sequence must match. |
| Compatibility-caseless | `K(text)` and `K(query)` using the exact pipeline above | Compatibility normalization plus default caseless matching, using substring matching over the derived strings. It may merge distinctions that literal mode preserves. |

Examples from the pinned upstream material and the bounded witness include `ABC → abc`, `ß → ss`, and fullwidth capital A `Ａ → a` [S2, S3, witness]. These examples illustrate selected mappings; they do not establish that every spelling or visually similar string will compare equal. Cross-script lookalikes and other confusables are outside the contract. Do not use a search key for authorization, identity, or uniqueness.

Store the full original note unchanged, independently of its derived key. Never reconstruct a note from a key and never truncate or discard the original to satisfy index limits. This proposal sets no original-text byte limit. Literal search can continue to use the original text even when a compatibility key is not indexed.

## The 4096-byte stored-key rule

The 4096-byte limit applies to the UTF-8 payload of the derived key that will be stored, not to the original note and not to Python’s code-point count. For valid Unicode text, generate the key, encode it as strict UTF-8, and check the resulting payload before committing it:

```python
key = compatibility_key(original)
key_bytes = key.encode("utf-8", errors="strict")
if len(key_bytes) <= 4096:
    persist_key(key_bytes)
else:
    keep_original_and_mark_compatibility_key_too_large()
```

Do this for every key. Do not infer a key’s size from the original’s byte length. The draft’s claim that NFKC and casefold never increase UTF-8 size is false: the pinned Unicode 15.1 compatibility mapping for U+FDFA expands one 3-byte character into 18 code points [S6]; the observed Python witness produces a 33-byte key for that character. Repeating it 1,365 times yields a 4,095-byte original and a 45,045-byte key. That is a concrete counterexample to the draft’s acceptance rule. The witness ran on CPython 3.14.4 with Unicode 16.0.0, not the target interpreter; the 15.1-era public mapping and CPython’s pinned database version support the counterexample’s relevance, but the exact pinned binary still needs a CI run [S1, S6, witness].

When a transformed key exceeds the cap, persist no partial or truncated key. Keep the note intact, mark it visibly as `key_too_large`, and disclose that compatibility search may omit it; literal search remains available. Expose an index-status count or equivalent so the mode cannot silently appear complete. If complete compatibility search across these notes is required, a separately designed on-demand scan can transform originals without persisting oversized keys; its memory, latency, cancellation, and failure behavior need explicit limits before it is promised. Any query resource limit is a separate product rule and must reject visibly rather than truncate.

The 4096-byte value is a product cap on key payload bytes, not a Unicode or Python string limit and not a cap on database row overhead.

## Highlighting and offsets

Never apply a match’s offsets in the transformed key directly to the original string. Python string indexes count code points; UTF-8 storage counts bytes; renderers may count UTF-16 code units; and displayed grapheme clusters can span multiple code points. Normalization and casefolding can expand, shrink, compose, or reorder text.

The witness demonstrates two direct failures. In `AßB → assb`, a key match for `ss` at code-point span `[1,3)` maps to source `ß`, but slicing the original at those same indexes returns `ßB`. In `e + COMBINING ACUTE → é`, key span `[0,1)` sliced from the original returns only `e`, omitting the combining mark. The CPython casefold example `ß → ss` is also present in the pinned docs and tests [S2, S3].

For the first release, compatibility-mode results should identify the matching note without rendering a substring highlight, or highlight the whole note/card. Do not use a “nearest original character” guess. If inline compatibility highlights are required, implement and validate a transformation-aware source-span map, then expand spans to safe display boundaries. Test expansions, composition, combining-mark reordering, partial matches inside expansions, repeated matches, and the actual renderer’s offset unit. Literal-mode highlights can use source offsets only after converting to the renderer’s indexing unit.

## Alternatives and boundaries

- Literal search is the most predictable mode and preserves all distinctions, but does not find case or compatibility equivalents.
- NFC plus casefold would preserve more compatibility distinctions than NFKC plus casefold; it is a valid narrower alternative with a different algorithm identifier and index.
- The chosen NFKC-plus-casefold mode provides broader compatibility matching, at the cost of merging some distinctions and requiring reindexing when its governing data changes.
- A locale-aware search engine is a future option if users need language-tailored collation. It brings its own locale data, versioning, tokenization, storage, and migration choices.
- NFKC and casefold are not visual-confusable detection. Similar-looking strings may remain distinct; some compatibility forms may collapse even when a user wants to distinguish them. Keep literal mode readily accessible.

## Execution route observation

The requested route was Luna Max Standard. The raw native Goal create and completion receipts expose the Goal objective, status, and usage fields, but no provider, model, service tier, or route options. Actual returned identity and observed route options therefore remain unknown; no substitution is claimed.

## Validation status and release gates

The mapped CPython 3.13.9 documentation and implementation, plus upstream casefold and normalization test source, were inspected [S1–S5]. The upstream test source describes casefold examples and a normalization loop driven by Unicode test data; this review did not run those upstream tests or the full Unicode normalization conformance data [S3, S4]. No note UI, persistent index, migration, or renderer test ran.

The bounded executable witness is saved under `witnesses/`. It records its exact code, command, Python/Unicode versions, stdout, stderr, result, and limits. It checks representative ASCII, empty, compatibility, casefold, non-Latin expansion, and offset cases. It is a counterexample witness, not an exhaustive Unicode proof. The available runtime was CPython 3.14.4 / Unicode 16.0.0. A check for `python3.13` returned “command not found”; the requested CPython 3.13.9 runtime was therefore not executed.

Before release:

1. Run the size and offset witness under the pinned CPython 3.13.9 / Unicode 15.1.0 build.
2. Test stored-key payloads at 4,096 and above 4,096 bytes, including repeated U+FDFA; verify no truncation and byte-for-byte original preservation on the over-cap path.
3. Verify notes and queries use the same algorithm and active version. Test index rebuild, atomic version switch, restart, and rollback with originals unchanged.
4. Cover empty input, ASCII, combining sequences, compatibility forms, multi-code-point casefold mappings, Greek sigma, dotted/dotless I, and non-Latin scripts. Test literal mode separately for distinctions the compatibility mode merges.
5. Verify the surfaced count/status for unindexed compatibility keys and document whether an on-demand scan is in scope.
6. Keep compatibility-mode substring highlights disabled until source-span mapping passes renderer-level tests, including grapheme-safe rendering.
7. Run the pinned upstream casefold tests and the Unicode 15.1 normalization conformance data. Treat examples as regression cases, not evidence of universal behavior.

**Status:** the corrected design is complete for review. The false size-bound and offset claims are rejected, originals remain authoritative, the key limit has a post-transform enforcement rule, and remaining runtime/UI/index validation is explicitly pending.
