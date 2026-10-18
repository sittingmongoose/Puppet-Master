
(function () {
  'use strict';
  if (window.PM7_SHELL_ADJUSTMENTS) return;

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  var raf = function (fn) { return requestAnimationFrame(fn); };

  function activePage() {
    var page = document.querySelector('.page.active');
    return page ? page.id.replace(/^panel-/, '') : 'dashboard';
  }
  function homeActive() { return activePage() === 'dashboard'; }
  function clearHomeGeometry(panel) {
    ['left','right','top','bottom','width','height','min-width','max-width','min-height','max-height','flex','order','position','inset','transform','transition','transition-delay','z-index','margin'].forEach(function (name) {
      panel.style.removeProperty(name);
    });
  }
  function syncChatChrome() {
    var panel = document.getElementById('chatPanel');
    var resizer = document.getElementById('chatResizer');
    var icon = document.querySelector('.activity-bar .icon[title="Chat"]');
    if (!panel || !resizer) return;
    var visible = !panel.classList.contains('hidden');
    if (!homeActive()) {
      /* Home's renderer leaves model projection attributes and an inline
         display:none on these shared nodes. On ordinary pages the class
         contract is authoritative, so mirror it into the projection attrs
         and release the Home-only inline resizer suppression. */
      panel.setAttribute('data-pm-home-visible', visible ? 'true' : 'false');
      panel.setAttribute('data-pm-home-collapsed', 'false');
      resizer.style.removeProperty('display');
      resizer.classList.toggle('hidden', !visible);
      if (icon) icon.classList.toggle('active', visible);
    }
  }
  function seatChatForPage() {
    var panel = document.getElementById('chatPanel');
    var resizer = document.getElementById('chatResizer');
    if (!panel || !resizer || !resizer.parentNode) return;
    if (!homeActive()) {
      document.body.classList.add('pm7-chat-global-owner');
      panel.classList.add('pm7-global-chat-panel');
      resizer.classList.add('pm7-global-chat-resizer');
      clearHomeGeometry(panel);
      if (panel.parentNode !== resizer.parentNode || panel.previousElementSibling !== resizer) resizer.after(panel);
      syncChatChrome();
      if (window.PM_REFIT_SPLIT) { try { window.PM_REFIT_SPLIT(); } catch (error) {} }
      return;
    }

    document.body.classList.remove('pm7-chat-global-owner');
    panel.classList.remove('pm7-global-chat-panel');
    resizer.classList.remove('pm7-global-chat-resizer');
    resizer.classList.add('hidden');
    var api = window.PM_HOME_WORKSPACE;
    var layout = api && api.layout;
    var model = layout && layout.surfaces && layout.surfaces.filter(function (surface) { return surface.surface_instance_id === 'chat'; })[0];
    var visible = !panel.classList.contains('hidden');
    if (api && model && model.visible !== visible) {
      try { api.setSurfaceVisible('chat', visible, 'cmd.panel.switch'); } catch (error) {}
      layout = api.layout;
      model = layout && layout.surfaces && layout.surfaces.filter(function (surface) { return surface.surface_instance_id === 'chat'; })[0];
    }
    if (model && model.visible) {
      var host = document.querySelector('[data-pm-home-host="' + model.host + '"]');
      if (host && panel.parentNode !== host) host.appendChild(panel);
      panel.style.setProperty('order', String(model.slot_index || 0));
      if (model.host !== 'floating') panel.style.setProperty('flex', '1 1 ' + (model.size && model.size.basis_px || 360) + 'px', 'important');
      if (model.host === 'floating' && model.floating_bounds) {
        panel.style.setProperty('left', model.floating_bounds.x + 'px', 'important');
        panel.style.setProperty('top', model.floating_bounds.y + 'px', 'important');
        panel.style.setProperty('width', model.floating_bounds.width + 'px', 'important');
        panel.style.setProperty('height', model.floating_bounds.height + 'px', 'important');
      }
    }
  }

  function installChatOwnership() {
    seatChatForPage();
    document.addEventListener('click', function (event) {
      if (!event.target.closest || !event.target.closest('.activity-bar .icon[title="Chat"], .closeChatBtn')) return;
      setTimeout(function () { seatChatForPage(); syncChatChrome(); }, 0);
    }, false);
    document.addEventListener('page.changed', function () { raf(seatChatForPage); });
    if (window.PM_DEMO && window.PM_DEMO.on) {
      try { window.PM_DEMO.on('page.changed', function () { raf(seatChatForPage); }); } catch (error) {}
    }
    var observer = new MutationObserver(function () {
      var panel = document.getElementById('chatPanel');
      var resizer = document.getElementById('chatResizer');
      if (!homeActive() && panel && resizer && (panel.parentNode !== resizer.parentNode || panel.previousElementSibling !== resizer)) raf(seatChatForPage);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------- Home panel density ---------------------- */
  function homePresetFor(surface) {
    var direct = surface && surface.getAttribute('data-pm-home-size-preset');
    if (direct) return direct;
    var id = surface && surface.getAttribute('data-pm-home-surface');
    var api = window.PM_HOME_WORKSPACE;
    var layout = api && api.layout;
    var model = layout && layout.surfaces && layout.surfaces.filter(function (entry) { return entry.surface_instance_id === id; })[0];
    return model && model.size && model.size.preset_id || null;
  }
  function homeDensityFor(rect, preset) {
    /* Main-row panels are naturally tall, and sibling constraints may prevent
       a requested Compact panel from rendering at its ideal pixel width. A
       named preset therefore wins; geometry remains the fallback for manual
       resizing and older saved layouts. */
    if (preset === 'compact') return 'compact';
    if (preset === 'standard') return 'standard';
    if (preset === 'wide' || preset === 'tall' || preset === 'focus') return 'expanded';
    if (rect.width < 325 || rect.height < 205) return 'compact';
    if ((rect.width > 620 && rect.height > 300) || (rect.height > 420 && rect.width > 380)) return 'expanded';
    return 'standard';
  }
  function syncHomeSurface(surface, observedRect) {
    if (!surface || !surface.isConnected) return;
    var page = surface.closest && surface.closest('.primary-content > .page');
    if (page && !page.classList.contains('active')) return;
    var rect = observedRect || surface.__pmHomeObservedRect || surface.getBoundingClientRect();
    if (!(rect && rect.width > 0 && rect.height > 0)) return;
    surface.__pmHomeObservedRect = { width: rect.width, height: rect.height };
    var preset = homePresetFor(surface);
    surface.setAttribute('data-pm-home-density', homeDensityFor(rect, preset));
    if (preset) surface.setAttribute('data-pm-home-size-preset', preset);
    surface.setAttribute('data-pm-home-shape', rect.width > 1.55 * rect.height ? 'wide' : rect.height > 1.45 * rect.width ? 'tall' : 'balanced');
  }
  function installHomeDensity() {
    var observed = new WeakSet();
    var resizeObserver = new ResizeObserver(function (entries) { entries.forEach(function (entry) { syncHomeSurface(entry.target, entry.contentRect); }); });
    function enrollSurface(surface) {
      if (observed.has(surface) || !surface.isConnected) return;
      observed.add(surface); resizeObserver.observe(surface); syncHomeSurface(surface);
    }
    function enroll(root) {
      root = root || document;
      if (root.nodeType === 1 && root.matches('.pm-home-surface')) enrollSurface(root);
      if (root === document || root.childElementCount) {
        root.querySelectorAll('.pm-home-surface').forEach(enrollSurface);
      }
    }
    enroll();
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) { if (node.nodeType === 1) enroll(node); });
      });
    }).observe(document.body, { childList: true, subtree: true });

    var hud = document.createElement('div');
    hud.className = 'pm7-home-resize-hud';
    document.body.appendChild(hud);
    var target = null;
    function show(event, surface) {
      target = surface;
      document.documentElement.classList.add('pm7-home-resizing');
      update(event);
    }
    function update(event) {
      if (!target) return;
      var rect = target.getBoundingClientRect();
      var density = homeDensityFor(rect, homePresetFor(target));
      hud.innerHTML = '<b>' + Math.round(rect.width) + ' x ' + Math.round(rect.height) + ' px</b><span>' + density.charAt(0).toUpperCase() + density.slice(1) + ' content</span>';
      hud.style.left = Math.min(window.innerWidth - 140, Math.max(8, (event && event.clientX || rect.right) + 14)) + 'px';
      hud.style.top = Math.min(window.innerHeight - 58, Math.max(8, (event && event.clientY || rect.bottom) + 14)) + 'px';
      hud.classList.add('show');
      syncHomeSurface(target);
    }
    function hide() {
      if (!target) return;
      syncHomeSurface(target); target = null;
      document.documentElement.classList.remove('pm7-home-resizing');
      hud.classList.remove('show');
    }
    document.addEventListener('pointerdown', function (event) {
      var handle = event.target.closest && event.target.closest('.pm-home-resize-handle');
      if (!handle) return;
      var surface = handle.closest('.pm-home-surface');
      if (surface) {
        surface.removeAttribute('data-pm-home-size-preset');
        show(event, surface);
      }
    }, true);
    window.addEventListener('pointermove', update, true);
    window.addEventListener('pointerup', hide, true);
    window.addEventListener('pointercancel', hide, true);
    window.addEventListener('blur', hide);
    document.addEventListener('click', function (event) {
      var preset = event.target.closest && event.target.closest('[data-pm-home-action="size-surface"]');
      if (!preset) return;
      setTimeout(enroll, 0);
    });
  }

  /* ------------------- Home move target feedback -------------------- */
  function installHomeMoveHUD() {
    var hud = document.createElement('div');
    hud.className = 'pm7-home-move-hud';
    hud.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hud);
    var active = null;
    var frame = 0;
    var hostNames = { home_main:'Main workspace', dock_left:'Left dock', dock_right:'Right dock', dock_top:'Top dock', dock_bottom:'Bottom dock', floating:'Floating layer' };
    function surfaceLabel(surface) {
      var title = surface && surface.querySelector('.pane-title,.terminal-title,.chatHeaderTitle,[data-pm-home-title]');
      return (title && title.textContent || surface && surface.getAttribute('aria-label') || surface && surface.getAttribute('data-pm-home-surface') || 'Panel').trim();
    }
    function paint(event, finalState) {
      if (!active) return;
      var api = window.PM_HOME_WORKSPACE;
      var layout = finalState ? api && api.layout : api && (api.draft_layout || api.layout);
      var model = layout && layout.surfaces && layout.surfaces.filter(function (surface) { return surface.surface_instance_id === active.id; })[0];
      if (!model) return;
      var receipt = api && api.receipt_log && api.receipt_log.slice(-1)[0];
      hud.innerHTML = '<b>' + (finalState ? 'Placed' : 'Moving') + ' ' + active.label + '</b><span>' + (hostNames[model.host] || model.host) + ' · position ' + ((model.slot_index || 0) + 1) + (finalState && receipt ? ' · receipt linked' : '') + '</span>';
      var x = event && event.clientX || active.x || 24;
      var y = event && event.clientY || active.y || 24;
      hud.style.left = Math.min(window.innerWidth - 230, Math.max(10, x + 16)) + 'px';
      hud.style.top = Math.min(window.innerHeight - 56, Math.max(10, y + 16)) + 'px';
      hud.classList.add('show');
      hud.setAttribute('aria-hidden', 'false');
      active.x = x; active.y = y;
    }
    document.addEventListener('pointerdown', function (event) {
      var grip = event.target.closest && event.target.closest('.pm-home-surface-grip');
      if (!grip) return;
      var surface = grip.closest('.pm-home-surface');
      if (!surface) return;
      active = { id: surface.getAttribute('data-pm-home-surface'), label: surfaceLabel(surface), x:event.clientX, y:event.clientY };
      requestAnimationFrame(function () { if (active && document.body.classList.contains('pm-home-dragging')) paint(event, false); });
    }, true);
    window.addEventListener('pointermove', function (event) {
      if (!active) return;
      active.x = event.clientX; active.y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(function () { frame = 0; paint(event, false); });
    }, true);
    function finish(event, cancelled) {
      if (!active) return;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      if (cancelled) {
        hud.innerHTML = '<b>Move cancelled</b><span>' + active.label + ' returned to its previous placement</span>';
        hud.classList.add('show');
      } else {
        setTimeout(function () { if (active) paint(event, true); }, 0);
      }
      setTimeout(function () { hud.classList.remove('show'); hud.setAttribute('aria-hidden','true'); active = null; }, cancelled ? 650 : 900);
    }
    window.addEventListener('pointerup', function (event) { finish(event, false); }, true);
    window.addEventListener('pointercancel', function (event) { finish(event, true); }, true);
    window.addEventListener('blur', function (event) { if (event.target === window) finish(event, true); }, true);
  }

  /* --------------------- Dashboard widget system -------------------- */
  var DASH_KEY = 'pm7:home-widgets:v3';
  var LEGACY_DASH_KEY = 'pm7:home-widgets:v2';
  var DASH_FAULTS = { fail_next_write:false };
  var DASH_LOAD = { source_key:null, copy_forward:false, evicted_keys:[] };
  function readDashState() {
    var keys = [DASH_KEY, LEGACY_DASH_KEY];
    for (var index = 0; index < keys.length; index += 1) {
      var key = keys[index], raw = null;
      try { raw = window.localStorage.getItem(key); } catch (error) { raw = null; }
      if (raw == null) continue;
      try {
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_dashboard_state');
        DASH_LOAD.source_key = key;
        DASH_LOAD.copy_forward = key !== DASH_KEY;
        return parsed;
      } catch (error) {
        try { if (key === DASH_KEY) window.localStorage.removeItem(DASH_KEY); else window.localStorage.removeItem(LEGACY_DASH_KEY); } catch (ignored) {}
        DASH_LOAD.evicted_keys.push(key);
      }
    }
    return {};
  }
  function writeDashState(value) {
    var encoded = JSON.stringify(value), prior = null, hadPrior = false;
    try {
      prior = window.localStorage.getItem(DASH_KEY); hadPrior = prior !== null;
      if (DASH_FAULTS.fail_next_write) { DASH_FAULTS.fail_next_write = false; throw new Error('injected_dashboard_write_failure'); }
      window.localStorage.setItem(DASH_KEY, encoded);
      if (window.localStorage.getItem(DASH_KEY) !== encoded) throw new Error('dashboard_write_readback_mismatch');
      return { ok:true, encoded:encoded };
    } catch (error) {
      try { if (hadPrior) window.localStorage.setItem(DASH_KEY, prior); else window.localStorage.removeItem(DASH_KEY); } catch (rollbackError) {}
      return { ok:false, reason:'dashboard_storage_write_failed', error:String(error && error.message || error) };
    }
  }
  var dashState = readDashState();
  if (!dashState || typeof dashState !== 'object' || Array.isArray(dashState)) dashState = {};
  if (!dashState.sizes || typeof dashState.sizes !== 'object' || Array.isArray(dashState.sizes)) dashState.sizes = {};
  if (!Array.isArray(dashState.order)) dashState.order = [];
  var dashResize = null;
  var dashMove = null;
  var dashKeyboardMove = null;
  var dashMutationTimer = 0;
  var dashLastSerialized = null;
  var dashCommandSequence = 0;
  var dashCommandLog = [];
  var dashResultLog = [];
  var dashReceiptLog = [];
  var DASH_HOST_IDS = ['dashGridMain','dashGridMetrics','dashGridMonitoring'];

  function dashHosts() {
    return DASH_HOST_IDS.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  }
  function dashHostFor(card) {
    var host = card && card.parentElement;
    return host && DASH_HOST_IDS.indexOf(host.id) >= 0 ? host : null;
  }
  function dashCards(host) {
    if (!host || DASH_HOST_IDS.indexOf(host.id) < 0) return [];
    return Array.prototype.slice.call(host.children).filter(function (card) {
      return card.classList && card.classList.contains('pm6-dash-card') && !card.classList.contains('pm7-dash-resize-placeholder') && !card.classList.contains('pm7-dash-move-placeholder');
    });
  }
  function allDashCards() {
    return dashHosts().reduce(function (cards, host) { return cards.concat(dashCards(host)); }, []);
  }
  function cardKey(card) {
    var host = dashHostFor(card);
    return card.getAttribute('data-widget-id') || card.getAttribute('data-widget-kind') || ('card-' + (host ? dashCards(host).indexOf(card) : 0));
  }
  function cardSize(card) {
    return {
      w: parseInt(card.style.getPropertyValue('--dw'), 10) || 1,
      h: parseInt(card.style.getPropertyValue('--dh'), 10) || 1
    };
  }
  function dashDensity(size) {
    if (size.w * size.h <= 1) return 'compact';
    if ((size.w >= 2 && size.h >= 2) || size.w >= 3 || size.h >= 3) return 'expanded';
    return 'standard';
  }
  function dashShape(size) {
    if (size.h === 1 && size.w >= 2) return 'wide';
    if (size.w === 1 && size.h >= 2) return 'tower';
    if (size.w >= 2 && size.h >= 2) return 'canvas';
    return 'compact';
  }
  var EXTRA = {
    'orchestrator-progress': [['Receipts','47 / 47'],['Safe points','8'],['Workers','6 live'],['Next gate','package']],
    'active-lanes': [['Blocked','0'],['Recovering','0'],['CPU hosts','3'],['ETA','18m']],
    'recent-results': [['Passed','29'],['Degraded','1'],['Retried','2'],['Evidence','linked']],
    'custom-metrics': [['Window','24h'],['Source','plan index'],['Freshness','20s'],['Trend','+21%']],
    'usage.quota_summary': [['Accounts','6'],['Plan covered','5'],['API routes','1'],['Fallbacks','3']],
    'usage.budget_donuts': [['Budget','$250'],['Forecast','$201'],['Saved','$312'],['Overage','$12']],
    'usage.analytics_chart': [['Peak','15:00'],['Input','7.1M'],['Output','1.2M'],['Cache','96.8%']],
    'orch.lane_health': [['Healthy','3'],['Watch','1'],['Blocked','0'],['Updated','20s']],
    'orch.gate_queue': [['Pending','1'],['Auto','8'],['Manual','1'],['Oldest','4m']],
    'server.connection': [['Server','local'],['Execution','windows'],['Latency','2ms'],['Sync','current']]
  };
  var MOVE_SVG = '<svg aria-hidden="true" viewBox="0 0 20 20"><path class="pm7-dash-grip-groove" d="M9.5 4.5 L15.5 10.5 M4.5 4.5 L15.5 15.5" fill="none" stroke-width="1.5" stroke-linecap="round"/><path class="pm7-dash-grip-ring" d="M1.5 2 L16 2 Q18 2 18 4 L18 18.5 Z" fill="none" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var RESIZE_SVG = '<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 14.5h9v-9"/></svg>';
  var MENU_SVG = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="5" r="1.25"/><circle cx="10" cy="10" r="1.25"/><circle cx="10" cy="15" r="1.25"/></svg>';

  function injectDashExtra(card) {
    var body = $('[data-widget-body]', card);
    if (!body || $('.pm7-dash-extra', body)) return;
    var kind = card.getAttribute('data-widget-kind') || card.getAttribute('data-widget-id') || '';
    var rows = EXTRA[kind] || [['Receipt','linked'],['Freshness','current'],['Scope','project'],['Authority','Puppet Master']];
    var extra = document.createElement('div');
    extra.className = 'pm7-dash-extra pm7-dash-expanded';
    extra.innerHTML = rows.map(function (row) { return '<div><span>' + row[0] + '</span><b>' + row[1] + '</b></div>'; }).join('');
    body.appendChild(extra);
  }
  function addDashSizeButton(card) {
    var head = $('.pm6-dash-card-head', card);
    if (!head) return;
    var button = $('.pm7-dash-size-btn', head);
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'pm7-dash-size-btn';
      button.setAttribute('aria-label', 'Widget size and options');
      button.setAttribute('aria-expanded', 'false');
      var gear = $('[data-pm6-dash="gear"]', head), remove = $('[data-pm6-dash="remove"]', head);
      head.insertBefore(button, gear || remove || null);
    }
    button.innerHTML = MENU_SVG;
  }
  function upgradeDashChrome(card) {
    var head = $('.pm6-dash-card-head', card);
    if (!head) return;
    var move = $('.pm6-dash-drag', head);
    if (!move) {
      move = document.createElement('button');
      move.className = 'pm6-dash-drag';
      head.appendChild(move);
    }
    if (move.tagName !== 'BUTTON') {
      var replacement = document.createElement('button');
      replacement.className = move.className;
      move.replaceWith(replacement);
      move = replacement;
    }
    move.type = 'button';
    move.removeAttribute('data-pm6-dash'); /* disables the retired base controller */
    move.innerHTML = MOVE_SVG;
    move.tabIndex = 0;
    move.setAttribute('aria-label', 'Move widget');
    move.setAttribute('aria-grabbed', 'false');
    move.title = 'Drag to move, or press Enter then use the arrow keys';

    var resize = $('.pm6-dash-resize', card);
    if (!resize) {
      resize = document.createElement('span');
      resize.className = 'pm6-dash-resize';
      card.appendChild(resize);
    }
    resize.removeAttribute('data-pm6-dash'); /* disables the retired base controller */
    resize.innerHTML = RESIZE_SVG;
    resize.tabIndex = 0;
    resize.setAttribute('role', 'button');
    resize.title = 'Drag to resize; placement settles after release';
  }
  function syncDashCard(card) {
    if (!card || !card.isConnected || card.classList.contains('pm7-dash-resize-placeholder') || card.classList.contains('pm7-dash-move-placeholder')) return;
    var size = cardSize(card);
    card.setAttribute('data-pm7-density', dashDensity(size));
    card.setAttribute('data-pm7-shape', dashShape(size));
    card.setAttribute('data-pm7-size', size.w + 'x' + size.h);
    injectDashExtra(card);
    addDashSizeButton(card);
    upgradeDashChrome(card);
    var resize = $('.pm6-dash-resize', card);
    if (resize) resize.setAttribute('aria-label', 'Resize widget. Current size ' + size.w + ' by ' + size.h);
    var move = $('.pm6-dash-drag', card);
    if (move) move.setAttribute('aria-label', 'Move ' + (($('.pm6-dash-card-title', card) || {}).textContent || 'widget'));
  }
  function dashOrdersEqual(left, right) {
    return left.length === right.length && left.every(function (value, index) { return value === right[index]; });
  }
  function dashHostOrder(host) { return dashCards(host).map(cardKey); }
  function allDashOrder() { return allDashCards().map(cardKey); }
  function restoreDashHostOrder(host, order) {
    var cards = dashCards(host), byKey = {};
    cards.forEach(function (card) { byKey[cardKey(card)] = card; });
    order.forEach(function (key) { if (byKey[key]) host.appendChild(byKey[key]); });
    cards.forEach(function (card) { if (card.parentElement === host && order.indexOf(cardKey(card)) < 0) host.appendChild(card); });
  }
  function serializedDashState() {
    var nextSizes = {};
    allDashCards().forEach(function (card) { nextSizes[cardKey(card)] = cardSize(card); });
    return { sizes:nextSizes, order:allDashOrder() };
  }
  function persistDashIfChanged() {
    if (dashResize || dashMove || dashKeyboardMove) return { ok:false, changed:false, reason:'preview_active' };
    var next = serializedDashState(), serialized = JSON.stringify(next);
    if (serialized === dashLastSerialized) return { ok:true, changed:false };
    var written = writeDashState(next);
    if (!written.ok) return { ok:false, changed:false, reason:written.reason, error:written.error };
    dashState = next; dashLastSerialized = serialized;
    if (DASH_LOAD.source_key === LEGACY_DASH_KEY) {
      try { window.localStorage.removeItem(LEGACY_DASH_KEY); } catch (error) {}
    }
    DASH_LOAD.source_key = DASH_KEY; DASH_LOAD.copy_forward = false;
    return { ok:true, changed:true };
  }
  function persistDash() { return persistDashIfChanged(); }
  function restoreDash() {
    var suppliedSizes = dashState.sizes && typeof dashState.sizes === 'object' && !Array.isArray(dashState.sizes) ? dashState.sizes : {};
    var suppliedOrder = Array.isArray(dashState.order) ? dashState.order : [];
    var knownCards = allDashCards(), knownKeys = knownCards.map(cardKey), savedOrder = [], seen = {};
    suppliedOrder.forEach(function (key) { if (knownKeys.indexOf(key) >= 0 && !seen[key]) { seen[key] = true; savedOrder.push(key); } });
    knownKeys.forEach(function (key) { if (!seen[key]) { seen[key] = true; savedOrder.push(key); } });
    dashHosts().forEach(function (host) {
      var cards = dashCards(host), keys = cards.map(cardKey), hostSaved = savedOrder.filter(function (key) { return keys.indexOf(key) >= 0; });
      cards.forEach(function (card) {
        var size = suppliedSizes[cardKey(card)];
        if (size && Number.isFinite(Number(size.w)) && Number.isFinite(Number(size.h))) {
          /* Preserve the complete supported semantic width independently of
             the viewport used for restoration.  CSS clamps its painted span
             to the current track count; rewriting a saved four-column choice
             to three merely because the page booted narrow is destructive. */
          card.style.setProperty('--dw', Math.max(1, Math.min(4, Math.round(Number(size.w)))));
          card.style.setProperty('--dh', Math.max(1, Math.min(3, Math.round(Number(size.h)))));
        }
      });
      restoreDashHostOrder(host, hostSaved);
      dashCards(host).forEach(syncDashCard);
    });
    var normalized = serializedDashState(), normalizedBytes = JSON.stringify(normalized);
    var suppliedBytes = JSON.stringify({ sizes:suppliedSizes, order:suppliedOrder });
    var needsCopyForward = DASH_LOAD.copy_forward || (DASH_LOAD.source_key !== null && suppliedBytes !== normalizedBytes);
    dashState = normalized; dashLastSerialized = needsCopyForward ? null : normalizedBytes;
    if (needsCopyForward) persistDashIfChanged();
  }
  function cloneDashValue(value) { return JSON.parse(JSON.stringify(value)); }
  function dashLayoutOrigin(node) {
    var left = 0, top = 0, current = node, guard = 0;
    while (current && guard < 100) {
      left += Number(current.offsetLeft) || 0;
      top += Number(current.offsetTop) || 0;
      current = current.offsetParent;
      guard += 1;
    }
    return { left:left, top:top, valid:guard > 0 && guard < 100 };
  }
  function dashSettledPosition(card) {
    var grid = document.getElementById('pm6DashGrid');
    if (!grid || !card) return { col:1, row:1 };
    /* offset coordinates describe the committed grid layout and deliberately
       exclude an in-flight FLIP transform.  getBoundingClientRect() would
       report the old painted row until that transition finishes. */
    var metrics = dashGridMetrics(grid), gridOrigin = dashLayoutOrigin(grid), cardOrigin = dashLayoutOrigin(card);
    var style = getComputedStyle(grid), padLeft = parseFloat(style.paddingLeft) || 0, padTop = parseFloat(style.paddingTop) || 0;
    var layoutLeft = gridOrigin.valid && cardOrigin.valid ? cardOrigin.left-gridOrigin.left : card.offsetLeft;
    var layoutTop = gridOrigin.valid && cardOrigin.valid ? cardOrigin.top-gridOrigin.top : card.offsetTop;
    return {
      col:Math.max(1,Math.min(metrics.cols,Math.round((layoutLeft-padLeft)/Math.max(1,metrics.cellW+metrics.colGap))+1)),
      row:Math.max(1,Math.round((layoutTop-padTop)/Math.max(1,metrics.cellH+metrics.rowGap))+1)
    };
  }
  function dashCommandArgs(commandId, card, toSize) {
    if (commandId === 'cmd.widget.resize') return {
      page:'dashboard', instance_id:cardKey(card), col_span:toSize.w, row_span:toSize.h
    };
    var position = dashSettledPosition(card);
    return { page:'dashboard', instance_id:cardKey(card), col:position.col, row:position.row };
  }
  function dispatchDashCommand(commandId, card, fromSize, toSize, extra, settle) {
    var sequence = ++dashCommandSequence;
    var correlationId = 'pm7-dashboard-correlation-' + sequence;
    var detail = Object.assign({
      command_id: commandId,
      command_instance_id: 'pm7-dashboard-command-' + sequence,
      origin: 'home_dashboard',
      correlation_id: correlationId,
      idempotency_key: 'pm7-dashboard-idempotency-' + sequence,
      receipt_required: true,
      dispatched_at_utc: new Date().toISOString()
    }, dashCommandArgs(commandId,card,toSize));
    dashCommandLog.push(cloneDashValue(detail));
    var ownerAccepted = true, listenerError = null, priorOnError = window.onerror;
    window.onerror = function (message, source, line, column, error) {
      listenerError = error || message || 'dashboard_owner_listener_error';
      return typeof priorOnError === 'function' ? priorOnError.apply(this,arguments) : false;
    };
    try {
      ownerAccepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail:cloneDashValue(detail), cancelable:true }));
    } catch (error) { listenerError = error; ownerAccepted = false; }
    finally { window.onerror = priorOnError; }
    if (listenerError) ownerAccepted = false;
    var settlement = ownerAccepted ? (typeof settle === 'function' ? settle() : { ok:true, changed:false }) : { ok:false, changed:false, reason:listenerError ? 'owner_listener_failed' : 'owner_rejected' };
    var accepted = !!(settlement && settlement.ok);
    /* This is a demo-owner projection for the standalone concept, not a
       claim that widget commands use a shared-runtime domain-result schema. */
    var result = {
      result_type:'WidgetLayoutPrototypeOwnerResult',
      result_id:'pm7-dashboard-result-' + sequence,
      command_id:commandId,
      command_instance_id:detail.command_instance_id,
      correlation_id:correlationId,
      outcome:accepted ? 'accepted' : 'failed',
      reason:accepted ? null : settlement && settlement.reason || 'dashboard_settlement_failed',
      persisted:accepted && !!settlement.changed,
      interaction:cloneDashValue(extra || {}),
      recorded_at_utc:new Date().toISOString()
    };
    var receipt = {
      receipt_type:commandId + '.dispatch_receipt',
      receipt_id:'pm7-dashboard-receipt-' + sequence,
      command_id:commandId,
      command_instance_id:detail.command_instance_id,
      correlation_id:correlationId,
      origin:'home_dashboard',
      command_result_ref:result.result_id,
      outcome:accepted ? 'applied' : 'failed',
      persisted:accepted && !!settlement.changed,
      details:{ reason:result.reason, interaction:cloneDashValue(extra || {}) },
      recorded_at_utc:new Date().toISOString()
    };
    dashResultLog.push(cloneDashValue(result)); dashReceiptLog.push(cloneDashValue(receipt));
    try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail:cloneDashValue(receipt) })); } catch (error) {}
    return { accepted:accepted, command:detail, result:result, receipt:receipt, settlement:settlement };
  }
  function applyDashSize(card, w, h, source) {
    var grid = document.getElementById('pm6DashGrid'), host = dashHostFor(card);
    if (!card || !grid || !host) return false;
    var cols = (getComputedStyle(grid).gridTemplateColumns || '').split(' ').filter(Boolean).length || 2;
    var before = cardSize(card);
    w = Math.max(1, Math.min(cols, Math.round(Number(w) || before.w)));
    h = Math.max(1, Math.min(3, Math.round(Number(h) || before.h)));
    if (before.w === w && before.h === h) return false;
    card.style.setProperty('--dw', w); card.style.setProperty('--dh', h);
    syncDashCard(card);
    var transaction = dispatchDashCommand('cmd.widget.resize', card, before, { w:w, h:h }, { source_action:source || 'size_menu' }, persistDashIfChanged);
    if (!transaction.accepted) {
      card.style.setProperty('--dw', before.w); card.style.setProperty('--dh', before.h); syncDashCard(card);
    }
    settleDashCardAnimation(card);
    return transaction.accepted;
  }

  function installDashSizePopover() {
    var existing = document.querySelector('.pm7-dash-size-pop');
    if (existing) existing.remove();
    var pop = document.createElement('div');
    pop.className = 'pm7-dash-size-pop';
    pop.innerHTML = '<button data-size="1x1">Compact<span>1 x 1 · essentials</span></button><button data-size="1x2">Tall<span>1 x 2 · more rows</span></button><button data-size="2x1">Wide<span>2 x 1 · comparison</span></button><button data-size="2x2">Detailed<span>2 x 2 · full detail</span></button><button data-size="3x1">Strip<span>3 x 1 · horizontal</span></button><button data-size="3x2">Focus<span>3 x 2 · expanded</span></button>';
    document.body.appendChild(pop);
    var current = null;
    function close() {
      pop.classList.remove('open');
      if (current) { var b = $('.pm7-dash-size-btn', current); if (b) b.setAttribute('aria-expanded','false'); }
      current = null;
    }
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest && event.target.closest('.pm7-dash-size-btn');
      if (trigger) {
        event.preventDefault(); event.stopImmediatePropagation();
        var card = trigger.closest('.pm6-dash-card');
        if (current === card && pop.classList.contains('open')) { close(); return; }
        close(); current = card; trigger.setAttribute('aria-expanded','true');
        var rect = trigger.getBoundingClientRect();
        pop.style.left = Math.min(window.innerWidth - 244, Math.max(8, rect.right - 236)) + 'px';
        pop.style.top = Math.min(window.innerHeight - 176, rect.bottom + 6) + 'px';
        pop.classList.add('open'); return;
      }
      var size = event.target.closest && event.target.closest('.pm7-dash-size-pop [data-size]');
      if (size && current) {
        event.preventDefault(); event.stopImmediatePropagation();
        var parts = size.getAttribute('data-size').split('x');
        applyDashSize(current, parseInt(parts[0],10), parseInt(parts[1],10), 'size_menu');
        close(); return;
      }
      if (!event.target.closest || !event.target.closest('.pm7-dash-size-pop')) close();
    }, true);
    window.addEventListener('resize', close);
  }

  function dashGridMetrics(grid) {
    var cs = getComputedStyle(grid);
    var tracks = (cs.gridTemplateColumns || '').split(' ').filter(Boolean);
    var cols = tracks.length || 2;
    var colGap = parseFloat(cs.columnGap) || 8;
    var rowGap = parseFloat(cs.rowGap) || colGap;
    return {
      cols: cols,
      colGap: colGap,
      rowGap: rowGap,
      cellW: (grid.clientWidth - colGap * (cols - 1)) / cols,
      cellH: parseFloat(cs.gridAutoRows) || 128
    };
  }
  function makeDashPlaceholder(card, className) {
    var size = cardSize(card);
    var ph = document.createElement('div');
    ph.className = 'pm6-dash-card ' + className;
    ph.setAttribute('aria-hidden', 'true');
    ph.style.setProperty('--dw', size.w);
    ph.style.setProperty('--dh', size.h);
    ph.style.setProperty('--i', card.style.getPropertyValue('--i') || '0');
    return ph;
  }
  function captureDashRects(host) {
    var map = new Map();
    dashCards(host).forEach(function (card) { if (card.style.display !== 'none') map.set(card, card.getBoundingClientRect()); });
    return map;
  }
  function cancelDashPeerAnimation(card) {
    if (card && card._pm7DashMoveAnimation) {
      try { card._pm7DashMoveAnimation.cancel(); } catch (error) {}
      card._pm7DashMoveAnimation = null;
    }
  }
  function settleDashCardAnimation(card) {
    if (!card) return;
    card.style.removeProperty('animation');
    if (typeof card.getAnimations !== 'function') return;
    card.getAnimations().forEach(function (animation) {
      try { animation.finish(); }
      catch (error) { try { animation.cancel(); } catch (ignored) {} }
    });
  }
  function animateDashFlip(before) {
    if (!before) return;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    before.forEach(function (oldRect, card) {
      var painted = oldRect; cancelDashPeerAnimation(card);
      if (!card.isConnected || card.style.display === 'none') return;
      var next = card.getBoundingClientRect(), dx = painted.left-next.left, dy = painted.top-next.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5 || reduce || typeof card.animate !== 'function') return;
      var animation = card.animate([{ transform:'translate3d(' + dx + 'px,' + dy + 'px,0)' },{ transform:'translate3d(0,0,0)' }], { duration:180, easing:'cubic-bezier(.2,.8,.2,1)' });
      card._pm7DashMoveAnimation = animation;
      animation.onfinish = animation.oncancel = function () { if (card._pm7DashMoveAnimation === animation) card._pm7DashMoveAnimation = null; };
    });
  }

  function installDashResize() {
    var oldHud = document.querySelector('.pm7-dash-resize-hud'); if (oldHud) oldHud.remove();
    var hud = document.createElement('div'); hud.className = 'pm7-dash-resize-hud'; document.body.appendChild(hud);
    function positionHud(event, size) {
      hud.innerHTML = '<b>' + size.w + ' x ' + size.h + '</b> · ' + dashDensity(size) + ' content · settles on release';
      hud.style.left = Math.min(window.innerWidth-225,Math.max(8,event.clientX+14)) + 'px';
      hud.style.top = Math.min(window.innerHeight-44,Math.max(8,event.clientY+14)) + 'px';
      hud.classList.add('show');
    }
    function validRelease(d, event) {
      if (!event || event.pointerId !== d.pointerId) return false;
      var gridRect = d.grid.getBoundingClientRect();
      var scrollRect = d.scroller.getBoundingClientRect ? d.scroller.getBoundingClientRect() : gridRect;
      var footer = document.querySelector('.pm7-statusbar'), footerRect = footer ? footer.getBoundingClientRect() : null;
      var left = Math.max(gridRect.left,scrollRect.left), right = Math.min(gridRect.right,scrollRect.right);
      var top = Math.max(gridRect.top,scrollRect.top), bottom = Math.min(gridRect.bottom,scrollRect.bottom,window.innerHeight);
      if (footerRect && footerRect.top > top) bottom = Math.min(bottom,footerRect.top);
      return event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
    }
    function preview(event) {
      var d = dashResize; if (!d || event.pointerId !== d.pointerId) return;
      event.preventDefault();
      var w = Math.round((event.clientX-d.rect.left+d.metrics.colGap/2)/(d.metrics.cellW+d.metrics.colGap));
      var h = Math.round((event.clientY-d.rect.top+d.metrics.rowGap/2)/(d.metrics.cellH+d.metrics.rowGap));
      w = Math.max(1,Math.min(d.metrics.cols,w)); h = Math.max(1,Math.min(3,h));
      if (w !== d.current.w || h !== d.current.h) {
        d.current = { w:w,h:h }; d.changed = w !== d.original.w || h !== d.original.h;
        d.card.style.setProperty('--dw',w); d.card.style.setProperty('--dh',h);
        d.card.style.setProperty('width',(d.metrics.cellW*w+d.metrics.colGap*(w-1))+'px','important');
        d.card.style.setProperty('height',(d.metrics.cellH*h+d.metrics.rowGap*(h-1))+'px','important');
        syncDashCard(d.card);
      }
      positionHud(event,d.current);
      if (window.scrollX !== d.windowX || window.scrollY !== d.windowY) window.scrollTo(d.windowX,d.windowY);
      d.scroller.scrollTop = d.scrollTop; d.scroller.scrollLeft = d.scrollLeft;
    }
    function cleanupFixed(card) {
      ['left','top','width','height','margin','transform','transition','position','z-index'].forEach(function (name) { card.style.removeProperty(name); });
      card.classList.remove('pm6-is-resizing','pm7-dash-resize-lift');
    }
    function finish(event, requestedCommit) {
      var d = dashResize; if (!d) return;
      if (event && event.pointerId != null && event.pointerId !== d.pointerId) return;
      dashResize = null;
      window.removeEventListener('pointermove',preview,true); window.removeEventListener('pointerup',onUp,true); window.removeEventListener('pointercancel',onCancel,true); window.removeEventListener('blur',onBlur,true); document.removeEventListener('keydown',onKey,true); d.grip.removeEventListener('lostpointercapture',onLost);
      var shouldCommit = !!requestedCommit && validRelease(d,event) && d.changed;
      var beforeRects = captureDashRects(d.host);
      if (!shouldCommit) { d.card.style.setProperty('--dw',d.original.w); d.card.style.setProperty('--dh',d.original.h); }
      cleanupFixed(d.card); if (d.placeholder.parentNode) d.placeholder.remove();
      d.grip.classList.remove('resizing'); document.documentElement.classList.remove('pm7-dash-resizing'); hud.classList.remove('show'); syncDashCard(d.card);
      if (shouldCommit) {
        var transaction = dispatchDashCommand('cmd.widget.resize',d.card,d.original,d.current,{source_action:'pointer_resize',preview_reflow:false},persistDashIfChanged);
        if (!transaction.accepted) {
          d.card.style.setProperty('--dw',d.original.w); d.card.style.setProperty('--dh',d.original.h); syncDashCard(d.card);
        }
      }
      settleDashCardAnimation(d.card);
      animateDashFlip(beforeRects);
      try { if (d.grip.hasPointerCapture(d.pointerId)) d.grip.releasePointerCapture(d.pointerId); } catch (error) {}
      if (event && event.preventDefault) event.preventDefault();
      d.grip.focus({preventScroll:true});
    }
    function onUp(event) { finish(event,true); }
    function onCancel(event) { finish(event,false); }
    function onBlur() { if (dashResize) finish({pointerId:dashResize.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false); }
    function onLost(event) { if (dashResize && event.pointerId === dashResize.pointerId) finish(event,false); }
    function onKey(event) { if (event.key === 'Escape') { event.preventDefault(); if (dashResize) finish({pointerId:dashResize.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false); } }
    document.addEventListener('pointerdown',function (event) {
      var grip = event.target.closest && event.target.closest('.pm6-dash-resize');
      if (!grip || dashResize || dashMove || dashKeyboardMove || event.button !== 0) return;
      var card = grip.closest('.pm6-dash-card'), host = dashHostFor(card), grid = document.getElementById('pm6DashGrid');
      if (!card || !host || !grid || card.classList.contains('pm7-dash-resize-placeholder')) return;
      event.preventDefault(); event.stopImmediatePropagation();
      var rect = card.getBoundingClientRect(), metrics = dashGridMetrics(grid), original = cardSize(card);
      var scroller = document.getElementById('pm6DashScroll') || document.documentElement;
      var placeholder = makeDashPlaceholder(card,'pm7-dash-resize-placeholder'); host.insertBefore(placeholder,card);
      dashResize = {card:card,grip:grip,host:host,grid:grid,placeholder:placeholder,rect:rect,metrics:metrics,original:original,current:{w:original.w,h:original.h},changed:false,pointerId:event.pointerId,windowX:window.scrollX,windowY:window.scrollY,scroller:scroller,scrollTop:scroller.scrollTop,scrollLeft:scroller.scrollLeft};
      card.classList.add('pm6-is-resizing','pm7-dash-resize-lift');
      card.style.setProperty('left',rect.left+'px','important'); card.style.setProperty('top',rect.top+'px','important'); card.style.setProperty('width',rect.width+'px','important'); card.style.setProperty('height',rect.height+'px','important');
      grip.classList.add('resizing'); document.documentElement.classList.add('pm7-dash-resizing');
      grip.addEventListener('lostpointercapture',onLost);
      try { grip.setPointerCapture(event.pointerId); } catch (error) {}
      positionHud(event,original);
      window.addEventListener('pointermove',preview,{capture:true,passive:false}); window.addEventListener('pointerup',onUp,true); window.addEventListener('pointercancel',onCancel,true); window.addEventListener('blur',onBlur,true); document.addEventListener('keydown',onKey,true);
    },true);
    document.addEventListener('keydown',function (event) {
      var grip = event.target.closest && event.target.closest('.pm6-dash-resize');
      if (!grip || !/Arrow(Left|Right|Up|Down)/.test(event.key)) return;
      var card = grip.closest('.pm6-dash-card'), size = cardSize(card); if (!dashHostFor(card)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') size.w -= 1; if (event.key === 'ArrowRight') size.w += 1; if (event.key === 'ArrowUp') size.h -= 1; if (event.key === 'ArrowDown') size.h += 1;
      applyDashSize(card,size.w,size.h,'keyboard_resize');
    });
  }

  function installDashMove() {
    function visibleDashRect(d) {
      var gridRect = d.grid.getBoundingClientRect(), scrollRect = d.scroller.getBoundingClientRect ? d.scroller.getBoundingClientRect() : gridRect;
      var footer = document.querySelector('.pm7-statusbar'), footerRect = footer ? footer.getBoundingClientRect() : null;
      return {left:Math.max(gridRect.left,scrollRect.left),right:Math.min(gridRect.right,scrollRect.right),top:Math.max(gridRect.top,scrollRect.top),bottom:footerRect && footerRect.top > scrollRect.top ? Math.min(scrollRect.bottom,footerRect.top) : scrollRect.bottom};
    }
    function dashPoint(d,x,y) { var rect=d.grid.getBoundingClientRect(); return {x:x-rect.left,y:y-rect.top}; }
    function dashCandidateRect(d) { var gridRect=d.grid.getBoundingClientRect(), rect=d.placeholder.getBoundingClientRect(); return {left:rect.left-gridRect.left,top:rect.top-gridRect.top,right:rect.right-gridRect.left,bottom:rect.bottom-gridRect.top,width:rect.width,height:rect.height}; }
    function dashInsertAt(d,index) { var cards=dashCards(d.host), ref=index<cards.length?cards[index]:null; if(ref)d.host.insertBefore(d.placeholder,ref);else d.host.appendChild(d.placeholder); }
    function measureDashCandidates(d) {
      var cards=dashCards(d.host), seen={}, measured=[];
      for(var index=0;index<=cards.length;index+=1){
        dashInsertAt(d,index); var rect=dashCandidateRect(d), signature=[Math.round(rect.left*10),Math.round(rect.top*10),Math.round(rect.width*10),Math.round(rect.height*10)].join(':');
        if(!seen[signature]){seen[signature]=true;measured.push({index:index,before_id:index<cards.length?cardKey(cards[index]):null,after_id:index?cardKey(cards[index-1]):null,rect:rect,token:'home-slot-'+index+'-'+(index<cards.length?cardKey(cards[index]):'end')});}
      }
      dashInsertAt(d,d.originalIndex); d.candidates=measured;var reachableBottom=measured.reduce(function(bottom,row){return Math.max(bottom,row.rect.bottom);},0);if(reachableBottom)d.grid.style.setProperty('min-height',Math.ceil(reachableBottom+8)+'px');d.intent=measured.filter(function(row){return row.index===d.originalIndex;})[0]||measured[0];
      if(d.intent){d.placeholder.dataset.dropIntent=d.intent.token;d.placeholder.dataset.dropIndex=String(d.intent.index);}
    }
    function candidateDistance(candidate,point){var dx=point.x<candidate.rect.left?candidate.rect.left-point.x:point.x>candidate.rect.right?point.x-candidate.rect.right:0,dy=point.y<candidate.rect.top?candidate.rect.top-point.y:point.y>candidate.rect.bottom?point.y-candidate.rect.bottom:0,cx=candidate.rect.left+candidate.rect.width/2,cy=candidate.rect.top+candidate.rect.height/2;return dx*dx+dy*dy+Math.pow(point.x-cx,2)*.012+Math.pow(point.y-cy,2)*.012;}
    function chooseDashIntent(d,x,y){var point=dashPoint(d,x,y),best=null,bestScore=Infinity;d.candidates.forEach(function(row){var score=candidateDistance(row,point);if(score<bestScore){best=row;bestScore=score;}});if(!best||!d.intent||best.token===d.intent.token)return best||d.intent;var current=candidateDistance(d.intent,point);return bestScore+144<current?best:d.intent;}
    function placeDashIntent(d,intent){if(!intent||(d.intent&&intent.token===d.intent.token))return;var before=captureDashRects(d.host),lockedScrollTop=d.scroller.scrollTop;dashCards(d.host).forEach(cancelDashPeerAnimation);dashInsertAt(d,intent.index);d.scroller.scrollTop=lockedScrollTop;d.intent=intent;d.intentSerial+=1;d.placeholder.dataset.dropIntent=intent.token;d.placeholder.dataset.dropIndex=String(intent.index);d.placeholder.dataset.dropSerial=String(d.intentSerial);animateDashFlip(before);}
    function pointInsideDash(d,x,y){var rect=visibleDashRect(d);return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;}
    function paintDashPointer(){var d=dashMove;if(!d)return;d.pointerFrame=0;d.ghost.style.left=(d.x-d.offsetX)+'px';d.ghost.style.top=(d.y-d.offsetY)+'px';d.validDrop=pointInsideDash(d,d.x,d.y);if(d.validDrop)placeDashIntent(d,chooseDashIntent(d,d.x,d.y));}
    function edgeVelocity(d){var rect=visibleDashRect(d),edge=Math.min(78,Math.max(54,(rect.bottom-rect.top)*.18));if(d.x<rect.left||d.x>rect.right)return 0;if(d.y<rect.top+edge&&d.scroller.scrollTop>0)return -Math.ceil(3+Math.max(0,Math.min(1,(rect.top+edge-d.y)/edge))*9);if(d.y>rect.bottom-edge&&d.scroller.scrollTop<d.scroller.scrollHeight-d.scroller.clientHeight)return Math.ceil(3+Math.max(0,Math.min(1,(d.y-(rect.bottom-edge))/edge))*9);return 0;}
    function autoScrollDash(){var d=dashMove;if(!d)return;d.scrollFrame=0;var velocity=edgeVelocity(d);if(!velocity)return;var before=d.scroller.scrollTop;d.scroller.scrollTop+=velocity;if(d.scroller.scrollTop!==before){paintDashPointer();d.scrollFrame=requestAnimationFrame(autoScrollDash);}}
    function moveGhost(event){var d=dashMove;if(!d||event.pointerId!==d.pointerId)return;event.preventDefault();d.x=event.clientX;d.y=event.clientY;if(!d.pointerFrame)d.pointerFrame=requestAnimationFrame(paintDashPointer);if(!d.scrollFrame&&edgeVelocity(d))d.scrollFrame=requestAnimationFrame(autoScrollDash);}
    function removeGhost(ghost){if(ghost&&ghost.parentNode)ghost.remove();}
    function settleDashGhost(d,landing,committed){
      if(!committed||matchMedia('(prefers-reduced-motion: reduce)').matches||typeof d.ghost.animate!=='function'){removeGhost(d.ghost);return;}
      var start=d.ghost.getBoundingClientRect();
      var animation=d.ghost.animate([
        {left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px'},
        {left:landing.left+'px',top:landing.top+'px',width:landing.width+'px',height:landing.height+'px'}
      ],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});
      d.ghost._pm7DashSettleAnimation=animation;
      animation.onfinish=animation.oncancel=function(){if(d.ghost._pm7DashSettleAnimation===animation)d.ghost._pm7DashSettleAnimation=null;removeGhost(d.ghost);};
    }
    function cleanupDashMove(d){if(d.pointerFrame)cancelAnimationFrame(d.pointerFrame);if(d.scrollFrame)cancelAnimationFrame(d.scrollFrame);window.removeEventListener('pointermove',moveGhost,true);window.removeEventListener('pointerup',onUp,true);window.removeEventListener('pointercancel',onCancel,true);window.removeEventListener('blur',onBlur,true);document.removeEventListener('keydown',onKey,true);d.grip.removeEventListener('lostpointercapture',onLost);try{if(d.grip.hasPointerCapture(d.pointerId))d.grip.releasePointerCapture(d.pointerId);}catch(error){}if(d.originalGridMinHeight)d.grid.style.setProperty('min-height',d.originalGridMinHeight);else d.grid.style.removeProperty('min-height');document.documentElement.classList.remove('pm7-dash-moving');d.grip.setAttribute('aria-grabbed','false');}
    function finish(event,requestedCommit){
      var d=dashMove;if(!d)return;if(event&&event.pointerId!=null&&event.pointerId!==d.pointerId)return;dashMove=null;
      var shouldCommit=!!requestedCommit&&pointInsideDash(d,event.clientX,event.clientY),preview=d.placeholder.parentNode?d.placeholder.getBoundingClientRect():null;
      if(!shouldCommit)dashInsertAt(d,d.originalIndex);
      if(d.placeholder.parentNode)d.placeholder.parentNode.replaceChild(d.card,d.placeholder);
      if(d.originalDisplay)d.card.style.setProperty('display',d.originalDisplay);else d.card.style.removeProperty('display');
      if(!shouldCommit)restoreDashHostOrder(d.host,d.originalKeys);
      var finalKeys=dashHostOrder(d.host),changed=shouldCommit&&!dashOrdersEqual(d.originalKeys,finalKeys),transaction=null;
      if(changed){
        transaction=dispatchDashCommand('cmd.widget.move',d.card,null,null,{source_action:'pointer_move',order:allDashOrder()},persistDashIfChanged);
        if(!transaction.accepted){restoreDashHostOrder(d.host,d.originalKeys);changed=false;}
      }
      dashCards(d.host).forEach(cancelDashPeerAnimation);syncDashCard(d.card);settleDashCardAnimation(d.card);
      var landing=d.card.getBoundingClientRect();
      d.grid._pm7LastHomeReorder={widget_id:cardKey(d.card),committed:changed,intent:d.intent?{token:d.intent.token,index:d.intent.index,before_id:d.intent.before_id,after_id:d.intent.after_id}:null,preview_rect:preview?{left:preview.left,top:preview.top,width:preview.width,height:preview.height}:null,landing_rect:{left:landing.left,top:landing.top,width:landing.width,height:landing.height},host_id:d.host.id,receipt_id:transaction&&transaction.receipt.receipt_id||null};
      cleanupDashMove(d);settleDashGhost(d,landing,changed);d.grip.focus({preventScroll:true});if(event&&event.preventDefault)event.preventDefault();
    }
    function onUp(event){finish(event,true);}function onCancel(event){finish(event,false);}function onBlur(){if(dashMove)finish({pointerId:dashMove.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false);}function onLost(event){if(dashMove&&event.pointerId===dashMove.pointerId)finish(event,false);}function onKey(event){if(event.key==='Escape'){event.preventDefault();if(dashMove)finish({pointerId:dashMove.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false);}}
    document.addEventListener('pointerdown',function(event){var grip=event.target.closest&&event.target.closest('.pm6-dash-drag');if(!grip||dashMove||dashResize||dashKeyboardMove||event.button!==0)return;var card=grip.closest('.pm6-dash-card'),host=dashHostFor(card),grid=document.getElementById('pm6DashGrid');if(!card||!host||!grid)return;event.preventDefault();event.stopImmediatePropagation();var rect=card.getBoundingClientRect(),ghost=card.cloneNode(true),placeholder=makeDashPlaceholder(card,'pm7-dash-move-placeholder'),scroller=document.getElementById('pm6DashScroll')||document.documentElement;ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(function(node){node.removeAttribute('id');});ghost.querySelectorAll('button,[href],input,select,textarea,[tabindex]').forEach(function(node){node.setAttribute('tabindex','-1');});ghost.classList.add('pm7-dash-move-ghost');ghost.setAttribute('aria-hidden','true');ghost.inert=true;ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';document.body.appendChild(ghost);var originalKeys=dashHostOrder(host),originalIndex=originalKeys.indexOf(cardKey(card)),originalDisplay=card.style.getPropertyValue('display'),originalGridMinHeight=grid.style.getPropertyValue('min-height');host.insertBefore(placeholder,card);card.style.setProperty('display','none','important');dashMove={card:card,grip:grip,host:host,grid:grid,scroller:scroller,ghost:ghost,placeholder:placeholder,pointerId:event.pointerId,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,originalKeys:originalKeys,originalIndex:originalIndex,originalDisplay:originalDisplay,originalGridMinHeight:originalGridMinHeight,x:event.clientX,y:event.clientY,validDrop:true,candidates:[],intent:null,intentSerial:0,pointerFrame:0,scrollFrame:0};measureDashCandidates(dashMove);grip.setAttribute('aria-grabbed','true');document.documentElement.classList.add('pm7-dash-moving');grip.addEventListener('lostpointercapture',onLost);try{grip.setPointerCapture(event.pointerId);}catch(error){}window.addEventListener('pointermove',moveGhost,{capture:true,passive:false});window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onCancel,true);window.addEventListener('blur',onBlur,true);document.addEventListener('keydown',onKey,true);},true);

    function finishKeyboard(handle,card,commit,restoreFocus){var move=handle._pm7DashKeyboardMove;if(!move)return;handle._pm7DashKeyboardMove=null;if(handle._pm7DashKeyboardBlur)handle.removeEventListener('blur',handle._pm7DashKeyboardBlur);if(handle._pm7DashKeyboardDocument)document.removeEventListener('keydown',handle._pm7DashKeyboardDocument,true);if(handle._pm7DashKeyboardTimer)clearTimeout(handle._pm7DashKeyboardTimer);handle._pm7DashKeyboardBlur=null;handle._pm7DashKeyboardDocument=null;handle._pm7DashKeyboardTimer=null;if(!commit)restoreDashHostOrder(move.host,move.originalKeys);handle.setAttribute('aria-grabbed','false');card.classList.remove('is-keyboard-picked');var after=dashHostOrder(move.host),changed=commit&&!dashOrdersEqual(move.originalKeys,after);dashKeyboardMove=null;if(changed){var transaction=dispatchDashCommand('cmd.widget.move',card,null,null,{source_action:'keyboard_move',order:allDashOrder()},persistDashIfChanged);if(!transaction.accepted){restoreDashHostOrder(move.host,move.originalKeys);changed=false;}}settleDashCardAnimation(card);if(restoreFocus)handle.focus({preventScroll:true});}
    function keyboardMove(event,card,handle){var key=event.key;if(!handle._pm7DashKeyboardMove){if(key!=='Enter'&&key!==' ')return;if(dashKeyboardMove)return;event.preventDefault();var host=dashHostFor(card);if(!host)return;handle._pm7DashKeyboardMove={host:host,originalKeys:dashHostOrder(host)};dashKeyboardMove=handle;handle._pm7DashKeyboardDocument=function(sessionEvent){if(!handle._pm7DashKeyboardMove)return;sessionEvent.stopImmediatePropagation();keyboardMove(sessionEvent,card,handle);};handle._pm7DashKeyboardBlur=function(){if(handle._pm7DashKeyboardTimer)clearTimeout(handle._pm7DashKeyboardTimer);handle._pm7DashKeyboardTimer=setTimeout(function(){if(handle._pm7DashKeyboardMove&&document.activeElement!==handle)finishKeyboard(handle,card,false,false);},0);};handle.addEventListener('blur',handle._pm7DashKeyboardBlur);document.addEventListener('keydown',handle._pm7DashKeyboardDocument,true);handle.setAttribute('aria-grabbed','true');card.classList.add('is-keyboard-picked');return;}if(key==='Escape'){event.preventDefault();finishKeyboard(handle,card,false,true);return;}if(key==='Enter'||key===' '){event.preventDefault();finishKeyboard(handle,card,true,true);return;}if(!/Arrow(Left|Right|Up|Down)/.test(key))return;event.preventDefault();var host=handle._pm7DashKeyboardMove.host,origin=card.getBoundingClientRect(),ox=origin.left+origin.width/2,oy=origin.top+origin.height/2,target=null,best=Infinity;dashCards(host).forEach(function(candidate){if(candidate===card)return;var rect=candidate.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,primary=key==='ArrowLeft'?ox-x:key==='ArrowRight'?x-ox:key==='ArrowUp'?oy-y:y-oy;if(primary<=4)return;var cross=key==='ArrowLeft'||key==='ArrowRight'?Math.abs(y-oy):Math.abs(x-ox),score=primary+cross*1.75;if(score<best){best=score;target=candidate;}});if(target){var before=captureDashRects(host);if(key==='ArrowLeft'||key==='ArrowUp')host.insertBefore(card,target);else host.insertBefore(card,target.nextSibling);animateDashFlip(before);}queueMicrotask(function(){if(handle._pm7DashKeyboardMove)handle.focus({preventScroll:true});});}
    document.addEventListener('keydown',function(event){var grip=event.target.closest&&event.target.closest('.pm6-dash-drag');if(!grip||dashMove||dashResize)return;var card=grip.closest('.pm6-dash-card');if(!card||!dashHostFor(card))return;keyboardMove(event,card,grip);});
  }

  function installDashboardWidgets() {
    restoreDash();
    installDashSizePopover();
    installDashResize();
    installDashMove();
    var grid = document.getElementById('pm6DashGrid');
    if (!grid) return;
    allDashCards().forEach(syncDashCard);
    window.PM7_DASH_WIDGETS = {
      storage_key:DASH_KEY,
      legacy_storage_key:LEGACY_DASH_KEY,
      get state() { return cloneDashValue(serializedDashState()); },
      get command_log() { return cloneDashValue(dashCommandLog); },
      get result_log() { return cloneDashValue(dashResultLog); },
      get receipt_log() { return cloneDashValue(dashReceiptLog); },
      inject_next_write_failure:function () { DASH_FAULTS.fail_next_write = true; },
      persist:function () { return cloneDashValue(persistDashIfChanged()); }
    };
    dashHosts().forEach(function (host) {
      new MutationObserver(function () {
        clearTimeout(dashMutationTimer);
        dashMutationTimer = setTimeout(function () {
          allDashCards().forEach(syncDashCard);
          if (!dashResize && !dashMove && !dashKeyboardMove) persistDashIfChanged();
        },50);
      }).observe(host,{childList:true,subtree:false});
    });
  }

  /* ----------------------- Global status bar ------------------------ */
  function statusToast(message) {
    if (typeof window.toast === 'function') { window.toast(message); return; }
    if (window.PM_DEMO && typeof window.PM_DEMO.toast === 'function') window.PM_DEMO.toast(message);
  }
  function installStatusBar() {
    var shell = document.querySelector('.app-shell');
    if (!shell) return;
    var bar = document.getElementById('pm7GlobalStatusBar');
    if (!bar) {
      bar = document.createElement('footer');
      bar.id = 'pm7GlobalStatusBar';
      bar.className = 'pm7-statusbar';
      bar.setAttribute('aria-label','Workspace status');
      bar.innerHTML =
        '<div class="pm7-statusbar-group">' +
          '<button type="button" class="pm7-statusitem" data-status-action="system" title="Open system status"><span class="pm7-status-dot"></span><strong>Ready</strong></button>' +
          '<span class="pm7-statusitem" title="Project root"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 5.5h5l1.6 1.8h8.4v8.2h-15z"/></svg>~/Puppet-Master</span>' +
        '</div>' +
        '<div class="pm7-statusbar-group">' +
          '<button type="button" class="pm7-statusitem" data-status-action="source" title="Source control"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="4.5" r="2"/><circle cx="5" cy="15.5" r="2"/><circle cx="15" cy="10" r="2"/><path d="M5 6.5v7M7 6c4.5 0 3 4 6 4"/></svg>main</button>' +
          '<span class="pm7-statusitem" data-status-priority="medium">Up to date · <strong>7048acf</strong></span>' +
        '</div>' +
        '<span class="pm7-statusbar-grow"></span>' +
        '<div class="pm7-statusbar-group">' +
          '<span class="pm7-statusitem" data-status-priority="low">Plan index <strong>current</strong></span>' +
          '<span class="pm7-statusitem" data-status-priority="low">Execution host <strong>local</strong> · 2ms</span>' +
          '<button type="button" class="pm7-statusitem" data-status-action="snapshot" data-status-priority="medium">Snapshot <strong>10m ago</strong></button>' +
          '<span class="pm7-statusitem" data-status-page><strong>Home</strong></span>' +
        '</div>';
      shell.appendChild(bar);
    } else if (bar.parentNode !== shell) shell.appendChild(bar);
    function updatePage() {
      var page = document.querySelector('.page.active'), tab = page && document.querySelector('[data-page="' + page.id.replace(/^panel-/,'') + '"]');
      var name = tab ? tab.textContent.trim() : (page ? page.id.replace(/^panel-/,'') : 'Home');
      var output = bar.querySelector('[data-status-page] strong'); if (output) output.textContent = name;
    }
    updatePage();
    document.addEventListener('click', function (event) {
      var action = event.target.closest && event.target.closest('[data-status-action]');
      if (action) statusToast(action.getAttribute('data-status-action') === 'snapshot' ? 'Snapshot details · last safe point 10 minutes ago' : action.getAttribute('data-status-action') === 'source' ? 'Source control · main · clean' : 'System status · all core services ready');
      if (event.target.closest && event.target.closest('[data-page]')) setTimeout(updatePage, 0);
    });
    document.addEventListener('page.changed', updatePage);
    if (window.PM_DEMO && window.PM_DEMO.on) { try { window.PM_DEMO.on('page.changed', updatePage); } catch (error) {} }
  }

  function boot() {
    installChatOwnership();
    installHomeDensity();
    installHomeMoveHUD();
    installDashboardWidgets();
    installStatusBar();
    window.PM7_SHELL_ADJUSTMENTS = {
      seatChat: seatChatForPage,
      syncHomeSurface: syncHomeSurface,
      syncDashCard: syncDashCard,
      applyDashSize: applyDashSize,
      installStatusBar: installStatusBar
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
