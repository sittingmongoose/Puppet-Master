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
        o._fav = !!favSet[o.value] || !!o.favorite;
      });
      list.sort(function (a, b) {
        if (a._fav === b._fav) return 0;
        return a._fav ? -1 : 1;
      });
    }
    return list;
  }

  function modelRowHtml(opt, selectedValue) {
    var selected = String(opt.value) === String(selectedValue == null ? '' : selectedValue);
    var disabled = !!opt.disabledReason;
    var isFav = !!opt._fav;
    var meta = [];
    if (opt.provider) meta.push(opt.provider);
    if (opt.account) meta.push(opt.account === 'work' ? 'Work account' : 'Personal account');
    if (opt.disabledReason) meta.push(opt.disabledReason);
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
    var item =
      '<button type="button" role="menuitem" class="pm6-tb-menu-item' +
      (selected ? ' is-selected' : '') +
      (isFav ? ' is-favorite' : '') +
      (disabled ? ' is-disabled' : '') +
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
        String(opt.label + ' ' + (opt.provider || '') + ' ' + (opt.account || '')).toLowerCase()
      ) +
      '">' +
      '<span class="pm-menu-item-main">' +
      escapeHtml(opt.label) +
      '</span>' +
      (meta.length
        ? '<span class="pm-menu-item-meta">' + escapeHtml(meta.join(' · ')) + '</span>'
        : '') +
      recover +
      '</button>';
    return (
      '<div class="pm-menu-model-row' +
      (selected ? ' is-selected' : '') +
      (isFav ? ' is-favorite' : '') +
      '" data-model-row="' +
      escapeHtml(opt.value) +
      '" data-account="' +
      escapeHtml(opt.account || '') +
      '">' +
      item +
      '<button type="button" class="pm-fav-toggle' +
      (isFav ? ' is-on' : '') +
      '" data-fav-toggle="' +
      escapeHtml(opt.value) +
      '" aria-pressed="' +
      (isFav ? 'true' : 'false') +
      '" title="' +
      (isFav ? 'Remove favorite' : 'Add favorite') +
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
            return modelRowHtml(o, selectedValue);
          }).join('') +
          '</div>';
      }
      if (work.length) {
        html +=
          '<div class="pm-menu-section" data-menu-section="work">' +
          '<div class="pm-menu-section-label">Work</div>' +
          work.map(function (o) {
            return modelRowHtml(o, selectedValue);
          }).join('') +
          '</div>';
      }
      if (personal.length) {
        html +=
          '<div class="pm-menu-section" data-menu-section="personal">' +
          '<div class="pm-menu-section-label">Personal</div>' +
          personal.map(function (o) {
            return modelRowHtml(o, selectedValue);
          }).join('') +
          '</div>';
      }
      return html;
    }
    return optionsFor(kind, session)
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
    var searchable = !!opts.searchable || kind === 'model';
    var nestEffort = !!opts.nestEffort && kind === 'model';
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
                escapeHtml(p.label) +
                '</button>'
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
      '<span class="pm6-tb-menu-label">' +
      escapeHtml(findLabel(kind, selectedValue, session)) +
      '</span>' +
      (kind === 'model' && session.accountId
        ? '<span class="pm-model-account-chip" data-account-chip>' +
          escapeHtml(session.accountId === 'personal' ? 'Personal' : session.accountId === 'work' ? 'Work' : String(session.accountId)) +
          '</span>'
        : '') +
      '</button>' +
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
            ? 'Open Usage · deep-link stub (settings.usage)'
            : 'Fix in Settings · deep-link stub (settings.agent-config)';
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
        onChange(ev.detail && ev.detail.value, kind, el);
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
    var frag = document.createDocumentFragment();
    var nodes = Object.create(null);

    kinds.forEach(function (kind) {
      var sessionKey = SESSION_KEYS[kind];
      var current = sessionKey ? session[sessionKey] : null;
      if (kind === 'worktree' && current == null) current = '';
      var buildOpts =
        kind === 'model'
          ? { nestEffort: true, effortValue: session.effortId, speedValue: session.speedMode || 'normal', searchable: true }
          : kind === 'persona'
            ? { searchable: true }
            : {};
      var node = buildSelector(
        kind,
        current,
        function (value, pickedKind) {
          var pk = pickedKind || kind;
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
    wireMenuFilter: wireMenuFilter
  };
})();
