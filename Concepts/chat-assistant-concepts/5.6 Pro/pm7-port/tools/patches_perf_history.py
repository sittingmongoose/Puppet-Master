"""Hosted History: consume ResizeObserver geometry, without a layout read after state writes.

The standalone does not load these patches. Motion tokens and state choreography
are unchanged; dimensions are published after layout and cached for event handlers.
"""

HOSTED_JS_PATCHES = [
    (
        'history.js',
        """  function sync(){
    var pane = document.querySelector('.assistant-pane');
    if(!pane) return;
    if(pane !== paneObserved){
      if(paneRO) paneRO.disconnect();
      paneObserved = pane;
      if(window.ResizeObserver){
        paneRO = new ResizeObserver(function(){ sync(); });
        paneRO.observe(pane);
      }
    }
    var r = pane.getBoundingClientRect();
    var s = window.PM56_ROOT_STYLE;
    s.setProperty('--ph-x', r.left + 'px');
    s.setProperty('--ph-y', r.top + 'px');
    s.setProperty('--ph-h', r.height + 'px');
    s.setProperty('--ph-pane', r.width + 'px');
    syncHistoryHead();
    var flyout = document.querySelector('.history-flyout');
    if(flyout !== flyoutObserved){
      if(flyoutRO) flyoutRO.disconnect();
      flyoutObserved = flyout;
      if(flyout && window.ResizeObserver){
        flyoutRO = new ResizeObserver(function(){ syncHistoryHead(); });
        flyoutRO.observe(flyout);
      }
    }
  }

  function syncHistoryHead(){
    document.querySelectorAll('.history-head').forEach(function(head){
      var host = head.closest('.history-flyout, .history-panel');
      if(!host) return;
      var narrowPx = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--ph-history-narrow-max')) || 204;
      /* Match the measured element the user tuned: .history-scroll width. */
      var scroll = host.querySelector('.history-scroll');
      var measureW = scroll ? scroll.getBoundingClientRect().width : host.clientWidth;
      var inNarrowBand = measureW <= narrowPx + 0.5;
      head.classList.toggle('is-hh-compact', inNarrowBand);
      host.classList.toggle('is-history-narrow', inNarrowBand);
    });
  }
""",
        """  /* Geometry belongs to the layout that ResizeObserver just delivered. A pin or
     close only consumes this snapshot: measuring after setting body state used
     to force the entire hosted stylesheet twice before its first paint. */
  var paneBox = null, headWidths = new WeakMap(), headRO = null, headNodes = [];
  function paintPaneClip(){
    var root = document.getElementById('pmOverlayRoot'), r = paneBox;
    if(!root || !r) return;
    root.style.clipPath = 'inset(' + Math.max(0, r.top) + 'px '
      + Math.max(0, window.innerWidth - r.right) + 'px '
      + Math.max(0, window.innerHeight - r.bottom) + 'px '
      + Math.max(0, r.left) + 'px)';
  }
  function readPane(){
    if(!paneObserved || !paneObserved.isConnected) return;
    var r = paneObserved.getBoundingClientRect();
    paneBox = {left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height};
    var s = window.PM56_ROOT_STYLE;
    s.setProperty('--ph-x', r.left + 'px');
    s.setProperty('--ph-y', r.top + 'px');
    s.setProperty('--ph-h', r.height + 'px');
    s.setProperty('--ph-pane', r.width + 'px');
    if(closing) paintPaneClip();
  }
  function sync(){
    var root = document.getElementById('pmRoot');
    var pane = root && root.querySelector('.assistant-pane');
    if(!pane) return;
    if(pane !== paneObserved){
      if(paneRO) paneRO.disconnect();
      paneObserved = pane;
      if(window.ResizeObserver){ paneRO = new ResizeObserver(readPane); paneRO.observe(pane); }
      readPane();
    }
    syncHistoryHead();
  }
  function syncHistoryHead(){
    var overlay = document.getElementById('pmOverlayRoot');
    if(!overlay) return;
    var scrolls = Array.prototype.slice.call(overlay.querySelectorAll('.history-scroll'));
    if(!headRO && window.ResizeObserver) headRO = new ResizeObserver(function(entries){
      /* Read every delivered size before toggling any class. borderBoxSize is
         the same width getBoundingClientRect measured, including padding. */
      entries.forEach(function(e){
        var b = e.borderBoxSize && (e.borderBoxSize[0] || e.borderBoxSize);
        headWidths.set(e.target, b ? b.inlineSize : e.target.getBoundingClientRect().width);
      });
      paintHistoryHeads();
    });
    if(headRO){
      headNodes.forEach(function(n){ if(scrolls.indexOf(n)<0) headRO.unobserve(n); });
      scrolls.forEach(function(n){ if(headNodes.indexOf(n)<0) headRO.observe(n); });
    }
    headNodes = scrolls;
    paintHistoryHeads();
  }
  function paintHistoryHeads(){
    var narrowPx = parseFloat(window.PM56_ROOT_STYLE.getPropertyValue('--ph-history-narrow-max')) || 204;
    headNodes.forEach(function(scroll){
      var w = headWidths.get(scroll), host = scroll.closest('.history-flyout, .history-panel');
      if(w == null || !host) return;
      var head = host.querySelector('.history-head');
      if(!head) return;
      var compact = w <= narrowPx + 0.5;
      head.classList.toggle('is-hh-compact', compact);
      host.classList.toggle('is-history-narrow', compact);
    });
  }
""",
        1,
    ),
    (
        'history.js',
        """    var pane = document.querySelector('.assistant-pane');
    return pane ? pane.getBoundingClientRect().width : window.innerWidth;""",
        '    return paneBox ? paneBox.width : window.PM56_HOST.width();',
        1,
    ),
    (
        'history.js',
        """  function applyPaneClip(){
    var pane = document.querySelector('.assistant-pane');
    var root = document.getElementById('pmOverlayRoot');
    if(!pane || !root) return;
    sync();
    var r = pane.getBoundingClientRect();
    root.style.clipPath = 'inset('
      + Math.max(0, r.top) + 'px '
      + Math.max(0, window.innerWidth - r.right) + 'px '
      + Math.max(0, window.innerHeight - r.bottom) + 'px '
      + Math.max(0, r.left) + 'px)';
  }""",
        '  function applyPaneClip(){ paintPaneClip(); }',
        1,
    ),
    (
        'history.js',
        "  window.addEventListener('resize', sync);",
        "  window.addEventListener('resize', function(){ requestAnimationFrame(readPane); });",
        1,
    ),
    (
        'history.js',
        '    var wasPinned = pinned;',
        """    var durationToken = el && getComputedStyle(el).getPropertyValue('--ph-t').trim();
    var closeMs = reduced() ? 0 : (parseFloat(durationToken) || 240) * (/ms$/.test(durationToken) ? 1 : /s$/.test(durationToken) ? 1000 : 1);
    var wasPinned = pinned;""",
        1,
    ),
    (
        'history.js',
        """    void el.offsetWidth;
    setMode('closing');
    var ms = readMotionMs(el, true);""",
        """    setMode('closing');
    var ms = closeMs;""",
        1,
    ),
    (
        'app.js',
        """    syncChatDock();
  }
  function openMenu""",
        """    if(state.menu || state.hover) syncChatDock();
  }
  function openMenu""",
        1,
    ),
]

# The same clamp belongs on its two consumers, rather than every host and all
# descendants. The assistant pane already supplies the exact container width.
HOSTED_CSS_PATCHES = [
    ('history.css', '''body[data-ph-drawer="pinned"],
body[data-ph-want-pin]{
  --ph-w: min( max(var(--ph-user-w, var(--ph-pin-w)), var(--ph-min-w)),
               calc(var(--ph-pane, 100vw) * .42) );
}''', '''@property --ph-w {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
body[data-ph-drawer="pinned"] .history-flyout,
body[data-ph-want-pin] .history-flyout{
  --ph-w: min( max(var(--ph-user-w, var(--ph-pin-w)), var(--ph-min-w)),
               calc(var(--ph-pane, 100vw) * .42) );
}
body[data-ph-drawer="pinned"] .assistant-grid,
body[data-ph-want-pin] .assistant-grid{
  --ph-w: min( max(var(--ph-user-w, var(--ph-pin-w)), var(--ph-min-w)), 42cqi );
}''', 1),
]
