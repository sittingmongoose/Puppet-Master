/* Focused selected-concept DOM check for packet repair. Browser fixture evidence only. */
import { launch, sleep } from './pm_cdp.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(here, '../../PMConcept7.html');
const output = process.argv[2];
const { page, close } = await launch({ width: 1450, height: 950 });
const check = (ok, name, data) => { if (!ok) throw Error(`${name}: ${JSON.stringify(data)}`); results.push({ name, pass: true }); };
const results = [];
try {
  await page.goto(pathToFileURL(file).href + '?o55=off');
  await sleep(900);
  const initial = await page.evaluate(() => ({ scope: window.PM7_NAMED_PLAN_SCOPE?.state(),
    fixture: window.PM7_NAMED_PLAN_SCOPE?.fixtures(), runVisible: !!document.querySelector('#panel-orchestrator [data-named-plan-scope="plan"]') }));
  check(initial.scope?.scope === 'plan' && initial.scope?.plan === 'named-plan:alpha', 'explicit initial Project and Plan', initial);
  check(initial.fixture.filter(p => p.project === 'project:atlas' && p.name === 'Atlas launch').length === 2, 'duplicate names keep separate IDs', initial.fixture);
  const switched = await page.evaluate(() => {
    const bar = document.querySelector('#pm7-named-plan-scope');
    const scope = bar.querySelector('[data-plan-field="scope"]'); scope.value = 'all'; scope.dispatchEvent(new Event('change', { bubbles: true }));
    const all = [...document.querySelectorAll('#pm7-named-plan-cards [data-plan-select]')].map(e => e.dataset.planSelect);
    document.querySelector('#pm7-named-plan-cards [data-plan-select="named-plan:beta"]').click();
    const other = { state: window.PM7_NAMED_PLAN_SCOPE.state(), cards: [...document.querySelectorAll('#pm7-named-plan-cards [data-plan-select]')].map(e => e.dataset.planSelect) };
    bar.querySelector('[data-plan-action="new"]').click();
    return { all, other, preview: bar.querySelector('[data-plan-selected-label]').textContent };
  });
  check(switched.all.length === 3 && switched.other.state.plan === 'named-plan:beta' && switched.other.cards.includes('named-plan:beta'), 'scope switch preserves exact Plan identity', switched);
  check(switched.preview.includes('native Plan creation unavailable'), 'new Plan is fixture preview only', switched.preview);

  const online = await page.evaluate(() => {
    const O = window.O55; O.ui.open({ fresh: true, screen: 'online-service' });
    const S = O.S, d = S.sess.drafts.main;
    S.sess.forgeAccounts.github = 'cloud-user';
    O.draft.set(d, { online_mode: 'new', forge: 'github', forge_provider_variant: 'self_managed', forge_instance_url: 'https://enterprise.example', forge_account_ref: '' });
    O.official.signIn(S, { service: 'github', name: 'GitHub Enterprise', kind: 'forge', then: 'online-details' });
    return { connected: !!document.querySelector('#pm-o55-onboarding [data-key="another"]'),
      account: O.official.accountFor(S, 'github') };
  });
  check(!online.connected && !online.account, 'cloud account cannot reuse Enterprise instance', online);
  await page.click('#pm-o55-onboarding [data-o55-do="create"]'); await sleep(180);
  const signup = await page.evaluate(() => ({ form: !!document.querySelector('#o55f-simUser,#o55f-simEmail'),
    returnButton: !!document.querySelector('#pm-o55-onboarding [data-o55-do="signupBack"]'),
    status: window.O55.S.sess.signin.state }));
  check(!signup.form && signup.returnButton && signup.status === 'create', 'signup is external handoff', signup);
  await page.click('#pm-o55-onboarding [data-o55-do="signupBack"]');
  check(await page.evaluate(() => window.O55.S.sess.signin.state !== 'done'), 'signup return requires sign-in');

  await sleep(350);
  await page.evaluate(() => {
    const O = window.O55, S = O.S, d = S.sess.drafts.main;
    O.draft.set(d, { online_mode: 'new', forge: 'azure_devops', forge_provider_variant: 'cloud', forge_instance_url: '', repository_container: 'platyr', repository_project: '', forge_account_ref: 'account:azure-devops-cloud:jared' });
    S.sess.forgeAccounts['azure_devops|cloud|' + d.forge_instance_url] = 'jared';
    S.save(); O.ui.close('close');
  });
  await sleep(700);
  await page.evaluate(() => window.O55.ui.open({ screen: 'online-details' }));
  const azure = await page.evaluate(() => ({ screen: window.O55.S.sess.screen, open: window.O55.S.open,
    html: document.querySelector('#pm-o55-onboarding .o55-pane')?.innerHTML.slice(0, 1500),
    refresh: !!document.querySelector('#pm-o55-onboarding [data-o55-do="azRefresh"]') }));
  check(azure.refresh, 'Azure fresh owner refresh control', azure);
  await page.click('#pm-o55-onboarding [data-o55-do="azRefresh"]'); await sleep(200);
  const azProjects = await page.evaluate(() => ({ rows: [...document.querySelectorAll('#pm-o55-onboarding [data-o55-do="azProject"]')].map(e => e.dataset.arg || e.getAttribute('data-o55-arg') || e.outerHTML.slice(0, 180)),
    draft: { ...window.O55.S.sess.drafts.main }, feed: window.O55.S.sess.azureProjects, env: window.O55.S.env.forges.azure_devops.projects }));
  check(azProjects.rows.length === 2, 'Azure shows fresh Git GUID projects', azProjects);
  const advanced = await page.evaluate(() => ({ buttons: [...document.querySelectorAll('#pm-o55-onboarding [data-o55-do]')].map(e => e.dataset.o55Do).filter(x => x?.startsWith('az')),
    screen: window.O55.S.sess.screen, errors: window.O55.S.root?.innerText.slice(-800) }));
  check(advanced.buttons.includes('azAdvanced'), 'Azure advanced disclosure exists', advanced);
  await sleep(900);
  const advancedVisible = await page.evaluate(() => [...document.querySelectorAll('#pm-o55-onboarding [data-o55-do="azAdvanced"]')].map(e => ({ rects: e.getClientRects().length, hidden: e.closest('[hidden]')?.outerHTML.slice(0, 100), html: e.outerHTML.slice(0, 150) })));
  check(advancedVisible.some(x => x.rects), 'Azure advanced disclosure visible', advancedVisible);
  await page.click('#pm-o55-onboarding [data-o55-do="azAdvanced"]'); await sleep(160);
  check(await page.evaluate(() => !!document.querySelector('#pm-o55-onboarding [data-o55-do="azCreateTeamProject"]')), 'Advanced official Azure handoff');
  await page.evaluate(() => window.O55.ui.close('close'));

  const settings = await page.evaluate(() => {
    const tab = document.getElementById('tab-settings'); if (tab) tab.click();
    return { exact: typeof window.PM51?.revealProviderModel === 'function' && typeof window.PM51?.revealHistoryObject === 'function',
      frequency: !!document.querySelector('[data-setting-id="system.advanced.update-frequency"]'),
      backup: typeof window.PM51?.refresh === 'function' };
  });
  check(settings.exact && !settings.frequency && settings.backup, 'Settings exact targets and no normal frequency', settings);
  const exact = await page.evaluate(() => {
    const ambiguous = window.PM51.revealProviderModel('claude-code', 'claude-opus');
    const choice = document.querySelector('#panel-settings')?.textContent.includes('Choose a model account');
    const resolved = window.PM51.revealProviderModel('openai-codex', 'gpt-codex');
    return { ambiguous, choice, resolved,
      target: document.querySelector('[data-search-exact-target="gpt-codex"]')?.outerHTML.slice(0, 180) || null };
  });
  check(exact.ambiguous && exact.choice && exact.resolved && exact.target, 'exact model targets distinguish ambiguous and unique accounts', exact);
  const backup = await page.evaluate(() => {
    window.PM12_KIMI.navigate('system', 'backup'); window.PM51.setTab('backup', 'restore'); window.PM51.refresh('backup');
    return { selection: window.PM51.s().backupRestore,
      controls: [...document.querySelectorAll('#panel-settings [data-action]')].map(e => e.dataset.action).filter(x => x?.includes('backup-restore')).slice(0, 20),
      text: document.querySelector('#panel-settings')?.innerText.slice(-1000) };
  });
  check(backup.selection?.whichId && backup.controls.some(x => x.includes('backup-restore-start')), 'restore binds stable recovery point in DOM', backup);
  check(!page.errors.length, 'no browser exceptions', page.errors);
  const report = { artifact: file, sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    scope: 'focused selected-concept DOM, not native handler proof', results, browserErrors: page.errors };
  if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ pass: results.length, sha256: report.sha256 }));
} finally { await close(); }
