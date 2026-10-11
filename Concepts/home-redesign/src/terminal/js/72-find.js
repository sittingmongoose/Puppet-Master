/* Find overlay (D13): regex, case, whole word, highlight all, a count, next and previous. Matches are found on
   logical lines (soft wraps joined) across the whole scrollback, capped at 10,000, and refreshed after output while
   the bar is open. Search colours are scheme roles (searchMatch, searchCurrent), never a stripe. */
(function () {
  var CELL = T.CELL, MAX = 10000;
  var ICON = {
    prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg>',
    next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>'
  };

  function FindState(view) {
    this.view = view; this.q = ''; this.regex = false; this.caseSens = false; this.word = false;
    this.matches = []; this.index = -1; this.byAbs = new Map(); this.error = false;
  }
  FindState.prototype.run = function (keepIndex) {
    var term = this.view.term, buf = term.buf, q = this.q;
    var prev = this.matches[this.index];
    this.matches = []; this.byAbs = new Map(); this.error = false;
    if (!q) { this.index = -1; return; }
    var re;
    try {
      var src = this.regex ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (this.word) src = '\\b' + src + '\\b';
      re = new RegExp(src, this.caseSens ? 'g' : 'gi');
    } catch (e) { this.error = true; this.index = -1; return; }
    var start = buf.trimmed, end = buf.trimmed + buf.lines.length;
    for (var abs = start; abs < end && this.matches.length < MAX;) {
      /* logical line */
      var text = '', map = [], cur = abs;
      for (;;) {
        var line = buf.lineAtAbs(cur); if (!line) break;
        var used = line.wrapped ? line.cols : line.lastUsed();
        for (var x = 0; x < used; x++) {
          if (line.fl[x] & CELL.SPACER) continue;
          var ch = line.cp[x] ? line.chars(x) : ' ';
          for (var k = 0; k < ch.length; k++) map.push(cur * 4096 + x);
          text += ch;
        }
        cur++;
        if (!line.wrapped) break;
      }
      if (text) {
        re.lastIndex = 0; var m;
        while ((m = re.exec(text)) && this.matches.length < MAX) {
          if (!m[0].length) { re.lastIndex++; continue; }
          var a = map[m.index], b = map[m.index + m[0].length - 1];
          var mt = { a0: Math.floor(a / 4096), x0: a % 4096, a1: Math.floor(b / 4096), x1: b % 4096 + 1 };
          this.matches.push(mt);
          for (var r = mt.a0; r <= mt.a1; r++) {
            var list = this.byAbs.get(r) || []; list.push(mt); this.byAbs.set(r, list);
          }
        }
      }
      abs = cur;
    }
    if (keepIndex && prev) {
      var i = this.matches.findIndex(function (mm) { return mm.a0 === prev.a0 && mm.x0 === prev.x0; });
      this.index = i >= 0 ? i : Math.min(this.index, this.matches.length - 1);
    } else {
      /* first match at or above the bottom of the view, searching upward like a terminal */
      var top = this.view.viewTop() + buf.rows;
      this.index = -1;
      for (var j = this.matches.length - 1; j >= 0; j--) if (this.matches[j].a0 < top) { this.index = j; break; }
      if (this.index < 0 && this.matches.length) this.index = this.matches.length - 1;
    }
  };
  FindState.prototype.spans = function (abs) {
    var list = this.byAbs.get(abs); if (!list) return null;
    var cur = this.matches[this.index], cols = this.view.term.cols;
    return list.map(function (m) {
      return { x0: abs === m.a0 ? m.x0 : 0, x1: abs === m.a1 ? m.x1 : cols, current: m === cur };
    });
  };
  FindState.prototype.allMatches = function () {
    var cur = this.matches[this.index];
    return this.matches.map(function (m) { return { abs: m.a0, current: m === cur }; });
  };

  function attach(view) {
    view.openFind = function () {
      if (view.findBar) { view.findInput.focus(); view.findInput.select(); return; }
      var st = view.findState = new FindState(view);
      var bar = document.createElement('div');
      bar.className = 'pmt-findbar pmt-calm';
      bar.setAttribute('role', 'search');
      bar.innerHTML =
        '<input class="pmt-find-input" type="text" spellcheck="false" aria-label="Find in terminal" placeholder="Find" data-pm-hover-label="Find in terminal" data-pm-hover-detail="Enter goes up to the previous match, Shift+Enter down to the next" data-pm-hover-visual-suppressed="true">' +
        '<button type="button" class="pmt-find-toggle" data-k="caseSens" aria-pressed="false" data-pm-hover-label="Match case" aria-keyshortcuts="Alt+C" aria-label="Match case">Aa</button>' +
        '<button type="button" class="pmt-find-toggle" data-k="word" aria-pressed="false" data-pm-hover-label="Whole word" aria-keyshortcuts="Alt+W" aria-label="Whole word"><u>ab</u></button>' +
        '<button type="button" class="pmt-find-toggle" data-k="regex" aria-pressed="false" data-pm-hover-label="Regular expression" aria-keyshortcuts="Alt+R" aria-label="Regular expression">.*</button>' +
        '<span class="pmt-find-count" aria-live="polite"></span>' +
        '<button type="button" class="pmt-find-btn" data-a="prev" aria-label="Previous match, upward" aria-keyshortcuts="Enter" data-pm-hover-label="Previous match, upward">' + ICON.prev + '</button>' +
        '<button type="button" class="pmt-find-btn" data-a="next" aria-label="Next match, downward" aria-keyshortcuts="Shift+Enter" data-pm-hover-label="Next match, downward">' + ICON.next + '</button>' +
        '<button type="button" class="pmt-find-btn" data-a="close" aria-label="Close find" aria-keyshortcuts="Escape" data-pm-hover-label="Close find">' + ICON.close + '</button>';
      view.screen.appendChild(bar);
      view.findBar = bar;
      T.Motion.play(bar);
      var input = view.findInput = bar.querySelector('input'), count = bar.querySelector('.pmt-find-count');
      var sel = view.selection ? view.selection.text(view.term) : '';
      if (sel && sel.indexOf('\n') < 0 && sel.length < 200) input.value = sel;
      function update(keep) {
        st.q = input.value; st.run(keep);
        bar.classList.toggle('pmt-find-error', st.error);
        var was = count.textContent;
        count.textContent = st.error ? 'Invalid pattern' : !st.q ? '' : st.matches.length ? (st.index + 1) + ' of ' + st.matches.length + (st.matches.length >= MAX ? '+' : '') : 'No results';
        /* only what the person did in the bar moves the view; the refresh after output (keep) recounts and repaints
           the marks and leaves the scroll position, and following the bottom, alone (and the count does not move) */
        if (!keep) {
          reveal();
          if (count.textContent !== was) {
            /* a search that just found nothing nudges its count once; any other new count rolls in */
            if (count.textContent === 'No results' || st.error) T.Motion.play(count, 'pmt-nudge');
            else if (count.textContent) { count.removeAttribute('data-pmt-dir'); T.Motion.play(count, 'pmt-tick'); }
          }
        }
        view.marksDirty = true; view.schedule();
      }
      function reveal() {
        var m = st.matches[st.index]; if (!m) return;
        var top = view.viewTop(), rows = view.term.rows;
        if (m.a0 < top || m.a0 >= top + rows) view.scrollTo(m.a0 - Math.floor(rows / 2));
      }
      function go(d) {
        if (!st.matches.length) { T.Motion.play(count, 'pmt-nudge'); return; }
        st.index = (st.index + d + st.matches.length) % st.matches.length;
        count.textContent = (st.index + 1) + ' of ' + st.matches.length;
        /* the count rolls the way the match moved (previous is upward), and the match is marked where it landed */
        count.setAttribute('data-pmt-dir', d < 0 ? 'down' : 'up');
        T.Motion.play(count, 'pmt-tick');
        reveal(); view.marksDirty = true; view.schedule();
        ring(st.matches[st.index]);
      }
      /* a ring around the match the person jumped to, for a moment, so the eye finds it; the text under it stays still */
      function ring(m) {
        if (view._findRing) { view._findRing.remove(); view._findRing = null; }
        var mt = view.metrics; if (!m || !mt) return;
        var row = m.a0 - view.viewTop();
        if (row < 0 || row >= view.term.rows) return;
        var x1 = m.a1 === m.a0 ? m.x1 : view.term.cols;
        var a = view.cellToOverlay(m.x0, row), b = view.cellToOverlay(x1, row);
        var r = view._findRing = document.createElement('div');
        r.className = 'pmt-findring pmt-calm';
        r.setAttribute('aria-hidden', 'true');
        r.style.left = (a.left - 3) + 'px'; r.style.top = (a.top - 2) + 'px';
        r.style.width = Math.max(mt.cellW, b.left - a.left) + 6 + 'px'; r.style.height = mt.cellH + 4 + 'px';
        view.overlays.appendChild(r);
        T.Motion.finished(r, function () { r.remove(); if (view._findRing === r) view._findRing = null; });
      }
      input.addEventListener('input', function () { update(false); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? 1 : -1); }
        else if (e.key === 'Escape') { e.preventDefault(); view.closeFind(); }
        else if (e.altKey && /^[cwr]$/i.test(e.key)) { e.preventDefault(); toggle({ c: 'caseSens', w: 'word', r: 'regex' }[e.key.toLowerCase()]); }
        e.stopPropagation();
      });
      function toggle(k) {
        st[k] = !st[k];
        var b = bar.querySelector('[data-k="' + k + '"]'); b.setAttribute('aria-pressed', String(st[k])); b.classList.toggle('pmt-on', st[k]);
        update(false); input.focus();
      }
      bar.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.dataset.k) toggle(t.dataset.k);
        else if (t.dataset.a === 'prev') go(-1);
        else if (t.dataset.a === 'next') go(1);
        else if (t.dataset.a === 'close') view.closeFind();
      });
      /* keep results current while output arrives */
      var timer = 0;
      view._findOff = view.term.on('dirty', function () { clearTimeout(timer); timer = setTimeout(function () { if (view.findBar) update(true); }, 160); });
      input.focus(); input.select();
      update(false);
    };
    view.closeFind = function () {
      if (!view.findBar) return;
      /* the bar plays its exit and is gone for everything else at once: a new Find opens a fresh bar */
      var bar = view.findBar;
      bar.setAttribute('aria-hidden', 'true'); bar.inert = true;
      T.Motion.leave(bar, function () { bar.remove(); });
      view.findBar = null; view.findState = null;
      if (view._findRing) { view._findRing.remove(); view._findRing = null; }
      if (view._findOff) view._findOff();
      view.marksDirty = true; view.schedule(true);
      view.focus();
    };
  }
  T.Find = { attach: attach, FindState: FindState };
})();
