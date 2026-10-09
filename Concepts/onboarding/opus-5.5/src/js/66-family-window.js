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
    const p = { name, timers: [], anims: [], ends: [], done: false };
    p.at = (ms, fn) => { const t = M.after(Math.max(0, ms), () => { if (!p.done) fn(); }); p.timers.push(t); return t; };
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
  /* a bow in the family's way: the pose and the timing it bows and rises with */
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
  /* Friendly: a paper title card on a wooden stick pops up from under the stage, wobbles, its paper star spins, and
     it ducks back down */
  CARD.friendly = function friendlyCard(L, V, nar, w, hooks) {
    const p = L.ctx.pal, f = 'friendly';
    const cw = nar ? Math.min(380, V.w - 50) : Math.min(262, V.w - 46), ch = nar ? Math.min(80, V.h - 26) : 116;
    const cx = V.x + V.w / 2, cy = nar ? V.y + V.h / 2 - 6 : V.y + V.h * 0.31;
    const x0 = cx - cw / 2, y0 = cy - ch / 2, y1 = y0 + ch, bottom = V.y + V.h + 30;
    const OL = `stroke="${p.ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
    const band = nar ? 14 : 18, n = Math.max(6, Math.round(cw / 26)), step = cw / n;
    let sc = `M${x0} ${y0 + band}`;
    for (let i = 0; i < n; i++) sc += ` a${(step / 2).toFixed(2)} 6 0 0 0 ${step.toFixed(2)} 0`;
    sc += ` V${y0 + 10} a10 10 0 0 0 -10 -10 H${x0 + 10} a10 10 0 0 0 -10 10Z`;
    const card = `M${x0 + 12} ${y0}H${x0 + cw - 12}a12 12 0 0 1 12 12V${y1 - 12}a12 12 0 0 1 -12 12H${x0 + 12}a12 12 0 0 1 -12 -12V${y0 + 12}a12 12 0 0 1 12 -12Z`;
    const star = 'M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z';
    const stx = x0 + cw - 4, sty = y0 + 2;
    L.root.innerHTML = `<g data-k="rise"><g transform="translate(3 4)" fill="${p.shadow}"><rect x="${cx - 5}" y="${y1 - 4}" width="10" height="${(bottom - y1).toFixed(1)}" rx="4"/></g>`
      + `<rect x="${cx - 5}" y="${y1 - 4}" width="10" height="${(bottom - y1).toFixed(1)}" rx="4" fill="${p.wood}" ${OL}/><rect x="${cx - 2.5}" y="${y1 + 2}" width="3" height="${(bottom - y1).toFixed(1)}" rx="1.5" fill="${p.woodHi}" opacity="0.8"/>`
      + `<g data-k="card" class="o55fm-wobble"><path d="${card}" transform="translate(3 4)" fill="${p.shadow}"/>`
      + `<path d="${card}" fill="${p.paper}" ${OL}/><path d="${sc}" fill="${p.sun}" stroke="${p.ink}" stroke-width="1.6" stroke-linejoin="round"/>`
      + txt(f, cx, y0 + band + (nar ? 15 : 20), T('card.friendly.kicker'), nar ? 9.5 : 11, { fill: p.ink })
      + txt(f, cx, y0 + band + (nar ? 38 : 50), w.from, nar ? 20 : 27, { fill: p.ink, w: 700 })
      + txt(f, cx, y1 - (nar ? 8 : 12), T('card.friendly.next', { chapter: w.to }), nar ? 9 : 10.5, { fill: p.ink, w: 500 })
      + `<g transform="translate(${stx} ${sty})"><g data-k="star" class="o55fm-spin"><path d="${star}" transform="translate(2 3)" fill="${p.shadow}"/><path d="${star}" fill="${p.peach}" ${OL}/></g></g></g></g>`;
    const P = hooks.p, c0 = hooks.c0, dist = (bottom - y0 + 10).toFixed(1);
    const rise = part(L, 'rise');
    P.anim(rise, [{ transform: `translateY(${dist}px)` }, { transform: 'translateY(0px)' }], { duration: 520, delay: c0, easing: 'cubic-bezier(0.34, 1.45, 0.64, 1)', fill: 'backwards' });
    const land = c0 + 250;
    P.at(land, hooks.land);
    P.at(land + 10, () => play('land', { voice: 1, pan: 0 }));
    P.anim(part(L, 'card'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)', offset: 0.3 }, { transform: 'rotate(2.5deg)', offset: 0.62 }, { transform: 'rotate(-1deg)', offset: 0.85 }, { transform: 'rotate(0deg)' }],
      { duration: 760, delay: c0 + 300, easing: 'ease-in-out' });
    P.anim(part(L, 'star'), [{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(200deg) scale(1.35)', offset: 0.5 }, { transform: 'rotate(360deg) scale(1)' }], { duration: 620, delay: c0 + 460, easing: 'ease-out' });
    const duck = c0 + 1420;
    P.anim(rise, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-12px)', offset: 0.28 }, { transform: `translateY(${dist}px)` }], { duration: 400, delay: duck, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' });
    return duck + 420;
  };
  /* Glass: a beam comes on, a frosted plate rises into focus under it and is lit by a streak sweeping across it, light
     motes rise off its edge; then the beam goes out and the plate floats away out of focus */
  CARD.glass = function glassCard(L, V, nar, w, hooks) {
    const p = L.ctx.pal, f = 'glass', u = L.ctx.uid;
    const cw = nar ? Math.min(390, V.w - 40) : Math.min(268, V.w - 40), ch = nar ? Math.min(82, V.h - 22) : 112;
    const cx = V.x + V.w / 2, cy = nar ? V.y + V.h / 2 : V.y + V.h * 0.31;
    const x0 = cx - cw / 2, y0 = cy - ch / 2, y1 = y0 + ch;
    const top = V.y - 10, beam = `M${cx - 26} ${top}H${cx + 26}L${x0 + cw + 14} ${y0 + ch * 0.5}H${x0 - 14}Z`;
    let motes = '';
    for (let i = 0; i < 10; i++) { const mx = x0 + 22 + ((cw - 44) * ((i * 37) % 10)) / 9, r = 1.5 + (i % 3) * 0.6; motes += `<g data-k="mote" transform="translate(${mx.toFixed(1)} ${(y0 + 2).toFixed(1)})"><g><circle r="${(r * 3.2).toFixed(1)}" fill="${L.ctx.url('glow-' + ['lav', 'pink', 'mint'][i % 3])}"/><circle r="${r.toFixed(1)}" fill="${p.core}"/></g></g>`; }
    L.root.innerHTML = `<path data-k="beam" d="${beam}" fill="${L.ctx.url('beam')}"/>`
      + `<g data-k="plate" class="o55fm-focus"><ellipse cx="${cx}" cy="${cy}" rx="${(cw * 0.62).toFixed(1)}" ry="${(ch * 0.9).toFixed(1)}" fill="${L.ctx.url('glow-lav')}"/>`
      + `<rect x="${x0}" y="${y0}" width="${cw}" height="${ch}" rx="16" fill="${L.ctx.url('glass')}" stroke="${L.ctx.url('edge')}" stroke-width="1.4"/>`
      + `<path d="M${x0 + 14} ${y0 + 5}H${x0 + cw * 0.45}" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.4" stroke-linecap="round"/>`
      + `<g clip-path="url(#${u}-plateclip)"><rect data-k="streak" x="${x0 - 70}" y="${y0 - 20}" width="46" height="${ch + 40}" fill="url(#${u}-streak)" transform="rotate(14 ${x0} ${cy})"/></g>`
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
    P.anim(part(L, 'streak'), [{ transform: `rotate(14deg) translateX(0px)` }, { transform: `rotate(14deg) translateX(${(cw + 150).toFixed(1)}px)` }], { duration: 460, delay: c0 + 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' });
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
        + (L.ctx.fam.props.helper && V.h > 420 ? [-1, 0, 1].map((k, i) => `<g data-k="sprite" transform="translate(${cx + k * 62} ${ty + 286})">${L.ctx.fam.props.helper(L.ctx, { x: 0, y: 0, s: 1, opts: { variant: i, pose: i === 1 ? 'wave' : 'stand', px: 5 } })}</g>`).join('') : '');
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
    /* the troupe's sprites jump on the tally, one pixel step up and down, one after another */
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
     notes of the chord, a rest, then they rise on the resolving sting with the family's finale and its celebration;
     h2 points at the tour button (the composition), and the rail walks to READY and re-stamps every check. The
     finale's emblem is part of Ready's composition (57-scenes-journey.js, A.famCall.emblems), so Reduced Motion and a
     reopened window show it; the call holds it back until the rise. */
  const CC = { bows: [1000, 1150, 1300], rest: 1480, rise: 1640, end: 2500 };
  function curtainCall(f, sting) {
    const st = stageEl(), svg = sceneOf(st), R = runState(), s = O55.S; if (!svg || !s) return false;
    const p = perf('call'), hs = helpersOf(svg), els = hs.map(body).filter(Boolean), bows = new Map();
    R.calling = true;
    const em = (k) => [...svg.querySelectorAll(`.o55-it[data-key^="fm-${k}"]`)].map(body).filter(Boolean);
    let rose = false;
    const rise = () => {
      if (rose) return; rose = true;
      if (sting) play('chapter', { chapter: 'ready', depth: 4, intensity: 0.85 });
    };
    p.end(() => { if (!quiet) rise(); R.calling = false; els.forEach((el) => markBody(el, false)); if (f === 'retro') tally(svg, 1, true); if (!quiet && s.railHold) { s.railHold = null; O55.ui.renderRail(); } });
    p.at(170, () => railWalk(f, () => restamp(f)));
    /* the finale's emblem waits for the rise (Glass's spotlights come on one by one with the bows) */
    const finale = FINALE[f](p, svg, em, els);
    p.end(() => { if (!quiet && s.railHold) { s.railHold = null; O55.ui.renderRail(); } });
    hs.forEach((g, i) => {
      const el = els[i]; if (!el) return;
      p.at(CC.bows[i] != null ? CC.bows[i] : CC.bows[2] + (i - 2) * 150, () => {
        bows.set(el, bowDown(p, f, el, 0, true));
        watch(svg, 900);
        play('bow', Object.assign(voice(g), { chapter: 'ready' }));
        if (finale.bow) finale.bow(i);
      });
    });
    p.at(CC.rest, () => { if (O55.sound.rest) O55.sound.rest(150); });
    p.at(CC.rise, () => {
      els.forEach((el) => { const a = bows.get(el); if (a) a.cancel(); bowUp(p, f, el); });
      watch(svg, 900);
      rise();
      if (finale.rise) finale.rise();
      /* the celebration 140 ms after the resolving sting, so it layers on it (sparkles) instead of replacing it */
      p.at(140, () => { if (A.celebrate) A.celebrate(st, { big: true, count: f === 'friendly' ? 30 : 38, at: [240, f === 'glass' ? 300 : 250] }); });
    });
    p.at(CC.end, () => p.finish());
    return true;
  }
  /* each family's finale: the emblem held back from the first frame (fill: backwards), and what it does at the bows and
     the rise */
  const FINALE = {
    basic(p, svg, em) {
      const s = em('stamp');
      s.forEach((el) => { el.classList.add('o55fm-stamp'); p.anim(el, [{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(0.94)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 160, delay: CC.rise + 80, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)', fill: 'backwards' }); });
      p.end(() => s.forEach((el) => el.classList.remove('o55fm-stamp')));
      return { rise() { p.at(240, () => play('land', { voice: 0, pan: 0 })); } };
    },
    friendly(p, svg, em) {
      const rs = em('rose');
      rs.forEach((el, i) => {
        el.classList.add('o55fm-spin');
        const dx = [-70, 20, 90][i % 3], spin = [-330, 300, -390][i % 3];
        p.anim(el, [{ transform: `translate(${dx}px, 190px) rotate(${spin}deg)`, opacity: 0 }, { transform: `translate(${dx}px, 190px) rotate(${spin}deg)`, opacity: 1, offset: 0.02 },
          { transform: `translate(${(dx * 0.45).toFixed(1)}px, -50px) rotate(${(spin * 0.4).toFixed(0)}deg)`, opacity: 1, offset: 0.55 }, { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1 }],
        { duration: 560, delay: CC.rise + 60 + i * 110, easing: 'cubic-bezier(0.3, 0.1, 0.5, 1)', fill: 'backwards' });
      });
      p.end(() => rs.forEach((el) => el.classList.remove('o55fm-spin')));
      return { rise() { rs.forEach((el, i) => p.at(620 + i * 110, () => play('land', { voice: i, pan: [-0.35, 0, 0.35][i % 3] }))); } };
    },
    glass(p, svg, em, els) {
      const sp = em('spot');
      sp.forEach((el, i) => p.anim(el, IN, { duration: 260, delay: (CC.bows[i] != null ? CC.bows[i] : CC.bows[2]) + 20, easing: 'ease-out', fill: 'backwards' }));
      const cores = els.map((el) => [...el.querySelectorAll('.o55-core')]);
      const flare = (i) => (cores[i] || []).forEach((c) => { c.classList.add('o55fm-flare'); p.anim(c, [{ transform: 'scale(1)' }, { transform: 'scale(2.1)', offset: 0.3 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' }); });
      p.end(() => cores.forEach((cs) => cs.forEach((c) => c.classList.remove('o55fm-flare'))));
      return { bow: flare, rise() { cores.forEach((cs, i) => p.at(i * 70, () => flare(i))); } };
    },
    retro(p, svg, em) {
      const cl = em('clear'), ar = em('arrow'), sc = em('score');
      sc.forEach((el) => p.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: CC.rise + 420, fill: 'backwards' }));
      cl.forEach((el) => p.anim(el, [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: 360, delay: CC.rise + 60, easing: 'steps(9, end)', fill: 'backwards' }));
      ar.forEach((el) => p.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: CC.rise + 520, fill: 'backwards' }));
      tally(svg, 0, false);
      return { rise() { for (let i = 1; i <= 8; i++) p.at(420 + i * 90, () => { tally(svg, i / 8, false); play('phase', { step: i }); }); } };
    }
  };
  /* Retro's score line: SETUP n %, written whole at its end state */
  function tally(svg, k, end) {
    const t = svg && svg.querySelector('.o55-it[data-key="fm-score"] [data-fm="score"]'); if (!t) return;
    const v = T('call.retro.score', { n: end ? 100 : Math.round(100 * k) }).toUpperCase();
    if (t.textContent !== v) t.textContent = v;
  }

  /* the emblems in Ready's composition (asked for by 57-scenes-journey.js for the four families) */
  A.famCall = {
    emblems(ctx) {
      const f = ctx.family, m = A.metrics(f), floor = m.floor, sign = m.signY || 64;
      if (f === 'basic') return [{ key: 'fm-stamp', prop: 'fmStamp', x: 318, y: sign + 34, r: -7, layer: 'front' }];
      if (f === 'friendly') return [[152, floor + 14], [218, floor + 18], [374, floor + 14]].map(([x, y], i) => ({ key: 'fm-rose' + i, prop: 'fmRose', x, y, s: 1.45, r: [-24, 12, 30][i], layer: 'front', opts: { v: i } }));
      if (f === 'glass') return [-1, 0, 1].map((s, i) => ({ key: 'fm-spot' + i, prop: 'fmSpot', x: 240 + s * 112, y: floor + 4, layer: 'back', opts: { v: i, top: 30 - floor, tint: ['lav', 'pink', 'mint'][i] } }));
      if (f === 'retro') return [{ key: 'fm-clear', prop: 'fmClear', x: 240, y: 28, layer: 'front' }, { key: 'fm-score', prop: 'fmScore', x: 240, y: floor + 72, layer: 'front' }, { key: 'fm-arrow', prop: 'fmArrow', x: 402, y: floor - 60, layer: 'front' }];
      return [];
    }
  };
  /* the emblems' drawings, in each family's materials */
  function addProps() {
    const F = A.families;
    if (F.basic && !F.basic.props.fmStamp) F.basic.props.fmStamp = (ctx) => {
      const p = ctx.pal, w = 92;
      return `<g><rect x="${-w / 2}" y="-13" width="${w}" height="26" rx="3" fill="${p.paper}"/><rect x="${-w / 2}" y="-13" width="${w}" height="26" rx="3" fill="${p.accentFill}" stroke="${p.accent}" stroke-width="2"/><rect x="${-w / 2 + 3}" y="-10" width="${w - 6}" height="20" rx="2" fill="none" stroke="${p.accent}" stroke-width="0.8"/>`
        + txt('basic', 0, 4.2, T('call.basic.stamp'), 11, { fill: p.accent, w: 800, ls: 2.4 }) + '</g>';
    };
    if (F.friendly && !F.friendly.props.fmRose) F.friendly.props.fmRose = (ctx, item) => {
      const p = ctx.pal, c = [p.peach, p.lilac, p.sky][((item.opts || {}).v || 0) % 3];
      const OL = `stroke="${p.ink}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
      const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6" rx="4.6" ry="6.4" transform="rotate(${a})" fill="${c}" ${OL}/>`).join('');
      return `<g><path d="M0 4 Q-3 14 -10 22" fill="none" stroke="${p.ink}" stroke-width="3.6" stroke-linecap="round"/><path d="M0 4 Q-3 14 -10 22" fill="none" stroke="${p.mint}" stroke-width="2" stroke-linecap="round"/>`
        + `<path d="M-6 14 q-8 -2 -10 -9 q8 0 10 9Z" fill="${p.mint}" ${OL}/><g transform="translate(2 3)" fill="${p.shadow}"><circle r="10"/></g>${petals}<circle r="3.6" fill="${p.sun}" ${OL}/></g>`;
    };
    if (F.glass && !F.glass.props.fmSpot) F.glass.props.fmSpot = (ctx, item) => {
      const o = item.opts || {}, top = o.top || -440;
      return `<g><path d="M-16 ${top}H16L62 -6H-62Z" fill="${ctx.url('beam')}"/><ellipse cx="0" cy="-4" rx="70" ry="13" fill="${ctx.url('glow-' + (o.tint || 'lav'))}"/>`
        + `<ellipse cx="0" cy="-4" rx="46" ry="7" fill="none" stroke="${ctx.pal.core}" stroke-opacity="0.35" stroke-width="1"/></g>`;
    };
    if (F.retro && !F.retro.props.fmClear) F.retro.props.fmClear = (ctx) => {
      const p = ctx.pal, a = T('call.retro.clear').toUpperCase();
      return `<g>${txt('retro', 2, 2, a, 18, { fill: p.dark ? '#000' : p.dim })}${txt('retro', 0, 0, a, 18, { fill: p.a })}</g>`;
    };
    if (F.retro && !F.retro.props.fmScore) F.retro.props.fmScore = (ctx) => {
      const p = ctx.pal, s = T('call.retro.score', { n: 100 }).toUpperCase();
      return `<g><text data-fm="score" x="0" y="0" text-anchor="middle" font-family="${esc(FONT.retro)}" font-weight="600" font-size="11" fill="${p.c}">${esc(s)}</text></g>`;
    };
    if (F.retro && !F.retro.props.fmArrow) F.retro.props.fmArrow = (ctx) => {
      const p = ctx.pal, k = p.dark ? '#000' : p.ink;
      return `<g class="o55-px-blink">${A.sprite(['kk......', 'kak.....', 'kaak....', 'kaaak...', 'kaaaak..', 'kaaak...', 'kaak....', 'kak.....', 'kk......'], { k, a: p.c }, 3)}</g>`;
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
  /* the overlay a wake starts with, drawn at open() so the first painted frame already shows it: Friendly's closed
     house curtain and its footlights, Glass's dusk veil, Retro's attract screen (Basic starts on its bare sheet) */
  const WAKE0 = {
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
      L.root.innerHTML = `<rect data-k="veil" x="-40" y="${V.y - 40}" width="560" height="${V.h + 80}" fill="${p.dark ? '#07050d' : '#5f4a7c'}" opacity="${p.dark ? 0.8 : 0.5}"/>`;
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
  /* Basic: a parallel rule sweeps down the sheet, construction lines draw on behind it, compass circles mark the heads,
     the ink draws over them (the scene's own entrance), the construction fades, the strings are tensioned one by one */
  WAKE.basic = function basicWake(p, L, svg, marks) {
    const pal = L.ctx.pal, V = vbFull(L.vb), top = V.y - 20, bottom = V.y + V.h + 30;
    const lines = [{ y: A.metrics('basic').barY, x0: 40, x1: 440 }, { y: marks[0].head[1], x0: 52, x1: 428 }, { y: A.metrics('basic').floor, x0: 30, x1: 450 }];
    const faint = `fill="none" stroke="${pal.ink2}" stroke-width="0.7" stroke-linecap="round" pathLength="1"`;
    let tk = '';
    for (let x = 20; x <= 460; x += 10) tk += `M${x} 0V${x % 50 === 0 ? 7 : 4}`;
    const dash = []; for (let y = V.y + 10; y < V.y + V.h - 10; y += 22) dash.push(`M240 ${y.toFixed(0)}V${(y + 12).toFixed(0)}M240 ${(y + 16).toFixed(0)}V${(y + 18).toFixed(0)}`);
    L.root.innerHTML = `<g data-k="cons">${lines.map((l) => `<path data-k="cl" d="M${l.x0} ${l.y.toFixed(1)}H${l.x1}" ${faint}/>`).join('')}`
      + marks.map((m) => `<circle data-k="cc" cx="${m.head[0].toFixed(1)}" cy="${(m.head[1] + 9 * 1.75).toFixed(1)}" r="24" ${faint} transform="rotate(-90 ${m.head[0].toFixed(1)} ${(m.head[1] + 9 * 1.75).toFixed(1)})"/>`
        + `<path data-k="cx" d="M${(m.head[0] - 30).toFixed(1)} ${(m.head[1] + 15.75).toFixed(1)}H${(m.head[0] + 30).toFixed(1)}M${m.head[0].toFixed(1)} ${(m.head[1] - 14).toFixed(1)}V${(m.head[1] + 46).toFixed(1)}" ${faint}/>`).join('')
      + `<path data-k="center" d="${dash.join('')}" ${faint}/></g>`
      + `<g data-k="rule" transform="translate(0 ${top})"><rect x="14" y="-16" width="452" height="16" fill="${pal.paper}" fill-opacity="0.92" stroke="${pal.ink2}" stroke-width="0.8"/>`
      + `<path d="${tk}" transform="translate(0 -16)" fill="none" stroke="${pal.ink2}" stroke-width="0.7"/><path d="M14 0H466" stroke="${pal.ink}" stroke-width="1.4"/>`
      + `<circle cx="30" cy="-8" r="3" fill="none" stroke="${pal.ink2}" stroke-width="0.8"/><circle cx="450" cy="-8" r="3" fill="none" stroke="${pal.ink2}" stroke-width="0.8"/></g>`;
    const rule = part(L, 'rule'), t0 = 60, dur = 820, at = (y) => t0 + ((y - top) / (bottom - top)) * dur;
    p.anim(rule, [{ transform: `translate(0px, ${top}px)` }, { transform: `translate(0px, ${bottom}px)` }], { duration: dur, delay: t0, easing: 'linear', fill: 'both' });
    parts(L, 'cl').forEach((el, i) => { const t = at(lines[i].y); p.anim(el, DRAW, { duration: 240, delay: t, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }); p.at(t, () => play('phase', { step: i * 2 })); });
    parts(L, 'cc').forEach((el, i) => p.anim(el, DRAW, { duration: 300, delay: 300 + i * 120, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }));
    parts(L, 'cx').forEach((el, i) => p.anim(el, DRAW, { duration: 220, delay: 380 + i * 120, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }));
    p.anim(part(L, 'center'), DRAW, { duration: 520, delay: 160, easing: 'linear', fill: 'backwards' });
    p.anim(part(L, 'cons'), OUT, { duration: 420, delay: 1300, easing: 'ease-in', fill: 'forwards' });
    return { strings: 1360, gap: 110 };
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
      p.at(t + 260, () => play('land', voice(el.closest('.o55-it'))));
    });
    watch(svg, 1900);
    return { strings: 0 };
  };
  /* Glass: the beam comes on as the dusk lifts, light runs down each filament into its helper's core, motes rise */
  WAKE.glass = function glassWake(p, L, svg, marks, bodies) {
    const pal = L.ctx.pal, V = vbFull(L.vb);
    /* (from the veil's own opacity: a keyframe of 1 would darken it before it lifts) */
    const veil = part(L, 'veil'), v0 = veil ? +veil.getAttribute('opacity') || 1 : 1;
    p.anim(veil, [{ opacity: v0 }, { opacity: 0 }], { duration: 900, delay: 200, easing: 'cubic-bezier(0.3, 0, 0.3, 1)', fill: 'forwards' });
    p.at(200, () => play('reveal'));
    const beam = svg.querySelector('.o55-it[data-key="stage"] .o55-beam');
    if (beam) p.anim(beam, [{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: 200, easing: 'ease-out', fill: 'backwards' });
    /* the cores and their glows are out until the light reaches them */
    const lit = bodies.map((el) => [...el.querySelectorAll('.o55-core, circle[fill*="glow"]')]);
    let streaks = '';
    marks.forEach((m) => { streaks += `<path data-k="streak" d="M-9 0H9" fill="none" stroke="${pal.core}" stroke-width="2.6" stroke-linecap="round"/>`; });
    let motes = '';
    for (let i = 0; i < 12; i++) { const x = 96 + ((i * 53) % 290), y = Math.min(A.metrics('glass').floor + 10, V.y + V.h - 8), r = 1.4 + (i % 3) * 0.6; motes += `<g data-k="mote" transform="translate(${x} ${y})"><g><circle r="${(r * 3).toFixed(1)}" fill="${L.ctx.url('glow-' + ['lav', 'pink', 'mint'][i % 3])}"/><circle r="${r.toFixed(1)}" fill="${pal.core}"/></g></g>`; }
    L.root.insertAdjacentHTML('beforeend', `<g class="o55fm-travel">${streaks}</g>${motes}`);
    parts(L, 'streak').forEach((el, i) => {
      const m = marks[i], a = m.hook, b = [m.head[0], m.head[1] - 2], ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, t = 450 + i * 150;
      p.anim(el, [{ transform: `translate(${a[0]}px, ${a[1]}px) rotate(${ang.toFixed(1)}deg)`, opacity: 0 }, { opacity: 1, offset: 0.1 }, { transform: `translate(${b[0].toFixed(1)}px, ${b[1].toFixed(1)}px) rotate(${ang.toFixed(1)}deg)`, opacity: 1, offset: 0.92 }, { transform: `translate(${b[0].toFixed(1)}px, ${b[1].toFixed(1)}px) rotate(${ang.toFixed(1)}deg)`, opacity: 0 }],
        { duration: 280, delay: t, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'both' });
      (lit[i] || []).forEach((c) => { c.classList.add('o55fm-flare'); p.anim(c, [{ opacity: 0.1, transform: 'scale(0.5)' }, { opacity: 1, transform: 'scale(1.35)', offset: 0.45 }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, delay: t + 250, easing: 'ease-out', fill: 'backwards' }); });
      p.at(t + 250, () => play('string', Object.assign(voice(bodies[i] && bodies[i].closest('.o55-it')), { step: i })));
    });
    p.end(() => lit.forEach((cs) => cs.forEach((c) => c.classList.remove('o55fm-flare'))));
    parts(L, 'mote').forEach((m, i) => {
      const g = m.firstElementChild, up = 80 + (i % 4) * 22, dx = (i % 2 ? 1 : -1) * (6 + (i % 3) * 5);
      p.anim(g, [{ transform: 'translate(0px, 0px)', opacity: 0 }, { opacity: 0.9, offset: 0.25 }, { transform: `translate(${dx}px, ${-up}px)`, opacity: 0 }], { duration: 1000 + (i % 3) * 160, delay: 900 + i * 60, easing: 'ease-out', fill: 'both' });
    });
    return { strings: 0 };
  };
  /* Retro: attract mode types its title, PRESS START blinks, PLAYER 1, the screen wipes away and the sprites spawn */
  WAKE.retro = function retroWake(p, L, svg, marks, bodies) {
    const pal = L.ctx.pal, tg = part(L, 'title'), sg = part(L, 'start'), pg = part(L, 'player'), panel = part(L, 'panel');
    p.anim(tg, [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }], { duration: 360, delay: 60, easing: 'steps(12, end)', fill: 'both' });
    p.anim(sg, [{ opacity: 1 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.75 }, { opacity: 0 }], { duration: 360, delay: 460, easing: 'steps(1, end)', fill: 'both' });
    p.anim(pg, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: 820, fill: 'both' });
    p.at(820, () => play('select'));
    p.anim(panel, [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)' }], { duration: 180, delay: 960, easing: 'steps(6, end)', fill: 'forwards' });
    p.at(960, () => play('reveal'));
    /* each sprite spawns: a column of pixel blocks drops onto its spot in stepped frames, then the sprite is there */
    const px = A.metrics('retro').helperPx || 7;
    let cols = '';
    marks.forEach((m) => { cols += `<g data-k="col" transform="translate(${m.x - px} ${m.y - 14 * px})">${[0, 1, 2].map((j) => `<rect x="0" y="${-j * 3 * px}" width="${2 * px}" height="${2 * px}" fill="${j ? pal.c : pal.a}"/>`).join('')}</g>`; });
    L.root.insertAdjacentHTML('beforeend', cols);
    parts(L, 'col').forEach((c, i) => {
      const t = 1120 + i * 140, fall = 14 * px - 2 * px;
      p.anim(c, [{ transform: 'translateY(-60px)', opacity: 1 }, { transform: `translateY(${fall}px)`, opacity: 1, offset: 0.99 }, { transform: `translateY(${fall}px)`, opacity: 0 }], { duration: 160, delay: t, easing: 'steps(4, end)', fill: 'both' });
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
    const p = perf('wake');
    cold.p = p;
    const L = cold.L || makeLayer(st, f, svg.getAttribute('viewBox') || '0 0 480 600', famCtx(f, st));
    cold.L = L;
    const hs = helpersOf(svg), bodies = hs.map(body).filter(Boolean);
    bodies.forEach((el) => markBody(el, true));
    p.end(() => { bodies.forEach((el) => markBody(el, false)); endCold(); });
    const marks = heroMarks(f), r = WAKE[f](p, L, svg, marks, bodies) || {};
    /* the strings are tensioned one by one (each helper plucked, its wire ringing on its chord tone) */
    if (r.strings) hs.forEach((g, i) => p.at(r.strings + i * (r.gap || 110), () => { if (A.rig) A.rig.pluck(svg, keyOf(g), { amp: 0.7, dir: i % 2 ? -1 : 1 }); play('string', Object.assign(voice(g), { step: i })); }));
    const h0 = hs.find((g) => keyOf(g) === 'h0');
    p.at(1650, () => { if (h0) { if (A.rig && h0.querySelector('.o55-arm, .o55-wf')) A.rig.cheer(svg, 'h0'); play('cheer', voice(h0)); } });
    p.at(1720, () => play('chapter', { chapter: 'welcome', depth: 0, intensity: 0.45 }));
    p.at(2300, () => p.finish());
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
      if (dir === 'open' && R.cold) { const cold = R.cold; calmFrames(1200).then(() => { if (R.cold === cold && !cold.done && shown()) wake(f, cold); else if (R.cold === cold) endCold(); }); return false; }
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
