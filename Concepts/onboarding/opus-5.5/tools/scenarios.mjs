/* Onboarding acceptance scenarios (packet 06 list + the Connect, Server, NAS/SSH and restore paths), driven by real
 * CDP clicks and typing. node tools/scenarios.mjs <out-dir> [--only s01,s18] [--theme basic-dark]
 * Writes report.json (per scenario: steps, assertions, errors, refused commands, command log), drafts.json (every
 * captured draft, for tools/schema_check.py validate) and a final screenshot per scenario. */
import { open, sleep } from './drive.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/scenarios');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const only = opt('only', '') ? opt('only', '').split(',') : null;
const theme = opt('theme', 'basic-dark');
const snaps = argv.includes('--snaps');
mkdirSync(out, { recursive: true });

const SC = [];
const def = (id, scenario, title, fn) => SC.push({ id, scenario, title, fn });
const until = (d, js, what, timeout) => d.until(new Function('return ' + js), { what, timeout: timeout || 15000 });
const readyPrimary = (d) => d.until(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b && b.getAttribute('aria-disabled') !== 'true'; }, { what: 'primary enabled', timeout: 15000 });
async function toName(d) { await d.primary(); await d.primary(); await d.primary(); await d.primary(); } /* welcome→look→where→begin→name */
async function reviewAndCreate(d) { await readyPrimary(d); await d.primary(); await until(d, "window.O55.S.sess.commit.state === 'done' || window.O55.S.sess.commit.state === 'failed'", 'commit settled', 25000); }

/* ---------------------------------------------------------------------------------------------- packet scenarios */
def('s01', 'fresh', 'Fresh user, local default, no existing Projects', async (d, A) => {
  await d.openOnboarding(); await toName(d);
  A.eq(await d.screen(), 'name', 'no Start-like step without Projects');
  await d.type('name', 'Book club website'); await d.primary();
  A.eq(await d.screen(), 'safe', 'safe after name'); await d.primary();
  A.eq(await d.screen(), 'review', 'review after safe'); await reviewAndCreate(d);
  A.eq(await d.state(() => window.O55.S.sess.commit.state), 'done', 'commit done');
  A.ok(await d.state(() => !!document.querySelector('#projectMenu [data-project="p-book-club-website"].is-selected')), 'new Project selected in the title bar');
  await d.primary(); A.eq(await d.screen(), 'ai', 'AI only after commit');
  const cmds = await d.commands(); A.ok(cmds.findIndex((c) => c.includes('postcommit')) > cmds.findIndex((c) => c.includes('project_commit')), 'provider work after the commit');
  A.capture('s01 after commit', await d.draft('main'));
  A.ok(d.log.filter((x) => x.primary).length <= 10, 'about nine clicks plus a name (' + d.log.filter((x) => x.primary).length + ')');
});
def('s02', 'returning', 'Existing Projects available; Start fresh', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Book club website'); await d.primary();
  A.eq(await d.screen(), 'like', 'Start like another Project is offered');
  A.ok(await d.state(() => !!document.querySelector('.o55-card.o55-on[data-arg="fresh"]')), 'Start fresh is the default');
  await d.primary(); A.eq(await d.screen(), 'safe', 'continue to safe');
  A.eq((await d.draft('main')).settings_transfer.mode, 'start_fresh', 'draft stays fresh');
});
def('s03', 'returning', 'Inherit settings with preview and optional group selection', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Book club website'); await d.primary();
  await d.act('pick', 'tastebook', { settle: 900 });
  A.ok(await d.state(() => /Uses the same/.test(document.querySelector('.o55-previewtext') ? document.querySelector('.o55-previewtext').textContent : '')), 'owner preview shown');
  await d.act('choose'); await d.act('cat', 'Notifications & sounds');
  A.ok(await d.state(() => !window.O55.S.sess.like.categories.includes('Notifications & sounds')), 'category deselected');
  await d.act('sheet-close'); const dr = await d.draft('main');
  A.eq(dr.settings_transfer.mode, 'copy_from_project', 'draft copies'); A.ok(/^[0-9a-f]{64}$/.test(dr.settings_transfer.draft_preview_sha256 || ''), 'preview sha256 recorded');
  await d.primary(); await d.primary(); await reviewAndCreate(d);
  const cm = await d.state(() => window.O55.S.sess.commit);
  A.ok(cm.receipts && cm.receipts.settings && cm.receipts.settings !== 'no-change', 'real Settings owner applied the copy (' + (cm.receipts && cm.receipts.settings) + ', ' + cm.settingsCount + ' values)');
  A.capture('s03 copy', await d.draft('main'));
});
def('s04', 'fresh', 'Back through every pre-commit choice creates nothing', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Temp'); await d.primary(); await d.primary();
  A.eq(await d.screen(), 'review', 'at review');
  for (let i = 0; i < 6; i++) { if ((await d.screen()) === 'welcome') break; await d.back(); }
  A.eq(await d.screen(), 'welcome', 'back to the start');
  A.ok(!(await d.commands()).some((c) => c.includes('project_commit')), 'no commit command ran');
  A.ok(await d.state(() => !document.querySelector('#projectMenu [data-project="p-temp"]')), 'no Project in the menu');
});
def('s05', 'fresh', 'Close and resume before commit with the draft intact', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Garden notes'); await d.primary();
  await d.state(() => window.O55.ui.close('close')); await sleep(700);
  A.ok(await d.state(() => !!document.getElementById('o55-resume')), 'resume chip shown');
  await d.state(() => document.querySelector('#o55-resume [data-o55-chip="resume"]').click()); await sleep(1200);
  A.eq(await d.screen(), 'safe', 'reopens on the saved screen');
  A.eq((await d.draft('main')).project_name, 'Garden notes', 'draft intact');
});
def('s06a', 'fresh', 'Existing folder', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary();
  await d.act('pick', 'existing'); await d.act('sub', 'folder'); await d.primary();
  A.eq(await d.screen(), 'ex-folder', 'folder picker'); await d.act('pick', '~/Documents/recipe-app', { settle: 1200 });
  A.ok(await d.state(() => /history/.test(document.querySelector('[data-key="finfo"]') ? document.querySelector('[data-key="finfo"]').textContent : '')), 'read-only check shows history');
  await d.primary(); A.eq(await d.screen(), 'name', 'name'); await d.primary(); await d.primary();
  A.ok(/Add Project/.test((await d.primaryInfo()).label), 'button says Add Project'); await reviewAndCreate(d);
  A.capture('s06a folder', await d.draft('main'));
});
def('s06b', 'fresh', 'Bring in a Project stored online (just-in-time sign-in)', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary();
  await d.act('pick', 'existing'); await d.act('sub', 'online'); await d.primary();
  A.eq(await d.screen(), 'online-service', 'service choice'); await d.primary();
  A.eq(await d.screen(), 'online-signin', 'sign in'); await d.act('signIn');
  await until(d, "window.O55.S.sess.signin.state === 'done'", 'signed in', 8000); await d.primary();
  A.eq(await d.screen(), 'ex-repos', 'repository list'); await d.act('pick', 'jared-p/garden-planner');
  await d.primary(); A.eq(await d.screen(), 'name', 'name'); A.eq((await d.draft('main')).project_name, 'Garden planner', 'name from the online Project');
  A.ok(!(await d.commands()).some((c) => c.includes('postcommit')), 'no AI provider work before commit');
  await d.primary(); await d.primary(); await reviewAndCreate(d); A.capture('s06b online', await d.draft('main'));
});
def('s06c', 'fresh', 'Restore a Project from a backup', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary();
  await d.act('pick', 'restore'); await d.primary();
  A.eq(await d.screen(), 'r-source', 'backup source'); await d.act('source', 'kit'); await d.primary();
  await d.type('phrase', 'river candle orbit maple quiet lantern'); await d.primary();
  A.eq(await d.screen(), 'r-pick', 'pick snapshot'); await d.act('pick', 'bk-recipe#0'); await d.primary();
  A.eq(await d.screen(), 'name', 'name'); await d.primary(); await d.primary();
  A.ok(/Restore Project/.test((await d.primaryInfo()).label), 'button says Restore Project'); await reviewAndCreate(d);
  A.capture('s06c restore', await d.draft('main'));
});
def('s08', 'fresh', 'Review Edit returns to review', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'First name'); await d.primary(); await d.primary();
  await readyPrimary(d); await d.act('edit', 'name'); A.eq(await d.screen(), 'name', 'edit name');
  await d.type('name', 'Second name'); await d.primary(); A.eq(await d.screen(), 'review', 'Continue returns straight to review');
  A.ok(await d.state(() => /Second name/.test(document.querySelector('.o55-title').textContent)), 'title shows the new name');
});
def('s09', 'nameTaken', 'Commit failure, change the name, resume (idempotent)', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Book club website'); await d.primary();
  await d.act('online'); await d.primary(); await d.act('signIn'); await until(d, "window.O55.S.sess.signin.state === 'done'", 'signed', 8000); await d.primary();
  A.eq(await d.screen(), 'online-details', 'name on GitHub'); await d.primary(); await d.primary();
  await reviewAndCreate(d); A.eq(await d.state(() => window.O55.S.sess.commit.state), 'failed', 'online copy failed at creation');
  await d.act('rename'); A.eq(await d.screen(), 'online-details', 'change the name'); await d.type('repo', 'book-club-site'); await d.primary();
  await until(d, "window.O55.S.sess.commit.state === 'done'", 'resumed commit', 20000);
  A.eq(await d.state(() => document.querySelectorAll('#projectMenu [data-project="p-book-club-website"]').length), 1, 'exactly one Project');
});
def('s09b', 'flaky', 'Network failure, Try again resumes', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Flaky one'); await d.primary();
  await d.act('online'); await d.primary(); await d.act('signIn'); await until(d, "window.O55.S.sess.signin.state === 'done'", 'signed', 8000); await d.primary(); await d.primary(); await d.primary();
  await reviewAndCreate(d); A.eq(await d.state(() => window.O55.S.sess.commit.code), 'network', 'network failure');
  await d.act('retry'); await until(d, "window.O55.S.sess.commit.state === 'done'", 'retry done', 20000); A.ok(true, 'retry completed');
});
async function toAi(d, name) { await d.openOnboarding(); await toName(d); await d.type('name', name || 'AI test'); await d.primary(); if ((await d.screen()) === 'like') await d.primary(); await d.primary(); await reviewAndCreate(d); await d.primary(); await until(d, "(window.O55.S.sess.ops||{})['detect:this computer'] && window.O55.S.sess.ops['detect:this computer'].state === 'done'", 'detection', 8000); await sleep(400); }
def('s10', 'returning', 'Provider already installed and signed in: Ready automatically', async (d, A) => {
  await toAi(d); A.ok(await d.state(() => window.O55.S.sess.ai.accounts.claude && window.O55.S.sess.ai.accounts.claude.state === 'ready'), 'Claude Ready with no action');
  A.ok(!(await d.state(() => [...document.querySelectorAll('.o55-pane button')].some((b) => /^(Connect|Use This Installation|Use This Provider|Open Installer)$/.test(b.textContent.trim())))), 'no forbidden action labels');
});
def('s11', 'cliMissing', 'CLI missing: explicit Install, then Sign In', async (d, A) => {
  await toAi(d); await d.act('install', 'claude'); await d.act('installGo', 'claude');
  await until(d, "window.O55.S.sess.ai.accounts.claude.state === 'signin'", 'installed', 10000); await d.act('signin', 'claude');
  await until(d, "window.O55.S.sess.ai.accounts.claude.state === 'ready'", 'ready', 10000); A.ok(true, 'Install then Sign In reached Ready');
});
def('s12', 'signedOut', 'Installed but signed out: Sign In', async (d, A) => {
  await toAi(d); A.ok(await d.state(() => !!document.querySelector('[data-o55-do="signin"][data-arg="claude"]')), 'Sign In offered, no Install');
  await d.act('signin', 'claude'); await until(d, "window.O55.S.sess.ai.accounts.claude.state === 'ready'", 'ready', 10000); A.ok(true, 'signed in');
});
def('s13', 'fresh', 'Key provider: Enter API Key, no Install', async (d, A) => {
  await toAi(d); A.ok(await d.state(() => !document.querySelector('[data-o55-do="install"][data-arg="cursor"]')), 'no Install for Cursor');
  await d.act('key', 'cursor'); await d.type('key:cursor', 'short'); await d.act('keyCheck', 'cursor', { settle: 1400 });
  A.ok(await d.state(() => window.O55.S.sess.ai.accounts.cursor.state === 'keyEntry'), 'bad key rejected');
  await d.type('key:cursor', 'cur_live_8f3k2m9x1q4w'); await d.act('keyCheck', 'cursor', { settle: 1500 });
  A.ok(await d.state(() => window.O55.S.sess.ai.accounts.cursor.state === 'ready'), 'key accepted');
  A.ok(!(await d.state(() => JSON.stringify(window.O55.S.sess)).then((s) => s.includes('cur_live'))), 'key never stored in the session');
});
def('s14', 'returning', 'Copied provider route already usable', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Copy AI'); await d.primary(); await d.act('pick', 'tastebook', { settle: 900 }); await d.primary(); await d.primary(); await reviewAndCreate(d); await d.primary();
  await until(d, "window.O55.S.sess.ai.accounts.claude && window.O55.S.sess.ai.accounts.claude.state === 'ready'", 'claude ready', 8000);
  A.ok(await d.state(() => /From Tastebook/.test(document.querySelector('[data-key="pv-claude"]').textContent)), 'row says From Tastebook');
});
def('s16', 'fresh', 'Skip providers, then Set Up Free Models', async (d, A) => {
  await toAi(d); await d.act('skip'); A.ok(await d.state(() => /can't plan or work/.test(document.body.textContent)), 'skip says what it limits');
  await d.act('free'); A.eq(await d.screen(), 'free', 'Free Models'); await d.act('route', 'free-openrouter');
  await until(d, "(window.O55.S.sess.ai.freeRoutes||{})['free-openrouter'] === 'ready'", 'route ready', 8000); await d.primary();
  A.eq(await d.screen(), 'ready', 'Ready');
});
def('s17', 'fresh', 'Close after commit and resume at AI', async (d, A) => {
  await toAi(d, 'Resume me'); await d.state(() => window.O55.ui.close('close')); await sleep(600);
  await d.state(() => document.querySelector('#o55-resume [data-o55-chip="resume"]').click()); await sleep(1200);
  A.eq(await d.screen(), 'ai', 'resumes at AI'); A.eq(await d.state(() => window.O55.S.sess.commit.state), 'done', 'Project stays created');
});
def('s23', 'lowResource', 'Low-resource mode drops ambient motion only', async (d, A) => {
  await d.openOnboarding(); A.ok(await d.state(() => document.documentElement.hasAttribute('data-o55-lowres')), 'low-resource attribute set');
  await d.primary(); A.eq(await d.screen(), 'look', 'choices still work');
});

/* ---------------------------------------------------------------------------------------------- journeys */
def('c1', 'fresh', 'Connect this device, then Create a new Project on it', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary();
  await d.act('pick', 'connect'); await d.primary(); A.eq(await d.screen(), 'c-route', 'connect route');
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"pm:home\"]')", 'found Home NAS', 6000); await d.act('pickServer', 'pm:home');
  await d.primary(); A.eq(await d.screen(), 'c-review', 'review'); await d.primary();
  A.eq(await d.screen(), 'c-pair', 'pairing'); await until(d, 'window.O55.S.sess.connect.paired', 'approved', 9000);
  await d.primary(); A.eq(await d.screen(), 'c-ready', 'ready to meet your Puppet Master');
  A.capture('c1 connect', await d.draft('connect'));
  await d.act('createNew'); A.eq(await d.screen(), 'begin', 'second draft begins');
  const m = await d.draft('main'); A.eq(m.server_mode, 'existing_server', 'new Project on the existing Server'); A.eq(m.server_ref, 'pm:home', 'same Server');
  await d.primary(); await d.type('name', 'Book club website'); await d.primary();
  A.eq(await d.screen(), 'like', 'Start like another Project offers the Server\'s Projects'); await d.primary(); await d.primary();
  A.eq(await d.screen(), 'review', 'no away step on connect'); await reviewAndCreate(d); A.capture('c1 new project', await d.draft('main'));
  await d.primary(); await until(d, "window.O55.S.sess.ai.accounts.claude && window.O55.S.sess.ai.accounts.claude.state === 'ready'", 'server AI ready', 8000); A.ok(true, 'AI on Home NAS Ready');
});
def('c2', 'fresh', 'Connect by code, with a wrong code first', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('pick', 'connect'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"pm:home\"]')", 'found', 6000); await d.act('pickServer', 'pm:home'); await d.primary();
  await d.act('pairing', 'code'); await d.primary(); await until(d, "(window.O55.S.sess.ops['pairreach:pm:home']||{}).state === 'done'", 'reached', 5000);
  await d.type('code', 'AAAA-BBBB'); await d.act('checkCode', null, { settle: 1400 });
  A.ok(await d.state(() => /doesn't match/.test(document.body.textContent)), 'wrong code explained');
  await d.type('code', 'A7K9-M2Q4'); await d.act('checkCode', null, { settle: 1800 }); A.ok(await d.state(() => window.O55.S.sess.connect.paired), 'paired by code');
});
def('c3', 'fresh', 'Connect through My own web address', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('pick', 'connect'); await d.primary();
  await d.act('more'); await d.act('route', 'reverse_proxy'); await d.type('proxy', 'https://pm.example.net');
  const dr = await d.draft('connect'); A.eq(dr.server_connection_mode, 'manual', 'manual connection (#22)'); A.eq(dr.proxy_kind, null, 'no proxy setup on this device (#22)');
  A.capture('c3 proxy', dr);
});
def('v1', 'fresh', 'Set up a new Server, then a Project on it with Tailscale', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('pick', 'server'); await d.primary();
  A.eq(await d.screen(), 's-kind', 'kind of computer'); await d.primary(); A.eq(await d.screen(), 's-wait', 'waiting');
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"pm:new\"]')", 'found truenas.local', 6000); await d.act('pick', 'pm:new'); await d.primary();
  A.eq(await d.screen(), 's-confirm', 'confirm'); await d.type('code', '000 000'); await d.primary({ settle: 1500 });
  A.ok(await d.state(() => /doesn't match/.test(document.body.textContent)), 'wrong setup code explained');
  await d.type('code', '482 913'); await d.primary(); await d.untilScreen('s-ready', 8000);
  A.ok(await d.state(() => !!document.querySelector('.o55-qr')), 'pairing card with QR'); await d.primary();
  A.eq(await d.screen(), 'begin', 'Project chapter'); await d.primary(); await d.type('name', 'Garden planner'); await d.primary(); await d.primary();
  A.eq(await d.screen(), 'away', 'away from home step'); await d.act('pick', 'anywhere'); await d.primary();
  await reviewAndCreate(d); A.capture('v1 server', await d.draft('main'));
});
def('n1', 'fresh', 'Files on a NAS over SSH with a new key and one password', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary();
  await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  A.eq(await d.screen(), 'nas-find', 'find device'); A.ok(await d.state(() => !!document.querySelector('.o55-seg button.o55-on[data-arg="ssh"]')), 'SSH selected by default');
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary();
  A.eq(await d.screen(), 'nas-identity', 'identity before trust'); await d.primary();
  A.eq(await d.screen(), 'nas-key', 'choose a key'); await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys tested', 5000);
  A.ok(await d.state(() => document.querySelectorAll('.o55-keys .o55-card').length >= 5), 'four discovered keys plus a new key');
  A.ok(await d.state(() => !!document.querySelector('.o55-card.o55-on[data-arg="new"]')), 'new key recommended when none works');
  await d.primary(); A.eq(await d.screen(), 'nas-signin', 'sign in once');
  await d.type('user', 'jared'); await d.type('pw', 'correct horse'); await d.primary();
  A.ok(!(await d.state(() => JSON.stringify(window.O55.S.sess))).includes('correct horse'), 'password never stored');
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'key installed', 9000); await d.primary();
  A.eq(await d.screen(), 'nas-folder', 'folder browser'); await d.act('cd', '/volume1/projects'); await d.act('cd', '/volume1/projects/recipe-app'); await d.primary();
  A.eq(await d.screen(), 'name', 'name'); const dr = await d.draft('main'); A.eq(dr.project_transport, 'ssh', 'ssh transport'); A.ok(dr.source_access_authorization_refs.some((r) => r.startsWith('ssh-key:')), 'key recorded as a reference');
  A.capture('n1 nas', dr);
});
def('n2', 'keyWorks', 'A key already works: no password step', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary();
  A.ok(await d.state(() => /connected to Home NAS before/.test(document.body.textContent)), 'known host recognised'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys', 5000);
  A.ok(await d.state(() => !!document.querySelector('.o55-card.o55-on[data-arg="k-ed"]')), 'working key preselected'); await d.primary();
  A.eq(await d.screen(), 'nas-install', 'straight to verify, no password');
});
def('n3', 'hostChanged', 'Known device with a changed ID blocks', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary();
  A.ok(await d.state(() => /ID has changed/.test(document.body.textContent)), 'blocking warning'); A.ok(/Stop/.test((await d.primaryInfo()).label), 'Stop is the primary action');
});
def('n4', 'wrongPassword', 'Wrong NAS password once', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary(); await d.primary();
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys', 5000); await d.primary();
  await d.type('user', 'jared'); await d.type('pw', 'wrong'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'failed'", 'failed', 8000); await d.primary();
  A.eq(await d.screen(), 'nas-signin', 'back to sign in'); A.ok(await d.state(() => /didn't accept/.test(document.body.textContent)), 'explains the password');
  await d.type('pw', 'correct horse'); await d.primary(); await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'installed', 9000); A.ok(true, 'second try works');
});
def('n5', 'readOnly', 'Read-only NAS folder is refused', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary(); await d.primary();
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys', 5000); await d.primary(); await d.type('user', 'jared'); await d.type('pw', 'x'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'installed', 9000); await d.primary();
  await d.act('cd', '/volume1/projects'); A.ok((await d.primaryInfo()).disabled, 'Use this folder is disabled for a read-only folder');
});
def('n6', 'homeNasPm', 'NAS already runs Puppet Master: pairs, no SSH password', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home');
  A.ok(await d.state(() => /pair directly/.test(document.body.textContent)), 'explains direct pairing'); await d.primary(); await d.primary();
  A.eq(await d.screen(), 'nas-install', 'no key or password steps'); await until(d, "Object.keys(window.O55.S.sess.ops).some((k) => k.startsWith('sshinstall:nas-home') && window.O55.S.sess.ops[k].state === 'done')", 'paired', 8000);
  await d.primary(); A.eq(await d.screen(), 'nas-folder', 'folder browser');
});
def('n7', 'keyRefused', 'Key refused once: one clear fix', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary(); await d.primary();
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys', 5000); await d.primary(); await d.type('user', 'jared'); await d.type('pw', 'x'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'failed'", 'refused', 8000);
  A.ok(await d.state(() => /shared too widely/.test(document.body.textContent)), 'explains the refusal'); await d.act('fixPerms');
  await until(d, "Object.keys(window.O55.S.sess.ops).some((k) => k.startsWith('sshinstall:nas-home') && window.O55.S.sess.ops[k].state === 'done')", 'fixed', 9000); A.ok(true, 'fixed and verified');
});
def('d1', 'fresh', 'Concept demo pill switches the world while the window is open', async (d, A) => {
  await d.openOnboarding();
  await d.page.click('#o55-demo .o55-demopill'); await sleep(300);
  A.ok(await d.state(() => !!document.querySelector('#o55-demo .o55-demomenu')), 'menu opens over the onboarding scrim');
  await d.page.click('#o55-demo [data-demo="scenario"][data-arg="returning"]'); await sleep(1200);
  A.eq(await d.state(() => window.O55.S.env.scenario), 'returning', 'scenario switched'); A.eq(await d.screen(), 'welcome', 'onboarding restarted');
  A.ok(await d.state(() => /Welcome back/.test(document.body.textContent)), 'returning banner from cached records');
});
def('r1', 'fresh', 'Moving from an old computer: restore everything', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('restoreAll');
  A.eq(await d.screen(), 'r-source', 'backup source'); await d.act('source', 'kit'); await d.primary(); await d.type('phrase', 'river candle orbit maple quiet lantern'); await d.primary();
  await d.act('pick', 'full-1'); await d.primary(); A.eq(await d.screen(), 'r-preview', 'preview'); await d.primary();
  await d.untilScreen('r-done', 12000); A.ok(true, 'restored');
});
def('l1', 'fresh', 'Set up a Project later', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('later');
  A.eq(await d.screen(), 'review', 'review says nothing will be created'); await readyPrimary(d); await d.primary();
  A.eq(await d.screen(), 'ready', 'no AI chapter on the deferred path'); A.ok(/Create a Project now/.test((await d.primaryInfo()).label), 'offers Create a Project now');
  A.capture('l1 later', await d.draft('main'));
});

/* ---------------------------------------------------------------------------------------------- logic audit (AUDIT.md) */
/* welcome -> look -> where: a new Server -> NAS -> found -> claimed -> Server ready -> the Project chapter */
async function toNewServer(d) {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('pick', 'server'); await d.primary(); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"pm:new\"]')", 'found truenas.local', 6000); await d.act('pick', 'pm:new'); await d.primary();
  await d.type('code', '482 913'); await d.primary(); await d.untilScreen('s-ready', 8000); await d.primary();
}
def('a1', 'fresh', 'A Project later on a new Server still sets up its access, and nothing else', async (d, A) => {
  await toNewServer(d); A.eq(await d.screen(), 'begin', 'Project chapter');
  await d.act('later'); A.eq(await d.screen(), 'away', "the Server's access is still asked");
  await d.act('pick', 'anywhere'); await d.primary(); A.eq(await d.screen(), 'review', 'review');
  A.ok(await d.state(() => !!document.querySelector('#pm-o55-onboarding [data-key="rv-remote"]')), 'Review shows the access');
  A.ok(await d.state(() => /No Project is created/.test((document.querySelector('#pm-o55-onboarding .o55-will') || {}).textContent || '')), 'Review says no Project is created');
  await d.primary(); A.eq(await d.screen(), 'creating', 'the access is prepared');
  await until(d, "window.O55.S.sess.commit.state === 'done'", 'prepared', 12000);
  A.eq(await d.state(() => (window.O55.S.sess.ops[window.O55.S.sess.commit.key].phases || []).map((p) => p.key).join()), 'remote,check', 'only the access and a check run');
  A.ok(await d.state(() => !window.O55.S.sess.commit.projectId && !document.querySelector('#projectMenu [data-project^="p-"]')), 'no Project record anywhere');
  await d.primary(); A.eq(await d.screen(), 'ready', 'ready');
  A.ok(await d.state(() => !document.querySelector('#pm-o55-onboarding [data-o55-do="tour"]') && !!document.querySelector('#pm-o55-onboarding [data-o55-do="createNow"]')), 'no tour without a Project; Create a Project now instead');
  A.capture('a1 later on a new Server', await d.draft('main'));
});
def('a2', 'fresh', 'Connect to a Server with no Projects: Create a new Project leads, no tour', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('pick', 'connect'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"pm:garage\"]')", 'found Garage Pi', 6000); await d.act('pickServer', 'pm:garage');
  await d.primary(); await d.primary(); await until(d, 'window.O55.S.sess.connect.paired', 'approved', 9000); await d.primary();
  A.eq(await d.screen(), 'c-ready', 'ready to meet');
  A.ok(await d.state(() => /No Projects on Garage Pi yet/.test(document.querySelector('#pm-o55-onboarding').textContent)), 'says there are no Projects yet');
  A.ok(await d.state(() => !document.querySelector('#pm-o55-onboarding [data-o55-do="tour"]')), 'no tour offered');
  A.eq((await d.primaryInfo()).label, 'Create a new Project', 'Create a new Project leads');
  await d.primary(); A.eq(await d.screen(), 'begin', 'the second draft begins');
});
def('a3', 'fresh', 'A cloud computer is reached by its address and is not called Home NAS', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.act('pick', 'server'); await d.primary();
  await d.act('kind', 'cloud'); await d.primary(); A.eq(await d.screen(), 's-wait', 'waiting');
  A.ok(await d.state(() => !document.querySelector('.o55-card[data-arg="pm:new"]') && !!document.querySelector('#pm-o55-onboarding [data-o55-bind="addr"]')), 'no home-network scan; its address is asked');
  await d.type('addr', '203.0.113.24'); await d.act('pick', 'pm:cloud'); await d.primary();
  A.eq(await d.screen(), 's-confirm', 'confirm');
  A.eq(await d.state(() => document.querySelector('#pm-o55-onboarding [data-o55-bind="name"]').value), 'Cloud server', 'named for what it is');
});
def('a4', 'fresh', 'On a new Server an existing folder is on the Server, keeps its place and keeps its online copy', async (d, A) => {
  await toNewServer(d); await d.act('pick', 'existing');
  A.ok(await d.state(() => /A folder on Home NAS/.test(document.querySelector('#pm-o55-onboarding').textContent)), 'the folder choice names the Server');
  await d.act('sub', 'folder'); await d.primary(); A.eq(await d.screen(), 'ex-folder', 'folder');
  await d.act('pick', '/mnt/tank/projects/recipe-app'); await until(d, "(window.O55.S.sess.ops['folder:/mnt/tank/projects/recipe-app']||{}).state === 'done'", 'checked', 5000);
  await d.primary(); A.eq(await d.screen(), 'name', 'name');
  A.ok(await d.state(() => /Stays in \/mnt\/tank\/projects\/recipe-app on Home NAS/.test(document.querySelector('#pm-o55-onboarding').textContent) && !document.querySelector('#pm-o55-onboarding [data-o55-do="storage"]')), 'kept in place, no storage question');
  await d.primary(); if ((await d.screen()) === 'like') await d.primary();
  A.eq(await d.screen(), 'safe', 'keep your work safe');
  A.ok(await d.state(() => /already linked/.test(document.querySelector('#pm-o55-onboarding [data-key="r-online"]').textContent) && !document.querySelector('#pm-o55-onboarding [data-key="r-online"] [data-o55-do="online"]')), 'its online copy is shown, no second copy offered');
  await d.primary(); A.eq(await d.screen(), 'away', 'away'); await d.primary(); A.eq(await d.screen(), 'review', 'review');
  A.ok(await d.state(() => /already linked/.test(document.querySelector('#pm-o55-onboarding [data-key="rv-online"]').textContent) && !/online copy/i.test((document.querySelector('#pm-o55-onboarding [data-key="notset"]') || {}).textContent || '')), 'Review shows the linked copy and does not list it as not set up');
  A.capture('a4 folder on the Server', await d.draft('main'));
});
def('a5', 'fresh', 'Restoring from a NAS shows its identity and sets up a key first', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary();
  await d.act('pick', 'restore'); await d.primary(); A.eq(await d.screen(), 'r-source', 'backup source');
  await d.act('source', 'nas'); await d.act('device', 'nas-home'); await d.primary();
  A.eq(await d.screen(), 'nas-identity', 'identity before trust'); await d.primary();
  A.eq(await d.screen(), 'nas-key', 'a key'); await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys tested', 5000); await d.primary();
  A.eq(await d.screen(), 'nas-signin', 'sign in once'); await d.type('user', 'jared'); await d.type('pw', 'correct horse'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'key installed', 9000); await d.primary();
  A.eq(await d.screen(), 'r-pick', 'then the backups');
});
def('a6', 'fresh', 'Choosing This computer after setting up a Server leaves nothing of the Server in the draft', async (d, A) => {
  await toNewServer(d);
  for (let i = 0; i < 8 && (await d.screen()) !== 'where'; i++) await d.back();
  A.eq(await d.screen(), 'where', 'back to where the work runs');
  await d.act('pick', 'this'); await d.primary(); A.eq(await d.screen(), 'begin', 'Project chapter');
  const m = await d.draft('main');
  A.ok(m.server_mode === 'this_device' && m.server_ref === '' && m.remote_mode === 'none' && m.server_trust_confirmed === false, 'no Server reference, trust or access route left behind');
});

/* ---------------------------------------------------------------------------------------------- audit, second pass */
async function toNasKey(d) {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary();
  await d.primary(); await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys tested', 5000);
}
const paneFits = (d) => d.state(() => { const p = document.querySelector('#pm-o55-onboarding .o55-pane').getBoundingClientRect(); return [...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) *')].filter((e) => e.getClientRects().length).every((e) => { const r = e.getBoundingClientRect(); return r.width < 3 || (r.right <= p.right + 3 && r.left >= p.left - 3); }); });
def('n8', 'fresh', "I'll add the key myself: a new key is made first, its own line is shown, and the check is real", async (d, A) => {
  await toNasKey(d); await d.primary();
  A.eq(await d.screen(), 'nas-signin', 'sign in once'); await d.act('selfOn');
  A.ok(/yourself/i.test(await d.state(() => document.querySelector('#o55-h').textContent)), 'the title says the key is added by hand, not "Sign in"');
  await until(d, "(window.O55.S.sess.ops['sshmake:nas-home']||{}).state === 'done'", 'new key made first', 5000); await d.settle(400);
  const line = await d.state(() => (document.querySelector('.o55-codeline code') || {}).textContent || '');
  A.ok(/^ssh-ed25519 AAAA\S+ puppet-master@MacBook-Pro$/.test(line), 'the line is the new key\'s public half (' + line.slice(0, 40) + '...)');
  A.ok(await paneFits(d), 'the line and its Copy button fit inside the window');
  await d.primary(); await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:k-pm']||{}).state === 'done'", 'checked with the key', 9000);
  A.ok(await d.state(() => window.O55.S.env.devices[0].authorized.includes('k-pm')), 'the device now has the key');
  await d.primary(); A.eq(await d.screen(), 'nas-folder', 'on to the folder');
});
def('n9', 'selfKeyMissing', "I'll add the key myself, but it is not there yet: the check says so and nothing goes on", async (d, A) => {
  await toNasKey(d); await d.act('pick', 'k-ed'); await d.primary();
  await d.act('selfOn'); await d.settle(300);
  const line = await d.state(() => (document.querySelector('.o55-codeline code') || {}).textContent || '');
  A.ok(/ jared@MacBook-Pro$/.test(line), 'the line is the chosen key\'s (jared@MacBook-Pro)');
  await d.primary(); await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:k-ed']||{}).state === 'failed'", 'the check fails', 9000);
  A.ok(/isn't on Home NAS yet/.test(await d.state(() => document.body.textContent)), 'it says the key is not on Home NAS yet');
  A.ok(!(await d.state(() => window.O55.S.env.devices[0].authorized.includes('k-ed'))), 'the check did not add the key itself');
  await d.primary(); A.eq(await d.screen(), 'nas-signin', 'back to the key, to add it');
  await d.primary(); await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:k-ed']||{}).state === 'done'", 'passes once it is there', 9000);
});
def('n10', 'fresh', 'A password typed before the window was closed does not count after it reopens', async (d, A) => {
  await toNasKey(d); await d.primary(); await d.type('user', 'jared'); await d.type('pw', 'correct horse');
  A.ok(!(await d.primaryInfo()).disabled, 'Add my key is ready with a password typed');
  await d.page.click('#pm-o55-onboarding [data-o55-do="close"]'); await d.settle(900);
  await d.state(() => window.O55.ui.open({})); await d.settle(1200);
  A.eq(await d.screen(), 'nas-signin', 'resumes on the sign-in');
  A.ok((await d.primaryInfo()).disabled, 'Add my key waits for the password again (the field is empty)');
});
def('x1', 'fresh', 'Run Onboarding Again starts over: a clean world, no finished operations carried over, no tour', async (d, A) => {
  await toNasKey(d); await d.primary(); await d.type('user', 'jared'); await d.type('pw', 'correct horse'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'key installed', 9000);
  await d.state(() => window.O55.store.set('tour', { v: 1, status: 'running', index: 4, done: ['open_chat'] }));
  await d.page.click('#pm-o55-onboarding [data-o55-do="close"]'); await d.settle(900);
  await d.page.click('#pm-home-more-btn'); await d.settle(400); await d.page.click('#pm-home-more-menu [data-pm-home-action="run-onboarding"]'); await d.settle(1500);
  A.eq(await d.screen(), 'welcome', 'starts at Welcome');
  A.eq(await d.state(() => window.O55.store.get('tour', null)), null, 'the saved tour is cleared');
  await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary();
  A.ok(!/connected to Home NAS before/.test(await d.state(() => document.body.textContent)), 'the device is new again in a clean world');
  await d.primary();
  A.eq(await d.state(() => (window.O55.S.sess.ops['keys:nas-home'] || {}).state), 'running', 'looking for keys runs again, step by step');
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys tested', 5000);
  A.ok(await d.state(() => !document.querySelector('.o55-card[data-arg="k-pm"]') && !!document.querySelector('.o55-card.o55-on[data-arg="new"]')), 'the key made in the last run is gone');
});
def('x2', 'fresh', 'Run Onboarding Again while a Project is being created waits for it', async (d, A) => {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Book club website'); await d.primary(); await d.primary();
  await readyPrimary(d); await d.primary(); A.eq(await d.screen(), 'creating', 'creating');
  await d.page.click('#pm-o55-onboarding [data-o55-do="close"]'); await d.settle(700);
  await d.state(() => window.PM7_ONBOARDING_CINEMATIC.replay()); await d.settle(1500);
  A.eq(await d.screen(), 'creating', 'the window shows the creation instead of starting over');
  A.ok(/still being created/.test(await d.state(() => document.body.textContent)), 'it says the Project is still being created');
  await until(d, "window.O55.S.sess.commit.state === 'done'", 'creation finishes', 25000);
  A.eq(await d.state(() => document.querySelectorAll('#projectMenu [data-project="p-book-club-website"]').length), 1, 'exactly one Project was made');
  await d.page.click('#pm-o55-onboarding [data-o55-do="close"]'); await d.settle(700);
  await d.state(() => window.PM7_ONBOARDING_CINEMATIC.replay()); await d.settle(1500);
  A.eq(await d.screen(), 'welcome', 'once it is made, Run Onboarding Again starts over');
});

/* ---------------------------------------------------------------------------------------------- backups */
async function toProtect(d, dest) {
  await d.openOnboarding(); await toName(d); await d.type('name', 'Book club website'); await d.primary();
  await d.act('backup'); await d.act('bdest', dest); await d.act('sheet-close'); await d.primary();
  await readyPrimary(d); await d.primary(); await until(d, "window.O55.S.sess.commit.state === 'done'", 'commit', 25000);
  await readyPrimary(d); await d.primary();
}
async function finishProtect(d, A) {
  for (const [step, what] of [['test', 'test'], ['kit', 'kit']]) { await readyPrimary(d); await d.primary(); await until(d, `(window.O55.S.sess.backup.done||[]).includes('${step}')`, what, 8000); }
  const word = await d.state(() => [...document.querySelectorAll('.o55-kitwords span')][3].lastChild.textContent.trim());
  await d.type('word', word); await d.primary(); await until(d, "(window.O55.S.sess.backup.done||[]).includes('kitTest')", 'kit checked', 8000);
  await readyPrimary(d); await d.primary(); await until(d, "window.O55.S.sess.backup.state === 'done'", 'backups on', 8000);
  A.ok(/Backups are on/.test(await d.state(() => document.body.textContent)), 'backups are on');
}
def('b1', 'fresh', 'Backup to Home NAS: Connect runs the SSH steps once, then the backup finishes with that key', async (d, A) => {
  await toProtect(d, 'nas');
  A.eq(await d.screen(), 'protect', 'Finish protecting your work');
  A.ok(/Connect to Home NAS/.test(await d.state(() => document.querySelector('.o55-steplist').textContent)), 'the first step connects to Home NAS (not a web sign-in)');
  await d.primary(); A.eq(await d.screen(), 'nas-identity', 'its identity first'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys', 5000); await d.primary();
  await d.type('user', 'jared'); await d.type('pw', 'correct horse'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'key added', 9000); await d.primary();
  A.eq(await d.screen(), 'protect', 'back to Finish protecting your work');
  await until(d, "(window.O55.S.sess.backup.done||[]).includes('signin')", 'connected with the key', 6000);
  A.ok(await d.state(() => window.O55.owners.log.some((e) => e.id === 'cmd.backup.destination.add' && e.ok)), 'the destination is added through the backup owner');
  A.ok(!(await d.state(() => window.O55.owners.log.some((e) => e.id === 'cmd.auth_profile.open_official_page'))), 'no web page is opened for the NAS');
  await finishProtect(d, A);
});
def('b2', 'fresh', 'Backup to S3 or B2: bucket and access keys, the secret never kept', async (d, A) => {
  await toProtect(d, 's3');
  A.ok(await d.state(() => ['acc-bucket', 'acc-keyId', 'acc-secret'].every((b) => !!document.querySelector(`[data-o55-bind="${b}"]`))), 'bucket, key ID and secret fields');
  A.ok((await d.primaryInfo()).disabled, 'Connect waits for all three');
  await d.type('acc-bucket', 's3://book-club-backups'); await d.type('acc-keyId', 'AKIAEXAMPLEKEY'); await d.type('acc-secret', 'not-a-real-secret');
  A.ok(!(await d.primaryInfo()).disabled, 'Connect is ready'); await d.primary();
  await until(d, "(window.O55.S.sess.backup.done||[]).includes('signin')", 'connected', 6000);
  A.ok(!(await d.state(() => JSON.stringify(window.O55.S.sess) + localStorage.getItem('pm.o55.onboarding.v1'))).includes('not-a-real-secret'), 'the secret is never stored');
  await finishProtect(d, A);
});
def('b3', 'fresh', 'Files on Home NAS: a backup to Home NAS is not offered, with the reason', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'existing'); await d.act('sub', 'device'); await d.primary();
  await until(d, "!!document.querySelector('.o55-card[data-arg=\"nas-home\"]')", 'discovered', 5000); await d.act('device', 'nas-home'); await d.primary(); await d.primary();
  await until(d, "(window.O55.S.sess.ops['keys:nas-home']||{}).state === 'done'", 'keys', 5000); await d.primary();
  await d.type('user', 'jared'); await d.type('pw', 'correct horse'); await d.primary();
  await until(d, "(window.O55.S.sess.ops['sshinstall:nas-home:new']||{}).state === 'done'", 'key added', 9000); await d.primary();
  await d.act('cd', '/volume1/projects'); await d.act('cd', '/volume1/projects/recipe-app'); await d.primary();
  if ((await d.screen()) === 'name') await d.primary();
  if ((await d.screen()) === 'like') await d.primary();
  A.eq(await d.screen(), 'safe', 'Keep your work safe'); await d.act('backup');
  const card = await d.state(() => { const c = document.querySelector('[data-o55-do="bdest"][data-arg="nas"]'); return c && { disabled: c.getAttribute('aria-disabled'), reason: c.getAttribute('data-disabled-reason') }; });
  A.ok(card && card.disabled === 'true' && /files are on Home NAS/.test(card.reason || ''), 'Home NAS is not offered, and says why');
});
def('b4', 'fresh', 'Restore from S3 or B2: access details, then the recovery phrase', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary(); await d.act('pick', 'restore'); await d.primary();
  A.eq(await d.screen(), 'r-source', 'backup source'); await d.act('source', 'cloud'); await d.act('cloud', 's3');
  A.ok(await d.state(() => !!document.querySelector('[data-o55-bind="acc-secret"]')), 'access fields, not a browser sign-in');
  A.ok((await d.primaryInfo()).disabled, 'Continue waits for them');
  await d.type('acc-bucket', 's3://book-club-backups'); await d.type('acc-keyId', 'AKIAEXAMPLEKEY'); await d.type('acc-secret', 'not-a-real-secret'); await d.primary();
  await d.untilScreen('r-unlock', 8000);
  A.ok(!(await d.state(() => JSON.stringify(window.O55.S.sess))).includes('not-a-real-secret'), 'the secret is never stored');
});

/* ---------------------------------------------------------------------------------------------- the look */
def('x3', 'fresh', 'The chosen look never changes on screen: through Creating, the finish and into the tour', async (d, A) => {
  await d.openOnboarding(); await d.primary();
  await d.act('pickFamily', 'friendly', { settle: 1400 }); await d.primary();
  /* every painted frame from here on records the look on screen */
  await d.state(() => { window.__looks = new Set(); const f = () => { window.__looks.add(document.documentElement.getAttribute('data-theme')); if (!window.__lookStop) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await d.primary(); await d.primary(); await d.type('name', 'Book club website'); await d.primary(); await d.primary();
  await readyPrimary(d); await d.primary(); await until(d, "window.O55.S.sess.commit.state === 'done'", 'commit', 25000);
  await readyPrimary(d); await d.primary(); await d.act('skip'); await readyPrimary(d); await d.primary();
  await d.primary({ settle: 3500 }); /* Take the Guided Tour */
  const seen = await d.state(() => { window.__lookStop = true; return [...window.__looks]; });
  A.eq(JSON.stringify(seen), JSON.stringify(['friendly-dark']), 'only the chosen look was ever painted');
  A.eq(await d.state(() => window.O55.tour.state().step), 'comfort_intro', 'the tour started');
});
def('x4', 'fresh', 'A look picked after going into Connect and back is the one kept at the end', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary();
  await d.act('pick', 'connect'); await d.primary(); await d.back(); await d.back();
  A.eq(await d.screen(), 'look', 'back on the look screen');
  await d.act('pickFamily', 'retro');
  A.eq(await d.state(() => [window.O55.S.sess.drafts.main.theme_family, window.O55.S.sess.drafts.connect.theme_family].join()), 'retro,retro', 'both journeys carry the look');
});

def('x5', 'fresh', 'The look can be changed at any point from beside the sound button', async (d, A) => {
  await d.openOnboarding(); await d.primary(); await d.primary(); await d.primary();
  A.eq(await d.screen(), 'begin', 'mid-flow');
  await d.page.click('#pm-o55-onboarding .o55-lookbtn'); await d.settle(400);
  A.ok(await d.state(() => document.querySelectorAll('#pm-o55-onboarding .o55-lookopt').length === 4), 'four looks offered');
  if (process.env.O55_SNAP) await d.snap(process.env.O55_SNAP);
  await d.page.click('#pm-o55-onboarding .o55-lookopt[data-arg="retro"]'); await d.settle(1400);
  A.eq(await d.state(() => document.documentElement.getAttribute('data-theme').split('-')[0]), 'retro', 'the look changed');
  A.eq(await d.state(() => window.O55.S.sess.drafts.main.theme_family), 'retro', 'and is the chosen look');
  A.eq(await d.screen(), 'begin', 'without leaving the screen');
  await d.page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await d.settle(300);
  A.ok(await d.state(() => !document.querySelector('#pm-o55-onboarding .o55-lookmenu') && window.O55.S.open), 'Escape closes the menu, not the window');
});

/* ---------------------------------------------------------------------------------------------- runner */
const report = [], drafts = [];
for (const sc of SC) {
  if (only && !only.includes(sc.id)) continue;
  if (snaps) mkdirSync(join(out, 'walk'), { recursive: true });
  const d = await open({ scenario: sc.scenario, theme, snapDir: snaps ? join(out, 'walk') : null, snapPrefix: sc.id + '-' });
  const asserts = [];
  const A = {
    ok(c, m) { asserts.push({ ok: !!c, m }); },
    eq(a, b, m) { asserts.push({ ok: a === b, m: m + (a === b ? '' : ` (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`) }); },
    capture(label, plan) { drafts.push({ label: sc.id + ': ' + label, plan }); }
  };
  let error = null;
  const t0 = Date.now();
  try { await sc.fn(d, A); } catch (e) { error = String(e.message || e).slice(0, 400); }
  try { await d.snap(join(out, sc.id + '.png')); } catch (_) {}
  const refused = await d.refusals().catch(() => []);
  const r = { id: sc.id, scenario: sc.scenario, title: sc.title, ms: Date.now() - t0, pass: !error && asserts.every((x) => x.ok) && !d.errors.length && !refused.length, error, asserts, errors: d.errors.slice(0, 10), refused, commands: await d.commands().catch(() => []), steps: d.log.length };
  report.push(r);
  console.log((r.pass ? 'PASS ' : 'FAIL ') + sc.id.padEnd(5) + sc.title + (error ? '  !! ' + error : '') + asserts.filter((x) => !x.ok).map((x) => '\n      x ' + x.m).join('') + (d.errors.length ? '\n      errors: ' + d.errors.slice(0, 3).join(' | ') : '') + (refused.length ? '\n      refused: ' + refused.map((x) => x.id + ':' + x.reason).join(', ') : ''));
  await d.close();
}
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1));
writeFileSync(join(out, 'drafts.json'), JSON.stringify({ drafts }, null, 1));
console.log(JSON.stringify({ scenarios: report.length, pass: report.filter((r) => r.pass).length, fail: report.filter((r) => !r.pass).map((r) => r.id) }));
