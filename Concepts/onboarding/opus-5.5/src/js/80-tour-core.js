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
  /* Concept-only restoration basis lives in memory. The durable checkpoint contains a bounded reference and
     owner identities, never composer text, inline layout or per-step DOM snapshots. A reload without the basis
     stays unavailable until the person explicitly acknowledges recovery. */
  const recovery = new Map();
  const st = TR.st = { sess: null, root: null, step: null, advancing: false, show: null, hole: null, spring: null, poll: null, raf: 0, snap: null, missingSince: 0, tips: 'normal', paused: false, entries: {}, rewinding: false, entering: false, ending: false, pendingBack: false, seq: 0 };
  const CHAPTERS = ['ask', 'workspace', 'plan'];
  TR.CHAPTERS = CHAPTERS;

  /* ------------------------------------------------------------------ hooks */
  /* A skin follows the tour without the engine knowing it (NieR Mode, 85-tour-nier.js): TR.on(name, fn(d, st)) ->
     off. Moments: build {root} · look (the style below, filled in place) · start {resume, from} (may hold the first
     step: return a promise) · arrive {step, prev, index, chapterChanged, forward, back, silent, first, sound} before
     the callout is drawn (a listener may set d.hold and return a promise: the spotlight moves on and the callout
     waits; d.sound is the arrival's sound event, 'callout') ·
     step {same} once it is drawn · callout {step, missing, done, count, tryLabel, pod} (fill d.pod with markup for
     the callout, before its buttons) · render {focus} · bar {chapter, ci, si, total, pip} (d.pip[chapter]: markup
     after that chapter's ticks) · target {el, prev} · complete {step} · showMe {step} · showMeEnd (hold: the
     pointer comes home first) · showMeDone · cue {el} · press {el, x, y} · pointerFrom {at} · missing {on} ·
     interrupt · pause {paused} · ending {status, keep, silent, hush} (hold, alongside the restore; hush: true keeps
     the app's own notices quiet while the restore runs) · end {status, keep} (status 'restore-pending' when the
     layout could not go back and the tour stays) · closed (the root has gone) · landing {lead} (hold, then the note)
     · landed {note} · unland {note} (the note's exit: a listener that returns a promise plays it; else a fade) ·
     barMove {top} (the bar moved between the bottom and the top) · missing {on, sound} (sound: the event that marks
     it, 'missing'; a listener may change it). A listener that throws is logged and skipped. */
  const hooks = {};
  TR.on = (name, fn) => { (hooks[name] = hooks[name] || []).push(fn); return () => { hooks[name] = (hooks[name] || []).filter((f) => f !== fn); }; };
  function emit(name, d) {
    const out = [];
    (hooks[name] || []).slice().forEach((fn) => { try { const r = fn(d, st); if (r != null) out.push(r); } catch (err) { console.warn('O55 tour: hook failed', name, err); } });
    return out;
  }
  /* what the listeners returned, waited for at most cap ms on the motion clock */
  function settle(out, cap) {
    const ps = out.filter((p) => p && typeof p.then === 'function');
    return ps.length ? Promise.race([Promise.all(ps.map((p) => p.catch(() => null))), M.delay(cap)]) : Promise.resolve();
  }
  TR.emit = emit; TR.settle = settle;
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
  /* The Home dashboard's cards by host, in order, with their sizes. This in-memory basis does not survive a reload. */
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
    if (!snap) return { layout: 'failed', widgets: 'failed', chat: { status: 'failed', reason: 'snapshot_unavailable' } };
    const api = window.PM_HOME_WORKSPACE;
    if (!keep && snap.layout) {
      if (!api || !api.o55RestoreSnapshot) out.layout = 'failed';
      else {
        try { const r = api.o55RestoreSnapshot(snap.layout); out.layout = r && r.ok ? (r.result && r.result.command ? r.result.command.command_id : 'ok') : 'failed'; }
        catch (_) { out.layout = 'failed'; }
      }
    }
    if (!keep && snap.widgets) { try { out.widgets = await dashRestore(snap.widgets); } catch (_) { out.widgets = 'failed'; } }
    out.chat = TR.chat ? await TR.chat.restore(snap, keep) : { status: 'failed', reason: 'chat_owner_unavailable' };
    if (out.layout !== 'failed' && out.widgets !== 'failed' && out.chat.status === 'restored' && TR.practice) TR.practice.remove();
    return out;
  }
  TR.snapshot = snapshot;

  /* ------------------------------------------------------------------ DOM */
  function build() {
    if (st.root) return st.root;
    const r = document.createElement('div');
    r.id = ROOT; r.className = 'o55t-root'; r.hidden = true; r.setAttribute('data-pm-hover-exempt', 'true');
    r.innerHTML = `<svg class="o55t-scrim" aria-hidden="true"><path class="o55t-scrimpath" fill-rule="evenodd"/></svg>`
      /* the spotlight's ring: a glow of two wide faint strokes under the line (no filter, so it ports to Slint as three
         strokes) in a small box of its own that rides with the hole */
      + `<div class="o55t-ringbox" aria-hidden="true" hidden><svg class="o55t-ringsvg" width="100%" height="100%"><rect class="o55t-halo o55t-halo2" rx="12" ry="12"/><rect class="o55t-halo" rx="12" ry="12"/><rect class="o55t-ring" rx="12" ry="12"/>`
      /* Basic and Retro march their dashes: the same dashed outline at successive offsets, shown one after another by
         a stepped opacity animation (the compositor runs it; an animated dash offset repaints on the main thread) */
      + Array.from({ length: 15 }, (_, k) => `<rect class="o55t-ph${k < 4 ? ' o55t-ph4' : ''}${k === 0 ? ' o55t-ph0' : ''}" rx="12" ry="12" style="--k:${k}"/>`).join('') + `</svg></div>`
      + `<div class="o55t-shield" aria-hidden="true"></div>`
      + `<div class="o55t-zone" aria-hidden="true"><span class="o55t-zonelabel"><svg viewBox="0 0 20 20" width="16" height="16"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      + `<span class="o55t-zl-idle">${U.esc(T('tour.steps.move_or_dock_chat.zone'))}</span><span class="o55t-zl-hot">${U.esc(T('tour.steps.move_or_dock_chat.zoneHot'))}</span></span></div>`
      + `<div class="o55t-callout" role="dialog" aria-modal="false" aria-labelledby="o55t-h"></div>`
      + `<div class="o55t-bar" role="toolbar" aria-label="${U.esc(T('tour.bar.label'))}"></div>`
      /* one pointer per family, every glyph drawn with its hotspot at (6, 3): a drafting crosshair (Basic), a cartoon
         glove (Friendly), a glowing orb with a trail (Glass), a pixel hand (Retro) */
      + `<div class="o55t-pointer" aria-hidden="true"><svg viewBox="0 0 32 32" width="30" height="30" overflow="visible">`
      + `<defs><radialGradient id="o55t-orb" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fff"/><stop offset="0.45" class="o55t-orb-mid"/><stop offset="1" class="o55t-orb-edge"/></radialGradient>`
      + `<radialGradient id="o55t-orbglow"><stop offset="0.35" class="o55t-orb-halo0"/><stop offset="1" class="o55t-orb-halo1"/></radialGradient></defs>`
      + `<g class="o55t-ptr o55t-pg-basic"><circle cx="6" cy="3" r="6.5" class="o55t-pg-ring"/><path class="o55t-pg-line" d="M6 -8.5V-2M6 8v6.5M-5.5 3h6.5M11 3h6.5"/><circle cx="6" cy="3" r="1.5" class="o55t-pg-dot"/></g>`
      + `<g class="o55t-ptr o55t-pg-friendly"><path class="o55t-pg-gloveshade" transform="translate(2 3)" d="M3.5 15V6a2.5 2.5 0 0 1 5 0v6.2a1.8 1.8 0 0 1 3.6.3a1.8 1.8 0 0 1 3.5.5a1.7 1.7 0 0 1 3.3.8V20c0 2.6-2.2 4.2-5 4.2H8.6c-2.4 0-3.6-1.4-4.4-3L1.2 17.4c-.8-1.3.8-2.8 2.3-1.6z"/><path class="o55t-pg-glove" d="M3.5 15V6a2.5 2.5 0 0 1 5 0v6.2a1.8 1.8 0 0 1 3.6.3a1.8 1.8 0 0 1 3.5.5a1.7 1.7 0 0 1 3.3.8V20c0 2.6-2.2 4.2-5 4.2H8.6c-2.4 0-3.6-1.4-4.4-3L1.2 17.4c-.8-1.3.8-2.8 2.3-1.6z"/><path class="o55t-pg-crease" d="M8.5 12.6v2.9M12.1 12.8v2.4M15.6 13.2v2.2"/><rect class="o55t-pg-cuff" x="6.2" y="24" width="11.6" height="4.6" rx="1.6"/></g>`
      + `<g class="o55t-ptr o55t-pg-glass"><circle cx="6" cy="3" r="16" fill="url(#o55t-orbglow)"/><circle cx="6" cy="3" r="7" fill="url(#o55t-orb)"/><circle cx="3.8" cy="0.6" r="2" fill="#fff" opacity="0.85"/></g>`
      + `<g class="o55t-ptr o55t-pg-retro" shape-rendering="crispEdges"><rect x="5" y="3" width="2" height="2"/><rect x="5" y="5" width="2" height="2"/><rect x="5" y="7" width="2" height="2"/><rect x="5" y="9" width="2" height="2"/><rect x="7" y="9" width="2" height="2"/><rect x="9" y="9" width="2" height="2"/><rect x="11" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/><rect x="15" y="9" width="2" height="2"/><rect x="3" y="11" width="2" height="2"/><rect x="5" y="11" width="2" height="2"/><rect x="7" y="11" width="2" height="2"/><rect x="9" y="11" width="2" height="2"/><rect x="11" y="11" width="2" height="2"/><rect x="13" y="11" width="2" height="2"/><rect x="15" y="11" width="2" height="2"/><rect x="17" y="11" width="2" height="2"/><rect x="3" y="13" width="2" height="2"/><rect x="5" y="13" width="2" height="2"/><rect x="7" y="13" width="2" height="2"/><rect x="9" y="13" width="2" height="2"/><rect x="11" y="13" width="2" height="2"/><rect x="13" y="13" width="2" height="2"/><rect x="15" y="13" width="2" height="2"/><rect x="17" y="13" width="2" height="2"/><rect x="5" y="15" width="2" height="2"/><rect x="7" y="15" width="2" height="2"/><rect x="9" y="15" width="2" height="2"/><rect x="11" y="15" width="2" height="2"/><rect x="13" y="15" width="2" height="2"/><rect x="15" y="15" width="2" height="2"/><rect x="17" y="15" width="2" height="2"/><rect x="5" y="17" width="2" height="2"/><rect x="7" y="17" width="2" height="2"/><rect x="9" y="17" width="2" height="2"/><rect x="11" y="17" width="2" height="2"/><rect x="13" y="17" width="2" height="2"/><rect x="15" y="17" width="2" height="2"/><rect x="5" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="7" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="9" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="11" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="13" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="15" y="19" width="2" height="2" class="o55t-pg-cuff"/><rect x="5" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="7" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="9" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="11" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="13" y="21" width="2" height="2" class="o55t-pg-cuff"/><rect x="15" y="21" width="2" height="2" class="o55t-pg-cuff"/></g>`
      + `</svg><span class="o55t-trail"></span></div>`
      + `<div class="o55-live" aria-live="polite" role="status"></div>`;
    document.body.appendChild(r);
    st.root = r;
    r.addEventListener('click', onClick);
    /* Escape closes the look menu first (focus back on its button); with no menu open it pauses */
    ['keydown', 'keyup', 'keypress'].forEach((ev) => r.addEventListener(ev, (e) => {
      e.stopPropagation();
      if (ev !== 'keydown' || e.key !== 'Escape') return;
      e.preventDefault();
      if (st.lookOpen) { lookMenu(false); const b = r.querySelector('.o55t-bar [data-o55t="lookMenu"]'); if (b) b.focus({ preventScroll: true }); return; }
      togglePause();
    }));
    /* any real input during Show Me hands control back at once */
    ['pointerdown', 'keydown', 'wheel'].forEach((ev) => document.addEventListener(ev, (e) => { if (st.show && e.isTrusted && !r.contains(e.target)) interruptShow(); }, true));
    window.addEventListener('resize', () => { if (TR.running) { st.fixed = null; place(true); } });
    document.addEventListener('visibilitychange', () => { if (st.root) st.root.toggleAttribute('data-hidden', document.hidden); });
    emit('build', { root: r });
    return r;
  }
  const family = () => O55.theme().family;
  /* the tour's style for the look on screen: the spotlight's corner radius, how it glides ('spring' or 'steps'), how
     the Show Me pointer travels and drags (null: the family's way) and the sound of its press; a skin may change it */
  function syncTheme() {
    if (!st.root) return; const th = O55.theme(); st.root.setAttribute('data-family', th.family); st.root.setAttribute('data-mode', th.mode);
    st.look = { radius: 14, glide: 'spring', travel: null, drag: null, press: 'tap' };
    emit('look', st.look);
  }

  /* ------------------------------------------------------------------ bar */
  /* The bar is morphed, not rewritten: the control that has focus (a look row toggled by keyboard, the look button a
     dialog will hand focus back to) is the same element after every redraw, and its tick blink keeps its phase. */
  function renderBar() {
    const bar = st.root.querySelector('.o55t-bar'), s = st.step, ch = s ? s.chapter : 'ask';
    const ci = CHAPTERS.indexOf(ch), inCh = TR.defs.filter((d) => d.chapter === ch), si = inCh.indexOf(s);
    /* brand: markup a skin adds at the end of the bar's name (its short form on a narrow window) */
    const deco = { chapter: ch, ci, si, total: inCh.length, pip: {}, brand: '' };
    emit('bar', deco);
    const pips = CHAPTERS.map((c, i) => {
      const steps = TR.defs.filter((d) => d.chapter === c);
      const ticks = steps.map((d) => `<i class="o55t-tick${st.sess.done.includes(d.id) ? ' o55t-on' : ''}${d === s ? ' o55t-cur' : ''}"></i>`).join('');
      return `<span class="o55t-pip${i < ci ? ' o55t-done' : i === ci ? ' o55t-cur' : ''}" title="${U.esc(T('tour.chapters.' + c))}"><span class="o55t-pipname">${U.esc(T('tour.chapters.' + c))}</span><span class="o55t-ticks">${ticks}</span>${deco.pip[c] || ''}</span>`;
    }).join('');
    U.morph(bar, `<span class="o55t-brand">${O55.c.small('spark', 14)}<span>${U.esc(T('tour.bar.label'))}</span>${deco.brand}</span><span class="o55t-pips" aria-label="${U.esc(T('tour.bar.progress', { n: ci + 1, name: T('tour.chapters.' + ch), s: si + 1, total: inCh.length }))}">${pips}</span>`
      + `<span class="o55t-seg" role="radiogroup" aria-label="${U.esc(T('tour.bar.tips'))}"><span class="o55t-seglabel">${U.esc(T('tour.bar.tips'))}</span>`
      + ['normal', 'eli5'].map((v) => `<button type="button" role="radio" aria-checked="${st.tips === v}" class="${st.tips === v ? 'o55t-on' : ''}" data-o55t="tips" data-arg="${v}" data-pm-hover-exempt="true">${U.esc(T('tour.bar.' + v))}</button>`).join('') + '</span>'
      + `<button type="button" class="o55t-barbtn" data-o55t="pause" data-pm-hover-exempt="true">${U.esc(st.paused ? T('tour.bar.resume') : T('tour.bar.pause'))}</button>`
      + `<button type="button" class="o55t-barbtn" data-o55t="skip" data-pm-hover-exempt="true">${U.esc(T('tour.bar.skip'))}</button>`
      + (O55.lookMenu ? `<span class="o55t-lookslot">${O55.lookMenu.button('o55t-barbtn o55t-sound', 'data-o55t', st.lookOpen)}${st.lookOpen ? O55.lookMenu.panel('data-o55t') : ''}</span>` : '')
      + O55.sound.buttonHtml('o55t-barbtn o55t-sound').replace('data-o55-do="sound"', 'data-o55t="sound"'));
  }
  /* the look menu opens and closes like a sheet, and sounds like one ('sheet', 'unsheet') */
  function lookMenu(open) {
    if (!!st.lookOpen === open) return;
    st.lookOpen = open; O55.sound.play(open ? 'sheet' : 'unsheet'); renderBar();
  }

  /* ------------------------------------------------------------------ callout */
  const copy = (id, k) => { const tips = st.tips === 'eli5'; const v = O55.tx('tour.steps.' + id + '.' + k + (tips ? 'Eli5' : '')); return typeof v === 'string' ? v : T('tour.steps.' + id + '.' + k); };
  function calloutHtml() {
    const s = st.step; if (!s) return '';
    const done = st.sess.done.includes(s.id) && s.kind === 'action';
    /* a skin may add a counter to the kicker, rename "Try it" and put a line of its own above the buttons */
    const deco = { step: s, missing: !!st.missing, done, count: '', tryLabel: T('tour.controls.tryIt'), pod: '' };
    emit('callout', deco);
    const kicker = (text) => `<p class="o55t-kicker"${deco.count ? ` data-count="${U.esc(deco.count)}"` : ''}>${U.esc(text)}</p>`;
    const actions = (inner) => `${deco.pod}<div class="o55t-actions">${inner}</div>`;
    if (st.missing) return kicker(T('tour.bar.label')) + `<h2 class="o55t-title" id="o55t-h" tabindex="-1">${U.esc(T('tour.missing.title'))}</h2><p class="o55t-body">${U.esc(T('tour.missing.body'))}</p>`
      + actions(`${btn('back', T('tour.controls.back'), 'ghost')}${btn('skipStep', T('tour.controls.next'), 'ghost')}${btn('takeMe', T('tour.controls.takeMe'), 'primary')}`);
    if (s.render) return s.render(st, { btn, copy, kicker, actions });
    const title = copy(s.id, 'title'), body = done && s.after ? T('tour.steps.' + s.id + '.after') : copy(s.id, s.doKey ? s.doKey(st) : 'do');
    const extra = s.extra ? s.extra(st) : '';
    const btns = [];
    if (s.index > 0) btns.push(btn('back', T('tour.controls.back'), 'ghost'));
    if (s.kind === 'action' && !done && s.showMe) btns.push(btn('showMe', T('tour.controls.showMe'), 'secondary'));
    if (s.kind === 'info' || done) {
      const ready = s.kind !== 'info' || !s.ready || s.ready(st);
      btns.push(ready ? btn('next', s.nextLabel ? s.nextLabel(st) : T('tour.controls.next'), 'primary') : `<button type="button" class="o55t-btn o55t-primary" aria-disabled="true" data-pm-hover-exempt="true">${U.esc(s.nextLabel ? s.nextLabel(st) : T('tour.controls.next'))}</button>`);
    }
    return kicker(T('tour.chapters.' + s.chapter)) + `<h2 class="o55t-title" id="o55t-h" tabindex="-1">${U.esc(title)}</h2>`
      + (s.kind === 'action' && !done ? `<p class="o55t-try"><span class="o55t-trylabel">${U.esc(deco.tryLabel)}</span>${U.esc(body)}</p>` : `<p class="o55t-body">${U.esc(body)}</p>`)
      + extra + actions(btns.join(''));
  }
  function btn(action, label, kind, arg) { return `<button type="button" class="o55t-btn o55t-${kind}" data-o55t="${action}"${arg != null ? ` data-arg="${U.esc(arg)}"` : ''} data-pm-hover-exempt="true">${U.esc(label)}</button>`; }
  TR.btn = btn;
  function renderCallout(focus) {
    const c = st.root.querySelector('.o55t-callout');
    U.morph(c, calloutHtml());
    c.setAttribute('data-step', st.step ? st.step.id : '');
    place(false);
    emit('render', { focus: !!focus });
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
  /* attributes and styles are written only when they change: the watch loop places the spotlight every 140 ms, and an
     unchanged write still restyles and repaints on this very large page */
  const put = (el, name, v) => { v = String(v); if (el.getAttribute(name) !== v) el.setAttribute(name, v); };
  const putStyle = (el, name, v) => { if (el.style[name] !== v) el.style[name] = v; };
  const RING_ROOM = 8; /* the ring's box reaches this far past the hole, for its halo strokes */
  function drawHole(h) {
    const W = innerWidth, H = innerHeight, svg = st.root.querySelector('.o55t-scrim'), box = st.root.querySelector('.o55t-ringbox');
    put(svg, 'viewBox', `0 0 ${W} ${H}`); put(svg, 'width', W); put(svg, 'height', H);
    const outer = `M0 0H${W}V${H}H0Z`, sh = st.root.querySelector('.o55t-shield');
    if (!h || h.w <= 0) { put(svg.querySelector('.o55t-scrimpath'), 'd', outer); box.hidden = true; putStyle(sh, 'clipPath', 'inset(50%)'); return; }
    const f = (n) => Math.round(n * 10) / 10, x = f(h.x), y = f(h.y), w = f(h.w), hh = f(h.h), r = Math.max(0, Math.min(st.look ? st.look.radius : 14, w / 2, hh / 2));
    const hole = `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + hh - r}Q${x + w} ${y + hh} ${x + w - r} ${y + hh}H${x + r}Q${x} ${y + hh} ${x} ${y + hh - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
    put(svg.querySelector('.o55t-scrimpath'), 'd', outer + hole);
    /* the ring is a small layer of its own that glides with the hole: its pulse and its marching dashes repaint only
       the ring, never the full-window scrim (in Slint: a Path stroke, or a Rectangle border, over the evenodd scrim) */
    const R = RING_ROOM;
    box.hidden = false;
    putStyle(box, 'transform', `translate(${f(x - R)}px, ${f(y - R)}px)`); putStyle(box, 'width', `${f(w + 2 * R)}px`); putStyle(box, 'height', `${f(hh + 2 * R)}px`);
    box.querySelectorAll('rect').forEach((rc) => { put(rc, 'x', R); put(rc, 'y', R); put(rc, 'width', w); put(rc, 'height', hh); });
    /* the click shield covers everything but the hole on steps that must not be interrupted */
    putStyle(sh, 'clipPath', st.step && st.step.block ? `polygon(evenodd, 0 0, ${W}px 0, ${W}px ${H}px, 0 ${H}px, 0 0, ${x}px ${y}px, ${x}px ${y + hh}px, ${x + w}px ${y + hh}px, ${x + w}px ${y}px, ${x}px ${y}px)` : 'inset(50%)');
  }
  /* the hole glides to each new target on a critically damped spring (no overshoot), retargeting mid-flight */
  const near = (a, b) => ['x', 'y', 'w', 'h'].every((k) => Math.abs(a[k] - b[k]) < 0.5);
  function moveHole(to) {
    if (!st.hole || !to) { st.hole = to; drawHole(to); return; }
    if (st.spring) { st.spring.retarget(to); return; }
    /* already there (the watch loop re-places every 140 ms): no spring; the redraw still applies this step's click
       shield, and writes nothing that has not changed */
    if (near(st.hole, to)) { drawHole(st.hole); return; }
    const from = Object.assign({}, st.hole);
    const g = st.look && st.look.glide === 'steps' ? stepGlide(from, to) : M.spring({ from, to, stiffness: 190, onUpdate: (v) => { st.hole = v; drawHole(v); } });
    st.spring = g;
    g.finished.then(() => { if (st.spring === g) st.spring = null; });
  }
  /* a stepped glide (a skin's choice): the hole jumps to its target in five held steps over 280 ms on the motion
     clock, and always lands then. The watch loop re-places every 140 ms, so a retarget only moves the end of the
     glide in flight (the tween reads its destination each frame): restarting it from where the hole stands would cover
     a fraction of the gap each time and creep for seconds. It answers like the spring (retarget, cancel, finished). */
  function stepGlide(from, to) {
    const dest = Object.assign({}, to);
    const tw = M.tween({ from, to: dest, duration: 280, ease: M.ease.steps(5), onUpdate: (v) => { st.hole = v; drawHole(v); } });
    return { retarget(b) { if (!near(dest, b)) Object.assign(dest, b); }, cancel() { tw.cancel(); }, finished: tw.finished };
  }
  /* run fn once the spotlight stands where it is going (at once when it is not moving) */
  TR.landed = (fn) => { const g = st.spring; if (g && g.finished) g.finished.then((ok) => { if (ok !== false && TR.running) fn(); }); else fn(); };
  function place(snap) {
    const el = targetEl(), h = holeFor(el);
    if (el !== st.target) { const prev = st.target; st.target = el; emit('target', { el, prev }); }
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
    /* and for the whole of a Show Me, in every look: the demonstration's own targets come and go (a menu opening at
       the bottom), and a bar that leaps across the window mid-demo pulls the eye off what is being shown */
    if (st.show) return;
    const H = innerHeight, bh = bar.offsetHeight || 44, bottomY = H - bh - 14;
    const top = !!(h && h.y + h.h > bottomY - 6);
    if (bar.classList.contains('o55t-top') === top) return;
    bar.classList.toggle('o55t-top', top);
    emit('barMove', { top });
  }

  /* ------------------------------------------------------------------ the pointer (Show Me) */
  const P = TR.pointer = {
    el: () => st.root.querySelector('.o55t-pointer'),
    pos: null,
    show(x, y) { const p = P.el(); P.pos = { x, y }; p.style.transform = `translate(${x}px, ${y}px)`; p.classList.add('o55t-on'); },
    hide() { const p = P.el(); p.classList.remove('o55t-on', 'o55t-press'); },
    /* travel on a gentle arc; the destination is pre-cued before the pointer leaves */
    async moveTo(x, y, dur, o) {
      /* the pointer emerges from the Show Me button the learner just pressed (else from the callout's middle), or
         from where a skin keeps it (pointerFrom) */
      if (!P.pos) {
        const from = { at: null }; emit('pointerFrom', from);
        if (from.at) P.show(from.at.x, from.at.y);
        else { const b = st.root.querySelector('.o55t-callout [data-o55t="showMe"]'), c = (b || st.root.querySelector('.o55t-callout')).getBoundingClientRect(); P.show(c.left + c.width / 2, c.top + c.height / 2); }
        await M.delay(80);
      }
      const from = Object.assign({}, P.pos), dist = Math.hypot(x - from.x, y - from.y), mx = (from.x + x) / 2, my = Math.min(from.y, y) - Math.min(120, dist * 0.25);
      /* like a hand: time grows with distance (Fitts), speed up then settle into the target, in the family's manner
         (or the skin's: st.look.travel = { n, ease, frame }) */
      const fam = family(), tv = st.look && st.look.travel, d = dur || Math.round(Math.min(760, Math.max(420, 360 + dist * 0.32)));
      const ease = tv ? tv.ease : fam === 'retro' ? M.ease.steps(8) : fam === 'friendly' ? M.ease.handSpring : fam === 'glass' ? M.ease.handGlide : M.ease.hand;
      const at = (t) => [(1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * mx + t * t * x, (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * my + t * t * y];
      const el = P.el(), end = () => { P.pos = { x, y }; el.style.transform = `translate(${x}px, ${y}px)`; };
      if (M.reduced()) { end(); return; }
      const quiet = o && o.quiet;
      if (!quiet && dist > 24) O55.sound.play('pointer');
      /* the travel is one Web Animation through points sampled from the same arc and easing (Retro: eight held steps),
         so the compositor carries the hand: the tour cannot hide the app beneath it, and a frame drawn by the main
         thread repaints that whole page on a computer without a GPU */
      const n = tv ? tv.n : fam === 'retro' ? 8 : 28, frame = tv ? tv.frame : fam === 'retro' ? 'steps(1, end)' : 'linear', frames = [];
      for (let k = 0; k <= n; k++) { const [px, py] = at(ease(k / n)); frames.push({ transform: `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`, easing: frame }); }
      const a = el.animate(frames, { duration: fam === 'glass' && !tv ? Math.round(d * 1.12) : d, fill: 'forwards' });
      await a.finished.catch(() => null);
      end(); a.cancel();
      if (!quiet && dist > 24 && !SM.cancelled()) O55.sound.play('arrive');
    },
    async press(on) { P.el().classList.toggle('o55t-press', on !== false); await M.delay(on === false ? 60 : 140); }
  };
  const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  TR.center = center;
  /* Show Me helpers: every action goes through the real control or the real handler */
  const SM = TR.sm = {
    cancelled: () => !st.show || st.show.cancelled,
    wait: (ms) => M.delay(ms),
    async cue(el) { if (!el) return; el.classList.add('o55t-cue'); emit('cue', { el }); await M.delay(360); el.classList.remove('o55t-cue'); },
    async click(el, o) {
      if (!el || SM.cancelled()) return false;
      el.scrollIntoView && el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      /* the destination is cued as the pointer sets off, not before: the glow and the travel overlap */
      SM.cue(el); await M.delay(90); if (SM.cancelled()) return false;
      const c = center(el); await P.moveTo(c.x, c.y); if (SM.cancelled()) return false;
      await P.press(true); O55.sound.play((st.look && st.look.press) || 'tap'); emit('press', { el, x: c.x, y: c.y });
      const opts = { bubbles: true, cancelable: true, clientX: c.x, clientY: c.y, button: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true };
      el.dispatchEvent(new PointerEvent('pointerdown', opts)); el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', opts)); el.dispatchEvent(new MouseEvent('mouseup', opts));
      if (!(o && o.noClick)) el.click();
      await P.press(false);
      return true;
    },
    /* a real drag: pointerdown on the grip, a stream of pointermoves, pointerup at the destination. The carry runs on
       the clock, not on a count of moves: each move makes the workspace re-lay its drop preview, and on a busy page a
       fixed 42 moves took twice their time, so a slow page sends fewer moves and the carry still lasts dur. The path
       is a gentle arc over the straight line; o.via sends it down first and then across through that point (see
       carryPath). Its drop sounds as the hand lets go, before the workspace's receipt sounds the step done. */
    async drag(el, to, o) {
      if (!el || SM.cancelled()) return false;
      const a = center(el); SM.cue(el); await M.delay(90); await P.moveTo(a.x, a.y); if (SM.cancelled()) return false;
      await P.press(true); O55.sound.play('pickup');
      const base = { bubbles: true, cancelable: true, button: 0, buttons: 1, pointerId: 7, pointerType: 'mouse', isPrimary: true };
      const move = (x, y) => (document.elementFromPoint(x, y) || document).dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: x, clientY: y }, base)));
      el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: a.x, clientY: a.y }, base)));
      const span = Math.hypot(to.x - a.x, to.y - a.y), dur = (o && o.dur) || Math.round(Math.min(1500, Math.max(900, 700 + span * 0.5)));
      const at = carryPath(a, to, o && o.via), ease = (st.look && st.look.drag) || (family() === 'retro' ? M.ease.steps(12) : M.ease.hand);
      const t0 = M.now(); let last = '';
      while (!SM.cancelled()) {
        const p = Math.min(1, (M.now() - t0) / dur), [x, y] = at(ease(p)), k = Math.round(x) + ',' + Math.round(y);
        /* a held step (NieR, Retro) sends nothing new until the hand moves */
        if (k !== last) { last = k; P.pos = { x, y }; P.el().style.transform = `translate(${x}px, ${y}px)`; move(x, y); }
        if (p >= 1) break;
        await M.delay(16);
      }
      /* dwell on the destination the way a hand does: the workspace adopts a new drop target only after
         it has held for two frames, so a few small moves across several frames let the preview settle */
      for (let j = 0; j < 4 && !SM.cancelled(); j++) { move(to.x + (j % 2), to.y + j * 0.5); await M.delay(48); }
      await M.delay(260); /* the destination has reacted (preview) before the drop */
      if (SM.cancelled()) return false;
      O55.sound.play('drop');
      (document.elementFromPoint(to.x, to.y) || document).dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: to.x, clientY: to.y }, base, { buttons: 0 })));
      await P.press(false);
      return true;
    },
    /* typing into a field it pressed: a letter every 18 ms, and the type tick at most every 120 ms (a chat cue's
       spacing), so a long word is a patter rather than a buzz */
    async type(el, text) {
      if (!el || SM.cancelled()) return false;
      await SM.click(el, { noClick: true }); el.focus();
      let ticked = -1e9;
      for (const ch of text) {
        if (SM.cancelled()) return false;
        el.value += ch; el.dispatchEvent(new Event('input', { bubbles: true }));
        if (/\S/.test(ch) && M.now() - ticked >= 120) { ticked = M.now(); O55.sound.play('type'); }
        await M.delay(18);
      }
      return true;
    }
  };
  /* where a carry is at t (0..1). By default a gentle arc over the straight line. With via: down first, then across
     through via (a curve from a whose control point stands straight below a at via's height, then a straight run from
     via into b). A carry from a high corner to a side dock then never sweeps along the top edge, where the workspace
     would preview (and latch) its top dock. Each leg takes time in proportion to its length. */
  function carryPath(a, b, via) {
    if (!via) { const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 60; return (t) => [(1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x, (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y]; }
    const c = { x: a.x, y: via.y }, q = (u) => [(1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * via.x, (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * via.y];
    let l1 = 0; for (let i = 1, p = q(0); i <= 8; i++) { const n = q(i / 8); l1 += Math.hypot(n[0] - p[0], n[1] - p[1]); p = n; }
    const l2 = Math.hypot(b.x - via.x, b.y - via.y), f = l1 / Math.max(1, l1 + l2);
    return (t) => { if (t <= f && f > 0) return q(t / f); const u = f < 1 ? (t - f) / (1 - f) : 1; return [via.x + (b.x - via.x) * u, via.y + (b.y - via.y) * u]; };
  }
  async function showMe() {
    const s = st.step; if (!s || !s.showMe || st.show) return;
    const me = st.show = { cancelled: false, step: s };
    st.root.setAttribute('data-showme', 'true');
    emit('showMe', { step: s }); /* the pointer's travel is its sound ('pointer'), so the button itself is quiet */
    try { await s.showMe(SM, st); } catch (err) { console.warn('O55 tour: Show Me stopped', err); }
    await M.delay(600); /* settle: the result stays visible while the guide names the change */
    /* the pointer comes home (a skin may wait for the next step's callout and fly there: allow for its arrival) */
    if (st.show === me && !me.cancelled) await settle(emit('showMeEnd', { step: s }), 2800);
    if (st.show !== me) return; /* a real input took over meanwhile and has already put the pointer away */
    st.show = null; st.root.removeAttribute('data-showme'); P.hide();
    emit('showMeDone', { step: s });
    /* a step that arrived during the demonstration could not take focus then (see renderCallout): it takes it now */
    if (st.step !== s && TR.running) { const h = st.root.querySelector('.o55t-callout #o55t-h'); if (h) h.focus({ preventScroll: true }); }
    if (TR.running && st.step) place(false); /* the bar may move now (it holds still during a Show Me) */
  }
  function interruptShow() {
    if (!st.show) return;
    st.show.cancelled = true; st.show = null; st.root.removeAttribute('data-showme'); P.hide();
    O55.sound.play('interrupt'); emit('interrupt', {});
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
    /* each chapter plays on its own chord (the sound kit's tour-ask, tour-workspace, tour-plan) */
    O55.sound.setContext({ chapter: 'tour-' + st.step.chapter, step: st.step.index });
    /* the shared chrome controls rebind to the current Project at every step, so a Project switched mid-tour
       (or a resume onto a different Project) can never leave them showing a previous Project's value */
    if (O55.sound.refresh) O55.sound.refresh('tour');
    if (st.step.enter) { try { await st.step.enter(st, o); } catch (err) { console.warn('O55 tour: enter failed', st.step.id, err); } }
    if (my !== st.seq) return;
    await stillTarget(); /* a page that slides in, a card that grows: place against where things come to rest */
    if (my !== st.seq) return;
    /* a skin may hold the new callout back for a moment (a chapter banner) while the spotlight moves on */
    const arrival = { step: st.step, prev: prev || null, index: st.step.index, chapterChanged: !!(prev && prev.chapter !== st.step.chapter),
      forward: !!(prev && prev.index < st.step.index), back: !!o.back, silent: !!o.silent, first: !prev, hold: false, sound: 'callout' };
    const held = emit('arrive', arrival);
    if (arrival.hold) { renderBar(); place(false); await settle(held, 2600); if (my !== st.seq) return; }
    renderBar(); renderCallout(true);
    /* the callout's arrival sound (a listener that already sounded the moment, a chapter banner, sets it to null) */
    if (!o.silent && arrival.sound) O55.sound.play(arrival.sound, { step: st.step.index });
    emit('step', arrival);
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
      /* the tour has ended or is closing (its restore moves things about), or Back is rewinding (the rewind's receipts
         would count the step done again): the loop stops */
      if (!TR.running || !st.step || st.ending || st.rewinding) { st.poll = null; return; }
      if (st.paused) { st.poll = M.after(250, tick); return; }
      const s = st.step, el = targetEl();
      /* a surface being dragged is hidden by the workspace on purpose; that is never a missing target. Its grace runs
         on the motion clock, like everything it waits beside. */
      if (s.target && !el && !document.body.classList.contains('pm-home-dragging')) {
        if (!st.missingSince) st.missingSince = M.now();
        if (!st.missing && M.now() - st.missingSince > 1600) {
          st.missing = true; renderCallout(true);
          const d = { on: true, sound: 'missing' }; emit('missing', d); if (d.sound) O55.sound.play(d.sound);
        }
      }
      else { st.missingSince = 0; if (st.missing) { st.missing = false; renderCallout(false); emit('missing', { on: false }); } }
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
    st.kick = () => { if (!TR.running || st.paused || st.ending || st.rewinding) return; if (st.poll) st.poll.cancel(); tick(); };
  }
  window.addEventListener('pm:dispatch-receipt', () => { if (st.kick && TR.running) queueMicrotask(st.kick); });
  /* success: acknowledge in the same frame, show the "after" line, then move on (the advance guard stops doubles) */
  function complete(s) {
    if (st.advancing || st.rewinding || st.ending) return; st.advancing = true;
    if (!st.sess.done.includes(s.id)) st.sess.done.push(s.id);
    save(); O55.sound.play('checkpoint', { step: s.index }); renderBar(); renderCallout(false);
    const hold = s.after ? 2200 : 900;
    st.root.querySelector('.o55t-callout').classList.add('o55t-success');
    emit('complete', { step: s });
    M.after(hold, () => { const c = st.root.querySelector('.o55t-callout'); c.classList.remove('o55t-success'); if (TR.running && st.step === s && !s.stay && !st.rewinding && !st.entering) goStep(s.index + 1); else st.advancing = false; });
  }
  TR.complete = () => st.step && complete(st.step);

  function onClick(e) {
    if (st.lookOpen && !e.target.closest('.o55t-lookslot')) lookMenu(false);
    const b = e.target.closest('[data-o55t]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (st.ending) return; /* the tour is closing: one Finish or Skip is enough */
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
    if (a === 'lookMenu') { lookMenu(!st.lookOpen); return; }
    if (a === 'lookFamily') { O55.lookMenu.save(arg, O55.theme().mode); return; }
    if (a === 'lookMode') { O55.lookMenu.save(O55.theme().chosen, arg); return; }
    /* NieR Mode in the look menu: the checkbox and Adjust NieR look (O55.lookMenu.nier, after setup: live) */
    if (a === 'lookNier' || a === 'lookNierAdjust') {
      if (!(O55.lookMenu && O55.lookMenu.nier)) return;
      /* Adjust opens the Plug-in Chips dialog: the menu closes first, so the dialog returns focus to the bar's look
         button (the redrawn one) rather than to a control the redraw removed */
      if (a === 'lookNierAdjust') lookMenu(false);
      O55.lookMenu.nier(a, (a === 'lookNierAdjust' && st.root.querySelector('.o55t-bar [data-o55t="lookMenu"]')) || b);
      /* the checkbox shows the request in this frame (the repaint it asks for follows) */
      if (a === 'lookNier') renderBar();
      return;
    }
    if (a === 'takeMe') { O55.sound.play('select'); if (st.step.goTo) st.step.goTo(st); st.missing = false; st.missingSince = 0; renderCallout(false); emit('missing', { on: false }); return; }
    if (a === 'skipStep') { O55.sound.play('next'); return goStep(st.step.index + 1); }
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
    emit('pause', { paused: st.paused });
  }
  function save() {
    O55.store.set(KEY, { v: 2, status: st.sess.status, index: st.sess.index, done: st.sess.done.slice(0, TR.defs.length),
      tips: st.tips, started: st.sess.started, project: st.sess.project, chatTucked: !!st.sess.chatTucked,
      snapshot_ref: st.snapshotRef, thread_ref: st.snap && st.snap.thread, page_ref: st.snap && st.snap.page });
  }
  function showRecovery(saved) {
    let box = document.getElementById('o55-tour-recovery');
    if (!box) { box = document.createElement('div'); box.id = 'o55-tour-recovery'; box.setAttribute('role', 'alert');
      box.style.cssText = 'position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:680px;margin:auto;padding:16px;border:2px solid currentColor;border-radius:12px;background:var(--surface,#222);color:inherit;box-shadow:0 8px 35px #0008'; document.body.appendChild(box); }
    const canRetry = recovery.has(saved.snapshot_ref);
    box.innerHTML = `<strong>${U.esc(T('tour.recoveryTitle'))}</strong><p>${U.esc(T(canRetry ? 'tour.recoveryRetry' : 'tour.recoveryUnavailable'))}</p>`
      + (canRetry ? `<button type="button" data-o55-recovery="retry">${U.esc(T('tour.recoveryRetryButton'))}</button>` : '')
      + `<button type="button" data-o55-recovery="restart">${U.esc(T('tour.recoveryRestartButton'))}</button>`;
    box.onclick = (event) => { const action = event.target && event.target.getAttribute('data-o55-recovery');
      if (action === 'retry') TR.retryRestore();
      if (action === 'restart') TR.acknowledgeRecovery({ acknowledged: true, ownerReconciled: true }); };
  }
  function validResume(saved, requestedProject) {
    if (!saved || saved.v !== 2 || saved.status !== 'running' || !recovery.has(saved.snapshot_ref) ||
        !Number.isInteger(saved.index) || saved.index < 0 || saved.index >= TR.defs.length || !Array.isArray(saved.done) ||
        saved.done.some((id) => !TR.byId[id]) || (requestedProject && saved.project !== requestedProject)) return false;
    const basis = recovery.get(saved.snapshot_ref);
    const demo = window.PM_DEMO;
    if (saved.thread_ref !== basis.thread || saved.page_ref !== basis.page ||
        (basis.thread && !(demo && demo.state && demo.state.chat && demo.state.chat.threads[basis.thread]))) return false;
    /* A completed action is only trusted while its current owner predicate still holds. A changed Project,
       missing thread or invalidated step result restarts guidance from the current owner state. */
    const projected = Object.assign({}, st, { sess: saved, snap: basis });
    return saved.done.every((id) => { const step = TR.byId[id]; if (step.index >= saved.index || step.kind !== 'action' || !step.done) return true;
      try { return !!step.done(projected); } catch (_) { return false; } });
  }

  /* ------------------------------------------------------------------ lifecycle */
  TR.start = async function start(o) {
    o = o || {};
    if (o.fresh && TR.running) { const result = await end('skipped', false, { silent: true }); if (result.status === 'restore-pending') return false; }
    if (O55.S && O55.S.open) O55.ui.close('done');
    const saved = O55.store.get(KEY, null);
    if (TR.hasUnresolved() && saved.status !== 'running') {
      showRecovery(saved);
      return false;
    }
    if (saved && saved.status === 'running' && saved.v !== 2) {
      const bounded = { v: 2, status: 'resume-unavailable', index: Number.isInteger(saved.index) ? saved.index : 0,
        done: Array.isArray(saved.done) ? saved.done.filter((id) => !!TR.byId[id]) : [], project: saved.project || null,
        snapshot_ref: 'legacy-snapshot-unavailable', thread_ref: saved.snap && saved.snap.thread || null };
      O55.store.set(KEY, bounded); showRecovery(bounded); return false;
    }
    if (saved && saved.v === 2 && saved.status === 'running' && (o.fresh || !recovery.has(saved.snapshot_ref) || !validResume(saved, o.project || null))) {
      saved.status = 'resume-unavailable'; O55.store.set(KEY, saved); showRecovery(saved);
      return false; /* a reload cannot infer or silently replace the original owner restoration basis */
    }
    const resume = !o.fresh && validResume(saved, o.project || null);
    build(); syncTheme();
    st.sess = resume ? { status: 'running', index: saved.index, done: saved.done || [], started: saved.started, project: saved.project || o.project || null, chatTucked: !!saved.chatTucked } : { status: 'running', index: 0, done: [], started: new Date().toISOString(), project: o.project || null };
    st.tips = (resume && saved.tips) || 'normal';
    /* a new run starts clean: nothing the last run sent, answered or planned counts as done */
    if (!resume) { if (TR.chat && TR.chat.reset) TR.chat.reset(); if (TR.practice && TR.practice.reset) TR.practice.reset(); }
    st.entries = {};
    st.snap = resume ? recovery.get(saved.snapshot_ref) : snapshot();
    st.snapshotRef = resume ? saved.snapshot_ref : 'tour-snapshot:' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
    recovery.set(st.snapshotRef, st.snap);
    st.counters = TR.counters();
    TR.running = true; st.paused = false;
    document.documentElement.setAttribute('data-o55-tour', 'true');
    if (window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.pause) { try { window.PM_DEMO.clock.pause(); st.pausedClock = true; } catch (_) {} }
    TR.chat && TR.chat.install();
    st.root.hidden = false; st.root.classList.add('o55t-opening');
    M.after(700, () => st.root && st.root.classList.remove('o55t-opening'));
    O55.sound.play('open');
    window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: resume ? 'resumed' : 'started' } }));
    /* a skin may open the tour with a moment of its own before the first step (and take over the handoff) */
    const opening = { resume: !!resume, from: o.from || null, noMorph: false };
    const seq = st.seq;
    await settle(emit('start', opening), 2400);
    if (!TR.running || st.seq !== seq) return true;
    await goStep(st.sess.index, { silent: true });
    if (o.from && !opening.noMorph) morphIn(o.from);
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
    O55.sound.play('callout', { step: 0 });
    a.finished.then(() => {
      c.classList.remove('o55t-morphing');
      g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease', fill: 'forwards' }).finished.then(() => g.remove());
    }).catch(() => { c.classList.remove('o55t-morphing'); g.remove(); });
  }
  async function end(status, keep, o) {
    st.ending = true;
    try { return await ending(status, keep, o); } finally { st.ending = false; }
  }
  async function ending(status, keep, o) {
    /* a step still arriving (awaiting its page, its target or a skin's hold) stands down: it would restart the loop */
    ++st.seq; st.entering = false;
    if (st.poll) { st.poll.cancel(); st.poll = null; } interruptShow();
    if (st.step && st.step.leave) { try { st.step.leave(st); } catch (_) {} }
    /* a skin's closing moment plays while the layout goes back beneath it; it may ask for the app's own notices
       ("Widget removed", "Applied from the next turn") to stay quiet meanwhile, since its band already says what
       is happening */
    const closing = { status, keep: !!keep, silent: !!(o && o.silent), hush: false };
    const ceremony = settle(emit('ending', closing), 2400);
    const res = await hushed(closing.hush, () => restore(st.snap, keep));
    await ceremony;
    if (res.layout === 'failed' || res.widgets === 'failed' || !res.chat || res.chat.status !== 'restored') {
      st.sess.restored = res; st.sess.status = 'restore-pending';
      st.sess.requestedStatus = status;
      st.sess.requestedKeep = !!keep;
      O55.store.set(KEY, { v: 2, status: 'restore-pending', requested_status: status, index: st.sess.index,
        done: st.sess.done.slice(0, TR.defs.length), project: st.sess.project, snapshot_ref: st.snapshotRef,
        thread_ref: st.snap && st.snap.thread, page_ref: st.snap && st.snap.page, restored: res });
      O55.pageToast(T('tour.restoreFailed'));
      showRecovery(O55.store.get(KEY, null));
      emit('end', { status: 'restore-pending', keep: !!keep });
      return { ...res, status: 'restore-pending' };
    }
    TR.running = false;
    /* Chat tucked away by the tour on a phone-width window comes back either way; the learner never hid it */
    if (keep && st.sess.chatTucked && window.PM_HOME_WORKSPACE) { try { window.PM_HOME_WORKSPACE.setSurfaceVisible('chat', true, 'cmd.panel.switch'); } catch (_) {} }
    TR.chat && TR.chat.uninstall();
    st.sess.status = status; st.sess.restored = res; O55.store.set(KEY, { v: 2, status, done: st.sess.done, finished: new Date().toISOString(), keep: !!keep, restored: res });
    recovery.delete(st.snapshotRef);
    const recoveryBox = document.getElementById('o55-tour-recovery'); if (recoveryBox) recoveryBox.remove();
    document.documentElement.removeAttribute('data-o55-tour');
    if (st.pausedClock && window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.resume) { try { window.PM_DEMO.clock.resume(); } catch (_) {} }
    st.root.classList.add('o55t-closing'); if (!(o && o.silent)) O55.sound.play(status === 'done' ? 'finish' : 'close');
    emit('end', { status, keep: !!keep });
    /* (a new run started inside these 360 ms keeps its root, its step and its spotlight) */
    M.after(360, () => { st.root.classList.remove('o55t-closing'); if (TR.running) return; st.root.hidden = true; st.step = null; st.hole = null; st.target = null; emit('closed', {}); });
    return res;
  }
  /* run fn with the page's toasts silenced (only when asked): what the tour's own restore raises is dropped */
  async function hushed(on, fn) {
    const t = window.toast;
    if (!on || typeof t !== 'function') return fn();
    const quiet = window.toast = function () {};
    try { return await fn(); } finally { if (window.toast === quiet) window.toast = t; }
  }
  /* a toast that belongs to the page (the tour root and the onboarding window may both be gone) */
  O55.pageToast = function pageToast(text, ms) {
    let el = document.getElementById('o55-pagetoast');
    if (!el) { el = document.createElement('div'); el.id = 'o55-pagetoast'; el.className = 'o55-pagetoast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = text; el.classList.remove('o55-on'); void el.offsetWidth; el.classList.add('o55-on');
    M.after(ms || 4200, () => el.classList.remove('o55-on'));
  };
  async function skip() {
    if (st.ending) return { status: 'ending' };
    if (!TR.running) { const saved = O55.store.get(KEY, null); if (saved && TR.hasUnresolved()) showRecovery(saved); return { status: saved && saved.status || 'not-running' }; }
    const result = await end('skipped', false);
    if (result.status === 'restore-pending') return result;
    O55.pageToast(T('tour.skipped'));
    window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: 'skipped' } }));
  }
  async function finish(keep) {
    if (st.ending) return { status: 'ending' };
    if (!TR.running) { const saved = O55.store.get(KEY, null); if (saved && TR.hasUnresolved()) showRecovery(saved); return { status: saved && saved.status || 'not-running' }; }
    const res = await end('done', keep);
    if (res.status === 'restore-pending') return res;
    /* land on the real Planning Wizard with the Project selected; nothing starts */
    if (st.sess.project && O55.shell) O55.shell.selectProject(st.sess.project, null);
    O55.shell && O55.shell.openWizard();
    TR.landing && TR.landing();
    window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: 'finished', keep: !!keep, restored: res } }));
  }
  /* Run Onboarding Again: the tour starts over too. A running tour ends (the layout comes back); its saved progress,
     its resume chip and what it remembers of the last run go. */
  TR.reset = async function reset(o) {
    const saved = O55.store.get(KEY, null);
    if (TR.hasUnresolved()) {
      if (saved.status === 'running') { saved.status = 'resume-unavailable'; O55.store.set(KEY, saved); }
      if (!o || !o.acknowledged || !o.ownerReconciled) { showRecovery(saved); return false; }
    }
    if (TR.running) { const result = await end('skipped', false, o); if (result.status === 'restore-pending') return result; }
    O55.store.clear(KEY);
    st.entries = {};
    if (TR.chat && TR.chat.reset) TR.chat.reset();
    if (TR.practice && TR.practice.reset) TR.practice.reset();
    const chip = document.getElementById('o55-tourchip'); if (chip) chip.remove();
  };
  TR.skip = skip; TR.finish = finish; TR.go = (id) => goStep(TR.byId[id].index);
  TR.hasUnresolved = () => { const saved = O55.store.get(KEY, null); return !!(saved &&
    (['restore-pending', 'resume-unavailable'].includes(saved.status) ||
      (saved.status === 'running' && (saved.v !== 2 || !validResume(saved, null))))); };
  TR.retryRestore = () => st.sess && st.sess.status === 'restore-pending' ? (st.sess.requestedStatus === 'done' ? finish(!!st.sess.requestedKeep) : skip()) : null;
  TR.acknowledgeRecovery = function (o) {
    const saved = O55.store.get(KEY, null), home = window.PM_HOME_WORKSPACE, chat = window.PM_DEMO && window.PM_DEMO.state && window.PM_DEMO.state.chat;
    if (!saved || !['restore-pending', 'resume-unavailable'].includes(saved.status) || !o || o.acknowledged !== true || o.ownerReconciled !== true || !home || !home.layout || !chat) return false;
    O55.store.clear(KEY); recovery.delete(saved.snapshot_ref);
    const box = document.getElementById('o55-tour-recovery'); if (box) box.remove();
    return TR.start({ fresh: true, project: saved.project });
  };
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
  new MutationObserver(() => { if (TR.running) { syncTheme(); TR.refresh(); if (st.lookOpen) renderBar(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts'] });
})();
