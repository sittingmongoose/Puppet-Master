/* T.Session and T.Shell: the simulated PTY host and a zsh-like shell.
   PM owns every PTY (DL-035): a session holds one T.Terminal and one shell process tree. The line discipline does
   ONLCR, echoes typeahead, turns Ctrl+C into SIGINT for the foreground job, and enforces the write rules for agents
   (D18): one writer at a time, a human keystroke takes over, an agent cannot type into a terminal a human opened
   unless the human allowed it, and secret prompts accept no agent input. */
(function () {
  var b64 = function (s) { return T.base64.encode(T.util.utf8Encode(s)); };
  function strWidth(s) {
    var w = 0;
    for (var i = 0; i < s.length; i++) { var c = s.codePointAt(i); if (c > 0xffff) i++; w += T.wcwidth(c); }
    return w;
  }
  T.strWidth = strWidth;

  var PROFILES = {
    zsh: { id: 'zsh', label: 'zsh', shell: 'zsh', detail: 'Default shell' },
    bash: { id: 'bash', label: 'bash', shell: 'bash', detail: 'GNU bash 5.2' },
    pwsh: { id: 'pwsh', label: 'pwsh', shell: 'pwsh', detail: 'PowerShell 7.5' },
    'ssh-devbox': { id: 'ssh-devbox', label: 'ssh devbox', shell: 'zsh', detail: 'jared@devbox', ssh: 'devbox' }
  };
  T.PROFILES = PROFILES;

  var HISTORY_SEED = ['git status', 'cargo build --workspace', 'cargo test --workspace', 'ls -la', 'kitten icat assets/bench.png',
    'npm run dev', 'htop', 'git log --oneline --graph -12', 'cargo test media::', 'colortest'];

  /* ================= Session ================= */
  function Session(opts) {
    T.mixinEmitter(this);
    opts = opts || {};
    this.id = opts.id || T.uid('s');
    this.profile = PROFILES[opts.profile] || PROFILES.zsh;
    this.nonce = T.uid('n') + T.uid('');
    this.owner = opts.by && /^agent:/.test(opts.by) ? opts.by : 'user';
    this.grants = new Set(this.owner !== 'user' ? [this.owner] : []);
    this.lease = this.owner;            /* who may write now: 'user' | 'agent:<name>' */
    this.paused = null;                 /* agent paused by a take-over */
    this.secret = false;
    this.state = 'starting';            /* running | ended */
    this.exitCode = null;
    this.vfs = opts.vfs || (T.VFS ? T.Session.machine() : null);
    this.cwd = opts.cwd || (this.vfs && this.vfs.home ? this.vfs.home + '/tastebook/api' : '/home/jared/tastebook/api');
    this.host = 'nas1'; this.user = 'jared';
    var self = this;
    this.term = new T.Terminal({ cols: opts.cols || 80, rows: opts.rows || 24, nonce: this.nonce, scrollback: 10000,
      cell: function () { return self.cellPx ? self.cellPx() : { w: 8, h: 17 }; },
      isDark: function () { return self.isDark ? self.isDark() : true; } });
    if (T.ImageStore) T.ImageStore.attach(this.term, this);
    this.term.on('reply', function (r) { self._reply(r); });
    this.jobs = [];
    this.fg = null;                      /* foreground job */
    this.history = HISTORY_SEED.slice();
    this.startedAt = Date.now();
    this.lastTyper = 'user';
  }
  T.Session = Session;

  var machine = null;
  Session.machine = function () {
    if (!machine && T.VFS) machine = T.VFS.local ? T.VFS.local() : new T.VFS();
    return machine;
  };

  Session.prototype.start = function () {
    if (this.state !== 'starting') return;
    this.state = 'running';
    var self = this;
    this.shell = new Shell(this, { vfs: this.vfs, cwd: this.cwd, host: this.host, user: this.user, profile: this.profile });
    this.shell.run().then(function (code) { self._ended(code); }, function (e) { console.error('[pmt] shell crashed', e); self._ended(1); });
    if (this.profile.ssh) setTimeout(function () { self.shell.typeCommand('ssh ' + self.profile.ssh, 'user'); }, 30);
  };
  Session.prototype._ended = function (code) {
    this.state = 'ended'; this.exitCode = code;
    this.term.write('\r\n');
    this.emit('exit', code);
  };

  /* bytes from the terminal to the program (replies to queries, kitty graphics replies...) */
  Session.prototype._reply = function (r) {
    var sh = this.shell;
    var target = sh && sh.activeQuery();
    if (target) { target.push(r); return; }
    /* nobody is waiting: the shell's line editor swallows escape sequences, programs get them as input */
    if (sh) sh.deliver(r, 'terminal');
  };

  /* write rules (D18). Returns { ok, reason } */
  Session.prototype.canWrite = function (by) {
    if (this.state !== 'running') return { ok: false, reason: 'ended' };
    if (by === 'user' || !by) return { ok: true };
    if (this.secret) return { ok: false, reason: 'secret_input' };
    if (!this.grants.has(by)) return { ok: false, reason: 'needs_permission' };
    if (this.paused === by) return { ok: false, reason: 'preempted' };
    if (this.lease !== by && this.lease !== null && this.lease !== 'user') return { ok: false, reason: 'busy' };
    return { ok: true };
  };
  /* typing from the keyboard (by 'user') or an agent ('agent:<name>') */
  Session.prototype.input = function (data, by) {
    by = by || 'user';
    var ok = this.canWrite(by);
    if (!ok.ok) { this.emit('refused', { by: by, reason: ok.reason }); return ok; }
    if (by === 'user' && /^agent:/.test(this.lease || '') && !this._typingAsAgent) {
      /* any human keystroke takes over: the agent is paused and told so */
      var agent = this.lease;
      this.paused = agent; this.lease = 'user';
      this.emit('takeover', { agent: agent, reason: 'typed' });
    }
    if (by !== 'user') this.lease = by;
    this.lastTyper = by;
    if (this.shell) this.shell.deliver(data, by);
    return { ok: true };
  };
  Session.prototype.grant = function (agent, always) {
    this.grants.add(agent);
    this.emit('grant', { agent: agent, always: !!always });
  };
  Session.prototype.revoke = function (agent) { this.grants.delete(agent); if (this.lease === agent) this.lease = 'user'; this.emit('grant', { agent: agent, revoked: true }); };
  Session.prototype.takeOver = function () {
    if (/^agent:/.test(this.lease || '')) { this.paused = this.lease; this.lease = 'user'; this.emit('takeover', { agent: this.paused, reason: 'button' }); }
  };
  Session.prototype.handBack = function () {
    if (this.paused) { var a = this.paused; this.paused = null; this.lease = a; this.emit('handback', { agent: a }); }
  };
  Session.prototype.interrupt = function () { if (this.shell) this.shell.signal('SIGINT', true); };
  Session.prototype.kill = function () { if (this.shell) this.shell.signal('SIGKILL', true); };
  Session.prototype.resize = function (cols, rows) {
    var r = this.term.resize(cols, rows);
    if (r && this.shell) this.shell.onResize();
    return r;
  };
  Session.prototype.dispose = function () {
    if (this.shell) this.shell.signal('SIGHUP', false);
    this.state = 'ended';
  };
  Session.prototype.write = function (s) {
    /* output from the process side: ONLCR */
    this.term.write(String(s).replace(/\r?\n/g, '\r\n'));
  };
  Session.prototype.foreground = function () { return this.shell ? this.shell.fgName() : null; };

  /* ================= Shell ================= */
  function Shell(session, o) {
    this.s = session;
    this.vfs = o.vfs; this.cwd = o.cwd; this.host = o.host; this.user = o.user;
    this.profile = o.profile || PROFILES.zsh;
    this.remote = o.remote || null;
    this.parent = o.parent || null;
    this.env = { HOME: '/home/' + o.user, USER: o.user, HOSTNAME: o.host, PWD: o.cwd, TERM: 'xterm-256color',
      COLORTERM: 'truecolor', TERM_PROGRAM: 'PuppetMaster', SHELL: '/bin/' + (this.profile.shell || 'zsh'), LANG: 'en_US.UTF-8',
      PATH: '/usr/local/bin:/usr/bin:/bin:/home/' + o.user + '/.cargo/bin' };
    this.aliases = { ll: 'ls -la', la: 'ls -a', gs: 'git status' };
    this.last = 0;
    this.motd = o.motd || null;
    this.queue = [];          /* pending input chunks for whoever reads next */
    this.waiter = null;       /* resolver waiting for input */
    this.mode = 'idle';       /* edit | job | line | raw */
    this.job = null;
    this.queries = [];
    this.child = null;        /* a nested shell (ssh) */
    this.done = false;
  }
  T.Shell = Shell;

  Shell.prototype.out = function (str) { this.s.write(str); };
  Shell.prototype.rawOut = function (str) { this.s.term.write(str); };
  Shell.prototype.fgName = function () { if (this.child) return this.child.fgName(); return this.job ? this.job.name : null; };
  Shell.prototype.activeQuery = function () {
    if (this.child) return this.child.activeQuery();
    return this.queries.length ? this.queries[this.queries.length - 1] : null;
  };
  Shell.prototype.home = function () { return this.env.HOME; };
  Shell.prototype.short = function (p) {
    var h = this.home();
    return p === h ? '~' : p.indexOf(h + '/') === 0 ? '~' + p.slice(h.length) : p;
  };

  /* input arrives here from the session (user, agent or terminal replies) */
  Shell.prototype.deliver = function (data, by) {
    if (this.child) { this.child.deliver(data, by); return; }
    if (by !== 'terminal') this.typer = by;
    /* signal keys act at once in every mode but raw */
    if (this.mode === 'job' || this.mode === 'line') {
      for (var i = 0; i < data.length; i++) {
        var c = data.charCodeAt(i);
        if (c === 3) { this.rawOut('^C'); this.signal('SIGINT'); data = data.slice(0, i) + data.slice(i + 1); i--; }
        else if (c === 0x1c) { this.rawOut('^\\'); this.signal('SIGQUIT'); data = data.slice(0, i) + data.slice(i + 1); i--; }
        else if (c === 0x1a) { this.rawOut('^Z'); data = data.slice(0, i) + data.slice(i + 1); i--; }
      }
      if (!data) return;
    }
    if (this.mode === 'raw' && this.job && !this.job.trapInt && data === '\x03') { this.signal('SIGINT'); return; }
    if (this.mode === 'job' && by !== 'terminal') {
      /* typeahead: echoed now (cooked mode), used by the next prompt */
      this.rawOut(data.replace(/\r/g, '\r\n').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f]/g, ''));
    }
    if (this.mode === 'job' && by === 'terminal') return; /* stray replies while a job writes */
    this.queue.push({ data: data, by: by });
    var w = this.waiter; if (w) { this.waiter = null; w(); }
  };
  Shell.prototype._next = function () {
    var self = this;
    if (this.queue.length) return Promise.resolve(this.queue.shift());
    return new Promise(function (res) { self.waiter = function () { res(self.queue.shift()); }; });
  };

  Shell.prototype.signal = function (name, fromApi) {
    if (this.child) { this.child.signal(name, fromApi); return; }
    var job = this.job;
    if (name === 'SIGHUP') { this.done = true; if (job) job.raise('SIGHUP'); var w = this.waiter; if (w) { this.waiter = null; this.queue.push({ data: '', by: 'terminal' }); w(); } return; }
    if (job) {
      if (fromApi && name === 'SIGINT') this.rawOut('^C');
      job.raise(name);
    } else if (name === 'SIGINT' && this.mode === 'edit') {
      this.queue.push({ data: '\x03', by: 'user' });
      var w2 = this.waiter; if (w2) { this.waiter = null; w2(); }
    }
  };
  Shell.prototype.onResize = function () {
    if (this.child) { this.child.onResize(); return; }
    if (this.job) this.job.resized();
    if (this.mode === 'edit' && this.ed) this.ed.afterResize();
  };

  /* ---- main loop ---- */
  Shell.prototype.run = async function () {
    if (this.motd) this.out(this.motd);
    while (!this.done) {
      var line = await this.readCommand();
      if (line === null) break; /* EOF */
      if (!line.trim()) continue;
      await this.execLine(line);
    }
    return this.exitCode !== undefined ? this.exitCode : this.last;
  };

  Shell.prototype.promptText = function () {
    var cwd = this.short(this.cwd), p = this.profile.shell;
    var fail = this.last ? '\x1b[31m' + this.last + '\x1b[0m ' : '';
    if (p === 'bash') return '\x1b[32m' + this.user + '@' + this.host + '\x1b[0m:\x1b[34m' + cwd + '\x1b[0m$ ';
    if (p === 'pwsh') return '\x1b[32mPS \x1b[0m' + this.cwd + '> ';
    var branch = this.vfs && this.vfs.gitBranch ? this.vfs.gitBranch(this.cwd) : (this.cwd.indexOf('tastebook') >= 0 ? 'main' : '');
    return (this.remote ? '\x1b[33m' + this.host + '\x1b[0m ' : '') + '\x1b[34m' + cwd + '\x1b[0m' + (branch ? ' \x1b[2m' + branch + '\x1b[0m' : '') + ' ' + fail + '$ ';
  };
  Shell.prototype.mark = function (k, extra) {
    this.rawOut('\x1b]133;' + k + (extra !== undefined ? ';' + extra : '') + ';pmn=' + this.s.nonce + '\x07');
  };

  Shell.prototype.readCommand = async function () {
    var term = this.s.term;
    /* PROMPT_SP: a partial last line gets a reverse-video % and a newline, as zsh does */
    if (term.buf.cursor.x > 0 && !term.buf.cursor.pendingWrap) this.rawOut('\x1b[7m%\x1b[27m\r\n');
    else if (term.buf.cursor.pendingWrap) this.rawOut('\r\n');
    this.rawOut('\x1b]7;file://' + this.host + encodeURI(this.cwd) + '\x07');
    this.mark('A');
    this.rawOut(this.promptText());
    this.mark('B');
    this.rawOut('\x1b[?2004h');
    this.mode = 'edit';
    this.ed = new LineEditor(this);
    var res = await this.ed.run();
    this.rawOut('\x1b[?2004l');
    this.ed = null;
    return res;
  };

  /* a command typed by the API (agents and profiles): goes through the same input path */
  Shell.prototype.typeCommand = function (cmd, by) {
    if (this.child) return this.child.typeCommand(cmd, by);
    this.deliver(cmd + '\r', by);
  };

  /* ---- parsing ---- */
  function tokenize(line, env) {
    /* words with quotes and $VAR; operators ; && || | */
    var toks = [], cur = '', has = false, i = 0, q = null;
    function push() { if (has) toks.push({ w: cur }); cur = ''; has = false; }
    while (i < line.length) {
      var c = line[i];
      if (q) {
        if (c === q) { q = null; i++; continue; }
        if (c === '\\' && q === '"' && i + 1 < line.length) { var nx = line[i + 1]; cur += '$`"\\'.indexOf(nx) >= 0 ? nx : '\\' + nx; i += 2; continue; }
        if (c === '$' && q === '"') { var m0 = /^\$(\w+|\?|\{\w+\})/.exec(line.slice(i)); if (m0) { var nm0 = m0[1].replace(/[{}]/g, ''); cur += env(nm0); i += m0[0].length; continue; } }
        cur += c; i++; continue;
      }
      if (c === "'" || c === '"') { q = c; has = true; i++; continue; }
      if (c === '\\' && i + 1 < line.length) { cur += line[i + 1]; has = true; i += 2; continue; }
      if (c === ' ' || c === '\t') { push(); i++; continue; }
      if (c === ';') { push(); toks.push({ op: ';' }); i++; continue; }
      if (c === '&' && line[i + 1] === '&') { push(); toks.push({ op: '&&' }); i += 2; continue; }
      if (c === '|' && line[i + 1] === '|') { push(); toks.push({ op: '||' }); i += 2; continue; }
      if (c === '|') { push(); toks.push({ op: '|' }); i++; continue; }
      if (c === '>' ) { push(); var app = line[i + 1] === '>'; toks.push({ op: app ? '>>' : '>' }); i += app ? 2 : 1; continue; }
      if (c === '$') { var m = /^\$(\w+|\?|\{\w+\})/.exec(line.slice(i)); if (m) { var nm = m[1].replace(/[{}]/g, ''); cur += env(nm); has = true; i += m[0].length; continue; } }
      if (c === '~' && !has && (i + 1 === line.length || line[i + 1] === '/' || line[i + 1] === ' ')) { cur += env('HOME'); has = true; i++; continue; }
      cur += c; has = true; i++;
    }
    push();
    return { toks: toks, open: q };
  }

  Shell.prototype.execLine = async function (line) {
    var self = this;
    var parsed = tokenize(line, function (n) { return n === '?' ? String(self.last) : (self.env[n] !== undefined ? self.env[n] : ''); });
    if (parsed.open) { this.out('zsh: unmatched ' + parsed.open + '\n'); this.last = 1; this.endMark(); return; }
    /* split into pipelines joined by ; && || */
    var lists = [], cur = [[]], op = null;
    parsed.toks.forEach(function (t) {
      if (t.op === ';' || t.op === '&&' || t.op === '||') { lists.push({ pipe: cur, op: op }); cur = [[]]; op = t.op; }
      else if (t.op === '|') cur.push([]);
      else cur[cur.length - 1].push(t);
    });
    lists.push({ pipe: cur, op: op });
    this.mark('C');
    for (var i = 0; i < lists.length; i++) {
      var L = lists[i];
      if (L.op === '&&' && this.last !== 0) continue;
      if (L.op === '||' && this.last === 0) continue;
      if (!L.pipe.length || !L.pipe[0].length) continue;
      this.last = await this.runPipeline(L.pipe);
      if (this.done) break;
    }
    this.endMark();
  };
  Shell.prototype.endMark = function () { this.mark('D', this.last); };

  Shell.prototype.runPipeline = async function (pipe) {
    var stdin = null, code = 0;
    for (var i = 0; i < pipe.length; i++) {
      var words = pipe[i], redirect = null, argv = [];
      for (var k = 0; k < words.length; k++) {
        var t = words[k];
        if (t.op === '>' || t.op === '>>') { redirect = { append: t.op === '>>', path: words[k + 1] && words[k + 1].w }; k++; }
        else if (t.w !== undefined) argv.push(t.w);
      }
      /* FOO=bar cmd */
      var envAdd = {};
      while (argv.length && /^\w+=/.test(argv[0])) { var e = argv.shift().split('='); envAdd[e[0]] = e.slice(1).join('='); }
      if (!argv.length) { Object.assign(this.env, envAdd); continue; }
      if (this.aliases[argv[0]] && !this._inAlias) { argv = this.aliases[argv[0]].split(' ').concat(argv.slice(1)); }
      var capture = i < pipe.length - 1 || !!redirect;
      var r = await this.runCommand(argv, { stdin: stdin, capture: capture, env: envAdd });
      code = r.code;
      stdin = capture ? r.output : null;
      if (redirect && redirect.path && this.vfs) {
        try { var p = this.vfs.resolve(this.cwd, redirect.path); var prev = redirect.append ? (this.vfs.readText(p) || '') : ''; this.vfs.write(p, prev + (r.output || '')); }
        catch (err) { this.out('zsh: ' + (err.code === 'EACCES' ? 'permission denied' : 'no such file or directory') + ': ' + redirect.path + '\n'); code = 1; }
      }
      if (this.done) break;
    }
    return code;
  };

  var BUILTINS = ['cd', 'pwd', 'echo', 'printf', 'export', 'unset', 'alias', 'history', 'clear', 'exit', 'true', 'false',
    'type', 'which', 'source', 'jobs', 'fg', 'kill', 'sleep', 'env', 'logout'];
  T.BUILTINS = BUILTINS;

  Shell.prototype.runCommand = async function (argv, o) {
    var name = argv[0], self = this, out = [];
    var write = function (s) { if (o.capture) out.push(String(s)); else self.out(s); };
    if (BUILTINS.indexOf(name) >= 0) {
      var code = await this.builtin(name, argv, write, o);
      return { code: code, output: out.join('') };
    }
    var prog = T.Programs && T.Programs[name];
    if (!prog) {
      write('zsh: command not found: ' + name + '\n');
      return { code: 127, output: out.join('') };
    }
    return this.runProgram(prog, argv, o, write, out);
  };

  Shell.prototype.builtin = async function (name, argv, write, o) {
    var self = this, vfs = this.vfs;
    switch (name) {
      case 'cd': {
        var target = argv[1] === undefined || argv[1] === '~' ? this.home() : argv[1] === '-' ? (this.oldpwd || this.cwd) : argv[1];
        var path = vfs ? vfs.resolve(this.cwd, target) : target;
        var st = vfs ? vfs.stat(path) : { type: 'dir' };
        if (!st) { write('cd: no such file or directory: ' + argv[1] + '\n'); return 1; }
        if (st.type !== 'dir') { write('cd: not a directory: ' + argv[1] + '\n'); return 1; }
        this.oldpwd = this.cwd; this.cwd = path; this.env.PWD = path; this.s.cwd = this.remote ? this.s.cwd : path;
        return 0;
      }
      case 'pwd': write(this.cwd + '\n'); return 0;
      case 'echo': {
        var args = argv.slice(1), nl = true, esc = false;
        while (args.length && /^-[neE]+$/.test(args[0])) { if (args[0].indexOf('n') >= 0) nl = false; if (args[0].indexOf('e') >= 0) esc = true; args.shift(); }
        var text = args.join(' ');
        if (esc || true) text = unescape(text);
        write(text + (nl ? '\n' : ''));
        return 0;
      }
      case 'printf': {
        var fmt = unescape(argv[1] || ''), rest = argv.slice(2), idx = 0;
        var s = fmt.replace(/%(-?\d*)([sdq%])/g, function (_, w, t) { if (t === '%') return '%'; var v = rest[idx++]; return v === undefined ? '' : t === 'd' ? String(parseInt(v, 10) || 0) : v; });
        write(s); return 0;
      }
      case 'export': argv.slice(1).forEach(function (a) { var e = a.split('='); if (e.length > 1) self.env[e[0]] = e.slice(1).join('='); }); return 0;
      case 'unset': argv.slice(1).forEach(function (a) { delete self.env[a]; }); return 0;
      case 'alias':
        if (argv.length === 1) { Object.keys(this.aliases).forEach(function (k) { write(k + "='" + self.aliases[k] + "'\n"); }); return 0; }
        argv.slice(1).forEach(function (a) { var e = a.split('='); if (e.length > 1) self.aliases[e[0]] = e.slice(1).join('='); });
        return 0;
      case 'history': this.s.history.forEach(function (h, i) { write(String(i + 1).padStart(5) + '  ' + h + '\n'); }); return 0;
      case 'clear': if (!o.capture) this.rawOut('\x1b[H\x1b[2J\x1b[3J'); return 0;
      case 'exit': case 'logout': this.done = true; this.exitCode = argv[1] !== undefined ? (parseInt(argv[1], 10) & 255) : this.last; return this.exitCode;
      case 'true': return 0;
      case 'false': return 1;
      case 'type': case 'which': {
        var rc = 0;
        argv.slice(1).forEach(function (a) {
          if (BUILTINS.indexOf(a) >= 0) write(name === 'which' ? a + ': shell built-in command\n' : a + ' is a shell builtin\n');
          else if (self.aliases[a]) write(a + ' is an alias for ' + self.aliases[a] + '\n');
          else if (T.Programs && T.Programs[a]) write(name === 'which' ? '/usr/bin/' + a + '\n' : a + ' is /usr/bin/' + a + '\n');
          else { write(a + ' not found\n'); rc = 1; }
        });
        return rc;
      }
      case 'env': Object.keys(this.env).sort().forEach(function (k) { write(k + '=' + self.env[k] + '\n'); }); return 0;
      case 'jobs': return 0;
      case 'source': return 0;
      case 'fg': write('fg: no current job\n'); return 1;
      case 'kill': write('kill: not enough arguments\n'); return 1;
      case 'sleep': {
        var secs = parseFloat(argv[1] || '0') || 0;
        var job = this.startJob('sleep', o);
        try { await job.ctx.sleep(secs * 1000); return 0; }
        catch (e) { return e instanceof T.Signal ? 130 : 1; }
        finally { this.endJob(job); }
      }
    }
    return 0;
  };
  function unescape(s) {
    return s.replace(/\\(e|E|033|x1b|a|n|t|r|\\|0\d{0,3}|x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{4})/g, function (m, k) {
      if (k === 'e' || k === 'E' || k === '033' || k === 'x1b') return '\x1b';
      if (k === 'a') return '\x07'; if (k === 'n') return '\n'; if (k === 't') return '\t'; if (k === 'r') return '\r'; if (k === '\\') return '\\';
      if (k[0] === '0') return String.fromCharCode(parseInt(k, 8));
      if (k[0] === 'x') return String.fromCharCode(parseInt(k.slice(1), 16));
      if (k[0] === 'u') return String.fromCharCode(parseInt(k.slice(1), 16));
      return m;
    });
  }

  /* ---- jobs and the program context ---- */
  function Job(shell, name, o) {
    this.shell = shell; this.name = name; this.o = o || {};
    this.sigs = []; this.trapped = {}; this.trapInt = false;
    this.sleeps = new Set(); this.readers = new Set(); this.resizeFns = []; this.sigFns = [];
    this.aborted = false; this.signalName = null;
  }
  Job.prototype.raise = function (name) {
    if (this.trapped[name] && name !== 'SIGKILL') { this.sigFns.forEach(function (f) { try { f(name); } catch (e) {} }); return; }
    this.aborted = true; this.signalName = name;
    var err = new T.Signal(name);
    this.sleeps.forEach(function (s) { s.reject(err); }); this.sleeps.clear();
    this.readers.forEach(function (r) { r.reject(err); }); this.readers.clear();
    this.sigFns.forEach(function (f) { try { f(name); } catch (e) {} });
  };
  Job.prototype.resized = function () { this.resizeFns.forEach(function (f) { try { f(); } catch (e) {} }); };

  Shell.prototype.startJob = function (name, o) {
    var job = new Job(this, name, o), self = this, s = this.s;
    this.job = job; this.mode = 'job';
    var write = o && o.capture ? function (str) { o.sink.push(String(str)); } : function (str) { self.out(str); };
    var ctx = {
      argv: [name], env: Object.assign({}, this.env, (o && o.env) || {}),
      get cwd() { return self.cwd; },
      setCwd: function (p) { self.cwd = p; self.env.PWD = p; },
      out: function (str) { if (!job.aborted || job.signalName === null) write(str); },
      err: function (str) { write(str); },
      stdin: o && o.stdin !== undefined ? o.stdin : null,
      isatty: !(o && o.capture),
      sleep: function (ms) {
        if (job.aborted) return Promise.reject(new T.Signal(job.signalName || 'SIGINT'));
        return new Promise(function (res, rej) {
          var rec = { reject: rej };
          var t = setTimeout(function () { job.sleeps.delete(rec); res(); }, Math.max(0, ms));
          rec.reject = function (e) { clearTimeout(t); rej(e); };
          job.sleeps.add(rec);
        });
      },
      get signal() { return { aborted: job.aborted, name: job.signalName }; },
      onSignal: function (fn) { job.sigFns.push(fn); },
      trap: function (nm, on) { job.trapped[nm] = on; if (nm === 'SIGINT') job.trapInt = on; },
      setRaw: function (on) { self.mode = on ? 'raw' : 'job'; },
      readKey: function () {
        if (job.aborted) return Promise.reject(new T.Signal(job.signalName || 'SIGINT'));
        var prevMode = self.mode; if (prevMode === 'job') self.mode = 'raw';
        return new Promise(function (res, rej) {
          var rec = { reject: rej }; job.readers.add(rec);
          self._next().then(function (item) { job.readers.delete(rec); if (job.aborted) return; res(item ? item.data : ''); });
        });
      },
      readLine: function (prompt, opts) { return self.cookedRead(job, prompt, opts || {}); },
      size: function () { var c = s.cellPx ? s.cellPx() : { w: 8, h: 17 }; return { cols: s.term.cols, rows: s.term.rows, cellW: c.w, cellH: c.h }; },
      onResize: function (fn) { job.resizeFns.push(fn); },
      query: function (seq, opt) {
        opt = opt || {};
        var acc = [], done = false;
        self.queries.push(acc);
        self.out(seq);
        return new Promise(function (res) {
          var start = Date.now(), timeout = opt.timeout || 300;
          (function poll() {
            var joined = acc.join('');
            if (opt.until && opt.until.test(joined)) finish(joined);
            else if (Date.now() - start >= timeout) finish(joined);
            else setTimeout(poll, 10);
          })();
          function finish(v) { if (done) return; done = true; var i = self.queries.indexOf(acc); if (i >= 0) self.queries.splice(i, 1); res(v); }
        });
      },
      vfs: this.vfs,
      remote: this.remote,
      by: this.typer || s.lastTyper || 'user',
      assets: T.Assets,
      subshell: function (opts) { return self.runSubshell(job, opts); }
    };
    job.ctx = ctx;
    s.emit('job', { name: name, state: 'start' });
    return job;
  };
  Shell.prototype.endJob = function (job) {
    if (this.job === job) { this.job = null; }
    this.mode = 'idle';
    this.s.secret = false;
    this.s.emit('job', { name: job.name, state: 'end' });
  };

  Shell.prototype.runProgram = async function (prog, argv, o, write, out) {
    var job = this.startJob(argv[0], { capture: o.capture, sink: out, env: o.env, stdin: o.stdin });
    job.ctx.argv = argv.slice();
    var code;
    try {
      code = await prog.run(job.ctx);
      if (typeof code !== 'number') code = 0;
    } catch (e) {
      if (e instanceof T.Signal || (e && e.signal)) code = e.name === 'SIGKILL' ? 137 : e.name === 'SIGHUP' ? 129 : e.name === 'SIGQUIT' ? 131 : 130;
      else { console.error('[pmt] program failed', argv[0], e); this.out('\n' + argv[0] + ': internal error\n'); code = 1; }
    }
    /* a program that left the alternate screen or modes behind is cleaned up, like a shell's reset hook */
    if (this.s.term.buf === this.s.term.alt) this.rawOut('\x1b[?1049l');
    this.rawOut('\x1b[?25h\x1b[0m');
    if (this.s.term.progress.state) this.rawOut('\x1b]9;4;0\x07');
    this.endJob(job);
    return { code: code & 255, output: out.join('') };
  };

  /* cooked-mode line read for programs (sudo, ssh password prompts) */
  Shell.prototype.cookedRead = function (job, prompt, opts) {
    var self = this;
    if (prompt) this.out(prompt);
    this.mode = 'line';
    if (opts.secret) { this.s.secret = true; this.s.emit('secret', { on: true, prompt: prompt }); }
    var buf = '';
    return new Promise(function (res, rej) {
      var rec = { reject: function (e) { finish(); rej(e); } };
      job.readers.add(rec);
      function finish() { self.mode = 'job'; if (opts.secret) { self.s.secret = false; self.s.emit('secret', { on: false }); } job.readers.delete(rec); }
      (function loop() {
        self._next().then(function (item) {
          if (job.aborted) return;
          var d = item ? item.data : '';
          for (var i = 0; i < d.length; i++) {
            var c = d[i], code = d.charCodeAt(i);
            if (c === '\r' || c === '\n') { self.rawOut('\r\n'); finish(); res(buf); return; }
            if (code === 0x7f || code === 8) { if (buf.length) { buf = buf.slice(0, -1); if (!opts.secret) self.rawOut('\b \b'); } continue; }
            if (code === 0x15) { if (!opts.secret) self.rawOut('\r\x1b[K' + (prompt || '')); buf = ''; continue; }
            if (code === 0x1b) { var m = /^\x1b(\[[0-9;?]*[ -\/]*[@-~]|O.|\][^\x07\x1b]*(\x07|\x1b\\)|_[^\x1b]*\x1b\\|.)/.exec(d.slice(i)); i += m ? m[0].length - 1 : 0; continue; }
            if (code < 0x20) continue;
            buf += c; if (!opts.secret) self.rawOut(c);
          }
          loop();
        });
      })();
    });
  };

  Shell.prototype.runSubshell = async function (job, opts) {
    var child = new Shell(this.s, { vfs: opts.vfs || this.vfs, cwd: opts.cwd || ('/home/' + (opts.user || this.user)),
      host: opts.host || this.host, user: opts.user || this.user, profile: PROFILES.zsh, remote: opts.remote ? { host: opts.host } : null,
      parent: this, motd: opts.motd });
    this.child = child; this.mode = 'job';
    var code;
    try { code = await child.run(); }
    finally { this.child = null; this.mode = 'job'; }
    return code;
  };

  /* ================= line editor ================= */
  function LineEditor(sh) {
    this.sh = sh; this.buf = ''; this.pos = 0; this.hist = sh.s.history; this.hi = this.hist.length;
    this.saved = ''; this.yank = ''; this.search = null; this.endRow = 0;
    this.pending = '';
    this.term = sh.s.term;
    this.startX = this.term.buf.cursor.x; /* where input starts on the prompt line */
    this.startOff = this.startX;          /* logical offset of the input start within the prompt's line */
    this.curRow = 0;                      /* cursor row relative to the input start row */
  }
  LineEditor.prototype.run = async function () {
    var sh = this.sh;
    for (;;) {
      var item = await sh._next();
      if (!item) return null;
      if (sh.done) return null;
      var r = this.feed(item.data, item.by);
      if (r !== undefined) return r;
    }
  };
  LineEditor.prototype.cols = function () { return this.term.cols; };
  /* width-aware position of an index in the buffer, relative to the input start */
  LineEditor.prototype.posOf = function (idx) {
    var cols = this.cols(), x = this.startX, row = 0, s = this.buf.slice(0, idx);
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i); if (c > 0xffff) i++;
      var w = T.wcwidth(c);
      if (x + w > cols) { row++; x = 0; }
      x += w;
      if (x >= cols && i < s.length - 1) { row++; x = 0; }
    }
    if (x >= cols) { row++; x = 0; }
    return { row: row, x: x };
  };
  LineEditor.prototype.refresh = function () {
    var out = '';
    /* back to the input start */
    if (this.curRow > 0) out += '\x1b[' + this.curRow + 'A';
    out += '\r' + (this.startX ? '\x1b[' + this.startX + 'C' : '');
    var shown = this.buf;
    if (this.search) {
      shown = '';
      out += '\x1b[J';
      var label = (this.search.fail ? 'failing ' : '') + 'bck-i-search: ' + this.search.q + '_';
      var match = this.search.match || '';
      /* zsh shows the match on the line and the search under it */
      out += match + '\r\n' + label;
      this.sh.rawOut(out);
      var lines = 1 + Math.floor((this.startX + strWidth(match)) / this.cols());
      this.curRow = lines;
      this.endRow = lines;
      return;
    }
    out += this.render(shown) + '\x1b[J';
    var end = this.posOf(this.buf.length), at = this.posOf(this.pos);
    /* the terminal's own cursor after writing sits at end (or pending wrap) */
    if (end.x === 0 && end.row > 0 && this.buf.length) out += ' \r';
    var up = end.row - at.row;
    if (up > 0) out += '\x1b[' + up + 'A';
    out += '\r' + (at.x ? '\x1b[' + at.x + 'C' : '');
    this.curRow = at.row; this.endRow = end.row;
    this.sh.rawOut(out);
  };
  /* light syntax colouring like zsh-syntax-highlighting: known command green, unknown red, strings yellow */
  LineEditor.prototype.render = function (s) {
    var m = /^(\s*)(\S+)([\s\S]*)$/.exec(s);
    if (!m) return s;
    var cmd = m[2], known = T.BUILTINS.indexOf(cmd) >= 0 || (T.Programs && T.Programs[cmd]) || this.sh.aliases[cmd] || /^\.?\//.test(cmd);
    var rest = m[3].replace(/("[^"]*"?|'[^']*'?)/g, '\x1b[33m$1\x1b[39m');
    return m[1] + (known ? '\x1b[32m' : '\x1b[31m') + cmd + '\x1b[39m' + rest;
  };
  LineEditor.prototype.afterResize = function () {
    /* the terminal reflowed the prompt's logical line: recompute where input starts and where the cursor is */
    var cols = this.cols();
    this.startX = this.startOff % cols;
    this.curRow = this.posOf(this.pos).row;
  };
  LineEditor.prototype.insert = function (s) {
    this.buf = this.buf.slice(0, this.pos) + s + this.buf.slice(this.pos);
    this.pos += s.length;
  };
  LineEditor.prototype.wordLeft = function () { var p = this.pos; while (p > 0 && /\s/.test(this.buf[p - 1])) p--; while (p > 0 && !/[\s\/]/.test(this.buf[p - 1])) p--; return p; };
  LineEditor.prototype.wordRight = function () { var p = this.pos; while (p < this.buf.length && /\s/.test(this.buf[p])) p++; while (p < this.buf.length && !/[\s\/]/.test(this.buf[p])) p++; return p; };
  LineEditor.prototype.accept = function () {
    var line = this.buf;
    this.pos = this.buf.length; this.refresh();
    this.sh.rawOut('\r\n');
    if (line.trim()) {
      if (this.hist[this.hist.length - 1] !== line) this.hist.push(line);
      if (this.hist.length > 500) this.hist.shift();
      this.sh.rawOut('\x1b]6973;' + this.sh.s.nonce + ';E;' + b64(line) + '\x07');
      this.sh.rawOut('\x1b]6973;' + this.sh.s.nonce + ';W;' + (this.typer || 'user') + '\x07');
    } else {
      /* an empty line: the prompt mark ends without a command */
      this.sh.rawOut('\x1b]133;D;pmn=' + this.sh.s.nonce + '\x07');
    }
    return line;
  };
  LineEditor.prototype.feed = function (data, by) {
    if (by && by !== 'terminal') this.typer = this.typer && this.typer !== by ? 'user' : by;
    data = this.pending + data; this.pending = '';
    var i = 0, n = data.length, dirty = false, sh = this.sh;
    while (i < n) {
      var c = data[i], code = data.charCodeAt(i);
      if (code === 0x1b) {
        var rest = data.slice(i);
        if (rest.length === 1) { this.pending = rest; break; }
        var m = /^\x1b\[200~([\s\S]*?)\x1b\[201~/.exec(rest);
        if (m) { this.paste(m[1]); i += m[0].length; dirty = true; continue; }
        if (/^\x1b\[200~/.test(rest)) { this.pending = rest; break; }
        m = /^\x1b(\[[0-9;?<>=]*[ -\/]*[@-~]|O[A-Za-z]|\][^\x07\x1b]*(?:\x07|\x1b\\)|_[^\x1b]*\x1b\\|P[^\x1b]*\x1b\\|[^\[O\]_P])/.exec(rest);
        if (!m) { this.pending = rest; break; }
        i += m[0].length;
        var seq = m[1];
        if (this.search) { this.endSearch(true); }
        switch (seq) {
          case '[D': case 'OD': if (this.pos > 0) this.pos--; break;
          case '[C': case 'OC': if (this.pos < this.buf.length) this.pos++; break;
          case '[A': case 'OA': this.histMove(-1); break;
          case '[B': case 'OB': this.histMove(1); break;
          case '[H': case 'OH': case '[1~': this.pos = 0; break;
          case '[F': case 'OF': case '[4~': this.pos = this.buf.length; break;
          case '[3~': if (this.pos < this.buf.length) this.buf = this.buf.slice(0, this.pos) + this.buf.slice(this.pos + 1); break;
          case '[1;5D': case '[1;3D': case 'b': this.pos = this.wordLeft(); break;
          case '[1;5C': case '[1;3C': case 'f': this.pos = this.wordRight(); break;
          case '\x7f': { var wl = this.wordLeft(); this.yank = this.buf.slice(wl, this.pos); this.buf = this.buf.slice(0, wl) + this.buf.slice(this.pos); this.pos = wl; break; }
          case '\r': this.insert('\n'); break;
          default: break; /* replies and unknown keys are ignored */
        }
        dirty = true; continue;
      }
      i++;
      if (this.search) {
        if (code === 0x12) { this.searchNext(); dirty = true; continue; }
        if (code === 0x7f || code === 8) { this.search.q = this.search.q.slice(0, -1); this.searchUpdate(); dirty = true; continue; }
        if (code === 7 || code === 3) { this.endSearch(false); dirty = true; continue; }
        if (code >= 0x20) { this.search.q += c; this.searchUpdate(); dirty = true; continue; }
        this.endSearch(true);
        if (code === 13) { return this.accept(); }
        dirty = true; continue;
      }
      switch (code) {
        case 13: case 10: return this.accept();
        case 3: /* Ctrl+C at the prompt */
          this.pos = this.buf.length; this.refresh(); sh.rawOut('^C\r\n'); sh.rawOut('\x1b]133;D;pmn=' + sh.s.nonce + '\x07');
          this.buf = ''; this.pos = 0; return '';
        case 4: if (!this.buf.length) { sh.rawOut('\r\n'); sh.done = true; sh.exitCode = 0; return null; }
          if (this.pos < this.buf.length) this.buf = this.buf.slice(0, this.pos) + this.buf.slice(this.pos + 1); break;
        case 1: this.pos = 0; break;
        case 5: this.pos = this.buf.length; break;
        case 2: if (this.pos > 0) this.pos--; break;
        case 6: if (this.pos < this.buf.length) this.pos++; break;
        case 0x7f: case 8:
          if (this.pos > 0) { var cpb = this.buf.codePointAt(this.pos - 2); var step = cpb > 0xffff ? 2 : 1; this.buf = this.buf.slice(0, this.pos - step) + this.buf.slice(this.pos); this.pos -= step; }
          break;
        case 0x15: this.yank = this.buf.slice(0, this.pos); this.buf = this.buf.slice(this.pos); this.pos = 0; break;
        case 0x0b: this.yank = this.buf.slice(this.pos); this.buf = this.buf.slice(0, this.pos); break;
        case 0x17: { var w = this.wordLeft(); this.yank = this.buf.slice(w, this.pos); this.buf = this.buf.slice(0, w) + this.buf.slice(this.pos); this.pos = w; break; }
        case 0x19: this.insert(this.yank); break;
        case 0x10: this.histMove(-1); break;
        case 0x0e: this.histMove(1); break;
        case 0x0c: sh.rawOut('\x1b[H\x1b[2J'); this.redrawPrompt(); break;
        case 0x12: this.startSearch(); break;
        case 9: this.complete(); break;
        default:
          if (code >= 0x20) {
            var j = i; while (j < n && data.charCodeAt(j) >= 0x20 && data.charCodeAt(j) !== 0x7f) j++;
            this.insert(data.slice(i - 1, j)); i = j;
          }
      }
      dirty = true;
    }
    if (dirty) this.refresh();
    return undefined;
  };
  LineEditor.prototype.paste = function (text) {
    /* a bracketed paste is inserted as typed text, never executed; newlines become spaces joined by ; */
    var t = text.replace(/\r\n?/g, '\n');
    var lines = t.split('\n').filter(function (l) { return l.length; });
    this.insert(lines.join('; '));
  };
  LineEditor.prototype.redrawPrompt = function () {
    var sh = this.sh;
    sh.rawOut(sh.promptText());
    this.startX = this.term.buf.cursor.x; this.startOff = this.startX; this.curRow = 0;
  };
  LineEditor.prototype.histMove = function (d) {
    if (this.hi === this.hist.length) this.saved = this.buf;
    var ni = T.util.clamp(this.hi + d, 0, this.hist.length);
    if (ni === this.hi) return;
    this.hi = ni;
    this.buf = ni === this.hist.length ? this.saved : this.hist[ni];
    this.pos = this.buf.length;
  };
  LineEditor.prototype.startSearch = function () { this.search = { q: '', match: '', idx: this.hist.length, fail: false }; this.searchUpdate(); };
  LineEditor.prototype.searchUpdate = function () {
    var s = this.search, q = s.q;
    for (var i = Math.min(s.idx, this.hist.length) - 1; i >= 0; i--) { if (!q || this.hist[i].indexOf(q) >= 0) { s.match = this.hist[i]; s.at = i; s.fail = false; return; } }
    s.fail = !!q;
  };
  LineEditor.prototype.searchNext = function () { var s = this.search; if (s.at !== undefined) { s.idx = s.at; this.searchUpdate(); } };
  LineEditor.prototype.endSearch = function (keep) {
    var s = this.search; this.search = null;
    /* clear the search line under the input */
    var out = '\x1b[' + this.curRow + 'A\r' + (this.startX ? '\x1b[' + this.startX + 'C' : '') + '\x1b[J';
    this.sh.rawOut(out); this.curRow = 0;
    if (keep && s.match) { this.buf = s.match; this.pos = this.buf.length; }
  };
  LineEditor.prototype.complete = function () {
    var sh = this.sh, before = this.buf.slice(0, this.pos), m = /(\S*)$/.exec(before), word = m[1];
    var first = !/\S\s/.test(before.trim() ? before.replace(/\S*$/, 'x') : '') && before.trim().indexOf(' ') < 0;
    var cands = [];
    if (first) {
      var names = T.BUILTINS.concat(Object.keys(T.Programs || {})).concat(Object.keys(sh.aliases));
      cands = names.filter(function (x) { return x.indexOf(word) === 0; }).sort().filter(function (x, i, a) { return a.indexOf(x) === i; });
    } else if (sh.vfs) {
      var slash = word.lastIndexOf('/'), dirPart = slash >= 0 ? word.slice(0, slash + 1) : '', base = slash >= 0 ? word.slice(slash + 1) : word;
      var dir = sh.vfs.resolve(sh.cwd, dirPart || '.');
      var list = []; try { list = sh.vfs.list(dir) || []; } catch (e) { list = []; }
      cands = list.filter(function (e) { var nm = typeof e === 'string' ? e : e.name; return nm.indexOf(base) === 0 && (base[0] === '.' || nm[0] !== '.'); })
        .map(function (e) { var nm = typeof e === 'string' ? e : e.name; var st = sh.vfs.stat(dir + '/' + nm); return dirPart + nm + (st && st.type === 'dir' ? '/' : ''); });
      /* program-specific subcommands */
      var cmd = before.trim().split(/\s+/)[0], prog = T.Programs && T.Programs[cmd];
      if (prog && prog.complete) { try { cands = cands.concat((prog.complete(before.trim().split(/\s+/).slice(1)) || []).filter(function (x) { return x.indexOf(word) === 0; })); } catch (e) {} }
    }
    if (!cands.length) { sh.rawOut('\x07'); return; }
    var common = cands.reduce(function (a, b) { var k = 0; while (k < a.length && a[k] === b[k]) k++; return a.slice(0, k); });
    if (cands.length === 1) { this.insert(cands[0].slice(word.length) + (/\/$/.test(cands[0]) ? '' : ' ')); return; }
    if (common.length > word.length) { this.insert(common.slice(word.length)); return; }
    /* list candidates under the line, then redraw the prompt and input */
    var end = this.posOf(this.buf.length);
    var out = (end.row - this.curRow > 0 ? '\x1b[' + (end.row - this.curRow) + 'B' : '') + '\r\n';
    var w = Math.max.apply(null, cands.map(function (x) { return strWidth(x); })) + 2, per = Math.max(1, Math.floor(this.cols() / w));
    cands.slice(0, 60).forEach(function (cnd, k) { out += cnd + ' '.repeat(w - strWidth(cnd)); if ((k + 1) % per === 0) out += '\r\n'; });
    if (cands.length % per) out += '\r\n';
    sh.rawOut(out);
    this.redrawPrompt();
  };
})();
