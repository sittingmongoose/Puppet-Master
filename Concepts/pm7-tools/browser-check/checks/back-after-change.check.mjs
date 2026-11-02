import { onboardingApp } from '../helpers/onboarding-fields.mjs';
// Back after a change (final-onb BACK-STATE-GAPS-78C, FO-22's class): a finished subflow is invalidated, then Back walks
// all the way to the start of history and the wizard goes forward again. Every row uses real clicks. A saved session is
// browser-written where a public route makes one (walked by clicks, Close, then the Resume chip); one naming a retired
// service has no public route, so it is constructed in the page's store and resumed with the chip, and labelled so. Each screen Back or forward paints
// is judged the same way: no raw {placeholder}, i18n key, enum key, "none", undefined or null in its visible text; no
// address or account of the invalidated answer; every Back press moves; and a Continue that is refused says why and has a
// way on. Forward drives to Review, choosing only where a screen asks for a choice. Each row with an Edit or a change
// first keeps the same answer through it twice (Sol's repeated Edit at bf05a56258), then changes it; and an abandoned
// screen forced onto the page anyway (as a wrong history would) must write nothing when its option and Continue are
// pressed: no draft, session or owner operation changes.
const LOOK = () => {
  const S = O55.S, l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), txt = l ? l.innerText : '';
  const vis = (e) => !!e && !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  const on = (x) => vis(x) && !x.disabled && x.getAttribute('aria-disabled') !== 'true';
  const acts = [...(l ? l.querySelectorAll('[data-o55-do], input, textarea') : [])].filter(on).map((x) => x.matches('[data-o55-do]') ? x.getAttribute('data-o55-do') + (x.getAttribute('data-arg') ? ':' + x.getAttribute('data-arg') : '') : 'field:' + x.id);
  const prim = l && l.querySelector('.o55-foot .o55-primary'), back = l && [...l.querySelectorAll('[data-o55-do="back"]')].find(vis);
  const ns = Object.keys(O55.copy || {}).join('|');
  const raw = [...txt.matchAll(new RegExp('\\{[a-zA-Z_]+\\}|\\b(?:undefined|null|NaN|none)\\b|\\b(?:' + ns + ')\\.[a-zA-Z]\\w*(?:\\.\\w+)*\\b|\\b[a-z]+(?:_[a-z]+)+\\b', 'g'))].map((m) => m[0]);
  const reason = (prim && !on(prim) ? prim.getAttribute('data-disabled-reason') || '' : '') + [...document.querySelectorAll('.o55-reason-show, .o55-layer:not(.o55-out) .o55-err')].map((x) => x.textContent.trim()).filter(Boolean).join(' / ');
  return { screen: S.sess.screen, title: (((l && l.querySelector('.o55-title')) || {}).textContent || '').trim(), raw, text: txt, acts, primary: prim ? { on: on(prim) } : null, back: on(back), reason };
};
/* (a screen change has finished: no outgoing layer, the current one settled) */
const look = async (A) => { await A.sleep(450); await A.frame().waitForFunction(() => !document.querySelector('.o55-pane > .o55-layer.o55-out, .o55-pane > .o55-layer.o55-hold'), null, { timeout: 4000 }).catch(() => {}); return A.frame().evaluate(LOOK); };
const judge = (s, stale, where, bad) => {
  if (s.raw.length) bad.push(`${where} ${s.screen} "${s.title}": raw ${JSON.stringify([...new Set(s.raw)])}`);
  for (const e of stale) if ((!e.on || new RegExp('^(' + e.on + ')$').test(s.screen)) && s.text.includes(e.x)) bad.push(`${where} ${s.screen} "${s.title}": stale "${e.x}"`);
};
const pressBack = (A) => A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="back"]').filter({ visible: true }).first().click();
const pressOn = (A) => A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary').first().click();
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
/* Back to the start as walkBack does, and at each stop Continue once and Back again: going on from any screen Back still
   reaches must not bring the given-up answer back (canon FO-22). Never on Review or after it: that Continue creates. */
const NO_CONTINUE = ['welcome', 'look', 'review', 'creating', 'protect', 'ai', 'ai-all', 'ai-none', 'free', 'ready'];
async function walkBackContinuing(A, stale, bad, label, back) {
  const seq = []; let s = await look(A);
  for (let i = 0; i < 40; i++) {
    seq.push(s.screen); judge(s, stale, label + ' Back#' + i, bad);
    if (!NO_CONTINUE.includes(s.screen) && s.primary && s.primary.on) {
      await pressOn(A); const n = await look(A), v = await back(A);
      if (v) bad.push(`${label} Back#${i}: Continue on ${s.screen} ${v}`);
      if (n.screen !== s.screen && n.back) { await pressBack(A); const r = await look(A); if (r.screen !== s.screen) { bad.push(`${label} Back#${i}: Back after Continue on ${s.screen} went to ${r.screen}`); s = r; continue; } }
    }
    if (!s.back) break;
    await pressBack(A); const was = s.screen; s = await look(A);
    if (s.screen === was) { bad.push(`${label} Back#${i}: Back on ${was} went nowhere`); break; }
  }
  return seq;
}
const copyGone = (A) => A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return d.online_mode === 'none' ? null : `brought the online copy back (${d.online_mode}, ${d.forge})`; });
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
async function row(t, label, { scenario, establish, keep, times = 2, invalidate, stale = [], choose = {}, until = 'review', after, force = [], noReturn }) {
  const A = onboardingApp(t), bad = []; await A.boot(scenario ? { scenario } : {});
  await establish(A); if (keep) for (let i = 0; i < times; i++) await keep(A, i);
  await invalidate(A);
  const back = noReturn ? await walkBackContinuing(A, stale, bad, label, noReturn) : await walkBack(A, stale, bad, label), fwd = await forward(A, stale, bad, label, choose, until);
  if (noReturn) { const v = await noReturn(A); if (v) bad.push(`${label}: at the end the plan ${v}`); }
  if (after) await after(A, bad, back, fwd);
  for (const id of force) await forceStale(A, id, bad, label);
  t.log(`${label}\n  Back ${back.join(' > ')}\n  fwd  ${fwd.join(' > ')}${bad.length ? '\n  ' + bad.join('\n  ') : ''}`);
  await t.check(label, !bad.length, bad.join(' | ').slice(0, 1500));
}
/* the abandoned screen reached anyway, as a wrong history would reach it. Shown: it gives way to a screen on the active
   branch and nothing is written, not even what drawing it would fill in; or, where it does draw, its option and
   Continue write nothing. Held as the current screen without drawing: each of its own actions is refused and writes
   nothing. */
const STATE = () => { const s = O55.S.sess; return { draft: s.drafts.main, connect: s.drafts.connect, folderInfo: s.folderInfo || null, restore: s.restore || null, nas: s.nas || null, backup: s.backup || null, commit: s.commit || null, online: s.online || null, ops: Object.keys(s.ops || {}).sort() }; };
const delta = (before, after) => { const changed = Object.keys(before).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  return changed.map((k) => k === 'draft' ? 'draft(' + Object.keys(after.draft).filter((x) => JSON.stringify(before.draft[x]) !== JSON.stringify(after.draft[x])).slice(0, 5).map((x) => x + '=' + JSON.stringify(after.draft[x])).join(', ') + ')'
    : k + ' ' + JSON.stringify(before[k]).slice(0, 70) + ' > ' + JSON.stringify(after[k]).slice(0, 70)); };
async function forceStale(A, id, bad, label) {
  const L = '.o55-pane > .o55-layer:not(.o55-out) ', was = await A.frame().evaluate(() => O55.S.sess.screen);
  let before = await A.frame().evaluate(STATE);
  await A.frame().evaluate((id) => { O55.S.sess.screen = id; O55.ui.transition('fwd'); }, id); await A.sleep(1000);
  const shown = await A.frame().evaluate(() => ({ screen: O55.S.sess.screen, on: !O55.ui.onBranch || O55.ui.onBranch(O55.S.sess.screen) }));
  if (shown.screen === id) {
    const s = await look(A);
    for (const f of s.acts.filter((a) => a.startsWith('field:') && a.length > 6)) await A.frame().locator('#' + f.slice(6)).fill('stale-' + f.slice(6)).catch(() => {});
    const opt = s.acts.find((a) => !/^(back|tip|help|look|close|sound|demoHint|details|others|more|adv|field:|next|use|commit)/.test(a));
    if (opt) { const [act, ...rest] = opt.split(':'), arg = rest.join(':'); await A.frame().locator(L + `[data-o55-do="${act}"]` + (arg ? `[data-arg=${JSON.stringify(arg)}]` : '')).first().click({ timeout: 3000 }).catch(() => {}); await A.sleep(400); }
    await A.frame().locator('.o55-foot .o55-primary').first().click({ timeout: 3000 }).catch(() => {}); await A.sleep(1500);
    const d = delta(before, await A.frame().evaluate(STATE));
    if (d.length) bad.push(`${label}: the abandoned ${id} was drawn when reached anyway, and its ${opt || 'option'} and Continue wrote ${d.join('; ')}`);
    else bad.push(`${label}: the abandoned ${id} was drawn when reached anyway`);
  } else {
    const d = delta(before, await A.frame().evaluate(STATE));
    if (!shown.on) bad.push(`${label}: the abandoned ${id} gave way to ${shown.screen}, which is off the branch too`);
    if (d.length) bad.push(`${label}: the abandoned ${id}, reached anyway, wrote ${d.join('; ')}`);
  }
  /* held as the current screen, not drawn: every action of its own is refused */
  before = await A.frame().evaluate(STATE);
  const ran = await A.frame().evaluate((id) => {
    const S = O55.S, layer = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), keep = S.sess.screen, def = O55.screens.defs[id], out = [];
    if (layer) layer.setAttribute('inert', ''); S.sess.screen = id;
    for (const a of Object.keys((def && def.do) || {})) { let r; try { r = O55.ui.act(a, null); } catch (e) { r = 'threw'; } if (r !== false) out.push(a); if (S.sess.screen !== id) S.sess.screen = id; }
    S.sess.screen = keep; if (layer) layer.removeAttribute('inert');
    return out;
  }, id);
  const d2 = delta(before, await A.frame().evaluate(STATE));
  if (ran.length || d2.length) bad.push(`${label}: the abandoned ${id}, held anyway, ran ${ran.join(', ') || 'nothing'}${d2.length ? ' and wrote ' + d2.join('; ') : ''}`);
  await A.frame().evaluate((was) => { O55.S.sess.screen = was; O55.ui.transition('back'); }, was); await A.sleep(600);
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
/* a session the page itself wrote: walked by clicks to the screen with an admitted own Gitea server, Close pressed, then
   resumed by the Resume chip's click */
const GITEA = 'https://gitea.platyr.test';
async function writtenAt(A, at) {
  if (at === 'ex-repos') { await fromBegin(A, 'online'); await A.click('next', undefined, 'online-service'); await A.service('gitea', null, GITEA); await A.signIn(); await A.click('next', undefined, 'ex-repos'); }
  else {
    await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    if (at === 'online-service') { await pickSvc(A, 'gitea'); await A.fill('o55f-address', GITEA); await A.sleep(300); }
    else { await A.service('gitea', null, GITEA); if (at !== 'online-signin') { await A.signIn(); await A.click('next', undefined, 'online-details');
      if (at !== 'online-details') { await A.click('next', undefined, 'safe'); if (at === 'review') await toReview(A); } } }
  }
  await A.screen(at); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
  await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click({ timeout: 10000 }); await A.sleep(1400);
}
const RETIRED_STALE = [{ on: 'online-signin|online-details|ex-repos|safe|review', x: 'retired.example.test' }, { on: 'online-signin|online-details|ex-repos|safe|review', x: 'Gitea Cloud' }];
const pickerOn = { 'online-service': async (A, s) => { if (s.acts.includes('notNow')) await A.click('notNow'); else { await A.click('pick', 'github'); await A.click('next'); } },
  'online-signin': async (A) => { await A.signIn(); await A.click('next'); },
  'ex-repos': async (A) => { const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); if (p) await A.click('pick', p.arg); await A.click('next'); } };

/* the same answer kept through its Edit or change */
/* the sign-in screen met again: the known account (Use jared-p) or the done sign-in goes on with Continue */
const signedIn = async (A) => { if (await A.has('signIn') && !(await A.frame().evaluate(() => O55.S.sess.signin.state === 'done'))) await A.signIn(); await A.waitEnabled('next'); await A.click('next'); await A.sleep(800); };
const settle = async (A, ids, ms = 15000) => A.waitFor((ids) => ids.includes(O55.S.sess.screen) && !document.querySelector('.o55-layer.o55-hold'), ids, ms);
const keepCopy = async (A) => { await A.click('online', undefined, 'online-service'); await A.click('next'); await settle(A, ['online-signin', 'online-details']);
  if ((await A.snap()).screen === 'online-signin') await signedIn(A); await A.screen('online-details'); await A.click('next', undefined, 'safe'); };
const keepFolder = async (A) => { await A.click('edit', 'begin', 'begin'); await A.click('next', undefined, 'ex-folder'); await A.click('pick', '~/Documents/recipe-app'); await A.click('next'); await toReview(A); };
const keepRepo = async (A) => { await A.click('edit', 'begin', 'begin'); await A.click('next', undefined, 'online-service'); await A.click('next'); await settle(A, ['online-signin', 'ex-repos']);
  if ((await A.snap()).screen === 'online-signin') await signedIn(A); await A.screen('ex-repos'); const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await A.click('next'); await toReview(A); };
const keepRestore = async (A) => { await A.click('edit', 'begin', 'begin'); await A.click('next', undefined, 'r-source'); await A.click('source', 'kit'); await A.click('kit', 'kit-loom'); await pressOn(A); await A.screen('r-pick');
  const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await pressOn(A); await A.sleep(800); await toReview(A); };
/* a Project on Home NAS over SSH, walked by clicks to its folder; again from Begins as with the same device and folder */
const throughNas = async (A) => {
  for (let i = 0; i < 14; i++) {
    const s = await A.snap();
    if (['name', 'review', 'like', 'safe'].includes(s.screen)) return;
    if (s.screen === 'nas-identity') { if (await A.has('trust')) await A.click('trust'); else await pressOn(A); }
    else if (s.screen === 'nas-key') { await A.waitFor(() => Object.entries(O55.S.sess.ops || {}).some(([k, v]) => k.startsWith('keys:nas-home') && v.state === 'done'), null, 8000); await A.waitEnabled('next').catch(() => {}); await pressOn(A); }
    else if (s.screen === 'nas-signin') { if (await A.frame().locator('#o55f-user').count()) await A.fill('o55f-user', 'jared'); if (await A.frame().locator('#o55f-pw').count()) await A.fill('o55f-pw', 'correct horse'); await pressOn(A); }
    else if (s.screen === 'nas-install') { await A.waitFor(() => { const b = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary'); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, null, 15000); await pressOn(A); }
    else if (s.screen === 'nas-folder') { if (await A.has('cd', '/volume1/projects')) await A.click('cd', '/volume1/projects'); await A.click('use'); }
    else await pressOn(A);
    await A.sleep(900);
  }
};
const toNasProject = async (A) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
  await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); await toReview(A); };
const keepNas = async (A) => { await A.click('edit', 'begin', 'begin'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
  await A.waitEnabled('next'); await pressOn(A); await A.sleep(900); await throughNas(A); await toReview(A); };
const NAS_STEPS = ['nas-find', 'nas-identity', 'nas-key', 'nas-signin', 'nas-install', 'nas-pmpair', 'nas-folder', 'nas-smb', 'nas-nfs', 'nas-mounted'];
/* ---------------------------------------------------------------- every Review Edit target (row 10)
   final-onb's BACK-STATE-BF05 reconciliation lists the Review Edit sequences; rows 5, 6 and 8 run Begins as, This
   computer › a Server and the kit restore. Row 10 runs the rest: each Edit kept twice with the same answer, then changed. */
const onToReview = async (A, choose = {}) => { for (let i = 0; i < 14; i++) { const s = await A.snap(); if (s.screen === 'review') return; if (choose[s.screen]) { await choose[s.screen](A, s); delete choose[s.screen]; } else { await A.waitEnabled(s.primary && s.primary.action || 'next').catch(() => {}); await pressOn(A); } await A.sleep(700); } await A.screen('review'); };
const viaReview = (target, fn) => async (A) => { await A.screen('review'); await A.click('edit', target); await A.sleep(700); await fn(A); await A.sleep(400); if ((await A.snap()).screen !== 'review') await onToReview(A); };
const stay = async () => {};
/* a new Server on Home NAS: the concept host's owner answers stand in for the Server, as tools/scenarios.mjs's
   finishServerSetup gives them (a disclosed fixture); every step is a click */
const ownerAnswers = (A, key) => A.frame().evaluate((key) => { const S = O55.S, req = S.sess.server[key]; if (!req) throw new Error('no owner request ' + key); const ref = 'fixture:' + req.id;
  const res = Object.assign({}, req, { id: ref + ':result', requestId: req.id, outcome: 'ok', postcondition: { ok: true, evidence: ref + ':postcondition' } });
  if (req.operation === 'cmd.client.pair.start') { res.pairing_run = { id: ref + ':pairing-run', state: 'waiting', server: req.server, candidate: req.candidate, generation: req.generation, expires_at: Date.now() + 120000 }; res.identity = { words: 'river candle orbit' }; }
  else if (req.operation === 'cmd.client.pair.approve') res.trust = { id: ref + ':trust', server: req.server, client: req.client, candidate: req.candidate, run_id: req.run_id };
  O55.ownerResults.inject(res); }, key);
const retry = async (A) => { if (await A.has('retry')) await A.click('retry'); else await A.frame().evaluate(() => O55.ui.act('retry')); await A.sleep(500); };
async function toNewServer(A) {
  await A.click('pick', 'server'); await A.click('next', undefined, 's-kind'); await pressOn(A); await A.sleep(600);
  await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:new"]'), null, 8000); await A.click('pick', 'pm:new'); await pressOn(A); await A.sleep(600);
  await A.fill('o55f-code', '482 913'); await pressOn(A);
  /* the page's concept host answers the Server's owner requests itself; where one is left pending, the fixture answers it */
  for (let i = 0; i < 30 && (await A.snap()).screen !== 's-ready'; i++) {
    const st = await A.frame().evaluate(() => { const v = O55.S.sess.server; return { claim: v.orClaimErr, boot: v.orBootErr, run: v.orRunErr, approve: v.orApproveErr, runOk: !!v.orRunOk, self: !!v.selfConfirmed }; });
    if (st.claim === 'pending_no_result') { await ownerAnswers(A, 'orClaimReq'); await retry(A); }
    else if (st.boot === 'pending_no_result') { await ownerAnswers(A, 'orBootReq'); await retry(A); }
    else if (st.run === 'pending_no_result') { await ownerAnswers(A, 'orRunReq'); await retry(A); }
    else if (st.approve === 'pending_no_result') { await ownerAnswers(A, 'orApproveReq'); await pressOn(A); }
    else if (st.runOk && !st.self && await A.has('selfMatch')) { await A.click('selfMatch'); await A.sleep(300); await pressOn(A); }
    await A.sleep(700);
  }
  await A.screen('s-ready'); await pressOn(A); await A.screen('begin');
}
const SERVER_STEPS = ['s-kind', 's-wait', 's-confirm', 's-ready'];
const toNameNas = async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Book club site');
  await A.click('change'); await A.click('loc', 'network', 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
  await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); await onToReview(A); };
/* ---------------------------------------------------------------- forward re-entry and cross-kind switches (row 11)
   Sol's FO22-A2/A3 at e9b704975a: an answer given up, then the same kind chosen again, revived the old pick with Continue
   on; another kind kept the old online repository. A re-entered picker chooses nothing, Continue off; after an explicit
   pick, neither the draft nor Review holds anything of the abandoned answer. */
const PICKS = '[data-o55-do="pick"],[data-o55-do="device"],[data-o55-do="source"],[data-o55-do="kit"],[data-o55-do="volume"],[data-o55-do="share"]';
async function emptyPicker(A, bad, label) {
  const r = await A.frame().evaluate((PICKS) => { const l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), p = l && l.querySelector('.o55-foot .o55-primary');
    const picked = [...l.querySelectorAll(PICKS)].filter((x) => x.getAttribute('aria-checked') === 'true' || x.classList.contains('o55-on')).map((x) => x.getAttribute('data-o55-do') + ':' + x.getAttribute('data-arg'));
    return { screen: O55.S.sess.screen, picked, on: !!p && !p.disabled && p.getAttribute('aria-disabled') !== 'true' }; }, PICKS);
  if (r.picked.length || r.on) bad.push(`${label}: ${r.screen} re-entered with ${r.picked.join(', ') || 'nothing'} chosen and Continue ${r.on ? 'on' : 'off'}`);
  return r;
}
async function noStale(A, bad, label, forbid) {
  await A.screen('review');
  const r = await A.frame().evaluate(() => ({ draft: JSON.stringify(O55.S.sess.drafts.main), review: document.querySelector('.o55-pane > .o55-layer:not(.o55-out)').innerText }));
  for (const x of forbid) { if (r.draft.toLowerCase().includes(x.toLowerCase())) bad.push(`${label}: the draft still holds "${x}" (${(r.draft.match(new RegExp('"[a-z_]+":[^,]{0,40}' + x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'i')) || [''])[0]})`);
    if (r.review.includes(x)) bad.push(`${label}: Review still shows "${x}"`); }
}
const editBeginTo = async (A) => { await A.screen('review'); await A.click('edit', 'begin', 'begin'); };
const goNew = async (A) => { await editBeginTo(A); await A.click('pick', 'new'); await A.click('next'); await A.sleep(500); if ((await A.snap()).screen === 'name') { await A.fill('o55f-name', 'Fresh one'); await A.click('next'); } await onToReview(A); };
const goFolder = async (A, bad, label, path) => { await editBeginTo(A); await A.click('pick', 'existing'); await A.click('sub', 'folder'); await A.click('next', undefined, 'ex-folder'); await A.sleep(400);
  if (bad) await emptyPicker(A, bad, label); await A.click('pick', path); await A.waitEnabled('next'); await A.click('next'); await onToReview(A, { name: async (A) => { await A.fill('o55f-name', 'Fresh one'); await A.click('next'); } }); };
const goOnline = async (A, bad, label, idx) => { await editBeginTo(A); await A.click('pick', 'existing'); await A.click('sub', 'online'); await A.click('next', undefined, 'online-service'); await A.sleep(400);
  if (bad) await emptyPicker(A, bad, label + ' (service)'); await A.click('pick', 'github'); await A.click('next'); await settle(A, ['online-signin', 'ex-repos']); if ((await A.snap()).screen === 'online-signin') await signedIn(A); await A.screen('ex-repos'); await A.sleep(400);
  if (bad) await emptyPicker(A, bad, label + ' (repository)'); const ps = (await A.snap()).buttons.filter((b) => b.action === 'pick'); await A.click('pick', ps[idx].arg); await A.waitEnabled('next'); await A.click('next');
  await onToReview(A, { name: async (A) => { if (!(await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name))) await A.fill('o55f-name', 'Fresh one'); await A.click('next'); } }); };
const goRestore = async (A, bad, label) => { await editBeginTo(A); await A.click('pick', 'restore'); await A.click('next', undefined, 'r-source'); await A.sleep(400);
  if (bad) await emptyPicker(A, bad, label + ' (where the backup is)'); await A.click('source', 'kit'); await A.click('kit', 'kit-loom'); await pressOn(A); await A.screen('r-pick'); await A.sleep(400);
  if (bad) await emptyPicker(A, bad, label + ' (which backup)'); const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await pressOn(A); await A.sleep(800);
  await onToReview(A, { name: async (A) => { if (!(await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name))) await A.fill('o55f-name', 'Fresh one'); await A.click('next'); } }); };
const goNas = async (A, bad, label) => { await editBeginTo(A); await A.click('pick', 'existing'); await A.click('sub', 'device'); await A.click('next', undefined, 'nas-find');
  await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000); await A.sleep(400); if (bad) await emptyPicker(A, bad, label + ' (device)');
  await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); await onToReview(A, { name: async (A) => { if (!(await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name))) await A.fill('o55f-name', 'Fresh one'); await A.click('next'); } }); };
async function flow(t, label, fn) { const A = onboardingApp(t), bad = []; await A.boot(); await fn(A, bad); t.log(label + (bad.length ? '\n  ' + bad.join('\n  ') : ': clean')); await t.check(label, !bad.length, bad.join(' | ').slice(0, 1500)); }
const keepWhere = async (A) => { await A.click('edit', 'where', 'where'); await A.click('pick', 'this'); await A.click('next'); await toReview(A); };
/* (the owner fixture's network failure is one-shot: it is armed again for each repeated attempt, a disclosed fixture) */
const keepAttempt = async (A) => { await A.click('reviewAgain', undefined, 'review'); await A.frame().evaluate(() => { O55.S.env.failures.online_copy = 'network'; }); await A.waitEnabled('commit'); await A.click('commit', undefined, 'creating');
  await A.waitFor(() => ['failed', 'recovery', 'unknown'].includes(O55.S.sess.commit.state), null, 25000); await A.sleep(600); };

export const tests = {
  async 'row A · Safe › GitHub › sign in › details › Safe › Change kept twice › Change › Not now, then Back to the start (Continue tried at each stop) and on'(t) {
    await row(t, 'A', { establish: async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); }, keep: keepCopy,
      invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); }, force: ['online-details', 'online-service'],
      noReturn: copyGone, after: abandoned(['online-service', 'online-signin', 'online-details']) });
  },
  async 'row B · a saved Safe naming retired hosted Gitea (constructed record), resumed, Back to the start and on; an admitted own server saved at Review (constructed) still shows its steps'(t) {
    await row(t, 'B retired', { establish: (A) => resumeAt(A, 'retired', 'safe'), invalidate: async () => {}, stale: RETIRED_STALE, choose: pickerOn });
    await row(t, 'B admitted', { establish: (A) => resumeAt(A, 'admitted', 'review'), invalidate: async () => {}, after: async (A, bad, back) => { if (!back.includes('online-details')) bad.push('the admitted own server lost its details step: ' + back.join(' > ')); } });
  },
  async 'row 3 · the service kept twice, then another (GitHub › GitLab); the own-server address kept twice, then another, then Back and on'(t) {
    await row(t, '3 service', { establish: async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); }, keep: keepCopy,
      invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await pickSvc(A, 'gitlab'); await A.click('next', undefined, 'online-signin'); },
      stale: [{ on: 'online-details|online-signin|ex-repos|safe|review|away', x: 'GitHub' }, { on: 'online-details|safe|review', x: 'jared-p' }], choose: pickerOn });
    await row(t, '3 address', { establish: async (A) => { await toDetails(A, 'gitea', 'gitea_self_managed', 'https://gitea.platyr.test'); await A.click('next', undefined, 'safe'); }, keep: keepCopy,
      invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await A.fill('o55f-address', 'https://gitea2.platyr.test'); await A.click('next', undefined, 'online-signin'); },
      stale: [{ on: 'online-details|online-signin|ex-repos|safe|review|away', x: 'gitea.platyr.test' }], choose: pickerOn });
  },
  async 'row 4 · a failed online copy (network: reviewed again twice first; name taken), then Review again, Change the name or Skip the online copy (no copy step left on Back, Continue tried at each stop), then Back and on'(t) {
    /* (a taken name is not tried again as it was: its attempts repeat on the network failure) */
    await row(t, '4 review again (network)', { scenario: 'fresh+flaky', establish: toCreatingFailed, keep: keepAttempt, invalidate: async (A) => { await A.click('reviewAgain', undefined, 'review'); }, force: ['creating'] });
    await row(t, '4 review again (name taken)', { scenario: 'fresh+nameTaken', establish: toCreatingFailed, invalidate: async (A) => { await A.click('reviewAgain', undefined, 'review'); }, force: ['creating'] });
    await row(t, '4 change the name (GitHub)', { scenario: 'fresh+nameTaken', establish: toCreatingFailed, invalidate: async (A) => { await A.click('rename', undefined, 'online-details'); } });
    /* Skip the online copy gives the copy up: its picker, sign-in and details leave Back, and Continue from every screen
       Back still reaches leaves it given up (final-onb's FO-22 witness at bf05a56258: the picker came back with GitHub
       chosen and Continue on) */
    await row(t, '4 skip (GitHub refused)', { scenario: 'fresh+nameTaken', establish: toCreatingFailed, invalidate: async (A) => { if (await A.has('askSkip')) await A.click('askSkip'); await A.click('skipOnline'); await A.sleep(1200); }, stale: [{ on: 'review|safe', x: 'jared-p' }],
      noReturn: copyGone, after: abandoned(['online-service', 'online-signin', 'online-details']), force: ['online-service'] });
    await row(t, '4 skip (network)', { scenario: 'fresh+flaky', establish: toCreatingFailed, keep: keepAttempt, invalidate: async (A) => { if (await A.has('askSkip')) await A.click('askSkip'); await A.click('skipOnline'); await A.sleep(1500); },
      after: async (A, bad) => { const v = await copyGone(A); if (v) bad.push('4 skip (network): the plan ' + v); } });
  },
  async 'row 5 · every Begins-as source kept twice from Review, then changed (online › Later, folder › New, Home NAS › New and › Later, restore › Later; restore › New is row 8), and folder › New › folder › New, Later › online again; Back and on, and nothing of the old one comes back'(t) {
    await row(t, '5 online > Later', { establish: toRepoProject, keep: keepRepo, invalidate: editBegin('later'), stale: [{ on: 'review|safe|name', x: 'jared-p' }, { on: 'review|safe', x: 'recipe-app' }], choose: name,
      after: abandoned(['online-service', 'online-signin', 'ex-repos']), force: ['ex-repos'] });
    await row(t, '5 folder > New', { establish: toFolderProject, keep: keepFolder, invalidate: editBegin('new'), stale: [{ on: 'review|name|safe|away', x: 'recipe-app' }], choose: name, after: abandoned(['ex-folder']), force: ['ex-folder'] });
    /* Home NAS (final-onb's FO-22 witness at bf05a56258: Back reached the old "Choose a folder on Home NAS"), kept twice,
       then New and then Later; and a restore kept twice, then Later (row 8 gives it up for New) */
    await row(t, '5 NAS > New', { establish: toNasProject, keep: keepNas, invalidate: editBegin('new'), stale: [{ on: 'review|name|safe|away', x: 'Home NAS' }], choose: name, after: abandoned(NAS_STEPS), force: ['nas-folder'] });
    await row(t, '5 NAS > Later', { establish: toNasProject, keep: keepNas, invalidate: editBegin('later'), stale: [{ on: 'review|safe|away', x: 'Home NAS' }], choose: name, after: abandoned(NAS_STEPS), force: ['nas-folder'] });
    await row(t, '5 restore > Later', { establish: toKitRestore, keep: keepRestore, invalidate: editBegin('later'), stale: [{ on: 'review|safe', x: 'Loom' }], choose: name, after: abandoned(['r-source', 'r-unlock', 'r-pick', 'r-preview']), force: ['r-pick'] });
    /* answers changed back and forth: every segment of each abandoned answer goes, the one returned to keeps its own */
    await row(t, '5 folder > New > folder > New', { establish: toFolderProject, keep: async (A, i) => { await keepFolder(A); if (i === 0) { await editBegin('new')(A); await A.fill('o55f-name', 'Fresh one'); await A.click('next'); await toReview(A);
        await A.click('edit', 'begin', 'begin'); await A.click('pick', 'existing'); await A.click('sub', 'folder'); await A.click('next', undefined, 'ex-folder'); await A.click('pick', '~/Documents/recipe-app'); await A.click('next'); await toReview(A); } },
      invalidate: editBegin('new'), stale: [{ on: 'review|name|safe|away', x: 'recipe-app' }], choose: name, after: abandoned(['ex-folder']), force: ['ex-folder'] });
    /* going on after Later to the same kind of beginning brings back neither the old repository nor its name (canon FO-22:
       forward never silently reinstates the abandoned branch or its source) */
    { const A = onboardingApp(t), bad = []; await A.boot(); await toRepoProject(A); await keepRepo(A); await editBegin('later')(A); await A.screen('review');
      if (await A.has('edit', 'begin')) await A.click('edit', 'begin', 'begin'); else for (let i = 0; i < 6 && (await A.snap()).screen !== 'begin'; i++) await pressBack(A);
      await A.screen('begin'); await A.click('pick', 'existing'); await A.click('sub', 'online'); await A.click('next', undefined, 'online-service'); await A.sleep(400);
      await emptyPicker(A, bad, '5 online > Later > online again (service)'); await A.click('pick', 'github'); await A.click('next');
      await settle(A, ['online-signin', 'ex-repos']); if ((await A.snap()).screen === 'online-signin') await signedIn(A); await A.screen('ex-repos');
      const r = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main, l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), p = document.querySelector('.o55-foot .o55-primary');
        return { repo: d.repository_ref, name: d.project_name, picked: [...l.querySelectorAll('[data-o55-do="pick"][aria-checked="true"], [data-o55-do="pick"].o55-on')].map((x) => x.getAttribute('data-arg')), on: !!p && !p.disabled && p.getAttribute('aria-disabled') !== 'true' }; });
      if (r.repo || r.picked.length || r.on || r.name === 'Recipe app') bad.push(`after Later, the repository list again holds the old choice: ${JSON.stringify(r)}`);
      t.log('5 online > Later > online again: ' + JSON.stringify(r));
      await t.check('5 online (kept twice) > Later > online again: the old repository and its name do not come back', !bad.length, bad.join(' | ')); }
    /* and where Back still reaches the old folder step, Continue from it brings none of the old folder into the new Project */
    { const A = onboardingApp(t), bad = []; await A.boot(); await toFolderProject(A); await keepFolder(A); await editBegin('new')(A); await A.fill('o55f-name', 'Fresh one'); await A.click('next'); await A.sleep(600);
      for (let i = 0; i < 12 && (await A.snap()).screen !== 'ex-folder' && (await look(A)).back; i++) await pressBack(A);
      const at = (await A.snap()).screen;
      if (at === 'ex-folder') { await pressOn(A); await A.sleep(700); }
      const fwd = await forward(A, [{ on: 'review|safe|name|away', x: 'recipe-app' }], bad, '5 folder > New, on from where Back stops', { name: async (A) => { await A.click('next'); } });
      t.log(`5 folder > New, on from where Back stops (${at})\n  fwd ${fwd.join(' > ')}${bad.length ? '\n  ' + bad.join('\n  ') : ''}`);
      await t.check('5 folder (kept once) > New: Continue from where Back stops keeps nothing of the old folder', !bad.length, bad.join(' | ')); }
  },
  async 'row 6 · the computer kept twice from Review, then changed (This computer › a Server), then Back and on'(t) {
    await row(t, '6', { establish: async (A) => { await A.toSafe('Notes'); await toReview(A); }, keep: keepWhere, invalidate: async (A) => { await A.click('edit', 'where', 'where'); await A.click('pick', 'server'); await A.click('next'); await A.sleep(1500); },
      choose: { where: async (A) => { await A.click('pick', 'this'); await A.click('next'); } } });
  },
  async 'row 7 · NAS access path: SSH refused at install, tried again twice, then Use a shared folder instead, then Back and on'(t) {
    await row(t, '7', { scenario: 'fresh+sshNotAllowed',
      establish: async (A) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find');
        await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000); await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity');
        await A.click('trust', undefined, 'nas-key'); await A.waitFor(() => Object.entries(O55.S.sess.ops || {}).some(([k, v]) => k.startsWith('keys:nas-home') && v.state === 'done'), null, 8000);
        await A.click('next', undefined, 'nas-signin'); await A.fill('o55f-user', 'jared'); await A.fill('o55f-pw', 'correct horse'); await pressOn(A);
        await A.waitFor(() => !!document.querySelector('.o55-layer:not(.o55-out) [data-o55-do="useSmb"]'), null, 15000); },
      keep: async (A) => { await A.click('retry'); await A.sleep(800); if ((await A.snap()).screen === 'nas-signin') { await A.fill('o55f-pw', 'correct horse'); await pressOn(A); }
        await A.waitFor(() => !!document.querySelector('.o55-layer:not(.o55-out) [data-o55-do="useSmb"]'), null, 15000); },
      invalidate: async (A) => { await A.click('useSmb', undefined, 'nas-find'); },
      stale: [{ on: 'nas-smb|name|safe|review', x: 'SSH key' }],
      choose: { 'nas-find': async (A) => { const sh = (await A.snap()).buttons.find((b) => b.action === 'share'); if (sh) await A.click('share', sh.arg); await pressOn(A); },
        'nas-smb': async (A) => { for (const f of (await A.snap()).fields) if (f.type === 'password' || f.type === 'text') await A.fill(f.id, f.type === 'password' ? 'correct horse' : f.value || 'jared'); await A.sleep(300); await pressOn(A);
          await A.waitFor(() => !!document.querySelector('.o55-foot [data-o55-do="use"]'), null, 10000); },
        'nas-folder': async (A) => { const s = await A.snap(); const cd = s.buttons.find((b) => b.action === 'cd'); if (cd) await A.click('cd', cd.arg); await A.click('use'); }, ...name },
      after: async (A, bad, back) => { const hit = back.filter((x) => ['nas-identity', 'nas-key', 'nas-signin', 'nas-install'].includes(x)); if (hit.length) bad.push('Back walks the SSH steps after Use a shared folder: ' + hit.join(', ')); },
      force: ['nas-signin'] });
  },
  async 'row 8 · backup place kept twice then changed on Safe (Home NAS › Google Drive), and a restore kept twice from Review then given up, then Back and on'(t) {
    await row(t, '8 backup place', { establish: async (A) => { await A.toSafe('Notes'); await A.click('backup'); await A.click('bdest', 'nas'); }, keep: async (A) => { await A.click('bdest', 'nas'); },
      invalidate: async (A) => { await A.click('bdest', 'gdrive'); }, stale: [{ on: 'review', x: 'Home NAS' }] });
    await row(t, '8 restore given up', { establish: toKitRestore, keep: keepRestore, invalidate: editBegin('new'), stale: [{ on: 'review|safe|name', x: 'Loom' }], choose: name, after: abandoned(['r-source', 'r-unlock', 'r-pick', 'r-preview']), force: ['r-pick'] });
  },
  async 'row 9a · saved sessions naming retired hosted Gitea (constructed records: no public route can make one), resumed at the picker, sign-in, details, Safe, Review and the repository list, then Back and on'(t) {
    for (const at of ['online-service', 'online-signin', 'online-details', 'safe', 'review', 'ex-repos'])
      await row(t, `9a retired at ${at} (constructed)`, { establish: (A) => resumeAt(A, 'retired', at), invalidate: async () => {}, stale: RETIRED_STALE,
        choose: Object.assign({ name: async (A) => { await A.fill('o55f-name', 'Notes'); await A.click('next'); } }, pickerOn) });
  },
  async 'row 9b · saved sessions naming an admitted own Gitea server (browser-written: walked by clicks, closed and resumed by the chip), at the picker, sign-in, details, Safe, Review and the repository list, then Back and on'(t) {
    for (const at of ['online-service', 'online-signin', 'online-details', 'safe', 'review', 'ex-repos'])
      await row(t, `9b admitted at ${at} (browser-written)`, { establish: async (A) => { await writtenAt(A, at); },
        invalidate: async (A, bad) => {}, choose: Object.assign({ name: async (A) => { await A.fill('o55f-name', 'Notes'); await A.click('next'); } }, pickerOn),
        after: async (A, bad, back) => { if (back[0] !== at) bad.push(`9b admitted at ${at}: resumed on ${back[0]}, not where it was closed`); } });
  },
  async 'row 10a · Review Edit kept twice, then changed: Safe (copy removed; service GitHub › GitLab; own-server address; history Git › Jujutsu; backup Home NAS › Google Drive), online details, repository, Project name and files place'(t) {
    const copyEst = async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); await toReview(A); };
    await row(t, '10a Ar Safe kept > copy removed', { establish: copyEst, keep: viaReview('safe', stay),
      invalidate: viaReview('safe', async (A) => { await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); }), noReturn: copyGone, after: abandoned(['online-service', 'online-signin', 'online-details']) });
    await row(t, '10a 3r service kept > GitLab', { establish: copyEst, keep: viaReview('safe', keepCopy),
      invalidate: viaReview('safe', async (A) => { await A.click('online', undefined, 'online-service'); await pickSvc(A, 'gitlab'); await A.click('next', undefined, 'online-signin'); await signedIn(A); await A.screen('online-details'); await A.click('next', undefined, 'safe'); }),
      stale: [{ on: 'online-details|online-signin|safe|review', x: 'GitHub' }], choose: pickerOn });
    await row(t, '10a 3r address kept > another', { establish: async (A) => { await toDetails(A, 'gitea', 'gitea_self_managed', GITEA); await A.click('next', undefined, 'safe'); await toReview(A); }, keep: viaReview('safe', keepCopy),
      invalidate: viaReview('safe', async (A) => { await A.click('online', undefined, 'online-service'); await A.fill('o55f-address', 'https://gitea2.platyr.test'); await A.click('next', undefined, 'online-signin'); await A.signIn(); await A.click('next', undefined, 'online-details'); await A.click('next', undefined, 'safe'); }),
      stale: [{ on: 'online-details|online-signin|safe|review', x: 'gitea.platyr.test' }], choose: pickerOn });
    await row(t, '10a H history kept > Jujutsu, FileSafe off', { establish: async (A) => { await A.toSafe('Notes'); await toReview(A); }, keep: viaReview('safe', stay),
      invalidate: viaReview('safe', async (A) => { await A.click('backend', 'jujutsu'); if ((await A.frame().evaluate(() => O55.S.sess.drafts.main.filesafe))) { if (!(await A.has('filesafe'))) await A.click('details', 'hist'); await A.click('filesafe'); } }),
      after: async (A, bad) => { const d = await A.frame().evaluate(() => [O55.S.sess.drafts.main.history_backend, O55.S.sess.drafts.main.filesafe]); if (d[0] !== 'jujutsu' || d[1]) bad.push('10a H: history came back as ' + JSON.stringify(d)); } });
    await row(t, '10a 8r backup kept > Google Drive', { establish: async (A) => { await A.toSafe('Notes'); await A.click('backup'); await A.click('bdest', 'nas'); await A.click('sheet-close').catch(() => {}); await toReview(A); },
      keep: viaReview('backup', async (A) => { await A.click('bdest', 'nas'); }), invalidate: viaReview('backup', async (A) => { await A.click('bdest', 'gdrive'); }), stale: [{ on: 'review', x: 'Home NAS' }] });
    await row(t, '10a 3r details kept > another name and privacy', { establish: async (A) => { await A.toSafe('Book club'); await A.click('online', undefined, 'online-service'); await A.service('github', 'hosted'); await A.signIn(); await A.click('next', undefined, 'online-details'); await A.click('next', undefined, 'safe'); await toReview(A); },
      keep: viaReview('online-details', stay), invalidate: viaReview('online-details', async (A) => { await A.fill('o55f-repo', 'garden-plot'); await A.sleep(300); if (await A.has('vis', 'public')) await A.click('vis', 'public'); }),
      stale: [{ on: 'safe|review', x: 'book-club' }], after: async (A, bad) => { const n = await A.frame().evaluate(() => O55.S.sess.drafts.main.repository_name); if (n !== 'garden-plot') bad.push('10a 3r details: the name came back as ' + n); } });
    await row(t, '10a 9r repository kept > another', { establish: toRepoProject, keep: viaReview('ex-repos', async (A) => { const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); }),
      invalidate: viaReview('ex-repos', async (A) => { const ps = (await A.snap()).buttons.filter((b) => b.action === 'pick'); await A.click('pick', ps[1].arg); }), stale: [{ on: 'review|safe', x: 'recipe-app' }] });
    await row(t, '10a 10 name and files kept > another name, automatic place', { establish: async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'new'); await A.click('next', undefined, 'name');
        await A.fill('o55f-name', 'Book club site'); await A.click('change'); await A.click('loc', 'custom'); await A.click('sheet-close').catch(() => {}); await onToReview(A); },
      keep: viaReview('name', stay), invalidate: viaReview('name', async (A) => { await A.fill('o55f-name', 'Garden notes'); await A.click('change'); await A.click('loc', 'auto'); await A.click('sheet-close').catch(() => {}); }),
      stale: [{ on: 'name|like|safe|review|away', x: 'Book club site' }] });
  },
  async 'row 10b · Review Edit kept twice, then changed: Computer (a completed new Server › This computer), files place on Home NAS › this computer, settings copied › fresh, Begins as after Review again (New › existing folder), and access from away (Tailscale › home)'(t) {
    await row(t, '10b 6r Server kept > This computer', { establish: async (A) => { await toNewServer(A); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await onToReview(A); },
      keep: viaReview('where', async (A) => { await pressOn(A); }), invalidate: viaReview('where', async (A) => { await A.click('pick', 'this'); await A.click('next'); }),
      after: abandoned(SERVER_STEPS), choose: { where: async (A) => { await A.click('pick', 'this'); await A.click('next'); } } });
    await row(t, '10b files on Home NAS kept > this computer', { establish: toNameNas, keep: viaReview('name', stay),
      invalidate: viaReview('name', async (A) => { await A.click('change'); await A.click('loc', 'auto'); await A.click('sheet-close').catch(() => {}); }), after: abandoned(NAS_STEPS), stale: [{ on: 'name|safe|review', x: 'Home NAS' }], force: ['nas-folder'] });
    await row(t, '10b 11 settings copied kept > fresh', { scenario: 'returning', establish: async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await A.click('next', undefined, 'like');
        const p = (await A.snap()).buttons.find((b) => b.action === 'pick' && b.arg !== 'fresh'); await A.click('pick', p.arg); await onToReview(A); },
      keep: viaReview('like', stay), invalidate: viaReview('like', async (A) => { await A.click('pick', 'fresh'); }),
      after: async (A, bad) => { const m = await A.frame().evaluate(() => O55.S.sess.drafts.main.settings_transfer.mode); if (m === 'copy_from_project') bad.push('10b 11: the copied settings came back'); } });
    await row(t, '10b 4r Begins as after Review again kept > existing folder', { scenario: 'fresh+nameTaken', establish: async (A) => { await toCreatingFailed(A); await A.click('reviewAgain', undefined, 'review'); },
      keep: viaReview('begin', async (A) => { await A.click('next'); }), invalidate: viaReview('begin', async (A) => { await A.click('pick', 'existing'); await A.click('sub', 'folder'); await A.click('next', undefined, 'ex-folder'); await A.click('pick', '~/Documents/recipe-app'); await A.click('next'); }),
      after: abandoned(['creating']), force: ['creating'], choose: name });
    await row(t, '10b 12 away kept > home', { establish: async (A) => { await toNewServer(A); await A.click('later', undefined, 'away'); await A.click('pick', 'anywhere'); await A.click('next', undefined, 'review'); },
      keep: viaReview('away', stay), invalidate: viaReview('away', async (A) => { await A.click('pick', 'home'); }), stale: [{ on: 'review', x: 'Tailscale' }],
      choose: { begin: async (A) => { await A.click('later'); }, away: async (A) => { await A.click('pick', 'home'); await pressOn(A); } } });
  },
  async 'row 11a · forward re-entry: folder, online, restore and Home NAS given up for New, then the same kind again; Safe copy given up, then added again; backup place given up, then chosen again; a completed Server given up for This computer, then chosen again'(t) {
    await flow(t, '11a folder > New > folder', async (A, bad) => { await toFolderProject(A); await goNew(A); await goFolder(A, bad, '11a folder', '~/Desktop/garden notes'); await noStale(A, bad, '11a folder', ['recipe-app']);
      const d = await A.frame().evaluate(() => O55.S.sess.drafts.main); if (!/garden/.test(d.project_source_ref)) bad.push('11a folder: the new folder was not written: ' + d.project_source_ref); });
    await flow(t, '11a online > New > online', async (A, bad) => { await toRepoProject(A); await goNew(A); await goOnline(A, bad, '11a online', 1); await noStale(A, bad, '11a online', ['recipe-app']);
      const d = await A.frame().evaluate(() => O55.S.sess.drafts.main); if (!d.repository_ref || /recipe-app/.test(d.repository_ref)) bad.push('11a online: the new repository was not written: ' + d.repository_ref); });
    await flow(t, '11a restore > New > restore', async (A, bad) => { await toKitRestore(A); await goNew(A); await goRestore(A, bad, '11a restore'); });
    await flow(t, '11a Home NAS > New > Home NAS', async (A, bad) => { await toNasProject(A); await goNew(A); await goNas(A, bad, '11a NAS'); });
    await flow(t, '11a Safe copy given up > added again', async (A, bad) => { await toDetails(A); await A.click('next', undefined, 'safe'); await toReview(A);
      await A.click('edit', 'safe'); await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); await onToReview(A);
      await A.click('edit', 'safe'); await A.click('online', undefined, 'online-service'); await A.sleep(400); await emptyPicker(A, bad, '11a copy (service)');
      await pickSvc(A, 'gitlab'); await A.click('next', undefined, 'online-signin'); await signedIn(A); await A.screen('online-details'); await A.click('next', undefined, 'safe'); await onToReview(A); await noStale(A, bad, '11a copy', ['GitHub']); });
    await flow(t, '11a backup place given up > chosen again', async (A, bad) => { await A.toSafe('Notes'); await A.click('backup'); await A.click('bdest', 'nas'); await A.click('sheet-close').catch(() => {}); await toReview(A);
      await A.click('edit', 'backup'); await A.click('bdest', 'none'); await A.click('sheet-close').catch(() => {}); await onToReview(A);
      await A.click('edit', 'safe'); await A.click('backup'); await A.click('bdest', 'nas'); const b = await A.frame().evaluate(() => O55.S.sess.backup); if (b.sub || Object.keys(b.access || {}).length) bad.push('11a backup: Home NAS came back with ' + JSON.stringify({ sub: b.sub, access: b.access }));
      await A.click('sheet-close').catch(() => {}); await onToReview(A); });
    /* (a set-up Server is settled work outside the plan: chosen again, it is offered as the Server already set up) */
    await flow(t, '11a Server given up > chosen again', async (A, bad) => { await toNewServer(A); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await onToReview(A);
      await A.click('edit', 'where', 'where'); await A.click('pick', 'this'); await A.click('next'); await onToReview(A);
      const d1 = await A.frame().evaluate(() => O55.S.sess.drafts.main); if (d1.server_ref || d1.server_mode !== 'this_device') bad.push('11a Server: This computer kept the Server: ' + JSON.stringify({ ref: d1.server_ref, mode: d1.server_mode }));
      await A.click('edit', 'where', 'where'); await A.click('pick', 'server'); await A.click('next'); await onToReview(A, { begin: async (A) => { await A.click('pick', 'new'); await A.click('next'); } }); });
  },
  async 'row 11b · cross-kind switches of Begins as: online › restore, folder › online, Home NAS › restore, restore › online, online › folder, Home NAS › folder'(t) {
    await flow(t, '11b online > restore', async (A, bad) => { await toRepoProject(A); await goRestore(A, null, ''); await noStale(A, bad, '11b online > restore', ['recipe-app', 'jared-p/']);
      const d = await A.frame().evaluate(() => O55.S.sess.drafts.main); if (d.online_mode !== 'none' || d.repository_ref) bad.push('11b online > restore: ' + JSON.stringify({ online: d.online_mode, repo: d.repository_ref })); });
    await flow(t, '11b folder > online', async (A, bad) => { await toFolderProject(A); await goOnline(A, null, '', 1); await noStale(A, bad, '11b folder > online', ['~/Documents/recipe-app', 'folder:home', 'preflight:folder']); });
    await flow(t, '11b Home NAS > restore', async (A, bad) => { await toNasProject(A); await goRestore(A, null, ''); await noStale(A, bad, '11b NAS > restore', ['volume1', 'ssh-key:', 'Home NAS']); });
    await flow(t, '11b restore > online', async (A, bad) => { await toKitRestore(A); await goOnline(A, null, '', 1); await noStale(A, bad, '11b restore > online', ['kit-loom', 'Loom']); });
    await flow(t, '11b online > folder', async (A, bad) => { await toRepoProject(A); await goFolder(A, null, '', '~/Desktop/garden notes'); await noStale(A, bad, '11b online > folder', ['recipe-app', 'jared-p/']); });
    await flow(t, '11b Home NAS > folder', async (A, bad) => { await toNasProject(A); await goFolder(A, null, '', '~/Desktop/garden notes'); await noStale(A, bad, '11b NAS > folder', ['volume1', 'ssh-key:', 'Home NAS']); });
  },
  async 'row 12 · each review finding at e9b: AST-1 saved hosted Gitea and Forgejo picks resume with nothing chosen; AST-2 Not now before any Continue; AST-3 a saved folder session with no branch data; AST-4 repository Edit, then New and a new copy; AST-5 default boot after a fault scenario (Sol A2 and A3 are rows 11a and 11b)'(t) {
    /* AST-1 (constructed records: no public route on this build picks a retired kind) */
    for (const [card, variant] of [['gitea', 'gitea_cloud'], ['forgejo', 'forgejo_cloud']])
      await flow(t, `12 AST-1 saved ${variant} pick resumed (constructed)`, async (A, bad) => {
        await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(800);
        await A.frame().evaluate(([card, variant]) => { const saved = O55.store.get('onboarding', null); saved.started = 'ast1-' + Date.now(); saved.status = 'closed'; saved.screen = 'online-service';
          saved.online = { purpose: 'copy', forge: card, variant, wanted: true, addresses: { [card + '|' + variant]: 'https://retired.example.test' } };
          Object.assign(saved.drafts.main, { online_mode: 'none', forge: 'none', forge_provider_variant: null, forge_instance_url: '' });
          O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, [card, variant]);
        await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1400);
        await emptyPicker(A, bad, `AST-1 ${variant}`);
        if (await A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) #o55f-address').count()) { await A.fill('o55f-address', 'https://new.example.test'); await A.sleep(400); }
        const r = await A.frame().evaluate(() => { const p = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary'); return { on: !!p && !p.disabled && p.getAttribute('aria-disabled') !== 'true', variant: O55.S.sess.drafts.main.forge_provider_variant }; });
        if (r.on || r.variant) bad.push(`AST-1 ${variant}: an address alone turns Continue on or writes a kind: ${JSON.stringify(r)}`); });
    /* AST-2 */
    await row(t, '12 AST-2 Not now before any Continue', { establish: async (A) => { await A.toSafe('Notes'); }, invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); },
      noReturn: copyGone, after: abandoned(['online-service', 'online-signin', 'online-details']), force: ['online-service'] });
    /* AST-3 (a folder session closed and resumed: this build keeps no branch data, so its record has the predecessor's shape) */
    await row(t, '12 AST-3 resumed folder session > New', { establish: async (A) => { await toFolderProject(A); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
        await A.frame().evaluate(() => { const saved = O55.store.get('onboarding', null); delete saved.branch; O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); });
        await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1400); await A.screen('review'); },
      invalidate: async (A) => { await editBegin('new')(A); await A.fill('o55f-name', 'Astra new project'); await A.click('next'); await onToReview(A); },
      noReturn: (A) => A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return d.project_source_ref || /recipe-app/.test(d.local_location) ? `brought the old folder back (${d.project_source_ref}, ${d.local_location})` : null; }),
      after: abandoned(['ex-folder']), force: ['ex-folder'], choose: name });
    /* AST-4 */
    await row(t, '12 AST-4 repository Edit kept > New > new GitHub copy', { establish: async (A) => { await toRepoProject(A); await viaReview('ex-repos', async (A) => { const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); })(A); },
      invalidate: async (A) => { await editBegin('new')(A); await A.fill('o55f-name', 'Astra replacement'); await A.click('next'); await onToReview(A);
        await A.click('edit', 'safe'); await A.click('online', undefined, 'online-service'); await A.click('pick', 'github'); await A.click('next'); await settle(A, ['online-signin', 'online-details']);
        if ((await A.snap()).screen === 'online-signin') await signedIn(A); await A.screen('online-details'); await A.fill('o55f-repo', 'astra-replacement'); await A.sleep(300); await A.click('next'); await onToReview(A); },
      noReturn: (A) => A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return d.repository_ref || d.repository_name !== 'astra-replacement' || d.online_mode !== 'new' ? `changed the new copy (${d.online_mode}, ${d.repository_name}, ${d.repository_ref})` : null; }),
      after: abandoned(['ex-repos']), force: ['ex-repos'], choose: name });
    /* AST-5 */
    await flow(t, '12 AST-5 default boot after a fault scenario', async (A, bad) => { await A.boot({ scenario: 'fresh+sshNotAllowed' }); await A.boot();
      const sc = await A.frame().evaluate(() => { try { return O55.store.get('scenario', ''); } catch (e) { return 'unreadable'; } }); if (sc && sc !== 'fresh') bad.push('AST-5: the default boot kept scenario ' + sc); });
  }
};
