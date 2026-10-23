"""Hosted-only patch to pinned History's default width (the column lane, round 2, 2026-10-23, DL-233).

chat56_layer.py applies every pm7-port/tools/patches_*.py HOSTED_JS_PATCHES entry to the chat's script text before
bundling, in the hosted build only, and fails the build when an `old` string does not occur exactly `count` times; the
standalone (5.6 Pro/build.py) never reads this file.

Entries: (script, old, new, count).

1. history.js pinDefaultW() read the pinned drawer's default once, from <html>'s computed --ph-pin-w, and kept it.
   Hosted, history.css's :root block is scoped onto the chat's hosts, so <html> has no --ph-pin-w and the function fell
   back to its literal 200 for good, while the drawer itself follows the hosts' --ph-pin-w, which
   pm7-port/js/06-history-width.js now sets to the panel redesign's 240 (200 in a capped column under 540 px). The
   default feeds the open and close width locks of a pinned drawer, the separator's aria-valuenow and the keyboard
   resize's starting point, so it is read from the hosts (PM56_ROOT_STYLE) on every call: one inline style read.
2. history.js paneWidth() measured the assistant pane for the drawer's 42 % cap. Hosted, boot() restores the stored
   dragged width before Home has shown the column (the page ships #chatPanel hidden), so the pane measured 0, the cap
   fell to the 170 px floor and setWidth() saved 170 over the person's width: a dragged History width never survived a
   reload. A pane that cannot be measured now sets no cap; history.css still clamps the drawer to 42 % of the real
   pane once it is drawn, and the next drag or arrow key clamps in JS again. (The standalone's pane is always laid out
   at boot, so its behaviour is unchanged.)
"""
from __future__ import annotations

_OLD = """  function pinDefaultW(){
    if(pinDefault == null){
      var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ph-pin-w'));
      pinDefault = v > 0 ? Math.round(v) : 200;
    }
    return pinDefault;
  }"""

_NEW = """  function pinDefaultW(){
    var v = parseFloat(window.PM56_ROOT_STYLE.getPropertyValue('--ph-pin-w'));
    return v > 0 ? Math.round(v) : 200;
  }"""

_PANE_OLD = """  function paneWidth(){
    var pane = document.querySelector('.assistant-pane');
    return pane ? pane.getBoundingClientRect().width : window.innerWidth;
  }"""

_PANE_NEW = """  function paneWidth(){
    var pane = document.querySelector('.assistant-pane'), w = pane ? pane.getBoundingClientRect().width : 0;
    return w > 0 ? w : Infinity;
  }"""

HOSTED_JS_PATCHES = [
    ('history.js', _OLD, _NEW, 1),
    ('history.js', _PANE_OLD, _PANE_NEW, 1),
]
