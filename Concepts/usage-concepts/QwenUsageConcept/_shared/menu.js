/* rail-concepts/_shared/menu.js
   The Puppet Master sprout-menu family — one behavior contract for every menu
   in the app (title-bar theme/project menus, chat more-menu, and the
   replacements for all native <select>/context menus in these concepts).

   Behavior source of truth: Plans/assistant-chat-design.md ACD-439/441/442
   (corner-origin sprout, click-to-open only, Esc/outside close, mutual
   exclusion) + PMConcept7.html:12421-12536 (CSS chrome) + FinalGUISpec
   F3-424 (Slint PopupWindow mapping) / F3-242 (custom context menu, Slint has
   no built-in one).

   Slint note: each menu is an opaque precomputed surface; the sprout is a
   transform+opacity property animation -> PopupWindow. No portals, no
   measure-then-write: flip decisions are made once at open. */
(function () {
  'use strict';
  var openMenus = [];

  /* Fallback close duration, nominal --mo-popup-close-dur (k=1) from
     usage-shared.css. The real timeout is measured from the element's computed
     transition (see closeDurationMs) so themes that scale --pm-motion-k (glass
     1.33 -> ~200ms) still finish their close cleanly — dropping .is-closing
     mid-transition snaps the menu away before the fade completes. */
  var POPUP_CLOSE_MS = 150;

  /* Longest transition channel (duration + delay) currently applied to the menu,
     in ms. Read AFTER .is-closing is on, so the close transitions are live. */
  function closeDurationMs(menu) {
    try {
      var cs = window.getComputedStyle(menu);
      var durs = String(cs.transitionDuration || '').split(',');
      var dels = String(cs.transitionDelay || '').split(',');
      function toMs(v) {
        v = String(v).trim();
        var n = parseFloat(v);
        if (!isFinite(n)) return 0;
        return /ms\s*$/.test(v) ? n : n * 1000; /* computed style reports s */
      }
      var max = 0;
      for (var i = 0; i < durs.length; i++) max = Math.max(max, toMs(durs[i]) + toMs(dels[i] || '0'));
      return max > 0 ? max : POPUP_CLOSE_MS;
    } catch (e) { return POPUP_CLOSE_MS; }
  }

  /* ACD-438: one popup at a time across the three popup systems
     (menus, context lens, widget popups). Guarded — siblings may not be loaded. */
  function closeForeignPopups() {
    try { if (window.PMContext && typeof window.PMContext.closeAll === 'function') window.PMContext.closeAll(); } catch (e) {}
    try { if (window.PMWidgets && typeof window.PMWidgets.closeAll === 'function') window.PMWidgets.closeAll(); } catch (e) {}
  }

  function nearestCorner(menu, anchorRect) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var cx = anchorRect.left + anchorRect.width / 2;
    var ox = cx < vw / 2 ? '12%' : '88%';
    var below = anchorRect.bottom + 6;
    var est = menu.offsetHeight || 180;
    var oy = (below + est > vh - 8 && anchorRect.top - est - 6 > 8) ? '100%' : '0%';
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
    if (!menu.classList.contains('is-open')) return;
    /* restore focus to the trigger only when focus is inside the menu (Esc or
       item activation). An outside click already moved focus elsewhere, and an
       instant (resize) close must not steal it. */
    var restoreFocus = !instant && (menu === document.activeElement || menu.contains(document.activeElement));
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');
    var trig = menu._pmTrigger;
    if (trig) trig.setAttribute('aria-expanded', 'false');
    var done = function () { menu.classList.remove('is-closing'); };
    /* measured close + one frame of slack: the timeout now outlives the CSS
       close transition, so the fade/scale-out is never cut short. Landing on
       the base state early would be visually identical (same collapsed pose),
       but landing late is what actually lets the transition finish. */
    if (instant) { done(); } else { setTimeout(done, closeDurationMs(menu) + 16); }
    var i = openMenus.indexOf(menu);
    if (i !== -1) openMenus.splice(i, 1);
    if (restoreFocus && trig && typeof trig.focus === 'function') trig.focus();
  }

  function open(menu, anchorRect, instant) {
    closeAll(instant);
    closeForeignPopups();
    if (anchorRect) position(menu, anchorRect);
    /* the menu is never display:none anymore (visibility-based sprout), so its
       closed pose is always live; flush style here so the .is-open flip starts
       a real transition instead of painting the open pose on the first frame */
    if (!instant) { void menu.offsetWidth; }
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    var trig = menu._pmTrigger;
    if (trig) trig.setAttribute('aria-expanded', 'true');
    openMenus.push(menu);
    /* move focus into the menu on open: body-appended sprouts (widget kebab,
       add-picker) sit ~60 tab stops past their trigger, so without this a
       keyboard user can never reach a menuitem. The browser re-asserts focus on
       the just-activated trigger for a few frames, so re-assert the item each
       frame until it sticks (self-clearing; no fixed delay). Mouse opens are
       unaffected (programmatic focus doesn't trip :focus-visible). */
    var first = menu.querySelector('[role="menuitem"]:not([disabled])');
    if (first && !instant) {
      var tries = 0;
      (function takeFocus() {
        if (!menu.isConnected || !menu.classList.contains('is-open')) return;
        first.focus();
        if (document.activeElement !== first && ++tries < 12) requestAnimationFrame(takeFocus);
      })();
    }
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
      if (!item || item.hasAttribute('disabled')) return;
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
    closeForeignPopups();
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

  function init(root) {
    (root || document).querySelectorAll('.pm6-tb-menu-wrap').forEach(upgradeWrap);
  }
  document.addEventListener('DOMContentLoaded', function () { init(); });

  window.PMMenu = { init: init, open: open, close: close, closeAll: closeAll, openAt: openAt, upgradeWrap: upgradeWrap };
})();
