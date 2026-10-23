"""Hosted streaming: connected-node caches and read-before-write spine drawing.

Cache only the unique main transcript and the stream's keyed, JS-owned island.
The observer still discovers newly mounted feeds; ordinary word insertions no
longer rescan every transcript in the whole page.
"""

HOSTED_JS_PATCHES = [
    (
        'turn-stream.js',
        '    var host = document.querySelector(\'[data-k="tx-island:\' + CSS.escape(st.id) + \'"]\');',
        '    var host = st.island && st.island.isConnected ? st.island : document.getElementById(\'pmRoot\').querySelector(\'[data-k="tx-island:\' + CSS.escape(st.id) + \'"]\');',
        1,
    ),
    (
        'turn-stream.js',
        "  function roomInner() { var tr = document.querySelector('.chat-stage .transcript'); return tr && tr.querySelector('.transcript-inner'); }",
        """  var roomInnerNode = null;
  function roomInner() {
    if(roomInnerNode && roomInnerNode.isConnected) return roomInnerNode;
    var tr = document.getElementById('pmRoot').querySelector('.chat-stage > .transcript');
    return roomInnerNode = tr && tr.querySelector(':scope > .transcript-inner');
  }""",
        1,
    ),
    (
        'app.js',
        '  function scrollKeyEl(key){ return document.querySelector(`[data-scroll-key="${key}"]`); }',
        """  let transcriptNode = null;
  function scrollKeyEl(key){
    if(key !== 'transcript') return document.querySelector(`[data-scroll-key="${key}"]`);
    if(transcriptNode && transcriptNode.isConnected) return transcriptNode;
    return transcriptNode = document.getElementById('pmRoot').querySelector('.chat-stage > [data-scroll-key="transcript"]');
  }""",
        1,
    ),
    (
        'turn-stage.js',
        """  function drawRoot(st) {
    var tr = st.tr, inner = st.inner, layer = st.layer, nodes = st.nodes;
    if (tr.getAttribute('data-variant') !== '16') { if (layer.firstChild) { layer.textContent = ''; nodes.clear(); } return; }
    var svg = layer.firstChild;
    if (!svg || String(svg.tagName).toLowerCase() !== 'svg') {
      layer.textContent = ''; nodes.clear(); svg = el('svg', 'sp-svg'); layer.appendChild(svg);
      group(svg, 'sp-lines'); group(svg, 'sp-ticks'); group(svg, 'sp-marks');   /* paint order: lines, ticks, marks */
    }
    var tR = tr.getBoundingClientRect(), sT = tr.scrollTop;
    var gutter = parseFloat(getComputedStyle(inner).getPropertyValue('--tx-gutter')) || 26;
    /* The SVG is 1px tall and draws everything as paint overflow: paint
       overflow never counts as scrollable area. A layer sized to the content
       was one frame stale whenever the content shrank (a card folding), and
       for that frame it held the scroll height up, then let it drop at once. */
    layer.style.height = '';
    if (svg.hasAttribute('viewBox')) svg.removeAttribute('viewBox');
    /* 1x1 in both axes: everything is drawn as paint overflow. Any width it
       took from the transcript was one frame stale whenever the pane narrowed
       (a panel opening beside the chat), and in that frame it overflowed the
       transcript sideways by the difference (measured 37-120px). */
    set(svg, { width: 1, height: 1 });
    nodes.forEach(function (n) { n.__seen = false; });
    var turns = {}, order = [];
    var kids = inner.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i], pos = k.getAttribute('data-turn-pos');
      if (!pos || pos === 'user') continue;
      var t = k.getAttribute('data-turn') || '0';
      if (!turns[t]) { turns[t] = []; order.push(t); }
      turns[t].push(k);
    }
    order.forEach(function (t) {
      var list = turns[t];
      var r0 = list[0].getBoundingClientRect();
      var x = Math.round(r0.left - tR.left - gutter + 9) + 0.5;
      var yMark = r0.top - tR.top + sT + 10;
      var last = list[list.length - 1], rl = last.getBoundingClientRect();
      var yEnd = rl.top - tR.top + sT + 17;
      var live = null, pending = false;
      list.forEach(function (it) {
        var s = it.getAttribute('data-streaming');
        if (s === 'pending') pending = true;
        if ((s && s !== 'pending') || (it.classList.contains('working-card') && !it.classList.contains('is-done')) || it.querySelector(':scope > .working-card:not(.is-done)')) live = it;
      });
      /* A working child's feed has no streaming item. The mark still reads live
         and the comet runs to the latest item. */
      if (!live && tr.hasAttribute('data-feed-live')) live = list[list.length - 1];
      var mk = markNode(nodes, svg, 'm' + t);
      set(mk, { transform: 'translate(' + x + ' ' + yMark.toFixed(1) + ')', 'data-state': pending ? 'pending' : live ? 'live' : 'rest' });
      if (list.length > 1) {
        var line = node(nodes, svg, 'l' + t, 'path', 'sp-line');
        set(line, { d: 'M' + x + ' ' + (yMark + 9).toFixed(1) + 'V' + yEnd.toFixed(1) });
        var end = node(nodes, svg, 'e' + t, 'circle', 'sp-end');
        set(end, { cx: x, cy: yEnd.toFixed(1), r: 2.4 });
      }
      list.forEach(function (it, j) {
        if (j === 0) return;
        var fam = it.getAttribute('data-family');
        if (!TICKED[fam]) return;
        var r = it.getBoundingClientRect();
        var tk = node(nodes, svg, 't' + t + ':' + (it.getAttribute('data-k') || j), 'circle', 'sp-tick');
        var attrs = { cx: x, cy: (r.top - tR.top + sT + 17).toFixed(1), r: 3.4, 'data-f': fam };
        if (fam === 'work') { var src = it.classList.contains('working-card') ? it : (it.querySelector('.working-card') || it); var c = getComputedStyle(src).getPropertyValue('--pm-step').trim(); attrs.style = c ? 'fill:' + c : ''; }
        set(tk, attrs);
      });
      /* the comet: light running from the mark down to what is live */
      if (live) {
        /* a streaming reply's live point is its caret (the writing edge), not
           its box, whose foot is the hover row's reserved space. A comet only
           once it has real length: a few pixels under the ring read as a glyph
           (a ring with a tail), not as light travelling. */
        var rL = live.getBoundingClientRect(), yLive;
        if (live.getAttribute('data-streaming')) {
          var cr = live.querySelector('.tx-caret'), rc = cr && cr.getBoundingClientRect();
          yLive = rc && rc.height ? rc.top + rc.height / 2 - tR.top + sT : rL.bottom - tR.top + sT - 34;
        } else yLive = rL.top - tR.top + sT + 17;
        if (yLive - yMark > 40) {
          var cm = node(nodes, svg, 'c' + t, 'path', 'sp-comet');
          set(cm, { d: 'M' + x + ' ' + (yMark + 9).toFixed(1) + 'V' + yLive.toFixed(1), pathLength: 100 });
        }
      }
    });
    nodes.forEach(function (n, key) { if (!n.__seen) { if (n.parentNode) n.parentNode.removeChild(n); nodes.delete(key); } });
  }
""",
        """  function drawRoot(st) {
    var tr = st.tr, inner = st.inner, layer = st.layer, nodes = st.nodes;
    if (tr.getAttribute('data-variant') !== '16') { if (layer.firstChild) { layer.textContent = ''; nodes.clear(); } return; }
    var svg = layer.firstChild;
    if (!svg || String(svg.tagName).toLowerCase() !== 'svg') {
      layer.textContent = ''; nodes.clear(); svg = el('svg', 'sp-svg'); layer.appendChild(svg);
      group(svg, 'sp-lines'); group(svg, 'sp-ticks'); group(svg, 'sp-marks');   /* paint order: lines, ticks, marks */
    }
    var tR = tr.getBoundingClientRect(), sT = tr.scrollTop;
    var gutter = parseFloat(getComputedStyle(inner).getPropertyValue('--tx-gutter')) || 26;
    /* Snapshot geometry before writing any SVG attributes. A path's update
       invalidates style; reading the next turn after it used to flush style
       again. The spine is paint overflow, so these writes cannot change the
       measured card geometry. */
    var rects = new Map(), steps = new Map(), carets = new Map();
    Array.prototype.forEach.call(inner.children, function(k){
      var pos = k.getAttribute('data-turn-pos');
      if(!pos || pos === 'user') return;
      rects.set(k, k.getBoundingClientRect());
      if(k.getAttribute('data-family') === 'work'){
        var src = k.classList.contains('working-card') ? k : (k.querySelector('.working-card') || k);
        steps.set(k, getComputedStyle(src).getPropertyValue('--pm-step').trim());
      }
      if(k.getAttribute('data-streaming')){
        var cr = k.querySelector('.tx-caret');
        carets.set(k, cr && cr.getBoundingClientRect());
      }
    });
    /* The SVG is 1px tall and draws everything as paint overflow: paint
       overflow never counts as scrollable area. A layer sized to the content
       was one frame stale whenever the content shrank (a card folding), and
       for that frame it held the scroll height up, then let it drop at once. */
    layer.style.height = '';
    if (svg.hasAttribute('viewBox')) svg.removeAttribute('viewBox');
    /* 1x1 in both axes: everything is drawn as paint overflow. Any width it
       took from the transcript was one frame stale whenever the pane narrowed
       (a panel opening beside the chat), and in that frame it overflowed the
       transcript sideways by the difference (measured 37-120px). */
    set(svg, { width: 1, height: 1 });
    nodes.forEach(function (n) { n.__seen = false; });
    var turns = {}, order = [];
    var kids = inner.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i], pos = k.getAttribute('data-turn-pos');
      if (!pos || pos === 'user') continue;
      var t = k.getAttribute('data-turn') || '0';
      if (!turns[t]) { turns[t] = []; order.push(t); }
      turns[t].push(k);
    }
    order.forEach(function (t) {
      var list = turns[t];
      var r0 = rects.get(list[0]);
      var x = Math.round(r0.left - tR.left - gutter + 9) + 0.5;
      var yMark = r0.top - tR.top + sT + 10;
      var last = list[list.length - 1], rl = rects.get(last);
      var yEnd = rl.top - tR.top + sT + 17;
      var live = null, pending = false;
      list.forEach(function (it) {
        var s = it.getAttribute('data-streaming');
        if (s === 'pending') pending = true;
        if ((s && s !== 'pending') || (it.classList.contains('working-card') && !it.classList.contains('is-done')) || it.querySelector(':scope > .working-card:not(.is-done)')) live = it;
      });
      /* A working child's feed has no streaming item. The mark still reads live
         and the comet runs to the latest item. */
      if (!live && tr.hasAttribute('data-feed-live')) live = list[list.length - 1];
      var mk = markNode(nodes, svg, 'm' + t);
      set(mk, { transform: 'translate(' + x + ' ' + yMark.toFixed(1) + ')', 'data-state': pending ? 'pending' : live ? 'live' : 'rest' });
      if (list.length > 1) {
        var line = node(nodes, svg, 'l' + t, 'path', 'sp-line');
        set(line, { d: 'M' + x + ' ' + (yMark + 9).toFixed(1) + 'V' + yEnd.toFixed(1) });
        var end = node(nodes, svg, 'e' + t, 'circle', 'sp-end');
        set(end, { cx: x, cy: yEnd.toFixed(1), r: 2.4 });
      }
      list.forEach(function (it, j) {
        if (j === 0) return;
        var fam = it.getAttribute('data-family');
        if (!TICKED[fam]) return;
        var r = rects.get(it);
        var tk = node(nodes, svg, 't' + t + ':' + (it.getAttribute('data-k') || j), 'circle', 'sp-tick');
        var attrs = { cx: x, cy: (r.top - tR.top + sT + 17).toFixed(1), r: 3.4, 'data-f': fam };
        if (fam === 'work') { var c = steps.get(it); attrs.style = c ? 'fill:' + c : ''; }
        set(tk, attrs);
      });
      /* the comet: light running from the mark down to what is live */
      if (live) {
        /* a streaming reply's live point is its caret (the writing edge), not
           its box, whose foot is the hover row's reserved space. A comet only
           once it has real length: a few pixels under the ring read as a glyph
           (a ring with a tail), not as light travelling. */
        var rL = rects.get(live), yLive;
        if (live.getAttribute('data-streaming')) {
          var rc = carets.get(live);
          yLive = rc && rc.height ? rc.top + rc.height / 2 - tR.top + sT : rL.bottom - tR.top + sT - 34;
        } else yLive = rL.top - tR.top + sT + 17;
        if (yLive - yMark > 40) {
          var cm = node(nodes, svg, 'c' + t, 'path', 'sp-comet');
          set(cm, { d: 'M' + x + ' ' + (yMark + 9).toFixed(1) + 'V' + yLive.toFixed(1), pathLength: 100 });
        }
      }
    });
    nodes.forEach(function (n, key) { if (!n.__seen) { if (n.parentNode) n.parentNode.removeChild(n); nodes.delete(key); } });
  }
""",
        1,
    ),
    (
        'turn-stage.js',
        """    if (root) new MutationObserver(function () {
      var needs = false;""",
        """    if (root) new MutationObserver(function (mutations) {
      /* Streamed words do not add transcript roots. Only scan for hosts when
         an existing root detached or an added subtree can contain a feed. */
      var disconnected = false;
      roots.forEach(function(st){ if(!st.inner.isConnected) disconnected = true; });
      if(!disconnected && !mutations.some(function(m){
        return Array.prototype.some.call(m.addedNodes, function(n){
          return n.nodeType === 1 && (n.matches('.transcript, .tx-feed') ||
            (n.firstElementChild && n.querySelector('.transcript, .tx-feed')));
        });
      })) return;
      var needs = false;""",
        1,
    ),
]
