/* fable Settings Bakeoff - shared shell controller.
   window.PMShell: init({concept, onWidthChange?, onThemeChange?}),
   status(msg), toast(msg).
   Persistence lives ONLY under pm.settingsConcepts.fable.<concept>.<key>.
   Hub bridge implements the validate.py contract (pm-concept-ready /
   pm-concept-state literals live in this file by contract). */
(function () {
  'use strict';

  var THEMES = [
    { id: 'friendly-dark', label: 'Friendly Dark', bg: '#211E26', accent: '#6FC6E8' },
    { id: 'friendly-light', label: 'Friendly Light', bg: '#FBF7F3', accent: '#3F9CC7' },
    { id: 'glass-dark', label: 'Glass Dark', bg: '#241B36', accent: '#B79CFF' },
    { id: 'glass-light', label: 'Glass Light', bg: '#E4CDE4', accent: '#8B6ED9' },
    { id: 'retro-dark', label: 'Retro Dark', bg: '#1A1A1A', accent: '#00FF41' },
    { id: 'retro-light', label: 'Retro Light', bg: '#F5F0E8', accent: '#0047AB' },
    { id: 'basic-dark', label: 'Basic Dark', bg: '#121212', accent: '#64B5F6' },
    { id: 'basic-light', label: 'Basic Light', bg: '#EAECEF', accent: '#0056B3' }
  ];

  var RAIL_ITEMS = [
    { ico: 'search', label: 'Search' },
    { ico: 'folder', label: 'Projects' },
    { ico: 'branch', label: 'Worktrees' },
    { ico: 'terminal', label: 'Terminals' },
    { ico: 'puzzle', label: 'Extensions' },
    { ico: 'gauge', label: 'Usage' },
    { ico: 'history', label: 'History' }
  ];

  var state = {
    concept: 'shared',
    onWidthChange: null,
    onThemeChange: null,
    themeMenuOpen: false,
    overflowOpen: false
  };

  var els = {};
  var toastEl = null;
  var toastTimer = 0;

  /* ---------- persistence (defensive; storage can be unavailable) ---- */

  function nsKey(key) {
    return 'pm.settingsConcepts.fable.' + state.concept + '.' + key;
  }

  function loadPref(key) {
    try { return window.localStorage.getItem(nsKey(key)); } catch (err) { return null; }
  }

  function savePref(key, value) {
    try { window.localStorage.setItem(nsKey(key), String(value)); } catch (err) { /* storage unavailable */ }
  }

  /* ---------- small helpers ---------------------------------------- */

  function byId(id) { return document.getElementById(id); }

  function hydrateIcons(root) {
    try {
      if (window.PMIcons && window.PMIcons.hydrate) { window.PMIcons.hydrate(root || document); }
    } catch (err) { /* icons are decorative; never fail the shell */ }
  }

  function safeCall(fn, arg) {
    if (typeof fn !== 'function') { return; }
    try { fn(arg); } catch (err) { /* concept callback errors stay contained */ }
  }

  /* ---------- statusbar + toast ------------------------------------ */

  function status(msg) {
    var slot = byId('pmStatusLeft');
    if (slot) { slot.textContent = msg == null ? '' : String(msg); }
  }

  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'pm-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg == null ? '' : String(msg);
    toastEl.classList.add('is-visible');
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2800);
  }

  /* ---------- rail / chat / motion / theme application -------------- */

  function applyRail(open, persist) {
    if (els.shell) { els.shell.classList.toggle('rail-collapsed', !open); }
    if (els.railToggle) { els.railToggle.setAttribute('aria-pressed', String(!!open)); }
    if (persist) { savePref('railOpen', open ? '1' : '0'); }
  }

  function applyChat(open, persist) {
    if (els.chat) { els.chat.hidden = !open; }
    if (els.shell) { els.shell.classList.toggle('chat-open', !!open); }
    if (els.chatToggle) { els.chatToggle.setAttribute('aria-pressed', String(!!open)); }
    if (persist) { savePref('chatOpen', open ? '1' : '0'); }
  }

  function applyMotion(reduced, persist) {
    var root = document.documentElement;
    if (reduced) {
      root.setAttribute('data-motion', 'reduced');
      root.setAttribute('data-reduced-motion', '1');
    } else {
      root.setAttribute('data-motion', 'full');
      root.removeAttribute('data-reduced-motion');
    }
    if (els.motionToggle) { els.motionToggle.setAttribute('aria-pressed', String(!!reduced)); }
    if (persist) { savePref('reducedMotion', reduced ? '1' : '0'); }
  }

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) { return THEMES[i]; }
    }
    return null;
  }

  function applyTheme(id, persist) {
    var theme = themeById(id);
    if (!theme) { return; }
    var root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.colorScheme = /-dark$/.test(theme.id) ? 'dark' : 'light';
    if (els.themeMenu) {
      var items = els.themeMenu.querySelectorAll('.pm-theme-item');
      for (var i = 0; i < items.length; i++) {
        items[i].setAttribute('aria-checked', String(items[i].getAttribute('data-theme-id') === theme.id));
      }
    }
    if (persist) { savePref('theme', theme.id); }
    safeCall(state.onThemeChange, theme.id);
  }

  /* ---------- theme menu -------------------------------------------- */

  function swatchSvg(theme) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="2" y="2" width="20" height="20" rx="6" fill="' + theme.bg + '" stroke="rgba(128,128,128,.45)" stroke-width="1"/>' +
      '<circle cx="14.5" cy="12" r="4" fill="' + theme.accent + '"/>' +
      '</svg>';
  }

  function buildThemeMenu() {
    if (!els.themeMenu) { return; }
    els.themeMenu.innerHTML = '';
    for (var i = 0; i < THEMES.length; i++) {
      (function (theme) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'pm-theme-item';
        item.setAttribute('role', 'menuitemradio');
        item.setAttribute('aria-checked', 'false');
        item.setAttribute('data-theme-id', theme.id);
        item.tabIndex = -1;
        item.innerHTML =
          '<span class="pm-theme-swatch">' + swatchSvg(theme) + '</span>' +
          '<span>' + theme.label + '</span>' +
          '<span class="pm-theme-check"><i data-ico="check"></i></span>';
        item.addEventListener('click', function () {
          applyTheme(theme.id, true);
          closeThemeMenu(true);
        });
        els.themeMenu.appendChild(item);
      })(THEMES[i]);
    }
    hydrateIcons(els.themeMenu);
    els.themeMenu.addEventListener('keydown', onThemeMenuKeydown);
  }

  function themeMenuItems() {
    return els.themeMenu ? els.themeMenu.querySelectorAll('.pm-theme-item') : [];
  }

  function openThemeMenu() {
    if (!els.themeMenu || !els.themeBtn) { return; }
    els.themeMenu.hidden = false;
    els.themeBtn.setAttribute('aria-expanded', 'true');
    state.themeMenuOpen = true;
    var items = themeMenuItems();
    var focusTarget = items.length ? items[0] : null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('aria-checked') === 'true') { focusTarget = items[i]; }
    }
    if (focusTarget) { focusTarget.focus(); }
  }

  function closeThemeMenu(refocus) {
    if (!els.themeMenu || !els.themeBtn) { return; }
    els.themeMenu.hidden = true;
    els.themeBtn.setAttribute('aria-expanded', 'false');
    state.themeMenuOpen = false;
    if (refocus) { els.themeBtn.focus(); }
  }

  function onThemeMenuKeydown(ev) {
    var items = themeMenuItems();
    if (!items.length) { return; }
    var current = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i] === document.activeElement) { current = i; }
    }
    var next = -1;
    if (ev.key === 'ArrowDown') { next = (current + 1) % items.length; }
    else if (ev.key === 'ArrowUp') { next = current <= 0 ? items.length - 1 : current - 1; }
    else if (ev.key === 'Home') { next = 0; }
    else if (ev.key === 'End') { next = items.length - 1; }
    else if (ev.key === 'Escape') {
      ev.preventDefault();
      closeThemeMenu(true);
      return;
    } else { return; }
    ev.preventDefault();
    items[next].focus();
  }

  /* ---------- quiet rail -------------------------------------------- */

  function fillRail() {
    if (!els.rail) { return; }
    els.rail.innerHTML = '';
    for (var i = 0; i < RAIL_ITEMS.length; i++) {
      /* Decorative shell chrome: inert spans, not fake actions. */
      var item = document.createElement('span');
      item.className = 'pm-rail-item';
      item.setAttribute('aria-hidden', 'true');
      item.innerHTML = '<i data-ico="' + RAIL_ITEMS[i].ico + '"></i>';
      els.rail.appendChild(item);
    }
    hydrateIcons(els.rail);
  }

  /* ---------- Assistant panel --------------------------------------- */

  function fillChat() {
    if (!els.chatBody) { return; }
    els.chatBody.innerHTML = '';

    var placeholder = document.createElement('p');
    placeholder.className = 'pm-chat-placeholder';
    placeholder.textContent = 'The Assistant thread for this workspace opens here. Nothing is running right now.';
    els.chatBody.appendChild(placeholder);

    var composer = document.createElement('div');
    composer.className = 'pm-chat-composer';
    composer.contentEditable = 'true';
    composer.setAttribute('role', 'textbox');
    composer.setAttribute('aria-multiline', 'true');
    composer.setAttribute('aria-label', 'Message the Assistant');
    composer.setAttribute('data-placeholder', 'Message the Assistant');
    els.chatBody.appendChild(composer);

    var hint = document.createElement('div');
    hint.className = 'pm-chat-hint';
    hint.textContent = 'Drafts stay on this machine. Spellcheck runs in this composer.';
    els.chatBody.appendChild(hint);

    try {
      if (window.PMSpell && window.PMSpell.attach) {
        window.PMSpell.attach(composer, { store: state.store || null, projectDict: true });
      }
    } catch (err) { /* spellcheck is optional; composer still works */ }

    buildOverflowMenu();
  }

  function buildOverflowMenu() {
    if (!els.chatOverflow) { return; }
    var head = els.chatOverflow.parentNode;
    var menu = document.createElement('div');
    menu.className = 'pm-overflow-menu';
    menu.id = 'pmChatOverflowMenu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;

    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'pm-menu-item';
    item.setAttribute('role', 'menuitem');
    item.innerHTML = '<i data-ico="eyeOff"></i><span>Turn off spellcheck for this thread</span>';
    item.addEventListener('click', function () {
      closeOverflowMenu(true);
      try {
        if (window.PMState && window.PMState.receipt) {
          var receipt = window.PMState.receipt('Turn off spellcheck for this thread', 'Assistant panel thread option');
          if (receipt && receipt.message) { toast(receipt.message); }
        } else {
          toast('Simulated: spellcheck would be turned off for this thread.');
        }
      } catch (err) {
        toast('Simulated: spellcheck would be turned off for this thread.');
      }
    });
    menu.appendChild(item);
    head.appendChild(menu);
    els.overflowMenu = menu;
    hydrateIcons(menu);

    els.chatOverflow.setAttribute('aria-expanded', 'false');
    els.chatOverflow.addEventListener('click', function () {
      if (state.overflowOpen) { closeOverflowMenu(true); } else { openOverflowMenu(); }
    });
    menu.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeOverflowMenu(true);
      }
    });
  }

  function openOverflowMenu() {
    if (!els.overflowMenu) { return; }
    els.overflowMenu.hidden = false;
    els.chatOverflow.setAttribute('aria-expanded', 'true');
    state.overflowOpen = true;
    var first = els.overflowMenu.querySelector('.pm-menu-item');
    if (first) { first.focus(); }
  }

  function closeOverflowMenu(refocus) {
    if (!els.overflowMenu) { return; }
    els.overflowMenu.hidden = true;
    els.chatOverflow.setAttribute('aria-expanded', 'false');
    state.overflowOpen = false;
    if (refocus) { els.chatOverflow.focus(); }
  }

  /* ---------- title-bar notification stack ---------------------------
     Canon: the title-bar stack with count badge and sprout inbox is the
     SOLE in-app notification affordance. Session-only; never persisted. */

  var notifications = [];

  function buildNotifyStack() {
    var titlebar = document.querySelector('.pm-titlebar');
    var controls = document.querySelector('.pm-tb-controls');
    if (!titlebar || !controls || byId('pmNotifyBtn')) { return; }

    var wrap = document.createElement('div');
    wrap.className = 'pm-notify-wrap';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-tb-btn pm-notify-btn';
    btn.id = 'pmNotifyBtn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.title = 'Notifications';
    btn.innerHTML = '<i data-ico="wave"></i>' +
      '<span class="pm-notify-count" id="pmNotifyCount" hidden>0</span>' +
      '<span class="pm-visually-hidden">Notifications</span>';

    var inbox = document.createElement('div');
    inbox.className = 'pm-notify-inbox';
    inbox.id = 'pmNotifyInbox';
    inbox.setAttribute('role', 'dialog');
    inbox.setAttribute('aria-label', 'Notifications');
    inbox.hidden = true;

    wrap.appendChild(btn);
    wrap.appendChild(inbox);
    titlebar.insertBefore(wrap, controls);
    hydrateIcons(wrap);
    els.notifyBtn = btn;
    els.notifyInbox = inbox;
    els.notifyCount = byId('pmNotifyCount');

    function renderInbox() {
      inbox.innerHTML = '';
      var head = document.createElement('div');
      head.className = 'pm-notify-head';
      head.textContent = notifications.length
        ? (notifications.length === 1 ? '1 notification' : notifications.length + ' notifications')
        : 'No notifications';
      inbox.appendChild(head);
      for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i];
        var row = document.createElement('div');
        row.className = 'pm-notify-item';
        row.innerHTML = '<strong></strong><span></span>';
        row.querySelector('strong').textContent = n.title;
        row.querySelector('span').textContent = n.detail || '';
        inbox.appendChild(row);
      }
      if (notifications.length) {
        var clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'pm-notify-clear';
        clear.textContent = 'Clear all';
        clear.addEventListener('click', function () {
          notifications = [];
          updateCount();
          renderInbox();
        });
        inbox.appendChild(clear);
      }
    }

    function updateCount() {
      if (!els.notifyCount) { return; }
      els.notifyCount.textContent = String(notifications.length);
      els.notifyCount.hidden = notifications.length === 0;
    }

    function openInbox() {
      renderInbox();
      inbox.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      state.notifyOpen = true;
    }
    function closeInbox(refocus) {
      inbox.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      state.notifyOpen = false;
      if (refocus) { btn.focus(); }
    }

    btn.addEventListener('click', function () {
      if (state.notifyOpen) { closeInbox(true); } else { openInbox(); }
    });
    inbox.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); closeInbox(true); }
    });
    document.addEventListener('mousedown', function (ev) {
      if (state.notifyOpen && !inbox.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)) {
        closeInbox(false);
      }
    });

    state._notifyInternals = { updateCount: updateCount, renderInbox: renderInbox };
  }

  function notify(entry) {
    if (!entry || (!entry.title && !entry.detail)) { return; }
    notifications.unshift({
      title: String(entry.title || 'Notification'),
      detail: entry.detail == null ? '' : String(entry.detail),
      when: Date.now()
    });
    if (notifications.length > 30) { notifications.length = 30; }
    if (state._notifyInternals) {
      state._notifyInternals.updateCount();
      if (state.notifyOpen) { state._notifyInternals.renderInbox(); }
    }
    if (els.notifyBtn && document.documentElement.getAttribute('data-motion') !== 'reduced') {
      els.notifyBtn.classList.remove('pm-notify-join');
      void els.notifyBtn.offsetWidth; /* restart the one-shot join animation */
      els.notifyBtn.classList.add('pm-notify-join');
    }
  }

  function notificationCount() { return notifications.length; }

  /* Route hook: deterministic deep links may force theme/motion when the
     page runs standalone. Hub postMessage remains authoritative when present. */
  function applyView(view) {
    if (!view || typeof view !== 'object') { return; }
    if (typeof view.theme === 'string' && themeById(view.theme)) { applyTheme(view.theme, false); }
    if (typeof view.reducedMotion === 'boolean') { applyMotion(view.reducedMotion, false); }
  }

  /* ---------- ConceptHub bridge (validate.py contract) --------------- */

  function applyHubState(hubState) {
    if (!hubState || typeof hubState !== 'object') { return; }
    var root = document.documentElement;

    if (typeof hubState.theme === 'string' && themeById(hubState.theme)) {
      applyTheme(hubState.theme, false);
    }

    if (typeof hubState.reducedMotion === 'boolean') {
      applyMotion(hubState.reducedMotion, false);
    }

    var widthChanged = false;
    if (typeof hubState.testWidth === 'number' && isFinite(hubState.testWidth)) {
      var role = typeof hubState.widthRole === 'string' && /^[a-z][a-z-]*$/.test(hubState.widthRole)
        ? hubState.widthRole : 'page';
      root.style.setProperty('--hub-test-width', hubState.testWidth + 'px');
      root.style.setProperty('--hub-' + role + '-width', hubState.testWidth + 'px');
      widthChanged = true;
    }
    if (typeof hubState.viewportWidth === 'number' && isFinite(hubState.viewportWidth)) {
      root.style.setProperty('--hub-viewport-width', hubState.viewportWidth + 'px');
      widthChanged = true;
    }
    if (widthChanged && els.shell) {
      safeCall(state.onWidthChange, els.shell.getBoundingClientRect().width);
    }
  }

  function mountHubBridge() {
    window.addEventListener('message', function (ev) {
      try {
        var data = ev.data;
        if (!data || typeof data !== 'object') { return; }
        if (data.source !== 'pm-concept-hub') { return; }
        if (data.type !== 'pm-concept-state') { return; }
        applyHubState(data.state || data);
      } catch (err) { /* never let a malformed hub message break the page */ }
    });

    function postReady() {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            source: 'pm-concept',
            type: 'pm-concept-ready',
            version: 1,
            capabilities: { theme: true, reducedMotion: true, testWidth: true }
          }, '*');
        }
      } catch (err) { /* cross-origin parent; nothing to do */ }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', postReady);
    } else {
      postReady();
    }
  }

  /* ---------- responsive rail (ResizeObserver, not media query, so
     hub-driven width changes count) -------------------------------- */

  function mountResizeWatcher() {
    if (!els.shell) { return; }
    /* Concepts whose wide layout needs more room (e.g. three columns) can
       raise the collapse threshold via init({ narrowAt }). Default 900. */
    var threshold = state.narrowAt || 900;
    var handle = function (width) {
      els.shell.classList.toggle('is-narrow', width < threshold);
      safeCall(state.onWidthChange, width);
    };
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          handle(entries[i].contentRect.width);
        }
      });
      ro.observe(els.shell);
    } else {
      window.addEventListener('resize', function () {
        handle(els.shell.getBoundingClientRect().width);
      });
    }
    handle(els.shell.getBoundingClientRect().width);
  }

  /* ---------- init --------------------------------------------------- */

  function init(opts) {
    opts = opts || {};
    if (typeof opts.concept === 'string' && opts.concept) { state.concept = opts.concept; }
    state.onWidthChange = opts.onWidthChange || null;
    state.onThemeChange = opts.onThemeChange || null;
    state.store = opts.store || null;
    state.narrowAt = (typeof opts.narrowAt === 'number' && opts.narrowAt > 0) ? opts.narrowAt : null;

    els.shell = byId('pmShell');
    els.rail = byId('pmRail');
    els.chat = byId('pmChat');
    els.chatBody = byId('pmChatBody');
    els.chatOverflow = byId('pmChatOverflow');
    els.railToggle = byId('pmRailToggle');
    els.chatToggle = byId('pmChatToggle');
    els.motionToggle = byId('pmMotionToggle');
    els.themeBtn = byId('pmThemeBtn');
    els.themeMenu = byId('pmThemeMenu');

    hydrateIcons(document);
    fillRail();
    fillChat();
    buildThemeMenu();
    buildNotifyStack();

    /* restore persisted prefs (falling back to current markup state) */
    var savedTheme = loadPref('theme');
    applyTheme(savedTheme && themeById(savedTheme) ? savedTheme
      : document.documentElement.getAttribute('data-theme') || 'friendly-dark', false);

    var savedMotion = loadPref('reducedMotion');
    applyMotion(savedMotion === '1', false);

    var savedRail = loadPref('railOpen');
    applyRail(savedRail == null ? true : savedRail === '1', false);

    var savedChat = loadPref('chatOpen');
    applyChat(savedChat === '1', false);

    /* wire controls */
    if (els.railToggle) {
      els.railToggle.addEventListener('click', function () {
        applyRail(els.railToggle.getAttribute('aria-pressed') !== 'true', true);
      });
    }
    if (els.chatToggle) {
      els.chatToggle.addEventListener('click', function () {
        applyChat(els.chatToggle.getAttribute('aria-pressed') !== 'true', true);
      });
    }
    if (els.motionToggle) {
      els.motionToggle.addEventListener('click', function () {
        applyMotion(els.motionToggle.getAttribute('aria-pressed') !== 'true', true);
      });
    }
    if (els.themeBtn) {
      els.themeBtn.addEventListener('click', function () {
        if (state.themeMenuOpen) { closeThemeMenu(true); } else { openThemeMenu(); }
      });
      els.themeBtn.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown' && !state.themeMenuOpen) {
          ev.preventDefault();
          openThemeMenu();
        }
      });
    }

    /* dismiss menus on outside click */
    document.addEventListener('mousedown', function (ev) {
      if (state.themeMenuOpen && els.themeMenu && !els.themeMenu.contains(ev.target) && ev.target !== els.themeBtn && !els.themeBtn.contains(ev.target)) {
        closeThemeMenu(false);
      }
      if (state.overflowOpen && els.overflowMenu && !els.overflowMenu.contains(ev.target) && ev.target !== els.chatOverflow && !els.chatOverflow.contains(ev.target)) {
        closeOverflowMenu(false);
      }
    });

    mountHubBridge();
    mountResizeWatcher();
    status('Ready');
  }

  window.PMShell = {
    init: init,
    status: status,
    toast: toast,
    notify: notify,
    notificationCount: notificationCount,
    applyView: applyView
  };
})();
