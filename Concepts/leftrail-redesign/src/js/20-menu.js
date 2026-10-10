/* PMR.menu: every rail dropdown, drawn exactly like the Assistant composer pickers (Persona / Model / Mode).
   The plate and items carry the chat's own classes (pm6-chat-mini-popout-portal, pm6-chat-modelitem, ...), so the
   look, the Glass plate, Retro's square corners and NieR's slice follow the chat automatically. Motion is the chat's
   corner sprout (window.PM6_SPROUT). On top of the chat pickers this adds what the rail needs: body portal placement
   with flip-above, side submenus, search for long lists, roving keyboard focus, type-ahead and Escape.

   PMR.menu.open(menu, anchor, opts) / toggle / close / closeAll / isOpen / trigger(menu, opts)
   menu = Menu from DATA.md ({ id, label, value?, search?, multi?, groups: [{ label?, items: [MenuItem] }] }) or an item array.
   opts = { menus (id -> Menu, for submenus), onPick(item), align: 'start'|'end', width, side, keyboard }
   multi: the items with a value are checkboxes (item.checked). A pick flips that item, calls onPick, which may change
   any item's checked (an "All" item that clears the others), redraws every check and leaves the menu open, so several
   can be chosen in one visit; an item with closes: true closes it after its pick. Escape or a click outside closes. */

const CHECK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
const MENU_STACK = [];
let lastInputWasKey = false;
document.addEventListener('keydown', () => { lastInputWasKey = true; }, true);
document.addEventListener('pointerdown', () => { lastInputWasKey = false; }, true);

function asMenu(def) { return Array.isArray(def) ? { id: PMR.util.uid('menu'), groups: [{ items: def }] } : def; }
function selectable(m) { return m.value != null || m.groups.some(g => (g.items || []).some(it => it.selected)); }

function menuItemEl(m, it, entry) {
  const check = !!m.multi && !it.submenu && it.value != null;
  const radio = !check && selectable(m) && !it.submenu && it.value != null;
  const isSel = check ? !!it.checked : radio && (m.value != null ? m.value === it.value : !!it.selected);
  const a = PMR.actionAttrs(it);
  const el = PMR.h('button', Object.assign({
    type: 'button', class: ['pm6-chat-modelitem', 'pmr-mi', 'pmr-cur', isSel && 'active', it.danger && 'is-danger', it.submenu && 'has-sub'],
    role: check ? 'menuitemcheckbox' : radio ? 'menuitemradio' : 'menuitem', 'aria-checked': check || radio ? String(isSel) : null,
    'data-value': it.value != null ? String(it.value) : null, 'aria-haspopup': it.submenu ? 'menu' : null, tabindex: '-1',
  }, a),
  it.icon ? PMR.icon(it.icon, 'pmr-mi-ico') : (entry.reserveIcon ? PMR.h('span.pmr-mi-ico') : null),
  PMR.h('span.pm6-chat-modelname', { text: it.label }),
  it.meta ? PMR.h('span.pm6-chat-modeleffort', { text: it.meta }) : null,
  it.key ? PMR.h('kbd.pmr-key', { text: it.key }) : null,
  it.submenu ? PMR.icon('chevR', 'pmr-mi-sub') : (check || radio ? PMR.h('span.pm6-chat-modelcheck', { html: CHECK_SVG }) : null));
  if (it.disabled) PMR.hover(el, it.label, it.disabled);
  el._pmrItem = it;
  return el;
}

function renderMenu(m, entry) {
  const side = !!entry.opts.side;
  const el = PMR.h('div', {
    class: ['pmr-menu', 'pm6-chat-mini-popout-portal', side && 'pmr-menu-side pm6-chat-effort-popout-portal'],
    role: 'menu', 'aria-label': m.label || 'Menu', 'data-portal-display': 'block', tabindex: '-1', style: 'display:none',
    'data-pmr-menu': m.id || '',
  });
  entry.reserveIcon = m.groups.some(g => (g.items || []).some(it => it.icon));
  if (m.search) {
    const input = PMR.h('input', { type: 'search', placeholder: m.searchPlaceholder || ('Find ' + (m.label || 'item').toLowerCase()), 'aria-label': 'Filter ' + (m.label || 'menu') });
    el.appendChild(PMR.h('div.pm6-chat-modelsearch.pmr-menu-search', PMR.icon('search'), input));
    input.addEventListener('input', () => filterMenu(entry, input.value));
    input.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); focusItem(entry, 0); }
      else if (ev.key === 'Enter') { ev.preventDefault(); const first = items(entry)[0]; if (first) first.click(); }
    });
    entry.search = input;
  }
  const list = PMR.h('div.pm6-chat-modellist.pmr-menu-list');
  m.groups.forEach((g, gi) => {
    const block = PMR.h('div.pmr-menu-group', { role: 'group', 'aria-label': g.label || null });
    if (g.label) block.appendChild(PMR.h('div', { class: ['pm6-chat-modelgroup', 'pmr-menu-glabel', gi > 0 && 'pm6-chat-modelgroup-divider'], text: g.label }));
    else if (gi > 0) block.appendChild(PMR.h('div.pmr-menu-sep', { role: 'separator' }));
    (g.items || []).forEach(it => block.appendChild(menuItemEl(m, it, entry)));
    list.appendChild(block);
  });
  if (!m.groups.some(g => (g.items || []).length)) list.appendChild(PMR.h('div.pmr-menu-empty', { text: m.emptyText || 'Nothing here yet' }));
  el.appendChild(list);
  return el;
}

const items = entry => Array.from(entry.el.querySelectorAll('.pmr-mi')).filter(b => !b.hidden && b.offsetParent !== null);
function focusItem(entry, i) {
  const list = items(entry);
  if (!list.length) return;
  const n = ((i % list.length) + list.length) % list.length;
  list.forEach((b, k) => b.setAttribute('tabindex', k === n ? '0' : '-1'));
  list[n].focus({ preventScroll: false });
}
function filterMenu(entry, q) {
  const query = String(q || '').trim().toLowerCase();
  const before = entry.el.getBoundingClientRect().height;
  entry.el.querySelectorAll('.pmr-menu-group').forEach(g => {
    let any = false;
    g.querySelectorAll('.pmr-mi').forEach(b => {
      const show = !query || (b.textContent || '').toLowerCase().includes(query);
      b.hidden = !show; if (show) any = true;
    });
    g.hidden = !any;
  });
  const after = entry.el.scrollHeight;
  if (!PMR.motion.reduced() && Math.abs(after - before) > 2) {
    entry.el.style.height = before + 'px';
    void entry.el.offsetHeight;
    entry.el.style.height = Math.min(after, entry.maxH) + 'px';
    entry.el.classList.remove('is-size-bounce'); void entry.el.offsetWidth; entry.el.classList.add('is-size-bounce');
    clearTimeout(entry.hT); entry.hT = setTimeout(() => { entry.el.style.height = ''; }, 380);
  }
}

function place(entry) {
  const { el, anchor, opts } = entry;
  const r = anchor.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const side = !!opts.side;
  const w = opts.width || entry.menu.width || (side ? 232 : PMR.util.clamp(Math.round(r.width), 248, 300));
  el.style.width = w + 'px';
  const prevT = el.style.transform; el.style.transform = 'none'; el.style.visibility = 'hidden'; el.style.display = 'block';
  const natural = el.scrollHeight + 2;
  el.style.display = 'none'; el.style.visibility = ''; el.style.transform = prevT;
  let top, left, maxH;
  if (side) {
    left = r.right + 4;
    if (left + w > vw - 8) left = r.left - w - 4;
    maxH = Math.min(420, vh - 16);
    top = PMR.util.clamp(r.top - 4, 8, Math.max(8, vh - Math.min(natural, maxH) - 8));
  } else {
    const below = vh - r.bottom - 14, above = r.top - 14;
    const wantH = Math.min(natural, 420, Math.round(vh * 0.7));
    const goUp = below < wantH && above > below;
    maxH = Math.max(120, Math.min(420, Math.round(vh * 0.7), goUp ? above : below));
    const hgt = Math.min(natural, maxH);
    top = goUp ? r.top - 6 - hgt : r.bottom + 6;
    left = opts.align === 'end' ? r.right - w : r.left;
    left = PMR.util.clamp(left, 8, vw - w - 8);
  }
  entry.maxH = maxH;
  el.style.maxHeight = maxH + 'px';
  el.style.top = Math.round(top) + 'px';
  el.style.left = Math.round(left) + 'px';
}

function openMenu(def, anchor, opts) {
  opts = opts || {};
  const m = asMenu(def);
  if (!anchor) return null;
  if (!opts.side) closeAll();
  const entry = { menu: m, anchor, opts, el: null, children: [] };
  entry.el = renderMenu(m, entry);
  document.body.appendChild(entry.el);
  place(entry);
  MENU_STACK.push(entry);
  if (opts.parent) opts.parent.children.push(entry);
  anchor.setAttribute('aria-expanded', 'true');
  anchor.classList.add('is-menu-open');
  wireMenu(entry);
  if (window.PM6_SPROUT && typeof window.PM6_SPROUT.open === 'function') window.PM6_SPROUT.open(entry.el, null, anchor);
  else { entry.el.style.display = 'block'; entry.el.classList.add('is-open'); }
  const keyboard = opts.keyboard != null ? opts.keyboard : lastInputWasKey;
  if (entry.search && !keyboard) entry.search.focus({ preventScroll: true });
  else if (keyboard) {
    const list = items(entry), sel = list.findIndex(b => b.classList.contains('active'));
    focusItem(entry, sel >= 0 ? sel : 0);
  } else entry.el.focus({ preventScroll: true });
  return entry.el;
}

function closeEntry(entry, opts) {
  opts = opts || {};
  const i = MENU_STACK.indexOf(entry);
  if (i < 0) return;
  entry.children.slice().forEach(c => closeEntry(c, { silent: true }));
  MENU_STACK.splice(i, 1);
  if (entry.opts.parent) entry.opts.parent.children = entry.opts.parent.children.filter(c => c !== entry);
  entry.anchor.setAttribute('aria-expanded', 'false');
  entry.anchor.classList.remove('is-menu-open');
  const el = entry.el;
  const done = () => { if (el.parentNode) el.parentNode.removeChild(el); };
  if (window.PM6_SPROUT && typeof window.PM6_SPROUT.close === 'function' && !PMR.motion.reduced()) window.PM6_SPROUT.close(el, done);
  else done();
  if (opts.returnFocus && entry.anchor && entry.anchor.isConnected) entry.anchor.focus({ preventScroll: true });
}
function closeAll(opts) { MENU_STACK.filter(e => !e.opts.parent).forEach(e => closeEntry(e, opts)); }

function wireMenu(entry) {
  const { el, menu } = entry;
  let subTimer = 0;
  el.addEventListener('click', ev => {
    const b = ev.target.closest('.pmr-mi');
    if (!b || !el.contains(b)) return;
    const it = b._pmrItem;
    if (b.getAttribute('aria-disabled') === 'true') return;   // the PM_DEMO router says why
    if (it.submenu) { ev.preventDefault(); openSub(entry, b, it, false); return; }
    if (b.getAttribute('role') === 'menuitemcheckbox') {
      ev.preventDefault();
      it.checked = !it.checked;
      if (typeof entry.opts.onPick === 'function') { try { entry.opts.onPick(it, b); } catch (e) { /* ignore */ } }
      el.querySelectorAll('.pmr-mi[role="menuitemcheckbox"]').forEach(x => {
        const on = !!x._pmrItem.checked;
        if (x.classList.contains('active') !== on) { x.classList.toggle('active', on); x.setAttribute('aria-checked', String(on)); }
      });
      if (it.closes) setTimeout(() => closeEntry(entry, { returnFocus: lastInputWasKey }), 0);
      return;
    }
    if (b.getAttribute('role') === 'menuitemradio') {
      menu.value = it.value;
      menu.groups.forEach(g => (g.items || []).forEach(x => { x.selected = x === it; }));
    }
    if (typeof entry.opts.onPick === 'function') { try { entry.opts.onPick(it, b); } catch (e) { /* ignore */ } }
    let root = entry; while (root.opts.parent) root = root.opts.parent;
    setTimeout(() => closeEntry(root, { returnFocus: lastInputWasKey }), 0);   // after the PM_DEMO router saw the click
  });
  el.addEventListener('pointerover', ev => {
    const b = ev.target.closest('.pmr-mi');
    if (!b || !el.contains(b)) return;
    clearTimeout(subTimer);
    const it = b._pmrItem;
    subTimer = setTimeout(() => {
      entry.children.filter(c => c.anchor !== b).forEach(c => closeEntry(c, { silent: true }));
      if (it.submenu && !entry.children.some(c => c.anchor === b)) openSub(entry, b, it, false);
    }, 140);
  });
  el.addEventListener('keydown', ev => {
    const list = items(entry);
    const i = list.indexOf(document.activeElement);
    const k = ev.key;
    if (k === 'ArrowDown') { ev.preventDefault(); focusItem(entry, i + 1); }
    else if (k === 'ArrowUp') { ev.preventDefault(); if (i <= 0 && entry.search) entry.search.focus(); else focusItem(entry, i - 1); }
    else if (k === 'Home') { ev.preventDefault(); focusItem(entry, 0); }
    else if (k === 'End') { ev.preventDefault(); focusItem(entry, list.length - 1); }
    else if ((k === 'Enter' || k === ' ') && i >= 0) { ev.preventDefault(); list[i].click(); }
    else if (k === 'ArrowRight' && i >= 0 && list[i]._pmrItem.submenu) { ev.preventDefault(); openSub(entry, list[i], list[i]._pmrItem, true); }
    else if (k === 'ArrowLeft' && entry.opts.parent) { ev.preventDefault(); closeEntry(entry, { returnFocus: true }); }
    else if (k === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeEntry(entry, { returnFocus: true }); }
    else if (k === 'Tab') { closeAll(); }
    else if (k.length === 1 && /\S/.test(k) && !ev.ctrlKey && !ev.metaKey && document.activeElement !== entry.search) {
      const start = i + 1, low = k.toLowerCase();
      for (let n = 0; n < list.length; n++) {
        const b = list[(start + n) % list.length];
        if ((b.querySelector('.pm6-chat-modelname') || b).textContent.trim().toLowerCase().startsWith(low)) { focusItem(entry, (start + n) % list.length); break; }
      }
    }
  });
}
function openSub(entry, b, it, keyboard) {
  const sub = entry.opts.menus && entry.opts.menus[it.submenu];
  if (!sub) return;
  entry.children.slice().forEach(c => closeEntry(c, { silent: true }));
  openMenu(sub, b, { side: true, parent: entry, menus: entry.opts.menus, onPick: entry.opts.onPick, keyboard });
}

/* outside pointer, window resize and a scroll that moves a menu's trigger close every open menu. Only the page's own
   scroll or a scroller that holds a trigger moves one: an unrelated scroller (the chat's message stream settles about
   2 s after load or a theme switch) leaves the menus open, as a scroll inside a menu does. */
document.addEventListener('pointerdown', ev => {
  if (!MENU_STACK.length) return;
  if (MENU_STACK.some(e => e.el.contains(ev.target))) return;
  if (MENU_STACK.some(e => e.anchor.contains(ev.target))) return;   // the trigger toggles itself
  closeAll();
}, true);
window.addEventListener('resize', () => { if (MENU_STACK.length) closeAll(); });
document.addEventListener('scroll', ev => {
  if (!MENU_STACK.length) return;
  const t = ev.target;
  if (t && t.nodeType === 1 && MENU_STACK.some(e => e.el.contains(t))) return;
  const page = !t || t.nodeType !== 1 || t === document.scrollingElement || t === document.documentElement || t === document.body;
  if (!page && !MENU_STACK.some(e => t.contains(e.anchor) || (e.opts.origin && t.contains(e.opts.origin)))) return;
  closeAll();
}, true);
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Escape' || !MENU_STACK.length) return;
  const top = MENU_STACK[MENU_STACK.length - 1];
  if (top.el.contains(document.activeElement)) return;
  ev.preventDefault();
  closeEntry(top, { returnFocus: true });
});

/* a trigger in the chat selector look: [icon] label [chevron]; the label follows the chosen item */
function trigger(def, opts) {
  opts = opts || {};
  const m = asMenu(def);
  const chosen = () => { for (const g of m.groups) for (const it of (g.items || [])) if ((m.value != null && it.value === m.value) || (m.value == null && it.selected)) return it; return null; };
  const label = PMR.h('span.pmr-trigger-label', { text: (chosen() || {}).label || opts.text || m.label || '' });
  const btn = PMR.h('button', { type: 'button', class: ['pmr-trigger', opts.cls], 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
    opts.icon ? PMR.icon(opts.icon, 'pmr-trigger-ico') : null, label, PMR.icon('chevD', 'pmr-trigger-chev'));
  if (opts.hover) PMR.hover(btn, opts.hover.label, opts.hover.detail);
  else if (m.label) btn.setAttribute('aria-label', m.label + ': ' + label.textContent);
  btn.addEventListener('click', ev => {
    ev.preventDefault();
    toggle(m, btn, Object.assign({}, opts, {
      onPick(it, el) {
        if (it.value != null && !it.submenu) { label.textContent = it.label; if (m.label) btn.setAttribute('aria-label', m.label + ': ' + it.label); }
        if (typeof opts.onPick === 'function') opts.onPick(it, el);
      },
    }));
  });
  btn.addEventListener('keydown', ev => { if (ev.key === 'ArrowDown') { ev.preventDefault(); if (!isOpenFor(btn)) btn.click(); } });
  return btn;
}
const isOpenFor = anchor => MENU_STACK.some(e => e.anchor === anchor);
function toggle(def, anchor, opts) {
  const open = MENU_STACK.find(e => e.anchor === anchor && !e.opts.parent);
  if (open) { closeEntry(open, { returnFocus: false }); return null; }
  return openMenu(def, anchor, opts);
}

PMR.menu = {
  open: openMenu, toggle, trigger, closeAll,
  close(el) { const e = MENU_STACK.find(x => x.el === el) || MENU_STACK[MENU_STACK.length - 1]; if (e) closeEntry(e); },
  isOpen: anchor => (anchor ? isOpenFor(anchor) : MENU_STACK.length > 0),
  /* a context menu at a point (right click / Shift+F10): anchored to a 1px box at the pointer */
  at(def, x, y, opts) {
    let pin = document.getElementById('pmr-menu-pin');
    if (!pin) { pin = PMR.h('span#pmr-menu-pin', { 'aria-hidden': 'true' }); document.body.appendChild(pin); }
    pin.style.cssText = `position:fixed;left:${Math.round(x)}px;top:${Math.round(y)}px;width:1px;height:1px;pointer-events:none;`;
    /* origin: what was under the point, so a scroll of its list closes the menu as it closes a trigger's */
    return openMenu(def, pin, Object.assign({ width: 248, origin: document.elementFromPoint(x, y) }, opts));
  },
};
