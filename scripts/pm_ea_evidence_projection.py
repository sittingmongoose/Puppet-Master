"""Physical JSON locations for exact family evidence, without sibling-row fallback."""

from __future__ import annotations

import json
import re

_CACHE: dict[int, tuple[str, dict, dict[str, tuple[int, int]]]] = {}


def forget(text: str) -> None:
    _CACHE.pop(id(text), None)


def inferred_event(text: str, pointer: str | None, quote: str | None) -> str | None:
    named = re.search(r'"event_type"\s*:\s*"([^"\n]+)"', quote or "")
    if named:
        return named[1]
    declared = re.match(r"^#/(families|rows)/([0-9]+)(?:/|$)", pointer or "")
    if declared:
        document, _ = _locations(text)
        try:
            return document[declared[1]][int(declared[2])].get("event_type")
        except (KeyError, IndexError, TypeError, AttributeError):
            raise ValueError(f"unresolvable JSON family unit: {pointer}") from None
    return None


def pointer_span(text: str, pointer: str) -> tuple[int, int]:
    _, positions = _locations(text)
    if pointer not in positions:
        raise ValueError(f"JSON evidence pointer does not resolve: {pointer}")
    first, last = positions[pointer]
    return text.count("\n", 0, first) + 1, text.count("\n", 0, last - 1) + 1


def pointer_text(text: str, pointer: str) -> str:
    _, positions = _locations(text)
    if pointer not in positions:
        raise ValueError(f"JSON evidence pointer does not resolve: {pointer}")
    first, last = positions[pointer]
    return text[first:last]


def quote_in_pointer(text: str, pointer: str, quote: str) -> bool:
    window = pointer_text(text, pointer)
    if quote in window:
        return True
    words = quote.split()
    return bool(words and re.search(r"\s+".join(re.escape(word) for word in words), window))


def _locations(text: str) -> tuple[dict, dict[str, tuple[int, int]]]:
    cached = _CACHE.get(id(text))
    if cached is not None and cached[0] is text:
        _CACHE.pop(id(text))
        _CACHE[id(text)] = cached
        return cached[1], cached[2]
    # Positions do not depend on numeric interpretation. Preserve arbitrary
    # source integers/decimals without Python's decimal-digit conversion cap.
    decoder = json.JSONDecoder(parse_int=str, parse_float=str)
    document = decoder.decode(text)
    positions: dict[str, tuple[int, int]] = {}

    def whitespace(at: int) -> int:
        while at < len(text) and text[at].isspace():
            at += 1
        return at

    def visit(at: int, pointer: str) -> int:
        at = whitespace(at)
        first = at
        if text[at] == "{":
            at = whitespace(at + 1)
            while text[at] != "}":
                key_first = at
                key, at = decoder.raw_decode(text, at)
                at = whitespace(at)
                assert text[at] == ":"
                escaped = key.replace("~", "~0").replace("/", "~1")
                child = pointer + "/" + escaped
                value_end = visit(at + 1, child)
                at = whitespace(value_end)
                line_first = text.rfind("\n", 0, key_first) + 1
                if not text[line_first:key_first].strip():
                    key_first = line_first
                # The member's own declaration key and separator are valid
                # evidence too; never include the following sibling's bytes.
                positions[child] = (key_first, at + 1 if text[at] == "," else value_end)
                if text[at] != ",":
                    break
                at = whitespace(at + 1)
            assert text[at] == "}"
            at += 1
        elif text[at] == "[":
            at = whitespace(at + 1)
            index = 0
            while text[at] != "]":
                at = whitespace(visit(at, pointer + "/" + str(index)))
                index += 1
                if text[at] != ",":
                    break
                at = whitespace(at + 1)
            assert text[at] == "]"
            at += 1
        else:
            _, at = decoder.raw_decode(text, at)
        positions[pointer] = (first, at)
        return at

    visit(0, "#")
    # Large fixture banks are independent documents. Retaining their complete
    # decoded trees and pointer maps across a batch exceeds its 2 GiB budget.
    while _CACHE and (len(_CACHE) >= 8 or
                      sum(len(value[2]) for value in _CACHE.values()) + len(positions) > 600_000):
        _CACHE.pop(next(iter(_CACHE)))
    if len(positions) <= 600_000:
        _CACHE[id(text)] = (text, document, positions)
    return document, positions


def family_span(text: str, event_type: str, pointer: str | None = None,
                criterion: str | None = None) -> tuple[str, tuple[int, int]] | None:
    """Bind a quotation to its declared family row and optionally its own grade cell.

    A declared sibling pointer refuses. A missing pointer may be derived only
    from an exactly unique event_type in a top-level rows/families collection.
    """
    document, positions = _locations(text)
    candidates = []
    for key in ("families", "rows"):
        values = document.get(key) if isinstance(document, dict) else None
        if isinstance(values, list):
            candidates.extend((f"#/{key}/{i}", value) for i, value in enumerate(values)
                              if isinstance(value, dict) and value.get("event_type") == event_type)
    declared = re.match(r"^(#/(?:families|rows)/[0-9]+)(?:/|$)", pointer or "")
    if declared:
        candidates = [(p, v) for p, v in candidates if p == declared[1]]
        if len(candidates) != 1:
            raise ValueError(f"declared JSON unit {pointer} does not name {event_type}")
    elif not candidates:
        return None
    if len(candidates) != 1:
        raise ValueError(f"JSON family unit is not unique: {event_type}")
    selected, value = candidates[0]
    if criterion and isinstance(value.get("cells"), dict) and criterion in value["cells"]:
        selected += "/cells/" + criterion
    first, last = positions[selected]
    return selected, (text.count("\n", 0, first) + 1, text.count("\n", 0, last - 1) + 1)
