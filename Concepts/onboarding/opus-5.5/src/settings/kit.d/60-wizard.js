/* O55 · guided setup, in the onboarding's voice. Adding an MCP server, a plugin, a skill, a command or a shortcut is a
   few decisions in a row, so it opens the way onboarding does: one window over the dimmed page, the steps as a rail
   across the top, a picture of the progress on the left with what you chose so far, and on the right one question at
   a time (eyebrow, big title, one lead sentence, then the choices), with Back on the left and Continue on the right.
   A choice made on a card flies to the rail, like onboarding's charms, and every step enters with the same staggered
   motion per theme family (Basic slides, Friendly bounces, Glass settles, Retro steps and never scales).
   The window keeps the side panel's lifecycle (Escape, focus return, one overlay at a time). A click on the dimmed
   page nudges the window instead of throwing away what was typed.
   - steps: [{ label, title (words, or draft => words), lead? (the same), icon?, note?, render(draft, api) -> html, collect?(wrap, draft),
     check?(draft) -> '' | 'what is missing', recap?(draft) -> 'short words for "So far"', onShow?(wrap, draft, api) }]
     A step whose choice is a card needs no recap: the card's name is kept for it.
   - PM51.wizard returns { next, back, go(i), draft }; a step's own buttons can call it (a card picks and moves on).
   - PM51.tiles(items) draws choice cards: an icon, a name, one line, a small note and a round check. */
PM51.tiles = (items, { action, cls, multi } = {}) => `<div class="o55g-cards${items.length > 5 ? ' is-many' : ''}${cls ? ' ' + cls : ''}" role="${multi ? 'group' : 'radiogroup'}">${items.map((it, i) => {
  const note = it.done ? (it.doneMeta || 'Already on your list') : it.meta;
  const act = it.done ? `data-action="pm51-disabled" aria-disabled="true" data-disabled-reason="${a(it.doneReason || 'Already on your list.')}"` : `data-action="${a(it.action || action || 'pm51-noop')}"`;
  return `<button type="button" class="o55g-card${it.selected ? ' is-on' : ''}${it.done ? ' is-done' : ''}" role="${multi ? 'checkbox' : 'radio'}" aria-checked="${it.selected ? 'true' : 'false'}" style="--ci:${Math.min(i, 9)}" ${act} ${dataAttrs(it.data)}>`
    + `<span class="o55g-glyph" aria-hidden="true">${icon(it.icon || 'plus')}</span>`
    + `<span class="o55g-cardtext"><span class="o55g-cardtitle">${h(it.title)}</span>${it.text ? `<span class="o55g-cardsub">${h(it.text)}</span>` : ''}${note ? `<span class="o55g-cardmeta">${h(note)}</span>` : ''}</span>`
    + `<span class="o55g-check" aria-hidden="true"></span></button>`;
}).join('')}</div>`;

const o55gBack = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
/* The picture: three rings round the step's icon; the steps sit on the outer ring and the part already walked is drawn
   in the accent, so the picture is the progress, not decoration. */
function o55gArt(n) {
  const R = 104, C = 120;
  const nodes = Array.from({ length: n }, (_, i) => {
    const t = (-90 + i * 360 / n) * Math.PI / 180;
    return `<g class="o55g-node" data-i="${i}" transform="translate(${(C + R * Math.cos(t)).toFixed(1)} ${(C + R * Math.sin(t)).toFixed(1)})"><circle r="6.5"/></g>`;
  }).join('');
  return `<svg class="o55g-orbits" viewBox="0 0 240 240" aria-hidden="true" focusable="false">`
    + `<circle class="o55g-ring o55g-ring-c" cx="${C}" cy="${C}" r="56"/><circle class="o55g-ring o55g-ring-b" cx="${C}" cy="${C}" r="80"/>`
    + `<circle class="o55g-ring o55g-ring-a" cx="${C}" cy="${C}" r="${R}"/>`
    + `<circle class="o55g-progress" cx="${C}" cy="${C}" r="${R}" pathLength="100" transform="rotate(-90 ${C} ${C})"/>${nodes}</svg>`;
}

const o55Wizards = [];
PM51.wizard = ({ title, subtitle = '', eyebrow = '', icon: ic = '', steps, draft = {}, start = 0, finishLabel = 'Finish', onFinish }) => {
  let cur = Math.max(0, Math.min(start, steps.length - 1));
  let wrap = null, win = null, dir = 1, moving = false, queued = 0;
  const recaps = {};
  const reduced = () => motionReduced();
  const api = { draft, step: () => cur, next: () => move(1), back: () => move(-1), go: i => { const to = Math.max(0, Math.min(i, steps.length - 1)); dir = to >= cur ? 1 : -1; cur = to; paint(); } };
  const say = msg => { const box = win && win.querySelector('.o55g-error'); if (box) { box.textContent = msg; box.hidden = !msg; if (msg && !reduced()) box.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260, easing: 'ease-out' }); } };
  function collect() { const s = steps[cur]; if (s.collect) s.collect(wrap, draft); }
  function valid() { const s = steps[cur]; const why = s.check ? s.check(draft) : ''; say(why || ''); return !why; }
  function move(d) {
    if (moving) { queued = d; return false; }
    collect();
    if (d > 0 && !valid()) return false;
    if (d > 0 && cur === steps.length - 1) { const ok = onFinish ? onFinish(draft, wrap) : true; if (ok !== false && wrap && wrap.isConnected) closeDrawerWrap(wrap); return false; }
    const to = Math.max(0, Math.min(cur + d, steps.length - 1)); if (to === cur) return false;
    dir = d > 0 ? 1 : -1; cur = to; paint(); return false;
  }
  /* A card chosen: it takes the check at once, a small token of it flies to the rail, then the step moves on. */
  function charm(card) {
    const name = card.querySelector('.o55g-cardtitle'); if (name) recaps[cur] = name.textContent.trim();
    card.parentElement.querySelectorAll('.o55g-card.is-on').forEach(c => { if (c !== card) { c.classList.remove('is-on'); c.setAttribute('aria-checked', 'false'); } });
    card.classList.add('is-on'); card.setAttribute('aria-checked', 'true');
    const node = win.querySelector(`.o55g-railitem[data-i="${cur}"] .o55g-railnode`);
    if (reduced() || !node) return 0;
    const a0 = card.querySelector('.o55g-glyph').getBoundingClientRect(), b0 = node.getBoundingClientRect();
    const fly = document.createElement('span'); fly.className = 'o55g-fly'; fly.innerHTML = card.querySelector('.o55g-glyph').innerHTML;
    win.appendChild(fly);
    const w0 = win.getBoundingClientRect();
    const sx = a0.left + a0.width / 2 - w0.left, sy = a0.top + a0.height / 2 - w0.top, ex = b0.left + b0.width / 2 - w0.left, ey = b0.top + b0.height / 2 - w0.top;
    const mx = (sx + ex) / 2, my = Math.min(sy, ey) - 70, frames = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex, y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey; frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 - 0.6 * t})`, opacity: i === 12 ? 0.2 : 1 }); }
    const retro = o55gFamily() === 'retro';
    fly.animate(frames, { duration: 520, easing: retro ? 'steps(8, end)' : 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }).onfinish = () => { fly.remove(); node.animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 320, easing: retro ? 'steps(3, end)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)' }); };
    return 380;
  }
  const o55gFamily = () => String(document.documentElement.getAttribute('data-theme') || 'basic-dark').split('-')[0];
  function recapHtml() {
    const done = steps.map((s, i) => ({ s, i, v: i < cur ? (s.recap ? s.recap(draft) : recaps[i]) : '' })).filter(x => x.v);
    if (!done.length) return subtitle ? `<p class="o55g-about">${h(subtitle)}</p>` : '';
    return `<p class="o55g-recap-title">So far</p><ol class="o55g-recap-list">${done.map(x => `<li><span>${h(x.s.label)}</span><strong>${h(x.v)}</strong></li>`).join('')}</ol>`;
  }
  function paintChrome() {
    const n = steps.length;
    win.querySelectorAll('.o55g-railitem').forEach((li, i) => { li.dataset.state = i < cur ? 'done' : i === cur ? 'current' : 'next'; if (i === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    win.querySelectorAll('.o55g-node').forEach((g, i) => { g.dataset.state = i < cur ? 'done' : i === cur ? 'current' : 'next'; });
    const prog = win.querySelector('.o55g-progress'); if (prog) prog.style.strokeDasharray = `${(cur / n * 100).toFixed(2)} 100`;
    const s = steps[cur], em = win.querySelector('.o55g-emblem');
    if (em) { em.innerHTML = icon(s.icon || ic || 'spark'); if (!reduced()) em.animate(o55gFamily() === 'retro' ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'scale(0.82)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], { duration: o55gFamily() === 'retro' ? 240 : 420, easing: o55gFamily() === 'retro' ? 'steps(3, end)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)' }); }
    const rc = win.querySelector('.o55g-recap'); if (rc) rc.innerHTML = recapHtml();
    const primary = win.querySelector('.o55g-primary'); if (primary) primary.innerHTML = `<span>${h(cur === n - 1 ? finishLabel : 'Continue')}</span>${icon(cur === n - 1 ? 'check' : 'arrowRight')}`;
    const back = win.querySelector('.o55g-back'); if (back) { back.style.visibility = cur === 0 ? 'hidden' : ''; back.setAttribute('aria-hidden', cur === 0 ? 'true' : 'false'); back.tabIndex = cur === 0 ? -1 : 0; }
    const note = win.querySelector('.o55g-footnote'); if (note) note.textContent = s.note || (n > 1 ? `Step ${cur + 1} of ${n}` : '');
    const heading = (typeof s.title === 'function' ? s.title(draft) : s.title) || s.label;
    const live = win.querySelector('.o55g-live'); if (live) live.textContent = n > 1 ? `Step ${cur + 1} of ${n}: ${heading}` : heading;
  }
  function paint() {
    if (!wrap || !wrap.isConnected) return;
    const s = steps[cur], pane = win.querySelector('.o55g-pane'), layer = pane.querySelector('.o55g-layer');
    /* the outgoing step leaves as an inert copy while the new one staggers in */
    if (layer.childElementCount && !reduced()) {
      const out = layer.cloneNode(true); out.classList.remove('pm51-panel-body'); out.classList.add('o55g-out'); out.setAttribute('aria-hidden', 'true'); out.inert = true;
      out.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      pane.appendChild(out); out.scrollTop = layer.scrollTop;
      const retro = o55gFamily() === 'retro';
      out.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: retro ? 'none' : `translateX(${-dir * 16}px)` }], { duration: retro ? 160 : 220, easing: retro ? 'steps(2, end)' : 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }).onfinish = () => out.remove();
    }
    const val = v => typeof v === 'function' ? v(draft) : v;
    const heading = val(s.title) || s.label, lead = s.lead != null ? val(s.lead) : (cur === 0 ? subtitle : '');
    layer.innerHTML = `<div class="o55g-content">`
      + `<p class="o55g-eyebrow o55g-st" style="--i:0">${h(eyebrow || title)}</p>`
      + `<h2 class="o55g-title o55g-st" style="--i:1" tabindex="-1">${h(heading)}</h2>`
      + (lead ? `<p class="o55g-lead o55g-st" style="--i:2">${h(lead)}</p>` : '')
      + `<div class="o55g-main o55g-st" style="--i:3">${s.render(draft, api)}</div>`
      + `<p class="o55g-error" role="alert" hidden></p></div>`;
    layer.scrollTop = 0;
    layer.querySelectorAll('.pm51-panel-card').forEach(c => { if (c.querySelector(':scope > .pm51-pc-body > .o55g-cards')) c.classList.add('o55g-group'); });
    /* the question takes focus unless the step asks for typing (the side panel's own focus pass honours this too) */
    if (!layer.querySelector('input:not([type="hidden"]):not(.pm51-dd-native):not([type="search"]), textarea')) layer.querySelector('.o55g-title').setAttribute('data-autofocus', '');
    pane.classList.remove('o55g-entering', 'o55g-in-back'); void pane.offsetWidth;
    if (!reduced()) { pane.classList.add('o55g-entering'); if (dir < 0) pane.classList.add('o55g-in-back'); window.setTimeout(() => pane.classList.remove('o55g-entering', 'o55g-in-back'), 900); }
    paintChrome();
    if (s.onShow) s.onShow(wrap, draft, api);
    /* like onboarding, the window speaks for itself: no app hover tags over its fields and cards */
    win.querySelectorAll('*').forEach(n => n.setAttribute('data-pm-hover-exempt', 'true'));
    requestAnimationFrame(() => {
      const f = layer.querySelector('[data-autofocus], input:not([type="hidden"]):not(.pm51-dd-native):not([type="search"]), textarea') || layer.querySelector('.o55g-title');
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    });
  }
  const opened = PM51.panel({ title, body: '' });
  wrap = opened; win = wrap.querySelector('.drawer');
  wrap.classList.add('o55g-wrap');
  win.className = 'drawer o55g-win';
  win.setAttribute('data-pm-hover-exempt', 'true');
  win.setAttribute('aria-label', title);
  const rail = steps.map((s, i) => `<li class="o55g-railitem" data-i="${i}" data-state="next"><span class="o55g-railnode" aria-hidden="true"></span><span class="o55g-raillabel">${h(s.label)}</span></li>`).join('');
  win.innerHTML = `<header class="o55g-head"><div class="o55g-brand"><span class="o55g-brandicon" aria-hidden="true">${icon(ic || 'spark')}</span><span class="o55g-brandname">${h(title)}</span></div>`
    + `<nav class="o55g-railwrap" aria-label="Steps">${steps.length > 1 ? `<ol class="o55g-rail">${rail}</ol>` : ''}</nav>`
    + `<button type="button" class="o55g-close" data-action="close-overlay" aria-label="${a('Close ' + title)}">${icon('close')}<span>Close</span></button></header>`
    + `<div class="o55g-body"><div class="o55g-stage" aria-hidden="true"><div class="o55g-art">${o55gArt(steps.length)}<span class="o55g-emblem"></span></div><div class="o55g-recap"></div></div>`
    + `<section class="o55g-pane"><div class="o55g-layer pm51-panel-body"></div></section></div>`
    + `<footer class="pm51-panel-foot o55g-foot"><button type="button" class="btn o55g-back" data-callback="${registerAction(() => move(-1))}">${o55gBack}<span>Back</span></button>`
    + `<span class="o55g-footnote"></span><span class="o55g-grow"></span>`
    + `<button type="button" class="btn primary o55g-primary" data-callback="${registerAction(() => move(1))}"><span>Continue</span>${icon('arrowRight')}</button></footer>`
    + `<div class="o55g-live" aria-live="polite" role="status"></div>`;
  /* a click on the dimmed page nudges the window rather than closing it with the answers inside */
  wrap.addEventListener('mousedown', e => {
    if (e.target !== wrap) return;
    e.stopImmediatePropagation();
    if (!reduced()) win.animate([{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 280, easing: 'ease-out' });
  }, true);
  /* a card picks at once and shows it; Enter in a one-line field is Continue */
  win.addEventListener('click', e => {
    const card = e.target.closest('.o55g-card');
    if (!card || card.getAttribute('aria-disabled') === 'true' || !win.querySelector('.o55g-layer').contains(card)) return;
    const hold = card.getAttribute('role') === 'radio' ? charm(card) : 0;
    if (hold) { moving = true; queued = 0; window.setTimeout(() => { moving = false; const q = queued; queued = 0; if (q) move(q); }, hold); }
  }, true);
  win.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    const t = e.target; if (!t.matches || !t.matches('.o55g-layer input:not([type="checkbox"]):not([type="radio"]):not([type="search"])') || t.closest('[data-capture]') || t.classList.contains('pm51-commands-capture')) return;
    e.preventDefault(); move(1);
  });
  wrap._o55Wizard = api;
  o55Wizards.push(api);
  paint();
  return api;
};
/* A card inside a wizard finds its wizard from the element. The wizard's own move is held for the charm, so a card
   handler's next() waits until the token has landed. */
PM51.wizardOf = el => {
  const w = el && el.closest && el.closest('.drawer-wrap'); const api = w && w._o55Wizard; if (!api) return api;
  const card = el.closest && el.closest('.o55g-card');
  if (!card || motionReduced()) return api;
  const at = api.step();
  return Object.assign({}, api, { next: () => window.setTimeout(() => { if (api.step() === at) api.next(); }, 400) });
};
