// Jared 2026-11-01: source control keeps GitHub, GitHub Enterprise, GitLab, Azure DevOps, Bitbucket (Cloud and Data
// Center), Forgejo and Gitea on servers of their own. Checked against that list, so nothing else is named here.
import fs from 'node:fs';
import { onboardingApp, pagePath } from '../helpers/onboarding-fields.mjs';
const KEPT_ROWS = ['github', 'gitlab', 'azure_devops', 'bitbucket_cloud', 'bitbucket_data_center', 'forgejo', 'gitea'];
const KEPT_OTHERS = ['gitlab', 'azure_devops', 'bitbucket_cloud', 'forgejo', 'gitea', 'github_enterprise'];
const KEPT_SETTINGS = ['GitHub', 'GitHub Enterprise', 'GitLab.com', 'GitLab Self-Managed', 'Azure DevOps', 'Azure DevOps Server', 'Bitbucket Cloud', 'Bitbucket Data Center', 'Forgejo', 'Gitea', 'Git or SSH repository'];
/* a draft as a session saved before the removals holds it (Sol's R6 reproduction: a hosted Gitea with a token and an
   existing online copy, signed in, with its credential, authorization refs and Review) */
const OLD = {
  gitea: { forge: 'gitea', forge_provider_variant: 'gitea_cloud', forge_instance_url: 'https://platyr.gitea.test' },
  origin: { forge: 'cursor_origin', forge_provider_variant: 'preview', forge_instance_url: 'https://origin.cursor.com' },
  forgejo: { forge: 'forgejo', forge_provider_variant: 'forgejo_cloud', forge_instance_url: 'https://hosted.forgejo.test' } };
const retiredDraft = (base, o) => Object.assign(base, { project_mode: 'existing_online', online_mode: 'existing', project_name: 'Notes', repository_name: 'notes',
  forge_account_action: 'already_connected', forge_account_ref: 'account:old:jared', repository_ref: o.forge + ':jared/notes', repository_owner_scope: 'personal', repository_visibility: 'private',
  forge_instance_profile: { provider: o.forge, provider_variant: o.forge_provider_variant, instance_id: 'forge-instance:old', web_base_url: o.forge_instance_url, auth_method: 'pat_ref', credential_ref: 'credential:old:token' },
  source_access_authorization_refs: ['auth:old:jared'], review_confirmed: true, forge_auth_method: 'token' }, o);
const cleared = (d) => (!d.forge || d.forge === 'none') && !d.forge_instance_url && !d.forge_account_ref && !d.repository_ref && !d.forge_instance_profile
  && !(d.source_access_authorization_refs || []).length && d.review_confirmed === false && !['gitea_self_managed', 'forgejo_self_managed'].includes(d.forge_provider_variant);
export const tests = {
  async 'the onboarding: only the kept services; Gitea is its own server; the Other services list reads whole'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe(); await A.click('online', undefined, 'online-service'); await A.click('others');
    let s = await A.snap(); const others = s.buttons.filter((b) => b.action === 'pick' && b.arg !== 'github').map((b) => b.arg);
    await t.check('Other services lists exactly the kept ones', JSON.stringify(others) === JSON.stringify(KEPT_OTHERS), JSON.stringify(others));
    await t.check('no Preview tag left in the list', !/\bPreview\b/.test(s.text), '');
    const rows = await A.frame().evaluate(() => (O55.fixtures.FORGES || []).map((f) => f.id));
    const table = await A.frame().evaluate(() => ['github', 'gitlab', 'azure_devops', 'bitbucket_cloud', 'bitbucket_data_center', 'forgejo', 'gitea'].map((id) => [id, (O55.fixtures.forge(id) || {}).variants]));
    await t.check('the service table holds only the kept services', rows.length ? JSON.stringify(rows) === JSON.stringify(KEPT_ROWS) : true, JSON.stringify(rows));
    await t.check('Gitea and Forgejo have one kind each, their own server', JSON.stringify(table.find((x) => x[0] === 'gitea')[1]) === '["gitea_self_managed"]' && JSON.stringify(table.find((x) => x[0] === 'forgejo')[1]) === '["forgejo_self_managed"]', JSON.stringify(table));
    await t.shot('own-servers-others', 'Other services: GitLab, Azure DevOps, Bitbucket, Forgejo, Gitea, GitHub Enterprise');
    await A.click('pick', 'gitea'); s = await A.snap();
    await t.check('Gitea: no kind toggle, its server address at once', !s.buttons.some((b) => b.action === 'variant') && s.fields.some((f) => f.id === 'o55f-address') && /Server address/.test(s.text), JSON.stringify(s.buttons.filter((b) => b.action === 'variant').map((b) => b.text)));
    const tips = await A.frame().evaluate(() => ['pick:gitea.text', 'pick:gitea.expert', 'group:variant.text', 'group:variant.expert', 'field:address.text'].map((k) => O55.t('pip.tips.online-service.' + k)).join(' | ') + ' | ' + ['vis:internal.text', 'vis:internal.expert', 'group:owner.expert'].map((k) => O55.t('pip.tips.online-details.' + k)).join(' | '));
    await t.check('tips (both versions) name only kept services and own servers', /type its address/.test(tips) && !/Cloud at|rent as|team on|team members|Origin|dedicated instance/.test(tips), tips);
    await A.fill('o55f-address', 'https://gitea.platyr.test'); await A.click('next', undefined, 'online-signin'); s = await A.snap();
    await t.check('Gitea signs in with a token on that server', s.fields.some((f) => f.id === 'o55f-token') && /gitea\.platyr\.test/.test(s.text), s.text.slice(0, 300));
    await t.check('the plan holds Gitea on that server', s.draft.forge === 'gitea' && s.draft.forge_provider_variant === 'gitea_self_managed' && s.draft.forge_instance_url === 'https://gitea.platyr.test', JSON.stringify({ v: s.draft.forge_provider_variant, u: s.draft.forge_instance_url }));
    const old = await A.frame().evaluate(() => { const d = JSON.parse(JSON.stringify(O55.S.sess.drafts.main)); const before = { f: d.forge }; d.forge = 'retired_service'; d.forge_provider_variant = 'retired'; d.forge_account_ref = 'account:retired:jared'; O55.draft.set(d, {}); return { f: d.forge, v: d.forge_provider_variant, a: d.forge_account_ref, before }; });
    await t.check('a plan naming a service no longer offered names none until the person chooses one, nothing carried (R6)', old.f === 'none' && !old.v && !old.a, JSON.stringify(old));
    const gv = await A.frame().evaluate(() => { const d = JSON.parse(JSON.stringify(O55.S.sess.drafts.main)); d.forge = 'gitea'; d.forge_provider_variant = 'retired_kind'; d.forge_instance_url = 'https://gitea.platyr.test'; O55.draft.set(d, {}); return { v: d.forge_provider_variant, u: d.forge_instance_url }; });
    await t.check('a Gitea plan with a retired kind keeps no kind and no address (never relabelled as its own server: R6)', !gv.v && !gv.u, JSON.stringify(gv));
  },
  async 'Settings: Source Control lists only the kept services; Browser depends on nothing removed'(t) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const f = await t.app.open({ sandbox: t.app.sandboxed(true), settleMs: 2500 });
    await f.locator('#tab-settings').click(); await sleep(1500);
    await f.getByText('Source Control', { exact: true }).first().click(); await sleep(1200);
    const names = await f.evaluate(() => [...document.querySelectorAll('[data-action="pm51-select"]')].filter((e) => e.getClientRects().length).map((e) => e.textContent.trim()));
    const listed = KEPT_SETTINGS.filter((n) => names.some((x) => x.includes(n)));
    await t.check('Source Control lists only the kept services', names.length === KEPT_SETTINGS.length && listed.length === KEPT_SETTINGS.length, JSON.stringify(names));
    await t.shot('own-servers-settings', 'Settings › Source Control: only the kept services');
    await f.locator('[data-action="jump-workspace"]', { hasText: 'Browser & SCM' }).first().click(); await sleep(1200);
    const dep = await f.evaluate(() => { const sec = document.querySelector('[data-section-id="browser-depends"]'); return sec ? sec.innerText : ''; });
    await t.check('Browser › Depends on: Source Control and Named Plans only', /Source Control/.test(dep) && /Named Plans/.test(dep) && !/Origin/.test(dep), dep.slice(0, 300));
  },
  async 'R5: the shipped page offers no retired service anywhere (read from the built file)'(t) {
    const html = fs.readFileSync(pagePath(t), 'utf8');
    const PATS = { 'value=origin option': /<option value="?origin"?>/, 'Origin checks': /Origin checks/, 'Origin mirror': /Origin mirror/, 'Team codebase': /Team codebase/, gitea_cloud: /gitea_cloud/, forgejo_cloud: /forgejo_cloud/,
      'hosted Gitea/Forgejo wording': /hosted (Gitea|Forgejo)|(Gitea|Forgejo) Cloud/i, 'origin automation profile': /\borigin:\{name:/, 'origin contract service': /"service":"origin"/, 'origin provider id': /origin_connected_checks/, 'origin_-prefixed ids': /\borigin_(connected|unavailable|actions|checks|mirror|preview)\w*/, 'origin as a provider': /(provider|service)["']?\s*[:=]\s*["']origin["']/, cursor_origin: /cursor_origin|cursor-origin|Cursor Origin/ };
    const found = Object.entries(PATS).filter(([, rx]) => rx.test(html)).map(([k]) => k);
    await t.check('the built page names none of them', !found.length, found.join(', '));
    await t.check('the GitHub-binding-unavailable negative case is kept, independently named', /"github_binding_unavailable":\{"service":"github"/.test(html), '');
  },
  async 'R5: the Automation service list offers only admitted providers; a retired one falls back to GitHub'(t) {
    const A = onboardingApp(t); await A.boot();
    const r = await A.frame().evaluate(() => { const sel = document.getElementById('pm7AutomationService'); const opts = sel ? [...sel.options].map((o) => o.value) : null;
      const api = window.PM7_FORGE_BACKUP_POST_INTEGRATION; let after = null; if (api) { api.set_automation_service('origin'); const panel = document.getElementById('panel-git'); after = panel ? panel.dataset.automationService : null; api.set_automation_service('github'); }
      const post = [...document.querySelectorAll('.pm7-post-kv')].map((x) => x.textContent).join(' | ');
      return { opts, after, post }; });
    await t.check('options are the admitted providers and no automation', JSON.stringify(r.opts) === JSON.stringify(['github', 'gitlab', 'azure', 'bitbucket', 'forgejo', 'gitea', 'generic']), JSON.stringify(r.opts));
    await t.check('asking for the retired one lands on GitHub', r.after === 'github', String(r.after));
    await t.check('Push to names the Git remote only', /Push to\s*origin\/main/.test(r.post) && !/mirror/i.test(r.post), r.post.slice(0, 200));
  },
  async 'R6: a plan naming a retired service or kind gives all of it up (normalize, three services)'(t) {
    const A = onboardingApp(t); await A.boot();
    for (const [name, o] of Object.entries(OLD)) {
      const r = await A.frame().evaluate(([o, src]) => { const make = new Function('return ' + src)(); const d = make(O55.draft.create('new_or_local'), o); O55.draft.normalize(d);
        return { d: JSON.parse(JSON.stringify(d)), miss: O55.draft.missing(d).map((m) => m.key) }; }, [o, retiredDraft.toString()]);
      const d = r.d;
      await t.check(`${name}: service, address, account, Project, credential, authorizations and Review all given up`, cleared(d), JSON.stringify({ f: d.forge, v: d.forge_provider_variant, u: d.forge_instance_url, a: d.forge_account_ref, r: d.repository_ref, p: !!d.forge_instance_profile, z: d.source_access_authorization_refs, rc: d.review_confirmed }));
      await t.check(`${name}: the plan asks for the service again first`, r.miss[0] === 'missing.service', JSON.stringify(r.miss));
    }
  },
  async 'R6: resuming a session saved before the removals asks for the service, nothing preselected, no old address'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
    await A.frame().evaluate(([o, src]) => { const make = new Function('return ' + src)(); const saved = O55.store.get('onboarding', null);
      make(saved.drafts.main, o); saved.started = 'saved-' + Date.now(); saved.screen = 'online-details'; saved.status = 'closed';
      saved.online = { purpose: 'source', forge: 'gitea', variant: 'gitea_cloud', addresses: { 'gitea|gitea_cloud': o.forge_instance_url } };
      saved.signin = { service: 'gitea', kind: 'forge', state: 'done', account: 'jared', instance_key: 'gitea|gitea_cloud|https://platyr.gitea.test' };
      saved.forgeAccounts = Object.assign({}, saved.forgeAccounts, { 'gitea|gitea_cloud|https://platyr.gitea.test': 'jared' });
      saved.commit = { state: 'failed', code: 'network' }; O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); }, [OLD.gitea, retiredDraft.toString()]);
    await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1500);
    let s = await A.snap();
    const st = await A.frame().evaluate(() => ({ acc: O55.S.sess.forgeAccounts, si: O55.S.sess.signin, cm: O55.S.sess.commit }));
    await t.check('resume opens on choosing the service (not the old service\'s details)', s.screen === 'online-service', s.screen);
    await t.check('the draft gave everything up', cleared(s.draft), JSON.stringify({ f: s.draft.forge, v: s.draft.forge_provider_variant, u: s.draft.forge_instance_url, a: s.draft.forge_account_ref, r: s.draft.repository_ref }));
    await t.check('its sign-in, recorded account and old commit are gone', !st.si.service && !Object.keys(st.acc || {}).some((k) => /gitea_cloud/.test(k)) && st.cm.state === 'none', JSON.stringify(st));
    await t.check('nothing preselected; Continue says to choose the service', !s.buttons.some((b) => b.action === 'pick' && b.checked === 'true') && s.primary.disabled && /isn't offered any more/.test(s.primary.reason), JSON.stringify({ p: s.primary, picked: s.buttons.filter((b) => b.action === 'pick' && b.checked === 'true').map((b) => b.arg) }));
    await t.check('the screen says why', /isn't offered any more/.test(s.text), s.text.slice(0, 300));
    await t.shot('r6-resume', 'Resumed after the removals: choose the service again, nothing preselected');
    await A.click('pick', 'gitea'); s = await A.snap();
    await t.check('picking Gitea asks for its address afresh, never the old hosted one', (s.fields.find((f) => f.id === 'o55f-address') || {}).value === '', JSON.stringify(s.fields));
  },
  async 'R6: a choice made on the service screen but never committed is dropped on resume and refused at dispatch'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
    /* Sol's probe: the main draft is fresh (no service yet), the screen held a retired card when the window closed */
    await A.frame().evaluate(() => { const saved = O55.store.get('onboarding', null); saved.started = 'partial-' + Date.now(); saved.screen = 'online-service'; saved.status = 'closed';
      saved.online = { purpose: 'copy', forge: 'cursor_origin', variant: 'preview', addresses: { 'gitea|gitea_cloud': 'https://platyr.gitea.test' } };
      saved.signin = { service: 'cursor_origin', kind: 'forge', state: 'idle', instance_key: 'cursor_origin|preview|https://origin.cursor.com' };
      O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); });
    await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1500);
    let s = await A.snap(); const st = await A.frame().evaluate(() => ({ ol: O55.S.sess.online, si: O55.S.sess.signin }));
    await t.check('resume drops the uncommitted retired card, kind and address', st.ol.forge == null && st.ol.variant == null && !Object.keys(st.ol.addresses || {}).length, JSON.stringify(st.ol));
    await t.check('and the retired sign-in left in the session', !st.si.service, JSON.stringify(st.si));
    await t.check('no retired card is selected', !s.buttons.some((b) => b.action === 'pick' && b.checked === 'true' && !['github', 'github_enterprise', 'gitlab', 'azure_devops', 'bitbucket_cloud', 'forgejo', 'gitea'].includes(b.arg)), '');
    const disp = await A.frame().evaluate(() => { const r = O55.official.signIn(O55.S, { service: 'cursor_origin', kind: 'forge', name: 'x', then: 'online-details' }); return { r, screen: O55.S.sess.screen, si: O55.S.sess.signin.service || null }; });
    await t.check('dispatch refuses a sign-in for a service not offered', disp.r === false && disp.screen === 'online-service' && disp.si !== 'cursor_origin', JSON.stringify(disp));
    if (!(await A.has('pick', 'gitea'))) await A.click('others');
    await A.click('pick', 'gitea'); s = await A.snap();
    await t.check('Gitea shows no kind toggle and an empty address (the old hosted one is gone)', !s.buttons.some((b) => b.action === 'variant') && (s.fields.find((f) => f.id === 'o55f-address') || {}).value === '', JSON.stringify(s.fields));
    await A.click('pick', 'github'); await A.click('next', undefined, 'online-signin'); s = await A.snap();
    await t.check('Continue starts the sign-in for the service chosen now (GitHub), never the retired one', s.signin.service === 'github', JSON.stringify(s.signin.service));
  },
  async 'R6: after a removed pick is dropped, Continue waits for a new pick (no silent GitHub)'(t) {
    const A = onboardingApp(t); await A.boot(); await A.toSafe('Notes'); await A.click('online', undefined, 'online-service');
    await A.frame().locator('[data-o55-do="close"]').first().click(); await A.sleep(900);
    await A.frame().evaluate(() => { const saved = O55.store.get('onboarding', null); saved.started = 'pick-' + Date.now(); saved.screen = 'online-service'; saved.status = 'closed';
      saved.online = { purpose: 'copy', forge: 'cursor_origin', variant: null }; O55.store.set('onboarding', saved); if (O55.boot && O55.boot.chip) O55.boot.chip(); });
    await A.frame().locator('#o55-resume [data-o55-chip="resume"]').click(); await A.sleep(1500);
    let s = await A.snap();
    await t.check('nothing is chosen for the person and Continue waits, with the reason', !s.buttons.some((b) => b.action === 'pick' && b.checked === 'true') && s.primary.disabled && /isn't offered any more/.test(s.primary.reason), JSON.stringify({ p: s.primary, picked: s.buttons.filter((b) => b.action === 'pick' && b.checked === 'true').map((b) => b.arg) }));
    await A.frame().evaluate(() => { const d = O55.screens.defs['online-service']; d.do.next(O55.S); });
    s = await A.snap(); await t.check('pressing on anyway starts no sign-in', s.screen === 'online-service' && !(s.signin && s.signin.service), JSON.stringify({ screen: s.screen, si: s.signin && s.signin.service }));
    await A.click('pick', 'github'); s = await A.snap();
    await t.check('a new pick turns Continue on', !s.primary.disabled, JSON.stringify(s.primary));
  }
};
