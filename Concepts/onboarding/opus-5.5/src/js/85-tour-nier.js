/* NieR Mode's Guided Tour (styles: src/css/41-tour-nier.css, words: src/copy.d/50-nier-tour.json). It follows the
   engine's moments (TR.on, 80-tour-core.js) and draws with O55.nierFx (16-nier-fx.js). Nothing here does anything
   while NieR Mode is off, and each touch asks for its own installed part, so Quiet, Still and Colors only fall back
   cleanly to the Basic tour in NieR inks:
     headers    the callout's kicker is an ink title band with the step count (or Complete); the bar's name is one
     voice/pod  Pod 042 speaks in the callout: one line per step, led by Report, Proposal, Query or Alert [voice];
                the Pod itself docks beside its words [pod] and is the Show Me pointer: it leaves the dock, travels
                in held steps, fires its signal at what it presses (its chirp) and flies home
     brackets   four ink corners on the callout and on the spotlight, locking on in steps; the spotlight jumps in
                steps; keyboard focus gets the tour's own corners (the page's reticle stands down while it runs)
     square     a square spotlight
     decode     the callout's title and the Pod's words resolve from scrambled glyphs
     slice      each new callout slices open where it stands; the bar slices open at the start
     reboot     a reboot band opens the tour, and plays while the layout goes back at the end
     quests     a quest banner names each new chapter while the spotlight moves on; the landing note keeps out of
                the way of the page's own Tour complete banner, so nothing lands on top of it
     glitch     a missing target is an Alert: the callout tears
     sweep      a scan line steps down each newly locked target    ticks   map ticks on the spotlight's edges
     blocks     the bar's progress as ink blocks                     cursor  ink hover, and the menu cursor on the
                                                                             finish choices (with its tick)
   Reduced Motion gives end states only (O55.nierFx and the CSS keep to it); timers run on the motion clock. Sounds
   are O55.sound events, so the tour's mute governs them: the core plays callout, checkpoint, pointer, arrive,
   missing, interrupt and the rest; here the Pod's chirp ('pod', its press), decode (under the title), 'quest' and
   'reboot' (the banner and the band) and the cursor's 'hover'. */
(function () {
  'use strict';
  const O55 = window.O55, M = O55.motion, TR = O55.tour, U = O55.util;
  if (!TR || !TR.on) return;
  const st = TR.st, html = document.documentElement;
  const T = (k, v) => O55.t('tour.nier.' + k, v);
  const FX = () => (O55.nierFx && O55.nierFx.enabled ? O55.nierFx : null);
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  const has = (k) => painted() && (' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').indexOf(' ' + k + ' ') >= 0;
  const still = () => M.reduced();
  const sound = (ev, o) => { try { return !!O55.sound.play(ev, o); } catch (_) { return false; } };
  const calloutEl = () => (st.root ? st.root.querySelector('.o55t-callout') : null);
  const two = (n) => String(n).padStart(2, '0');

  /* ------------------------------------------------------------------ Pod 042 */
  /* PMConcept7's original ink-line Pod (the same drawing as kit.d/19-nier-parts.js and O55.nierFx): a chamfered box
     with a sensor slit, two side arms and a skirt */
  const POD = '<path class="o55t-podf" d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z"/><path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>'
    + '<path class="o55t-podf" d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z"/><path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>'
    + '<path class="o55t-podi" stroke="none" d="M15 18H25V21H15Z"/><path class="o55t-podi" stroke="none" d="M22 18H25V21H22Z" opacity=".35"/>';
  const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square"';
  /* the pointer's Pod hovers up and to the right of the point it presses: its middle sits this far from the hotspot
     on screen (the 30 px pointer box, viewBox 32, hotspot (6, 3), Pod at translate(14 -44.8) scale(.8)); the dock in
     the callout draws the same Pod at the same size (30 x 39 px), so the one becomes the other */
  const POD_DX = 22.5, POD_DY = -25.3;
  const LEAD = /^(report|proposal|alert|query|analysis)\s*:\s*/i;

  /* the line Pod says now, and what kind of line it is (a new step's 'line', 'wait' until an info step is ready,
     'done', 'missing', 'show', 'paused', 'back' after an interrupted Show Me) */
  let back = 0;
  function lineFor(d) {
    const s = d.step, k = (x) => { const v = O55.tx('tour.nier.pod.steps.' + s.id + '.' + x); return typeof v === 'string' ? v : ''; };
    if (d.missing) return { kind: 'missing', text: T('pod.missing') };
    if (st.show) return { kind: 'show', text: T('pod.showMe') };
    if (st.paused) return { kind: 'paused', text: T('pod.paused') };
    if (back && M.now() - back < 6000) return { kind: 'back', text: T('pod.interrupted') };
    if (d.done) return { kind: 'done', text: k('done') || T('pod.done.' + ['first', 'second', 'third'][s.index % 3]) };
    let ready = true; try { ready = s.kind !== 'info' || !s.ready || !!s.ready(st); } catch (_) {}
    if (!ready && k('wait')) return { kind: 'wait', text: k('wait') };
    return { kind: 'line', text: k('line') };
  }
  function podHtml(line, unit, voice) {
    const m = LEAD.exec(line.text), lead = m ? m[1].toLowerCase() : 'report', words = m ? line.text.slice(m[0].length) : line.text;
    return `<div class="o55t-pod" data-key="o55t-pod" data-lead="${lead}" data-kind="${line.kind}"${unit ? ' data-unit' : ''}${voice ? ' data-voice' : ''}>`
      + (unit ? `<span class="o55t-pod-unit" aria-hidden="true"><svg viewBox="0 0 40 52" ${STROKE}>${POD}</svg><i></i><i></i><i></i></span>` : '')
      + '<div class="o55t-pod-copy">'
      + (voice ? `<span class="o55t-pod-head" aria-hidden="true"><i></i><i></i><i></i><span>${U.esc(O55.t('nierFx.pod.name'))}</span></span>` : '')
      + `<p class="o55t-pod-line">${voice ? `<b class="o55t-pod-lead">${U.esc(O55.t('nierFx.pod.leads.' + lead))}</b> ` : ''}<span class="o55t-pod-words">${U.esc(words)}</span></p>`
      + '</div></div>';
  }
  /* the docked Pod turns to its words and sends three signals, with its chirp */
  function chirp() {
    const u = st.root && st.root.querySelector('.o55t-callout .o55t-pod-unit');
    if (u && !still()) { u.classList.remove('o55t-sig'); void u.offsetWidth; u.classList.add('o55t-sig'); }
    sound('pod');
  }
  const dock = () => {
    const u = st.root && st.root.querySelector('.o55t-callout .o55t-pod-unit'); if (!u) return null;
    const r = u.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2 - POD_DX, y: r.top + r.height / 2 - POD_DY } : null;
  };

  /* ------------------------------------------------------------------ the engine's style under NieR */
  TR.on('look', (lk) => {
    if (!painted()) return;
    if (has('square')) lk.radius = 0;
    if (has('brackets')) lk.glide = 'steps';
    /* Pod 042 travels in nine held hops and carries in held steps; its press is its chirp */
    if (has('pod')) { lk.travel = { n: 9, ease: M.ease.hand, frame: 'steps(1, end)' }; lk.drag = M.ease.steps(14); lk.press = 'pod'; }
  });

  /* the spotlight's corners, map ticks and scan line ride in the ring's own box; the Pod pointer joins the four
     family glyphs (all shown by CSS only under NieR Mode) */
  TR.on('build', ({ root }) => {
    const box = root.querySelector('.o55t-ringbox');
    if (box && !box.querySelector('.o55t-nring')) {
      box.insertAdjacentHTML('beforeend', '<span class="o55t-nring" aria-hidden="true">'
        + '<i class="o55t-nbk o55t-tl"></i><i class="o55t-nbk o55t-tr"></i><i class="o55t-nbk o55t-bl"></i><i class="o55t-nbk o55t-br"></i>'
        + '<i class="o55t-ntk o55t-t"></i><i class="o55t-ntk o55t-r"></i><i class="o55t-ntk o55t-b"></i><i class="o55t-ntk o55t-l"></i><i class="o55t-nscan"></i></span>');
    }
    const svg = root.querySelector('.o55t-pointer svg');
    if (svg && !svg.querySelector('.o55t-pg-nier')) {
      svg.insertAdjacentHTML('beforeend', '<g class="o55t-ptr o55t-pg-nier">'
        + '<path class="o55t-pgn-ret" d="M1 0V-2H3 M9 -2H11V0 M1 6V8H3 M9 8H11V6"/>'
        + '<rect class="o55t-pgn-s" x="28.7" y="-30.5" width="2.6" height="2.6"/><rect class="o55t-pgn-s" x="28.7" y="-30.5" width="2.6" height="2.6"/><rect class="o55t-pgn-s" x="28.7" y="-30.5" width="2.6" height="2.6"/>'
        + `<g class="o55t-pgn-dip"><g class="o55t-pgn-bob"><g transform="translate(14 -44.8) scale(.8)" ${STROKE}>${POD}</g></g></g></g>`);
    }
  });

  /* ------------------------------------------------------------------ the callout */
  TR.on('callout', (d) => {
    if (!painted()) return;
    const s = d.step, inCh = TR.defs.filter((x) => x.chapter === s.chapter);
    if (has('headers')) { d.count = d.done ? T('complete') : two(inCh.indexOf(s) + 1) + '/' + two(inCh.length); d.tryLabel = T('objective'); }
    const unit = has('pod'), voice = has('voice');
    if (!unit && !voice) return;
    const line = lineFor(d);
    if (line.text) d.pod = podHtml(line, unit, voice);
  });

  /* a new line from the Pod resolves from glyphs (a fresh step's line or a report that it is ready also chirps) */
  let spoken = null;
  function speak(arrival) {
    const c = calloutEl(), strip = c && c.querySelector('.o55t-pod'), w = strip && strip.querySelector('.o55t-pod-words');
    const text = w ? w.textContent : '', kind = strip ? strip.getAttribute('data-kind') : '';
    if (!arrival && spoken && spoken.text === text) return;
    const was = spoken; spoken = { text, kind, step: st.step && st.step.id };
    if (!w || !text) return;
    const fx = FX();
    if (fx && (arrival || !was || was.text !== text)) fx.decode(w, { ms: Math.min(900, 300 + text.length * 6) });
    if (arrival ? !arrival.silent : (kind === 'line' && was && was.kind === 'wait' && was.step === spoken.step)) chirp();
  }
  /* (a step's arrival speaks in 'step', once the callout stands where it goes) */
  TR.on('render', () => { if (!painted()) spoken = null; else if (!st.entering) speak(null); });

  /* the title resolves too; screen readers hear the real words from the label while the glyphs settle */
  function decodeTitle(sound) {
    const fx = FX(), c = calloutEl(), h = c && c.querySelector('#o55t-h'); if (!fx || !h) return;
    const words = h.textContent;
    h.setAttribute('aria-label', words);
    fx.decode(h, { ms: Math.min(560, 260 + words.length * 4), sound: !!sound }).then(() => { if (h.isConnected && h.getAttribute('aria-label') === words) h.removeAttribute('aria-label'); });
  }
  /* the callout's corners lock on in three steps */
  function lockCallout() {
    const c = calloutEl(); if (!c || !has('brackets') || still() || typeof c.animate !== 'function') return;
    try { c.animate([{ scale: '1.07', opacity: 0 }, { scale: '1.03', opacity: 1, offset: 0.66 }, { scale: '1', opacity: 1 }], { duration: 210, easing: 'steps(3, end)', pseudoElement: '::before' }); } catch (_) {}
  }

  /* ------------------------------------------------------------------ the spotlight */
  let lockedAt = -1e9;
  function lockRing() {
    if (!has('brackets') || still() || !st.root || performance.now() - lockedAt < 120) return;
    lockedAt = performance.now();
    const ring = st.root.querySelector('.o55t-nring'); if (!ring) return;
    ring.querySelectorAll('.o55t-nbk').forEach((c) => {
      const sx = c.classList.contains('o55t-tl') || c.classList.contains('o55t-bl') ? -1 : 1, sy = c.classList.contains('o55t-tl') || c.classList.contains('o55t-tr') ? -1 : 1;
      c.animate([{ transform: `translate(${sx * 12}px, ${sy * 12}px)`, opacity: 0 }, { transform: `translate(${sx * 5}px, ${sy * 5}px)`, opacity: 1, offset: 0.66 }, { transform: 'translate(0px, 0px)', opacity: 1 }],
        { duration: 240, easing: 'steps(3, end)' });
    });
    const scan = ring.querySelector('.o55t-nscan'), h = st.hole ? st.hole.h : 0;
    if (scan && has('sweep') && h > 24) {
      scan.animate([{ transform: 'translateY(0px)', opacity: 0 }, { transform: 'translateY(0px)', opacity: 1, offset: 0.1 },
        { transform: `translateY(${Math.round(h - 2)}px)`, opacity: 0.9, offset: 0.86 }, { transform: `translateY(${Math.round(h - 2)}px)`, opacity: 0 }],
      { duration: 480, delay: 160, easing: 'steps(8, end)', fill: 'backwards' });
    }
  }
  TR.on('target', (d) => { if (painted() && d.el && TR.running && !st.entering) lockRing(); });

  /* ------------------------------------------------------------------ steps arrive */
  TR.on('arrive', (d) => {
    const root = st.root;
    back = 0;
    if (!painted()) return null;
    /* the callout opens where it stands (a slice), so it does not glide there first */
    if (has('slice') && !still()) root.classList.add('o55t-njump');
    /* a new chapter: a quest banner while the spotlight moves on, then the callout */
    const fx = FX();
    if (d.chapterChanged && d.forward && fx && fx.enabled('banner')) {
      d.hold = true; d.sound = null; /* the banner's quest sting is this chapter's sound */
      root.classList.add('o55t-nheld');
      const ch = d.step.chapter, n = TR.CHAPTERS.indexOf(ch) + 1;
      const shown = fx.banner({ kicker: T('banner.kicker', { n }), title: O55.t('tour.chapters.' + ch), sub: T('banner.' + ch), ms: 1800, within: root });
      return Promise.race([shown, M.delay(still() ? 900 : 1380)]);
    }
    return null;
  });
  TR.on('step', (d) => {
    const root = st.root;
    root.classList.remove('o55t-nheld');
    if (!painted()) { root.classList.remove('o55t-njump'); return; }
    const fx = FX(), c = calloutEl();
    if (fx && c) {
      if (has('slice')) fx.slice(c, { ms: 260 });
      decodeTitle(!d.silent);
      if (d.first && has('slice')) fx.slice(root.querySelector('.o55t-bar'), { ms: 300 });
    }
    if (d.first) M.after(220, podArrives);
    lockCallout(); lockRing();
    speak(d);
    if (d.chapterChanged && !still()) {
      const pip = root.querySelector('.o55t-pip.o55t-cur');
      if (pip) pip.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0.3, offset: 0.5 }, { opacity: 1, offset: 0.75 }, { opacity: 1 }], { duration: 420, easing: 'step-end' });
    }
    M.release(() => root.classList.remove('o55t-njump'));
  });

  /* done: the kicker says Complete and flickers once, the spotlight's corners lock again */
  TR.on('complete', () => {
    if (!painted() || still()) return;
    const k = st.root.querySelector('.o55t-callout .o55t-kicker');
    if (k && has('headers')) k.animate([{ opacity: 1 }, { opacity: 0.2, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0.2, offset: 0.75 }, { opacity: 1 }], { duration: 360, easing: 'step-end' });
    lockedAt = -1e9; lockRing();
  });

  /* a missing target: Alert, and the callout tears */
  TR.on('missing', (d) => {
    if (!d.on || !painted()) return;
    const fx = FX(), c = calloutEl();
    if (fx && c) { fx.alert(c); decodeTitle(false); }
  });

  /* ------------------------------------------------------------------ Show Me: Pod 042 */
  TR.on('showMe', () => {
    if (!painted()) return;
    if (has('pod')) TR.pointer.pos = null; /* it leaves from its dock every time */
    TR.refresh();
  });
  TR.on('pointerFrom', (d) => { if (has('pod')) { const at = dock(); if (at) d.at = at; } });
  /* at the start, the app's own Pod (the corner one, which stands down while the tour runs) flies to its dock in the
     first callout: one Pod, never two */
  function podArrives() {
    if (!has('pod') || still() || st.show) return;
    const home = document.getElementById('o55np-pod'), at = dock(); if (!home || !at) return;
    const r = home.getBoundingClientRect(); if (!r.width) return;
    const P = TR.pointer, root = st.root;
    root.classList.add('o55t-npodout');
    P.pos = null; P.show(r.left + r.width / 2 - POD_DX, r.top + r.height / 2 - POD_DY);
    const done = () => { root.classList.remove('o55t-npodout'); if (!st.show) { P.hide(); P.pos = null; } };
    M.delay(60).then(() => (st.show ? null : P.moveTo(at.x, at.y, 460, { quiet: true }))).then(done, done);
  }
  TR.on('showMeEnd', () => {
    if (!has('pod') || still()) return null;
    const at = dock(); if (!at) return null;
    return TR.pointer.moveTo(at.x, at.y, 300, { quiet: true });
  });
  TR.on('showMeDone', () => { if (painted() && TR.running) TR.refresh(); });
  TR.on('interrupt', () => { if (!painted() || !TR.running) return; back = M.now(); TR.refresh(); M.after(6100, () => { if (back && TR.running) { back = 0; TR.refresh(); } }); });
  TR.on('pause', () => { if (painted() && TR.running) TR.refresh(); });

  /* what Show Me is about to press: the spotlight locks on again, or (elsewhere) corners lock on it until the press */
  let cued = null;
  TR.on('cue', (d) => {
    const fx = FX(); if (!fx || !has('brackets') || !d.el) return;
    const t = st.target;
    if (t && (t === d.el || t.contains(d.el) || d.el.contains(t))) { lockedAt = -1e9; lockRing(); return; }
    if (cued && cued !== d.el) fx.brackets(cued, false);
    cued = d.el; fx.brackets(d.el, true);
    const el = d.el;
    M.after(1400, () => { if (cued === el) { fx.brackets(el, false); cued = null; } });
  });

  /* ------------------------------------------------------------------ the bar */
  TR.on('bar', (d) => { if (has('headers')) d.pip[d.chapter] = `<span class="o55t-readout" aria-hidden="true">${two(d.si + 1)}/${two(d.total)}</span>`; });

  /* ------------------------------------------------------------------ open and close */
  TR.on('start', (d) => {
    const fx = FX(), root = st.root;
    if (!painted() || !fx || !fx.enabled('band') || still()) return null;
    d.noMorph = true; /* the band is the handoff from the onboarding window */
    root.classList.add('o55t-nboot');
    const done = () => root.classList.remove('o55t-nboot');
    return fx.band(T(d.resume ? 'band.resume' : 'band.start'), 1500, { kicker: T('band.kicker'), within: root }).then(done, done);
  });
  TR.on('ending', (d) => {
    const fx = FX();
    if (d.silent || !painted() || !fx || !fx.enabled('band') || still()) return null;
    const key = d.status === 'done' ? (d.keep ? 'band.keep' : 'band.restore') : 'band.skip';
    st.root.classList.add('o55t-nend');
    /* short: the layout goes back beneath it, and the prompt on the Planning Wizard should not wait */
    return fx.band(T(key), 900, { kicker: T('band.kicker'), within: st.root });
  });
  TR.on('end', () => {
    if (st.root) st.root.classList.remove('o55t-nend', 'o55t-nheld', 'o55t-njump', 'o55t-nboot', 'o55t-npodout');
    spoken = null; back = 0; focusOff(); cursorOff();
    const fx = FX(); if (fx && cued) { fx.brackets(cued, false); cued = null; }
  });

  /* The landing note comes at once, in Pod's voice. The page's own Tour complete banner (kit.d/20-nier-world.js, a
     92 px band at 23 % of the window, about 0.7 s after the tour finishes, for about 3 s) would sit on it where it
     usually goes, under the Wizard's heading: there it moves down past the band's reach instead, so the two never
     overlap and nothing has to wait. It slices in and its words resolve. */
  TR.on('landing', (d) => { if (has('voice')) d.lead = O55.t('nierFx.pod.leads.proposal'); });
  TR.on('landed', ({ note }) => {
    if (!painted() || !note) return;
    if (has('quests')) {
      const top = innerHeight * 0.23 - 10, bottom = innerHeight * 0.23 + 92 + 12;
      const hits = () => { const r = note.getBoundingClientRect(); return r.bottom > top && r.top < bottom; };
      for (let next = note.nextElementSibling; hits() && next; next = note.nextElementSibling) next.after(note);
    }
    const fx = FX(); if (!fx) return;
    if (has('slice')) fx.slice(note, { ms: 280 });
    const span = note.lastElementChild, node = span && span.lastChild;
    if (node && node.nodeType === 3) fx.decode(node, { ms: 520 });
  });

  /* ------------------------------------------------------------------ keyboard focus and the menu cursor */
  /* The page's reticle marks keyboard focus anywhere and would compete with the spotlight (41-tour-nier.css hides it
     while the tour runs): here focus moved by the keyboard gets the tour's own corners instead, except on the
     spotlight's target (the spotlight marks it) and on the callout's heading (it takes focus for screen readers). */
  let kbdAt = -1e9, focused = null;
  function focusOff() { const fx = FX(); if (focused && fx) fx.brackets(focused, false); focused = null; }
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab' || /^Arrow/.test(e.key) || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') kbdAt = performance.now(); }, true);
  document.addEventListener('focusin', (e) => {
    const fx = FX(), t = e.target;
    if (!TR.running || !fx || !has('brackets') || !(t instanceof Element) || t === document.body) return;
    if (performance.now() - kbdAt > 900 || t.id === 'o55t-h' || (st.target && (t === st.target || st.target.contains(t)))) { focusOff(); return; }
    if (focused !== t) { focusOff(); focused = t; fx.brackets(t, true); }
  }, true);
  document.addEventListener('focusout', (e) => { if (focused && e.target === focused) focusOff(); }, true);

  /* the finish choices are rows: the menu cursor sits on the one under the pointer or focus (the Restore row at
     first); the tour's buttons tick as the pointer comes onto them */
  let curRow = null;
  function cursorOff() { const fx = FX(); if (curRow && fx) fx.cursor(curRow, false); curRow = null; }
  function cursorOn(row, tick) {
    const fx = FX(); if (!fx || !has('cursor') || !row) return;
    if (curRow === row && row.isConnected) return;
    curRow = row; fx.cursor(row, true);
    if (tick) sound('hover');
  }
  TR.on('render', () => {
    if (curRow && !curRow.isConnected) curRow = null;
    const c = calloutEl(), rows = c ? c.querySelectorAll('.o55t-choice') : [];
    if (!rows.length) { if (curRow) cursorOff(); return; }
    if (!curRow && has('cursor')) cursorOn(c.querySelector('.o55t-choice.o55t-on') || rows[0], false);
  });
  TR.on('build', ({ root }) => {
    root.addEventListener('pointerover', (e) => {
      if (!painted() || !e.target.closest) return;
      const row = e.target.closest('.o55t-choice');
      if (row) { cursorOn(row, true); return; }
      const b = e.target.closest('.o55t-btn, .o55t-barbtn, .o55t-seg button');
      if (b && has('cursor') && !(e.relatedTarget && b.contains(e.relatedTarget))) sound('hover');
    });
    root.addEventListener('focusin', (e) => { const row = painted() && e.target.closest ? e.target.closest('.o55t-choice') : null; if (row) cursorOn(row, true); });
  });
})();
