/* Motion. Every scripted animation goes through Element.animate (the shell's Animation speed setting scales it) and
   nothing runs under reduced motion. Each theme family moves in its own way:
     Basic    crisp: short rise, ease-out
     Friendly springy: a taller rise with overshoot
     Glass    gliding: a long, soft rise out of a light blur
     Retro    stepped: the same moves in three hard steps
     NieR     ink: rows are wiped in left to right, like a terminal drawing a line */

const FAM_MOTION = {
  basic:    { dy: 6,  dx: 14, dur: 240, step: 22, ease: 'cubic-bezier(.2, .8, .2, 1)' },
  friendly: { dy: 10, dx: 18, dur: 420, step: 30, ease: 'cubic-bezier(.34, 1.45, .5, 1)', scale: .985 },
  glass:    { dy: 9,  dx: 16, dur: 480, step: 30, ease: 'cubic-bezier(.16, 1, .3, 1)', blur: 5 },
  retro:    { dy: 4,  dx: 8,  dur: 200, step: 36, ease: 'steps(3, end)' },
  nier:     { dy: 0,  dx: 0,  dur: 210, step: 24, ease: 'cubic-bezier(.45, 0, .15, 1)', wipe: true },
};
const reduced = () => PMR.motion.reduced();
const fam = () => (PMR.motion.nier() ? 'nier' : PMR.motion.family());
const spec = () => FAM_MOTION[fam()] || FAM_MOTION.basic;

function enterFrames(f, dx, dy) {
  if (f.wipe) {
    const from = dx < 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    return [{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }];
  }
  const a = { opacity: 0, transform: 'translate(' + dx + 'px, ' + dy + 'px)' + (f.scale ? ' scale(' + f.scale + ')' : '') };
  const b = { opacity: 1, transform: 'none' };
  if (f.blur) { a.filter = 'blur(' + f.blur + 'px)'; b.filter = 'blur(0px)'; }
  return [a, b];
}
function stopEnter(el) { el.getAnimations().forEach(a => { if (a.id === 'd-enter') a.cancel(); }); }
/* stagger a list in; runs once per call, never on scroll */
function cascade(list, opts) {
  if (reduced() || !list.length) return;
  const f = spec(), o = opts || {};
  list.slice(0, o.max || 14).forEach((el, i) => {
    if (!el || !el.animate) return;
    stopEnter(el);
    const a = el.animate(enterFrames(f, o.dx || 0, o.dy != null ? o.dy : f.dy), {
      duration: Math.round(f.dur * (o.durK || 1)), easing: f.ease, delay: (o.delay || 0) + i * (o.step != null ? o.step : f.step), fill: 'backwards',
    });
    a.id = 'd-enter';
  });
}
const visible = el => !!(el && el.offsetParent !== null && el.getClientRects().length);
function activePane(panel) { return panel.querySelector(':scope > .sh-scroll > [data-pane]:not(.pm-hidden)'); }
const onScreen = el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.top < window.innerHeight && r.bottom > 0; };
/* what deals in: each shelf box, then its head and rows one by one; loose items (buttons, notes) in order */
function dealList(pane) {
  if (!pane) return [];
  const out = [];
  const tree = pane.querySelector(':scope > .fm-tree');
  const tops = tree ? Array.from(tree.querySelectorAll(':scope > .fm-node')) : Array.from(pane.children);
  tops.filter(visible).filter(onScreen).forEach(el => {
    if (el.classList.contains('sh-shelf')) {
      out.push({ el, box: true });
      const head = el.querySelector(':scope > .sh-head');
      if (head) out.push({ el: head });
      const body = el.querySelector(':scope > .sh-body, :scope > .sh-accb > .pm-acc-inner > .sh-body, :scope > .sh-accb > .pm-acc-inner');
      if (body && el.querySelector(':scope > .sh-head') && (!el.hasAttribute('data-acc') || el.classList.contains('open'))) {
        Array.from(body.children).filter(visible).filter(onScreen).forEach(r => out.push({ el: r }));
      }
    } else out.push({ el });
  });
  return out;
}
/* play a deal: boxes settle with the next row, rows follow one step apart; capped so a long list never drags */
function deal(list, o) {
  if (reduced() || !list.length) return;
  const f = spec();
  let t = o.delay || 0, n = 0;
  for (const it of list) {
    if (n >= (o.max || 16)) break;
    const el = it.el;
    if (!el || !el.animate) continue;
    stopEnter(el);
    /* Glass blurs only the boxes: a blur on every row costs a raster per row per frame */
    const rowSpec = f.blur ? Object.assign({}, f, { blur: 0 }) : f;
    const frames = it.box
      ? (f.wipe ? enterFrames(f, o.dx || 1, 0) : enterFrames(Object.assign({}, f, { scale: 0 }), Math.round((o.dx || 0) * .5), Math.round((o.dy != null ? o.dy : f.dy) * .6)))
      : enterFrames(rowSpec, o.dx || 0, o.dy != null ? o.dy : f.dy);
    const a = el.animate(frames, { duration: Math.round(f.dur * (it.box ? .75 : 1)), easing: f.ease, delay: t, fill: 'backwards' });
    a.id = 'd-enter';
    if (!it.box) { t += o.step != null ? o.step : f.step; n += 1; }
  }
}

/* the panel comes in: its chrome settles first, the content deals in right behind it */
function enterPanel(panel) {
  if (reduced() || !panel) return;
  const chrome = [':scope > .sh-banner', ':scope > .pm7-scm-context', ':scope > .pm-segtab', ':scope > .fm-toolbar-wrap']
    .map(s => panel.querySelector(s)).filter(visible);
  const f = spec();
  cascade(chrome, { dy: f.wipe ? 0 : Math.max(2, Math.round(f.dy / 2)), step: Math.round(f.step * .6), durK: .8 });
  const jj = panel.querySelector(':scope > .pm7-scm-jj-view');
  const list = (jj && visible(jj)) ? Array.from(jj.children).map(el => ({ el })) : dealList(activePane(panel));
  const foot = panel.querySelector(':scope > .pm7-scm-git-footer');
  if (visible(foot)) list.push({ el: foot });
  deal(list, { delay: Math.round(f.step * 1.5) });
  const ico = panel.querySelector(':scope > .sh-banner > .sh-bico');
  if (ico && !f.wipe) {
    const k = fam() === 'retro' ? 'steps(4, end)' : 'cubic-bezier(.3, 1.6, .5, 1)';
    ico.animate([{ transform: 'scale(.7) rotate(-12deg)' }, { transform: 'none' }], { duration: Math.round(f.dur * 1.2), easing: k });
  }
}

/* a tab change: the new pane deals in from the side of the tab you came from */
function enterPane(pane, dir) {
  if (reduced() || !pane) return;
  const f = spec();
  deal(dealList(pane), { dx: f.wipe ? (dir < 0 ? -1 : 1) : dir * f.dx, dy: 0, max: 12, step: Math.round(f.step * .8) });
}

/* an expander opens: its body's rows fade down into place, a beat after the height starts */
function revealBody(item) {
  if (reduced() || !item) return;
  const body = item.querySelector(':scope > .sh-accb, :scope > .sh-wt-b');
  const inner = body && (body.querySelector(':scope > .pm-acc-inner') || body);
  if (!inner) return;
  let kids = Array.from(inner.children);
  if (kids.length === 1 && kids[0].classList.contains('sh-body')) kids = Array.from(kids[0].children);
  const f = spec();
  kids.slice(0, 8).forEach((el, i) => {
    stopEnter(el);
    const a = el.animate(f.wipe ? enterFrames(f, 1, 0) : [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }],
      { duration: Math.round(f.dur * .9), easing: f.ease, delay: 40 + i * Math.round(f.step * .8), fill: 'backwards' });
    a.id = 'd-enter';
  });
}

/* a status word the shell rewrote: the glyph pops, the word lands */
function statusPop(el, gl) {
  if (reduced()) return;
  const f = spec();
  if (gl) gl.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.3)', opacity: 1, offset: .55 }, { transform: 'none', opacity: 1 }],
    { duration: fam() === 'retro' ? 240 : 420, easing: fam() === 'retro' ? 'steps(4, end)' : 'cubic-bezier(.3, 1.4, .5, 1)' });
  el.animate([{ opacity: .25, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: f.dur, easing: f.ease });
}
/* a count that changed rolls to its new value */
function rollCount(el, up) {
  if (reduced()) return;
  const f = spec();
  el.animate([{ transform: 'translateY(' + (up ? 60 : -60) + '%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: f.dur, easing: f.ease });
}
const COUNT_SEL = '.sh-hcount, .fm-count, .pm-sumcard-h .c, #fmHintCount, #fmSelCount, #fmSelChipN';
function applyCounts(root, animate) {
  root.querySelectorAll(COUNT_SEL).forEach(el => {
    const t = el.textContent.trim(), n = parseFloat(t);
    if (el._dCount === t) return;
    const prev = el._dCountN;
    el._dCount = t; el._dCountN = n;
    if (animate && prev != null && !isNaN(n) && n !== prev) rollCount(el, n > prev);
  });
}

/* an expander opened near the bottom of the list scrolls itself into view while it grows */
function revealInView(item) {
  const sc = item.closest('.sh-scroll');
  if (!sc) return;
  setTimeout(() => {
    const ir = item.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    const over = ir.bottom - sr.bottom + 8;
    if (over > 0) sc.scrollBy({ top: Math.min(over, Math.max(0, ir.top - sr.top - 40)), behavior: reduced() ? 'auto' : 'smooth' });
  }, reduced() ? 0 : 120);
}

/* clicks: tabs and expanders get their motion after the shell has switched them */
function onClickMotion(ev) {
  if (!D.on) return;
  const t = ev.target;
  if (!t || !t.closest || !inPanels(t)) return;
  const tab = t.closest('[data-tab]');
  if (tab) {
    const panel = tab.closest('.side-panel-view');
    const tabs = Array.from(panel.querySelectorAll('[data-tab]'));
    const now = tabs.indexOf(tab), was = panel._dTab != null ? panel._dTab : now;
    panel._dTab = now;
    if (now === was) return;
    requestAnimationFrame(() => {
      const strip = tab.closest('.pm-segtab');
      if (strip) fitTabs(strip);
      const pane = activePane(panel);
      if (pane) { stackHeads(pane); stackRows(pane); midFitAll(pane); enterPane(pane, now > was ? 1 : -1); }
    });
    return;
  }
  const head = t.closest('[data-collapse]');
  if (head && !t.closest('button, a, input, .pm6-tb-menu-trigger, .pm-minibtn')) {
    const item = head.closest('[data-acc]');
    requestAnimationFrame(() => {
      if (!item) return;
      if (item.classList.contains('open')) { revealBody(item); stackHeads(item); midFitAll(item); revealInView(item); }
    });
  }
}
/* Git <-> Jujutsu: the other view rises in */
function onEngine(ev) {
  if (!D.on) return;
  const b = ev.target && ev.target.closest && ev.target.closest('.pm7-scm-engine-button');
  if (!b) return;
  const panel = b.closest('#panel-source');
  requestAnimationFrame(() => {
    if (!panel) return;
    const jj = panel.querySelector(':scope > .pm7-scm-jj-view');
    if (jj && visible(jj)) cascade(Array.from(jj.children), { max: 6 });
    else enterPanel(panel);
  });
}
