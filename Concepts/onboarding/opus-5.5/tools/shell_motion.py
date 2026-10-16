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
    # B4: the theme menu answers first (its radio or row paints on the next frame); the new look's cover washes over
    # the app from that frame and the repaint runs under it, once (src/js/12-theme-transition.js). The hint names the
    # look the pick goes to, for the cover's colours.
    ("        window.PM7_SETTINGS_TOME.setChromeThemeMode(seg.getAttribute('data-mode-value'));\n"
     "        return; /* mode is a filter, not a final pick: menu stays open */\n",
     "        var modeValue = seg.getAttribute('data-mode-value');   /* O55: the radio answers first (B4) */\n"
     "        menu.querySelectorAll('.pm6-tt-mode').forEach(function (b) { b.setAttribute('aria-checked', b === seg ? 'true' : 'false'); });\n"
     "        if (window.PM_THEME_TRANSITION) window.PM_THEME_TRANSITION(function () { window.PM7_SETTINGS_TOME.setChromeThemeMode(modeValue); }, { mode: modeValue });\n"
     "        else window.PM7_SETTINGS_TOME.setChromeThemeMode(modeValue);\n"
     "        return; /* mode is a filter, not a final pick: menu stays open */\n",
     'theme menu: mode answers first'),
    ("      window.PM7_SETTINGS_TOME.setChromeThemeFamily(row.getAttribute('data-family'));\n"
     "      tbMenuClose(menu);\n",
     "      var familyValue = row.getAttribute('data-family');   /* O55: the row answers first (B4) */\n"
     "      menu.querySelectorAll('.pm6-tt-family').forEach(function (r) { var on = r === row; r.classList.toggle('is-selected', on); r.setAttribute('aria-checked', on ? 'true' : 'false'); });\n"
     "      if (window.PM_THEME_TRANSITION) window.PM_THEME_TRANSITION(function () { window.PM7_SETTINGS_TOME.setChromeThemeFamily(familyValue); }, { family: familyValue });\n"
     "      else window.PM7_SETTINGS_TOME.setChromeThemeFamily(familyValue);\n"
     "      tbMenuClose(menu);\n",
     'theme menu: family answers first'),
]

THEME.append(
    # B4: the theme's search-width kick announced a resize inside the attribute observer, so every resize listener of
    # the page measured the half-restyled page there (the tab ink, the rail, Chat, Usage: two to four extra forced
    # style passes, 300-500 ms on the P1000). The listeners still hear it once, from the first ResizeObserver delivery
    # after the new look's layout (style and layout already done for that frame, so nothing is pulled forward).
    ("    new MutationObserver(function (muts) {\n"
     "      for (var i = 0; i < muts.length; i++) {\n"
     "        if (muts[i].attributeName === 'data-theme') { kickSearchDensity(); break; }\n"
     "      }\n",
     "    var kickPending = false;   /* O55: once, after the new look's frame (B4) */\n"
     "    new MutationObserver(function (muts) {\n"
     "      for (var i = 0; i < muts.length; i++) {\n"
     "        if (muts[i].attributeName === 'data-theme') {\n"
     "          if (!kickPending) {\n"
     "            kickPending = true;\n"
     "            /* inside the first ResizeObserver delivery after the new look's layout: style and layout are already\n"
     "               computed for that frame, so the listeners' reads never pull a pending restyle forward */\n"
     "            var kick = function () { kickPending = false; kickSearchDensity(); };\n"
     "            if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(kick);   /* the shell's early observer */\n"
     "            else requestAnimationFrame(function () { setTimeout(kick, 0); });\n"
     "          }\n"
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
    # their content), and the exit and entrance were spent unseen: the timeline that frame draws at is the one from
    # before the long work, so on the P1000 the Wizard sat still ~470-600 ms and then vanished in one frame. Both moves
    # are put back to their start at every frame that follows a long one (PM_START_ON_SHOWN), so the whole exit and
    # entrance play on frames that are shown.
    ("      oldP.classList.add('pm8-page-out');\n"
     "      newP.classList.add('pm8-page-in');\n",
     "      oldP.classList.add('pm8-page-out');\n"
     "      newP.classList.add('pm8-page-in');\n"
     "      var pageMoves = function () {   /* O55: the moves play on frames that are shown (src/js/11-motion-start.js) */\n"
     "        var out = [];\n"
     "        [oldP, newP].forEach(function (p) { p.getAnimations().forEach(function (a) { if (a.animationName === 'pm8-page-in' || a.animationName === 'pm8-page-out') out.push(a); }); });\n"
     "        return out;\n"
     "      };\n"
     "      /* O55: the click's fade (goSoon) keeps running, on the compositor, through this change's long frame; the\n"
     "         exit takes over from the opacity it has reached in the frame the moves start */\n"
     "      var lift = window.PM_PAGES.__lift; window.PM_PAGES.__lift = null;\n"
     "      var handoff = function () {\n"
     "        if (!lift || lift.el !== oldP || !oldP.classList.contains('pm8-page-out')) { if (lift) try { lift.anim.cancel(); } catch (e) {} return; }   /* a change made over it has cleaned up */\n"
     "        try {\n"
     "          /* still pending here, it reads as its start while the compositor has been running it since its first frame */\n"
     "          var a = lift.anim, ran = document.timeline.currentTime - lift.at;\n"
     "          if ((a.pending || !(a.currentTime > 0)) && ran > 0) a.currentTime = Math.min(ran, 140);\n"
     "          oldP.style.setProperty('--pm8-out-from', getComputedStyle(oldP).opacity); a.cancel();\n"
     "        } catch (e) {}\n"
     "      };\n"
     "      if (window.PM_START_ON_SHOWN) window.PM_START_ON_SHOWN(pageMoves, { release: handoff }); else handoff();\n",
     'page switch: moves start on a shown frame'),
    ("      function cleanupOut() {\n"
     "        oldP.classList.remove('pm8-page-out');\n",
     "      function cleanupOut() {\n"
     "        oldP.classList.remove('pm8-page-out');\n"
     "        oldP.style.removeProperty('--pm8-out-from');   /* O55: the answered fade's start is this exit's only */\n"
     "        oldP.classList.remove('pm-page-layer');   /* O55: its layer for the answer (src/js/13-page-layer.js) */\n",
     'page exit: forget the answered start'),
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
    # B6 (editor lane trace: two labelText calls 18 ms self each in one live batch on the P1000): a control's <label>
    # list was read three times per call, and labelText runs several times per control. On a page that keeps
    # changing, each read of el.labels can walk the whole document for its labels: 122.8 ms for 300 controls on Nas1,
    # against 1.0 ms reading it once, and only for a control that a label can name (it has an id, or sits in a label).
    ("    if(el&&el.labels&&el.labels.length){var labels=Array.prototype.map.call(el.labels,visibleText).filter(Boolean).join(' ');if(labels)return labels;}\n",
     "    var ls=el&&(el.id||(el.closest&&el.closest('label')))?el.labels:null,ln=ls?ls.length:0;   /* O55: read once (B6) */\n"
     "    if(ln){var own=[];for(var li=0;li<ln;li++)own.push(ls[li]);var labels=own.map(visibleText).filter(Boolean).join(' ');if(labels)return labels;}\n",
     'hover census: labels read once'),
    # B5 (Liquid Glass lane profile, NieR switch): a pointerover right after a click bound and measured its control at
    # once, while that click's restyle was still pending (125 ms forced, 1,558 elements). The open waits for the
    # coming frame's layout (PM_AFTER_LAYOUT, before its paint), keeps only the latest target, and opens only if the
    # pointer is still over it; the open's own intent timing is unchanged.
    ("    document.addEventListener('pointerover',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound=\"true\"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(el&&!inOwner(el))self.open(el,'pointer',event);},true);",
     "    var pointerAsk=null;   /* O55: opened after layout (B5) */\n"
     "    document.addEventListener('pointerover',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound=\"true\"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(!el||inOwner(el))return;\n"
     "      if(typeof window.PM_AFTER_LAYOUT!=='function'){self.open(el,'pointer',event);return;}\n"
     "      var first=!pointerAsk;pointerAsk={el:el,event:event};\n"
     "      if(first)window.PM_AFTER_LAYOUT(function(){var a=pointerAsk;pointerAsk=null;if(a&&a.el.isConnected&&a.el.matches(':hover'))self.open(a.el,'pointer',a.event);});},true);",
     'hover tags: pointer open after layout'),
]

ANSWER_FIRST = [
    # Page tabs answer on the click's own frame (final motion QA, planner 2026-10-16: Settings entry measured 440 ms
    # click-to-paint with 17 ms of handlers; the arriving page's first style, layout and paint is the rest). A trusted
    # click on a page tab now paints its answer first: the tab strip shows the choice, its ink starts gliding and the
    # leaving page starts to fade, all on layers that already exist. The page change itself (classes, page.changed,
    # first renders) runs in the task after that frame; its exit continues from where the fade has got to, and the
    # moves start again on the frames that are shown. Under Reduced Motion the answer is the tab strip alone (the ink
    # snaps, nothing fades) and the page then swaps at once. Programmatic clicks (tab.click() from other code) keep the
    # immediate, synchronous change.
    ("      document.addEventListener('click', function(e) {\n"
     "        if (!window.PM_PAGES || !window.PM_PAGES.go) return;\n"
     "        var tab = e.target && e.target.closest ? e.target.closest('.page-tab[data-page]') : null;\n"
     "        if (!tab) return;\n"
     "        window.PM_PAGES.go(tab.getAttribute('data-page'));\n"
     "      }, true);\n",
     "      document.addEventListener('click', function(e) {\n"
     "        if (!window.PM_PAGES || !window.PM_PAGES.go) return;\n"
     "        var tab = e.target && e.target.closest ? e.target.closest('.page-tab[data-page]') : null;\n"
     "        if (!tab) return;\n"
     "        if (e.isTrusted && typeof window.PM_PAGES.goSoon === 'function') window.PM_PAGES.goSoon(tab.getAttribute('data-page'));   /* O55: answer first */\n"
     "        else window.PM_PAGES.go(tab.getAttribute('data-page'));\n"
     "      }, true);\n",
     'page tabs: answer first'),
    # The tab's own legacy handler switched the pages again by class after PM_PAGES had (a no-op then); with the answer
    # first it would switch them at once. PM_PAGES is the switch whenever it exists.
    ("          const pageId = this.getAttribute('data-page');\n"
     "          if (!pageId) return;\n",
     "          const pageId = this.getAttribute('data-page');\n"
     "          if (!pageId) return;\n"
     "          if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') return;   /* O55: PM_PAGES switches */\n",
     'page tabs: legacy switch only without PM_PAGES'),
    ("    from { opacity: 1; transform: translateX(0); }\n",
     "    from { opacity: var(--pm8-out-from, 1); transform: translateX(0); }   /* O55: continues an answered fade */\n",
     'page exit: starts where the answer left it'),
    ("      if (tab) (changed ? springTo : snap)(tab, tabMetrics);\n",
     "      if (tab && window.PM_PAGES.__answered !== pageId) (changed ? springTo : snap)(tab, tabMetrics);   /* O55: the answer already started it */\n"
     "      window.PM_PAGES.__answered = null;\n",
     'page switch: ink once'),
    ("    function resync() {\n"
     "      cacheTabMetrics();\n",
     "    /* O55: the answer on the click's own frame (see ANSWER_FIRST in tools/shell_motion.py) */\n"
     "    var soon = null;\n"
     "    window.PM_PAGES.goSoon = function (pageId) {\n"
     "      var P = window.PM_PAGES, prev = P.current;\n"
     "      if (soon) { soon.page = pageId; }\n"
     "      else if (!pageId || pageId === prev || !bootPaintDone || document.hidden || !panelFor(pageId)) { P.go(pageId); return; }\n"
     "      var tab = tabFor(pageId), oldP = prev ? panelFor(prev) : null;\n"
     "      document.querySelectorAll('.page-tab').forEach(function (t) { var on = t.getAttribute('data-page') === pageId; t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });\n"
     "      if (tab) { springTo(tab, measureTab(tab)); P.__answered = pageId; }\n"
     "      if (soon) return;\n"
     "      var html = document.documentElement, nier = html.getAttribute('data-o55-nier') === 'on', retro = /^retro/.test(html.getAttribute('data-theme') || '');\n"
     "      /* NieR answers with its wipe and the ink; the other looks start the leaving page's fade (Retro in steps) */\n"
     "      var lift = !nier && !reduced() && oldP && oldP.animate && !oldP.classList.contains('pm8-page-out') ? oldP.animate([{ opacity: 1 }, { opacity: 0.86 }], { duration: 140, easing: retro ? 'steps(2, end)' : 'cubic-bezier(.2, 0, 0, 1)', fill: 'forwards' }) : null;\n"
     "      soon = { page: pageId };\n"
     "      requestAnimationFrame(function (shown) { setTimeout(function () {\n"
     "        var to = soon.page; soon = null;\n"
     "        /* the fade is not read here: a move begun a frame ago still reads as its start on this thread */\n"
     "        P.__lift = lift ? { el: oldP, anim: lift, at: shown } : null;\n"
     "        if (P.__answered !== to) P.__answered = null;\n"
     "        P.go(to);\n"
     "        if (P.__lift) { try { P.__lift.anim.cancel(); } catch (e) {} P.__lift = null; }   /* no exit took it over */\n"
     "      }, 0); });\n"
     "    };\n"
     "    function resync() {\n"
     "      cacheTabMetrics();\n",
     'page switch: answer-first entry point'),
]

ANSWER_FIRST.append(
    # The rail answers the same way (final motion QA A8; P1000 Event Timing 232-440 ms for a section switch): a
    # trusted click on another section lights its icon on the click's own frame, and the section is shown in the task
    # after it (the leaving section is then held over it until the new one deals in, leftrail 30-motion.js). Opening
    # the rail from closed, closing it and programmatic clicks stay immediate.
    ("                    const targetId = iconBtn.getAttribute('data-target');\n"
     "                    if (targetId) {\n"
     "                        document.querySelectorAll('.side-panel-view').forEach(v => v.classList.remove('active'));\n"
     "                        const targetView = document.getElementById(targetId);\n"
     "                        if (targetView) targetView.classList.add('active');\n"
     "                        if (sidePanelSlot) sidePanelSlot.classList.remove('hidden');\n"
     "                    }\n",
     "                    const targetId = iconBtn.getAttribute('data-target');\n"
     "                    const showTarget = () => {\n"
     "                        document.querySelectorAll('.side-panel-view').forEach(v => v.classList.remove('active'));\n"
     "                        const targetView = document.getElementById(targetId);\n"
     "                        if (targetView) targetView.classList.add('active');\n"
     "                        if (sidePanelSlot) sidePanelSlot.classList.remove('hidden');\n"
     "                    };\n"
     "                    /* O55: a click on another section answers first (its icon), the section follows a frame later */\n"
     "                    if (targetId && e.isTrusted && sidePanelSlot && !sidePanelSlot.classList.contains('hidden') && !window.__pmRailSoon) {\n"
     "                        window.__pmRailSoon = true;\n"
     "                        requestAnimationFrame(() => setTimeout(() => { window.__pmRailSoon = false; if (iconBtn.classList.contains('active')) showTarget(); }, 0));\n"
     "                    } else if (targetId) showTarget();\n",
     'rail: a section switch answers first'))

CHAT = [
    # B5 (Liquid Glass lane invalidation trace): the chat footer and header write inherited custom properties on their
    # containers at every resize (the synthetic theme kick among them), and each write restyled the chat's subtree.
    # Their descendants read them (the stream's padding, the body's and stream's offsets), so they stay inherited; a
    # write is made only when the value changes. The chat's layout is the same.
    ("    wrap.style.setProperty('--chat-footer-stack-height', fh + 'px');\n",
     "    if (wrap.style.getPropertyValue('--chat-footer-stack-height') !== fh + 'px') wrap.style.setProperty('--chat-footer-stack-height', fh + 'px');   /* O55: only a change (B5) */\n",
     'chat footer: stack height only when it changes'),
    ("      wrap.style.setProperty('--chat-footer-inset', inset + 'px');\n",
     "      if (wrap.style.getPropertyValue('--chat-footer-inset') !== inset + 'px') wrap.style.setProperty('--chat-footer-inset', inset + 'px');\n",
     'chat footer: inset only when it changes'),
    ("      stream.style.paddingBottom = inset + 'px';\n",
     "      if (stream.style.paddingBottom !== inset + 'px') stream.style.paddingBottom = inset + 'px';\n",
     'chat footer: stream padding only when it changes'),
    ("      wrap.style.removeProperty('--chat-footer-inset');\n"
     "      wrap.style.setProperty('--chat-footer-stack-height', '0px');\n",
     "      if (wrap.style.getPropertyValue('--chat-footer-inset')) wrap.style.removeProperty('--chat-footer-inset');\n"
     "      if (wrap.style.getPropertyValue('--chat-footer-stack-height') !== '0px') wrap.style.setProperty('--chat-footer-stack-height', '0px');\n",
     'chat footer: cleared only when set'),
    ("if (h > 0) root.style.setProperty('--pm-chat-head-h', h + 'px');",
     "if (h > 0 && root.style.getPropertyValue('--pm-chat-head-h') !== h + 'px') root.style.setProperty('--pm-chat-head-h', h + 'px');   /* O55: only a change (B5) */",
     'chat header: height only when it changes'),
]

CHAT.append(
    # B5 (Settings lane read probe on b8bb: page-tab resync offsetLeft 908.7 ms on Nas1): the page-tab ink resynced
    # after a theme or motion change in an animation frame callback, before that frame's style, so it was the first
    # reader of the look's pending whole-page restyle. It resyncs after the frame's layout instead (PM_AFTER_LAYOUT,
    # before its paint), where the restyle is already done; the ink is in place in the same frame.
    ("      resyncFrame = requestAnimationFrame(function () { resyncFrame = 0; resync(); });\n",
     "      if (typeof window.PM_AFTER_LAYOUT === 'function') { resyncFrame = 1; window.PM_AFTER_LAYOUT(function () { resyncFrame = 0; resync(); }); return; }   /* O55: after layout (B5) */\n"
     "      resyncFrame = requestAnimationFrame(function () { resyncFrame = 0; resync(); });\n",
     'page-tab ink: theme resync after layout'))

EDGES = [
    # B5 (Settings lane, frozen 25b13069be): the scroll edges' flush ran in an animation frame callback, before the
    # frame's style, and read every dirty scroller's scroll metrics, then wrote their classes, then read each band's
    # scroller geometry (getComputedStyle, offsets) after the band before it was moved: the first reader of a look
    # change's whole-page restyle and a read after every write (114-151 ms forced per NieR switch on the P1000). It now
    # runs after the frame's layout (PM_AFTER_LAYOUT, js/11-motion-start.js), reads everything first and writes after,
    # and waits under a look's or the boot's cover and while a NieR switch is still to paint (PM_BUSY): the page is
    # hidden there. Page changes, Usage moments and the onboarding window keep it live, since the edges show there.
    # The edges are the same: the same reads, written in the same frame.
    ("    function layoutBands(el, st) {\n"
     "      if (!st.bands) return;\n"
     "      try {\n"
     "        var cs = window.getComputedStyle(el);\n"
     "        var x = el.offsetLeft + (parseFloat(cs.borderLeftWidth) || 0);\n"
     "        var y = el.offsetTop + (parseFloat(cs.borderTopWidth) || 0);\n"
     "        var w = el.clientWidth, h = el.clientHeight, s;\n",
     "    /* O55: a band's scroller geometry, read apart from its writes (B5) */\n"
     "    function bandGeom(el) {\n"
     "      var cs = window.getComputedStyle(el);\n"
     "      return { x: el.offsetLeft + (parseFloat(cs.borderLeftWidth) || 0), y: el.offsetTop + (parseFloat(cs.borderTopWidth) || 0), w: el.clientWidth, h: el.clientHeight };\n"
     "    }\n"
     "    function layoutBands(el, st, g) {\n"
     "      if (!st.bands) return;\n"
     "      try {\n"
     "        if (!g) g = bandGeom(el);\n"
     "        var x = g.x, y = g.y, w = g.w, h = g.h, s;\n",
     'scroll edges: band geometry read apart'),
    ("    function schedule() {\n"
     "      if (!rafId) {\n"
     "        try { rafId = window.requestAnimationFrame(flush); }\n",
     "    /* O55: the flush runs after the frame's layout; under a look's or the boot's cover it waits, a frame at a time,\n"
     "       with the dirty scrollers kept (B5) */\n"
     "    function edgesHeld() {\n"
     "      var f = window.PM_BUSY, why = '';\n"
     "      try { why = typeof f === 'function' ? f() : ''; } catch (e) { why = ''; }\n"
     "      return why === 'reboot' || why === 'calm' || why === 'theme' || why === 'boot' || why === 'nier';\n"
     "    }\n"
     "    function flushAfterLayout() {\n"
     "      if (!document.hidden && edgesHeld()) { rafId = window.requestAnimationFrame(flushAfterLayout); return; }\n"
     "      if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(flush); else flush();\n"
     "    }\n"
     "    function schedule() {\n"
     "      if (!rafId) {\n"
     "        try { rafId = window.requestAnimationFrame(flushAfterLayout); }\n",
     'scroll edges: flush after layout'),
    ("    function relayoutVisible() {\n"
     "      var scope = geometryScope || pageScope();\n"
     "      enrolled.forEach(function (el) {\n"
     "        var st = el.__pmEdge, page = el.closest && el.closest('.primary-content > .page');\n"
     "        if (page && scope && !scope.contains(el)) return;\n"
     "        if (st && st.bands && isVisible(el)) layoutBands(el, st);\n"
     "      });\n"
     "    }\n",
     "    /* O55: every visible band's geometry read first, then every band placed (B5) */\n"
     "    function readVisibleGeometry() {\n"
     "      var scope = geometryScope || pageScope(), out = [];\n"
     "      enrolled.forEach(function (el) {\n"
     "        var st = el.__pmEdge, page = el.closest && el.closest('.primary-content > .page');\n"
     "        if (page && scope && !scope.contains(el)) return;\n"
     "        if (st && st.bands && isVisible(el)) { try { out.push({ el: el, st: st, g: bandGeom(el) }); } catch (e) {} }\n"
     "      });\n"
     "      return out;\n"
     "    }\n"
     "    function relayoutVisible(geom) {\n"
     "      (geom || readVisibleGeometry()).forEach(function (o) { layoutBands(o.el, o.st, o.g); });\n"
     "    }\n",
     'scroll edges: visible geometry read before it is written'),
    ("        for (var i = 0; i < ops.length; i++) {\n"
     "          try { writeState(ops[i].el, ops[i].st, ops[i].s); } catch (e) {}\n"
     "        }\n",
     "        /* O55: the bands' geometry is read with the scroll metrics, before any class is written (B5) */\n"
     "        var geom = null;\n"
     "        if (geomDirty && !document.body.classList.contains('pm-resizing')) { geomDirty = false; geom = readVisibleGeometry(); }\n"
     "        for (var i = 0; i < ops.length; i++) {\n"
     "          try { writeState(ops[i].el, ops[i].st, ops[i].s); } catch (e) {}\n"
     "        }\n"
     "        if (geom) relayoutVisible(geom);\n",
     'scroll edges: reads before writes'),
]

FIELD = [
    # B5 (Settings lane, frozen 25b13069be: getComputedStyle(bloomSrc).borderRadius, 126 ms forced on Basic's NieR off):
    # the PM8 pointer field's loop reads every target's rect and, after a look change, the bloom host's radius, in an
    # animation frame callback. With the pointer on the control that changed the look, the loop was the first reader
    # of its whole-page restyle. Under a look's cover (PM_LOOK_COVERED, js/12-theme-transition.js) it now holds, the way
    # it holds through a resizer drag, and measures again once the page shows; the look's field values are read after
    # layout once the cover has gone. The field is the same once the page shows.
    ("      if (document.body.classList.contains('pm-resizing')) {\n"
     "        baseDirty = true;\n"
     "        requestAnimationFrame(tick);\n"
     "        return;\n"
     "      }\n",
     "      if (document.body.classList.contains('pm-resizing')) {\n"
     "        baseDirty = true;\n"
     "        requestAnimationFrame(tick);\n"
     "        return;\n"
     "      }\n"
     "      /* O55: held under a look's cover (B5) */\n"
     "      if (typeof window.PM_LOOK_COVERED === 'function' && window.PM_LOOK_COVERED()) { baseDirty = true; requestAnimationFrame(tick); return; }\n",
     'pointer field: held under a cover'),
    ("if (!themeFrame) themeFrame = requestAnimationFrame(function () { themeFrame = 0; readTheme(); });",
     "if (!themeFrame) themeFrame = requestAnimationFrame(function themeSoon() {   /* O55: after layout, once the cover has gone (B5) */\n"
     "          if (typeof window.PM_LOOK_COVERED === 'function' && window.PM_LOOK_COVERED()) { themeFrame = requestAnimationFrame(themeSoon); return; }\n"
     "          var go = function () { themeFrame = 0; readTheme(); };\n"
     "          if (typeof window.PM_AFTER_LAYOUT === 'function') window.PM_AFTER_LAYOUT(go); else go();\n"
     "        });",
     'pointer field: look values after layout'),
]

PATCHES = STATUS_BAR + HOVER_TAGS + THEME + PAGES + CENSUS + ANSWER_FIRST + CHAT + EDGES + FIELD

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
