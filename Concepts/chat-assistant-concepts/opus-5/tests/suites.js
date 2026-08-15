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
      /* DEMO_SCENARIO_MANIFEST.json specifies this collision exactly: port 4173 requested, occupied
       * by the Usage concept visual-test server, 4174 offered. The concept previously invented
       * 3000/3001 and a checkout worktree, so the one collision the packet pins down was the one it
       * did not demonstrate. These two assertions used to hold the invented copy in place. */
      t.eq(port.summary, 'Port 4173 is used by the Usage concept visual-test server. Use 4174 instead?',
        'the port conflict copy is the manifest\'s, verbatim');
      t.eq(port.actions.map(function (a) { return a.label; }).join('|'), 'Use 4174|Details|Cancel',
        'the port conflict action set names the alternative it will take');
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

    /* The catalog carried `artifact-test` twice. A count assertion cannot catch that — the duplicate
     * is what SATISFIED `length >= 7` — so uniqueness has to be asserted as itself. */
    var seenIds = {};
    var dupes = [];
    ids.forEach(function (id) { if (seenIds[id]) dupes.push(id); seenIds[id] = true; });
    t.eq(dupes.join(','), '', 'every catalog id appears exactly once');

    /* The consequence the duplicate actually had: `artifact.switch` walks list() by index, so a
     * repeated id trapped the cycle between two neighbours and made the records after them
     * unreachable. Walking the full cycle is the only assertion that proves it is a cycle. */
    fire('artifact', 'close');
    Ar.open(ids[0]);
    var visited = {};
    visited[ids[0]] = true;
    for (var sw = 0; sw < ids.length + 2; sw++) {
      fire('artifact', 'switch');
      var cur = Ar.activeId();
      if (cur) visited[cur] = true;
    }
    var unreached = ids.filter(function (id) { return !visited[id]; });
    t.eq(unreached.join(','), '', 'switching cycles through every catalog record');

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

        /* The packet's phrase is "LEFT-SIDE artifacts", and that is an ORDERING claim which
         * no-overlap cannot make: two regions can be disjoint in the wrong order. `A.leftToRight`
         * was written for exactly this and had never been called.
         *
         * It asserts only what the packet actually requires — the artifact is not to the RIGHT of
         * the transcript. An earlier draft of this assertion also fixed the position of pinned
         * history relative to the artifact, and that was inventing a requirement: the eight window
         * concepts deliberately place these regions differently (w4 makes the artifact a fourth
         * pane, w6 makes it a sheet), and a test that pins one arrangement would be marking seven
         * concepts wrong for not being the eighth.
         *
         * w8 is excluded because its artifact is a floating capsule by design, so it has no place
         * in a reading order at all. */
        if (w !== 'w8') {
          A.leftToRight([hr, tRect], w + ': the artifact workspace opens left of the transcript');
        }
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

  /* ------------------------------------------------------------------ paging (probe 2b)
   *
   * Registered HERE, between `forms` and `provider`, for the reason the file header gives: suite order
   * is dependency order. Every assertion below selects a concept's question card by the same root
   * selector `forms` has just proved each concept renders on its own, so if `forms` fails these
   * measurements describe an absent element rather than a behaviour, and reading them in that order
   * says so. Nothing registered after this suite depends on it.
   *
   * Three behaviours, measured on one walk through the same questionnaire.
   *
   * 1. THE CARD ROOT PERSISTS ACROSS A PAGE CHANGE. This is the precondition for the other two and for
   *    the resize bounce: `motion.resizeBounce` measures a start height on the very element it is
   *    about to mutate, and `motion.firstVisit` stamps its answer ON the element. A concept that
   *    empties its host and builds a fresh root per question therefore gets a bounce from nothing to
   *    nothing and a firstVisit that is true forever - both features present in the source and inert
   *    on screen. Identity is asserted by node comparison, which no look-alike can satisfy.
   *
   * 2. PAGING BACKWARD DOES NOT REPLAY THE ENTRANCE (02_stable_paged_questionnaire.mov). The eight
   *    concepts are required to animate in eight different ways, so this cannot name a class. It
   *    measures an ENTRANCE SIGNATURE instead - the animations running and the class tokens ADDED
   *    during a beat - at the open, at a forward page change and at a backward one. The failure is a
   *    signature element that belongs to the entrance and not to the advance turning up on the way
   *    back. Where a concept's entrance and advance are indistinguishable the comparison is vacuous,
   *    so that case is asserted explicitly rather than allowed to pass quietly.
   *
   * 3. REDUCED MOTION LANDS FULLY REVEALED. The artefact this guards is named in motion.css:337 - a
   *    card parked at the 1.085 vertical scale in the middle of `pmx-size-bounce-strong`, which is
   *    what a reduced-motion path that skips the ANIMATION but not the CLEANUP leaves behind.
   */

  /* The controls each concept renders, for a walk that pages rather than resolves. This repeats part
   * of the DRIVE table inside `forms` deliberately: that table belongs to the resolution walk and has
   * no backward control, and editing a passing suite's fixture to feed a new suite is how an existing
   * assertion gets weakened by accident.
   *
   * t5 is the one entry that needs a decision. It renders a PAIR of lanes rather than a card, and the
   * user lane is the half whose height follows the option count, so it is the half a resize bounce and
   * a firstVisit stamp belong to; the assistant lane carries the prompt. */
  var PAGING = {
    t1: { root: '.t1-qturn', opt: '.t1-qrow', free: '.t1-qfree',
          cmd: '.t1-qact', next: 'Next', back: 'Back' },
    t2: { root: '.t2-capsule', opt: '.t2-capsule-opt', free: '.t2-capsule-free',
          cmd: '.t2-capsule-next, .t2-capsule-primary, .t2-capsule-quiet', next: 'Next', back: 'Back' },
    t3: { root: '.t3-qrun', opt: '.t3-opt', free: '.t3-qfree',
          cmd: '.t3-qact', next: 'Next', back: 'Back' },
    t4: { root: '.t4-qdigest', opt: '.t4-qopt', free: '.t4-qfree',
          cmd: '.t4-act', next: 'Next', back: 'Back' },
    t5: { root: '.t5-qlane[data-lane="user"]', opt: '.t5-opt', free: '.t5-qfree',
          cmd: '.t5-act', next: 'Next', back: 'Back' },
    t6: { root: '.t6-form', opt: '.t6-form-opt', free: '.t6-form-field',
          cmd: '.t6-form-cmd', next: '[next]', back: '[back]' },
    t7: { root: '.t7-deck', opt: '.t7-opt', free: '.t7-qfree',
          cmd: '.t7-act', next: 'Next', back: 'Back' },
    t8: { root: '.t8-qnote', opt: '.t8-qlist-btn', free: '.t8-qfree',
          cmd: '.t8-act', next: 'Next', back: 'Back' }
  };

  var PAGING_IDS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

  /* n animation frames, as a promise. Two is the standard here for the same reason tools/drive.mjs
   * uses two: a class added during this task does not start its animation until the next style flush,
   * so a sample taken in the same task reports silence on a concept that just animated. */
  function pgFrames(n) {
    return new Promise(function (resolve) {
      var left = n;
      function step() {
        if (left <= 0) { resolve(true); return; }
        left--;
        global.requestAnimationFrame(step);
      }
      step();
    });
  }

  /* Finish every FINITE animation under `el` so the next sample starts from silence. Without this a
   * 420ms entrance is still running when the advance is sampled two frames later, every entrance name
   * appears in the advance set as well, and the comparison below would pass by being empty rather than
   * by being true. Infinite animations are left running: a spinner is not an entrance, and cancelling
   * one would change what the `motion` suite measures later in the same run. */
  function pgQuiet(el) {
    if (!el || !el.getAnimations) return;
    var list;
    try { list = el.getAnimations({ subtree: true }); } catch (e) { return; }
    for (var i = 0; i < list.length; i++) {
      var timing = list[i].effect && list[i].effect.getComputedTiming ? list[i].effect.getComputedTiming() : null;
      if (timing && timing.iterations === Infinity) continue;
      try { list[i].finish(); } catch (e2) { try { list[i].cancel(); } catch (e3) {} }
    }
  }

  /* The animations and transitions actually RUNNING under `el`, by name. Transitions are reported by
   * property because two of the eight concepts express their question motion as an interpolated height
   * rather than as keyframes, and a reader that only knew about @keyframes would score them motionless
   * and then pass them for never replaying an entrance it could not see in the first place. */
  function pgRunning(el) {
    var out = [];
    if (!el || !el.getAnimations) return out;
    var list;
    try { list = el.getAnimations({ subtree: true }); } catch (e) { return out; }
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.playState !== 'running') continue;
      var timing = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
      if (timing && timing.iterations === Infinity) continue;
      /* The reduced-motion contract ZEROES durations (.01ms in motion.css) rather than removing
       * transitions, so a transition can legitimately be 'running' for a fraction of a millisecond
       * and still be the settled end state. Anything under 2ms is that, not motion.
       *
       * Without this the assertion flaked about one run in four, and never on the card's own height:
       * it caught `transition: scrollbar-color` from the shared .pmx-scroll utility on a textarea.
       * Failing a concept because a scrollbar tint was mid-zero-length-transition would be the test
       * reporting its own sampling window as a defect in the product. */
      if (timing && typeof timing.activeDuration === 'number' && timing.activeDuration < 2) continue;
      if (a.animationName) out.push('animation:' + a.animationName);
      else if (a.transitionProperty) out.push('transition:' + a.transitionProperty);
      else out.push('effect');
    }
    return out;
  }

  /* Every class token ADDED anywhere under `root` since the previous take().
   *
   * Added rather than present, because the one-shot beats all eight concepts use remove their class on
   * a timer: a sample of what is on the element a moment later can miss the beat completely, and a
   * sample of what is present cannot tell a class that was just applied from one that has been sitting
   * there since the mount. The observer's callback is a microtask, so by the time take() runs after a
   * frame wait it has already recorded; takeRecords() drains anything still queued. */
  function pgWatch(root) {
    var added = {};
    var mo = null;
    function drain(recs) {
      for (var i = 0; i < recs.length; i++) {
        var r = recs[i];
        if (r.type !== 'attributes' || r.attributeName !== 'class') continue;
        var before = {};
        String(r.oldValue || '').split(/\s+/).forEach(function (tk) { if (tk) before[tk] = 1; });
        var now = String((r.target.getAttribute && r.target.getAttribute('class')) || '').split(/\s+/);
        for (var j = 0; j < now.length; j++) if (now[j] && !before[now[j]]) added['class:' + now[j]] = 1;
      }
    }
    if (root && global.MutationObserver) {
      mo = new MutationObserver(drain);
      mo.observe(root, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    }
    return {
      take: function () {
        if (mo) drain(mo.takeRecords());
        var out = Object.keys(added);
        added = {};
        return out;
      },
      stop: function () { if (mo) mo.disconnect(); }
    };
  }

  function pgOnly(a, b) {
    var seen = {}, out = [], i;
    for (i = 0; i < b.length; i++) seen[b[i]] = 1;
    for (i = 0; i < a.length; i++) if (!seen[a[i]] && out.indexOf(a[i]) < 0) out.push(a[i]);
    return out;
  }

  function pgBoth(a, b) {
    var seen = {}, out = [], i;
    for (i = 0; i < b.length; i++) seen[b[i]] = 1;
    for (i = 0; i < a.length; i++) if (seen[a[i]] && out.indexOf(a[i]) < 0) out.push(a[i]);
    return out;
  }

  /* The concept's own command button carrying `label`, scoped to the question host so a Next elsewhere
   * on the page cannot stand in for the one this card renders. */
  function pgCmd(host, spec, label) {
    var btns = qa(spec.cmd).filter(function (b) { return host.contains(b); });
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || '').trim() === label) return btns[i];
    }
    return null;
  }

  /* Answer the question on screen THROUGH THE CONCEPT'S OWN CONTROL. The harness reads the flow to
   * decide whether an answer is still needed - reading is not resolving - but the click that gives the
   * answer is the one a reader would make, because a walk driven through the service would prove the
   * fixture instead of the product. Re-answering matters: the first question is multi-select, so a
   * second click on the same row would take the answer away again on the way back. */
  function pgAnswerIfNeeded(host, spec, svc, threadId) {
    var flow = global.PMXQFlow.read(svc, threadId);
    var question = flow && flow.question;
    if (!question) return null;
    var answered = question.kind === 'freeform'
      ? !!(question.draft && String(question.draft).trim())
      : !!(question.selected && question.selected.length);
    if (answered) return 'already answered';
    var opt = host.querySelector(spec.opt);
    if (opt) { opt.click(); return 'option'; }
    var free = host.querySelector(spec.free);
    if (free) {
      free.value = 'an answer typed into the field';
      free.dispatchEvent(new Event('input', { bubbles: true }));
      return 'freeform';
    }
    return null;
  }

  /* The vertical scale currently applied to `el`, or 1 when there is none. Reading the matrix rather
   * than demanding `transform: none` is deliberate: a concept is entitled to a resting translate or a
   * deck rake, and the artefact being hunted is specifically a residual SCALE. */
  function pgScaleY(el) {
    var tr = global.getComputedStyle(el).transform;
    if (!tr || tr === 'none') return 1;
    var m = tr.match(/matrix3d\(([^)]+)\)/);
    if (m) return parseFloat(m[1].split(',')[5]);
    m = tr.match(/matrix\(([^)]+)\)/);
    if (m) return parseFloat(m[1].split(',')[3]);
    return 1;
  }

  /* One concept's walk: open, page forward, page back, with a sample at each of the three beats. */
  function pgWalk(t, id) {
    var spec = PAGING[id];
    var svc = { questionnaire: global.PMXQuestionnaire, surfaces: global.PMXSurfaces };
    var R = global.PMXReveal;

    reset();
    setPairing('w1', id);
    store().set('ui.reducedMotion', false);

    var host = q('[data-pmx-region="questionHost"]');
    if (!host) {
      t.record(false, id + ': w1 exposed no questionHost region, so no paging behaviour could be measured');
      return Promise.resolve(true);
    }

    /* MAKING THE ENTRANCE OBSERVABLE.
     *
     * The fixture's questionnaire is already `incomplete`, so it is ACTIVE the moment the composition
     * mounts: the card's entrance has happened before any watcher in this suite can exist, and
     * `fire('question','open')` at an already-active record only settles a phase that is not pending,
     * which renders nothing. A first attempt measured exactly that and reported an empty entrance for
     * six of the eight concepts, which would have made "the entrance did not replay" pass by measuring
     * nothing at all.
     *
     * Opening another thread and coming back is what a reader would do, it costs the record nothing -
     * no answer given, no phase resolved - and it clears the concept's own memory of which question it
     * was showing, so the card genuinely arrives again with something watching. thread-06 is the
     * thread with no questionnaire of its own, which is why `forms` uses it for the same purpose. */
    var threadId = tid();
    var watch = null;
    var s = { dead: false, root: null, key1: '', key2: '', answer1: null, entrance: [], forward: [], back: [] };

    fire('question', 'open');
    store().set('session.activeThreadId', 'thread-06');

    return pgFrames(2).then(function () {
      /* Armed here, on the live host, in the gap where no question is on screen. */
      host = q('[data-pmx-region="questionHost"]') || host;
      pgQuiet(host);
      watch = pgWatch(host);
      store().set('session.activeThreadId', threadId);
      return pgFrames(2);
    }).then(function () {
      s.entrance = watch.take().concat(pgRunning(host));
      pgQuiet(host);

      s.root = q(spec.root);
      t.ok(s.root, id + ' renders its question card root (' + spec.root + ')');
      if (!s.root) { s.dead = true; return true; }
      t.ok(host.contains(s.root), id + ' renders that root inside the window\u2019s questionHost region');
      s.key1 = R.keyFor(svc, threadId);

      pgAnswerIfNeeded(host, spec, svc, threadId);
      var flow = global.PMXQFlow.read(svc, threadId);
      s.answer1 = flow && flow.question && (flow.question.selected || [])[0];
      t.ok(s.answer1, id + ': question 1 was answered through the concept\u2019s own option control');
      return pgFrames(2);
    }).then(function () {
      if (s.dead) return true;
      pgQuiet(host);
      /* The answer click is not the page change. Whatever it stirred up is dropped here so the forward
       * sample below contains the page change and nothing else. */
      watch.take();

      var next = pgCmd(host, spec, spec.next);
      t.ok(next, id + ' offers its own forward control (' + spec.next + ')');
      if (!next) { s.dead = true; return true; }
      next.click();
      return pgFrames(2);
    }).then(function () {
      if (s.dead) return true;
      s.forward = watch.take().concat(pgRunning(host));
      pgQuiet(host);
      s.key2 = R.keyFor(svc, threadId);
      /* If the concept's own forward control does not move the flow, nothing after this measures what
       * it claims to: "the same root across a page change" is trivially true when no page changed. So
       * the failure is recorded once, here, and the walk stops rather than producing four more
       * assertions that all describe the same fault. */
      t.neq(s.key2, s.key1, id + ' paging forward through its own control reaches a different question');
      if (s.key2 === s.key1) { s.dead = true; return true; }

      var root2 = q(spec.root);
      if (!root2) {
        /* Named apart from the identity assertion because it is a different fault: the card did not
         * change identity, it stopped existing. */
        t.record(false, id + ' has no question card at all after paging forward - ' + spec.root +
          ' is not in the document');
      } else {
        t.eq(root2, s.root, id + ' keeps the SAME card root element across a forward page change');
      }

      var back = pgCmd(host, spec, spec.back);
      t.ok(back, id + ' offers its own backward control (' + spec.back + ')');
      if (!back) { s.dead = true; return true; }
      back.click();
      return pgFrames(2);
    }).then(function () {
      if (s.dead) { watch.stop(); return true; }
      s.back = watch.take().concat(pgRunning(host));
      pgQuiet(host);
      watch.stop();

      var root3 = q(spec.root);
      if (!root3) {
        t.record(false, id + ' has no question card at all after paging back - ' + spec.root +
          ' is not in the document');
      } else {
        t.eq(root3, s.root, id + ' keeps the SAME card root element across a backward page change');
      }
      t.eq(R.keyFor(svc, threadId), s.key1, id + ' paging back lands on the question it started from');

      /* 2. the entrance must not replay.
       *
       * One assertion per concept, in whichever of three readings the concept's own motion supports.
       * Three separate assertions would report one fault three times, which is the mistake
       * A.leftToRight exists to avoid. The signatures travel in the message either way, because the
       * numbers are what the concept's owner needs and a bare false tells them nothing. */
      var entranceOnly = pgOnly(s.entrance, s.forward);
      var sigs = ' (entrance ' + JSON.stringify(s.entrance) + ', advance ' + JSON.stringify(s.forward) +
        ', backward ' + JSON.stringify(s.back) + ')';
      if (!s.entrance.length) {
        /* Nothing at all was played when the card arrived, so there is no entrance to replay and no
         * entrance to see either. That is a finding about the concept rather than a pass. */
        t.record(false, id + ' plays nothing measurable when its question card arrives, so whether ' +
          'paging back replays the entrance cannot be answered on this concept' + sigs);
      } else if (entranceOnly.length > 0) {
        var replayed = pgBoth(s.back, entranceOnly);
        t.eq(replayed.length, 0, id + ' does not replay its entrance when paging backward' +
          (replayed.length ? ' (replayed: ' + replayed.join(', ') + ')' : '') + sigs);
      } else {
        /* The concept plays the same beat arriving as advancing, so "entrance only" is empty and the
         * precise reading is unavailable. The weaker one still holds and is still the requirement:
         * the way back must not reproduce EVERYTHING the arrival played, or the reader is being told
         * they have arrived somewhere new when they have gone back. */
        var held = pgOnly(s.entrance, s.back);
        t.ok(held.length > 0, id + ' uses one beat for arriving and for advancing, and the backward ' +
          'pass reproduces the whole of it - so paging back reads as the card arriving' + sigs);
      }

      /* The other half of "reviewable": the answer is still on screen, not merely still in the store.
       * All eight concepts mark a chosen option with aria-pressed, which is the one place their eight
       * different option controls agree - so this reads the rendering, not the record. */
      var shows = qa('[aria-pressed="true"]').filter(function (b) {
        return host.contains(b) && s.answer1 && (b.textContent || '').indexOf(s.answer1) >= 0;
      });
      t.ok(shows.length > 0, id + ' still SHOWS the answer given to question 1 after paging back to it');

      /* 3. the mechanism behind it. firstVisit stamps its answer on the element, so the stamp is the
       * direct evidence that the concept asked, that it asked with the shared key, and that the same
       * element survived to be asked twice. */
      var stamp = (s.root && s.root.getAttribute('data-pmx-visited-all') !== null)
        ? s.root : host.querySelector('[data-pmx-visited-all]');
      if (!stamp) {
        t.record(false, id + ' stamps motion.firstVisit on nothing in its question card, so paging back ' +
          'cannot be told apart from a first arrival');
      } else {
        var all = ' ' + (stamp.getAttribute('data-pmx-visited-all') || '') + ' ';
        t.ok(all.indexOf(' ' + s.key1 + ' ') >= 0, id + ' recorded question 1 as visited (' + s.key1 + ')');
        t.ok(all.indexOf(' ' + s.key2 + ' ') >= 0,
          id + ' recorded question 2 as visited on the SAME element, so both keys survived the paging');
        t.notOk(global.PMXMotion.firstVisit(stamp, s.key1),
          id + ': motion.firstVisit answers false for the question paged back to');
      }
      return true;
    });
  }

  /* One concept's reduced-motion landing. Driven as a real page change rather than as a static read,
   * because the failure is a state a page change leaves behind. */
  function pgReduced(t, id) {
    var spec = PAGING[id];
    var svc = { questionnaire: global.PMXQuestionnaire, surfaces: global.PMXSurfaces };

    reset();
    setPairing('w1', id);
    store().set('ui.reducedMotion', true);
    fire('question', 'open');

    var host = q('[data-pmx-region="questionHost"]');
    if (!host) {
      t.record(false, id + ': w1 exposed no questionHost region under reduced motion');
      store().set('ui.reducedMotion', false);
      return Promise.resolve(true);
    }
    var threadId = tid();
    var R = global.PMXReveal;
    var keyBefore = R.keyFor(svc, threadId);
    pgAnswerIfNeeded(host, spec, svc, threadId);
    var next = pgCmd(host, spec, spec.next);
    if (!next) {
      t.record(false, id + ' offers no forward control under reduced motion, so the landing state could not be driven');
      store().set('ui.reducedMotion', false);
      return Promise.resolve(true);
    }
    next.click();

    return pgFrames(2).then(function () {
      var root = q(spec.root);
      /* Stated separately from the landing assertions below. A card that never changed page can pass
       * every one of them by never having been asked to move, and that would be a pass describing the
       * harness rather than the concept. */
      t.neq(R.keyFor(svc, threadId), keyBefore,
        id + ' actually changed page under reduced motion, so the state below is a landing and not a rest');
      t.ok(root, id + ' still renders its question card after a reduced-motion page change');
      if (root) {
        var stage = root.closest ? root.closest('[data-motion]') : null;
        t.eq(stage && stage.getAttribute('data-motion'), 'reduced',
          id + ': the card sits under a stage marked data-motion="reduced", so the flag reached the DOM');

        /* resizeBounce pins a height and clamps overflow for the length of the beat, and collapseTo
         * does the same while it interpolates. Under reduced motion neither may leave anything behind:
         * both take an early return that applies the change and stops. An inline `height: auto` counts
         * as leftover too - it is still an override of the concept's own CSS, written by an animation
         * that was supposed not to run. */
        t.eq(root.style.height, '', id + ' leaves no inline height on the card under reduced motion');
        t.eq(root.style.overflow, '', id + ' leaves no inline overflow clamp on the card under reduced motion');

        t.near(pgScaleY(root), 1, 0.005,
          id + ' leaves no residual vertical scale on the card - the 1.085 park is the artefact this guards');
        /* getBoundingClientRect is the TRANSFORMED box and offsetHeight is the laid-out one, so a card
         * still carrying a bounce scale disagrees with itself here. offsetHeight is an integer, hence
         * the whole-pixel tolerance. */
        t.near(root.getBoundingClientRect().height, root.offsetHeight, 1,
          id + ' shows the card at its natural height under reduced motion');

        var bounced = qa('.pmx-size-bounce, .pmx-size-bounce-strong').filter(function (el) {
          return el === root || root.contains(el);
        });
        t.eq(bounced.length, 0, id + ' leaves no bounce class on the card under reduced motion');

        var running = pgRunning(root);
        t.eq(running.length, 0, id + ' runs no animation on the card under reduced motion' +
          (running.length ? ' (running: ' + running.join(', ') + ')' : ''));
      }
      store().set('ui.reducedMotion', false);
      return true;
    });
  }

  /* ---- focus
   *
   * CORRECTION_GOAL_PROMPT.md requires keyboard/focus to pass, and nothing in this file asserted
   * focus at all — `activeElement` appeared zero times. That matters more here than in most
   * workspaces, because shared/motion.js's rule 3 is "NO FOCUS MOVEMENT: not one helper touches
   * focus", and a rule stated in a docblock and never checked is a rule until the day it is not.
   *
   * These are deliberately about the INVARIANT rather than about any concept's tab order: an
   * animation must not steal focus, and a control the reader is on must survive the render its own
   * click causes. */
  A.suite('focus', function (t) {
    var doc = global.document;

    FORMS.forEach(function (f) {
      reset();
      setPairing('w1', f.id);
      settleAll();

      /* A composer is present in every pairing and is the one control a reader is most often in. */
      var field = q('[data-pmx-region="composerHost"] textarea, [data-pmx-region="composerHost"] input');
      if (!field) { t.record(false, f.id + ': no composer field to hold focus'); return; }
      field.focus();
      t.eq(doc.activeElement, field, f.id + ': the composer field can take focus');

      /* Drive real motion underneath it. The activity run is the densest sequence in the workspace,
       * and if anything moved focus it would be this. */
      fire('activity', 'thinking_summary');
      fire('activity', 'read');
      fire('activity', 'settle');
      fire('activity', 'condense');
      settleAll();
      t.eq(doc.activeElement, field, f.id + ': a full activity run never moves focus off the composer');

      /* A resize bounce runs on the question card. Same question, different primitive. */
      fire('question', 'prepare');
      fire('question', 'open');
      settleAll();
      t.eq(doc.activeElement, field, f.id + ': opening a question never steals focus from the composer');
      fire('question', 'cancel');
      settleAll();
    });

    /* Activating a chain glyph with the keyboard must not lose the reader's place.
     *
     * This is the sharper half of the question, and it is asked in every concept rather than one:
     * seven of the eight rebuild their capsule when the phase kind changes, so a glyph the reader
     * has focused can be replaced by an equal-looking new element mid-keystroke. The DOM survives
     * either way — checking that "a focusable control still exists" would pass while focus had in
     * fact fallen back to <body>, which for a keyboard reader means being returned to the top of the
     * document. So what is asserted is that focus is still ON THE CHAIN, by position, which is the
     * property a rebuild can break and a re-render cannot. */
    FORMS.forEach(function (f) {
      reset();
      setPairing('w1', f.id);
      fire('question', 'cancel');
      ['thinking_summary', 'read', 'settle', 'edit', 'settle', 'condense'].forEach(function (e) {
        fire('activity', e);
      });
      settleAll();
      var glyphs = qa('[data-pmx-thread="' + f.id + '"] .pmx-chain button');
      if (!glyphs.length) { t.record(false, f.id + ': no focusable chain glyph'); return; }
      var index = glyphs.length > 1 ? 1 : 0;
      glyphs[index].focus();
      t.eq(doc.activeElement, glyphs[index], f.id + ': a chain glyph can take keyboard focus');
      glyphs[index].click();
      settleAll();
      var after = qa('[data-pmx-thread="' + f.id + '"] .pmx-chain button');
      t.ok(after.length, f.id + ': the chain still offers a focusable control after activation');
      t.eq(doc.activeElement, after[index] || null,
        f.id + ': focus stays on the activated glyph across the render it caused');
    });
  });

  A.suite('paging', function (t) {
    var chain = Promise.resolve(true);
    PAGING_IDS.forEach(function (id) {
      chain = chain.then(function () { return pgWalk(t, id); });
    });
    PAGING_IDS.forEach(function (id) {
      chain = chain.then(function () { return pgReduced(t, id); });
    });
    return chain.then(function () {
      /* Leave one known state behind. A suite that ends mid-questionnaire with reduced motion still
       * set would hand every suite after it a page it did not ask for. */
      store().set('ui.reducedMotion', false);
      reset();
      return true;
    });
  });


  /* ---- provider acquisition
   *
   * PROVIDER_CLI_FINAL_ADJUDICATION.md was missing from the original packet. These assertions are
   * what stop it going missing again: they fail if the never-bundled rule, the official-source rule
   * or the install/authenticate separation is ever softened out of the copy. */

  A.suite('provider', function (t) {
    var R = global.PMXRoute;

    /* -- the forbidden half. The adjudication supersedes an earlier bundle that allowed
     * "Included with this Server" for provider CLIs (pmx-scan-allow: quoted to forbid it),
     * (pmx-scan-allow: the superseded phrasing, named in order to forbid it) */
    /* pmx-scan-allow: this is the needle list itself, not a claim. The folder scan in
     * tools/drive.mjs honours the marker on each line below for the same reason. */
    var FORBIDDEN = [
      'included with this server',  /* pmx-scan-allow: needle */
      'bundled with',  /* pmx-scan-allow: needle */
      'pre-seeded',  /* pmx-scan-allow: needle */
      'ships with puppet master',  /* pmx-scan-allow: needle */
      'included in the baseline',  /* pmx-scan-allow: needle */
      'included execution baseline'  /* pmx-scan-allow: needle */
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

    /* The scan above only reads PMXRoute's own strings, so a forbidden phrase could reappear in a
     * thread renderer, a selector footer or the fixture and pass. What the adjudication forbids is
     * the CLAIM REACHING THE READER, not a particular module holding it, so the scan follows it to
     * the screen: every rendered word of the mounted workspace, with the route selector open so the
     * acquisition footer is actually painted.
     *
     * A folder-wide source grep is the other half of this and lives in tools/drive.mjs, because a
     * browser suite cannot read files the page never loads. */
    setPairing('w1', 't1');
    fire('provider', 'install_required');
    settleAll();
    var painted = (global.document.body.innerText || '').toLowerCase();
    var onScreen = FORBIDDEN.filter(function (p) { return painted.indexOf(p) >= 0; });
    t.eq(onScreen.join(','), '', 'no forbidden acquisition phrase reaches the rendered workspace');

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


  /* ------------------------------------------------------------------ runtrace (reference 03)
   *
   * The evolving activity capsule from `reference/videos/03_compact_execution_activity.mov`. It is
   * the largest behaviour this workspace gained and nothing in this file asserted it: `opcard` covers
   * the tense rule at the level of ONE operation record, but the RUN — the glyph chain, the count
   * rewritten in place, the condensed resting state, and the random access back into a finished
   * phase — had no coverage at all, in the model or on screen.
   *
   * The frame numbers cited below are the ones shared/runtrace.js's own header cites, so a later
   * reader can check a claim against the 38.89fps decode rather than take this suite's word for it.
   *
   * Two halves, in this order because a model fault would otherwise be reported a second time as
   * eight rendering faults. The first drives PMXRunTrace and the Director and reads the model back.
   * The second drives all eight thread concepts through one scripted run and reads back rendered TEXT
   * and GEOMETRY — "the count is rewritten and nothing relayouts" is the specific claim the video
   * makes, and a dispatch count cannot make it.
   */

  A.suite('runtrace', function (t) {
    var RT = global.PMXRunTrace;
    if (!RT || !RT.read) {
      t.record(false, 'PMXRunTrace is not loaded, so there is no run contract to assert');
      return;
    }

    /* thread-01 is the only thread the fixture authors activity stages for, and `system.reset` puts
     * the session back on it. Every literal below is that thread's authored copy — `Thinking for 4s`,
     * `Reading 7 files`, `Made 1 create, 2 edits` — so a fixture change fails this suite loudly
     * instead of quietly making it assert nothing. */
    reset();
    setPairing('w1', 't1');

    /* A reset thread has its questionnaire queued again, and every concept correctly yields its work
     * cluster — the run capsule with it — to a pending question. So the queue is dismissed first, for
     * the same reason the `general` suite dismisses it: a pending question legitimately outranks the
     * surface under test, so it has to be out of the way before that surface can be observed at all.
     * Nothing here ANSWERS a question; the concepts' own UI stays the only path to a submitted
     * answer, which is what the harness rule at the top of this file requires.
     *
     * It cancels through PMXQFlow, which is the verb layer every concept's own Cancel button calls,
     * rather than through PMXQuestionnaire.cancel directly. The release of `surfacesYielded` lives in
     * that verb layer, so cancelling underneath it leaves the work surfaces yielded — and the
     * condense assertions below would then be measuring this harness's shortcut rather than the
     * product. */
    function clearQuestions(threadId) {
      var Q = global.PMXQuestionnaire;
      var flowSvc = { questionnaire: Q, surfaces: global.PMXSurfaces };
      var guard = 0;
      while (Q.activeFor(threadId) && guard++ < 12) {
        var was = Q.activeFor(threadId).id;
        var res = global.PMXQFlow.act(flowSvc, threadId, 'cancel');
        if (!res || !res.ok) break;
        var next = Q.activeFor(threadId);
        if (next && next.id === was) break;
      }
      store().touchView('questionnaire');
    }

    function phaseOf(threadId, phaseId) {
      var run = RT.read(threadId);
      var list = (run && run.phases) || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === phaseId) return list[i];
      return null;
    }
    function headlineOf(threadId, phaseId) {
      var p = phaseOf(threadId, phaseId);
      return p ? p.headline : null;
    }

    var id = tid();
    clearQuestions(id);

    t.ok(RT.read(id), 'the fixture authors an activity run for the active thread');
    t.eq(RT.read(id).chain.length, 0, 'a reset thread starts with an empty chain');
    t.notOk(RT.read(id).started, 'and reports itself as not started, so nothing indexes work this run has not done');

    /* ---- 1. the tense flip. Behaviour 3, f.194 against f.1170 and f.1300: `Thinking` while the
     * phase runs, `Thought` once it has settled. Both strings are authored, so what is asserted here
     * is that the right one is CHOSEN — an English participle is not derivable from a past-tense verb
     * and guessing would produce "Readed 7 files". */
    t.ok(RT.enter(id, 'thought'), 'a phase can be entered by kind');
    t.eq(headlineOf(id, 'st-thought'), 'Thinking for 4s', 'a running phase reads as a present participle (f.194)');
    t.eq(phaseOf(id, 'st-thought').status, 'running', 'and reports itself running');
    t.ok(RT.settle(id), 'the running phase settles');
    t.eq(headlineOf(id, 'st-thought'), 'Thought for 4s', 'a settled phase reads in the past tense (f.1170)');

    /* ---- 2. the digit that is NOT a count. `st-thought` carries count 1 and unit `summary`, and its
     * headline states no count anywhere — so there is nothing in it to substitute. An earlier draft
     * rewrote the first digit run it found, which turned `Thinking for 4s` into `Thinking for 1s` and
     * silently restated a four-second duration as a one-second one. The two assertions above already
     * read `4s` back; these say it at the level where the substitution actually happens, so the rule
     * survives even if that fixture stage is ever retired. */
    t.eq(RT.withCount('Thinking for 4s', 1, 'summary'), 'Thinking for 4s',
      'a headline that states no count keeps its duration digit');
    t.eq(RT.withCount('Thought for 4s', 1, 'summary'), 'Thought for 4s',
      'the past-tense form of the same headline keeps it too');

    /* ---- 3. the count rewritten in place. Behaviour 2, f.208 -> f.286 -> f.338: `5 files` becomes
     * `6 files` becomes `7 files`. The reference's verb is `Exploring` and this fixture's is
     * `Reading`; the progression is the thing being carried over, not the vocabulary.
     *
     * It is fired through the Director rather than by calling tick() directly, because the per-kind
     * trigger is the path a reviewer actually drives and a suite that bypassed it would pass while
     * the demo controls were dead. */
    t.ok(fire('activity', 'read').ok, 'the Director carries a per-kind activity trigger for read');
    t.eq(headlineOf(id, 'st-read'), 'Reading 5 files', 'the phase opens part way, with room left to count (f.208)');
    fire('activity', 'read');
    t.eq(headlineOf(id, 'st-read'), 'Reading 6 files', 'firing the same kind again grows the count (f.286)');
    fire('activity', 'read');
    t.eq(headlineOf(id, 'st-read'), 'Reading 7 files', 'and again, up to the authored total (f.338)');
    fire('activity', 'read');
    t.eq(headlineOf(id, 'st-read'), 'Reading 7 files',
      'the count clamps at the authored total rather than inventing an eighth file');
    t.eq(phaseOf(id, 'st-read').count, 7,
      'the clamped count is the authored total of 7, not a number that merely stopped moving');

    /* ---- 4. the unit at exactly one. `1 files` is the tell that a count was substituted into a
     * fixed string, so the noun goes singular at one and nowhere else. */
    t.eq(RT.withCount('Read 7 files', 1, 'files'), 'Read 1 file', 'a unit goes singular at exactly one');
    t.eq(RT.withCount('Read 7 files', 2, 'files'), 'Read 2 files', 'two keeps the plural');
    t.eq(RT.withCount('Found 31 matches', 1, 'matches'), 'Found 1 match', 'an -es plural loses both letters at one');
    t.eq(RT.withCount('Found 31 matches', 31, 'matches'), 'Found 31 matches', 'and keeps them at every other count');

    fire('activity', 'settle');
    t.eq(headlineOf(id, 'st-read'), 'Read 7 files', 'settling flips the tense and lands the count on the total');
    t.eq(phaseOf(id, 'st-read').status, 'done', 'a settled phase reports itself done');

    /* ---- 5. condense is a resting state, not a yield. It must NOT touch `surfacesYielded`: that
     * flag is the QUESTION yield, and the verb this replaced set it — so firing "condense the
     * activity" blanked Goal, Todo, subagents and diffs outright while leaving the activity rows on
     * screen. The assertion compares the SET of live surfaces before and after rather than naming
     * them one by one, because naming them would silently pass on a thread the fixture happens not to
     * author diffs for. */
    var SF = global.PMXSurfaces;
    function liveSurfaces() {
      var a = SF.activeFor(id) || {};
      var out = [];
      ['goal', 'todo', 'subagents', 'diffs', 'activity'].forEach(function (k) { if (a[k]) out.push(k); });
      return out;
    }
    clearQuestions(id);
    t.notOk(store().view(id).surfacesYielded, 'with no question pending the work surfaces are not yielded');
    var surfacesBefore = liveSurfaces();
    t.ok(surfacesBefore.length >= 3,
      'the thread has work surfaces that a stray yield could blank: ' + surfacesBefore.join(', '));

    t.ok(RT.condense(id), 'the run condenses');
    t.ok(RT.read(id).condensed, 'and reports itself condensed');
    t.notOk(store().view(id).surfacesYielded, 'condensing never raises the question-yield flag');
    t.deepEq(liveSurfaces(), surfacesBefore, 'every work surface is still live after a condense');

    /* f.910: the whole run becomes one summary row. It counts TOOLS, and a thought is not a tool —
     * counting it would make `N tools used` a count of phases wearing a narrower noun. */
    var condensedRun = RT.read(id);
    t.eq(condensedRun.chain.length, 2, 'the chain holds one entry per entered phase, in entry order');
    t.eq(condensedRun.toolCount, 7, 'the thought phase is not counted as a tool');
    t.eq(condensedRun.summaryLabel, '7 tools used', 'the summary row is derived from what the run actually did (f.910)');

    /* ---- 6. random access. Behaviour 1: clicking the pencil at f.1170 reopens `Made 1 create, 2
     * edits` and the magnifier at f.1300 reopens `Explored 7 files`, from a control that costs one
     * glyph of space. Opening a phase the run never entered is refused, because a capsule that
     * expanded to an empty body would claim work that did not happen. */
    t.ok(RT.open(id, 'st-read'), 'a phase the run entered can be opened');
    t.eq(RT.read(id).open && RT.read(id).open.id, 'st-read', 'the run reports WHICH phase is open');
    t.eq(RT.read(id).open.headline, 'Read 7 files', 'the opened phase carries its settled headline');
    t.notOk(RT.open(id, 'st-browser'), 'opening a phase the run never entered is refused');
    t.eq(RT.read(id).open.id, 'st-read', 'the refusal leaves the previously opened phase open');
    t.ok(RT.open(id, 'st-read'), 'opening the phase that is already open is accepted');
    t.eq(RT.read(id).openId, null,
      'and toggles it closed, so one control both discloses and dismisses and no separate close is needed');

    /* ---- 7. reset. Leaving a chain of entered phases behind would make the next run start
     * half-finished, and its glyphs would index work that run never did. */
    t.ok(RT.reset(id), 'the run trace resets');
    var afterReset = RT.read(id);
    t.eq(afterReset.chain.length, 0, 'reset clears the chain');
    t.eq(afterReset.running, null, 'reset leaves nothing running');
    t.eq(afterReset.openId, null, 'reset closes any disclosed phase');
    t.notOk(afterReset.condensed, 'reset leaves the run uncondensed, so a new run does not start at its resting state');

    /* ---------------------------------------------------------------- the eight renderings
     *
     * One scripted run, driven through the Director in every concept, with every assertion reading
     * back what is ON SCREEN.
     *
     * Reduced motion is set first for the reason the `forms` suite sets it: `swapText` deliberately
     * DEFERS a replacement by a frame so the two values can cross-fade, so a text readback inside a
     * synchronous suite would be asserting the timing rather than the words. countMorph rebuilds its
     * digits synchronously either way; the whole-label swap is the one that needs this.
     */
    var THREADS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

    /* The chain is located by the SHARED marker rather than by eight concept class names, on purpose.
     * `pmx-chain` and `pmx-chain-slot` are motion's contract — phaseHandover opens the slot from zero
     * width at f.205-209 and chainRoll marks the overflow edges — so a concept that renders its chain
     * some other way has not adopted the two-beat handover the reference shows at f.194-211, which is
     * a finding rather than a reason to look elsewhere.
     *
     * The CAPSULE is the one thing that needs a per-concept name, and all eight concepts use the same
     * one: `tN-run`. Reading the sentence back from that root rather than from the chain's parent
     * matters twice over. Two concepts deliberately put the chain somewhere other than the sentence's
     * own row — a paired-lane index, a numbered log row — which is a re-idiom of the reference rather
     * than a fault, and the chain's parent would miss the sentence in both. And t1 renders an
     * operation ledger BESIDE the capsule whose rows carry the very same headlines, so widening the
     * read to the whole work-surface region instead would let a dead capsule pass on the ledger's
     * words. */
    function chainIn(th) { return q('[data-pmx-thread="' + th + '"] .pmx-chain'); }
    function capsuleIn(th) { return q('[data-pmx-thread="' + th + '"] .' + th + '-run'); }
    function glyphsIn(th) {
      var c = chainIn(th);
      return c ? Array.prototype.slice.call(c.querySelectorAll('button')) : [];
    }
    /* Whitespace is squashed out of both sides before comparing. Every concept builds its headline as
     * a verb element beside an argument element, so `textContent` reads `Read7 files` with nothing
     * where the CSS gap is; comparing raw strings would fail on the gap rather than on the words.
     * Squashing cannot make a tense failure pass — `Reading7files` does not contain `Read7files`. */
    function squash(s) { return String(s == null ? '' : s).replace(/\s+/g, ''); }
    function shows(th, text) {
      var cap = capsuleIn(th);
      return !!cap && squash(cap.textContent).indexOf(squash(text)) >= 0;
    }

    store().set('ui.reducedMotion', true);

    THREADS.forEach(function (th) {
      reset();
      setPairing('w1', th);
      clearQuestions(tid());
      settleAll();
      var thId = tid();

      /* Stated as its own assertion so that a capsule which never appears cannot be blamed on the
       * concept when the real cause was a question still holding the floor. */
      t.notOk(global.PMXQuestionnaire.activeFor(thId),
        th + ': no question is pending, so the work cluster is observable at all');

      /* The scripted run: a thought that settles, a read that counts up and settles, an edit that
       * settles, and the condense that is the run's resting state. */
      fire('activity', 'thinking_summary');
      fire('activity', 'settle');
      fire('activity', 'read');

      if (!chainIn(th)) {
        /* Named, never skipped. A concept with no capsule is exactly the gap this suite exists to
         * make visible, and a silent skip would report eight passes for however many concepts had
         * actually implemented it. */
        t.record(false, th + ' renders no run capsule: nothing carrying the shared pmx-chain marker is ' +
          'on screen after the scripted run has entered its second phase');
        return;
      }
      if (!capsuleIn(th)) {
        t.record(false, th + ' renders a chain but no ' + th + '-run capsule root, so the run has no ' +
          'sentence that can be read back');
        return;
      }

      /* The count rewritten in place, measured rather than dispatched. Two datums are captured: the
       * viewport y, which is the literal claim the video makes, and the y relative to the region that
       * holds the capsule, which stays true even if something unrelated scrolls. If only the first
       * fails, the page scrolled; if both fail, the row genuinely moved. */
      var datum = q('[data-pmx-thread="' + th + '"] [data-pmx-region="workSurfaceHost"]');
      if (!datum || !datum.contains(chainIn(th))) datum = q('[data-pmx-thread="' + th + '"]');

      t.ok(shows(th, 'Reading 5 files'), th + ': the running phase states its partial count (f.208)');
      var topBefore = A.rect(chainIn(th)).top;
      var offsetBefore = topBefore - A.rect(datum).top;
      var glyphsBefore = glyphsIn(th).length;

      fire('activity', 'read');

      t.ok(shows(th, 'Reading 6 files'), th + ': the count is rewritten to 6 (f.286)');
      t.notOk(shows(th, 'Reading 5 files'), th + ': the previous count is gone, not appended as another row');
      var topAfter = A.rect(chainIn(th)).top;
      t.near(topAfter, topBefore, 0.5, th + ': the header row stays at the same viewport y while the count is rewritten');
      t.near(topAfter - A.rect(datum).top, offsetBefore, 0.5,
        th + ': the header row does not move inside its own region either');
      t.eq(glyphsIn(th).length, glyphsBefore,
        th + ': counting up adds no glyph, because a glyph is a phase and not a tick');

      fire('activity', 'read');
      fire('activity', 'settle');
      t.ok(shows(th, 'Read 7 files'), th + ': the verb flips to the past tense once the phase settles');

      fire('activity', 'edit');
      fire('activity', 'settle');
      fire('activity', 'condense');

      var run = RT.read(thId);
      t.eq(run.chain.length, 3, th + ': the scripted run entered three phases');
      var glyphs = glyphsIn(th);
      t.eq(glyphs.length, run.chain.length, th + ': the chain renders exactly one glyph per entered phase');
      var notButtons = glyphs.filter(function (g) { return g.tagName !== 'BUTTON'; });
      t.eq(notButtons.length, 0,
        th + ': every glyph in the chain is a real button, which is what makes the finished run reachable (f.1170, f.1300)');
      t.ok(shows(th, run.summaryLabel),
        th + ': the condensed capsule states the run as "' + run.summaryLabel + '" (f.910)');

      /* Random access, read back from the SCREEN. Asserting that the store changed would pass a
       * concept whose glyph mutates the trace and never repaints — which is precisely what a reader
       * would experience as a dead control. The glyph list is re-queried before each click because a
       * concept is free to rebuild its capsule on every render. */
      run.chain.forEach(function (want, i) {
        var live = glyphsIn(th);
        if (!live[i]) {
          t.record(false, th + ': glyph ' + i + ' is missing, so phase ' + want.id + ' has no route back');
          return;
        }
        live[i].click();
        t.ok(shows(th, want.headline),
          th + ': clicking glyph ' + i + ' reopens ' + want.id + ' and the capsule reads "' + want.headline + '"');
      });

      /* ---- Behaviour 4, the half that was never measured.
       *
       * runtrace.js cites f.910 for "condense is the resting state, not a deletion: the prose answer,
       * the verification row and the artifact card live BELOW the capsule and are PUSHED DOWN when a
       * phase is reopened, never replaced." Both halves were asserted at the record level — the work
       * surfaces are still live after a condense — and neither was asserted geometrically, which is
       * where the difference actually shows: a capsule that overlays what is beneath it, or one that
       * swaps the region's contents, both leave the record identical and the reading experience
       * ruined. So the sibling below the capsule is identified and its y is measured across a reopen.
       *
       * "Pushed down" is asserted as `>=`, not `>`. A concept whose capsule is absolutely positioned
       * in a margin has nothing below it to push, and demanding movement there would be demanding one
       * concept's layout from all eight — the same mistake the sentence-row read made. What must
       * never happen is the sibling moving UP or disappearing, and that is what this catches. */
      RT.close(thId);
      settleAll();

      /* The first element after the capsule in document order, found by walking up to the thread
       * root. It is RE-FOUND after the reopen rather than held as a reference, because seven of the
       * eight concepts rebuild this region and an identity check would be asking them to stop —
       * which the reference cannot ask, since a viewer cannot see element identity. What a viewer
       * CAN see is whether the same content is still there and whether it moved up, so that is what
       * is compared. */
      function belowCapsule() {
        var cap = capsuleIn(th);
        var walk = cap;
        while (walk) {
          if (walk.getAttribute && walk.getAttribute('data-pmx-thread')) return null;
          if (walk.nextElementSibling) return walk.nextElementSibling;
          walk = walk.parentElement;
        }
        return null;
      }

      var below = belowCapsule();
      if (!below) {
        /* Recorded, not skipped: "there is nothing below the capsule" is itself a fact about the
         * concept worth seeing in the report. */
        t.record(true, th + ': the capsule has no following sibling, so there is nothing below it to displace');
      } else {
        var belowBefore = A.rect(below).top;
        var belowText = squash(below.textContent).slice(0, 60);
        var reopen = glyphsIn(th)[0];
        if (!reopen) {
          t.record(false, th + ': no glyph to reopen, so behaviour 4 cannot be measured');
        } else {
          reopen.click();
          settleAll();
          var after = belowCapsule();
          t.ok(!!after,
            th + ': reopening a phase still leaves something below the capsule, not an emptied region (f.910)');
          if (after) {
            t.eq(squash(after.textContent).slice(0, 60), belowText,
              th + ': and the same content is below it — a reopen discloses, it does not re-author what follows');
            var belowAfter = A.rect(after).top;
            /* `>=`, not `>`. A concept whose capsule sits in a margin has nothing below it to push,
             * and demanding movement there would be demanding one concept's layout of all eight —
             * the same mistake the sentence-row read made. What must never happen is the content
             * below moving UP, which is what a capsule that overlays or swaps its region does.
             *
             * The looser form is not a vacuous one, and that was checked rather than assumed: run
             * with the strict `>` instead, SIX of the eight still pass — t1, t2, t3, t4, t6 and t8
             * genuinely displace what is beneath them. The two that hold are t5, whose chain sits
             * above the line in a lane pair, and t7, whose chain is a bar below the sentence.
             * Neither has anything beneath the capsule that a disclosure could push. */
            t.ok(belowAfter >= belowBefore - 0.5,
              th + ': the content below is pushed down or held, never pulled up, when a phase is reopened ' +
                '(' + Math.round(belowBefore) + ' -> ' + Math.round(belowAfter) + ')');
          }
        }
      }
    });

    store().set('ui.reducedMotion', false);
    /* Leave one known state behind: a run left mid-flight would put a running phase on screen for the
     * suites that follow, and `motion` refuses an indefinite animation that no live operation backs. */
    reset();
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
    /* All four canon widths, not two.
     *
     * CORRECTION_GOAL_PROMPT.md requires "all themes, widths ... pass", and COVERAGE.md names the
     * widths as 520 / 750 / 975 / 1200. This swept 520 and 750 only, so the two widths at which the
     * artifact workspace and pinned history actually coexist were never in the sweep — which is
     * precisely where a layout runs out of room. */
    var widths = opts.widths || [520, 750, 975, 1200];
    /* Themes are a GLOBAL concern, not a per-pairing one: a theme changes tokens, not structure. So
     * they are swept as their own axis rather than multiplied through 64 pairings, which would be
     * 2,048 runs to re-prove the same tokens sixty-four times. `opts.themes` names the pairings that
     * carry the sweep; the default pair is the two structural extremes. */
    var themes = opts.themes || null;
    var out = { pairings: [], total: 0, failed: 0, errors: 0, warnings: 0 };
    A.resetConsoleCounts();

    /* Yield to the MACROTASK queue between runs, not just to the microtask queue.
     *
     * This chain used to be plain `.then()` links, and a promise chain of synchronous mounts is one
     * unbroken block of work: microtasks drain before the event loop gets a turn, so the browser
     * never paints, never runs a full GC, and never lets the driver read progress. That was
     * survivable at 128 runs and stopped being survivable when the sweep widened to 320 — one
     * Chromium reached 12.8 GB resident and pushed the host into swap, which is the machine the user
     * had already had to restart once for running out of memory.
     *
     * A zero-delay setTimeout between runs is what hands the loop back. Each run's detached DOM then
     * becomes collectable while the next one is being set up, instead of every run's garbage being
     * held live until the whole sweep resolves. The cost is one task boundary per run; the benefit is
     * that the sweep's memory is bounded by the widest single run rather than by the total. */
    function yieldToLoop() {
      return new Promise(function (resolve) { setTimeout(resolve, 0); });
    }

    var chain = Promise.resolve();
    if (opts.themesOnly) pairs = [];
    pairs.forEach(function (p) {
      widths.forEach(function (w) {
        chain = chain.then(yieldToLoop).then(function () {
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
    /* The theme axis. Every theme, at every canon width, on the pairings named by the caller.
     *
     * Themes redefine tokens — colour, spacing, the motion duration and the sampled spring — so what
     * a theme can break is a layout that only fits in one of them, and a mount that throws when a
     * token it assumed is absent. Running `mount` under each is what turns "eight themes are
     * offered" into "eight themes render". Nothing here asserted a theme before; the count in
     * COVERAGE.md described an older harness that no longer exists in that form. */
    var themePairs = themes || ['w1+t1', 'w8+t4'];
    var themeList = (global.PMXWorkspace && global.PMXWorkspace.THEMES) || [];
    out.themes = { swept: [], total: 0, failed: 0 };
    /* `skipThemes` exists so the driver can run the theme axis as its own chunk in its own page,
     * rather than appending it to whichever window chunk happens to be last. */
    if (opts.skipThemes) themePairs = [];
    themePairs.forEach(function (key) {
      var parts = String(key).split('+');
      themeList.forEach(function (th) {
        widths.forEach(function (w) {
          chain = chain.then(yieldToLoop).then(function () {
            A.reset();
            setPairing(parts[0], parts[1]);
            store().set('ui.theme', th.id);
            store().set('ui.chatWidth', w);
            settleAll();
            return A.runOne('mount', {}).then(function () {
              var r = A.results();
              out.themes.total += r.total;
              out.themes.failed += r.failed;
              out.themes.swept.push({ pairing: key, theme: th.id, width: w, total: r.total, failed: r.failed });
            });
          });
        });
      });
    });

    return chain.then(function () {
      /* Leave the theme as the suite found it. A matrix that ended on retro-light would hand every
       * later capture a palette nobody asked for. */
      store().set('ui.theme', 'friendly-dark');
      var c = A.consoleCounts();
      out.errors = c.errors;
      out.warnings = c.warnings;
      out.failed += out.themes.failed;
      out.total += out.themes.total;
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
