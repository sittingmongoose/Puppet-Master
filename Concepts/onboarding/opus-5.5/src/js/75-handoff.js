/* O55.handoff — what the person set up, handed to the app when onboarding finishes (SCR-03). One record,
   pm.onboarding.result.v1: this device (client), the computer that does the work (host), the Server and the way this
   device reaches it (route), and the Project opened. Other lanes add their part (accounts, source control choices)
   with O55.handoff.part(name, builder); a builder runs once at finish, and one that throws is left out.
   Only adopted state goes in: a pairing trust record, a claimed Server, a committed or chosen Project. A route still
   waiting for its owner, or put off with Later, says so; nothing is reported set up that was not.
   Published as window.PM_ONBOARDING_RESULT (frozen), the window event 'pm:onboarding-result', and, on a page with
   storage, O55.store key pm.onboarding.result.v1 so the app reads it again after a reload. A page with no storage (a
   sandboxed preview) keeps it for the visit. Secret-free by construction: ids, labels and states, never a code, a
   password, a link to sign in with or key material; O55.store's scrub runs over it as well. */
(function () {
  'use strict';
  const O55 = window.O55;
  const KEY = 'pm.onboarding.result.v1';
  const T = (k, v) => O55.t(k, v);
  const parts = new Map();
  const md = (S) => S.sess.drafts.main;
  const cd = (S) => S.sess.drafts.connect;
  /* the draft that names the Server: the connect journey's until it hands over to a new Project on that Server */
  const serverDraft = (S) => (S.sess.active === 'connect' ? cd(S) : md(S));
  const known = (S, id) => (O55.connect && id ? O55.connect.allServers(S).find((x) => x.id === id) : null) || null;

  /* The computer that does the work, valid during the run as at its end (pm7-prov words where the AI runs with it). */
  function host(S) {
    const d = serverDraft(S), sv = S.sess.server || {};
    if (d.server_mode === 'existing_server' && d.server_ref) { const s = known(S, d.server_ref); return { id: d.server_ref, name: s ? s.name : d.server_ref, role: 'existing_server' }; }
    if (d.server_mode === 'new_server') return { id: sv.claimed ? sv.id : null, name: sv.displayName || sv.name || null, role: 'new_server' };
    return { id: S.env.here.id, name: T('where.this.title'), role: 'this_device' };
  }

  /* the Server this device now uses, only once its trust is adopted (a claimed new Server, a paired existing one) */
  function server(S) {
    const d = serverDraft(S), sv = S.sess.server || {}, c = S.sess.connect || {};
    if (d.server_mode === 'new_server') {
      if (!sv.claimed || !sv.id) return null;
      return { server_id: sv.id, name: sv.displayName || sv.id, role: 'new_server', kind: sv.kind || 'nas', address_label: (O55.serverSetup && O55.serverSetup.address(S)) || '', trust_ref: sv.selfTrustId || null };
    }
    if (d.server_mode === 'existing_server') {
      const t = (c.trusts || {})[d.server_ref];
      if (!t || t.server !== d.server_ref || !d.server_trust_confirmed) return null;
      const s = known(S, d.server_ref) || {};
      return { server_id: d.server_ref, name: s.name || d.server_ref, role: 'existing_server', kind: null, address_label: s.address || '', trust_ref: t.id };
    }
    return { server_id: S.env.here.id, name: T('where.this.title'), role: 'this_device', kind: null, address_label: '', trust_ref: null };
  }

  /* How this device reaches the Server. mode follows the draft's remote_mode; state is what actually happened. */
  function route(S) {
    const d = serverDraft(S), mode = d.remote_mode || 'none';
    const base = { mode, control: mode === 'tailscale' ? d.tailscale_control || 'hosted' : null, via: null, endpoint_label: '', state: 'not_set_up' };
    if (mode === 'tailscale') base.endpoint_label = d.tailscale_control === 'headscale' ? d.headscale_url : 'Tailscale';
    if (mode === 'reverse_proxy') base.endpoint_label = d.proxy_hostname;
    if (mode === 'remote_link') base.endpoint_label = d.remote_endpoint;
    if (d.server_mode === 'this_device' || mode === 'none') return Object.assign(base, { mode: 'none', control: null, endpoint_label: '' });
    if (d.server_mode === 'existing_server') {
      const s = known(S, d.server_ref) || {};
      base.via = mode === 'local_or_vpn' ? (s.via === 'vpn' ? 'vpn' : 'lan') : null;
      /* the route the pairing ran over is the one in use; a new Project on that Server keeps it */
      base.state = server(S) ? 'in_use' : 'not_set_up';
      return base;
    }
    /* a new Server: at home (or over a VPN) is how this device paired with it; another way in is set up after the commit */
    if (mode === 'local_or_vpn') { base.via = 'lan'; base.state = server(S) ? 'in_use' : 'not_set_up'; return base; }
    const a = S.sess.awaySetup || {};
    base.state = a.mode === mode && a.state === 'done' ? 'ready' : a.mode === mode && a.state === 'later' ? 'set_up_later'
      : a.mode === mode && (a.state === 'running' || a.state === 'waiting') ? 'waiting' : a.mode === mode && a.state === 'failed' ? 'needs_attention' : 'not_set_up';
    return base;
  }

  /* the Project opened, where it is kept (in words a person reads), and the Server that is its home */
  function project(S, o) {
    const id = o.project || null; if (!id) return null;
    const h = host(S), d = md(S), connected = S.sess.active === 'connect';
    const kind = h.role === 'this_device' ? (d.storage_mode === 'network_location' ? 'network_drive' : 'this_device') : d.storage_mode === 'network_location' && !connected ? 'network_drive' : d.storage_mode === 'this_device' && !connected ? 'this_device' : 'server';
    let label = '';
    try { label = connected || o.restored ? '' : (O55.review && O55.review.filesAt ? O55.review.filesAt(S) : ''); } catch (_) { label = ''; }
    if (!label) label = kind === 'server' ? h.name || '' : S.env.here.projectsRoot || '';
    return { id, name: o.projectName || id, home_server_id: h.id, files: { kind, label } };
  }

  function build(S, o) {
    o = o || {};
    const journey = S.sess.active === 'connect' && !(S.sess.connect || {}).newProject ? 'connect_existing' : (S.sess.restore && S.sess.restore.done && S.sess.restore.scope === 'full') ? 'restore_full' : md(S).journey || 'new_or_local';
    const out = {
      schema: KEY, finished_at: new Date().toISOString(), run: S.sess.started || null, journey,
      client: { client_id: S.env.client.id, name: S.env.client.name, platform: S.env.client.os || '' },
      host: host(S), server: server(S), route: route(S), project: project(S, o)
    };
    parts.forEach((fn, name) => {
      if (name in out) return;
      try { const v = fn(S, o); if (v !== undefined) out[name] = v; } catch (e) { console.warn('O55 handoff part', name, e); }
    });
    return O55.store.scrub(JSON.parse(JSON.stringify(out)), KEY);
  }

  const deepFreeze = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(deepFreeze); Object.freeze(v); } return v; };
  let current = null;
  function expose(rec, announce) {
    current = deepFreeze(rec);
    try { window.PM_ONBOARDING_RESULT = current; } catch (_) {}
    if (announce) window.dispatchEvent(new CustomEvent('pm:onboarding-result', { detail: current }));
  }
  /* finish(): build, keep and announce. The app's owners read it (Settings, the status bar, System status, the
     title bar's Project row) and repaint from it. */
  function publish(S, o) {
    const rec = build(S, o);
    O55.store.set(KEY, rec);
    expose(rec, true);
    return current;
  }

  O55.handoff = {
    KEY,
    part(name, builder) { if (typeof name === 'string' && name && typeof builder === 'function') parts.set(name, builder); },
    host, build, publish,
    current: () => current
  };
  /* a result kept from an earlier visit is handed to the app again as the page starts */
  const kept = O55.store.get(KEY, null);
  if (kept && kept.schema === KEY) expose(kept, true);
})();
