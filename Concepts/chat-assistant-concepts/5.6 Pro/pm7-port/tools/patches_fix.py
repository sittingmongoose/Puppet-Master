"""Hosted-only patches for what the chat writes on the page's root (the port's fix lane, 2026-10-22).

chat56_layer.py applies HOSTED_CSS_PATCHES to the chat's stylesheets before scoping and HOSTED_JS_PATCHES to its scripts
before bundling, in the hosted build only, and fails the build when an `old` string does not occur exactly `count`
times; the standalone (5.6 Pro/build.py) never reads this file. pm7-port/js/05-page-root.js is the other half.

1. Four rules on body:has(...): a divider drag (styles.css), a transient Activity Detail (activity-panel.css, two rules)
   and an editor revealed beside History (transcript-records.css). A :has() on <body> is checked again on every
   insertion anywhere in the page, and in PMConcept7 each check restyled the chat's hosts (about 890 elements, 50-70 ms
   a time, several times a second while a reply streams: chat patches, the hover-tag census, the dashboard's live
   widgets). Hosted they read body[data-pm56-drag], [data-pm56-activity-transient] and [data-pm56-editor-revealed],
   which 05-page-root.js keeps current; the scoper keeps body state on body, so they stay body[...] .pm56-host ...
2. Custom properties written on <html>: --tx-hold-min (every frame of a turn's room hold, turn-stream.js), History's
   --ph-x, -y, -h, -pane and --ph-user-w (history.js), the Ask Card's --qs-ask-room (questions.js) and the dividers'
   --editor-w, --history-w, --activity-w (app.js). Every element of PMConcept7 inherits them, so each write restyled
   the whole page, and PMConcept7's Usage board re-fits every card whenever <html>'s style changes (its look key reads
   html[style]): 2.9 s of a 24 s live turn. Hosted they go to PM56_ROOT_STYLE, which writes them on the chat's hosts.

Entries: (file, old, new, count).
"""
from __future__ import annotations

_ROOT = 'window.PM56_ROOT_STYLE'

HOSTED_CSS_PATCHES = [
    ('styles.css', 'body:has(.resizer.dragging), body:has(.panel-resize.dragging) {', 'body[data-pm56-drag] {', 1),
    ('activity-panel.css', 'body:has(.activity-panel.transient) .assistant-grid {',
     'body[data-pm56-activity-transient] .assistant-grid {', 1),
    ('activity-panel.css', 'body:has(.activity-panel.transient) .history-flyout {',
     'body[data-pm56-activity-transient] .history-flyout {', 1),
    ('transcript-records.css', 'body:has(.workspace.editor-revealed) .history-flyout{',
     'body[data-pm56-editor-revealed] .history-flyout{', 1),
]

HOSTED_JS_PATCHES = [
    ('turn-stream.js', "document.documentElement.style.removeProperty('--tx-hold-min')",
     _ROOT + ".removeProperty('--tx-hold-min')", 1),
    ('turn-stream.js', "document.documentElement.style.setProperty('--tx-hold-min'",
     _ROOT + ".setProperty('--tx-hold-min'", 1),
    ('history.js', 'var s = document.documentElement.style;', 'var s = ' + _ROOT + ';', 1),
    ('history.js', "document.documentElement.style.setProperty('--ph-user-w'", _ROOT + ".setProperty('--ph-user-w'", 2),
    ('questions.js', "if (root.style.getPropertyValue('--qs-ask-room') !== v) root.style.setProperty('--qs-ask-room', v);",
     'if (' + _ROOT + ".getPropertyValue('--qs-ask-room') !== v) " + _ROOT + ".setProperty('--qs-ask-room', v);", 1),
    ('app.js', "document.documentElement.style.setProperty('--", _ROOT + ".setProperty('--", 3),
    ('app.js', "getComputedStyle(document.documentElement).getPropertyValue('--ph-user-w')",
     _ROOT + ".getPropertyValue('--ph-user-w')", 1),
]
