/* Chapter 3 (continued) — Keep your work safe [source_control_setup] and Use it away from home [remote_access_setup].
   Three separate ideas on one calm page: every version saved on this computer (Safe History), an optional online copy
   (a source service such as GitHub; sign-in or account creation happens right here, the online copy itself is only
   made after the reviewed commit), and an optional backup destination (recorded now, signed in after commit).
   Also the shared sign-in screen (browser handoff, device code, create account, access token) and O55.official. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const OL = (S) => (S.sess.online = S.sess.online || { purpose: 'copy' });
  const forgeName = (id, variant) => (id === 'github' && variant === 'self_managed' ? T('online.service.github_enterprise') : (O55.fixtures.forge(id) || {}).name || id);

  /* ================================================================== sign-in (selected-source auth only) */
  /* official.signIn(S, {service, name, kind, then, done}) opens the sign-in screen for one service. `done` names a
     completion handler in O55.official.handlers (sessions store names, not functions). */
  O55.official = {
    handlers: {},
    signIn(S, o) { S.sess.signin = { service: o.service, name: o.name || o.service, kind: o.kind || 'cloud', then: o.then, done: o.done || null, state: 'idle' }; S.save(); O55.ui.go('online-signin'); },
    /* kind: signin (default) | signup | guide | page. The notice says which kind of page opened, and shows the address
       only when the concept knows the real one. */
    open(S, o) {
      O55.owners.dispatch('cmd.auth_profile.open_official_page', { url: o.url || null, kind: o.kind || 'signin' }, S.ctx(), () => ({ ok: true }));
      const what = T('official.' + (o.kind || 'signin'), { name: o.name });
      toast(S, o.url ? what + ' — ' + o.url.replace(/^https:\/\//, '').replace(/\/$/, '') : what);
    },
    /* a source service's sign-in page: the typed address for a self-managed one, the known page for a hosted one */
    forgeUrl(S, service, sub) {
      const d = md(S), OF = O55.fixtures.OFFICIAL;
      if (d.forge === service && d.forge_instance_url && needsAddress(service, d.forge_provider_variant)) return d.forge_instance_url.replace(/\/$/, '') + (sub === 'signup' ? '' : (OF.forgePath[service] || ''));
      return sub === 'signup' ? ((O55.fixtures.forge(service) || {}).signup || null) : (OF.forge[service] || null);
    }
  };
  function toast(S, text) {
    const win = S.root.querySelector('.o55-win'); let el = win.querySelector('.o55-toast');
    if (!el) { el = document.createElement('div'); el.className = 'o55-toast'; el.setAttribute('role', 'status'); win.appendChild(el); }
    el.textContent = text; el.classList.remove('o55-toast-show'); void el.offsetWidth; el.classList.add('o55-toast-show');
    U.announce(text, win);
  }
  O55.ui.toast = (text) => toast(O55.S, text);
  O55.official.handlers.restoreCloud = (S) => { if (S.sess.restore) S.sess.restore.cloudSignedIn = true; };

  const SI = (S) => S.sess.signin || {};
  /* where a sign-in opens: a source service's page, or (restore from a cloud account) the account's own page */
  function signinUrl(S, si) { return si.kind === 'forge' ? O55.official.forgeUrl(S, si.service) : (O55.fixtures.OFFICIAL.backup[si.service] || null); }
  function deviceFor(S, si) {
    if (si.kind !== 'forge') return null;
    const d = md(S), f = O55.fixtures.forge(si.service) || {};
    return f.device && !(d.forge === si.service && needsAddress(si.service, d.forge_provider_variant)) ? f.device : null;
  }
  function accountFor(S, service) {
    const acc = (S.env.forges[service] || { accounts: [] }).accounts;
    return (S.sess.forgeAccounts[service]) || (acc[0] && acc[0].login) || null;
  }
  function completeSignIn(S, login, action) {
    const si = SI(S);
    si.state = 'done'; si.account = login;
    if (si.kind === 'forge') {
      S.sess.forgeAccounts[si.service] = login;
      const d = md(S);
      O55.draft.set(d, { forge_account_action: action, forge_account_ref: 'account:' + si.service + ':' + login });
      if (OL(S).purpose === 'source') O55.draft.set(d, { source_access_authorization_refs: Array.from(new Set(d.source_access_authorization_refs.concat(['auth:' + si.service + ':' + U.slug(login)]))).slice(0, 16) });
    }
    if (si.done && O55.official.handlers[si.done]) O55.official.handlers[si.done](S, login);
    S.save(); O55.sound.play('success'); O55.ui.refresh();
  }
  /* The person finishes in their browser; the fixture completes after a while. A newer attempt (device code, a new
     code) supersedes an older wait, so a stale wait never completes the sign-in. */
  function waitForBrowser(S, ms) {
    const si = SI(S), attempt = si.attempt || 0, key = 'signin:' + si.service + ':' + attempt;
    F.op(S, key, 'cmd.auth_profile.sign_in', [{ key: 'browser', ms: ms || 2700 }], { quiet: true, onDone: () => {
      const cur = SI(S);
      if (cur.service === si.service && (cur.attempt || 0) === attempt && cur.state !== 'done') completeSignIn(S, si.kind === 'forge' ? 'jared-p' : 'jared@example.com', 'sign_in_during_setup');
    } });
  }
  def('online-signin', {
    chapter: 'project', stage: 'source_control_setup',
    scene: (S) => ({ id: 'online', beat: SI(S).state === 'done' ? 'signed' : 'signin' }),
    eyebrow: (S) => (SI(S).kind !== 'forge' ? T('safe.eyebrow') : OL(S).purpose === 'source' ? T('begin.eyebrow') : T('online.signin.eyebrow')),
    title: (S) => T('online.signin.title', { name: SI(S).name }),
    lead: (S) => T('online.signin.lead', { name: SI(S).name }),
    body(S) {
      const si = SI(S), f = si.kind === 'forge' ? O55.fixtures.forge(si.service) : null, env = S.env.forges[si.service] || { accounts: [], signup: true };
      let out = '';
      if (si.state === 'done') return `<div class="o55-banner" data-key="done">${C.small('check', 18)}<span>${U.esc(T('online.signin.signedIn', { account: si.account }))}</span></div>`;
      const known = si.kind === 'forge' ? accountFor(S, si.service) : null;
      if (si.state === 'idle' && known && !si.another) {
        out += C.cards('useKnown', [{ v: known, glyph: 'person', title: T('online.signin.connected', { account: known }), sub: T('online.signin.connectedSub') }], known, {});
        out += `<div class="o55-sublinks" data-key="another">${C.link(T('online.signin.another'), 'another')}</div>`;
        return out;
      }
      if (si.state === 'idle') {
        out += `<div class="o55-actions" data-key="acts">${O55.ui.btn({ label: T('online.signin.signIn'), do: 'signIn' }, 'o55-primary')}`
          + (env.signup === false ? '' : O55.ui.btn({ label: T('online.signin.create'), do: 'create' }, 'o55-secondary')) + '</div>';
        if (env.signup === false) out += C.note(T('online.signin.admin'), 'info', 'person');
        if (f && f.token) out += `<div class="o55-sublinks" data-key="tok">${C.link(T('online.signin.token'), 'tokenOn')}</div>`;
      }
      if (si.state === 'token') {
        const ts = F.state(S, 'token:' + si.service);
        out += C.field({ bind: 'token', type: 'password', protected: true, label: T('online.signin.tokenLabel'), value: '', hint: T('online.signin.tokenHint'), error: ts && ts.state === 'failed' ? T('online.signin.tokenBad') : '' });
        out += `<div class="o55-inline" data-key="tokbtn">${O55.ui.btn({ label: T('ai.verify'), do: 'tokenCheck', cls: 'o55-small', disabled: !si.tokenTyped, reason: T('online.signin.tokenLabel') }, 'o55-secondary')}</div>`;
      }
      if (si.state === 'waiting' || si.state === 'code') {
        out += `<div class="o55-row o55-row-wait" data-key="wait"><span class="o55-spin" aria-hidden="true"></span><span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('online.signin.waiting'))}</span><span class="o55-rowmeta">${U.esc(T('official.signin', { name: si.name }))}</span></span></div>`;
        /* a device code only where the service has a device sign-in; otherwise the sign-in link to paste */
        if (si.state === 'waiting') out += `<div class="o55-sublinks" data-key="nob">${C.link(T('online.signin.noBrowser'), deviceFor(S, si) ? 'code' : 'copyLink')}</div>`;
        else {
          const t = F.countdown(si.codeUntil || Date.now()), url = deviceFor(S, si);
          out += `<div class="o55-devicecode" data-key="dc"><span class="o55-hint">${U.esc(T('online.signin.codeLead', { url }))}</span><span class="o55-paircode">${U.esc(si.code || 'WDJB-MJHT')}</span>`
            + `<span class="o55-hint">${U.esc(t.left ? T('chrome.expiresIn', { m: t.m, s: t.s }) : T('connect.pair.expired'))}</span>`
            + `<span class="o55-pairbtns">${F.copyBtn(si.code || 'WDJB-MJHT', 'dcode')}${O55.ui.btn({ label: T('chrome.newCode'), do: 'newCode', cls: 'o55-small' }, 'o55-secondary')}</span></div>`;
        }
      }
      if (si.state === 'create') {
        out += `<div class="o55-official" data-key="official" role="group" aria-label="${U.esc(T('online.signin.simTitle', { name: si.name }))}"><div class="o55-officialbar"><span class="o55-dot"></span><span class="o55-dot"></span><span class="o55-dot"></span><span class="o55-officialurl">${U.esc((f && f.signup) || si.service)}</span></div>`
          + `<div class="o55-officialbody"><p class="o55-officialtitle">${U.esc(T('online.signin.simTitle', { name: si.name }))}</p>`
          + C.field({ bind: 'simUser', label: T('online.signin.simUser'), value: si.simUser || '', placeholder: 'jared-p' }) + C.field({ bind: 'simEmail', label: T('online.signin.simEmail'), value: si.simEmail || '', placeholder: 'jared@example.com' })
          + O55.ui.btn({ label: T('online.signin.simButton'), do: 'simCreate', disabled: !F.nonEmpty(si.simUser) || !/@/.test(si.simEmail || ''), reason: T('online.signin.simEmail') }, 'o55-primary')
          + `<p class="o55-hint">${U.esc(T('online.signin.simNote', { name: si.name }))}</p></div></div>`;
      }
      if (si.state === 'email') {
        out += `<div class="o55-banner" data-key="email">${C.small('spark', 18)}<span>${U.esc(T('online.signin.email'))}</span></div>`;
        out += `<div class="o55-actions" data-key="conf">${O55.ui.btn({ label: T('online.signin.confirmed'), do: 'confirmed' }, 'o55-primary')}</div>`;
      }
      return out;
    },
    mounted(S) { const si = SI(S); if (si.state === 'code') F.ticker(S, 'online-signin', 1000, () => SI(S).state !== 'code'); },
    foot(S) {
      const si = SI(S);
      if (si.state === 'done' || (si.state === 'idle' && accountFor(S, si.service) && !si.another && si.kind === 'forge')) return { primary: { label: T('chrome.continue'), do: 'next' } };
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: true, reason: T('missing.signin') } };
    },
    do: {
      useKnown(S) {},
      another(S) { SI(S).another = true; S.save(); O55.ui.refresh(); },
      signIn(S) { const si = SI(S); si.state = 'waiting'; si.attempt = (si.attempt || 0) + 1; S.save(); O55.official.open(S, { name: si.name, url: signinUrl(S, si) }); O55.ui.refresh(); waitForBrowser(S); },
      copyLink(S) { const si = SI(S), url = signinUrl(S, si); if (url) U.copyText(url); O55.ui.toast(url ? T('online.signin.linkCopied', { url: url.replace(/^https:\/\//, '') }) : T('online.signin.linkCopiedNone')); },
      code(S) { const si = SI(S); si.state = 'code'; si.code = 'WDJB-MJHT'; si.codeUntil = Date.now() + 900000; si.attempt = (si.attempt || 0) + 1; S.save(); O55.ui.refresh(); F.ticker(S, 'online-signin', 1000, () => SI(S).state !== 'code'); waitForBrowser(S, 7000); },
      newCode(S) { const si = SI(S); si.code = ['WDJB', 'K3PX', 'R7QM', 'T2LN'][Math.floor(Math.random() * 4)] + '-' + ['MJHT', 'V9CZ', 'H4WE', 'B8KD'][Math.floor(Math.random() * 4)]; si.codeUntil = Date.now() + 900000; si.attempt = (si.attempt || 0) + 1; S.save(); O55.ui.refresh(); waitForBrowser(S, 7000); },
      create(S) { const si = SI(S); si.state = 'create'; S.save(); O55.official.open(S, { kind: 'signup', name: si.name, url: si.kind === 'forge' ? O55.official.forgeUrl(S, si.service, 'signup') : null }); O55.ui.refresh(); },
      simCreate(S) { const si = SI(S); si.state = 'email'; si.newLogin = si.simUser.trim(); S.save(); O55.ui.refresh(); },
      confirmed(S) { const si = SI(S); completeSignIn(S, si.newLogin || 'jared-p', 'create_account_during_setup'); },
      tokenOn(S) { SI(S).state = 'token'; S.save(); O55.ui.refresh(); },
      tokenCheck(S) {
        const si = SI(S), i = S.root.querySelector('#o55f-token'), v = i ? i.value.trim() : ''; if (i) i.value = '';
        si.tokenTyped = false; F.reset(S, 'token:' + si.service);
        F.op(S, 'token:' + si.service, 'cmd.auth_profile.sign_in', [{ key: 'verify', ms: 800, fail: () => (v.length >= 8 ? null : 'token_rejected') }], {
          /* normalize() rebuilds the instance profile with auth_method pat_ref; the token itself went to the keychain owner */
          onDone: () => { const d = md(S); d.forge_auth_method = 'token'; O55.draft.set(d, { forge_instance_profile: null }); if (d.forge_instance_profile) d.forge_instance_profile.credential_ref = 'credential:' + si.service + ':token'; completeSignIn(S, 'jared', 'sign_in_during_setup'); }
        });
      },
      next(S) {
        const si = SI(S);
        if (si.state !== 'done' && si.kind === 'forge') { const k = accountFor(S, si.service); completeSignIn(S, k, 'already_connected'); }
        O55.ui.go(si.then || 'safe');
      }
    },
    bind: {
      token(S, v) { const had = !!SI(S).tokenTyped; SI(S).tokenTyped = v.length > 0; if (had !== SI(S).tokenTyped) { S.save(); O55.ui.refresh(); } },
      simUser(S, v) { SI(S).simUser = v; S.save(); O55.ui.refresh(); },
      simEmail(S, v) { SI(S).simEmail = v; S.save(); O55.ui.refresh(); }
    },
    skipOnBack: (S) => SI(S).state === 'done'
  });

  /* ================================================================== which service */
  const VARIANTS = {
    github: [['hosted', 'GitHub.com'], ['self_managed', null]], gitlab: [['hosted', 'GitLab.com'], ['self_managed', null]],
    azure_devops: [['cloud', 'azureServices'], ['self_managed', 'azureServer']], bitbucket_cloud: [['cloud', 'bbCloud']], bitbucket_data_center: [['data_center', 'bbDc']],
    forgejo: [['forgejo_cloud', 'forgejoCloud'], ['forgejo_self_managed', 'ownServer']], gitea: [['gitea_cloud', 'giteaCloud'], ['gitea_self_managed', 'ownServer']], cursor_origin: [['preview', null]]
  };
  const needsAddress = (forge, variant) => /self_managed|data_center/.test(variant || '') || (forge === 'bitbucket_data_center');
  def('online-service', {
    chapter: 'project', stage: 'source_control_setup', charmSlot: 'online',
    scene: () => ({ id: 'online', beat: 'service' }),
    eyebrow: (S) => (OL(S).purpose === 'source' ? T('begin.eyebrow') : T('online.service.eyebrow')),
    title: (S) => (OL(S).purpose === 'source' ? T('online.service.titleSource') : T('online.service.title')),
    lead: () => T('online.service.lead'),
    body(S) {
      const d = md(S), ol = OL(S), sel = ol.forge || (d.forge !== 'none' ? (d.forge === 'github' && d.forge_provider_variant === 'self_managed' ? 'github_enterprise' : d.forge) : 'github');
      let out = C.cards('pick', [{ v: 'github', glyph: 'cloud', title: T('online.service.github.title'), sub: T('online.service.github.sub'), tag: T('chrome.recommended') }], sel, { label: T('online.service.title') });
      const others = ['gitlab', 'azure_devops', 'bitbucket_cloud', 'forgejo', 'gitea', 'github_enterprise', 'cursor_origin'].map((id) => ({ v: id, glyph: 'cloud', title: T('online.service.' + id), tag: id === 'cursor_origin' ? T('online.service.preview') : '', quiet: true }));
      out += F.more(ol.others || sel !== 'github', T('online.service.others'), 'others', C.cards('pick', others, sel, { cls: 'o55-choices-quiet' }), 'others');
      const forge = sel === 'github_enterprise' ? 'github' : sel === 'bitbucket_cloud' && ol.variant === 'data_center' ? 'bitbucket_data_center' : sel;
      if (sel !== 'github' && sel !== 'github_enterprise' && sel !== 'cursor_origin') {
        const vs = sel === 'bitbucket_cloud' ? [['cloud', 'bbCloud'], ['data_center', 'bbDc']] : VARIANTS[forge] || [];
        if (vs.length > 1) out += C.segmented({ do: 'variant', value: ol.variant || vs[0][0], label: T('online.service.others'), options: vs.map(([v, k]) => ({ v, label: k && k.includes('.') ? k : k ? T('online.service.' + k) : T('online.service.selfManaged') })) });
      }
      const variant = sel === 'github_enterprise' ? 'self_managed' : ol.variant || (VARIANTS[forge] || [['hosted']])[0][0];
      if (needsAddress(forge, variant === 'data_center' ? 'data_center' : variant)) out += C.field({ bind: 'address', label: T('online.service.addressLabel'), value: ol.address || '', placeholder: 'https://git.example.com', hint: T('online.service.addressHint'), valid: F.isHttps(ol.address) });
      return out;
    },
    foot(S) {
      const ol = OL(S), sel = ol.forge || 'github', variant = sel === 'github_enterprise' ? 'self_managed' : ol.variant;
      const forge = sel === 'github_enterprise' ? 'github' : sel === 'bitbucket_cloud' && variant === 'data_center' ? 'bitbucket_data_center' : sel;
      const bad = needsAddress(forge, variant) && !F.isHttps(ol.address);
      const sec = ol.purpose === 'copy' ? [{ label: T('safe.notNow'), do: 'notNow', cls: 'o55-ghost' }] : [];
      return { secondary: sec, primary: { label: T('chrome.continue'), do: 'next', disabled: bad, reason: T('online.service.addressHint') } };
    },
    do: {
      pick(S, v, el) { const ol = OL(S); ol.forge = v; ol.variant = null; S.save(); O55.ui.refresh(); O55.ui.charm(el, T('online.service.' + (v === 'github' ? 'github.title' : v)), 'cloud'); },
      others(S) { OL(S).others = !OL(S).others; S.save(); O55.ui.refresh(); },
      variant(S, v) { OL(S).variant = v; S.save(); O55.ui.refresh(); },
      notNow(S) { O55.draft.set(md(S), { online_mode: 'none' }); S.save(); O55.ui.go('safe', { dir: 'back' }); },
      next(S) {
        const ol = OL(S), d = md(S), sel = ol.forge || 'github';
        let forge = sel, variant = ol.variant;
        if (sel === 'github_enterprise') { forge = 'github'; variant = 'self_managed'; }
        if (sel === 'bitbucket_cloud' && variant === 'data_center') { forge = 'bitbucket_data_center'; variant = 'data_center'; }
        if (!variant) variant = (VARIANTS[forge] || [['hosted']])[0][0];
        const patch = { online_mode: ol.purpose === 'source' ? 'existing' : 'new', forge, forge_provider_variant: variant, forge_instance_profile: null };
        if (needsAddress(forge, variant)) patch.forge_instance_url = ol.address.trim();
        else patch.forge_instance_url = '';
        O55.draft.set(d, patch);
        S.save();
        O55.official.signIn(S, { service: forge, name: forgeName(forge, variant), kind: 'forge', then: ol.purpose === 'source' ? 'ex-repos' : 'online-details' });
      }
    },
    bind: { address(S, v) { OL(S).address = v; S.save(); O55.ui.refresh(); } }
  });

  /* ================================================================== name, privacy, owner, advanced (a new online copy) */
  function nameTaken(S, name) { const f = S.env.forges[md(S).forge] || { taken: [] }; return f.taken.includes(String(name || '').trim().toLowerCase()); }
  def('online-details', {
    chapter: 'project', stage: 'source_control_setup',
    scene: () => ({ id: 'online', beat: 'signed' }),
    eyebrow: () => T('online.details.eyebrow'),
    title: (S) => T('online.details.title', { name: forgeName(md(S).forge, md(S).forge_provider_variant) }),
    lead: (S) => T('online.details.lead', { name: forgeName(md(S).forge, md(S).forge_provider_variant) }),
    body(S) {
      const d = md(S), svc = forgeName(d.forge, d.forge_provider_variant), env = S.env.forges[d.forge] || { orgs: [] }, account = S.sess.forgeAccounts[d.forge] || 'jared-p';
      const taken = nameTaken(S, d.repository_name);
      let out = C.field({ bind: 'repo', label: T('online.details.nameLabel', { name: svc }), value: d.repository_name, prefix: (d.repository_owner_scope === 'organization' && d.repository_container ? d.repository_container : account) + ' / ', hint: taken ? '' : T('online.details.available'), valid: !taken && F.nonEmpty(d.repository_name), error: taken ? T('online.details.taken', { owner: account }) : '', invalid: taken });
      if (env.orgs.length && d.forge !== 'azure_devops') {
        out += C.group(T('online.details.owner'), C.cards('owner', [{ v: 'personal', glyph: 'person', title: T('online.details.personal', { account }) }].concat(env.orgs.map((o) => ({ v: 'org:' + o, glyph: 'stack', title: o }))), d.repository_owner_scope === 'organization' ? 'org:' + d.repository_container : 'personal', { cls: 'o55-choices-quiet' }));
      }
      if (d.forge === 'azure_devops') {
        out += C.segmented({ do: 'azOrg', value: d.repository_container || env.orgs[0], label: T('online.details.container'), options: env.orgs.map((o) => ({ v: o, label: o })) });
        out += C.group(T('online.details.project'), C.cards('azProject', (env.projects || []).map((p) => ({ v: p, glyph: 'stack', title: p, quiet: true })), d.repository_project, { cls: 'o55-choices-quiet' }));
        out += C.note(T('online.details.azurePrivacy'), 'info', 'lock');
      } else {
        const allowed = O55.draft.allowedVisibility(d).filter((v) => v !== 'internal' || d.repository_owner_scope === 'organization' || d.forge === 'cursor_origin');
        const org = d.repository_container || env.orgs[0] || '';
        out += C.group(T('online.details.privacy'), C.cards('vis', allowed.map((v) => ({ v, glyph: v === 'public' ? 'globe' : v === 'internal' ? 'stack' : 'lock', title: v === 'internal' ? T('online.details.internal', { org }) : T('online.details.' + v), sub: v === 'internal' ? T('online.details.internalSub') : T('online.details.' + v + 'Sub'), quiet: true })), d.repository_visibility, { cls: 'o55-choices-quiet' }));
      }
      const adv = C.field({ bind: 'desc', label: T('online.details.description'), value: d.repository_description }) + C.field({ bind: 'branch', label: T('online.details.branch'), value: d.repository_default_branch })
        + C.toggle({ do: 'readme', on: d.repository_initialize_readme, label: T('online.details.readme'), sub: T('online.details.readmeSub') })
        + C.segmented({ do: 'gitignore', value: d.repository_gitignore, label: T('online.details.gitignore'), options: Object.entries(O55.tx('online.details.gitignoreOpts')).map(([v, label]) => ({ v, label })) })
        + C.segmented({ do: 'license', value: d.repository_license, label: T('online.details.license'), options: Object.entries(O55.tx('online.details.licenseOpts')).map(([v, label]) => ({ v, label })) });
      out += F.more(!!S.sess.ui.onlineAdv, T('online.details.advanced'), 'adv', adv, 'adv');
      return out;
    },
    mounted(S) { const d = md(S); if (!d.repository_name) { O55.draft.set(d, { repository_name: U.slug(d.project_name) || 'new-project' }); S.save(); } },
    foot(S) {
      const d = md(S), taken = nameTaken(S, d.repository_name);
      const reason = !F.nonEmpty(d.repository_name) ? T('online.details.nameLabel', { name: forgeName(d.forge) }) : taken ? T('online.details.taken', { owner: S.sess.forgeAccounts[d.forge] || '' }) : d.forge === 'azure_devops' && !d.repository_project ? T('missing.azureProject') : '';
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!reason, reason } };
    },
    do: {
      owner(S, v) { const d = md(S); if (v === 'personal') O55.draft.set(d, { repository_owner_scope: 'personal', repository_container: '' }); else O55.draft.set(d, { repository_owner_scope: 'organization', repository_container: v.slice(4) }); S.save(); O55.ui.refresh(); },
      vis(S, v) { O55.draft.set(md(S), { repository_visibility: v }); S.save(); O55.ui.refresh(); },
      azOrg(S, v) { O55.draft.set(md(S), { repository_container: v }); S.save(); O55.ui.refresh(); },
      azProject(S, v) { O55.draft.set(md(S), { repository_project: v }); S.save(); O55.ui.refresh(); },
      adv(S) { S.sess.ui.onlineAdv = !S.sess.ui.onlineAdv; S.save(); O55.ui.refresh(); },
      readme(S) { O55.draft.set(md(S), { repository_initialize_readme: !md(S).repository_initialize_readme }); S.save(); O55.ui.refresh(); },
      gitignore(S, v) { O55.draft.set(md(S), { repository_gitignore: v }); S.save(); O55.ui.refresh(); },
      license(S, v) { O55.draft.set(md(S), { repository_license: v }); S.save(); O55.ui.refresh(); },
      next(S) {
        O55.owners.dispatch('cmd.forge.repository.list', { check: md(S).repository_name }, S.ctx(), () => ({ ok: true }));
        O55.ui.go('safe');
      }
    },
    bind: {
      repo(S, v) { O55.draft.set(md(S), { repository_name: v.trim().replace(/\s+/g, '-') }); S.save(); O55.ui.refresh(); },
      desc(S, v) { O55.draft.set(md(S), { repository_description: v }); S.save(); },
      branch(S, v) { O55.draft.set(md(S), { repository_default_branch: v.trim() || 'main' }); S.save(); }
    }
  });

  /* ================================================================== pick the online Project to bring in */
  def('ex-repos', {
    chapter: 'project', stage: 'first_project',
    scene: () => ({ id: 'online', beat: 'signed' }),
    eyebrow: () => T('online.repos.eyebrow'),
    title: () => T('online.repos.title'),
    lead: (S) => T('online.repos.lead', { account: S.sess.forgeAccounts[md(S).forge] || '', name: forgeName(md(S).forge, md(S).forge_provider_variant) }),
    body(S) {
      const d = md(S), env = S.env.forges[d.forge] || { repos: [] }, q = String(S.sess.ui.repoQ || '').toLowerCase();
      const list = env.repos.filter((r) => !q || r.name.includes(q));
      let out = C.field({ bind: 'q', label: T('online.repos.search'), value: S.sess.ui.repoQ || '', placeholder: T('chrome.search') });
      out += list.length ? C.cards('pick', list.map((r) => ({ v: r.owner + '/' + r.name, glyph: 'cloud', title: r.name, sub: r.owner + ' · ' + (r.private ? T('online.repos.private') : T('online.repos.public')) + ' · ' + r.updated })), d.repository_ref.replace(/^[a-z_]+:/, ''), { label: T('online.repos.title') }) : C.note(T('online.repos.empty'), 'info');
      if (d.repository_ref) out += `<p class="o55-locline" data-key="copyto">${C.small(O55.project.onServer(S) ? 'server' : 'computer', 16)}<span>${U.esc(O55.project.onServer(S) ? T('online.repos.copyToServer', { name: O55.project.serverName(S) }) : T('online.repos.copyTo', { path: O55.project.docsPath(S, d.project_name) }))}</span></p>`;
      return out;
    },
    foot: (S) => ({ primary: { label: T('chrome.continue'), do: 'next', disabled: !md(S).repository_ref, reason: T('missing.repository') } }),
    do: {
      pick(S, v, el) { const d = md(S), name = v.split('/').pop(); O55.draft.set(d, { repository_ref: d.forge + ':' + v, repository_name: name, project_name: O55.project.pretty(name) }); S.save(); O55.ui.refresh(); O55.owners.dispatch('cmd.forge.repository.list', { selected: v }, S.ctx(), () => ({ ok: true })); },
      next(S) { O55.ui.go('name'); }
    },
    bind: { q(S, v) { S.sess.ui.repoQ = v; S.save(); O55.ui.refresh(); } }
  });

  /* ================================================================== backup destinations */
  /* The NAS a backup can go to is one found on this network. It is no backup if the Project's own files already live
     on that NAS: on it over SSH, as its storage, or because the Puppet Master Server is that NAS. */
  const backupNas = (S) => S.env.devices.find((x) => x.ssh) || null;
  function filesOnNas(S) {
    const d = md(S), n = S.sess.nas || {}, nas = backupNas(S); if (!nas) return false;
    if (n.device === nas.id && n.purpose !== 'dest' && (d.project_transport === 'ssh' || (d.storage_mode === 'network_location' && d.storage_transport === 'ssh'))) return true;
    const srv = d.server_mode !== 'this_device' ? S.env.pmServers.find((x) => x.id === d.server_ref) : null;
    return !!(srv && srv.device === nas.id);
  }
  const backupLabel = (S, dest) => (dest === 'nas' ? (backupNas(S) || { name: T('safe.backup.nas') }).name : T('safe.backup.' + dest));
  /* S3 or B2 and SFTP or WebDAV connect with access details, not a browser sign-in. The secret is read from its field
     when it is used and handed to the credential owner; the session records only that one was typed. */
  const ACCESS = { s3: [['bucket', 'text'], ['keyId', 'text'], ['secret', 'password']], sftp: [['address', 'text'], ['user', 'text'], ['password', 'password']] };
  const accessFields = (S, kind, st) => ACCESS[kind].map(([k, type]) => C.field({ bind: 'acc-' + k, type, protected: type === 'password', label: T('access.' + kind + '.' + k),
    value: type === 'password' ? '' : (st[k] || ''), placeholder: O55.tx('access.' + kind + '.' + k + 'Ph') || '', hint: O55.tx('access.' + kind + '.' + k + 'Hint') || '', autocomplete: type === 'password' ? 'off' : undefined })).join('');
  const accessReady = (kind, st) => !!ACCESS[kind] && ACCESS[kind].every(([k, type]) => (type === 'password' ? !!st[k + 'Typed'] : F.nonEmpty(st[k])));
  function accessBind(kind, st, S, key, v) {
    const f = (ACCESS[kind] || []).find(([k]) => k === key); if (!f) return;
    if (f[1] === 'password') { const had = !!st[key + 'Typed']; st[key + 'Typed'] = v.length > 0; if (had !== st[key + 'Typed']) { S.save(); O55.ui.refresh(); } }
    else { st[key] = v; S.save(); O55.ui.refresh(); }
  }
  /* read and clear the secret field; false when it is empty (after a reload the field always is) */
  function accessTake(S, kind, st) {
    const f = ACCESS[kind].find(([, t]) => t === 'password'), i = S.root.querySelector('#o55f-acc-' + f[0]), ok = !!(i && i.value);
    if (i) i.value = ''; st[f[0] + 'Typed'] = false; S.save(); return ok;
  }
  const accessReset = (st) => { Object.keys(st || {}).forEach((k) => { if (/Typed$/.test(k)) st[k] = false; }); };
  const accessBinds = (get) => Object.fromEntries(['bucket', 'keyId', 'secret', 'address', 'user', 'password'].map((k) => ['acc-' + k, (S, v) => { const [kind, st] = get(S); accessBind(kind, st, S, k, v); }]));
  O55.backup = { nas: backupNas, filesOnNas, label: backupLabel, accessFields, accessReady, accessTake, accessReset, accessBinds };

  /* ================================================================== keep your work safe */
  const BACKUPS = [['nas', 'server'], ['gdrive', 'cloud'], ['onedrive', 'cloud'], ['s3', 'vault'], ['sftp', 'server']];
  def('safe', {
    chapter: 'project', stage: 'source_control_setup', charmSlot: 'safe',
    scene: (S) => ({ id: 'safe', beat: 'default', params: { online: md(S).online_mode !== 'none', backup: !!S.sess.backup.dest } }),
    eyebrow: () => T('safe.eyebrow'),
    title: () => T('safe.title'),
    lead: () => T('safe.lead'),
    body(S) {
      const d = md(S), fi = S.sess.folderInfo, existing = d.project_mode === 'existing_local' && fi && fi.history;
      /* 1. Safe History */
      const hist = `<div class="o55-saferow" data-key="r-hist">${C.glyph('history')}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('safe.history.title'))}</span><span class="o55-rowmeta">${U.esc(existing ? T('safe.history.subExisting') : T('safe.history.sub'))}</span></span>${C.pill('ready', d.history_backend === 'jujutsu' ? 'Jujutsu' : 'Git')}</div>`
        + C.details(S, 'hist', T('safe.history.detailsLabel'), C.cards('backend', [{ v: 'git', glyph: 'history', title: T('safe.history.git'), sub: T('safe.history.gitSub'), quiet: true }, { v: 'jujutsu', glyph: 'rewind', title: T('safe.history.jj'), sub: T('safe.history.jjSub'), quiet: true }], d.history_backend, { cls: 'o55-choices-quiet' })
          + C.toggle({ do: 'filesafe', on: d.filesafe, label: T('safe.history.filesafe'), sub: T('safe.history.filesafeSub') }));
      /* 2. online copy */
      let onlineState, onlineBtn = '';
      /* a folder that already has an online copy keeps it: show it, and do not offer a second one */
      const folderOnline = d.project_mode === 'existing_local' && fi && fi.online;
      if (d.project_mode === 'existing_online') onlineState = forgeName(d.forge) + ' · ' + d.repository_ref.replace(/^[a-z_]+:/, '');
      else if (folderOnline && d.online_mode === 'none') onlineState = forgeName(folderOnline.forge) + ' · ' + folderOnline.repo + ' · ' + T('safe.online.linked');
      else if (d.online_mode === 'new') {
        const privacy = d.forge === 'azure_devops' ? T('online.details.azurePrivacy') : d.repository_visibility === 'internal' ? T('online.details.internal', { org: d.repository_container }) : d.repository_visibility ? T('online.details.' + d.repository_visibility) : '';
        onlineState = T('safe.online.set', { service: forgeName(d.forge, d.forge_provider_variant), privacy });
        onlineBtn = C.link(T('chrome.change'), 'online');
      } else {
        onlineState = T('safe.online.notNow') + ' · ' + T('safe.online.sub');
        onlineBtn = O55.ui.btn({ label: T('safe.online.add'), do: 'online', cls: 'o55-small' }, 'o55-secondary');
      }
      const online = `<div class="o55-saferow" data-key="r-online">${C.glyph('cloud')}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('safe.online.title'))}</span><span class="o55-rowmeta">${U.esc(onlineState)}</span></span>${onlineBtn}</div>`;
      /* 3. backup */
      const bk = S.sess.backup.dest;
      const backup = `<div class="o55-saferow" data-key="r-backup">${C.glyph('vault')}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('safe.backup.title'))}</span><span class="o55-rowmeta">${U.esc(bk ? backupLabel(S, bk) + ' · ' + T('safe.backup.note') : T('safe.backup.later') + ' · ' + T('safe.backup.sub'))}</span></span>${C.link(bk ? T('chrome.change') : T('safe.backup.later') + ' ›', 'backup')}</div>`;
      let out = hist + online + backup;
      if (S.sess.ui.sheet === 'backup') {
        out += C.sheet(S, 'backup', T('safe.backup.sheetTitle'), C.cards('bdest', BACKUPS.filter(([v]) => v !== 'nas' || backupNas(S)).map(([v, g]) => ({ v, glyph: g, title: backupLabel(S, v), sub: O55.tx('safe.backup.' + v + 'Sub') || '', quiet: true,
          disabled: v === 'nas' && filesOnNas(S), reason: T('safe.backup.nasSame', { name: backupLabel(S, 'nas') }) })).concat([{ v: 'none', glyph: 'history', title: T('safe.backup.none'), quiet: true }]), bk || 'none', { cls: 'o55-choices-quiet' }) + C.note(T('safe.backup.note'), 'info', 'lock'), O55.ui.btn({ label: T('chrome.done'), do: 'sheet-close' }, 'o55-primary'));
      }
      if (O55.project.onServer(S)) out += C.note(T('safe.sync'), 'info', 'link');
      return out;
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      backend(S, v) { O55.draft.set(md(S), { history_backend: v }); S.save(); O55.ui.refresh(); },
      filesafe(S) { O55.draft.set(md(S), { filesafe: !md(S).filesafe }); S.save(); O55.ui.refresh(); },
      online(S) { OL(S).purpose = 'copy'; S.save(); O55.ui.go('online-service'); },
      backup(S) { S.sess.ui.sheet = 'backup'; S.save(); O55.ui.refresh(); },
      bdest(S, v, el) { S.sess.backup.dest = v === 'none' ? null : v; S.save(); O55.ui.refresh(); if (v !== 'none') O55.ui.charm(el, backupLabel(S, v), 'vault'); },
      next(S) { O55.ui.go(md(S).server_mode === 'new_server' ? 'away' : 'review'); }
    },
    leave(S) { if (S.sess.ui.sheet === 'backup') { S.sess.ui.sheet = null; S.save(); } }
  });

  /* ================================================================== use it away from home (new Server paths) */
  def('away', {
    chapter: 'project', stage: 'remote_access_setup', charmSlot: 'away',
    scene: (S) => ({ id: 'away', beat: md(S).remote_mode === 'local_or_vpn' || md(S).remote_mode === 'none' ? 'home' : 'anywhere' }),
    eyebrow: () => T('away.eyebrow'),
    title: () => T('away.title'),
    lead: (S) => T('away.lead', { name: O55.project.serverName(S) }),
    body(S) {
      const d = md(S), mode = d.remote_mode;
      const top = mode === 'tailscale' && d.tailscale_control !== 'headscale' ? 'anywhere' : mode === 'local_or_vpn' || mode === 'none' ? 'home' : 'more';
      let out = C.cards('pick', [
        { v: 'home', glyph: 'computer', title: T('away.home.title'), sub: T('away.home.sub') },
        { v: 'anywhere', glyph: 'globe', title: T('away.anywhere.title'), sub: T('away.anywhere.sub'), tag: T('chrome.recommended') }
      ], top === 'more' ? null : top, { label: T('away.title') });
      let more = C.cards('route', [
        { v: 'headscale', glyph: 'globe', title: T('away.headscale'), quiet: true },
        { v: 'reverse_proxy', glyph: 'globe', title: T('away.proxy.title'), sub: T('away.proxy.sub'), quiet: true },
        { v: 'remote_link', glyph: 'link', title: T('away.link.title'), sub: T('away.link.sub'), quiet: true }
      ], mode === 'tailscale' && d.tailscale_control === 'headscale' ? 'headscale' : mode, { cls: 'o55-choices-quiet' });
      if (mode === 'tailscale' && d.tailscale_control === 'headscale') more += C.field({ bind: 'headscale', label: T('connect.route.tailscale.headscaleLabel'), value: d.headscale_url, placeholder: 'https://headscale.example.com', valid: F.isHttps(d.headscale_url) });
      if (mode === 'reverse_proxy') {
        more += C.field({ bind: 'proxy', label: T('away.proxy.label'), value: d.proxy_hostname, placeholder: 'https://pm.example.com', valid: F.isHttps(d.proxy_hostname) });
        more += C.segmented({ do: 'hosting', value: d.proxy_hosting || 'generate_for_server', label: T('away.proxy.hosting'), options: [{ v: 'generate_for_server', label: T('away.proxy.pm') }, { v: 'generate_only', label: T('away.proxy.generate') }, { v: 'existing_proxy', label: T('away.proxy.existing') }] });
        if (d.proxy_hosting !== 'existing_proxy') more += C.segmented({ do: 'tls', value: d.proxy_tls || 'lets_encrypt', label: T('away.proxy.tls'), options: [{ v: 'lets_encrypt', label: T('away.proxy.free') }, { v: 'existing_certificate', label: T('away.proxy.own') }] });
        more += C.details(S, 'proxykind', T('away.proxy.kind'), C.segmented({ do: 'kind', value: d.proxy_kind || 'caddy', label: T('away.proxy.kind'), options: [{ v: 'caddy', label: 'Caddy' }, { v: 'nginx', label: 'NGINX' }, { v: 'traefik', label: 'Traefik' }, { v: 'nginx_proxy_manager', label: 'Nginx Proxy Manager' }] }) + `<p>${U.esc(T('away.proxy.detail'))}</p>`);
      }
      if (mode === 'remote_link') more += C.field({ bind: 'link', label: T('away.link.label'), value: d.remote_endpoint, placeholder: 'pm-remote-link:home-nas/7Q2K', hint: T('away.link.hint') });
      out += F.more(d.remote_more || top === 'more', T('away.more'), 'more', more, 'more');
      return out;
    },
    foot(S) { const miss = O55.draft.missing(md(S)).find((m) => ['remote_endpoint', 'proxy_hostname', 'headscale_url'].includes(m.field)); return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!miss, reason: miss ? T(miss.key) : '' } }; },
    do: {
      pick(S, v, el) { O55.draft.set(md(S), v === 'home' ? { remote_mode: 'local_or_vpn' } : { remote_mode: 'tailscale', tailscale_control: 'hosted' }); S.save(); O55.ui.refresh(); O55.ui.charm(el, T('away.' + v + '.title'), v === 'home' ? 'computer' : 'globe'); },
      more(S) { O55.draft.set(md(S), { remote_more: !md(S).remote_more }); S.save(); O55.ui.refresh(); },
      route(S, v) { O55.draft.set(md(S), v === 'headscale' ? { remote_mode: 'tailscale', tailscale_control: 'headscale', remote_more: true } : { remote_mode: v, remote_more: true }); S.save(); O55.ui.refresh(); },
      hosting(S, v) { O55.draft.set(md(S), { proxy_hosting: v, proxy_tls: v === 'existing_proxy' ? null : md(S).proxy_tls || 'lets_encrypt', proxy_kind: v === 'existing_proxy' ? null : md(S).proxy_kind || 'caddy' }); S.save(); O55.ui.refresh(); },
      tls(S, v) { O55.draft.set(md(S), { proxy_tls: v }); S.save(); O55.ui.refresh(); },
      kind(S, v) { O55.draft.set(md(S), { proxy_kind: v }); S.save(); O55.ui.refresh(); },
      next(S) { O55.ui.go('review'); }
    },
    bind: {
      headscale(S, v) { O55.draft.set(md(S), { headscale_url: v.trim() }); S.save(); O55.ui.refresh(); },
      proxy(S, v) { O55.draft.set(md(S), { proxy_hostname: v.trim() }); S.save(); O55.ui.refresh(); },
      link(S, v) { O55.draft.set(md(S), { remote_endpoint: v.trim() }); S.save(); O55.ui.refresh(); }
    }
  });

  O55.safe = { forgeName };
})();
