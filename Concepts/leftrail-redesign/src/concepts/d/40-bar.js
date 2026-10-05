/* Activity bar: one tile marks the open panel and glides to the next one (springy in Friendly, a liquid stretch in
   Glass, stepped in Retro, an ink cut in NieR). It is measured from the icon's symbol box, so it is exactly the size of
   the hover tile. The chat and home toggles keep their own colour state. */

function mountBar(barEl) {
  const tile = PMR.h('span.d-abind', { 'aria-hidden': 'true' });
  barEl.insertBefore(tile, barEl.firstChild);
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
  function place(animate) {
    const icon = iconFor(target());
    const r = icon && rectOf(icon);
    if (!r) { tile.classList.remove('is-on'); last = null; return; }
    const to = 'translate(' + r.x + 'px, ' + r.y + 'px)';
    tile.style.width = r.w + 'px'; tile.style.height = r.h + 'px';
    const from = tile.style.transform;
    tile.style.transform = to;
    const wasOn = tile.classList.contains('is-on');
    tile.classList.add('is-on');
    if (!animate || !wasOn || !from || from === to || PMR.motion.reduced()) { last = icon; return; }
    const f = fam();
    const opts = {
      basic: { duration: 260, easing: 'cubic-bezier(.2, .8, .2, 1)' },
      friendly: { duration: 460, easing: 'cubic-bezier(.34, 1.5, .5, 1)' },
      glass: { duration: 520, easing: 'cubic-bezier(.2, 1.1, .3, 1)' },
      retro: { duration: 220, easing: 'steps(4, end)' },
      nier: { duration: 160, easing: 'steps(2, end)' },
    }[f] || { duration: 260, easing: 'ease-out' };
    const frames = f === 'glass'
      ? [{ transform: from }, { transform: from.replace(/\)$/, ') scaleY(1.22)'), offset: .35 }, { transform: to }]
      : [{ transform: from }, { transform: to }];
    tile.animate(frames, opts);
    if (icon !== last) {
      icon.classList.add('d-bump');
      setTimeout(() => icon.classList.remove('d-bump'), 520);
    }
    last = icon;
  }
  const mo = new MutationObserver(() => place(true));
  if (slot) {
    mo.observe(slot, { attributes: true, attributeFilter: ['class'] });
    slot.querySelectorAll(':scope > .side-panel-view').forEach(v => mo.observe(v, { attributes: true, attributeFilter: ['class'] }));
  }
  const mo2 = new MutationObserver(() => requestAnimationFrame(() => place(false)));
  mo2.observe(barEl, { attributes: true, attributeFilter: ['class'], childList: true });
  const ro = window.ResizeObserver ? new ResizeObserver(() => place(false)) : null;
  if (ro) ro.observe(barEl);
  const onResize = () => place(false);
  window.addEventListener('resize', onResize);
  barEl.addEventListener('transitionend', onResize);
  requestAnimationFrame(() => place(false));
  return {
    panel() { place(true); },
    destroy() {
      mo.disconnect(); mo2.disconnect(); if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize); barEl.removeEventListener('transitionend', onResize);
      barEl.querySelectorAll('.d-bump').forEach(i => i.classList.remove('d-bump'));
      tile.remove();
    },
  };
}
