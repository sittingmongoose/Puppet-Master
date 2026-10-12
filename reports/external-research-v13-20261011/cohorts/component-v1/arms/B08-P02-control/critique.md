# Independent critique — B08-P02 control

## Scope and method

I reviewed only the permitted copied brief, plan, draft, source index, and copied CPython source neighborhoods enumerated by this arm’s `input-map.json`. I used the permitted source reader for the listed CPython source ranges and independent primary-source lookups for Unicode 15.1.0 UAX #15, UAX #29, and UTS #39. I did not read excluded rubric/findings/metadata files, preparer material, sibling-arm files, or run an evaluator. The source-input hashes are frozen in `input-map.json`; `verify-runtime.py verify` passed before source review.

The pinned CPython source documented and tested in the copied inputs is commit `8183fa5e3f78ca6ab862de7fb8b14f3d929421e0`. The brief’s target is CPython 3.13.9. The actual shell runtime available here was CPython 3.14.4 with Unicode 16.0.0. I did not substitute that runtime as target certification.

## Assessment

The draft has a useful, coherent product direction: original text remains authoritative; an explicit compatibility-caseless mode is separate from literal search; transformations are versioned; compatibility distinctions are not silently made canonical; and the author does not claim that sample tests prove universal correctness. Those are retained.

As written, the proposal is not safe to implement because its capacity argument assumes a monotonic UTF-8 byte length that Unicode transformations do not guarantee. NFKC can expand compatibility characters; casefold can expand one character into several code points and sometimes into more UTF-8 bytes. The claimed shortcut from a 4096-byte original limit to a safe stored key is therefore invalid. The later statement that sharp-s does not alter UTF-8 byte length is true for that sample only and does not support the general rule.

The proposed highlight calculation is also invalid. A key index is not an original index after expansion, composition, or reordering. “Highlight the nearest original character” does not define a stable span and can split a user-perceived grapheme. A provenance mapping or an explicit no-highlight fallback is required.

The proposed “literal-only” overflow fallback is insufficient for a mode advertised as compatibility-caseless if the product expects all original notes to participate in that mode. The cap governs stored derived keys, not originals. Measure after transformation, preserve all originals, and keep overflow notes in compatibility search through transient derivation; if a resource failure prevents scanning, expose a partial result.

## Material findings

1. **False general byte bound (release blocker).** The Unicode 15.1 UAX shows compatibility mappings for fractions and warns that NFKC erases distinctions which may matter. The local witness records U+00BC as 2 source UTF-8 bytes and 5 transformed bytes. Its 820-item run exceeds the 4096-byte key cap while the source is only 1640 bytes. CPython documents casefold expansion (ß → ss), and its implementation writes full-fold mappings of up to three code points. Evidence: [UAX15 §§1.1–1.2], [S2 lines 1699–1714], [S5 lines 9715–9728], and `witnesses/execution.json`.

2. **Original-size proxy fails (release blocker).** A source-text threshold does not enforce a derived-key threshold. A short source may produce a key larger than its source, while a long source may produce a smaller key. A complete transformed key must be measured in strict UTF-8 after the full pipeline. Evidence: the UAX15 compatibility examples and the exact 1,640-byte-to-4,100-byte witness; user’s explicit 4096-byte stored-key limit.

3. **Highlight span shortcut is unsafe (release blocker for transformed-mode highlights).** CPython’s own tests show a one-code-point source becoming two code points; the implementation performs full casefold mappings; NFKC changes representation; Unicode grapheme boundaries are not code-point boundaries. The draft’s “nearest character” rule is ambiguous. Evidence: [S3 lines 914–921], [S5 lines 9715–9728], [UAX29 §§2–3], and the sharp-s witness. Require provenance tracking and grapheme-safe expansion or suppress spans.

4. **Overflow policy loses the selected search semantics.** The source length should not decide whether a key is storable. For an over-limit key, keep the original and omit the persistent key without truncation. The proposed corrected behavior performs transient derivation for overflow notes and reports partial search if it cannot complete. Evidence: brief’s no-drop/no-truncate and 4096-byte stored-key requirements, plus the witness.

5. **The pipeline’s scope must be named precisely.** CPython documents the two operations separately: NFKC normalization and default casefold. The product can use the ordered composition, but should version and describe it as an application pipeline, not imply locale collation, accent removal, or visual-confusable matching. Unicode’s confusable skeleton procedure is a separate mechanism. Evidence: [S1 lines 157–187], [S2 lines 1699–1714], [UTS39 §4].

6. **Versioning is directionally correct but needs an executable gate.** The supplied docs expose the Unicode database version; the CPython casefold docs reference Unicode 15.1.0. Persist both transform ID and data/runtime version. Rebuild from originals and avoid mixed-version query/index behavior. The local witness was not run on CPython 3.13.9, so its exact results must not be presented as target execution. Evidence: [S1 lines 198–209], [S2 lines 1699–1714], [UAX15 §3], and the recorded runtime.

7. **The tests are a plan, not evidence of a passing implementation.** The upstream test sources contain useful examples and a normalization-test harness, but this arm did not run the target suite, the UCD test data, or UI tests. The bounded witness falsifies two universal draft claims; it does not prove product correctness. Evidence: [S3 lines 914–921], [S4 lines 372–459], [UAX15 §4 C3], and `witnesses/execution.json`.

8. **Confusable expectations are correctly excluded, but make the boundary explicit.** The draft already rejects visual-confusable claims. Keep that as a promise boundary; Unicode UTS #39 defines a separate confusability test, with its own data and scope. The local Latin/Cyrillic example remains distinct under the selected key. Evidence: [UTS39 §4, lines 338–350 and 402–405] and the witness.

## Independent decision

Finalize with the same proposed NFKC-then-casefold pipeline, but change size accounting, overflow handling, and highlighting as detailed in `final.md`. Preserve the original note in every path. Treat exact CPython 3.13.9 conformance and application tests as release gates, not as completed work in this control arm. Every material finding and its decision is recorded in `criticism-dispositions.md`.
