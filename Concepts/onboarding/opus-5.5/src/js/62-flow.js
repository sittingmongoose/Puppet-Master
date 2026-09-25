/* O55.flow — shared helpers for screens: phased owner operations rendered as truthful phase lists, countdowns,
   per-screen tickers, a QR drawing for pairing cards and small validation helpers. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, C = O55.c, T = (k, v) => O55.t(k, v);
  const F = O55.flow = {};

  /* op(S, key, cmdId, phases, opts) — dispatches the command through the owner table (gated by owner phase), runs
     the phased fixture operation, mirrors each phase into S.sess.ops[key] and refreshes the screen that shows it.
     Idempotent: calling it again for a finished key does nothing; for a failed key it resumes the failed phase. */
  const inflight = new Set();
  F.op = function op(S, key, cmdId, phases, opts) {
    opts = opts || {};
    S.sess.ops = S.sess.ops || {};
    const cur = S.sess.ops[key];
    /* in flight or finished: nothing to do (a refresh re-running mounted() never starts a second copy); a saved
       'running' op from before a reload is not in flight, so it resumes */
    if (inflight.has(key) || (cur && cur.state === 'done')) return Promise.resolve(cur);
    inflight.add(key);
    /* an operation belongs to the run that started it: after Run Onboarding Again its late reports are dropped */
    const epoch = S.epoch || 0, stale = () => (S.epoch || 0) !== epoch;
    S.sess.ops[key] = { state: 'running', phases: phases.map((p) => ({ key: p.key, status: 'waiting' })), code: null };
    S.save(); O55.ui.refresh();
    return O55.owners.dispatch(cmdId, opts.payload || {}, Object.assign(S.ctx(), opts.ctx || {}), () => O55.owners.operation(key, phases, (st) => {
      if (stale()) return;
      S.sess.ops[key] = { state: st.state, phases: st.phases, code: st.code, failedAt: st.failedAt, receipt: O55.owners.opState(key) && O55.owners.opState(key).receipt };
      S.save();
      /* owners' completion handlers update the session first, so the refresh shows the settled state in one frame */
      if (st.state === 'done') { O55.sound.play('success'); opts.onDone && opts.onDone(S, st); }
      if (st.state === 'failed') { O55.sound.play('error'); opts.onFail && opts.onFail(S, st); }
      if (!opts.quiet) O55.ui.refresh();
    })).then((res) => {
      if (stale()) return null;
      inflight.delete(key);
      if (res && res.refused) { S.sess.ops[key] = { state: 'refused', phases: [], code: res.reason }; S.save(); O55.ui.refresh(); }
      return S.sess.ops[key];
    }, (err) => { inflight.delete(key); throw err; });
  };
  F.state = (S, key) => (S.sess.ops && S.sess.ops[key]) || null;
  F.clearInflight = () => inflight.clear();
  F.reset = (S, key) => { inflight.delete(key); if (S.sess.ops) delete S.sess.ops[key]; const o = O55.owners.opState(key); if (o) { o.done = []; o.state = 'idle'; } };
  /* Phase list with plain labels; labels is {phaseKey: text}. Unknown ops render every phase as waiting. */
  F.phases = function phases(S, key, order, labels, details) {
    const st = F.state(S, key);
    const list = order.map((k) => {
      const ph = st && st.phases ? st.phases.find((p) => p.key === k) : null;
      return { key: k, label: labels[k], status: ph ? ph.status : 'waiting', detail: details && details[k] };
    });
    return C.phases(list);
  };

  /* Ticker: re-renders the current screen every `ms` while it stays current (countdowns, waiting states). */
  let tick = null;
  F.ticker = function ticker(S, screenId, ms, until) {
    if (tick && tick.screen === screenId) return;
    if (tick) tick.cancel();
    const loop = () => { if (!S.open || S.sess.screen !== screenId || (until && until())) { tick = null; return; } O55.ui.refresh(); h = O55.motion.after(ms, loop); };
    let h = O55.motion.after(ms, loop);
    tick = { screen: screenId, cancel() { h.cancel(); } };
  };
  F.countdown = function countdown(until) {
    const left = Math.max(0, Math.round((until - Date.now()) / 1000));
    return { m: String(Math.floor(left / 60)), s: String(left % 60).padStart(2, '0'), left };
  };

  /* A deterministic QR-style drawing (finder squares + seeded modules). Concept art for pairing cards; the code and
     link beside it carry the same information, so nothing depends on scanning it. */
  F.qr = function qr(seed, size) {
    const n = 25, cell = (size || 148) / n, r = U.rng(seed);
    let rects = '';
    const finder = (x, y) => `<rect x="${x * cell}" y="${y * cell}" width="${7 * cell}" height="${7 * cell}" fill="currentColor"/>`
      + `<rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="var(--o55-qr-bg, #fff)"/>`
      + `<rect x="${(x + 2) * cell}" y="${(y + 2) * cell}" width="${3 * cell}" height="${3 * cell}" fill="currentColor"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && r() > 0.52) rects += `<rect x="${(x * cell).toFixed(2)}" y="${(y * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`;
    return `<svg class="o55-qr" viewBox="0 0 ${size || 148} ${size || 148}" width="${size || 148}" height="${size || 148}" role="img" aria-label="QR code" shape-rendering="crispEdges">`
      + `<rect width="100%" height="100%" fill="var(--o55-qr-bg, #fff)"/><g fill="currentColor">${rects}</g>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
  };

  /* Text helpers */
  F.plural = (n, one, many) => T(n === 1 ? one : many, { n });
  F.nonEmpty = (v) => String(v == null ? '' : v).trim().length > 0;
  F.isHttps = (v) => /^https:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/.test(String(v || '').trim());
  F.chips = function chips(action, values, current) {
    return `<div class="o55-suggest" role="group">` + values.map((v) => `<button type="button" class="o55-suggestchip${v === current ? ' o55-on' : ''}" data-o55-do="${U.esc(action)}" data-arg="${U.esc(v)}" data-pm-hover-exempt="true" data-key="sg-${U.esc(U.slug(v))}">${U.esc(v)}</button>`).join('') + '</div>';
  };
  /* A disclosure row that reveals more choices in place (source_more / remote_more); never a nested dialog. */
  F.more = function more(open, label, action, body, key) {
    return `<div class="o55-more${open ? ' o55-open' : ''}" data-key="more-${U.esc(key || action)}"><button type="button" class="o55-morebtn" data-o55-do="${U.esc(action)}" aria-expanded="${open}" data-pm-hover-exempt="true">`
      + `<span>${U.esc(label)}</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>`
      + (open ? `<div class="o55-morebody">${body}</div>` : '') + '</div>';
  };
  /* Copy-to-clipboard button with a transient "Copied" state (no fake success: it reports the clipboard result). */
  F.copyBtn = (text, key) => `<button type="button" class="o55-btn o55-secondary o55-small" data-o55-do="copyText" data-arg="${U.esc(text)}" data-pm-hover-exempt="true" data-key="copy-${U.esc(key || U.slug(text))}">${U.esc(T('chrome.copy'))}</button>`;
  O55.actions.copyText = function (S, text, el) {
    U.copyText(text).then((ok) => { if (!ok || !el || !document.contains(el)) return; el.textContent = T('chrome.copied'); O55.motion.after(1400, () => { if (document.contains(el)) el.textContent = T('chrome.copy'); }); });
  };
})();
