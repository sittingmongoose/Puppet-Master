Legitimate test input — untrusted proposed algorithm

# Draft: canonical JSON identity at the Unicode/number boundary (RFC 8785 JCS)

Scope (per mapped brief): bind the accepted input domain and duplicate-name policy; check property ordering including non-BMP keys; check number serialization and prohibited numeric values; distinguish Unicode preservation from normalization; propose controls that discriminate a plausible wrong implementation; bind any later executed witness to this report. This draft is a candidate-authored preliminary proposal for review — not truth and not an evaluator judgment. No code was executed; all statements below are text-level readings of the frozen RFC 8785 text (source identity in `sources.json`) plus the author's recollection, and each claim carries explicit conditions and tentative uncertainty.

## Preliminary algorithm (pseudocode)

```
function jcs_canonicalize(value):
  # input: a value already parsed from UTF-8 JSON text (RFC 8259),
  # adapted to I-JSON: object property names unique, strings valid
  # Unicode, numbers IEEE 754 double-precision.
  switch type(value):
    null:   emit "null"
    bool:   emit value ? "true" : "false"
    number: if value is NaN or ±Infinity: error "prohibited numeric value"
            if value == 0: emit "0"                    # covers -0
            else: emit es6_number_to_string(value)      # ECMA-262 §7.1.12.1 incl. Note 2
    string: emit json_escape(value)
    array:  emit "[" ++ join(map(jcs_canonicalize, value), ",") ++ "]"
    object: pairs = [(k, v) for k, v in items(value)]
            if names(pairs) are not unique: error "duplicate property name"
            sorted = sort names(pairs) as arrays of UTF-16 code units,
                     unsigned integer comparison, shorter prefix first
            emit "{" ++ join([json_escape(k) ++ ":" ++ jcs_canonicalize(v)
                              for k in sorted], ",") ++ "}"

function json_escape(s):
  if s contains any unpaired surrogate code point: error "invalid Unicode"
  out = "\""
  for cp in code_points(s):
    U+0008 -> "\\b";  U+0009 -> "\\t";  U+000A -> "\\n"
    U+000C -> "\\f";  U+000D -> "\\r"
    U+0000..U+001F (others) -> "\\u" + lowercase_hex4(cp)
    U+005C -> "\\\\";  U+0022 -> "\\\""
    otherwise -> emit cp as-is (UTF-8 on the wire, no \u escaping)
  return out ++ "\""
```

- Claim 1: The canonicalizer's accepted input domain is I-JSON-adapted data only: JSON objects without duplicate property names, strings expressible as Unicode, numbers expressible as IEEE 754 doubles. Canonicalization operates on a parsed data structure, not on raw text.
  - Conditions: holds only if the upstream parser/adaptor enforces I-JSON before this algorithm runs; text-level inputs with duplicate names or non-double numbers are outside the domain.
  - Uncertainty: whether a receiving implementation must hard-error on duplicate names in text or may apply last-one-wins upstream is a parser-policy question the RFC leaves to the JSON transformer; this draft proposes hard-error and marks it tentative.

- Claim 2: Property ordering is a recursive lexicographic sort of property names in raw (unescaped) form, compared as arrays of unsigned UTF-16 code units; if one name is a prefix of the other, the shorter precedes.
  - Conditions: comparison is on code units, not code points or locale collation.
  - Uncertainty: the non-BMP consequence — a supplementary-plane name encodes as surrogate pairs, so U+10000 (0xD800 0xDC00) sorts before U+FFFF (0xFFFF) — is the load-bearing edge; the exact pair is the author's construction and must be cross-checked against the RFC's sorting rationale text.

- Claim 3: String serialization escapes only `"` and `\` plus the C0 control range: the five JSON short escapes for U+0008/09/0A/0C/0D, lowercase `\uhhhh` for the remaining controls, and everything else verbatim (non-ASCII is never `\u`-escaped).
  - Conditions: lowercase hexadecimal is required for byte-level identity; input strings must be valid Unicode with no lone surrogates.
  - Uncertainty: the "lowercase" and "as-is non-ASCII" details are read from the frozen RFC text but are exactly the kind of detail a wrong implementation gets silently wrong; they need confirmation against the RFC's own string examples before any reliance.

- Claim 4: JCS preserves Unicode as-is and performs no normalization: canonically equivalent but differently normalized strings (NFC vs NFD) remain distinct keys and distinct values, and unescaped characters round-trip byte-identically.
  - Conditions: applies to both property names and string values; no NFC/NFD/NFKC fold anywhere in the pipeline.
  - Uncertainty: the RFC explicitly contrasts JCS with JSON normalization schemes, but whether signature-identity applications should layer an application-level normalization policy on top is an open design question this draft does not settle.

- Claim 5: Number serialization is exactly ECMA-262 §7.1.12.1 including Note 2 (shortest representation that round-trips a double): -0 serializes as "0", integers in double range print without exponent, and exponent form appears around the 1e21 and sub-1e-6/1e-7 boundaries; NaN and ±Infinity must terminate with an error.
  - Conditions: input numbers must already be doubles; higher-precision literals were narrowed at parse time, so identity claims only cover double-expressible values.
  - Uncertainty: the exact exponent thresholds and digit-output details are the most error-prone part and were not re-derived here; RFC 8785 Appendix B sample values are the designated cross-check, not this draft.

- Claim 6: A plausible wrong implementation — code-point instead of UTF-16 sorting, uppercase hex escapes, silent NFC normalization, a homegrown float formatter, or tolerant whitespace/duplicate-name parsing — is discriminated by small input-only controls: non-BMP key pairs (é vs U+10000 vs U+FFFF class pairs), C0 control characters, composed/decomposed accent pairs, boundary numbers (-0, 9007199254740993, 1e21, 1e-7), and raw JSON text with duplicate names.
  - Conditions: fixtures carry inputs only; discrimination happens only when the later authorized witness executes them, so this claim is about test design, not observed behavior.
  - Uncertainty: coverage is illustrative, not exhaustive; there may be failure modes (e.g., array handling, whitespace emission) these controls miss.

- Claim 7: Any later executed witness is bound to this report: it applies only to the frozen source bytes recorded in `sources.json` (RFC 8785, captured 2026-10-07, sha256 63d52294…) and to the claims above; its results do not extend to other JCS versions, releases, or implementations.
  - Conditions: the witness is the only permitted execution step, run by the designated root-qualified role, not by this seed.
  - Uncertainty: witness tooling, pass/fail thresholds, and how many fixtures suffice are outside this seed's scope and remain explicitly unresolved.

## Proposed checks (input-only, no execution in this seed)

Fixtures will carry: (a) ordinary object/array/string/number round-trips; (b) the Claim 2 non-BMP ordering pair; (c) C0 controls and quote/backslash; (d) composed vs decomposed accents; (e) -0, 9007199254740993, 1e21, 1e-7; (f) duplicate-name text; (g) a lone-surrogate string as a domain-rejection input. All are inputs only, with no expected outputs recorded anywhere in this seed.

## Open questions

Exact exponent-threshold table (deferred to RFC Appendix B); duplicate-name hard-error vs upstream last-wins; whether an application-level normalization policy belongs above JCS for signature identity.
