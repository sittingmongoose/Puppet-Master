# D-M06-A candidate-v3 — report.md (method evidence and reconciliation)

Reviewer arm: treatment/candidate-v3. Arm T0 2026-10-08T01:01:03.369784Z; this report written 01:27Z, inside the arm window. Companion files: `final.md` (bounded recommendation), `sources.json`, `timings.json`, `working-checklist.md` (ingest binding).

## 1. Executed-witness binding (obligation 6)

The only executed science this arm is the candidate-authored witness run through the case's qualified helper:

| artifact | path (under `candidate-v3/`) | SHA-256 |
|---|---|---|
| binding receipt | `witness-receipt.json` | `656b216824820a4ecadeb8c0bc48f130393be69dfff7d6bd2b27159562572ebb` |
| witness code | `witness.py` | `37abc543435b605d7a537da2a40ac44a9d5d3d095499a7c70858ee2d5017d5b1` |
| witness input | `witness-input.json` | `d0081e96b98ea02357af5c8f248d384bc23c3153b9423489a427633b3dd869ce` |

Invocation: `python3 -B helpers/mechanical/sandbox.py --code <witness.py> --input <witness-input.json> --wall-seconds 5 --receipt <witness-receipt.json>`; sandbox exit 0; receipt records `isolation: namespace_and_seccomp_enforced` (bwrap namespaces + seccomp, single process, no network, read-only filesystem), `process_exit: 0`, no output truncation, started 01:25:34.193165Z, ended 01:25:34.347794Z (0.155 s wall). The receipt also binds `input_sha256` and `code_sha256`, which match the files on disk. Pre-final iteration receipts are retained: `witness-receipt-run1-iteration.json`, `-run2-`, `-run3-` (history in §6). **Applicability: these results attest only to witness.py `37abc543…` running on witness-input.json `d0081e96…` inside this harness.** They are not claims about other implementations, releases, or inputs. The sandbox certifies process isolation only; it never certifies oracle truth — truth here comes solely from the frozen RFC 8785 bytes quoted in §2.

## 2. Independent oracles and why each is trusted

No check rests on the witness's own formula or a mutual roundtrip; every expected value has an independent source:

1. **Appendix B Table 1 (26 rows)** — IEEE 754 bit patterns → exact JSON tokens, published inside the frozen RFC bytes (`jcs.txt` SHA-256 `63d52294eb0e3f0014174288186d388b4ddbf2c67d1ce8af1d9726eb0c3ab240`, verified against INPUT_MAP at ingest). Includes the NaN/Infinity rows whose only correct outcome is an error. Trusted because it is the RFC's own number-serialization ground truth, independent of any implementation of it.
2. **§3.2.3 built-in sort data** — the RFC publishes both the seven-name input and the expected argument order after sorting (`\r`, `1`, U+0080, U+00F6, U+20AC, U+1F600, U+FB33). Trusted for the same reason; it is the spec's own discriminating test.
3. **§3.2.4 canonical hex bytes** — for the §3.2.2 combined sample (fixture f03) the RFC publishes the exact UTF-8 output bytes (`7b 22 6c 69 … 2f 22 7d`). This is a byte-level end-to-end oracle covering ordering, number tokens, string escaping, whitespace suppression, and UTF-8 generation simultaneously.
4. **Self-derived ECMA-262 §7.1.12.1 (+ Note 2) digit search** — the witness's number serializer finds the shortest decimal `s·10^(n−k)` that round-trips to the double, choosing minimal k, then minimal |s·10^(n−k) − x| with ties to even s, computed exactly with Fractions. This is a derivation from the rule the RFC cites, not a borrowed formatter; its correctness is then bounded by oracle 1 (26/26 rows). During iteration it exposed a real subtlety: `n` is not pinned to `⌊log10 x⌋+1`; the decade-shifted placement (`1.0000000000000001e+23` neighbors) can reach a shorter k, which is why Appendix B row `44b52d02c7e14af6` must emit `1e+23` and not `9.999999999999999e+22`.
5. **Metamorphic properties** — required by the spec itself, needing no expected bytes: member-order invariance (f01 vs a reordered variant; f02 pretty vs compact must yield identical bytes), same-double spelling identity (f12's four spellings → one token), and NFC/NFD divergence (f09 vs f10 must stay different — §3.1 Note requires preservation "as is").
6. **Domain-rejection expectations** — §3.1 (I-JSON: no duplicate names; Unicode strings; binary64 numbers) and the §3.2.2.2/§3.2.2.3 error Notes imply that duplicate names (literal or escape-resolved), lone surrogates, NaN/±Infinity, and overflow beyond binary64 must terminate with an error. "Expected error" is derived from the frozen text, not from the witness.

## 3. Control discrimination evidence (obligation 5)

Six plausible wrong implementations were run against targeted subsets of the same battery; every one failed, so the battery does discriminate:

| control | mutation | checks failed | why plausible |
|---|---|---|---|
| W1 codepoint_sort | sort by code point instead of UTF-16 units | C01, C02 | Python `sorted()`, UTF-8-byte order; reverses U+1F600/U+FB33 (f05) |
| W2 escapedtext_sort | sort on escaped name text | C01 | misplaces `\r` vs `"1"` (f04) |
| W3 nfc_normalize | NFC-normalize strings/names | C04 | f09/f10 collide; common "helpful" normalization |
| W4 repr_numbers | Python-repr number formatting | C08 | `1e-06` vs Table's `0.000001`; exponent-format differences |
| W5 lastwins_duplicates | last-wins duplicate policy | C09 | standard JSON-parser behavior (f07/f08 pass through) |
| W6 ascii_escape | `\uXXXX`-escape non-ASCII | C03 | ensure-ASCII style; breaks the §3.2.4 byte oracle (€ raw) |

Receipt summary: `checks_passed 15/15`, `controls_discriminated 6/6`. Correct-implementation success and wrong-control failure are recorded separately; process success alone is not treated as witness validity.

## 4. Per-obligation reconciled results

1. **Input domain + duplicate policy (f07, f08, f11, f16–f18).** Supported: domain is I-JSON — duplicates rejected after `\u`-escape resolution, lone surrogates rejected, non-finite and beyond-binary64 magnitudes rejected. The 2^53+1 literal is a genuine two-binding case recorded in C12: parsed ECMAScript-style (`JSON.parse` semantics) it becomes 2^53 → `9007199254740992`; under a strict "integer exactly representable" reading it is out of domain → error. The frozen bytes do not adjudicate between these parser bindings (draft U2); both outcomes are in the receipt.
2. **Property ordering incl. non-BMP (f01–f06, C01/C02/C13/C15).** Supported: raw-name UTF-16 code-unit ascending sort, recursive, arrays scanned but element order kept. The RFC's own f04 order is reproduced exactly; the f05 minimal pair shows U+1F600 preceding U+FB33, which code-point or UTF-8-byte ordering reverses. The witness iteration also demonstrated array-order sensitivity is caught (a meta-variant that wrongly reversed an array failed, confirming the battery tests element order).
3. **Number serialization + prohibited values (f12–f17, C05–C08, C11, C14).** Supported: ECMA-262 §7.1.12.1 + Note 2 semantics — shortest round-trip digits, `-0`→`0`, exponent form ≥1e21 and <1e-6, `1424953923781206.25`→`1424953923781206.2` (round to even, Table note 4), all 26 Table 1 rows exact, NaN/±Inf and overflow (`1e309`, `1.4e9999`) must error.
4. **Unicode preservation ≠ normalization (f03, f09–f11, C03/C04/C10).** Supported: NFC and NFD spellings produce different canonical outputs, both preserved code-point-for-code-point; non-ASCII is emitted raw; only U+0000–U+001F, `"` and `\` are escaped, with `\b \t \n \f \r` for the five named controls and lowercase `\uhhhh` otherwise; lone surrogates error.
5. **Controls (C-list + W-table above).** The battery separates correct, plausible-wrong, and merely-process-successful outcomes; six wrong designs each fail on the fixture designed for them.
6. **Witness binding.** Section 1 records identity (SHA-256 of code/input/receipt), harness, times, and the limitation that results attest only to this build on these inputs.

Draft-claim adjudication feeding final.md: C1 (order invariance) supported; C2 (non-BMP UTF-16 ordering) supported; C3 (number identity) supported; C4 (prohibited numbers error) supported; C5 (preservation, escaping rules) supported; C6 (invalid Unicode errors) supported; C7 (escape-resolved duplicates rejected) supported; C8 (no whitespace, array order kept, UTF-8 out) supported — C1–C8 hold **as bounded by §5**, with C4's "values with no binary64 double" side conditional on the parser-binding choice (finding for obligation 1).

## 5. Applicability limits

- Results bind only witness `37abc543…` on input `d0081e96…` (§1); they generalize to the *specification*, not to other implementations, only insofar as the RFC-published oracles (§2.1–2.3) are specification text — those parts are release-independent; the self-derived number search (§2.4) is validated only on the 26 Table 1 rows plus fixture numbers.
- ECMA-262 §7.1.12.1 was accessed only as cited within the frozen RFC bytes; the ECMA text itself and the RFC development-portal test corpus were not fetched (out of allowed scope this arm). Number claims beyond Table 1 + fixtures are extrapolation.
- The 2^53+1 / big-integer parser-binding ambiguity is left open deliberately; neither binding was declared authoritative.
- The witness ran in an offline seccomp/bwrap sandbox; it exercised no environment beyond stdlib parsing/formatting. Sandbox isolation says nothing about source correctness.
- Iteration receipts show the final run is run 4 of 4; the first three failed on witness-authoring defects (reversed array inside a metamorphic variant; a wrong byte-suffix assertion; a vacuous strict-int probe; a float-overflow guard in the digit search) before reaching the recorded result — none of the failures were silent.

## 6. Iteration substeps (times UTC)

1. 01:10–01:20 authored witness + input; run 1 (receipt `-run1-`): 11/15 checks, 6/6 controls — three authoring bugs identified.
2. 01:22 run 2 (`-run2-`): 13/15 — C04/C13/C12 fixed; Appendix B crashed on `10.0**309` overflow → exact Fraction bound added.
3. 01:22 run 3 (`-run3-`): 14/15 — genuine mismatch on row `44b52d02c7e14af6`; digit search extended to the decade-shifted exponent placement (§2.4).
4. 01:25 run 4 (`witness-receipt.json`, binding): 15/15 checks, 6/6 controls, exit 0.
