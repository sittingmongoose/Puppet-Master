/* NieR Mode's Guided Tour (styles: src/css/41-tour-nier.css, words: src/copy.d/50-nier-tour.json). It follows the
   engine's moments (TR.on, 80-tour-core.js) and draws with O55.nierFx (16-nier-fx.js). Nothing here does anything
   while NieR Mode is off, and each touch asks for its own installed part, so Quiet, Still and Colors only fall back
   cleanly to the Basic tour in NieR inks:
     headers    the callout's kicker is an ink title band with the step count (or Complete); the bar's name is one,
                and the current chapter's name in the bar is an ink block that walks to the next chapter
     voice/pod  Pod 042 speaks in the callout: one line per step, led by Report, Proposal, Query or Alert [voice];
                the Pod itself docks beside its words [pod] and is the Show Me pointer (below)
     brackets   four ink corners on the callout and on the spotlight, locking on in steps; the spotlight jumps in
                steps; keyboard focus gets the tour's own corners (the page's reticle stands down while it runs); Show
                Me's control frame: four corner marks at the window's corners, "Pod 042 · In control" and "Press any
                key to stop" (any key does), and "You have control" when it hands back
     square     a square spotlight
     decode     the callout's title, the Pod's words, the frame's tag, the results and the landing note type on behind
                a block caret (O55.nierFx.type: their layout is held from the first frame, so nothing reflows)
     slice      each new callout slices open where it stands; the bar slices open at the start and wherever it
                moves (bottom or top); at the finish the callout folds to a line and the results card opens from it
     reboot     a reboot band opens the tour over the NieR ground, and plays while the layout goes back at the end
     quests     a hung card names each new chapter (lowered on two strings) while the spotlight moves on; the finish is
                a results card (the page's own Tour complete banner stays away while it shows)
     glitch     a missing target is an Alert: the callout tears
     sweep      a scan line steps down each newly locked target    ticks   map ticks on the spotlight's edges
     blocks     the bar's progress as ink blocks                     cursor  ink hover, and the menu cursor on the
                                                                             finish choices (with its tick)
   Pod 042 [pod] is one character from setup to the end. It arrives with the onboarding window's ink line (the
   hand-over) or from the app's corner, docks in each callout, and in Show Me it leaves the dock at full size (40 x 52),
   hovers over what it will press, lowers a string with a knot onto it, tugs it (the press), lets go and flies home; at
   the finish it sits in the results card and then flies back to the app's corner. Never two Pods on screen.
   Reduced Motion gives end states only (O55.nierFx and the CSS keep to it); timers run on the motion clock. Sounds
   are O55.sound events, so the tour's mute governs them: the core plays callout, checkpoint, pointer, missing (under
   NieR the sound kit gives it the glitch tear), interrupt and the rest; here the Pod's chirp ('pod', its press; at
   most one in two seconds), the string ('string', with its place), the hand-back ('interrupt'), 'quest' on a hung
   card's landing, the bar walk's 'move' ticks, the results ('rest', then 'finish', a 'phase' per row), the goodbye
   ('pod', its low variant), 'reboot' (the band) and the cursor's 'hover' (only for a pointer that really moved). */
(function () {
  'use strict';
  const O55 = window.O55, M = O55.motion, TR = O55.tour, U = O55.util;
  if (!TR || !TR.on) return;
  const st = TR.st, html = document.documentElement, P = TR.pointer;
  const T = (k, v) => O55.t('tour.nier.' + k, v);
  const FX = () => (O55.nierFx && O55.nierFx.enabled ? O55.nierFx : null);
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  const has = (k) => painted() && (' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').indexOf(' ' + k + ' ') >= 0;
  const still = () => M.reduced();
  const sound = (ev, o) => { try { return !!O55.sound.play(ev, o); } catch (_) { return false; } };
  const calloutEl = () => (st.root ? st.root.querySelector('.o55t-callout') : null);
  const two = (n) => String(n).padStart(2, '0');

  /* ------------------------------------------------------------------ Pod 042 */
  /* PMConcept7's original ink-line Pod, the one drawing every Pod of the onboarding and the tour shares
     (O55.nierFx.podSvg): a chamfered box with a sensor slit, two side arms and a skirt. The pointer's Pod also has an
     eye cell in its slit that lights while it works. */
  const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square"';
  const podPaths = () => { const fx = O55.nierFx; return fx && typeof fx.podSvg === 'function' ? fx.podSvg('o55t-pod', { part: 'paths', fill: 'o55t-podf', ink: 'o55t-podi' }) : ''; };
  const podSvg = (extra) => `<svg viewBox="0 0 40 52" ${STROKE} aria-hidden="true">${podPaths()}${extra || ''}</svg>`;
  const EYE = '<rect class="o55t-npod-eye" stroke="none" x="16.5" y="18.75" width="3" height="1.5"/>';
  const LEAD = /^(report|proposal|alert|query|analysis)\s*:\s*/i;

  /* the line Pod says now, and what kind of line it is (a new step's 'line', 'wait' until an info step is ready,
     'done', 'missing', 'show', 'paused', 'back' after an interrupted Show Me) */
  let back = 0;
  function lineFor(d) {
    const s = d.step, k = (x) => { const v = O55.tx('tour.nier.pod.steps.' + s.id + '.' + x); return typeof v === 'string' ? v : ''; };
    if (d.missing) return { kind: 'missing', text: T('pod.missing') };
    if (st.show && st.show.step === s) return { kind: 'show', text: T('pod.showMe') };
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
      + (unit ? `<span class="o55t-pod-unit" aria-hidden="true"><span class="o55t-pod-bob">${podSvg()}</span><i></i><i></i><i></i></span>` : '')
      + '<div class="o55t-pod-copy">'
      + (voice ? `<span class="o55t-pod-head" aria-hidden="true"><i></i><i></i><i></i><span>${U.esc(O55.t('nierFx.pod.name'))}</span></span>` : '')
      + `<p class="o55t-pod-line">${voice ? `<b class="o55t-pod-lead">${U.esc(O55.t('nierFx.pod.leads.' + lead))}</b> ` : ''}<span class="o55t-pod-words">${U.esc(words)}</span></p>`
      + '</div></div>';
  }
  /* the docked Pod sends three signals toward its words, with its chirp. Pod 042 chirps at most once in two seconds:
     its Show Me press is a chirp, and the next step's line arriving right after it stays silent (one voice per beat).
     The signals are Web Animations (a CSS restart would force a layout of this very large page). */
  let podAt = -1e9;
  function chirp() {
    if (M.now() - podAt < 2000) return;
    podAt = M.now();
    const u = st.root && st.root.querySelector('.o55t-callout .o55t-pod-unit');
    if (u && !still() && typeof u.animate === 'function') {
      u.querySelectorAll(':scope > i').forEach((i, k) => i.animate([{ transform: 'translate(0px, 0px)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: 'translate(30px, -4px)', opacity: 0 }],
        { duration: 480, delay: k * 80, easing: 'steps(6, end)', fill: 'backwards' }));
    }
    sound('pod');
  }
  /* the dock: the docked Pod's middle. The pointer's Pod is drawn about the pointer's point (its middle), at the
     docked Pod's size while it sits there (scale .75: 30 x 39) and at full size when it is out (40 x 52), so the one
     becomes the other where it stands */
  const dock = () => {
    const u = st.root && st.root.querySelector('.o55t-callout .o55t-pod-unit'); if (!u) return null;
    const r = u.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  };
  const npod = () => st.root && st.root.querySelector('.o55t-pointer .o55t-npod');
  const podState = (s) => { const n = npod(); if (n && n.getAttribute('data-npod') !== s) n.setAttribute('data-npod', s); };
  const eye = (on) => { const n = npod(); if (n) n.toggleAttribute('data-eye', !!on); };
  /* a flight to a dock: out at full size, back to the dock's size over its last hop. A newer flight (a Show Me that
     takes the Pod over) leaves it out. */
  let homeTok = 0;
  function homeTo(at, ms) {
    const tok = ++homeTok;
    podState('out');
    const t = M.after(Math.max(0, ms - 120), () => { if (tok === homeTok) podState('dock'); });
    return P.moveTo(at.x, at.y, ms, { quiet: true }).then((v) => { t.cancel(); if (tok === homeTok) podState('dock'); return v; });
  }

  /* ------------------------------------------------------------------ the engine's style under NieR */
  /* where Pod 042 hovers to reach el: 64 px above its middle (at least 47.5 above its top edge), its string lowered
     onto the top edge; with under 80 px of room above, beside it to the right (else the left), its string run across */
  const SHAFT = 15, ARM = 17;
  function hoverFor(el, c) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    const r = el.getBoundingClientRect(); if (!r.width && !r.height) return null;
    if (r.top >= 80) return { x: c.x, y: Math.max(30, Math.min(c.y - 64, r.top - 47.5)) };
    const right = Math.max(c.x + 64, r.right + 41);
    if (right + 26 <= innerWidth) return { x: right, y: c.y };
    return { x: Math.min(c.x - 64, r.left - 41), y: c.y };
  }
  /* the string from where the Pod hovers to el: its direction and its length */
  function stringTo(el, at) {
    const r = el.getBoundingClientRect();
    if (at.y + SHAFT <= r.top + 1) return { dir: 'down', len: r.top - (at.y + SHAFT) };
    if (at.x - ARM >= r.right - 1) return { dir: 'left', len: (at.x - ARM) - r.right };
    return { dir: 'right', len: r.left - (at.x + ARM) };
  }
  TR.on('look', (lk) => {
    if (!painted()) return;
    if (has('square')) lk.radius = 0;
    /* the frame says "press any key to stop", so a key pressed inside the tour stops it too */
    if (has('brackets')) { lk.glide = 'steps'; lk.anyKey = true; }
    /* Pod 042 travels in nine held hops (the first leg of a demonstration a little longer than the next ones),
       hovers over what it acts on and carries in held steps; its press is its chirp, and its arrival is the string */
    if (has('pod')) {
      lk.travel = { n: 9, ease: M.ease.hand, frame: 'steps(1, end)', ms: (dist, leg) => (leg <= 1 ? 440 : 300) };
      lk.drag = M.ease.steps(14); lk.press = 'pod'; lk.arrive = null; lk.hover = hoverFor;
    }
  });

  /* the spotlight's corners, map ticks and scan line ride in the ring's own box; the pointer gets Pod 042 (an HTML
     box about the pointer's point: its string, then its body); the root gets Show Me's control frame */
  TR.on('build', ({ root }) => {
    const box = root.querySelector('.o55t-ringbox');
    if (box && !box.querySelector('.o55t-nring')) {
      box.insertAdjacentHTML('beforeend', '<span class="o55t-nring" aria-hidden="true">'
        + '<i class="o55t-nbk o55t-tl"></i><i class="o55t-nbk o55t-tr"></i><i class="o55t-nbk o55t-bl"></i><i class="o55t-nbk o55t-br"></i>'
        + '<i class="o55t-ntk o55t-t"></i><i class="o55t-ntk o55t-r"></i><i class="o55t-ntk o55t-b"></i><i class="o55t-ntk o55t-l"></i><i class="o55t-nscan"></i></span>');
    }
    const ptr = root.querySelector('.o55t-pointer');
    if (ptr && !ptr.querySelector('.o55t-npod')) {
      ptr.insertAdjacentHTML('beforeend', '<span class="o55t-npod" data-npod="dock" data-dir="down">'
        + '<span class="o55t-npod-str"><i class="o55t-npod-line"></i><i class="o55t-npod-sig"></i><i class="o55t-npod-sig"></i><i class="o55t-npod-sig"></i><i class="o55t-npod-knot"></i></span>'
        + `<span class="o55t-npod-body">${podSvg(EYE)}</span></span>`);
    }
    if (!root.querySelector('.o55t-nframe')) {
      root.insertAdjacentHTML('beforeend', '<div class="o55t-nframe" aria-hidden="true">'
        + '<i class="o55t-nfc o55t-tl"></i><i class="o55t-nfc o55t-tr"></i><i class="o55t-nfc o55t-bl"></i><i class="o55t-nfc o55t-br"></i>'
        + '<span class="o55t-ntag o55t-ntag-l"><i></i><i></i><i></i><span class="o55t-ntag-t"></span></span>'
        + '<span class="o55t-ntag o55t-ntag-r"><span class="o55t-ntag-t"></span></span></div>');
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

  /* Words arrive readable: anything longer than a label types on, left to right, behind a block caret, with its whole
     layout held from the first frame (O55.nierFx.type), so nothing reflows and no scrambled glyph ever prints over
     the next line. Without the typewriter the words simply stand (the end state). Screen readers keep the real words
     throughout (the typewriter holds them as the label). */
  function typeOn(el, o) {
    const fx = FX();
    if (!fx || !el || typeof fx.type !== 'function' || !has('decode') || still()) return null;
    return fx.type(el, o || {});
  }
  /* a new line from the Pod types on (a fresh step's line, or a report that it is ready, also chirps) */
  let spoken = null;
  function speak(arrival) {
    const c = calloutEl(), strip = c && c.querySelector('.o55t-pod'), w = strip && strip.querySelector('.o55t-pod-words');
    const text = w ? w.textContent : '', kind = strip ? strip.getAttribute('data-kind') : '';
    if (!arrival && spoken && spoken.text === text) return;
    const was = spoken; spoken = { text, kind, step: st.step && st.step.id };
    if (!w || !text) return;
    if (arrival || !was || was.text !== text) typeOn(w);
    if (arrival ? !arrival.silent : (kind === 'line' && was && was.kind === 'wait' && was.step === spoken.step)) chirp();
  }
  /* (a step's arrival speaks in 'step', once the callout stands where it goes; the hand-over speaks when it opens) */
  TR.on('render', () => { if (!painted()) spoken = null; else if (!st.entering && !(hand && st.root.classList.contains('o55t-nhand'))) speak(null); });

  /* the title types on too */
  function typeTitle() { const c = calloutEl(); typeOn(c && c.querySelector('#o55t-h')); }
  /* the callout's corners lock on in three steps */
  function lockCallout() {
    const c = calloutEl(); if (!c || !has('brackets') || still() || typeof c.animate !== 'function') return;
    try { c.animate([{ scale: '1.07', opacity: 0 }, { scale: '1.03', opacity: 1, offset: 0.66 }, { scale: '1', opacity: 1 }], { duration: 210, easing: 'steps(3, end)', pseudoElement: '::before' }); } catch (_) {}
  }

  /* ------------------------------------------------------------------ the spotlight */
  /* The corners lock on where the spotlight lands, never while it is still travelling: each lock waits for the
     glide to arrive (TR.afterGlide), so the lock, the scan line and the eye arrive together. */
  let lockedAt = -1e9;
  const lockLanded = () => { if (TR.afterGlide) TR.afterGlide(lockRing); else lockRing(); };
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
  /* (the target changes before the glide toward it starts: look once the placement has run) */
  TR.on('target', (d) => { if (painted() && d.el && TR.running && !st.entering) Promise.resolve().then(lockLanded); });

  /* ------------------------------------------------------------------ a new chapter: the hung card and the bar walk */
  /* The card is lowered on two strings from the window's top edge (O55.nierFx.banner, hang) while the spotlight steps
     on to the new target; the chapter's sting lands with it. Meanwhile the bar keeps showing the chapter that is ending
     (st.barHold); as the card is hauled up, the current chapter's ink block walks along the bar to the new chapter's
     name in five held steps (a move tick each), and then the callout slices open. The question is never covered: the
     card takes the first place clear of the callout and the bar. */
  let chapterSeq = 0, walked = false;
  const depthNow = () => { try { const c = O55.sound.context(); return c && Number.isFinite(c.depth) ? c.depth : undefined; } catch (_) { return undefined; } };
  TR.on('arrive', (d) => {
    const root = st.root;
    back = 0; walked = false;
    if (!painted()) return null;
    /* the callout opens where it stands (a slice), so it does not glide there first */
    if (has('slice') && !still()) root.classList.add('o55t-njump');
    const fx = FX();
    if (d.chapterChanged && d.forward && fx && fx.enabled('banner')) {
      d.hold = true; d.sound = null; /* the card's sting is this chapter's sound */
      root.classList.add('o55t-nheld');
      const ch = d.step.chapter, n = TR.CHAPTERS.indexOf(ch) + 1, my = ++chapterSeq;
      st.barHold = d.prev || null;
      const sting = () => sound('quest', { chapter: 'tour-' + ch, depth: depthNow() });
      /* a card, not a band: narrowed inside the window (its strings at 22 % and 78 % of its width) */
      const inset = innerWidth >= 1100 ? 0.18 : innerWidth >= 800 ? 0.08 : 0;
      const shown = fx.banner({ kicker: T('banner.kicker', { n }), title: O55.t('tour.chapters.' + ch), sub: T('banner.' + ch), within: root, hang: true, inset, sound: false, ms: 1660, onLand: sting });
      const letGo = () => { if (my === chapterSeq && st.barHold === d.prev) st.barHold = null; };
      if (still()) return Promise.race([shown, M.delay(900)]).then(letGo, letGo);
      return M.delay(1400).then(() => (my === chapterSeq && TR.running ? walkBar() : null)).then(letGo, letGo);
    }
    return null;
  });
  /* the bar's current chapter block walks to the new one: where the old name stood, then the bar is drawn for the new
     step at once (no name transitions), then the ink block steps across to where the new name stands; the new name
     shows as the current one (inverted) when the block arrives */
  const curName = (bar) => { const n = bar && bar.querySelector('.o55t-pip.o55t-cur .o55t-pipname'); const r = n && n.getBoundingClientRect(); return r && r.width > 2 ? r : null; };
  function walkBar() {
    const bar = st.root && st.root.querySelector('.o55t-bar');
    const ok = bar && has('headers') && has('slice') && !still() && innerWidth > 760;
    const from = ok ? curName(bar) : null;
    if (bar && from) bar.setAttribute('data-nwalk', '');
    st.barHold = null; TR.renderBar();
    const to = from ? curName(bar) : null;
    if (!from || !to) { if (bar) bar.removeAttribute('data-nwalk'); return null; }
    walked = true;
    const br = bar.getBoundingClientRect(), blk = document.createElement('i');
    blk.className = 'o55t-nwalk'; blk.setAttribute('aria-hidden', 'true');
    blk.style.cssText = `left:${(from.left - br.left).toFixed(1)}px;top:${(from.top - br.top).toFixed(1)}px;width:${from.width.toFixed(1)}px;height:${from.height.toFixed(1)}px`;
    bar.appendChild(blk);
    const a = blk.animate([{ transform: 'translateX(0px) scaleX(1)' }, { transform: `translateX(${(to.left - from.left).toFixed(1)}px) scaleX(${(to.width / from.width).toFixed(4)})` }],
      { duration: 300, easing: 'steps(5, end)', fill: 'forwards' });
    for (let k = 1; k <= 5; k++) M.after(60 * k - 4, () => sound('move'));
    return a.finished.catch(() => null).then(() => { blk.remove(); bar.removeAttribute('data-nwalk'); });
  }

  /* ------------------------------------------------------------------ steps arrive */
  TR.on('step', (d) => {
    const root = st.root;
    root.classList.remove('o55t-nheld');
    if (!painted()) { root.classList.remove('o55t-njump'); return; }
    /* the hand-over's first step stands hidden: the window's line opens it (opened, below) */
    const held = d.first && hand && root.classList.contains('o55t-nhand');
    const fx = FX(), c = calloutEl();
    if (!held) {
      if (fx && c) {
        if (has('slice')) fx.slice(c, { ms: 260 });
        typeTitle();
        if (d.first && has('slice')) fx.slice(root.querySelector('.o55t-bar'), { ms: 300 });
      }
      if (d.first) M.after(220, podArrives);
      lockCallout(); lockLanded();
      speak(d);
    }
    /* the new chapter's pip flickers on (a small element) when no block walked there: each keyframe holds its value
       (easing per keyframe; one step-end over the whole effect would hold the first value and then cut) */
    if (d.chapterChanged && !walked && !still()) {
      const pip = root.querySelector('.o55t-pip.o55t-cur');
      if (pip) pip.animate(flick([0, 1, 0.3, 1, 1]), { duration: 420 });
    }
    walked = false;
    M.release(() => root.classList.remove('o55t-njump'));
  });
  const flick = (ops) => ops.map((opacity, i) => ({ opacity, offset: i / (ops.length - 1), easing: 'step-end' }));

  /* done: the kicker says Complete and flickers once, the spotlight's corners lock again */
  TR.on('complete', () => {
    if (!painted() || still()) return;
    const k = st.root.querySelector('.o55t-callout .o55t-kicker');
    if (k && has('headers')) k.animate(flick([1, 0.2, 1, 0.2, 1]), { duration: 360 });
    lockedAt = -1e9; lockRing();
  });

  /* a missing target: Alert, and the callout tears */
  TR.on('missing', (d) => {
    if (!d.on || !painted()) return;
    const fx = FX(), c = calloutEl();
    if (fx && c) { fx.alert(c); typeTitle(); }
  });

  /* ------------------------------------------------------------------ Show Me: the control frame */
  /* The moment the app acts for the person is marked: four ink corner marks step in at the window's corners (2 px,
     never over a target, never taking a click), "Pod 042 · In control" (with the Pod or its voice) and "Press any key
     to stop" (it types on) at the top, and the scrim darkens one step. Handing back, the corners step out, the left
     tag reads "You have control" and blinks twice, then goes. The tags stand down below 900 px and wherever they
     would sit over what is being pressed. */
  let frameT = null, frameAnims = [];
  const frameEl = () => st.root && st.root.querySelector('.o55t-nframe');
  const cornerDir = (c) => [c.classList.contains('o55t-tl') || c.classList.contains('o55t-bl') ? -1 : 1, c.classList.contains('o55t-tl') || c.classList.contains('o55t-tr') ? -1 : 1];
  function frameStop() { if (frameT) { frameT.cancel(); frameT = null; } frameAnims.forEach((a) => { try { a.cancel(); } catch (_) {} }); frameAnims = []; }
  function frameOff() { frameStop(); if (st.root) st.root.removeAttribute('data-nctl'); }
  function frameOn() {
    const f = frameEl(); if (!f || !has('brackets')) return;
    frameStop();
    f.toggleAttribute('data-voice', has('pod') || has('voice'));
    const L = f.querySelector('.o55t-ntag-l .o55t-ntag-t'), R = f.querySelector('.o55t-ntag-r .o55t-ntag-t');
    L.textContent = T('frame.inControl'); R.textContent = T('frame.stop');
    st.root.setAttribute('data-nctl', 'on');
    tagCover(st.target);
    if (!still() && has('slice')) {
      f.querySelectorAll('.o55t-nfc').forEach((c) => {
        const [sx, sy] = cornerDir(c);
        frameAnims.push(c.animate([{ translate: `${sx * 12}px ${sy * 12}px`, opacity: 0 }, { translate: `${sx * 5}px ${sy * 5}px`, opacity: 1, offset: 0.66 }, { translate: '0px 0px', opacity: 1 }],
          { duration: 200, easing: 'steps(3, end)' }));
      });
    }
    typeOn(R);
  }
  function frameEnd() {
    const f = frameEl(); if (!f || !st.root || st.root.getAttribute('data-nctl') !== 'on') return false;
    frameStop();
    st.root.setAttribute('data-nctl', 'end');
    const tag = f.querySelector('.o55t-ntag-l');
    tag.querySelector('.o55t-ntag-t').textContent = T('frame.handBack');
    tag.removeAttribute('data-cover');
    if (!still()) {
      if (has('slice')) {
        f.querySelectorAll('.o55t-nfc').forEach((c) => {
          const [sx, sy] = cornerDir(c);
          frameAnims.push(c.animate([{ translate: '0px 0px', opacity: 1 }, { translate: `${sx * 8}px ${sy * 8}px`, opacity: 0 }], { duration: 120, easing: 'steps(2, end)', fill: 'forwards' }));
        });
      }
      /* it blinks twice (a small element) */
      frameAnims.push(tag.animate(flick([1, 0, 1, 0, 1]), { duration: 480 }));
    }
    frameT = M.after(still() ? 1200 : 600, () => { frameT = null; frameOff(); });
    return true;
  }
  /* a tag that would sit over what is being shown or pressed stands down */
  function tagCover(...els) {
    const f = frameEl(); if (!f) return;
    const rs = els.filter((e) => e && e.getBoundingClientRect).map((e) => e.getBoundingClientRect()).filter((r) => r.width || r.height);
    f.querySelectorAll('.o55t-ntag').forEach((tag) => {
      const t = tag.getBoundingClientRect();
      const over = t.width > 0 && rs.some((r) => !(r.right < t.left - 6 || r.left > t.right + 6 || r.bottom < t.top - 6 || r.top > t.bottom + 6));
      tag.toggleAttribute('data-cover', over);
    });
  }

  /* ------------------------------------------------------------------ Show Me: Pod takes the strings */
  /* T0: the frame, and the docked Pod's anticipation (its eye lights, it rises 4 px in two steps and leans toward the
     target); T160 it is out at full size, and it launches in nine held hops, each leaving a trail square, to hover
     over what it will press. There it lowers a string with a knot onto the target's edge in three steps (string), the
     corners lock on at the touch, and the press is its tug: it rises, the knot pulls up, the corners dip a step and
     three signals run down the string (pod). The string goes back up in two steps (a field it types into keeps it
     until the last letter); the next target is the same on a shorter leg. At the end, or at any key or press, it hands
     back (interrupt) and flies home. */
  let anticip = null, homeFly = null, trails = [];
  const trailsOff = () => { trails.forEach((t) => t.cancel()); trails = []; };
  const anticipOff = () => { if (anticip) { anticip.cancel(); anticip = null; } };
  TR.on('showMe', (d) => {
    if (!painted()) return null;
    TR.refresh();
    frameOn();
    if (!has('pod')) return null;
    stringOff();
    const fly = homeFly; homeFly = null;
    if (fly) { fly.cancelled = true; st.root.classList.remove('o55t-npodout'); }
    homeTok++;
    eye(true);
    /* taking over from a Pod still flying home: it sets off from where it is */
    if (d.takeover || fly) { podState('out'); return null; }
    /* it leaves from its dock, in the same frame as the dock empties (no blink, no fade: one Pod) */
    const at = dock(); P.pos = null; if (at) P.show(at.x, at.y);
    if (!at || still()) { podState('out'); return null; }
    podState('dock');
    const body = st.root.querySelector('.o55t-npod-body'), t = st.target && st.target.isConnected ? TR.center(st.target) : null;
    const lean = t ? (t.x < at.x - 4 ? -7 : t.x > at.x + 4 ? 7 : 0) : 0;
    anticipOff();
    anticip = body && body.animate([{ translate: '0px 0px', rotate: '0deg' }, { translate: '0px -2px', rotate: `${lean / 2}deg` }, { translate: '0px -4px', rotate: `${lean}deg` }],
      { duration: 160, easing: 'steps(2, end)', fill: 'forwards' });
    return M.delay(160);
  });
  /* each held hop leaves a trail square where it was. A launch from the dock holds its lean until the first hop,
     and the Pod grows to full size as it leaves (two held steps) */
  TR.on('travel', (d) => {
    if (!has('pod') || still()) return;
    trailsOff();
    const n = d.points && d.points.length > 1 ? d.points.length - 1 : 1;
    if (anticip) { const a = anticip; trails.push(M.after(d.ms / n, () => { a.cancel(); if (anticip === a) anticip = null; podState('out'); })); }
    else podState('out');
    const fx = FX(); if (!fx || typeof fx.trail !== 'function' || !d.points || d.points.length < 2) return;
    for (let k = 1; k <= n; k++) { const [x, y] = d.points[k - 1]; trails.push(M.after(d.ms * k / n, () => { if (P.el().classList.contains('o55t-on')) fx.trail(x, y); })); }
  });

  /* the string: set to its direction and length (px, a CSS number), lowered in three held steps */
  let strAnims = [], strT = null;
  const strEls = () => { const n = npod(); return n ? { n, line: n.querySelector('.o55t-npod-line'), knot: n.querySelector('.o55t-npod-knot') } : null; };
  function stringOff() {
    strAnims.forEach((a) => { try { a.cancel(); } catch (_) {} }); strAnims = [];
    if (strT) { strT.cancel(); strT = null; }
    const n = npod(); if (n) n.removeAttribute('data-str');
  }
  /* the knot's offset back toward the Pod when the string is shorter by `by` px (for the lowering and the lift) */
  const knotBack = (dir, by) => (dir === 'down' ? `0px ${-by}px` : dir === 'left' ? `${by}px 0px` : `${-by}px 0px`);
  const lineScale = (dir, f) => (dir === 'down' ? `1 ${f}` : `${f} 1`);
  function stringShow(dir, len, grow) {
    const e = strEls(); if (!e) return;
    stringOff();
    e.n.setAttribute('data-dir', dir); e.n.style.setProperty('--len', String(len)); e.n.setAttribute('data-str', '');
    if (!grow) return;
    strAnims.push(e.line.animate([{ scale: lineScale(dir, 0) }, { scale: lineScale(dir, 1) }], { duration: 120, easing: 'steps(3, end)' }));
    strAnims.push(e.knot.animate([{ translate: knotBack(dir, len) }, { translate: '0px 0px' }], { duration: 120, easing: 'steps(3, end)' }));
  }
  function stringUp() {
    const e = strEls(); if (!e || !e.n.hasAttribute('data-str')) return;
    if (still()) return; /* (Reduced Motion: it goes after its 400 ms, below) */
    const dir = e.n.getAttribute('data-dir') || 'down', len = +e.n.style.getPropertyValue('--len') || 32;
    strAnims.forEach((a) => { try { a.cancel(); } catch (_) {} }); strAnims = [];
    const a = e.line.animate([{ scale: lineScale(dir, 1) }, { scale: lineScale(dir, 0) }], { duration: 100, easing: 'steps(2, end)', fill: 'forwards' });
    strAnims.push(a, e.knot.animate([{ translate: '0px 0px' }, { translate: knotBack(dir, len) }], { duration: 100, easing: 'steps(2, end)', fill: 'forwards' }));
    a.finished.then(() => { if (strAnims.includes(a)) stringOff(); }, () => {});
  }
  /* the corners that mark what is pressed: the spotlight's (its target) or a lock of their own until the press is
     done; they lock on at the string's touch, not before (the cue waits for it while the Pod demonstrates) */
  let cued = null;
  function lockOn(el) {
    const fx = FX(); if (!fx || !has('brackets') || !el) return null;
    const t = st.target;
    if (t && (t === el || t.contains(el) || el.contains(t))) { lockedAt = -1e9; lockRing(); return st.root.querySelector('.o55t-nring'); }
    if (cued && cued !== el) fx.brackets(cued, false);
    cued = el; const node = fx.brackets(el, true);
    M.after(1400, () => { if (cued === el) { fx.brackets(el, false); cued = null; } });
    return node;
  }
  /* the corners dip one step with the tug */
  function dip(node) { if (node && typeof node.animate === 'function' && !still()) node.animate([{ translate: '0px 2px' }, { translate: '0px 2px' }], { duration: 120 }); }
  TR.on('cue', (d) => { if (has('pod') && st.show) return; lockOn(d.el); });
  TR.on('press', (d) => {
    if (!has('pod')) return null;
    podAt = M.now(); /* its press is its chirp: the next line keeps quiet for a moment */
    if (!d.el || !P.pos || !st.show) return null;
    const g = stringTo(d.el, P.pos), len = Math.max(8, Math.round(g.len)), claim = d.kind !== 'drag';
    tagCover(d.el, st.target);
    if (still()) {
      /* Reduced Motion: the string and its knot stand on the target for 400 ms, and nothing waits for them */
      stringShow(g.dir, len, false); lockOn(d.el);
      strT = M.after(400, () => { strT = null; stringOff(); });
      if (claim) { d.sound = null; sound('pod'); }
      return null;
    }
    stringShow(g.dir, len, true);
    sound('string', { pan: Math.max(-0.7, Math.min(0.7, (d.x / Math.max(1, innerWidth) - 0.5) * 1.4)) });
    const me = st.show;
    return M.delay(120).then(() => {
      if (st.show !== me) return null;
      const lock = lockOn(d.el);
      return M.delay(60).then(() => {
        if (st.show !== me) return;
        /* the tug (the core's press class: 41-tour-nier.css) and its chirp land on the same frame */
        if (claim) { d.sound = null; sound('pod'); }
        dip(lock);
      });
    });
  });
  TR.on('released', () => { if (has('pod')) stringUp(); });
  TR.on('pointerFrom', (d) => { if (has('pod')) { const at = dock(); if (at) { d.at = at; podState('dock'); } } });

  /* at the start, the app's own Pod (the corner one, which stands down while the tour runs) flies to its dock in the
     first callout: one Pod, never two */
  function podArrives() {
    if (!has('pod') || still() || st.show) return;
    const home = document.getElementById('o55np-pod'), at = dock(); if (!home || !at) return;
    const r = home.getBoundingClientRect(); if (!r.width) return;
    const root = st.root;
    root.classList.add('o55t-npodout');
    P.pos = null; P.show(r.left + r.width / 2, r.top + r.height / 2); eye(false);
    const done = () => { root.classList.remove('o55t-npodout'); if (!st.show) { P.hide(); P.pos = null; } };
    podState('out');
    M.delay(60).then(() => (st.show ? null : homeTo(at, 460))).then(done, done);
  }
  /* The hand-back after the demonstration (the frame, and the 'interrupt' it sounds), then home. When what it pressed
     has finished the step and the next one comes in a moment (no "after" line to read here), the old callout is about
     to go: the Pod waits over what it pressed, and flies straight into the next callout's dock once that callout
     stands (its dock stays empty until it lands). Otherwise it flies home to this callout's dock. */
  TR.on('showMeEnd', (d) => {
    if (!painted()) return null;
    if (frameEnd()) sound('interrupt');
    if (!has('pod') || still()) return null;
    stringOff(); anticipOff(); eye(false);
    const me = st.show, s = d.step;
    if (st.advancing && s && !s.after && !s.stay) return nextDock().then((at) => (at && st.show === me ? homeTo(at, 380) : null));
    const at = dock(); if (!at) return null;
    return homeTo(at, 300);
  });
  /* the dock of the next step's callout, once it stands (or this one's, if no step comes within 2 s) */
  function nextDock() {
    return new Promise((res) => {
      let off = null;
      const t = M.after(2000, () => { if (off) off(); res(dock()); });
      off = TR.on('step', () => { off(); t.cancel(); res(dock()); });
    });
  }
  TR.on('showMeDone', () => { trailsOff(); anticipOff(); if (painted() && TR.running) TR.refresh(); });
  /* a key or a press took control back: the frame hands back (the core sounded it), the string lets go, and the Pod
     flies home from where it was with its dock empty until it lands (a Show Me pressed meanwhile takes it over) */
  TR.on('interrupt', (d) => {
    if (!painted() || !TR.running) return;
    back = M.now(); TR.refresh(); M.after(6100, () => { if (back && TR.running) { back = 0; TR.refresh(); } });
    frameEnd(); stringOff(); trailsOff(); anticipOff(); eye(false);
    if (!has('pod') || still() || st.rewinding || st.ending || st.paused || !d || !d.at) return;
    const at = dock(); if (!at) return;
    const fly = homeFly = { cancelled: false };
    st.root.classList.add('o55t-npodout');
    P.pos = null; P.show(d.at.x, d.at.y);
    homeTo(at, 300).then(() => {
      if (fly.cancelled || homeFly !== fly) return;
      homeFly = null; st.root.classList.remove('o55t-npodout');
      if (!st.show) { P.hide(); P.pos = null; }
    });
  });
  TR.on('pause', () => { if (painted() && TR.running) TR.refresh(); });

  /* ------------------------------------------------------------------ the bar */
  TR.on('bar', (d) => {
    if (!has('headers')) return;
    d.pip[d.chapter] = `<span class="o55t-readout" aria-hidden="true">${two(d.si + 1)}/${two(d.total)}</span>`;
    /* on a narrow window the band keeps a short name, so its squares never stand alone */
    d.brand = `<b class="o55t-brandshort" aria-hidden="true">${U.esc(T('barShort'))}</b>`;
  });
  /* the bar moving between the bottom and the top slices open where it lands (it never jumps across the window) */
  TR.on('barMove', () => {
    const fx = FX(), bar = st.root && st.root.querySelector('.o55t-bar');
    if (fx && bar && TR.running && painted()) fx.slice(bar, { ms: 200 });
  });

  /* ------------------------------------------------------------------ open */
  /* A page opened straight into the tour (?o55=tour) paints the app, its bright preview included, about 140 ms before
     the tour starts (the boot waits that long after the page is parsed). Under NieR with the band, the NieR ground
     covers the page from the moment it is parsed until the tour's own ground and band take over, so the opening is
     ground, band, then the app, and never a flash of the app before it. */
  let bootCover = null;
  const uncover = () => { if (bootCover) { bootCover.remove(); bootCover = null; } };
  function coverBoot() {
    let sw = ''; try { sw = new URLSearchParams(location.search).get('o55') || ''; } catch (_) {}
    const fx = FX();
    if (sw !== 'tour' || !painted() || !fx || !fx.enabled('band') || still() || !document.body) return;
    bootCover = document.createElement('div'); bootCover.className = 'o55t-bootcover'; bootCover.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bootCover);
    M.after(2600, uncover); /* a tour that does not start (a recovery to settle first) never leaves the page covered */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', coverBoot, { once: true }); else coverBoot();

  /* The hand-over from setup, "one line carries you" (the onboarding window's half: 66-nier-window.js, contract in
     O55.tour.start's handoff): the window folds to a 2 px ink line and its resident Pod lifts off. Here there is no
     band: the tour's scrim stands at once in the window's own tone (so the app is never seen lit between the two) and
     takes over from the window's scrim in the same frame; the first callout and the bar are built and placed, unseen.
     When the line comes (handoff.line), it travels to the callout's top edge and takes its width (a soft pointer), the
     callout slices open from it (callout), its kicker and title type on, the scrim steps to its usual dim and the bar
     slices in just after. Meanwhile the same Pod (handoff.pod) flies in nine held hops, shrinking to the dock's size,
     and docks: the travelling Pod goes and the docked one shows in one frame, with its chirp. No line: the callout
     slices open as usual; no Pod: the corner Pod flies in as usual once the callout stands. */
  let hand = null;
  TR.on('start', (d) => {
    const fx = FX(), root = st.root;
    finaleOff();
    hand = null;
    if (d.handoff && painted() && fx) {
      hand = { h: d.handoff, at: Number.isFinite(d.handoff.at) ? d.handoff.at : M.now() };
      d.noMorph = true; d.sound = null;
      uncover();
      root.classList.remove('o55t-opening');
      root.classList.add('o55t-nhand', 'o55t-nhandbar');
      try { if (typeof d.handoff.takeScrim === 'function') d.handoff.takeScrim(); } catch (_) {}
      return null;
    }
    if (!painted() || !fx || !fx.enabled('band') || still()) { uncover(); return null; }
    d.noMorph = true; /* the band is the opening from the onboarding window */
    root.classList.add('o55t-nboot'); uncover();
    const done = () => root.classList.remove('o55t-nboot');
    return fx.band(T(d.resume ? 'band.resume' : 'band.start'), 1500, { kicker: T('band.kicker'), within: root }).then(done, done);
  });
  TR.on('opened', (d) => {
    const hd = hand;
    if (!hd || !d || d.handoff !== hd.h) return;
    const opened = handLine(hd);
    handPod(hd, opened);
  });
  const handLive = (hd) => hand === hd && TR.running && !!st.root;
  async function handLine(hd) {
    const fx = FX(), c = calloutEl();
    let line = null;
    try { line = await Promise.race([Promise.resolve(hd.h.line), M.delay(2600).then(() => null)]); } catch (_) { line = null; }
    if (!handLive(hd) || !fx || !c) { if (line && fx) fx.lineDrop(line); if (handLive(hd)) handOpen(null); return false; }
    if (line && line.isConnected && !still() && has('slice')) {
      sound('pointer', { intensity: 0.35 });
      await fx.lineTo(line, c, { ms: 280 });
      if (!handLive(hd)) { fx.lineDrop(line); return false; }
    } else if (line) { fx.lineDrop(line); line = null; }
    handOpen(line);
    return true;
  }
  /* the callout opens from the line (or as usual), with its arrival sound, and takes focus for screen readers */
  function handOpen(line) {
    const fx = FX(), root = st.root, c = calloutEl();
    root.classList.remove('o55t-nhand');
    if (fx && c && has('slice') && !still()) fx.slice(c, line ? { from: line, ms: 260 } : { ms: 260 });
    else if (line && fx) fx.lineDrop(line);
    sound('callout', { step: 0 });
    if (c) typeOn(c.querySelector('.o55t-kicker'));
    typeTitle(); speak({ silent: true });
    lockCallout(); lockLanded();
    const h = c && c.querySelector('#o55t-h'); if (h && !st.show) h.focus({ preventScroll: true });
    M.after(still() ? 0 : 90, () => {
      root.classList.remove('o55t-nhandbar');
      const bar = root.querySelector('.o55t-bar');
      if (fx && bar && has('slice') && !still()) fx.slice(bar, { ms: 300 });
    });
  }
  async function handPod(hd, opened) {
    const root = st.root;
    if (!has('pod')) return;
    root.classList.add('o55t-npodout'); /* the dock stays empty until the same Pod lands in it */
    let pod = null;
    try { pod = await Promise.race([Promise.resolve(hd.h.pod), M.delay(1600).then(() => null)]); } catch (_) { pod = null; }
    const fx = FX(), drop = () => { if (pod && pod.isConnected) pod.remove(); };
    if (!handLive(hd)) { drop(); root.classList.remove('o55t-npodout'); return; }
    if (!pod || !pod.isConnected || !fx || still()) {
      drop(); root.classList.remove('o55t-npodout');
      /* no Pod came over: the app's corner Pod flies in once the callout stands; under Reduced Motion it is simply
         docked when the callout opens */
      if (!pod) opened.then(() => { if (handLive(hd)) M.after(220, podArrives); });
      else opened.then(() => { if (handLive(hd)) chirp(); });
      return;
    }
    const wait = hd.at + 400 - M.now(); if (wait > 0) await M.delay(wait);
    const unit = root.querySelector('.o55t-callout .o55t-pod-unit');
    if (!handLive(hd) || !unit) { drop(); root.classList.remove('o55t-npodout'); return; }
    pod.animate([{ scale: '1' }, { scale: '.75' }], { duration: 900, easing: 'steps(3, end)', fill: 'forwards' });
    await fx.hops(pod, unit, { n: 9, ms: 900 });
    /* it lands: the travelling Pod goes and the docked one shows in the same frame, with its voice */
    drop(); root.classList.remove('o55t-npodout');
    if (handLive(hd)) chirp();
  }

  /* ------------------------------------------------------------------ the finish: "Debrief, then home" */
  /* T0 (Restore or Keep): the callout folds to its line at once (3 held steps), the rest of the tour steps back. T120:
     the band, while the layout goes back beneath it (reboot). The band folded (about T1020): the line opens into a
     results card where the callout stood (rest, then the finish chord), its rows type one by one, each stamped with
     its count (phase). T2200: the Pod leaves the card's dock and flies home to the app's corner in nine held hops
     with its goodbye (pod, the low one); it lands, and the corner Pod is back in the same frame and dips once. T2900:
     the card folds to a line, the line drops onto the landing note on the Planning Wizard, and the note slices open
     from it. The page's own Tour complete banner stays away while the card shows (html[data-o55-tour-results]). The
     card is the page's (body), so the tour may close beneath it: the core moves on once the band has typed. */
  let fin = null;
  const RESULTS = 'data-o55-tour-results', AWAY = 'data-o55t-away';
  const cornerPod = () => document.getElementById('o55np-pod');
  function finaleOff() {
    const f = fin; fin = null;
    if (!f) return;
    f.timers.forEach((t) => t.cancel());
    if (f.card) f.card.remove();
    if (f.fly) f.fly.remove();
    const fx = FX(); if (f.line && fx) fx.lineDrop(f.line);
    html.removeAttribute(RESULTS);
    const cp = cornerPod(); if (cp) cp.removeAttribute(AWAY);
    if (st.root) st.root.classList.remove('o55t-nfin');
  }
  const later = (f, ms, fn) => { const t = M.after(Math.max(0, ms), () => { if (fin === f) fn(); }); f.timers.push(t); return t; };
  function stats(keep) {
    const acts = TR.defs.filter((x) => x.kind === 'action'), done = acts.filter((x) => st.sess.done.includes(x.id)).length;
    let secs = 0; try { secs = Math.max(0, Math.round((Date.now() - Date.parse(st.sess.started)) / 1000)); } catch (_) {}
    const rows = [['objectives', `${done} / ${acts.length}`]];
    if (has('pod')) rows.push(['shown', String(st.sess.shown || 0)]);
    rows.push(['layout', T(keep ? 'results.layoutKept' : 'results.layoutBack')], ['time', `${two(Math.min(99, Math.floor(secs / 60)))}:${two(secs % 60)}`]);
    return rows;
  }
  function finale(d, fx) {
    finaleOff();
    const root = st.root, c = calloutEl(), quick = still();
    const f = fin = { t0: M.now(), keep: !!d.keep, timers: [], line: null, card: null, fly: null, out: false, home: false };
    d.sound = null; /* the finish chord plays on the results card */
    f.rows = stats(f.keep);
    f.at = c ? c.getBoundingClientRect() : null;
    html.setAttribute(RESULTS, '');
    const cp = cornerPod(); if (cp) cp.setAttribute(AWAY, '');
    cursorOff();
    /* the callout folds to its line at once (no ghost); everything else of the tour steps back in two held steps */
    const folds = !!(c && f.at && f.at.width && has('slice') && !quick);
    root.classList.add('o55t-nend');
    if (folds) root.classList.add('o55t-nfin');
    const lineP = folds ? fx.fold(c, { ms: 120 }) : Promise.resolve(null);
    lineP.then((l) => { if (fin === f) f.line = l; else if (l) fx.lineDrop(l); });
    const banded = fx.enabled('band') && !quick;
    const bandP = banded ? M.delay(120).then(() => (fin === f ? fx.band(T(f.keep ? 'band.keep' : 'band.restore'), 900, { kicker: T('band.kicker'), within: root }) : null)) : Promise.resolve(null);
    Promise.all([bandP, lineP]).then(() => { if (fin === f) showCard(f); });
    /* the tour may close once the band has typed: the layout and the Planning Wizard settle beneath the band */
    return M.delay(banded ? 640 : 60);
  }
  function showCard(f) {
    const fx = FX(), quick = still(), pod = has('pod');
    const card = f.card = document.createElement('section');
    card.id = 'o55t-results'; card.className = 'o55t-results'; card.setAttribute('role', 'status');
    card.setAttribute('aria-label', T('results.kicker'));
    card.innerHTML = `<p class="o55t-res-kicker"><span class="o55t-res-kt">${U.esc(T('results.kicker'))}</span></p>`
      + `<div class="o55t-res-body">${pod ? `<span class="o55t-res-pod" aria-hidden="true">${podSvg()}</span>` : ''}`
      + `<dl class="o55t-res-rows">${f.rows.map(([k, v], i) => `<div class="o55t-res-row" data-i="${i}"><dt>${U.esc(T('results.' + k))}</dt><i class="o55t-res-lead" aria-hidden="true"></i><dd>${U.esc(v)}</dd></div>`).join('')}</dl></div>`;
    if (!quick) card.setAttribute('data-wait', '');
    document.body.appendChild(card);
    /* where the callout stood, about its middle, where the line it folded to waits (kept inside the window) */
    const w = card.offsetWidth, h = card.offsetHeight, at = f.at;
    const left = at && at.width ? at.left + (at.width - w) / 2 : (innerWidth - w) / 2, top = at && at.width ? at.top + (at.height - h) / 2 : (innerHeight - h) / 2 - 40;
    card.style.left = Math.round(Math.max(12, Math.min(innerWidth - w - 12, left))) + 'px';
    card.style.top = Math.round(Math.max(56, Math.min(innerHeight - h - 16, top))) + 'px';
    const line = f.line; f.line = null;
    if (fx && has('slice') && !quick) fx.slice(card, line ? { from: line, ms: 260 } : { ms: 260 });
    else if (line && fx) fx.lineDrop(line);
    /* the resolution: 150 ms of silence, then the finish chord */
    try { if (O55.sound.rest) O55.sound.rest(150); } catch (_) {}
    later(f, 150, () => sound('finish'));
    if (quick) { card.querySelectorAll('.o55t-res-row').forEach((r) => r.setAttribute('data-stamp', '')); }
    else {
      typeOn(card.querySelector('.o55t-res-kt'));
      card.querySelectorAll('.o55t-res-row').forEach((row, i) => {
        later(f, 120 + 120 * i, () => { row.setAttribute('data-on', ''); typeOn(row.querySelector('dt'), { cap: 120 }); });
        later(f, 240 + 120 * i, () => { row.setAttribute('data-stamp', ''); sound('phase', { step: i }); });
      });
    }
    U.announce([T('results.kicker')].concat(f.rows.map(([k, v]) => `${T('results.' + k)}: ${v}`)).join('. '), document.body);
    /* T2200: the Pod flies home */
    later(f, f.t0 + 2200 - M.now(), () => flyHome(f));
  }
  function flyHome(f) {
    const cp = cornerPod(), unit = f.card && f.card.querySelector('.o55t-res-pod'), fx = FX();
    const home = () => {
      f.home = true;
      if (cp) {
        cp.removeAttribute(AWAY);
        const b = cp.querySelector('.o55np-pod-body');
        if (b && typeof b.animate === 'function' && !still()) b.animate([{ translate: '0px 3px' }, { translate: '0px 3px' }], { duration: 160 });
      }
    };
    if (!unit) { home(); return; }
    const ur = unit.getBoundingClientRect(), cr = cp ? cp.getBoundingClientRect() : null;
    if (!cp || !cr || !cr.width || !ur.width) { home(); return; }
    sound('pod', { variant: 4 });
    if (!fx || still() || typeof fx.hops !== 'function') { unit.style.visibility = 'hidden'; home(); return; }
    const fly = f.fly = document.createElement('div');
    fly.className = 'o55t-nfly'; fly.setAttribute('aria-hidden', 'true'); fly.innerHTML = podSvg();
    fly.style.left = Math.round(ur.left + ur.width / 2 - 20) + 'px'; fly.style.top = Math.round(ur.top + ur.height / 2 - 26) + 'px';
    document.body.appendChild(fly);
    /* the same Pod lifts off: the dock empties in the frame the flyer shows */
    unit.style.visibility = 'hidden';
    fly.animate([{ scale: '.75' }, { scale: '1' }], { duration: 500, easing: 'steps(3, end)', fill: 'forwards' });
    fx.hops(fly, cp, { n: 9, ms: 500 }).then(() => { if (f.fly === fly) { fly.remove(); f.fly = null; } home(); });
  }
  /* the card folds to its line, which drops onto the landing note's top edge: the note opens from it */
  async function finaleOut(f, note) {
    if (f.out) return null;
    f.out = true;
    if (!f.home) { f.timers.forEach((t) => t.cancel()); if (f.fly) { f.fly.remove(); f.fly = null; } const cp = cornerPod(); if (cp) cp.removeAttribute(AWAY); f.home = true; }
    const fx = FX(), card = f.card;
    let line = null;
    if (card && fx && has('slice') && !still()) line = await fx.fold(card, { ms: 200 });
    if (card) card.remove();
    f.card = null;
    if (line && fx) {
      if (note && note.isConnected) await fx.lineTo(line, note, { edge: 'top', ms: 280 });
      else { fx.lineDrop(line); line = null; }
    }
    if (fin === f) { fin = null; html.removeAttribute(RESULTS); }
    return line;
  }

  /* ------------------------------------------------------------------ close */
  /* The close: the callout, the bar, the spotlight and the scrim step back at once (two held steps; they stay back
     until the root has gone, so nothing pops back as it fades), the band plays while the layout goes back beneath it,
     and the notices the restore raises in the app stay quiet (the band already says what is happening). A finish
     ("done") with quest cards is the debrief above. */
  TR.on('ending', (d) => {
    if (d.silent || !painted()) return null;
    d.hush = true;
    frameOff(); stringOff();
    const fx = FX();
    if (d.status === 'done' && fx && has('quests')) return finale(d, fx);
    if (!fx || !fx.enabled('band') || still()) return null;
    const key = d.status === 'done' ? (d.keep ? 'band.keep' : 'band.restore') : 'band.skip';
    st.root.classList.add('o55t-nend');
    cursorOff();
    /* short: the layout goes back beneath it, and the prompt on the Planning Wizard should not wait */
    return fx.band(T(key), 900, { kicker: T('band.kicker'), within: st.root });
  });
  TR.on('end', (d) => {
    /* a layout that could not go back keeps the tour: its callout and bar come back, and there is no debrief */
    if (d.status === 'restore-pending') { finaleOff(); const fx = FX(), c = calloutEl(); if (fx && c && fx.unfold) fx.unfold(c); }
    if (st.root) st.root.classList.remove('o55t-nheld', 'o55t-njump', 'o55t-nboot', 'o55t-npodout', 'o55t-nhand', 'o55t-nhandbar', ...(d.status === 'restore-pending' ? ['o55t-nend', 'o55t-nfin'] : []));
    st.barHold = null; hand = null; homeFly = null;
    spoken = null; back = 0; focusOff(); cursorOff(); frameOff(); stringOff(); trailsOff(); anticipOff();
    const fx = FX(); if (fx && cued) { fx.brackets(cued, false); cued = null; }
  });
  TR.on('closed', () => { if (st.root) st.root.classList.remove('o55t-nend', 'o55t-nfin'); });

  /* The landing note comes in Pod's voice. After the debrief it waits for the card (about T2900) and opens from the
     card's line. Otherwise it comes at once, and the page's own Tour complete banner (kit.d/20-nier-world.js
     #o55nw-quest, about 0.7 s after the tour finishes, for about 3 s; its place from PM_NIER_WORLD.bannerRect(), else
     its constants: 23 % down the window, about 92 px tall) would sit on it where it usually goes, under the Wizard's
     heading: there it moves down past the banner's reach instead, so the two never overlap and nothing has to wait.
     It slices in and its words type on. */
  TR.on('landing', (d) => {
    if (has('voice')) d.lead = O55.t('nierFx.pod.leads.proposal');
    const f = fin; if (!f) return null;
    return M.delay(Math.max(0, f.t0 + 2900 - M.now())).then(() => {
      /* no note comes (the Planning Wizard is not there): the card still goes */
      M.after(1800, () => { if (fin === f && !f.out) finaleOut(f, null).then((l) => { const fx = FX(); if (l && fx) fx.lineDrop(l); }); });
    });
  });
  TR.on('landed', ({ note }) => {
    if (!painted() || !note) return;
    const f = fin && !fin.out ? fin : null;
    const words = () => note.querySelector('.o55t-landwords');
    const open = (line) => {
      note.style.opacity = '';
      const fx = FX();
      if (fx && has('slice') && !still()) fx.slice(note, line ? { from: line, ms: 280 } : { ms: 280 });
      else if (line && fx) fx.lineDrop(line);
      typeOn(words());
    };
    if (!has('quests') && !f) { open(null); return; }
    /* the Wizard's page is still coming in: the page it replaces keeps its room for a moment (0.4 to 0.7 s), so the
       new page stands far below its place and then jumps up. The note waits unseen (still read out) until its page
       stands at the top of its column and its place has held for a second look (at most 1.6 s), is placed once, and
       then opens. */
    note.style.opacity = '0';
    const page = note.closest('[id^="panel-"]') || note.parentNode, t0 = M.now(); let last = null;
    const look = () => {
      if (!note.isConnected) { if (f) finaleOut(f, null).then((l) => { const fx = FX(); if (l && fx) fx.lineDrop(l); }); return; }
      const up = !page.parentElement || page.getBoundingClientRect().top - page.parentElement.getBoundingClientRect().top < 100;
      const y = Math.round(note.getBoundingClientRect().top), held = up && y === last; last = y;
      if (!(held || M.now() - t0 > 1600)) { M.after(80, look); return; }
      if (f) finaleOut(f, note).then(open, () => open(null));
      else { clearBanner(note); open(null); }
    };
    M.after(80, look);
  });
  /* where the note goes clear of the banner, from one reading of the page (all the reads, then one move): moved after
     a sibling, the note starts where the next sibling starts now, less the room it leaves behind */
  function bannerBand() {
    const W = window.PM_NIER_WORLD;
    let b = null; try { b = W && typeof W.bannerRect === 'function' ? W.bannerRect() : null; } catch (_) {}
    return b && Number.isFinite(b.top) && Number.isFinite(b.height) ? b : { top: innerHeight * 0.23, height: 92 };
  }
  function clearBanner(note) {
    const b = bannerBand(), top = b.top - 10, bottom = b.top + b.height + 12;
    const r = note.getBoundingClientRect(); if (!(r.bottom > top && r.top < bottom)) return;
    const sibs = []; for (let n = note.nextElementSibling; n; n = n.nextElementSibling) sibs.push(n);
    const rs = sibs.map((n) => n.getBoundingClientRect()), room = (rs[0] ? rs[0].top : r.bottom) - r.top;
    for (let k = 0; k < sibs.length; k++) {
      const at = k + 1 < rs.length ? rs[k + 1].top - room : rs[k].bottom - r.height;
      if (at >= bottom) { sibs[k].after(note); return; }
    }
  }
  /* it leaves by folding shut in three held steps, so the cards below step up into its place (no jump) */
  TR.on('unland', ({ note }) => {
    if (!painted() || still() || typeof note.animate !== 'function') return null;
    const cs = getComputedStyle(note), h = note.offsetHeight;
    note.style.overflow = 'hidden';
    const a = note.animate([{ height: h + 'px', marginTop: cs.marginTop, marginBottom: cs.marginBottom, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 },
      { height: '0px', marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }], { duration: 300, easing: 'steps(3, end)', fill: 'forwards' });
    return a.finished.catch(() => null);
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
  /* the tick is for a hand that moved: a button appearing under a resting pointer (a new callout, a closing one)
     also fires pointerover, and stays silent */
  let movedAt = -1e9;
  document.addEventListener('pointermove', (e) => { if (TR.running && e.isTrusted && (e.movementX || e.movementY)) movedAt = performance.now(); }, { capture: true, passive: true });
  const moved = () => performance.now() - movedAt < 100;
  TR.on('build', ({ root }) => {
    root.addEventListener('pointerover', (e) => {
      if (!painted() || !e.target.closest) return;
      const row = e.target.closest('.o55t-choice');
      if (row) { cursorOn(row, moved()); return; }
      const b = e.target.closest('.o55t-btn, .o55t-barbtn, .o55t-seg button');
      if (b && has('cursor') && moved() && !(e.relatedTarget && b.contains(e.relatedTarget))) sound('hover');
    });
    root.addEventListener('focusin', (e) => { const row = painted() && e.target.closest ? e.target.closest('.o55t-choice') : null; if (row) cursorOn(row, true); });
  });
})();
