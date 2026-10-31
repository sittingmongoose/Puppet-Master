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

  /* the account's world the plan is read against (the concept's fixtures; none while the page boots) */
  const envOf = () => (O55.S && O55.S.env) || null;

  function create(journey, theme) {
    const th = theme || O55.theme();
    return {
      schema_id: 'pm.product_onboarding.setup_plan.v2', planned_only: true, applied: false,
      journey: journey || 'new_or_local', theme_family: th.chosen || th.family, theme_mode: th.mode,
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
      /* a hosted variant's own address; a server the person names is never filled in for them (FF-08: no example host) */
      if (!/^https:\/\/[^\s/?#]+/.test(d.forge_instance_url)) d.forge_instance_url = O55.fixtures.hostedUrl(d.forge, d.forge_provider_variant);
      if (!d.forge_account_action) d.forge_account_action = 'sign_in_during_setup';
      if (!d.repository_name) d.repository_name = U.slug(d.project_name) || 'new-project';
      const vis = allowedVisibility(d);
      /* a visibility the owner no longer allows (Internal after a switch to a personal account, FF-02) falls back to
         the most private one, never to a wider one */
      if (d.forge === 'azure_devops') d.repository_visibility = null;
      else if (!vis.includes(d.repository_visibility)) d.repository_visibility = vis[0] || 'private';
      /* a Forgejo or Gitea server's profile follows its address and the sign-in actually used (FF-12) */
      if ((d.forge === 'forgejo' || d.forge === 'gitea') && d.forge_instance_url) {
        const p = instanceProfile(d), was = d.forge_instance_profile;
        if (was && was.instance_id === p.instance_id && was.auth_method === p.auth_method) p.credential_ref = was.credential_ref;
        d.forge_instance_profile = p;
      } else d.forge_instance_profile = null;
    }
    /* remote access (#16-#23) */
    const clearRemote = () => Object.assign(d, { tailscale_control: null, tailscale_account_action: null, headscale_url: '', proxy_kind: null, proxy_hosting: null, proxy_hostname: '', proxy_tls: null });
    if (d.remote_mode === 'none') { clearRemote(); d.include_vpn_networks = false; d.remote_endpoint = ''; }
    /* (a Remote Link belongs to its own route: it left the draft for none, not for these two, so one typed before
       Back and a change of route stayed in the plan; QA2 review N1's sweep) */
    else if (d.remote_mode === 'local_or_vpn') { clearRemote(); d.remote_endpoint = ''; }
    else if (d.remote_mode === 'tailscale') {
      Object.assign(d, { server_connection_mode: 'discover', include_vpn_networks: false, proxy_kind: null, proxy_hosting: null, proxy_hostname: '', proxy_tls: null, remote_endpoint: '' });
      if (!d.tailscale_control) d.tailscale_control = 'hosted';
      d.tailscale_account_action = d.tailscale_control === 'hosted' ? 'check_existing_then_sign_in_once' : 'headscale_enrollment';
      /* (an address is kept as typed: O55.endpoint checks it, and the screen's Continue stores the address it will use;
         another scheme is never quietly rewritten into https, SCR-09) */
      if (d.tailscale_control === 'hosted') d.headscale_url = '';
    } else if (d.remote_mode === 'reverse_proxy') {
      Object.assign(d, { include_vpn_networks: false, tailscale_control: null, tailscale_account_action: null, headscale_url: '', remote_endpoint: '' });
      if (d.journey === 'connect_existing') Object.assign(d, { server_connection_mode: 'manual', proxy_kind: null, proxy_hosting: null, proxy_tls: null });
      else if (d.proxy_hosting === 'existing_proxy') { /* an address someone already runs: nothing to generate here */ }
      /* Puppet Master makes settings for Caddy (the default), NGINX and Traefik; Nginx Proxy Manager is used as a proxy
         the person already runs (Jared, D3 A, 2026-10-31) */
      else { if (!['caddy', 'nginx', 'traefik'].includes(d.proxy_kind)) d.proxy_kind = 'caddy'; if (!d.proxy_hosting) d.proxy_hosting = 'generate_for_server'; if (!d.proxy_tls) d.proxy_tls = 'lets_encrypt'; }
    } else if (d.remote_mode === 'remote_link') {
      clearRemote(); Object.assign(d, { server_connection_mode: 'manual', include_vpn_networks: false });
      /* (a short code the Server shows is kept too: it was cleared for not starting with a letter, SCR-05) */
      /* a new Server's link is made after the commit and shown then: nothing is typed for it here */
      if (d.server_mode === 'new_server') d.remote_endpoint = '';
    }
    return d;
  }

  /* what the service allows for the chosen owner and project (O55.forgeRules: one row per service) */
  function allowedVisibility(d) { return O55.forgeRules.visibility(envOf(), d); }

  /* The sign-in a server offers decides the profile's method: a hosted service with a sign-in app registered for Puppet
     Master (Codeberg, Gitea Cloud) signs in in the browser (OAuth with PKCE); another server, with none, by an access
     token the person makes there (kept by the credential owner). The method actually used is saved (forge_auth_method).
     A server installed under a path (https://example.org/git) keeps it; the API and SSH details are the usual ones until
     the Forge owner's probe after sign-in (probe_performed false). */
  function instanceProfile(d) {
    let host = '', path = '';
    try { const u = new URL(d.forge_instance_url); host = u.host.toLowerCase(); path = u.pathname.replace(/\/+$/, ''); } catch (_) { /* (address checked before) */ }
    const web = 'https://' + host + path, methods = O55.forgeRules.auth(d.forge, d.forge_provider_variant);
    const auth = d.forge_auth_method === 'token' ? 'pat_ref' : d.forge_auth_method === 'oauth' ? 'oauth_pkce' : methods[0] === 'browser' ? 'oauth_pkce' : 'pat_ref';
    return {
      provider: d.forge, provider_variant: d.forge_provider_variant, instance_id: 'forge-instance:' + U.slug(host + path), web_base_url: web,
      api_root: web + '/api', api_base_path: '/api/v1', ssh_url: 'ssh://git@' + host.replace(/:\d+$/, '') + ':22', ssh_port: 22, private_ca_ref: null,
      known_host_proof_ref: 'known-host:' + U.slug(host.replace(/:\d+$/, '')), detected_product: d.forge, product_version_ref: null, api_schema_ref: null, api_state_ref: null,
      git_transport_state_ref: null, actions_state_ref: null, actions_capability_ref: null, auth_method: auth,
      oauth_registration_ref: auth === 'oauth_pkce' ? 'oauth-registration:' + U.slug(host + path) : null, credential_ref: null, automation_binding_ref: null, currentness_ref: null, probe_performed: false,
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
      remoteMissing(d, r);
      return r;
    }
    if (d.server_mode !== 'this_device' && !d.server_ref) r.push({ field: 'server_ref', key: 'missing.server' });
    if (d.project_mode === 'new' && !String(d.project_name || '').trim()) r.push({ field: 'project_name', key: 'missing.name' });
    if (d.project_mode === 'existing_local' && !d.project_source_ref) r.push({ field: 'project_source_ref', key: 'missing.folder' });
    if (d.project_mode === 'existing_online' && !d.repository_ref) r.push({ field: 'repository_ref', key: 'missing.repository' });
    if (d.project_mode === 'restore' && !d.backup_source_ref) r.push({ field: 'backup_source_ref', key: 'missing.backup' });
    if (d.storage_mode === 'network_location' && !d.storage_location) r.push({ field: 'storage_location', key: 'missing.storage' });
    if (d.online_mode !== 'none' && !d.forge_account_ref) r.push({ field: 'forge_account_ref', key: 'missing.signin' });
    if (d.online_mode === 'existing' && !d.repository_ref) r.push({ field: 'repository_ref', key: 'missing.repository' });
    /* the service's own needs: its address, owner, project, a visibility valid there, a name and branch it accepts */
    O55.forgeRules.needs(envOf(), d).forEach((m) => { if (!r.some((x) => x.field === m.field)) r.push(m); });
    remoteMissing(d, r);
    return r;
  }
  /* an address for the way in: present, and one the endpoint check accepts (SCR-09); a new Server's Remote Link is
     made after the commit, so nothing is asked for it */
  function remoteMissing(d, r) {
    const E = O55.endpoint, bad = (res) => !!(res && !res.ok && !res.empty);
    if (d.remote_mode === 'remote_link' && d.server_mode !== 'new_server') {
      if (!d.remote_endpoint) r.push({ field: 'remote_endpoint', key: 'missing.remoteLink' });
      else if (E && bad(E.checkLink(d.remote_endpoint))) r.push({ field: 'remote_endpoint', key: 'endpoint.' + E.checkLink(d.remote_endpoint).error });
    }
    if (d.remote_mode === 'reverse_proxy') {
      if (!d.proxy_hostname) r.push({ field: 'proxy_hostname', key: 'missing.proxyAddress' });
      else if (E && bad(E.check(d.proxy_hostname, 'proxy'))) r.push({ field: 'proxy_hostname', key: 'endpoint.' + E.check(d.proxy_hostname, 'proxy').error });
    }
    if (d.remote_mode === 'tailscale' && d.tailscale_control === 'headscale') {
      if (!d.headscale_url) r.push({ field: 'headscale_url', key: 'missing.headscale' });
      else if (E && bad(E.check(d.headscale_url, 'headscale'))) r.push({ field: 'headscale_url', key: 'endpoint.' + E.check(d.headscale_url, 'headscale').error });
    }
  }

  O55.draft = { FIELDS, create, set, normalize, exportPlan, missing, allowedVisibility };
})();
