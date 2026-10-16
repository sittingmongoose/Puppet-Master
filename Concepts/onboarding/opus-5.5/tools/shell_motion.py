"""Shell motion fixes (pm7-motion-shell, 2026-10-16): guarded, exactly-once patches on the pinned base page.

They answer the final motion QA (share/puppet-master/2026-10-16-motion-pass/JUDGEMENT.md) for the shell's own code:
the status bar's hover tags (A16) and the page switch (A1, A2). build.py applies PATCHES after its own patch lists,
so every anchor here is the text those lists leave.
"""
from __future__ import annotations

STATUS_BAR = [
    # A16: every status bar item named itself with a fragment of its own text and the tag engine's generic detail
    # ("Home / Choose this option.", "10m ago / Choose this option."). Each item now says what it shows or does.
    ('<button type="button" class="pm7-statusitem" data-status-action="system" title="Open system status">',
     '<button type="button" class="pm7-statusitem" data-status-action="system" title="Open system status"'
     ' data-pm-hover-label="System status" data-pm-hover-detail="Everything Puppet Master needs is running. Click to see each service.">',
     'status bar tag: system'),
    ('<span class="pm7-statusitem" title="Project root">',
     '<span class="pm7-statusitem" title="Project root" data-pm-hover-label="Project folder"'
     ' data-pm-hover-detail="Where this Project\\\'s files are kept on this computer.">',
     'status bar tag: project folder'),
    ('<button type="button" class="pm7-statusitem" data-status-action="source" title="Source control">',
     '<button type="button" class="pm7-statusitem" data-status-action="source" title="Source control"'
     ' data-pm-hover-label="Source control" data-pm-hover-detail="The branch you are working on. Click to see its state.">',
     'status bar tag: source control'),
    ('<span class="pm7-statusitem" data-status-priority="medium">Up to date · <strong>7048acf</strong></span>',
     '<span class="pm7-statusitem" data-status-priority="medium" data-pm-hover-label="Up to date"'
     ' data-pm-hover-detail="Your work matches its online copy. 7048acf names the latest saved version.">'
     'Up to date · <strong>7048acf</strong></span>',
     'status bar tag: up to date'),
    ('<span class="pm7-statusitem" data-status-priority="low">Plan index <strong>current</strong></span>',
     '<span class="pm7-statusitem" data-status-priority="low" data-pm-hover-label="Plan index"'
     ' data-pm-hover-detail="The plan\\\'s index matches its documents.">Plan index <strong>current</strong></span>',
     'status bar tag: plan index'),
    ('<button type="button" class="pm7-statusitem" data-status-action="snapshot" data-status-priority="medium">',
     '<button type="button" class="pm7-statusitem" data-status-action="snapshot" data-status-priority="medium"'
     ' data-pm-hover-label="Snapshot" data-pm-hover-detail="When your work was last kept as a safe point. Click to see it.">',
     'status bar tag: snapshot'),
    # The page label keeps its live text ("Home", "Usage", ...) as the tag's name.
    ("'<span class=\"pm7-statusitem\" data-status-page><strong>Home</strong></span>' +",
     "'<span class=\"pm7-statusitem\" data-status-page data-pm-hover-detail=\"The page you are on.\"><strong>Home</strong></span>' +",
     'status bar tag: page'),
]

HOVER_TAGS = [
    # A16: an item added to the status bar later (NieR's readouts, the Liquid Glass button) still never falls through
    # to the generic detail.
    ("    if(el&&el.matches&&el.matches('[role=\"tab\"],[data-page]'))return ['', 'Show this page.'];\n",
     "    if(el&&el.closest&&el.closest('#pm7GlobalStatusBar'))return ['',el.matches('button,[role=\"button\"]')?'Click to see the details.':'Shows the latest known state.'];   /* O55 */\n"
     "    if(el&&el.matches&&el.matches('[role=\"tab\"],[data-page]'))return ['', 'Show this page.'];\n",
     'hover tag: status bar detail'),
    # A16: a tag never covers a primary action (the chat's Send). It slides off it sideways, or goes to the other
    # side of its control; with no free place left it stays shut (its description is still read out). A control can
    # opt in as a primary action with the class pm-hover-avoid.
    ("    left=clamp(left,viewport.left+marginX,viewportRight-marginX-rect.width);\n"
     "    top=clamp(top,viewport.top+marginY,viewportBottom-marginY-rect.height);\n"
     "    this.tag.style.left=Math.round(left)+'px';this.tag.style.top=Math.round(top)+'px';this.tag.setAttribute('data-placement',placement);\n",
     "    left=clamp(left,viewport.left+marginX,viewportRight-marginX-rect.width);\n"
     "    top=clamp(top,viewport.top+marginY,viewportBottom-marginY-rect.height);\n"
     "    var avoided=avoidPrimary(this.active,this.root||this.tag,left,top,rect,anchor,viewport,marginX,marginY);   /* O55: never over Send */\n"
     "    if(avoided){left=avoided.left;top=avoided.top;if(avoided.placement)placement=avoided.placement;}\n"
     "    this.tag.style.visibility=avoided&&avoided.shut?'hidden':'';\n"
     "    this.tag.style.left=Math.round(left)+'px';this.tag.style.top=Math.round(top)+'px';this.tag.setAttribute('data-placement',placement);\n",
     'hover tag: avoid primary actions'),
    ("  HoverTagController.prototype.position=function(){\n",
     "  var PRIMARY_CLASSES=['pm6-chat-send','pmw-sc-send','pm6-wiz-send','pm-hover-avoid'];\n"
     "  function avoidPrimary(active,tagRoot,left,top,rect,anchor,viewport,marginX,marginY){\n"
     "    var nodes=[],boxes=[];PRIMARY_CLASSES.forEach(function(c){var l=document.getElementsByClassName(c);for(var k=0;k<l.length;k++)nodes.push(l[k]);});   /* live lists: no document-wide selector match */\n"
     "    for(var i=0;i<nodes.length;i++){var n=nodes[i];if(n===active||n.contains(active)||active.contains(n))continue;var b=n.getBoundingClientRect();if(!(b.width>0&&b.height>0))continue;\n"
     "      var stack=document.elementsFromPoint(b.left+b.width/2,b.top+b.height/2),front=null;\n"
     "      for(var s=0;s<stack.length;s++)if(!(tagRoot&&tagRoot.contains(stack[s]))){front=stack[s];break;}\n"
     "      if(front&&(front===n||n.contains(front)))boxes.push(b);}   /* only an action on screen (under the tag itself or not), not one under the composer */\n"
     "    if(!boxes.length)return null;\n"
     "    var PAD=6,w=rect.width,h=rect.height,minX=viewport.left+marginX,maxX=viewport.left+viewport.width-marginX-w,minY=viewport.top+marginY,maxY=viewport.top+viewport.height-marginY-h;\n"
     "    function hit(l,t){for(var j=0;j<boxes.length;j++){var b=boxes[j];if(l<b.right+PAD&&l+w>b.left-PAD&&t<b.bottom+PAD&&t+h>b.top-PAD)return b;}return null;}\n"
     "    if(!hit(left,top))return null;\n"
     "    function slide(dir){var l=left;for(var k=0;k<boxes.length+1;k++){var b=hit(l,top);if(!b)return l;l=dir<0?b.left-PAD-w:b.right+PAD;}return NaN;}\n"
     "    var other=anchor.top-h-GAP>=minY&&top>anchor.top?{top:anchor.top-h-GAP,placement:'above'}:{top:anchor.bottom+GAP,placement:'below'};\n"
     "    var tries=[{left:slide(-1),top:top},{left:slide(1),top:top},{left:left,top:other.top,placement:other.placement}];\n"
     "    tries=tries.filter(function(c){return c.left===c.left&&c.left>=minX-0.5&&c.left<=maxX+0.5&&c.top>=minY-0.5&&c.top<=maxY+0.5&&!hit(c.left,c.top);});\n"
     "    tries.sort(function(a,b){return Math.abs(a.left-left)+Math.abs(a.top-top)-Math.abs(b.left-left)-Math.abs(b.top-top);});\n"
     "    return tries.length?tries[0]:{left:left,top:top,shut:true};\n"
     "  }\n"
     "  HoverTagController.prototype.position=function(){\n",
     'hover tag: primary action boxes'),
]

# The host item's markup is the Home layer's (home_layer.py renames it and checks its own text in the page), so its tag
# words are set when the bar is installed rather than written into that markup.
STATUS_BAR.append(
    ("    } else if (bar.parentNode !== shell) shell.appendChild(bar);\n",
     "    } else if (bar.parentNode !== shell) shell.appendChild(bar);\n"
     "    var hostItem = bar.querySelector('[data-status-item=\"host\"]');   /* O55: the host item's tag (A16) */\n"
     "    if (hostItem && !hostItem.hasAttribute('data-pm-hover-label')) {\n"
     "      hostItem.setAttribute('data-pm-hover-label', 'Where it runs');\n"
     "      hostItem.setAttribute('data-pm-hover-detail', 'The computer Puppet Master runs on, and how quickly it answers.');\n"
     "    }\n",
     'status bar tag: host'))
THEME = [
    # B4: the theme menu answers first (its radio or row paints on the next frame) and the repaint follows in the next
    # task, once (src/js/12-theme-transition.js).
    ("        window.PM7_SETTINGS_TOME.setChromeThemeMode(seg.getAttribute('data-mode-value'));\n"
     "        return; /* mode is a filter, not a final pick: menu stays open */\n",
     "        var modeValue = seg.getAttribute('data-mode-value');   /* O55: the radio answers first (B4) */\n"
     "        menu.querySelectorAll('.pm6-tt-mode').forEach(function (b) { b.setAttribute('aria-checked', b === seg ? 'true' : 'false'); });\n"
     "        if (window.PM_THEME_TRANSITION) window.PM_THEME_TRANSITION(function () { window.PM7_SETTINGS_TOME.setChromeThemeMode(modeValue); });\n"
     "        else window.PM7_SETTINGS_TOME.setChromeThemeMode(modeValue);\n"
     "        return; /* mode is a filter, not a final pick: menu stays open */\n",
     'theme menu: mode answers first'),
    ("      window.PM7_SETTINGS_TOME.setChromeThemeFamily(row.getAttribute('data-family'));\n"
     "      tbMenuClose(menu);\n",
     "      var familyValue = row.getAttribute('data-family');   /* O55: the row answers first (B4) */\n"
     "      menu.querySelectorAll('.pm6-tt-family').forEach(function (r) { var on = r === row; r.classList.toggle('is-selected', on); r.setAttribute('aria-checked', on ? 'true' : 'false'); });\n"
     "      if (window.PM_THEME_TRANSITION) window.PM_THEME_TRANSITION(function () { window.PM7_SETTINGS_TOME.setChromeThemeFamily(familyValue); });\n"
     "      else window.PM7_SETTINGS_TOME.setChromeThemeFamily(familyValue);\n"
     "      tbMenuClose(menu);\n",
     'theme menu: family answers first'),
]

THEME.append(
    # B4: the theme's search-width kick announced a resize inside the attribute observer, so every resize listener of
    # the page measured the half-restyled page there (the tab ink, the rail, Chat, Usage: two to four extra forced
    # style passes, 300-500 ms on the P1000). The listeners still hear it once, after the new look has painted.
    ("    new MutationObserver(function (muts) {\n"
     "      for (var i = 0; i < muts.length; i++) {\n"
     "        if (muts[i].attributeName === 'data-theme') { kickSearchDensity(); break; }\n"
     "      }\n",
     "    var kickPending = false;   /* O55: once, after the new look's frame (B4) */\n"
     "    new MutationObserver(function (muts) {\n"
     "      for (var i = 0; i < muts.length; i++) {\n"
     "        if (muts[i].attributeName === 'data-theme') {\n"
     "          if (!kickPending) { kickPending = true; requestAnimationFrame(function () { setTimeout(function () { kickPending = false; kickSearchDensity(); }, 0); }); }\n"
     "          break;\n"
     "        }\n"
     "      }\n",
     'theme: search-width kick after the frame'))

PAGES = [
    # A1: a page changed under a cover that is about to leave (onboarding's Enter) changes at once; the cover's exit is
    # the only transition (src/js/74-screens-ready.js openWizard({under})).
    ("      if (changed && bootPaintDone && !reduced() && oldP && newP && oldP !== newP) {\n",
     "      if (changed && bootPaintDone && !reduced() && !window.PM_PAGES.instant && oldP && newP && oldP !== newP) {   /* O55: instant under a cover */\n",
     'page switch: instant under a cover'),
    # A2: under Reduced Motion (and under a cover) the page swaps at once and arrives whole: the Wizard's stage and the
    # Orchestrator's widgets used to fade up from nothing over the bare wallpaper. Their entrances are finished in the
    # frame that first draws the page (getAnimations brings its style up to date first), so that frame is the end state.
    ("      var tab = tabFor(pageId);\n"
     "      var tabMetrics = tab ? measureTab(tab) : null;\n"
     "      origGo.call(window.PM_PAGES, pageId, subTab);\n",
     "      var tab = tabFor(pageId);\n"
     "      var tabMetrics = tab ? measureTab(tab) : null;\n"
     "      var whole = changed && newP && oldP !== newP && (reduced() || window.PM_PAGES.instant) && /^(wizard|orchestrator)$/.test(pageId);   /* O55 */\n"
     "      origGo.call(window.PM_PAGES, pageId, subTab);\n"
     "      if (whole) requestAnimationFrame(function () { finishEntrances(newP); });\n",
     'page switch: whole arrival when instant'),
    ("    var origGo = window.PM_PAGES.go;\n"
     "    window.PM_PAGES.go = function (pageId, subTab) {\n",
     "    /* O55 (motion QA A1, A2): a page that arrives at once shows its end state on its first frame */\n"
     "    function finishEntrances(panel) {\n"
     "      if (!panel || !panel.classList.contains('active') || !panel.getAnimations) return;\n"
     "      panel.getAnimations({ subtree: true }).forEach(function (a) {\n"
     "        try { var t = a.effect && a.effect.getComputedTiming(); if (t && isFinite(t.endTime) && a.playState !== 'finished') a.finish(); } catch (e) {}\n"
     "      });\n"
     "    }\n"
     "    var origGo = window.PM_PAGES.go;\n"
     "    window.PM_PAGES.go = function (pageId, subTab) {\n",
     'page switch: finish entrances helper'),
    # A3, A5: a page change's first frame can be long (the arriving page is styled and laid out, first visits build
    # their content), and the exit and entrance, started inside it, were spent unseen: on the P1000 the Wizard sat still
    # ~470 ms, then vanished in one frame. Both moves start again together on the frame after the first one shown.
    ("      oldP.classList.add('pm8-page-out');\n"
     "      newP.classList.add('pm8-page-in');\n",
     "      oldP.classList.add('pm8-page-out');\n"
     "      newP.classList.add('pm8-page-in');\n"
     "      requestAnimationFrame(function () { requestAnimationFrame(function () {   /* O55: start on a shown frame */\n"
     "        var t = document.timeline.currentTime; if (t == null) return;\n"
     "        [oldP, newP].forEach(function (p) { p.getAnimations().forEach(function (a) {\n"
     "          if (a.animationName === 'pm8-page-in' || a.animationName === 'pm8-page-out') { try { if (a.playState !== 'idle') a.startTime = t; } catch (e) {} }\n"
     "        }); });\n"
     "      }); });\n",
     'page switch: moves start on a shown frame'),
    # A3, A5: the edge-dissolve header offsets (PM_EDGE) measured each newly shown page's head synchronously inside the
    # page change, forcing the arriving page's style and layout there (~100 ms on the P1000) before the rest of the
    # change wrote to it again. Its ResizeObserver delivers the first measure itself, after the frame's layout and before
    # its paint, so the header offset is still right on the first frame.
    ("        if (entry.stack || entry.gap) {\n"
     "          for (var s = head.previousElementSibling; s; s = s.previousElementSibling) ro.observe(s);\n"
     "        }\n"
     "      } catch (e) {}\n"
     "      measure(host, head, entry);\n"
     "    }\n",
     "        if (entry.stack || entry.gap) {\n"
     "          for (var s = head.previousElementSibling; s; s = s.previousElementSibling) ro.observe(s);\n"
     "        }\n"
     "        return;   /* O55: the observer's first callback measures, after layout */\n"
     "      } catch (e) {}\n"
     "      measure(host, head, entry);\n"
     "    }\n",
     'edge dissolve: first measure from the observer'),
]

CENSUS = [
    # B1, B4, B6 (shared): the hover-tag census (binding descriptions to new controls) ran its batches in animation
    # frames, before each frame's paint, and a live batch first prepared every queued control at once: a Settings
    # chapter, a customizer or a theme change paid it inside the very frames that should show the change. The batches
    # now run in idle time after a frame is shown, each within the idle deadline (a 900 ms timeout keeps them going on
    # a busy page), and a live batch prepares each control as it reaches it. Pointer and focus still bind their target
    # at once. censusFrame/cancelCensusFrame replace the rAF calls of the census (see apply()).
    ("  HoverTagController.prototype.scheduleScan=function(scope){\n",
     "  var censusDeadline=null;   /* O55: the census runs in idle time (motion QA, 2026-10-16) */\n"
     "  function censusFrame(fn){\n"
     "    if(typeof requestIdleCallback!=='function')return requestAnimationFrame(fn);\n"
     "    return requestIdleCallback(function(deadline){censusDeadline=deadline;try{fn();}finally{censusDeadline=null;}},{timeout:900});\n"
     "  }\n"
     "  function cancelCensusFrame(id){if(!id)return;if(typeof cancelIdleCallback==='function')cancelIdleCallback(id);else cancelAnimationFrame(id);}\n"
     "  function censusTime(started,ms){if(performance.now()-started>=ms)return false;return !censusDeadline||censusDeadline.didTimeout||censusDeadline.timeRemaining()>1;}\n"
     "  HoverTagController.prototype.scheduleScan=function(scope){\n",
     'hover census: idle scheduler'),
    ("    for(var i=0;i<nodes.length;i++){var prepared=this.prepare(nodes[i]);if(prepared||attr(nodes[i],'data-pm-hover-bound')==='true')queue.push({el:nodes[i],prepared:prepared});}\n",
     "    for(var i=0;i<nodes.length;i++)queue.push({el:nodes[i],prepared:undefined});   /* O55: prepared in the batches */\n",
     'hover census: live prepare in batches'),
    ("    while(this.liveCursor<limit&&performance.now()-started<4){var row=this.liveQueue[this.liveCursor++];if(!row.el.isConnected||!row.prepared){",
     "    while(this.liveCursor<limit&&censusTime(started,4)){var row=this.liveQueue[this.liveCursor++];\n"
     "      if(row.prepared===undefined){row.prepared=row.el.isConnected?this.prepare(row.el):null;if(!row.prepared&&attr(row.el,'data-pm-hover-bound')!=='true')continue;}\n"
     "      if(!row.el.isConnected||!row.prepared){",
     'hover census: live batch budget'),
    ("      while(this.scanPrepareCursor<limit&&performance.now()-started<3){",
     "      while(this.scanPrepareCursor<limit&&censusTime(started,3)){",
     'hover census: scan prepare budget'),
    ("    while(this.scanCursor<limit&&performance.now()-started<4){",
     "    while(this.scanCursor<limit&&censusTime(started,4)){",
     'hover census: scan bind budget'),
    ("    cancelAnimationFrame(this.scanFrame);cancelAnimationFrame(this.liveFrame);this.scanFrame=0;this.liveFrame=0;\n",
     "    cancelCensusFrame(this.scanFrame);cancelCensusFrame(this.liveFrame);this.scanFrame=0;this.liveFrame=0;\n",
     'hover census: cancel'),
]

PATCHES = STATUS_BAR + HOVER_TAGS + THEME + PAGES + CENSUS

# The census's own frame requests, between scheduleScan and refresh (scan, delayed scan, live, delayed live, and their
# continuations): every one becomes censusFrame.
CENSUS_FROM = '  HoverTagController.prototype.scheduleScan=function(scope){\n'
CENSUS_TO = '  HoverTagController.prototype.refresh=function(el){\n'
CENSUS_FRAMES = 9


def apply(text: str, replace_once) -> str:
    for old, new, label in PATCHES:
        text = replace_once(text, old, new, label)
    a = text.index(CENSUS_FROM)
    b = text.index(CENSUS_TO, a)
    region = text[a:b]
    n = region.count('Frame=requestAnimationFrame(')
    if n != CENSUS_FRAMES:
        raise RuntimeError(f'hover census: expected {CENSUS_FRAMES} frame requests, found {n}')
    return text[:a] + region.replace('Frame=requestAnimationFrame(', 'Frame=censusFrame(') + text[b:]
