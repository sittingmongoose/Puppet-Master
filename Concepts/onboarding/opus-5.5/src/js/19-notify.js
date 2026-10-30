/* PM Notify: the app's one notification system (pm7-notifications, Opus 5.5, 2026-10-13; Jared: "Notifications need
   to be polished as well ... this whole system should WOW people").

   It takes over the title bar's notification slot from the base engine (pm6-js-globals' port of notify-protos/01)
   while the page is still being parsed, so every caller that reaches window.toast, toast.important, toast.push or
   PM_TITLEBAR_NOTIFY.push lands here. Canon: F3-447 (staged toasts: newest on top, at most 5, 3.4 s, a fade out,
   instant under Reduced Motion, never stored), F3-453 (one alert store, ack and snooze, the count badge counts the
   unread), F3-460 (the rightward stack and its count badge between the page tabs and the search, the sole standing
   affordance; durable notices stage, then join it), F3-461 (the sprout inbox, kind action rows, single dismiss with a
   height spring and a size bounce, Clear all bottom to top with no empty flash, Esc and outside click close).

   Four urgency levels:
     quiet      a confirmation of something the person just did ("Settings saved"): stages, fades, is never stored
     notice     something finished or changed (a run completed): stages, then flies into the stack
     attention  a warning (a usage window at 80 %): stages longer, shows its action, then joins
     blocking   work waits on a decision (approval, permission, file safety, a concern): stages longest, sorts first,
                and the stack keeps a "needs you" mark until it is resolved
   The same notice again counts up on the card already showing (x2), and a quick note plus a lasting notice about the
   same event within PAIR_MS are one card (the demo's 80 % usage warning used to arrive twice).

   Looks. Basic, Friendly, Retro, Glass and NieR share this one engine; each look has its own material and its own
   motion (MOTION below: springs for Basic, Friendly and Glass, discrete steps for Retro and NieR) in
   src/css/26-notify-*.css. Reduced Motion shows end states at once (arrivals appear, exits are instant, the join swaps).

   Contracts kept for other owners:
     - #rsStage stays the same element: the page shell (home-redesign 50-pageshell.js) observes it and hangs it tight
       under the title bar at the bell on every page. Usage (usage-redesign 46-shell.js) still moves it to its stage's bottom right, which 26-notify-00-core.css
       undoes: on Usage too notices stage under the bell (Jared, 2026-10-13 22:10 ET). A new card is appended as its
       last child, synchronously, and the stage shows the newest on top with column-reverse, so NieR Mode's parts
       (src/settings/kit.d/19-nier-parts.js), which wrap window.toast and PM_TITLEBAR_NOTIFY.push once and read the new
       card as #rsStage's last child, keep their decode, glitch, Pod and voice. The card carries n-sev-<severity>, and .n-title / .n-body hold one text node each (decode's rule).
     - #notifySlot's --rs-stack-w (120..248 px, the title bar's density code) sizes the stack.
     - The tour may set window.toast to a no-op while it restores a layout (80-tour-core.js hushed()).
   Settings: general.interaction.notifications-enabled off is total quiet (nothing pops up or sounds; lasting notices
   still reach the inbox), and general.interaction.notification-method "System Tray" keeps lasting notices out of the
   page (they land in the stack directly); "Banner" draws them as one banner under the title bar.

   API: window.toast(msg | title, [opts | body], [type]) with .important/.push/.clear/.expand/.collapse;
   window.PM_TITLEBAR_NOTIFY { push, clearAll, dismiss, boot, open, close, list, markAllRead, demo, version }. */
(function () {
  'use strict';
  const O55 = window.O55 || {};
  const doc = document, html = doc.documentElement;
  const T = (k, v) => (typeof O55.t === 'function' ? O55.t('notify.' + k, v) : k);

  /* ---------- tuning ---------------------------------------------------------------------------------------------- */
  const TTL = { quiet: 3400, notice: 3400, attention: 5200, blocking: 6800 };   // real time: reading time, not Animation speed
  const STAGE_CAP = 5, MAX_ITEMS = 60, FOLD_AT = 3;
  const MERGE_MS = 12000, PAIR_MS = 1800;
  const BLOCKING = /^(hitl|permission|filesafe|concern)$/;
  const ACTION_LABELS = {
    approve: 'Approve', decline: 'Decline', open_details: 'Details', explain: 'Explain', retry_safe: 'Retry from safe point',
    fresh_attempt: 'Start fresh attempt', open_orch: 'Open Orchestrator', deny: 'Deny', once: 'Once', for_session: 'For Session',
    always: 'Always', filesafe_once: 'Approve once', filesafe_add: 'Approve & add', cancel: 'Cancel', acknowledge: 'Acknowledge',
    dismiss: 'Dismiss', resolve: 'Resolve', open_usage: 'Open Usage', resume_wizard: 'Resume Wizard', view_report: 'View report',
    continue_assistant: 'Continue in Assistant', open: 'Open', resume_pin: 'Continue'
  };
  const PRIMARY = /^(approve|filesafe_once|filesafe_add|for_session|always|once|resolve|open_usage|resume_wizard|retry_safe|open_orch|open|resume_pin)$/;
  const DANGER = /^(deny|decline|cancel)$/;
  const NAVIGATES = /^(open_details|open|open_usage|open_orch|resume_wizard|view_report|continue_assistant)$/;
  const PAGE_LABEL = { usage: 'Usage', orchestrator: 'Orchestrator', planning: 'Planning Wizard', wizard: 'Planning Wizard', settings: 'Settings', projects: 'Projects', dashboard: 'Home', home: 'Home', chat: 'Chat' };
  const SOURCES = ['needs', 'usage', 'runs', 'planning', 'agents', 'settings', 'projects', 'general'];
  const SOURCE_ICON = { needs: 'hand', usage: 'gauge', runs: 'layers', planning: 'wand', agents: 'spark', settings: 'sliders', projects: 'folder', general: 'bell' };

  /* ---------- glyphs: 24-unit strokes in currentColor (PM Symbols' weight); no emoji ------------------------------ */
  const P = {
    bell: '<path d="M6 10a6 6 0 0 1 12 0c0 4.4 1.4 6 2.3 6.8H3.7C4.6 16 6 14.4 6 10z"/><path d="M9.9 19.6a2.2 2.2 0 0 0 4.2 0"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.2"/><path d="M12 7.7h.01" stroke-width="2.6"/>',
    success: '<circle cx="12" cy="12" r="8.6"/><path d="M8.2 12.4l2.6 2.6 5.1-5.5"/>',
    warn: '<path d="M12 4.3L2.9 19.6h18.2L12 4.3z"/><path d="M12 10.2v4.2"/><path d="M12 17.1h.01" stroke-width="2.6"/>',
    error: '<path d="M8.3 3.6h7.4l5.2 5.2v7.4l-5.2 5.2H8.3l-5.2-5.2V8.8z"/><path d="M12 8v5"/><path d="M12 16.1h.01" stroke-width="2.6"/>',
    gauge: '<path d="M4.4 17a8.4 8.4 0 1 1 15.2 0"/><path d="M12 15.6l3.9-4.6"/><circle cx="12" cy="16" r="1.3"/>',
    layers: '<path d="M12 3.5l8.6 4.3L12 12 3.4 7.8 12 3.5z"/><path d="M3.9 12.2l8.1 4 8.1-4"/><path d="M3.9 16.2l8.1 4 8.1-4"/>',
    wand: '<path d="M5 19L15.4 8.6"/><path d="M17.4 4v2.6M16.1 5.3h2.6"/><path d="M20 9.6v1.8M19.1 10.5h1.8"/><path d="M13.9 3.6v1.4M13.2 4.3h1.4"/>',
    spark: '<path d="M11 4l1.6 4.4L17 10l-4.4 1.6L11 16l-1.6-4.4L5 10l4.4-1.6L11 4z"/><path d="M18 14.5l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1z"/>',
    sliders: '<path d="M4 7h9.2M17.2 7H20M4 17h3.4M11.4 17H20"/><circle cx="15.2" cy="7" r="2"/><circle cx="9.4" cy="17" r="2"/>',
    folder: '<path d="M3.5 7.2a2 2 0 0 1 2-2h3.7l2 2.1h7.3a2 2 0 0 1 2 2v7.6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.2z"/>',
    hand: '<path d="M8.2 12.6V6.4a1.5 1.5 0 0 1 3 0v4.9V4.9a1.5 1.5 0 0 1 3 0v6.4V6.2a1.5 1.5 0 0 1 3 0v8c0 4-2.7 6.3-6 6.3-2.5 0-4-1.1-5.2-3.1l-2-3.4a1.4 1.4 0 0 1 2.4-1.5l1.8 2.4"/>',
    key: '<circle cx="8" cy="15.5" r="3.6"/><path d="M10.6 13l8.6-8.6"/><path d="M16.3 7.3l2.2 2.2"/><path d="M14 9.6l1.7 1.7"/>',
    shield: '<path d="M12 3.2l7 3v5.1c0 4.4-2.9 7.7-7 9.6-4.1-1.9-7-5.2-7-9.6V6.2l7-3z"/><path d="M9.6 12.6h4.8v3.6H9.6z"/><path d="M10.6 12.6v-1.3a1.4 1.4 0 0 1 2.8 0v1.3"/>',
    flag: '<path d="M5.5 21V4.2"/><path d="M5.5 4.6h11.3l-2.3 4.1 2.3 4.1H5.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    chevron: '<path d="M6.5 9.5l5.5 5.5 5.5-5.5"/>',
    check: '<path d="M5 12.6l4.4 4.4L19 7.6"/>',
    mail: '<rect x="3.4" y="5.8" width="17.2" height="12.4" rx="2.2"/><path d="M4 7l8 6.2L20 7"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.6V12l3 2"/>'
  };
  function icon(name, cls) {
    return '<svg class="pmn-ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || P.info) + '</svg>';
  }

  /* ---------- the look and its motion -------------------------------------------------------------------------- */
  function look() {
    if (html.getAttribute('data-o55-nier') === 'on') return 'nier';
    const f = String(html.getAttribute('data-theme') || 'basic-dark').split('-')[0];
    return f === 'friendly' || f === 'retro' || f === 'glass' ? f : 'basic';
  }
  const reduceMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function still() {
    try { if (O55.motion && typeof O55.motion.reduced === 'function') return O55.motion.reduced(); } catch (_) { /* fall through */ }
    return html.getAttribute('data-motion') === 'reduced' || !!(reduceMq && reduceMq.matches);
  }
  function nierPart(key) { return look() === 'nier' && (' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').indexOf(' ' + key + ' ') >= 0; }

  /* A damped spring sampled into a CSS linear() easing: the curve and its settling time (ms). */
  const springs = new Map();
  function spring(k, c) {
    const key = k + '/' + c;
    if (springs.has(key)) return springs.get(key);
    const dt = 1 / 600, xs = [0];
    let x = 0, v = 0, t = 0;
    while (t < 2.4) {
      v += (-k * (x - 1) - c * v) * dt; x += v * dt; t += dt; xs.push(x);
      if (t > 0.12 && Math.abs(x - 1) < 0.0012 && Math.abs(v) < 0.02) break;
    }
    const n = 56, pts = [];
    for (let i = 0; i <= n; i++) pts.push(i === n ? 1 : +xs[Math.round(i / n * (xs.length - 1))].toFixed(4));
    const out = { easing: 'linear(' + pts.join(', ') + ')', duration: Math.round(t * 1000) };
    springs.set(key, out);
    return out;
  }
  const steps = (n, ms) => ({ easing: 'steps(' + n + ', end)', duration: ms });
  /* each look's motion: enter (a card arriving), move (reflow), join (the flight into the stack), pop (badge and stack
     catch), panel (the inbox opening), leave (a card going) */
  const MOTION = {
    basic:    () => ({ enter: spring(430, 33), move: spring(420, 36), join: spring(250, 26), pop: spring(560, 24), panel: spring(480, 38), leave: { easing: 'cubic-bezier(.4,0,1,1)', duration: 180 } }),
    friendly: () => ({ enter: spring(330, 16), move: spring(340, 21), join: spring(210, 17), pop: spring(460, 12), panel: spring(340, 18), leave: { easing: 'cubic-bezier(.5,-0.4,.8,.4)', duration: 260 } }),
    glass:    () => ({ enter: spring(230, 19), move: spring(300, 26), join: spring(230, 19), pop: spring(420, 20), panel: spring(230, 19), leave: { easing: 'cubic-bezier(.4,0,.8,.2)', duration: 240 } }),
    retro:    () => ({ enter: steps(5, 150), move: steps(4, 120), join: steps(7, 280), pop: steps(3, 120), panel: steps(6, 210), leave: steps(4, 140) }),
    nier:     () => ({ enter: steps(6, 200), move: steps(4, 140), join: steps(8, 320), pop: steps(3, 150), panel: steps(8, 260), leave: steps(5, 170) })
  };
  const motion = () => MOTION[look()]();
  /* Web Animations (Animation speed scales them through kit.d/17-look.js); real() keeps reading time unscaled */
  function play(el, frames, o) { return playNow(el, frames, o); }
  function playNow(el, frames, o) {
    if (!el || typeof el.animate !== 'function') return null;
    try { return el.animate(frames, Object.assign({ fill: 'none' }, o)); } catch (_) { return null; }
  }
  function real(el, frames, o) {
    const fn = el.o55Animate || el.animate;
    try { return fn.call(el, frames, o); } catch (_) { return null; }
  }
  const done = (a) => (a && a.finished ? a.finished.catch(() => null) : Promise.resolve());
  const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  /* ---------- settings (read only; Settings owns them) ------------------------------------------------------------ */
  function setting(id, dflt) {
    try { if (window.PM51 && typeof window.PM51.value === 'function') { const v = window.PM51.value(id); if (v !== undefined && v !== null) return v; } } catch (_) { /* not ready */ }
    try { const s = window.PM12_KIMI && window.PM12_KIMI.getState && window.PM12_KIMI.getState(); if (s && s.settings && s.settings[id] !== undefined) return s.settings[id]; } catch (_) { /* not ready */ }
    return dflt;
  }
  const masterOn = () => { const v = setting('general.interaction.notifications-enabled', true); return !(v === false || v === 'false' || v === 'Off'); };
  const method = () => String(setting('general.interaction.notification-method', 'Toast') || 'Toast');

  /* ---------- sound (O55.sound: the look's kit, its mute and its gesture rule) --------------------------------------- */
  function sound(ev, intensity) {
    if (!masterOn() || look() === 'nier') return;   // NieR Mode's parts voice their own arrivals
    try { if (O55.sound && typeof O55.sound.play === 'function') O55.sound.play(ev, { intensity: intensity == null ? 0.5 : intensity }); } catch (_) { /* decoration only */ }
  }

  /* ---------- the store ---------------------------------------------------------------------------------------- */
  let seq = 0;
  const uid = () => 'pmn' + (++seq) + '-' + Date.now().toString(36);
  let items = [];            // lasting notices, newest first (the alert store this page keeps)
  const staged = new Map();  // id -> { it, el, timer, paused, leaving }
  const explainOpen = new Set(), patternEdit = new Set();
  const expandedGroups = new Set(['needs']);

  const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  function sourceFrom(page, kind, prefix) {
    if (BLOCKING.test(kind || '')) return 'needs';
    const p = String(page || '').toLowerCase(), x = String(prefix || '').toLowerCase();
    if (p === 'usage' || x === 'usage' || kind === 'usage') return 'usage';
    if (p === 'orchestrator' || x === 'orchestrator' || x === 'runs' || x === 'run') return 'runs';
    if (p === 'planning' || p === 'wizard' || x === 'planning' || kind === 'wizard') return 'planning';
    if (p === 'settings' || x === 'settings') return 'settings';
    if (p === 'projects' || x === 'projects') return 'projects';
    if (x === 'agents' || x === 'agent' || x === 'chat' || p === 'chat') return 'agents';
    return 'general';
  }
  const SUCCESS_WORDS = /\b(saved|copied|added|removed|installed|deleted|reset|restored|applied|updated|captured|done|complete|completed|set up|is on|connected|turned on|sent)\b/i;
  const FAIL_WORDS = /^(could not|couldn't|cannot|can't|not saved|failed|error|unable|refused)\b|\bis refused\b|\bnot allowed\b/i;

  /* any caller's message -> one item. Strings are quiet unless asked to last; objects last unless important: false. */
  function normalize(input, opts, extra) {
    opts = opts || {};
    let o;
    if (input && typeof input === 'object') o = Object.assign({}, input);
    else {
      const text = clean(input);
      const parts = text.split(' - ');
      o = { title: parts[0] || text, body: parts.length > 1 ? parts.slice(1).join(' - ') : '' };
      if (typeof opts === 'string') { o.body = clean(opts); opts = {}; }
      if (typeof extra === 'string') o.type = extra;
      o.important = !!(opts.important || opts.durable);
      o.stringy = true;
    }
    const page = (o.routePayload && o.routePayload.page) || o.page || null;
    let body = clean(o.body != null ? o.body : (o.meta || ''));
    let prefix = '';
    const m = /^(Usage|Orchestrator|Runs?|Planning|Settings|Projects|Agents?|Chat|Needs Attention)\s+·\s+(.*)$/.exec(body);
    if (m) { prefix = m[1]; body = /^just now\.?$/i.test(m[2]) ? '' : m[2].charAt(0).toUpperCase() + m[2].slice(1); }
    const kind = String(o.kind || (o.stringy && !o.important ? 'ephemeral' : 'advisory'));
    const typeSev = { success: 'success', warning: 'warn', warn: 'warn', error: 'error', danger: 'error', info: 'info' }[String(o.type || '').toLowerCase()];
    let severity = o.severity || typeSev || (o.warn ? 'warn' : null);
    const title = clean(o.title || o.msg || o.text || 'Notification');
    if (!severity) severity = FAIL_WORDS.test(title) ? 'warn' : (SUCCESS_WORDS.test(title) && kind === 'ephemeral' ? 'success' : 'info');
    if (severity === 'warning') severity = 'warn';
    const durable = o.stringy ? !!o.important : o.important !== false;
    let level = 'quiet';
    if (durable) level = BLOCKING.test(kind) || severity === 'error' ? 'blocking' : (severity === 'warn' || prefix === 'Needs Attention') ? 'attention' : 'notice';
    /* ttlMs: under 15 s it is how long the card stays staged (Settings passes its toast duration); longer, it is how
       long the notice lives in the inbox (FileSafe's 60 s window) */
    const ttl = Number(o.ttlMs) || 0;
    const routePayload = o.routePayload || (page ? { page, subTab: o.subTab || null } : null);
    const it = {
      id: o.id || uid(), title, body, severity, kind, level, durable,
      source: sourceFrom(page, kind, prefix === 'Needs Attention' ? '' : prefix),
      actions: Array.isArray(o.allowed_action_ids) ? o.allowed_action_ids.slice() : (durable ? (routePayload ? ['open', 'acknowledge'] : ['acknowledge']) : []),
      routePayload, explain: o.explain || null, patternSuggest: o.patternSuggest || null,
      needsRationale: !!o.needsRationale, rationalePlaceholder: o.rationalePlaceholder || 'Why? (required)',
      stageMs: ttl > 0 && ttl < 15000 ? Math.max(2000, Math.min(9000, ttl)) : TTL[level],
      lifeMs: ttl >= 15000 ? ttl : 0,
      createdAt: o.createdAt || Date.now(), count: 1, read: false
    };
    it.icon = it.source === 'general' || (it.level === 'quiet' && it.severity !== 'info') ? it.severity : SOURCE_ICON[it.source];
    if (it.kind === 'permission') it.icon = 'key';
    else if (it.kind === 'filesafe') it.icon = 'shield';
    else if (it.kind === 'concern') it.icon = 'flag';
    return it;
  }

  /* the same event twice: identical words, or a quick note and a lasting notice that share the strong words */
  const STOP = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'your', 'from', 'into', 'are', 'was', 'has', 'have', 'used', 'warning', 'notice', 'window', 'crossed', 'reached']);
  function strong(s) {
    return new Set(String(s).toLowerCase().replace(/\b5h\b/g, '5-hour').replace(/\b7d\b/g, 'weekly').split(/[^a-z0-9%\-]+/)
      .filter((w) => w && !STOP.has(w) && (w.length >= 4 || /\d/.test(w))));
  }
  function sameEvent(a, b) {
    if (Math.abs(a.createdAt - b.createdAt) > PAIR_MS || a.durable === b.durable) return false;
    const A = strong(a.title + ' ' + a.body), B = strong(b.title + ' ' + b.body);
    let shared = 0, digit = false;
    A.forEach((w) => { if (B.has(w)) { shared++; if (/\d/.test(w)) digit = true; } });
    return shared >= 3 || (shared >= 2 && digit);
  }
  const sameWords = (a, b) => a.title === b.title && a.body === b.body && a.severity === b.severity;

  /* ---------- relative time ------------------------------------------------------------------------------------- */
  function ago(ts) {
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 45) return T('now');
    if (s < 3600) return T('minutes', { n: Math.max(1, Math.round(s / 60)) });
    if (s < 86400) return T('hours', { n: Math.round(s / 3600) });
    return T('days', { n: Math.round(s / 86400) });
  }
  function actionLabel(aid, it) {
    if (aid === 'open' && it.routePayload && PAGE_LABEL[it.routePayload.page]) return T('openPage', { page: PAGE_LABEL[it.routePayload.page] });
    return ACTION_LABELS[aid] || aid;
  }
  function stageActions(it) {
    if (it.level === 'quiet' || method() === 'Banner') return [];
    const a = it.actions || [];
    if (it.kind === 'hitl') return a.filter((x) => x === 'approve' || x === 'open_details').slice(0, 2);
    if (it.kind === 'permission') return a.filter((x) => x === 'once' || x === 'deny').slice(0, 2);
    if (it.kind === 'filesafe') return a.filter((x) => x === 'filesafe_once' || x === 'deny').slice(0, 2);
    if (it.kind === 'concern') return [];
    return a.filter((x) => NAVIGATES.test(x)).slice(0, 1);
  }

  /* ---------- DOM: the slot, the stack, the stage, the inbox ------------------------------------------------------- */
  let slot = null, host = null, stackEl = null, stageEl = null, panelEl = null, listEl = null, scrollEl = null, emptyEl = null;
  let headCount = null, frontEl = null, peekEls = [], badgeEl = null, badgeNum = null, bellEl = null, bannerEl = null;
  let booted = false, open = false, closing = null, lastFront = null, lastUnread = 0, readTimer = 0;

  function el(tag, cls, attrs) {
    const e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
    return e;
  }

  function boot() {
    if (booted) return true;
    slot = doc.getElementById('notifySlot');
    if (!slot) return false;
    host = slot.querySelector('.rs-host') || slot;
    stageEl = doc.getElementById('rsStage');
    if (!stageEl) { stageEl = el('div', 'rs-stage', { id: 'rsStage' }); host.appendChild(stageEl); }
    /* the base engine's stack and panel go: its boot (at DOMContentLoaded) finds no #rsStack and binds nothing */
    ['rsStack', 'rsPanel'].forEach((id) => { const old = doc.getElementById(id); if (old) old.remove(); });
    stageEl.classList.add('pmn-stage');
    stageEl.textContent = '';
    stageEl.setAttribute('aria-live', 'off');

    stackEl = el('button', 'pmn-stack', { type: 'button', id: 'pmnStack', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'pmnPanel', 'data-state': 'empty', 'data-pm-hover-exempt': 'true' });
    stackEl.innerHTML =
      '<span class="pmn-bell" aria-hidden="true">' + icon('bell') + '<i class="pmn-bell-light"></i></span>' +
      '<span class="pmn-deck" aria-hidden="true"><span class="pmn-peek pmn-peek-2"></span><span class="pmn-peek pmn-peek-1"></span>' +
      '<span class="pmn-front"><span class="pmn-front-ico"></span><span class="pmn-front-roll"><span class="pmn-front-title"></span></span><span class="pmn-front-when"></span></span></span>' +
      '<span class="pmn-badge" aria-hidden="true"><span class="pmn-badge-num">0</span></span>' +
      '<span class="pmn-light" aria-hidden="true"></span>';
    host.insertBefore(stackEl, stageEl);
    bellEl = stackEl.querySelector('.pmn-bell');
    frontEl = stackEl.querySelector('.pmn-front');
    peekEls = [stackEl.querySelector('.pmn-peek-1'), stackEl.querySelector('.pmn-peek-2')];
    badgeEl = stackEl.querySelector('.pmn-badge'); badgeNum = stackEl.querySelector('.pmn-badge-num');

    panelEl = el('section', 'pmn-panel', { id: 'pmnPanel', role: 'dialog', 'aria-labelledby': 'pmnPanelTitle', hidden: '' });
    panelEl.innerHTML =
      '<div class="pmn-chrome">' +
        '<header class="pmn-head"><span class="pmn-head-ico" aria-hidden="true">' + icon('bell') + '</span>' +
          '<h2 class="pmn-head-title" id="pmnPanelTitle"></h2><span class="pmn-head-count"></span><span class="pmn-head-gap"></span>' +
          '<button type="button" class="pmn-textbtn" data-pmn="readall"></button><button type="button" class="pmn-textbtn pmn-textbtn-clear" data-pmn="clear"></button></header>' +
        '<div class="pmn-scroll"><div class="pmn-list" role="list"></div>' +
          '<div class="pmn-empty" hidden><span class="pmn-empty-art" aria-hidden="true"></span><div class="pmn-empty-title"></div><div class="pmn-empty-sub"></div></div></div>' +
      '</div>';
    host.appendChild(panelEl);
    panelEl.querySelector('.pmn-head-title').textContent = T('title');
    panelEl.querySelector('[data-pmn="readall"]').textContent = T('markAllRead');
    panelEl.querySelector('[data-pmn="clear"]').textContent = T('clearAll');
    listEl = panelEl.querySelector('.pmn-list'); scrollEl = panelEl.querySelector('.pmn-scroll');
    emptyEl = panelEl.querySelector('.pmn-empty'); headCount = panelEl.querySelector('.pmn-head-count');

    wire();
    booted = true;
    renderStack(false);
    return true;
  }

  /* ---------- the stack (collapsed, in the title bar) --------------------------------------------------------------- */
  function ordered() {
    return items.slice().sort((a, b) => (b.level === 'blocking') - (a.level === 'blocking') || b.createdAt - a.createdAt);
  }
  const unread = () => items.reduce((n, it) => n + (it.read ? 0 : 1), 0);

  function renderStack(animate, landed) {
    if (!stackEl) return;
    const list = ordered(), n = list.length, top = list[0] || null, u = unread();
    const was = stackEl.getAttribute('data-state');
    stackEl.setAttribute('data-state', n ? 'filled' : 'empty');
    stackEl.setAttribute('data-depth', String(Math.min(n, 3)));
    stackEl.toggleAttribute('data-needs', list.some((it) => it.level === 'blocking'));
    stackEl.setAttribute('aria-label', u ? T('stackUnread', { n: u }) : n ? T('stackSome', { n }) : T('stackEmpty'));
    stackEl.setAttribute('title', u ? T('stackUnread', { n: u }) : T('title'));
    if (top) {
      frontEl.className = 'pmn-front n-sev-' + top.severity;
      frontEl.setAttribute('data-level', top.level);
      const changed = !lastFront || lastFront !== top.id + '|' + top.count;
      if (changed) {
        const roll = frontEl.querySelector('.pmn-front-roll');
        roll.querySelectorAll('.pmn-roll-out').forEach((x) => { try { x.getAnimations().forEach((a) => a.cancel()); } catch (_) { /* none */ } x.remove(); });
        const oldT = roll.querySelector('.pmn-front-title');
        const t = el('span', 'pmn-front-title'); t.textContent = top.title + (top.count > 1 ? '  ×' + top.count : '');
        frontEl.querySelector('.pmn-front-ico').innerHTML = icon(top.icon);
        if (animate && lastFront && !still() && oldT && oldT.textContent) {
          roll.appendChild(t);
          const m = motion();
          if (look() === 'retro' || look() === 'nier') {
            oldT.remove();
            play(t, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: m.enter.duration, easing: m.enter.easing });
          } else {
            oldT.classList.add('pmn-roll-out');
            const a = play(oldT, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(9px)', opacity: 0 }], { duration: 200, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
            play(t, [{ transform: 'translateY(-11px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: m.enter.duration, easing: m.enter.easing });
            done(a).then(() => oldT.remove());
          }
        } else { roll.textContent = ''; roll.appendChild(t); }
        lastFront = top.id + '|' + top.count;
      }
      frontEl.querySelector('.pmn-front-when').textContent = ago(top.createdAt);
    } else lastFront = null;
    /* the count badge counts the unread (F3-453) */
    badgeNum.textContent = u > 99 ? '99+' : look() === 'retro' ? String(u).padStart(2, '0') : String(u);
    badgeEl.toggleAttribute('data-on', u > 0);
    badgeEl.setAttribute('data-sev', list.some((it) => !it.read && it.level === 'blocking') ? 'error' : list.some((it) => !it.read && it.level === 'attention') ? 'warn' : 'info');
    if (animate && !still()) {
      const m = motion();
      if (was === 'empty' && n) {
        play(stackEl.querySelector('.pmn-deck'), look() === 'retro' || look() === 'nier'
          ? [{ clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0 0 0)' }]
          : [{ transform: 'scaleX(.12)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: m.panel.duration, easing: m.panel.easing });
      } else if (was === 'filled' && !n) {
        play(bellEl, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: m.pop.duration, easing: m.pop.easing });
      }
      if (landed) catchLanding(u);
      else if (u !== lastUnread && u > 0) bumpBadge(u > lastUnread);
    }
    lastUnread = u;
  }
  function bumpBadge(up) {
    const m = motion();
    play(badgeEl, up ? [{ transform: 'scale(.55)' }, { transform: 'scale(1)' }] : [{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: m.pop.duration, easing: m.pop.easing });
  }
  /* a lasting notice lands on the stack: the deck catches it, the badge counts it, the look adds its flourish */
  function catchLanding(u) {
    const m = motion(), L = look(), deck = stackEl.querySelector('.pmn-deck');
    if (L === 'retro') {
      play(deck, [{ filter: 'brightness(2.2)' }, { filter: 'brightness(1)' }], { duration: 240, easing: 'steps(3, end)' });
    } else if (L === 'nier') {
      play(deck, [{ transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 160, easing: 'steps(2, end)' });
    } else {
      play(deck, [{ transform: 'scale(1.06, .86)' }, { transform: 'none' }], { duration: m.pop.duration, easing: m.pop.easing });
    }
    if (u > 0) bumpBadge(true);
    if (L === 'friendly' && !still()) {
      /* the Wii's blue mail light, and a +1 that floats off the badge like a StreetPass hit */
      const light = stackEl.querySelector('.pmn-light');
      play(light, [{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 0.25, offset: 0.42 }, { opacity: 0.9, offset: 0.62 }, { opacity: 0 }], { duration: 1500, easing: 'ease-in-out' });
      const plus = el('span', 'pmn-plus'); plus.textContent = '+1'; stackEl.appendChild(plus);
      done(play(plus, [{ transform: 'translateY(2px) scale(.6)', opacity: 0 }, { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: 0.3 }, { transform: 'translateY(-22px) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })).then(() => plus.remove());
    }
  }

  /* ---------- the stage (toasts under the bell) -------------------------------------------------------------------- */
  function rects(nodes) { const m = new Map(); nodes.forEach((n) => m.set(n, n.getBoundingClientRect())); return m; }
  function flip(before, skip) {
    if (still()) return;
    const m = motion();
    before.forEach((r, n) => {
      if (n === skip || !n.isConnected || n.classList.contains('pmn-leaving')) return;
      /* one move at a time: a card still moving from the last change (a card arriving) that moves again (one dismissed
         at once) starts from where it is on screen; two added moves pulled it past its place, over the row above */
      if (n.__pmnMove) { n.__pmnMove.cancel(); n.__pmnMove = null; }
      const r2 = n.getBoundingClientRect(), dy = r.top - r2.top, dx = r.left - r2.left;
      if (Math.abs(dy) < 0.5 && Math.abs(dx) < 0.5) return;
      n.__pmnMove = play(n, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: m.move.duration, easing: m.move.easing, composite: 'add' });
    });
  }
  const stagedCards = () => Array.prototype.filter.call(stageEl.children, (c) => c.classList.contains('pmn-toast') && !c.classList.contains('pmn-leaving'));
  const stageKids = () => Array.prototype.filter.call(stageEl.children, (c) => !c.classList.contains('pmn-leaving'));

  function toastEl(it) {
    const c = el('div', 'pmn-toast n-sev-' + it.severity, { role: it.level === 'blocking' || it.level === 'attention' ? 'alert' : 'status', 'data-level': it.level, 'data-kind': it.kind, 'data-src': it.source, 'data-pmn-id': it.id, 'data-lg-surface': 'menu' });
    c.innerHTML =
      '<div class="pmn-toast-in">' +
        '<span class="pmn-tile" aria-hidden="true">' + icon(it.icon) + '</span>' +
        '<div class="pmn-text"><div class="pmn-kicker"><span class="pmn-src"></span><span class="pmn-when"></span></div>' +
          '<div class="pmn-title n-title"></div><div class="pmn-body n-body"></div><div class="pmn-acts"></div></div>' +
        '<button type="button" class="pmn-x" aria-label="' + T('dismiss') + '">' + icon('x') + '</button>' +
      '</div><span class="pmn-count" aria-hidden="true"></span><i class="pmn-timer" aria-hidden="true"></i>';
    fillToast(c, it);
    return c;
  }
  function fillToast(c, it) {
    c.className = 'pmn-toast n-sev-' + it.severity + (c.classList.contains('pmn-leaving') ? ' pmn-leaving' : '');
    c.setAttribute('data-level', it.level); c.setAttribute('data-kind', it.kind); c.setAttribute('data-src', it.source);
    c.querySelector('.pmn-tile').innerHTML = icon(it.icon);
    c.querySelector('.pmn-src').textContent = it.level === 'quiet' ? '' : T('src.' + it.source);
    c.querySelector('.pmn-when').textContent = it.level === 'quiet' ? '' : T('now');
    c.querySelector('.pmn-title').textContent = it.title;
    c.querySelector('.pmn-body').textContent = it.body;
    c.querySelector('.pmn-body').hidden = !it.body;
    const acts = c.querySelector('.pmn-acts');
    acts.textContent = '';
    const sa = stageActions(it), sp = sa.find((x) => PRIMARY.test(x));
    sa.forEach((aid) => {
      const b = el('button', 'pmn-btn' + (aid === sp ? ' pmn-btn-primary' : DANGER.test(aid) ? ' pmn-btn-danger' : ''), { type: 'button', 'data-aid': aid });
      b.textContent = actionLabel(aid, it);
      acts.appendChild(b);
    });
    acts.hidden = !acts.childElementCount;
    const cnt = c.querySelector('.pmn-count');
    cnt.textContent = it.count > 1 ? '×' + it.count : '';
    cnt.hidden = it.count < 2;
  }

  function stage(it) {
    if (!boot()) return;
    /* the cap: the oldest goes (a lasting one joins at once rather than vanishing) */
    const live = stagedCards();
    if (live.length >= STAGE_CAP) {
      const oldest = live[0]; const rec = staged.get(oldest.getAttribute('data-pmn-id'));
      if (rec) finishStaged(rec, rec.it.durable ? 'join' : 'fade');
    }
    const c = toastEl(it);
    const before = rects(stageKids());
    stageEl.appendChild(c);   // last child: NieR Mode's parts read it here, synchronously
    const rec = { it, el: c, timer: null, left: it.stageMs, started: 0, leaving: false };
    staged.set(it.id, rec);
    clampStage();
    /* the page shell places the stage tight under the title bar at the bell, on every page (home-redesign
       50-pageshell.js; Jared, 2026-10-29: the cards used to move down or aside to a spot clear of every control, so
       each page put them somewhere else). Placed after the coming frame's layout and before its paint (B5: placed at
       once, a toast staged inside a look change's commit measured the whole page while that restyle was pending);
       the card's first frame is already in its place */
    const settle = () => {
      if (!staged.has(it.id) || staged.get(it.id) !== rec || rec.leaving) return;
      flip(before, c);
      /* the cards already showing slide down first; the new one arrives into the slot they open, so two titles never
         show through each other (frame review, 2026-10-13) */
      if (still()) { /* Reduced Motion: it is simply there */ }
      else enter(c, it, before.size ? Math.round(motion().move.duration * (look() === 'retro' || look() === 'nier' ? 0.5 : 0.32)) : 0);
      startTimer(rec);
    };
    if (typeof window.PM_NOTICE_PLACE === 'function' && window.PM_NOTICE_PLACE.length >= 1) window.PM_NOTICE_PLACE(settle);
    else { if (typeof window.PM_NOTICE_PLACE === 'function') window.PM_NOTICE_PLACE(); settle(); }
    sound(it.level === 'blocking' ? (it.severity === 'error' ? 'error' : 'callout') : it.level === 'attention' ? 'warn' : it.level === 'notice' ? 'callout' : null, it.level === 'quiet' ? 0.3 : 0.55);
  }
  function enter(c, it, delay) {
    const m = motion(), L = look();
    /* a card takes no clicks until it can be seen: while it waits out its delay and while it fades or unclips in, it
       is invisible or nearly so, and a click meant for the control under it must reach that control (Jared #19) */
    c.style.pointerEvents = 'none';
    const shown = () => { if (c.isConnected && !c.classList.contains('pmn-leaving')) c.style.pointerEvents = ''; };
    const play = (e, f, o) => {
      const a = e && typeof e.animate === 'function' ? e.animate(f, Object.assign({ fill: 'backwards', delay: delay || 0 }, o)) : null;
      if (e === c) { if (a && a.finished) a.finished.then(shown, shown); else shown(); }
      return a;
    };
    if (L === 'retro') {
      play(c, [{ transform: 'scaleY(.04)', filter: 'brightness(2.4)' }, { transform: 'scaleY(1)', filter: 'brightness(1.6)', offset: 0.6 }, { transform: 'none', filter: 'none' }], { duration: 220, easing: 'steps(5, end)' });
      typeOn(c.querySelector('.pmn-title'));
    } else if (L === 'nier') {
      play(c, [{ clipPath: 'inset(calc(50% - 1px) 100% calc(50% - 1px) 0)' }, { clipPath: 'inset(calc(50% - 1px) 0 calc(50% - 1px) 0)', offset: 0.45 }, { clipPath: 'inset(0 0 0 0)' }], { duration: 300, easing: 'steps(9, end)' });
    } else if (L === 'friendly') {
      play(c, [{ transform: 'translateY(-14px) scale(.7)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'none', opacity: 1 }], { duration: m.enter.duration, easing: m.enter.easing });
    } else if (L === 'glass') {
      play(c, [{ transform: 'translateY(-10px) scale(.92)', opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', offset: 0.35 }, { transform: 'none', opacity: 1, filter: 'none' }], { duration: m.enter.duration, easing: m.enter.easing });
    } else {
      play(c, [{ transform: 'translateY(-8px) scale(.97)', opacity: 0 }, { opacity: 1, offset: 0.4 }, { transform: 'none', opacity: 1 }], { duration: m.enter.duration, easing: m.enter.easing });
    }
  }
  /* Retro: the title types on, one character at a time, with the block cursor riding its end; the words not typed yet
     keep their place (invisible), so a title that wraps never grows the card while it types */
  function typeOn(t) {
    const text = t.textContent; if (!text) return;
    const n = Math.min(text.length, 48), per = Math.max(8, Math.min(18, 320 / n)), step = Math.max(1, Math.round(text.length / n));
    const typed = doc.createTextNode(''), cur = el('span', 'pmn-typecur'), rest = el('span', 'pmn-typerest');
    rest.textContent = text;
    t.textContent = ''; t.append(typed, cur, rest); t.setAttribute('data-typing', '');
    let i = 0;
    const tick = () => {
      if (!t.isConnected || rest.parentNode !== t) return;
      i = Math.min(text.length, i + step);
      typed.nodeValue = text.slice(0, i); rest.textContent = text.slice(i);
      if (i < text.length) setTimeout(tick, per); else { t.textContent = text; t.removeAttribute('data-typing'); }
    };
    setTimeout(tick, 60);
  }

  /* the timer: a line that runs out along the card's foot; hovering the stage (or a focus inside it) holds every card */
  let held = false;
  function startTimer(rec) {
    const bar = rec.el.querySelector('.pmn-timer');
    const L = look();
    rec.bar = real(bar, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: rec.it.stageMs, easing: L === 'retro' ? 'steps(24, end)' : L === 'nier' ? 'steps(12, end)' : 'linear', fill: 'forwards' });
    if (rec.bar) {
      if (held || doc.hidden) rec.bar.pause();
      rec.bar.finished.then(() => { if (!rec.leaving) finishStaged(rec, rec.it.durable ? 'join' : 'fade'); }).catch(() => null);
    } else rec.timer = setTimeout(() => finishStaged(rec, rec.it.durable ? 'join' : 'fade'), rec.it.stageMs);
  }
  function hold(on) {
    if (held === on) return;
    held = on;
    staged.forEach((rec) => { if (rec.bar && !rec.leaving) { if (on) rec.bar.pause(); else rec.bar.play(); } });
  }
  function restartTimer(rec) {
    if (rec.bar) { rec.bar.currentTime = 0; if (!held) rec.bar.play(); }
  }

  /* a staged card goes: 'fade' (time is up), 'dismiss' (x, swipe), 'join' (into the stack), 'act' (an action ran) */
  function finishStaged(rec, how, opts) {
    if (!rec || rec.leaving) return Promise.resolve();
    rec.leaving = true;
    if (rec.bar) { rec.bar.onfinish = null; try { rec.bar.cancel(); } catch (_) { /* gone */ } }
    clearTimeout(rec.timer);
    staged.delete(rec.it.id);
    const c = rec.el;
    if (how === 'join' && method() !== 'Banner' && !(opts && opts.instant)) return fly(rec);
    if (how === 'join') { land(rec.it); c.remove(); return Promise.resolve(); }
    if (still()) { c.remove(); return Promise.resolve(); }
    const m = motion(), L = look();
    const before = rects(stageKids());
    lift(c);
    flip(before, c);
    let frames;
    if (how === 'dismiss') frames = [{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + (opts && opts.dx ? Math.sign(opts.dx) * 120 : 90) + 'px)', opacity: 0 }];
    else if (L === 'retro') frames = [{ transform: 'none', opacity: 1 }, { transform: 'scaleY(.04)', opacity: 1, offset: 0.6 }, { transform: 'scale(0, .04)', opacity: 0 }];
    else if (L === 'nier') frames = [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(calc(50% - 1px) 0 calc(50% - 1px) 0)', offset: 0.55 }, { clipPath: 'inset(calc(50% - 1px) 0 calc(50% - 1px) 100%)' }];
    else if (L === 'friendly') frames = [{ transform: 'none', opacity: 1 }, { transform: 'translateY(4px) scale(1.03)', opacity: 1, offset: 0.3 }, { transform: 'translateY(-10px) scale(.6)', opacity: 0 }];
    else frames = [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-6px) scale(.97)', opacity: 0 }];
    return done(play(c, frames, { duration: how === 'dismiss' ? 200 : m.leave.duration, easing: how === 'dismiss' ? 'cubic-bezier(.4,0,1,1)' : m.leave.easing, fill: 'forwards' })).then(() => c.remove());
  }
  /* take a leaving card out of the column where it is, so the rest close up while it plays its exit */
  function lift(c) {
    const r = c.getBoundingClientRect(), s = stageEl.getBoundingClientRect();
    c.classList.add('pmn-leaving');
    c.style.position = 'absolute'; c.style.left = (r.left - s.left) + 'px'; c.style.top = (r.top - s.top) + 'px'; c.style.width = r.width + 'px';
    c.style.pointerEvents = 'none';
  }
  /* the join: the card flies from the stage into the stack's front card, shrinking into it */
  function fly(rec) {
    const c = rec.el, it = rec.it;
    if (still() || !stackEl || !stackEl.getClientRects().length) { land(it); c.remove(); return Promise.resolve(); }
    const before = rects(stageKids());
    const from = c.getBoundingClientRect();
    lift(c);
    flip(before, c);
    const tgt = (stackEl.getAttribute('data-state') === 'filled' ? frontEl : stackEl).getBoundingClientRect();
    const dx = (tgt.left + tgt.width / 2) - (from.left + from.width / 2), dy = (tgt.top + tgt.height / 2) - (from.top + from.height / 2);
    const sx = Math.max(0.12, tgt.width / from.width), sy = Math.max(0.12, tgt.height / from.height);
    const dist = Math.hypot(dx, dy), m = motion(), L = look();
    c.classList.add('pmn-flying');
    let frames, dur = m.join.duration, easing = m.join.easing;
    /* the card shrinks evenly (its words never squeeze) toward the stack's front card and is gone as it reaches it; the
       stack catches it at 80 % and rolls the new title in. Each look travels its own way. */
    const k = Math.max(0.12, Math.min(1, sy * 1.05));
    if (L === 'friendly') {
      /* a hop: up, over and down into the stack, tipping a little, like an icon dropped into a Wii menu folder */
      const lift = -Math.min(64, 22 + dist * 0.12);
      frames = [
        { transform: 'translate(0,0) scale(1) rotate(0deg)', easing: 'cubic-bezier(.3,0,.5,1)' },
        { transform: 'translate(' + (dx * 0.42) + 'px,' + (Math.min(0, dy) * 0.42 + lift) + 'px) scale(' + ((1 + k) / 2) + ') rotate(-6deg)', offset: 0.5, easing: 'cubic-bezier(.5,0,.7,1)' },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ') rotate(0deg)' }
      ];
      dur = Math.max(600, Math.min(820, 500 + dist * 0.32)); easing = 'linear';
    } else if (L === 'retro' || L === 'nier') {
      frames = [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' }];
      dur = Math.max(dur, Math.min(460, 240 + dist * 0.18));
    } else {
      frames = [{ transform: 'translate(0,0) scale(1)', filter: 'blur(0px)' },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')', filter: L === 'glass' ? 'blur(1px)' : 'blur(0px)' }];
      dur = Math.max(460, Math.min(700, 360 + dist * 0.24)); easing = 'cubic-bezier(.55,0,.25,1)';
    }
    c.style.transformOrigin = '50% 50%';
    play(c, [{ opacity: 1 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }], { duration: dur, easing: L === 'retro' || L === 'nier' ? 'steps(4, end)' : 'linear', fill: 'forwards' });
    let landed = false;
    const catchIt = () => { if (landed) return; landed = true; land(it); sound('land', 0.35); };
    const tick = play(c.querySelector('.pmn-timer'), [{ visibility: 'hidden' }, { visibility: 'hidden' }], { duration: dur * 0.8 });
    if (tick) done(tick).then(catchIt); else setTimeout(catchIt, dur * 0.8);
    return done(play(c, frames, { duration: dur, easing, fill: 'forwards' })).then(() => { c.remove(); catchIt(); });
  }

  /* ---------- the store's changes ---------------------------------------------------------------------------- */
  /* quietly: the card went another way (an action, a swipe); the stack counts it without the landing flourish */
  function land(it, quietly) {
    if (items.some((x) => x.id === it.id)) return;
    items.unshift(it);
    if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
    if (it.lifeMs) it.expires = Date.now() + it.lifeMs;
    renderStack(true, !quietly);
    if (open && !clearing) renderPanel(true);
  }
  function dismiss(id, how) {
    const rec = staged.get(id);
    if (rec) finishStaged(rec, 'dismiss');
    const had = items.length;
    items = items.filter((x) => x.id !== id);
    explainOpen.delete(id); patternEdit.delete(id);
    if (items.length !== had) { renderStack(true); if (open && !clearing) renderPanel(true, how); }
  }
  /* Clear all (F3-461: bottom to top, each row collapsing up, then the panel closes with no empty flash). The rows'
     exit holds its end state (fill forwards) until the panel has closed, so the list never shows empty; the cached rows,
     group heads and fold buttons it animated are then dropped, never reused (resetList), so a notice that arrives
     afterwards, even one that reuses an id, always gets fresh, visible nodes (landing review, 2026-10-14). Only the
     notices that were there when Clear all was pressed are cleared: one arriving during the exit stays. */
  let clearing = false, listStale = false;
  function clearAll() {
    if (clearing) return;
    staged.forEach((rec) => finishStaged(rec, rec.it.durable ? 'join' : 'fade', { instant: true }));
    const gone = new Set(items.map((it) => it.id));
    const forget = () => {
      items = items.filter((it) => !gone.has(it.id));
      gone.forEach((id) => { explainOpen.delete(id); patternEdit.delete(id); });
      listStale = true;
    };
    if (!open || still()) { forget(); renderStack(true); if (open) { if (items.length) renderPanel(false); else closePanel(); } return; }
    clearing = true;
    const rows = Array.prototype.slice.call(listEl.querySelectorAll('.pmn-item, .pmn-group-head, .pmn-fold'));
    const m = motion(), L = look(), n = rows.length;
    panelEl.setAttribute('data-clearing', '');
    const d = L === 'friendly' ? 300 : 220;
    rows.forEach((r, i) => play(r, L === 'retro' || L === 'nier'
      ? [{ clipPath: 'inset(0 0 0 0)', opacity: 1 }, { clipPath: 'inset(0 100% 0 0)', opacity: 1 }]
      : [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-16px) scale(.96)', opacity: 0 }],
      { duration: d, delay: (n - 1 - i) * 34, easing: L === 'retro' || L === 'nier' ? 'steps(4, end)' : m.leave.easing, fill: 'forwards' }));
    /* the panel starts to close while the top row is still leaving, so it never shows empty */
    const lead = play(panelEl.querySelector('.pmn-head'), [{ opacity: 1 }, { opacity: 1 }], { duration: Math.max(0, (n - 1) * 34 + d * 0.55) });
    done(lead).then(() => {
      clearing = false;
      panelEl.removeAttribute('data-clearing');
      forget();
      renderStack(true);
      sound('close', 0.35);
      if (!open) { resetList(); return; }
      if (items.length) renderPanel(true);   // something arrived while the rows were leaving: it stays, and so does the panel
      else closePanel(true);
    });
  }
  /* the inbox's cached nodes go: every animation on them is cancelled (so no held end state survives) and they leave
     the DOM; the next render builds fresh ones */
  function resetList() {
    listStale = false;
    const drop = (node) => {
      if (!node) return;
      try { node.getAnimations({ subtree: true }).forEach((a) => a.cancel()); } catch (_) { /* no animations API */ }
      node.remove();
    };
    rowEls.forEach(drop); rowEls.clear();
    groupEls.forEach((G) => { drop(G.more); drop(G.head); drop(G.box); }); groupEls.clear();
    Array.prototype.slice.call(listEl.children).forEach(drop);
    focusId = null;
  }
  function markAllRead() { items.forEach((it) => { it.read = true; }); renderStack(true); if (open && !clearing) renderPanel(false); }

  /* ---------- push: every caller ends here ---------------------------------------------------------------------- */
  function push(input, opts, extra) {
    const it = (input && input.__pmn) ? input : normalize(input, opts, extra);
    if (!boot()) { try { console.log('[notify]', it.title); } catch (_) { /* no console */ } return it.id; }
    if (!masterOn() && !it.durable) return it.id;   // total quiet: a confirmation has nowhere to go
    /* the same words again: count up on the card or the inbox row already there */
    for (const rec of staged.values()) {
      if (!rec.leaving && sameWords(rec.it, it) && it.createdAt - rec.it.createdAt < MERGE_MS) {
        rec.it.count++; rec.it.createdAt = it.createdAt; fillToast(rec.el, rec.it); restartTimer(rec); bumpCard(rec.el); return rec.it.id;
      }
    }
    const twin = items.find((x) => sameWords(x, it) && it.createdAt - x.createdAt < MERGE_MS * 5);
    if (twin && it.durable) { twin.count++; twin.read = false; twin.createdAt = it.createdAt; items = [twin].concat(items.filter((x) => x !== twin)); renderStack(true); if (open && !clearing) renderPanel(true); return twin.id; }
    /* one event, two messages (a quick note and a lasting notice): one card, the lasting words win */
    for (const rec of staged.values()) {
      if (!rec.leaving && sameEvent(rec.it, it)) {
        if (it.durable && !rec.it.durable) { const keep = rec.it.id; Object.assign(rec.it, it, { id: keep, count: rec.it.count }); fillToast(rec.el, rec.it); restartTimer(rec); morphCard(rec.el); }
        return rec.it.id;
      }
    }
    if (!it.durable) {
      if (items.some((x) => sameEvent(x, it))) return it.id;
      stage(it); return it.id;
    }
    /* lasting: straight into an open inbox, the stack (no pop-ups, System Tray, or a caller's skipStage), a banner, or the stage */
    if (open || !masterOn() || method() === 'System Tray' || (opts && opts.skipStage)) { land(it); return it.id; }
    if (method() === 'Banner') { banner(it); return it.id; }
    stage(it);
    return it.id;
  }
  function bumpCard(c) {
    if (still()) return;
    const m = motion();
    play(c.querySelector('.pmn-count'), [{ transform: 'scale(1.6)' }, { transform: 'none' }], { duration: m.pop.duration, easing: m.pop.easing });
    play(c, look() === 'retro' || look() === 'nier' ? [{ transform: 'translateX(3px)' }, { transform: 'none' }] : [{ transform: 'scale(1.025)' }, { transform: 'none' }], { duration: m.pop.duration, easing: m.pop.easing });
  }
  function morphCard(c) {
    if (still()) return;
    const L = look();
    play(c.querySelector('.pmn-toast-in'), L === 'retro' || L === 'nier' ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0.2, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: L === 'retro' || L === 'nier' ? 'steps(3, end)' : 'ease-out' });
  }

  /* ---------- Banner (Settings: How Alerts Appear = Banner): one strip under the title bar ------------------------- */
  const bannerQ = [];
  function banner(it) {
    bannerQ.push(it);
    if (bannerEl && bannerEl.isConnected) return;
    nextBanner();
  }
  function nextBanner() {
    const it = bannerQ.shift();
    if (!it) return;
    const bar = doc.querySelector('.title-bar');
    bannerEl = el('div', 'pmn-banner n-sev-' + it.severity, { role: it.level === 'blocking' ? 'alert' : 'status', 'data-level': it.level, 'data-lg-surface': 'menu' });
    bannerEl.innerHTML = '<span class="pmn-tile" aria-hidden="true">' + icon(it.icon) + '</span><span class="pmn-banner-text"><b class="n-title"></b><span class="n-body"></span></span>' +
      '<button type="button" class="pmn-btn" data-pmn="banner-open"></button><button type="button" class="pmn-x" aria-label="' + T('dismiss') + '">' + icon('x') + '</button><i class="pmn-timer" aria-hidden="true"></i>';
    bannerEl.querySelector('.n-title').textContent = it.title;
    bannerEl.querySelector('.n-body').textContent = it.body;
    const ob = bannerEl.querySelector('[data-pmn="banner-open"]'); ob.textContent = T('show');
    (bar && bar.parentElement ? bar.parentElement : doc.body).appendChild(bannerEl);
    const b = bannerEl, m = motion();
    if (!still()) play(b, look() === 'retro' || look() === 'nier' ? [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }] : [{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: m.panel.duration, easing: m.panel.easing });
    const finish = (how) => {
      if (b.__gone) return; b.__gone = true;
      if (how !== 'dismiss') land(it);
      const end = () => { b.remove(); bannerEl = null; nextBanner(); };
      if (still()) end(); else done(play(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' })).then(end);
    };
    const t = real(b.querySelector('.pmn-timer'), [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: it.stageMs + 1200, easing: 'linear', fill: 'forwards' });
    if (t) t.finished.then(() => finish('join')).catch(() => null);
    b.addEventListener('pointerenter', () => t && t.pause()); b.addEventListener('pointerleave', () => t && t.play());
    b.querySelector('.pmn-x').addEventListener('click', () => finish('dismiss'));
    ob.addEventListener('click', () => { finish('join'); openPanel(); });
  }

  /* ---------- the inbox (the sprout panel) ---------------------------------------------------------------------- */
  const rowEls = new Map();
  function groupsOf(list) {
    const g = new Map();
    list.forEach((it) => { const k = it.level === 'blocking' ? 'needs' : it.source; if (!g.has(k)) g.set(k, []); g.get(k).push(it); });
    return SOURCES.filter((k) => g.has(k)).map((k) => ({ key: k, items: g.get(k) }));
  }
  function rowEl(it) {
    let r = rowEls.get(it.id);
    if (!r) {
      r = el('article', 'pmn-item', { role: 'listitem', tabindex: '-1', 'data-id': it.id, 'data-pmh': 'row' });
      r.innerHTML = '<span class="pmn-unread" aria-hidden="true"></span><span class="pmn-tile" aria-hidden="true"></span>' +
        '<div class="pmn-item-text"><div class="pmn-item-title n-title"></div><div class="pmn-item-body"></div>' +
        '<div class="pmn-item-meta"><span class="pmn-item-src"></span><span class="pmn-item-when"></span><span class="pmn-item-life"></span></div>' +
        '<div class="pmn-item-extra"></div><div class="pmn-item-acts"></div></div>' +
        '<button type="button" class="pmn-x" aria-label="' + T('dismiss') + '">' + icon('x') + '</button><span class="pmn-count" aria-hidden="true"></span>';
      rowEls.set(it.id, r);
    }
    r.className = 'pmn-item n-sev-' + it.severity + ' kind-' + it.kind + (it.read ? '' : ' is-unread');
    r.setAttribute('data-level', it.level);
    r.querySelector('.pmn-tile').innerHTML = icon(it.icon);
    r.querySelector('.pmn-item-title').textContent = it.title;
    const b = r.querySelector('.pmn-item-body'); b.textContent = it.body; b.hidden = !it.body;
    r.querySelector('.pmn-item-src').textContent = T('src.' + (it.level === 'blocking' ? 'needs' : it.source));
    r.querySelector('.pmn-item-when').textContent = ago(it.createdAt);
    const life = r.querySelector('.pmn-item-life');
    life.textContent = it.expires ? T('expires', { n: Math.max(0, Math.ceil((it.expires - Date.now()) / 1000)) }) : '';
    life.hidden = !it.expires;
    const cnt = r.querySelector('.pmn-count'); cnt.textContent = it.count > 1 ? '×' + it.count : ''; cnt.hidden = it.count < 2;
    const extra = r.querySelector('.pmn-item-extra'); extra.textContent = '';
    if (explainOpen.has(it.id) && it.explain) { const x = el('div', 'pmn-explain'); x.textContent = it.explain; extra.appendChild(x); }
    if (patternEdit.has(it.id) && it.patternSuggest) {
      const p = el('label', 'pmn-pattern'); p.innerHTML = '<span></span><input type="text" spellcheck="false">';
      p.querySelector('span').textContent = T('pattern'); p.querySelector('input').value = it.patternSuggest; extra.appendChild(p);
    }
    if (it.needsRationale) { const t = el('textarea', 'pmn-rationale', { rows: '2' }); t.placeholder = it.rationalePlaceholder; t.value = r.__why || ''; t.addEventListener('input', () => { r.__why = t.value; }); extra.appendChild(t); }
    extra.hidden = !extra.childElementCount;
    const acts = r.querySelector('.pmn-item-acts'); acts.textContent = '';
    const first = (it.actions || []).find((x) => PRIMARY.test(x));
    (it.actions || []).forEach((aid) => {
      const btn = el('button', 'pmn-btn' + (aid === first ? ' pmn-btn-primary' : DANGER.test(aid) ? ' pmn-btn-danger' : ''), { type: 'button', 'data-aid': aid });
      btn.textContent = actionLabel(aid, it); acts.appendChild(btn);
    });
    acts.hidden = !acts.childElementCount;
    return r;
  }
  /* each source's box, heading and fold button live as long as the source has notices, so a re-render moves them
     (and they slide) instead of making new ones (which would flash) */
  const groupEls = new Map();
  function groupBox(g, folded) {
    let G = groupEls.get(g.key);
    if (!G) {
      const box = el('div', 'pmn-group', { 'data-group': g.key });
      const head = el('div', 'pmn-group-head', { 'data-group': g.key });
      head.innerHTML = '<span class="pmn-group-ico" aria-hidden="true">' + icon(SOURCE_ICON[g.key]) + '</span><span class="pmn-group-name"></span><span class="pmn-group-n"></span>' +
        '<button type="button" class="pmn-group-fold" data-group="' + g.key + '"><span></span>' + icon('chevron') + '</button>';
      head.querySelector('.pmn-group-name').textContent = T('src.' + g.key);
      const more = el('button', 'pmn-fold', { type: 'button', 'data-group': g.key });
      box.appendChild(head);
      G = { box, head, more };
      groupEls.set(g.key, G);
    }
    G.box.setAttribute('data-folded', folded ? 'true' : 'false');
    G.head.querySelector('.pmn-group-n').textContent = String(g.items.length);
    const f = G.head.querySelector('.pmn-group-fold');
    f.hidden = g.items.length < FOLD_AT;
    f.setAttribute('aria-expanded', folded ? 'false' : 'true');
    f.querySelector('span').textContent = folded ? T('more', { n: g.items.length - 1 }) : T('less');
    G.more.textContent = T('more', { n: g.items.length - 1 });
    return G;
  }
  function renderPanel(animate, how) {
    if (!panelEl) return;
    if (listStale) resetList();
    const list = ordered();
    headCount.textContent = unread() ? T('newCount', { n: unread() }) : '';
    panelEl.toggleAttribute('data-empty', !list.length);
    panelEl.querySelector('[data-pmn="readall"]').hidden = !unread();
    panelEl.querySelector('[data-pmn="clear"]').hidden = !list.length;
    const prev = rects(Array.prototype.slice.call(listEl.querySelectorAll('.pmn-item, .pmn-group-head, .pmn-fold')));
    const startH = panelEl.getBoundingClientRect().height;
    const keep = new Set(list.map((it) => it.id));
    /* rows that are gone leave in place (absolutely placed where they were) while the rest close up */
    const leaving = [];
    rowEls.forEach((r, id) => { if (!keep.has(id)) { rowEls.delete(id); if (r.isConnected && animate && !still()) leaving.push(r); else r.remove(); } });
    leaving.forEach((r) => { liftRow(r); listEl.appendChild(r); });
    const groups = groupsOf(list), live = new Set(groups.map((g) => g.key));
    groupEls.forEach((G, k) => { if (!live.has(k)) { G.box.remove(); groupEls.delete(k); } });
    groups.forEach((g) => {
      const folded = g.items.length >= FOLD_AT && !expandedGroups.has(g.key);
      const G = groupBox(g, folded);
      listEl.appendChild(G.box);   // in source order
      let at = G.head;
      g.items.forEach((it, i) => {
        const r = rowEl(it);
        r.toggleAttribute('data-under', folded && i > 0);
        r.style.setProperty('--pmn-under', String(i));
        if (folded && i > 2) { r.remove(); return; }
        if (at.nextSibling !== r) G.box.insertBefore(r, at.nextSibling);
        at = r;
      });
      Array.prototype.slice.call(G.box.children).forEach((c) => { if (c.classList.contains('pmn-item') && !g.items.some((it) => it.id === c.getAttribute('data-id'))) c.remove(); });
      if (folded) G.box.appendChild(G.more); else G.more.remove();
    });
    emptyEl.hidden = !!list.length;
    if (!list.length) fillEmpty();
    roving();
    if (!animate || still()) { leaving.forEach((r) => r.remove()); return; }
    const m = motion(), L = look();
    /* moved rows slide to their new places; new rows arrive */
    listEl.querySelectorAll('.pmn-item, .pmn-group-head, .pmn-fold').forEach((n) => {
      if (n.classList.contains('pmn-leaving')) return;
      const r = prev.get(n);
      if (!r) { play(n, L === 'retro' || L === 'nier' ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }] : [{ opacity: 0, transform: 'translateY(-8px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: m.enter.duration, easing: m.enter.easing }); return; }
      const r2 = n.getBoundingClientRect(), dy = r.top - r2.top;
      if (Math.abs(dy) > 0.5) play(n, [{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: m.move.duration, easing: m.move.easing });
    });
    leaving.forEach((r) => {
      const frames = L === 'retro' || L === 'nier' ? [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }]
        : how === 'swipe' ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: 'none', opacity: 1 }, { transform: 'translateX(48px)', opacity: 0 }];
      done(play(r, frames, { duration: L === 'retro' || L === 'nier' ? 160 : 220, easing: L === 'retro' || L === 'nier' ? 'steps(4, end)' : 'cubic-bezier(.4,0,1,1)', fill: 'forwards' })).then(() => r.remove());
    });
    /* the panel's height springs to its new size, with the size bounce (F3-461) */
    const endH = panelEl.getBoundingClientRect().height;
    if (Math.abs(endH - startH) > 1 && open) {
      const chrome = panelEl.querySelector('.pmn-chrome');
      play(chrome, [{ height: startH + 'px' }, { height: endH + 'px' }], { duration: m.panel.duration, easing: m.panel.easing });
      if (L !== 'retro' && L !== 'nier') play(panelEl, [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.012, ' + (endH < startH ? 0.985 : 1.02) + ')', offset: 0.4 }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
    }
  }
  function liftRow(r) {
    const rr = r.getBoundingClientRect(), lr = listEl.getBoundingClientRect();
    r.classList.add('pmn-leaving');
    r.style.position = 'absolute'; r.style.left = (rr.left - lr.left) + 'px'; r.style.top = (rr.top - lr.top + listEl.scrollTop) + 'px'; r.style.width = rr.width + 'px';
    r.setAttribute('aria-hidden', 'true'); r.inert = true;
  }
  function fillEmpty() {
    const L = look();
    emptyEl.querySelector('.pmn-empty-art').innerHTML = L === 'friendly' ? icon('mail') + '<i></i><i></i><i></i>' : L === 'retro' ? '<span class="pmn-cursor"></span>' : icon(L === 'nier' ? 'check' : 'bell');
    emptyEl.querySelector('.pmn-empty-title').textContent = T('empty.' + L);
    emptyEl.querySelector('.pmn-empty-sub').textContent = T('emptySub');
  }

  /* keyboard: one row in the tab order at a time; arrows move, Delete dismisses, Enter opens */
  let focusId = null;
  function rows() { return Array.prototype.filter.call(listEl.querySelectorAll('.pmn-item'), (r) => !r.classList.contains('pmn-leaving') && !r.hasAttribute('data-under')); }
  function roving() {
    const rs = rows();
    if (!rs.some((r) => r.getAttribute('data-id') === focusId)) focusId = rs[0] ? rs[0].getAttribute('data-id') : null;
    rs.forEach((r) => r.setAttribute('tabindex', r.getAttribute('data-id') === focusId ? '0' : '-1'));
  }
  function focusRow(i) {
    const rs = rows(); if (!rs.length) return;
    const r = rs[Math.max(0, Math.min(rs.length - 1, i))];
    focusId = r.getAttribute('data-id'); roving(); r.focus({ preventScroll: false });
  }

  function placePanel() {
    panelEl.style.removeProperty('--pmn-shift');
    const r = panelEl.getBoundingClientRect(), pad = 10;
    let shift = 0;
    if (r.right > innerWidth - pad) shift = innerWidth - pad - r.right;
    if (r.left + shift < pad) shift = pad - r.left;
    if (shift) panelEl.style.setProperty('--pmn-shift', Math.round(shift) + 'px');
  }
  function openPanel() {
    if (!boot() || open) return;
    /* what is staged and lasting goes straight into the list it is about to show */
    staged.forEach((rec) => { if (rec.it.durable && !rec.leaving) { rec.leaving = true; staged.delete(rec.it.id); if (rec.bar) { try { rec.bar.cancel(); } catch (_) { /* gone */ } } rec.el.remove(); land(rec.it, true); } });
    open = true;
    if (closing) { closing.cancel(); closing = null; }
    panelEl.hidden = false;
    panelEl.setAttribute('data-open', '');
    panelEl.querySelector('.pmn-chrome').setAttribute('data-lg-surface', 'menu');
    stackEl.setAttribute('aria-expanded', 'true');
    renderPanel(false);
    placePanel();
    pushStage();
    sound('open', 0.4);
    if (!still()) {
      const m = motion(), L = look(), chrome = panelEl.querySelector('.pmn-chrome');
      /* every entrance below plays on the frames that are shown (11-motion-start.js; final motion QA B10): a first frame
         that is long (Glass rastering its blur on first show, about half a second on the P1000) otherwise ran the whole
         entrance behind it, and the panel appeared already open */
      const opening = [], play = (el, frames, o) => { const a = playNow(el, frames, o); if (a) opening.push(a); return a; };
      if (window.PM_START_ON_SHOWN) window.PM_START_ON_SHOWN(() => (open ? opening : []));
      if (L === 'retro') {
        play(chrome, [{ transform: 'scale(1, .01)', filter: 'brightness(3)' }, { transform: 'scale(1, .01)', filter: 'brightness(2)', offset: 0.35 }, { transform: 'none', filter: 'none' }], { duration: 260, easing: 'steps(6, end)' });
      } else if (L === 'nier') {
        play(chrome, [{ clipPath: 'inset(0 50% calc(100% - 2px) 50%)' }, { clipPath: 'inset(0 0 calc(100% - 2px) 0)', offset: 0.4 }, { clipPath: 'inset(0 0 0 0)' }], { duration: 320, easing: 'steps(10, end)' });
      } else {
        const s = stackEl.getBoundingClientRect(), p = panelEl.getBoundingClientRect();
        const ox = Math.max(0, Math.min(p.width, s.left + s.width / 2 - p.left));
        chrome.style.transformOrigin = ox + 'px 0px';
        play(chrome, L === 'friendly'
          ? [{ transform: 'scale(.55, .3)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: 'none', opacity: 1 }]
          : L === 'glass'
            ? [{ transform: 'scale(' + (s.width / p.width) + ',' + (s.height / p.height) + ')', opacity: 0.4, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)', offset: 0.3 }, { transform: 'none', opacity: 1, filter: 'none' }]
            : [{ transform: 'translateY(-6px) scale(.96)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1 }],
          { duration: m.panel.duration, easing: m.panel.easing });
      }
      /* the rows follow the panel in, one after another */
      listEl.querySelectorAll('.pmn-group-head, .pmn-item:not([data-under]), .pmn-fold').forEach((n, i) => {
        if (i > 9) return;
        play(n, L === 'retro' || L === 'nier' ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
          { duration: L === 'retro' || L === 'nier' ? 90 : 260, delay: 60 + i * (L === 'friendly' ? 34 : 24), easing: L === 'retro' || L === 'nier' ? 'steps(2, end)' : 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      });
    }
    clearTimeout(readTimer);
    readTimer = setTimeout(() => { if (open) markAllRead(); }, 900);
  }
  function closePanel(quick, keepFocus) {
    if (!open) return;
    open = false;
    clearTimeout(readTimer);
    stackEl.setAttribute('aria-expanded', 'false');
    panelEl.removeAttribute('data-open');
    pushStage();
    const finish = () => { panelEl.hidden = true; closing = null; panelEl.querySelector('.pmn-chrome').removeAttribute('data-lg-surface'); if (listStale) resetList(); };
    if (panelEl.contains(doc.activeElement) && !keepFocus) stackEl.focus({ preventScroll: true });
    if (still() || quick === 'instant') { finish(); return; }
    const m = motion(), L = look(), chrome = panelEl.querySelector('.pmn-chrome');
    const frames = L === 'retro' ? [{ transform: 'none', opacity: 1 }, { transform: 'scale(1, .01)', opacity: 1, offset: 0.7 }, { transform: 'scale(0, .01)', opacity: 0 }]
      : L === 'nier' ? [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 calc(100% - 2px) 0)', offset: 0.6 }, { clipPath: 'inset(0 50% calc(100% - 2px) 50%)' }]
        : L === 'friendly' ? [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.02)', opacity: 1, offset: 0.25 }, { transform: 'scale(.6, .4)', opacity: 0 }]
          : [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-4px) scale(.97)', opacity: 0 }];
    closing = play(chrome, frames, { duration: L === 'retro' || L === 'nier' ? 180 : quick ? 160 : 200, easing: L === 'retro' || L === 'nier' ? 'steps(5, end)' : 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    sound('close', 0.3);
    if (closing) closing.finished.then(() => { if (!open) { closing.cancel(); finish(); } }).catch(() => null); else finish();
  }
  /* while the inbox is open, cards stage under it, not over it */
  function pushStage() {
    if (!stageEl) return;
    if (open) { const h = panelEl.getBoundingClientRect().height; stageEl.style.setProperty('--pmn-push', Math.round(h + 8) + 'px'); }
    else stageEl.style.removeProperty('--pmn-push');
  }
  /* keep the stage inside the window (its place is under the bell, tight under the title bar, on every page) */
  function clampStage() {
    stageEl.style.removeProperty('--pmn-stage-shift');
    stageEl.style.removeProperty('--pmn-clear');
    const r = stageEl.getBoundingClientRect(), pad = 10;
    let shift = 0;
    if (r.right > innerWidth - pad) shift = innerWidth - pad - r.right;
    if (r.left + shift < pad) shift = pad - r.left;
    if (shift) stageEl.style.setProperty('--pmn-stage-shift', Math.round(shift) + 'px');
    /* Jared #19, nothing the notices show sits over a control: the chat column's top area (its header; with Activity
       Detail open, its head with Pin and close, its domain strip and its scope strip) can lie under the bell. Then the
       stage stays under the bell and drops below every row of it that it would cover, row after row; where nothing
       is under it, it does not move (pm7-build: below rather than beside the column, which covers page toolbars) */
    const left = r.left + shift, right = r.right + shift, h = Math.max(r.height, 64);
    const rows = Array.prototype.map.call(doc.querySelectorAll('#pmRoot .chat-header, #pmRoot .activity-panel-head, #pmRoot .activity-panel .activity-filter:not(.hidden), #pmRoot .activity-panel .pmap-scope'), (e) => e.getBoundingClientRect())
      .filter((q) => q.width && q.height && q.right > left && q.left < right);
    let y = r.top;
    for (let moved = true, n = 0; moved && n < 8; n++) {
      moved = false;
      rows.forEach((q) => { if (q.bottom > y && q.top < y + h) { y = Math.ceil(q.bottom) + 10; moved = true; } });   /* 10: a card's entrance starts 8 px higher */
    }
    if (y > r.top) stageEl.style.setProperty('--pmn-clear', Math.round(y - r.top) + 'px');
    watchChat();
  }
  /* the chat column's top area changes under the cards too: the column grows or pops out (Activity Detail opening, a
     drag), or its rows change without a resize (a domain picked brings its scope strip, the domain strip shown,
     Activity Detail opened over the messages). Look again on a resize, after a press or a key, and four times a
     second while cards show; never during a drag (the page's idle rule) */
  let chatWatched = false, topTimer = 0;
  const reclamp = () => { if (staged.size && !(doc.body && doc.body.classList.contains('pm-resizing'))) clampStage(); };
  function watchChat() {
    if (staged.size && !topTimer) topTimer = setInterval(() => { if (!staged.size) { clearInterval(topTimer); topTimer = 0; return; } reclamp(); }, 250);
    const c = !chatWatched && typeof ResizeObserver === 'function' && doc.getElementById('chatPanel');
    if (!c) return;
    chatWatched = true;
    new ResizeObserver(reclamp).observe(c);
    doc.addEventListener('pointerup', () => requestAnimationFrame(reclamp), true);
    doc.addEventListener('keyup', () => requestAnimationFrame(reclamp), true);
  }

  /* ---------- actions (kind rows: canon F3-461; semantics as the base engine ran them) ----------------------------- */
  function navigate(route) {
    if (!route) return;
    try { if (route.page && window.PM_PAGES && typeof window.PM_PAGES.go === 'function') window.PM_PAGES.go(route.page, route.subTab || null); } catch (_) { /* page missing */ }
    if (route.focus) {
      const f = doc.querySelector('[data-focus="' + route.focus + '"]');
      if (f) { f.classList.add('focus-ring'); setTimeout(() => f.classList.remove('focus-ring'), 1600); }
    }
  }
  function runAction(it, aid, row) {
    if (it.needsRationale && /^(dismiss|resolve|acknowledge)$/.test(aid)) {
      const t = row && row.querySelector('.pmn-rationale');
      if (!t || !t.value.trim()) { if (t) { t.focus(); t.setAttribute('data-missing', ''); } return; }
    }
    if (aid === 'resume_pin') {
      const chip = doc.getElementById(it.pin), b = chip && chip.querySelector('[data-o55-chip="resume"]');
      closePanel(true); dismiss(it.id);
      if (b) b.click();
      return;
    }
    if (aid === 'explain') { if (explainOpen.has(it.id)) explainOpen.delete(it.id); else explainOpen.add(it.id); renderPanel(true); return; }
    if (aid === 'always' && !patternEdit.has(it.id)) { patternEdit.add(it.id); renderPanel(true); return; }
    if (aid === 'decline') {
      dismiss(it.id);
      push({ title: 'Declined: the node is blocked', body: 'Parked at a safe point. Choose how to recover.', severity: 'error', important: true, kind: 'hitl',
        allowed_action_ids: ['retry_safe', 'fresh_attempt', 'open_orch'], routePayload: it.routePayload || { page: 'orchestrator' } });
      return;
    }
    if (NAVIGATES.test(aid)) {
      navigate(aid === 'open_usage' ? { page: 'usage' } : aid === 'open_orch' ? (it.routePayload || { page: 'orchestrator' }) : aid === 'resume_wizard' || aid === 'view_report' ? (it.routePayload || { page: 'planning' }) : it.routePayload);
      it.read = true;
      closePanel(true);
      if (aid === 'open_details' || aid === 'open' || aid === 'open_orch' || aid === 'view_report' || aid === 'open_usage') { renderStack(true); return; }
    } else if (aid === 'retry_safe' || aid === 'fresh_attempt') navigate(it.routePayload || { page: 'orchestrator' });
    dismiss(it.id);
  }

  /* ---------- events ---------------------------------------------------------------------------------------------- */
  function wire() {
    stackEl.addEventListener('click', (e) => { e.stopPropagation(); if (open) closePanel(); else openPanel(); });
    stackEl.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); openPanel(); requestAnimationFrame(() => focusRow(0)); } });
    stackEl.addEventListener('pointerenter', () => stackEl.setAttribute('data-hover', ''));
    stackEl.addEventListener('pointerleave', () => stackEl.removeAttribute('data-hover'));

    /* the stage: hover holds every timer; x dismisses; an action runs; a click opens what it is about; a swipe sideways
       throws the card away */
    stageEl.addEventListener('pointerenter', () => hold(true));
    stageEl.addEventListener('pointerleave', () => hold(false));
    stageEl.addEventListener('focusin', () => hold(true));
    stageEl.addEventListener('focusout', (e) => { if (!stageEl.contains(e.relatedTarget)) hold(false); });
    stageEl.addEventListener('click', (e) => {
      const card = e.target.closest('.pmn-toast'); if (!card) return;
      const rec = staged.get(card.getAttribute('data-pmn-id')); if (!rec || card.__swiped) return;
      e.stopPropagation();
      /* x on a lasting card sends it to the inbox now (dismissing never resolves what it is about: F3-461) */
      if (e.target.closest('.pmn-x')) { finishStaged(rec, rec.it.durable ? 'join' : 'dismiss'); return; }
      const b = e.target.closest('[data-aid]');
      if (b) { const it = rec.it; finishStaged(rec, 'dismiss'); if (it.durable) land(it, true); runAction(it, b.getAttribute('data-aid'), null); return; }
      if (rec.it.routePayload) { const it = rec.it; finishStaged(rec, 'dismiss'); if (it.durable) { it.read = true; land(it, true); } navigate(it.routePayload); }
      else finishStaged(rec, rec.it.durable ? 'join' : 'dismiss');
    });
    let drag = null;
    stageEl.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.pmn-toast'); if (!card || e.button !== 0 || e.target.closest('button')) return;
      drag = { card, x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId, on: false };
    });
    stageEl.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      if (!drag.on && Math.abs(drag.dx) > 6 && Math.abs(drag.dx) > Math.abs(e.clientY - drag.y)) { drag.on = true; try { drag.card.setPointerCapture(e.pointerId); } catch (_) { /* gone */ } }
      if (drag.on) { drag.card.style.translate = drag.dx + 'px 0'; drag.card.style.opacity = String(Math.max(0.2, 1 - Math.abs(drag.dx) / 260)); }
    });
    const endDrag = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag; drag = null;
      if (!d.on) return;
      d.card.__swiped = true; setTimeout(() => { d.card.__swiped = false; }, 0);
      const rec = staged.get(d.card.getAttribute('data-pmn-id'));
      if (Math.abs(d.dx) > 70 && rec) {
        d.card.style.translate = ''; d.card.style.opacity = '';
        if (rec.it.durable) { const it = rec.it; finishStaged(rec, 'dismiss', { dx: d.dx }); land(it, true); } else finishStaged(rec, 'dismiss', { dx: d.dx });
      } else {
        const back = play(d.card, [{ translate: d.dx + 'px 0', opacity: d.card.style.opacity }, { translate: '0px 0', opacity: 1 }], { duration: 260, easing: spring(420, 26).easing });
        d.card.style.translate = ''; d.card.style.opacity = '';
        if (!back) return;
      }
    };
    stageEl.addEventListener('pointerup', endDrag);
    stageEl.addEventListener('pointercancel', endDrag);

    /* the inbox */
    panelEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (clearing) return;
      const tb = e.target.closest('[data-pmn]');
      if (tb) { const k = tb.getAttribute('data-pmn'); if (k === 'clear') clearAll(); else if (k === 'readall') markAllRead(); return; }
      const fold = e.target.closest('.pmn-group-fold, .pmn-fold');
      if (fold) { const g = fold.getAttribute('data-group'); if (expandedGroups.has(g)) expandedGroups.delete(g); else expandedGroups.add(g); renderPanel(true); return; }
      const row = e.target.closest('.pmn-item'); if (!row || row.classList.contains('pmn-leaving')) return;
      const it = items.find((x) => x.id === row.getAttribute('data-id')); if (!it) return;
      if (row.hasAttribute('data-under')) { expandedGroups.add(it.level === 'blocking' ? 'needs' : it.source); renderPanel(true); return; }
      if (e.target.closest('.pmn-x')) { dismiss(it.id); return; }
      const b = e.target.closest('[data-aid]'); if (b) { runAction(it, b.getAttribute('data-aid'), row); return; }
      if (e.target.closest('textarea, input, label')) return;
      it.read = true;
      if (it.routePayload) { navigate(it.routePayload); closePanel(true); renderStack(true); } else renderPanel(false);
    });
    panelEl.addEventListener('keydown', (e) => {
      const row = e.target.closest && e.target.closest('.pmn-item');
      const rs = rows(), i = row ? rs.indexOf(row) : -1;
      if (e.key === 'ArrowDown') { e.preventDefault(); focusRow(i + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) stackEl.focus(); else focusRow(i - 1); }
      else if (e.key === 'Home') { e.preventDefault(); focusRow(0); }
      else if (e.key === 'End') { e.preventDefault(); focusRow(rs.length - 1); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && row && e.target === row) { e.preventDefault(); const next = i; dismiss(row.getAttribute('data-id')); requestAnimationFrame(() => focusRow(Math.min(next, rows().length - 1))); }
      else if (e.key === 'Enter' && row && e.target === row) { e.preventDefault(); row.click(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePanel(); }
    });
    doc.addEventListener('click', (e) => { if (open && !panelEl.contains(e.target) && !stackEl.contains(e.target)) closePanel(); });
    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) closePanel(); }, true);
    doc.addEventListener('visibilitychange', () => { staged.forEach((rec) => { if (rec.bar && !rec.leaving) { if (doc.hidden) rec.bar.pause(); else if (!held) rec.bar.play(); } }); });
    window.addEventListener('resize', () => { if (open) placePanel(); if (staged.size) clampStage(); });

    /* times and lifetimes */
    setInterval(() => {
      if (!items.length) return;
      const now = Date.now();
      items.filter((it) => it.expires && it.expires <= now).forEach((it) => dismiss(it.id));
      if (frontEl && items.length) { const t = ordered()[0]; if (t) frontEl.querySelector('.pmn-front-when').textContent = ago(t.createdAt); }
      if (open) rowEls.forEach((r, id) => { const it = items.find((x) => x.id === id); if (!it) return; r.querySelector('.pmn-item-when').textContent = ago(it.createdAt); if (it.expires) r.querySelector('.pmn-item-life').textContent = T('expires', { n: Math.max(0, Math.ceil((it.expires - now) / 1000)) }); });
    }, 1000);
    /* a look change: the empty art and the stack's glyphs follow it */
    new MutationObserver(() => { if (open && !items.length) fillEmpty(); }).observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
  }

  /* ---------- bridges: onboarding's setup prompt and the tour's page note ---------------------------------------
     The "Finish setting up" / "Continue optional setup" chip (#o55-resume) and the tour's resume chip (#o55-tourchip)
     are made by src/js/95-boot.js, fixed over the page. They keep their element, handlers and selectors (the
     scenario drivers click them), and move into the stage as a pinned prompt: the oldest card in the column under the
     bell, styled like the notices around it (26-notify-50-surfaces.css). The tour's page note (O55.pageToast) becomes
     a quiet notice; it still shows while the tour hushes window.toast. */
  const PINS = ['o55-resume', 'o55-tourchip'];
  /* the prompt keeps out of the way (review r3, the coordinator's ruling on #19, 2026-10-15). Pinned under the bell until
     dismissed, it covered Usage's toolbar and Settings' project picker and page options. Once it has arrived and had a
     moment to be read (PIN_READ_MS), or at the first press, key or wheel anywhere else, it joins the bell the way a
     lasting notice does: a copy flies into the stack, the badge counts it, and the bell's list keeps it as an entry whose
     button does what the prompt's own does. The prompt's element stays in the stage, tucked away, with its handlers and
     selectors (the scenario drivers click it as soon as it shows); a prompt the app shows anew arrives again. */
  const PIN_READ_MS = 4500, pinAt = new Map();
  function pinEntry(chip) {
    const btn = chip.querySelector('[data-o55-chip="resume"]');
    const it = normalize({ title: clean(btn ? btn.textContent : chip.textContent) || 'Finish setting up', body: '', severity: 'info', kind: 'setup', important: true, allowed_action_ids: ['resume_pin'] });
    it.id = 'pin-' + chip.id; it.pin = chip.id; it.source = 'settings'; it.icon = 'spark'; it.level = 'notice';
    return it;
  }
  function tuckPin(chip) {
    const t = pinAt.get(chip.id); if (t) clearTimeout(t.timer); pinAt.delete(chip.id);
    if (!stageEl || !chip.isConnected || chip.parentElement !== stageEl || chip.classList.contains('pmn-pin-tucked')) return;
    const it = pinEntry(chip), known = items.some((x) => x.id === it.id);
    const before = rects(stageKids());
    if (known || still() || !stackEl || !stackEl.getClientRects().length || method() === 'Banner') {
      chip.classList.add('pmn-pin-tucked'); flip(before, chip); if (!known) land(it); return;
    }
    const copy = chip.cloneNode(true);
    copy.removeAttribute('id'); copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    copy.classList.add('pmn-pin-copy'); copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
    stageEl.insertBefore(copy, chip);
    chip.classList.add('pmn-pin-tucked');
    fly({ el: copy, it });   /* it lands as an entry when the copy reaches the stack */
  }
  function tuckPinsOnInput(e) {
    if (!pinAt.size) return;
    const now = performance.now();
    pinAt.forEach((t, id) => {
      const chip = doc.getElementById(id);
      if (!chip || (e.target && e.target.nodeType === 1 && chip.contains(e.target))) return;
      if (now - t.at > 500) tuckPin(chip);   /* not the press that brought it */
    });
  }
  function adopt() {
    if (!stageEl) return;
    PINS.forEach((id) => {
      const chip = doc.getElementById(id);
      if (!chip || chip.parentElement === stageEl) return;
      const before = rects(stageKids());
      chip.classList.add('pmn-pin');
      chip.setAttribute('role', 'group');
      chip.setAttribute('data-lg-surface', 'menu');
      stageEl.insertBefore(chip, stageEl.firstChild);
      chip.classList.remove('pmn-pin-tucked');
      const prev = pinAt.get(id); if (prev) clearTimeout(prev.timer);
      pinAt.set(id, { at: performance.now(), timer: setTimeout(() => tuckPin(chip), PIN_READ_MS + 400) });
      flip(before, chip);
      if (!still()) {
        const L = look(), m = motion();
        play(chip, L === 'retro' || L === 'nier' ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }] : [{ transform: 'translateY(-10px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: m.enter.duration, easing: m.enter.easing, delay: 120 });
      }
    });
  }
  function bridges() {
    adopt();
    if (typeof MutationObserver === 'function' && doc.body) new MutationObserver(adopt).observe(doc.body, { childList: true });
    ['pointerdown', 'keydown', 'wheel'].forEach((t) => doc.addEventListener(t, tuckPinsOnInput, { capture: true, passive: true }));
    /* the prompt gone (onboarding resumed or finished): its entry goes too */
    if (typeof MutationObserver === 'function' && stageEl) new MutationObserver(() => {
      items.filter((it) => it.pin && !doc.getElementById(it.pin)).forEach((it) => dismiss(it.id));
    }).observe(stageEl, { childList: true });
    if (typeof O55.pageToast === 'function' && !O55.pageToast.__pmn) {
      const quiet = function (text, ms) { push({ title: String(text || ''), kind: 'ephemeral', important: false, ttlMs: ms || 4200 }); };
      quiet.__pmn = true;
      O55.pageToast = quiet;
    }
  }

  /* ---------- the API every caller uses ----------------------------------------------------------------------- */
  function toastApi(msg, opts, extra) { try { push(msg, opts, extra); } catch (e) { try { console.warn('[notify]', e); } catch (_) { /* no console */ } } }
  toastApi.important = (msg, opts) => toastApi(msg && typeof msg === 'object' ? Object.assign({}, msg, { important: true }) : msg, Object.assign({}, typeof opts === 'object' ? opts : {}, { important: true }));
  toastApi.push = (msg, opts) => toastApi(msg, opts || {});
  toastApi.clear = () => clearAll();
  toastApi.expand = () => openPanel();
  toastApi.collapse = () => closePanel();

  /* a few moments to show the system (the review page and the films use them): PM_TITLEBAR_NOTIFY.demo(name) */
  const DEMO = {
    quiet: [[0, 'Settings saved']],
    usage: [[0, 'Usage warning: Claude 5h window crossed 80%'], [60, { title: 'Claude 5-hour is at 80% used.', body: 'Usage · another signed-in account can take over', severity: 'warn', kind: 'advisory', page: 'usage', allowed_action_ids: ['open', 'acknowledge'], important: true }]],
    run: [[0, { title: 'Run #47 complete: all seams closed.', body: 'Orchestrator · just now', severity: 'success', kind: 'advisory', page: 'orchestrator', allowed_action_ids: ['open', 'acknowledge'], important: true }]],
    approval: [[0, { title: 'Builder needs approval to run cargo publish', body: 'Publishing is an outward action; the node is parked at a safe point.', severity: 'warn', kind: 'hitl', page: 'orchestrator', allowed_action_ids: ['approve', 'decline', 'open_details', 'explain'], explain: 'The plan marks publishing a crate as an outward action, so it waits for you.', important: true }]],
    burst: [[0, 'Panel moved to the right column'], [420, 'Copied'], [900, { title: 'Run #48 complete: 12 checks passed.', body: 'Orchestrator · just now', severity: 'success', page: 'orchestrator', important: true }],
      [1500, { title: 'Work moved to another account because of rate limits.', body: 'Usage · the account you chose stays your choice', severity: 'warn', page: 'usage', important: true }], [2100, 'Copied']]
  };
  function demo(name) {
    const seqs = name === 'all' ? ['quiet', 'run', 'usage', 'approval'] : [name || 'usage'];
    let at = 0;
    seqs.forEach((s) => { (DEMO[s] || []).forEach(([dt, m]) => { setTimeout(() => (typeof m === 'string' ? window.toast(m) : window.toast.important(m)), at + dt); }); at += 1600; });
    return true;
  }

  const api = {
    version: 'pmn-1',
    boot, push: (msg, opts) => push(msg, opts), clearAll, dismiss, open: openPanel, close: closePanel, markAllRead, demo,
    list: () => ordered().map((it) => ({ id: it.id, title: it.title, body: it.body, severity: it.severity, level: it.level, kind: it.kind, source: it.source, count: it.count, read: it.read })),
    staged: () => Array.from(staged.values()).map((r) => ({ id: r.it.id, title: r.it.title, level: r.it.level })),
    isOpen: () => open
  };
  window.toast = toastApi;
  window.PM_TITLEBAR_NOTIFY = api;
  O55.notify = api;
  if (!boot()) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot, { once: true });
  }
  /* the tour (80-tour-core.js) defines O55.pageToast after this file; the chips come later still */
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', bridges, { once: true }); else bridges();
})();
