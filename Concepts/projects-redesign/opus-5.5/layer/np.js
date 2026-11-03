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
  const full = (p) => String(p || '').replace(/^~(?=\/|$)/, HOME);
  const comp = (id) => ENV.computers.find((c) => c.id === id) || ENV.computers[0];
  const dev = (id) => ENV.devices.concat(ENV.found).find((x) => x.id === id) || null;
  const share = (id) => ENV.shares.find((x) => x.id === id) || null;
  const vol = (id) => ENV.volumes.find((x) => x.id === id) || null;
  const chatOf = (id) => (ENV.chats || []).find((c) => c.id === id) || null;
  const serverOn = () => { const n = ENV.devices.find((x) => x.server === 'homenas'); return !!(n && n.online); };
  const lc = (s) => String(s || '').toLowerCase();
  const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
  const andList = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

  /* ------------------------------------------------------------------ the draft */
  const blankDevice = () => ({ method: 'ssh', id: null, typing: false, address: '', port: '22', asked: '', user: '', path: null, share: null, typedShare: '', shareTyping: false, volume: null, smbUser: '', smbDomain: '', idOk: false, key: null, keyDone: false, signin: 'pw', browse: null });
  const blankOnline = (mode) => ({ mode: mode || null, service: 'github', kind: null, address: '', acct: null, owner: null, project: null, visibility: null, name: '', nameTouched: false, description: '', branch: '', branchTouched: false, remoteName: '', linkProject: null, step: null });
  const blankFiles = () => ({ mode: null, parent: '~/Documents', network: null, browse: false, touched: false });
  const blankLike = (source) => ({ source: source || 'usual', ids: null, things: null, accounts: true, per: {}, onlyDiff: true, fixed: false, fromComputer: false, ownFiles: {}, q: '', showAll: false });
  function blank() {
    return {
      way: null, runsOn: 'here', name: '', nameTouched: false,
      start: 'basics', basics: { readme: true, ignore: 'automatic', license: 'none' },
      folder: { path: null, browse: false },
      device: blankDevice(),
      src: { service: 'github', kind: null, address: '', gitAddress: '' },
      find: { tab: null, q: '', anyQ: '', anyAsked: '', project: null, intent: null, forkOwner: null, branch: 'my-change', branchTouched: false, another: false },
      fork: { name: '', nameTouched: false, upstreamName: 'upstream' },
      restore: { from: null, cloud: 'gdrive', unlocked: false, pick: null },
      chat: { id: null, files: null },
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
      if (src) { d.restore.from = src.id === 'gdrive' ? 'cloud' : src.id; d.restore.cloud = 'gdrive'; if (src.projects.indexOf(p.id) >= 0) d.restore.pick = p.id; }
    }
    if (opts.folder && d.way === 'folder') d.folder.path = opts.folder;
    return s;
  }

  /* path helpers for set() */
  const getp = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const putp = (o, p, v) => { const ks = p.split('.'), last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
  const dropSecret = (s, prefix) => { Array.from(s.secrets.keys()).forEach((k) => { if (k.indexOf(prefix) === 0) { const el = s.secrets.get(k); if (el) el.value = ''; s.secrets.delete(k); } }); };
  const dropOps = (s, prefix) => { Object.keys(s.ops).forEach((k) => { if (k.indexOf(prefix) === 0) delete s.ops[k]; }); };

  /* set one answer and clear what depends on it (spec 8 rule 3 and its table) */
  function set(s, path, v, quiet) {
    const d = s.d, before = getp(d, path);
    if (before === v && (v === null || typeof v !== 'object')) return;
    putp(d, path, v);
    const resetOnline = () => { d.online = blankOnline(); };
    const resetHistory = () => { d.history = 'git'; d.historyTouched = false; };
    switch (path) {
      case 'runsOn':
        d.folder.path = null; d.device = blankDevice(); dropSecret(s, 'dev'); d.files = blankFiles();
        // sign-ins and account choices belong to a computer (rule 10): the finds and links made on the old one go
        Object.assign(d.find, { project: null, intent: null, forkOwner: null, anyAsked: '', another: false });
        Object.assign(d.online, { acct: null, owner: null, project: null, visibility: null, linkProject: null, step: null });
        if (d.way === 'folder' || d.way === 'device') { resetOnline(); resetHistory(); }
        dropSecret(s, 'tok'); dropSecret(s, 'bk');
        break;
      case 'folder.path': resetOnline(); resetHistory(); s.ui.err.folder = null; break;
      case 'device.method': Object.assign(d.device, blankDevice(), { method: v }); dropSecret(s, 'dev'); resetOnline(); resetHistory(); break;
      case 'device.id': Object.assign(d.device, { path: null, idOk: false, key: null, keyDone: false, user: '', signin: 'pw', browse: null }); dropSecret(s, 'dev'); resetOnline(); resetHistory(); break;
      case 'device.share': case 'device.volume': d.device.path = null; d.device.browse = null; d.device.smbUser = ''; dropSecret(s, 'dev'); resetOnline(); resetHistory(); break;
      case 'device.path': resetOnline(); resetHistory(); break;
      case 'device.key': d.device.keyDone = false; dropSecret(s, 'devpw'); dropOps(s, 'keyadd:'); break;
      case 'src.service': case 'src.kind': case 'src.address':
        if (path === 'src.service') { d.src.kind = null; d.src.address = ''; }
        if (path === 'src.kind') d.src.address = '';
        Object.assign(d.find, { tab: null, q: '', anyQ: '', anyAsked: '', project: null, intent: null, forkOwner: null, another: false });
        if (!d.find.branchTouched) d.find.branch = 'my-change';
        d.fork = { name: '', nameTouched: false, upstreamName: 'upstream' };
        dropSecret(s, 'tok');
        break;
      case 'find.tab': d.find.project = null; d.find.intent = null; d.find.forkOwner = null; break;
      case 'find.project': Object.assign(d.find, { intent: null, forkOwner: null, another: false }); d.fork.name = ''; d.fork.nameTouched = false; resetHistory(); break;
      case 'find.intent': if (v === 'copy' || v === 'direct') { d.fork = { name: '', nameTouched: false, upstreamName: 'upstream' }; d.find.branch = 'my-change'; d.find.branchTouched = false; d.find.forkOwner = null; } break;
      case 'online.mode': d.online = blankOnline(v); dropSecret(s, 'tok'); break;
      case 'online.service': case 'online.kind': case 'online.address':
        if (path === 'online.service') { d.online.kind = null; d.online.address = ''; }
        if (path === 'online.kind') d.online.address = '';
        Object.assign(d.online, { acct: null, owner: null, project: null, visibility: null, linkProject: null });
        dropSecret(s, 'tok');
        break;
      case 'online.owner': d.online.project = null; d.online.visibility = null; break;
      case 'online.project': d.online.visibility = null; break;
      case 'like.source': { const acc = d.like.accounts; d.like = blankLike(v); d.like.accounts = acc; break; }
      case 'backup.dest': d.backup.sub = null; d.backup.acc = {}; d.backup.leaveOut = {}; dropSecret(s, 'bk'); s.ui.nasDropped = false; break;
      case 'backup.sub': d.backup.acc = {}; dropSecret(s, 'bk'); break;
      case 'chat.id': case 'chat.files': d.files = blankFiles(); resetOnline(); resetHistory(); break;
      case 'restore.from': case 'restore.cloud': d.restore.unlocked = false; d.restore.pick = null; dropSecret(s, 'phrase'); resetOnline(); break;
      case 'restore.pick': resetOnline(); break;
      case 'files.mode': d.files.parent = '~/Documents'; d.files.network = null; d.files.browse = false; d.files.touched = true; break;
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
    // a service or kind this flow doesn't offer (an older saved draft) clears the online answers (R5, R6)
    if (d.online.service && !R().service(d.online.service)) { d.online = blankOnline(d.online.mode); s.ui.retired = true; }
  }

  /* how the Project begins; answers that belong to the old beginning go (6.0, 8 rule 6 and 11) */
  function chooseWay(s, way, quiet) {
    const d = s.d;
    if (d.way !== way) {
      d.folder = { path: null, browse: false }; d.device = blankDevice(); dropSecret(s, 'dev');
      d.src = { service: 'github', kind: null, address: '', gitAddress: '' };
      d.find = { tab: null, q: '', anyQ: '', anyAsked: '', project: null, intent: null, forkOwner: null, branch: 'my-change', branchTouched: false, another: false };
      d.fork = { name: '', nameTouched: false, upstreamName: 'upstream' };
      d.restore = { from: null, cloud: 'gdrive', unlocked: false, pick: null }; dropSecret(s, 'phrase');
      d.chat = { id: way === 'chat' ? ((ENV.chats || [])[0] || {}).id || null : null, files: null };
      d.online = blankOnline(); dropSecret(s, 'tok');
      d.history = 'git'; d.historyTouched = false;
      if (!d.files.touched) d.files = blankFiles();
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
  function startOver(s) { const purpose = s.purpose; Object.assign(s, { d: blank() }); s.ui = { open: undefined, err: {}, disc: {}, mini: {}, entered: false, nasDropped: false, refused: {} }; s.ops = {}; Array.from(s.secrets.values()).forEach((el) => { el.value = ''; }); s.secrets.clear(); s.purpose = purpose; s.changed(); }

  /* ------------------------------------------------------------------ simulated owner results, cached per input */
  function op(s, key, ms, fn) {
    if (s.ops[key]) return s.ops[key];
    const o = s.ops[key] = { state: 'working', result: null };
    setTimeout(() => {
      if (s.ops[key] !== o) return;
      let r; try { r = fn(); } catch (e) { console.error('[pjx np op]', key, e); r = { fail: 'error' }; }
      o.result = r || {}; o.state = r && r.fail ? 'failed' : 'done';
      s.changed();
    }, PJX.reduced() ? Math.min(ms, 220) : ms);
    return o;
  }
  const peek = (s, key) => s.ops[key] || null;
  const retry = (s, key) => { delete s.ops[key]; s.changed(); };

  /* the look inside (6.2.1): read-only, on the computer that does the work, through the chosen route */
  function inspectAt(holder, path) {
    let r = ENV.inspect[holder + ':' + path], seen = 0;
    while (r && r.alias && seen++ < 4) r = ENV.inspect[r.alias];
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
    if (d.way === 'folder' && d.folder.path) return { holder: d.runsOn === 'homenas' ? 'nas' : 'here', path: d.folder.path, route: d.runsOn === 'homenas' ? 'local@homenas' : 'local', label: d.folder.path };
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
    const o = op(s, 'look:' + s.d.runsOn + ':' + t.route + ':' + t.holder + ':' + t.path, 950, () => {
      const r = inspectAt(t.holder, t.path);
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
    const pw = s.secrets.get('devpw'), x = dev(s.d.device.id);
    s.attempt++;
    const key = 'keyadd:' + s.d.runsOn + ':' + (x && x.id) + ':' + s.attempt;
    const user = String(s.d.device.user || '').trim(), val = pw ? pw.value : '';
    if (how === 'pw' && (!user || !val)) return { fail: 'needBoth' };
    s.ui.keyOp = key;
    const o = op(s, key, 1200, () => {
      if (how === 'self' || (user === 'jared' && val === 'correct horse')) { F().trusted[s.d.runsOn + ':' + x.id] = true; return { ok: true }; }
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
  function access(s) {
    const d = s.d, rec = srcRec(s), r = repoOf(s); if (!r || r.plain) return null;
    return op(s, 'access:' + (rec && rec.key) + ':' + d.runsOn + ':' + r.id, 700, () => {
      if (r.access === 'none') return { fail: 'none' };
      const myOwner = r.owner === ((signedIn(rec, d.runsOn) || {}).account || 'jared');
      return { access: r.access, team: r.access === 'write' && !myOwner, fork: F().forks[r.id] || r.fork || null, tfvc: !!r.tfvc };
    });
  }
  const accessDone = (s) => { const o = access(s); return o && o.state === 'done' ? o.result : null; };
  function inside(s) {
    const d = s.d, rec = srcRec(s), r = repoOf(s); if (!r || r.plain || r.access === 'none') return null;
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
    if (src.locked && !s.d.restore.unlocked) return null;
    return op(s, 'rlist:' + src.id, 800, () => (src.empty || !src.projects.length ? { fail: 'none' } : { projects: src.projects }));
  }
  function unlock(s) {
    const src = restoreSource(s), el = s.secrets.get('phrase'), v = el ? String(el.value || '').trim().replace(/\s+/g, ' ') : '';
    if (!v) return { fail: 'first' };
    if (el) el.value = '';
    if (src && v === src.phrase) { s.d.restore.unlocked = true; s.ui.phraseBad = false; s.changed(); return { ok: true }; }
    s.ui.phraseBad = true; s.changed(); return { fail: 'wrong' };
  }
  const lineage = (s) => { const src = restoreSource(s), p = s.d.restore.pick; return src && src.lineage && p ? src.lineage[p] || null : null; };

  /* ------------------------------------------------------------------ chat (spec 12) */
  const chatFiles = (s) => { const c = chatOf(s.d.chat.id); return s.d.chat.files || (c && c.files ? 'move' : 'empty'); };

  /* ------------------------------------------------------------------ the name and where it lives (6.6) */
  function derivedName(s) {
    const d = s.d;
    if (d.way === 'folder' && d.folder.path) return d.folder.path.split('/').pop();
    if (d.way === 'device' && d.device.path) return d.device.path.split('/').pop();
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
    out.push({ id: 'smb:smb-nas', route: 'SMB', device: 'nas', title: '//nas.local/projects', sub: 'A shared folder on Home NAS (SMB)', root: '//nas.local/projects', holder: 'Home NAS', free: '3.1 TB', freeGB: 3100 });
    out.push({ id: 'nfs:nfs-nas', route: 'NFS', device: 'nas', title: 'nas.local:/volume1/projects', sub: 'An NFS share on Home NAS', root: 'nas.local:/volume1/projects', holder: 'Home NAS', free: '3.1 TB', freeGB: 3100 });
    if (c === 'here') ENV.volumes.forEach((v) => out.push({ id: 'vol:' + v.id, route: 'drive', device: v.device, title: v.path, sub: v.label + ' · ' + v.free + ' free', root: v.path, holder: v.device ? 'Home NAS' : 'This computer', free: v.free, freeGB: v.freeGB }));
    out.push({ id: 'ssh:media', route: 'SSH', device: 'media', title: 'Media NAS · /mnt/tank/projects', sub: 'Not answering', root: '/mnt/tank/projects', holder: 'Media NAS', off: w('np.device.offlineWhy', { device: 'Media NAS' }) });
    return out.map((x) => (x.device === 'media' && dev('media').online ? Object.assign(x, { off: null, sub: 'Over a secure connection (SSH)' }) : x));
  }
  const netPlace = (s) => networkPlaces(s).find((x) => x.id === s.d.files.network) || null;
  /* the folder that will hold it, and its full path */
  function placeRoot(s) {
    const d = s.d, m = filesMode(s), c = comp(d.runsOn);
    if (m === 'projects') return { root: c.rootFull, holder: c.id === 'here' ? 'This computer' : c.name, free: c.free, freeGB: c.freeGB, short: c.root };
    if (m === 'this_computer') return { root: comp('here').rootFull, holder: 'This computer', free: comp('here').free, freeGB: comp('here').freeGB, short: comp('here').root };
    if (m === 'with_server') return { root: comp('homenas').rootFull, holder: 'Home NAS', free: comp('homenas').free, freeGB: comp('homenas').freeGB, short: comp('homenas').root };
    if (m === 'custom') { const p = String(d.files.parent || '').trim().replace(/\/+$/, ''); return { root: full(p), holder: c.name, free: c.free, freeGB: c.freeGB, custom: p }; }
    const n = netPlace(s); if (!n) return null;
    return { root: full(n.root), holder: n.holder, free: n.free, freeGB: n.freeGB, net: n };
  }
  function fullPath(s) {
    const d = s.d;
    if (d.way === 'folder') return d.folder.path ? full(d.folder.path) : null;
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
    if (d.way === 'folder') return d.runsOn === 'homenas' ? 'Home NAS' : 'This computer';
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
    if (d.way === 'folder') return d.runsOn === 'homenas';
    if (d.way === 'device') {
      if (d.device.method === 'ssh') return d.device.id === 'nas';
      if (d.device.method === 'mounted') { const v = vol(d.device.volume); return !!(v && v.device === 'nas'); }
      const sh = resolveShare(s); return !!(sh && sh.device === 'nas');
    }
    if (filesStay(s)) return false;
    const m = filesMode(s);
    if (m === 'with_server') return true;
    if (m === 'network') { const n = netPlace(s); return !!(n && n.device === 'nas'); }
    return false;
  }

  /* ------------------------------------------------------------------ like: copy settings (SETTINGS-PROPOSAL 5.1 to 5.4) */
  const likeSrc = (s) => (s.d.like.source !== 'usual' ? PJX.get(s.d.like.source) : null);
  const settingsOf = (id) => (ENV.projectSettings[id] || { uses: ['claude'], own: [], same: [], things: [], ownFiles: [], fromComputer: 0 });
  function likePreview(s) { const p = likeSrc(s); if (!p) return null; return op(s, 'preview:' + p.id + ':' + p.runsOn, 650, () => ({ ok: true })); }
  const picked = (map, id) => (map == null ? true : map[id] !== false);
  function likeCounts(s) {
    const p = likeSrc(s); if (!p) return null;
    const S = settingsOf(p.id), L = s.d.like;
    const own = S.own.filter((r) => picked(L.ids, r[1])).length + (L.fixed ? S.same.length : 0) + (L.fromComputer ? S.fromComputer : 0);
    const things = S.things.filter((t) => picked(L.things, t.id)).length;
    const accounts = L.accounts ? S.uses.filter((a) => (L.per[a] || 'same') === 'same').length : 0;
    return { own, ownAll: S.own.length, things, thingsAll: S.things.length, accounts, uses: S.uses.length };
  }
  /* each account's readiness on the computer doing the work (5.4): reused on the same computer only when chosen (S10),
     checked first on another computer, keys never sent (S11) */
  function accountRows(s) {
    const p = likeSrc(s); if (!p) return [];
    const S = settingsOf(p.id), L = s.d.like, c = s.d.runsOn, same = c === (p.runsOn || 'here'), cn = comp(c).name;
    const ids = S.uses.slice();
    if (S.things.some((t) => t.kind === 'mcp' && picked(L.things, t.id))) S.things.filter((t) => t.kind === 'mcp').forEach((t) => { if (ENV.accounts.some((a) => a.id === t.id)) ids.push(t.id); });
    return ids.map((id) => {
      const a = ENV.accounts.find((x) => x.id === id); if (!a) return null;
      const choice = L.per[id] || 'same', on = a.on[c] || 'none';
      let out;
      if (choice === 'later') out = { key: 'off', state: 'later', word: w('np.like.acctLaterRow') };
      else if (on === 'expired') out = { key: 'warning', state: 'expired', word: w('np.acct.expired', { computer: cn }) };
      else if (on === 'notInstalled') out = { key: 'off', state: 'not_installed', word: w('np.acct.install', { tool: a.tool || a.name, computer: cn }), why: w('np.acct.installWhy') };
      else if (on === 'ready') out = same ? { key: 'complete', state: 'ready_here', word: w('np.acct.ready', { computer: cn }), why: w('np.acct.readyWhy') } : { key: 'reviewing', state: 'check_there', word: w('np.acct.checked', { computer: cn }), why: w('np.acct.checkedWhy', { computer: cn }) };
      else if (a.kind === 'key') out = SETTINGS.sendKeys && L.sendKeys ? { key: 'info', state: 'key_sent', word: w('np.acct.keySend', { computer: cn }) } : { key: 'waiting', state: 'key_needed', word: w('np.acct.key', { computer: cn }), why: w('np.acct.keyWhy', { computer: cn }) };
      else out = { key: 'waiting', state: 'sign_in_there', word: w('np.acct.signin', { computer: cn }), why: w('np.acct.signinWhy', { computer: cn }) };
      return Object.assign({ id, name: a.name, account: a.account, kind: a.kind, choice, mcp: S.things.some((t) => t.id === id) }, out);
    }).filter(Boolean);
  }
  const needsAfter = (s) => (s.d.like.accounts ? accountRows(s).filter((r) => /sign_in_there|key_needed|expired|not_installed/.test(r.state)).length : 0);

  /* ------------------------------------------------------------------ versions (6.8) */
  function histKeeps(s) {
    const d = s.d;
    if (d.way === 'restore') return 'restored';
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
    return op(s, 'name:' + rec.key + ':' + owner.id + ':' + lc(n), 450, () => ((rec.taken || []).some((t) => lc(t) === lc(n)) ? { bad: w('np.details.taken', { owner: owner.label }) } : { ok: true }));
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
      if (t.picked && lc(base) !== lc(last)) return { fail: 'mismatch' };
      if (!(rec.repos || []).some((r) => r.id === t.project) && t.picked) return { fail: 'gone' };
      return { ok: true };
    });
  }

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
        const r = d.restore; if (!r.from) return { text: 'Choose where the backup is', field: 'restore' };
        const src = restoreSource(s);
        if (src && src.locked && !r.unlocked) return { text: w('np.restore.phraseFirst'), field: 'phrase' };
        const l = restoreList(s); if (!l || l.state === 'working') return { text: w('np.restore.looking', { where: restoreWhere(s) }), field: 'restore', wait: true };
        if (l.state === 'failed') return { text: w('np.restore.none', { where: restoreWhere(s) }), field: 'restore' };
        if (!r.pick) return { text: w('np.restore.pick'), field: 'pick' };
        return null;
      }
      case 'chat': {
        if (!chatOf(d.chat.id)) return { text: 'Choose the chat', field: 'chat' };
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
      case 'chat': { const c = chatOf(d.chat.id), f = chatFiles(s); return c ? w('np.sum.chat', { chat: c.title, files: { move: 'move its files', useFolder: 'its folder is the Project', worked: 'use ' + c.workedIn.path, empty: 'start empty' }[f] }) : ''; }
      case 'where': { const fp = fullPath(s); return w('np.sum.where', { name: nameOf(s), path: fp || '', computer: comp(d.runsOn).name }); }
      case 'like': {
        const p = likeSrc(s); if (!p) return w('np.sum.like.usual');
        const c = likeCounts(s), plus = d.like.accounts ? w('np.sum.like.plus') : '';
        const partial = c.own !== c.ownAll || c.things !== c.thingsAll || d.like.fixed || d.like.fromComputer;
        const own = plural(c.ownAll, 'setting') + (c.thingsAll ? ' and ' + plural(c.thingsAll, 'thing') : '');
        return partial ? w('np.sum.like.partial', { project: p.name, picked: c.own + ' of ' + c.ownAll + ' settings' + (c.thingsAll ? ' and ' + c.things + ' of ' + c.thingsAll + ' things' : ''), plus }) : w('np.sum.like.source', { project: p.name, own, plus });
      }
      case 'versions': { const k = histKeeps(s); const kind = k === 'restored' ? 'Comes back with its history' : k ? 'Keeps its ' + (k === 'jujutsu' ? 'Jujutsu' : 'Git') + ' history' : d.history === 'jujutsu' ? 'Jujutsu' : 'Git'; return w('np.sum.ver', { kind, off: d.filesafe ? '' : w('np.sum.verOff') }); }
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
    const row = (k, v, sec, more) => Object.assign({ k, v: v || NOT, open: !v, sec }, more || {});
    const c = chatOf(d.chat.id);
    const project = [row(w('np.rv.name'), named && !nameProblem(s) ? nameOf(s) : null, 'where', { field: 'name' }), row(w('np.rv.begins'), begins(s), sections(s)[0])];
    if (d.way === 'chat' && c) project.push(row(w('np.rv.chat'), w('np.rv.chatLine', { chat: c.title }), 'chat'));
    if (d.way !== 'restore') { const p = likeSrc(s), k = p && likeCounts(s); project.push(row(w('np.rv.like'), p ? 'Like ' + p.name + ': ' + plural(k.own, 'setting') + (k.things ? ', ' + plural(k.things, 'thing') : '') + (d.like.accounts && k.accounts ? ' and its AI accounts' : '') : w('np.sum.like.usual'), 'like')); }
    if (d.way === 'chat' && c) {
      project.push(row('Stays behind', w('np.rv.chatStays', { outside: andList(c.outside), folders: andList(c.folders) }).replace(/^Stays behind: /, ''), 'chat'));
      project.push(row('Undo', w('np.rv.chatUndo'), 'chat'));
    }
    const fp = fullPath(s), r = placeRoot(s);
    const loc = [row(w('np.rv.runsOn'), comp(d.runsOn).name + (d.runsOn === 'here' ? ' (' + comp('here').detail + ')' : ''), 'where', { field: 'runsOn' }),
      row(w('np.rv.files'), fp && (named || filesStay(s)) ? fp + (holderName(s) && holderName(s) !== comp(d.runsOn).name ? ' on ' + holderName(s) : '') : null, 'where', { field: 'files', code: true })];
    if (!filesStay(s) && r) loc.push(row(w('np.rv.room'), r.free ? w('np.loc.free', { free: r.free }) : null, 'where'));
    const k = histKeeps(s), lim = d.history === 'jujutsu' ? histLimits(s) : [];
    const ver = k === 'restored' ? 'Comes back with its history' : k ? 'Keeps its ' + (k === 'jujutsu' ? 'Jujutsu' : 'Git') + ' history' : d.history === 'jujutsu' ? 'Jujutsu' + (lim.length ? ' · ' + andList(lim.map((x) => w('np.ver.eff.' + x))) : '') : 'Git';
    const ol = problem(s, 'online') && !/^(none|leave|from)$/.test(onlineMode(s)) ? null : onlineLine(s, true);
    const bk = d.backup.dest === 'none' ? w('np.bk.none') : problem(s, 'backup') ? null : w('np.rv.bkLine', { place: bkPlace(s), when: d.backup.mode === 'manual' ? 'when you click Back up now' : 'every day at ' + d.backup.time });
    const safe = [row(w('np.rv.ver'), ver, 'versions'), row(w('np.rv.filesafe'), d.filesafe ? 'On' : 'Off', 'versions'), row(w('np.rv.online'), ol, 'online', { field: 'omode' }), row(w('np.rv.bk'), bk, 'backup')];
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
    if (d.way === 'online') {
      const it = intentOf(s), a = accessDone(s), fork = a && a.fork;
      if (it === 'contribute' && !fork) add('fork', w('np.ph.fork', { service: svcName }), 'cmd.forge.repository.fork', { net: true, remote: true, service: svcName });
      add('clone', w('np.ph.clone', { project: it === 'contribute' ? (fork || forkOwner(s) + '/' + forkName(s)) : (d.src.service === 'git' ? d.src.gitAddress : d.find.project), kind: kind(d.history) }), d.history === 'jujutsu' ? 'cmd.jujutsu.git.clone' : 'cmd.source_control.repository.clone', { net: true, service: svcName });
      if (it === 'contribute') add('upstream', w('np.ph.upstream', { upstream: d.fork.upstreamName }), 'gap:add remote');
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
    if (d.way === 'chat' && chatFiles(s) === 'move') add('chatfiles', w('np.ph.chatFiles', { n: chatOf(d.chat.id).files, path: fp }), 'gap:thread files move');
    const k = histKeeps(s);
    if (d.history === 'jujutsu' && !k && !jjOn(s)) add('jj', w('np.ph.jj'), 'cmd.capability.ensure');
    if (d.way !== 'online' && d.way !== 'restore') add('hist', k ? w('np.ph.histKeep', { kind: kind(k) }) : w('np.ph.histNew', { kind: kind(d.history) }), 'cmd.source_control.backend.select');
    const p = likeSrc(s);
    if (p && d.way !== 'restore') { add('settings', w('np.ph.settings', { project: p.name }), 'cmd.settings.transaction.apply'); if (likeCounts(s).things) add('things', w('np.ph.things'), 'gap:each owner’s copy (personas, MCP, commands)'); }
    if (/link_found|again|link/.test(m)) { const t = linkTarget(s); add('link', w('np.ph.link', { project: t ? (t.project || t.address) : '', service: t ? t.service || 'a Git address' : '' }), 'cmd.source_control.repository.bind' + (m === 'link' ? ' + gap:add remote' : ''), { net: true, service: t && t.service }); }
    if (/make|instead/.test(m)) {
      const svc = R().service(d.online.service);
      add('create', w('np.ph.create', { service: svc.name }), svc.id === 'github' ? 'cmd.project.new_github_repo' : 'cmd.forge.repository.create (gap: G1/G7)', { net: true, remote: true, service: svc.name, taken: true });
      add('send', w('np.ph.send'), d.history === 'jujutsu' ? 'cmd.jujutsu.git.push' : 'cmd.source_control.remote.publish', { net: true, service: svc.name });
    }
    add('add', w('np.ph.add'), d.way === 'new' || newFolder ? 'cmd.project.new_local (registers)' : 'cmd.project.add_existing');
    if (d.way === 'chat') add('chat', w('np.ph.chat', { chat: chatOf(d.chat.id).title }), 'gap:thread conversion [Depends: no-project]');
    add('check', w('np.ph.check'), 'cmd.project.refresh');
    return out;
  }

  /* run the creation. demo: { net, taken, fork, bk }. Resolves { ok, project, fail: { kind, text, section } } */
  async function commit(s, opts) {
    opts = opts || {}; const demo = opts.demo || {};
    const pr = firstProblem(s); if (pr) return { ok: false, fail: { kind: 'problem', text: pr.text, section: pr.section } };
    const list = phases(s), made = [];
    let failAt = -1, failKind = null;
    if (demo.fork) { failAt = list.findIndex((x) => x.key === 'clone'); failKind = 'recovery'; }
    else if (demo.taken) { failAt = list.findIndex((x) => x.key === 'create'); failKind = 'taken'; }
    else if (demo.net) { failAt = list.findIndex((x) => x.net); failKind = 'net'; }
    for (let i = 0; i < list.length; i++) {
      if (opts.onPhase) opts.onPhase(i, list, 'working');
      await PJX.wait(PJX.reduced() ? 160 : (list[i].net ? 950 : 600));
      if (i === failAt) {
        if (opts.onPhase) opts.onPhase(i, list, 'failed');
        if (failKind === 'taken') {
          const rec = onlineRec(s), owner = ownerOf(s, rec), key = rec.key + ':' + owner.id;
          s.ui.refused[key] = (s.ui.refused[key] || []).concat([lc(onlineName(s))]);
          return { ok: false, fail: { kind: 'taken', text: w('np.fail.taken', { service: R().service(s.d.online.service).name, project: owner.label + '/' + onlineName(s) }), section: 'online', service: R().service(s.d.online.service).name } };
        }
        if (failKind === 'net' && !made.length) return { ok: false, fail: { kind: 'net', text: w('np.fail.net', { service: list[i].service || 'the service' }), section: sections(s)[0] } };
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
      if (opts.onPhase) opts.onPhase(i, list, 'complete');
    }
    const p = makeProject(s, 'listed', demo);
    if (s.d.way === 'online' && intentOf(s) === 'contribute' && !(accessDone(s) || {}).fork) F().forks[s.d.find.project] = p.online.repo;
    PJX.ACT.add(p);
    return { ok: true, project: p };
  }
  /* the Project the reviewed draft becomes */
  function makeProject(s, lifecycle, demo) {
    const d = s.d, name = String(nameOf(s)).trim(), listed = lifecycle === 'listed', info = lookDone(s), fp = fullPath(s);
    const slugId = R().folderSlug(name) || 'project';
    let where;
    if (d.way === 'folder') where = d.runsOn === 'homenas' ? { kind: 'device', label: 'Home NAS', path: d.folder.path, device: 'Home NAS', via: 'Puppet Master' } : { kind: 'local', label: 'This computer', path: d.folder.path };
    else if (d.way === 'device') {
      const hn = holderName(s), via = { ssh: d.runsOn === 'homenas' ? 'SSH from Home NAS' : 'SSH', smb: 'SMB', nfs: 'NFS', mounted: 'a connected drive' }[d.device.method];
      where = hn === 'This computer' ? { kind: 'local', label: 'This computer', path: d.device.path } : { kind: 'device', label: hn, path: d.device.path, device: hn, via };
    } else if (filesStay(s)) where = { kind: 'local', label: 'This computer', path: (lookTarget(s) || {}).path || fp };
    else {
      const m = filesMode(s), n = netPlace(s);
      if (m === 'with_server') where = { kind: 'device', label: 'Home NAS', path: fp, device: 'Home NAS', via: 'Puppet Master' };
      else if (m === 'network' && n && n.holder !== 'This computer') where = { kind: 'device', label: n.holder, path: fp, device: n.holder, via: n.route };
      else where = { kind: 'local', label: 'This computer', path: fp.replace(HOME, '~') };
    }
    if (!listed) where.pending = true;
    const k = histKeeps(s), backend = k && k !== 'restored' ? k : d.way === 'restore' ? 'git' : d.history;
    const m = onlineMode(s);
    let online = { service: null, repo: null, state: 'off', ahead: 0, behind: 0 };
    if (m === 'from') {
      const it = intentOf(s), svcName = d.src.service === 'git' ? 'Git address' : R().service(d.src.service).name, a = accessDone(s) || {};
      if (d.src.service === 'git') online = { service: 'Git address', repo: d.src.gitAddress, state: 'complete', ahead: 0, behind: 0, note: 'Copies and sends only' };
      else if (it === 'contribute') online = { service: svcName, repo: a.fork || forkOwner(s) + '/' + forkName(s), state: 'complete', ahead: 0, behind: 0, privacy: 'Everyone', note: 'Your fork', upstream: { service: svcName, repo: d.find.project, behind: 0, branch: d.find.branch, remote: d.fork.upstreamName } };
      else if (it === 'copy') online = { service: svcName, repo: d.find.project, state: 'complete', ahead: 0, behind: 0, privacy: 'Everyone', note: 'Read only', readOnly: true };
      else online = { service: svcName, repo: d.find.project, state: 'complete', ahead: 0, behind: 0, privacy: (repoOf(s) || {}).vis, note: 'Up to date', branch: it === 'offer' ? d.find.branch : null, team: it === 'offer' };
    } else if (/link_found|again|link/.test(m)) {
      const t = linkTarget(s) || {};
      online = { service: t.address ? 'Git address' : t.service, repo: t.project || t.address, state: 'complete', ahead: 0, behind: 0, privacy: 'Only you', note: 'Up to date' };
    } else if (/make|instead/.test(m)) {
      const rec = onlineRec(s), owner = ownerOf(s, rec), v = visOf(s, rec, owner, projectOf(s, owner));
      online = { service: R().service(d.online.service).name, repo: (owner ? owner.label.replace(/ \/ /g, '/') : 'jared') + '/' + onlineName(s), state: 'complete', ahead: 0, behind: 0, privacy: v.v ? v.v.title : 'Follows its project', note: listed ? 'Up to date' : 'Created online' };
    } else if (m === 'leave' && info && info.online) online.found = { service: info.online.service || 'Git address', repo: info.online.repo || info.online.address, remote: info.online.remote };
    let backup = { dest: null, state: 'off', versions: 0 };
    if (d.backup.dest !== 'none') {
      const fam = bkFamily(s);
      backup = { dest: R().FAMILIES[fam].label, family: fam, place: bkPlace(s), include: d.backup.include, mode: d.backup.mode, time: d.backup.time, keep: d.backup.keep,
        schedule: d.backup.mode === 'manual' ? 'When you click Back up now' : 'Every day', state: listed ? 'setup' : 'pending', last: null, versions: 0, kit: null, note: listed ? null : 'Starts after setup',
        setup: listed ? { steps: ['todo', 'todo', 'todo', 'todo', 'todo'], fail: !!(demo && demo.bk), open: true, access: d.backup.dest === 'bucket' || d.backup.dest === 'server' } : null };
    }
    const src = likeSrc(s), counts = src && likeCounts(s);
    const c = chatOf(d.chat.id);
    const glyph = { new: 'seed', folder: 'folder', online: 'cloud', device: 'server', restore: 'history', chat: 'chat' }[d.way] || 'seed';
    const inside0 = d.way === 'online' ? (inside(s) || {}).result || {} : info || {};
    return {
      id: slugId + '-' + PJX.uid('n').split('-').pop(), name, glyph, active: false, lifecycle, order: PJX.all().length, runsOn: d.runsOn,
      stack: (info && info.stack) || [], where, opened: 'Just added', openedRank: -0.5,
      activity: listed ? { key: 'idle', word: 'Ready', text: d.way === 'restore' ? 'Restored from a backup · plan or open it' : 'Ready to plan in the Planning Wizard', at: 'just now', runs: 0 } : { key: 'waiting', word: 'Setup didn’t finish', text: '', at: 'just now', runs: 0 },
      history: { backend, branch: (info && info.branch) || 'main', worktrees: listed ? 1 : 0, changed: (info && info.changed) || 0, submodules: inside0.submodules || null, lfs: inside0.lfs || null, hooks: inside0.hooks || null, filesafe: d.filesafe },
      online, backup, sync: { devices: listed ? 2 : 0, state: listed ? 'complete' : 'pending' }, attention: [], fresh: true,
      copied: src ? { from: src.name, settings: counts.own, things: counts.things, accounts: counts.accounts } : null,
      needsSignin: listed ? needsAfter(s) : 0,
      fromChat: d.way === 'chat' && c ? c.title : null
    };
  }

  /* the draft read as onboarding's setup plan, for the verification read-out (spec 7) */
  function toPlan(s) {
    const d = s.d, m = onlineMode(s), rec = /make|instead|link/.test(m) ? onlineRec(s) : null;
    return {
      project_mode: { new: 'new', chat: 'new', folder: 'existing_local', device: 'existing_local', online: 'existing_online', restore: 'restore' }[d.way] || null,
      project_transport: d.way === 'device' ? ({ ssh: 'ssh', smb: 'mounted', nfs: 'mounted', mounted: 'mounted' }[d.device.method]) : d.way === 'folder' && d.runsOn === 'homenas' ? 'puppet_master' : null,
      server_mode: d.runsOn === 'here' ? 'this_device' : 'existing_server', server_ref: d.runsOn === 'here' ? null : 'homenas',
      project_name: nameOf(s), local_location: fullPath(s), storage_mode: filesMode(s) === 'network' ? 'network_location' : null,
      history_backend: histKeeps(s) && histKeeps(s) !== 'restored' ? histKeeps(s) : d.history, filesafe: d.filesafe,
      settings_transfer: likeSrc(s) ? { mode: 'copy', source_project_id: likeSrc(s).id, explicit_choice_setting_ids: d.like.ids ? Object.keys(d.like.ids).filter((k) => d.like.ids[k] !== false) : null } : { mode: 'usual' },
      online_mode: { none: 'none', leave: 'none', make: 'new', instead: 'new', link_found: 'existing', link: 'existing', again: 'existing', from: 'existing' }[m],
      forge: rec ? rec.key.split('@')[0] : null, repository_ref: m === 'from' ? d.find.project : null,
      repository_initialize_readme: /make|instead/.test(m) && d.way === 'new' ? d.start === 'basics' && d.basics.readme : null,
      backup_destination: d.backup.dest === 'none' ? null : bkFamily(s), secrets_in_draft: false
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
    if (/^(https?:\/\/\S+\.git|git@[\w.-]+:\S+\.git|ssh:\/\/git@\S+)$/i.test(t)) return { way: 'online', service: 'git', gitAddress: t, say: w('np.detect.git') };
    if ((m = /^(?:ssh:\/\/)?(?:([\w.-]+)@)?([\w-]+\.local)(?::|\/)(.+)$/.exec(t))) {
      const host = m[2], d0 = ENV.devices.concat(ENV.found).find((x) => x.address === host);
      const path = /^~|^\//.test(m[3]) ? m[3] : '/' + m[3];
      if (d0) return { way: 'device', method: 'ssh', device: d0.id, path, user: m[1] || '', say: w('np.detect.ssh', { device: d0.name }) };
    }
    if ((m = /^(?:smb:)?\/\/([\w.-]+)\/(\S+)$/i.exec(t))) { const sh = ENV.shares.find((x) => x.kind === 'smb' && x.address === '//' + m[1] + '/' + m[2].replace(/\/+$/, '')); return { way: 'device', method: 'smb', share: sh ? sh.id : 'typed', typed: '//' + m[1] + '/' + m[2], say: w('np.detect.smb', { device: sh ? dev(sh.device).name : m[1] }) }; }
    if ((m = /^([\w-]+\.local):(\/\S+)$/.exec(t))) { const sh = ENV.shares.find((x) => x.kind === 'nfs' && x.address === t); return { way: 'device', method: 'nfs', share: sh ? sh.id : 'typed', typed: t, say: w('np.detect.nfs', { device: sh ? dev(sh.device).name : m[1] }) }; }
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

  PJX.np = {
    SETTINGS, WAYS, VERB, SECTIONS, start, set, enforce, chooseWay, wayLoss, startOver, sections, problem, summary, state, enter, open, fold, cont, allDone, firstProblem, firstNotDone,
    op, peek, retry, look, lookDone, lookTarget, limits, inspectAt, trusted, devicesFor, lookFor, addKey, resolveShare, smbShareKey, nfsShareKey, smbOk, nfsOk, volOk, dev, share, vol, comp, chatOf, chatFiles, serverOn,
    forgeRec, signedIn, signIn, signinOp, serverCheck, addrOk, srcRec, repoOf, findAnyone, access, accessDone, inside, gitAddressCheck, gitAddrValid, intentOf, intentDefault, forkName, forkOwner, knownFor,
    restoreSource, restoreWhere, restoreList, unlock, lineage, derivedName, nameOf, folderNameOf, nameProblem, filesModes, filesMode, networkPlaces, netPlace, placeRoot, fullPath, filesStay, holderName, filesOnNas,
    likeSrc, settingsOf, likePreview, likeCounts, accountRows, needsAfter, picked, histKeeps, histLimits, jjOn, onlineDefault, onlineMode, onlineRec, onlineKind, owners, ownerOf, projectOf, visOf, onlineName, nameCheck,
    linkTarget, linkRec, linkCheck, bkFamily, bkPlace, bkExisting, bkDestLabel, keepBad, onlineLine, begins, review, phases, commit, makeProject, toPlan, detect, applyDetected, full, andList, plural, fmtGB, HOME
  };
})(window);
