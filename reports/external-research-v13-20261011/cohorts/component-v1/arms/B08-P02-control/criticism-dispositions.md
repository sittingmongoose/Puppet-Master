# Criticism dispositions — B08-P02 control

Each disposition is a decision on a material criticism or draft proposition. Evidence points to primary sources by the IDs and exact locators defined in `source-map.json`. The local witness is evidence only for the recorded CPython 3.14.4 / Unicode 16.0.0 run.

## D01 — Keep original text as the source of truth

**Decision: KEEP.**  
**Criticism:** Derived-only storage would risk losing spelling, compatibility distinctions, edit fidelity, and the original display.  
**Evidence:** The brief requires preserving original text and forbids silently dropping or truncating notes. UAX15 explains that NFKC may collapse compatibility distinctions with possible semantic importance (§1.1–1.2, lines 79–100 and 141–148).  
**Reason:** The key is a disposable search artifact. Keep the complete original outside the transformed index; migrations rebuild only keys.

## D02 — Keep an explicit NFKC-then-casefold compatibility mode

**Decision: ACCEPT, WITH SCOPE AMENDMENT.**  
**Criticism:** The desired mode needs a defined, symmetric transform but can overstate what Unicode guarantees.  
**Evidence:** CPython documents NFKC as compatibility decomposition followed by canonical composition [S1, lines 157–187] and casefold as intended for caseless matching [S2, lines 1699–1714]. UAX15 examples include compatibility forms such as fractions, width variants, and superscripts (§1.1–1.2).  
**Reason:** Keep the exact pipeline on both note and query. Name it as the application’s versioned operation. Do not claim that it is locale collation, accent-insensitive matching, security confusable detection, or a universal equivalence rule.

## D03 — Reject the universal UTF-8 non-expansion claim

**Decision: REJECT.**  
**Criticism:** The draft says NFKC and casefold never increase UTF-8 byte length.  
**Evidence:** UAX15’s compatibility examples include ¼ → 1⁄4 (§1.1, lines 79–100). The executable witness records U+00BC as 2 input UTF-8 bytes and 5 output bytes. It also records U+0390 as 2 input bytes and 6 output bytes after casefold on the installed runtime. CPython’s pinned test documents ß → ss [S3, lines 914–921], and its implementation applies full mappings with up to three output code points per input code point [S5, lines 9715–9728].  
**Reason:** A specific equal-byte example such as ß does not establish monotonic byte length. The transformation’s complete UTF-8 output must be measured.

## D04 — Reject the “original ≤4096 implies key fits” rule

**Decision: REJECT.**  
**Criticism:** The proposed pre-transform source limit cannot enforce the stored-key cap.  
**Evidence:** In the witness, 820 repetitions of U+00BC use 1,640 source bytes and yield a 4,100-byte key. UAX15 defines NFKC compatibility decomposition and gives fraction examples (§1.1–1.3).  
**Reason:** Measure the completed key. A short original may overflow; a long original may still yield a key within the cap. The 4096-byte policy applies only to persisted key bytes.

## D05 — Accept measuring the encoded completed key

**Decision: ACCEPT.**  
**Criticism:** The algorithm needs an exact unit and order for enforcing the hard cap.  
**Evidence:** The brief fixes a 4096-byte UTF-8 stored-key limit. CPython documents UTF-8 as the default `str.encode` encoding and strict errors as the default [S2, lines 1751–1759].  
**Reason:** Encode the completed key with strict UTF-8, then compare byte length to 4096. Never use Python `len`, source length, UTF-16 units, or grapheme count for this limit.

## D06 — Amend overflow behavior

**Decision: AMEND.**  
**Criticism:** A “literal-only fallback” for over-limit originals silently removes those notes from compatibility-mode semantics, while original length is not a reliable overflow test.  
**Evidence:** User requirements demand original preservation and a stored-key cap. The quarter-fraction witness falsifies source-size inference.  
**Reason:** Preserve the complete original, omit the persistent derived key, and mark `transformed_key_overflow`. Transiently derive and search those notes in compatibility mode. If an operational failure prevents a scan, clearly identify a partial result. Do not truncate the key or the note.

## D07 — Reject direct key-index-to-source-offset highlighting

**Decision: REJECT; REPLACE WITH SAFE FALLBACK.**  
**Criticism:** Key positions cannot generally be used as source positions; “nearest original character” is undefined.  
**Evidence:** CPython’s pinned test has `ß.casefold() == "ss"` [S3, lines 914–921]; the local witness shows key positions [0,1] and [1,2] both correspond to source span [0,1]. NFKC may change count and order [S1, lines 157–187; UAX15, §1.3]. UAX29 states user-perceived characters may use multiple code points and defines default grapheme-boundary requirements (§2–3, lines 109–146).  
**Reason:** Transformed modes may highlight only when a tested provenance map yields a contiguous, grapheme-safe original span. Otherwise show the result without a span. Literal matches also require renderer-offset conversion and grapheme-safe display.

## D08 — Keep the locale and accent boundaries explicit

**Decision: KEEP AND CLARIFY.**  
**Criticism:** A generic “caseless” label could imply Turkish/Azeri tailoring, accent removal, or locale-aware sorting/search.  
**Evidence:** CPython describes `casefold` as Unicode’s Default Case Folding [S2, lines 1701–1714]. NFKC handles compatibility equivalence, not a general locale collation [UAX15, §§1.1–1.2].  
**Reason:** The selected behavior is default Unicode casefold, independent of the machine locale. It does not remove accents as a general rule. Language-tailored search requires a separately specified mode.

## D09 — Keep visual confusables out of the ordinary search key

**Decision: KEEP.**  
**Criticism:** Similar appearance does not imply equal normalized/casefolded strings, and confusability is not a general search equivalence.  
**Evidence:** The witness’s Latin `paypal` and mixed Latin/Cyrillic lookalike retain distinct keys. UTS39 defines a separate skeleton-based confusable mechanism and says its output is internal, not for display/storage [UTS39, §4, lines 338–350; mixed-script example, lines 400–405].  
**Reason:** Preserve visually similar but distinct strings. Any future lookalike warning must be a separate, versioned, explicitly scoped feature.

## D10 — Keep version metadata and deliberate index rebuild

**Decision: ACCEPT, WITH RELEASE GATE.**  
**Criticism:** An index generated under one Unicode behavior must not be queried as though generated under another.  
**Evidence:** CPython exposes `unicodedata.unidata_version` [S1, lines 198–209], and the casefold documentation cites Unicode 15.1.0 [S2, lines 1699–1714]. UAX15 discusses normalization stability for assigned versus unassigned characters (§3, lines 218–229).  
**Reason:** Store the exact transform identifier, Unicode data version, and runtime/build identity; rebuild from originals through an atomic generation switch. The pinned target runtime must be checked at build/startup.

## D11 — Keep the less aggressive NFC alternative

**Decision: KEEP, WITH CLEAR COMPARISON.**  
**Criticism:** Users need an alternative when compatibility mappings collapse distinctions they care about.  
**Evidence:** UAX15 distinguishes canonical from compatibility equivalence and cautions against blind NFKC use (§1.1–1.2, lines 70–100 and 141–148).  
**Reason:** Keep Literal and offer or document NFC-based matching as a lower-collapse alternative. Do not pretend it has the same recall as NFKC-then-casefold.

## D12 — Amend validation status and acceptance criteria

**Decision: AMEND.**  
**Criticism:** Inspecting upstream tests is not the same as running them; sample tests cannot certify the pipeline or UI.  
**Evidence:** The pinned `test_unicodedata.py` harness fetches a normalization test file and checks that the header contains the running Unicode version [S4, lines 372–400]. UAX15’s C3 requires conformance to the versioned normalization test file (§4, lines 241–249). The local witness explicitly records that it is targeted and not a 3.13.9 run.  
**Reason:** Require the target runtime, pinned CPython tests, Unicode 15.1 normalization and casefold oracles, product boundary tests, and UI/highlight tests. State plainly that none of those target/application suites ran in this arm.

## D13 — Keep the requirement not to infer universal correctness from examples

**Decision: KEEP.**  
**Criticism:** A few examples are enough to refute a universal rule when they are counterexamples, but never enough to establish universal correctness.  
**Evidence:** The executed witness is bounded to explicit cases on CPython 3.14.4 / Unicode 16.0.0; its own result lists the limitations. Unicode’s normalization conformance oracle is versioned [UAX15, §4 C3].  
**Reason:** Use examples to falsify the draft’s size and offset assumptions, not to certify the whole product. Keep broad, version-pinned oracle testing as a release gate.

## D14 — Treat target-runtime behavior as unresolved in this arm

**Decision: UNCERTAIN UNTIL TARGET EXECUTION.**  
**Criticism:** Can the installed-runtime witness be represented as a CPython 3.13.9 result?  
**Evidence:** The witness’s captured runtime is CPython 3.14.4 with Unicode 16.0.0. The brief’s target is CPython 3.13.9; the copied source is pinned to a commit but no 3.13.9 interpreter was run here. UAX15 describes stability for assigned normalization data, but the witness itself is not a target test.  
**Reason:** Do not transfer runtime identity or claim exact target execution. The proposal preserves the pinned sources and makes exact 3.13.9 / Unicode 15.1.0 verification a release gate.

## D15 — Keep the original draft’s useful history

**Decision: KEEP WITH CORRECTIONS RECORDED.**  
**Criticism:** A final rewrite must not erase accepted prior design choices or falsely imply they were all wrong.  
**Evidence:** The draft’s source-of-truth, explicit mode, versioned migration, literal alternative, non-goals for confusables and identity, and cautious validation statements remain useful and are named in `final.md`.  
**Reason:** Preserve those decisions, and record the changed byte, overflow, and highlight rules with their rationale.
