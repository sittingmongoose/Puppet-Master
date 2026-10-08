/* O55.nierWindow — NieR Mode's skin of the onboarding window (styles: src/css/11-window-nier.css, words:
   src/copy.d/45-nier-window.json). 60-ui-core.js calls these hooks through O55.ui.skin(name, a, b) at the window's
   moments; 62-flow.js calls op. Every hook answers only while NieR Mode is painted (html[data-o55-nier="on"], live or
   the onboarding preview), and every effect is drawn by O55.nierFx (16-nier-fx.js) or acted by the troupe
   (O55.art.troupe, 59-cheer.js), so each one is gated by its installed part and Reduced Motion gives its end state. A
   hook that answers true has drawn the moment its own way (the window then skips its default). With NieR Mode off
   nothing here runs and nothing it made stays in the window. The hero moments are design/hero-spec.md H2-H4.

     stepped()                  -> true while painted: a sheet that just opened scrolls into view at once
     open({ resumed, shown, screen }) -> ms   the cold open ("strings up", H2): the window opens empty from one line, the
                                header assembles, the troupe lies asleep on slack strings; the window's first sound
                                waits that many ms (its silence)
     openGate(layer) -> Promise the boot log where the title will be, captioning the troupe's wake; the screen is shown
                                when its line has become the eyebrow's rule (promise.stageAt: when the stage shows)
     openSnap()                 a key or a press during the cold open: everything to its end state now
     asleep()                   -> true while the welcome scene should be drawn asleep (55-scenes.js beat 'asleep')
     claimSting(from, def, dir) -> true when this skin plays the new chapter's sting itself (the act card lands on it,
                                H3; the curtain call resolves on it, H4b); the rail is held in its old state meanwhile
     stageDelay(dir)            -> ms the old scene stays (its troupe bows at the end of an act)
     screen(layer, dir)         a real screen change, after its release: a page wipe on a chapter change (mirrored for
                                Back) or the content slicing open, the title typing on, the act card or the rail walk,
                                target brackets on the chosen card, then Pod's line for the screen
     refresh(layer)             a quiet in-screen update: brackets, the block meter, an error that just appeared (alert
                                + Pod), the Project made (H4a: the saved line), a changed title types on
     ready(layer, fresh)        -> true when Ready's curtain call is this skin's (H4b)
     refused(el) / shake(field) a press on a disabled control / an entry that was not taken: the glitch or the alert
     op(key, state)             an operation finished on the screen that shows it: Pod reports
     input(e)                   a key or a press anywhere in the window: the stage's running performance snaps to its end
     handoff() -> { kind, at, line, pod, podRect, takeScrim } | null   the hand-over to the Guided Tour (H4c), asked for
                                before close('done', { handoff: true }); results/h4c-handover-contract.md
     close(reason, handoff) -> ms   the window closes; with a hand-over it folds to the line that carries on into the tour
     say(text, { lead, lane, now, announce })   Pod 042 speaks in a lane of the art panel (rule 8)
     podHold(on), podIn()       the resting Pod held off stage, and its hop back in (H1, H2)

   The window keeps its own parts in two places it owns: a stage overlay over the art panel (.o55nw-stage: Pod 042 at
   its corner, drifting ink motes, map rulers, a scan line) and the brand's kicker and Setup counter. The menu cursor
   rides cards, tiles and switches on hover and focus (the page-wide NieR cursor already inks options and menu items,
   so there is never a second cursor). Timers run on the motion clock and belong to the screen that started them. */
(function () {
  'use strict';
  const O55 = window.O55, M = O55.motion, U = O55.util;
  const html = document.documentElement;
  const T = (k, v) => O55.t('nierWindow.' + k, v);
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  /* one gate for every NieR part, O55.nierFx's when it offers it (it also reads a preview's parts while the painted
     attribute is briefly absent), else the painted attribute */
  const has = (key) => painted() && (O55.nierFx && typeof O55.nierFx.has === 'function' ? !!O55.nierFx.has(key)
    : (' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').indexOf(' ' + key + ' ') >= 0);
  const fx = () => (painted() && O55.nierFx && O55.nierFx.enabled ? O55.nierFx : null);
  const reduced = () => M.reduced();
  /* One low-resource rule for both directions: the heavy one-shots are end states under Reduced Motion and on a
     low-resource computer, forward and Back alike; the overlay's loops stop there too (11-window-nier.css) */
  const calm = () => M.reduced() || !!M.lowResource;
  const rootEl = () => (O55.S && O55.S.root) || null;
  const stageEl = () => { const r = rootEl(); return r ? r.querySelector('.o55-stage') : null; };
  const shown = () => { const s = O55.S; return !!(s && s.open && s.root && !s.root.hidden); };
  const layerNow = () => { const r = rootEl(); return r ? r.querySelector('.o55-pane > .o55-layer:not(.o55-out)') : null; };
  const camel = (id) => String(id).replace(/-([a-z0-9])/g, (m, c) => c.toUpperCase());
  const two = (n) => String(Math.max(0, n)).padStart(2, '0');
  const line = (key) => { const v = O55.tx('nierWindow.' + key); return typeof v === 'string' ? v : null; };
  const play = (ev, o) => { try { return O55.sound.play(ev, o || {}); } catch (_) { return false; } };
  const troupe = () => (O55.art && O55.art.troupe) || null;
  /* the stage acts in NieR's art (the units, You, the control unit) */
  const nierArt = () => O55.theme().art === 'nier';

  /* ------------------------------------------------------------------ the run and the screen's timers */
  /* What this run has shown already (chapters whose act card played, screens Pod spoke on, the furthest chapter
     reached); a new run (Start over, Run Onboarding Again) starts clean. */
  let run = null;
  function runState() {
    const s = O55.S, id = s && s.sess ? (s.sess.started || '') + '|' + (s.epoch || 0) : '';
    if (!run || run.id !== id) run = { id, chapters: new Set(), stung: new Set(), spoken: new Set(), idx: -1, maxIdx: -1, chapter: null, pr: null, title: '', errs: new Set(), commit: null, ops: 0, layer: null, marksAt: 0, claim: null, cold: null, hand: null, complete: false };
    return run;
  }
  /* timers belong to the screen that set them: a screen change, the window closing or NieR Mode going cancels them */
  let token = 0;
  const timers = new Set();
  function later(ms, fn) {
    const t = token;
    const h = M.after(Math.max(0, ms), () => { timers.delete(h); if (t === token && shown() && painted()) fn(); });
    timers.add(h);
    return h;
  }
  function cancelAll() { token++; timers.forEach((h) => h.cancel()); timers.clear(); pending = null; }

  /* ------------------------------------------------------------------ the stage overlay, the resting Pod, the brand */
  /* PMConcept7's ink-line Pod (O55.nierFx.podSvg, the one drawing), resting by the art panel's top corner; O55.nierFx's
     Pod lands exactly on it to speak, and this one steps away meanwhile. It can be held off stage (H1's toggle, H2's
     cold open) and hop back in on its cue. */
  const podSvg = (part) => (O55.nierFx && O55.nierFx.podSvg ? O55.nierFx.podSvg('o55nw-pod', part ? { part } : undefined) : '');
  let podAway = false;
  function stage(on) {
    const r = rootEl(); if (!r) return null;
    let L = r.querySelector(':scope .o55-body > .o55nw-stage');
    if (!on) { if (L) L.remove(); return null; }
    if (L) return L;
    const body = r.querySelector('.o55-body'); if (!body) return null;
    L = document.createElement('div');
    L.className = 'o55nw-stage'; L.setAttribute('aria-hidden', 'true');
    L.innerHTML = '<i class="o55nw-sweep"></i>' + '<i class="o55nw-mote"></i>'.repeat(8)
      + '<i class="o55nw-ruler o55nw-ruler-y"></i><i class="o55nw-ruler o55nw-ruler-x"></i>'
      + `<div class="o55nw-pod"${podAway ? ' data-away=""' : ''}><div class="o55nw-pod-shadow">${podSvg('shadow')}</div><div class="o55nw-pod-bob">${podSvg()}</div></div>`;
    body.appendChild(L);
    return L;
  }
  const residentPod = () => { const r = rootEl(); return r ? r.querySelector('.o55-body > .o55nw-stage .o55nw-pod') : null; };
  /* held off stage (hidden in place, so O55.nierFx still knows where it lives) */
  function podHold(on) {
    podAway = !!on;
    const p = residentPod(); if (!p) return;
    if (p.hasAttribute('data-away') !== podAway) p.toggleAttribute('data-away', podAway);
    if (!podAway) p.getAnimations().forEach((a) => { if (typeof CSSAnimation === 'undefined' || !(a instanceof CSSAnimation)) a.finish(); });
  }
  /* it steps back in from the stage's right edge in held hops, each leaving a trail square (silent: its line, when it
     has one, is its sound) */
  function podIn(o) {
    o = o || {};
    const p = residentPod(), F = fx();
    podAway = false;
    if (!p) return Promise.resolve(false);
    p.removeAttribute('data-away');
    if (!F || !has('pod') || calm() || typeof p.animate !== 'function') return Promise.resolve(true);
    const n = o.hops || 6, from = o.from || 64, kf = [];
    for (let i = 0; i <= n; i++) kf.push({ translate: `${Math.round(from * (1 - i / n))}px ${i % 2 || i === n ? 0 : -3}px`, offset: i / n, easing: 'step-end' });
    M.quiet(900);
    const ms = o.ms || 360, a = p.animate(kf, { duration: ms });
    const r = p.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < n; i++) M.after((ms * (i + 1)) / n, () => { if (p.isConnected) F.trail(cx + from * (1 - i / n), cy - (i % 2 ? 0 : 3)); });
    return a.finished.then(() => true, () => false);
  }
  /* the brand's kicker squares and its Setup counter (02/05), shown by the CSS while YoRHa headers is installed. The
     counter follows the rail (and its hold); asked to roll, the digits turn over in 3 steps (Back: the other way);
     at Ready, once every box is stamped, it reads Setup · Complete */
  function brand(on, roll) {
    const r = rootEl(), b = r && r.querySelector('.o55-brand'); if (!b) return;
    let k = b.querySelector(':scope > .o55nw-kick'), sub = b.querySelector(':scope > .o55nw-sub');
    if (!on) { if (k) k.remove(); if (sub) sub.remove(); return; }
    if (!k) { k = document.createElement('span'); k.className = 'o55nw-kick'; k.innerHTML = '<i></i><i></i><i></i>'; b.insertBefore(k, b.firstChild); }
    if (!sub) { sub = document.createElement('span'); sub.className = 'o55nw-sub'; b.appendChild(sub); }
    const s = O55.S, def = s && s.sess && O55.screens.defs[s.sess.screen];
    if (!def) return;
    const R = runState(), pr = s.railHold || O55.stages.progress(s, def);
    const done = R.complete && s.sess.screen === 'ready';
    const n = pr.index < 0 ? '00' : two(pr.index + 1), total = two(pr.chapters.length), key = done ? 'complete' : n + '/' + total;
    const was = sub.getAttribute('data-n');
    if (was === key) return;
    sub.setAttribute('data-n', key);
    if (done) { sub.textContent = T('brand.complete'); return; }
    const parts = T('brand.sub', { n: '\u0001', total }).split('\u0001'), pre = parts[0], post = parts[1] || '';
    const old = was && /^\d\d\//.test(was) ? was.slice(0, 2) : null;
    if (!roll || !old || old === n || calm() || !has('headers')) { sub.textContent = pre + n + post; return; }
    const back = +n < +old;
    sub.innerHTML = `${U.esc(pre)}<span class="o55nw-roll"><span><i>${back ? n : old}</i><i>${back ? old : n}</i></span></span>${U.esc(post)}`;
    const inner = sub.querySelector('.o55nw-roll > span');
    const a = inner.animate(back ? [{ transform: 'translateY(-50%)' }, { transform: 'translateY(0)' }] : [{ transform: 'translateY(0)' }, { transform: 'translateY(-50%)' }],
      { duration: 240, easing: 'steps(3, end)', fill: 'forwards' });
    const end = () => { if (sub.isConnected && sub.getAttribute('data-n') === key) sub.textContent = pre + n + post; };
    a.finished.then(end, end);
  }

  /* ------------------------------------------------------------------ the rail walk (H3, Q6) */
  /* The rail's ink block walks from the chapter it held to the new one: it steps (5 steps, 300 ms) by its left edge and
     its width while the new chapter shows as still to come, inverting as the block arrives; a box finished on the way
     draws its check in 2 steps, and the brand's counter rolls. Under YoRHa headers only (elsewhere the rail simply
     changes), and an end state under Reduced Motion and on a low-resource computer. The ink block is the current
     chapter's own (its ::after, 11-window-nier.css: 4 px in from each side, 22 px down, 23 px tall); on the narrow
     window, where the rail shows its boxes only, the block walks box to box. */
  function inkOf(li, navR) {
    const r = li.getBoundingClientRect();
    if (r.width < 34) { const n = li.querySelector('.o55-railnode'), q = n ? n.getBoundingClientRect() : r; return { x: q.left - navR.left - 3, y: q.top - navR.top - 3, w: q.width + 6, h: q.height + 6 }; }
    return { x: r.left - navR.left + 4, y: r.top - navR.top + 22, w: Math.max(4, r.width - 8), h: 23 };
  }
  function railWalk(o) {
    o = o || {};
    const r = rootEl(), s = O55.S; if (!r || !s) return Promise.resolve(false);
    const nav = r.querySelector('.o55-rail');
    const wasHeld = !!s.railHold;
    s.railHold = null;
    if (!nav || !has('headers') || calm() || !shown()) { O55.ui.renderRail(); brand(true, false); return Promise.resolve(false); }
    const navR = nav.getBoundingClientRect();
    const from = nav.querySelector('.o55-railitem[data-state="current"]');
    const a = from ? inkOf(from, navR) : null;
    const before = new Set(Array.from(nav.querySelectorAll('.o55-railitem[data-state="done"]')).map((li) => li.getAttribute('data-chapter')));
    O55.ui.renderRail();
    const to = nav.querySelector('.o55-railitem[data-state="current"]');
    /* the boxes finished on the way draw their checks (2 steps) */
    nav.querySelectorAll('.o55-railitem[data-state="done"]').forEach((li) => { if (!before.has(li.getAttribute('data-chapter'))) li.classList.add('o55nw-tick'); });
    brand(true, wasHeld);
    if (!a || !to || to === from) return Promise.resolve(false);
    const b = inkOf(to, navR);
    nav.querySelectorAll(':scope > .o55nw-railcur').forEach((n) => n.remove());
    const blk = document.createElement('i');
    blk.className = 'o55nw-railcur'; blk.setAttribute('aria-hidden', 'true');
    blk.style.cssText = `left:${Math.round(a.x)}px;top:${Math.round(a.y)}px;width:${Math.round(a.w)}px;height:${Math.round(a.h)}px`;
    nav.insertBefore(blk, nav.firstChild);
    nav.setAttribute('data-o55nw-walk', '');
    M.quiet(700);
    const anim = blk.animate([{ transform: 'translate(0px, 0px) scale(1, 1)' }, { transform: `translate(${Math.round(b.x - a.x)}px, ${Math.round(b.y - a.y)}px) scale(${(b.w / a.w).toFixed(4)}, ${(b.h / a.h).toFixed(4)})` }],
      { duration: 300, easing: 'steps(5, end)', fill: 'forwards' });
    /* a tick on each step of the block (texture under the sting) */
    for (let i = 1; i <= 5; i++) M.after(i * 60, () => { if (blk.isConnected) play('move', { step: i }); });
    const end = () => { blk.remove(); if (!nav.querySelector(':scope > .o55nw-railcur')) nav.removeAttribute('data-o55nw-walk'); return true; };
    return anim.finished.then(end, end);
  }

  /* ------------------------------------------------------------------ Pod 042 */
  /* Pod is the narrator, and the narrator never covers an actor, a hung sign or card, or the stage kicker (hero spec
     section 1 rule 8). O55.nierFx places its strip in one of two lanes of the art panel: 'bar' just below the control
     bar's line, 'lip' low over the stage lip (o.lane asks for one first); on the narrow window's short band it is
     compact. One line at a time: a line asked for while another is still being read waits for it (an alert does not
     wait); a later line replaces a waiting one. Its dwell follows its length (1.3 s and 22 ms a letter, at most 3.2 s),
     and both clocks (this queue and the strip's own timer in O55.nierFx) use the same number (review W4). */
  let podUntil = 0, pending = null, lastLine = '', lastAt = 0, podFrame = 0;
  const readMs = (text) => Math.round(Math.min(3200, 1300 + String(text).length * 22));
  function say(text, o) {
    o = o || {};
    const F = fx(); if (!F || !text || !(F.enabled('pod') || F.enabled('voice'))) return false;
    const now = M.now();
    if (text === lastLine && now - lastAt < 2500) return false; /* the same words twice in a row is noise */
    if (!o.now && now < podUntil) {
      if (pending) pending.cancel();
      pending = later(podUntil - now, () => { pending = null; say(text, Object.assign({}, o, { now: true })); });
      return true;
    }
    /* the stage's actors are still arriving (an entrance lowers the units through the lanes): the line waits until
       they stand, at most 1.2 s, so its lane is judged where they stay (on the narrow band Creating's units were still
       dropping through the top lane when its line was placed, and it stood back at 22 %); an alert never waits */
    if (!o.arrived && o.lead !== 'alert' && O55.art && O55.art.arrivedAt) {
      const wait = Math.min(1200, O55.art.arrivedAt(stageEl()) - now);
      if (wait > 16) {
        if (pending) pending.cancel();
        podUntil = now + wait + readMs(text);
        pending = later(wait, () => { pending = null; say(text, Object.assign({}, o, { now: true, arrived: true })); });
        return true;
      }
    }
    lastLine = text; lastAt = now;
    const ms = readMs(text);
    podUntil = now + ms;
    /* placed at the start of the next frame, when the screen's style and layout are already computed */
    const t = token, f = ++podFrame;
    M.real.raf(() => {
      const st = stageEl();
      if (t !== token || f !== podFrame || !shown() || !painted() || !st) return;
      F.pod.say(text, { stage: st, lane: o.lane || null, lead: o.lead, ms, announce: !!o.announce });
    });
    return true;
  }
  function podScreen(def, o) {
    const R = runState(), s = O55.S, id = def.id;
    if (R.spoken.has(id)) return;
    let key = 'pod.screens.' + camel(id);
    const cm = s.sess.commit || {}, later_ = (s.sess.drafts && s.sess.drafts.main && s.sess.drafts.main.project_mode) === 'later';
    if (id === 'creating' && cm.state === 'done') key = later_ ? 'pod.creatingDoneLater' : 'pod.creatingDone';
    else if (id === 'creating' && cm.state === 'failed') key = 'pod.alert';
    else if (id === 'ready' && (later_ || cm.state !== 'done')) key = 'pod.readyLater';
    const words = line(key); if (!words) return;
    R.spoken.add(id);
    say(words, o);
  }
  /* the words of an error surface, when they are one short sentence (Pod reads them behind its Alert lead); otherwise
     Pod's own alert line */
  function alertWords(el, fallbackKey) {
    const span = el.querySelector(':scope > span:not(.o55-sg)') || el;
    const t = (span.textContent || '').replace(/\s+/g, ' ').trim();
    return t && t.length <= 110 ? t : line(fallbackKey || 'pod.alert');
  }

  /* ------------------------------------------------------------------ choices: brackets and the menu cursor */
  /* the chosen card or tile (and the look screen's NieR row while it is on) wears target brackets; they move with the
     choice and let go when it changes. A control a performance points at (Ready's tour button once h2 has pointed at
     it) is locked on too (data-o55nw-lock). */
  const locked = new Set();
  function marks(layer) {
    const F = fx(), want = new Set();
    if (F && F.enabled('brackets') && layer && layer.isConnected && shown() && !covered()) layer.querySelectorAll('.o55-card.o55-on, .o55-tile.o55-on, .o55-nierlook[data-on="true"], [data-o55nw-lock]').forEach((el) => want.add(el));
    locked.forEach((el) => { if (!want.has(el)) { locked.delete(el); if (O55.nierFx) O55.nierFx.brackets(el, false); } });
    want.forEach((el) => { if (!locked.has(el)) { locked.add(el); F.brackets(el, true); } });
  }
  /* LOOK's Adjust NieR look panel (.o55-nierpanel) lies over the window's interior: the screen's brackets and cursor
     stand down while it is there (they follow elements it covers), and come back when it closes */
  const covered = () => { const r = rootEl(); return !!(r && r.querySelector(':scope .o55-win > .o55-nierpanel')); };
  /* the menu cursor: the card, tile or switch under the pointer (or holding focus) becomes an ink bar with the square
     cursor stepping beside it, with the cursor's tick (O55.sound 'hover', silent outside the NieR kit) */
  const CHOICE = '.o55-card:not([aria-disabled="true"]), .o55-tile, .o55-toggle, .o55-nierlook';
  let cur = null, tick = 0;
  function point(el) {
    if (el === cur) return;
    const F = fx();
    if (cur && O55.nierFx) O55.nierFx.cursor(cur, false);
    cur = null;
    if (!el || !F || !F.enabled('cursor')) return;
    curNode = F.cursor(el, true); cur = el;
    tint();
    const now = performance.now();
    if (now - tick > 80) { tick = now; play('hover'); }
  }
  /* the cursor's square on a choice that is not chosen is drawn in ink (the choice is tinted, not inverted) */
  let curNode = null;
  const chosen = (el) => el.classList.contains('o55-on') || el.getAttribute('data-on') === 'true';
  function tint() {
    if (!cur || !curNode || !curNode.isConnected) return;
    const t = !chosen(cur);
    if (curNode.hasAttribute('data-o55nw-tint') !== t) curNode.toggleAttribute('data-o55nw-tint', t);
  }
  const choiceOf = (t) => { const c = t && t.closest ? t.closest(CHOICE) : null; return c && !c.closest('.o55-out') ? c : null; };
  const wired = new WeakSet();
  function wire() {
    const r = rootEl(); if (!r || wired.has(r)) return;
    wired.add(r);
    r.addEventListener('pointerover', (e) => { if (!painted() || e.pointerType === 'touch') return; const c = choiceOf(e.target); if (c) point(c); });
    const win = r.querySelector('.o55-win');
    if (win) new MutationObserver(() => { if (!painted() || !shown()) return; if (covered()) point(null); marks(layerNow()); }).observe(win, { childList: true });
    r.addEventListener('pointerout', (e) => {
      if (!cur || !painted()) return;
      const to = e.relatedTarget;
      if (to && cur.contains(to)) return;
      if (choiceOf(e.target) === cur && document.activeElement !== cur) point(null);
    });
    r.addEventListener('focusin', (e) => { if (painted()) { point(choiceOf(e.target)); M.release(reticle); } });
    /* a scroll checks the reticle once per frame (at the frame's start, never forcing a layout between frames) and
       once more when the scrolling has stopped: one pending frame and one pending timer, however many events */
    let scrollRaf = 0, scrollT = null;
    r.addEventListener('scroll', () => {
      if (!painted()) return;
      if (!scrollRaf) scrollRaf = M.real.raf(() => { scrollRaf = 0; reticle(); });
      if (scrollT) scrollT.cancel();
      scrollT = M.after(200, () => { scrollT = null; M.real.raf(reticle); });
    }, { capture: true, passive: true });
  }
  /* The page-wide focus reticle (Target brackets) frames what holds focus, and after a scroll it comes back to it. In
     the window a heading or card the pane has scrolled out of view would leave the reticle drawn over the header or
     the footer: it stands aside while its target is not wholly inside the pane's scroll box. */
  const SCROLLER = '.o55-scroll, .o55-treelist, .o55-nierpanel-scroll';
  function reticle() {
    const ret = document.getElementById('o55np-reticle'); if (!ret) return;
    const r = rootEl(), a = document.activeElement;
    let hide = false;
    if (r && shown() && painted() && a && r.contains(a)) {
      /* a heading the window focuses by script (the screen's and the Adjust panel's, tabindex -1) is not a control the
         person reached: the skin's own brackets mark the choice, and a reticle round a whole-column heading framed
         empty space (review W10) */
      if (a.matches('[tabindex="-1"]')) hide = true;
      const box = !hide && a.closest(SCROLLER);
      if (box) { const A = a.getBoundingClientRect(), B = box.getBoundingClientRect(); hide = A.top < B.top - 2 || A.bottom > B.bottom + 2 || A.left < B.left - 2 || A.right > B.right + 2; }
    }
    if (ret.hasAttribute('data-o55nw-hide') !== hide) ret.toggleAttribute('data-o55nw-hide', hide);
  }

  /* ------------------------------------------------------------------ block progress */
  /* A phase list (C.phases) gets a row of ink cells above it: one cell per phase, the finished ones filled, the one
     working blinking, a failed one in the error ink, and a mono count. The CSS draws it from three numbers. */
  function meter(layer) {
    if (!layer) return;
    const on = has('blocks');
    layer.querySelectorAll('.o55-phases').forEach((ol) => {
      const items = ol.querySelectorAll(':scope > .o55-ph'), n = items.length;
      if (!on || n < 2) { if (ol.hasAttribute('data-o55nw-meter')) { ol.removeAttribute('data-o55nw-meter'); ol.style.removeProperty('--o55nw-n'); } return; }
      let done = 0, at = -1;
      items.forEach((li, i) => { if (li.classList.contains('o55-ph-done')) done++; if (at < 0 && (li.classList.contains('o55-ph-active') || li.classList.contains('o55-ph-failed'))) at = i; });
      ol.setAttribute('data-o55nw-meter', '');
      ol.style.setProperty('--o55nw-n', String(n)); ol.style.setProperty('--o55nw-k', String(done)); ol.style.setProperty('--o55nw-a', String(at));
      ol.style.setProperty('--o55nw-count', JSON.stringify(T('meter', { done: two(done), total: two(n) })));
    });
  }

  /* ------------------------------------------------------------------ errors and the Project's creation */
  const ERR = '.o55-ph-failed, .o55-banner-warn, .o55-hint.o55-err, .o55-pill-fail';
  const errKey = (el) => (el.getAttribute('data-key') || el.className) + '|' + (el.textContent || '').trim().slice(0, 80);
  const hurt = new WeakMap(); /* element -> when its alert last played (a refresh and a shake can name the same one) */
  function alertOn(el) {
    const F = fx(); if (!F || !el) return false;
    const t = M.now(); if (t - (hurt.get(el) || -1e9) < 500) return true;
    hurt.set(el, t);
    F.alert(el);
    return F.enabled('glitch') && !reduced();
  }
  function errors(layer) {
    const R = runState(), fresh = [];
    layer.querySelectorAll(ERR).forEach((el) => { const k = errKey(el); if (!R.errs.has(k)) { R.errs.add(k); fresh.push(el); } });
    if (!fresh.length) return;
    const el = fresh[0], box = el.closest('.o55-ph, .o55-field, .o55-banner, .o55-row, .o55-provider') || el;
    alertOn(box);
    const words = el.classList.contains('o55-ph-failed') ? line('pod.alert') : alertWords(el);
    later(280, () => say(words, { now: true, lead: 'alert' }));
  }
  /* H4a "Saved and stamped": the frame the commit turns done, Pod's Creating line goes at once, the title types on and
     the saved line under the meter types (72-screens-review.js renders it); the stage performs the Created act (the
     name sign comes back stamped, the run's one confetti). No banner: the stamped sign is the goal card, and the live
     region says the Project was created. Pod reports low over the stage lip, never over the sign. In the "later"
     journey (a Server only) the banner stays, inside the pane and silent. */
  /* (the made moment is shown once the app beneath has settled: O55.review.shownDone, 72-screens-review.js) */
  const commitState = (s) => { const cm = s.sess.commit || {}; return cm.state === 'done' && O55.review && O55.review.shownDone && !O55.review.shownDone(s) ? 'settling' : cm.state || null; };
  function created() {
    const s = O55.S, R = runState(), state = commitState(s), was = R.commit;
    R.commit = state;
    if (s.sess.screen !== 'creating' || state !== 'done' || was === 'done' || was == null) return;
    const F = fx(); if (!F) return;
    const d = s.sess.drafts.main || {}, laterMode = d.project_mode === 'later';
    R.spoken.add('creating');
    if (F.pod) F.pod.hush(true);
    podUntil = 0; if (pending) { pending.cancel(); pending = null; }
    /* (the words type on from the next frame: the operation's own refresh still follows this one in the same task, and
       a morph would replace words being typed) */
    const t = token;
    M.real.raf(() => {
      const layer = layerNow(); if (t !== token || !layer || !shown()) return;
      const h = layer.querySelector('#o55-h'), saved = layer.querySelector('.o55nw-saved');
      if (h) F.type(h, { part: null });
      if (saved) F.type(saved, { part: null });
    });
    U.announce(T(laterMode ? 'banner.serverReady' : 'banner.created'), rootEl() && rootEl().querySelector('.o55-win'));
    if (laterMode) {
      const pane = rootEl().querySelector('.o55-pane');
      const go = F.enabled('banner') ? F.banner({ kicker: O55.t('nierFx.banner.kickers.goalComplete'), title: T('banner.serverReady'), ms: 1800, within: pane, sound: false }) : Promise.resolve(false);
      go.then(() => { if (t === token) later(160, () => say(line('pod.creatingDoneLater'), { lane: 'lip' })); });
      return;
    }
    later(2400, () => say(line('pod.creatingDone'), { lane: 'lip' }));
  }

  /* ------------------------------------------------------------------ keeping the overlay true to the look */
  function sync() {
    const on = painted() && !!rootEl();
    stage(on); brand(on);
    if (on) wire();
    if (!on) { cancelAll(); point(null); marks(null); podUntil = 0; reticle(); }
  }
  /* NieR Mode turned on or off, or a part installed or removed, while the window is open (the look screen's preview) */
  new MutationObserver(() => {
    if (!rootEl()) return;
    sync();
    if (!painted() || !shown()) return;
    const L = layerNow(); if (!L || L.classList.contains('o55-hold')) return;
    /* NieR Mode arrived on a screen already showing: the screen is taken as it is, without its entrance effects */
    const R = runState();
    if (R.layer !== L) { const s = O55.S, def = O55.screens.defs[s.sess.screen]; if (def) adopt(L, def); R.marksAt = 0; }
    marks(L); meter(L); brand(true);
    if (cur && !has('cursor')) point(null);
  }).observe(html, { attributes: true, attributeFilter: ['data-o55-nier', 'data-o55-nier-parts'] });
  /* the screen this skin is drawing: its chapter, heading, errors already shown and the Project's state */
  function adopt(layer, def) {
    const s = O55.S, R = runState(), pr = O55.stages.progress(s, def), h = layer.querySelector('#o55-h');
    R.idx = pr.index; R.chapter = pr.current; R.pr = pr; R.title = h ? h.textContent : ''; R.layer = layer;
    R.maxIdx = Math.max(R.maxIdx, pr.index);
    R.commit = commitState(s);
    R.errs = new Set(); layer.querySelectorAll(ERR).forEach((el) => R.errs.add(errKey(el)));
    return pr;
  }

  /* ------------------------------------------------------------------ H3: the act card */
  /* A chapter finished for the first time this run (forward, NieR painted, quests installed, not into Ready): the old
     troupe bowed at the click (stageDelay), and now an ink title card is lowered on two strings over the stage only,
     so the new question is never covered and never waits. It lands on the new chapter's chord (the one sting: quest,
     with the motif to its depth), and in the same frame the rail's block walks to the new chapter and the counter
     rolls. It hangs, is hauled up, and the unit nearest the pane points at it; then Pod speaks. Timed from the release
     (about T30 after Continue): the card lands at about T560 and is hauled at T1640-T1900. */
  function actCard(claim, def) {
    const F = fx(), st = stageEl(), t = token;
    if (!F || !st || !F.enabled('banner')) { railWalk(); later(760, () => podScreen(def)); return; }
    let landed = false;
    later(reduced() ? 0 : 150, () => {
      const go = F.banner({
        kicker: O55.t('nierFx.banner.kickers.chapterDone'), title: O55.t('chapters.' + claim.from),
        sub: T('banner.next', { chapter: O55.t('chapters.' + claim.to) }),
        /* (Reduced Motion: the card stands still for 1.2 s; FX counts the haul's 260 ms inside ms) */
        within: st, hang: true, inset: 0.08, at: 0.36, ms: reduced() ? 1460 : 1660, sound: false,
        onLand: () => {
          if (t !== token || landed) return;
          landed = true;
          const sd = O55.sound.context ? O55.sound.context() : {};
          play('quest', { chapter: claim.to, depth: sd && Number.isFinite(sd.depth) ? sd.depth : undefined });
          railWalk();
        }
      });
      go.then(() => {
        if (t !== token) return;
        /* no card was drawn (a hidden page): the rail still moves on */
        if (!landed) { landed = true; railWalk(); }
        const tr = troupe(); if (tr && tr.point) tr.point(st);
        later(200, () => podScreen(def));
      });
    });
  }
  /* H4b, the rail at Ready: the block walks AI -> READY, then every chapter box re-stamps its check left to right, 60
     ms apart, with one checkpoint, and the brand reads Setup · Complete */
  function readyRail() {
    const R = runState(), r = rootEl();
    railWalk().then(() => {
      if (!shown() || !painted() || !r) return;
      const nav = r.querySelector('.o55-rail');
      const boxes = nav ? Array.from(nav.querySelectorAll('.o55-railitem[data-state="done"]')) : [];
      if (has('headers') && !calm()) boxes.forEach((li, i) => { li.classList.remove('o55nw-tick'); li.style.setProperty('--o55nw-d', i * 60 + 'ms'); void li.offsetWidth; li.classList.add('o55nw-tick'); });
      play('checkpoint');
      R.complete = true;
      later(calm() ? 0 : boxes.length * 60 + 120, () => brand(true, false));
    });
  }
  /* H4b, the setup card (74-screens-ready.js marks the summary data-o55nw-card): its values type in one by one, 90 ms
     apart from T700, each with a phase tick (the CSS holds them unseen until then, with a 1.6 s failsafe) */
  function setupCard(layer) {
    const card = layer.querySelector('[data-o55nw-card]'), F = fx();
    if (!card || !F || !has('headers')) return;
    if (calm()) { card.setAttribute('data-o55nw-card', 'shown'); return; }
    card.setAttribute('data-o55nw-card', 'typing');
    const vals = Array.from(card.querySelectorAll('.o55-revv'));
    vals.forEach((v, i) => later(700 + 90 * i, () => { v.setAttribute('data-o55nw-on', ''); F.type(v, { part: null, perLetter: 14, cap: 280 }); play('phase', { step: i }); }));
    later(700 + 90 * vals.length + 400, () => card.setAttribute('data-o55nw-card', 'shown'));
  }

  /* ------------------------------------------------------------------ H2: the cold open, "strings up" */
  /* the log's last line: Pod reports online when it can speak or show, else the window is simply ready */
  const podLine = () => (has('pod') || has('voice') ? { text: T('log.pod'), stamp: T('log.online') } : { text: T('log.ready'), stamp: '' });
  /* the eyebrow's rule (its ::after runs on from the words, 11-window-nier.css): where the log's underline lands */
  function ruleOf(layer) {
    const eb = layer.querySelector('.o55-eyebrow'), h = layer.querySelector('#o55-h');
    if (eb && has('headers')) {
      const r = eb.getBoundingClientRect();
      let end = r.left + 15;
      const tn = Array.from(eb.childNodes).find((n) => n.nodeType === 3 && n.nodeValue.trim());
      if (tn) { const rg = document.createRange(); rg.selectNodeContents(tn); const tr = rg.getBoundingClientRect(); if (tr.width) end = tr.right; }
      const left = end + 9 + 14, right = r.right - 8;
      return { left, top: Math.round(r.top + r.height / 2), width: Math.max(8, right - left), height: 1 };
    }
    const x = eb || h; if (!x) return null;
    const r = x.getBoundingClientRect();
    return { left: r.left, top: r.bottom - 1, width: r.width, height: 1 };
  }

  /* the first two frames in a row under 34 ms each (after at least three), or cap ms: the window's heavy first frames
     are over */
  function calmFrames(cap) {
    return new Promise((res) => {
      const raf = M.real.raf, t0 = performance.now();
      let last = 0, n = 0, calm = 0;
      const step = (t) => {
        if (last) calm = t - last < 34 ? calm + 1 : 0;
        last = t; n++;
        if ((n >= 3 && calm >= 2) || performance.now() - t0 > cap) { res(); return; }
        raf(step);
      };
      raf(step);
      M.real.setTimeout(res, cap + 400); /* a hidden page draws no frames */
    });
  }
  /* the cold open cannot play (no effects, no screen to caption): the window opens as it would without it */
  function coldOff(cold) {
    const R = runState(), r = rootEl();
    if (r) ['data-o55nw-cold', 'data-o55nw-go'].forEach((a) => r.removeAttribute(a));
    if (cold && R.cold === cold) { cold.asleep = false; R.cold = null; }
    podHold(false);
    if (cold && !cold.opened) { cold.opened = true; play('open'); }
  }

  /* ------------------------------------------------------------------ a screen's entrance under NieR Mode */
  function draw(layer, dir, def, pr, F, o) {
    const R = runState(), pane = layer.parentElement, h = layer.querySelector('#o55-h');
    /* 1. the reveal: a page wipe when the chapter changes (mirrored going back), else the content slices open */
    if (!calm()) {
      if (o.chapterMove && F.enabled('wipe')) F.wipe(pane, dir === 'back' ? { dir: 'back' } : undefined);
      else if (dir !== 'open') F.slice(layer.querySelector('.o55-scroll'));
    }
    /* 2. the title types on, with its typing ticks under the screen change (the cold open's release ticks first) */
    if (dir === 'open' && o.cold) play('tap');
    if (h) F.decode(h, { sound: true });
    /* 3. the moment: the cold open's release, the act card, Ready's curtain, or the rail and Pod */
    const claim = o.claim;
    if (dir === 'open') {
      const cold = o.cold;
      if (cold) {
        /* the screen is out: WELCOME inverts (the boxes already done draw their checks) and the counter rolls in, with
           the menu tick and the run's first music; the promise rows tick in as they step in; Pod speaks last */
        railWalk();
        const sd = O55.sound.context ? O55.sound.context() : {};
        later(90, () => play('chapter', { chapter: pr.current, depth: cold.kind === 'start' ? 0 : (sd && sd.depth) || 0, intensity: 0.4 }));
        layer.querySelectorAll('.o55-promise > li').forEach((li, i) => later(440 + 80 * i, () => play('phase', { step: i })));
        if (cold.kind === 'resume') { const st = stageEl(); if (st && O55.art.peek) later(160, () => O55.art.peek(st)); later(900, () => say(line('pod.resumed'))); }
        else later(1000, () => podScreen(def));
      } else later(760, () => podScreen(def));
    } else if (claim && claim.kind === 'card') actCard(claim, def);
    else if (claim && claim.kind === 'ready') { later(reduced() ? 0 : 170, readyRail); later(2270, () => podScreen(def, { lane: 'lip' })); }
    else {
      if (o.chapterMove || O55.S.railHold) railWalk();
      later(760, () => podScreen(def, def.id === 'ready' ? { lane: 'lip' } : null));
    }
    if (def.id === 'ready') setupCard(layer);
    /* 4. brackets lock on to the chosen card once the entrance has settled (its blocks have stopped arriving), at the
       start of a frame */
    const t = token;
    M.settled(layer, { fallback: 2600 }).then(() => {
      if (t !== token) return;
      M.real.raf(() => { if (t === token && layer.isConnected && shown() && painted()) { R.marksAt = 0; marks(layer); } });
    });
  }

  /* ------------------------------------------------------------------ H4c: one line carries you into the tour */
  /* the resting Pod lifts two hops and detaches into the page at its own place (a fixed element above the tour,
     moved by its translate property only), so the same Pod can fly on into the tour's dock */
  function detachPod() {
    const p = residentPod(), F = fx();
    if (!p || !F || !has('pod') || calm()) return Promise.resolve(null);
    const r = p.getBoundingClientRect(); if (r.width < 4) return Promise.resolve(null);
    const fly = document.createElement('div');
    fly.className = 'o55nw-podfly'; fly.setAttribute('aria-hidden', 'true');
    fly.innerHTML = `<div class="o55nw-pod-bob">${podSvg()}</div>`;
    fly.style.left = Math.round(r.left) + 'px'; fly.style.top = Math.round(r.top) + 'px';
    document.body.appendChild(fly);
    p.setAttribute('data-away', '');
    /* nobody took it (the tour could not start): it goes */
    M.after(3000, () => { if (fly.isConnected && !fly.hasAttribute('data-o55-taken')) fly.remove(); });
    const lift = fly.animate([{ translate: '0px 0px', offset: 0, easing: 'step-end' }, { translate: '0px -6px', offset: 0.5, easing: 'step-end' }, { translate: '0px -12px', offset: 1 }], { duration: 160, fill: 'forwards' });
    return lift.finished.then(() => { fly.style.top = Math.round(r.top - 12) + 'px'; lift.cancel(); return fly; }, () => fly);
  }
  let handTok = 0;
  function handOver(hand) {
    const r = rootEl(), F = fx(), H = hand.H, st = stageEl(), win = r && r.querySelector('.o55-win');
    if (!r || !F || !win) { hand.lineRes(null); hand.podRes(null); return false; }
    const tok = ++handTok;
    /* (the window is closing: S.open is false, so these are the motion clock's own timers, not the screen's) */
    const at = (ms, fn) => M.after(ms, () => { if (handTok === tok) fn(); });
    M.quiet(2200);
    r.setAttribute('data-o55nw-hand', '');
    /* T0 the click's select; the troupe waves goodbye (its cheers start after it) */
    play('select');
    at(80, () => { const tr = troupe(); if (st && tr && tr.wave) tr.wave(st); });
    /* T240 the content steps out (one way, two steps), leaving the frame and the header rule; the Pod lifts off */
    at(240, () => {
      r.setAttribute('data-o55nw-hand', 'out');
      detachPod().then((fly) => hand.podRes(fly));
    });
    /* the window's close sound as its content has stepped out, clear of the last cheer */
    at(340, () => play('close'));
    /* T400-T660 the window folds to a 2 px ink line at its centre, which holds (blinking) until the tour moves it */
    at(400, () => {
      F.fold(win, { ms: 260 }).then((ln) => {
        if (ln) F.lineHold(ln);
        hand.lineRes(ln || null);
        /* nobody moved it: it goes */
        if (ln) M.after(2000, () => { if (ln.isConnected && ln.getAnimations().some((a) => { try { return a.effect.getComputedTiming().iterations === Infinity; } catch (_) { return false; } })) F.lineDrop(ln); });
      });
    });
    /* the scrim holds the dim until the tour's has taken over (takeScrim); if it never does, it steps out at T1140 */
    at(1140, () => { if (!H.taken) r.setAttribute('data-o55nw-scrim', 'out'); });
    return 1300;
  }

  /* ================================================================== the hooks */
  O55.nierWindow = {
    stepped() { return painted(); },
    say(text, o) { return say(text, o); },
    podHold, podIn,

    /* The window opens. A fresh open under NieR Mode with the Boot sequence part is the cold open (H2): the window
       opens empty from one line, the header assembles, and the scene is drawn asleep; a resumed run opens the same way
       to a short log. The first sound waits 120 ms (the open's silence). */
    open(o) {
      o = o || {};
      const R = runState(), s = O55.S, r = rootEl();
      R.idx = -1; R.chapter = null; R.pr = null; R.claim = null; R.cold = null; R.hand = null; R.complete = false;
      /* the furthest chapter this run has reached (a resumed run's history counts): an act card plays only on the
         first arrival in a chapter */
      if (s && s.sess) (s.sess.history || []).concat([s.sess.screen]).forEach((id) => { const d = O55.screens.defs[id]; if (d) R.maxIdx = Math.max(R.maxIdx, O55.stages.progress(s, d).index); });
      cancelAll(); podUntil = 0;
      handTok++; /* a hand-over still playing out (the window reopened within its hold) stops where it is */
      if (r) ['data-o55nw-cold', 'data-o55nw-go', 'data-o55nw-hand', 'data-o55nw-scrim'].forEach((a) => r.removeAttribute(a));
      if (r) { const win = r.querySelector('.o55-win'); if (win && O55.nierFx && O55.nierFx.unfold) O55.nierFx.unfold(win); }
      podHold(false);
      if (!r || !painted() || o.shown || calm() || !has('boot')) return false;
      R.cold = { kind: o.resumed ? 'resume' : 'start', asleep: !o.resumed && o.screen === 'welcome' && nierArt() };
      r.setAttribute('data-o55nw-cold', R.cold.kind);
      const def = O55.screens.defs[s.sess.screen];
      if (def && has('headers')) s.railHold = Object.assign({}, O55.stages.progress(s, def), { index: -1 });
      podHold(true);
      /* (the window's first sound is the skin's: it plays with the line, once the window has started to open) */
      return 'skin';
    },
    asleep() { return !!(run && run.cold && run.cold.asleep); },
    /* The boot log in the pane at the title's place: its lines caption the troupe's wake (each stamp is a beat of it),
       then the log closes onto its underline, which slides up to become the eyebrow's rule, and the screen shows.
       Building the window is the heaviest work of the run (its first visible frame styles and measures every scene of
       it, most of a second on a slow computer), and a choreography started in that frame would be over before it was
       seen (films: the window appeared already open). So the opening waits, the scrim dimming the app meanwhile and the
       window collapsed to nothing, for the first two calm frames (at most 1.2 s), and everything starts there: the line,
       the opening, the header assembling, the log, its first sound; the stage shows 560 ms later (promise.stage). */
    openGate(layer) {
      const R = runState(), cold = R.cold, F = fx();
      if (!cold || !F || !painted() || !layer || !layer.isConnected) { coldOff(cold); return null; }
      const pane = layer.parentElement, content = layer.querySelector('.o55-content');
      const anchor = layer.querySelector('.o55-eyebrow') || layer.querySelector('#o55-h');
      if (!pane || !content || !anchor) { coldOff(cold); return null; }
      let stageRes;
      const stage = new Promise((res) => { stageRes = res; });
      const gate = calmFrames(1200).then(() => {
        const r = rootEl();
        if (R.cold !== cold || cold.snapped || !layer.isConnected || !r) { stageRes(); return false; }
        r.setAttribute('data-o55nw-go', '');
        M.quiet(2600);
        M.after(120, () => { if (!cold.snapped && shown()) { cold.opened = true; play('open'); } });
        M.after(560, stageRes);
        /* reads first: where the log stands (the held screen is laid out) */
        const cr = content.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
        const lines = cold.kind === 'resume' ? [{ text: T('log.resume') }, { text: T('log.kept') }] : [{ text: T('log.check') }, { text: T('log.look') }, { text: T('log.wake') }, podLine()];
        const at0 = cold.kind === 'resume' ? 560 : 800;
        const log = F.bootlog(pane, lines, { kicker: T('log.kicker'), at: { left: cr.left, top: ar.top, width: cr.width, height: Math.max(10, ar.height) }, lineMs: 210, meterCells: 16, delay: at0 });
        if (!log.el) { coldOff(cold); return false; }
        cold.log = log;
        /* the log's frame (its meter cells, its underline) shows with its kicker, not in the empty window before it */
        if (log.el.animate) log.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: at0 - 20, fill: 'backwards' });
        layer.setAttribute('data-o55nw-cold', cold.kind);
        const st = stageEl(), tr = troupe();
        if (cold.asleep && tr && tr.wake && st) {
          tr.wake(st, { at: { slit: log.stamps[0], link: log.stamps[1], takeup: log.stamps[2], boot: log.stamps[3] } }).then(() => { cold.asleep = false; });
        } else cold.asleep = false;
        /* Pod hops into its corner at the last stamp (silent) */
        log.stamps[lines.length - 1].then(() => { if (R.cold === cold && !cold.snapped) podIn({ hops: 6, ms: 360 }); });
        return log.done.then(() => {
          if (R.cold !== cold || cold.snapped) return false;
          const to = ruleOf(layer);
          return log.close(to ? { to, edge: 'middle' } : {});
        });
      });
      gate.stage = stage;
      return gate;
    },
    /* a key or a press during the cold open: the log goes, the troupe stands, the window and header show whole */
    openSnap() {
      const R = runState(), cold = R.cold; if (!cold) return;
      cold.snapped = true; cold.asleep = false;
      if (cold.log) cold.log.cancel();
      const st = stageEl(), tr = troupe();
      if (st && tr && tr.snap) tr.snap(st);
      const r = rootEl();
      if (r) { r.classList.remove('o55-opening'); ['data-o55nw-cold', 'data-o55nw-go'].forEach((a) => r.removeAttribute(a)); r.querySelectorAll('.o55-layer[data-o55nw-cold]').forEach((l) => l.removeAttribute('data-o55nw-cold')); }
      podHold(false);
      if (!cold.opened) { cold.opened = true; play('open'); }
    },

    /* a screen change asks before it starts: the new chapter's sting is this skin's when an act card will land on it
       (a chapter finished for the first time this run, quests installed) or when Ready's curtain call will resolve on
       it. Either way the rail is held in its old state, and walks when its beat comes. */
    claimSting(from, def, dir) {
      const R = runState(), s = O55.S;
      R.claim = null;
      if (s) s.railHold = null;
      if (!painted() || !from || !def || !s) return false;
      const pr = O55.stages.progress(s, def), prev = R.chapter;
      if (!prev || prev === pr.current) return false;
      if (has('headers') && !calm() && R.pr) s.railHold = R.pr;
      const first = (dir || 'fwd') === 'fwd' && pr.index > R.maxIdx;
      if (!first) return false;
      if (pr.current === 'ready') {
        if (!nierArt() || R.stung.has('ready')) return false;
        R.claim = { kind: 'ready' }; R.stung.add('ready');
        return true;
      }
      const F = fx();
      if (!F || !F.enabled('banner') || R.chapters.has(prev)) return false;
      R.chapters.add(prev);
      R.claim = { kind: 'card', from: prev, to: pr.current };
      return true;
    },
    /* the end of an act: the old troupe bows together while its scene stays 240 ms longer (the scene it leaves waits
       as .o55-scene-waiting, 50-art-core.js; the PERF pass renamed it from .o55-wait, and this hook, still asking for
       the old name, found no troupe: the act card's bow and the stage's 240 ms had gone) */
    stageDelay() {
      const R = runState(), st = stageEl(), tr = troupe();
      if (!painted() || !R.claim || R.claim.kind !== 'card' || !st || !tr || !tr.bow) return 0;
      if (!st.querySelector(':scope > .o55-scene-wrap.o55-scene-waiting .o55-nier-unit') || !tr.acts(st)) return 0;
      tr.bow(st, { together: true });
      return 240;
    },

    /* a screen change begins (the click, two frames before the new screen is released): what the skin follows on the
       old screen lets go now, so no bracket, cursor, card or Pod line is left over the pane once the old screen has
       gone; the old screen's words go with it */
    leaving() {
      if (!painted()) return false;
      point(null); marks(null);
      cancelAll(); podUntil = 0;
      const F = O55.nierFx, r = rootEl();
      if (F && F.clear && r) F.clear(r); else if (F && F.pod) F.pod.hush();
      return false;
    },

    screen(layer, dir) {
      sync();
      const s = O55.S, def = O55.screens.defs[s.sess.screen], R = runState();
      if (!def) return false;
      /* the furthest chapter reached, in any look */
      R.maxIdx = Math.max(R.maxIdx, O55.stages.progress(s, def).index);
      const claim = R.claim, cold = dir === 'open' ? R.cold : null;
      R.claim = null;
      if (!painted() || !layer || !layer.isConnected) { if (s.railHold) { s.railHold = null; O55.ui.renderRail(); } return false; }
      point(null);
      cancelAll();
      if (O55.nierFx && O55.nierFx.pod) O55.nierFx.pod.hush(); /* none left after leaving(); the opening has no old screen */
      podUntil = 0;
      const prevChapter = R.chapter;
      /* error surfaces already on the new screen are part of it, not news */
      const pr = adopt(layer, def);
      /* the brackets wait for the entrance to settle (step 4) */
      R.at = M.now(); R.marksAt = Infinity;
      meter(layer); brand(true);
      if (cold) { const r = rootEl(); if (r) ['data-o55nw-cold', 'data-o55nw-go'].forEach((a) => r.removeAttribute(a)); if (!cold.log) podHold(false); if (!cold.opened) { cold.opened = true; play('open'); } }
      const F = fx(); if (!F) return false;
      /* The effects start at the next frame. This frame (the release) styles and lays out the new screen once; the
         effects' measurements then read a finished layout instead of forcing it again in the middle of it (films M1).
         Nothing shows early: the entrance's blocks are still unseen for their first steps. */
      const t = token, o = { claim, cold, chapterMove: dir !== 'open' && !!prevChapter && prevChapter !== pr.current };
      M.real.raf(() => { if (t === token && layer.isConnected && !layer.classList.contains('o55-out') && shown() && painted()) draw(layer, dir, def, pr, F, o); });
      return true;
    },

    refresh(layer) {
      sync();
      if (!painted() || !layer || !shown()) return false;
      const R = runState();
      meter(layer);
      /* a screen's own first render (its mounted() refreshes it while it is still held) is the screen hook's to draw */
      if (R.layer !== layer) return false;
      /* brackets wait for the screen's entrance (until then the cards are still arriving) */
      if (M.now() >= (R.marksAt || 0)) marks(layer);
      tint(); /* a pick under the cursor turns its tint into the chosen inversion */
      brand(true);
      /* the heading's words changed in place (Creating finished, a retry): they type on, from the next frame (a refresh
         that follows in the same task would replace words being typed) */
      const h = layer.querySelector('#o55-h'), title = h ? h.textContent : '';
      const retitled = !!(h && R.title && title !== R.title);
      R.title = title;
      errors(layer);
      const wasDone = R.commit === 'done';
      created();
      if (retitled && !(R.commit === 'done' && !wasDone)) {
        const t = token;
        M.real.raf(() => { const F = fx(), h2 = layerNow() && layerNow().querySelector('#o55-h'); if (F && t === token && h2 && h2.textContent === title) F.decode(h2); });
      }
      return false;
    },

    /* H4b "Curtain call": Ready under NieR's art. The troupe stands in a line as the curtain opens; the bows spell the
       chord, a rest, then the rise resolves the whole motif (the sting this skin claimed: only the first time this
       run) and h2 points at the next step, which brackets lock onto. No confetti. */
    ready(layer, fresh) {
      if (!fresh || !painted() || !nierArt() || !layer || !O55.art.curtainCall) return false;
      const st = stageEl(); if (!st) return false;
      const R = runState(), first = !!(R.claim && R.claim.kind === 'ready');
      const target = layer.querySelector('.o55-foot .o55-primary');
      O55.art.curtainCall(st, {
        chord: 'ready', point: 'h2', target, sting: first,
        onRise: () => { if (target && target.isConnected && shown()) { target.setAttribute('data-o55nw-lock', ''); marks(layerNow()); } }
      });
      return true;
    },

    refused(el) {
      const F = fx(); if (!F || !el || !F.enabled('glitch') || reduced()) return false;
      F.glitch(el);
      return true;
    },

    shake(field) {
      if (!painted() || !field) return false;
      const drawn = alertOn(field);
      const hint = field.querySelector('.o55-hint.o55-err');
      if (hint) runState().errs.add(errKey(hint));
      later(240, () => say(hint ? alertWords(hint, 'pod.alertField') : line('pod.alertField'), { now: true, lead: 'alert' }));
      return drawn;
    },

    op(key) {
      if (!painted()) return false;
      const s = O55.S, cm = s.sess.commit || {};
      if (key === cm.key) return false; /* the Project's creation has its own moment and line */
      const lines = O55.tx('nierWindow.pod.ops'); if (!Array.isArray(lines) || !lines.length) return false;
      const R = runState();
      /* the checks a screen runs by itself on arrival are part of the screen (its own line covers them); Pod reports
         the operations the person set going */
      if (M.now() - (R.at || 0) < 2600) return false;
      const words = lines[R.ops++ % lines.length];
      later(380, () => say(words));
      return true;
    },

    /* Input never waits (hero spec 1.7): a key or a press while the stage performs snaps the rest of it to its end
       state (the act of a toggle, the Created act, the curtain call, a wake), and words still typing show whole. It
       never prevents the input. */
    input() {
      if (!painted() || !shown()) return false;
      if (O55.nierLook && O55.nierLook.snap) O55.nierLook.snap();
      const st = stageEl(), tr = troupe();
      if (st && tr && tr.busy && tr.busy(st)) tr.snap(st);
      const card = layerNow() && layerNow().querySelector('[data-o55nw-card="typing"]');
      if (card) { card.setAttribute('data-o55nw-card', 'shown'); card.querySelectorAll('.o55-revv').forEach((v) => v.setAttribute('data-o55nw-on', '')); }
      if (O55.nierFx && O55.nierFx.snap) O55.nierFx.snap(rootEl());
      return false;
    },

    /* the hand-over to the Guided Tour, asked for at "Take the Guided Tour" before the window closes: null unless NieR
       Mode is painted with the Slice part and motion is on (the families keep their morph) */
    handoff() {
      const r = rootEl(), F = fx();
      if (!r || !shown() || !F || !has('slice') || calm()) return null;
      const R = runState(), p = has('pod') ? residentPod() : null, pr = p ? p.getBoundingClientRect() : null;
      let lineRes, podRes;
      const H = {
        kind: 'nier-line', at: M.now(), taken: false,
        line: new Promise((res) => { lineRes = res; }), pod: new Promise((res) => { podRes = res; }),
        podRect: pr && pr.width > 4 ? { left: pr.left, top: pr.top, width: pr.width, height: pr.height } : null,
        /* the tour's scrim stands at full dim: the window's goes in the same frame */
        takeScrim() { H.taken = true; const root = rootEl(); if (root) root.setAttribute('data-o55nw-scrim', 'off'); }
      };
      if (!H.podRect) podRes(null);
      R.hand = { H, lineRes, podRes };
      return H;
    },

    close(reason, handoff) {
      cancelAll(); point(null); marks(null); podUntil = 0;
      const ret = document.getElementById('o55np-reticle'); if (ret) ret.removeAttribute('data-o55nw-hide');
      /* the strip goes in this frame, never ghosting over a window that is leaving (Q5) */
      if (O55.nierFx && O55.nierFx.pod) O55.nierFx.pod.hush(true);
      const R = runState(), hand = R.hand, r = rootEl();
      R.hand = null; R.cold = null;
      if (r) { r.removeAttribute('data-o55nw-cold'); r.removeAttribute('data-o55nw-go'); if (!hand) ['data-o55nw-hand', 'data-o55nw-scrim'].forEach((a) => r.removeAttribute(a)); }
      if (hand && handoff && reason === 'done' && painted()) return handOver(hand);
      if (hand) { hand.lineRes(null); hand.podRes(null); }
      return false;
    }
  };
})();
