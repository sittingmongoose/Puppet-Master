/* O55.nierLook — NieR Mode on the look surfaces: the row under the four looks on "Pick a look", the look menu (the
   onboarding header and the Guided Tour's bar) and Adjust NieR look. Canon (Plans/Settings_System.md 4.4): NieR Mode
   is a checkbox over the chosen look, never a fifth look, and its three rows take the same non-persistent preview and
   scope as the theme pair. So:
   - inside the onboarding window it is a preview (PM_NIER.preview, kit.d/18-nier.js): kept in the session
     (S.sess.look = { nier, parts, background }; the setup-plan draft is a closed schema), shown again when the window
     reopens, and saved with the look into the Project at the end (O55.shell.commitLook -> commit). Turning it on or off
     plays NieR's reboot moment inside the window while the app beneath holds still; Adjust NieR look opens the
     Plug-in Chips editor as a panel that replaces the window's interior (no nested dialog), on the preview store;
   - after setup (the tour) it is live: a change is saved at once and Adjust opens the chips dialog on the live store.
   API: state() -> { on, previewing }; toggle(source, el); adjust(el); and for the window: reapply(S) on open,
   commit(S) with the look, closed(reason) when the window closes unfinished, panelOpen(), busy() (a toggle's cover is
   up: the stage re-renders with its cast held in the wings) and snap() (a key or a press: the toggle's stage beats to
   their end state). */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v);
  const N = () => window.PM_NIER || null;
  const IDS = Object.freeze(['general.visual.nier-mode', 'general.visual.nier-parts', 'general.visual.nier-background']);
  const inWindow = () => !!(O55.S && O55.S.open && O55.S.sess && O55.S.root);
  const win = () => (O55.S && O55.S.root ? O55.S.root.querySelector('.o55-win') : null);
  /* a NieR moment plays inside the window, except on a computer the window already finds slow (Reduce Motion is the
     reboot's own business: it repaints at once) */
  const within = () => (O55.motion.lowResource ? null : win());
  const SLIDERS = '<svg class="o55-sg" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M1.5 4h13M1.5 8h13M1.5 12h13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/>'
    + '<rect x="3.2" y="2.2" width="3.2" height="3.6" fill="currentColor"/><rect x="9.2" y="6.2" width="3.2" height="3.6" fill="currentColor"/><rect x="5.2" y="10.2" width="3.2" height="3.6" fill="currentColor"/></svg>';

  /* what is asked for now: the request (a preview first), not the paint that lags it through a reboot */
  function read() {
    const n = N(); if (!n || (n.ready && !n.ready())) return null;
    return { nier: !!(n.wanted ? n.wanted() : n.on()), parts: n.parts().slice(), background: n.background() };
  }
  function state() {
    const n = N(), pv = n && n.previewing ? n.previewing() : null;
    return { on: !!(n && (n.wanted ? n.wanted() : n.on())), previewing: !!(pv && !pv.loose) };
  }
  /* the session's copy: taken when the window first shows NieR (what was on screen then), then kept in step */
  function look(S) {
    if (!S || !S.sess) return null;
    const l = S.sess.look;
    if (l && typeof l.nier === 'boolean') return l;
    const r = read(); if (!r) return null;
    S.sess.look = r; S.save();
    return r;
  }
  function remember(S) { const r = read(); if (r && S && S.sess) { S.sess.look = r; S.save(); } }

  /* the window opened (fresh or resumed): its NieR choice is painted again as a preview, at once */
  function reapply(S) {
    const n = N(), l = look(S); if (!n || !n.preview || !l) return;
    n.preview({ on: l.nier, parts: l.parts, background: l.background }, { within: within(), instant: true });
  }
  /* saved with the look (O55.shell.commitLook): into the Project selected now, rows that differ only */
  function commit(S) {
    const n = N(); if (!n || !n.commitPreview) return false;
    if (S && S.sess) look(S);
    return n.commitPreview();
  }
  /* closed without finishing: the preview stays on screen as the theme preview does, until Settings writes or loads */
  function closed() {
    if (flight) { flight.timers.forEach((t) => t.cancel()); flight = null; }
    closePanel({ silent: true, keepFocus: true });
    const n = N(); if (n && n.previewing && n.previewing() && n.linger) n.linger();
  }

  /* NieR Mode on or off. In the window the control shows the new state in the same frame and the moment plays inside
     the window (hero spec H1, flip below); after setup it is saved at once (Settings' own reboot moment, in NieR's
     voice). */
  /* repainting the page for NieR Mode (or for a change of its parts) is expected heavy work: the long tasks it makes
     never count toward the window's low-resource mode, which would silence NieR's own texture for the rest of the run
     (O55.motion.quiet; the reboot's repaint measured 1.3 + 1.1 s of long tasks on the VM) */
  const heavy = (ms) => O55.motion.quiet(ms || 2500);
  function toggle(source, el) {
    const n = N(); if (!n) return false;
    const next = !state().on;
    if (!inWindow()) { heavy(4500); O55.sound.play(next ? 'nierOn' : 'nierOff'); return n.set(next, { sound: false }); }
    return flip(next, el);
  }

  /* ---------------------------------------------------------------- H1: "The little world opens" / "Back into the box"
     Ticking: the NieR thumbnail's units peek (joy) as the cover's brackets lock onto it; the cover (kit.d/19-nier-parts.js,
     SETTINGS) grows from the thumbnail into a plate in NieR's ground, types its check list through the repaint and tears
     out in slats on the first idle frame. Under it the window re-renders, and the new cast is mounted waiting in the
     wings (busy(): the stage's ensemble hold, 60-ui-core.js syncTheme). At the reveal the choir arrives (wake), You
     signals, the units are lowered in on their strings and land on the chord (O55.art.troupe.enter), and the resting
     Pod hops back in and confirms. Unticking: Pod hushes, the units power down, the cover closes in, and at the reveal
     the plate folds back into the thumbnail while the look's own troupe drops in. A key or a press after the reveal
     snaps the rest to its end state (snap, from O55.nierWindow.input); a second toggle plays from the first one's end
     state. Reduced Motion, Still, Colors only and a low-resource computer repaint at once and show the end state. */
  let flight = null, flights = 0;
  const stageEl = () => (O55.S && O55.S.root ? O55.S.root.querySelector('.o55-stage') : null);
  const troupe = () => (O55.art && O55.art.troupe) || null;
  const thumbNow = () => { const r = O55.S && O55.S.root; return r ? r.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-nier-thumb]') : null; };
  /* where the cover grows from and folds back to: the control's own thumbnail (the row on Pick a look), the look menu's
     row, the Adjust panel's Turn on, else the NieR thumbnail on screen (asked again after the repaint) */
  const fromOf = (el) => () => {
    const ok = el && el.isConnected;
    const row = ok ? el.closest('.o55-nierlook') : null;
    if (row) { const t = row.querySelector('[data-nier-thumb]'); if (t) return t; }
    if (ok && el.closest('.o55-lookmenu, .o55-nierpanel')) return el;
    return thumbNow() || (ok ? el : null);
  };
  /* the stage's moment, until the cover has lifted: the window re-renders the stage with its cast held in the wings */
  const busy = () => !!(flight && !flight.revealed);
  function flip(next, el) {
    const n = N(); if (!n || !inWindow()) return false;
    const S = O55.S, A = O55.art, tr = troupe(), NW = O55.nierWindow, FX = O55.nierFx;
    heavy(4500);
    O55.sound.play(next ? 'nierOn' : 'nierOff');
    look(S);
    /* a second toggle: the first one's beats end where they stand */
    if (flight) { snap(); flight.timers.forEach((t) => t.cancel()); }
    const F = flight = { id: ++flights, on: next, timers: [], revealed: false, entered: false, spoke: false, snapped: false };
    const st = stageEl();
    if (next) {
      /* T0: the thumbnail's units peek with joy as the brackets lock on; the resting Pod waits off stage */
      const thumb = thumbNow();
      if (thumb && A.peek) A.peek(thumb, { joy: true });
      if (NW && NW.podHold) NW.podHold(true);
    } else {
      /* T0: Pod hushes now, and the units power down (the cover waits 300 ms for them) */
      if (FX && FX.pod) FX.pod.hush(true);
      if (st && tr && tr.powerDown) tr.powerDown(st);
    }
    const done = n.preview({ on: next }, { within: within(), sound: false, from: fromOf(el), onReveal: (phase) => reveal(F, phase) });
    remember(S);
    paint(next);
    U.announce(T(next ? 'look.nier.nowOn' : 'look.nier.nowOff'), win());
    /* (a cover that never reported: the end state once it has gone) */
    Promise.resolve(done).then(() => { reveal(F, 'reveal'); reveal(F, 'gone'); });
    return true;
  }
  function at(F, ms, fn) { const t = O55.motion.after(ms, () => { if (flight === F && !F.snapped && inWindow()) fn(); }); F.timers.push(t); return t; }
  const instant = () => O55.motion.reduced() || !!O55.motion.lowResource || !within();
  function reveal(F, phase) {
    if (phase === 'gone') { F.gone = true; return; }
    if (phase !== 'reveal' || F.revealed) return;
    F.revealed = true; F.revealAt = O55.motion.now();
    if (flight !== F || !inWindow()) return;
    /* the choir (NieR) or the look's own reveal (unticking), on the frame the window shows again */
    O55.sound.play('wake');
    if (instant()) { enter(F); if (F.on) at(F, 400, () => speak(F)); return; }
    if (F.on) { at(F, 260, () => enter(F)); at(F, 1940, () => speak(F)); }
    else at(F, 360, () => enter(F));
  }
  /* the new cast is lowered in (NieR: You's signal, the units on their strings, the chord; a look: its own drop) */
  function enter(F) {
    if (F.entered) return;
    F.entered = true;
    const st = stageEl(), tr = troupe();
    if (st && tr && tr.enter) tr.enter(st);
  }
  /* the resting Pod steps back in and confirms (Quiet: no Pod, no line) */
  function speak(F) {
    if (F.spoke || !F.on) return;
    F.spoke = true;
    const NW = O55.nierWindow; if (!NW || !NW.say) return;
    const words = T('look.nier.podOn', { name: T('look.families.' + O55.theme().chosen + '.name') });
    const go = () => { if (flight === F && inWindow()) NW.say(words, { lane: 'bar', announce: true, now: true }); };
    if (NW.podIn && !F.snapped && !instant()) NW.podIn().then(go); else { if (NW.podHold) NW.podHold(false); go(); }
  }
  /* a key or a press after the reveal: units standing, the arm up, Pod's line static */
  function snap() {
    const F = flight;
    if (!F || !F.revealed || F.snapped || (F.entered && F.spoke) || O55.motion.now() - F.revealAt > 4500) return;
    F.timers.forEach((t) => t.cancel());
    const st = stageEl(), tr = troupe();
    enter(F);
    if (st && tr && tr.snap) tr.snap(st);
    if (F.on) speak(F);
    F.snapped = true;
  }
  /* every NieR checkbox on screen shows the request at once (the window re-renders from state() after the repaint) */
  function paint(on) {
    const root = O55.S && O55.S.root; if (!root) return;
    root.querySelectorAll('[data-o55-nier-check]').forEach((b) => { b.setAttribute('aria-checked', String(on)); b.classList.toggle('o55-on', on); });
    root.querySelectorAll('.o55-nierlook').forEach((r) => r.setAttribute('data-on', String(on)));
  }

  /* ---------------------------------------------------------------- Adjust NieR look */
  function adjust(el) {
    const n = N(), C = window.PM_NIER_CHIPS;
    if (inWindow()) return openPanel(el);
    if (!n || !n.store || !C || !C.popup) return null;
    heavy();
    O55.sound.play('sheet');
    /* focus comes back to what is there when the dialog closes: a change of parts redraws the tour's bar, which
       replaces the look button that opened it (PM_NIER_CHIPS.popup asks returnFocus at close; from stays the fallback) */
    const returnFocus = () => {
      const tour = document.getElementById('pm-o55-tour');
      const live = tour && !tour.hidden ? tour.querySelector('.o55t-bar [data-o55t="lookMenu"]') : null;
      return live || (el && el.isConnected ? el : null);
    };
    return C.popup({ store: n.store('live'), from: el || null, title: T('look.nier.panelTitle'), returnFocus });
  }

  /* The editor inside the window: a panel over the window's interior (the stage and the pane), under its header. The
     interior beneath is inert while it is open; Escape and Done close it and focus returns to what opened it. The
     editor writes through the preview store, so every change shows at once and nothing is saved until the end. */
  let panel = null;
  function chipsStore(S) {
    const s = N().store('preview');
    /* the session keeps every change, and each change answers in the window's voice (the chips' own clicks are
       inside the window, where the page's NieR menu sounds stay quiet) */
    const after = (ev) => { remember(S); if (ev) O55.sound.play(ev); };
    return Object.freeze({
      kind: s.kind, BACKGROUNDS: s.BACKGROUNDS,
      on: () => s.on(), parts: () => s.parts(), background: () => s.background(), onChange: (cb) => s.onChange(cb),
      set(on) {
        if (!!on === s.on()) return true;
        /* the editor's Turn on: the same moment as the checkbox, grown from the button pressed */
        const a = document.activeElement;
        flip(!!on, a && panel && panel.host.contains(a) ? a : null); after(null); return true;
      },
      setParts(keys) {
        const before = s.parts(), list = Array.isArray(keys) ? keys : [];
        const one = Math.abs(before.length - list.length) === 1 && (before.length > list.length ? list.every((k) => before.includes(k)) : before.every((k) => list.includes(k)));
        heavy();
        const ok = s.setParts(list);
        after(one ? (list.length > before.length ? 'toggleOn' : 'toggleOff') : 'select');
        return ok;
      },
      setBackground(label) { heavy(); const ok = s.setBackground(label); after('select'); return ok; }
    });
  }
  function openPanel(from) {
    const S = O55.S, w = win(), n = N(), C = window.PM_NIER_CHIPS;
    if (!w || !n || !n.store) return null;
    if (panel) { const h = panel.host.querySelector('.o55-nierpanel-h'); if (h) h.focus({ preventScroll: true }); return panel; }
    heavy(); /* mounting the editor is a large build of its own */
    /* the look menu gives way to the editor */
    if (S.lookOpen) { S.lookOpen = false; O55.ui.refresh(); }
    const body = w.querySelector('.o55-body');
    const host = document.createElement('section');
    host.className = 'o55-nierpanel';
    host.setAttribute('role', 'group'); host.setAttribute('aria-labelledby', 'o55-nierpanel-h');
    host.setAttribute('data-pm-hover-exempt', 'true');
    host.innerHTML = `<header class="o55-nierpanel-head"><div class="o55-nierpanel-titles"><p class="o55-nierpanel-eye">${U.esc(T('look.nier.label'))}</p>`
      + `<h2 class="o55-nierpanel-h" id="o55-nierpanel-h" tabindex="-1">${U.esc(T('look.nier.panelTitle'))}</h2></div></header>`
      + `<div class="o55-nierpanel-scroll"><div class="o55-nierpanel-body"></div></div>`;
    w.insertBefore(host, w.querySelector('.o55-live'));
    if (body) { body.setAttribute('inert', ''); body.setAttribute('aria-hidden', 'true'); }
    const mountEl = host.querySelector('.o55-nierpanel-body');
    let m = null;
    if (C && C.mount) m = C.mount(mountEl, { store: chipsStore(S), onClose: () => closePanel() });
    else {
      mountEl.innerHTML = `<p class="o55-note o55-note-info">${O55.c.small('spark', 14)}<span>${U.esc(T('look.nier.missing'))}</span></p>`
        + `<div class="o55-nierpanel-fallback"><button type="button" class="o55-btn o55-secondary" data-o55-nierpanel="done" data-pm-hover-exempt="true"><span>${U.esc(T('chrome.done'))}</span></button></div>`;
    }
    /* The panel is the window's topmost layer: Escape closes it first, wherever focus is in the window (the header's
       Close included; a second Escape closes the window), unless the look menu is open, which closes before it. It is
       caught on the document as well, in case the control that had focus went away (the editor's Turn on hides itself
       once used). Enter on the panel's heading does nothing (the screen hidden beneath never hears it). */
    const onKey = (e) => {
      if (!panel || panel.host !== host) return;
      const t = e.target, root = S.root;
      if (e.key === 'Enter' && t && t.classList && t.classList.contains('o55-nierpanel-h')) { e.preventDefault(); e.stopPropagation(); return; }
      if (e.key !== 'Escape') return;
      const inside = host.contains(t) || t === document.body || t === document.documentElement || (root && root.contains(t) && !S.lookOpen);
      if (!inside) return;
      e.preventDefault(); e.stopPropagation(); closePanel();
    };
    const onClickHost = (e) => { if (e.target.closest && e.target.closest('[data-o55-nierpanel="done"]')) { e.preventDefault(); closePanel(); } };
    /* a control that hides itself once used (Turn on) hands focus to the panel's heading, never to the page */
    const keepFocus = () => O55.motion.after(0, () => {
      const a = document.activeElement;
      if (panel && panel.host === host && (!a || a === document.body || !host.contains(a) || !a.getClientRects().length)) { const h = host.querySelector('.o55-nierpanel-h'); if (h) h.focus({ preventScroll: true }); }
    });
    host.addEventListener('click', onClickHost);
    host.addEventListener('click', keepFocus);
    document.addEventListener('keydown', onKey, true);
    panel = { host, from: from || null, m, body, off: () => document.removeEventListener('keydown', onKey, true) };
    O55.sound.play('sheet');
    /* it opens the way a NieR surface opens when NieR Mode is painted (a stepped slice), otherwise it rises */
    const fx = O55.nierFx;
    if (O55.theme().nier && fx && fx.enabled && fx.enabled('slice')) fx.slice(host);
    else if (!O55.motion.reduced()) host.classList.add('o55-nierpanel-in');
    O55.motion.after(40, () => { const h = host.querySelector('.o55-nierpanel-h'); if (h && panel && panel.host === host) h.focus({ preventScroll: true }); });
    return panel;
  }
  function closePanel(o) {
    o = o || {};
    if (!panel) return;
    const p = panel; panel = null;
    p.off();
    try { if (p.m && p.m.unmount) p.m.unmount(); } catch (_) {}
    p.host.remove();
    if (p.body) { p.body.removeAttribute('inert'); p.body.removeAttribute('aria-hidden'); }
    if (!o.silent) O55.sound.play('unsheet');
    if (o.keepFocus || !inWindow()) return;
    /* focus goes back to what opened it; a look-menu option was redrawn, so its button stands in */
    const root = O55.S.root;
    const back = (p.from && p.from.isConnected && !p.from.closest('.o55-out') && p.from) || root.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-key="nier-adjust"]') || root.querySelector('.o55-lookbtn');
    if (back) try { back.focus({ preventScroll: true }); } catch (_) {}
  }

  O55.nierLook = { IDS, state, toggle, adjust, reapply, commit, closed, look, busy, snap, panelOpen: () => !!panel, closePanel, icon: () => SLIDERS };
})();
