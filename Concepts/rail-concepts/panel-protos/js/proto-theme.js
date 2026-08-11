/* =====================================================================
   proto-theme.js — PM theme engine (port of PM_THEME).
   Switches data-theme on <html>, persists to localStorage, syncs the
   chrome (theme menu checkmarks). 8 themes.
   Slint note: themes become a `Theme` enum + a global property on the root;
   binding {root-theme} on every component's colors.
   ===================================================================== */
(function () {
  'use strict';

  var THEMES = [
    'friendly-dark', 'friendly-light',
    'retro-dark', 'retro-light',
    'basic-dark', 'basic-light',
    'glass-dark', 'glass-light'
  ];
  var DEFAULT = 'friendly-dark';
  var STORAGE_KEY = 'pm.proto.theme';

  var LABELS = {
    'friendly-dark': 'Friendly Dark',
    'friendly-light': 'Friendly Light',
    'retro-dark': 'Retro Dark',
    'retro-light': 'Retro Light',
    'basic-dark': 'Basic Dark',
    'basic-light': 'Basic Light',
    'glass-dark': 'Glass Dark',
    'glass-light': 'Glass Light'
  };

  function get() {
    var t = document.documentElement.getAttribute('data-theme');
    return THEMES.indexOf(t) >= 0 ? t : DEFAULT;
  }

  function syncChrome(theme) {
    // update trigger label
    var label = document.getElementById('themeMenuLabel');
    if (label) label.textContent = LABELS[theme] || theme;
    // update menu item selected state
    var items = document.querySelectorAll('#themeMenu .pm6-tb-menu-item[data-theme-value]');
    items.forEach(function (it) {
      var v = it.getAttribute('data-theme-value');
      it.classList.toggle('is-selected', v === theme);
    });
  }

  function set(theme, opts) {
    opts = opts || {};
    var t = THEMES.indexOf(theme) >= 0 ? theme : DEFAULT;
    document.documentElement.setAttribute('data-theme', t);
    if (opts.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, t); } catch (e) {}
    }
    syncChrome(t);
    document.dispatchEvent(new CustomEvent('proto:themechange', { detail: { theme: t } }));
    return t;
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && THEMES.indexOf(saved) >= 0) {
      set(saved, { persist: false });
    } else {
      syncChrome(get());
    }
  }

  window.PROTO_THEME = {
    THEMES: THEMES,
    LABELS: LABELS,
    DEFAULT: DEFAULT,
    get: get,
    set: set,
    syncChrome: syncChrome,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
