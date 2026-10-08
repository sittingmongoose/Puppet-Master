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
   commit(S) with the look, closed(reason) when the window closes unfinished, panelOpen(). */
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
    closePanel({ silent: true, keepFocus: true });
    const n = N(); if (n && n.previewing && n.previewing() && n.linger) n.linger();
  }

  /* NieR Mode on or off. In the window the control shows the new state in the same frame and the reboot plays
     inside the window; after setup it is saved at once (Settings' own reboot moment, in NieR's voice). */
  /* repainting the page for NieR Mode (or for a change of its parts) is expected heavy work: the long tasks it makes
     never count toward the window's low-resource mode, which would silence NieR's own texture for the rest of the run
     (O55.motion.quiet; the reboot's repaint measured 1.3 + 1.1 s of long tasks on the VM) */
  const heavy = (ms) => O55.motion.quiet(ms || 2500);
  function toggle(source, el) {
    const n = N(); if (!n) return false;
    const next = !state().on;
    heavy(4500);
    O55.sound.play(next ? 'nierOn' : 'nierOff');
    if (!inWindow()) return n.set(next, { sound: false });
    const S = O55.S;
    look(S);
    const done = n.preview({ on: next }, { within: within(), sound: false });
    remember(S);
    paint(next);
    U.announce(T(next ? 'look.nier.nowOn' : 'look.nier.nowOff'), win());
    /* once the new look is up, the troupe takes it in (the window re-rendered under the reboot's cover) */
    done.then(() => { if (S.open && O55.art.react) O55.motion.after(160, () => { const st = S.root.querySelector('.o55-stage'); if (st && S.open) O55.art.react(st); }); });
    return true;
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
        /* the editor's Turn on: the same moment as the checkbox (its sound, the reboot inside the window) */
        heavy(4500);
        O55.sound.play(on ? 'nierOn' : 'nierOff');
        N().preview({ on: !!on }, { within: within(), sound: false }); after(null); paint(!!on); return true;
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

  O55.nierLook = { IDS, state, toggle, adjust, reapply, commit, closed, look, panelOpen: () => !!panel, closePanel, icon: () => SLIDERS };
})();
