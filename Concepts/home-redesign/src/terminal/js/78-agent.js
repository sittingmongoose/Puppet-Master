/* Agents and terminals (D18). The session enforces the write rules (62-shell.js); this file draws the states and
   exposes the agent API the chat and the demos use.
   - Driving: "<agent> is driving this terminal", the step, and Take over, Interrupt, Stop.
   - Paused: after a take-over (a button or any keystroke): Hand back, Stop.
   - Permission: an agent asks to type into a terminal a human opened: Allow once, Allow in this terminal, Deny (DL-181).
     A grant decides who may type, never what may run: every command still needs its own approval for that exact
     invocation. "Allow in this terminal" lasts the rest of that agent's run, in memory only; a take-over or the run's
     end ends it and Hand back restores it (62-shell.js).
   - Secret input: a password prompt is open; only the human can answer it; the agent waits.
   Commands are attributed to whoever typed them (gutter marks). Agent-opened terminals land as background tabs (D8). */
(function () {
  var SQ = '<svg class="pmt-agent-sq" viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9"/><path d="M6.5 8h3"/></svg>';
  var LOCK = '<svg class="pmt-agent-sq" viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7.5" width="9" height="6"/><path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2"/></svg>';

  function Controller(view) {
    this.view = view; this.s = view.session;
    this.state = null; /* { mode: 'driving'|'paused'|'permission'|'secret', agent, step, steps, label, cmd } */
    var self = this;
    view._on(this.s, 'takeover', function (e) { self.onTakeover(e); });
    view._on(this.s, 'handback', function (e) { self.set({ mode: 'driving', agent: e.agent }); });
    view._on(this.s, 'secret', function (e) { self.onSecret(e); });
    view._on(this.s, 'refused', function (e) { self.onRefused(e); });
    view._on(this.s, 'notice', function (n) { view.notice({ id: 'note', tone: 'info', text: n.text, actions: [{ label: 'OK' }] }); });
    if (/^agent:/.test(this.s.owner)) this.set({ mode: 'driving', agent: this.s.owner, step: 0, steps: 0, label: 'Starting' });
  }
  Controller.prototype.frame = function () {};
  Controller.prototype.name = function (a) { return String(a || '').replace(/^agent:/, ''); };
  Controller.prototype.set = function (st) {
    var prev = this.state || {};
    this.state = st ? Object.assign({}, prev.mode && st.agent === prev.agent ? prev : {}, st) : null;
    this.render();
  };
  Controller.prototype.render = function () {
    var v = this.view, row = v.agentRow, st = this.state, self = this;
    if (!st) {
      row.hidden = true; row.innerHTML = '';
      v.setAgent(null); v.root.classList.remove('pmt-agent-driving');
      v.layoutSoon(); return;
    }
    var nm = T.util.esc(this.name(st.agent));
    var html = '', acts = [];
    if (st.mode === 'driving') {
      html = SQ + '<span class="pmt-agent-text"><b>' + nm + '</b> is driving this terminal' +
        (st.steps ? ' · step ' + st.step + ' of ' + st.steps : '') + (st.label ? ' · ' + T.util.esc(st.label) : '') + '</span>';
      acts = [['takeover', 'Take over'], ['interrupt', 'Interrupt'], ['stop', 'Stop']];
    } else if (st.mode === 'paused') {
      html = SQ + '<span class="pmt-agent-text">You took over. <b>' + nm + '</b> is paused and has been told.</span>';
      acts = [['handback', 'Hand back'], ['stop', 'Stop ' + nm]];
    } else if (st.mode === 'permission') {
      html = SQ + '<span class="pmt-agent-text"><b>' + nm + '</b> wants to type in this terminal' + (st.cmd ? ': <code>' + T.util.esc(st.cmd) + '</code>' : '') + '</span>';
      acts = [['allow', 'Allow once', nm + ' types this one command'],
        ['terminal', 'Allow in this terminal', nm + ' may type here until its run ends or you take over. Each command still needs its own approval.'],
        ['deny', 'Deny']];
    } else if (st.mode === 'secret') {
      html = LOCK + '<span class="pmt-agent-text">Password needed. Only you can answer this prompt' + (st.agent ? '; <b>' + nm + '</b> is waiting' : '') + '.</span>';
      acts = [['focus', 'Type it']];
    }
    row.innerHTML = html + '<span class="pmt-agent-acts">' + acts.map(function (a) {
      return '<button type="button" class="pmt-textbtn" data-act="' + a[0] + '"' + (a[2] ? ' data-pm-hover-label="' + a[2] + '"' : '') + '>' + a[1] + '</button>';
    }).join('') + '</span>';
    row.className = 'pmt-agentrow pmt-agent-' + st.mode;
    row.setAttribute('role', st.mode === 'permission' || st.mode === 'secret' ? 'alert' : 'status');
    row.hidden = false;
    row.onclick = function (e) { var b = e.target.closest('button'); if (b) self.act(b.getAttribute('data-act')); };
    v.setAgent(st.mode === 'secret' && !st.agent ? null : this.name(st.agent));
    v.root.classList.toggle('pmt-agent-driving', st.mode === 'driving');
    v.layoutSoon();
  };
  Controller.prototype.act = function (a) {
    var st = this.state || {}, s = this.s, v = this.view;
    if (a === 'takeover') { s.takeOver(); v.focus(); }
    else if (a === 'interrupt') { s.interrupt(); v.announce('Sent interrupt'); }
    else if (a === 'stop') { this.stopAgent(st.agent); }
    else if (a === 'handback') { s.handBack(); }
    else if (a === 'allow' || a === 'terminal') { if (st.resolve) st.resolve(a); this.set(st.prevState || null); }
    else if (a === 'deny') { if (st.resolve) st.resolve('deny'); this.set(st.prevState || null); }
    else if (a === 'focus') { v.focus(); }
  };
  Controller.prototype.stopAgent = function (agent) {
    var s = this.s;
    if (this.run) this.run.cancelled = true;
    s.endRun(agent);
    s.emit('agent-stopped', { agent: agent });
    this.view.announce(this.name(agent) + ' stopped');
    this.set(null);
  };
  Controller.prototype.onTakeover = function (e) {
    this.set({ mode: 'paused', agent: e.agent });
    this.view.announce('You took over. ' + this.name(e.agent) + ' is paused.');
  };
  Controller.prototype.onSecret = function (e) {
    if (e.on) {
      this._beforeSecret = this.state;
      var agent = this.state && this.state.agent;
      this.set({ mode: 'secret', agent: agent });
      if (this.view.api && this.view.api.update && !this.view.focused) this.view.api.update({ attention: true });
    } else if (this.state && this.state.mode === 'secret') {
      this.state = null; this.set(this._beforeSecret || null);
    }
  };
  Controller.prototype.onRefused = function (e) {
    if (e.reason === 'secret_input') this.view.announce(this.name(e.by) + ' cannot answer a password prompt');
  };

  /* ask the human; resolves 'allow' | 'terminal' | 'deny' */
  Controller.prototype.ask = function (agent, cmd) {
    var self = this;
    return new Promise(function (resolve) {
      var prev = self.state && self.state.mode !== 'permission' ? self.state : null;
      self.state = null;
      self.set({ mode: 'permission', agent: agent, cmd: cmd, resolve: resolve, prevState: prev });
      if (self.view.api && self.view.api.update) self.view.api.update({ attention: true });
    });
  };

  /* ---- the agent API ---- */
  function viewFor(id) { return window.PMT && window.PMT.view(id); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function waitCommand(term, cmdline) {
    return new Promise(function (resolve) {
      var started = null;
      var off = term.on('command', function (e) {
        if (e.type === 'exec' && !started) started = e.cmd;
        if (e.type === 'end' && started && e.cmd === started) { off(); resolve(e.cmd); }
      });
    });
  }

  var API = {
    /* opens an agent-owned terminal as a background tab (D8); returns its session id */
    open: function (name, spec) {
      spec = Object.assign({ kind: 'terminal', profile: 'zsh', by: 'agent:' + name, background: true }, spec || {});
      var r = window.PM_HOME ? window.PM_HOME.open(spec) : null;
      return r && r.tabId ? r.tabId.replace(/^terminal:/, '') : spec.session;
    },
    /* types a command as the agent and resolves when it ends: { ok, exit, output, reason } */
    run: async function (sessionId, name, cmd, opts) {
      opts = opts || {};
      var agent = 'agent:' + name, s = window.PMT.session(sessionId), v = viewFor(sessionId);
      if (!s || !v) return { ok: false, reason: 'unavailable' };
      var ctl = v.agent;
      var chk = s.canWrite(agent);
      if (!chk.ok && chk.reason === 'needs_permission') {
        var answer = await ctl.ask(agent, cmd);
        if (answer === 'deny') return { ok: false, reason: 'denied' };
        s.grant(agent, answer === 'terminal' ? 'terminal' : 'once');
        if (answer === 'allow') { var once = true; }
        chk = s.canWrite(agent);
      }
      if (!chk.ok) return { ok: false, reason: chk.reason };
      if (s.foreground()) return { ok: false, reason: 'busy' };
      ctl.set({ mode: 'driving', agent: agent, step: opts.step || 0, steps: opts.steps || 0, label: opts.label || '' });
      var run = ctl.run = { cancelled: false };
      var done = waitCommand(s.term, cmd);
      /* the agent types the exact command; it never owns the input line beyond that (DL-035, SMPFS-163) */
      for (var i = 0; i < cmd.length; i++) {
        if (run.cancelled) return { ok: false, reason: 'stopped' };
        var r = s.input(cmd[i], agent);
        if (!r.ok) return { ok: false, reason: r.reason === 'preempted' || s.paused === agent ? 'preempted' : r.reason };
        await sleep(opts.typeMs === undefined ? 14 : opts.typeMs);
      }
      var r2 = s.input('\r', agent);
      if (!r2.ok) return { ok: false, reason: s.paused === agent ? 'preempted' : r2.reason };
      var c = await Promise.race([done, new Promise(function (res) { var t = setInterval(function () { if (run.cancelled) { clearInterval(t); res(null); } }, 100); })]);
      if (once) s.revoke(agent);
      /* a one-off run in a terminal a human owns ends the agent's turn there: the row and mark go, the lease returns.
         An agent allowed in this terminal keeps it for the rest of its run (until done or Stop) */
      if (s.owner === 'user' && !opts.keep && !s.inTerminal.has(agent)) {
        if (s.lease === agent) s.lease = 'user';
        if (ctl.state && ctl.state.agent === agent && ctl.state.mode === 'driving') ctl.set(null);
      }
      if (!c) return { ok: false, reason: 'stopped' };
      /* output reads say what they are: final here; never stitched, never "empty" when missing (SMPFS-023) */
      return { ok: true, exit: c.exit, output: s.term.commandOutput(c), read: 'final' };
    },
    step: function (sessionId, name, step, steps, label) {
      var v = viewFor(sessionId); if (!v) return;
      v.agent.set({ mode: 'driving', agent: 'agent:' + name, step: step, steps: steps, label: label });
    },
    /* the agent's run is over: the row goes and its grant here ends (DL-181) */
    done: function (sessionId, name) {
      var v = viewFor(sessionId), s = window.PMT.session(sessionId); if (!s) return;
      var agent = name ? 'agent:' + name : (v && v.agent.state && v.agent.state.agent) || (/^agent:/.test(s.lease || '') ? s.lease : s.paused);
      if (v) v.agent.set(null);
      s.endRun(agent);
    },
    stop: function (sessionId, name) { var v = viewFor(sessionId); if (v) v.agent.stopAgent('agent:' + name); }
  };

  T.Agent = { attach: function (view) { return new Controller(view); }, api: API };
})();
