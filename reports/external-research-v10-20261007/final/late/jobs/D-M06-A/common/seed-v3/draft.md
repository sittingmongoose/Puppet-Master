# D-M06-A draft — preliminary JCS canonicalization algorithm and claims

**Label: Legitimate test input — untrusted proposed algorithm.** Authored fresh for this assignment from the frozen RFC 8785 bytes only (see `sources.json`). This draft is a review stimulus: not truth, not an evaluator judgment, and not a plan of record. Every claim below is tentative and must be re-verified against the frozen source text before any use.

## 1. Accepted input domain and duplicate-name policy (obligation 1)

Bound the algorithm to I-JSON (RFC 7493) data as restated by RFC 8785 §3.1:

- Objects MUST NOT carry duplicate property names. **Policy: reject the input with an error.** No first-wins or last-wins merge is defined by the source.
- String data MUST be valid Unicode. A string containing a lone surrogate (e.g. U+DEAD) is invalid and causes an error (§3.2.2.2 Note).
- Number data MUST be expressible as an IEEE 754 binary64 double. NaN and ±Infinity are never in domain and cause an error (§3.2.2.3 Note). Out-of-range literals and integers above 2^53 reach the algorithm only through parser behavior; see uncertainty U2.

## 2. Preliminary algorithm (pseudocode)

```text
canonicalize(node):
  match node:
    null      -> "null"        true -> "true"       false -> "false"
    string s  -> quote(s)
    number x  -> numtostr(x)                    # ECMA-262 §7.1.12.1 incl. Note 2
    array a   -> "[" + join(map(canonicalize, a), ",") + "]"      # element order kept
    object o  -> "{" + join( for name in keys(o) sorted by sortkey:
                              quote(name) + ":" + canonicalize(o[name]), ",") + "}"

quote(s):                       # s contains no lone surrogates
  out = '"'
  for cp in codepoints(s):
    U+0008, 9, A, C, D  -> "\b", "\t", "\n", "\f", "\r"
    U+0000..U+001F      -> "\uhhhh" (lowercase hex)
    U+005C              -> "\\"          U+0022 -> "\""
    otherwise           -> cp verbatim   # never \u-escaped, never normalized
  return out + '"'

numtostr(x):
  if x is NaN or x in {+Infinity, -Infinity}: ERROR
  emit per ECMA-262 §7.1.12.1 incl. Note 2: -0 -> "0"; no trailing ".0";
  lowercase 'e+'/'e-' exponent form outside the fixed-point window.

sortkey(name): the array of UTF-16 code units of the raw (unescaped) name;
  compare unit-by-unit as unsigned integers; the first difference decides;
  if one array is a prefix of the other, the shorter name precedes.
  Apply recursively to every object, including objects nested in arrays.

pipeline: emit no whitespace between tokens (§3.2.1); encode the final
  character sequence as UTF-8 (§3.2.4).
```

## 3. Claims (tentative; source condition in brackets)

- **C1 Order-invariance.** Two I-JSON documents whose parsed values are equal but whose member order differs canonicalize to byte-identical UTF-8. [§3.2.3]
- **C2 Non-BMP ordering.** Names sort by raw UTF-16 code units, so U+1F600 (`\ud83d\ude00`) precedes U+FB33 even though U+1F600 is the higher code point. A code-point-ordering or UTF-8-byte-ordering implementation reverses this pair. [§3.2.3 and its built-in test data]
- **C3 Number identity.** Equal doubles share one output token regardless of input spelling (4.50, 4.5, 450e-2 yield the same token); -0 and 0 both emit "0"; magnitudes ≥1e21 and <1e-6 take lowercase exponent form. [§3.2.2.3, Appendix B]
- **C4 Prohibited numbers.** NaN, +Infinity, -Infinity, and values with no binary64 double terminate with an error; no token is emitted. [§3.2.2.3 Note, Appendix B note 3]
- **C5 Unicode preservation, not normalization.** Strings are preserved code-point-for-code-point: NFC and NFD spellings of the same text produce different canonical outputs and neither is normalized. Only U+0000–U+001F, `"` and `\` are escaped; U+0008/9/A/C/D use `\b \t \n \f \r`; other controls use lowercase `\uhhhh`; non-ASCII is never escaped. [§3.1 Note, §3.2.2.2]
- **C6 Invalid Unicode.** A lone surrogate anywhere in a string value or name is an error; the identity map is total only over valid Unicode scalar text. [§3.2.2.2 Note]
- **C7 Duplicate names.** Repeated names — literal, or equal only after `\u`-escape resolution (`"A"` vs `"\u0041"`) — are out of domain and rejected. [§3.1 via RFC 7493]
- **C8 Structural identity.** Output has no inter-token whitespace; array element order is preserved while objects inside arrays are sorted; the emitted bytes are UTF-8. [§3.2.1, §3.2.3, §3.2.4]

## 4. Discriminating controls (obligation 5)

`fixtures.json` pins inputs only; the controls were chosen to reject plausible wrong implementations: (a) f04/f05 sort fixtures separate UTF-16-unit ordering from code-point ordering, and from sorting on *escaped* text (the name `\r` would land after `"1"` under escaped-text sorting); (b) f12/f13 same-double spellings and zero variants separate true numeric identity from text-level rewriting; (c) f09/f10 NFC/NFD pair catches normalization sneaking in; (d) f07 escape-collision duplicate catches duplicate detection done on raw vs. resolved names; (e) f11 and f16 catch validators that pass invalid Unicode or out-of-range magnitudes through silently.

## 5. Conditions, uncertainty, and witness binding (obligations 4, 6)

- **U1.** RFC 8785 cites, but does not restate, the number algorithm (ECMA-262 §7.1.12.1 + Note 2). This arm read only the frozen RFC bytes, so C3/C4 rest on §3.2.2.3 prose plus Appendix B Table 1 and remain tentative until a witness runs those samples.
- **U2.** The source requires numbers "expressible as IEEE 754 double" but, in the bytes read here, does not pin how a parser must treat texts like `9007199254740993` or `1e309`; f17/f18 are domain-edge probes, not settled cases.
- **U3.** Appendix B's full table and the development-portal test corpus were not fetched or executed in this arm.

**Witness binding.** Any later executed witness must be bound to its report by recording: the witness's exact identity (project, release, commit or binary SHA-256), the SHA-256 of the `fixtures.json` used, execution time, and harness. Its results then attest only to that build on those inputs — not to this draft's claims in general, not to other releases, and not to inputs outside the fixture set. This draft intentionally contains no expected outputs; pass/fail judgment belongs to the reviewer applying the frozen RFC text.
