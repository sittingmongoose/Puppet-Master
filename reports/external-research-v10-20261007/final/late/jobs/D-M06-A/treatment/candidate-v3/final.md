# D-M06-A final — bounded recommendation on RFC 8785 JCS identity claims

**Verdict: the seed draft's identity claims are supported as amended, within the bounds below.** A candidate-authored witness (isolated sandbox run, receipt-bound) executed the seed fixtures against expected values taken only from the frozen RFC 8785 bytes: 15/15 correct-implementation checks passed and all six plausible-wrong controls failed their targeted checks, so the battery discriminates. Method evidence: `report.md`; binding: witness.py `37abc543…7d5b1` on witness-input.json `d0081e96…69ce`, receipt `witness-receipt.json` `656b2168…2ebb`, sandbox `process_exit 0`, namespaces+seccomp enforced, 2026-10-08T01:25:34Z.

## Material findings (8)

1. **Sorting is raw-name UTF-16 code-unit order (accepted; draft C2).** The RFC's own seven-name table reproduces exactly; the minimal pair proves U+1F600 (units D83D DE00) precedes U+FB33 (unit FB33) because 0xD83D < 0xFB33 — a code-point or UTF-8-byte sort reverses this pair, and sorting escaped text misplaces `\r` vs `"1"`. Sorting is recursive; arrays are scanned for objects but element order is preserved.
2. **Numbers are ECMA-262 §7.1.12.1 + Note 2 shortest-round-trip tokens (accepted; C3).** All 26 Appendix B Table 1 rows serialized exactly, including `-0`→`0`, `5e-324`, `1e+21`/`1e-6` window edges, the `333333333.3333332…43` ladder, and note 4's round-to-even `1424953923781206.25`→`1424953923781206.2`. Equal doubles share one token regardless of spelling (4.500/4.50/4.5/450e-2 → `4.5`). Subtlety confirmed empirically: the exponent placement is not pinned to the magnitude decade — row `44b52d02c7e14af6` must emit `1e+23`, not `9.999999999999999e+22`.
3. **Prohibited numbers terminate with an error (accepted; C4, amended).** NaN, ±Infinity, and overflow literals beyond binary64 (`1e309`, `1.4e9999`) must abort; no token is emitted. Amendment: for integer literals with no exact double (2^53+1), the outcome is parser-binding-dependent — `JSON.parse` semantics fold 2^53+1 to 2^53 (→`9007199254740992`), a strict "exactly representable integer" reading rejects it; the frozen bytes do not adjudicate (seed U2, unresolved, recorded as an open condition).
4. **Unicode is preserved, never normalized (accepted; C5/C6).** NFC and NFD spellings produce different canonical outputs, byte-preserved code-point-for-code-point; non-ASCII is emitted raw; only U+0000–U+001F, `"` and `\` are escaped (`\b \t \n \f \r`, else lowercase `\uhhhh`); the §3.2.4 hex sample matches byte-for-byte end-to-end. Lone surrogates (U+DEAD) must terminate with an error — the identity map is total only over valid Unicode scalar text.
5. **Duplicate names are out of domain and rejected (accepted; C7).** Both literal repeats and names equal only after `\u`-escape resolution (`"A"` vs `"\u0041"`) must be rejected; no first-/last-wins merge exists in the source.
6. **Canonical form and order-invariance hold (accepted; C1/C8).** No inter-token whitespace; objects sorted at every level including inside arrays; array element order kept; output encoded UTF-8. Documents differing only in member order or insignificant whitespace canonicalize to identical bytes.
7. **The checks discriminate a wrong implementation (obligation 5 met).** Six plausible wrong designs — code-point sort, escaped-text sort, NFC-normalizing, Python-repr numbers, last-wins duplicates, ensure-ASCII escaping — each fail on the fixture built to catch it; expected values come from RFC-published oracles (Appendix B Table 1, §3.2.3 expected order, §3.2.4 hex), never from the tested formula or a mutual roundtrip.
8. **Executed evidence is bounded (obligation 6 met).** All results attest only to this witness build on this input set in this harness. Number claims beyond Table 1 plus these fixtures are extrapolation: ECMA-262 §7.1.12.1 was read only as cited inside the frozen RFC bytes, and the development-portal corpus was not fetched (seed U1 partially resolved by executing Table 1; U3 unresolved).

## Conditions and recommendations for the adopter

- Implement sorting on UTF-16 code units after escape resolution; reject duplicate names at parse time; reject lone surrogates, NaN/±Infinity, and non-representable magnitudes per the chosen parser binding (decide and document the 2^53+1 policy; wrap big integers as strings per Appendix D).
- Do not add Unicode normalization anywhere in the pipeline; strings must round-trip untouched (Appendix E subtype warning applies to stream parsers).
- Before production, extend validation with the RFC development-portal test corpus (Appendix I) and a V8/Ryu cross-check for number serialization; this arm's budget did not admit them.
- Verify any future change by re-running the bound witness (`report.md` §1 lists the exact command and hashes) rather than by re-deriving claims.

## Seed dispositions

| seed item | disposition |
|---|---|
| C1 order-invariance | accepted |
| C2 non-BMP UTF-16 ordering | accepted |
| C3 number identity | accepted |
| C4 prohibited numbers error | accepted, amended (2^53+1 is parser-binding-dependent) |
| C5 preservation not normalization | accepted |
| C6 invalid Unicode errors | accepted |
| C7 escape-resolved duplicates rejected | accepted |
| C8 structural identity (no whitespace, array order, UTF-8) | accepted |
| U1 number rule cited not restated | resolved in part (Table 1 executed 26/26); ECMA text itself unfetched |
| U2 parser treatment of 2^53+1 / `1e309` | unresolved (both bindings recorded; adopter must choose) |
| U3 development-portal corpus not fetched/executed | unresolved (recommended follow-up) |

Scope: this is a bounded diagnostic of property ordering, Unicode, number serialization, duplicate names, and invalid numbers over the seed fixtures — not a full application plan. Full method, oracle trust rationale, control matrix, and applicability limits: `report.md` §2–§5.
