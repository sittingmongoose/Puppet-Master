/* Common widget kinds (owner: content; ARCHITECTURE.md section 4.7, DESIGN-SPEC section 4, DESIGN-SPEC-ATLAS sections 3, 6,
   7 and 9). Each kind is PMU.widgets.kind(name, {render(body, ctx), update(body, ctx), enter(body, ctx, delay), destroy}).

   Content tiers come from the measured body (ctx.tier: w xs..xl, h h0..h4, bw, bh). A kind never shows a half row, a clipped
   label or a peeking next tier: rows are counted from known row heights against ctx.tier.bh and the rest are hidden whole
   ("N more at a taller size"). Charts come from PMU.charts only (created with enter:false; the kind plays them from
   enter()). Values count up on the first entrance and count from the old value on an update (then pulse).

   PMU.content is the shared helper set of every content file (50, 52, 54, 70, 72, 74). */
(function () {
  var C = PMU.content = PMU.content || {};
  var st = PMU.core.state;
  var W_RANK = { xs: 0, s: 1, m: 2, l: 3, xl: 4 }, H_RANK = { h0: 0, h1: 1, h2: 2, h3: 3, h4: 4 };

  /* ------------------------------------------------------------------ tiers, delay, config */
  C.w = function (ctx, t) { return W_RANK[ctx.tier.w] >= W_RANK[t]; };
  C.h = function (ctx, t) { return H_RANK[ctx.tier.h] >= H_RANK[t]; };
  C.delay = function (ctx, extra) {
    var card = ctx && ctx.card, rank = 0;
    if (card && card.parentNode) {
      var cards = Array.prototype.slice.call(card.parentNode.querySelectorAll('.pmu-card'));
      cards.sort(function (a, b) { return (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); });
      rank = Math.max(0, cards.indexOf(card));
    }
    return Math.min(480, 32 * rank) + (extra == null ? 160 : extra);
  };
  /* persisted widget configuration (the gear; engine: PMU.board.config / setConfig, one cmd.widget.configure, kept in
     the layout record's configuration_refs) and local view state (search text, page, filters, open rows: no command) */
  function optOf(id, key) { var def = PMU.widgets.get(id); return def && Array.isArray(def.config) ? def.config.filter(function (o) { return (o.id || o.key) === key; })[0] : null; }
  C.cfg = function (id, key, dflt) {
    var c = PMU.board && PMU.board.config ? PMU.board.config(id) || {} : (st.config && st.config[id]) || {};
    if (c[key] != null) return c[key];
    var o = optOf(id, key);
    if (o) { var v = typeof o.value === 'function' ? null : o.value != null ? o.value : o.dflt; if (v != null) return v; }
    return dflt;
  };
  C.setCfg = function (id, key, value) {
    if (C.cfg(id, key) === value) return false;
    var patch = {}; patch[key] = value;
    if (PMU.board && PMU.board.setConfig) { PMU.board.setConfig(id, patch); return true; }
    st.config = st.config || {}; st.config[id] = st.config[id] || {}; st.config[id][key] = value;
    var card = PMU.board && PMU.board.card ? PMU.board.card(id) : null;
    if (card && PMU.cards && PMU.cards.updateAll) PMU.cards.updateAll([card], 'config');
    return true;
  };
  var views = {};
  C.view = function (id, key, dflt) { var v = views[id] && views[id][key]; return v == null ? dflt : v; };
  C.setView = function (id, patch, rerender) {
    views[id] = Object.assign(views[id] || {}, patch);
    viewAction('view.usage.widget_view', { widget_id: id, patch: patch });
    if (rerender !== false) { var card = PMU.board && PMU.board.card ? PMU.board.card(id) : null; if (card && PMU.cards && PMU.cards.updateAll) PMU.cards.updateAll([card], 'view'); }
  };
  /* head tools (A1 3.1): into the card head (ctx.head) from width tier l, else the first line of the body */
  /* They go in the head only when the whole title, the head tools and the hover tools cluster (108 px) fit on the line,
     measured in the theme face; otherwise they are the body's first line. A title is never squeezed by a legend. */
  var TOOLS_RESERVE = 108;
  var headToolsIn = {};
  C.headTools = function (ctx, html, minTier) {
    /* a dry render (the in-place checks) never touches the live head: it repeats the last decision */
    if (ctx.body && ctx.body._pmuDry || ctx._dry) return html && headToolsIn[ctx.id] ? '' : html ? '<div class="pmu-bodytools">' + html + '</div>' : '';
    if (!html) { headToolsIn[ctx.id] = false; if (ctx.head) ctx.head.innerHTML = ''; return ''; }
    if (ctx.head && C.w(ctx, minTier || 'l')) {
      ctx.head.innerHTML = html;
      var card = ctx.head.closest('.pmu-card'), title = card && card.querySelector('.pmu-cardtitle'), key = card && card.querySelector('.pmu-cardkey:not([hidden])');
      var avail = (card ? card.clientWidth : ctx.tier.bw + 28) - 28;
      var need = (title ? title.scrollWidth : 0) + ctx.head.scrollWidth + TOOLS_RESERVE + 10 + (key ? key.offsetWidth + 10 : 0);
      if (need <= avail) { headToolsIn[ctx.id] = true; return ''; }
    }
    headToolsIn[ctx.id] = false;
    if (ctx.head) ctx.head.innerHTML = '';
    return '<div class="pmu-bodytools">' + html + '</div>';
  };

  /* a note icon (a chart's caveat) that has no line in the body goes into the card head beside the title (CONTENT-3: the
     forecast's caveat was nowhere at 10 x 7); a dry render never touches the live head */
  C.headNote = function (ctx, body, html) {
    if (!html || !ctx.head || ctx._dry || (body && body._pmuDry)) return false;
    ctx.head.insertAdjacentHTML('beforeend', html);
    return true;
  };

  /* the quiet count of what a small card folds (round 3: rows of tiles each printing "6 more facts" read as a wall): the
     count sits in the card head ("+6" with a layers glyph, 12 px ink-3) and its hover tag lists every folded reading;
     Details lists them too (C.inspectAll). The body gets the line's room back. Idempotent per render; a dry render never
     touches the live head. */
  C.headMore = function (ctx, body, items) {
    if (!ctx || !ctx.head || ctx._dry || (body && body._pmuDry)) return false;
    var old = ctx.head.querySelector('.pmu-headmore'); if (old) old.remove();
    items = (items || []).filter(Boolean);
    if (!items.length) return false;
    ctx.head.insertAdjacentHTML('afterbegin', C.countHtml(items));
    ctx.head.firstChild._pmuItems = items;
    return true;
  };
  /* the same quiet count as a short row in the body (18 px, right-aligned, no words) where the head has no room */
  C.countRow = function (items) { items = (items || []).filter(Boolean); return items.length ? '<div class="pmu-headmore is-inline is-row"' + C.foldHover(items) + ' data-n="' + items.length + '">' + C.glyph('layers') + '<b>+' + items.length + '</b></div>' : ''; };
  C.countHtml = function (items, inline) { return '<span class="pmu-headmore' + (inline ? ' is-inline' : '') + '"' + C.foldHover(items) + ' data-n="' + items.length + '">' + C.glyph('layers') + '<b>+' + items.length + '</b></span>'; };
  /* small cards use the head count (a tile row, a plan card, an alert, a free or cache card, a single provider plate) */
  C.smallCard = function (ctx) {
    if (!ctx || !ctx.tier || ctx.tier.bw >= 420 || !ctx.head) return false;   /* a dry render decides the same (its markup must match) */
    /* only where the count fits the head beside the title, its key (mark) and its aside (a title never breaks inside a
       word: "OpenCod / e Go", "Claud / e"); a tile's title may take its two lines at word breaks. The engine's own
       titleFits measure (42-cards.js), less the count's 46 px. Canvas measure, no layout read. */
    var card = ctx.head.closest ? ctx.head.closest('.pmu-card') : null, cls = PMU.board && PMU.board.cls ? PMU.board.cls() : null;
    if (!card || !cls || !cls.pitchX || !PMU.charts || !PMU.charts.textW) return false;
    var form = card.getAttribute('data-head') || 'line', nier = document.documentElement.getAttribute('data-o55-nier') === 'on';
    var thm = document.documentElement.getAttribute('data-theme') || '', wide = nier || /^retro/.test(thm), k = wide ? 1.2 : /^glass/.test(thm) ? 1.12 : 1.08;
    var title = ((card.querySelector('.pmu-cardtitle') || {}).textContent || '').replace(/\u2011/g, '-'), aside = ((card.querySelector('.pmu-cardmeta') || {}).textContent || '').trim();
    if (nier) title = title.toUpperCase();
    var px = form === 'plate' ? 15 : form === 'tile' ? 13 : 13.5;
    var tw = function (x) { return (PMU.charts.textW(x, px, false, 640) + (nier ? x.length * px * 0.05 : 0)) * k; };
    /* measured (VM 1920, plan card): head padding 28, the key 18 + its 8 px gap, the count about 44 + its 8 px gap */
    var avail = (+card.dataset.w || 0) * cls.pitchX - 8 - 28 - (card.querySelector('.pmu-cardkey:not([hidden])') ? 26 : 0) - 4
      - (aside ? PMU.charts.textW(aside, 12.5, false, 500) * k + 10 : 0) - 52;
    if (tw(title) <= avail) return true;
    if (form !== 'tile') return false;
    var words = title.split(/\s+/), lines = 1, cur = 0;
    for (var i = 0; i < words.length; i++) {
      var ww = tw(words[i]); if (ww > avail) return false;
      if (cur && cur + tw(' ') + ww > avail) { lines += 1; cur = ww; } else cur += (cur ? tw(' ') : 0) + ww;
    }
    return lines <= 2;
  };

  /* ------------------------------------------------------------------ formatting */
  C.b = function (v) { return '<b>' + esc(v) + '</b>'; };
  /* WOW-SPEC-3 6.3 / WOW-TASKS-3 N3-1: shared ids. data-share="<kind>:<key>" on the smallest element that holds a thing the
     page shows in more than one room (the meter, not the row; the mark, not the head); a window's value text carries
     data-share-v with the same key (the flight's number flyer). Keys: win:<a.key>/<w.key>, acct:<a.key>, prov:<p.id>,
     reset:<ev.key>, num:<metric>, ctl:auto-switch|threshold, chart:budget|context|tokens. */
  C.shareAttr = function (key) { return key ? ' data-share="' + esc(key) + '"' : ''; };
  C.share = function (html, key) { return key && html ? String(html).replace(/^(\s*<[a-zA-Z][\w-]*)/, '$1 data-share="' + esc(key) + '"') : html; };
  C.shareMark = function (pid, size, opts) { return C.share(PMU.mark(pid, size, opts), 'prov:' + pid); };
  /* in-place html of a small tree (NOTES3-perf C5: no innerHTML where the shape is unchanged) */
  C.setHtml = function (el, html) { if (!el) return; if (PMU.charts && PMU.charts.patchHtml) PMU.charts.patchHtml(el, html); else el.innerHTML = html; };
  C.money = function (v, o) {
    if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) return '-';
    var a = Math.abs(v), d = a === 0 ? 2 : a < 0.01 ? 6 : a < 1 ? 4 : 2, parts = a.toFixed(d).split('.');
    return (v < 0 ? '-' : '') + '$' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '') + (o && o.est ? ' est.' : '');
  };
  C.fmt = function (v, f) {
    if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) return '-';
    switch (f) {
      case 'money': return C.money(v);
      case 'money2': return '$' + Number(v).toFixed(2);
      case 'tok': return PMU.fmt.tok(v);
      case 'pct': return PMU.fmt.pct(v);
      case 'pct1': return Number(v).toFixed(1).replace(/\.0$/, '') + '%';
      case 'pct2': return Number(v).toFixed(2) + '%';
      case 'int': return PMU.fmt.num(Math.round(v));
      case 'x': return Number(v).toFixed(1) + 'x';
      case 's': return Number(v).toFixed(1) + 's';
      case 'perday': return PMU.fmt.money(v) + '/d';
      default: return String(v);
    }
  };
  /* a number with a separate unit span for percents (A1 2.3: unit at .88 em, same weight) */
  C.valHtml = function (v, f, cls, key) {
    var pct = f === 'pct' || f === 'pct1' || f === 'pct2';
    var text = C.fmt(v, f), numText = pct ? text.replace(/%$/, '') : text;
    return '<b class="' + (cls || 'pmu-val') + '"><span class="pmu-num"' + (key ? ' data-k="' + esc(key) + '"' : '') + ' data-v="' + (typeof v === 'number' ? v : '') + '" data-f="' + (f || '') + '">' +
      esc(numText) + '</span>' + (pct ? '<span class="pmu-u">%</span>' : '') + '</b>';
  };
  C.numOnly = function (v, f) { var t = C.fmt(v, f); return /^pct/.test(f || '') ? t.replace(/%$/, '') : t; };
  C.hover = function (label, detail) {
    return (label ? ' data-pm-hover-label="' + esc(label) + '"' : '') + (detail ? ' data-pm-hover-detail="' + esc(detail) + '"' : '');
  };
  C.vs = function (state, word) { return PMU.vs.html(state, word); };
  C.glyph = function (name, cls) { return name ? PMU.icon(name, cls || 'pmu-glyph') : ''; };
  /* short: narrow cards drop "at a taller size" so the line stays one line. items: the folded readings (one short text
     each); the line's hover tag lists them, so nothing a card holds is ever hidden silently (CONTENT-3) */
  C.more = function (n, what, short, items) {
    var w = what ? (n === 1 ? String(what).replace(/s$/, '') : what) : (n === 1 ? 'row' : 'rows');
    return n > 0 ? '<div class="pmu-more"' + C.foldHover(items) + '>' + esc(n + ' more ' + w + (short ? '' : ' at a taller size')) + '</div>' : '';
  };
  /* the hover tag of a "N more" line: every folded reading, in reading order */
  C.FOLD_LABEL = 'Not shown at this size';
  C.foldHover = function (items) {
    var list = (items || []).map(function (x) { return String(x == null ? '' : x).replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    return list.length ? C.hover(C.FOLD_LABEL, list.join('; ')) : '';
  };
  /* one reading as one line of text: [label, value] facts, list rows, segments */
  C.factText = function (f) { if (!f) return ''; var o = f[2] || {}; return String(f[0] == null ? '' : f[0]) + ' ' + String(o.vs ? (o.word || f[1]) : f[1] == null ? '' : f[1]).replace(/<[^>]+>/g, ''); };
  /* the text of a rendered row as one line (the hover tag of the fit pass's "N more" line): its text nodes joined by a
     space; a rolling number reads its final value; icons, marks and film layers are skipped */
  C.textOf = function (el) {
    var parts = [];
    (function walk(n) {
      if (n.nodeType === 3) { var tx = n.nodeValue.replace(/\s+/g, ' ').trim(); if (tx) parts.push(tx); return; }
      if (n.nodeType !== 1) return;
      var cls = typeof n.className === 'string' ? n.className : '';
      if (/^svg$/i.test(n.tagName) || n.getAttribute('aria-hidden') === 'true' || /\bpmu-(ico|glyph|film-|odo-layer|pmark)/.test(cls)) return;
      var v = n.getAttribute('data-v');
      if (/\bpmu-num\b/.test(cls) && v != null && v !== '' && isFinite(+v)) { parts.push(C.numOnly(+v, n.getAttribute('data-f') || '')); return; }
      for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
    })(el);
    return parts.join(' ').replace(/ %/g, '%').replace(/\s+/g, ' ').trim();
  };
  /* wrap-aware heights for stacked blocks (values wrap instead of ellipsizing): a fact whose label and value do not fit
     the width on one line takes two (46 px); a free text line takes as many 18 px lines as its measured width needs */
  C.textLines = function (text, bw, px) {
    var w = PMU.charts && PMU.charts.textW ? PMU.charts.textW(String(text || ''), px || 12.5) * 1.06 : String(text || '').length * 7;
    return Math.max(1, Math.ceil(w / Math.max(60, bw)));
  };
  /* a fact is one 27 px line when its label keeps to its 52 % (70-wrap.css) and the value fits beside it (8 px gap,
     600 weight), measured in the theme face; else two lines (CONTENT-3: the old 4-space text estimate called "Settled 9"
     two lines in a 90 px column) */
  /* wrapped, each line is 17 px with 4 px padding above and below (measured: 2 lines 42, 3 lines 60, 4 lines 76) */
  C.factH = function (f, bw, labelShare) {
    var l = PMU.theme.look(), k = l.nier || l.family === 'retro' ? 1.12 : 1, share = labelShare || 0.52;
    var o = f[2] || {}, label = String(f[0] == null ? '' : f[0]), val = String(o.vs ? (o.word || f[1]) : f[1] == null ? '' : f[1]).replace(/<[^>]+>/g, '');
    var lw = k * C.wrapW(label, 12.5), vw = k * C.wrapW(val, 12.5, 600) + (o.vs ? 20 : 0) + (o.glyph ? 18 : 0);
    if (lw <= bw * share && lw + 8 + vw <= bw - 2) return 27;
    var lBox = Math.min(lw, bw * share), lLines = lw <= bw * share ? 1 : C.wrapLines(label, bw * share / k, 12.5);
    var vLines = C.wrapLines(val, Math.max(30, (bw - lBox - 8 - (o.vs ? 20 : 0)) / k), 12.5, 600);
    return Math.max(42, 9 + 17 * Math.max(lLines, vLines, 2));
  };
  /* greedy word wrap in the theme face (POLISH2 content): how many lines a text takes in a column of `width` px. Breaks
     on spaces, "·", "/", "_" and ":" like the page does; a single word wider than the column counts its own lines. */
  var wrapMemo = {}, wrapN = 0;
  /* one line's width in the theme's face (the same measure as C.wrapLines) */
  C.wrapW = function (text, px, weight) { text = String(text == null ? '' : text).replace(/<[^>]+>/g, ''); return PMU.charts && PMU.charts.textW ? PMU.charts.textW(text, px || 13, false, weight || 400) * 1.06 : text.length * (px || 13) * 0.55; };
  /* a provider's Settings name wherever it fits by measure (final fix M8, DECISIONS: every provider name on the page is
     EXACTLY the Settings display name; the short word only where the full name would wrap or be cut). The margin covers
     faces that lay out wider than their canvas measure (NieR's tracked capitals, Retro's mono). */
  C.fitsW = function (text, avail, px, weight) {
    var l = PMU.theme.look(), k = l.nier || l.family === 'retro' ? 1.15 : 1.04;
    var w = PMU.charts && PMU.charts.textW ? PMU.charts.textW(String(text == null ? '' : text), px || 13, false, weight || 400) : String(text || '').length * (px || 13) * 0.58;
    return w * k <= avail;
  };
  /* an account nickname that only repeats its provider's name ("Muse" of Muse Code, "Antigravity" of Google Antigravity,
     "Z.ai" of Z.AI Coding Plan) gives way to the provider's Settings name */
  C.nickRepeats = function (nick, provName) {
    var n = String(nick || '').trim().toLowerCase(), p = String(provName || '').toLowerCase();
    return !!n && (n === p || (' ' + p.replace(/[^a-z0-9.]+/g, ' ') + ' ').indexOf(' ' + n.replace(/[^a-z0-9.]+/g, ' ').trim() + ' ') >= 0);
  };
  C.wrapLines = function (text, width, px, weight) {
    text = String(text == null ? '' : text).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
    if (!text) return 0;
    width = Math.max(24, width || 0);
    var key = text + '|' + Math.round(width) + '|' + (px || 13) + '|' + (weight || 400) + '|' + PMU.theme.look().key;
    if (wrapMemo[key]) return wrapMemo[key];
    var tw = function (s) { return PMU.charts && PMU.charts.textW ? PMU.charts.textW(s, px || 13, false, weight || 400) * 1.06 : s.length * (px || 13) * 0.55; };
    var words = text.split(/(?<=[\s·/_:])/), lines = 1, cur = 0;
    words.forEach(function (w) {
      var ww = tw(w), bare = tw(w.replace(/\s+$/, ''));
      if (cur === 0 || cur + bare <= width) { cur += ww; }
      else { lines += 1; cur = ww; }
      while (cur > width + 0.5 && tw(w.replace(/\s+$/, '')) > width) { lines += 1; cur -= width; }
    });
    if (++wrapN > 4000) { wrapMemo = {}; wrapN = 0; }
    wrapMemo[key] = lines;
    return lines;
  };
  /* an identifier that may wrap: break opportunities after ":", "_", "/" and "." so it never splits inside a word
     (LOOK-REVIEW-2 13: "route:claude:requeste / d") */
  C.idCell = function (text) { return { html: esc(String(text == null ? '' : text)).replace(/([:_/.])(?=[^\s])/g, '$1<wbr>') }; };
  /* the room's hero number (WOW-SPEC 2.6, WOW-TASKS N-2): 40-56 px, tabular, the unit at .55 em, a 2 px accent underline
     the room's beat sweeps; it rolls like an odometer on the entrance (data-count) */
  C.isHero = function (ctx) { return ctx.tier.bw >= 480 && ctx.tier.bh >= 200; };
  C.heroHead = function (ctx, h) {
    /* the head is one 60 px row: the words beside the number keep to two lines. The callout gives way first, then the
       sub line's trailing " · " parts (Mac stills 2026-10-02, 1440: a three-line label column and the "spike" callout
       rose over the card's subtitle) */
    var bw = ctx && ctx.tier ? ctx.tier.bw : 600;
    var twOf = function (str, px, wt) { str = String(str || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' '); return PMU.charts && PMU.charts.textW ? PMU.charts.textW(str, px, false, wt || 400) * 1.06 : str.length * px * 0.58; };
    var numText = h.text != null ? String(h.text) + (h.unit || '') : C.fmt(h.value, h.fmt);
    var textW = bw - twOf(numText, 48, 640) - 14, fullSub = h.sub, fullNote = h.note;
    if (h.note) {
      var noteW = 26 + Math.max.apply(null, String(h.note).split(/<\/(?:b|span)>/).map(function (x) { return twOf(x, 12.5, 600); }));
      if (textW - noteW - 14 < 240) h = Object.assign({}, h, { note: '' }); else textW -= noteW + 14;
    }
    if (h.sub && C.wrapLines(h.label || '', textW, 13.5, 560) + C.wrapLines(h.sub, textW, 12.5) > 2) {
      var segs = String(h.sub).split(' · ');
      while (segs.length > 1 && C.wrapLines(h.label || '', textW, 13.5, 560) + C.wrapLines(segs.join(' · '), textW, 12.5) > 2) segs.pop();
      var sub2 = segs.join(' · ');
      for (var openB = (sub2.match(/<b>/g) || []).length - (sub2.match(/<\/b>/g) || []).length; openB > 0; openB--) sub2 += '</b>';
      h = Object.assign({}, h, { sub: sub2 });
    }
    var num = h.text != null ? '<b class="pmu-heronum"><span class="pmu-num">' + esc(h.text) + '</span>' + (h.unit ? '<span class="pmu-u">' + esc(h.unit) + '</span>' : '') + '</b>'
      : C.valHtml(h.value, h.fmt, 'pmu-heronum', ctx.id + ':hero').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"');
    /* what gave way (trailing parts of the sub line, the callout) stays in the head's hover tag (CONTENT-3) */
    var dropped = [];
    if (fullSub && h.sub !== fullSub) dropped.push(String(fullSub).replace(/<[^>]+>/g, ''));
    if (fullNote && !h.note) dropped.push(String(fullNote).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    return '<div class="pmu-herohead"' + (h.tone ? ' data-tone="' + h.tone + '"' : '') + (dropped.length ? C.hover(String(numText) + ' ' + (h.label || ''), dropped.join(' · ')) : '') + '>' + num + '<span class="pmu-herotext"><span class="pmu-herolabel">' + esc(h.label || '') + '</span>' +
      (h.sub ? '<span class="pmu-herosub">' + h.sub + '</span>' : '') + '</span>' + (h.note ? '<span class="pmu-heronote"' + (h.noteTone ? ' data-tone="' + h.noteTone + '"' : '') + '>' + h.note + '</span>' : '') + '</div>';
  };
  /* room beats (WOW-SPEC 4, WOW-TASKS N-1): helpers for the one-shot signature beat each room file registers with
     PMU.film.beat(room, fn). Every beat is created in the release frame with delays (the compositor runs it), plays
     once, and leaves nothing behind (PMU.film removes its layers). */
  C.beatCards = function (b, test) { return (b.cards || []).filter(function (c) { return c.isConnected && test(c); }); };
  C.beatCard = function (b, id) { return C.beatCards(b, function (c) { return c.getAttribute('data-widget') === id; })[0] || null; };
  C.beatAt = function (b, card, extra) { return (card ? card._pmuEnterDelay || 0 : b.last || 0) + (b.inner || 160) + (extra || 0); };
  C.byPos = function (list) { return list.slice().sort(function (a, z) { return (+a.dataset.y - +z.dataset.y) || (+a.dataset.x - +z.dataset.x); }); };
  C.sweepHero = function (b, card, extra) {
    var f = PMU.film; if (!f || !card) return;
    var head = card.querySelector('.pmu-herohead, .pmu-budgethero.is-hero');
    if (head) f.sweep(head, { delay: C.beatAt(b, card, extra), dur: 700 });
  };
  /* in-place patching (WOW-SPEC 3.9, WOW-TASKS N-3): a kind records each meter with its spec (C.recMeter); a dry run
     of the same render (body._pmuDry, no chart created) gives the next specs and the structure (C.seal: the markup
     without chart DOM and flash signatures). When the structure is the same, C.patch updates every meter in place
     (notches slide, fills slide with their head glow, values roll) and flashes the rows whose reading changed;
     otherwise the kind renders again. */
  C.recMeter = function (body, key, host, spec, opts) {
    var recs = body._pmuMeterRecs || (body._pmuMeterRecs = []);
    recs.push({ key: key, spec: spec, chart: body._pmuDry || !host ? null : C.chart(body, 'meter', host, spec, opts) });
  };
  /* a body's markup without chart DOM, film layers, odometer columns and the app's hover-tag attributes */
  C.liveSig = function (el) {
    var c = el.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('[data-pmu-chart], [class^="pmu-film-"], .pmu-film-flash, .pmu-film-sweep'), function (x) { x.remove(); });
    Array.prototype.forEach.call(c.querySelectorAll('.pmu-odo'), function (x) { var g = x.querySelector('.pmu-odo-ghost'); x.textContent = g ? g.textContent : x.textContent; x.classList.remove('pmu-odo'); });
    return c.innerHTML.replace(/ (?:aria-label|aria-describedby|data-pm-hover-[a-z-]+|data-base)(?:="[^"]*")?/g, '').replace(/ class=""/g, '');
  };
  C.seal = function (body, rootSel, footSel) {
    var root = body.querySelector(rootSel), foot = footSel ? body.querySelector(footSel) : null;
    if (root) { root = root.cloneNode(true); Array.prototype.forEach.call(root.querySelectorAll('[data-pmu-chart]'), function (el) { el.remove(); }); }
    body._pmuSig = root ? root.innerHTML.replace(/ data-flash-sig="[^"]*"/g, '') : '';
    body._pmuFoot = foot ? foot.innerHTML : '';
  };
  C.patch = function (body, renderFn, footSel) {
    if (!body._pmuSig || !body._pmuMeterRecs) return false;
    var dry = document.createElement('div'); dry._pmuDry = true; dry._pmuMeterRecs = [];
    try { renderFn(dry); } catch (error) { return false; }
    var live = body._pmuMeterRecs, next = dry._pmuMeterRecs || [];
    if (dry._pmuSig !== body._pmuSig || next.length !== live.length || next.some(function (r, i) { return r.key !== live[i].key || !live[i].chart; })) return false;
    var ctxP = arguments[3] || null;
    next.forEach(function (r, i) { if (JSON.stringify(live[i].spec) !== JSON.stringify(r.spec)) C.chartTo(live[i].chart, r.spec, ctxP); live[i].spec = r.spec; });
    if (footSel && dry._pmuFoot !== body._pmuFoot) {
      var foot = body.querySelector(footSel);
      if (foot) { if (PMU.charts && PMU.charts.patchHtml) PMU.charts.patchHtml(foot, dry._pmuFoot); else foot.innerHTML = dry._pmuFoot; PMU.motion.animate(foot, [{ opacity: 0.2 }, { opacity: 1 }], { dur: 160, easing: 'cubic-bezier(.22,.8,.28,1)' }); }
      body._pmuFoot = dry._pmuFoot;
    }
    Array.prototype.forEach.call(dry.querySelectorAll('[data-flash-key]'), function (el) {
      var k = el.getAttribute('data-flash-key'), row = body.querySelector('[data-flash-key="' + k + '"]');
      if (row && row.getAttribute('data-flash-sig') !== el.getAttribute('data-flash-sig')) { row.setAttribute('data-flash-sig', el.getAttribute('data-flash-sig')); if (!(ctxP && ctxP.reason === 'live')) flashRow(row); }
    });
    return true;
  };
  /* "1 attempt", "2 attempts" */
  C.plural = function (n, word, many) { return n + ' ' + (n === 1 ? word : (many || word + 's')); };
  /* pace in one unit everywhere (DECISIONS overnight #4): the old fixtures' "+11% vs norm" reads "+11 pts vs norm" */
  C.pace = function (text) { return String(text == null ? '' : text).replace(/([+\-−]?\d+(?:\.\d+)?)\s?%(\s+(?:vs|above|below)\b)/g, '$1 pts$2'); };
  C.fit = function (bh, rowH, reserve) { return Math.max(0, Math.floor((bh - (reserve || 0) + 0.5) / rowH)); };
  C.foot = function (html, glyph, when) {
    return html ? '<div class="pmu-cardfoot pmu-cfoot">' + (glyph ? C.glyph(glyph) : '') + '<span class="pmu-cfoot-text">' + html + '</span>' + (when ? '<span class="pmu-cfoot-when">' + esc(when) + '</span>' : '') + '</div>' : '';
  };
  C.empty = function (sentence, facts) {
    return '<div class="pmu-empty pmu-wempty"><p>' + esc(sentence || 'No results for current filter') + '</p>' + (facts ? '<span>' + esc(facts) + '</span>' : '') + '</div>';
  };
  /* amount lines (A1 3.3): [label, valueHtmlOrText, {glyph, tone, vs, word, html, hover}] */
  C.facts = function (list, max, opts) {
    opts = opts || {};
    var rows = (list || []).slice(0, max == null ? 99 : max);
    return rows.length ? '<div class="pmu-facts' + (opts.cols === 2 ? ' is-2col' : '') + (opts.spans ? ' is-lay' : '') + '"' + (opts.cols > 2 ? ' style="grid-template-columns:repeat(' + opts.cols + ',minmax(0,1fr))"' : '') + '>' + rows.map(function (f, i) {
      var o = f[2] || {}, val = o.vs ? C.vs(o.vs, o.word || f[1]) : o.html ? f[1] : esc(f[1]);
      return '<div class="pmu-fact' + (opts.tops && opts.tops[i] ? ' is-top' : '') + '"' + (opts.spans && opts.spans[i] ? ' style="grid-column:1/-1"' : '') + (o.hover ? C.hover(f[0], o.hover) : '') + (o.tone ? ' data-tone="' + o.tone + '"' : '') + '>' + (o.glyph ? C.glyph(o.glyph) : '') +
        '<span class="pmu-factl">' + esc(f[0]) + '</span><b class="pmu-factv">' + val + '</b></div>';
    }).join('') + '</div>' : '';
  };
  /* fact placement (CONTENT-3): two columns wherever a pair fits side by side (a tile shows "Inferred 0 · Dropped 0" on
     one line instead of folding the second), one column where that saves no height; a fact whose label and value do
     not fit half the width spans its row. fit(budget) -> {n, used}: the facts of the whole rows that fit (the block's
     4 px gap counted once); html(n) the markup of the first n. */
  C.factLayout = function (facts, bw, forceCols, maxCols) {
    facts = facts || [];
    /* columns: two by default; maxCols (the context hero) lets a wide card take three or four of at least 150 px */
    var nCols = forceCols === 1 ? 1 : Math.max(2, Math.min(maxCols || 2, Math.floor((bw + 18) / 168)));
    var place = function (k) {
      var cw = (bw - 18 * (k - 1)) / k;
      var cellOk = facts.map(function (f) { return k > 1 && C.factH(f, cw, 0.72) === 27; });
      var rows = [], spans = [], tops = [], open = null;
      facts.forEach(function (f, i) {
        if (cellOk[i]) {
          if (open && open.n < k) { open.n += 1; open.end = i; if (open.n === k) open = null; }
          else { open = { h: 27, n: 1, end: i }; rows.push(open); if (k === 1) open = null; }
          spans.push(false);
        } else { open = null; rows.push({ h: C.factH(f, bw, 0.72), n: k, end: i }); spans.push(k > 1); }
        tops.push(rows.length === 1);
      });
      return { k: k, rows: rows, spans: spans, tops: tops, total: rows.reduce(function (a, r) { return a + r.h; }, 0) };
    };
    var p = bw >= 170 ? place(nCols) : place(1);
    /* fewer columns where they save no height (a narrow tile keeps one column unless pairs really fit) */
    for (var k = p.k - 1; k >= 1 && bw < 380 * (p.k - 1); k--) { var q = place(k); if (q.total <= p.total) p = q; }
    if (!p.rows.some(function (r) { return r.n > 1 && r.h === 27; }) && p.k > 1 && bw < 380) p = place(1);
    return {
      cols: p.k,
      /* 3 px of tolerance: the estimates lean long, and the fit pass still removes a row that does not fit */
      fit: function (budget) { var used = 4, n = 0; for (var r = 0; r < p.rows.length && used + p.rows[r].h <= budget + 3; r++) { used += p.rows[r].h; n = p.rows[r].end + 1; } return { n: n, used: n ? used : 0 }; },
      html: function (n) { return C.facts(facts, n, { cols: p.k, spans: p.spans, tops: p.tops }); }
    };
  };
  C.tools = function (html) { return html ? '<div class="pmu-bodytools">' + html + '</div>' : ''; };
  /* a two-way text segmented control (no pills): [{value, label}], current */
  C.seg = function (act, options, current, label) {
    return '<span class="pmu-seg pmu-wseg" role="group"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' + options.map(function (o) {
      return '<button type="button" data-pmu-act="' + esc(act) + '" data-value="' + esc(o.value) + '" class="' + (o.value === current ? 'active' : '') + '" aria-pressed="' + (o.value === current) + '"' +
        (o.disabled ? ' disabled data-pm-hover-label="' + esc(o.reason || '') + '"' : '') + '>' + esc(o.label) + '</button>';
    }).join('') + '</span>';
  };
  C.switchBtn = function (act, on, label, hover) {
    return '<button type="button" class="pmu-wswitch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + !!on + '" data-pmu-act="' + esc(act) + '"' + (hover ? C.hover(label, hover) : '') + '>' +
      '<i class="pmu-wswitch-track"><i></i></i><span>' + esc(label) + '</span></button>';
  };

  /* ------------------------------------------------------------------ charts, counts and motion bookkeeping */
  function bag(body) { if (!body._pmu) body._pmu = { charts: [], counts: [], reveal: [], meters: [] }; return body._pmu; }
  C.bag = bag;
  C.chart = function (body, name, host, spec, opts) {
    /* every chart's spec is kept as text, so the in-place checks see a change that lives only in a chart */
    var b0 = bag(body); b0.specs = b0.specs || []; b0.objs = b0.objs || [];
    try { b0.specs.push(name + ':' + JSON.stringify(spec)); } catch (error) { b0.specs.push(name + ':?' + Math.random()); }
    var rec = { name: name, spec: spec, chart: null }; b0.objs.push(rec);
    if (body && body._pmuDry) return null;   /* a dry render (the in-place checks) creates no chart */
    var fn = PMU.charts && PMU.charts[name];
    if (typeof fn !== 'function') return null;
    try {
      var c = fn(host, spec, Object.assign({ enter: false }, opts || {}));
      if (c) bag(body).charts.push(c);
      rec.chart = c || null;
      return c;
    } catch (error) { console.error('[pm-usage] chart ' + name, error); return null; }
  };
  C.destroy = function (body) {
    var b = body && body._pmu; if (!b) return;
    b.charts.forEach(function (c) { try { c.destroy(); } catch (error) {} });
    body._pmu = null;
  };
  /* remember the shown numbers so an update can count from the old value */
  function snapshot(body) {
    var old = {};
    Array.prototype.slice.call(body.querySelectorAll('.pmu-num[data-k]')).forEach(function (el) { var v = parseFloat(el.getAttribute('data-v')); if (isFinite(v)) old[el.getAttribute('data-k')] = v; });
    return old;
  }
  function flashSigs(body) {
    var m = {};
    Array.prototype.slice.call(body.querySelectorAll('[data-flash-key]')).forEach(function (el) { m[el.getAttribute('data-flash-key')] = el.getAttribute('data-flash-sig'); });
    return m;
  }
  C.countFrom = function (body, old) {
    var flashed = [];
    Array.prototype.slice.call(body.querySelectorAll('.pmu-num[data-k]')).forEach(function (el) {
      var k = el.getAttribute('data-k'), to = parseFloat(el.getAttribute('data-v')), f = el.getAttribute('data-f');
      if (!(k in old) || !isFinite(to) || old[k] === to) return;
      PMU.motion.countUp(el, old[k], to, function (v) { return C.numOnly(v, v === to || f !== 'money' ? f : 'money2'); }, { dur: 'value' });
      /* the reading's row or tile flashes once with a light sweep (WOW-SPEC 3.6); values never scale or bounce */
      var host = el.closest('.pmu-lrow, .pmu-accrow, .pmu-qrow, .pmu-kpicell, .pmu-fact, .pmu-mixhead, .pmu-trendhead, .pmu-budgethero, .pmu-cachehead, .pmu-effsave') || el.closest('.pmu-kpiline') || el;
      if (flashed.indexOf(host) < 0) { flashed.push(host); flashRow(host); }
    });
  };
  C.enterAll = function (body, ctx, delay) {
    var d = delay || C.delay(ctx), b = bag(body);
    b.charts.forEach(function (c, i) { try { c.enter(d + i * 40); } catch (error) {} });
    Array.prototype.slice.call(body.querySelectorAll('.pmu-num[data-k][data-count]')).forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-v')), f = el.getAttribute('data-f');
      if (!isFinite(to)) return;
      if (!PMU.motion.reduced()) el.textContent = C.numOnly(0, f === 'money' ? 'money2' : f);
      PMU.motion.countUp(el, 0, to, function (v) { return C.numOnly(v, v === to || f !== 'money' ? f : 'money2'); }, { delay: d, dur: el.getAttribute('data-count') === 'kpi' ? 1000 : 900 });
    });
    var rows = Array.prototype.slice.call(body.querySelectorAll('[data-reveal]'));
    /* integ3: a supporting body (outside the light budget during an entrance) shows its lists with the body, no per-row
       cascade (WOW-SPEC-3 5 Phase C; the GPU arrival had context legend, attention and mix rows cascading under quiet fades) */
    if (rows.length && PMU.film && PMU.film.isQuiet && PMU.film.isQuiet(body)) rows = [];
    if (rows.length) {
      if (PMU.motion.reveal) PMU.motion.reveal(rows, { delay: d - 120, step: 22, cap: 400 });
      else rows.forEach(function (r, i) { PMU.motion.animate(r, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { dur: 480, delay: d - 120 + Math.min(400, i * 22), fill: 'backwards', ease: 'enter' }); });
    }
  };
  /* complete-or-hidden safety net (DESIGN-SPEC 4 rules): after the cards of a pass have rendered, one batched read finds
     the bodies whose content is taller than the body; whole trailing rows are removed (never cut) and one quiet
     "N more at a taller size" line says so. Reads are batched across every card of the pass, then the writes. */
  var FIT_SEL = '.pmu-lrow, .pmu-lday, .pmu-fact, .pmu-tbody > .pmu-trow, .pmu-agline, .pmu-qrow:not(.pmu-qaxis), .pmu-qgroup, .pmu-mixrow, .pmu-ctxleg, ' +
    '.pmu-amount, .pmu-limitplan, .pmu-accrow, .pmu-provrow, .pmu-swfam, .pmu-setupnote, .pmu-factrow, .pmu-note, .pmu-agbeyond, .pmu-effsave > em, .pmu-effcost, .pmu-efflegend, .pmu-effspark, .pmu-kpitrend, .pmu-kpifoot, .pmu-cfoot';
  var fitQueue = [], fitScheduled = false, fitAgain = [], fitAgainScheduled = false;
  /* NOTES3-perf C1: while the engine builds a room in slices it may set PMU.content.fitDefer = true and call
     PMU.content.fitSlice() at the end of each slice (one batched read for the cards of that slice, inside the slice's
     budget); otherwise the cards of a task are fitted in one microtask after it, as before */
  function fitLater(body) {
    if (fitQueue.indexOf(body) < 0) fitQueue.push(body);
    if (fitAgain.indexOf(body) < 0) fitAgain.push(body);
    if (!fitScheduled && !C.fitDefer) { fitScheduled = true; (window.queueMicrotask || function (f) { Promise.resolve().then(f); })(function () { fitScheduled = false; fitFlush(); }); }
    /* once more in the next frame: meters and charts finish their own layout after the render, and wrapped text can then
       push a foot past the body (a one-off frame, never a loop) */
    /* (engine 21:26Z request: during an arrival or room change this frame is the next slice's frame and its read forced a
       21.7 ms style recalc on the VM: while a moment runs the again-pass waits for the settled pass below) */
    var inMoment = PMU.film && PMU.film.moment && PMU.film.moment();
    if (!fitAgainScheduled && !inMoment) { fitAgainScheduled = true; requestAnimationFrame(function () { fitAgainScheduled = false; var list = fitAgain.splice(0); list.forEach(function (b) { b._pmuFitDone = false; }); fitFlush(list); }); }
    /* and once when the moment is over: a count that rolls up from 0 is narrower than its final text while the first
       passes run, so a hero line can wrap only when the roll lands ("1,420 calls left" in NieR pushed "4 more facts"
       past the card). One batched read of the board's bodies 2.4 s after the last render, never a loop. */
    clearTimeout(fitSettleT);
    fitSettleT = setTimeout(fitSettled, 2000 * (PMU.motion && PMU.motion.speed ? PMU.motion.speed() : 1));
  }
  var fitSettleT = 0;
  /* the again-pass held during a moment runs once when the moment ends (one batched pass) */
  if (PMU.film && PMU.film.onMoment) PMU.film.onMoment(function (what) {
    if ((what !== 'end' && what !== 'finish') || !fitAgain.length || fitAgainScheduled) return;
    /* in the moment's end task itself (no frame callback after the moment: the page is idle from here) */
    var list = fitAgain.splice(0); list.forEach(function (b) { b._pmuFitDone = false; }); fitFlush(list);
  });
  /* the settled pass runs in idle slices of about 8 ms (NOTES3-perf C1: never a whole-board pass in a moment) */
  function fitSettled() {
    fitSettleT = 0;
    var bodies = Array.prototype.slice.call(document.querySelectorAll('#pmuBoard > .pmu-card > .pmu-cardbody'));
    var idle = window.requestIdleCallback || function (f) { return setTimeout(function () { f({ timeRemaining: function () { return 8; } }); }, 16); };
    (function step(deadline) {
      var t0 = performance.now();
      while (bodies.length && performance.now() - t0 < 8 && (!deadline || deadline.timeRemaining() > 1 || performance.now() - t0 < 2)) {
        var chunk = bodies.splice(0, 6).filter(function (b) { return b.isConnected; });
        chunk.forEach(function (b) { b._pmuFitDone = false; });
        if (chunk.length) fitFlush(chunk);
      }
      if (bodies.length) idle(step, { timeout: 1000 });
    })(null);
  }
  C.fitDefer = false;
  C.fitSlice = function () { fitScheduled = false; if (fitQueue.length) fitFlush(); };
  /* the per-render fit record of a body (C.kind resets it before each render) */
  function fitReset(b) { b._pmuHeadFold = false; b._pmuHidden = 0; b._pmuFitDone = false; b._pmuPre = null; b._pmuFolded = []; b._pmuFoldedNotes = []; b._pmuGrown = false; b._pmuMoreHome = null; }
  C.fitReset = fitReset;
  var NOT_ROW = /pmu-(cfoot|note|factrow|efflegend|effspark|kpitrend|kpifoot|agbeyond|setupnote|effcost|swfam)/;
  function fitFlush(list) {
    var items = list || fitQueue.splice(0), touched = [], items0 = items;
    for (var pass = 0; pass < 12 && items.length; pass++) {
      /* one read phase over every body of the pass (overflow and the rows each one gives up), then the writes */
      var over = items.filter(function (b) { return b.isConnected && b.clientHeight > 0 && b.scrollHeight > b.clientHeight + 1; });   /* the census flags more than 1 px */
      var plans = over.map(function (b) {
        /* a kind may name lines that give way before its rows ([data-fit-first]; final fix M4: a provider plate's foot notes
           go before an account row, so the Claude plate never hides Studio behind "1 more" over an empty band) */
        var firsts = b.querySelectorAll('[data-fit-first]');
        if (firsts.length) return { b: b, first: firsts[firsts.length - 1] };
        var cands = Array.prototype.slice.call(b.querySelectorAll(FIT_SEL)).filter(function (el) { return !el.closest('.pmu-chart') && !el.closest('.pmu-headtools'); });
        /* rows and facts go before a card's foot (the foot names the source and freshness of what the card shows) */
        /* a card's own "N more" / "after" line is never the row that goes (final fix: the resets agenda lost its
           "3 more · 15 after Oct 3" line to the fit pass while a line above it stayed) */
        var rows = cands.filter(function (el) { return !/pmu-(cfoot|kpifoot|agbeyond|more)\b/.test(String(el.className)); });
        if (!rows.length) return { b: b, gone: cands.length ? [cands[cands.length - 1]] : [] };
        /* CONTENT-3: rows stacked in one column give up as many trailing rows as the overflow (and the "N more" line it
           then needs) takes in one pass, measured; anything else gives up one row a pass, as before */
        /* the row that goes is the last one that actually runs past the body (a two-column agenda overflows in its first
           column while its second ends higher: trimming the last row in reading order emptied the second column on the
           Windows rig), else the last row */
        /* ... and where none does (a line under the rows is what runs out), the row that ends lowest: the tallest column
           sets the height */
        var bb = b.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(b).paddingBottom) || 0), li = -1, low = -1e9, lowI = rows.length - 1;
        for (var q = rows.length - 1; q >= 0; q--) {
          var qb = rows[q].getBoundingClientRect().bottom;
          if (li < 0 && qb > bb + 1) li = q;
          if (qb > low + 0.5) { low = qb; lowI = q; }
        }
        if (li < 0) li = lowI;
        var lastEl = rows[li], gone = [lastEl], need = b.scrollHeight - b.clientHeight + (b.querySelector('.pmu-more') ? 0 : 22);
        if (!NOT_ROW.test(String(lastEl.className))) {
          var rl = lastEl.getBoundingClientRect(), x0 = Math.round(rl.left), prev = rl;
          for (var i = li - 1; i >= 0; i--) {
            var ri = rows[i].getBoundingClientRect();
            if (Math.round(ri.left) !== x0 || ri.bottom > prev.top + 1) break;   /* a second column or an overlap: one a pass */
            if (rl.bottom - ri.bottom >= need || NOT_ROW.test(String(rows[i].className))) break;   /* the rows gone so far free enough */
            gone.push(rows[i]); prev = ri;
          }
        }
        return { b: b, gone: gone };
      });
      plans.forEach(function (p) {
        var b = p.b;
        /* the body as its render left it, before the first row this pass hides: an update compares its dry render with
           this, so a card the fit pass trimmed still keeps its DOM when nothing changed (Settings toggle at 1440: the
           resets agenda rendered again on every toggle) */
        if (b._pmuPre == null && b._pmu) b._pmuPre = C.liveSig(b);
        if (touched.indexOf(b) < 0) touched.push(b);
        if (!b._pmuFolded) { b._pmuFolded = []; b._pmuFoldedNotes = []; }
        if (p.first) {
          var ff = p.first, fp = ff.parentNode, ft = C.textOf(ff);
          ff.remove();
          if (ft) b._pmuFoldedNotes.unshift(ft);
          if (fp && fp !== b && fp.nodeType === 1 && !fp.children.length) fp.remove();
          return;
        }
        if (!p.gone.length) { b._pmuFitDone = true; return; }
        p.gone.forEach(function (last) {
          var parent = last.parentNode, text = C.textOf(last);
          /* where an auto "N more" line goes: the rows' own container (above a plate's or tile's foot), never under it */
          var home = parent;
          while (home && home !== b && home.classList && (home.classList.contains('pmu-facts') || home.classList.contains('pmu-agday'))) home = home.parentNode;
          if (!b._pmuMoreHome || !b._pmuMoreHome.isConnected) b._pmuMoreHome = home;
          last.remove();
          if (parent && parent.classList && (parent.classList.contains('pmu-agday') || parent.classList.contains('pmu-facts')) && !parent.querySelector(FIT_SEL)) parent.remove();
          var isRow = !NOT_ROW.test(String(last.className)) && last.tagName !== 'EM';
          /* a hidden note or foot is folded too: its words go to the "N more" line's hover tag (or the body's), never lost */
          if (!isRow) { if (text) b._pmuFoldedNotes.unshift(text); return; }
          if (text) b._pmuFolded.unshift(text);
          b._pmuHidden = (b._pmuHidden || 0) + 1;
          /* a kind's own "N more ..." line absorbs the rows this pass hides (one line, one count), else one auto line */
          var own = Array.prototype.filter.call(b.querySelectorAll('.pmu-more:not([data-auto])'), function (e) { return /^\d+ /.test(e.textContent); }).pop();
          if (own) {
            if (!own.hasAttribute('data-base')) own.setAttribute('data-base', String(parseInt(own.textContent, 10)));
            own.textContent = own.textContent.replace(/^\d+/, String(+own.getAttribute('data-base') + b._pmuHidden))
              .replace(/^(\d+ more )(?!(?:at|in|after)\b)(\w+)/, function (m0, a, w) { return a + (/s$/.test(w) ? w : /y$/.test(w) ? w.replace(/y$/, 'ies') : w + 's'); });
            return;
          }
          /* a small card counts the rows the fit pass removes in its head (C.headMore, round 3), not on a line */
          var hsl = headSlotOf(b); if ((hsl && hsl.querySelector('.pmu-headmore')) || b.querySelector('.pmu-headmore.is-inline')) { b._pmuHeadFold = true; return; }
          /* a small card gets the quiet count row instead of an auto "N more" words line (round 3) */
          if (b.clientWidth < 420) {
            var host0 = b._pmuMoreHome && b._pmuMoreHome.isConnected && b.contains(b._pmuMoreHome) ? b._pmuMoreHome : b;
            var row = document.createElement('div'); row.className = 'pmu-headmore is-inline is-row'; row.setAttribute('data-auto', ''); row.innerHTML = C.glyph('layers') + '<b>+0</b>'; row._pmuItems = [];
            var foot0 = host0.querySelector(':scope > .pmu-cardfoot, :scope > .pmu-kpifoot, :scope > .pmu-accsfoot, :scope > .pmu-cfoot');
            if (foot0) host0.insertBefore(row, foot0); else host0.appendChild(row);
            b._pmuHeadFold = true; return;
          }
          var more = b.querySelector('.pmu-more[data-auto]');
          if (!more) {
            more = document.createElement('div'); more.className = 'pmu-more'; more.setAttribute('data-auto', '');
            var host = b._pmuMoreHome && b._pmuMoreHome.isConnected && b.contains(b._pmuMoreHome) ? b._pmuMoreHome : b;
            var foot = host.querySelector(':scope > .pmu-cardfoot, :scope > .pmu-kpifoot, :scope > .pmu-accsfoot, :scope > .pmu-cfoot');
            if (foot) host.insertBefore(more, foot); else host.appendChild(more);
          }
          more.textContent = b._pmuHidden + (atMax(b) ? ' more in Details' : ' more at a taller size');
        });
      });
      items = over.filter(function (b) { return !b._pmuFitDone; });
    }
    /* the hover tags of what the passes folded (one write per body) */
    touched.forEach(foldTags);
    /* CONTENT-3: a "N more" line never sits over room for another row. A kind that stacks rows (impl.grow: list, agenda,
       providers) and printed such a line over a free band of at least a row renders once more with the band added to
       its height budget; the passes above then trim whatever its estimate let through, exactly. Once per render; one
       batched read, then the writes. */
    var all = list || items0;
    var cands = all.filter(function (b) { var g = b._pmuImpl && b._pmuImpl.grow; return b.isConnected && !b._pmuGrown && g && (typeof g !== 'function' || g(b)) && b._pmuCtxK && hasMore(b); });
    if (!cands.length) return;
    var grow = cands.map(function (b) { return { b: b, band: freeBand(b) }; }).filter(function (g) { return g.band >= 24; });
    grow.forEach(function (g) { regrow(g.b, g.band); });
    if (grow.length) fitFlush(grow.map(function (g) { return g.b; }));
  }
  function hasMore(b) { return Array.prototype.some.call(b.querySelectorAll('.pmu-more'), function (e) { return /^\d+ more\b/.test(e.textContent) && e.getClientRects().length; }); }
  /* the largest empty vertical band inside the body's content box, between or under its leaves (a leaf: an element with
     its own words, a mark or an svg) */
  function freeBand(b) {
    var br = b.getBoundingClientRect(), cs = getComputedStyle(b), top0 = br.top + (parseFloat(cs.paddingTop) || 0), bot0 = br.bottom - (parseFloat(cs.paddingBottom) || 0);
    var iv = [];
    Array.prototype.forEach.call(b.querySelectorAll('*'), function (el) {
      if (el.closest('svg') && !/^svg$/i.test(el.tagName)) return;
      var leaf = /^svg$/i.test(el.tagName) || !el.children.length || Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (!leaf) return;
      var r = el.getBoundingClientRect(); if (!r.height || !r.width) return;
      iv.push([Math.max(top0, r.top), Math.min(bot0, r.bottom)]);
    });
    iv.sort(function (x, y) { return x[0] - y[0]; });
    var cur = top0, band = 0;
    iv.forEach(function (v) { if (v[0] > cur) band = Math.max(band, v[0] - cur); cur = Math.max(cur, v[1]); });
    return Math.floor(Math.max(band, bot0 - cur));
  }
  function regrow(b, band) {
    var impl = b._pmuImpl, ctx = b._pmuCtxK;
    var ctx2 = Object.assign({}, ctx, { tier: Object.assign({}, ctx.tier, { bh: ctx.tier.bh + band }) });
    C.destroy(b); fitReset(b); b.removeAttribute('data-pm-hover-label'); b.removeAttribute('data-pm-hover-detail');
    try { impl.render(b, ctx2); } catch (error) { console.error('[pm-usage] regrow', error); }
    moreAtMax(b);
    /* updates at this size render with the same budget (the kind wrapper's update), so the pre-fit record is this
       render's */
    b._pmuGrown = true; b._pmuBand = band; b._pmuBandKey = ctx.tier.bw + 'x' + ctx.tier.bh; b._pmuCtxK = ctx;
  }
  /* a "N more" line lists the rows it counts (the fit pass's, then the kind's own); notes and foots that gave way join
     it, or, where no such line shows, the body's own hover tag carries them */
  function headSlotOf(b) { var card = b.parentNode; return card && card.classList && card.classList.contains('pmu-card') ? card.querySelector('.pmu-headtools') : null; }
  function foldTags(b) {
    if (!b.isConnected) return;
    var rows = b._pmuFolded || [], notes = b._pmuFoldedNotes || [];
    if (!rows.length && !notes.length) return;
    var hs = b._pmuHeadFold ? headSlotOf(b) : null, inl = b._pmuHeadFold ? b.querySelector('.pmu-headmore.is-inline') : null;
    if (inl) {
      var baseI = inl._pmuItems || String(inl.getAttribute('data-pm-hover-detail') || '').split('; ').filter(Boolean), all = baseI.concat(rows, notes);
      inl._pmuItems = all; inl.setAttribute('data-pm-hover-label', C.FOLD_LABEL); inl.setAttribute('data-pm-hover-detail', all.join('; ')); inl.setAttribute('data-n', String(all.length));
      var bb = inl.querySelector('b'); if (bb) bb.textContent = '+' + all.length;
      return;
    }
    if (hs && hs.querySelector('.pmu-headmore')) {
      var hm = hs.querySelector('.pmu-headmore'), base = hm && hm._pmuItems ? hm._pmuItems : [];
      C.headMore({ head: hs, tier: { bw: b.clientWidth } }, null, base.concat(rows, notes));
      return;
    }
    var line = Array.prototype.filter.call(b.querySelectorAll('.pmu-more'), function (e) { return /^\d+ /.test(e.textContent); }).pop();
    if (line) {
      if (!line.hasAttribute('data-pm-hover-foldbase')) line.setAttribute('data-pm-hover-foldbase', line.getAttribute('data-pm-hover-detail') || '');
      var base = line.getAttribute('data-pm-hover-foldbase');
      line.setAttribute('data-pm-hover-label', line.getAttribute('data-pm-hover-label') && base ? line.getAttribute('data-pm-hover-label') : C.FOLD_LABEL);
      line.setAttribute('data-pm-hover-detail', rows.concat(base ? [base] : [], notes).join('; '));
      return;
    }
    b.setAttribute('data-pm-hover-label', C.FOLD_LABEL);
    b.setAttribute('data-pm-hover-detail', rows.concat(notes).join('; '));
  }
  C.fitLater = fitLater;
  /* a web font that finishes loading after the render (NieR's mono, Retro's face) can push a row or a foot past the body:
     the fit pass runs once more over the board when the fonts settle (NieR Light at 1440: "4 more facts" cut at the edge) */
  try {
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () {
      var bodies = Array.prototype.slice.call(document.querySelectorAll('#pmuBoard > .pmu-card > .pmu-cardbody'));
      if (!bodies.length) return;
      requestAnimationFrame(fitSettled);
    });
  } catch (error) {}
  /* a card at its kind's tallest size cannot show more rows: the line then points at Details (the inspector) */
  function atMax(b) {
    var card = b.closest('.pmu-card'); if (!card) return false;
    var ks = PMU.widgets.spec(card.getAttribute('data-widget')) || {};
    return ks.hMax != null && +card.dataset.h >= ks.hMax;
  }
  C.atMax = atMax;

  /* content works on the body's inner size (DESIGN-SPEC 2.3): the engine's tier carries the body's clientWidth /
     clientHeight, which include the body padding (plate 4 / 12 px, line and tile 0 / 10 px, 14 px each side), so the
     padding is taken off here and the tiers are re-read from the inner size. */
  /* the engine measures tiers on the body's inner size (ctx._inner, DESIGN-SPEC 2.3); kept as a pass-through for callers */
  function inner(ctx) { return ctx; }
  C.inner = inner;
  /* the standard kind: render(body, ctx) builds everything; update re-renders and counts from the old values */
  /* a card at its kind's tallest size cannot show more at a taller size: its "N more" lines point at Details instead
     (REVIEW-data should-fix 1, LOOK-REVIEW-2 12) */
  function moreAtMax(body) {
    if (!atMax(body)) return;
    Array.prototype.forEach.call(body.querySelectorAll('.pmu-more'), function (el) {
      if (/ at a (taller|larger) size$/.test(el.textContent)) el.textContent = el.textContent.replace(/ at a (taller|larger) size$/, ' in Details');
    });
  }
  C.moreAtMax = moreAtMax;
  /* the same words on a detached dry render, judged by the live card's size */
  function moreAtMaxDry(dry, body) {
    if (!atMax(body)) return;
    Array.prototype.forEach.call(dry.querySelectorAll('.pmu-more'), function (el) {
      if (/ at a (taller|larger) size$/.test(el.textContent)) el.textContent = el.textContent.replace(/ at a (taller|larger) size$/, ' in Details');
    });
  }
  /* the change flash of a row or value (WOW-SPEC 3.6, WOW-TASKS N-4): a pre-painted glow layer and a light sweep on the
     compositor (PMU.film.flash), never an animated background colour; a row that reached 100 % ends with one ring swell */
  function flashRow(el) {
    var tone = el.getAttribute('data-tone') || (el.querySelector('[data-tone="crit"], [data-tone="exhausted"]') ? 'crit' : el.querySelector('[data-tone="warn"]') ? 'warn' : null);
    if (PMU.film && PMU.film.flash) {
      PMU.film.flash(el, { tone: tone === 'crit' || tone === 'exhausted' ? 'crit' : tone === 'warn' ? 'warn' : null });
      if (el.matches('[data-state="exhausted"]') || el.querySelector('[data-tone="exhausted"]')) PMU.film.ring(el, { tone: 'crit', delay: 420 });
    } else if (PMU.motion.flash) PMU.motion.flash(el);
  }
  C.flashRow = flashRow;
  /* ------------------------------------------------------------------ live readings (WOW-SPEC-3 8, WOW-TASKS-3 N3-4)
     A live beat (PMU.data.live.apply, then PMU.cards.update(card, 'live')) patches each card IN PLACE: the changed digit
     columns roll (the odometer leaves an unchanged text alone), meters and charts move through charts' chart.live, text
     that changed is written in place; no flash (the beat's lead flash and sweep are the engine's), no child-list change
     and no innerHTML while the card is in view. A card off screen (or under Reduce Motion) is written final. A card whose
     change needs a new structure while it is in view is re-rendered quietly after the beat, in an idle slice. */
  function liveFinalOf(body) {
    if (PMU.motion.reduced && PMU.motion.reduced()) return true;
    var card = body.closest ? body.closest('.pmu-card') : null;
    if (card && PMU.board && PMU.board.inView) { try { return !PMU.board.inView(card); } catch (error) { return false; } }
    return false;
  }
  C.liveFinalOf = liveFinalOf;
  /* a chart takes its next spec: chart.live on a live beat (charts C3-4: in place, only what changed), else update */
  C.chartTo = function (chart, spec, ctx, o) {
    if (!chart) return;
    if (ctx && ctx.reason === 'live' && typeof chart.live === 'function') { try { chart.live(spec, Object.assign({ lead: false }, o || {})); return; } catch (error) { console.error('[pm-usage] chart live', error); } }
    chart.update(spec);
  };
  /* live trees are compared child by child: chart roots and film layers are left out, a rolling number is one leaf, and
     the live body may lack rows the fit pass removed (a dry child that the fit pass can remove is skipped) and carry the
     fit pass's own "N more" line. pairKids returns the matched pairs or null when the shapes differ. */
  var SKIP_LIVE = function (el) { var c = typeof el.className === 'string' ? el.className : ''; return el.hasAttribute('data-pmu-chart') || /(^|\s)pmu-film-/.test(c) || (el.classList.contains('pmu-more') && el.hasAttribute('data-auto')); };
  function kidsOf(el) { var out = []; for (var c = el.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3) { if (/\S/.test(c.nodeValue)) out.push(c); } else if (c.nodeType === 1 && !SKIP_LIVE(c)) out.push(c); } return out; }
  function shapeOf(el) { return el.nodeType === 3 ? '#' : el.tagName + '.' + (typeof el.className === 'string' ? el.className.replace(/\s*\bpmu-odo\b/g, '').trim() : ''); }
  function trimmable(el) { return el.nodeType === 1 && (el.matches(FIT_SEL) || el.classList.contains('pmu-agday') || el.classList.contains('pmu-facts')); }
  function pairKids(l, d) {
    var lc = kidsOf(l), dc = kidsOf(d), pairs = [], j = 0;
    for (var i = 0; i < lc.length; i++) {
      var sh = shapeOf(lc[i]);
      while (j < dc.length && shapeOf(dc[j]) !== sh) { if (!trimmable(dc[j])) return null; j++; }
      if (j >= dc.length) return null;
      pairs.push([lc[i], dc[j]]); j++;
    }
    for (; j < dc.length; j++) if (!trimmable(dc[j])) return null;
    return pairs;
  }
  function sameTree(l, d) {
    if (l.nodeType === 3 || l.classList.contains('pmu-num') || l.classList.contains('pmu-more')) return true;
    var pairs = pairKids(l, d); if (!pairs) return false;
    for (var i = 0; i < pairs.length; i++) if (pairs[i][0].nodeType === 1 && !sameTree(pairs[i][0], pairs[i][1])) return false;
    return true;
  }
  var KEEP_ATTR = /^(aria-describedby|data-pmu-chart|tabindex|role|data-base|data-auto)$/;
  function copyLive(live, dry, nums, root) {
    var a, i;
    if (live.classList.contains('pmu-more')) return;   /* the counts the fit pass wrote stay */
    if (root) { (pairKids(live, dry) || []).forEach(function (pr) { if (pr[0].nodeType === 3) { if (pr[0].nodeValue !== pr[1].nodeValue) pr[0].nodeValue = pr[1].nodeValue; } else copyLive(pr[0], pr[1], nums); }); return; }
    for (i = 0; i < dry.attributes.length; i++) { a = dry.attributes[i]; if (live.getAttribute(a.name) !== a.value) live.setAttribute(a.name, a.value); }
    for (i = live.attributes.length - 1; i >= 0; i--) { a = live.attributes[i]; if (!dry.hasAttribute(a.name) && !KEEP_ATTR.test(a.name) && !/^data-pm-hover/.test(a.name)) live.removeAttribute(a.name); }
    if (live.classList.contains('pmu-num')) {
      var t1 = dry.textContent;
      if (live.getAttribute('data-k') && nums) nums.push({ el: live, text: t1 });
      else if (live.textContent !== t1 && !live.querySelector('.pmu-odo')) live.textContent = t1;
      return;
    }
    (pairKids(live, dry) || []).forEach(function (pr) { if (pr[0].nodeType === 3) { if (pr[0].nodeValue !== pr[1].nodeValue) pr[0].nodeValue = pr[1].nodeValue; } else copyLive(pr[0], pr[1], nums); });
  }
  /* body takes dry's words and attributes in place when both have the same shape; returns false (and changes nothing)
     when they differ. The numbers that carry a data-k roll from their shown value (no flash). */
  C.livePatch = function (body, dry, ctx) {
    if (!sameTree(body, dry)) return false;
    var nums = [], old = snapshot(body);
    copyLive(body, dry, nums, true);   /* the body's own attributes (class, the engine's) stay */
    var fin = ctx && ctx.liveFinal;
    nums.forEach(function (n) {
      var el = n.el, k = el.getAttribute('data-k'), to = parseFloat(el.getAttribute('data-v')), f = el.getAttribute('data-f');
      if (!(k in old) || !isFinite(to) || old[k] === to || fin) { if (el.textContent !== n.text && !el.querySelector('.pmu-odo')) el.textContent = n.text; return; }
      PMU.motion.countUp(el, old[k], to, function (v) { return C.numOnly(v, v === to || f !== 'money' ? f : 'money2'); }, { dur: 'value' });
    });
    return true;
  };
  /* what a card shows, as one string (a kind's own liveSig, else its model): a live beat that leaves it unchanged leaves
     the card alone (no dry render) */
  function msig(impl, ctx) {
    try {
      /* while the demo hour runs (8.6) the demo minute is part of every signature: relative times ("resets in 1h 41m")
         change as plain text each step */
      var th = PMU.roster.thresholds(), pre = [th.auto, th.switchLeft, th.warnLeft, ctx.tier ? ctx.tier.bw + 'x' + ctx.tier.bh : '', PMU.clock && PMU.clock.demo && PMU.clock.demo() ? Math.floor(PMU.clock.now() / 60000) : ''].join('|') + '|';
      return impl.liveSig ? pre + String(impl.liveSig(ctx)) : ctx.model && typeof ctx.model === 'object' ? pre + JSON.stringify(ctx.model) : null;
    } catch (error) { return null; }
  }
  C.msig = msig;
  var liveQ = [], liveQT = 0;
  function liveIdle(body) {
    if (liveQ.indexOf(body) < 0) liveQ.push(body);
    if (liveQT) return;
    var idle = window.requestIdleCallback || function (f) { return setTimeout(function () { f({ timeRemaining: function () { return 8; } }); }, 400); };
    liveQT = idle(function step(deadline) {
      liveQT = 0;
      var t0 = performance.now();
      while (liveQ.length && performance.now() - t0 < 6) {
        var b = liveQ.shift(), card = b.isConnected && b.closest('.pmu-card');
        if (card && PMU.cards && PMU.cards.update) { b._pmuLiveNow = true; try { PMU.cards.update(card, 'live'); } finally { b._pmuLiveNow = false; } }
      }
      if (liveQ.length) liveQT = idle(step, { timeout: 2000 });
    }, { timeout: 2000 });
  }
  var liveLater = [], liveLaterT = 0;
  function reRenderLater(body) {
    if (liveLater.indexOf(body) < 0) liveLater.push(body);
    if (liveLaterT) return;
    var idle = window.requestIdleCallback || function (f) { return setTimeout(function () { f({ timeRemaining: function () { return 8; } }); }, 1200); };
    liveLaterT = idle(function () {
      liveLaterT = 0;
      var list = liveLater.splice(0);
      /* integ3: the live patch already recorded the new signature, so a plain 'data' update returned at its signature check
         and the deferred re-render never ran (a re-ranked ladder kept its old order); forget it so the card renders */
      list.forEach(function (b) { var card = b.isConnected && b.closest('.pmu-card'); if (card && PMU.cards && PMU.cards.update) { b._pmuMSig = null; b._pmuPre = null; PMU.cards.update(card, 'data'); } });
    }, { timeout: 2500 });
  }
  function liveUpdate(body, ctx, impl) {
    var fin = liveFinalOf(body);
    /* a card outside the viewport takes the beat later, in an idle slice, written final (nothing animates there and the
       beat's own task stays under its 8 ms budget) */
    if (fin && !body._pmuLiveNow && !(PMU.motion.reduced && PMU.motion.reduced())) { liveIdle(body); return; }
    var sg = msig(impl, ctx);
    if (sg !== null && sg === body._pmuMSig) return;
    body._pmuMSig = sg;
    ctx = Object.assign({}, ctx, { liveFinal: fin });
    if (impl.live) { try { if (impl.live(body, ctx) !== false) return; } catch (error) { console.error('[pm-usage] live ' + ctx.id, error); } }
    if (impl.update) { try { if (impl.update(body, ctx) !== false) { body._pmuPre = null; return; } } catch (error) { console.error('[pm-usage] live update ' + ctx.id, error); } }
    var dry = document.createElement('div'); dry._pmuDry = true;
    try { impl.render(dry, Object.assign({}, ctx, { _dry: true })); moreAtMaxDry(dry, body); } catch (error) { dry = null; }
    if (dry && C.liveSig(dry) === C.liveSig(body) && ((dry._pmu && dry._pmu.specs) || []).join('\n') === ((body._pmu && body._pmu.specs) || []).join('\n')) return;
    /* the same shape: the words patch in place and each chart takes its next spec (charts' chart.live) */
    var lo = (body._pmu && body._pmu.objs) || [], dob = (dry && dry._pmu && dry._pmu.objs) || [];
    if (dry && lo.length === dob.length && lo.every(function (o, i) { return o.name === dob[i].name; }) && C.livePatch(body, dry, ctx)) {
      lo.forEach(function (o, i) {
        var ns = dob[i].spec, same = false;
        try { same = JSON.stringify(ns) === JSON.stringify(o.spec); } catch (error) { same = false; }
        if (!same && o.chart) C.chartTo(o.chart, ns, ctx);
        o.spec = ns;
      });
      if (body._pmu && dry._pmu) body._pmu.specs = (dry._pmu.specs || []).slice();
      body._pmuPre = null; return;
    }
    /* a new structure: off screen it is written final now; in view it waits for the beat to end (an idle slice) */
    if (ctx.liveFinal) { var old = snapshot(body); C.destroy(body); fitReset(body); body._pmuImpl = impl; body._pmuCtxK = ctx; impl.render(body, ctx); moreAtMax(body); fitLater(body); void old; return; }
    reRenderLater(body);
  }
  C.kind = function (name, impl) {
    PMU.widgets.kind(name, {
      render: function (body, ctx) { ctx = inner(ctx); C.destroy(body); fitReset(body); body._pmuBand = 0; body.removeAttribute('data-pm-hover-label'); body.removeAttribute('data-pm-hover-detail'); body._pmuImpl = impl; body._pmuCtxK = ctx; impl.render(body, ctx); body._pmuMSig = msig(impl, ctx); moreAtMax(body); fitLater(body); },
      update: function (body, ctx) {
        ctx = inner(ctx);
        /* a body the grow step widened keeps that budget for its updates at the same size (its in-place patch and its
           dry render then match what is shown) */
        var band = body._pmuBand && body._pmuBandKey === ctx.tier.bw + 'x' + ctx.tier.bh ? body._pmuBand : 0, bandKey = ctx.tier.bw + 'x' + ctx.tier.bh;
        if (band) ctx = Object.assign({}, ctx, { tier: Object.assign({}, ctx.tier, { bh: ctx.tier.bh + band }) });
        if (ctx.reason === 'live') { liveUpdate(body, ctx, impl); return; }
        /* NOTES3-perf C3: a Settings ripple or a data refresh that leaves what this card shows unchanged (its model, or its
           kind's liveSig, with the thresholds) costs one signature, not a dry render */
        var sg0 = msig(impl, ctx);
        if ((ctx.reason === 'settings' || ctx.reason === 'data') && sg0 !== null && sg0 === body._pmuMSig) return;
        body._pmuMSig = sg0;
        if (impl.update && impl.update(body, ctx) !== false) { body._pmuPre = null; return; }   /* patched in place: the pre-fit record is stale */
        /* a Settings change (auto-switch, switch level, the account used) touches few cards: a card whose content is the
           same after the change keeps its DOM, its running motion and its fit (WOW-SPEC 3.9: never a re-render) */
        /* the same for a data refresh whose readings did not change (a tick that changes three values re-renders the
           three cards, not the room: WOW-SPEC 3.6 budget) */
        var liveS = body._pmuPre != null ? body._pmuPre : body.querySelector('.pmu-more[data-auto]') ? null : '';
        if ((ctx.reason === 'settings' || ctx.reason === 'data' || ctx.reason === 'page') && liveS !== null && body._pmu) {
          var dry = document.createElement('div'); dry._pmuDry = true;
          try { impl.render(dry, Object.assign({}, ctx, { _dry: true })); moreAtMaxDry(dry, body); } catch (error) { dry = null; }
          if (dry && ((dry._pmu && dry._pmu.specs) || []).join('\n') === (body._pmu.specs || []).join('\n') && C.liveSig(dry) === (liveS || C.liveSig(body))) return;
        }
        var old = snapshot(body), sigs = flashSigs(body); C.destroy(body); fitReset(body); body.removeAttribute('data-pm-hover-label'); body.removeAttribute('data-pm-hover-detail'); body._pmuImpl = impl; body._pmuCtxK = ctx; impl.render(body, ctx); moreAtMax(body);
        if (band) { body._pmuBand = band; body._pmuBandKey = bandKey; body._pmuGrown = true; }
        fitLater(body); C.countFrom(body, old);
        /* a row whose reading changed flashes once (A1 3.3, 8.2); nothing flashes on the first render */
        Array.prototype.slice.call(body.querySelectorAll('[data-flash-key]')).forEach(function (el) {
          var k = el.getAttribute('data-flash-key'); if (k in sigs && sigs[k] !== el.getAttribute('data-flash-sig')) flashRow(el);
        });
      },
      resize: function (body, ctx) {
        ctx = inner(ctx);
        var old = snapshot(body); C.destroy(body); fitReset(body); body._pmuBand = 0; body.removeAttribute('data-pm-hover-label'); body.removeAttribute('data-pm-hover-detail'); body._pmuImpl = impl; body._pmuCtxK = ctx; impl.render(body, ctx); moreAtMax(body); fitLater(body);
        Array.prototype.slice.call(body.querySelectorAll('.pmu-num[data-k]')).forEach(function (el) { var k = el.getAttribute('data-k'); if (k in old) { el.setAttribute('data-v', String(parseFloat(el.getAttribute('data-v')))); } });
      },
      enter: function (body, ctx, delay) { ctx = inner(ctx); if (impl.enter) impl.enter(body, ctx, delay); else C.enterAll(body, ctx, delay || 0); },
      destroy: function (body) { C.destroy(body); },
      autoH: impl.autoH
    });
  };
  /* inspector rows helper */
  C.insp = function (title, rows, opts) {
    return Object.assign({ kind: 'panel', title: title, sections: [{ title: 'Reading', rows: rows.map(function (r) { return [r[0], esc(r[1])]; }) }] }, opts || {});
  };

  /* ------------------------------------------------------------------ every reading reaches Details (CONTENT-3) */
  /* C.readings(model): every reading a widget model holds, as [label, text] rows: the value and its line, facts, rows,
     segments, cells, notes, captions and foots. A kind whose content does not come from its model registers
     C.kindReadings[kind](ctx, def) instead. */
  var strip = function (v) { return String(v == null ? '' : v).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim(); };
  C.kindReadings = {};
  C.readings = function (m) {
    var out = [], seen = {};
    var add = function (k, v) {
      k = strip(k); v = strip(v);
      if (!k && !v) return;
      var key = (k + '|' + v).toLowerCase(); if (seen[key]) return; seen[key] = 1;
      out.push([k || 'Note', v]);
    };
    if (!m || typeof m !== 'object') return out;
    var val = function (o) { return o.vs ? (o.word || PMU.vs.STATES && PMU.vs.STATES[o.vs] && PMU.vs.STATES[o.vs].word || '') : o.valueText != null ? o.valueText : o.text != null ? String(o.text) + (o.unit || '') : o.value != null && o.fmt ? C.fmt(o.value, o.fmt) : o.valueHtml != null ? o.valueHtml : o.value != null && typeof o.value !== 'object' ? String(o.value) : ''; };
    var mainV = val(m); if (mainV) add('Value', mainV + (m.delta && m.delta.text ? ' (' + m.delta.text + ')' : ''));
    if (m.headline) add(m.headline.label || 'Headline', val(m.headline));
    ['sub', 'subText'].forEach(function (k) { if (typeof m[k] === 'string' && m[k]) add('Reading', m[k]); });
    if (m.projection && m.projection.label) add('Projection', m.projection.label);
    ['facts', 'routeFacts'].forEach(function (k) { (Array.isArray(m[k]) ? m[k] : []).forEach(function (f) { if (Array.isArray(f)) { var o = f[2] || {}; add(f[0], (o.vs ? o.word || f[1] : f[1]) + (o.hover ? ' · ' + o.hover : '')); } }); });
    ['caption', 'note', 'caveat', 'foot'].forEach(function (k) { if (typeof m[k] === 'string' && m[k]) add(k === 'caption' ? 'Caption' : 'Note', m[k]); });
    (Array.isArray(m.rows) ? m.rows : []).forEach(function (r) {
      if (!r || typeof r !== 'object' || r.cells) return;   /* table rows page instead of folding */
      if (r.day) return;
      add(r.name || r.label || '', [val(r), r.role, r.sub, r.note, r.hover && typeof r.hover === 'string' ? r.hover : ''].filter(Boolean).join(' · '));
    });
    (Array.isArray(m.segments) ? m.segments : []).forEach(function (s) { if (s && s.name) add(s.name, [s.valueText != null ? s.valueText : s.value != null ? (m.fmt ? C.fmt(s.value, m.fmt) : s.tokens != null ? PMU.fmt.tok(s.tokens) : String(s.value)) : '', s.pct != null ? s.pct + '%' : '', s.sub].filter(Boolean).join(' · ')); });
    (Array.isArray(m.cells) ? m.cells : []).forEach(function (c) { if (c && c.label) add(c.label, [val(c), c.sub, c.hover].filter(Boolean).join(' · ')); });
    (Array.isArray(m.notes) ? m.notes : []).forEach(function (n) { add('Note', n); });
    (Array.isArray(m.legend) ? m.legend : []).forEach(function (l) { if (l && typeof l === 'object' && l.name) add(l.name, l.valueText || l.sub || ''); });
    return out;
  };
  /* the words an inspector spec already shows, normalized like the page's parity check (separators as spaces) */
  var normT = function (s) { return strip(s).toLowerCase().replace(/\s*[·|/;:,]\s*/g, ' ').replace(/\s+/g, ' ').trim(); };
  function specText(spec) {
    var parts = [spec.title, spec.subtitle];
    (spec.sections || []).forEach(function (sec) { if (sec.html != null) parts.push(sec.html); (sec.rows || []).forEach(function (r) { parts.push(r[0] + ' ' + (r[1] == null ? '' : r[1])); }); });
    return ' ' + normT(parts.join(' | ')) + ' ';
  }
  /* wrap a widget's Details: the readings its model holds and its spec does not show yet are added as one section; a
     widget with no Details of its own gets one built from its readings */
  C.withReadings = function (spec, rows, title) {
    var have = spec ? specText(spec) : ' ';
    var seenV = {};
    var extra = rows.filter(function (r) {
      var lv = normT(r[0] + ' ' + r[1]), v = normT(r[1]);
      /* a value already said (in the spec, or by an earlier added row) is not repeated */
      var generic = /^(Value|Note|Reading|Caption)$/.test(r[0]);
      if (v.length >= 8 && seenV[v] && generic) return false;
      var keep = have.indexOf(lv) < 0 && !(v.length > 12 && have.indexOf(v) >= 0) && !(generic && v.length >= 4 && have.indexOf(' ' + v + ' ') >= 0) && !(!v && have.indexOf(normT(r[0])) >= 0);
      if (keep) seenV[v] = 1;
      return keep;
    });
    if (!extra.length) return spec;
    var sec = { title: spec ? 'Also on the card' : 'Reading', rows: extra.map(function (r) { return [r[0], esc(r[1] || '-')]; }) };
    if (!spec) return { kind: 'panel', title: title || '', sections: [sec] };
    return Object.assign({}, spec, { sections: (spec.sections || []).concat([sec]) });
  };
  var wrapped = {};
  C.inspectAll = function (ids) {
    (ids || []).forEach(function (id) {
      if (wrapped[id]) return;
      var d = PMU.widgets.get(id); if (!d || d.kind === 'group') return;
      var own = typeof d.inspect === 'function' ? d.inspect : null, kr = C.kindReadings[d.kind];
      if (!own && typeof d.model !== 'function' && !kr) return;
      wrapped[id] = true;
      PMU.widgets.define(id, { inspect: function (ctx) {
        var spec = own ? own.call(this, ctx) : null;
        if (own && !spec) return spec;   /* it opened its own drawer (an account) */
        var def = PMU.widgets.get(id) || d, model = null, rows = [];
        try { model = typeof def.model === 'function' ? def.model(ctx) : null; } catch (error) { model = null; }
        rows = C.readings(model);
        if (kr) { try { rows = rows.concat(kr(Object.assign({ model: model }, ctx), def) || []); } catch (error) { console.error('[pm-usage] readings ' + id, error); } }
        var title = typeof def.title === 'function' ? def.title(ctx) : def.title, sub = '';
        try { sub = typeof def.meta === 'function' ? def.meta(ctx) : def.meta || ''; } catch (error) { sub = ''; }
        var out = C.withReadings(spec, rows, title);
        if (out && !spec && sub) out.subtitle = strip(sub);
        return out || { kind: 'panel', title: title || '', subtitle: strip(sub), sections: [{ title: 'Reading', rows: [['Readings', esc(model && model.empty ? model.empty : 'None in the selected scope and range')]] }] };
      } });
    });
  };

  /* delegated clicks for every content control inside a card body ([data-pmu-act]) */
  var acts = {};
  C.act = function (name, fn) { acts[name] = fn; };
  document.addEventListener('click', function (event) {
    var el = event.target.closest && event.target.closest('#pmuApp [data-pmu-act]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var name = el.getAttribute('data-pmu-act'), fn = acts[name];
    if (!fn) return;
    var card = el.closest('.pmu-card');
    event.preventDefault(); event.stopPropagation();
    try { fn(el, card ? card.getAttribute('data-widget') : null, event); } catch (error) { console.error('[pm-usage] act ' + name, error); }
  }, true);
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var el = event.target;
    if (!el || !el.matches || !el.matches('#pmuApp [data-pmu-row], #pmuApp [data-pmu-act][role="button"], #pmuApp .pmu-agline')) return;
    if (el.tagName === 'BUTTON') return;
    event.preventDefault(); event.stopPropagation(); el.click();
  }, true);
  /* gear-free segmented controls write the widget configuration */
  C.act('cfg', function (el, id) { C.setCfg(id, el.getAttribute('data-key') || 'mode', el.getAttribute('data-value')); });
  C.act('seg', function (el, id) { C.setCfg(id, el.closest('[data-key]') ? el.closest('[data-key]').getAttribute('data-key') : 'mode', el.getAttribute('data-value')); });

  /* ================================================================== kpi (A1 3.5) */
  /* model: {value, fmt, text?, vs?, word?, delta?: {v, goodWhen, text?}, sub: html, facts: [[l, v, o]], spark?: {values, idx|tk}, tone?, foot?} */
  C.kind('kpi', {
    render: function (body, ctx) {
      var m = ctx.model;
      if (!m) { body.innerHTML = C.empty('No reading for this panel'); return; }
      var h = ctx.tier.h, wide = ctx.tier.w === 'xl' && C.h(ctx, 'h2');
      var valueHtml = m.vs ? '<span class="pmu-kpivs">' + C.vs(m.vs, m.word) + '</span>'
        : m.text != null ? '<b class="pmu-kpivalue"><span class="pmu-num">' + esc(m.text) + '</span>' + (m.unit ? '<span class="pmu-u">' + esc(m.unit) + '</span>' : '') + '</b>'
        : C.valHtml(m.value, m.fmt, 'pmu-kpivalue', ctx.id + ':v').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"');
      if (m.share && !m.vs) valueHtml = C.share(valueHtml, m.share);   /* N3-1: the headline number's shared id */
      var delta = '';
      if (m.delta && !m.vs) {
        var d = PMU.fmt.delta(m.delta.v, { goodWhen: m.delta.goodWhen || 'up' });
        delta = '<span class="pmu-delta" data-dir="' + d.dir + '" data-tone="' + (m.delta.tone || d.tone) + '">' + (d.dir === 'up' ? C.glyph('arrowUp') : d.dir === 'down' ? C.glyph('arrowDown') : '') + esc(m.delta.text || d.text) + '</span>';
      }
      var sparkOk = m.spark && m.spark.values && ctx.tier.bw >= 230;
      var head = '<div class="pmu-kpiline"' + (m.tone ? ' data-tone="' + m.tone + '"' : '') + '>' + valueHtml + delta + (sparkOk && h === 'h1' ? '<span class="pmu-kpispark" data-spark="inline"></span>' : '') + '</div>';
      if (h === 'h0') {
        var h0Fold = (m.facts || []).map(C.factText).concat(m.foot ? [String(m.foot).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()] : []).filter(Boolean);
        body.innerHTML = '<div class="pmu-kpi is-h0"' + C.hover(m.subText || (m.sub ? String(m.sub).replace(/<[^>]+>/g, '') : '') || C.FOLD_LABEL, h0Fold.join('; ')) + '>' + head + '</div>'; return;
      }
      /* the second line shows the whole lines that fit under the value and nothing partial (LOOK-REVIEW-2 9: a third
         line's glyph tops showed under the tile's edge); a clamped line keeps its full text in the hover tag */
      var subText = m.sub ? String(m.sub).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ') : '';
      /* CONTENT-3: the tile's height is shared out in this order, so a fact shows wherever it fits (the h1 tier used to
         show none over an empty band): the value line, the sub line's first two lines, the facts (C.factLayout: two
         columns where a pair fits side by side), the "N more facts" line when any fact is left (its hover tag lists
         them), then the sub line's other lines where every fact shows. Measured (VM 1920): value line 22-29 + 4, sub 17 a
         line + 4, facts block + 4, "N more" line 21 + 4, foot 17 a line (12 px; a text button 26) + 4 under its auto
         margin. */
      var bw = ctx.tier.bw, bh = ctx.tier.bh, facts = m.facts || [];
      var hasBtn = !!m.foot && m.foot.indexOf('<button') >= 0;
      var footText = m.foot ? String(m.foot).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      var footRoom = m.foot && C.h(ctx, 'h2') ? 4 + (hasBtn ? 26 : 17 * Math.min(2, C.wrapLines(footText, bw, 12, 400))) : 0;
      var trend = sparkOk && C.h(ctx, 'h3') ? 48 : 0;
      var subLines = subText ? Math.min(4, C.wrapLines(subText, bw, 12.5)) : 0;
      /* the sub line at most n lines: whole trailing " · " parts give way; only a first part that cannot fit is clamped */
      var subAt = function (n) {
        if (!n || !subLines) return { html: '', lines: 0 };
        if (subLines <= n) return { html: m.sub, lines: subLines };
        var segs = String(m.sub).split(' · ');
        while (segs.length > 1 && C.wrapLines(segs.join(' · ').replace(/<[^>]+>/g, ''), bw, 12.5) > n) segs.pop();
        var hh = segs.join(' · ');
        for (var openB = (hh.match(/<b>/g) || []).length - (hh.match(/<\/b>/g) || []).length; openB > 0; openB--) hh += '</b>';
        return { html: hh, lines: Math.max(1, Math.min(n, C.wrapLines(hh.replace(/<[^>]+>/g, ''), bw, 12.5))) };
      };
      var lay = C.factLayout(facts, wide ? Math.max(120, bw * 0.42) : bw, wide ? 1 : 0);
      /* the folded facts' quiet count: in the head where it fits, else at the right end of the value line (a narrow tile
         whose title fills its head: the token tiles at 1920) */
      var MORE_H = 25, headCount = C.smallCard(ctx), inlineCount = !headCount && !m.vs;
      /* the inline count beside the value (about 40 px with its gap) or, where the value leaves no room, on its own short
         row under it (18 px: a glyph and a number, no words) */
      var vPx = ctx.tier.w === 'xs' ? 20 : ctx.tier.w === 's' ? 22 : 26, numTxt = m.text != null ? String(m.text) + (m.unit || '') : C.fmt(m.value, m.fmt);
      var inlineWrap = inlineCount && (PMU.charts && PMU.charts.textW ? PMU.charts.textW(numTxt, vPx, false, 620) * 1.08 : numTxt.length * vPx * 0.6) + (m.delta ? 64 : 0) + 8 + 40 > bw;
      if (inlineWrap) MORE_H = 18;
      /* measured: the value line and the gap under it take 34 px (22 px value, xs / s) or 39 px (26 px value) */
      var LINE_H = ctx.tier.w === 'xs' || ctx.tier.w === 's' ? 34 : 39;
      /* one share-out for a given foot height (0 when the foot gives way) */
      var alloc = function (fRoom) {
        var base = wide ? bh : bh - LINE_H - fRoom - (trend ? trend + 4 : 0);
        var sb = wide ? subAt(Math.min(subLines, Math.max(0, Math.floor((bh - LINE_H - fRoom - (trend ? trend + 4 : 0)) / 17)))) : subAt(Math.min(subLines, 2));
        if (!wide) while (sb.lines && sb.lines * 17 > base) sb = subAt(sb.lines - 1);
        /* the side column of the wide form keeps 6 px (census 1440: its facts ran 3 px past the tile) */
        var rm = wide ? bh - 6 : base - sb.lines * 17;
        var f = lay.fit(rm), ml = false;
        /* some facts stay folded: the "N more" line takes its place under the facts that still fit (a tile with a head
           slot counts them in its head instead: round 3) */
        if (f.n < facts.length && rm >= MORE_H && !headCount && (!inlineCount || inlineWrap)) { f = lay.fit(rm - MORE_H); ml = !inlineCount; }
        return { base: base, sub: sb, room: rm, fr: f, moreLine: ml };
      };
      var A = alloc(footRoom), footShown = !!footRoom;
      /* a quiet foot line (source, policy) gives way to a fact it would hide; its words join the "N more" line's hover
         tag and Details. A foot with an action stays. */
      if (footRoom && !hasBtn && !wide && A.fr.n < facts.length) { var A0 = alloc(0); if (A0.fr.n > A.fr.n) { A = A0; footShown = false; } }
      var base = A.base, sub = A.sub, room = A.room, fr = A.fr, moreLine = A.moreLine;
      var maxFacts = fr.n;
      /* every fact shows: the sub line takes the rest of the room, up to four lines */
      if (!wide && maxFacts >= facts.length && subLines > sub.lines) {
        var spare = room - fr.used, more2 = Math.floor(spare / 17);
        if (more2 > 0) sub = subAt(Math.min(4, sub.lines + more2));
      }
      /* the clamp is the line count the facts were placed under (a sub that wraps one line more than its estimate is
         clamped, its full words in the hover tag, instead of pushing a fact out) */
      var clampN = maxFacts || moreLine ? sub.lines : Math.max(sub.lines, Math.min(4, Math.floor(Math.max(0, base) / 17)));
      var subEl = sub.lines ? '<div class="pmu-kpisub" style="-webkit-line-clamp:' + clampN + '"' + (sub.html !== m.sub || sub.lines < subLines ? C.hover(subText, '') : '') + '>' + sub.html + '</div>' : '';
      var hiddenFacts = facts.slice(maxFacts);
      var factsHtml = maxFacts ? lay.html(maxFacts) : '';
      var folded = hiddenFacts.map(C.factText).concat(m.foot && !footShown && footText ? [footText] : []);
      var moreHtml = hiddenFacts.length && moreLine ? C.more(hiddenFacts.length, 'facts', bw < 260, folded) : '';
      if (headCount && folded.length) C.headMore(ctx, body, folded); else C.headMore(ctx, body, []);
      if (inlineCount && folded.length && !moreHtml) head = head.replace(/^<div class="pmu-kpiline"/, '<div class="pmu-kpiline' + (inlineWrap ? ' has-count-row' : '') + '"').replace(/<\/div>$/, C.countHtml(folded, true) + '</div>');
      /* no room even for the line (or only the foot gave way): the tile's hover tag lists what folded (and Details has
         it) */
      var tileHover = folded.length && !(hiddenFacts.length && moreLine) && !headCount && !inlineCount ? C.foldHover(folded) : '';
      var foot = m.foot && footShown ? '<div class="pmu-kpifoot' + (hasBtn ? ' has-act' : '') + '">' + m.foot + '</div>' : '';
      if (wide) {
        body.innerHTML = '<div class="pmu-kpi is-wide"' + tileHover + '><div class="pmu-kpimain">' + head + subEl + (trend ? '<div class="pmu-kpitrend"></div>' : '') + foot + '</div>' +
          '<div class="pmu-kpiside">' + factsHtml + moreHtml + '</div></div>';
      } else {
        body.innerHTML = '<div class="pmu-kpi"' + tileHover + '>' + head + subEl + factsHtml + moreHtml + (trend ? '<div class="pmu-kpitrend"></div>' : '') + foot + '</div>';
      }
      var sp = body.querySelector('.pmu-kpispark, .pmu-kpitrend');
      if (sp) C.chart(body, 'spark', sp, { values: m.spark.values, idx: m.spark.idx || 0, tk: m.spark.tk }, { label: ctx.def.title + ' trend' });
    }
  });

  /* ================================================================== kpis: the totals strip (A1 3.6, 9.2) */
  /* model: {cells: [{label, key: {swatch|line|half}, value, fmt, sub: html, hover}]} */
  C.kind('kpis', {
    render: function (body, ctx) {
      var m = ctx.model || { cells: [] }, onlyValues = ctx.tier.bh < 60;
      var perRow = Math.max(1, Math.min(m.cells.length, Math.floor(ctx.tier.bw / 160))), cellW = ctx.tier.bw / perRow, short = cellW < 240;
      var tight = !onlyValues && ctx.tier.bh < 72;   /* a one-row strip of 4 rows keeps label, value and sub whole */
      body.innerHTML = '<div class="pmu-kpis' + (onlyValues ? ' is-values' : '') + (tight ? ' is-tight' : '') + '">' + m.cells.map(function (c, i) {
        var key = c.key ? (c.key.half ? '<i class="pmu-key" data-sw="half" data-tk="' + c.key.half[0] + '"></i><i class="pmu-key" data-sw="half" data-tk="' + c.key.half[1] + '"></i>'
          : c.key.line ? '<i class="pmu-key" data-sw="line" data-tk="' + c.key.line + '"></i>' : '<i class="pmu-key" data-sw="box" data-tk="' + c.key.swatch + '"></i>') : '';
        return '<div class="pmu-kpicell"' + C.hover(c.label, c.hover || '') + '><span class="pmu-kpicell-l">' + key + esc(c.label) + '</span>' +
          C.share(C.valHtml(c.value, c.fmt, 'pmu-kpivalue', ctx.id + ':' + i).replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"'), c.share) +
          (onlyValues ? '' : '<span class="pmu-kpisub">' + ((short && c.subShort) || c.sub || '') + '</span>') + '</div>';
      }).join('') + '</div>';
    }
  });

  /* ================================================================== list: fact and event rows */
  /* model: {rows: [{name, sub?, value?, valueHtml?, tone?, glyph?, mark?, lead?, note?, noteTone?, vs?, word?, key?, onClick?, hover?}], foot?, empty?, emptyFacts?} */
  /* the lead of a list row: a provider mark, a time + mark, or a glyph (widths measured in the theme face) */
  function leadOf(r) { return r.mark ? PMU.mark(r.mark, 18) : r.lead ? r.lead : r.glyph ? C.glyph(r.glyph, 'pmu-lglyph') : ''; }
  function leadW(r) {
    if (r.lead) {
      var t = /pmu-ltime">([^<]*)</.exec(r.lead), tw0 = t ? Math.max(40, (PMU.charts && PMU.charts.textW ? PMU.charts.textW(t[1], 13, false, 600) : 40) + 2) : 0;
      return tw0 + (/pmu-pmark|<svg|<img/.test(r.lead) ? (tw0 ? 8 : 0) + 18 : 0);
    }
    return r.mark ? 18 : r.glyph ? 16 : 0;
  }
  function valText(r) { return r.vs ? String(r.word || '') : r.valueHtml != null ? String(r.valueHtml).replace(/<[^>]+>/g, '') : r.value != null ? String(r.value) : ''; }
  var listImpl;
  C.kind('list', listImpl = {
    live: function (body, ctx) { return C.listLive(listImpl)(body, ctx); },
    grow: true,
    render: function (body, ctx) {
      var m = ctx.model || { rows: [] }, rows = m.rows || [];
      if (!rows.length) { body.innerHTML = C.empty(m.empty || 'No results for current filter', m.emptyFacts); return; }
      var bw = ctx.tier.bw;
      var hasSub = rows.some(function (r) { return r.sub; });
      /* a note column only for rows that carry a note (a day head's note is its date, not a column: Switch history kept an
         empty 100 px column and wrapped every event to four lines) */
      var extra = C.w(ctx, 'l') && rows.some(function (r) { return r.note && !r.day; });
      /* one column template for every row (LOOK-REVIEW-2 17: ragged middle columns): the lead and the value columns take
         the widest lead and value of the list, so names, notes and values line up down the card */
      var tw = function (s, px, wt) { return PMU.charts && PMU.charts.textW ? PMU.charts.textW(s, px, false, wt) : s.length * px * 0.55; };
      var lw = 0, vw = 0, anyLead = false;
      rows.forEach(function (r) { if (r.day) return; var l = leadW(r); if (l) anyLead = true; lw = Math.max(lw, l); vw = Math.max(vw, tw(valText(r), 13, 600) * 1.06 + (r.vs ? 20 : 0)); });
      vw = Math.ceil(Math.min(Math.max(28, vw + 6), bw * 0.42));
      var nameW = bw - (anyLead ? lw + 10 : 0) - vw - 10, noteW = 0;
      /* a narrow list whose name column would fall under 150 px puts each value on its own line under the name instead
         (Overview at 1440: "Claude allowance pressure" wrapped to three lines beside a 60 px "now" column) */
      var stack = !extra && vw > 0 && nameW < 150 && hasSub && rows.some(function (r) { return !r.day && valText(r); });
      if (stack) nameW = bw - (anyLead ? lw + 10 : 0);
      if (extra) { noteW = Math.round((nameW - 10) / 2.6); nameW = nameW - 10 - noteW; }
      /* two-line rows (name over its second line) when the card has the width; each row's height follows its wrapped
         text (LOOK-REVIEW-2 1 and 6: rows printed over each other when a wrapped second line overran a fixed pitch) */
      var two = hasSub && (C.w(ctx, 'm') || (C.w(ctx, 's') && rows.length * 44 + (m.foot ? 34 : 0) <= ctx.tier.bh));
      var rowHOf = function (r) {
        if (!r) return 0;
        if (r.day) return 30;
        var nl = C.wrapLines(r.name, nameW, 13, 540), sl = two && r.sub ? C.wrapLines(r.sub, nameW, 12) : 0;
        var notel = extra && r.note ? C.wrapLines(r.note, noteW, 12) : 0;
        var h = 8 + Math.max(nl * 17.6 + sl * 16.2 + (stack && valText(r) ? 17 : 0), notel * 16.2, 18);
        return Math.max(two ? 44 : 32, Math.ceil(h)) + 1;
      };
      var footH = m.foot ? 12 + 18 * Math.min(2, C.wrapLines(String(m.foot), bw - 30, 12.5)) : 0;
      /* fit whole rows (day heads count too, and a day head never ends the list) */
      var budget = ctx.tier.bh - footH - 2, used = 0, shown = [];
      for (var k = 0; k < rows.length; k++) {
        var hh = rowHOf(rows[k]);
        var reserveMore = k < rows.length - 1 ? 22 : 0;
        if (used + hh + reserveMore > budget && !(k === rows.length - 1 && used + hh <= budget)) break;
        if (rows[k].day && (k === rows.length - 1 || used + 30 + rowHOf(rows[k + 1]) > budget)) break;
        used += hh; shown.push(rows[k]);
      }
      var hidden = rows.filter(function (r) { return !r.day; }).length - shown.filter(function (r) { return !r.day; }).length;
      var cols = stack ? (anyLead ? lw + 'px ' : '') + 'minmax(0,1fr)' : (anyLead ? lw + 'px ' : '') + 'minmax(0,1fr) ' + (extra ? noteW + 'px ' : '') + vw + 'px';
      body.innerHTML = '<div class="pmu-list is-aligned' + (two ? ' is-two' : '') + (extra ? ' has-note' : '') + (stack ? ' is-stack' : '') + '" style="--pmu-lcols:' + cols + '">' + shown.map(function (r, i) {
        if (r.day) return '<div class="pmu-lday" data-reveal><b>' + esc(r.day) + '</b><span>' + esc(r.note || '') + '</span></div>';
        var lead = leadOf(r);
        var val = r.vs ? C.vs(r.vs, r.word) : r.valueHtml != null ? r.valueHtml : r.value != null ? esc(r.value) : '';
        var hov = r.hover ? C.hover(r.name, r.hover) : !two && r.sub ? C.hover(r.name, r.sub + (r.note ? ' · ' + r.note : '')) : !extra && r.note ? C.hover(r.name, r.note) : '';
        return '<div class="pmu-lrow' + (r.onClick ? ' is-click' : '') + (anyLead ? '' : ' no-lead') + '" data-reveal data-lkey="' + esc(r.key || r.name) + '" data-lh="' + rowHOf(r) + '"' + C.shareAttr(r.share) + (r.tone ? ' data-tone="' + r.tone + '"' : '') + (r.prov ? ' data-prov="' + esc(r.prov) + '"' : '') +
          (r.vs ? ' data-vs="' + esc(r.vs) + '"' : '') + (r.onClick ? ' data-pmu-row="' + i + '" role="button" tabindex="0"' : '') + hov + '>' +
          (anyLead ? '<span class="pmu-llead">' + lead + '</span>' : '') +
          '<span class="pmu-lname"><b>' + esc(r.name) + '</b>' + (two && r.sub ? '<span>' + esc(r.sub) + '</span>' : '') + '</span>' +
          (extra ? '<span class="pmu-lnote"' + (r.noteTone ? ' data-tone="' + r.noteTone + '"' : '') + '>' + esc(r.note || '') + '</span>' : '') +
          '<span class="pmu-lval">' + val + '</span></div>';
      }).join('') + C.more(hidden, null, false, rows.filter(function (r) { return !r.day && shown.indexOf(r) < 0; }).map(function (r) { return r.name + ' ' + valText(r) + (r.sub ? ' · ' + r.sub : '') + (r.note ? ' · ' + r.note : ''); })) + '</div>' + (m.foot ? C.foot(m.foot, m.footGlyph) : '');
      if (shown.some(function (r) { return r.onClick; })) {
        body.querySelector('.pmu-list').addEventListener('click', function (event) {
          var row = event.target.closest('[data-pmu-row]'); if (!row) return;
          var r = shown[+row.getAttribute('data-pmu-row')]; if (r && r.onClick) r.onClick(row);
        });
      }
    }
  });

  /* the list's live hook (WOW-SPEC-3 8.4, an alert arriving): the same rows -> in-place words; one new row at the top ->
     it is inserted (one child-list change, the only one of the beat), the rows below FLIP down (250 SLIDE), the new row
     rises 8 px with its opacity (260 OUT) and its severity glyph pops (POP 260); a row pushed past the card leaves and
     the "N more" line counts it. Anything else waits for an idle re-render. */
  C.listLive = function (impl) {
    return function (body, ctx) {
      var list = body.querySelector('.pmu-list'); if (!list) return false;
      var dry = document.createElement('div'); dry._pmuDry = true;
      try { impl.render(dry, Object.assign({}, ctx, { _dry: true })); } catch (error) { return false; }
      var dl = dry.querySelector('.pmu-list'); if (!dl) return false;
      var keysOf = function (root) { return Array.prototype.map.call(root.querySelectorAll(':scope > .pmu-lrow'), function (r) { return r.getAttribute('data-lkey'); }); };
      var k0 = keysOf(list), k1 = keysOf(dl);
      if (k0.join('\n') === k1.join('\n')) return C.livePatch(body, dry, ctx) ? true : false;
      if (k1.length < 1 || k0.indexOf(k1[0]) >= 0 || k1.slice(1).join('\n') !== k0.slice(0, k1.length - 1).join('\n')) return false;
      var rows0 = Array.prototype.slice.call(list.querySelectorAll(':scope > .pmu-lrow')), nr = dl.querySelector(':scope > .pmu-lrow');
      var fin = ctx.liveFinal, st = PMU.motion.family && /retro|nier/.test(PMU.motion.family());
      list.insertBefore(nr, rows0[0] || list.firstChild);
      for (var i = k1.length - 1; i < rows0.length; i++) rows0[i].remove();
      var m0 = list.querySelector(':scope > .pmu-more'), m1 = dl.querySelector(':scope > .pmu-more');
      if (m0 && m1) { m0.textContent = m1.textContent; ['data-pm-hover-label', 'data-pm-hover-detail'].forEach(function (a) { if (m1.hasAttribute(a)) m0.setAttribute(a, m1.getAttribute(a)); }); }
      else if (m1 && !m0) list.appendChild(m1);
      if (fin) return true;
      var dy = +nr.getAttribute('data-lh') || 44;   /* the row's height from the render's own estimate (no layout read) */
      rows0.slice(0, k1.length - 1).forEach(function (r) { PMU.motion.animate(r, [{ transform: 'translateY(' + (-dy) + 'px)' }, { transform: 'none' }], { dur: st ? 160 : 250, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.22,1,.36,1)' }); });
      PMU.motion.animate(nr, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { dur: 260, delay: 120, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
      var g = nr.querySelector('.pmu-llead .pmu-ico, .pmu-llead svg');
      if (g) PMU.motion.animate(g, [{ transform: 'scale(.2)' }, { transform: 'scale(1.25)', offset: 0.6 }, { transform: 'none' }], { dur: 260, delay: 300, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.45,.64,1)', fill: 'backwards' });
      return true;
    };
  };

  /* ================================================================== table: data tables (ledger and others) */
  /* model: {cols: [{key, label, align?, min?: tier, w?: css, fmt?}], rows: [{cells: {key: text|{html}}, tone?, onClick?, id?}],
             toolbar?: {search?: placeholder, filters?: [{key, label, options: [{value, label}], value}], export?: fn}, empty?, foot?} */
  C.kind('table', {
    /* "Fit" in the card menu (NOTES2-engine, paging at S): the height in rows that shows every record without a pager,
       at most the kind's tallest size; null when the card already shows them all */
    autoH: function (ctx) {
      var card = PMU.board && PMU.board.card ? PMU.board.card(ctx.id) : null, body = card && card.querySelector('.pmu-cardbody');
      if (!card || !body || !(body._pmuTableNeed > 0)) return null;
      var h = +card.dataset.h || 0, bh = body.clientHeight, extra = body._pmuTableNeed - bh;
      if (!h || extra <= 0) return null;
      var lim = (PMU_BOARDS.kinds && PMU_BOARDS.kinds.table && PMU_BOARDS.kinds.table.hMax) || 24;
      var pitch = PMU.board.ROW || 30;   /* the row pitch: a 22 px row and the 8 px gap */
      var fit = Math.min(lim, h + Math.ceil(extra / pitch));
      return fit > h ? fit : null;   /* already at the tallest size: no Fit (a resize to the same size would be a no-op) */
    },
    render: function (body, ctx) {
      var m = ctx.model || { cols: [], rows: [] }, id = ctx.id;
      var cols = m.cols.map(function (c) { return c.key ? c : Object.assign({}, c, { key: c.id }); }).filter(function (c) { return !c.min || C.w(ctx, c.min); });
      var minPx = function (c) { var mm = /(\d+)px/.exec(c.w || ''); return mm ? +mm[1] : 60; };
      var need = function () { return cols.reduce(function (a, c) { return a + minPx(c); }, 0) + 12 * (cols.length - 1); };
      ['xl', 'l', 'm', 's'].forEach(function (tierName) {
        for (var drop = cols.length - 1; need() > ctx.tier.bw && drop >= 0; drop--) { if (cols[drop] && cols[drop].min === tierName) cols.splice(drop, 1); }
      });
      var q = String(C.view(id, 'q', '') || '').toLowerCase(), page = +C.view(id, 'page', 0) || 0;
      var filters = ((m.toolbar && m.toolbar.filters) || []).map(function (f) { return f.key ? f : Object.assign({}, f, { key: f.id }); });
      var rows = m.rows.filter(function (r) {
        if (q && JSON.stringify(r.cells).toLowerCase().indexOf(q) < 0) return false;
        return filters.every(function (f) { var v = C.view(id, 'f-' + f.key, 'all'); return v === 'all' || r.match && r.match[f.key] === v; });
      });
      var tb = m.toolbar ? 34 : 0, pager = 30, headH = 28;
      /* each row's height follows its wrapped cells (LOOK-REVIEW-2 12: "Page 1 of 8" with two rows a page, because the
         rows wrapped and the page size assumed one-line rows). Column widths come from the template: fixed px columns,
         then the fr columns share the rest above their minimums. */
      var widths = (function () {
        var gap = 12 * (cols.length - 1), fixed = 0, frs = 0, mins = 0;
        var spec = cols.map(function (c) {
          var w = c.w || 'minmax(0,1fr)', px = /^(\d+)px$/.exec(w), mm = /minmax\((\d+)px,\s*([\d.]+)fr\)/.exec(w), fr = /^minmax\(0,\s*([\d.]+)fr\)$/.exec(w);
          if (px) { fixed += +px[1]; return { px: +px[1] }; }
          if (mm) { frs += +mm[2]; mins += +mm[1]; return { min: +mm[1], fr: +mm[2] }; }
          var f = fr ? +fr[1] : 1; frs += f; return { min: 0, fr: f };
        });
        var free = Math.max(0, ctx.tier.bw - gap - fixed);
        return spec.map(function (s) { return s.px || Math.max(s.min, free * s.fr / Math.max(0.001, frs)); });
      })();
      var rowHOf = function (r) {
        var lines = 1;
        cols.forEach(function (c, i) {
          var v = r.cells[c.key], t = v && typeof v === 'object' ? String(v.html || '').replace(/<wbr>/g, '') : v == null ? '' : String(v);
          var extraW = /pmu-pmark|<svg|<img/.test(t) ? 22 : /pmu-vs/.test(t) ? 20 : 0;
          lines = Math.max(lines, C.wrapLines(t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), widths[i] - extraW, c.mono ? 12 : 13, /<b>/.test(t) ? 600 : 400));
        });
        return Math.max(32, 10 + Math.ceil(lines * 17.6)) + 1;
      };
      var avail = ctx.tier.bh - tb - headH - (m.foot ? 30 : 0);
      /* pages by height: the first page takes the rows that fit with no pager; only when rows remain does a pager take its
         line, and a page never holds fewer than its share of the card */
      var pageStarts = [0];
      (function () {
        var all = rows.map(rowHOf), sumAll = all.reduce(function (a, h) { return a + h; }, 0);
        body._pmuTableNeed = sumAll + tb + headH + (m.foot ? 30 : 0);   /* the body height that shows every row (autoH, "Fit") */
        if (sumAll <= avail) return;
        var room = avail - pager, used = 0;
        for (var i = 0; i < all.length; i++) {
          if (used + all[i] > room && used > 0) { pageStarts.push(i); used = 0; }
          used += all[i];
        }
      })();
      var pages = pageStarts.length; page = Math.min(page, pages - 1);
      var size = (pageStarts[page + 1] != null ? pageStarts[page + 1] : rows.length) - pageStarts[page];
      var shown = rows.slice(pageStarts[page], pageStarts[page] + size);
      var tmpl = cols.map(function (c) { return c.w || 'minmax(0,1fr)'; }).join(' ');
      var toolbar = '';
      if (m.toolbar) {
        toolbar = '<div class="pmu-ttools">' + (m.toolbar.search != null ? '<label class="pmu-tsearch">' + C.glyph('search') + '<input type="text" data-pmu-tsearch value="' + esc(C.view(id, 'q', '')) + '" placeholder="' + esc(m.toolbar.search || 'Search') + '" aria-label="' + esc(m.toolbar.search || 'Search') + '"></label>' : '') +
          filters.filter(function () { return C.w(ctx, 'm'); }).map(function (f) {
            var v = C.view(id, 'f-' + f.key, 'all'), o = f.options.filter(function (x) { return x.value === v; })[0];
            return '<button type="button" class="pmu-tfilter" data-pmu-act="tfilter" data-key="' + esc(f.key) + '" aria-haspopup="menu">' + esc(f.label) + ' <b>' + esc(o ? o.label : 'All') + '</b>' + C.glyph('chevronDown') + '</button>';
          }).join('') + '<span class="pmu-tcount">' + (rows.length ? esc((pageStarts[page] + 1) + '-' + (pageStarts[page] + shown.length) + ' of ' + rows.length) : '0 of 0') + '</span>' +
          (m.toolbar.export ? '<button type="button" class="pmu-iconbtn pmu-texport" data-pmu-act="texport" aria-label="Export" data-pm-hover-label="Export these records">' + SVG['export'] + '</button>' : '') + '</div>';
      }
      var head = '<div class="pmu-trow pmu-thead" style="grid-template-columns:' + tmpl + '">' + cols.map(function (c) { return '<span class="pmu-cap"' + (c.align === 'right' ? ' data-align="r"' : '') + '>' + esc(c.label) + '</span>'; }).join('') + '</div>';
      var bodyRows = shown.length ? shown.map(function (r, i) {
        return '<div class="pmu-trow' + (r.onClick ? ' is-click' : '') + '" data-reveal style="grid-template-columns:' + tmpl + '"' + (r.tone ? ' data-tone="' + r.tone + '"' : '') +
          (r.onClick ? ' data-pmu-row="' + i + '" role="button" tabindex="0"' : '') + (r.hover ? C.hover(r.hover[0], r.hover[1]) : '') + '>' + cols.map(function (c) {
            var v = r.cells[c.key], html = v && typeof v === 'object' ? v.html : esc(v == null ? '' : v);
            return '<span class="pmu-tcell"' + (c.align === 'right' ? ' data-align="r"' : '') + (c.mono ? ' data-mono' : '') + '>' + html + '</span>';
          }).join('') + '</div>';
      }).join('') : (q || filters.some(function (f) { return C.view(id, 'f-' + f.key, 'all') !== 'all'; })) ? C.empty('No results for current filter', m.rows.length + ' records in the selected scope and range')
        : C.empty(m.empty || 'No results for current filter', m.emptyFacts);
      var pg = pages > 1 ? '<div class="pmu-tpager"><button type="button" class="pmu-textbtn" data-pmu-act="tpage" data-value="' + (page - 1) + '"' + (page ? '' : ' disabled') + '>Previous</button><span>Page ' + (page + 1) + ' of ' + pages + '</span>' +
        '<button type="button" class="pmu-textbtn" data-pmu-act="tpage" data-value="' + (page + 1) + '"' + (page < pages - 1 ? '' : ' disabled') + '>Next</button></div>' : '';
      body.innerHTML = '<div class="pmu-table">' + toolbar + head + '<div class="pmu-tbody">' + bodyRows + '</div>' + pg + '</div>' + (m.foot ? C.foot(m.foot) : '');
      body._pmuTable = { model: m, shown: shown };
      var tbody = body.querySelector('.pmu-tbody');
      if (tbody) tbody.addEventListener('click', function (event) { var row = event.target.closest('[data-pmu-row]'); if (!row) return; var r = shown[+row.getAttribute('data-pmu-row')]; if (r && r.onClick) r.onClick(row); });
      var input = body.querySelector('[data-pmu-tsearch]');
      if (input) {
        var timer = 0;
        input.addEventListener('input', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            var pos = input.selectionStart;
            C.setView(id, { q: input.value, page: 0 });
            var again = ctx.card.querySelector('[data-pmu-tsearch]'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) {} }
          }, 140);
        });
      }
    }
  });
  C.act('tpage', function (el, id) { C.setView(id, { page: Math.max(0, +el.getAttribute('data-value') || 0) }); });
  C.act('tfilter', function (el, id) {
    var card = PMU.board.card(id), body = card && card.querySelector('.pmu-cardbody'), m = body && body._pmuTable ? body._pmuTable.model : null;
    if (!m) return;
    var key = el.getAttribute('data-key'), f = m.toolbar.filters.filter(function (x) { return (x.key || x.id) === key; })[0];
    if (!f) return;
    PMU.menu.choice(el, { title: f.label, value: C.view(id, 'f-' + key, 'all'), options: [{ value: 'all', label: 'All', sub: 'Every ' + f.label.toLowerCase() }].concat(f.options),
      onPick: function (v) { var patch = { page: 0 }; patch['f-' + key] = v; C.setView(id, patch); } });
  });
  C.act('texport', function (el, id) {
    var card = PMU.board.card(id), body = card && card.querySelector('.pmu-cardbody'), m = body && body._pmuTable ? body._pmuTable.model : null;
    if (m && m.toolbar && typeof m.toolbar.export === 'function') m.toolbar.export(el);
  });

  /* ================================================================== mix: 100 % mix bars */
  /* model: {segments: [{name, value, valueText, idx|tk|vendor, est?, sub?}], total?, totalText?, caption?, facts?} */
  C.kind('mix', {
    render: function (body, ctx) {
      var m = ctx.model || { segments: [] }, segs = m.segments || [];
      var total = m.total || PMU.data.sum(segs.map(function (s) { return s.value; }));
      if (!segs.length || !total) { body.innerHTML = C.empty(m.empty || 'No values for the selected range', m.emptyFacts); return; }
      /* the rows (name, value, share) whenever the card has their height: a 5-track tile shows its states as rows instead of
         a legend the body would cut */
      var rowsOk = (C.w(ctx, 'm') && C.h(ctx, 'h2')) || (ctx.tier.bw >= 190 && ctx.tier.bh >= (m.headline ? 42 : 0) + 24 + 30 * Math.min(2, segs.length));
      /* a head label that would wrap takes its short form (the full words stay in its hover tag): a tile's legend rows
         keep their room (Retro 2026-10-02: the second legend row ran 7 px under the tile's edge) */
      var hLab = m.headline ? m.headline.label || '' : '';
      if (m.headline && m.headline.short && (C.wrapW(C.fmt(m.headline.value, m.headline.fmt), 22, 640) + 8 + C.wrapW(hLab, 12.5)) / 1.06 > ctx.tier.bw) hLab = m.headline.short;
      var head = m.headline ? '<div class="pmu-mixhead">' + C.valHtml(m.headline.value, m.headline.fmt, 'pmu-bigval', ctx.id + ':h').replace('class="pmu-num"', 'class="pmu-num" data-count="1"') + '<span' + (hLab !== (m.headline.label || '') ? C.hover(m.headline.label, '') : '') + '>' + esc(hLab) + '</span></div>' : '';
      /* rows and head from their wrapped words (Retro 2026-10-02: "Plan / estimate" and "Settled / API" on two lines each ran
         the last row 7 px under the tile's edge) */
      var bwI = ctx.tier.bw;
      /* a narrow tile names a segment by its short word where the model gives one ("Pending" for "Pending provider receipt") */
      /* (CONTENT-3: from 280 px down, so the 6-track Settlement states tile at 1440 keeps its three rows on one line each;
         the full name is the row's hover tag) */
      var nm = function (sg) { return bwI < 280 && sg.short ? sg.short : sg.name; };
      var vt = function (sg) { return bwI < 240 && sg.valueShort ? sg.valueShort : sg.valueText || C.fmt(sg.value, m.fmt); };
      /* the head's number (bigval) and its label share a line; a label that does not fit beside it wraps under it */
      /* measured: the one-line head and the bar take 54 px with the gaps (30 + the 24 below); the fit pass keeps any
         optimism whole */
      var headH = !head ? 0 : 30 + ((C.wrapW(C.fmt(m.headline.value, m.headline.fmt), 22, 640) + 8 + C.wrapW(hLab, 12.5)) / 1.06 > bwI ? 18 : 0);
      /* a column under 190 px stacks each row: the name, then its value and share under it (CONTENT-3: the chart's legend
         put "Plan estimate" on four lines in a 32 px column and ran the 4 x 7 tile 5 px past its edge at 1440) */
      var stackRows = bwI < 190;
      var rowHOf = function (sg) {
        if (stackRows) return 9 + 17 * (1 + Math.min(2, C.wrapLines(nm(sg), bwI - 18, 12.5))) + 2;
        var nameW = bwI - 10 - 36 - 24 - C.wrapW(vt(sg), 12.5, 600);
        return 30 + 17 * Math.max(0, Math.min(3, C.wrapLines(nm(sg) + (sg.sub && C.w(ctx, 'l') ? ' ' + sg.sub : ''), nameW, 12.5)) - 1);
      };
      if (stackRows && C.h(ctx, 'h2')) rowsOk = true;
      var footRoom = m.foot && C.h(ctx, 'h2') ? 8 + 22 * Math.min(2, C.wrapLines(String(m.foot).replace(/<[^>]+>/g, ''), ctx.tier.bw - 24, 12.5)) : 0;
      var fitRowsM = function (fRoom) {
        var n = 0, roomR = ctx.tier.bh - headH - 24 - fRoom, usedR = 0;
        for (var si = 0; si < segs.length; si++) {
          var hR = rowHOf(segs[si]);
          if (usedR + hR + (si < segs.length - 1 ? 22 : 0) > roomR && !(si === segs.length - 1 && usedR + hR <= roomR)) break;
          usedR += hR; n += 1;
        }
        return n;
      };
      var fit = fitRowsM(footRoom), footShown = !!footRoom;
      /* the foot gives way to a row it would hide; its words join the "N more" hover tag or the card's (CONTENT-3) */
      if (footRoom && fit < segs.length && fitRowsM(0) > fit) { fit = fitRowsM(0); footShown = false; }
      var footFold = m.foot && !footShown ? [String(m.foot).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()] : [];
      /* the chart's legend rows (name, count and share) where they fit whole; where their wrapped names would run under
         the tile's edge (Glass Light 2026-10-02: "Adjusted / and / settled" 9 px under it) the rows form with its "N more"
         line, which the fit pass keeps whole */
      var legH = 0; segs.forEach(function (sg) { legH += 6 + 16 * Math.min(3, C.wrapLines(nm(sg), bwI - 24 - C.wrapW(vt(sg) + ' · 100%', 12.5, 600), 12.5)); });
      if (!rowsOk && fit && C.h(ctx, 'h2') && headH + 30 + legH > ctx.tier.bh) rowsOk = true;
      /* no whole row fits: the chart's own legend rows name the segments instead of an empty "N more" */
      if (rowsOk && !fit) rowsOk = false;
      var segFold = segs.slice(rowsOk ? fit : segs.length).map(function (s) { return s.name + ' ' + vt(s) + ' · ' + C.fmt(100 * s.value / total, 'pct') + (s.sub ? ' · ' + s.sub : ''); });
      body.innerHTML = '<div class="pmu-mix"' + (rowsOk && fit < segs.length ? '' : C.foldHover((rowsOk ? [] : segs.filter(function (s) { return s.sub; }).map(function (s) { return s.name + ' · ' + s.sub; })).concat(footFold))) + '>' + head + '<div class="pmu-mixhost"></div>' + (rowsOk ? '<div class="pmu-mixrows' + (stackRows ? ' is-stack' : '') + '">' + segs.slice(0, fit).map(function (s) {
        return '<div class="pmu-mixrow" data-reveal' + (s.prov ? ' data-prov="' + esc(s.prov) + '"' : '') + '><i class="pmu-swatch" data-sw="' + (s.est ? 'hatch' : 'box') + '"' + C.keyAttrs(s) + '></i><span class="pmu-mixname"' + (nm(s) !== s.name || (s.sub && !C.w(ctx, 'l')) ? C.hover(s.name, s.sub && !C.w(ctx, 'l') ? s.sub : '') : '') + '>' + esc(nm(s)) +
          (s.sub && C.w(ctx, 'l') ? '<em>' + esc(s.sub) + '</em>' : '') + '</span><b>' + esc(vt(s)) + '</b><span class="pmu-mixpct">' + esc(C.fmt(100 * s.value / total, 'pct')) + '</span></div>';
      }).join('') + C.more(segs.length - Math.min(fit, segs.length), null, false, segFold.concat(footFold)) + '</div>' : '') + '</div>' + (m.foot && footShown ? C.foot(m.foot) : '');
      /* a short mix keeps an inline swatch legend with the counts (the segment names never live only in hover tags) */
      C.chart(body, 'mix', body.querySelector('.pmu-mixhost'), { segments: segs.map(function (s) { return { name: nm(s), value: s.value, idx: s.idx, tk: s.tk, vendor: s.vendor, est: !!s.est, valueText: bwI < 240 && s.valueShort ? s.valueShort : s.valueText }; }), total: total, legend: rowsOk ? false : C.h(ctx, 'h2') ? 'rows' : false },
        { label: ctx.def.title });
    }
  });
  C.keyAttrs = function (s) {
    return (s.tk ? ' data-tk="' + s.tk + '"' : '') + (s.vendor ? ' data-vendor="' + s.vendor + '"' : '') + (s.idx != null ? ' data-series-index="' + s.idx + '"' : '') + (s.tone ? ' data-tone="' + s.tone + '"' : '');
  };

  /* ================================================================== ranked bars */
  /* model: {rows: [{id, name, role?, value, valueText, share?, idx|vendor|tk, est?, prov?, sub?}], scale?, foot?} */
  C.kind('ranked', {
    render: function (body, ctx) {
      var m = ctx.model || { rows: [] }, rows = m.rows || [];
      if (!rows.length) { body.innerHTML = C.empty(m.empty || 'No values for the selected range', m.emptyFacts); return; }
      /* two-line rows when they show every row; otherwise the one-line form whenever it shows more rows */
      var fit2 = C.fit(ctx.tier.bh, 48, 4), fit1 = C.fit(ctx.tier.bh, 34, 4);
      var inline = !C.w(ctx, 'm') || (fit2 < rows.length && fit1 > fit2), rowH = inline ? 34 : 48;
      var footOk = m.foot && C.fit(ctx.tier.bh, rowH, 38) >= rows.length;
      var fit = C.fit(ctx.tier.bh, rowH, (footOk ? 38 : 0) + 4);
      var shown = rows.length > fit ? rows.slice(0, Math.max(1, fit * rowH + 22 + 4 <= ctx.tier.bh ? fit : fit - 1)) : rows;
      /* the rows past the card and a foot that gave way are listed in the "N more" line's hover tag, or the host's (CONTENT-3) */
      var rankFold = rows.slice(shown.length).map(function (r) { return r.name + ' ' + (r.valueText || '') + (r.role ? ' · ' + r.role : ''); });
      var footFold = m.foot && !footOk ? [String(m.foot).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()] : [];
      body.innerHTML = '<div class="pmu-rankedhost' + (inline ? ' is-inline' : '') + '"' + (rankFold.length ? '' : C.foldHover(footFold)) + '></div>' + C.more(rows.length - shown.length, null, false, rankFold.concat(footFold)) + (footOk ? C.foot(m.foot) : '');
      var host = body.querySelector('.pmu-rankedhost');
      
      /* a narrow card shows a provider's short word (its full Settings name in the hover) instead of a name on three
         lines (LOOK-REVIEW-2 15) */
      /* final fix M8: by measure, row by row: the Settings name when it fits beside the value and a 48 px bar, else the
         short word (Route pressure at 1920 read "Codex, Kimi, Qwen, Copilot, Gemini" with room for "Kimi Code") */
      var valW = 0; shown.forEach(function (r) { valW = Math.max(valW, C.wrapW(inline && r.valueShort ? r.valueShort : r.valueText || '', 13, 640)); });
      var nameAvail = ctx.tier.bw - 16 - 20 - 48 - valW - 24;
      var narrowName = function (r) { return r.short && r.short !== r.name && !C.fitsW(r.name, nameAvail, 13, 560); };
      /* a row's second words (its role) keep whole " · " parts that fit beside the name and the value, measured; the
         whole role stays in the row's hover tag (CONTENT-3, census: "Gemini vision helper route · counts against API
         budget" and "subscription · covered · 2 attempts" ended in an ellipsis at 1920) */
      var fitRole = function (r) {
        /* the one-line form draws no role: its words go to the row's hover tag (CONTENT-3: "conversation history" and
           "loaded context" of Source mix were only in Details at the S board) */
        if (inline && (r.role || r.valueFull)) return Object.assign({}, r, { hover: [r.valueFull && r.valueFull !== r.valueText ? r.valueFull : '', r.role, r.hover].filter(Boolean).join(' · ') });
        if (inline || !r.role) return r;
        var nm = narrowName(r) ? r.short : r.name, vt = inline && r.valueShort ? r.valueShort : r.valueText || '';
        /* the row: 10 px padding each side, the mark and its 8 px gap, the name, 8 px, the role, the 10 px column gap, the value */
        var avail = ctx.tier.bw - 20 - (r.mark ? 24 : 0) - C.wrapW(nm, 13, 560) - 8 - C.wrapW(vt, 13, 620) - (isFinite(r.share) ? C.wrapW('100%', 12) + 6 : 0) - 14;
        var k = PMU.theme.look().nier || PMU.theme.look().family === 'retro' ? 1.12 : 1;
        var segs = String(r.role).split(' · ');
        while (segs.length && C.wrapW(segs.join(' · '), 12) * k > avail) segs.pop();
        var role = segs.join(' · ');
        return role === r.role ? r : Object.assign({}, r, { role: role, hover: [r.role, r.hover].filter(Boolean).join(' · ') });
      };
      var c = C.chart(body, 'ranked', host, { rows: (inline || !C.w(ctx, 'l') ? shown.map(function (r) { return Object.assign({}, r, inline && r.valueShort ? { valueText: r.valueShort, valueFull: r.valueText } : {}, narrowName(r) ? { name: r.short, hover: r.hover || r.name } : {}); }) : shown).map(fitRole), scale: m.scale, inline: inline }, { label: ctx.def.title, tier: ctx.tier });
      if (!c && !body._pmuDry) host.innerHTML = shown.map(function (r) { return '<div class="pmu-lrow"><span class="pmu-lname"><b>' + esc(r.name) + '</b></span><span class="pmu-lval">' + esc(r.valueText) + '</span></div>'; }).join('');
    }
  });

  /* ================================================================== gauge: a single-value ring tile (tool health) */
  /* model: {value, max, fmt, centre, caption, facts} */
  C.kind('gauge', {
    render: function (body, ctx) {
      var m = ctx.model || {};
      var side = C.w(ctx, 'm') && ctx.tier.bh >= 90;
      var ring = Math.max(56, Math.min(side ? 96 : 88, ctx.tier.bh - (side ? 8 : 60)));
      var rows = side ? C.fit(ctx.tier.bh, 27) : C.fit(ctx.tier.bh - ring - 8, 27);
      body.innerHTML = '<div class="pmu-gauge' + (side ? ' is-side' : '') + '"><div class="pmu-gaugering" style="width:' + ring + 'px;height:' + ring + 'px"></div>' +
        '<div class="pmu-gaugefacts">' + C.facts(m.facts || [], rows) + '</div></div>';
      C.chart(body, 'gauge', body.querySelector('.pmu-gaugering'), { value: m.value, max: m.max || 100, centre: m.centre, caption: m.caption, idx: 1, token: 'calm' }, { label: ctx.def.title });
    }
  });

  /* ================================================================== context: the window ring card (context-now, ctx-window) */
  /* model: {pct, used, limit, segments: [{name, value, idx}], reserved, facts: [[...]], route, routeFacts: [[...]]} */
  C.kind('context', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No thread context'); return; }
      /* the ring sits beside its legend whenever the card is at least 200 px wide and too short to stack ring, bar and
         three legend rows (a narrow 6 x 8 card stacked showed no family at all) */
      var LEG = PMU.theme.look().nier ? 26 : 24, MORE = 34, n = m.segments.length;
      var side = C.w(ctx, 'm') || (ctx.tier.bw >= 200 && ctx.tier.bh < 84 + 30 + 3 * LEG);
      var legendRows = m.segments.map(function (s) {
        return '<div class="pmu-ctxleg" data-reveal><i class="pmu-swatch" data-sw="box" data-series-index="' + s.idx + '"></i><span>' + esc(s.name) + '</span><b>' + esc(PMU.fmt.tok(s.tokens)) + '</b><em>' + esc(s.pct + '%') + '</em></div>';
      });
      var bh = ctx.tier.bh;
      var heroW = C.isHero(ctx) && (C.w(ctx, 'm') || (ctx.tier.bw >= 200 && bh < 84 + 30 + 3 * LEG));
      /* facts take a third column only where the legend keeps about 240 px beside the ring */
      var factsRoom = C.w(ctx, 'l') && (!heroW || ctx.tier.bw - 168 - 32 >= 480);
      var oneCol = side || ctx.tier.bw < 300, per = oneCol ? 1 : 2, needRows = Math.ceil(n / per);
      /* measured: ring + 10 px gap, composition bar 8 px + 10 px gap, legend rows 24 px (26 in NieR), "N more" line 24 px.
         A stacked card keeps the 84 px ring and the bar only when every family still fits; otherwise the bar goes (the ring
         shows the same split) and the ring shrinks to 68 px, so families come first */
      var ringPx, mixOk, avail;
      /* the Context room's hero: one large ring (WOW-SPEC 4, Context) */
      var heroRing = C.isHero(ctx) && side;
      /* CONTENT-3: the hero ring without a facts column runs its facts under the ring and the legend at the card's full
         width (three or four columns); the ring keeps the legend's height (at least 120 px), so the band under the ring
         holds facts instead of air ("4 more at a taller size" over free space at 1920) */
      var below = heroRing && !factsRoom && m.facts && m.facts.length, belowLay = null, belowN = 0, belowMore = false;
      if (side) { mixOk = true; ringPx = heroRing ? Math.round(Math.max(120, Math.min(168, bh - 8, ctx.tier.bw * 0.36))) : C.w(ctx, 'm') ? 96 : 68; avail = bh - 18; }
      else if (bh - 84 - 10 - 18 >= needRows * LEG) { mixOk = true; ringPx = 84; avail = bh - 84 - 10 - 18; }
      else { mixOk = false; ringPx = 68; avail = bh - 68 - 10; }
      if (below) {
        var legBlock = 18 + n * LEG;
        ringPx = Math.round(Math.max(120, Math.min(ringPx, legBlock)));
        var topH = Math.max(ringPx, legBlock), roomB = bh - topH - 4;   /* the body's 8 px gap less the block's own 4 (fitRows) */
        belowLay = C.factLayout(m.facts, ctx.tier.bw, 0, 4);
        var frB = belowLay.fit(roomB);
        if (frB.n < m.facts.length && roomB >= 25) { frB = belowLay.fit(roomB - 25); belowMore = true; }
        belowN = frB.n;
        avail = topH - 18;
      }
      var legFit = C.fit(avail, LEG);
      var factFit = factsRoom ? C.fit(bh, 26) : 0;
      /* two legend columns only where a family name and its count both fit (about 145 px a column); every family shows or
         the hidden ones are counted on one line (complete or hidden) */
      var legCap = legFit * per;
      if (legCap < n) legCap = Math.max(per, C.fit(avail - MORE, LEG) * per);
      body.innerHTML = '<div class="pmu-ctx' + (side ? ' is-side' : '') + (heroRing ? ' is-hero' : '') + (factsRoom ? ' has-facts' : '') + (below ? ' has-below' : '') + (ctx.tier.bw < 300 ? ' is-narrow' : '') + '">' +
        '<div class="pmu-ctxring" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' +
        '<div class="pmu-ctxmain">' + (mixOk ? '<div class="pmu-ctxmix"></div>' : '') + '<div class="pmu-ctxlegs' + (oneCol ? '' : ' is-2col') + '">' + legendRows.slice(0, legCap).join('') + '</div>' + (legCap < legendRows.length ? C.more(legendRows.length - legCap, legendRows.length - legCap === 1 ? 'family' : 'families', ctx.tier.bw < 260, m.segments.slice(legCap).map(function (s) { return s.name + ' ' + PMU.fmt.tok(s.tokens) + ' · ' + s.pct + '%'; })) : '') + '</div>' +
        (factsRoom ? '<div class="pmu-ctxfacts">' + C.facts(m.facts, factFit) + '</div>' : '') + '</div>';
      if (below && (belowN || belowMore)) {
        var hidF = m.facts.slice(belowN);
        body.insertAdjacentHTML('beforeend', '<div class="pmu-ctxfacts is-below">' + (belowN ? belowLay.html(belowN) : '') + (belowMore ? C.more(hidF.length, 'facts', false, hidF.map(C.factText)) : '') + '</div>');
      } else if (below) { body.firstChild.setAttribute('data-pm-hover-label', C.FOLD_LABEL); body.firstChild.setAttribute('data-pm-hover-detail', m.facts.map(C.factText).join('; ')); }
      C.chart(body, 'ring', body.querySelector('.pmu-ctxring'), { segments: m.segments.map(function (s) { return { name: s.name, value: s.tokens, idx: s.idx }; }).concat([{ name: 'Reserved output', value: m.reserved, idx: 7, hatched: true }]),
        limit: m.limit, value: m.used, max: m.limit, centre: m.pct + '%', caption: PMU.fmt.tok(m.used) + ' / ' + PMU.fmt.tok(m.limit), token: 'in', share: 'context', centreShare: 'num:context.pct' }, { label: 'Context window ' + m.pct + '% used' });
      if (mixOk) C.chart(body, 'mix', body.querySelector('.pmu-ctxmix'), { segments: m.segments.map(function (s) { return { name: s.name, value: s.tokens, idx: s.idx }; }), total: m.used, legend: false }, { label: 'Context composition' });
    }
  });
})();
