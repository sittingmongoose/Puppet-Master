"""Physical JSON and Markdown bounds for exact family evidence."""

from __future__ import annotations

import json
import re
from collections.abc import Set
from functools import lru_cache

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


_EVENT_NAME = r"[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+"
_EVENT_TOKEN = re.compile(r"(?<![\w.])" + _EVENT_NAME + r"(?!\w|\.\w)")
_MARKDOWN_HEADING = re.compile(r"^#{1,6}\s+(.+)")
_EXCLUSIVE_OWNER = re.compile(
    r"(?:source and event custody contract for|exact-family physical source contract for|an exact read-only historical)"
    r"\s+`?(" + _EVENT_NAME + r")(?!\w|\.\w)"
)
_EVENT_TABLE_ROW = re.compile(r"^\s*\|\s*`(" + _EVENT_NAME + r")`\s*\|")

_GOAL_OWNER_ROUTING = re.compile(
    r"Routing note, \d{4}-\d{2}-\d{2}: the `(" + _EVENT_NAME + r")` row of "
    r"`Plans/event_family_registry\.json` keeps this section as its `semantic_owner_doc`"
)

_RETENTION_ASSIGNMENT_START = "Current selected assignment ("
_RETENTION_ASSIGNMENT = re.compile(
    r"Current selected assignment \(\d{4}-\d{2}-\d{2}\): (" + _EVENT_NAME + r")@\d+\.\d+\.\d+"
    r" is registered for \w+ in Plans/event_family_registry\.json, as recorded by "
    r"Plans/Decision_Log\.md#DL-\d+\. Its event history selects RP-[A-Z0-9-]+@\d+\.\d+\.\d+\b"
)
_PARAGRAPH_BREAK = re.compile(r"^\s*(?:$|```|#{1,6}\s|[a-z][\w-]*:\s|Current selected assignment \()")


@lru_cache(maxsize=1)
def registered_semantic_owners(registry_text: str) -> dict[str, str | None]:
    return {row["event_type"]: row.get("semantic_owner_doc") for row in json.loads(registry_text)["families"]}


def _retention_assignment_at(lines: list[str], first_line: int, quote_lines: tuple[int, int],
                             event_type: str) -> tuple[int, int] | None:
    """Verify the assignment paragraph containing the located retention quotation."""
    quote_start, quote_end = quote_lines
    for start, line in enumerate(lines, first_line):
        if start > quote_end:
            break
        if not line.lstrip().startswith(_RETENTION_ASSIGNMENT_START):
            continue
        stop = start - first_line + 1
        while stop < len(lines) and not _PARAGRAPH_BREAK.match(lines[stop]):
            stop += 1
        end = first_line + stop - 1
        if end < quote_start:
            continue
        paragraph = " ".join(" ".join(lines[start - first_line:stop]).split())
        match = _RETENTION_ASSIGNMENT.match(paragraph)
        if match is None:
            continue
        if not start <= quote_start <= quote_end <= end:
            raise ValueError(f"Markdown evidence crosses a retention assignment subject boundary for {event_type}")
        if match[1] != event_type:
            raise ValueError(f"Markdown evidence subject is {match[1]}, expected {event_type}")
        return start, end
    return None


def markdown_family_span(text: str, span: tuple[int, int], event_type: str, known_events: Set[str],
                         criterion: str | None, quote: str | None, *,
                         quote_lines: tuple[int, int] | None = None,
                         selected_semantic_owner: bool = False) -> tuple[int, int]:
    """Bind proof to a family-specific paragraph, owner heading, or oracle row."""
    lines = text.splitlines()[span[0] - 1:span[1]]
    if criterion == "retention" and quote_lines is not None:
        assignment = _retention_assignment_at(lines, span[0], quote_lines, event_type)
        if assignment is not None:
            return assignment
    heading_number, heading = next(
        ((number, match[1]) for number, line in enumerate(lines, span[0]) if (match := _MARKDOWN_HEADING.match(line))),
        (span[0], ""),
    )
    subjects = set(_EVENT_TOKEN.findall(heading)) & (known_events | {event_type})
    if not subjects:
        # Custody headings can use a display name. Their owner declaration
        # names the exact event before later cross-references to peer families.
        subjects = set(_EXCLUSIVE_OWNER.findall("\n".join(lines))) & (known_events | {event_type})
    if subjects and event_type not in subjects:
        raise ValueError(f"Markdown evidence subject is {', '.join(sorted(subjects))}, expected {event_type}")

    if heading == "Goal and GoalRun payload minima" and criterion in ("owner_doc", "positive_negative_oracles"):
        if selected_semantic_owner and criterion == "owner_doc" and quote_lines is not None:
            first, last = quote_lines
            match = _GOAL_OWNER_ROUTING.match(lines[first - span[0]].lstrip())
            if (first == last and match and match[1] == event_type
                    and match[0] in " ".join((quote or "").split())):
                return first, last
        matches = [number for number, line in enumerate(lines, span[0])
                   if (match := _EVENT_TABLE_ROW.match(line)) and match[1] == event_type]
        if (criterion == "owner_doc" and len(matches) == 1
                and (quote or "").strip() == lines[heading_number - span[0]].strip()):
            # The heading is the cited anchor when its table explicitly names
            # this family, including a historical selector superseded in the registry.
            return heading_number, heading_number
    elif heading.endswith("deck-2 owner contract") and criterion == "positive_negative_oracles" and (quote or "").strip() == "Oracles:":
        matches = [number for number, line in enumerate(lines, span[0])
                   if line.lstrip().startswith("Oracles:") and event_type in _EVENT_TOKEN.findall(line)]
    else:
        return span
    if len(matches) != 1:
        raise ValueError(f"Markdown evidence has no unique family-specific subject row for {event_type}")
    return matches[0], matches[0]
