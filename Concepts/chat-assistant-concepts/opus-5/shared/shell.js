/* PMX shell — Opus 5
 * The fake Puppet Master shell shared by all eight window concepts. It exists only to
 * put realistic spacing pressure around the Assistant Chat: a title bar (the application
 * boundary), a left application rail (independent width axis), a plain dashboard background
 * page (fills whatever the chat does not use), and the chat host itself (docked column or
 * floating pop-out surface). It renders no chat content and gets no per-concept variation.
 *
 * Contract: CONTRACT.md section 2 (WindowInstance.setRail is the fake-rail precedent this
 * mirrors), section 8 (no emoji, no left accent border, pmx-scroll, human-readable text).
 * Called by compose.js as `PMXShell.mount(stageEl, ctxBase)` BEFORE the window concept
 * mounts into the returned chatHost. Must return { chatHost, setRail(open), destroy() }.
 *
 * Ownership split (see the mount call site in compose.js): the window concept that mounts
 * into chatHost owns everything drawn INSIDE it, in both docked and pop-out form (that is
 * why WindowInstance carries its own setMount()). This module owns only chatHost's OUTER
 * geometry (its position and size within the stage) and the pop-out dimming backdrop —
 * never a background, border, radius or shadow on chatHost itself, and never overflow:
 * hidden anywhere on the path down to chatHost, because the window concept's required
 * overlayRoot region (popups) is a descendant of chatHost and must not sit inside a
 * clipping ancestor (CONTRACT.md section 2).
 *
 * WHY THE TITLE BAR IS HERE AND NOT IN CHAT
 * ----------------------------------------
 * Notifications are an APPLICATION surface, not a Chat surface. The packet is explicit
 * (05_ATTACHMENTS_PROVIDER_SETUP_SYNC_AND_NOTIFICATIONS.md:110, CHAT-021): app-wide
 * notifications belong to the title-bar stack and inbox, and Chat must not grow a
 * notification panel, a bottom-right fixed stack, or an application-rail icon for them.
 * Putting the host here — a sibling of the chat host, outside every [data-pmx-window]
 * subtree — is what makes that boundary structural instead of a promise. The interaction
 * suite asserts no [data-pmx-notify] node exists inside any window subtree, and it can only
 * pass if this stays the single home for them.
 *
 * The server-first chip lives here for the same reason: Home Server, Execution Host,
 * Environment and Connection route describe where the APPLICATION is running, not what this
 * conversation is doing. Chat carries a compact `Sync state` header chip for the
 * conversation's own transport; this one is the application's identity, kept to four short
 * tokens because 05_...:97 forbids repeating a giant host banner anywhere.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var PMXUtil = global.PMXUtil;

  /* Fixed, deliberately plain — this workspace is scenery, not a design surface.
   *
   * `surface` names what a rail item actually reaches. A decorative control is a hard failure
   * (CHAT-013): an item either performs a real action or says truthfully why it cannot. Four of
   * these have no concept surface in this study at all, so they render disabled WITH a reason
   * rather than pretending to navigate — a dead button that looks alive is a worse lie than an
   * honest disabled one. */
  var RAIL_ITEMS = [
    { id: 'home', label: 'Home', icon: 'layers', surface: null },
    { id: 'files', label: 'Files', icon: 'folder', surface: null },
    { id: 'search', label: 'Search', icon: 'search', surface: 'search' },
    { id: 'terminal', label: 'Terminal', icon: 'terminal', surface: null },
    { id: 'agents', label: 'Agents', icon: 'crew', surface: 'crew' },
    { id: 'artifacts', label: 'Artifacts', icon: 'artifact', surface: 'artifacts' },
    { id: 'settings', label: 'Settings', icon: 'ring', surface: null }
  ];

  var NOT_IN_STUDY = 'Not part of this concept study.';

  var RECENT_FILES = [
    { name: 'src/app/router.ts', meta: '4m ago' },
    { name: 'notes/planning.md', meta: '31m ago' },
    { name: 'README.md', meta: '2h ago' },
    { name: 'config/worktrees.json', meta: 'yesterday' }
  ];

  /* Icon lookup that is total: an unknown or unavailable icon service returns an empty
   * (but real, insertable) SVG rather than throwing, same policy as PMXIcons.get itself. */
  function icon(ctx, name, size) {
    var svc = ctx && ctx.services && ctx.services.icons;
    if (svc && typeof svc.get === 'function') return svc.get(name, size);
    if (global.PMXIcons && typeof global.PMXIcons.get === 'function') return global.PMXIcons.get(name, size);
    return doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  function storeGet(ctx, path) {
    if (ctx && ctx.store && typeof ctx.store.get === 'function') return ctx.store.get(path);
    return undefined;
  }

  function svcOf(ctx, key, fallbackGlobal) {
    var s = ctx && ctx.services && ctx.services[key];
    return s || global[fallbackGlobal] || null;
  }

  function mount(stageEl, ctx) {
    var el = PMXUtil.el;

    stageEl.classList.add('pmx-shell');

    /* compose.js always writes data-rail onto the stage before calling this mount, so the
     * attribute already reflects ground truth; the store is a secondary, defensive source
     * for a caller that mounts this shell standalone (a test harness, a contact sheet cell
     * built without the full composition). */
    var initialRailAttr = stageEl.getAttribute('data-rail');
    var railOpen = initialRailAttr ? (initialRailAttr === 'open') : (storeGet(ctx, 'ui.railOpen') !== false);

    var activeRailId = 'home';
    var railButtons = {};
    var offs = [];

    function on(elem, ev, fn) { offs.push(PMXUtil.on(elem, ev, fn)); }

    /* ---------------------------------------------------------------- title bar */

    var brandEl = el('div', { class: 'pmx-shell-title-brand' }, [
      el('span', { class: 'pmx-shell-title-app', text: 'Puppet Master' }),
      el('span', { class: 'pmx-shell-title-sep', text: '·' }),
      el('span', { class: 'pmx-shell-title-project', text: 'Tastebook' })
    ]);

    /* Four short tokens, never a host banner. Rebuilt on demand so a transport change is
     * reflected without a subscription of its own. */
    var serverChipEl = el('button', {
      class: 'pmx-shell-server-chip', type: 'button',
      aria: { haspopup: 'dialog', label: 'Server and execution route' }
    });

    function serverRoute() {
      var sync = svcOf(ctx, 'sync', 'PMXSync');
      if (sync && typeof sync.route === 'function') return sync.route();
      return { homeServer: 'studio-01', executionHost: 'studio-01 · local', environment: 'Workspace', connectionRoute: 'Direct' };
    }

    function renderServerChip() {
      var r = serverRoute();
      PMXUtil.empty(serverChipEl);
      serverChipEl.appendChild(icon(ctx, 'snapshot', 13));
      serverChipEl.appendChild(el('span', { class: 'pmx-shell-server-name', text: r.homeServer }));
      serverChipEl.appendChild(el('span', { class: 'pmx-shell-server-env', text: r.environment }));
      serverChipEl.title = 'Home Server ' + r.homeServer + ' · Execution Host ' + r.executionHost;
    }

    on(serverChipEl, 'click', function () {
      var popup = svcOf(ctx, 'popup', 'PMXPopup');
      if (!popup || typeof popup.open !== 'function') return;
      var r = serverRoute();
      var sync = svcOf(ctx, 'sync', 'PMXSync');
      popup.open({
        anchorEl: serverChipEl, kind: 'panel', width: 260,
        build: function (host) {
          host.appendChild(el('div', { class: 'pmx-pop-title', text: 'Server' }));
          [['Home Server', r.homeServer], ['Execution Host', r.executionHost],
           ['Environment', r.environment], ['Connection route', r.connectionRoute]]
            .forEach(function (pair) {
              host.appendChild(el('div', { class: 'pmx-shell-kv-row' }, [
                el('dt', { text: pair[0] }), el('dd', { text: pair[1] })
              ]));
            });
          /* Host-owned work continues when the client closes; saying so here is the whole
           * point of a server-first product, and it is one line, not a status console. */
          var work = (sync && typeof sync.serverWork === 'function') ? sync.serverWork() : [];
          if (work.length) {
            host.appendChild(el('div', { class: 'pmx-pop-title', text: 'Running on the server' }));
            work.forEach(function (w) {
              host.appendChild(el('div', { class: 'pmx-shell-server-work' }, [
                el('span', { text: w.label }),
                el('span', { class: 'pmx-shell-server-work-note', text: 'Continues when this client closes' })
              ]));
            });
          }
        }
      });
    });

    /* The notification host. `data-pmx-notify` is the marker the interaction suite looks for:
     * it must exist here and nowhere inside a window subtree. */
    var notifyCountEl = el('span', { class: 'pmx-shell-notify-count' });
    var notifyBtnEl = el('button', {
      class: 'pmx-shell-notify-btn', type: 'button',
      data: { pmxNotify: 'button' },
      aria: { haspopup: 'dialog', label: 'Notifications' }
    }, [icon(ctx, 'bell', 15), notifyCountEl]);

    var notifyHostEl = el('div', {
      class: 'pmx-shell-notify-host',
      data: { pmxRegion: 'notifyHost', pmxNotify: 'host' }
    }, notifyBtnEl);

    function notifySvc() { return svcOf(ctx, 'notify', 'PMXNotify'); }

    function renderNotify() {
      var n = notifySvc();
      var unread = (n && typeof n.unread === 'function') ? n.unread() : 0;
      notifyCountEl.textContent = unread ? String(unread) : '';
      notifyHostEl.setAttribute('data-unread', unread ? '1' : '0');
      notifyBtnEl.setAttribute('aria-label', unread ? ('Notifications, ' + unread + ' unread') : 'Notifications');
    }

    on(notifyBtnEl, 'click', function () {
      var popup = svcOf(ctx, 'popup', 'PMXPopup');
      var n = notifySvc();
      if (!popup || typeof popup.open !== 'function' || !n) return;
      n.open(true);
      popup.open({
        anchorEl: notifyBtnEl, kind: 'panel', width: 300,
        onClose: function () { n.open(false); },
        build: function (host, api) {
          host.appendChild(el('div', { class: 'pmx-pop-title', text: 'Notifications' }));
          var items = n.items ? n.items() : [];
          if (!items.length) {
            /* An empty inbox says so plainly. Seeding it to look busy would be a fiction, and
             * the director fires real notifications when the demo needs them. */
            host.appendChild(el('div', { class: 'pmx-pop-empty', text: 'Nothing needs your attention.' }));
            return;
          }
          items.forEach(function (item) {
            var row = el('div', { class: 'pmx-shell-notify-item', data: { read: item.read ? '1' : '0' } }, [
              el('div', { class: 'pmx-shell-notify-title', text: item.title }),
              el('div', { class: 'pmx-shell-notify-body', text: item.body })
            ]);
            (item.actions || []).forEach(function (a) {
              var b = el('button', { class: 'pmx-shell-notify-action', type: 'button', text: a.label });
              PMXUtil.on(b, 'click', function () {
                n.markRead(item.id);
                /* A notification that names a thread takes you to it — that is the only
                 * navigation this surface performs. */
                if (item.threadId && ctx.store) ctx.store.set('session.activeThreadId', item.threadId);
                api.close();
                renderNotify();
              });
              row.appendChild(b);
            });
            PMXUtil.on(row, 'click', function () { n.markRead(item.id); renderNotify(); });
            host.appendChild(row);
          });
        }
      });
    });

    var titleBarEl = el('div', { class: 'pmx-shell-titlebar' }, [
      brandEl,
      el('div', { class: 'pmx-shell-title-spacer' }),
      serverChipEl,
      notifyHostEl
    ]);

    renderServerChip();
    renderNotify();

    /* One subscription for both title-bar surfaces. The store coarsens change keys to two
     * segments, so `session.notify` and `session.sync` arrive as those exact strings. */
    var unsub = null;
    if (ctx && ctx.store && typeof ctx.store.subscribe === 'function') {
      unsub = ctx.store.subscribe(function (s, changed) {
        if (!changed || !changed.some) return;
        if (changed.some(function (k) { return String(k).indexOf('session.notify') === 0; })) renderNotify();
        if (changed.some(function (k) { return String(k).indexOf('session.sync') === 0; })) renderServerChip();
      });
    }

    /* ---------------------------------------------------------------- rail */

    var toggleIconHost = el('span', { class: 'pmx-shell-rail-toggle-icon' });
    var toggleBtn = el('button', {
      class: 'pmx-shell-rail-toggle',
      type: 'button',
      aria: { label: 'Collapse application rail' }
    }, toggleIconHost);

    on(toggleBtn, 'click', function () {
      var next = !railOpen;
      if (ctx && ctx.store && typeof ctx.store.patch === 'function') {
        ctx.store.patch({ 'ui.railOpen': next });
      }
      /* Apply locally too so the shell responds immediately even without a store, and so
       * there is no visible lag waiting on a subscriber round trip when one is present. */
      setRail(next);
    });

    var railListEl = el('ul', { class: 'pmx-shell-rail-list pmx-scroll' });

    /* The three rail items that DO reach something. Each opens a surface this study actually
     * owns, so the rail stops being decoration without inventing new product. */
    function activateRail(item) {
      if (!item.surface) return false;
      if (item.surface === 'search') {
        var search = svcOf(ctx, 'search', 'PMXSearch');
        if (ctx.store) ctx.store.set('session.search.open', true);
        if (search && typeof search.open === 'function') { try { search.open(ctx); } catch (e) {} }
        return true;
      }
      if (item.surface === 'crew') {
        /* Agents means the Crew board, and the Crew board is an artifact — there is exactly one
         * place in this product where produced work is read. */
        var art = svcOf(ctx, 'artifacts', 'PMXArtifacts');
        if (art && typeof art.open === 'function') { art.open('artifact-crew'); return true; }
        return false;
      }
      if (item.surface === 'artifacts') {
        var a2 = svcOf(ctx, 'artifacts', 'PMXArtifacts');
        if (a2 && typeof a2.open === 'function') {
          var current = (typeof a2.activeId === 'function' && a2.activeId()) || 'artifact-diff';
          a2.open(current);
          return true;
        }
        return false;
      }
      return false;
    }

    RAIL_ITEMS.forEach(function (item) {
      var iconHost = el('span', { class: 'pmx-shell-rail-icon' }, icon(ctx, item.icon, 16));
      var labelHost = el('span', { class: 'pmx-shell-rail-label', text: item.label });
      var btn = el('button', {
        class: 'pmx-shell-rail-item',
        type: 'button',
        data: { 'rail-item': item.id }
      }, [iconHost, labelHost]);

      if (!item.surface) {
        /* Truthful disabled: the reason is the title, aria-disabled marks it for assistive
         * technology, and the click is refused rather than silently doing nothing. */
        btn.setAttribute('aria-disabled', 'true');
        btn.title = item.label + ' — ' + NOT_IN_STUDY;
        on(btn, 'click', function (ev) {
          ev.preventDefault();
          var toast = svcOf(ctx, 'toast', 'PMXToast');
          if (toast && toast.show) toast.show(NOT_IN_STUDY);
        });
      } else {
        btn.title = item.label;
        on(btn, 'click', function () {
          setActiveRailItem(item.id);
          activateRail(item);
        });
      }

      railButtons[item.id] = btn;
      railListEl.appendChild(el('li', null, btn));
    });

    function setActiveRailItem(id) {
      if (id === activeRailId || !railButtons[id]) return;
      var prev = railButtons[activeRailId];
      if (prev) { prev.classList.remove('is-active'); prev.removeAttribute('aria-current'); }
      activeRailId = id;
      var next = railButtons[activeRailId];
      next.classList.add('is-active');
      next.setAttribute('aria-current', 'page');
    }
    /* Establish the initial active-item indication (background fill + weight, never a
     * left-side accent border — CONTRACT.md section 8.2). */
    railButtons[activeRailId].classList.add('is-active');
    railButtons[activeRailId].setAttribute('aria-current', 'page');

    var railEl = el('nav', { class: 'pmx-shell-rail', aria: { label: 'Application' } }, [
      el('div', { class: 'pmx-shell-rail-head' }, toggleBtn),
      railListEl
    ]);

    /* ---------------------------------------------------------------- dashboard (scenery) */

    function counter(value, label) {
      return el('div', { class: 'pmx-shell-counter' }, [
        el('span', { class: 'pmx-shell-counter-value', text: value }),
        el('span', { class: 'pmx-shell-counter-label', text: label })
      ]);
    }

    function kvRow(k, v) {
      return el('div', { class: 'pmx-shell-kv-row' }, [
        el('dt', { text: k }),
        el('dd', { text: v })
      ]);
    }

    var headerEl = el('header', { class: 'pmx-shell-dash-header' }, [
      el('p', { class: 'pmx-shell-dash-eyebrow', text: 'Workspace' }),
      el('h1', { class: 'pmx-shell-dash-title', text: 'Overview' })
    ]);

    /* data-pmx-cozy names the card's category. Only the friendly themes read
     * it, where it selects which pastel gets mixed into the card base. The
     * other six themes ignore it entirely. */
    var projectCard = el('section', { class: 'pmx-shell-card', data: { 'pmx-cozy': 'orchestrator' } }, [
      el('h2', { class: 'pmx-shell-card-title', text: 'Project' }),
      el('p', { class: 'pmx-shell-project-name', text: 'Tastebook' }),
      el('dl', { class: 'pmx-shell-kv' }, [
        kvRow('Worktree', 'main'),
        kvRow('Last run', '12 minutes ago')
      ])
    ]);

    var filesCard = el('section', { class: 'pmx-shell-card', data: { 'pmx-cozy': 'files' } }, [
      el('h2', { class: 'pmx-shell-card-title', text: 'Recent files' }),
      el('ul', { class: 'pmx-shell-file-list' }, RECENT_FILES.map(function (f) {
        return el('li', { class: 'pmx-shell-file-row' }, [
          el('span', { class: 'pmx-shell-file-icon' }, icon(ctx, 'file', 14)),
          el('span', { class: 'pmx-shell-file-name', text: f.name }),
          el('span', { class: 'pmx-shell-file-meta', text: f.meta })
        ]);
      }))
    ]);

    var countersCard = el('section', { class: 'pmx-shell-card', data: { 'pmx-cozy': 'lanes' } }, [
      el('h2', { class: 'pmx-shell-card-title', text: 'Activity' }),
      el('div', { class: 'pmx-shell-counters' }, [
        counter('7', 'Runs'),
        counter('12', 'Artifacts'),
        counter('3', 'Worktrees')
      ])
    ]);

    var dashboardEl = el('div', { class: 'pmx-shell-dashboard pmx-scroll' }, [
      headerEl,
      el('div', { class: 'pmx-shell-dash-grid' }, [projectCard, filesCard, countersCard])
    ]);

    /* ---------------------------------------------------------------- chat host + backdrop
     * Geometry only. No background/border/radius/shadow here — that is the mounted window
     * concept's own chrome, rendered inside chatHost, adapted per docked/pop-out via its
     * own setMount(). See the file header for why overflow must stay unset on this path. */

    var backdropEl = el('div', { class: 'pmx-shell-chat-backdrop' });
    /* The artifact workspace is a SIBLING of the chat host, ordered immediately before it, so
     * it is genuinely to the left of Chat and genuinely outside the transcript and composer
     * rectangle. Putting it inside the chat host would make it a panel within Chat, which is
     * the arrangement the packet rules out — and would also make it compete with the window
     * concept's own internal columns for the same width. A window that wants to own the
     * placement itself exposes its own `artifactHost` region; this is the shared fallback. */
    var artifactHostEl = el('div', { class: 'pmx-shell-artifact-host', data: { pmxRegion: 'artifactHostFallback' } });
    var chatHostEl = el('div', { class: 'pmx-shell-chat-host' });

    stageEl.appendChild(titleBarEl);
    stageEl.appendChild(railEl);
    stageEl.appendChild(dashboardEl);
    stageEl.appendChild(backdropEl);
    stageEl.appendChild(artifactHostEl);
    stageEl.appendChild(chatHostEl);

    /* ---------------------------------------------------------------- setRail(open)
     * Rail width is driven declaratively by the data-rail attribute (CSS transition, so
     * the blanket reduced-motion override in motion.css already zeroes it under either
     * reduced-motion signal — no rAF loop here that would need its own motion.reduced()
     * check). This function keeps the attribute, the toggle affordance and its icon in
     * sync, and is idempotent so repeat calls with the same value are harmless. */
    function setRail(open) {
      railOpen = !!open;
      stageEl.setAttribute('data-rail', railOpen ? 'open' : 'closed');
      toggleBtn.setAttribute('aria-expanded', railOpen ? 'true' : 'false');
      toggleBtn.setAttribute('aria-label', railOpen ? 'Collapse application rail' : 'Expand application rail');
      PMXUtil.empty(toggleIconHost);
      toggleIconHost.appendChild(icon(ctx, railOpen ? 'chevron-left' : 'chevron-right', 14));
    }
    setRail(railOpen);

    function destroy() {
      for (var i = 0; i < offs.length; i++) { try { offs[i](); } catch (e) {} }
      offs = [];
      if (unsub) { try { unsub(); } catch (e) {} }
      [titleBarEl, railEl, dashboardEl, backdropEl, artifactHostEl, chatHostEl].forEach(function (node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
      stageEl.classList.remove('pmx-shell');
    }

    return {
      chatHost: chatHostEl,
      artifactHost: artifactHostEl,
      notifyHost: notifyHostEl,
      setRail: setRail,
      refreshNotifications: renderNotify,
      destroy: destroy
    };
  }

  global.PMXShell = { mount: mount, RAIL_ITEMS: RAIL_ITEMS, NOT_IN_STUDY: NOT_IN_STUDY };
})(window);
