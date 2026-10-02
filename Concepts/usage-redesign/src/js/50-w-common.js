/* Common widget kinds (owner: content; ARCHITECTURE.md section 4.7, DESIGN-SPEC section 4): kpi, list, table, mix,
   ranked, trend, columns, budget, heat, timeline, gauge, context. Each is
   PMU.widgets.kind(name, {render(body, ctx), update(body, ctx), enter(body, ctx, delay), destroy?, autoH?}).
   Skeleton: a minimal kpi (label, value, sub-line, facts) so the boards show real numbers; the other kinds are unset
   and the engine shows their placeholder until the content builder registers them. */
(function () {
  function factsHtml(facts, max) {
    return (facts || []).slice(0, max).map(function (f) { return '<div class="pmu-fact"><span>' + esc(f[0]) + '</span><b>' + esc(f[1]) + '</b></div>'; }).join('');
  }
  PMU.widgets.kind('kpi', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = '<div class="pmu-todo">' + esc(ctx.id) + '</div>'; return; }
      var maxFacts = ctx.tier.h === 'h0' || ctx.tier.h === 'h1' ? 0 : ctx.tier.h === 'h2' ? (ctx.tier.w === 'xs' || ctx.tier.w === 's' ? 2 : 4) : 8;
      body.innerHTML = '<div class="pmu-kpi"><b class="pmu-kpivalue">' + esc(m.valueText) + '</b>' + (m.sub ? '<span class="pmu-kpisub">' + esc(m.sub) + '</span>' : '') + '</div>' +
        (maxFacts ? '<div class="pmu-facts">' + factsHtml(m.facts, maxFacts) + '</div>' : '');
    },
    update: function (body, ctx) { this.render(body, ctx); }
  });
})();
