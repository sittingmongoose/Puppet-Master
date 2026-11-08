/* Activity bar: one tile marks the open panel and glides to the next one (springy in Friendly, a liquid stretch in
   Glass, stepped in Retro, an ink cut in NieR). It is measured from the icon's symbol box, so it is exactly the size of
   the hover tile, and it follows the bar while the bar widens or narrows. The Chat switch takes a tile of its own, the
   same tile, lit in place while the chat column is shown (Jared, 2026-10-14: the chat button says the chat is shown,
   like the rest of the bar); it sits where the chat icon sits and never glides, since it marks a column and not the open
   panel. The More tray opens as PMR.menu (41-more.js). */

function mountBar(barEl) {
  /* FO-96 round 8: the key focus ring of the bar's tiles, one element above every layer of the page; CSS places it on the
     focused tile and shows it (80-bar.src.css), so nothing here decides whether it shows or where. */
  const ring = document.getElementById('d-abring') || document.body.appendChild(PMR.h('i.d-abring', { id: 'd-abring', 'aria-hidden': 'true' }));
  /* Round 9 (opus-recheck-f96h): outside the bar, the ring is not clipped by the bar's scroll box, so with the bar
     scrolled until the key-focused tile is partly out of it, the whole ring was drawn over what lies beyond (the title
     bar's logo, names shown at 1280x500). It is clipped to the scroll box here, as the tile's own outline was, rather than
     hidden: a tile cut by a few pixels keeps its mark on what shows (CSS hides it, position-visibility, once the tile is
     wholly out). Read only while a tile of the bar has a key focus, when the bar scrolls or changes size or the focus moves
     in it; for a pointer it is one selector match. The clip is measured on the ring's own box, which CSS lays on the
     tile's layout box: the tile's own transforms (Glass lifts an opened tile by 1.08 after the press) move neither the ring
     nor the clip, where measured on the tile it went stale (round 10). The tile's size can still ease (Glass grows an
     opened tile to 1.08, which the anchor follows): it is measured again when a transition or animation in the bar ends,
     and when the focused tile's own running animations finish (no timer, nothing for a pointer). */
  const waited = typeof WeakSet === 'function' ? new WeakSet() : null;
  const clipRing = () => {
    const a = document.activeElement, on = !!a && a !== barEl && barEl.contains(a) && a.matches('.icon:focus-visible');
    let v = '';
    if (on) {
      if (waited && a.getAnimations) a.getAnimations({ subtree: true }).forEach(x => {
        if (waited.has(x) || x.playState === 'finished' || !x.finished) return;
        const end = x.effect && x.effect.getComputedTiming ? x.effect.getComputedTiming().endTime : Infinity;
        if (!isFinite(end)) return;
        waited.add(x); x.finished.then(clipRing, clipRing);
      });
      const t = ring.getBoundingClientRect(), b = barEl.getBoundingClientRect();
      const top = b.top + barEl.clientTop, left = b.left + barEl.clientLeft, cut = [top - t.top, t.right - (left + barEl.clientWidth), t.bottom - (top + barEl.clientHeight), left - t.left].map(x => Math.max(0, x));
      if (cut.some(x => x > 0.5)) v = 'inset(' + cut.map(x => x.toFixed(1) + 'px').join(' ') + ')';
    }
    if (ring.style.clipPath !== v) ring.style.clipPath = v;
  };
  barEl.addEventListener('scroll', clipRing, { passive: true });
  barEl.addEventListener('focusin', clipRing);
  barEl.addEventListener('keydown', clipRing);   /* a key turns :focus-visible on for a pointer-focused tile */
  barEl.addEventListener('transitionend', clipRing); barEl.addEventListener('animationend', clipRing);
  if (window.ResizeObserver) new ResizeObserver(clipRing).observe(barEl);
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
    const opts = {
      basic: { duration: 260, easing: 'cubic-bezier(.2, .8, .2, 1)' },
      friendly: { duration: 460, easing: 'cubic-bezier(.34, 1.5, .5, 1)' },
      glass: { duration: 520, easing: 'cubic-bezier(.2, 1.1, .3, 1)' },
      retro: { duration: 220, easing: 'steps(4, end)' },
    }[f] || { duration: 260, easing: 'ease-out' };
    const frames = f === 'glass'
      ? [{ transform: from }, { transform: from.replace(/\)$/, ') scaleY(1.22)'), offset: .35 }, { transform: to }]
      : [{ transform: from }, { transform: to }];
    tile.animate(frames, opts).id = 'd-glide';
    if (icon !== last) {
      icon.classList.add('d-bump');
      setTimeout(() => icon.classList.remove('d-bump'), 520);
    }
    last = icon;
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
