#!/usr/bin/env python3
"""Bounded counterexample witness for B08-P02.

Domain: valid Python Unicode strings; key K(s) = NFKC(s).casefold();
key bytes = strict UTF-8 payload bytes. Runs examples only and is not a
conformance or exhaustive Unicode test.
"""
import json
import sys
import unicodedata


def key(text):
    return unicodedata.normalize("NFKC", text).casefold()


def byte_len(text):
    return len(text.encode("utf-8", errors="strict"))


def find_result(haystack, needle):
    start = haystack.find(needle)
    return {"start_codepoint": start,
            "end_codepoint": None if start < 0 else start + len(needle)}


sharp_original = "A\u00dfB"
sharp_key = key(sharp_original)
sharp_match = "ss"
sharp_span = find_result(sharp_key, sharp_match)
sharp_direct_slice = sharp_original[sharp_span["start_codepoint"]:sharp_span["end_codepoint"]]

combining_original = "e\u0301"
combining_key = key(combining_original)
combining_span = find_result(combining_key, "\u00e9")
combining_direct_slice = combining_original[combining_span["start_codepoint"]:combining_span["end_codepoint"]]

expansion_char = "\ufdfa"
repeat_count = 4096 // byte_len(expansion_char)
expanded_original = expansion_char * repeat_count
expanded_key = key(expanded_original)
expanded_original_bytes = byte_len(expanded_original)
expanded_key_bytes = byte_len(expanded_key)

assert repeat_count == 1365
assert expanded_original_bytes == 4095
assert expanded_key_bytes == 45045
assert expanded_original_bytes <= 4096 < expanded_key_bytes
assert sharp_key == "assb"
assert sharp_direct_slice == "\u00dfB"
assert combining_key == "\u00e9"
assert combining_direct_slice == "e"

cases = {
    "empty": {"input": "", "key": key(""), "input_codepoints": 0,
              "key_codepoints": len(key("")), "input_utf8_bytes": 0,
              "key_utf8_bytes": byte_len(key(""))},
    "ascii": {"input": "ABC", "key": key("ABC"), "input_codepoints": 3,
              "key_codepoints": len(key("ABC")), "input_utf8_bytes": 3,
              "key_utf8_bytes": byte_len(key("ABC"))},
    "fullwidth_A": {"input": "\uff21", "key": key("\uff21"),
                    "input_codepoints": 1, "key_codepoints": len(key("\uff21")),
                    "input_utf8_bytes": byte_len("\uff21"),
                    "key_utf8_bytes": byte_len(key("\uff21"))},
    "sharp_s": {"input": "\u00df", "key": key("\u00df"),
                "input_codepoints": 1, "key_codepoints": len(key("\u00df")),
                "input_utf8_bytes": byte_len("\u00df"),
                "key_utf8_bytes": byte_len(key("\u00df"))},
    "turkish_I_examples": {"input": "I\u0130\u0131",
                           "key": key("I\u0130\u0131")},
    "non_latin_arabic_ligature": {
        "codepoint": "U+FDFA",
        "name": unicodedata.name(expansion_char),
        "single_key": key(expansion_char),
        "single_input_utf8_bytes": byte_len(expansion_char),
        "single_key_codepoints": len(key(expansion_char)),
        "single_key_utf8_bytes": byte_len(key(expansion_char)),
    },
}

result = {
    "witness": "B08-P02 bounded size and offset counterexamples",
    "python_version": sys.version,
    "unicode_database_version": unicodedata.unidata_version,
    "algorithm": "unicodedata.normalize('NFKC', text).casefold()",
    "measurement_units": {
        "Python string length": "code points",
        "key storage size": "strict UTF-8 payload bytes",
        "grapheme_clusters": "not measured",
    },
    "cases": cases,
    "size_boundary_counterexample": {
        "input_codepoint": "U+FDFA",
        "repetitions": repeat_count,
        "original_utf8_bytes": expanded_original_bytes,
        "transformed_key_codepoints": len(expanded_key),
        "transformed_key_utf8_bytes": expanded_key_bytes,
        "limit_bytes": 4096,
        "result": "original fits; transformed key exceeds cap",
    },
    "offset_counterexamples": {
        "sharp_s": {
            "original": sharp_original,
            "transformed_key": sharp_key,
            "matched_key_substring": sharp_match,
            "matched_key_span_codepoints": [sharp_span["start_codepoint"],
                                            sharp_span["end_codepoint"]],
            "naive_original_slice": sharp_direct_slice,
            "correct_source_region": "\u00df",
        },
        "canonical_composition": {
            "original": combining_original,
            "transformed_key": combining_key,
            "matched_key_substring": "\u00e9",
            "matched_key_span_codepoints": [combining_span["start_codepoint"],
                                            combining_span["end_codepoint"]],
            "naive_original_slice": combining_direct_slice,
            "combining_mark_omitted": True,
        },
    },
    "interpretation": [
        "The input-byte acceptance rule does not bound the NFKC-plus-casefold output; measure the transformed UTF-8 bytes.",
        "Key code-point spans cannot be reused as original-string spans; a naive slice demonstrably includes or excludes source text.",
        "This is a small counterexample witness, not a Unicode-wide proof or UI/highlight implementation test.",
    ],
}
print(json.dumps(result, ensure_ascii=True, sort_keys=True, indent=2))
