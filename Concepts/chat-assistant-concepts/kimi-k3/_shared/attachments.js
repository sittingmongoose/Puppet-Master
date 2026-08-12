/* ============================================================================
   Kimi K3 — attachment resolver (window.K3Attachments).

   Every attempted attachment resolves to exactly one of:
     Native            — the active route reads it directly (e.g. image on a
                         vision model).
     PM transformed    — PM derives safe material (zip manifest, pdf text +
                         page images, transcripts + frames, sheet summaries,
                         resize/tile). Derived items keep lineage to the
                         original attachment id.
     Alternate model   — the active route lacks the kind but another catalog
                         route has it. Routing across a provider/account
                         boundary changes privacy, cost, terms, and location,
                         so a consent transcript card is REQUIRED
                         ([Cancel] [Extract in PM] [Use Gemini]).
     Unsupported       — no route can use it (model.bin): reason + Remove /
                         Switch model.

   Changing the active route reevaluates retained draft attachments
   (reevaluate) and appends an 'attachment-reevaluate' routeWarningCard when
   any of them no longer fit.

   Surfaces: chooser popover (K3UI.popover), composer chip badges + detail
   popover, transcript consent cards via K3Data.appendRecord. All transient
   DOM uses the popup family — no raw fixed divs. Reduced-motion parity rides
   the global data-motion contract (motion.css).
   ========================================================================== */
(function () {
  'use strict';

  // --- fixtures ---------------------------------------------------------------
  var FIXTURE_FILES = [
    { name: 'design.zip', kind: 'zip', size: '12.4 MB' },
    { name: 'spec.pdf', kind: 'pdf', size: '2.1 MB' },
    { name: 'demo.mov', kind: 'video', size: '48.7 MB' },
    { name: 'metrics.xlsx', kind: 'spreadsheet', size: '364 KB' },
    { name: 'photo-large.png', kind: 'image-large', size: '26.3 MB' },
    { name: 'model.bin', kind: 'binary', size: '812 MB' }
  ];

  var KIND_ICONS = {
    'zip': 'paperclip-zip',
    'pdf': 'paperclip-pdf',
    'video': 'paperclip-mov',
    'audio': 'paperclip-audio',
    'spreadsheet': 'paperclip-xlsx',
    'image': 'paperclip-png',
    'image-large': 'paperclip-png',
    'binary': 'paperclip-bin'
  };

  var KIND_WORDS = {
    'zip': 'archive', 'pdf': 'PDF', 'video': 'video', 'audio': 'audio',
    'spreadsheet': 'spreadsheet', 'image': 'image', 'image-large': 'image',
    'binary': 'binary'
  };

  var cardSeq = 0;
  var derivedSeq = 0;

  // --- small helpers ----------------------------------------------------------
  function icons() { return window.K3Icons; }
  function icon(name) {
    var reg = icons();
    if (reg && typeof reg.has === 'function' && reg.has(name)) return reg.get(name);
    return reg ? reg.get('attach') : document.createElement('span');
  }
  function kindIcon(kind) { return icon(KIND_ICONS[kind] || 'attach'); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function activeTid(ctx) { return ctx.store.get('activeThreadId', null); }
  function emitResolved(threadId, extra) {
    if (!window.K3 || typeof window.K3.emit !== 'function') return;
    window.K3.emit('data', Object.assign({ type: 'attachment-resolved', threadId: threadId }, extra || {}));
  }

  function kindForName(name) {
    var ext = String(name || '').split('.').pop().toLowerCase();
    if (ext === 'zip' || ext === 'tar' || ext === 'gz') return 'zip';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'mov' || ext === 'mp4' || ext === 'webm') return 'video';
    if (ext === 'mp3' || ext === 'wav' || ext === 'm4a') return 'audio';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'spreadsheet';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp') return 'image';
    return 'binary';
  }
  // Draft attachments may be plain strings (legacy composer) or file objects.
  function normalizeFile(a) {
    if (a && typeof a === 'object') {
      return {
        name: String(a.name || 'attachment'),
        kind: a.kind || kindForName(a.name),
        size: a.size || ''
      };
    }
    var name = String(a || 'attachment');
    return { name: name, kind: kindForName(name), size: '' };
  }

  // --- classification -----------------------------------------------------------
  // Which capability a kind needs to be read natively (null = PM-side only).
  function nativeCapability(kind) {
    if (kind === 'image' || kind === 'image-large') return 'vision';
    if (kind === 'video') return 'video';
    return null;
  }
  // Kinds PM can always transform locally, regardless of route capability.
  function pmTransformable(kind) {
    return kind === 'zip' || kind === 'pdf' || kind === 'audio' ||
      kind === 'spreadsheet' || kind === 'image-large' || kind === 'video';
  }

  // First catalog route (ok status) that natively supports a capability,
  // preferring Google for video (the packet's "Use Gemini" example).
  function findAlternateRoute(ctx, capability) {
    var data = ctx.data;
    var catalog = data.providerCatalog ? data.providerCatalog() : [];
    var best = null;
    catalog.forEach(function (p) {
      (p.accounts || []).forEach(function (a) {
        (p.models || []).forEach(function (m) {
          var caps = m.capabilities || {};
          if (!caps[capability]) return;
          var key = p.id + '/' + a.id + '/' + m.id;
          var route = data.routeByKey(key);
          if (!route || route.status !== 'ok') return;
          var candidate = { key: route.key, route: route, label: 'Use ' + (route.modelShort || route.modelLabel) };
          if (!best || (capability === 'video' && p.id === 'google')) best = candidate;
        });
      });
    });
    return best;
  }

  function reasonFor(kind, file) {
    if (kind === 'video') return 'This model cannot read video.';
    if (kind === 'image' || kind === 'image-large') return 'This model cannot read images.';
    var word = KIND_WORDS[kind] || 'this kind of';
    return 'This model cannot read ' + word + ' files.';
  }
  function unsupportedReason(file) {
    if (file.kind === 'binary') {
      return 'No route in this project can use a raw binary blob (' + file.name + '). Nothing was uploaded.';
    }
    return 'No configured route can read ' + file.name + '. Nothing was uploaded.';
  }

  // classify -> 'native' | 'transform' | 'alternate' | 'unsupported'
  function classify(ctx, caps, file) {
    var kind = file.kind;
    var needCap = nativeCapability(kind);
    if (kind === 'binary') return 'unsupported';
    if (needCap && caps[needCap]) return kind === 'image-large' ? 'transform' : 'native';
    if (!needCap && pmTransformable(kind)) return 'transform';
    if (needCap) {
      var alt = findAlternateRoute(ctx, needCap);
      if (alt) return 'alternate';
      if (pmTransformable(kind)) return 'transform';
      return 'unsupported';
    }
    return 'unsupported';
  }

  // --- derived material (deterministic fixtures) ---------------------------------
  function buildDerived(file) {
    var base = 'att-d' + (++derivedSeq);
    function item(kind, label) { return { id: base + '-' + kind, kind: kind, label: label }; }
    switch (file.kind) {
      case 'zip':
        return [item('manifest', 'Safe manifest — 42 entries'), item('files', 'Selected files — 3 of 42')];
      case 'pdf':
        return [item('text', 'Extracted text — 18 pages'), item('page-images', 'Selected page images — 4 pages')];
      case 'audio':
        return [item('transcript', 'Transcript — 6 min 12 s')];
      case 'video':
        return [item('transcript', 'Transcript — 42 s'), item('frames', 'Selected frames — 6 stills')];
      case 'spreadsheet':
        return [item('sheet-summary', 'Sheet summary — "Q3 Metrics"'), item('range-summary', 'Range summary — A1:D48')];
      case 'image-large':
        return [item('resized', 'Resized copy — 2048 px'), item('tiles', 'Tiles — 4 regions')];
      default:
        return [];
    }
  }
  function lineageFor(cardId, file) {
    return [{ id: cardId + '-orig', role: 'original', name: file.name, kind: file.kind, size: file.size }];
  }

  // --- transcript cards -------------------------------------------------------------
  function findCard(ctx, tid, cardId) {
    var thread = ctx.data.thread(tid);
    if (!thread) return null;
    var msgs = thread.messages || [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      var card = msgs[i] && msgs[i].attachmentCard;
      if (card && card.id === cardId) return { message: msgs[i], card: card };
    }
    return null;
  }

  function appendCard(ctx, tid, card) {
    ctx.data.appendRecord(tid, { attachmentCard: card });
    return card;
  }

  // --- chip detail popover (private) -------------------------------------------
  // Derived items + lineage to the original attachment.
  function detailPopover(anchor, res) {
    var panel = el('div', 'k3f-panel');
    panel.appendChild(el('div', 'k3f-title', res.file ? res.file.name : 'Attachment'));
    var stateLine = el('div', 'k3f-state', res.reason || res.summary || '');
    if (stateLine.textContent) panel.appendChild(stateLine);
    var derived = res.derived || [];
    if (derived.length) {
      panel.appendChild(el('div', 'k3f-sub', 'Derived in PM'));
      var dl = el('div', 'k3f-derived');
      derived.forEach(function (d) {
        var row = el('div', 'k3f-derived-row');
        var ic = el('span', 'k3f-row-ic');
        ic.appendChild(kindIcon(d.kind));
        row.appendChild(ic);
        row.appendChild(el('span', 'k3f-row-name', d.label));
        dl.appendChild(row);
      });
      panel.appendChild(dl);
    }
    var lineage = res.lineage || [];
    if (lineage.length) {
      panel.appendChild(el('div', 'k3f-sub', 'Lineage'));
      lineage.forEach(function (l) {
        panel.appendChild(el('div', 'k3f-lineage',
          'Derived from ' + l.name + (l.size ? ' (' + l.size + ')' : '') + ' — original preserved'));
      });
    }
    return window.K3UI.popover(anchor, panel, { className: 'k3f-pop' });
  }

  // --- public API ---------------------------------------------------------------------
  var K3Attachments = {

    // Chooser popover listing the fixture files; selection runs the resolver.
    pick: function (ctx, anchor) {
      var anchorEl = anchor ||
        document.querySelector('[data-k3-slot="composer"] .k3-composer-attach') ||
        document.querySelector('[data-k3-slot="composer"]') || document.body;
      var content = el('div', 'k3f-panel');
      content.appendChild(el('div', 'k3f-title', 'Attach a file'));
      var list = el('div', 'k3f-list k3-scroll');
      FIXTURE_FILES.forEach(function (file) {
        var row = el('button', 'k3f-row');
        row.type = 'button';
        row.setAttribute('data-testid', 'k3f-pick-' + file.name);
        var ic = el('span', 'k3f-row-ic');
        ic.appendChild(kindIcon(file.kind));
        row.appendChild(ic);
        var main = el('span', 'k3f-row-main');
        main.appendChild(el('span', 'k3f-row-name', file.name));
        main.appendChild(el('span', 'k3f-row-meta', (KIND_WORDS[file.kind] || file.kind) + (file.size ? ' · ' + file.size : '')));
        row.appendChild(main);
        row.addEventListener('click', function () {
          window.K3UI.closeAll();
          K3Attachments.resolve(ctx, file);
        });
        list.appendChild(row);
      });
      content.appendChild(list);
      return window.K3UI.popover(anchorEl, content, { className: 'k3f-pop' });
    },

    // Classify a file against the ACTIVE route and record the outcome.
    resolve: function (ctx, file) {
      file = normalizeFile(file);
      var tid = activeTid(ctx);
      if (!tid) return null;
      var eff = ctx.data.effective(tid) || {};
      var caps = (eff.route && eff.route.capabilities) || {};
      var cls = classify(ctx, caps, file);
      var cardId = 'att-' + (++cardSeq);
      var modelName = eff.route ? (eff.route.modelShort || eff.route.modelLabel) : 'this model';
      var card = {
        id: cardId,
        file: { name: file.name, kind: file.kind, size: file.size },
        derived: [],
        lineage: []
      };
      if (cls === 'native') {
        card.state = 'resolved-native';
        card.summary = 'Read natively by ' + modelName + '.';
        card.lineage = lineageFor(cardId, file);
        appendCard(ctx, tid, card);
        emitResolved(tid, { cardId: cardId, classification: 'native' });
      } else if (cls === 'transform') {
        card.state = 'resolved-transform';
        card.summary = 'Transformed in PM — the original file stays untouched.';
        card.derived = buildDerived(file);
        card.lineage = lineageFor(cardId, file);
        appendCard(ctx, tid, card);
        emitResolved(tid, { cardId: cardId, classification: 'transform' });
      } else if (cls === 'alternate') {
        var alt = findAlternateRoute(ctx, nativeCapability(file.kind));
        card.state = 'consent';
        card.reason = reasonFor(file.kind, file);
        card.options = ['cancel', 'extract', 'alternate'];
        card.alternateRoute = alt ? alt.key : null;
        card.alternateLabel = alt ? alt.label : 'Use another model';
        // Consent is REQUIRED — account, privacy, cost, terms, and location
        // change with the route. Nothing resolves until resolveChoice runs.
        appendCard(ctx, tid, card);
      } else {
        card.state = 'unsupported';
        card.reason = unsupportedReason(file);
        card.options = ['remove', 'switch-model'];
        appendCard(ctx, tid, card);
      }
      return {
        cardId: cardId,
        classification: cls,
        state: card.state,
        file: card.file,
        derived: card.derived.slice(),
        lineage: card.lineage.slice(),
        alternateRoute: card.alternateRoute || null,
        alternateLabel: card.alternateLabel || null,
        reason: card.reason || null
      };
    },

    // Consent-card / unsupported-card decision.
    resolveChoice: function (ctx, tid, cardId, choice) {
      var hit = findCard(ctx, tid, cardId);
      if (!hit) return null;
      var card = hit.card;
      if (choice === 'cancel') {
        card.state = 'cancelled';
      } else if (choice === 'extract') {
        card.state = 'resolved-transform';
        card.summary = 'Transformed in PM — the original file stays untouched.';
        card.derived = buildDerived(card.file);
        card.lineage = lineageFor(card.id, card.file);
      } else if (choice === 'alternate') {
        card.state = 'resolved-alternate';
        card.summary = 'Routed to ' + (card.alternateLabel || 'an alternate model') + ' with your confirmation.';
        card.lineage = lineageFor(card.id, card.file);
        // Lazy global: K3Route loads in the same step; never referenced at load.
        if (card.alternateRoute && window.K3Route && typeof window.K3Route.select === 'function') {
          window.K3Route.select(ctx, card.alternateRoute, {});
        }
      } else if (choice === 'remove') {
        card.state = 'removed';
      } else if (choice === 'switch-model') {
        card.state = 'switch-model-requested';
        if (window.K3Route && typeof window.K3Route.openPicker === 'function') {
          var anchor = document.querySelector('[data-testid="k3w-kit-model"]') ||
            document.querySelector('[data-k3-slot="composer"]');
          if (anchor) window.K3Route.openPicker(ctx, anchor);
        }
      } else {
        return null;
      }
      emitResolved(tid, { cardId: cardId, choice: choice, state: card.state });
      return card;
    },

    // Decorate a composer chip with the resolution badge; clicking the chip
    // opens the derived-items + lineage detail popover.
    chipBadge: function (node, resolution) {
      if (!node || !resolution) return node;
      var state = resolution.state || resolution.classification || 'native';
      var key = state.replace('resolved-', '');
      var LABELS = {
        'native': 'Native', 'transform': 'PM', 'consent': 'Consent',
        'alternate': 'Alt', 'unsupported': '!', 'cancelled': '—',
        'removed': '—', 'switch-model-requested': '…'
      };
      node.classList.add('k3f-chip');
      var old = node.querySelector('.k3f-badge');
      if (old) old.parentNode.removeChild(old);
      var badge = el('span', 'k3f-badge k3f-badge-' + key, LABELS[key] || key);
      badge.setAttribute('data-testid', 'k3f-badge');
      node.appendChild(badge);
      if (!node.getAttribute('data-k3f-bound')) {
        node.setAttribute('data-k3f-bound', '1');
        node.addEventListener('click', function (e) {
          var res = node._k3fResolution;
          if (!res) return;
          e.stopPropagation();
          detailPopover(node, res);
        });
      }
      node._k3fResolution = resolution;
      return node;
    },

    // Route change hook: retained draft attachments that no longer fit the
    // active route produce an 'attachment-reevaluate' routeWarningCard.
    reevaluate: function (ctx, threadId) {
      var draft = ctx.data.getDraft ? ctx.data.getDraft(threadId) : null;
      var atts = draft ? (draft.attachments || []) : [];
      if (!atts.length) return null;
      var eff = ctx.data.effective(threadId) || {};
      var caps = (eff.route && eff.route.capabilities) || {};
      var incompatible = [];
      atts.forEach(function (a) {
        var file = normalizeFile(a);
        var cls = classify(ctx, caps, file);
        if (cls === 'alternate' || cls === 'unsupported') {
          incompatible.push({
            file: file,
            classification: cls,
            reason: cls === 'unsupported' ? unsupportedReason(file) : reasonFor(file.kind, file)
          });
        }
      });
      if (!incompatible.length) return null;
      var modelName = eff.route ? (eff.route.modelShort || eff.route.modelLabel) : 'this model';
      var rec = ctx.data.appendRecord(threadId, {
        routeWarningCard: {
          kind: 'attachment-reevaluate',
          title: 'Attachments no longer fit this route',
          reason: incompatible.length + (incompatible.length === 1 ? ' retained attachment is' : ' retained attachments are') +
            ' not readable by ' + modelName + '.',
          attachments: incompatible
        }
      });
      emitResolved(threadId, { kind: 'reevaluate', count: incompatible.length });
      return rec;
    }
  };

  window.K3Attachments = K3Attachments;
})();
