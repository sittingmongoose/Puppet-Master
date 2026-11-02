import { onboardingApp } from '../helpers/onboarding-fields.mjs';
// Back after a change (final-onb BACK-STATE-GAPS-78C, FO-22's class): a finished subflow is invalidated, then Back walks
// all the way to the start of history and the wizard goes forward again. Every row uses real clicks (a saved session is
// written to the page's store and resumed with the Resume chip's click, as Route B). Each screen Back or forward paints
// is judged the same way: no raw {placeholder}, i18n key, enum key, "none", undefined or null in its visible text; no
// address or account of the invalidated answer; every Back press moves; and a Continue that is refused says why and has a
// way on. Forward drives to Review, choosing only where a screen asks for a choice.
const LOOK = () => {
  const S = O55.S, l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), txt = l ? l.innerText : '';
  const vis = (e) => !!e && !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  const on = (x) => vis(x) && !x.disabled && x.getAttribute('aria-disabled') !== 'true';
  const acts = [...(l ? l.querySelectorAll('[data-o55-do], input, textarea') : [])].filter(on).map((x) => x.matches('[data-o55-do]') ? x.getAttribute('data-o55-do') + (x.getAttribute('data-arg') ? ':' + x.getAttribute('data-arg') : '') : 'field:' + x.id);
  const prim = document.querySelector('.o55-foot .o55-primary'), back = [...document.querySelectorAll('[data-o55-do="back"]')].find(vis);
  const ns = Object.keys(O55.copy || {}).join('|');
  const raw = [...txt.matchAll(new RegExp('\\{[a-zA-Z_]+\\}|\\b(?:undefined|null|NaN|none)\\b|\\b(?:' + ns + ')\\.[a-zA-Z]\\w*(?:\\.\\w+)*\\b|\\b[a-z]+(?:_[a-z]+)+\\b', 'g'))].map((m) => m[0]);
  const reason = (prim && !on(prim) ? prim.getAttribute('data-disabled-reason') || '' : '') + [...document.querySelectorAll('.o55-reason-show, .o55-layer:not(.o55-out) .o55-err')].map((x) => x.textContent.trim()).filter(Boolean).join(' / ');
  return { screen: S.sess.screen, title: (((l && l.querySelector('.o55-title')) || {}).textContent || '').trim(), raw, text: txt, acts, primary: prim ? { on: on(prim) } : null, back: on(back), reason };
};
const look = async (A) => { await A.sleep(450); return A.frame().evaluate(LOOK); };
const judge = (s, stale, where, bad) => {
  if (s.raw.length) bad.push(`${where} ${s.screen} "${s.title}": raw ${JSON.stringify([...new Set(s.raw)])}`);
  for (const e of stale) if ((!e.on || new RegExp('^(' + e.on + ')$').test(s.screen)) && s.text.includes(e.x)) bad.push(`${where} ${s.screen} "${s.title}": stale "${e.x}"`);
};
const pressBack = (A) => A.frame().locator('[data-o55-do="back"]').filter({ visible: true }).first().click();
const pressOn = (A) => A.frame().locator('.o55-foot .o55-primary').first().click();
async function walkBack(A, stale, bad, label) {
  const seq = []; let s = await look(A);
  for (let i = 0; i < 40; i++) {
    seq.push(s.screen); judge(s, stale, label + ' Back#' + i, bad);
    if (!s.back) break;
    await pressBack(A); const was = s.screen; s = await look(A);
    if (s.screen === was) { bad.push(`${label} Back#${i}: Back on ${was} went nowhere`); break; }
  }
  return seq;
}
async function forward(A, stale, bad, label, choose = {}, until = 'review') {
  const seq = [], used = new Set(); let stuck = 0;
  for (let i = 0; i < 40; i++) {
    const s = await look(A); seq.push(s.screen); judge(s, stale, label + ' fwd#' + i, bad);
    if (s.screen === until) return seq;
    const ways = s.acts.filter((a) => !/^(back|tip|help|look|close|sound|demoHint|details)/.test(a));
    if (choose[s.screen] && !used.has(s.screen)) { used.add(s.screen); await choose[s.screen](A, s); }
    else if (s.primary && s.primary.on) await pressOn(A);
    else { bad.push(`${label} fwd#${i} ${s.screen}: Continue refused (${s.reason || 'no reason shown'})${ways.length ? '' : ', and no way on'}`); return seq; }
    const n = await look(A);
    if (n.screen === s.screen && ++stuck > 2) { bad.push(`${label} fwd#${i} ${s.screen}: stuck (${n.reason || 'no reason shown'})`); return seq; }
    if (n.screen !== s.screen) stuck = 0;
  }
  bad.push(`${label}: never reached ${until}`); return seq;
}
async function row(t, label, { scenario, establish, invalidate, stale = [], choose = {}, until = 'review', after }) {
  const A = onboardingApp(t), bad = []; await A.boot(scenario ? { scenario } : {});
  await establish(A); await invalidate(A);
  const back = await walkBack(A, stale, bad, label), fwd = await forward(A, stale, bad, label, choose, until);
  if (after) await after(A, bad, back, fwd);
  t.log(`${label}\n  Back ${back.join(' > ')}\n  fwd  ${fwd.join(' > ')}${bad.length ? '\n  ' + bad.join('\n  ') : ''}`);
  t.check(label, !bad.length, bad.join(' | ').slice(0, 1500));
}
const pickSvc = async (A, svc) => { if (!(await A.has('pick', svc))) await A.click('others'); await A.click('pick', svc); };
const toDetails = async (A, svc = 'github', v = 'hosted', addr) => { await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await A.service(svc, v, addr); await A.signIn(); await A.click('next', undefined, 'online-details'); };
const toReview = async (A) => { for (let i = 0; i < 8 && (await A.snap()).screen !== 'review'; i++) { await A.waitEnabled('next').catch(() => {}); await A.click('next'); await A.sleep(400); } await A.screen('review'); };
const toCreatingFailed = async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); await toReview(A); await A.waitEnabled('commit'); await A.click('commit', undefined, 'creating');
  await A.waitFor(() => ['failed', 'recovery', 'unknown'].includes(O55.S.sess.commit.state), null, 25000); await A.sleep(600); };
const name = { name: async (A) => { await A.fill('o55f-name', 'Fresh one'); await A.click('next'); } };
const fromBegin = async (A, sub) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'existing'); await A.click('sub', sub); };
const toRepoProject = async (A) => { await fromBegin(A, 'online'); await A.click('next', undefined, 'online-service'); await A.service('github', 'hosted'); await A.signIn(); await A.click('next', undefined, 'ex-repos');
  const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await A.click('next', undefined, 'name'); await toReview(A); };
const toFolderProject = async (A) => { await fromBegin(A, 'folder'); await A.click('next', undefined, 'ex-folder'); await A.click('pick', '~/Documents/recipe-app'); await A.click('next', undefined, 'name'); await toReview(A); };
const toKitRestore = async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'restore'); await A.click('next', undefined, 'r-source'); await A.click('source', 'kit'); await A.click('kit', 'kit-loom');
  await pressOn(A); await A.screen('r-pick'); const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await pressOn(A); await A.sleep(800); await toReview(A); };
const editBegin = (to) => async (A) => { await A.click('edit', 'begin', 'begin'); if (to === 'later') await A.click('later'); else { await A.click('pick', to); await A.click('next'); } await A.sleep(600); };
/* a beginning given up from Review's Edit: Back never walks its steps, and nothing of it reaches the new plan */
const abandoned = (steps) => async (A, bad, back) => { const hit = back.filter((x) => steps.includes(x)); if (hit.length) bad.push(`Back walks the abandoned beginning's steps: ${hit.join(', ')}`); };
/* a saved session at a later online screen, resumed with the chip (Route B and its later-screen companions) */
async function resumeAt(A, kind, at) {
  await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
  await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(800);
  await A.frame().evaluate(([kind, at]) => {
    const saved = O55.store.get('onboarding', null); saved.started = 'back-' + kind + '-' + at + '-' + Date.now(); saved.status = 'closed'; saved.screen = at;
    const svc = kind === 'retired' ? { forge: 'gitea', forge_provider_variant: 'gitea_cloud', forge_instance_url: 'https://retired.example.test' } : { forge: 'gitea', forge_provider_variant: 'gitea_self_managed', forge_instance_url: 'https://gitea.platyr.test' };
    const src = at === 'ex-repos';
    Object.assign(saved.drafts.main, svc, { online_mode: src ? 'existing' : 'new', forge_account_ref: 'account:x:jared' }, src ? { project_mode: 'existing_online', source_more: true } : {});
    saved.online = Object.assign({}, saved.online, { purpose: src ? 'source' : 'copy' });
    const base = (saved.history || []).filter((h) => !/^online|^ex-|^safe|^review/.test(h));
    saved.history = src ? base.filter((h) => h !== 'name').concat(['online-service', 'online-signin'])
      : base.concat(['safe', 'online-service', 'online-signin', 'online-details', 'safe', 'review']).slice(0, base.length + ['online-signin', 'online-details', 'safe', 'review'].indexOf(at) + 2);
    saved.signin = { service: 'gitea', kind: 'forge', state: 'done', account: 'jared', instance_key: 'gitea|' + svc.forge_provider_variant + '|' + svc.forge_instance_url };
    O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip();
  }, [kind, at]);
  await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1400);
}
const RETIRED_STALE = [{ on: 'online-signin|online-details|ex-repos|safe|review', x: 'retired.example.test' }, { on: 'online-signin|online-details|ex-repos|safe|review', x: 'Gitea Cloud' }];
const pickerOn = { 'online-service': async (A, s) => { if (s.acts.includes('notNow')) await A.click('notNow'); else { await A.click('pick', 'github'); await A.click('next'); } },
  'online-signin': async (A) => { await A.signIn(); await A.click('next'); },
  'ex-repos': async (A) => { const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); if (p) await A.click('pick', p.arg); await A.click('next'); } };

export const tests = {
  async 'row A · Safe › GitHub › sign in › details › Safe › Change › Not now, then Back to the start and on'(t) {
    await row(t, 'A', { establish: async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); }, invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); } });
  },
  async 'row B · a saved Safe naming retired hosted Gitea, resumed, Back to the start and on; the admitted own server still shows its steps'(t) {
    await row(t, 'B retired', { establish: (A) => resumeAt(A, 'retired', 'safe'), invalidate: async () => {}, stale: RETIRED_STALE, choose: pickerOn });
    await row(t, 'B admitted', { establish: (A) => resumeAt(A, 'admitted', 'review'), invalidate: async () => {}, after: async (A, bad, back) => { if (!back.includes('online-details')) bad.push('the admitted own server lost its details step: ' + back.join(' > ')); } });
  },
  async 'row 3 · another service after sign-in (GitHub › GitLab), and another own-server address, then Back and on'(t) {
    await row(t, '3 service', { establish: async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); },
      invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await pickSvc(A, 'gitlab'); await A.click('next', undefined, 'online-signin'); },
      stale: [{ on: 'online-details|online-signin|ex-repos|safe|review|away', x: 'GitHub' }, { on: 'online-details|safe|review', x: 'jared-p' }], choose: pickerOn });
    await row(t, '3 address', { establish: async (A) => { await toDetails(A, 'gitea', 'gitea_self_managed', 'https://gitea.platyr.test'); await A.click('next', undefined, 'safe'); },
      invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await A.fill('o55f-address', 'https://gitea2.platyr.test'); await A.click('next', undefined, 'online-signin'); },
      stale: [{ on: 'online-details|online-signin|ex-repos|safe|review|away', x: 'gitea.platyr.test' }], choose: pickerOn });
  },
  async 'row 4 · a failed online copy: Review again, Change the name, and Skip the online copy (name taken, network), then Back and on'(t) {
    await row(t, '4 review again', { scenario: 'fresh+nameTaken', establish: toCreatingFailed, invalidate: async (A) => { await A.click('reviewAgain', undefined, 'review'); } });
    await row(t, '4 skip (GitHub refused)', { scenario: 'fresh+nameTaken', establish: toCreatingFailed, invalidate: async (A) => { if (await A.has('askSkip')) await A.click('askSkip'); await A.click('skipOnline'); await A.sleep(1200); }, stale: [{ on: 'review|safe', x: 'jared-p' }] });
    await row(t, '4 change the name (GitHub)', { scenario: 'fresh+nameTaken', establish: toCreatingFailed, invalidate: async (A) => { await A.click('rename', undefined, 'online-details'); } });
    await row(t, '4 skip (network)', { scenario: 'fresh+flaky', establish: toCreatingFailed, invalidate: async (A) => { if (await A.has('askSkip')) await A.click('askSkip'); await A.click('skipOnline'); await A.sleep(1500); } });
  },
  async 'row 5 · the Project beginning changed from Review (online › Later, folder › New), then Back and on, and nothing of the old one comes back'(t) {
    await row(t, '5 online > Later', { establish: toRepoProject, invalidate: editBegin('later'), stale: [{ on: 'review|safe|name', x: 'jared-p' }, { on: 'review|safe', x: 'recipe-app' }], choose: name, after: abandoned(['online-service', 'online-signin', 'ex-repos']) });
    await row(t, '5 folder > New', { establish: toFolderProject, invalidate: editBegin('new'), stale: [{ on: 'review|name|safe|away', x: 'recipe-app' }], choose: name, after: abandoned(['ex-folder']) });
    /* and where Back still reaches the old folder step, Continue from it brings none of the old folder into the new Project */
    { const A = onboardingApp(t), bad = []; await A.boot(); await toFolderProject(A); await editBegin('new')(A); await A.fill('o55f-name', 'Fresh one'); await A.click('next'); await A.sleep(600);
      for (let i = 0; i < 10 && (await A.snap()).screen !== 'ex-folder' && (await look(A)).back; i++) await pressBack(A);
      const at = (await A.snap()).screen;
      if (at === 'ex-folder') { await pressOn(A); await A.sleep(700); }
      const fwd = await forward(A, [{ on: 'review|safe|name|away', x: 'recipe-app' }], bad, '5 folder > New, on from where Back stops', { name: async (A) => { await A.click('next'); } });
      t.log(`5 folder > New, on from where Back stops (${at})\n  fwd ${fwd.join(' > ')}${bad.length ? '\n  ' + bad.join('\n  ') : ''}`);
      t.check('5 folder > New: Continue from where Back stops keeps nothing of the old folder', !bad.length, bad.join(' | ')); }
  },
  async 'row 6 · the computer changed from Review (This computer › a Server), then Back and on'(t) {
    await row(t, '6', { establish: async (A) => { await A.toSafe('Notes'); await toReview(A); }, invalidate: async (A) => { await A.click('edit', 'where', 'where'); await A.click('pick', 'server'); await A.click('next'); await A.sleep(1500); },
      choose: { where: async (A) => { await A.click('pick', 'this'); await A.click('next'); } } });
  },
  async 'row 7 · NAS access path: SSH refused at install, Use a shared folder instead, then Back and on'(t) {
    await row(t, '7', { scenario: 'fresh+sshNotAllowed',
      establish: async (A) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find');
        await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000); await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity');
        await A.click('trust', undefined, 'nas-key'); await A.waitFor(() => Object.entries(O55.S.sess.ops || {}).some(([k, v]) => k.startsWith('keys:nas-home') && v.state === 'done'), null, 8000);
        await A.click('next', undefined, 'nas-signin'); await A.fill('o55f-user', 'jared'); await A.fill('o55f-pw', 'correct horse'); await pressOn(A);
        await A.waitFor(() => !!document.querySelector('.o55-layer:not(.o55-out) [data-o55-do="useSmb"]'), null, 15000); },
      invalidate: async (A) => { await A.click('useSmb', undefined, 'nas-find'); },
      stale: [{ on: 'nas-smb|name|safe|review', x: 'SSH key' }],
      choose: { 'nas-find': async (A) => { const sh = (await A.snap()).buttons.find((b) => b.action === 'share'); if (sh) await A.click('share', sh.arg); await pressOn(A); },
        'nas-smb': async (A) => { for (const f of (await A.snap()).fields) if (f.type === 'password' || f.type === 'text') await A.fill(f.id, f.type === 'password' ? 'correct horse' : f.value || 'jared'); await A.sleep(300); await pressOn(A);
          await A.waitFor(() => !!document.querySelector('.o55-foot [data-o55-do="use"]'), null, 10000); },
        'nas-folder': async (A) => { const s = await A.snap(); const cd = s.buttons.find((b) => b.action === 'cd'); if (cd) await A.click('cd', cd.arg); await A.click('use'); }, ...name },
      after: async (A, bad, back) => { const hit = back.filter((x) => ['nas-identity', 'nas-key', 'nas-signin', 'nas-install'].includes(x)); if (hit.length) bad.push('Back walks the SSH steps after Use a shared folder: ' + hit.join(', ')); } });
  },
  async 'row 8 · backup place changed on Safe (Home NAS › Google Drive), and a restore given up from Review, then Back and on'(t) {
    await row(t, '8 backup place', { establish: async (A) => { await A.toSafe('Notes'); await A.click('backup'); await A.click('bdest', 'nas'); },
      invalidate: async (A) => { await A.click('bdest', 'gdrive'); }, stale: [{ on: 'review', x: 'Home NAS' }] });
    await row(t, '8 restore given up', { establish: toKitRestore, invalidate: editBegin('new'), stale: [{ on: 'review|safe|name', x: 'Loom' }], choose: name, after: abandoned(['r-source', 'r-unlock', 'r-pick', 'r-preview']) });
  },
  async 'row 9 · saved sessions resumed at the picker, sign-in, details, Safe, Review and the repository list (retired hosted Gitea; admitted own server), then Back and on'(t) {
    for (const [kind, at] of [['retired', 'online-signin'], ['retired', 'online-details'], ['retired', 'review'], ['retired', 'ex-repos'], ['admitted', 'online-details'], ['admitted', 'ex-repos']])
      await row(t, `9 ${kind} at ${at}`, { establish: (A) => resumeAt(A, kind, at), invalidate: async () => {}, stale: kind === 'retired' ? RETIRED_STALE : [],
        choose: Object.assign({ name: async (A) => { await A.fill('o55f-name', 'Notes'); await A.click('next'); } }, pickerOn) });
  }
};
