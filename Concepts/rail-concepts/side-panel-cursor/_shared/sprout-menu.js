/* Sprout menu controller — Slint PopupWindow successor pattern. */
(function (global) {
  var openMenu = null;
  var openTrigger = null;

  function closeOpen() {
    if (openMenu) {
      openMenu.classList.remove('open');
      openMenu.setAttribute('aria-hidden', 'true');
    }
    if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
    openMenu = null;
    openTrigger = null;
  }

  function position(menu, trigger) {
    var r = trigger.getBoundingClientRect();
    var mw = Math.max(r.width, 160);
    menu.style.minWidth = mw + 'px';
    menu.style.left = Math.min(r.left, window.innerWidth - mw - 8) + 'px';
    var top = r.bottom + 4;
    menu.style.top = top + 'px';
    requestAnimationFrame(function () {
      var h = menu.offsetHeight;
      if (top + h > window.innerHeight - 8) {
        menu.style.top = Math.max(8, r.top - h - 4) + 'px';
      }
    });
  }

  function ensureMenuItems(menu) {
    if (menu._spSproutItemsBound) return;
    menu._spSproutItemsBound = true;
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('.sp-sprout-item');
      if (!item) return;
      e.stopPropagation();
      var trigger = openTrigger;
      var value = item.getAttribute('data-value');
      var label = item.getAttribute('data-label') || item.textContent.trim();
      menu.querySelectorAll('.sp-sprout-item').forEach(function (el) {
        el.setAttribute('aria-checked', el === item ? 'true' : 'false');
      });
      if (trigger) {
        var lab = trigger.querySelector('.sp-sprout-label');
        if (lab) lab.textContent = label;
        trigger.setAttribute('data-value', value || label);
        trigger.dispatchEvent(new CustomEvent('sp-sprout-change', {
          bubbles: true,
          detail: { value: value || label, label: label }
        }));
        if (typeof global.SPProto !== 'undefined' && SPProto.toast) {
          SPProto.toast((trigger.getAttribute('data-cmd') || 'select') + ' → ' + label);
        }
      }
      closeOpen();
    });
  }

  function bindTrigger(trigger) {
    if (!trigger || trigger._spSproutBound) return;
    var menuId = trigger.getAttribute('data-sprout-menu');
    var menu = menuId ? document.getElementById(menuId) : (
      trigger.classList.contains('sp-sprout-trigger') ? trigger.nextElementSibling : null
    );
    if (!menu || !menu.classList.contains('sp-sprout-menu')) return;
    trigger._spSproutBound = true;

    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    ensureMenuItems(menu);

    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-hidden', 'true');

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var wasOpen = openTrigger === trigger;
      closeOpen();
      if (wasOpen) return;
      position(menu, trigger);
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      openMenu = menu;
      openTrigger = trigger;
    });
  }

  function scan(root) {
    root = root || document;
    root.querySelectorAll('.sp-sprout-trigger, [data-sprout-menu]').forEach(bindTrigger);
  }

  document.addEventListener('click', function () { closeOpen(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeOpen();
  });
  window.addEventListener('resize', closeOpen);
  window.addEventListener('scroll', closeOpen, true);

  global.SPSprout = { scan: scan, close: closeOpen, bind: bindTrigger };
})(window);
