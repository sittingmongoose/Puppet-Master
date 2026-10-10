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
    this.state = null; /* { mode: 'driving'|'paused'|'secret', agent, step, steps, label } */
    /* permission requests waiting for the human, oldest first: { agent, cmd, resolve }. They live apart from the row
       state so a take-over, another agent's step or a Stop never drops one unanswered; the oldest shows as the row */
    this.asks = [];
    this.run = null;   /* the run typing or waiting here: { agent, typing, why, wake } */
    var self = this;
    view._on(this.s, 'takeover', function (e) { self.onTakeover(e); });
    view._on(this.s, 'handback', function (e) { self.set({ mode: 'driving', agent: e.agent }); });
    view._on(this.s, 'secret', function (e) { self.onSecret(e); });
    view._on(this.s, 'refused', function (e) { self.onRefused(e); });
    view._on(this.s, 'grant', function (e) { if (e.revoked) self.onRevoked(e.agent); });
    view._on(this.s, 'notice', function (n) { view.notice({ id: 'note', tone: 'info', text: n.text, actions: [{ label: 'OK' }] }); });
    /* the terminal closed or its session ended: nothing waits on it any more */
    view._on(this.s, 'exit', function () { self.closeAll(); self.render(); });
    view.disposers.push(function () { self.closeAll(); });
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
    var v = this.view, row = v.agentRow, st = this.state, self = this, q = this.asks[0];
    /* a waiting request shows over the driving or paused row; a password prompt shows over it (the human answers that
       first, then the request comes back) */
    if (q && !(st && st.mode === 'secret')) st = { mode: 'permission', agent: q.agent, cmd: q.cmd };
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
      /* the command exactly as it would be typed: a control key shows as ^X, never as a space or nothing */
      var shown = st.cmd ? String(st.cmd).replace(/[\x00-\x1f\x7f]/g, function (c) { return '^' + String.fromCharCode(c.charCodeAt(0) ^ 64); }) : '';
      html = SQ + '<span class="pmt-agent-text"><b>' + nm + '</b> wants to type in this terminal' + (shown ? ': <code>' + T.util.esc(shown) + '</code>' : '') + '</span>';
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
    else if (a === 'interrupt') {
      /* while the agent is still typing, Interrupt also abandons the rest of its line and the Enter (the Ctrl+C has
         dropped what it typed); once the command runs it only signals the job */
      if (this.run && this.run.typing) this.halt(this.run.agent, 'interrupted');
      s.interrupt(); v.announce('Sent interrupt');
    }
    else if (a === 'stop') { this.stopAgent(st.agent); }
    else if (a === 'handback') { s.handBack(); }
    else if (a === 'allow' || a === 'terminal' || a === 'deny') { var q = this.asks.shift(); if (q) q.resolve(a); this.render(); }
    else if (a === 'focus') { v.focus(); }
  };
  Controller.prototype.stopAgent = function (agent) {
    var s = this.s;
    this.halt(agent, 'stopped');
    dropLine(s, agent);
    s.endRun(agent);
    s.emit('agent-stopped', { agent: agent });
    this.view.announce(this.name(agent) + ' stopped');
    this.ended(agent, 'stopped');
  };
  /* ends this agent's run here, if it is the one typing or waiting (Stop aimed at one agent never stops another's) */
  Controller.prototype.halt = function (agent, why) {
    var r = this.run;
    if (r && !r.why && (!agent || r.agent === agent)) { r.why = why; if (r.wake) r.wake(); }
  };
  /* answers this agent's waiting requests (every agent's when none is named, every other agent's with `others`) without
     the human: the run gets `why` */
  Controller.prototype.settle = function (agent, why, others) {
    var keep = [];
    this.asks.forEach(function (q) { if (!agent || (q.agent === agent) !== !!others) q.resolve(why); else keep.push(q); });
    this.asks = keep;
  };
  /* an agent's run is over: its requests are settled and its row goes; a password prompt stays, without its name */
  Controller.prototype.ended = function (agent, why) {
    if (!agent) return;
    this.settle(agent, why);
    if (this._beforeSecret && this._beforeSecret.agent === agent) this._beforeSecret = null;
    var st = this.state;
    if (st && st.agent === agent) this.set(st.mode === 'secret' ? { mode: 'secret', agent: null } : null);
    else this.render();
  };
  /* the session ended or the view closed */
  Controller.prototype.closeAll = function () {
    this.halt(null, 'ended');
    this.settle(null, 'ended');
  };
  /* a grant that ended while its agent sat between commands (Revoke in More > Agent input, the end of an "Allow once")
     takes the driving row with it: that agent no longer holds this terminal, and Take over would have nothing to take */
  Controller.prototype.onRevoked = function (agent) {
    var st = this.state, s = this.s;
    if (st && st.mode === 'driving' && st.agent === agent && s.lease !== agent && !s.grants.has(agent)) this.set(null);
  };
  Controller.prototype.onTakeover = function (e) {
    /* no request can be granted while the human holds the terminal (62-shell.js canWrite): it is answered, not left up
       over the Hand back row */
    this.settle(e.agent, 'preempted'); this.settle(null, 'busy');
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

  /* ask the human; resolves 'allow' | 'terminal' | 'deny', or 'stopped' | 'ended' when the run ends unanswered */
  Controller.prototype.ask = function (agent, cmd) {
    var self = this;
    return new Promise(function (resolve) {
      self.asks.push({ agent: agent, cmd: cmd, resolve: resolve });
      self.render();
      if (self.view.api && self.view.api.update) self.view.api.update({ attention: true });
    });
  };

  /* ---- the agent API ---- */
  function viewFor(id) { return window.PMT && window.PMT.view(id); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* resolves with the command the agent's line ran, or with the prompt it typed at when the line ran nothing (empty, or
     an unmatched quote: the prompt ends with no exec). cancel() drops the listener */
  function waitCommand(term) {
    /* only a prompt still waiting for its command: an earlier command can still be running while the terminal holds
       output for an image decode, and its end would settle this run */
    var cc = term.curCmd, off, at = cc && (cc.state === 'prompt' || cc.state === 'input') ? cc : null;
    var p = new Promise(function (resolve) {
      var started = null;
      off = term.on('command', function (e) {
        if (e.type === 'prompt' && !started) at = e.cmd;
        if (e.type === 'exec' && !started) started = e.cmd;
        if (e.type === 'end' && (started ? e.cmd === started : e.cmd === at)) { off(); resolve(e.cmd); }
      });
    });
    p.cancel = function () { off(); };
    return p;
  }
  function innerShell(s) { var sh = s.shell; while (sh && sh.child) sh = sh.child; return sh; }
  /* the input line the agent would type into (the innermost shell's, so inside ssh too) already holds text, typed or
     still queued: the agent's keys would join it and run a command nobody approved, credited to the human */
  function lineHeld(s) {
    var sh = innerShell(s); if (!sh) return false;
    if (sh.ed && (sh.ed.buf || sh.ed.search)) return true;
    return (sh.queue || []).some(function (q) { return q.by !== 'terminal' && q.data; });
  }
  /* why the agent cannot type now, checked before anyone is asked: a program has the terminal, another agent holds
     it, or the line is not empty */
  function notReady(s, agent) {
    if (s.foreground() || (/^agent:/.test(s.lease || '') && s.lease !== agent)) return 'busy';
    if (lineHeld(s)) return 'line_not_empty';
    return null;
  }
  /* Stop leaves no half-typed command of that agent's behind, also one a take-over cut short: a line only it typed is
     cleared (end of line, then kill to its start, sent as the terminal's own keys); a line the human typed on stays.
     The emptied line is nobody's, so the next agent to type there is credited, not the human. Interrupt needs none of
     this: its Ctrl+C drops the line. True when keys were sent (the editor takes them a moment later) */
  function dropLine(s, agent) {
    var sh = innerShell(s), ed = sh && sh.ed;
    if (!ed || ed.typer !== agent) return false;
    var had = !!ed.buf;
    if (had) s.shell.deliver('\x05\x15', 'terminal');
    ed.typer = null; ed.agents.delete(agent);
    return had;
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
      /* one command line, typed exactly as the human approves it: a line break would run a second command under the
         same approval, and a control key would edit or end the line (DL-181) */
      if (typeof cmd !== 'string' || !cmd.trim() || /[\x00-\x1f\x7f-\x9f]/.test(cmd)) return { ok: false, reason: 'invalid_command' };
      var ctl = v.agent, once = false, why;
      var chk = s.canWrite(agent);
      /* the human is never asked for a run that cannot happen now. This agent's own half-typed line, left when a take-over
         or a revoke cut its last run short, is cleared first as Stop does, so its next command is not refused for it */
      if (chk.ok || chk.reason === 'needs_permission') {
        if (!s.foreground() && dropLine(s, agent)) await sleep(0);
        why = notReady(s, agent); if (why) return { ok: false, reason: why };
      }
      if (!chk.ok && chk.reason === 'needs_permission') {
        var answer = await ctl.ask(agent, cmd);
        if (answer !== 'allow' && answer !== 'terminal') return { ok: false, reason: answer === 'deny' ? 'denied' : answer };
        s.grant(agent, answer === 'terminal' ? 'terminal' : 'once');
        once = answer === 'allow';
        chk = s.canWrite(agent);
      }
      var run = null, done = null;
      /* "Allow once" lasts this one command, however the run ends: every return below revokes it (DL-181) */
      try {
        if (!chk.ok) return { ok: false, reason: chk.reason };
        /* again after the wait: the human may have started a program or typed on the line meanwhile */
        why = notReady(s, agent); if (why) return { ok: false, reason: why };
        /* this agent holds the terminal from its first key: another agent's waiting request could not run now */
        ctl.settle(agent, 'busy', true);
        ctl.set({ mode: 'driving', agent: agent, step: opts.step || 0, steps: opts.steps || 0, label: opts.label || '' });
        run = ctl.run = { agent: agent, typing: true, why: null, wake: null };
        var halted = new Promise(function (res) { run.wake = function () { res(null); }; });
        done = waitCommand(s.term);
        /* the agent types the exact command; it never owns the input line beyond that (DL-035, SMPFS-163) */
        for (var i = 0; i < cmd.length; i++) {
          if (run.why) return { ok: false, reason: run.why };
          var r = s.input(cmd[i], agent);
          if (!r.ok) return { ok: false, reason: r.reason === 'preempted' || s.paused === agent ? 'preempted' : r.reason };
          await sleep(opts.typeMs === undefined ? 14 : opts.typeMs);
        }
        if (run.why) return { ok: false, reason: run.why };
        run.typing = false;
        var r2 = s.input('\r', agent);
        if (!r2.ok) return { ok: false, reason: s.paused === agent ? 'preempted' : r2.reason };
        var c = await Promise.race([done, halted]);
        /* a one-off run in a terminal a human owns ends the agent's turn there: the row and mark go, the lease returns.
           An agent allowed in this terminal keeps it for the rest of its run (until done or Stop) */
        if (s.owner === 'user' && !opts.keep && !s.inTerminal.has(agent)) {
          if (s.lease === agent) s.lease = 'user';
          if (ctl.state && ctl.state.agent === agent && ctl.state.mode === 'driving') ctl.set(null);
        }
        if (!c) return { ok: false, reason: run.why };
        /* the line ran nothing (an unmatched quote): no exit code and no output to report */
        if (!c.outputLine) return { ok: false, reason: 'not_run' };
        /* the line that ran is not the one approved (text joined it): its output is not this command's */
        if (c.cmdline !== cmd.slice(0, 4096)) return { ok: false, reason: 'mismatch' };
        /* output reads say what they are: final here; never stitched, never "empty" when missing (SMPFS-023) */
        return { ok: true, exit: c.exit, output: s.term.commandOutput(c), read: 'final' };
      } finally {
        if (done) done.cancel();
        if (run && ctl.run === run) ctl.run = null;
        if (once) s.revoke(agent);
      }
    },
    step: function (sessionId, name, step, steps, label) {
      var v = viewFor(sessionId); if (!v) return;
      v.agent.set({ mode: 'driving', agent: 'agent:' + name, step: step, steps: steps, label: label });
    },
    /* the agent's run is over: its row goes and its grant here ends (DL-181). Without a name it is the agent holding
       the terminal, then the paused one; the row is the last resort, since it may show another agent's request */
    done: function (sessionId, name) {
      var v = viewFor(sessionId), s = window.PMT.session(sessionId); if (!s) return;
      var st = v && v.agent.state;
      var agent = name ? 'agent:' + name : /^agent:/.test(s.lease || '') ? s.lease : s.paused || (st && st.agent);
      if (v) v.agent.ended(agent, 'ended');
      s.endRun(agent);
    },
    stop: function (sessionId, name) { var v = viewFor(sessionId); if (v) v.agent.stopAgent('agent:' + name); }
  };

  T.Agent = { attach: function (view) { return new Controller(view); }, api: API };
})();
