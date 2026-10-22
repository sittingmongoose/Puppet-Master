"""NieR registry entries for the 5.6 Pro chat hosted in PMConcept7 (the port's nier lane, 2026-10-22).

PMConcept7's menu cursor (the square beside the ink bar) and its target brackets on a chosen item come from build-time
selector lists in kit.d/19-nier-parts.js, which tools/nier_registry.py fills from each layer's NIER_ENTRIES
(Concepts/onboarding/opus-5.5/tools/build.py emit_nier_lists). This module is the chat's layer there: the hosted chat's
rows, menu items and tabs, every selector under .pm56-host so it can never reach a PMConcept7 element. The ink bar
itself is CSS (pm7-port/css/42-nier-parts.css), on the same list.

marker() is the text the chat layer leaves in the built page (pm7-port/tools/chat56_layer.py, the foundation lane's);
the entries are registered only while it is there, so a page without the chat publishes byte-identical lists.
"""
from __future__ import annotations

# the hosted chat's list rows, picker rows and menu items: the hovered or keyboard-focused one is the ink bar with the
# square cursor beside it (PMConcept7's cursor part)
_ROWS = ('.thread-row', '.model-row', '.effort-row', '.pm-tops-item', '.att-source-row', '.qs-mention-item', '.menu-item')

NIER_ENTRIES = {
    'cursor': [f'.pm56-host {s}' for s in _ROWS],
    # a thread row or a tab a click chooses: the brackets lock on for a moment (PMConcept7's chosen list)
    'chosen': ['.pm56-host .thread-row', '.pm56-host [role="tab"]'],
    # tabs sit in a horizontal strip: the cursor goes under them
    'strip': ['.pm56-host [role="tab"]'],
}

_FALLBACK = '\x00pm56-chat-layer-absent\x00'


def marker() -> str:
    """The chat layer's marker in the built page, or a string no page contains when that layer is not installed."""
    try:
        import chat56_layer  # noqa: WPS433  (the foundation lane's layer, beside this file)
    except ImportError:
        return _FALLBACK
    for name in ('JS_START', 'MARKER', 'CSS_START'):
        value = getattr(chat56_layer, name, None)
        if isinstance(value, str) and value:
            return value
    return _FALLBACK
