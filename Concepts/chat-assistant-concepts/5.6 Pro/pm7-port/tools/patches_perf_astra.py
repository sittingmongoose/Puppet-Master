"""Hosted History geometry ownership; exact-match patches, standalone untouched.

The consumed values, drawer width formula and motion tokens stay identical.
Reads move to layout observers; geometry no longer inherits through chat text.
"""

HOSTED_CSS_PATCHES = [
    ('delivery-polish.css',
     '''body { --polish-history-gutter:0px; }
body[data-ph-drawer="pinned"] { --polish-history-gutter:var(--ph-w,200px); }''',
     '', 1),
    ('history.css',
     '''body[data-ph-drawer="pinned"],
body[data-ph-want-pin]{
  --ph-w: min( max(var(--ph-user-w, var(--ph-pin-w)), var(--ph-min-w)),
               calc(var(--ph-pane, 100vw) * .42) );
}''',
     '', 1),
]

HOSTED_JS_PATCHES = [
    ('app.js',
     '<div class="${gridClass}">',
     '<div class="${gridClass}" style="${esc(window.PM56_HISTORY_GEOMETRY(false))}">', 2),
    ('app.js',
     '<aside class="history-flyout" data-history-variant=',
     '<aside class="history-flyout" style="${esc(window.PM56_HISTORY_GEOMETRY(true))}" data-history-variant=', 1),
    ('history.js',
     '''  function sync(){
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

''',
     '''  function sync(){ window.PM56_HISTORY_LAYOUT.sync(); }
  function syncHistoryHead(){ window.PM56_HISTORY_LAYOUT.heads(); }

''', 1),
    ('history.js',
     '    return pane ? pane.getBoundingClientRect().width : window.innerWidth;',
     '''    var cached = window.PM56_HISTORY_LAYOUT.rect();
    return cached ? cached.width : window.innerWidth;''', 1),
    ('history.js',
     '    var r = pane.getBoundingClientRect();',
     '    var r = window.PM56_HISTORY_LAYOUT.rect();', 1),
    ('history.js',
     '''    void el.offsetWidth;
    setMode('closing');
    var ms = readMotionMs(el, true);''',
     '''    setMode('closing');
    var ms = reduced() ? 0 : window.PM56_HISTORY_LAYOUT.closeMs();''', 1),
]
