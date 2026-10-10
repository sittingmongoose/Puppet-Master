/* Registration of the Terminal tab kind (CONTRACT.md section 3) and the public window.PMT API.
   One session per tab (D11). The session is minted in idFor, so an agent's open (by: 'agent:<name>') creates a
   terminal the agent owns; a human's open creates one the human owns (D18). Sessions are not persisted: after a
   reload a restored tab says its session ended and offers a new one, never a fake live PTY (F3-226, F3-228). */
(function () {
  var records = new Map();   /* session id -> { session, view, spec } */
  var ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4l4 4-4 4M8 12h5"/></svg>';

  function profiles() {
    return [
      { id: 'zsh', label: 'zsh', detail: 'Default shell', icon: 'terminal' },
      { id: 'bash', label: 'bash', detail: 'GNU bash 5.2', icon: 'terminal' },
      { id: 'pwsh', label: 'pwsh', detail: 'PowerShell 7.5', icon: 'terminal' },
      { id: 'ssh-devbox', label: 'ssh devbox', detail: 'jared@devbox', icon: 'terminal' }
    ];
  }

  function createSession(spec) {
    var s = new T.Session({ profile: spec.profile || 'zsh', cwd: spec.cwd || null, by: spec.by || 'user',
      cols: 100, rows: 30 });
    records.set(s.id, { session: s, view: null, spec: spec });
    return s;
  }

  function mountView(host, api, rec, state) {
    var view = new T.View(host, api, rec.session, state);
    if (T.Find) T.Find.attach(view);
    rec.view = view;
    view.on('restart', function () { restart(rec, host, api, state); });
    if (rec.session.state === 'starting') rec.session.start();
    if (rec.spec && rec.spec.invocation && rec.spec.invocation.command) {
      /* the chat's "Rerun in Terminal": type the exact command, the human still presses nothing else */
      setTimeout(function () { rec.session.shell && rec.session.shell.typeCommand(rec.spec.invocation.command, rec.spec.by || 'user'); }, 60);
    }
    return view;
  }
  function restart(rec, host, api, state) {
    var old = rec.session, view = rec.view;
    var cwd = old.shell ? old.shell.cwd : old.cwd;
    view.dispose(); old.dispose();
    var s = new T.Session({ profile: old.profile.id, cwd: cwd, by: 'user', cols: old.term.cols, rows: old.term.rows });
    records.delete(old.id);
    rec.session = s; records.set(s.id, rec);
    rec.alias = rec.alias || old.id;
    mountView(host, api, rec, state);
    rec.view.onShow(); rec.view.focus();
  }

  function register(PH) {
    PH.registerKind('terminal', {
      label: 'Terminal',
      group: 'Terminals',
      icon: ICON,
      prefixes: ['terminal:'],
      min: { w: 320, h: 120 },
      dedicated: true,
      idFor: function (spec) {
        if (spec.session && (records.has(spec.session) || [].concat(Array.from(records.values())).some(function (r) { return r.alias === spec.session; }))) return 'terminal:' + spec.session;
        var s = createSession(spec);
        spec.session = s.id;
        return 'terminal:' + s.id;
      },
      plus: {
        order: 10,
        shortcut: 'Ctrl+Shift+`',
        sub: function () { return profiles(); },
        spec: function (subId) { return { kind: 'terminal', profile: subId || null }; }
      },
      mount: function (host, state, api) {
        state = state || {};
        var rec = records.get(state.session);
        if (!rec) {
          for (var r of records.values()) if (r.alias === state.session) rec = r;
        }
        var restoredDead = false;
        if (!rec) {
          /* a restored tab: the page reloaded, so its PTY is gone. Say so; never fake continuity. */
          var s = new T.Session({ profile: state.profile || 'zsh', cwd: state.cwd || null, by: 'user' });
          rec = { session: s, view: null, spec: state, alias: state.session };
          records.set(s.id, rec);
          restoredDead = true;
        }
        var view = mountView(host, api, rec, state);
        if (restoredDead) {
          view.notice({ id: 'restored', tone: 'info', focus: false, text: 'This terminal was restored. Its earlier session ended when the page reloaded; this is a new session.', actions: [{ label: 'OK' }] });
        }
        return {
          unmount: function () { rec.view.dispose(); rec.session.dispose(); records.delete(rec.session.id); },
          serialize: function () { var sh = rec.session.shell; return { session: rec.alias || rec.session.id, profile: rec.session.profile.id, cwd: sh ? sh.cwd : rec.session.cwd, appearance: rec.view.tabAppearance || {} }; },
          onResize: function () { rec.view.onResize(); },
          onShow: function () { rec.view.onShow(); },
          onHide: function () { rec.view.onHide(); },
          onFocus: function () { rec.view.setDimmed(false); },
          onBlur: function () { rec.view.setDimmed(true); },
          onLook: function () { rec.view.onLook(); },
          wantsKey: function (e) { return rec.view.wantsKey(e); },
          focus: function () { rec.view.focus(); },
          canClose: function () {
            var running = rec.session.state === 'running' ? rec.session.foreground() : null;
            if (!running) return true;
            return new Promise(function (resolve) {
              rec.view.notice({ id: 'close', tone: 'warn', text: 'Close this terminal? ' + running + ' is still running and will be stopped.',
                actions: [{ label: 'Close terminal', primary: true, run: function () { resolve(true); } }, { label: 'Keep it open', run: function () { resolve(false); rec.view.focus(); } }] });
            });
          }
        };
      }
    });
  }

  var PMT = {
    version: T.VERSION,
    profiles: profiles,
    open: function (spec) { spec = Object.assign({ kind: 'terminal' }, spec || {}); return window.PM_HOME ? window.PM_HOME.open(spec) : null; },
    card: function (spec) { return T.CommandCard ? T.CommandCard.create(spec) : null; },
    sessions: function () {
      return Array.from(records.values()).map(function (r) {
        var s = r.session;
        return { id: r.alias || s.id, profile: s.profile.id, cwd: s.shell ? s.shell.cwd : s.cwd, owner: s.owner, lease: s.lease,
          state: s.state, foreground: s.foreground() };
      });
    },
    session: function (id) { var r = records.get(id); if (!r) for (var x of records.values()) if (x.alias === id) r = x; return r ? r.session : null; },
    view: function (id) { var r = records.get(id); if (!r) for (var x of records.values()) if (x.alias === id) r = x; return r ? r.view : null; },
    keys: function () { return T.keys.list(); },
    agent: T.Agent ? T.Agent.api : null,
    _T: T
  };
  window.PMT = PMT;

  var PH = typeof PM_HOME !== 'undefined' && PM_HOME ? PM_HOME : window.PM_HOME;
  if (PH && PH.registerKind) register(PH);
  else console.warn('[pmt] PM_HOME is not available; the Terminal kind is not registered');
})();
