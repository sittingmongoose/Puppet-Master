/* PMX workspace — Opus 5
 *
 * Drives three surfaces from one implementation, chosen by <body data-pmx-mode>:
 *   gallery  (index.html)   every concept as a live, interactive preview
 *   stage    (stage.html)   one pairing at full fidelity, deep-linkable by hash
 *   contact  (contact.html) the same pairing rendered in all eight themes at once
 *
 * The contact surface is why themes are set on a stage container rather than the document
 * root: eight sibling stages, eight themes, one document. That turns the 32 theme-width
 * configurations into 4 screenshots instead of 32, and lets in-page assertions read every
 * theme's computed styles without crossing a document boundary.
 */
(function (global) {
  'use strict';

  var U, LABEL = 'Opus 5';

  var THEMES = [
    { id: 'friendly-dark', name: 'Friendly Dark' },
    { id: 'friendly-light', name: 'Friendly Light' },
    { id: 'retro-dark', name: 'Retro Dark' },
    { id: 'retro-light', name: 'Retro Light' },
    { id: 'basic-light', name: 'Basic Light' },
    { id: 'basic-dark', name: 'Basic Dark' },
    { id: 'glass-dark', name: 'Glass Dark' },
    { id: 'glass-light', name: 'Glass Light' }
  ];

  var PRESETS = [
    { w: 520, name: 'Minimum' },
    { w: 750, name: 'Normal' },
    { w: 975, name: 'Wider' },
    { w: 1200, name: 'Wide' }
  ];

  var store, data, services, compositions = [];

  /* The store coarsens every path to at most two segments before it notifies, so `ui.theme`
   * arrives as the string 'ui.theme' and never as a bare 'ui'. Three subscribers in this file
   * used changed.indexOf('ui') and were therefore dead for every real change: the stage hash
   * never updated, theme-locked contact cells were never restored, and pinned gallery cards
   * were never put back. Prefix-match, the way compose.js already did. */
  function touched(changed, prefix) {
    if (!changed || !changed.some) return false;
    return changed.some(function (k) { return String(k).indexOf(prefix) === 0; });
  }

  /* ------------------------------------------------------------------ services */

  /* Services that keep per-thread state hold a reference to the store rather than reaching
   * for a global. Binding is mandatory — an unbound service silently returns empty state,
   * which is exactly how the questionnaire and draft suites failed the first time. */
  function bindServices(s, d) {
    ['PMXObservable', 'PMXRoute', 'PMXAccess', 'PMXBsd', 'PMXApprovals', 'PMXContextAdmit',
     'PMXThreadOps', 'PMXOps', 'PMXAttach', 'PMXSync', 'PMXSpell', 'PMXNotify', 'PMXCapacity',
     'PMXCrew', 'PMXDrafts', 'PMXLens', 'PMXSearch', 'PMXSurfaces', 'PMXRuntime',
     'PMXQuestionnaire', 'PMXQFlow', 'PMXArtifacts', 'PMXThreadHistory', 'PMXOpCard',
     'PMXRunTrace', 'PMXDemo']
      .forEach(function (name) {
        var svc = global[name];
        if (svc && typeof svc.bind === 'function') svc.bind(s, d);
      });
  }

  function buildServices() {
    return {
      popup: global.PMXPopup,
      scroll: global.PMXScroll,
      search: global.PMXSearch,
      lens: global.PMXLens,
      questionnaire: global.PMXQuestionnaire,
      qflow: global.PMXQFlow,
      drafts: global.PMXDrafts,
      runtime: global.PMXRuntime,
      activity: global.PMXActivity || global.PMXSurfaces,
      goals: global.PMXGoals || global.PMXSurfaces,
      surfaces: global.PMXSurfaces,
      editorHost: global.PMXEditorHost,
      artifacts: global.PMXArtifacts,
      motion: global.PMXMotion,
      icons: global.PMXIcons,
      toast: global.PMXToast,
      listwindow: global.PMXListWindow,
      /* ---- packet services. Every one is reached through ctx.services so no concept module
       * touches a global, per CONTRACT section 4. */
      observable: global.PMXObservable,
      route: global.PMXRoute,
      access: global.PMXAccess,
      bsd: global.PMXBsd,
      approvals: global.PMXApprovals,
      contextAdmit: global.PMXContextAdmit,
      threadOps: global.PMXThreadOps,
      ops: global.PMXOps,
      capacity: global.PMXCapacity,
      crew: global.PMXCrew,
      attach: global.PMXAttach,
      sync: global.PMXSync,
      spell: global.PMXSpell,
      notify: global.PMXNotify,
      threadHistory: global.PMXThreadHistory,
      /* One operation-record contract; each thread concept lays it out in its own idiom. */
      opcard: global.PMXOpCard,
      /* The run as a record — entry order, running phase, partial counts, which phase is open.
       * Same rule as opcard: one contract, eight presentations, no shared markup. */
      runtrace: global.PMXRunTrace
    };
  }

  function ctxBase() {
    return { label: LABEL, store: store, data: data, services: services };
  }

  /* ------------------------------------------------------------------ controls */

  function segmented(label, items, getValue, onPick) {
    var wrap = U.el('div', { class: 'ws-ctrl' }, [U.el('span', { class: 'ws-ctrl-label', text: label })]);
    var group = U.el('div', { class: 'ws-seg' });
    items.forEach(function (it) {
      var b = U.el('button', { class: 'ws-seg-btn', text: it.name, data: { value: String(it.id) } });
      U.on(b, 'click', function () { onPick(it.id); });
      group.appendChild(b);
    });
    wrap.appendChild(group);
    wrap.sync = function () {
      var v = String(getValue());
      var kids = group.children;
      for (var i = 0; i < kids.length; i++) {
        kids[i].setAttribute('aria-pressed', kids[i].getAttribute('data-value') === v ? 'true' : 'false');
      }
    };
    wrap.sync();
    return wrap;
  }

  function selectCtrl(label, options, getValue, onPick) {
    var wrap = U.el('div', { class: 'ws-ctrl' }, [U.el('span', { class: 'ws-ctrl-label', text: label })]);
    var sel = U.el('select', { class: 'ws-select' });
    options.forEach(function (o) {
      sel.appendChild(U.el('option', { value: o.id, text: o.name }));
    });
    U.on(sel, 'change', function () { onPick(sel.value); });
    wrap.appendChild(sel);
    wrap.sync = function () { sel.value = String(getValue()); };
    wrap.sync();
    return wrap;
  }

  function toggleCtrl(label, getValue, onToggle) {
    var wrap = U.el('div', { class: 'ws-ctrl' });
    var b = U.el('button', { class: 'ws-toggle', text: label });
    U.on(b, 'click', function () { onToggle(!getValue()); });
    wrap.appendChild(b);
    wrap.sync = function () { b.setAttribute('aria-pressed', getValue() ? 'true' : 'false'); };
    wrap.sync();
    return wrap;
  }

  function widthCtrl() {
    var wrap = U.el('div', { class: 'ws-ctrl ws-ctrl-width' }, [
      U.el('span', { class: 'ws-ctrl-label', text: 'Chat width' })
    ]);
    var group = U.el('div', { class: 'ws-seg' });
    PRESETS.forEach(function (p) {
      var b = U.el('button', {
        class: 'ws-seg-btn', data: { value: String(p.w) },
        text: p.name + ' ' + p.w
      });
      U.on(b, 'click', function () { store.set('ui.chatWidth', p.w); });
      group.appendChild(b);
    });
    wrap.appendChild(group);

    /* Continuous control across the whole range, alongside the four reproducible presets. */
    var slider = U.el('input', { class: 'ws-slider', type: 'range', min: '520', max: '1200', step: '1' });
    var readout = U.el('span', { class: 'ws-readout' });
    U.on(slider, 'input', function () { store.set('ui.chatWidth', parseInt(slider.value, 10)); });
    wrap.appendChild(slider);
    wrap.appendChild(readout);

    wrap.sync = function () {
      var w = store.get('ui.chatWidth');
      slider.value = w;
      readout.textContent = w + 'px';
      var kids = group.children;
      for (var i = 0; i < kids.length; i++) {
        kids[i].setAttribute('aria-pressed', parseInt(kids[i].getAttribute('data-value'), 10) === w ? 'true' : 'false');
      }
    };
    wrap.sync();
    return wrap;
  }

  function buildControlBar(host, opts) {
    opts = opts || {};
    var bar = U.el('div', { class: 'ws-bar' });

    var brand = U.el('div', { class: 'ws-brand' }, [
      U.el('span', { class: 'ws-brand-label', text: LABEL }),
      U.el('span', { class: 'ws-brand-sub', text: 'Assistant Chat concepts' })
    ]);
    bar.appendChild(brand);

    var ctrls = [];

    if (!opts.hideTheme) {
      ctrls.push(selectCtrl('Theme', THEMES, function () { return store.get('ui.theme'); },
        function (v) { store.set('ui.theme', v); }));
    }

    if (!opts.hideConcepts) {
      var wins = global.PMX.window.all().map(function (w) { return { id: w.id, name: w.id.toUpperCase() + ' ' + w.name }; });
      var thrs = global.PMX.thread.all().map(function (t) { return { id: t.id, name: t.id.toUpperCase() + ' ' + t.name }; });
      ctrls.push(selectCtrl('Window', wins, function () { return store.get('ui.windowId'); },
        function (v) { setPairing(v, null); }));
      ctrls.push(selectCtrl('Thread', thrs, function () { return store.get('ui.threadId'); },
        function (v) { setPairing(null, v); }));
    }

    ctrls.push(widthCtrl());

    ctrls.push(segmented('Form', [{ id: 'docked', name: 'Docked' }, { id: 'popout', name: 'Pop-out' }],
      function () { return store.get('ui.mount'); },
      function (v) { store.set('ui.mount', v); }));

    ctrls.push(toggleCtrl('Application rail', function () { return store.get('ui.railOpen'); },
      function (v) { store.set('ui.railOpen', v); }));

    ctrls.push(toggleCtrl('Reduced motion', function () { return store.get('ui.reducedMotion'); },
      function (v) { store.set('ui.reducedMotion', v); }));

    ctrls.forEach(function (c) { bar.appendChild(c); });

    var links = U.el('div', { class: 'ws-links' });
    [['index.html', 'Gallery'], ['stage.html', 'Stage'], ['contact.html', 'Contact sheet'],
     ['tests/runner.html', 'Tests']].forEach(function (l) {
      var a = U.el('a', { class: 'ws-link', href: l[0], text: l[1] });
      links.appendChild(a);
    });
    bar.appendChild(links);

    host.appendChild(bar);

    store.subscribe(function () { ctrls.forEach(function (c) { if (c.sync) c.sync(); }); });
    return bar;
  }


  /* ------------------------------------------------------------------ demo director
   * A review control, deliberately OUTSIDE the fake product shell and visually separated from
   * it. The packet is explicit that demo triggers must not become permanent Chat toolbar
   * buttons, so this is the only place they appear — the same events are also reachable from
   * PMXDemo.fire() for probes and from the page hash for captures.
   *
   * It is collapsed by default so it never competes with the concept being reviewed. */
  function buildDirector(host) {
    if (!global.PMXDemo) return null;

    var wrap = U.el('details', { class: 'ws-director' });
    var summary = U.el('summary', { class: 'ws-director-summary' }, [
      U.el('span', { class: 'ws-director-title', text: 'Director' }),
      U.el('span', {
        class: 'ws-director-note',
        text: 'Review controls. Not part of the proposed Chat toolbar.'
      })
    ]);
    wrap.appendChild(summary);

    var body = U.el('div', { class: 'ws-director-body' });
    var fams = global.PMXDemo.families();

    Object.keys(fams).forEach(function (family) {
      var group = U.el('div', { class: 'ws-director-group' });
      group.appendChild(U.el('span', { class: 'ws-director-group-label', text: family }));
      var row = U.el('div', { class: 'ws-director-row' });
      fams[family].forEach(function (event) {
        var b = U.el('button', {
          class: 'ws-director-btn', type: 'button',
          text: event.replace(/_/g, ' '),
          data: { trigger: family + '.' + event }
        });
        U.on(b, 'click', function () {
          var r = global.PMXDemo.fire(family, event);
          /* A trigger that cannot fire says so rather than failing silently — the whole point
           * of this surface is that what it claims to do, it does. */
          b.setAttribute('data-last', r.ok ? 'ok' : 'failed');
          if (!r.ok && global.console) console.warn('[pmx-demo]', family + '.' + event, r.reason);
        });
        row.appendChild(b);
      });
      group.appendChild(row);
      body.appendChild(group);
    });

    wrap.appendChild(body);
    host.appendChild(wrap);
    return wrap;
  }

  /* ------------------------------------------------------------------ mounting */

  function makeStage(host, overrides) {
    var stage = U.el('div', { class: 'pmx-stage' });
    if (overrides && overrides.theme) stage.setAttribute('data-theme', overrides.theme);
    host.appendChild(stage);
    var comp = global.PMXCompose.create(stage, ctxBase());
    if (overrides && overrides.theme) comp._themeLock = overrides.theme;
    compositions.push(comp);
    return comp;
  }

  function setPairing(windowId, threadId) {
    if (windowId) store.set('ui.windowId', windowId);
    if (threadId) store.set('ui.threadId', threadId);
    var w = store.get('ui.windowId'), t = store.get('ui.threadId');
    /* A pinned gallery card shows one specific concept — that is what pinning means. Remounting
     * it onto the global selection and letting the restorer put it back would work, but it
     * costs two remounts and a visible flash, so resolve the pin here instead. */
    compositions.forEach(function (c) {
      var pw = (c._pinned && c._pinned.windowId) || w;
      var pt = (c._pinned && c._pinned.threadId) || t;
      if (c.windowId === pw && c.threadId === pt) return;
      try { c.remount(pw, pt); } catch (e) { if (global.console) console.error('[pmx-workspace]', e); }
    });
    writeHash();
  }

  function writeHash() {
    try {
      var ui = store.get('ui');
      var h = '#w=' + ui.windowId + '&t=' + ui.threadId + '&theme=' + ui.theme +
              '&width=' + ui.chatWidth + '&mount=' + ui.mount +
              '&rail=' + (ui.railOpen ? '1' : '0') + '&rm=' + (ui.reducedMotion ? '1' : '0');
      if (global.history && history.replaceState) history.replaceState(null, '', h);
    } catch (e) {}
  }

  function readHash() {
    var h = (global.location.hash || '').replace(/^#/, '');
    if (!h) return;
    var out = {};
    h.split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p.length === 2) out[p[0]] = decodeURIComponent(p[1]);
    });
    var patch = {};
    if (out.w) patch['ui.windowId'] = out.w;
    if (out.t) patch['ui.threadId'] = out.t;
    if (out.theme) patch['ui.theme'] = out.theme;
    if (out.width) patch['ui.chatWidth'] = parseInt(out.width, 10);
    if (out.mount) patch['ui.mount'] = out.mount;
    if (out.rail) patch['ui.railOpen'] = out.rail === '1';
    if (out.rm) patch['ui.reducedMotion'] = out.rm === '1';
    store.patch(patch);
  }

  /* ------------------------------------------------------------------ surfaces */

  function renderStage(root) {
    var holder = U.el('div', { class: 'ws-stage-holder' });
    root.appendChild(holder);
    var comp = makeStage(holder);
    comp.mount(store.get('ui.windowId'), store.get('ui.threadId'));
    store.subscribe(function (s, changed) {
      if (touched(changed, 'ui')) writeHash();
    });
  }

  /* Live, interactive previews — not thumbnails. Each card is a real composition,
   * scaled down so eight fit on screen without changing the layout being tested. */
  function renderGallery(root) {
    var intro = U.el('section', { class: 'ws-intro' }, [
      U.el('h1', { text: LABEL + ' Assistant Chat concepts' }),
      U.el('p', {
        text: 'Eight chat-window concepts and eight chat-thread concepts. Any thread mounts in any ' +
              'window, so there are sixty-four pairings. Every preview below is live and interactive. ' +
              'Controls above apply to the workspace and to every hosted concept at once.'
      })
    ]);
    root.appendChild(intro);

    function grid(title, note, items, isWindow) {
      var sec = U.el('section', { class: 'ws-section' }, [
        U.el('h2', { text: title }),
        U.el('p', { class: 'ws-section-note', text: note })
      ]);
      var g = U.el('div', { class: 'ws-grid' });
      items.forEach(function (item) {
        var card = U.el('article', { class: 'ws-card' });
        card.appendChild(U.el('header', { class: 'ws-card-head' }, [
          U.el('span', { class: 'ws-card-id', text: item.id.toUpperCase() }),
          U.el('h3', { class: 'ws-card-name', text: item.name }),
          U.el('span', { class: 'ws-card-model', text: LABEL })
        ]));
        card.appendChild(U.el('p', { class: 'ws-card-blurb', text: item.blurb }));

        var frame = U.el('div', { class: 'ws-card-frame' });
        var scaler = U.el('div', { class: 'ws-card-scaler' });
        frame.appendChild(scaler);
        card.appendChild(frame);

        var comp = makeStage(scaler);
        var wid = isWindow ? item.id : store.get('ui.windowId');
        var tid = isWindow ? store.get('ui.threadId') : item.id;
        try {
          comp.mount(wid, tid);
        } catch (e) {
          scaler.appendChild(U.el('div', { class: 'ws-card-error', text: 'Mount failed: ' + e.message }));
          if (global.console) console.error('[pmx-gallery] mount failed for ' + item.id, e);
        }
        comp._pinned = isWindow ? { windowId: item.id } : { threadId: item.id };

        var open = U.el('a', {
          class: 'ws-card-open',
          href: 'stage.html#w=' + wid + '&t=' + tid,
          text: 'Open in stage'
        });
        card.appendChild(open);
        g.appendChild(card);
      });
      sec.appendChild(g);
      root.appendChild(sec);
    }

    grid('Window concepts', 'Each shown hosting the currently selected thread concept.',
      global.PMX.window.all(), true);
    grid('Thread concepts', 'Each shown inside the currently selected window concept.',
      global.PMX.thread.all(), false);

    fitOnResize(root, '.ws-card-frame', CARD_VW, CARD_VH);
  }

  /* The whole concept, or it is not a preview.
   *
   * A card frame is sized by the grid and changes with the viewport; the concept inside is
   * laid out at a fixed virtual width because that is the point — the layout under test must
   * stay honest, so we shrink the picture rather than the layout. Those two facts only agree
   * if the scale is computed from the measured frame. Hard-coding it cropped every preview to
   * its left 54% at this viewport, which is not a smaller preview but a different, misleading
   * one: a reviewer would judge a layout by the half of it that happened to fit.
   *
   * Height follows the same scale so the frame matches the picture and no dead band is left
   * under it. Reads are batched ahead of writes to keep this off the layout-thrash path. */
  var CARD_VW = 1400, CARD_VH = 840;       /* gallery: rail + dashboard + a 750 chat */
  var CONTACT_VW = 1320, CONTACT_VH = 1440; /* contact sheet: one pairing, taller crop */

  function fitFrames(root, sel, vw, vh) {
    var frames = [].slice.call(root.querySelectorAll(sel));
    var widths = frames.map(function (f) { return f.clientWidth; });
    frames.forEach(function (f, i) {
      var w = widths[i];
      if (!w) return;
      var scale = w / vw;
      f.style.setProperty('--ws-card-scale', scale.toFixed(4));
      f.style.setProperty('--ws-card-vw', vw + 'px');
      f.style.setProperty('--ws-card-vh', vh + 'px');
      f.style.setProperty('--ws-card-h', Math.round(vh * scale) + 'px');
    });
  }

  function fitOnResize(root, sel, vw, vh) {
    fitFrames(root, sel, vw, vh);
    var pending = null;
    global.addEventListener('resize', function () {
      if (pending) return;
      pending = global.requestAnimationFrame(function () {
        pending = null;
        fitFrames(root, sel, vw, vh);
      });
    });
  }

  /* All eight themes side by side for one pairing. One screenshot proves eight of the
   * thirty-two theme-width configurations. */
  function renderContact(root) {
    var sec = U.el('section', { class: 'ws-section' }, [
      U.el('h2', { text: 'Theme contact sheet' }),
      U.el('p', {
        class: 'ws-section-note',
        text: 'The selected pairing rendered in all eight themes at the current width, rail state, ' +
              'form, and motion setting. One capture covers eight of the thirty-two configurations.'
      })
    ]);
    var g = U.el('div', { class: 'ws-contact' });
    THEMES.forEach(function (th) {
      var cell = U.el('div', { class: 'ws-contact-cell' }, [
        U.el('div', { class: 'ws-contact-label' }, [
          U.el('span', { text: th.name }),
          U.el('span', { class: 'ws-contact-model', text: LABEL })
        ])
      ]);
      var holder = U.el('div', { class: 'ws-contact-frame' });
      cell.appendChild(holder);
      g.appendChild(cell);

      var comp = makeStage(holder, { theme: th.id });
      try {
        comp.mount(store.get('ui.windowId'), store.get('ui.threadId'));
      } catch (e) {
        holder.appendChild(U.el('div', { class: 'ws-card-error', text: 'Mount failed: ' + e.message }));
      }
    });
    sec.appendChild(g);
    root.appendChild(sec);

    fitOnResize(root, '.ws-contact-frame', CONTACT_VW, CONTACT_VH);
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    U = global.PMXUtil;
    store = global.PMXStore.create();
    bindServices(store);
    services = buildServices();
    /* One delegated pointer listener for the whole document, shared by every
     * composition on the page — the contact sheet mounts sixteen of them. */
    if (global.PMXHover) global.PMXHover.bind(document);

    return global.PMXData.load().then(function (d) {
      data = d;
      /* The store seeds each thread's authored fixture state (BSD, decisions, attachments,
       * thread operations, conflicts, outbox) the first time that thread's view is touched. It
       * needs the normalized corpus to do it, and it must have it BEFORE any service binds,
       * because binding is what first reads a view. */
      store.attachData(d);
      /* Re-bind now that the data actually exists. Services that seed state from the corpus
       * — the questionnaire queue above all — get nothing if they are bound before the load
       * resolves, and the failure is silent: an empty queue looks exactly like a thread with
       * no questions. */
      bindServices(store, d);
      if (global.PMXSearch && global.PMXSearch.index) global.PMXSearch.index(d);

      var mode = document.body.getAttribute('data-pmx-mode') || 'gallery';
      readHash();

      var barHost = U.el('div', { class: 'ws-bar-host' });
      document.body.appendChild(barHost);
      buildControlBar(barHost, { hideConcepts: false });
      buildDirector(barHost);

      var root = U.el('main', { class: 'ws-root' });
      document.body.appendChild(root);

      /* A theme-locked contact cell must keep its own theme when the global theme changes. */
      store.subscribe(function (s, changed) {
        if (!touched(changed, 'ui')) return;
        compositions.forEach(function (c) {
          if (c._themeLock) c.stage.setAttribute('data-theme', c._themeLock);
        });
      });

      if (mode === 'stage') renderStage(root);
      else if (mode === 'contact') renderContact(root);
      else renderGallery(root);

      /* Pinned gallery cards keep their own concept when the global selection changes. */
      if (mode === 'gallery') {
        store.subscribe(function (s, changed) {
          if (!touched(changed, 'ui')) return;
          compositions.forEach(function (c) {
            if (!c._pinned) return;
            var w = c._pinned.windowId || s.ui.windowId;
            var t = c._pinned.threadId || s.ui.threadId;
            if (c.windowId !== w || c.threadId !== t) {
              try { c.remount(w, t); } catch (e) {}
            }
          });
        });
      }

      global.PMXWorkspace.store = store;
      global.PMXWorkspace.data = data;
      global.PMXWorkspace.compositions = compositions;
      global.PMXWorkspace.THEMES = THEMES;
      global.PMXWorkspace.PRESETS = PRESETS;
      global.PMXWorkspace.ready = true;
      /* The ConceptHub embed handshake goes LAST, after `ready` is true: the Hub may answer the
       * ready message with a theme, reduced-motion and width state in the same tick, and applying
       * those before the compositions exist would write state nothing is listening to yet. */
      if (global.PMXHubBridge) global.PMXHubBridge.install(store);
      document.body.setAttribute('data-pmx-ready', '1');
      return global.PMXWorkspace;
    }).catch(function (err) {
      var msg = U.el('div', { class: 'ws-fatal' }, [
        U.el('h2', { text: 'The workspace could not start' }),
        U.el('p', { text: String(err && err.message ? err.message : err) })
      ]);
      document.body.appendChild(msg);
      if (global.console) console.error('[pmx-workspace]', err);
      throw err;
    });
  }

  global.PMXWorkspace = {
    boot: boot, ready: false,
    THEMES: THEMES, PRESETS: PRESETS,
    setPairing: setPairing
  };
})(window);
