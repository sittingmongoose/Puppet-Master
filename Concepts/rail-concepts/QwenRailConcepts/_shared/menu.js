/* rail-concepts/_shared/menu.js
   The Puppet Master sprout-menu family — one behavior contract for every menu
   in the app (title-bar theme/project menus, chat more-menu, and the
   replacements for all native <select>/context menus in these concepts).

   Behavior source of truth: Plans/assistant-chat-design.md ACD-439/441/442
   (corner-origin sprout, click-to-open only, Esc/outside close, mutual
   exclusion) + PMConcept7.html:12421-12536 (CSS chrome) + FinalGUISpec
   F3-424 (Slint PopupWindow mapping) / F3-242 (custom context menu, Slint has
   no built-in one).

   Slint note: the product maps these to PopupWindow (always unclipped). In
   these HTML prototypes, rail menus portal to document.body + position:fixed
   so they escape .sh-scroll / accordion overflow and shelf will-change
   containing blocks — same visual contract as PopupWindow. */
(function () {
  'use strict';
  var openMenus = [];

  function isRailMenu(menu) {
    return !!(menu._pmRailHome || (menu.closest && menu.closest('#sidePanelSlot')));
  }

  function clearRailStyles(menu) {
    menu.style.position = '';
    menu.style.inset = '';
    menu.style.left = '';
    menu.style.top = '';
    menu.style.right = '';
    menu.style.bottom = '';
    menu.style.width = '';
    menu.style.minWidth = '';
    menu.style.maxWidth = '';
    menu.style.zIndex = '';
  }

  function restoreRailHome(menu) {
    if (!menu._pmRailHome) return;
    var home = menu._pmRailHome;
    if (home.next && home.next.parentNode === home.parent) home.parent.insertBefore(menu, home.next);
    else home.parent.appendChild(menu);
    menu._pmRailHome = null;
    clearRailStyles(menu);
    var wrap = home.parent && home.parent.closest && home.parent.closest('.pm6-tb-menu-wrap');
    if (wrap) wrap.classList.remove('menu-open');
    var shelf = home.parent && home.parent.closest && home.parent.closest('.sh-shelf');
    if (shelf) shelf.classList.remove('menu-open');
    var acc = home.parent && home.parent.closest && home.parent.closest('[data-acc]');
    if (acc) acc.classList.remove('menu-open');
  }

  function markMenuOpen(menu, open) {
    var homeParent = (menu._pmRailHome && menu._pmRailHome.parent) || menu.parentElement;
    if (!homeParent || !homeParent.closest) return;
    var shelf = homeParent.closest('.sh-shelf');
    if (shelf) shelf.classList.toggle('menu-open', open);
    var acc = homeParent.closest('[data-acc]');
    if (acc) acc.classList.toggle('menu-open', open);
    var wrap = (menu._pmTrigger && menu._pmTrigger.closest('.pm6-tb-menu-wrap')) || homeParent.closest('.pm6-tb-menu-wrap');
    if (wrap) wrap.classList.toggle('menu-open', open);
  }

  function positionRail(menu) {
    var slot = document.getElementById('sidePanelSlot');
    var trig = menu._pmTrigger;
    if (!slot || !trig) return;
    if (!menu._pmRailHome) {
      menu._pmRailHome = { parent: menu.parentNode, next: menu.nextSibling };
      document.body.appendChild(menu);
    }
    var sr = slot.getBoundingClientRect();
    var tr = trig.getBoundingClientRect();
    var wrap = trig.closest('.pm6-tb-menu-wrap');
    var fullW = wrap && wrap.classList.contains('sh-bbranch');
    var avail = Math.max(80, sr.width - 8);
    menu.style.position = 'fixed';
    menu.style.inset = 'auto';
    menu.style.bottom = 'auto';
    menu.style.right = 'auto';
    menu.style.zIndex = '400';
    var want = fullW ? tr.width : Math.max(tr.width, 160);
    var width = Math.min(want, avail);
    menu.style.minWidth = width + 'px';
    menu.style.maxWidth = avail + 'px';
    menu.style.width = fullW ? width + 'px' : '';
    var mw = Math.min(menu.offsetWidth || width, avail);
    var left = fullW ? tr.left : Math.max(sr.left + 4, Math.min(tr.left, sr.right - mw - 4));
    if (left + mw > sr.right - 4) left = Math.max(sr.left + 4, sr.right - mw - 4);
    menu.style.left = left + 'px';
    menu.style.top = (tr.bottom + 6) + 'px';
    menu.style.setProperty('--pm6-sprout-ox', '12%');
    menu.style.setProperty('--pm6-sprout-oy', '0%');
    markMenuOpen(menu, true);
  }

  function nearestCorner(menu, anchorRect) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var cx = anchorRect.left + anchorRect.width / 2;
    var ox = cx < vw / 2 ? '12%' : '88%';
    /* Rail/side-panel menus always open downward so they stay under the
       trigger and never flip behind following shelves/cards. Title-bar and
       floating context menus still flip when there is no room below. */
    var inRail = isRailMenu(menu);
    var below = anchorRect.bottom + 6;
    var est = menu.offsetHeight || 180;
    var oy = (!inRail && below + est > vh - 8 && anchorRect.top - est - 6 > 8) ? '100%' : '0%';
    return { ox: ox, oy: oy, up: oy === '100%' };
  }

  function position(menu, anchorRect) {
    var c = nearestCorner(menu, anchorRect);
    menu.style.setProperty('--pm6-sprout-ox', c.ox);
    menu.style.setProperty('--pm6-sprout-oy', c.oy);
    if (c.up) {
      menu.style.top = 'auto';
      menu.style.bottom = 'calc(100% + 6px)';
    } else {
      menu.style.bottom = 'auto';
      menu.style.top = 'calc(100% + 6px)';
    }
  }

  function close(menu, instant) {
    if (!menu.classList.contains('is-open') && !menu.classList.contains('is-closing')) return;
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');
    var trig = menu._pmTrigger;
    if (trig) trig.setAttribute('aria-expanded', 'false');
    markMenuOpen(menu, false);
    var done = function () {
      menu.classList.remove('is-closing');
      restoreRailHome(menu);
    };
    if (instant) { done(); } else { setTimeout(done, 240); }
    var i = openMenus.indexOf(menu);
    if (i !== -1) openMenus.splice(i, 1);
  }

  function open(menu, anchorRect, instant) {
    closeAll(instant);
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    if (isRailMenu(menu)) {
      positionRail(menu);
      requestAnimationFrame(function () { positionRail(menu); });
    } else if (anchorRect) {
      position(menu, anchorRect);
    }
    var trig = menu._pmTrigger;
    if (trig) trig.setAttribute('aria-expanded', 'true');
    openMenus.push(menu);
  }

  function closeAll(instant) {
    openMenus.slice().forEach(function (m) { close(m, instant); });
  }

  function toggle(trigger, menu) {
    if (menu.classList.contains('is-open')) { close(menu); return; }
    open(menu, trigger.getBoundingClientRect());
  }

  /* upgrade a wrap: <div class="pm6-tb-menu-wrap"><button class="pm6-tb-menu-trigger" aria-controls>...</button><div class="pm6-tb-menu" role="menu">items</div></div> */
  function upgradeWrap(wrap) {
    if (wrap._pmUpgraded) return;
    wrap._pmUpgraded = true;
    var trig = wrap.querySelector('.pm6-tb-menu-trigger');
    var menu = wrap.querySelector('.pm6-tb-menu, .pm6-chat-more-menu');
    if (!trig || !menu) return;
    menu._pmTrigger = trig;
    trig.setAttribute('aria-haspopup', 'menu');
    trig.setAttribute('aria-expanded', 'false');
    trig.addEventListener('click', function (ev) { ev.stopPropagation(); toggle(trig, menu); });
    trig.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(trig, menu); }
      if (ev.key === 'ArrowDown' && !menu.classList.contains('is-open')) { ev.preventDefault(); open(menu, trig.getBoundingClientRect()); }
    });
    menu.addEventListener('click', function (ev) {
      var item = ev.target.closest('[role="menuitem"]');
      if (!item || item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true') return;
      ev.stopPropagation();
      if (menu.hasAttribute('data-pm-menu-select')) {
        menu.querySelectorAll('[role="menuitem"]').forEach(function (it) { it.classList.remove('is-selected'); });
        item.classList.add('is-selected');
        var label = wrap.querySelector('.pm6-tb-menu-label');
        if (label) label.textContent = item.getAttribute('data-label') || item.textContent.trim();
        var val = item.getAttribute('data-value');
        if (val != null) {
          wrap.setAttribute('data-value', val);
          wrap.dispatchEvent(new CustomEvent('pm-menu-change', { detail: { value: val }, bubbles: true }));
        }
      }
      menu.dispatchEvent(new CustomEvent('pm-menu-pick', { detail: { item: item, value: item.getAttribute('data-value') }, bubbles: true }));
      close(menu);
    });
    menu.addEventListener('keydown', function (ev) {
      var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
      var idx = items.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') { ev.preventDefault(); (items[idx + 1] || items[0]).focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); (items[idx - 1] || items[items.length - 1]).focus(); }
      else if (ev.key === 'Home') { ev.preventDefault(); items[0].focus(); }
      else if (ev.key === 'End') { ev.preventDefault(); items[items.length - 1].focus(); }
    });
  }

  /* floating context menu at a point (file-tree right-click replacement,
     F3-242 custom ContextMenu contract) */
  function openAt(menu, x, y) {
    closeAll();
    menu.style.position = 'fixed';
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.style.right = 'auto';
    menu.style.bottom = 'auto';
    menu.classList.remove('is-closing');
    menu.classList.add('is-open'); /* measure with open class */
    var w = menu.offsetWidth || 210, h = menu.offsetHeight || 200;
    var vw = window.innerWidth, vh = window.innerHeight;
    var fx = Math.min(x, vw - w - 8);
    var fy = y + h > vh - 8 ? Math.max(8, y - h) : y;
    menu.style.left = fx + 'px';
    menu.style.top = fy + 'px';
    menu.style.setProperty('--pm6-sprout-ox', (x > vw / 2 ? '88%' : '12%'));
    menu.style.setProperty('--pm6-sprout-oy', (fy === y ? '0%' : '100%'));
    openMenus.push(menu);
  }

  document.addEventListener('click', function (ev) {
    if (!ev.target.closest('.pm6-tb-menu, .pm6-chat-more-menu, .pm6-tb-menu-trigger')) closeAll();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeAll();
  });
  window.addEventListener('resize', function () { closeAll(true); });
  window.addEventListener('scroll', function () {
    openMenus.forEach(function (m) { if (m._pmRailHome) positionRail(m); });
  }, true);

  function init(root) {
    (root || document).querySelectorAll('.pm6-tb-menu-wrap').forEach(upgradeWrap);
  }
  document.addEventListener('DOMContentLoaded', function () { init(); });

  window.PMMenu = { init: init, open: open, close: close, closeAll: closeAll, openAt: openAt, upgradeWrap: upgradeWrap };
})();
