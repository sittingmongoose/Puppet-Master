# D-M06-A candidate-v3 working checklist (ticket 1 output)

Arm prep T0: 2026-10-08T01:01:03.369784Z. Arm deadline 2026-10-08T01:31:03.369784Z; case deadline 01:33:18.885619Z.
Ingest completed (hash binding verified): 2026-10-08T01:03:24.880429Z — this is the first-useful-finding timestamp for timings.json.

## Input binding (verified)
| file | sha256 (actual = frozen?) | bytes |
|---|---|---|
| common/seed-v3/draft.md | 2c1289885dcd8b0c99cf18bd63771fe3acece6b61c8b4b533045f76a568a0910 ✓ | 6344 |
| common/seed-v3/fixtures.json | bc2ed432bc18ec4ac2eda91518111ade950b44d7f66b6c3dc6ca604a60c268ac ✓ | 4815 |
| common/seed-v3/sources.json | 87510c175a18a91851d4aea895901bc8ce7155a8cf0d405646e8adcf6c18674c ✓ | 2929 |
| cases/D-M06-A/inputs/sources/jcs.txt | 63d52294eb0e3f0014174288186d388b4ddbf2c67d1ce8af1d9726eb0c3ab240 ✓ (matches INPUT_MAP) | 41879 |

Read completely: brief.md, draft.md, fixtures.json (f01–f18), seed sources.json, RFC 8785 (984 lines).
Draft status: untrusted review stimulus (8 claims C1–C8, uncertainties U1–U3, no expected outputs). Fixtures are input-only, no keys.

## Six material obligations (working checklist)
1. **Bind accepted input domain + duplicate-name policy** — I-JSON per §3.1: no duplicate property names (reject; no first/last-wins defined), strings valid Unicode (lone surrogate → error, §3.2.2.2 Note), numbers IEEE 754 binary64 only. Fixtures: f07 (escape-resolved dup), f08 (literal dup), f11 (lone surrogate U+DEAD), f16/f17 (out-of-range).
2. **Property ordering incl. non-BMP keys** — §3.2.3: sort raw (unescaped) names as UTF-16 code-unit arrays, unsigned compare, recursive; arrays scanned for objects but element order kept; shorter string precedes when prefix. RFC's own test data (f04) expected argument order: U+000D, "1", U+0080, U+00F6, U+20AC, U+1F600, U+FB33. Non-BMP U+1F600 (units D83D DE00) precedes U+FB33 (unit FB33) because 0xD83D < 0xFB33 — code-point order or UTF-8 byte order reverses this pair (f05). Escaped-text sorting would misplace U+000D vs "1" (f04/f06).
3. **Number serialization + prohibited values** — §3.2.2.3: ECMA-262 §7.1.12.1 incl. Note 2 (cited, not restated); NaN/±Infinity → error (never in JSON). Appendix B Table 1 samples bind: 0/−0→"0", 5e-324, 1.7976931348623157e+308, 9007199254740992, 9.999999999999997e+22 vs 1e+23 (neighbor doubles), 999999999999999700000/…990000/1e+21 boundary, 9.999999999999997e-7 vs 0.000001 (1e-6 boundary), 333333333.3333332…43 ladder, −0.0000033333333333333333, 1424953923781206.25 → "1424953923781206.2" (Note 4, round-to-even). Exponent window: ≥1e21, <1e-6. Fixtures: f12, f13, f14, f15, f16, f17, f18.
4. **Unicode preservation ≠ normalization** — §3.1 Note + Appendix E: strings preserved "as is", JCS does NOT apply Unicode normalization; NFC (f09) and NFD (f10) stay different canonical outputs. Escaping rules §3.2.2.2: U+0000–U+001F lowercase \uhhhh except \b \t \n \f \r; " and \ escaped; everything else verbatim (non-ASCII never escaped — cf. §3.2.2 sample output €$…).
5. **Discriminating controls** — plausible wrong impls to separate: code-point/UTF-8-byte sorting (f05), escaped-text sorting (f04/f06), text-level number rewriting vs true double identity (f12/f13), normalization sneaking in (f09/f10), raw-vs-resolved duplicate detection (f07/f08), silent pass-through of invalid Unicode or overflow (f11, f16), naive fixed-point formatting / Python-repr-style output (f14/f15: exponent window and round-to-even differ from ECMA).
6. **Witness binding + applicability limits** — any executed witness must record in report.md: witness identity (candidate-authored witness.py SHA-256), fixtures.json SHA-256 (bc2ed432…), execution time, harness (sandbox.py, process-isolation only, never oracle truth), and results attest only to that code on those inputs.

## Standing constraints (from assignment)
Science runs only via existing helper: `python3 -B .../helpers/mechanical/sandbox.py --code OWN_OUTPUT/witness.py --input OWN_OUTPUT/witness-input.json --wall-seconds 5 --receipt OWN_OUTPUT/witness-receipt.json`. No installs, no children, writes only in candidate-v3/. Sol supplies no algorithms/expected results. Running claimed formula or mutual-wrong roundtrip alone is insufficient — need independent oracles + plausible-wrong controls. Budgets: ≤8min oracle selection, ≤12min witness, ≤5min reconcile, ≤5min final (logical maxima inside the 30min arm window).
