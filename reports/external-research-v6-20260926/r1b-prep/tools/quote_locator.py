#!/usr/bin/env python3
"""Quote location as RETRIEVAL evidence only (R1b). Never semantic approval.

Documented carrier decoding (the only transformations allowed for an `exact_*` class):
  - backslash escapes a markdown/JSON carrier adds: \\" -> ", \\' -> '
  - whitespace runs (including line breaks) -> one space, on both quote and source text
Nothing else is folded for exact classes: case, underscores, punctuation, backticks and
typography stay contractual. Anything looser is a named LOCATOR class; spelling, order of
omitted matter and entailment remain unverified. `not_located` never means the fact is absent.
"""
import re

ELLIPSIS = re.compile(r"\s*(?:\.\.\.|…|\[\.\.\.\]|\[…\])\s*")
TYPO = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'", "–": "-", "—": "-", " ": " ", "…": "..."})


def decode(text):
    text = text.replace('\\"', '"').replace("\\'", "'")
    return re.sub(r"\s+", " ", text).strip()


def _ordered(fragments, hay):
    pos = 0
    for f in fragments:
        i = hay.find(f, pos)
        if i < 0:
            return False
        pos = i + len(f)
    return True


def _variants(text):
    """(class suffix, transform) pairs from strict to loose; each is a locator, not an exact match."""
    return [("typography_variant", lambda s: s.translate(TYPO)),
            ("markdown_code_variant", lambda s: s.translate(TYPO).replace("`", "")),
            ("case_variant", lambda s: s.translate(TYPO).replace("`", "").lower())]


def locate(quote, lines, cites, pad=2):
    """quote: raw quote text; lines: source lines (1-based semantics); cites: [(start, end)].

    Returns {"class", "line", "exact": bool, "note"}.
    """
    q = decode(quote)
    if not q:
        return {"class": "empty_quote", "line": None, "exact": False, "note": "no quote text"}
    frags = [f for f in (decode(x) for x in ELLIPSIS.split(q)) if f]
    fragmented = len(frags) > 1
    windows = []
    for a, b in cites:
        lo, hi = max(1, min(a, b) - pad), min(len(lines), max(a, b) + pad)
        windows.append((lo, decode(" ".join(lines[lo - 1:hi]))))
    whole = decode(" ".join(lines))

    def first_line(needle):
        n = needle[:80]
        for i, line in enumerate(lines, 1):
            if n and n[:40] in decode(line):
                return i
        return None

    def search(transform, label):
        tf = [transform(f) for f in frags]
        for lo, w in windows:
            if (_ordered(tf, transform(w)) if fragmented else tf[0] in transform(w)):
                return {"class": f"{label}_at_cited_lines", "line": lo}
        if _ordered(tf, transform(whole)) if fragmented else tf[0] in transform(whole):
            return {"class": f"{label}_elsewhere_in_source", "line": first_line(frags[0])}
        return None

    base = "ordered_fragments" if fragmented else "exact"
    hit = search(lambda s: s, base)
    if hit:
        hit["exact"] = not fragmented
        hit["note"] = ("fragments found in order; omitted matter between them is unverified (locator only)"
                       if fragmented else "verbatim after documented carrier decoding")
        return hit
    esc = lambda s: re.sub(r"\s+", " ", re.sub(r"\\[ntr]", " ", s)).strip()
    hit = search(esc, base + "_after_escape_decoding")
    if hit:  # quote field serialized line breaks/tabs as \n or \t; decoded identically on both sides
        hit["exact"] = not fragmented
        hit["note"] = "matched after decoding \\n/\\t/\\r escapes on both sides (named carrier class)"
        return hit
    for label, fn in _variants(q):
        hit = search(fn, (base + "_" if fragmented else "") + label)
        if hit:
            hit["exact"] = False
            hit["note"] = "located only after a non-carrier fold; spelling/case/typography differ (locator only)"
            return hit
    return {"class": "not_located", "line": None, "exact": False,
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
    segments (documented carrier rule: text outside the quotation marks is annotation, e.g. `+`, `...`,
    `(same for scale)`); one segment keeps an exact class name of its own, several segments are an
    ordered-fragment LOCATOR. The raw field is always preserved by the caller."""
    first = locate(strip_outer(raw), lines, cites)
    if first["class"] != "not_located" or not raw.strip()[:1] in ('"', "“"):
        return first
    segs = [s for s in SEGMENT.findall(raw.strip()) if s.strip()]
    outside = SEGMENT.sub("", raw.strip()).strip()
    if not segs:
        return first
    if len(segs) == 1:
        r = locate(segs[0], lines, cites)
        if r["exact"]:
            r["class"] = r["class"].replace("exact_", "exact_quoted_segment_", 1)
            r["note"] = f"quoted text verbatim; annotation outside quotation marks excluded: {outside[:80]!r}"
        return r if r["class"] != "not_located" else first
    r = locate(" ... ".join(segs), lines, cites)
    if r["class"] != "not_located":
        r["class"] = r["class"].replace("ordered_fragments", "ordered_quoted_segments", 1)
        r["exact"] = False
        r["note"] = f"{len(segs)} quoted segments found in order; text between them unverified (locator only)"
        return r
    return first
