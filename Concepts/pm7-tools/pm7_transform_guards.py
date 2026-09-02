"""Shared fail-closed source/effect guards for the PM7 generated tail.

These helpers inspect authored HTML/JS source only.  They do not claim rendered
pixel equality, production-runtime behavior, or custody over the standalone
Chat and Settings prototypes.
"""

from __future__ import annotations

import re


PROTECTED_BLOCK_IDS = (
    "pm4-settings-css",
    "pm7-settings-data",
    "pm4-settings-js",
    "pm6-css-chat",
    "pm6-js-chat-data",
    "pm6-js-chat",
)

PROTECTED_ELEMENT_IDENTITIES = (
    ("id", "tab-settings"),
    ("id", "projectSettingsModal"),
    ("id", "panel-settings"),
    ("id", "chat-panel"),
    ("id", "chatResizer"),
    ("id", "chatPanel"),
    ("id", "floatingChat"),
    ("id", "pm6WizPrdChat"),
    ("data-ab-id", "chat"),
)


def _whole_owner_block(doc, block_id, need, stage):
    pattern = re.compile(
        r'<(?P<tag>style|script)\b(?=[^>]*\bid="' + re.escape(block_id)
        + r'")[^>]*>.*?</(?P=tag)>',
        re.S | re.I,
    )
    matches = list(pattern.finditer(doc))
    need(len(matches) == 1, "%s: protected owner block %s count %d" % (stage, block_id, len(matches)))
    return matches[0].group(0)


def _balanced_element(doc, attr_name, attr_value, need, stage):
    opening = re.compile(
        r'<(?P<tag>[A-Za-z][A-Za-z0-9:-]*)\b(?=[^>]*\b'
        + re.escape(attr_name) + r'="' + re.escape(attr_value) + r'")[^>]*>',
        re.S,
    )
    matches = list(opening.finditer(doc))
    need(
        len(matches) == 1,
        "%s: protected element %s=%s count %d" % (stage, attr_name, attr_value, len(matches)),
    )
    match = matches[0]
    tag = match.group("tag")
    if match.group(0).rstrip().endswith("/>"):
        return match.group(0)
    token_pattern = re.compile(r'</?' + re.escape(tag) + r'\b[^>]*>', re.S | re.I)
    depth = 0
    for token in token_pattern.finditer(doc, match.start()):
        source = token.group(0)
        if source.startswith("</"):
            depth -= 1
            if depth == 0:
                return doc[match.start():token.end()]
        elif not source.rstrip().endswith("/>"):
            depth += 1
    need(False, "%s: protected element %s=%s is unbalanced" % (stage, attr_name, attr_value))
    return ""


def _context_owner_band(doc, need, stage):
    anchor = "  /* U11 context module, mounted into every Assistant header. */"
    starts = [match.start() for match in re.finditer(re.escape(anchor), doc)]
    need(len(starts) == 1, "%s: Assistant context owner anchor count %d" % (stage, len(starts)))
    end_pattern = re.compile(r"^  window\.PM7_CONTEXT = \{[^\n]+\};\s*$", re.M)
    ends = [match for match in end_pattern.finditer(doc, starts[0])]
    need(len(ends) == 1, "%s: Assistant context owner terminal count %d" % (stage, len(ends)))
    return doc[starts[0]:ends[0].end()]


def capture_protected_sources(doc, need, stage):
    """Capture exact embedded PM7 Settings/Assistant source-owner slices."""
    captured = {}
    for block_id in PROTECTED_BLOCK_IDS:
        captured["owner_block:" + block_id] = _whole_owner_block(doc, block_id, need, stage)
    for attr_name, attr_value in PROTECTED_ELEMENT_IDENTITIES:
        captured["element:%s=%s" % (attr_name, attr_value)] = _balanced_element(
            doc, attr_name, attr_value, need, stage
        )
    captured["assistant_context_owner_band"] = _context_owner_band(doc, need, stage)
    return captured


def assert_protected_sources_equal(before, after, need, stage):
    before_keys = tuple(before)
    after_keys = tuple(after)
    need(before_keys == after_keys, "%s: protected source inventory changed" % stage)
    changed = [key for key in before if before[key] != after[key]]
    need(not changed, "%s: protected source slices changed: %s" % (stage, ", ".join(changed)))
    return {
        "comparison": "exact source equality for each named slice, transform input versus output",
        "result": "pass",
        "slice_ids": list(before_keys),
        "scope_limit": "named embedded PMConcept7 sources; not rendered pixels or standalone prototypes",
    }


def _script_sources(doc):
    sources = []
    pattern = re.compile(r'<script\b(?P<attrs>[^>]*)>(?P<body>.*?)</script>', re.S | re.I)
    for match in pattern.finditer(doc):
        attrs = match.group("attrs")
        if re.search(r'\btype="application/json"', attrs, re.I):
            continue
        sources.append(match.group("body"))
    return "\n".join(sources)


def _normalized_expression(value):
    return re.sub(r"\s+", "", value.strip())


def capture_effect_surfaces(doc):
    """Return syntactic effect-owner sets from executable script blocks."""
    source = _script_sources(doc)
    command_ids = set(re.findall(r"['\"](cmd\.[a-z0-9][a-z0-9_.-]*)['\"]", source, re.I))
    domain_event_ids = set()
    for name in ("usageEvent", "viewAction", "emit", "sub"):
        pattern = re.compile(r"(?:\b|\.)" + name + r"\(\s*(['\"])(.*?)\1", re.S)
        domain_event_ids.update(match.group(2) for match in pattern.finditer(source))
    domain_event_ids.update(
        match.group(2)
        for match in re.finditer(r"new\s+CustomEvent\(\s*(['\"])(.*?)\1", source, re.S)
    )
    dom_event_types = set(
        match.group(2)
        for match in re.finditer(
            r"\.(?:addEventListener|removeEventListener)\(\s*(['\"])(.*?)\1", source, re.S
        )
    )
    persistence_targets = set()
    for match in re.finditer(
        r"\b(localStorage|sessionStorage)\.(setItem|removeItem)\(\s*([^,\n\)]+)", source
    ):
        persistence_targets.add(
            "%s.%s:%s" % (match.group(1), match.group(2), _normalized_expression(match.group(3)))
        )
    for match in re.finditer(r"\b(localStorage|sessionStorage)\.clear\(\s*\)", source):
        persistence_targets.add("%s.clear:*" % match.group(1))
    for match in re.finditer(r"\b(indexedDB)\.(open|deleteDatabase)\(\s*([^,\n\)]+)", source):
        persistence_targets.add(
            "%s.%s:%s" % (match.group(1), match.group(2), _normalized_expression(match.group(3)))
        )
    for match in re.finditer(r"\b(STORE\.set|rawStoreSet)\(\s*([^,\n\)]+)", source):
        persistence_targets.add("%s:%s" % (match.group(1), _normalized_expression(match.group(2))))
    return {
        "command_ids": command_ids,
        "domain_event_ids": domain_event_ids,
        "dom_event_types": dom_event_types,
        "persistence_targets": persistence_targets,
    }


def assert_effect_delta(before, after, allowed, need, stage):
    receipt = {"baseline": "previous transform output"}
    for category in ("command_ids", "domain_event_ids", "dom_event_types", "persistence_targets"):
        actual = {
            "added": sorted(after[category] - before[category]),
            "removed": sorted(before[category] - after[category]),
        }
        expected = allowed.get(category, {"added": [], "removed": []})
        expected = {
            "added": sorted(expected.get("added", [])),
            "removed": sorted(expected.get("removed", [])),
        }
        need(actual == expected, "%s: %s delta %r != %r" % (stage, category, actual, expected))
        receipt[category] = actual
    return receipt
