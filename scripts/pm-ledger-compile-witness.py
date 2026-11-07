#!/usr/bin/env python3
"""Deterministic compile witnesses for a v2 planning ledger.

Witness 1, repairs versus targets: every findings record that names a PlanUnit as repaired must have that unit
among the compile queue targets of the record's atoms, and (when --base is given) the unit must actually differ
from the base revision.

Witness 2, exact tokens: every exact token of a compiled atom must appear in the prose of at least one owner PlanUnit
the atom's queue item compiled into, and in at least one of those units' preserved_exact_tokens registries. Tokens
that appear only in companion outputs (schemas, fixtures) are reported as such, never counted as present in an owner unit.

Witness 3, registry hygiene: every entry in an owner unit's preserved_exact_tokens registry must occur in that unit's
own text (the registry line itself excluded), for every unit the compile targets.

All three witnesses are static text checks; they need no model and make no judgment about meaning.
Coverage is the set of atom-to-existing-owner mappings. When no atom reaches an owner, the result is vacuous, never pass,
even if nominal targets exist and their registries were checked. --allow-empty explicitly permits only that empty result.
A targeted owner unit with more than one independent definition, in one document or across documents, is a finding.
A targeted or repaired owner ID named in a form the witness does not parse as a definition is refused, never skipped.
Same-document DL-* repeats are disclosed with their titles; a repair compares every definition of its unit.
Reviewed held/ledger-retired token exemptions live in records/compile_witness_exemptions.jsonl. Each needs a matching
structured token_dispositions entry on the accepted ledger record it cites; missing, active or conflicting entries are refused.
Exit 0 for pass or explicit --allow-empty, 2 for findings/vacuity, 1 for input/read errors.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

# The one identifier grammar for owner headings, fenced declarations and repair sentences.
UNIT_ID_FORM = r"[A-Z0-9][A-Za-z0-9]*-\d+"
UNIT_HEAD = re.compile(r"^(#{2,4})\s+(" + UNIT_ID_FORM + r")\s*[-–—:]\s+(.*)$")
ANY_HEAD = re.compile(r"^(#{1,6})\s")
# C8-W1: an ATX heading may be indented up to three spaces, and its ID may be wrapped in **, __ or [ ]. Both are
# read only outside fences (a fenced line is code); column-0 headings keep their existing reading everywhere.
INDENTED_UNIT_HEAD = re.compile(r"^ {0,3}(#{2,4})[ \t]+(?:\*\*(" + UNIT_ID_FORM + r")\*\*|__(" + UNIT_ID_FORM + r")__|\[(" + UNIT_ID_FORM + r")\]|("
                                + UNIT_ID_FORM + r"))[ \t]*[-–—:][ \t]+(.*)$")
INDENTED_ANY_HEAD = re.compile(r"^ {1,3}(#{1,6})[ \t]")
# A setext underline: up to three spaces, then only = or only -.
SETEXT_UNDER = re.compile(r"^ {0,3}(=+|-+)[ \t]*$")
LIST_OR_QUOTE = re.compile(r"^ {0,3}([-*+]|\d{1,9}[.)])([ \t]|$)|^ {0,3}>")


def unit_head(line: str, fenced: bool = False):
    """(hashes, unit id, title) of a unit heading, or None. A fenced line is code, never a heading (C8-W2);
    indented and wrapped forms (C8-W1) are read like column-0 ones."""
    if fenced:
        return None
    m = UNIT_HEAD.match(line)
    if m:
        return m.group(1), m.group(2), m.group(3)
    m = INDENTED_UNIT_HEAD.match(line)
    if m:
        return m.group(1), next(g for g in m.group(2, 3, 4, 5) if g), m.group(6)
    return None


def any_head(line: str, fenced: bool = False):
    """The # run of any heading line, or None; a fenced line is code, never a heading."""
    if fenced:
        return None
    m = ANY_HEAD.match(line) or INDENTED_ANY_HEAD.match(line)
    return m.group(1) if m else None
UNIT_ID = re.compile(r"\b(" + UNIT_ID_FORM + r")\b")
CANDIDATE_ID = re.compile(r"\b([A-Z0-9]{2,5}-\d{2})\b")
RECORD_HEAD = re.compile(r"^Records?\s+\d", re.I)
REPAIRS = re.compile(r"\bRepairs\s+(.+?)(?:\.\s|\.$|,\s+which|,\s+whose|\s+and\s+section\b)", re.S)


def load_jsonl(path: Path, *, required=False) -> list[dict]:
    rows = []
    if not path.exists():
        if required:
            raise ValueError("required ledger input is missing: " + path.name)
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            row = json.loads(line)
            if type(row) is not dict:
                raise ValueError(f"{path}: JSONL records must be objects")
            rows.append(row)
    return rows


# A fenced declaration, bare or with matching YAML quotes.
PLAN_UNIT_ID = re.compile(r"""^\s*plan_unit_id:\s*(?:"(""" + UNIT_ID_FORM + r""")"|'(""" + UNIT_ID_FORM + r""")'|(""" + UNIT_ID_FORM + r"""))\s*$""")
PLAN_UNIT_LINE = re.compile(r"^\s*plan_unit_id\s*:")
# The ID itself, not a longer identifier that starts with it (AA-001.2, AA-001-2).
ID_HEAD = re.compile(r"^(#{1,6})\s+[\"'`]?(" + UNIT_ID_FORM + r")(?![.\w]|-\d)")
INDENTED_ID_HEAD = re.compile(r"^ {0,3}(#{1,6})[ \t]+(?:\*\*|__|\[)?[\"'`]?(" + UNIT_ID_FORM + r")(?![.\w]|-\d)")
# C8-W2: CommonMark fences. An opener is indented at most three spaces and is three or more backticks or tildes;
# a backtick opener's info string holds no backtick. The closer is the same character, at least as long, indented
# at most three spaces, with nothing after it but spaces. An unclosed fence runs to the end of the document.
FENCE_OPEN = re.compile(r"^( {0,3})(`{3,}|~{3,})(.*)$")


def declared_id(line: str):
    match = PLAN_UNIT_ID.match(line)
    return next((group for group in match.groups() if group), None) if match else None


# T49 (tool batch 3): CommonMark containers and HTML blocks. A list item's marker, and the HTML block starts
# (CommonMark 4.6, kinds 1-7) with the condition that ends each. A line inside an HTML block is raw HTML: never a
# heading or a fence opener.
LIST_ITEM = re.compile(r"^( {0,3})([-*+]|\d{1,9}[.)])([ \t]+|$)")
QUOTE_MARK = re.compile(r"^ {0,3}> ?")
HTML_BLOCK_TAGS = ("address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|"
                   "fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|"
                   "main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|"
                   "title|tr|track|ul")
HTML_ENDED = (   # kinds 1-5: the block runs to the first line holding the end marker (the start line included)
    (re.compile(r"^ {0,3}<(?:script|pre|style|textarea)(?=[ \t>]|$)", re.I), re.compile(r"</(?:script|pre|style|textarea)>", re.I)),
    (re.compile(r"^ {0,3}<!--"), re.compile(r"-->")),
    (re.compile(r"^ {0,3}<\?"), re.compile(r"\?>")),
    (re.compile(r"^ {0,3}<![A-Za-z]"), re.compile(r">")),
    (re.compile(r"^ {0,3}<!\[CDATA\["), re.compile(r"\]\]>")),
)
HTML_BLANK_ENDED = re.compile(r"^ {0,3}</?(?:" + HTML_BLOCK_TAGS + r")(?=[ \t]|/?>|$)", re.I)    # kind 6: to a blank line
# kind 7: a whole open or closing tag alone on its line, to a blank line; it cannot interrupt a paragraph
HTML_TAG_LINE = re.compile(r"^ {0,3}(?:<[A-Za-z][A-Za-z0-9-]*(?:[ \t]+[A-Za-z_:][A-Za-z0-9_.:-]*(?:[ \t]*=[ \t]*(?:[^ \t\"'=<>`]+|'[^']*'|\"[^\"]*\"))?)*[ \t]*/?>"
                           r"|</[A-Za-z][A-Za-z0-9-]*[ \t]*>)[ \t]*$")


def _indent(line: str) -> int:
    """Leading indentation in columns, tabs to 4-column stops as CommonMark counts them (T62)."""
    line = line.expandtabs(4)
    return len(line) - len(line.lstrip(" "))


# T62: a thematic break, and the lines that open a block of their own (so a column-0 line that is none of them, right
# after a paragraph line, is a lazy continuation of that paragraph)
THEMATIC = re.compile(r"^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$")


def _block_start(line: str) -> bool:
    return bool(any_head(line) or FENCE_OPEN.match(line) or LIST_ITEM.match(line) or QUOTE_MARK.match(line) or THEMATIC.match(line)
                or HTML_BLANK_ENDED.match(line) or any(begin.match(line) for begin, _ in HTML_ENDED))


def _item_content_column(item, line: str) -> int:
    """Where a list item's content starts: past the marker and its spaces (one space if the item is empty or the
    marker is followed by five or more spaces, which start indented code)."""
    gap = len(item.group(3).expandtabs(4))
    if not line[len(item.group(0)):].strip() or gap >= 5:
        gap = 1
    return len(item.group(1)) + len(item.group(2)) + gap


def _item_paragraph_open(lines: list[str], j0: int, column: int, upto: int) -> bool:
    """T86 (TOOLBATCH4 pre-check finding 3): whether the list item whose marker is line j0 (content column `column`)
    has a paragraph open after line upto - 1, by the CommonMark block rules over the item's lines: a blank line, a
    heading, a setext underline, a thematic break, a fence (and the lines inside it), an HTML block (to its blank line),
    indented code, and an empty item or block-quote marker leave none open; paragraph text, a nested item's or a block
    quote's text, and a lazy line after open paragraph text keep one open. Only an open paragraph continues lazily."""
    para, fence, html = False, None, False
    for k in range(j0, upto):
        raw = lines[k].expandtabs(4)
        if not raw.strip():
            para, html = False, False if fence is None else html
            continue
        if fence is not None:
            m = FENCE_OPEN.match(raw[column:] if _indent(raw) >= column else raw)
            if m and m.group(2)[0] == fence[0] and len(m.group(2)) >= fence[1] and not m.group(3).strip():
                fence = None
            continue
        if html:
            continue
        if k == j0:
            item = LIST_ITEM.match(raw)
            s = raw[len(item.group(0)):] if item else ''
            if not s.strip():
                para = False
                continue
            rel = 0
        else:
            ind = _indent(raw)
            if ind < column:
                # a line left of the item's content: only a lazy continuation of open paragraph text keeps the item
                s = raw.lstrip(' ')
                para = para and not _block_start(s) and not SETEXT_UNDER.match(s)
                continue
            s, rel = raw[column:], ind - column
        if rel >= 4 and not para:
            continue                                  # indented code
        if para and rel >= 4:
            continue                                  # (a paragraph's continuation line, however indented)
        m = FENCE_OPEN.match(s)
        if m and not (m.group(2)[0] == '`' and '`' in m.group(3)):
            fence, para = (m.group(2)[0], len(m.group(2))), False
            continue
        if para and SETEXT_UNDER.match(s):
            para = False
            continue
        if THEMATIC.match(s) or any_head(s):
            para = False
            continue
        if HTML_BLANK_ENDED.match(s) or any(begin.match(s) for begin, _ in HTML_ENDED) or (not para and HTML_TAG_LINE.match(s)):
            para, html = False, True
            continue
        nested = LIST_ITEM.match(s)
        if nested:
            para = bool(s[len(nested.group(0)):].strip()) and not _block_start(s[len(nested.group(0)):])
            continue
        quote = QUOTE_MARK.match(s)
        if quote:
            rest = s[len(quote.group(0)):]
            para = bool(rest.strip()) and not _block_start(rest)
            continue
        para = True
    return para


def list_item_column(lines: list[str], i: int):
    """The content column of the list item line i continues, or None (T49). Walks back over blank lines and lines
    indented past column 0 to the nearest list-item marker line; line i continues that item only when it is indented
    to at least the item's content column. T62 (REVIEW-etools-tb3-opus findings 3 and 4): any line between the item
    and line i that comes right after a blank line and sits left of the item's content column has ended the item
    (CommonMark: ' b' after a blank line under '- a' is a new paragraph, so a fence after it is top-level); a column-0
    line right after a non-blank line that opens no block of its own is a lazy continuation of the item's paragraph
    and does not end the walk; any other non-marker line at column 0 ends it. Tabs count to 4-column stops.
    T86: CommonMark continues only a paragraph lazily, so each column-0 line the walk passed must follow open paragraph
    text of the item (_item_paragraph_open); after indented code, a heading, a fence closer, an empty item, a setext
    underline, an HTML block or a thematic break it ends the item, and line i is outside it."""
    ind = _indent(lines[i])
    if ind == 0:
        return None
    for j in range(i - 1, -1, -1):
        line = lines[j]
        if not line.strip():
            continue
        item = LIST_ITEM.match(line.expandtabs(4))
        if item:
            column = _item_content_column(item, line.expandtabs(4))
            if column > ind:
                return None
            if any(lines[k].strip() and not lines[k - 1].strip() and _indent(lines[k]) < column for k in range(j + 1, i + 1)):
                return None
            for k in range(j + 1, i):
                if lines[k].strip() and _indent(lines[k]) == 0 and not _item_paragraph_open(lines, j, column, k):
                    return None
            return column
        if _indent(line) == 0:
            if j > 0 and lines[j - 1].strip() and not _block_start(line):
                continue
            return None
    return None


def blocks_in(lines: list[str]) -> dict:
    """Fenced and HTML blocks in document order, by the CommonMark rules (C8-W2, T49).

    fences: (opener, stop, closer): the content is lines opener+1 .. stop-1; closer is the closer's line, or None
    for a fence that ran to the end of the document or ended with its list item. A fence opener is indented at most
    three spaces, past the content column of the list item it is in (or on the item's own marker line), is three or
    more backticks or tildes, and a backtick opener's info string holds no backtick. The closer is the same character,
    at least as long, indented at most three spaces past that column, with nothing after it but spaces. A fence opened
    in a list item ends with the item, at the first non-blank line indented less than its content column; when that
    line is itself a fence closer (its closer less indented than its item), CommonMark opens a new fence there, at
    the outer level, and the pair is listed in 'outdented_closers'.
    html: (start, end), both lines included. An HTML block starts outside any fence (kind 7 not inside a paragraph)
    and runs to its end condition: kinds 1-5 the line holding the end marker, kinds 6 and 7 the line before the next
    blank line. It holds no fence and no heading."""
    fences, html, outdented = [], [], []
    lines = [line.expandtabs(4) for line in lines]   # (T62: tabs to 4-column stops, as CommonMark counts them)
    i, paragraph = 0, False
    while i < len(lines):
        line = lines[i]
        column, opening = None, None
        item = LIST_ITEM.match(line)
        if item and FENCE_OPEN.match(line[len(item.group(0)):]):
            column = len(item.group(0))
            opening = FENCE_OPEN.match(line[column:])
        else:
            inside = list_item_column(lines, i)
            if inside is not None:
                if _indent(line) <= inside + 3:
                    column, opening = inside, FENCE_OPEN.match(line[inside:])
            else:
                opening = FENCE_OPEN.match(line)
        if opening and not (opening.group(2)[0] == "`" and "`" in opening.group(3)):
            closer = re.compile(r"^ {0,3}" + re.escape(opening.group(2)[0]) + "{" + str(len(opening.group(2))) + r",}[ \t]*$")
            k, close = i + 1, None
            while k < len(lines):
                here = lines[k]
                if column is not None and here.strip() and _indent(here) < column:
                    if closer.match(here):
                        outdented.append((i, k))
                    break
                if closer.match(here[column:] if column is not None else here):
                    close = k
                    break
                k += 1
            fences.append((i, k, close))
            i = k + 1 if close is not None else k
            paragraph = False
            continue
        ended = next((done for begin, done in HTML_ENDED if begin.match(line)), None)
        if ended is not None or HTML_BLANK_ENDED.match(line) or (not paragraph and HTML_TAG_LINE.match(line)):
            k = i
            if ended is not None:
                # (T62, finding 5: the end condition is searched on the whole start line, as CommonMark does: '<!-->',
                # '<!--->' and '<?>' end on their own line)
                while k < len(lines) and not ended.search(lines[k]):
                    k += 1
                k = min(k, len(lines) - 1)
            else:
                while k + 1 < len(lines) and lines[k + 1].strip():
                    k += 1
            html.append((i, k))
            i, paragraph = k + 1, False
            continue
        # (T62, finding 3: only paragraph text keeps a paragraph open for kind 7's rule: a thematic break, an indented
        # code line outside a paragraph, a heading and a setext underline leave it closed)
        paragraph = bool(line.strip()) and not any_head(line) and not SETEXT_UNDER.match(line) and not THEMATIC.match(line) and (
            paragraph or _indent(line) < 4)
        i += 1
    return {"fences": fences, "html": html, "outdented_closers": outdented}


def fences_in(lines: list[str]) -> list[tuple[int, int]]:
    """Fenced blocks (C8-W2, T49; see blocks_in) as (opener, stop): the content is lines opener+1 .. stop-1, and
    stop is the closer's line when the fence has one."""
    return [(start, stop) for start, stop, _ in blocks_in(lines)["fences"]]


def html_lines_in(lines: list[str]) -> set[int]:
    """Every line inside an HTML block (T49)."""
    return {index for start, end in blocks_in(lines)["html"] for index in range(start, end + 1)}


def container_heading(lines: list[str], index: int):
    """(form, the line as the container shows it) when line index is inside a blockquote or a list item (T49), else
    None. A blockquote line loses its > markers; a list marker line loses its marker; a continuation line of a list
    item loses the item's content indentation."""
    line = lines[index].expandtabs(4)   # (T62: '>' then a tab, and tab-indented continuation lines)
    if QUOTE_MARK.match(line):
        while QUOTE_MARK.match(line):
            line = QUOTE_MARK.sub("", line, count=1)
        return "heading_in_blockquote", line
    item = LIST_ITEM.match(line)
    if item:
        return "heading_in_list_item", line[len(item.group(0)):]
    column = list_item_column(lines, index)
    if column is not None:
        return "heading_in_list_item", line[column:]
    return None


def unsupported_forms(text: str, ids: set[str]) -> list[dict]:
    """Headings and declarations that name one of ids in a form the witness does not parse as a definition.

    Supported: a level 2-4 heading 'ID <separator> title' and a fenced 'plan_unit_id: ID' line (bare or quoted).
    Anything else that names the ID that way is refused, never silently skipped: a heading without a separator,
    a level 1, 5 or 6 heading, or a plan_unit_id line the grammar cannot read or that sits outside a fence.
    DL-* IDs are not checked: they supply no owner evidence, and real addendum headings such as
    "## DL-059 to DL-065 ... Addendum" name decisions without defining them.
    """
    ids = {uid for uid in ids if not uid.startswith("DL-")}
    lines = text.splitlines()
    blocks = blocks_in(lines)
    fenced = set()
    for start, stop, _ in blocks["fences"]:
        fenced.update(range(start + 1, stop))
    html = {index for start, end in blocks["html"] for index in range(start, end + 1)}
    out = []
    def heading_id(line):
        head = ID_HEAD.match(line) or INDENTED_ID_HEAD.match(line)
        return head.group(2) if head and head.group(2) in ids else None
    # T49: a fence opened in a list item whose closer is less indented than the item: CommonMark ends the fence with
    # the item and opens a new one at the closer, so the lines after it are read two ways; refused when they name a
    # targeted ID as a heading or a declaration.
    for start, outer in blocks["outdented_closers"]:
        named = None
        for k in range(outer, len(lines)):
            named = heading_id(lines[k]) or (next((u for u in UNIT_ID.findall(lines[k]) if u in ids), None) if PLAN_UNIT_LINE.match(lines[k]) else None)
            if named:
                break
        if named:
            out.append({"unit": named, "form": "list_fence_closer_outdented", "line": outer + 1,
                        "text": lines[outer].strip(), "fence_opened_at": start + 1})
    for index, line in enumerate(lines):
        if index in html:
            # T49: an HTML block or comment is raw HTML to CommonMark; a unit heading inside one is refused
            head = unit_head(line)
            uid = heading_id(line) or (head[1] if head else None)
            if uid in ids:
                out.append({"unit": uid, "form": "heading_in_html_block", "line": index + 1, "text": line.strip()})
            continue
        if index not in fenced:
            # T49: a heading inside a blockquote or a list item (on its marker line or a continuation line) is
            # neither parsed as a unit nor skipped: refused
            inside = container_heading(lines, index)
            if inside:
                form, shown = inside
                uid = heading_id(shown.lstrip(" ")) if _indent(shown) <= 3 else None
                if uid:
                    out.append({"unit": uid, "form": form, "line": index + 1, "text": line.strip()})
                    continue
        head = None if index in fenced else ID_HEAD.match(line) or INDENTED_ID_HEAD.match(line)
        if head and head.group(2) in ids and not unit_head(line, index in fenced):
            level = len(head.group(1))
            form = "heading_without_separator" if 2 <= level <= 4 else "heading_level_" + str(level)
            out.append({"unit": head.group(2), "form": form, "line": index + 1, "text": line.strip()})
        if PLAN_UNIT_LINE.match(line):
            named = sorted(uid for uid in set(UNIT_ID.findall(line)) if uid in ids)
            parsed = declared_id(line)
            if named and (parsed is None or index not in fenced):
                out.append({"unit": named[0], "form": "unparsed_plan_unit_id_line" if parsed is None else "plan_unit_id_outside_fence",
                            "line": index + 1, "text": line.strip()})
        # C8-W1: a setext heading (a paragraph over an = or - underline) that names a targeted ID is refused.
        if index and index not in fenced and SETEXT_UNDER.match(line):
            start = index
            while start > 0 and lines[start - 1].strip() and start - 1 not in fenced and start - 1 not in html and not any_head(lines[start - 1]) \
                    and not FENCE_OPEN.match(lines[start - 1]) and not SETEXT_UNDER.match(lines[start - 1]):
                start -= 1
            paragraph = lines[start:index]
            front_matter = line.strip() == "---" and start == 1 and lines[0].strip() == "---"
            if paragraph and not LIST_OR_QUOTE.match(paragraph[0]) and not front_matter:
                named = sorted({uid for text in paragraph for uid in UNIT_ID.findall(text) if uid in ids})
                if named:
                    out.append({"unit": named[0], "form": "setext_heading", "line": start + 1, "text": " ".join(t.strip() for t in paragraph)})
    return out


def definitions_in(text: str) -> list[dict]:
    """Every independent definition occurrence, headings first, with its location.

    A heading is its line through the line before the next heading. The first fence declaring that heading's own ID
    inside its section (deeper subheadings included) is its metadata, not a second definition. Any other heading or
    declaring fence is independent, and a fence that declares several IDs is marked so uniqueness can refuse it.
    """
    lines = text.splitlines()
    fences, fenced = [], set()
    blocks = blocks_in(lines)
    for i, k, close in blocks["fences"]:
        # the opener, the content, and the closer when there is one (a fence that ended with its list item stops
        # before the line that ended it, which is read on its own: T49)
        last = close if close is not None else k - 1 if k < len(lines) else k
        fenced.update(range(i, last + 1))
        ids = [uid for uid in (declared_id(l) for l in lines[i + 1:k]) if uid]
        if ids:
            fences.append((i, last, ids))
    # T49: an HTML block's lines are raw HTML, never a heading
    fenced.update(index for start, end in blocks["html"] for index in range(start, end + 1))
    found, sections = [], {}
    i = 0
    while i < len(lines):
        m = unit_head(lines[i], i in fenced)
        if not m:
            i += 1
            continue
        hashes, uid, title = m
        j = i + 1
        while j < len(lines) and not any_head(lines[j], j in fenced):
            j += 1
        end = i + 1
        while end < len(lines) and (end in fenced or not any_head(lines[end]) or len(any_head(lines[end])) > len(hashes)):
            end += 1
        block = "\n".join(lines[i:j]).rstrip()
        found.append({"unit": uid, "form": "heading", "line_start": i + 1, "line_end": j, "text": block,
                      "title": title.strip()})
        sections.setdefault(uid, []).append([i, end, False, len(found) - 1, j])
        i = j
    for start, stop, ids in fences:
        for uid in ids:
            own = next((s for s in sections.get(uid, ()) if s[0] < start and stop <= s[1] and not s[2]), None) if len(ids) == 1 else None
            if own is not None:
                own[2] = True
                if start >= own[4]:
                    # Under a deeper subheading, outside the heading's own block: still this unit's metadata, so its
                    # registry is the unit's registry for witnesses 2 and 3.
                    heading = found[own[3]]
                    heading["text"] += "\n\n" + "\n".join(lines[start:stop + 1]).rstrip()
                    heading["metadata_fence_lines"] = [start + 1, min(stop + 1, len(lines))]
                continue
            found.append({"unit": uid, "form": "fence" if len(ids) == 1 else "multi_id_fence", "line_start": start + 1,
                          "line_end": min(stop + 1, len(lines)), "text": "\n".join(lines[start:stop + 1]).rstrip()})
    return found


def units_in(text: str) -> dict[str, dict]:
    """First block per unit id, for text evidence. Uniqueness is validated from definitions_in, never from this view."""
    out: dict[str, dict] = {}
    for definition in definitions_in(text):
        out.setdefault(definition["unit"], {key: definition[key] for key in ("line_start", "line_end", "text")})
    return out


def registry(block: str) -> list[str]:
    """preserved_exact_tokens as inline flow lists or block lists: every occurrence in the unit, in order.

    A unit's evidence includes its own metadata fence, wherever it sits in the section, so a second registry there
    is checked as well instead of hiding behind the first.
    """
    found = []
    for m in re.finditer(r"^\s*preserved_exact_tokens:\s*\[(.*?)\]\s*$", block, flags=re.S | re.M):
        parts = re.split(r",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", m.group(1))
        found.extend(p.strip().strip('"').strip("'") for p in parts if p.strip())
    for m in re.finditer(r"^\s*preserved_exact_tokens:\s*\n((?:\s+-\s.*\n?)+)", block, flags=re.M):
        found.extend(re.sub(r"^\s*-\s*", "", l).strip().strip('"').strip("'") for l in m.group(1).splitlines() if l.strip())
    return list(dict.fromkeys(found))


def prose(block: str) -> str:
    """Exclude the entire inline/block token registry from token evidence, and (T62, REVIEW-etools-tb3-opus finding 6)
    the lines of every HTML block or comment: CommonMark renders nothing of them, so a token only there is no prose."""
    raw = block.splitlines(keepends=True)
    html = html_lines_in([line.rstrip("\r\n") for line in raw])
    lines = [line for k, line in enumerate(raw) if k not in html]
    out, index = [], 0
    while index < len(lines):
        match = re.match(r"^[ \t]*preserved_exact_tokens:[ \t]*(.*)$", lines[index].rstrip("\r\n"))
        if not match:
            out.append(lines[index])
            index += 1
            continue
        tail = match.group(1).strip()
        index += 1
        if tail.startswith("["):
            while not tail.endswith("]") and index < len(lines):
                tail += lines[index].strip()
                index += 1
        elif not tail:
            while index < len(lines) and (not lines[index].strip() or re.match(r"^[ \t]*-[ \t]+", lines[index])):
                index += 1
    return "".join(out)


def strings(value, label, *, unique=False):
    if type(value) is not list or any(type(item) is not str or not item.strip() for item in value):
        raise ValueError(label + " must be a list of nonempty strings")
    if unique and len(set(value)) != len(value):
        raise ValueError(label + " contains duplicates")
    return value


def contained(root: Path, relative: str) -> Path:
    if type(relative) is not str or Path(relative).is_absolute():
        raise ValueError("expected a relative path: " + str(relative))
    path = (root / relative).resolve()
    if not path.is_relative_to(root):
        raise ValueError("path escapes its declared root: " + relative)
    return path


DISPOSITION_SCHEMA = "pm.ledger_token_disposition.v1"
DISPOSITION_VALUES = ("active", "held", "ledger_retired")


def dispositions_in(record, label):
    """Structured token_dispositions entries of one accepted ledger record."""
    entries = record.get("token_dispositions", [])
    if type(entries) is not list:
        raise ValueError(label + " token_dispositions must be a list")
    for entry in entries:
        if type(entry) is not dict or entry.get("schema_id") != DISPOSITION_SCHEMA:
            raise ValueError(label + " token_dispositions entries need schema_id " + DISPOSITION_SCHEMA)
        for key in ("queue_id", "atom_id", "token"):
            if type(entry.get(key)) is not str or not entry[key].strip():
                raise ValueError(label + " token disposition requires nonempty " + key)
        if not strings(entry.get("target_plan_unit_ids"), label + " disposition targets", unique=True):
            raise ValueError(label + " token disposition requires target_plan_unit_ids")
        if entry.get("disposition") not in DISPOSITION_VALUES:
            raise ValueError(label + " token disposition must be one of " + ", ".join(DISPOSITION_VALUES))
    return entries


def accepted_dispositions(ledger_dir):
    """Every accepted disposition in records/, so a conflict in any record is seen."""
    records = (ledger_dir / "records").resolve()
    found = []
    for path in sorted(records.rglob("*.jsonl")):
        if not path.resolve().is_relative_to(records):
            raise ValueError("ledger record escapes records/: " + path.name)
        if path.resolve() == records / "compile_witness_exemptions.jsonl":
            continue
        for row in load_jsonl(path):
            if row.get("status") == "accepted":
                found.extend(dispositions_in(row, path.name))
    return found


def token_exemptions(ledger_dir, items, atoms, units):
    """Reviewed, per-atom/per-owner exceptions; never a token-wide waiver."""
    rows = load_jsonl(ledger_dir / "records/compile_witness_exemptions.jsonl")
    indexed, ids, reports = {}, set(), []
    decided = accepted_dispositions(ledger_dir) if rows else []
    for row in rows:
        for key in ("exemption_id", "queue_id", "atom_id", "token", "reason", "reviewed_by", "review_ref"):
            if type(row.get(key)) is not str or not row[key].strip():
                raise ValueError("token exemption requires nonempty " + key)
        if row.get("schema_id") != "pm.ledger_compile_witness_exemption.v1" or row.get("disposition") not in ("held", "ledger_retired"):
            raise ValueError("token exemption needs v1 schema and held/ledger_retired disposition")
        if row["exemption_id"] in ids:
            raise ValueError("duplicate exemption_id: " + row["exemption_id"])
        ids.add(row["exemption_id"])
        item = items.get(row["queue_id"])
        atom = atoms.get(row["atom_id"])
        if item is None or atom is None or row["atom_id"] not in item["atom_targets"] or row["token"] not in atom.get("exact_tokens", []):
            raise ValueError("stale or unknown exemption queue/atom/token: " + row["exemption_id"])
        targets = strings(row.get("target_plan_unit_ids"), "exemption targets", unique=True)
        owners = {uid for uid in item["atom_targets"][row["atom_id"]] if not uid.startswith("DL-") and uid in units}
        if not targets or not set(targets) <= owners:
            raise ValueError("exemption targets must be existing owner units of that atom: " + row["exemption_id"])
        ref_path, separator, record_id = row["review_ref"].partition("#")
        if not separator or not record_id or not ref_path.startswith("records/") or not ref_path.endswith(".jsonl") or ref_path == "records/compile_witness_exemptions.jsonl":
            raise ValueError("review_ref must cite another ledger record as records/file.jsonl#id")
        reference = contained(ledger_dir, ref_path)
        if (not reference.is_relative_to((ledger_dir / "records").resolve()) or
                reference == (ledger_dir / "records/compile_witness_exemptions.jsonl").resolve()):
            raise ValueError("review_ref must remain in records/ and cannot certify its own exemption file")
        reviews = [record for record in load_jsonl(reference)
                   if record_id in [record.get(key) for key in ("correction_id", "decision_id", "question_id", "review_id")]]
        if len(reviews) != 1:
            raise ValueError("review_ref must resolve to exactly one ledger record: " + row["review_ref"])
        review = reviews[0]
        linked = set(strings(review.get("source_atom_ids", []), "review source_atom_ids")) | set(strings(review.get("linked_atom_ids", []), "review linked_atom_ids")) | {review.get("atom_id")}
        reviewed_tokens = strings(review.get("exact_tokens", []), "review exact_tokens")
        if review.get("status") != "accepted" or row["atom_id"] not in linked or row["token"] not in reviewed_tokens:
            raise ValueError("review_ref must be accepted and name the exact atom and token: " + row["exemption_id"])
        same_token = [entry for entry in dispositions_in(review, row["review_ref"]) if entry["atom_id"] == row["atom_id"] and entry["token"] == row["token"]]
        cited = [entry for entry in same_token if entry["queue_id"] == row["queue_id"] and set(entry["target_plan_unit_ids"]) == set(targets)]
        if len(cited) != 1:
            raise ValueError("review_ref needs exactly one structured token_dispositions entry for this queue item, atom, token and exact target scope: " + row["exemption_id"])
        if cited[0]["disposition"] == "active":
            raise ValueError("accepted disposition keeps this token active: " + row["exemption_id"])
        if cited[0]["disposition"] != row["disposition"]:
            raise ValueError("exemption disposition differs from its accepted record: " + row["exemption_id"])
        conflicts = [entry for entry in decided if entry["atom_id"] == row["atom_id"] and entry["token"] == row["token"] and
                     entry["disposition"] != row["disposition"] and set(entry["target_plan_unit_ids"]) & set(targets)]
        if conflicts:
            raise ValueError("another accepted record gives this token a different disposition: " + row["exemption_id"])
        for uid in targets:
            key = (row["queue_id"], row["atom_id"], row["token"], uid)
            if key in indexed:
                raise ValueError("overlapping token exemptions: " + row["exemption_id"])
            indexed[key] = row["exemption_id"]
        reports.append({**row, "accepted_disposition": cited[0]})
    return indexed, reports


def records_in(findings_md: str) -> list[dict]:
    out = []
    for sec in re.split(r"^##\s+", findings_md, flags=re.M)[1:]:
        head, _, body = sec.partition("\n")
        if not RECORD_HEAD.match(head.strip()):
            continue
        rep = REPAIRS.search(body)
        named_units = sorted(set(UNIT_ID.findall(rep.group(1)))) if rep else []
        named_docs = sorted(set(re.findall(r"\b([A-Z][A-Za-z]+_[A-Za-z0-9_]+)\b", rep.group(1)))) if rep else []
        out.append({"heading": head.strip(), "candidate_ids": sorted(set(CANDIDATE_ID.findall(head))),
                    "named_units": named_units, "named_documents": named_docs, "has_repairs_sentence": bool(rep)})
    return out


def git_show(root: Path, rev: str, path: str) -> str | None:
    listed = subprocess.run(["git", "--literal-pathspecs", "-C", str(root), "ls-tree", "--name-only", "-z", rev, "--", path], capture_output=True, text=True)
    if listed.returncode:
        raise ValueError("cannot inspect base document: " + path)
    if not listed.stdout:
        return None
    result = subprocess.run(["git", "-C", str(root), "show", f"{rev}:{path}"], capture_output=True, text=True)
    if result.returncode:
        raise ValueError("cannot read existing base document: " + path)
    return result.stdout


def run(root: Path, ledger_dir: Path, base: str | None = None, *, allow_empty=False) -> dict:
    root, ledger_dir = Path(root).resolve(), Path(ledger_dir)
    ledger_dir = (ledger_dir if ledger_dir.is_absolute() else root / ledger_dir).resolve()
    if type(allow_empty) is not bool:
        raise ValueError("allow_empty must be an explicit boolean")
    if base is not None and (type(base) is not str or not base.strip()):
        raise ValueError("--base must name a nonempty Git revision")
    if base:
        revision = subprocess.run(["git", "-C", str(root), "rev-parse", "--verify", "--end-of-options", base + "^{commit}"], capture_output=True, text=True)
        if revision.returncode:
            raise ValueError("--base must resolve to a Git commit in --root")
    queue = json.loads((ledger_dir / "state/compile_queue.json").read_text(encoding="utf-8"))
    if type(queue) is not dict or type(queue.get("items", [])) is not list:
        raise ValueError("compile queue must be an object with an items list")
    atoms = {}
    for atom in load_jsonl(ledger_dir / "records/design_atoms.jsonl", required=True):
        aid = atom.get("atom_id")
        if type(aid) is not str or not aid or aid in atoms:
            raise ValueError("design atoms require unique nonempty atom_id values")
        strings(atom.get("exact_tokens", []), aid + " exact_tokens", unique=True)
        atoms[aid] = atom
    corrections = load_jsonl(ledger_dir / "records/corrections.jsonl")
    findings_path = ledger_dir / "source_shards/findings.md"
    findings_md = findings_path.read_text(encoding="utf-8") if findings_path.exists() else ""
    docs, items, atom_targets = set(), {}, {}
    for field in ("canonical_plan_targets", "compiled_owner_docs"):
        docs.update(strings(queue.get(field, []), field))
    for index, item in enumerate(queue.get("items", []), 1):
        if type(item) is not dict:
            raise ValueError("queue items must be objects")
        qid = item.get("queue_id", "item-" + str(index))
        if type(qid) is not str or not qid or qid in items:
            raise ValueError("queue items require unique queue_id values")
        source_atoms = strings(item.get("source_atom_ids", []), qid + " source_atom_ids", unique=True)
        if any(aid not in atoms for aid in source_atoms):
            raise ValueError("queue item names an unknown atom: " + qid)
        targets = strings(item.get("target_plan_unit_ids", []), qid + " target_plan_unit_ids", unique=True)
        mapping = item.get("atom_target_plan_unit_ids")
        if mapping is not None:
            if type(mapping) is not dict or set(mapping) != set(source_atoms):
                raise ValueError("atom_target_plan_unit_ids must map every source atom exactly once: " + qid)
            for aid, owned in mapping.items():
                strings(owned, aid + " targets", unique=True)
                if not set(owned) <= set(targets):
                    raise ValueError("atom targets must be a subset of the queue item's targets: " + aid)
        else:
            mapping = {aid: list(targets) for aid in source_atoms}
        items[qid] = {"targets": targets, "atom_targets": mapping}
        for aid, owned in mapping.items():
            atom_targets.setdefault(aid, set()).update(owned)
        for field in ("target_docs", "canonical_plan_targets", "compiled_owner_docs"):
            docs.update(strings(item.get(field, []), qid + " " + field))
        if item.get("target_doc"):
            docs.update(strings([item["target_doc"]], qid + " target_doc"))
    docs = sorted(d for d in docs if d.endswith(".md"))
    declared = set().union(*(set(item["targets"]) for item in items.values()))
    records = records_in(findings_md)
    repair_named = set().union(*(set(record["named_units"]) for record in records))
    units, placed, occurrences, config_findings, unsupported = {}, {}, {}, [], []
    for doc in docs:
        path = contained(root, doc)
        if not path.is_file():
            config_findings.append({"kind": "missing_owner_document", "path": doc})
            continue
        text = path.read_text(encoding="utf-8")
        for definition in definitions_in(text):
            uid = definition["unit"]
            placed.setdefault(uid, []).append({"path": doc, **{key: definition[key] for key in ("form", "line_start", "line_end")},
                                               **({"title": definition["title"]} if "title" in definition else {})})
            units.setdefault(uid, {key: definition[key] for key in ("line_start", "line_end", "text")})
            occurrences.setdefault(uid, []).append(definition["text"])
        # A targeted or repaired ID named in a form the witness does not parse is refused, never skipped.
        unsupported.extend({"path": doc, **form} for form in unsupported_forms(text, declared | repair_named))
    for form in unsupported:
        config_findings.append({"kind": "unsupported_owner_definition_form", **form})
    repeated_decisions = []
    for uid in sorted(declared & placed.keys()):
        # DL-* units supply no owner evidence, and a Decision Log may carry a log entry and a PlanUnit under one number.
        same_file_counts = not uid.startswith("DL-") and (len(placed[uid]) > 1 or placed[uid][0]["form"] == "multi_id_fence")
        if same_file_counts or len({place["path"] for place in placed[uid]}) > 1:
            config_findings.append({"kind": "ambiguous_owner_unit", "unit": uid, "definitions": placed[uid]})
    for uid in sorted((declared | repair_named) & placed.keys()):
        # The same-document exception is disclosed, with each definition, so a reused number is visible.
        if uid.startswith("DL-") and len(placed[uid]) > 1 and len({place["path"] for place in placed[uid]}) == 1:
            # Case, punctuation and a trailing reference list such as "(J-1, J-2)" do not distinguish titles;
            # whether two remaining titles name one decision needs review.
            titles = {re.sub(r"[^0-9a-z]+", "", re.sub(r"\s*\([^()]*\)\s*$", "", place["title"]).casefold())
                      for place in placed[uid] if place.get("title")}
            repeated_decisions.append({"unit": uid, "path": placed[uid][0]["path"], "definitions": placed[uid],
                                       "titles_differ": len(titles) > 1})
    for uid in sorted(declared - units.keys()):
        config_findings.append({"kind": "missing_target_unit", "unit": uid})
    base_units, base_occurrences = {}, {}
    if base:
        for doc in docs:
            text = git_show(root, base, doc)
            if text is not None:
                for definition in definitions_in(text):
                    base_units.setdefault(definition["unit"], {key: definition[key] for key in ("line_start", "line_end", "text")})
                    base_occurrences.setdefault(definition["unit"], []).append(definition["text"])
    cand_atoms = {}
    for correction in corrections:
        for candidate in re.split(r"\s*\+\s*|,\s*", str(correction.get("finding_id", ""))):
            if candidate.strip():
                cand_atoms.setdefault(candidate.strip(), set()).update(correction.get("source_atom_ids", correction.get("linked_atom_ids", [])))
    # The ledger's own candidate IDs (record headings and correction finding IDs) share the unit grammar.
    candidates = set(cand_atoms) | set().union(*(set(record["candidate_ids"]) for record in records))
    known = units.keys() | base_units.keys() | declared
    w1 = []
    for record in records:
        linked = set().union(*(cand_atoms.get(cid, set()) for cid in record["candidate_ids"]))
        targets = set().union(*(atom_targets.get(aid, set()) for aid in linked))
        # Only a ledger candidate ID that names no unit is set aside, whatever its digit count; any other ID that
        # resolves to nothing stays named, so it fires as not targeted.
        unresolved_candidates = sorted(uid for uid in record["named_units"] if uid not in known and uid in candidates)
        named_units = sorted(set(record["named_units"]) - set(unresolved_candidates))
        not_targeted = sorted(set(named_units) - targets)
        # Every occurrence is compared: a repair is unchanged only when no definition of the unit changed.
        unchanged, changed_occurrences = [], {}
        for uid in named_units:
            if not (base and uid in units and uid in base_occurrences):
                continue
            now, before = occurrences.get(uid, []), base_occurrences[uid]
            changed = [{**place, "occurrence": index + 1} for index, place in enumerate(placed.get(uid, []))
                       if index >= len(before) or now[index] != before[index]]
            if now == before:
                unchanged.append(uid)
            elif len(now) > 1 or len(before) > 1:
                changed_occurrences[uid] = changed or [{"removed_occurrences": len(before) - len(now)}]
        w1.append({"record": record["heading"], "candidate_ids": record["candidate_ids"], "atoms": sorted(linked),
                   "queue_targets": sorted(targets), "named_units": named_units,
                   "unresolved_candidate_ids": unresolved_candidates, "unresolved_short_ids": unresolved_candidates,
                   "named_but_unresolved": sorted(uid for uid in named_units if uid not in known),
                   "named_documents": record["named_documents"],
                   "named_but_not_targeted": not_targeted, "named_but_unchanged_since_base": unchanged,
                   "changed_occurrences": changed_occurrences,
                   "unmatched_record": not linked and bool(record["candidate_ids"]), "fires": bool(not_targeted or unchanged)})
    exemptions, exemption_records = token_exemptions(ledger_dir, items, atoms, units)
    companion_text = ""
    for output in strings(queue.get("compiled_plan_outputs", []), "compiled_plan_outputs"):
        path = contained(root, output)
        if path.is_file() and path.suffix == ".json":
            companion_text += path.read_text(encoding="utf-8", errors="replace")
    w2, uncompiled_atoms, compiled_mappings = [], [], []
    for qid, item in items.items():
        for aid, targets in item["atom_targets"].items():
            owners = sorted(uid for uid in targets if not uid.startswith("DL-") and uid in units)
            if not owners:
                uncompiled_atoms.append({"queue_id": qid, "atom": aid})
                continue
            compiled_mappings.append({"queue_id": qid, "atom": aid, "owner_units": owners})
            regs = {uid: registry(units[uid]["text"]) for uid in owners}
            bodies = {uid: prose(units[uid]["text"]) for uid in owners}
            for token in atoms[aid].get("exact_tokens", []):
                exempt = {uid: exemptions[(qid, aid, token, uid)] for uid in owners if (qid, aid, token, uid) in exemptions}
                required = sorted(set(owners) - exempt.keys())
                in_prose = [uid for uid in required if token in bodies[uid]]
                in_registry = [uid for uid in required if token in regs[uid]]
                same_unit = sorted(set(in_prose) & set(in_registry))
                fully_exempt = not required
                w2.append({"queue_id": qid, "atom": aid, "token": token, "owner_units": owners,
                           "required_owner_units": required, "exempt_owner_units": exempt, "exempted": fully_exempt,
                           "units_with_token_in_prose": in_prose, "units_with_token_in_registry": in_registry,
                           "units_with_both": same_unit,
                           "in_companion_outputs_only": bool(required) and not in_prose and token in companion_text,
                           "fires": not fully_exempt and not same_unit})
    w3 = []
    for uid in sorted(declared & units.keys()):
        if uid.startswith("DL-"):
            continue
        reg = registry(units[uid]["text"])
        missing = [token for token in reg if token not in prose(units[uid]["text"])]
        prior_missing = None
        if base and uid in base_units:
            prior_missing = [token for token in registry(base_units[uid]["text"]) if token not in prose(base_units[uid]["text"])]
        w3.append({"unit": uid, "registry_entries": len(reg), "entries_absent_from_unit_text": missing,
                   "absent_already_at_base": sorted(set(missing) & set(prior_missing)) if prior_missing is not None else None,
                   "fires": bool(missing)})
    fires1, fires2, fires3 = [[row for row in witness if row["fires"]] for witness in (w1, w2, w3)]
    # Coverage is what actually compiled. A nominal target or an empty hygiene row is not compilation evidence.
    vacuous = not compiled_mappings
    vacuity_reason = None if not vacuous else "no_owner_targets" if not declared else "no_atom_reaches_an_owner"
    findings = bool(config_findings or fires1 or fires2 or fires3)
    status = ("vacuous_with_findings" if vacuous else "findings") if findings else (
        "vacuous_allowed_by_--allow-empty" if allow_empty else "vacuous") if vacuous else "pass"
    active = [row for row in w2 if not row["exempted"]]
    return {"schema_id": "pm.ledger_compile_witness.v2", "ledger_id": ledger_dir.name, "base": base, "documents": docs,
            "witness_repairs_vs_targets": w1, "witness_exact_tokens": w2, "witness_registry_hygiene": w3,
            "token_exemptions": exemption_records, "configuration_findings": config_findings,
            "repeated_decision_units": repeated_decisions,
            "atom_owner_mappings": compiled_mappings, "atoms_without_owner_targets": uncompiled_atoms,
            "vacuous": vacuous, "vacuity_reason": vacuity_reason, "allow_empty": bool(allow_empty),
            "summary": {"records": len(w1), "records_firing": len(fires1), "named_but_not_targeted": sum(len(r["named_but_not_targeted"]) for r in w1),
                        "named_but_unchanged_since_base": sum(len(r["named_but_unchanged_since_base"]) for r in w1),
                        "declared_target_plan_units": len(declared), "registries_checked": len(w3),
                        "repeated_decision_units": len(repeated_decisions),
                        "repeated_decision_units_with_different_titles": sum(row["titles_differ"] for row in repeated_decisions),
                        "unsupported_definition_forms": len(unsupported),
                        "atoms_reaching_an_owner": len({row["atom"] for row in compiled_mappings}),
                        "item_tokens": len(w2), "item_tokens_exempted": len(w2) - len(active),
                        "tokens_missing_from_prose": sum(not row["units_with_token_in_prose"] for row in active),
                        "tokens_missing_from_registry": sum(not row["units_with_token_in_registry"] for row in active),
                        "tokens_only_in_companion_outputs": sum(row["in_companion_outputs_only"] for row in active),
                        "units_with_registry_entries_absent_from_text": len(fires3),
                        "registry_entries_absent_from_text": sum(len(row["entries_absent_from_unit_text"]) for row in w3),
                        "registry_entries_absent_already_at_base": sum(len(row["absent_already_at_base"] or []) for row in w3)},
            "status": status}


def self_test(*, scratch=None):
    from pm_ledger_compile_witness_traps import exercise
    return exercise(sys.modules[__name__], scratch=scratch)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("ledger_dir", nargs="?", help="ledger directory containing state/ and records/")
    parser.add_argument("--root", default=str(Path.cwd()), help="owner-document root (default: current directory)")
    parser.add_argument("--base", default=None, help="git revision to compare edited units against (for example origin/main)")
    parser.add_argument("--json", action="store_true", help="print the full JSON report instead of the summary")
    parser.add_argument("--allow-empty", action="store_true", help="permit an explicitly labelled vacuous result; never waive findings")
    parser.add_argument("--self-test", action="store_true", help="run the portable regression corpus")
    parser.add_argument("--scratch", type=Path, help="self-test scratch parent (default: OS temporary directory)")
    args = parser.parse_args(argv)
    if args.self_test == bool(args.ledger_dir):
        parser.error("choose exactly one ledger directory or --self-test")
    if args.scratch is not None and not args.self_test:
        parser.error("--scratch requires --self-test")
    root = Path(args.root).resolve()
    try:
        if args.self_test:
            report = self_test(scratch=args.scratch)
        else:
            ledger_dir = Path(args.ledger_dir)
            if not ledger_dir.is_absolute():
                ledger_dir = root / ledger_dir
            report = run(root, ledger_dir, args.base, allow_empty=args.allow_empty)
    except (OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        if args.json:
            print(json.dumps({"schema_id": "pm.ledger_compile_witness.v2", "status": "error", "error": str(exc)}, indent=2))
        else:
            print("error: " + str(exc), file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    elif args.self_test:
        print(f"compile witness self-test: {report['status']} ({report['caught']}/{len(report['tests'])})")
    else:
        s = report["summary"]
        print(f"{report['ledger_id']}: {report['status']}")
        print(f"  coverage: {s['atoms_reaching_an_owner']} atoms reach an owner ({len(report['atoms_without_owner_targets'])} queue mappings do not); {s['declared_target_plan_units']} declared targets; {s['registries_checked']} owner registries checked; {s['item_tokens_exempted']} item tokens explicitly exempted")
        if report["vacuous"]:
            print(f"  vacuous: {report['vacuity_reason']}")
        for repeat in report["repeated_decision_units"]:
            print(f"  disclosed: {repeat['unit']} is defined {len(repeat['definitions'])} times in {repeat['path']}" +
                  (" under different titles " + str([d.get('title') for d in repeat['definitions']]) if repeat["titles_differ"] else ""))
        for finding in report["configuration_findings"]:
            print("    - " + str(finding))
        print(f"  witness 1 repairs vs targets: {s['records_firing']} of {s['records']} records fire; named-but-not-targeted {s['named_but_not_targeted']}; named-but-unchanged {s['named_but_unchanged_since_base']}")
        for r in report["witness_repairs_vs_targets"]:
            if r["fires"]:
                print(f"    - {r['record'][:70]}: not targeted {r['named_but_not_targeted']} unchanged {r['named_but_unchanged_since_base']}")
        print(f"  witness 2 exact tokens: {s['item_tokens']} item tokens; missing from every owner unit's prose {s['tokens_missing_from_prose']} (of which only in companion outputs {s['tokens_only_in_companion_outputs']}); missing from every owner registry {s['tokens_missing_from_registry']}")
        per: dict[str, list[str]] = {}
        for r in report["witness_exact_tokens"]:
            if not r["exempted"] and not r["units_with_token_in_prose"]:
                per.setdefault(",".join(r["owner_units"]), []).append(r["token"])
        for owners, toks in sorted(per.items()):
            print(f"    - {owners}: not in prose {toks}")
        print(f"  witness 3 registry hygiene: {s['units_with_registry_entries_absent_from_text']} units carry registry entries absent from their own text ({s['registry_entries_absent_from_text']} entries; {s['registry_entries_absent_already_at_base']} already absent at base)")
        for r in report["witness_registry_hygiene"]:
            if r["fires"]:
                print(f"    - {r['unit']}: {r['entries_absent_from_unit_text']}" + (f" (already at base: {r['absent_already_at_base']})" if r["absent_already_at_base"] else ""))
    return 0 if report["status"] in ("pass", "vacuous_allowed_by_--allow-empty") else 2


if __name__ == "__main__":
    sys.exit(main())
