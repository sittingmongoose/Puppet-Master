/* =====================================================================
   proto-sprout.js — PM "sprout" popout menu engine (port of PM6_SPROUT +
   tbMenu helpers). Opens/closes .pm6-tb-menu panels with the springy
   corner-anchored grow animation. No native <select>/<dialog>.
   Slint note: a menu = a PopupWindow with a spring scale animation +
   a focus/escape/click-away dismiss state machine.
   ===================================================================== */
(function () {
  'use strict';

  function motionReduced() {
    return document.documentElement.getAttribute('data-motion') === 'reduced';
  }

  function isOpen(el) {
    return !!(el && el.classList.contains('is-open') && !el.classList.contains('is-closing'));
  }

  /* Pin open/close sprout to the corner/edge nearest the trigger. */
  function setPopoutSprout(menuEl, anchorEl) {
    if (!menuEl || !anchorEl) return;
    var prevTf = menuEl.style.transform;
    menuEl.style.transform = 'none';
    void menuEl.offsetWidth;
    var pr = menuEl.getBoundingClientRect();
    menuEl.style.transform = prevTf;
    var ar = anchorEl.getBoundingClientRect();
    if (!pr.width || !pr.height) return;

    var ax = ar.left + ar.width / 2;
    var ay = ar.top + ar.height / 2;

    var ox = ((ax - pr.left) / pr.width) * 100;
    var oy = ((ay - pr.top) / pr.height) * 100;
    var snapX = ox < 50 ? 12 : 88;
    var snapY = oy < 50 ? 8 : 100;
    if (ay >= pr.bottom - 2) snapY = 100;
    else if (ay <= pr.top + 2) snapY = 0;
    if (ax <= pr.left + 2) snapX = 8;
    else if (ax >= pr.right - 2) snapX = 92;

    // For menus that are taller than the viewport below the trigger,
    // flip to grow from the bottom edge upward.
    var fromBottom = snapY >= 50;

    menuEl.style.setProperty('--pm6-sprout-ox', snapX + '%');
    menuEl.style.setProperty('--pm6-sprout-oy', snapY + '%');
    menuEl.style.setProperty('--pm6-sprout-tx', '0px');
    menuEl.style.setProperty('--pm6-sprout-ty', fromBottom ? '10px' : '-10px');
    menuEl.style.setProperty('--pm6-sprout-sx', '0.72');
    menuEl.style.setProperty('--pm6-sprout-sy', '0.48');
  }

  function open(menuEl, anchorEl) {
    if (!menuEl) return;
    menuEl.classList.remove('is-closing');
    menuEl.style.display = 'block';
    if (anchorEl) setPopoutSprout(menuEl, anchorEl);
    void menuEl.offsetWidth;
    menuEl.classList.add('is-open');
    // The menu is position:fixed, so place it at viewport coords derived from
    // the trigger rect. This escapes any overflow:hidden ancestor (the panel
    // host) so the dropdown is never clipped by the narrow panel.
    if (anchorEl) {
      var ar = anchorEl.getBoundingClientRect();
      var isLeft = menuEl.classList.contains('sprout-left');
      var mw = menuEl.getBoundingClientRect().width;
      var mh = menuEl.getBoundingClientRect().height;
      // horizontal: left-anchored menus align to the trigger's left edge,
      // right-anchored (default) align to the trigger's right edge.
      var leftPx = isLeft ? ar.left : Math.max(8, ar.right - mw);
      // keep on screen horizontally
      leftPx = Math.min(leftPx, window.innerWidth - mw - 8);
      leftPx = Math.max(8, leftPx);
      // vertical: open below by default; flip above if no room below
      var openBelow = ar.bottom + mh + 12 <= window.innerHeight;
      var topPx = openBelow ? ar.bottom + 6 : Math.max(8, ar.top - mh - 6);
      menuEl.style.left = leftPx + 'px';
      menuEl.style.top = topPx + 'px';
    }
  }

  function close(menuEl, onDone) {
    if (!menuEl) { if (onDone) onDone(); return; }
    if (!menuEl.classList.contains('is-open') && menuEl.style.display === 'none') {
      if (onDone) onDone();
      return;
    }
    menuEl.classList.remove('is-open');
    menuEl.classList.add('is-closing');
    var done = false;
    function finish(ev) {
      if (done) return;
      if (ev && ev.target !== menuEl) return;
      if (ev && ev.propertyName && ev.propertyName !== 'opacity' && ev.propertyName !== 'transform') return;
      done = true;
      menuEl.classList.remove('is-closing');
      menuEl.style.display = 'none';
      menuEl.removeEventListener('transitionend', finish);
      if (onDone) onDone();
    }
    menuEl.addEventListener('transitionend', finish);
    setTimeout(finish, 360);
  }

  /* ---- wrapper helpers operating on a .pm6-tb-menu-wrap ---- */

  function getWrap(wrapOrEl) {
    if (!wrapOrEl) return null;
    if (wrapOrEl.classList && wrapOrEl.classList.contains('pm6-tb-menu-wrap')) return wrapOrEl;
    var w = wrapOrEl.closest ? wrapOrEl.closest('.pm6-tb-menu-wrap') : null;
    return w;
  }

  function openWrap(wrap) {
    if (!wrap) return;
    var menu = wrap.querySelector('.pm6-tb-menu');
    var trigger = wrap.querySelector('.pm6-tb-menu-trigger');
    if (!menu || !trigger) return;
    // close all other menus first
    closeAllExcept(wrap);
    trigger.setAttribute('aria-expanded', 'true');
    open(menu, trigger);
  }

  function closeWrap(wrap) {
    if (!wrap) return;
    var menu = wrap.querySelector('.pm6-tb-menu');
    var trigger = wrap.querySelector('.pm6-tb-menu-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) close(menu);
  }

  function closeAllExcept(exceptWrap) {
    var wraps = document.querySelectorAll('.pm6-tb-menu-wrap');
    wraps.forEach(function (w) {
      if (w !== exceptWrap) {
        var m = w.querySelector('.pm6-tb-menu');
        var t = w.querySelector('.pm6-tb-menu-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
        if (m && (m.classList.contains('is-open') || m.style.display !== 'none')) close(m);
      }
    });
  }

  /* Wire all sprout menus on the page. Delegation: trigger click toggles;
     item click fires a callback (data-on-select) then closes;
     click-away + Escape close. */
  function wire() {
    document.addEventListener('click', function (ev) {
      var trig = ev.target.closest('.pm6-tb-menu-trigger');
      if (trig) {
        var wrap = trig.closest('.pm6-tb-menu-wrap');
        var menu = wrap && wrap.querySelector('.pm6-tb-menu');
        if (menu && isOpen(menu)) {
          closeWrap(wrap);
        } else {
          openWrap(wrap);
        }
        ev.stopPropagation();
        return;
      }
      // item click
      var item = ev.target.closest('.pm6-tb-menu-item');
      if (item) {
        var iwrap = item.closest('.pm6-tb-menu-wrap');
        // mark selected within this menu if it's a single-select menu
        if (iwrap && iwrap.getAttribute('data-select') === 'single') {
          iwrap.querySelectorAll('.pm6-tb-menu-item').forEach(function (i) {
            i.classList.remove('is-selected');
          });
          item.classList.add('is-selected');
        }
        // fire callback
        var cb = item.getAttribute('data-on-select');
        if (cb && typeof window[cb] === 'function') {
          try { window[cb](item, iwrap); } catch (e) { console.warn(e); }
        }
        closeWrap(iwrap);
        ev.stopPropagation();
        return;
      }
      // click-away
      if (!ev.target.closest('.pm6-tb-menu-wrap')) {
        closeAllExcept(null);
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeAllExcept(null);
    });
  }

  window.PROTO_SPROUT = {
    isOpen: isOpen,
    open: open,
    close: close,
    openWrap: openWrap,
    closeWrap: closeWrap,
    closeAllExcept: closeAllExcept,
    setPopoutSprout: setPopoutSprout,
    wire: wire
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
