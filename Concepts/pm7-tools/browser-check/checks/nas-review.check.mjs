import { onboardingApp } from '../helpers/onboarding-fields.mjs';
// NAS way in and the places Review names (stream F, lane fields, 2026-11-04), by real clicks on both surfaces
// (`--set sandbox=0`, `--set sandbox=1`):
// - FO-48 and the Use-SSH switch: a Home NAS that runs Puppet Master, Use SSH instead, then Back to the device step. The
//   card's note must say the SSH way (never "pairs with it … no key or password"), the SSH chain must apply and pairing
//   must not, an un-continued pick of another card changes nothing, and the way back to pairing the screen offers
//   (another device, then this one again) shows the pairing note and opens pairing. The typed address of the same NAS
//   says the same.
// - FO-47: a saved Home NAS record that stops applying on resume (Astra delta4: its key changed, so it binds nothing)
//   leaves Review's "Begins as" and "Files kept in", and Name's "Kept in", naming the NAS and a folder still to choose,
//   never a half label ("Files on") or a blank; for a Project's source and for its files place.
// - B-6SR-T-1: a completed new Server's discovery card, after Computer kept unchanged from Review twice, says it is
//   already set up, as the confirmation after it does.
// - Muse note: a Puppet Master NAS reached by pairing, with `trusted` set by a constructed state (no public route sets
//   it), never puts the SSH key, sign-in or install steps on the path (O55.ui.onBranch, and Back from Review).
const L = '.o55-pane > .o55-layer:not(.o55-out) ';
const PAIR_NOTE = /pairs with it|no key or password/i;
const SSH_STEPS = ['nas-identity', 'nas-key', 'nas-signin', 'nas-install'];
const settle = async (A) => { await A.sleep(450); await A.frame().waitForFunction(() => !document.querySelector('.o55-pane > .o55-layer.o55-out, .o55-pane > .o55-layer.o55-hold'), null, { timeout: 4000 }).catch(() => {}); };
const pressOn = async (A) => { await A.frame().locator(L + '.o55-foot .o55-primary').first().click(); await settle(A); };
const pressBack = async (A) => { await A.frame().locator(L + '[data-o55-do="back"]').filter({ visible: true }).first().click(); await settle(A); };
const screen = (A) => A.frame().evaluate(() => O55.S.sess.screen);
const cards = (A) => A.waitFor(() => !!document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-card[data-arg="nas-home"]'), null, 8000);
/* the device step as the person reads it, with what the page's own rule says applies */
const FIND = () => {
  const l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), S = O55.S, n = S.sess.nas || {};
  return { screen: S.sess.screen, text: l ? l.innerText : '', notes: [...(l ? l.querySelectorAll('.o55-note') : [])].map((x) => x.textContent.trim()),
    useSsh: !!n.useSsh, device: n.device || null, choice: n.choice ? n.choice.id : null,
    on: Object.fromEntries(['nas-identity', 'nas-key', 'nas-signin', 'nas-install', 'nas-pmpair', 'nas-folder'].map((id) => [id, O55.ui.onBranch(id)])) };
};
const find = (A) => A.frame().evaluate(FIND);
const fromBegin = async (A, sub) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'existing'); await A.click('sub', sub); };
const throughNas = async (A) => {
  for (let i = 0; i < 14; i++) {
    const s = await A.snap();
    if (['name', 'review', 'like', 'safe'].includes(s.screen)) return;
    if (s.screen === 'nas-identity') { if (await A.has('trust')) await A.click('trust'); else await pressOn(A); }
    else if (s.screen === 'nas-key') { await A.waitFor(() => Object.entries(O55.S.sess.ops || {}).some(([k, v]) => k.startsWith('keys:nas-home') && v.state === 'done'), null, 8000); await A.waitEnabled('next').catch(() => {}); await pressOn(A); }
    else if (s.screen === 'nas-signin') { if (await A.frame().locator('#o55f-user').count()) await A.fill('o55f-user', 'jared'); if (await A.frame().locator('#o55f-pw').count()) await A.fill('o55f-pw', 'correct horse'); await pressOn(A); }
    else if (s.screen === 'nas-install' || s.screen === 'nas-pmpair') { await A.waitFor(() => { const b = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary'); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, null, 20000); await pressOn(A); }
    else if (s.screen === 'nas-folder') { if (await A.has('cd', '/volume1/projects')) await A.click('cd', '/volume1/projects'); await A.click('use'); }
    else await pressOn(A);
    await A.sleep(900);
  }
};
const onToReview = async (A, name = 'Kept one') => {
  for (let i = 0; i < 16; i++) {
    const s = await A.snap(); if (s.screen === 'review') return;
    if (s.screen === 'name' && !(await A.frame().evaluate(() => O55.S.sess.drafts.main.project_name))) await A.fill('o55f-name', name);
    if (await A.has('sheet-close')) { await A.click('sheet-close'); await A.sleep(400); }
    await A.waitEnabled(s.primary && s.primary.action || 'next').catch(() => {}); await pressOn(A); await A.sleep(500);
  }
  await A.screen('review');
};
const toNasProject = async (A) => { await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await cards(A);
  await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); await onToReview(A); };
const toNameNas = async (A) => { await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Book club site');
  await A.click('change'); await A.click('loc', 'network', 'nas-find'); await cards(A);
  await A.click('device', 'nas-home'); await A.click('next', undefined, 'nas-identity'); await throughNas(A); await onToReview(A); };
/* a record saved by this page, changed as Astra delta4's key-changed record is, then resumed with the chip on a fresh page */
const closeAndRead = async (A) => { await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900); return JSON.parse(await A.frame().evaluate(() => JSON.stringify(O55.store.get('onboarding', null)))); };
const resumeRecord = async (A, saved) => { await A.boot(); await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(800);
  await A.frame().evaluate((s) => { O55.store.set('onboarding', JSON.parse(s)); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, saved);
  await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click({ timeout: 15000 }); await A.sleep(1500); };
const ROWS = () => { const l = document.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), v = (k) => { const e = l && l.querySelector(`[data-key="rv-${k}"] .o55-revv`); return e ? e.textContent.trim() : null; };
  const miss = l && l.querySelector('[data-key="missing"]'); return { screen: O55.S.sess.screen, begins: v('begins'), files: v('files'), missing: miss ? miss.textContent.trim() : '', src: O55.S.sess.drafts.main.project_source_ref, storage: O55.S.sess.drafts.main.storage_location }; };
const LOC = () => { const e = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-key="loc"]'); return e ? e.textContent.trim() : null; };
/* Back from where it is, pressed until Welcome: the screens it shows */
const backRun = async (A) => { const seq = [];
  for (let i = 0; i < 40; i++) { const s = await screen(A); seq.push(s); if (s === 'welcome') break;
    if (!(await A.frame().locator(L + '[data-o55-do="back"]').filter({ visible: true }).count())) break; await pressBack(A); if ((await screen(A)) === s) await pressBack(A); }
  return seq; };
async function flow(t, label, fn, opts) { const A = onboardingApp(t), bad = []; await A.boot(opts); await fn(A, bad); t.log(label + (bad.length ? '\n  ' + bad.join('\n  ') : ': clean')); await t.check(label, !bad.length, bad.join(' | ').slice(0, 1500)); }

export const tests = {
  async 'FO-48 · a Home NAS that runs Puppet Master: Use SSH instead, Back to the device step, the card says SSH; another card picked and not continued; back to pairing by another device, then this one'(t) {
    await flow(t, 'FO-48 Use SSH switch', async (A, bad) => {
      await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await cards(A);
      await A.click('device', 'nas-home'); let f = await find(A);
      /* (control: the pairing way, before anything else is chosen, says so) */
      if (!f.notes.some((x) => PAIR_NOTE.test(x))) bad.push('the pairing way: no pairing note under Home NAS: ' + JSON.stringify(f.notes));
      await pressOn(A); f = await find(A);
      if (f.screen !== 'nas-pmpair') { bad.push('a Puppet Master NAS did not open pairing: on ' + f.screen); return; }
      if (!f.on['nas-pmpair'] || SSH_STEPS.some((x) => f.on[x])) bad.push('the pairing way: steps on the path ' + JSON.stringify(f.on));
      await A.click('useSsh', undefined, 'nas-identity'); f = await find(A);
      if (!f.useSsh || !f.on['nas-identity'] || f.on['nas-pmpair']) bad.push('Use SSH instead: identity off or pairing on ' + JSON.stringify(f.on));
      await A.click('trust'); await A.screen('nas-key'); f = await find(A);
      if (!f.on['nas-key'] || f.on['nas-pmpair']) bad.push('the SSH way, trusted: key off or pairing on ' + JSON.stringify(f.on));
      const back = [];
      for (let i = 0; i < 4 && (await screen(A)) !== 'nas-find'; i++) { await pressBack(A); back.push(await screen(A)); }
      if (back.includes('nas-pmpair')) bad.push('Back after Use SSH instead showed pairing: ' + back.join(' > '));
      f = await find(A);
      if (f.screen !== 'nas-find') { bad.push('Back never reached the device step: ' + back.join(' > ')); return; }
      /* FO-48: the note under the chosen card says the SSH way */
      if (f.notes.some((x) => PAIR_NOTE.test(x)) || PAIR_NOTE.test(f.text)) bad.push('FO-48: after Use SSH instead the device step still says pairing: ' + JSON.stringify(f.notes));
      if (!f.notes.some((x) => /SSH/.test(x) && /Home NAS/.test(x))) bad.push('FO-48: after Use SSH instead no note under Home NAS says SSH: ' + JSON.stringify(f.notes));
      /* another card picked, then Home NAS again, not continued: nothing changes (lead's ruling 1103040758) */
      await A.click('device', 'nas-media'); await A.click('device', 'nas-home'); f = await find(A);
      if (f.choice || !f.useSsh || f.notes.some((x) => PAIR_NOTE.test(x))) bad.push('Home NAS picked again, not continued: ' + JSON.stringify({ choice: f.choice, useSsh: f.useSsh, notes: f.notes }));
      await A.waitEnabled('next'); await pressOn(A);
      if ((await screen(A)) !== 'nas-identity') bad.push('Continue on the SSH way, unchanged, went to ' + (await screen(A)));
      await pressBack(A); await A.screen('nas-find');
      /* the way back to pairing the screen offers: another device committed, then Home NAS chosen again */
      await A.click('device', 'nas-media'); if (await A.has('checkAgain')) await A.click('checkAgain');
      await A.waitEnabled('next'); await pressOn(A);
      if ((await screen(A)) !== 'nas-identity') { bad.push('Media server: Continue went to ' + (await screen(A))); return; }
      await pressBack(A); await A.screen('nas-find');
      await A.click('device', 'nas-home'); f = await find(A);
      if (!f.notes.some((x) => PAIR_NOTE.test(x))) bad.push('Home NAS chosen again after another device: no pairing note: ' + JSON.stringify(f.notes));
      await A.waitEnabled('next'); await pressOn(A); f = await find(A);
      if (f.screen !== 'nas-pmpair' || !f.on['nas-pmpair'] || SSH_STEPS.some((x) => f.on[x])) bad.push('back to pairing: on ' + f.screen + ' ' + JSON.stringify(f.on));
      await pressBack(A); f = await find(A);
      if (f.screen !== 'nas-find' || !f.notes.some((x) => PAIR_NOTE.test(x))) bad.push('Back from pairing: the device step does not say pairing: ' + f.screen + ' ' + JSON.stringify(f.notes));
    }, { scenario: 'fresh+homeNasPm' });
  },
  async 'FO-48 · the typed address of a Home NAS that runs Puppet Master, after Use SSH instead, says SSH'(t) {
    await flow(t, 'FO-48 typed address', async (A, bad) => {
      await fromBegin(A, 'device'); await A.click('next', undefined, 'nas-find'); await cards(A);
      await A.click('device', 'nas-home'); await pressOn(A); await A.screen('nas-pmpair');
      await A.click('useSsh', undefined, 'nas-identity'); await pressBack(A); await A.screen('nas-find');
      const host = await A.frame().evaluate(() => (O55.S.env.devices.find((x) => x.id === 'nas-home') || {}).address);
      await A.click('manualOn'); await A.sleep(300); await A.fill('o55f-addr', host); await A.sleep(400);
      const f = await find(A);
      if (f.notes.some((x) => PAIR_NOTE.test(x)) || PAIR_NOTE.test(f.text)) bad.push('FO-48: the typed address after Use SSH instead says pairing: ' + JSON.stringify(f.notes));
      if (!f.notes.some((x) => /SSH/.test(x))) bad.push('FO-48: the typed address after Use SSH instead has no SSH note: ' + JSON.stringify(f.notes));
      await A.waitEnabled('next'); await pressOn(A);
      if ((await screen(A)) !== 'nas-identity') bad.push('the typed address, Continue went to ' + (await screen(A)));
    }, { scenario: 'fresh+homeNasPm' });
  },
  async 'FO-47 · a saved Home NAS record that stops applying on resume: Review and Name name the NAS and a folder still to choose (a source, a files place)'(t) {
    for (const [kind, establish, field] of [['source', toNasProject, 'src'], ['files place', toNameNas, 'storage']])
      await flow(t, 'FO-47 ' + kind, async (A, bad) => {
        await establish(A); await A.screen('review');
        const was = await A.frame().evaluate(ROWS);
        if (!was[field] || !/Home NAS/.test(was.files || '')) bad.push(`control: before the change Review does not name the NAS: ${JSON.stringify(was)}`);
        const saved = await closeAndRead(A); if (!saved || !saved.nas) { bad.push('no saved NAS record'); return; }
        saved.nas.key = 'k-ed';
        await resumeRecord(A, JSON.stringify(saved)); await A.screen('review'); await settle(A);
        const r = await A.frame().evaluate(ROWS);
        if (r[field]) bad.push(`the changed record still applies (${field} ${r[field]}): the case did not reach FO-47's state`);
        if (!r.missing) bad.push('Review asks for nothing: ' + JSON.stringify(r));
        for (const k of ['begins', 'files']) { const v = r[k] || '';
          if (!v || /\b(on|in|·)\s*$/.test(v) || /^\s*·/.test(v)) bad.push(`FO-47: Review's ${k} row reads "${v}"`); }
        if (!/Home NAS/.test(r.files || '') || !/choose|chosen/i.test(r.files || '')) bad.push(`FO-47: "Files kept in" does not name the NAS and a folder still to choose: "${r.files}"`);
        if (kind === 'source' && !/Home NAS/.test(r.begins || '')) bad.push(`FO-47: "Begins as" does not name the NAS: "${r.begins}"`);
        /* Name says the same, and Back before Continue returns to Review */
        await A.click('edit', 'name', 'name'); const loc = await A.frame().evaluate(LOC);
        if (!loc || /\bin\s*$/.test(loc) || !/Home NAS/.test(loc)) bad.push(`FO-47: Name's files line reads "${loc}"`);
        await pressBack(A); if ((await screen(A)) !== 'review') bad.push('Back from Name opened by Edit went to ' + (await screen(A)));
      });
  },
  async 'B-6SR-T-1 · a completed new Server, Computer kept unchanged from Review twice: its discovery card says it is set up, as the confirmation does'(t) {
    await flow(t, 'B-6SR-T-1', async (A, bad) => {
      await toNewServer(A);
      await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await onToReview(A, 'Server notes'); await A.screen('review');
      for (let i = 1; i <= 2; i++) {
        await A.click('edit', 'where', 'where'); await A.waitEnabled('next'); await pressOn(A); await A.screen('s-kind'); await pressOn(A); await A.screen('s-wait');
        const card = await A.frame().evaluate(() => { const c = document.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-card[data-arg="pm:new"]'); return c ? c.innerText.replace(/\s+/g, ' ').trim() : null; });
        if (!card) bad.push(`edit ${i}: no discovery card for truenas.local`);
        else if (/Not set up yet/.test(card) || !/Already set up/.test(card)) bad.push(`B-6SR-T-1 edit ${i}: the completed Server's card reads "${card}"`);
        await A.waitEnabled('next'); await pressOn(A); await A.screen('s-confirm');
        const done = await A.frame().evaluate(() => !!document.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-key="done"]'));
        if (!done) bad.push(`edit ${i}: the confirmation does not say Already done`);
        await onToReview(A);
      }
    });
  },
  async 'Muse note · a Puppet Master NAS paired for the files place, with trusted set (constructed): no SSH key, sign-in or install step on the path'(t) {
    await flow(t, 'Muse note byPm', async (A, bad) => {
      await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'new'); await A.click('next', undefined, 'name'); await A.fill('o55f-name', 'Book club site');
      await A.click('change'); await A.click('loc', 'network', 'nas-find'); await cards(A);
      await A.click('device', 'nas-home'); await pressOn(A);
      if ((await screen(A)) !== 'nas-pmpair') { bad.push('a Puppet Master NAS did not open pairing: on ' + (await screen(A))); return; }
      /* constructed: no public route sets trusted on the pairing way (Use SSH instead and another device both reset it) */
      const unpaired = await A.frame().evaluate((ids) => { O55.S.sess.nas.trusted = true; O55.S.save(); return ids.filter((x) => O55.ui.onBranch(x)); }, SSH_STEPS);
      if (unpaired.length) bad.push('constructed trusted, before pairing: on the path ' + unpaired.join(', '));
      await A.frame().evaluate(() => { O55.S.sess.nas.trusted = false; O55.S.save(); });
      await A.click('pair');
      const paired = await A.frame().waitForFunction(() => !!(O55.S.sess.nas || {}).paired, null, { timeout: 25000 }).then(() => true).catch(() => false);
      if (!paired) { bad.push('pairing by approval did not complete in this fixture within 25 s'); return; }
      await throughNas(A); await onToReview(A);
      if ((await screen(A)) !== 'review') { bad.push('never reached Review: on ' + (await screen(A))); return; }
      const on = await A.frame().evaluate((ids) => { O55.S.sess.nas.trusted = true; O55.S.save(); return { ssh: ids.filter((x) => O55.ui.onBranch(x)), pair: O55.ui.onBranch('nas-pmpair'), folder: O55.ui.onBranch('nas-folder') }; }, SSH_STEPS);
      if (on.ssh.length) bad.push('constructed trusted, paired: on the path ' + on.ssh.join(', '));
      if (!on.pair || !on.folder) bad.push('paired: pairing or the folder step is off the path ' + JSON.stringify(on));
      const seq = await backRun(A), ssh = seq.filter((x) => SSH_STEPS.includes(x));
      if (ssh.length) bad.push('Back from Review walks SSH steps for a paired NAS: ' + seq.join(' > '));
      if (!seq.includes('nas-find') || seq[seq.length - 1] !== 'welcome') bad.push('Back from Review: ' + seq.join(' > '));
    }, { scenario: 'fresh+homeNasPm' });
  }
};

/* a new Server on Home NAS, as back-after-change's toNewServer: the concept host's owner answers stand in for the Server
   where one is left pending (a disclosed fixture, as tools/scenarios.mjs's finishServerSetup gives them) */
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
