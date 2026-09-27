#!/usr/bin/env python3
"""Quote location as RETRIEVAL evidence only (R1b rev2). Never semantic approval.

Documented carrier decoding (the only transformations allowed for an `exact_*` class):
  - backslash escapes a markdown/JSON carrier adds: \\" -> ", \\' -> '
  - whitespace runs (including line breaks) -> one space, on both quote and source text
Nothing else is folded for exact classes: case, underscores, punctuation, backticks and
typography stay contractual. `*_after_escape_decoding` additionally decodes \\n \\t \\r on both
sides (named class). Anything looser is a named LOCATOR class. Whitespace or escape decoding is
not a claim of byte identity or code semantics. `not_located` never means a fact is absent.

A quote containing an ellipsis is exact only if the literal ellipsis text itself is found; otherwise
its fragments (any length, in order) are a locator result and never exact.
Result fields: class, exact, scope ("whole_field" | "segment" | "fragments"), line (1-based line where
the match starts, or None), window_start (first line of the searched window, or None), note.
"""
import re

ELLIPSIS = re.compile(r"\s*(?:\.\.\.|…|\[\.\.\.\]|\[…\])\s*")
TYPO = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'", "–": "-", "—": "-", " ": " ", "…": "..."})


def decode(text):
    text = text.replace('\\"', '"').replace("\\'", "'")
    return re.sub(r"\s+", " ", text).strip()


def _esc(s):
    return re.sub(r"\s+", " ", re.sub(r"\\[ntr]", " ", s)).strip()


def _ordered(fragments, hay):
    pos = 0
    for f in fragments:
        i = hay.find(f, pos)
        if i < 0:
            return False
        pos = i + len(f)
    return True


def _contains(fragments, hay, ordered):
    return _ordered(fragments, hay) if ordered else fragments[0] in hay


def _start_line(lines, lo, hi, fragments, transform, ordered):
    """Largest s in [lo, hi] such that the match is still contained in lines s..hi (monotone), i.e. the
    line on which the match starts. Binary search keeps whole-file windows cheap."""
    def ok(s):
        return _contains(fragments, transform(decode(" ".join(lines[s - 1:hi]))), ordered)
    if not ok(lo):
        return None
    a, b = lo, hi
    while a < b:
        mid = (a + b + 1) // 2
        if ok(mid):
            a = mid
        else:
            b = mid - 1
    return a


def locate(quote, lines, cites, pad=2):
    """quote: raw quote text; lines: source lines; cites: [(start, end)] 1-based."""
    q = decode(quote)
    if not q or not ELLIPSIS.sub("", q).strip():
        return {"class": "empty_quote", "exact": False, "scope": None, "line": None, "window_start": None,
                "note": "no quotable text (empty or ellipsis only)"}
    has_ellipsis = bool(ELLIPSIS.search(q))
    frags = [f for f in (decode(x) for x in ELLIPSIS.split(q)) if f]
    windows = []
    for a, b in cites:
        lo, hi = max(1, min(a, b) - pad), min(len(lines), max(a, b) + pad)
        if lo <= hi:
            windows.append((lo, hi))

    def attempt(needles, transform, label, ordered, exact, scope, note):
        tn = [transform(n) for n in needles]
        for lo, hi in windows:
            if _contains(tn, transform(decode(" ".join(lines[lo - 1:hi]))), ordered):
                return {"class": f"{label}_at_cited_lines", "exact": exact, "scope": scope,
                        "line": _start_line(lines, lo, hi, tn, transform, ordered), "window_start": lo, "note": note}
        if lines and _contains(tn, transform(decode(" ".join(lines))), ordered):
            return {"class": f"{label}_elsewhere_in_source", "exact": exact, "scope": scope,
                    "line": _start_line(lines, 1, len(lines), tn, transform, ordered), "window_start": None, "note": note}
        return None

    ident = lambda s: s  # noqa: E731
    # 1. the whole field literally (an ellipsis here must itself appear in the source)
    hit = attempt([q], ident, "exact", False, True, "whole_field",
                  "verbatim after documented carrier decoding" + (" (literal ellipsis matched)" if has_ellipsis else ""))
    if hit:
        return hit
    hit = attempt([q], _esc, "exact_after_escape_decoding", False, True, "whole_field",
                  "matched after decoding \\n/\\t/\\r escapes on both sides; not a byte-identity claim")
    if hit:
        return hit
    # 2. elided quote: fragments of any length, in order; never exact
    if has_ellipsis:
        for transform, label in ((ident, "ordered_fragments"), (_esc, "ordered_fragments_after_escape_decoding")):
            hit = attempt(frags, transform, label, True, False, "fragments",
                          "fragments found in order; omitted matter between them is unverified (locator only)")
            if hit:
                return hit
    # 3. looser locator folds (never exact)
    base = frags if has_ellipsis else [q]
    prefix = "ordered_fragments_" if has_ellipsis else ""
    for label, fn in (("typography_variant", lambda s: s.translate(TYPO)),
                      ("markdown_code_variant", lambda s: s.translate(TYPO).replace("`", "")),
                      ("case_variant", lambda s: s.translate(TYPO).replace("`", "").lower())):
        hit = attempt(base, fn, prefix + label, has_ellipsis, False, "fragments" if has_ellipsis else "whole_field",
                      "located only after a non-carrier fold; spelling/case/typography differ (locator only)")
        if hit:
            return hit
    return {"class": "not_located", "exact": False, "scope": None, "line": None, "window_start": None,
            "note": "not located in the cited source; this does not show the underlying fact is absent"}


SEGMENT = re.compile(r'(?<!\\)["“]((?:\\.|[^"“”\\])*)(?<!\\)["”]')


def strip_outer(raw):
    raw = raw.strip()
    if len(raw) >= 2 and raw[0] in "\"“'`" and raw[-1] in "\"”'`":
        raw = raw[1:-1]
    return raw.strip()


def locate_field(raw, lines, cites):
    """Locate a raw quote FIELD. First the whole field (outer quotation marks removed), strictly.
    Fallback, only when that fails and the field starts with a quotation mark: split into its quoted
    segments (documented carrier rule: text outside the quotation marks is annotation). A single
    segment match is a match of that segment only (scope "segment"), never of the whole assertion;
    several segments are an ordered LOCATOR. The caller preserves the raw field."""
    first = locate(strip_outer(raw), lines, cites)
    if first["class"] != "not_located" or raw.strip()[:1] not in ('"', "“"):
        return first
    segs = [s for s in SEGMENT.findall(raw.strip()) if s.strip()]
    outside = SEGMENT.sub("", raw.strip()).strip()
    if not segs:
        return first
    if len(segs) == 1:
        r = locate(segs[0], lines, cites)
        if r["class"] in ("not_located", "empty_quote"):
            return first
        r["class"] = "quoted_segment_" + r["class"]
        r["scope"] = "segment"
        r["note"] = f"match of the quoted segment only; annotation outside quotation marks excluded: {outside[:80]!r}"
        return r
    r = locate(" ... ".join(segs), lines, cites)
    if r["class"] in ("not_located", "empty_quote"):
        return first
    r["class"] = r["class"].replace("ordered_fragments", "ordered_quoted_segments", 1)
    r["exact"], r["scope"] = False, "fragments"
    r["note"] = f"{len(segs)} quoted segments found in order; text between them unverified (locator only)"
    return r
