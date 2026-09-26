/* O55 · guided setup. Adding an MCP server, a plugin or a skill is a few decisions in a row, not one form: pick what
   to add, say how it connects, check it, then choose what it may do. PM51.wizard opens the kit's side panel with the
   progress rail and walks the steps in place (Back / Next / the finish label), keeping what was typed in `draft`.
   - steps: [{ label, title?, render(draft) -> html, collect?(wrap, draft), check?(draft) -> '' | 'what is missing',
     onShow?(wrap, draft, api) }]
   - PM51.wizard returns { next, back, go(i), draft }; a step's own buttons can call it (a catalog tile picks and moves on).
   - PM51.tiles(items) draws a catalog: each tile a button with an icon, a name, a line and a small note. */
PM51.tiles = (items, { action, cls } = {}) => `<div class="o55-tiles${cls ? ' ' + cls : ''}">${items.map(it => `<button type="button" class="o55-tile${it.selected ? ' is-selected' : ''}${it.done ? ' is-done' : ''}" data-action="${a(it.action || action || 'pm51-noop')}" ${dataAttrs(it.data)} aria-pressed="${it.selected ? 'true' : 'false'}"${it.done ? ` aria-disabled="true" data-disabled-reason="${a(it.doneReason || 'Already on your list.')}"` : ''}><span class="o55-tile-icon">${icon(it.icon || 'plus')}</span><span class="o55-tile-copy"><span class="o55-tile-name">${h(it.title)}</span>${it.text ? `<span class="o55-tile-text">${h(it.text)}</span>` : ''}${it.meta ? `<span class="o55-tile-meta">${h(it.meta)}</span>` : ''}</span></button>`).join('')}</div>`;

const o55Wizards = [];
PM51.wizard = ({ title, subtitle = '', eyebrow = '', icon: ic = '', steps, draft = {}, start = 0, finishLabel = 'Finish', onFinish, size = 'wide' }) => {
  let cur = Math.max(0, Math.min(start, steps.length - 1));
  let wrap = null;
  const api = { draft, next: () => move(1), back: () => move(-1), go: i => { cur = Math.max(0, Math.min(i, steps.length - 1)); paint(); } };
  const say = msg => { const box = wrap && wrap.querySelector('.o55-wiz-error'); if (box) { box.textContent = msg; box.hidden = !msg; } if (msg) showToast('One more thing', msg, 'info', 2600); };
  function collect() { const s = steps[cur]; if (s.collect) s.collect(wrap, draft); }
  function valid() { const s = steps[cur]; const why = s.check ? s.check(draft) : ''; say(why || ''); return !why; }
  function move(d) {
    collect();
    if (d > 0 && !valid()) return false;
    if (d > 0 && cur === steps.length - 1) { const ok = onFinish ? onFinish(draft, wrap) : true; if (ok !== false && wrap && wrap.isConnected) closeDrawerWrap(wrap); return false; }
    cur = Math.max(0, Math.min(cur + d, steps.length - 1)); paint(); return false;
  }
  function paint() {
    if (!wrap || !wrap.isConnected) return;
    const s = steps[cur];
    const body = wrap.querySelector('.pm51-panel-body');
    body.innerHTML = `${s.title ? `<p class="o55-wiz-lead">${h(s.title)}</p>` : ''}${s.render(draft, api)}<p class="o55-wiz-error" role="alert" hidden></p>`;
    body.querySelectorAll(':scope > *').forEach((n, i) => { n.classList.add('pm51-reveal'); n.style.setProperty('--pm51-i', String(i)); });
    body.scrollTop = 0;
    wrap.querySelectorAll('.pm51-hero-rail li').forEach((li, i) => { li.classList.toggle('is-done', i < cur); li.classList.toggle('is-current', i === cur); if (i === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    const foot = wrap.querySelector('.pm51-panel-foot');
    const primary = foot && foot.querySelector('.btn.primary'); if (primary) primary.textContent = cur === steps.length - 1 ? finishLabel : 'Next';
    const back = foot && foot.querySelector('.btn:not(.primary):not([data-action="close-overlay"])'); if (back) back.style.display = cur === 0 ? 'none' : '';
    if (s.onShow) s.onShow(wrap, draft, api);
    requestAnimationFrame(() => { const f = body.querySelector('[data-autofocus], input:not([type="hidden"]):not(.pm51-dd-native), textarea'); if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } } });
  }
  wrap = PM51.panel({
    title, subtitle, eyebrow, icon: ic, size, steps: { items: steps.map(s => s.label), current: cur },
    body: '', primaryLabel: cur === steps.length - 1 ? finishLabel : 'Next', onPrimary: () => move(1), secondaryLabel: 'Back', onSecondary: () => move(-1)
  });
  wrap._o55Wizard = api;
  o55Wizards.push(api);
  paint();
  return api;
};
/* A tile inside a wizard finds its wizard from the element. */
PM51.wizardOf = el => { const w = el && el.closest && el.closest('.drawer-wrap'); return w && w._o55Wizard; };
