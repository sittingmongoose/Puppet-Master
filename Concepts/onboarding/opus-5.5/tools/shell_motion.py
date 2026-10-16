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
    # side of its control; with no free place left it stays shut (its description is still read out).
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
     "  var PRIMARY_ACTIONS='.pm6-chat-send,.pmw-sc-send,.pm6-wiz-send,[data-pm-hover-avoid]';\n"
     "  function avoidPrimary(active,tagRoot,left,top,rect,anchor,viewport,marginX,marginY){\n"
     "    var nodes=document.querySelectorAll(PRIMARY_ACTIONS),boxes=[];\n"
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
PATCHES = STATUS_BAR + HOVER_TAGS
