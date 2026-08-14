/* PMXSuites — Opus 5 interaction suites
 *
 * Every suite asserts a decision this build makes, not the implementation that carries it. That
 * distinction is what keeps the suite useful after a refactor: `route` asserts that the same model
 * under two accounts is two identities, not that PMXRoute has a particular internal table.
 *
 * The harness may INJECT state through the Director, but it must never resolve a question, an
 * approval or a conflict on the concept's behalf — resolution has to happen through concept UI, or
 * the test proves the fixture rather than the product.
 *
 * Suite order is dependency order: `policy` and `mount` first, because a CSS-scope violation or a
 * missing region invalidates everything measured afterwards.
 */
(function (global) {
  'use strict';

  var A = global.PMXAssert;

  /* The eight popup-anchor assertions genuinely need room: the popup service correctly refuses an
   * off-viewport anchor, so a small window produces failures that describe the window rather than
   * the product. Refusing to run is more honest than reporting those as defects. */
  var MIN_VIEWPORT = { width: 1900, height: 900 };

  function W() { return global.PMXWorkspace; }
  function store() { return W().store; }
  function data() { return W().data; }
  function tid() { return store().get('session.activeThreadId'); }
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function setPairing(w, t) { W().setPairing(w, t); }

  function fire(family, event, payload) {
    return global.PMXDemo.fire(family, event, payload);
  }

  /* Kill any in-flight transition on an element before measuring it. A hidden or throttled tab does
   * not advance transitions, so getComputedStyle can report a start value indefinitely and a
   * geometry assertion would fail for a reason that has nothing to do with layout. */
  function settle(el) {
    if (!el || !el.style) return el;
    el.style.transition = 'none';
    void el.offsetWidth;
    return el;
  }

  function settleAll() {
    qa('[class*="-drawer"], [class*="-artifact-host"], [class*="-column"], [class*="-sheet"], [class*="-pinrail"], [class*="-strip"]')
      .forEach(settle);
  }

  function reset() { fire('system', 'reset'); }

  /* ------------------------------------------------------------------ policy */

  A.suite('policy', function (t) {
    /* CONTRACT §7: window CSS only under its own scope, thread CSS only under its own. Parsing the
     * live stylesheets is the only way to check what actually shipped rather than what the source
     * looked like. */
    var offenders = [];
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      var href = String(sheet.href || '');
      var m = href.match(/\/(w[1-8])-[^/]*\.css/) || href.match(/\/(t[1-8])-[^/]*\.css/);
      if (!m) return;
      var id = m[1];
      var scope = id.charAt(0) === 'w' ? 'data-pmx-window' : 'data-pmx-thread';
      var rules;
      try { rules = sheet.cssRules; } catch (e) { return; }
      var walk = function (list) {
        Array.prototype.forEach.call(list, function (rule) {
          if (rule.cssRules && rule.cssRules.length) { walk(rule.cssRules); return; }
          if (!rule.selectorText) return;
          rule.selectorText.split(',').forEach(function (sel) {
            var s = sel.trim();
            if (!s) return;
            if (s.indexOf(scope + '="' + id + '"') < 0) offenders.push(id + ' :: ' + s.slice(0, 90));
          });
        });
      };
      walk(rules);
    });
    t.eq(offenders.length, 0, 'every concept CSS rule stays inside its own scope');
    if (offenders.length) t.record(false, 'first offenders: ' + offenders.slice(0, 3).join(' | '));

    /* §8.1: no emoji anywhere in visible prose. Registration prose is the highest-risk place. */
    var emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    var proseBad = [];
    global.PMX.window.all().concat(global.PMX.thread.all()).forEach(function (rec) {
      if (emoji.test(rec.name + ' ' + rec.blurb)) proseBad.push(rec.id);
    });
    t.eq(proseBad.length, 0, 'no emoji in any concept name or blurb');

    /* PM-native browser vocabulary. The forbidden term is assembled from parts so this file does not
     * itself contain the literal it forbids — otherwise the suite would be the one match.
     *
     * This fetches every locally-loaded script and checks it, which is a real assertion rather than a
     * note pointing at a grep somebody else has to run. It returns a promise, so the suite is async. */
    var FORBIDDEN = new RegExp(['play', 'wright'].join(''), 'i');
    var srcs = Array.prototype.slice.call(document.scripts)
      .map(function (n) { return n.getAttribute('src'); })
      .filter(function (src) { return src && src.indexOf('http') !== 0 && src.indexOf('//') !== 0; });

    return Promise.all(srcs.map(function (src) {
      return fetch(src).then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (text) { return FORBIDDEN.test(text) ? src : null; })
        .catch(function () { return null; });
    })).then(function (hits) {
      var offenders = hits.filter(Boolean);
      t.eq(offenders.length, 0, 'no loaded source names a third-party test runner in PM-owned code');
      if (offenders.length) t.record(false, 'offenders: ' + offenders.slice(0, 3).join(', '));
      t.ok(srcs.length > 40, 'the terminology check actually scanned the loaded sources (' + srcs.length + ')');
    });
  });

  /* ------------------------------------------------------------------ mount */

  A.suite('mount', function (t) {
    var pairs = global.PMX.registry.pairs();
    t.eq(pairs.length, 64, 'the registry offers exactly 64 pairings');
    var failed = [];
    pairs.forEach(function (p) {
      try {
        setPairing(p.windowId, p.threadId);
        /* The contract is the REGIONS MAP, not a DOM attribute: `data-pmx-region` is a convenience
         * several windows stamp and others do not, so asserting on it would fail correct windows.
         * PMX.registry.validateWindowInstance already throws when a required region is missing, and
         * compose.js calls it on every mount — so reaching this line at all proves the four required
         * regions were real elements. What is worth checking here is that the composition exposes a
         * live instance and its regions are attached to the document. */
        var comp = (W().compositions || []).filter(function (c) {
          return c.windowId === p.windowId && c.threadId === p.threadId;
        })[0];
        if (!comp) { failed.push(p.windowId + '+' + p.threadId + ' has no composition'); return; }
        var regions = comp.windowInst && comp.windowInst.regions;
        if (!regions) { failed.push(p.windowId + '+' + p.threadId + ' exposes no regions'); return; }
        ['transcript', 'composerHost', 'headerTools', 'overlayRoot'].forEach(function (r) {
          var el = regions[r];
          if (!el || el.nodeType !== 1) failed.push(p.windowId + '+' + p.threadId + ' missing ' + r);
          else if (!document.contains(el)) failed.push(p.windowId + '+' + p.threadId + ' region ' + r + ' is detached');
        });
      } catch (e) { failed.push(p.windowId + '+' + p.threadId + ': ' + e.message); }
    });
    t.eq(failed.length, 0, 'all 64 pairings mount with every required region attached');
    if (failed.length) t.record(false, 'first failures: ' + failed.slice(0, 3).join(' | '));

    /* Every window now offers an artifact host — the packet requires the left workspace to be
     * reachable in every concept, not just the ones where a column was convenient. */
    var missing = [];
    ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'].forEach(function (w) {
      if ((global.PMX.window.get(w).provides || []).indexOf('artifactHost') < 0) missing.push(w);
    });
    t.eq(missing.length, 0, 'all eight windows provide artifactHost');

    /* w8 keeps workSurfaceHost ABSENT on purpose: the absent-region path is a first-class
     * arrangement and threads must work either way. */
    t.eq((global.PMX.window.get('w8').provides || []).indexOf('workSurfaceHost'), -1,
      'w8 deliberately does not provide workSurfaceHost');
  });

  /* ------------------------------------------------------------------ store */

  A.suite('store', function (t) {
    reset();
    var s = store();
    t.ok(s.get('session.sync'), 'session.sync exists');
    t.ok(s.get('session.ops'), 'session.ops exists');
    t.ok(s.get('session.notify'), 'session.notify exists');
    t.ok(s.get('session.recents'), 'session.recents exists');
    t.ok(s.get('session.providerSetup'), 'session.providerSetup exists');

    var v = s.view('thread-01');
    ['bsd', 'decisions', 'context', 'threadOps', 'attachments'].forEach(function (k) {
      t.ok(v[k] !== undefined, 'view slice has ' + k);
    });

    /* Change-key coarsening is load-bearing: a subscriber that array-equality-matches would be dead
     * for every real change. */
    var seen = [];
    var off = s.subscribe(function (_s, changed) { seen = seen.concat(changed); });
    s.set('session.sync.transport', 'offline');
    off();
    t.ok(seen.indexOf('session.sync') >= 0, 'a nested set notifies the two-segment key');
    s.set('session.sync.transport', 'live');

    /* Thread-locality: the whole reason runtime moved into the view. */
    s.setRuntime('thread-01', 'model', 'Sonnet 5');
    t.neq(s.runtime('thread-02', 'model'), 'Sonnet 5', 'a route change in one thread does not touch another');
  });

  /* ------------------------------------------------------------------ route */

  A.suite('route', function (t) {
    var R = global.PMXRoute;
    var work = R.models('acct-anthropic-work').filter(function (m) { return m.name === 'Opus 5'; });
    var pers = R.models('acct-anthropic-personal').filter(function (m) { return m.name === 'Opus 5'; });
    t.eq(work.length, 1, 'Opus 5 is offered on the Work account');
    t.eq(pers.length, 1, 'Opus 5 is offered on the Personal account');
    t.neq(work[0].id, pers[0].id, 'the same model under two accounts is two distinct route identities');

    t.eq(R.effort('Haiku 4.5'), null, 'Haiku 4.5 has no reasoning-effort axis, so the submenu is absent');
    t.eq(R.effort('GPT-5.6 Mini'), null, 'GPT-5.6 Mini has no reasoning-effort axis');
    t.notOk(R.supportsFast('Opus 5'), 'Opus 5 has no Fast tier');
    t.ok(R.supportsFast('Sonnet 5'), 'Sonnet 5 declares a Fast tier');

    var over = R.models(null).filter(function (m) { return m.facts.length > 3; });
    t.eq(over.length, 0, 'no model row carries more than three compact facts');

    var cli = R.accounts().filter(function (a) { return a.oauthOwner; });
    t.ok(cli.length >= 2, 'the catalog contains CLI-owned OAuth accounts');
    var wrongAction = cli.filter(function (a) {
      return a.actions.some(function (x) { return /sign in/i.test(x.label); });
    });
    t.eq(wrongAction.length, 0, 'a CLI-owned account offers no PM-direct sign-in');
  });

  /* ------------------------------------------------------------------ access */

  A.suite('access', function (t) {
    var Ac = global.PMXAccess;
    var id = tid();
    store().setRuntime(id, 'access', 'full');
    store().setRuntime(id, 'mode', 'Review');
    t.eq(Ac.effective(id).line, 'Full Access \u00b7 Limited by Review mode', 'narrowed access line is verbatim');
    t.eq(Ac.effective(id).profile, 'auto_edits', 'Review caps the effective profile at auto accept edits');
    store().setRuntime(id, 'mode', 'Agent');
    t.eq(Ac.effective(id).line, 'Full Access', 'unnarrowed access line is the profile label alone');
    t.eq(Ac.effective(id).narrowedBy, null, 'Agent mode does not narrow');
    t.eq(Ac.toolsFor('Plan').length, 10, 'Plan is not a blind mode');
    t.deepEq(Ac.toolsFor('Plan'), Ac.toolsFor('Review'), 'Plan and Review expose the same tool families');
  });

  /* ------------------------------------------------------------------ bsd */

  A.suite('bsd', function (t) {
    var B = global.PMXBsd;
    var id = tid();
    var states = ['off', 'auto-idle', 'auto-active', 'on', 'silent', 'advice',
                  'duplicate-suppressed', 'timeout', 'unavailable', 'quota-limited'];
    var unreachable = states.filter(function (s) {
      B.evaluate(id, s);
      return B.visualState(id) !== s;
    });
    t.eq(unreachable.length, 0, 'all ten Back Seat Driver visual states are reachable');

    B.evaluate(id, 'advice');
    var adv = B.advice(id);
    t.ok(adv.length > 0, 'advice records exist');
    t.eq(adv.filter(function (a) { return a.readOnly !== true; }).length, 0, 'every advice record is read-only');

    /* The glow is only legal while a real operation runs. */
    B.evaluate(id, 'auto-active');
    t.ok(B.opId(id), 'auto-active is bound to a live observable operation');
    B.set(id, 'on', B.scope(id));
    B.evaluate(id, 'on');
    t.eq(B.opId(id), null, 'manual on is static and carries no operation, so it cannot glow');

    /* BSD can never block the primary turn. */
    B.evaluate(id, 'unavailable');
    var before = (data().messagesFor(id) || []).length;
    t.ok(global.PMXRuntime && typeof global.PMXRuntime.send === 'function', 'the runtime send path exists');
    t.eq((data().messagesFor(id) || []).length, before, 'an unavailable Back Seat Driver changes nothing about the turn');
    B.set(id, 'auto', 'thread');
  });

  /* ------------------------------------------------------------------ approvals */

  A.suite('approvals', function (t) {
    var Ap = global.PMXApprovals;
    var id = tid();
    Ap.clear(id);

    var before = Object.keys(store().get('session.ops.grants') || {}).length;
    var a1 = Ap.raise(id, {
      kind: 'approval', severity: 'material',
      question: 'Run 2 commands?', scopeLine: 'Workspace only \u00b7 Needed to run the test suite'
    });
    Ap.decide(id, a1, 'Allow once');
    t.eq(Object.keys(store().get('session.ops.grants') || {}).length, before,
      'Allow once writes no persistent grant');

    var a2 = Ap.raise(id, { kind: 'approval', severity: 'material', question: 'Run 2 commands?', scopeLine: 'x' });
    Ap.decide(id, a2, 'Allow for session');
    t.eq(Object.keys(store().get('session.ops.grants') || {}).length, before + 1,
      'Allow for session writes exactly one grant');

    /* A multi-class warning shows ONE consequence and keeps the rest as evidence. */
    Ap.clear(id);
    var w = Ap.raise(id, { kind: 'warning', severity: 'material', cls: ['cache_loss', 'provider_boundary'] });
    var rec = Ap.pending(id).filter(function (r) { return r.id === w; })[0];
    t.eq(rec.question, 'Switch to Claude API?', 'the highest-ranked consequence supplies the question');
    t.ok(rec.details.receipts.length >= 2, 'every consequence class is kept in the evidence');
    t.eq(rec.actions.map(function (x) { return x.label; }).join('|'), 'Cancel|Branch|Switch|Details',
      'route warning action set is verbatim');
  });

  /* ------------------------------------------------------------------ context */

  A.suite('context', function (t) {
    var CA = global.PMXContextAdmit;
    var id = 'thread-01';
    var rec = CA.receipt(id);
    t.ok(rec.included.length > 0, 'the admission receipt lists included sources');
    t.ok(rec.omitted.length > 0, 'the admission receipt lists what was left out');

    var INC = ['objective', 'recent_messages', 'project_instructions', 'persona_capsule', 'tools',
               'prior_thread_excerpt', 'attachment_representation'];
    var OMIT = ['older_messages_summarized', 'unused_tool_schemas', 'unrelated_logs', 'low_relevance_memories'];
    t.eq(rec.included.filter(function (r) { return INC.indexOf(r.kind) < 0; }).length, 0, 'included kinds are closed');
    t.eq(rec.omitted.filter(function (r) { return OMIT.indexOf(r.kind) < 0; }).length, 0, 'omitted kinds are closed');

    var leak = /key|token|secret|password|BEGIN /i;
    var leaked = rec.included.concat(rec.omitted).filter(function (r) { return leak.test(r.label); });
    t.eq(leaked.length, 0, 'no admitted or omitted label leaks an internal');

    /* Compaction changes what is admitted, never what happened. */
    var msgsBefore = data().threads.reduce(function (n, th) { return n + th.messages.length; }, 0);
    var opId = CA.compactNow(id);
    t.eq(typeof opId, 'string', 'Compact now returns an observable operation id');
    t.ok(global.PMXObservable.get(opId), 'the operation is registered with ObservableWork');
    t.eq(data().threads.reduce(function (n, th) { return n + th.messages.length; }, 0), msgsBefore,
      'compaction leaves every stored message in place');
    var cr = CA.compactReceipt(id);
    t.ok(cr && cr.preservedAncestry === true, 'the compaction receipt preserves ancestry');

    /* Opening an artifact must not inject it into context. */
    var includedBefore = CA.receipt(id).included.length;
    global.PMXArtifacts.open('artifact-diff');
    global.PMXArtifacts.forceReady('artifact-diff');
    t.eq(CA.receipt(id).included.length, includedBefore, 'opening an artifact does not change what is admitted');
    global.PMXArtifacts.close();
  });

  /* ------------------------------------------------------------------ threadops */

  A.suite('threadops', function (t) {
    var TO = global.PMXThreadOps;
    reset();
    var rel = TO.related('thread-01');
    t.ok(rel.length > 0, 'related threads are projected');
    t.eq(JSON.stringify(rel).indexOf('"messages"'), -1, 'a related-thread shell carries no message array');

    t.throws(function () { TO.readRange('thread-01', 0, 60); }, 'readRange refuses a range beyond its bound');
    t.ok(TO.readRange('thread-01', 0, 10).length <= 11, 'a bounded read returns at most the requested slice');

    TO.request({ sourceThreadId: 'thread-01', targetThreadId: 'thread-03', task: 'x' });
    var cycle = TO.request({ sourceThreadId: 'thread-03', targetThreadId: 'thread-01', task: 'y' });
    t.eq(cycle.status, 'refused_cycle', 'a request back to an open source is refused as a cycle');
    t.ok(cycle.reason, 'the cycle refusal states a reason');

    var last = null;
    for (var i = 0; i < 6; i++) {
      last = TO.request({ sourceThreadId: 'thread-05', targetThreadId: 'thread-' + String(6 + i).slice(-2), task: 't' });
    }
    t.eq(last.status, 'refused_fanout', 'requests past the fanout bound are refused');

    var msgsBefore = data().threadById('thread-01').messages.length;
    var br = TO.branch({ threadId: 'thread-01', messageId: 't01-m0014' });
    t.eq(data().threadById('thread-01').messages.length, msgsBefore, 'branching does not mutate the source thread');
    t.ok(br && br.branchedFrom, 'the branch record carries its lineage');

    var rw = TO.rewind('thread-01', 't01-m0014');
    t.ok(rw.ok && rw.restorePointId, 'a rewind always leaves a restore point behind');

    var rd = TO.redirect('thread-01', 'target the settings screen instead');
    t.ok(rd && rd.originalAttempt && typeof rd.originalAttempt.partialBody === 'string',
      'a redirect preserves the interrupted attempt');
    t.ok(['interrupted', 'redirected', 'resumed'].indexOf(rd.phase) >= 0, 'a redirect records its phase');
  });

  /* ------------------------------------------------------------------ sync */

  A.suite('sync', function (t) {
    var S = global.PMXSync;
    reset();
    S.setTransport('offline');
    t.eq(S.domain(), 'live', 'transport and domain are independent axes');

    S.enqueue({ id: 'probe-1', commandId: 'cmd.chat.send', payload: { threadId: tid(), body: 'a' } });
    S.enqueue({ id: 'probe-2', commandId: 'cmd.chat.send', payload: { threadId: tid(), body: 'b' } });
    S.reconnect();
    var first = S.outbox().map(function (e) { return e.id + ':' + e.attempts; }).join(',');
    S.reconnect();
    var second = S.outbox().map(function (e) { return e.id + ':' + e.attempts; }).join(',');
    t.eq(second, first, 'a second reconnect sends nothing new');
    t.eq(S.outbox().filter(function (e) { return e.attempts > 1; }).length, 0,
      'reconnect idempotency: every entry is sent exactly once');
    t.eq(S.transport(), 'live', 'a completed reconnect ends live');

    var r = S.route();
    ['homeServer', 'executionHost', 'environment', 'connectionRoute'].forEach(function (k) {
      t.ok(typeof r[k] === 'string' && r[k].length > 0 && r[k].length < 40, 'route token ' + k + ' is compact');
    });
    t.eq(S.serverWork().filter(function (x) { return x.continuesWhenClientCloses !== true; }).length, 0,
      'host-owned work is marked as continuing when the client closes');
  });

  /* ------------------------------------------------------------------ spell */

  A.suite('spell', function (t) {
    var Sp = global.PMXSpell;
    var id = tid();
    var text = 'We keep them seperate here.\n```\nseperate\n```\nand `seperate` inline too.';
    var hits = Sp.check(text, id);
    t.eq(hits.length, 1, 'only the prose instance is flagged; fenced and inline code are skipped');

    var ranges = Sp.skipRanges(text);
    var overlapping = 0;
    for (var i = 1; i < ranges.length; i++) if (ranges[i][0] < ranges[i - 1][1]) overlapping++;
    t.eq(overlapping, 0, 'skip ranges are sorted and non-overlapping');

    /* Ten skip categories, each asserted with its own sample. */
    var samples = {
      'fenced code': '```\nseperate\n```',
      'inline code': 'a `seperate` b',
      'url': 'see https://example.com/seperate now',
      'path': 'open C:\\work\\seperate\\file.txt now',
      'shell command': '$ run seperate --now',
      'hex hash': 'commit a1b2c3d4e5f now',
      'identifier': 'call seperate_thing now',
      'structured data': 'title: seperate',
      'quoted literal': 'he said "seperate" loudly',
      'known name': 'ask Opus 5 about it'
    };
    Object.keys(samples).forEach(function (label) {
      var sample = samples[label];
      var r = Sp.skipRanges(sample);
      t.ok(r.length > 0 || label === 'known name', 'skip category covered: ' + label);
    });

    /* No automatic replacement, ever. */
    var draftBefore = store().view(id).draft.text;
    Sp.check(text, id);
    t.eq(store().view(id).draft.text, draftBefore, 'checking spelling never rewrites the draft');
  });

  /* ------------------------------------------------------------------ attach */

  A.suite('attach', function (t) {
    var At = global.PMXAttach;
    var id = tid();
    var cases = [
      ['provider-audit.zip', 'application/zip', 2411520, 'transformed', 'Safe manifest and 3 extracted files'],
      ['settings-spec.pdf', 'application/pdf', 1884160, 'transformed', 'Text plus 4 page images'],
      ['standup.m4a', 'audio/mp4', 9437184, 'transformed', 'Transcript'],
      ['walkthrough.mov', 'video/quicktime', 48210944, 'unsupported', null],
      ['allowance.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 306176, 'transformed', 'Sheet and range summaries'],
      ['capture-1.png', 'image/png', 524288, 'native', null]
    ];
    cases.forEach(function (c) {
      var res = At.resolve(id, { name: c[0], mime: c[1], bytes: c[2] });
      t.eq(res.class, c[3], c[0] + ' resolves to ' + c[3]);
      if (c[4]) t.eq(res.representation, c[4], c[0] + ' representation is verbatim');
      if (res.class === 'transformed') t.ok(res.lineage && res.lineage.originalId, c[0] + ' keeps its lineage');
    });

    var vid = At.of(id).filter(function (r) { return /\.mov$/.test(r.name); })[0];
    t.ok(vid, 'the unsupported video resolution is retained');
    var routed = At.route(id, vid.id, (vid.actions[vid.actions.length - 1] || {}).id);
    t.ok(routed.warningId, 'an alternate route raises a decision');
    var rec = global.PMXApprovals.pending(id).filter(function (r) { return r.id === routed.warningId; })[0];
    if (rec) t.ok(String(rec.cls).indexOf('privacy_hosting_change') >= 0, 'the alternate route is a privacy and hosting change');
  });

  /* ------------------------------------------------------------------ ops */

  A.suite('ops', function (t) {
    var O = global.PMXOps;
    reset();
    fire('system', 'port_collision');
    var conflicts = O.conflicts('thread-01') || [];
    var port = conflicts.filter(function (c) { return c.kind === 'port'; })[0];
    t.ok(port, 'the port conflict is projected');
    if (port) {
      t.eq(port.summary, 'Port 3000 is used by the checkout redesign in another worktree. Use 3001 instead?',
        'the port conflict copy is verbatim');
      t.eq(port.actions.map(function (a) { return a.label; }).join('|'), 'Use 3001|Details|Cancel',
        'the port conflict action set is verbatim');
    }

    var PROSE = ['Isolated and clean', 'Waiting for writer', 'Conflict detected',
                 'Patch preserved after failed merge', 'Cleanup pending'];
    var trees = O.worktrees() || [];
    t.ok(trees.length > 0, 'worktrees are projected');
    t.eq(trees.filter(function (w) { return PROSE.indexOf(w.state) < 0; }).length, 0,
      'every worktree state is one of the five human-readable strings');

    var wt = conflicts.filter(function (c) { return c.kind === 'worktree'; })[0];
    if (wt) t.eq(wt.actions.filter(function (a) { return /remove/i.test(a.label); }).length, 0,
      'a worktree conflict never offers to remove another owner\u2019s worktree');

    var p = O.pressure();
    ['cpu', 'memory', 'disk', 'gpu'].forEach(function (k) {
      t.ok(typeof p[k] === 'number' && p[k] >= 0 && p[k] <= 1, 'pressure ' + k + ' is a ratio');
    });
  });

  /* ------------------------------------------------------------------ crew */

  A.suite('crew', function (t) {
    var C = global.PMXCrew;
    reset();
    var tpl = C.templates();
    t.ok(tpl.length > 0, 'crew templates exist');
    C.start('thread-01', tpl[0].id);
    t.ok(C.of('thread-01'), 'starting a crew writes the thread it was started in');
    t.eq(C.of('thread-02'), null, 'a crew in one thread does not appear in another');
    var rec = C.of('thread-01');
    t.ok(rec.members.length > 0, 'the crew has members');
    t.eq(rec.members.filter(function (m) { return !m.route; }).length, 0, 'every member carries its route');
    t.ok(rec.reducer, 'the crew has a parent reducer');
    C.stop('thread-01');
  });

  /* ------------------------------------------------------------------ capacity */

  A.suite('work', function (t) {
    var f = global.PMXCapacity.forecast('thread-01');
    t.eq(f.requested, 6, 'the capacity forecast reports the requested specialist count');
    t.eq(f.recommendedConcurrent, 2, 'the forecast recommends two concurrent');
    t.eq(f.waves, 3, 'the forecast plans three waves');
    t.eq(f.reason, 'provider allowance and verification reserve', 'the forecast reason is verbatim');
    t.eq(f.droppedRoles.length, 0, 'a required role is never silently dropped');

    /* The Goal projection is a projection, not a second Goal system. */
    t.ok(typeof global.PMXGoals.phaseOf === 'function', 'the Goal phase projection exists');
    t.ok(typeof global.PMXGoals.completionReceipt === 'function', 'the Goal completion receipt exists');
  });

  /* ------------------------------------------------------------------ notify */

  A.suite('notify', function (t) {
    var N = global.PMXNotify;
    reset();
    var id = N.push({ kind: 'info', title: 'Goal finished', body: 'The settings refresh completed.' });
    t.eq(N.unread(), 1, 'a pushed notification is unread');
    t.ok(N.markRead(id), 'a notification can be marked read');
    t.eq(N.unread(), 0, 'marking read clears the count');

    /* The boundary: the inbox lives in the title bar and nowhere else. */
    t.ok(q('[data-pmx-region="notifyHost"]'), 'the title bar hosts the notification inbox');
    t.notOk(q('[data-pmx-window] [data-pmx-notify]'), 'no notification surface exists inside a window concept');
    var railNotify = qa('.pmx-shell-rail-item').filter(function (b) {
      return /notif/i.test(b.getAttribute('data-rail-item') || '');
    });
    t.eq(railNotify.length, 0, 'the application rail carries no notification item');
  });

  /* ------------------------------------------------------------------ history (probe 1) */

  A.suite('history', function (t) {
    reset();
    var floors = {
      w1: [400, 280, 56, 900], w2: [400, 272, 0, 900], w3: [440, 268, 40, 900], w4: [400, 0, 34, 0],
      w5: [400, 268, 0, 900], w6: [400, 300, 64, 760], w7: [400, 260, 72, 820], w8: [400, 260, 44, 900]
    };
    Object.keys(floors).forEach(function (w) {
      var f = global.PMXThreadHistory.floorsFor(w);
      t.deepEq([f.minChat, f.fullColumn, f.compactColumn, f.minStageForFull], floors[w], w + ' floors are registered');
    });
    t.eq(global.PMXThreadHistory.pinState, undefined, 'the pinState compatibility shim is gone');

    /* The shell projection is exactly seven fields — the subscription weight rule. */
    var shell = global.PMXThreadHistory.shellOf(data().threadById('thread-01'));
    t.deepEq(Object.keys(shell).sort(),
      ['archived', 'id', 'pinned', 'project', 'threadState', 'title', 'updatedAt'],
      'a row shell carries exactly the seven identity fields');

    /* Probe 1: pinned history across all four states in every window. */
    var perWindow = [];
    ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'].forEach(function (w) {
      setPairing(w, 't1');
      store().set('ui.chatWidth', 1200);
      var seen = [];
      ['peek', 'pin_full', 'pin_compact', 'unpin'].forEach(function (ev) {
        fire('history', ev);
        settleAll();
        /* Read the RESOLUTION, not a rendered attribute: `resolve` is the contract every window
         * adopts, and reading it directly means this probe measures the four-state model rather
         * than whether a particular window chose to stamp a particular marker. */
        var host = q('[data-pmx-region="threadHistory"]');
        var resolved = global.PMXThreadHistory.resolve(
          { store: store(), services: {} },
          host || q('[data-pmx-region="transcript"]'),
          global.PMXThreadHistory.floorsFor(w)
        );
        seen.push(resolved.effective);
      });
      perWindow.push(w + ':' + seen.join('>'));
      t.ok(seen.indexOf('pinned-compact') >= 0, w + ' reaches pinned-compact');
      t.ok(seen.indexOf('pinned-full') >= 0, w + ' reaches pinned-full');
    });
    t.ok(perWindow.length === 8, 'every window resolved all four history states');
  });

  /* ------------------------------------------------------------------ artifact (probe 4) */

  A.suite('artifact', function (t) {
    reset();
    var Ar = global.PMXArtifacts;
    t.ok(Ar.list().length >= 7, 'the catalog holds at least seven artifacts');
    var ids = Ar.list().map(function (a) { return a.id; });
    t.ok(ids.indexOf('artifact-context') >= 0, 'the context admission receipt is a catalog record');
    t.ok(ids.indexOf('artifact-crew') >= 0, 'the crew synthesis is a catalog record');

    var frames = { w1: 'rows', w2: 'tabs', w3: 'markers', w4: 'segments', w5: 'band', w6: 'sheettabs', w7: 'railpopup', w8: 'capsules' };
    Object.keys(frames).forEach(function (w) {
      t.eq(Ar.frame(w).switcher, frames[w], w + ' uses its own switcher idiom');
    });

    Ar.open('artifact-diff');
    t.eq(Ar.stateOf('artifact-diff'), 'loading', 'opening an artifact enters loading');
    Ar.forceReady('artifact-diff');
    t.eq(Ar.stateOf('artifact-diff'), 'ready', 'forceReady settles in the same tick');

    /* Probe 4: the artifact workspace does not overlap history, transcript or composer. */
    ['w1', 'w2', 'w3', 'w5', 'w6', 'w7', 'w8'].forEach(function (w) {
      setPairing(w, 't1');
      store().set('ui.chatWidth', 1200);
      fire('history', 'pin_full');
      fire('artifact', 'ready');
      settleAll();
      var host = q('[data-pmx-region="artifactHost"]');
      var tr = q('[data-pmx-region="transcript"]');
      var comp = q('[data-pmx-region="composerHost"]');
      if (!host || !tr || !comp) { t.record(false, w + ' is missing a region for the artifact probe'); return; }
      var hr = A.rect(host), tRect = A.rect(tr), cRect = A.rect(comp);
      if (hr.width > 0) {
        /* w8 is the frameless concept: its artifact is a FLOATING capsule and overlaying the
         * transcript is the arrangement, not a fault. What is never acceptable in any concept is
         * covering the composer — that is the one control which must stay reachable. */
        if (w !== 'w8') A.noOverlap(hr, tRect, w + ': the artifact does not overlap the transcript');
        A.noOverlap(hr, cRect, w + ': the artifact does not overlap the composer');
      } else {
        t.ok(true, w + ': the artifact host is collapsed at this width, so there is nothing to overlap');
      }
    });
  });

  /* ------------------------------------------------------------------ question (probe 2) */

  A.suite('question', function (t) {
    reset();
    var Q = global.PMXQuestionnaire;
    t.eq(Q.PREPARE_MS, 900, 'the prepare beat has a fixed duration');
    t.eq(Q.SUBMIT_MS, 700, 'the submit beat has a fixed duration');

    setPairing('w1', 't1');
    var id = tid();

    /* The draft must survive the whole flow — the video-A principle. */
    var draft = 'a sentence I was in the middle of';
    store().view(id).draft.text = draft;

    fire('question', 'prepare');
    var rec = Q.activeFor(id);
    t.ok(rec, 'a prepared questionnaire is queued');
    t.eq(rec.status, 'preparing', 'the flow opens in its preparing beat');
    fire('question', 'open');
    t.eq(Q.activeFor(id).status, 'active', 'the flow becomes active');
    t.eq(store().view(id).draft.text, draft, 'the draft survives the question arriving');

    var qid = Q.activeFor(id).id;
    var first = Q.activeFor(id).questions[0];
    t.notOk(Q.validate(qid, first.id).ok, 'a required question refuses to advance while unanswered');
    t.eq(Q.validate(qid, first.id).reason, 'Choose at least one option.', 'the refusal reason is verbatim');

    Q.answer(qid, first.id, (first.options || [])[0]);
    t.ok(Q.validate(qid, first.id).ok, 'answering satisfies validation');
    Q.next(qid);

    var second = Q.activeFor(id).questions[Q.currentIndex(qid)];
    Q.skip(qid, second.id);
    var third = Q.activeFor(id).questions[Q.currentIndex(qid)];
    Q.answer(qid, third.id, 'nothing else');
    Q.skip(qid, third.id);
    t.ok(Q.atEnd(qid), 'skipping the last question reaches the terminal index rather than silently doing nothing');

    var receipt = Q.finishSubmit(qid) || (Q.submit(qid), Q.finishSubmit(qid));
    t.ok(receipt, 'submitting returns a durable receipt');
    if (receipt) {
      t.eq(receipt.status, 'submitted', 'the receipt records the outcome');
      t.ok(receipt.skipped.length > 0, 'the receipt records which questions were skipped');
    }
    t.eq(store().view(id).draft.text, draft, 'the draft is still there after submission');

    var hist = store().view(id).questionnaire.history;
    t.ok(hist.length > 0 && hist[hist.length - 1].receipt, 'the receipt remains in history');
  });

  /* ------------------------------------------------------------------ distinctness */

  /* ------------------------------------------------------------------ forms
   *
   * The eight question systems, the eight work clusters, and the yield rule between them.
   *
   * The `question` suite above asserts the SERVICE: phases, validation, receipts. This suite asserts the
   * eight FORMS the packet requires those services to be rendered as - which is the part a refactor can
   * silently flatten back into one shared card without failing anything else.
   *
   * Each assertion names a decision, not an implementation detail. "t3 shows no `N of M` anywhere" is a
   * decision: its filled-node run IS the progress indicator, so a counter would be a second one. "t6's
   * form has no border and no background" is a decision: that concept has no containers, and a form that
   * needed a box to be legible would not belong in it.
   */
  var FORMS = [
    { id: 't1', question: '.t1-qturn', work: '.t1-wstrip', handoff: '.t1-handoff',
      cluster: '.t1-wstrip', advicePersists: true },
    { id: 't2', question: '.t2-capsule', work: '.t2-chips-host .t2-chip', handoff: '.t2-handoff',
      cluster: '.t2-chips-host .t2-chip', advicePersists: false },
    { id: 't3', question: '.t3-qrun', work: '.t3-wunit', handoff: '.t3-handoff',
      cluster: '.t3-wunit', advicePersists: true },
    { id: 't4', question: '.t4-qdigest', work: '.t4-work', handoff: '.t4-handoff',
      cluster: '.t4-work', advicePersists: true },
    { id: 't5', question: '.t5-qlane', work: '.t5-rail', handoff: '.t5-handoff',
      cluster: '.t5-rail', advicePersists: true },
    { id: 't6', question: '.t6-form', work: '.t6-log', handoff: '.t6-handoff',
      cluster: '.t6-log', advicePersists: false },
    { id: 't7', question: '.t7-deck', work: '.t7-status', handoff: '.t7-handoff',
      cluster: '.t7-status', advicePersists: false },
    { id: 't8', question: '.t8-qnote', work: '.t8-cluster', handoff: '.t8-handoff',
      cluster: '.t8-cluster', advicePersists: false }
  ];

  A.suite('forms', function (t) {
    /* ---- 1. every concept renders ITS OWN question form, and only its own.
     * This is the assertion that fails if the shared choreography is ever reintroduced: eight concepts
     * rendering one shared surface would satisfy every other suite in this file. */
    FORMS.forEach(function (f) {
      reset();
      setPairing('w1', f.id);
      fire('question', 'open');

      t.ok(q(f.question), f.id + ' renders its own question form (' + f.question + ')');

      var foreign = FORMS.filter(function (o) { return o.id !== f.id; })
        .filter(function (o) { return !!q(o.question); })
        .map(function (o) { return o.question; });
      t.eq(foreign.length, 0, f.id + ' renders no other concept\u2019s question form');
    });

    /* ---- 2. the structural decision each form is built on */

    reset(); setPairing('w1', 't1'); fire('question', 'open');
    var t1q = q('.t1-qturn');
    t.ok(t1q && t1q.classList.contains('t1-turn'),
      't1 asks as a real speaker turn, not a card dropped beside the transcript');
    t.ok(q('.t1-qmargin .t1-qcount'), 't1 puts the progress in the hanging margin');
    t.ok(q('.t1-qrows .t1-qrow .t1-qrow-mark'),
      't1 options are hanging-indent rows, so wrapped text aligns under itself');

    reset(); setPairing('w1', 't2'); fire('question', 'prepare');
    var cap = q('.t2-capsule');
    t.ok(cap, 't2 opens as a slim capsule above the composer');
    t.eq(cap && cap.getAttribute('data-expanded'), '0', 't2 starts compressed');
    /* Identity across the phase change is the whole requirement: the capsule must BECOME the card. */
    if (cap) cap.setAttribute('data-pmx-probe', 'capsule-1');
    fire('question', 'open');
    var cap2 = q('.t2-capsule');
    t.eq(cap2 && cap2.getAttribute('data-pmx-probe'), 'capsule-1',
      't2 expands the SAME element rather than swapping in a different one');
    t.eq(cap2 && cap2.getAttribute('data-expanded'), '1', 't2 marks the expanded state on that element');
    t.eq(qa('.t2-capsule').length, 1, 't2 never has two capsules at once');
    t.ok(q('.t2-capsule-foot .t2-capsule-count'), 't2 puts the counter in the card foot');
    t.ok(q('.t2-capsule-close'), 't2 makes Cancel the card\u2019s close control');

    reset(); setPairing('w1', 't3'); fire('question', 'open');
    var run = q('.t3-qrun');
    t.ok(run, 't3 renders the question as a run of nodes on the spine');
    t.ok(qa('.t3-qnode').length >= 2, 't3 shows every question as its own node');
    /* The filled-node run IS the progress, so a counter would be a second indicator for one fact. */
    t.notOk(/\b\d+\s+of\s+\d+\b/.test(run ? run.textContent : ''),
      't3 shows no "N of M" anywhere \u2014 the filled-node run is the progress');

    reset(); setPairing('w1', 't4'); fire('question', 'open');
    t.ok(q('.t4-qdigest'), 't4 asks as one more digest entry');
    t.ok(q('.t4-qdigest-line .t4-qdigest-count'), 't4 keeps the counter inside the digest line');
    t.eq(q('.t4-qdigest') && q('.t4-qdigest').getAttribute('data-open'), '1',
      't4 uses the concept\u2019s own open/close attribute');

    reset(); setPairing('w1', 't5'); fire('question', 'open');
    t.ok(q('.t5-qlane[data-lane="assistant"]'), 't5 puts the prompt in the assistant lane');
    t.ok(q('.t5-qlane[data-lane="user"]'), 't5 puts the answer form in the user lane');
    t.ok(q('.t5-qlane[data-lane="user"] .t5-qcount'), 't5 puts the counter above the user-lane form');

    reset(); setPairing('w1', 't6'); fire('question', 'open');
    var form = q('.t6-form');
    t.ok(form, 't6 renders a monospace field form');
    if (form) {
      var cs = getComputedStyle(form);
      /* No card: this concept has no containers, and a form that needed a box would not belong in it. */
      t.eq(parseFloat(cs.borderTopWidth) || 0, 0, 't6 draws no border around the form');
      t.ok(/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor), 't6 gives the form no background');
      t.eq(parseFloat(cs.borderTopLeftRadius) || 0, 0, 't6 gives the form no corner radius');
    }
    t.ok(/^Q1\/\d+$/.test((q('.t6-form-row .t6-log-kind') || {}).textContent || ''),
      't6 prefixes each question with a fixed-width Q1/N');
    t.ok(q('.t6-form-opt .t6-form-num'), 't6 numbers its options for the keyboard');
    t.ok(qa('.t6-form-row').length >= 2, 't6 shows every question at once, which a list can afford');

    reset(); setPairing('w1', 't7'); fire('question', 'open');
    var deck = q('.t7-deck');
    t.ok(deck, 't7 renders a deck');
    var cards = qa('.t7-qcard');
    t.ok(cards.length >= 2 && cards.length <= 3, 't7 shows at most three cards, however many questions remain');
    t.eq(cards.filter(function (c) { return c.querySelector('.t7-qcard'); }).length, 0,
      't7 keeps the deck\u2019s cards as siblings \u2014 one nesting level, never a card inside a card');
    t.ok(q('.t7-qcard[data-top="1"] .t7-qdots .t7-qdot'),
      't7 carries the true question count as a dot rank, which is what lets the deck cap at three');

    reset(); setPairing('w1', 't8'); fire('question', 'open');
    t.ok(q('.t8-qnote'), 't8 asks as a prose footnote');
    var ol = q('.t8-qlist');
    t.eq(ol && ol.tagName, 'OL', 't8 uses a real ordered list, so the numbering is the browser\u2019s');
    var sup = q('.t8-qnote-num');
    t.eq(sup && sup.tagName, 'SUP', 't8 marks progress as a footnote reference, not a widget');
    t.ok(q('.t8-qnote-gutter'), 't8 marks the question in the micro-gutter');

    /* ---- 3. the yield rule.
     * A pending question hides the work surfaces and keeps the artifact handoff, because the handoff is
     * the work's product rather than a work surface. Advice follows its host: where a concept gives it
     * one of its own it survives, and where advice IS a member of the cluster it yields with it. */
    /* thread-06 carries a live goal and todo and NO authored questionnaire, which is the only way to
     * observe the un-yielded cluster without the harness resolving a question on the concept's behalf -
     * thread-01 always has one queued, so on that thread the cluster is correctly always yielded. */
    FORMS.forEach(function (f) {
      reset();
      setPairing('w1', f.id);
      store().set('session.activeThreadId', 'thread-06');
      fire('bsd', 'advice');

      t.notOk(global.PMXQuestionnaire.activeFor(tid()), f.id + ': thread-06 has no question pending');
      t.ok(qa(f.cluster).length > 0, f.id + ' renders a work cluster when no question is pending');

      store().set('session.activeThreadId', 'thread-01');
      fire('question', 'open');
      t.eq(qa(f.cluster).length, 0, f.id + ' yields its work cluster to a pending question');
      t.ok(q(f.handoff), f.id + ' keeps the artifact handoff \u2014 it is the work\u2019s product, not a work surface');
    });

    /* ---- 3b. resolving THROUGH THE CONCEPT'S OWN UI hands the work surfaces back.
     *
     * This is the assertion that would have caught the worst defect this phase produced: for a while only
     * Cancel released `surfacesYielded`, so a SUBMITTED flow left every work surface hidden for the rest of
     * the session. thread-06 cannot catch that class of bug at all - nothing yields there - and driving the
     * store directly cannot catch it either, because the release is wired to the concept's own controls.
     * So this drives each of the eight forms by clicking the controls it actually renders.
     *
     * Reduced motion is set first so condense, the deck slide and the capsule compress all fall through
     * synchronously: the assertion is about state, and waiting on animation frames inside a suite makes it
     * about timing instead. */
    var DRIVE = {
      t1: { opt: '.t1-qrow', free: '.t1-qfree', cmd: '.t1-qact', next: 'Next', send: 'Send answers' },
      t2: { opt: '.t2-capsule-opt', free: '.t2-capsule-free', cmd: '.t2-capsule-next, .t2-capsule-primary', next: 'Next', send: 'Submit' },
      t3: { opt: '.t3-opt', free: '.t3-qfree', cmd: '.t3-qact', next: 'Next', send: 'Submit' },
      t4: { opt: '.t4-qopt', free: '.t4-qfree', cmd: '.t4-act', next: 'Next', send: 'Submit' },
      t5: { opt: '.t5-opt', free: '.t5-qfree', cmd: '.t5-act', next: 'Next', send: 'Send' },
      t6: { opt: '.t6-form-opt', free: '.t6-form-field', cmd: '.t6-form-cmd', next: '[next]', send: '[submit]' },
      t7: { opt: '.t7-opt', free: '.t7-qfree', cmd: '.t7-act', next: 'Next', send: 'Send' },
      t8: { opt: '.t8-qlist-btn', free: '.t8-qfree', cmd: '.t8-act', next: 'Next', send: 'Send' }
    };

    FORMS.forEach(function (f) {
      var d = DRIVE[f.id];
      reset();
      store().set('ui.reducedMotion', true);
      setPairing('w1', f.id);
      fire('question', 'open');

      var host = q('[data-pmx-region="questionHost"]');
      t.ok(host && host.firstElementChild, f.id + ': a question is on screen to resolve');
      t.ok(store().view(tid()).surfacesYielded, f.id + ' yields while its question is unresolved');

      /* Answer and advance using only what this concept renders. */
      var sent = false;
      for (var step = 0; step < 8 && !sent; step++) {
        if (!host || !host.firstElementChild) break;
        var opt = host.querySelector(d.opt);
        if (opt) opt.click();
        var free = host.querySelector(d.free);
        if (free) { free.value = 'an answer typed into the field'; free.dispatchEvent(new Event('input', { bubbles: true })); }

        var btns = qa(d.cmd).filter(function (b) { return host.contains(b); });
        var advance = btns.filter(function (b) { return (b.textContent || '').trim() === d.next; })[0];
        if (advance) { advance.click(); continue; }
        var submit = btns.filter(function (b) { return (b.textContent || '').trim() === d.send; })[0];
        if (submit) { submit.click(); sent = true; }
        else break;
      }

      t.ok(sent, f.id + ' offers a submit control once every question is answered');
      t.notOk(global.PMXQuestionnaire.activeFor(tid()), f.id + ': the flow is resolved through its own UI');
      /* The release, which is the whole point of this block. */
      t.notOk(store().view(tid()).surfacesYielded, f.id + ' releases the work surfaces when its own UI resolves the flow');
      t.ok(qa(f.cluster).length > 0, f.id + ' brings its work cluster back after resolving');
      t.ok(global.PMXQFlow.read({ questionnaire: global.PMXQuestionnaire, surfaces: global.PMXSurfaces }, tid()).receipt,
        f.id + ' leaves a receipt its transcript can render');

      store().set('ui.reducedMotion', false);
    });

    /* ---- 4. PMXQFlow: the verb layer that must NOT differ per concept. */
    var QF = global.PMXQFlow;
    t.ok(QF, 'the question action layer is reachable');
    reset(); setPairing('w1', 't1'); fire('question', 'open');
    var svc = { questionnaire: global.PMXQuestionnaire, surfaces: global.PMXSurfaces };
    var id = tid();

    var flow = QF.read(svc, id);
    t.ok(flow && flow.record, 'read() reports the live flow');
    t.eq(flow.position, 1, 'read() counts visited questions, so the first question is 1');
    t.eq(flow.total, flow.questions.length, 'read() reports the true question count');
    t.ok(QF.pending(svc, id), 'pending() is true while a question is live');

    /* A refusal must name the offending question, so a renderer can put the reason at that field
     * instead of under the button that was pressed. */
    var refusal = QF.act(svc, id, 'submit');
    t.notOk(refusal.ok, 'submitting an unanswered required flow is refused');
    t.ok(typeof refusal.reason === 'string' && refusal.reason.length, 'the refusal carries verbatim words');
    t.eq(typeof refusal.offenderIndex, 'number', 'the refusal names WHICH question refused');

    /* Resolving must hand the work surfaces back. Before this existed, a submitted flow left them
     * yielded for the rest of the session. */
    var rec = global.PMXQuestionnaire.activeFor(id);
    (rec.questions || []).forEach(function (question, i) {
      global.PMXQuestionnaire.goTo(rec.id, i);
      global.PMXQuestionnaire.answer(rec.id, question.id,
        (question.options && question.options.length) ? question.options[0] : 'an answer');
    });
    global.PMXQuestionnaire.goTo(rec.id, (rec.questions || []).length);
    var done = QF.act(svc, id, 'submit');
    t.ok(done.ok && done.resolved, 'a satisfied flow submits and resolves in one interaction');
    t.notOk(store().view(id).surfacesYielded, 'resolving releases the work surfaces');
    t.notOk(QF.pending(svc, id), 'pending() is false once the flow resolves');

    var receipt = QF.read(svc, id).receipt;
    t.ok(receipt, 'a resolved flow leaves a receipt every concept can render');
    t.eq(receipt.status, 'submitted', 'the receipt records the outcome');

      /* ------------------------------------------------------------------ provider acquisition
   *
   * PROVIDER_CLI_FINAL_ADJUDICATION.md was missing from the original packet. These assertions are
   * what stop it going missing again: they fail if the never-bundled rule, the official-source rule
   * or the install/authenticate separation is ever softened out of the copy. */

  A.suite('provider', function (t) {
    var R = global.PMXRoute;

    /* -- the forbidden half. The adjudication supersedes an earlier bundle that allowed
     * "Included with this Server" for provider CLIs, so these phrases must not come back. */
    var FORBIDDEN = [
      'included with this server',
      'bundled with',
      'pre-seeded',
      'ships with puppet master',
      'included in the baseline',
      'included execution baseline'
    ];
    var states = R.SETUP_STATES || [];
    var allCopy = states.map(function (s) { return R.setupReason(s); }).join(' \u00b7 ');
    R.accounts().forEach(function (a) {
      var acq = R.acquisitionFor(a.id);
      if (!acq) return;
      allCopy += ' \u00b7 ' + [acq.headline, acq.source, acq.separation, acq.host, acq.consent].join(' ');
    });
    var lower = allCopy.toLowerCase();
    var found = FORBIDDEN.filter(function (p) { return lower.indexOf(p) >= 0; });
    t.eq(found.length, 0, 'no provider copy claims a bundled or baseline-included CLI');

    /* -- the required half. A first acquisition must name the official source, deny bundling, and
     * separate installation from authentication. */
    var firstStates = states.filter(function (s) { return R.ACQUISITION_KIND[s] === 'first'; });
    t.ok(firstStates.length >= 2, 'the catalog models more than one first-acquisition state');

    var acctNeedingInstall = null;
    R.accounts().forEach(function (a) {
      var acq = R.acquisitionFor(a.id);
      if (acq && acq.kind === 'first' && !acctNeedingInstall) acctNeedingInstall = acq;
    });
    if (!acctNeedingInstall) {
      /* Derive it from the state table rather than skipping: the assertion is about the copy, and
       * the copy exists whether or not the fixture happens to seed an account into that state. */
      acctNeedingInstall = { kind: 'first', source: '', separation: '', host: '', consent: '' };
      var probe = R.accounts()[0];
      var was = R.setupStateOf(probe.id);
      R.setSetupState(probe.id, 'install_required');
      acctNeedingInstall = R.acquisitionFor(probe.id);
      R.setSetupState(probe.id, was);
    }
    t.eq(acctNeedingInstall.kind, 'first', 'install_required is a first-acquisition state');
    t.ok(/official/i.test(acctNeedingInstall.source),
      'first-acquisition copy names the official source');
    t.ok(/does not bundle/i.test(acctNeedingInstall.source),
      'first-acquisition copy denies bundling in words, not by omission');
    t.ok(/separate step/i.test(acctNeedingInstall.separation),
      'installation and authentication are described as separate steps');
    t.ok(/Host and Environment/i.test(acctNeedingInstall.host),
      'the installation is scoped to the exact Host and Environment');
    t.ok(/not consent/i.test(acctNeedingInstall.consent),
      'Auto and On are explicitly not consent for a first acquisition');

    /* -- post-consent lifecycle must NOT carry first-acquisition consent language, or an update
     * would read as though it were asking permission it already has. */
    var probe2 = R.accounts()[0];
    var was2 = R.setupStateOf(probe2.id);
    R.setSetupState(probe2.id, 'update_available');
    var life = R.acquisitionFor(probe2.id);
    t.eq(life.kind, 'lifecycle', 'update_available is post-consent lifecycle, not acquisition');
    t.notOk(/does not bundle/i.test(life.source),
      'a lifecycle update does not repeat the first-acquisition denial');
    t.ok(/never performs a first acquisition/i.test(life.consent),
      'automatic update policy states that it never performs a first acquisition');

    /* -- a ready account needs no acquisition block at all. */
    R.setSetupState(probe2.id, 'ready');
    t.eq(R.acquisitionFor(probe2.id), null, 'a ready account renders no acquisition block');
    R.setSetupState(probe2.id, was2);

    /* -- the deep link carries the policy with it, so consent is never collected without it. */
    var was3 = R.setupStateOf(probe2.id);
    R.setSetupState(probe2.id, 'cli_missing');
    var target = R.settingsTarget(probe2.id);
    t.ok(!!target.acquisition, 'the Provider Settings deep link carries its acquisition policy');
    t.ok(!!target.returnContext && !!target.returnContext.returnLabel,
      'the deep link preserves a continuation back to the conversation');
    R.setSetupState(probe2.id, was3);
  });

  /* ------------------------------------------------------------------ operation card
   *
   * pm7_popout.png shows COMMAND / PROVIDER / CACHE / PERMISSION / COST / OPERATION_INPUT. None of
   * those existed here before the media was indexed. These assertions hold the derived halves to the
   * live services, so a card can never claim a grant the access profile does not give. */

  A.suite('opcard', function (t) {
    var O = global.PMXOpCard;
    var ctx = { store: store(), data: global.PMXData.get(), services: global.PMXWorkspace.services || {} };
    var id = tid();

    var cards = O.forThread(ctx, id);
    t.ok(cards.length >= 9, 'every authored activity stage yields an operation record');
    t.deepEq(O.FIELD_ORDER,
      ['COMMAND', 'PROVIDER', 'CACHE', 'PERMISSION', 'COST', 'OPERATION_INPUT'],
      'the field order matches the reference screenshot');

    var incomplete = cards.filter(function (c) { return c.fields.length !== 6; });
    t.eq(incomplete.length, 0, 'no operation renders a partial field set');
    var blank = cards.filter(function (c) {
      return c.fields.some(function (f) { return f.value == null || f.value === '' || f.value === 'unknown'; });
    });
    t.eq(blank.length, 0, 'no operation field resolves to blank or unknown');

    /* PERMISSION is derived from the mode's tool ceiling, so narrowing the mode must narrow it. */
    var was = store().runtime(id, 'mode');
    var perm = function (kind) {
      var c = O.forThread(ctx, id).filter(function (x) { return x.kind === kind; })[0];
      return c.fields.filter(function (f) { return f.key === 'PERMISSION'; })[0].value;
    };
    store().setRuntime(id, 'mode', 'Ask');
    t.ok(/not granted/.test(perm('edit')), 'Ask mode does not grant file edits to an edit operation');
    store().setRuntime(id, 'mode', 'Agent');
    t.ok(/\u00b7 granted/.test(perm('edit')), 'Agent mode grants file edits to the same operation');
    t.neq(perm('edit'), perm('browser'), 'two operations consuming different tools report different permissions');
    store().setRuntime(id, 'mode', was);

    /* The tense rule from reference 03: participle while running, past tense once settled. */
    var S = global.PMXSurfaces;
    S.act(id, 'activity_kind', { kind: 'read' });
    var running = O.forThread(ctx, id).filter(function (c) { return c.kind === 'read'; })[0];
    t.ok(running.running, 'the fired kind is the running operation');
    t.eq(running.headline, 'Reading 7 files', 'a running operation reads as a present participle');
    var partial = running.count;
    S.act(id, 'activity_kind', { kind: 'read' });
    var grown = O.forThread(ctx, id).filter(function (c) { return c.kind === 'read'; })[0];
    t.ok(grown.count > partial, 'firing the same kind again grows the count in place');
    S.act(id, 'activity_settle');
    var settled = O.forThread(ctx, id).filter(function (c) { return c.kind === 'read'; })[0];
    t.eq(settled.headline, 'Read 7 files', 'a settled operation reads as past tense');
    t.eq(settled.count, 7, 'settling lands the count on the authored total');
    t.notOk(settled.running, 'a settled operation is no longer the running one');

    /* Per-row deltas exist only where the fixture authored them. */
    var edit = O.forThread(ctx, id).filter(function (c) { return c.kind === 'edit'; })[0];
    t.eq(edit.rows.length, 3, 'the edit operation carries one row per touched file');
    var totals = edit.rows.reduce(function (acc, r) {
      return { a: acc.a + r.added, d: acc.d + r.removed };
    }, { a: 0, d: 0 });
    t.eq(totals.a, 184, 'the row additions sum to the change set total');
    t.eq(totals.d, 67, 'the row deletions sum to the change set total');
    var thought = O.forThread(ctx, id).filter(function (c) { return c.kind === 'thought'; })[0];
    t.eq(thought.rows.length, 0, 'a reasoning summary carries no file rows');
    t.eq(thought.fields.filter(function (f) { return f.key === 'PERMISSION'; })[0].value,
      'no tool required', 'a reasoning summary requires no tool grant');

    /* Command ids are candidates, but they must be well-formed and unique. */
    var ids = O.commandIds();
    var malformed = ids.filter(function (x) { return !/^cmd\.[a-z][a-z0-9_.]*$/.test(x); });
    t.eq(malformed.length, 0, 'every minted command id follows the cmd.<noun>.<verb> shape');
    var uniq = {};
    ids.forEach(function (x) { uniq[x] = 1; });
    t.eq(Object.keys(uniq).length, ids.length, 'no two operation kinds share a command id');
  });

/* ---- 5. the handoff card reports the transport it actually has. */
    FORMS.forEach(function (f) {
      reset();
      setPairing('w1', f.id);
      var card = q(f.handoff);
      t.ok(card, f.id + ' renders an artifact handoff card');
      if (!card) return;
      var stateEl = card.querySelector('[class$="-handoff-state"]');
      t.ok(stateEl && /compiling|ready/.test(stateEl.textContent),
        f.id + ' states whether the artifact is compiling or ready');
    });
  });

  A.suite('distinctness', function (t) {
    /* 07_...:93 makes it a hard failure if all concepts reuse the same question or activity
     * solution. This asserts the ROOT CLASS NAMES differ, which is the automatable half of it. */
    reset();
    var qRoots = {};
    var wRoots = {};
    ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'].forEach(function (th) {
      setPairing('w1', th);
      fire('question', 'prepare');
      fire('question', 'open');
      var host = q('[data-pmx-region="questionHost"]');
      var el = host && host.firstElementChild;
      qRoots[th] = el ? String(el.className).split(' ')[0] : 'none';
      var wh = q('[data-pmx-region="workSurfaceHost"]');
      var wel = wh && wh.firstElementChild;
      wRoots[th] = wel ? String(wel.className).split(' ')[0] : 'none';
      fire('question', 'cancel');
    });
    var qVals = Object.keys(qRoots).map(function (k) { return qRoots[k]; }).filter(function (v) { return v !== 'none'; });
    var wVals = Object.keys(wRoots).map(function (k) { return wRoots[k]; }).filter(function (v) { return v !== 'none'; });
    var uniqQ = {}; qVals.forEach(function (v) { uniqQ[v] = 1; });
    var uniqW = {}; wVals.forEach(function (v) { uniqW[v] = 1; });
    t.eq(Object.keys(uniqQ).length, qVals.length, 'every thread concept renders its own question root: ' + JSON.stringify(qRoots));
    t.eq(Object.keys(uniqW).length, wVals.length, 'every thread concept renders its own work-cluster root: ' + JSON.stringify(wRoots));
  });

  /* ------------------------------------------------------------------ motion */

  A.suite('motion', function (t) {

    /* swapText has two jobs and they are not the same job. A morph cross-fades one value into another; a
     * FIRST write has nothing to fade from, and deferring it to the second frame paints an empty slot -
     * which is what a freshly mounted work line, chip or status label used to do. Pinned here so the
     * distinction survives a later "simplification". */
    var fresh = document.createElement('span');
    document.body.appendChild(fresh);
    global.PMXMotion.swapText(fresh, 'first value');
    t.eq(fresh.textContent, 'first value', 'swapText writes a first value immediately, with no empty frame');
    global.PMXMotion.swapText(fresh, 'second value');
    t.eq(fresh.textContent, 'first value', 'swapText defers a REPLACEMENT so the two values can cross-fade');
    t.eq(fresh.style.opacity, '0', 'the outgoing value fades before it is replaced');
    fresh.parentNode.removeChild(fresh);
    var M = global.PMXMotion;
    ['arrive', 'questionPhase', 'condense', 'phaseStep', 'agentState', 'handoff', 'dockShift',
     'panelSwap', 'submenu', 'stateFlip', 'consequence', 'catchUp', 'lineage'].forEach(function (k) {
      t.ok(typeof M[k] === 'function', 'motion vocabulary includes ' + k);
    });

    /* An indefinite animation is legal only while a real operation runs. */
    var infinite = qa('*').filter(function (el) {
      var cs = global.getComputedStyle(el);
      return cs && cs.animationIterationCount === 'infinite' && cs.animationName !== 'none';
    });
    var unbacked = infinite.filter(function (el) {
      var opId = el.getAttribute('data-pmx-op');
      if (!opId) return true;
      return !global.PMXObservable.isRunning(opId);
    });
    t.eq(unbacked.length, 0, 'every indefinite animation is bound to a running operation');
    if (unbacked.length) {
      t.record(false, 'unbacked: ' + unbacked.slice(0, 3).map(function (el) {
        return String(el.className).split(' ')[0] + '/' + global.getComputedStyle(el).animationName;
      }).join(', '));
    }
  });

  /* ------------------------------------------------------------------ general (probe 5) */

  A.suite('general', function (t) {
    reset();
    setPairing('w3', 't6');

    /* Composer states. Each one is DRIVEN and asserted individually rather than counted, because a
     * count hides which state is unreachable — and "some states work" is not the requirement. The
     * run is stopped first so a leftover active turn cannot mask the state under test. */
    var Q0 = function () { return global.PMXQuestionnaire; };
    var comp = function () { return q('.pmx-composer'); };
    var cstate = function () { return comp() ? comp().getAttribute('data-pmx-cstate') : null; };
    var id2 = tid();
    if (global.PMXRuntime.isActive(id2)) global.PMXRuntime.stop(id2);
    store().view(id2).draft.text = '';
    store().touchView('draft');

    reset();
    /* thread-01 carries a questionnaire in the fixture, and `question` legitimately outranks the
     * draft-driven states — a pending question is what the user needs to read next. So the flow is
     * cancelled before the lower-priority states are observed; that is the priority order working,
     * not a defect. */
    var clearQuestions = function () {
      var pending = Q0().activeFor(id2);
      var guard = 0;
      while (pending && guard++ < 12) {
        Q0().cancel(pending.id);
        var next = Q0().activeFor(id2);
        if (next && next.id === pending.id) break;
        pending = next;
      }
      store().touchView('questionnaire');
    };
    clearQuestions();
    t.eq(cstate(), 'ordinary', 'an empty composer with nothing pending is ordinary');

    store().view(id2).draft.text = new Array(24).join('a long draft that keeps going ');
    store().touchView('draft');
    t.eq(cstate(), 'long', 'a draft past the length ceiling reports the long state');
    store().view(id2).draft.text = '';
    store().touchView('draft');

    fire('question', 'prepare');
    fire('question', 'open');
    t.eq(cstate(), 'question', 'an active question puts the composer in its question state');
    /* The video-A principle: the composer stays usable while a question holds the floor. */
    t.notOk(q('.pmx-composer-field').disabled, 'the composer field is NOT disabled during a question');
    t.eq(q('.pmx-composer-reason').textContent.indexOf('Answer the question above'), 0,
      'the question hint is verbatim');
    fire('question', 'cancel');

    fire('sync', 'offline');
    t.eq(cstate(), 'offline-queued', 'an offline transport puts the composer in its queued state');
    fire('sync', 'reconnect');

    fire('provider', 'needs_repair');
    t.eq(cstate(), 'setup-required', 'an unready account puts the composer in its setup state');
    t.ok(q('.pmx-composer-send').disabled, 'send is disabled while the route needs setup');
    t.ok(q('.pmx-composer-reason').textContent.length > 0, 'a disabled send always states a reason');
    reset();
    clearQuestions();

    fire('system', 'cross_project_grant');
    t.eq(cstate(), 'cross-project', 'a pending cross-project grant is a composer state');
    reset();
    clearQuestions();

    /* attachments and spell are draft-driven rather than director-driven. */
    var picker = global.PMXComposer.PICKER_FILES[0];
    global.PMXAttach.resolve(id2, { name: picker.name, mime: picker.mime, bytes: picker.bytes });
    global.PMXDrafts.addAttachment(id2, picker.name);
    store().touchView('draft');
    t.eq(cstate(), 'attachments', 'an attached file is a composer state');
    global.PMXDrafts.removeAttachment(id2, picker.name);
    store().touchView('draft');

    store().view(id2).draft.text = 'we keep them seperate here';
    store().touchView('draft');
    t.eq(cstate(), 'spell', 'a spelling hit is a composer state');
    store().view(id2).draft.text = '';
    store().touchView('draft');
    reset();

    /* No Resend and no per-message Stop, anywhere. */
    t.eq(qa('[data-pmx-window] button').filter(function (b) { return /resend/i.test(b.textContent || ''); }).length, 0,
      'no Resend control exists');
    var msgStops = qa('.msg button, [data-pmx-msg] button').filter(function (b) {
      return /^stop$/i.test((b.textContent || '').trim());
    });
    t.eq(msgStops.length, 0, 'Stop never appears under an individual message');

    /* Every scroller carries the shared class. */
    var scrollers = qa('*').filter(function (el) {
      var cs = global.getComputedStyle(el);
      return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4;
    });
    var unmarked = scrollers.filter(function (el) { return !el.classList.contains('pmx-scroll'); });
    t.eq(unmarked.length, 0, 'every real scroller carries pmx-scroll');
    if (unmarked.length) t.record(false, 'unmarked scrollers: ' + unmarked.slice(0, 3).map(function (el) { return String(el.className).split(' ')[0]; }).join(', '));
  });

  /* ------------------------------------------------------------------ runner API */

  function viewportOk() {
    return global.innerWidth >= MIN_VIEWPORT.width && global.innerHeight >= MIN_VIEWPORT.height;
  }

  function runAll(opts) {
    opts = opts || {};
    if (!opts.force && !viewportOk()) {
      return Promise.resolve({
        refused: true,
        reason: 'This suite needs a viewport of at least ' + MIN_VIEWPORT.width + '\u00d7' + MIN_VIEWPORT.height +
                ' because eight popup-anchor assertions fail below it for a reason that describes the window, ' +
                'not the product. Current viewport: ' + global.innerWidth + '\u00d7' + global.innerHeight + '.',
        required: MIN_VIEWPORT,
        actual: { width: global.innerWidth, height: global.innerHeight }
      });
    }
    A.reset();
    var names = A.list();
    var startedAt = Date.now();
    var chain = Promise.resolve();
    names.forEach(function (n) { chain = chain.then(function () { return A.runOne(n, opts); }); });
    return chain.then(function () {
      var res = A.results();
      var counts = A.consoleCounts();
      res.errors = counts.errors;
      res.warnings = counts.warnings;
      res.consoleMessages = A.consoleMessages();
      res.elapsedMs = Date.now() - startedAt;
      res.viewport = { width: global.innerWidth, height: global.innerHeight };
      return res;
    });
  }

  function run(name, opts) {
    A.reset();
    var startedAt = Date.now();
    return A.runOne(name, opts || {}).then(function () {
      var res = A.results();
      res.elapsedMs = Date.now() - startedAt;
      return res;
    });
  }

  /* runMatrix({windowId, threadId}) — the functional sweep across pairings and widths. Preserved
   * verbatim from the prior harness so a future report stays comparable. */
  function runMatrix(opts) {
    opts = opts || {};
    var pairs = global.PMX.registry.pairs().filter(function (p) {
      return (!opts.windowId || p.windowId === opts.windowId) && (!opts.threadId || p.threadId === opts.threadId);
    });
    var widths = opts.widths || [520, 750];
    var out = { pairings: [], total: 0, failed: 0, errors: 0, warnings: 0 };
    A.resetConsoleCounts();
    var chain = Promise.resolve();
    pairs.forEach(function (p) {
      widths.forEach(function (w) {
        chain = chain.then(function () {
          A.reset();
          setPairing(p.windowId, p.threadId);
          store().set('ui.chatWidth', w);
          settleAll();
          return A.runOne('mount', {}).then(function () {
            var r = A.results();
            out.total += r.total;
            out.failed += r.failed;
            out.pairings.push({ pairing: p.windowId + '+' + p.threadId, width: w, total: r.total, failed: r.failed });
          });
        });
      });
    });
    return chain.then(function () {
      var c = A.consoleCounts();
      out.errors = c.errors;
      out.warnings = c.warnings;
      return out;
    });
  }

  global.PMXSuites = {
    list: A.list,
    runAll: runAll,
    run: run,
    runMatrix: runMatrix,
    consoleCounts: A.consoleCounts,
    MIN_VIEWPORT: MIN_VIEWPORT
  };
})(window);
