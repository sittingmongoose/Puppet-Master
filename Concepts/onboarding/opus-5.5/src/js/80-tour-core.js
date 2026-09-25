/* O55.tour — the Guided Tour engine, in the real shell. Try it, then Show Me: each step brings its target into view,
   explains one outcome and asks for the real action; Show Me drives the same handler with a visible pointer (pre-cue,
   travel, arrival, settle). A step completes only when its success predicate observes the result, never on a timer.
   The workspace session is reversible: a snapshot at start, restore at the end unless the person keeps the layout.
   Checkpoints hold step ids and completed predicates only. Nothing here calls an AI provider or uses allowance. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v), M = O55.motion;
  const TR = O55.tour = { defs: [], byId: {}, running: false };
  const KEY = 'tour', ROOT = 'pm-o55-tour';
  const st = TR.st = { sess: null, root: null, step: null, advancing: false, show: null, hole: null, spring: null, poll: null, raf: 0, snap: null, missingSince: 0, tips: 'normal', paused: false, entries: {}, rewinding: false, entering: false, pendingBack: false, seq: 0 };
  const CHAPTERS = ['ask', 'workspace', 'plan'];
  TR.CHAPTERS = CHAPTERS;
  TR.define = (def) => { def.index = TR.defs.length; TR.defs.push(def); TR.byId[def.id] = def; return def; };
  const vis = (el) => !!(el && el.isConnected && el.getClientRects().length && el.getBoundingClientRect().width > 0);
  TR.vis = vis;
  TR.q = (sel) => [...document.querySelectorAll(sel)].find(vis) || null;

  /* ------------------------------------------------------------------ snapshot / restore (reversible session) */
  function snapshot() {
    const api = window.PM_HOME_WORKSPACE, d = window.PM_DEMO, dash = window.PM7_DASH_WIDGETS;
    const tab = document.querySelector('.page-tab.active[data-page]');
    return {
      at: new Date().toISOString(),
      layout: api ? JSON.parse(JSON.stringify(api.layout)) : null,
      page: tab ? tab.getAttribute('data-page') : 'dashboard',
      thread: d && d.state && d.state.chat ? d.state.chat.activeThread : null,
      persona: ((document.querySelector('#chatPanel .persona-label') || {}).textContent || '').trim(),
      eli5: !!TR.q('span.chat-toggle-btn.toggle-eli5.active'),
      draft: ((TR.q('textarea.pm6-chat-input') || {}).value) || '',
      widgets: dashSnapshot()
    };
  }
  /* The Home dashboard's cards by host, in order, with their sizes (keys only, so the snapshot survives a reload) */
  const DASH_HOSTS = ['dashGridMain', 'dashGridMetrics', 'dashGridMonitoring'];
  const dashKey = (c) => c.getAttribute('data-widget-id') || c.getAttribute('data-widget-kind');
  const dashCardsIn = (h) => [...h.children].filter((c) => c.classList.contains('pm6-dash-card') && !/placeholder/.test(c.className));
  function dashSnapshot() {
    const out = { hosts: {}, sizes: {} };
    DASH_HOSTS.forEach((id) => { const h = document.getElementById(id); if (!h) return; out.hosts[id] = dashCardsIn(h).map((c) => { const k = dashKey(c); out.sizes[k] = [c.style.getPropertyValue('--dw').trim(), c.style.getPropertyValue('--dh').trim()]; return k; }); });
    return out;
  }
  TR.dashSnapshot = dashSnapshot;
  /* Put the dashboard back: widgets added during the tour leave through their own remove control (so the catalog
     knows they can be added again), then every card returns to its host, place and size, and the dashboard saves. */
  async function dashRestore(snap) {
    if (!snap || !snap.hosts) return null;
    const known = new Set(Object.values(snap.hosts).flat());
    const all = () => DASH_HOSTS.flatMap((id) => { const h = document.getElementById(id); return h ? dashCardsIn(h) : []; });
    const extra = all().filter((c) => !known.has(dashKey(c)));
    extra.forEach((c) => { const x = c.querySelector('[data-pm6-dash="remove"]'); if (x) x.click(); else c.remove(); });
    if (extra.length) await new Promise((res) => setTimeout(res, 260));
    const byKey = {}; all().forEach((c) => { byKey[dashKey(c)] = c; });
    Object.entries(snap.hosts).forEach(([id, keys]) => {
      const h = document.getElementById(id); if (!h) return;
      keys.forEach((k) => { const c = byKey[k]; if (!c) return; const sz = snap.sizes[k] || []; if (sz[0]) c.style.setProperty('--dw', sz[0]); if (sz[1]) c.style.setProperty('--dh', sz[1]); h.appendChild(c); });
    });
    await new Promise((res) => setTimeout(res, 90)); /* the dashboard re-syncs its cards on the move */
    try { window.PM7_DASH_WIDGETS && window.PM7_DASH_WIDGETS.persist(); } catch (_) {}
    return JSON.stringify(dashSnapshot()) === JSON.stringify({ hosts: snap.hosts, sizes: snap.sizes }) ? 'restored' : 'failed';
  }
  async function restore(snap, keep) {
    const out = { layout: null, widgets: null, chat: null };
    if (!snap) return out;
    const api = window.PM_HOME_WORKSPACE;
    if (!keep && api && api.o55RestoreSnapshot && snap.layout) {
      const r = api.o55RestoreSnapshot(snap.layout);
      out.layout = r && r.ok ? (r.result && r.result.command ? r.result.command.command_id : 'ok') : 'failed';
    }
    if (!keep && snap.widgets) out.widgets = await dashRestore(snap.widgets);
    out.chat = TR.chat ? await TR.chat.restore(snap, keep) : null;
    if (TR.practice) TR.practice.remove();
    return out;
  }
  TR.snapshot = snapshot;

  /* ------------------------------------------------------------------ DOM */
  function build() {
    if (st.root) return st.root;
    const r = document.createElement('div');
    r.id = ROOT; r.className = 'o55t-root'; r.hidden = true; r.setAttribute('data-pm-hover-exempt', 'true');
    r.innerHTML = `<svg class="o55t-scrim" aria-hidden="true"><path class="o55t-scrimpath" fill-rule="evenodd"/><rect class="o55t-ring" rx="12" ry="12"/></svg>`
      + `<div class="o55t-shield" aria-hidden="true"></div>`
      + `<div class="o55t-zone" aria-hidden="true"><span class="o55t-zonelabel"><svg viewBox="0 0 20 20" width="16" height="16"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      + `<span class="o55t-zl-idle">${U.esc(T('tour.steps.move_or_dock_chat.zone'))}</span><span class="o55t-zl-hot">${U.esc(T('tour.steps.move_or_dock_chat.zoneHot'))}</span></span></div>`
      + `<div class="o55t-callout" role="dialog" aria-modal="false" aria-labelledby="o55t-h"></div>`
      + `<div class="o55t-bar" role="toolbar" aria-label="${U.esc(T('tour.bar.label'))}"></div>`
      /* one pointer per family, every glyph drawn with its hotspot at (6, 3): a drafting crosshair (Basic), a cartoon
         glove (Friendly), a glowing orb with a trail (Glass), a pixel hand (Retro) */
      + `<div class="o55t-pointer" aria-hidden="true"><svg viewBox="0 0 32 32" width="30" height="30" overflow="visible">`
      + `<defs><radialGradient id="o55t-orb" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fff"/><stop offset="0.45" class="o55t-orb-mid"/><stop offset="1" class="o55t-orb-edge"/></radialGradient></defs>`
      + `<g class="o55t-ptr o55t-pg-basic"><circle cx="6" cy="3" r="6.5" class="o55t-pg-ring"/><path class="o55t-pg-line" d="M6 -8.5V-2M6 8v6.5M-5.5 3h6.5M11 3h6.5"/><circle cx="6" cy="3" r="1.5" class="o55t-pg-dot"/></g>`
      + `<g class="o55t-ptr o55t-pg-friendly"><path class="o55t-pg-glove" d="M3.5 15V6a2.5 2.5 0 0 1 5 0v6.2a1.8 1.8 0 0 1 3.6.3a1.8 1.8 0 0 1 3.5.5a1.7 1.7 0 0 1 3.3.8V20c0 2.6-2.2 4.2-5 4.2H8.6c-2.4 0-3.6-1.4-4.4-3L1.2 17.4c-.8-1.3.8-2.8 2.3-1.6z"/><path class="o55t-pg-crease" d="M8.5 12.6v2.9M12.1 12.8v2.4M15.6 13.2v2.2"/><rect class="o55t-pg-cuff" x="6.2" y="24" width="11.6" height="4.6" rx="1.6"/></g>`
      + `<g class="o55t-ptr o55t-pg-glass"><circle cx="6" cy="3" r="7" fill="url(#o55t-orb)"/><circle cx="3.8" cy="0.6" r="2" fill="#fff" opacity="0.85"/></g>`
      + `<g class="o55t-ptr o55t-pg-retro" shape-rendering="crispEdges"><rect x="5" y="3" width="2" height="2"/><rect x="5" y="5" width="2" height="2"/><rect x="5" y="7" width="2" height="2"/><rect x="5" y="9" width="2" height="2"/><rect x="7" y="9" width="2" height="2"/><rect x="9" y="9" width="2" height="2"/><rect x="11" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/><rect x="15" y="9" width="2" height="2"/><rect x="3" y="11" width="2" height="2"/><rect x="5" y="11" width="2" height="2"/><rect x="7" y="11" width="2" height="2"/><rect x="9" y="11" width="2" height="2"/><rect x="11" y="11" width="2" height="2"/><rect x="13" y="11" width="2" height="2"/><rect x="15" y="11" width="2" height="2"/><rect x="17" y="11" width="2" height="2"/><rect x="3" y="13" width="2" height="2"/><rect x="5" y="13" width="2" height="2"/><rect x="7" y="13" width="2" height="2"/><rect x="9" y="13" width="2" height="2"/><rect x="11" y="13" width="2" height="2"/><rect x="13" y="13" width="2" height="2"/><rect x="15" y="13" width="2" height="2"/><rect x="17" y="13" width="2" height="2"/><rect x="5" y="15" width="2" height="2"/><rect x="7" y="15" width="2" height="2"/><rect x="9" y="15" width="2" height="2"/><rect x="11" y="15" width="2" height="2"/><rect x="13" y="15" width="2" height="2"/><rect x="15" y="15" width="2" height="2"/><rect x="17" y="15" width="2" height="2"/><rect x="5" y="17" width="2" height="2"/><rect x="7" y="17" width="2" height="2"/><rect x="9" y="17" width="2" height="2"/><rect x="11" y="17" width="2" height="2"/><rect x="13" y="17" width="2" height="2"/><rect x="15" y="17" width="2" height="2"/><rect x="5" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="7" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="9" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="11" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="13" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="15" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="5" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="7" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="9" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="11" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="13" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="15" y="21" width="2" height="2" class="o55t-pg-cuff"/></g>`
      + `</svg><span class="o55t-trail"></span></div>`
      + `<div class="o55-live" aria-live="polite" role="status"></div>`;
    document.body.appendChild(r);
    st.root = r;
    r.addEventListener('click', onClick);
    ['keydown', 'keyup', 'keypress'].forEach((ev) => r.addEventListener(ev, (e) => { e.stopPropagation(); if (ev === 'keydown' && e.key === 'Escape') { e.preventDefault(); togglePause(); } }));
    /* any real input during Show Me hands control back at once */
    ['pointerdown', 'keydown', 'wheel'].forEach((ev) => document.addEventListener(ev, (e) => { if (st.show && e.isTrusted && !r.contains(e.target)) interruptShow(); }, true));
    window.addEventListener('resize', () => { if (TR.running) { st.fixed = null; place(true); } });
    document.addEventListener('visibilitychange', () => { if (st.root) st.root.toggleAttribute('data-hidden', document.hidden); });
    return r;
  }
  const family = () => O55.theme().family;
  function syncTheme() { if (!st.root) return; const th = O55.theme(); st.root.setAttribute('data-family', th.family); st.root.setAttribute('data-mode', th.mode); }

  /* ------------------------------------------------------------------ bar */
  function renderBar() {
    const bar = st.root.querySelector('.o55t-bar'), s = st.step, ch = s ? s.chapter : 'ask';
    const ci = CHAPTERS.indexOf(ch), inCh = TR.defs.filter((d) => d.chapter === ch), si = inCh.indexOf(s);
    const pips = CHAPTERS.map((c, i) => {
      const steps = TR.defs.filter((d) => d.chapter === c);
      const ticks = steps.map((d) => `<i class="o55t-tick${st.sess.done.includes(d.id) ? ' o55t-on' : ''}${d === s ? ' o55t-cur' : ''}"></i>`).join('');
      return `<span class="o55t-pip${i < ci ? ' o55t-done' : i === ci ? ' o55t-cur' : ''}" title="${U.esc(T('tour.chapters.' + c))}"><span class="o55t-pipname">${U.esc(T('tour.chapters.' + c))}</span><span class="o55t-ticks">${ticks}</span></span>`;
    }).join('');
    bar.innerHTML = `<span class="o55t-brand">${O55.c.small('spark', 14)}<span>${U.esc(T('tour.bar.label'))}</span></span><span class="o55t-pips" aria-label="${U.esc(T('tour.bar.progress', { n: ci + 1, name: T('tour.chapters.' + ch), s: si + 1, total: inCh.length }))}">${pips}</span>`
      + `<span class="o55t-seg" role="radiogroup" aria-label="${U.esc(T('tour.bar.tips'))}"><span class="o55t-seglabel">${U.esc(T('tour.bar.tips'))}</span>`
      + ['normal', 'eli5'].map((v) => `<button type="button" role="radio" aria-checked="${st.tips === v}" class="${st.tips === v ? 'o55t-on' : ''}" data-o55t="tips" data-arg="${v}" data-pm-hover-exempt="true">${U.esc(T('tour.bar.' + v))}</button>`).join('') + '</span>'
      + `<button type="button" class="o55t-barbtn" data-o55t="pause" data-pm-hover-exempt="true">${U.esc(st.paused ? T('tour.bar.resume') : T('tour.bar.pause'))}</button>`
      + `<button type="button" class="o55t-barbtn" data-o55t="skip" data-pm-hover-exempt="true">${U.esc(T('tour.bar.skip'))}</button>`
      + (O55.lookMenu ? `<span class="o55t-lookslot">${O55.lookMenu.button('o55t-barbtn o55t-sound', 'data-o55t', st.lookOpen)}${st.lookOpen ? O55.lookMenu.panel('data-o55t') : ''}</span>` : '')
      + O55.sound.buttonHtml('o55t-barbtn o55t-sound').replace('data-o55-do="sound"', 'data-o55t="sound"');
  }

  /* ------------------------------------------------------------------ callout */
  const copy = (id, k) => { const tips = st.tips === 'eli5'; const v = O55.tx('tour.steps.' + id + '.' + k + (tips ? 'Eli5' : '')); return typeof v === 'string' ? v : T('tour.steps.' + id + '.' + k); };
  function calloutHtml() {
    const s = st.step; if (!s) return '';
    if (st.missing) return `<p class="o55t-kicker">${U.esc(T('tour.bar.label'))}</p><h2 class="o55t-title" id="o55t-h" tabindex="-1">${U.esc(T('tour.missing.title'))}</h2><p class="o55t-body">${U.esc(T('tour.missing.body'))}</p>`
      + `<div class="o55t-actions">${btn('back', T('tour.controls.back'), 'ghost')}${btn('skipStep', T('tour.controls.next'), 'ghost')}${btn('takeMe', T('tour.controls.takeMe'), 'primary')}</div>`;
    if (s.render) return s.render(st, { btn, copy });
    const done = st.sess.done.includes(s.id) && s.kind === 'action';
    const title = copy(s.id, 'title'), body = done && s.after ? T('tour.steps.' + s.id + '.after') : copy(s.id, s.doKey ? s.doKey(st) : 'do');
    const extra = s.extra ? s.extra(st) : '';
    const actions = [];
    if (s.index > 0) actions.push(btn('back', T('tour.controls.back'), 'ghost'));
    if (s.kind === 'action' && !done && s.showMe) actions.push(btn('showMe', T('tour.controls.showMe'), 'secondary'));
    if (s.kind === 'info' || done) {
      const ready = s.kind !== 'info' || !s.ready || s.ready(st);
      actions.push(ready ? btn('next', s.nextLabel ? s.nextLabel(st) : T('tour.controls.next'), 'primary') : `<button type="button" class="o55t-btn o55t-primary" aria-disabled="true" data-pm-hover-exempt="true">${U.esc(s.nextLabel ? s.nextLabel(st) : T('tour.controls.next'))}</button>`);
    }
    return `<p class="o55t-kicker">${U.esc(T('tour.chapters.' + s.chapter))}</p><h2 class="o55t-title" id="o55t-h" tabindex="-1">${U.esc(title)}</h2>`
      + (s.kind === 'action' && !done ? `<p class="o55t-try"><span class="o55t-trylabel">${U.esc(T('tour.controls.tryIt'))}</span>${U.esc(body)}</p>` : `<p class="o55t-body">${U.esc(body)}</p>`)
      + extra + `<div class="o55t-actions">${actions.join('')}</div>`;
  }
  function btn(action, label, kind, arg) { return `<button type="button" class="o55t-btn o55t-${kind}" data-o55t="${action}"${arg != null ? ` data-arg="${U.esc(arg)}"` : ''} data-pm-hover-exempt="true">${U.esc(label)}</button>`; }
  TR.btn = btn;
  function renderCallout(focus) {
    const c = st.root.querySelector('.o55t-callout');
    U.morph(c, calloutHtml());
    c.setAttribute('data-step', st.step ? st.step.id : '');
    place(false);
    if (focus) M.after(80, () => { const h = c.querySelector('#o55t-h'); if (h && TR.running && !st.show) h.focus({ preventScroll: true }); });
  }
  TR.refresh = () => { if (TR.running) { renderBar(); renderCallout(false); } };

  /* ------------------------------------------------------------------ spotlight + placement */
  function targetEl() { const s = st.step; if (!s || !s.target) return null; try { return s.target(st); } catch (_) { return null; } }
  function holeFor(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect(), pad = (st.step && st.step.pad) != null ? st.step.pad : 8;
    return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
  }
  function drawHole(h) {
    const W = innerWidth, H = innerHeight, svg = st.root.querySelector('.o55t-scrim');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    const outer = `M0 0H${W}V${H}H0Z`;
    if (!h || h.w <= 0) { svg.querySelector('.o55t-scrimpath').setAttribute('d', outer); svg.querySelector('.o55t-ring').setAttribute('width', 0); return; }
    const r = Math.min(14, h.w / 2, h.h / 2), x = h.x, y = h.y, w = h.w, hh = h.h;
    const hole = `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + hh - r}Q${x + w} ${y + hh} ${x + w - r} ${y + hh}H${x + r}Q${x} ${y + hh} ${x} ${y + hh - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
    svg.querySelector('.o55t-scrimpath').setAttribute('d', outer + hole);
    const ring = svg.querySelector('.o55t-ring');
    ring.setAttribute('x', x); ring.setAttribute('y', y); ring.setAttribute('width', w); ring.setAttribute('height', hh);
    /* the click shield covers everything but the hole on steps that must not be interrupted */
    const sh = st.root.querySelector('.o55t-shield');
    sh.style.clipPath = st.step && st.step.block ? `polygon(evenodd, 0 0, ${W}px 0, ${W}px ${H}px, 0 ${H}px, 0 0, ${x}px ${y}px, ${x}px ${y + hh}px, ${x + w}px ${y + hh}px, ${x + w}px ${y}px, ${x}px ${y}px)` : 'inset(50%)';
  }
  /* the hole glides to each new target on a critically damped spring (no overshoot), retargeting mid-flight */
  function moveHole(to) {
    if (!st.hole || !to) { st.hole = to; drawHole(to); return; }
    if (st.spring) { st.spring.retarget(to); return; }
    const from = Object.assign({}, st.hole);
    st.spring = M.spring({ from, to, stiffness: 190, onUpdate: (v) => { st.hole = v; drawHole(v); } });
    st.spring.finished.then(() => { st.spring = null; });
  }
  function place(snap) {
    const el = targetEl(), h = holeFor(el);
    /* the callout is placed against where the spotlight is going, not where it is, so both travel once, together */
    st.dest = h && !st.missing ? h : null;
    if (h && !st.missing) { if (snap) { st.hole = h; drawHole(h); } else moveHole(h); }
    else { if (st.spring) { st.spring.cancel(); st.spring = null; } st.hole = null; drawHole(null); } /* no phantom hole */
    placeBar(h); /* first: where the bar sits decides the room the callout has */
    placeCallout();
  }
  function placeCallout() {
    const c = st.root.querySelector('.o55t-callout'); if (!c) return;
    if (document.body.classList.contains('pm-home-dragging') && st.cpos) return; /* it has stepped back; it holds still */
    const W = innerWidth, H = innerHeight, cw = c.offsetWidth || 360, chh = c.offsetHeight || 180, m = 16, gap = 18;
    const h = !st.missing ? st.dest || st.hole : null;
    /* the band the callout may use: below the title bar and clear of the tour bar, wherever the bar sits (on a narrow
       window it wraps to two rows, and at the top it would otherwise sit on the callout's heading) */
    const bar = st.root.querySelector('.o55t-bar'), bh = (bar && bar.offsetHeight) || 44, barTop = !!(bar && bar.classList.contains('o55t-top'));
    const Y0 = barTop ? 50 + bh + 10 : 56, Y1 = barTop ? H - 12 : H - bh - 24;
    let x, y, side = 'center';
    /* a step whose spotlight tours several places keeps one callout position for the whole step, chosen once to
       stay clear of every place it will visit, so its buttons never move under the learner's hand */
    const avoid = st.step && st.step.avoid && !st.missing ? st.step.avoid(st).filter(Boolean).map((e) => e.getBoundingClientRect()) : null;
    if (avoid && avoid.length) {
      if (!st.fixed) {
        const cost = (cx, cy) => avoid.reduce((a, r) => a + Math.max(0, Math.min(cx + cw, r.right + gap) - Math.max(cx, r.left - gap)) * Math.max(0, Math.min(cy + chh, r.bottom + gap) - Math.max(cy, r.top - gap)), 0);
        let best = null;
        for (const fy of [0.45, 0.3, 0.6, 0.15, 0.8]) for (const fx of [0.5, 0.35, 0.65, 0.15, 0.85]) {
          const cx = m + (W - cw - 2 * m) * fx, cy = Y0 + Math.max(0, Y1 - chh - Y0) * fy, k = cost(cx, cy);
          if (!best || k < best.k - 1) best = { x: cx, y: cy, k };
        }
        st.fixed = best;
      }
      x = st.fixed.x; y = st.fixed.y; side = 'fixed';
    }
    else if (!h || (st.step && st.step.place === 'center')) { x = (W - cw) / 2; y = Math.max(Y0 + 24, Math.min(Y1 - chh, (H - chh) / 2 - 40)); }
    else {
      const pl = st.step && st.step.place, pref = (typeof pl === 'function' ? pl(st) : pl) || 'auto';
      const cands = { right: [h.x + h.w + gap, h.y + h.h / 2 - chh / 2], left: [h.x - gap - cw, h.y + h.h / 2 - chh / 2], bottom: [h.x + h.w / 2 - cw / 2, h.y + h.h + gap], top: [h.x + h.w / 2 - cw / 2, h.y - gap - chh] };
      const fits = (k) => { const [cx, cy] = cands[k]; return cx >= m && cy >= Y0 && cx + cw <= W - m && cy + chh <= Y1; };
      const order = pref !== 'auto' ? [pref, 'right', 'left', 'bottom', 'top'] : (h.x + h.w / 2 > W / 2 ? ['left', 'bottom', 'top', 'right'] : ['right', 'bottom', 'top', 'left']);
      /* sticky side: a callout keeps its side for the whole step while that side still fits, so it never wanders
         under the pointer as the target grows or the spotlight glides */
      side = st.side && cands[st.side] && fits(st.side) ? st.side : order.find(fits) || order[0];
      st.side = side;
      [x, y] = cands[side];
      x = Math.max(m, Math.min(W - cw - m, x)); y = Math.max(Y0, Math.min(Y1 - chh, y));
      /* never cover the target: if the clamped box still overlaps the hole, park it in the emptiest corner */
      const overlap = !(x + cw < h.x || x > h.x + h.w || y + chh < h.y || y > h.y + h.h);
      if (overlap) { x = h.x + h.w / 2 > W / 2 ? m : W - cw - m; y = h.y + h.h / 2 > H / 2 ? Y0 + 8 : Y1 - chh - 6; side = 'corner'; }
    }
    let nx = Math.round(x), ny = Math.round(y);
    /* within a step the callout holds still while its target only shifts a little (an answer growing, a relabel):
       it moves only when the new place is far off, or where it stands would cover the target or leave the window.
       A callout that slides away as the learner reaches for its button is the worst kind of motion. */
    if (st.cpos && st.cposStep === (st.step && st.step.id) && (Math.abs(st.cpos.x - nx) > 3 || Math.abs(st.cpos.y - ny) > 3)) {
      const ox = st.cpos.x, oy = st.cpos.y;
      const inside = ox >= 8 && oy >= Y0 - 2 && ox + cw <= W - 8 && oy + chh <= Y1 + 2;
      const covers = h && !(ox + cw < h.x || ox > h.x + h.w || oy + chh < h.y || oy > h.y + h.h);
      if (inside && !covers && Math.hypot(ox - nx, oy - ny) < 140) { nx = ox; ny = oy; }
    }
    if (!st.cpos || Math.abs(st.cpos.x - nx) > 3 || Math.abs(st.cpos.y - ny) > 3) { c.style.transform = `translate(${nx}px, ${ny}px)`; st.cpos = { x: nx, y: ny }; }
    st.cposStep = st.step && st.step.id;
    c.setAttribute('data-side', side);
  }
  function placeBar(h) {
    const bar = st.root.querySelector('.o55t-bar'); if (!bar) return;
    if (document.body.classList.contains('pm-home-dragging')) return; /* the bar holds still while something is carried */
    const H = innerHeight, bh = bar.offsetHeight || 44, bottomY = H - bh - 14;
    const hitsBottom = h && h.y + h.h > bottomY - 6;
    bar.classList.toggle('o55t-top', !!hitsBottom);
  }

  /* ------------------------------------------------------------------ the pointer (Show Me) */
  const P = TR.pointer = {
    el: () => st.root.querySelector('.o55t-pointer'),
    pos: null,
    show(x, y) { const p = P.el(); P.pos = { x, y }; p.style.transform = `translate(${x}px, ${y}px)`; p.classList.add('o55t-on'); },
    hide() { const p = P.el(); p.classList.remove('o55t-on', 'o55t-press'); },
    /* travel on a gentle arc; the destination is pre-cued before the pointer leaves */
    async moveTo(x, y, dur) {
      /* the pointer emerges from the Show Me button the learner just pressed (else from the callout's middle) */
      if (!P.pos) { const b = st.root.querySelector('.o55t-callout [data-o55t="showMe"]'), c = (b || st.root.querySelector('.o55t-callout')).getBoundingClientRect(); P.show(c.left + c.width / 2, c.top + c.height / 2); await M.delay(80); }
      const from = Object.assign({}, P.pos), dist = Math.hypot(x - from.x, y - from.y), mx = (from.x + x) / 2, my = Math.min(from.y, y) - Math.min(120, dist * 0.25);
      /* like a hand: time grows with distance (Fitts), speed up then settle into the target, in the family's manner */
      const fam = family(), d = dur || Math.round(Math.min(760, Math.max(420, 360 + dist * 0.32)));
      const ease = fam === 'retro' ? M.ease.steps(8) : fam === 'friendly' ? M.ease.handSpring : fam === 'glass' ? M.ease.handGlide : M.ease.hand;
      await new Promise((res) => {
        M.tween({ from: 0, to: 1, duration: fam === 'glass' ? Math.round(d * 1.12) : d, ease, ignoreReduced: false, onUpdate: (t) => {
          if (st.show && st.show.cancelled) return;
          const px = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * mx + t * t * x, py = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * my + t * t * y;
          P.pos = { x: px, y: py }; P.el().style.transform = `translate(${px}px, ${py}px)`;
        } }).finished.then(res);
      });
    },
    async press(on) { P.el().classList.toggle('o55t-press', on !== false); await M.delay(on === false ? 60 : 140); }
  };
  const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  TR.center = center;
  /* Show Me helpers: every action goes through the real control or the real handler */
  const SM = TR.sm = {
    cancelled: () => !st.show || st.show.cancelled,
    wait: (ms) => M.delay(ms),
    async cue(el) { if (!el) return; el.classList.add('o55t-cue'); await M.delay(360); el.classList.remove('o55t-cue'); },
    async click(el, o) {
      if (!el || SM.cancelled()) return false;
      el.scrollIntoView && el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      /* the destination is cued as the pointer sets off, not before: the glow and the travel overlap */
      SM.cue(el); await M.delay(90); if (SM.cancelled()) return false;
      const c = center(el); await P.moveTo(c.x, c.y); if (SM.cancelled()) return false;
      await P.press(true); O55.sound.play('tap');
      const opts = { bubbles: true, cancelable: true, clientX: c.x, clientY: c.y, button: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true };
      el.dispatchEvent(new PointerEvent('pointerdown', opts)); el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', opts)); el.dispatchEvent(new MouseEvent('mouseup', opts));
      if (!(o && o.noClick)) el.click();
      await P.press(false);
      return true;
    },
    /* a real drag: pointerdown on the grip, a stream of pointermoves, pointerup at the destination */
    async drag(el, to, o) {
      if (!el || SM.cancelled()) return false;
      const a = center(el); SM.cue(el); await M.delay(90); await P.moveTo(a.x, a.y); if (SM.cancelled()) return false;
      await P.press(true); O55.sound.play('pickup');
      const base = { bubbles: true, cancelable: true, button: 0, buttons: 1, pointerId: 7, pointerType: 'mouse', isPrimary: true };
      el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: a.x, clientY: a.y }, base)));
      const span = Math.hypot(to.x - a.x, to.y - a.y), steps = (o && o.steps) || 42, dur = (o && o.dur) || Math.round(Math.min(1500, Math.max(900, 700 + span * 0.5)));
      const mx = (a.x + to.x) / 2, my = Math.min(a.y, to.y) - 60;
      for (let i = 1; i <= steps; i++) {
        if (SM.cancelled()) break;
        const t = (family() === 'retro' ? M.ease.steps(12) : M.ease.hand)(i / steps), x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * to.x, y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * to.y;
        P.pos = { x, y }; P.el().style.transform = `translate(${x}px, ${y}px)`;
        const tgt = document.elementFromPoint(x, y) || document;
        tgt.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x, clientY: y }, base)));
        await M.delay(dur / steps);
      }
      /* dwell on the destination the way a hand does: the workspace adopts a new drop target only after
         it has held for two frames, so a few small moves across several frames let the preview settle */
      for (let j = 0; j < 4 && !SM.cancelled(); j++) {
        const x = to.x + (j % 2), y = to.y + j * 0.5;
        (document.elementFromPoint(x, y) || document).dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x, clientY: y }, base)));
        await M.delay(48);
      }
      await M.delay(260); /* the destination has reacted (preview) before the drop */
      const end = document.elementFromPoint(to.x, to.y) || document;
      end.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: to.x, clientY: to.y }, base, { buttons: 0 })));
      await P.press(false); O55.sound.play('drop');
      return true;
    },
    async type(el, text) {
      if (!el || SM.cancelled()) return false;
      await SM.click(el, { noClick: true }); el.focus();
      for (const ch of text) { if (SM.cancelled()) return false; el.value += ch; el.dispatchEvent(new Event('input', { bubbles: true })); await M.delay(18); }
      return true;
    }
  };
  async function showMe() {
    const s = st.step; if (!s || !s.showMe || st.show) return;
    st.show = { cancelled: false };
    st.root.setAttribute('data-showme', 'true');
    O55.sound.play('spot');
    try { await s.showMe(SM, st); } catch (err) { console.warn('O55 tour: Show Me stopped', err); }
    await M.delay(600); /* settle: the result stays visible while the guide names the change */
    st.show = null; st.root.removeAttribute('data-showme'); P.hide();
  }
  function interruptShow() {
    if (!st.show) return;
    st.show.cancelled = true; st.show = null; st.root.removeAttribute('data-showme'); P.hide();
    U.announce(T('tour.controls.interrupted'), st.root);
  }

  /* ------------------------------------------------------------------ step flow */
  async function goStep(i, o) {
    o = o || {};
    /* one transition at a time: a newer one (Back pressed as a step arrives) makes this one stand down after its
       awaits, and Back waits for the step to settle */
    const my = ++st.seq; st.entering = true;
    /* the old step's loop stops first: while the new step's enter() runs (a page change, a card growing in) nothing
       may measure or place against a half-built layout */
    if (st.poll) { st.poll.cancel(); st.poll = null; }
    const prev = st.step;
    if (prev && prev.leave) { try { prev.leave(st); } catch (_) {} }
    if (i >= TR.defs.length) return finish(false);
    st.step = TR.defs[Math.max(0, i)]; st.sess.index = st.step.index; st.missing = false; st.missingSince = 0; st.advancing = false; st.lastReady = undefined; st.side = null; st.fixed = null;
    if (!o.back) st.entries[st.step.id] = entrySnap();
    save();
    O55.sound.setContext({ chapter: 'tour', step: st.step.index });
    if (st.step.enter) { try { await st.step.enter(st, o); } catch (err) { console.warn('O55 tour: enter failed', st.step.id, err); } }
    if (my !== st.seq) return;
    await stillTarget(); /* a page that slides in, a card that grows: place against where things come to rest */
    if (my !== st.seq) return;
    renderBar(); renderCallout(true);
    if (!o.silent) O55.sound.play(st.step.kind === 'info' ? 'spot' : 'step');
    U.announce(T('tour.bar.progress', { n: CHAPTERS.indexOf(st.step.chapter) + 1, name: T('tour.chapters.' + st.step.chapter), s: TR.defs.filter((d) => d.chapter === st.step.chapter).indexOf(st.step) + 1, total: TR.defs.filter((d) => d.chapter === st.step.chapter).length }) + '. ' + copy(st.step.id, 'title'), st.root);
    watch();
    st.entering = false;
    if (st.pendingBack) { st.pendingBack = false; back(); }
  }
  /* wait (up to 700 ms) until the step's target holds the same rectangle for two frames running */
  async function stillTarget() {
    let prev = null; const t0 = performance.now();
    while (performance.now() - t0 < 700) {
      await new Promise((r) => requestAnimationFrame(r));
      const el = targetEl(); if (!el) return;
      const r = el.getBoundingClientRect(), k = [r.left, r.top, r.width, r.height].map(Math.round).join();
      if (k === prev) return; prev = k;
    }
  }
  /* one loop: re-measure the target (it may move), check the success predicate, notice a missing target */
  function watch() {
    if (st.poll) st.poll.cancel();
    const tick = () => {
      if (!TR.running || st.paused) { st.poll = M.after(250, tick); return; }
      const s = st.step, el = targetEl();
      /* a surface being dragged is hidden by the workspace on purpose; that is never a missing target */
      if (s.target && !el && !document.body.classList.contains('pm-home-dragging')) { if (!st.missingSince) st.missingSince = performance.now(); if (!st.missing && performance.now() - st.missingSince > 1600) { st.missing = true; renderCallout(true); } }
      else { st.missingSince = 0; if (st.missing) { st.missing = false; renderCallout(false); } }
      if (s.tick) { try { s.tick(st); } catch (_) {} }
      if (s.kind === 'info' && s.ready) { const r = !!s.ready(st); if (r !== st.lastReady) { st.lastReady = r; renderCallout(false); } }
      place(false); /* the spring retargets in flight; the callout is placed against the destination */
      if (s.kind === 'action' && !st.sess.done.includes(s.id) && !st.advancing) {
        let ok = false; try { ok = !!s.done(st); } catch (_) {}
        if (ok) complete(s);
      }
      st.poll = M.after(140, tick);
    };
    st.poll = M.after(140, tick);
    /* a command receipt (a panel moved, a widget placed) re-checks at once, so success is acknowledged in the frame
       the app confirms it rather than at the next poll */
    st.kick = () => { if (!TR.running || st.paused) return; if (st.poll) st.poll.cancel(); tick(); };
  }
  window.addEventListener('pm:dispatch-receipt', () => { if (st.kick && TR.running) queueMicrotask(st.kick); });
  /* success: acknowledge in the same frame, show the "after" line, then move on (the advance guard stops doubles) */
  function complete(s) {
    if (st.advancing) return; st.advancing = true;
    if (!st.sess.done.includes(s.id)) st.sess.done.push(s.id);
    save(); O55.sound.play('step'); renderBar(); renderCallout(false);
    const hold = s.after ? 2200 : 900;
    st.root.querySelector('.o55t-callout').classList.add('o55t-success');
    M.after(hold, () => { const c = st.root.querySelector('.o55t-callout'); c.classList.remove('o55t-success'); if (TR.running && st.step === s && !s.stay && !st.rewinding && !st.entering) goStep(s.index + 1); else st.advancing = false; });
  }
  TR.complete = () => st.step && complete(st.step);

  function onClick(e) {
    if (st.lookOpen && !e.target.closest('.o55t-lookslot')) { st.lookOpen = false; renderBar(); }
    const b = e.target.closest('[data-o55t]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.getAttribute('data-o55t'), arg = b.getAttribute('data-arg');
    if (st.entering && (a === 'next' || a === 'showMe' || a === 'skipStep')) return; /* the new step's own controls come with it */
    if (a === 'next') { O55.sound.play('next'); if (st.step.onNext) st.step.onNext(st); return goStep(st.step.index + 1); }
    if (a === 'back') { O55.sound.play('back'); return back(); }
    if (a === 'showMe') return showMe();
    if (a === 'skip') return skip();
    if (a === 'pause') return togglePause();
    if (a === 'tips') { st.tips = arg; st.sess.tips = arg; save(); O55.sound.play('select'); renderBar(); renderCallout(false); return; }
    if (a === 'sound') { O55.sound.toggle('tour'); renderBar(); return; }
    /* the look, after setup: saved through Settings at once (the tour follows the change) */
    if (a === 'lookMenu') { st.lookOpen = !st.lookOpen; renderBar(); return; }
    if (a === 'lookFamily') { O55.lookMenu.save(arg, O55.theme().mode); return; }
    if (a === 'lookMode') { O55.lookMenu.save(O55.theme().family, arg); return; }
    if (a === 'takeMe') { if (st.step.goTo) st.step.goTo(st); st.missing = false; st.missingSince = 0; renderCallout(false); return; }
    if (a === 'skipStep') return goStep(st.step.index + 1);
    if (a === 'finish') return finish(arg === 'keep');
    if (st.step && st.step.actions && st.step.actions[a]) return st.step.actions[a](st, arg, b);
  }
  /* ------------------------------------------------------------------ Back rewinds */
  /* How the app looked when a step began, before its enter(): Chat's place, the dashboard's widgets, the page, the
     guided conversation (persona, ELI5, the exchanges so far) and the practice plan. Back puts the app back to that, and
     the step and every later one are undone, so the step can be done again or watched with Show Me. */
  function entrySnap() {
    const api = window.PM_HOME_WORKSPACE, chat = api && api.layout ? api.layout.surfaces.find((x) => x.surface_kind === 'chat') : null;
    const tab = document.querySelector('.page-tab.active[data-page]');
    return { chat: chat ? { host: chat.host, visible: !!chat.visible } : null, widgets: dashSnapshot(), page: tab ? tab.getAttribute('data-page') : null,
      talk: TR.chat && TR.chat.mark ? TR.chat.mark() : null, practice: TR.practice && TR.practice.mark ? TR.practice.mark() : null };
  }
  function openPage(p) {
    const cur = document.querySelector('.page-tab.active[data-page]');
    if (!p || (cur && cur.getAttribute('data-page') === p)) return;
    const t = document.querySelector(`.page-tab[data-page="${p}"]`) || document.querySelector(`#pageTabsMoreMenu .pm6-tb-pages-more-item[data-page="${p}"]`);
    if (t) t.click();
  }
  async function rewind(e) {
    const api = window.PM_HOME_WORKSPACE;
    if (TR.practice && TR.practice.rewind) TR.practice.rewind(e.practice);
    openPage(e.page);
    if (TR.chat && TR.chat.rewind) await TR.chat.rewind(e.talk);
    if (api && e.chat) {
      const now = api.layout.surfaces.find((x) => x.surface_kind === 'chat');
      if (now && now.host !== e.chat.host) { try { api.moveSurface('chat', e.chat.host); } catch (_) {} }
      if (now && !!now.visible !== e.chat.visible) { try { api.setSurfaceVisible('chat', e.chat.visible, 'cmd.panel.switch'); } catch (_) {} }
    }
    if (e.widgets && JSON.stringify(dashSnapshot()) !== JSON.stringify(e.widgets)) await dashRestore(e.widgets);
    await M.delay(120);
  }
  async function back() {
    const cur = st.step; if (!cur || cur.index === 0 || st.rewinding) return;
    if (st.entering) { st.pendingBack = true; return; }
    st.rewinding = true; interruptShow();
    if (st.poll) { st.poll.cancel(); st.poll = null; }
    const to = TR.defs[cur.index - 1], e = st.entries[to.id];
    st.sess.done = st.sess.done.filter((id) => TR.byId[id] && TR.byId[id].index < to.index);
    try { if (e) await rewind(e); } catch (err) { console.warn('O55 tour: rewind failed', to.id, err); }
    st.rewinding = false;
    return goStep(to.index, { back: true });
  }
  TR.back = back;

  function togglePause() {
    st.paused = !st.paused; st.root.toggleAttribute('data-paused', st.paused);
    if (st.paused) interruptShow();
    renderBar(); O55.sound.play(st.paused ? 'toggleOff' : 'toggleOn');
  }
  function save() { O55.store.set(KEY, { v: 1, status: st.sess.status, index: st.sess.index, done: st.sess.done, tips: st.tips, started: st.sess.started, project: st.sess.project, chatTucked: !!st.sess.chatTucked, snap: st.snap, entries: st.entries }); }

  /* ------------------------------------------------------------------ lifecycle */
  TR.start = async function start(o) {
    o = o || {};
    if (O55.S && O55.S.open) O55.ui.close('done');
    const saved = O55.store.get(KEY, null);
    const resume = !o.fresh && saved && saved.status === 'running' && typeof saved.index === 'number';
    build(); syncTheme();
    st.sess = resume ? { status: 'running', index: saved.index, done: saved.done || [], started: saved.started, project: saved.project || o.project || null, chatTucked: !!saved.chatTucked } : { status: 'running', index: 0, done: [], started: new Date().toISOString(), project: o.project || null };
    st.tips = (resume && saved.tips) || 'normal';
    /* a new run starts clean: nothing the last run sent, answered or planned counts as done */
    if (!resume) { if (TR.chat && TR.chat.reset) TR.chat.reset(); if (TR.practice && TR.practice.reset) TR.practice.reset(); }
    st.entries = resume && saved.entries ? saved.entries : {};
    st.snap = resume && saved.snap ? saved.snap : snapshot();
    st.counters = TR.counters();
    TR.running = true; st.paused = false;
    document.documentElement.setAttribute('data-o55-tour', 'true');
    if (window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.pause) { try { window.PM_DEMO.clock.pause(); st.pausedClock = true; } catch (_) {} }
    TR.chat && TR.chat.install();
    st.root.hidden = false; st.root.classList.add('o55t-opening');
    M.after(700, () => st.root && st.root.classList.remove('o55t-opening'));
    O55.sound.play('open');
    window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: resume ? 'resumed' : 'started' } }));
    await goStep(st.sess.index, { silent: true });
    if (o.from) morphIn(o.from);
    return true;
  };
  /* the handoff from onboarding: a plain surface leaves the onboarding window's rectangle and settles into the first
     callout's, then the callout's words fade in as the surface fades away. Stepped in Retro; a fade under Reduced
     Motion (the callout's own). */
  function morphIn(from) {
    const c = st.root.querySelector('.o55t-callout'); if (!c || !from || !from.width || O55.motion.reduced() || !st.cpos) return;
    const to = { left: st.cpos.x, top: st.cpos.y, width: c.offsetWidth, height: c.offsetHeight };
    c.style.transition = 'none'; c.style.transform = `translate(${to.left}px, ${to.top}px)`; void c.offsetWidth; c.style.removeProperty('transition');
    c.classList.add('o55t-morphing');
    const g = document.createElement('div'); g.className = 'o55t-morph'; g.setAttribute('aria-hidden', 'true'); st.root.appendChild(g);
    const retro = family() === 'retro', radius = getComputedStyle(c).borderRadius || '14px';
    const a = g.animate([
      { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', borderRadius: retro ? '0px' : '22px' },
      { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: to.height + 'px', borderRadius: radius }
    ], { duration: 640, easing: retro ? 'steps(6, end)' : 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' });
    O55.sound.play('spot');
    a.finished.then(() => {
      c.classList.remove('o55t-morphing');
      g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease', fill: 'forwards' }).finished.then(() => g.remove());
    }).catch(() => { c.classList.remove('o55t-morphing'); g.remove(); });
  }
  async function end(status, keep, o) {
    TR.running = false; if (st.poll) st.poll.cancel(); interruptShow();
    if (st.step && st.step.leave) { try { st.step.leave(st); } catch (_) {} }
    const res = await restore(st.snap, keep);
    /* Chat tucked away by the tour on a phone-width window comes back either way; the learner never hid it */
    if (keep && st.sess.chatTucked && window.PM_HOME_WORKSPACE) { try { window.PM_HOME_WORKSPACE.setSurfaceVisible('chat', true, 'cmd.panel.switch'); } catch (_) {} }
    TR.chat && TR.chat.uninstall();
    st.sess.status = status; st.sess.restored = res; O55.store.set(KEY, { v: 1, status, done: st.sess.done, finished: new Date().toISOString(), keep: !!keep, restored: res });
    document.documentElement.removeAttribute('data-o55-tour');
    if (st.pausedClock && window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.resume) { try { window.PM_DEMO.clock.resume(); } catch (_) {} }
    st.root.classList.add('o55t-closing'); if (!(o && o.silent)) O55.sound.play(status === 'done' ? 'finish' : 'close');
    M.after(360, () => { st.root.hidden = true; st.root.classList.remove('o55t-closing'); st.step = null; st.hole = null; });
    return res;
  }
  /* a toast that belongs to the page (the tour root and the onboarding window may both be gone) */
  O55.pageToast = function pageToast(text, ms) {
    let el = document.getElementById('o55-pagetoast');
    if (!el) { el = document.createElement('div'); el.id = 'o55-pagetoast'; el.className = 'o55-pagetoast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = text; el.classList.remove('o55-on'); void el.offsetWidth; el.classList.add('o55-on');
    M.after(ms || 4200, () => el.classList.remove('o55-on'));
  };
  async function skip() {
    await end('skipped', false);
    O55.pageToast(T('tour.skipped'));
    window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: 'skipped' } }));
  }
  async function finish(keep) {
    const res = await end('done', keep);
    /* land on the real Planning Wizard with the Project selected; nothing starts */
    if (st.sess.project && O55.shell) O55.shell.selectProject(st.sess.project, null);
    O55.shell && O55.shell.openWizard();
    if (res && (res.layout === 'failed' || res.widgets === 'failed')) O55.pageToast(T('tour.restoreFailed'));
    TR.landing && TR.landing();
    window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: 'finished', keep: !!keep, restored: res } }));
  }
  /* Run Onboarding Again: the tour starts over too. A running tour ends (the layout comes back); its saved progress,
     its resume chip and what it remembers of the last run go. */
  TR.reset = async function reset(o) {
    if (TR.running) await end('skipped', false, o);
    O55.store.clear(KEY);
    st.entries = {};
    if (TR.chat && TR.chat.reset) TR.chat.reset();
    if (TR.practice && TR.practice.reset) TR.practice.reset();
    const chip = document.getElementById('o55-tourchip'); if (chip) chip.remove();
  };
  TR.skip = skip; TR.finish = finish; TR.go = (id) => goStep(TR.byId[id].index);
  TR.state = () => ({ running: TR.running, step: st.step && st.step.id, done: st.sess ? st.sess.done.slice() : [], paused: st.paused, tips: st.tips });

  /* zero-usage proof: the counters a provider call or usage write would move */
  TR.counters = function counters() {
    const d = window.PM_DEMO;
    return { ledger: d && d.state && d.state.usage && d.state.usage.ledger ? d.state.usage.ledger.length : null, context: d && d.state && d.state.chat && d.state.chat.context ? d.state.chat.context.used : null, fetches: window.__o55net ? window.__o55net.count : null };
  };
  /* count network requests from page start (a guided example must make none) */
  if (!window.__o55net) {
    window.__o55net = { count: 0 };
    const f = window.fetch; if (f) window.fetch = function () { window.__o55net.count++; return f.apply(this, arguments); };
    const X = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function () { window.__o55net.count++; return X.apply(this, arguments); };
  }
  TR.audit = () => ({ before: st.counters, after: TR.counters() });

  /* The activity-bar Chat icon. The shell's handler picks its branch by the icon's title, which the hover-tag layer
     moves aside on first hover, so a real click fell through to the side-panel branch and hid the Files panel
     instead of showing Chat. The icon is wired to the real command (cmd.panel.switch) and the old branch never
     runs. Production impact recorded in REPORT.md. */
  document.addEventListener('click', (e) => {
    const icon = e.target && e.target.closest ? e.target.closest('#activityBar .icon[data-ab-id="chat"]') : null;
    if (!icon) return;
    const api = window.PM_HOME_WORKSPACE; if (!api || !api.layout) return;
    e.stopPropagation();
    const shown = !!(api.layout.surfaces.find((s) => s.surface_kind === 'chat') || {}).visible;
    api.setSurfaceVisible('chat', !shown, 'cmd.panel.switch');
    icon.classList.toggle('active', !shown);
  }, true);
  /* the icon's lit state follows Chat however it was shown or hidden (its own close button, a layout restore) */
  const syncChatIcon = () => {
    const icon = document.querySelector('#activityBar .icon[data-ab-id="chat"]'), api = window.PM_HOME_WORKSPACE;
    if (icon && api && api.layout) icon.classList.toggle('active', !!(api.layout.surfaces.find((s) => s.surface_kind === 'chat') || {}).visible);
  };
  window.addEventListener('pm:dispatch-receipt', () => setTimeout(syncChatIcon, 0));

  /* keep the look in step while the tour runs */
  new MutationObserver(() => { if (TR.running) { syncTheme(); TR.refresh(); if (st.lookOpen) renderBar(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
