/* Projects concepts (Opus 5.5), Split v2: the New Project engine, window.PJX.np. No DOM.

   One draft per New Project, keyed by session, never by a project_id that does not exist yet (spec 7). Sections are a
   pure function of the current answers (spec 2.5, 8): which sections show depends on the way alone; what each asks
   depends only on the answers now. Changing an answer clears the answers that depend on it (set(), one function, in
   dependency order), so an abandoned answer never comes back (FO-22). There is no Back history.

   Every simulated service result (the look inside, a sign-in, a check, a name, a preview) is cached under its exact
   inputs (rule 5), so an old result can never apply to a new input. Facts about the person's world (a trusted device, a
   sign-in made, a fork made) live in PJX.S.world.facts, so Reset demo puts them back and Start over never does.

   Secrets (a password, a token, a recovery phrase, an access key) never enter the draft: the draft records only that one
   was typed; the input element itself is kept in s.secrets (np-ui) and read once when used, then cleared (FO-6).

     PJX.np.start(opts) -> s       opts: way, text (a pasted link), like, device, from (restore from a Project), chat,
                                    purpose ('new' or 'page': a form on the Project page), project
     sections(s), problem(s, id), summary(s, id), state(s, id), open(s, id), cont(s, id)
     set(s, path, value), chooseWay(s, way), wayLoss(s), startOver(s)
     look(s), signedIn(key, computer), signIn(s, key, method), ...   simulated owner results, cached
     review(s), phases(s), commit(s, { onPhase, demo }), toPlan(s), detect(text) */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.np) return;
  const ENV = PJX.ENV, w = PJX.w, R = () => PJX.rules;
  const F = () => PJX.S.world.facts;

  /* the settings-model adapter (spec 16.4), with SETTINGS-PROPOSAL.md section 11's values */
  const SETTINGS = {
    usualWord: 'Your usual settings', usualSub: 'The settings every Project shares.',
    ownWord: 'of its own', copyWrites: 'project', computerLevelTravels: false,
    variesMark: 'origin-word', computerWord: 'computer', readyNeedsCheck: true, copiesThings: true,
    sendKeys: false   // S11 A "Not for now": the switch is not drawn
  };
  const WAYS = [
    { id: 'new', glyph: 'seed', tag: true }, { id: 'folder', glyph: 'folder' }, { id: 'online', glyph: 'cloud' },
    { id: 'device', glyph: 'server' }, { id: 'restore', glyph: 'history' }, { id: 'chat', glyph: 'chat' }
  ].map((x) => Object.assign(x, { title: w('np.way.' + x.id), sub: w('np.way.' + x.id + 'Sub'), tag: x.tag ? w('np.way.newTag') : null }));
  const VERB = { new: ['Create', 'Creating'], folder: ['Add', 'Adding'], device: ['Add', 'Adding'], online: ['Copy', 'Copying'], restore: ['Restore', 'Restoring'], chat: ['Create', 'Creating'] };
  const SECTIONS = {
    new: ['start', 'where', 'like', 'versions', 'online', 'backup'], folder: ['folder', 'where', 'like', 'versions', 'online', 'backup'],
    online: ['source', 'find', 'where', 'like', 'versions', 'online', 'backup'], device: ['device', 'where', 'like', 'versions', 'online', 'backup'],
    restore: ['restore', 'where', 'versions', 'online', 'backup'], chat: ['chat', 'where', 'like', 'versions', 'online', 'backup']
  };
  const SVC_OF = { GitHub: ['github', 'com'], GitLab: ['gitlab', 'com'], 'Azure DevOps': ['azure', 'services'], Bitbucket: ['bitbucket', 'cloud'] };
  const HOME = '/Users/jared';
  /* ~ means the home of the Computer the path is on, never the viewing Client's (GUIDED-FLOWS 2.39) */
  const full = (p, c) => String(p || '').replace(/^~(?=\/|$)/, ((ENV.computers.find((x) => x.id === (c || 'here')) || {}).home) || HOME);
  const comp = (id) => ENV.computers.find((c) => c.id === id) || ENV.computers[0];
  const dev = (id) => ENV.devices.concat(ENV.found).find((x) => x.id === id) || null;
  const share = (id) => ENV.shares.find((x) => x.id === id) || null;
  const vol = (id) => ENV.volumes.find((x) => x.id === id) || null;
  const chatOf = (id) => (ENV.chats || []).concat((PJX.S.world && PJX.S.world.facts.chats) || []).find((c) => c.id === id) || null;
  const serverOn = () => { const n = ENV.devices.find((x) => x.server === 'homenas'); return !!(n && n.online); };
  const lc = (s) => String(s || '').toLowerCase();
  const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  const andList = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

  /* ------------------------------------------------------------------ the draft */
  const blankDevice = () => ({ method: 'ssh', id: null, typing: false, address: '', port: '22', asked: '', user: '', path: null, share: null, typedShare: '', shareTyping: false, volume: null, smbUser: '', smbDomain: '', idOk: false, key: null, keyDone: false, signin: 'pw', browse: null });
  const blankOnline = (mode) => ({ mode: mode || null, service: 'github', kind: null, address: '', acct: null, owner: null, project: null, visibility: null, name: '', nameTouched: false, description: '', branch: '', branchTouched: false, remoteName: '', linkProject: null, step: null });
  const blankFiles = () => ({ mode: null, parent: '~/Documents', network: null, netUser: '', browse: false, touched: false });
  const blankLike = (source) => ({ source: source || 'usual', ids: null, sameIds: null, kinds: null, things: null, accounts: true, per: {}, onlyDiff: true, fixed: false, fromComputer: false, ownFiles: {}, q: '', showAll: false });
  function blank() {
    return {
      way: null, runsOn: 'here', name: '', nameTouched: false,
      start: 'basics', basics: { readme: true, ignore: 'automatic', license: 'none' },
      folder: { path: null, browse: false },
      device: blankDevice(),
      src: { service: 'github', kind: null, address: '', gitAddress: '' },
      find: { tab: null, q: '', anyQ: '', anyAsked: '', project: null, intent: null, forkOwner: null, branch: 'my-change', branchTouched: false, another: false },
      fork: { name: '', nameTouched: false, upstreamName: 'upstream' },
      restore: { kit: null, from: null, cloud: 'gdrive', unlocked: false, pick: null, point: null },
      chat: { id: null, files: null, pick: null },
      work: { mode: 'auto', allowed: {} },
      files: blankFiles(), folderName: '', folderNameTouched: false,
      like: blankLike(),
      history: 'git', historyTouched: false, filesafe: true,
      online: blankOnline(),
      backup: { dest: 'none', sub: null, acc: {}, include: 'all', leaveOut: {}, mode: 'daily', time: '2:00 AM', keep: 'standard', keepCustom: { d: 7, w: 4, m: 6 } }
    };
  }
  function start(opts) {
    opts = opts || {};
    const s = { id: PJX.uid('np'), rev: 0, d: blank(), ui: { open: undefined, err: {}, disc: {}, mini: {}, entered: false, nasDropped: false, refused: {} }, ops: {}, secrets: new Map(), L: [], purpose: opts.purpose || 'new', project: opts.project || null, attempt: 0 };
    s.on = (fn) => { s.L.push(fn); return s; };
    s.changed = () => { s.rev++; s.L.slice().forEach((fn) => { try { fn(s); } catch (e) { console.error('[pjx np]', e); } }); };
    const d = s.d;
    if (opts.like && PJX.get(opts.like)) d.like.source = opts.like;
    if (opts.text) { const t = detect(opts.text); if (t) applyDetected(s, t); }
    else if (opts.way) chooseWay(s, opts.way, true);
    if (opts.device && d.way === 'device' && dev(opts.device)) d.device.id = opts.device;
    if (opts.chat && d.way === 'chat') d.chat.id = opts.chat;
    if (opts.from && d.way === 'restore') {
      const p = PJX.get(opts.from), src = p && ENV.backups.find((b) => b.where === p.backup.dest);
      // Restore as new from a Project's own backup: its place is known, so the no-Kit route starts there; it is still reached,
      // signed in and unlocked before anything is listed
      if (src) { d.restore.kit = 'none'; d.restore.from = src.id === 'gdrive' ? 'cloud' : src.id; d.restore.cloud = 'gdrive'; if (src.projects.indexOf(p.id) >= 0) s.ui.restoreWant = p.id; }
    }
    if (opts.folder && d.way === 'folder') d.folder.path = opts.folder;
    return s;
  }

  /* path helpers for set() */
  const getp = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const putp = (o, p, v) => { const ks = p.split('.'), last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
  const dropSecret = (s, prefix) => { Array.from(s.secrets.keys()).forEach((k) => { if (k.indexOf(prefix) === 0) { const el = s.secrets.get(k); if (el) el.value = ''; s.secrets.delete(k); } }); };
  const dropOps = (s, prefix) => { Object.keys(s.ops).forEach((k) => { if (k.indexOf(prefix) === 0) delete s.ops[k]; }); };
  /* the sign-in method picked and "use another account" belong to one service on one computer: a change drops them (FF-11) */
  const dropUi = (s, re) => { Object.keys(s.ui).forEach((k) => { if (re.test(k)) delete s.ui[k]; }); };

  /* set one answer and clear what depends on it (spec 8 rule 3 and its table) */
  function set(s, path, v, quiet) {
    const d = s.d, before = getp(d, path);
    if (before === v && (v === null || typeof v !== 'object')) return;
    putp(d, path, v);
    const resetOnline = () => { d.online = blankOnline(); };
    const resetHistory = () => { d.history = 'git'; d.historyTouched = false; };
    switch (path) {
      case 'runsOn':
        d.folder.path = null; d.device = blankDevice(); dropSecret(s, 'dev'); d.files = blankFiles(); dropSecret(s, 'net');
        // an unfinished key or sign-in attempt belongs to the computer that started it: its late result is dropped
        s.ui.keyOp = null; dropOps(s, 'keyadd:'); dropUi(s, /^(method|another):/);
        // sign-ins and account choices belong to a computer (rule 10): the finds and links made on the old one go
        Object.assign(d.find, { project: null, intent: null, forkOwner: null, anyAsked: '', another: false });
        Object.assign(d.online, { acct: null, owner: null, project: null, visibility: null, linkProject: null, step: null });
        if (d.way === 'folder' || d.way === 'device') { resetOnline(); resetHistory(); }
        dropSecret(s, 'tok'); dropSecret(s, 'bk');
        break;
      case 'folder.path': resetOnline(); resetHistory(); s.ui.err.folder = null; break;
      case 'device.method': Object.assign(d.device, blankDevice(), { method: v }); dropSecret(s, 'dev'); resetOnline(); resetHistory(); break;
      case 'device.id': Object.assign(d.device, { path: null, idOk: false, key: null, keyDone: false, user: '', signin: 'pw', browse: null }); dropSecret(s, 'dev'); s.ui.keyOp = null; dropOps(s, 'keyadd:'); s.ui.newFolders = null; resetOnline(); resetHistory(); break;
      case 'device.share': case 'device.volume': d.device.path = null; d.device.browse = null; d.device.smbUser = ''; dropSecret(s, 'dev'); resetOnline(); resetHistory(); break;
      case 'device.path': resetOnline(); resetHistory(); break;
      case 'device.key': d.device.keyDone = false; dropSecret(s, 'devpw'); dropOps(s, 'keyadd:'); s.ui.keyOp = null; break;
      case 'src.service': case 'src.kind': case 'src.address':
        if (path === 'src.service') { d.src.kind = null; d.src.address = ''; }
        if (path === 'src.kind') d.src.address = '';
        Object.assign(d.find, { tab: null, q: '', anyQ: '', anyAsked: '', project: null, intent: null, forkOwner: null, another: false });
        if (!d.find.branchTouched) d.find.branch = 'my-change';
        d.fork = { name: '', nameTouched: false, upstreamName: 'upstream' };
        dropSecret(s, 'tok'); dropUi(s, /^(method|another):(find|fork)$/);
        break;
      case 'find.tab': d.find.project = null; d.find.intent = null; d.find.forkOwner = null; break;
      case 'find.project': Object.assign(d.find, { intent: null, forkOwner: null, another: false }); d.fork.name = ''; d.fork.nameTouched = false; resetHistory(); break;
      case 'find.intent': if (v === 'copy' || v === 'direct') { d.fork = { name: '', nameTouched: false, upstreamName: 'upstream' }; d.find.branch = 'my-change'; d.find.branchTouched = false; d.find.forkOwner = null; } break;
      case 'online.mode': d.online = blankOnline(v); dropSecret(s, 'tok'); dropUi(s, /^(method|another):(osign|olsign|link)$/); s.ui.mini.online = null; break;
      case 'online.service': case 'online.kind': case 'online.address':
        if (path === 'online.service') { d.online.kind = null; d.online.address = ''; }
        if (path === 'online.kind') d.online.address = '';
        Object.assign(d.online, { acct: null, owner: null, project: null, visibility: null, linkProject: null });
        dropSecret(s, 'tok'); dropUi(s, /^(method|another):(osign|olsign|link)$/);
        break;
      case 'online.owner': d.online.project = null; d.online.visibility = null; break;
      case 'online.project': d.online.visibility = null; break;
      case 'like.source': { const acc = d.like.accounts; d.like = blankLike(v); d.like.accounts = acc; break; }
      case 'backup.dest': d.backup.sub = null; d.backup.acc = {}; d.backup.leaveOut = {}; dropSecret(s, 'bk'); s.ui.nasDropped = false; break;
      case 'backup.sub': d.backup.acc = {}; dropSecret(s, 'bk'); break;
      case 'chat.id': case 'chat.files': d.chat.pick = null; d.files = blankFiles(); resetOnline(); resetHistory(); break;
      case 'restore.kit': { const k = (ENV.kits || []).find((x) => x.id === v); d.restore.from = k ? k.from : null; d.restore.unlocked = false; d.restore.pick = null; d.restore.point = null; dropSecret(s, 'phrase'); dropOps(s, 'reach:'); dropOps(s, 'kitopen:'); resetOnline(); break; }
      case 'restore.from': case 'restore.cloud': d.restore.unlocked = false; d.restore.pick = null; d.restore.point = null; dropSecret(s, 'phrase'); dropOps(s, 'reach:'); resetOnline(); break;
      case 'restore.pick': d.restore.point = null; resetOnline(); break;
      case 'files.mode': d.files.parent = '~/Documents'; d.files.network = null; d.files.netUser = ''; dropSecret(s, 'net'); d.files.browse = false; d.files.touched = true; break;
      case 'files.network': d.files.netUser = ''; dropSecret(s, 'net'); d.files.touched = true; break;
      case 'history': d.historyTouched = true; break;
      default: break;
    }
    enforce(s);
    if (!quiet) s.changed();
  }
  /* rules that hold whatever was changed: a NAS that holds the files can't hold their backup (6.10.6) */
  function enforce(s) {
    const d = s.d;
    if (d.backup.dest === 'nas' && filesOnNas(s)) { d.backup.dest = 'none'; d.backup.acc = {}; s.ui.nasDropped = true; }
    // a service or kind this flow doesn't offer (an older saved draft) clears the online answers (R5, R6). "Any Git
    // address" is a real choice where it is offered (Link one you already have), never a retired service
    const svcOk = d.online.service === 'git' ? d.online.mode === 'link' : !d.online.service || !!R().service(d.online.service);
    if (!svcOk) { d.online = blankOnline(d.online.mode); s.ui.retired = true; }
    else if (s.ui.retired) s.ui.retired = false;
  }

  /* how the Project begins; answers that belong to the old beginning go (6.0, 8 rule 6 and 11) */
  function chooseWay(s, way, quiet) {
    const d = s.d;
    if (d.way !== way) {
      d.folder = { path: null, browse: false }; d.device = blankDevice(); dropSecret(s, 'dev');
      d.src = { service: 'github', kind: null, address: '', gitAddress: '' };
      d.find = { tab: null, q: '', anyQ: '', anyAsked: '', project: null, intent: null, forkOwner: null, branch: 'my-change', branchTouched: false, another: false };
      d.fork = { name: '', nameTouched: false, upstreamName: 'upstream' };
      d.restore = { kit: null, from: null, cloud: 'gdrive', unlocked: false, pick: null, point: null }; dropSecret(s, 'phrase');
      d.chat = { id: way === 'chat' ? ((ENV.chats || [])[0] || {}).id || null : null, files: null, pick: null };
      d.online = blankOnline(); dropSecret(s, 'tok');
      d.history = 'git'; d.historyTouched = false;
      // what it starts with belongs to "Start a new Project": another way leaves it behind (spec 8 rule 11)
      d.start = 'basics'; d.basics = { readme: true, ignore: 'automatic', license: 'none' };
      if (!d.files.touched) d.files = blankFiles();
      s.settled = [];
      if (way === 'restore') d.like = blankLike();
      s.ui.open = undefined; s.ui.err = {}; s.ui.mini = {}; s.ui.entered = false;
    }
    d.way = way;
    enforce(s);
    if (!quiet) s.changed();
  }
  /* what Choose another way would clear, in words; empty when nothing would go */
  function wayLoss(s) {
    const d = s.d, out = [];
    if (d.folder.path) out.push('the folder ' + d.folder.path);
    if (d.device.id || d.device.share || d.device.volume) out.push('the device and its folder');
    if (d.find.project) out.push(d.find.project);
    if (d.src.gitAddress) out.push('the Git address');
    if (d.restore.pick) out.push('the backup of ' + d.restore.pick);
    if (d.online.mode && d.online.mode !== onlineDefault(s)) out.push('your online copy choices');
    if (d.historyTouched) out.push('the saved-versions choice');
    if (d.way !== 'restore' && d.like.source !== 'usual' && false) out.push('settings');
    return out;
  }
  function startOver(s) { const purpose = s.purpose; Object.assign(s, { d: blank() }); s.ui = { open: undefined, err: {}, disc: {}, mini: {}, entered: false, nasDropped: false, refused: {} }; s.ops = {}; s.settled = []; Array.from(s.secrets.values()).forEach((el) => { el.value = ''; }); s.secrets.clear(); s.purpose = purpose; s.changed(); }

  /* ------------------------------------------------------------------ simulated owner results, cached per input */
  function op(s, key, ms, fn) {
    if (s.ops[key]) return s.ops[key];
    const o = s.ops[key] = { state: 'working', result: null };
    setTimeout(() => {
      if (s.ops[key] !== o) return;
      let r; try { r = fn(); } catch (e) { console.error('[pjx np op]', key, e); r = { fail: 'error' }; }
      o.result = r || {}; o.state = r && r.fail ? 'failed' : 'done';
      if (!(r && r.stale) && PJX.np.onSettled) { try { PJX.np.onSettled(s, key, o); } catch (e) { console.error('[pjx np say]', e); } }
      s.changed();
    }, PJX.reduced() ? Math.min(ms, 220) : ms);
    return o;
  }
  const peek = (s, key) => s.ops[key] || null;
  const retry = (s, key) => { delete s.ops[key]; s.changed(); };

  /* a path on this computer that is a connected drive (or a share of Home NAS shown as one) is that drive, whatever route
     reached it: the look inside, the holder and the NAS rule all follow the drive (6.10.6) */
  const volOfPath = (p) => { const f = full(p); return f ? ENV.volumes.find((v) => f === v.path || f.indexOf(v.path + '/') === 0) || null : null; };
  /* the look inside (6.2.1): read-only, on the computer that does the work, through the chosen route */
  function inspectAt(holder, path, attempt) {
    let r = ENV.inspect[holder + ':' + path], seen = 0;
    while (r && r.alias && seen++ < 4) r = ENV.inspect[r.alias];
    // (GUIDED-FLOWS 2.38) no observation is never "clean" or "no history": the first look at an unknown folder is partial,
    // says what it couldn't read, and Look again is what settles it
    if (!r && !attempt) return { partial: true, history: undefined, branch: null, changed: null, stack: [], size: null, sizeGB: 0.001, reason: w('np.look.partialWhy') };
    r = Object.assign({ history: null, branch: 'main', changed: 0, stack: [], size: '1 MB', sizeGB: 0.001 }, r || {});
    if (!r.known) {
      const k = PJX.all().find((p) => (p.where.path === path || full(p.where.path) === full(path)) && (holder === 'here' ? p.where.kind === 'local' : (dev(holder) && p.where.device === dev(holder).name)));
      if (k) r.known = k.id;
    }
    if (r.sameOnline && !PJX.get(r.sameOnline)) r.sameOnline = null;
    return r;
  }
  function lookTarget(s) {
    const d = s.d;
    if (d.way === 'folder' && d.folder.path) {
      const v = d.runsOn === 'here' && s.purpose !== 'page' ? volOfPath(d.folder.path) : null;
      if (v) return { holder: v.id, path: full(d.folder.path), route: 'vol@here', label: d.folder.path };
      return { holder: d.runsOn === 'here' ? 'here' : comp(d.runsOn).device || 'here', path: d.folder.path, route: d.runsOn === 'here' ? 'local' : 'local@' + d.runsOn, label: d.folder.path };
    }
    if (d.way === 'device') {
      const m = d.device.method;
      if (m === 'ssh' && d.device.id && d.device.path && deviceReady(s)) return { holder: d.device.id, path: d.device.path, route: 'ssh@' + d.runsOn, label: d.device.path };
      if (m === 'smb' && d.device.share && d.device.path && smbOk(s)) return { holder: d.device.share, path: d.device.path, route: 'smb@' + d.runsOn, label: d.device.path };
      if (m === 'nfs' && d.device.share && d.device.path && nfsOk(s)) return { holder: d.device.share, path: d.device.path, route: 'nfs@' + d.runsOn, label: d.device.path };
      if (m === 'mounted' && d.device.volume && d.device.path && volOk(s)) return { holder: d.device.volume, path: d.device.path, route: 'vol@' + d.runsOn, label: d.device.path };
    }
    if (d.way === 'chat') {
      const c = chatOf(d.chat.id), f = chatFiles(s);
      if (c && f === 'useFolder') return { holder: 'here', path: c.folder, route: 'local', label: c.folder, chat: true };
      if (c && f === 'worked') return { holder: 'here', path: c.workedIn.path, route: 'local', label: c.workedIn.path };
    }
    return null;
  }
  function look(s) {
    const t = lookTarget(s); if (!t) return null;
    const n = s.ui.lookAgain || 0;
    const o = op(s, 'look:' + s.d.runsOn + ':' + t.route + ':' + t.holder + ':' + t.path + (n ? ':' + n : ''), 950, () => {
      const r = inspectAt(t.holder, t.path, n);
      if (r.fail) return { fail: r.fail, path: t.path };
      return r;
    });
    o.target = t;
    return o;
  }
  const lookDone = (s) => { const o = look(s); return o && o.state === 'done' ? o.result : null; };
  const limits = (info) => (info ? ['submodules', 'lfs', 'hooks'].filter((k) => (k === 'lfs' ? !!info.lfs : info[k] && info[k].length)) : []);

  /* ------------------------------------------------------------------ devices and their routes (6.3) */
  const trusted = (s, id) => !!(F().trusted[s.d.runsOn + ':' + id] || (ENV.reach[s.d.runsOn] || []).indexOf(id) >= 0);
  const deviceReady = (s) => { const x = dev(s.d.device.id); return !!(x && x.online !== false && trusted(s, x.id)); };
  const smbOk = (s) => { const o = peek(s, 'smb:' + s.d.runsOn + ':' + smbShareKey(s) + ':' + s.d.device.smbUser); return !!(o && o.state === 'done'); };
  const nfsOk = (s) => { const o = peek(s, 'nfs:' + s.d.runsOn + ':' + nfsShareKey(s)); return !!(o && o.state === 'done'); };
  const volOk = (s) => { const o = peek(s, 'vol:' + s.d.runsOn + ':' + s.d.device.volume); return !!(o && o.state === 'done'); };
  const smbShareKey = (s) => (s.d.device.share === 'typed' ? 'typed:' + s.d.device.typedShare : s.d.device.share);
  const nfsShareKey = smbShareKey;
  /* a typed share that matches a known one becomes that one */
  function resolveShare(s) {
    const d = s.d.device;
    if (d.share !== 'typed') return share(d.share);
    const t = String(d.typedShare || '').trim().replace(/^smb:/, '').replace(/\/+$/, '');
    return ENV.shares.find((x) => x.address === t || x.address === t.replace(/^\/\/?/, '//')) || null;
  }
  function devicesFor(s) {
    const c = s.d.runsOn, self = comp(c).device;
    const yours = ENV.devices.filter((x) => x.id !== self).map((x) => ({ dev: x, trusted: trusted(s, x.id) }));
    const found = ENV.found.map((x) => ({ dev: x, trusted: trusted(s, x.id), found: true }));
    return { yours: yours.filter((x) => x.trusted || !x.found).concat([]), found };
  }
  function lookFor(s) {
    const a = String(s.d.device.asked || '').trim(), port = Number(s.d.device.port);
    return op(s, 'addr:' + s.d.runsOn + ':' + a + ':' + port, 800, () => {
      const hit = ENV.devices.concat(ENV.found).find((x) => x.ip === a || x.address === a || x.address.split('.')[0] === a);
      return hit ? { id: hit.id } : { fail: 'noAnswer' };
    });
  }
  function addKey(s, how) {
    const pw = s.secrets.get('devpw'), x = dev(s.d.device.id), c = s.d.runsOn, id = x && x.id, k0 = s.d.device.key;
    s.attempt++;
    const key = 'keyadd:' + c + ':' + id + ':' + s.attempt;
    const user = String(s.d.device.user || '').trim(), val = pw ? pw.value : '';
    if (how === 'pw' && (!user || !val)) return { fail: 'needBoth' };
    s.ui.keyOp = key;
    const o = op(s, key, 1200, () => {
      // the result trusts only the connection it checked: this computer, this device, this key, this attempt. A change
      // since (another computer does the work, another device or key, a newer attempt) drops it
      if (s.ui.keyOp !== key || s.d.runsOn !== c || s.d.device.id !== id || s.d.device.key !== k0) return { fail: 'stale', stale: true };
      if (how === 'self' || (user === 'jared' && val === 'correct horse')) { F().trusted[c + ':' + id] = true; return { ok: true }; }
      return { fail: 'wrong' };
    });
    if (pw) pw.value = '';
    return o;
  }

  /* ------------------------------------------------------------------ services and sign-ins (6.4, 6.9) */
  const norm = (a) => String(a || '').trim().toLowerCase().replace(/\/+$/, '');
  const addrOk = (a) => /^https:\/\/[^\s/?#]+\.[^\s/?#]+(\/\S*)?$/i.test(String(a || '').trim()) && !/\.invalid(\/|$)/i.test(String(a || ''));
  function forgeRec(svc, kind, address) {
    const k = R().key(svc, kind), kd = R().kind(svc, kind);
    const rec = ENV.forges[k] || { signedIn: {}, owners: [{ id: 'jared', label: 'jared', kind: 'personal' }], repos: [], taken: [] };
    if (kd && kd.address) {
      if (!addrOk(address)) return null;
      if (norm(address) !== norm(rec.address)) return { key: k + '@' + norm(address), svc, kind: kd.id, address: String(address).trim(), host: String(address).replace(/^https:\/\//, '').replace(/\/.*/, ''), signedIn: {}, owners: [{ id: 'jared', label: 'jared', kind: 'personal' }], repos: [], taken: [] };
      return Object.assign({}, rec, { key: k, svc, kind: kd.id, host: String(rec.address).replace(/^https:\/\//, '') });
    }
    return Object.assign({}, rec, { key: k, svc, kind: kd.id, address: 'https://' + kd.host, host: kd.host });
  }
  function signedIn(rec, c) {
    if (!rec) return null;
    const f = F().signins[c + ':' + rec.key];
    if (f) return Object.assign({ expired: false }, f);
    const x = rec.signedIn && rec.signedIn[c];
    return x ? Object.assign({}, x) : null;
  }
  /* sign in on the device in front of you; the sign-in is kept on the computer doing the work (D6 A). A result from an
     earlier attempt is dropped (FF-12b): the cache key carries the attempt */
  function signIn(s, rec, method, slot) {
    if (!rec) return null;
    const c = s.d.runsOn;
    s.attempt++;
    const key = 'signin:' + rec.key + ':' + c + ':' + s.attempt;
    s.ui.signin = s.ui.signin || {}; s.ui.signin[rec.key + ':' + c] = key;
    let tok = '';
    if (method === 'token') { const el = s.secrets.get(slot || 'tok'); tok = el ? el.value : ''; if (el) el.value = ''; }
    return op(s, key, method === 'token' ? 700 : 1300, () => {
      // an earlier attempt that settles after a newer one never writes the world (FF-12b)
      if ((s.ui.signin || {})[rec.key + ':' + c] !== key) return { fail: 'stale', stale: true };
      if (method === 'token' && (!tok || tok.trim() === 'abc' || tok.trim().length < 5)) return { fail: 'token' };
      const account = (rec.signedIn && rec.signedIn[c] && rec.signedIn[c].account) || (rec.signedIn && rec.signedIn.here && rec.signedIn.here.account) || 'jared';
      F().signins[c + ':' + rec.key] = { account, method, expired: false };
      return { account };
    });
  }
  const signinOp = (s, rec) => { const k = s.ui.signin && rec && s.ui.signin[rec.key + ':' + s.d.runsOn]; return k ? peek(s, k) : null; };
  function serverCheck(s, svc, kind, address) {
    return op(s, 'srv:' + svc + ':' + kind + ':' + norm(address), 650, () => (addrOk(address) ? { ok: true } : { fail: 'none' }));
  }

  /* ------------------------------------------------------------------ the online way: source and find (6.4) */
  function srcRec(s) { const d = s.d; return d.src.service === 'git' ? null : forgeRec(d.src.service, d.src.kind, d.src.address); }
  function repoOf(s) {
    const d = s.d, rec = srcRec(s); if (!d.find.project) return null;
    if (d.src.service === 'git') return { id: d.src.gitAddress, plain: true, access: 'unknown', size: '3 MB', sizeGB: 0.003 };
    const mine = rec && (rec.repos || []).find((r) => r.id === d.find.project);
    if (mine) return Object.assign({ svc: rec.key }, mine);
    const pub = ENV.publicRepos.find((r) => r.id === d.find.project && rec && r.svc === rec.key);
    return pub ? Object.assign({}, pub) : { id: d.find.project, access: 'none' };
  }
  function findAnyone(s) {
    const d = s.d, rec = srcRec(s), q = String(d.find.anyAsked || '').trim(); if (!q || !rec) return null;
    const id = q.replace(/^https?:\/\//, '').replace(/^(www\.)?(github\.com|gitlab\.com|bitbucket\.org)[/:]/i, '').replace(/\.git$/, '').replace(/\/+$/, '');
    return op(s, 'find:' + rec.key + ':' + d.runsOn + ':' + lc(id), 750, () => {
      const r = (rec.repos || []).find((x) => lc(x.id) === lc(id)) || ENV.publicRepos.find((x) => lc(x.id) === lc(id) && x.svc === rec.key);
      return r && r.access !== 'none' ? { id: r.id } : { fail: 'notFound', id };
    });
  }
  /* a Project only an account can see (private, internal, a team project) is checked with that account's current sign-in */
  const needsAccount = (r) => !!(r && r.vis && /^(Private|Internal|Team project)$/i.test(r.vis));
  function access(s) {
    const d = s.d, rec = srcRec(s), r = repoOf(s); if (!r || r.plain) return null;
    const si = signedIn(rec, d.runsOn);
    if (needsAccount(r) && (!si || si.expired)) return { state: 'signin', result: null, expired: !!(si && si.expired) };
    return op(s, 'access:' + (rec && rec.key) + ':' + d.runsOn + ':' + r.id + ':' + (si ? si.account : '-'), 700, () => {
      if (r.access === 'none') return { fail: 'none' };
      const myOwner = r.owner === ((signedIn(rec, d.runsOn) || {}).account || 'jared');
      return { access: r.access, team: r.access === 'write' && !myOwner, fork: F().forks[r.id] || r.fork || null, tfvc: !!r.tfvc };
    });
  }
  const accessDone = (s) => { const o = access(s); return o && o.state === 'done' ? o.result : null; };
  function inside(s) {
    const d = s.d, rec = srcRec(s), r = repoOf(s); if (!r || r.plain || r.access === 'none' || !accessDone(s)) return null;
    return op(s, 'inside:' + (rec && rec.key) + ':' + r.id, 850, () => ({ submodules: r.submodules || [], lfs: r.lfs || null, size: r.size || '10 MB', sizeGB: r.sizeGB || 0.01 }));
  }
  function gitAddressCheck(s) {
    const a = String(s.d.src.gitAddress || '').trim(); if (!gitAddrValid(a)) return null;
    return op(s, 'gitaddr:' + s.d.runsOn + ':' + a, 800, () => (/nobody\.invalid|\.invalid\b/.test(a) ? { fail: 'none' } : { branch: 'main', size: '3 MB', auth: /^git@|ssh:\/\//.test(a) }));
  }
  const gitAddrValid = (a) => /^(https?:\/\/\S+|ssh:\/\/\S+|git@[\w.-]+:\S+)$/.test(String(a || '').trim());
  function intentDefault(s) {
    const a = accessDone(s), svc = R().service(s.d.src.service);
    if (!a) return null;
    if (a.access === 'read') return svc && svc.fork ? 'contribute' : 'copy';
    if (a.access === 'write' && a.team) return 'offer';
    return null;
  }
  const intentOf = (s) => s.d.find.intent || intentDefault(s);
  function forkName(s) { const r = repoOf(s); return s.d.fork.nameTouched ? s.d.fork.name : r ? String(r.id).split('/').pop() : ''; }
  function forkOwner(s) { const rec = srcRec(s), si = signedIn(rec, s.d.runsOn); return s.d.find.forkOwner || (si && si.account) || 'jared'; }
  function knownFor(s) {
    const r = repoOf(s); if (!r) return null;
    const a = accessDone(s), fork = a && a.fork;
    return PJX.all().find((p) => p.online && (p.online.repo === r.id || (fork && p.online.repo === fork))) || null;
  }

  /* ------------------------------------------------------------------ restore (6.5) */
  function restoreSource(s) {
    const d = s.d.restore;
    if (d.from === 'kit') return ENV.backups.find((b) => b.id === 'nas');
    if (d.from === 'cloud') return d.cloud === 'gdrive' ? ENV.backups.find((b) => b.id === 'gdrive') : d.cloud === 'b2' ? ENV.backups.find((b) => b.id === 'b2') : { id: 'onedrive', where: 'OneDrive', projects: [], empty: true, locked: false };
    return ENV.backups.find((b) => b.id === d.from) || null;
  }
  const restoreWhere = (s) => { const r = restoreSource(s); return r ? (r.id === 'drive' ? r.path : r.where) : ''; };
  function restoreList(s) {
    const src = restoreSource(s); if (!src) return null;
    if (!reached(s) || !restoreUnlocked(s)) return null;
    return op(s, 'rlist:' + src.id, 800, () => (src.empty || !src.projects.length ? { fail: 'none' } : { projects: src.projects }));
  }
  function unlock(s) {
    const src = restoreSource(s), el = s.secrets.get('phrase'), v = el ? String(el.value || '').trim().replace(/\s+/g, ' ') : '';
    if (!v) return { fail: 'first' };
    if (el) el.value = '';
    if (src && v === src.phrase) { s.d.restore.unlocked = true; s.ui.phraseBad = false; s.changed(); return { ok: true }; }
    s.ui.phraseBad = true; s.changed(); return { fail: 'wrong' };
  }
  /* (2.33) the storage is reached and signed in to before anything unlocks: the Kit says where, never that you are signed in */
  const reachKey = (s) => 'reach:' + s.d.restore.from + ':' + (s.d.restore.from === 'cloud' ? s.d.restore.cloud : '') + ':' + s.d.runsOn;
  const reachOp = (s) => peek(s, reachKey(s));
  const reached = (s) => { const o = reachOp(s); return !!(o && o.state === 'done'); };
  function reach(s) {
    const r = s.d.restore, cloud = r.from === 'cloud';
    return op(s, reachKey(s), cloud ? 1300 : 800, () => (s.ui.reachFail ? (s.ui.reachFail = false, { fail: cloud ? 'expired' : 'noAnswer' }) : { ok: true, account: cloud ? (r.cloud === 'gdrive' ? 'jared@gmail.com' : r.cloud === 'onedrive' ? 'jared@outlook.com' : 'key for old-backups') : null }));
  }
  /* (2.33) the Kit unlocks only the backup it belongs to, checked against what was reached; without a Kit, the phrase */
  const kitOf = (s) => (ENV.kits || []).find((k) => k.id === s.d.restore.kit) || null;
  function kitOpen(s) { const k = kitOf(s); if (!k || !reached(s)) return null; return op(s, 'kitopen:' + k.id + ':' + s.d.restore.from, 800, () => ({ ok: true })); }
  function restoreUnlocked(s) {
    const r = s.d.restore, src = restoreSource(s);
    if (kitOf(s)) { const o = peek(s, 'kitopen:' + r.kit + ':' + r.from); return !!(o && o.state === 'done'); }
    return !(src && src.locked) || r.unlocked;
  }
  /* (2.34) a specific recovery point, and what it covers, chosen after the Project */
  function restorePoints(s) {
    const src = restoreSource(s), p = s.d.restore.pick; if (!src || !p) return [];
    const m = (src.manifest || {})[p] || {};
    const kind = m.backend === 'jujutsu' ? 'Jujutsu' : m.backend === 'git' ? 'Git' : null;
    const cover = m.include === 'pm' ? w('np.restore.cover.pm') : kind ? w('np.restore.cover.all', { kind }) : w('np.restore.cover.files');
    return [{ id: 'p0', when: src.latest || 'the latest', tag: 'Newest', cover }, { id: 'p1', when: 'Yesterday, 3:00 AM', cover }, { id: 'p2', when: 'Oct 26 · kept weekly', cover }, { id: 'p3', when: 'Sep 30 · kept monthly', cover: m.include === 'pm' ? cover : w('np.restore.cover.older', { kind: kind || 'no' }) }];
  }
  const lineage = (s) => { const src = restoreSource(s), p = s.d.restore.pick; return src && src.lineage && p ? src.lineage[p] || null : null; };
  /* what the chosen backup holds for that Project (its manifest): the history comes back as it was kept, never relabelled */
  const restoredHist = (s) => { const src = restoreSource(s), p = s.d.restore.pick; return src && src.manifest && p ? src.manifest[p] || null : null; };
  const kindWord = (k) => (k === 'jujutsu' ? 'Jujutsu' : k === 'git' ? 'Git' : '');

  /* ------------------------------------------------------------------ chat (spec 12) */
  const chatFiles = (s) => { const c = chatOf(s.d.chat.id); return s.d.chat.files || (c && c.files ? 'move' : 'empty'); };
  /* only picked content moves (ACD-510, GUIDED-FLOWS 7.05): every file starts picked, each can be left in the chat folder */
  const chatPicked = (s) => { const c = chatOf(s.d.chat.id), pk = s.d.chat.pick; return c ? (c.fileList || []).filter((f) => !pk || pk[f] !== false) : []; };
  const waitingApprovals = (c) => (c && c.approvals ? c.approvals.filter((a) => ((F().approvals || {})[a.id] || a.state) === 'waiting') : []);
  /* the concept's clock: the demo can move it forward to pass an Undo deadline (ACD-511) */
  const clockNow = () => Date.now() + ((F() && F().clockDays) || 0) * 864e5;
  const untilTs = () => clockNow() + 7 * 864e5;
  const untilWord = (ts) => { const t = new Date(ts || untilTs()); return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
  const nowWord = () => new Date(clockNow()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  /* why Undo has ended, or null: the first new message, work or changed moved file, or the deadline passing */
  const undoEnded = (rec) => (!rec ? null : rec.ended ? rec.ended : rec.untilTs && clockNow() > rec.untilTs ? w('cv.undo.expired', { until: rec.until }) : null);
  /* the live preview of a conversion, family by family (ACD-510; GUIDED-FLOWS 7.10, 7.11): settings, AI accounts, permissions,
     active work, online effects and the Undo boundary. dest: { project (an existing one) or name, computer, like, remote } */
  function convEffects(c, dest) {
    if (!c) return [];
    const p = dest.project ? PJX.get(dest.project) : null, pn = p ? p.name : (dest.name || 'the new Project'), cid = dest.computer || (p ? p.home || p.runsOn : 'here'), cn = comp(cid).name;
    const prefs = [c.prefs.mode + ' mode', c.prefs.persona, c.prefs.model].filter(Boolean).join(', ');
    const set = [];
    if (p) { const own = ((ENV.projectSettings[p.id] || {}).own || []).slice(0, 3); if (own.length) own.forEach((r) => set.push({ key: 'info', text: w('cv.set.diff', { label: r[2], value: r[4], project: pn, usual: r[3] }) })); else set.push({ key: 'complete', text: w('cv.set.same', { project: pn }) }); }
    else set.push({ key: 'info', text: w('cv.set.usual', { like: dest.like ? ' like ' + dest.like : '', prefs }) });
    const hosts = p ? (PJX.work ? PJX.work.policy(p).allowed : [cid]) : (dest.allowed || [cid]);
    const acc = [];
    (c.accounts || []).forEach((id) => { const a = ENV.accounts.find((x) => x.id === id); if (!a) return; hosts.forEach((h0) => { const on = a.on[h0] || 'none', hn = comp(h0).name; acc.push(on === 'ready' ? { key: 'complete', text: w('cv.acc.ready', { name: a.name, computer: hn }) } : { key: 'waiting', text: w('cv.acc.signin', { name: a.name, computer: hn }) }); }); });
    const perms = (c.grants || []).map((g) => ({ key: 'info', text: w('cv.perm.stay', { grant: g, project: pn }) }));
    const work = [];
    (c.goals || []).forEach((g) => work.push({ key: 'paused', text: w('cv.work.goal', { goal: g.title, project: pn }) }));
    (c.schedules || []).forEach((x) => work.push({ key: 'pending', text: w('cv.work.schedule', { what: x.title, when: x.when, project: pn }) }));
    waitingApprovals(c).forEach((a) => work.push({ key: 'blocked', text: w('cv.work.approval', { what: a.what }) }));
    if (!work.length) work.push({ key: 'complete', text: w('cv.work.none') });
    return [
      { id: 'settings', label: w('cv.fam.settings'), rows: set }, { id: 'accounts', label: w('cv.fam.accounts'), rows: acc.length ? acc : [{ key: 'complete', text: 'None used' }] },
      { id: 'perms', label: w('cv.fam.perms'), rows: perms.length ? perms : [{ key: 'complete', text: 'It has no permissions of its own.' }] }, { id: 'work', label: w('cv.fam.work'), rows: work },
      { id: 'remote', label: w('cv.fam.remote'), rows: [{ key: dest.remote ? 'warning' : 'complete', text: dest.remote ? w('cv.remote.make', { service: dest.remote }) : w('cv.remote.none') }] },
      { id: 'undo', label: w('cv.fam.undo'), rows: [{ key: 'info', text: w('cv.undo', { until: untilWord() }) }] }
    ];
  }

  /* ------------------------------------------------------------------ the name and where it lives (6.6) */
  function derivedName(s) {
    const d = s.d;
    if (d.way === 'folder' && d.folder.path) return d.folder.path.split('/').pop();
    if (d.way === 'device' && d.device.path) {
      // a copy of a Project you already have is said, never blocked (P5): its name says where this copy is
      const i = lookDone(s), base = d.device.path.split('/').pop();
      return i && i.sameOnline && PJX.get(i.sameOnline) && lc(PJX.get(i.sameOnline).name) === lc(base) ? base + ' on ' + holderName(s) : base;
    }
    if (d.way === 'online') { if (d.src.service === 'git' && d.src.gitAddress) return d.src.gitAddress.replace(/\.git$/, '').split(/[/:]/).pop(); if (d.find.project) return String(d.find.project).split('/').pop(); }
    if (d.way === 'restore' && d.restore.pick) { const p = d.restore.pick; return PJX.all().some((x) => lc(x.name) === lc(p)) ? p + '-restored' : p; }
    if (d.way === 'chat') { const c = chatOf(d.chat.id); if (c) return c.title; }
    return '';
  }
  const nameOf = (s) => (s.d.nameTouched ? s.d.name : derivedName(s));
  const folderNameOf = (s) => (s.d.folderNameTouched ? s.d.folderName : R().folderSlug(nameOf(s)));
  function nameProblem(s) {
    const v = String(nameOf(s) || '').trim();
    if (!v) return w('np.name.empty');
    if (v.length > 60) return w('np.name.long');
    const t = PJX.all().find((p) => lc(p.name) === lc(v));
    if (t) return w('np.name.exists', { name: t.name });
    return null;
  }
  /* where the files of a new Project can go (files.mode), by the computer doing the work */
  function filesModes(s) {
    const d = s.d;
    if (d.runsOn === 'homenas') return ['with_server', 'this_computer', 'network'];
    return ['projects', 'custom', 'network'];
  }
  const filesMode = (s) => s.d.files.mode || filesModes(s)[0];
  /* network places a new Project's files can live in (the 6.3 chooser, purpose storage) */
  function networkPlaces(s) {
    const c = s.d.runsOn, out = [];
    if (c === 'here') out.push({ id: 'ssh:nas', route: 'SSH', device: 'nas', title: 'Home NAS · /volume1/projects', sub: 'Over a secure connection (SSH)', root: '/volume1/projects', holder: 'Home NAS', free: '3.1 TB', freeGB: 3100 });
    out.push({ id: 'ssh:studio', route: 'SSH', device: 'studio', title: 'Studio Mac · ~/Developer', sub: c === 'here' ? 'Over a secure connection (SSH)' : 'Not connected from Home NAS yet', root: '~/Developer', holder: 'Studio Mac', free: '640 GB', freeGB: 640, off: c !== 'here' ? 'Connect Studio Mac from Home NAS first, under Files on another computer' : null });
    out.push({ id: 'smb:smb-nas', route: 'SMB', device: 'nas', title: '//home-nas.local/projects', sub: 'A shared folder on Home NAS (SMB)', root: '//home-nas.local/projects', holder: 'Home NAS', free: '3.1 TB', freeGB: 3100 });
    out.push({ id: 'nfs:nfs-nas', route: 'NFS', device: 'nas', title: 'home-nas.local:/volume1/projects', sub: 'An NFS share on Home NAS', root: 'home-nas.local:/volume1/projects', holder: 'Home NAS', free: '3.1 TB', freeGB: 3100 });
    if (c === 'here') ENV.volumes.forEach((v) => out.push({ id: 'vol:' + v.id, route: 'drive', device: v.device, title: v.path, sub: v.label + ' · ' + v.free + ' free', root: v.path, holder: v.device ? 'Home NAS' : 'This computer', free: v.free, freeGB: v.freeGB }));
    out.push({ id: 'nfs:media', route: 'NFS', device: 'media', title: 'media.local:/mnt/tank/projects', sub: 'An NFS share on Media server · not answering', root: '/mnt/tank/projects', holder: 'Media server', off: w('np.device.offlineWhy', { device: 'Media server' }) });
    return out.map((x) => (x.device === 'media' && dev('media').online ? Object.assign(x, { off: null, sub: 'An NFS share on Media server' }) : x));
  }
  const netPlace = (s) => networkPlaces(s).find((x) => x.id === s.d.files.network) || null;
  /* the folder that will hold it, and its full path */
  function placeRoot(s) {
    const d = s.d, m = filesMode(s), c = comp(d.runsOn);
    if (m === 'projects') return { root: c.rootFull, holder: c.id === 'here' ? 'This computer' : c.name, free: c.free, freeGB: c.freeGB, short: c.root };
    if (m === 'this_computer') return { root: comp('here').rootFull, holder: 'This computer', free: comp('here').free, freeGB: comp('here').freeGB, short: comp('here').root };
    if (m === 'with_server') return { root: comp('homenas').rootFull, holder: 'Home NAS', free: comp('homenas').free, freeGB: comp('homenas').freeGB, short: comp('homenas').root };
    if (m === 'custom') {
      const p = String(d.files.parent || '').trim().replace(/\/+$/, ''), v = d.runsOn === 'here' ? volOfPath(p) : null, fp0 = full(p, d.runsOn);
      // the free space is the folder's own drive: a connected drive or a Home NAS share has its own room
      if (v) return { root: fp0, holder: v.device ? 'Home NAS' : 'This computer', free: v.free, freeGB: v.freeGB, custom: p, vol: v };
      return { root: fp0, holder: c.name, free: c.free, freeGB: c.freeGB, custom: p };
    }
    const n = netPlace(s); if (!n) return null;
    return { root: full(n.root, n.device === 'studio' ? 'studio' : d.runsOn), holder: n.holder, free: n.free, freeGB: n.freeGB, net: n };
  }
  function fullPath(s) {
    const d = s.d;
    if (d.way === 'folder') return d.folder.path ? full(d.folder.path, d.runsOn) : null;
    if (d.way === 'device') return d.device.path ? d.device.path : null;
    if (d.way === 'chat' && (chatFiles(s) === 'useFolder' || chatFiles(s) === 'worked')) { const t = lookTarget(s); return t ? full(t.path) : null; }
    const r = placeRoot(s); if (!r) return null;
    const fn = folderNameOf(s);
    return fn ? r.root + '/' + fn : null;
  }
  const filesStay = (s) => s.d.way === 'folder' || s.d.way === 'device' || (s.d.way === 'chat' && /useFolder|worked/.test(chatFiles(s)));
  /* the computer or share that has the files, which can differ from the computer doing the work */
  function holderName(s) {
    const d = s.d;
    if (d.way === 'folder') { const v = d.runsOn === 'here' ? volOfPath(d.folder.path) : null; return d.runsOn !== 'here' ? comp(d.runsOn).name : v && v.device === 'nas' ? 'Home NAS' : 'This computer'; }
    if (d.way === 'device') { const m = d.device.method; if (m === 'ssh') return (dev(d.device.id) || {}).name || ''; if (m === 'mounted') { const v = vol(d.device.volume); return v && v.device ? 'Home NAS' : 'This computer'; } const sh = resolveShare(s); return sh ? (dev(sh.device) || {}).name : ''; }
    if (filesStay(s)) return 'This computer';
    const r = placeRoot(s); return r ? r.holder : '';
  }
  const needGB = (s) => { const d = s.d; if (d.way === 'online') { const i = inside(s); return i && i.state === 'done' ? i.result.sizeGB : 0; } if (d.way === 'restore') return 0.2; return 0.001; };
  function whereProblem(s) {
    const d = s.d, n = nameProblem(s);
    if (n) return { text: n, field: 'name' };
    if (filesStay(s)) return null;
    const m = filesMode(s);
    if (m === 'network' && !netPlace(s)) return { text: w('np.loc.bad.network'), field: 'files' };
    if (m === 'network') {
      const n = netPlace(s), o = netCheck(s);
      if (n.off) return { text: n.off, field: 'files' };
      if (!o || o.state === 'working') return { text: o ? w('np.loc.net.checking', { place: n.title }) : w('np.loc.net.first', { place: n.title }), field: n.route === 'SMB' ? 'netUser' : 'netcheck', wait: !!o };
      if (o.state === 'failed') return { text: w('np.loc.net.refused.' + (o.result.fail || 'denied'), { place: n.title }), field: n.route === 'SMB' ? 'netUser' : 'netcheck' };
    }
    const r = placeRoot(s);
    if (m === 'custom' && r && /^\/System/i.test(r.custom || '')) return { text: w('np.loc.bad.readonly', { path: r.custom }), field: 'parent' };
    const fnp = R().folderNameProblem(folderNameOf(s)); if (fnp) return { text: fnp, field: 'folderName' };
    const fp = fullPath(s);
    if (fp && existsWithFiles(fp)) return { text: w('np.loc.bad.full', { path: fp }), field: 'folderName' };
    const need = needGB(s);
    if (r && r.freeGB != null && need > r.freeGB) return { text: w('np.loc.bad.room', { need: fmtGB(need), place: r.net ? r.net.title : r.holder, free: r.free }), field: 'files' };
    return null;
  }
  const fmtGB = (g) => (g >= 1 ? (Math.round(g * 10) / 10) + ' GB' : Math.max(1, Math.round(g * 1000)) + ' MB');
  function existsWithFiles(fp) {
    const short = fp.replace(HOME, '~'), i = short.lastIndexOf('/'), parent = short.slice(0, i), name = short.slice(i + 1);
    return !!(ENV.tree[parent] && ENV.tree[parent].indexOf(name) >= 0) || PJX.all().some((p) => full(p.where.path) === fp);
  }
  /* the NAS rule over every route (6.10.6): the Project's files reach that NAS by SSH, pairing, a share it hosts, a
     drive that is one of its shares, or the Server doing the work being that NAS while the files stay on it */
  function filesOnNas(s) {
    const d = s.d;
    // a form on a Project's page: the Project's own files decide, wherever the work happens
    if (s.purpose === 'page' && s.project && PJX.get(s.project)) { const p = PJX.get(s.project), v = volOfPath(p.where.path); return p.where.kind !== 'local' ? p.where.device === 'Home NAS' : !!(v && v.device === 'nas'); }
    if (d.way === 'folder') { const v = d.runsOn === 'here' ? volOfPath(d.folder.path) : null; return d.runsOn === 'homenas' || !!(v && v.device === 'nas'); }
    if (d.way === 'device') {
      if (d.device.method === 'ssh') return d.device.id === 'nas';
      if (d.device.method === 'mounted') { const v = vol(d.device.volume); return !!(v && v.device === 'nas'); }
      const sh = resolveShare(s); return !!(sh && sh.device === 'nas');
    }
    if (filesStay(s)) return false;
    const m = filesMode(s);
    if (m === 'with_server') return true;
    if (m === 'network') { const n = netPlace(s); return !!(n && n.device === 'nas'); }
    if (m === 'custom') { const r = placeRoot(s); return !!(r && r.vol && r.vol.device === 'nas'); }
    return false;
  }
  /* the network places a new Project's files can live in are checked before they are used: an SSH place needs the work
     computer's key, a shared folder (SMB) its account and password, an NFS share to let the computer in */
  function netCheck(s) {
    const d = s.d, n = netPlace(s); if (!n || n.off) return null;
    if (n.route === 'drive') return op(s, 'net:' + d.runsOn + ':' + n.id, 500, () => ({ ok: true, how: 'drive' }));
    if (n.route === 'SSH') return op(s, 'net:' + d.runsOn + ':' + n.id, 800, () => ((ENV.reach[d.runsOn] || []).indexOf(n.device) >= 0 || F().trusted[d.runsOn + ':' + n.device] ? { ok: true, how: 'key' } : { fail: 'nokey' }));
    if (n.route === 'NFS') { const sh = share('nfs-nas'); return op(s, 'net:' + d.runsOn + ':' + n.id, 700, () => (sh && sh.allows.indexOf(d.runsOn) >= 0 ? { ok: true, how: 'nfs' } : { fail: 'denied' })); }
    return s.ops['net:' + d.runsOn + ':' + n.id + ':' + d.files.netUser] || null;
  }
  function netSignIn(s) {
    const d = s.d, n = netPlace(s), el = s.secrets.get('net:smb'), pw = el ? el.value : '', u = String(d.files.netUser || '').trim(), sh = share('smb-nas');
    if (!n || n.route !== 'SMB') return null;
    if (!u || !pw) { s.ui.netNeed = true; s.changed(); return { fail: 'needBoth' }; }
    s.ui.netNeed = false;
    const key = 'net:' + d.runsOn + ':' + n.id + ':' + u;
    delete s.ops[key];
    const o = op(s, key, 900, () => (sh && u === sh.user && pw === sh.password ? { ok: true, how: 'smb' } : { fail: 'wrong' }));
    if (el) el.value = '';
    return o;
  }
  /* a backup that goes to the same NAS by another route (an SFTP or WebDAV address, an S3-compatible server on it) */
  function bkHost(s) {
    const a = s.d.backup.acc || {}, fam = bkFamily(s);
    const addr = fam === 'sftp' || fam === 'webdav' ? a.address : fam === 's3_compatible' ? a.server : '';
    const m = /^[a-z0-9+.-]+:\/\/(?:[^@/]+@)?([^/:?#]+)/i.exec(String(addr || '').trim());
    return m ? m[1].toLowerCase() : '';
  }
  function bkIdentity(s) {
    const host = bkHost(s); if (!host) return null;
    return op(s, 'bkid:' + host, 700, () => {
      const n = ENV.devices.concat(ENV.found).find((x) => [x.address, x.ip].concat(x.aliases || []).indexOf(host) >= 0);
      if (n) return { device: n.id, name: n.name };
      // a local name or a private address that answers as no known device stays unresolved: never taken as independent
      return /\.local$|^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host) ? { unknown: true } : { device: null, independent: true };
    });
  }
  function bkOnNas(s) {
    if (s.d.backup.dest === 'nas') return true;
    const o = bkIdentity(s); return !!(o && o.state === 'done' && o.result.device === 'nas');
  }

  /* ------------------------------------------------------------------ like: copy settings (SETTINGS-PROPOSAL 5.1 to 5.4) */
  const likeSrc = (s) => (s.d.like.source !== 'usual' ? PJX.get(s.d.like.source) : null);
  const settingsOf = (id) => (ENV.projectSettings[id] || { uses: ['claude'], own: [], same: [], things: [], ownFiles: [], fromComputer: 0 });
  function likePreview(s) { const p = likeSrc(s); if (!p) return null; return op(s, 'preview:' + p.id + ':' + p.runsOn, 650, () => ({ ok: true })); }
  const picked = (map, id) => (map == null ? true : map[id] !== false);
  /* the one selection a copy makes (SETTINGS-PROPOSAL 5.3): exact ids for every kind of thing, from which the counts, the
     Review, the setup plan, the made Project and Undo all read */
  function likeSel(s) {
    const p = likeSrc(s); if (!p) return null;
    const S = settingsOf(p.id), L = s.d.like, rows = L.accounts ? accountRows(s) : [];
    const sel = {
      from: p.id, fixed: !!L.fixed,
      // (GUIDED-FLOWS 3.07) a kind you cleared stays cleared: Keep them fixed adds only values of the kinds and exact ids picked
      settings: S.own.filter((r) => picked(L.kinds, r[0]) && picked(L.ids, r[1])).map((r) => r[1]),
      same: L.fixed ? S.same.filter((r) => picked(L.kinds, r[0]) && picked(L.sameIds, r[1])).map((r) => r[1]) : [],
      fromComputer: L.fromComputer ? S.fromComputer : 0,
      things: S.things.filter((t) => picked(L.things, t.id)).map((t) => t.id),
      accounts: rows.filter((r) => r.choice === 'same' && !r.mcp).map((r) => r.id),
      headers: rows.filter((r) => r.choice === 'same' && r.mcp).map((r) => r.id),
      later: rows.filter((r) => r.choice === 'later').map((r) => r.id),
      ownFiles: S.ownFiles.filter((f) => L.ownFiles[f.id]).map((f) => f.id)
    };
    return sel;
  }
  function likeCounts(s) {
    const p = likeSrc(s); if (!p) return null;
    const S = settingsOf(p.id), x = likeSel(s);
    return { own: x.settings.length + x.same.length + x.fromComputer, picked: x.settings.length, ownAll: S.own.length, same: x.same.length, sameAll: S.same.length, fromComputer: x.fromComputer,
      things: x.things.length, thingsAll: S.things.length, accounts: x.accounts.length, headers: x.headers.length, uses: S.uses.length, files: x.ownFiles.length, sel: x };
  }
  /* each account's readiness on the computer doing the work (5.4): reused on the same computer only when chosen (S10),
     checked first on another computer, keys never sent (S11) */
  function accountRows(s) {
    const p = likeSrc(s); if (!p) return [];
    const S = settingsOf(p.id), L = s.d.like;
    const hosts = PJX.work ? PJX.work.npAllowed(s) : [s.d.runsOn];
    const ids = S.uses.slice();
    if (S.things.some((t) => t.kind === 'mcp' && picked(L.things, t.id))) S.things.filter((t) => t.kind === 'mcp').forEach((t) => { if (ENV.accounts.some((a) => a.id === t.id)) ids.push(t.id); });
    const RANK = { cannot_move: 0, sign_in_there: 1, key_needed: 1, expired: 2, not_installed: 3, check_there: 4, key_sent: 5, ready_here: 6, later: 7 };
    return ids.map((id) => {
      const a = ENV.accounts.find((x) => x.id === id); if (!a) return null;
      const choice = L.per[id] || 'same';
      // one readiness per allowed Computer; the row says the worst first and names every Computer that needs something
      const per = hosts.map((c) => Object.assign({ c }, oneAccount(a, choice, c, c === (p.runsOn || 'here'), comp(c).name, L)));
      per.sort((x, y) => RANK[x.state] - RANK[y.state]);
      const out = Object.assign({}, per[0]);
      if (hosts.length > 1 && choice !== 'later') { const need = per.filter((x) => x.state !== 'ready_here' && x.state !== 'check_there'); out.word = need.length ? need.map((x) => x.word).join(' · ') : w('np.acct.allReady', { n: hosts.length }); out.per = per; }
      return Object.assign({ id, name: a.name, account: a.account, kind: a.kind, choice, mcp: S.things.some((t) => t.id === id) }, out);
    }).filter(Boolean);
  }
  function oneAccount(a, choice, c, same, cn, L) {
      const on = a.on[c] || 'none';
      let out;
      if (choice === 'later') out = { key: 'off', state: 'later', word: w('np.like.acctLaterRow') };
      else if (on === 'expired') out = { key: 'warning', state: 'expired', word: w('np.acct.expired', { computer: cn }) };
      else if (on === 'deviceBound') out = { key: 'blocked', state: 'cannot_move', word: w('np.acct.cannot', { computer: cn }), why: w('np.acct.cannotWhy') };
      else if (on === 'notInstalled') out = { key: 'off', state: 'not_installed', word: w('np.acct.install', { tool: a.tool || a.name, computer: cn }), why: w('np.acct.installWhy') };
      else if (on === 'ready') out = same ? { key: 'complete', state: 'ready_here', word: w('np.acct.ready', { computer: cn }), why: w('np.acct.readyWhy') } : { key: 'reviewing', state: 'check_there', word: w('np.acct.checked', { computer: cn }), why: w('np.acct.checkedWhy', { computer: cn }) };
      else if (a.kind === 'key') out = SETTINGS.sendKeys && L.sendKeys ? { key: 'info', state: 'key_sent', word: w('np.acct.keySend', { computer: cn }) } : { key: 'waiting', state: 'key_needed', word: w('np.acct.key', { computer: cn }), why: w('np.acct.keyWhy', { computer: cn }) };
      else out = { key: 'waiting', state: 'sign_in_there', word: w('np.acct.signin', { computer: cn }), why: w('np.acct.signinWhy', { computer: cn }) };
      return out;
  }
  const needsAfter = (s) => (s.d.like.accounts ? accountRows(s).filter((r) => /sign_in_there|key_needed|expired|not_installed/.test(r.state)).length : 0);

  /* ------------------------------------------------------------------ versions (6.8) */
  function histKeeps(s) {
    const d = s.d;
    if (d.way === 'restore') { const r = restoredHist(s); return r && r.backend ? 'restored' : null; }
    if (d.way === 'folder' || d.way === 'device' || (d.way === 'chat' && /useFolder|worked/.test(chatFiles(s)))) { const i = lookDone(s); return i && i.history ? i.history : null; }
    return null;
  }
  function histLimits(s) {
    const d = s.d;
    if (d.way === 'online') { const i = inside(s); return i && i.state === 'done' ? limits(i.result) : []; }
    return [];
  }
  const jjOn = (s) => !!comp(s.d.runsOn).jj;

  /* ------------------------------------------------------------------ online copy (6.9) */
  function onlineDefault(s) {
    const d = s.d;
    if (d.way === 'online') return 'from';
    if (d.way === 'restore') return 'leave';
    if (d.way === 'folder' || d.way === 'device' || (d.way === 'chat' && /useFolder|worked/.test(chatFiles(s)))) { const i = lookDone(s); return i && i.online ? 'link_found' : 'none'; }
    return s.purpose === 'page' ? 'make' : 'none';
  }
  const onlineMode = (s) => s.d.online.mode || onlineDefault(s);
  /* the service, kind and address of a new online copy or a link one you have */
  const onlineRec = (s) => { const o = s.d.online; return forgeRec(o.service, o.kind, o.address); };
  const onlineKind = (s) => (R().kind(s.d.online.service, s.d.online.kind) || {}).id;
  function owners(s, rec) { rec = rec || onlineRec(s); return rec ? rec.owners || [] : []; }
  function ownerOf(s, rec) {
    const o = s.d.online, list = owners(s, rec), svc = R().service(o.service);
    const si = signedIn(rec, s.d.runsOn);
    return list.find((x) => x.id === o.owner) || list.find((x) => x.kind === 'personal' && svc.personal) || list.find((x) => x.kind !== 'personal') || null;
  }
  function projectOf(s, owner) { const o = s.d.online; const ps = (owner && owner.projects) || []; return ps.filter((p) => !p.tfvc).find((p) => p.id === o.project) || (ps.filter((p) => !p.tfvc).length === 1 ? ps.filter((p) => !p.tfvc)[0] : null); }
  function visOf(s, rec, owner, project) {
    const opts = R().visibility(s.d.online.service, onlineKind(s), owner, project, rec && rec.host);
    if (!opts.length) return { opts, v: null };
    return { opts, v: opts.find((x) => x.id === s.d.online.visibility) || opts[0] };
  }
  const onlineName = (s) => { const o = s.d.online; return o.nameTouched ? o.name : R().spell(o.service, nameOf(s) || 'new-project'); };
  function nameCheck(s) {
    const rec = onlineRec(s), owner = ownerOf(s, rec), n = onlineName(s);
    if (!rec || !owner) return null;
    const rule = R().nameProblem(s.d.online.service, onlineKind(s), n);
    if (rule) return { state: 'done', result: { bad: rule } };
    const refused = s.ui.refused[rec.key + ':' + owner.id] || [];
    if (refused.indexOf(lc(n)) >= 0) return { state: 'done', result: { bad: w('np.details.refused', { service: R().service(s.d.online.service).name }) } };
    return op(s, 'name:' + rec.key + ':' + owner.id + ':' + lc(n), 450, () => (takenFor(rec, owner).some((t) => lc(t) === lc(n)) ? { bad: w('np.details.taken', { owner: owner.label }) } : { ok: true, name: n, owner: owner.label }));
  }
  /* the names an owner already uses on a service: its listed Projects and the demo's taken names (a plain name is the first
     owner's, "acme/name" is acme's) */
  function takenFor(rec, owner) {
    const own = (rec.repos || []).filter((r) => String(r.id).split('/')[0] === owner.id).map((r) => String(r.id).split('/').pop());
    const listed = (rec.taken || []).filter((t) => (t.indexOf('/') >= 0 ? t.split('/')[0] === owner.id : (rec.owners || [])[0] && rec.owners[0].id === owner.id)).map((t) => t.split('/').pop());
    return own.concat(listed);
  }
  /* your fork's name is checked under the account it goes to, like any new name (FF-09) */
  function forkNameCheck(s) {
    const rec = srcRec(s), n = forkName(s), ow = forkOwner(s), a = accessDone(s);
    if (!rec || !n || (a && a.fork)) return null;
    const owner = (rec.owners || []).find((x) => x.id === ow) || { id: ow, label: ow };
    return op(s, 'forkname:' + rec.key + ':' + ow + ':' + lc(n), 450, () => (takenFor(rec, owner).some((t) => lc(t) === lc(n)) ? { bad: w('np.fork.taken', { name: ow + '/' + n, service: R().service(s.d.src.service).name }) } : { ok: true, name: ow + '/' + n }));
  }
  /* the link check (6.9.2): a found online copy, or one you picked, is linked only after sign-in and this check */
  function linkTarget(s) {
    const m = onlineMode(s), i = lookDone(s);
    if (m === 'link_found' && i && i.online) {
      if (i.online.address) return { address: i.online.address, remote: i.online.remote };
      const sv = SVC_OF[i.online.service] || ['github', 'com'];
      return { svc: sv[0], kind: sv[1], project: i.online.repo, service: i.online.service, remote: i.online.remote };
    }
    if (m === 'again') { const l = lineage(s); if (l) { const sv = SVC_OF[l[0]] || ['github', 'com']; return { svc: sv[0], kind: sv[1], project: l[1], service: l[0] }; } }
    if (m === 'link') {
      const o = s.d.online;
      if (o.service === 'git') return o.address ? { address: o.address } : null;
      if (!o.linkProject) return null;
      return { svc: o.service, kind: onlineKind(s), project: o.linkProject, service: R().service(o.service).name, picked: true };
    }
    return null;
  }
  function linkRec(s) { const t = linkTarget(s); if (!t || t.address) return null; return t.picked ? onlineRec(s) : forgeRec(t.svc, t.kind, ''); }
  function linkCheck(s) {
    const t = linkTarget(s); if (!t) return null;
    if (t.address) return op(s, 'link:addr:' + t.address, 700, () => (/\.invalid\b/.test(t.address) ? { fail: 'gone' } : { address: true }));
    const rec = linkRec(s), si = signedIn(rec, s.d.runsOn);
    if (!si || si.expired) return null;
    const folder = (lookTarget(s) || {}).path || (s.d.restore.pick || '');
    return op(s, 'link:' + rec.key + ':' + t.project + ':' + folder + ':' + s.d.runsOn, 900, () => {
      const base = String(folder).split('/').pop(), last = String(t.project).split('/').pop();
      const r = (rec.repos || []).find((x) => x.id === t.project);
      if (t.picked && !r) return { fail: 'gone' };
      if (r && r.empty) return { ok: true, empty: true, vis: visWord(r.vis, r.owner) };
      if (t.picked && lc(base) !== lc(last)) return { fail: 'mismatch' };
      // who can see it is what the service says now; a Project already linked to it knows too; otherwise it is unknown
      const known = PJX.all().find((p) => p.online && p.online.repo === t.project && p.online.privacy);
      return { ok: true, vis: r ? visWord(r.vis, r.owner) : known ? known.online.privacy : null };
    });
  }

  /* the service's own visibility, in the words the Project page uses */
  const visWord = (v, owner) => (!v ? null : /^private$/i.test(v) ? (owner && owner !== 'jared' ? 'Members of ' + owner : 'Only you') : /^(public|everyone)$/i.test(v) ? 'Everyone' : /^internal$/i.test(v) ? 'Everyone in ' + (owner || 'your company') : v);

  /* ------------------------------------------------------------------ backup (6.10) */
  function bkFamily(s) { const b = s.d.backup; return b.dest === 'none' ? null : R().family(b.dest, b.sub); }
  function bkPlace(s) {
    const fam = bkFamily(s); if (!fam) return '';
    const acct = fam === 'google_drive' && s.d.runsOn === 'here' ? ENV.backupPlaces.google_drive.account : null;
    return R().place(fam, s.d.backup.acc, { slug: folderNameOf(s) || 'your-project', nas: 'Home NAS', account: acct });
  }
  function bkExisting(s) { const fam = bkFamily(s), bp = ENV.backupPlaces[fam]; return bp && bp.existing && bp.existing.length ? bp.existing : null; }
  const bkDestLabel = (s) => { const fam = bkFamily(s); return fam ? R().FAMILIES[fam].label : w('np.bk.none'); };
  const keepBad = (k) => !(k.d >= 0 && k.d <= 60 && k.w >= 0 && k.w <= 52 && k.m >= 0 && k.m <= 24 && (k.d + k.w + k.m) > 0);

  /* ------------------------------------------------------------------ sections: which, their problems, summaries and states */
  const sections = (s) => (s.d.way ? SECTIONS[s.d.way].slice() : []);
  function problem(s, id) {
    const d = s.d;
    switch (id) {
      case 'start': return null;
      case 'folder': {
        if (!d.folder.path) return { text: w('np.folder.pick'), field: 'folder' };
        const o = look(s);
        if (!o || o.state === 'working') return { text: 'Still looking inside the folder', field: 'folder', wait: true };
        if (o.state === 'failed') return { text: w('np.look.fail.' + (o.result.fail || 'read'), { path: d.folder.path }), field: 'folder' };
        if (o.result.partial) return { text: w('np.look.partialProblem'), field: 'lookagain' };
        if (o.result.known) return { text: w('np.sec.blocked.known', { project: (PJX.get(o.result.known) || {}).name || o.result.known }), field: 'folder', blocked: true };
        return null;
      }
      case 'device': return deviceProblem(s);
      case 'source': {
        if (d.src.service === 'git') {
          if (!gitAddrValid(d.src.gitAddress)) return { text: d.src.gitAddress ? w('np.svc.gitAddressBad') : 'Type the Git address', field: 'gitAddress' };
          const o = gitAddressCheck(s); if (!o || o.state === 'working') return { text: w('np.svc.gitAddressChecking'), field: 'gitAddress', wait: true };
          if (o.state === 'failed') return { text: w('np.svc.gitAddressNone'), field: 'gitAddress' };
          return null;
        }
        const kd = R().kind(d.src.service, d.src.kind);
        if (kd.address) {
          if (!d.src.address) return { text: 'Type the server’s address', field: 'srcAddress' };
          if (!addrOk(d.src.address)) return { text: w('np.svc.addressBad'), field: 'srcAddress' };
          const o = serverCheck(s, d.src.service, kd.id, d.src.address); if (o.state === 'working') return { text: 'Checking the address…', field: 'srcAddress', wait: true };
          if (o.state === 'failed') return { text: w('np.svc.addressNone', { address: d.src.address }), field: 'srcAddress' };
        }
        return null;
      }
      case 'find': return findProblem(s);
      case 'restore': {
        const r = d.restore;
        if (!r.kit) return { text: w('np.restore.kitFirst'), field: 'restore:kit' };
        if (!r.from) return { text: 'Choose where the backup is', field: 'restore' };
        const src = restoreSource(s), ro = reachOp(s);
        if (!ro || ro.state !== 'done') return { text: ro && ro.state === 'working' ? w('np.restore.reaching', { where: restoreWhere(s) }) : w('np.restore.reachFirst', { where: restoreWhere(s) }), field: 'reach', wait: !!(ro && ro.state === 'working') };
        if (kitOf(s) && !restoreUnlocked(s)) return { text: w('np.restore.kitUnlockFirst'), field: 'kitopen' };
        if (src && src.locked && !restoreUnlocked(s)) return { text: w('np.restore.phraseFirst'), field: 'phrase' };
        const l = restoreList(s); if (!l || l.state === 'working') return { text: w('np.restore.looking', { where: restoreWhere(s) }), field: 'restore', wait: true };
        if (l.state === 'failed') return { text: w('np.restore.none', { where: restoreWhere(s) }), field: 'restore' };
        if (!r.pick) return { text: w('np.restore.pick'), field: 'pick' };
        if (!r.point) return { text: w('np.restore.pointFirst'), field: 'point' };
        return null;
      }
      case 'chat': {
        if (!chatOf(d.chat.id)) return { text: 'Choose the chat', field: 'chat' };
        if (waitingApprovals(chatOf(d.chat.id)).length) return { text: w('cv.block.approval', { chat: chatOf(d.chat.id).title }), field: 'chatApproval' };
        if (chatFiles(s) === 'move' && !chatPicked(s).length) return { text: w('cv.pickZero'), field: 'chatPick' };
        if (/useFolder|worked/.test(chatFiles(s))) { const o = look(s); if (!o || o.state === 'working') return { text: 'Still looking inside the folder', field: 'chatFiles', wait: true }; }
        return null;
      }
      case 'where': return whereProblem(s);
      case 'like': return null;
      case 'versions': return null;
      case 'online': return onlineProblem(s);
      case 'backup': {
        const b = d.backup;
        if (s.ui.nasDropped && b.dest === 'none') return { text: w('np.bk.nasSame', { nas: 'Home NAS' }), field: 'bkdest', blocked: true };
        if (b.dest === 'nas' && filesOnNas(s)) return { text: w('np.bk.nasSame', { nas: 'Home NAS' }), field: 'bkdest', blocked: true };
        if (b.dest !== 'nas' && filesOnNas(s) && bkHost(s)) {
          const io = bkIdentity(s), fld = 'acc-' + (bkFamily(s) === 's3_compatible' ? 'server' : 'address');
          if (!io || io.state === 'working') return { text: w('np.bk.idChecking', { host: bkHost(s) }), field: fld, wait: true };
          if (io.result.device === 'nas') return { text: w('np.bk.nasSameAddr', { nas: 'Home NAS', host: bkHost(s) }), field: fld, blocked: true };
          if (io.result.unknown) return { text: w('np.bk.idUnknown', { host: bkHost(s), nas: 'Home NAS' }), field: fld };
        }
        if (b.dest === 'bucket' || b.dest === 'server') { const a = R().accessProblem(bkFamily(s), b.acc); if (a) return { text: a.text, field: 'acc-' + a.field }; }
        if (b.keep === 'custom' && keepBad(b.keepCustom)) return { text: w('np.bk.keep.bad'), field: 'keepCustom' };
        return null;
      }
      default: return null;
    }
  }
  function deviceProblem(s) {
    const d = s.d.device;
    if (d.method === 'ssh') {
      const x = dev(d.id);
      if (!x) return { text: 'Choose a device', field: 'device' };
      if (x.online === false) return { text: w('np.device.offlineWhy', { device: x.name }), field: 'device' };
      if (!trusted(s, x.id)) {
        if (!d.idOk) return { text: 'Confirm it’s your device first', field: 'connect' };
        if (!d.keyDone) return { text: !String(d.user || '').trim() ? w('np.connect.userEmpty', { device: x.name }) : /@/.test(d.user) ? w('np.connect.userEmail', { device: x.name }) : 'Choose a key, then Continue', field: 'connect' };
        return { text: 'Add your key to ' + x.name + ' first', field: 'connect' };
      }
      if (!d.path) return { text: w('np.folder.pick'), field: 'devpath' };
    } else if (d.method === 'smb' || d.method === 'nfs') {
      if (!d.share) return { text: 'Choose the shared folder', field: 'share' };
      if (d.share === 'typed') {
        const ok = d.method === 'smb' ? /^\/\/[\w.-]+\/\S+/.test(String(d.typedShare || '').trim()) || /^smb:\/\/[\w.-]+\/\S+/.test(d.typedShare || '') : /^[\w.-]+:\/\S+/.test(String(d.typedShare || '').trim());
        if (!ok) return { text: w(d.method === 'smb' ? 'np.smb.typedBad' : 'np.nfs.typedBad'), field: 'typedShare' };
        if (!resolveShare(s)) return { text: w('np.device.noAnswer', { address: d.typedShare }), field: 'typedShare' };
      }
      if (d.method === 'smb' && !smbOk(s)) return { text: 'Check access first', field: 'smbcheck' };
      if (d.method === 'nfs' && !nfsOk(s)) return { text: 'Check access first', field: 'nfscheck' };
      if (!d.path) return { text: w('np.folder.pick'), field: 'devpath' };
    } else {
      if (!d.volume) return { text: 'Choose a connected drive', field: 'volume' };
      if (!volOk(s)) return { text: w('np.mounted.read', { computer: comp(s.d.runsOn).name }), field: 'volume', wait: true };
      if (!d.path) return { text: w('np.folder.pick'), field: 'devpath' };
    }
    const o = look(s);
    if (!o || o.state === 'working') return { text: 'Still looking inside the folder', field: 'devpath', wait: true };
    if (o.state === 'failed') return { text: w('np.look.fail.' + (o.result.fail || 'read'), { path: d.path, device: holderName(s) }), field: 'devpath' };
    if (o.result.partial) return { text: w('np.look.partialProblem'), field: 'lookagain' };
    if (o.result.known) return { text: w('np.sec.blocked.known', { project: (PJX.get(o.result.known) || {}).name || o.result.known }), field: 'devpath', blocked: true };
    return null;
  }
  function findProblem(s) {
    const d = s.d;
    if (d.src.service === 'git') return null;
    const rec = srcRec(s);
    if (!rec) return { text: 'Choose where it is stored first', field: 'find', blocked: true };
    if (!d.find.project) return { text: w('np.find.pick'), field: 'find' };
    const r = repoOf(s);
    if (r && r.tfvc) return { text: w('np.find.tfvc', { project: r.id }), field: 'find' };
    const a = access(s);
    if (a && a.state === 'signin') return { text: w('np.access.signinFirst', { service: R().service(d.src.service).name, project: d.find.project, computer: comp(d.runsOn).name }), field: 'find' };
    if (!a || a.state === 'working') return { text: w('np.access.checking', { project: d.find.project }), field: 'find', wait: true };
    if (a.state === 'failed') return { text: w('np.find.notFound', { project: d.find.project }), field: 'find', blocked: true };
    const k = knownFor(s); if (k && !d.find.another) return { text: w('np.find.known', { project: k.name, computer: k.where.label }), field: 'find' };
    const it = intentOf(s);
    if (it === 'contribute') { const si = signedIn(rec, d.runsOn); if (!si || si.expired) return { text: w('np.access.signinFork', { service: R().service(d.src.service).name }), field: 'forksignin' }; }
    if (it === 'contribute' || it === 'offer') { const b = R().branchProblem(d.find.branch); if (b) return { text: b, field: 'branch' }; }
    const i = inside(s); if (!i || i.state === 'working') return { text: w('np.find.looking', { project: d.find.project, service: R().service(d.src.service).name }), field: 'find', wait: true };
    return null;
  }
  function onlineProblem(s) {
    const d = s.d, m = onlineMode(s), o = d.online;
    if (s.ui.retired) return { text: w('np.svc.retired'), field: 'osvc' };
    if (m === 'from') {
      if (intentOf(s) === 'contribute') {
        const fp = R().nameProblem(d.src.service, d.src.kind, forkName(s)); if (fp) return { text: fp, field: 'forkName' };
        const fc = forkNameCheck(s);
        if (fc && fc.state === 'working') return { text: w('np.details.checking'), field: 'forkName', wait: true };
        if (fc && fc.state === 'done' && fc.result.bad) return { text: fc.result.bad, field: 'forkName' };
        const up = d.fork.upstreamName; if (!/^[A-Za-z0-9._-]+$/.test(up) || up === 'origin') return { text: w('np.fork.upstreamBad'), field: 'upstream' };
      }
      return null;
    }
    if (m === 'none' || m === 'leave') return null;
    if (m === 'link_found' || m === 'again' || m === 'link') {
      if (m === 'link' && o.service !== 'git') {
        const kd = R().kind(o.service, o.kind);
        if (kd.address && !addrOk(o.address)) return { text: o.address ? w('np.svc.addressBad') : 'Type the server’s address', field: 'oaddress' };
        const rec = onlineRec(s), si = signedIn(rec, d.runsOn);
        if (!si || si.expired) return { text: w('np.signin.problem', { service: R().service(o.service).name }), field: 'osignin' };
        if (!o.linkProject) return { text: w('np.link.pickProblem'), field: 'olink' };
      }
      if (m === 'link' && o.service === 'git' && !gitAddrValid(o.address)) return { text: w('np.svc.gitAddressBad'), field: 'oaddress' };
      const t = linkTarget(s);
      if (!t) return { text: w('np.link.pickProblem'), field: 'olink' };
      if (!t.address) { const si = signedIn(linkRec(s), d.runsOn); if (!si || si.expired) return { text: w('np.link.problem', { service: t.service }), field: 'osignin' }; }
      const c = linkCheck(s);
      if (!c || c.state === 'working') return { text: w('np.link.checkProblem'), field: 'olink', wait: true };
      if (c.state === 'failed') return { text: c.result.fail === 'gone' ? w('np.link.gone', { project: t.project || t.address, service: t.service || 'that server' }) : w('np.link.mismatch', { project: t.project }), field: 'olink' };
      if (m === 'link' && o.remoteName) { const rp = R().remoteProblem(o.remoteName, []); if (rp) return { text: rp, field: 'remoteName' }; }
      return null;
    }
    // make / instead: the service, its kind and address, a sign-in, then the name and who can see it
    const svc = R().service(o.service); if (!svc) return { text: 'Choose where it lives', field: 'osvc' };
    const kd = R().kind(o.service, o.kind);
    if (kd.address) {
      if (!o.address) return { text: 'Type the server’s address', field: 'oaddress' };
      if (!addrOk(o.address)) return { text: w('np.svc.addressBad'), field: 'oaddress' };
      const c = serverCheck(s, o.service, kd.id, o.address); if (c.state === 'working') return { text: 'Checking the address…', field: 'oaddress', wait: true };
      if (c.state === 'failed') return { text: w('np.svc.addressNone', { address: o.address }), field: 'oaddress' };
    }
    const rec = onlineRec(s), si = signedIn(rec, d.runsOn);
    if (!si || si.expired) return { text: w('np.signin.problem', { service: svc.name }), field: 'osignin' };
    const owner = ownerOf(s, rec);
    if (!owner) return { text: w('np.details.ownerFirst'), field: 'oowner' };
    if (R().projectNoun(o.service, kd.id) && !projectOf(s, owner)) return { text: o.service === 'azure' ? 'Choose the team project first.' : 'Choose the Bitbucket project first.', field: 'oproject' };
    const n = nameCheck(s);
    if (!n || n.state === 'working') return { text: w('np.details.checking'), field: 'oname', wait: true };
    if (n.result.bad) return { text: n.result.bad, field: 'oname' };
    if (o.branch && R().branchProblem(o.branch)) return { text: R().branchProblem(o.branch), field: 'obranch' };
    if (m === 'instead' && o.remoteName) { const rp = R().remoteProblem(o.remoteName, ['origin']); if (rp) return { text: rp, field: 'remoteName' }; }
    return null;
  }
  function state(s, id) {
    if (s.ui.open === id) return 'open';
    const p = problem(s, id);
    if (!p) return 'done';
    return p.blocked ? 'blocked' : 'todo';
  }
  function firstNotDone(s, after) {
    const list = sections(s), i = after ? list.indexOf(after) : -1;
    const order = list.slice(i + 1).concat(list.slice(0, i + 1));
    return order.find((id) => id !== after && problem(s, id)) || null;
  }
  /* entering the guided page: the first section that isn't done opens; all done, none opens */
  /* (from a chat, its own section opens first: the person sees what is being made and the other choice, NOPROJECT 7.2) */
  function enter(s) { if (!s.ui.entered) { s.ui.entered = true; s.ui.open = s.d.way === 'chat' ? 'chat' : firstNotDone(s) || null; } }
  function open(s, id) { s.ui.open = id; s.ui.err[id] = null; s.changed(); }
  function fold(s) { s.ui.open = null; s.changed(); }
  /* Continue: a problem stays open and names the field; otherwise the next section that isn't done opens */
  function cont(s, id) {
    const p = problem(s, id);
    if (p && !p.blocked) { s.ui.err[id] = p; s.changed(); return p; }
    s.ui.err[id] = null;
    s.ui.open = firstNotDone(s, id) || null;
    s.changed();
    return null;
  }
  const allDone = (s) => sections(s).every((id) => !problem(s, id));
  const firstProblem = (s) => { for (const id of sections(s)) { const p = problem(s, id); if (p) return Object.assign({ section: id }, p); } return null; };

  /* the one-line answer of a finished section */
  function summary(s, id) {
    const d = s.d;
    switch (id) {
      case 'start': return d.start === 'basics' ? w('np.sum.start.basics') : d.start === 'empty' ? w('np.sum.start.empty') : w('np.sum.start.starter', { starter: (ENV.starters.find((x) => 'starter:' + x.id === d.start) || {}).name });
      case 'folder': return d.folder.path ? w('np.sum.folder', { path: d.folder.path, computer: comp(d.runsOn).name }) : '';
      case 'device': { const route = { ssh: 'SSH', smb: 'SMB', nfs: 'NFS', mounted: 'a connected drive' }[d.device.method]; return d.device.path ? w('np.sum.device', { path: d.device.path, device: holderName(s), route }) : ''; }
      case 'source': return d.src.service === 'git' ? w('np.svc.gitAddress') : w('np.sum.source', { service: R().kind(d.src.service, d.src.kind).label, address: R().kind(d.src.service, d.src.kind).address ? d.src.address : '' });
      case 'find': {
        if (d.src.service === 'git') return d.src.gitAddress;
        const it = intentOf(s), p = d.find.project;
        return it === 'contribute' ? w('np.sum.find.contribute', { project: p }) : it === 'copy' ? w('np.sum.find.copy', { project: p }) : it === 'offer' ? w('np.sum.find.offer', { project: p }) : it === 'direct' ? w('np.sum.find.direct', { project: p }) : w('np.sum.find.yours', { project: p });
      }
      case 'restore': { const src = restoreSource(s); return d.restore.pick ? w('np.sum.restore', { project: d.restore.pick, where: restoreWhere(s), when: (src && src.latest) || 'the latest' }) : ''; }
      case 'chat': { const c = chatOf(d.chat.id), f = chatFiles(s); return c ? w('np.sum.chat', { chat: c.title, files: { move: 'move ' + chatPicked(s).length + ' of ' + (c.fileList || []).length + ' files', useFolder: 'its folder is the Project', worked: 'use ' + (c.workedIn || {}).path, empty: 'start empty' }[f] }) : ''; }
      case 'where': { const fp = fullPath(s); return w('np.sum.where', { name: nameOf(s), path: fp || '', computer: comp(d.runsOn).name }); }
      case 'like': {
        const p = likeSrc(s); if (!p) return w('np.sum.like.usual');
        const c = likeCounts(s), plus = d.like.accounts ? w('np.sum.like.plus') : '';
        const partial = c.own !== c.ownAll || c.things !== c.thingsAll || d.like.fixed || d.like.fromComputer;
        const own = plural(c.ownAll, 'setting') + (c.thingsAll ? ' and ' + plural(c.thingsAll, 'thing') : '');
        return partial ? w('np.sum.like.partial', { project: p.name, picked: c.own + ' of ' + c.ownAll + ' settings' + (c.thingsAll ? ' and ' + c.things + ' of ' + c.thingsAll + ' things' : ''), plus }) : w('np.sum.like.source', { project: p.name, own, plus });
      }
      case 'versions': { const k = histKeeps(s); const kind = k === 'restored' ? 'Comes back with its ' + kindWord(restoredHist(s).backend) + ' history' : k ? 'Keeps its ' + kindWord(k) + ' history' : d.history === 'jujutsu' ? 'Jujutsu' : 'Git'; return w('np.sum.ver', { kind, off: d.filesafe ? '' : w('np.sum.verOff') }); }
      case 'online': return onlineLine(s);
      case 'backup': { const b = d.backup; if (b.dest === 'none') return w('np.bk.none'); return b.mode === 'manual' ? w('np.bk.sum.manual', { dest: bkDestLabel(s) }) : w('np.bk.sum.daily', { dest: bkDestLabel(s), time: b.time }); }
      default: return '';
    }
  }
  function onlineLine(s, long) {
    const d = s.d, m = onlineMode(s), o = d.online;
    if (m === 'from') {
      const it = intentOf(s), p = d.find.project, svcName = R().service(d.src.service) ? R().service(d.src.service).name : '';
      if (d.src.service === 'git') return w('np.online.plain', { address: d.src.gitAddress });
      if (it === 'contribute') { const a = accessDone(s); return a && a.fork ? w('np.rv.forkSays', { fork: a.fork, service: svcName }).replace('This makes', 'Uses') : 'Your fork ' + forkOwner(s) + '/' + forkName(s) + ' · original ' + p; }
      if (it === 'copy') return w('np.online.readOnly', { project: p });
      if (it === 'offer') return p + ' · your change on ' + d.find.branch;
      return w('np.online.from', { service: svcName, project: p });
    }
    if (m === 'none') return w('np.online.notNow');
    if (m === 'leave') return 'Left unlinked';
    if (m === 'link_found' || m === 'again' || m === 'link') {
      const t = linkTarget(s), c = linkCheck(s), ok = c && c.state === 'done';
      if (!t) return w('np.sec.notChosen');
      if (t.address) return 'Linked: a Git address · ' + t.address + (ok ? ' · checked' : '');
      return 'Linked: ' + t.service + ' · ' + t.project + (ok ? ' · checked' : ' · sign in to check it');
    }
    const svc = R().service(o.service), rec = onlineRec(s), owner = ownerOf(s, rec), v = visOf(s, rec, owner, projectOf(s, owner));
    if (!svc) return w('np.sec.notChosen');
    return 'New on ' + (svc.id === 'github' ? 'GitHub' : R().kind(o.service, o.kind).label) + ': ' + (owner ? owner.label : '…') + '/' + onlineName(s) + (v.v ? ' · ' + v.v.title : '');
  }

  /* ------------------------------------------------------------------ the Review (6.11) */
  function begins(s) {
    const d = s.d;
    switch (d.way) {
      case 'new': return 'A new Project, ' + lc(summary(s, 'start'));
      case 'folder': return d.folder.path ? 'Folder ' + d.folder.path : null;
      case 'device': return d.device.path ? 'Files on ' + holderName(s) : null;
      case 'online': {
        if (d.src.service === 'git') return d.src.gitAddress ? d.src.gitAddress + ' from a Git address' : null;
        if (!d.find.project) return null;
        const it = intentOf(s), svcName = R().service(d.src.service).name;
        return it === 'contribute' ? 'Your fork of ' + d.find.project : it === 'copy' ? d.find.project + ', just a copy' : d.find.project + ' from ' + svcName;
      }
      case 'restore': return d.restore.pick ? 'Backup of ' + d.restore.pick + ' from ' + restoreWhere(s) : null;
      case 'chat': { const c = chatOf(d.chat.id); return c ? 'From your chat “' + c.title + '”' : null; }
      default: return null;
    }
  }
  function review(s) {
    const d = s.d, NOT = w('np.sec.notChosen'), named = !!String(nameOf(s) || '').trim();
    const row = (k, v, sec, more) => Object.assign({ k, v: v || NOT, sec }, more || {}, { open: !v || !!(more && more.open) });
    const c = chatOf(d.chat.id);
    const project = [row(w('np.rv.name'), named && !nameProblem(s) ? nameOf(s) : null, 'where', { field: 'name' }), row(w('np.rv.begins'), begins(s), sections(s)[0])];
    if (d.way === 'chat' && c) project.push(row(w('np.rv.chat'), w('np.rv.chatLine', { chat: c.title }), 'chat'));
    if (d.way !== 'restore') { const p = likeSrc(s), k = p && likeCounts(s); project.push(row(w('np.rv.like'), p ? 'Like ' + p.name + ': ' + plural(k.own, 'setting') + (k.things ? ', ' + plural(k.things, 'thing') : '') + (k.accounts ? ', ' + plural(k.accounts, 'AI account') : '') + (k.headers ? ', ' + plural(k.headers, 'sign-in header') : '') + (k.files ? ', ' + plural(k.files, 'of its own files', 'of its own files') : '') : w('np.sum.like.usual'), 'like')); }
    if (d.way === 'chat' && c) {
      if (chatFiles(s) === 'move') project.push(row('Files', w('cv.pickN', { k: chatPicked(s).length, n: (c.fileList || []).length }), 'chat', { field: 'chatPick' }));
      if (c.outside.length || c.folders.length) project.push(row('Stays behind', w('np.rv.chatStays', { outside: andList(c.outside), folders: andList(c.folders) }).replace(/^Stays behind: /, ''), 'chat'));
      project.push(row('Undo', w('cv.undo', { until: untilWord() }), 'chat'));
    }
    const fp = fullPath(s), r = placeRoot(s);
    const def = PJX.work ? PJX.work.npDef(s) : d.runsOn;
    const loc = [row(w('np.rv.runsOn'), comp(def).name + (def === 'here' ? ' (' + comp('here').detail + ')' : ''), 'where', { field: 'wk:np:def' }),
      row(w('wk.rv.choice'), PJX.work ? PJX.work.npChoice(s) : 'Auto', 'where', { field: 'wk:np:mode' }),
      row(w('wk.rv.allowed'), PJX.work ? andList(PJX.work.npAllowed(s).map((x) => comp(x).name)) : null, 'where', { field: 'wk:np:allow' }),
      row(w('wk.rv.home'), comp(d.runsOn).name, 'where', { field: 'runsOn' }),
      row(w('np.rv.files'), fp && (named || filesStay(s)) ? fp + (holderName(s) && holderName(s) !== comp(d.runsOn).name ? ' on ' + holderName(s) : '') : null, 'where', { field: 'files', code: true })];
    // the room is the chosen place's: shown once the place is (never beside "Not chosen yet")
    if (!filesStay(s) && r && fp && named) loc.push(row(w('np.rv.room'), r.free ? w('np.loc.free', { free: r.free }) : null, 'where'));
    const k = histKeeps(s), lim = d.history === 'jujutsu' ? histLimits(s) : [];
    const ver = k === 'restored' ? 'Comes back with its ' + kindWord(restoredHist(s).backend) + ' history' + (restoredHist(s).branch ? ' · ' + (restoredHist(s).backend === 'jujutsu' ? 'bookmark ' : '') + restoredHist(s).branch : '') : k ? 'Keeps its ' + kindWord(k) + ' history' : d.history === 'jujutsu' ? 'Jujutsu' + (lim.length ? ' · ' + andList(lim.map((x) => w('np.ver.eff.' + x))) : '') : 'Git';
    // a choice made but not finished says what is left, so the row and the closed plan below never disagree
    const op0 = problem(s, 'online'), olm = onlineMode(s);
    const ol = op0 && !/^(none|leave|from)$/.test(olm) ? (/make|instead/.test(olm) && R().service(d.online.service) ? 'New on ' + R().kind(d.online.service, d.online.kind).label + ' · ' + op0.text : null) : onlineLine(s, true);
    const bk = d.backup.dest === 'none' ? w('np.bk.none') : problem(s, 'backup') ? null : w('np.rv.bkLine', { place: bkPlace(s), when: d.backup.mode === 'manual' ? 'when you click Back up now' : 'every day at ' + d.backup.time });
    const safe = [row(w('np.rv.ver'), ver, 'versions'), row(w('np.rv.filesafe'), d.filesafe ? 'On' : 'Off', 'versions'), row(w('np.rv.online'), ol, 'online', { field: 'omode', open: !!(op0 && ol && !/^(none|leave|from)$/.test(olm)) }), row(w('np.rv.bk'), bk, 'backup')];
    const groups = [{ id: 'project', label: w('np.rv.project'), rows: project }, { id: 'loc', label: w('np.rv.loc'), rows: loc }, { id: 'safe', label: w('np.rv.safe'), rows: safe }];
    if (/make|instead/.test(onlineMode(s))) {
      const o = d.online, rec = onlineRec(s), owner = ownerOf(s, rec), pj = projectOf(s, owner), v = visOf(s, rec, owner, pj), si = signedIn(rec, d.runsOn);
      groups.push({ id: 'plan', label: w('np.rv.plan'), closed: true, rows: [
        row(w('np.rv.plan.service'), R().kind(o.service, o.kind).label, 'online'), row(w('np.rv.plan.address'), rec ? rec.address : null, 'online'),
        row(w('np.rv.plan.account'), si && !si.expired ? si.account : null, 'online'), row(w('np.rv.plan.name'), onlineName(s), 'online'),
        row(w('np.rv.plan.owner'), owner ? owner.label : null, 'online'), R().projectNoun(o.service, onlineKind(s)) ? row(w('np.rv.plan.project'), pj ? pj.label : null, 'online') : null,
        row(w('np.rv.plan.vis'), v.opts.length ? (v.v ? v.v.title : null) : w('np.details.azurePrivacy'), 'online'), row(w('np.rv.plan.branch'), o.branch || 'main', 'online'),
        row(w('np.rv.plan.start'), d.way === 'new' ? summary(s, 'start') : w('np.details.startExisting'), 'online'), row(w('np.rv.plan.signin'), si ? ({ browser: 'Its sign-in page', device: 'A code', token: 'An access token' }[si.method] || 'Its sign-in page') : null, 'online')
      ].filter(Boolean) });
    }
    return groups;
  }

  /* ------------------------------------------------------------------ creating (6.12.1): the steps, each with its owner */
  function phases(s) {
    const d = s.d, out = [], m = onlineMode(s), svcName = d.src.service === 'git' ? 'the Git address' : R().service(d.src.service) ? R().service(d.src.service).name : '';
    const kind = (k) => (k === 'jujutsu' ? 'Jujutsu' : 'Git'), name = nameOf(s), fp = fullPath(s) || '';
    const add = (key, label, cmd, more) => out.push(Object.assign({ key, label, cmd }, more || {}));
    const k0 = histKeeps(s);
    // Jujutsu goes on the work computer before anything uses it (a clone, a bookmark, a push)
    if (d.history === 'jujutsu' && !k0 && !jjOn(s)) add('jj', w('np.ph.jj'), 'cmd.capability.ensure');
    if (d.way === 'online') {
      const it = intentOf(s), a = accessDone(s), fork = a && a.fork;
      if (it === 'contribute' && !fork) add('fork', w('np.ph.fork', { service: svcName }), 'cmd.forge.repository.fork', { net: true, remote: true, service: svcName });
      add('clone', w('np.ph.clone', { project: it === 'contribute' ? (fork || forkOwner(s) + '/' + forkName(s)) : (d.src.service === 'git' ? d.src.gitAddress : d.find.project), kind: kind(d.history) }), d.history === 'jujutsu' ? 'cmd.jujutsu.git.clone' : 'cmd.source_control.repository.clone', { net: true, service: svcName });
      if (it === 'contribute') add('upstream', w('np.ph.upstream', { upstream: d.fork.upstreamName }), 'gap:add remote');
      // (GUIDED-FLOWS 2.28) the look from the service was partial: the copy is looked inside on its Computer before listing
      add('inspect', w('np.ph.inspect', { computer: comp(d.runsOn).name }), 'cmd.source_control.backend.detect + new:inspection (after the copy)');
      if (it === 'contribute' || it === 'offer') add('branch', w('np.ph.branch', { branch: d.find.branch }), d.history === 'jujutsu' ? 'cmd.jujutsu.bookmark.create' : 'cmd.source_control.branch.create');
    }
    if (d.way === 'folder') add('again', w('np.ph.folderAgain', { path: d.folder.path }), 'cmd.project.source_location.test');
    if (d.way === 'device') add('device', w('np.ph.device', { device: holderName(s) }), 'cmd.project.source_location.test', { net: true, service: holderName(s) });
    if (d.way === 'restore') {
      add('rget', w('np.ph.rGet'), 'cmd.restore.preview', { net: d.restore.from !== 'folder', service: restoreWhere(s) }); add('rcheck', w('np.ph.rCheck'), 'cmd.restore.preview');
      add('rput', w('np.ph.rPut', { project: d.restore.pick, name }), 'cmd.restore.project_as_new');
    }
    const newFolder = d.way === 'new' || (d.way === 'chat' && /move|empty/.test(chatFiles(s)));
    if (newFolder) add('local', w('np.ph.newLocal', { path: fp }), 'cmd.project.new_local');
    if (d.way === 'new') { if (d.start === 'basics') add('basics', w('np.ph.basics'), 'new:basics without an online copy'); else if (/^starter:/.test(d.start)) add('starter', w('np.ph.starter', { starter: summary(s, 'start').replace(/ starter$/, '') }), 'cmd.project_template.create_project (gap: file set, G11)'); }
    if (d.way === 'chat' && chatFiles(s) === 'move') add('chatfiles', w('np.ph.chatFiles', { n: chatPicked(s).length, path: fp }), 'gap:thread files move');
    const k = k0;
    if (d.way !== 'online' && d.way !== 'restore') add('hist', k ? w('np.ph.histKeep', { kind: kind(k) }) : w('np.ph.histNew', { kind: kind(d.history) }), 'cmd.source_control.backend.select');
    if (d.way === 'restore' && !k) add('hist', w('np.ph.histNew', { kind: kind(d.history) }), 'cmd.source_control.backend.select');
    const p = likeSrc(s);
    // (3.x) the destination is checked again at the moment of the copy, then the picked settings apply
    if (p && d.way !== 'restore') { add('recheck', w('np.ph.recheck', { computer: comp(d.runsOn).name, project: p.name }), 'cmd.settings.transaction.preview (re-checked at copy time)'); add('settings', w('np.ph.settings', { project: p.name }), 'cmd.settings.transaction.apply'); if (likeCounts(s).things) add('things', w('np.ph.things'), 'gap:each owner’s copy (personas, MCP, commands)'); }
    if (/link_found|again|link/.test(m)) { const t = linkTarget(s); add('link', w('np.ph.link', { project: t ? (t.project || t.address) : '', service: t ? t.service || 'a Git address' : '' }), 'cmd.source_control.repository.bind' + (m === 'link' ? ' + gap:add remote' : ''), { net: true, service: t && t.service }); }
    if (/make|instead/.test(m)) {
      const svc = R().service(d.online.service);
      add('create', w('np.ph.create', { service: svc.name }), svc.id === 'github' ? 'cmd.project.new_github_repo' : 'cmd.forge.repository.create (gap: G1/G7)', { net: true, remote: true, service: svc.name, taken: true });
      add('send', w('np.ph.send'), d.history === 'jujutsu' ? 'cmd.jujutsu.git.push' : 'cmd.source_control.remote.publish', { net: true, service: svc.name });
    }
    const g2 = (d.way === 'online' && intentOf(s) === 'contribute') ? ' (gap: G2 fork kind)' : d.way === 'device' && d.device.method !== 'ssh' ? ' (gap: G2 ' + ({ smb: 'SMB', nfs: 'NFS', mounted: 'mounted drive' }[d.device.method]) + ' kind)' : d.way === 'folder' && volOfPath(d.folder.path) ? ' (gap: G2 mounted drive kind)' : '';
    add('add', w('np.ph.add'), d.way === 'new' || newFolder ? 'cmd.project.new_local (registers)' : 'cmd.project.add_existing' + g2);
    if (d.way === 'chat') add('chat', w('np.ph.chat', { chat: chatOf(d.chat.id).title }), 'gap:thread conversion [Depends: no-project]');
    add('check', w('np.ph.check'), 'cmd.project.refresh');
    return out;
  }

  /* run the creation. demo: { net, taken, fork, bk }. Resolves { ok, project, fail: { kind, text, section } } */
  async function commit(s, opts) {
    opts = opts || {}; const demo = opts.demo || {};
    const pr = firstProblem(s); if (pr) return { ok: false, fail: { kind: 'problem', text: pr.text, section: pr.section } };
    const list = phases(s), made = [];
    s.settled = s.settled || [];
    // a step already made in this draft (the same step, the same inputs) isn't made again (6.12.4)
    const already = (x) => s.settled.some((y) => y.key === x.key && y.label === x.label);
    let failAt = -1, failKind = null;
    if (demo.fork) { failAt = list.findIndex((x) => x.key === 'clone'); failKind = 'recovery'; }
    else if (demo.forkUnknown) { failAt = list.findIndex((x) => x.key === 'fork'); failKind = 'unknown'; }
    else if (demo.taken) { failAt = list.findIndex((x) => x.key === 'create'); failKind = 'taken'; }
    else if (demo.net) { failAt = list.findIndex((x) => x.net && !already(x)); failKind = 'net'; }
    for (let i = 0; i < list.length; i++) {
      if (already(list[i]) && i !== failAt) { if (list[i].remote) made.push(list[i]); if (opts.onPhase) opts.onPhase(i, list, 'complete', true); continue; }
      if (opts.onPhase) opts.onPhase(i, list, 'working');
      await PJX.wait(PJX.reduced() ? 160 : (list[i].net ? 950 : 600));
      if (i === failAt) {
        if (opts.onPhase) opts.onPhase(i, list, 'failed');
        // what is already done, said as done ("made the folder …, added the starting files")
        const PAST = { Making: 'made', Adding: 'added', Starting: 'started', Copying: 'copied', Linking: 'linked', Installing: 'installed', Applying: 'applied', Checking: 'checked', Picking: 'picked up', Moving: 'moved', Sending: 'sent', Connecting: 'connected to', Getting: 'got', Putting: 'put' };
        const local = s.settled.filter((x) => !x.remote).map((x) => x.label.replace(/^(\w+)/, (m0) => PAST[m0] || m0.toLowerCase()));
        const kept = local.length ? ' ' + w('np.fail.kept', { list: andList(local) }) : '';
        if (failKind === 'taken') {
          const rec = onlineRec(s), owner = ownerOf(s, rec), key = rec.key + ':' + owner.id;
          s.ui.refused[key] = (s.ui.refused[key] || []).concat([lc(onlineName(s))]);
          return { ok: false, fail: { kind: 'taken', text: w('np.fail.taken', { service: R().service(s.d.online.service).name, project: owner.label + '/' + onlineName(s) }) + kept, section: 'online', service: R().service(s.d.online.service).name, kept: local } };
        }
        // (GUIDED-FLOWS 6.06) the service didn't answer while making the fork: whether it exists is unknown, so the setup is
        // kept for recovery and checked on the service before anything is tried again; nothing is deleted
        if (failKind === 'unknown') {
          const p = makeProject(s, 'recovery'), svc = list[i].service, fk = forkOwner(s) + '/' + forkName(s);
          p.recovery = { settled: [], unknown: { label: w('np.fail.forkUnknownStep', { service: svc }), ref: fk, service: svc, step: { label: list[i].label, cmd: list[i].cmd } }, remaining: list.slice(i + 1).map((x) => ({ label: x.label, cmd: x.cmd })) };
          p.online = Object.assign({}, p.online, { repo: d0fork(s, fk), note: 'Not checked yet' });
          p.attention = [{ code: 'setup_unfinished', key: 'waiting', title: 'Setup didn’t finish', text: w('np.fail.forkUnknown', { fork: fk, service: svc }), actions: ['resume', 'remove'] }];
          p.activity = { key: 'waiting', word: 'Setup didn’t finish', text: 'Stopped at step ' + (i + 1) + ' of ' + list.length, at: 'just now', runs: 0 };
          PJX.ACT.add(p);
          return { ok: false, project: p, fail: { kind: 'recovery' } };
        }
        if (failKind === 'net' && !made.length) return { ok: false, fail: { kind: 'net', text: (local.length ? w('np.fail.netPart', { service: list[i].service || 'the service' }) : w('np.fail.net', { service: list[i].service || 'the service' })) + kept, section: sections(s)[0], kept: local } };
        // something was made remotely, then a later step failed: listed as recovery, with Continue setup (6.12.4 C)
        const p = makeProject(s, 'recovery');
        const first = made[0] || list[0];
        p.recovery = { settled: made.map((x) => ({ label: x.key === 'fork' ? 'Made your fork on ' + x.service : 'Made the online copy on ' + x.service, ref: x.key === 'fork' ? forkOwner(s) + '/' + forkName(s) : p.online.repo })), remaining: list.slice(i).map((x) => ({ label: x.label, cmd: x.cmd })) };
        const ref = p.recovery.settled[0] ? p.recovery.settled[0].ref : '';
        p.attention = [{ code: 'setup_unfinished', key: 'waiting', title: 'Setup didn’t finish', text: (first.key === 'fork' ? w('np.fail.recoveryFork', { project: ref, service: first.service }) : w('np.fail.recovery', { project: ref, service: first.service })) + ' Continue setup does only what is left.', actions: ['resume', 'open_online', 'remove'] }];
        p.activity = { key: 'waiting', word: 'Setup didn’t finish', text: 'Stopped at step ' + (i + 1) + ' of ' + list.length, at: 'just now', runs: 0 };
        if (first.key === 'fork') F().forks[s.d.find.project] = forkOwner(s) + '/' + forkName(s);
        PJX.ACT.add(p);
        return { ok: false, project: p, fail: { kind: 'recovery' } };
      }
      if (list[i].remote) made.push(list[i]);
      s.settled.push({ key: list[i].key, label: list[i].label, remote: !!list[i].remote });
      if (opts.onPhase) opts.onPhase(i, list, 'complete');
    }
    const p = makeProject(s, 'listed', demo);
    if (s.d.way === 'online' && intentOf(s) === 'contribute' && !(accessDone(s) || {}).fork) F().forks[s.d.find.project] = p.online.repo;
    if (s.d.way === 'chat' && s.d.chat.id) { F().converted = F().converted || {}; F().converted[s.d.chat.id] = p.id; }
    PJX.ACT.add(p);
    return { ok: true, project: p };
  }
  const d0fork = (s, fk) => fk;
  /* the Project the reviewed draft becomes */
  function makeProject(s, lifecycle, demo) {
    const d = s.d, name = String(nameOf(s)).trim(), listed = lifecycle === 'listed', info = lookDone(s), fp = fullPath(s);
    const slugId = R().idSlug(name) || 'project';
    let where;
    const vf = d.way === 'folder' && d.runsOn === 'here' ? volOfPath(d.folder.path) : null;
    if (d.way === 'folder') where = d.runsOn !== 'here' ? { kind: 'device', label: comp(d.runsOn).name, path: d.folder.path, device: comp(d.runsOn).name, via: 'Puppet Master' } : vf && vf.device ? { kind: 'device', label: 'Home NAS', path: full(d.folder.path), device: 'Home NAS', via: 'a connected drive' } : { kind: 'local', label: 'This computer', path: d.folder.path };
    else if (d.way === 'device') {
      const hn = holderName(s), via = { ssh: d.runsOn === 'homenas' ? 'SSH from Home NAS' : 'SSH', smb: 'SMB', nfs: 'NFS', mounted: 'a connected drive' }[d.device.method];
      where = hn === 'This computer' ? { kind: 'local', label: 'This computer', path: d.device.path } : { kind: 'device', label: hn, path: d.device.path, device: hn, via };
    } else if (filesStay(s)) where = { kind: 'local', label: 'This computer', path: (lookTarget(s) || {}).path || fp };
    else {
      const m = filesMode(s), n = netPlace(s);
      const r0 = placeRoot(s);
      if (m === 'with_server') where = { kind: 'device', label: 'Home NAS', path: fp, device: 'Home NAS', via: 'Puppet Master' };
      else if (m === 'network' && n && n.holder !== 'This computer') where = { kind: 'device', label: n.holder, path: fp, device: n.holder, via: n.route === 'drive' ? 'a connected drive' : n.route };
      else if (m === 'custom' && r0 && r0.vol && r0.vol.device) where = { kind: 'device', label: 'Home NAS', path: fp, device: 'Home NAS', via: 'a connected drive' };
      // files on this computer that the Server reaches over the network (files.mode this_computer): Home NAS can reach them
      else where = Object.assign({ kind: 'local', label: 'This computer', path: fp.replace(HOME, '~') }, m === 'this_computer' ? { reach: ['homenas'] } : {});
    }
    if (!listed) where.pending = true;
    const k = histKeeps(s), rh = d.way === 'restore' ? restoredHist(s) : null, backend = k === 'restored' ? rh.backend : k || d.history;
    const m = onlineMode(s), it0 = d.way === 'online' ? intentOf(s) : null;
    // the branch work goes on: the folder's own, the restored one, the new online copy's main branch, or your change's
    const branch = d.way === 'restore' && rh && rh.branch ? rh.branch : info && info.branch ? info.branch : it0 === 'contribute' || it0 === 'offer' ? d.find.branch : /make|instead/.test(m) && d.online.branch ? d.online.branch : 'main';
    let online = { service: null, repo: null, state: 'off', ahead: 0, behind: 0 };
    if (m === 'from') {
      const it = intentOf(s), svcName = d.src.service === 'git' ? 'Git address' : R().service(d.src.service).name, a = accessDone(s) || {};
      const rec0 = srcRec(s), r0 = repoOf(s) || {}, ident = rec0 ? { kind: rec0.kind, kindLabel: R().kind(d.src.service, d.src.kind).label, host: rec0.host, address: rec0.address } : {};
      if (d.src.service === 'git') online = { service: 'Git address', repo: d.src.gitAddress, state: 'complete', ahead: 0, behind: 0, note: 'Copies and sends only', url: d.src.gitAddress, privacy: null };
      else if (it === 'contribute') online = Object.assign({ service: svcName, repo: a.fork || forkOwner(s) + '/' + forkName(s), state: 'complete', ahead: 0, behind: 0, privacy: 'Everyone', note: 'Your fork', upstream: { service: svcName, repo: d.find.project, behind: 0, branch: d.find.branch, remote: d.fork.upstreamName } }, ident);
      else if (it === 'copy') online = Object.assign({ service: svcName, repo: d.find.project, state: 'complete', ahead: 0, behind: 0, privacy: visWord(r0.vis, r0.owner) || 'Everyone', note: 'Read only', readOnly: true }, ident);
      else online = Object.assign({ service: svcName, repo: d.find.project, state: 'complete', ahead: 0, behind: 0, privacy: visWord(r0.vis, r0.owner), note: 'Up to date', branch: it === 'offer' ? d.find.branch : null, team: it === 'offer', container: r0.project || null }, ident);
    } else if (/link_found|again|link/.test(m)) {
      const t = linkTarget(s) || {}, c = linkCheck(s), lr = linkRec(s);
      online = { service: t.address ? 'Git address' : t.service, repo: t.project || t.address, state: 'complete', ahead: 0, behind: 0, privacy: c && c.state === 'done' ? c.result.vis || null : null, note: 'Up to date',
        kind: lr ? lr.kind : null, host: lr ? lr.host : null, address: lr ? lr.address : t.address || null, remote: t.remote || (d.online.remoteName || null) };
    } else if (/make|instead/.test(m)) {
      const rec = onlineRec(s), owner = ownerOf(s, rec), pj = projectOf(s, owner), v = visOf(s, rec, owner, pj), svc = R().service(d.online.service), kd = R().kind(d.online.service, d.online.kind);
      const ownerPath = owner ? owner.label.replace(/ \/ /g, '/') : 'jared', team = R().projectNoun(d.online.service, kd.id) === 'teamProject';
      // the whole identity: the service and its kind, the server, the owner, the team project or project, the name
      const repo = [ownerPath, team && pj ? pj.id : null, onlineName(s)].filter(Boolean).join('/');
      const url = rec.address.replace(/\/+$/, '') + '/' + (team && pj ? ownerPath + '/' + pj.id + '/_git/' + onlineName(s) : ownerPath + '/' + R().slug(onlineName(s)));
      online = { service: svc.name, kind: kd.id, kindLabel: kd.label, host: rec.host, address: rec.address, owner: owner ? owner.id : null, container: pj ? pj.label : null, containerNoun: pj ? (team ? 'Team project' : 'Project') : null, repo, url,
        branch: d.online.branch || 'main', description: String(d.online.description || '').trim() || null, state: 'complete', ahead: 0, behind: 0, privacy: v.v ? v.v.title : 'Follows its project', note: listed ? 'Up to date' : 'Created online' };
    } else if (m === 'leave' && info && info.online) online.found = { service: info.online.service || 'Git address', repo: info.online.repo || info.online.address, remote: info.online.remote };
    let backup = { dest: null, state: 'off', versions: 0 };
    if (d.backup.dest !== 'none') {
      const fam = bkFamily(s);
      const acc = d.backup.acc || {}, locator = {};
      Object.keys(acc).forEach((k) => { if (!/Typed$/.test(k) && k !== 'temp' && typeof acc[k] === 'string') locator[k] = acc[k]; });
      backup = { dest: R().FAMILIES[fam].label, family: fam, place: bkPlace(s), include: d.backup.include, leaveOut: d.backup.include === 'some' ? Object.keys(d.backup.leaveOut).filter((k) => d.backup.leaveOut[k]) : [], mode: d.backup.mode, time: d.backup.time, keep: d.backup.keep, keepCustom: d.backup.keep === 'custom' ? Object.assign({}, d.backup.keepCustom) : null, locator,
        schedule: d.backup.mode === 'manual' ? 'When you click Back up now' : 'Every day', state: listed ? 'setup' : 'pending', last: null, versions: 0, kit: null, note: listed ? null : 'Starts after setup',
        setup: listed ? { steps: ['todo', 'todo', 'todo', 'todo', 'todo'], fail: !!(demo && demo.bk), open: true, access: d.backup.dest === 'bucket' || d.backup.dest === 'server' } : null };
    }
    const src = likeSrc(s), counts = src && likeCounts(s);
    const startFiles = d.way === 'new' ? (d.start === 'basics' ? Object.assign({ kind: 'basics' }, d.basics) : { kind: d.start }) : null;
    const c = chatOf(d.chat.id);
    const glyph = { new: 'seed', folder: 'folder', online: 'cloud', device: 'server', restore: 'history', chat: 'chat' }[d.way] || 'seed';
    const inside0 = d.way === 'online' ? (inside(s) || {}).result || {} : info || {};
    return {
      id: slugId + '-' + PJX.uid('n').split('-').pop(), name, glyph, active: false, lifecycle, order: PJX.all().length, runsOn: PJX.work ? PJX.work.npDef(s) : d.runsOn,
      home: d.runsOn, work: { mode: (d.work && d.work.mode) || 'auto', by: d.work && d.work.mode === 'chosen' ? 'Jared' : null, allowed: PJX.work ? PJX.work.npAllowed(s) : [d.runsOn] }, workers: [],
      stack: (info && info.stack) || [], where, opened: 'Just added', openedRank: -0.5,
      activity: listed ? { key: 'idle', word: 'Ready', text: d.way === 'restore' ? 'Restored from a backup · plan or open it' : 'Ready to plan in the Planning Wizard', at: 'just now', runs: 0 } : { key: 'waiting', word: 'Setup didn’t finish', text: '', at: 'just now', runs: 0 },
      history: { backend, branch, defaultBranch: it0 === 'contribute' || it0 === 'offer' ? 'main' : null, worktrees: listed ? 1 : 0, changed: (info && info.changed) || 0, submodules: inside0.submodules || null, lfs: inside0.lfs || null, hooks: inside0.hooks || null, filesafe: d.filesafe },
      startFiles,
      online, backup, sync: { devices: listed ? 2 : 0, state: listed ? 'complete' : 'pending' }, attention: [], fresh: true,
      copied: src ? { from: src.name, settings: counts.own, things: counts.things, accounts: counts.accounts, headers: counts.headers, files: counts.files, sel: counts.sel } : null,
      needsSignin: listed ? needsAfter(s) : 0,
      fromChat: d.way === 'chat' && c ? c.title : null,
      fromChatRec: d.way === 'chat' && c ? { chat: c.id, title: c.title, at: nowWord(), untilTs: untilTs(), until: untilWord(), ended: null, files: chatFiles(s) === 'move' ? chatPicked(s) : [], held: (c.goals || []).map((g) => g.title).concat((c.schedules || []).map((x) => x.title)) } : null
    };
  }

  /* the draft read as onboarding's setup plan, for the verification read-out (spec 7) */
  function toPlan(s) {
    const d = s.d, m = onlineMode(s), rec = /make|instead/.test(m) || m === 'link' ? (d.online.service === 'git' ? null : onlineRec(s)) : /link_found|again/.test(m) ? linkRec(s) : m === 'from' ? srcRec(s) : null;
    const sel = likeSrc(s) ? likeSel(s) : null, lt = /link/.test(m) || m === 'again' ? linkTarget(s) : null;
    return {
      project_mode: { new: 'new', chat: 'new', folder: 'existing_local', device: 'existing_local', online: 'existing_online', restore: 'restore' }[d.way] || null,
      project_transport: d.way === 'device' ? ({ ssh: 'ssh', smb: 'mounted', nfs: 'mounted', mounted: 'mounted' }[d.device.method]) : d.way === 'folder' && d.runsOn === 'homenas' ? 'puppet_master' : null,
      server_mode: d.runsOn === 'here' ? 'this_device' : 'existing_server', server_ref: d.runsOn === 'here' ? null : 'homenas',
      project_name: nameOf(s), local_location: fullPath(s), storage_mode: filesMode(s) === 'network' ? 'network_location' : null,
      history_backend: histKeeps(s) === 'restored' ? restoredHist(s).backend : histKeeps(s) || d.history, filesafe: d.filesafe,
      settings_transfer: sel ? { mode: 'copy', source_project_id: sel.from, explicit_choice_setting_ids: sel.settings.concat(sel.same), keep_fixed: sel.fixed, computer_values_as_own: sel.fromComputer > 0, thing_ids: sel.things,
        account_choices: sel.accounts.map((id) => ({ id, choice: 'same' })).concat(sel.headers.map((id) => ({ id, choice: 'same', header: true }))).concat(sel.later.map((id) => ({ id, choice: 'later' }))), project_only_row_ids: sel.ownFiles, send_keys: false } : { mode: 'usual' },
      online_mode: { none: 'none', leave: 'none', make: 'new', instead: 'new', link_found: 'existing', link: 'existing', again: 'existing', from: 'existing' }[m],
      forge: rec ? rec.key.split('@')[0] : null, forge_address: rec ? rec.address : null,
      repository_ref: m === 'from' ? (d.src.service === 'git' ? d.src.gitAddress : d.find.project) : lt ? (lt.project || lt.address) : /make|instead/.test(m) && rec ? [ownerOf(s, rec) ? ownerOf(s, rec).id : null, projectOf(s, ownerOf(s, rec)) ? projectOf(s, ownerOf(s, rec)).id : null, onlineName(s)].filter(Boolean).join('/') : null,
      repository_branch: /make|instead/.test(m) ? d.online.branch || 'main' : null, repository_description: /make|instead/.test(m) ? String(d.online.description || '').trim() || null : null,
      working_branch: d.way === 'online' && /contribute|offer/.test(intentOf(s) || '') ? d.find.branch : null,
      repository_initialize_readme: /make|instead/.test(m) && d.way === 'new' ? d.start === 'basics' && d.basics.readme : null,
      backup_destination: d.backup.dest === 'none' ? null : bkFamily(s), backup_place: d.backup.dest === 'none' ? null : bkPlace(s),
      backup_include: d.backup.dest === 'none' ? null : d.backup.include, backup_leave_out: d.backup.include === 'some' ? Object.keys(d.backup.leaveOut).filter((k) => d.backup.leaveOut[k]) : [],
      backup_retention: d.backup.dest === 'none' ? null : d.backup.keep === 'custom' ? Object.assign({ kind: 'custom' }, d.backup.keepCustom) : { kind: 'standard' }, secrets_in_draft: false,
      // pm.work_placement.project_policy.v1: requested_mode chosen sends new work to default_computer; there is no other
      // Project-level Computer (a single run's pin is placement_choice, on the run)
      requested_mode: (d.work && d.work.mode) || 'auto', default_computer: PJX.work ? PJX.work.npDef(s) : d.runsOn, allowed_computers: PJX.work ? PJX.work.npAllowed(s) : [d.runsOn], records_home: d.runsOn
    };
  }

  /* ------------------------------------------------------------------ recognising a paste (5.3); first match wins */
  function detect(text) {
    const t = String(text || '').trim(); if (!t) return null;
    let m;
    const mine = (id) => ((ENV.forges['github.com'] || {}).repos || []).some((r) => lc(r.id) === lc(id));
    const pub = (id) => ENV.publicRepos.find((r) => lc(r.id) === lc(id) && r.access !== 'none');
    if ((m = /^(?:https?:\/\/)?(?:www\.)?github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(t)) || (m = /^git@github\.com:([\w.-]+\/[\w.-]+?)(?:\.git)?$/i.exec(t))) {
      const id = m[1];
      return { way: 'online', service: 'github', kind: 'com', project: id, say: mine(id) ? w('np.detect.ghMine', { project: id }) : pub(id) ? w('np.detect.ghOther', { project: id }) : w('np.detect.ghUnknown', { project: id }), tab: mine(id) ? 'yours' : 'anyone' };
    }
    if ((m = /^(?:https?:\/\/)?gitlab\.com[/:]([\w.-]+\/[\w./-]+?)(?:\.git)?\/?$/i.exec(t)) || (m = /^git@gitlab\.com:([\w.-]+\/[\w./-]+?)(?:\.git)?$/i.exec(t))) return { way: 'online', service: 'gitlab', kind: 'com', project: m[1], say: w('np.detect.gitlab', { project: m[1] }), tab: 'yours' };
    if ((m = /^(?:https?:\/\/)?bitbucket\.org[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(t))) return { way: 'online', service: 'bitbucket', kind: 'cloud', project: m[1], say: w('np.detect.bitbucket', { project: m[1] }), tab: 'yours' };
    if ((m = /^(?:https?:\/\/)?dev\.azure\.com\/([\w.-]+)\/([\w. -]+)\/_git\/([\w.-]+)\/?$/i.exec(t))) { const id = m[1] + '/' + m[2] + '/' + m[3]; return { way: 'online', service: 'azure', kind: 'services', project: id, say: w('np.detect.azure', { project: m[1] + ' / ' + m[2] + ' / ' + m[3] }), tab: 'yours' }; }
    if ((m = /^(https:\/\/git\.home\.arpa)\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/i.exec(t))) return { way: 'online', service: 'forgejo', kind: 'own', address: m[1], project: m[2], say: w('np.detect.forgejo', { host: 'git.home.arpa', project: m[2] }), tab: 'yours' };
    if (/^(https?:\/\/\S+\.git|git@[\w.-]+:\S+|ssh:\/\/git@\S+)$/i.test(t)) return { way: 'online', service: 'git', gitAddress: t, say: w('np.detect.git') };
    // host:/absolute/path with no user is an NFS share (spec 5.3); user@host:path, host:~/path and ssh:// are SSH
    if ((m = /^([\w-]+\.local):(\/\S+)$/.exec(t))) { const sh = ENV.shares.find((x) => x.kind === 'nfs' && x.address === t); return { way: 'device', method: 'nfs', share: sh ? sh.id : 'typed', typed: t, say: w('np.detect.nfs', { device: sh ? dev(sh.device).name : m[1] }) }; }
    if ((m = /^(?:ssh:\/\/)?(?:([\w.-]+)@)?([\w-]+\.local)(?::|\/)(.+)$/.exec(t))) {
      const host = m[2], d0 = ENV.devices.concat(ENV.found).find((x) => x.address === host);
      const path = /^~|^\//.test(m[3]) ? m[3] : '/' + m[3];
      if (d0) return { way: 'device', method: 'ssh', device: d0.id, path, user: m[1] || '', say: w('np.detect.ssh', { device: d0.name }) };
    }
    if ((m = /^(?:smb:)?\/\/([\w.-]+)\/(\S+)$/i.exec(t))) { const sh = ENV.shares.find((x) => x.kind === 'smb' && x.address === '//' + m[1] + '/' + m[2].replace(/\/+$/, '')); return { way: 'device', method: 'smb', share: sh ? sh.id : 'typed', typed: '//' + m[1] + '/' + m[2], say: w('np.detect.smb', { device: sh ? dev(sh.device).name : m[1] }) }; }
    if (/\.pmkit$/i.test(t) || /recovery[ -]?kit/i.test(t)) return { way: 'restore', from: 'kit', say: w('np.detect.kit') };
    if (/^(~|\/|[a-z]:\\)/i.test(t)) return { way: 'folder', path: t.replace(/\/+$/, '').replace(/^\/Users\/jared/, '~'), say: w('np.detect.folder') };
    return null;
  }
  function applyDetected(s, x) {
    const d = s.d;
    chooseWay(s, x.way, true);
    if (x.way === 'online') {
      if (x.service === 'git') { d.src.service = 'git'; d.src.gitAddress = x.gitAddress; }
      else { d.src.service = x.service; d.src.kind = x.kind; if (x.address) d.src.address = x.address; d.find.tab = x.tab || null; if (x.tab === 'anyone') { d.find.anyQ = x.project; d.find.anyAsked = x.project; } d.find.project = x.project; }
    } else if (x.way === 'device') {
      d.device.method = x.method;
      if (x.method === 'ssh') { d.device.id = x.device; d.device.user = x.user && x.user !== 'jared' ? x.user : ''; if (trusted(s, x.device)) d.device.path = x.path; else s.ui.pendingPath = x.path; }
      else { d.device.share = x.share; if (x.share === 'typed') d.device.typedShare = x.typed; }
    } else if (x.way === 'folder') d.folder.path = x.path;
    else if (x.way === 'restore') d.restore.from = x.from;
  }

  /* ------------------------------------------------------------------ moving a chat into a project you have (NOPROJECT 7.4 to
     7.8, N2: both conversions first-class). One draft per move; nothing moves before the named button (or, in YOLO with a
     clear destination, before the statement and preview are shown, N27); afterwards a report with Undo. [Depends: no-project] */
  function moveStart(chatId) {
    const c = chatOf(chatId); if (!c) return null;
    const m = { id: PJX.uid('mv'), chat: c.id, target: null, q: '', files: {}, chatOnly: false, place: 'draft', branch: 'chat/' + c.slug, branchTouched: false, folder: 'tools/printer', resolve: 'both', ui: { disc: {} }, L: [] };
    (c.fileList || []).forEach((f) => { m.files[f] = true; });
    m.on = (fn) => { m.L.push(fn); return m; };
    m.changed = () => m.L.slice().forEach((fn) => { try { fn(m); } catch (e) { console.error('[pjx move]', e); } });
    return m;
  }
  const moveChat = (m) => chatOf(m.chat);
  function moveOff(p) {
    if (p.where.missing) return w('np.mv.off.missing', { project: p.name });
    if ((p.attention || []).some((a) => a.code === 'device_offline')) return w('np.mv.off.offline', { device: p.where.device || 'Its computer' });
    if (p.lifecycle === 'recovery') return w('np.mv.off.recovery', { project: p.name });
    return null;
  }
  function moveTargets(m) {
    const q = lc(m.q).trim(), c = moveChat(m);
    return PJX.listed().filter((p) => p.lifecycle !== 'archived' && (!q || lc(p.name).indexOf(q) >= 0 || lc(p.where.label).indexOf(q) >= 0))
      .map((p) => ({ p, off: moveOff(p), other: (p.home || 'here') !== c.runsOn ? comp(p.home || 'here').name : null }));
  }
  const moveMark = (m, f) => ((ENV.projectFiles || {})[m.target] || {})[f] || 'new';
  const moveHist = (m) => { const p = PJX.get(m.target); return !!(p && p.history && (p.history.backend === 'git' || p.history.backend === 'jujutsu')); };
  const movePlace = (m) => (moveHist(m) ? m.place : 'folder');
  const movePicked = (m) => (m.chatOnly ? [] : (moveChat(m).fileList || []).filter((f) => m.files[f]));
  const moveSame = (m) => movePicked(m).filter((f) => moveMark(m, f) === 'same');
  const moveConflicts = (m) => (movePlace(m) === 'draft' ? [] : movePicked(m).filter((f) => moveMark(m, f) === 'different'));
  const moveMoving = (m) => movePicked(m).filter((f) => moveMark(m, f) !== 'same' && !(moveConflicts(m).indexOf(f) >= 0 && m.resolve === 'skip'));
  const moveFolder = (m) => String(m.folder || '').trim().replace(/^\/+|\/+$/g, '');
  function moveProblem(m) {
    const p = PJX.get(m.target);
    if (!p) return { text: w('np.mv.pick'), field: 'target' };
    const off = moveOff(p); if (off) return { text: off, field: 'target' };
    if (!m.chatOnly && !movePicked(m).length) return { text: w('np.mv.noFiles'), field: 'files' };
    if (!m.chatOnly && movePlace(m) === 'draft') { const b = R().branchProblem(m.branch); if (b) return { text: b, field: 'branch' }; }
    if (!m.chatOnly && (!moveFolder(m) || /[\\:*?"<>|]|\.\./.test(moveFolder(m)))) return { text: w('np.mv.folderBad'), field: 'folder' };
    return moveBlocker(m);
  }
  /* what blocks a move until it is settled (ACD-510; GUIDED-FLOWS 7.09): a waiting approval, unsaved work in the
     destination, Git without a name on the Computer that saves the draft, and a request to graft another history */
  function moveBlocker(m) {
    const c = moveChat(m), p = PJX.get(m.target); if (!p) return null;
    if (waitingApprovals(c).length) return { text: w('cv.block.approval', { chat: c.title }), field: 'approval', kind: 'approval' };
    const un = (F().unsaved || {})[p.id] || [];
    if (!m.chatOnly && un.length) return { text: w('cv.block.unsaved', { files: andList(un), project: p.name }), field: 'unsaved', kind: 'unsaved' };
    const host = p.runsOn || 'here';
    if (!m.chatOnly && moveHist(m) && (F().gitId || {})[host] === false) return { text: w('cv.block.gitid', { computer: comp(host).name }), field: 'gitid', kind: 'gitid', computer: host };
    if (!m.chatOnly && m.graft) return { text: w('cv.block.graft', { n: (c.folderHistory || {}).count || 0, project: p.name }), field: 'graft', kind: 'graft' };
    return null;
  }
  /* the plain statement (7.5): each line only when it applies */
  function moveStatement(m) {
    const c = moveChat(m), p = PJX.get(m.target); if (!p) return [];
    const picked = movePicked(m), moving = moveMoving(m), same = moveSame(m), conf = moveConflicts(m), pl = movePlace(m), fd = moveFolder(m) + '/';
    const out = [w('np.mv.s.chat', { chat: c.title, project: p.name, n: c.messages, a: c.attachments })];
    if (m.chatOnly) out.push(w('np.mv.s.noFiles', { n: (c.fileList || []).length, folder: c.folder }));
    else {
      const files = plural(moving.length, 'file');
      out.push(pl === 'draft' ? w('np.mv.s.draft', { files, project: p.name, branch: m.branch, folder: fd, jj: p.history.backend === 'jujutsu' ? w('np.mv.s.jj') : '' })
        : pl === 'main' ? w('np.mv.s.main', { files, project: p.name, folder: fd }) : w('np.mv.s.folder', { files, project: p.name, folder: fd }));
      if (same.length) out.push(w('np.mv.s.same', { list: andList(same), n: same.length }));
      if (conf.length) out.push(w('np.mv.s.conflict.' + m.resolve, { list: andList(conf), example: conf[0] }));
    }
    if ((p.home || 'here') !== c.runsOn) out.push(w('np.mv.s.computer', { project: p.name, computer: comp(p.home || 'here').name, choice: PJX.work ? PJX.work.choiceWord(p) : 'Auto' }));
    const ps = (ENV.projectSettings[p.id] || {}).own || [];
    if (ps.length) out.push(w('np.mv.s.settings', { project: p.name, label: ps[0][2], value: ps[0][4], usual: ps[0][3] }));
    const left = (c.fileList || []).length - picked.length;
    if (left || c.outside.length || c.folders.length) out.push(w('np.mv.s.stays', { left: left ? plural(left, 'file') + ' you didn’t pick (they stay in the chat folder), ' : '', outside: andList(c.outside), n: c.outside.length, folders: andList(c.folders) }));
    out.push(w('np.mv.s.undo'));
    return out;
  }
  const moveLabel = (m) => (m.chatOnly ? w('np.mv.goOnly') : w('np.mv.go'));
  function movePhases(m) {
    const c = moveChat(m), p = PJX.get(m.target), out = [], moving = moveMoving(m), pl = movePlace(m);
    const add = (key, label, cmd) => out.push({ key, label, cmd });
    if (!m.chatOnly && moving.length) {
      if (pl === 'draft') add('draft', w('np.mv.ph.draft', { branch: m.branch, project: p.name }), p.history.backend === 'jujutsu' ? 'cmd.jujutsu.bookmark.create' : 'cmd.source_control.branch.create');
      add('copy', w('np.mv.ph.copy', { n: moving.length, folder: moveFolder(m) + '/' }), 'gap:thread files move [Depends: no-project]');
      add('check', w('np.mv.ph.check'), 'gap:thread files move (verify)');
      if (pl === 'draft') add('save', w('np.mv.ph.save', { chat: c.title }), p.history.backend === 'jujutsu' ? 'cmd.jujutsu.change.describe' : 'gap:commit in a PM worktree (thread-bound merge wrapper)');
    }
    if ((p.home || 'here') !== c.runsOn) add('sync', w('np.mv.ph.sync', { computer: comp(p.home || 'here').name }), 'gap:chat-sized move through Project Sync (N20, PSB-006)');
    add('chat', w('np.mv.ph.chat', { chat: c.title, project: p.name }), 'gap:thread conversion [Depends: no-project]');
    if (!m.chatOnly && moving.length) add('tidy', w('np.mv.ph.tidy'), 'gap:thread files move (sealed old copy, 7 days)');
    return out;
  }
  async function moveCommit(m, opts) {
    opts = opts || {};
    const pr = moveProblem(m); if (pr) return { ok: false, fail: pr };
    const list = movePhases(m);
    for (let i = 0; i < list.length; i++) {
      if (opts.onPhase) opts.onPhase(i, list, 'working');
      await PJX.wait(PJX.reduced() ? 160 : 700);
      if (opts.onPhase) opts.onPhase(i, list, 'complete');
    }
    const c = moveChat(m), p = PJX.get(m.target);
    // a partial result is still a result: what moved, what stayed, what was held and what didn't move (ACD-511, 7.13)
    const moving = moveMoving(m), failed = m.demoPartial && moving.length > 1 ? [moving.indexOf('label-template.svg') >= 0 ? 'label-template.svg' : moving[moving.length - 1]] : [];
    const rec = { chat: c.id, title: c.title, into: p.id, files: moving.filter((f) => failed.indexOf(f) < 0), failed, place: movePlace(m), branch: m.branch, folder: moveFolder(m), chatOnly: m.chatOnly, computer: (p.home || 'here') !== c.runsOn ? comp(p.home || 'here').name : null, by: opts.yolo ? 'yolo' : 'you',
      at: nowWord(), untilTs: untilTs(), until: untilWord(), ended: null, stayed: (c.fileList || []).length - movePicked(m).length + c.outside.length, held: (c.goals || []).map((g) => g.title).concat((c.schedules || []).map((x) => x.title)) };
    F().moved = F().moved || {}; F().moved[c.id] = rec;
    return { ok: true, project: p, rec };
  }
  /* Undo's own statement first (7.7): what goes back, what stays because it changed, what is never deleted */
  function moveUndoStatement(rec) {
    const p = PJX.get(rec.into) || { name: rec.into };
    const lines = [w('np.mv.u.chat', { chat: rec.title })];
    if (rec.files.length) lines.push(w('np.mv.u.files', { files: plural(rec.files.length, 'file') }));
    if (rec.place === 'draft' && rec.files.length) lines.push(w('np.mv.u.draft', { branch: rec.branch }));
    if (rec.place !== 'draft' && rec.files.length) lines.push(w('np.mv.u.main', { project: p.name }));
    if (rec.computer) lines.push(w('np.mv.u.computer', { computer: rec.computer }));
    lines.push(w('np.mv.u.never'));
    return lines;
  }
  const moved = (chatId) => ((F().moved || {})[chatId]) || null;
  function moveUndo(chatId) { const r = moved(chatId); if (r) delete F().moved[chatId]; return r; }

  PJX.np = {
    SETTINGS, WAYS, VERB, SECTIONS, start, set, enforce, chooseWay, wayLoss, startOver, sections, problem, summary, state, enter, open, fold, cont, allDone, firstProblem, firstNotDone,
    moveStart, moveBlocker, chatPicked, waitingApprovals, convEffects, untilWord, nowWord, clockNow, undoEnded, moveTargets, moveMark, moveHist, movePlace, movePicked, moveSame, moveConflicts, moveMoving, moveProblem, moveStatement, moveLabel, movePhases, moveCommit, moveUndoStatement, moveUndo, moved,
    volOfPath, netCheck, netSignIn, bkHost, bkOnNas, likeSel, takenFor, forkNameCheck, visWord, restoredHist, kindWord, needsAccount, dropUi, onSettled: null,
    op, peek, retry, look, lookDone, lookTarget, limits, inspectAt, trusted, devicesFor, lookFor, addKey, resolveShare, smbShareKey, nfsShareKey, smbOk, nfsOk, volOk, dev, share, vol, comp, chatOf, chatFiles, serverOn,
    forgeRec, signedIn, signIn, signinOp, serverCheck, addrOk, srcRec, repoOf, findAnyone, access, accessDone, inside, gitAddressCheck, gitAddrValid, intentOf, intentDefault, forkName, forkOwner, knownFor,
    restoreSource, restoreWhere, restoreList, unlock, reach, reachOp, reached, kitOf, kitOpen, restoreUnlocked, restorePoints, lineage, derivedName, nameOf, folderNameOf, nameProblem, filesModes, filesMode, networkPlaces, netPlace, placeRoot, fullPath, filesStay, holderName, filesOnNas,
    likeSrc, settingsOf, likePreview, likeCounts, accountRows, needsAfter, picked, histKeeps, histLimits, jjOn, onlineDefault, onlineMode, onlineRec, onlineKind, owners, ownerOf, projectOf, visOf, onlineName, nameCheck,
    linkTarget, linkRec, linkCheck, bkFamily, bkPlace, bkExisting, bkDestLabel, keepBad, onlineLine, begins, review, phases, commit, makeProject, toPlan, detect, applyDetected, full, andList, plural, fmtGB, HOME
  };
})(window);
