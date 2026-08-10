/* PMX shell — Opus 5
 * The fake Puppet Master shell shared by all eight window concepts. It exists only to
 * put realistic spacing pressure around the Assistant Chat: a left application rail
 * (independent width axis) plus a plain dashboard background page (fills whatever the
 * chat does not use), and the chat host itself (docked column or floating pop-out
 * surface). It renders no chat content and gets no per-concept variation.
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
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var PMXUtil = global.PMXUtil;

  /* Fixed, deliberately plain — this workspace is scenery, not a design surface. */
  var RAIL_ITEMS = [
    { id: 'home', label: 'Home', icon: 'layers' },
    { id: 'files', label: 'Files', icon: 'folder' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'terminal', label: 'Terminal', icon: 'terminal' },
    { id: 'agents', label: 'Agents', icon: 'robot' },
    { id: 'artifacts', label: 'Artifacts', icon: 'file' },
    { id: 'settings', label: 'Settings', icon: 'ring' }
  ];

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

    /* ---------------------------------------------------------------- rail */

    var toggleIconHost = el('span', { class: 'pmx-shell-rail-toggle-icon' });
    var toggleBtn = el('button', {
      class: 'pmx-shell-rail-toggle',
      type: 'button',
      aria: { label: 'Collapse application rail' }
    }, toggleIconHost);

    var offToggleClick = PMXUtil.on(toggleBtn, 'click', function () {
      var next = !railOpen;
      if (ctx && ctx.store && typeof ctx.store.patch === 'function') {
        ctx.store.patch({ 'ui.railOpen': next });
      }
      /* Apply locally too so the shell responds immediately even without a store, and so
       * there is no visible lag waiting on a subscriber round trip when one is present. */
      setRail(next);
    });

    var railListEl = el('ul', { class: 'pmx-shell-rail-list pmx-scroll' });

    RAIL_ITEMS.forEach(function (item) {
      var iconHost = el('span', { class: 'pmx-shell-rail-icon' }, icon(ctx, item.icon, 16));
      var labelHost = el('span', { class: 'pmx-shell-rail-label', text: item.label });
      var btn = el('button', {
        class: 'pmx-shell-rail-item',
        type: 'button',
        title: item.label,
        data: { 'rail-item': item.id }
      }, [iconHost, labelHost]);
      PMXUtil.on(btn, 'click', function () { setActiveRailItem(item.id); });
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
      offToggleClick();
      [railEl, dashboardEl, backdropEl, artifactHostEl, chatHostEl].forEach(function (node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
      stageEl.classList.remove('pmx-shell');
    }

    return {
      chatHost: chatHostEl,
      artifactHost: artifactHostEl,
      setRail: setRail,
      destroy: destroy
    };
  }

  global.PMXShell = { mount: mount };
})(window);
