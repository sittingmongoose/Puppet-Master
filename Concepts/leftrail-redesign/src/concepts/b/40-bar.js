/* Concept B — the activity bar. The active icon sits on a filled rounded-square tile with the icon in the accent colour.
   Depth pips: when the active panel is deeper than its summary page, small dots under its icon show how deep (one per
   level), animating in and out with each push and pop. Clicking the active icon while deeper pops to the summary page.
   Expanded ("Show names"): icon + name, and under the active item the page you are on. A dot marks a panel that has
   something waiting for you ("Needs you"), never a noisy count. */

const AB_NAMES = { chat: 'Chat', dashboard: 'Home', files: 'Files', search: 'Search', source: 'Source Control', repository_automation: 'Actions & Pipelines',
  docker: 'Docker', testing: 'Testing', run: 'Debug', agents: 'Agents', artifacts: 'Runtime Artifacts', more: 'More' };

B.barTreatment = function barTreatment(barEl) {
  const made = [];
  const panelOf = icon => PMR.panelFor(icon.getAttribute('data-target') || '');
  const iconFor = id => barEl.querySelector(`.icon[data-target="${(PMR.PANELS.find(p => p.id === id) || {}).target}"]`);
  const attention = id => {
    const d = PMR.data[id]; if (!d) return null;
    const vs = id === 'source' ? PMR.sourceViews() : d.views;
    const a = (vs || []).find(v => v.attention);
    return a ? a.attention : null;
  };
  /* decorate every icon: a name block for the expanded bar, pips and an attention dot for the three panels */
  barEl.querySelectorAll('.icon').forEach(icon => {
    const id = icon.getAttribute('data-ab-id');
    const lbl = icon.querySelector('.icon-label');
    const name = AB_NAMES[id] || icon.getAttribute('data-pm-hover-label') || (lbl ? lbl.textContent.charAt(0) + lbl.textContent.slice(1).toLowerCase() : '');
    const text = h('span.pmr-b-abtext', h('span.pmr-b-abname', { text: name }), h('span.pmr-b-abpage'));
    icon.appendChild(text); made.push(text);
    const p = panelOf(icon);
    if (p) {
      const pips = h('span.pmr-b-pips', { 'aria-hidden': 'true' });
      icon.appendChild(pips); made.push(pips);
      const att = attention(p.id);
      if (att) { const dot = h('span.pmr-b-abdot', { 'data-state': att.state, 'aria-hidden': 'true' }); (icon.querySelector('.symbol') || icon).appendChild(dot); made.push(dot); }
    }
  });
  function setPips(id, animate) {
    const icon = iconFor(id); if (!icon) return;
    const st = B.stacks[id];
    const depth = st ? st.depth : 1;
    const pips = icon.querySelector('.pmr-b-pips');
    const page = icon.querySelector('.pmr-b-abpage');
    if (page) { page.textContent = depth > 1 && st ? st.top().desc.title : ''; icon.classList.toggle('pmr-b-deep', depth > 1); }
    if (st && depth > 1) icon.setAttribute('data-pmr-depth', String(depth)); else icon.removeAttribute('data-pmr-depth');
    if (!pips) return;
    const want = Math.max(0, Math.min(depth - 1, 4));
    const have = Array.from(pips.children).filter(x => !x.classList.contains('is-out'));
    for (let i = have.length; i < want; i++) {
      const pip = h('span.pmr-b-pip');
      pips.appendChild(pip);
      if (animate) anim(pip, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { dur: 'med', ease: 'spring', delay: (i - have.length) * 40 });
    }
    for (let i = have.length - 1; i >= want; i--) {
      const pip = have[i]; pip.classList.add('is-out');
      const a = animate ? anim(pip, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { dur: 'fast', ease: 'ease', fill: 'forwards' }) : null;
      if (a) a.onfinish = () => pip.remove(); else pip.remove();
    }
  }
  /* clicking the active icon while deeper than the summary page pops to the summary page */
  const onClick = ev => {
    const icon = ev.target.closest && ev.target.closest('.icon[data-target]');
    if (!icon || !barEl.contains(icon) || !icon.classList.contains('active')) return;
    const p = panelOf(icon); if (!p) return;
    const slot = document.getElementById('sidePanelSlot');
    const st = B.stacks[p.id];
    if (!st || st.depth <= 1 || !slot || slot.classList.contains('hidden')) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    st.popToRoot();
  };
  barEl.addEventListener('click', onClick, true);
  PMR.PANELS.forEach(p => setPips(p.id, false));
  const api = {
    update(id) { setPips(id, true); },
    panel(target) {
      PMR.PANELS.forEach(p => setPips(p.id, false));
      const icon = barEl.querySelector(`.icon.active[data-target="${target}"] .symbol`);
      if (icon) anim(icon, [{ transform: 'scale(.84)' }, { transform: 'scale(1)' }], { dur: 'med', ease: 'spring' });
    },
    destroy() {
      barEl.removeEventListener('click', onClick, true);
      made.forEach(n => n.remove());
      barEl.querySelectorAll('[data-pmr-depth]').forEach(n => n.removeAttribute('data-pmr-depth'));
      barEl.querySelectorAll('.pmr-b-deep').forEach(n => n.classList.remove('pmr-b-deep'));
      if (B.bar === api) B.bar = null;
    },
  };
  B.bar = api;
  return api;
};
