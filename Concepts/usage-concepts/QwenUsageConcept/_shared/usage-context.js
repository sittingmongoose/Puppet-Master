(function () {
  'use strict';
  var D = window.USAGE, R = window.USrender, demo = window.USdemo, fmt = window.USfmt;
  var ringBtn, detBtn, ringSprout, detSprout;
  var ROLE_COLORS = ['var(--accent-blue)', 'var(--accent-magenta)', 'var(--accent-orange)', 'var(--accent-lime)', 'var(--accent-purple, var(--accent-magenta))', 'var(--text-muted)'];
  var MSG_COLORS = { assistant: 'var(--accent-blue)', error: 'var(--accent-orange)' };

  function prov(o) { return o ? { source: o.source_class, conf: o.source_confidence, fresh: o.projection_freshness } : null; }
  function pchip(o) { return R.projChip(prov(o)); }
  function ico(n) { return window.PMIcon ? window.PMIcon(n, 'pm-ico sm') : ''; }
  function escA(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  /* The context-ring cache-hit rate is a CONTEXT metric (share of in-context
     tokens served from cache). Label it as such so it is never read as the
     per-provider prompt-cache hit/save figure (that one lives in D.cache). */
  function ctxCacheLabel(cb) {
    var l = cb && cb.cacheHitLabel;
    return l ? (l.charAt(0).toUpperCase() + l.slice(1)) : 'Context cache hit rate';
  }

  function ringSvg() {
    var pct = (D && D.ring && D.ring.pct) || 0;
    return '<svg viewBox="0 0 24 24" style="transform:rotate(-90deg)" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" fill="none" stroke="var(--border-light)" stroke-width="4"></circle>' +
      '<circle cx="12" cy="12" r="10" fill="none" stroke="var(--accent-blue)" stroke-width="4" stroke-dasharray="62.8" stroke-dashoffset="' + (62.8 * (1 - pct / 100)) + '"></circle></svg>';
  }
  function listSvg() {
    return '<svg class="sb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01"/></svg>';
  }

  function pickRemain() {
    var accs = (D && D.accounts) || [], eff = null, i;
    for (i = 0; i < accs.length; i++) { if (accs[i].effective) { eff = accs[i]; break; } }
    if (!eff) { for (i = 0; i < accs.length; i++) { if (accs[i].requested) { eff = accs[i]; break; } } }
    var provName = eff ? (eff.prov || '').split(' ')[0] : null;
    var quotas = (D && D.quotas) || [], cand = [];
    for (i = 0; i < quotas.length; i++) { if (provName && (quotas[i].name || '').split(' ')[0] === provName) cand.push(quotas[i]); }
    if (!cand.length) cand = quotas.slice(0, 1);
    var chosen = cand[0] || null, c, wi;
    for (c = 0; c < cand.length; c++) {
      var ws = cand[c].windows || [];
      for (wi = 0; wi < ws.length; wi++) { if (ws[wi].cooldown && ws[wi].cooldown.active) { chosen = cand[c]; c = cand.length; break; } }
    }
    function win(id) { var w = (chosen && chosen.windows) || []; for (var x = 0; x < w.length; x++) { if (w[x].id === id) return w[x]; } return null; }
    return {
      provider: chosen ? chosen.name : null, plan: chosen ? chosen.plan : null,
      account: eff ? eff.name : null,
      five: win('5h'), weekly: win('7d') || win('month')
    };
  }
  function unknownWin() { return { used: null, reset: 'unknown', value_state: 'unknown', source_class: 'unknown', source_confidence: 'unknown', projection_freshness: 'current' }; }
  function resetSub(w) {
    if (w.cooldown && w.cooldown.active) return '<span class="cp-rst cd">cooling down' + (w.cooldown.until ? ' \u00b7 back ' + w.cooldown.until : '') + '</span>';
    if (w.used == null) return '<span class="cp-rst unk">' + R.chip(w.value_state || 'unknown') + '</span>';
    var r = (w.reset && w.reset !== 'unknown') ? ('resets in ' + w.reset + (w.resetsAt ? ' \u00b7 ' + w.resetsAt : '')) : 'reset unknown';
    return '<span class="cp-rst">' + r + '</span>';
  }
  function remainRow(label, w) {
    w = w || unknownWin();
    var used = w.used, remaining = used == null ? null : Math.max(0, 100 - used);
    var tone = used == null ? 'mute' : R.fillTone(used);
    var pc = remaining == null ? '<span class="pc">\u2014</span>' : '<span class="pc">' + remaining + '% left</span>';
    var title = (w.label ? w.label + ' \u00b7 ' : '') + (used == null ? 'unknown' : used + '% used');
    return '<div class="cp-rrow">' +
      '<span class="us-meter" title="' + title + '"><span class="lb">' + label + '</span>' + R.meter(remaining, tone) + pc + '</span>' +
      '<span class="cp-rsub">' + resetSub(w) + pchip(w) + '</span>' +
      '</div>';
  }
  function usageRemainingHTML() {
    var pr = pickRemain();
    var src = pr.provider ? (pr.provider + (pr.plan ? ' \u00b7 ' + pr.plan : '')) : 'no provider';
    return '<div class="cp-remain">' +
      '<div class="cp-remain-head"><span class="cp-title">Usage remaining</span><span class="cp-src">' + src + '</span></div>' +
      remainRow('5 hours', pr.five) +
      remainRow('Weekly', pr.weekly) +
      '</div>';
  }

  function ringPopHTML() {
    if (!D || !D.ring) return '';
    var r = D.ring, cb = D.contextByRole || { roles: [], cacheHitRate: null };
    var roles = (cb.roles || []).map(function (rl, i) {
      return '<div class="cp-row" style="--i:' + i + '"><span class="cp-dot" style="background:' + (ROLE_COLORS[i] || ROLE_COLORS[5]) + '"></span>' +
        '<span class="cp-lab">' + rl.name + '</span><span class="cp-val">' + rl.pct + '%</span></div>';
    }).join('');
    return '<div class="pm-ctx-pop">' +
      '<div class="cp-top"><span class="cp-title">Context windows</span><span class="cp-frac">' + fmt.num(r.used) + ' / ' + fmt.num(r.limit) + ' (' + r.pct + '%)</span></div>' +
      '<div class="cp-bar"><i data-fill="' + r.pct + '" style="width:0%"></i></div>' + roles +
      '<div class="cp-div"></div>' +
      usageRemainingHTML() +
      '<div class="cp-div"></div>' +
      '<div class="cp-cache" title="' + escA(cb.cacheHitNote || '') + '"><span class="k">' + ctxCacheLabel(cb) + '</span><span class="v">' + (cb.cacheHitRate == null ? '\u2014' : cb.cacheHitRate + '%') + pchip(cb) + '</span></div>' +
      (cb.cacheHitNote ? '<div class="cp-cnote" style="font-size:var(--fs-2xs);color:var(--text-muted);line-height:1.35;padding:1px 0 2px">' + cb.cacheHitNote + '</div>' : '') +
      '<div class="cp-acts"><button type="button" class="cp-compact" data-ctx-act="compact">Compact now</button>' +
      '<button type="button" class="cp-more" data-ctx-act="more">More details</button></div></div>';
  }

  function kv(k, v) { return '<div class="us-kv"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
  function row(k, chipHtml, v) { return '<div class="us-list"><span class="r"><span class="k">' + k + '</span><span class="chip">' + (chipHtml || '') + '</span><span class="v">' + v + '</span></span></div>'; }

  function overviewHTML() {
    var s0 = D.sessions && D.sessions[0] || {}, r = D.ring || {}, cb = D.contextByRole || {};
    var identity = kv('Thread', s0.title || '\u2014') + kv('Messages', s0.messages || 0) + kv('Provider', s0.provider || '\u2014') +
      kv('Model', s0.model || '\u2014') + kv('Mode', s0.mode || '\u2014') + kv('Subagents', s0.subagents == null ? '\u2014' : s0.subagents);
    var headline = row('Context tokens', pchip(r), fmt.tok(r.used) + ' / ' + fmt.tok(r.limit)) +
      row('Context used', pchip(cb), (cb.pct == null ? '\u2014' : cb.pct + '%')) +
      row(ctxCacheLabel(cb), pchip(cb), cb.cacheHitRate == null ? '\u2014' : cb.cacheHitRate + '%') +
      row('This thread cost', pchip(r), fmt.cost((r.threadCostMicro || 0) / 1e6));
    return '<div class="pm-md-card"><h4>Overview</h4>' +
      '<div class="pm-md-ov">' + identity + '</div>' +
      '<div class="pm-md-sub">Headline</div>' + headline +
      '</div>';
  }

  function breakdownHTML() {
    var cb = D.contextByRole || { roles: [], used: 0 }, used = cb.used || (D.ring && D.ring.used) || 0;
    var bar = (cb.roles || []).map(function (rl, i) { return '<i style="width:' + rl.pct + '%;background:' + (ROLE_COLORS[i] || ROLE_COLORS[5]) + '"></i>'; }).join('');
    var legend = (cb.roles || []).map(function (rl, i) {
      var tok = used ? Math.round(used * rl.pct / 100) : null;
      return row('<span class="cp-dot" style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + (ROLE_COLORS[i] || ROLE_COLORS[5]) + ';margin-right:6px;vertical-align:middle"></span>' + rl.name,
        pchip(cb), rl.pct + '% \u00b7 ' + fmt.tok(tok));
    }).join('');
    var s0 = D.sessions && D.sessions[0] || {}, tk = s0.tokens || {};
    var buckets = row('Input', pchip(s0), fmt.tok(tk.input)) + row('Output', '', fmt.tok(tk.output)) +
      row('Cache read', '', fmt.tok(tk.cacheRead)) + row('Cache write', '', fmt.tok(tk.cacheWrite)) +
      row('Reasoning', '', fmt.tok(tk.reasoning)) +
      row('Provider total (' + ((s0.counting_semantics && s0.counting_semantics.provider_style) || 'unknown') + ')', pchip(s0), fmt.tok(s0.provider_total));
    var models = (D.byModel || []).map(function (m) {
      return row(m.model + ' \u00b7 ' + m.provider, (m.vs ? R.chip(m.vs) : '') + pchip(m), fmt.tok((m.input || 0) + (m.output || 0)) + ' \u00b7 ' + fmt.cost((m.costMicro || 0) / 1e6));
    }).join('');
    return '<div class="pm-md-card"><h4>Breakdown</h4>' +
      '<div class="pm-md-bar">' + bar + '</div>' +
      '<button type="button" class="pm-md-toggle" data-md-act="legend" aria-expanded="true">Hide by role</button>' +
      '<div class="pm-md-legend" data-md-role="legend">' + legend + '</div>' +
      '<div class="pm-md-sub">Token buckets</div>' + buckets +
      '<button type="button" class="pm-md-toggle" data-md-act="bymodel" aria-expanded="false">Show by model / provider</button>' +
      '<div class="pm-md-bymodel" data-md-role="bymodel" style="display:none">' + models + '</div>' +
      '</div>';
  }

  function messageRows() {
    var msgs = (D.ledger || []).filter(function (r) { return r.ev === 'completion' || r.ev === 'error'; });
    return msgs.map(function (r) {
      var role = r.ev === 'error' ? 'error' : 'assistant';
      var tot = r.provider_total != null ? r.provider_total : ((r.tin || 0) + (r.tout || 0));
      var det = kv('Provider', r.prov || '\u2014') + kv('Model', r.model || '\u2014') +
        kv('Input', fmt.tok(r.tin)) + kv('Output', fmt.tok(r.tout)) +
        kv('Cache read', fmt.tok(r.cr)) + kv('Cache write', fmt.tok(r.cw)) +
        kv('Latency', r.lat || '\u2014') + kv('Cost', fmt.cost((r.cost_microdollars != null ? r.cost_microdollars : (r.cost || 0) * 1e6) / 1e6)) +
        kv('Event ref', r.ref || '\u2014') + pchip(r);
      Object.keys(r.detail || {}).forEach(function (k) { det += kv(R.humanCap(k), r.detail[k]); });
      return '<div class="pm-md-msg">' +
        '<button type="button" class="pm-md-msg-head" data-md-act="msg" aria-expanded="false">' +
          '<span class="cp-dot" style="background:' + (MSG_COLORS[role] || ROLE_COLORS[5]) + '"></span>' +
          '<span class="mm-role">' + R.humanCap(role) + '</span>' +
          '<span class="mm-model">' + (r.model || '\u2014') + '</span>' +
          '<span class="mm-tok">' + fmt.tok(tot) + ' tok</span>' +
          '<span class="mm-cost">' + fmt.cost((r.cost_microdollars != null ? r.cost_microdollars : (r.cost || 0) * 1e6) / 1e6) + '</span>' +
          '<span class="mm-chev">' + ico('chevD') + '</span>' +
        '</button>' +
        '<button type="button" class="mm-deep" data-md-act="deep" data-ref="' + (r.ref || '') + '" title="Focus in Context Detail" aria-label="Focus this message in Context Detail">' + ico('external') + '</button>' +
        '<div class="pm-md-msgdet" style="display:none">' + det + '</div>' +
        '</div>';
    }).join('');
  }
  function messagesHTML() {
    var msgs = (D.ledger || []).filter(function (r) { return r.ev === 'completion' || r.ev === 'error'; });
    return '<div class="pm-md-card"><h4>Messages</h4>' +
      '<button type="button" class="pm-md-toggle" data-md-act="msgs" aria-expanded="false">Show ' + msgs.length + ' messages</button>' +
      '<div class="pm-md-msgs" data-md-role="msgs" style="display:none">' + messageRows() + '</div>' +
      '</div>';
  }

  function rawHTML() {
    var s0 = D.sessions && D.sessions[0] || {}, cb = D.contextByRole || {};
    var omitted = (D.ledger || []).length;
    var payload = {
      thread_id: '[redacted]',
      account: '[redacted]',
      raw_payload_ref: 'redacted:blob-ref/' + (s0.id || 'thread'),
      provider_payload_hash: 'sha256:9f2c\u2026a41',
      redaction_status: 'redacted',
      permission_state: 'redacted',
      omitted_evidence_counts: { tool_parts: 3, provider_meta: 1, path_runtime: 1, messages: omitted },
      context: { used: cb.used != null ? cb.used : null, limit: cb.limit != null ? cb.limit : null },
      note: 'raw provider payloads, credentials, account ids and local paths are withheld \u2014 redacted, never zeroed'
    };
    return '<div class="pm-md-rawwrap">' +
      '<div class="pm-md-rawnote">' + R.chip('unavailable') + ' Raw is redacted. Payload content, credentials, account identities and local paths are withheld; only refs, hashes and omitted counts are shown.</div>' +
      '<pre class="pm-md-raw">' + JSON.stringify(payload, null, 2) + '</pre>' +
      '</div>';
  }

  function detailsHTML() {
    if (!D) return '';
    var s0 = D.sessions && D.sessions[0] || {};
    return '<div class="pm-md">' +
      '<div class="pm-md-head"><span class="md-t" id="pm-ctx-md-title">Context detail</span><span class="md-sub">' + (s0.title || '') + '</span>' +
        R.projChip(D.projectionMeta) +
        '<button type="button" class="md-x" data-md-act="close" title="Close" aria-label="Close">' + ico('x') + '</button></div>' +
      '<div class="pm-md-tabs" role="tablist">' +
        '<button type="button" class="pm-md-tab is-active" data-md-tab="curated" role="tab" aria-selected="true">Curated</button>' +
        '<button type="button" class="pm-md-tab" data-md-tab="raw" role="tab" aria-selected="false">Raw</button>' +
      '</div>' +
      '<div class="pm-md-pane is-active" data-md-pane="curated">' + overviewHTML() + breakdownHTML() + messagesHTML() + '</div>' +
      '<div class="pm-md-pane" data-md-pane="raw">' + rawHTML() + '</div>' +
      '</div>';
  }

  function dispatch(id, ctx) { var res = demo && demo.attempt(id, ctx); if (res && res.toast && window.toast) window.toast(res.toast); return res; }
  function handleCompact(res) {
    if (!window.toast) return;
    if (!res) { window.toast('Compact didn\u2019t report a status \u2014 treat as not started.'); return; }
    var st = res.status;
    if (!st) { if (res.toast) window.toast(res.toast); return; }
    if (st === 'failed' || st === 'unavailable' || st === 'blocked') {
      window.toast('Compact failed' + (res.reason ? ' \u2014 ' + demo.reason(res.reason) : '') + ' \u00b7 history unchanged');
    } else if (st === 'degraded' || st === 'retry_scheduled' || st === 'cancelled' || st === 'no_op' || st === 'already_running') {
      window.toast(res.toast || ('Compact: ' + R.human(st)));
    } else {
      window.toast(res.toast || 'Compacting thread context\u2026');
    }
  }

  function focusables(sprout) {
    return Array.prototype.slice.call(sprout.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (el) {
      return !el.disabled && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null;
    });
  }

  function ensure() {
    if (ringSprout) return;
    ringSprout = document.createElement('div'); ringSprout.className = 'pm-sprout pm-ctx-sprout'; ringSprout.id = 'pm-ctx-ring-pop';
    ringSprout.setAttribute('role', 'dialog'); ringSprout.setAttribute('aria-label', 'Context usage');
    ringSprout.innerHTML = ringPopHTML();
    detSprout = document.createElement('div'); detSprout.className = 'pm-sprout pm-ctx-sprout'; detSprout.id = 'pm-ctx-detail-pop'; detSprout.tabIndex = -1;
    detSprout.setAttribute('role', 'dialog'); detSprout.setAttribute('aria-modal', 'true'); detSprout.setAttribute('aria-labelledby', 'pm-ctx-md-title');
    detSprout.innerHTML = detailsHTML();
    document.body.appendChild(ringSprout); document.body.appendChild(detSprout);
    detSprout.addEventListener('animationend', function (e) {
      if (e.target.classList && e.target.classList.contains('pm-md-pane')) e.target.classList.remove('is-anim');
    });
    ringSprout.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('[data-ctx-act]'); if (!b) return;
      var act = b.getAttribute('data-ctx-act');
      if (act === 'compact') { handleCompact(demo && demo.attempt(demo.CMD.COMPACT)); }
      else if (act === 'more') { dispatch(demo.CMD.OPEN_CTX, { thread_id: (D.sessions && D.sessions[0] && D.sessions[0].id) || null }); closeAll(); openDetails(ringBtn); }
    });
    detSprout.addEventListener('click', function (e) {
      e.stopPropagation();
      var tab = e.target.closest('[data-md-tab]');
      if (tab) {
        var name = tab.getAttribute('data-md-tab');
        detSprout.querySelectorAll('[data-md-tab]').forEach(function (t) { var on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
        detSprout.querySelectorAll('[data-md-pane]').forEach(function (p) {
          var on = p.getAttribute('data-md-pane') === name;
          p.classList.toggle('is-active', on);
          if (on) { p.classList.remove('is-anim'); void p.offsetWidth; p.classList.add('is-anim'); }
        });
        return;
      }
      var b = e.target.closest('[data-md-act]'); if (!b) return;
      var act = b.getAttribute('data-md-act');
      if (act === 'close') { closeAll(); return; }
      if (act === 'deep') { dispatch(demo.CMD.OPEN_CTX, { ref: b.getAttribute('data-ref') || null }); return; }
      if (act === 'legend' || act === 'bymodel' || act === 'msgs') {
        var panel = detSprout.querySelector('[data-md-role="' + act + '"]'); if (!panel) return;
        var on = panel.style.display === 'none';
        panel.style.display = on ? '' : 'none';
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        var lbl = b.textContent.replace(/^(Show|Hide)\s+/, '');
        b.textContent = (on ? 'Hide ' : 'Show ') + lbl;
        if (on) R.animateFills(panel);
        return;
      }
      if (act === 'msg') {
        var msg = b.closest('.pm-md-msg'); var det = msg && msg.querySelector('.pm-md-msgdet'); if (!det) return;
        var open2 = det.style.display === 'none';
        det.style.display = open2 ? 'grid' : 'none';
        b.setAttribute('aria-expanded', open2 ? 'true' : 'false');
        msg.classList.toggle('is-open', open2);
      }
    });
    document.addEventListener('click', function (e) {
      if (!ringSprout.contains(e.target) && !detSprout.contains(e.target) && e.target !== ringBtn && !(ringBtn && ringBtn.contains(e.target)) && e.target !== detBtn && !(detBtn && detBtn.contains(e.target))) closeAll();
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !detSprout.classList.contains('is-open')) return;
      var f = focusables(detSprout);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (!detSprout.contains(a)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && (a === first || a === detSprout)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (a === last || a === detSprout)) { e.preventDefault(); first.focus(); }
    }, true);
  }

  function placeFallback(sprout, anchor) {
    var r = anchor.getBoundingClientRect();
    var sw = sprout.offsetWidth || 240, sh = sprout.offsetHeight || 200;
    var vw = window.innerWidth, vh = window.innerHeight;
    var below = r.bottom + 6 + sh <= vh - 8;
    var top = below ? r.bottom + 6 : Math.max(8, r.top - sh - 6);
    var left = Math.min(Math.max(8, r.right - sw), vw - sw - 8);
    sprout.style.position = 'fixed'; sprout.style.top = top + 'px'; sprout.style.left = left + 'px'; sprout.style.right = 'auto';
    sprout.style.setProperty('--pm6-sprout-ox', ((r.left + r.width / 2) < (left + sw / 2)) ? '12%' : '88%');
    sprout.style.setProperty('--pm6-sprout-oy', below ? '0%' : '100%');
    sprout.style.setProperty('--pm6-sprout-ty', below ? '-10px' : '10px');
  }
  function closeSiblings() {
    if (window.PMMenu && PMMenu.closeAll) PMMenu.closeAll();
    if (window.PMWidgets && PMWidgets.closeAll) PMWidgets.closeAll();
  }
  function clampViewport(sprout) {
    var top = parseFloat(sprout.style.top);
    if (isNaN(top)) return;
    var over = top + (sprout.offsetHeight || 0) - (window.innerHeight - 8);
    if (over > 0) sprout.style.top = Math.max(8, top - over) + 'px';
  }
  function open(sprout, anchor) {
    ensure(); if (!anchor) return; closeAll(); closeSiblings();
    if (window.PMMenu && PMMenu.openAt) {
      var r = anchor.getBoundingClientRect();
      PMMenu.openAt(sprout, r.right, r.bottom + 6);
      var above = sprout.getBoundingClientRect().top < (r.top + r.height / 2);
      sprout.style.setProperty('--pm6-sprout-ty', above ? '10px' : '-10px');
    } else {
      placeFallback(sprout, anchor); sprout.classList.remove('is-closing'); sprout.classList.add('is-open');
    }
    clampViewport(sprout);
    sprout._btn = anchor;
    if (anchor) { anchor.classList.add('is-open'); anchor.setAttribute('aria-expanded', 'true'); }
    if (sprout === detSprout) { var f = focusables(detSprout); (f[0] || detSprout).focus(); }
    /* re-arm the meters so they grow in on EVERY open (fills hold their final
       width after the first pass); the grow itself is R.animateFills below */
    sprout.querySelectorAll('.us-fill[data-fill], i[data-fill]').forEach(function (el) { el.style.transition = 'none'; el.style.width = '0%'; });
    void sprout.offsetWidth;
    sprout.querySelectorAll('.us-fill[data-fill], i[data-fill]').forEach(function (el) { el.style.transition = ''; });
    R.animateFills(sprout);
  }
  function close(sprout) {
    if (!sprout || !sprout.classList.contains('is-open')) return;
    var btn = sprout._btn;
    var hadFocus = sprout.contains(document.activeElement);
    if (btn) { btn.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    if (window.PMMenu && PMMenu.close) { PMMenu.close(sprout); }
    else { sprout.classList.remove('is-open'); sprout.classList.add('is-closing'); setTimeout(function () { sprout.classList.remove('is-closing'); }, 240); }
    if (hadFocus && btn && btn.offsetParent !== null) btn.focus();
  }
  function closeAll() { close(ringSprout); close(detSprout); }
  function popRing() {
    var s = ringBtn && ringBtn.querySelector('.pm-ctx-ring'); if (!s) return;
    s.classList.remove('is-pop'); void s.offsetWidth; s.classList.add('is-pop');
  }
  function openRing(anchor) { ensure(); open(ringSprout, anchor || ringBtn); }
  function openDetails(anchor) { ensure(); open(detSprout, anchor || detBtn); }

  function mountTriggers(container) {
    if (!container) return;
    ensure();
    var pct = (D && D.ring && D.ring.pct) || 0;
    ringBtn = document.createElement('button'); ringBtn.type = 'button'; ringBtn.className = 'sb-chip'; ringBtn.setAttribute('data-tip', 'Context usage'); ringBtn.setAttribute('title', 'Context usage'); ringBtn.setAttribute('aria-label', 'Context usage, ' + pct + '% used'); ringBtn.setAttribute('aria-haspopup', 'dialog'); ringBtn.setAttribute('aria-expanded', 'false'); ringBtn.setAttribute('aria-controls', 'pm-ctx-ring-pop');
    ringBtn.innerHTML = '<span class="pm-ctx-ring" data-heat="' + (pct >= 90 ? 'hot' : (pct >= 70 ? 'warm' : 'calm')) + '">' + ringSvg() + '</span>';
    detBtn = document.createElement('button'); detBtn.type = 'button'; detBtn.className = 'sb-chip'; detBtn.setAttribute('data-tip', 'More context details'); detBtn.setAttribute('title', 'More context details'); detBtn.setAttribute('aria-label', 'More context details'); detBtn.setAttribute('aria-haspopup', 'dialog'); detBtn.setAttribute('aria-expanded', 'false'); detBtn.setAttribute('aria-controls', 'pm-ctx-detail-pop');
    detBtn.innerHTML = listSvg() + '<span>Details</span>';
    container.appendChild(ringBtn); container.appendChild(detBtn);
    ringBtn.addEventListener('animationend', function (e) {
      if (e.animationName === 'pmCtxRingPop') { var s = ringBtn.querySelector('.pm-ctx-ring'); if (s) s.classList.remove('is-pop'); }
    });
    ringBtn.addEventListener('click', function (e) { e.stopPropagation(); ensure(); if (ringSprout.classList.contains('is-open')) closeAll(); else { popRing(); openRing(ringBtn); } });
    detBtn.addEventListener('click', function (e) { e.stopPropagation(); ensure(); if (detSprout.classList.contains('is-open')) closeAll(); else openDetails(detBtn); });
  }
  window.PMContext = { mountTriggers: mountTriggers, openRing: openRing, openDetails: openDetails, closeAll: closeAll };
})();
