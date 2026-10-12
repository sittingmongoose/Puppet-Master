#!/usr/bin/env python3
"""Bounded candidate witness for NFKC-then-casefold UTF-8 length and offset claims."""
import json
import sys
import unicodedata

def key(text):
    return unicodedata.normalize("NFKC", text).casefold()

def details(label, text):
    normalized = unicodedata.normalize("NFKC", text)
    transformed = normalized.casefold()
    return {
        "label": label,
        "input": text,
        "input_codepoints": [f"U+{ord(ch):04X}" for ch in text],
        "input_utf8_bytes": len(text.encode("utf-8")),
        "nfkc": normalized,
        "nfkc_codepoints": [f"U+{ord(ch):04X}" for ch in normalized],
        "nfkc_utf8_bytes": len(normalized.encode("utf-8")),
        "key": transformed,
        "key_codepoints": [f"U+{ord(ch):04X}" for ch in transformed],
        "key_utf8_bytes": len(transformed.encode("utf-8")),
    }

samples = [
    ("ascii", "ABC"),
    ("sharp_s", "\u00df"),
    ("fraction_quarter", "\u00bc"),
    ("greek_iota_dialytika_tonos", "\u0390"),
    ("dotted_capital_i", "\u0130"),
    ("precomposed_e_acute", "\u00e9"),
    ("decomposed_e_acute", "e\u0301"),
    ("circled_one", "\u2460"),
]
rows = [details(label, text) for label, text in samples]

fraction_run = "\u00bc" * 820
fraction_key = key(fraction_run)
latin = "paypal"
mixed_script = "p\u0430yp\u0430l"
checks = {
    "ascii_casefold": key("ABC") == key("abc"),
    "canonical_sequence_match": key("\u00e9") == key("e\u0301"),
    "compatibility_match": key("\u2460") == key("1"),
    "sharp_s_expands_codepoints": len(key("\u00df")) > len("\u00df"),
    "single_fraction_expands_utf8": len(key("\u00bc").encode("utf-8")) > len("\u00bc".encode("utf-8")),
    "under_cap_source_can_exceed_key_cap": (
        len(fraction_run.encode("utf-8")) < 4096
        and len(fraction_key.encode("utf-8")) > 4096
    ),
    "visual_confusable_example_remains_distinct": key(latin) != key(mixed_script),
    "original_fraction_run_unchanged": fraction_run == "\u00bc" * 820,
}
if not all(checks.values()):
    raise AssertionError(checks)

result = {
    "runtime": {
        "implementation": sys.implementation.name,
        "version": sys.version,
        "unicode_database": unicodedata.unidata_version,
    },
    "pipeline": "unicodedata.normalize('NFKC', text).casefold()",
    "samples": rows,
    "fraction_run": {
        "count": 820,
        "source_utf8_bytes": len(fraction_run.encode("utf-8")),
        "key_utf8_bytes": len(fraction_key.encode("utf-8")),
        "key_prefix_codepoints": [f"U+{ord(ch):04X}" for ch in fraction_key[:12]],
    },
    "sharp_s_highlight_counterexample": {
        "original": "\u00df",
        "key": key("\u00df"),
        "key_matches_for_query_s": [
            [i, i + 1] for i in range(len(key("\u00df"))) if key("\u00df").startswith("s", i)
        ],
        "original_codepoint_span": [0, 1],
        "interpretation": "Both one-code-point key hits map to the same full original code point; key indices are not original offsets.",
    },
    "confusable_pair": {
        "latin": latin,
        "mixed_script": mixed_script,
        "mixed_script_codepoints": [f"U+{ord(ch):04X}" for ch in mixed_script],
        "latin_key": key(latin),
        "mixed_script_key": key(mixed_script),
    },
    "checks": checks,
    "scope_limits": [
        "This is a targeted, finite witness on the installed runtime, not CPython 3.13.9.",
        "The installed runtime's Unicode database is reported above; results do not establish version identity with the requested target.",
        "Examples falsify the draft's universal non-expansion and direct-offset claims; they do not prove all transformation behavior or product correctness.",
        "No user-interface, persistence, migration, locale, or full Unicode conformance test ran."
    ],
}
print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
