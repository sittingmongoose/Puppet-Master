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
    /* refused, and nothing the owner gate reads (the command and the context) has changed: asking again gets the same
       answer. Without this, a screen whose mounted() starts an op the owner refuses (a post-commit command before the
       commit) refreshed, mounted again and re-dispatched in an endless promise chain that froze the page. */
    const gateKey = JSON.stringify([cmdId, Object.assign(S.ctx(), opts.ctx || {})]);
    if (cur && cur.state === 'refused' && cur.gateKey === gateKey) return Promise.resolve(cur);
    inflight.add(key);
    /* an operation belongs to the run that started it: after Run Onboarding Again its late reports are dropped */
    const epoch = S.epoch || 0, stale = () => (S.epoch || 0) !== epoch;
    /* opts.sound = { done?: event|false (default 'success'), fail?: event|false (default 'error'),
       phase?: false | { [finishedPhaseKey]: event }, intensity?: 0..1 }. Each phase after the first ticks as it starts
       (the first starts with the press), climbing; a phase map names a finding instead (an approval on the other
       device, servers appearing). Every sound waits for the screen that started the operation to still show it. */
    const snd = opts.sound || {}, here = S.sess.screen, showing = () => S.open && S.sess.screen === here;
    let shown = -1;
    S.sess.ops[key] = { state: 'running', phases: phases.map((p) => ({ key: p.key, status: 'waiting' })), code: null };
    S.save(); O55.ui.refresh();
    return O55.owners.dispatch(cmdId, opts.payload || {}, Object.assign(S.ctx(), opts.ctx || {}), () => O55.owners.operation(key, phases, (st) => {
      if (stale()) return;
      S.sess.ops[key] = { state: st.state, phases: st.phases, code: st.code, failedAt: st.failedAt, receipt: O55.owners.opState(key) && O55.owners.opState(key).receipt };
      S.save();
      if (st.state === 'running' && st.current && !opts.quiet && snd.phase !== false) {
        const i = st.phases.findIndex((p) => p.key === st.current);
        if (shown >= 0 && i > shown && showing()) {
          const ev = (snd.phase && snd.phase[st.phases[i - 1].key]) || 'phase';
          O55.sound.play(ev, ev === 'phase' ? { step: i, intensity: 0.3 + 0.5 * i / Math.max(1, st.phases.length - 1) } : { step: i, intensity: snd.intensity });
        }
        if (i > shown) shown = i;
      }
      /* owners' completion handlers update the session first, so the refresh shows the settled state in one frame */
      if (st.state === 'done') { const ev = snd.done === undefined ? 'success' : snd.done; if (ev && showing()) O55.sound.play(ev, { step: st.phases.length, intensity: snd.intensity }); opts.onDone && opts.onDone(S, st); }
      if (st.state === 'failed') { const ev = snd.fail === undefined ? 'error' : snd.fail; if (ev && showing()) O55.sound.play(ev); opts.onFail && opts.onFail(S, st); }
      if (!opts.quiet) O55.ui.refresh();
      /* NieR Mode's Pod reports a finished operation that the screen still shows (66-nier-window.js) */
      if (st.state === 'done' && !opts.quiet && showing()) O55.ui.skin('op', key, st);
    })).then((res) => {
      if (stale()) return null;
      inflight.delete(key);
      if (res && res.refused) { S.sess.ops[key] = { state: 'refused', phases: [], code: res.reason, gateKey }; S.save(); O55.ui.refresh(); }
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
  /* suggestion chips, with one ? for them all (group:<action>) after the last */
  F.chips = function chips(action, values, current) {
    const gid = 'group:' + action;
    return `<div class="o55-suggest" role="group">` + values.map((v) => `<button type="button" class="o55-suggestchip${v === current ? ' o55-on' : ''}" data-o55-do="${U.esc(action)}" data-arg="${U.esc(v)}"${O55.tips.described(gid)} data-pm-hover-exempt="true" data-key="sg-${U.esc(U.slug(v))}">${U.esc(v)}</button>`).join('') + O55.tips.q(gid) + '</div>' + O55.tips.explainer(gid);
  };
  /* Demo hints, O55.flow.hint(id, items, o) (Jared 2026-10-31: "Demos should have a hint to progress ... The hint
     provides ways to get the different steps out ... prefilled selections that allow the user to try it that way").
     On a step a person couldn't finish without a real service, one quiet row of ready choices under the field or the
     choice it serves. Each fills its field or fields (O55.ui.fill, exactly as typing does) or presses its choice
     (O55.ui.act), so the screen takes that branch, failures included; the fixtures and the concept owner host
     (30-owners.js) answer it as they answer a person. It is shown only while useful (o.when), never in place of the
     real control, and the same in Plain English and Expert. items: [{ label, outcome, fills: [[bind, value], ...] } or
     { label, outcome, act: [action, arg] }]; outcome names the branch (demoHint.outcome.<word>: works, wrong, noAnswer,
     refused, taken). Other screens add theirs with the same call. */
  const HINTS = {};
  F.hint = function hint(id, items, o) {
    o = o || {};
    if (o.when === false || !items || !items.length) return '';
    HINTS[id] = items;
    const lab = T('demoHint.label');
    return `<div class="o55-demohint" role="group" aria-label="${U.esc(lab)}" data-key="dh-${U.esc(id)}"><span class="o55-demohint-k">${U.esc(lab)}</span>`
      + items.map((it, i) => `<button type="button" class="o55-demohint-c" data-o55-do="demoHint" data-arg="${U.esc(id)}|${i}" data-pm-hover-exempt="true">`
        + `<span class="o55-demohint-v">${U.esc(it.label)}</span>${it.outcome ? `<span class="o55-demohint-o">${U.esc(T('demoHint.outcome.' + it.outcome))}</span>` : ''}</button>`).join('') + '</div>';
  };
  F.hintPick = function hintPick(arg) {
    const [id, i] = String(arg || '').split('|'), it = (HINTS[id] || [])[+i];
    if (!it) return false;
    (it.fills || []).forEach(([bind, value]) => O55.ui.fill(bind, value));
    if (it.act) O55.ui.act(it.act[0], it.act[1]);
    return true;
  };
  /* A disclosure row that reveals more choices in place (source_more / remote_more); never a nested dialog. */
  /* (a disclosure whose action has a tip of its own, such as which online service to pick, carries its ? beside it) */
  F.more = function more(open, label, action, body, key) {
    const qh = O55.tips.exact(action) ? O55.tips.q(action) : '';
    const btn = `<button type="button" class="o55-morebtn" data-o55-do="${U.esc(action)}" aria-expanded="${open}" data-pm-hover-exempt="true"${qh ? O55.tips.described(action) : ''}>`
      + `<span>${U.esc(label)}</span>${U.nx('chevron-down', 16, 'control') || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'}</button>`;
    return `<div class="o55-more${open ? ' o55-open' : ''}" data-key="more-${U.esc(key || action)}">` + (qh ? `<div class="o55-morehead">${btn}${qh}</div>${O55.tips.explainer(action)}` : btn)
      + (open ? `<div class="o55-morebody">${body}</div>` : '') + '</div>';
  };
  /* Copy-to-clipboard button with a transient "Copied" state (no fake success: it reports the clipboard result). */
  /* (its ? is copy:<key>; the explainer opens after the line the button sits in: F.copyNote(key)) */
  /* The "Copied" acknowledgment is kept here, per button, until its deadline, and the button is drawn from it: a screen
     redrawn meanwhile (s-ready's and the codes' once-a-second countdown) used to write "Copy" back over it after about
     0.2 s (final recording FO-8). Kept for this page only; nothing is saved. */
  const COPIED = {}, COPIED_MS = 1400;
  const copyKey = (text, key) => 'copy-' + (key || U.slug(text));
  const copiedNow = (k) => !!COPIED[k];
  F.copyNote = (key) => O55.tips.explainer('copy:' + (key || ''));
  F.copyBtn = (text, key) => { const k = copyKey(text, key); return O55.tips.opt('copy:' + (key || ''), `<button type="button" class="o55-btn o55-secondary o55-small" data-o55-do="copyText" data-arg="${U.esc(text)}" data-pm-hover-exempt="true" data-key="${U.esc(k)}">${U.esc(T(copiedNow(k) ? 'chrome.copied' : 'chrome.copy'))}</button>`, 'o55-opt-inline', 'span', { note: false }); };
  O55.actions.copyText = function (S, text, el) {
    U.copyText(text).then((ok) => {
      if (!ok || !el || !document.contains(el)) return;
      /* (its deadline runs on the motion clock, as the timer does: slow-motion filming stretches both alike) */
      const k = el.getAttribute('data-key') || copyKey(text), until = {};
      COPIED[k] = until; el.textContent = T('chrome.copied'); O55.sound.play('copy');
      O55.motion.after(COPIED_MS, () => {
        if (COPIED[k] !== until) return; /* copied again meanwhile: that one's deadline counts */
        delete COPIED[k];
        document.querySelectorAll('[data-o55-do="copyText"]').forEach((b) => { if (b.getAttribute('data-key') === k) b.textContent = T('chrome.copy'); });
      });
    });
  };
})();
