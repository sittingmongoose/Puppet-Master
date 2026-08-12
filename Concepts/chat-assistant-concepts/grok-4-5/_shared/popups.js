/* Selector sprout helpers — Persona / Model / Mode / Effort / Worktree. */
(function () {
  'use strict';

  var OPTIONS = {
    persona: [
      { value: 'interface-engineer', label: 'Interface' },
      { value: 'product-manager', label: 'Product Manager' },
      { value: 'engineer', label: 'Engineer' },
      { value: 'researcher', label: 'Researcher' }
    ],
    model: [
      {
        value: 'grok-4-5',
        label: 'Grok 4.5',
        provider: 'xAI',
        providerId: 'xai',
        account: 'work',
        accountId: 'work',
        favorite: true
      },
      {
        value: 'grok',
        label: 'Grok',
        provider: 'xAI',
        providerId: 'xai',
        account: 'personal',
        accountId: 'personal',
        favorite: true
      },
      {
        value: 'claude-sonnet',
        label: 'Claude Sonnet',
        provider: 'Anthropic',
        providerId: 'anthropic',
        account: 'work',
        accountId: 'work',
        favorite: false
      },
      {
        value: 'gpt',
        label: 'GPT',
        provider: 'OpenAI',
        providerId: 'openai',
        account: 'work',
        accountId: 'work',
        favorite: false
      },
      {
        value: 'gemini',
        label: 'Gemini',
        provider: 'Google',
        providerId: 'google',
        account: 'personal',
        accountId: 'personal',
        favorite: false,
        disabledReason: 'Quota paused',
        recoverTarget: 'usage'
      }
    ],
    provider: [
      { value: 'xai', label: 'xAI' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'google', label: 'Google' }
    ],
    crew: [
      { value: '', label: 'No Crew' },
      { value: 'review-wave', label: 'Review wave (requested)' },
      { value: 'research-pair', label: 'Research pair' },
      { value: 'synth-only', label: 'Synthesis only' }
    ],
    mode: [
      { value: 'agent', label: 'Agent' },
      { value: 'plan', label: 'Plan' },
      { value: 'ask', label: 'Ask' },
      { value: 'debug', label: 'Debug' },
      { value: 'review', label: 'Review' }
    ],
    access: [
      { value: 'ask', label: 'Ask for approval' },
      { value: 'auto-edits', label: 'Auto accept edits' },
      { value: 'auto', label: 'Auto' },
      { value: 'full', label: 'Full Access' }
    ],
    effort: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'extra-high', label: 'Extra High' }
    ],
    speed: [
      { value: 'normal', label: 'Normal' },
      { value: 'fast', label: 'Fast' }
    ],
    worktree: [
      { value: 'main', label: 'main' },
      { value: 'feature/chat', label: 'feature/chat' },
      { value: '', label: '(unbind)' }
    ]
  };

  var SESSION_KEYS = {
    persona: 'personaId',
    model: 'modelId',
    mode: 'modeId',
    access: 'accessProfile',
    effort: 'effortId',
    speed: 'speedMode',
    worktree: 'worktreeId',
    provider: 'providerId',
    crew: 'crewId'
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function optionsFor(kind, session) {
    var list = (OPTIONS[kind] || []).slice();
    if (kind === 'model') {
      var favs =
        (session && Array.isArray(session.favoritesModelIds) && session.favoritesModelIds) ||
        list.filter(function (o) {
          return o.favorite;
        }).map(function (o) {
          return o.value;
        });
      var favSet = Object.create(null);
      favs.forEach(function (id) {
        favSet[id] = true;
      });
      list.forEach(function (o) {
        o._fav = Boolean(favSet[o.value]) || Boolean(o.favorite);
      });
      list.sort(function (a, b) {
        if (a._fav === b._fav) return 0;
        return a._fav ? -1 : 1;
      });
    }
    return list;
  }

  function providerIconHtml(providerId) {
    var id = String(providerId || '').toLowerCase();
    var mark =
      id === 'xai' || id === 'x'
        ? 'X'
        : id === 'anthropic'
          ? 'A'
          : id === 'openai'
            ? 'O'
            : id === 'google'
              ? 'G'
              : (id.charAt(0) || '?').toUpperCase();
    return (
      '<span class="pm-provider-ico" data-provider-ico="' +
      escapeHtml(id || 'unknown') +
      '" aria-hidden="true">' +
      escapeHtml(mark) +
      '</span>'
    );
  }

  function accountConnectionMeta(opt, session) {
    var account =
      opt.account === 'work'
        ? 'Work account'
        : opt.account === 'personal'
          ? 'Personal account'
          : opt.account
            ? String(opt.account)
            : '';
    /* Prefer option connection so Personal rows do not inherit session cli:work. */
    var conn =
      opt.connectionId ||
      (opt.account === 'personal' ? 'cli:personal' : opt.account === 'work' ? 'cli:work' : '') ||
      (session && session.connectionId) ||
      '';
    var parts = [];
    if (account) parts.push(account);
    if (conn) parts.push(String(conn));
    return parts.join(' · ');
  }

  function modelRowHtml(opt, selectedValue, session) {
    session = session || {};
    var selected = String(opt.value) === String(selectedValue == null ? '' : selectedValue);
    var disabled = Boolean(opt.disabledReason);
    var isFav = Boolean(opt._fav);
    var effectiveId = session.effectiveModelId != null ? String(session.effectiveModelId) : '';
    var isEffective = effectiveId && String(opt.value) === effectiveId;
    var isRequested = selected;
    var meta = [];
    var acctConn = accountConnectionMeta(opt, session);
    if (acctConn) meta.push(acctConn);
    if (opt.disabledReason) meta.push(opt.disabledReason);
    if (effectiveId && (isRequested || isEffective) && String(selectedValue) !== effectiveId) {
      if (isRequested) meta.push('Requested');
      if (isEffective) meta.push('Effective');
    }
    var recover =
      disabled && opt.recoverTarget
        ? '<button type="button" class="pm-model-recover" data-model-recover="' +
          escapeHtml(opt.recoverTarget) +
          '" data-model-id="' +
          escapeHtml(opt.value) +
          '">' +
          (opt.recoverTarget === 'usage' ? 'Open Usage' : 'Fix in Settings') +
          '</button>'
        : '';
    var routeBadges = '';
    if (effectiveId && String(selectedValue) !== effectiveId) {
      if (isRequested) {
        routeBadges += '<span class="pm-model-route-badge" data-route="requested">Requested</span>';
      }
      if (isEffective) {
        routeBadges += '<span class="pm-model-route-badge" data-route="effective">Effective</span>';
      }
    }
    var item =
      '<button type="button" role="menuitem" class="pm6-tb-menu-item' +
      (selected ? ' is-selected' : '') +
      (isFav ? ' is-favorite' : '') +
      (disabled ? ' is-disabled' : '') +
      (isEffective ? ' is-effective' : '') +
      '" data-value="' +
      escapeHtml(opt.value) +
      '" data-label="' +
      escapeHtml(opt.label) +
      '" data-provider-id="' +
      escapeHtml(opt.providerId || '') +
      '" data-account-id="' +
      escapeHtml(opt.accountId || opt.account || '') +
      '"' +
      (disabled ? ' aria-disabled="true" data-disabled-reason="' + escapeHtml(opt.disabledReason) + '"' : '') +
      (isFav ? ' data-favorite="1"' : '') +
      ' data-filter-text="' +
      escapeHtml(
        String(
          opt.label +
            ' ' +
            (opt.provider || '') +
            ' ' +
            (opt.account || '') +
            ' ' +
            acctConn
        ).toLowerCase()
      ) +
      '">' +
      '<span class="pm-menu-item-rail">' +
      providerIconHtml(opt.providerId || opt.provider) +
      '</span>' +
      '<span class="pm-menu-item-copy">' +
      '<span class="pm-menu-item-main">' +
      escapeHtml(opt.label) +
      routeBadges +
      '</span>' +
      (meta.length
        ? '<span class="pm-menu-item-meta">' + escapeHtml(meta.join(' · ')) + '</span>'
        : '') +
      '</span></button>';
    return (
      '<div class="pm-menu-model-row' +
      (selected ? ' is-selected' : '') +
      (isFav ? ' is-favorite' : '') +
      (isEffective ? ' is-effective' : '') +
      '" role="group" data-model-row="' +
      escapeHtml(opt.value) +
      '" data-account="' +
      escapeHtml(opt.account || '') +
      '" data-provider-id="' +
      escapeHtml(opt.providerId || '') +
      '">' +
      item +
      recover +
      '<button type="button" class="pm-fav-toggle' +
      (isFav ? ' is-on' : '') +
      '" data-fav-toggle="' +
      escapeHtml(opt.value) +
      '" aria-pressed="' +
      (isFav ? 'true' : 'false') +
      '" title="' +
      (isFav ? 'Favorite for this Chat session · remove' : 'Favorite for this Chat session') +
      '" aria-label="' +
      (isFav ? 'Favorite for this Chat session · remove' : 'Favorite for this Chat session') +
      '">' +
      (isFav ? 'Fav' : 'Add') +
      '</button></div>'
    );
  }

  function itemsHtml(kind, selectedValue, session) {
    if (kind === 'model') {
      var list = optionsFor('model', session);
      var favs = list.filter(function (o) {
        return o._fav;
      });
      var rest = list.filter(function (o) {
        return !o._fav;
      });
      var work = rest.filter(function (o) {
        return o.account === 'work';
      });
      var personal = rest.filter(function (o) {
        return o.account === 'personal';
      });
      var html = '';
      if (favs.length) {
        html +=
          '<div class="pm-menu-section" data-menu-section="favorites">' +
          '<div class="pm-menu-section-label">Favorites</div>' +
          favs.map(function (o) {
            return modelRowHtml(o, selectedValue, session);
          }).join('') +
          '</div>';
      }
      if (work.length) {
        html +=
          '<div class="pm-menu-section" data-menu-section="work">' +
          '<div class="pm-menu-section-label">Work</div>' +
          work.map(function (o) {
            return modelRowHtml(o, selectedValue, session);
          }).join('') +
          '</div>';
      }
      if (personal.length) {
        html +=
          '<div class="pm-menu-section" data-menu-section="personal">' +
          '<div class="pm-menu-section-label">Personal</div>' +
          personal.map(function (o) {
            return modelRowHtml(o, selectedValue, session);
          }).join('') +
          '</div>';
      }
      return html;
    }
    var rows = optionsFor(kind, session)
      .map(function (opt) {
        var selected = String(opt.value) === String(selectedValue == null ? '' : selectedValue);
        return (
          '<button type="button" role="menuitem" class="pm6-tb-menu-item' +
          (selected ? ' is-selected' : '') +
          '" data-value="' +
          escapeHtml(opt.value) +
          '" data-label="' +
          escapeHtml(opt.label) +
          '" data-filter-text="' +
          escapeHtml(String(opt.label).toLowerCase()) +
          '">' +
          '<span class="pm-menu-item-main">' +
          escapeHtml(opt.label) +
          '</span></button>'
        );
      })
      .join('');
    if (kind === 'persona') {
      var bulkPersonaLabel = findLabel('persona', selectedValue, session) || 'Researcher';
      var bulkMenuLabel = 'Apply to all threads in this PlanningRun';
      var bulkFilter =
        (bulkMenuLabel + ' ' + bulkPersonaLabel + ' apply all threads planningrun').toLowerCase();
      rows +=
        '<div class="pm-menu-section" data-menu-section="persona-bulk" role="group" aria-label="PlanningRun persona">' +
        '<div class="pm-menu-section-label">PlanningRun</div>' +
        '<button type="button" role="menuitem" class="pm6-tb-menu-item pm-persona-bulk"' +
        ' data-value="__bulk_apply__"' +
        ' data-persona-bulk="1"' +
        ' data-persona-value="' +
        escapeHtml(selectedValue == null ? '' : selectedValue) +
        '" data-label="' +
        escapeHtml(bulkMenuLabel) +
        '" data-filter-text="' +
        escapeHtml(bulkFilter) +
        '" title="' +
        escapeHtml('Apply ' + bulkPersonaLabel + ' to all threads in this PlanningRun?') +
        '">' +
        '<span class="pm-menu-item-main">' +
        escapeHtml(bulkMenuLabel) +
        '</span></button></div>';
    }
    return rows;
  }

  function humanizeId(value) {
    var s = String(value == null ? '' : value);
    if (!s) return '(unbind)';
    if (s === 'grok-4-5') return 'Grok 4.5';
    if (s === 'interface-engineer') return 'Interface';
    return s
      .split(/[-_]+/)
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function findModelOption(value) {
    var opts = OPTIONS.model || [];
    for (var i = 0; i < opts.length; i++) {
      if (String(opts[i].value) === String(value == null ? '' : value)) return opts[i];
    }
    return null;
  }

  function bindModelRoute(store, modelId) {
    if (!store || !store.session) return;
    var opt = findModelOption(modelId);
    if (!opt) return;
    store.session.providerId = opt.providerId || null;
    store.session.accountId = opt.accountId || opt.account || null;
    store.session.connectionId =
      opt.connectionId ||
      (opt.account === 'personal' ? 'cli:personal' : opt.account === 'work' ? 'cli:work' : null) ||
      store.session.connectionId ||
      null;
    if (!opt.disabledReason && store.session.providerSetupRequired) {
      store.session.providerSetupRequired = null;
      if (store.session.composerState === 'provider-setup-required') {
        store.session.composerState = 'ordinary';
        store.session.composerStateReason = '';
      }
      if (
        store.session.sendDisabledReason &&
        String(store.session.sendDisabledReason).indexOf('Provider setup') >= 0
      ) {
        store.session.sendDisabledReason = '';
      }
    }
    if (typeof store._emit === 'function') store._emit();
  }

  function findLabel(kind, value, session) {
    if (kind === 'model') {
      var opt = findModelOption(value);
      if (opt) {
        var acct = opt.account === 'personal' ? 'Personal' : opt.account === 'work' ? 'Work' : '';
        return acct ? opt.label + ' · ' + acct : opt.label;
      }
    }
    var opts = OPTIONS[kind] || [];
    for (var i = 0; i < opts.length; i++) {
      if (String(opts[i].value) === String(value == null ? '' : value)) return opts[i].label;
    }
    return value == null || value === '' ? '(unbind)' : humanizeId(value);
  }

  function buildMenuHtml(kind, selectedValue, opts) {
    opts = opts || {};
    var session = opts.session || {};
    var searchable = Boolean(opts.searchable) || kind === 'model';
    var nestEffort = Boolean(opts.nestEffort) && kind === 'model';
    var effortValue = opts.effortValue;
    var currentProv = '';
    if (kind === 'model') {
      var cur = optionsFor('model', session).filter(function (o) {
        return String(o.value) === String(selectedValue);
      })[0];
      currentProv = cur && cur.provider ? String(cur.provider).toLowerCase().replace(/\s+/g, '') : '';
      if (currentProv === 'xai') currentProv = 'xai';
      if (currentProv.indexOf('anthropic') >= 0) currentProv = 'anthropic';
      if (currentProv.indexOf('openai') >= 0) currentProv = 'openai';
      if (currentProv.indexOf('google') >= 0) currentProv = 'google';
    }
    var providerRail =
      kind === 'model'
        ? '<div class="pm-provider-rail" data-provider-rail role="group" aria-label="Providers">' +
          optionsFor('provider')
            .map(function (p) {
              var active = currentProv && p.value === currentProv;
              return (
                '<button type="button" class="pm-provider-chip' +
                (active ? ' is-active' : '') +
                '" data-provider-filter="' +
                escapeHtml(p.value) +
                '" title="' +
                escapeHtml(p.label) +
                '">' +
                providerIconHtml(p.value) +
                '<span class="pm-provider-chip-label">' +
                escapeHtml(p.label) +
                '</span></button>'
              );
            })
            .join('') +
          '<button type="button" class="pm-provider-chip' +
          (!currentProv ? ' is-active' : '') +
          '" data-provider-filter="" title="All providers">All</button>' +
          '</div>'
        : '';
    var head = searchable
      ? '<div class="pm-menu-search-row" data-menu-search-row>' +
        '<input type="search" class="pm-menu-search" data-menu-search placeholder="Filter models, accounts…" aria-label="Filter ' +
        escapeHtml(kind) +
        '" />' +
        '</div>'
      : '';
    var effortBlock = nestEffort
      ? '<div class="pm-menu-nested" data-effort-nest>' +
        '<div class="pm-menu-nested-label">Effort</div>' +
        itemsHtml('effort', effortValue, session) +
        '<div class="pm-menu-nested-label">Speed</div>' +
        itemsHtml('speed', opts.speedValue || 'normal', session) +
        '</div>'
      : '';
    return (
      '<div class="pm6-tb-menu-wrap pm-chat-selector" data-selector="' +
      escapeHtml(kind) +
      '" data-value="' +
      escapeHtml(selectedValue == null ? '' : selectedValue) +
      '"' +
      (nestEffort ? ' data-nests-effort="1"' : '') +
      '>' +
      '<button type="button" class="pm6-tb-menu-trigger" aria-haspopup="menu" aria-expanded="false">' +
      '<span class="pm-menu-trigger-stack">' +
      '<span class="pm6-tb-menu-label">' +
      escapeHtml(findLabel(kind, selectedValue, session)) +
      '</span>' +
      (kind === 'model' && session.accountId
        ? '<span class="pm-model-account-chip" data-account-chip>' +
          escapeHtml(
            session.accountId === 'personal'
              ? 'Personal'
              : session.accountId === 'work'
                ? 'Work'
                : String(session.accountId)
          ) +
          (session.connectionId ? ' · ' + escapeHtml(String(session.connectionId)) : '') +
          '</span>'
        : '') +
      (kind === 'access' && session.accessLimitedBy
        ? '<span class="pm-access-limit" data-access-limit>' +
          escapeHtml(findLabel('access', selectedValue, session)) +
          ' · Limited by ' +
          escapeHtml(String(session.accessLimitedBy)) +
          '</span>'
        : '') +
      '</span></button>' +
      '<div class="pm6-tb-menu" role="menu" data-pm-menu-select' +
      (searchable ? ' data-pm-menu-filter' : '') +
      '>' +
      providerRail +
      head +
      '<div class="pm-menu-items" data-menu-items>' +
      itemsHtml(kind, selectedValue, session) +
      '</div>' +
      effortBlock +
      '</div>' +
      '</div>'
    );
  }

  function wireMenuFilter(wrap) {
    if (!wrap || wrap._pmFilterWired) return;
    var menu = wrap.querySelector('.pm6-tb-menu');
    var input = menu && menu.querySelector('[data-menu-search]');
    if (!menu) return;
    wrap._pmFilterWired = true;
    function applyFilter() {
      var q = input
        ? String(input.value || '')
            .trim()
            .toLowerCase()
        : '';
      var prov =
        (menu.querySelector('.pm-provider-chip.is-active') &&
          menu.querySelector('.pm-provider-chip.is-active').getAttribute('data-provider-filter')) ||
        '';
      var items = menu.querySelectorAll('[data-menu-items] [role="menuitem"]');
      Array.prototype.forEach.call(items, function (it) {
        var hay = it.getAttribute('data-filter-text') || (it.textContent || '').toLowerCase();
        var okQ = !q || hay.indexOf(q) !== -1;
        var okP = !prov || hay.indexOf(prov) !== -1;
        var hide = !(okQ && okP);
        it.hidden = hide;
        var row = it.closest('[data-model-row]');
        if (row) row.hidden = hide;
      });
      Array.prototype.forEach.call(menu.querySelectorAll('[data-menu-section]'), function (sec) {
        var any = sec.querySelector('[data-model-row]:not([hidden])');
        sec.hidden = !any;
      });
    }
    if (input) {
      input.addEventListener('input', applyFilter);
      input.addEventListener('click', function (ev) {
        ev.stopPropagation();
      });
      input.addEventListener('keydown', function (ev) {
        ev.stopPropagation();
      });
    }
    var rail = menu.querySelector('[data-provider-rail]');
    if (rail) {
      rail.addEventListener('click', function (ev) {
        var chip = ev.target.closest('[data-provider-filter]');
        if (!chip) return;
        ev.preventDefault();
        ev.stopPropagation();
        Array.prototype.forEach.call(rail.querySelectorAll('.pm-provider-chip'), function (c) {
          c.classList.toggle('is-active', c === chip);
        });
        applyFilter();
      });
    }
    menu.addEventListener('click', function (ev) {
      var recover = ev.target.closest('[data-model-recover]');
      if (recover) {
        ev.preventDefault();
        ev.stopPropagation();
        var target = recover.getAttribute('data-model-recover') || 'settings';
        var msg =
          target === 'usage'
            ? 'Usage / quota · owned by Settings · deep-link not wired in this concept'
            : 'Provider & account managers · owned by Settings · deep-link not wired in this concept';
        if (window.PMChatMotion && typeof window.PMChatMotion.toast === 'function') {
          window.PMChatMotion.toast(msg, 2400);
        } else if (window.PMChatHost && typeof window.PMChatHost.toast === 'function') {
          window.PMChatHost.toast(msg);
        }
        return;
      }
      var fav = ev.target.closest('[data-fav-toggle]');
      if (!fav) return;
      ev.preventDefault();
      ev.stopPropagation();
      var id = fav.getAttribute('data-fav-toggle');
      var store =
        (window.PMChatHost && typeof window.PMChatHost.getStore === 'function' && window.PMChatHost.getStore()) ||
        null;
      var session = (store && store.session) || {};
      if (!Array.isArray(session.favoritesModelIds)) {
        session.favoritesModelIds = optionsFor('model')
          .filter(function (o) {
            return o.favorite;
          })
          .map(function (o) {
            return o.value;
          });
      }
      var ix = session.favoritesModelIds.indexOf(id);
      if (ix >= 0) session.favoritesModelIds.splice(ix, 1);
      else session.favoritesModelIds.push(id);
      if (store && store.session) store.session.favoritesModelIds = session.favoritesModelIds;
      if (store && store._emit) store._emit();
      /* Rebuild + re-sort open menu in place */
      var items = menu.querySelector('[data-menu-items]');
      var selected = wrap.getAttribute('data-value');
      if (items) {
        items.innerHTML = itemsHtml('model', selected, session);
        applyFilter();
      }
    });
  }

  function buildSelector(kind, selectedValue, onChange, opts) {
    var wrap = document.createElement('div');
    wrap.innerHTML = buildMenuHtml(kind, selectedValue, opts);
    var el = wrap.firstElementChild;
    if (window.PMMenu && typeof window.PMMenu.upgradeWrap === 'function') {
      window.PMMenu.upgradeWrap(el);
    }
    wireMenuFilter(el);
    if (typeof onChange === 'function') {
      el.addEventListener('pm-menu-change', function (ev) {
        var changeVal = ev.detail && ev.detail.value;
        /* Bulk persona is confirmed on pick only — skip change to avoid double prompts. */
        if (String(changeVal) === '__bulk_apply__') return;
        onChange(changeVal, kind, el);
      });
      el.addEventListener('pm-menu-pick', function (ev) {
        var item = ev.detail && ev.detail.item;
        var val = ev.detail && ev.detail.value;
        if (item && item.getAttribute && item.getAttribute('aria-disabled') === 'true') {
          return;
        }
        /* Nested effort picks emit from the same menu; route by nest. */
        if (item && item.closest && item.closest('[data-effort-nest]')) {
          var isSpeed = val === 'normal' || val === 'fast';
          onChange(val, isSpeed ? 'speed' : 'effort', el);
          return;
        }
        if (item && item.getAttribute && item.getAttribute('data-persona-bulk') === '1') {
          onChange('__bulk_apply__', kind, el);
          return;
        }
        onChange(val, kind, el);
      });
    }
    return el;
  }

  function mountSelectors(hostEl, opts) {
    opts = opts || {};
    var store = opts.store;
    var kinds = opts.kinds || ['persona', 'model', 'mode', 'access', 'crew', 'worktree'];
    var session = (store && store.session) || {};
    if (store && typeof store.getActiveLocal === 'function') {
      var local = store.getActiveLocal();
      if (local) {
        session = Object.assign({}, session, {
          providerId: local.providerId != null ? local.providerId : session.providerId,
          accountId: local.accountId != null ? local.accountId : session.accountId,
          connectionId: local.connectionId != null ? local.connectionId : session.connectionId,
          modelId: local.modelId != null ? local.modelId : session.modelId,
          personaId: local.personaId != null ? local.personaId : session.personaId,
          effortId: local.effortId != null ? local.effortId : session.effortId,
          speedMode: local.speedMode != null ? local.speedMode : session.speedMode,
          modeId: local.modeId != null ? local.modeId : session.modeId,
          accessProfile: local.accessProfile != null ? local.accessProfile : session.accessProfile,
          crewId: local.crewId != null ? local.crewId : session.crewId,
          worktreeId: local.worktreeId !== undefined ? local.worktreeId : session.worktreeId,
          bsd: local.bsd || session.bsd
        });
      }
    }
    var frag = document.createDocumentFragment();
    var nodes = Object.create(null);

    kinds.forEach(function (kind) {
      var sessionKey = SESSION_KEYS[kind];
      var current = sessionKey ? session[sessionKey] : null;
      if (kind === 'worktree' && current == null) current = '';
      var buildOpts =
        kind === 'model'
          ? {
              nestEffort: true,
              effortValue: session.effortId,
              speedValue: session.speedMode || 'normal',
              searchable: true,
              session: session
            }
          : kind === 'persona'
            ? { searchable: true, session: session }
            : { session: session };
      var node = buildSelector(
        kind,
        current,
        function (value, pickedKind, selectorEl) {
          var pk = pickedKind || kind;
          if (pk === 'persona' && String(value) === '__bulk_apply__') {
            var localNow =
              store && typeof store.getActiveLocal === 'function' ? store.getActiveLocal() : null;
            var personaValue =
              (localNow && localNow.personaId) ||
              session.personaId ||
              'researcher';
            var personaLabel = findLabel('persona', personaValue, session) || 'Researcher';
            var confirmed = false;
            if (window.PMChatV2 && typeof window.PMChatV2.confirmBulkPersonaApply === 'function') {
              confirmed = Boolean(window.PMChatV2.confirmBulkPersonaApply(personaLabel));
            } else if (
              window.PMChatThreadKit &&
              typeof window.PMChatThreadKit.confirmBulkPersonaApply === 'function'
            ) {
              confirmed = Boolean(window.PMChatThreadKit.confirmBulkPersonaApply(personaLabel));
            } else if (typeof window.confirm === 'function') {
              confirmed = Boolean(
                window.confirm('Apply ' + personaLabel + ' to all threads in this PlanningRun?')
              );
            }
            if (!confirmed) {
              if (selectorEl) {
                selectorEl.setAttribute('data-value', String(personaValue == null ? '' : personaValue));
                var restoreLabel = selectorEl.querySelector('.pm6-tb-menu-label');
                if (restoreLabel) restoreLabel.textContent = personaLabel;
                selectorEl.querySelectorAll('[data-menu-items] [role="menuitem"]').forEach(function (it) {
                  it.classList.toggle(
                    'is-selected',
                    String(it.getAttribute('data-value')) === String(personaValue == null ? '' : personaValue)
                  );
                });
              }
              return;
            }
            if (store && store.threads && typeof store.setThreadLocal === 'function') {
              Object.keys(store.threads).forEach(function (id) {
                store.setThreadLocal(id, { personaId: personaValue });
              });
            }
            if (selectorEl) {
              selectorEl.setAttribute('data-value', String(personaValue == null ? '' : personaValue));
              var okLabel = selectorEl.querySelector('.pm6-tb-menu-label');
              if (okLabel) okLabel.textContent = personaLabel;
            }
            if (typeof opts.onChange === 'function') {
              opts.onChange({ key: 'persona', value: personaValue, bulk: true });
            }
            return;
          }
          var sk = SESSION_KEYS[pk];
          if (store && sk && typeof store.setSelector === 'function') {
            var next = pk === 'worktree' && value === '' ? null : value;
            store.setSelector(sk, next);
          }
          if (pk === 'model') {
            bindModelRoute(store, value);
            if (store && store.session) {
              if (!store.session.defaultModelId) store.session.defaultModelId = 'grok-4-5';
              if (value && value !== store.session.defaultModelId) {
                store.session.threadModelOverride = value;
              } else {
                store.session.threadModelOverride = null;
              }
              if (store._emit) store._emit();
            }
          }
          if (typeof opts.onChange === 'function') {
            opts.onChange({ key: pk, value: value });
          }
        },
        buildOpts
      );
      nodes[kind] = node;
      frag.appendChild(node);
    });

    if (hostEl) {
      hostEl.appendChild(frag);
      if (window.PMMenu && typeof window.PMMenu.init === 'function') {
        window.PMMenu.init(hostEl);
      }
      hostEl.querySelectorAll('.pm-chat-selector').forEach(wireMenuFilter);
    }

    return nodes;
  }

  /** Compact click-to-open sprout for a single selector kind. */
  function attachSprout(triggerEl, kind, selectedValue, onPick) {
    if (!triggerEl) return null;
    var menu = document.createElement('div');
    menu.className = 'pm6-tb-menu pm-chat-sprout-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('data-pm-menu-select', '');
    menu.innerHTML =
      '<div class="pm-menu-items" data-menu-items>' +
      itemsHtml(kind, selectedValue) +
      '</div>';

    var wrap = document.createElement('div');
    wrap.className = 'pm6-tb-menu-wrap pm-chat-selector is-compact';
    wrap.setAttribute('data-selector', kind);
    wrap.setAttribute('data-value', selectedValue == null ? '' : String(selectedValue));

    if (!triggerEl.classList.contains('pm6-tb-menu-trigger')) {
      triggerEl.classList.add('pm6-tb-menu-trigger');
    }
    triggerEl.setAttribute('aria-haspopup', 'menu');
    triggerEl.setAttribute('aria-expanded', 'false');

    var parent = triggerEl.parentNode;
    if (parent) {
      parent.insertBefore(wrap, triggerEl);
      wrap.appendChild(triggerEl);
      wrap.appendChild(menu);
    } else {
      wrap.appendChild(triggerEl);
      wrap.appendChild(menu);
    }

    if (window.PMMenu && typeof window.PMMenu.upgradeWrap === 'function') {
      window.PMMenu.upgradeWrap(wrap);
    }

    wrap.addEventListener('pm-menu-pick', function (ev) {
      var val = ev.detail && ev.detail.value;
      wrap.setAttribute('data-value', val == null ? '' : String(val));
      if (typeof onPick === 'function') onPick(val, kind);
    });

    return wrap;
  }


  var BSD_MODE_OPTIONS = [
    { value: 'off', label: 'Off' },
    { value: 'auto', label: 'Auto — system default' },
    { value: 'on', label: 'On' }
  ];
  var BSD_SCOPE_OPTIONS = [
    { value: 'turn', label: 'This turn' },
    { value: 'thread', label: 'This thread' }
  ];

  function bsdLabels() {
    return (window.PMChatLabels && window.PMChatLabels.BSD) || {
      title: 'Back Seat Driver',
      short: 'BSD',
      footer: 'BSD can only advise — it cannot run tools or widen access',
      modes: { off: 'Off', auto: 'Auto — system default', on: 'On' },
      scopes: { turn: 'This turn', thread: 'This thread' }
    };
  }

  function readBsdState(store, threadId) {
    var tid = threadId || (store && store.session && store.session.activeThreadKey) || null;
    var local =
      store && typeof store.getActiveLocal === 'function'
        ? store.getActiveLocal()
        : store && typeof store.getThreadLocal === 'function' && tid
          ? store.getThreadLocal(tid)
          : null;
    var bsd = (local && local.bsd) || { mode: 'auto', scope: 'thread', visual: 'auto-idle', adviceId: null };
    return {
      threadId: tid,
      mode: bsd.mode === 'off' || bsd.mode === 'on' ? bsd.mode : 'auto',
      scope: bsd.scope === 'turn' ? 'turn' : 'thread',
      visual: bsd.visual != null ? String(bsd.visual) : 'auto-idle',
      adviceId: bsd.adviceId != null ? bsd.adviceId : null
    };
  }

  function bsdVisualClass(st) {
    if (st.mode === 'off' || st.visual === 'off') return 'is-off';
    if (st.mode === 'on' || st.visual === 'on') return 'is-on';
    if (st.visual === 'auto-active') return 'is-auto-active';
    return 'is-auto-idle';
  }

  function bsdModeWord(st) {
    var L = bsdLabels();
    if (st.mode === 'off') return L.modes.off;
    if (st.mode === 'on') return L.modes.on;
    return st.visual === 'auto-active' ? 'Evaluating' : 'Auto';
  }

  function bsdIconHtml() {
    if (typeof window.PMIcon === 'function') {
      var raw = window.PMIcon('bsd', 'pm-bsd-glyph');
      if (raw) return raw;
    }
    return '<span class="pm-bsd-glyph-text" aria-hidden="true">BSD</span>';
  }

  function applyBsdChrome(root, st) {
    if (!root) return;
    root.setAttribute('data-bsd-mode', st.mode);
    root.setAttribute('data-bsd-scope', st.scope);
    root.setAttribute('data-bsd-visual', st.visual);
    root.classList.remove('is-off', 'is-auto-idle', 'is-auto-active', 'is-on');
    root.classList.add(bsdVisualClass(st));
    var L = bsdLabels();
    var title =
      L.title +
      ' — ' +
      bsdModeWord(st) +
      ' · ' +
      (st.scope === 'turn' ? L.scopes.turn : L.scopes.thread);
    root.title = title;
    root.setAttribute('aria-label', title);
    var label = root.querySelector('[data-bsd-label]');
    if (label) label.textContent = L.short + ' · ' + bsdModeWord(st);
    var lamp = root.querySelector('[data-bsd-lamp]');
    if (lamp) lamp.setAttribute('data-state', bsdVisualClass(st).replace(/^is-/, ''));
  }

  function renderBsdPanel(panel, store, st) {
    var L = bsdLabels();
    var modeName = 'pm-bsd-mode-' + Math.random().toString(36).slice(2, 8);
    var scopeName = 'pm-bsd-scope-' + Math.random().toString(36).slice(2, 8);
    var modeRows = BSD_MODE_OPTIONS.map(function (opt) {
      var checked = st.mode === opt.value;
      return (
        '<label class="pm-bsd-radio' +
        (checked ? ' is-checked' : '') +
        '"><input type="radio" name="' +
        modeName +
        '" value="' +
        escapeHtml(opt.value) +
        '"' +
        (checked ? ' checked' : '') +
        ' data-bsd-mode-pick /><span>' +
        escapeHtml((L.modes && L.modes[opt.value]) || opt.label) +
        '</span></label>'
      );
    }).join('');
    var scopeRows = BSD_SCOPE_OPTIONS.map(function (opt) {
      var checked = st.scope === opt.value;
      return (
        '<label class="pm-bsd-radio' +
        (checked ? ' is-checked' : '') +
        '"><input type="radio" name="' +
        scopeName +
        '" value="' +
        escapeHtml(opt.value) +
        '"' +
        (checked ? ' checked' : '') +
        ' data-bsd-scope-pick /><span>' +
        escapeHtml((L.scopes && L.scopes[opt.value]) || opt.label) +
        '</span></label>'
      );
    }).join('');
    panel.innerHTML =
      '<div class="pm-bsd-panel-title">' +
      escapeHtml(L.title) +
      '</div>' +
      '<div class="pm-bsd-radio-group" role="radiogroup" aria-label="BSD mode">' +
      modeRows +
      '</div>' +
      '<div class="pm-bsd-radio-group" role="radiogroup" aria-label="BSD scope">' +
      scopeRows +
      '</div>' +
      (st.scope === 'turn'
        ? '<div class="pm-bsd-scope-note">Reverts to the project default after this turn.</div>'
        : '') +
      '<div class="pm-bsd-foot">' +
      escapeHtml(L.footer) +
      '</div>';
  }

  function syncBsdVisualForMode(store, threadId, mode) {
    if (!store || typeof store.setBsdVisual !== 'function' || !threadId) return;
    var visual =
      mode === 'off' ? 'off' : mode === 'on' ? 'on' : 'auto-idle';
    store.setBsdVisual(threadId, visual);
  }

  function wireBsdPanel(root, panel, store, getThreadId) {
    if (panel._pmBsdWired) return;
    panel._pmBsdWired = true;
    panel.addEventListener('change', function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var tid = getThreadId();
      if (!tid || !store) return;
      if (t.hasAttribute('data-bsd-mode-pick')) {
        var mode = t.value;
        if (typeof store.setBsd === 'function') store.setBsd(tid, { mode: mode });
        /* Explicit visual path required for Off / Auto / On chrome states. */
        syncBsdVisualForMode(store, tid, mode);
        var stMode = readBsdState(store, tid);
        applyBsdChrome(root, stMode);
        renderBsdPanel(panel, store, stMode);
        return;
      }
      if (t.hasAttribute('data-bsd-scope-pick')) {
        if (typeof store.setBsd === 'function') store.setBsd(tid, { scope: t.value });
        /* Scope-only: preserve current visual (e.g. keep auto-active). */
        var stScope = readBsdState(store, tid);
        applyBsdChrome(root, stScope);
        renderBsdPanel(panel, store, stScope);
      }
    });
  }

  /**
   * Shared BSD control. Variants map to per-window slots:
   * mono | kicker | lamp | chip | trailing | latch | rail
   */
  function buildBsdControl(store, opts) {
    opts = opts || {};
    var variant = opts.variant || 'mono';
    var st = readBsdState(store, opts.threadId);
    var L = bsdLabels();
    var root = document.createElement(opts.tagName || (variant === 'rail' ? 'div' : 'div'));
    root.className = 'pm-bsd-control pm-bsd-' + variant + ' ' + bsdVisualClass(st);
    root.setAttribute('data-bsd-control', '');
    root.setAttribute('data-bsd-variant', variant);
    root.setAttribute('data-selector', 'bsd');

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'pm-bsd-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');

    if (variant === 'mono') {
      trigger.innerHTML =
        '<span class="pm-bsd-mono-face">' +
        bsdIconHtml() +
        '</span><span class="pm-bsd-mono-mark" aria-hidden="true">B</span>';
    } else if (variant === 'kicker') {
      trigger.innerHTML =
        '<span class="pm-bsd-kicker-ico">' +
        bsdIconHtml() +
        '</span><span class="pm-bsd-kicker-text" data-bsd-label>' +
        escapeHtml(L.short + ' · ' + bsdModeWord(st)) +
        '</span>';
    } else if (variant === 'lamp') {
      trigger.innerHTML =
        '<span class="pm-bsd-lamp" data-bsd-lamp data-state="' +
        escapeHtml(bsdVisualClass(st).replace(/^is-/, '')) +
        '"><i></i></span><span class="pm-bsd-lamp-label" data-bsd-label>' +
        escapeHtml(L.short) +
        '</span>';
    } else if (variant === 'chip') {
      trigger.innerHTML =
        '<span class="pm-bsd-chip-dot" aria-hidden="true"></span><span data-bsd-label>' +
        escapeHtml(L.short + ' · ' + bsdModeWord(st)) +
        '</span>';
    } else if (variant === 'trailing') {
      trigger.innerHTML =
        bsdIconHtml() +
        '<span data-bsd-label>' +
        escapeHtml(bsdModeWord(st)) +
        '</span>';
    } else if (variant === 'latch') {
      trigger.innerHTML =
        bsdIconHtml() +
        '<span class="pm-bsd-latch-copy"><span class="pm-bsd-latch-kicker">BSD</span><span data-bsd-label>' +
        escapeHtml(bsdModeWord(st)) +
        '</span></span>';
    } else if (variant === 'rail') {
      root.className += ' w8-rail-item';
      root.setAttribute('data-rail-kind', 'bsd');
      trigger.className += ' w8-rail-bsd-btn';
      trigger.innerHTML =
        '<span class="w8-rail-ico" title="BSD">' +
        bsdIconHtml() +
        '</span><span class="w8-rail-tip" data-bsd-label>' +
        escapeHtml(L.short + ' · ' + bsdModeWord(st)) +
        '</span>';
    } else {
      trigger.innerHTML =
        bsdIconHtml() +
        '<span data-bsd-label>' +
        escapeHtml(L.short + ' · ' + bsdModeWord(st)) +
        '</span>';
    }

    var panel = document.createElement('div');
    panel.className = 'pm-bsd-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('hidden', '');
    panel.setAttribute('data-bsd-panel', '');
    renderBsdPanel(panel, store, st);

    root.appendChild(trigger);
    root.appendChild(panel);
    applyBsdChrome(root, st);

    function tid() {
      return (
        opts.threadId ||
        (store && store.session && store.session.activeThreadKey) ||
        st.threadId
      );
    }

    wireBsdPanel(root, panel, store, tid);

    trigger.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var open = panel.hasAttribute('hidden');
      if (open) {
        var fresh = readBsdState(store, tid());
        renderBsdPanel(panel, store, fresh);
        wireBsdPanel(root, panel, store, tid);
        applyBsdChrome(root, fresh);
        panel.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');
        root.classList.add('is-open');
      } else {
        panel.setAttribute('hidden', '');
        trigger.setAttribute('aria-expanded', 'false');
        root.classList.remove('is-open');
      }
    });

    root.refresh = function () {
      var next = readBsdState(store, tid());
      applyBsdChrome(root, next);
      if (!panel.hasAttribute('hidden')) {
        renderBsdPanel(panel, store, next);
        wireBsdPanel(root, panel, store, tid);
      }
    };

    if (opts.onChange && typeof store.subscribe === 'function') {
      /* optional */
    }

    return root;
  }

  function bsdSlotHtml(variant) {
    return (
      '<span class="pm-bsd-slot" data-bsd-slot="' +
      escapeHtml(variant || 'mono') +
      '"></span>'
    );
  }

  function mountBsdSlots(root, store) {
    if (!root || !root.querySelectorAll) return [];
    var nodes = [];
    root.querySelectorAll('[data-bsd-slot]').forEach(function (slot) {
      if (slot.getAttribute('data-bsd-mounted') === '1') {
        var existing = slot.querySelector('[data-bsd-control]');
        if (existing && typeof existing.refresh === 'function') existing.refresh();
        if (existing) nodes.push(existing);
        return;
      }
      var variant = slot.getAttribute('data-bsd-slot') || 'mono';
      var control = buildBsdControl(store, { variant: variant });
      slot.innerHTML = '';
      slot.appendChild(control);
      slot.setAttribute('data-bsd-mounted', '1');
      nodes.push(control);
    });
    return nodes;
  }


  window.PMChatPopups = {
    OPTIONS: OPTIONS,
    optionsFor: optionsFor,
    findLabel: findLabel,
    findModelOption: findModelOption,
    bindModelRoute: bindModelRoute,
    buildMenuHtml: buildMenuHtml,
    buildSelector: buildSelector,
    mountSelectors: mountSelectors,
    attachSprout: attachSprout,
    wireMenuFilter: wireMenuFilter,
    providerIconHtml: providerIconHtml,
    buildBsdControl: buildBsdControl,
    bsdSlotHtml: bsdSlotHtml,
    mountBsdSlots: mountBsdSlots,
    readBsdState: readBsdState
  };
})();
