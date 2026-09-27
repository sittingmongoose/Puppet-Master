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

  /* Owner-result gating (SRV-004/SRV-005 §4.2): claim, bootstrap, waiting PairingRun, explicit human identity
     confirmation, and approve-with-ClientTrustRecord are five separate adopted outcomes. Claim/bootstrap never
     imply trust. Transport (F.op phases) never mints anything; only O55.ownerResults.adopt() does, and the default
     browser without a host adopts nothing — pending with retry. Pairing invite codes and candidate identity words
     live only in O55.ephemeral (memory); the persisted session keeps generation/expiry/ids/trust, never raw code. */
  const setupCodes = new Map(); // one-time claim input; never part of S.sess
  const OR = () => O55.ownerResults;
  const EPH = () => O55.ephemeral;
  const selfCandidate = (S) => 'candidate:' + U.slug(S.env.client.name);
  const claimChain = (S) => {
    const u = unclaimed(S);
    return { claim: F.state(S, 'claim:' + u.id), boot: F.state(S, 'bootstrap:' + u.id), reach: F.state(S, 'selfpair:' + u.id), ok: F.state(S, 'selfapprove:' + u.id) };
  };
  const adoptedRow = (label, adopted, transport, failed) => ({ key: label, label,
    status: adopted ? 'done' : failed ? 'failed' : transport && transport.state === 'running' ? 'active' : transport && transport.state === 'done' ? 'waiting' : 'waiting' });
  /* Attempt to adopt the injected test-only fixture for a request; default (no fixture/host) stays pending. */
  const tryAdopt = (req, curGen) => {
    if (!req || !OR() || !OR().take || !OR().adopt) return { ok: false, reason: 'host_unavailable' };
    return OR().adopt(req, OR().take(req.id), curGen != null ? { generation: curGen } : {});
  };
  const pendingCopy = (reason) => {
    if (reason === 'host_unavailable' || reason === 'pending_no_result' || reason === 'fixture_not_injected') return T('server.confirm.pendingHost');
    if (reason === 'stale_generation' || reason === 'stale_nonce') return T('server.ready.staleAdopt');
    if (reason === 'wrong_target' || reason === 'wrong_operation') return T('server.ready.wrongTarget');
    if (reason === 'duplicate_replay') return T('server.ready.replayAdopt');
    if (reason === 'postcondition_missing' || reason === 'postcondition_not_separate') return T('server.confirm.evidenceMissing');
    return T('server.confirm.ownerFail', { reason: String(reason || 'refused') });
  };

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

  /* Staged adoption: each transport completion attempts to adopt its matching owner result. A missing,
     failed, refused, stale, or wrong-target result keeps setup pending with retry and never advances. */
  function adoptClaim(S) {
    const sv = S.sess.server, u = unclaimed(S);
    const v = tryAdopt(sv.orClaimReq);
    if (!v.ok) { sv.orClaimErr = v.reason; S.save(); O55.ui.refresh(); return; }
    sv.orClaimOk = true; sv.orClaimErr = null;
    if (!sv.orBootReq) sv.orBootReq = OR().begin('cmd.server.bootstrap.start', { server: u.id });
    sv.orBootErr = null; S.save();
    const name = serverNameOf(S).trim(), form = (sv.kind || 'nas') === 'nas' ? 'container' : 'standalone';
    F.reset(S, 'bootstrap:' + u.id);
    F.op(S, 'bootstrap:' + u.id, 'cmd.server.bootstrap.start', [{ key: 'roots', ms: 800 }, { key: 'baseline', ms: 700 }, { key: 'ready', ms: 500 }], {
      payload: { server: u.id, name, execution_form: form },
      onDone: () => { adoptBoot(S); }
    });
    O55.ui.refresh();
  }
  function adoptBoot(S) {
    const sv = S.sess.server, u = unclaimed(S);
    const v = tryAdopt(sv.orBootReq);
    if (!v.ok) { sv.orBootErr = v.reason; S.save(); O55.ui.refresh(); return; }
    sv.orBootOk = true; sv.orBootErr = null;
    if (!sv.orRunReq) sv.orRunReq = OR().begin('cmd.client.pair.start', { server: u.id, client: S.env.client.id, candidate: selfCandidate(S), generation: sv.selfPairGen });
    sv.orRunErr = null; S.save();
    F.reset(S, 'selfpair:' + u.id);
    F.op(S, 'selfpair:' + u.id, 'cmd.client.pair.start', [{ key: 'reach', ms: 700 }], {
      payload: { server: u.id, pairing_candidate_id: selfCandidate(S), method: 'setup_code' },
      onDone: () => { adoptSelfRun(S); }
    });
    O55.ui.refresh();
  }
  function adoptSelfRun(S) {
    const sv = S.sess.server, u = unclaimed(S);
    const res = OR().take(sv.orRunReq && sv.orRunReq.id);
    const v = tryAdopt(sv.orRunReq);
    if (!v.ok) { sv.orRunErr = v.reason; S.save(); O55.ui.refresh(); return; }
    sv.orRunOk = true; sv.orRunErr = null; sv.selfRun = { id: res.pairing_run.id, generation: res.pairing_run.generation, expires_at: res.pairing_run.expires_at };
    if (res && res.identity && res.identity.words && EPH()) EPH().setWords('self:' + u.id, res.identity.words);
    S.save(); O55.ui.refresh();
  }
  function adoptSelfApprove(S) {
    const sv = S.sess.server, u = unclaimed(S);
    if (!sv.orApproveReq) { sv.orApproveErr = 'pending_no_result'; S.save(); O55.ui.refresh(); return; }
    if (!sv.selfConfirmed || !sv.selfRun || sv.selfRun.generation !== sv.selfPairGen || sv.selfRun.expires_at <= Date.now() || !(EPH() && EPH().getWords('self:' + u.id))) { sv.orApproveErr = 'waiting_pairing_identity_missing'; S.save(); O55.ui.refresh(); return; }
    const res = OR().take(sv.orApproveReq.id);
    const v = tryAdopt(sv.orApproveReq);
    if (!v.ok) { sv.orApproveErr = v.reason; S.save(); O55.ui.refresh(); return; }
    const trustId = res.trust.id;
    const name = serverNameOf(S).trim();
    sv.claimed = true; sv.id = u.id; sv.displayName = name; sv.selfTrustId = trustId; sv.orApproveErr = null; S.save();
    O55.draft.set(md(S), { server_mode: 'new_server', server_ref: sv.id, server_trust_confirmed: true, storage_mode: 'with_server', remote_mode: md(S).remote_mode === 'none' ? 'local_or_vpn' : md(S).remote_mode });
    S.save(); O55.motion.after(O55.motion.T.success, () => { if (S.sess.screen === 's-confirm') O55.ui.go('s-ready'); });
    O55.ui.refresh();
  }

  /* ------------------------------------------------------------------ S2: name it and confirm (the Server preflow's commit) */
  def('s-confirm', {
    chapter: 'computer', stage: 'server_storage_client',
    scene: (S) => ({ id: 'where', beat: 'server' }),
    eyebrow: () => T('server.confirm.eyebrow'),
    enter(S) { delete S.sess.server.code; S.save(); },
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
      const failedCode = (st && st.state === 'failed') || sv.orClaimErr === 'setup_code_mismatch';
      out += C.field({ bind: 'code', label: T('server.confirm.codeLabel'), value: setupCodes.get(u.id) || '', placeholder: '482 913', hint: T('server.confirm.codeHint', { name: u.name }), error: failedCode ? T('server.confirm.codeWrong', { name: u.name }) : '', invalid: failedCode });
      if (!sv.orClaimReq) { out += C.note(T('server.confirm.willLine', { name }), 'info', 'lock'); return out; }
      const ch = claimChain(S);
      out += C.phases([
        adoptedRow(T('server.confirm.phases.claim', { name: name }), sv.orClaimOk, ch.claim, !!sv.orClaimErr),
        adoptedRow(T('server.confirm.phases.setup', { name: name }), sv.orBootOk, ch.boot, !!sv.orBootErr),
        adoptedRow(T('server.confirm.phases.check'), sv.orRunOk, ch.reach, !!sv.orRunErr),
        adoptedRow(T('server.confirm.phases.approval'), false, ch.ok, !!sv.orApproveErr)
      ]);
      const err = sv.orApproveErr || sv.orRunErr || sv.orBootErr || sv.orClaimErr;
      if (err && err !== 'setup_code_mismatch') out += C.note(pendingCopy(err), err === 'host_unavailable' || err === 'pending_no_result' ? 'info' : 'warn', 'server');
      /* This Client's own waiting request: visible candidate identity confirmation, never auto-approved. */
      if (sv.orRunOk && !sv.claimed) {
        const w = (EPH() && EPH().getWords('self:' + u.id)) || '';
        out += `<div class="o55-row" data-key="selfcand">${C.small('computer', 18)}`
          + `<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('server.confirm.selfTitle'))}</span>`
          + `<span class="o55-rowmeta">${U.esc(w || T('server.ready.wordsMissing'))}</span></span></div>`;
        out += `<p class="o55-hint" data-key="selfhint">${U.esc(T('server.confirm.selfHint'))}</p>`;
        out += `<div class="o55-checkline" data-key="selfmatch"><button type="button" role="checkbox" aria-checked="${sv.selfConfirmed ? 'true' : 'false'}" class="o55-check${sv.selfConfirmed ? ' is-on' : ''}" data-o55-do="selfMatch" data-pm-hover-exempt="true">${sv.selfConfirmed ? C.small('check', 13) : ''}</button><span>${U.esc(T('server.confirm.matchWords'))}</span></div>`;
      }
      return out;
    },
    foot(S) {
      const sv = S.sess.server, ch = claimChain(S), u = unclaimed(S);
      if (sv.claimed) return { primary: { label: T('chrome.continue'), do: 'next' } };
      const name = serverNameOf(S);
      const running = [ch.claim, ch.boot, ch.reach, ch.ok].some((st) => st && st.state === 'running');
      if (running) return { primary: { label: T('chrome.working'), do: 'noop', disabled: true, reason: T('chrome.working') } };
      if (!sv.orClaimReq) {
        const reason = !F.nonEmpty(name) ? T('name.empty') : !F.nonEmpty(setupCodes.get(u.id)) ? T('server.confirm.codeHint', { name: u.name }) : '';
        return { primary: { label: T('server.confirm.button'), do: 'confirm', disabled: !!reason, reason } };
      }
      if (!sv.orClaimOk || !sv.orBootOk || !sv.orRunOk) return { primary: { label: T('server.confirm.retry'), do: 'retry' } };
      if (!sv.selfConfirmed || !(EPH() && EPH().getWords('self:' + u.id))) return { primary: { label: T('server.confirm.approveSelf'), do: 'approveSelf', disabled: true, reason: T('server.confirm.matchWords') } };
      if (F.state(S, 'selfapprove:' + u.id) && !sv.orApproveErr) return { primary: { label: T('server.confirm.retry'), do: 'retry' } };
      return { primary: { label: T('server.confirm.approveSelf'), do: 'approveSelf' } };
    },
    do: {
      suggest(S, v) { S.sess.server.name = v; S.save(); O55.ui.refresh(); },
      noop() {},
      selfMatch(S) { if (!(EPH() && EPH().getWords('self:' + unclaimed(S).id))) return; S.sess.server.selfConfirmed = !S.sess.server.selfConfirmed; S.save(); O55.ui.refresh(); },
      confirm(S) {
        const sv = S.sess.server, u = unclaimed(S), name = serverNameOf(S).trim();
        const ok = String(setupCodes.get(u.id) || '').replace(/\s/g, '') === u.setupCode.replace(/\s/g, '');
        setupCodes.delete(u.id); delete sv.code; sv.selfPairGen = (sv.selfPairGen || 0) + 1; sv.selfRun = null; if (EPH()) EPH().clearWords('self:' + u.id);
        sv.orClaimReq = OR().begin('cmd.server.claim', { server: u.id });
        sv.orClaimOk = false; sv.orClaimErr = null; sv.orBootReq = null; sv.orBootOk = false; sv.orBootErr = null;
        sv.orRunReq = null; sv.orRunOk = false; sv.orRunErr = null; sv.selfConfirmed = false;
        sv.orApproveReq = null; sv.orApproveErr = null; sv.confirmed = true; S.save();
        F.reset(S, 'claim:' + u.id);
        F.op(S, 'claim:' + u.id, 'cmd.server.claim', [{ key: 'claim', ms: 900, fail: () => (ok ? null : 'setup_code_mismatch') }], {
          payload: { server: u.id, name },
          onFail: () => { sv.confirmed = false; sv.orClaimErr = 'setup_code_mismatch'; S.save(); O55.ui.refresh(); },
          /* Transport done is not a claim: adoption of a matching owner result is still required. */
          onDone: () => { adoptClaim(S); }
        });
      },
      retry(S) {
        const sv = S.sess.server;
        if (!sv.orClaimOk) return adoptClaim(S);
        if (!sv.orBootOk) return adoptBoot(S);
        if (!sv.orRunOk) return adoptSelfRun(S);
        if (sv.selfConfirmed) return adoptSelfApprove(S);
        O55.ui.refresh();
      },
      approveSelf(S) {
        const sv = S.sess.server, u = unclaimed(S);
        if (!sv.orRunOk || !sv.selfConfirmed || sv.claimed || !sv.selfRun || sv.selfRun.expires_at <= Date.now() || !(EPH() && EPH().getWords('self:' + u.id))) return;
        if (!sv.orApproveReq) sv.orApproveReq = OR().begin('cmd.client.pair.approve', { server: u.id, candidate: selfCandidate(S), client: S.env.client.id, generation: sv.selfPairGen, run_id: sv.selfRun.id });
        sv.orApproveErr = null; S.save();
        F.reset(S, 'selfapprove:' + u.id);
        F.op(S, 'selfapprove:' + u.id, 'cmd.client.pair.approve', [{ key: 'approve', ms: 800 }], {
          payload: { server: u.id, pairing_candidate_id: selfCandidate(S), client: S.env.client.id },
          onDone: () => { adoptSelfApprove(S); }
        });
      },
      next(S) { O55.ui.go('s-ready'); }
    },
    bind: {
      name(S, v) { S.sess.server.name = v; S.save(); O55.ui.refresh(); },
      code(S, v) { setupCodes.set(unclaimed(S).id, String(v)); delete S.sess.server.code; O55.ui.refresh(); }
    }
  });

  /* ------------------------------------------------------------------ S3: ready + pairing card */
  /* The pairing console: the invite a nearby device answers, a waiting request only this person can approve, and the
     devices already trusted. Expiring or rotating the invite retires only the invite (SRV-004): a device whose
     ClientTrustRecord was issued stays paired. Only a waiting request of the current invite generation can be approved. */
  const GUEST = { id: 'client:phone', name: "Jared's iPhone" };
  const guestCandidateId = (S) => 'pairing_candidate:' + U.slug(GUEST.name) + ':' + (S.sess.server.pairGen || 0);
  function newInvite(S) {
    const sv = S.sess.server;
    sv.pairGen = (sv.pairGen || 0) + 1;
    /* memory-only code: never written to the persisted session (finding 5). A reload loses it by design. */
    if (EPH()) EPH().setInvite(sv.pairGen, 'P' + Math.floor(1000 + Math.random() * 8999) + '-' + ['K7Q', 'M2X', 'W9T'][Math.floor(Math.random() * 3)]);
    sv.pairUntil = Date.now() + 600000;
    sv.inviteId = 'pairingrun:' + (sv.id || 'pm:new') + ':' + sv.pairGen;
    sv.runReqs = sv.runReqs || {}; sv.runOk = sv.runOk || {};
    delete sv.pairCode; delete sv.candidateAt; /* legacy durable code/timer must not persist */
    S.save();
  }
  /* A waiting candidate appears only after its current-generation PairingRun owner result is adopted. No timer
     fabricates a request: the default preview shows "no requests yet" with the invite still usable. */
  function ensureRunReq(S) {
    const sv = S.sess.server;
    sv.runReqs = sv.runReqs || {};
    if (!sv.runReqs[sv.pairGen]) sv.runReqs[sv.pairGen] = OR().begin('cmd.client.pair.start', { server: sv.id, client: GUEST.id, candidate: guestCandidateId(S), generation: sv.pairGen });
    S.save();
    return sv.runReqs[sv.pairGen];
  }
  function pollGuestRun(S) {
    const sv = S.sess.server;
    if (!inviteOpen(S)) return;
    if ((sv.candidates || []).some((c) => c.state === 'waiting' && c.gen === sv.pairGen)) return;
    const req = ensureRunReq(S);
    const res = OR().take(req.id);
    const v = tryAdopt(req, sv.pairGen);
    if (!v.ok) { sv.runErr = v.reason; S.save(); return; }
    sv.runErr = null;
    sv.runOk = sv.runOk || {}; sv.runOk[guestCandidateId(S)] = true;
    if (res && res.identity && res.identity.words && EPH()) EPH().setWords(guestCandidateId(S), res.identity.words);
    sv.candidates = (sv.candidates || []).concat([{ id: guestCandidateId(S), name: GUEST.name, gen: sv.pairGen, run_id: res.pairing_run.id, run_until: res.pairing_run.expires_at, state: 'waiting', confirmed: false }]);
    S.save();
  }
  const inviteOpen = (S) => Date.now() <= (S.sess.server.pairUntil || 0);
  function adoptGuestApprove(S, c) {
    const sv = S.sess.server;
    sv.approveReqs = sv.approveReqs || {};
    const req = sv.approveReqs[c.id];
    if (!req) return;
    if (c.state !== 'waiting' || c.gen !== sv.pairGen || !inviteOpen(S) || c.run_until <= Date.now() || !c.confirmed || !(EPH() && EPH().getWords(c.id))) { sv.approveErr = 'stale_generation'; S.save(); O55.ui.refresh(); return; }
    const res = OR().take(req.id);
    const v = tryAdopt(req, sv.pairGen);
    if (!v.ok) { sv.approveErr = v.reason; S.save(); O55.ui.refresh(); return; }
    sv.approveErr = null;
    c.state = 'approved';
    const trustId = res.trust.id;
    sv.paired = (sv.paired || []).concat([{ id: trustId, name: c.name }]);
    S.save(); O55.ui.refresh();
  }
  def('s-ready', {
    chapter: 'computer', stage: 'server_storage_client',
    scene: (S) => ({ id: 'where', beat: 'server' }),
    eyebrow: () => T('server.ready.eyebrow'),
    title: (S) => T('server.ready.title', { name: S.sess.server.displayName || 'Home NAS' }),
    lead: () => T('server.ready.lead'),
    enter(S) { const sv = S.sess.server; delete sv.pairCode; delete sv.candidateAt; if (!sv.pairUntil || Date.now() > sv.pairUntil) newInvite(S); else if (EPH() && !EPH().getInvite(sv.pairGen)) newInvite(S); },
    body(S) {
      const sv = S.sess.server, t = F.countdown(sv.pairUntil || Date.now()), link = 'https://' + U.slug(sv.displayName || 'home-nas') + '.local:7443/pair';
      const code = (EPH() && EPH().getInvite(sv.pairGen)) || '';
      let card = `<div class="o55-paircard" data-key="pair"><div class="o55-qrbox">${code ? F.qr('pair-' + code, 132) : ''}</div><div class="o55-pairinfo">`
        + `<span class="o55-pairtitle">${U.esc(T('server.ready.pairTitle'))}</span><span class="o55-paircode">${U.esc(code || T('server.ready.codeMissing'))}</span>`
        + `<span class="o55-hint">${U.esc(t.left ? T('chrome.expiresIn', { m: t.m, s: t.s }) : T('connect.pair.expired'))}</span>`
        + `<span class="o55-hint">${U.esc(T('server.ready.link'))}: ${U.esc(link)}</span>`
        + `<span class="o55-pairbtns">${O55.ui.btn({ label: T('chrome.newCode'), do: 'newCode', cls: 'o55-small' }, 'o55-secondary')}${F.copyBtn(link, 'pairlink')}</span></div></div>`;
      card += `<p class="o55-note o55-note-info" data-key="pairsub">${C.small('phone', 14)}<span>${U.esc(T('server.ready.pairSub'))}</span></p>`;
      let shownWaiting = false;
      (sv.candidates || []).forEach((c) => {
        const fresh = inviteOpen(S) && c.gen === sv.pairGen;
        const runOk = sv.runOk && sv.runOk[c.id];
        if (c.state === 'waiting' && fresh && runOk) {
          shownWaiting = true;
          const w = (EPH() && EPH().getWords(c.id)) || '';
          const apSt = F.state(S, 'approve:' + c.id), running = apSt && apSt.state === 'running';
          const canApprove = !!c.confirmed && !running;
          card += `<div class="o55-row" data-key="cand-${U.esc(U.slug(c.id))}">${C.small('phone', 18)}`
            + `<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('server.ready.waiting', { name: c.name }))}</span>`
            + `<span class="o55-rowmeta">${U.esc(w || T('server.ready.wordsMissing'))}</span></span>`
            + `<span class="o55-pairbtns">${O55.ui.btn({ label: T('server.ready.approve'), do: 'approve', arg: c.id, cls: 'o55-small', disabled: !canApprove, reason: c.confirmed ? T('chrome.working') : T('server.ready.confirmWords') }, 'o55-primary')}${O55.ui.btn({ label: T('server.ready.deny'), do: 'deny', arg: c.id, cls: 'o55-small' }, 'o55-secondary')}</span></div>`;
          card += `<p class="o55-hint" data-key="candhint-${U.esc(U.slug(c.id))}">${U.esc(T('server.ready.waitingHint', { name: c.name }))}</p>`;
          card += `<div class="o55-checkline" data-key="match-${U.esc(U.slug(c.id))}"><button type="button" role="checkbox" aria-checked="${c.confirmed ? 'true' : 'false'}" class="o55-check${c.confirmed ? ' is-on' : ''}" data-o55-do="match" data-o55-arg="${U.esc(c.id)}" data-pm-hover-exempt="true">${c.confirmed ? C.small('check', 13) : ''}</button><span>${U.esc(T('server.ready.confirmWords'))}</span></div>`;
          if (running) card += F.phases(S, 'approve:' + c.id, ['approve'], { approve: T('chrome.working') });
          if (sv.approveErr) card += C.note(pendingCopy(sv.approveErr), 'warn', 'phone');
        } else if (c.state === 'waiting') {
          /* a request from an expired or rotated invite, or without an adopted waiting run, is stale: never approvable */
          card += `<div class="o55-row o55-row-wait" data-key="stale-${U.esc(U.slug(c.id))}">${C.small('phone', 18)}`
            + `<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('server.ready.staleReq', { name: c.name }))}</span></span></div>`;
        }
      });
      if (!shownWaiting && inviteOpen(S)) {
        card += `<p class="o55-hint" data-key="norun">${U.esc(T('server.ready.noRequests'))}</p>`;
        if (sv.runErr && sv.runErr !== 'host_unavailable' && sv.runErr !== 'pending_no_result') card += C.note(pendingCopy(sv.runErr), 'warn', 'phone');
        else card += `<div class="o55-sublinks" data-key="checkrun">${C.link(T('server.ready.retry'), 'checkRun')}</div>`;
      }
      if (!inviteOpen(S)) card += `<div class="o55-sublinks" data-key="expirednew">${C.link(T('chrome.newCode'), 'newCode')}</div>`;
      if ((sv.paired || []).length) {
        const rows = sv.paired.map((p) => `<div class="o55-row" data-key="paired-${U.esc(U.slug(p.id))}">${C.small('check', 18)}`
          + `<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(p.name)}</span><span class="o55-rowmeta">${U.esc(T('server.ready.pairedDev'))}</span></span></div>`).join('');
        card += C.group(T('server.ready.pairedTitle'), rows + `<p class="o55-hint" data-key="pairedsub">${U.esc(T('server.ready.pairedSub'))}</p>`);
      }
      card += `<div class="o55-sublinks" data-key="restore">${C.link(T('server.ready.restore'), 'restore')}</div>`;
      return card;
    },
    mounted(S) { F.ticker(S, 's-ready', 1000); pollGuestRun(S); if (S.open && S.sess.screen === 's-ready') O55.ui.refresh(); },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      match(S, id) { const sv = S.sess.server, c = (sv.candidates || []).find((x) => x.id === id); if (!c || !(EPH() && EPH().getWords(c.id))) return; c.confirmed = !c.confirmed; S.save(); O55.ui.refresh(); },
      checkRun(S) { pollGuestRun(S); O55.ui.refresh(); },
      approve(S, id) {
        const sv = S.sess.server, c = (sv.candidates || []).find((x) => x.id === id);
        if (!c || c.state !== 'waiting' || c.gen !== sv.pairGen || !inviteOpen(S)) return;
        if (!(sv.runOk && sv.runOk[c.id])) return; /* guest needs a current adopted waiting run first */
        if (!c.confirmed || !c.run_id || c.run_until <= Date.now() || !(EPH() && EPH().getWords(c.id))) return; /* explicit current identity confirmation */
        const apSt = F.state(S, 'approve:' + c.id);
        if (apSt && apSt.state === 'running') return;
        sv.approveReqs = sv.approveReqs || {};
        if (!sv.approveReqs[c.id]) sv.approveReqs[c.id] = OR().begin('cmd.client.pair.approve', { server: sv.id, client: GUEST.id, candidate: c.id, generation: sv.pairGen, run_id: c.run_id });
        else { adoptGuestApprove(S, c); return; } // exactly one adoption per result
        sv.approveErr = null; S.save();
        F.reset(S, 'approve:' + c.id);
        F.op(S, 'approve:' + c.id, 'cmd.client.pair.approve', [{ key: 'approve', ms: 800 }], {
          payload: { server: sv.id, pairing_candidate_id: c.id, pairing_run: sv.inviteId },
          onDone: () => { adoptGuestApprove(S, c); }
        });
      },
      deny(S, id) {
        const sv = S.sess.server, c = (sv.candidates || []).find((x) => x.id === id);
        if (!c || c.state !== 'waiting') return;
        F.op(S, 'deny:' + c.id, 'cmd.client.pair.reject', [{ key: 'reject', ms: 500 }], {
          payload: { server: sv.id, pairing_candidate_id: c.id, reason: 'declined_by_owner' },
          onDone: () => { if (EPH()) EPH().clearWords(id); sv.candidates = sv.candidates.filter((x) => x.id !== id); S.save(); O55.ui.refresh(); }
        });
      },
      newCode(S) { newInvite(S); O55.ui.refresh(); }, /* rotates the invite only: trusted devices stay paired */
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
          S.save(); return O55.ui.go(O55.nas.entry(S)); /* a NAS running Puppet Master pairs instead (PWIZ-029) */
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
          const transport = r.source === 'nas' ? O55.nas.transport(S) : r.source === 'cloud' ? 'mounted' : 'local';
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
