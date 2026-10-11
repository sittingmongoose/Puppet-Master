/* Selection (character, word, line, rectangle), links (OSC 8, URLs, verified path:line:col), the link hover tag,
   keyboard copy mode (arrows or vi keys) and quick select hints. Mouse reporting wins over selection unless Shift is
   held, as in xterm. */
(function () {
  var CELL = T.CELL;
  var URL_RE = /\bhttps?:\/\/[^\s<>"'`]+[^\s<>"'`.,;:!?)\]}]/g;
  var PATH_RE = /(?:^|[\s(\['"=])((?:~|\.{1,2})?\/?(?:[\w.@-]+\/)*[\w.@-]+\.[A-Za-z][\w]{0,7})(?::(\d+))?(?::(\d+))?/g;
  var HASH_RE = /\b[0-9a-f]{7,40}\b/g;
  var IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g;

  function Selection(a, b, mode) { this.a = a; this.b = b; this.mode = mode || 'normal'; this.copyMode = false; }
  Selection.prototype.norm = function () {
    var a = this.a, b = this.b;
    if (b.abs < a.abs || (b.abs === a.abs && b.x < a.x)) { var t = a; a = b; b = t; }
    return [a, b];
  };
  Selection.prototype.span = function (abs, cols) {
    var n = this.norm(), a = n[0], b = n[1];
    if (abs < a.abs || abs > b.abs) return null;
    if (this.mode === 'rect') { var x0 = Math.min(this.a.x, this.b.x), x1 = Math.max(this.a.x, this.b.x) + 1; return [x0, x1]; }
    if (this.mode === 'line') return [0, cols];
    var s = abs === a.abs ? a.x : 0, e = abs === b.abs ? b.x + 1 : cols;
    return e > s ? [s, e] : null;
  };
  Selection.prototype.text = function (term) {
    var buf = term.buf, n = this.norm(), a = n[0], b = n[1], out = [];
    for (var abs = a.abs; abs <= b.abs; abs++) {
      var line = buf.lineAtAbs(abs); if (!line) continue;
      var sp = this.span(abs, line.cols); if (!sp) continue;
      var t = line.text(sp[0], sp[1], { keepTrailing: line.wrapped && this.mode !== 'rect' && abs !== b.abs });
      if (this.mode !== 'rect' && line.wrapped && abs !== b.abs) out.push({ t: t, join: true });
      else out.push({ t: t, join: false });
    }
    var s = '';
    out.forEach(function (o, i) { s += o.t + (i < out.length - 1 ? (o.join ? '' : '\n') : ''); });
    return s;
  };
  T.Selection = Selection;

  /* soft-wrap joins stop this many cells either side of the cell asked about, so a megabyte on one wrapped line costs a
     few kilobytes per hover; a match that touches a cut end is dropped rather than offered cut short */
  var SPAN = 2048;

  /* the cell before or after p, following soft wraps into the neighbouring row; null at a hard line end */
  function stepCell(buf, p, d) {
    var line = buf.lineAtAbs(p.abs); if (!line) return null;
    if (d < 0) {
      if (p.x > 0) return { abs: p.abs, x: p.x - 1 };
      var prev = p.abs > buf.trimmed ? buf.lineAtAbs(p.abs - 1) : null;
      return prev && prev.wrapped ? { abs: p.abs - 1, x: prev.cols - 1 } : null;
    }
    if (p.x < line.cols - 1) return { abs: p.abs, x: p.x + 1 };
    return line.wrapped && buf.lineAtAbs(p.abs + 1) ? { abs: p.abs + 1, x: 0 } : null;
  }
  function isWord(c) { return c && /[\w.\-\/~:@%+=#?&]/.test(String.fromCodePoint(c)); }
  function wordCell(buf, p) { var l = buf.lineAtAbs(p.abs); return !!l && (isWord(l.cp[p.x]) || !!(l.fl[p.x] & CELL.SPACER)); }
  /* the word around a cell, across soft wraps (at most SPAN cells either way): [start, end] as { abs, x } */
  function wordBounds(buf, abs, x) {
    var at = { abs: abs, x: x }, line = buf.lineAtAbs(abs);
    if (!line || !isWord(line.cp[x])) return [at, at];
    var s = at, e = at, p, n;
    for (n = 0; n < SPAN && (p = stepCell(buf, s, -1)) && wordCell(buf, p); n++) s = p;
    for (n = 0; n < SPAN && (p = stepCell(buf, e, 1)) && wordCell(buf, p); n++) e = p;
    return [s, e];
  }
  /* the rows of the soft-wrapped run that holds abs: [first, last] (a triple click selects the whole logical line) */
  function runOf(buf, abs) {
    var a = abs, b = abs, L;
    while (a > buf.trimmed && (L = buf.lineAtAbs(a - 1)) && L.wrapped) a--;
    while ((L = buf.lineAtAbs(b)) && L.wrapped && buf.lineAtAbs(b + 1)) b++;
    return [a, b];
  }

  /* logical text around the line at abs (joined across soft wraps, at most SPAN cells either way) with a map back to
     cells; cutStart and cutEnd say the wrapped run goes on past the text */
  function logical(buf, abs) {
    var lim = Math.max(1, Math.ceil(SPAN / buf.cols)), start = abs, cutStart = false, cutEnd = false;
    while (start > buf.trimmed) {
      var prev = buf.lineAtAbs(start - 1); if (!prev || !prev.wrapped) break;
      if (abs - start >= lim) { cutStart = true; break; }
      start--;
    }
    var text = '', map = [], cur = start;
    for (;;) {
      var line = buf.lineAtAbs(cur); if (!line) break;
      for (var x = 0; x < line.cols; x++) {
        if (line.fl[x] & CELL.SPACER) continue;
        var ch = line.cp[x] ? line.chars(x) : ' ';
        for (var k = 0; k < ch.length; k++) map.push({ abs: cur, x: x });
        text += ch;
      }
      if (!line.wrapped) break;
      if (cur - abs >= lim) { cutEnd = !!buf.lineAtAbs(cur + 1); break; }
      cur++;
    }
    return { text: text, map: map, cutStart: cutStart, cutEnd: cutEnd };
  }
  /* false when the match [s, e) of a logical text touches an end that was cut, so it may run on past it */
  function whole(lg, s, e) { return !(lg.cutStart && s === 0) && !(lg.cutEnd && e >= lg.text.length); }

  /* the link under a cell: OSC 8 first, then detected URLs and verified file paths */
  function linkAt(view, abs, x) {
    var term = view.term, buf = term.buf, line = buf.lineAtAbs(abs); if (!line) return null;
    var st = term.styles.get(line.st[x]);
    if (st.link) {
      var L = term.links.get(st.link);
      var x0 = x, x1 = x; while (x0 > 0 && term.styles.get(line.st[x0 - 1]).link === st.link) x0--; while (x1 < line.cols - 1 && term.styles.get(line.st[x1 + 1]).link === st.link) x1++;
      return { kind: 'osc8', uri: L.uri, linkId: st.link, abs: abs, x0: x0, x1: x1 + 1 };
    }
    var lg = logical(buf, abs), m, hit = null, inUrl = false;
    var idx = -1;
    for (var i = 0; i < lg.map.length; i++) if (lg.map[i].abs === abs && lg.map[i].x === x) { idx = i; break; }
    if (idx < 0) return null;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(lg.text))) {
      if (idx >= m.index && idx < m.index + m[0].length) {
        inUrl = true;
        if (whole(lg, m.index, m.index + m[0].length)) hit = { kind: 'url', uri: m[0], s: m.index, e: m.index + m[0].length };
        break;
      }
    }
    if (!inUrl) {
      PATH_RE.lastIndex = 0;
      while ((m = PATH_RE.exec(lg.text))) {
        var ps = m.index + m[0].indexOf(m[1]), pe = ps + m[1].length + (m[2] ? m[2].length + 1 : 0) + (m[3] ? m[3].length + 1 : 0);
        if (idx >= ps && idx < pe) {
          var resolved = view.resolvePath && whole(lg, ps, pe) ? view.resolvePath(m[1]) : null;
          if (resolved) hit = { kind: 'path', path: resolved, display: m[1], line: m[2] ? +m[2] : 0, col: m[3] ? +m[3] : 0, s: ps, e: pe };
          break;
        }
      }
    }
    if (!hit) return null;
    var a = lg.map[hit.s], b = lg.map[hit.e - 1];
    hit.abs = a.abs; hit.x0 = a.x; hit.x1 = (b.abs === a.abs ? b.x : line.cols - 1) + 1;
    return hit;
  }
  T.linkAt = linkAt;

  function bind(view) {
    var scr = view.screen, sel = null, dragging = false, autoscroll = 0;
    var tip = document.createElement('div'); tip.className = 'pmt-linktip'; tip.hidden = true; view.overlays.appendChild(tip);
    var modKey = function (e) { return T.keys.mac ? e.metaKey : e.ctrlKey; };

    function innerShell() { var sh = view.session.shell; while (sh && sh.child) sh = sh.child; return sh; }
    view.resolvePath = function (p) {
      var sh = innerShell();
      if (!sh || !sh.vfs) return null;
      try {
        var full = sh.vfs.resolve(sh.cwd, p.replace(/^~/, sh.home()));
        var st = sh.vfs.stat(full);
        return st && st.type === 'file' ? full : null;
      } catch (e) { return null; }
    };
    /* D7, one tab per file: the host knows a project file by its project-relative path (file:src/main.rs), so a file on
       this machine inside the project's repository opens as that path; a remote file or one outside stays absolute */
    function editorPath(full, local) {
      var vfs = view.session.vfs, repo = local && vfs && vfs.repoFor ? vfs.repoFor(full.replace(/\/[^\/]*$/, '') || '/') : null;
      return repo && full.indexOf(repo.root + '/') === 0 ? full.slice(repo.root.length + 1) : full;
    }
    view.clearSelection = function () { view.selection = null; view.schedule(); };
    view.copySelection = function () {
      if (!view.selection) return;
      var t = view.selection.text(view.term);
      view.copyText(t);
    };
    view.selectAll = function () {
      var b = view.term.buf;
      view.selection = new Selection({ abs: b.trimmed, x: 0 }, { abs: b.trimmed + b.lines.length - 1, x: b.cols - 1 });
      view.schedule();
    };
    view.selectCommandOutput = function (cmd) {
      var buf = view.term.primary, a = buf.absOf(cmd.outputLine), e = cmd.endLine ? buf.absOf(cmd.endLine) - (cmd.endCol === 0 ? 1 : 0) : buf.trimmed + buf.lines.length - 1;
      if (a < 0) return;
      view.selection = new Selection({ abs: a, x: 0 }, { abs: Math.max(a, e), x: buf.cols - 1 });
      view.scrollTo(a - 1); view.schedule();
    };
    view.openLink = function (link, e) {
      /* D7: a person's single click on a file reference opens the panel's preview tab (the host's default for a user
         file open); a double click keeps it; Alt opens a new panel */
      var where = e && e.altKey ? 'panel' : 'auto';
      var keep = e && e.detail >= 2;
      var spec, vfs = view.session.vfs, sh = innerShell();
      if (link.kind === 'path') {
        spec = { kind: 'editor', path: editorPath(link.path, !!sh && sh.vfs === vfs), line: link.line || undefined, col: link.col || undefined, where: where };
        if (keep) spec.mode = 'keep';
      }
      else if (link.kind === 'osc8' && /^file:\/\//.test(link.uri)) {
        var host = /^file:\/\/([^/]*)/.exec(link.uri)[1];
        var path = decodeURIComponent(link.uri.replace(/^file:\/\/[^/]*/, '').replace(/#.*$/, ''));
        var mm = /#L?(\d+)(?::(\d+))?$/.exec(link.uri);
        spec = { kind: 'editor', path: editorPath(path, !host || host === 'localhost' || (!!vfs && host === vfs.host)), line: mm ? +mm[1] : undefined, col: mm && mm[2] ? +mm[2] : undefined, where: where };
        if (keep) spec.mode = 'keep';
      }
      else spec = { kind: 'browser', url: link.uri, where: where };
      if (view.api && view.api.open) view.api.open(spec); else if (window.PM_HOME) window.PM_HOME.open(spec);
    };

    function cellOf(e) { return view.cellFromPoint(e.clientX, e.clientY); }
    function mouseToProgram(e, type) {
      var term = view.term; if (!term.modes.mouse || e.shiftKey) return false;
      var c = cellOf(e); if (!c) return true;
      var btn = e.button === 1 ? 1 : e.button === 2 ? 2 : 0;
      var seq = T.Input.encodeMouse(type, btn, T.Input.modBits(e), c.col, c.row, c.px, c.py, term);
      if (seq) view.session.input(seq, 'user');
      return true;
    }
    /* where a cell's top-left corner shows, in overlay px. Full CRT draws the screen warped and inset by its bezel, so an
       overlay goes through the same geometry the pointer is mapped back through (70-view.js cellToOverlay) */
    function overlayAt(col, row) { return view.cellToOverlay(col, row); }
    scr.addEventListener('mousedown', function (e) {
      if (e.target.closest('.pmt-findbar, .pmt-hint, button, input')) return;
      e.preventDefault();
      view.focus();
      if (mouseToProgram(e, 'down')) { dragging = 'program'; return; }
      if (e.button !== 0) return;
      var c = cellOf(e); if (!c) return;
      var link = linkAt(view, c.abs, c.col);
      if (link && modKey(e)) { view.openLink(link, e); return; }
      /* copy mode keeps drawing its own selection: a click moves its cursor there, or extends what v started */
      var cm = view.copyMode;
      if (cm) { cm.b = { abs: c.abs, x: c.col }; if (!cm.selecting) cm.a = { abs: c.abs, x: c.col }; view.selection = cm; view.schedule(); return; }
      var buf = view.term.buf, line = buf.lineAtAbs(c.abs);
      if (e.shiftKey && view.selection) { view.selection.b = { abs: c.abs, x: c.col }; dragging = true; view.schedule(); return; }
      var mode = e.altKey ? 'rect' : e.detail >= 3 ? 'line' : e.detail === 2 ? 'word' : 'normal';
      if (mode === 'word' && line) { var wb = wordBounds(buf, c.abs, c.col); sel = new Selection(wb[0], wb[1], 'normal'); sel.word = true; }
      else if (mode === 'line') { var run = runOf(buf, c.abs); sel = new Selection({ abs: run[0], x: 0 }, { abs: run[1], x: view.term.cols - 1 }, 'line'); sel.run = run; }
      else { sel = new Selection({ abs: c.abs, x: c.col }, { abs: c.abs, x: c.col }, mode); sel.pending = true; sel.startHalf = c.half; }
      view.selection = mode === 'normal' ? null : sel;
      dragging = true;
      view.schedule();
    });
    /* a drag past the top or bottom edge scrolls two lines every 60 ms; the timer runs only while it is out there */
    var autoTimer = 0;
    function setAutoscroll(d) {
      autoscroll = d;
      if (d && !autoTimer) autoTimer = setInterval(function () {
        if (dragging !== true || !autoscroll || !sel) return;
        if (sel.pending) { sel.pending = false; view.selection = sel; }
        view.scrollBy(autoscroll * 2); sel.b = { abs: sel.b.abs + autoscroll * 2, x: sel.b.x };
      }, 60);
      else if (!d && autoTimer) { clearInterval(autoTimer); autoTimer = 0; }
    }
    function onWinMove(e) {
      if (dragging === 'program') { if (view.term.modes.mouse >= 1002) mouseToProgram(e, 'drag'); return; }
      if (!dragging || !sel) return;
      /* the edge first: under Full CRT a point past the warped screen maps to no cell, and the drag still scrolls */
      var r = view.canvas.getBoundingClientRect();
      setAutoscroll(e.clientY < r.top ? -1 : e.clientY > r.bottom ? 1 : 0);
      var c = cellOf(e); if (!c) return;
      var buf = view.term.buf, cols = view.term.cols;
      if (sel.pending) { if (c.abs === sel.a.abs && c.col === sel.a.x && c.half === sel.startHalf) return; sel.pending = false; view.selection = sel; }
      if (sel.word) { var wb = wordBounds(buf, c.abs, c.col); sel.b = (c.abs > sel.a.abs || (c.abs === sel.a.abs && c.col >= sel.a.x)) ? wb[1] : wb[0]; }
      else if (sel.mode === 'line' && sel.run) {
        /* whole logical lines: from the clicked one's first row down to the last row of the one under the pointer, or up */
        var run = runOf(buf, c.abs);
        if (c.abs >= sel.run[0]) { sel.a = { abs: sel.run[0], x: 0 }; sel.b = { abs: run[1], x: cols - 1 }; }
        else { sel.a = { abs: sel.run[1], x: cols - 1 }; sel.b = { abs: run[0], x: 0 }; }
      }
      else if (sel.mode === 'line') sel.b = { abs: c.abs, x: cols - 1 };
      else sel.b = { abs: c.abs, x: c.half && sel.mode !== 'rect' ? c.col : Math.max(0, c.col - (c.col > sel.a.x || c.abs > sel.a.abs ? (c.half ? 0 : 1) : 0)) };
      view.schedule();
    }
    function onWinUp(e) {
      if (dragging === 'program') { mouseToProgram(e, 'up'); dragging = false; return; }
      if (!dragging) return;
      dragging = false; setAutoscroll(0);
      if (sel && sel.pending) { view.selection = null; }
      if (view.selection && view.opts.copyOnSelect) view.copySelection();
      view.schedule();
    }
    function onKeyUp(e) { if (e.key === 'Control' || e.key === 'Meta') scr.classList.remove('pmt-linkhover'); }
    window.addEventListener('mousemove', onWinMove);
    window.addEventListener('mouseup', onWinUp);
    document.addEventListener('keyup', onKeyUp);
    /* window and document outlive the view: closing the tab and Restart session dispose it, and these go with it */
    view.disposers.push(function () {
      window.removeEventListener('mousemove', onWinMove); window.removeEventListener('mouseup', onWinUp);
      document.removeEventListener('keyup', onKeyUp);
      dragging = false; setAutoscroll(0);
    });

    /* the link under the pointer is kept while the pointer stays on one cell and no output arrives */
    var hover = { key: null, link: null };
    view._on(view.term, 'dirty', function () { hover.key = null; });
    scr.addEventListener('mousemove', function (e) {
      if (dragging) return;
      if (view.term.modes.mouse === 1003 && !e.shiftKey) { mouseToProgram(e, 'move'); return; }
      var c = cellOf(e), key = c ? c.abs + ':' + c.col + ':' + view.term.cols + 'x' + view.term.rows : '';
      if (key !== hover.key) { hover.key = key; hover.link = c ? linkAt(view, c.abs, c.col) : null; }
      var link = hover.link;
      var prevKey = view.hoverLinkId + ':' + JSON.stringify(view.hoverRange);
      if (link && link.kind === 'osc8') { view.hoverLinkId = link.linkId; view.hoverRange = null; }
      else if (link) { view.hoverLinkId = 0; view.hoverRange = { abs: link.abs, x0: link.x0, x1: link.x1 }; }
      else { view.hoverLinkId = 0; view.hoverRange = null; }
      if (prevKey !== view.hoverLinkId + ':' + JSON.stringify(view.hoverRange)) view.schedule();
      scr.classList.toggle('pmt-linkhover', !!link && modKey(e));
      if (link) {
        var target = link.kind === 'path' ? link.display + (link.line ? ':' + link.line + (link.col ? ':' + link.col : '') : '') : link.uri;
        tip.textContent = (T.keys.mac ? 'Cmd' : 'Ctrl') + '+click to open ' + (target.length > 70 ? target.slice(0, 69) + '…' : target);
        tip.hidden = false;
        var row = link.abs - view.viewTop(), below = overlayAt(link.x0, row + 1);
        var y = below.top + 4;
        if (y + 28 > view.screen.clientHeight) y = overlayAt(link.x0, row).top - 28;
        tip.style.left = Math.min(view.screen.clientWidth - 260, below.left) + 'px';
        tip.style.top = Math.max(0, y) + 'px';
      } else tip.hidden = true;
    });
    scr.addEventListener('mouseleave', function () { tip.hidden = true; if (view.hoverLinkId || view.hoverRange) { view.hoverLinkId = 0; view.hoverRange = null; view.schedule(); } });
    scr.addEventListener('contextmenu', function (e) {
      if (view.term.modes.mouse && !e.shiftKey) return;
      e.preventDefault();
      var c = cellOf(e), link = c ? linkAt(view, c.abs, c.col) : null;
      var anchor = { x: e.clientX, y: e.clientY, getBoundingClientRect: function () { return { left: e.clientX, top: e.clientY, right: e.clientX, bottom: e.clientY, width: 0, height: 0 }; } };
      var items = [];
      if (link) {
        items.push({ id: 'open-link', label: link.kind === 'path' ? 'Open in editor' : 'Open link', run: function () { view.openLink(link, {}); } });
        items.push({ id: 'copy-link', label: link.kind === 'path' ? 'Copy path' : 'Copy link', run: function () { view.copyText(link.kind === 'path' ? link.display : link.uri); } });
        items.push('-');
      }
      items.push({ id: 'copy', label: 'Copy', shortcut: T.keys.label('copy'), disabled: !view.selection, run: function () { view.copySelection(); } });
      items.push({ id: 'paste', label: 'Paste', shortcut: T.keys.label('paste'), run: function () { if (navigator.clipboard) navigator.clipboard.readText().then(function (t) { view.paste(t); }).catch(function () {}); } });
      items.push({ id: 'select-all', label: 'Select all', run: function () { view.selectAll(); } });
      items.push('-');
      items.push({ id: 'find', label: 'Find', shortcut: T.keys.label('find'), run: function () { view.openFind(); } });
      items.push({ id: 'clear', label: 'Clear', shortcut: T.keys.label('clear'), run: function () { view.clearScreen(); } });
      view.menu(items, anchor);
    });

    /* ---- copy mode ---- */
    view.startCopyMode = function () {
      if (view.copyMode) return;
      var b = view.term.buf, cur = { abs: b.abs(b.cursor.y), x: b.cursor.x };
      var s = new Selection(Object.assign({}, cur), Object.assign({}, cur), 'normal');
      s.copyMode = true; s.selecting = false;
      view.selection = s; view.copyMode = s;
      view.root.classList.add('pmt-copymode');
      showHint('Copy mode · arrows or h j k l move · w b word · v select · V lines · Ctrl+V block · y copies · / finds · Esc leaves');
      view.announce('Copy mode. Arrow keys or h j k l move, v starts a selection, y copies, Escape leaves.');
      view.input.addEventListener('keydown', copyKeys, true);
      view.schedule();
    };
    function endCopy(copy) {
      var s = view.copyMode; if (!s) return;
      if (copy && s.selecting) view.copySelection();
      view.copyMode = null; view.selection = null;
      view.root.classList.remove('pmt-copymode'); hideHint();
      view.input.removeEventListener('keydown', copyKeys, true);
      view.scrollTo(view.bottomAbs());
      view.schedule();
    }
    function copyKeys(e) {
      var s = view.copyMode; if (!s) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var b = view.term.buf, p = s.b, k = e.key;
      var line = function (abs) { return b.lineAtAbs(abs); };
      var move = function (abs, x) {
        abs = T.util.clamp(abs, b.trimmed, b.trimmed + b.lines.length - 1); x = T.util.clamp(x, 0, b.cols - 1);
        s.b = { abs: abs, x: x }; if (!s.selecting) s.a = { abs: abs, x: x };
        var top = view.viewTop();
        if (abs < top) view.scrollTo(abs); else if (abs >= top + b.rows) view.scrollTo(abs - b.rows + 1);
        view.schedule();
      };
      if (k === 'Escape' || k === 'q') { endCopy(false); return; }
      if (k === 'y' || k === 'Enter') { endCopy(true); return; }
      if (k === 'ArrowLeft' || k === 'h') return move(p.abs, p.x - 1);
      if (k === 'ArrowRight' || k === 'l') return move(p.abs, p.x + 1);
      if (k === 'ArrowUp' || k === 'k') return move(p.abs - 1, p.x);
      if (k === 'ArrowDown' || k === 'j') return move(p.abs + 1, p.x);
      if (k === '0' || k === 'Home') return move(p.abs, 0);
      if (k === '$' || k === 'End') { var L = line(p.abs); return move(p.abs, L ? Math.max(0, L.lastUsed() - 1) : 0); }
      if (k === 'g') return move(b.trimmed, 0);
      if (k === 'G') return move(b.trimmed + b.lines.length - 1, 0);
      if (k === 'PageUp' || (e.ctrlKey && k === 'u')) return move(p.abs - b.rows + 1, p.x);
      if (k === 'PageDown' || (e.ctrlKey && k === 'd')) return move(p.abs + b.rows - 1, p.x);
      if (k === 'w' || k === 'b' || k === 'e') {
        var L2 = line(p.abs); if (!L2) return;
        var x = p.x, isW = function (c) { return c && c !== 32; };
        if (k === 'w') { while (x < b.cols - 1 && isW(L2.cp[x])) x++; while (x < b.cols - 1 && !isW(L2.cp[x])) x++; }
        else if (k === 'b') { if (x > 0) x--; while (x > 0 && !isW(L2.cp[x])) x--; while (x > 0 && isW(L2.cp[x - 1])) x--; }
        else { if (x < b.cols - 1) x++; while (x < b.cols - 1 && !isW(L2.cp[x])) x++; while (x < b.cols - 1 && isW(L2.cp[x + 1])) x++; }
        return move(p.abs, x);
      }
      if (k === 'v' && !e.ctrlKey) { s.selecting = !s.selecting || s.mode !== 'normal'; s.mode = 'normal'; s.a = Object.assign({}, p); view.schedule(); return; }
      if (k === 'V') { s.selecting = true; s.mode = 'line'; s.a = Object.assign({}, p); view.schedule(); return; }
      if (k === 'v' && e.ctrlKey) { s.selecting = true; s.mode = 'rect'; s.a = Object.assign({}, p); view.schedule(); return; }
      if (k === '/' || k === '?') { endCopy(false); view.openFind(); return; }
    }

    /* ---- quick select hints ---- */
    view.startHints = function () {
      if (view.hints) return endHints();
      var b = view.term.buf, top = view.viewTop(), bottom = top + b.rows, found = [], seen = {}, done = top - 1;
      /* logical lines (soft wraps joined), so a wrapped URL or path is offered whole; its label sits on its first cell
         in view. A hash or address inside a URL or path already offered is part of it, not a hint of its own. */
      for (var y = 0; y < b.rows; y++) {
        var abs = top + y; if (abs <= done || !b.lineAtAbs(abs)) continue;
        var lg = logical(b, abs), spans = []; if (!lg.map.length) continue;
        done = lg.map[lg.map.length - 1].abs;
        [[URL_RE, 'url'], [PATH_RE, 'path'], [HASH_RE, 'hash'], [IP_RE, 'ip']].forEach(function (pair) {
          var re = pair[0], kind = pair[1], mm; re.lastIndex = 0;
          while ((mm = re.exec(lg.text))) {
            var val = kind === 'path' ? mm[1] + (mm[2] ? ':' + mm[2] : '') + (mm[3] ? ':' + mm[3] : '') : mm[0];
            var at = kind === 'path' ? mm.index + mm[0].indexOf(mm[1]) : mm.index, end = at + val.length;
            if (kind === 'path' && !/\/|:\d/.test(val)) continue;
            if (!whole(lg, at, end) || spans.some(function (sp) { return at >= sp[0] && at < sp[1]; })) continue;
            var c = null;
            for (var i = at; i < end; i++) { var p = lg.map[i]; if (p.abs >= bottom) break; if (p.abs >= top) { c = p; break; } }
            if (!c) continue;
            if (kind === 'url' || kind === 'path') spans.push([at, end]);
            var key = c.abs + ':' + c.x;
            if (seen[key]) continue; seen[key] = true;
            found.push({ abs: c.abs, x: c.x, value: val, kind: kind });
          }
        });
      }
      if (!found.length) { view.announce('Nothing to select'); return; }
      var letters = 'asdfghjklqwertyuiopzxcvbnm', labels = [];
      for (var i = 0; i < found.length; i++) labels.push(found.length <= letters.length ? letters[i] : letters[Math.floor(i / letters.length)] + letters[i % letters.length]);
      var layer = document.createElement('div'); layer.className = 'pmt-hints';
      found.forEach(function (f, i) {
        f.label = labels[i];
        var h = document.createElement('span'); h.className = 'pmt-hint'; h.textContent = f.label;
        var o = overlayAt(f.x, f.abs - top);
        h.style.left = o.left + 'px'; h.style.top = o.top + 'px';
        layer.appendChild(h);
      });
      view.overlays.appendChild(layer);
      view.hints = { layer: layer, found: found, typed: '' };
      showHint('Quick select · type a label to copy · Shift+label inserts at the prompt · Alt+label opens · Esc cancels');
      view.input.addEventListener('keydown', hintKeys, true);
    };
    function endHints() { if (!view.hints) return; view.hints.layer.remove(); view.hints = null; hideHint(); view.input.removeEventListener('keydown', hintKeys, true); }
    function hintKeys(e) {
      var H = view.hints; if (!H) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.key === 'Escape') return endHints();
      if (!/^[a-z]$/i.test(e.key)) return;
      H.typed += e.key.toLowerCase();
      var hit = H.found.find(function (f) { return f.label === H.typed; });
      var partial = H.found.some(function (f) { return f.label.indexOf(H.typed) === 0; });
      if (hit) {
        endHints();
        if (e.altKey && (hit.kind === 'url' || hit.kind === 'path')) {
          var lk = hit.kind === 'url' ? { kind: 'url', uri: hit.value } : null;
          if (hit.kind === 'path') { var mm = /^(.*?)(?::(\d+))?(?::(\d+))?$/.exec(hit.value); var rp = view.resolvePath(mm[1]); if (rp) lk = { kind: 'path', path: rp, line: mm[2] ? +mm[2] : 0, col: mm[3] ? +mm[3] : 0 }; }
          if (lk) view.openLink(lk, {});
        } else if (e.shiftKey) { view.session.input(hit.value, 'user'); }
        else view.copyText(hit.value);
      } else if (!partial) { H.typed = ''; }
    }

    var hintEl = null;
    function showHint(text) {
      if (!hintEl) { hintEl = document.createElement('div'); hintEl.className = 'pmt-modehint'; view.overlays.appendChild(hintEl); }
      hintEl.textContent = text; hintEl.hidden = false;
    }
    function hideHint() { if (hintEl) hintEl.hidden = true; }
  }

  T.Select = { bind: bind, Selection: Selection, linkAt: linkAt };
})();
