/* Concept A — the activity bar. A soft tile sits behind the active panel's icon and glides to the newly chosen icon
   (transform only); groups get breathing room between them; the expanded bar shows names on one line with the tile
   stretched to the full row; a 6 px attention dot marks a panel with something that needs you. The bar's own icons
   are never moved, removed or re-created: this only adds a tile element and data attributes, and takes them away
   again on destroy. */

const BAR_GROUPS = {
  chat: 'workspace', dashboard: 'workspace',
  files: 'project', search: 'project', source: 'project',
  repository_automation: 'automation', docker: 'automation', testing: 'automation', run: 'automation',
  agents: 'communication',
  artifacts: 'system',
  more: 'more',
};
const ATTN_RANK = { failed: 4, blocked: 4, conflict: 3, warn: 2 };

function barAttention() {
  const out = {};
  const scan = (abId, views) => {
    let best = null;
    (views || []).forEach(v => { if (v.attention && (!best || (ATTN_RANK[v.attention.state] || 1) > (ATTN_RANK[best.state] || 1))) best = v.attention; });
    if (best) out[abId] = best;
  };
  if (PMR.data.source) scan('source', PMR.viewsOf(PMR.data.source));
  if (PMR.data.docker) scan('docker', PMR.data.docker.views);
  if (PMR.data.files) scan('files', PMR.data.files.views);
  return out;
}

function ledgerBar(barEl, ctx) {
  const slot = document.getElementById('sidePanelSlot');
  const tile = h('div.pmr-a-tile', { 'aria-hidden': 'true' });
  barEl.insertBefore(tile, barEl.firstChild);
  barEl.classList.add('pmr-a-bar');
  const st = { cur: null, anim: null, collapsed: barEl.classList.contains('collapsed'), timer: 0, raf: 0 };
  const icons = () => Array.from(barEl.querySelectorAll(':scope > .icon'));

  function decorate() {
    let prev = null;
    const attn = barAttention();
    icons().forEach(icon => {
      const id = icon.getAttribute('data-ab-id') || '';
      const g = BAR_GROUPS[id] || 'other';
      const shown = icon.offsetParent !== null && getComputedStyle(icon).display !== 'none';
      if (shown) {
        if (prev && prev !== g) icon.setAttribute('data-pmr-a-gap', '1'); else icon.removeAttribute('data-pmr-a-gap');
        prev = g;
      } else icon.removeAttribute('data-pmr-a-gap');
      const a = attn[id];
      if (a) {
        icon.setAttribute('data-pmr-a-attn', a.state);
        const base = icon.getAttribute('data-pm-hover-detail');
        if (!icon.hasAttribute('data-pmr-a-hover0')) icon.setAttribute('data-pmr-a-hover0', base == null ? '' : base);
        icon.setAttribute('data-pm-hover-detail', a.text + (base ? '. ' + base : ''));
      } else if (icon.hasAttribute('data-pmr-a-attn')) {
        icon.removeAttribute('data-pmr-a-attn');
      }
    });
  }
  function activeIcon() {
    if (!slot || slot.classList.contains('hidden')) return null;
    const t = ctx.activeTarget();
    return t ? barEl.querySelector(`:scope > .icon[data-target="${t}"]`) : null;
  }
  function geom(icon) {
    if (!barEl.classList.contains('collapsed')) return { x: icon.offsetLeft, y: icon.offsetTop, w: icon.offsetWidth, h: icon.offsetHeight };
    const sym = icon.querySelector('.symbol') || icon;
    const size = parseFloat(getComputedStyle(barEl).getPropertyValue('--a-tile')) || 28;
    const cx = icon.offsetLeft + sym.offsetLeft + sym.offsetWidth / 2;
    const cy = icon.offsetTop + sym.offsetTop + sym.offsetHeight / 2;
    return { x: Math.round(cx - size / 2), y: Math.round(cy - size / 2), w: size, h: size };
  }
  function place(animate) {
    const icon = activeIcon();
    icons().forEach(i => { if (i !== icon) i.classList.remove('pmr-a-on'); });
    if (!icon || icon.offsetParent === null) {
      if (st.cur && animate && !reduced()) animateEl(tile, [{ opacity: 1 }, { opacity: 0 }], { duration: M.spec().fast, easing: stepped() ? 'steps(2, end)' : M.spec().ease });
      tile.style.opacity = '0'; st.cur = null; return;
    }
    icon.classList.add('pmr-a-on');
    const g = geom(icon);
    const from = st.cur;
    if (st.anim) { try { st.anim.cancel(); } catch (e) { /* ignore */ } st.anim = null; }
    tile.style.width = g.w + 'px';
    tile.style.height = g.h + 'px';
    tile.style.transform = `translate(${g.x}px, ${g.y}px)`;
    tile.style.opacity = '';
    st.cur = g;
    if (!animate || reduced()) return;
    const f = fam(), s = M.spec();
    if (!from) {
      st.anim = animateEl(tile, stepped() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translate(${g.x}px, ${g.y}px) scale(.82)` }, { opacity: 1, transform: `translate(${g.x}px, ${g.y}px)` }],
        { duration: stepped() ? 90 : s.med, easing: stepped() ? 'steps(2, end)' : s.spring });
      return;
    }
    if (from.x === g.x && from.y === g.y) return;
    if (from.w !== g.w || from.h !== g.h) return;
    const dur = f === 'retro' ? 140 : f === 'nier' ? 180 : f === 'glass' ? 420 : f === 'friendly' ? 380 : 260;
    const ease = f === 'retro' ? 'steps(3, end)' : f === 'nier' ? 'steps(4, end)' : f === 'friendly' ? 'cubic-bezier(.34,1.56,.64,1)' : f === 'glass' ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.3,1.2,.5,1)';
    st.anim = animateEl(tile, [{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${g.x}px, ${g.y}px)` }], { duration: dur, easing: ease });
  }
  /* expanded names arrive with a short stagger */
  function onToggle() {
    const collapsed = barEl.classList.contains('collapsed');
    if (collapsed === st.collapsed) return;
    st.collapsed = collapsed;
    clearTimeout(st.timer);
    tile.style.opacity = '0';
    st.timer = setTimeout(() => { st.cur = null; decorate(); place(true); }, reduced() ? 0 : 230);
    if (!collapsed && !reduced()) {
      const labels = icons().filter(i => i.offsetParent !== null).map(i => i.querySelector('.icon-label')).filter(Boolean);
      labels.forEach((l, i) => animateEl(l, stepped() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }],
        { duration: stepped() ? 60 : M.spec().med, delay: 60 + i * (stepped() ? 12 : 18), easing: stepped() ? 'steps(2, end)' : M.spec().ease, fill: 'backwards' }));
    }
  }
  const mo = new MutationObserver(muts => {
    let toggled = false, list = false;
    muts.forEach(m => { if (m.type === 'attributes' && m.target === barEl) toggled = true; if (m.type === 'childList') list = true; });
    if (toggled) onToggle();
    if (list) { cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(() => { decorate(); place(false); }); }
  });
  mo.observe(barEl, { attributes: true, attributeFilter: ['class'], childList: true });
  const so = new MutationObserver(() => place(true));
  if (slot) so.observe(slot, { attributes: true, attributeFilter: ['class'] });
  const ro = new ResizeObserver(() => { if (st.timer && !reduced()) return; cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(() => place(false)); });
  ro.observe(barEl);
  const onEngine = PMR.state.on(k => { if (k === 'source.engine') decorate(); });

  decorate();
  requestAnimationFrame(() => place(false));
  return {
    panel(target, info) { decorate(); place(!!(info && info.reason === 'switch')); },
    destroy() {
      mo.disconnect(); so.disconnect(); ro.disconnect(); onEngine();
      clearTimeout(st.timer); cancelAnimationFrame(st.raf);
      if (tile.parentNode) tile.parentNode.removeChild(tile);
      barEl.classList.remove('pmr-a-bar');
      icons().forEach(i => {
        i.classList.remove('pmr-a-on');
        i.removeAttribute('data-pmr-a-gap');
        i.removeAttribute('data-pmr-a-attn');
        if (i.hasAttribute('data-pmr-a-hover0')) {
          const base = i.getAttribute('data-pmr-a-hover0');
          if (base) i.setAttribute('data-pm-hover-detail', base); else i.removeAttribute('data-pm-hover-detail');
          i.removeAttribute('data-pmr-a-hover0');
        }
      });
    },
  };
}
