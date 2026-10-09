/* O55.famWindow — the four looks' own hero moments in the onboarding window (styles: src/css/14-family-moments.css,
   words: src/copy.d/60-family-moments.json). NieR Mode has its act card, its wake and its curtain call
   (O55.nierWindow, 66-nier-window.js); Basic, Friendly, Glass and Retro have theirs here, each drawn in its own
   world's materials, light and dark alike:
     Basic (blueprint)    the wake drafts the sheet under a parallel rule and the strings are tensioned; the act card
                          is a title block drafted, stamped DONE and lifted off; the curtain call stamps the drawing
                          APPROVED
     Friendly (theatre)   the wake is curtain up: footlights, the velvet gathers, the paper troupe folds up from flat;
                          the act card is a title card on a stick; the curtain call ends with paper roses thrown
     Glass (light lab)    the wake switches the lab on: the beam, light running down the filaments into the cores;
                          the act card is a glass plate lit by a beam; the curtain call lights a spotlight per bow
     Retro (arcade)       the wake is attract mode, PLAYER 1 and the sprites spawning; the act card is STAGE CLEAR
                          with a bonus tally; the curtain call is ALL CLEAR
   NieR wins: 60-ui-core.js asks O55.nierWindow first, and asks here only when its answer is falsy; every hook here
   also stands down at once while NieR Mode is painted (live or the onboarding preview), whatever family is under it.

     open({ resumed, shown, screen })   a fresh open on Welcome with motion on: the stage starts asleep (its start state
                          from the first frame: data-o55fm-wake on .o55-stage and, for Friendly, Glass and Retro, the
                          overlay's curtain, dusk veil or attract screen) and screen() wakes it
     claimSting(from, def, dir) -> true  the first forward arrival in a chapter this run: the act card (or, at Ready,
                          the curtain call) plays the chapter's one sting itself; the rail is held in its old state
     stageDelay()  -> ms  the old troupe bows at the end of an act (its scene stays 240 ms)
     screen(layer, dir)   the wake, or the act card, drawn from the next frame
     ready(layer, fresh) -> true   Ready's curtain call (instead of the plain celebration)
     leaving() / input() / close()  a screen change, a key or a press, the window closing: every running moment to
                          its end state now (input never waits)
   Reduced Motion and a low-resource computer show each moment's end state at once: none of them performs, and the
   window is as it was before these moments existed (the act card's sting plays on the move, as before).

   How each moment is drawn. A performance is timers on the motion clock and one-shot Web Animations (transform and
   opacity; the Basic draw-ons, Retro's stepped wipes and Glass's streak as the families already use them), with an
   end state written first and the animations dropped after it in the same task, so a snap never shows a frame between.
   Cards, rulers, panels and beams are drawn in a stage overlay (.o55fm-layer): one SVG with the scene's own viewBox,
   sliced like the scene, so its units are the scene's units (portrait on a wide window, the scene's band on the
   narrow one), in the family's own palette, defs and type. The troupe acts in the scene itself, on each prop's drawing
   group (the one transform nothing else writes: the rig writes .o55-am, the entrances .o55-in). */
(function () {
  'use strict';
  const O55 = window.O55, M = O55.motion, U = O55.util, A = O55.art;
  const html = document.documentElement;
  const NS = 'http://www.w3.org/2000/svg';
  const FAMS = ['basic', 'friendly', 'glass', 'retro'];
  const T = (k, v) => O55.t('famMoments.' + k, v);
  const chName = (id) => O55.t('chapters.' + id);
  const esc = U.esc;
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  /* the family whose moments play: the painted one, never while NieR Mode is painted */
  const famNow = () => { if (painted()) return null; const f = O55.theme().family; return FAMS.indexOf(f) >= 0 && A.families[f] ? f : null; };
  const calm = () => M.reduced() || !!M.lowResource;
  const rootEl = () => (O55.S && O55.S.root) || null;
  const stageEl = () => { const r = rootEl(); return r ? r.querySelector('.o55-stage') : null; };
  const shown = () => { const s = O55.S; return !!(s && s.open && s.root && !s.root.hidden); };
  const isNarrow = () => { const r = rootEl(); return !!r && r.getAttribute('data-o55-layout') === 'narrow'; };
  const play = (ev, o) => { try { return O55.sound.play(ev, o || {}); } catch (_) { return false; } };
  /* a measurement and the drawing it decides, in the frame's read phase (O55.nierFx.measure works in every look) */
  const measure = (read) => { const F = O55.nierFx; if (F && F.measure) F.measure(read); else { const w = read(); if (typeof w === 'function') w(); } };
  const zoom = () => { const z = document.body && Number.parseFloat(document.body.style.zoom); return Number.isFinite(z) && z > 0 ? z : 1; };
  const sceneOf = (st) => st && st.querySelector(':scope > .o55-scene-wrap:not(.o55-out) svg.o55-scene');
  const helpersOf = (svg) => (svg ? [...svg.querySelectorAll('.o55-it.o55-ens-h')].sort((a, b) => (a.getAttribute('data-key') < b.getAttribute('data-key') ? -1 : 1)) : []);
  const keyOf = (g) => g.getAttribute('data-key') || '';
  /* a placed prop's drawing group (inside its anchor, entrance and ambient groups) */
  const body = (g) => g && g.querySelector(':scope > .o55-in > .o55-am > g');
  const voice = (g) => (A.voiceOf ? A.voiceOf(g) : { voice: 0, pan: 0 });
  const FONT = { basic: 'Inter, system-ui, sans-serif', friendly: 'Poppins, Nunito, system-ui, sans-serif', glass: 'Inter, system-ui, sans-serif', retro: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace" };
  const EASE = { basic: 'cubic-bezier(0.2, 0, 0, 1)', friendly: 'cubic-bezier(0.34, 1.56, 0.64, 1)', glass: 'cubic-bezier(0.05, 0.7, 0.1, 1)', retro: 'steps(1, end)' };

  /* ------------------------------------------------------------------ the run */
  let run = null;
  function runState() {
    const s = O55.S, id = s && s.sess ? (s.sess.started || '') + '|' + (s.epoch || 0) : '';
    if (!run || run.id !== id) run = { id, chapters: new Set(), stung: new Set(), maxIdx: -1, claim: null, cold: null };
    return run;
  }
  const progressOf = (def) => O55.stages.progress(O55.S, def);

  /* ------------------------------------------------------------------ performances */
  const live = new Set();
  function perf(name) {
    const p = { name, timers: [], anims: [], ends: [], done: false, q: null };
    p.at = (ms, fn) => { if (p.q) { p.q.push([ms, fn]); return null; } const t = M.after(Math.max(0, ms), () => { if (!p.done) fn(); }); p.timers.push(t); return t; };
    /* beats held until the picture starts: hold() queues them, go() starts them from now (a performance's sounds then
       start with its first frame, not when it was built: a long frame delays both alike) */
    p.hold = () => { if (!p.q) p.q = []; return p; };
    p.go = () => { const q = p.q; p.q = null; if (q && !p.done) q.forEach(([ms, fn]) => p.at(ms, fn)); };
    p.anim = (el, kf, o) => { if (!el || !el.animate) return null; try { const a = el.animate(kf, o); p.anims.push(a); return a; } catch (_) { return null; } };
    p.end = (fn) => { p.ends.push(fn); return p; };
    p.finish = () => {
      if (p.done) return; p.done = true;
      p.timers.forEach((t) => t.cancel());
      p.ends.forEach((fn) => { try { fn(); } catch (e) { console.warn('O55: family moment', name, e); } });
      p.anims.forEach((a) => { try { a.cancel(); } catch (_) {} });
      live.delete(p);
    };
    live.add(p);
    return p;
  }
  /* quiet: a screen change or the window closing ends a moment silently (its sting is not played late over the next
     screen or the hand-over); a key or a press ends it with its beats (input never waits, and nothing is lost) */
  let quiet = false;
  const snapAll = (q) => { const was = quiet; quiet = !!q; try { [...live].forEach((p) => p.finish()); } finally { quiet = was; } };

  /* ------------------------------------------------------------------ the stage overlay */
  function famCtx(f, host) {
    const tok = A.tokens(host), mode = O55.theme().mode, fam = A.families[f];
    const ctx = { family: f, mode, tok, fam, uid: 'o55fm-' + f + '-' + mode };
    ctx.url = (n) => `url(#${ctx.uid}-${n})`;
    ctx.pal = fam.palette(mode, tok, ctx);
    return ctx;
  }
  const dropLayer = (st) => { if (st) st.querySelectorAll(':scope > .o55fm-layer').forEach((n) => n.remove()); };
  function makeLayer(st, f, vb, ctx, extraDefs) {
    dropLayer(st);
    const div = document.createElement('div');
    div.className = 'o55fm-layer'; div.setAttribute('aria-hidden', 'true'); div.setAttribute('data-family', f);
    div.innerHTML = `<svg class="o55fm-svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="${NS}" shape-rendering="${f === 'retro' ? 'crispEdges' : 'auto'}">`
      + `<defs>${ctx.fam.defs ? ctx.fam.defs(ctx) : ''}${extraDefs || ''}</defs><g class="o55fm-root"></g></svg>`;
    st.appendChild(div);
    return { div, svg: div.firstElementChild, root: div.querySelector('.o55fm-root'), ctx, vb };
  }
  const part = (L, k) => L.root.querySelector(`[data-k="${k}"]`);
  const parts = (L, k) => [...L.root.querySelectorAll(`[data-k="${k}"]`)];
  /* what the stage shows of a viewBox, sliced into a W x H stage: { x, y, w, h } in scene units */
  function visible(vb, W, H) {
    const [x, y, w, h] = String(vb).split(/[\s,]+/).map(Number), s = Math.max(W / w, H / h) || 1;
    const vw = W / s, vh = H / s;
    return { x: x + (w - vw) / 2, y: y + (h - vh) / 2, w: vw, h: vh };
  }
  const vbFull = (vb) => { const [x, y, w, h] = String(vb).split(/[\s,]+/).map(Number); return { x, y, w, h }; };
  /* what the narrow window's 170 px band shows of a viewBox, from the window's own size rule (60-ui-core.js winSize)
     with nothing measured: the open draws before the window is laid out */
  function bandSeen(vb) {
    const vw = window.innerWidth, W = (vw <= 560 ? vw - 16 : Math.min(1080, vw - 48)) - 2;
    return visible(vb, Math.max(200, W), 170);
  }
  /* family type: Basic small caps with tracking, Friendly rounded, Glass light, Retro pixel caps */
  function txt(f, x, y, s, size, o) {
    o = o || {};
    const up = f === 'basic' || f === 'retro' || o.caps;
    const ls = o.ls != null ? o.ls : f === 'basic' ? 1.1 : f === 'glass' ? 0.4 : f === 'retro' ? 0 : 0;
    return `<text${o.k ? ` data-k="${o.k}"` : ''} x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${esc(FONT[f])}" font-weight="${o.w || 600}" font-size="${size}" letter-spacing="${ls}" text-anchor="${o.a || 'middle'}" fill="${o.fill}"${o.extra || ''}>${esc(up ? String(s).toUpperCase() : String(s))}</text>`;
  }
  /* a mono line's width (IBM Plex Mono's advance is 0.6 em) */
  const monoW = (s, size) => String(s).length * size * 0.6;
  /* the draw-on of a stroke made with pathLength 1 (Basic's own), one-shot */
  const DRAW = [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }];
  const IN = [{ opacity: 0 }, { opacity: 1 }];
  const OUT = [{ opacity: 1 }, { opacity: 0 }];

  /* ------------------------------------------------------------------ the troupe's bodies */
  /* a drawing group acts about its feet (14-family-moments.css .o55fm-body: fill-box, 50% 100%) */
  const markBody = (el, on) => { if (el && el.classList.contains('o55fm-body') !== on) el.classList.toggle('o55fm-body', on); };
  /* the strings follow the heads while bodies move (the rig measures its hooks for that long) */
  const watch = (svg, ms) => { if (A.rig && svg) A.rig.watch(svg, { settle: ms }); };
  /* the old troupe's quick bow at the end of an act (the act card), in the family's way: the pose and the timing it bows
     and rises with (the curtain call's bows pitch the upper body instead: PITCH) */
  const BOW = {
    basic: { pose: 'translateY(2px) scale(1.03, 0.82)', down: 200, up: 180, ease: 'cubic-bezier(0.2, 0, 0, 1)' },
    friendly: { pose: 'scale(1.1, 0.78)', down: 260, up: 360, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)', rise: [{ transform: 'scale(1.1, 0.78)' }, { transform: 'scale(0.94, 1.1)', offset: 0.45 }, { transform: 'none' }] },
    glass: { pose: 'translateY(5px) scale(1, 0.88)', down: 280, up: 320, ease: 'cubic-bezier(0.05, 0.7, 0.1, 1)' },
    retro: { pose: 'translateY(7px)', down: 1, up: 1, ease: 'steps(1, end)' }
  };
  function bowDown(p, f, el, delay, hold) {
    const b = BOW[f];
    markBody(el, true);
    return p.anim(el, [{ transform: 'none' }, { transform: b.pose }], { duration: b.down, delay: delay || 0, easing: b.ease, fill: hold ? 'forwards' : 'none' });
  }
  function bowUp(p, f, el) {
    const b = BOW[f];
    return p.anim(el, b.rise || [{ transform: b.pose }, { transform: 'none' }], { duration: b.up, easing: f === 'friendly' ? 'ease-out' : b.ease });
  }

  /* ------------------------------------------------------------------ the rail */
  /* the rail held in its old state walks to the new chapter in the family's way: Basic draws a dimension line from the
     old chapter's node to the new one, Friendly hops a paper pennant, Glass runs a light pulse along the bar, Retro
     jumps its cursor block in two steps. Reads in the read phase; the marker moves by transform only. */
  function railWalk(f, done, instant) {
    const r = rootEl(), s = O55.S;
    const nav = r && r.querySelector('.o55-rail');
    if (s) s.railHold = null;
    /* (instant: a moment snapped by a key or a press: the rail is simply at its end) */
    if (!nav || instant || calm() || !shown()) { O55.ui.renderRail(); if (done) done(); return; }
    measure(() => {
      const from = nav.querySelector('.o55-railitem[data-state="current"] .o55-railnode');
      const a = from ? from.getBoundingClientRect() : null;
      return () => {
        O55.ui.renderRail();
        measure(() => {
          const to = nav.querySelector('.o55-railitem[data-state="current"] .o55-railnode');
          const b = to ? to.getBoundingClientRect() : null, n = nav.getBoundingClientRect();
          return () => {
            const ms = a && b && a.width && b.width && Math.abs(b.left - a.left) > 2 ? walkMarker(f, nav, n, a, b) : 0;
            if (done) { if (ms) { const q = perf('walked'); q.at(ms, () => { q.finish(); done(); }); } else done(); }
          };
        });
      };
    });
  }
  function walkMarker(f, nav, n, a, b) {
    const z = zoom();
    /* (the node's centre; above the labels, the string's height between the rail's bar and the nodes; the bar's line) */
    const x0 = (a.left + a.width / 2 - n.left) / z, y0 = (a.top + a.height / 2 - n.top) / z, x1 = (b.left + b.width / 2 - n.left) / z, y1 = (b.top + b.height / 2 - n.top) / z;
    const ys = Math.max(4, (a.top - n.top) / z - 6), yb = 10;
    nav.querySelectorAll(':scope > .o55fm-walk').forEach((m) => m.remove());
    const m = document.createElement('i');
    m.className = 'o55fm-walk o55fm-walk-' + f; m.setAttribute('aria-hidden', 'true');
    nav.appendChild(m);
    const p = perf('walk'), dx = x1 - x0;
    p.end(() => m.remove());
    if (f === 'basic') {
      m.style.cssText = `left:${x0.toFixed(1)}px;top:${ys.toFixed(1)}px;width:${dx.toFixed(1)}px`;
      p.anim(m, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 300, easing: EASE.basic, fill: 'backwards' });
      p.anim(m, OUT, { duration: 220, delay: 620, fill: 'forwards' });
      play('move', { step: 0 }); p.at(300, () => play('move', { step: 2 }));
      p.at(860, () => p.finish());
      return 320;
    } else if (f === 'friendly') {
      m.style.cssText = `left:${x0.toFixed(1)}px;top:${(y0 - 22).toFixed(1)}px`;
      p.anim(m, [{ transform: 'translate(0px, 0px) scale(1, 1)' }, { transform: `translate(${(dx * 0.5).toFixed(1)}px, -16px) scale(1, 1)`, offset: 0.45 },
        { transform: `translate(${dx.toFixed(1)}px, 0px) scale(1.15, 0.8)`, offset: 0.8 }, { transform: `translate(${dx.toFixed(1)}px, 0px) scale(1, 1)` }], { duration: 420, easing: 'ease-in-out', fill: 'forwards' });
      p.anim(m, OUT, { duration: 200, delay: 640, fill: 'forwards' });
      p.at(340, () => play('move', { step: 2 }));
      p.at(860, () => p.finish());
      return 420;
    } else if (f === 'glass') {
      m.style.cssText = `left:${x0.toFixed(1)}px;top:${(yb - 6).toFixed(1)}px`;
      p.anim(m, [{ transform: 'translateX(0px)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translateX(${dx.toFixed(1)}px)`, opacity: 1, offset: 0.8 }, { transform: `translateX(${dx.toFixed(1)}px)`, opacity: 0 }],
        { duration: 520, easing: EASE.glass, fill: 'forwards' });
      play('move', { step: 1 });
      p.at(560, () => p.finish());
      return 420;
    } else {
      /* a pixel hop: up onto the rail's string line half-way, then down into the new box, one frame each */
      m.style.cssText = `left:${(x0 - 5).toFixed(1)}px;top:${(y0 - 5).toFixed(1)}px`;
      const mid = `translate(${(dx / 2).toFixed(1)}px, ${(ys - y0).toFixed(1)}px)`, end = `translate(${dx.toFixed(1)}px, ${(y1 - y0).toFixed(1)}px)`;
      p.anim(m, [{ transform: 'translate(0px, 0px)', offset: 0, easing: 'step-end' }, { transform: mid, offset: 0.34, easing: 'step-end' }, { transform: end, offset: 0.67 }, { transform: end }], { duration: 270, fill: 'forwards' });
      play('move', { step: 0, walk: true }); p.at(92, () => play('move', { step: 1, walk: true })); p.at(180, () => play('move', { step: 2, walk: true }));
      p.at(320, () => p.finish());
      return 200;
    }
  }
  /* Ready: every finished chapter re-stamps, left to right, 60 ms apart (the family's own stamp, 14-family-moments.css) */
  function restamp(f) {
    const r = rootEl(), nav = r && r.querySelector('.o55-rail'); if (!nav || calm()) return;
    const done = [...nav.querySelectorAll('.o55-railitem[data-state="done"]')];
    if (!done.length) return;
    const p = perf('restamp');
    done.forEach((li, i) => { li.style.setProperty('--o55fm-d', i * 60 + 'ms'); li.classList.add('o55fm-restamp'); });
    p.end(() => done.forEach((li) => { li.classList.remove('o55fm-restamp'); li.style.removeProperty('--o55fm-d'); }));
    play('checkpoint');
    p.at(done.length * 60 + 520, () => p.finish());
  }

  /* ================================================================== the act card */
  /* words for a card: the chapter finished, the next one, and where it stands in the journey */
  function cardWords(claim) {
    const pr = claim.pr || {}, total = (pr.chapters || []).length || 5, n = Math.max(1, (pr.index || 0) + 1);
    return { from: chName(claim.from), to: chName(claim.to), n, total };
  }
  const CARD = {};
  /* Basic: a sheet's title block drafted on the stage, stamped DONE as the sting plays, then lifted off the stage the
     way the cover sheet lifts at Ready */
  CARD.basic = function basicCard(L, V, nar, w, hooks) {
    const p = L.ctx.pal, f = 'basic';
    const cw = nar ? Math.min(410, V.w - 36) : Math.min(300, V.w - 30), ch = nar ? Math.min(90, V.h - 18) : 140;
    const cx = V.x + V.w / 2, cy = nar ? V.y + V.h / 2 + 2 : V.y + V.h * 0.3;
    const x0 = cx - cw / 2, y0 = cy - ch / 2, x1 = x0 + cw, y1 = y0 + ch;
    const row = nar ? 17 : 24, bot = nar ? 20 : 28, split = x1 - (nar ? 104 : 96);
    const sx = x1 - (nar ? 50 : 46), sy = y1 - (nar ? 11 : 15);
    const tick = (x, y) => `M${x} ${y - 4}V${y + 4}`;
    L.root.innerHTML = `<g data-k="sheet">`
      + `<rect data-k="paper" x="${x0}" y="${y0}" width="${cw}" height="${ch}" fill="${p.paper}"/>`
      + `<rect data-k="paper" x="${x0}" y="${y0}" width="${cw}" height="${ch}" fill="${L.ctx.url('grid')}"/>`
      + (nar ? '' : `<path data-k="dim" d="M${x0} ${y0 - 10}H${x1}${tick(x0, y0 - 10)}${tick(x1, y0 - 10)}" fill="none" stroke="${p.ink2}" stroke-width="0.75" pathLength="1"/>`)
      + `<path data-k="frame" d="M${x0} ${y0}H${x1}V${y1}H${x0}Z" fill="none" stroke="${p.ink}" stroke-width="1.5" stroke-linejoin="round" pathLength="1"/>`
      + `<path data-k="cells" d="M${x0} ${y0 + row}H${x1}M${x0} ${y1 - bot}H${x1}M${split} ${y0}V${y0 + row}M${split} ${y1 - bot}V${y1}" fill="none" stroke="${p.ink2}" stroke-width="0.8" pathLength="1"/>`
      + `<g data-k="small">${txt(f, x0 + 8, y0 + row - (nar ? 5 : 8), T('card.basic.kicker'), nar ? 7.4 : 8.6, { a: 'start', fill: p.ink2 })}`
      + txt(f, split + (x1 - split) / 2, y0 + row - (nar ? 5 : 8), T('card.basic.sheet', { n: w.n, total: w.total }), nar ? 7 : 8, { fill: p.ink2 })
      + txt(f, x0 + 8, y1 - (nar ? 6.5 : 9.5), T('card.next', { chapter: w.to }), nar ? 8 : 9.6, { a: 'start', fill: p.ink }) + '</g>'
      + `<g data-k="title">${txt(f, cx, (y0 + row + y1 - bot) / 2 + (nar ? 7 : 9.5), w.from, nar ? 20 : 27, { fill: p.ink, ls: 3.2 })}</g>`
      + `<g transform="translate(${sx} ${sy}) rotate(-8)"><g data-k="stamp" class="o55fm-stamp">`
      + `<rect x="-38" y="-13" width="76" height="26" rx="3" fill="${p.paper}"/><rect x="-38" y="-13" width="76" height="26" rx="3" fill="${p.accentFill}" stroke="${p.accent}" stroke-width="2"/>`
      + `<g transform="translate(-33 -8.5) scale(0.7)" style="color:${p.accent}">${A.glyph('check', 'currentColor', 2.6)}</g>`
      + txt(f, 8, 4.2, T('card.basic.stamp'), 11.5, { fill: p.accent, w: 800, ls: 2.2 }) + '</g></g></g>';
    const P = hooks.p, c0 = hooks.c0, land = c0 + 300;
    parts(L, 'paper').forEach((el) => P.anim(el, IN, { duration: 200, delay: c0, fill: 'backwards' }));
    P.anim(part(L, 'frame'), DRAW, { duration: 300, delay: c0, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' });
    P.anim(part(L, 'dim'), DRAW, { duration: 260, delay: c0 + 60, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' });
    P.anim(part(L, 'cells'), DRAW, { duration: 220, delay: c0 + 160, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' });
    P.anim(part(L, 'title'), IN, { duration: 180, delay: c0 + 180, fill: 'backwards' });
    P.anim(part(L, 'small'), IN, { duration: 200, delay: c0 + 280, fill: 'backwards' });
    P.at(land, hooks.land);
    P.anim(part(L, 'stamp'), [{ transform: 'scale(1.7)', opacity: 0 }, { transform: 'scale(0.95)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 150, delay: land + 140, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)', fill: 'backwards' });
    P.at(land + 270, () => play('land', { voice: 0, pan: 0.3 }));
    const lift = c0 + 1380;
    P.anim(part(L, 'sheet'), [{ transform: 'translateY(0px)' }, { transform: 'translateY(5px)', offset: 0.16 }, { transform: `translateY(${-(y1 - V.y + 24).toFixed(1)}px)` }], { duration: 440, delay: lift, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' });
    return lift + 460;
  };
  /* Friendly: a paper title card on a wooden stick pops up out of a slot in the boards, wobbles, its paper star spins,
     and it ducks back down into the slot. (On the wide stage the slot is a paper strip 40 units under the card, so the
     stick never crosses the new scene's art and words; on the narrow band it comes up from the band's foot.) */
  CARD.friendly = function friendlyCard(L, V, nar, w, hooks) {
    const p = L.ctx.pal, f = 'friendly';
    const cw = nar ? Math.min(380, V.w - 50) : Math.min(262, V.w - 46), ch = nar ? Math.min(80, V.h - 26) : 116;
    const cx = V.x + V.w / 2, cy = nar ? V.y + V.h / 2 - 6 : V.y + V.h * 0.31;
    const x0 = cx - cw / 2, y0 = cy - ch / 2, y1 = y0 + ch, slot = nar ? null : y1 + 40, bottom = slot != null ? slot + 8 : V.y + V.h + 30;
    const OL = `stroke="${p.ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
    const band = nar ? 14 : 18, n = Math.max(6, Math.round(cw / 26)), step = cw / n;
    let sc = `M${x0} ${y0 + band}`;
    for (let i = 0; i < n; i++) sc += ` a${(step / 2).toFixed(2)} 6 0 0 0 ${step.toFixed(2)} 0`;
    sc += ` V${y0 + 10} a10 10 0 0 0 -10 -10 H${x0 + 10} a10 10 0 0 0 -10 10Z`;
    const card = `M${x0 + 12} ${y0}H${x0 + cw - 12}a12 12 0 0 1 12 12V${y1 - 12}a12 12 0 0 1 -12 12H${x0 + 12}a12 12 0 0 1 -12 -12V${y0 + 12}a12 12 0 0 1 12 -12Z`;
    const star = 'M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z';
    const stx = x0 + cw - 4, sty = y0 + 2;
    const sw = cw + 40, sx0 = cx - sw / 2;
    const slotArt = slot == null ? '' : `<g data-k="slot"><rect x="${sx0 + 3}" y="${slot - 2}" width="${sw}" height="13" rx="6.5" fill="${p.shadow}"/>`
      + `<rect x="${sx0}" y="${slot - 6}" width="${sw}" height="13" rx="6.5" fill="${p.wood}" ${OL}/><path d="M${sx0 + 18} ${slot}H${sx0 + sw - 18}" stroke="${p.ink}" stroke-width="3" stroke-linecap="round"/></g>`;
    if (slot != null) L.svg.querySelector('defs').insertAdjacentHTML('beforeend', `<clipPath id="${L.ctx.uid}-slot"><rect x="${(V.x - 60).toFixed(1)}" y="${(V.y - 120).toFixed(1)}" width="${(V.w + 120).toFixed(1)}" height="${(slot - V.y + 120).toFixed(1)}"/></clipPath>`);
    L.root.innerHTML = (slot != null ? `<g clip-path="url(#${L.ctx.uid}-slot)">` : '<g>') + `<g data-k="rise"><g transform="translate(3 4)" fill="${p.shadow}"><rect x="${cx - 5}" y="${y1 - 4}" width="10" height="${(bottom - y1).toFixed(1)}" rx="4"/></g>`
      + `<rect x="${cx - 5}" y="${y1 - 4}" width="10" height="${(bottom - y1).toFixed(1)}" rx="4" fill="${p.wood}" ${OL}/><rect x="${cx - 2.5}" y="${y1 + 2}" width="3" height="${(bottom - y1).toFixed(1)}" rx="1.5" fill="${p.woodHi}" opacity="0.8"/>`
      + `<g data-k="card" class="o55fm-wobble"><path d="${card}" transform="translate(3 4)" fill="${p.shadow}"/>`
      + `<path d="${card}" fill="${p.paper}" ${OL}/><path d="${sc}" fill="${p.sun}" stroke="${p.ink}" stroke-width="1.6" stroke-linejoin="round"/>`
      + txt(f, cx, y0 + band + (nar ? 15 : 20), T('card.friendly.kicker'), nar ? 9.5 : 11, { fill: p.ink })
      + txt(f, cx, y0 + band + (nar ? 38 : 50), w.from, nar ? 20 : 27, { fill: p.ink, w: 700 })
      + txt(f, cx, y1 - (nar ? 8 : 12), T('card.friendly.next', { chapter: w.to }), nar ? 9 : 10.5, { fill: p.ink, w: 500 })
      + `<g transform="translate(${stx} ${sty})"><g data-k="star" class="o55fm-spin"><path d="${star}" transform="translate(2 3)" fill="${p.shadow}"/><path d="${star}" fill="${p.peach}" ${OL}/></g></g></g></g></g>` + slotArt;
    const P = hooks.p, c0 = hooks.c0, dist = ((slot != null ? slot + 8 : bottom) - y0 + 10).toFixed(1);
    const rise = part(L, 'rise'), sl = part(L, 'slot');
    if (sl) P.anim(sl, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 160, delay: c0 - 40, easing: 'ease-out', fill: 'backwards' });
    P.anim(rise, [{ transform: `translateY(${dist}px)` }, { transform: 'translateY(0px)' }], { duration: 520, delay: c0, easing: 'cubic-bezier(0.34, 1.45, 0.64, 1)', fill: 'backwards' });
    const land = c0 + 250;
    P.at(land, hooks.land);
    P.at(land + 10, () => play('land', { voice: 1, pan: 0 }));
    P.anim(part(L, 'card'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)', offset: 0.3 }, { transform: 'rotate(2.5deg)', offset: 0.62 }, { transform: 'rotate(-1deg)', offset: 0.85 }, { transform: 'rotate(0deg)' }],
      { duration: 760, delay: c0 + 300, easing: 'ease-in-out' });
    P.anim(part(L, 'star'), [{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(200deg) scale(1.35)', offset: 0.5 }, { transform: 'rotate(360deg) scale(1)' }], { duration: 620, delay: c0 + 460, easing: 'ease-out' });
    const duck = c0 + 1420;
    P.anim(rise, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-12px)', offset: 0.28 }, { transform: `translateY(${dist}px)` }], { duration: 400, delay: duck, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' });
    if (sl) P.anim(sl, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 160, delay: duck + 330, easing: 'ease-in', fill: 'forwards' });
    return duck + 500;
  };
  /* Glass: a beam comes on, a frosted plate rises into focus under it and is lit by a streak sweeping across it, light
     motes rise off its edge; then the beam goes out and the plate floats away out of focus */
  CARD.glass = function glassCard(L, V, nar, w, hooks) {
    const p = L.ctx.pal, f = 'glass', u = L.ctx.uid;
    const cw = nar ? Math.min(390, V.w - 40) : Math.min(268, V.w - 40), ch = nar ? Math.min(82, V.h - 22) : 112;
    /* (hung under the control bar, so the bar reads as its hanger and its rod never crosses the words) */
    const cx = V.x + V.w / 2, cy = nar ? V.y + V.h / 2 : V.y + V.h * 0.31 + 40;
    const x0 = cx - cw / 2, y0 = cy - ch / 2, y1 = y0 + ch;
    const top = V.y - 10, beam = `M${cx - 26} ${top}H${cx + 26}L${x0 + cw + 14} ${y0 + ch * 0.5}H${x0 - 14}Z`;
    let motes = '';
    for (let i = 0; i < 10; i++) { const mx = x0 + 22 + ((cw - 44) * ((i * 37) % 10)) / 9, r = 1.5 + (i % 3) * 0.6; motes += `<g data-k="mote" transform="translate(${mx.toFixed(1)} ${(y0 + 2).toFixed(1)})"><g><circle r="${(r * 3.2).toFixed(1)}" fill="${L.ctx.url('glow-' + ['lav', 'pink', 'mint'][i % 3])}"/><circle r="${r.toFixed(1)}" fill="${p.core}"/></g></g>`; }
    L.root.innerHTML = `<path data-k="beam" d="${beam}" fill="${L.ctx.url('beam')}"/>`
      + `<g data-k="plate" class="o55fm-focus"><ellipse cx="${cx}" cy="${cy}" rx="${(cw * 0.62).toFixed(1)}" ry="${(ch * 0.9).toFixed(1)}" fill="${L.ctx.url('glow-lav')}"/>`
      + `<rect x="${x0}" y="${y0}" width="${cw}" height="${ch}" rx="16" fill="${L.ctx.url('glass')}" stroke="${L.ctx.url('edge')}" stroke-width="1.4"/>`
      + `<path d="M${x0 + 14} ${y0 + 5}H${x0 + cw * 0.45}" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.4" stroke-linecap="round"/>`
      + `<g clip-path="url(#${u}-plateclip)"><g transform="rotate(14 ${x0} ${cy})"><rect data-k="streak" x="${x0 - 70}" y="${y0 - 20}" width="46" height="${ch + 40}" fill="url(#${u}-streak)"/></g></g>`
      + `<ellipse cx="${cx}" cy="${cy + (nar ? 2 : 4)}" rx="${(cw * 0.36).toFixed(1)}" ry="${nar ? 16 : 20}" fill="${L.ctx.url('glow-pink')}" opacity="0.55"/>`
      + txt(f, cx, y0 + (nar ? 19 : 25), T('card.glass.kicker'), nar ? 7.5 : 8.5, { fill: p.textDim, ls: 1.6, caps: true })
      + txt(f, cx, cy + (nar ? 9 : 11), w.from, nar ? 20 : 26, { fill: p.text, ls: 0.8 })
      + txt(f, cx, y1 - (nar ? 10 : 15), T('card.next', { chapter: w.to }), nar ? 8.5 : 9.5, { fill: p.textDim, w: 500 }) + '</g>'
      + `<g data-k="motes">${motes}</g>`;
    L.svg.querySelector('defs').insertAdjacentHTML('beforeend', `<clipPath id="${u}-plateclip"><rect x="${x0}" y="${y0}" width="${cw}" height="${ch}" rx="16"/></clipPath>`
      + `<linearGradient id="${u}-streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="${p.dark ? 0.55 : 0.8}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
    const P = hooks.p, c0 = hooks.c0;
    P.anim(part(L, 'beam'), IN, { duration: 300, delay: c0, easing: 'ease-out', fill: 'backwards' });
    P.anim(part(L, 'plate'), [{ opacity: 0, transform: 'translateY(8px) scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: c0 + 60, easing: EASE.glass, fill: 'backwards' });
    P.anim(part(L, 'streak'), [{ transform: 'translateX(0px)' }, { transform: `translateX(${(cw + 150).toFixed(1)}px)` }], { duration: 460, delay: c0 + 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' });
    const land = c0 + 320;
    P.at(land, hooks.land);
    parts(L, 'mote').forEach((m, i) => {
      const g = m.firstElementChild, dx = ((i % 2 ? 1 : -1) * (4 + (i % 4) * 3)), up = 54 + (i % 5) * 12;
      P.anim(g, [{ transform: 'translate(0px, 0px)', opacity: 0 }, { opacity: 0.95, offset: 0.2 }, { transform: `translate(${dx}px, ${-up}px)`, opacity: 0 }], { duration: 900 + (i % 3) * 120, delay: land + 60 + i * 70, easing: 'ease-out', fill: 'both' });
    });
    const out = c0 + 1420;
    P.anim(part(L, 'beam'), OUT, { duration: 300, delay: out, fill: 'forwards' });
    P.anim(part(L, 'plate'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-18px) scale(1.04)' }], { duration: 440, delay: out + 40, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)', fill: 'forwards' });
    return out + 500;
  };
  /* Retro: STAGE CLEAR. An interstitial screen wipes down over the stage in steps, the finished chapter types on in
     pixel type and CLEAR! cuts in on the sting, a bonus tally counts up, NEXT and a blinking READY?, and the screen
     wipes away */
  CARD.retro = function retroCard(L, V, nar, w, hooks) {
    const p = L.ctx.pal, f = 'retro';
    const X0 = V.x - 4, Y0 = V.y - 4, W = V.w + 8, H = V.h + 8, cx = V.x + V.w / 2;
    const ink = p.dark ? '#000' : p.ink, fr = 4, inset = nar ? 6 : 12;
    const frame = `<rect x="${V.x + inset}" y="${V.y + inset}" width="${V.w - 2 * inset}" height="${fr}" fill="${p.mid}"/><rect x="${V.x + inset}" y="${V.y + V.h - inset - fr}" width="${V.w - 2 * inset}" height="${fr}" fill="${p.mid}"/>`
      + `<rect x="${V.x + inset}" y="${V.y + inset}" width="${fr}" height="${V.h - 2 * inset}" fill="${p.mid}"/><rect x="${V.x + V.w - inset - fr}" y="${V.y + inset}" width="${fr}" height="${V.h - 2 * inset}" fill="${p.mid}"/>`;
    const title = w.from.toUpperCase(), clear = T('card.retro.clear').toUpperCase(), next = T('card.next', { chapter: w.to }).toUpperCase(), ready = T('card.retro.ready').toUpperCase(), bonus = T('card.retro.bonus').toUpperCase();
    let body;
    if (nar) {
      const ts = 18, cs = 18, gap = 12, tw = monoW(title, ts), cwid = monoW(clear, cs), lx = cx - (tw + gap + cwid) / 2, ly = V.y + V.h * 0.42;
      const by = ly + 24, bs = 10.5, bw = monoW(bonus + ' 0000', bs), nw = monoW(next, bs), rw = monoW(ready, bs), row = bw + 16 + nw + 16 + rw, bx = cx - row / 2;
      body = `<g data-k="title">${txt(f, lx + 2, ly + 2, title, ts, { a: 'start', fill: p.dim })}${txt(f, lx, ly, title, ts, { a: 'start', fill: p.text })}</g>`
        + `<g data-k="clear">${txt(f, lx + tw + gap, ly, clear, cs, { a: 'start', fill: p.a })}</g>`
        + `<g data-k="bonus">${txt(f, bx, by, bonus, bs, { a: 'start', fill: p.text })}${txt(f, bx + monoW(bonus + ' ', bs), by, '0000', bs, { a: 'start', fill: p.c, k: 'digits' })}</g>`
        + `<g data-k="next">${txt(f, bx + bw + 16, by, next, bs, { a: 'start', fill: p.text })}</g>`
        + `<g data-k="ready">${txt(f, bx + bw + 16 + nw + 16, by, ready, bs, { a: 'start', fill: p.b })}</g>`;
    } else {
      const ty = V.y + V.h * 0.25, ts = Math.min(32, (V.w - 70) / Math.max(5, title.length) / 0.6), tw = monoW(title, ts);
      const bs = 14, bw = monoW(bonus + ' 0000', bs), bx = cx - bw / 2;
      /* three pixel stars, one for each third of the tally */
      const star = (x, y) => `<g data-k="star" transform="translate(${x} ${y})">${A.sprite(['..k..', '.kyk.', 'kyyyk', '.kyk.', '..k..'], { k: p.dark ? '#000' : p.ink, y: p.c }, 4)}</g>`;
      body = `<g data-k="title">${txt(f, cx - tw / 2 + 3, ty + 3, title, ts, { a: 'start', fill: p.dim })}${txt(f, cx - tw / 2, ty, title, ts, { a: 'start', fill: p.text })}</g>`
        + `<g data-k="clear">${txt(f, cx + 2, ty + 42, clear, 26, { fill: p.dark ? '#000' : p.dim })}${txt(f, cx, ty + 40, clear, 26, { fill: p.a })}</g>`
        + star(cx - 36, ty + 70) + star(cx, ty + 66) + star(cx + 36, ty + 70)
        + `<g data-k="bonus">${txt(f, bx, ty + 112, bonus, bs, { a: 'start', fill: p.text })}${txt(f, bx + monoW(bonus + ' ', bs), ty + 112, '0000', bs, { a: 'start', fill: p.c, k: 'digits' })}</g>`
        + `<g data-k="next">${txt(f, cx, ty + 146, next, 13, { fill: p.text })}</g>`
        + `<g data-k="ready">${txt(f, cx, ty + 184, ready, 17, { fill: p.b })}</g>`
        + (L.ctx.fam.props.helper && V.h > 420 ? [-1, 0, 1].map((k, i) => `<g transform="translate(${cx + k * 62} ${ty + 286})"><g data-k="sprite">${L.ctx.fam.props.helper(L.ctx, { x: 0, y: 0, s: 1, opts: { variant: i, pose: i === 1 ? 'wave' : 'stand', px: 5 } })}</g></g>`).join('') : '');
    }
    /* the screen in the cabinet's own ground (Dark: its panel, a shade above the night stage, so the stage never reads
       darker while it shows; Light: the cream) */
    L.root.innerHTML = `<g data-k="panel" class="o55fm-wipe"><rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="${p.dark ? p.panel : p.bg}"/><rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="${L.ctx.url('scan')}"/>`
      + `<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="none" stroke="${ink}" stroke-width="4"/>${frame}${body}</g>`;
    const P = hooks.p, c0 = hooks.c0, panel = part(L, 'panel');
    P.anim(panel, [{ clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: 180, delay: c0, easing: 'steps(6, end)', fill: 'backwards' });
    const tl = part(L, 'title');
    P.anim(tl, [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: Math.max(200, title.length * 45), delay: c0 + 200, easing: `steps(${Math.max(1, title.length)}, end)`, fill: 'backwards' });
    const land = c0 + 200 + Math.max(200, title.length * 45);
    P.at(land, hooks.land);
    P.anim(part(L, 'clear'), [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: land, easing: 'steps(1, end)', fill: 'backwards' });
    P.anim(part(L, 'bonus'), [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: land + 160, fill: 'backwards' });
    const digits = part(L, 'digits'), steps = 5, STEP = 100;
    for (let i = 1; i <= steps; i++) P.at(land + 160 + i * STEP, () => { if (digits) digits.textContent = String(Math.round((1000 * i) / steps)).padStart(4, '0'); play('phase', { step: i }); });
    parts(L, 'star').forEach((el, i) => P.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: land + 160 + [2, 4, 5][i] * STEP, fill: 'backwards' }));
    /* the troupe's sprites jump on the tally, one pixel step up and down, one after another (each placed by its wrapper:
       a Web Animation's transform replaces an SVG transform attribute, so nothing animated carries one) */
    parts(L, 'sprite').forEach((el, i) => P.anim(el, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-10px)', offset: 0.5 }, { transform: 'translateY(0px)' }], { duration: 240, delay: land + 200 + i * 110, easing: 'steps(2, end)', iterations: 2 }));
    P.end(() => { if (digits) digits.textContent = '1000'; });
    const nx = land + 160 + steps * STEP + 60;
    P.anim(part(L, 'next'), [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: nx, fill: 'backwards' });
    P.anim(part(L, 'ready'), [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.75 }, { opacity: 1 }], { duration: 400, delay: nx + 60, easing: 'steps(1, end)', fill: 'backwards' });
    const out = nx + 480;
    P.anim(panel, [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)' }], { duration: 200, delay: out, easing: 'steps(6, end)', fill: 'forwards' });
    return out + 220;
  };

  /* the act card: drawn over the stage from the next frame, measured first; it lands on the chapter's sting and the
     rail walks; the card goes by itself, and a key, a press or a screen change takes it at once (its sting plays then
     if it had not landed) */
  function actCard(f, claim) {
    const st = stageEl(); if (!st) { railWalk(f); return; }
    const p = perf('card');
    let landed = false, L = null;
    const land = (instant) => {
      if (landed) return; landed = true;
      const sd = O55.sound.context ? O55.sound.context() : {};
      play('chapter', { chapter: claim.to, depth: sd && Number.isFinite(sd.depth) ? sd.depth : undefined });
      railWalk(f, null, instant);
    };
    p.end(() => { if (!quiet) land(true); if (L) L.div.remove(); });
    measure(() => {
      if (p.done) return null;
      const svg = sceneOf(st), vb = (svg && svg.getAttribute('viewBox')) || '0 0 480 600', r = st.getBoundingClientRect();
      return () => {
        if (p.done || !st.isConnected) return;
        if (!(r.width > 20 && r.height > 20)) { p.finish(); return; }
        const ctx = famCtx(f, st), nar = isNarrow(), V = visible(vb, r.width, r.height);
        L = makeLayer(st, f, vb, ctx);
        const end = CARD[f](L, V, nar, cardWords(claim), { p, c0: f === 'retro' ? 40 : 100, land });
        p.at(end, () => p.finish());
      };
    });
  }

  /* the old troupe bows at the end of an act, while its scene stays 240 ms (it leaves bowed) */
  function bowOld(f) {
    const st = stageEl(), svg = st && st.querySelector(':scope > .o55-scene-wrap.o55-scene-waiting svg.o55-scene');
    const hs = helpersOf(svg).map(body).filter(Boolean);
    if (!hs.length) return 0;
    const p = perf('bowOld');
    hs.forEach((el) => bowDown(p, f, el, 0, true));
    watch(svg, 700);
    play('bow', { voice: 0, pan: 0, intensity: 0.5 });
    p.end(() => hs.forEach((el) => markBody(el, false)));
    p.at(900, () => p.finish());
    return 240;
  }

  /* ================================================================== the curtain call */
  /* Ready (first arrival): the family curtain opens (the scene's own), the troupe stands in a line; the three bow on the
     notes of the chord, a rest, then they rise on the resolving sting with the family's finale (its emblem leads, the
     celebration under it); h2 points at the tour button (the composition), and the rail walks to READY and re-stamps
     every check. The finale's emblem is part of Ready's composition (57-scenes-journey.js, A.famCall.emblems), so
     Reduced Motion and a reopened window show it; the call holds it back until the rise. Basic's beats start 300 ms
     later than the others': its cover sheet lifts and its drawing inks itself, and the bows wait for a finished stage
     (under the call the troupe inks faster, its heads closed about 1.1 s after the arrival: A.famCall.inkFast). */
  const CC0 = { bows: [1000, 1150, 1300], rest: 1480, rise: 1640, end: 2500 };
  const ccOf = (f) => { const d = f === 'basic' ? 300 : 0; return { bows: CC0.bows.map((t) => t + d), rest: CC0.rest + d, rise: CC0.rise + d, end: CC0.end + d + (f === 'friendly' ? 300 : 0) }; };
  /* the curtain call's bow: the upper body (the art's .o55-up groups) pitches toward the audience about the hips while
     the legs stand, as NieR's units bow. Seen from the front, a pitch foreshortens the torso about the hip line and
     brings the head down over the chest: a scale about that line (k), a little wider as it comes toward us (sx). The
     head is not foreshortened: it is a ball. Its .o55-hd groups (the head, its shadow, the knot or loop on it) carry the
     inverse scale about the head's centre (head), so it stays round and rides down with the torso, and drop units more
     (in the scene's units at the full bow), as NieR's head drops below its knot; the face on it (.o55-fc) slides toward
     the floor, so the top of the head turns toward the audience (TIP). Basic bows measured, with no overshoot; Friendly
     deep and springy, rising past upright before it settles (the squash stays in the torso, where a paper bow squashes);
     Glass slow and deep, its head lowering into its spotlight. Retro's sprites never scale: they bow in two frames
     (retroFrames). */
  const PITCH = {
    basic: { hip: -18, k: 0.76, sx: 1.04, down: 240, up: 260, ease: [0.2, 0, 0, 1], head: -54, drop: 3 },
    friendly: { hip: -6, k: 0.62, sx: 1.1, down: 260, up: 480, ease: [0.3, 0, 0.25, 1], over: [1.1, 0.95], upEase: [0.3, 0.5, 0.3, 1], head: -56, drop: 5 },
    glass: { hip: -12, k: 0.72, sx: 1.03, down: 420, up: 520, ease: [0.05, 0.7, 0.1, 1], head: -57, drop: 3 }
  };
  /* the face's tip at a bow of a (1 = the full bow, below 0 past upright): Basic's equator runs about 4 lower (a
     drafted sphere tipping forward; shortened to its chord), Friendly's eyes, cheeks and smile about 4 toward the chin
     (pressed toward it, so they stay on the face and more hair shows), Glass's eyes about 3 */
  const TIP = {
    basic: (a) => `translate(0px, ${(4 * a).toFixed(2)}px) scale(${(1 - 0.12 * a).toFixed(4)}, 1)`,
    friendly: (a) => `translate(0px, -43px) scale(${(1 - 0.08 * a).toFixed(4)}, ${(1 - 0.3 * a).toFixed(4)}) translate(0px, 43px)`,
    glass: (a) => `translate(0px, ${(3 * a).toFixed(2)}px)`
  };
  const pitchT = (b, k, sx) => `translate(0px, ${(b.hip * (1 - k)).toFixed(2)}px) scale(${sx}, ${k})`;
  const upsOf = (el) => [...el.querySelectorAll(':scope > .o55-up')];
  const hdsOf = (el) => [...el.querySelectorAll(':scope > .o55-up > .o55-hd')];
  /* a pitch along a path of poses [offset, k, sx] as keyframes sampled from its easing, linear between samples, for the
     upper body, the head and the face alike: at every sample the head's scale is the exact inverse of the body's (a
     scale and its inverse, each interpolated in a straight line, part mid-way, and the head would stretch) */
  function pitchFrames(f, path, ease, ms) {
    const b = PITCH[f], E = M.bezier(ease[0], ease[1], ease[2], ease[3]), n = Math.max(8, Math.round(ms / 30)), kf = { up: [], hd: [], fc: [], nk: [] };
    for (let i = 0; i <= n; i++) {
      const e = E(i / n); let j = 1;
      while (j < path.length - 1 && e > path[j][0]) j++;
      const [o0, k0, s0] = path[j - 1], [o1, k1, s1] = path[j], u = (e - o0) / (o1 - o0 || 1), k = k0 + (k1 - k0) * u, sx = s0 + (s1 - s0) * u, a = (1 - k) / (1 - b.k), offset = i / n;
      kf.up.push({ offset, transform: pitchT(b, k, sx) });
      kf.hd.push({ offset, transform: `translate(0px, ${(b.head + (b.drop * a) / k).toFixed(3)}px) scale(${(1 / sx).toFixed(4)}, ${(1 / k).toFixed(4)}) translate(0px, ${-b.head}px)` });
      kf.fc.push({ offset, transform: TIP[f](a) });
      /* (Basic's neck folds away behind the head as it comes forward, to nothing at the shoulder line) */
      kf.nk.push({ offset, transform: `translate(0px, -41px) scale(1, ${Math.max(0, 1 - a).toFixed(4)}) translate(0px, 41px)` });
    }
    return kf;
  }
  const pitchParts = (el) => upsOf(el).map((g) => [g, 'up']).concat(hdsOf(el).map((g) => [g, 'hd']), [...el.querySelectorAll(':scope > .o55-up .o55-fc')].map((g) => [g, 'fc']),
    [...el.querySelectorAll(':scope > .o55-up > .o55-nk')].map((g) => [g, 'nk']));
  /* the head's string point goes with the head while the troupe bows (an invisible point, put back where it was): into
     the knot's .o55-hd group, so the string stays on the knot */
  function hookWithHead(p, el) {
    const ups = upsOf(el), hds = hdsOf(el), hk = el.querySelector(':scope > .o55-hook[data-hook="head"]'), last = hds[hds.length - 1] || ups[ups.length - 1];
    if (!hk || !last) return;
    const next = hk.nextSibling;
    last.appendChild(hk);
    p.end(() => { if (el.isConnected || hk.parentNode === last) el.insertBefore(hk, next && next.parentNode === el ? next : null); });
  }
  /* Basic's head is a drafted sphere, its centre-line cross one stroke in the drawing: for the call a copy is drawn as
     two strokes over it (the drawing's own hidden meanwhile), so its level stroke, the equator, can run lower as the
     head tips; put back when the call ends */
  function sphereTip(p, el) {
    const hd = hdsOf(el)[0], x = hd && hd.querySelector(':scope > path'), d = x && (x.getAttribute('d') || '').split(/(?=M)/);
    if (!x || !d || d.length < 2 || hd.querySelector(':scope > .o55fm-tip')) return;
    const at = (dd, cls) => { const n = x.cloneNode(false); n.removeAttribute('pathLength'); n.removeAttribute('class'); n.setAttribute('d', dd); if (cls) n.setAttribute('class', cls); return n; };
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'o55fm-tip');
    g.append(at(d[1]), at(d[0], 'o55-fc'));
    x.after(g); x.style.visibility = 'hidden';
    p.end(() => { g.remove(); x.style.visibility = ''; });
  }
  function pitchDown(p, f, el) {
    const b = PITCH[f], kf = pitchFrames(f, [[0, 1, 1], [1, b.k, b.sx]], b.ease, b.down);
    if (f === 'basic') sphereTip(p, el);
    return pitchParts(el).map(([g, kind]) => p.anim(g, kf[kind], { duration: b.down, easing: 'linear', fill: 'forwards' }));
  }
  function pitchUp(p, f, el) {
    const b = PITCH[f], kf = pitchFrames(f, b.over ? [[0, b.k, b.sx], [0.42, b.over[0], b.over[1]], [1, 1, 1]] : [[0, b.k, b.sx], [1, 1, 1]], b.upEase || b.ease, b.up);
    pitchParts(el).forEach(([g, kind]) => p.anim(g, kf[kind], { duration: b.up, easing: 'linear' }));
  }
  /* Retro: each sprite bows in two frames (54-art-retro.js bowA, bowB: the head a block down with the hands coming in,
     then the crown toward the audience with the hands together), 90 ms apart, and rises the same way back. The head's
     string point and its pixel knot go down with the crown, a block a frame, and the rig follows them, so the string
     never stops above a bowed head */
  function retroFrames(p, g, el, ctx, svg) {
    const art = el.querySelector(':scope > g[transform]'), F = A.families.retro; if (!art || !F) return null;
    const v = Number((keyOf(g).match(/\d+/) || [0])[0]) || 0, px = A.metrics('retro').helperPx || 7, box = document.createElementNS(NS, 'svg');
    const frame = (pose) => { box.innerHTML = F.props.helper(ctx, { x: 0, y: 0, s: 1, opts: { variant: v, pose, px } }); const fr = box.firstElementChild && box.firstElementChild.querySelector(':scope > g[transform]'); if (fr) { fr.style.display = 'none'; fr.classList.add('o55fm-bowf'); } return fr; };
    const a = frame('bowA'), b = frame('bowB'); if (!a || !b) return null;
    art.after(a, b);
    const hk = el.querySelector(':scope > .o55-hook[data-hook="head"]'), knot = el.querySelector(':scope > rect'), y0 = hk ? hk.getAttribute('cy') : null;
    const show = (n) => {
      art.style.display = n === 0 ? '' : 'none'; a.style.display = n === 1 ? '' : 'none'; b.style.display = n === 2 ? '' : 'none';
      if (hk) hk.setAttribute('cy', n ? String(+y0 + n * px) : y0);
      if (knot) { if (n) knot.setAttribute('transform', `translate(0 ${n * px})`); else knot.removeAttribute('transform'); }
      watch(svg, 400);
    };
    p.end(() => { a.remove(); b.remove(); art.style.display = ''; if (hk) hk.setAttribute('cy', y0); if (knot) knot.removeAttribute('transform'); });
    return { show };
  }
  function curtainCall(f, sting) {
    const st = stageEl(), svg = sceneOf(st), R = runState(), s = O55.S; if (!svg || !s) return false;
    const p = perf('call'), cc = ccOf(f), hs = helpersOf(svg), els = hs.map(body).filter(Boolean);
    R.calling = true;
    const em = (k) => [...svg.querySelectorAll(`.o55-it[data-key^="fm-${k}"]`)].map(body).filter(Boolean);
    const band = !/^\s*\S+\s+0\s/.test(svg.getAttribute('viewBox') || '');
    let rose = false;
    const rise = () => {
      if (rose) return; rose = true;
      if (sting) play('chapter', { chapter: 'ready', depth: 4, intensity: 0.85 });
    };
    p.end(() => { if (!quiet) rise(); R.calling = false; els.forEach((el) => markBody(el, false)); if (f === 'retro') tally(svg, 1, true); if (!quiet && s.railHold) { s.railHold = null; O55.ui.renderRail(); } });
    p.at(170, () => railWalk(f, () => restamp(f)));
    /* the bodies: Retro's bow frames, the others' heads carry their string points while they bow */
    const ctx = f === 'retro' ? famCtx(f, st) : null;
    const frames = els.map((el, i) => (f === 'retro' ? retroFrames(p, hs[i], el, ctx, svg) : (hookWithHead(p, el), null)));
    /* the finale's emblem waits for the rise (Glass's spotlights come on one by one with the bows) */
    const finale = FINALE[f](p, svg, em, els, cc, { st, band, hs });
    const bows = new Map();
    hs.forEach((g, i) => {
      const el = els[i]; if (!el) return;
      p.at(cc.bows[i] != null ? cc.bows[i] : cc.bows[2] + (i - 2) * 150, () => {
        if (f === 'retro') { const fr = frames[i]; if (fr) { fr.show(1); p.at(90, () => fr.show(2)); } }
        else bows.set(el, pitchDown(p, f, el));
        watch(svg, 900);
        play('bow', Object.assign(voice(g), { chapter: 'ready' }));
        if (finale.bow) finale.bow(i);
      });
    });
    p.at(cc.rest, () => { if (O55.sound.rest) O55.sound.rest(150); });
    p.at(cc.rise, () => {
      els.forEach((el, i) => {
        if (f === 'retro') {
          /* back up in two frames, then a two-step hop: up a step, up again, and down the same way (on the narrow
             band, one step, so the heads stay clear of ALL CLEAR above them) */
          const fr = frames[i]; if (fr) { fr.show(1); p.at(60, () => fr.show(0)); }
          markBody(el, true);
          p.anim(el, band ? [{ transform: 'none', easing: 'step-end' }, { transform: 'translateY(-4px)', offset: 0.2, easing: 'step-end' }, { transform: 'translateY(-4px)', offset: 0.8, easing: 'step-end' }, { transform: 'none' }]
            : [{ transform: 'none', easing: 'step-end' }, { transform: 'translateY(-4px)', offset: 0.2, easing: 'step-end' }, { transform: 'translateY(-9px)', offset: 0.4, easing: 'step-end' },
              { transform: 'translateY(-9px)', offset: 0.6, easing: 'step-end' }, { transform: 'translateY(-4px)', offset: 0.8, easing: 'step-end' }, { transform: 'none' }], { duration: 360, delay: 60 + i * 70 });
        } else { (bows.get(el) || []).forEach((a) => a && a.cancel()); pitchUp(p, f, el); }
      });
      watch(svg, 900);
      rise();
      if (finale.rise) finale.rise();
      /* the celebration 140 ms after the resolving sting, under the emblem: a smaller burst, so the emblem leads */
      p.at(140, () => { if (A.celebrate) A.celebrate(st, { big: true, count: 18, at: [240, band ? 330 : f === 'glass' ? 300 : 250] }); });
    });
    p.at(cc.end, () => p.finish());
    return true;
  }
  /* each family's finale: the emblem held back from the first frame (fill: backwards), and what it does at the bows and
     the rise */
  const FINALE = {
    /* Basic: approved for build. The draftsman's rubber stamp, drawn in plan, comes down on the drawing: corner marks
       draw on where it will land as the last helper bows, the stamp glides in from above the sheet and hovers there
       (its face's outline dashed over it, the drafting sign of an edge hidden from view), lifts a little in the rest,
       and strikes on the resolving chord with its felt thump. The grid under it brightens once, two press lines spread
       from its edges, and it lifts away up and to the right, uncovering a big APPROVED impression with today's date
       across the middle of the sheet (on the narrow band, beside h2's head). Measured: nothing overshoots. */
    basic(p, svg, em, els, cc, o) {
      const s = em('stamp'), C = cc.rise + 30;
      /* (the impression is made at the contact, under the stamp) */
      s.forEach((el) => p.anim(el, IN, { duration: 1, delay: C, fill: 'backwards' }));
      const it = s[0] && s[0].closest('.o55-it'), st = o && o.st;
      if (it && st) basicStamp(p, st, svg, it, C);
      return { rise() { p.at(C - cc.rise, () => play('land', { voice: 0, pan: 0 })); } };
    },
    /* Friendly: bravo. Three big paper roses are thrown from the house, from in front of the stage lip, large as they
       pass the audience, turn over in the air and land across the boards; the troupe steps back a beat as they land */
    friendly(p, svg, em, els, cc, o) {
      const rs = em('rose');
      rs.forEach((el, i) => {
        el.classList.add('o55fm-spin');
        /* (the path in the scene's units, turned into the rose's own: its item is scaled and turned) */
        const tf = (el.closest('.o55-it') || el).style.transform || '', sc = Number((tf.match(/scale\(\s*([\d.]+)/) || [])[1]) || 1, rr = ((Number((tf.match(/rotate\(\s*(-?[\d.]+)deg/) || [])[1]) || 0) * Math.PI) / 180;
        const tr = (x, y) => `translate(${((x * Math.cos(rr) + y * Math.sin(rr)) / sc).toFixed(1)}px, ${((-x * Math.sin(rr) + y * Math.cos(rr)) / sc).toFixed(1)}px)`;
        const dx = [-60, 10, 70][i % 3], spin = [-300, 330, -380][i % 3], up = o.band ? 70 : 130, from = o.band ? 150 : 240;
        p.anim(el, [{ transform: `${tr(dx, from)} rotate(${spin}deg) scale(1.5)`, opacity: 0 }, { transform: `${tr(dx, from)} rotate(${spin}deg) scale(1.5)`, opacity: 1, offset: 0.02 },
          { transform: `${tr(dx * 0.35, -up)} rotate(${(spin * 0.35).toFixed(0)}deg) scale(1.15)`, opacity: 1, offset: 0.55 }, { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 1 }],
        { duration: 640, delay: cc.rise + 40 + i * 120, easing: 'cubic-bezier(0.3, 0.1, 0.5, 1)', fill: 'backwards' });
      });
      p.end(() => rs.forEach((el) => el.classList.remove('o55fm-spin')));
      /* (each thump where its rose comes down: the flight's easing has it 95 % of the way down 500 ms in) */
      return { rise() {
        rs.forEach((el, i) => p.at(540 + i * 120, () => play('land', { voice: i, pan: [-0.35, 0, 0.35][i % 3] })));
        p.at(700, () => els.forEach((el, i) => { markBody(el, true); p.anim(el, [{ transform: 'none' }, { transform: 'translateY(-5px) scale(0.95)', offset: 0.35 }, { transform: 'none' }], { duration: 520, delay: i * 50, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }); }));
      } };
    },
    /* Glass: a spotlight comes on over each helper as it bows (its core flares); on the resolving chord the three
       spots swell together and the cores flare in one chord, and light motes rise off the three pools: the sparkle */
    glass(p, svg, em, els, cc, o) {
      const sp = em('spot');
      sp.forEach((el, i) => p.anim(el, IN, { duration: 260, delay: (cc.bows[i] != null ? cc.bows[i] : cc.bows[2]) + 20, easing: 'ease-out', fill: 'backwards' }));
      const cores = els.map((el) => [...el.querySelectorAll('.o55-core')]);
      const flare = (i, big) => (cores[i] || []).forEach((c) => { c.classList.add('o55fm-flare'); p.anim(c, [{ transform: 'scale(1)' }, { transform: `scale(${big ? 2.8 : 2.1})`, offset: 0.3 }, { transform: 'scale(1)' }], { duration: big ? 640 : 520, easing: 'ease-out' }); });
      p.end(() => cores.forEach((cs) => cs.forEach((c) => c.classList.remove('o55fm-flare'))));
      return {
        bow: flare,
        rise() {
          cores.forEach((cs, i) => flare(i, true));
          sp.forEach((el) => { el.classList.add('o55fm-swell'); const fl = el.querySelector('.o55fm-spotflare'); p.anim(el, [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.3, 1.02)', offset: 0.32 }, { transform: 'scale(1, 1)' }], { duration: 760, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
            if (fl) p.anim(fl, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' }); });
          p.end(() => sp.forEach((el) => el.classList.remove('o55fm-swell')));
          glassMotes(p, o.st, svg, sp);
        }
      };
    },
    /* Retro: ALL CLEAR types on big between the sign and the heads, the sprites hop, SETUP 100% tallies, and the arrow by
       h2's pointing hand blinks toward the tour button */
    retro(p, svg, em) {
      const cl = em('clear'), ar = em('arrow'), sc = em('score');
      sc.forEach((el) => p.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: CC0.rise + 420, fill: 'backwards' }));
      cl.forEach((el) => p.anim(el, [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: 360, delay: CC0.rise + 60, easing: 'steps(9, end)', fill: 'backwards' }));
      ar.forEach((el) => p.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: CC0.rise + 520, fill: 'backwards' }));
      tally(svg, 0, false);
      return { rise() { for (let i = 1; i <= 8; i++) p.at(420 + i * 90, () => { tally(svg, i / 8, false); play('phase', { step: i }); }); } };
    }
  };
  /* Basic's stamp at work, over the impression's place (its item's translate, scale and turn, in the scene's units):
     the corner marks, the press lines, the stamp and its dashed hidden outline in a stage overlay, the grid's
     brightening in the drawing itself, under the troupe, and the sheet's jolt under the blow; all of it goes with the
     call. C: the contact (call ms). It is all made on the motion clock just before it plays, its timings counted from
     then (made with the call, its animations would start only after Ready's heavy first frames, behind its sounds) */
  function basicStamp(p, st, svg, it, C) {
    const t0 = C - 340, D = (t) => t - t0;
    p.at(t0, () => {
      if (!st.isConnected || !svg.isConnected) return;
      const tf = it.style.transform || '', num = (re, v) => { const m = re.exec(tf); return m ? +m[1] : v; };
      const X = num(/translate\(\s*(-?[\d.]+)px/, 240), Y = num(/translate\([^,]+,\s*(-?[\d.]+)px/, 266), k = num(/scale\(\s*([\d.]+)\)/, 1), r = num(/rotate\(\s*(-?[\d.]+)deg/, 0);
      const vb = svg.getAttribute('viewBox') || '0 0 480 600', V = vbFull(vb), L = makeLayer(st, 'basic', vb, famCtx('basic', st)), pal = L.ctx.pal;
      const w = 200, h = 58, MW = 106, MH = 35, face = `x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5"`;
      /* the corner marks, framing the place on the paper wide enough to stay in view around the hovering stamp */
      const marks = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => { const x = sx * (w / 2 + 34), y = sy * (h / 2 + 19);
        return `<path data-k="mark" d="M${x} ${y - sy * 16}V${y}H${x - sx * 16}" fill="none" stroke="${pal.ink}" stroke-width="1.3" stroke-linecap="round" pathLength="1"/>`; }).join('');
      const press = [0, 1].map(() => `<rect data-k="press" ${face} fill="none" stroke="${pal.ink}" stroke-width="1.2" opacity="0"/>`).join('');
      /* the stamp in plan: its mount with chamfered edges, the label, a registration mark, the knob and its centre lines */
      const ch = (sx, sy) => `M${sx * (MW - 2)} ${sy * (MH - 2)}L${sx * 93} ${sy * 23}`;
      const tool = `<g data-k="tool"><rect x="${-MW}" y="${-MH}" width="${2 * MW}" height="${2 * MH}" rx="7" fill="${pal.paper}"/>`
        + `<rect x="${-MW}" y="${-MH}" width="${2 * MW}" height="${2 * MH}" rx="7" fill="${pal.fill2}" stroke="${pal.ink}" stroke-width="1.6"/>`
        + `<rect x="-93" y="-23" width="186" height="46" rx="3" fill="${pal.paper}" stroke="${pal.ink2}" stroke-width="0.8"/>`
        + `<path d="${ch(-1, -1)}${ch(1, -1)}${ch(1, 1)}${ch(-1, 1)}" fill="none" stroke="${pal.ink2}" stroke-width="0.8"/>`
        + txt('basic', -57, 3, T('call.basic.stamp'), 8.5, { fill: pal.ink2, w: 700, ls: 1.4 })
        + `<circle cx="57" cy="0" r="5" fill="none" stroke="${pal.ink2}" stroke-width="0.8"/><path d="M48 0H66M57 -9V9" stroke="${pal.ink2}" stroke-width="0.8"/>`
        + `<circle r="19" fill="${pal.paper}" stroke="${pal.ink}" stroke-width="1.5"/><circle r="11" fill="${pal.fill2}" stroke="${pal.ink}" stroke-width="1.1"/>`
        + `<path d="M-32 0H32M0 -30V30" fill="none" stroke="${pal.ink2}" stroke-width="0.65" stroke-dasharray="8 2.5 1.5 2.5"/></g>`;
      const hidden = `<rect data-k="hidden" ${face} fill="none" stroke="${pal.ink}" stroke-width="1" stroke-dasharray="5 3.5" opacity="0"/>`;
      L.root.innerHTML = `<g transform="translate(${X} ${Y}) scale(${k}) rotate(${r})">${marks}${press}${tool}${hidden}</g>`;
      /* the grid under the stamp, brightened in an ellipse about it: the sheet's own 20-unit lines, each faded toward its
         ends and dimmer away from the middle (gradient fills; no mask) */
      const RX = 150 * k, RY = 92 * k, u = 'o55fm-bgrid-' + (pal.dark ? 'd' : 'l'), a = pal.dark ? 0.62 : 0.5;
      let lines = '';
      for (let x = Math.ceil((X - RX) / 20) * 20; x <= X + RX; x += 20) { const q = 1 - ((x - X) / RX) ** 2; if (q <= 0.04) continue; const hh = RY * Math.sqrt(q), lw = x % 100 ? 0.9 : 1.3;
        lines += `<rect x="${(x - lw / 2).toFixed(2)}" y="${(Y - hh).toFixed(1)}" width="${lw}" height="${(2 * hh).toFixed(1)}" fill="url(#${u}-v)" opacity="${q.toFixed(2)}"/>`; }
      for (let y = Math.ceil((Y - RY) / 20) * 20; y <= Y + RY; y += 20) { const q = 1 - ((y - Y) / RY) ** 2; if (q <= 0.04) continue; const hw = RX * Math.sqrt(q), lw = y % 100 ? 0.9 : 1.3;
        lines += `<rect x="${(X - hw).toFixed(1)}" y="${(y - lw / 2).toFixed(2)}" width="${(2 * hw).toFixed(1)}" height="${lw}" fill="url(#${u}-h)" opacity="${q.toFixed(2)}"/>`; }
      const stop = (o2) => `<stop offset="0" stop-color="${pal.ink}" stop-opacity="0"/><stop offset="0.5" stop-color="${pal.ink}" stop-opacity="${o2}"/><stop offset="1" stop-color="${pal.ink}" stop-opacity="0"/>`;
      const grid = document.createElementNS(NS, 'g');
      grid.setAttribute('class', 'o55fm-gridup'); grid.setAttribute('aria-hidden', 'true'); grid.setAttribute('opacity', '0');
      grid.innerHTML = `<defs><linearGradient id="${u}-v" x1="0" y1="0" x2="0" y2="1">${stop(a)}</linearGradient><linearGradient id="${u}-h" x1="0" y1="0" x2="1" y2="0">${stop(a)}</linearGradient></defs>${lines}`;
      const back = svg.querySelector('.o55-sl-back');
      if (back) back.insertBefore(grid, back.firstChild);
      p.end(() => { L.div.remove(); grid.remove(); });
      /* the beats: the marks at C-300, the stamp in from C-310 to its hover at C-150, lifted a little to C-85, the strike
         to C, the press and its give, the lift from C+170, gone by C+500 */
      const s0 = D(C - 310), s1 = D(C + 500), span = s1 - s0, at = (t) => (D(t) - s0) / span;
      /* (from above the view, wherever the band or the slice puts its top) */
      const ty0 = Math.min(-170, (V.y - Y) / k - 120), tx0 = -70;
      parts(L, 'mark').forEach((m) => { p.anim(m, DRAW, { duration: 220, delay: D(C - 300), easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }); p.anim(m, OUT, { duration: 140, delay: D(C), fill: 'forwards' }); });
      p.at(D(C - 290), () => play('phase', { step: 0 }));
      const hid = part(L, 'hidden');
      p.anim(hid, [{ opacity: 0 }, { opacity: 0.9 }], { duration: 200, delay: D(C - 240), fill: 'forwards' });
      p.anim(hid, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 90, delay: D(C), fill: 'forwards' });
      const tl = part(L, 'tool');
      p.anim(tl, [
        { offset: 0, transform: `translate(${tx0}px, ${ty0.toFixed(1)}px) scale(1.5)`, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        { offset: at(C - 150), transform: 'translate(0px, 0px) scale(1.22)', easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        { offset: at(C - 85), transform: 'translate(0px, 0px) scale(1.3)', easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
        { offset: at(C), transform: 'translate(0px, 0px) scale(1)', easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        { offset: at(C + 40), transform: 'translate(0px, 0px) scale(0.988)', easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        { offset: at(C + 170), transform: 'translate(0px, 0px) scale(1)', easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
        { offset: 1, transform: `translate(64px, ${Math.min(-200, ty0 * 0.7).toFixed(1)}px) scale(1.45)` }], { duration: span, delay: s0, fill: 'both' });
      p.anim(tl, OUT, { duration: 150, delay: D(C + 340), fill: 'forwards' });
      p.at(D(C - 300), () => play('move', { step: 1 }));
      p.at(D(C + 170), () => play('move', { step: 2 }));
      /* the blow: two press lines spread from the face's edges and fade (one way), the grid brightens once and settles
         back, and the sheet gives under it, 1.5 px down and back, no bounce */
      parts(L, 'press').forEach((el, i) => p.anim(el, [{ transform: 'scale(1.02)', opacity: 0.9 }, { transform: `scale(${i ? 1.36 : 1.22})`, opacity: 0 }], { duration: 320 + i * 60, delay: D(C) + i * 40, easing: 'cubic-bezier(0.2, 0, 0, 1)' }));
      p.anim(grid, [{ opacity: 0, easing: 'linear' }, { opacity: 1, offset: 0.08, easing: 'cubic-bezier(0.3, 0, 0.4, 1)' }, { opacity: 0 }], { duration: 820, delay: D(C) - 10 });
      const wrap = svg.closest('.o55-scene-wrap');
      if (wrap) p.anim(wrap, [{ transform: 'translateY(0px)', easing: 'cubic-bezier(0.3, 0, 0.6, 1)' }, { transform: 'translateY(1.5px)', offset: 0.22, easing: 'cubic-bezier(0.2, 0, 0, 1)' }, { transform: 'translateY(0px)' }], { duration: 230, delay: D(C), composite: 'add' });
    });
  }
  /* Glass's sparkle at the rise: light motes rise off each spotlight's pool, in an overlay over the stage (in the
     scene's own units) that goes with the call */
  function glassMotes(p, st, svg, sp) {
    if (!st || !sp.length) return;
    const vb = svg.getAttribute('viewBox') || '0 0 480 600', L = makeLayer(st, 'glass', vb, famCtx('glass', st));
    p.end(() => L.div.remove());
    const pal = L.ctx.pal, floor = A.metrics('glass').floor;
    let out = '';
    sp.forEach((el, j) => {
      const it = el.closest('.o55-it'), x0 = Number(((it && it.style.transform) || '').match(/translate\(\s*(-?[\d.]+)px/)?.[1]) || 240 + (j - 1) * 112;
      for (let i = 0; i < 6; i++) { const x = x0 - 40 + ((i * 37 + j * 11) % 80), r = 1.5 + (i % 3) * 0.6; out += `<g transform="translate(${x.toFixed(1)} ${floor - 4})"><g data-k="mote"><circle r="${(r * 3.2).toFixed(1)}" fill="${L.ctx.url('glow-' + ['lav', 'pink', 'mint'][j % 3])}"/><circle r="${r.toFixed(1)}" fill="${pal.core}"/></g></g>`; }
    });
    L.root.innerHTML = out;
    parts(L, 'mote').forEach((m, i) => {
      const up = 90 + (i % 5) * 26, dx = (i % 2 ? 1 : -1) * (5 + (i % 4) * 4);
      p.anim(m, [{ transform: 'translate(0px, 0px)', opacity: 0 }, { opacity: 0.95, offset: 0.2 }, { transform: `translate(${dx}px, ${-up}px)`, opacity: 0 }], { duration: 1000 + (i % 3) * 180, delay: 60 + (i % 6) * 70, easing: 'ease-out', fill: 'both' });
    });
  }
  /* Retro's score line: SETUP n %, written whole at its end state */
  function tally(svg, k, end) {
    const t = svg && svg.querySelector('.o55-it[data-key="fm-score"] [data-fm="score"]'); if (!t) return;
    const v = T('call.retro.score', { n: end ? 100 : Math.round(100 * k) }).toUpperCase();
    if (t.textContent !== v) t.textContent = v;
  }

  /* the emblems in Ready's composition (asked for by 57-scenes-journey.js for the four families). On the narrow
     window's band (ctx.band: about y 318..434 of the scene at 760 px, the troupe's heads and shoulders) each emblem is
     placed where the band shows it: Basic's stamp beside h2's head, above its pointing arm, Retro's ALL CLEAR across the band's top with the
     arrow by h2's head, Friendly's roses along the band's foot between the troupe (the third below h2's pointing hand). */
  A.famCall = {
    /* Basic's Ready drawing inks its troupe faster when its curtain call is about to play (14-family-moments.css
       .o55fm-inkfast), so the first bow comes after every head is drawn; asked by the composition, after claimSting */
    inkFast(ctx) { const R = runState(); return ctx.family === 'basic' && !!R.claim && R.claim.kind === 'call' && R.claim.f === 'basic' && !calm(); },
    emblems(ctx) {
      const f = ctx.family, m = A.metrics(f), floor = m.floor, nar = !!ctx.band;
      /* (Basic's impression across the middle of the sheet, between the control bar and the heads, its word gap on h1's
         string; on the band, half size above h2's pointing arm, clear of h2's head and string) */
      if (f === 'basic') return [{ key: 'fm-stamp', prop: 'fmStamp', x: nar ? 420 : 240, y: nar ? 344 : 266, s: nar ? 0.5 : 1, r: nar ? -5 : -6, layer: 'front' }];
      if (f === 'friendly') return (nar ? [[184, 420], [296, 424], [372, 428]] : [[148, floor + 44], [262, floor + 50], [374, floor + 44]]).map(([x, y], i) => ({ key: 'fm-rose' + i, prop: 'fmRose', x, y, s: nar ? 2 : 3.5, r: (nar ? [-60, 40, 70] : [-70, 18, 74])[i], layer: 'front', opts: { v: i } }));
      if (f === 'glass') return [-1, 0, 1].map((s, i) => ({ key: 'fm-spot' + i, prop: 'fmSpot', x: 240 + s * 112, y: floor + 4, layer: 'back', opts: { v: i, top: 30 - floor, tint: ['lav', 'pink', 'mint'][i] } }));
      /* (on the band ALL CLEAR sits just inside its top, about y 318, clear of h1's crown through its one-step hop, with
         the gap between its words on h1's string) */
      if (f === 'retro') return [{ key: 'fm-clear', prop: 'fmClear', x: nar ? 251 : 240, y: nar ? 333 : 262, layer: 'front', opts: { size: nar ? 18 : 26 } }, { key: 'fm-score', prop: 'fmScore', x: 240, y: floor + 72, layer: 'front' }, { key: 'fm-arrow', prop: 'fmArrow', x: nar ? 422 : 426, y: nar ? 398 : floor - 26, layer: 'front' }];
      return [];
    }
  };
  /* the emblems' drawings, in each family's materials */
  function addProps() {
    const F = A.families;
    /* Basic's impression: ink on the drawing (the strings and the grid show through it), a worn double border, the
       word, and today's date under a rule */
    if (F.basic && !F.basic.props.fmStamp) F.basic.props.fmStamp = (ctx) => {
      const p = ctx.pal, w = 200, h = 58;
      let date = '';
      try { date = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()); } catch (_) {}
      return `<g><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5" fill="${p.accentFill}" stroke="${p.accent}" stroke-width="2.8" stroke-dasharray="84 1.6 132 2.2 58 1.4 101 2 120 2.8"/>`
        + `<rect x="${-w / 2 + 5.5}" y="${-h / 2 + 5.5}" width="${w - 11}" height="${h - 11}" rx="2.5" fill="none" stroke="${p.accent}" stroke-width="1.1"/>`
        + txt('basic', 2, 1.5, T('call.basic.stamp'), 23, { fill: p.accent, w: 800, ls: 4 })
        + `<path d="M-64 8H64" stroke="${p.accent}" stroke-width="0.8"/>` + txt('basic', 0, 17.5, date, 7, { fill: p.accent, w: 700, ls: 1.8 }) + '</g>';
    };
    if (F.friendly && !F.friendly.props.fmRose) F.friendly.props.fmRose = (ctx, item) => {
      const p = ctx.pal, c = [p.peach, p.lilac, p.sky][((item.opts || {}).v || 0) % 3];
      const OL = `stroke="${p.ink}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
      const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6" rx="4.6" ry="6.4" transform="rotate(${a})" fill="${c}" ${OL}/>`).join('');
      return `<g><path d="M0 4 Q-3 14 -10 22" fill="none" stroke="${p.ink}" stroke-width="3.6" stroke-linecap="round"/><path d="M0 4 Q-3 14 -10 22" fill="none" stroke="${p.mint}" stroke-width="2" stroke-linecap="round"/>`
        + `<path d="M-6 14 q-8 -2 -10 -9 q8 0 10 9Z" fill="${p.mint}" ${OL}/><g transform="translate(2 3)" fill="${p.shadow}"><circle r="10"/></g>${petals}<circle r="3.6" fill="${p.sun}" ${OL}/></g>`;
    };
    /* a spotlight's cone in its own gradient, white at the top to the helper's tint at its pool, strong enough to read
       on Light's pale stage (and its flare, the same cone brighter, shown only while the spots swell at the rise) */
    if (F.glass && !F.glass.props.fmSpot) F.glass.props.fmSpot = (ctx, item) => {
      const o = item.opts || {}, top = o.top || -440, p = ctx.pal, tint = p[o.tint || 'lav'] || p.core, id = ctx.url('fmspot' + (o.v || 0)).slice(5, -1);
      const a = p.dark ? [0.34, 0.16, 0.05] : [0.62, 0.34, 0.1], cone = `M-16 ${top}H16L62 -6H-62Z`;
      return `<g><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${a[0]}"/><stop offset="0.55" stop-color="${tint}" stop-opacity="${a[1]}"/><stop offset="1" stop-color="${tint}" stop-opacity="${a[2]}"/></linearGradient></defs>`
        + `<path d="${cone}" fill="url(#${id})"/><path class="o55fm-spotflare" d="${cone}" fill="url(#${id})" opacity="0"/>`
        + `<path d="M-16 ${top}L-62 -6M16 ${top}L62 -6" fill="none" stroke="${tint}" stroke-opacity="${p.dark ? 0.22 : 0.4}" stroke-width="1"/>`
        + `<ellipse cx="0" cy="-4" rx="70" ry="13" fill="${ctx.url('glow-' + (o.tint || 'lav'))}"/><ellipse cx="0" cy="-4" rx="46" ry="7" fill="none" stroke="${p.core}" stroke-opacity="${p.dark ? 0.35 : 0.6}" stroke-width="1"/></g>`;
    };
    if (F.retro && !F.retro.props.fmClear) F.retro.props.fmClear = (ctx, item) => {
      const p = ctx.pal, a = T('call.retro.clear').toUpperCase(), z = (item.opts || {}).size || 26, d = Math.max(2, Math.round(z / 9));
      return `<g>${txt('retro', d, d, a, z, { fill: p.dark ? '#000' : p.dim, w: 700 })}${txt('retro', 0, 0, a, z, { fill: p.a, w: 700 })}</g>`;
    };
    if (F.retro && !F.retro.props.fmScore) F.retro.props.fmScore = (ctx) => {
      const p = ctx.pal, s = T('call.retro.score', { n: 100 }).toUpperCase();
      return `<g><text data-fm="score" x="0" y="0" text-anchor="middle" font-family="${esc(FONT.retro)}" font-weight="600" font-size="11" fill="${p.c}">${esc(s)}</text></g>`;
    };
    /* an arrow down and to the right, toward the tour button, blinking between the accent and nothing (14-family-
       moments.css .o55fm-blink; still under Reduced Motion and on a low-resource computer) */
    if (F.retro && !F.retro.props.fmArrow) F.retro.props.fmArrow = (ctx) => {
      const p = ctx.pal, k = p.dark ? '#000' : p.ink;
      return `<g><g class="o55fm-blink">${A.sprite(['kk.......', 'kak......', '.kak.....', '..kak....', '...kak.kk', '....kakak', '.....kaak', '....kaaak', '...kaaaak', '...kkkkkk'], { k, a: p.a }, 3)}</g></g>`;
    };
  }

  /* ================================================================== the wake */
  /* the hero scene's geometry (55-scenes.js A.ensemble): the helpers' marks and the control bar's string points */
  function heroMarks(f) {
    const m = A.metrics(f), s = m.helperScale, cx = 240;
    return [-1, 0, 1].map((side, i) => {
      const x = cx + side * 112, y = m.floor - (side === 0 ? 14 : 0), a = side < 0 ? m.anchors[0] : side > 0 ? m.anchors[2] : m.anchors[1];
      return { i, x, y, head: [x + m.hook[0] * s, y + m.hook[1] * s], hook: [cx + a[0], m.barY + a[1]] };
    });
  }
  /* the overlay a wake starts with, drawn at open() so the first painted frame already shows it: Basic's blank sheet
     with the parallel rule parked above it, Friendly's closed house curtain and its footlights, Glass's dusk veil,
     Retro's attract screen */
  const WAKE0 = {
    basic(L, vb) {
      /* the blank sheet covers the drawing from the rule's edge down; the rule and the sheet travel down together, so
         the drawing shows exactly where the rule has passed (the sheet is the paper's own ground, without its grid) */
      const p = L.ctx.pal, V = vbFull(vb), top = V.y - 20;
      let tk = '';
      for (let x = 20; x <= 460; x += 10) tk += `M${x} 0V${x % 50 === 0 ? 7 : 4}`;
      L.root.innerHTML = `<g data-k="cover"><rect x="-40" y="${top}" width="560" height="${V.h + 70}" fill="${p.paper}"/></g><g data-k="cons"></g>`
        + `<g data-k="rule"><g transform="translate(0 ${top})"><rect x="14" y="-16" width="452" height="16" fill="${p.paper}" fill-opacity="0.92" stroke="${p.ink2}" stroke-width="0.8"/>`
        + `<path d="${tk}" transform="translate(0 -16)" fill="none" stroke="${p.ink2}" stroke-width="0.7"/><path d="M14 0H466" stroke="${p.ink}" stroke-width="1.4"/>`
        + `<circle cx="30" cy="-8" r="3" fill="none" stroke="${p.ink2}" stroke-width="0.8"/><circle cx="450" cy="-8" r="3" fill="none" stroke="${p.ink2}" stroke-width="0.8"/></g></g>`;
    },
    friendly(L, vb) {
      /* the footlights stand on the stage's own front (the stage prop at the floor + 28: a wood rail at -4..14 with its
         lamps at +4), in front of the curtain; on the narrow band, whose view stops above the stage, along its foot */
      const p = L.ctx.pal, V = isNarrow() ? bandSeen(vb) : vbFull(vb), sy = A.metrics('friendly').floor + 28, inView = sy + 16 <= V.y + V.h;
      const ly = inView ? sy + 4 : V.y + V.h - 10;
      const cur = L.ctx.fam.props.curtain ? L.ctx.fam.props.curtain(L.ctx, { x: 240, y: 300, opts: {} }) : '', F0 = vbFull(vb);
      const lights = [-150, -90, -30, 30, 90, 150].map((x) => `<g data-k="lamp" transform="translate(${240 + x} ${ly})"><ellipse data-k="glow" cx="0" cy="-10" rx="30" ry="16" fill="${p.glow}"/>`
        + `<ellipse data-k="bulb" class="o55fm-pop" cx="0" cy="0" rx="9" ry="4" fill="${p.sun}" stroke="${p.ink}" stroke-width="1.4" stroke-linejoin="round"/></g>`).join('');
      L.root.innerHTML = `<g data-k="curtain" transform="translate(240 ${F0.y + F0.h / 2}) scale(1, ${Math.max(1, F0.h / 600).toFixed(3)})">${cur}</g>`
        + (inView ? `<rect data-k="lip" x="34" y="${sy - 4}" width="412" height="18" rx="6" fill="${p.wood}" stroke="${p.ink}" stroke-width="2" stroke-linejoin="round"/>` : '') + lights;
      parts(L, 'bulb').forEach((b) => { b.style.opacity = '0.28'; });
      parts(L, 'glow').forEach((g) => { g.style.opacity = '0'; });
    },
    glass(L, vb) {
      const p = L.ctx.pal, V = vbFull(vb);
      /* (Light's dusk is a cool, thin slate: the pastel lab with its lights off, not a grey overlay) */
      L.root.innerHTML = `<rect data-k="veil" x="-40" y="${V.y - 40}" width="560" height="${V.h + 80}" fill="${p.dark ? '#07050d' : '#2c2840'}" opacity="${p.dark ? 0.8 : 0.3}"/>`;
    },
    retro(L, vb, nar) {
      const p = L.ctx.pal, V = vbFull(vb), cx = 240, k = p.dark ? '#000' : p.ink;
      const t1 = T('wake.retro.title').toUpperCase(), st = T('wake.retro.start').toUpperCase(), pl = T('wake.retro.player').toUpperCase();
      let words;
      if (nar) {
        const y = V.y + V.h / 2 - 4, s = 20;
        words = `<g data-k="title">${txt('retro', cx + 2, y + 2, t1, s, { fill: k })}${txt('retro', cx, y, t1, s, { fill: p.a })}</g>`
          + `<g data-k="start">${txt('retro', cx, y + 24, st, 10, { fill: p.c })}</g><g data-k="player">${txt('retro', cx, y + 24, pl, 10, { fill: p.b })}</g>`;
      } else {
        const y = V.y + V.h * 0.36, s = 28, [w1, w2] = t1.split(' ').length > 1 ? [t1.split(' ')[0], t1.split(' ').slice(1).join(' ')] : [t1, ''];
        words = `<g data-k="title">${txt('retro', cx + 3, y + 3, w1, s, { fill: k })}${txt('retro', cx, y, w1, s, { fill: p.a })}`
          + (w2 ? `${txt('retro', cx + 3, y + 37, w2, s, { fill: k })}${txt('retro', cx, y + 34, w2, s, { fill: p.a })}` : '') + '</g>'
          + `<g data-k="start">${txt('retro', cx, y + 92, st, 12, { fill: p.c })}</g><g data-k="player">${txt('retro', cx, y + 92, pl, 12, { fill: p.b })}</g>`
          + txt('retro', cx, y + 130, T('wake.retro.credit').toUpperCase(), 8, { fill: p.mid });
      }
      L.root.innerHTML = `<g data-k="panel" class="o55fm-wipe"><rect x="-40" y="${V.y - 40}" width="560" height="${V.h + 80}" fill="${p.bg}"/><rect x="-40" y="${V.y - 40}" width="560" height="${V.h + 80}" fill="${L.ctx.url('scan')}"/>${words}</g>`;
      const pg = part(L, 'player'); if (pg) pg.style.opacity = '0';
      const tg = part(L, 'title'); if (tg) tg.style.clipPath = 'inset(0% 100% 0% 0%)';
      const sg = part(L, 'start'); if (sg) sg.style.opacity = '0';
    }
  };
  const WAKE = {};
  /* Basic: the window opens on a blank sheet. A parallel rule sweeps down it and the drawing appears exactly where it
     has passed (the sheet travels down with it); construction is drafted ahead of the ink: the dash-dot centreline runs
     down and compass circles mark where the heads will be, and each construction line is drawn along the rule's edge
     as it passes (the bar, the heads, the floor); the construction fades once the rule has left, the strings are
     tensioned one by one as it leaves the floor, h0 waves and the welcome chord plays */
  WAKE.basic = function basicWake(p, L, svg, marks) {
    const pal = L.ctx.pal, V = vbFull(L.vb), top = V.y - 20, bottom = V.y + V.h + 30, m = A.metrics('basic');
    const lines = [{ y: m.barY, x0: 40, x1: 440 }, { y: marks[0].head[1], x0: 52, x1: 428 }, { y: m.floor, x0: 30, x1: 450 }];
    const con = `fill="none" stroke="${pal.ink2}" stroke-width="1.2" stroke-linecap="round" pathLength="1"`;
    const dash = []; for (let y = V.y + 10; y < V.y + V.h - 10; y += 22) dash.push(`M240 ${y.toFixed(0)}V${(y + 12).toFixed(0)}M240 ${(y + 16).toFixed(0)}V${(y + 18).toFixed(0)}`);
    const cy = (mk) => (mk.head[1] + 9 * m.helperScale).toFixed(1), hx = (mk) => mk.head[0].toFixed(1);
    const cons = part(L, 'cons');
    if (cons) cons.innerHTML = lines.map((l) => `<path data-k="cl" d="M${l.x0} ${l.y.toFixed(1)}H${l.x1}" ${con}/>`).join('')
      + marks.map((mk) => `<circle data-k="cc" cx="${hx(mk)}" cy="${cy(mk)}" r="24" ${con} transform="rotate(-90 ${hx(mk)} ${cy(mk)})"/>`
        + `<path data-k="cx" d="M${(mk.head[0] - 30).toFixed(1)} ${cy(mk)}H${(mk.head[0] + 30).toFixed(1)}M${hx(mk)} ${(mk.head[1] - 14).toFixed(1)}V${(mk.head[1] + 46).toFixed(1)}" ${con}/>`).join('')
      + `<path data-k="center" d="${dash.join('')}" ${con}/>`;
    const t0 = 60, dur = 820, dist = (bottom - top).toFixed(1), at = (y) => t0 + ((y - top) / (bottom - top)) * dur;
    [part(L, 'cover'), part(L, 'rule')].forEach((el) => p.anim(el, [{ transform: 'translateY(0px)' }, { transform: `translateY(${dist}px)` }], { duration: dur, delay: t0, easing: 'linear', fill: 'both' }));
    /* each construction line drawn along the rule's edge as the rule passes it, quickly, as a pencil runs along it */
    parts(L, 'cl').forEach((el, i) => { const t = at(lines[i].y) - 30; p.anim(el, DRAW, { duration: 150, delay: t, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }); p.at(t, () => play('phase', { step: i * 2 })); });
    /* the centreline and the compass circles run ahead of the rule, on the blank sheet */
    p.anim(part(L, 'center'), DRAW, { duration: 560, delay: 100, easing: 'linear', fill: 'backwards' });
    parts(L, 'cc').forEach((el, i) => p.anim(el, DRAW, { duration: 280, delay: 200 + i * 110, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }));
    parts(L, 'cx').forEach((el, i) => p.anim(el, DRAW, { duration: 200, delay: 280 + i * 110, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }));
    p.anim(cons, OUT, { duration: 420, delay: 1000, easing: 'ease-in', fill: 'forwards' });
    return { strings: Math.round(at(m.floor)) + 200, gap: 110, amp: 1.25, cheer: 1340, chord: 1410, end: 2000 };
  };
  /* Friendly: the footlights light one by one, the curtain gathers into the drapes, the paper troupe folds up */
  WAKE.friendly = function friendlyWake(p, L, svg, marks, bodies) {
    parts(L, 'lamp').forEach((lamp, i) => {
      const b = lamp.querySelector('[data-k="bulb"]'), g = lamp.querySelector('[data-k="glow"]'), t = 150 + i * 100;
      p.anim(b, [{ opacity: 0.28, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.3)', offset: 0.5 }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, delay: t, easing: 'ease-out', fill: 'forwards' });
      p.anim(g, IN, { duration: 260, delay: t, easing: 'ease-out', fill: 'forwards' });
      p.at(t, () => play('phase', { step: i }));
    });
    const cur = part(L, 'curtain'), l = cur && cur.querySelector('.o55-cur-l'), r = cur && cur.querySelector('.o55-cur-r');
    [l, r].forEach((h) => { if (!h) return; p.anim(h, [{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(0.3)', opacity: 1, offset: 0.78 }, { transform: 'scaleX(0.3)', opacity: 0 }], { duration: 900, delay: 700, easing: 'cubic-bezier(0.55, 0, 0.2, 1.05)', fill: 'forwards' }); });
    p.at(700, () => play('reveal'));
    /* the lip and its lamps go once the curtain is open: the stage's own lip and lamps are the same drawing beneath */
    p.anim(part(L, 'lip'), OUT, { duration: 300, delay: 1450, fill: 'forwards' });
    parts(L, 'lamp').forEach((lamp) => p.anim(lamp, OUT, { duration: 300, delay: 1450, fill: 'forwards' }));
    bodies.forEach((el, i) => {
      const t = 1000 + i * 130;
      p.anim(el, [{ transform: 'scale(1, 0.06)' }, { transform: 'scale(1.06, 1.12)', offset: 0.55 }, { transform: 'scale(0.98, 0.95)', offset: 0.8 }, { transform: 'none' }], { duration: 480, delay: t, easing: 'ease-out', fill: 'both' });
      /* (the thump as it pops up: ease-out has it at its overshoot about 180 ms in) */
      p.at(t + 150, () => play('land', voice(el.closest('.o55-it'))));
    });
    watch(svg, 1900);
    return { strings: 0 };
  };
  /* Glass: the lab switches on. The stage sits in the dusk with its cores out; the switch clicks and the beam snaps on
     (100 ms, its pool lit on the floor), the dusk lifts in 350 ms once it is on, a comet of light runs down each
     filament into its helper (a 50-unit tail in a gradient stroke with a glowing head: no filter), whose core lights
     on its bell, and motes rise off the floor; h0 waves and the welcome chord plays */
  WAKE.glass = function glassWake(p, L, svg, marks, bodies) {
    const pal = L.ctx.pal, V = vbFull(L.vb), u = L.ctx.uid, floor = A.metrics('glass').floor, on = 220;
    /* (from the veil's own opacity: a keyframe of 1 would darken it before it lifts) */
    const veil = part(L, 'veil'), v0 = veil ? +veil.getAttribute('opacity') || 1 : 1;
    /* the beam over the dusk, the stage's own cone and its pool on the floor: it snaps on, then gives way to the stage's
       own beam as the dusk lifts (in its cone the brightness hardly moves while the rest of the stage comes up) */
    L.svg.querySelector('defs').insertAdjacentHTML('beforeend', `<linearGradient id="${u}-wbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${pal.dark ? 0.34 : 0.6}"/><stop offset="1" stop-color="#fff" stop-opacity="${pal.dark ? 0.06 : 0.12}"/></linearGradient>`
      + `<radialGradient id="${u}-wpool"><stop offset="0" stop-color="#fff" stop-opacity="${pal.dark ? 0.5 : 0.75}"/><stop offset="0.6" stop-color="${pal.core}" stop-opacity="${pal.dark ? 0.18 : 0.3}"/><stop offset="1" stop-color="${pal.core}" stop-opacity="0"/></radialGradient>`
      + ['lav', 'pink', 'mint'].map((t, i) => `<linearGradient id="${u}-tail${i}" gradientUnits="userSpaceOnUse" x1="-56" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${pal[t]}" stop-opacity="0"/><stop offset="0.65" stop-color="${pal[t]}" stop-opacity="${pal.dark ? 0.6 : 1}"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>`).join(''));
    /* (on Light's pale stage a light reads by its colour, not its glow: a wider tail at the full tint, a bigger head
       ringed in it, a wider glow) */
    let comets = '';
    marks.forEach((mk, i) => { comets += `<g data-k="comet"><path d="M-56 0H0" fill="none" stroke="url(#${u}-tail${i % 3})" stroke-width="${pal.dark ? 3 : 5.5}" stroke-linecap="round"/><circle r="${pal.dark ? 12 : 17}" fill="${L.ctx.url('glow-' + ['lav', 'pink', 'mint'][i % 3])}"/><circle r="${pal.dark ? 3.2 : 4.4}" fill="${pal.core}" stroke="${pal[['lav', 'pink', 'mint'][i % 3]]}" stroke-opacity="${pal.dark ? 0 : 1}" stroke-width="${pal.dark ? 1.2 : 1.8}"/></g>`; });
    let motes = '';
    for (let i = 0; i < 12; i++) { const x = 96 + ((i * 53) % 290), y = Math.min(floor + 10, V.y + V.h - 8), r = 1.4 + (i % 3) * 0.6; motes += `<g transform="translate(${x} ${y})"><g data-k="mote"><circle r="${(r * 3).toFixed(1)}" fill="${L.ctx.url('glow-' + ['lav', 'pink', 'mint'][i % 3])}"/><circle r="${r.toFixed(1)}" fill="${pal.core}"/></g></g>`; }
    L.root.insertAdjacentHTML('beforeend', `<g data-k="lamp"><path d="M196 ${floor - 330}H284L410 ${floor - 18}H70Z" fill="url(#${u}-wbeam)"/><ellipse cx="240" cy="${floor - 12}" rx="176" ry="28" fill="url(#${u}-wpool)"/></g>`
      + `<g class="o55fm-travel">${comets}</g>${motes}`);
    const lamp = part(L, 'lamp');
    p.anim(lamp, [{ opacity: 0 }, { opacity: 1 }], { duration: 100, delay: on, easing: 'ease-out', fill: 'backwards' });
    p.anim(lamp, [{ opacity: 1 }, { opacity: 0 }], { duration: 460, delay: on + 140, easing: 'cubic-bezier(0.3, 0, 0.3, 1)', fill: 'forwards' });
    p.anim(veil, [{ opacity: v0 }, { opacity: 0 }], { duration: 350, delay: on + 120, easing: 'cubic-bezier(0.3, 0, 0.3, 1)', fill: 'forwards' });
    p.at(on, () => play('reveal'));
    const beam = svg.querySelector('.o55-it[data-key="stage"] .o55-beam');
    if (beam) p.anim(beam, [{ opacity: 0 }, { opacity: 1 }], { duration: 100, delay: on, easing: 'ease-out', fill: 'backwards' });
    /* the cores and their glows are out until the light reaches them */
    const lit = bodies.map((el) => [...el.querySelectorAll('.o55-core, circle[fill*="glow"]')]);
    parts(L, 'comet').forEach((el, i) => {
      const mk = marks[i], a = mk.hook, b = [mk.head[0], mk.head[1] - 2], ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, t = 560 + i * 160;
      const at = (q) => `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px) rotate(${ang.toFixed(1)}deg)`;
      p.anim(el, [{ transform: at(a), opacity: 0 }, { opacity: 1, offset: 0.08 }, { transform: at(b), opacity: 1, offset: 0.9 }, { transform: at(b), opacity: 0 }],
        { duration: 340, delay: t, easing: 'cubic-bezier(0.45, 0, 0.7, 1)', fill: 'both' });
      (lit[i] || []).forEach((c) => { c.classList.add('o55fm-flare'); p.anim(c, [{ opacity: 0.1, transform: 'scale(0.5)' }, { opacity: 1, transform: 'scale(1.45)', offset: 0.4 }, { opacity: 1, transform: 'scale(1)' }], { duration: 460, delay: t + 300, easing: 'ease-out', fill: 'backwards' }); });
      p.at(t + 300, () => play('string', Object.assign(voice(bodies[i] && bodies[i].closest('.o55-it')), { step: i })));
    });
    p.end(() => lit.forEach((cs) => cs.forEach((c) => c.classList.remove('o55fm-flare'))));
    parts(L, 'mote').forEach((g, i) => {
      const up = 80 + (i % 4) * 22, dx = (i % 2 ? 1 : -1) * (6 + (i % 3) * 5);
      p.anim(g, [{ transform: 'translate(0px, 0px)', opacity: 0 }, { opacity: 0.9, offset: 0.25 }, { transform: `translate(${dx}px, ${-up}px)`, opacity: 0 }], { duration: 1000 + (i % 3) * 160, delay: 1000 + i * 60, easing: 'ease-out', fill: 'both' });
    });
    return { strings: 0, cheer: 1500, chord: 1570, end: 2300 };
  };
  /* Retro: attract mode types its title, PRESS START blinks, PLAYER 1, the screen wipes away and the sprites spawn */
  WAKE.retro = function retroWake(p, L, svg, marks, bodies) {
    const pal = L.ctx.pal, tg = part(L, 'title'), sg = part(L, 'start'), pg = part(L, 'player'), panel = part(L, 'panel');
    p.anim(tg, [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: 360, delay: 60, easing: 'steps(12, end)', fill: 'both' });
    /* (born on its first blink: no fill before it, so the delay shows nothing) */
    p.anim(sg, [{ opacity: 1 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.75 }, { opacity: 0 }], { duration: 360, delay: 460, easing: 'steps(1, end)', fill: 'forwards' });
    p.anim(pg, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: 820, fill: 'both' });
    p.at(820, () => play('select'));
    p.anim(panel, [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)' }], { duration: 180, delay: 960, easing: 'steps(6, end)', fill: 'forwards' });
    p.at(960, () => play('reveal'));
    /* each sprite spawns: a column of pixel blocks drops onto its spot in stepped frames, then the sprite is there */
    const px = A.metrics('retro').helperPx || 7;
    let cols = '';
    marks.forEach((m) => { cols += `<g transform="translate(${m.x - px} ${m.y - 14 * px})"><g data-k="col" style="opacity:0">${[0, 1, 2].map((j) => `<rect x="0" y="${-j * 3 * px}" width="${2 * px}" height="${2 * px}" fill="${j ? pal.c : pal.a}"/>`).join('')}</g></g>`; });
    L.root.insertAdjacentHTML('beforeend', cols);
    parts(L, 'col').forEach((c, i) => {
      const t = 1120 + i * 140, fall = 14 * px - 2 * px;
      /* (shown only while it drops: hidden before, over the attract screen, and once the sprite is there) */
      p.anim(c, [{ transform: 'translateY(-60px)', opacity: 1 }, { transform: `translateY(${fall}px)`, opacity: 1, offset: 0.99 }, { transform: `translateY(${fall}px)`, opacity: 1 }], { duration: 160, delay: t, easing: 'steps(4, end)' });
      const el = bodies[i], g = el && el.closest('.o55-it');
      if (el) p.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: t + 160, fill: 'both' });
      /* its strings come with it */
      if (g) svg.querySelectorAll(`.o55-tie[data-to^="${keyOf(g)}:"]`).forEach((tie) => p.anim(tie, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: t + 160, fill: 'both' }));
      p.at(t + 160, () => play('land', Object.assign(voice(el && el.closest('.o55-it')), {})));
    });
    return { strings: 0 };
  };
  /* the first two frames in a row under 34 ms each (after at least three), or cap ms: the window's heavy first frames
     are over (as NieR's cold open waits: a choreography started in those frames would be over before it was seen) */
  function calmFrames(cap) {
    return new Promise((res) => {
      const raf = M.real.raf, t0 = performance.now();
      let last = 0, n = 0, ok = 0;
      const step = (t) => { if (last) ok = t - last < 34 ? ok + 1 : 0; last = t; n++; if ((n >= 3 && ok >= 2) || performance.now() - t0 > cap) { res(); return; } raf(step); };
      raf(step);
      M.real.setTimeout(res, cap + 400);
    });
  }
  /* the wake: from the release of the first screen; ends awake: the overlay gone, the stage as it always is */
  function wake(f, cold) {
    const st = stageEl(), svg = sceneOf(st); if (!st || !svg || cold.done) { endCold(); return; }
    /* (the beats wait for the picture's first frame: a long frame after building delays the sound with the picture) */
    const p = perf('wake').hold();
    cold.p = p;
    const L = cold.L || makeLayer(st, f, svg.getAttribute('viewBox') || '0 0 480 600', famCtx(f, st));
    cold.L = L;
    const hs = helpersOf(svg), bodies = hs.map(body).filter(Boolean);
    bodies.forEach((el) => markBody(el, true));
    p.end(() => { bodies.forEach((el) => markBody(el, false)); endCold(); });
    const marks = heroMarks(f), r = WAKE[f](p, L, svg, marks, bodies) || {};
    /* the strings are tensioned one by one (each helper plucked, its wire ringing on its chord tone) */
    if (r.strings) hs.forEach((g, i) => p.at(r.strings + i * (r.gap || 110), () => { if (A.rig) A.rig.pluck(svg, keyOf(g), { amp: r.amp || 0.7, dir: i % 2 ? -1 : 1 }); play('string', Object.assign(voice(g), { step: i })); }));
    const h0 = hs.find((g) => keyOf(g) === 'h0');
    p.at(r.cheer || 1650, () => { if (h0) { if (A.rig && h0.querySelector('.o55-arm, .o55-wf')) A.rig.cheer(svg, 'h0'); play('cheer', voice(h0)); } });
    p.at(r.chord || 1720, () => play('chapter', { chapter: 'welcome', depth: 0, intensity: 0.45 }));
    p.at(r.end || 2300, () => p.finish());
    const first = p.anims.find(Boolean), go = () => { if (!p.done) p.go(); };
    if (first && first.ready) first.ready.then(go, go); else M.real.raf(go);
  }
  /* while the stage is asleep a key or a press anywhere wakes it at once (the window takes focus only once its first
     screen shows, and on a slow computer that is a while: the window's own snap would not hear it) */
  let coldOff = null;
  function coldInput(on) {
    if (coldOff) { coldOff(); coldOff = null; }
    if (!on) return;
    const snap = (e) => { if (e.type === 'keydown' && /^(Shift|Control|Alt|Meta|CapsLock|Fn)$/.test(e.key)) return; snapAll(); endCold(); };
    document.addEventListener('keydown', snap, true); document.addEventListener('pointerdown', snap, true);
    coldOff = () => { document.removeEventListener('keydown', snap, true); document.removeEventListener('pointerdown', snap, true); };
  }
  function endCold() {
    coldInput(false);
    const R = runState(), cold = R.cold, st = stageEl();
    if (st && st.hasAttribute('data-o55fm-wake')) st.removeAttribute('data-o55fm-wake');
    if (cold) { cold.done = true; if (cold.L && cold.L.div.isConnected) cold.L.div.remove(); R.cold = null; }
  }

  /* ------------------------------------------------------------------ keeping true to the look */
  /* NieR Mode arriving, or the look changing, while a family moment plays: it ends at once (NieR's skin takes over) */
  new MutationObserver(() => { if (live.size || (run && run.cold)) { snapAll(); endCold(); const st = stageEl(); if (st && !famNow()) dropLayer(st); } })
    .observe(html, { attributes: true, attributeFilter: ['data-o55-nier', 'data-theme'] });

  /* ================================================================== the hooks */
  O55.famWindow = {
    open(o) {
      o = o || {};
      snapAll(); endCold();
      const R = runState(), s = O55.S, f = famNow(), st = stageEl();
      R.claim = null;
      if (s && s.sess) (s.sess.history || []).concat([s.sess.screen]).forEach((id) => { const d = O55.screens.defs[id]; if (d) R.maxIdx = Math.max(R.maxIdx, progressOf(d).index); });
      if (!f || !st || o.shown || o.resumed || o.screen !== 'welcome' || calm()) return false;
      addProps();
      const cold = R.cold = { f, done: false, L: null };
      st.setAttribute('data-o55fm-wake', f);
      coldInput(true);
      if (WAKE0[f]) {
        const nar = isNarrow(), band = A.scenes.hero && A.scenes.hero.band, vb = nar && band ? band.join(' ') : `0 0 ${A.W} ${A.H}`;
        cold.L = makeLayer(st, f, vb, famCtx(f, st));
        WAKE0[f](cold.L, vb, nar);
      }
      return false;
    },
    claimSting(from, def, dir) {
      const R = runState(), s = O55.S;
      R.claim = null;
      if (!from || !def || !s) return false;
      const prev = progressOf(from), pr = progressOf(def);
      const was = R.maxIdx;
      R.maxIdx = Math.max(R.maxIdx, prev.index);
      const f = famNow(); if (!f || calm()) return false;
      if (prev.current === pr.current || (dir || 'fwd') !== 'fwd' || pr.index <= Math.max(was, prev.index)) return false;
      addProps();
      if (pr.current === 'ready') {
        if (def.id !== 'ready' || R.stung.has('ready')) return false;
        R.stung.add('ready'); R.claim = { kind: 'call', f, pr: prev };
        s.railHold = prev;
        return true;
      }
      if (R.chapters.has(prev.current)) return false;
      R.chapters.add(prev.current);
      R.claim = { kind: 'card', f, from: prev.current, to: pr.current, pr: prev };
      s.railHold = prev;
      return true;
    },
    stageDelay() {
      const R = runState(), f = famNow();
      if (!f || !R.claim || R.claim.kind !== 'card' || calm()) return 0;
      return bowOld(f);
    },
    leaving() { if (live.size) snapAll(true); return false; },
    screen(layer, dir) {
      const R = runState(), s = O55.S, def = s && O55.screens.defs[s.sess.screen];
      const claim = R.claim; R.claim = null;
      if (def) R.maxIdx = Math.max(R.maxIdx, progressOf(def).index);
      const f = famNow();
      if (!f) { if (s && s.railHold && claim) { s.railHold = null; O55.ui.renderRail(); } endCold(); return false; }
      /* (Basic's rule also waits out the drawing's own slide in, 520 ms, under its blank sheet: what it reveals stands still) */
      if (dir === 'open' && R.cold) { const cold = R.cold; Promise.all([calmFrames(1200), f === 'basic' ? new Promise((res) => M.after(560, res)) : null]).then(() => { if (R.cold === cold && !cold.done && shown()) wake(f, cold); else if (R.cold === cold) endCold(); }); return false; }
      /* the rail stays in its old state until the moment's beat walks it (NieR's screen hook, asked first, lets go of
         any hold while NieR Mode is not painted; it is taken again here, in the same task, so no frame shows between) */
      if (claim && claim.pr && (claim.kind === 'card' || R.calling)) { s.railHold = claim.pr; O55.ui.renderRail(); }
      if (claim && claim.kind === 'card') { actCard(f, claim); return false; }
      /* ready() performs the call and its rail walks on its beat; a call that could not play lets the rail go now */
      if (claim && claim.kind === 'call' && !R.calling && s.railHold) { s.railHold = null; O55.ui.renderRail(); }
      return false;
    },
    ready(layer, fresh) {
      const f = famNow(); if (!f || !fresh || calm() || !layer) return false;
      const R = runState(), first = !!(R.claim && R.claim.kind === 'call');
      addProps();
      return curtainCall(f, first);
    },
    input() { if (live.size) snapAll(); if (run && run.cold) endCold(); return false; },
    close() { snapAll(true); endCold(); const st = stageEl(); dropLayer(st); return false; }
  };
  addProps();
})();
