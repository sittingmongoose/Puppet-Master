/* ============================================================================
   Kimi K3 — fake Puppet Master shell.

   Deliberately plain application chrome (title bar, app rail, dashboard
   ghost, editor tab strip, chat dock, pop-out floating window). Its only
   job is to create realistic spacing pressure around the Assistant Chat
   module. It is NOT a design assignment: rail items are visual only and
   perform no navigation.

   Contract (host.html):
     const shell = window.K3Shell.mount(document.getElementById('k3-app'), ctx);
     -> { dockRoot, floatRoot, setPairingMeta(wMeta, tMeta), unmount() }
   ========================================================================== */
(function () {
  'use strict';

  const instances = new WeakMap(); // rootEl -> instance (idempotent mount)

  const RAIL_ITEMS = [
    { id: 'home', label: 'Home', icon: 'home', active: true },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'source', label: 'Source', icon: 'source' },
    { id: 'actions', label: 'Actions', icon: 'actions' },
    { id: 'docker', label: 'Docker', icon: 'docker' },
    { id: 'tests', label: 'Tests', icon: 'tests' },
    { id: 'agents', label: 'Agents', icon: 'agents' },
    { id: 'artifacts', label: 'Artifacts', icon: 'artifact' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const STATS = [
    { label: 'Active Goals', value: '2' },
    { label: 'Open Threads', value: '15' },
    { label: 'Queued Questions', value: '1' },
    { label: 'Recent Artifacts', value: '6' }
  ];

  function el(tag, className, testid) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (testid) n.setAttribute('data-testid', testid);
    return n;
  }

  function icon(name) {
    return window.K3Icons.get(name); // already aria-hidden
  }

  function iconButton(iconName, label, testid) {
    const b = el('button', 'k3s-icon-btn', testid);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.title = label;
    b.appendChild(icon(iconName));
    return b;
  }

  function setIconButton(btn, iconName, label) {
    btn.innerHTML = '';
    btn.appendChild(icon(iconName));
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  // "w1" + name "Solo Column" -> "W1 Solo Column" (tolerant of id-only metas)
  function metaText(m) {
    if (!m) return '';
    const id = (m.id || '').toString().toUpperCase();
    const name = m.name || m.title || '';
    return name ? (id ? id + ' ' + name : name) : id;
  }

  function mount(rootEl, ctx) {
    if (instances.has(rootEl)) {
      try { instances.get(rootEl).unmount(); } catch (e) { /* ignore */ }
    }
    rootEl.innerHTML = '';

    const K3 = window.K3;
    const store = ctx.store;
    const disposers = [];
    let unmounted = false;
    let positioned = false; // float window has been given an initial position
    let selectedTabId = null;

    /* ---- skeleton ------------------------------------------------------- */
    const shellEl = el('div', 'k3s-shell');

    // 1. Title bar
    const titlebar = el('header', 'k3s-titlebar', 'k3s-titlebar');
    const titleLeft = el('div', 'k3s-title-left');
    const railToggle = iconButton('rail-close', 'Collapse app rail', 'k3s-rail-toggle');
    const titleName = el('span', 'k3s-title-name');
    titleName.textContent = 'Puppet Master';
    const titleProject = el('span', 'k3s-title-project');
    titleProject.textContent = 'Tastebook';
    titleLeft.append(railToggle, titleName, titleProject);
    const titleRight = el('div', 'k3s-title-right');
    // Canonical notification boundary: the title-bar stack is the ONLY
    // in-app notification surface (no chat-side panel, no corner toasts).
    const notifBtn = el('button', 'k3s-icon-btn k3s-notif', 'k3s-notifications');
    notifBtn.type = 'button';
    notifBtn.setAttribute('aria-label', 'Notifications');
    notifBtn.title = 'Notifications';
    notifBtn.style.position = 'relative';
    notifBtn.appendChild(icon('bell-stack'));
    const notifBadge = el('span', 'k3s-notif-badge', 'k3s-notif-count');
    notifBadge.style.cssText =
      'position:absolute;top:1px;right:0;min-width:14px;height:14px;padding:0 3px;' +
      'box-sizing:border-box;border-radius:7px;background:var(--accent-primary);' +
      'color:var(--accent-contrast,#fff);font-size:9px;font-weight:700;line-height:14px;' +
      'text-align:center;pointer-events:none;';
    notifBadge.hidden = true;
    notifBtn.appendChild(notifBadge);
    const agentTag = el('span', 'k3-agent-tag');
    agentTag.textContent = 'Kimi K3 concept prototype';
    // Hub contract: renders data-concept-model="Kimi K3" on the visible tag.
    agentTag.setAttribute('data-concept-model', 'Kimi K3');
    titleRight.append(notifBtn, agentTag);
    titlebar.append(titleLeft, titleRight);

    // 2. Main row
    const main = el('div', 'k3s-main');

    // 2a. App rail (fake, visual only)
    const rail = el('nav', 'k3s-rail', 'k3s-rail');
    rail.setAttribute('aria-label', 'Application');
    const railItems = el('div', 'k3s-rail-items');
    RAIL_ITEMS.forEach((it) => {
      const item = el('div', 'k3s-rail-item' + (it.active ? ' is-active' : ''));
      item.title = it.label;
      const ic = el('span', 'k3s-rail-ic');
      ic.appendChild(icon(it.icon));
      const lab = el('span', 'k3s-rail-label');
      lab.textContent = it.label;
      item.append(ic, lab);
      railItems.appendChild(item);
    });
    const railFoot = el('div', 'k3s-rail-foot');
    const railToggleBottom = el('button', 'k3s-rail-item k3s-rail-btn', 'k3s-rail-toggle-bottom');
    railToggleBottom.type = 'button';
    railToggleBottom.setAttribute('aria-label', 'Collapse app rail');
    railToggleBottom.title = 'Collapse app rail';
    const railToggleBottomIc = el('span', 'k3s-rail-ic');
    railToggleBottomIc.appendChild(icon('rail-close'));
    const railToggleBottomLab = el('span', 'k3s-rail-label');
    railToggleBottomLab.textContent = 'Collapse';
    railToggleBottom.append(railToggleBottomIc, railToggleBottomLab);
    railFoot.appendChild(railToggleBottom);
    rail.append(railItems, railFoot);

    // 2b. Center: editor tab strip + placeholder body, or dashboard ghost
    const center = el('section', 'k3s-center');
    const tabsEl = el('div', 'k3s-tabs', 'k3s-tabs');
    tabsEl.setAttribute('role', 'tablist');
    tabsEl.setAttribute('aria-label', 'Editor tabs');
    const tabBody = el('div', 'k3s-tab-body');
    const dash = el('div', 'k3s-dash', 'k3s-dash');
    const dashTitle = el('h2', 'k3s-dash-title');
    dashTitle.textContent = 'Home — prototype backdrop';
    const dashCards = el('div', 'k3s-dash-cards');
    STATS.forEach((s) => {
      const card = el('div', 'k3s-card');
      const num = el('div', 'k3s-card-num');
      num.textContent = s.value;
      const lab = el('div', 'k3s-card-label');
      lab.textContent = s.label;
      card.append(num, lab);
      dashCards.appendChild(card);
    });
    dash.append(dashTitle, dashCards);
    center.append(tabsEl, tabBody, dash);

    // 2c. Chat dock
    const dock = el('aside', 'k3s-dock', 'k3s-dock');
    const dockRoot = el('div', 'k3s-dock-root', 'k3s-dock-root');
    const dockPlaceholder = el('div', 'k3s-dock-placeholder', 'k3s-dock-placeholder');
    const dockNote = el('div', 'k3s-dock-note');
    dockNote.textContent = 'Assistant Chat is popped out';
    const dockBackBtn = el('button', 'k3s-btn', 'k3s-dock-back');
    dockBackBtn.type = 'button';
    dockBackBtn.textContent = 'Dock it back';
    dockPlaceholder.append(dockNote, dockBackBtn);
    dock.append(dockRoot, dockPlaceholder);

    main.append(rail, center, dock);

    // 3. Floating chat window (pop-out form)
    const floatEl = el('div', 'k3s-float', 'k3s-float');
    const floatHead = el('div', 'k3s-float-head', 'k3s-float-head');
    const grip = el('span', 'k3s-float-grip');
    const floatTitle = el('span', 'k3s-float-title');
    floatTitle.textContent = 'Assistant Chat';
    const floatTag = el('span', 'k3-agent-tag');
    floatTag.textContent = 'Kimi K3';
    const floatDockBtn = iconButton('dock', 'Dock chat back', 'k3s-float-dock');
    floatHead.append(grip, floatTitle, floatTag, floatDockBtn);
    const floatBodyWrap = el('div', 'k3s-float-bodywrap');
    const floatRoot = el('div', 'k3s-float-root', 'k3s-float-root');
    floatBodyWrap.appendChild(floatRoot);
    floatEl.append(floatHead, floatBodyWrap);

    shellEl.append(titlebar, main, floatEl);
    rootEl.appendChild(shellEl);

    /* ---- env-driven state ------------------------------------------------ */
    function syncEnv(env) {
      // Rail width is independent of chat width; env.railOpen drives it.
      rail.classList.toggle('is-closed', !env.railOpen);
      const railAction = env.railOpen ? 'Collapse app rail' : 'Expand app rail';
      const railIcon = env.railOpen ? 'rail-close' : 'rail-open';
      setIconButton(railToggle, railIcon, railAction);
      railToggleBottomIc.innerHTML = '';
      railToggleBottomIc.appendChild(icon(railIcon));
      railToggleBottomLab.textContent = env.railOpen ? 'Collapse' : 'Expand';
      railToggleBottom.setAttribute('aria-label', railAction);
      railToggleBottom.title = railAction;

      const pop = env.mode === 'popout';
      dockRoot.hidden = pop;
      dockPlaceholder.hidden = !pop;
      floatEl.hidden = !pop;
      if (pop && !positioned) {
        positioned = true;
        centerFloat();
      }
    }

    function centerFloat() {
      const pr = shellEl.getBoundingClientRect();
      const r = floatEl.getBoundingClientRect();
      place((pr.width - r.width) / 2, (pr.height - r.height) / 2);
    }

    function place(x, y) {
      const pr = shellEl.getBoundingClientRect();
      const r = floatEl.getBoundingClientRect();
      const nx = Math.max(0, Math.min(Math.max(0, pr.width - r.width), x));
      const ny = Math.max(0, Math.min(Math.max(0, pr.height - r.height), y));
      floatEl.style.left = nx + 'px';
      floatEl.style.top = ny + 'px';
    }

    /* ---- editor tabs (ctx.store openTabs slice) --------------------------- */
    function currentTabs() {
      const t = store && store.get('openTabs', []);
      return Array.isArray(t) ? t : [];
    }

    function renderTabs() {
      if (unmounted) return;
      const tabs = currentTabs();
      tabsEl.innerHTML = '';
      if (selectedTabId && !tabs.some((t) => t && t.id === selectedTabId)) selectedTabId = null;
      if (!selectedTabId && tabs.length) selectedTabId = tabs[0].id;

      const has = tabs.length > 0;
      tabsEl.hidden = !has;
      tabBody.hidden = !has;
      dash.hidden = has;

      tabs.forEach((t) => {
        if (!t) return;
        const isSel = t.id === selectedTabId;
        const tab = el('div', 'k3s-tab' + (isSel ? ' is-active' : ''));
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', isSel ? 'true' : 'false');
        tab.tabIndex = 0;
        const ic = el('span', 'k3s-tab-ic');
        ic.appendChild(icon(t.kind === 'browser' ? 'browser' : t.kind === 'settings' ? 'settings' : 'artifact'));
        const lab = el('span', 'k3s-tab-label');
        lab.textContent = t.title || t.id || 'Untitled';
        const closeBtn = el('button', 'k3s-tab-close');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close tab');
        closeBtn.title = 'Close tab';
        closeBtn.appendChild(icon('close'));
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          store.set('openTabs', currentTabs().filter((x) => x && x.id !== t.id));
        });
        tab.addEventListener('click', () => { selectedTabId = t.id; renderTabs(); });
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectedTabId = t.id;
            renderTabs();
          }
        });
        tab.append(ic, lab, closeBtn);
        tabsEl.appendChild(tab);
      });

      renderTabBody(tabs.find((t) => t && t.id === selectedTabId) || null);
    }

    function renderTabBody(t) {
      tabBody.innerHTML = '';
      if (!t) return;
      if (t.kind === 'settings') { renderSettingsTabBody(t); return; }
      const h = el('h3', 'k3s-tab-title');
      h.textContent = t.title || t.id || 'Untitled';
      const meta = el('div', 'k3s-tab-meta');
      const kind = t.kind === 'browser' ? 'Browser' : 'Artifact';
      meta.textContent = t.projectPath ? kind + ' · ' + t.projectPath : kind;
      const note = el('p', 'k3s-tab-note');
      note.textContent = 'Opened in an editor tab. Editor internals are out of scope for this prototype.';
      tabBody.append(h, meta, note);
    }

    // Fake Provider Settings editor tab (opened on 'settings-deeplink').
    function renderSettingsTabBody(t) {
      const h = el('h3', 'k3s-tab-title');
      h.textContent = t.title || 'Provider Settings';
      const meta = el('div', 'k3s-tab-meta');
      meta.textContent = 'Settings';
      const ret = store ? store.get('settingsReturn', null) : null;
      const note = el('p', 'k3s-tab-note');
      note.textContent = 'Provider Settings — prototype placeholder' +
        (ret && ret.routeKey ? ' · ' + ret.routeKey : '');
      const back = el('button', 'k3s-btn', 'k3s-settings-return');
      back.type = 'button';
      back.textContent = 'Return to thread';
      back.addEventListener('click', () => {
        const r = store ? store.get('settingsReturn', null) : null;
        store.set('openTabs', currentTabs().filter((x) => x && x.id !== 'provider-settings'));
        store.set('settingsReturn', null);
        if (r && r.threadId && ctx.data && typeof ctx.data.thread === 'function' && ctx.data.thread(r.threadId)) {
          store.set('activeThreadId', r.threadId);
        }
      });
      tabBody.append(h, meta, note, back);
    }

    /* ---- title-bar notification stack ------------------------------------- */
    function notifList() {
      const n = store && store.get('notifications', []);
      return Array.isArray(n) ? n : [];
    }

    function saveNotifs(list) {
      if (store) store.set('notifications', list);
    }

    function renderNotifBadge() {
      if (unmounted) return;
      const c = notifList().filter((n) => n && !n.read).length;
      notifBadge.hidden = c === 0;
      notifBadge.textContent = c > 9 ? '9+' : String(c);
      const label = c ? 'Notifications (' + c + ' unread)' : 'Notifications';
      notifBtn.setAttribute('aria-label', label);
      notifBtn.title = label;
    }

    function notifIcon(kind) {
      if (kind === 'approval') return 'shield';
      if (kind === 'provider-setup') return 'settings';
      if (kind === 'sync' || kind === 'offline') return 'wifi-off';
      return 'bell-stack';
    }

    function relTime(at) {
      const t = typeof at === 'number' ? at : Date.parse(at);
      if (!t || isNaN(t)) return '';
      const s = Math.max(0, Math.round((Date.now() - t) / 1000));
      if (s < 45) return 'just now';
      const m = Math.round(s / 60);
      if (m < 60) return m + 'm ago';
      const h = Math.round(m / 60);
      if (h < 24) return h + 'h ago';
      return Math.round(h / 24) + 'd ago';
    }

    function openInbox() {
      const panel = el('div', 'k3s-inbox-panel');
      panel.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-height:inherit;';
      const head = el('div', 'k3s-inbox-head');
      head.style.cssText = 'display:flex;align-items:center;gap:8px;';
      const headTitle = el('span', 'k3s-inbox-title');
      headTitle.style.cssText = 'font-weight:650;flex:1 1 auto;';
      headTitle.textContent = 'Notifications';
      const markAll = el('button', 'k3s-btn', 'k3s-inbox-mark-all');
      markAll.type = 'button';
      markAll.textContent = 'Mark all read';
      head.append(headTitle, markAll);
      const list = el('div', 'k3s-inbox-list ' + window.K3UI.scrollClass);
      list.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:4px;min-width:260px;';
      panel.append(head, list);

      const pop = window.K3UI.popover(notifBtn, panel, { className: 'k3s-inbox' });
      pop.el.setAttribute('data-testid', 'k3s-inbox');

      function renderRows() {
        const items = notifList().slice().sort((a, b) => {
          const ta = a && (typeof a.at === 'number' ? a.at : Date.parse(a.at)) || 0;
          const tb = b && (typeof b.at === 'number' ? b.at : Date.parse(b.at)) || 0;
          return tb - ta;
        });
        list.innerHTML = '';
        if (!items.length) {
          const empty = el('div', 'k3-footnote');
          empty.textContent = 'No notifications.';
          list.appendChild(empty);
          return;
        }
        items.forEach((n) => {
          if (!n) return;
          const row = el('div', 'k3s-inbox-row' + (n.read ? ' is-read' : ''));
          row.style.cssText =
            'display:flex;align-items:flex-start;gap:8px;padding:6px 7px;border-radius:var(--radius-sm,6px);' +
            'background:' + (n.read ? 'transparent' : 'var(--surface)') + ';' +
            'border:var(--border-width,1px) solid var(--border-light,var(--border));';
          const ic = el('span', 'k3s-inbox-ic');
          ic.style.cssText = 'flex:0 0 auto;color:var(--text-muted);margin-top:1px;';
          ic.appendChild(icon(notifIcon(n.kind)));
          const body = el('div', 'k3s-inbox-body');
          body.style.cssText = 'flex:1 1 auto;min-width:0;';
          const title = el('div', 'k3s-inbox-row-title');
          title.style.cssText = 'font-weight:' + (n.read ? '500' : '650') + ';';
          title.textContent = n.title || 'Notification';
          const text = el('div', 'k3s-inbox-row-body');
          text.style.cssText = 'color:var(--text-secondary);font-size:var(--fs-xs,11px);';
          text.textContent = n.body || '';
          const time = el('div', 'k3s-inbox-row-time');
          time.style.cssText = 'color:var(--text-muted);font-size:var(--fs-2xs,10px);margin-top:1px;';
          time.textContent = relTime(n.at);
          body.append(title, text, time);
          const actions = el('div', 'k3s-inbox-actions');
          actions.style.cssText = 'flex:0 0 auto;display:flex;flex-direction:column;gap:4px;';
          const openBtn = el('button', 'k3s-btn', 'k3s-inbox-open');
          openBtn.type = 'button';
          openBtn.textContent = 'Open';
          openBtn.addEventListener('click', () => {
            saveNotifs(notifList().map((x) => (x && x.id === n.id ? Object.assign({}, x, { read: true }) : x)));
            if (n.threadId && n.messageId) {
              ctx.emit('reveal-message', { threadId: n.threadId, messageId: n.messageId });
            }
            pop.close();
          });
          const dismissBtn = el('button', 'k3s-btn', 'k3s-inbox-dismiss');
          dismissBtn.type = 'button';
          dismissBtn.textContent = 'Dismiss';
          dismissBtn.addEventListener('click', () => {
            saveNotifs(notifList().filter((x) => x && x.id !== n.id));
            renderRows();
          });
          actions.append(openBtn, dismissBtn);
          row.append(ic, body, actions);
          list.appendChild(row);
        });
      }

      markAll.addEventListener('click', () => {
        saveNotifs(notifList().map((x) => (x ? Object.assign({}, x, { read: true }) : x)));
        renderRows();
      });
      renderRows();
    }

    notifBtn.addEventListener('click', openInbox);

    // Provider-setup deep link: open a fake Provider Settings editor tab and
    // record a title-bar notification (deduped per route key).
    function onSettingsDeeplink(evt) {
      if (!evt || evt.type !== 'settings-deeplink') return;
      const ret = store.get('settingsReturn', null) || {};
      const routeKey = evt.routeKey || ret.routeKey || 'Provider route';
      if (!currentTabs().some((t) => t && t.id === 'provider-settings')) {
        store.set('openTabs', currentTabs().concat([
          { id: 'provider-settings', title: 'Provider Settings', kind: 'settings' }
        ]));
      }
      selectedTabId = 'provider-settings';
      renderTabs();
      const dup = notifList().some((n) => n && n.kind === 'provider-setup' && n.routeKey === routeKey);
      if (!dup) {
        saveNotifs(notifList().concat([{
          id: 'notif-provider-' + String(routeKey).replace(/[^a-z0-9]+/gi, '-'),
          kind: 'provider-setup',
          title: 'Provider setup required',
          body: routeKey + ' needs attention',
          at: Date.now(),
          read: false,
          routeKey: routeKey
        }]));
      }
    }

    /* ---- events ----------------------------------------------------------- */
    function toggleRail() {
      K3.setEnv({ railOpen: !ctx.env.railOpen });
    }
    railToggle.addEventListener('click', toggleRail);
    railToggleBottom.addEventListener('click', toggleRail);
    dockBackBtn.addEventListener('click', () => K3.setEnv({ mode: 'docked' }));
    floatDockBtn.addEventListener('click', () => K3.setEnv({ mode: 'docked' }));

    const onEnv = (env) => syncEnv(env || ctx.env);
    ctx.on('env', onEnv);
    disposers.push(() => ctx.off('env', onEnv));

    if (store && store.subscribe) {
      disposers.push(store.subscribe('openTabs', renderTabs));
      disposers.push(store.subscribe('notifications', renderNotifBadge));
    }
    ctx.on('data', onSettingsDeeplink);
    disposers.push(() => ctx.off('data', onSettingsDeeplink));

    // Esc while popped out docks the chat (bubble phase: popups' capture-phase
    // Esc handler stops propagation first, so an open menu eats the key).
    const onKey = (e) => {
      if (e.key === 'Escape' && ctx.env.mode === 'popout') K3.setEnv({ mode: 'docked' });
    };
    document.addEventListener('keydown', onKey);
    disposers.push(() => document.removeEventListener('keydown', onKey));

    // Float window dragging (pointer events, clamped inside the shell/viewport)
    let drag = null;
    floatHead.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      const r = floatEl.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      try { floatHead.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      floatHead.classList.add('is-dragging');
      e.preventDefault();
    });
    floatHead.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const pr = shellEl.getBoundingClientRect();
      place(e.clientX - pr.left - drag.dx, e.clientY - pr.top - drag.dy);
    });
    const endDrag = () => {
      if (!drag) return;
      drag = null;
      floatHead.classList.remove('is-dragging');
    };
    floatHead.addEventListener('pointerup', endDrag);
    floatHead.addEventListener('pointercancel', endDrag);

    // Keep the float inside the viewport on window resize.
    const onResize = () => {
      if (unmounted || floatEl.hidden || !positioned) return;
      const pr = shellEl.getBoundingClientRect();
      const r = floatEl.getBoundingClientRect();
      place(r.left - pr.left, r.top - pr.top);
    };
    window.addEventListener('resize', onResize);
    disposers.push(() => window.removeEventListener('resize', onResize));

    /* ---- instance --------------------------------------------------------- */
    function setPairingMeta(wMeta, tMeta) {
      const label = [metaText(wMeta), metaText(tMeta)].filter(Boolean).join(' x ');
      floatTitle.textContent = label || 'Assistant Chat';
    }

    function unmount() {
      if (unmounted) return;
      unmounted = true;
      endDrag();
      disposers.forEach((d) => { try { d(); } catch (e) { /* ignore */ } });
      rootEl.innerHTML = '';
      if (instances.get(rootEl) === inst) instances.delete(rootEl);
    }

    const inst = { dockRoot, floatRoot, setPairingMeta, unmount };
    instances.set(rootEl, inst);

    syncEnv(ctx.env);
    renderTabs();
    renderNotifBadge();

    return inst;
  }

  window.K3Shell = { mount };
})();
