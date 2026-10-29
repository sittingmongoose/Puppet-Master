"""Hosted-only patches for what the chat writes on the page's root (the port's fix lane, 2026-10-22).

chat56_layer.py applies HOSTED_CSS_PATCHES to the chat's stylesheets before scoping and HOSTED_JS_PATCHES to its scripts
before bundling, in the hosted build only, and fails the build when an `old` string does not occur exactly `count`
times; the standalone (5.6 Pro/build.py) never reads this file. pm7-port/js/05-page-root.js is the other half.

1. Rules on body:has(...): a divider drag (styles.css) and an editor revealed beside History (transcript-records.css);
   the two for a transient Activity Detail (activity-panel.css) went with that small form (DL-254). A :has() on
   <body> is checked again on every insertion anywhere in the page, and in PMConcept7 each check restyled the chat's
   hosts (about 890 elements, 50-70 ms a time, several times a second while a reply streams: chat patches, the
   hover-tag census, the dashboard's live widgets). Hosted they read body[data-pm56-drag] and
   [data-pm56-editor-revealed], which 05-page-root.js keeps current; the scoper keeps body state on body, so they stay
   body[...] .pm56-host ...
2. Custom properties written on <html>: --tx-hold-min (every frame of a turn's room hold, turn-stream.js), History's
   --ph-x, -y, -h, -pane and --ph-user-w (history.js), the Ask Card's --qs-ask-room (questions.js) and the dividers'
   --editor-w, --history-w, --activity-w (app.js). Every element of PMConcept7 inherits them, so each write restyled
   the whole page, and PMConcept7's Usage board re-fits every card whenever <html>'s style changes (its look key reads
   html[style]): 2.9 s of a 24 s live turn. Hosted they go to PM56_ROOT_STYLE, which writes them on the chat's hosts.
3. The Ask Card's dock height (questions.js setAskDock): --decision-h is read only by .chat-float, but trackAskDock wrote it
   on .chat-stage on every frame of a card's open or close morph (up to 1.2 s), and an inherited custom property
   changed on the stage restyled all of it each frame (about 900 elements, ~60 ms a frame hosted), so the close that
   clears the question ran ~1.2 s instead of ~0.5 s (Questions C*c / Q9 read it at 1.22 s). Hosted, the per-frame value
   goes on .chat-float alone and the settled one on the stage (PM56_DOCK_H, 05-page-root.js).
4. History's close (history.js closeDrawer) removed the drawer on a fixed timer (its motion time + 30 ms). Hosted, the
   first frame of the exit commits about 400 ms after the click (the click's own sync() and the next heartbeat force
   ~95 ms style and layout flushes each against PMConcept7's tree), so the timer fired with the transform transition
   still pending and the drawer vanished without moving. Hosted, the close finishes on the drawer's own transform
   transitionend, with the timer as a fallback (motion time + 600 ms; 30 ms when motion is off), and only while that
   same close is still the drawer's current one.

Entries: (file, old, new, count).
"""
from __future__ import annotations

_ROOT = 'window.PM56_ROOT_STYLE'

HOSTED_CSS_PATCHES = [
    ('styles.css', 'body:has(.resizer.dragging), body:has(.panel-resize.dragging) {', 'body[data-pm56-drag] {', 1),
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
    ('questions.js', '  function setAskDock(shell) {', '  function setAskDock(shell, frame) {', 1),
    ('questions.js', "    stage.style.setProperty('--decision-h', Math.round(h) + 'px');",
     "    window.PM56_DOCK_H(stage, Math.round(h) + 'px', frame);", 1),
    ('questions.js', '      setAskDock(shell);\n      if (shell[flag] && performance.now() - start < limit) requestAnimationFrame(tick);',
     '      setAskDock(shell, true);\n      if (shell[flag] && performance.now() - start < limit) requestAnimationFrame(tick);', 1),
    ('history.js', '    closeTimer = setTimeout(finishClose, ms + 30);',
     "    (function (fl) {\n"
     "      var my = fl.__pm56Close = (fl.__pm56Close || 0) + 1, done = false;\n"
     "      var fin = function (e) {\n"
     "        if (e && (e.target !== fl || e.propertyName !== 'transform')) return;\n"
     "        if (done) return; done = true;\n"
     "        fl.removeEventListener('transitionend', fin);\n"
     "        if (fl.__pm56Close !== my || !closing) return;\n"
     "        clearTimeout(closeTimer); finishClose();\n"
     "      };\n"
     "      fl.addEventListener('transitionend', fin);\n"
     "      closeTimer = setTimeout(fin, ms ? ms + 600 : 30);\n"
     "    })(el);", 1),
]
