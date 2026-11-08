/* Selector indicator concepts: builds the demos from one template, moves each strip's indicator the way its concept
   moves, and measures contrast from the demos' computed colours. No network, no storage needed. */
(function () {
  'use strict';
  /*{{IMGS}}*/
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------------------------------------------------------- icons (stroke icons as the product draws them) */
  const SV = (d, vb) => `<svg viewBox="${vb || '0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  const IC = {
    pip: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4l14 6M19 4L5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="6.5" y="10.5" width="11" height="10" rx="4.5" fill="#7FC4E8" stroke="#3E6E8C" stroke-width="1.2"/><circle cx="10" cy="15" r="1.3" fill="#1E2A33"/><circle cx="14" cy="15" r="1.3" fill="#1E2A33"/></svg>',
    check: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3.2 6.3l1.9 1.9 3.8-4.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: SV('<path d="M6 6l12 12M18 6L6 18"/>'),
    sprout: SV('<path d="M12 21v-8.5M7.5 21h9"/><path d="M12 13.2c0-3.6-2.6-6.2-6.7-6.2 0 3.9 2.7 6.2 6.7 6.2z"/><path d="M12 11.2c0-3.3 2.4-5.6 6.2-5.6 0 3.6-2.4 5.6-6.2 5.6z"/>'),
    folder: SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    restore: SV('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>'),
    explorer: SV('<path d="M6 14L3 21h18l-3-7"/><path d="M6 14V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>'),
    changed: SV('<path d="M12 3v18"/><rect x="3" y="6" width="6" height="12" rx="1"/><rect x="15" y="6" width="6" height="12" rx="1"/>'),
    file: SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>')
  };

  /* ---------------------------------------------------------------- the concepts */
  const CONCEPTS = [
    { id: 'f1', fam: 'fr', code: 'F1', name: 'Sticker', motion: 'hop',
      one: 'The chosen item is a sticker: a solid pastel chip with Friendly’s 2 px ink outline and a hard offset shadow. It hops to the next item and lands with a small squash.',
      why: 'Friendly already looks like a sticker sheet: the window and every card have a 2 px ink outline and a hard offset shadow, and today’s chosen option card already sits on a coral offset. F1 makes every selection that same object, in the colour each surface already uses (mint in the shell, peach in onboarding). <b>Against Glass:</b> opaque and outlined where Glass is clear and rimless; it hops and squashes instead of stretching like liquid.',
      hc: '<b>Windows High Contrast:</b> the sticker fills with the system Highlight colour, its words turn HighlightText, and the outline stays in the text colour. The offset shadow goes, as all shadows do there. Hover keeps its dashed outline and focus its solid ring, both in the text colour.' },
    { id: 'f2', fam: 'fr', code: 'F2', name: 'Pip’s bubble', motion: 'pop',
      one: 'The chosen item is Pip’s speech bubble: opaque, round-cornered, with a tail pointing at what it opened. It pops in where you click, exactly as Pip’s own bubble does.',
      why: 'Pip talks in bubbles: white, softly shadowed, with a small tail, popping in with a springy overshoot (30-art.css <code>.pst-bubble</code>). F2 lets Pip say what is chosen. The chosen tab’s tail points down at the page it opened. Onboarding’s current step points up at its node. The chosen answer becomes your reply bubble, with one tighter corner and a tail. Hover shows a dotted “thought” outline. <b>Against Glass:</b> nothing travels. The old bubble shrinks away and the new one pops up, so it can never read as a lens.',
      hc: '<b>Windows High Contrast:</b> the bubble and its tail fill with Highlight and are outlined in the text colour, so the tail still points at the page. The words turn HighlightText. The dotted hover outline and the focus ring use the text colour.' },
    { id: 'f3', fam: 'fr', code: 'F3', name: 'Marker', motion: 'swipe',
      one: 'The chosen item is coloured in with a butter highlighter inside a hand-drawn pencil outline. Hover sketches the outline; choosing swipes the marker across.',
      why: 'Hand-made and playful: a highlighter swash with uneven corners and a pencil line drawn a little off-register, each tilted a degree or two. In onboarding the chosen card turns butter paper and its title is highlighted. The swash is a fill behind the whole label, not an underline, so it keeps the no-underline rule. <b>Against Glass:</b> the least “interface-like” of the three and the furthest from a lens, both still and moving.',
      hc: '<b>Windows High Contrast:</b> the swash fills with Highlight, the words turn HighlightText, and the pencil outline takes the text colour. The chosen card’s highlighted title does the same.' },
    { id: 'b1', fam: 'ba', code: 'B1', name: 'Solid block', motion: 'snap',
      one: 'One opaque block of Basic’s blue with the label reversed out and square 3 px corners: no tint, hairline, glow or shine. It snaps across in 110 ms without stretching.',
      why: 'The classic selected tab of a desktop tool. Nothing is translucent and nothing is shaded. The words are white in light and Basic’s dark navy in dark. The chosen option row gets a 2 px blue frame, a flat blue tint and a solid blue icon tile, all on 4 px corners. <b>Against Glass:</b> saturated and solid where Glass is clear; a plain linear slide where Glass swells and wobbles.',
      hc: '<b>Windows High Contrast:</b> it maps one to one. The block is Highlight with HighlightText words, exactly how Windows itself draws a selected item.' },
    { id: 'b2', fam: 'ba', code: 'B2', name: 'Pressed key', motion: 'cut',
      one: 'The chosen item looks pressed into the bar: a flat well one step darker than the bar, a grey 1 px keyline, and the label in full black or white, with no accent. It changes at once, with no travel.',
      why: 'The other plain direction: no colour at all. The chosen option row is the same well. Blue appears only on the keyboard focus ring and the radio dot. Hover is a dashed keyline (could be); chosen is the solid well (is). <b>Against Glass:</b> Glass lifts its lens and makes it shine; B2 sinks the item and keeps it matte, and it changes in one frame, like a native toolbar.',
      hc: '<b>Windows High Contrast:</b> it keeps its character. The well takes the window colour with a 2 px Highlight keyline and bold words. Hover is a dashed keyline in the text colour, and focus is a solid ring.' }
  ];

  /* ---------------------------------------------------------------- the demo template (product class names) */
  const PAGES = ['Home', 'Projects', 'Planning Wizard', 'Orchestrator', 'Usage', 'Settings'];
  const STEPS = ['Welcome', 'Computer', 'Project', 'AI', 'Ready'];
  const OPTS = [
    { glyph: 'sprout', title: 'Start a new Project', sub: 'Begin with an empty folder', tag: 'Recommended' },
    { glyph: 'folder', title: 'Use work that already exists', sub: 'A folder, an online Project, or files on another device' },
    { glyph: 'restore', title: 'Restore a Project', sub: 'From a backup' }
  ];
  const SEGS = [['explorer', 'Explorer'], ['changed', 'Changed'], ['file', 'Open']];
  let uid = 0;
  function demoHTML(c, mode) {
    const n = ++uid;
    const tabs = PAGES.map((p, i) => `<span class="page-tab${i === 0 ? ' active' : ''}" role="tab" tabindex="${i === 0 ? 0 : -1}" aria-selected="${i === 0}">${esc(p)}</span>`).join('');
    const steps = STEPS.map((s, i) => `<li class="o55-railitem" data-i="${i}" tabindex="${i === 2 ? 0 : -1}"><span class="o55-railstring" aria-hidden="true"></span><span class="o55-railnode" aria-hidden="true"><i></i></span><span class="o55-raillabel">${esc(s)}</span></li>`).join('');
    const opts = OPTS.map((o, i) => `<div class="o55-opt"><button type="button" class="o55-card${i === 0 ? ' o55-on' : ''}" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="o55-glyph" aria-hidden="true">${IC[o.glyph]}</span><span class="o55-cardtext"><span class="o55-cardtitle">${esc(o.title)}</span><span class="o55-cardsub">${esc(o.sub)}</span></span>${o.tag ? `<span class="o55-tag">${esc(o.tag)}</span>` : '<span></span>'}<span class="o55-check" aria-hidden="true"></span></button><button type="button" class="o55-tipq" aria-label="About ${esc(o.title)}" title="What is this?">?</button></div>`).join('');
    const segs = SEGS.map(([ic, label], i) => `<button type="button" class="pm-segtab-item${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" aria-label="${label}" title="${label}">${IC[ic]}<span>${label}</span></button>`).join('');
    const fam = c.fam === 'fr' ? 'Friendly' : 'Basic';
    return `<figure class="demo ${c.fam} ${mode}" data-mode="${mode}" aria-label="${esc(c.code + ' ' + c.name)}, ${fam} ${mode}">
      <figcaption class="demo-cap">${fam} ${mode === 'light' ? 'Light' : 'Dark'}</figcaption>
      <div class="place"><p class="place-label">Top page selector</p>
        <header class="title-bar"><span class="tb-brand">${IC.pip}Puppet Master</span>
          <nav class="page-tabs" role="tablist" aria-label="Pages (demo ${n})" data-strip="tabs"><span class="ind" aria-hidden="true"></span>${tabs}</nav></header></div>
      <div class="place"><p class="place-label">Onboarding: current step and chosen option</p>
        <div class="o55-win"><div class="o55-head"><span class="o55-brand">${IC.pip}Puppet Master</span>
          <div class="o55-rail" data-strip="steps"><span class="ind" aria-hidden="true"></span><ol class="o55-raillist" aria-label="Steps (demo ${n}); click one to preview the move">${steps}</ol></div>
          <span class="o55-close" aria-hidden="true">${IC.close}</span></div>
          <div class="o55-pane"><div class="o55-kicker">Your Project</div><div class="o55-title">How should your Project begin?</div>
            <div class="o55-opts" role="radiogroup" aria-label="How should your Project begin? (demo ${n})">${opts}</div></div></div></div>
      <div class="place"><p class="place-label">Left rail file tabs</p>
        <div class="side-panel"><div class="pm-segtab" role="tablist" aria-label="File views (demo ${n})" data-strip="seg"><span class="ind" aria-hidden="true"></span>${segs}</div>
          <div class="files" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div></div>
    </figure>`;
  }

  /* ---------------------------------------------------------------- indicator placement and motion */
  const reduced = () => document.body.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STRIP = {
    tabs: { items: '.page-tab', on: (i) => i.classList.contains('active'), target: (i) => i, origin: '14px 100%' },
    steps: { items: '.o55-railitem', on: (i) => i.dataset.state === 'current', target: (i) => i.querySelector('.o55-raillabel'), origin: '50% 0' },
    seg: { items: '.pm-segtab-item', on: (i) => i.classList.contains('active'), target: (i) => i, origin: '14px 100%' }
  };
  function boxOf(strip, el) {
    const s = strip.getBoundingClientRect(), b = el.getBoundingClientRect();
    return { x: b.left - s.left, y: b.top - s.top, w: b.width, h: b.height };
  }
  function setBox(el, b) { el.style.left = b.x + 'px'; el.style.top = b.y + 'px'; el.style.width = b.w + 'px'; el.style.height = b.h + 'px'; }
  const px = (b) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
  function ghostOf(strip, ind, b) { const g = ind.cloneNode(false); g.classList.add('ghost'); strip.insertBefore(g, ind); setBox(g, b); return g; }
  const MOTION = {
    hop(strip, ind, a, b) {
      const base = getComputedStyle(ind).boxShadow, lift = getComputedStyle(ind).getPropertyValue('--lift').trim() || base;
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: (a.w + b.w) / 2, h: (a.h + b.h) / 2 };
      ind.animate([
        Object.assign(px(a), { transform: 'translateY(0)', boxShadow: base }),
        Object.assign(px(m), { offset: 0.45, transform: 'translateY(-6px) rotate(-2deg)', boxShadow: lift }),
        Object.assign(px(b), { offset: 0.8, transform: 'translateY(0) scale(1.06, .9)', boxShadow: base }),
        Object.assign(px(b), { transform: 'none', boxShadow: base })
      ], { duration: 440, easing: 'cubic-bezier(.3,.7,.4,1)' });
    },
    pop(strip, ind, a, b, kind) {
      const g = ghostOf(strip, ind, a); g.style.transformOrigin = STRIP[kind].origin;
      g.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.6)' }], { duration: 140, easing: 'ease-in', fill: 'forwards' }).onfinish = () => g.remove();
      ind.style.transformOrigin = STRIP[kind].origin;
      ind.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, delay: 70, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' });
    },
    swipe(strip, ind, a, b) {
      const full = 'inset(-8px -8px -8px -8px)';
      const g = ghostOf(strip, ind, a);
      g.animate([{ clipPath: full }, { clipPath: 'inset(-8px -8px -8px 110%)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' }).onfinish = () => g.remove();
      ind.animate([{ clipPath: 'inset(-8px 110% -8px -8px)' }, { clipPath: full }], { duration: 300, delay: 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    },
    snap(strip, ind, a, b) { ind.animate([px(a), px(b)], { duration: 110, easing: 'cubic-bezier(.2,0,0,1)' }); },
    cut() {}
  };
  function sync(strip, motion) {
    const kind = strip.dataset.strip, k = STRIP[kind], ind = strip.querySelector(':scope > .ind:not(.ghost)');
    const item = $$(k.items, strip).find(k.on); if (!item || !ind) return;
    const b = boxOf(strip, k.target(item)), a = ind._box;
    ind._box = b; setBox(ind, b);
    ind.getAnimations().forEach((x) => x.cancel());
    if (motion && a && !reduced() && (a.x !== b.x || a.y !== b.y)) MOTION[motion](strip, ind, a, b, kind);
  }
  function choose(strip, item, motion) {
    const kind = strip.dataset.strip, k = STRIP[kind];
    const items = $$(k.items, strip); const idx = items.indexOf(item); if (idx < 0 || k.on(item)) return;
    if (kind === 'steps') items.forEach((it, i) => { it.dataset.state = i < idx ? 'done' : i === idx ? 'current' : 'next'; it.tabIndex = i === idx ? 0 : -1; if (i === idx) it.setAttribute('aria-current', 'step'); else it.removeAttribute('aria-current'); paintNode(it); });
    else items.forEach((it) => { const on = it === item; it.classList.toggle('active', on); it.setAttribute('aria-selected', on); it.tabIndex = on ? 0 : -1; });
    sync(strip, motion);
  }
  function paintNode(li) { const i = li.querySelector('.o55-railnode i'); i.innerHTML = li.dataset.state === 'done' ? IC.check : li.dataset.state === 'current' ? IC.pip : ''; }

  /* ---------------------------------------------------------------- wiring */
  function wire(card, c) {
    $$('[data-strip]', card).forEach((strip) => {
      const k = STRIP[strip.dataset.strip];
      if (strip.dataset.strip === 'steps') $$('.o55-railitem', strip).forEach((li, i) => { li.dataset.state = i < 2 ? 'done' : i === 2 ? 'current' : 'next'; if (i === 2) li.setAttribute('aria-current', 'step'); paintNode(li); });
      strip.addEventListener('click', (e) => { const it = e.target.closest(k.items); if (it && strip.contains(it)) choose(strip, it, c.motion); });
      strip.addEventListener('keydown', (e) => {
        const items = $$(k.items, strip), cur = items.indexOf(document.activeElement.closest(k.items)); if (cur < 0) return;
        let to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (cur + 1) % items.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (cur - 1 + items.length) % items.length;
        else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = items.length - 1;
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(strip, items[cur], c.motion); return; }
        if (to === null) return;
        e.preventDefault(); items[to].focus(); choose(strip, items[to], c.motion);
      });
    });
    $$('.o55-opts', card).forEach((grp) => {
      const pick = (btn) => {
        if (btn.classList.contains('o55-on')) return;
        $$('.o55-card', grp).forEach((b) => { const on = b === btn; b.classList.toggle('o55-on', on); b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; b.classList.remove('just-on'); });
        if (!reduced()) { void btn.offsetWidth; btn.classList.add('just-on'); setTimeout(() => btn.classList.remove('just-on'), 600); }
      };
      grp.addEventListener('click', (e) => { const b = e.target.closest('.o55-card'); if (b) pick(b); });
      grp.addEventListener('keydown', (e) => {
        const cards = $$('.o55-card', grp), cur = cards.indexOf(document.activeElement); if (cur < 0) return;
        let to = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = (cur + 1) % cards.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = (cur - 1 + cards.length) % cards.length;
        if (to === null) return; e.preventDefault(); cards[to].focus(); pick(cards[to]);
      });
    });
  }

  /* ---------------------------------------------------------------- contrast */
  function rgba(s) {
    const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
  function lum(c) { const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]); }
  function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  const cs = (el, p) => getComputedStyle(el, p || null);
  function solidBg(el) { let e = el; while (e) { const c = rgba(cs(e).backgroundColor); if (c && c[3] > 0.99) return c; e = e.parentElement; } return [255, 255, 255, 1]; }
  function edgeOf(ind, ground) {
    const s = cs(ind), out = [];
    const fill = rgba(s.backgroundColor); if (fill && fill[3] > 0) out.push(['fill', ratio(over(fill, ground), ground)]);
    if (parseFloat(s.borderTopWidth) > 0) { const bc = rgba(s.borderTopColor); if (bc && bc[3] > 0) out.push(['outline', ratio(over(bc, ground), ground)]); }
    const be = cs(ind, '::before');
    if (be.content !== 'none' && parseFloat(be.borderTopWidth) > 0) { const bc = rgba(be.borderTopColor); if (bc && bc[3] > 0) out.push(['pencil line', ratio(over(bc, ground), ground)]); }
    out.sort((p, q) => q[1] - p[1]); return out[0] || ['none', 1];
  }
  function markOf(el, ground, cls) {
    el.classList.add(cls);
    const s = cs(el), be = cs(el, '::before');
    let r = null, what = '';
    if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) { r = ratio(over(rgba(s.outlineColor), ground), ground); what = s.outlineStyle + ' outline'; }
    else if (be.content !== 'none' && parseFloat(be.borderTopWidth) > 0 && rgba(be.borderTopColor)[3] > 0) { r = ratio(over(rgba(be.borderTopColor), ground), ground); what = 'pencil outline'; }
    else if (parseFloat(s.borderTopWidth) > 0) { r = ratio(over(rgba(s.borderTopColor), ground), ground); what = s.borderTopStyle + ' border'; }
    el.classList.remove(cls);
    return [what, r];
  }
  function measure(demo, c) {
    const R = {};
    const bar = solidBg($('.title-bar', demo)), tabs = $('.page-tabs', demo), ind = $(':scope > .ind', tabs);
    const fill = over(rgba(cs(ind).backgroundColor), bar), tOn = $('.page-tab.active', tabs), tOff = $$('.page-tab', tabs)[1];
    R.label = ['Chosen tab’s words on the chip', ratio(rgba(cs(tOn).color), fill), 4.5];
    const e = edgeOf(ind, bar); R.edge = ['Chip against the bar (' + e[0] + ')', e[1], 3];
    const h = markOf(tOff, bar, 'is-hover'); R.hover = ['Hover mark against the bar (' + h[0] + ')', h[1], 3];
    const f = markOf(tOff, bar, 'is-focus'); R.focus = ['Focus ring against the bar', f[1], 3];
    R.off = ['Other tabs’ words on the bar', ratio(rgba(cs(tOff).color), bar), 4.5];
    const head = solidBg($('.o55-head', demo)), rail = $('.o55-rail', demo), rind = $(':scope > .ind', rail);
    const rfill = over(rgba(cs(rind).backgroundColor), head), rl = $('.o55-railitem[data-state="current"] .o55-raillabel', rail);
    R.step = ['Current step’s words on its chip', ratio(rgba(cs(rl).color), rfill), 4.5];
    const re = edgeOf(rind, head); R.stepEdge = ['Step chip against the header (' + re[0] + ')', re[1], 3];
    const win = solidBg($('.o55-win', demo)), on = $('.o55-card.o55-on', demo), off = $('.o55-card:not(.o55-on)', demo);
    const onBg = over(rgba(cs(on).backgroundColor), win), title = $('.o55-cardtitle', on);
    const rowEdge = Math.max(ratio(over(rgba(cs(on).borderTopColor), win), win), ratio(onBg, win));
    R.row = ['Chosen option’s edge against the window', rowEdge, 3];
    const tBg = /gradient/.test(cs(title).backgroundImage) ? rgba(getComputedStyle(demo).getPropertyValue('--mk-hl').trim().replace(/^#(..)(..)(..)$/, (m, r, g, b) => `rgb(${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)})`)) : onBg;
    R.rowTitle = ['Chosen option’s title on its fill', ratio(rgba(cs(title).color), tBg), 4.5];
    const rh = markOf(off, win, 'is-hover'); R.rowHover = ['Option hover against the window (' + rh[0] + ')', rh[1], 3];
    const seg = $('.pm-segtab', demo), sg = solidBg(seg), sind = $(':scope > .ind', seg), sOn = $('.pm-segtab-item.active', seg);
    R.seg = ['Chosen file tab’s words on its chip', ratio(rgba(cs(sOn).color), over(rgba(cs(sind).backgroundColor), sg)), 4.5];
    const se = edgeOf(sind, sg); R.segEdge = ['File tab chip against its strip (' + se[0] + ')', se[1], 3];
    return R;
  }
  const fmt = (v, need) => v == null ? '<span class="no">n/a</span>' : `${v.toFixed(2)}:1 <span class="${v >= need ? 'ok' : 'no'}">${v >= need ? 'pass' : 'fail'}</span>`;
  function tableFor(c, L, D) {
    const rows = Object.keys(L).map((k) => `<tr><td>${L[k][0].replace(/ \(.*\)$/, '')}<br><small>${esc((L[k][0].match(/\((.*)\)$/) || ['', ''])[1])}</small></td><td>${L[k][2]}:1</td><td class="num c-light">${fmt(L[k][1], L[k][2])}</td><td class="num c-dark">${fmt(D[k][1], D[k][2])}</td></tr>`).join('');
    return `<div class="ctab-wrap"><table class="ctab"><thead><tr><th>What</th><th>Needs</th><th class="c-light">Light</th><th class="c-dark">Dark</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  window.__contrast = {};

  /* ---------------------------------------------------------------- page */
  function buildToday() {
    const looks = [
      ['glass', 'Glass', true, 'The reference, staying exactly as it is: a clear lens that refracts what is under it, with a white rim and catch light, travelling on a spring with a liquid stretch and settle.'],
      ['friendly', 'Friendly', false, 'The same lens, tinted mint with a faint glow and 10 px corners; onboarding’s current step uses it too. Its fill measures about 1.03:1 (light) and 1.06:1 (dark) against the bar, painted.'],
      ['basic', 'Basic', false, 'The same lens, tinted blue, with a half-pixel blue hairline, a catch light and a soft shadow on 6 px corners, gliding with part of Glass’s swell. Fill about 1.15:1 (light) and 1.5:1 (dark) against the bar; the hairline carries the edge.']
    ];
    const places = [['tabs', 'Top page selector'], ['steps', 'Onboarding step rail (Project current)'], ['option', 'Onboarding chosen option'], ['railtabs', 'Left rail file tabs']];
    $('#todayGrid').innerHTML = looks.map(([id, name, ref, note]) => `<article class="today-look"><h3>${name}${ref ? '<span class="ref-badge">Reference, unchanged</span>' : ''}</h3><p>${note}</p><div class="today-pair">${['light', 'dark'].map((m) => `<div class="today-col"><h4>${name} ${m === 'light' ? 'Light' : 'Dark'}</h4><div class="shots">${places.map(([p, label]) => { const im = IMGS[`${p}-${id}-${m}`]; return im ? `<figure class="shot"><img src="${im.src}" width="${im.w / 2}" height="${im.h / 2}" alt="${esc(name + ' ' + m + ', ' + label + ', as the product draws it today')}"><figcaption>${label}</figcaption></figure>` : ''; }).join('')}</div></div>`).join('')}</div></article>`).join('');
  }
  function buildConcepts() {
    $$('.concepts').forEach((host) => {
      host.innerHTML = CONCEPTS.filter((c) => c.fam === host.dataset.family).map((c) => `<article class="concept c-${c.id}" id="${c.id}" aria-labelledby="h-${c.id}">
        <h3 id="h-${c.id}">${c.code} · ${esc(c.name)}<span class="fam-badge">${c.fam === 'fr' ? 'Friendly' : 'Basic'}</span></h3>
        <p class="one">${esc(c.one)}</p><p class="why">${c.why}</p>
        <div class="pair">${demoHTML(c, 'light')}${demoHTML(c, 'dark')}</div>
        <p class="hc-note">${c.hc}</p>
        <details class="cdet"><summary>Contrast for ${c.code}, measured in this page</summary><div class="ctab-host"></div></details>
      </article>`).join('');
    });
  }
  const INV = [
    ['grp', 'The switcher: Liquid Glass’s lens, travelling between items (LG src/glass.js STRIPS)'],
    ['Title bar page tabs (Home, Projects, …)', 'nav.page-tabs .page-tab.active', 'LG src/glass.js:1400; legacy ink .page-tab-ink in OB base/style/pm6-css-global.css:1542 (steps aside under the switcher)'],
    ['Usage range', '#pmuRange > button.active', 'LG src/glass.js:1401; OB src/css/60-switcher-looks.css:230'],
    ['Usage navigation', '#pmuNav .pmu-navbtn', 'LG src/glass.js:1402'],
    ['Left rail tab strips (Files: Explorer, Changed, Open; the other panels’ tabs)', '#sidePanelSlot .pm-segtab .pm-segtab-item.active', 'LG src/glass.js:1405'],
    ['Activity bar icons', '#activityBar .icon[data-target]', 'LG src/glass.js:1406 (Glass only; the other looks keep their own rail mark)'],
    ['Onboarding step rail (current step)', '#pm-o55-onboarding .o55-raillist .o55-railitem[data-state="current"]', 'LG src/glass.js:1409'],
    ['Onboarding segments (Light / Dark, SSH / SMB / NFS, every one-of-several)', '#pm-o55-onboarding .o55-seg button.o55-on', 'LG src/glass.js:1413; OB src/css/60-switcher-looks.css:225-226'],
    ['Orchestrator views', '.orch-tabs .orch-tab.active', 'LG src/glass.js:1422; OB src/css/60-switcher-looks.css:219'],
    ['Terminal and editor Customize choices', '.pmt-cz .pmw-ink-row .pmw-ink-opt', 'LG src/glass.js:1423'],
    ['Planning Wizard work type', '#panel-wizard .pm6-wiz-intent-row .pm6-wiz-intent-chip.sel', 'LG src/glass.js:1425'],
    ['Theme menu Light / Dark / Auto', '#themeMenu .pm6-tt-modes .pm6-tt-mode[aria-checked="true"]', 'LG src/glass.js:1427; OB src/css/24-no-pills.css:7-13'],
    ['Settings left bar', '#pm-settings-root .rail-scroll :is(.side-link[data-action="home"], .domain-link)', 'LG src/glass.js:1432'],
    ['Settings section tabs', '#pm-settings-root nav.workspace-tabs .workspace-tab.is-current', 'LG src/glass.js:1433'],
    ['Settings page index', '#pm-settings-root nav.page-index-card .index-link.is-active', 'LG src/glass.js:1436'],
    ['Settings manager tabs', '#pm-settings-root nav.manager-tabs .manager-tab[aria-selected="true"]', 'LG src/glass.js:1437'],
    ['Settings segmented choices (lens drawn under the labels)', '#pm-settings-root .segmented > button[aria-checked="true"]', 'LG src/glass.js:1441'],
    ['grp', 'The same material worn in place (no travel)'],
    ['Title bar menus (look family, project)', '.pm6-tb-menu-item.is-selected', 'OB src/css/60-switcher-looks.css:182'],
    ['Home panel tabs (the seated plate)', '.pmw-plate::before, .pmw-tab[data-active]', 'LG src/glass.css:617-618 (section 6); OB src/css/60-switcher-looks.css:254-284'],
    ['Folded panel column tabs', '.pmw-strip[data-column] .pmw-tab[data-active]', 'OB src/css/60-switcher-looks.css:286'],
    ['Settings service lists', '#pm-settings-root .resource-row[aria-current="true"]', 'LG src/glass.css:606, 701-702'],
    ['grp', 'Onboarding’s chosen option (its own per-look style, not the lens)'],
    ['Option cards (Where, Begin, AI, …)', '.o55-card.o55-on', 'OB src/css/10-window.css:246 (all), :301 (Friendly), :304 (Glass); 12-components.css:17, 34, 41, 44 (cards with a sub-choice)'],
    ['Look tiles', '.o55-tile.o55-on', 'OB src/css/10-window.css:317, 324'],
    ['Suggestion chips', '.o55-suggestchip.o55-on', 'OB src/css/12-components.css:84'],
    ['grp', 'Where each look sets the switcher’s colours and motion'],
    ['Basic tokens (light, dark)', 'html[data-theme="basic-*"] { --pm-switch-* }', 'OB src/css/60-switcher-looks.css:23-52'],
    ['Friendly tokens (light, dark)', 'html[data-theme="friendly-*"] { --pm-switch-* }', 'OB src/css/60-switcher-looks.css:53-82'],
    ['Defaults outside Glass; Glass sets none', ':where(html:not([data-theme^="glass"])) { --pm-switch-* }', 'LG src/glass.css:954-983 (section 12); LG CONTRACT.md “The switcher”']
  ];
  function buildInventory() {
    $('#inventoryTable').innerHTML = `<table><thead><tr><th>Place</th><th>Selector</th><th>Source</th></tr></thead><tbody>${INV.map((r) => r[0] === 'grp' ? `<tr class="grp"><td colspan="3">${esc(r[1])}</td></tr>` : `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table><p class="sec-lede" style="margin-top:10px">OB = <code>Concepts/onboarding/opus-5.5</code>, LG = <code>Concepts/liquid-glass/opus-5.5</code>. A picked concept would change the Friendly or Basic token blocks and add its shape and motion to the switcher as a new skin and motion mode beside <code>glide</code>, <code>step</code> and <code>cut</code>; Glass reads none of it.</p>`;
  }
  function measureAll() {
    const all = [];
    CONCEPTS.forEach((c) => {
      const card = $('#' + c.id), L = measure($('.demo.light', card), c), D = measure($('.demo.dark', card), c);
      $('.ctab-host', card).innerHTML = tableFor(c, L, D);
      window.__contrast[c.id] = { light: L, dark: D };
      all.push([c, L, D]);
    });
    const keys = ['label', 'edge', 'hover', 'focus', 'step', 'stepEdge', 'row', 'rowTitle', 'rowHover', 'seg', 'segEdge'];
    const head = ['Concept', 'Mode', 'Tab words', 'Tab chip', 'Hover', 'Focus', 'Step words', 'Step chip', 'Option edge', 'Option title', 'Option hover', 'File tab words', 'File tab chip'];
    $('#contrastAll').innerHTML = `<div class="ctab-wrap"><table class="ctab" style="max-width:none;min-width:980px"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${all.map(([c, L, D]) => [['light', L], ['dark', D]].map(([m, R]) => `<tr class="c-${m}"><td>${c.code} ${esc(c.name)}</td><td>${m}</td>${keys.map((k) => `<td class="num">${fmt(R[k][1], R[k][2])}</td>`).join('')}</tr>`).join('')).join('')}</tbody></table></div>`;
  }
  function controls() {
    const set = (attr, val) => { document.body.dataset[attr] = val; };
    $$('[data-show]').forEach((b) => b.addEventListener('click', () => { radio(b); set('show', b.dataset.show); requestAnimationFrame(syncAll); }));
    $$('[data-hc]').forEach((b) => b.addEventListener('click', () => { radio(b); document.body.classList.toggle('hc-sim', b.dataset.hc === 'on'); }));
    $$('[data-motion]').forEach((b) => b.addEventListener('click', () => { radio(b); set('motion', b.dataset.motion); }));
    function radio(b) { $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-checked', x === b)); }
    document.body.dataset.show = 'both'; document.body.dataset.motion = reduced() ? 'reduced' : 'full';
    if (document.body.dataset.motion === 'reduced') $$('[data-motion]').forEach((x) => x.setAttribute('aria-checked', x.dataset.motion === 'reduced'));
    const fc = matchMedia('(forced-colors: active)'); const fcSet = () => document.documentElement.classList.toggle('fc', fc.matches); fcSet(); fc.addEventListener('change', fcSet);
  }
  function syncAll() { $$('[data-strip]').forEach((s) => sync(s, null)); }
  function init() {
    buildToday(); buildConcepts(); buildInventory(); controls();
    CONCEPTS.forEach((c) => wire($('#' + c.id), c));
    syncAll();
    const ready = () => { syncAll(); measureAll(); document.documentElement.dataset.ready = '1'; };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(ready));
    let t = 0; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(syncAll, 60); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
