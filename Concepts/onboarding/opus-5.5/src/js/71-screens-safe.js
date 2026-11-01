/* Chapter 3 (continued) — Keep your work safe [source_control_setup] and Use it away from home [remote_access_setup].
   Three separate ideas on one calm page: every version saved on this computer (Safe History), an optional online copy
   (a source service such as GitHub; sign-in and account creation use the provider's official page, the online copy itself is only
   made after the reviewed commit), and an optional backup destination (recorded now, signed in after commit).
   Also the shared sign-in screen (browser handoff, device code, create account, access token) and O55.official. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const OL = (S) => (S.sess.online = S.sess.online || { purpose: 'copy' });
  /* No numeric priority: O55.sound ranks coinciding events itself. A sign-in's transport stays
     quiet in O55.flow.op (sound.done false): the sign-in sounds once, when it is really complete. */
  const SND = { signedIn: { intensity: 0.8 }, warn: { intensity: 0.4 } };
  function seeSheet(S) {
    const layer = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
    const sheet = layer && layer.querySelector('.o55-sheet[data-open="true"]');
    if (sheet) sheet.scrollIntoView({ block: 'nearest', behavior: O55.motion.reduced() ? 'auto' : 'smooth' });
    O55.sound.play('sheet');
  }
  /* a service by the name the person picked it by: GitHub Enterprise for GitHub's own server (Opus p74) */
  const forgeName = (id, variant) => (id === 'github' && variant === 'self_managed' ? T('online.service.github_enterprise') : (O55.fixtures.forge(id) || {}).name || id);
  const instanceKey = (d) => [d.forge || '', d.forge_provider_variant || '', (() => { try { const u = new URL(d.forge_instance_url || ''); return u.protocol + '//' + u.host.toLowerCase() + u.pathname.replace(/\/+$/, ''); } catch (_) { return ''; } })()].join('|');
  const RULES = () => O55.forgeRules;
  /* a concept demo's ready choices under a step that needs a real service (pm7-onb's O55.flow.hint), each taking one
     branch, failures included; nothing when the piece is not there */
  const demo = (id, items, when) => (F.hint ? F.hint(id, items.filter(Boolean), { when }) : '');
  /* the account's world on the chosen server (its owners, Projects and used names): 25-fixtures.js */
  const world = (S) => RULES().world(S.env, md(S));
  const accountFor = (S, service) => {
    const d = md(S), key = instanceKey(d);
    if (d.forge !== service) return null;
    const saved = S.sess.forgeAccounts[key]; if (saved) return saved;
    /* Built-in account fixtures represent only the default hosted product, never an arbitrary host. */
    if (needsAddress(service, d.forge_provider_variant)) return null;
    const acc = world(S).accounts;
    return acc[0] && acc[0].login || null;
  };

  /* ================================================================== sign-in (selected-source auth only) */
  /* official.signIn(S, {service, name, kind, then, done}) opens the sign-in screen for one service. `done` names a
     completion handler in O55.official.handlers (sessions store names, not functions). */
  O55.official = {
    handlers: {},
    signIn(S, o) { S.sess.signin = { service: o.service, name: o.name || o.service, kind: o.kind || 'cloud', then: o.then, done: o.done || null, state: 'idle', instance_key: o.kind === 'forge' ? instanceKey(md(S)) : o.service }; S.save(); O55.ui.go('online-signin'); },
    accountFor,
    /* kind: signin (default) | signup | guide | page. The notice says which kind of page opened, and shows the address
       only when the concept knows the real one. */
    open(S, o) {
      O55.owners.dispatch('cmd.auth_profile.open_official_page', { url: o.url || null, kind: o.kind || 'signin',
        official_route_ref: o.official_route_ref || null, typed_handoff: o.typed_handoff || null }, S.ctx(), () => ({ ok: true }));
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
  /* A toast is a moment: it leaves the window when its animation ends (or after its length, where Reduced Motion plays
     none), so it is never left in the reused window to play again when the window next opens (final check F2-2) */
  function toast(S, text) {
    const win = S.root.querySelector('.o55-win'); let el = win.querySelector('.o55-toast');
    if (!el) {
      el = document.createElement('div'); el.className = 'o55-toast'; el.setAttribute('role', 'status'); win.appendChild(el);
      el.addEventListener('animationend', (e) => { if (e.target === el) el.remove(); });
    }
    el.textContent = text; el.classList.remove('o55-toast-show'); void el.offsetWidth; el.classList.add('o55-toast-show');
    if (el.__gone) el.__gone.cancel();
    el.__gone = O55.motion.after(3400, () => el.remove());
    U.announce(text, win);
  }
  O55.ui.toast = (text) => toast(O55.S, text);
  /* a toast that is no longer true leaves at once ("Your browser opened ..." once the person says it didn't: RV-15) */
  function dropToast(S) { const el = S.root && S.root.querySelector('.o55-win .o55-toast'); if (el) { if (el.__gone) el.__gone.cancel(); el.remove(); } }
  /* (the sign-in reaches the service it was for, not whichever is chosen later: QA2 review N1) */
  O55.official.handlers.restoreCloud = (S, login) => { if (S.sess.restore) { S.sess.restore.reachedFor = 'cloud:' + ((S.sess.signin || {}).service || ''); S.sess.restore.account = login || null; } };

  const SI = (S) => S.sess.signin || {};
  /* where a sign-in opens: a source service's page, or (restore from a cloud account) the account's own page */
  function signinUrl(S, si) { return si.kind === 'forge' ? O55.official.forgeUrl(S, si.service) : (O55.fixtures.OFFICIAL.backup[si.service] || null); }
  function deviceFor(S, si) {
    if (si.kind !== 'forge') return null;
    const d = md(S), f = O55.fixtures.forge(si.service) || {};
    return f.device && !(d.forge === si.service && needsAddress(si.service, d.forge_provider_variant)) ? f.device : null;
  }
  /* how long a device code lasts: the service's own (GitLab documents 300 seconds; GitHub and Microsoft 15 minutes) */
  const CODE_TTL = { gitlab: 300000 };
  const codeTtl = (si) => CODE_TTL[si.service] || 900000;
  /* the page a sign-in finishes on when this browser did not open: the device-code page, or the sign-in page itself */
  const bare = (u) => String(u || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const full = (u) => (u && !/^https?:/.test(u) ? 'https://' + u : u || null);
  const pageUrl = (S, si) => (si.state === 'code' ? full(deviceFor(S, si)) : full(signinUrl(S, si)));
  /* Open the page (the main action) and Copy address, under the sentence that names it */
  const pageRow = (url) => (url ? `<div class="o55-inline" data-key="pagebtns">${O55.ui.btn({ label: T('ai.remote.open'), do: 'openPage', cls: 'o55-small' }, 'o55-primary')}${O55.ui.btn({ label: T('ai.remote.copy'), do: 'copyPage', cls: 'o55-small' }, 'o55-secondary')}</div>` : '');
  /* the ways a service's server lets this person sign in (O55.forgeRules: browser, device, token), the first the main one */
  const methodsOf = (S, si) => (si.kind === 'forge' ? RULES().auth(si.service, md(S).forge_provider_variant) : ['browser']);
  /* quiet: the caller's own screen change is the moment (Continue with an account that is already connected).
     method: the sign-in actually used (oauth: the service's own page; token: an access token), saved with the plan so the
     server's profile says how Puppet Master signs in there (FF-12) */
  function completeSignIn(S, login, action, quiet, method) {
    const si = SI(S);
    if (!login || (si.kind === 'forge' && si.instance_key !== instanceKey(md(S)))) return false;
    si.state = 'done'; si.account = login;
    if (si.kind === 'forge') {
      S.sess.forgeAccounts[si.instance_key] = login;
      const d = md(S);
      if (method) d.forge_auth_method = method;
      O55.draft.set(d, { forge_account_action: action, forge_account_ref: 'account:' + U.slug(si.instance_key) + ':' + U.slug(login) });
      if (method === 'token' && d.forge_instance_profile) d.forge_instance_profile.credential_ref = 'credential:' + U.slug(si.instance_key) + ':token';
      if (OL(S).purpose === 'source') O55.draft.set(d, { source_access_authorization_refs: Array.from(new Set(d.source_access_authorization_refs.concat(['auth:' + U.slug(si.instance_key) + ':' + U.slug(login)]))).slice(0, 16) });
    }
    if (si.done && O55.official.handlers[si.done]) O55.official.handlers[si.done](S, login);
    S.save(); if (!quiet && S.open && S.sess.screen === 'online-signin') O55.sound.play('success', SND.signedIn); O55.ui.refresh(); return true;
  }
  /* The person finishes in their browser; the fixture completes after a while. A newer attempt (device code, a new
     code) supersedes an older wait, so a stale wait never completes the sign-in. */
  function waitForBrowser(S, ms) {
    const si = SI(S), attempt = si.attempt || 0, identity = si.instance_key, key = 'signin:' + U.slug(identity) + ':' + attempt;
    /* (a sign-in that does not finish leaves the screen saying so, with Sign in again: online.signin.fail) */
    const fails = O55.fixtures.signinFails(S.env, si.service);
    const same = (cur) => cur.service === si.service && cur.instance_key === identity && (si.kind !== 'forge' || instanceKey(md(S)) === identity) && (cur.attempt || 0) === attempt;
    F.op(S, key, 'cmd.auth_profile.sign_in', [{ key: 'browser', ms: fails ? 2000 : ms || 2700, fail: () => (fails ? 'signin_incomplete' : null) }], { quiet: true, sound: { done: false, fail: 'warn' }, onDone: () => {
      const cur = SI(S);
      if (same(cur) && ['waiting', 'code'].includes(cur.state)) { cur.recovered = !!cur.failed; cur.failed = false; completeSignIn(S, si.kind === 'forge' ? world(S).login || 'jared-p' : 'jared@example.com', 'sign_in_during_setup', false, 'oauth'); }
    }, onFail: () => {
      const cur = SI(S);
      if (same(cur) && ['waiting', 'code'].includes(cur.state)) { cur.state = 'failed'; cur.failed = true; S.save(); O55.ui.refresh(); }
    } });
  }
  def('online-signin', {
    seed: (S) => seedOnline(S, false),
    chapter: 'project', stage: 'source_control_setup',
    scene: (S) => ({ id: 'online', beat: SI(S).state === 'done' ? 'signed' : 'signin' }),
    eyebrow: (S) => (SI(S).kind !== 'forge' ? T('safe.eyebrow') : OL(S).purpose === 'source' ? T('begin.eyebrow') : T('online.signin.eyebrow')),
    title: (S) => T('online.signin.title', { name: SI(S).name }),
    /* true for every service and way in (Astra FA-11 / RV-20: "only asks for access to the Project you choose" was not
       true of the tokens it then asked for); what a token reaches is said in its form, before it is pasted */
    lead: (S) => { const si = SI(S); return T(si.kind !== 'forge' ? 'online.signin.leadCloud' : methodsOf(S, si)[0] === 'token' ? 'online.signin.leadToken' : 'online.signin.lead', { name: si.name }); },
    body(S) {
      const si = SI(S), env = si.kind === 'forge' ? world(S) : { accounts: [], signup: true }, methods = methodsOf(S, si);
      /* a server with no sign-in app for Puppet Master (another Forgejo or Gitea server) signs in with an access token */
      const state = si.state === 'idle' && methods[0] === 'token' ? 'token' : si.state;
      let out = '';
      if (si.state === 'done') return `<div class="o55-banner" data-key="done">${C.done(18)}<span>${U.esc(T('online.signin.signedIn', { account: si.account }))}</span></div>`;
      const known = si.kind === 'forge' ? accountFor(S, si.service) : null;
      if (si.state === 'idle' && known && !si.another) {
        out += C.cards('useKnown', [{ v: known, glyph: 'person', title: T('online.signin.connected', { account: known }), sub: T('online.signin.connectedSub') }], known, {});
        out += `<div class="o55-sublinks" data-key="another">${C.link(T('online.signin.another'), 'another')}</div>`;
        return out;
      }
      if (si.state === 'failed') {
        out += `<div class="o55-banner o55-banner-warn" data-key="signin-fail">${C.mark('failed', 18, C.small('spark', 18))}<span><b>${U.esc(T('online.signin.fail.title'))}</b> ${U.esc(T('online.signin.fail.body', { name: si.name }))}</span></div>`
          + `<div class="o55-actions" data-key="acts">${O55.ui.btn({ label: T('online.signin.fail.retry'), do: 'signIn', tip: 'signIn' }, 'o55-primary')}</div>`;
      }
      if (state === 'idle') {
        out += `<div class="o55-actions" data-key="acts">${O55.ui.btn({ label: T('online.signin.signIn'), do: 'signIn' }, 'o55-primary')}`
          + (env.signup === false ? '' : O55.ui.btn({ label: T('online.signin.create'), do: 'create' }, 'o55-secondary')) + '</div>';
        if (env.signup === false) out += C.note(T('online.signin.admin'), 'info', 'person');
        if (methods.includes('token')) out += `<div class="o55-sublinks" data-key="tok">${C.link(T('online.signin.token'), 'tokenOn')}</div>`;
      }
      if (state === 'token') {
        /* where to make the token on that server and what it must be allowed to do, for this purpose (FF-12) */
        const ts = F.state(S, 'token:' + si.service), d = md(S), host = (() => { try { return new URL(d.forge_instance_url).host; } catch (_) { return si.name; } })();
        const purpose = OL(S).purpose === 'source' ? 'existing' : 'new';
        if (methods[0] === 'token') out += `<p class="o55-hint" data-key="toklead">${U.esc(T('online.signin.tokenLead', { host }))}</p>`;
        /* what a token made this way can reach, said before it is pasted (RV-20), in the service's own terms */
        out += C.note(O55.talk.t('online.signin.scopes.' + si.service + '.reach' + (purpose === 'new' ? 'New' : 'Existing'), { host }), 'info', 'lock');
        /* how to make it stays in sight under a refusal (Opus p74: the refusal replaced it) */
        const how = T('online.signin.tokenHow.' + si.service, { host }) + ' ' + O55.talk.t('online.signin.scopes.' + si.service + '.detail' + (purpose === 'new' ? 'New' : 'Existing')), bad = ts && ts.state === 'failed';
        out += C.field({ bind: 'token', type: 'password', protected: true, typed: !!si.tokenTyped, label: T('online.signin.tokenLabel'), value: '', hint: bad ? '' : how, error: bad ? T('online.signin.tokenBad') : '', invalid: !!bad });
        if (bad) out += `<p class="o55-hint" data-key="tokhow">${U.esc(how)}</p>`;
        out += `<div class="o55-inline" data-key="tokbtn">${O55.ui.btn({ label: T('online.signin.tokenCheck'), do: 'tokenCheck', cls: 'o55-small', disabled: !si.tokenTyped, reason: T('online.signin.tokenLabel') }, 'o55-secondary')}</div>`;
        out += demo('online-signin:token', [{ label: T('online.signin.demo.good'), outcome: 'works', fills: [['token', 'pm-demo-token-7f3a9c41']], act: ['tokenCheck'] }, { label: T('online.signin.demo.bad'), outcome: 'refused', fills: [['token', 'abc']], act: ['tokenCheck'] }], !(ts && ts.state === 'running'));
        if (methods[0] === 'token' && si.state === 'idle') {
          if (env.signup !== false) out += `<div class="o55-sublinks" data-key="tokcreate">${C.link(T('online.signin.createOn', { host }), 'create')}</div>`;
          else out += C.note(T('online.signin.admin'), 'info', 'person');
        }
        /* a service with a browser sign-in: the way back to it (Opus p74: none from the token field) */
        if (methods[0] !== 'token') out += `<div class="o55-sublinks" data-key="tokoff">${C.link(T('online.signin.browserInstead', { name: si.name }), 'tokenOff')}</div>`;
      }
      if (si.state === 'waiting' || si.state === 'code') {
        /* "Your browser opened ..." only while it did: never under a code or the page's address (Opus RV-15) */
        const away = si.state === 'code' || si.remote === 'link';
        out += `<div class="o55-row o55-row-wait" data-key="wait" aria-busy="true">${C.loader(16)}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('online.signin.waiting'))}</span>${away ? '' : `<span class="o55-rowmeta">${U.esc(T('official.signin', { name: si.name }))}</span>`}</span></div>`;
        /* Browser didn't open? A device code where the service has a device sign-in; otherwise its sign-in page, named
           with Open the page and Copy address, as an AI account's (prov's RV-1 panel), never a silent copy and a toast */
        if (si.state === 'waiting' && !away) out += `<div class="o55-sublinks" data-key="nob">${C.link(T('online.signin.noBrowser'), deviceFor(S, si) ? 'code' : 'showLink')}</div>`;
        else if (si.state === 'waiting') {
          const url = signinUrl(S, si);
          out += `<div class="o55-devicecode" data-key="dl"><span class="o55-hint">${U.esc(url ? T('online.signin.linkLead', { url: bare(url) }) : T('online.signin.linkNone'))}</span>${pageRow(url)}</div>`;
        } else {
          const t = F.countdown(si.codeUntil || Date.now()), url = deviceFor(S, si);
          out += `<div class="o55-devicecode" data-key="dc"><span class="o55-hint">${U.esc(T('online.signin.codeLead', { url }))}</span><span class="o55-paircode">${U.esc(si.code || 'WDJB-MJHT')}</span>`
            + `<span class="o55-hint">${U.esc(t.left ? T('chrome.expiresIn', { m: t.m, s: t.s }) : T('connect.pair.expired'))}</span>`
            + `<span class="o55-pairbtns">${F.copyBtn(si.code || 'WDJB-MJHT', 'dcode')}${O55.ui.btn({ label: T('chrome.newCode'), do: 'newCode', cls: 'o55-small', note: false }, 'o55-secondary')}</span>${pageRow(full(url))}</div>`
            + F.copyNote('dcode') + O55.tips.explainer('newCode');
        }
      }
      if (si.state === 'create') {
        out += `<div class="o55-banner" data-key="external-signup">${C.small('globe', 18)}<span>${U.esc(T('online.signin.createLead', { name: si.name }))}</span></div>`
          + `<div class="o55-actions" data-key="return-signin">${O55.ui.btn({ label: T('online.signin.createBack'), do: 'signupBack' }, 'o55-primary')}</div>`;
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
      signIn(S) { const si = SI(S); si.state = 'waiting'; si.remote = null; si.attempt = (si.attempt || 0) + 1; S.save(); O55.official.open(S, { name: si.name, url: signinUrl(S, si) }); O55.ui.refresh(); O55.sound.play('tap'); waitForBrowser(S); },
      /* the page stays in sight with its address; a new wait for it, as a device code's (RV-15) */
      showLink(S) { const si = SI(S); dropToast(S); si.remote = 'link'; si.attempt = (si.attempt || 0) + 1; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); waitForBrowser(S, 7000); },
      openPage(S) { const si = SI(S), url = pageUrl(S, si); if (url) O55.official.open(S, { name: si.name, url }); },
      copyPage(S) { const si = SI(S), url = pageUrl(S, si); if (!url) return; U.copyText(url); O55.sound.play('copy'); O55.ui.toast(T('ai.remote.copied', { url: bare(url) })); },
      code(S) { const si = SI(S); dropToast(S); si.state = 'code'; si.remote = null; si.code = 'WDJB-MJHT'; si.codeUntil = Date.now() + codeTtl(si); si.attempt = (si.attempt || 0) + 1; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); F.ticker(S, 'online-signin', 1000, () => SI(S).state !== 'code'); waitForBrowser(S, 7000); },
      newCode(S) { const si = SI(S); si.code = ['WDJB', 'K3PX', 'R7QM', 'T2LN'][Math.floor(Math.random() * 4)] + '-' + ['MJHT', 'V9CZ', 'H4WE', 'B8KD'][Math.floor(Math.random() * 4)]; si.codeUntil = Date.now() + codeTtl(si); si.attempt = (si.attempt || 0) + 1; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); waitForBrowser(S, 7000); },
      create(S) { const si = SI(S); si.state = 'create'; S.save(); O55.official.open(S, { kind: 'signup', name: si.name, url: si.kind === 'forge' ? O55.official.forgeUrl(S, si.service, 'signup') : null }); O55.ui.refresh(); },
      signupBack(S) { const si = SI(S); si.state = 'idle'; si.another = true; S.save(); O55.ui.refresh(); },
      tokenOn(S) { SI(S).state = 'token'; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); },
      tokenOff(S) { const si = SI(S); si.state = 'idle'; si.tokenTyped = false; F.reset(S, 'token:' + si.service); S.save(); O55.ui.refresh(); },
      tokenCheck(S) {
        const si = SI(S), i = S.root.querySelector('#o55f-token'), v = i ? i.value.trim() : ''; if (i) i.value = '';
        si.tokenTyped = false; si.attempt = (si.attempt || 0) + 1; F.reset(S, 'token:' + si.service);
        const mine = { service: si.service, instance_key: si.instance_key, attempt: si.attempt };
        F.op(S, 'token:' + si.service, 'cmd.auth_profile.sign_in', [{ key: 'verify', ms: 800, fail: () => (v.length >= 8 ? null : 'token_rejected') }], {
          sound: { done: false, fail: 'warn' }, /* a refused token is a soft warning under its field; done sounds in completeSignIn */
          /* A late check belongs to the sign-in it was typed for (pm7-srv's sweep): after Back and another service's
             sign-in, or a new attempt, it signs nothing in. The token itself went to the keychain owner; the plan's profile
             says pat_ref (normalize) with the credential's reference. */
          onDone: () => {
            const cur = SI(S);
            if (cur.service !== mine.service || cur.instance_key !== mine.instance_key || (cur.attempt || 0) !== mine.attempt || instanceKey(md(S)) !== mine.instance_key || cur.state === 'done') return;
            completeSignIn(S, world(S).login || 'jared', 'sign_in_during_setup', false, 'token');
          }
        });
      },
      next(S) {
        const si = SI(S);
        if (si.state !== 'done' && si.kind === 'forge') { const k = accountFor(S, si.service); if (!completeSignIn(S, k, 'already_connected', true)) return; }
        if (si.state !== 'done') return;
        O55.ui.go(si.then || 'safe');
      }
    },
    bind: {
      token(S, v) { const had = !!SI(S).tokenTyped; SI(S).tokenTyped = v.length > 0; if (had !== SI(S).tokenTyped) { S.save(); O55.ui.refresh(); } }
    },
    skipOnBack: (S) => SI(S).state === 'done'
  });

  /* (Opus R6, Sol re-audit) a session saved before Jared's 2026-11-01 removals is resumed through the same rule as a plan:
     each draft is normalized (a retired service or kind invalidates its service, address, account, Project, credentials,
     authorization refs and Review), and for the main plan the old choice is not preselected, its sign-in is over, the
     accounts recorded for retired servers go, an unfinished commit starts again from Review, and a screen of the old
     service's own steps gives way to choosing the service */
  O55.onOpen = (O55.onOpen || []).concat([(S) => {
    const drafts = (S.sess && S.sess.drafts) || {};
    Object.keys(drafts).forEach((k) => { if (drafts[k] && typeof drafts[k] === 'object') O55.draft.normalize(drafts[k]); });
    const d = drafts.main; if (!d || !d.forge_retired) return;
    const ol = OL(S); ol.forge = null; ol.variant = null;
    if (S.sess.signin && S.sess.signin.kind === 'forge') S.sess.signin = {};
    Object.keys(S.sess.forgeAccounts || {}).forEach((key) => { const [f, v] = key.split('|'); if (!O55.draft.offered(f, v)) delete S.sess.forgeAccounts[key]; });
    if (S.sess.commit && !['running', 'done'].includes(S.sess.commit.state)) S.sess.commit = { state: 'none' };
    if (['online-signin', 'online-details', 'ex-repos'].includes(S.sess.screen)) S.sess.screen = 'online-service';
    else if (S.sess.screen === 'creating' && S.sess.commit.state === 'none') S.sess.screen = 'review';
    S.save();
  }]);

  /* ================================================================== which service */
  const VARIANTS = {
    github: [['hosted', 'GitHub.com'], ['self_managed', null]], gitlab: [['hosted', 'GitLab.com'], ['self_managed', 'otherServer']],
    azure_devops: [['cloud', 'azureServices'], ['self_managed', 'azureServer']], bitbucket_cloud: [['cloud', 'bbCloud']], bitbucket_data_center: [['data_center', 'bbDc']],
    /* (Forgejo and Gitea are only ever a server of their own: no hosted choice, so no kind to pick, just its address) */
    forgejo: [['forgejo_self_managed', 'otherServer']], gitea: [['gitea_self_managed', 'otherServer']]
  };
  /* a server the person names: a self-managed one or Data Center (FF-08: never an example) */
  const needsAddress = (forge, variant) => O55.fixtures.needsAddress(forge, variant);
  /* The service, variant and address this screen shows, its Continue checks and next() uses: one reading, so the button is
     never enabled for a choice next() reads differently (GLM review: an untouched variant that needed an address
     next() read and foot() didn't). Unset, it is the plan's own service, variant and address (a Review Fix, a resumed
     run), else GitHub; an untouched variant is the service's first. */
  function serviceChoice(S) {
    const d = md(S), ol = OL(S);
    const planned = d.forge && d.forge !== 'none' ? (d.forge === 'github' && d.forge_provider_variant === 'self_managed' ? 'github_enterprise' : d.forge === 'bitbucket_data_center' ? 'bitbucket_cloud' : d.forge) : null;
    /* (R6) after a retired service the person chooses again: nothing is picked for them */
    const sel = ol.forge || planned || (d.forge_retired ? null : 'github'), same = !!planned && sel === planned;
    if (!sel) return { sel: null, forge: null, variant: null, key: '', typed: null, asks: false, address: '', url: '', ok: false, words: { hint: '', error: '', reason: T('missing.service') } };
    let variant = sel === 'github_enterprise' ? 'self_managed' : ol.variant || (same ? (d.forge === 'bitbucket_data_center' ? 'data_center' : d.forge_provider_variant) : null);
    const forge = sel === 'github_enterprise' ? 'github' : sel === 'bitbucket_cloud' && variant === 'data_center' ? 'bitbucket_data_center' : sel;
    if (!variant || (sel !== 'bitbucket_cloud' && !(VARIANTS[forge] || []).some(([v]) => v === variant))) variant = sel === 'bitbucket_cloud' ? 'cloud' : (VARIANTS[forge] || [['hosted']])[0][0];
    /* an address belongs to the server it was typed for: one per service and variant, never carried to another */
    const key = sel + '|' + variant, typed = (ol.addresses || {})[key];
    const raw = typed != null ? typed : same && d.forge_instance_url && needsAddress(forge, variant) ? d.forge_instance_url : '';
    const address = String(raw || '').trim(), asks = needsAddress(forge, variant);
    /* the address check every server address uses (O55.endpoint): a refused one says why, under the field and on
       Continue, and a bare host name gets https:// with the field saying so (Opus RV-16: http:// refused with no reason) */
    const example = T('online.service.addressHint');
    const res = asks ? O55.endpoint.check(address) : null, words = asks ? O55.endpoint.hint(res, res && res.empty ? example : '') : { hint: '', error: '' };
    /* (Continue's reason: what is wrong, or that the address is missing, never the example: Opus MAJOR 11) */
    words.reason = words.error || (asks && res && res.empty ? T('missing.instance') : example);
    return { sel, forge, variant, key, typed, asks, address, url: res && res.ok ? res.url : '', ok: !asks || res.ok, words };
  }
  /* a field and the line under it brought into sight: a server's address when a choice brings it (it can sit below the
     fold: MAJOR 11); a refused branch name with its rule, in the middle, clear of Continue's note (Opus p43) */
  /* (only as far as needed, at once: a smooth scroll is cancelled by the next keystroke; room keeps the field and its
     line clear of the note a refused Continue shows above the foot) */
  const showField = (S, id, room) => O55.motion.after(80, () => {
    const i = S.open && S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out) #' + id), f = i && i.closest('.o55-field'), sc = f && f.closest('.o55-scroll');
    if (!sc) return;
    const fr = f.getBoundingClientRect(), cr = sc.getBoundingClientRect(), gap = room == null ? 80 : room;
    let dy = fr.bottom > cr.bottom - gap ? fr.bottom - (cr.bottom - gap) : 0;
    if (fr.top - dy < cr.top + 8) dy = fr.top - cr.top - 8;
    if (dy > 0) sc.scrollBy({ top: dy, behavior: 'auto' });
  });
  const showAddress = (S) => showField(S, 'o55f-address', 16);
  def('online-service', {
    chapter: 'project', stage: 'source_control_setup', charmSlot: 'online',
    scene: () => ({ id: 'online', beat: 'service' }),
    eyebrow: (S) => (OL(S).purpose === 'source' ? T('begin.eyebrow') : T('online.service.eyebrow')),
    title: (S) => (OL(S).purpose === 'source' ? T('online.service.titleSource') : T('online.service.title')),
    lead: () => T('online.service.lead'),
    body(S) {
      const ol = OL(S), c = serviceChoice(S), sel = c.sel, forge = c.forge, variant = c.variant;
      let out = md(S).forge_retired && !sel ? C.note(T('online.service.retired'), 'info', 'cloud') : '';
      out += C.cards('pick', [{ v: 'github', glyph: 'cloud', title: T('online.service.github.title'), sub: T('online.service.github.sub'), tag: T('chrome.recommended') }], sel, { label: T('online.service.title') });
      /* a service's own questions (which kind of it, its address) sit under its card (QA round 2, Q7) */
      let under = '';
      if (sel !== 'github' && sel !== 'github_enterprise') {
        const vs = sel === 'bitbucket_cloud' ? [['cloud', 'bbCloud'], ['data_center', 'bbDc']] : VARIANTS[forge] || [];
        if (vs.length > 1) under += C.segmented({ do: 'variant', value: variant, label: T('online.service.others'), options: vs.map(([v, k]) => ({ v, label: k && k.includes('.') ? k : k ? T('online.service.' + k) : T('online.service.selfManaged') })) });
      }
      if (c.asks) {
        under += C.field({ bind: 'address', label: T('online.service.addressLabel'), value: c.typed != null ? c.typed : c.address, placeholder: 'https://git.example.com', hint: c.words.hint, error: c.words.error, invalid: !!c.words.error, valid: c.ok });
        const good = 'https://git.platyr.test';
        under += demo('online-service:address', [{ label: good, outcome: 'works', fills: [['address', good]] }, { label: 'http://git.platyr.test', outcome: 'wrong', fills: [['address', 'http://git.platyr.test']] }], !c.ok);
      }
      const others = ['gitlab', 'azure_devops', 'bitbucket_cloud', 'forgejo', 'gitea', 'github_enterprise'].map((id) => ({ v: id, glyph: 'cloud', title: T('online.service.' + id), quiet: true, under: id === sel ? under : '' }));
      out += F.more(ol.others || sel !== 'github', T('online.service.others'), 'others', C.cards('pick', others, sel, { cls: 'o55-choices-quiet' }), 'others');
      return out;
    },
    foot(S) {
      const ol = OL(S), c = serviceChoice(S);
      const sec = ol.purpose === 'copy' ? [{ label: T('safe.notNow'), do: 'notNow', cls: 'o55-ghost' }] : [];
      return { secondary: sec, primary: { label: T('chrome.continue'), do: 'next', disabled: !c.ok, reason: c.words.reason } };
    },
    do: {
      pick(S, v, el) { const ol = OL(S); ol.forge = v; ol.variant = null; S.save(); O55.ui.refresh(); O55.ui.charm(el, T('online.service.' + (v === 'github' ? 'github.title' : v)), 'cloud'); showAddress(S); },
      others(S) { OL(S).others = !OL(S).others; S.save(); O55.ui.refresh(); },
      variant(S, v) { OL(S).variant = v; S.save(); O55.ui.refresh(); showAddress(S); },
      notNow(S) { O55.draft.set(md(S), { online_mode: 'none' }); S.save(); O55.ui.go('safe', { dir: 'back' }); },
      next(S) {
        const ol = OL(S), d = md(S), c = serviceChoice(S), forge = c.forge, variant = c.variant;
        if (!c.ok) return; /* (refused with its reason, as the button shows) */
        const url = c.asks ? c.url : '', mode = ol.purpose === 'source' ? 'existing' : 'new';
        const patch = { online_mode: mode, forge, forge_provider_variant: variant, forge_instance_url: url };
        /* another service, server or use: its sign-in, chosen Project, owner, project, visibility and sign-in method go
           with the old one, together (FF-11: an organization's Internal carried into Gitea; FF-12: a Forgejo token carried
           into another server); Back and Continue with the same one keeps them (Opus p74: the chosen Project was cleared) */
        if (d.online_mode !== mode || d.forge !== forge || d.forge_provider_variant !== variant || (url && d.forge_instance_url !== url)) {
          Object.assign(patch, { forge_instance_profile: null, forge_account_action: null, forge_account_ref: '', repository_ref: '', source_access_authorization_refs: [],
            repository_owner_scope: 'personal', repository_container: '', repository_project: '', repository_visibility: null });
          d.forge_auth_method = null; S.sess.azureProjects = null;
        }
        O55.draft.set(d, patch);
        S.save();
        O55.official.signIn(S, { service: forge, name: forgeName(forge, variant), kind: 'forge', then: ol.purpose === 'source' ? 'ex-repos' : 'online-details' });
      }
    },
    bind: { address(S, v) { const ol = OL(S), k = serviceChoice(S).key; ol.addresses = Object.assign({}, ol.addresses, { [k]: v }); S.save(); O55.ui.refresh(); } }
  });

  /* Opened straight at a later online screen (Demo Studio's Open at one screen): what the earlier screens would have
     left, GitHub chosen, and signed in for the screens after its sign-in (QA2 hunter H1: "Sign in to {name}", "Name on
     none", "From on none"). The repository picker brings existing work in; the others make a new online copy. */
  function seedOnline(S, signedIn, purpose) {
    const d = md(S), ol = OL(S);
    if (purpose) ol.purpose = purpose;
    if (!d.forge || d.forge === 'none') {
      ol.forge = 'github';
      O55.draft.set(d, { online_mode: ol.purpose === 'source' ? 'existing' : 'new', forge: 'github', forge_provider_variant: VARIANTS.github[0][0], forge_instance_url: '', forge_instance_profile: null });
      if (ol.purpose === 'source') O55.draft.set(d, { project_mode: 'existing_online', source_more: true });
    }
    const si = SI(S);
    if (si.kind !== 'forge' || si.service !== d.forge) S.sess.signin = { service: d.forge, name: forgeName(d.forge, d.forge_provider_variant), kind: 'forge', then: ol.purpose === 'source' ? 'ex-repos' : 'online-details', done: null, state: 'idle', instance_key: instanceKey(d) };
    if (signedIn && SI(S).state !== 'done') {
      const cur = SI(S), login = accountFor(S, d.forge) || 'jared-p';
      cur.state = 'done'; cur.account = login; S.sess.forgeAccounts[cur.instance_key] = login;
      O55.draft.set(d, { forge_account_action: 'sign_in_during_setup', forge_account_ref: 'account:' + U.slug(cur.instance_key) + ':' + U.slug(login) });
      if (ol.purpose === 'source') O55.draft.set(d, { source_access_authorization_refs: Array.from(new Set(d.source_access_authorization_refs.concat(['auth:' + U.slug(cur.instance_key) + ':' + U.slug(login)]))).slice(0, 16) });
    }
    S.save();
  }

  /* ================================================================== name, owner, privacy, advanced (a new online copy) */
  /* Every field comes from the service's row (O55.forgeRules, 25-fixtures.js) and the account's world: where the copy
     lives, in the service's own words (an organization, group, workspace, collection or Data Center project, and the
     person's own account only where the service has one), the project inside it where the service has those (Azure
     DevOps' team project, Bitbucket's project) under the choice it belongs to, the visibility valid there, and the
     service's own name rule. A choice another depends on settles that one at once (FF-02 to FF-06, FF-11). */
  /* a name already used in that place: the service's own taken names, a Project the account already has there, or a
     name the service refused there when the copy was made (Opus RV-12: a refused name came back "Available") */
  const placeOf = (d) => instanceKey(d) + '|' + (d.repository_container || '');
  function nameTaken(S, name, d) {
    d = d || md(S);
    const w = RULES().world(S.env, d), n = String(name || '').trim().toLowerCase(), at = d.repository_container || '';
    return !!n && (w.taken.includes(n) || w.repos.some((r) => r.name.toLowerCase() === n && (r.container || '') === at) || ((S.sess.refusedNames || {})[placeOf(d)] || []).includes(n));
  }
  /* the service said the name is used: kept with the session for that server and place, so details and Review say so */
  function refuseName(S, d) {
    const n = String(d.repository_name || '').trim().toLowerCase(), m = (S.sess.refusedNames = S.sess.refusedNames || {}), k = placeOf(d);
    if (n && !(m[k] || []).includes(n)) m[k] = (m[k] || []).concat([n]);
  }
  const takenExample = (S) => { const w = world(S), at = md(S).repository_container || ''; const r = w.repos.find((x) => (x.container || '') === at); return r ? r.name : w.taken[0] || null; };
  const hostOf = (d) => { try { return new URL(d.forge_instance_url).host; } catch (_) { return ''; } };
  const azureGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  function azureProjects(S) {
    const d = md(S), feed = S.sess.azureProjects;
    return feed && feed.instance_key === instanceKey(d) && feed.container === d.repository_container &&
      feed.account_ref === d.forge_account_ref && !!feed.account_ref && feed.fresh === true ? feed.rows : [];
  }
  /* the account's team projects in the chosen organization or collection, listed read-only (FGI-011's account listing) */
  function listAzure(S, quiet) {
    const d = md(S);
    if (!d.forge_account_ref || !accountFor(S, 'azure_devops')) { if (!quiet) O55.ui.toast(T('online.details.azure.signinFirst')); return; }
    S.sess.azureProjects = { instance_key: instanceKey(d), container: d.repository_container, account_ref: d.forge_account_ref,
      fresh: true, rows: (world(S).projects || []).filter((p) => p && typeof p === 'object' && azureGuid.test(p.id || '') && p.kind === 'Git' && p.container === d.repository_container).map((p) => ({ id: p.id, name: p.name, kind: p.kind })) };
    if (!azureProjects(S).some((p) => p.id === d.repository_project)) O55.draft.set(d, { repository_project: '' });
    S.save();
  }
  function azureProjectRoute(S) {
    const d = md(S), container = d.repository_container;
    if (!container || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/.test(container) || !d.forge_account_ref || !accountFor(S, 'azure_devops')) return null;
    if (d.forge_provider_variant !== 'cloud') return null; /* Server host/collection needs owner verification; never invent it. */
    return { url: 'https://dev.azure.com/' + encodeURIComponent(container) + '/_projects',
      official_route_ref: 'azure-devops-services:' + container + ':team-projects',
      typed_handoff: { provider: 'azure_devops', product: 'services', organization: container,
        instance_key: instanceKey(d), operation: 'human_create_team_project', owner_verified: true } };
  }
  /* the name's problem in the service's own words ('' when it is fine) */
  function nameError(d) {
    const p = RULES().nameProblem(d), svc = forgeName(d.forge, d.forge_provider_variant);
    if (!p || p === 'empty') return '';
    return p === 'reserved' ? T('online.details.nameReserved', { name: svc }) : T('online.details.nameRule.' + d.forge, { name: svc });
  }
  const branchError = (d) => (RULES().branchProblem(d.repository_default_branch) ? T('online.details.branchRule') : '');
  /* a visibility in the service's own terms (online.details.vis.<service>.<v>), else the common words */
  function visCopy(d, v, o) {
    const k = 'online.details.vis.' + d.forge + '.' + v, vars = { org: (o && o.name) || '', host: hostOf(d) };
    /* (Data Center: a personal project is the person's own; before a project is chosen there is no {org} to name: p74) */
    if (d.forge === 'bitbucket_data_center' && v === 'private' && !(o && o.id && o.scope !== 'personal')) return o && o.id ? { title: T('online.details.private'), sub: T('online.details.privateSub') } : { title: T('online.details.privateDcNone'), sub: T('online.details.vis.bitbucket_data_center.private.sub') };
    if (O55.tx(k + '.title')) return { title: O55.t(k + '.title', vars), sub: O55.t(k + '.sub', vars) };
    /* a server of its own: Everyone is whoever can open it, not the whole internet (Opus p74) */
    if (v === 'public' && needsAddress(d.forge, d.forge_provider_variant) && vars.host) return { title: T('online.details.public'), sub: T('online.details.publicServerSub', vars) };
    /* a private copy an organization, group, workspace or team owns is seen by those of its members who can see its
       private Projects, never "only you" (Opus RV-14) */
    if (v === 'private' && o && o.id && o.scope !== 'personal') return { title: T('online.details.privateOrg', vars), sub: T('online.details.privateOrgSub') };
    return { title: v === 'internal' ? T('online.details.internal', vars) : T('online.details.' + v), sub: v === 'internal' ? T('online.details.internalSub') : T('online.details.' + v + 'Sub') };
  }
  /* why fewer visibilities are offered here, when the owner or project narrows them */
  function visCap(S, d, o, p, vis) {
    if (!o) return '';
    if (d.forge === 'gitlab' && o.visibility && o.visibility !== 'public') return T('online.details.cap.gitlab' + (o.visibility === 'internal' ? 'Internal' : ''), { org: o.name });
    if (d.forge === 'bitbucket_cloud' && p && p.private) return T('online.details.cap.bitbucket', { project: p.name });
    if ((d.forge === 'forgejo' || d.forge === 'gitea') && o.profile && o.profile !== 'public' && vis.includes('public')) return T('online.details.cap.profile' + (o.profile === 'limited' ? 'Limited' : 'Private'), { org: o.name, host: hostOf(d) });
    return '';
  }
  const ownerArg = (d) => (d.repository_container ? 'org:' + d.repository_container : 'personal');
  function detailDefaults(S) {
    const d = md(S), row = RULES().row(d.forge) || {}, w = world(S), patch = {};
    if (!d.repository_name) patch.repository_name = U.slug(d.project_name) || 'new-project';
    if (!row.personal && !d.repository_container && w.owners.length === 1) Object.assign(patch, { repository_container: w.owners[0].id, repository_owner_scope: w.owners[0].scope || 'organization' });
    if (Object.keys(patch).length) O55.draft.set(d, patch);
    const o = RULES().ownerOf(S.env, d);
    if (row.project === 'bbProject' && o && o.projects && o.projects.length === 1 && !d.repository_project) { O55.draft.set(d, { repository_project: o.projects[0].key }); patch.p = 1; }
    let listed = false;
    if (d.forge === 'azure_devops' && d.repository_container && !azureProjects(S).length && d.forge_account_ref) { listAzure(S, true); listed = true; }
    if (Object.keys(patch).length) S.save();
    return Object.keys(patch).length > 0 || listed;
  }
  def('online-details', {
    seed: (S) => seedOnline(S, true),
    chapter: 'project', stage: 'source_control_setup',
    scene: () => ({ id: 'online', beat: 'signed' }),
    eyebrow: () => T('online.details.eyebrow'),
    title: (S) => T('online.details.title', { name: forgeName(md(S).forge, md(S).forge_provider_variant) }),
    lead: (S) => T('online.details.lead', { name: forgeName(md(S).forge, md(S).forge_provider_variant) }),
    body(S) {
      const d = md(S), svc = forgeName(d.forge, d.forge_provider_variant), w = world(S), row = RULES().row(d.forge) || {}, account = accountFor(S, d.forge) || w.login || '';
      const o = RULES().ownerOf(S.env, d), p = RULES().projectOf(S.env, d), noun = RULES().ownerNoun(d);
      /* 1. the name, checked by the service's own rule; how the service spells it and its web address, when they differ */
      const err = nameError(d), taken = !err && nameTaken(S, d.repository_name), typed = S.sess.ui.repoTyped;
      const spelled = typed != null && typed.trim() && typed.trim() !== d.repository_name ? T('online.details.spelled', { name: d.repository_name }) : '';
      const slug = row.slug && d.repository_name && !err && RULES().slug(d) !== d.repository_name ? T('online.details.slug', { slug: RULES().slug(d) }) : '';
      const ok = !err && !taken && F.nonEmpty(d.repository_name);
      const path = (o && o.id ? o.id + (d.forge === 'azure_devops' && p ? ' / ' + p.name : '') : account) + ' / ';
      let out = C.field({ bind: 'repo', label: T('online.details.nameLabel', { name: svc }), value: d.repository_name, prefix: path,
        hint: [spelled || slug, ok ? T('online.details.available') : ''].filter(Boolean).join(' · '), valid: ok,
        error: err || (taken ? T('online.details.taken', { owner: (o && o.id) || account }) : ''), invalid: !!err || taken });
      const tk = takenExample(S), fine = U.slug(d.project_name) || 'book-club-site';
      out += demo('online-details:name', [tk && { label: tk, outcome: 'taken', fills: [['repo', tk]] }, { label: 'bad/name?', outcome: 'wrong', fills: [['repo', 'bad/name?']] }, { label: fine, outcome: 'works', fills: [['repo', fine]] }], true);
      /* 2. where it lives: the person's own account where the service has one, and the places the account belongs to;
         the project inside the chosen one sits under its card (QA round 2, Q7) */
      let under = '';
      if (d.forge === 'azure_devops') {
        const projects = azureProjects(S), route = azureProjectRoute(S);
        under = C.group(T('online.details.project'), C.cards('azProject', projects.map((x) => ({ v: x.id, glyph: 'stack', title: x.name, sub: T('online.details.azure.gitSub'), quiet: true })), d.repository_project, { cls: 'o55-choices-quiet' }))
          + `<div class="o55-actions" data-key="azure-refresh">${O55.ui.btn({ label: T('online.details.azure.refresh'), do: 'azRefresh', note: false }, 'o55-secondary')}</div>${O55.tips.explainer('azRefresh')}`
          + F.more(!!S.sess.ui.azureTeamProjectAdvanced, T('online.details.azure.advanced'), 'azAdvanced',
            (route ? O55.ui.btn({ label: T('online.details.azure.create'), do: 'azCreateTeamProject', note: false }, 'o55-secondary')
              .replace('data-o55-do="azCreateTeamProject"', 'data-o55-do="azCreateTeamProject" data-ui-action-id="ui.onboarding.open_owner_flow" data-command-id="cmd.auth_profile.open_official_page"')
              + O55.tips.explainer('azCreateTeamProject')
              : C.note(T('online.details.azure.routeMissing'), 'info'))
            + C.note(T('online.details.azure.createNote'), 'info'), 'azAdvanced');
      }
      if (row.project === 'bbProject' && o && o.projects) under = C.group(T('online.details.bbProject'), C.cards('bbProject', o.projects.map((x) => ({ v: x.key, glyph: x.private ? 'lock' : 'stack', title: x.name, sub: T(x.private ? 'online.details.bb.private' : 'online.details.bb.public', { key: x.key }), quiet: true })), d.repository_project, { cls: 'o55-choices-quiet' }));
      const cards = (row.personal ? [{ v: 'personal', glyph: 'person', title: T('online.details.personal', { account }) }] : [])
        .concat(w.owners.map((x) => ({ v: 'org:' + x.id, glyph: x.scope === 'personal' ? 'person' : 'stack', title: x.name, sub: T('online.details.kind.' + (x.kind || (x.scope === 'personal' ? 'personal' : noun))) + (x.profile && x.profile !== 'public' ? ' · ' + T('online.details.kind.profile.' + x.profile) : ''), quiet: true })))
        .map((c) => (c.v === ownerArg(d) ? Object.assign(c, { under }) : c));
      if (cards.length > 1 || !row.personal) out += C.group(T('online.details.ownerOf.' + noun), C.cards('owner', cards, o && (o.id || row.personal) ? ownerArg(d) : null, { cls: 'o55-choices-quiet' }));
      /* 3. who can see it: what the service allows for that owner and project, in its own words */
      const vis = RULES().visibility(S.env, d);
      if (!vis.length) out += C.note(T('online.details.azurePrivacy'), 'info', 'lock');
      else {
        out += C.group(T('online.details.privacy'), C.cards('vis', vis.map((v) => { const c = visCopy(d, v, o); return { v, glyph: v === 'public' ? 'globe' : v === 'internal' ? 'stack' : 'lock', title: c.title, sub: c.sub, quiet: true }; }), d.repository_visibility, { cls: 'o55-choices-quiet' }));
        const cap = visCap(S, d, o, p, vis); if (cap) out += C.note(cap, 'info', 'lock');
      }
      /* 4. more options */
      const adv = C.field({ bind: 'desc', label: T('online.details.description'), value: d.repository_description }) + C.field({ bind: 'branch', label: T('online.details.branch'), value: d.repository_default_branch, error: branchError(d), invalid: !!branchError(d) })
        + C.toggle({ do: 'readme', on: d.repository_initialize_readme, label: T('online.details.readme'), sub: T('online.details.readmeSub') })
        /* (each choice under its own visible heading: Opus p74) */
        + C.group(T('online.details.gitignore'), C.segmented({ do: 'gitignore', value: d.repository_gitignore, label: T('online.details.gitignore'), options: Object.entries(O55.tx('online.details.gitignoreOpts')).map(([v, label]) => ({ v, label })) }))
        + C.group(T('online.details.license'), C.segmented({ do: 'license', value: d.repository_license, label: T('online.details.license'), options: Object.entries(O55.tx('online.details.licenseOpts')).map(([v, label]) => ({ v, label })) }));
      /* (open when its branch needs fixing, so the reason Continue waits is in sight) */
      out += F.more(!!S.sess.ui.onlineAdv || !!branchError(d), T('online.details.advanced'), 'adv', adv, 'adv');
      return out;
    },
    /* before it is drawn: the suggested name in the service's own spelling; where a place must be chosen and the account
       has only one, it is chosen (shown, and changeable); Azure DevOps lists the team projects in it */
    enter(S) { detailDefaults(S); },
    /* (opened straight here by Demo Studio, the defaults land after the first drawing) */
    /* "Change the name" after the service refused it opens here with the name field ready to type into (RV-12) */
    mounted(S, layer, fresh) {
      if (fresh && detailDefaults(S)) O55.ui.refresh();
      if (fresh && branchError(md(S))) showField(S, 'o55f-branch');
      if (fresh && (S.sess.ui.focusName || (!nameError(md(S)) && nameTaken(S, md(S).repository_name)))) {
        S.sess.ui.focusName = false; S.save();
        O55.motion.after(120, () => { const i = S.open && S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out) #o55f-repo'); if (i) { i.focus({ preventScroll: false }); i.select(); } });
      }
    },
    foot(S) {
      const d = md(S), taken = !nameError(d) && nameTaken(S, d.repository_name), need = RULES().needs(S.env, d)[0];
      const reason = !F.nonEmpty(d.repository_name) ? T('online.details.nameLabel', { name: forgeName(d.forge) }) : taken ? T('online.details.taken', { owner: d.repository_container || accountFor(S, d.forge) || '' })
        : d.forge === 'azure_devops' && d.repository_container && !azureProjects(S).some((p) => p.id === d.repository_project) ? T('missing.teamProject') : need ? T(need.key) : '';
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !!reason, reason } };
    },
    do: {
      owner(S, v) {
        const d = md(S), id = v === 'personal' ? '' : v.slice(4), x = world(S).owners.find((o) => o.id === id);
        if (id && !x) return;
        const patch = { repository_owner_scope: !id || (x && x.scope === 'personal') ? 'personal' : 'organization', repository_container: id };
        if (d.repository_container !== id) patch.repository_project = x && x.projects && x.projects.length === 1 ? x.projects[0].key : '';
        O55.draft.set(d, patch);
        if (d.forge === 'azure_devops') listAzure(S, true);
        S.save(); O55.ui.refresh();
      },
      bbProject(S, v) { const o = RULES().ownerOf(S.env, md(S)); if (!o || !(o.projects || []).some((p) => p.key === v)) return; O55.draft.set(md(S), { repository_project: v }); S.save(); O55.ui.refresh(); },
      vis(S, v) { if (!RULES().visibility(S.env, md(S)).includes(v)) return; O55.draft.set(md(S), { repository_visibility: v }); S.save(); O55.ui.refresh(); },
      azProject(S, v) { if (!azureProjects(S).some((p) => p.id === v)) return; O55.draft.set(md(S), { repository_project: v }); S.save(); O55.ui.refresh(); },
      azRefresh(S) { listAzure(S, false); O55.ui.refresh(); },
      azAdvanced(S) { S.sess.ui.azureTeamProjectAdvanced = !S.sess.ui.azureTeamProjectAdvanced; S.save(); O55.ui.refresh(); },
      azCreateTeamProject(S) { const route = azureProjectRoute(S); if (!route) return; O55.official.open(S, { kind: 'page', name: T('online.details.azure.pageName'), ...route }); },
      adv(S) { S.sess.ui.onlineAdv = !S.sess.ui.onlineAdv; S.save(); O55.ui.refresh(); },
      readme(S) { const on = !md(S).repository_initialize_readme; O55.draft.set(md(S), { repository_initialize_readme: on }); S.save(); O55.ui.refresh(); O55.sound.play(on ? 'toggleOn' : 'toggleOff'); },
      gitignore(S, v) { O55.draft.set(md(S), { repository_gitignore: v }); S.save(); O55.ui.refresh(); },
      license(S, v) { O55.draft.set(md(S), { repository_license: v }); S.save(); O55.ui.refresh(); },
      next(S) {
        if (RULES().needs(S.env, md(S)).length) return;
        O55.owners.dispatch('cmd.forge.repository.list', { check: md(S).repository_name }, S.ctx(), () => ({ ok: true }));
        O55.ui.go('safe');
      }
    },
    bind: {
      /* what was typed is kept for the hint only; the plan holds the name as the service spells it */
      repo(S, v) { const d = md(S), was = nameTaken(S, d.repository_name) || !!nameError(d); S.sess.ui.repoTyped = v; O55.draft.set(d, { repository_name: RULES().spell(d.forge, v) }); S.save(); O55.ui.refresh(); if (!was && (nameTaken(S, d.repository_name) || nameError(d))) O55.sound.play('warn', SND.warn); },
      desc(S, v) { O55.draft.set(md(S), { repository_description: v }); S.save(); },
      branch(S, v) { const had = !!branchError(md(S)); O55.draft.set(md(S), { repository_default_branch: v.trim() }); S.save(); if (had !== !!branchError(md(S))) { O55.ui.refresh(); if (branchError(md(S))) showField(S, 'o55f-branch'); } }
    }
  });

  /* ================================================================== pick the online Project to bring in */
  /* A Project picked here carries where it lives with it: its owner and, where the service has them, its project (an
     Azure DevOps team project, a Bitbucket project), so nothing a later screen cannot supply is ever missing (FF-01). */
  /* (the address's own path: an Azure DevOps team project is in it, a Bitbucket project is not: Opus p73) */
  const repoRef = (forge, r) => forge + ':' + (r.container ? r.container + (r.projectName && forge === 'azure_devops' ? '/' + r.projectName : '') : r.owner) + '/' + r.name;
  def('ex-repos', {
    seed: (S) => seedOnline(S, true, 'source'),
    chapter: 'project', stage: 'first_project',
    scene: () => ({ id: 'online', beat: 'signed' }),
    eyebrow: () => T('online.repos.eyebrow'),
    title: () => T('online.repos.title'),
    lead: (S) => T('online.repos.lead', { account: accountFor(S, md(S).forge) || '', name: forgeName(md(S).forge, md(S).forge_provider_variant) }),
    body(S) {
      const d = md(S), w = world(S), q = String(S.sess.ui.repoQ || '').toLowerCase();
      const list = w.repos.filter((r) => !q || r.name.toLowerCase().includes(q)), sel = (w.repos.find((r) => repoRef(d.forge, r) === d.repository_ref) || {}).id;
      const account = accountFor(S, d.forge) || w.login || '', svc = forgeName(d.forge, d.forge_provider_variant);
      let out = C.field({ bind: 'q', label: T('online.repos.search'), value: S.sess.ui.repoQ || '', placeholder: T('chrome.search') });
      out += list.length ? C.cards('pick', list.map((r) => ({ v: r.id, glyph: 'cloud', title: r.name, sub: r.owner + ' · ' + (r.private ? T('online.repos.private') : T('online.repos.public')) + ' · ' + T('online.repos.updated', { when: r.updated }) })), sel, { label: T('online.repos.title') })
        : C.note(w.repos.length ? T('online.repos.noMatch') : T('online.repos.empty', { account, name: svc }), 'info');
      if (!w.repos.length) out += `<div class="o55-sublinks" data-key="another">${C.link(T('online.repos.another'), 'otherAccount')}</div>`;
      if (d.repository_ref) out += `<p class="o55-locline" data-key="copyto">${C.small(O55.project.onServer(S) ? 'server' : 'computer', 16)}<span>${U.esc(O55.project.onServer(S) ? T('online.repos.copyToServer', { name: O55.project.serverName(S) }) : T('online.repos.copyTo', { path: O55.project.docsPath(S, d.project_name) }))}</span></p>`;
      return out;
    },
    foot: (S) => { const d = md(S), need = RULES().needs(S.env, d)[0]; return { primary: { label: T('chrome.continue'), do: 'next', disabled: !d.repository_ref || !!need, reason: !d.repository_ref ? T('missing.repository') : need ? T(need.key) : '' } }; },
    do: {
      /* the name stays the person's once they typed one; it follows the pick only while it is the picked one's (p74) */
      pick(S, v) {
        const d = md(S), w = world(S), r = w.repos.find((x) => x.id === v); if (!r) return;
        const was = w.repos.find((x) => repoRef(d.forge, x) === d.repository_ref), own = !!String(d.project_name || '').trim() && !(was && d.project_name === O55.project.pretty(was.name));
        O55.draft.set(d, { repository_ref: repoRef(d.forge, r), repository_name: r.name, project_name: own ? d.project_name : O55.project.pretty(r.name),
          repository_owner_scope: r.scope || (r.container ? 'organization' : 'personal'), repository_container: r.container || '', repository_project: r.project || '',
          repository_visibility: r.private ? 'private' : 'public' });
        S.save(); O55.ui.refresh(); O55.owners.dispatch('cmd.forge.repository.list', { selected: r.id }, S.ctx(), () => ({ ok: true }));
      },
      next(S) { if (RULES().needs(S.env, md(S)).length) return; O55.ui.go('name'); },
      /* the Project is in another account: sign in with that one, then back to this list */
      otherAccount(S) { const d = md(S); O55.official.signIn(S, { service: d.forge, name: forgeName(d.forge, d.forge_provider_variant), kind: 'forge', then: 'ex-repos' }); S.sess.signin.another = true; S.save(); O55.ui.refresh(); }
    },
    bind: { q(S, v) { S.sess.ui.repoQ = v; S.save(); O55.ui.refresh(); } }
  });

  /* ================================================================== backup destinations */
  /* The NAS a backup can go to is one found on this network. It is no backup if the Project's own files already live
     on that NAS: on it over SSH or through its own Puppet Master, as its storage, or because the Puppet Master Server
     is that NAS. */
  const backupNas = (S) => S.env.devices.find((x) => x.ssh) || null;
  const ON_NAS = new Set(['ssh', 'puppet_master']);
  function filesOnNas(S) {
    const d = md(S), n = S.sess.nas || {}, nas = backupNas(S); if (!nas) return false;
    if (n.device === nas.id && n.purpose !== 'dest' && (ON_NAS.has(d.project_transport) || (d.storage_mode === 'network_location' && ON_NAS.has(d.storage_transport)))) return true;
    const srv = d.server_mode !== 'this_device' ? S.env.pmServers.find((x) => x.id === d.server_ref) : null;
    return !!(srv && srv.device === nas.id);
  }
  /* Which service or protocol a bucket or a server is (FF-13, FF-16; BRS-013's families): a storage bucket is Amazon S3,
     Backblaze B2 or another S3-compatible service, and another server is SFTP or WebDAV. Each is its own family, with its
     own address and access details, recorded as itself (never WebDAV as SFTP, or B2 as Amazon). */
  const SUBS = { s3: ['aws_s3', 'backblaze_b2', 's3_compatible'], sftp: ['sftp', 'webdav'] };
  const FAMILY = { nas: 'local_nas', gdrive: 'google_drive', onedrive: 'onedrive' };
  const family = (dest, sub) => (SUBS[dest] ? (SUBS[dest].includes(sub) ? sub : SUBS[dest][0]) : FAMILY[dest] || dest || null);
  const subOf = (S, dest) => (S.sess.backup && S.sess.backup.dest === dest ? S.sess.backup.sub : null);
  const backupLabel = (S, dest, sub) => (dest === 'nas' ? (backupNas(S) || { name: T('safe.backup.nas') }).name : SUBS[dest] ? T('safe.backup.family.' + family(dest, sub || subOf(S, dest))) : T('safe.backup.' + dest));
  /* the sub-choice under its card (the bucket's service, the server's protocol) */
  /* (short names, so the choice and its ? fit under the card at every width) */
  const subChoice = (dest, sub, action) => (SUBS[dest] ? C.segmented({ do: action, value: family(dest, sub), label: T('safe.backup.subLabel.' + dest), options: SUBS[dest].map((v) => ({ v, label: O55.tx('safe.backup.short.' + v) || T('safe.backup.family.' + v) })) }) : '');
  /* A bucket or a server connects with access details, not a browser sign-in, each checked by its service's own rule
     before Continue: an Amazon bucket's name (Puppet Master finds its region itself, and temporary keys bring their
     session token), Backblaze B2's S3 address and an application key (B2's master key does not work there), another
     service's own address, an SFTP or a WebDAV address. A secret is read from its field when it is used and handed to the
     credential owner; the session records only that one was typed. [key, type, check, when] (when: 'opt' optional,
     'temp' only with temporary keys). */
  const part = (v) => String(v || '').trim().replace(/^s3:\/\//i, '').split('/')[0];
  const ip4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  const CHECK = {
    awsBucket: (v) => { const b = part(v); return b.length >= 3 && b.length <= 63 && /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(b) && !/\.\./.test(b) && !ip4.test(b) && !/^(xn--|sthree-|amzn-s3-demo-)/.test(b) && !/(-s3alias|--ol-s3|\.mrap|--x-s3|--table-s3)$/.test(b); },
    b2Bucket: (v) => { const b = part(v); return b.length >= 6 && b.length <= 63 && /^[A-Za-z0-9.-]+$/.test(b) && !/^b2-/i.test(b) && !/^\.|\.$/.test(b) && !/\.\./.test(b) && !ip4.test(b); },
    bucket: (v) => { const b = part(v); return b.length >= 3 && b.length <= 63 && /^[A-Za-z0-9._-]+$/.test(b); },
    b2Host: (v) => /^(https:\/\/)?s3\.[a-z0-9-]+\.backblazeb2\.com\/?$/i.test(String(v || '').trim()),
    https: (v) => /^https:\/\/[^\s/?#]+(\/\S*)?$/i.test(String(v || '').trim()),
    sftp: (v) => /^sftp:\/\/[^\s/?#]+(\/\S*)?$/i.test(String(v || '').trim())
  };
  const ACCESS = {
    aws_s3: [['bucket', 'text', 'awsBucket'], ['keyId', 'text'], ['secret', 'password'], ['session', 'password', null, 'temp']],
    backblaze_b2: [['b2host', 'text', 'b2Host'], ['bucket', 'text', 'b2Bucket'], ['keyId', 'text'], ['secret', 'password']],
    s3_compatible: [['server', 'text', 'https'], ['region', 'text', null, 'opt'], ['bucket', 'text', 'bucket'], ['keyId', 'text'], ['secret', 'password']],
    sftp: [['address', 'text', 'sftp'], ['user', 'text'], ['password', 'password']],
    webdav: [['address', 'text', 'https'], ['user', 'text'], ['password', 'password']]
  };
  const shown = (kind, st) => (ACCESS[kind] || []).filter((f) => f[3] !== 'temp' || st.temp);
  const bad = (f, st) => !!(f[2] && F.nonEmpty(st[f[0]]) && !CHECK[f[2]](st[f[0]]));
  const accessFields = (S, kind, st, o) => shown(kind, st).map((f) => { const [k, type] = f, key = 'access.' + kind + '.' + k;
    return C.field({ bind: 'acc-' + k, type, protected: type === 'password', typed: type === 'password' ? !!st[k + 'Typed'] : undefined, label: T(key), value: type === 'password' ? '' : (st[k] || ''), placeholder: O55.tx(key + 'Ph') || '',
      hint: O55.tx(key + 'Hint') || '', error: bad(f, st) ? T(key + 'Bad') : '', invalid: bad(f, st), autocomplete: type === 'password' ? 'off' : undefined }); }).join('')
    + (kind === 'aws_s3' ? `<div class="o55-sublinks" data-key="acc-temp">${C.link(T(st.temp ? 'access.aws_s3.tempOff' : 'access.aws_s3.tempOn'), 'accTemp')}</div>` : '')
    + demo('access:' + kind, (DEMO_ACCESS[kind] || []).filter(([outcome]) => outcome !== 'nothingThere' || (o && o.restore)).map(([outcome, fills]) => ({ label: (fills.find(([k]) => k === 'bucket') || fills[0])[1], outcome, fills: fills.map(([k, v]) => ['acc-' + k, v]) })), !accessReady(kind, st));
  /* demo values that take each branch: one that works, one each service refuses (and, for a restore, a bucket with
     nothing in it); they agree with the fixtures (a B2 bucket jared-pm-backups holds Harbor's backup) */
  const KEYS = [['keyId', 'demo-access-key-id'], ['secret', 'demo-secret-access-key']], B2KEYS = [['keyId', 'demo-b2-key-id'], ['secret', 'demo-b2-application-key']];
  const DEMO_ACCESS = {
    aws_s3: [['works', [['bucket', 'jared-pm-backups']].concat(KEYS)], ['wrong', [['bucket', 'My_Backups']]]],
    backblaze_b2: [['works', [['b2host', 's3.us-west-004.backblazeb2.com'], ['bucket', 'jared-pm-backups']].concat(B2KEYS)], ['wrong', [['b2host', 's3.amazonaws.com']]], ['nothingThere', [['b2host', 's3.us-west-004.backblazeb2.com'], ['bucket', 'old-backups']].concat(B2KEYS)]],
    s3_compatible: [['works', [['server', 'https://s3.wasabisys.com'], ['bucket', 'jared-pm-backups']].concat(KEYS)], ['wrong', [['server', 'http://s3.wasabisys.com']]]],
    sftp: [['works', [['address', 'sftp://backup.platyr.test/puppet-master'], ['user', 'jared'], ['password', 'demo-password']]], ['wrong', [['address', 'https://backup.platyr.test/puppet-master']]]],
    webdav: [['works', [['address', 'https://dav.platyr.test/puppet-master'], ['user', 'jared'], ['password', 'demo-password']]], ['wrong', [['address', 'sftp://dav.platyr.test/puppet-master']]]]
  };
  const accessReady = (kind, st) => !!ACCESS[kind] && shown(kind, st).every((f) => f[3] === 'opt' || (f[1] === 'password' ? !!st[f[0] + 'Typed'] : F.nonEmpty(st[f[0]]) && !bad(f, st)));
  function accessBind(kind, st, S, key, v) {
    const f = (ACCESS[kind] || []).find(([k]) => k === key); if (!f) return;
    if (f[1] === 'password') { const had = !!st[key + 'Typed']; st[key + 'Typed'] = v.length > 0; if (had !== st[key + 'Typed']) { S.save(); O55.ui.refresh(); } }
    else { st[key] = v; S.save(); O55.ui.refresh(); }
  }
  /* read and clear the secret fields; false when one is empty (after a reload they always are) */
  function accessTake(S, kind, st) {
    let ok = true;
    shown(kind, st).filter(([, t]) => t === 'password').forEach(([k]) => { const i = S.root.querySelector('#o55f-acc-' + k); if (!(i && i.value)) ok = false; if (i) i.value = ''; st[k + 'Typed'] = false; });
    S.save(); return ok;
  }
  const accessReset = (st) => { Object.keys(st || {}).forEach((k) => { if (/Typed$/.test(k)) st[k] = false; }); };
  const accessBinds = (get) => Object.fromEntries(['bucket', 'keyId', 'secret', 'session', 'b2host', 'server', 'region', 'address', 'user', 'password'].map((k) => ['acc-' + k, (S, v) => { const [kind, st] = get(S); accessBind(kind, st, S, k, v); }]));
  /* where the backups go, exactly, without its secrets: for a bucket or a server its own details, for a cloud drive the
     signed-in account and the folder Puppet Master keeps for itself there (FF-14: Google Drive's drive.file reaches only
     what Puppet Master makes or is shown; OneDrive's app folder, Apps › Puppet Master, works for home and work accounts) */
  const DRIVE_FOLDER = { gdrive: ['My Drive', 'Puppet Master'], onedrive: ['Apps', 'Puppet Master'] };
  function locator(S, dest, sub, st, signedIn) {
    const fam = family(dest, sub), a = st || {};
    if (fam === 'google_drive' || fam === 'onedrive') return { family: fam, account: signedIn || null, kind: fam === 'onedrive' && signedIn ? 'personal' : null, folder: DRIVE_FOLDER[dest], app_folder: true };
    if (fam === 'local_nas') return { family: fam };
    const bucket = String(a.bucket || '').trim().replace(/^s3:\/\//i, '');
    return { family: fam, bucket: bucket.split('/')[0] || null, prefix: bucket.split('/').slice(1).join('/') || null, address: String(a.address || a.server || a.b2host || '').trim() || null, region: String(a.region || '').trim() || null, temporary: fam === 'aws_s3' ? !!a.temp : null };
  }
  function whereLine(S, dest, sub, st, signedIn) {
    const l = locator(S, dest, sub, st, signedIn), name = backupLabel(S, dest, sub);
    if (l.folder) return [name, l.account ? l.account + (l.kind ? ' (' + T('protect.accountKind.' + l.kind) + ')' : '') : '', l.folder.join(' › ')].filter(Boolean).join(' · ');
    if (l.bucket) return [name, l.address, l.bucket + (l.prefix ? '/' + l.prefix : '')].filter(Boolean).join(' · ');
    return [name, l.address].filter(Boolean).join(' · ');
  }
  O55.backup = { nas: backupNas, filesOnNas, label: backupLabel, family, SUBS, subChoice, accessFields, accessReady, accessTake, accessReset, accessBinds, locator, whereLine };

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
      /* 1. Safe History: how versions are kept on this computer, Git or Jujutsu, chosen in plain sight (PWIZ-024). Both
         are local version-control tools with no account; Jujutsu keeps its history in Git's format, so either works
         with every online copy. It is never offered as a website, account or online copy. A folder that already has
         history keeps its own. */
      const jj = d.history_backend === 'jujutsu', kind = existing ? (fi.history === 'jujutsu' ? 'Jujutsu' : 'Git') : jj ? 'Jujutsu' : 'Git';
      const missing = !existing && d.server_mode === 'this_device' && !(jj ? S.env.here.jj : S.env.here.git);
      let hist = `<div class="o55-saferow" data-key="r-hist">${C.glyph('history')}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('safe.history.title'))}</span><span class="o55-rowmeta">${U.esc(existing ? T('safe.history.subExisting') : T('safe.history.sub'))}</span></span>${C.pill('ready', kind)}`;
      if (!existing) hist += `<div class="o55-inline o55-howsaved" data-key="hist-how"><span class="o55-hint">${U.esc(T('safe.history.howLabel'))}</span>`
        + C.segmented({ do: 'backend', value: d.history_backend, label: T('safe.history.howLabel'), options: [{ v: 'git', label: T('safe.history.git') }, { v: 'jujutsu', label: T('safe.history.jj') }] }) + '</div>'
        + `<p class="o55-hint o55-howhint" data-key="hist-hint">${U.esc(T(jj ? 'safe.history.jjSub' : 'safe.history.gitSub'))}</p>`;
      hist += '</div>';
      if (existing) hist += C.note(T('safe.history.keeps', { kind }), 'info', 'history');
      else if (missing) hist += C.note(T('safe.history.install', { kind }), 'info', 'history');
      /* (its explanation has a Plain English and an Expert version: 21-talk.js) */
      hist += C.details(S, 'hist', T('safe.history.detailsLabel'), `<p>${U.esc(O55.talk.t('safe.history.detail'))}</p>`
        + C.toggle({ do: 'filesafe', on: d.filesafe, label: T('safe.history.filesafe'), sub: T('safe.history.filesafeSub') }));
      /* 2. online copy */
      let onlineState, onlineBtn = '';
      /* a folder that already has an online copy keeps it: show it, and do not offer a second one */
      const folderOnline = d.project_mode === 'existing_local' && fi && fi.online;
      if (d.project_mode === 'existing_online') onlineState = forgeName(d.forge, d.forge_provider_variant) + ' · ' + d.repository_ref.replace(/^[a-z_]+:/, '');
      else if (folderOnline && d.online_mode === 'none') onlineState = forgeName(folderOnline.forge) + ' · ' + folderOnline.repo + ' · ' + T('safe.online.linked');
      else if (d.online_mode === 'new') {
        const privacy = d.forge === 'azure_devops' ? T('online.details.azurePrivacy') : d.repository_visibility ? visCopy(d, d.repository_visibility, RULES().ownerOf(S.env, d)).title : '';
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
        /* a storage bucket's service and a server's protocol sit under their card; the places onboarding does not offer
           are a Settings page away, and the sheet says so (FF-17) */
        out += C.sheet(S, 'backup', T('safe.backup.sheetTitle'), C.cards('bdest', BACKUPS.filter(([v]) => v !== 'nas' || backupNas(S)).map(([v, g]) => ({ v, glyph: g, title: SUBS[v] ? T('safe.backup.' + v) : backupLabel(S, v), sub: O55.tx('safe.backup.' + v + 'Sub') || '', quiet: true,
          disabled: v === 'nas' && filesOnNas(S), reason: T('safe.backup.nasSame', { name: backupLabel(S, 'nas') }), under: v === bk ? subChoice(v, S.sess.backup.sub, 'bsub') : '' })).concat([{ v: 'none', glyph: 'history', title: T('safe.backup.none'), quiet: true }]), bk || 'none', { cls: 'o55-choices-quiet' })
          + `<p class="o55-hint" data-key="bmore">${U.esc(T('safe.backup.more'))}</p>` + C.note(T('safe.backup.note'), 'info', 'lock'), O55.ui.btn({ label: T('chrome.done'), do: 'sheet-close' }, 'o55-primary'));
      }
      if (O55.project.onServer(S)) out += C.note(T('safe.sync'), 'info', 'link');
      return out;
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      backend(S, v) { O55.draft.set(md(S), { history_backend: v }); S.save(); O55.ui.refresh(); },
      filesafe(S) { const on = !md(S).filesafe; O55.draft.set(md(S), { filesafe: on }); S.save(); O55.ui.refresh(); O55.sound.play(on ? 'toggleOn' : 'toggleOff'); },
      online(S) { OL(S).purpose = 'copy'; S.save(); O55.ui.go('online-service'); },
      backup(S) { S.sess.ui.sheet = 'backup'; S.save(); O55.ui.refresh(); seeSheet(S); },
      /* another place, or another service for it, drops the access details typed for the old one */
      bdest(S, v, el) { const b = S.sess.backup, to = v === 'none' ? null : v; if (b.dest !== to) { b.sub = null; b.access = {}; } b.dest = to; S.save(); O55.ui.refresh(); if (v !== 'none') O55.ui.charm(el, SUBS[v] ? T('safe.backup.' + v) : backupLabel(S, v), 'vault'); },
      bsub(S, v) { const b = S.sess.backup; if (!SUBS[b.dest] || !SUBS[b.dest].includes(v)) return; if (b.sub !== v) b.access = {}; b.sub = v; S.save(); O55.ui.refresh(); },
      next(S) { O55.ui.go(md(S).server_mode === 'new_server' ? 'away' : 'review'); }
    },
    leave(S) { if (S.sess.ui.sheet === 'backup') { S.sess.ui.sheet = null; S.save(); } }
  });

  /* (Use it away from home moved to 71a-screens-away.js with the Server lane, 2026-10-31) */

  O55.safe = { forgeName, visCopy, hostOf, nameTaken, refuseName };

  /* ================================================================== handed to the app at the end (O55.handoff) */
  /* What the person chose for keeping the work safe, as plain non-secret facts the app shows: how versions are kept,
     the online copy (service, server, account, where it lives, its name, who can see it, branch and first files, how
     Puppet Master signs in there) and the backup (its family and exact place). Each says only what really happened:
     an online copy is `created` or `linked` once the reviewed commit finished it, `skipped` when the person went on
     without it, and `not_created` otherwise; a backup is `on` only once every protection step is done. */
  const HANDOFF = {
    source_control(S) {
      const d = md(S), cm = S.sess.commit || {}, fi = d.project_mode === 'existing_local' ? S.sess.folderInfo : null;
      const committed = cm.state === 'done' || (S.ctx && S.ctx().committed);
      const out = { history: { backend: fi && fi.history ? fi.history : d.history_backend, kept_existing: !!(fi && fi.history), filesafe: !!d.filesafe }, online: null };
      if (d.online_mode === 'none') { if (cm.skipOnline) out.online = { state: 'skipped' }; return out; }
      const o = RULES().ownerOf(S.env, d), p = RULES().projectOf(S.env, d);
      out.online = { mode: d.online_mode, service: d.forge, variant: d.forge_provider_variant, service_label: forgeName(d.forge, d.forge_provider_variant), address: d.forge_instance_url,
        account: accountFor(S, d.forge) || null, owner: o ? { scope: o.scope, id: o.id || null, kind: RULES().ownerNoun(d), name: o.name || null } : null,
        project: p ? { id: p.id || p.key, name: p.name || p.key } : null, name: d.repository_name, visibility: d.repository_visibility,
        visibility_label: d.forge === 'azure_devops' ? T('online.details.azurePrivacy') : d.repository_visibility ? visCopy(d, d.repository_visibility, o).title : null,
        default_branch: d.online_mode === 'new' ? d.repository_default_branch : null,
        first_files: d.online_mode === 'new' ? { readme: !!d.repository_initialize_readme, ignore: d.repository_gitignore, license: d.repository_license } : null,
        sign_in: d.forge_auth_method === 'token' ? 'access_token' : 'browser',
        state: !committed ? 'not_created' : d.online_mode === 'existing' ? 'linked' : 'created' };
      return out;
    },
    backup(S) {
      const b = S.sess.backup || {}; if (!b.dest) return null;
      return { family: family(b.dest, b.sub), label: backupLabel(S, b.dest, b.sub), place: whereLine(S, b.dest, b.sub, b.access, b.account), locator: b.dest === 'nas' ? null : locator(S, b.dest, b.sub, b.access, b.account),
        state: b.state === 'done' ? 'on' : b.state === 'later' ? 'set_up_later' : (b.done || []).length ? 'partly_set_up' : 'not_set_up', steps_done: (b.done || []).slice() };
    }
  };
  /* (75-handoff.js loads after this file: the parts are handed over once every file has run) */
  setTimeout(() => { if (O55.handoff && O55.handoff.part) Object.keys(HANDOFF).forEach((k) => O55.handoff.part(k, HANDOFF[k])); }, 0);
})();
