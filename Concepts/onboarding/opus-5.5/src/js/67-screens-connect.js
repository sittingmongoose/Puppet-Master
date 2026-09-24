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

  /* read-only discovery, cached per network scope (cmd.server.discovery.refresh) */
  function scanKey(S) { return 'discover:connect:' + (cd(S).include_vpn_networks ? 'vpn' : 'lan'); }
  function scan(S) {
    const vpn = cd(S).include_vpn_networks;
    F.op(S, scanKey(S), 'cmd.server.discovery.refresh', [{ key: 'lan', ms: 1100 }].concat(vpn ? [{ key: 'vpn', ms: 800 }] : []), { payload: { scope: vpn ? 'lan+vpn' : 'lan' } });
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
  function choose(S, srv, patch) {
    const d = cd(S), c = S.sess.connect;
    if (c.paired && c.server !== (srv && srv.id)) { c.paired = false; c.confirmed = false; F.reset(S, 'pair:' + c.server); F.reset(S, 'paircode:' + c.server); }
    c.server = srv ? srv.id : null;
    O55.draft.set(d, Object.assign({ server_ref: srv ? srv.id : '' }, patch || {}));
    S.save();
  }

  /* ------------------------------------------------------------------ C1: which Puppet Master, and how to reach it */
  def('c-route', {
    chapter: 'computer', stage: 'remote_access_setup', charmSlot: 'server',
    scene: (S) => ({ id: 'where', beat: 'connect' }),
    enter(S) { S.sess.active = 'connect'; },
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
          if (!list.length) out += `<div class="o55-row o55-row-wait" data-key="scan"><span class="o55-spin" aria-hidden="true"></span><span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('connect.route.looking'))}</span></span></div>`;
          else out += C.cards('pickServer', list.map((s) => ({ v: s.id, glyph: 'server', title: s.name, sub: s.address + ' · ' + nProjects(s.projects.length), tag: s.via === 'vpn' ? 'VPN' : '' })), d.server_ref, { label: T('connect.route.found') });
          if (st && st.state === 'done' && !list.length) out += C.note(T('connect.route.none'), 'warn');
          out += C.toggle({ do: 'vpn', on: d.include_vpn_networks, label: T('connect.route.vpn'), sub: T('connect.route.vpnSub') });
          out += `<div class="o55-sublinks" data-key="l-addr">${C.link(T('connect.route.address'), 'manualOn')}</div>`;
        }
      } else if (mode === 'tailscale') {
        out += C.segmented({ do: 'tsControl', value: d.tailscale_control || 'hosted', label: T('connect.route.tailscale.title'), options: [{ v: 'hosted', label: T('connect.route.tailscale.hosted') }, { v: 'headscale', label: T('connect.route.tailscale.headscale') }] });
        if (d.tailscale_control === 'headscale') out += C.field({ bind: 'headscale', label: T('connect.route.tailscale.headscaleLabel'), value: d.headscale_url, placeholder: 'https://headscale.example.com', hint: F.isHttps(d.headscale_url) ? '' : 'https://…', valid: F.isHttps(d.headscale_url) });
        out += C.cards('pickServer', S.env.pmServers.map((s) => ({ v: s.id, glyph: 'server', title: s.name, sub: 'Tailscale · ' + nProjects(s.projects.length) })), d.server_ref, { label: T('connect.route.found') });
      } else if (mode === 'reverse_proxy') {
        const hit = resolveAddress(S, d.proxy_hostname, 'proxy');
        out += C.field({ bind: 'proxy', label: T('connect.route.proxy.label'), value: d.proxy_hostname, placeholder: 'https://pm.example.com', hint: hit ? hit.name : 'https://…', valid: !!hit });
        out += C.details(S, 'proxy', T('connect.route.proxy.title'), `<p>${U.esc(T('connect.route.proxy.detail'))}</p>`);
      } else if (mode === 'remote_link') {
        const hit = resolveAddress(S, d.remote_endpoint, 'link');
        out += C.field({ bind: 'link', label: T('connect.route.link.label'), value: d.remote_endpoint, placeholder: 'pm-remote-link:home-nas/7Q2K', hint: hit ? hit.name : '', valid: !!hit });
      }
      const opts = [
        { v: 'local_or_vpn', glyph: 'link', title: T('connect.route.local'), quiet: true },
        { v: 'tailscale', glyph: 'globe', title: T('connect.route.tailscale.title'), sub: T('connect.route.tailscale.sub'), quiet: true },
        { v: 'reverse_proxy', glyph: 'globe', title: T('connect.route.proxy.title'), sub: T('connect.route.proxy.sub'), quiet: true },
        { v: 'remote_link', glyph: 'link', title: T('connect.route.link.title'), sub: T('connect.route.link.sub'), quiet: true }
      ];
      out += F.more(d.remote_more, T('connect.route.more'), 'more', C.cards('route', opts, mode, { cls: 'o55-choices-quiet', label: T('connect.route.more') }), 'route');
      return out;
    },
    mounted(S) { if (cd(S).remote_mode === 'local_or_vpn' && !S.sess.connect.manual) scan(S); },
    foot(S) {
      const miss = O55.draft.missing(cd(S))[0];
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!miss, reason: miss ? T(miss.key) : '' } };
    },
    do: {
      pickServer(S, id, el) { const s = server(S, id); choose(S, s, { server_connection_mode: 'discover' }); O55.ui.refresh(); O55.ui.charm(el, s.name, 'server'); },
      vpn(S) { O55.draft.set(cd(S), { include_vpn_networks: !cd(S).include_vpn_networks }); S.save(); O55.sound.play(cd(S).include_vpn_networks ? 'toggleOn' : 'toggleOff'); scan(S); O55.ui.refresh(); },
      manualOn(S) { S.sess.connect.manual = true; S.save(); O55.ui.refresh(); const i = S.root.querySelector('#o55f-addr'); if (i) i.focus(); },
      manualOff(S) { S.sess.connect.manual = false; S.save(); O55.ui.refresh(); },
      more(S) { O55.draft.set(cd(S), { remote_more: !cd(S).remote_more }); S.save(); O55.ui.refresh(); },
      route(S, mode) {
        const patch = { remote_mode: mode, remote_more: true };
        if (mode === 'tailscale' && !cd(S).tailscale_control) patch.tailscale_control = 'hosted';
        if (mode === 'reverse_proxy' || mode === 'remote_link') { patch.server_connection_mode = 'manual'; choose(S, null, patch); }
        else { O55.draft.set(cd(S), Object.assign(patch, { server_connection_mode: 'discover' })); S.save(); }
        O55.ui.refresh();
      },
      tsControl(S, v) { O55.draft.set(cd(S), { tailscale_control: v }); S.save(); O55.ui.refresh(); },
      next(S) { O55.ui.go('c-review'); }
    },
    bind: {
      addr(S, v) { S.sess.connect.addr = v; const hit = resolveAddress(S, v, 'address'); choose(S, hit, { server_connection_mode: 'manual' }); O55.ui.refresh(); },
      headscale(S, v) { O55.draft.set(cd(S), { headscale_url: v.trim() }); S.save(); O55.ui.refresh(); },
      proxy(S, v) { const hit = resolveAddress(S, v, 'proxy'); choose(S, hit, { proxy_hostname: v.trim() }); O55.ui.refresh(); },
      link(S, v) { const hit = resolveAddress(S, v, 'link'); choose(S, hit, { remote_endpoint: v.trim() }); O55.ui.refresh(); }
    }
  });

  /* ------------------------------------------------------------------ C2: review and confirm */
  const routeLabel = (d) => ({ local_or_vpn: T('connect.route.local'), tailscale: T('connect.route.tailscale.title'), reverse_proxy: T('connect.route.proxy.title'), remote_link: T('connect.route.link.title') })[d.remote_mode] || '';
  def('c-review', {
    chapter: 'computer', stage: 'review_setup_plan',
    scene: () => ({ id: 'where', beat: 'connect' }),
    eyebrow: () => T('connect.review.eyebrow'),
    title: (S) => T('connect.review.title', { name: (server(S) || {}).name || '' }),
    lead: (S) => T('connect.review.lead', { name: (server(S) || {}).name || '' }),
    body(S) {
      const d = cd(S), s = server(S) || {}, c = S.sess.connect;
      let out = '';
      if (c.paired) out += `<div class="o55-banner" data-key="done">${C.small('check', 18)}<span>${U.esc(T('chrome.alreadyDone') + ' — ' + T('connect.pair.done', { name: s.name }))}</span></div>`;
      out += `<div class="o55-routeline" data-key="routeline" aria-label="${U.esc(T('connect.review.route'))}">`
        + `<span class="o55-routenode">${C.small('computer', 18)}<span>${U.esc(S.env.client.name)}</span></span>`
        + `<span class="o55-routelink"><span>${U.esc(routeLabel(d))}</span></span>`
        + `<span class="o55-routenode">${C.small('server', 18)}<span>${U.esc(s.name || '')}</span></span></div>`;
      out += C.group(T('connect.review.confirmTitle'), C.cards('pairing', [
        { v: 'approval', glyph: 'phone', title: T('connect.review.approve.title'), sub: T('connect.review.approve.sub', { device: s.approver || '' }), tag: T('chrome.recommended') },
        { v: 'code', glyph: 'key', title: T('connect.review.code.title'), sub: T('connect.review.code.sub', { name: s.name || '' }) },
        { v: 'qr', glyph: 'spark', title: T('connect.review.qr.title'), sub: T('connect.review.qr.sub') }
      ], d.connection_pairing, { label: T('connect.review.confirmTitle') }));
      return out;
    },
    foot: (S) => ({ primary: { label: S.sess.connect.paired ? T('chrome.continue') : T('connect.review.button'), do: 'connect' } }),
    do: {
      pairing(S, v) { if (S.sess.connect.paired) return; O55.draft.set(cd(S), { connection_pairing: v }); S.save(); O55.ui.refresh(); },
      connect(S) {
        if (!S.sess.connect.paired) { S.sess.connect.confirmed = true; O55.draft.set(cd(S), { review_confirmed: true }); S.save(); }
        O55.ui.go(S.sess.connect.paired ? 'c-ready' : 'c-pair');
      }
    }
  });

  /* ------------------------------------------------------------------ C3: pairing (owner work after confirmation) */
  function startPair(S) {
    const s = server(S), d = cd(S), c = S.sess.connect; if (!s || c.paired) return;
    if (!c.pairStart || Date.now() - c.pairStart > 600000) { c.pairStart = Date.now(); S.save(); }
    const done = () => { c.paired = true; O55.draft.set(d, { server_trust_confirmed: true }); S.save(); O55.ui.refresh(); };
    if (d.connection_pairing === 'code') {
      F.op(S, 'pairreach:' + s.id, 'cmd.client.pair.start', [{ key: 'reach', ms: 700 }], { payload: { server: s.id, method: 'code' } });
      return;
    }
    const mid = d.connection_pairing === 'qr' ? { key: 'qr', ms: 1900 } : { key: 'approve', ms: 2800 };
    F.op(S, 'pair:' + s.id, 'cmd.client.pair.start', [{ key: 'reach', ms: 700 }, mid, { key: 'trust', ms: 800 }], { payload: { server: s.id, method: d.connection_pairing }, onDone: done });
  }
  def('c-pair', {
    chapter: 'computer', stage: 'automatic_preparation',
    scene: () => ({ id: 'where', beat: 'connect' }),
    eyebrow: () => T('connect.pair.eyebrow'),
    title: () => T('connect.pair.title'),
    lead: (S) => T('connect.pair.lead', { name: (server(S) || {}).name || '' }),
    body(S) {
      const s = server(S) || {}, d = cd(S), c = S.sess.connect, m = d.connection_pairing;
      const labels = { reach: T('connect.pair.phases.reach', { name: s.name }), approve: T('connect.pair.phases.approve', { device: s.approver }), code: T('connect.pair.phases.code'), qr: T('connect.pair.phases.qr'), trust: T('connect.pair.phases.trust') };
      let out = C.identity(s.seed || s.id, words(s.seed || s.id), s.name + ' · ' + s.address);
      if (m === 'code') {
        out += F.phases(S, 'pairreach:' + s.id, ['reach'], labels);
        const reached = (F.state(S, 'pairreach:' + s.id) || {}).state === 'done';
        const cs = F.state(S, 'paircode:' + s.id);
        if (reached && !c.paired) {
          out += C.field({ bind: 'code', label: T('connect.pair.codeLabel', { name: s.name }), value: c.code || '', placeholder: 'A7K9-M2Q4', hint: T('connect.pair.codeHint'), error: cs && cs.state === 'failed' ? T('connect.pair.codeWrong', { name: s.name }) : '', invalid: cs && cs.state === 'failed' });
          out += `<div class="o55-inline" data-key="checkcode">${O55.ui.btn({ label: T('connect.pair.check'), do: 'checkCode', cls: 'o55-small', disabled: !F.nonEmpty(c.code), reason: T('connect.pair.codeHint') }, 'o55-secondary')}</div>`;
        }
        if (cs) out += F.phases(S, 'paircode:' + s.id, ['code', 'trust'], labels);
      } else {
        out += F.phases(S, 'pair:' + s.id, ['reach', m === 'qr' ? 'qr' : 'approve', 'trust'], labels);
        const st = F.state(S, 'pair:' + s.id);
        const waiting = st && st.state === 'running' && (st.phases || []).some((p) => (p.key === 'approve' || p.key === 'qr') && p.status === 'active');
        if (waiting && m === 'approval') {
          const t = F.countdown((c.pairStart || Date.now()) + 600000);
          out += `<p class="o55-hint" data-key="expiry">${U.esc(T('chrome.expiresIn', { m: t.m, s: t.s }))}</p><div class="o55-sublinks" data-key="resend">${C.link(T('connect.pair.resend'), 'resend')}</div>`;
        }
        if (waiting && m === 'qr') out += `<div class="o55-viewfinder" data-key="vf" aria-label="${U.esc(T('connect.pair.qrAim', { name: s.name }))}"><span class="o55-vf-line"></span><span class="o55-vf-text">${U.esc(T('connect.pair.qrAim', { name: s.name }))}</span></div>`;
      }
      if (c.paired) out += C.note(T('connect.pair.done', { name: s.name }), 'ok', 'check');
      return out;
    },
    mounted(S) { startPair(S); if (!S.sess.connect.paired && cd(S).connection_pairing === 'approval') F.ticker(S, 'c-pair', 1000, () => S.sess.connect.paired); },
    foot: (S) => ({ primary: { label: T('chrome.continue'), do: 'next', disabled: !S.sess.connect.paired, reason: T('connect.pair.phases.approve', { device: (server(S) || {}).approver || '' }) } }),
    do: {
      resend(S) { const s = server(S); S.sess.connect.pairStart = Date.now(); S.save(); O55.ui.refresh(); U.announce(T('connect.pair.phases.approve', { device: s.approver }), S.root.querySelector('.o55-win')); },
      checkCode(S) {
        const s = server(S), c = S.sess.connect;
        const ok = String(c.code || '').replace(/[\s-]/g, '').toUpperCase() === String(s.code).replace(/-/g, '');
        F.reset(S, 'paircode:' + s.id);
        F.op(S, 'paircode:' + s.id, 'cmd.client.pair.start', [{ key: 'code', ms: 500, fail: () => (ok ? null : 'code_mismatch') }, { key: 'trust', ms: 800 }],
          { payload: { server: s.id, method: 'code' }, onDone: () => { c.paired = true; O55.draft.set(cd(S), { server_trust_confirmed: true }); S.save(); O55.ui.refresh(); } });
      },
      next(S) { O55.ui.go('c-ready'); }
    },
    bind: { code(S, v) { S.sess.connect.code = v; S.save(); O55.ui.refresh(); } }
  });

  /* ------------------------------------------------------------------ C4: ready to meet your Puppet Master (Ready) */
  def('c-ready', {
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
      let out = `<button type="button" class="o55-card o55-card-link" data-o55-do="createNew" data-pm-hover-exempt="true" data-key="create">${C.glyph('seed')}<span class="o55-cardtext"><span class="o55-cardtitle">${U.esc(T('connect.ready.create'))}</span><span class="o55-cardsub">${U.esc(T('connect.ready.createSub', { name: s.name }))}</span></span><span class="o55-cardarrow" aria-hidden="true">›</span></button>`;
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
          journey: 'new_or_local', theme_family: th.family, theme_mode: th.mode, project_mode: 'new', server_mode: 'existing_server', server_ref: c.server_ref,
          server_connection_mode: c.server_connection_mode, remote_mode: c.remote_mode, remote_more: c.remote_more, include_vpn_networks: c.include_vpn_networks,
          connection_pairing: c.connection_pairing, tailscale_control: c.tailscale_control, headscale_url: c.headscale_url, remote_endpoint: c.remote_endpoint,
          proxy_hostname: c.proxy_hostname, proxy_hosting: c.remote_mode === 'reverse_proxy' ? 'existing_proxy' : null, proxy_kind: null, proxy_tls: null,
          server_trust_confirmed: c.server_trust_confirmed, storage_mode: 'with_server'
        });
        S.save();
        O55.ui.charm(el, T('begin.new.title'), 'seed');
        O55.ui.go('begin');
      },
      enter(S) { O55.finish(S, { tour: false, project: S.sess.connect.openProject || ((server(S) || {}).projects[0] || {}).id }); },
      tour(S) { O55.finish(S, { tour: true, project: S.sess.connect.openProject || ((server(S) || {}).projects[0] || {}).id }); }
    }
  });

  O55.connect = { server: (S) => server(S), allServers };
})();
