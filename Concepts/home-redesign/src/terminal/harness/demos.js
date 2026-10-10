/* Harness-only demo scripts (never inlined into the layer). They drive the real terminal through its public API
   (window.PMT) and the host (window.PM_HOME), exactly as the chat and agents would. */
(function () {
  function sessions() { return (window.PMT && window.PMT.sessions()) || []; }
  function humanSession() {
    var a = window.PM_HOME && window.PM_HOME.active && window.PM_HOME.active();
    var list = sessions();
    if (a && a.tabId && /^terminal:/.test(a.tabId)) { var id = a.tabId.slice(9); var hit = list.find(function (s) { return s.id === id; }); if (hit && hit.owner === 'user') return hit; }
    return list.find(function (s) { return s.owner === 'user' && s.state === 'running'; }) || null;
  }
  function ensureHuman() {
    var s = humanSession();
    if (s) return Promise.resolve(s);
    PM_HOME.open({ kind: 'terminal', profile: 'zsh' });
    return new Promise(function (r) { setTimeout(function () { r(humanSession()); }, 400); });
  }
  function type(cmd) {
    return ensureHuman().then(function (s) {
      if (!s) return;
      var sess = PMT.session(s.id);
      PM_HOME.open({ kind: 'terminal', session: s.id });
      if (sess && sess.shell) sess.shell.typeCommand(cmd, 'user');
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function typeAll(cmds, gap) {
    for (var i = 0; i < cmds.length; i++) {
      await type(cmds[i]);
      await waitIdle(humanSession(), 30000);
      await sleep(gap || 300);
    }
  }
  function waitIdle(s, max) {
    return new Promise(function (r) {
      var t0 = Date.now();
      (function poll() {
        var x = s && PMT.session(s.id);
        if (!x || (!x.foreground() && Date.now() - t0 > 150) || Date.now() - t0 > max) r(); else setTimeout(poll, 120);
      })();
    });
  }

  async function agentDeploy() {
    var id = PMT.agent.open('Builder', { cwd: '/home/jared/tastebook/api' });
    await sleep(500);
    var steps = [
      ['git status', 'Checking the tree'],
      ['cargo build --workspace', 'Building'],
      ['cargo test --workspace', 'Testing'],
      ['./scripts/deploy.sh --stage', 'Deploying to staging'],
      ['echo deployed', 'Done']
    ];
    for (var i = 0; i < steps.length; i++) {
      PMT.agent.step(id, 'Builder', i + 1, steps.length, steps[i][1]);
      var r = await PMT.agent.run(id, 'Builder', steps[i][0], { step: i + 1, steps: steps.length, label: steps[i][1] });
      if (!r.ok) { console.log('[demo] Builder stopped:', r.reason); return; }
      if (r.exit !== 0) { console.log('[demo] step failed', r.exit); break; }
      await sleep(400);
    }
    PMT.agent.done(id);
  }
  async function agentAsks() {
    var s = await ensureHuman();
    if (!s) return;
    PM_HOME.open({ kind: 'terminal', session: s.id });
    var r = await PMT.agent.run(s.id, 'Reviewer', 'cargo test media::', { label: 'Reproducing the failure' });
    console.log('[demo] Reviewer result', r.ok ? 'exit ' + r.exit : r.reason);
    PMT.agent.done(s.id);
  }
  async function agentPassword() {
    var id = PMT.agent.open('Builder', { cwd: '/home/jared/tastebook/api' });
    await sleep(500);
    PM_HOME.open({ kind: 'terminal', session: id });
    var r = await PMT.agent.run(id, 'Builder', 'sudo systemctl restart tastebook', { step: 1, steps: 1, label: 'Restarting the service' });
    console.log('[demo] sudo result', r.ok ? 'exit ' + r.exit : r.reason);
    PMT.agent.done(id);
  }

  /* a realistic session in one go: git, cargo, a failing test with path links, an image, then an agent deploys in the
     background (its tab gets the agent mark and never takes focus) */
  async function workingSession() {
    await typeAll(['git status', 'git log --oneline --graph -8', 'cargo build --workspace', 'cargo test media::', 'imgcat assets/chart.png'], 500);
    await sleep(800);
    await agentDeploy();
  }

  /* chat command cards for the focused terminal's last commands (live) */
  var cardsEl = null;
  function cardsDemo() {
    if (cardsEl) { cardsEl.remove(); cardsEl = null; return; }
    cardsEl = document.createElement('div');
    cardsEl.className = 'pmx-cards';
    cardsEl.setAttribute('aria-label', 'Chat command cards');
    document.body.appendChild(cardsEl);
    var head = document.createElement('div'); head.className = 'pmx-cards-head'; head.textContent = 'Chat column: command cards';
    cardsEl.appendChild(head);
    var list = document.createElement('div'); cardsEl.appendChild(list);
    var shown = new Map();
    (function tick() {
      if (!cardsEl) return;
      var s = humanSession() || sessions()[0];
      var sess = s && PMT.session(s.id);
      if (sess) {
        var cmds = sess.term.commands.filter(function (c) { return c.cmdline && !c.empty; }).slice(-4);
        cmds.forEach(function (c) {
          var spec = PMT.cardSpec(s.id, c); if (!spec) return;
          var el = shown.get(c);
          if (!el) { el = PMT.card(spec); shown.set(c, el); list.appendChild(el); }
          else PMT._T.CommandCard.update(el, spec);
        });
        shown.forEach(function (el, c) { if (cmds.indexOf(c) < 0) { el.remove(); shown.delete(c); } });
      }
      setTimeout(tick, 1000);
    })();
  }

  window.PMT_HARNESS_DEMOS = window.PMT_HARNESS_DEMOS || [];
  window.PMT_HARNESS_DEMOS.push(
    { label: 'A working session: git, cargo, a failing test, an image, an agent', run: workingSession },
    { label: 'Agent: Builder deploys in a background terminal', run: agentDeploy },
    { label: 'Agent: Reviewer asks to type in your terminal', run: agentAsks },
    { label: 'Agent: a password prompt only you can answer', run: agentPassword },
    { label: 'Images: kitty, sixel, iTerm2, placeholders, animation', run: function () {
      typeAll(['kitten icat assets/bench.png', 'img2sixel assets/chart.png', 'imgcat assets/photo.jpg', 'kitten icat --unicode-placeholder assets/logo.png', 'kitten icat assets/spinner.gif', 'kitten icat --z-index -1 assets/chart.png; echo text drawn over the image']);
    } },
    { label: 'Build with progress (OSC 9;4)', run: function () { type('cargo build --workspace'); } },
    { label: 'Failing tests with path links', run: function () { type('cargo test media::'); } },
    { label: 'Full-screen program: htop', run: function () { type('htop'); } },
    { label: 'Colours, styles and drawn glyphs', run: function () { typeAll(['colortest', 'unicode-test']); } },
    { label: 'Dev server with a URL link', run: function () { type('npm run dev'); } },
    { label: 'Security: forged marks and refused file reads', run: function () { typeAll(['cat forged-marks.txt', 'kitten icat --transfer-mode=file /proc/self/environ', 'ssh devbox']); } },
    { label: 'Chat command cards (toggle)', run: cardsDemo },
    { label: 'Bell and notification', run: function () { typeAll(['bell', 'notify "Build finished" "214 tests passed"']); } }
  );
})();
