/* ============================================================================
   Kimi K3 — provider/account/model route controller (window.K3Route).

   Final cumulative packet, file 01: the route picker replaces the legacy
   Model selector peer. One route = provider + account (connection) + model;
   the same model under two accounts is two distinct routes.

   Surface:
   - K3Route.button(ctx)              selector-row peer (testid k3w-kit-model)
   - K3Route.openPicker(ctx, anchor)  popover panel: search, provider icon
     rail, Favorites / Recents / Provider→Account groups, capability glyphs,
     dimmed unavailable rows with reason, persistent effort/speed step stack,
     explicit active account/connection footer, Provider Settings deep link.
   - K3Route.select(ctx, routeKey, {effort, speed})
     Material-consequence gate: provider/account boundary, smaller context,
     attachment incompatibility, tool/MCP change, price/privacy change, or
     paid continuation append a routeWarningCard transcript record instead of
     a blind switch; the pending route is held until a choice resolves.
   - K3Route.resolveWarning(ctx, tid, cardId, choice)
     continue / branch (K3ThreadOps.branchFrom, lazy) / new / cancel.
   - K3Route.reevaluateAttachments(ctx, tid)
     Re-checks retained draft attachments against the active route; appends
     an 'attachment-reevaluate' routeWarningCard when any turn incompatible.

   Store: routeFavorites / routeRecents (MRU cap 8) / routeDefaults /
   threadLocal.<tid>.route|effort|speed / settingsReturn.
   Events emitted on 'data': route-changed, route-warning, settings-deeplink.
   Deterministic: runtime card ids are fixed strings from a module counter.
   ========================================================================== */
(function () {
  'use strict';

  var RECENTS_CAP = 8;
  var EFFORTS = ['High', 'Medium', 'Low'];
  var SPEEDS = ['Normal', 'Fast'];

  // cardId -> {tid, routeKey, effort, speed} held while a warning card is open
  var pending = {};
  var cardSeq = 0;

  // --- tiny DOM helpers -------------------------------------------------------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function activeTid(ctx) { return ctx.store.get('activeThreadId', null); }

  function routeLabel(route) {
    if (!route) return 'No route';
    return route.providerName + ' · ' + route.accountLabel + ' · ' + route.modelLabel;
  }
  function connectionLine(route) {
    if (!route) return 'No route configured';
    return route.providerName + ' · ' + route.accountLabel + ' · ' + (route.connectionLabel || 'connection');
  }
  function fmtCtx(n) {
    if (!n) return '';
    return n >= 1000000 ? (n / 1000000) + 'M' : Math.round(n / 1000) + 'k';
  }

  // Setup-state lines (packet 01 + 05). Status lines only — never auto-install.
  function statusLine(route) {
    if (!route || route.status === 'ok') return null;
    if (route.unavailableReason) return route.unavailableReason;
    var lines = {
      'cli-not-found': 'CLI not found — install the provider CLI to use this route',
      'sign-in-required': 'Sign-in required — open Provider Settings to continue',
      'api-key-required': 'API key required — open Provider Settings to connect',
      'usage-unavailable': 'Usage information is unavailable for this account',
      'model-unavailable': 'Model unavailable on this account',
      'unavailable': 'Unavailable on this account',
      'update-required': 'Update required — open Provider Settings to update',
      'update-available': 'Update available — scheduled when idle'
    };
    return lines[route.status] || ('Status: ' + route.status);
  }

  function openProviderSettings(ctx, tid, routeKey) {
    ctx.store.set('settingsReturn', { threadId: tid, routeKey: routeKey || null });
    ctx.emit('data', { type: 'settings-deeplink', threadId: tid, routeKey: routeKey || null });
  }

  // Fixture rule (packet demo): OpenAI accounts clamp requested High to
  // Effective Medium — shown as requested/effective, never silently swapped.
  function effectiveEffort(route, requested) {
    if (requested === 'High' && route && route.providerId === 'openai') return 'Medium';
    return requested;
  }

  function pushRecent(store, routeKey) {
    var rec = (store.get('routeRecents', []) || []).filter(function (k) { return k !== routeKey; });
    rec.unshift(routeKey);
    store.set('routeRecents', rec.slice(0, RECENTS_CAP));
  }
  function isFavorite(store, routeKey) {
    return (store.get('routeFavorites', []) || []).indexOf(routeKey) >= 0;
  }
  function toggleFavorite(store, routeKey) {
    var fav = (store.get('routeFavorites', []) || []).slice();
    var i = fav.indexOf(routeKey);
    if (i >= 0) fav.splice(i, 1); else fav.push(routeKey);
    store.set('routeFavorites', fav);
  }

  // --- material consequence detection (packet 01: warn only on material) ------
  function detectConsequences(from, to, draftAttachments) {
    var out = [];
    if (!from || !to) return out;
    var fc = from.capabilities || {}, tc = to.capabilities || {};
    if (from.providerId !== to.providerId || from.accountId !== to.accountId) {
      out.push({ kind: 'cache', text: 'Prompt cache restarts; earlier context is re-sent to ' + to.providerName + '.' });
      out.push({ kind: 'privacy', text: 'Hosting, terms, and data location change with the provider/account.' });
      out.push({ kind: 'tools', text: 'Tool and MCP availability can differ across providers.' });
    }
    if (fc.context && tc.context && tc.context < fc.context) {
      out.push({ kind: 'context', text: 'Context window shrinks from ' + fmtCtx(fc.context) + ' to ' + fmtCtx(tc.context) + ' tokens.' });
    }
    if (from.priceTier !== to.priceTier) {
      out.push(from.priceTier === 'plan' && to.priceTier === 'metered'
        ? { kind: 'cost', text: 'Continuation bills metered usage instead of the plan allowance.' }
        : { kind: 'cost', text: 'Usage bills to a different plan or account.' });
    }
    if (fc.video && !tc.video) {
      out.push({ kind: 'attachment', text: 'Video attachments are not readable on the new model.' });
    }
    // Retained draft attachments turn incompatible on the target route: hold
    // the switch behind the warning card instead of blind-applying.
    (draftAttachments || []).forEach(function (a) {
      var kind = attachmentKind(a);
      var name = typeof a === 'string' ? a : (a && a.name) || String(a);
      if (kind === 'video' && !tc.video) {
        out.push({ kind: 'attachment', text: name + ' — the new model cannot read video.' });
      } else if (kind === 'image' && !tc.vision) {
        out.push({ kind: 'attachment', text: name + ' — the new model cannot read images.' });
      }
    });
    return out;
  }

  function applyRoute(ctx, tid, routeKey, opts) {
    opts = opts || {};
    ctx.data.setThreadLocal(tid, {
      route: routeKey,
      effort: opts.effort != null ? opts.effort : null,
      speed: opts.speed != null ? opts.speed : null
    });
    pushRecent(ctx.store, routeKey);
    ctx.emit('data', { type: 'route-changed', threadId: tid, routeKey: routeKey });
    K3Route.reevaluateAttachments(ctx, tid);
  }

  function findCardRecord(ctx, tid, cardId) {
    var msgs = ctx.data.messages(tid) || [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      var c = msgs[i] && msgs[i].routeWarningCard;
      if (c && c.id === cardId) return msgs[i];
    }
    return null;
  }

  // --- attachment reevaluation -------------------------------------------------
  function attachmentKind(a) {
    var name = typeof a === 'string' ? a : (a && (a.kind || a.name)) || '';
    name = String(name).toLowerCase();
    if (/\.(mov|mp4|webm|mkv)$/.test(name) || name === 'video') return 'video';
    if (/\.(png|jpe?g|gif|webp|svg)$/.test(name) || name === 'image') return 'image';
    return 'other';
  }

  // --- capability glyphs (max 4 tiny marks, never a badge wall) ----------------
  // Spec set: vision / effort / fast glyphs + context token = at most 4 marks.
  function capsNode(route) {
    var wrap = el('span', 'k3r-caps');
    var caps = route.capabilities || {};
    var marks = [];
    if (caps.vision) marks.push(['lens', caps.video ? 'Vision + video' : 'Vision']);
    if (caps.effort) marks.push(['spark', 'Reasoning effort']);
    if (caps.fast) marks.push(['actions', 'Fast mode']);
    marks.slice(0, 3).forEach(function (m) {
      var s = el('span', 'k3r-cap');
      s.appendChild(icon(m[0]));
      s.title = m[1];
      wrap.appendChild(s);
    });
    if (caps.context) wrap.appendChild(el('span', 'k3r-cap-ctx', fmtCtx(caps.context)));
    return wrap;
  }

  // --- picker ------------------------------------------------------------------
  function openPicker(ctx, anchor) {
    var store = ctx.store;
    var providerFilter = 'all';
    var query = '';
    var pop = null;

    var panel = el('div', 'k3r-panel');
    var searchWrap = el('div', 'k3r-search');
    var input = el('input', 'k3r-search-input');
    input.type = 'text';
    input.setAttribute('spellcheck', 'false');
    input.placeholder = 'Search routes';
    input.setAttribute('aria-label', 'Search routes');
    searchWrap.appendChild(input);
    var body = el('div', 'k3r-body');
    var rail = el('div', 'k3r-rail');
    var main = el('div', 'k3r-main k3-scroll');
    body.appendChild(rail);
    body.appendChild(main);
    var footer = el('div', 'k3r-footer');
    panel.appendChild(searchWrap);
    panel.appendChild(body);
    panel.appendChild(footer);

    function tid() { return activeTid(ctx); }
    function currentEff() { var t = tid(); return t ? ctx.data.effective(t) : null; }

    function matches(route) {
      if (providerFilter !== 'all' && route.providerId !== providerFilter) return false;
      if (!query) return true;
      var hay = (route.providerName + ' ' + route.accountLabel + ' ' + route.modelLabel + ' ' + route.key).toLowerCase();
      return hay.indexOf(query) >= 0;
    }

    function allRoutes() {
      var out = [];
      (ctx.data.providerCatalog() || []).forEach(function (p) {
        (p.accounts || []).forEach(function (a) {
          (p.models || []).forEach(function (m) {
            var r = ctx.data.routeByKey(p.id + '/' + a.id + '/' + m.id);
            if (r) out.push(r);
          });
        });
      });
      return out;
    }

    function renderRail() {
      rail.textContent = '';
      var all = el('button', 'k3r-rail-btn k3r-rail-all' + (providerFilter === 'all' ? ' is-selected' : ''), 'All');
      all.type = 'button';
      all.addEventListener('click', function () { providerFilter = 'all'; renderRail(); renderList(); });
      rail.appendChild(all);
      (ctx.data.providerCatalog() || []).forEach(function (p) {
        var b = el('button', 'k3r-rail-btn' + (providerFilter === p.id ? ' is-selected' : ''));
        b.type = 'button';
        b.title = p.name || p.id;
        b.setAttribute('aria-label', p.name || p.id);
        b.appendChild(icon(p.icon || ('provider-' + p.id)));
        b.addEventListener('click', function () { providerFilter = p.id; renderRail(); renderList(); });
        rail.appendChild(b);
      });
    }

    function rowFor(route) {
      var eff = currentEff();
      var isActive = eff && eff.routeKey === route.key;
      var dim = route.status !== 'ok';
      var row = el('button', 'k3r-row' + (dim ? ' is-dim' : '') + (isActive ? ' is-active' : ''));
      row.type = 'button';
      row.setAttribute('data-testid', 'k3r-row');
      var star = el('span', 'k3r-star' + (isFavorite(store, route.key) ? ' is-fav' : ''));
      star.appendChild(icon(isFavorite(store, route.key) ? 'star-filled' : 'star'));
      star.title = 'Favorite';
      star.setAttribute('role', 'button');
      star.setAttribute('aria-label', 'Toggle favorite');
      star.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavorite(store, route.key);
        renderList();
      });
      var main2 = el('span', 'k3r-row-main');
      main2.appendChild(el('span', 'k3r-row-label', route.modelLabel));
      var line = statusLine(route);
      if (line) main2.appendChild(el('span', 'k3r-row-reason', line));
      else main2.appendChild(el('span', 'k3r-row-sub', route.accountLabel + ' · ' + (route.connectionLabel || '')));
      row.appendChild(star);
      row.appendChild(main2);
      row.appendChild(capsNode(route));
      row.addEventListener('click', function () { renderDetail(route); });
      return row;
    }

    function section(list, label, routes) {
      var visible = routes.filter(matches);
      if (!visible.length) return;
      list.appendChild(el('div', 'k3r-section', label));
      visible.forEach(function (r) { list.appendChild(rowFor(r)); });
    }

    function renderList() {
      main.textContent = '';
      var routes = allRoutes();
      var favKeys = store.get('routeFavorites', []) || [];
      var recKeys = store.get('routeRecents', []) || [];
      var byKey = {};
      routes.forEach(function (r) { byKey[r.key] = r; });
      section(main, 'Favorites', favKeys.map(function (k) { return byKey[k]; }).filter(Boolean));
      section(main, 'Recents', recKeys.map(function (k) { return byKey[k]; }).filter(Boolean));
      (ctx.data.providerCatalog() || []).forEach(function (p) {
        if (providerFilter !== 'all' && p.id !== providerFilter) return;
        (p.accounts || []).forEach(function (a) {
          var group = [];
          (p.models || []).forEach(function (m) {
            var r = byKey[p.id + '/' + a.id + '/' + m.id];
            if (r) group.push(r);
          });
          var conn = a.connection || {};
          section(main, (p.name || p.id) + ' · ' + (a.label || a.id) + (conn.label ? ' · ' + conn.label : ''), group);
        });
      });
      if (!main.children.length) main.appendChild(el('div', 'k3r-empty', 'No routes match.'));
      if (pop) window.K3UI.springResize(pop.el);
    }

    // Persistent step stack inside the same popover: model -> effort -> speed
    // -> Apply. Esc closes via the popup contract; Back returns to the list.
    function renderDetail(route) {
      main.textContent = '';
      var eff = currentEff();
      var isCurrent = eff && eff.routeKey === route.key;
      var caps = route.capabilities || {};
      var sel = {
        effort: caps.effort ? (isCurrent && eff.effort ? eff.effort : 'Medium') : null,
        speed: caps.fast ? (isCurrent && eff.speed ? eff.speed : 'Normal') : null
      };

      var head = el('div', 'k3r-detail-head');
      var back = el('button', 'k3r-back');
      back.type = 'button';
      back.setAttribute('aria-label', 'Back to routes');
      back.appendChild(icon('chevron-left'));
      back.addEventListener('click', renderList);
      var headIcon = el('span', 'k3r-detail-ic');
      headIcon.appendChild(icon(route.providerIcon));
      head.appendChild(back);
      head.appendChild(headIcon);
      head.appendChild(el('span', 'k3r-detail-title', routeLabel(route)));
      main.appendChild(head);

      if (route.status !== 'ok') {
        var box = el('div', 'k3r-setup');
        box.appendChild(el('div', 'k3r-setup-line', statusLine(route)));
        if (route.connectionKind === 'claude-cli') {
          box.appendChild(el('div', 'k3r-setup-note', 'Sign in with the Claude CLI — PM does not handle this login'));
        }
        if (route.status === 'update-available') {
          box.appendChild(el('div', 'k3r-setup-note', 'Updates install only when idle or after current work — never silently.'));
        }
        var openBtn = el('button', 'k3r-apply', 'Open Provider Settings');
        openBtn.type = 'button';
        openBtn.addEventListener('click', function () {
          openProviderSettings(ctx, tid(), route.key);
          if (pop) pop.close();
        });
        box.appendChild(openBtn);
        main.appendChild(box);
        if (pop) window.K3UI.springResize(pop.el);
        return;
      }

      if (caps.effort) {
        var effBox = el('div', 'k3r-step');
        effBox.appendChild(el('div', 'k3r-step-label', 'Reasoning effort'));
        var effRow = el('div', 'k3r-options');
        EFFORTS.forEach(function (e) {
          var o = el('button', 'k3r-option' + (sel.effort === e ? ' is-selected' : ''), e);
          o.type = 'button';
          o.setAttribute('role', 'radio');
          o.setAttribute('aria-checked', sel.effort === e ? 'true' : 'false');
          o.addEventListener('click', function () {
            sel.effort = e;
            effRow.querySelectorAll('.k3r-option').forEach(function (n) {
              n.classList.toggle('is-selected', n.textContent === e);
              n.setAttribute('aria-checked', n.textContent === e ? 'true' : 'false');
            });
            renderReqLine();
          });
          effRow.appendChild(o);
        });
        effBox.appendChild(effRow);
        main.appendChild(effBox);
      } else {
        main.appendChild(el('div', 'k3r-explainer', 'Reasoning effort: not exposed by this account'));
      }

      if (caps.fast) {
        var spdBox = el('div', 'k3r-step');
        spdBox.appendChild(el('div', 'k3r-step-label', 'Speed'));
        var spdRow = el('div', 'k3r-options');
        SPEEDS.forEach(function (s) {
          var o = el('button', 'k3r-option' + (sel.speed === s ? ' is-selected' : ''), s);
          o.type = 'button';
          o.setAttribute('role', 'radio');
          o.setAttribute('aria-checked', sel.speed === s ? 'true' : 'false');
          o.addEventListener('click', function () {
            sel.speed = s;
            spdRow.querySelectorAll('.k3r-option').forEach(function (n) {
              n.classList.toggle('is-selected', n.textContent === s);
              n.setAttribute('aria-checked', n.textContent === s ? 'true' : 'false');
            });
          });
          spdRow.appendChild(o);
        });
        spdBox.appendChild(spdRow);
        main.appendChild(spdBox);
      }

      var reqLine = el('div', 'k3r-reqline');
      main.appendChild(reqLine);
      function renderReqLine() {
        var effective = effectiveEffort(route, sel.effort);
        reqLine.textContent = (sel.effort && effective !== sel.effort)
          ? 'Requested ' + sel.effort + ' · Effective ' + effective + ' — account policy'
          : '';
        reqLine.style.display = reqLine.textContent ? '' : 'none';
      }
      renderReqLine();

      var apply = el('button', 'k3r-apply', 'Apply');
      apply.type = 'button';
      apply.setAttribute('data-testid', 'k3r-apply');
      apply.addEventListener('click', function () {
        K3Route.select(ctx, route.key, { effort: sel.effort, speed: sel.speed });
        if (pop) pop.close();
      });
      main.appendChild(apply);
      if (pop) window.K3UI.springResize(pop.el);
    }

    function renderFooter() {
      footer.textContent = '';
      var eff = currentEff();
      var route = eff && eff.route;
      footer.appendChild(el('div', 'k3r-active-line',
        route ? connectionLine(route) : 'No route configured'));

      var actions = el('div', 'k3r-footer-actions');

      var settings = el('button', 'k3r-footer-btn', 'Provider Settings…');
      settings.type = 'button';
      settings.addEventListener('click', function () {
        openProviderSettings(ctx, tid(), eff && eff.routeKey);
        if (pop) pop.close();
      });
      actions.appendChild(settings);

      var setDefault = el('button', 'k3r-footer-btn' + (route ? '' : ' is-disabled'), 'Set as project default');
      setDefault.type = 'button';
      setDefault.disabled = !route;
      setDefault.title = 'Affects future threads only';
      setDefault.addEventListener('click', function () {
        if (!route) return;
        store.set('routeDefaults', {
          providerId: route.providerId,
          accountId: route.accountId,
          connectionId: route.connectionKind || null,
          modelId: route.modelId,
          effort: eff.effort != null ? eff.effort : null,
          speed: eff.speed != null ? eff.speed : null
        });
        if (pop) pop.close();
      });
      actions.appendChild(setDefault);

      var count = (ctx.data.listThreads() || []).length;
      var bulk = el('button', 'k3r-footer-btn' + (route ? '' : ' is-disabled'), 'Apply to all ' + count + ' threads…');
      bulk.type = 'button';
      bulk.disabled = !route;
      bulk.addEventListener('click', function () {
        if (!route) return;
        if (pop) pop.close();
        window.K3UI.confirm({
          title: 'Apply route to all threads',
          body: 'Apply ' + routeLabel(route) + ' to all ' + count + ' threads in this project?',
          confirmLabel: 'Apply',
          cancelLabel: 'Cancel'
        }).then(function (ok) {
          if (!ok) return;
          store.set('routeDefaults', {
            providerId: route.providerId,
            accountId: route.accountId,
            connectionId: route.connectionKind || null,
            modelId: route.modelId,
            effort: eff.effort != null ? eff.effort : null,
            speed: eff.speed != null ? eff.speed : null
          });
          ctx.data.applyDefaultsToThreads((ctx.data.listThreads() || []).map(function (t) { return t.id; }));
          ctx.emit('data', { type: 'route-changed', threadId: null, bulk: true });
        });
      });
      actions.appendChild(bulk);

      footer.appendChild(actions);
    }

    input.addEventListener('input', function () {
      query = input.value.trim().toLowerCase();
      renderList();
    });

    renderRail();
    renderList();
    renderFooter();
    pop = window.K3UI.popover(anchor, panel, { className: 'k3r-pop' });
    setTimeout(function () { input.focus(); }, window.K3UI.reduced() ? 0 : 60);
    return pop;
  }

  // --- public API ---------------------------------------------------------------
  var K3Route = {
    button: function (ctx) {
      var b = el('button', 'k3w-kit-sel k3r-route');
      b.type = 'button';
      b.setAttribute('aria-label', 'Model route');
      b.setAttribute('data-testid', 'k3w-kit-model');
      var ic = el('span', 'k3w-kit-sel-ic');
      ic.appendChild(icon('model'));
      var label = el('span', 'k3w-kit-sel-label');
      var chip = el('span', 'k3r-scope', 'This thread');
      chip.style.display = 'none';
      var chev = el('span', 'k3w-kit-sel-chev');
      chev.appendChild(icon('chevron-down'));
      b.appendChild(ic);
      b.appendChild(label);
      b.appendChild(chip);
      b.appendChild(chev);

      function refresh() {
        var t = activeTid(ctx);
        var eff = t ? ctx.data.effective(t) : null;
        var route = eff && eff.route;
        label.textContent = route ? route.modelShort : (ctx.store.get('selectors.model', null) || 'Model');
        ic.textContent = '';
        ic.appendChild(icon(route ? route.providerIcon : 'model'));
        chip.style.display = eff && eff.overrides && eff.overrides.route ? '' : 'none';
        b.title = route
          ? routeLabel(route) + (eff && eff.effort ? ' · ' + eff.effort : '')
          : 'Model route';
      }
      var unsubs = [
        ctx.store.subscribe('threadLocal', refresh),
        ctx.store.subscribe('routeDefaults', refresh),
        ctx.store.subscribe('selectors', refresh),
        ctx.store.subscribe('activeThreadId', refresh)
      ];
      refresh();
      b.addEventListener('click', function () { openPicker(ctx, b); });
      b.unmount = function () { unsubs.forEach(function (u) { if (u) u(); }); };
      return b;
    },

    openPicker: openPicker,

    select: function (ctx, routeKey, opts) {
      var t = activeTid(ctx);
      if (!t) return false;
      var to = ctx.data.routeByKey(routeKey);
      if (!to) return false;
      if (to.status !== 'ok') {
        openProviderSettings(ctx, t, routeKey);
        return false;
      }
      var eff = ctx.data.effective(t);
      var from = eff.route;
      var draft = typeof ctx.data.getDraft === 'function' ? ctx.data.getDraft(t) : null;
      var consequences = detectConsequences(from, to, draft && draft.attachments);
      if (!consequences.length) {
        applyRoute(ctx, t, routeKey, opts);
        return true;
      }
      cardSeq += 1;
      var cardId = 'rw-' + t + '-' + cardSeq;
      var pendingRoute = {
        routeKey: routeKey,
        effort: opts && opts.effort != null ? opts.effort : null,
        speed: opts && opts.speed != null ? opts.speed : null
      };
      pending[cardId] = { tid: t, routeKey: pendingRoute.routeKey, effort: pendingRoute.effort, speed: pendingRoute.speed };
      ctx.data.appendRecord(t, {
        routeWarningCard: {
          id: cardId,
          kind: 'route-switch',
          headline: 'Switch to ' + to.modelShort + '?',
          primary: consequences[0].text,
          fromLabel: from ? routeLabel(from) : 'No route',
          toLabel: routeLabel(to),
          consequences: consequences,
          choices: ['continue', 'branch', 'new', 'cancel'],
          status: 'open',
          pendingRoute: pendingRoute
        }
      });
      ctx.emit('data', { type: 'route-warning', threadId: t, cardId: cardId, routeKey: routeKey });
      return true;
    },

    resolveWarning: function (ctx, tid, cardId, choice) {
      var rec = findCardRecord(ctx, tid, cardId);
      if (!rec) return false;
      var card = rec.routeWarningCard;
      if (card.status !== 'open') return false;
      // Recover the held route from module memory OR the card payload (module
      // state dies with a reload; the transcript record survives). Fail
      // closed: a route-switch card with no recoverable route can only be
      // cancelled — never silently marked resolved without applying.
      var p = pending[cardId] || card.pendingRoute || null;

      if (choice === 'cancel') {
        card.status = 'cancelled';
      } else if (!p || !p.routeKey) {
        return false;
      } else if (choice === 'continue') {
        if (p) applyRoute(ctx, tid, p.routeKey, { effort: p.effort, speed: p.speed });
        card.status = 'resolved-continue';
      } else if (choice === 'branch') {
        var branch = null;
        if (window.K3ThreadOps && typeof window.K3ThreadOps.branchFrom === 'function') {
          branch = window.K3ThreadOps.branchFrom(tid, rec.id, {});
        } else if (typeof ctx.data.branchThread === 'function') {
          branch = ctx.data.branchThread(tid, rec.id);
        }
        if (branch && branch.id) {
          if (p) applyRoute(ctx, branch.id, p.routeKey, { effort: p.effort, speed: p.speed });
          ctx.store.set('activeThreadId', branch.id);
        }
        card.status = 'resolved-branch';
      } else if (choice === 'new') {
        var to = p ? ctx.data.routeByKey(p.routeKey) : null;
        var nt = ctx.data.createThread(to ? ('New chat — ' + to.modelShort) : 'New chat');
        if (nt && nt.id) {
          if (p) applyRoute(ctx, nt.id, p.routeKey, { effort: p.effort, speed: p.speed });
          ctx.store.set('activeThreadId', nt.id);
        }
        card.status = 'resolved-new';
      } else {
        return false;
      }
      delete pending[cardId];
      ctx.data.touchThread(tid);
      ctx.emit('data', { type: 'route-warning', threadId: tid, cardId: cardId, choice: choice, status: card.status });
      return true;
    },

    reevaluateAttachments: function (ctx, tid) {
      var eff = ctx.data.effective(tid);
      var route = eff.route;
      if (!route) return [];
      var draft = typeof ctx.data.getDraft === 'function' ? ctx.data.getDraft(tid) : null;
      var atts = draft && draft.attachments ? draft.attachments : [];
      var caps = route.capabilities || {};
      var bad = [];
      atts.forEach(function (a) {
        var kind = attachmentKind(a);
        var name = typeof a === 'string' ? a : (a && a.name) || String(a);
        if (kind === 'video' && !caps.video) bad.push({ name: name, reason: 'The new model cannot read video.' });
        else if (kind === 'image' && !caps.vision) bad.push({ name: name, reason: 'The new model cannot read images.' });
      });
      ctx.emit('data', {
        type: 'route-warning', threadId: tid, kind: 'attachment-reevaluate',
        routeKey: eff.routeKey, incompatible: bad.map(function (b) { return b.name; })
      });
      if (!bad.length) return bad;
      cardSeq += 1;
      var cardId = 'rw-' + tid + '-' + cardSeq;
      pending[cardId] = { tid: tid, routeKey: eff.routeKey, effort: eff.effort, speed: eff.speed };
      ctx.data.appendRecord(tid, {
        routeWarningCard: {
          id: cardId,
          kind: 'attachment-reevaluate',
          headline: 'Re-check retained attachments?',
          primary: bad[0].name + ': ' + bad[0].reason,
          fromLabel: routeLabel(route),
          toLabel: routeLabel(route),
          consequences: bad.map(function (b) { return { kind: 'attachment', text: b.name + ' — ' + b.reason }; }),
          choices: ['continue', 'branch', 'new', 'cancel'],
          status: 'open',
          pendingRoute: { routeKey: eff.routeKey, effort: eff.effort, speed: eff.speed }
        }
      });
      return bad;
    }
  };

  window.K3Route = K3Route;
})();
