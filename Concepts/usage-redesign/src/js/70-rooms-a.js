/* Widget definitions for Overview, Plans & limits, Costs and Accounts (owner: content; ARCHITECTURE.md section 4.7,
   DESIGN-SPEC section 15). PMU.widgets.define(id, {kind, room, model(ctx), inspect?(ctx), config?, prov?}); titles,
   metas, kinds and levels default to PMU_BOARDS.widgets (tools/boards.py). Skeleton: the Overview KPI models and the
   Accounts provider widgets; everything else falls back to the board data and shows the engine placeholder. */
(function () {
  function rooms(names) {
    Object.keys(PMU_BOARDS.rooms).filter(function (r) { return names.indexOf(r) >= 0; }).forEach(function (room) {
      PMU_BOARDS.rooms[room].M.forEach(function (e) { if (!PMU.widgets.get(e[0]) || !PMU.widgets.get(e[0]).room) PMU.widgets.define(e[0], { room: room }); });
    });
  }
  rooms(['overview', 'plans', 'costs', 'accounts']);
  PMU.widgets.define('health', { room: 'overview', model: function () {
    return { valueText: '92.4%', sub: 'provider readings healthy · +1.8%', facts: [['Fresh', '6 / 6'], ['Warnings', '2'], ['Sync age', '20s'], ['Unpriced', '0.02%']] };
  } });
  PMU.widgets.define('month', { room: 'overview', short: 'Window value', meta: function (ctx) { return ctx.state.range + ' · selected records'; }, model: function () {
    var c = PMU.data.costs();
    return { valueText: PMU.fmt.money(c.selected), sub: c.attempts + ' attempts · settled plus plan est.', facts: [['Settled API', PMU.fmt.money(c.settled)], ['Plan est.', PMU.fmt.money(c.plan)], ['Cache est.', PMU.fmt.money(c.cache)], ['Pending', String(c.pending)]] };
  } });
  PMU.widgets.define('active-runs', { room: 'overview', model: function () {
    return { valueText: '3', sub: 'runs across 9 agents · 2 queued', facts: [['Agents', '9'], ['Nodes', '47'], ['Oldest', '38m'], ['Projected', '$8.40']] };
  } });
})();
