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

  /* ---------- run view ---------- */
  function runHTML(runId) {
    var d = D();
    var run = d.runById[runId];
    if (!run) return '<div class="u11rd-empty">Run not found.</div>';
    var fc = run.forecastId ? d.forecastById[run.forecastId] : null;
    var kind = KIND_LABEL[run.kind] || run.kind;
    var html = '';

    html += '<div class="u11rd-idline"><span class="u11rd-kind">' + kind + '</span>' +
      '<span class="u11rd-status">' + run.status + '</span></div>';
    html += '<div class="u11rd-grid">';
    html += kv('Owning surface', SURFACE_LABEL[run.owningSurface] || run.owningSurface);
    html += kv('Visibility', run.visibility);
    html += kv('Project', run.project);
    html += kv('Phase', run.phase);
    if (run.startedAt) html += kv('Started', T().atClock(run.startedAt));
    html += '</div>';

    /* admission: required specialists stay required even in waves */
    var req = run.requested.children != null ? run.requested.children : run.requested.members;
    var reqLabel = run.requested.specialistsRequired != null ? run.requested.specialistsRequired : req;
    var queued = run.queued.children != null ? run.queued.children : run.queued.members;
    html += section('Admission', 'Usage forecasts · Goal Runtime decides');
    html += '<div class="u11rd-admit">';
    html += '<div class="u11rd-admitline"><b>' + reqLabel + '</b> required specialists</div>';
    html += '<div class="u11rd-admitline"><b>' + run.admitted.now + '</b> admitted now · effective concurrency ' + run.admitted.effectiveConcurrency + '</div>';
    html += '<div class="u11rd-admitline"><b>' + queued + '</b> queued · ' + run.queued.waves + ' waves</div>';
    html += '<div class="u11rd-admitline dim">Sustainable concurrency ' + run.admitted.sustainableConcurrency +
      (run.reservedFor && run.reservedFor.length ? ' · reserved for ' + run.reservedFor.join(', ') : '') + '</div>';
    if (run.capacity) {
      var cap = run.capacity;
      html += '<div class="u11rd-grid">';
      html += kv('Hard max', cap.hardMax);
      html += kv('Configured preferred', cap.configuredPreferred);
      html += kv('Provider advertised', cap.providerAdvertised);
      html += kv('Effective now', cap.effectiveNow);
      html += kv('Predicted sustainable', cap.predictedSustainable);
      html += '</div>';
    }
    if (run.hostId) {
      var rhost = d.hostById[run.hostId], renv = run.envId ? d.envById[run.envId] : null;
      html += '<div class="u11rd-grid">';
      html += kv('Execution host', rhost ? rhost.label : run.hostId);
      if (renv) html += kv('Environment', renv.label);
      html += '</div>';
    }
    html += '</div>';

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
          (m.state === 'queued' && m.queuedReason ? ' · queued by ' + R().human(m.queuedReason) : '') + '</span>';
        html += '<span class="u11rd-mstate">' + m.state + '</span>';
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

    /* timing: provider-active vs waiting (delta §6) */
    if (run.timing) {
      var tm = run.timing;
      html += section('Timing', 'elapsed ' + T().dur(tm.elapsedMs));
      html += '<div class="u11rd-timing">';
      tm.rows.forEach(function (row) {
        var pct = tm.elapsedMs ? Math.round(row.ms / tm.elapsedMs * 100) : 0;
        var cls = row.label === 'Provider/model active' ? ' active' : (row.ms === 0 ? ' zero' : '');
        html += '<div class="u11rd-trow' + cls + '">';
        html += '<span class="u11rd-tlab">' + row.label + '</span>';
        html += '<span class="u11rd-tbar"><i data-fill="' + pct + '" style="--wf:' + pct + '%"></i></span>';
        html += '<b>' + (row.ms ? T().dur(row.ms) : '0m') + '</b>';
        html += '</div>';
      });
      html += '</div>';
      html += '<div class="u11rd-note">' + ic('info') + '<span>Queue and local-resource time never inflate provider tokens, cost, or allowance.</span></div>';
    }

    /* forecast */
    if (fc) {
      html += section('Capacity forecast');
      html += '<div class="u11rd-fc">';
      html += '<div class="u11rd-fcrec">' + ic('check') + '<span>' + fc.recommendation + '</span></div>';
      html += '<div class="u11rd-fcconf">' + fc.confidence + ' · generated ' + T().atClock(fc.generatedAt) + '</div>';
      if (fc.inputs.providerRanges.length) {
        html += '<div class="u11rd-grid">';
        fc.inputs.providerRanges.forEach(function (pr) { html += kv(pr.label, pr.value); });
        html += '</div>';
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

    html += '<div class="u11rd-acts">';
    var mgr = run.kind === 'crew' ? 'crew' : 'goals';
    html += '<button type="button" class="u11rd-btn" data-u11rd-link="orchestrator" data-u11rd-mgr="' + mgr + '" data-u11rd-id="' + run.id + '">' +
      ic('expand') + '<span>Open in ' + (run.kind === 'crew' ? 'Crew' : 'Goals') + '</span></button>';
    html += '</div>';
    html += '<div class="u11rd-note">' + ic('lock') + '<span>Usage reports state and forecasts. Admission, scheduling, waves, and dispatch belong to the Goal Runtime / Orchestrator.</span></div>';
    return html;
  }

  function bucketHTML(atts) {
    var d = D();
    var totals = {};
    atts.forEach(function (a) {
      var t = totals[a.bucket] || (totals[a.bucket] = { tokens: 0, costMicro: 0, count: 0 });
      t.tokens += (a.tokens.input || 0) + (a.tokens.output || 0) + (a.tokens.cacheRead || 0) + (a.tokens.reasoning || 0);
      t.costMicro += a.costMicro || 0;
      t.count += 1;
    });
    var html = '<div class="u11rd-buckets">';
    Object.keys(totals).forEach(function (b) {
      var t = totals[b];
      html += '<div class="u11rd-brow"><span>' + d.buckets[b] + '</span><b>' + t.count + ' · ' + fmt().tok(t.tokens) + ' tokens' +
        (t.costMicro ? ' · ' + fmt().cost(t.costMicro / 1e6) : '') + '</b></div>';
    });
    html += '</div>';
    return html;
  }

  /* ---------- attempt view ---------- */
  function attemptHTML(eventId) {
    var d = D();
    var att = d.attemptById[eventId];
    if (!att) return '<div class="u11rd-empty">Attempt not found.</div>';
    var work = att.workId ? d.workById[att.workId] : null;
    var siblings = work ? d.attempts.filter(function (a) { return a.workId === work.id; }) : [att];
    var html = '';

    html += '<div class="u11rd-idline"><span class="u11rd-kind">' + (work ? R().human(work.kind) : 'attempt') + '</span>' +
      '<span class="u11rd-status">' + (work ? work.status : att.status) + '</span></div>';
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
      html += '<span class="u11rd-astatus">' + a.status + '</span>';
      html += '</div>';
      html += '<div class="u11rd-aroute">' + routeLabel(a) + '</div>';
      var tok = tokensLabel(a);
      if (tok) html += '<div class="u11rd-atok">' + tok + (a.costMicro ? ' · ' + fmt().cost(a.costMicro / 1e6) : ' · $0.00') + '</div>';
      else html += '<div class="u11rd-atok dim">no provider usage</div>';
      if (a.note) html += '<div class="u11rd-anote">' + a.note + '</div>';
      if (a.failReason) html += '<div class="u11rd-anote err">' + a.failReason + '</div>';
      if (a.mismatch) html += '<div class="u11rd-anote warn">' + a.mismatch.reason + '</div>';
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
      html += '<div class="u11rd-ameta">' +
        (a.startedAt ? T().stamp(a.startedAt) : 'not started') +
        ' · settlement ' + R().human(a.settlement) +
        ' · source ' + R().human(a.sourceClass) +
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

    /* Execution host lineage (packet §04) */
    if (att.hostId) {
      var ahost = d.hostById[att.hostId], aenv = att.envId ? d.envById[att.envId] : null;
      html += section('Execution host', 'server-first lineage');
      html += '<div class="u11rd-grid">';
      html += kv('Host', ahost ? ahost.label : att.hostId);
      if (ahost) html += kv('OS', ahost.os);
      if (aenv) html += kv('Environment', aenv.label);
      html += '</div>';
    }

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
      }
    }

    /* route snapshot for the focused attempt (Hermes §10) — no secrets */
    var conn = att.connectionId ? d.connectionById[att.connectionId] : null;
    if (conn) {
      var prod = att.productId ? d.productById[att.productId] : null;
      html += section('Connection used', 'route evidence');
      html += '<div class="u11rd-grid">';
      html += kv('Connection', conn.label);
      html += kv('Authentication', AUTH_LABEL[conn.authMethod] || conn.authMethod);
      html += kv('Auth owned by', conn.authOwnedBy);
      html += kv('Account', d.accountLabel(conn.accountId));
      html += kv('Expected product', prod ? prod.label : '—');
      html += kv('Billing route', R().human(att.billingRoute));
      html += kv('Settlement', R().human(att.settlement));
      html += kv('Cache write', att.tokens && att.tokens.cacheWrite != null ? fmt().tok(att.tokens.cacheWrite) : 'not exposed');
      html += '</div>';
      if (conn.authMethod === 'cli_owned_profile') {
        html += '<div class="u11rd-note">' + ic('info') +
          '<span>Authenticated alone does not prove which plan or billing path paid for the call — authentication source and observed billing route are separate facts.</span></div>';
      }
    }

    /* requested vs used */
    if (att.requestedAccountId !== att.effectiveAccountId && att.effectiveAccountId) {
      html += '<div class="u11rd-anote warn">Requested ' + d.accountLabel(att.requestedAccountId) +
        ' · used ' + d.accountLabel(att.effectiveAccountId) + '</div>';
    }

    /* approval receipts (Hermes §7) — wait time, reviewer cost, breaker */
    var aprs = d.approvals.filter(function (ap) { return work && ap.workId === work.id; });
    if (aprs.length) {
      html += section('Approvals', 'receipts');
      aprs.forEach(function (ap) {
        var rev = ap.reviewerEventId ? d.attemptById[ap.reviewerEventId] : null;
        html += '<div class="u11rd-grid">';
        html += kv('Decision', R().human(ap.decision) + ' × ' + ap.count);
        html += kv('Waited', T().dur(ap.waitMs));
        if (rev) html += kv('Reviewer usage', tokensLabel(rev) + ' · ' + (rev.costMicro ? fmt().cost(rev.costMicro / 1e6) : '$0.00') + ' · ' + R().human(rev.billingRoute));
        html += kv('Breaker', ap.breakerTriggered ? 'tripped — further proposals stopped' : 'not triggered');
        html += '</div>';
        html += '<div class="u11rd-anote">' + ic('info') + '<span>' + ap.copy + '</span></div>';
      });
    }
    return html;
  }

  function routeLabel(a) {
    var d = D();
    var parts = [];
    var model = a.effectiveModelId ? d.modelById[a.effectiveModelId] : (a.requestedModelId ? d.modelById[a.requestedModelId] : null);
    if (model) parts.push(model.label);
    var acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
    if (acct) parts.push(d.accountLabel(acct.id));
    var conn = a.connectionId ? d.connectionById[a.connectionId] : null;
    if (conn) parts.push(conn.label);
    return parts.join(' · ') || 'Unknown route';
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
    d.dispatch('cmd.chat.open_thread_context_details', { surface: 'run_detail', id: runId });
  }
  function openAttempt(eventId) {
    var d = D();
    var att = d.attemptById[eventId];
    if (!att) return;
    lastFocus = document.activeElement;
    openId = eventId;
    var work = att.workId ? d.workById[att.workId] : null;
    render(work ? work.label : 'Attempt detail', attemptHTML(eventId));
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
      var dest = { surface: link.getAttribute('data-u11rd-link'), manager: link.getAttribute('data-u11rd-mgr'),
        goal_or_crew_id: link.getAttribute('data-u11rd-id'), focus_reason: 'inspect_run' };
      var res = D().deepLink(dest);
      if (window.toast) window.toast(res.toast);
      return;
    }
  });

  window.U11RunDetail = { open: open, openAttempt: openAttempt, close: close };
})();
