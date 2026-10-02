/* Widget definitions for Free models, Context, Analytics and Ledger (owner: content; DESIGN-SPEC 15, DESIGN-SPEC-ATLAS 9).
   Token volumes come from the explicit token series (PMU_SERIES.tokens, by range and scope); values ($) come from the
   recorded attempts (PMU.data.attempts(): settled charge + labelled plan allocation estimate); value by token type is a
   PM estimate at catalog rates, normalised so the parts add up to the recorded value. Every subtitle says which. */
(function () {
  var C = PMU.content, D = PMU.data, F = PMU.fmt, b = C.b;
  function def(id, room, o) { PMU.widgets.define(id, Object.assign({ room: room }, o)); }
  function money(v) { return C.money(v); }
  var legName = C.legName;

  /* ================================================================== Free models */
  var FREE = [
    { provider: 'Free Models route · Z.AI catalog', price: '$0', priceSource: 'provider catalog', capacity: '82 calls left', capacitySource: 'provider published · catalog 2m old', availability: { pct: 100, tone: 'calm', label: 'Ready now', valueText: 'Ready', detail: 'Ready now · provider catalog 2m old' }, eligibility: 'eligible now' },
    { provider: 'Free Models route · Qwen catalog', price: '$0', priceSource: 'provider catalog', capacity: 'remaining not published', capacitySource: 'provider publishes no remaining count', availability: { pct: 42, tone: 'warn', label: 'Cooldown', reset: 'resets 16:48 · provider reset clock', detail: 'Cooling down · resets 16:48 · provider reported' }, eligibility: 'after reset 16:48', clocked: true },
    { provider: 'Free Models route · Google catalog', price: '$0', priceSource: 'provider catalog', capacity: '1,420 calls left', capacitySource: 'provider published · catalog 2m old', availability: { pct: 100, tone: 'calm', label: 'Ready now', valueText: 'Ready', detail: 'Ready now · provider catalog 2m old' }, eligibility: 'eligible now' },
    { provider: 'Local model server · this network', price: '$0', priceSource: 'local inference', capacity: 'device capacity', capacitySource: 'device reported · RX 7900 XTX', availability: { pct: 100, tone: 'calm', label: 'Ready now', valueText: 'Ready', detail: 'Ready now · device reported' }, eligibility: 'eligible now' }
  ];
  function ctxTok(s) { var m = /([\d.]+)\s*([kM])/.exec(s); return m ? +m[1] * (m[2] === 'M' ? 1e6 : 1e3) : null; }
  DATA.free.forEach(function (r, i) {
    var x0 = FREE[i];
    /* the fixture's clock strings on the page clock (PMU.clock), read when the card renders */
    var fx = function () { return x0.clocked ? Object.assign({}, x0, { availability: Object.assign({}, x0.availability, { reset: PMU.clock.text(x0.availability.reset), detail: PMU.clock.text(x0.availability.detail) }),
      eligibility: PMU.clock.text(x0.eligibility) }) : x0; };
    def('free-' + i, 'free', { title: r[0], meta: function () { return r[1] + ' · ' + x0.provider; }, model: function () {
      var x = fx();
      var cool = /Cooldown/.test(r[1]);
      var win = ctxTok(r[3]), fit = win ? (DATA.context.used <= win ? 'fits the current thread (' + F.tok(DATA.context.used) + ' of ' + r[3] + ')' : 'smaller than the current thread') : 'unknown';
      return { state: cool ? 'Cooldown until ' + PMU.clock.clock('16:48') + ' · ' + PMU.clock.until('16:48') : 'Ready', stateTone: cool ? 'warn' : 'good', stateGlyph: cool ? 'hourglass' : 'checkCircle', provider: x.provider, price: x.price, priceSource: x.priceSource,
        context: r[3], capacity: x.capacity, capacitySource: x.capacitySource, availability: x.availability,
        facts: [['Availability', cool ? 'cooling down · ' + x.availability.reset.replace(/ ·.*$/, '') + ' (42% of the wait done)' : 'ready now'], ['Eligibility', x.eligibility], ['Route class', 'free'], ['Source', i === 3 ? 'device reported' : 'provider catalog'], ['Catalog age', '2m'], ['Context fit', fit], ['Capacity note', PMU.clock.text(r[4])], ['Price word', r[2]]] };
    }, inspect: function () { var x = fx(); return C.insp(r[0], [['State', r[1]], ['Underlying route', x.provider], ['Price', x.price + ' · ' + x.priceSource + ' (no metered charge does not imply a free entitlement)'], ['Context window', r[3]], ['Capacity', x.capacity + ' · ' + x.capacitySource], ['Note', PMU.clock.text(r[4])], ['Eligibility', x.eligibility], ['Catalog age', '2m']]); } });
  });
  def('free-route', 'free', { meta: function () { return 'free routes in fallback order'; }, model: function () {
    return { rows: DATA.free.map(function (r, i) { return { name: (i + 1) + '. ' + r[0], sub: r[1] + ' · ' + PMU.clock.text(r[4]), value: r[3], note: r[2] === 'local' ? '$0 · local' : '$0 · catalog', glyph: /Cooldown/.test(r[1]) ? 'hourglass' : 'checkCircle', tone: /Cooldown/.test(r[1]) ? 'warn' : null }; }) };
  } });
  def('cooldown-eligibility', 'free', { meta: function () { return 'free-route state · retry rules'; }, model: function () {
    return { rows: DATA.free.map(function (r) { var cool = /Cooldown/.test(r[1]); return { name: r[0], sub: r[3] + ' context · ' + (r[2] === 'local' ? 'local' : '$0 · catalog'), value: cool ? 'wait ' + PMU.clock.until('16:48') : 'eligible', tone: cool ? 'warn' : 'good', note: PMU.clock.text(r[4]) }; }) };
  } });
  def('free-throughput', 'free', { meta: function () { return '2-hour buckets · 24 hours · free and local routes'; }, model: function () {
    var S = D.series('freeThroughput24h'), n = S.requests.length, now = Date.now(), x = [];
    for (var i = 0; i < n; i++) x.push(now - (n - i) * S.bucket_min * 60000);
    return { chart: 'line', spec: { x: x, series: [{ name: 'Requests', idx: 1, values: S.requests }], unit: 'count', unitTitle: 'REQUESTS' }, headline: { value: 188, fmt: 'int', label: 'free-route requests' },
      spark: { values: S.requests, idx: 1 }, facts: [['Requests', '188'], ['Tokens', '1.42M'], ['Cooldowns', '1'], ['Local share', '23%'], ['Ready routes', '3'], ['Blocked', '0']],
      note: 'Provider free allowances and local inference are separated from paid usage.' };
  } });
  def('free-history', 'free', { meta: function () { return 'Daily · 7 days · free routes'; }, model: function () {
    var S = D.series('freeHistory7d'), today = new Date(); today.setHours(0, 0, 0, 0);
    var x = S.calls.map(function (v, i) { return today.getTime() - (S.calls.length - 1 - i) * 86400000; });
    return { chart: 'line', spec: { x: x, series: [{ name: 'Calls', idx: 4, values: S.calls }], unit: 'count', unitTitle: 'CALLS' }, headline: { value: 318, fmt: 'int', label: 'calls in 7 days' }, spark: { values: S.calls, idx: 4 },
      facts: [['Calls', '318'], ['Tokens', '2.4M'], ['Avoided', '$31.20 est.'], ['Cooldowns', '4']], note: 'No metered charge does not imply a free entitlement; billing and entitlement remain separate axes.' };
  } });
  def('free-source-state', 'free', { meta: function () { return 'catalog versus local'; }, model: function () {
    return { rows: [
      { name: 'Provider free allowance', sub: 'remote catalog and receipts', value: '3 routes', note: 'catalog age 2m' },
      { name: 'Local inference', sub: 'device-reported capacity', value: '1 route', note: 'RX 7900 XTX' },
      { name: 'Cooldown authority', sub: 'provider reset clock', value: '1 active', tone: 'warn', note: 'Qwen3-Coder-Free' },
      { name: 'Unknown eligibility', sub: 'no usable probe result', value: '0', note: 'not treated as zero' }] };
  } });

  /* ================================================================== Context */
  def('ctx-window', 'context', { kind: 'context', meta: function () { return 'thread main · app-level view'; }, model: function () { return C.contextModel(); }, inspect: function () { return C.contextInspect(); } });
  def('ctx-cache', 'context', { title: 'Context cache read share', short: 'Cache read share', meta: function () { return 'current thread · not a hit rate'; }, model: function () {
    var X = DATA.context;
    return { value: X.cache, fmt: 'pct1', delta: { v: 2.1, goodWhen: 'up' }, sub: 'read share of the current thread · route ' + b('Claude'),
      facts: [['Input', F.tok(X.input)], ['Output', F.tok(X.output)], ['Route', 'Claude'], ['Age', '20s'], ['Savings', '$1.82 est.', { tone: 'good' }]], foot: 'Savings · $1.82 est.' };
  } });
  def('ctx-reclaim', 'context', { meta: function () { return 'current thread'; }, model: function () {
    var X = DATA.context;
    return X.compacted ? { text: '0', sub: 'no tokens currently reclaimable · compaction done', facts: [['Pinned', F.tok(X.pinned)], ['Mutable', F.tok(X.mutable)], ['Reserve', F.tok(X.reserved)], ['Last compact', X.last_compact]] }
      : { value: X.reclaim, fmt: 'tok', sub: 'tokens reclaimable · ' + b('safe'), facts: [['Pinned', F.tok(X.pinned)], ['Mutable', F.tok(X.mutable)], ['Reserve', F.tok(X.reserved)], ['Last compact', X.last_compact + ' ago'], ['Result', F.tok(X.used - X.reclaim) + ' used after']] };
  } });
  def('ctx-output', 'context', { meta: function () { return 'current thread · capability snapshot'; }, model: function () {
    var X = DATA.context;
    return { value: X.reserved, fmt: 'tok', sub: 'tokens held for the response · ' + b((100 * X.reserved / X.limit).toFixed(1) + '%') + ' of the window',
      facts: [['Window', F.tok(X.limit)], ['Loaded', F.tok(X.used)], ['Available', F.tok(X.limit - X.used)], ['Hard stop', '112k'], ['Model', 'Sonnet 4.6']], foot: 'Current model · Sonnet 4.6' };
  } });
  def('ctx-route', 'context', { meta: function () { return 'current thread · requested versus effective'; }, model: function () {
    return { text: 'Sonnet 4.6', tone: 'warn', sub: 'requested ' + b('Opus 4.6') + ' unavailable · fallback',
      facts: [['Requested', 'Opus 4.6'], ['Effective', 'Sonnet 4.6'], ['Reason', 'rate limited'], ['Cache', 'reused'], ['Receipt', 'recorded']], foot: 'Receipt · recorded' };
  } });
  def('ctx-sources', 'context', { meta: function () { return F.tok(DATA.context.used) + ' tokens · by source family'; }, model: function () {
    var X = DATA.context;
    return { rows: X.labels.map(function (l, i) { var tk = Math.round(X.used * X.segments[i] / 100); return { id: l, name: l, role: i === 0 ? 'conversation history' : 'loaded context', value: tk, valueText: F.tok(tk), share: X.segments[i], idx: i }; }),
      foot: 'Share of the current context window by source family.' };
  } });
  def('ctx-limits', 'context', { meta: function () { return 'effective routes · capability snapshot'; }, model: function () {
    return { rows: [
      { id: 'sonnet', name: 'Sonnet 4.6', role: 'current · 16k output reserve', value: 128000, valueText: '128k', mark: 'claude-code', vendor: 'anthropic' },
      { id: 'gpt', name: 'GPT-5.4', role: 'fallback · 32k output reserve', value: 200000, valueText: '200k', mark: 'openai-codex', vendor: 'openai' },
      { id: 'qwen', name: 'Qwen3 Coder', role: 'long context', value: 256000, valueText: '256k', mark: 'qwen-coding', vendor: 'alibaba' },
      { id: 'gem', name: 'Gemini 3.1 Pro', role: 'vision helper', value: 1000000, valueText: '1M', mark: 'gemini-direct', vendor: 'google' }], foot: 'Window sizes from the capability snapshot; output reserves where the route sets one.' };
  } });
  def('context-composition', 'context', { meta: function () { return 'current thread'; }, model: function () {
    var X = DATA.context, sub = ['conversation turns', 'system and goal instructions', 'tool results and schemas', 'loaded skills', 'durable memory'];
    return { segments: X.labels.map(function (l, i) { var tk = Math.round(X.used * X.segments[i] / 100); return { name: l, value: tk, valueText: F.tok(tk), idx: i, sub: sub[i] }; }), total: X.used, fmt: 'tok' };
  } });
  def('ctx-maint', 'context', { meta: function () { return 'last 24h · never billed usage'; }, model: function () {
    return { rows: [{ name: 'Context compacted', sub: '18.6k reclaimed', value: '15:47', note: 'automatic threshold' }, { name: 'Model switch repack', sub: 'cache rebuilt', value: '13:22', note: 'route change' },
      { name: 'Local prune', sub: '4.2k reclaimed', value: '10:04', note: 'tool transcript' }, { name: 'Pinned refresh', sub: 'instructions updated', value: '08:40', note: 'policy refresh' }].map(function (r) {
        return Object.assign({}, r, { value: PMU.clock.clock(r.value), hover: PMU.clock.ago(r.value) + ' · ' + r.note }); }) };
  } });
  def('ctx-routing', 'context', { meta: function () { return 'requested versus effective'; }, model: function () {
    return { rows: [{ name: 'Requested model', sub: 'thread preference', value: 'Claude Opus 4.6' }, { name: 'Effective model', sub: 'rate-limit fallback', value: 'Claude Sonnet 4.6', tone: 'warn' },
      { name: 'Output reserve', sub: 'response budget', value: '16k' }, { name: 'Cache disposition', sub: 'prefix reused · provider reading', value: '96.8%', note: 'read share' }] };
  } });
  def('compaction-history', 'context', { meta: function () { return 'current thread · compaction is not billed usage'; }, model: function () {
    return { rows: [{ name: PMU.clock.clock('15:47'), sub: 'automatic threshold compaction', value: '18.6k', note: 'messages and tool results' }, { name: PMU.clock.clock('13:22'), sub: 'manual Compact Now', value: '9.4k', note: 'no pinned context removed' },
      { name: 'Yesterday', sub: 'handoff compaction', value: '31.2k', note: 'goal state retained' }, { name: 'Reserved output', sub: 'current route guarantee', value: '16k', note: 'not reclaimable' }] };
  } });

  /* ================================================================== Analytics (A1 9) */
  var TKN = { input: 'Input', output: 'Output', reasoning: 'Reasoning', cacheWrite: 'Cache write', cacheRead: 'Cache read' };
  def('an-totals', 'analytics', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · ' + D.scopeText(); }, aside: function (ctx) { return ctx.state.range + ' · ' + D.scopeText(); }, model: function () {
    var tk = D.tokens(), c = D.costs(), vt = D.valueByType();
    var cacheV = vt.cacheRead + vt.cacheWrite;
    return { cells: [
      { label: 'Total tokens', value: tk.totals.all, fmt: 'tok', sub: b(F.tok(tk.totals.input)) + ' in · ' + b(F.tok(tk.totals.output + tk.totals.reasoning)) + ' out · ' + b(F.tok(tk.totals.cacheRead + tk.totals.cacheWrite)) + ' cache',
        subShort: b(F.tok(tk.totals.input + tk.totals.output + tk.totals.reasoning)) + ' in + out · ' + b(F.tok(tk.totals.cacheRead + tk.totals.cacheWrite)) + ' cache',
        hover: 'Reasoning ' + F.tok(tk.totals.reasoning) + ' is inside out · token series, ' + tk.buckets.label.toLowerCase() },
      { label: 'Estimated value', key: { line: 'cost' }, value: c.selected, fmt: 'money', sub: b(money(c.settled)) + ' settled · ' + b(money(c.plan)) + ' plan estimate', subShort: b(money(c.settled)) + ' settled · ' + b(money(c.plan)) + ' est.', hover: 'Recorded attempts · PM estimate for plan work, never $0.00 for covered work' },
      { label: 'Cache tokens', key: { half: ['cw', 'cr'] }, value: tk.totals.cacheRead + tk.totals.cacheWrite, fmt: 'tok', sub: b(money(cacheV)) + ' cache value · ' + b(vt.total ? Math.round(100 * cacheV / vt.total) + '%' : '-') + ' of value', subShort: b(money(cacheV)) + ' value · ' + b(vt.total ? Math.round(100 * cacheV / vt.total) + '%' : '-'), hover: 'PM estimate · catalog pricing' },
      { label: 'Input value', key: { swatch: 'in' }, value: vt.input, fmt: 'money', sub: b(F.tok(tk.totals.input)) + ' uncached input tokens', subShort: b(F.tok(tk.totals.input)) + ' uncached in', hover: 'PM estimate · catalog pricing' },
      { label: 'Output value', key: { swatch: 'out' }, value: vt.output + vt.reasoning, fmt: 'money', sub: b(F.tok(tk.totals.output)) + ' output · ' + b(F.tok(tk.totals.reasoning)) + ' reasoning', subShort: b(F.tok(tk.totals.output + tk.totals.reasoning)) + ' out incl. reasoning', hover: 'PM estimate · catalog pricing' }] };
  } });
  ['claude', 'codex', 'qwen', 'gemini', 'kimi', 'copilot'].forEach(function (id) {
    def('tok-' + id, 'analytics', { title: function () { return legName(id); }, mark: PMU.roster.legacyProvider(id), prov: PMU.roster.legacyProvider(id),
      meta: function (ctx) { return legName(id) + ' tokens · ' + D.rangeLabel(ctx.state.range); }, model: function (ctx) {
        if (!D.inScope(id)) return { vs: 'unknown', word: 'Not in scope', sub: 'outside the selected scope' };
        var p = DATA.providers.filter(function (x) { return x.id === id; })[0];
        var by = (D.series('tokensByProvider') || {})[ctx.state.range] || {};
        var tok = D.sum(by[id] || []);
        var c = D.costs().byProvider[id] || { attempts: 0, requests: 0 };
        /* the in / out / calls split is the provider's 24-hour reading: at any other range it says so (REVIEW-jared 4) */
        var day = ctx.state.range === '24h', pre = day ? '' : '<span class="pmu-cap">24H</span> ';
        return { value: tok, fmt: 'tok', sub: pre + b(F.tok(p.input)) + ' in · ' + b(F.tok(p.output)) + ' out · ' + b(p.requests) + ' calls', subText: F.tok(p.input) + ' in · ' + F.tok(p.output) + ' out · ' + p.requests + ' calls (24h reading)',
          facts: [['Input (24h)', F.tok(p.input)], ['Output (24h)', F.tok(p.output)], ['Attempts', String(c.attempts)], ['Requests', String(c.requests)], ['Output ratio', (100 * p.output / p.tokens).toFixed(1) + '%'],
            ['Authority', p.allowance_authority + ' · ' + p.allowance_freshness]], spark: by[id] ? { values: by[id], vendor: PMU.markOf(PMU.roster.legacyProvider(id)).vendor, idx: 0 } : null };
      } });
  });
  def('token-trend', 'analytics', { meta: function (ctx) {
    var tk = D.tokens(), c = D.costs();
    return tk.buckets.label + ' · tokens left axis, estimated cost right axis' + (ctx && ctx.tier && ctx.tier.w === 'xl' ? ' · ' + c.attempts + ' attempts · ' + c.providers + ' providers' : '');
  }, config: [{ id: 'split', label: 'Token types', value: 'off', options: [{ value: 'off', label: 'One area', sub: 'Tokens without cache reads' }, { value: 'on', label: 'Token types', sub: 'Stacked bands by token type' }] },
    { id: 'cacheReads', label: 'Cache reads', value: 'off', options: [{ value: 'off', label: 'Hidden', sub: 'Cache reads dwarf the other types, so they start hidden' }, { value: 'on', label: 'Shown' }] }],
  model: function (ctx) {
    var tk = D.tokens(), cost = D.costLine();
    var split = C.cfg(ctx.id, 'split', 'off') === 'on', cr = C.cfg(ctx.id, 'cacheReads', 'off') === 'on';
    var tools = '<span data-key="split">' + C.switchBtn('tt-split', split, 'Token types', 'Stack the bands by token type') + '</span>' +
      '<span data-key="cacheReads">' + C.switchBtn('tt-cr', cr, 'Cache reads', 'Cache reads dwarf the other types, so they start hidden') + '</span>';
    return { chart: 'area', sig: (split ? 's' : '') + (cr ? 'c' : ''), tools: tools, toolsMin: 'm',
      spec: { x: tk.x, unit: 'tokens', split: split, cacheReads: cr, now: Date.now(), peak: true, bucketMs: tk.buckets.bucketMs,
        series: [{ name: 'Input', tk: 'in', values: tk.input }, { name: 'Output', tk: 'out', values: tk.output }, { name: 'Reasoning', tk: 'rsn', values: tk.reasoning }, { name: 'Cache write', tk: 'cw', values: tk.cacheWrite }, { name: 'Cache read', tk: 'cr', values: tk.cacheRead }],
        cost: { values: cost.values, unit: 'usd' }, source: 'token series · estimated cost from recorded attempts', notes: 'Input and output are summed only from selected identity-bound attempts.',
        readoutFoot: function (i) {
          var sp = cost.split[i] || {}, ks = Object.keys(sp).filter(function (k) { return k !== '_pending'; });
          var out = ks.map(function (k) { return legName(k).replace('ChatGPT / ', '') + ' ' + money(sp[k]); });
          if (sp._pending) out.push(sp._pending + (sp._pending === 1 ? ' receipt' : ' receipts') + ' pending, value not known yet');
          return out.length ? out.join(' · ') : 'no attempts recorded in this bucket';
        } },
      headline: { value: cr ? tk.totals.all : tk.totals.noCache, fmt: 'tok', label: cr ? 'tokens' : 'tokens without cache reads' }, spark: { values: tk.noCache, tk: 'all' },
      facts: [['Input', F.tok(tk.totals.input)], ['Output', F.tok(tk.totals.output)], ['Cache read', F.tok(tk.totals.cacheRead)], ['Peak', peakText(tk, cr)]],
      note: 'Input and output are summed only from selected identity-bound attempts; the cost line is recorded value (settled + plan estimate).' };
  } });
  /* the Peak fact is the chart's own peak: the same series (cache reads only when shown), the same bucket, the same
     time words (a sub-day bucket in a multi-day range names its day) */
  function peakText(tk, cr) {
    var vals = cr ? tk.all : tk.noCache, best = -1;
    vals.forEach(function (v, i) { if (v != null && (best < 0 || v > vals[best])) best = i; });
    if (best < 0) return '-';
    var x = tk.x[best], bm = tk.buckets.bucketMs, multi = tk.x.length > 1 && tk.x[tk.x.length - 1] - tk.x[0] >= 86400000;
    var dayWord = PMU.charts && PMU.charts.time ? PMU.charts.time.day(x) : F.day(x);
    return (bm >= 86400000 ? F.date(x) : (multi ? dayWord + ' ' : '') + F.clock(x)) + ' · ' + F.tok(vals[best]);
  }
  C.act('tt-split', function (el, id) { C.setCfg(id, 'split', C.cfg(id, 'split', 'off') === 'on' ? 'off' : 'on'); });
  C.act('tt-cr', function (el, id) { C.setCfg(id, 'cacheReads', C.cfg(id, 'cacheReads', 'off') === 'on' ? 'off' : 'on'); });
  def('model-mix', 'analytics', { meta: function (ctx) { return 'Estimated cost by token type · ' + D.rangeLabel(ctx.state.range) + ' · select a model for detail'; }, model: function () { return { rows: D.models() }; } });
  def('an-model-donut', 'analytics', { meta: function (ctx) { return 'Share of ' + (C.cfg('an-model-donut', 'mode', 'tokens') === 'cost' ? 'estimated cost' : 'tokens') + ' · ' + D.rangeLabel(ctx.state.range) + ' · recorded attempts'; },
    config: [{ id: 'mode', label: 'Measure', value: 'tokens', options: [{ value: 'tokens', label: 'Tokens' }, { value: 'cost', label: 'Cost' }] }], model: function () { return { rows: D.models() }; } });
  def('an-token-breakdown', 'analytics', { meta: function (ctx) { return 'Share of tokens and of estimated cost · ' + D.rangeLabel(ctx.state.range); }, model: function () {
    var tk = D.tokens(), vt = D.valueByType();
    var keys = ['input', 'output', 'reasoning', 'cacheWrite', 'cacheRead'], TKK = { input: 'in', output: 'out', reasoning: 'rsn', cacheWrite: 'cw', cacheRead: 'cr' };
    var tokAll = tk.totals.all || 1, valAll = vt.total || 1;
    return { rows: keys.map(function (k) { return { type: TKK[k], name: TKN[k], tokens: tk.totals[k], tokenShare: 100 * tk.totals[k] / tokAll, value: vt[k], valueShare: 100 * vt[k] / valAll,
      tokensText: F.tok(tk.totals[k]), valueText: money(vt[k]) }; }),
      foot: 'Five disjoint buckets: cache split out of inclusive input, reasoning out of inclusive output. Cost by type is a PM estimate at catalog rates.' };
  } });
  def('cache-read-share', 'analytics', { meta: function (ctx) { return 'Read share and savings · ' + D.rangeLabel(ctx.state.range) + ' · PM estimate, catalog pricing'; }, model: function () {
    var tk = D.tokens(), c = D.costs(), vt = D.valueByType(), cd = D.series('cacheDaily30');
    var read = tk.totals.cacheRead, write = tk.totals.cacheWrite;
    return { read: read, write: write, share: read + write ? 100 * read / (read + write) : 0, savings: c.cache, cost: vt.cacheRead + vt.cacheWrite, costRead: vt.cacheRead, costWrite: vt.cacheWrite,
      spark: cd.read.map(function (r, i) { return Math.round(1000 * r / (r + cd.write[i])) / 10; }),
      notes: ['Read share is cache reads divided by cache reads plus cache writes. It is not a hit rate.', 'Cache fields are explicit facts on selected attempt fixtures.'] };
  } });
  def('activity-heat', 'analytics', { meta: function () { return (C.cfg('activity-heat', 'mode', 'tokens') === 'cost' ? 'Estimated cost' : 'Tokens') + ' per hour, local time · last 7 days · range does not apply'; },
    config: [{ id: 'mode', label: 'Measure', value: 'tokens', options: [{ value: 'tokens', label: 'Tokens' }, { value: 'cost', label: 'Cost', sub: 'Settled plus plan estimate per hour' }] }] });
  def('an-daily-cost', 'analytics', { meta: function (ctx) { var r = ctx.state.range; return 'Settled charges and plan estimates, USD · ' + (r === '30d' ? '28 days of this month' : 'last 7 days') + (r === '5h' || r === '24h' ? ' · daily (no hourly split by provider is recorded)' : ''); },
    model: function (ctx) {
      var dp = D.dailyByProvider(ctx.state.range);
      return { labels: dp.labels, stacks: dp.stacks, totals: dp.totals, unit: 'usd', emptyText: 'No value recorded in this range.',
        caption: '<span class="pmu-cap">SETTLED</span> <b>' + esc(money(dp.settled)) + '</b> · <span class="pmu-cap">PLAN ESTIMATE</span> <b>' + esc(money(dp.estimate)) + '</b>' };
    } });
  def('reasoning-mix', 'analytics', { meta: function (ctx) { return 'Visible output and reasoning · ' + D.tokens().buckets.label.toLowerCase() + ' · reported buckets'; }, model: function () {
    var tk = D.tokens();
    return { chart: 'area', spec: { x: tk.x, unit: 'tokens', stacked: true, now: Date.now(), series: [{ name: 'Visible output', tk: 'out', values: tk.output }, { name: 'Reasoning', tk: 'rsn', values: tk.reasoning }] },
      headline: { value: tk.totals.reasoning, fmt: 'tok', label: 'reasoning tokens' }, spark: { values: tk.reasoning, tk: 'rsn' },
      facts: [['Visible output', F.tok(tk.totals.output)], ['Reasoning', F.tok(tk.totals.reasoning)], ['Unknown', '2 routes'], ['Coverage', '67%'], ['Inclusive', '4 providers'], ['Additive', '0'], ['Attempts', String(D.costs().attempts)]],
      note: 'Reasoning is an explicit fixture field and is not added to inclusive output.' };
  } });
  def('an-quota-history', 'analytics', { kind: 'qhist', meta: function () { return C.qhistMeta(); }, model: function () { return D.quotaRows(); } });
  def('an-resets', 'analytics', { kind: 'agenda', horizon: '30d', meta: function (ctx) { return C.agendaMeta(ctx, '30d'); }, config: [C.horizonCfg('30d')] });
  def('token-counting-basis', 'analytics', { meta: function () { return 'provider semantics · never added twice'; }, model: function () {
    return { rows: [{ name: 'Inclusive input', sub: 'cache read inside input', value: '4 routes', note: 'never added twice' }, { name: 'Additive cache', sub: 'cache beside input', value: '1 route', tone: 'warn', note: 'Qwen Coding Plan' },
      { name: 'Inclusive reasoning', sub: 'reasoning inside output', value: '3 routes', note: 'split out for the buckets' }, { name: 'Additive reasoning', sub: 'reasoning beside output', value: '1 route', tone: 'warn', note: 'Qwen Coding Plan' },
      { name: 'Unpublished basis', sub: 'provider does not say', value: '1 route', tone: 'warn', note: 'total labeled partial' }, { name: 'Missing provider count', sub: 'no token figure', value: '4 events', tone: 'warn', note: 'excluded from total' }] };
  } });
  def('unknown-token-buckets', 'analytics', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · unknown is never zero'; }, model: function () {
    return { text: '4', unit: ' events', sub: 'with unknown token buckets · ' + b('not zero'), facts: [['Input unknown', '1'], ['Output unknown', '1'], ['Cache unavailable', '2'], ['Reasoning unknown', '4'], ['Partial totals', '3'], ['Excluded totals', '4'],
      ['Selected records missing facts', '0 · fail-closed append']], foot: 'Policy · preserve unknown' };
  } });

  /* ================================================================== Ledger */
  var HUMAN = { 'run.started': 'Run started', 'route.selected': 'Route selected', 'context.compacted': 'Context compacted', 'provider.fallback': 'Provider fallback', 'cache.hit': 'Prompt cache hit', 'limit.warning': 'Allowance warning', 'run.completed': 'Run completed' };
  var GLY = { 'run.started': 'pulse', 'route.selected': 'link', 'context.compacted': 'layers', 'provider.fallback': 'refresh', 'cache.hit': 'check', 'limit.warning': 'alert', 'run.completed': 'checkCircle' };
  function setGlyph(s) { return /pending/.test(s) ? C.vs('pending', 'Pending receipt') : /adjusted/.test(s) ? C.vs('adjusted', 'Adjusted') : C.vs('settled', 'Settled'); }
  C.openAttempt = function (a, opener) {
    var bk = D.attemptBuckets(a), row = function (k, v) { return [k, esc(v == null || v === '' ? '-' : v)]; };
    var basis = (D.series('countingBasis') || {})[a.provider_id] || {};
    PMU.inspector.open({ kind: 'attempt', title: 'Usage attempt ' + a.attempt_id, subtitle: legName(a.provider_id) + ' · ' + (F.dayHead(new Date(a.occurred_at).getTime()).note + ' ' + F.clock(new Date(a.occurred_at).getTime())), sections: [
      { title: 'Attempt', rows: [row('Timestamp', F.dayHead(new Date(a.occurred_at).getTime()).note + ' ' + F.clock(new Date(a.occurred_at).getTime()) + ' · ' + a.occurred_at), row('Usage event ref', a.usage_event_ref), row('Usage record id', a.usage_record_id), row('Attempt id', a.attempt_id), row('Provider attempt ref', a.provider_attempt_ref),
        row('Provider / installation', a.provider_id + ' · ' + a.installation_id), row('Account / connection', a.account_id + ' · ' + a.connection_id), row('Product / model', a.product_id + ' · ' + a.model_id), row('Tool', a.tool_id)] },
      { title: 'Token buckets', rows: [row('Input (uncached)', F.num(bk.in)), row('Cache read', F.num(bk.cr)), row('Cache write', F.num(bk.cw)), row('Output (visible)', F.num(bk.out)), row('Reasoning', F.num(bk.rsn)),
        row('Reported input', F.num(a.input_tokens) + ' · cache ' + (basis.cache || 'inclusive')), row('Reported output', F.num(a.output_tokens) + ' · reasoning ' + (basis.reasoning || 'inclusive')), row('Requests', String(a.request_count))] },
      { title: 'Route and settlement', rows: [row('Requested route', a.requested_route_id), row('Effective route', a.effective_route_id), row('Billing basis', a.billing_basis), row('Entitlement', a.entitlement_class),
        row('Settlement status', a.settlement_status), row('Settlement authority', a.settlement_authority)] },
      { title: 'Source', rows: [row('Class', a.source_class), row('Confidence', a.source_confidence), row('Authority', a.source_authority), row('Freshness', a.projection_freshness), row('Health', a.projection_health)] },
      { title: 'Value', rows: [row('Charge', a.charge > 0 || a.charge_authority !== 'not applicable to subscription attempt' ? money(a.charge) + ' · ' + a.charge_authority : 'Not applicable · covered by subscription'),
        row('Plan allocation estimate', a.plan_allocation_estimate > 0 ? money(a.plan_allocation_estimate) + ' · ' + a.plan_allocation_authority : 'Not applicable · ' + a.plan_allocation_authority),
        row('Cache avoided estimate', money(a.cache_avoided_estimate) + ' · ' + a.cache_avoided_authority), row('Tool latency', (a.tool_latency_ms / 1000).toFixed(1) + 's'), row('Tool errors', String(a.tool_error_count)), row('Anomaly score', String(a.anomaly_score))] }
    ], raw: a }, opener);
  };
  def('ledger-count', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · selected records'; }, model: function () {
    var c = D.costs(), acc = {}; D.attempts().forEach(function (a) { acc[a.account_id] = 1; });
    return { value: c.attempts, fmt: 'int', sub: 'identity-bound usage attempts', facts: [['Settled', String(c.settledAttempts)], ['Pending', String(c.pending), c.pending ? { tone: 'warn' } : {}], ['Providers', String(c.providers)], ['Accounts', String(Object.keys(acc).length)]],
      foot: 'Projection · selected records' };
  } });
  def('ledger-errors', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · receipts not final'; }, model: function () {
    var c = D.costs();
    return { value: c.pending, fmt: 'int', tone: c.pending ? 'warn' : null, sub: 'attempt receipts not final · ' + b(c.pending ? 'open' : 'clear'), facts: [['Pending', String(c.pending)], ['Unknown', '0'], ['Inferred', '0'], ['Dropped', '0']], foot: 'Policy · preserve state' };
  } });
  def('ledger-routes', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · effective route identity'; }, model: function () {
    var r = {}, acc = {}, c = D.costs(); D.attempts().forEach(function (a) { r[a.effective_route_id] = 1; acc[a.account_id] = 1; });
    return { value: Object.keys(r).length, fmt: 'int', sub: 'stable effective route identities', facts: [['Providers', String(c.providers)], ['Accounts', String(Object.keys(acc).length)], ['Attempts', String(c.attempts)], ['Unknown', '0']], foot: 'Coverage · 100%' };
  } });
  def('settlement-states', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · independent receipt state'; }, model: function () {
    var c = D.costs(), st = c.statuses, keys = Object.keys(st);
    if (!keys.length) return { segments: [], empty: 'No attempts · selected scope and range', emptyFacts: '0 · no settlement inferred' };
    var idx = { settled: 1, 'pending provider receipt': 2, 'adjusted and settled': 3 };
    return { headline: { value: st.settled || 0, fmt: 'int', label: 'of ' + c.attempts + ' attempts settled' }, segments: keys.map(function (k) { return { name: k.charAt(0).toUpperCase() + k.slice(1), value: st[k], valueText: st[k] + ' attempts', idx: idx[k] != null ? idx[k] : 7, sub: 'independent attempt receipt state' }; }), fmt: 'int', total: c.attempts };
  } });
  def('ledger-main', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · newest first · select a row for the attempt'; }, model: function () {
    var list = D.attempts().slice().sort(function (a, c) { return new Date(c.occurred_at) - new Date(a.occurred_at); });
    var names = D.series('models') || {};
    return { toolbar: { search: 'Search attempts', export: function () { if (window.PM7_USAGE) window.PM7_USAGE.exportJson('ledger'); },
      filters: [{ id: 'prov', label: 'Provider', options: DATA.providers.map(function (p) { return { value: p.id, label: legName(p.id), mark: PMU.roster.legacyProvider(p.id) }; }) },
        { id: 'set', label: 'Settlement', options: [{ value: 'settled', label: 'Settled' }, { value: 'pending provider receipt', label: 'Pending receipt' }, { value: 'adjusted and settled', label: 'Adjusted' }] }] },
      cols: [{ id: 'time', label: 'TIME', w: '62px', mono: true }, { id: 'id', label: 'ATTEMPT', w: 'minmax(64px,.8fr)', mono: true }, { id: 'prov', label: 'PROVIDER', w: 'minmax(96px,1.2fr)' },
        { id: 'model', label: 'MODEL', w: 'minmax(90px,1fr)', min: 'l' }, { id: 'io', label: 'IN / OUT', w: '96px', align: 'right', min: 'l' }, { id: 'acct', label: 'ACCOUNT', w: 'minmax(96px,1fr)', min: 'xl' },
        { id: 'plat', label: 'PLATFORM', w: '80px', min: 'xl' }, { id: 'op', label: 'OPERATION', w: 'minmax(90px,1fr)', min: 'xl' }, { id: 'val', label: 'VALUE', w: '78px', align: 'right' }, { id: 'set', label: 'SETTLEMENT', w: 'minmax(110px,1fr)', min: 'm' }],
      rows: list.map(function (a) {
        var t = new Date(a.occurred_at), m = names[a.model_id] || { name: a.model_id };
        var v = (a.charge || 0) + (a.plan_allocation_estimate || 0);
        return { tone: /pending/.test(a.settlement_status) ? 'warn' : null, match: { prov: a.provider_id, set: a.settlement_status },
          cells: { time: (t.getHours() < 10 ? '0' : '') + t.getHours() + ':' + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes(), id: a.attempt_id, prov: { html: PMU.mark(PMU.roster.legacyProvider(a.provider_id), 16) + ' ' + esc(legName(a.provider_id)) },
            model: m.name, io: F.tok(a.input_tokens) + ' / ' + F.tok(a.output_tokens), acct: (PMU.roster.byLegacy(a.account_id) || {}).nickname || a.account_id.replace(/^account:/, ''), plat: 'desktop', op: a.tool_id,
            val: { html: /pending/.test(a.settlement_status) && !v ? C.vs('pending', 'pending') : esc(money(v)) + (a.charge ? '' : ' <em>est.</em>') }, set: { html: setGlyph(a.settlement_status) } },
          hover: [a.attempt_id, a.usage_event_ref + ' · ' + a.provider_id + ' · ' + a.model_id + ' · ' + a.settlement_status],
          onClick: function (el) {
            command('cmd.nav.open_usage_subject', { route_target: { object_kind: 'usage_attempt', object_id: a.attempt_id }, attempt_id: a.attempt_id, usage_event_ref: a.usage_event_ref, usage_record_id: a.usage_record_id,
              provider_attempt_ref: a.provider_attempt_ref, provider_id: a.provider_id, account_id: a.account_id, source_class: a.source_class, source_confidence: a.source_confidence, source_authority: a.source_authority,
              settlement_status: a.settlement_status, projection_freshness: a.projection_freshness, projection_health: a.projection_health }, { opened: true });
            C.openAttempt(a, el);
          } };
      }), empty: 'No attempts for the selected scope and range', emptyFacts: 'Unknown is never shown as zero' };
  } });
  def('ledger-events', 'ledger', { meta: function () { return 'today · humanized usage events'; }, model: function () {
    return { rows: DATA.ledger.map(function (e) { var who = C.oldName(e[2]);
      return { name: HUMAN[e[1]] || e[1], sub: who + ' · ' + e[3], value: PMU.clock.ago(e[0]), note: e[1] + ' · ' + PMU.clock.clock(e[0]), glyph: GLY[e[1]] || 'list', tone: e[1] === 'limit.warning' ? 'warn' : null,
        hover: PMU.clock.clock(e[0]) + ' · ' + e[1] + ' · ' + who + ' · ' + e[3] }; }).reverse() };
  } });
  def('attempt-lineage', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · receipt chain'; }, model: function () {
    return { cols: [{ id: 'id', label: 'ATTEMPT', w: '76px', mono: true }, { id: 'who', label: 'PROVIDER · ACCOUNT', w: 'minmax(140px,2fr)' }, { id: 'route', label: 'EFFECTIVE ROUTE', w: 'minmax(120px,1.6fr)', min: 'm' }, { id: 'ref', label: 'EVENT REF', w: '80px', mono: true, min: 'l' }, { id: 'set', label: 'SETTLEMENT', w: 'minmax(100px,1.2fr)' }],
      rows: D.attempts().map(function (a) { return { cells: { id: a.attempt_id, who: C.acctName(a.account_id), route: a.effective_route_id, ref: a.usage_event_ref, set: { html: setGlyph(a.settlement_status) } }, onClick: function (el) { C.openAttempt(a, el); } }; }) };
  } });
  def('ledger-coverage', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · stable identity axes'; }, model: function () {
    var c = D.costs(), acc = {}; D.attempts().forEach(function (a) { acc[a.account_id] = 1; });
    return { value: c.attempts ? 100 : null, fmt: 'pct', vs: c.attempts ? null : 'unknown', word: 'No attempts in range', sub: 'attempts with all stable identity axes', facts: [['Attempts', String(c.attempts)], ['Providers', String(c.providers)], ['Accounts', String(Object.keys(acc).length)], ['Unknown route', '0']], foot: 'Authority · attempt fixture' };
  } });
  def('ledger-export', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · JSON export'; }, model: function () {
    var c = D.costs();
    return { value: c.attempts, fmt: 'int', sub: 'attempt records available · JSON', facts: [['Attempts', String(c.attempts)], ['Providers', String(c.providers)], ['Redacted', '0'], ['Missing axes', '0']],
      foot: '<button type="button" class="pmu-textbtn" data-pmu-act="ledger-export">Export selected records</button>' };
  } });
  C.act('ledger-export', function () { if (window.PM7_USAGE) window.PM7_USAGE.exportJson('ledger'); });
  def('usage-record-state', 'ledger', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · settlement lifecycle'; }, model: function () {
    var st = D.costs().statuses;
    return { rows: Object.keys(st).map(function (k) { return { name: k.charAt(0).toUpperCase() + k.slice(1), sub: 'attempt receipt authority', value: String(st[k]), note: 'never inferred from billing or entitlement' }; }), empty: 'No attempts in range', emptyFacts: 'No settlement inferred' };
  } });
})();
