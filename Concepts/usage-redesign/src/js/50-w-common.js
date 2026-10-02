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
  C.headTools = function (ctx, html, minTier) {
    if (!html) { if (ctx.head) ctx.head.innerHTML = ''; return ''; }
    if (ctx.head && C.w(ctx, minTier || 'l')) {
      ctx.head.innerHTML = html;
      var card = ctx.head.closest('.pmu-card'), title = card && card.querySelector('.pmu-cardtitle'), key = card && card.querySelector('.pmu-cardkey:not([hidden])');
      var avail = (card ? card.clientWidth : ctx.tier.bw + 28) - 28;
      var need = (title ? title.scrollWidth : 0) + ctx.head.scrollWidth + TOOLS_RESERVE + 10 + (key ? key.offsetWidth + 10 : 0);
      if (need <= avail) return '';
    }
    if (ctx.head) ctx.head.innerHTML = '';
    return '<div class="pmu-bodytools">' + html + '</div>';
  };

  /* ------------------------------------------------------------------ formatting */
  C.b = function (v) { return '<b>' + esc(v) + '</b>'; };
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
  /* short: narrow cards drop "at a taller size" so the line stays one line */
  C.more = function (n, what, short) { var w = what ? (n === 1 ? String(what).replace(/s$/, '') : what) : (n === 1 ? 'row' : 'rows'); return n > 0 ? '<div class="pmu-more">' + esc(n + ' more ' + w + (short ? '' : ' at a taller size')) + '</div>' : ''; };
  /* wrap-aware heights for stacked blocks (values wrap instead of ellipsizing): a fact whose label and value do not fit
     the width on one line takes two (46 px); a free text line takes as many 18 px lines as its measured width needs */
  C.textLines = function (text, bw, px) {
    var w = PMU.charts && PMU.charts.textW ? PMU.charts.textW(String(text || ''), px || 12.5) * 1.06 : String(text || '').length * 7;
    return Math.max(1, Math.ceil(w / Math.max(60, bw)));
  };
  C.factH = function (f, bw) { return C.textLines(String(f[0]) + '    ' + String(f[1]), bw - 16, 12.5) > 1 ? 46 : 27; };
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
    return rows.length ? '<div class="pmu-facts' + (opts.cols === 2 ? ' is-2col' : '') + '">' + rows.map(function (f) {
      var o = f[2] || {}, val = o.vs ? C.vs(o.vs, o.word || f[1]) : o.html ? f[1] : esc(f[1]);
      return '<div class="pmu-fact"' + (o.hover ? C.hover(f[0], o.hover) : '') + (o.tone ? ' data-tone="' + o.tone + '"' : '') + '>' + (o.glyph ? C.glyph(o.glyph) : '') +
        '<span class="pmu-factl">' + esc(f[0]) + '</span><b class="pmu-factv">' + val + '</b></div>';
    }).join('') + '</div>' : '';
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
    var fn = PMU.charts && PMU.charts[name];
    if (typeof fn !== 'function') return null;
    try {
      var c = fn(host, spec, Object.assign({ enter: false }, opts || {}));
      if (c) bag(body).charts.push(c);
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
    Array.prototype.slice.call(body.querySelectorAll('.pmu-num[data-k]')).forEach(function (el) {
      var k = el.getAttribute('data-k'), to = parseFloat(el.getAttribute('data-v')), f = el.getAttribute('data-f');
      if (!(k in old) || !isFinite(to) || old[k] === to) return;
      PMU.motion.countUp(el, old[k], to, function (v) { return C.numOnly(v, v === to || f !== 'money' ? f : 'money2'); }, { dur: 'value' });
      var host = el.closest('.pmu-kpivalue, .pmu-val, .pmu-bigval') || el;
      if (PMU.motion.pulse) PMU.motion.pulse(host);
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
  function fitLater(body) {
    if (fitQueue.indexOf(body) < 0) fitQueue.push(body);
    if (fitAgain.indexOf(body) < 0) fitAgain.push(body);
    if (!fitScheduled) { fitScheduled = true; (window.queueMicrotask || function (f) { Promise.resolve().then(f); })(function () { fitScheduled = false; fitFlush(); }); }
    /* once more in the next frame: meters and charts finish their own layout after the render, and wrapped text can then
       push a foot past the body (a one-off frame, never a loop) */
    if (!fitAgainScheduled) { fitAgainScheduled = true; requestAnimationFrame(function () { fitAgainScheduled = false; var list = fitAgain.splice(0); list.forEach(function (b) { b._pmuFitDone = false; }); fitFlush(list); }); }
  }
  function fitFlush(list) {
    var items = list || fitQueue.splice(0);
    for (var pass = 0; pass < 12 && items.length; pass++) {
      var over = items.filter(function (b) { return b.isConnected && b.clientHeight > 0 && b.scrollHeight > b.clientHeight + 2; });
      over.forEach(function (b) {
        var cands = Array.prototype.slice.call(b.querySelectorAll(FIT_SEL)).filter(function (el) { return !el.closest('.pmu-chart') && !el.closest('.pmu-headtools'); });
        /* rows and facts go before a card's foot (the foot names the source and freshness of what the card shows) */
        var rows = cands.filter(function (el) { return !/pmu-(cfoot|kpifoot)/.test(String(el.className)); });
        var last = rows.length ? rows[rows.length - 1] : cands[cands.length - 1];
        if (!last) { b._pmuFitDone = true; return; }
        var parent = last.parentNode;
        last.remove();
        if (parent && parent.classList && (parent.classList.contains('pmu-agday') || parent.classList.contains('pmu-facts')) && !parent.querySelector(FIT_SEL)) parent.remove();
        var isRow = !/pmu-(cfoot|note|factrow|efflegend|effspark|kpitrend|kpifoot|agbeyond|setupnote|effcost|swfam)/.test(String(last.className)) && last.tagName !== 'EM';
        if (!isRow) return;
        b._pmuHidden = (b._pmuHidden || 0) + 1;
        /* a kind's own "N more ..." line absorbs the rows this pass hides (one line, one count), else one auto line */
        var own = Array.prototype.filter.call(b.querySelectorAll('.pmu-more:not([data-auto])'), function (e) { return /^\d+ /.test(e.textContent); }).pop();
        if (own) {
          if (!own.hasAttribute('data-base')) own.setAttribute('data-base', String(parseInt(own.textContent, 10)));
          own.textContent = own.textContent.replace(/^\d+/, String(+own.getAttribute('data-base') + b._pmuHidden))
            .replace(/^(\d+ more )(\w+)/, function (m0, a, w) { return a + (/s$/.test(w) ? w : /y$/.test(w) ? w.replace(/y$/, 'ies') : w + 's'); });
          return;
        }
        var more = b.querySelector('.pmu-more[data-auto]');
        if (!more) {
          more = document.createElement('div'); more.className = 'pmu-more'; more.setAttribute('data-auto', '');
          var foot = b.querySelector(':scope > .pmu-cardfoot'); if (foot) b.insertBefore(more, foot); else b.appendChild(more);
        }
        more.textContent = b._pmuHidden + (atMax(b) ? ' more in Details' : ' more at a taller size');
      });
      items = over.filter(function (b) { return !b._pmuFitDone; });
    }
  }
  C.fitLater = fitLater;
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
  C.kind = function (name, impl) {
    PMU.widgets.kind(name, {
      render: function (body, ctx) { ctx = inner(ctx); C.destroy(body); body._pmuHidden = 0; body._pmuFitDone = false; impl.render(body, ctx); fitLater(body); },
      update: function (body, ctx) {
        ctx = inner(ctx);
        if (impl.update && impl.update(body, ctx) !== false) return;
        var old = snapshot(body), sigs = flashSigs(body); C.destroy(body); body._pmuHidden = 0; body._pmuFitDone = false; impl.render(body, ctx); fitLater(body); C.countFrom(body, old);
        /* a row whose reading changed flashes once (A1 3.3, 8.2); nothing flashes on the first render */
        Array.prototype.slice.call(body.querySelectorAll('[data-flash-key]')).forEach(function (el) {
          var k = el.getAttribute('data-flash-key'); if (k in sigs && sigs[k] !== el.getAttribute('data-flash-sig') && PMU.motion.flash) PMU.motion.flash(el);
        });
      },
      resize: function (body, ctx) {
        ctx = inner(ctx);
        var old = snapshot(body); C.destroy(body); body._pmuHidden = 0; body._pmuFitDone = false; impl.render(body, ctx); fitLater(body);
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
      var delta = '';
      if (m.delta && !m.vs) {
        var d = PMU.fmt.delta(m.delta.v, { goodWhen: m.delta.goodWhen || 'up' });
        delta = '<span class="pmu-delta" data-dir="' + d.dir + '" data-tone="' + (m.delta.tone || d.tone) + '">' + (d.dir === 'up' ? C.glyph('arrowUp') : d.dir === 'down' ? C.glyph('arrowDown') : '') + esc(m.delta.text || d.text) + '</span>';
      }
      var sparkOk = m.spark && m.spark.values && ctx.tier.bw >= 230;
      var head = '<div class="pmu-kpiline"' + (m.tone ? ' data-tone="' + m.tone + '"' : '') + '>' + valueHtml + delta + (sparkOk && h === 'h1' ? '<span class="pmu-kpispark" data-spark="inline"></span>' : '') + '</div>';
      if (h === 'h0') { body.innerHTML = '<div class="pmu-kpi is-h0"' + C.hover(m.subText || '', '') + '>' + head + '</div>'; return; }
      var sub = m.sub ? '<div class="pmu-kpisub">' + m.sub + '</div>' : '';
      var reserve = 38 + (m.sub ? 20 : 0) + (m.foot ? 30 : 0);
      var trend = sparkOk && C.h(ctx, 'h3') ? 48 : 0;
      /* two fact columns only where each keeps ~180 px (label and value both readable), else one */
      var cols = ctx.tier.bw >= 380 ? 2 : 1;
      if (wide) cols = 1;
      var rows = h === 'h1' ? 0 : C.fit(ctx.tier.bh - trend - (wide ? 0 : reserve), 27);
      var facts = m.facts || [];
      var maxFacts = Math.min(facts.length, rows * cols);
      var factsHtml = maxFacts ? C.facts(facts, maxFacts, { cols: cols }) : '';
      var foot = m.foot && C.h(ctx, 'h2') ? '<div class="pmu-kpifoot' + (m.foot.indexOf('<button') >= 0 ? ' has-act' : '') + '">' + m.foot + '</div>' : '';
      if (wide) {
        body.innerHTML = '<div class="pmu-kpi is-wide"><div class="pmu-kpimain">' + head + sub + (trend ? '<div class="pmu-kpitrend"></div>' : '') + foot + '</div>' +
          '<div class="pmu-kpiside">' + C.facts(facts, Math.min(facts.length, C.fit(ctx.tier.bh, 27))) + '</div></div>';
      } else {
        body.innerHTML = '<div class="pmu-kpi">' + head + sub + factsHtml + (trend ? '<div class="pmu-kpitrend"></div>' : '') + foot + '</div>';
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
          C.valHtml(c.value, c.fmt, 'pmu-kpivalue', ctx.id + ':' + i).replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') +
          (onlyValues ? '' : '<span class="pmu-kpisub">' + ((short && c.subShort) || c.sub || '') + '</span>') + '</div>';
      }).join('') + '</div>';
    }
  });

  /* ================================================================== list: fact and event rows */
  /* model: {rows: [{name, sub?, value?, valueHtml?, tone?, glyph?, mark?, lead?, note?, noteTone?, vs?, word?, key?, onClick?, hover?}], foot?, empty?, emptyFacts?} */
  C.kind('list', {
    render: function (body, ctx) {
      var m = ctx.model || { rows: [] }, rows = m.rows || [];
      if (!rows.length) { body.innerHTML = C.empty(m.empty || 'No results for current filter', m.emptyFacts); return; }
      var hasSub = rows.some(function (r) { return r.sub; });
      var two = hasSub && (C.w(ctx, 'm') || (C.w(ctx, 's') && rows.length * 44 + (m.foot ? 34 : 0) <= ctx.tier.bh)), extra = C.w(ctx, 'l') && rows.some(function (r) { return r.note; });
      var rowH = two ? 44 : 32, footH = m.foot ? 34 : 0, dayH = 30;
      /* fit whole rows (day heads count too, and a day head never ends the list) */
      var budget = ctx.tier.bh - footH - 2, used = 0, shown = [];
      for (var k = 0; k < rows.length; k++) {
        var hh = rows[k].day ? dayH : rowH;
        var reserveMore = k < rows.length - 1 ? 22 : 0;
        if (used + hh + reserveMore > budget && !(k === rows.length - 1 && used + hh <= budget)) break;
        if (rows[k].day && (k === rows.length - 1 || used + dayH + rowH > budget)) break;
        used += hh; shown.push(rows[k]);
      }
      var hidden = rows.filter(function (r) { return !r.day; }).length - shown.filter(function (r) { return !r.day; }).length;
      body.innerHTML = '<div class="pmu-list' + (two ? ' is-two' : '') + (extra ? ' has-note' : '') + '">' + shown.map(function (r, i) {
        if (r.day) return '<div class="pmu-lday" data-reveal><b>' + esc(r.day) + '</b><span>' + esc(r.note || '') + '</span></div>';
        var lead = r.mark ? PMU.mark(r.mark, 18) : r.lead ? r.lead : r.glyph ? C.glyph(r.glyph, 'pmu-lglyph') : '';
        var val = r.vs ? C.vs(r.vs, r.word) : r.valueHtml != null ? r.valueHtml : r.value != null ? esc(r.value) : '';
        var hov = r.hover ? C.hover(r.name, r.hover) : !two && r.sub ? C.hover(r.name, r.sub + (r.note ? ' · ' + r.note : '')) : !extra && r.note ? C.hover(r.name, r.note) : '';
        return '<div class="pmu-lrow' + (r.onClick ? ' is-click' : '') + (lead ? '' : ' no-lead') + '" data-reveal' + (r.tone ? ' data-tone="' + r.tone + '"' : '') + (r.prov ? ' data-prov="' + esc(r.prov) + '"' : '') +
          (r.onClick ? ' data-pmu-row="' + i + '" role="button" tabindex="0"' : '') + hov + '>' +
          (lead ? '<span class="pmu-llead">' + lead + '</span>' : '') +
          '<span class="pmu-lname"><b>' + esc(r.name) + '</b>' + (two && r.sub ? '<span>' + esc(r.sub) + '</span>' : '') + '</span>' +
          (extra ? '<span class="pmu-lnote"' + (r.noteTone ? ' data-tone="' + r.noteTone + '"' : '') + '>' + esc(r.note || '') + '</span>' : '') +
          '<span class="pmu-lval">' + val + '</span></div>';
      }).join('') + C.more(hidden) + '</div>' + (m.foot ? C.foot(m.foot, m.footGlyph) : '');
      if (shown.some(function (r) { return r.onClick; })) {
        body.querySelector('.pmu-list').addEventListener('click', function (event) {
          var row = event.target.closest('[data-pmu-row]'); if (!row) return;
          var r = shown[+row.getAttribute('data-pmu-row')]; if (r && r.onClick) r.onClick(row);
        });
      }
    }
  });

  /* ================================================================== table: data tables (ledger and others) */
  /* model: {cols: [{key, label, align?, min?: tier, w?: css, fmt?}], rows: [{cells: {key: text|{html}}, tone?, onClick?, id?}],
             toolbar?: {search?: placeholder, filters?: [{key, label, options: [{value, label}], value}], export?: fn}, empty?, foot?} */
  C.kind('table', {
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
      var tb = m.toolbar ? 34 : 0, pager = 30, headH = 28, rowH = 32;
      var size = Math.max(1, C.fit(ctx.tier.bh, rowH, tb + headH + pager + (m.foot ? 30 : 0)));
      var pages = Math.max(1, Math.ceil(rows.length / size)); page = Math.min(page, pages - 1);
      var shown = rows.slice(page * size, page * size + size);
      var tmpl = cols.map(function (c) { return c.w || 'minmax(0,1fr)'; }).join(' ');
      var toolbar = '';
      if (m.toolbar) {
        toolbar = '<div class="pmu-ttools">' + (m.toolbar.search != null ? '<label class="pmu-tsearch">' + C.glyph('search') + '<input type="text" data-pmu-tsearch value="' + esc(C.view(id, 'q', '')) + '" placeholder="' + esc(m.toolbar.search || 'Search') + '" aria-label="' + esc(m.toolbar.search || 'Search') + '"></label>' : '') +
          filters.filter(function () { return C.w(ctx, 'm'); }).map(function (f) {
            var v = C.view(id, 'f-' + f.key, 'all'), o = f.options.filter(function (x) { return x.value === v; })[0];
            return '<button type="button" class="pmu-tfilter" data-pmu-act="tfilter" data-key="' + esc(f.key) + '" aria-haspopup="menu">' + esc(f.label) + ' <b>' + esc(o ? o.label : 'All') + '</b>' + C.glyph('chevronDown') + '</button>';
          }).join('') + '<span class="pmu-tcount">' + (rows.length ? esc((page * size + 1) + '-' + (page * size + shown.length) + ' of ' + rows.length) : '0 of 0') + '</span>' +
          (m.toolbar.export ? '<button type="button" class="pmu-iconbtn pmu-texport" data-pmu-act="texport" aria-label="Export" data-pm-hover-label="Export these records">' + SVG['export'] + '</button>' : '') + '</div>';
      }
      var head = '<div class="pmu-trow pmu-thead" style="grid-template-columns:' + tmpl + '">' + cols.map(function (c) { return '<span class="pmu-cap"' + (c.align === 'right' ? ' data-align="r"' : '') + '>' + esc(c.label) + '</span>'; }).join('') + '</div>';
      var bodyRows = shown.length ? shown.map(function (r, i) {
        return '<div class="pmu-trow' + (r.onClick ? ' is-click' : '') + '" data-reveal style="grid-template-columns:' + tmpl + '"' + (r.tone ? ' data-tone="' + r.tone + '"' : '') +
          (r.onClick ? ' data-pmu-row="' + i + '" role="button" tabindex="0"' : '') + (r.hover ? C.hover(r.hover[0], r.hover[1]) : '') + '>' + cols.map(function (c) {
            var v = r.cells[c.key], html = v && typeof v === 'object' ? v.html : esc(v == null ? '' : v);
            return '<span class="pmu-tcell"' + (c.align === 'right' ? ' data-align="r"' : '') + (c.mono ? ' data-mono' : '') + '>' + html + '</span>';
          }).join('') + '</div>';
      }).join('') : C.empty(m.empty || 'No results for current filter', m.emptyFacts);
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
      var rowsOk = C.w(ctx, 'm') && C.h(ctx, 'h2');
      var head = m.headline ? '<div class="pmu-mixhead">' + C.valHtml(m.headline.value, m.headline.fmt, 'pmu-bigval', ctx.id + ':h').replace('class="pmu-num"', 'class="pmu-num" data-count="1"') + '<span>' + esc(m.headline.label || '') + '</span></div>' : '';
      var fit = rowsOk ? C.fit(ctx.tier.bh, 30, (head ? 42 : 0) + 24 + (m.facts ? 0 : 0)) : 0;
      body.innerHTML = '<div class="pmu-mix">' + head + '<div class="pmu-mixhost"></div>' + (rowsOk ? '<div class="pmu-mixrows">' + segs.slice(0, fit).map(function (s) {
        return '<div class="pmu-mixrow" data-reveal' + (s.prov ? ' data-prov="' + esc(s.prov) + '"' : '') + '><i class="pmu-swatch" data-sw="' + (s.est ? 'hatch' : 'box') + '"' + C.keyAttrs(s) + '></i><span class="pmu-mixname">' + esc(s.name) +
          (s.sub && C.w(ctx, 'l') ? '<em>' + esc(s.sub) + '</em>' : '') + '</span><b>' + esc(s.valueText || C.fmt(s.value, m.fmt)) + '</b><span class="pmu-mixpct">' + esc(C.fmt(100 * s.value / total, 'pct')) + '</span></div>';
      }).join('') + C.more(segs.length - Math.min(fit, segs.length)) + '</div>' : '') + '</div>' + (m.foot && C.h(ctx, 'h2') ? C.foot(m.foot) : '');
      /* a short mix keeps an inline swatch legend with the counts (the segment names never live only in hover tags) */
      C.chart(body, 'mix', body.querySelector('.pmu-mixhost'), { segments: segs.map(function (s) { return { name: s.name, value: s.value, idx: s.idx, tk: s.tk, vendor: s.vendor, est: !!s.est, valueText: s.valueText }; }), total: total, legend: rowsOk ? false : C.h(ctx, 'h2') ? 'rows' : ctx.tier.bw >= 150 },
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
      body.innerHTML = '<div class="pmu-rankedhost' + (inline ? ' is-inline' : '') + '"></div>' + C.more(rows.length - shown.length) + (footOk ? C.foot(m.foot) : '');
      var host = body.querySelector('.pmu-rankedhost');
      
      var c = C.chart(body, 'ranked', host, { rows: inline || !C.w(ctx, 'l') ? shown.map(function (r) { return Object.assign({}, r, inline && r.valueShort ? { valueText: r.valueShort } : {}, r.short ? { name: r.short, hover: r.hover || r.name } : {}); }) : shown, scale: m.scale, inline: inline }, { label: ctx.def.title, tier: ctx.tier });
      if (!c) host.innerHTML = shown.map(function (r) { return '<div class="pmu-lrow"><span class="pmu-lname"><b>' + esc(r.name) + '</b></span><span class="pmu-lval">' + esc(r.valueText) + '</span></div>'; }).join('');
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
      var factsRoom = C.w(ctx, 'l');
      var bh = ctx.tier.bh;
      var oneCol = side || ctx.tier.bw < 300, per = oneCol ? 1 : 2, needRows = Math.ceil(n / per);
      /* measured: ring + 10 px gap, composition bar 8 px + 10 px gap, legend rows 24 px (26 in NieR), "N more" line 24 px.
         A stacked card keeps the 84 px ring and the bar only when every family still fits; otherwise the bar goes (the ring
         shows the same split) and the ring shrinks to 68 px, so families come first */
      var ringPx, mixOk, avail;
      if (side) { mixOk = true; ringPx = C.w(ctx, 'm') ? 96 : 68; avail = bh - 18; }
      else if (bh - 84 - 10 - 18 >= needRows * LEG) { mixOk = true; ringPx = 84; avail = bh - 84 - 10 - 18; }
      else { mixOk = false; ringPx = 68; avail = bh - 68 - 10; }
      var legFit = C.fit(avail, LEG);
      var factFit = factsRoom ? C.fit(bh, 26) : 0;
      /* two legend columns only where a family name and its count both fit (about 145 px a column); every family shows or
         the hidden ones are counted on one line (complete or hidden) */
      var legCap = legFit * per;
      if (legCap < n) legCap = Math.max(per, C.fit(avail - MORE, LEG) * per);
      body.innerHTML = '<div class="pmu-ctx' + (side ? ' is-side' : '') + (factsRoom ? ' has-facts' : '') + (ctx.tier.bw < 300 ? ' is-narrow' : '') + '">' +
        '<div class="pmu-ctxring" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' +
        '<div class="pmu-ctxmain">' + (mixOk ? '<div class="pmu-ctxmix"></div>' : '') + '<div class="pmu-ctxlegs' + (oneCol ? '' : ' is-2col') + '">' + legendRows.slice(0, legCap).join('') + '</div>' + (legCap < legendRows.length ? C.more(legendRows.length - legCap, legendRows.length - legCap === 1 ? 'family' : 'families', ctx.tier.bw < 260) : '') + '</div>' +
        (factsRoom ? '<div class="pmu-ctxfacts">' + C.facts(m.facts, factFit) + '</div>' : '') + '</div>';
      C.chart(body, 'ring', body.querySelector('.pmu-ctxring'), { segments: m.segments.map(function (s) { return { name: s.name, value: s.tokens, idx: s.idx }; }).concat([{ name: 'Reserved output', value: m.reserved, idx: 7, hatched: true }]),
        limit: m.limit, value: m.used, max: m.limit, centre: m.pct + '%', caption: PMU.fmt.tok(m.used) + ' / ' + PMU.fmt.tok(m.limit), token: 'in' }, { label: 'Context window ' + m.pct + '% used' });
      if (mixOk) C.chart(body, 'mix', body.querySelector('.pmu-ctxmix'), { segments: m.segments.map(function (s) { return { name: s.name, value: s.tokens, idx: s.idx }; }), total: m.used, legend: false }, { label: 'Context composition' });
    }
  });
})();
