/* ============================================================================
   Kimi K3 — popup family (locked motion contract).

   Behavior contract (from ACD-439..442 / F3-424 / PMConcept7 pm6-tb-menu):
   - Click activation (hover never opens).
   - Corner-origin sprout from the corner/edge nearest the trigger.
   - Open: opacity 140ms ease-out, transform 300ms cubic-bezier(0.22,1.55,0.36,1)
     from a non-uniform closed scale (sx .72, sy .48).
   - Close: opacity 45ms ease-in delayed 175ms, transform 220ms
     cubic-bezier(0.45,0.05,0.55,0.2).
   - In-place spring resize when option count/submenu content changes.
   - Submenus (click-open flyouts).
   - Mutual exclusion: exactly one transient overlay family active.
   - Esc / outside-click close; window resize closes instantly.
   - Viewport-aware placement; transform-origin recomputed after every flip.
   - Body-level position:fixed portal: never clipped by scrolling ancestors.
   - Reduced motion: instant show/hide, identical final state.
   ========================================================================== */
(function () {
  'use strict';

  const OPEN_EASE = 'cubic-bezier(0.22,1.55,0.36,1)';
  const CLOSE_EASE = 'cubic-bezier(0.45,0.05,0.55,0.2)';
  let openStack = []; // stack of open popup records (menu, its submenus)

  function reduced() { return window.K3.motionReduced(); }

  function nearestCorner(ax, ay, aw, ah, pw, ph, vw, vh) {
    // Decide placement + transform-origin corner given anchor rect and popup size.
    const below = ay + ah + 6 + ph <= vh - 8;
    const above = ay - 6 - ph >= 8;
    const placeY = below ? 'bottom' : (above ? 'top' : 'bottom');
    const rightFits = ax + pw <= vw - 8;
    const leftFits = ax + aw - pw >= 8;
    const placeX = rightFits ? 'left' : (leftFits ? 'right' : 'left');
    return { placeX, placeY };
  }

  function positionPopup(el, anchorRect, opts) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const pw = el.offsetWidth, ph = el.offsetHeight;
    const align = (opts && opts.align) || 'auto';
    let x, y, ox, oy;

    let side;
    if (align === 'left') side = 'left';
    else if (align === 'right') side = 'right';
    else side = nearestCorner(anchorRect.left, anchorRect.top, anchorRect.width, anchorRect.height, pw, ph, vw, vh).placeX;

    const below = anchorRect.bottom + 6 + ph <= vh - 8;
    const above = anchorRect.top - 6 - ph >= 8;
    const placeY = below ? 'bottom' : (above ? 'top' : 'bottom');

    x = side === 'left' ? anchorRect.left : anchorRect.right - pw;
    x = Math.max(8, Math.min(vw - pw - 8, x));
    y = placeY === 'bottom' ? anchorRect.bottom + 6 : anchorRect.top - ph - 6;
    y = Math.max(8, Math.min(vh - ph - 8, y));

    // transform origin = corner of the popup nearest the anchor point
    const anchorCX = anchorRect.left + anchorRect.width / 2;
    ox = anchorCX <= x + pw / 2 ? '0%' : '100%';
    oy = placeY === 'bottom' ? '0%' : '100%';

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transformOrigin = ox + ' ' + oy;
    return { x, y, ox, oy, placeY };
  }

  function sproutOpen(el, done) {
    el.classList.add('k3-pop');
    if (reduced()) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('is-open');
      if (done) done();
      return;
    }
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translate(0px,-4px) scale(0.72,0.48)';
    // force reflow so the transition runs from the closed state
    void el.offsetHeight;
    el.style.transition =
      'opacity 140ms var(--ease-out, ease-out), transform 300ms ' + OPEN_EASE;
    el.style.opacity = '1';
    el.style.transform = 'translate(0,0) scale(1,1)';
    el.classList.add('is-open');
    setTimeout(() => { if (done) done(); }, 300);
  }

  function sproutClose(el, done) {
    if (!el) { if (done) done(); return; }
    el.classList.remove('is-open');
    if (reduced()) {
      el.remove();
      if (done) done();
      return;
    }
    el.style.transition =
      'opacity 45ms ease-in 175ms, transform 220ms ' + CLOSE_EASE;
    el.style.opacity = '0';
    el.style.transform = 'translate(0px,-3px) scale(0.86,0.62)';
    setTimeout(() => { el.remove(); if (done) done(); }, 240);
  }

  // In-place spring resize when content (option count / submenu) changes.
  function springResize(el) {
    if (reduced()) return;
    const list = el.querySelector('.k3-menu-list') || el;
    const from = el.style.height ? parseInt(el.style.height, 10) : list.offsetHeight;
    const to = list.scrollHeight;
    if (Math.abs(from - to) < 2) return;
    el.style.height = from + 'px';
    void el.offsetHeight;
    el.style.transition = 'height 220ms ' + OPEN_EASE;
    el.style.height = to + 'px';
    setTimeout(() => { el.style.height = ''; el.style.transition = ''; }, 240);
  }

  function closeAll(fromRecord) {
    // Close everything above (and including) fromRecord in the stack.
    let idx = fromRecord ? openStack.indexOf(fromRecord) : 0;
    if (idx < 0) idx = 0;
    const closing = openStack.splice(idx);
    closing.reverse().forEach((rec) => sproutClose(rec.el));
  }

  function anyOpen() { return openStack.length > 0; }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && anyOpen()) {
      e.stopPropagation();
      closeAll();
    }
  }, true);
  document.addEventListener('pointerdown', (e) => {
    if (!anyOpen()) return;
    const inside = openStack.some((rec) => rec.el.contains(e.target) || (rec.anchor && rec.anchor.contains(e.target)));
    if (!inside) closeAll();
  }, true);
  window.addEventListener('resize', () => closeAll());

  function buildMenuDom(items, opts, depth) {
    const el = document.createElement('div');
    el.className = 'k3-pop k3-menu k3-scroll';
    el.setAttribute('role', 'menu');
    if (opts && opts.width) el.style.width = opts.width + 'px';

    let list = el;
    if (opts && opts.searchable) {
      const head = document.createElement('div');
      head.className = 'k3-menu-search';
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('spellcheck', 'false');
      input.placeholder = (opts && opts.searchPlaceholder) || 'Search';
      head.appendChild(input);
      el.appendChild(head);
      list = document.createElement('div');
      list.className = 'k3-menu-list k3-scroll';
      el.appendChild(list);
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        list.querySelectorAll('.k3-menu-item').forEach((it) => {
          const text = it.textContent.toLowerCase();
          it.style.display = !q || text.includes(q) ? '' : 'none';
        });
        springResize(el);
      });
      setTimeout(() => input.focus(), reduced() ? 0 : 60);
    } else {
      el.classList.add('k3-menu-list');
    }

    items.forEach((item) => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'k3-menu-sep';
        list.appendChild(sep);
        return;
      }
      if (item.type === 'header') {
        const h = document.createElement('div');
        h.className = 'k3-menu-header';
        h.textContent = item.label;
        list.appendChild(h);
        return;
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'k3-menu-item';
      btn.setAttribute('role', 'menuitem');
      if (item.selected) btn.classList.add('is-selected');
      if (item.danger) btn.classList.add('is-danger');
      if (item.disabled) { btn.disabled = true; }
      if (item.testid) btn.setAttribute('data-testid', item.testid);

      if (item.icon) {
        const ic = document.createElement('span');
        ic.className = 'k3-menu-ic';
        ic.appendChild(window.K3Icons.get(item.icon));
        btn.appendChild(ic);
      }
      const lab = document.createElement('span');
      lab.className = 'k3-menu-label';
      lab.textContent = item.label;
      btn.appendChild(lab);
      if (item.hint) {
        const hint = document.createElement('span');
        hint.className = 'k3-menu-hint';
        hint.textContent = item.hint;
        btn.appendChild(hint);
      }
      if (item.submenu) {
        const chev = document.createElement('span');
        chev.className = 'k3-menu-hint';
        chev.appendChild(window.K3Icons.get('chevron-right'));
        btn.appendChild(chev);
      }

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.submenu) {
          // close deeper levels, open this submenu
          const rec = openStack[openStack.length - 1];
          const sub = openSubmenu(btn, item.submenu, opts, (depth || 0) + 1);
          return;
        }
        if (item.action) item.action();
        if (opts && opts.onSelect) opts.onSelect(item);
        closeAll();
      });
      list.appendChild(btn);
    });
    return el;
  }

  function openSubmenu(anchorItem, items, parentOpts, depth) {
    const el = buildMenuDom(items, parentOpts, depth);
    document.body.appendChild(el);
    const r = anchorItem.getBoundingClientRect();
    // submenu anchors to the right edge of its parent item, flipping if needed
    const anchorRect = { left: r.right - 4, top: r.top, width: 4, height: r.height, right: r.right, bottom: r.bottom };
    positionPopup(el, anchorRect, { align: 'left' });
    sproutOpen(el);
    openStack.push({ el, anchor: anchorItem });
    return el;
  }

  const K3UI = {
    // Open a sprout menu anchored to an element.
    // items: [{label, icon, hint, selected, danger, disabled, action, submenu, testid, type:'separator'|'header'}]
    menu(anchor, items, opts) {
      closeAll();
      const el = buildMenuDom(items, opts || {}, 0);
      document.body.appendChild(el);
      positionPopup(el, anchor.getBoundingClientRect(), opts || {});
      sproutOpen(el);
      openStack.push({ el, anchor });
      return { close: () => closeAll(), el };
    },

    // Modal-less confirm using the same popup chrome family.
    confirm(opts) {
      return new Promise((resolve) => {
        closeAll();
        const el = document.createElement('div');
        el.className = 'k3-pop k3-confirm';
        el.innerHTML =
          '<div class="k3-confirm-title"></div>' +
          (opts.body ? '<div class="k3-confirm-body"></div>' : '') +
          '<div class="k3-confirm-row"><button type="button" class="k3-btn k3-btn-ghost" data-x="no"></button>' +
          '<button type="button" class="k3-btn" data-x="yes"></button></div>';
        el.querySelector('.k3-confirm-title').textContent = opts.title || 'Confirm';
        if (opts.body) el.querySelector('.k3-confirm-body').textContent = opts.body;
        const no = el.querySelector('[data-x="no"]');
        const yes = el.querySelector('[data-x="yes"]');
        no.textContent = opts.cancelLabel || 'Cancel';
        yes.textContent = opts.confirmLabel || 'OK';
        if (opts.danger) yes.classList.add('k3-btn-danger');
        document.body.appendChild(el);
        const vw = window.innerWidth, vh = window.innerHeight;
        el.style.left = Math.max(8, (vw - el.offsetWidth) / 2) + 'px';
        el.style.top = Math.max(8, vh * 0.32) + 'px';
        el.style.transformOrigin = '50% 0%';
        const finish = (val) => { sproutClose(el); resolve(val); };
        no.addEventListener('click', () => finish(false));
        yes.addEventListener('click', () => finish(true));
        const onKey = (e) => { if (e.key === 'Escape') { finish(false); } };
        document.addEventListener('keydown', onKey, { once: true });
        sproutOpen(el);
      });
    },

    closeAll,
    anyOpen,
    springResize,

    // Generic anchored popover with the same sprout contract (More Info,
    // Context Ring module, kv panels). Content is supplied by the caller.
    popover(anchor, content, opts) {
      closeAll();
      const el = document.createElement('div');
      el.className = 'k3-pop k3-popover' + (opts && opts.className ? ' ' + opts.className : '');
      if (typeof content === 'function') content(el);
      else if (content instanceof Node) el.appendChild(content);
      else el.innerHTML = String(content);
      document.body.appendChild(el);
      positionPopup(el, anchor.getBoundingClientRect(), opts || {});
      sproutOpen(el);
      const rec = { el, anchor };
      openStack.push(rec);
      return { close: () => closeAll(rec), el };
    },
    // helpers exposed for modules
    icon(name) { return window.K3Icons.get(name); },
    scrollClass: 'k3-scroll',
    testid(part) { return 'k3-' + part; },
    reduced
  };

  window.K3UI = K3UI;
})();
