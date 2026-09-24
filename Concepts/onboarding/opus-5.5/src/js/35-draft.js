/* O55.draft — the canonical setup_plan (pm.product_onboarding.setup_plan.v2, all 63 fields). It is a planned-only,
   secret-free record of choices: nothing in it creates a Project, folder, history, online copy, sync or backup binding.
   set() applies the schema's 26 conditionals. Values only a person can supply (a folder, a backup, a network location,
   an Azure DevOps project, an account, the chosen online Project) are never invented: missing() names each one in plain
   words, and Review cannot be confirmed until the list is empty, so every reviewed draft validates (drivers check
   captured drafts with jsonschema). */
(function () {
  'use strict';
  const O55 = window.O55;
  const U = O55.util;

  const FIELDS = ['schema_id', 'planned_only', 'applied', 'journey', 'theme_family', 'theme_mode', 'project_mode', 'project_name',
    'project_source_ref', 'backup_source_ref', 'project_transport', 'backup_transport', 'local_location_mode', 'local_location',
    'local_history', 'history_backend', 'filesafe', 'online_mode', 'forge', 'forge_provider_variant', 'forge_instance_url',
    'forge_instance_profile', 'forge_account_action', 'forge_account_ref', 'repository_name', 'repository_description',
    'repository_visibility', 'repository_owner_scope', 'repository_ref', 'repository_container', 'repository_project',
    'repository_default_branch', 'repository_initialize_readme', 'repository_gitignore', 'repository_license', 'server_mode',
    'server_connection_mode', 'server_ref', 'server_trust_confirmed', 'storage_mode', 'storage_transport', 'storage_location',
    'client_mode', 'remote_mode', 'remote_more', 'include_vpn_networks', 'connection_pairing', 'tailscale_control',
    'tailscale_account_action', 'headscale_url', 'remote_endpoint', 'proxy_kind', 'proxy_hosting', 'proxy_hostname', 'proxy_tls',
    'source_more', 'review_confirmed', 'project_draft_ref', 'project_draft_revision', 'settings_transfer', 'preflight_result_refs',
    'source_access_authorization_refs', 'project_created'];

  const FORGE_URL = { github: 'https://github.com', gitlab: 'https://gitlab.com', azure_devops: 'https://dev.azure.com', bitbucket_cloud: 'https://bitbucket.org', cursor_origin: 'https://origin.cursor.com' };

  function create(journey, theme) {
    const th = theme || O55.theme();
    return {
      schema_id: 'pm.product_onboarding.setup_plan.v2', planned_only: true, applied: false,
      journey: journey || 'new_or_local', theme_family: th.family, theme_mode: th.mode,
      project_mode: journey === 'connect_existing' ? 'later' : 'new', project_name: '', project_source_ref: '', backup_source_ref: '',
      project_transport: 'local', backup_transport: 'local', local_location_mode: 'automatic', local_location: '',
      local_history: journey !== 'connect_existing', history_backend: 'git', filesafe: true,
      online_mode: 'none', forge: 'none', forge_provider_variant: null, forge_instance_url: '', forge_instance_profile: null,
      forge_account_action: null, forge_account_ref: '', repository_name: '', repository_description: '', repository_visibility: null,
      repository_owner_scope: 'personal', repository_ref: '', repository_container: '', repository_project: '', repository_default_branch: 'main',
      repository_initialize_readme: true, repository_gitignore: 'automatic', repository_license: 'none',
      server_mode: journey === 'connect_existing' ? 'existing_server' : 'this_device', server_connection_mode: 'discover', server_ref: '', server_trust_confirmed: false,
      storage_mode: 'this_device', storage_transport: 'mounted', storage_location: '', client_mode: 'this_device',
      remote_mode: journey === 'connect_existing' ? 'local_or_vpn' : 'none', remote_more: false, include_vpn_networks: false, connection_pairing: 'approval',
      tailscale_control: null, tailscale_account_action: null, headscale_url: '', remote_endpoint: '', proxy_kind: null, proxy_hosting: null,
      proxy_hostname: '', proxy_tls: null, source_more: false, review_confirmed: false,
      project_draft_ref: 'draft:o55-' + Math.random().toString(36).slice(2, 10), project_draft_revision: 1,
      settings_transfer: { mode: 'start_fresh', source_project_id: null, source_revision: null, draft_preview_ref: null, draft_preview_sha256: null, explicit_choice_setting_ids: [], settings_applied: false },
      preflight_result_refs: [], source_access_authorization_refs: [], project_created: false
    };
  }

  /* Canonical conditionals (#0-#25). Called after every change so the draft is always schema-valid. */
  function normalize(d) {
    if (d.journey === 'connect_existing') {
      d.project_mode = 'later'; d.local_history = false; d.online_mode = 'none'; d.server_mode = 'existing_server';
      if (!['local_or_vpn', 'tailscale', 'reverse_proxy', 'remote_link'].includes(d.remote_mode)) d.remote_mode = 'local_or_vpn';
      if (d.settings_transfer.mode !== 'start_fresh') d.settings_transfer = create().settings_transfer;
    }
    if (d.project_mode === 'later' && d.settings_transfer.mode !== 'start_fresh') d.settings_transfer = create().settings_transfer;
    if (d.online_mode === 'none') {
      Object.assign(d, { forge: 'none', forge_provider_variant: null, forge_instance_url: '', forge_instance_profile: null, forge_account_action: null, forge_account_ref: '', repository_ref: '', repository_visibility: null });
    } else {
      if (d.forge === 'none') d.forge = 'github';
      const variants = { github: ['hosted', 'self_managed'], gitlab: ['hosted', 'self_managed'], azure_devops: ['cloud', 'self_managed'], bitbucket_cloud: ['cloud'], bitbucket_data_center: ['data_center'], forgejo: ['forgejo_self_managed', 'forgejo_cloud'], gitea: ['gitea_self_managed', 'gitea_cloud'], cursor_origin: ['preview'] }[d.forge];
      if (!variants.includes(d.forge_provider_variant)) d.forge_provider_variant = variants[0];
      if (d.forge === 'cursor_origin') d.forge_instance_url = 'https://origin.cursor.com';
      if (!/^https:\/\/[^\s/?#]+/.test(d.forge_instance_url)) d.forge_instance_url = FORGE_URL[d.forge] || 'https://git.example.org';
      if (!d.forge_account_action) d.forge_account_action = 'sign_in_during_setup';
      if (!d.repository_name) d.repository_name = U.slug(d.project_name) || 'new-project';
      const vis = allowedVisibility(d);
      if (d.forge === 'azure_devops') d.repository_visibility = null;
      else if (d.forge === 'bitbucket_data_center') { if (d.repository_visibility && !vis.includes(d.repository_visibility)) d.repository_visibility = null; }
      else if (!vis.includes(d.repository_visibility)) d.repository_visibility = vis[0] || 'private';
      if ((d.forge === 'forgejo' || d.forge === 'gitea') && !d.forge_instance_profile) d.forge_instance_profile = instanceProfile(d);
      if (d.forge !== 'forgejo' && d.forge !== 'gitea') d.forge_instance_profile = null;
    }
    /* remote access (#16-#23) */
    const clearRemote = () => Object.assign(d, { tailscale_control: null, tailscale_account_action: null, headscale_url: '', proxy_kind: null, proxy_hosting: null, proxy_hostname: '', proxy_tls: null });
    if (d.remote_mode === 'none') { clearRemote(); d.include_vpn_networks = false; d.remote_endpoint = ''; }
    else if (d.remote_mode === 'local_or_vpn') { clearRemote(); }
    else if (d.remote_mode === 'tailscale') {
      Object.assign(d, { server_connection_mode: 'discover', include_vpn_networks: false, proxy_kind: null, proxy_hosting: null, proxy_hostname: '', proxy_tls: null });
      if (!d.tailscale_control) d.tailscale_control = 'hosted';
      d.tailscale_account_action = d.tailscale_control === 'hosted' ? 'check_existing_then_sign_in_once' : 'headscale_enrollment';
      if (d.tailscale_control === 'hosted') d.headscale_url = ''; else if (d.headscale_url && !/^https:\/\//.test(d.headscale_url)) d.headscale_url = 'https://' + d.headscale_url.replace(/^[a-z]+:\/\//i, '');
    } else if (d.remote_mode === 'reverse_proxy') {
      Object.assign(d, { include_vpn_networks: false, tailscale_control: null, tailscale_account_action: null, headscale_url: '', remote_endpoint: '' });
      if (d.proxy_hostname && !/^https:\/\//.test(d.proxy_hostname)) d.proxy_hostname = 'https://' + d.proxy_hostname.replace(/^[a-z]+:\/\//i, '');
      if (d.journey === 'connect_existing') Object.assign(d, { server_connection_mode: 'manual', proxy_kind: null, proxy_hosting: null, proxy_tls: null });
      else if (d.proxy_hosting === 'existing_proxy') { /* an address someone already runs: nothing to generate here */ }
      else { if (!d.proxy_kind) d.proxy_kind = 'caddy'; if (!d.proxy_hosting) d.proxy_hosting = 'generate_for_server'; if (!d.proxy_tls) d.proxy_tls = 'lets_encrypt'; }
    } else if (d.remote_mode === 'remote_link') {
      clearRemote(); Object.assign(d, { server_connection_mode: 'manual', include_vpn_networks: false });
      if (d.remote_endpoint && !/^[A-Za-z][A-Za-z0-9._:/#-]*$/.test(d.remote_endpoint)) d.remote_endpoint = '';
    }
    return d;
  }

  function allowedVisibility(d) {
    const f = O55.fixtures.forge(d.forge); if (!f) return ['private'];
    if (Array.isArray(f.visibility)) return f.visibility;
    return f.visibility[d.forge_provider_variant] || ['private', 'public'];
  }

  /* Hosted Forgejo/Gitea services ship a registered sign-in app (OAuth with PKCE); a self-managed server usually does
     not, so its default is an access token the person creates on their server (kept by the credential owner). */
  function instanceProfile(d) {
    const host = (d.forge_instance_url || 'https://git.example.org').replace(/^https:\/\//, '').replace(/\/.*$/, '');
    const cloud = /_cloud$/.test(d.forge_provider_variant || '');
    const auth = d.forge_auth_method === 'token' ? 'pat_ref' : d.forge_auth_method === 'oauth' || cloud ? 'oauth_pkce' : 'pat_ref';
    return {
      provider: d.forge, provider_variant: d.forge_provider_variant, instance_id: 'forge-instance:' + U.slug(host), web_base_url: 'https://' + host,
      api_root: 'https://' + host + '/api', api_base_path: '/api/v1', ssh_url: 'ssh://git@' + host + ':22', ssh_port: 22, private_ca_ref: null,
      known_host_proof_ref: 'known-host:' + U.slug(host), detected_product: d.forge, product_version_ref: null, api_schema_ref: null, api_state_ref: null,
      git_transport_state_ref: null, actions_state_ref: null, actions_capability_ref: null, auth_method: auth,
      oauth_registration_ref: auth === 'oauth_pkce' ? 'oauth-registration:' + U.slug(host) : null, credential_ref: null, automation_binding_ref: null, currentness_ref: null, probe_performed: false,
      redirect_credential_policy: 'strip_authorization_on_origin_change', restricted_network_target_policy: 'deny_localhost_and_metadata_unless_explicitly_approved'
    };
  }

  function set(d, patch) {
    Object.assign(d, patch);
    d.project_draft_revision = (d.project_draft_revision || 1) + 1;
    return normalize(d);
  }

  /* The canonical record only (non-canonical UI helpers such as forge_auth_method are dropped). */
  function exportPlan(d) { const out = {}; FIELDS.forEach((k) => { out[k] = d[k]; }); return JSON.parse(JSON.stringify(out)); }

  /* Blocking reasons in plain words (Review disables the commit button with the first one as its reason). */
  function missing(d) {
    const r = [];
    if (d.journey === 'connect_existing') {
      if (!d.server_ref) r.push({ field: 'server_ref', key: 'missing.server' });
      if (d.remote_mode === 'remote_link' && !d.remote_endpoint) r.push({ field: 'remote_endpoint', key: 'missing.remoteLink' });
      if (d.remote_mode === 'reverse_proxy' && !d.proxy_hostname) r.push({ field: 'proxy_hostname', key: 'missing.proxyAddress' });
      if (d.remote_mode === 'tailscale' && d.tailscale_control === 'headscale' && !d.headscale_url) r.push({ field: 'headscale_url', key: 'missing.headscale' });
      return r;
    }
    if (d.server_mode !== 'this_device' && !d.server_ref) r.push({ field: 'server_ref', key: 'missing.server' });
    if (d.project_mode === 'new' && !String(d.project_name || '').trim()) r.push({ field: 'project_name', key: 'missing.name' });
    if (d.project_mode === 'existing_local' && !d.project_source_ref) r.push({ field: 'project_source_ref', key: 'missing.folder' });
    if (d.project_mode === 'existing_online' && !d.repository_ref) r.push({ field: 'repository_ref', key: 'missing.repository' });
    if (d.project_mode === 'restore' && !d.backup_source_ref) r.push({ field: 'backup_source_ref', key: 'missing.backup' });
    if (d.storage_mode === 'network_location' && !d.storage_location) r.push({ field: 'storage_location', key: 'missing.storage' });
    if (d.online_mode !== 'none' && !d.forge_account_ref) r.push({ field: 'forge_account_ref', key: 'missing.signin' });
    if (d.online_mode !== 'none' && d.forge === 'azure_devops' && !d.repository_project) r.push({ field: 'repository_project', key: 'missing.azureProject' });
    if (d.online_mode === 'existing' && !d.repository_ref) r.push({ field: 'repository_ref', key: 'missing.repository' });
    if (d.remote_mode === 'remote_link' && !d.remote_endpoint) r.push({ field: 'remote_endpoint', key: 'missing.remoteLink' });
    if (d.remote_mode === 'reverse_proxy' && !d.proxy_hostname) r.push({ field: 'proxy_hostname', key: 'missing.proxyAddress' });
    if (d.remote_mode === 'tailscale' && d.tailscale_control === 'headscale' && !d.headscale_url) r.push({ field: 'headscale_url', key: 'missing.headscale' });
    return r;
  }

  O55.draft = { FIELDS, create, set, normalize, exportPlan, missing, allowedVisibility };
})();
