/* FakeShellModule — titlebar + app rail + docked/popout chat stages. */
(function () {
  'use strict';

  var MODEL_FALLBACK = 'Grok 4.5';
  var PROJECT_CHIP = 'tastebook';
  var THEME_KEY = 'pm.theme';
  var THEMES = [
    { id: 'friendly-dark', label: 'Friendly Dark' },
    { id: 'friendly-light', label: 'Friendly Light' },
    { id: 'glass-dark', label: 'Glass Dark' },
    { id: 'glass-light', label: 'Glass Light' },
    { id: 'retro-dark', label: 'Retro Dark' },
    { id: 'retro-light', label: 'Retro Light' },
    { id: 'basic-dark', label: 'Basic Dark' },
    { id: 'basic-light', label: 'Basic Light' }
  ];
  var RAIL_ITEMS = [
    { id: 'files', label: 'Files', icon: 'files' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'source', label: 'Source', icon: 'source' },
    { id: 'docker', label: 'Docker', icon: 'docker' }
  ];

  var FALLBACK_SVG = {
    files:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    search:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    source:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/><line x1="6" y1="9" x2="6" y2="15"/></svg>',
    docker:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
  };

  /* Dense fake editor lines — spacing pressure only, theme-token muted. */
  var FAKE_CODE_LINES = [
    { n: ' 1', t: '//! tastebook onboarding surface', k: 'cmt' },
    { n: ' 2', t: 'use crate::orchestrator::{Index, Ready};', k: '' },
    { n: ' 3', t: 'use crate::recipe::{PlanUnit, Recipe};', k: '' },
    { n: ' 4', t: '', k: '' },
    { n: ' 5', t: 'pub struct OnboardingFlow {', k: '' },
    { n: ' 6', t: '    project: String,', k: '' },
    { n: ' 7', t: '    index: Index,', k: '' },
    { n: ' 8', t: '    recipe: Recipe,', k: '' },
    { n: ' 9', t: '}', k: '' },
    { n: '10', t: '', k: '' },
    { n: '11', t: 'impl OnboardingFlow {', k: '' },
    { n: '12', t: '    pub fn new(project: impl Into<String>) -> Self {', k: '' },
    { n: '13', t: '        Self {', k: '' },
    { n: '14', t: '            project: project.into(),', k: '' },
    { n: '15', t: '            index: Index::load_default(),', k: '' },
    { n: '16', t: '            recipe: Recipe::from_plan("PLAN.md"),', k: '' },
    { n: '17', t: '        }', k: '' },
    { n: '18', t: '    }', k: '' },
    { n: '19', t: '', k: '' },
    { n: '20', t: '    pub fn ready(&self) -> Ready {', k: '' },
    { n: '21', t: '        // Orchestrator handshake — index count gates first paint', k: 'cmt' },
    { n: '22', t: '        Ready {', k: '' },
    { n: '23', t: '            branch: "main",', k: 'str' },
    { n: '24', t: '            units: self.recipe.units().len(),', k: '' },
    { n: '25', t: '            indexed: self.index.len(),', k: '' },
    { n: '26', t: '        }', k: '' },
    { n: '27', t: '    }', k: '' },
    { n: '28', t: '', k: '' },
    { n: '29', t: '    pub fn next_unit(&self) -> Option<&PlanUnit> {', k: '' },
    { n: '30', t: '        self.recipe.units().iter().find(|u| !u.done())', k: '' },
    { n: '31', t: '    }', k: '' },
    { n: '32', t: '}', k: '' }
  ];

  function iconHtml(name) {
    if (typeof window.PMIcon === 'function') {
      var fromHelper = window.PMIcon(name, 'pm-shell-rail-icon');
      if (fromHelper) return fromHelper;
    }
    if (window.PMIcons && window.PMIcons[name]) {
      return String(window.PMIcons[name]).replace('<svg ', '<svg class="pm-shell-rail-icon" ');
    }
    return FALLBACK_SVG[name] || '';
  }

  function themeLabel(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return THEMES[i].label;
    }
    return id || 'Theme';
  }

  function normalizeTheme(id) {
    var t = String(id || '');
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === t) return t;
    }
    return 'friendly-dark';
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (_) {
      return null;
    }
  }

  function writeStoredTheme(t) {
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch (_) {}
  }

  function normalizeEnv(props) {
    var env = (props && props.env) || props || {};
    return {
      theme: normalizeTheme(env.theme || readStoredTheme() || 'friendly-dark'),
      reducedMotion: !!env.reducedMotion,
      chatWidthPx: env.chatWidthPx != null ? Number(env.chatWidthPx) : 550,
      railOpen: env.railOpen !== false,
      mountMode: env.mountMode === 'popout' ? 'popout' : 'docked',
      modelLabel:
        env.modelLabel ||
        (window.PMChatLabels && window.PMChatLabels.MODEL) ||
        MODEL_FALLBACK,
      toast: typeof env.toast === 'function' ? env.toast : null
    };
  }

  function applyAttrs(el, state) {
    var target = el || document.documentElement;
    target.setAttribute('data-theme', state.theme);
    target.setAttribute('data-reduced-motion', state.reducedMotion ? '1' : '0');
    target.setAttribute('data-motion', state.reducedMotion ? 'reduced' : 'full');
    target.setAttribute('data-rail', state.railOpen ? 'open' : 'closed');
    target.setAttribute('data-mount', state.mountMode);
    target.style.setProperty('--chat-width', Math.round(state.chatWidthPx) + 'px');
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-reduced-motion', state.reducedMotion ? '1' : '0');
    document.documentElement.setAttribute('data-motion', state.reducedMotion ? 'reduced' : 'full');
    document.documentElement.setAttribute('data-rail', state.railOpen ? 'open' : 'closed');
    document.documentElement.setAttribute('data-mount', state.mountMode);
    document.documentElement.style.setProperty('--chat-width', Math.round(state.chatWidthPx) + 'px');
    document.documentElement.style.colorScheme = /-dark$/.test(state.theme) ? 'dark' : 'light';
    if (window.PMChatMotion && typeof window.PMChatMotion.setReduced === 'function') {
      window.PMChatMotion.setReduced(state.reducedMotion);
    }
  }

  function syncMountVisibility(root, mode) {
    var docked = root.querySelector('#chat-stage-docked');
    var popout = root.querySelector('#chat-stage-popout');
    if (docked) {
      docked.hidden = mode !== 'docked';
      docked.setAttribute('aria-hidden', mode === 'docked' ? 'false' : 'true');
    }
    if (popout) {
      popout.hidden = mode !== 'popout';
      popout.setAttribute('aria-hidden', mode === 'popout' ? 'false' : 'true');
    }
    root.classList.toggle('is-mount-docked', mode === 'docked');
    root.classList.toggle('is-mount-popout', mode === 'popout');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function themeMenuHtml(current) {
    var items = THEMES.map(function (th) {
      return (
        '<button type="button" role="menuitemradio" class="pm6-tb-menu-item' +
        (th.id === current ? ' is-selected' : '') +
        '" data-shell-theme-pick="' +
        escapeHtml(th.id) +
        '" data-theme-id="' +
        escapeHtml(th.id) +
        '" data-label="' +
        escapeHtml(th.label) +
        '" aria-checked="' +
        (th.id === current ? 'true' : 'false') +
        '">' +
        '<span class="pm-menu-item-label">' +
        escapeHtml(th.label) +
        '</span></button>'
      );
    }).join('');
    return (
      '<div class="pm-titlebar-theme">' +
      '<div class="pm6-tb-menu-wrap" data-shell-theme-menu>' +
      '<button type="button" class="pm6-tb-menu-trigger pm-shell-theme-trigger" aria-haspopup="menu" aria-expanded="false" title="Theme" aria-label="Theme">' +
      '<span class="pm-shell-theme-label" data-shell-theme-label>' +
      escapeHtml(themeLabel(current)) +
      '</span></button>' +
      '<div class="pm6-tb-menu" role="menu" aria-label="Theme">' +
      items +
      '</div></div></div>'
    );
  }

  function renderFakeWorkspace() {
    var lines = FAKE_CODE_LINES.map(function (ln) {
      return (
        '<div class="pm-fake-line' +
        (ln.k ? ' is-' + ln.k : '') +
        '"><span class="pm-fake-gutter">' +
        ln.n +
        '</span><code class="pm-fake-code">' +
        escapeHtml(ln.t) +
        '</code></div>'
      );
    }).join('');
    return (
      '<section class="pm-fake-workspace" data-fake-workspace aria-hidden="false">' +
      '<div class="pm-fake-tabs" data-fake-tabs>' +
      '<button type="button" class="pm-fake-tab is-active" data-fake-tab="onboarding" aria-current="page">src/onboarding.rs</button>' +
      '<button type="button" class="pm-fake-tab" data-fake-tab="recipe">recipe.rs</button>' +
      '<button type="button" class="pm-fake-tab" data-fake-tab="plan">PLAN.md</button>' +
      '</div>' +
      '<div class="pm-fake-editor" data-fake-editor>' +
      lines +
      '</div>' +
      '<div class="pm-fake-status">' +
      '<span class="pm-fake-status-item">main</span>' +
      '<span class="pm-fake-status-sep">·</span>' +
      '<span class="pm-fake-status-item">Orchestrator Ready</span>' +
      '<span class="pm-fake-status-sep">·</span>' +
      '<span class="pm-fake-status-item">index 248</span>' +
      '</div>' +
      '</section>'
    );
  }


  /* Bind to session.sync.state enum; "Queued to send" is UI-derived (offline + outbox). */
  var SYNC_LABELS = {
    cached: 'Cached',
    synchronizing: 'Synchronizing',
    live: 'Live',
    offline: 'Offline',
    reconnecting: 'Reconnect',
    replay: 'Replay',
    snapshot: 'Snapshot catch-up',
    'server-work-continuing': 'Server work continuing'
  };

  function syncChipLabel(state, store) {
    var syncState = state || (store && store.session && store.session.sync && store.session.sync.state) || 'live';
    if (syncState === 'offline' && store && store.session && Array.isArray(store.session.outbox)) {
      var queued = store.session.outbox.some(function (row) {
        return row && row.status === 'queued';
      });
      if (queued) return 'Queued to send';
    }
    if (SYNC_LABELS[syncState]) return SYNC_LABELS[syncState];
    var values = Object.keys(SYNC_LABELS).map(function (k) { return SYNC_LABELS[k]; });
    if (values.indexOf(syncState) >= 0) return syncState;
    return String(syncState);
  }

  function notificationUnread(store) {
    var list = (store && store.session && store.session.notifications) || [];
    return list.filter(function (n) { return n && !n.read; }).length;
  }

  function notificationInboxHtml(store) {
    var list = (store && store.session && store.session.notifications) || [];
    var unread = notificationUnread(store);
    var items = list.slice(0, 8).map(function (n) {
      return (
        '<button type="button" class="pm-shell-ntf-item' + (n.read ? '' : ' is-unread') + '" data-shell-ntf-id="' +
        escapeHtml(n.id) + '" role="menuitem">' +
        '<span class="pm-shell-ntf-title">' + escapeHtml(n.title || 'Notification') + '</span>' +
        (n.body ? '<span class="pm-shell-ntf-body">' + escapeHtml(n.body) + '</span>' : '') +
        '</button>'
      );
    }).join('');
    if (!items) {
      items = '<div class="pm-shell-ntf-empty">No notifications</div>';
    }
    return (
      '<div class="pm-shell-inbox" data-shell-inbox>' +
      '<button type="button" class="pm-shell-inbox-trigger" data-shell-inbox-toggle aria-haspopup="menu" aria-expanded="false" title="Notifications" aria-label="Notifications">' +
      '<span class="pm-shell-inbox-sprout" aria-hidden="true">◎</span>' +
      (unread ? '<span class="pm-shell-inbox-count" data-shell-inbox-count>' + unread + '</span>' : '<span class="pm-shell-inbox-count is-zero" data-shell-inbox-count hidden>0</span>') +
      '</button>' +
      '<div class="pm-shell-inbox-menu" data-shell-inbox-menu role="menu" hidden>' +
      '<div class="pm-shell-inbox-head">Notifications</div>' +
      items +
      '</div></div>'
    );
  }

  function syncChipHtml(store) {
    var sync = (store && store.session && store.session.sync) || { state: 'live' };
    var state = sync.state || 'live';
    var label = syncChipLabel(state, store);
    var displayState = label === 'Queued to send' ? 'queued-to-send' : state;
    return (
      '<span class="pm-shell-sync-chip" data-shell-sync-chip data-sync-state="' + escapeHtml(displayState) + '" title="' +
      escapeHtml(sync.routeLabel || label) + '">' + escapeHtml(label) + '</span>'
    );
  }

  function buildDom(root, state) {
    root.id = root.id || 'shell-root';
    root.classList.add('pm-shell');
    root.innerHTML =
      '<header class="pm-titlebar pm-shell-titlebar" role="banner">' +
      '<div class="pm-titlebar-brand pm-shell-brand">' +
      '<span class="pm-titlebar-name pm-shell-product">Puppet Master</span>' +
      '<span class="pm-chip pm-titlebar-project" title="Active project">' +
      escapeHtml(PROJECT_CHIP) +
      '</span>' +
      '<span class="pm-badge-model pm-shell-badge" data-model-badge>' +
      escapeHtml(state.modelLabel) +
      '</span>' +
      '</div>' +
      '<div class="pm-titlebar-spacer"></div>' +
      syncChipHtml(state.store) +
      notificationInboxHtml(state.store) +
      themeMenuHtml(state.theme) +
      '<button type="button" class="pm-shell-close" data-shell-close title="Close popout" aria-label="Close popout" hidden>×</button>' +
      '</header>' +
      '<div class="pm-body pm-shell-body">' +
      '<nav class="pm-app-rail pm-shell-rail" aria-label="App rail">' +
      RAIL_ITEMS.map(function (item, idx) {
        return (
          '<button type="button" class="pm-shell-rail-btn' +
          (idx === 0 ? ' is-active' : '') +
          '" data-rail-item="' +
          item.id +
          '" title="' +
          item.label +
          '" aria-label="' +
          item.label +
          '"' +
          (idx === 0 ? ' aria-current="page"' : '') +
          '>' +
          iconHtml(item.icon) +
          '</button>'
        );
      }).join('') +
      '</nav>' +
      '<main class="pm-main pm-shell-main">' +
      renderFakeWorkspace() +
      '<div id="chat-stage-docked" class="pm-chat-stage pm-chat-stage-docked" data-stage="docked"></div>' +
      '<div id="chat-stage-popout" class="pm-chat-stage pm-chat-stage-popout" data-stage="popout" hidden></div>' +
      '</main>' +
      '</div>';
  }

  function syncThemeMenuUi(root, theme) {
    var label = root.querySelector('[data-shell-theme-label]');
    if (label) label.textContent = themeLabel(theme);
    root.querySelectorAll('[data-shell-theme-menu] [data-theme-id]').forEach(function (btn) {
      var on = btn.getAttribute('data-theme-id') === theme;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function syncCloseVisibility(root, state) {
    var btn = root.querySelector('[data-shell-close]');
    if (!btn) return;
    btn.hidden = state.mountMode !== 'popout';
  }

  function mount(root, props) {
    if (!root) throw new Error('PMChatShell.mount: root required');
    var state = normalizeEnv(props);
    var onThemeListeners = [];
    buildDom(root, state);
    applyAttrs(root, state);
    state.store = state.store || null;
    state._storeUnsub = null;
    syncMountVisibility(root, state.mountMode);
    syncCloseVisibility(root, state);

    if (window.PMMenu && typeof window.PMMenu.init === 'function') {
      window.PMMenu.init(root);
    }

    function refreshChrome() {
      var syncEl = root.querySelector('[data-shell-sync-chip]');
      if (syncEl) {
        var sync = (state.store && state.store.session && state.store.session.sync) || { state: 'live' };
        var st = sync.state || 'live';
        var label = syncChipLabel(st, state.store);
        syncEl.setAttribute('data-sync-state', label === 'Queued to send' ? 'queued-to-send' : st);
        syncEl.title = sync.routeLabel || label;
        syncEl.textContent = label;
      }
      var countEl = root.querySelector('[data-shell-inbox-count]');
      var unread = notificationUnread(state.store);
      if (countEl) {
        countEl.textContent = String(unread);
        if (unread) {
          countEl.hidden = false;
          countEl.classList.remove('is-zero');
        } else {
          countEl.hidden = true;
          countEl.classList.add('is-zero');
        }
      }
      var menu = root.querySelector('[data-shell-inbox-menu]');
      if (menu && state.store) {
        var open = !menu.hidden;
        var html = notificationInboxHtml(state.store);
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var nextMenu = tmp.querySelector('[data-shell-inbox-menu]');
        if (nextMenu) {
          menu.innerHTML = nextMenu.innerHTML;
          menu.hidden = !open;
        }
      }
    }

    function applyTheme(theme, opts) {
      opts = opts || {};
      var t = normalizeTheme(theme);
      state.theme = t;
      applyAttrs(root, state);
      writeStoredTheme(t);
      syncThemeMenuUi(root, t);
      document.querySelectorAll('[data-theme-id]').forEach(function (btn) {
        if (!btn.closest || !btn.closest('[data-settings-panel], [data-more-menu], [data-shell-theme-menu]')) return;
        var on = btn.getAttribute('data-theme-id') === t;
        btn.classList.toggle('is-selected', on);
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      if (!opts.skipBroadcast && window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({ type: 'pm-theme', theme: t }, '*');
        } catch (_) {}
      }
      onThemeListeners.forEach(function (fn) {
        try {
          fn(t);
        } catch (_) {}
      });
      return t;
    }

    function openEditorTab(tab) {
      if (!tab) return;
      var tabs = root.querySelector('[data-fake-tabs]');
      var editor = root.querySelector('[data-fake-editor]');
      if (!tabs || !editor) return;
      tabs.querySelectorAll('.pm-fake-tab').forEach(function (el) {
        el.classList.remove('is-active');
        el.removeAttribute('aria-current');
      });
      var existing = tabs.querySelector('[data-fake-tab="demo-editor"]');
      if (existing) existing.remove();
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pm-fake-tab is-active is-demo-facade';
      btn.setAttribute('data-fake-tab', 'demo-editor');
      btn.setAttribute('aria-current', 'page');
      btn.title = 'GAP-009 façade';
      btn.textContent = (tab.title || tab.id || 'Untitled') + ' · façade';
      tabs.appendChild(btn);
      editor.innerHTML =
        '<div class="pm-fake-demo-tab">' +
        '<div class="pm-fake-demo-kicker">Editor tab · GAP-009 façade</div>' +
        '<div class="pm-fake-demo-title">' +
        escapeHtml(tab.title || tab.id || 'Untitled') +
        '</div>' +
        (tab.path
          ? '<div class="pm-fake-demo-path">' + escapeHtml(tab.path) + '</div>'
          : '') +
        '<div class="pm-fake-demo-note">Concept handoff into the fake workspace — not a real editor host.</div>' +
        '</div>';
    }

    function onDocThemeClick(ev) {
      var themeBtn =
        ev.target &&
        ev.target.closest &&
        ev.target.closest(
          '[data-shell-theme-pick], [data-shell-theme-menu] [data-theme-id], [data-settings-panel] [data-theme-id]'
        );
      if (!themeBtn) return;
      var id =
        themeBtn.getAttribute('data-shell-theme-pick') ||
        themeBtn.getAttribute('data-theme-id');
      if (!id) return;
      /* Close open sprouts first so the theme pick is not swallowed on first click. */
      if (window.PMMenu && typeof window.PMMenu.closeAll === 'function') window.PMMenu.closeAll();
      applyTheme(id);
      ev.preventDefault();
      ev.stopPropagation();
    }
    document.addEventListener('click', onDocThemeClick, true);

    function onRootClick(ev) {
      var inboxToggle = ev.target && ev.target.closest && ev.target.closest('[data-shell-inbox-toggle]');
      if (inboxToggle) {
        var menuEl = root.querySelector('[data-shell-inbox-menu]');
        if (menuEl) {
          var willOpen = menuEl.hidden;
          menuEl.hidden = !willOpen;
          inboxToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        }
        return;
      }
      var ntfItem = ev.target && ev.target.closest && ev.target.closest('[data-shell-ntf-id]');
      if (ntfItem && state.store && typeof state.store.markNotificationRead === 'function') {
        state.store.markNotificationRead(ntfItem.getAttribute('data-shell-ntf-id'));
        refreshChrome();
        return;
      }
      var rail =
        ev.target && ev.target.closest && ev.target.closest('[data-rail-item]');
      if (rail && root.contains(rail)) {
        var id = rail.getAttribute('data-rail-item');
        root.querySelectorAll('[data-rail-item]').forEach(function (b) {
          var on = b === rail;
          b.classList.toggle('is-active', on);
          if (on) b.setAttribute('aria-current', 'page');
          else b.removeAttribute('aria-current');
        });
        var label = rail.getAttribute('aria-label') || id || 'Rail';
        if (state.toast) state.toast(label + ' · demo shell');
        return;
      }
      var closeBtn =
        ev.target && ev.target.closest && ev.target.closest('[data-shell-close]');
      if (closeBtn && root.contains(closeBtn)) {
        if (state.mountMode === 'popout') {
          handle.setMountMode('docked');
          if (state.toast) state.toast('Docked · popout closed');
        } else if (state.toast) {
          state.toast('Close is demo-only in docked mode');
        }
      }
    }
    root.addEventListener('click', onRootClick);

    var handle = {
      setRailOpen: function (open) {
        state.railOpen = !!open;
        applyAttrs(root, state);
      },
      setChatWidth: function (px) {
        var n = Number(px);
        if (!isFinite(n) || n <= 0) return;
        state.chatWidthPx = n;
        applyAttrs(root, state);
      },
      setMountMode: function (mode) {
        state.mountMode = mode === 'popout' ? 'popout' : 'docked';
        applyAttrs(root, state);
        syncMountVisibility(root, state.mountMode);
        syncCloseVisibility(root, state);
      },
      updateTheme: function (theme) {
        return applyTheme(theme, { skipBroadcast: false });
      },
      setReducedMotion: function (on) {
        state.reducedMotion = !!on;
        applyAttrs(root, state);
        try {
          localStorage.setItem('pm.reducedMotion', state.reducedMotion ? '1' : '0');
        } catch (_) {}
      },
      openEditorTab: openEditorTab,
      onThemeChange: function (fn) {
        if (typeof fn === 'function') onThemeListeners.push(fn);
      },
      bindStore: function (store) {
        state.store = store || null;
        refreshChrome();
        if (state._storeUnsub) {
          try { state._storeUnsub(); } catch (_) {}
          state._storeUnsub = null;
        }
        if (store && typeof store.subscribe === 'function') {
          state._storeUnsub = store.subscribe(function () {
            refreshChrome();
          });
        }
      },
      refreshChrome: function () {
        refreshChrome();
      },
      setToast: function (fn) {
        state.toast = typeof fn === 'function' ? fn : null;
      },
      getDockedStage: function () {
        return root.querySelector('#chat-stage-docked');
      },
      getPopoutStage: function () {
        return root.querySelector('#chat-stage-popout');
      },
      getState: function () {
        return {
          theme: state.theme,
          reducedMotion: state.reducedMotion,
          chatWidthPx: state.chatWidthPx,
          railOpen: state.railOpen,
          mountMode: state.mountMode,
          modelLabel: state.modelLabel
        };
      },
      unmount: function () {
        if (state._storeUnsub) {
          try { state._storeUnsub(); } catch (_) {}
          state._storeUnsub = null;
        }
        document.removeEventListener('click', onDocThemeClick, true);
        root.removeEventListener('click', onRootClick);
        root.innerHTML = '';
        root.classList.remove('pm-shell', 'is-mount-docked', 'is-mount-popout');
      }
    };

    return handle;
  }

  window.PMChatShell = {
    mount: mount,
    SYNC_LABELS: SYNC_LABELS,
    syncChipLabel: syncChipLabel,
    notificationInboxHtml: notificationInboxHtml,
    syncChipHtml: syncChipHtml,
    THEMES: THEMES,
    normalizeTheme: normalizeTheme,
    themeLabel: themeLabel,
    readStoredTheme: readStoredTheme,
    themeMenuItemsHtml: function (current, attrs) {
      attrs = attrs || {};
      var action = attrs.action || 'set-theme';
      return THEMES.map(function (th) {
        return (
          '<button type="button" role="menuitemradio" class="pm6-tb-menu-item' +
          (th.id === current ? ' is-selected' : '') +
          '" data-action="' +
          escapeHtml(action) +
          '" data-theme-id="' +
          escapeHtml(th.id) +
          '" aria-checked="' +
          (th.id === current ? 'true' : 'false') +
          '"><span class="pm-menu-item-label">' +
          escapeHtml(th.label) +
          '</span></button>'
        );
      }).join('');
    }
  };
})();
