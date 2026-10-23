"""Hosted-only patches for the chat's render cost in PMConcept7 (round 2 perf lane, perf-opus, 2026-10-23).

chat56_layer.py applies every pm7-port/tools/patches_*.py HOSTED_JS_PATCHES entry to the chat's script text before
bundling, in the hosted build only, and fails the build when an `old` string does not occur exactly `count` times; the
standalone (5.6 Pro/build.py) never reads this file. pm7-port/css/95-perf-scope.css is the other half.

Hosted, one style recalculation of a chat element costs about 45-90 us (PMConcept7's sheet: ~28,700 rules, ~740
selector attempts per element, measured with Chrome's selector stats), so a change that restyles the whole chat
(~1,400 elements in #pmRoot, ~1,300 more in an open History) costs 70-200 ms. Nothing here changes a value any rule
reads; it changes how often the browser has to recompute the elements that do not read it.

1. The stage's dock variables survive a re-render (app.js pmSyncAttrs). syncChatDock keeps --chat-dock-h,
   --thread-float-h, --decision-h and --lens-strip-h on .chat-stage's inline style, and the Ask Card's dock height
   (PM56_DOCK_H) puts its per-frame --decision-h on .chat-float. Neither element has a style attribute in the markup,
   so every renderApp's patch removed them, and syncChatChrome then wrote them back one at a time with a forced layout
   read between each write. Each removal and each write changed an inherited custom property on the stage, and every
   forced read then restyled the stage's whole subtree: three ~1,360-element recalculations per render, 190-217 ms
   (measured: one renderApp() on the int9 page, 2026-10-23). The same values are written back in the same task, so the
   removal never reached a painted frame; keeping them only drops the round trip. Any other attribute, and the style
   attribute of every other element, is still synced exactly as before.
2. The composer's and the activity bar's fitted tiers are in their markup (app.js renderComposer, renderActivityBar).
   syncComposerCompact and syncActivityCompact set .composer-box.is-compact and .activity-wrap.is-ab-compact /
   .is-ab-icon-only on the live elements, but the markup carries neither, so every patch took them off and
   syncChatChrome put them back later in the same render. In between, keepTopAfter restored the transcript's scroll
   against that transient layout: at a 400 px column the uncompacted composer is 11 px shorter, the transcript 11 px
   taller, and the restore landed 11 px short of the bottom, which the follow then glided back every work tick
   (questions-verify L3 reads the transcript within 2 px; measured on this branch with item 1 alone, 4/8). Before item
   1 the same render also wiped the stage's --thread-float-h, whose 44 px fallback padding hid the 11 px. The markup
   now carries the tier the last fit chose, so the patch leaves it alone and the fit only changes it when it should.

Entries: (script, old, new, count).
"""
from __future__ import annotations

HOSTED_JS_PATCHES = [
    ('app.js',
     "    for(const at of [...el.attributes]) if(!seen.has(at.name) && !(HOSTED && HOSTED_KEEP_ATTR.test(at.name) && "
     "!(at.name==='data-pm-hover-was-disabled' && !src.hasAttribute('disabled')))) el.removeAttribute(at.name);",
     "    for(const at of [...el.attributes]) if(!seen.has(at.name) && !(HOSTED && HOSTED_KEEP_ATTR.test(at.name) && "
     "!(at.name==='data-pm-hover-was-disabled' && !src.hasAttribute('disabled')))\n"
     "      && !(HOSTED && at.name==='style' && (el.classList.contains('chat-stage') || el.classList.contains('chat-float')))) "
     "el.removeAttribute(at.name);", 1),
    ('app.js', '<div class="composer-box" data-k="composer-box">',
     '<div class="composer-box${composerCompact?\' is-compact\':\'\'}" data-k="composer-box">', 1),
    ('app.js', '<div class="activity-wrap" data-k="activity-wrap">',
     '<div class="activity-wrap${abCompactTier>=1?\' is-ab-compact\':\'\'}${abCompactTier>=2?\' is-ab-icon-only\':\'\'}" data-k="activity-wrap">', 1),
]
