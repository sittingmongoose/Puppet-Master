/* Data-level draft matrix: builds setup-plan drafts through O55.draft.set() for every journey, forge, visibility,
 * remote mode and settings-transfer combination the onboarding can produce, then writes them for
 * tools/schema_check.py validate. (UI-path drivers in scenarios.mjs capture the drafts that real clicks produce.)
 * node tools/draft_matrix.mjs <out.json> */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pageFile = resolve(here, '../../../TestOpus5.5PmConcept.html');
const out = resolve(process.argv[2] || '/tmp/o55/drafts.json');
const { page, close } = await launch({ width: 1200, height: 800 });
try {
  await page.goto(pathToFileURL(pageFile).href + '?o55=off');
  await sleep(1000);
  const drafts = await page.evaluate(() => {
    const D = window.O55.draft, list = [];
    const mk = (label, journey, patch) => { const d = D.create(journey); D.set(d, patch || {}); list.push({ label, plan: D.exportPlan(d) }); };
    mk('new local defaults', 'new_or_local', { project_name: 'Book club website' });
    mk('later project', 'new_or_local', { project_mode: 'later' });
    mk('connect existing', 'connect_existing', { server_ref: 'server:home-nas' });
    mk('connect tailscale hosted', 'connect_existing', { server_ref: 'server:home-nas', remote_mode: 'tailscale', remote_more: true, tailscale_control: 'hosted' });
    mk('connect tailscale headscale', 'connect_existing', { server_ref: 'server:home-nas', remote_mode: 'tailscale', remote_more: true, tailscale_control: 'headscale', headscale_url: 'https://hs.example.net' });
    mk('connect own web address', 'connect_existing', { server_ref: 'server:home-nas', remote_mode: 'reverse_proxy', remote_more: true, proxy_hostname: 'https://pm.example.net' });
    mk('connect remote link', 'connect_existing', { server_ref: 'server:home-nas', remote_mode: 'remote_link', remote_more: true, remote_endpoint: 'pm-remote-link:home-nas/7Q2K' });
    mk('connect vpn networks', 'connect_existing', { server_ref: 'server:home-nas', include_vpn_networks: true, connection_pairing: 'code' });
    for (const [forge, variants] of Object.entries({ github: ['hosted', 'self_managed'], gitlab: ['hosted', 'self_managed'], azure_devops: ['cloud', 'self_managed'], bitbucket_cloud: ['cloud'], bitbucket_data_center: ['data_center'], forgejo: ['forgejo_self_managed', 'forgejo_cloud'], gitea: ['gitea_self_managed', 'gitea_cloud'], cursor_origin: ['preview'] })) {
      for (const variant of variants) {
        const base = { project_name: 'Book club website', online_mode: 'new', forge, forge_provider_variant: variant, repository_name: 'book-club-website', forge_account_action: 'sign_in_during_setup', forge_account_ref: 'account:' + forge + ':jared' };
        if (variant === 'self_managed' || /self_managed|data_center/.test(variant)) base.forge_instance_url = 'https://git.example.org';
        if (forge === 'azure_devops') base.repository_project = 'Book club';
        for (const vis of ['private', 'public', 'internal', null]) {
          const d = window.O55.draft.create('new_or_local'); window.O55.draft.set(d, Object.assign({}, base, { repository_visibility: vis }));
          if (d.repository_visibility !== vis && vis !== null) continue; // not offered for this service: the UI never shows it
          list.push({ label: `online ${forge}/${variant} ${vis}`, plan: window.O55.draft.exportPlan(d) });
        }
      }
    }
    mk('forgejo token', 'new_or_local', { project_name: 'Book club website', online_mode: 'new', forge: 'forgejo', forge_provider_variant: 'forgejo_self_managed', forge_instance_url: 'https://git.example.org', forge_auth_method: 'token', forge_account_action: 'sign_in_during_setup', forge_account_ref: 'account:forgejo:jared' });
    mk('create account', 'new_or_local', { project_name: 'Book club website', online_mode: 'new', forge: 'github', forge_account_action: 'create_account_during_setup', forge_account_ref: 'account:github:new' });
    mk('existing folder', 'new_or_local', { project_mode: 'existing_local', project_name: 'Recipe App', project_source_ref: 'folder:recipe-app', source_more: true });
    mk('online project', 'new_or_local', { project_mode: 'existing_online', project_name: 'garden-planner', online_mode: 'existing', forge: 'github', repository_name: 'garden-planner', repository_ref: 'github:jared/garden-planner', forge_account_action: 'already_connected', forge_account_ref: 'account:github:jared', source_more: true, review_confirmed: true });
    mk('nas ssh', 'new_or_local', { project_mode: 'existing_local', project_name: 'Family Photos', project_transport: 'ssh', project_source_ref: 'ssh:home-nas/volume1/photos', source_more: true });
    mk('nas mounted', 'new_or_local', { project_mode: 'existing_local', project_name: 'Family Photos', project_transport: 'mounted', project_source_ref: 'mounted:/Volumes/photos', source_more: true });
    mk('restore', 'new_or_local', { project_mode: 'restore', project_name: 'Recipe App', backup_source_ref: 'backup:home-nas/recipe-app', backup_transport: 'ssh' });
    mk('new server tailscale', 'new_or_local', { project_name: 'Garden Planner', server_mode: 'new_server', server_ref: 'server:home-nas', storage_mode: 'with_server', remote_mode: 'tailscale', tailscale_control: 'hosted' });
    mk('new server own address', 'new_or_local', { project_name: 'Garden Planner', server_mode: 'new_server', server_ref: 'server:home-nas', storage_mode: 'with_server', remote_mode: 'reverse_proxy', proxy_hostname: 'https://pm.example.net' });
    mk('new server remote link', 'new_or_local', { project_name: 'Garden Planner', server_mode: 'new_server', server_ref: 'server:home-nas', storage_mode: 'with_server', remote_mode: 'remote_link', remote_endpoint: 'pm-remote-link:home-nas/7Q2K' });
    mk('existing server network storage', 'new_or_local', { project_name: 'Garden Planner', server_mode: 'existing_server', server_ref: 'server:home-nas', storage_mode: 'network_location', storage_transport: 'ssh', storage_location: 'ssh:home-nas/volume1/projects' });
    mk('copy settings', 'new_or_local', { project_name: 'Book club website', settings_transfer: { mode: 'copy_from_project', source_project_id: 'project:recipe-app', source_revision: 7, draft_preview_ref: 'preview:recipe-app-7', draft_preview_sha256: 'a'.repeat(64), explicit_choice_setting_ids: ['general.visual.theme'], settings_applied: false } });
    mk('jujutsu no filesafe', 'new_or_local', { project_name: 'Book club website', history_backend: 'jujutsu', filesafe: false, local_location_mode: 'custom', local_location: 'Documents/Clubs/Book club' });
    mk('reviewed', 'new_or_local', { project_name: 'Book club website', review_confirmed: true });
    return list;
  });
  writeFileSync(out, JSON.stringify({ drafts }, null, 1));
  console.log(JSON.stringify({ out, drafts: drafts.length, errors: page.errors }));
} finally { await close(); }
