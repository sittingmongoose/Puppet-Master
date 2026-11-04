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
  const raw = [...txt.matchAll(new RegExp('\\{[a-zA-Z_]+\\}|\\b(?:undefined|null|NaN|none)\\b|\\b(?:' + ns + ')\\.[a-zA-Z]\\w*(?:\\.\\w+)*\\b|\\b[a-z]+(?:_[a-z]+)+\\b', 'g'))].map((m) => m[0]).filter((x) => !/^id_(rsa|ecdsa|ed25519|dsa)$/.test(x) && !/\.local$/.test(x)); /* (an SSH key's file name, as the key step shows it, and a .local host name are not keys) */
  const reason = (prim && !on(prim) ? prim.getAttribute('data-disabled-reason') || '' : '') + [...document.querySelectorAll('.o55-reason-show, .o55-layer:not(.o55-out) .o55-err')].map((x) => x.textContent.trim()).filter(Boolean).join(' / ');
  const applies = O55.ui && O55.ui.onBranch ? O55.ui.onBranch(S.sess.screen) : null, rt = S.sess.ui && S.sess.ui.returnTo;
  const edit = !!(rt && rt.from === S.sess.screen && !rt.left);
  return { screen: S.sess.screen, title: (((l && l.querySelector('.o55-title')) || {}).textContent || '').trim(), raw, text: txt, acts, primary: prim ? { on: on(prim) } : null, back: on(back), reason, applies, edit };
};
/* (a screen change has finished: no outgoing layer, the current one settled) */
const look = async (A) => { await A.sleep(450); await A.frame().waitForFunction(() => !document.querySelector('.o55-pane > .o55-layer.o55-out, .o55-pane > .o55-layer.o55-hold'), null, { timeout: 4000 }).catch(() => {}); return A.frame().evaluate(LOOK); };
const judge = (s, stale, where, bad) => {
  if (s.raw.length) bad.push(`${where} ${s.screen} "${s.title}": raw ${JSON.stringify([...new Set(s.raw)])}`);
  for (const e of stale) { if (e.on && !new RegExp('^(' + e.on + ')$').test(s.screen)) continue;
    /* (a stale entry is a literal, x, or a pattern, re: FO-45's raw locator families) */
    const hit = e.re ? (s.text.match(new RegExp(e.re)) || [])[0] : s.text.includes(e.x) ? e.x : null;
    if (hit) bad.push(`${where} ${s.screen} "${s.title}": ${e.re ? 'a raw locator' : 'stale'} "${hit}"`); }
};
const pressBack = (A) => A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="back"]').filter({ visible: true }).first().click();
const pressOn = (A) => A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary').first().click();
/* any screen Back shows must apply to the current answers (the page's own rule, not a list of names), and none repeats in
   the run (the lead's Back ruling 1103011909, rule 1) */
const generic = (s, seq, where, bad) => { if (s.applies === false) bad.push(`${where} ${s.screen}: shown though its answers no longer lead to it`); if (seq.includes(s.screen)) bad.push(`${where} ${s.screen}: Back shows it again (${seq.join(' > ')})`); };
/* the one exception (rule 2): Back on a step Review's Edit opened, before going on from it, returns to Review, and the run
   is judged from Review on. Otherwise Back never moves forward to Review, except from the steps after it */
const POST_REVIEW = ['creating', 'protect', 'ai', 'ai-all', 'ai-none', 'free', 'ready'];
const toReviewOk = (was, s, i, run, label, bad) => {
  if (was.edit) { if (s.screen !== 'review') bad.push(`${label} Back#${i}: Back on ${was.screen}, opened by Review's Edit, went to ${s.screen}, not back to Review`); else run.length = 0; return; }
  if (s.screen === 'review' && run.some((x) => !POST_REVIEW.includes(x))) bad.push(`${label} Back#${i}: Back on ${was.screen} went forward to Review (${run.join(' > ')})`);
};
async function walkBack(A, stale, bad, label) {
  const seq = [], run = []; let s = await look(A);
  for (let i = 0; i < 40; i++) {
    generic(s, run, label + ' Back#' + i, bad); seq.push(s.screen); run.push(s.screen); judge(s, stale, label + ' Back#' + i, bad);
    if (!s.back) break;
    await pressBack(A); const was = s; s = await look(A);
    if (s.screen === was.screen) { bad.push(`${label} Back#${i}: Back on ${was.screen} went nowhere`); break; }
    toReviewOk(was, s, i, run, label, bad);
  }
  return seq;
}
/* Back to the start as walkBack does, and at each stop Continue once and Back again: going on from any screen Back still
   reaches must not bring the given-up answer back (canon FO-22). Never on Review or after it: that Continue creates. */
const NO_CONTINUE = ['welcome', 'look', 'review', 'creating', 'protect', 'ai', 'ai-all', 'ai-none', 'free', 'ready'];
async function walkBackContinuing(A, stale, bad, label, back) {
  const seq = [], run = []; let s = await look(A);
  for (let i = 0; i < 40; i++) {
    generic(s, run, label + ' Back#' + i, bad); seq.push(s.screen); run.push(s.screen); judge(s, stale, label + ' Back#' + i, bad);
    if (!NO_CONTINUE.includes(s.screen) && !s.edit && s.primary && s.primary.on) {
      await pressOn(A); const n = await look(A), v = await back(A);
      if (v) bad.push(`${label} Back#${i}: Continue on ${s.screen} ${v}`);
      if (n.screen !== s.screen && n.back) { await pressBack(A); const r = await look(A); if (r.screen !== s.screen) { bad.push(`${label} Back#${i}: Back after Continue on ${s.screen} went to ${r.screen}`); s = r; continue; } }
    }
    if (!s.back) break;
    await pressBack(A); const was = s; s = await look(A);
    if (s.screen === was.screen) { bad.push(`${label} Back#${i}: Back on ${was.screen} went nowhere`); break; }
    toReviewOk(was, s, i, run, label, bad);
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
  SELFTEST = t.args.selftest || ''; const A = onboardingApp(t), bad = []; await A.boot(scenario ? { scenario } : {});
  await establish(A); if (keep) for (let i = 0; i < times; i++) await keep(A, i);
  await invalidate(A);
  const back = noReturn ? await walkBackContinuing(A, stale, bad, label, noReturn) : await walkBack(A, stale, bad, label), fwd = await forward(A, stale, bad, label, choose, until);
  if (noReturn) { const v = await noReturn(A); if (v) bad.push(`${label}: at the end the plan ${v}`); }
  /* a Back run from Review goes all the way to Welcome (the lead's ruling: tracked after every Review Edit row) */
  if (back[0] === 'review' && back[back.length - 1] !== 'welcome') bad.push(`${label}: the Back run from Review stopped on ${back[back.length - 1]} (${back.join(' > ')})`);
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
  await A.resume();
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
  await A.resume();
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
const onToReview = async (A, given = {}) => { const choose = Object.assign({}, given); /* (its own copy: the shared nameOn kept for every caller) */ for (let i = 0; i < 14; i++) { const s = await A.snap(); if (s.screen === 'review') return; if (choose[s.screen]) { await choose[s.screen](A, s); delete choose[s.screen]; } else { await A.waitEnabled(s.primary && s.primary.action || 'next').catch(() => {}); await pressOn(A); } await A.sleep(700); } await A.screen('review'); };
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
async function toNewServer(A, end = 'begin') {
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
  await A.screen('s-ready'); if (end === 's-ready') return; await pressOn(A); if (end) await A.screen(end);
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
async function flow(t, label, fn) { SELFTEST = t.args.selftest || ''; const A = onboardingApp(t), bad = []; await A.boot(); await fn(A, bad); t.log(label + (bad.length ? '\n  ' + bad.join('\n  ') : ': clean')); await t.check(label, !bad.length, bad.join(' | ').slice(0, 1500)); }
/* ---------------------------------------------------------------- an unchanged answer clears nothing (row 13)
   Sol's FO22-N1 at 9b9dd16: Edit Begins as, keep Restore and Continue, Back to Review lost the backup. Each Begins-as kind,
   kept unchanged, then Back to Review: the plan, the picker's choice and Review's commit are exactly as before. */
const nameOn = { name: async (A) => { if (!(await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name))) await A.fill('o55f-name', 'Kept one'); await A.click('next'); } };
/* a shared folder's sign-in typed as a person types it: the account where it is empty and the password, once per visit to
   the screen, then its check. The page empties the password as the check starts and keeps a pass only for the password
   it checked (70-screens-nas.js check and bind.pw: a new password is a new pwGen, rule 5), so typing it again after a
   check takes the pass away: this loop did that on every pass, checked again each time and only left after its 14th
   (FO-42: about 8 minutes per SMB film). Nothing is typed on a screen whose check has passed (its Continue is Use), and
   the loop waits for the screen's own Continue whichever control it is (Check access, then Use). */
const shareFoot = (A) => A.waitFor(() => { const b = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary'); return !!b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, null, 20000).catch(() => {});
/* (with bad: FO-42's regression, a share is signed in to once: one password typed, one check run. --set selftest=refill
   types the password again on every pass, as the old filler did, and rows 13b and 14 must fail) */
let SELFTEST = '';
const shareChecks = (A) => A.frame().evaluate(() => Object.keys(O55.S.sess.ops || {}).filter((k) => /^smb:/.test(k)));
const throughShare = async (A, bad) => {
  let at = null, typed = new Set(); const pw = [], checks0 = await shareChecks(A);
  const done = async () => { if (!bad) return; const n = (await shareChecks(A)).filter((k) => !checks0.includes(k)).length;
    if (pw.length > 1 || n > 1) bad.push(`FO-42: the shared folder's password was typed ${pw.length} times and checked ${n} times (${pw.join(', ')})`); };
  for (let i = 0; i < 14; i++) {
    const s = await A.snap(); if (['name', 'like', 'safe', 'review'].includes(s.screen)) return done();
    if (s.screen !== at) { at = s.screen; typed = new Set(); }
    if (SELFTEST === 'refill' || !(s.primary && s.primary.action === 'use' && !s.primary.disabled))
      for (const f of s.fields) if ((SELFTEST === 'refill' || !typed.has(f.id)) && (f.type === 'password' || (f.type === 'text' && !f.value)) && !/domain|shareText|addr|port/i.test(f.id)) {
        typed.add(f.id); if (f.type === 'password') pw.push(s.screen + ' #' + i); await A.fill(f.id, f.type === 'password' ? 'correct horse' : 'jared').catch(() => {}); }
    if (await A.has('use') && (await A.snap()).buttons.some((b) => b.action === 'use' && !b.disabled)) await A.click('use');
    else { await shareFoot(A); if (await A.has('use') && (await A.snap()).buttons.some((b) => b.action === 'use' && !b.disabled)) await A.click('use'); else await pressOn(A); }
    await A.sleep(1600);
  }
  return done();
};
const toNasBy = async (A, method, bad) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
  if (method === 'ssh') { await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); }
  else { await A.click('method', method); await A.sleep(400); const s = await A.snap(), pick = s.buttons.find((b) => b.action === (method === 'mounted' ? 'volume' : 'share'));
    await A.click(pick.action, pick.arg); await A.sleep(300); await pressOn(A); await A.sleep(900); await throughShare(A, bad); }
  await onToReview(A, nameOn); };
const toCloudRestore = async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'restore'); await A.click('next', undefined, 'r-source');
  await A.click('source', 'cloud'); await A.sleep(400); await pressOn(A); await A.screen('online-signin'); await A.click('signIn'); await A.waitFor(() => O55.S.sess.signin.state === 'done', null, 15000); await A.sleep(800);
  for (let i = 0; i < 6 && (await A.snap()).screen !== 'r-pick'; i++) { const s = await A.snap();
    if (s.screen === 'r-unlock') { const f = s.fields.find((x) => x.type === 'text' || x.type === 'password'); if (f) await A.fill(f.id, 'river candle orbit maple quiet lantern'); }
    await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(1200); }
  await A.screen('r-pick');
  const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await pressOn(A); await A.sleep(800); await onToReview(A, nameOn); };
/* on to Review through steps whose answers are all kept: each Continue (Use on a folder step), a NAS step's trust */
const goOnToReview = async (A) => { for (let i = 0; i < 20; i++) { const s = await A.snap(); if (s.screen === 'review') return;
    if (s.screen === 'nas-identity' && await A.has('trust')) await A.click('trust'); else if (await A.has('use') && s.buttons.some((b) => b.action === 'use' && !b.disabled)) await A.click('use');
    else { await A.waitEnabled(s.primary && s.primary.action || 'next').catch(() => {}); await pressOn(A); } await A.sleep(900); } await A.screen('review'); };
/* a record written on a predecessor page by its own public controls, closed, and carried unchanged to this build (rows 12
   and 16) */
const oldUrl = (p) => (/^file:/.test(p) ? p : 'file://' + p) + '?o55=fresh&o55scenario=fresh';
const onOldPage = async (A, page, walk) => { await A.boot(); await A.frame().goto(oldUrl(page)); await A.screen('welcome'); await A.click('start', undefined, 'look'); await A.click('pickFamily', 'basic'); await A.click('pickMode', 'light'); await A.click('next', undefined, 'where');
  await walk(A); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900); return A.frame().evaluate(() => JSON.stringify(O55.store.get('onboarding', null))); };
const resumeRecord = async (A, saved) => { await A.boot(); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(800);
  await A.frame().evaluate((s) => { O55.store.set('onboarding', JSON.parse(s)); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, saved);
  await A.resume(); };
/* ---------------------------------------------------------------- the generated unchanged-answer row (row 20) */
/* the draft (canonical key order, its revision counter left out), Review's rows and the Back path */
const SNAP20 = () => { const S = O55.S, canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => { o[k] = canon(v[k]); return o; }, {}) : v);
  const d = canon(S.sess.drafts.main); delete d.project_draft_revision;
  const rows = [...document.querySelectorAll('.o55-pane > .o55-layer:not(.o55-out) .o55-revrow')].map((r) => (r.getAttribute('data-key') || '') + '=' + ((r.querySelector('.o55-revv') || {}).textContent || '').trim());
  return { draft: d, rows, history: (S.sess.history || []).slice() }; };
/* Continue with nothing changed until Review: an open sheet is closed, a settled host is trusted as it was, a NAS folder
   kept is used, an existing Server kept leads on to its Project (never Enter, which ends setup) */
const keepOn = async (A) => { const walked = [];
  for (let i = 0; i < 32; i++) { const s = await A.snap(); walked.push(s.screen); if (s.screen === 'review') return walked;
    if (await A.has('sheet-close')) { await A.click('sheet-close'); await A.sleep(500); }
    if (s.screen === 'c-ready') await A.click('createNew');
    else if (s.screen === 'nas-identity' && await A.has('trust')) await A.click('trust');
    else if (await A.has('use') && s.buttons.some((b) => b.action === 'use' && !b.disabled)) await A.click('use');
    else { await A.waitEnabled(s.primary && s.primary.action || 'next').catch(() => {}); await pressOn(A); }
    await A.sleep(900); }
  walked.push((await A.snap()).screen); return walked; };
const toStorageBy = async (A, method) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Book club site');
  await A.click('change'); await A.click('loc', 'network', 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
  if (method === 'ssh') { await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); }
  else { await A.click('method', method); await A.sleep(400); const s = await A.snap(), pick = s.buttons.find((b) => b.action === (method === 'mounted' ? 'volume' : 'share'));
    if (!pick) throw new Error('no ' + method + ' choice on ' + s.screen + ' for a files place on Home NAS'); await A.click(pick.action, pick.arg); await A.sleep(300); await pressOn(A); await A.sleep(900); await throughShare(A); }
  await onToReview(A); };
const newServerPlan = (away) => async (A) => { await toNewServer(A); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes');
  await onToReview(A, away ? { away: async (A) => { await A.click('pick', 'anywhere'); await A.sleep(400); await A.waitEnabled('next').catch(() => {}); await A.click('next'); } } : {}); };
const existingServerPlan = async (A) => {
  await A.click('pick', 'connect'); await A.click('next', undefined, 'c-route'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:home"]'), null, 10000);
  await A.click('pickServer', 'pm:home'); await A.click('next', undefined, 'c-review'); await pressOn(A); await A.screen('c-pair');
  await A.waitFor(() => O55.S.sess.connect.paired, null, 15000); await pressOn(A); await A.screen('c-ready'); await A.click('createNew'); await A.screen('begin');
  await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await onToReview(A); };
const backupPlan = (dest) => async (A) => { await A.toSafe('Notes'); await A.click('backup'); await A.click('bdest', dest); await A.click('sheet-close').catch(() => {}); await toReview(A); };
const RICH = [
  ['Home NAS files over SSH', (A) => toStorageBy(A, 'ssh')], ['Home NAS files mounted', (A) => toStorageBy(A, 'mounted')],
  ['Home NAS source over SSH', toNasProject], ['Home NAS source mounted', (A) => toNasBy(A, 'mounted')],
  ['a completed new Server', newServerPlan(false)], ['a connected existing Server', existingServerPlan],
  ['restore from a Recovery Kit', (A) => toKitRestore(A)], ['restore from a cloud drive', (A) => toCloudRestore(A)],
  ['online import', toRepoProject], ['online new copy', async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); await toReview(A); }],
  ['backup on Home NAS', backupPlan('nas')], ['backup on a cloud drive', backupPlan('gdrive')], ['away with Tailscale', newServerPlan(true)]
];
/* every reference in the plan describes a current answer (the lead's invariant for source, storage and NAS refs) */
const INVAR = () => { const S = O55.S, d = S.sess.drafts.main, n = S.sess.nas || {}, out = [];
  const nasRefs = (d.source_access_authorization_refs || []).filter((r) => /^(ssh-key|pairing):/.test(r)).concat((d.preflight_result_refs || []).filter((r) => /^preflight:(ssh|paired-source):/.test(r)));
  const nasSource = d.project_mode === 'existing_local' && d.project_transport !== 'local', nasFiles = d.storage_mode === 'network_location';
  if (!nasFiles && d.storage_location) out.push('files place ' + d.storage_location + ' with files on ' + d.storage_mode);
  /* (a files place on the NAS over SSH names the current NAS profile, its device, account and endpoint: Astra delta3) */
  if (nasFiles && /^ssh:/.test(d.storage_location || '') && (n.purpose === 'storage') && (!n.profile || d.storage_location.indexOf('ssh:' + n.profile) !== 0)) out.push('files place ' + d.storage_location + ' not on the current NAS profile ' + (n.profile || '(none)'));
  /* (a mounted, SMB or NFS files place names the current volume or share: Astra delta4) */
  if (nasFiles && n.purpose === 'storage' && /^(mounted|smb|nfs):/.test(d.storage_location || '')) {
    const m = d.storage_location.split(':')[0], sh = n.share === 'manual' ? n.manualShare : (S.env.shares || []).find((x) => x.id === n.share), shp = sh ? String(sh.path || '').replace(/^\/\//, '') : '';
    if (m === 'mounted' ? d.storage_location !== 'mounted:' + n.volume : (n.method !== m || !shp || d.storage_location.indexOf(shp) < 0)) out.push('files place ' + d.storage_location + ' not on the current ' + (m === 'mounted' ? 'volume ' + n.volume : m + ' share ' + shp));
  }
  if (d.server_mode === 'this_device' && (d.server_ref || d.server_trust_confirmed)) out.push('a Server ' + (d.server_ref || '(trusted)') + ' on This computer');
  if (!/^existing_/.test(d.project_mode) && d.project_source_ref) out.push('source ' + d.project_source_ref + ' for a ' + d.project_mode + ' Project');
  if (d.project_mode !== 'restore' && d.backup_source_ref) out.push('backup ' + d.backup_source_ref + ' for a ' + d.project_mode + ' Project');
  if (d.online_mode === 'none' && ((d.forge && d.forge !== 'none') || d.repository_ref || d.forge_account_ref)) out.push('online service ' + d.forge + ' / ' + (d.repository_ref || d.forge_account_ref) + ' with no online copy or source');
  if (!nasSource && !nasFiles && d.project_mode !== 'restore' && nasRefs.length) out.push('NAS access ' + nasRefs.join(', ') + ' with no NAS in the plan');
  nasRefs.filter((r) => /^(ssh-key:|preflight:ssh:)/.test(r)).forEach((r) => { if (!n.profile || r.indexOf(n.profile) < 0) out.push('SSH access ' + r + ' not for the current NAS profile ' + (n.profile || '(none)')); });
  return out; };
/* FO-45, widened: no reference the plan stores shows raw where a person reads a place. A raw reference is one of the
   families the page stores for a place, a source, an access or a home (an SSH connection ssh: and its profile sshp:, a
   share smb: or nfs: and their profile shp:, a mounted volume mounted:, a Puppet Master NAS or Server pm:, a Server
   record server:, an access or a check ssh-key:, pairing: or preflight:, an account account:, a fixture's fixture:; a
   URL's scheme is not one), or any reference the session holds, whole or with its leading schemes taken off one at a
   time down to its opaque hash (FO-45 itself was the stored 'ssh:sshp:server-this:<hash>/volume1/projects' shown with one
   scheme stripped). RAW_STALE is the Back walk's stale list for both; rawIn judges any texts. */
const RAW_RE = '(?<![\\w/.-])(?:sshp|shp|ssh|smb|nfs|mounted|pm|server|ssh-key|pairing|preflight|account|fixture):(?!//)[^\\s\'"«»,;()]+';
const STORED_REFS = () => { const S = O55.S, out = new Set();
  const add = (v) => { if (typeof v !== 'string' || !/^[a-z][a-z0-9-]*:/.test(v) || /^[a-z]+:\/\//.test(v)) return;
    /* (a suffix still raw starts with a scheme or a profile's slug, or carries its hash; what is left once they are gone
       is the place as a person reads it: an NFS export 'media.local:/mnt/tank/share', a share's path, a volume) */
    for (let r = v, i = 0; r && i < 8; i++) { if (r.length >= 8 && (/^[a-z][a-z0-9-]*:/.test(r) || /(^|[^0-9a-f])[0-9a-f]{8}([^0-9a-f]|$)/.test(r))) out.add(r); else break; const m = /^[^:]*:(.+)$/.exec(r); if (!m) break; r = m[1]; } };
  const walk = (v, depth = 0) => { if (depth > 6) return; if (Array.isArray(v)) v.forEach((x) => walk(x, depth + 1)); else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x, depth + 1)); else add(v); };
  walk(S.sess.drafts.main); walk(S.sess.nas || {}); walk(S.sess.backup || {}); walk(S.sess.restore || {}); walk((S.sess.server || {}).ref || null); walk(S.sess.connect || {});
  return [...out]; };
const rawStale = async (A) => [{ re: RAW_RE }, ...(await A.frame().evaluate(STORED_REFS)).map((x) => ({ x }))];
const rawIn = (texts, refs) => { const hits = []; for (const [where, text] of texts) { const t = String(text || ''); const m = t.match(new RegExp(RAW_RE)); if (m) hits.push(`${where}: "${m[0]}"`); for (const r of refs) if (t.includes(r)) hits.push(`${where}: "${r}"`); } return [...new Set(hits)]; };
/* the screen's own selection: its chosen cards and switches, and what its fields hold */
const SEL = () => { const l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)') || document; const sheet = [...document.querySelectorAll('.o55-sheet[data-open="true"]')].find((x) => !x.closest('.o55-out')) || null;
  const scope = [l, sheet].filter(Boolean), q = (sel) => scope.flatMap((x) => [...x.querySelectorAll(sel)]);
  return { screen: O55.S.sess.screen, on: q('[role="radio"][aria-checked="true"], [role="switch"][aria-checked="true"]').map((b) => b.getAttribute('data-o55-do') + ':' + (b.getAttribute('data-arg') || '')).sort(),
    fields: q('input[type="text"], input:not([type]), textarea').map((i) => i.id + '=' + i.value).sort() }; };
/* a real click, or its click event when Playwright refuses the control as unstable. That was reported as the pane drifting
   about 0.3 px a frame; it is one card trembling (fo-kit, 2026-11-04): after Review > Edit name > Change the pointer rests
   where Change was clicked, 0.5 px inside the bottom edge of the files sheet's 'custom' card, and the card's own hover lift
   (10-window.css .o55-card:hover translateY(-1px), a 0.18 s transition) carries its edge past the pointer and back, 0.3 to
   0.9 px, for as long as the pointer rests there. A page issue, reported to the lead; a person's click lands, and this row
   judges what the click does */
const clickOrSend = async (A, sel) => { const el = A.frame().locator(sel).filter({ visible: true }).first(); await el.click({ timeout: 4000 }).catch(async () => { await el.dispatchEvent('click'); }); await A.sleep(300); };
/* another value on the screen, not continued: a card or switch not chosen, else a field typed differently */
const pickOther = async (A) => {
  const c = await A.frame().evaluate(() => { const l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), sheet = [...document.querySelectorAll('.o55-sheet[data-open="true"]')].find((x) => !x.closest('.o55-out')) || null;
    const NAV = ['loc:network']; /* (a pick that is itself a step on: the files place on a NAS opens the NAS steps) */
    /* (truly on show: not in a closed sheet or an inert part, and with a size and visibility of its own) */
    const shown = (b) => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0 && !b.closest('.o55-sheet:not([data-open="true"])') && !b.closest('[inert]') && !b.closest('[aria-hidden="true"]'); };
    const all = [...new Set([sheet, l].filter(Boolean).flatMap((x) => [...x.querySelectorAll('[role="radio"]')]))].filter((b) => shown(b) && b.getAttribute('aria-checked') !== 'true' && b.getAttribute('aria-disabled') !== 'true' && !b.disabled && !NAV.includes(b.getAttribute('data-o55-do') + ':' + b.getAttribute('data-arg')));
    document.querySelectorAll('[data-kit-pick]').forEach((x) => x.removeAttribute('data-kit-pick'));
    const b = all[0]; if (b) { b.setAttribute('data-kit-pick', '1'); return { do: b.getAttribute('data-o55-do'), arg: b.getAttribute('data-arg') }; }
    const f = [...(l || document).querySelectorAll('input[type="text"], input:not([type])')].find((i) => shown(i) && !i.disabled && !i.readOnly);
    return f ? { field: f.id, value: f.value } : null; });
  if (!c) return null;
  if (c.field) { await A.fill(c.field, (c.value || '') + ' changed'); await A.sleep(400); return 'typed ' + c.field; }
  /* (the exact element chosen, wherever it is; when something on the page keeps it from a real click, its click event is
     sent instead: this row judges what a pick does, the click-reachability of every control is the audit's) */
  const el = A.frame().locator('[data-kit-pick="1"]').first();
  let how = '';
  await el.click({ timeout: 4000 }).catch(async () => {
    how = ' (sent; at its centre: ' + await A.frame().evaluate(() => { const b = document.querySelector('[data-kit-pick="1"]'); if (!b) return 'gone'; const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y);
      return h ? (h === b || b.contains(h) ? 'itself' : h.tagName.toLowerCase() + '.' + String(h.className || '').replace(/\s+/g, '.') + (h.closest('[data-key]') ? ' in ' + h.closest('[data-key]').getAttribute('data-key') : '')) + ' @' + Math.round(x) + ',' + Math.round(y) + ' in ' + innerWidth + 'x' + innerHeight : 'nothing @' + Math.round(x) + ',' + Math.round(y); }) + ')';
    await el.dispatchEvent('click'); });
  await A.sleep(500); return 'picked ' + c.do + ':' + c.arg + how; };
/* the answers as the session holds them: the plan (but its revision counter), and what each picker keeps of its choice */
const ANSWERS = () => { const S = O55.S, canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => { o[k] = canon(v[k]); return o; }, {}) : v);
  const d = canon(S.sess.drafts.main); delete d.project_draft_revision; const n = S.sess.nas || {}, r = S.sess.restore || {}, ol = S.sess.online || {}, b = S.sess.backup || {}, u = S.sess.ui || {};
  const c = S.sess.connect || {}, cn = canon(S.sess.drafts.connect || {}); delete cn.project_draft_revision;
  return { draft: d, connect: [c.manual || false, c.addr || '', JSON.stringify(cn)], nasTyped: [n.manual || false, n.addr || '', n.port == null ? null : String(n.port)], addresses: JSON.stringify(canon((S.sess.online || {}).addresses || {})),
    facts: JSON.stringify(canon({ hosts: S.env.here.knownHosts || {}, auth: (S.env.devices || []).map((x) => [x.id, (x.authorized || []).slice().sort()]), nasFacts: S.sess.nasFacts || {} })),
    nas: [n.device || null, n.method || null, n.share || null, n.volume || null, n.at || null, n.profile || null, !!n.trusted, !!n.installed, n.choice ? n.choice.id : null],
    restore: [r.source || null, r.kit || null, r.cloud || null, r.device || null, r.pick || null, r.reachedFor || null], online: [ol.forge || null, ol.variant || null, ol.wanted === undefined ? null : !!ol.wanted],
    backup: [b.dest || null, b.sub || null], ui: [u.where || null, u.whereAt || null, u.begin || null, u.beginSub || null],
    server: (() => { const v = S.sess.server || {}; return [v.kind || null, v.target || null, !!v.manual, v.addr || '', v.platform || null, v.name || '', !!v.selfConfirmed]; })(), signin: (() => { const si = S.sess.signin || {}; return [si.state || null, !!si.tokenTyped, si.method || null, si.account || null]; })(),
    nasPick: [n.key || null, n.user || '', n.userEdit || false] }; };
/* the steps whose own work is a check, a sign-in, a pairing, an install or a Server's setup (60-ui-core's NO_TXN): no pick */
const NO_PICK = ['welcome', 'look', 'review', 'nas-identity', 'nas-install', 'r-preview', 's-ready', 'c-pair', 'c-ready']; /* (s-wait, s-confirm, c-review, nas-pmpair and r-unlock are picked or typed on too: Astra delta3) */ /* (the key, user, token and Server kind steps are picked on too: lead 1103074359) */
/* Back from Review to Welcome, and on every step on the way another value picked (or typed) first: Back must take the
   pick back, so the answers after it are those the step was reached with (lead: every picker, not only Review's Edit
   links: the restore source and place, the NAS device, method and folder, the service, the computer kind, the files
   place, the backup place and access from away) */
async function pickBackWalk(A, bad, label) {
  const seq = [], picked = []; let s = await look(A);
  for (let i = 0; i < 40; i++) {
    seq.push(s.screen); if (!s.back) break;
    const before = await A.frame().evaluate(ANSWERS); let did = null;
    if (!NO_PICK.includes(s.screen)) {
      const sheetOpen = () => A.waitFor(() => !!document.querySelector('.o55-sheet[data-open="true"]'), null, 4000).catch(() => {});
      if (s.screen === 'name' && await A.has('change')) { await A.click('change'); await sheetOpen(); await A.sleep(400); }
      if (s.screen === 'safe' && await A.has('backup')) { await A.click('backup'); await sheetOpen(); await A.sleep(400); }
      did = await pickOther(A);
      const now = (await A.snap()).screen; if (now !== s.screen) { bad.push(`${label} ${s.screen}: ${did} went on to ${now} without Continue`); break; }
    }
    await pressBack(A); let n = await look(A); if (n.screen === s.screen) { await pressBack(A); n = await look(A); } /* (the first Back closes an open sheet) */
    if (n.screen === s.screen) { bad.push(`${label} Back#${i}: Back on ${s.screen} went nowhere`); break; }
    if (did) { picked.push(s.screen + ' ' + did); const after = await A.frame().evaluate(ANSWERS), ch = Object.keys(before).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
      if (ch.length) bad.push(`${label} ${s.screen}: ${did}, then Back, changed ${ch.map((k) => k === 'draft' ? 'draft(' + Object.keys(Object.assign({}, before.draft, after.draft)).filter((x) => JSON.stringify(before.draft[x]) !== JSON.stringify(after.draft[x])).slice(0, 6).join(', ') + ')' : k + ' ' + JSON.stringify(before[k]) + ' > ' + JSON.stringify(after[k])).join('; ')}`); }
    s = n;
  }
  return { seq, picked };
}
const filesHere = async (A) => { await A.click('edit', 'name', 'name'); await A.click('change'); await A.click('loc', 'auto'); await A.click('sheet-close').catch(() => {}); await A.sleep(500); await onToReview(A); };
const beginNew = async (A) => { await editBeginTo(A); await A.click('pick', 'new'); await A.click('next'); await A.sleep(900); await onToReview(A, nameOn); };
const computerHere = async (A) => { await A.click('edit', 'where', 'where'); await A.click('pick', 'this'); await A.click('next'); await A.sleep(900); await onToReview(A); };
const copyNotNow = async (A) => { await A.click('edit', 'safe', 'safe'); await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); await onToReview(A); };
/* the steps a configuration's own answers walked, which a Back run from its Review must show (each once): the page's own
   rule cannot catch a step it wrongly leaves off (Muse delta2; Astra at 41d: a files place's NAS steps were skipped) */
const BACK_HAS = { 'Home NAS files over SSH': ['nas-find', 'nas-identity', 'nas-key', 'nas-folder', 'name'], 'Home NAS files mounted': ['nas-find', 'name'],
  'Home NAS source over SSH': ['nas-find', 'nas-identity', 'nas-key', 'nas-folder', 'begin'], 'Home NAS source mounted': ['nas-find', 'begin'], 'a completed new Server': ['s-kind', 's-ready', 'where'],
  'a connected existing Server': ['c-route', 'where'], 'restore from a Recovery Kit': ['r-source', 'r-pick', 'begin'], 'restore from a cloud drive': ['r-source', 'r-pick', 'begin'],
  'online import': ['online-service', 'ex-repos', 'begin'], 'online new copy': ['online-service', 'online-details', 'safe'], 'backup on Home NAS': ['safe'], 'backup on a cloud drive': ['safe'], 'away with Tailscale': ['away', 's-kind'] };
/* the steps of another way in that a Back run must never show (reader-795-f: pairing shown for a NAS reached over SSH) */
const BACK_NOT = { 'Home NAS files over SSH': ['nas-pmpair'], 'Home NAS source over SSH': ['nas-pmpair'] };
const ABANDON = { 'Home NAS files over SSH': ['files on This computer', filesHere], 'Home NAS files mounted': ['files on This computer', filesHere], 'Home NAS source over SSH': ['Begins as New', beginNew],
  'Home NAS source mounted': ['Begins as New', beginNew], 'a completed new Server': ['This computer', computerHere], 'a connected existing Server': ['This computer', computerHere],
  'restore from a Recovery Kit': ['Begins as New', beginNew], 'restore from a cloud drive': ['Begins as New', beginNew], 'online import': ['Begins as New', beginNew],
  'online new copy': ['Not now for the copy', copyNotNow], 'away with Tailscale': ['This computer', computerHere] };
const KEEP = () => { const S = O55.S, d = S.sess.drafts.main, n = S.sess.nas || {}, r = S.sess.restore || {}, c = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="commit"]');
  return { mode: d.project_mode, name: d.project_name, src: d.project_source_ref, transport: d.project_transport, loc: d.local_location, online: d.online_mode, forge: d.forge, repo: d.repository_ref,
    backup: d.backup_source_ref, btransport: d.backup_transport, storage: d.storage_mode, preflight: d.preflight_result_refs, auth: d.source_access_authorization_refs,
    folder: S.sess.folder ? S.sess.folder.path : null, nas: [n.device || null, n.method || null, n.at || null, n.share || null, n.volume || null, !!n.installed],
    restore: [r.source || null, r.kit || null, r.pick || null], commit: !!c && !c.disabled && c.getAttribute('aria-disabled') !== 'true' }; };
async function keptUnchanged(t, label, establish, later = false) {
  await flow(t, label, async (A, bad) => {
    await establish(A, bad); await A.screen('review'); const before = await A.frame().evaluate(KEEP);
    if (await A.has('edit', 'begin')) await editBeginTo(A); else { for (let i = 0; i < 6 && (await A.snap()).screen !== 'begin'; i++) await pressBack(A); await A.screen('begin'); }
    if (later) await A.click('later'); else { await A.waitEnabled('next'); await A.click('next'); } await A.sleep(1000);
    await goOnToReview(A);
    const after = await A.frame().evaluate(KEEP);
    const lost = Object.keys(before).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])).map((k) => k + ' ' + JSON.stringify(before[k]).slice(0, 60) + ' > ' + JSON.stringify(after[k]).slice(0, 60));
    if (lost.length) bad.push(`${label}: kept unchanged, yet ${lost.join('; ')}`);
  });
}
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
      after: abandoned([...SERVER_STEPS, 'away', 'away-setup']), choose: { where: async (A) => { await A.click('pick', 'this'); await A.click('next'); } } });
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
    /* (a populated sub-choice is made first, so a kept one would show: SFTP > WebDAV, given up, SFTP again: Astra AST-D3) */
    await flow(t, '11a backup place given up > chosen again', async (A, bad) => { await A.toSafe('Notes'); await A.click('backup'); await A.click('bdest', 'sftp'); await A.sleep(300);
      const subs = (await A.snap()).buttons.filter((b) => b.action === 'bsub').map((b) => b.arg); const sub = subs.find((x) => /webdav/i.test(x)) || subs[1] || subs[0];
      if (!sub) bad.push('11a backup: SFTP offered no sub-choice to populate'); else await A.click('bsub', sub);
      const b0 = await A.frame().evaluate(() => JSON.parse(JSON.stringify(O55.S.sess.backup))); if (sub && b0.sub !== sub) bad.push('11a backup: the sub-choice did not take: ' + JSON.stringify(b0.sub));
      await A.click('sheet-close').catch(() => {}); await toReview(A);
      await A.click('edit', 'backup'); await A.click('bdest', 'none'); await A.click('sheet-close').catch(() => {}); await onToReview(A);
      await A.click('edit', 'safe'); await A.click('backup'); await A.click('bdest', 'sftp'); const b = await A.frame().evaluate(() => JSON.parse(JSON.stringify(O55.S.sess.backup)));
      if (b.sub || Object.keys(b.access || {}).length) bad.push('11a backup: SFTP came back with ' + JSON.stringify({ sub: b.sub, access: b.access }));
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
  async 'row 12 · each review finding at e9b: AST-1 saved hosted Gitea and Forgejo picks resume with nothing chosen; AST-2 Not now before any Continue; AST-3 a saved folder session with no branch data; AST-4 repository Edit, then New and a new copy; AST-5 default boot after a fault scenario; Muse MU-1 restore source kept twice, then changed; AST-D1 NAS device replaced; AST-D2 settled NAS facts after abandonment, reload and resume (Sol A2 and A3 are rows 11a and 11b)'(t) {
    /* AST-1 (constructed records: no public route on this build picks a retired kind) */
    for (const [card, variant] of [['gitea', 'gitea_cloud'], ['forgejo', 'forgejo_cloud']])
      await flow(t, `12 AST-1 saved ${variant} pick resumed (constructed)`, async (A, bad) => {
        await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(800);
        await A.frame().evaluate(([card, variant]) => { const saved = O55.store.get('onboarding', null); saved.started = 'ast1-' + Date.now(); saved.status = 'closed'; saved.screen = 'online-service';
          saved.online = { purpose: 'copy', forge: card, variant, wanted: true, addresses: { [card + '|' + variant]: 'https://retired.example.test' } };
          Object.assign(saved.drafts.main, { online_mode: 'none', forge: 'none', forge_provider_variant: null, forge_instance_url: '' });
          O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, [card, variant]);
        await A.resume();
        await emptyPicker(A, bad, `AST-1 ${variant}`);
        if (await A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) #o55f-address').count()) { await A.fill('o55f-address', 'https://new.example.test'); await A.sleep(400); }
        const r = await A.frame().evaluate(() => { const p = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary'); return { on: !!p && !p.disabled && p.getAttribute('aria-disabled') !== 'true', variant: O55.S.sess.drafts.main.forge_provider_variant }; });
        if (r.on || r.variant) bad.push(`AST-1 ${variant}: an address alone turns Continue on or writes a kind: ${JSON.stringify(r)}`); });
    /* AST-2 */
    await row(t, '12 AST-2 Not now before any Continue', { establish: async (A) => { await A.toSafe('Notes'); }, invalidate: async (A) => { await A.click('online', undefined, 'online-service'); await A.click('notNow', undefined, 'safe'); },
      noReturn: copyGone, after: abandoned(['online-service', 'online-signin', 'online-details']), force: ['online-service'] });
    /* AST-3 (a folder session closed and resumed: this build keeps no branch data, so its record has the predecessor's shape) */
    /* (with --set predecessorE9=<e9b page>, a record that page wrote itself, Muse delta2 Finding 3; otherwise this build's
       record with its branch data taken out) */
    await row(t, '12 AST-3 resumed folder session > New' + (t.args.predecessorE9 ? ' (written by the e9b page)' : ' (constructed)'), { establish: async (A) => {
        if (t.args.predecessorE9) { const saved = await onOldPage(A, t.args.predecessorE9, toFolderProject); await resumeRecord(A, saved); await A.screen('review'); return; }
        await toFolderProject(A); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
        await A.frame().evaluate(() => { const saved = O55.store.get('onboarding', null); delete saved.branch; O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); });
        await A.resume(); await A.screen('review'); },
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
    /* Muse MU-1: the restore's source kept twice, then changed to a cloud drive before reaching it; Back to Review must not
       offer the old backup (no backup_source_ref, Loom not shown, Restore off) */
    await flow(t, '12 MU-1 restore source kept twice, then changed', async (A, bad) => { await toKitRestore(A); await keepRestore(A); await keepRestore(A);
      await A.click('edit', 'begin', 'begin'); await A.click('next', undefined, 'r-source'); await A.click('source', 'cloud'); await A.sleep(400); await pressOn(A); await A.sleep(1200);
      const seq = await walkBack(A, [{ on: 'review|safe|name', x: 'Loom' }], bad, 'MU-1');
      /* (an empty walk proves nothing: the run reaches Welcome through the restore's source and Begins as, Muse minor 6) */
      const gone = ['r-source', 'begin', 'where', 'welcome'].filter((x) => !seq.includes(x)); if (gone.length || seq[seq.length - 1] !== 'welcome') bad.push('MU-1: the Back run never reached ' + gone.join(', ') + ' (' + seq.join(' > ') + ')');
      const r = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { screen: O55.S.sess.screen, ref: d.backup_source_ref, transport: d.backup_transport, name: d.project_name, missing: O55.draft.missing(d).map((m) => m.key) }; });
      if (r.ref || /Loom/.test(r.name || '') || !r.missing.length) bad.push('MU-1: after Back (' + seq.join(' > ') + ') the plan still holds the old backup: ' + JSON.stringify(r)); });
    /* Astra AST-D1: Home NAS over SSH done, then Begins as kept and another device picked: Back never reaches the old
       folder step, and nothing of Home NAS's folder, profile or access stays in the plan */
    await flow(t, '12 AST-D1 NAS device replaced', async (A, bad) => { await toNasProject(A);
      await A.click('edit', 'begin', 'begin'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-media"]'), null, 8000); await A.click('device', 'nas-media'); await A.sleep(400);
      /* (the device is replaced by its Continue, the lead's ruling 1103040758: Media Server's SSH is switched on by Check
         again first, as Sol's route does; Back before Continue keeps Home NAS, row 21) */
      if (await A.has('checkAgain')) { await A.click('checkAgain'); await A.waitFor(() => !!(O55.S.env.devices.find((x) => x.id === 'nas-media') || {}).ssh, null, 8000).catch(() => {}); await A.sleep(400); }
      await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      const seq = []; for (let i = 0; i < 10; i++) { const s = await look(A); seq.push(s.screen); if (s.screen === 'nas-folder' || !s.back) break; await pressBack(A); }
      if (seq.includes('nas-folder')) bad.push('AST-D1: Back reached the old folder step: ' + seq.join(' > '));
      const d = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main, n = O55.S.sess.nas || {}; return { src: d.project_source_ref, auth: d.source_access_authorization_refs, at: n.at || null, profile: n.profile || null }; });
      if (d.src || (d.auth || []).some((r) => /^(ssh-key|pairing):/.test(r)) || d.at || d.profile) bad.push('AST-D1: Home NAS still bound in the plan: ' + JSON.stringify(d)); });
    /* Astra AST-D2: Home NAS over SSH done, then New; Close, and the page loaded again (a normal page reloads and offers
       Resume; the sandbox keeps no storage, so its unchanged record is carried to the fresh page): the host trusted and
       the key installed stay, the NAS is not chosen again, and choosing Home NAS again asks for no password */
    await flow(t, '12 AST-D2 settled NAS host and key survive abandonment, reload and resume', async (A, bad) => { await toNasProject(A); await goNew(A);
      const facts = (X) => X.frame().evaluate(() => { const S = O55.S, d = S.env.devices.find((x) => x.id === 'nas-home'); return { hosts: Object.keys(S.env.here.knownHosts || {}), auth: (d && d.authorized) || [], keys: (S.env.here.sshKeys || []).map((k) => k.id), nas: S.sess.nas ? S.sess.nas.device || null : null }; });
      const before = await facts(A); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
      const saved = await A.frame().evaluate(() => JSON.stringify(O55.store.get('onboarding', null)));
      await A.reopen();
      /* (an opaque sandbox keeps nothing across a load, so it boots a first run with the window open: Close it, then hand it
         the record, as resumeAt does) */
      if (A.sandboxed()) { await A.frame().locator('[data-o55-do="close"]').first().click({ timeout: 5000 }).catch(() => {}); await A.sleep(900);
        await A.frame().evaluate((saved) => { O55.store.set('onboarding', JSON.parse(saved)); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, saved); }
      await A.resume();
      const got = await facts(A);
      const lost = [...before.hosts.filter((h) => !got.hosts.includes(h)).map((h) => 'host ' + h), ...before.auth.filter((k) => !got.auth.includes(k)).map((k) => 'authorization ' + k), ...before.keys.filter((k) => !got.keys.includes(k)).map((k) => 'key ' + k)];
      if (lost.length) bad.push('AST-D2: the resumed session lost ' + lost.join(', '));
      if (got.nas) bad.push('AST-D2: the given-up NAS came back chosen: ' + got.nas);
      await A.screen('review'); await editBeginTo(A); await A.click('pick', 'existing'); await A.click('sub', 'device'); await A.click('next', undefined, 'nas-find');
      await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000); await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity');
      const walked = []; for (let i = 0; i < 10; i++) { const sc = (await A.snap()).screen; walked.push(sc); if (['nas-folder', 'name', 'review'].includes(sc) || sc === 'nas-signin') break;
        if (sc === 'nas-identity' && await A.has('trust')) await A.click('trust'); else { await A.waitEnabled('next').catch(() => {}); await pressOn(A); } await A.sleep(900); }
      if (walked.includes('nas-signin')) bad.push('AST-D2: Home NAS chosen again asks for the password again: ' + walked.join(' > ')); });
    /* AST-5 */
    await flow(t, '12 AST-5 default boot after a fault scenario', async (A, bad) => { await A.boot({ scenario: 'fresh+sshNotAllowed' }); await A.boot();
      const sc = await A.frame().evaluate(() => { try { return O55.store.get('scenario', ''); } catch (e) { return 'unreadable'; } }); if (sc && sc !== 'fresh') bad.push('AST-5: the default boot kept scenario ' + sc); });
  },
  async 'row 13a · each Begins-as kind kept unchanged (Edit, Continue, on to Review) loses nothing: folder, online, restore from a Recovery Kit and from a cloud drive, New, Later; and backing out of a kept Restore Edit'(t) {
    await flow(t, '13a restore (Recovery Kit): Edit, then Back without Continue, then on to Review', async (A, bad) => { await toKitRestore(A); await A.screen('review'); const before = await A.frame().evaluate(KEEP);
      await editBeginTo(A); await pressBack(A); await A.sleep(800); await goOnToReview(A); const after = await A.frame().evaluate(KEEP);
      const lost = Object.keys(before).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])); if (lost.length) bad.push('13a back-out: ' + lost.map((k) => k + ' ' + JSON.stringify(before[k]).slice(0, 50) + ' > ' + JSON.stringify(after[k]).slice(0, 50)).join('; ')); });
    await keptUnchanged(t, '13a folder kept', toFolderProject);
    await keptUnchanged(t, '13a online kept', toRepoProject);
    await keptUnchanged(t, '13a restore (Recovery Kit) kept', toKitRestore);
    await keptUnchanged(t, '13a restore (cloud drive) kept', toCloudRestore);
    await keptUnchanged(t, '13a New kept', async (A) => { await A.toSafe('Notes'); await toReview(A); });
    await keptUnchanged(t, '13a Later kept', async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('later'); await onToReview(A); }, true);
  },
  async 'row 13b · the NAS Begins-as kind kept unchanged (Edit, Continue, on to Review) loses nothing: over SSH, a shared folder (SMB), NFS, a mounted volume'(t) {
    SELFTEST = t.args.selftest || '';
    for (const m of ['ssh', 'smb', 'nfs', 'mounted']) await keptUnchanged(t, `13b NAS (${m}) kept`, (A, bad) => toNasBy(A, m, bad));
  },
  async 'row 14 · the NAS way in changed inside the same beginning (SSH, then a mounted volume, a shared folder, NFS): the plan keeps nothing of the SSH access (Sol FO22-N2)'(t) {
    SELFTEST = t.args.selftest || '';
    for (const m of ['mounted', 'smb', 'nfs'])
      await flow(t, `14 NAS SSH > ${m}`, async (A, bad) => { await toNasProject(A);
        await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
        await A.click('method', m); await A.sleep(400); const s = await A.snap(), pick = s.buttons.find((b) => b.action === (m === 'mounted' ? 'volume' : 'share'));
        await A.click(pick.action, pick.arg); await A.sleep(300); await pressOn(A); await A.sleep(900); await throughShare(A, bad); await onToReview(A, nameOn);
        const d = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { src: d.project_source_ref, tr: d.project_transport, auth: d.source_access_authorization_refs, pre: d.preflight_result_refs }; });
        if ((d.auth || []).some((r) => /^ssh-key:/.test(r)) || (d.pre || []).some((r) => /^preflight:ssh:/.test(r))) bad.push(`14 ${m}: the SSH access stays in the plan: ${JSON.stringify(d)}`);
        if (!String(d.src || '').startsWith(m + ':') || d.tr !== 'mounted') bad.push(`14 ${m}: the source is not the ${m} one: ${JSON.stringify({ src: d.src, tr: d.tr })}`); });
  },
  async 'row 15 · a Project on an existing Server connected to by approval, then Review > Edit Computer > a new Server, Back twice: the old Server and its trust are not the new one, and Review would ask for the Server (Sol FO22-N3)'(t) {
    await flow(t, '15 existing Server > new Server', async (A, bad) => {
      await A.click('pick', 'connect'); await A.click('next', undefined, 'c-route'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:home"]'), null, 10000);
      await A.click('pickServer', 'pm:home'); await A.click('next', undefined, 'c-review'); await pressOn(A); await A.screen('c-pair');
      await A.waitFor(() => O55.S.sess.connect.paired, null, 15000); await pressOn(A); await A.screen('c-ready'); await A.click('createNew'); await A.screen('begin');
      await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Different Server'); await onToReview(A);
      await A.click('edit', 'where', 'where'); await A.click('pick', 'server'); await A.click('next'); await A.sleep(1200);
      for (let i = 0; i < 2; i++) { if (!(await look(A)).back) break; await pressBack(A); }
      const r = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { screen: O55.S.sess.screen, mode: d.server_mode, ref: d.server_ref, trust: d.server_trust_confirmed, missing: O55.draft.missing(d).map((m) => m.key), paired: !!O55.S.sess.connect.paired }; });
      if (r.ref || r.trust || !r.missing.length) bad.push('FO22-N3: the new Server inherits the old one: ' + JSON.stringify(r));
      if (!r.paired) bad.push('FO22-N3: the old pairing (outside the plan) was lost: ' + JSON.stringify(r)); });
  },
  async 'row 16 · records written by the actual predecessor pages (07dbf43786, e9b704975a) resumed on this build: a 07db folder session > New, a 07db hosted Gitea pick, an e9b record saved on Safe after Not now (--set predecessor07=<page> --set predecessorE9=<page>)'(t) {
    const pages = { '07db': t.args.predecessor07, e9b: t.args.predecessorE9 };
    for (const [k, v] of Object.entries(pages)) await t.check(`the ${k} page is given (--set predecessor${k === '07db' ? '07' : 'E9'}=<built page>)`, !!v, String(v));
    if (!pages['07db'] || !pages.e9b) return;
    const onOld = onOldPage, resumeHere = resumeRecord;
    await flow(t, '16 07db folder session > New (AST-3)', async (A, bad) => { const saved = await onOld(A, pages['07db'], toFolderProject); if (/"branch"|"openedAt"|"wanted"/.test(saved)) bad.push('16: the 07db record already has new fields');
      await resumeHere(A, saved); await A.screen('review'); await goNew(A);
      const seq = await walkBackContinuing(A, [{ on: 'review|name|safe', x: 'recipe-app' }], bad, '16 07db folder', (A) => A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return d.project_source_ref || /recipe-app/.test(d.local_location) ? 'brought the old folder back' : null; }));
      if (seq.includes('ex-folder')) bad.push('16 07db folder: Back reached the abandoned folder step: ' + seq.join(' > ')); });
    /* Astra delta3: an actual 07db or e9b record of a Home NAS over SSH, resumed unchanged, keeps its source and access,
       and Back walks its key and folder steps */
    for (const k of ['07db', 'e9b'])
      await flow(t, `16 ${k} Home NAS over SSH record resumed unchanged (Astra delta3)`, async (A, bad) => { const saved = await onOld(A, pages[k], toNasProject), rec = JSON.parse(saved), d0 = rec.drafts.main;
        if (!/^ssh:/.test(d0.project_source_ref || '')) bad.push(`16 ${k} NAS: the old page wrote no SSH source: ${d0.project_source_ref}`);
        await resumeHere(A, saved); await A.screen('review');
        const d1 = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { src: d.project_source_ref, auth: d.source_access_authorization_refs.slice().sort() }; });
        if (d1.src !== d0.project_source_ref || JSON.stringify(d1.auth) !== JSON.stringify((d0.source_access_authorization_refs || []).slice().sort())) bad.push(`16 ${k} NAS: resumed, the source or access changed: ${JSON.stringify({ was: [d0.project_source_ref, d0.source_access_authorization_refs], now: d1 })}`);
        const seq = await walkBack(A, [], bad, `16 ${k} NAS`), miss = ['nas-key', 'nas-folder'].filter((x) => !seq.includes(x));
        if (miss.length) bad.push(`16 ${k} NAS: Back skipped ${miss.join(', ')} (${seq.join(' > ')})`); });
    /* Astra delta4 with the real writer: on the e9b page, the Home NAS kept, then k-ed picked on nas-key and the window
       closed: e9b saves installed with key k-ed while the plan's access still names k-pm. Resumed here, nothing is bound
       and no authorization for k-ed is invented */
    await flow(t, '16 e9b record with k-ed picked and not continued binds nothing (Astra delta4, real writer)', async (A, bad) => {
      const saved = JSON.parse(await onOld(A, pages.e9b, async (A) => { await toNasProject(A); await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.sleep(600);
        await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
        for (let i = 0; i < 4 && (await A.snap()).screen !== 'nas-key'; i++) { if (await A.has('trust')) await A.click('trust'); else { await A.waitEnabled('next').catch(() => {}); await pressOn(A); } await A.sleep(900); }
        if ((await A.snap()).screen === 'nas-key' && await A.has('pick', 'k-ed')) await A.click('pick', 'k-ed'); await A.sleep(400); }));
      if (!saved.nas || saved.nas.key !== 'k-ed') t.log('16 e9b k-ed: the e9b record kept key ' + JSON.stringify(saved.nas && saved.nas.key) + ' (installed ' + JSON.stringify(saved.nas && saved.nas.installed) + ')');
      await resumeHere(A, JSON.stringify(saved));
      const st = await A.frame().evaluate(() => { const S = O55.S, n = S.sess.nas || {}, d = S.env.devices.find((x) => x.id === n.device) || {}; return { key: n.key || null, installedFor: n.installedFor || null, auth: (d.authorized || []).slice() }; });
      if ((st.installedFor && /\|k-ed$/.test(st.installedFor)) || st.auth.some((k) => /:k-ed$/.test(k))) bad.push('the un-continued k-ed was bound or authorized on resume: ' + JSON.stringify(st)); });
    /* Astra delta4: an actual e9b Home NAS record with one bound field changed binds nothing on resume: the key, the
       account, the port or the host disagreeing with the record's own access means the person verifies again, and no
       authorization or known host is invented for it */
    for (const [what, change] of [['the key', (r) => { r.nas.key = 'k-ed'; }], ['the account', (r) => { r.nas.user = 'someone-else'; }],
      ['the port', (r) => { r.nas.manual = true; r.nas.port = '2222'; r.nas.addr = '192.168.1.20'; }], ['the host', (r) => { r.nas.device = 'nas-media'; }]])
      await flow(t, `16 e9b Home NAS record with ${what} changed binds nothing (Astra delta4)`, async (A, bad) => { const saved = JSON.parse(await onOld(A, pages.e9b, toNasProject));
        if (!saved.nas) { bad.push('the e9b page wrote no NAS'); return; } change(saved); const user = saved.nas.user || 'jared';
        await resumeHere(A, JSON.stringify(saved));
        const st = await A.frame().evaluate((user) => { const S = O55.S, n = S.sess.nas || {}, d = S.env.devices.find((x) => x.id === n.device) || {}; return { trusted: !!n.trusted, installed: !!n.installed, trustedFor: n.trustedFor || null, installedFor: n.installedFor || null, auth: (d.authorized || []).slice(), hosts: Object.keys(S.env.here.knownHosts || {}) }; }, user);
        if (st.trustedFor || st.installedFor || st.installed) bad.push(`${what} changed: the record's facts were bound anyway: ${JSON.stringify(st)}`);
        if (what === 'the key' && st.auth.some((k) => /:k-ed$/.test(k))) bad.push(`the key changed: an authorization for k-ed was invented: ${st.auth.join(', ')}`);
        if (what === 'the port' && st.hosts.some((h) => /:2222$/.test(h))) bad.push(`the port changed: a known host on 2222 was invented: ${st.hosts.join(', ')}`); });
    await flow(t, '16 07db hosted Gitea pick resumed (AST-1)', async (A, bad) => { const saved = await onOld(A, pages['07db'], async (A) => { await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await pickSvc(A, 'gitea'); await A.sleep(300);
        if (await A.has('variant', 'gitea_cloud')) await A.click('variant', 'gitea_cloud'); else bad.push('16: the 07db page offered no hosted Gitea kind'); });
      await resumeHere(A, saved); await A.screen('online-service'); await emptyPicker(A, bad, '16 07db hosted Gitea'); });
    /* (GitLab picked before Not now: the card the e9b page kept is what made its session reopen the picker, Muse delta2
       Finding 3; a walk with no pick passes with the defect present) */
    await flow(t, '16 e9b record saved on Safe after GitLab picked, then Not now (Muse delta Major 1)', async (A, bad) => { const saved = await onOld(A, pages.e9b, async (A) => { await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await pickSvc(A, 'gitlab'); await A.sleep(300); await A.click('notNow', undefined, 'safe'); });
      if (/"wanted"/.test(saved)) bad.push('16: the e9b record already has the copy answer');
      const card = (JSON.parse(saved).online || {}).forge; if (card !== 'gitlab') bad.push('16: the e9b record carries no picked card, so this case cannot show Major 1: ' + JSON.stringify(JSON.parse(saved).online));
      await resumeHere(A, saved); await A.screen('safe');
      const ol = await A.frame().evaluate(() => O55.S.sess.online || {}); if (ol.wanted !== false || ol.forge) bad.push('16 e9b Not now: resumed, the copy is still wanted or its card still chosen: ' + JSON.stringify(ol).slice(0, 200));
      const seq = await walkBackContinuing(A, [], bad, '16 e9b Not now', copyGone); if (seq.includes('online-service')) bad.push('16 e9b Not now: Back reopened the given-up picker: ' + seq.join(' > '));
      const v = await copyGone(A); if (v) bad.push('16 e9b Not now: the plan ' + v); });
  },
  async 'row 17 · each Begins-as kind kept once, then changed to Later, then Back all the way to Welcome: every screen shown applies, none repeats, no step of the abandoned Project (final-onb FO22-Later)'(t) {
    const KINDS = [['folder', toFolderProject], ['online', toRepoProject], ['restore', toKitRestore], ['NAS', toNasProject], ['New', async (A) => { await A.toSafe('Notes'); await toReview(A); }]];
    for (const [kind, est] of KINDS)
      await flow(t, `17 ${kind} kept > Later`, async (A, bad) => { await est(A); await A.screen('review');
        await editBeginTo(A); await A.waitEnabled('next'); await A.click('next'); await A.sleep(900); await goOnToReview(A);
        await editBeginTo(A); await A.click('later'); await A.sleep(900); await A.screen('review');
        const seq = await walkBack(A, [], bad, `17 ${kind}`);
        const project = seq.filter((x) => ['name', 'like', 'safe', 'ex-folder', 'ex-repos', 'online-service', 'online-signin', 'online-details', 'r-source', 'r-unlock', 'r-pick', 'r-preview'].includes(x) || /^nas-/.test(x));
        if (project.length) bad.push(`17 ${kind}: Back walks the abandoned Project's steps: ${project.join(', ')} (${seq.join(' > ')})`);
        const bi = seq.indexOf('begin'); if (bi < 0 || seq[bi + 1] !== 'where') bad.push(`17 ${kind}: Back from Begins as should reach the step before it: ${seq.join(' > ')}`); });
  },
  /* the lead's Back ruling (1103011909): on a step Review's Edit opened, Back before going on returns to Review; Review
     reached again (by that Back, or by an Edit kept unchanged) keeps the path that led to it, so Back from Review walks the
     same steps in forward order, never a repeat, through a step's own sub-steps (Safe's online copy) */
  async 'row 18 · from each Review Edit link, Back before Continue returns to Review and an Edit kept unchanged returns to it, both with the path to Review unchanged; then Back runs to Welcome with no repeat and every screen applying (lead ruling 1103011909)'(t) {
    const PLANS = [['online copy', async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); await toReview(A); }], ['folder', toFolderProject], ['online repository', toRepoProject],
      ['new Server', async (A) => { await toNewServer(A); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await onToReview(A); }]];
    for (const [kind, est] of PLANS)
      await flow(t, `18 ${kind}`, async (A, bad) => { await est(A); await A.screen('review');
        const H = () => A.frame().evaluate(() => O55.S.sess.history.slice()), h0 = await H(), same = (h) => JSON.stringify(h) === JSON.stringify(h0);
        const targets = [...new Set((await A.snap()).buttons.filter((b) => b.action === 'edit').map((b) => b.arg))];
        if (!targets.length) bad.push(`18 ${kind}: Review shows no Edit link`);
        for (const tg of targets) {
          await A.click('edit', tg); await A.sleep(700); const opened = await look(A);
          if (!opened.edit) bad.push(`18 ${kind} Edit ${tg}: ${opened.screen} is not marked as opened by Review's Edit`);
          await pressBack(A); let s = await look(A); if (s.screen === opened.screen) { await pressBack(A); s = await look(A); } /* (Back closes an open sheet first) */
          if (s.screen !== 'review') { bad.push(`18 ${kind} Edit ${tg}: Back on ${opened.screen} went to ${s.screen}, not back to Review`); break; }
          const h1 = await H(); if (!same(h1)) bad.push(`18 ${kind} Edit ${tg} then Back: the path to Review changed: ${h0.join(' > ')} became ${h1.join(' > ')}`);
          await A.click('edit', tg); await A.sleep(700); await onToReview(A);
          const h2 = await H(); if (!same(h2)) bad.push(`18 ${kind} Edit ${tg} kept: the path to Review changed: ${h0.join(' > ')} became ${h2.join(' > ')}`);
        }
        const seq = await walkBack(A, [], bad, `18 ${kind}`);
        if (seq[seq.length - 1] !== 'welcome') bad.push(`18 ${kind}: the Back run from Review stopped on ${seq[seq.length - 1]} (${seq.join(' > ')})`);
        t.log(`18 ${kind} Edit targets ${targets.join(', ')}; Back ${seq.join(' > ')}`); });
  },
  /* the lead's class proof for "an unchanged answer clears nothing" (round on 41d8119aec, Astra AST-D4 the fifth case):
     rich configurations, and for each every Edit link its Review shows, Edit > Continue with nothing changed > Review: the
     draft deep-equals the draft before (but its revision counter), Review shows the same rows, the Back path is the same */
  async 'row 20 · generated: every Review Edit link of each rich configuration (Home NAS files over SSH and mounted, a Home NAS source over SSH and mounted, a completed new Server, a connected existing Server, restore from a Recovery Kit and a cloud drive, online import and new copy, backup on Home NAS and a cloud drive, away with Tailscale), Edit and Continue unchanged: draft, Review rows and Back path all unchanged'(t) {
    for (const [kind, est] of RICH)
      await flow(t, `20 ${kind}`, async (A, bad) => { await est(A); await A.screen('review');
        const links = [...new Set((await A.snap()).buttons.filter((b) => b.action === 'edit').map((b) => b.arg))];
        if (!links.length) bad.push(`20 ${kind}: Review shows no Edit link`);
        for (const tg of links) {
          const before = await A.frame().evaluate(SNAP20);
          await A.click('edit', tg); await A.sleep(700); const opened = (await A.snap()).screen;
          const walked = await keepOn(A);
          if (walked[walked.length - 1] !== 'review') { bad.push(`20 ${kind} Edit ${tg} (${opened}): Continue unchanged never came back to Review: ${walked.join(' > ')}`); break; }
          const after = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, before.draft, after.draft)).filter((k) => JSON.stringify(before.draft[k]) !== JSON.stringify(after.draft[k]));
          if (dk.length) bad.push(`20 ${kind} Edit ${tg} kept: the draft changed: ${dk.map((k) => k + ' ' + JSON.stringify(before.draft[k]).slice(0, 60) + ' > ' + JSON.stringify(after.draft[k]).slice(0, 60)).join('; ')}`);
          const rk = [...new Set([...before.rows, ...after.rows])].filter((r) => !before.rows.includes(r) || !after.rows.includes(r));
          if (rk.length) bad.push(`20 ${kind} Edit ${tg} kept: Review's rows changed: ${rk.join(' | ')}`);
          if (JSON.stringify(before.history) !== JSON.stringify(after.history)) bad.push(`20 ${kind} Edit ${tg} kept: the Back path changed: ${before.history.join(' > ')} became ${after.history.join(' > ')}`);
          t.log(`20 ${kind} Edit ${tg}: ${walked.join(' > ')}`);
        }
        const inv = await A.frame().evaluate(INVAR); if (inv.length) bad.push(`20 ${kind}: the plan holds references no answer gives: ${inv.join('; ')}`);
        /* (FO-45, widened: Review, Name and every Back screen read a place by its own name and path, never a raw reference of
           any family the page stores: RAW_RE, STORED_REFS) */
        const raw = await rawStale(A), rows = rawIn((await A.frame().evaluate(SNAP20)).rows.map((r) => ['Review row ' + r.split('=')[0], r.slice(r.indexOf('=') + 1)]), raw.filter((e) => e.x).map((e) => e.x));
        if (rows.length) bad.push(`20 ${kind}: Review shows a raw locator: ${rows.join(' | ')}`);
        const seq = await walkBack(A, raw, bad, `20 ${kind}`), missed = (BACK_HAS[kind] || []).filter((x) => !seq.includes(x));
        if (missed.length) bad.push(`20 ${kind}: the Back run from Review leaves out still-current steps ${missed.join(', ')} (${seq.join(' > ')})`);
        const foreign = (BACK_NOT[kind] || []).filter((x) => seq.includes(x)); if (foreign.length) bad.push(`20 ${kind}: the Back run shows another way in's steps ${foreign.join(', ')} (${seq.join(' > ')})`);
        if (seq[seq.length - 1] !== 'welcome') bad.push(`20 ${kind}: the Back run from Review stopped on ${seq[seq.length - 1]} (${seq.join(' > ')})`); });
    /* abandoning an answer clears what it gave the plan (Astra AST-D6: files moved to This computer kept the NAS place and
       its key): each configuration's own answer given up, then every reference in the plan still describes an answer */
    for (const [kind, est] of RICH) { if (!ABANDON[kind]) continue; const [to, move] = ABANDON[kind];
      await flow(t, `20 ${kind} given up: ${to}`, async (A, bad) => { await est(A); await A.screen('review'); await move(A); await A.screen('review');
        const inv = await A.frame().evaluate(INVAR); if (inv.length) bad.push(`20 ${kind} > ${to}: the plan still holds ${inv.join('; ')}`);
        const seq = await walkBack(A, [], bad, `20 ${kind} > ${to}`);
        if (seq[seq.length - 1] !== 'welcome') bad.push(`20 ${kind} > ${to}: the Back run from Review stopped on ${seq[seq.length - 1]} (${seq.join(' > ')})`); }); }
    /* Astra AST-D5: Begins as kept, then another device's address typed at the NAS step: it starts from nothing (no trust,
       install, profile or access of the Home NAS), and a reload invents no settled fact for it */
    await flow(t, '20 AST-D5 a typed address of another device after a kept Home NAS', async (A, bad) => { await toNasProject(A); await A.screen('review');
      const FACTS = () => { const S = O55.S, m = S.env.devices.find((x) => x.address === '192.168.1.31') || {}; return { host: Object.keys(S.env.here.knownHosts || {}).filter((h) => h.indexOf('192.168.1.31') === 0), auth: (m.authorized || []).slice(), id: m.id || null }; };
      const f0 = await A.frame().evaluate(FACTS);
      await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      await A.click('manualOn'); await A.sleep(300); await A.fill('o55f-addr', '192.168.1.31'); await A.sleep(400); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      const n = await A.frame().evaluate(() => { const S = O55.S, n = S.sess.nas || {}, d = S.sess.drafts.main; return { device: n.device, trusted: !!n.trusted, installed: !!n.installed, profile: n.profile || null, at: n.at || null, src: d.project_source_ref, auth: d.source_access_authorization_refs, pre: d.preflight_result_refs.filter((r) => /^preflight:(ssh|paired)/.test(r)) }; });
      if (n.device !== f0.id) bad.push('AST-D5: the typed address did not choose its device: ' + JSON.stringify(n));
      if (n.trusted || n.installed || n.profile || n.at) bad.push('AST-D5: the typed device inherited the Home NAS: ' + JSON.stringify(n));
      if (n.src || n.auth.some((r) => /^(ssh-key|pairing):/.test(r)) || n.pre.length) bad.push('AST-D5: the plan kept the Home NAS source or access: ' + JSON.stringify(n));
      await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
      const saved = await A.frame().evaluate(() => JSON.stringify(O55.store.get('onboarding', null)));
      await A.reopen();
      if (A.sandboxed()) { await A.frame().locator('[data-o55-do="close"]').first().click({ timeout: 5000 }).catch(() => {}); await A.sleep(900);
        await A.frame().evaluate((saved) => { O55.store.set('onboarding', JSON.parse(saved)); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, saved); }
      await A.resume();
      const f1 = await A.frame().evaluate(FACTS);
      const made = [...f1.host.filter((h) => !f0.host.includes(h)).map((h) => 'known host ' + h), ...f1.auth.filter((k) => !f0.auth.includes(k)).map((k) => 'authorization ' + k)];
      if (made.length) bad.push('AST-D5: resume invented settled facts for a device never trusted or installed: ' + made.join(', ')); });
    /* Sol R5's walker: a Back run from Review, then on again with nothing changed, then a second Back run: the second shows
       the same steps as the first, for every chain a step owns (Name's files place on a NAS, Begins as's source, the
       Computer's Server setup, Safe's online copy) */
    for (const kind of ['Home NAS files mounted', 'Home NAS files over SSH', 'Home NAS source over SSH', 'a completed new Server', 'online new copy']) {
      const est = (RICH.find(([k]) => k === kind) || [])[1];
      await flow(t, `20 ${kind}: Back, on again unchanged, Back again`, async (A, bad) => { await est(A); await A.screen('review');
        const first = await walkBack(A, [], bad, `20 ${kind} first`); const w = await keepOn(A); if (w[w.length - 1] !== 'review') { bad.push('never back to Review: ' + w.join(' > ')); return; }
        const second = await walkBack(A, [], bad, `20 ${kind} second`);
        if (JSON.stringify(first) !== JSON.stringify(second)) bad.push(`the second Back run differs: ${first.join(' > ')} then ${second.join(' > ')}`);
        const miss = (BACK_HAS[kind] || []).filter((x) => !second.includes(x)); if (miss.length) bad.push(`the second Back run leaves out ${miss.join(', ')}`);
        const foreign = (BACK_NOT[kind] || []).filter((x) => first.includes(x) || second.includes(x)); if (foreign.length) bad.push(`a Back run shows another way in's steps ${foreign.join(', ')}`); });
    }
    /* reader-795-f: a Home NAS that runs Puppet Master, paired: its Back runs (before and after going on again unchanged)
       show pairing and never the SSH steps */
    await flow(t, '20 a paired Puppet Master NAS: Back, on again unchanged, Back again', async (A, bad) => { await A.boot({ scenario: 'fresh+homeNasPm' });
      await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      await A.click('device', 'nas-home'); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      if ((await A.snap()).screen !== 'nas-pmpair') { bad.push('a Puppet Master NAS did not open pairing: on ' + (await A.snap()).screen); return; }
      if (await A.has('pair')) await A.click('pair');
      const paired = await A.frame().waitForFunction(() => !!(O55.S.sess.nas || {}).paired, null, { timeout: 20000 }).then(() => true).catch(() => false);
      if (!paired) { t.log('20 PM NAS: pairing by approval did not complete in this fixture within 20 s; the case could not run'); return; }
      /* (on to the folder step, where a folder is picked, then on to Review) */
      await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900); await throughNas(A); await onToReview(A, nameOn);
      if ((await A.snap()).screen !== 'review') { bad.push('never reached Review: on ' + (await A.snap()).screen); return; }
      const applies = await A.frame().evaluate(() => O55.ui.onBranch('nas-pmpair')); if (!applies) bad.push('at Review the pairing step does not apply to the paired Puppet Master NAS');
      const first = await walkBack(A, [], bad, '20 PM NAS first'); const w = await keepOn(A); if (w[w.length - 1] !== 'review') { bad.push('never back to Review: ' + w.join(' > ')); return; }
      const second = await walkBack(A, [], bad, '20 PM NAS second');
      /* (pairing applies to this NAS, though Back, like an install or a sign-in, does not revisit a completed verification
         step: lead 1103172509) */
      if (JSON.stringify(first) !== JSON.stringify(second)) bad.push(`the second Back run differs: ${first.join(' > ')} then ${second.join(' > ')}`);
      for (const [n, seq] of [['first', first], ['second', second]]) { const ssh = seq.filter((x) => ['nas-identity', 'nas-key', 'nas-signin', 'nas-install'].includes(x)); if (ssh.length) bad.push(`the ${n} Back run shows SSH steps ${ssh.join(', ')} for a paired NAS`); } });
    /* Sol R4 on bd646e7e6d: the same host and the default port typed at the NAS step, then Continue: nothing changed, so
       nothing of the Home NAS is cleared */
    await flow(t, '20 the same NAS host and port typed, then Continue', async (A, bad) => { await toNasProject(A); await A.screen('review'); const start = await A.frame().evaluate(SNAP20);
      await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      const host = await A.frame().evaluate(() => (O55.S.env.devices.find((x) => x.id === 'nas-home') || {}).address);
      await A.click('manualOn'); await A.sleep(300); await A.fill('o55f-addr', ' ' + String(host).toUpperCase() + ' '); await A.fill('o55f-port', '22'); await A.sleep(400);
      const w = await keepOn(A); if (w[w.length - 1] !== 'review') { bad.push('never back to Review: ' + w.join(' > ')); return; }
      const end = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, start.draft, end.draft)).filter((k) => JSON.stringify(start.draft[k]) !== JSON.stringify(end.draft[k]));
      if (dk.length) bad.push('the same host and port typed changed the draft: ' + dk.map((k) => k + ' ' + JSON.stringify(start.draft[k]).slice(0, 60) + ' > ' + JSON.stringify(end.draft[k]).slice(0, 60)).join('; ')); });
    /* Astra delta3: a Home NAS trusted on port 22, then on 2222, then the page loaded again: both endpoints stay trusted
       (settled facts are kept per device, endpoint and account) */
    await flow(t, '20 one NAS trusted on two ports keeps both after a reload', async (A, bad) => { await toNasProject(A); await A.screen('review');
      const host = await A.frame().evaluate(() => (O55.S.env.devices.find((x) => x.id === 'nas-home') || {}).address);
      await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      await A.click('manualOn'); await A.sleep(300); await A.fill('o55f-addr', host); await A.fill('o55f-port', '2222'); await A.sleep(400); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      if ((await A.snap()).screen === 'nas-identity' && await A.has('trust')) { await A.click('trust'); await A.sleep(900); } else bad.push('port 2222 did not ask to trust its host: on ' + (await A.snap()).screen);
      const HOSTS = () => Object.keys(O55.S.env.here.knownHosts || {});
      await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
      const saved = await A.frame().evaluate(() => JSON.stringify(O55.store.get('onboarding', null)));
      await A.reopen();
      if (A.sandboxed()) { await A.frame().locator('[data-o55-do="close"]').first().click({ timeout: 5000 }).catch(() => {}); await A.sleep(900);
        await A.frame().evaluate((s) => { O55.store.set('onboarding', JSON.parse(s)); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, saved); }
      await A.resume();
      const hosts = await A.frame().evaluate(HOSTS), want = [host, host + ':2222'].filter((h) => !hosts.includes(h));
      if (want.length) bad.push('after the reload these endpoints are no longer trusted: ' + want.join(', ') + ' (known: ' + hosts.join(', ') + ')'); });
    /* Muse delta minor 4: a drive reached for another service is not this place reached */
    await flow(t, '20 Muse minor 4 a restore place reached for another service', async (A, bad) => {
      const r = await A.frame().evaluate(() => { const S = O55.S; S.sess.ui.beganAs = 'restore'; S.sess.restore = { scope: 'project', source: 'cloud', cloud: 'gdrive', reachedFor: 'cloud:dropbox' };
        return { pick: O55.branch.applies('r-pick', S), unlock: O55.branch.applies('r-unlock', S) }; });
      if (r.pick || r.unlock) bad.push('Muse minor 4: Google Drive counts as reached by a Dropbox reach: ' + JSON.stringify(r)); });
  },
  /* the lead's ruling 1103040758, an un-continued selection is not an answer: the twin of row 20. For each rich
     configuration and every Edit link its Review shows, another value picked (or typed), then Back without Continue: the
     draft, Review's rows, the screen's own selection (opened again) and the Back path are all as they were */
  async 'row 21 · generated twin of row 20: every Review Edit link of each rich configuration, another value picked or typed, then Back without Continue: draft, Review rows, the screen\'s own selection and the Back path all unchanged (lead ruling 1103040758)'(t) {
    for (const [kind, est] of RICH)
      await flow(t, `21 ${kind}`, async (A, bad) => { await est(A); await A.screen('review');
        const links = [...new Set((await A.snap()).buttons.filter((b) => b.action === 'edit').map((b) => b.arg))];
        for (const tg of links) {
          const before = await A.frame().evaluate(SNAP20);
          await A.click('edit', tg); await A.sleep(700); const sel0 = await A.frame().evaluate(SEL);
          const did = await pickOther(A); if (!did) { t.log(`21 ${kind} Edit ${tg}: nothing to pick on ${sel0.screen}`); await pressBack(A); await A.sleep(700); continue; }
          if ((await A.snap()).screen !== sel0.screen) { bad.push(`21 ${kind} Edit ${tg}: ${did} left ${sel0.screen} for ${(await A.snap()).screen} without Continue`); break; }
          for (let i = 0; i < 3 && (await A.snap()).screen !== 'review'; i++) { await pressBack(A); await A.sleep(700); }
          if ((await A.snap()).screen !== 'review') { bad.push(`21 ${kind} Edit ${tg}: Back after ${did} on ${sel0.screen} did not return to Review`); break; }
          const after = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, before.draft, after.draft)).filter((k) => JSON.stringify(before.draft[k]) !== JSON.stringify(after.draft[k]));
          if (dk.length) bad.push(`21 ${kind} Edit ${tg} ${did}, Back: the draft changed: ${dk.map((k) => k + ' ' + JSON.stringify(before.draft[k]).slice(0, 60) + ' > ' + JSON.stringify(after.draft[k]).slice(0, 60)).join('; ')}`);
          const rk = [...new Set([...before.rows, ...after.rows])].filter((r) => !before.rows.includes(r) || !after.rows.includes(r));
          if (rk.length) bad.push(`21 ${kind} Edit ${tg} ${did}, Back: Review's rows changed: ${rk.join(' | ')}`);
          if (JSON.stringify(before.history) !== JSON.stringify(after.history)) bad.push(`21 ${kind} Edit ${tg} ${did}, Back: the Back path changed: ${before.history.join(' > ')} became ${after.history.join(' > ')}`);
          await A.click('edit', tg); await A.sleep(700); const sel1 = await A.frame().evaluate(SEL);
          if (JSON.stringify(sel0) !== JSON.stringify(sel1)) bad.push(`21 ${kind} Edit ${tg} ${did}, Back: ${sel0.screen} opened again shows ${JSON.stringify(sel1).slice(0, 200)}, not ${JSON.stringify(sel0).slice(0, 200)}`);
          for (let i = 0; i < 3 && (await A.snap()).screen !== 'review'; i++) { await pressBack(A); await A.sleep(700); }
          t.log(`21 ${kind} Edit ${tg}: ${did} on ${sel0.screen}, Back`);
        }
        const start = await A.frame().evaluate(SNAP20), w = await pickBackWalk(A, bad, `21 ${kind}`);
        if (w.seq[w.seq.length - 1] !== 'welcome') bad.push(`21 ${kind}: the Back run from Review stopped on ${w.seq[w.seq.length - 1]} (${w.seq.join(' > ')})`);
        t.log(`21 ${kind} Back with a pick on every step: ${w.picked.join(' | ')}`);
        const back = await keepOn(A); if (back[back.length - 1] !== 'review') { bad.push(`21 ${kind}: on again from Welcome never reached Review: ${back.join(' > ')}`); return; }
        const end = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, start.draft, end.draft)).filter((k) => JSON.stringify(start.draft[k]) !== JSON.stringify(end.draft[k]));
        if (dk.length) bad.push(`21 ${kind}: after the picks taken back, on to Review again, the draft changed: ${dk.map((k) => k + ' ' + JSON.stringify(start.draft[k]).slice(0, 60) + ' > ' + JSON.stringify(end.draft[k]).slice(0, 60)).join('; ')}`);
        const rk = [...new Set([...start.rows, ...end.rows])].filter((r) => !start.rows.includes(r) || !end.rows.includes(r)); if (rk.length) bad.push(`21 ${kind}: on to Review again, its rows changed: ${rk.join(' | ')}`); });
    /* Sol's Computer-cancel: a completed new Server, Edit Computer > This computer > Back without Continue: the Server's
       steps stay on the path */
    await flow(t, '21 Sol Computer-cancel: a new Server, This computer picked, Back', async (A, bad) => { await newServerPlan(false)(A); await A.screen('review');
      await A.click('edit', 'where', 'where'); await A.click('pick', 'this'); await A.sleep(400); await pressBack(A); await A.sleep(800); await A.screen('review');
      const w = await A.frame().evaluate(() => O55.S.sess.ui.where); if (w && w !== 'server') bad.push('Computer-cancel: the Computer card stayed ' + w);
      const seq = await walkBack(A, [], bad, '21 Computer-cancel'); if (!seq.some((x) => /^s-/.test(x))) bad.push('Computer-cancel: Back skipped the Server steps: ' + seq.join(' > ')); });
    /* Sol's AST-D1 pending cancel (reaudit-3 1103042044): Begins as kept, Media Server picked at the device step, then Back
       without Continue: the Home NAS, its folder and the plan's source are all as they were */
    await flow(t, '21 AST-D1 cancel: Media Server picked, then Back', async (A, bad) => { await toNasProject(A); await A.screen('review');
      const ST = () => { const n = O55.S.sess.nas || {}, d = O55.S.sess.drafts.main; return { device: n.device, profile: n.profile || null, at: n.at || null, label: n.folderLabel || null, trusted: !!n.trusted, installed: !!n.installed, src: d.project_source_ref, auth: d.source_access_authorization_refs.slice().sort(), pre: d.preflight_result_refs.slice().sort() }; };
      const home = await A.frame().evaluate(ST);
      await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      const media = await A.frame().evaluate(() => (O55.S.env.devices.find((x) => x.id !== 'nas-home' && x.address === '192.168.1.31') || O55.S.env.devices.find((x) => x.id !== 'nas-home') || {}).id);
      if (!media) { bad.push('no other device to pick'); return; } await A.click('device', media); await A.sleep(400);
      if (!(await A.frame().evaluate(SEL)).on.includes('device:' + media)) { bad.push('the device step does not show ' + media + ' as picked'); return; }
      await pressBack(A); await A.sleep(900);
      const after = await A.frame().evaluate(ST), diff = Object.keys(home).filter((k) => JSON.stringify(home[k]) !== JSON.stringify(after[k]));
      if (diff.length) bad.push('AST-D1 cancel: Back without Continue changed ' + diff.map((k) => k + ' ' + JSON.stringify(home[k]).slice(0, 70) + ' > ' + JSON.stringify(after[k]).slice(0, 70)).join('; '));
      await goOnToReview(A); const end = await A.frame().evaluate(ST), d2 = Object.keys(home).filter((k) => JSON.stringify(home[k]) !== JSON.stringify(end[k]));
      if (d2.length) bad.push('AST-D1 cancel: on to Review afterwards changed ' + d2.join(', ')); });
    /* typed values are picks too (lead 1103052811; Sol's walker at 41d: a typed NAS address survived Back, a typed port
       cleared the Home source): a value typed on a step, then Back without Continue, leaves the plan, the session's
       answers, the settled facts and the step's own fields (reached again) as they were */
    const nasFind = async (A) => { await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000); };
    const TYPED = [
      ['the NAS address', toNasProject, nasFind, async (A) => { await A.click('manualOn'); await A.sleep(300); await A.fill('o55f-addr', '192.168.1.31'); }],
      ['the NAS port', toNasProject, nasFind, async (A) => { await A.click('manualOn'); await A.sleep(300); await A.fill('o55f-port', '2223'); }],
      ['a Server address', existingServerPlan, async (A) => { await A.click('edit', 'where', 'where'); await pressOn(A); await A.screen('c-route'); },
        async (A) => { if (await A.has('manualOn')) { await A.click('manualOn'); await A.sleep(300); } await A.fill('o55f-addr', 'studio.local'); }],
      ['an own server address', async (A) => { await toDetails(A, 'gitea', 'gitea_self_managed', GITEA); await A.click('next', undefined, 'safe'); await toReview(A); },
        async (A) => { await A.click('edit', 'safe', 'safe'); await A.click('online', undefined, 'online-service'); }, async (A) => { await A.fill('o55f-address', 'https://gitea2.platyr.test'); }],
      ['the repository name', async (A) => { await toDetails(A); await A.click('next', undefined, 'safe'); await toReview(A); }, async (A) => { await A.click('edit', 'online-details', 'online-details'); }, async (A) => { await A.fill('o55f-repo', 'garden-plot'); }],
      ['a custom folder path', async (A) => { await A.toSafe('Notes'); await toReview(A); }, async (A) => { await A.click('edit', 'name', 'name'); },
        async (A) => { await A.click('change'); await clickOrSend(A, '.o55-layer:not(.o55-out) [data-o55-do="loc"][data-arg="custom"]'); await A.sleep(400); await A.fill('o55f-custom', '~/Projects/elsewhere'); }]
    ];
    for (const [what, est, reach, type] of TYPED)
      await flow(t, `21 typed: ${what}, then Back`, async (A, bad) => { await est(A); await A.screen('review'); const start = await A.frame().evaluate(SNAP20);
        await reach(A); const at = (await A.snap()).screen, a0 = await A.frame().evaluate(ANSWERS), f0 = await A.frame().evaluate(SEL);
        await type(A); await A.sleep(400); if ((await A.snap()).screen !== at) { bad.push(`typed ${what}: typing left ${at}`); return; }
        await pressBack(A); await A.sleep(700); if ((await A.snap()).screen === at) { await pressBack(A); await A.sleep(700); } /* (the first Back closes an open sheet) */
        const a1 = await A.frame().evaluate(ANSWERS), ch = Object.keys(a0).filter((k) => JSON.stringify(a0[k]) !== JSON.stringify(a1[k]));
        if (ch.length) bad.push(`typed ${what} on ${at}, then Back: ${ch.map((k) => k === 'draft' ? 'draft(' + Object.keys(Object.assign({}, a0.draft, a1.draft)).filter((x) => JSON.stringify(a0.draft[x]) !== JSON.stringify(a1.draft[x])).join(', ') + ')' : k + ' ' + String(JSON.stringify(a0[k])).slice(0, 80) + ' > ' + String(JSON.stringify(a1[k])).slice(0, 80)).join('; ')}`);
        /* the step reached again shows its own fields as they were */
        if ((await A.snap()).screen !== 'review') { const w0 = await keepOn(A); if (w0[w0.length - 1] !== 'review') { bad.push(`typed ${what}: never back to Review: ${w0.join(' > ')}`); return; } }
        await reach(A);
        if ((await A.snap()).screen === at) { const f1 = await A.frame().evaluate(SEL); if (JSON.stringify(f0) !== JSON.stringify(f1)) bad.push(`typed ${what}: ${at} reached again shows ${JSON.stringify(f1).slice(0, 220)}, not ${JSON.stringify(f0).slice(0, 220)}`); }
        else bad.push(`typed ${what}: could not reach ${at} again (on ${(await A.snap()).screen})`);
        const w = await keepOn(A); if (w[w.length - 1] !== 'review') { bad.push(`typed ${what}: never back to Review: ${w.join(' > ')}`); return; }
        const end = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, start.draft, end.draft)).filter((k) => JSON.stringify(start.draft[k]) !== JSON.stringify(end.draft[k]));
        if (dk.length) bad.push(`typed ${what}: on to Review again, the draft changed: ${dk.join(', ')}`); });
    /* the lead's ruling 1103074359: no exception for steps with an operation. The key chosen, the user typed, the token
       typed and the Server kind picked are taken back by Back like any pick; only a verification that completed persists */
    const toKeyStep = async (A) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); if (await A.has('trust')) await A.click('trust'); await A.screen('nas-key');
      await A.waitFor(() => Object.entries(O55.S.sess.ops || {}).some(([k, v]) => k.startsWith('keys:nas-home') && v.state === 'done'), null, 8000); await A.sleep(400); };
    const VERIFY = [
      ['the key chosen on nas-key', toKeyStep, async (A) => pickOther(A)],
      ['the user typed on nas-signin', async (A) => { await toKeyStep(A); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900); await A.screen('nas-signin'); },
        async (A) => { await A.fill('o55f-user', 'someone-else'); return 'typed o55f-user'; }],
      ['the token typed on online-signin', async (A) => { await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await pickSvc(A, 'gitea'); await A.sleep(300);
          if (await A.has('variant', 'gitea_self_managed')) await A.click('variant', 'gitea_self_managed'); await A.fill('o55f-address', GITEA); await A.sleep(300); await A.click('next', undefined, 'online-signin'); },
        async (A) => { const f = (await A.snap()).fields.find((x) => /token/i.test(x.id)); if (!f) { if (await A.has('useToken')) await A.click('useToken'); } const g = (await A.snap()).fields.find((x) => /token/i.test(x.id)); if (!g) return null; await A.fill(g.id, 'ghp_typed_but_not_continued'); return 'typed ' + g.id; }],
      ['the Server kind on s-kind', async (A) => { await A.click('pick', 'server'); await A.click('next', undefined, 's-kind'); await A.sleep(600); }, async (A) => pickOther(A)],
      /* (Sol R4 on bd646e7e6d: the Server found and the address typed on s-wait survived Back) */
      ['the Server found on s-wait', async (A) => { await A.click('pick', 'server'); await A.click('next', undefined, 's-kind'); await pressOn(A); await A.sleep(600); await A.screen('s-wait'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:new"]'), null, 8000); },
        async (A) => { await A.click('pick', 'pm:new'); return 'picked pick:pm:new'; }],
      ['the address typed on s-wait', async (A) => { await A.click('pick', 'server'); await A.click('next', undefined, 's-kind'); await pressOn(A); await A.sleep(600); await A.screen('s-wait'); },
        async (A) => { if (await A.has('manualOn')) { await A.click('manualOn'); await A.sleep(300); } const f = (await A.snap()).fields.find((x) => /addr/i.test(x.id)); if (!f) return null; await A.fill(f.id, 'truenas.local'); return 'typed ' + f.id; }]
    ];
    for (const [what, reach, act] of VERIFY)
      await flow(t, `21 verification step: ${what}, then Back`, async (A, bad) => { await reach(A); const at = (await A.snap()).screen, a0 = await A.frame().evaluate(ANSWERS), f0 = await A.frame().evaluate(SEL);
        const did = await act(A); if (!did) { bad.push(`${what}: nothing to pick or type on ${at}`); return; } await A.sleep(400); if ((await A.snap()).screen !== at) { bad.push(`${what}: ${did} left ${at}`); return; }
        const mid = await A.frame().evaluate(ANSWERS);
        await pressBack(A); await A.sleep(800);
        const a1 = await A.frame().evaluate(ANSWERS), ch = Object.keys(a0).filter((k) => JSON.stringify(a0[k]) !== JSON.stringify(a1[k]));
        if (ch.length) bad.push(`${what}: ${did} on ${at}, then Back, changed ${ch.map((k) => k + ' ' + String(JSON.stringify(a0[k])).slice(0, 80) + ' > ' + String(JSON.stringify(a1[k])).slice(0, 80)).join('; ')}`);
        if (JSON.stringify(mid) === JSON.stringify(a0)) t.log(`21 ${what}: ${did} changed nothing in the session even before Back`);
        await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
        if ((await A.snap()).screen === at) { const f1 = await A.frame().evaluate(SEL); if (JSON.stringify(f0) !== JSON.stringify(f1)) bad.push(`${what}: ${at} reached again shows ${JSON.stringify(f1).slice(0, 220)}, not ${JSON.stringify(f0).slice(0, 220)}`); }
        else bad.push(`${what}: Continue after Back did not reach ${at} again (on ${(await A.snap()).screen}), so its fields were not judged`); /* (Astra delta3: a walk ending elsewhere passed) */
        t.log(`21 ${what}: ${did} on ${at}, Back`); });
    /* Muse delta3: a shared folder's check passed for a typed account, then Back: the account is taken back, and the
       check no longer counts (Use is not on for an empty account) */
    await flow(t, '21 a shared folder checked for a typed account, then Back', async (A, bad) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.click('method', 'smb'); await A.sleep(400);
      const sh = (await A.snap()).buttons.find((b) => b.action === 'share'); await A.click('share', sh.arg); await A.sleep(300); await pressOn(A); await A.sleep(900); await A.screen('nas-smb');
      await A.fill('o55f-user', 'jared'); if (await A.frame().locator('#o55f-pw').count()) await A.fill('o55f-pw', 'correct horse'); await A.sleep(300);
      await A.waitEnabled((await A.snap()).primary ? (await A.snap()).primary.action : 'check').catch(() => {}); await pressOn(A);
      await A.waitFor(() => O55.S.sess.screen !== 'nas-smb' || Object.entries(O55.S.sess.ops || {}).some(([k, v]) => /^smb:/.test(k) && v.state === 'done'), null, 8000).catch(() => {}); await A.sleep(500);
      if ((await A.snap()).screen !== 'nas-smb') { bad.push('the check moved on from nas-smb by itself'); return; }
      /* (the check really ran and passed for exactly the share, account and password typed: Astra delta4, a no-op check
         must fail this case) */
      const ran = await A.frame().evaluate(() => Object.entries(O55.S.sess.ops || {}).filter(([k, v]) => /^smb:/.test(k) && v.state === 'done' && k.split('|')[1] === 'jared').map(([k]) => k));
      if (!ran.length) { bad.push('no completed check for the account typed (ops ' + JSON.stringify(Object.keys(await A.frame().evaluate(() => O55.S.sess.ops || {}))) + ')'); return; }
      await pressBack(A); await A.sleep(800); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900); await A.screen('nas-smb');
      const st = await A.snap(), user = (st.fields.find((x) => x.id === 'o55f-user') || {}).value || '';
      if (user === '' && st.primary && st.primary.action === 'use' && st.primary.on !== false) bad.push('after Back the account is empty, yet Use is still on: the check counts for an account taken back');
      t.log('21 SMB check, Back: user=' + JSON.stringify(user) + ', primary ' + JSON.stringify(st.primary)); });
    /* Sol R5: a shared folder checked for one domain (or password), then another typed: the check no longer counts, so
       neither Continue nor Use accepts the source */
    for (const [what, edit] of [['another domain', async (A) => { if (!(await A.frame().locator('#o55f-domain').count())) await A.click('details', 'smbdomain').catch(() => {}); await A.sleep(300); await A.fill('o55f-domain', 'OTHER'); }],
      ['a new password', async (A) => { await A.fill('o55f-pw', 'another password'); }]])
      await flow(t, `21 a shared folder checked, then ${what}`, async (A, bad) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.click('method', 'smb'); await A.sleep(400);
        const sh = (await A.snap()).buttons.find((b) => b.action === 'share'); await A.click('share', sh.arg); await A.sleep(300); await pressOn(A); await A.sleep(900); await A.screen('nas-smb');
        await A.fill('o55f-user', 'jared'); await A.fill('o55f-pw', 'correct horse'); await A.sleep(300); await A.waitEnabled((await A.snap()).primary.action).catch(() => {}); await pressOn(A);
        await A.waitFor(() => Object.entries(O55.S.sess.ops || {}).some(([k, v]) => /^smb:/.test(k) && v.state === 'done'), null, 8000).catch(() => {}); await A.sleep(500);
        const before = (await A.snap()).primary; if (!before || before.action !== 'use') { bad.push('the check did not pass first: ' + JSON.stringify(before)); return; }
        const ran = await A.frame().evaluate(() => Object.entries(O55.S.sess.ops || {}).filter(([k, v]) => /^smb:/.test(k) && v.state === 'done' && k.split('|')[1] === 'jared').length);
        if (!ran) { bad.push('Use is on with no completed check for the account typed'); return; }
        await edit(A); await A.sleep(500);
        const after = (await A.snap()).primary; if (after && after.action === 'use' && !after.disabled) bad.push(`after ${what}, Use is still on: ${JSON.stringify(after)}`);
        await A.frame().evaluate(() => O55.ui.act('use')); await A.sleep(900);
        const r = await A.frame().evaluate(() => ({ screen: O55.S.sess.screen, src: O55.S.sess.drafts.main.project_source_ref }));
        if (r.screen !== 'nas-smb' || r.src) bad.push(`after ${what}, Use (sent directly) still accepted the source: ${JSON.stringify(r)}`); });
    /* Sol R5: on a Puppet Master NAS, the code way picked, Pair pressed, a code typed and not checked, then Back: the live
       request ends with the pick, so going on again starts the pairing afresh and never pairs by itself */
    await flow(t, '21 a NAS pairing by code, not checked, then Back', async (A, bad) => { await A.boot({ scenario: 'fresh+homeNasPm' });
      await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      await A.click('device', 'nas-home'); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      if ((await A.snap()).screen !== 'nas-pmpair') { bad.push('a Puppet Master NAS did not open pairing: on ' + (await A.snap()).screen); return; }
      await A.click('pairing', 'code'); await A.sleep(300); if (await A.has('pair')) { await A.click('pair'); await A.sleep(600); }
      const f = (await A.snap()).fields.find((x) => /code/i.test(x.id)); if (f) await A.fill(f.id, 'AAAA-BBBB'); await A.sleep(300);
      await pressBack(A); await A.sleep(900);
      const mid = await A.frame().evaluate(() => { const n = O55.S.sess.nas || {}; return { paired: !!n.paired, asked: !!n.pairAsked, pairing: n.pairing || null }; });
      if (mid.paired || mid.asked) bad.push('Back left the pairing request live: ' + JSON.stringify(mid));
      await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(4000);
      const end = await A.frame().evaluate(() => { const n = O55.S.sess.nas || {}; return { screen: O55.S.sess.screen, paired: !!n.paired, asked: !!n.pairAsked }; });
      if (end.paired) bad.push('going on again paired by itself, with no approval or code given: ' + JSON.stringify(end)); });
    /* Sol R5's started-operation rule: a sign-in started and left by Back before it finished never completes later */
    await flow(t, '21 a sign-in started, then Back before it finished', async (A, bad) => { await A.toSafe('Notes'); await A.click('online', undefined, 'online-service'); await pickSvc(A, 'github'); await A.sleep(300);
      await A.click('next', undefined, 'online-signin'); if (!(await A.has('signIn'))) { bad.push('no Sign in on online-signin'); return; }
      await A.click('signIn'); await A.sleep(300); await pressBack(A); await A.sleep(5000);
      const st = await A.frame().evaluate(() => ({ screen: O55.S.sess.screen, si: (O55.S.sess.signin || {}).state || null, ref: O55.S.sess.drafts.main.forge_account_ref || '' }));
      if (st.si === 'done' || st.ref) bad.push('the sign-in left by Back completed later anyway: ' + JSON.stringify(st)); });
    /* ... and a Server's claim started on s-confirm and left by Back before it finished claims nothing */
    await flow(t, '21 a Server claim started, then Back before it finished', async (A, bad) => { await A.click('pick', 'server'); await A.click('next', undefined, 's-kind'); await pressOn(A); await A.sleep(600);
      await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:new"]'), null, 8000); await A.click('pick', 'pm:new'); await pressOn(A); await A.sleep(600);
      if ((await A.snap()).screen !== 's-confirm') { bad.push('not on s-confirm: ' + (await A.snap()).screen); return; }
      await A.fill('o55f-code', '482 913'); await pressOn(A); await A.sleep(200);
      if (!(await look(A)).back) { t.log('21 claim: Back is off while the claim runs, so it cannot be left by Back'); return; }
      await pressBack(A); await A.sleep(6000);
      const st = await A.frame().evaluate(() => ({ claimed: !!(O55.S.sess.server || {}).claimed, ref: O55.S.sess.drafts.main.server_ref || '', trust: !!O55.S.sess.drafts.main.server_trust_confirmed }));
      if (st.claimed || st.ref || st.trust) bad.push('the claim left by Back completed later anyway: ' + JSON.stringify(st)); });
    /* Sol R5: on s-ready, a waiting guest's words ticked and not approved, then Back: s-ready reached again shows the tick
       off and Approve off */
    await flow(t, '21 a guest\'s words ticked on s-ready, then Back', async (A, bad) => { await toNewServer(A, 's-ready'); await A.sleep(600);
      if ((await A.snap()).screen !== 's-ready') { bad.push('not on s-ready: ' + (await A.snap()).screen); return; }
      const has = await A.frame().waitForFunction(() => !!document.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="match"]'), null, { timeout: 12000 }).then(() => true).catch(() => false);
      if (!has) { t.log('21 s-ready: no waiting guest appeared in this fixture within 12 s; the tick case could not run'); return; }
      const id = await A.frame().evaluate(() => document.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="match"]').getAttribute('data-arg'));
      await A.click('match', id); await A.sleep(400);
      const on = await A.frame().evaluate((id) => !!((O55.S.sess.server.candidates || []).find((c) => c.id === id) || {}).confirmed, id); if (!on) { bad.push('the tick did not take'); return; }
      await pressBack(A); await A.sleep(900); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(1200);
      if ((await A.snap()).screen !== 's-ready') { bad.push('Continue after Back did not reach s-ready again: on ' + (await A.snap()).screen); return; }
      const st = await A.frame().evaluate((id) => { const c = (O55.S.sess.server.candidates || []).find((x) => x.id === id) || {}, b = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="approve"][data-arg="' + id + '"]'); return { confirmed: !!c.confirmed, approveOn: !!b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' }; }, id);
      if (st.confirmed || st.approveOn) bad.push('s-ready reached again keeps the tick taken back by Back: ' + JSON.stringify(st)); });
    /* Sol R4/R5: a restore from a cloud drive, then from Review a Recovery Kit's restore instead (Review's Edit skips the
       Name step), then a copy added on Safe: its proposed name is the current Project's, not the abandoned restore's */
    await flow(t, '21 a copy added after the Project changed by Review Edit proposes the current name', async (A, bad) => { await toCloudRestore(A); await A.screen('review');
      const first = await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name);
      await editBeginTo(A); await A.click('next', undefined, 'r-source'); await A.click('source', 'kit'); await A.sleep(300); const kit = (await A.snap()).buttons.find((b) => b.action === 'kit'); await A.click('kit', kit.arg);
      await pressOn(A); await A.sleep(900); if ((await A.snap()).screen === 'r-pick') { const p = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', p.arg); await pressOn(A); await A.sleep(900); }
      const w = await keepOn(A); if (w[w.length - 1] !== 'review') { bad.push('never back to Review: ' + w.join(' > ')); return; }
      const now = await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name);
      await A.click('edit', 'safe', 'safe'); await A.click('online', undefined, 'online-service'); await A.service('github', 'hosted'); await A.signIn(); await A.click('next', undefined, 'online-details');
      const field = (await A.snap()).fields.find((x) => x.id === 'o55f-repo'), want = await A.frame().evaluate((n) => O55.util.slug(n), now);
      if (!field || field.value !== want) bad.push(`the copy proposes ${JSON.stringify(field && field.value)} for the Project ${JSON.stringify(now)} (the first restore was ${JSON.stringify(first)})`);
      t.log(`21 copy name: first ${first}, now ${now}, proposed ${field && field.value}`); });
    /* a record whose stored Begins-as pick disagrees with its plan (constructed or older): Begins as shows the plan's
       beginning, and Continue there keeps it (lead 1103074359; Sol reader-b's K9a case 6) */
    await flow(t, '21 a record whose Begins-as pick disagrees with its plan', async (A, bad) => { await toRepoProject(A); await A.screen('review');
      const plan0 = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return [d.project_mode, d.online_mode, d.repository_ref]; });
      await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
      await A.frame().evaluate(() => { const saved = O55.store.get('onboarding', null); saved.ui = Object.assign({}, saved.ui, { begin: 'new', beginSub: null, beganAs: 'new' }); O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); });
      await A.resume(); await A.screen('review');
      await editBeginTo(A); await A.sleep(500); const sel = await A.frame().evaluate(SEL);
      if (!sel.on.includes('pick:existing') || !sel.on.includes('sub:online')) bad.push('disagreeing record: Begins as shows ' + JSON.stringify(sel.on) + ', not the plan\'s existing online Project');
      await keepOn(A); const plan1 = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return [d.project_mode, d.online_mode, d.repository_ref]; });
      if (JSON.stringify(plan0) !== JSON.stringify(plan1)) bad.push('disagreeing record: Continue on Begins as changed the plan ' + JSON.stringify(plan0) + ' > ' + JSON.stringify(plan1)); });
    /* final-onb's D1 film: a kept Home NAS, Media Server picked at the device step: before Continue nothing of the Home
       NAS changes; after Continue the plan holds none of it */
    await flow(t, '21 D1 film: Media Server picked, then Continue', async (A, bad) => { await toNasProject(A); await A.screen('review');
      const home = await A.frame().evaluate(() => { const n = O55.S.sess.nas || {}, d = O55.S.sess.drafts.main; return { profile: n.profile || null, at: n.at || null, src: d.project_source_ref, auth: d.source_access_authorization_refs.slice() }; });
      await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      const media = await A.frame().evaluate(() => (O55.S.env.devices.find((x) => x.id !== 'nas-home' && x.address === '192.168.1.31') || O55.S.env.devices.find((x) => x.id !== 'nas-home') || {}).id);
      if (!media) { bad.push('no other device to pick'); return; } await A.click('device', media); await A.sleep(400);
      if (!(await A.frame().evaluate(SEL)).on.includes('device:' + media)) { bad.push('the device step does not show ' + media + ' as picked'); return; }
      const mid = await A.frame().evaluate(() => { const n = O55.S.sess.nas || {}, d = O55.S.sess.drafts.main; return { device: n.device, profile: n.profile || null, at: n.at || null, src: d.project_source_ref, auth: d.source_access_authorization_refs.slice() }; });
      if (mid.device !== 'nas-home' || mid.profile !== home.profile || mid.at !== home.at || mid.src !== home.src) bad.push('D1 film: the pick changed the Home NAS before Continue: ' + JSON.stringify(mid));
      const shown = await A.frame().evaluate(SEL);
      /* (Media Server's SSH is off: Check again stands in for switching it on, as Sol's route does) */
      if (await A.has('checkAgain')) { await A.click('checkAgain'); await A.waitFor((id) => !!(O55.S.env.devices.find((x) => x.id === id) || {}).ssh, media, 8000).catch(() => {}); await A.sleep(400); }
      await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      t.log('21 D1 film: picked ' + media + ', shown ' + JSON.stringify(shown.on) + ', then on ' + (await A.snap()).screen);
      const out = await A.frame().evaluate(() => { const n = O55.S.sess.nas || {}, d = O55.S.sess.drafts.main; return { device: n.device, profile: n.profile || null, src: d.project_source_ref, auth: d.source_access_authorization_refs.filter((r) => /^(ssh-key|pairing):/.test(r)), pre: d.preflight_result_refs.filter((r) => /^preflight:(ssh|paired)/.test(r)) }; });
      if (out.device !== media || out.profile || out.src || out.auth.length || out.pre.length) bad.push('D1 film: after Continue the plan keeps the Home NAS: ' + JSON.stringify(out)); });
  },
  /* the lead's rule 3 clarification (1103092929): a pick may show as a live preview while its screen is open, but every
     way of leaving without Continue restores the answers the screen was reached with, and nothing commits or acts on it:
     Close, reload and Resume (then Back), a look switch (then Back), and a Studio jump; on Safe's history, the NAS way in
     and the Computer */
  async 'row 22 · leaving a screen without Continue by Close, reload and Resume, by a look switch, or by a Studio jump never commits its pick: Safe history, NAS way in, Computer (lead rule 3 clarification 1103092929)'(t) {
    const EDITS = [
      ['Safe history Jujutsu', async (A) => { await A.toSafe('Notes'); await toReview(A); }, async (A) => { await A.click('edit', 'safe', 'safe'); }, async (A) => { await A.click('backend', 'jujutsu'); },
        () => O55.S.sess.drafts.main.history_backend, (snap) => snap.drafts.main.history_backend, 'git', 'safe'],
      ['NAS way in SMB', toNasProject, async (A) => { await editBeginTo(A); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000); },
        async (A) => { await A.click('method', 'smb'); }, () => (O55.S.sess.nas || {}).method || 'ssh', (snap) => (snap.nas || {}).method || 'ssh', 'ssh', 'nas-find'],
      ['Computer a Server', async (A) => { await A.toSafe('Notes'); await toReview(A); }, async (A) => { await A.click('edit', 'where', 'where'); }, async (A) => { await A.click('pick', 'server'); },
        () => O55.S.sess.ui.where || 'this', (snap) => (snap.ui || {}).where || 'this', 'this', 'where']
    ];
    for (const [what, est, open, pick, readFn, snapFn, committed, at] of EDITS) {
      const read = (A) => A.frame().evaluate(readFn);
      /* Close, then the page loaded again, then Resume: the saved record carries the answers the screen was reached with;
         resumed, the pick is still only pending, and Back restores the committed answer */
      await flow(t, `22 ${what}: Close, reload, Resume, then Back`, async (A, bad) => { await est(A); await A.screen('review'); const start = await A.frame().evaluate(SNAP20);
        await open(A); await A.screen(at); await pick(A); await A.sleep(400);
        await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
        const saved = await A.frame().evaluate(() => JSON.stringify(O55.store.get('onboarding', null))), rec = JSON.parse(saved);
        const kept = rec.txn && rec.txn.snap ? await A.frame().evaluate(`(${snapFn.toString()})(${JSON.stringify(rec.txn.snap)})`) : null;
        if (!rec.txn || rec.txn.screen !== at || kept !== committed) bad.push(`${what}: the saved record does not carry the answers ${at} was reached with (txn ${rec.txn ? rec.txn.screen : 'none'}, kept ${JSON.stringify(kept)})`);
        await A.reopen();
        if (A.sandboxed()) { await A.frame().locator('[data-o55-do="close"]').first().click({ timeout: 5000 }).catch(() => {}); await A.sleep(900);
          await A.frame().evaluate((s) => { O55.store.set('onboarding', JSON.parse(s)); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, saved); }
        await A.resume();
        const back = (await A.snap()).screen; for (let i = 0; i < 2 && (await A.snap()).screen === back; i++) { await pressBack(A); await A.sleep(800); }
        const after = await read(A); if (after !== committed) bad.push(`${what}: resumed on ${back}, then Back: the answer is ${JSON.stringify(after)}, not the committed ${JSON.stringify(committed)}`);
        const w = await keepOn(A); if (w[w.length - 1] !== 'review') { bad.push(`${what}: never back to Review: ${w.join(' > ')}`); return; }
        const end = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, start.draft, end.draft)).filter((k) => JSON.stringify(start.draft[k]) !== JSON.stringify(end.draft[k]));
        if (dk.length) bad.push(`${what}: after Resume and Back, on to Review: the draft changed ${dk.join(', ')}`);
        const rk = [...new Set([...start.rows, ...end.rows])].filter((r) => !start.rows.includes(r) || !end.rows.includes(r)); if (rk.length) bad.push(`${what}: Review's rows changed: ${rk.join(' | ')}`);
        t.log(`22 ${what}: resumed on ${back}; record kept ${JSON.stringify(kept)}`); });
      /* a look switch while the pick is pending: the pick stays only pending, Back restores the committed answer, and the
         look chosen stays the plan's look */
      await flow(t, `22 ${what}: a look switch, then Back`, async (A, bad) => { await est(A); await A.screen('review');
        await open(A); await A.screen(at); await pick(A); await A.sleep(400);
        await A.frame().evaluate(() => O55.ui.applyLook('basic', 'dark')); await A.sleep(1500);
        if ((await A.snap()).screen !== at) bad.push(`${what}: the look switch left ${at} for ${(await A.snap()).screen}`);
        for (let i = 0; i < 2 && (await A.snap()).screen === at; i++) { await pressBack(A); await A.sleep(800); }
        const after = await read(A), look = await A.frame().evaluate(() => [O55.S.sess.drafts.main.theme_family, O55.S.sess.drafts.main.theme_mode]);
        if (after !== committed) bad.push(`${what}: after a look switch and Back the answer is ${JSON.stringify(after)}, not ${JSON.stringify(committed)}`);
        if (look[1] !== 'dark') bad.push(`${what}: Back took the look switch back too: the plan's look is ${look.join(' ')}`); });
      /* a Studio jump while the pick is pending starts afresh at the screen chosen: nothing of the pending pick is in it */
      await flow(t, `22 ${what}: a Studio jump`, async (A, bad) => { await est(A); await A.screen('review');
        await open(A); await A.screen(at); await pick(A); await A.sleep(400);
        const ok = await A.frame().evaluate(() => !!(O55.studio && O55.studio.onboarding && O55.studio.onboarding.screen)); if (!ok) { bad.push('no Studio jump on this page'); return; }
        await A.frame().evaluate(() => O55.studio.onboarding.screen('review')); await A.sleep(1800);
        const after = await read(A); if (after !== committed && !(at === 'where' && after === 'this')) bad.push(`${what}: after a Studio jump the session holds the pending ${JSON.stringify(after)}`);
        const stored = await A.frame().evaluate(() => { const r = O55.store.get('onboarding', null); return r ? [r.drafts && r.drafts.main && r.drafts.main.history_backend, r.nas && r.nas.method, r.ui && r.ui.where] : null; });
        if (stored && ((at === 'safe' && stored[0] === 'jujutsu') || (at === 'nas-find' && stored[1] === 'smb') || (at === 'where' && stored[2] === 'server'))) bad.push(`${what}: the stored record after a Studio jump carries the pending pick ${JSON.stringify(stored)}`); });
    }
  },
  /* the Computer kind switched from Review, each way, then the whole Back run from Review to Welcome: no repeat, every
     screen applies, no step of the old Computer answer (Sol's Basic Light 6sr at 9b9: Where, Review again, then the old
     Server's away step) */
  async 'row 19 · Review Edit Computer switched each way (a completed new Server kept twice › This computer; This computer › a new Server; an existing Server › This computer), then Back all the way to Welcome: no repeat, every screen applies, no step of the old Computer answer'(t) {
    const OLD_SERVER = [...SERVER_STEPS, 'away', 'away-setup'], CONNECT = (x) => /^c-/.test(x);
    const run = async (A, bad, label, gone) => { await A.screen('review'); const seq = await walkBack(A, [], bad, label);
      const hit = seq.filter(gone); if (hit.length) bad.push(`${label}: Back walks the old Computer answer's steps: ${hit.join(', ')} (${seq.join(' > ')})`);
      if (seq[seq.length - 1] !== 'welcome') bad.push(`${label}: the Back run from Review stopped on ${seq[seq.length - 1]} (${seq.join(' > ')})`); t.log(`${label}: Back ${seq.join(' > ')}`); };
    const toThis = async (A) => { await A.click('edit', 'where', 'where'); await A.click('pick', 'this'); await A.click('next'); await A.sleep(900); await onToReview(A); };
    await flow(t, '19 new Server kept twice > This computer (6sr)', async (A, bad) => {
      await toNewServer(A); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await onToReview(A);
      for (let i = 0; i < 2; i++) { await A.click('edit', 'where', 'where'); await pressOn(A); await A.sleep(900); await onToReview(A); }
      await toThis(A); await run(A, bad, '19 Server > This computer', (x) => OLD_SERVER.includes(x)); });
    await flow(t, '19 This computer > a new Server', async (A, bad) => {
      await A.toSafe('Notes'); await toReview(A); await A.click('edit', 'where', 'where'); await toNewServer(A, null); await A.sleep(900); await onToReview(A);
      await run(A, bad, '19 This computer > Server', CONNECT); });
    await flow(t, '19 existing Server > This computer', async (A, bad) => {
      await A.click('pick', 'connect'); await A.click('next', undefined, 'c-route'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="pm:home"]'), null, 10000);
      await A.click('pickServer', 'pm:home'); await A.click('next', undefined, 'c-review'); await pressOn(A); await A.screen('c-pair');
      await A.waitFor(() => O55.S.sess.connect.paired, null, 15000); await pressOn(A); await A.screen('c-ready'); await A.click('createNew'); await A.screen('begin');
      await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Notes'); await onToReview(A);
      await toThis(A); await run(A, bad, '19 existing Server > This computer', (x) => CONNECT(x) || OLD_SERVER.includes(x)); });
  },
  /* the way back in once the Resume chip has tucked into the bell (fields follow-up, final-onb's K16 timing: a loaded
     machine reached the chip after 19-notify.js had tucked it): Close, the chip shows and then tucks by itself, the bell
     lists Finish setting up, and A.resume(), which every row uses, goes in by the bell's Continue rather than waiting on a
     chip that is not shown. The session is resumed where it was closed with its answers and Back path as they were, then
     Back runs to Welcome and the wizard goes on again to Review. */
  async 'row 23 · back in by the bell once the Resume chip has tucked: closed on online details and on Review (a Home NAS source over SSH), the chip tucks, Finish setting up resumes where it was closed, then Back to Welcome and on'(t) {
    for (const [at, walk, on] of [['online-details', (A) => toDetails(A), (A, bad) => forward(A, [], bad, '23 online-details', Object.assign({ name: async (A) => { await A.fill('o55f-name', 'Notes'); await A.click('next'); } }, pickerOn))],
      ['review', toNasProject, (A) => keepOn(A)]])
      await flow(t, `23 closed on ${at}, back in by the bell`, async (A, bad) => {
        await walk(A); await A.screen(at); const before = await A.frame().evaluate(SNAP20);
        await A.frame().locator('[data-o55-do="close"]').first().click();
        const chip = await A.frame().waitForFunction(() => { const c = document.getElementById('o55-resume'); return !!c && c.getClientRects().length > 0; }, null, { timeout: 10000 }).then(() => true, () => false);
        if (!chip) bad.push('no Resume chip after Close');
        const tucked = await A.frame().waitForFunction(() => { const c = document.getElementById('o55-resume'); return !!c && c.classList.contains('pmn-pin-tucked'); }, null, { timeout: 15000 }).then(() => true, () => false);
        if (!tucked) { bad.push('the Resume chip never tucked into the bell'); return; }
        if (await A.frame().locator('#o55-resume [data-o55-chip="resume"]').isVisible()) bad.push('the tucked chip is still shown');
        const way = await A.resume();
        if (way !== 'bell') bad.push(`with the chip tucked, the way back in was ${way}, not the bell`);
        const s = await look(A); if (s.screen !== at) bad.push(`resumed on ${s.screen}, not ${at} where it was closed`);
        const after = await A.frame().evaluate(SNAP20), dk = Object.keys(Object.assign({}, before.draft, after.draft)).filter((k) => JSON.stringify(before.draft[k]) !== JSON.stringify(after.draft[k]));
        if (dk.length) bad.push(`resumed by the bell, the draft changed: ${dk.join(', ')}`);
        if (JSON.stringify(before.history) !== JSON.stringify(after.history)) bad.push(`resumed by the bell, the Back path changed: ${before.history.join(' > ')} became ${after.history.join(' > ')}`);
        /* (the bell's own list: a closed panel keeps its last rows in the DOM until it next opens) */
        if (await A.frame().evaluate(() => (O55.notify && O55.notify.list ? O55.notify.list() : []).some((x) => x.id === 'pin-o55-resume'))) bad.push('the bell still lists Finish setting up after the session was resumed');
        const seq = await walkBack(A, [], bad, `23 ${at}`);
        if (seq[seq.length - 1] !== 'welcome') bad.push(`the Back run stopped on ${seq[seq.length - 1]} (${seq.join(' > ')})`);
        const fwd = await on(A, bad); if (fwd[fwd.length - 1] !== 'review') bad.push(`on again never reached Review: ${fwd.join(' > ')}`);
        t.log(`23 ${at}: in by the ${way}; Back ${seq.join(' > ')}; on ${fwd.join(' > ')}`); });
  },
  /* FO-45, widened (fo-kit): the place a NAS holds the files on, or the NAS a Project begins from, by every way in the
     page stores (SSH, SMB, NFS, a mounted volume, a paired Puppet Master NAS), and a new Server: read on Review, on Name
     and its files sheet (through Review's Edit), on Creating, in the handoff the app reads (O55.handoff.build's labels,
     what Settings, the status bar and the title bar repaint from) and on the title bar's Project row and button. None
     shows a raw reference of any family the page stores, nor any reference this session holds (RAW_RE, STORED_REFS). */
  async 'row 24 · FO-45 widened: files on a Home NAS and a Home NAS source by SSH, SMB, NFS and a mounted volume, a paired Puppet Master NAS and a new Server, read on Review, Name, Creating, the handoff and the title bar Project row: no raw locator of any family'(t) {
    const pmNasSource = async (A) => { await A.boot({ scenario: 'fresh+homeNasPm' });
      await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await A.waitFor(() => !!document.querySelector('.o55-card[data-arg="nas-home"]'), null, 8000);
      await A.click('device', 'nas-home'); await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900);
      if ((await A.snap()).screen !== 'nas-pmpair') throw new Error('a Puppet Master NAS did not open pairing: on ' + (await A.snap()).screen);
      if (await A.has('pair')) await A.click('pair');
      await A.frame().waitForFunction(() => !!(O55.S.sess.nas || {}).paired, null, { timeout: 20000 });
      await A.waitEnabled('next').catch(() => {}); await pressOn(A); await A.sleep(900); await throughNas(A); await onToReview(A, nameOn); };
    const CONFIGS = [['files over SSH', (A) => toStorageBy(A, 'ssh')], ['files over SMB', (A) => toStorageBy(A, 'smb')], ['files over NFS', (A) => toStorageBy(A, 'nfs')], ['files on a mounted volume', (A) => toStorageBy(A, 'mounted')],
      ['source over SSH', toNasProject], ['source over SMB', (A) => toNasBy(A, 'smb')], ['source over NFS', (A) => toNasBy(A, 'nfs')], ['source on a mounted volume', (A) => toNasBy(A, 'mounted')],
      ['source on a paired Puppet Master NAS', pmNasSource], ['a completed new Server', newServerPlan(false)]];
    const LAYER_TEXT = () => { const l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'); const sh = [...document.querySelectorAll('.o55-sheet[data-open="true"]')].find((x) => !x.closest('.o55-out')); return (l ? l.innerText : '') + (sh ? '\n' + sh.innerText : ''); };
    for (const [kind, est] of CONFIGS)
      await flow(t, `24 ${kind}`, async (A, bad) => { await est(A); await A.screen('review');
        const refs = await A.frame().evaluate(STORED_REFS), texts = [['Review', await A.frame().evaluate(LAYER_TEXT)]];
        const place = await A.frame().evaluate(() => { const d = O55.S.sess.drafts.main; return { storage: d.storage_location || null, source: d.project_source_ref || null, server: d.server_ref || null }; });
        /* Name and its files sheet, opened by Review's Edit, then Back to Review */
        if (await A.has('edit', 'name')) { await A.click('edit', 'name', 'name'); await A.sleep(500); texts.push(['Name', await A.frame().evaluate(LAYER_TEXT)]);
          if (await A.has('change')) { await clickOrSend(A, '.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="change"]'); await A.waitFor(() => !!document.querySelector('.o55-sheet[data-open="true"]'), null, 4000).catch(() => {}); await A.sleep(500);
            texts.push(['Name files sheet', await A.frame().evaluate(LAYER_TEXT)]); await A.click('sheet-close').catch(() => {}); await A.sleep(400); }
          await pressBack(A); await A.sleep(700); if ((await A.snap()).screen !== 'review') await onToReview(A); await A.screen('review'); }
        else bad.push(`24 ${kind}: Review has no Edit for the name`);
        await A.waitEnabled('commit'); await A.click('commit', undefined, 'creating');
        const made = await A.frame().waitForFunction(() => O55.S.sess.commit.state === 'done', null, { timeout: 40000 }).then(() => true, () => false);
        texts.push(['Creating', await A.frame().evaluate(LAYER_TEXT)]);
        if (!made) { bad.push(`24 ${kind}: the Project was not made (${await A.frame().evaluate(() => O55.S.sess.commit.state + ' ' + (O55.S.sess.commit.code || ''))})`); }
        else {
          const out = await A.frame().evaluate(() => { const S = O55.S, cm = S.sess.commit, id = cm.projectId, d = S.sess.drafts.main, labels = [];
            const rec = O55.handoff.build(S, { project: id, projectName: d.project_name });
            const walk = (v, k, path) => { if (Array.isArray(v)) v.forEach((x, i) => walk(x, k, path + '[' + i + ']')); else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => walk(x, kk, path + '.' + kk)); else if (typeof v === 'string' && /label|name|title|path|where|summary|text/i.test(k)) labels.push([path, v]); };
            walk(rec, '', 'handoff');
            const row = [...document.querySelectorAll('#projectMenu .pm6-tb-menu-item[data-project]')].find((r) => r.getAttribute('data-project') === id);
            const btn = document.getElementById('projectMenuBtn'), wrap = document.getElementById('projectMenuWrap');
            const attrs = (el) => (el ? [...el.attributes].filter((a) => !/^(class|id|style|role|type|tabindex|data-state)$/.test(a.name)).map((a) => a.name + '=' + a.value).join(' ') : '');
            return { id, labels, rowFound: !!row, row: row ? attrs(row) + ' ' + row.textContent : '', button: attrs(btn) + ' ' + (btn ? btn.textContent : '') + ' ' + attrs(wrap), filesLabel: rec.project && rec.project.files ? rec.project.files.label : null }; });
          if (!out.rowFound) bad.push(`24 ${kind}: the title bar lists no row for the new Project ${out.id}`);
          texts.push(...out.labels.map(([p, v]) => [p, v]), ['title bar Project row', out.row], ['title bar Project button', out.button]);
          t.log(`24 ${kind}: plan ${JSON.stringify(place)}; handoff files label "${out.filesLabel}"; ${refs.length} stored references checked`);
        }
        const hits = rawIn(texts, refs); if (hits.length) bad.push(`24 ${kind}: a raw locator is shown: ${hits.join(' | ')}`); });
  },
  /* 4b (fo-kit, 2026-11-04; reported as the pane drifting about 0.3 px a frame, fields "harness only"): a card under a
     resting pointer stays still. After Review > Edit name > Change, the click leaves the pointer on the Change link and the
     files sheet opens with a card under it; the card's own hover lift (10-window.css .o55-card:hover translateY(-1px), a
     0.18 s transition) carried its bottom edge past a pointer resting within 1 px of it and back, and the card trembled
     0.3-0.9 px for as long as the pointer rested (Basic Light 1920x1080: the click left it 0.51 px inside the 'custom'
     card's bottom edge). In Basic, Friendly and Glass (Retro and NieR have no lift): the pointer where the click left it,
     then 0.5 px inside the bottom edge of each card of the sheet in turn; each card under it holds one position over 90
     frames (rAF reads of its box) and is still on compositor frames (t.still). Fails on main be4766513f. */
  async 'row 25 · a card under a resting pointer stays still: after Review > Edit name > Change, with the pointer where the click left it and 0.5 px inside each files-sheet card\'s bottom edge, in Basic, Friendly and Glass (4b)'(t) {
    const SAMPLE = ([n]) => new Promise((res) => { const e = document.querySelector('[data-kit-still="1"]'), seen = []; const tick = () => { const r = e.getBoundingClientRect(); seen.push(r.x.toFixed(2) + ',' + r.y.toFixed(2)); if (seen.length < n) requestAnimationFrame(tick); else res({ n: seen.length, distinct: [...new Set(seen)], transform: getComputedStyle(e).transform }); }; requestAnimationFrame(tick); });
    const mark = (A, [x, y]) => A.frame().evaluate(([x, y]) => { document.querySelectorAll('[data-kit-still]').forEach((e) => e.removeAttribute('data-kit-still')); const h = document.elementFromPoint(x, y), c = h && h.closest('.o55-sheet[data-open="true"] .o55-card');
      if (!c) return null; c.setAttribute('data-kit-still', '1'); return (c.getAttribute('data-o55-do') || '') + ':' + (c.getAttribute('data-arg') || ''); }, [x, y]);
    for (const look of [['basic', 'light'], ['friendly', 'light'], ['glass', 'light']]) {
      SELFTEST = t.args.selftest || ''; const A = onboardingApp(t), bad = [], label = `25 ${look.join(' ')}`;
      await A.boot({ look }); await A.toSafe('Notes'); await toReview(A); await A.click('edit', 'name', 'name');
      /* (the frame's offset in the window: page.mouse speaks window coordinates, the page its own) */
      const fe = A.frame() === t.page.mainFrame() ? null : await A.frame().frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
      const ch = await A.frame().locator('.o55-pane > .o55-layer:not(.o55-out) [data-o55-do="change"]').first().boundingBox();
      const at = [ch.x - off.x + ch.width / 2, ch.y - off.y + ch.height / 2];
      await A.click('change'); await A.waitFor(() => !!document.querySelector('.o55-sheet[data-open="true"]'), null, 4000).catch(() => {}); await A.sleep(1500);
      const judge = async (where) => { await A.sleep(900); const r = await A.frame().evaluate(SAMPLE, [90]);
        t.log(`${label} ${where}: ${r.distinct.length} position(s) in ${r.n} frames${r.distinct.length > 1 ? ' (' + r.distinct.slice(0, 6).join(' | ') + ')' : ''}, transform ${r.transform}`);
        if (r.distinct.length > 1) bad.push(`${where}: the card moved under a resting pointer, ${r.distinct.length} positions in ${r.n} frames`);
        await t.still('[data-kit-still="1"]', `${label} ${where}: still on compositor frames`, { ms: 1200 }); };
      const under = await mark(A, at);
      if (under) await judge(`pointer where the click on Change left it (${at.map((v) => v.toFixed(2)).join(', ')}), on ${under}`); else t.log(`${label}: no card under the pointer where the click on Change left it`);
      /* each card's rest box, with the pointer away */
      await t.page.mouse.move(2, 2); await A.sleep(700);
      const cards = await A.frame().evaluate(() => [...document.querySelectorAll('.o55-sheet[data-open="true"] .o55-card')].filter((c) => c.getClientRects().length).map((c) => { const r = c.getBoundingClientRect(); return { id: (c.getAttribute('data-o55-do') || '') + ':' + (c.getAttribute('data-arg') || ''), x: r.left + r.width / 2, y: r.bottom - 0.5, transform: getComputedStyle(c).transform }; }));
      if (!cards.length) bad.push('the files sheet shows no card');
      /* (the card is found at that point while it rests, before the pointer comes: a lift that moves its box would take it away) */
      for (const c of cards) { const got = await mark(A, [c.x, c.y]);
        if (got !== c.id) { bad.push(`0.5 px inside ${c.id}'s bottom edge, at rest, is ${got || 'nothing'}`); continue; }
        await t.page.mouse.move(off.x + c.x, off.y + c.y); await judge(`pointer 0.5 px inside ${c.id}'s bottom edge`); await t.page.mouse.move(2, 2); await A.sleep(500); }
      t.log(label + (bad.length ? '\n  ' + bad.join('\n  ') : ': clean')); await t.check(label, !bad.length, bad.join(' | ').slice(0, 1500));
    }
  }
};
