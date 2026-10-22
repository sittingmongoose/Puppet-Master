"""Hosted-only patches to the chat's own NieR stylesheets (the port's nier lane, 2026-10-22).

chat56_layer.py applies every pm7-port/tools/patches_*.py HOSTED_CSS_PATCHES entry to the chat's stylesheet text before
scoping, in the hosted build only, and fails the build when an `old` string does not occur exactly `count` times; the
standalone (5.6 Pro/build.py) never reads this file, so it keeps its own look.

Entries: (stylesheet, old, new, count).

1. The run-view head is not a dialog band. pmxView draws its head as <header class="pmx-view-head drawer-head">, so the
   headers part's ink title band for dialogs and menus (nier-parts.css: the band, its paper text forced on every
   descendant with `color: inherit !important`, the caps title, the transparent buttons) painted every Crew, Room and
   BrainStorm run-view head as a full parchment band: the carry-over's four or five spacing flags per view. Hosted, the
   band skips .pmx-view-head; pm7-port/css/41-nier-headers.css gives that head PMConcept7's NieR header instead.
"""
from __future__ import annotations

_BAND = 'html[data-o55-nier-parts~="headers"] .drawer-head'

HOSTED_CSS_PATCHES = [
    ('nier-parts.css', _BAND, _BAND + ':not(.pmx-view-head)', 7),
]
