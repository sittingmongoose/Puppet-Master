/* Registration of the Terminal tab kind (CONTRACT.md section 3) and the public window.PMT API.
   One session per tab (D11). The session is minted in idFor, so an agent's open (by: 'agent:<name>') creates a
   terminal the agent owns; a human's open creates one the human owns (D18). Sessions are not persisted, scrollback
   is (38-saved.js): after a reload, or when a closed tab is reopened, the tab shows its saved scrollback above a new
   session and says the earlier session ended, never a fake live PTY (F3-226, F3-228). */
(function () {
  var records = new Map();   /* session id -> { session, view, spec } */
  var ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4l4 4-4 4M8 12h5"/></svg>';

  function profiles() {
    return [
      { id: 'zsh', label: 'zsh', detail: 'Default', icon: 'terminal' },
      { id: 'bash', label: 'bash', detail: 'GNU bash 5.2', icon: 'terminal' },
      { id: 'pwsh', label: 'pwsh', detail: 'PowerShell 7.5', icon: 'terminal' },
      { id: 'ssh-devbox', label: 'ssh devbox', detail: 'jared@devbox', icon: 'terminal' }
    ];
  }

  /* the Home default layout's terminal hints */
  var SCRIPTS = { 'cargo-test': 'cargo test --workspace', 'dev': 'npm run dev', 'build': 'cargo build --workspace' };
  function expandCwd(cwd) {
    if (!cwd) return null;
    var home = (T.Session.machine() && T.Session.machine().home) || '/home/jared';
    return cwd === '~' ? home : cwd.indexOf('~/') === 0 ? home + cwd.slice(1) : cwd;
  }

  function createSession(spec) {
    var s = new T.Session({ profile: spec.profile || 'zsh', cwd: expandCwd(spec.cwd), by: spec.by || 'user',
      cols: 100, rows: 30 });
    records.set(s.id, { session: s, view: null, spec: spec });
    return s;
  }

  function startSession(rec) {
    if (rec.session.state === 'starting') rec.session.start();
    var inv = !rec.invoked && rec.spec && rec.spec.invocation;
    if (inv && inv.command) {
      /* the chat's "Rerun in Terminal" (or a layout's first command): the exact command, typed once per tab through the
         session's write rules (D18), so an agent's command never lands in a terminal it may not type in. A restart or
         a restored tab starts a plain shell; it never runs the opening command again */
      rec.invoked = true;
      var s = rec.session, by = rec.spec.by || 'user';
      setTimeout(function () { s.input(inv.command + '\r', by); }, 60);
    }
  }
  function mountView(host, api, rec, state) {
    var view = new T.View(host, api, rec.session, state);
    if (T.Find) T.Find.attach(view);
    rec.view = view;
    view.on('restart', function () { restart(rec, host, api, state); });
    /* a session waiting on its restore is not saved until the restore settles (resume releases the saver) */
    if (T.Saved) { if (rec.saver) rec.saver.dispose(); rec.saver = T.Saved.watch(rec.session, rec.alias || rec.session.id, !!rec.holdStart); }
    if (!rec.holdStart) startSession(rec);
    return view;
  }
  /* the host's Reopen closed tab, as it announces it (activate, reason 'reopen'): tab ids whose next mount is a reopen.
     A mark lasts until that mount (a hidden page may paint it late) or until the tab closes again, never on a clock */
  var reopenedIds = new Set();
  function reopened(id) { return reopenedIds.delete('terminal:' + id); }
  /* a tab without a live session: a reload (its saved state, v) or a reopened closed tab gets its saved scrollback
     back, then a new session. A tab a layout seeds afresh starts clean, even where a closed terminal had its id */
  function resume(rec, state) {
    var view = rec.view, key = rec.alias, done = false;
    var reopen = !!state.reopen || reopened(key), back = state.v === 1 || reopen;
    function say(text) { view.notice({ id: 'restored', tone: 'info', focus: false, text: text, actions: [{ label: 'OK' }] }); }
    function go(wasClosed, o) {
      if (done || rec.gone) return null;
      done = true;
      wasClosed = wasClosed || reopen;
      var r = null;
      if (o && o !== 'timeout') { try { r = T.Saved.restore(rec.session, o); } catch (e) { console.warn('[pmt] saved scrollback not restored', e); } }
      rec.holdStart = false;
      /* a restored or reopened tab shows its scrollback above a new session; it never runs its opening command again */
      if (back) rec.invoked = true;
      startSession(rec);
      view.marksDirty = true; view.scrollTo(view.bottomAbs()); view.schedule(true);
      var why = wasClosed ? 'when the tab closed' : 'when the page reloaded';
      if (r) say('This terminal was ' + (wasClosed ? 'reopened' : 'restored') + ' with its scrollback' +
        (r.dropped ? ' (' + r.dropped + (r.dropped === 1 ? ' image was' : ' images were') + ' not kept)' : '') + '. Its earlier session ended ' + why + '; this is a new session.');
      else if (o === 'timeout') say('This terminal was ' + (wasClosed ? 'reopened' : 'restored') + ' without its scrollback, which took too long to load. Its earlier session ended ' + why + '; this is a new session.');
      else if (back) say('This terminal was ' + (wasClosed ? 'reopened' : 'restored') + '. Its earlier session ended ' + why + '; this is a new session.');
      return r;
    }
    if (!T.Saved || !key) { go(false, null); if (rec.saver) rec.saver.release(null); return; }
    /* the load budget (5 s) covers the whole read, the closed-list check included; past it the session starts without
       the scrollback and says so. The saver stays held until the read itself settles (load(key, true) has no budget of
       its own), so the new session never writes over the saved copy, or deletes its frames, while it is being read */
    var timer = setTimeout(function () { go(reopen, back ? 'timeout' : null); }, T.Saved.LIMITS.loadMs);
    T.Saved.reopening(key).then(function (wasClosed) {
      /* a fresh tab on a closed terminal's id: that terminal's saved copy goes, it is not this tab's scrollback. A save
         the closed tab still has in flight lands first (forget waits for it), so it never writes over this tab's copy */
      if (!back) return (wasClosed ? T.Saved.forget(key) : T.Saved.settled(key)).then(function () { return [false, null]; });
      return T.Saved.load(key, true).then(function (o) { return [wasClosed, o]; });
    }).catch(function () { return [false, null]; }).then(function (res) {
      clearTimeout(timer);
      var r = go(res[0], res[1]);
      if (rec.saver && !rec.gone) rec.saver.release(r);
    });
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
    /* a terminal mounted for the host's Reopen closed tab is a reopen (its scrollback comes back), never a fresh seed */
    if (PH.on) {
      PH.on('activate', function (e) { if (e && e.reason === 'reopen' && /^terminal:/.test(e.tabId || '')) reopenedIds.add(e.tabId); });
      PH.on('close', function (e) { if (e && e.tabId) reopenedIds.delete(e.tabId); });
    }
    PH.registerKind('terminal', {
      label: 'Terminal',
      group: 'Terminals',
      icon: ICON,
      prefixes: ['terminal:'],
      min: { w: 320, h: 120 },
      dedicated: true,
      eager: true,   /* a background terminal runs from the start: its label, exit code and agent mark stay true */
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
          /* No live session for this id. A tab this terminal saved (state.v) is a restore after a reload, and a tab
             the host reopens (Reopen closed tab) is a reopen: the PTY is gone, so the saved scrollback comes back above
             a new session and the tab says so, never faking continuity, and its first command does not run again
             (resume). A tab seeded by a layout (the Home default's terminal:t1 and t2) simply starts its session; its
             `script` hint names what to run first. */
          var s = new T.Session({ profile: state.profile || 'zsh', cwd: expandCwd(state.cwd), by: 'user' });
          rec = { session: s, view: null, spec: state, alias: state.session };
          if (state.script && SCRIPTS[state.script]) rec.spec = Object.assign({}, state, { invocation: { command: SCRIPTS[state.script] } });
          records.set(s.id, rec);
          restoredDead = true;
          rec.holdStart = true;
        }
        mountView(host, api, rec, state);
        if (restoredDead) resume(rec, state);
        return {
          unmount: function () {
            rec.gone = true;
            /* the last output is written before the session goes, so a reopened tab shows it */
            if (rec.saver) { rec.saver.flush(); rec.saver = null; }
            /* a close the user confirmed keeps the saved scrollback for a reopen; other unmounts leave it as it is */
            if (T.Saved && rec.closingAt && Date.now() - rec.closingAt < 5000) T.Saved.markClosed(rec.alias || rec.session.id);
            rec.view.dispose(); rec.session.dispose(); records.delete(rec.session.id);
          },
          serialize: function () {
            var sh = rec.session.shell, ap = rec.view.tabAppearance || {};
            /* a custom image held as a data URL (written before images were kept by reference) would push the state
               over the host's 16 KB cap, and then nothing of it saves: it is left out, the rest stays */
            if (typeof ap.bgImageData === 'string' && ap.bgImageData.indexOf('data:') === 0) { ap = Object.assign({}, ap); delete ap.bgImageData; }
            return { v: 1, session: rec.alias || rec.session.id, profile: rec.session.profile.id, cwd: sh ? sh.cwd : rec.session.cwd, appearance: ap };
          },
          /* while a divider drag is still moving the body (final === false) the reflow and PTY resize wait,
             at most every 120 ms; the final call lays out at once */
          onResize: function (sz) {
            var v = rec.view;
            if (sz && sz.final === false) { if (!v._resizeTimer) v._resizeTimer = setTimeout(function () { v._resizeTimer = 0; v.onResize(); }, 120); return; }
            if (v._resizeTimer) { clearTimeout(v._resizeTimer); v._resizeTimer = 0; }
            v.onResize();
          },
          onShow: function () { rec.view.onShow(); },
          onHide: function () { rec.view.onHide(); },
          onFocus: function () { rec.view.setDimmed(false); },
          onBlur: function () { rec.view.setDimmed(true); },
          onLook: function () { rec.view.onLook(); },
          wantsKey: function (e) { return rec.view.wantsKey(e); },
          focus: function () { rec.view.focus(); },
          canClose: function () {
            var running = rec.session.state === 'running' ? rec.session.foreground() : null;
            if (!running) { rec.closingAt = Date.now(); return true; }
            return new Promise(function (resolve) {
              rec.view.notice({ id: 'close', tone: 'warn', focus: true, text: 'Close this terminal? ' + running + ' is still running and will be stopped.',
                actions: [{ label: 'Close terminal', primary: true, run: function () { rec.closingAt = Date.now(); resolve(true); } }, { label: 'Keep it open', run: function () { resolve(false); rec.view.focus(); } }] });
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
    /* a card spec for a command that ran in a terminal: Open in Terminal reveals that exact session and command */
    cardSpec: function (sessionId, cmd) {
      var r = records.get(sessionId); if (!r) for (var x of records.values()) if (x.alias === sessionId) r = x;
      if (!r || !cmd) return null;
      var term = r.session.term, out = term.commandOutput(cmd).split('\n');
      var live = r.session.state === 'running';
      return {
        command: cmd.cmdline, cwd: cmd.cwd || (r.session.shell ? r.session.shell.cwd : ''), by: cmd.by,
        status: cmd.state === 'running' ? 'running' : cmd.exit === 0 ? 'ok' : cmd.exit === 130 ? 'interrupted' : cmd.exit === null ? 'interrupted' : 'failed',
        exitCode: cmd.exit, startedAt: cmd.start, elapsedMs: cmd.end ? cmd.end - cmd.start : 0,
        lines: out, totalLines: out.length,
        onOpen: live ? function () { if (window.PM_HOME) window.PM_HOME.open({ kind: 'terminal', session: r.alias || r.session.id }); if (r.view) r.view.revealCommand(cmd); } : null,
        onRerun: function () {
          if (!window.PM_HOME) return;
          /* the terminal may have closed (or come back as a reopened tab) since the card was made: use the one that holds it now */
          var id = r.alias || r.session.id, now = records.get(id);
          if (!now) for (var y of records.values()) if (y.alias === id) now = y;
          if (now && now.session.state === 'running' && now.session.shell) {
            window.PM_HOME.open({ kind: 'terminal', session: id });
            /* through the write rules: a human's Rerun while an agent drives is a take-over (DL-181) */
            now.session.input(cmd.cmdline + '\r', 'user');
            return;
          }
          /* its session ended or its tab is gone: a new terminal in the command's folder runs it */
          window.PM_HOME.open({ kind: 'terminal', profile: r.session.profile.id, cwd: cmd.cwd || (r.session.shell ? r.session.shell.cwd : r.session.cwd),
            invocation: { command: cmd.cmdline } });
        },
        onViewOutput: live ? null : function () { if (window.PM_HOME) window.PM_HOME.open({ kind: 'editor', title: cmd.cmdline + ' output', text: out.join('\n'), language: 'text' }); }
      };
    },
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
    /* saved scrollback: save now (resolves true when written) and what the last save kept */
    saved: {
      save: function (id) { var r = records.get(id); if (!r) for (var x of records.values()) if (x.alias === id) r = x; return r && r.saver ? r.saver.now(true) : Promise.resolve(false); },
      last: function (id) { var r = records.get(id); if (!r) for (var x of records.values()) if (x.alias === id) r = x; return r && r.saver ? r.saver.last || null : null; },
      limits: T.Saved ? T.Saved.LIMITS : null
    },
    _T: T
  };
  window.PMT = PMT;

  var PH = typeof PM_HOME !== 'undefined' && PM_HOME ? PM_HOME : window.PM_HOME;
  if (PH && PH.registerKind) register(PH);
  else console.warn('[pmt] PM_HOME is not available; the Terminal kind is not registered');
})();
