/* The activity bar in the Lens concept. Collapsed: compact 32 px icons; the active panel sits on a filled square-ish
   tile (--pmr-sel, icon in --pmr-accent) that slides between icons; a 10 px status glyph marks an icon only when its
   panel needs attention (Docker crash loop, Source conflict). Expanded (#activityBar:not(.collapsed), the "Show names"
   setting): a status board about 200 px wide, each item an icon, its name and one status line. The bar's own .icon
   elements are never moved or re-created: this only adds decoration children and one tile, and removes them on destroy. */

const C_AB_NAMES = {
  chat: 'Chat', dashboard: 'Home', files: 'Files', search: 'Search', source: 'Source Control', repository_automation: 'Actions & Pipelines',
  docker: 'Docker Manager', testing: 'Testing', run: 'Debug & Run', agents: 'Agents', artifacts: 'Runtime Artifacts', more: 'More',
};

function cBarStatus(target) {
  const p = PMR.panelFor(target);
  const d = p && PMR.data[p.id];
  if (!d) return null;
  const views = PMR.viewsOf(d);
  const att = views.map(v => v.attention).find(Boolean) || null;
  const failing = d.status && (d.status.state === 'failed' || d.status.state === 'blocked');
  return {
    status: d.status,
    badge: failing ? { state: d.status.state, word: d.status.word } : (att ? { state: att.state, word: att.text } : null),
  };
}

function cMountBar(bar) {
  const tile = h('div.pmr-c-ab-tile', { 'aria-hidden': 'true' });
  const added = [tile];
  bar.appendChild(tile);
  bar.querySelectorAll('.icon[data-ab-id]').forEach(icon => {
    const id = icon.getAttribute('data-ab-id');
    const target = icon.getAttribute('data-target');
    const info = target ? cBarStatus(target) : null;
    const name = C_AB_NAMES[id] || icon.getAttribute('data-pm-hover-label') || icon.getAttribute('title') || id;
    const text = h('span.pmr-c-ab-text', { 'aria-hidden': 'true' },
      h('span.pmr-c-ab-name', { text: name }),
      info && info.status ? h('span.pmr-c-ab-st', { 'data-state': info.status.state }, info.badge ? cGlyph(info.badge, { loud: true }) : null, h('span', { text: info.status.word })) : null);
    icon.appendChild(text);
    added.push(text);
    if (info && info.badge) {
      const b = h('span.pmr-c-ab-badge', { 'data-state': info.badge.state, 'aria-hidden': 'true' }, PMR.glyph(info.badge.state));
      icon.appendChild(b);
      added.push(b);
      icon.setAttribute('data-pmr-c-attention', info.badge.word);
    }
  });
  const slot = PMR.host.slot();
  let raf = 0;
  const sync = animate => {
    const act = slot && !slot.classList.contains('hidden') ? bar.querySelector('.icon.active[data-target]') : null;
    if (!act || !act.offsetParent) { tile.classList.remove('is-on'); return; }
    const br = bar.getBoundingClientRect(), r = act.getBoundingClientRect();
    const x = r.left - br.left, y = r.top - br.top + bar.scrollTop;
    const wasOn = tile.classList.contains('is-on');
    if (!animate || !wasOn) tile.classList.add('is-snap');
    tile.style.width = r.width + 'px';
    tile.style.height = r.height + 'px';
    tile.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    tile.classList.add('is-on');
    if (!animate || !wasOn) { void tile.offsetWidth; tile.classList.remove('is-snap'); }
  };
  const soon = animate => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => sync(animate)); };
  const mo = new MutationObserver(all => {
    const muts = all.filter(m => m.target !== tile && !(m.target.closest && m.target.closest('.pmr-c-ab-text, .pmr-c-ab-badge')));
    if (!muts.length) return;
    if (muts.some(m => m.target === bar && m.attributeName === 'class')) { tile.classList.add('is-snap'); setTimeout(() => sync(false), 0); setTimeout(() => sync(false), 380); return; }
    soon(true);
  });
  mo.observe(bar, { attributes: true, attributeFilter: ['class'], subtree: true });
  if (slot) mo.observe(slot, { attributes: true, attributeFilter: ['class'] });
  const ro = window.ResizeObserver ? new ResizeObserver(() => soon(false)) : null;
  if (ro) ro.observe(bar);
  soon(false);
  return {
    panel() { soon(true); },
    destroy() {
      mo.disconnect(); if (ro) ro.disconnect(); cancelAnimationFrame(raf);
      added.forEach(n => n.remove());
      bar.querySelectorAll('[data-pmr-c-attention]').forEach(i => i.removeAttribute('data-pmr-c-attention'));
    },
  };
}
