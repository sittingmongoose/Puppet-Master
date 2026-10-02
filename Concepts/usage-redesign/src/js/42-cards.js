/* Widget registry and card chrome (owner: engine; ARCHITECTURE.md section 4.7, DESIGN-SPEC section 3).
   Content registers kinds (render / update / enter) and widget definitions (model, inspect, config); the engine builds
   the chrome, measures the tier and calls the kind. A widget with no kind yet renders a quiet placeholder. */
(function () {
  var kinds = {}, defs = {};
  var EDGES = ['e', 'w', 's', 'se', 'sw', 'ne', 'nw'];
  var st = PMU.core.state;

  PMU.widgets = {
    kind: function (name, impl) { kinds[name] = impl; },
    define: function (id, def) { defs[id] = def; },
    get: function (id) {
      var d = defs[id], b = PMU_BOARDS.widgets[id];
      if (!d && !b) return null;
      return Object.assign({ kind: b && b.kind, level: b && b.level, title: b && b.title, meta: b && b.meta }, d || {});
    },
    kindOf: function (id) { var d = PMU.widgets.get(id); return d ? kinds[d.kind] || null : null; },
    kinds: function () { return Object.keys(kinds); },
    list: function (room) { return Object.keys(defs).filter(function (id) { return defs[id].room === room; }); }
  };

  function text(v, ctx) { return typeof v === 'function' ? v(ctx) : (v || ''); }
  function ctxBase(id, room) {
    return { id: id, room: room, state: { range: st.range, scope: st.scope, detail: st.detail }, look: PMU.theme.look(),
      thresholds: PMU.roster && PMU.roster.thresholds ? PMU.roster.thresholds() : null };
  }
  function ctxFor(card, tier, entering) {
    var id = card.getAttribute('data-widget'), room = card.getAttribute('data-room');
    var base = ctxBase(id, room), def = PMU.widgets.get(id) || {};
    var model = null;
    try { model = typeof def.model === 'function' ? def.model(base) : null; } catch (error) { console.error('[pm-usage] model ' + id, error); }
    return Object.assign(base, { def: def, model: model, tier: tier, size: { w: +card.dataset.w, h: +card.dataset.h }, entering: !!entering, card: card });
  }

  PMU.cards = {
    build: function (id, room, rect) {
      var def = PMU.widgets.get(id) || { title: id, kind: 'unknown' };
      var card = document.createElement('article');
      card.className = 'pmu-card';
      card.setAttribute('data-widget', id);
      card.setAttribute('data-room', room);
      card.setAttribute('data-kind', def.kind || 'unknown');
      card.setAttribute('data-level', def.level || 'glance');
      card.setAttribute('tabindex', '0');
      if (def.prov) card.setAttribute('data-prov', def.prov);
      var base = ctxBase(id, room);
      card.innerHTML = '<header class="pmu-cardhead"><span class="pmu-grip" aria-hidden="true">' + SVG.grip + '</span>' +
        '<h3 class="pmu-cardtitle" data-pm-hover-label="' + esc(text(def.title, base)) + '" data-pm-hover-detail="' + esc(text(def.meta, base)) + '">' + esc(text(def.title, base)) + '</h3>' +
        '<span class="pmu-cardmeta">' + esc(text(def.meta, base)) + '</span>' +
        '<span class="pmu-cardtools"><button type="button" class="pmu-iconbtn pmu-cardgear" aria-label="Configure panel">' + SVG.gear + '</button>' +
        '<button type="button" class="pmu-iconbtn pmu-cardmenu" aria-label="Panel options">' + SVG.kebab + '</button></span></header>' +
        '<div class="pmu-cardbody"></div>' + EDGES.map(function (e) { return '<i class="pmu-h" data-edge="' + e + '" aria-hidden="true"></i>'; }).join('');
      if (rect) PMU.board.place(card, rect);
      return card;
    },
    renderBody: function (card, tier, entering) {
      var body = card.querySelector('.pmu-cardbody'); if (!body) return;
      var id = card.getAttribute('data-widget'), kind = PMU.widgets.kindOf(id);
      var ctx = ctxFor(card, tier, entering);
      /* narrow tiers use the short title when the definition has one (DESIGN-SPEC 3) */
      var title = card.querySelector('.pmu-cardtitle'), want = (tier.w === 'xs' || tier.w === 's') && ctx.def.short ? text(ctx.def.short, ctx) : text(ctx.def.title, ctx);
      if (title && title.textContent !== want) title.textContent = want;
      if (body._pmuKind && body._pmuKind.destroy) { try { body._pmuKind.destroy(body, body._pmuCtx); } catch (error) {} }
      body.textContent = '';
      body._pmuKind = kind; body._pmuCtx = ctx;
      if (!kind) {
        body.innerHTML = '<div class="pmu-todo">' + esc(t('board.not_built', { kind: ctx.def.kind || 'widget', w: ctx.size.w, h: ctx.size.h })) +
          ' · ' + tier.w + ' / ' + tier.h + '</div>';
        return;
      }
      try {
        kind.render(body, ctx);
        if (entering && kind.enter) kind.enter(body, ctx, 0);
      } catch (error) { console.error('[pm-usage] render ' + id, error); body.innerHTML = '<div class="pmu-todo">' + esc(id) + '</div>'; }
    },
    updateAll: function (cards, reason) {
      cards.forEach(function (card) {
        var body = card.querySelector('.pmu-cardbody'); if (!body) return;
        var kind = body._pmuKind, tier = body._pmuCtx ? body._pmuCtx.tier : PMU.board.tierOf(body.clientWidth, body.clientHeight);
        var ctx = ctxFor(card, tier, false); ctx.reason = reason;
        var title = card.querySelector('.pmu-cardtitle'), meta = card.querySelector('.pmu-cardmeta');
        if (title) { var tt = (tier.w === 'xs' || tier.w === 's') && ctx.def.short ? text(ctx.def.short, ctx) : text(ctx.def.title, ctx); if (title.textContent !== tt) title.textContent = tt; }
        if (meta) { var mt = text(ctx.def.meta, ctx); if (meta.textContent !== mt) meta.textContent = mt; }
        if (kind && kind.update) { try { body._pmuCtx = ctx; kind.update(body, ctx); } catch (error) { console.error('[pm-usage] update', error); } }
        else if (kind) PMU.cards.renderBody(card, tier, false);
      });
    },
    empty: function (room) {
      var el = document.createElement('div');
      el.className = 'pmu-empty';
      var rank = { glance: 0, detailed: 1, diagnostics: 2 }[st.detail] || 0;
      var holder = ['detailed', 'diagnostics'].filter(function (lv, i) { return i + 1 > rank && PMU.board.layout(room).some(function (r) { return (PMU.widgets.get(r.id) || {}).level === lv; }); })[0];
      el.textContent = holder ? t('board.empty_level', { level: DETAIL[st.detail].label, holder: DETAIL[holder].label }) : t('board.empty_none');
      return el;
    }
  };
})();
