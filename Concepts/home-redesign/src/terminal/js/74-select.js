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

  function wordBounds(line, x) {
    var isWord = function (c) { return c && /[\w.\-\/~:@%+=#?&]/.test(String.fromCodePoint(c)); };
    if (!isWord(line.cp[x])) return [x, x];
    var s = x, e = x;
    while (s > 0 && (isWord(line.cp[s - 1]) || (line.fl[s - 1] & CELL.SPACER))) s--;
    while (e < line.cols - 1 && (isWord(line.cp[e + 1]) || (line.fl[e + 1] & CELL.SPACER))) e++;
    return [s, e];
  }

  /* logical text of the line at abs (joined across soft wraps) with a map back to cells */
  function logical(buf, abs) {
    var start = abs;
    while (start > buf.trimmed) { var prev = buf.lineAtAbs(start - 1); if (!prev || !prev.wrapped) break; start--; }
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
      cur++;
    }
    return { text: text, map: map };
  }

  /* the link under a cell: OSC 8 first, then detected URLs and verified file paths */
  function linkAt(view, abs, x) {
    var term = view.term, buf = term.buf, line = buf.lineAtAbs(abs); if (!line) return null;
    var st = term.styles.get(line.st[x]);
    if (st.link) {
      var L = term.links.get(st.link);
      var x0 = x, x1 = x; while (x0 > 0 && term.styles.get(line.st[x0 - 1]).link === st.link) x0--; while (x1 < line.cols - 1 && term.styles.get(line.st[x1 + 1]).link === st.link) x1++;
      return { kind: 'osc8', uri: L.uri, linkId: st.link, abs: abs, x0: x0, x1: x1 + 1 };
    }
    var lg = logical(buf, abs), m, hit = null;
    var idx = -1;
    for (var i = 0; i < lg.map.length; i++) if (lg.map[i].abs === abs && lg.map[i].x === x) { idx = i; break; }
    if (idx < 0) return null;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(lg.text))) {
      if (idx >= m.index && idx < m.index + m[0].length) { hit = { kind: 'url', uri: m[0], s: m.index, e: m.index + m[0].length }; break; }
    }
    if (!hit) {
      PATH_RE.lastIndex = 0;
      while ((m = PATH_RE.exec(lg.text))) {
        var ps = m.index + m[0].indexOf(m[1]), pe = ps + m[1].length + (m[2] ? m[2].length + 1 : 0) + (m[3] ? m[3].length + 1 : 0);
        if (idx >= ps && idx < pe) {
          var resolved = view.resolvePath ? view.resolvePath(m[1]) : null;
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

    view.resolvePath = function (p) {
      var sh = view.session.shell; while (sh && sh.child) sh = sh.child;
      if (!sh || !sh.vfs) return null;
      try {
        var full = sh.vfs.resolve(sh.cwd, p.replace(/^~/, sh.home()));
        var st = sh.vfs.stat(full);
        return st && st.type === 'file' ? full : null;
      } catch (e) { return null; }
    };
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
      var spec;
      if (link.kind === 'path') { spec = { kind: 'editor', path: link.path, line: link.line || undefined, col: link.col || undefined, where: where }; if (keep) spec.mode = 'keep'; }
      else if (link.kind === 'osc8' && /^file:\/\//.test(link.uri)) {
        var path = decodeURIComponent(link.uri.replace(/^file:\/\/[^/]*/, '').replace(/#.*$/, ''));
        var mm = /#L?(\d+)(?::(\d+))?$/.exec(link.uri);
        spec = { kind: 'editor', path: path, line: mm ? +mm[1] : undefined, col: mm && mm[2] ? +mm[2] : undefined, where: where }; if (keep) spec.mode = 'keep';
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
    scr.addEventListener('mousedown', function (e) {
      if (e.target.closest('.pmt-findbar, .pmt-hint, button, input')) return;
      e.preventDefault();
      view.focus();
      if (mouseToProgram(e, 'down')) { dragging = 'program'; return; }
      if (e.button !== 0) return;
      var c = cellOf(e); if (!c) return;
      var link = linkAt(view, c.abs, c.col);
      if (link && modKey(e)) { view.openLink(link, e); return; }
      var line = view.term.buf.lineAtAbs(c.abs);
      if (e.shiftKey && view.selection) { view.selection.b = { abs: c.abs, x: c.col }; dragging = true; view.schedule(); return; }
      var mode = e.altKey ? 'rect' : e.detail >= 3 ? 'line' : e.detail === 2 ? 'word' : 'normal';
      if (mode === 'word' && line) { var wb = wordBounds(line, c.col); sel = new Selection({ abs: c.abs, x: wb[0] }, { abs: c.abs, x: wb[1] }, 'normal'); sel.word = true; }
      else if (mode === 'line') sel = new Selection({ abs: c.abs, x: 0 }, { abs: c.abs, x: view.term.cols - 1 }, 'line');
      else { sel = new Selection({ abs: c.abs, x: c.col }, { abs: c.abs, x: c.col }, mode); sel.pending = true; sel.startHalf = c.half; }
      view.selection = mode === 'normal' ? null : sel;
      dragging = true;
      view.schedule();
    });
    window.addEventListener('mousemove', function (e) {
      if (dragging === 'program') { if (view.term.modes.mouse >= 1002) mouseToProgram(e, 'drag'); return; }
      if (!dragging) return;
      var c = cellOf(e); if (!c || !sel) return;
      var r = view.canvas.getBoundingClientRect();
      autoscroll = e.clientY < r.top ? -1 : e.clientY > r.bottom ? 1 : 0;
      if (sel.pending) { if (c.abs === sel.a.abs && c.col === sel.a.x && c.half === sel.startHalf) return; sel.pending = false; view.selection = sel; }
      if (sel.word) { var line = view.term.buf.lineAtAbs(c.abs); if (line) { var wb = wordBounds(line, c.col); sel.b = { abs: c.abs, x: (c.abs > sel.a.abs || (c.abs === sel.a.abs && c.col >= sel.a.x)) ? wb[1] : wb[0] }; } }
      else if (sel.mode === 'line') sel.b = { abs: c.abs, x: view.term.cols - 1 };
      else sel.b = { abs: c.abs, x: c.half && sel.mode !== 'rect' ? c.col : Math.max(0, c.col - (c.col > sel.a.x || c.abs > sel.a.abs ? (c.half ? 0 : 1) : 0)) };
      view.schedule();
    });
    window.addEventListener('mouseup', function (e) {
      if (dragging === 'program') { mouseToProgram(e, 'up'); dragging = false; return; }
      if (!dragging) return;
      dragging = false; autoscroll = 0;
      if (sel && sel.pending) { view.selection = null; }
      if (view.selection && view.opts.copyOnSelect) view.copySelection();
      view.schedule();
    });
    setInterval(function () { if (dragging === true && autoscroll && sel) { view.scrollBy(autoscroll * 2); sel.b = { abs: sel.b.abs + autoscroll * 2, x: sel.b.x }; } }, 60);

    scr.addEventListener('mousemove', function (e) {
      if (dragging) return;
      if (view.term.modes.mouse === 1003 && !e.shiftKey) { mouseToProgram(e, 'move'); return; }
      var c = cellOf(e);
      var link = c ? linkAt(view, c.abs, c.col) : null;
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
        var m = view.metrics, top = view.viewTop();
        var y = view.gridTop + (link.abs - top + 1) * m.cellH + 4;
        if (y + 28 > view.screen.clientHeight) y = view.gridTop + (link.abs - top) * m.cellH - 28;
        tip.style.left = Math.min(view.screen.clientWidth - 260, view.gridLeft + link.x0 * m.cellW) + 'px';
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
    document.addEventListener('keyup', function (e) { if (e.key === 'Control' || e.key === 'Meta') scr.classList.remove('pmt-linkhover'); });

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
      var b = view.term.buf, top = view.viewTop(), m = view.metrics, found = [], seen = {};
      for (var y = 0; y < b.rows; y++) {
        var abs = top + y, lnObj = b.lineAtAbs(abs); if (!lnObj) continue;
        var text = lnObj.text(0, lnObj.cols, { keepTrailing: true });
        [[URL_RE, 'url'], [PATH_RE, 'path'], [HASH_RE, 'hash'], [IP_RE, 'ip']].forEach(function (pair) {
          var re = pair[0], mm; re.lastIndex = 0;
          while ((mm = re.exec(text))) {
            var val = pair[1] === 'path' ? mm[1] + (mm[2] ? ':' + mm[2] : '') + (mm[3] ? ':' + mm[3] : '') : mm[0];
            var at = pair[1] === 'path' ? mm.index + mm[0].indexOf(mm[1]) : mm.index;
            if (pair[1] === 'path' && !/\/|:\d/.test(val)) continue;
            var key = abs + ':' + at;
            if (seen[key]) continue; seen[key] = true;
            found.push({ abs: abs, x: cellIndex(lnObj, at), value: val, kind: pair[1] });
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
        h.style.left = (view.gridLeft + f.x * m.cellW) + 'px'; h.style.top = (view.gridTop + (f.abs - top) * m.cellH) + 'px';
        layer.appendChild(h);
      });
      view.overlays.appendChild(layer);
      view.hints = { layer: layer, found: found, typed: '' };
      showHint('Quick select · type a label to copy · Shift+label inserts at the prompt · Alt+label opens · Esc cancels');
      view.input.addEventListener('keydown', hintKeys, true);
    };
    function cellIndex(lnObj, strIdx) {
      var n = 0;
      for (var x = 0; x < lnObj.cols; x++) { if (lnObj.fl[x] & CELL.SPACER) continue; if (n >= strIdx) return x; n += (lnObj.cp[x] ? lnObj.chars(x).length : 1); }
      return 0;
    }
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
