/* Connect this device (journey connect_existing; canon's six stages: welcome, simple_path, remote_access_setup,
   review_setup_plan, automatic_preparation, ready). Discovery is read-only and bounded; nothing pairs until the person
   presses Connect on the review screen. The ready page offers Create a new Project, which starts a second draft
   (new_or_local on the same Server) because a connect draft can never create a Project (canon rule #1). */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const cd = (S) => S.sess.drafts.connect;
  const allServers = (S) => S.env.pmServers.concat(S.env.vpnServers || []);
  const server = (S, id) => allServers(S).find((s) => s.id === (id || cd(S).server_ref)) || null;
  const words = (seed) => O55.art.identity(seed).words.join(' ');
  const nProjects = (n) => T(n === 1 ? 'connect.route.oneProject' : 'connect.route.projects', { n });
  /* No numeric priority: O55.sound ranks coinciding events itself. Owner operations name their
     done/fail/phase sounds in opts.sound (O55.flow.op); a typed address that names a Server
     sounds `found` once, as the hint under the field turns into that Server's name. */
  const SND = { found: { intensity: 0.55 }, connect: { intensity: 0.5 } };
  /* discovery sounds, built once: mounted() runs on every refresh, and the list grows as each network answers */
  const SCAN_PHASES_LAN = [{ key: 'lan', ms: 1100 }];
  const SCAN_PHASES_VPN = [{ key: 'lan', ms: 1100 }, { key: 'vpn', ms: 800 }];
  const SCAN_SOUND = {
    lanAll: { phase: { lan: 'found' }, done: 'found', intensity: 0.55 }, /* LAN Servers, then more on the VPN (or no VPN) */
    lanOnly: { phase: { lan: 'found' }, done: false, intensity: 0.55 }, /* LAN Servers, the VPN adds none */
    vpnOnly: { phase: false, done: 'found', intensity: 0.55 },
    none: { phase: false, done: 'warn', intensity: 0.55 } };
  const PAIR_SOUND = { phase: { approve: 'found', qr: 'found' }, intensity: 0.8 };
  const CODE_SOUND = { fail: 'warn', intensity: 0.8 };
  function foundIf(before, srv) { if (srv && srv.id !== before) O55.sound.play('found', SND.found); }

  /* read-only discovery, cached per network scope (cmd.server.discovery.refresh). It looks on the local network and on
     a VPN this device is already connected to: the person turns a VPN on or off on their own device, so there is no
     switch for it here (RAS-014); the draft records that a VPN was included. */
  const vpnOn = (S) => !!S.env.here.vpn;
  function scanKey(S) { return 'discover:connect:' + (vpnOn(S) ? 'vpn' : 'lan'); }
  function scan(S) {
    const vpn = vpnOn(S);
    if (cd(S).include_vpn_networks !== vpn) { O55.draft.set(cd(S), { include_vpn_networks: vpn }); S.save(); }
    const key = scanKey(S);
    if ((F.state(S, key) || {}).state === 'done') return; /* a finished scan must not rebuild its options on every refresh */
    const lan = S.env.pmServers.length > 0, more = vpn && (S.env.vpnServers || []).length > 0;
    const sound = lan ? (more || !vpn ? SCAN_SOUND.lanAll : SCAN_SOUND.lanOnly) : more ? SCAN_SOUND.vpnOnly : SCAN_SOUND.none;
    F.op(S, key, 'cmd.server.discovery.refresh', vpn ? SCAN_PHASES_VPN : SCAN_PHASES_LAN, { payload: { scope: vpn ? 'lan+vpn' : 'lan' }, sound });
  }
  function found(S) {
    const st = F.state(S, scanKey(S)); if (!st) return [];
    const done = (k) => (st.phases || []).some((p) => p.key === k && p.status === 'done');
    return (done('lan') ? S.env.pmServers : []).concat(done('vpn') ? S.env.vpnServers || [] : []);
  }
  /* A typed address, web address or Remote Link is resolved read-only; a match names the Server under the field. */
  function resolveAddress(S, value, kind) {
    const v = String(value || '').trim().toLowerCase();
    if (!v) return null;
    if (kind === 'address') return allServers(S).find((s) => s.address.toLowerCase() === v || (s.id === 'pm:home' && v === '192.168.1.20')) || null;
    if (kind === 'proxy') return F.isHttps(v) ? S.env.pmServers[0] : null;
    if (kind === 'link') return /^[a-z][a-z0-9._:/#-]*$/.test(v) && v.length > 8 ? S.env.pmServers[0] : null;
    return null;
  }
  /* A different Server ends what was started for the one before: its pairing request (cancelled with the owner), the
     review's confirmation and this device's trust in the draft. A trust record already issued by a Server stays with
     that Server (picking it again finds it), but it never carries over to another one (SCR-01). */
  function choose(S, srv, patch) {
    const d = cd(S), c = S.sess.connect, id = srv ? srv.id : null;
    if (id !== (d.server_ref || null)) { endRun(S, 'target_changed'); unconfirm(S); }
    c.server = id;
    O55.draft.set(d, Object.assign({ server_ref: id || '' }, patch || {}));
    syncTrust(S);
    S.save();
  }
  /* the review is confirmed for one Server, one route and one way of confirming: changing any of them asks again */
  function unconfirm(S) { const c = S.sess.connect; c.confirmed = false; O55.draft.set(cd(S), { review_confirmed: false }); }

  /* ------------------------------------------------------------------ the pairing run (SRV-004, §4.2)
     One request at a time, bound to the Server, the way of confirming and a generation, with its own id. Going back to
     the review or the route, choosing another Server, route or way, its ten minutes running out, or the page closing
     ends it: the owner is told (cmd.client.pair.cancel) and nothing reported for it afterwards counts. Only a result for
     the current run of the Server on screen is adopted, as a trust record for that Server, never as a shared yes/no that
     a later choice inherits (SCR-01). A code typed for it lives in memory beside the run and is never saved; after a
     reload the old request is gone and a new one is sent, with an empty code field (SCR-02). */
  const RUN_MS = 600000;
  const live = new Set(); /* runs started in this page */
  const typed = new Map(); /* run id -> the code typed for it, memory only */
  const runKey = (r, part) => 'pair' + (part || '') + ':' + r.server + ':' + r.gen + ':' + r.nonce;
  const PARTS = ['', 'reach', 'code'];
  function runOf(S) {
    const r = S.sess.connect.run, d = cd(S);
    return r && live.has(r.id) && r.server === d.server_ref && r.method === d.connection_pairing && r.route === d.remote_mode ? r : null;
  }
  const expired = (r) => !!r && Date.now() > r.until;
  const trustOf = (S, id) => ((S.sess.connect.trusts || {})[id || cd(S).server_ref]) || null;
  /* the draft and the old flag (read by the scenario tools) follow the trust record of the Server chosen now */
  function syncTrust(S) {
    const c = S.sess.connect, d = cd(S), t = d.server_ref ? trustOf(S, d.server_ref) : null;
    c.paired = !!t;
    if (d.server_trust_confirmed !== !!t) O55.draft.set(d, { server_trust_confirmed: !!t });
  }
  const paired = (S) => !!trustOf(S) && cd(S).server_trust_confirmed;
  function startRun(S) {
    const c = S.sess.connect, d = cd(S), s = server(S);
    if (!s || paired(S)) return null;
    c.pairGen = (c.pairGen || 0) + 1;
    const r = { id: 'pairingrun:' + s.id + ':' + c.pairGen + ':' + Math.random().toString(36).slice(2, 8), server: s.id, method: d.connection_pairing, route: d.remote_mode, gen: c.pairGen, started: Date.now(), until: Date.now() + RUN_MS };
    r.nonce = r.id.split(':').pop();
    c.run = r; c.fail = null; live.add(r.id); S.save();
    kick(S, r);
    return r;
  }
  function endRun(S, reason) {
    const c = S.sess.connect, r = c.run; if (!r) return;
    PARTS.forEach((part) => { O55.owners.cancelOp(runKey(r, part)); F.reset(S, runKey(r, part)); });
    /* the requesting device's own abort before trust is issued (never a rejection, which is the approver's) */
    if (live.has(r.id) && !trustOf(S, r.server)) O55.owners.dispatch('cmd.client.pair.cancel', { server: r.server, pairing_run: r.id, generation: r.gen, reason }, S.ctx());
    live.delete(r.id); typed.delete(r.id); c.run = null; c.fail = null; S.save();
  }
  /* the fence every completion passes: the run is still the current one, for the Server, route and way on screen */
  function current(S, r) { const now = runOf(S); return !!now && now.id === r.id && now.gen === r.gen && !expired(r) && S.sess.active === 'connect'; }
  function adopt(S, r) {
    if (!current(S, r)) return false;
    const c = S.sess.connect;
    c.trusts = Object.assign({}, c.trusts, { [r.server]: { id: 'clienttrust:' + S.env.client.id + ':' + r.server + ':' + r.gen, server: r.server, client: S.env.client.id, run: r.id, gen: r.gen, method: r.method, at: Date.now() } });
    live.delete(r.id); typed.delete(r.id); c.run = null; c.fail = null;
    syncTrust(S); S.save(); O55.ui.refresh();
    return true;
  }
  /* A fixture owner's terminal answer that is not approval (Demo Studio sets one with failures.pair_once; the published
     page has no owner host). Each keeps the run's identity, so a later answer cannot touch a new request. */
  const FAIL_AT = { reach: ['unreachable', 'identity_mismatch', 'protocol_mismatch'], approve: ['denied', 'expired'], qr: ['denied', 'expired'] };
  function failOnce(S, phase) {
    const f = S.env.failures || {}, code = f.pair_once;
    if (!code || !(FAIL_AT[phase] || []).includes(code)) return null;
    f.pair_once = null; return code;
  }
  function failed(S, r, code) { if (!current(S, r)) return; S.sess.connect.fail = { run: r.id, code }; S.save(); O55.ui.refresh(); }
  function kick(S, r) {
    const s = server(S); if (!s) return;
    const payload = { server: r.server, method: r.method, pairing_run: r.id, generation: r.gen, route: r.route };
    if (r.method === 'code') {
      F.op(S, runKey(r, 'reach'), 'cmd.client.pair.start', [{ key: 'reach', ms: 700, fail: () => failOnce(S, 'reach') }], { payload, sound: CODE_SOUND, onFail: (S2, st) => failed(S, r, st.code) });
      return;
    }
    const mid = r.method === 'qr' ? { key: 'qr', ms: 1900, fail: () => failOnce(S, 'qr') } : { key: 'approve', ms: 2800, fail: () => failOnce(S, 'approve') };
    F.op(S, runKey(r), 'cmd.client.pair.start', [{ key: 'reach', ms: 700, fail: () => failOnce(S, 'reach') }, mid, { key: 'trust', ms: 800 }],
      { payload, sound: PAIR_SOUND, onDone: () => adopt(S, r), onFail: (S2, st) => failed(S, r, st.code) });
  }
  /* c-pair on arrival: the current run, or a new one when there is none (first arrival, after a reload, after Back) */
  function ensureRun(S) {
    if (paired(S)) return null;
    const r = runOf(S);
    if (r) return r;
    if (S.sess.connect.run) endRun(S, 'page_closed');
    return startRun(S);
  }

  /* Opened straight at a later connect screen (Demo Studio's Open at one screen): what the earlier screens would have
     left, the first Puppet Master found on this network chosen (step 0), the review confirmed (1), the pairing done (2)
     (QA2 hunter H1: the picture check read "undefined · undefined" and Ready "{name} has 0 Projects") */
  function seedConnect(S, step) {
    S.sess.active = 'connect';
    const d = cd(S), c = S.sess.connect;
    if (!server(S) && S.env.pmServers[0]) choose(S, S.env.pmServers[0], { remote_mode: d.remote_mode || 'local_or_vpn', server_connection_mode: 'discover' });
    if (!d.connection_pairing) O55.draft.set(d, { connection_pairing: 'approval' });
    if (step >= 1 && !c.confirmed) { c.confirmed = true; O55.draft.set(d, { review_confirmed: true }); }
    /* (a seeded trust record, as the pairing screen would have left it: Demo Studio's Open at one screen) */
    if (step >= 2 && !paired(S)) { const id = d.server_ref; c.trusts = Object.assign({}, c.trusts, { [id]: { id: 'clienttrust:' + S.env.client.id + ':' + id + ':seed', server: id, client: S.env.client.id, run: null, gen: 0, method: d.connection_pairing, at: Date.now(), seeded: true } }); syncTrust(S); }
    S.save();
  }

  /* ------------------------------------------------------------------ C1: which Puppet Master, and how to reach it */
  def('c-route', {
    chapter: 'computer', stage: 'remote_access_setup', charmSlot: 'server',
    scene: (S) => ({ id: 'where', beat: 'connect' }),
    /* (back here from the pairing, by Back or the rail: the request it left waiting ends) */
    enter(S) { S.sess.active = 'connect'; if (S.sess.connect.run && !paired(S)) endRun(S, 'back'); },
    eyebrow: () => T('connect.route.eyebrow'),
    title: () => T('connect.route.title'),
    lead: () => T('connect.route.lead'),
    body(S) {
      const d = cd(S), c = S.sess.connect, mode = d.remote_mode;
      let out = '';
      if (mode === 'local_or_vpn') {
        if (c.manual) {
          const hit = resolveAddress(S, c.addr, 'address');
          out += C.field({ bind: 'addr', label: T('connect.route.addressLabel'), value: c.addr || '', placeholder: 'home-nas.local', hint: hit ? hit.name : T('connect.route.addressHint'), valid: !!hit });
          out += `<div class="o55-sublinks" data-key="l-found">${C.link(T('connect.route.found'), 'manualOff')}</div>`;
        } else {
          const list = found(S), st = F.state(S, scanKey(S));
          if (!list.length) out += `<div class="o55-row o55-row-wait" data-key="scan" aria-busy="true">${C.loader(16)}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('connect.route.looking'))}</span></span></div>`;
          /* only what discovery may say (SRV-003): a name and an address; how many Projects a Server has is shown once
             this device is paired with it (SCR-16) */
          else out += C.cards('pickServer', list.map((s) => ({ v: s.id, glyph: 'server', title: s.name, sub: s.address, tag: s.via === 'vpn' ? 'VPN' : '' })), d.server_ref, { label: T('connect.route.found') });
          if (st && st.state === 'done' && !list.length) out += C.note(T('connect.route.none'), 'warn');
          out += C.note(T('connect.route.vpnLine'), 'info', 'link');
          out += `<div class="o55-sublinks" data-key="l-addr">${C.link(T('connect.route.address'), 'manualOn')}</div>`;
        }
      }
      /* another route's own questions sit under its card in Other ways to connect (QA round 2, Q7 and Q9: the web
         address field was above the list, far from My own web address) */
      let under = '';
      if (mode === 'tailscale') {
        under += C.segmented({ do: 'tsControl', value: d.tailscale_control || 'hosted', label: T('connect.route.tailscale.title'), options: [{ v: 'hosted', label: T('connect.route.tailscale.hosted') }, { v: 'headscale', label: T('connect.route.tailscale.headscale') }] });
        if (d.tailscale_control === 'headscale') under += C.field({ bind: 'headscale', label: T('connect.route.tailscale.headscaleLabel'), value: d.headscale_url, placeholder: 'https://headscale.example.com', hint: F.isHttps(d.headscale_url) ? '' : 'https://…', valid: F.isHttps(d.headscale_url) });
        under += C.cards('pickServer', S.env.pmServers.map((s) => ({ v: s.id, glyph: 'server', title: s.name, sub: 'Tailscale', quiet: true })), d.server_ref, { cls: 'o55-choices-quiet', label: T('connect.route.found') });
      } else if (mode === 'reverse_proxy') {
        const hit = resolveAddress(S, d.proxy_hostname, 'proxy');
        under += C.field({ bind: 'proxy', label: T('connect.route.proxy.label'), value: d.proxy_hostname, placeholder: 'https://pm.example.com', hint: hit ? hit.name : 'https://…', valid: !!hit });
        /* (its old-style explainer went: the route's ? says the same, QA round 2, Q8) */
      } else if (mode === 'remote_link') {
        const hit = resolveAddress(S, d.remote_endpoint, 'link');
        under += C.field({ bind: 'link', label: T('connect.route.link.label'), value: d.remote_endpoint, placeholder: 'pm-remote-link:home-nas/7Q2K', hint: hit ? hit.name : '', valid: !!hit });
      }
      const opts = [
        { v: 'local_or_vpn', glyph: 'link', title: T('connect.route.local'), quiet: true },
        { v: 'tailscale', glyph: 'globe', title: T('connect.route.tailscale.title'), sub: T('connect.route.tailscale.sub'), quiet: true, under: mode === 'tailscale' ? under : '' },
        { v: 'reverse_proxy', glyph: 'globe', title: T('connect.route.proxy.title'), sub: T('connect.route.proxy.sub'), quiet: true, under: mode === 'reverse_proxy' ? under : '' },
        { v: 'remote_link', glyph: 'link', title: T('connect.route.link.title'), sub: T('connect.route.link.sub'), quiet: true, under: mode === 'remote_link' ? under : '' }
      ];
      /* (open whenever another route is chosen: its questions are in there) */
      out += F.more(d.remote_more || (!!mode && mode !== 'local_or_vpn'), T('connect.route.more'), 'more', C.cards('route', opts, mode, { cls: 'o55-choices-quiet', label: T('connect.route.more') }), 'route');
      return out;
    },
    mounted(S) { if (cd(S).remote_mode === 'local_or_vpn' && !S.sess.connect.manual) scan(S); },
    foot(S) {
      const miss = O55.draft.missing(cd(S))[0];
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!miss, reason: miss ? T(miss.key) : '' } };
    },
    do: {
      pickServer(S, id, el) { const s = server(S, id); choose(S, s, { server_connection_mode: 'discover' }); O55.ui.refresh(); O55.ui.charm(el, s.name, 'server'); },
      manualOn(S) { S.sess.connect.manual = true; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); const i = S.root.querySelector('#o55f-addr'); if (i) i.focus(); },
      /* back to the list: a Server found only through the typed address is not chosen any more (C24). The field folds away. */
      manualOff(S) { const c = S.sess.connect; if (c.manual) choose(S, null, { server_connection_mode: 'discover' }); c.manual = false; S.save(); O55.ui.refresh(); O55.sound.play('unsheet'); },
      more(S) { O55.draft.set(cd(S), { remote_more: !cd(S).remote_more }); S.save(); O55.ui.refresh(); },
      /* A different route starts clean (C24): the Server found through the old one is not chosen any more, and the
         other routes' details (a web address, a Remote Link) leave the draft. The same route again changes nothing. */
      route(S, mode) {
        const d = cd(S); if (d.remote_mode === mode) { O55.draft.set(d, { remote_more: true }); S.save(); return O55.ui.refresh(); }
        const patch = { remote_mode: mode, remote_more: true, proxy_hostname: '', remote_endpoint: '', include_vpn_networks: mode === 'local_or_vpn' && vpnOn(S) };
        if (mode === 'tailscale' && !d.tailscale_control) patch.tailscale_control = 'hosted';
        patch.server_connection_mode = mode === 'reverse_proxy' || mode === 'remote_link' ? 'manual' : 'discover';
        S.sess.connect.manual = false;
        choose(S, null, patch);
        O55.ui.refresh();
      },
      /* another control server is another way in: a request sent the other way ends and the review asks again */
      tsControl(S, v) { if (cd(S).tailscale_control !== v) { endRun(S, 'route_changed'); unconfirm(S); } O55.draft.set(cd(S), { tailscale_control: v }); S.save(); O55.ui.refresh(); },
      next(S) { O55.ui.go('c-review'); }
    },
    bind: {
      addr(S, v) { S.sess.connect.addr = v; const was = cd(S).server_ref, hit = resolveAddress(S, v, 'address'); choose(S, hit, { server_connection_mode: 'manual' }); O55.ui.refresh(); foundIf(was, hit); },
      headscale(S, v) { O55.draft.set(cd(S), { headscale_url: v.trim() }); S.save(); O55.ui.refresh(); },
      proxy(S, v) { const was = cd(S).server_ref, hit = resolveAddress(S, v, 'proxy'); choose(S, hit, { proxy_hostname: v.trim() }); O55.ui.refresh(); foundIf(was, hit); },
      link(S, v) { const was = cd(S).server_ref, hit = resolveAddress(S, v, 'link'); choose(S, hit, { remote_endpoint: v.trim() }); O55.ui.refresh(); foundIf(was, hit); }
    }
  });

  /* ------------------------------------------------------------------ C2: review and confirm */
  const routeLabel = (d) => ({ local_or_vpn: T('connect.route.local'), tailscale: T('connect.route.tailscale.title'), reverse_proxy: T('connect.route.proxy.title'), remote_link: T('connect.route.link.title') })[d.remote_mode] || '';
  def('c-review', {
    seed: (S) => seedConnect(S, 0),
    chapter: 'computer', stage: 'review_setup_plan',
    scene: () => ({ id: 'where', beat: 'connect' }),
    /* back from the pairing: the request it left waiting ends, and Connect sends a new one (SCR-01) */
    enter(S) { if (S.sess.connect.run && !paired(S)) endRun(S, 'back'); },
    eyebrow: () => T('connect.review.eyebrow'),
    title: (S) => T('connect.review.title', { name: (server(S) || {}).name || '' }),
    lead: (S) => T('connect.review.lead', { name: (server(S) || {}).name || '' }),
    body(S) {
      const d = cd(S), s = server(S) || {};
      let out = '';
      if (paired(S)) out += `<div class="o55-banner" data-key="done">${C.done(18)}<span>${U.esc(T('chrome.alreadyDone') + ' — ' + T('connect.pair.done', { name: s.name }))}</span></div>`;
      out += `<div class="o55-routeline" data-key="routeline" aria-label="${U.esc(T('connect.review.route'))}">`
        + `<span class="o55-routenode">${C.small('computer', 18)}<span>${U.esc(S.env.client.name)}</span></span>`
        + `<span class="o55-routelink"><span>${U.esc(routeLabel(d))}</span></span>`
        + `<span class="o55-routenode">${C.small('server', 18)}<span>${U.esc(s.name || '')}</span></span></div>`;
      out += C.group(T('connect.review.confirmTitle'), C.cards('pairing', [
        /* (which device approves is the Server's to say, once it knows this one: before pairing nothing names it, SCR-16) */
        { v: 'approval', glyph: 'phone', title: T('connect.review.approve.title'), sub: T('connect.review.approve.subAny', { name: s.name || '' }), tag: T('chrome.recommended') },
        { v: 'code', glyph: 'key', title: T('connect.review.code.title'), sub: T('connect.review.code.sub', { name: s.name || '' }) },
        { v: 'qr', glyph: 'spark', title: T('connect.review.qr.title'), sub: T('connect.review.qr.sub') }
      ], d.connection_pairing, { label: T('connect.review.confirmTitle') }));
      return out;
    },
    foot: (S) => ({ primary: { label: paired(S) ? T('chrome.continue') : T('connect.review.button'), do: 'connect' } }),
    do: {
      pairing(S, v) { if (paired(S)) return; if (cd(S).connection_pairing !== v) { endRun(S, 'method_changed'); unconfirm(S); } O55.draft.set(cd(S), { connection_pairing: v }); S.save(); O55.ui.refresh(); },
      connect(S) {
        if (paired(S)) return O55.ui.go('c-ready');
        S.sess.connect.confirmed = true; O55.draft.set(cd(S), { review_confirmed: true }); S.save();
        /* the connect journey's one confirmation: its own sound carries the screen change (one moment, not two) */
        O55.sound.play('commit', SND.connect);
        O55.ui.go('c-pair', { silent: true });
      }
    }
  });

  /* ------------------------------------------------------------------ C3: pairing (owner work after confirmation) */
  /* What a request that did not end in approval leaves: what happened in plain words, and what to do next. Each answer
     has its own way on (SRV-004/007: rejected, cancelled, expired, unreachable, identity and version are distinct). */
  const FAIL_ACTIONS = {
    unreachable: [{ label: 'connect.pair.fail.retry', do: 'newRequest' }, { label: 'connect.pair.fail.otherWay', do: 'toRoute' }],
    denied: [{ label: 'connect.pair.fail.askAgain', do: 'newRequest' }, { label: 'connect.pair.fail.useCode', do: 'useCode' }],
    expired: [{ label: 'connect.pair.fail.newRequest', do: 'newRequest' }],
    identity_mismatch: [{ label: 'connect.pair.fail.toList', do: 'toRoute' }],
    protocol_mismatch: [{ label: 'connect.pair.fail.retry', do: 'newRequest' }, { label: 'connect.pair.fail.toList', do: 'toRoute' }]
  };
  function failPane(S, s, code) {
    const acts = FAIL_ACTIONS[code] || FAIL_ACTIONS.unreachable;
    return `<div class="o55-banner o55-banner-warn" data-key="pairfail-${U.esc(code)}">${C.small('lock', 18)}<span>${U.esc(T('connect.pair.fail.' + code, { name: s.name || '' }))}</span></div>`
      + `<div class="o55-inline" data-key="pairfail-acts">${acts.map((a, i) => O55.ui.btn({ label: T(a.label), do: a.do, cls: 'o55-small', tip: false }, i ? 'o55-ghost' : 'o55-secondary')).join('')}</div>`;
  }
  def('c-pair', {
    seed: (S) => seedConnect(S, 1),
    chapter: 'computer', stage: 'automatic_preparation',
    scene: () => ({ id: 'where', beat: 'connect' }),
    eyebrow: () => T('connect.pair.eyebrow'),
    title: () => T('connect.pair.title'),
    lead: (S) => T('connect.pair.lead', { name: (server(S) || {}).name || '' }),
    /* a code typed before a reload is not kept anywhere (SCR-02): older sessions saved it, so it goes */
    enter(S) { delete S.sess.connect.code; S.save(); },
    body(S) {
      const s = server(S) || {}, d = cd(S), c = S.sess.connect, m = d.connection_pairing, r = runOf(S);
      const labels = { reach: T('connect.pair.phases.reach', { name: s.name }), approve: T('connect.pair.phases.approveAny', { name: s.name }), code: T('connect.pair.phases.code'), qr: T('connect.pair.phases.qr'), trust: T('connect.pair.phases.trust') };
      let out = C.identity(s.seed || s.id, words(s.seed || s.id), s.name + ' · ' + s.address);
      if (paired(S)) return out + C.note(T('connect.pair.done', { name: s.name }), 'ok', 'check');
      if (!r) return out;
      const fail = c.fail && c.fail.run === r.id ? c.fail.code : expired(r) ? 'expired' : null;
      if (m === 'code') {
        out += F.phases(S, runKey(r, 'reach'), ['reach'], labels);
        const reached = (F.state(S, runKey(r, 'reach')) || {}).state === 'done';
        const cs = F.state(S, runKey(r, 'code'));
        if (reached && !fail) {
          const v = typed.get(r.id) || '';
          out += C.field({ bind: 'code', label: T('connect.pair.codeLabel', { name: s.name }), value: v, placeholder: 'A7K9-M2Q4', hint: T('connect.pair.codeHint'), error: cs && cs.state === 'failed' ? T('connect.pair.codeWrong', { name: s.name }) : '', invalid: cs && cs.state === 'failed' });
          out += `<div class="o55-inline" data-key="checkcode">${O55.ui.btn({ label: T('connect.pair.check'), do: 'checkCode', cls: 'o55-small', disabled: !F.nonEmpty(v), reason: T('connect.pair.codeHint') }, 'o55-secondary')}</div>`;
          const t = F.countdown(r.until);
          out += `<p class="o55-hint" data-key="expiry">${U.esc(T('chrome.expiresIn', { m: t.m, s: t.s }))}</p>`;
        }
        if (cs && !fail) out += F.phases(S, runKey(r, 'code'), ['code', 'trust'], labels);
      } else {
        out += F.phases(S, runKey(r), ['reach', m === 'qr' ? 'qr' : 'approve', 'trust'], labels);
        const st = F.state(S, runKey(r));
        const waiting = !fail && st && st.state === 'running' && (st.phases || []).some((p) => (p.key === 'approve' || p.key === 'qr') && p.status === 'active');
        if (waiting && m === 'approval') {
          const t = F.countdown(r.until);
          out += `<p class="o55-hint" data-key="expiry">${U.esc(T('chrome.expiresIn', { m: t.m, s: t.s }))}</p><div class="o55-sublinks" data-key="resend">${C.link(T('connect.pair.resend'), 'resend')}</div>`;
        }
        if (waiting && m === 'qr') out += `<div class="o55-viewfinder" data-key="vf" aria-label="${U.esc(T('connect.pair.qrAim', { name: s.name }))}"><span class="o55-vf-line"></span><span class="o55-vf-text">${U.esc(T('connect.pair.qrAim', { name: s.name }))}</span></div>`;
      }
      if (fail) out += failPane(S, s, fail);
      return out;
    },
    mounted(S) { ensureRun(S); if (!paired(S)) F.ticker(S, 'c-pair', 1000, () => paired(S)); },
    foot: (S) => {
      const r = runOf(S), c = S.sess.connect, fail = r && ((c.fail && c.fail.run === r.id) || expired(r));
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !paired(S), reason: fail ? T('connect.pair.fail.reason') : T('connect.pair.phases.approveAny', { name: (server(S) || {}).name || '' }) } };
    },
    do: {
      /* a new request, not the old one shown again: the old run ends and its answers no longer count (SCR-15) */
      resend(S) { endRun(S, 'resend'); startRun(S); O55.ui.refresh(); U.announce(T('connect.pair.phases.approveAny', { name: (server(S) || {}).name || '' }), S.root.querySelector('.o55-win')); },
      newRequest(S) { endRun(S, 'retry'); startRun(S); O55.ui.refresh(); O55.sound.play('tap'); },
      useCode(S) { endRun(S, 'method_changed'); unconfirm(S); O55.draft.set(cd(S), { connection_pairing: 'code' }); S.save(); O55.ui.back(); },
      toRoute(S) { endRun(S, 'back'); unconfirm(S); S.save(); const h = S.sess.history || [], at = h.lastIndexOf('c-route'); if (at >= 0) S.sess.history = h.slice(0, at); O55.ui.go('c-route', { dir: 'back', noHistory: true }); },
      checkCode(S) {
        const s = server(S), r = runOf(S);
        if (!s || !r || expired(r)) return O55.ui.refresh();
        const ok = String(typed.get(r.id) || '').replace(/[\s-]/g, '').toUpperCase() === String(s.code).replace(/-/g, '');
        F.reset(S, runKey(r, 'code'));
        F.op(S, runKey(r, 'code'), 'cmd.client.pair.start', [{ key: 'code', ms: 500, fail: () => (ok ? null : 'code_mismatch') }, { key: 'trust', ms: 800 }],
          { payload: { server: r.server, method: 'code', pairing_run: r.id, generation: r.gen }, sound: CODE_SOUND, onDone: () => adopt(S, r) });
      },
      next(S) { if (paired(S)) O55.ui.go('c-ready'); }
    },
    /* the code stays in this page's memory beside its run: never in the session, never saved */
    bind: { code(S, v) { const r = runOf(S); if (!r) return; const had = F.nonEmpty(typed.get(r.id)); typed.set(r.id, String(v || '')); if (had !== F.nonEmpty(v)) O55.ui.refresh(); } }
  });

  /* ------------------------------------------------------------------ C4: ready to meet your Puppet Master (Ready) */
  /* the Project opened goes to the app with its own name and the Server it is on, never its id as a name (SCR-18) */
  function opened(S) {
    const s = server(S) || { projects: [] }, id = S.sess.connect.openProject || (s.projects[0] || {}).id, p = s.projects.find((x) => x.id === id);
    return { project: id, projectName: p ? p.name : null, projectInfo: s.name ? { path: s.name } : null };
  }
  def('c-ready', {
    seed: (S) => seedConnect(S, 2),
    chapter: 'ready', stage: 'ready',
    scene: () => ({ id: 'hero', beat: 'ready' }),
    eyebrow: () => T('connect.ready.eyebrow'),
    title: () => T('connect.ready.title'),
    lead(S) {
      const s = server(S) || { projects: [], accounts: [] };
      const ai = s.accounts.filter((a) => a.ready).length;
      return T('connect.ready.lead', { name: s.name, projects: nProjects(s.projects.length), ai: ai ? T('connect.ready.aiReady', { n: ai }) : T('connect.ready.noAi') });
    },
    body(S) {
      const s = server(S) || { projects: [], accounts: [] }, c = S.sess.connect;
      const sel = c.openProject || (s.projects[0] && s.projects[0].id);
      /* Create a new Project comes first: it is the one choice this page adds (Jared's ask); opening an existing
         Project is a quiet pick from the Server's list */
      let out = O55.tips.opt('createNew', `<button type="button" class="o55-card o55-card-link" data-o55-do="createNew" data-o55-sound="self" data-pm-hover-exempt="true" data-key="create">${C.glyph('seed')}<span class="o55-cardtext"><span class="o55-cardtitle">${U.esc(T('connect.ready.create'))}</span><span class="o55-cardsub">${U.esc(T('connect.ready.createSub', { name: s.name }))}</span></span><span class="o55-cardarrow" aria-hidden="true">›</span></button>`);
      out += s.projects.length ? C.group(T('connect.ready.projectsTitle', { name: s.name }), C.cards('pickProject', s.projects.map((p) => ({ v: p.id, glyph: 'folder', title: p.name, sub: T('like.updated', { when: p.updated }), quiet: true })), sel, { cls: 'o55-choices-quiet', label: T('connect.ready.projectsTitle', { name: s.name }) }))
        : C.note(T('connect.ready.noProjects', { name: s.name }), 'info', 'seed');
      if (s.accounts.length) out += C.group(T('connect.ready.aiTitle', { name: s.name }), s.accounts.map((a) => C.row({ key: a.label, glyph: 'spark', title: a.label, state: a.ready ? ['ready', T('ai.ready')] : ['needs', T('ai.notReady')] })).join(''));
      return out;
    },
    foot(S) {
      /* the Guided Tour ends on a real Project: a Server with none yet leads with creating one instead */
      const tour = O55.tour && O55.tour.start, has = ((server(S) || {}).projects || []).length > 0;
      if (!has) return { back: true, secondary: [{ label: T('connect.ready.enter'), do: 'enter' }], primary: { label: T('connect.ready.create'), do: 'createNew' } };
      return { back: true, secondary: tour ? [{ label: T('connect.ready.enter'), do: 'enter' }] : [], primary: tour ? { label: T('ready.tour'), do: 'tour' } : { label: T('connect.ready.enter'), do: 'enter' } };
    },
    do: {
      pickProject(S, id) { S.sess.connect.openProject = id; S.save(); O55.ui.refresh(); },
      createNew(S, arg, el) {
        const c = cd(S), m = S.sess.drafts.main, th = O55.theme();
        S.sess.connect.newProject = true; S.sess.active = 'main';
        O55.draft.set(m, {
          journey: 'new_or_local', theme_family: th.chosen, theme_mode: th.mode, project_mode: 'new', server_mode: 'existing_server', server_ref: c.server_ref,
          server_connection_mode: c.server_connection_mode, remote_mode: c.remote_mode, remote_more: c.remote_more, include_vpn_networks: c.include_vpn_networks,
          connection_pairing: c.connection_pairing, tailscale_control: c.tailscale_control, headscale_url: c.headscale_url, remote_endpoint: c.remote_endpoint,
          proxy_hostname: c.proxy_hostname, proxy_hosting: c.remote_mode === 'reverse_proxy' ? 'existing_proxy' : null, proxy_kind: null, proxy_tls: null,
          server_trust_confirmed: c.server_trust_confirmed, storage_mode: 'with_server'
        });
        S.save();
        O55.ui.charm(el, T('begin.new.title'), 'seed');
        O55.ui.go('begin');
      },
      enter(S) { O55.finish(S, Object.assign({ tour: false }, opened(S))); },
      tour(S) { O55.finish(S, Object.assign({ tour: true }, opened(S))); }
    }
  });

  O55.connect = { server: (S) => server(S), allServers };
})();
