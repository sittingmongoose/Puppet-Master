/* =====================================================================
   U11 — PRISM II · reusable run/agent detail surface (delta §3)
   ---------------------------------------------------------------------
   ONE inspector opened from the completion-capacity widget, the Runs &
   agents widget, activity summaries, or Ledger rows. It is a Usage
   inspector — never a second Orchestrator: it shows measured state,
   forecasts, lineage and timing, and links semantically to owners.
   Rendered as an editor-panel-sized docked panel so density can be
   judged before the PMConcept7 port.
   ===================================================================== */
(function () {
  'use strict';

  var panel = null, lastFocus = null, openId = null;

  function D() { return window.U11; }
  function T() { return window.U11time; }
  function fmt() { return window.USfmt; }
  function R() { return window.USrender; }
  function ic(n) { return window.USrender.ic(n); }

  var AUTH_LABEL = {
    cli_owned_profile: 'CLI-owned OAuth profile',
    pm_oauth: 'Puppet Master OAuth',
    api_key_secret_ref: 'API key · secret ref',
    vault_ref: 'Vault ref',
    environment_ref: 'Environment ref',
    local_endpoint: 'Local endpoint',
    no_auth: 'No auth · shared route'
  };
  var SURFACE_LABEL = {
    assistant_chat_goal: 'Assistant Chat · Goal Mode',
    planning_wizard: 'Planning Wizard / PRD Builder',
    orchestrator: 'Orchestrator · GoalRun',
    thread: 'Thread'
  };
  var KIND_LABEL = { goal: 'Goal', planning_run: 'Planning run', crew: 'Crew', thread_request: 'Thread request' };

  /* Which product actually paid. Carried alongside — never instead of —
     cost state and settlement, so a pack draw, an included call and a free
     call can never render as the same string (audit A03-07). */
  var ROUTE_LABEL = {
    plan_included: 'Included in plan',
    extra_balance: 'Extra usage balance',
    usage_pack: 'Usage pack',
    api_billed: 'Billed to the provider account',
    free: 'Free allowance',
    no_charge_observed: 'No charge observed',
    unknown: 'Billing route unknown'
  };
  var SETTLE_LABEL = {
    observed: 'observed', streaming_partial: 'partial stream', settled: 'settled',
    adjusted: 'adjusted after settling', failed: 'failed', unknown: 'unknown'
  };
  var SOURCE_LABEL = {
    provider_reported: 'reported by the provider', provider_header: 'read from a provider header',
    cli_reported: 'reported by the provider CLI', local_estimated: 'measured by Puppet Master',
    pricing_estimated: 'estimated from published prices', unknown: 'unknown'
  };
  var STREAM_LABEL = {
    started: 'started', partial: 'partial', final: 'final',
    error: 'error', aborted: 'aborted', unknown: 'unknown'
  };
  /* The eleven time kinds packet 03 keeps separate are NOT re-declared here.
     This panel used to carry its own table keyed on the run row's LABEL, and
     the moment the record split "Local tool/runtime time" into two measured
     rows the table stopped matching: every run still drew eleven bars while
     the summary claimed 8 of 11 and named three recorded kinds as missing.
     Coverage now comes from U11.timeKindCoverage(runId), which reads row.kind
     and the record's own notRecorded reasons (audit A06-09). */
  /* The eight admission reasons, in words. "pm policy" is an abbreviation of
     Puppet Master and never belongs in user copy (audit A09-11). */
  var QUEUED_LABEL = {
    provider_limit: 'provider limit',
    runtime_capacity: 'runtime capacity',
    pm_policy: 'Puppet Master policy',
    port_conflict: 'port conflict',
    file_writer_conflict: 'file writer conflict',
    host_resource_pressure: 'host resource pressure',
    waiting_for_update_repair: 'waiting for an update or repair',
    waiting_for_reset: 'waiting for a reset'
  };
  var QUEUED_WHY = {
    provider_limit: 'the provider limit was already reached',
    runtime_capacity: 'runtime capacity was full',
    pm_policy: 'Puppet Master policy holds it',
    port_conflict: 'a port it needs is in use',
    file_writer_conflict: 'another writer holds a file it needs',
    host_resource_pressure: 'the host is under resource pressure',
    waiting_for_update_repair: 'an update or repair is pending',
    waiting_for_reset: 'a reset is pending'
  };
  var MIN_MS = 60000;
  var SURFACE_MANAGER = {
    assistant_chat_goal: { manager: 'goals', label: 'Goals' },
    planning_wizard: { manager: 'planning', label: 'the Planning Wizard' },
    orchestrator: { manager: 'orchestrator', label: 'the Orchestrator' },
    thread: { manager: 'chat', label: 'the thread' }
  };

  /* ---------- honest money ----------
     A missing price is never a zero. The record's own cost state decides
     what may be shown: a BYOK or subscription-covered price is suppressed
     rather than invented (GUI-USG-004), an unknown price fails closed
     (GUI-USG-003), and a provider-reported zero stays a reported zero
     (GUI-USG-002). */
  function costText(a) {
    var st = a.costStatus || (a.costMicro == null ? 'unknown' : 'provider_reported');
    var pol = a.displayCostPolicy || 'unknown';
    if (a.hiddenByok || st === 'hidden_byok') return { text: 'price hidden · your own key pays it', cls: ' hid' };
    if (a.hiddenSubscription || st === 'hidden_subscription' || pol === 'subscription_covered') {
      return { text: 'no separate charge', cls: ' hid' };
    }
    if (pol === 'hide') return { text: 'price hidden by provider policy', cls: ' hid' };
    if (st === 'unknown' || pol === 'unknown' || a.costMicro == null) return { text: 'cost unknown', cls: ' unk' };
    if (a.costMicro === 0) return { text: fmt().cost(0) + ' reported', cls: '' };
    return { text: fmt().cost(a.costMicro / 1e6), cls: '' };
  }
  /* billing route + cost state as one line — four settlements, four strings.
     An attempt that never reached a provider states the route it asked for,
     not a route that paid for something (nothing was paid). */
  function moneyLine(a, noUsage) {
    var c = costText(a);
    var route = ROUTE_LABEL[a.billingRoute] || R().humanCap(a.billingRoute);
    return '<span class="u11rd-aroutelab">' + (noUsage ? 'Route asked for: ' + route : route) + '</span>' +
      '<span class="u11rd-acost' + c.cls + '">' + c.text + '</span>';
  }

  /* A forecast input is a range in a unit, not a sentence the data wrote
     for us. Cost goes through costText() above — the same five cases every
     other cost surface branches on — so a subscription-covered route can
     never come back as a fabricated $0.00 (GUI-USG-004). */
  function rangeText(pr) {
    if (pr.kind === 'cost') return costText(pr).text;
    if (pr.kind === 'tokens') {
      if (pr.lo == null) return 'not forecast';
      return fmt().tok(pr.lo) + '–' + fmt().tok(pr.hi) + ' tokens';
    }
    if (pr.kind === 'minutes') {
      if (pr.lo == null) return 'not forecast';
      return pr.lo + '–' + pr.hi + 'm';
    }
    return pr.route || 'not forecast';
  }

  /* Historical events resolve their identity from the snapshot the event
     itself preserved: today's registry must never re-label yesterday's
     usage (audit A02-04). Only events with no snapshot join live. */
  function acctIdentity(a, accountId) {
    var h = a && a.historicalIdentity;
    if (h && h.label && (!accountId || h.accountId === accountId)) return h.label;
    return D().accountLabel(accountId);
  }

  /* One reason per attempt, in the record's own words. routeReason is the
     canonical carrier; the older fields stay readable and are never
     printed twice when they repeat it (audit A02-06, A04-17, A10-09). */
  function reasonsOf(a) {
    var seen = {}, out = [];
    function add(text, tone) {
      if (!text || seen[text]) return;
      seen[text] = 1; out.push({ text: text, tone: tone || '' });
    }
    add(a.routeReason, 'warn');
    add(a.mismatch ? a.mismatch.reason : null, 'warn');
    if (!a.routeReason) add(a.fallbackReason, 'warn');
    add(a.failReason, 'err');
    add(a.discardedReason, 'warn');
    if (a.queuedReason) add('Queued because ' + (QUEUED_WHY[a.queuedReason] || R().human(a.queuedReason)) + '.', '');
    add(a.unknownReason ? 'Cost unknown — ' + a.unknownReason + '.' : null, '');
    return out;
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.className = 'u11rd';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Run and agent detail');
    document.body.appendChild(panel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('on')) close();
    });
    return panel;
  }

  function kv(label, value) {
    return '<div class="u11rd-kv"><span>' + label + '</span><b>' + value + '</b></div>';
  }
  function section(title, meta) {
    return '<div class="u11rd-sech">' + title + (meta ? '<span>' + meta + '</span>' : '') + '</div>';
  }
  /* a list of words read as a sentence, not as a comma run. Every member goes
     through R.human so an enum value can never reach the page with an
     underscore in it. */
  function listWords(list) {
    var words = (list || []).map(function (w) { return R().human(w); });
    if (words.length < 2) return words[0] || '';
    return words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
  }

  /* ---------- run view ---------- */
  function runHTML(runId) {
    var d = D();
    var run = d.runById[runId];
    if (!run) return '<div class="u11rd-empty">Run not found.</div>';
    var fc = run.forecastId ? d.forecastById[run.forecastId] : null;
    var kind = KIND_LABEL[run.kind] || run.kind;
    var html = '';

    html += '<div class="u11rd-idline"><span class="u11rd-kind">' + kind + '</span>' +
      '<span class="u11rd-status">' + R().human(run.status) + '</span></div>';
    html += '<div class="u11rd-grid">';
    html += kv('Owning surface', SURFACE_LABEL[run.owningSurface] || run.owningSurface);
    html += kv('Visibility', R().human(run.visibility));
    html += kv('Project', run.project);
    html += kv('Stage', run.stage);
    if (run.startedAt) html += kv('Started', T().atClock(run.startedAt));
    html += '</div>';

    /* admission: requested workers and required specialists are two
       different figures and never share a label (audit A06-14) */
    var req = run.requested.children != null ? run.requested.children : run.requested.members;
    var queued = run.queued.children != null ? run.queued.children : run.queued.members;
    html += section('Admission', 'Usage forecasts · Goal Runtime decides');
    html += '<div class="u11rd-admit">';
    html += '<div class="u11rd-admitline"><b>' + req + '</b> requested ' +
      (run.requested.children != null ? 'workers' : 'members') + '</div>';
    if (run.requested.specialistsRequired != null) {
      html += '<div class="u11rd-admitline"><b>' + run.requested.specialistsRequired +
        '</b> required specialists — still required when they run in waves</div>';
    } else {
      html += '<div class="u11rd-admitline dim">Required specialists are not stated for this run</div>';
    }
    html += '<div class="u11rd-admitline"><b>' + run.admitted.now + '</b> admitted now · effective concurrency ' + run.admitted.effectiveConcurrency + '</div>';
    html += '<div class="u11rd-admitline"><b>' + queued + '</b> queued · ' + run.queued.waves + ' waves</div>';
    html += '<div class="u11rd-admitline dim">Sustainable concurrency ' + run.admitted.sustainableConcurrency + '</div>';
    if (run.capacity) {
      var cap = run.capacity;
      html += '<div class="u11rd-grid">';
      html += kv('Hard max', cap.hardMax);
      html += kv('Configured preferred', cap.configuredPreferred);
      html += kv('Provider advertised', cap.providerAdvertised);
      html += kv('Effective now', cap.effectiveNow);
      html += kv('Predicted sustainable', cap.predictedSustainable);
      /* the sixth maximum: not what was allowed, what actually ran at the same
         instant. It is measured, so it is the one figure in this block that is
         not a forecast (audit A06-16). */
      html += kv('Most that ran at once', cap.actualPeak != null
        ? cap.actualPeak + (cap.actualPeakAt ? ' · ' + T().atClock(cap.actualPeakAt) : '')
        : '<i class="u11rd-unrec">not recorded</i>');
      html += '</div>';
      /* Reference canon item 20: the disclosure block states requested,
         admitted concurrently and the queued remainder AS A COMPLETION
         FORECAST. Without this line the adjacent hard maximum reads as the
         number of agents Puppet Master supports, which is the phrasing item 40
         forbids (audit A06-15). */
      html += '<div class="u11rd-admitline dim">Reason: completion forecast, not a hard provider concurrency limit. ' +
        'The hard maximum of ' + cap.hardMax + ' is Puppet Master’s own safety ceiling, and the admitted and ' +
        'sustainable figures are what this run is forecast to finish with.</div>';
      if (cap.actualPeak != null && cap.actualPeakBasis) {
        html += '<div class="u11rd-admitline dim">Most that ran at once is measured, not forecast — ' +
          cap.actualPeakBasis + '.</div>';
      }
    }
    html += reserveHTML(run);
    html += '</div>';
    html += lineageHTML(run, null);

    /* members */
    if (run.members && run.members.length) {
      html += section('Members', run.members.length);
      html += '<div class="u11rd-members">';
      run.members.forEach(function (m) {
        var stCls = m.state === 'running' ? ' run' : (m.state === 'queued' ? ' dim' : ' done');
        html += '<div class="u11rd-member' + stCls + '">';
        html += '<span class="u11rd-mrole">' + m.role + '</span>';
        if (m.persona) html += '<span class="u11rd-mpersona">' + m.persona + '</span>';
        var route = m.usedRoute || m.route || m.requestedRoute;
        if (route) html += '<span class="u11rd-mroute">' + (m.usedRoute ? 'used ' : 'requested ') + route +
          (m.state === 'queued' && m.queuedReason ? ' · queued by ' + (QUEUED_LABEL[m.queuedReason] || R().human(m.queuedReason)) : '') + '</span>';
        html += '<span class="u11rd-mstate">' + R().human(m.state) + '</span>';
        if (m.eventId) html += '<button type="button" class="u11rd-link" data-u11rd-att="' + m.eventId + '">attempt</button>';
        html += '</div>';
      });
      html += '</div>';
    }

    /* planning route plan */
    if (run.routePlan) {
      html += section('Route plan');
      html += '<div class="u11rd-grid">';
      run.routePlan.forEach(function (rp) {
        html += kv(rp.stage, rp.route + ' · ' + rp.quality);
      });
      html += '</div>';
    }

    /* timing: provider-active vs waiting (delta §6).
       Three different spans used to render as one word, "elapsed": the wall
       clock since the run started, the run's own measured elapsed, and the
       sum of the partitions. Each now carries its own name, each bar is a
       share of the partition total it belongs to (so the bars total 100%),
       and the differences between the three are stated rather than hidden
       (audit A06-05). */
    if (run.timing) {
      var tm = run.timing;
      var partTotal = 0;
      tm.rows.forEach(function (row) { partTotal += row.ms || 0; });
      var wallMs = null;
      if (run.startedAt && T()._toMs(run.startedAt) != null && T()._toMs(d.meta.now) != null) {
        wallMs = T()._toMs(d.meta.now) - T()._toMs(run.startedAt);
      }
      html += section('Timing', 'partitions total ' + T().dur(partTotal));
      html += '<div class="u11rd-grid">';
      if (wallMs != null) html += kv('Since it started', T().dur(wallMs) + ' · from ' + T().atClock(run.startedAt));
      html += kv('Measured run time', T().dur(tm.elapsedMs) +
        (wallMs != null && wallMs - tm.elapsedMs >= MIN_MS
          ? ' · ' + T().dur(wallMs - tm.elapsedMs) + ' of the wall clock is not yet measured' : ''));
      html += kv('Partitions total', T().dur(partTotal) +
        (partTotal - tm.elapsedMs >= MIN_MS
          ? ' · ' + T().dur(partTotal - tm.elapsedMs) + ' longer than the run time because ' +
            run.admitted.now + ' children ran at the same time' : ''));
      html += '</div>';
      html += '<div class="u11rd-timing">';
      tm.rows.forEach(function (row) {
        var pct = partTotal ? Math.round(row.ms / partTotal * 100) : 0;
        /* keyed on the row's kind, not on its label — the labels move
           whenever the record separates a kind (audit A06-09) */
        var cls = (row.kind === 'provider_active' || row.label === 'Provider/model active')
          ? ' active' : (row.ms === 0 ? ' zero' : '');
        html += '<div class="u11rd-trow' + cls + '">';
        html += '<span class="u11rd-tlab">' + row.label + '</span>';
        html += '<span class="u11rd-tbar"><i data-fill="' + pct + '" style="--wf:' + pct + '%"></i></span>';
        html += '<b>' + (row.ms ? T().dur(row.ms) : '0m') + '</b>';
        html += '</div>';
      });
      html += '</div>';
      html += '<div class="u11rd-tkinds">Each bar is a share of the ' + T().dur(partTotal) +
        ' of partitioned time, not of the wall clock.' +
        (tm.basis ? '<span>' + tm.basis + '</span>' : '') + '</div>';
      html += timeKindsHTML(run);
      html += '<div class="u11rd-note">' + ic('info') + '<span>Queue and local-resource time never inflate provider tokens, cost, or allowance.</span></div>';
    } else {
      html += section('Timing', 'not recorded');
      html += '<div class="u11rd-note">' + ic('info') +
        '<span>No time decomposition was recorded for this run. That is unknown, not zero — none of the eleven time kinds is measured or claimed here.</span></div>';
    }

    /* forecast */
    if (fc) {
      html += section('Capacity forecast');
      html += '<div class="u11rd-fc">';
      html += '<div class="u11rd-fcrec">' + ic('check') + '<span>' + fc.recommendation + '</span></div>';
      html += '<div class="u11rd-fcconf">' + fc.confidence + ' · generated ' + T().atClock(fc.generatedAt) + '</div>';
      if (fc.inputs.providerRanges.length) {
        html += '<div class="u11rd-grid">';
        fc.inputs.providerRanges.forEach(function (pr) { html += kv(pr.label, rangeText(pr)); });
        html += '</div>';
      }
      /* the budget the forecast actually spends against, with the reserve
         subtracted in figures rather than in words (audit A06-13) */
      if (fc.inputs.tokenBudget) {
        var tb = fc.inputs.tokenBudget;
        html += '<div class="u11rd-grid">';
        html += kv('Budget it spends against', unitAmount(tb.usable, tb.unit) + ' of ' + unitAmount(tb.advertised, tb.unit));
        html += kv('Held back for the reserve', unitAmount(tb.reserved, tb.unit));
        html += '</div>';
        if (tb.basis) html += '<div class="u11rd-fcconf">The budget is ' + tb.basis + '.</div>';
      }
      if (fc.inputs.resetInputs.length) html += kv('Reset inputs', fc.inputs.resetInputs.join(' · '));
      html += '<div class="u11rd-fcnote">' + fc.inputs.reservedNote + '</div>';
      html += '</div>';
    }

    /* usage by bucket for this run's attempts */
    var atts = d.attempts.filter(function (a) {
      return a.workId && d.workById[a.workId] && d.workById[a.workId].runId === run.id;
    });
    if (atts.length) {
      html += section('Activity', atts.length + ' attempts');
      html += bucketHTML(atts);
    }

    /* the destination is the surface that owns the run — the same value this
       panel prints as "Owning surface" — never a two-way guess on kind
       (audit A10-15) */
    html += '<div class="u11rd-acts">';
    var dest = SURFACE_MANAGER[run.owningSurface] ||
      { manager: run.kind === 'crew' ? 'crew' : 'goals', label: run.kind === 'crew' ? 'Crew' : 'Goals' };
    if (run.owningSurface === 'orchestrator' && run.kind === 'crew') dest = { manager: 'crew', label: 'Crew' };
    html += '<button type="button" class="u11rd-btn" data-u11rd-link="' + run.owningSurface +
      '" data-u11rd-mgr="' + dest.manager + '" data-u11rd-id="' + run.id + '" data-u11rd-kind="' + run.kind + '">' +
      ic('expand') + '<span>Open in ' + dest.label + '</span></button>';
    html += '</div>';
    html += '<div class="u11rd-note">' + ic('lock') + '<span>Usage reports state and forecasts. Admission, scheduling, waves, and dispatch belong to the Goal Runtime / Orchestrator.</span></div>';
    return html;
  }

  /* ---------- the reserve, as a budget ----------
     The reserve used to be four category names on the end of the sustainable
     line: nothing on the page could be seen to be smaller because of it, so a
     reader could not tell a real hold-back from a label. Every reserve now
     states what is actually held back — worker slots, allowance, or neither —
     which forecast figure is smaller because of it and by how much, and what
     the held-back capacity costs. That last one goes through costText(), so a
     subscription-covered reserve says "no separate charge" and can never be
     printed as a fabricated $0.00 (audit A06-13, A06-15, GUI-USG-004). */
  var RESERVE_EFFECT_LABEL = {
    'forecast.tokenBudget.usable': 'Usable forecast budget',
    'capacity.predictedSustainable': 'Predicted sustainable concurrency',
    'capacity.effectiveNow': 'Effective concurrency now'
  };
  function unitAmount(v, unit) {
    if (v == null) return 'not stated';
    if (unit === 'tokens') return fmt().tok(v) + ' tokens';
    if (unit === 'workers') return v + ' worker slot' + (v === 1 ? '' : 's');
    return v + ' ' + R().human(unit);
  }
  function reserveHTML(run) {
    var rs = run.reserve;
    var cats = (rs && rs.categories) || run.reservedFor || [];
    if (!rs) {
      return '<div class="u11rd-admitline dim">' + (cats.length
        ? 'Capacity is kept aside for ' + listWords(cats) +
          ', but no quantity was recorded for it — that is unknown, not nothing held back.'
        : 'No capacity is recorded as kept aside on this run.') + '</div>';
    }
    /* what is actually held back leads; what is not held back is stated after
       it, so "no worker slot" can never be read as the size of the reserve */
    var held = [], none = [];
    if (rs.tokens != null) held.push(unitAmount(rs.tokens, 'tokens')); else none.push('no token budget');
    if (rs.workers) held.push(unitAmount(rs.workers, 'workers')); else none.push('no worker slot');
    var html = '<div class="u11rd-admitline"><b>Reserve</b> ' +
      (held.length ? held.join(' · ') + ' held back' : 'nothing held back') +
      (none.length ? ' · ' + none.join(' · ') : '') +
      (cats.length ? ' · kept for ' + listWords(cats) : '') + '</div>';
    var ef = rs.effect;
    if (ef && ef.withReserve != null && ef.withoutReserve != null) {
      html += '<div class="u11rd-admitline">' + (RESERVE_EFFECT_LABEL[ef.field] || 'The figure it binds') +
        ' is <b>' + unitAmount(ef.withReserve, ef.unit) + '</b> instead of ' +
        unitAmount(ef.withoutReserve, ef.unit) + ' — the reserve costs ' +
        unitAmount(ef.withoutReserve - ef.withReserve, ef.unit) + '.</div>';
    } else {
      html += '<div class="u11rd-admitline dim">No forecast figure on this run is recorded as smaller because of the reserve.</div>';
    }
    if (rs.workersNote) html += '<div class="u11rd-admitline dim">' + rs.workersNote + '</div>';
    if (rs.tokensNote) html += '<div class="u11rd-admitline dim">' + rs.tokensNote + '</div>';
    html += '<div class="u11rd-admitline dim">Price of the reserved capacity: ' + costText(rs).text + '</div>';
    return html;
  }

  /* Bucket totals go through the one shared counting-semantics helper
     (window.U11W.tokenTotalMany): cache read and reasoning are only added for
     routes whose provider bills them as their own bucket, never for providers
     that report them inside input/output, and never for a route with no
     published counting rule. Each row states the basis it was summed on. */
  function bucketHTML(atts) {
    var d = D();
    var W = window.U11W;
    var order = [], groups = {};
    atts.forEach(function (a) {
      if (!groups[a.bucket]) { groups[a.bucket] = []; order.push(a.bucket); }
      groups[a.bucket].push(a);
    });
    var html = '<div class="u11rd-buckets">';
    order.forEach(function (b) {
      var list = groups[b];
      var costMicro = 0;
      list.forEach(function (a) { costMicro += a.costMicro || 0; });
      var tt = (W && W.tokenTotalMany) ? W.tokenTotalMany(list) : null;
      var val = (!tt || tt.total == null) ? 'no provider usage reported' : fmt().tok(tt.total) + ' tokens';
      html += '<div class="u11rd-brow"' + (tt && tt.note ? ' title="' + tt.note + '"' : '') + '>' +
        '<span>' + d.buckets[b] + (tt && tt.total != null ? ' · counted as ' + tt.basis : '') + '</span>' +
        '<b>' + list.length + ' · ' + val +
        (costMicro ? ' · ' + fmt().cost(costMicro / 1e6) : '') + '</b></div>';
      /* Every attempt in the bucket is openable from here. The bucket rollup
         used to be the end of the road, so an attempt that the Ledger does not
         expose as its own row at Essentials or Standard — the two disclosure
         levels that collapse a work group to one representative — had no path
         to its own inspector, and the execution-host lineage those attempts
         carry was unreachable (audit A07-09). The run inspector is reachable at
         every level, so this list is too. */
      html += '<div class="u11rd-blist">';
      list.forEach(function (a) {
        var host = a.hostId && d.hostById[a.hostId] ? d.hostById[a.hostId] : null;
        var role = a.roleClass || (d.attemptRole ? d.attemptRole(a) : null);
        var meta = [];
        if (role) meta.push(R().human(role));
        meta.push(R().human(a.status));
        meta.push(host ? 'ran on ' + host.label : 'execution host not recorded');
        html += '<button type="button" class="u11rd-battrow" data-u11rd-att="' + a.eventId + '">' +
          '<span class="u11rd-bname">' + R().humanCap(a.purpose) + '</span>' +
          '<span class="u11rd-bmeta">' + meta.join(' · ') + '</span></button>';
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  /* Which of the eleven separable time kinds this run actually recorded.
     Coverage is keyed on the record's own row.kind, never on a row label: a
     label table cannot survive the record splitting one row into two, and the
     one this panel used to carry reported 8 of 11 on a run that measures all
     eleven. A kind with no row states the record's own reason for not
     measuring it — never a zero-length bar and never a zero. A kind that was
     measured and came to zero says so in the same breath, so a measured zero
     and an unmeasured kind can never read as the same fact (audit A06-09). */
  function timeKindsHTML(run) {
    var d = D();
    if (!d.timeKindCoverage) return '';
    var cov = d.timeKindCoverage(run.id);
    var tm = run.timing;
    var zeros = [];
    if (tm && tm.rows) {
      tm.rows.forEach(function (row) {
        if (row.ms === 0 && row.state === 'measured') zeros.push(row.label);
      });
    }
    var html = '<div class="u11rd-tkinds"><b>Time kinds</b> ' + cov.recorded + ' of ' + cov.total +
      ' recorded on this run';
    if (!cov.missing.length) {
      html += '<span>Every kind this run is expected to separate is measured separately here — local compute ' +
        'and tool or runtime execution are two figures rather than one, and Maintenance is its own partition.</span>';
    }
    cov.missing.forEach(function (m) {
      html += '<span>' + (m.label || R().humanCap(m.kind)) + ' — ' + m.why + '</span>';
    });
    if (zeros.length) {
      html += '<span>' + listWords(zeros) + (zeros.length > 1 ? ' were' : ' was') +
        ' measured and came to zero on this run. A measured zero is not an unknown.</span>';
    }
    html += '</div>';
    return html;
  }

  /* ---------- server-first lineage · all seven levels (packet §04) ----------
     Project → Home server → Execution host → Execution environment → Source
     location → Client → the work itself. A level the record does not carry
     is inherited from the run that owns it and says so; a level nobody
     recorded reads "not recorded" rather than borrowing a neighbour's value
     (audit A07-08, A07-09). Local paths are never rendered. */
  function lineageHTML(rec, inheritFrom) {
    var d = D();
    if (!rec || !d.lineageOf) return '';
    var own = d.lineageOf(rec) || {};
    var from = inheritFrom ? (d.lineageOf(inheritFrom) || {}) : {};
    function pick(key) {
      if (own[key]) return { v: own[key], inherited: false };
      if (from[key]) return { v: from[key], inherited: true };
      return { v: null, inherited: false };
    }
    function val(p, text) { return text + (p.inherited ? ' <i class="u11rd-inh">from the run</i>' : ''); }
    function unrec(text) { return '<i class="u11rd-unrec">' + text + '</i>'; }
    /* Project is the one level lineageOf() fills in from the app-wide default
       when the record carries none, so own.project is never empty and the
       run's project could never win: an attempt inside a Puppet Master run
       rendered the default project, Tastebook. The record's OWN project is
       read from the record, and only then does it inherit (audit A07-09). */
    function projectText() {
      if (rec.project) return rec.project;
      if (inheritFrom && inheritFrom.project) {
        return inheritFrom.project + ' <i class="u11rd-inh">from the run</i>';
      }
      return own.project || from.project || unrec('not recorded');
    }

    var host = pick('host'), env = pick('environment'), loc = pick('sourceLocation'), cli = pick('client');
    var home = pick('homeServer');
    var html = section('Where it ran', 'server-first lineage');
    /* nothing below Project was recorded anywhere: say that once rather than
       print six identical "not recorded" rows */
    if (!host.v && !env.v && !loc.v && !cli.v) {
      html += '<div class="u11rd-grid">' + kv('Project', projectText()) + '</div>';
      html += '<div class="u11rd-note">' + ic('info') + '<span>Home server, execution host, execution environment, ' +
        'source location and client were not recorded for this event, and the work that owns it records none either. ' +
        'That is unknown, not "ran nowhere".</span></div>';
      return html;
    }
    html += '<div class="u11rd-grid">';
    html += kv('Project', projectText());
    html += kv('Home server', home.v ? val(home, home.v.label + ' — the execution host is the server itself')
      : (host.v ? unrec('this work did not run on a home server') : unrec('not recorded')));
    html += kv('Execution host', host.v ? val(host, host.v.label + ' · ' + host.v.os) : unrec('not recorded'));
    html += kv('Execution environment', env.v ? val(env, env.v.label) : unrec('not recorded'));
    html += kv('Source location', loc.v ? val(loc, loc.v.label) : unrec('not recorded'));
    html += kv('Client', cli.v ? val(cli, cli.v.label + ' · ' + R().human(cli.v.state))
      : unrec('no client was attached — server work needs none'));
    html += '</div>';
    if (cli.v && cli.v.note) html += '<div class="u11rd-anote">' + cli.v.note + '</div>';
    html += '<div class="u11rd-note">' + ic('lock') +
      '<span>Source trees are identified by name only — local paths are never stored or shown.</span></div>';
    return html;
  }

  /* ---------- attempt view ---------- */
  function attemptHTML(eventId) {
    var d = D();
    var att = d.attemptById[eventId];
    if (!att) return '<div class="u11rd-empty">Attempt not found.</div>';
    var work = att.workId ? d.workById[att.workId] : null;
    var ownRun = work && work.runId ? d.runById[work.runId] : null;
    var siblings = work ? d.attempts.filter(function (a) { return a.workId === work.id; }) : [att];
    var html = '';

    html += '<div class="u11rd-idline"><span class="u11rd-kind">' + (work ? R().human(work.kind) : 'attempt') + '</span>' +
      '<span class="u11rd-status">' + R().human(work ? work.status : att.status) + '</span></div>';
    if (work) html += '<div class="u11rd-title">' + work.label + '</div>';
    if (att.historicalIdentity) {
      html += '<div class="u11rd-anote">' + ic('history') + '<span>' + att.historicalIdentity.label +
        ' — identity preserved in history; never selectable as a current source.</span></div>';
    }
    html += '<div class="u11rd-note">' + ic('lock') +
      '<span>One immutable usage event per real provider attempt. The final route never overwrites earlier attempts.</span></div>';

    /* every attempt in the group — failed, interrupted, queued included */
    html += section('Attempts in this work', siblings.length);
    siblings.forEach(function (a) {
      var cls = a.status === 'failed' || a.status === 'interrupted' ? ' err' : (a.status === 'queued' ? ' dim' : '');
      html += '<div class="u11rd-att' + cls + (a.eventId === eventId ? ' focus' : '') + '" data-u11rd-jump="' + a.eventId + '">';
      html += '<div class="u11rd-atthead">';
      html += '<span class="u11rd-abucket">' + d.buckets[a.bucket] + '</span>';
      html += '<span class="u11rd-apurpose">' + R().human(a.purpose) + '</span>';
      html += '<span class="u11rd-astatus">' + R().human(a.status) + '</span>';
      html += '</div>';
      html += '<div class="u11rd-aroute">' + routeLabel(a) + '</div>';
      html += routeChangeHTML(a);
      var tok = tokensLabel(a);
      if (tok) html += '<div class="u11rd-atok">' + tok + '</div>';
      else html += '<div class="u11rd-atok dim">no provider usage was reported</div>';
      html += '<div class="u11rd-amoney">' + moneyLine(a, !tok) + '</div>';
      html += streamHTML(a);
      if (a.parentEventId) {
        var par = d.attemptById[a.parentEventId];
        /* This read "Follows user work · ue-501" while an "open parent" button sat
           on the same line - the original A08-08 shape exactly: an internal id in
           prose next to a CTA that already made the join. The purpose names the
           parent, the button reaches it, and the id rides the row as data. */
        html += '<div class="u11rd-aparent" data-u11-event="' + (a.parentEventId || '') + '">' +
          ic('route') + '<span>Follows ' +
          (par ? R().human(par.purpose) : 'an attempt no longer on record') + '</span>' +
          (par ? '<button type="button" class="u11rd-link" data-u11rd-att="' + par.eventId + '">open parent</button>' : '') +
          '</div>';
      }
      if (a.note) html += '<div class="u11rd-anote">' + a.note + '</div>';
      reasonsOf(a).forEach(function (r) {
        html += '<div class="u11rd-anote' + (r.tone ? ' ' + r.tone : '') + '">' + r.text + '</div>';
      });
      if (a.redirect && a.redirect.note) html += '<div class="u11rd-anote warn">' + a.redirect.note +
        (a.redirect.wastedTokens ? ' Wasted ' + fmt().tok(a.redirect.wastedTokens) + ' tokens.' : '') + '</div>';
      if (a.branch) html += '<div class="u11rd-anote">' + a.branch.note + ' Ancestry: ' + a.branch.ancestry.join(' → ') + '</div>';
      if (a.crossProject) html += '<div class="u11rd-anote">' + a.crossProject.spawnReason +
        ' · source project ' + a.crossProject.sourceProjectFriendly + ' · thread identities preserved · paths redacted.</div>';
      if (a.subagent) html += '<div class="u11rd-anote">Role ' + a.subagent.role +
        (a.subagent.persona ? ' · persona ' + a.subagent.persona : '') +
        (a.subagent.child ? ' · child ' + a.subagent.child : '') + '</div>';
      if (a.reasoningEffort) html += '<div class="u11rd-anote">Reasoning effort: ' + R().humanCap(a.reasoningEffort) +
        (a.speedMode ? ' · Speed: ' + R().humanCap(a.speedMode) : '') +
        (a.conversationMode ? ' · Mode: ' + R().humanCap(a.conversationMode) : '') + '</div>';
      if (a.requestedAccessProfile && a.effectiveAccessProfile && a.requestedAccessProfile !== a.effectiveAccessProfile) {
        html += '<div class="u11rd-anote warn">Requested ' + R().human(a.requestedAccessProfile) +
          ' · effective ' + R().human(a.effectiveAccessProfile) + ' — mode ceiling applied.</div>';
      }
      html += '<div class="u11rd-ameta">' + spanText(a) +
        ' · settlement ' + (SETTLE_LABEL[a.settlement] || R().human(a.settlement)) +
        ' · source ' + (SOURCE_LABEL[a.sourceClass] || R().human(a.sourceClass)) +
        (a.receiptRef ? ' · ' + a.receiptRef : '') + '</div>';
      html += '</div>';
    });

    /* Back Seat Driver (packet §02) — silent calls still count */
    if (att.bsd) {
      var bsde = d.bsdByEventId[eventId] || null;
      html += section('Back Seat Driver', R().human(att.bsd.mode));
      html += '<div class="u11rd-grid">';
      if (bsde) {
        html += kv('Requested state', bsde.requestedState);
        html += kv('Effective state', bsde.effectiveState);
        html += kv('Trigger', bsde.trigger);
        html += kv('Result', R().human(bsde.result));
        html += kv('Latency', bsde.latencyMs ? (bsde.latencyMs / 1000).toFixed(1) + 's' : '—');
        if (bsde.overrideScope) html += kv('Override scope', bsde.overrideScope);
      } else {
        html += kv('Mode', R().human(att.bsd.mode));
        html += kv('Trigger', att.bsd.trigger);
        html += kv('Result', att.bsd.silent ? 'silent' : 'advice emitted');
      }
      html += '</div>';
      if (bsde) html += '<div class="u11rd-anote">' + ic('info') + '<span>' + bsde.copy + ' — ' + bsde.detail + '</span></div>';
      if (att.bsd.advice) html += '<div class="u11rd-anote">Advice: ' + att.bsd.advice + '</div>';
    }

    /* Attachment transform (packet §02) */
    if (att.attachment) {
      var attc = att.attachment;
      html += section('Attachment', R().human(attc.transform));
      html += '<div class="u11rd-grid">';
      html += kv('Original', attc.name);
      html += kv('Transform', R().human(attc.transform));
      html += kv('Derived artifacts', attc.derivedArtifactIds.join(', ') || '—');
      html += kv('Consent', R().human(attc.consent));
      html += kv('Privacy boundary', R().human(attc.privacy));
      html += kv('Local compute', R().human(attc.localCompute));
      html += '</div>';
    }

    /* Server-first lineage, for every attempt — a level the attempt does not
       carry is inherited from its run rather than left blank (packet §04) */
    html += lineageHTML(att, ownRun);

    /* operational linkage (packet §04) */
    if (att.validationFor || att.operationalRef) {
      var opId = att.validationFor || att.operationalRef;
      var op = null;
      d.operational.forEach(function (o) { if (o.id === opId) op = o; });
      if (op) {
        html += '<div class="u11rd-anote">' + ic('route') + '<span>' +
          (att.validationFor ? 'Verification call for maintenance “' + op.title + '” — the installer time is not usage; this call is.'
                             : 'Replay triggered by “' + op.title + '” — attributed to the reconnect, not new user work.') +
          '</span></div>';
        if (op.acquisition) {
          html += '<div class="u11rd-anote">' + ic('lock') + '<span>Installation ' +
            (op.acquisition.installation ? 'v' + op.acquisition.installation.version + ' · ' + op.acquisition.installation.provenance + ' · ' : '') +
            R().human(op.acquisition.consent) + ' · ' + op.acquisition.source + ' · bound to ' +
            (d.hostById[op.hostId] ? d.hostById[op.hostId].label : op.hostId) + ' / ' +
            (d.envById[op.envId] ? d.envById[op.envId].label : op.envId) +
            ' · authentication separate · updates/repair post-consent only</span></div>';
        }
      }
    }

    /* Route evidence for the focused attempt (Hermes §10) — no secrets.
       The block is no longer gated on a live connection: an event that
       records a billing route and a settlement states them even when the
       connection it used has since been removed (audit A02-05). */
    var conn = att.connectionId ? d.connectionById[att.connectionId] : null;
    var prod = att.productId ? d.productById[att.productId] : null;
    html += section('Connection used', 'route evidence');
    html += '<div class="u11rd-grid">';
    html += kv('Provider family', routeFamilyText(att, conn));
    html += kv('Connection', conn ? conn.label : '<i class="u11rd-unrec">not recorded on this event</i>');
    html += kv('Authentication', conn ? (AUTH_LABEL[conn.authMethod] || conn.authMethod)
      : '<i class="u11rd-unrec">not recorded on this event</i>');
    if (conn) html += kv('Auth owned by', conn.authOwnedBy);
    html += kv('Account', acctIdentity(att, att.effectiveAccountId || att.requestedAccountId ||
      (conn ? conn.accountId : null)));
    html += kv('Expected product', prod ? prod.label : '<i class="u11rd-unrec">not recorded on this event</i>');
    html += kv('Model and capabilities', modelLevelText(att, conn));
    html += kv('Billing route', ROUTE_LABEL[att.billingRoute] || R().humanCap(att.billingRoute));
    html += kv('Settlement', SETTLE_LABEL[att.settlement] || R().human(att.settlement));
    html += kv('Cost', costText(att).text);
    html += kv('Cache write', cacheWriteText(att));
    html += '</div>';
    if (conn && conn.authMethod === 'cli_owned_profile') {
      html += '<div class="u11rd-note">' + ic('info') +
        '<span>Authenticated alone does not prove which plan or billing path paid for the call — authentication source and observed billing route are separate facts.</span></div>';
    }

    /* event lineage — parent, dedupe key, stream state (GUI-USG-008) */
    html += section('Event lineage', 'one event per real attempt');
    html += '<div class="u11rd-grid">';
    html += kv('This event', att.eventId);
    if (att.parentEventId) {
      var pAtt = d.attemptById[att.parentEventId];
      html += kv('Follows', att.parentEventId + (pAtt ? ' · ' + R().human(pAtt.purpose) : ''));
    } else {
      html += kv('Follows', '<i class="u11rd-unrec">nothing — this attempt starts its own chain</i>');
    }
    var kids = d.attempts.filter(function (a) { return a.parentEventId === att.eventId; });
    html += kv('Leads to', kids.length
      ? kids.map(function (a) { return a.eventId; }).join(', ')
      : '<i class="u11rd-unrec">no attempt was made from this one</i>');
    html += kv('Rollup key', att.dedupeKey ? att.dedupeKey + ' · counted once'
      : '<i class="u11rd-unrec">not recorded</i>');
    html += kv('Stream state', STREAM_LABEL[att.streamState] || R().human(att.streamState));
    if (att.partialReason) html += kv('Why it stopped', att.partialReason);
    if (att.discarded) html += kv('Result', 'discarded — the provider work still counts once');
    html += '</div>';

    /* approval receipts (Hermes §7) — wait time, reviewer cost, breaker */
    var aprs = d.approvals.filter(function (ap) { return work && ap.workId === work.id; });
    if (aprs.length) {
      html += section('Approvals', 'receipts');
      aprs.forEach(function (ap) {
        var rev = ap.reviewerEventId ? d.attemptById[ap.reviewerEventId] : null;
        html += '<div class="u11rd-grid">';
        html += kv('Decision', R().human(ap.decision) + ' × ' + ap.count);
        html += kv('Waited', T().dur(ap.waitMs));
        if (rev) html += kv('Reviewer usage', tokensLabel(rev) + ' · ' + costText(rev).text +
          ' · ' + (ROUTE_LABEL[rev.billingRoute] || R().human(rev.billingRoute)));
        html += kv('Breaker', ap.breakerTriggered ? 'tripped — further proposals stopped' : 'not triggered');
        html += '</div>';
        html += '<div class="u11rd-anote">' + ic('info') + '<span>' + ap.copy + '</span></div>';
      });
    }
    return html;
  }

  /* ---------- the fifth hierarchy level, on the event ----------
     Provider family → account → connection → product → models and
     capabilities. The event is the one place the whole chain can be shown at
     once, and it is also the only place the two family edges can be told
     apart: a model's registry family is the vendor that BUILT it, which is not
     always the family that ROUTED the call — a model reached through an
     aggregator is routed and billed on the aggregator's account. Both are
     named whenever they differ, so neither can stand in for the other
     (audit A02-10). */
  function routingFamilyOf(att, conn) {
    var d = D();
    var acct = d.accountById[att.effectiveAccountId || att.requestedAccountId || (conn ? conn.accountId : null)];
    return acct ? d.familyById[acct.familyId] : null;
  }
  function routeFamilyText(att, conn) {
    var fam = routingFamilyOf(att, conn);
    return fam ? fam.label + ' · routed and billed this call'
      : '<i class="u11rd-unrec">not recorded on this event</i>';
  }
  function modelLevelText(att, conn) {
    var d = D();
    var id = att.effectiveModelId || att.requestedModelId;
    var m = id ? d.modelById[id] : null;
    if (!m) return '<i class="u11rd-unrec">no model was recorded on this event</i>';
    var caps = [];
    /* the window is written exactly as the Context panel writes it — the same
       model's window must not read 200k in one panel and 200.0k in the other
       (audit A05-15) */
    if (m.contextWindow != null) {
      caps.push(fmt().tok(m.contextWindow).replace('.0k', 'k').replace('.0M', 'M') + ' context window');
    }
    if (m.reasoning) caps.push('reasoning');
    if (m.vision) caps.push('vision');
    if (m.local) caps.push('runs on this machine');
    var out = m.label + (caps.length ? ' · ' + caps.join(' · ') : '');
    var vendor = m.familyId ? d.familyById[m.familyId] : null;
    var routed = routingFamilyOf(att, conn);
    if (vendor && routed && vendor.id !== routed.id) {
      out += ' — built by ' + vendor.label + ', routed through ' + routed.label;
    }
    return out;
  }

  function routeLabel(a) {
    var d = D();
    var parts = [];
    var model = a.effectiveModelId ? d.modelById[a.effectiveModelId] : (a.requestedModelId ? d.modelById[a.requestedModelId] : null);
    if (model) parts.push(model.label);
    var acctId = a.effectiveAccountId || a.requestedAccountId;
    if (acctId) parts.push(acctIdentity(a, acctId));
    var conn = a.connectionId ? d.connectionById[a.connectionId] : null;
    if (conn) parts.push(conn.label);
    return parts.join(' · ') || 'Unknown route';
  }

  /* Requested versus used, for the account and for the model. Each identity
     comes from the event's own snapshot where it has one, and the two fields
     are separated by an em dash so the "·" inside an account label cannot be
     read as the field separator (audit A02-06). */
  function routeChangeHTML(a) {
    var d = D(), out = '';
    if (a.requestedAccountId && a.requestedAccountId !== a.effectiveAccountId) {
      out += '<div class="u11rd-aswitch">Requested <b>' + acctIdentity(a, a.requestedAccountId) + '</b> — Used <b>' +
        (a.effectiveAccountId ? acctIdentity(a, a.effectiveAccountId) : 'no account · no provider attempt was made') +
        '</b></div>';
    }
    if (a.requestedModelId && a.requestedModelId !== a.effectiveModelId) {
      var rm = d.modelById[a.requestedModelId], em = a.effectiveModelId ? d.modelById[a.effectiveModelId] : null;
      out += '<div class="u11rd-aswitch">Requested <b>' + (rm ? rm.label : a.requestedModelId) + '</b> — Used <b>' +
        (em ? em.label : 'no model · no provider attempt was made') + '</b></div>';
    }
    return out;
  }

  /* Partial and aborted streams state their stream state, why they stopped,
     and the key their partial usage was rolled up under exactly once. A
     partial never borrows final or settled wording (GUI-USG-008). */
  function streamHTML(a) {
    if (a.streamState !== 'partial' && a.streamState !== 'aborted' && a.settlement !== 'streaming_partial') return '';
    return '<div class="u11rd-astream">' + ic('info') + '<span>Stream ' +
      (STREAM_LABEL[a.streamState] || R().human(a.streamState)) +
      (a.partialReason ? ' — ' + a.partialReason : '') + '. ' +
      (a.usageObservedBeforeAbort ? 'Usage observed before it stopped is kept' : 'What the provider reported is kept') +
      /* The rollup key used to be named inside this sentence, which put an
         internal token in prose for no gain: it is already a labelled row of
         its own ("Rollup key") a few lines above, where it reads as the field
         it is. The sentence keeps the fact and drops the token. */
      (a.dedupeKey ? ' and counted once' : '') + '.</span></div>';
  }

  /* Per-attempt provider-active time: both stamps exist, so the span and its
     duration are shown, not only the start (audit A06-17). */
  function spanText(a) {
    if (!a.startedAt) return 'not started';
    var started = T().stamp(a.startedAt);
    if (!a.finishedAt) return started + ' · still running';
    var ms = T()._toMs(a.finishedAt) - T()._toMs(a.startedAt);
    return started + ' → ' + T().atClock(a.finishedAt) + ' · provider active ' +
      (ms >= MIN_MS ? T().dur(ms) : 'under a minute');
  }

  /* A cache-write figure that is absent is never a zero: the connection's own
     cache reporting state says whether the route reported it, does not expose
     it, or could not be read at all (GUI-USG-006). */
  function cacheWriteText(a) {
    var d = D();
    if (a.tokens && a.tokens.cacheWrite != null) {
      return fmt().tok(a.tokens.cacheWrite) +
        (a.tokens.cacheWrite1h != null ? ' · ' + fmt().tok(a.tokens.cacheWrite1h) + ' on the one-hour bucket' : '');
    }
    var cs = null;
    (d.cacheStats || []).forEach(function (c) { if (c.connectionId === a.connectionId) cs = c; });
    if (!cs) return 'unknown — this route publishes no cache reporting state';
    var state = cs.cacheWriteBreakdownState || cs.cacheReportingState;
    if (state === 'not_exposed') return 'not exposed by this route' + (cs.cacheMissReason ? ' · ' + R().human(cs.cacheMissReason) : '');
    if (state === 'unknown') return 'unknown — the route could not be read';
    if (state === 'fallback_short_ttl') return 'reported without a time-to-live breakdown';
    return 'not reported on this attempt';
  }
  function tokensLabel(a) {
    var t = a.tokens || {};
    var parts = [];
    if (t.input != null) parts.push(fmt().tok(t.input) + ' in');
    if (t.output != null) parts.push(fmt().tok(t.output) + ' out');
    if (t.cacheRead != null) parts.push(fmt().tok(t.cacheRead) + ' cache read');
    if (t.cacheWrite != null) parts.push(fmt().tok(t.cacheWrite) + ' cache write');
    if (t.reasoning != null) parts.push(fmt().tok(t.reasoning) + ' reasoning');
    return parts.join(' · ');
  }

  /* ---------- open / close ---------- */
  function render(title, bodyHtml) {
    var p = ensurePanel();
    p.innerHTML =
      '<div class="u11rd-head">' +
        '<div class="u11rd-ht">' + ic('chip') + '<span>' + title + '</span></div>' +
        '<button type="button" class="u11rd-x" data-u11rd-close title="Close" aria-label="Close run detail">' + ic('x') + '</button>' +
      '</div>' +
      '<div class="u11rd-body">' + bodyHtml + '</div>';
    p.classList.add('on');
    if (window.USrender) window.USrender.animateFills(p);
    var x = p.querySelector('.u11rd-x');
    if (x) x.focus();
  }

  function open(runId) {
    var d = D();
    var run = d.runById[runId];
    if (!run) return;
    lastFocus = document.activeElement;
    openId = runId;
    render(run.title, runHTML(runId));
    /* The subject of this panel is a run, so it opens object-first on the run
       through cmd.nav.open_subject. Two canon clauses decide that:
       cmd.chat.open_thread_context_details is the thread Context Detail Pane
       command and is explicitly not an alias for app-wide Usage (UCC-109
       :8159), so the { surface:'run_detail', id } payload this used to send
       was the aliasing canon forbids; and GUI-ROUTE-001 forbids a
       run-only primary route on cmd.nav.open_usage_subject, whose route_target
       must be the canonical usage event. A run is not one usage event, and
       inventing one of its attempts as the route identity would be a second
       falsehood — so the run travels as the subject with run_id as the
       narrowing filter canon does allow, and the usage-event route stays where
       it belongs, on the attempt inspector (audit A11-05). */
    var runThreadId = null;
    d.works.forEach(function (w) { if (w.runId === run.id && w.threadId && !runThreadId) runThreadId = w.threadId; });
    d.dispatch('cmd.nav.open_subject', {
      route_target: { object_kind: 'run', object_id: run.id },
      open_subject: { kind: run.kind, id: run.id, title: run.title, owning_surface: run.owningSurface },
      run_id: run.id,
      thread_id: runThreadId,
      project: run.project,
      projection_freshness: d.meta && d.meta.projectionFreshness ? d.meta.projectionFreshness : 'unknown',
      projection_health: d.meta && d.meta.projectionHealth ? d.meta.projectionHealth : 'unknown'
    });
  }
  function openAttempt(eventId) {
    var d = D();
    var att = d.attemptById[eventId];
    if (!att) return;
    lastFocus = document.activeElement;
    openId = eventId;
    var work = att.workId ? d.workById[att.workId] : null;
    render(work ? work.label : 'Attempt detail', attemptHTML(eventId));
    /* Opening a specific usage event is an object-first usage route: the
       canonical command resolves Usage identity from usage_event_ref, and
       the correlation fields travel with it (GUI-ROUTE-001, audit A11-06). */
    d.dispatch('cmd.nav.open_usage_subject', {
      route_target: { object_kind: 'usage_event', object_id: att.eventId },
      usage_event_ref: att.eventId,
      usage_record_id: att.receiptRef || null,
      provider_attempt_ref: att.receiptRef || null,
      attempt_id: att.eventId,
      parent_usage_record_id: att.parentEventId || null,
      dedupe_key: att.dedupeKey || null,
      run_id: work && work.runId ? work.runId : null,
      thread_id: work && work.threadId ? work.threadId : null,
      source_class: att.sourceClass || 'unknown',
      settlement_status: att.settlement || 'unknown',
      projection_freshness: d.meta && d.meta.projectionFreshness ? d.meta.projectionFreshness : 'unknown',
      projection_health: d.meta && d.meta.projectionHealth ? d.meta.projectionHealth : 'unknown'
    });
  }
  function close() {
    if (!panel) return;
    panel.classList.remove('on');
    openId = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  /* delegated wiring */
  document.addEventListener('click', function (e) {
    if (!panel || !panel.classList.contains('on')) return;
    if (e.target.closest('[data-u11rd-close]')) { close(); return; }
    var attBtn = e.target.closest('[data-u11rd-att]');
    if (attBtn) { openAttempt(attBtn.getAttribute('data-u11rd-att')); return; }
    var link = e.target.closest('[data-u11rd-link]');
    if (link) {
      /* object-first route: the subject is the run itself, and the surface
         that owns it comes from the record, not from a guess */
      var runId = link.getAttribute('data-u11rd-id');
      var linkRun = D().runById[runId];
      D().dispatch('cmd.nav.open_subject', {
        route_target: { object_kind: 'run', object_id: runId },
        open_subject: { kind: link.getAttribute('data-u11rd-kind'), id: runId,
          title: linkRun ? linkRun.title : null, owning_surface: link.getAttribute('data-u11rd-link') },
        manager: link.getAttribute('data-u11rd-mgr'),
        run_id: runId,
        project: linkRun ? linkRun.project : null
      });
      if (window.toast) {
        window.toast('Opening ' + (linkRun ? linkRun.title : runId) + ' in ' +
          ((SURFACE_MANAGER[link.getAttribute('data-u11rd-link')] || {}).label || link.getAttribute('data-u11rd-mgr')) + ' (demo)');
      }
      return;
    }
  });

  window.U11RunDetail = { open: open, openAttempt: openAttempt, close: close };
})();
