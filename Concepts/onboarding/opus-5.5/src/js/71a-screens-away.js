/* Use it away from home, for a Server being set up (remote_access_setup), and the step after the commit that sets that
   way in up (automatic_preparation). Moved out of 71-screens-safe.js with the Server lane (pm7-srv, 2026-10-31).
   The choice is calm: only at home, or Tailscale (built into Puppet Master); Headscale, a web address of your own and
   Puppet Master Remote Link wait under Other ways to connect. Nothing is set up here: the choice goes to Review.
   After the commit, 'away-setup' runs the owner's own steps for the chosen way (PWIZ-025's connector phases for
   Tailscale and Headscale; generate, export or check for a web address, with the internet exposure agreed first and
   its checks shown; a Remote Link made and shown), each step a separate owner command with its own answer, a person's
   own steps (signing in, installing a file, a certificate) waiting for them, and Later always possible: the way in is
   then not set up, and Settings › Server & Project Location › Away From Home is where it is finished. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const E = () => O55.endpoint;
  const serverName = (S) => (O55.project ? O55.project.serverName(S) : '');
  /* the agreement that a web address puts the Server's sign-in page on the internet, for that one address (SCR-06) */
  const AW = (S) => (S.sess.away = S.sess.away || {});
  const consented = (S) => { const d = md(S); return d.remote_mode !== 'reverse_proxy' || (!!AW(S).publicFor && AW(S).publicFor === E().check(d.proxy_hostname, 'proxy').url); };
  const KIND_NAME = { nginx: 'NGINX', traefik: 'Traefik' };
  /* Opened straight (Demo Studio's Open at one screen): what the Server steps would have left, a new Server set up and
     this computer trusted, and a Project that has a name (so Review can be confirmed); away-setup also gets its run */
  function seedServer(S, way) {
    const d = md(S), sv = S.sess.server;
    S.sess.active = 'main';
    if (d.server_mode !== 'new_server' || !sv.claimed) {
      const u = S.env.unclaimed, names = O55.tx('server.confirm.suggestNas') || [];
      Object.assign(sv, { kind: sv.kind || 'nas', claimed: true, confirmed: true, id: u.id, chainFor: u.id, displayName: sv.displayName || names[0] || u.name, selfTrustId: 'clienttrust:seed:' + u.id });
      O55.draft.set(d, { server_mode: 'new_server', server_ref: u.id, server_trust_confirmed: true, storage_mode: 'with_server' });
    }
    if (d.remote_mode === 'none') O55.draft.set(d, { remote_mode: way || 'local_or_vpn', tailscale_control: way === 'tailscale' ? 'hosted' : d.tailscale_control });
    if (d.project_mode === 'new' && !String(d.project_name || '').trim()) { const sug = O55.tx('name.suggest'); O55.draft.set(d, { project_name: (Array.isArray(sug) && sug[0]) || 'Book club website' }); }
    S.save();
  }

  /* ================================================================== the choice */
  def('away', {
    seed: (S) => seedServer(S),
    chapter: 'project', stage: 'remote_access_setup', charmSlot: 'away',
    scene: (S) => ({ id: 'away', beat: md(S).remote_mode === 'local_or_vpn' || md(S).remote_mode === 'none' ? 'home' : 'anywhere' }),
    eyebrow: () => T('away.eyebrow'),
    title: () => T('away.title'),
    lead: (S) => T('away.lead', { name: serverName(S) }),
    body(S) {
      const d = md(S), mode = d.remote_mode, name = serverName(S);
      const top = mode === 'tailscale' && d.tailscale_control !== 'headscale' ? 'anywhere' : mode === 'local_or_vpn' || mode === 'none' ? 'home' : 'more';
      let out = C.cards('pick', [
        { v: 'home', glyph: 'computer', title: T('away.home.title'), sub: T('away.home.sub') },
        { v: 'anywhere', glyph: 'globe', title: T('away.anywhere.title'), sub: T('away.anywhere.sub'), tag: T('chrome.recommended') }
      ], top === 'more' ? null : top, { label: T('away.title') });
      /* each route's own questions sit under its card (QA round 2, Q7) */
      const route = mode === 'tailscale' && d.tailscale_control === 'headscale' ? 'headscale' : mode;
      let fields = '';
      if (route === 'headscale') {
        const res = E().check(d.headscale_url, 'headscale'), w = E().hint(res, 'https://…');
        fields = C.field({ bind: 'headscale', label: T('connect.route.tailscale.headscaleLabel'), value: d.headscale_url, placeholder: 'https://headscale.example.com', hint: w.hint, error: w.error, invalid: !!w.error, valid: res.ok })
          + `<p class="o55-hint" data-key="hs-next">${U.esc(T('away.headscaleNext', { name }))}</p>`;
      }
      if (route === 'reverse_proxy') {
        const res = E().check(d.proxy_hostname, 'proxy'), w = E().hint(res, 'https://…'), hosting = d.proxy_hosting || 'generate_for_server';
        fields = C.field({ bind: 'proxy', label: T('away.proxy.label'), value: d.proxy_hostname, placeholder: 'https://pm.example.com', hint: w.hint, error: w.error, invalid: !!w.error, valid: res.ok });
        fields += C.segmented({ do: 'hosting', value: hosting, label: T('away.proxy.hosting'), options: [{ v: 'generate_for_server', label: T('away.proxy.pm') }, { v: 'generate_only', label: T('away.proxy.generate') }, { v: 'existing_proxy', label: T('away.proxy.existing') }] });
        if (hosting !== 'existing_proxy') {
          fields += C.segmented({ do: 'tls', value: d.proxy_tls || 'lets_encrypt', label: T('away.proxy.tls'), options: [{ v: 'lets_encrypt', label: T('away.proxy.free') }, { v: 'existing_certificate', label: T('away.proxy.own') }] });
          /* (no key or certificate file is ever typed here: it is chosen on the Server after the commit, SCR-07) */
          if (d.proxy_tls === 'existing_certificate') fields += `<p class="o55-hint" data-key="owncert">${U.esc(T('away.proxy.ownNext', { name }))}</p>`;
          /* (only the proxies Puppet Master makes and tests settings for: lead question Q2) */
          fields += C.details(S, 'proxykind', T('away.proxy.kind'), C.segmented({ do: 'kind', value: KIND_NAME[d.proxy_kind] ? d.proxy_kind : 'nginx', label: T('away.proxy.kind'), options: [{ v: 'nginx', label: 'NGINX' }, { v: 'traefik', label: 'Traefik' }] }) + `<p>${U.esc(T('away.proxy.detail'))}</p>`);
        } else fields += `<p class="o55-hint" data-key="existing">${U.esc(T('away.proxy.existingNext', { name }))}</p>`;
        /* the internet sees the Server's sign-in page: said plainly, with what has to be true, and agreed to (SCR-06) */
        fields += C.note(T('away.proxy.public', { name }), 'warn', 'globe');
        fields += C.details(S, 'proxyneeds', T('away.proxy.needsTitle'), `<ul class="o55-will">${['dns', 'ports', 'cgnat'].map((k) => `<li>${C.small(k === 'dns' ? 'globe' : k === 'ports' ? 'lock' : 'link', 14)}<span>${U.esc(T('away.proxy.needs.' + k, { host: res.ok ? res.url.replace(/^https:\/\//, '') : 'pm.example.com', name }))}</span></li>`).join('')}</ul>`);
        const on = consented(S) && res.ok;
        fields += `<div class="o55-checkline" data-key="consent"><button type="button" role="checkbox" aria-checked="${on}" class="o55-check${on ? ' is-on' : ''}" data-o55-do="consent" data-pm-hover-exempt="true"${res.ok ? '' : ` aria-disabled="true" data-disabled-reason="${U.esc(T('missing.proxyAddress'))}"`}>${on ? C.small('check', 13) : ''}</button><span>${U.esc(T('away.proxy.consent', { name }))}</span></div>`;
      }
      /* a new Server makes its own link after the commit and shows it then (SCR-05): nothing to paste here */
      if (route === 'remote_link') fields = `<p class="o55-hint" data-key="link-next">${U.esc(T('away.link.next', { name }))}</p>`;
      const more = C.cards('route', [
        { v: 'headscale', glyph: 'globe', title: T('away.headscale'), quiet: true, under: route === 'headscale' ? fields : '' },
        { v: 'reverse_proxy', glyph: 'globe', title: T('away.proxy.title'), sub: T('away.proxy.sub'), quiet: true, under: route === 'reverse_proxy' ? fields : '' },
        { v: 'remote_link', glyph: 'link', title: T('away.link.title'), sub: T('away.link.sub'), quiet: true, under: route === 'remote_link' ? fields : '' }
      ], route, { cls: 'o55-choices-quiet' });
      out += F.more(d.remote_more || top === 'more', T('away.more'), 'more', more, 'more');
      return out;
    },
    foot(S) {
      const miss = O55.draft.missing(md(S)).find((m) => ['remote_endpoint', 'proxy_hostname', 'headscale_url'].includes(m.field));
      const reason = miss ? T(miss.key) : !consented(S) ? T('away.proxy.consentMissing') : '';
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!reason, reason } };
    },
    do: {
      pick(S, v, el) { O55.draft.set(md(S), v === 'home' ? { remote_mode: 'local_or_vpn' } : { remote_mode: 'tailscale', tailscale_control: 'hosted' }); S.save(); O55.ui.refresh(); O55.ui.charm(el, T('away.' + v + '.title'), v === 'home' ? 'computer' : 'globe'); },
      more(S) { O55.draft.set(md(S), { remote_more: !md(S).remote_more }); S.save(); O55.ui.refresh(); },
      route(S, v) { O55.draft.set(md(S), v === 'headscale' ? { remote_mode: 'tailscale', tailscale_control: 'headscale', remote_more: true } : { remote_mode: v, remote_more: true }); S.save(); O55.ui.refresh(); },
      hosting(S, v) { O55.draft.set(md(S), { proxy_hosting: v, proxy_tls: v === 'existing_proxy' ? null : md(S).proxy_tls || 'lets_encrypt', proxy_kind: v === 'existing_proxy' ? null : KIND_NAME[md(S).proxy_kind] ? md(S).proxy_kind : 'nginx' }); S.save(); O55.ui.refresh(); },
      tls(S, v) { O55.draft.set(md(S), { proxy_tls: v }); S.save(); O55.ui.refresh(); },
      kind(S, v) { O55.draft.set(md(S), { proxy_kind: v }); S.save(); O55.ui.refresh(); },
      /* the agreement is for this address: another address asks again */
      consent(S) {
        const res = E().check(md(S).proxy_hostname, 'proxy'); if (!res.ok) return;
        const on = AW(S).publicFor === res.url; AW(S).publicFor = on ? null : res.url; S.save(); O55.ui.refresh(); O55.sound.play(on ? 'toggleOff' : 'toggleOn');
      },
      /* reached from a Server's restore: back to its preview; otherwise on to Review. The address it will use is kept. */
      next(S) {
        const d = md(S), patch = {};
        if (d.remote_mode === 'reverse_proxy' && E().check(d.proxy_hostname, 'proxy').ok) patch.proxy_hostname = E().check(d.proxy_hostname, 'proxy').url;
        if (d.remote_mode === 'tailscale' && d.tailscale_control === 'headscale' && E().check(d.headscale_url, 'headscale').ok) patch.headscale_url = E().check(d.headscale_url, 'headscale').url;
        if (Object.keys(patch).length) O55.draft.set(d, patch);
        const back = S.sess.ui.awayReturn; if (back) { S.sess.ui.awayReturn = null; S.save(); return O55.ui.go(back); }
        S.save(); O55.ui.go('review');
      }
    },
    bind: {
      headscale(S, v) { O55.draft.set(md(S), { headscale_url: v.trim() }); S.save(); O55.ui.refresh(); },
      proxy(S, v) { O55.draft.set(md(S), { proxy_hostname: v.trim() }); S.save(); O55.ui.refresh(); }
    }
  });

  /* ================================================================== setting it up, after the commit */
  /* The steps for each way in. cmd: the owner command the step dispatches (RAS-009/015 census); person: a step the
     person does (it waits for their click); fail: the one-shot fixture answers Demo Studio can set with
     S.env.failures.away_once (the published page has no owner host). */
  function plan(S) {
    const d = md(S), name = serverName(S), host = String(d.proxy_hostname || '').replace(/^https:\/\//, ''), kind = KIND_NAME[d.proxy_kind] || 'NGINX';
    if (d.remote_mode === 'tailscale' && d.tailscale_control === 'headscale') return [
      { key: 'start', cmd: 'cmd.remote_access.tailscale.setup.start', label: T('away.setup.ts.start') },
      { key: 'register', cmd: 'cmd.remote_access.tailscale.headscale.start', label: T('away.setup.hs.register', { name }), fail: ['registration_denied', 'hs_unreachable'] },
      { key: 'approve', cmd: 'cmd.remote_access.tailscale.connector.check', label: T('away.setup.hs.approve'), person: 'hsApproved', wait: T('away.setup.hs.approveWait', { name }) },
      { key: 'address', cmd: 'cmd.remote_access.tailscale.connector.check', label: T('away.setup.ts.address') },
      { key: 'test', cmd: 'cmd.remote_access.tailscale.test', label: T('away.setup.ts.test'), fail: ['route_failed'] }
    ];
    if (d.remote_mode === 'tailscale') return [
      { key: 'start', cmd: 'cmd.remote_access.tailscale.setup.start', label: T('away.setup.ts.start') },
      { key: 'signin', cmd: 'cmd.remote_access.tailscale.login.start', label: T('away.setup.ts.signin'), person: 'tsSignIn', wait: T('away.setup.ts.signinWait') },
      { key: 'auth', cmd: 'cmd.remote_access.tailscale.connector.check', label: T('away.setup.ts.auth'), fail: ['denied', 'expired'] },
      { key: 'approve', cmd: 'cmd.remote_access.tailscale.connector.check', label: T('away.setup.ts.approve'), fail: ['needs_device_approval'] },
      /* (the private address starts by itself once Tailscale has said yes: RAS-015; this step watches for it) */
      { key: 'address', cmd: 'cmd.remote_access.tailscale.connector.check', label: T('away.setup.ts.address') },
      { key: 'test', cmd: 'cmd.remote_access.tailscale.test', label: T('away.setup.ts.test'), fail: ['route_failed'] }
    ];
    if (d.remote_mode === 'reverse_proxy') {
      const checks = [
        { key: 'dns', cmd: 'cmd.remote_access.route.test', label: T('away.setup.px.dns', { host, name }), fail: ['dns_mismatch'] },
        { key: 'reach', cmd: 'cmd.remote_access.route.test', label: T('away.setup.px.reach'), fail: ['unreachable'] }
      ];
      const cert = d.proxy_tls === 'existing_certificate'
        ? { key: 'cert', cmd: null, label: T('away.setup.px.ownCert', { name }), wait: T('away.setup.px.ownCertWait', { name }), owner: true }
        : { key: 'cert', cmd: 'cmd.remote_access.proxy.test', label: T('away.setup.px.freeCert'), fail: ['certificate_failed'] };
      const test = { key: 'test', cmd: 'cmd.remote_access.proxy.test', label: T('away.setup.px.test'), fail: ['live_failed'] };
      if (d.proxy_hosting === 'existing_proxy') return [{ key: 'dns', cmd: 'cmd.remote_access.route.test', label: T('away.setup.px.reaches', { host, name }), fail: ['dns_mismatch', 'unreachable'] }, { key: 'cert', cmd: 'cmd.remote_access.proxy.test', label: T('away.setup.px.theirCert'), fail: ['certificate_failed'] }, test];
      if (d.proxy_hosting === 'generate_only') return [{ key: 'config', cmd: 'cmd.remote_access.proxy.export', label: T('away.setup.px.file', { kind }) }, { key: 'install', cmd: 'cmd.remote_access.route.test', label: T('away.setup.px.install', { kind }), person: 'installed', wait: T('away.setup.px.installWait', { kind }) }].concat(checks, [cert, test]);
      return [{ key: 'config', cmd: 'cmd.remote_access.proxy.generate', label: T('away.setup.px.config', { kind, name }) }].concat(checks, [cert, test]);
    }
    return [
      { key: 'create', cmd: 'cmd.remote_access.remote_link.setup', label: T('away.setup.rl.create', { name }), fail: ['relay_unavailable'] },
      { key: 'test', cmd: 'cmd.remote_access.remote_link.test', label: T('away.setup.rl.test'), fail: ['relay_unavailable'] }
    ];
  }
  /* the run: one per commit (or restore) and way in; a step's answer counts only for the run and step it was asked in */
  const A = (S) => S.sess.awaySetup || null;
  const needsSetup = (S) => { const d = md(S); return d.server_mode === 'new_server' && ['tailscale', 'reverse_proxy', 'remote_link'].includes(d.remote_mode); };
  function begin(S, then, o) {
    const d = md(S), cur = A(S);
    if (cur && cur.mode === d.remote_mode && cur.rev === d.project_draft_revision && cur.then === then) return cur;
    S.sess.awaySetup = { id: 'awaysetup:' + d.project_draft_ref + ':r' + d.project_draft_revision + ':' + Math.random().toString(36).slice(2, 7), mode: d.remote_mode, control: d.tailscale_control || null,
      rev: d.project_draft_revision, then, confirmed: !(o && o.ask), step: 0, done: [], state: 'idle', fail: null, people: {}, link: '' };
    S.save();
    return S.sess.awaySetup;
  }
  const stepKey = (a, st) => 'away:' + a.id + ':' + st.key;
  function failOnce(S, st) { const f = S.env.failures || {}, code = f.away_once; if (!code || !(st.fail || []).includes(code)) return null; f.away_once = null; return code; }
  const liveSteps = new Set(); /* steps asked in this page: one saved as running before a reload is asked again */
  function run(S) {
    const a = A(S); if (!a || !a.confirmed || ['done', 'later', 'failed'].includes(a.state)) return;
    const steps = plan(S), st = steps[a.step];
    if (!st) { a.state = 'done'; S.save(); O55.ui.refresh(); return; }
    if (a.state === 'running') { if (liveSteps.has(stepKey(a, st))) return; a.state = 'idle'; }
    if (st.person && !a.people[st.person]) { if (a.state !== 'waiting') { a.state = 'waiting'; S.save(); O55.ui.refresh(); } return; }
    /* an owner answer only the owner can give (a certificate chosen on the Server) waits for its host (none here) */
    if (st.owner && !O55.ownerResults.hostAvailable()) { if (a.state !== 'pending') { a.state = 'pending'; S.save(); O55.ui.refresh(); } return; }
    a.state = 'running'; S.save();
    const at = { id: a.id, step: a.step }, key = stepKey(a, st);
    liveSteps.add(key);
    /* (the step's own Start, or the Review before it, is the confirmation this owner work runs under) */
    F.op(S, key, st.cmd, [{ key: st.key, ms: st.key === 'signin' ? 2200 : 900, fail: () => failOnce(S, st) }], {
      payload: { route: a.mode, control: a.control, setup: a.id, step: st.key }, ctx: { reviewConfirmed: true }, sound: { done: false, fail: 'warn' },
      onDone: () => {
        liveSteps.delete(key);
        const cur = A(S); if (!cur || cur.id !== at.id || cur.step !== at.step || cur.state !== 'running') return; /* (not this run's step any more) */
        cur.done.push(st.key); cur.step += 1; cur.state = 'idle';
        if (st.key === 'create') cur.link = 'pm-remote-link:' + U.slug(serverName(S) || 'server') + '/' + Math.random().toString(36).slice(2, 6).toUpperCase();
        if (cur.step >= steps.length) { cur.state = 'done'; S.save(); O55.ui.refresh(); if (S.open && S.sess.screen === 'away-setup') O55.sound.play('success', { intensity: 0.8 }); return; }
        S.save(); run(S); O55.ui.refresh();
      },
      onFail: (S2, res) => { liveSteps.delete(key); const cur = A(S); if (!cur || cur.id !== at.id || cur.step !== at.step) return; cur.state = 'failed'; cur.fail = { step: st.key, code: res.code }; S.save(); O55.ui.refresh(); }
    });
  }
  const FAIL_WORDS = { denied: 'denied', expired: 'expired', needs_device_approval: 'deviceApproval', route_failed: 'routeFailed', registration_denied: 'hsDenied', hs_unreachable: 'hsUnreachable', unreachable: 'unreachable', dns_mismatch: 'dns', certificate_failed: 'cert', live_failed: 'live', relay_unavailable: 'relay' };
  def('away-setup', {
    seed: (S) => { seedServer(S, 'tailscale'); if (!needsSetup(S)) O55.draft.set(md(S), { remote_mode: 'tailscale', tailscale_control: 'hosted' }); if (!A(S)) { O55.draft.set(md(S), { review_confirmed: true }); begin(S, 'ready'); } S.save(); },
    chapter: 'project', stage: 'automatic_preparation',
    scene: () => ({ id: 'away', beat: 'anywhere' }),
    eyebrow: () => T('away.setup.eyebrow'),
    title: (S) => T('away.setup.title.' + (md(S).remote_mode === 'tailscale' ? (md(S).tailscale_control === 'headscale' ? 'headscale' : 'tailscale') : md(S).remote_mode === 'reverse_proxy' ? 'proxy' : 'link'), { name: serverName(S) }),
    lead: (S) => (A(S) && !A(S).confirmed ? T('away.setup.leadAsk', { name: serverName(S) }) : T('away.setup.lead', { name: serverName(S) })),
    body(S) {
      const a = A(S) || {}, steps = plan(S), d = md(S), name = serverName(S);
      let out = C.phases(steps.map((st, i) => ({ key: st.key, label: st.label, status: (a.done || []).includes(st.key) ? 'done' : a.state === 'failed' && a.fail && a.fail.step === st.key ? 'failed' : i === a.step && ['running', 'waiting', 'pending'].includes(a.state) ? 'active' : 'waiting' })));
      const st = steps[a.step];
      if (!a.confirmed) out += C.note(d.remote_mode === 'reverse_proxy' ? T('away.proxy.public', { name }) : T('away.setup.ask', { name }), d.remote_mode === 'reverse_proxy' ? 'warn' : 'info', 'globe');
      if (a.state === 'waiting' && st) out += `<p class="o55-hint" data-key="wait-${U.esc(st.key)}">${U.esc(st.wait || '')}</p>`;
      if (a.state === 'pending' && st) out += C.note(st.wait || T('server.confirm.pendingHost'), 'info', 'server');
      if (a.link) out += `<div class="o55-codeline" data-key="rlink"><code>${U.esc(a.link)}</code>${F.copyBtn(a.link, 'rlink')}</div>${F.copyNote('rlink')}<p class="o55-hint" data-key="rlink-hint">${U.esc(T('away.setup.rl.share'))}</p>`;
      if (a.state === 'failed' && a.fail) out += `<div class="o55-banner o55-banner-warn" data-key="awayfail">${C.small('lock', 18)}<span>${U.esc(T('away.setup.fail.' + (FAIL_WORDS[a.fail.code] || 'routeFailed'), { name, host: String(d.proxy_hostname || '').replace(/^https:\/\//, '') }))}</span></div>`;
      if (a.state === 'done') out += C.note(T('away.setup.done', { name }), 'ok', 'check');
      if (a.state === 'later') out += C.note(T('away.setup.laterNote'), 'info', 'rewind');
      return out;
    },
    mounted(S) { run(S); },
    foot(S) {
      const a = A(S) || {}, st = plan(S)[a.step];
      const later = { label: T('away.setup.later'), do: 'later', cls: 'o55-ghost' };
      if (a.state === 'done' || a.state === 'later') return { back: false, primary: { label: T('chrome.continue'), do: 'next' } };
      if (!a.confirmed) return { back: false, secondary: [later], primary: { label: T('away.setup.start'), do: 'start' } };
      if (a.state === 'failed') return { back: false, secondary: [later], primary: { label: T('chrome.tryAgain'), do: 'retry' } };
      if (a.state === 'waiting' && st) return { back: false, secondary: [later], primary: { label: T('away.setup.person.' + st.person), do: 'person', arg: st.person } };
      return { back: false, secondary: [later], primary: { label: T('chrome.continue'), do: 'next', disabled: true, reason: T('chrome.working') } };
    },
    do: {
      start(S) { const a = A(S); if (!a) return; a.confirmed = true; S.save(); O55.sound.play('commit', { intensity: 0.6 }); run(S); O55.ui.refresh(); },
      /* the person's own step: Tailscale's sign-in page opens; the others are done on their own computers */
      person(S) {
        const a = A(S), st = plan(S)[a.step]; if (!a || !st || !st.person) return;
        if (st.person === 'tsSignIn') O55.official.open(S, { name: 'Tailscale', url: 'https://login.tailscale.com/' });
        a.people[st.person] = true; a.state = 'idle'; S.save(); O55.sound.play('tap'); run(S); O55.ui.refresh();
      },
      retry(S) { const a = A(S); if (!a) return; const st = plan(S)[a.step]; if (st) F.reset(S, stepKey(a, st)); a.state = 'idle'; a.fail = null; S.save(); O55.sound.play('tap'); run(S); O55.ui.refresh(); },
      /* Later: nothing more is set up now; the way in stays not set up and Settings finishes it (a clean finish) */
      later(S) { const a = A(S); if (!a) return; const st = plan(S)[a.step]; if (st) O55.owners.cancelOp(stepKey(a, st)); a.state = 'later'; S.save(); O55.ui.refresh(); },
      next(S) { const a = A(S); O55.ui.go((a && a.then) || 'ready'); }
    },
    onBack: () => false
  });

  /* Creating (72) and a Server's restore (68) hand over here when the chosen way in needs setting up; o.ask: the
     step asks first (a restore's preview listed it, but no Review confirmed it) */
  O55.away = {
    needed: needsSetup, seedServer,
    start(S, then, o) { if (!needsSetup(S)) return O55.ui.go(then); begin(S, then, o); S.save(); return O55.ui.go('away-setup'); },
    state: (S) => A(S)
  };
})();
