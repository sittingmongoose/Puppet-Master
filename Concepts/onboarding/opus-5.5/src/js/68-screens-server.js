/* Set up or restore a Server (a Bootstrap-style preflow with its own confirmation: nothing is claimed until "Set up
   Server"), plus the shared restore screens used three ways:
     scope 'server'  — Bring back old data onto the new Server (restore_existing_pm_data)
     scope 'full'    — Moving from an old computer: restore everything onto this computer (restore_backup)
     scope 'project' — Restore a Project (project_mode restore): picks the backup, then the normal Project steps. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const words = (seed) => O55.art.identity(seed).words.join(' ');

  const PLATFORMS = { nas: ['truenas', 'unraid', 'synology', 'qnap'], cloud: ['linux'], pc: ['windows', 'macos', 'linux'] };
  /* the computer being set up: a rented cloud computer is reached by its address, never found on the home network */
  const cloud = (S) => (S.sess.server.kind || 'nas') === 'cloud';
  const unclaimed = (S) => (cloud(S) ? S.env.unclaimedCloud : S.env.unclaimed);
  /* names that fit the kind of computer (a cloud computer is not a Home NAS) */
  /* names already on this network (the NAS found there, other Puppet Masters) are never suggested for a new Server: a
     second "Home NAS" beside the first made every later screen ambiguous (logic crawl). A taken name gets a " 2". */
  const takenNames = (S) => new Set(S.env.devices.map((d) => d.name).concat(S.env.pmServers.map((p) => p.name)).map((x) => x.toLowerCase()));
  const suggestions = (S) => {
    const base = O55.tx('server.confirm.suggest' + { nas: 'Nas', cloud: 'Cloud', pc: 'Pc' }[S.sess.server.kind || 'nas']) || [], taken = takenNames(S);
    const free = base.filter((x) => !taken.has(x.toLowerCase()));
    return free.length ? free : base.map((x) => x + ' 2');
  };
  const serverNameOf = (S) => (S.sess.server.name == null ? suggestions(S)[0] : S.sess.server.name);
  const PLATFORM_NAMES = { truenas: 'TrueNAS', unraid: 'Unraid', synology: 'Synology', qnap: 'QNAP', linux: 'Linux', windows: 'Windows', macos: 'macOS' };

  /* ------------------------------------------------------------------ S1: what kind of computer + install steps */
  def('s-kind', {
    chapter: 'computer', stage: 'simple_path', charmSlot: 'server',
    scene: (S) => ({ id: 'where', beat: 'server' }),
    eyebrow: () => T('server.kind.eyebrow'),
    title: () => T('server.kind.title'),
    lead: () => T('server.kind.lead'),
    body(S) {
      const sv = S.sess.server, kind = sv.kind || 'nas';
      let out = C.cards('kind', [
        { v: 'nas', glyph: 'server', title: T('server.kind.nas.title'), sub: T('server.kind.nas.sub') },
        { v: 'cloud', glyph: 'cloud', title: T('server.kind.cloud.title'), sub: T('server.kind.cloud.sub') },
        { v: 'pc', glyph: 'computer', title: T('server.kind.pc.title'), sub: T('server.kind.pc.sub') }
      ], kind, { label: T('server.kind.title') });
      out += C.note(T('server.kind.replaceNote'), 'info', 'rewind');
      return out;
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      kind(S, v, el) { const sv = S.sess.server; if (sv.kind !== v) { sv.target = null; sv.manual = v === 'cloud'; sv.addr = ''; } sv.kind = v; sv.platform = PLATFORMS[v][0]; S.save(); O55.ui.refresh(); O55.ui.charm(el, T('server.kind.' + v + '.title').split(' ').slice(-2).join(' '), { nas: 'server', cloud: 'cloud', pc: 'computer' }[v]); },
      next(S) { const sv = S.sess.server; if (!sv.kind) { sv.kind = 'nas'; sv.platform = 'truenas'; } if (sv.kind === 'cloud') sv.manual = true; S.save(); O55.ui.go('s-wait'); }
    }
  });

  /* ------------------------------------------------------------------ S1b: waiting for it to appear (read-only) */
  function unclaimedFound(S) { const st = F.state(S, 'discover:server'); return st && st.state === 'done'; }
  def('s-wait', {
    chapter: 'computer', stage: 'simple_path',
    scene: (S) => ({ id: 'where', beat: 'server' }),
    eyebrow: () => T('server.wait.eyebrow'),
    title: () => T('server.wait.title'),
    lead: () => T('server.wait.lead'),
    body(S) {
      const u = unclaimed(S), sv = S.sess.server, kind = sv.kind || 'nas';
      /* install steps sit beside the discovery: do them on the other computer, and it shows up here by itself */
      const plats = PLATFORMS[kind], plat = plats.includes(sv.platform) ? sv.platform : plats[0];
      const steps = O55.tx('server.install.' + plat);
      let inner = plats.length > 1 ? C.segmented({ do: 'platform', value: plat, label: T('server.kind.installTitle'), options: plats.map((p) => ({ v: p, label: PLATFORM_NAMES[p] })) }) : '';
      inner += `<ol class="o55-steps" data-key="steps-${plat}">` + (Array.isArray(steps) ? steps : []).map((st) => `<li>${U.esc(st)}</li>`).join('') + '</ol>';
      if (plat === 'linux') inner += `<div class="o55-codeline" data-key="cmd"><code>${U.esc(T('server.install.command'))}</code>${F.copyBtn(T('server.install.command'), 'install')}</div>`;
      inner += `<div class="o55-sublinks" data-key="guide">${C.link(T('server.install.guide'), 'guide', plat)}</div>`;
      let out = C.group(T('server.kind.installTitle'), inner, { cls: 'o55-install' });
      if (sv.manual) {
        const hit = String(sv.addr || '').trim().toLowerCase() === u.address;
        if (kind === 'cloud') out += C.note(T('server.wait.cloudNote'), 'info', 'cloud');
        out += C.field({ bind: 'addr', label: T(kind === 'cloud' ? 'server.wait.cloudLabel' : 'connect.route.addressLabel'), value: sv.addr || '', placeholder: u.address, hint: hit ? T('server.wait.found', { name: u.name }) : T('connect.route.addressHint'), valid: hit });
      } else if (!unclaimedFound(S)) {
        out += `<div class="o55-row o55-row-wait" data-key="scan"><span class="o55-spin" aria-hidden="true"></span><span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('server.wait.looking'))}</span></span></div>`;
      }
      if (unclaimedFound(S) || (sv.manual && String(sv.addr || '').trim().toLowerCase() === u.address)) {
        out += C.cards('pick', [{ v: u.id, glyph: 'server', title: T('server.wait.found', { name: u.name }), sub: T('server.wait.notSetUp'), tag: '' }], sv.target, { label: T('server.wait.title') });
      }
      if (!sv.manual) out += `<div class="o55-sublinks" data-key="addr">${C.link(T('server.wait.address'), 'manualOn')}</div>`;
      else if (kind !== 'cloud') out += `<div class="o55-sublinks" data-key="scanlink">${C.link(T('server.wait.scan'), 'manualOff')}</div>`;
      return out;
    },
    mounted(S) { if (!S.sess.server.manual && !cloud(S)) F.op(S, 'discover:server', 'cmd.server.discovery.refresh', [{ key: 'lan', ms: 2600 }], { payload: { scope: 'unclaimed' } }); },
    foot: (S) => ({ primary: { label: T('server.wait.choose'), do: 'next', disabled: !S.sess.server.target, reason: T('server.wait.looking') } }),
    do: {
      pick(S, id, el) { S.sess.server.target = id; S.save(); O55.ui.refresh(); },
      manualOn(S) { S.sess.server.manual = true; S.save(); O55.ui.refresh(); },
      manualOff(S) { S.sess.server.manual = false; S.save(); O55.ui.refresh(); },
      platform(S, v) { S.sess.server.platform = v; S.save(); O55.ui.refresh(); },
      guide(S, plat) { O55.official.open(S, { kind: 'guide', name: PLATFORM_NAMES[plat] || plat, url: 'https://puppetmaster.app/install/' + plat }); },
      next(S) { O55.ui.go('s-confirm'); }
    },
    bind: { addr(S, v) { S.sess.server.addr = v; if (String(v).trim().toLowerCase() !== unclaimed(S).address) S.sess.server.target = null; S.save(); O55.ui.refresh(); } }
  });

  /* ------------------------------------------------------------------ S2: name it and confirm (the Server preflow's commit) */
  def('s-confirm', {
    chapter: 'computer', stage: 'server_storage_client',
    scene: (S) => ({ id: 'where', beat: 'server' }),
    eyebrow: () => T('server.confirm.eyebrow'),
    title: (S) => T('server.confirm.title', { name: unclaimed(S).name }),
    lead: () => T('server.confirm.lead'),
    body(S) {
      const sv = S.sess.server, u = unclaimed(S);
      const name = serverNameOf(S);
      if (sv.claimed) return `<div class="o55-banner" data-key="done">${C.small('check', 18)}<span>${U.esc(T('chrome.alreadyDone'))}</span></div>`;
      let out = C.identity(u.seed, words(u.seed), u.address);
      out += C.field({ bind: 'name', label: T('server.confirm.nameLabel'), value: name, placeholder: 'Home NAS', error: F.nonEmpty(name) ? '' : T('name.empty'), invalid: !F.nonEmpty(name) });
      out += F.chips('suggest', suggestions(S), name);
      const st = F.state(S, 'claim:' + u.id);
      out += C.field({ bind: 'code', label: T('server.confirm.codeLabel'), value: sv.code || '', placeholder: '482 913', hint: T('server.confirm.codeHint', { name: u.name }), error: st && st.state === 'failed' ? T('server.confirm.codeWrong', { name: u.name }) : '', invalid: st && st.state === 'failed' });
      if (st && st.state !== 'failed') out += F.phases(S, 'claim:' + u.id, ['claim', 'pair', 'check'], { claim: T('server.confirm.phases.claim', { name: name }), pair: T('server.confirm.phases.pair'), check: T('server.confirm.phases.check') });
      else out += C.note(T('server.confirm.willLine', { name }), 'info', 'lock');
      return out;
    },
    foot(S) {
      const sv = S.sess.server, st = F.state(S, 'claim:' + unclaimed(S).id);
      if (sv.claimed) return { primary: { label: T('chrome.continue'), do: 'next' } };
      const name = serverNameOf(S);
      const running = st && st.state === 'running';
      const reason = !F.nonEmpty(name) ? T('name.empty') : !F.nonEmpty(sv.code) ? T('server.confirm.codeHint', { name: unclaimed(S).name }) : running ? T('chrome.working') : '';
      return { primary: { label: T('server.confirm.button'), do: 'confirm', disabled: !!reason, reason } };
    },
    do: {
      suggest(S, v) { S.sess.server.name = v; S.save(); O55.ui.refresh(); },
      confirm(S) {
        const sv = S.sess.server, u = unclaimed(S), name = serverNameOf(S).trim();
        const ok = String(sv.code || '').replace(/\s/g, '') === u.setupCode.replace(/\s/g, '');
        sv.confirmed = true; S.save();
        F.reset(S, 'claim:' + u.id);
        F.op(S, 'claim:' + u.id, 'cmd.server.claim', [{ key: 'claim', ms: 900, fail: () => (ok ? null : 'setup_code_mismatch') }, { key: 'pair', ms: 800 }, { key: 'check', ms: 700 }], {
          payload: { server: u.id, name },
          onFail: () => { sv.confirmed = false; S.save(); },
          onDone: () => {
            sv.claimed = true; sv.id = 'pm:' + U.slug(name); sv.displayName = name; S.save();
            O55.draft.set(md(S), { server_mode: 'new_server', server_ref: sv.id, server_trust_confirmed: true, storage_mode: 'with_server', remote_mode: md(S).remote_mode === 'none' ? 'local_or_vpn' : md(S).remote_mode });
            S.save(); O55.motion.after(O55.motion.T.success, () => { if (S.sess.screen === 's-confirm') O55.ui.go('s-ready'); });
          }
        });
      },
      next(S) { O55.ui.go('s-ready'); }
    },
    bind: {
      name(S, v) { S.sess.server.name = v; S.save(); O55.ui.refresh(); },
      code(S, v) { S.sess.server.code = v; S.save(); O55.ui.refresh(); }
    }
  });

  /* ------------------------------------------------------------------ S3: ready + pairing card */
  def('s-ready', {
    chapter: 'computer', stage: 'server_storage_client',
    scene: (S) => ({ id: 'where', beat: 'server' }),
    eyebrow: () => T('server.ready.eyebrow'),
    title: (S) => T('server.ready.title', { name: S.sess.server.displayName || 'Home NAS' }),
    lead: () => T('server.ready.lead'),
    enter(S) { const sv = S.sess.server; if (!sv.pairUntil || Date.now() > sv.pairUntil) { sv.pairUntil = Date.now() + 600000; sv.pairCode = 'P' + Math.floor(1000 + Math.random() * 8999) + '-' + ['K7Q', 'M2X', 'W9T'][Math.floor(Math.random() * 3)]; S.save(); } },
    body(S) {
      const sv = S.sess.server, t = F.countdown(sv.pairUntil || Date.now()), link = 'https://' + U.slug(sv.displayName || 'home-nas') + '.local:7443/pair';
      let card = `<div class="o55-paircard" data-key="pair"><div class="o55-qrbox">${F.qr('pair-' + (sv.pairCode || ''), 132)}</div><div class="o55-pairinfo">`
        + `<span class="o55-pairtitle">${U.esc(T('server.ready.pairTitle'))}</span><span class="o55-paircode">${U.esc(sv.pairCode || '')}</span>`
        + `<span class="o55-hint">${U.esc(t.left ? T('chrome.expiresIn', { m: t.m, s: t.s }) : T('connect.pair.expired'))}</span>`
        + `<span class="o55-hint">${U.esc(T('server.ready.link'))}: ${U.esc(link)}</span>`
        + `<span class="o55-pairbtns">${O55.ui.btn({ label: T('chrome.newCode'), do: 'newCode', cls: 'o55-small' }, 'o55-secondary')}${F.copyBtn(link, 'pairlink')}</span></div></div>`;
      card += `<p class="o55-note o55-note-info" data-key="pairsub">${C.small('phone', 14)}<span>${U.esc(T('server.ready.pairSub'))}</span></p>`;
      card += `<div class="o55-sublinks" data-key="restore">${C.link(T('server.ready.restore'), 'restore')}</div>`;
      return card;
    },
    mounted(S) { F.ticker(S, 's-ready', 1000); },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      newCode(S) { S.sess.server.pairUntil = 0; O55.screens.defs['s-ready'].enter(S); O55.ui.refresh(); },
      restore(S) { S.sess.restore = { scope: 'server' }; S.save(); O55.ui.go('r-source'); },
      next(S) { S.sess.active = 'main'; S.save(); O55.ui.go('begin'); }
    },
    skipOnBack: () => false
  });

  /* ================================================================== Restore (shared) */
  const R = (S) => (S.sess.restore = S.sess.restore || { scope: 'full' });
  const racc = (S) => (R(S).access = R(S).access || {});
  /* the away-from-home route a new Server's restore sets up, if it needs setting up */
  const awayOf = (S) => { const d = md(S); return R(S).scope === 'server' && d.server_mode === 'new_server' && d.remote_mode !== 'local_or_vpn' && d.remote_mode !== 'none' ? d.remote_mode : null; };
  const restoreChapter = (S) => (R(S).scope === 'project' ? 'project' : 'computer');
  def('r-source', {
    chapter: 'computer', stage: 'first_project',
    chapterFor: (S) => restoreChapter(S),
    scene: () => ({ id: 'begin', beat: 'restore' }),
    eyebrow: () => T('restore.source.eyebrow'),
    title: () => T('restore.source.title'),
    lead: () => T('restore.source.lead'),
    enter(S, opts) { if (opts && opts.scope) R(S).scope = opts.scope; },
    body(S) {
      const r = R(S);
      let out = C.cards('source', [
        { v: 'kit', glyph: 'key', title: T('restore.source.kit.title'), sub: T('restore.source.kit.sub') },
        { v: 'folder', glyph: 'folder', title: T('restore.source.folder.title'), sub: T('restore.source.folder.sub') },
        { v: 'nas', glyph: 'server', title: T('restore.source.nas.title'), sub: T('restore.source.nas.sub') },
        { v: 'cloud', glyph: 'cloud', title: T('restore.source.cloud.title'), sub: T('restore.source.cloud.sub') }
      ], r.source, { label: T('restore.source.title') });
      if (r.source === 'nas') out += C.cards('device', S.env.devices.filter((d) => d.ssh).map((d) => ({ v: d.id, glyph: 'server', title: d.name, sub: d.brand + ' ' + d.model + ' · ' + d.address })), r.device, { cls: 'o55-choices-quiet' });
      if (r.source === 'cloud') out += C.segmented({ do: 'cloud', value: r.cloud || 'gdrive', label: T('restore.source.cloud.title'), options: [{ v: 'gdrive', label: T('safe.backup.gdrive') }, { v: 'onedrive', label: T('safe.backup.onedrive') }, { v: 's3', label: T('safe.backup.s3') }] });
      /* a bucket is reached with its access details (a cloud drive signs in on its own page, next) */
      if (r.source === 'cloud' && r.cloud === 's3' && !r.cloudSignedIn) out += O55.backup.accessFields(S, 's3', racc(S));
      if (r.source === 'cloud' && r.cloud === 's3' && F.state(S, 'restore-s3') && F.state(S, 'restore-s3').state === 'running') out += F.phases(S, 'restore-s3', ['check'], { check: T('access.checking') });
      return out;
    },
    foot(S) {
      const r = R(S), s3 = r.source === 'cloud' && r.cloud === 's3' && !r.cloudSignedIn;
      const ready = r.source && (r.source !== 'nas' || r.device) && (!s3 || O55.backup.accessReady('s3', racc(S)));
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !ready, reason: s3 && r.source ? T('protect.accessMissing') : T('missing.backup') } };
    },
    mounted(S, layer, fresh) { if (fresh && R(S).access) O55.backup.accessReset(R(S).access); },
    /* the access fields' handlers come from O55.backup (defined with the other backup helpers, loaded later) */
    bind: new Proxy({}, { get: (t, key) => (O55.backup ? O55.backup.accessBinds((S) => ['s3', racc(S)])[key] : undefined) }),
    do: {
      source(S, v) { R(S).source = v; if (v === 'cloud' && !R(S).cloud) R(S).cloud = 'gdrive'; S.save(); O55.ui.refresh(); },
      device(S, v) { R(S).device = v; S.save(); O55.ui.refresh(); },
      cloud(S, v) { R(S).cloud = v; S.save(); O55.ui.refresh(); },
      next(S) {
        const r = R(S);
        /* a cloud account needs its sign-in first (selected-source auth); a NAS uses the saved SSH key or the SSH steps */
        /* a backup on a NAS is reached over SSH like every other NAS: its identity is shown before it is trusted and
           a key is set up (the SSH steps), then the restore continues */
        if (r.source === 'nas' && !r.nasReady) {
          const n = S.sess.nas = { purpose: 'backup', method: 'ssh', device: r.device, trusted: false, installed: false, key: null };
          S.save(); return O55.ui.go('nas-identity');
        }
        if (r.source === 'cloud' && r.cloud === 's3' && !r.cloudSignedIn) {
          if (!O55.backup.accessTake(S, 's3', racc(S))) { O55.sound.play('error'); return O55.ui.refresh(); }
          return F.op(S, 'restore-s3', 'cmd.auth_profile.sign_in', [{ key: 'check', ms: 900 }], { payload: { service: 's3', method: 'access_key', credential_ref: 'credential:restore:s3' },
            onDone: () => { r.cloudSignedIn = true; S.save(); O55.ui.go('r-unlock'); } }); /* like every cloud source */
        }
        if (r.source === 'cloud' && !r.cloudSignedIn) return O55.official.signIn(S, { service: r.cloud, name: T('safe.backup.' + r.cloud), kind: 'cloud', then: 'r-unlock', done: 'restoreCloud' });
        O55.ui.go(r.source === 'kit' || r.scope !== 'project' ? 'r-unlock' : 'r-pick');
      }
    }
  });

  def('r-unlock', {
    chapter: 'computer', stage: 'first_project', chapterFor: (S) => restoreChapter(S),
    scene: () => ({ id: 'begin', beat: 'restore' }),
    eyebrow: () => T('restore.unlock.eyebrow'),
    title: () => T('restore.unlock.title'),
    lead: () => T('restore.unlock.lead'),
    body(S) {
      const r = R(S);
      return C.field({ bind: 'phrase', type: 'password', protected: true, label: T('restore.unlock.label'), value: '', placeholder: '', hint: r.bad ? '' : T('restore.unlock.hint'), error: r.bad ? T('restore.unlock.wrong') : '', invalid: r.bad, autocomplete: 'off' })
        + (r.unlocked ? C.note(T('chrome.alreadyDone'), 'ok', 'check') : '');
    },
    foot: (S) => ({ primary: { label: T('chrome.continue'), do: 'unlock', disabled: !R(S).unlocked && !R(S).typed, reason: T('restore.unlock.label') } }),
    do: {
      unlock(S) {
        const r = R(S);
        if (!r.unlocked) {
          const input = S.root.querySelector('#o55f-phrase');
          const v = input ? input.value.trim().toLowerCase().replace(/\s+/g, ' ') : '';
          if (v !== S.env.recoveryPhrase) { r.bad = true; S.save(); O55.sound.play('error'); O55.ui.refresh(); O55.ui.shake('phrase'); return; }
          r.unlocked = true; r.bad = false; if (input) input.value = '';
        }
        S.save(); O55.ui.go('r-pick');
      }
    },
    /* the phrase field is empty whenever the screen is drawn afresh (after Back or a reload), so an earlier "typed" no
       longer counts */
    mounted(S, layer, fresh) { const r = R(S); if (fresh && r.typed && !r.unlocked) { r.typed = false; r.bad = false; S.save(); O55.ui.refresh(); } },
    /* the phrase is read from the field on submit and never stored in the session */
    bind: { phrase(S, v) { const r = R(S); const had = !!r.typed; r.typed = v.length > 0; r.bad = false; if (had !== r.typed) O55.ui.refresh(); } }
  });

  def('r-pick', {
    chapter: 'computer', stage: 'first_project', chapterFor: (S) => restoreChapter(S),
    scene: () => ({ id: 'begin', beat: 'restore' }),
    eyebrow: () => T('restore.pick.eyebrow'),
    title: () => T('restore.pick.title'),
    lead: () => T('restore.pick.lead'),
    body(S) {
      const r = R(S);
      if (r.scope === 'project') {
        const opts = [];
        S.env.backups.forEach((b) => b.snapshots.forEach((snap, i) => opts.push({ v: b.id + '#' + i, glyph: 'history', title: T('restore.pick.project', { project: b.project, where: b.where }), sub: snap })));
        return C.cards('pick', opts, r.pick, { label: T('restore.pick.title') });
      }
      return C.cards('pick', S.env.fullBackups.map((b) => ({ v: b.id, glyph: 'history', title: T('restore.pick.full', { label: b.label.replace(/^Everything from /, '') }), sub: b.when + ' · ' + T('connect.route.projects', { n: b.projects }) })), r.pick, { label: T('restore.pick.title') });
    },
    foot: (S) => ({ primary: { label: T('chrome.continue'), do: 'next', disabled: !R(S).pick, reason: T('missing.backup') } }),
    do: {
      pick(S, v) { R(S).pick = v; S.save(); O55.ui.refresh(); },
      next(S) {
        const r = R(S);
        if (r.scope === 'project') {
          const [bid] = r.pick.split('#'), b = S.env.backups.find((x) => x.id === bid);
          const transport = r.source === 'nas' ? 'ssh' : r.source === 'cloud' ? 'mounted' : 'local';
          /* the place the backup came from is suggested as the new backup's place (marked, so it leaves with the restore) */
          if (!S.sess.backup.dest && (r.source === 'nas' || r.source === 'cloud')) { S.sess.backup.dest = r.source === 'nas' ? 'nas' : (r.cloud || 'gdrive'); S.sess.backup.fromRestore = true; }
          O55.draft.set(md(S), { project_mode: 'restore', backup_source_ref: 'backup:' + U.slug(b.where) + '/' + U.slug(b.project) + '#' + r.pick.split('#')[1], backup_transport: transport, project_name: md(S).project_name || b.project });
          if (r.source === 'cloud') S.sess.gaps = Object.assign(S.sess.gaps || {}, { cloudBackupTransport: true });
          S.save(); return O55.ui.go('name');
        }
        /* a Server being set up now is asked how to reach it away from home before its restore is confirmed (it was set
           silently to local only; logic crawl); the answer is set up as part of the restore */
        if (r.scope === 'server' && md(S).server_mode === 'new_server' && !r.awayAsked) { r.awayAsked = true; S.sess.ui.awayReturn = 'r-preview'; S.save(); return O55.ui.go('away'); }
        O55.ui.go('r-preview');
      }
    }
  });

  def('r-preview', {
    chapter: 'computer', stage: 'first_project',
    scene: () => ({ id: 'begin', beat: 'restore' }),
    eyebrow: () => T('restore.preview.eyebrow'),
    title: () => T('restore.preview.title'),
    lead: () => T('restore.preview.lead'),
    body(S) {
      const r = R(S), b = S.env.fullBackups.find((x) => x.id === r.pick) || S.env.fullBackups[0];
      let out = `<ul class="o55-will" data-key="what">`
        + [['stack', T('restore.preview.projects', { n: b.projects })], ['spark', T('restore.preview.accounts', { n: b.accounts })], ['history', T('restore.preview.settings')]]
          /* on a new Server, the access chosen away from home is part of what Restore confirms */
          .concat(awayOf(S) ? [['globe', T('restore.preview.away', { how: awayOf(S) === 'tailscale' ? 'Tailscale' : awayOf(S) === 'reverse_proxy' ? md(S).proxy_hostname : T('away.link.title') })]] : []).map(([g, t]) => `<li>${C.small(g, 14)}<span>${U.esc(t)}</span></li>`).join('') + '</ul>';
      out += C.note(T('restore.preview.never'), 'info', 'lock');
      const st = F.state(S, 'restore:' + r.pick);
      const rp = (st && st.phases || []).some((x) => x.key === 'remote') ? ['remote'] : [];
      if (st) out += F.phases(S, 'restore:' + r.pick, ['fetch', 'check', 'projects', 'settings'].concat(rp), { remote: T('restore.apply.phases.remote'), fetch: T('restore.apply.phases.fetch'), check: T('restore.apply.phases.check'), projects: T('restore.apply.phases.projects'), settings: T('restore.apply.phases.settings') });
      return out;
    },
    foot(S) {
      const st = F.state(S, 'restore:' + R(S).pick);
      if (st && st.state === 'done') return { primary: { label: T('chrome.continue'), do: 'done' } };
      return { primary: { label: T('restore.preview.button'), do: 'apply', disabled: !!(st && st.state === 'running'), reason: T('chrome.working') } };
    },
    do: {
      apply(S) {
        const r = R(S);
        r.confirmed = true; /* the Restore button is the restore preflow's own confirmation */
        S.save();
        const d = md(S), remote = r.scope === 'server' && d.server_mode === 'new_server' && d.remote_mode !== 'local_or_vpn' && d.remote_mode !== 'none';
        /* the Restore button stands in for Review on this path: the preview listed the access being set up */
        if (remote) O55.owners.dispatch(d.remote_mode === 'tailscale' ? 'cmd.remote_access.tailscale.setup.start' : d.remote_mode === 'reverse_proxy' ? 'cmd.remote_access.proxy.generate' : 'cmd.remote_access.remote_link.setup', { draft: d.project_draft_ref, restore: r.pick }, Object.assign(S.ctx(), { reviewConfirmed: true }), () => ({ ok: true }));
        F.op(S, 'restore:' + r.pick, 'cmd.restore.apply', [{ key: 'fetch', ms: 900 }, { key: 'check', ms: 700 }, { key: 'projects', ms: 1100 }, { key: 'settings', ms: 600 }].concat(remote ? [{ key: 'remote', ms: 900 }] : []), {
          payload: { scope: r.scope, backup: r.pick, remote_mode: remote ? d.remote_mode : null },
          onDone: () => { r.done = true; S.save(); O55.motion.after(O55.motion.T.success, () => { if (S.sess.screen === 'r-preview') O55.ui.go('r-done'); }); }
        });
      },
      done(S) { O55.ui.go('r-done'); }
    }
  });

  def('r-done', {
    chapter: 'ready', stage: 'ready',
    scene: () => ({ id: 'hero', beat: 'ready' }),
    eyebrow: () => T('restore.done.eyebrow'),
    title: (S) => (R(S).scope === 'server' ? T('restore.done.titleServer', { name: S.sess.server.displayName || 'Home NAS' }) : T('restore.done.titleHere')),
    lead: (S) => T('restore.done.lead', { n: (S.env.fullBackups.find((x) => x.id === R(S).pick) || S.env.fullBackups[0]).projects }),
    body(S) {
      const r = R(S), b = S.env.fullBackups.find((x) => x.id === r.pick) || S.env.fullBackups[0], projects = b.projectList.map((name) => ({ id: U.slug(name), name }));
      let out = C.group(T('ready.project'), C.cards('pickProject', projects.map((p) => ({ v: p.id, glyph: 'folder', title: p.name })), r.open || projects[0].id));
      out += `<button type="button" class="o55-card o55-card-link" data-o55-do="createNew" data-pm-hover-exempt="true" data-key="create">${C.glyph('seed')}<span class="o55-cardtext"><span class="o55-cardtitle">${U.esc(T('restore.done.create'))}</span></span><span class="o55-cardarrow" aria-hidden="true">›</span></button>`;
      return out;
    },
    foot(S) {
      const tour = O55.tour && O55.tour.start;
      return { secondary: tour ? [{ label: T('restore.done.enter'), do: 'enter' }] : [], primary: tour ? { label: T('ready.tour'), do: 'tour' } : { label: T('restore.done.enter'), do: 'enter' } };
    },
    do: {
      pickProject(S, id) { R(S).open = id; S.save(); O55.ui.refresh(); },
      createNew(S, arg, el) { S.sess.active = 'main'; O55.draft.set(md(S), { project_mode: 'new' }); S.save(); O55.ui.charm(el, T('begin.new.title'), 'seed'); O55.ui.go('begin'); },
      enter(S) { O55.finish(S, { tour: false, project: R(S).open || U.slug(S.env.fullBackups[0].projectList[0]) }); },
      tour(S) { O55.finish(S, { tour: true, project: R(S).open || U.slug(S.env.fullBackups[0].projectList[0]) }); }
    }
  });
})();
