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
    if (menu._pmIsRail != null) return !!menu._pmIsRail;
    var homeParent =
      (menu._pmRailHome && menu._pmRailHome.parent) ||
      (menu.parentElement);
    if (homeParent && homeParent.closest && homeParent.closest('#sidePanelSlot')) {
      menu._pmIsRail = true;
      return true;
    }
    menu._pmIsRail = false;
    return false;
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

  function portalMenu(menu) {
    if (menu._pmRailHome) return;
    menu._pmRailHome = { parent: menu.parentNode, next: menu.nextSibling };
    document.body.appendChild(menu);
  }

  function positionFixed(menu, trig, opts) {
    opts = opts || {};
    portalMenu(menu);
    var tr = trig.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var pad = opts.pad != null ? opts.pad : 8;
    var minW = opts.minWidth != null ? opts.minWidth : Math.max(tr.width, 160);
    var maxW = opts.maxWidth != null ? opts.maxWidth : Math.min(320, vw - pad * 2);
    menu.style.position = 'fixed';
    menu.style.inset = 'auto';
    menu.style.bottom = 'auto';
    menu.style.right = 'auto';
    menu.style.zIndex = opts.zIndex || '500';
    menu.style.minWidth = Math.min(minW, maxW) + 'px';
    menu.style.maxWidth = maxW + 'px';
    menu.style.width = opts.fullWidth ? Math.min(tr.width, maxW) + 'px' : '';
    /* Measure after open class so height is real. */
    var mw = Math.min(menu.offsetWidth || minW, maxW);
    var mh = menu.offsetHeight || 180;
    var left = opts.clampLeft != null
      ? opts.clampLeft(tr, mw)
      : Math.max(pad, Math.min(tr.left, vw - mw - pad));
    var below = tr.bottom + 6;
    var up = below + mh > vh - pad && tr.top - mh - 6 > pad;
    menu.style.left = left + 'px';
    if (up) {
      menu.style.top = Math.max(pad, tr.top - mh - 6) + 'px';
      menu.style.setProperty('--pm6-sprout-oy', '100%');
    } else {
      menu.style.top = below + 'px';
      menu.style.setProperty('--pm6-sprout-oy', '0%');
    }
    menu.style.setProperty(
      '--pm6-sprout-ox',
      tr.left + tr.width / 2 < vw / 2 ? '12%' : '88%'
    );
    markMenuOpen(menu, true);
  }

  function positionRail(menu) {
    var slot = document.getElementById('sidePanelSlot');
    var trig = menu._pmTrigger;
    if (!slot || !trig) return;
    var sr = slot.getBoundingClientRect();
    var wrap = trig.closest('.pm6-tb-menu-wrap');
    var fullW = wrap && wrap.classList.contains('sh-bbranch');
    var avail = Math.max(80, sr.width - 8);
    positionFixed(menu, trig, {
      minWidth: fullW ? trig.getBoundingClientRect().width : Math.max(trig.getBoundingClientRect().width, 160),
      maxWidth: avail,
      fullWidth: !!fullW,
      zIndex: '400',
      pad: 4,
      clampLeft: function (tr, mw) {
        var left = fullW ? tr.left : Math.max(sr.left + 4, Math.min(tr.left, sr.right - mw - 4));
        if (left + mw > sr.right - 4) left = Math.max(sr.left + 4, sr.right - mw - 4);
        return left;
      }
    });
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

  function isReducedMotion() {
    return !!(
      window.PMChatMotion &&
      typeof window.PMChatMotion.isReduced === 'function' &&
      window.PMChatMotion.isReduced()
    );
  }

  function close(menu, instant) {
    if (!menu.classList.contains('is-open') && !menu.classList.contains('is-closing')) return;
    var useInstant = !!instant || isReducedMotion();
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');
    var trig = menu._pmTrigger;
    if (trig) trig.setAttribute('aria-expanded', 'false');
    markMenuOpen(menu, false);
    var done = function () {
      menu.classList.remove('is-closing');
      restoreRailHome(menu);
    };
    if (useInstant) { done(); } else { setTimeout(done, 240); }
    var i = openMenus.indexOf(menu);
    if (i !== -1) openMenus.splice(i, 1);
  }

  function open(menu, anchorRect, instant) {
    closeAll(instant || isReducedMotion());
    /* Mutual exclusion with search sprout */
    try {
      document.querySelectorAll('[data-search-panel].is-open, .pm-search-panel.is-open').forEach(function (panel) {
        panel.classList.remove('is-open');
        panel.classList.add('is-closing');
        panel.hidden = true;
        window.setTimeout(function () {
          panel.classList.remove('is-closing');
        }, 200);
      });
    } catch (_) {}
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    var trig = menu._pmTrigger;
    if (isRailMenu(menu)) {
      positionRail(menu);
      requestAnimationFrame(function () { positionRail(menu); });
    } else if (trig) {
      /* Portal all chat/title sprouts to body so overflow:hidden chrome
         cannot clip High/Agent (live audit w750 failure). */
      positionFixed(menu, trig, { minWidth: 168, maxWidth: Math.min(320, window.innerWidth - 16) });
      requestAnimationFrame(function () {
        if (menu.classList.contains('is-open')) {
          positionFixed(menu, trig, { minWidth: 168, maxWidth: Math.min(320, window.innerWidth - 16) });
        }
      });
    } else if (anchorRect) {
      position(menu, anchorRect);
    }
    if (trig) trig.setAttribute('aria-expanded', 'true');
    openMenus.push(menu);
  }

  function closeAll(instant) {
    var useInstant = !!instant || isReducedMotion();
    openMenus.slice().forEach(function (m) { close(m, useInstant); });
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
      var nestEffort = item.closest('[data-effort-nest]');
      if (menu.hasAttribute('data-pm-menu-select') && !nestEffort) {
        menu.querySelectorAll('[data-menu-items] [role="menuitem"], [role="menuitem"]:not([data-effort-nest] *)').forEach(function (it) {
          if (it.closest('[data-effort-nest]')) return;
          it.classList.remove('is-selected');
        });
        item.classList.add('is-selected');
        var label = wrap.querySelector('.pm6-tb-menu-label');
        if (label) label.textContent = item.getAttribute('data-label') || item.textContent.trim();
        var val = item.getAttribute('data-value');
        if (val != null) {
          wrap.setAttribute('data-value', val);
          wrap.dispatchEvent(new CustomEvent('pm-menu-change', { detail: { value: val }, bubbles: true }));
        }
      } else if (nestEffort) {
        nestEffort.querySelectorAll('[role="menuitem"]').forEach(function (it) {
          it.classList.remove('is-selected');
        });
        item.classList.add('is-selected');
      }
      menu.dispatchEvent(
        new CustomEvent('pm-menu-pick', {
          detail: {
            item: item,
            value: item.getAttribute('data-value'),
            kind: nestEffort ? 'effort' : null
          },
          bubbles: true
        })
      );
      /* Actions on portaled menus cannot bubble to chrome roots — re-emit on wrap. */
      if (item.hasAttribute('data-action') || item.hasAttribute('data-search-scope')) {
        var homeWrap =
          (menu._pmTrigger && menu._pmTrigger.closest('.pm6-tb-menu-wrap')) || wrap;
        if (homeWrap) {
          homeWrap.dispatchEvent(
            new CustomEvent('pm-menu-action', {
              detail: {
                action: item.getAttribute('data-action'),
                searchScope: item.getAttribute('data-search-scope'),
                item: item
              },
              bubbles: true
            })
          );
        }
      }
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
    if (!ev.target.closest('.pm6-tb-menu, .pm6-chat-more-menu, .pm6-tb-menu-trigger')) closeAll(isReducedMotion());
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeAll(isReducedMotion());
  });
  window.addEventListener('resize', function () { closeAll(true); });
  window.addEventListener('scroll', function () {
    openMenus.forEach(function (m) {
      if (!m._pmRailHome || !m._pmTrigger) return;
      if (isRailMenu(m)) positionRail(m);
      else positionFixed(m, m._pmTrigger, { minWidth: 168, maxWidth: Math.min(320, window.innerWidth - 16) });
    });
  }, true);

  function init(root) {
    (root || document).querySelectorAll('.pm6-tb-menu-wrap').forEach(upgradeWrap);
  }
  document.addEventListener('DOMContentLoaded', function () { init(); });

  window.PMMenu = { init: init, open: open, close: close, closeAll: closeAll, openAt: openAt, upgradeWrap: upgradeWrap };
})();
