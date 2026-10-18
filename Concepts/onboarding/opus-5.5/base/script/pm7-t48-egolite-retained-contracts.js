
{
  "schema_id":"pm.pm7.egolite_retained_contract_projection.v1",
  "browser_concept_only":true,
  "production_runtime_state":"unavailable",
  "native_runtime_state":"unavailable",
  "benchmark_execution_state":"not_run",
  "requirements":[
    {"id":"HBU-005","label":"Pinned Browser API digest","detail":"Versioned hash and bounded help load only on explicit request","help_load_policy":"explicit_on_demand","authority_grant":false},
    {"id":"HBU-013","label":"Human step projection","detail":"One safe label and detail across Chat, Testing, Watch, ObservableWork, and timeline","authority_grant":false},
    {"id":"BRW-010","label":"Focus-independent continuation","detail":"PM background, other app, tab, or panel does not cancel or transfer control","focus_is_authority":false},
    {"id":"BRW-011","label":"Truthful Browser fidelity","detail":"foreground_equivalent and real_background requested/effective profiles expose timing and throttle evidence"},
    {"id":"SCM-005","label":"Included Source Control baseline","detail":"Git and Jujutsu are PM Tool Store baselines with exact Host and Environment evidence"},
    {"id":"SCM-019","label":"Workspace conflict plan","detail":"Files, migrations, ports, devices, and deployments resolve before admission"},
    {"id":"ORI-002","label":"Origin Preview visibility","detail":"Internal and Private are capability-gated; Public is unavailable until capability-proven","self_hosted":false},
    {"id":"ORI-020","label":"Origin typed fallback","detail":"Git content, compare, and push gaps use admitted Git data/transport or typed CLI. Hosting thread and reviewer mutations require hosting authority; 1 MiB and complete-commit cases never truncate"},
    {"id":"IRT-008","label":"External installation ownership","detail":"External and package-manager installs default to check-and-notify"},
    {"id":"IRT-009","label":"Shared installation work","detail":"Identical provisioning/update fingerprints coalesce once; conflicts remain separate"},
    {"id":"IRT-010","label":"Persistent Tool Store profiles","detail":"Tool Store and isolated profiles survive image and pod replacement without raw secrets"},
    {"id":"IRT-011","label":"Scoped credential attachment","detail":"AuthenticationProfile and CredentialAttachment are broker refs scoped to exact provider, Host, Environment, repository, operation, and expiry","raw_secret_material":false},
    {"id":"SEC-003","label":"Minimum Browser-state export","detail":"Cookies, storage, and auth headers are never wholesale exported; AuthBrowserSession is never exportable","protected_auth_exportable":false},
    {"id":"SEC-007","label":"Public ingress is PM API only","detail":"Internal control, broker, Browser-debug, PTY, plugin, MCP, and local-daemon sockets are never public"},
    {"id":"SEC-008","label":"Actual network-effect gate","detail":"Requests, redirects, WebSockets, forms, and downloads are checked at the actual effect; URL-source scanning is never authority"}
  ]
}
