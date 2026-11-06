"""Hosted-only patch to the chat's activity bar fit (the Pod/bar repair, 2026-10-23).

chat56_layer.py applies every pm7-port/tools/patches_*.py HOSTED_JS_PATCHES entry to the chat's script text before
bundling, in the hosted build only, and fails the build when an `old` string does not occur exactly `count` times; the
standalone (5.6 Pro/build.py) never reads this file.

Entries: (script, old, new, count).

1. The bar's own padding and border count when it is fitted (app.js activityRowWidth). syncActivityCompact keeps the
   labelled bar while the items' widths and gaps fit the wrap's content box, but the bar is a box of its own around
   them (4 px padding and a 1 px border a side, 10 px across), and with max-width 100% and overflow-x auto it then
   scrolls by up to those 10 px instead of dropping to its compact tier. Hosted, under NieR's Pod (the wrap keeps
   40 px clear a side for it), the Deep Plan thread's labelled bar landed in that band in a 1440 and a 1512 window
   (neon-verify 18: "bar overflows 10 px", and its clipped last item's box reached 1 px under the Pod). The row width
   now includes the bar's inline padding and borders, so the labelled tier is kept only when the whole bar fits.

Retired 2026-11-06 (FO-76): app.js no longer sums the items. syncActivityCompact reads the border box of a hidden
max-content copy of the bar (renderActivityBar's sizer), which already holds the bar's padding and borders, in the
standalone and the hosted build alike, so this file has nothing left to patch.
"""
from __future__ import annotations

HOSTED_JS_PATCHES: list = []
