/* Activity bar: one tile marks the open panel and glides to the next one (springy in Friendly, a liquid stretch in
   Glass, stepped in Retro, an ink cut in NieR). It is measured from the icon's symbol box, so it is exactly the size of
   the hover tile, and it follows the bar while the bar widens or narrows. The Chat switch takes a tile of its own, the
   same tile, lit in place while the chat column is shown (Jared, 2026-10-14: the chat button says the chat is shown,
   like the rest of the bar); it sits where the chat icon sits and never glides, since it marks a column and not the open
   panel. The More tray opens as PMR.menu (41-more.js). */

function mountBar(barEl) {
  /* FO-96 round 8: the key focus ring of the bar's tiles, one element above every layer of the page; CSS places it on the
     focused tile and shows it (80-bar.src.css), so nothing here decides whether it shows or where. */
  /* Rounds 9-11: outside the bar, the ring is not clipped by the bar's scroll box. It lies in a frame on that scroll box
     (.d-abclip, clip-path: inset(0); CSS places it on the bar, 80-bar.src.css), and the frame clips it: a clip-path
     clips its fixed descendants (it is not their containing block, so the ring's anchor still resolves), on the
     compositor, so a fast wheel never shows the ring past the scroll box. Round 9 set the ring's own clip-path from
     here on the bar's scroll, a frame or more behind the compositor (opus-recheck-f96i F3). Nothing here reads. */
  if (!document.getElementById('d-abring')) {
    const clip = document.getElementById('d-abclip') || document.body.appendChild(PMR.h('i.d-abclip', { id: 'd-abclip', 'aria-hidden': 'true' }));
    clip.appendChild(PMR.h('i.d-abring', { id: 'd-abring', 'aria-hidden': 'true' }));
  }
  const tile = PMR.h('span.d-abind', { 'aria-hidden': 'true' });
  barEl.insertBefore(tile, barEl.firstChild);
  const chatTile = PMR.h('span.d-abind.d-abind-chat', { 'aria-hidden': 'true' });
  barEl.insertBefore(chatTile, tile.nextSibling);
  let last = null;
  const slot = document.getElementById('sidePanelSlot');
  const target = () => {
    if (!slot || slot.classList.contains('hidden')) return null;
    const p = slot.querySelector(':scope > .side-panel-view.active');
    return p ? p.id : null;
  };
  const iconFor = id => (id ? barEl.querySelector('.icon[data-target="' + id + '"]') : null);
  function rectOf(icon) {
    const sym = icon.querySelector('.symbol') || icon;
    const b = barEl.getBoundingClientRect(), r = sym.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return { x: r.left - b.left + barEl.scrollLeft, y: r.top - b.top + barEl.scrollTop, w: r.width, h: r.height };
  }
  /* the Chat switch: lit while its icon is (46-chat.js syncRailEntry keeps .active on it while the column shows, folded
     to a strip included); it fades in on the icon with the open panel's bump and fades out in place */
  const chatIcon = () => barEl.querySelector(':scope > .icon[data-ab-id="chat"]');
  /* only a change of the lit state moves the tile (hover and bump classes come and go on the same icon); the icon is
     watched from the first time it is on the bar, so one restored from the More tray is watched too */
  const chatLit = () => { const ic = chatIcon(); return !!(ic && ic.classList.contains('active')); };
  const chatMo = new MutationObserver(() => { if (chatLit() !== chatTile.classList.contains('is-on')) placeChat(true); });
  let chatWatched = null;
  function placeChat(animate) {
    const icon = chatIcon();
    if (icon && icon !== chatWatched) { chatMo.observe(icon, { attributes: true, attributeFilter: ['class'] }); chatWatched = icon; }
    const r = icon && icon.classList.contains('active') && rectOf(icon);
    if (!r) { chatTile.classList.remove('is-on'); return; }
    chatTile.style.width = r.w + 'px'; chatTile.style.height = r.h + 'px';
    chatTile.style.transform = 'translate(' + r.x + 'px, ' + r.y + 'px)';
    if (chatTile.classList.contains('is-on')) return;
    chatTile.classList.add('is-on');
    if (!animate || PMR.motion.reduced() || fam() === 'nier') return;   /* NieR cuts: the ink tile is simply there */
    icon.classList.add('d-bump');
    setTimeout(() => icon.classList.remove('d-bump'), 520);
  }
  function place(animate) {
    placeChat(animate);
    const icon = iconFor(target());
    const r = icon && rectOf(icon);
    if (!r) { tile.classList.remove('is-on'); last = null; return; }
    const to = 'translate(' + r.x + 'px, ' + r.y + 'px)';
    tile.style.width = r.w + 'px'; tile.style.height = r.h + 'px';
    const from = tile.style.transform;
    tile.style.transform = to;
    const wasOn = tile.classList.contains('is-on');
    tile.classList.add('is-on');
    if (!animate || !wasOn || !from || from === to || PMR.motion.reduced()) {
      /* placed without motion somewhere new (the bar widened, an icon moved): a glide still heading for the old place
         would hold the tile there until it ends, so it stops */
      if (from && from !== to) tile.getAnimations().forEach(a => { if (a.id === 'd-glide') a.cancel(); });
      last = icon; return;
    }
    const f = fam();
    if (f === 'nier') {
      /* NieR cuts: the ink tile is simply on the new icon, with one hard blink */
      tile.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'steps(2, end)' });
      last = icon; return;
    }
    let opts = {
      basic: { duration: 260, easing: 'cubic-bezier(.2, .8, .2, 1)' },
      friendly: { duration: 460, easing: 'cubic-bezier(.34, 1.5, .5, 1)' },
      glass: { duration: 520, easing: 'cubic-bezier(.2, 1.1, .3, 1)' },
      retro: { duration: 220, easing: 'steps(4, end)' },
    }[f] || { duration: 260, easing: 'ease-out' };
    let frames = f === 'glass'
      ? [{ transform: from }, { transform: from.replace(/\)$/, ') scaleY(1.22)'), offset: .35 }, { transform: to }]
      : [{ transform: from }, { transform: to }];
    /* stream F batch 9 (Jared 2026-11-08, F1 and B1): the tile is the look's switcher chip (its tokens), so it moves as the
       chip does: Basic's block snaps in 110 ms; Friendly's sticker hops on a low arc toward the light (up and left), tilts
       2 deg and lands with a squash (glass.js carry, the same keyframes) */
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(from);
    let path = null;
    if (f === 'basic') { opts = { duration: 110, easing: 'cubic-bezier(.2, 0, 0, 1)' }; path = u => u; }
    if (f === 'friendly' && m) {
      const x0 = +m[1], y0 = +m[2], T = (x, y, a, sx, sy) => 'translate(' + x + 'px, ' + y + 'px) rotate(' + a + 'deg) scale(' + sx + ', ' + sy + ')';
      frames = [{ transform: T(x0, y0, 0, 1, 1) }, { transform: T((x0 + r.x) / 2 - 2, (y0 + r.y) / 2 - 2, -2, 1, 1), offset: .45 }, { transform: T(r.x, r.y, 0, 1.06, .9), offset: .8 }, { transform: T(r.x, r.y, 0, 1, 1) }];
      opts = { duration: 440, easing: 'cubic-bezier(.3, .7, .4, 1)' };
      path = u => (u <= .45 ? .5 * u / .45 : u <= .8 ? .5 + .5 * (u - .45) / .35 : 1);
    }
    tile.animate(frames, opts).id = 'd-glide';
    if (path && m && last && last !== icon) inkHold(icon, +m[2], r, opts, path);
    if (icon !== last) {
      icon.classList.add('d-bump');
      setTimeout(() => icon.classList.remove('d-bump'), 520);
    }
    last = icon;
  }
  /* The lit icon's ink is the chip's (--pm-switch-mark-on: white on Basic Light's blue, dark on Friendly Dark's mint), not
     the bar's, so the icon headed for keeps its unlit ink until the tile is half on it (the time from the tile's own path).
     The icon left takes its unlit ink at once: held lit, a panel switch that holds the main thread right after the click
     kept it in the chip's ink on the bare bar (dark on Friendly Dark's bar) for the length of the hold, where the unlit
     ink on the leaving tile reads in every frame. */
  const bez = (p1x, p1y, p2x, p2y) => x => {
    let lo = 0, hi = 1, t = x;
    const X = t => 3 * p1x * t * (1 - t) * (1 - t) + 3 * p2x * t * t * (1 - t) + t * t * t;
    for (let i = 0; i < 24; i++) { const v = X(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return 3 * p1y * t * (1 - t) * (1 - t) + 3 * p2y * t * t * (1 - t) + t * t * t;
  };
  function inkHold(now, y0, r, opts, path) {
    const e = /cubic-bezier\(([^)]+)\)/.exec(opts.easing), ease = e ? bez.apply(null, e[1].split(',').map(Number)) : (u => u);
    const half = r.h / 2, at = k => y0 + (r.y - y0) * path(ease(k));
    let tNew = 0;
    for (let i = 0; i <= 60 && !tNew; i++) { const k = i / 60; if (Math.abs(at(k) - r.y) < half) tNew = k * opts.duration; }
    const rest = barEl.querySelector(':scope > .icon[data-target]:not(.active):not(.pmh-on)');
    const restInk = rest ? getComputedStyle(rest).color : '';
    if (restInk && tNew > 0) now.animate([{ '--pm-switch-mark-on': restInk }, { '--pm-switch-mark-on': restInk }], { duration: tNew });
  }
  const mo = new MutationObserver(() => place(true));
  placeChat(false);
  if (slot) {
    mo.observe(slot, { attributes: true, attributeFilter: ['class'] });
    slot.querySelectorAll(':scope > .side-panel-view').forEach(v => mo.observe(v, { attributes: true, attributeFilter: ['class'] }));
  }
  /* the bar changed (names shown or hidden, icons reordered): place now, before the frame paints, and again next frame */
  const mo2 = new MutationObserver(() => { place(false); requestAnimationFrame(() => place(false)); });
  mo2.observe(barEl, { attributes: true, attributeFilter: ['class'], childList: true });
  const ro = window.ResizeObserver ? new ResizeObserver(() => place(false)) : null;
  if (ro) ro.observe(barEl);
  const onResize = () => place(false);
  window.addEventListener('resize', onResize);
  /* only the bar's own box: every icon's colour transition ends here too (a look change ends dozens at once), and each
     one re-measured the bar after the page had been restyled (35-75 ms a time on the P1000, final motion QA B4) */
  const onBarEnd = ev => { if (ev.target === barEl) place(false); };
  barEl.addEventListener('transitionend', onBarEnd);
  /* the bar widens or narrows (names shown or hidden): the tile rides along every frame of the width transition
     instead of waiting at the old place and jumping when it ends */
  let follow = 0;
  const onWidthRun = ev => {
    if (ev.target !== barEl || ev.propertyName !== 'width') return;
    cancelAnimationFrame(follow);
    const until = performance.now() + 1500;   /* a transition that never reports its end stops being followed */
    const step = () => { place(false); follow = performance.now() < until ? requestAnimationFrame(step) : 0; };
    follow = requestAnimationFrame(step);
  };
  const onWidthEnd = ev => {
    if (ev.target !== barEl || ev.propertyName !== 'width') return;
    cancelAnimationFrame(follow); follow = 0;
    place(false);
  };
  barEl.addEventListener('transitionrun', onWidthRun);
  barEl.addEventListener('transitionend', onWidthEnd);
  barEl.addEventListener('transitioncancel', onWidthEnd);
  const more = lfMountMore();
  requestAnimationFrame(() => place(false));
  return {
    panel() { place(true); },
    destroy() {
      mo.disconnect(); mo2.disconnect(); chatMo.disconnect(); if (ro) ro.disconnect();
      cancelAnimationFrame(follow);
      barEl.removeEventListener('transitionrun', onWidthRun);
      barEl.removeEventListener('transitionend', onWidthEnd);
      barEl.removeEventListener('transitioncancel', onWidthEnd);
      more.destroy();
      window.removeEventListener('resize', onResize); barEl.removeEventListener('transitionend', onBarEnd);
      barEl.querySelectorAll('.d-bump').forEach(i => i.classList.remove('d-bump'));
      tile.remove(); chatTile.remove();
    },
  };
}
