import { onboardingApp } from '../helpers/onboarding-fields.mjs';
// Sol R6, the identity class: generated, not examples. Every retired service and kind x every sign-in cache shape x both
// sign-in kinds x every action registered on the four source-control screens, with the real handlers and the real owner
// dispatch; nothing reaches an owner, moves forward or starts a sign-in. Mirror controls: every admitted service and kind
// in the same cache shapes still reaches its owner where the identity is sound (and is refused where a part contradicts
// the plan); Cursor the AI provider and the backup drives keep working beside every stale cache.
const RETIRED = [['cursor_origin', 'preview', 'https://origin.cursor.com'], ['cursor_origin', null, 'https://origin.cursor.com'], ['gitea', 'gitea_cloud', 'https://retired.example.test'], ['forgejo', 'forgejo_cloud', 'https://retired.example.test']];
const ADMITTED = [['github', 'hosted', 'https://github.com'], ['github', 'self_managed', 'https://github.platyr.test'], ['gitlab', 'hosted', 'https://gitlab.com'], ['gitlab', 'self_managed', 'https://git.platyr.test'],
  ['azure_devops', 'cloud', 'https://dev.azure.com'], ['azure_devops', 'self_managed', 'https://devops.platyr.test/tfs'], ['bitbucket_cloud', 'cloud', 'https://bitbucket.org'], ['bitbucket_data_center', 'data_center', 'https://bb.platyr.test'],
  ['forgejo', 'forgejo_self_managed', 'https://git.platyr.test'], ['gitea', 'gitea_self_managed', 'https://gitea.platyr.test']];
const SHAPES = ['missing', 'empty', 'service-only', 'service||address', 'full', 'other-service', 'other-variant', 'other-server'];
const SOUND = new Set(['empty', 'service-only', 'service||address', 'full']);

export const tests = {
  async 'generated: no retired identity in any cache shape reaches an owner, moves on or starts a sign-in; admitted ones still work'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    const r = await A.frame().evaluate(([RETIRED, ADMITTED, SHAPES, SOUND]) => {
      const S = O55.S, defs = O55.screens.defs, SCREENS = ['online-signin', 'online-details', 'ex-repos', 'online-service'];
      const SRC = /^cmd\.(forge|auth_profile)\./, sound = new Set(SOUND);
      /* every hand-off the owners accept or refuse, from their own event stream (the log is a 500-entry ring) */
      let nOk = 0; const events = [];
      const off = O55.owners.on((ev) => { if (ev && ev.entry) { events.push(ev); if (ev.type === 'dispatch' && SRC.test(ev.entry.id)) nOk++; } });
      const accepted = () => nOk;
      const ARGS = { pick: null, variant: 'gitea_cloud', owner: 'personal', vis: 'private', bbProject: 'WEB', azProject: 'x', gitignore: 'node', license: 'mit' };
      const keyFor = (shape, f, v, u) => ({ missing: null, empty: '', 'service-only': f, 'service||address': f + '||' + u, full: f + '|' + v + '|' + u,
        'other-service': (f === 'github' ? 'gitlab' : 'github') + '|hosted|https://github.com', 'other-variant': f + '|' + (v === 'self_managed' ? 'hosted' : 'self_managed') + '|' + u, 'other-server': f + '|' + v + '|https://elsewhere.test' })[shape];
      const svcFor = (shape, f) => (shape === 'other-service' ? (f === 'github' ? 'gitlab' : 'github') : f);
      const reset = () => { const d = S.sess.drafts.main; d.forge_retired = null; Object.assign(d, { online_mode: 'none' }); O55.draft.normalize(d); S.sess.signin = {}; S.sess.online = { purpose: 'copy' }; S.sess.screen = 'online-service'; };
      /* a plan as it arrives (raw, not yet normalized) or as normalize leaves it */
      const setPlan = (f, v, u, mode, raw) => { const d = S.sess.drafts.main; d.forge_retired = null; Object.assign(d, { online_mode: mode, forge: f, forge_provider_variant: v, forge_instance_url: u, forge_account_ref: 'account:x:jared', forge_account_action: 'already_connected', repository_ref: mode === 'existing' ? f + ':jared/notes' : '' }); if (!raw) O55.draft.normalize(d); };
      const setSignin = (shape, kind, f, v, u, state) => { S.sess.signin = shape === 'missing' ? {} : { service: svcFor(shape, f), name: f, kind, then: state === 'done' ? 'ex-repos' : 'online-details', state: state || 'idle', account: 'jared', instance_key: keyFor(shape, f, v, u), code: state === 'code' ? 'WDJB-MJHT' : undefined, codeUntil: state === 'code' ? Date.now() + 600000 : undefined }; };
      const bad = [], tally = { retiredCalls: 0, admittedSound: 0, admittedSoundOk: 0, admittedContradict: 0, admittedContradictRefused: 0 };
      /* 1. every retired identity, plan raw or normalized, every cache shape and kind, every registered action */
      for (const [f, v, u] of RETIRED) for (const raw of [true, false]) for (const shape of SHAPES) for (const kind of ['forge', 'service']) for (const scr of SCREENS) for (const state of (scr === 'online-signin' ? ['idle', 'done', 'waiting', 'code'] : ['idle'])) {
        for (const k of Object.keys((defs[scr] || {}).do || {})) {
          reset(); setPlan(f, v, u, scr === 'ex-repos' ? 'existing' : 'new', raw); setSignin(shape, kind, f, v, u, state);
          if (scr === 'online-service') S.sess.online = { purpose: 'copy', forge: f === 'cursor_origin' ? 'cursor_origin' : f, variant: v, addresses: { [f + '|' + v]: u } };
          S.sess.screen = scr; const before = accepted(); let threw = null;
          const si0 = JSON.stringify(S.sess.signin || {});
          try { defs[scr].do[k](S, ARGS[k] != null ? ARGS[k] : (k === 'pick' && scr === 'online-service' ? f : null), null, null); } catch (e) { threw = String(e && e.message || e); }
          tally.retiredCalls++;
          const reached = accepted() > before, moved = S.sess.screen !== scr && S.sess.screen !== 'online-service' && !(scr === 'online-service' && k === 'notNow');
          const si = S.sess.signin || {}, started = JSON.stringify(si) !== si0 && si.service && si.kind !== 'cloud' && !(si.service === 'github' && scr === 'online-service');
          if (reached || moved || started) bad.push({ id: f + '/' + v, raw, shape, kind, state, scr, k, reached, moved: moved && S.sess.screen, started: started && si.service, threw });
        }
      }
      /* 2. mirror: every admitted identity in the same cache shapes: sound ones reach their owner, contradicting ones are refused */
      const repoId = (f) => { const w = O55.forgeRules.world(S.env, S.sess.drafts.main) || {}; return ((w.repos || [])[0] || {}).id || null; };
      for (const [f, v, u] of ADMITTED) for (const shape of SHAPES) for (const kind of ['forge', 'service']) {
        if (shape === 'missing') continue;
        reset(); setPlan(f, v, u, 'new', false); setSignin(shape, kind, f, v, u); S.sess.screen = 'online-signin';
        const before = accepted(); try { defs['online-signin'].do.create(S); } catch (e) { /* counted below */ }
        const got = accepted() > before;
        if (sound.has(shape)) { tally.admittedSound++; if (got) tally.admittedSoundOk++; else bad.push({ id: f + '/' + v, shape, kind, scr: 'online-signin', k: 'create', admitted: 'should reach its owner' }); }
        else { tally.admittedContradict++; if (!got) tally.admittedContradictRefused++; else bad.push({ id: f + '/' + v, shape, kind, scr: 'online-signin', k: 'create', admitted: 'contradicting claim reached the owner' }); }
      }
      for (const [f, v, u] of ADMITTED) {
        reset(); setPlan(f, v, u, 'existing', false); S.sess.screen = 'ex-repos'; const id = repoId(f); if (!id) continue;
        const before = accepted(); try { defs['ex-repos'].do.pick(S, id); } catch (e) { /* counted below */ }
        if (!(accepted() > before)) bad.push({ id: f + '/' + v, scr: 'ex-repos', k: 'pick', admitted: 'should reach its owner' });
      }
      /* 3. mirror: Cursor the AI provider and the backup drives beside every stale retired cache */
      const mixed = [];
      for (const [f, v, u] of RETIRED) for (const shape of SHAPES) {
        reset(); setPlan(f, v, u, 'new', true); setSignin(shape, 'forge', f, v, u);
        S.sess.screen = 'ai'; const a0 = events.length; O55.owners.dispatch('cmd.auth_profile.sign_in', { provider: 'cursor' }, S.ctx(), () => ({ ok: true }));
        const ai = (events.slice(a0).find((e) => e.entry.id === 'cmd.auth_profile.sign_in') || {}).entry;
        S.sess.screen = 'protect'; const b0 = events.length; const opened = O55.official.open(S, { kind: 'signin', name: 'Google Drive', url: 'https://accounts.google.com' });
        const drive = (events.slice(b0).find((e) => e.entry.id === 'cmd.auth_profile.open_official_page') || {}).entry;
        if (!(ai && ai.reason !== 'service_not_offered') || opened === false || !(drive && drive.ok)) mixed.push({ id: f + '/' + v, shape, ai: ai && (ai.ok || ai.reason), drive: drive && (drive.ok || drive.reason), opened });
      }
      reset(); off();
      const counts = SCREENS.map((x) => x + ':' + Object.keys((defs[x] || {}).do || {}).length).join(' ');
      const retiredBad = bad.filter((b) => !b.admitted), admittedBad = bad.filter((b) => b.admitted);
      return { retiredBad: retiredBad.slice(0, 40), retiredCount: retiredBad.length, admittedBad, tally, mixed, counts };
    }, [RETIRED, ADMITTED, SHAPES, [...SOUND]]);
    t.log('actions per screen ' + r.counts + ' · retired calls ' + r.tally.retiredCalls + ' · admitted sound ' + r.tally.admittedSoundOk + '/' + r.tally.admittedSound + ' · admitted contradicting refused ' + r.tally.admittedContradictRefused + '/' + r.tally.admittedContradict);
    await t.check('no retired identity in any cache shape reaches an owner, moves forward or starts a sign-in (every registered action)', !r.retiredCount, r.retiredCount + ' bad: ' + JSON.stringify(r.retiredBad).slice(0, 1500));
    const should = r.admittedBad.filter((b) => b.admitted === 'should reach its owner'), contra = r.admittedBad.filter((b) => b.admitted === 'contradicting claim reached the owner');
    await t.check('every admitted service and kind with a sound identity still reaches its owner', !should.length, should.length + ': ' + JSON.stringify(should).slice(0, 900));
    await t.check('an admitted service with a claim that contradicts the plan is refused', !contra.length, contra.length + ': ' + JSON.stringify(contra).slice(0, 900));
    await t.check('Cursor the AI provider and the backup drives work beside every stale retired cache', !r.mixed.length, JSON.stringify(r.mixed).slice(0, 900));
  },
  async 'generated: every kind tag with every service, and every declared-part conflict, is refused unless the identity is sound; real drives restore'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    const r = await A.frame().evaluate(() => {
      const S = O55.S, defs = O55.screens.defs, SRC = /^cmd\.(forge|auth_profile)\./;
      let nOk = 0; const ev = []; const off = O55.owners.on((e) => { if (e && e.entry) { ev.push(e); if (e.type === 'dispatch' && SRC.test(e.entry.id)) nOk++; } });
      const DRIVES = Object.keys(O55.fixtures.OFFICIAL.backup || {});
      const SERVICES = ['cursor_origin', 'gitea', 'forgejo', 'github', 'gitlab', 'azure_devops', 'bitbucket_cloud', 'bitbucket_data_center', 'dropbox', 'claude', 'anything'].concat(DRIVES);
      const KINDS = ['forge', 'service', 'cloud', '', undefined, 'other'];
      const PLANS = { unpicked: null, retired: ['gitea', 'gitea_cloud', 'https://retired.example.test'], admitted: ['github', 'hosted', 'https://github.com'] };
      const reset = () => { const d = S.sess.drafts.main; d.forge_retired = null; Object.assign(d, { online_mode: 'none' }); O55.draft.normalize(d); S.sess.signin = {}; S.sess.online = { purpose: 'copy' }; S.sess.screen = 'online-service'; };
      const plan = (p) => { const d = S.sess.drafts.main; if (!p) return; Object.assign(d, { online_mode: 'new', forge: p[0], forge_provider_variant: p[1], forge_instance_url: p[2], forge_account_ref: 'account:x:jared' }); if (p[0] === 'github') O55.draft.normalize(d); };
      const bad = []; let drivesOk = 0, drivesTried = 0, soundOk = 0, soundTried = 0, kindCalls = 0;
      /* 1. every kind tag with every service, under every plan, every sign-in action */
      for (const [pn, p] of Object.entries(PLANS)) for (const svc of SERVICES) for (const kind of KINDS) {
        const drive = DRIVES.includes(svc) && kind === 'cloud', sound = pn === 'admitted' && svc === 'github';
        for (const k of Object.keys(defs['online-signin'].do)) {
          reset(); plan(p); S.sess.signin = { service: svc, name: svc, kind, then: 'ex-repos', state: k === 'next' ? 'done' : 'idle', account: 'jared', instance_key: sound ? 'github|hosted|https://github.com' : '' };
          if (drive) S.sess.restore = {};
          S.sess.screen = 'online-signin'; const before = nOk; let threw = null; kindCalls++;
          try { defs['online-signin'].do[k](S, null, null, null); } catch (e) { threw = String(e && e.message || e); }
          const reached = nOk > before, moved = S.sess.screen !== 'online-signin' && S.sess.screen !== 'online-service';
          if ((reached || moved) && !drive && !sound) bad.push({ part: 'kind', plan: pn, svc, kind, k, reached, moved: moved && S.sess.screen, threw });
          if (k === 'signIn' && drive) { drivesTried++; if (reached) drivesOk++; else bad.push({ part: 'drive-control', svc, kind, k }); }
          if (k === 'create' && sound) { soundTried++; if (reached) soundOk++; else bad.push({ part: 'sound-control', svc, kind, k }); }
        }
        reset(); plan(p);
        const r0 = O55.official.signIn(S, { service: svc, name: svc, kind, then: 'online-details' });
        const opened = r0 !== false && S.sess.screen === 'online-signin';
        if (opened && !drive && !sound) bad.push({ part: 'official.signIn', plan: pn, svc, kind });
      }
      /* 2. every declared part, one at a time made to disagree with an admitted plan (github hosted, https://github.com) */
      const RIGHT = { forge: 'github', service: 'github', keyForge: 'github', variant: 'hosted', server: 'https://github.com' };
      const WRONG = { forge: 'cursor_origin', service: 'cursor_origin', keyForge: 'gitlab', variant: 'self_managed', server: 'https://elsewhere.test' };
      const key = (f, v, u) => f + '|' + v + '|' + u;
      const conflicts = [];
      for (const part of Object.keys(RIGHT)) conflicts.push({ name: part, claim: Object.assign({}, RIGHT, { [part]: WRONG[part] }, { instance_key: key('github', 'hosted', 'https://github.com') }) });
      for (const [part, kv] of [['key-forge', key('gitlab', 'hosted', 'https://github.com')], ['key-variant', key('github', 'self_managed', 'https://github.com')], ['key-server', key('github', 'hosted', 'https://elsewhere.test')]]) conflicts.push({ name: part, claim: Object.assign({}, RIGHT, { instance_key: kv }) });
      conflicts.push({ name: 'forge vs service only', claim: { forge: 'github', service: 'cursor_origin' } });
      conflicts.push({ name: 'explicit server masks key server', claim: { service: 'github', server: 'https://github.com', instance_key: key('github', 'hosted', 'https://elsewhere.test') } });
      const controls = [{ name: 'all parts agree', claim: Object.assign({}, RIGHT, { instance_key: key('github', 'hosted', 'https://github.com') }) }, { name: 'service only', claim: { service: 'github' } }];
      const tryClaim = (c) => {
        reset(); plan(PLANS.admitted);
        S.sess.screen = 'safe'; let n0 = nOk; O55.owners.dispatch('cmd.auth_profile.sign_in', { forge_target: c }, S.ctx(), () => ({ ok: true })); const asTarget = nOk > n0;
        S.sess.signin = Object.assign({ name: 'x', kind: 'forge', state: 'idle', then: 'online-details' }, c, { service: c.service || c.forge });
        S.sess.screen = 'online-signin'; n0 = nOk; try { defs['online-signin'].do.create(S); } catch (e) { /* counted */ } const asSignin = nOk > n0;
        return { asTarget, asSignin };
      };
      for (const c of conflicts) { const g = tryClaim(c.claim); if (g.asTarget || g.asSignin) bad.push({ part: 'conflict', name: c.name, ...g }); }
      for (const c of controls) { const g = tryClaim(c.claim); if (!g.asTarget || !g.asSignin) bad.push({ part: 'conflict-control', name: c.name, ...g }); }
      reset(); off();
      return { bad: bad.slice(0, 40), badCount: bad.length, kindCalls, drivesOk, drivesTried, soundOk, soundTried, conflicts: conflicts.length };
    });
    t.log('kind x service calls ' + r.kindCalls + ' · drives ' + r.drivesOk + '/' + r.drivesTried + ' · sound ' + r.soundOk + '/' + r.soundTried + ' · conflicts ' + r.conflicts);
    await t.check('no kind tag lets any service but a real cloud drive (restore) or the sound plan service act; every declared-part conflict is refused; controls work', !r.badCount, r.badCount + ': ' + JSON.stringify(r.bad).slice(0, 1600));
  },
  async 'real cloud drives restore end to end: the restore sign-in opens, completes and records that drive'(t) {
    for (const drive of ['gdrive', 'onedrive']) {
      const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes');
      /* the restore's own entry point, as the restore screen calls it, then a real press of Sign in */
      const opened = await A.frame().evaluate((drive) => { const S = O55.S; S.sess.restore = {}; return O55.official.signIn(S, { service: drive, name: drive, kind: 'cloud', then: 'safe', done: 'restoreCloud' }) !== false; }, drive);
      await A.screen('online-signin'); await A.click('signIn');
      await A.waitFor(() => O55.S.sess.signin.state === 'done', null, 12000).catch(() => {});
      const got = await A.frame().evaluate(() => ({ state: O55.S.sess.signin.state, reached: (O55.S.sess.restore || {}).reachedFor || null }));
      await t.check(drive + ': the restore sign-in opens, completes and records that drive', opened && got.state === 'done' && got.reached === 'cloud:' + drive, JSON.stringify({ opened, ...got }));
    }
  },
  async 'item 3 (Sol: settled): with an unpicked plan, resume keeps the admitted choice, address, account and refused names; only the stale sign-in clears; retired ones go'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    const ADM = [['github', 'github', 'hosted'], ['github_enterprise', 'github', 'self_managed'], ['gitlab', 'gitlab', 'hosted'], ['gitlab', 'gitlab', 'self_managed'], ['azure_devops', 'azure_devops', 'cloud'], ['azure_devops', 'azure_devops', 'self_managed'],
      ['bitbucket_cloud', 'bitbucket_cloud', 'cloud'], ['bitbucket_cloud', 'bitbucket_data_center', 'data_center'], ['forgejo', 'forgejo', 'forgejo_self_managed'], ['gitea', 'gitea', 'gitea_self_managed']];
    const fails = [];
    for (const [card, forge, variant] of ADM) {
      if (await A.frame().locator('[data-o55-do="close"]').count()) { await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(700); }
      await A.frame().evaluate(([card, forge, variant]) => { const saved = O55.store.get('onboarding', null), key = forge + '|' + variant + '|https://current.example.test';
        saved.v = 1; saved.started = 'mixed-' + card + variant + Date.now(); saved.status = 'closed'; saved.screen = 'online-service';
        saved.drafts.main = O55.draft.create('new_or_local');
        saved.online = { purpose: 'copy', forge: card, variant, addresses: { [card + '|' + variant]: 'https://current.example.test', 'gitea|gitea_cloud': 'https://old.example.test', 'forgejo|forgejo_cloud': 'https://old.example.test' } };
        saved.signin = { kind: 'forge', service: forge, state: 'waiting', instance_key: key };
        saved.forgeAccounts = { [key]: 'current-user', 'cursor_origin|preview|https://old.example.test': 'old-user' };
        saved.refusedNames = { [key + '|team']: ['used-name'], 'cursor_origin|preview|https://old.example.test|team': ['old-name'] };
        saved.commit = { state: 'none' }; O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, [card, forge, variant]);
      await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1100);
      const st = await A.frame().evaluate(([card, forge, variant]) => { const S = O55.S, key = forge + '|' + variant + '|https://current.example.test';
        return { online: S.sess.online.forge === card && S.sess.online.variant === variant && Object.keys(S.sess.online.addresses || {}).join() === card + '|' + variant,
          signin: !S.sess.signin.service, accounts: Object.keys(S.sess.forgeAccounts || {}).join() === key, refused: Object.keys(S.sess.refusedNames || {}).join() === key + '|team' }; }, [card, forge, variant]);
      if (!(st.online && st.signin && st.accounts && st.refused)) fails.push({ card, variant, ...st });
    }
    await t.check('all ten admitted kinds keep their choice, address, account and refused names; the stale sign-in clears; the retired entries go', !fails.length, JSON.stringify(fails));
  },
  async 'normalize: a saved plan naming Gitea or Forgejo with no kind (an address, no refs) or an empty service resumes unpicked, nothing relabelled or kept (Muse MU-2, MU-m1)'(t) {
    const CASES = [['gitea', 'https://gitea.example.test', 'new'], ['forgejo', 'https://forgejo.example.test', 'new'], ['gitea', 'https://gitea.example.test', 'existing'], ['', '', 'new']];
    for (const [forge, url, mode] of CASES) {
      const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
      await A.frame().evaluate(([forge, url, mode]) => { const saved = O55.store.get('onboarding', null); saved.started = 'mu2-' + Date.now(); saved.status = 'closed'; saved.screen = 'safe';
        Object.assign(saved.drafts.main, { online_mode: mode, forge, forge_provider_variant: null, forge_instance_url: url, forge_instance_profile: null, forge_account_ref: '', repository_ref: '', source_access_authorization_refs: [], forge_retired: null },
          mode === 'existing' ? { project_mode: 'existing_online' } : {});
        O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, [forge, url, mode]);
      await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1500);
      const d = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { forge: d.forge, v: d.forge_provider_variant, url: d.forge_instance_url, prof: !!d.forge_instance_profile }; });
      await t.check(`${forge || '(empty)'} with no kind, ${mode}: resumes unpicked, no own-server relabel, no address kept`, (d.forge === 'none' || !d.forge) && !/_self_managed$/.test(d.v || '') && !d.url && !d.prof, JSON.stringify(d));
    }
  },
  async 'completion: an admitted sign-in saved with no key (Sept 26 pages) completes, and Continue goes on'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(800);
    /* as 2b244a15bd / b3dc95010b saved it: GitHub hosted chosen, its sign-in started, no instance_key anywhere */
    await A.frame().evaluate(() => { const saved = O55.store.get('onboarding', null); saved.started = 'sept-' + Date.now(); saved.status = 'closed'; saved.screen = 'online-signin';
      Object.assign(saved.drafts.main, { online_mode: 'new', forge: 'github', forge_provider_variant: 'hosted', forge_instance_url: 'https://github.com', forge_account_ref: '', forge_account_action: null });
      saved.online = { purpose: 'copy', forge: 'github' };
      saved.signin = { service: 'github', name: 'GitHub', kind: 'forge', then: 'online-details', state: 'idle' };
      saved.forgeAccounts = {}; O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); });
    await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.screen('online-signin');
    await A.click('signIn');
    await A.waitFor(() => O55.S.sess.signin.state === 'done', null, 12000).catch(() => {});
    let s = await A.snap();
    await t.check('the sign-in completes (not left waiting)', s.signin.state === 'done' && !!s.draft.forge_account_ref, JSON.stringify({ st: s.signin.state, ref: s.draft.forge_account_ref }));
    await t.check('it now carries the plan\'s key', s.signin.instance_key === 'github|hosted|https://github.com', String(s.signin.instance_key));
    await t.check('Continue is on', !s.primary.disabled, JSON.stringify(s.primary));
    await A.click('next', undefined, 'online-details'); s = await A.snap();
    await t.check('Continue goes on to the details', s.screen === 'online-details', s.screen);
  }
};
