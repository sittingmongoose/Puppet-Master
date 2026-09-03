"""Source-owned T46 operational projections and K3 host integration.

T46 keeps the winning K3 Settings geometry intact while replacing its
placeholder Doctor with an owner-routed operational projection, correcting the
Full Server Backup boundary, exposing packet-governed Browser/SCM/Origin/Named
Plan/performance consumers, and adapting the surrounding PM7 shell when a
physical host is too narrow to show both Settings and the global Chat panel.

Every operation remains an explicit browser-concept simulation unless a real
owner bridge is attached.  The transform does not claim native Slint runtime
or production command evidence.
"""

from __future__ import annotations

from pm7_transform_guards import assert_effect_delta, capture_effect_surfaces


TRANSFORM_MARKER = "PM7 T46: operational systems integration and K3 host adaptation"


EGOLITE_RETAINED_CONTRACT_DATA = r'''<script id="pm7-t48-egolite-retained-contracts" type="application/json">
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
    {"id":"ORI-020","label":"Origin typed fallback","detail":"Content, compare, push, thread, and reviewer gaps use Git data/transport or typed CLI; 1 MiB and complete-commit cases never truncate"},
    {"id":"IRT-008","label":"External installation ownership","detail":"External and package-manager installs default to check-and-notify"},
    {"id":"IRT-009","label":"Shared installation work","detail":"Identical provisioning/update fingerprints coalesce once; conflicts remain separate"},
    {"id":"IRT-010","label":"Persistent Tool Store profiles","detail":"Tool Store and isolated profiles survive image and pod replacement without raw secrets"},
    {"id":"IRT-011","label":"Scoped credential attachment","detail":"AuthenticationProfile and CredentialAttachment are broker refs scoped to exact provider, Host, Environment, repository, operation, and expiry","raw_secret_material":false},
    {"id":"SEC-003","label":"Minimum Browser-state export","detail":"Cookies, storage, and auth headers are never wholesale exported; AuthBrowserSession is never exportable","protected_auth_exportable":false},
    {"id":"SEC-007","label":"Public ingress is PM API only","detail":"Internal control, broker, Browser-debug, PTY, plugin, MCP, and local-daemon sockets are never public"},
    {"id":"SEC-008","label":"Actual network-effect gate","detail":"Requests, redirects, WebSockets, forms, and downloads are checked at the actual effect; URL-source scanning is never authority"}
  ]
}
</script>'''


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T46 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _replace_count(doc, old, new, expected, need, label):
    count = doc.count(old)
    need(count == expected, "T46 %s: expected %d anchors, found %d" % (label, expected, count))
    return doc.replace(old, new)


def _replace_band(doc, start, end, replacement, need, label):
    need(doc.count(start) == 1, "T46 %s: start anchor count %d" % (label, doc.count(start)))
    need(doc.count(end) == 1, "T46 %s: end anchor count %d" % (label, doc.count(end)))
    begin = doc.index(start)
    finish = doc.index(end, begin)
    need(finish > begin, "T46 %s: invalid anchor order" % label)
    return doc[:begin] + replacement + "\n\n" + doc[finish:]


def _replace_in_band(doc, start, end, old, new, expected, need, label):
    """Replace an exact census inside one authored render band only."""
    need(doc.count(start) == 1, "T46 %s: start anchor count %d" % (label, doc.count(start)))
    need(doc.count(end) == 1, "T46 %s: end anchor count %d" % (label, doc.count(end)))
    begin = doc.index(start)
    finish = doc.index(end, begin)
    need(finish > begin, "T46 %s: invalid anchor order" % label)
    band = doc[begin:finish]
    count = band.count(old)
    need(count == expected, "T46 %s: expected %d anchors, found %d" % (label, expected, count))
    return doc[:begin] + band.replace(old, new) + doc[finish:]


def _annotate_action_in_band(doc, start, end, action, attributes, expected, need, label):
    old = 'data-action="%s"' % action
    return _replace_in_band(
        doc,
        start,
        end,
        old,
        "%s %s" % (old, attributes),
        expected,
        need,
        label,
    )


SYSTEMS_CSS = r'''
<style id="pm7-t46-systems-css">
/* PM7 T46: operational systems integration and K3 host adaptation */
.doctor-scope-bar { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:10px; }
.doctor-scope { min-height:34px; padding:7px 11px; border:1px solid var(--border); border-radius:var(--radius-pill);
  color:var(--text-secondary); background:var(--surface); cursor:pointer; font:inherit; }
.doctor-scope.is-active { color:var(--surface); background:var(--accent-primary); border-color:var(--accent-primary); }
.doctor-summary-strip { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:10px; }
.doctor-item-list { display:grid; gap:8px; }
.doctor-item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px; align-items:center; padding:12px;
  border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); }
.doctor-item-main { min-width:0; display:grid; gap:6px; }
.doctor-item-title-row { display:flex; flex-wrap:wrap; align-items:center; gap:7px; }
.doctor-item-title { color:var(--text-primary); font-weight:760; }
.doctor-item-copy { color:var(--text-secondary); font-size:var(--fs-sm); line-height:1.45; }
.doctor-item-meta { display:flex; flex-wrap:wrap; gap:5px 12px; color:var(--text-muted); font-size:11px; }
.doctor-item-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }
.doctor-state { display:inline-flex; align-items:center; min-height:24px; padding:3px 7px; border-radius:var(--radius-pill);
  border:1px solid var(--border); font-size:11px; font-weight:760; }
.doctor-evidence-view { display:grid; gap:8px; margin-top:12px; }
.doctor-evidence-list { display:grid; gap:6px; margin:0; padding:0; list-style:none; }
.doctor-evidence-row { padding:8px 10px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface-alt); color:var(--text-secondary); font:11px/1.45 var(--mono-font); overflow-wrap:anywhere; }
.doctor-state[data-state="ready"] { color:var(--success,#2f8f5b); }
.doctor-state[data-state="limits"], .doctor-state[data-state="attention"], .doctor-state[data-state="waiting"] { color:var(--accent-warning); }
.doctor-state[data-state="blocked"], .doctor-state[data-state="unavailable"], .doctor-state[data-state="interrupted"] { color:var(--accent-error); }
.doctor-state[data-state="checking"] { color:var(--accent-primary); }
.doctor-state[data-state="external"] { color:var(--text-secondary); background:var(--surface-alt); }
.systems-contract-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.systems-contract-card { min-width:0; padding:13px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); }
.systems-contract-card h3 { margin:0 0 6px; color:var(--text-primary); font-size:var(--fs-lg); }
.systems-contract-card p { margin:0 0 10px; color:var(--text-secondary); line-height:1.45; }
.systems-contract-card .table-actions { justify-content:flex-start; }
.plugin-owner-banner { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px; align-items:center; margin-bottom:10px;
  padding:12px 13px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface-alt); }
.plugin-owner-banner-copy { min-width:0; display:grid; gap:4px; }
.plugin-owner-kicker { color:var(--accent-primary); font-size:10px; font-weight:820; letter-spacing:.08em; text-transform:uppercase; }
.plugin-owner-title { color:var(--text-primary); font-weight:780; }
.plugin-owner-note { color:var(--text-secondary); font-size:var(--fs-sm); line-height:1.4; }
.plugin-fact-stack { display:grid; gap:8px; }
.plugin-fact-card { min-width:0; padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); }
.plugin-fact-card .panel-title { margin-bottom:3px; }
.plugin-fact-card .panel-subtitle { margin-bottom:9px; }
.plugin-action-row { display:flex; flex-wrap:wrap; gap:7px; margin-top:10px; }
.pm7-server-gap-panel { margin-top:10px; }
.pm7-server-gap-consumer[data-consumer-kind="command"] { opacity:.78; cursor:help; }
.pm7-server-gap-consumer[data-consumer-kind="command"]:focus-visible { opacity:1; }
.plugin-command[aria-disabled="true"] { opacity:.72; cursor:help; }
.plugin-command[aria-disabled="true"]:focus-visible { opacity:1; }
.plugin-manifest-list { display:grid; gap:6px; }
.plugin-manifest-row { display:grid; grid-template-columns:minmax(92px,.7fr) minmax(0,1.3fr); gap:8px; padding:8px 9px;
  border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface-alt); }
.plugin-manifest-name { color:var(--text-primary); font:700 11px/1.35 var(--mono-font); }
.plugin-manifest-ref { min-width:0; color:var(--text-muted); font:10px/1.4 var(--mono-font); overflow-wrap:anywhere; }
.plugin-compact-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.plugin-evidence-bound { color:var(--text-muted); font:10px/1.45 var(--mono-font); overflow-wrap:anywhere; }
.pm7-settings-focus-host #chatPanel,
.pm7-settings-focus-host #chatResizer,
body.pm7-chat-global-owner.pm7-settings-focus-host #chatPanel.pm7-global-chat-panel,
body.pm7-chat-global-owner.pm7-settings-focus-host #chatResizer.pm7-global-chat-resizer:not(.hidden) { display:none!important; }
.pm7-settings-focus-host .app-shell,
.pm7-settings-focus-host .main-area { min-width:0!important; max-width:100%!important; }
.pm7-settings-focus-host .primary-content { min-width:0!important; width:auto!important; flex:1 1 auto!important; }
.pm7-settings-focus-host #panel-settings { min-width:0!important; width:100%!important; max-width:100%!important; overflow:hidden!important; }
.pm7-settings-focus-host #pm-settings-root { min-width:0!important; max-width:100%!important; }
html[data-theme^="retro"] .doctor-scope,
html[data-theme^="retro"] .doctor-item,
html[data-theme^="retro"] .doctor-state,
html[data-theme^="retro"] .systems-contract-card,
html[data-theme^="retro"] .plugin-owner-banner,
html[data-theme^="retro"] .plugin-fact-card,
html[data-theme^="retro"] .plugin-manifest-row { border-radius:0; }
@media (max-width:760px) {
  .doctor-summary-strip { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .doctor-item { grid-template-columns:minmax(0,1fr); }
  .doctor-item-actions { justify-content:flex-start; }
  .systems-contract-grid { grid-template-columns:minmax(0,1fr); }
  .plugin-owner-banner { grid-template-columns:minmax(0,1fr); }
  .plugin-compact-grid { grid-template-columns:minmax(0,1fr); }
}
/* T46 owns only the Settings host adaptation here. The shared title-bar
   density controller continues to choose project/search/page modes; these
   rules remove its two residual physical-width overflows without changing
   K3 document/index/detail/manager geometry. */
@media (max-width:1320px) {
  body.pm7-settings-focus-host .title-bar .notify-slot {
    width:min(var(--rs-stack-w),120px)!important; max-width:120px!important;
  }
}
@media (max-width:560px) {
  body.pm7-settings-focus-host .title-bar { padding-inline:6px!important; gap:6px!important; }
  body.pm7-settings-focus-host .title-bar .app-name,
  body.pm7-settings-focus-host .title-bar .notify-slot { display:none!important; }
  body.pm7-settings-focus-host .title-bar .page-tabs {
    min-width:0!important; flex:1 1 auto!important;
    margin-left:0!important; margin-right:0!important;
  }
  body.pm7-settings-focus-host #pageTabsMoreMenu:not(.is-open):not(.is-closing) { display:none!important; }
  body.pm7-settings-focus-host .title-bar .pm6-tb-search-wrap { padding-left:0!important; }
}
@media (max-width:420px) {
  .doctor-summary-strip { grid-template-columns:minmax(0,1fr); }
  .doctor-scope { flex:1 1 calc(50% - 7px); }
}
@media (prefers-reduced-motion:reduce) {
  .doctor-item, .doctor-scope, .systems-contract-card { animation:none!important; transition:none!important; }
}
</style>'''


SERVER_GAP_CONSUMERS = r'''  /* PM7 T46 server-gap consumer closure: authored browser-concept wiring only. */
  /* Retained Touch-closure identities remain in the authored extraction even
     where the same visible intent is now rebound to an exact server identity. */
  const PM7_SERVER_GAP_RETAINED_PROJECT_SYNC_LOCAL_ACTION_IDS=Object.freeze(['ui.settings.project_sync.client.inspect','ui.settings.project_sync.location.preview_add','ui.settings.project_sync.location.preview_edit','ui.settings.project_sync.project.preview_move']);
  const PM7_SERVER_GAP_PALETTE_REQUIRED_LOCAL_ACTION_IDS=Object.freeze(['ui.auth_profile.open_details','ui.execution_environment.open_details','ui.execution_environment.open_logs','ui.execution_host.open_details','ui.installation.open_details','ui.installation.open_logs','ui.project.open_details','ui.project.restore_archived','ui.project_template.open_details','ui.tool_package.open_provenance','ui.tool_package.review_license']);
  const PM7_SERVER_GAP_LOCAL_ACTION_ROWS=Object.freeze([
    ["ui.auth_profile.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,true,["authentication handoff surface"]],
    ["ui.auth_session.close_secure_browser","implement_only_in_protected_human_auth_surface; do_not_add_general_PM7_or_agent_control",true,true,true,["authentication handoff surface"]],
    ["ui.auth_session.copy_device_code","implement_only_in_protected_human_auth_surface; do_not_add_general_PM7_or_agent_control",true,true,true,["authentication handoff surface"]],
    ["ui.auth_session.open_details","implement_only_in_protected_human_auth_surface; do_not_add_general_PM7_or_agent_control",true,true,true,["authentication handoff surface"]],
    ["ui.client.open_details","rebind_existing_visible_control_to_exact_local_action",true,false,true,["pairing/trust surface","Server permanent web UI"]],
    ["ui.credential_attachment.open_consumers","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["Project copy/move readiness","connection managers"]],
    ["ui.credential_attachment.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["Project copy/move readiness","connection managers"]],
    ["ui.credential_source.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["Project copy/move readiness","connection managers"]],
    ["ui.doctor.copy_diagnostics","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,[]],
    ["ui.doctor.open","bind_existing_exact_doctor_control_and_handler_to_typed_request_result_contract",true,false,true,[]],
    ["ui.doctor.open_details","bind_existing_exact_doctor_control_and_handler_to_typed_request_result_contract",true,false,true,[]],
    ["ui.doctor.open_remediation","bind_existing_exact_doctor_control_and_handler_to_typed_request_result_contract",true,false,true,[]],
    ["ui.doctor.refresh_visible","bind_existing_exact_doctor_control_and_handler_to_typed_request_result_contract",true,false,true,[]],
    ["ui.doctor.run_check","bind_existing_exact_doctor_control_and_handler_to_typed_request_result_contract",true,false,true,[]],
    ["ui.execution_environment.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["ui.execution_environment.open_logs","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["ui.execution_host.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["ui.goal.handoff.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["ui.installation.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["ui.installation.open_logs","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["ui.onboarding.back","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.close","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.defer","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.finish","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.next","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.open_details","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.skip","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.onboarding.start","no_authored_identity_gap; retain owner-local typed boundary",false,true,false,[]],
    ["ui.project.move.open_details","rebind_existing_visible_control_to_exact_local_action",true,false,true,["Projects > Move Project","status bar"]],
    ["ui.project.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,false,["Projects page","K3 Project manager"]],
    ["ui.project.restore_archived","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,false,["Projects page","K3 Project manager"]],
    ["ui.project.source_location.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,true,["Projects hosting/source manager"]],
    ["ui.project_template.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,false,["Projects page","K3 Project manager"]],
    ["ui.tool_package.open_provenance","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["ui.tool_package.review_license","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["ui.update.app.open_details","rebind_existing_visible_control_to_exact_local_action",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["ui.update.app.open_logs","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["ui.update.app.open_release_notes","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["ui.update.content.open_details","add_exact_local_action_to_existing_owner_manager_when_that_consumer_is_in_scope",true,false,true,["content attention/status"]]
  ].map(row=>Object.freeze({action_id:row[0],actionable_disposition:row[1],required_routes:Object.freeze({central_catalog:'excluded_local_action',palette_or_api:PM7_SERVER_GAP_PALETTE_REQUIRED_LOCAL_ACTION_IDS.includes(row[0])?'required':'not_explicitly_required',headless_dispatch:'not_a_domain_command',settings:row[2],onboarding:row[3],doctor:row[4],owner_gui_consumers:Object.freeze(row[5].slice()),synthetic_one_control_per_command_required:false})})));
  const PM7_SERVER_GAP_COMMAND_MEMBERSHIPS=Object.freeze([
    ["adjudicated_new","cmd.auth_profile.rename","required",true,true,true,["authentication handoff surface"]],
    ["adjudicated_new","cmd.auth_profile.revoke","required",true,true,true,["authentication handoff surface"]],
    ["adjudicated_new","cmd.auth_profile.transfer.apply","required",true,true,true,["authentication handoff surface"]],
    ["adjudicated_new","cmd.auth_profile.transfer.preview","required",true,true,true,["authentication handoff surface"]],
    ["adjudicated_new","cmd.client.access.update","not_explicitly_required",true,false,true,["pairing/trust surface","Server permanent web UI"]],
    ["adjudicated_new","cmd.client.remove","not_explicitly_required",true,false,true,["pairing/trust surface","Server permanent web UI"]],
    ["adjudicated_new","cmd.client.rename","not_explicitly_required",true,false,true,["pairing/trust surface","Server permanent web UI"]],
    ["adjudicated_new","cmd.client.session.revoke","not_explicitly_required",true,false,true,["pairing/trust surface","Server permanent web UI"]],
    ["adjudicated_new","cmd.credential_attachment.revoke","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_attachment.revoke_active","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_attachment.test","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_attachment.transfer.apply","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_attachment.transfer.preview","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_source.add","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_source.remove","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.credential_source.test","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.doctor.export_report","not_explicitly_required",true,false,true,[]],
    ["adjudicated_new","cmd.execution_environment.attach","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.discover","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.provision","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.remove","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.repair","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.resource_policy.apply","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.resource_policy.preview","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.restart","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.rollback","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.select","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.start","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.stop","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.update","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_environment.verify","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.capabilities.refresh","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.disable","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.drain","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.enable","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.register","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.remove","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.set_default","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.execution_host.test","required",true,false,true,["Server/Execution manager","Add Project","Goal handoff"]],
    ["adjudicated_new","cmd.goal.checkpoint","not_explicitly_required",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["adjudicated_new","cmd.goal.continue_on_host","not_explicitly_required",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["adjudicated_new","cmd.goal.handoff.cancel","not_explicitly_required",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["adjudicated_new","cmd.goal.handoff.retry","not_explicitly_required",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["adjudicated_new","cmd.goal.pause","not_explicitly_required",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["adjudicated_new","cmd.goal.resume_here","not_explicitly_required",false,false,true,["Goal/Assistant status","Project activity","Goal handoff modal","status bar"]],
    ["adjudicated_new","cmd.installation.attach_external","required",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["adjudicated_new","cmd.installation.detach_external","required",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["adjudicated_new","cmd.installation.remove","required",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["adjudicated_new","cmd.project.duplicate_configuration","required",true,true,false,["Projects page","K3 Project manager"]],
    ["adjudicated_new","cmd.project.duplicate_with_history","required",true,true,false,["Projects page","K3 Project manager"]],
    ["adjudicated_new","cmd.project.execution_host.select","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.execution_policy.set","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.home_server.set","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.move.cancel","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.move.pause","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.move.preflight","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.move.resume","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.move.retry","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.move.rollback","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.move.start","not_explicitly_required",true,false,true,["Projects > Move Project","status bar"]],
    ["adjudicated_new","cmd.project.source_location.add","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.source_location.remove","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.source_location.set_primary","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.source_location.test","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project.source_location.update","not_explicitly_required",true,true,true,["Projects hosting/source manager"]],
    ["adjudicated_new","cmd.project_template.create_project","required",true,true,false,["Projects page","K3 Project manager"]],
    ["adjudicated_new","cmd.project_template.delete","required",true,true,false,["Projects page","K3 Project manager"]],
    ["adjudicated_new","cmd.project_template.rename","required",true,true,false,["Projects page","K3 Project manager"]],
    ["adjudicated_new","cmd.project_template.save","required",true,true,false,["Projects page","K3 Project manager"]],
    ["adjudicated_new","cmd.provider_binding.copy","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.provider_binding.resolve_on_destination","not_explicitly_required",true,false,true,["Project copy/move readiness","connection managers"]],
    ["adjudicated_new","cmd.source_control.checkpoint.create","required",true,false,true,["Source Control panel","Projects checkout/worktree flow"]],
    ["adjudicated_new","cmd.source_control.checkpoint.inspect","required",true,false,true,["Source Control panel","Projects checkout/worktree flow"]],
    ["adjudicated_new","cmd.source_control.checkpoint.restore","required",true,false,true,["Source Control panel","Projects checkout/worktree flow"]],
    ["adjudicated_new","cmd.tool_package.approve_license","required",true,true,true,["K3 Toolchain/Integrations managers"]],
    ["adjudicated_new","cmd.update.app.automatic.set_enabled","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.app.cancel_download","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.app.check","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.app.download","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.app.install_restart","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.app.remind_later","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.app.rollback","not_explicitly_required",true,false,true,["bottom Update Available item","Server permanent web UI"]],
    ["adjudicated_new","cmd.update.content.activate","not_explicitly_required",true,false,true,["content attention/status"]],
    ["adjudicated_new","cmd.update.content.check","not_explicitly_required",true,false,true,["content attention/status"]],
    ["adjudicated_new","cmd.update.content.download","not_explicitly_required",true,false,true,["content attention/status"]],
    ["adjudicated_new","cmd.update.content.rollback","not_explicitly_required",true,false,true,["content attention/status"]],
    ["egolite_retained","cmd.browser.program.inspect","required",false,false,false,["Browser Program inspector","Testing/Watch"]],
    ["egolite_retained","cmd.source_control.backend.detect","required",false,true,true,["Source Control"]],
    ["egolite_retained","cmd.source_control.backend.select","required",false,true,true,["Source Control"]],
    ["egolite_retained","cmd.source_control.workspace.create","required",false,true,false,["Source Control","Projects source manager"]],
    ["egolite_retained","cmd.source_control.workspace.switch","required",false,false,false,["Source Control","Project workspace switcher","Projects source manager"]],
    ["egolite_retained","cmd.forge.repository.create","required",false,true,false,["Forge repository manager","Projects source manager"]],
    ["existing_alias_target","cmd.auth_profile.open_official_page","not_explicitly_required",true,true,true,["authentication handoff surface"]],
    ["existing_alias_target","cmd.integration.connection.add","required",true,true,true,[]],
    ["existing_alias_target","cmd.integration.connection.open_details","required",true,true,true,[]],
    ["existing_alias_target","cmd.integration.connection.remove","required",true,true,true,[]],
    ["existing_alias_target","cmd.integration.connection.test","required",true,true,true,["Project copy/move readiness","connection managers"]],
    ["existing_alias_target","cmd.integration.connection.update","required",true,true,true,[]],
    ["existing_alias_target","cmd.remote_access.route.test","not_explicitly_required",true,false,true,["Claim & Bootstrap","Server web UI"]],
    ["existing_alias_target","cmd.source_control.repository.bind","required",true,false,true,["Projects checkout/worktree flow","Source Control panel"]],
    ["existing_alias_target","cmd.source_control.status.refresh","required",true,false,true,["Projects checkout/worktree flow","Source Control panel"]],
    ["existing_alias_target","cmd.source_control.workspace.create","required",false,true,false,["Source Control","Projects source manager"]],
    ["existing_alias_target","cmd.source_control.workspace.remove","required",true,false,true,["Projects checkout/worktree flow","Source Control panel"]]
  ].map((row,membershipIndex)=>Object.freeze({origin:row[0],command_id:row[1],membership_index:membershipIndex+1,required_routes:Object.freeze({central_catalog:'required',palette_or_api:row[2],headless_dispatch:'available_through_canonical_dispatch; no PM7 control required',settings:row[3],onboarding:row[4],doctor:row[5],owner_gui_consumers:Object.freeze(row[6].slice()),synthetic_one_control_per_command_required:false})})));
  const PM7_SERVER_GAP_VISIBLE_COMMAND_IDS=Object.freeze([
    'cmd.auth_profile.rename','cmd.doctor.export_report','cmd.execution_host.capabilities.refresh','cmd.execution_host.register','cmd.execution_host.test','cmd.goal.pause','cmd.project.duplicate_configuration','cmd.project.duplicate_with_history','cmd.project.move.preflight','cmd.project.move.start','cmd.project.source_location.add','cmd.project.source_location.update','cmd.source_control.workspace.create','cmd.source_control.workspace.switch','cmd.update.app.automatic.set_enabled','cmd.update.app.check','cmd.update.app.rollback'
  ]);
  const PM7_SERVER_GAP_EXACT_EXISTING_COMMAND_IDS=Object.freeze(['cmd.integration.connection.open_details','cmd.source_control.status.refresh']);
  const PM7_SERVER_GAP_PROTECTED_LOCAL_ACTION_IDS=Object.freeze(['ui.auth_session.close_secure_browser','ui.auth_session.copy_device_code','ui.auth_session.open_details']);
  const PM7_SERVER_GAP_EXTERNAL_SCHEMA_POINTER_IDS=Object.freeze(['ui.auth_session.close_secure_browser','ui.auth_session.copy_device_code','ui.auth_session.open_details','ui.credential_attachment.open_consumers','ui.credential_attachment.open_details','ui.credential_source.open_details','ui.execution_environment.open_details','ui.execution_environment.open_logs','ui.execution_host.open_details','ui.installation.open_details','ui.installation.open_logs','ui.project.source_location.open_details','ui.tool_package.open_provenance','ui.tool_package.review_license']);
  const PM7_SERVER_GAP_RETAINED_ONBOARDING_LOCAL_ACTION_IDS=Object.freeze(['ui.onboarding.back','ui.onboarding.close','ui.onboarding.defer','ui.onboarding.finish','ui.onboarding.next','ui.onboarding.open_details','ui.onboarding.skip','ui.onboarding.start']);
  const PM7_SERVER_GAP_VISIBLE_LOCAL_ACTION_IDS=Object.freeze(PM7_SERVER_GAP_LOCAL_ACTION_ROWS.map(row=>row.action_id).filter(id=>!PM7_SERVER_GAP_PROTECTED_LOCAL_ACTION_IDS.includes(id)&&!PM7_SERVER_GAP_RETAINED_ONBOARDING_LOCAL_ACTION_IDS.includes(id)));
  const PM7_SERVER_GAP_DIGESTS=Object.freeze({local_action_ids_sha256:'c312f11bf5fb43ffb1c2d165b04de4e67a0acf55fbad6a1bacafd0f5c008427c',command_memberships_sha256:'2bf2329159401fa36bd60dd35a6726318234ff3bd8a598efb8b707d6e2abf0fa',command_identity_union_sha256:'7b9c698e4579708898f4c770898fbf71e99107eda2831d285e878ad4c37bfc0f'});
  let pm7ServerGapInvocation=0,pm7ServerGapLastEmission=null;
  function pm7LocalContractStatus(id){return PM7_SERVER_GAP_EXTERNAL_SCHEMA_POINTER_IDS.includes(id)?'external_schema_pointer_verification_required':'canonical_static_contract_present';}
  function pm7ConsumerButton(kind,id,label,options={}){
    const command=kind==='command',identityAttr=command?`data-command-id="${escAttr(id)}"`:`data-ui-action-id="${escAttr(id)}"`,availability=command?'handler_unavailable':'concept_local_controller_available',disabledReason=command?'handler_unavailable':'none';
    return `<button type="button" class="btn small pm7-server-gap-consumer" data-action="pm7-typed-consumer" data-consumer-kind="${kind}" ${identityAttr} data-availability="${availability}" data-disabled-reason="${disabledReason}" data-production-handler-status="handler_unavailable" data-canonical-contract-status="${command?'canonical_static_contract_present':pm7LocalContractStatus(id)}" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" data-target-id="${escAttr(options.targetId||'current_fixture')}" ${command?'aria-disabled="true"':''} aria-label="${escAttr(label)}" data-pm-hover-label="${escAttr(label)}" data-pm-hover-detail="${escAttr(command?'Canonical command route; native handler unavailable.':'Typed owner-local browser-concept projection; native binding unavailable.')}">${escapeHtml(label)}</button>`;
  }
  function pm7TypedConsumerResult(el,kind,id,present=true){
    const command=kind==='command',focusId=el?.id||`${kind}:${id}`,targetId=ds(el,'targetId')||ds(el,'id')||ds(el,'name')||ds(el,'provider')||ds(el,'goal')||'current_fixture',invocationId=`pm7-server-gap:${++pm7ServerGapInvocation}:${id}`;
    const exactReturn=Object.freeze({domain:state.domain||null,workspace:state.workspace||null,focus_id:focusId,target_id:targetId,invocation_id:invocationId,currentness:'current_browser_fixture'});
    const canonicalContractStatus=command?'canonical_static_contract_present':pm7LocalContractStatus(id);
    const availability=command?'handler_unavailable':ds(el,'availability')||'concept_local_controller_available',disabledReason=command?'handler_unavailable':ds(el,'disabledReason')||(availability==='unavailable'?'owner_route_unavailable':'none');
    const request=Object.freeze({schema_id:'pm.pmconcept7.typed_consumer_request.v1',action_kind:kind,action_id:id,target_id:targetId,availability,disabled_reason:disabledReason,canonical_contract_status:canonicalContractStatus,exact_return:exactReturn,concept_simulation_only:true,native_binding:false});
    const result=Object.freeze({schema_id:'pm.pmconcept7.typed_consumer_result.v1',action_kind:kind,action_id:id,target_id:targetId,availability:request.availability,disabled_reason:request.disabled_reason,canonical_contract_status:canonicalContractStatus,handler_unavailable:true,outcome:command?'handler_unavailable':availability==='unavailable'?'unavailable':'concept_projection_opened',exact_return:exactReturn,concept_simulation_only:true,native_binding:false,event_record:'not_emitted',runtime_receipt:'not_issued',production_mutation_dispatched:false});
    pm7ServerGapLastEmission=Object.freeze({request,result});
    if(present&&command)infoDrawer('Handler unavailable','The exact canonical command is visible, but this browser concept has no native owner handler and dispatches no mutation, domain event, or runtime receipt.',[['Command',id],['Availability','handler_unavailable'],['Disabled reason','handler_unavailable'],['Exact return',`${exactReturn.domain}/${exactReturn.workspace} · ${exactReturn.focus_id}`],['Concept simulation only','true'],['Native binding','false'],['EventRecord','Not emitted'],['Runtime receipt','Not issued']]);
    else if(present)infoDrawer(labelForLocalAction(id),'Typed owner-local projection only. It preserves exact return/currentness evidence and performs no semantic owner mutation.',[['Local action',id],['Availability',availability],['Disabled reason',disabledReason],['Exact return',`${exactReturn.domain}/${exactReturn.workspace} · ${exactReturn.focus_id}`],['Concept simulation only','true'],['Native binding','false'],['EventRecord','Not emitted'],['Runtime receipt','Not issued']]);
    return pm7ServerGapLastEmission;
  }
  function labelForLocalAction(id){return id.split('.').slice(2).join(' ').replaceAll('_',' ').replace(/\b\w/g,match=>match.toUpperCase());}
  function pm7ConsumerPanel(title,controls){return `<section class="systems-contract-card pm7-server-gap-panel" data-server-gap-consumer-panel="${escAttr(title)}"><h3>${escapeHtml(title)}</h3><p>Exact typed routes only. Browser concept projection; native handlers and runtime receipts remain unavailable.</p><div class="plugin-action-row">${controls.join('')}</div></section>`;}
  function pm7IntegrationConsumerPanel(provider){const target=provider?.id||'selected-provider';return pm7ConsumerPanel('Integration owner-local evidence',[pm7ConsumerButton('local','ui.auth_profile.open_details','Profile details',{targetId:target}),pm7ConsumerButton('local','ui.credential_attachment.open_consumers','Credential consumers',{targetId:target}),pm7ConsumerButton('local','ui.credential_attachment.open_details','Attachment details',{targetId:target}),pm7ConsumerButton('local','ui.credential_source.open_details','Credential source',{targetId:target}),pm7ConsumerButton('local','ui.installation.open_details','Installation details',{targetId:target}),pm7ConsumerButton('local','ui.installation.open_logs','Installation logs',{targetId:target}),pm7ConsumerButton('local','ui.tool_package.open_provenance','Package provenance',{targetId:target}),pm7ConsumerButton('local','ui.tool_package.review_license','Review license',{targetId:target}),pm7ConsumerButton('command','cmd.auth_profile.rename','Rename profile',{targetId:target})]);}
  function pm7ExecutionConsumerPanel(){return pm7ConsumerPanel('Host and Environment owner-local evidence',[pm7ConsumerButton('local','ui.execution_host.open_details','Host details'),pm7ConsumerButton('local','ui.execution_environment.open_details','Environment details'),pm7ConsumerButton('local','ui.execution_environment.open_logs','Environment logs'),pm7ConsumerButton('command','cmd.execution_host.capabilities.refresh','Refresh capabilities')]);}
  function pm7ProjectConsumerPanel(){return pm7ConsumerPanel('Project owner-local evidence',[pm7ConsumerButton('local','ui.project.open_details','Project details'),pm7ConsumerButton('local','ui.project.restore_archived','Restore archived Project'),pm7ConsumerButton('local','ui.project.source_location.open_details','Source location details'),pm7ConsumerButton('local','ui.project_template.open_details','Project template details')]);}
  function pm7GoalConsumerPanel(){return pm7ConsumerPanel('Goal handoff evidence',[pm7ConsumerButton('local','ui.goal.handoff.open_details','Handoff details')]);}
  function pm7UpdateConsumerPanel(){return pm7ConsumerPanel('Update owner-local evidence',[pm7ConsumerButton('local','ui.update.app.open_logs','Update logs'),pm7ConsumerButton('local','ui.update.app.open_release_notes','Release notes'),pm7ConsumerButton('local','ui.update.content.open_details','Content update details')]);}
  const PM7_SERVER_GAP_CONSUMER_API=Object.freeze({schema_id:'pm.pmconcept7.server_gap_consumer_closure.v1',local_actions:PM7_SERVER_GAP_LOCAL_ACTION_ROWS,command_memberships:PM7_SERVER_GAP_COMMAND_MEMBERSHIPS,retained_project_sync_local_action_ids:PM7_SERVER_GAP_RETAINED_PROJECT_SYNC_LOCAL_ACTION_IDS,palette_required_local_action_ids:PM7_SERVER_GAP_PALETTE_REQUIRED_LOCAL_ACTION_IDS,visible_local_action_ids:PM7_SERVER_GAP_VISIBLE_LOCAL_ACTION_IDS,protected_local_action_ids:PM7_SERVER_GAP_PROTECTED_LOCAL_ACTION_IDS,retained_onboarding_local_action_ids:PM7_SERVER_GAP_RETAINED_ONBOARDING_LOCAL_ACTION_IDS,external_schema_pointer_ids:PM7_SERVER_GAP_EXTERNAL_SCHEMA_POINTER_IDS,visible_command_ids:PM7_SERVER_GAP_VISIBLE_COMMAND_IDS,exact_existing_command_ids:PM7_SERVER_GAP_EXACT_EXISTING_COMMAND_IDS,digests:PM7_SERVER_GAP_DIGESTS,concept_simulation_only:true,native_binding:false,production_handler_status:'handler_unavailable',headless_disposition:'catalog_and_headless_dispatch_require_no_synthetic_PM7_control',dispatch_from_control:function(el){const kind=ds(el,'consumerKind'),id=kind==='command'?ds(el,'commandId'):ds(el,'uiActionId');return pm7TypedConsumerResult(el,kind,id);},project_typed_result:function(kind,id){return pm7TypedConsumerResult(null,kind,id,false);},last_emission:function(){return pm7ServerGapLastEmission;}});
  Object.defineProperty(window,'PM7_SERVER_GAP_CONSUMERS',{value:PM7_SERVER_GAP_CONSUMER_API,writable:false,configurable:false,enumerable:true});
'''


DOCTOR_RENDER = SERVER_GAP_CONSUMERS + r'''  const PM7_DOCTOR_STATUS_CATALOG=['Ready','Ready with limits','Needs attention','Waiting for you','Checking','Managed externally','Unavailable','Blocked','Interrupted','Recovered','Stale','Unknown'];
  const PM7_DOCTOR_SCOPES=[['all','Overview'],['server','Server & routes'],['project','Project & source'],['integrations','Integrations'],['runtime','Runtime & storage']];
  const PM7_DOCTOR_DOMAIN_IDS=Object.freeze(['browser','containers','host_environment','integrations','plans','plugins','project','provider_generation','resource_pressure','scm_worktrees','security','server','source_location','storage_migration','testing_capture','transport','usage_freshness','vault']);
  const PM7_DOCTOR_WORK_ID='doctor-work:cached-owner-projections:v1';
  const PM7_DOCTOR_CLOSURE_MODEL=Object.freeze({
    schemaId:'pm.doctor.browser_concept_closure_model.v1',browserProjectionOnly:true,productionRuntimeState:'unavailable',nativeRuntimeState:'unavailable',productionOwnerFeedAttached:false,
    scenarios:[
      {id:'doc005-unused',requirements:['DOC-005'],title:'Unused optional capabilities remain healthy while Off',kind:'optional_capability_unused',overallStatus:'healthy',overallImpact:'none',coverage:['optional_off_unused_healthy'],rows:[
        {id:'optional-wsl',label:'WSL',requested:'Off unless selected work requires WSL',effective:'Off and unused',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'not_applicable',status:'healthy',impact:'none'},
        {id:'optional-plugin',label:'Optional plugin',requested:'Off unless selected work requires the plugin',effective:'Off and unused',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'not_applicable',status:'healthy',impact:'none'},
        {id:'optional-gpu',label:'GPU acceleration',requested:'Off unless selected work requires GPU acceleration',effective:'Off and unused',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'not_applicable',status:'healthy',impact:'none'}],redactionRows:[]},
      {id:'doc005-required',requirements:['DOC-005'],title:'Selected work makes an Off capability required-missing',kind:'optional_capability_required',overallStatus:'blocked',overallImpact:'blocks_selected_action',coverage:['selected_task_requirement_blocks'],rows:[
        {id:'required-gpu',label:'GPU required by selected task',requested:'Required by selected task',effective:'Off and unavailable',configured:false,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required_missing',support:'unavailable',status:'blocked',impact:'blocks_selected_action'}],redactionRows:[]},
      {id:'doc008-return',requirements:['DOC-008'],title:'Owner remediation returns to the exact Doctor finding',kind:'remediation_return',overallStatus:'needs_attention',overallImpact:'blocks_selected_action',coverage:['exact_return_route','exact_focus_restore','currentness_fence','fresh_owner_result_required'],rows:[
        {id:'source-control-return',label:'Source Control owner route',requested:'Exact owner row and exact return',effective:'Browser-concept owner command route with currentness fence',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'needs_attention',impact:'blocks_selected_action'}],returnContext:{checkId:'doctor.source-control.readiness',findingId:'finding:source-control:fixture',findingRevision:3,targetId:'host-environment:current',remediationMode:'owner_command_route',ownerActionId:'cmd.source_control.status.refresh',typedOwnerRouteId:null,ownerRoute:['source','browser-scm'],returnRoute:['system','doctor'],returnScope:'project',returnFocusId:'doctor-remediation-source-control',expectedOwnerGeneration:14,expectedCacheGeneration:27,idempotencyKey:'doctor-remediation:source-control:3:14:27',ownerResultRequired:true,ownerResultRefRequired:true,normalizedStatuses:['healthy','needs_attention','blocked'],freshOwnerResultRequired:true,restoreOnlyOnCurrentnessMatch:true},redactionRows:[]},
      {id:'doc013-sqlite',requirements:['DOC-013'],title:'SQLite detection is blocked and never available',kind:'storage_backend',overallStatus:'blocked',overallImpact:'blocks_project_work',coverage:['sqlite_detected_blocked','sqlite_never_available'],rows:[
        {id:'sqlite-detected',label:'SQLite detected',requested:'Canonical seglog redb and Tantivy storage',effective:'SQLite detected and unsupported',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required_missing',support:'unsupported',status:'blocked',impact:'blocks_project_work'}],redactionRows:[]},
      {id:'doc020-server',requirements:['DOC-020'],title:'Server discovery and trust remain separate current projections',kind:'server_discovery',overallStatus:'blocked',overallImpact:'blocks_selected_action',coverage:['server_discovery','identity_dedupe','claim_pairing','trusted_client','endpoint_currentness'],rows:[
        {id:'server-discovery',label:'Nearby discovery',requested:'Minimal current observation',effective:'Current observation without trust',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_on',support:'available',status:'healthy',impact:'none'},
        {id:'server-dedupe',label:'Verified identity dedupe',requested:'One cryptographic Server identity',effective:'Joined only after identity and certificate continuity',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'},
        {id:'server-pairing',label:'Claim and pairing',requested:'Explicit identity-confirmed approval',effective:'Waiting for trusted Client approval',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'needs_attention',impact:'blocks_selected_action'},
        {id:'trusted-client',label:'Trusted Client',requested:'Current least-privilege trust',effective:'Trusted and not revoked',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'},
        {id:'endpoint-currentness',label:'Endpoint currentness',requested:'Current verified endpoint',effective:'Stale observation retained without false green',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'degraded',status:'stale',impact:'blocks_selected_action'}],redactionRows:[]},
      {id:'doc021-remote',requirements:['DOC-021'],title:'Remote Access routes retain connector, identity, and currentness boundaries',kind:'remote_access_coverage',overallStatus:'needs_attention',overallImpact:'blocks_selected_action',coverage:['tailscale_connector','connector_build','connector_protocol','connector_process','connector_binding','hosted_authorization','headscale','private_endpoint','funnel','product_protocol','route_dedupe','backup_classification','nginx','traefik','remote_link_direct','remote_link_relay','remote_link_e2e','remote_link_pairing','manual_endpoint','route_failover','route_resumption'],currentnessSource:'September 1 connector contract · browser fixture only',rows:[
        {id:'tailscale-connector',label:'Tailscale · Built into Puppet Master',requested:'Signed connector, compatible build and IPC, one active Server binding',effective:'Specified; no native owner result is attached to this browser concept',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'degraded',status:'needs_attention',impact:'blocks_selected_action'},
        {id:'tailscale-private',label:'Automatic private endpoint',requested:'Private web, API, live updates, streams, upload, and download with Puppet Master authentication',effective:'Awaiting a current connector and product-protocol test receipt',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'degraded',status:'needs_attention',impact:'blocks_selected_action'},
        {id:'tailscale-hosted-auth',label:'Hosted Tailscale authorization',requested:'Durable Server-owned operation with protected active-Client handoff',effective:'No reusable authorization URL or host Tailscale session is present in the fixture',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'available',status:'healthy',impact:'none'},
        {id:'headscale-private',label:'Headscale private endpoint',requested:'Private access through a user-supplied Headscale service',effective:'Supported independently from public Funnel',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'available',status:'healthy',impact:'none'},
        {id:'tailscale-funnel',label:'Hosted Tailscale Funnel',requested:'Off unless explicit public ingress is approved',effective:'Off and unused; private access is preserved',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'available',status:'healthy',impact:'none'},
        {id:'headscale-funnel',label:'Headscale Funnel',requested:'Unavailable by design',effective:'Funnel unavailable by design; this does not degrade Headscale private access',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'unsupported',status:'healthy',impact:'none'},
        {id:'external-host-tailscale',label:'User-managed Tailscale app',requested:'External endpoint only; never adopted or controlled',effective:'Separate provenance and dedupe under verified Server identity',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'available',status:'healthy',impact:'none'},
        {id:'connector-backup-class',label:'Connector identity backup boundary',requested:'Always excluded from Project operations and excluded from portable Full Server backup by default',effective:'Secure Server state reference only; no node or authorization material rendered',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'},
        {id:'nginx',label:'NGINX reverse proxy',requested:'Dedicated HTTPS and WSS hostname',effective:'Configured with explicit trusted proxy ranges',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_on',support:'available',status:'healthy',impact:'none'},
        {id:'traefik',label:'Traefik reverse proxy',requested:'Off unless selected deployment uses Traefik',effective:'Off and unused',configured:false,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_off',support:'not_applicable',status:'healthy',impact:'none'},
        {id:'remote-link-direct',label:'Remote Link direct',requested:'Direct E2E route',effective:'Degraded; relay failover selected',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'optional_on',support:'degraded',status:'needs_attention',impact:'degraded_optional'},
        {id:'remote-link-relay',label:'Remote Link relay',requested:'Relay fallback with E2E application encryption',effective:'Active relay fallback',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'},
        {id:'remote-link-e2e',label:'Remote Link E2E and pairing',requested:'Paired E2E application channel',effective:'Identity and pairing current',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'},
        {id:'manual-endpoint',label:'Manual HTTPS and WSS endpoint',requested:'Verified manual endpoint',effective:'Configured and current',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_on',support:'available',status:'healthy',impact:'none'},
        {id:'route-continuity',label:'Route failover and resumption',requested:'Preserve Server command cursor and operation identity',effective:'Direct-to-relay fixture preserves continuity',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'}],redactionRows:[]},
      {id:'doc022-independent',requirements:['DOC-022'],title:'Unused optional route cannot degrade overall Server health',kind:'route_health_independence',overallStatus:'healthy',overallImpact:'none',coverage:['route_health_independent','unused_optional_route_non_degrading'],rows:[
        {id:'selected-route',label:'Selected primary private route',requested:'Healthy selected route',effective:'Healthy and in use',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none'},
        {id:'optional-unused-route',label:'Broken unused optional route',requested:'Configured fallback not selected by current task',effective:'Unavailable but unused',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'optional_on',support:'unavailable',status:'needs_attention',impact:'none'}],redactionRows:[]},
      {id:'doc023-security',requirements:['DOC-023'],title:'Healthy transport cannot mask security-critical findings',kind:'security_masking',overallStatus:'blocked',overallImpact:'security_critical',coverage:['identity_mismatch_security','public_unclaimed_security','unsafe_public_surface_security','untrusted_proxy_headers_security'],rows:[
        {id:'healthy-private-route',label:'Healthy private route',requested:'Healthy private route',effective:'Healthy',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'available',status:'healthy',impact:'none',securityCritical:false},
        {id:'identity-mismatch',label:'Server identity mismatch',requested:'Verified matching Server identity',effective:'Identity mismatch',configured:true,selectedTaskRequired:true,usedBySelectedTask:true,applicability:'required',support:'unavailable',status:'blocked',impact:'security_critical',securityCritical:true},
        {id:'public-unclaimed',label:'Public unclaimed setup exposure',requested:'Unclaimed setup local and private',effective:'Public unclaimed surface detected',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'required',support:'unavailable',status:'blocked',impact:'security_critical',securityCritical:true},
        {id:'unsafe-public',label:'Unsafe public product surface',requested:'Authenticated metadata-minimal public surface',effective:'Unsafe public surface detected',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'required',support:'unavailable',status:'blocked',impact:'security_critical',securityCritical:true},
        {id:'untrusted-proxy',label:'Untrusted proxy headers',requested:'Headers only from trusted proxy ranges',effective:'Untrusted proxy headers detected',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'required',support:'unavailable',status:'blocked',impact:'security_critical',securityCritical:true}],redactionRows:[]},
      {id:'doc024-redaction',requirements:['DOC-024'],title:'Remote diagnostics expose redacted classes only',kind:'diagnostic_redaction',overallStatus:'healthy',overallImpact:'none',coverage:['auth_url_redaction','auth_code_redaction','pairing_credential_redaction','recovery_credential_redaction','pre_auth_credential_redaction','relay_credential_redaction','private_key_redaction','access_key_redaction','sensitive_project_path_redaction'],rows:[
        {id:'remote-diagnostics',label:'Remote diagnostic projection',requested:'Bounded diagnostic without reusable secrets or sensitive Project paths',effective:'All sensitive classes redacted or withheld',configured:true,selectedTaskRequired:false,usedBySelectedTask:false,applicability:'required',support:'available',status:'healthy',impact:'none'}],redactionRows:[
        {secretClass:'auth_url',label:'Authentication URL',outputState:'withheld',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'auth_code',label:'Authentication code',outputState:'redacted',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'pairing_credential',label:'Pairing credential',outputState:'redacted',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'recovery_credential',label:'Recovery credential',outputState:'redacted',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'pre_auth_credential',label:'Pre-auth credential',outputState:'withheld',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'relay_credential',label:'Relay credential',outputState:'redacted',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'private_key',label:'Private key',outputState:'withheld',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'access_key',label:'Access key',outputState:'withheld',displayValue:'[REDACTED]',sourceValuePersisted:false},
        {secretClass:'sensitive_project_path',label:'Sensitive Project path',outputState:'redacted',displayValue:'[REDACTED]',sourceValuePersisted:false}]}]
  });
  Object.defineProperty(window,'PM7_DOCTOR_STATUS_CATALOG',{value:Object.freeze(PM7_DOCTOR_STATUS_CATALOG.slice()),writable:false,configurable:false,enumerable:true});
  Object.defineProperty(window,'PM7_DOCTOR_DOMAIN_IDS',{value:PM7_DOCTOR_DOMAIN_IDS,writable:false,configurable:false,enumerable:true});
  Object.defineProperty(window,'PM7_DOCTOR_CLOSURE_MODEL',{value:PM7_DOCTOR_CLOSURE_MODEL,writable:false,configurable:false,enumerable:true});
  const PM7_DOCTOR_FIXTURES=[
    {id:'server-trust',scope:'server',domainIds:['server','security'],title:'Server identity and trust',status:'blocked',label:'Blocked',severity:'critical',reason:'A current security fixture blocks identity mismatch even while another route is healthy.',owner:'Server System',target:'server:example-home',freshness:'2 minutes ago',confidence:'Browser fixture only',requested:'Verified identity, pairing, trust, current endpoint',effective:'Mixed model rows; security finding dominates',capability:'Discovery, identity dedupe, claim/pairing, trusted Client, endpoint currentness',route:['system','servers'],command:'cmd.server.open_details',remediationMode:'owner_command_route',checkId:'doctor.server.identity_trust',findingId:'finding:server-trust:fixture',findingRevision:4,ownerGeneration:41,cacheGeneration:52,lastKnownResultRef:'owner-result:server-trust:fixture',scenarioIds:['doc020-server','doc023-security']},
    {id:'remote-route',scope:'server',domainIds:['transport'],title:'Tailscale, Headscale, and remote routes',status:'attention',label:'Needs attention',severity:'warning',reason:'The signed connector build, IPC, Server binding, private endpoint, and product-protocol tests need a current Remote Access owner result. Headscale private access remains supported, and unavailable Funnel does not block it.',owner:'Remote Access System',target:'route-set:example-home',freshness:'Browser fixture only',confidence:'No native connector result',requested:'Current safe remote access',effective:'Specified connector and independent route projections; runtime result unavailable',capability:'Built-in Tailscale connector, Headscale private access, hosted Funnel, proxies, Remote Link, manual routes, failover, dedupe, and redaction',route:['system','servers'],command:'cmd.remote_access.route.open_details',connectorCheckCommand:'cmd.remote_access.tailscale.connector.check',remediationMode:'owner_command_route',checkId:'doctor.remote_access.routes',findingId:'finding:remote-route:fixture',findingRevision:6,ownerGeneration:61,cacheGeneration:71,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'connector_owner_result_unavailable',scenarioIds:['doc021-remote','doc022-independent','doc023-security','doc024-redaction']},
    {id:'backup-recovery',scope:'server',domainIds:['server','security'],title:'Full Server recovery',status:'attention',label:'Needs attention',severity:'warning',reason:'The seeded receipt is concept data and has no current verification or isolated restore proof.',owner:'Backup/Restore System',target:'server:example-home',freshness:'Stale',confidence:'No owner evidence',requested:'Verified recovery point',effective:'Fixture only',capability:'Verify, quarantine, test restore, selective restore',route:['system','backup'],command:'cmd.backup.open_details',remediationMode:'owner_command_route',checkId:'doctor.backup.recovery_point',findingId:'finding:backup-recovery:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'backup-receipt:fixture-seeded',recoveryDivergenceReason:'last_known_recovery_point_is_not_current_readiness'},
    {id:'project-authority',scope:'project',domainIds:['project','vault','source_location'],title:'Project and Vault currentness',status:'unknown',label:'Unknown',severity:'warning',reason:'No production Project Sync and Backbone owner feed is attached; the cached browser fixture cannot establish Project or Vault currentness.',owner:'Project Sync and Backbone',target:'project-sync:current',freshness:'Unknown',confidence:'No owner projection',requested:'Current Project and Vault content authority',effective:'Fixture only; owner projection unavailable',capability:'Sync, move, copy, reconnect, conflict recovery',route:['projects','project-sync'],typedOwnerRouteId:'projects/project-sync',command:null,remediationMode:'typed_owner_route',checkId:'doctor.project_sync.currentness',findingId:'finding:project-authority:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'owner_currentness_unavailable'},
    {id:'source-control',scope:'project',domainIds:['scm_worktrees'],title:'Git, Jujutsu, and forges',status:'waiting',label:'Waiting for you',severity:'warning',reason:'A hosted forge needs a human authentication decision.',owner:'Source Control System',target:'host-environment:current',freshness:'Just now',confidence:'Human action required',requested:'Ready for sync',effective:'Local operations only',capability:'Git, Jujutsu, GitHub, GitLab, Azure DevOps, Bitbucket, Forgejo, Gitea',route:['source','browser-scm'],command:'cmd.source_control.status.refresh',remediationMode:'owner_command_route',checkId:'doctor.source-control.readiness',findingId:'finding:source-control:fixture',findingRevision:3,ownerGeneration:14,cacheGeneration:27,lastKnownResultRef:'owner-result:source-control:fixture',scenarioIds:['doc008-return']},
    {id:'auth-browser',scope:'integrations',domainIds:['browser','security'],title:'Protected sign-in browser',status:'external',label:'Managed externally',severity:'info',reason:'AuthBrowserSession is human-only and unavailable to agents, adapters, capture, and replay.',owner:'Section 15 Browser Program',target:'auth-browser:human-only',freshness:'Policy current',confidence:'Hard security invariant',requested:'Human sign-in',effective:'Protected lane',capability:'Non-recordable, non-inspectable, non-exportable',route:['source','browser-scm'],command:null,remediationMode:'unavailable',disabledReason:'human_only_policy_has_no_doctor_remediation',checkId:'doctor.auth_browser.policy',findingId:'finding:auth-browser:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'policy-result:auth-browser:protected'},
    {id:'provider-route',scope:'integrations',domainIds:['integrations','provider_generation'],title:'Provider route',status:'attention',label:'Needs attention',severity:'warning',reason:'One example provider lacks an owner-projected entitlement.',owner:'Shared Integration Runtime',target:'provider:example',freshness:'3 minutes ago',confidence:'Fixture projection',requested:'Invokable model',effective:'Authentication only',capability:'Install, authenticate, entitlement, catalog, invocation stay separate',route:['ai','providers'],command:'cmd.integration.connection.open_details',remediationMode:'owner_command_route',checkId:'doctor.integration.provider_route',findingId:'finding:provider-route:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'provider-result:example:authentication-only'},
    {id:'provider-cli',scope:'integrations',domainIds:['host_environment','integrations'],title:'Provider CLI installation',status:'attention',label:'Needs attention',severity:'warning',reason:'The selected provider CLI is missing and no current installation/readiness owner result is attached.',owner:'Shared Integration Runtime',target:'provider-route:cli-example',projectId:'project:settings-lab',providerId:'provider:cli-example',providerRouteId:'provider-route:cli-example',settingsManagerId:'providers',settingsDetailId:'provider-cli:cli-example',freshness:'Unknown',confidence:'No owner projection',requested:'Explicit consent-bound provider CLI setup on the exact Host and Environment',effective:'Missing; no installation dispatched',capability:'Installation, authentication, entitlement, catalog, and invocation stay separate',route:['ai','providers'],command:'cmd.settings.open',remediationMode:'owner_command_route',checkId:'doctor.integration.provider_cli_installation',findingId:'finding:provider-cli:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'provider_cli_owner_result_unavailable'},
    {id:'optional-capabilities',scope:'runtime',domainIds:['host_environment','containers','testing_capture'],title:'Optional capabilities',status:'ready',label:'Ready',severity:'info',reason:'WSL, plugin, and GPU examples are Off and healthy because selected work does not use them.',owner:'Named capability owners',target:'selected-task:current',freshness:'Current fixture',confidence:'Browser fixture only',requested:'Only selected-task dependencies required',effective:'Unused optional capabilities Off',capability:'A required-missing contrast is available in Details',route:['system','doctor'],command:null,remediationMode:'unavailable',disabledReason:'no_owner_command_or_typed_owner_route',checkId:'doctor.runtime.optional_capabilities',findingId:'finding:optional-capabilities:fixture',findingRevision:1,ownerGeneration:9,cacheGeneration:14,lastKnownResultRef:'owner-result:optional-capabilities:fixture',scenarioIds:['doc005-unused','doc005-required']},
    {id:'storage-integrity',scope:'runtime',domainIds:['storage_migration'],title:'Storage backend integrity',status:'blocked',label:'Blocked',severity:'blocked',reason:'SQLite detection is blocked and is never presented as an available backend choice.',owner:'Storage and Retention',target:'project-store:current',freshness:'Fresh fixture',confidence:'Browser fixture only',requested:'seglog, redb, and Tantivy owners',effective:'SQLite detected; unsupported',capability:'Safe points, quarantine, migration receipts',route:['system','doctor'],command:null,remediationMode:'unavailable',disabledReason:'storage_owner_route_not_mounted',checkId:'doctor.storage.integrity',findingId:'finding:storage-integrity:fixture',findingRevision:2,ownerGeneration:22,cacheGeneration:31,lastKnownResultRef:'owner-result:storage-integrity:fixture',scenarioIds:['doc013-sqlite']},
    {id:'performance',scope:'runtime',domainIds:['resource_pressure','usage_freshness'],title:'Runtime responsiveness',status:'unknown',label:'Unknown',severity:'info',reason:'No browser pacing run has been requested; browser evidence cannot certify native or old-hardware performance.',owner:'Shared Integration Runtime',target:'surface:pmconcept7',freshness:'Not run',confidence:'Not run',requested:'Same-frame acknowledgement',effective:'Not run',capability:'Admission, ObservableWork, bounded lists, cancellation',route:['system','doctor'],command:null,remediationMode:'unavailable',disabledReason:'performance_check_not_run_no_remediation',checkId:'doctor.runtime.responsiveness',findingId:'finding:performance:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'check_not_run_no_current_readiness'},
    {id:'named-plans',scope:'runtime',domainIds:['plans'],title:'Named Plans',status:'unknown',label:'Unknown',severity:'warning',reason:'No production Named Plan owner feed is attached to this concept.',owner:'Named Plan System',target:'named-plan:concept-current',projectId:'project:settings-lab',namedPlanId:'named-plan:concept-current',freshness:'Unknown',confidence:'Browser fixture identity only',requested:'Current plan bindings',effective:'Unavailable',capability:'Create, bind, inspect, archive',route:['source','browser-scm'],ownerRouteTab:'plans',command:'cmd.named_plan.open',remediationMode:'owner_command_route',checkId:'doctor.named_plan.bindings',findingId:'finding:named-plans:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'named_plan_owner_currentness_unavailable'},
    {id:'plugin-manifest-resolution',scope:'integrations',domainIds:['plugins'],title:'Plugin manifest resolution',status:'unknown',label:'Unknown',severity:'warning',reason:'Portable plugin.json, PM-native pm-plugin.json, migration precedence, and normalized package-tree identity require a current Plugins System scan.',owner:'Plugins System',target:'plugin-package:selected',freshness:'Unknown',confidence:'Browser fixture only',requested:'One deterministic manifest resolution',effective:'Owner projection unavailable',capability:'Portable, PM-native, legacy migration, normalized tree',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'overview',command:'cmd.agent_plugin.scan',remediationMode:'owner_command_route',checkId:'doctor.plugin.manifest_resolution',findingId:'finding:plugin-manifest-resolution:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'plugin_owner_projection_unavailable'},
    {id:'plugin-conformance',scope:'integrations',domainIds:['plugins'],title:'Plugin target conformance',status:'unknown',label:'Unknown',severity:'warning',reason:'Portable, PM target, OpenAI/Codex, Claude, and round-trip conformance have no current owner result.',owner:'Plugins System',target:'plugin-adapters:selected',freshness:'Unknown',confidence:'Browser fixture only',requested:'Current portable and target conformance',effective:'No owner validation result',capability:'Portable, PM target, agent adapters, round trips',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'overview',command:'cmd.agent_plugin.validate',remediationMode:'owner_command_route',checkId:'doctor.plugin.conformance',findingId:'finding:plugin-conformance:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'plugin_owner_validation_unavailable'},
    {id:'plugin-containment',scope:'integrations',domainIds:['plugins'],title:'Plugin containment',status:'unknown',label:'Unknown',severity:'warning',reason:'The concept cannot establish process containment, capability isolation, or effective runtime authority.',owner:'Plugins System',target:'plugin-runtime:selected',freshness:'Unknown',confidence:'No native runtime',requested:'Verified containment and isolation',effective:'Native handler unavailable',capability:'Process boundary, capability isolation, failure domain',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'access',command:'cmd.agent_plugin.validate',remediationMode:'owner_command_route',checkId:'doctor.plugin.containment',findingId:'finding:plugin-containment:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'native_handler_unavailable'},
    {id:'plugin-supply-chain',scope:'integrations',domainIds:['plugins'],title:'Plugin supply-chain posture',status:'attention',label:'Needs attention',severity:'warning',reason:'Signature, publisher, license, SBOM, provenance, known-bad, compatibility, and rollback facts remain owner-unverified.',owner:'Plugins System',target:'plugin-package:selected',freshness:'Stale',confidence:'Browser fixture only',requested:'Current attributable supply-chain evidence',effective:'Bounded fixture references only',capability:'Signature, trust, publisher, license, SBOM, provenance, known-bad, compatibility, rollback',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'evidence',command:'cmd.agent_plugin.open_details',remediationMode:'owner_command_route',checkId:'doctor.plugin.supply_chain',findingId:'finding:plugin-supply-chain:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'plugin-result:supply-chain:fixture-stale',recoveryDivergenceReason:'last_known_supply_chain_result_is_stale'},
    {id:'plugin-permission-review',scope:'integrations',domainIds:['plugins'],title:'Plugin permission update review',status:'waiting',label:'Waiting for you',severity:'warning',reason:'Permission, topology, publisher, trust, or authority expansion requires an explicit complete-diff review and reapproval.',owner:'Plugins System',target:'plugin-update:selected',freshness:'Current fixture',confidence:'Human approval required',requested:'Complete update diff and explicit reapproval',effective:'No owner review dispatched',capability:'Package, permission, topology, authority, adapter, and rollback diff',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'updates',command:'cmd.agent_plugin.review_changes',remediationMode:'owner_command_route',checkId:'doctor.plugin.permission_update_review',findingId:'finding:plugin-permission-review:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'plugin-result:permission-review:fixture'},
    {id:'plugin-runtime-bounds',scope:'runtime',domainIds:['plugins'],title:'Plugin runtime bounds',status:'unknown',label:'Unknown',severity:'warning',reason:'Crash budget, quarantine state, and bounded redacted logs require a current Plugins System runtime projection.',owner:'Plugins System',target:'plugin-runtime:selected',freshness:'Unknown',confidence:'No native runtime',requested:'Current crash budget and bounded logs',effective:'Owner log feed unavailable',capability:'Crash budget, quarantine, redaction, log paging',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'access',command:'cmd.agent_plugin.open_logs',remediationMode:'owner_command_route',checkId:'doctor.plugin.runtime_bounds',findingId:'finding:plugin-runtime-bounds:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'plugin_runtime_owner_feed_unavailable'},
    {id:'plugin-rollback-health',scope:'runtime',domainIds:['plugins'],title:'Plugin rollback health',status:'unknown',label:'Unknown',severity:'warning',reason:'No current owner-verified recovery point proves package, permission, topology, and adapter rollback readiness.',owner:'Plugins System',target:'plugin-recovery:selected',freshness:'Unknown',confidence:'No owner receipt',requested:'Verified rollback recovery point',effective:'Unavailable',capability:'Package, manifest, permission, topology, and adapter rollback',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'updates',command:'cmd.agent_plugin.rollback',remediationMode:'owner_command_route',checkId:'doctor.plugin.rollback_health',findingId:'finding:plugin-rollback-health:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'unavailable',recoveryDivergenceReason:'verified_plugin_recovery_point_unavailable'},
    {id:'plugin-promoted-routine',scope:'runtime',domainIds:['plugins'],title:'Promoted routine freshness',status:'attention',label:'Needs attention',severity:'warning',reason:'A stale promoted routine remains quarantined until its source, package generation, permissions, and authority receive owner review.',owner:'Plugins System',target:'plugin-routine:selected',freshness:'Stale',confidence:'Browser fixture only',requested:'Current promoted routine disposition',effective:'Quarantined pending owner review',capability:'Source lineage, generation, authority, stale disposition',route:['code','toolchain'],ownerRouteTab:'plugins',ownerDetailTab:'evidence',command:'cmd.agent_plugin.open_details',remediationMode:'owner_command_route',checkId:'doctor.plugin.promoted_routine_freshness',findingId:'finding:plugin-promoted-routine:fixture',findingRevision:1,ownerGeneration:0,cacheGeneration:0,lastKnownResultRef:'plugin-result:promoted-routine:fixture-stale',recoveryDivergenceReason:'promoted_routine_generation_is_stale'}
  ];
  const PM7_DOCTOR_LOCAL_ACTIONS=Object.freeze(['ui.doctor.open','ui.doctor.open_details','ui.doctor.open_logs','ui.doctor.open_receipt','ui.doctor.open_remediation','ui.doctor.refresh_visible','ui.doctor.run_check']);
  const PM7_DOCTOR_EVIDENCE_LIMITS=Object.freeze({logs:Object.freeze({maxRows:3,maxBytes:1024}),receipt:Object.freeze({maxRows:1,maxBytes:2048})});
  function doctorEvidenceIdentity(item){
    const findingRevision=Number.isInteger(item.findingRevision)?item.findingRevision:1,ownerGeneration=Number.isInteger(item.ownerGeneration)?item.ownerGeneration:0,cacheGeneration=Number.isInteger(item.cacheGeneration)?item.cacheGeneration:0;
    const checkId=item.checkId||`doctor.concept.${item.id}`,findingId=item.findingId||`finding:${item.id}:fixture`,contextId=item.contextId||`doctor-context:${item.scope}:${item.id}`;
    return {checkId,findingId,findingRevision,contextId,checkCost:item.checkCost||'cached-summary-only; owner evidence loads only on explicit action',ownerGeneration,cacheGeneration,detailsRef:`doctor-details:${findingId}:${findingRevision}`,logsRef:`doctor-logs:${findingId}:${findingRevision}`,receiptRef:`doctor-receipt:${findingId}:${findingRevision}`};
  }
  function doctorLogProjection(item){
    const identity=doctorEvidenceIdentity(item),limits=PM7_DOCTOR_EVIDENCE_LIMITS.logs;
    const rows=[
      `01 info · ${identity.checkId} · cached finding projection rendered; no owner probe dispatched`,
      `02 boundary · owner ${item.owner} · target [REDACTED] · production log feed unavailable`,
      `03 currentness · finding revision ${identity.findingRevision} · owner generation ${identity.ownerGeneration} · cache generation ${identity.cacheGeneration}`
    ].slice(0,limits.maxRows);
    const renderedBytes=new TextEncoder().encode(rows.join('\n')).byteLength;
    return {kind:'logs',identity,limits,rows,renderedBytes,totalRows:7,truncated:true,continuationState:'unavailable_production_owner_feed',redactionState:'applied_before_render',currentnessState:'cached_browser_fixture'};
  }
  function doctorReceiptProjection(item){
    const identity=doctorEvidenceIdentity(item),limits=PM7_DOCTOR_EVIDENCE_LIMITS.receipt,receipt=state.doctorReturnReceipt||null;
    const exact=Boolean(receipt&&receipt.findingId===identity.findingId&&receipt.findingRevision===identity.findingRevision&&receipt.ownerGeneration===identity.ownerGeneration&&receipt.cacheGeneration===identity.cacheGeneration&&receipt.returnAccepted===true);
    const rows=[exact?`accepted owner result · ${receipt.normalizedStatus} · ${receipt.ownerResultRef}`:`unavailable · no exact current owner receipt for ${identity.findingId} revision ${identity.findingRevision}`].slice(0,limits.maxRows);
    const renderedBytes=new TextEncoder().encode(rows.join('\n')).byteLength;
    return {kind:'receipt',identity,limits,rows,renderedBytes,totalRows:rows.length,truncated:false,continuationState:'not_applicable',redactionState:'references_only',currentnessState:exact?'exact_current_owner_receipt':'unavailable'};
  }
  function doctorEvidenceMarkup(projection){
    const i=projection.identity,l=projection.limits;
    return `<section class="doctor-evidence-view" data-doctor-evidence-view="${projection.kind}" data-load-trigger="explicit_local_action" data-max-rows="${l.maxRows}" data-max-bytes="${l.maxBytes}" data-rendered-rows="${projection.rows.length}" data-rendered-bytes="${projection.renderedBytes}" data-total-rows="${projection.totalRows}" data-truncated="${projection.truncated}" data-continuation-state="${projection.continuationState}" data-redaction-state="${projection.redactionState}" data-currentness-state="${projection.currentnessState}" data-check-id="${escAttr(i.checkId)}" data-finding-id="${escAttr(i.findingId)}" data-finding-revision="${i.findingRevision}" data-context-id="${escAttr(i.contextId)}" data-owner-generation="${i.ownerGeneration}" data-cache-generation="${i.cacheGeneration}" data-production-runtime-state="unavailable" data-production-mutation-dispatched="false"><ol class="doctor-evidence-list">${projection.rows.map((row,index)=>`<li class="doctor-evidence-row" data-doctor-evidence-row="${index+1}">${escapeHtml(row)}</li>`).join('')}</ol>${projection.truncated?'<button type="button" class="btn small" disabled aria-disabled="true" data-disabled-reason="production_owner_feed_unavailable">Next bounded page unavailable</button>':''}</section>`;
  }
  function doctorScenarioRows(item){
    const scenarios=PM7_DOCTOR_CLOSURE_MODEL.scenarios.filter(row=>(item.scenarioIds||[]).includes(row.id));
    return scenarios.flatMap(scenario=>{
      const rows=[[`${scenario.requirements.join(', ')} · ${scenario.title}`,`Overall ${scenario.overallStatus} · ${scenario.overallImpact}`],...scenario.rows.map(row=>[`↳ ${row.label}`,`${row.status} · ${row.applicability} · ${row.effective}`])];
      if(scenario.returnContext)rows.push(['Exact return',`${scenario.returnContext.returnRoute.join(' / ')} · ${scenario.returnContext.returnScope} · focus ${scenario.returnContext.returnFocusId} · owner ${scenario.returnContext.expectedOwnerGeneration} · cache ${scenario.returnContext.expectedCacheGeneration}`]);
      rows.push(...scenario.redactionRows.map(row=>[`↳ ${row.label}`,`${row.outputState} · ${row.displayValue}`]));
      return rows;
    });
  }
  function doctorStatusClass(item){return item.status==='external'?'external':item.status==='recovered'?'ready':item.status==='unknown'?'attention':item.status;}
  function doctorItems(){const scope=state.doctorScope||'all';return PM7_DOCTOR_FIXTURES.filter(item=>scope==='all'||item.scope===scope);}
  function doctorFreshnessState(item){const value=String(item.freshness||'').toLowerCase();return value.includes('stale')?'stale':value.includes('unknown')||value.includes('not run')||value.includes('no owner')?'unknown':'aging';}
  function doctorCurrentnessState(item){return Number.isInteger(item.ownerGeneration)&&item.ownerGeneration>0&&Number.isInteger(item.cacheGeneration)&&item.cacheGeneration>0?'cached_generation_fenced':'owner_currentness_unavailable';}
  function doctorWorkProjection(){
    const current=window.PM12_KIMI?.getState?.()||state,viewerAttached=current?.domain==='system'&&current?.workspace==='doctor';
    return {work_id:PM7_DOCTOR_WORK_ID,viewer_attached:viewerAttached,owner_work_cancelled:false,join_on_reopen:true,concept_simulation_only:true,native_binding:false,production_runtime_state:'unavailable'};
  }
  Object.defineProperty(window,'PM7_DOCTOR_WORK_PROJECTION',{value:doctorWorkProjection,writable:false,configurable:false,enumerable:true});
  function doctorScopeButton(row){const active=(state.doctorScope||'all')===row[0];return `<button class="doctor-scope ${active?'is-active':''}" data-action="doctor-scope" data-ui-action-id="ui.doctor.refresh_visible" data-availability="concept_local_controller_available" data-disabled-reason="none" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" data-scope="${row[0]}" aria-pressed="${active}">${row[1]}</button>`;}
  function doctorRemediationDetails(item){
    const mode=item.remediationMode||'unavailable',ownerRoute=(item.route||[]).join('/');
    if(mode==='owner_command_route')return [['Remediation mode','Owner command route'],['Owner command',item.command||'Missing — disabled'],['Owner route',ownerRoute||'Missing — disabled']];
    if(mode==='typed_owner_route')return [['Remediation mode','Typed owner route'],['Typed owner route',item.typedOwnerRouteId||'Missing — disabled'],['Owner route',ownerRoute||'Missing — disabled']];
    return [['Remediation mode','Unavailable'],['Unavailable reason',item.disabledReason||'no_owner_command_or_typed_owner_route']];
  }
  function doctorItem(item){
    const checking=state.doctorChecking&&((state.doctorScope||'all')==='all'||state.doctorScope===item.scope);
    const status=checking?'checking':doctorStatusClass(item),label=checking?'Checking':item.label;
    const mode=item.remediationMode||'unavailable',commandRoute=mode==='owner_command_route',typedRoute=mode==='typed_owner_route',unavailable=mode==='unavailable';
    const configured=commandRoute?Boolean(item.command&&item.route?.length===2):typedRoute?Boolean(item.typedOwnerRouteId&&item.route?.length===2):unavailable&&Boolean(item.disabledReason);
    const contractReason=configured?'':commandRoute?'owner_command_route_missing_command_or_route':typedRoute?'typed_owner_route_missing_identity_or_route':'unavailable_mode_missing_reason';
    const availability=checking?'busy':unavailable?'unavailable':configured?'available':'unavailable';
    const disabled=checking||unavailable||!configured,disabledReason=checking?'selected_scope_check_in_progress':unavailable?(item.disabledReason||'no_owner_command_or_typed_owner_route'):contractReason;
    const ownerCommandState=commandRoute&&configured?'available':'unavailable',findingRevision=item.findingRevision||1,ownerGeneration=item.ownerGeneration||0,cacheGeneration=item.cacheGeneration||0;
    const evidence=doctorEvidenceIdentity(item),checkId=evidence.checkId,findingId=evidence.findingId,ownerRoute=(item.route||[]).join('/'),typedOwnerRouteId=typedRoute?(item.typedOwnerRouteId||''):'',returnRoute='system/doctor',returnScope=state.doctorScope||'all';
    const domainIds=(item.domainIds||[]).filter(id=>PM7_DOCTOR_DOMAIN_IDS.includes(id)),freshnessState=doctorFreshnessState(item),currentnessState=doctorCurrentnessState(item),lastKnownResult=item.lastKnownResultRef||'unavailable',currentReadiness=checking?'checking':item.status,recoveryDivergenceReason=item.recoveryDivergenceReason||'none';
    const idempotencyKey=`doctor-remediation:${item.id}:${findingRevision}:${ownerGeneration}:${cacheGeneration}`;
    const controlText=unavailable?'Owner unavailable':typedRoute?'Open route':'Open owner';
    return `<article class="doctor-item" id="doctor-finding-${item.id}" data-doctor-item="${item.id}" data-doctor-domain-id="${escAttr(domainIds[0]||'')}" data-doctor-domain-ids="${escAttr(domainIds.join(' '))}" data-production-runtime-state="unavailable" data-owner-command-state="${ownerCommandState}" data-remediation-mode="${mode}" data-context-id="${escAttr(evidence.contextId)}" data-check-cost="${escAttr(evidence.checkCost)}" data-details-ref="${escAttr(evidence.detailsRef)}" data-logs-ref="${escAttr(evidence.logsRef)}" data-receipt-ref="${escAttr(evidence.receiptRef)}" data-last-known-result="${escAttr(lastKnownResult)}" data-current-readiness="${escAttr(currentReadiness)}" data-freshness-state="${freshnessState}" data-currentness-state="${currentnessState}" data-recovery-divergence-reason="${escAttr(recoveryDivergenceReason)}"><div class="doctor-item-main"><div class="doctor-item-title-row"><span class="doctor-item-title">${escapeHtml(item.title)}</span><span class="doctor-state" data-state="${status}">${escapeHtml(label)}</span></div><div class="doctor-item-copy">${escapeHtml(item.reason)}</div><div class="doctor-item-meta"><span>${escapeHtml(item.owner)}</span><span>${escapeHtml(item.target)}</span><span>${escapeHtml(item.freshness)}</span><span>${escapeHtml(item.confidence)}</span></div></div><div class="doctor-item-actions"><button class="btn small" id="doctor-details-${item.id}" data-action="doctor-item-details" data-ui-action-id="ui.doctor.open_details" data-availability="concept_local_controller_available" data-disabled-reason="none" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" data-pm-hover-label="Open finding details" data-pm-hover-detail="Lazy normalized finding facts; no owner probe." data-id="${item.id}">Details</button><button class="btn small" id="doctor-logs-${item.id}" data-action="doctor-item-logs" data-ui-action-id="ui.doctor.open_logs" data-pm-hover-label="Open bounded logs" data-pm-hover-detail="Lazy redacted cached log projection." data-id="${item.id}">Logs</button><button class="btn small" id="doctor-receipt-${item.id}" data-action="doctor-item-receipt" data-ui-action-id="ui.doctor.open_receipt" data-pm-hover-label="Open receipt" data-pm-hover-detail="Lazy exact-currentness receipt projection." data-id="${item.id}">Receipt</button><button class="btn small primary" id="doctor-remediation-${item.id}" data-action="doctor-open-owner" data-ui-action-id="ui.doctor.open_remediation" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" data-pm-hover-label="Open canonical owner" data-pm-hover-detail="Doctor routes remediation; it never performs owner mutation." data-remediation-mode="${mode}" data-check-id="${checkId}" data-finding-id="${findingId}" data-finding-revision="${findingRevision}" data-target-id="${item.target}" data-project-id="${escAttr(item.projectId||'')}" data-named-plan-id="${escAttr(item.namedPlanId||'')}" data-provider-id="${escAttr(item.providerId||'')}" data-provider-route-id="${escAttr(item.providerRouteId||'')}" data-settings-manager-id="${escAttr(item.settingsManagerId||'')}" data-settings-detail-id="${escAttr(item.settingsDetailId||'')}" data-owner-command-id="${commandRoute?(item.command||''):''}" data-typed-owner-route-id="${typedOwnerRouteId}" data-owner-command-state="${ownerCommandState}" data-owner-route="${ownerRoute}" data-return-route="${returnRoute}" data-return-scope="${returnScope}" data-owner-generation="${ownerGeneration}" data-cache-generation="${cacheGeneration}" data-idempotency-key="${idempotencyKey}" data-id="${item.id}" data-availability="${availability}" ${disabled?`disabled aria-disabled="true" data-disabled-reason="${disabledReason}"`:'data-disabled-reason="none"'}>${controlText}</button></div></article>`;
  }
  function renderDoctor(){
    const items=doctorItems(),attention=items.filter(item=>['attention','waiting','blocked','unavailable','unknown'].includes(item.status)).length,limits=items.filter(item=>item.status==='limits').length,stale=items.filter(item=>item.freshness==='Stale'||item.freshness==='Unknown').length;
    return `<div class="manager-page page-enter" data-doctor-workspace="cached-owner-projections" data-doctor-work-id="${PM7_DOCTOR_WORK_ID}" data-viewer-attached="true" data-owner-work-cancelled="false" data-production-runtime-state="unavailable">${pageHeader('test','Doctor','Cached owner projections appear immediately. Details load on demand; Check Again rechecks only the selected scope and never performs a private repair.',`<button class="btn" id="doctor-open-cached-summary" data-action="doctor-open-summary" data-ui-action-id="ui.doctor.open" data-availability="concept_local_controller_available" data-disabled-reason="none" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" data-pm-hover-label="Open cached Doctor summary" data-pm-hover-detail="Reads the bounded cache only; no owner probe or repair.">Cached summary</button>${pm7ConsumerButton('local','ui.doctor.copy_diagnostics','Copy diagnostics')}${pm7ConsumerButton('command','cmd.doctor.export_report','Export report')}<button class="btn" data-action="replay-onboarding" data-ui-action-id="settings.onboarding.run_again">Replay setup</button><button class="btn" data-action="start-guided-tour" data-ui-action-id="settings.guided_tour.replay">Guided Tour</button><button class="btn primary" data-action="doctor-check-scope" data-ui-action-id="ui.doctor.run_check" data-availability="${state.doctorChecking?'busy':'concept_local_controller_available'}" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" ${state.doctorChecking?'disabled aria-disabled="true" data-disabled-reason="selected_scope_check_in_progress"':'data-disabled-reason="none"'}>${state.doctorChecking?'Checking':'Check Again'}</button>`)}<div class="manager-body"><div class="manager-scroll"><div class="doctor-summary-strip"><article class="stat-card"><div class="stat-label">Visible checks</div><div class="stat-value">${items.length}</div><div class="stat-note">Selected scope only</div></article><article class="stat-card"><div class="stat-label">Needs attention</div><div class="stat-value">${attention}</div><div class="stat-note">No false-green stale state</div></article><article class="stat-card"><div class="stat-label">Ready with limits</div><div class="stat-value">${limits}</div><div class="stat-note">Requested and effective differ</div></article><article class="stat-card"><div class="stat-label">Stale or unknown</div><div class="stat-value">${stale}</div><div class="stat-note">Mutation remains unavailable</div></article></div><nav class="doctor-scope-bar" aria-label="Doctor scope">${PM7_DOCTOR_SCOPES.map(doctorScopeButton).join('')}</nav><div class="doctor-item-list">${items.map(doctorItem).join('')}</div><div class="alert-strip info" style="margin-top:10px">${icon('info')}<div>Doctor routes installation, authentication, repair, update, storage, browser, backup, and source-control work to the named owner. It never performs those operations itself.</div></div></div></div></div>`;
  }
'''


PLUGIN_RENDER = r'''  const PM7_PLUGIN_COMMANDS=Object.freeze([
    {id:'cmd.agent_plugin.scan',label:'Scan package',icon:'search',group:'package',effect:'Inspect package and manifest candidates without installing.'},
    {id:'cmd.agent_plugin.install',label:'Install plugin',icon:'plus',group:'package',effect:'Request owner-governed installation after review.'},
    {id:'cmd.agent_plugin.update',label:'Update',icon:'refresh',group:'update',effect:'Apply an approved complete package and permission diff.'},
    {id:'cmd.agent_plugin.enable',label:'Enable',icon:'play',group:'runtime',effect:'Enable the current approved plugin generation.'},
    {id:'cmd.agent_plugin.disable',label:'Disable',icon:'pause',group:'runtime',effect:'Disable the plugin without deleting its package.'},
    {id:'cmd.agent_plugin.reload',label:'Reload',icon:'refresh',group:'runtime',effect:'Reload the current generation within its crash budget.'},
    {id:'cmd.agent_plugin.remove',label:'Remove',icon:'trash',group:'package',effect:'Remove the plugin through an owner-issued rollback-safe operation.'},
    {id:'cmd.agent_plugin.validate',label:'Validate',icon:'test',group:'integrity',effect:'Validate manifests, adapters, permissions, containment, and compatibility.'},
    {id:'cmd.agent_plugin.review_changes',label:'Review changes',icon:'file',group:'update',effect:'Review the complete package, topology, permission, and authority diff.'},
    {id:'cmd.agent_plugin.rollback',label:'Rollback',icon:'undo',group:'update',effect:'Return to the last owner-verified recovery point.'},
    {id:'cmd.agent_plugin.open_details',label:'Details',icon:'info',group:'evidence',effect:'Open a bounded redacted owner detail projection.'},
    {id:'cmd.agent_plugin.open_logs',label:'Logs',icon:'terminal',group:'evidence',effect:'Open bounded redacted logs without exposing secret bytes.'}
  ]);
  Object.defineProperty(window,'PM7_PLUGIN_COMMANDS',{value:PM7_PLUGIN_COMMANDS,writable:false,configurable:false,enumerable:true});
  function pluginCommandSpec(commandId){return PM7_PLUGIN_COMMANDS.find(row=>row.id===commandId);}
  function pluginCommandButton(commandId,label,options={}){
    const spec=pluginCommandSpec(commandId),text=label||spec?.label||commandId,tone=options.tone?` ${options.tone}`:'',small=options.small?' small':'',itemId=options.itemId||'',detail=spec?.effect||'Requires the Plugins System owner.';
    return `<button type="button" class="btn plugin-command${tone}${small}" data-action="plugin-owner-command" data-command-id="${escAttr(commandId)}" data-command-result="PluginCommandResult" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-receipt-mode="owner_receipt_only" data-event-record="not_emitted" data-production-mutation-dispatched="false" data-id="${escAttr(itemId)}" aria-disabled="true" data-pm-hover-label="${escAttr(text)} unavailable" data-pm-hover-detail="${escAttr(`${detail} Native handler is not attached in this browser concept.`)}">${spec?icon(spec.icon):''}${escapeHtml(text)}</button>`;
  }
  function pluginProjection(item){
    const pluginId=`agent-plugin.${item.id}`,packageId=`pm.plugin.${item.id}`,optional=item.version==='Optional',generation=optional?7:18;
    return Object.freeze({
      packageId,pluginId,version:item.version,packageGeneration:generation,permissionGeneration:generation+2,topologyGeneration:generation+4,
      manifestLane:optional?'portable plugin.json with PM-native pm-plugin.json overlay':'PM-native pm-plugin.json with portable plugin.json interchange',
      manifests:[
        ['plugin.json','portable manifest',`fixture-sha256-ref:portable:${item.id}:g${generation}`],
        ['pm-plugin.json','PM-native manifest',`fixture-sha256-ref:pm-native:${item.id}:g${generation}`],
        ['legacy package tree','migration input',`fixture-sha256-ref:legacy-tree:${item.id}:g${generation-1}`],
        ['normalized package tree','resolved owner input',`fixture-sha256-ref:normalized-tree:${item.id}:g${generation}`]
      ],
      adapters:'OpenAI/Codex adapter · Claude adapter',roundTrips:'portable → PM-native → target adapter → portable',
      conformance:'Portable, PM target, and agent projections require current owner validation',freshness:'Browser fixture only · production owner feed unavailable',
      packageStatus:optional?'Available · not installed by this concept':'Present in fixture · effective runtime unverified',
      components:optional?'Core bridge required · optional surface deferred':'Core bridge required · forge surface optional',
      permissions:(item.permissions||[]).join(', ')||'None requested',authority:'User approval plus effective Safety & Permissions profile',
      reapproval:'Required for permission, topology, publisher, trust, or authority expansion',containment:'Process boundary and least-privilege capability projection',
      isolation:'Package and runtime failure domains remain explicit',signature:'Owner verification required',trust:'No browser fixture establishes production trust',
      publisher:'Publisher identity owner-projected',license:'License record required',sbom:'SBOM reference required',provenance:'Package provenance required',
      knownBad:'Known-bad and revocation lists checked by owner',compatibility:'Host, target, adapter, and manifest compatibility are separate',
      rollback:'Last verified package generation required before mutation',crashBudget:'3 crashes / 10 minutes, then owner quarantine',
      logBound:'200 rows or 64 KiB per explicit page; redacted before render',staleRoutine:'Stale promoted routine quarantined pending owner review',
      updateDiff:'Package tree, both manifests, components, permissions, topology, authority, adapters, compatibility, supply-chain evidence, and rollback point',
      evidence:'Details ≤ 32 KiB · Logs ≤ 64 KiB / 200 rows · Receipt ≤ 16 KiB; secret bytes and sensitive paths withheld'
    });
  }
  function renderPluginOwnerBanner(item,p){
    return `<section class="plugin-owner-banner" data-plugin-owner-projection="true" data-production-runtime-state="unavailable"><div class="plugin-owner-banner-copy"><span class="plugin-owner-kicker">Plugins System owner projection</span><span class="plugin-owner-title">${escapeHtml(p.pluginId)} · generation ${p.packageGeneration}</span><span class="plugin-owner-note">This Settings workspace reads owner facts. Every mutation remains unavailable until the native handler returns a typed PluginCommandResult.</span></div><span class="doctor-state" data-state="attention">Handler unavailable</span></section>`;
  }
  function renderPluginManifestRows(p){return `<div class="plugin-manifest-list">${p.manifests.map(row=>`<div class="plugin-manifest-row"><span class="plugin-manifest-name">${escapeHtml(row[0])}</span><span class="plugin-manifest-ref">${escapeHtml(row[1])} · ${escapeHtml(row[2])}</span></div>`).join('')}</div>`;}
  function renderPluginOverview(item,p){
    return `${renderPluginOwnerBanner(item,p)}<div class="card-grid three"><article class="stat-card"><div class="stat-label">Package status</div><div class="stat-value" style="font-size:12px">${escapeHtml(p.packageStatus)}</div><div class="stat-note">Package is primary; components remain required or optional.</div></article><article class="stat-card"><div class="stat-label">Manifest lane</div><div class="stat-value" style="font-size:11px">${escapeHtml(p.manifestLane)}</div><div class="stat-note">Explicit precedence and migration.</div></article><article class="stat-card"><div class="stat-label">Freshness</div><div class="stat-value" style="font-size:12px">Unverified</div><div class="stat-note">${escapeHtml(p.freshness)}</div></article></div><div class="plugin-compact-grid" style="margin-top:8px"><section class="plugin-fact-card"><div class="panel-title">Identity & generations</div><div class="panel-subtitle">Stable owner identities prevent package, permission, and topology drift.</div><div class="info-grid">${infoRow('Package ID',p.packageId)}${infoRow('Plugin ID',p.pluginId)}${infoRow('Version',p.version)}${infoRow('Package generation',String(p.packageGeneration))}${infoRow('Permission generation',String(p.permissionGeneration))}${infoRow('Topology generation',String(p.topologyGeneration))}${infoRow('Components',p.components)}</div></section><section class="plugin-fact-card"><div class="panel-title">Portable round trip</div><div class="panel-subtitle">Portable and target-specific projections stay separately testable.</div><div class="info-grid">${infoRow('Adapters',p.adapters)}${infoRow('Round trips',p.roundTrips)}${infoRow('Conformance',p.conformance)}${infoRow('Status',p.freshness)}</div><div class="plugin-action-row">${pluginCommandButton('cmd.agent_plugin.validate','Validate',{tone:'primary',itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.open_details','Owner details',{itemId:item.id})}</div></section></div>`;
  }
  function renderPluginUpdates(item,p){
    return `${renderPluginOwnerBanner(item,p)}<div class="plugin-compact-grid"><section class="plugin-fact-card"><div class="panel-title">Complete update review</div><div class="panel-subtitle">A version label alone is never enough to approve an update.</div><div class="info-grid">${infoRow('Current update',item.update)}${infoRow('Complete diff',p.updateDiff)}${infoRow('Authority',p.authority)}${infoRow('Reapproval',p.reapproval)}${infoRow('Rollback',p.rollback)}</div><div class="plugin-action-row">${pluginCommandButton('cmd.agent_plugin.review_changes','Review complete diff',{tone:'primary',itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.update','Update',{itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.rollback','Rollback',{itemId:item.id})}</div></section><section class="plugin-fact-card"><div class="panel-title">Resolved manifests</div><div class="panel-subtitle">Portable, PM-native, legacy-input, and normalized-tree references remain distinct.</div>${renderPluginManifestRows(p)}</section></div>`;
  }
  function renderPluginAccess(item,p){
    return `${renderPluginOwnerBanner(item,p)}<div class="plugin-compact-grid"><section class="plugin-fact-card"><div class="panel-title">Permission & authority</div><div class="panel-subtitle">Requested permissions cannot exceed the effective safety profile.</div><div class="info-grid">${infoRow('Requested',p.permissions)}${infoRow('Authority',p.authority)}${infoRow('Reapproval',p.reapproval)}${infoRow('Effective state','Unavailable without owner projection')}</div><div class="plugin-action-row">${pluginCommandButton('cmd.agent_plugin.enable','Enable',{tone:'primary',itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.disable','Disable',{itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.reload','Reload',{itemId:item.id})}</div></section><section class="plugin-fact-card"><div class="panel-title">Containment & runtime bounds</div><div class="panel-subtitle">Failure containment remains independent from package trust.</div><div class="info-grid">${infoRow('Containment',p.containment)}${infoRow('Isolation',p.isolation)}${infoRow('Crash budget',p.crashBudget)}${infoRow('Log bound',p.logBound)}${infoRow('Promoted routine',p.staleRoutine)}</div></section></div>`;
  }
  function renderPluginEvidence(item,p){
    return `${renderPluginOwnerBanner(item,p)}<div class="plugin-compact-grid"><section class="plugin-fact-card"><div class="panel-title">Supply-chain posture</div><div class="panel-subtitle">Every trust fact remains owner-issued and independently current.</div><div class="info-grid">${infoRow('Signature',p.signature)}${infoRow('Trust',p.trust)}${infoRow('Publisher',p.publisher)}${infoRow('License',p.license)}${infoRow('SBOM',p.sbom)}${infoRow('Provenance',p.provenance)}${infoRow('Known-bad checks',p.knownBad)}${infoRow('Compatibility',p.compatibility)}</div></section><section class="plugin-fact-card"><div class="panel-title">Bounded evidence</div><div class="panel-subtitle">Details, logs, and receipts are separately bounded and redacted.</div><div class="plugin-evidence-bound">${escapeHtml(p.evidence)}<br>Lifecycle: owner receipt only; EventRecord intentionally not emitted.<br>Current concept: no owner bytes loaded, no production receipt issued, no mutation dispatched.</div><div class="plugin-action-row">${pluginCommandButton('cmd.agent_plugin.open_details','Details',{tone:'primary',itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.open_logs','Logs',{itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.remove','Remove',{tone:'danger',itemId:item.id})}</div></section></div>`;
  }
  function renderPluginDetail(item,tab){
    const p=pluginProjection(item);
    if(tab==='updates')return renderPluginUpdates(item,p);
    if(tab==='access'||tab==='settings')return renderPluginAccess(item,p);
    if(tab==='evidence'||tab==='diagnostics')return renderPluginEvidence(item,p);
    return renderPluginOverview(item,p);
  }
  function renderToolchainHeaderActions(){
    if(state.toolTab==='plugins')return `${pluginCommandButton('cmd.agent_plugin.scan','Scan package')}${pluginCommandButton('cmd.agent_plugin.install','Install plugin',{tone:'primary'})}`;
    return `<button class="btn" data-action="toolchain-discover">${icon('search')} Discover project tools</button><button class="btn primary" data-action="add-tool-resource" data-kind="${state.toolTab}">${icon('plus')} Add ${escapeHtml(toolSingular(state.toolTab))}</button>`;
  }
  function renderToolchainRosterAction(){
    if(state.toolTab==='plugins')return pluginCommandButton('cmd.agent_plugin.install','Install',{small:true});
    return `<button class="icon-btn" data-action="add-tool-resource" data-kind="${state.toolTab}">${icon('plus')}</button>`;
  }
  function renderToolResourceActions(item,kind){
    if(kind==='plugins')return `<div class="resource-actions">${pluginCommandButton('cmd.agent_plugin.validate','Validate',{itemId:item.id})}${pluginCommandButton('cmd.agent_plugin.review_changes','Review changes',{tone:'primary',itemId:item.id})}</div>`;
    return `<div class="resource-actions"><button class="btn" data-action="test-tool-resource" data-kind="${kind}" data-id="${item.id}">${icon('test')}<span class="btn-label">Test</span></button><button class="btn primary" data-action="edit-tool-resource" data-kind="${kind}" data-id="${item.id}">${icon('edit')}<span class="btn-label">Edit</span></button><button class="icon-btn" data-action="tool-resource-menu" data-kind="${kind}" data-id="${item.id}">${icon('more')}</button></div>`;
  }
  function pluginEmptyState(){return `<section class="plugin-fact-card"><div class="panel-title">No plugin package selected</div><div class="panel-subtitle">Scan or install through Plugins System. Settings never becomes the package or runtime owner.</div><div class="plugin-action-row">${pluginCommandButton('cmd.agent_plugin.scan','Scan package')}${pluginCommandButton('cmd.agent_plugin.install','Install plugin',{tone:'primary'})}</div></section>`;}
  function openPluginOwnerUnavailable(commandId,item){
    const spec=pluginCommandSpec(commandId),name=item?.name||'Plugin';
    infoDrawer(`${spec?.label||'Plugin action'} unavailable`,'This browser concept exposes the canonical owner route but no native Plugins System handler is attached. It dispatches no mutation, emits no EventRecord, and fabricates no production receipt.',[['Plugin',name],['Command',commandId||'Unknown'],['Availability','handler_unavailable'],['Result contract','PluginCommandResult'],['Lifecycle','Owner receipt only; EventRecord not emitted'],['Production mutation','Not dispatched'],['Native runtime','Unavailable'],['Next step','Attach the Plugins System handler and current owner projection']]);
  }
'''


BROWSER_SCM_RENDER = r'''  function renderBrowserScm(){
    if(!state.browserScmTab)state.browserScmTab='browser';
    const tabs=[['browser','Browser'],['capture','Capture'],['scm','SCM & Forges'],['origin','Origin Preview'],['plans','Named Plans'],['performance','Performance']].map(([id,label])=>({id,label}));
    const tabMarkup=managerTabs(tabs,state.browserScmTab,'browser-scm-tab').replaceAll('data-action="browser-scm-tab"','data-action="browser-scm-tab" data-ui-action-id="ui.settings.browser_scm_tab.select" data-availability="available"');
    return `<div class="manager-page page-enter">${pageHeader('browser','Browser, Capture & Source Integration','Owner projections share the K3 manager shell without duplicating browser, capture, source-control, forge, Named Plan, or runtime ownership.')} ${tabMarkup}<div class="manager-body"><div class="manager-scroll">${renderBrowserScmTab()}</div></div></div>`;
  }
  function renderBrowserScmTab(){
    if(state.browserScmTab==='capture')return `<div class="systems-contract-grid"><section class="systems-contract-card"><h3>Test Capture</h3><p>Capture is explicit, bounded, redacted, and receipt-backed. AuthBrowserSession is never a capture source.</p><div class="info-grid">${infoRow('Screenshots','Explicit test or user action')}${infoRow('Video','Actual captured FPS disclosed')}${infoRow('Console and network','Bounded and redacted')}${infoRow('AuthBrowserSession','Never captured')}${infoRow('Retention','Evidence policy owned')}</div><div class="table-actions"><button class="btn primary" data-action="open-capture-policy" data-ui-action-id="ui.capture.policy.inspect" data-availability="available">Inspect capture policy</button></div></section><section class="systems-contract-card"><h3>Motion evidence</h3><p>Browser frame pacing remains provisional. Native Slint, compositor, and old-hardware certification require separate execution.</p><div class="info-grid">${infoRow('Target','16.7 ms at 60 FPS')}${infoRow('Report','P50, P95, P99 and delayed frames')}${infoRow('Master','Lossless frames and FFV1/MKV')}${infoRow('Review','Every frame at full resolution')}</div></section></div>`;
    if(state.browserScmTab==='scm')return `<div class="systems-contract-grid"><section class="systems-contract-card"><h3>Source Control</h3><p>Git and Jujutsu readiness is scoped to the exact Host and Environment. Requested and effective state remain distinct.</p><div class="info-grid">${infoRow('Git','Owner projection required')}${infoRow('Jujutsu','Owner projection required')}${infoRow('Repositories','Project System consumer')}${infoRow('Recovery','SCM owner route')}</div><div class="table-actions"><button class="btn primary" data-action="navigate" data-ui-action-id="ui.settings.route.open" data-availability="available" data-domain="source" data-workspace="source-manager">Open Source Control</button></div></section><section class="systems-contract-card"><h3>Online Git services</h3><p>GitHub, GitLab, Azure DevOps, Bitbucket, Forgejo, and Gitea preserve separate service, server, account, scope, authentication, and availability projections.</p><div class="info-grid">${infoRow('Forgejo / Gitea','Distinct self-managed adapters')}${infoRow('Authentication','Human AuthBrowser handoff')}${infoRow('Secrets','References only')}${infoRow('SSH / private CA','Instance-scoped checks and receipts')}${infoRow('Automation','Actions & Pipelines remains separate from code access')}${infoRow('Disconnect','Does not rewrite local history')}</div></section></div>`;
    if(state.browserScmTab==='origin')return `<div class="systems-contract-grid"><section class="systems-contract-card"><h3>Cursor Origin Preview</h3><p>A brief preview inserts Origin into the existing SCM flow; it is not a separate onboarding subsystem and never makes Origin CLI mandatory.</p><div class="info-grid">${infoRow('Mode','Preview insertion')}${infoRow('Local source','Preserved')}${infoRow('Mirror','Explicit and reversible')}${infoRow('CLI helper','Optional')}</div><div class="table-actions"><button class="btn primary" data-action="preview-origin" data-ui-action-id="ui.origin.preview.open" data-availability="concept_preview_only">Preview Origin</button></div></section><section class="systems-contract-card"><h3>Origin safety</h3><p>Repository identity, remote URL, credentials, mirror state, and forge state are validated independently before any change.</p><div class="info-grid">${infoRow('AuthBrowser','Human-only')}${infoRow('Agent access','Unavailable')}${infoRow('Rollback','Required')}${infoRow('Receipt','Owner-issued')}</div></section></div>`;
    if(state.browserScmTab==='plans')return `<div class="systems-contract-grid"><section class="systems-contract-card"><h3>Named Plans</h3><p>Create, bind, inspect, and archive named plans through their canonical owner while Planning Wizard remains the guided plan-authoring route.</p><div class="info-grid">${infoRow('Owner','Named Plan System')}${infoRow('Project binding','Stable project ID')}${infoRow('Goal binding','Explicit')}${infoRow('History','Durable receipts')}</div><div class="table-actions"><button class="btn primary" data-action="open-named-plan" data-ui-action-id="ui.named_plan.inspect" data-availability="concept_preview_only">Inspect Named Plans</button></div></section><section class="systems-contract-card"><h3>Planning Wizard</h3><p>The Guided Tour ends at the live Planning Wizard. Onboarding never duplicates its interview or planning state.</p><div class="table-actions"><button class="btn" data-action="open-planning-wizard" data-ui-action-id="ui.planning_wizard.open" data-availability="available">Open Planning Wizard</button></div></section></div>`;
    if(state.browserScmTab==='performance')return `<div class="systems-contract-grid"><section class="systems-contract-card"><h3>Responsive work</h3><p>Controls acknowledge in the same frame; durable work continues through admission and ObservableWork instead of fake percentages.</p><div class="info-grid">${infoRow('Lifecycle','Accepted, queued, running, waiting, retrying')}${infoRow('Recovery','Reconnecting, degraded, stalled, rollback')}${infoRow('Terminal','Completed, failed, cancelled, recovery required')}${infoRow('Lists','Bounded and virtualized')}</div><div class="table-actions"><button class="btn primary" data-action="open-performance-evidence" data-ui-action-id="ui.performance.evidence.inspect" data-availability="available">Inspect evidence boundary</button></div></section><section class="systems-contract-card"><h3>Continuity</h3><p>Reconnect, restart, sleep, and external return preserve operation, session, stream, and upload identity; stale generations are rejected.</p><div class="info-grid">${infoRow('Hidden surfaces','Paint work stops; durable owner work continues')}${infoRow('Low-resource mode','Owner-governed')}${infoRow('Deduplication','Stable identities')}${infoRow('Browser proof','Never promoted to native certification')}</div></section></div>`;
    return `<div class="systems-contract-grid"><section class="systems-contract-card" data-browser-program-projection="true"><h3>PM-native Browser Program</h3><p>BrowserAction, Browser Program, and Expert Browser Program are contract terms projected into this ordinary browser concept. No Browser Program runtime is available or executed here.</p><div class="info-grid">${infoRow('Projection only','true')}${infoRow('Runtime state','runtime_unavailable')}${infoRow('Native CEF executed','false')}${infoRow('Surface','ordinary_browser_only')}${infoRow('Prerequisites','policy, capability, explicit user action')}${infoRow('Execution methods','0')}${infoRow('Raw protocol access','false')}${infoRow('Arbitrary page code','false')}</div><div class="table-actions"><button class="btn primary" data-action="navigate" data-ui-action-id="ui.settings.route.open" data-availability="available" data-domain="ai" data-workspace="web">Open Browser</button></div></section><section class="systems-contract-card"><h3>AuthBrowserSession</h3><p>AuthBrowserSession is excluded from this projection. The protected sign-in lane is human-only, non-recordable, non-inspectable, and unavailable to agents and adapters.</p><div class="info-grid">${infoRow('Projection','Excluded')}${infoRow('Persistence','Ephemeral')}${infoRow('Capture and replay','Unavailable')}${infoRow('Automation','Unavailable')}${infoRow('Export and restore','Unavailable')}</div></section></div>`;
  }
'''


HANDLER_CASES = r'''      /* PM7 T46 owner-routed Doctor and integration consumers. */
      case 'pm7-typed-consumer': window.PM7_SERVER_GAP_CONSUMERS.dispatch_from_control(el);return;
      case 'open-project-client': pm7TypedConsumerResult(el,'local','ui.client.open_details');return;
      case 'add-server-host': pm7TypedConsumerResult(el,'command','cmd.execution_host.register');return;
      case 'verify-server-host': pm7TypedConsumerResult(el,'command','cmd.execution_host.test');return;
      case 'pause-goal': pm7TypedConsumerResult(el,'command','cmd.goal.pause');return;
      case 'add-project-location': pm7TypedConsumerResult(el,'command','cmd.project.source_location.add');return;
      case 'edit-project-location': pm7TypedConsumerResult(el,'command','cmd.project.source_location.update');return;
      case 'create-worktree': pm7TypedConsumerResult(el,'command','cmd.source_control.workspace.create');return;
      case 'open-worktree': pm7TypedConsumerResult(el,'command','cmd.source_control.workspace.switch');return;
      case 'check-for-updates': pm7TypedConsumerResult(el,'command','cmd.update.app.check');return;
      case 'edit-update-settings': pm7TypedConsumerResult(el,'command','cmd.update.app.automatic.set_enabled');return;
      case 'preview-update': pm7TypedConsumerResult(el,'local','ui.update.app.open_details');return;
      case 'rollback-update': pm7TypedConsumerResult(el,'command','cmd.update.app.rollback');return;
      case 'plugin-owner-command': {
        const commandId=el.getAttribute('data-command-id')||'',item=toolById('plugins',ds(el,'id'))||state.toolchain.plugins?.find(row=>row.id===state.selectedTool.plugins)||null;
        openPluginOwnerUnavailable(commandId,item);return;
      }
      case 'doctor-scope': pm7TypedConsumerResult(el,'local','ui.doctor.refresh_visible',false);state.doctorScope=ds(el,'scope')||'all';saveState();renderApp({soft:true});return;
      case 'doctor-open-summary': {
        pm7TypedConsumerResult(el,'local','ui.doctor.open',false);
        const items=doctorItems(),scope=state.doctorScope||'all',attention=items.filter(item=>['attention','waiting','blocked','unavailable','unknown'].includes(item.status)).length;
        infoDrawer('Cached Doctor summary','This local view reads the already-mounted bounded cache. It dispatches no owner probe, command, readiness receipt, or private repair.',[['Scope',scope],['Visible findings',items.length],['Needs attention',attention],['Last selected-scope check',state.doctorCheckedAt||'Not run'],['Owner feed','Not attached'],['Production runtime','Unavailable']],{extra:`<section class="alert-strip info" data-doctor-evidence-view="summary" data-cached-only="true" data-owner-probe-dispatched="false" data-production-mutation-dispatched="false" data-production-runtime-state="unavailable">${icon('info')}<div>Cached projection only. No owner probe or Doctor-private mutation ran.</div></section>`});return;
      }
      case 'doctor-check-scope': {
        pm7TypedConsumerResult(el,'local','ui.doctor.run_check',false);
        if(state.doctorChecking)return;state.doctorChecking=true;renderApp({soft:true});
        setTimeout(()=>{state.doctorChecking=false;state.doctorCheckedAt=new Date().toISOString();saveState();renderApp({soft:true});showToast('Selected scope refreshed','Concept projection only; no production readiness receipt was created.','info');},520);return;
      }
      case 'doctor-item-details': {
        pm7TypedConsumerResult(el,'local','ui.doctor.open_details',false);
        const item=PM7_DOCTOR_FIXTURES.find(row=>row.id===ds(el,'id'));if(!item)return;
        const identity=doctorEvidenceIdentity(item);
        infoDrawer(item.title,'Lazy browser-concept model detail. Native runtime and production owner feeds are unavailable; bounded redacted logs and owner receipts load only when requested.',[['Check ID',identity.checkId],['Finding ID',identity.findingId],['Finding revision',identity.findingRevision],['Context',identity.contextId],['Check cost',identity.checkCost],['Status',item.label],['Severity',item.severity],['Reason',item.reason],['Owner',item.owner],['Target',item.target],['Freshness',item.freshness],['Confidence',item.confidence],['Requested',item.requested],['Effective',item.effective],['Capability',item.capability],['Redaction','Evidence projections redact before render'],...doctorRemediationDetails(item),['Native runtime','Unavailable'],['Production owner feed','Not attached'],...doctorScenarioRows(item)]);return;
      }
      case 'doctor-item-logs': {
        const item=PM7_DOCTOR_FIXTURES.find(row=>row.id===ds(el,'id'));if(!item)return;
        const projection=doctorLogProjection(item);
        infoDrawer(`Logs · ${item.title}`,'Loaded only by this explicit local action. The bounded browser projection is redacted before render and contains no production owner log bytes.',[['Evidence ref',projection.identity.logsRef],['Currentness',projection.currentnessState],['Rows',`${projection.rows.length} of ${projection.totalRows}`],['Byte bound',`${projection.renderedBytes} of ${projection.limits.maxBytes}`],['Truncated',projection.truncated?'Yes; continuation unavailable without owner feed':'No'],['Production owner feed','Unavailable']],{extra:doctorEvidenceMarkup(projection)});return;
      }
      case 'doctor-item-receipt': {
        const item=PM7_DOCTOR_FIXTURES.find(row=>row.id===ds(el,'id'));if(!item)return;
        const projection=doctorReceiptProjection(item);
        infoDrawer(`Receipt · ${item.title}`,'Loaded only by this explicit local action. A receipt is shown only when its finding revision and owner/cache generations exactly match the current row.',[['Evidence ref',projection.identity.receiptRef],['Currentness',projection.currentnessState],['Rows',projection.rows.length],['Byte bound',`${projection.renderedBytes} of ${projection.limits.maxBytes}`],['Production runtime','Unavailable'],['Mutation','None']],{extra:doctorEvidenceMarkup(projection)});return;
      }
      case 'doctor-open-owner': {
        pm7TypedConsumerResult(el,'local','ui.doctor.open_remediation',false);
        const item=PM7_DOCTOR_FIXTURES.find(row=>row.id===ds(el,'id'));if(!item)return;
        const mode=item.remediationMode||'unavailable';
        const commandRoute=mode==='owner_command_route',typedRoute=mode==='typed_owner_route';
        const disabledReason=mode==='unavailable'?(item.disabledReason||'no_owner_command_or_typed_owner_route'):commandRoute&&!item.command?'owner_command_route_missing_command':typedRoute&&!item.typedOwnerRouteId?'typed_owner_route_missing_identity':!Array.isArray(item.route)||item.route.length!==2?'owner_route_missing_or_invalid':!commandRoute&&!typedRoute?'unsupported_remediation_mode':'';
        if(disabledReason){state.doctorReturnContext=null;state.doctorReturnRejected=disabledReason;saveState();showToast('Owner action unavailable',`Doctor remediation is fail-closed: ${disabledReason}.`,'warning');return;}
        const findingRevision=item.findingRevision||1,ownerGeneration=item.ownerGeneration||0,cacheGeneration=item.cacheGeneration||0;
        state.doctorReturnContext={checkId:item.checkId||`doctor.concept.${item.id}`,findingId:item.findingId||`finding:${item.id}:fixture`,findingRevision,targetId:item.target,projectId:item.projectId||null,namedPlanId:item.namedPlanId||null,providerId:item.providerId||null,providerRouteId:item.providerRouteId||null,settingsManagerId:item.settingsManagerId||null,settingsDetailId:item.settingsDetailId||null,remediationMode:mode,ownerActionId:commandRoute?item.command:null,typedOwnerRouteId:typedRoute?item.typedOwnerRouteId:null,ownerRoute:item.route.slice(),returnRoute:['system','doctor'],returnScope:state.doctorScope||'all',returnFocusId:`doctor-remediation-${item.id}`,expectedOwnerGeneration:ownerGeneration,expectedCacheGeneration:cacheGeneration,idempotencyKey:`doctor-remediation:${item.id}:${findingRevision}:${ownerGeneration}:${cacheGeneration}`,ownerResultRequired:true,routeOnlyConceptPreview:typedRoute,productionMutationDispatched:false,browserProjectionOnly:true,openedAt:new Date().toISOString()};state.doctorReturnReceipt=null;state.doctorReturnRejected=null;saveState();
        if(item.ownerRouteTab==='plans')state.browserScmTab='plans';
        if(item.ownerRouteTab==='plugins'){state.toolTab='plugins';state.toolDetailTab.plugins=item.ownerDetailTab||'overview';}
        navigate(item.route[0],item.route[1]);showToast('Opened owning manager',`${item.owner} remains the only repair and mutation route.`,'info');return;
      }
      case 'doctor-return': {
        const ctx=state.doctorReturnContext;if(!ctx){showToast('Return context unavailable','No exact Doctor remediation context is active.','warning');return;}
        const rawBaseOwner=ds(el,'baseOwnerGeneration'),rawBaseCache=ds(el,'baseCacheGeneration'),rawOwner=ds(el,'ownerGeneration'),rawCache=ds(el,'cacheGeneration');
        const baseOwnerGeneration=Number(rawBaseOwner),baseCacheGeneration=Number(rawBaseCache),ownerGeneration=Number(rawOwner),cacheGeneration=Number(rawCache),findingRevision=Number(ds(el,'findingRevision'));
        const checkId=ds(el,'checkId'),findingId=ds(el,'findingId'),targetId=ds(el,'targetId'),ownerActionId=ds(el,'ownerActionId'),typedOwnerRouteId=ds(el,'typedOwnerRouteId'),idempotencyKey=ds(el,'idempotencyKey'),ownerResultRef=ds(el,'ownerResultRef').trim(),normalizedStatus=ds(el,'normalizedStatus'),freshnessState=ds(el,'freshnessState'),outcome=ds(el,'outcome');
        const acceptedStatuses=['healthy','needs_attention','blocked'];
        if(!ownerResultRef){state.doctorReturnRejected='owner_result_missing';saveState();showToast('Doctor return blocked','A nonempty owner-result reference is required.','warning');return;}
        if(!acceptedStatuses.includes(normalizedStatus)){state.doctorReturnRejected='owner_result_status_invalid';saveState();showToast('Doctor return blocked','The owner result status is not a normalized Doctor status.','warning');return;}
        if(outcome!=='succeeded'){state.doctorReturnRejected='owner_route_outcome_incomplete';saveState();showToast('Doctor return blocked','The owner route did not return a completed result.','warning');return;}
        const exactOwnerIdentity=ctx.remediationMode==='owner_command_route'?ownerActionId===ctx.ownerActionId&&typedOwnerRouteId==='':ctx.remediationMode==='typed_owner_route'?typedOwnerRouteId===ctx.typedOwnerRouteId&&ownerActionId==='':false;
        const exactIdentity=checkId===ctx.checkId&&findingId===ctx.findingId&&findingRevision===ctx.findingRevision&&targetId===ctx.targetId&&idempotencyKey===ctx.idempotencyKey&&exactOwnerIdentity;
        if(!exactIdentity){state.doctorReturnRejected='owner_result_identity_mismatch';saveState();showToast('Doctor return blocked','The owner result does not match the exact check, finding, target, action or route, and idempotency context.','warning');return;}
        const generationsPresent=[rawBaseOwner,rawBaseCache,rawOwner,rawCache].every(value=>value!==''),generationsValid=[baseOwnerGeneration,baseCacheGeneration,ownerGeneration,cacheGeneration].every(value=>Number.isInteger(value)&&value>=0);
        const current=ctx.ownerResultRequired===true&&generationsPresent&&generationsValid&&baseOwnerGeneration===ctx.expectedOwnerGeneration&&baseCacheGeneration===ctx.expectedCacheGeneration&&ownerGeneration>ctx.expectedOwnerGeneration&&cacheGeneration>ctx.expectedCacheGeneration&&freshnessState==='fresh';
        if(!current){state.doctorReturnRejected='owner_result_currentness_mismatch';saveState();showToast('Doctor return blocked','The exact owner result is stale or no longer matches the expected generations.','warning');return;}
        const resolved=normalizedStatus==='healthy',item=PM7_DOCTOR_FIXTURES.find(row=>`doctor-remediation-${row.id}`===ctx.returnFocusId);
        if(item){item.ownerGeneration=ownerGeneration;item.cacheGeneration=cacheGeneration;item.freshness='Just now';item.confidence='Fresh owner result accepted in browser fixture';item.status=resolved?'ready':normalizedStatus==='needs_attention'?'attention':'blocked';item.label=resolved?'Ready':normalizedStatus==='needs_attention'?'Needs attention':'Blocked';item.severity=resolved?'info':normalizedStatus==='needs_attention'?'warning':'critical';item.reason=resolved?'A fresh explicit healthy owner result matched the exact return context.':`A fresh exact owner result returned ${normalizedStatus}; remediation remains unresolved.`;item.effective=`Fresh owner result: ${normalizedStatus}`;}
        state.doctorScope=ctx.returnScope;state.doctorReturnReceipt={checkId:ctx.checkId,findingId:ctx.findingId,findingRevision:ctx.findingRevision,targetId:ctx.targetId,remediationMode:ctx.remediationMode,ownerActionId:ctx.ownerActionId,typedOwnerRouteId:ctx.typedOwnerRouteId,ownerRoute:ctx.ownerRoute.slice(),idempotencyKey:ctx.idempotencyKey,ownerResultRef,normalizedStatus,routeOutcome:outcome,returnRoute:ctx.returnRoute.slice(),returnScope:ctx.returnScope,returnFocusId:ctx.returnFocusId,baseOwnerGeneration,baseCacheGeneration,ownerGeneration,cacheGeneration,freshnessState,ownerResultAccepted:true,returnAccepted:true,remediationResolved:resolved,productionMutationDispatched:false,browserProjectionOnly:true,productionRuntimeState:'unavailable'};state.doctorReturnContext=null;state.doctorReturnRejected=null;saveState();navigate(ctx.returnRoute[0],ctx.returnRoute[1]);setTimeout(()=>document.getElementById(ctx.returnFocusId)?.focus(),0);return;
      }
      case 'replay-onboarding': if(window.PM7_ONBOARDING_CINEMATIC)window.PM7_ONBOARDING_CINEMATIC.replay({source_surface:ds(el,'sourceSurface')==='home_menu'?'home_menu':'settings_rerun'});else showToast('Onboarding unavailable','The authored onboarding module is not mounted.','warning');return;
      case 'start-guided-tour': if(window.PM7_GUIDED_TOUR&&typeof window.PM7_GUIDED_TOUR.start==='function')window.PM7_GUIDED_TOUR.start({source:'settings'});else showToast('Guided Tour unavailable','The live-shell tour module is not mounted.','warning');return;
      case 'browser-scm-tab': switchManagerTab(el);return;
      case 'pair-client': infoDrawer('Pair Client','Owner route only. Start one generation-fenced pairing run; no trust is granted and no raw QR/code material is persisted.',[['Command','cmd.client.pair.start'],['Native handler','Unavailable'],['Pairing secret','Ephemeral; not persisted'],['Trust','Not granted by start'],['Return','Exact paired-clients route and focus']]);return;
      case 'approve-pairing': infoDrawer('Approve pairing request','Owner route only. Explicit identity confirmation and a current waiting generation are required before least-privilege trust issuance.',[['Command','cmd.client.pair.approve'],['Native handler','Unavailable'],['Identity','Must be explicitly confirmed'],['Generation','Must remain current'],['Trust','No fixture mutation']]);return;
      case 'reject-pairing': infoDrawer('Reject pairing request','Owner route only. Rejection is the trusted approver\'s terminal refusal and is not requester cancellation.',[['Command','cmd.client.pair.reject'],['Native handler','Unavailable'],['Generation','Must remain current'],['Trust issued','No'],['Receipt','No production receipt']]);return;
      case 'cancel-pairing': infoDrawer('Cancel pairing','Owner route only. Cancellation is the requesting Client\'s explicit terminal abort; closing this Settings view dispatches nothing.',[['Command','cmd.client.pair.cancel'],['Native handler','Unavailable'],['Close view','Not cancellation'],['Cleanup','Owner required'],['Receipt','No production receipt']]);return;
      case 'revoke-client': infoDrawer('Revoke Client trust','Owner route only. Whole-Client trust revocation must terminate every active session and reject stale commands; session-only revocation is not substituted.',[['Command','cmd.client.revoke'],['Native handler','Unavailable'],['Scope','Whole ClientTrustRecord'],['Sessions','All active sessions'],['Receipt','No production receipt']]);return;
      case 'open-capture-policy': infoDrawer('Test Capture policy','Capture is explicit, bounded, redacted, receipt-backed, and separate from AuthBrowserSession.',[['Screenshots','Explicit only'],['Video FPS','Measured and disclosed'],['Console and network','Bounded and redacted'],['AuthBrowserSession','Never captured'],['Native certification','Not established by browser evidence']]);return;
      case 'preview-origin': infoDrawer('Cursor Origin Preview','A reversible SCM-flow insertion; no repository, remote, mirror, helper, or credential state changed.',[['Mode','Preview only'],['Origin CLI','Optional'],['Local history','Preserved'],['Mirror','Not created'],['Authentication','Human-only owner route'],['Receipt','No production receipt']]);return;
      case 'open-named-plan': infoDrawer('Named Plans','Concept projection only. Create, bind, inspect, and archive operations require the Named Plan owner.',[['Owner','Named Plan System'],['Project','Current project'],['Owner feed','Not attached'],['Mutation','Unavailable in concept']]);return;
      case 'open-planning-wizard': {const target=document.getElementById('tab-wizard')||document.querySelector('[data-page="wizard"]');if(target&&typeof target.click==='function')target.click();else showToast('Planning Wizard unavailable','The live owner route is not mounted.','warning');return;}
      case 'open-performance-evidence': infoDrawer('Performance evidence boundary','Browser measurements are useful prototype evidence but do not certify native Slint, compositor, network, server, or old-hardware performance.',[['Target frame','16.7 ms'],['Report','P50, P95, P99, delayed frames'],['Same-frame acknowledgement','Required'],['Native certification','Separate execution required']]);return;
'''


GLOBAL_SCRIPT = r'''
<script id="pm7-t46-systems-js">
/* PM7 T46: operational systems integration and K3 host adaptation */
(function(){
  'use strict';
  if(window.PM7_SYSTEMS_INTEGRATION)return;
  var shell=document.querySelector('.app-shell'),panel=document.getElementById('panel-settings'),chat=document.getElementById('chatPanel'),resizer=document.getElementById('chatResizer');
  var reservedChatWidth=0,shellWidth=0,panelWidth=0,chatWidth=0,resizerWidth=5,syncFrame=0;
  function settingsActive(){return !!(panel&&panel.classList.contains('active'));}
  function chatReservation(){
    if(!chat||chat.classList.contains('hidden'))return 0;
    if(chatWidth>0)reservedChatWidth=chatWidth;
    if(!(reservedChatWidth>0)){
      reservedChatWidth=shellWidth<=980?Math.max(320,Math.min(430,shellWidth*.46)):Math.max(380,Math.min(550,Math.min(680,shellWidth*.46)));
    }
    return reservedChatWidth+(resizer&&!resizer.classList.contains('hidden')?(resizerWidth||5):0);
  }
  function hostProjection(){
    var focused=document.body.classList.contains('pm7-settings-focus-host'),reservation=chatReservation();
    var width=panelWidth>0?panelWidth:Math.max(0,shellWidth-reservation);
    return {settings_active:settingsActive(),shell_width:shellWidth,panel_width:width,focused:focused,chat_reservation:reservation,projected_with_chat:focused?Math.max(0,width-reservation):width,threshold:980};
  }
  function syncHost(){
    var projection=hostProjection();
    var shouldFocus=projection.settings_active&&projection.shell_width>0&&projection.projected_with_chat<projection.threshold;
    var focusChanged=projection.focused!==shouldFocus;
    document.body.classList.toggle('pm7-settings-focus-host',shouldFocus);
    /* Focus-host chrome can move the active page tab after the shared density
       pass. Re-snap its presentation-only ink on the next paint so the hidden
       indicator never widens the document's scrollable overflow area. */
    if(focusChanged&&window.PM7_PAGE_TAB_INK&&typeof window.PM7_PAGE_TAB_INK.resync==='function')requestAnimationFrame(function(){window.PM7_PAGE_TAB_INK.resync();});
    return Object.assign({},projection,{focused:shouldFocus});
  }
  function scheduleSyncHost(){if(syncFrame)return;syncFrame=requestAnimationFrame(function(){syncFrame=0;syncHost();});}
  function observeWidth(element,assign){
    if(!element||typeof ResizeObserver!=='function')return;
    new ResizeObserver(function(entries){var width=entries[entries.length-1]&&entries[entries.length-1].contentRect?entries[entries.length-1].contentRect.width:0;assign(width);scheduleSyncHost();}).observe(element);
  }
  function dispatchSettings(commandId,payload,continuation){
    var tome=window.PM7_SETTINGS_TOME;
    if(!tome||typeof tome.dispatch!=='function')return {mode:'blocked_owner_bridge',command_id:commandId};
    return tome.dispatch(commandId,payload||{},continuation||{return_surface:'settings'});
  }
  window.PM7_SETTINGS_COMMANDS={
    schema_id:'pm.settings.command_bridge.v1',
    open:function(route){var tab=document.getElementById('tab-settings');if(tab)tab.click();if(route&&window.PM12_KIMI)window.PM12_KIMI.navigate(route.domain,route.workspace,route.options||{});return {command_id:'cmd.settings.open',route:route||null};},
    preview:function(payload){return dispatchSettings('cmd.settings.transaction.preview',payload);},
    apply:function(payload){return dispatchSettings('cmd.settings.transaction.apply',payload);},
    rollback:function(payload){return dispatchSettings('cmd.settings.transaction.rollback',payload);},
    export:function(payload){return dispatchSettings('cmd.settings.export',payload);}
  };
  var browserProgramPrerequisites=Object.freeze(['policy','capability','explicit_user_action']);
  var browserProgramDescriptor=Object.freeze({
    projection_only:true,
    runtime_state:'runtime_unavailable',
    native_cef_executed:false,
    ordinary_browser_only:true,
    auth_browser_session:'excluded',
    prerequisites:browserProgramPrerequisites,
    execution_methods:0,
    raw_protocol_access:false,
    arbitrary_page_code:false
  });
  Object.defineProperty(window,'PM7_BROWSER_PROGRAM',{value:browserProgramDescriptor,writable:false,configurable:false,enumerable:true});
  window.PM7_SYSTEMS_INTEGRATION={schema_id:'pm.pmconcept7.systems_projection.v1',simulation_only:true,production_runtime_state:'unavailable',native_runtime_state:'unavailable',sync_host:syncHost,host_projection:hostProjection,settings_commands:window.PM7_SETTINGS_COMMANDS,server_gap_consumers:window.PM7_SERVER_GAP_CONSUMERS,doctor_fixture_model:function(){return JSON.parse(JSON.stringify(window.PM7_DOCTOR_CLOSURE_MODEL));},doctor_status_catalog:function(){return window.PM7_DOCTOR_STATUS_CATALOG.slice();},doctor_domain_catalog:function(){return window.PM7_DOCTOR_DOMAIN_IDS.slice();},doctor_work_projection:function(){return JSON.parse(JSON.stringify(window.PM7_DOCTOR_WORK_PROJECTION()));},return_to_doctor:function(result){if(!window.PM12_KIMI)return {mode:'blocked_owner_bridge'};var payload=result||{};window.PM12_KIMI.dispatchAction('doctor-return',{checkId:payload.checkId,findingId:payload.findingId,findingRevision:payload.findingRevision,targetId:payload.targetId,ownerActionId:payload.ownerActionId,typedOwnerRouteId:payload.typedOwnerRouteId,idempotencyKey:payload.idempotencyKey,ownerResultRef:payload.ownerResultRef,normalizedStatus:payload.normalizedStatus,outcome:payload.outcome,baseOwnerGeneration:payload.baseOwnerGeneration,baseCacheGeneration:payload.baseCacheGeneration,ownerGeneration:payload.ownerGeneration,cacheGeneration:payload.cacheGeneration,freshnessState:payload.freshnessState});return {mode:'browser_concept_return_requested',browser_projection_only:true,production_runtime_state:'unavailable'};}};
  shellWidth=shell?shell.clientWidth:0;panelWidth=panel?panel.clientWidth:0;chatWidth=chat?chat.clientWidth:0;resizerWidth=resizer?(resizer.clientWidth||5):5;
  observeWidth(shell,function(width){shellWidth=width;});
  observeWidth(panel,function(width){panelWidth=width;});
  observeWidth(chat,function(width){if(width>0)chatWidth=width;});
  observeWidth(resizer,function(width){if(width>0)resizerWidth=width;});
  if(panel&&typeof MutationObserver==='function')new MutationObserver(syncHost).observe(panel,{attributes:true,attributeFilter:['class']});
  if(chat&&typeof MutationObserver==='function')new MutationObserver(syncHost).observe(chat,{attributes:true,attributeFilter:['class','style']});
  syncHost();
})();
</script>'''


HOME_BACKUP_ROW = '''          <button class="setup-row" data-action="navigate" data-domain="system" data-workspace="backup"><span class="setup-icon">${icon('archive')}</span><span class="setup-copy"><span class="setup-label">Backup & Restore</span><span class="setup-meta">Last backup verified today · 2 schedules enabled</span></span>${icon('chevron')}</button>'''


HOME_LEARN_ROWS = HOME_BACKUP_ROW + r'''
          <button class="setup-row" data-action="replay-onboarding" data-source-surface="home_menu" data-ui-action-id="settings.onboarding.run_again"><span class="setup-icon">${icon('home')}</span><span class="setup-copy"><span class="setup-label">Run setup wizard</span><span class="setup-meta">Start or replay the simple guided setup</span></span>${icon('chevron')}</button>
          <button class="setup-row" data-action="start-guided-tour" data-ui-action-id="settings.guided_tour.replay"><span class="setup-icon">${icon('play')}</span><span class="setup-copy"><span class="setup-label">Guided Tour</span><span class="setup-meta">Learn the live workspace with a local teacher</span></span>${icon('chevron')}</button>'''


ALLOWED_EFFECT_DELTA = {
    "command_ids": {
        "added": [
            "cmd.agent_plugin.disable",
            "cmd.agent_plugin.enable",
            "cmd.agent_plugin.install",
            "cmd.agent_plugin.open_details",
            "cmd.agent_plugin.open_logs",
            "cmd.agent_plugin.reload",
            "cmd.agent_plugin.remove",
            "cmd.agent_plugin.review_changes",
            "cmd.agent_plugin.rollback",
            "cmd.agent_plugin.scan",
            "cmd.agent_plugin.update",
            "cmd.agent_plugin.validate",
            "cmd.auth_profile.rename",
            "cmd.auth_profile.revoke",
            "cmd.auth_profile.transfer.apply",
            "cmd.auth_profile.transfer.preview",
            "cmd.backup.destination.add",
            "cmd.backup.destination.test",
            "cmd.backup.open_details",
            "cmd.backup.policy.update",
            "cmd.backup.server.create",
            "cmd.backup.verify",
            "cmd.browser.program.inspect",
            "cmd.client.access.update",
            "cmd.client.pair.approve",
            "cmd.client.pair.cancel",
            "cmd.client.pair.reject",
            "cmd.client.remove",
            "cmd.client.rename",
            "cmd.client.revoke",
            "cmd.client.session.revoke",
            "cmd.credential_attachment.revoke",
            "cmd.credential_attachment.revoke_active",
            "cmd.credential_attachment.test",
            "cmd.credential_attachment.transfer.apply",
            "cmd.credential_attachment.transfer.preview",
            "cmd.credential_source.add",
            "cmd.credential_source.remove",
            "cmd.credential_source.test",
            "cmd.doctor.export_report",
            "cmd.execution_environment.attach",
            "cmd.execution_environment.discover",
            "cmd.execution_environment.provision",
            "cmd.execution_environment.remove",
            "cmd.execution_environment.repair",
            "cmd.execution_environment.resource_policy.apply",
            "cmd.execution_environment.resource_policy.preview",
            "cmd.execution_environment.restart",
            "cmd.execution_environment.rollback",
            "cmd.execution_environment.select",
            "cmd.execution_environment.start",
            "cmd.execution_environment.stop",
            "cmd.execution_environment.update",
            "cmd.execution_environment.verify",
            "cmd.execution_host.capabilities.refresh",
            "cmd.execution_host.disable",
            "cmd.execution_host.drain",
            "cmd.execution_host.enable",
            "cmd.execution_host.register",
            "cmd.execution_host.remove",
            "cmd.execution_host.set_default",
            "cmd.execution_host.test",
            "cmd.goal.checkpoint",
            "cmd.goal.continue_on_host",
            "cmd.goal.handoff.cancel",
            "cmd.goal.handoff.retry",
            "cmd.goal.pause",
            "cmd.goal.resume_here",
            "cmd.installation.attach_external",
            "cmd.installation.detach_external",
            "cmd.installation.remove",
            "cmd.integration.connection.open_details",
            "cmd.integration.connection.remove",
            "cmd.integration.connection.update",
            "cmd.named_plan.open",
            "cmd.project.duplicate_configuration",
            "cmd.project.duplicate_with_history",
            "cmd.project.execution_policy.set",
            "cmd.project.move.cancel",
            "cmd.project.move.pause",
            "cmd.project.move.preflight",
            "cmd.project.move.resume",
            "cmd.project.move.retry",
            "cmd.project.move.rollback",
            "cmd.project.move.start",
            "cmd.project.source_location.remove",
            "cmd.project.source_location.update",
            "cmd.project_template.create_project",
            "cmd.project_template.delete",
            "cmd.project_template.rename",
            "cmd.project_template.save",
            "cmd.provider_binding.copy",
            "cmd.provider_binding.resolve_on_destination",
            "cmd.remote_access.route.open_details",
            "cmd.server.open_details",
            "cmd.settings.export",
            "cmd.settings.transaction.rollback",
            "cmd.source_control.checkpoint.create",
            "cmd.source_control.checkpoint.inspect",
            "cmd.source_control.checkpoint.restore",
            "cmd.source_control.workspace.create",
            "cmd.source_control.workspace.remove",
            "cmd.source_control.workspace.switch",
            "cmd.tool_package.approve_license",
            "cmd.update.app.automatic.set_enabled",
            "cmd.update.app.cancel_download",
            "cmd.update.app.check",
            "cmd.update.app.download",
            "cmd.update.app.install_restart",
            "cmd.update.app.remind_later",
            "cmd.update.app.rollback",
            "cmd.update.content.activate",
            "cmd.update.content.check",
            "cmd.update.content.download",
            "cmd.update.content.rollback",
        ],
        "removed": [],
    },
    "domain_event_ids": {"added": [], "removed": []},
    "dom_event_types": {"added": [], "removed": []},
    "persistence_targets": {"added": [], "removed": []},
}


def apply(doc, notes, need):
    """Apply T46 after T45 and emit fail-closed effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T46: transform already applied")
    for onboarding_owner_action in (
        "cmd.restore.preview",
        "cmd.server.claim",
        "cmd.server.bootstrap.start",
        "cmd.client.pair.start",
    ):
        need(
            onboarding_owner_action in doc,
            "T46: T45 owner-action metadata missing before systems consumption: %s"
            % onboarding_owner_action,
        )
    need("PM7 Product Onboarding: simple cinematic guided setup" in doc, "T46: T45 marker missing")
    effects_before = capture_effect_surfaces(doc)

    doc = _replace_once(doc, "</head>", SYSTEMS_CSS + "\n</head>", need, "systems CSS")
    doc = _replace_band(doc, "  function renderDoctor(){", "  function renderServers(){", DOCTOR_RENDER, need, "operational Doctor")
    doc = _replace_band(doc, "  function renderBrowserScm(){", "  function renderSourceControl(){", BROWSER_SCM_RENDER, need, "Browser SCM consumers")
    doc = _replace_band(
        doc,
        "  function renderPluginDetail(item,tab) {",
        "  function renderAgentToolDetail(item,tab) {",
        PLUGIN_RENDER,
        need,
        "Plugins System owner projection",
    )
    doc = _replace_in_band(
        doc,
        "  function renderToolchain() {",
        "  function renderToolchainBody() {",
        '''<button class="btn" data-action="toolchain-discover">${icon('search')} Discover project tools</button><button class="btn primary" data-action="add-tool-resource" data-kind="${state.toolTab}">${icon('plus')} Add ${escapeHtml(toolSingular(state.toolTab))}</button>''',
        "${renderToolchainHeaderActions()}",
        1,
        need,
        "plugin-aware Toolchain header actions",
    )
    doc = _replace_in_band(
        doc,
        "  function renderToolchainBody() {",
        "  function toolSingular(kind) {",
        '''<button class="icon-btn" data-action="add-tool-resource" data-kind="${state.toolTab}">${icon('plus')}</button>''',
        "${renderToolchainRosterAction()}",
        1,
        need,
        "plugin-aware Toolchain roster action",
    )
    doc = _replace_in_band(
        doc,
        "  function renderToolchainBody() {",
        "  function toolSingular(kind) {",
        "${selected ? renderToolDetail(selected,state.toolTab) : emptyManager('No resources configured','Add or discover a project resource to configure it.',`Add ${toolSingular(state.toolTab)}`,'add-tool-resource',{kind:state.toolTab})}",
        "${selected ? renderToolDetail(selected,state.toolTab) : state.toolTab==='plugins' ? pluginEmptyState() : emptyManager('No resources configured','Add or discover a project resource to configure it.',`Add ${toolSingular(state.toolTab)}`,'add-tool-resource',{kind:state.toolTab})}",
        1,
        need,
        "plugin fail-closed empty state",
    )
    doc = _replace_in_band(
        doc,
        "  function renderToolDetail(item,kind) {",
        "  function toolDetailSubtitle(item,kind) {",
        '''<div class="resource-actions"><button class="btn" data-action="test-tool-resource" data-kind="${kind}" data-id="${item.id}">${icon('test')}<span class="btn-label">Test</span></button><button class="btn primary" data-action="edit-tool-resource" data-kind="${kind}" data-id="${item.id}">${icon('edit')}<span class="btn-label">Edit</span></button><button class="icon-btn" data-action="tool-resource-menu" data-kind="${kind}" data-id="${item.id}">${icon('more')}</button></div>''',
        "${renderToolResourceActions(item,kind)}",
        1,
        need,
        "plugin-aware resource header actions",
    )
    doc = _replace_once(
        doc,
        "    if(kind==='mcps') return [{id:'overview',label:'Overview'},{id:'connection',label:'Connection'},{id:'tools',label:'Tools & Permissions'},{id:'logs',label:'Test & Logs'}];\n    return [{id:'overview',label:'Overview'},{id:'settings',label:'Configuration'},{id:'diagnostics',label:'Diagnostics'}];",
        "    if(kind==='mcps') return [{id:'overview',label:'Overview'},{id:'connection',label:'Connection'},{id:'tools',label:'Tools & Permissions'},{id:'logs',label:'Test & Logs'}];\n    if(kind==='plugins') return [{id:'overview',label:'Overview'},{id:'updates',label:'Updates'},{id:'access',label:'Access & Runtime'},{id:'evidence',label:'Integrity & Evidence'}];\n    return [{id:'overview',label:'Overview'},{id:'settings',label:'Configuration'},{id:'diagnostics',label:'Diagnostics'}];",
        need,
        "plugin detail tabs",
    )
    doc = _replace_once(
        doc,
        "    else if (action === 'backup-tab') state.backupTab = tab;\n    else if (action === 'updates-tab') state.updatesTab = tab;",
        "    else if (action === 'backup-tab') state.backupTab = tab;\n    else if (action === 'server-tab') state.serverTab = tab;\n    else if (action === 'browser-scm-tab') state.browserScmTab = tab;\n    else if (action === 'updates-tab') state.updatesTab = tab;",
        need,
        "manager tab state routing",
    )
    doc = _replace_once(
        doc,
        "      case 'backup-tab': html = renderBackupTab(); break;\n      case 'updates-tab': html = renderUpdatesTab(); break;",
        "      case 'backup-tab': html = renderBackupTab(); break;\n      case 'server-tab': html = renderServerTab()+pm7ExecutionConsumerPanel(); break;\n      case 'browser-scm-tab': html = renderBrowserScmTab(); break;\n      case 'updates-tab': html = renderUpdatesTab()+pm7UpdateConsumerPanel(); break;",
        need,
        "direct Server and Browser/SCM manager tab rendering",
    )
    doc = _replace_once(
        doc,
        '<div class="resource-content">${provider.id === \'free-models\' ? renderFreeModels(provider) : renderProviderTab(provider)}</div>',
        '<div class="resource-content">${provider.id === \'free-models\' ? renderFreeModels(provider) : renderProviderTab(provider)+(state.providerTab===\'advanced\'?pm7IntegrationConsumerPanel(provider):\'\')}</div>',
        need,
        "provider owner-local consumer panel",
    )
    doc = _replace_once(
        doc,
        "case 'provider-tab': case 'provider-tab-jump': { const p = providerById(); html = p.id === 'free-models' ? renderFreeModels(p) : renderProviderTab(p); break; }",
        "case 'provider-tab': case 'provider-tab-jump': { const p = providerById(); html = p.id === 'free-models' ? renderFreeModels(p) : renderProviderTab(p)+(state.providerTab==='advanced'?pm7IntegrationConsumerPanel(p):''); break; }",
        need,
        "provider tab owner-local consumer panel",
    )
    doc = _replace_in_band(
        doc,
        "  function renderGoals() {",
        "  function renderPersonas() {",
        "${renderGoalTab()}",
        "${renderGoalTab()}${pm7GoalConsumerPanel()}",
        1,
        need,
        "Goal handoff local-action panel",
    )
    doc = _replace_once(
        doc,
        "      case 'goal-tab': html = renderGoalTab(); break;",
        "      case 'goal-tab': html = renderGoalTab()+pm7GoalConsumerPanel(); break;",
        need,
        "Goal tab local-action panel",
    )
    doc = _annotate_action_in_band(
        doc,
        "  function renderGoals() {",
        "  function renderPersonas() {",
        "pause-goal",
        'data-command-id="cmd.goal.pause" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"',
        1,
        need,
        "Goal pause exact command rebind",
    )
    doc = _replace_once(
        doc,
        "${managerTabs(tabs,state.serverTab,'server-tab')}",
        "${managerTabs(tabs,state.serverTab,'server-tab').replaceAll('data-action=\"server-tab\"','data-action=\"server-tab\" data-ui-action-id=\"ui.settings.server_tab.select\" data-availability=\"available\"')}",
        need,
        "typed Server manager tabs",
    )
    doc = _replace_once(
        doc,
        'data-action="server-tab" data-tab="diagnostics"',
        'data-action="server-tab" data-ui-action-id="ui.settings.server_tab.select" data-availability="available" data-tab="diagnostics"',
        need,
        "typed Server diagnostics shortcut",
    )
    server_start = "  function renderServers(){"
    server_end = "  function renderUpdates(){"
    for action, attributes, expected in (
        ("open-server-claim", 'data-command-id="cmd.server.claim" data-availability="owner_unavailable_concept_preview"', 2),
        ("open-server-bootstrap", 'data-command-id="cmd.server.bootstrap.start" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable"', 2),
        ("add-server-host", 'data-command-id="cmd.execution_host.register" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
        ("edit-server-host", 'data-ui-action-id="ui.settings.server_host.preview_edit" data-availability="concept_preview_only"', 3),
        ("verify-server-host", 'data-command-id="cmd.execution_host.test" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 4),
    ):
        doc = _annotate_action_in_band(
            doc,
            server_start,
            server_end,
            action,
            attributes,
            expected,
            need,
            "Server %s control metadata" % action,
        )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        '>Open project clients</button></div><div class="workflow-list">',
        '>Open project clients</button><button class="btn primary" data-action="pair-client" data-command-id="cmd.client.pair.start" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Pair Client</button></div><div class="workflow-list">',
        1,
        need,
        "Server Pair Client owner-command consumer",
    )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        '</div></section><section class="panel-card"><div class="panel-title">Continuity projection</div>',
        '</div><div class="table-actions" data-pairing-request-fixture="owner-unavailable"><button class="btn small" data-action="approve-pairing" data-command-id="cmd.client.pair.approve" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Approve request</button><button class="btn small" data-action="reject-pairing" data-command-id="cmd.client.pair.reject" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Reject request</button><button class="btn small" data-action="cancel-pairing" data-command-id="cmd.client.pair.cancel" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Cancel pairing</button><button class="btn small" data-action="revoke-client" data-command-id="cmd.client.revoke" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Revoke trust</button></div></section><section class="panel-card"><div class="panel-title">Continuity projection</div>',
        1,
        need,
        "Server pairing approval rejection cancellation and revocation consumers",
    )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        'data-action="navigate" data-domain="projects" data-workspace="project-sync"',
        'data-action="navigate" data-ui-action-id="ui.settings.route.open" data-availability="available" data-domain="projects" data-workspace="project-sync"',
        2,
        need,
        "Server Project Sync route metadata",
    )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        'data-action="navigate" data-domain="system" data-workspace="backup"',
        'data-action="navigate" data-ui-action-id="ui.settings.route.open" data-availability="available" data-domain="system" data-workspace="backup"',
        1,
        need,
        "Server Backup route metadata",
    )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        ",'open-project-client',{id:c.id}",
        ",'open-project-client',{id:c.id,'ui-action-id':'ui.client.open_details',availability:'concept_local_controller_available','disabled-reason':'none','production-handler-status':'handler_unavailable','concept-simulation-only':'true','native-binding':'false','exact-return':'initiating_route_focus_identity_currentness','event-record':'not_emitted','runtime-receipt':'not_issued','production-mutation-dispatched':'false'}",
        1,
        need,
        "Server client fixture detail metadata",
    )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        ",'open-server-check',{id:",
        ",'open-server-check',{'command-id':'cmd.server.open_details',availability:'owner_unavailable_concept_preview',id:",
        5,
        need,
        "Server diagnostic detail metadata",
    )
    doc = _replace_in_band(
        doc,
        server_start,
        server_end,
        "${renderServerTab()}",
        "${renderServerTab()}${pm7ExecutionConsumerPanel()}",
        1,
        need,
        "Server host/environment local-action panel",
    )

    project_sync_start = "  function renderProjectSync(){"
    project_sync_end = "  function renderBackup(){"
    doc = _replace_in_band(
        doc,
        project_sync_start,
        project_sync_end,
        "${managerTabs(tabs,state.projectSyncTab,'project-sync-tab')}",
        "${managerTabs(tabs,state.projectSyncTab,'project-sync-tab').replaceAll('data-action=\"project-sync-tab\"','data-action=\"project-sync-tab\" data-ui-action-id=\"ui.settings.project_sync_tab.select\" data-availability=\"available\"')}",
        1,
        need,
        "typed Project Sync manager tabs",
    )
    for action, attributes, expected in (
        ("test-project-sync", 'data-ui-action-id="ui.settings.project_sync.continuity.preview" data-availability="concept_preview_only"', 1),
        ("add-project-location", 'data-command-id="cmd.project.source_location.add" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 2),
        ("manage-clients", 'data-ui-action-id="ui.settings.project_sync.clients.preview_manage" data-availability="concept_preview_only"', 1),
        ("edit-continuity", 'data-ui-action-id="ui.settings.project_sync.continuity.preview_edit" data-availability="concept_preview_only"', 1),
        ("add-ssh-remote", 'data-ui-action-id="ui.settings.project_sync.remote.preview_add" data-availability="concept_preview_only"', 1),
        ("import-remote-project", 'data-ui-action-id="ui.settings.project_sync.remote.preview_import" data-availability="concept_preview_only"', 1),
        ("edit-ssh-remote", 'data-ui-action-id="ui.settings.project_sync.remote.preview_edit" data-availability="concept_preview_only"', 1),
        ("test-ssh-remote", 'data-ui-action-id="ui.settings.project_sync.remote.preview_test" data-availability="concept_preview_only"', 1),
        ("toggle-ssh-remote", 'data-ui-action-id="ui.settings.project_sync.remote.preview_toggle" data-availability="concept_preview_only"', 1),
        ("remove-ssh-remote", 'data-ui-action-id="ui.settings.project_sync.remote.preview_remove" data-availability="concept_preview_only"', 1),
        ("move-project", 'data-ui-action-id="ui.project.move.open_details" data-availability="concept_local_controller_available" data-disabled-reason="none" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false"', 1),
        ("copy-project", 'data-ui-action-id="ui.settings.project_sync.project.preview_copy" data-availability="concept_preview_only"', 1),
        ("edit-conflict-policy", 'data-ui-action-id="ui.settings.project_sync.conflict.preview_policy" data-availability="concept_preview_only"', 1),
        ("simulate-sync-conflict", 'data-ui-action-id="ui.settings.project_sync.conflict.preview_simulation" data-availability="concept_preview_only"', 1),
        ("run-project-sync-diagnostics", 'data-ui-action-id="ui.settings.project_sync.diagnostics.preview_run" data-availability="concept_preview_only"', 1),
        ("export-project-sync-report", 'data-ui-action-id="ui.settings.project_sync.diagnostics.preview_export" data-availability="concept_preview_only"', 1),
        ("edit-project-location", 'data-command-id="cmd.project.source_location.update" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
    ):
        doc = _annotate_action_in_band(
            doc,
            project_sync_start,
            project_sync_end,
            action,
            attributes,
            expected,
            need,
            "Project Sync %s control metadata" % action,
        )
    doc = _replace_in_band(
        doc,
        project_sync_start,
        project_sync_end,
        '<button class="btn primary" data-action="move-project" data-ui-action-id="ui.project.move.open_details" data-availability="concept_local_controller_available" data-disabled-reason="none" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false">${icon(\'arrowRight\')} Configure move</button>',
        "${pm7ConsumerButton('local','ui.project.move.open_details','Move details')}${pm7ConsumerButton('command','cmd.project.move.preflight','Preflight move')}${pm7ConsumerButton('command','cmd.project.move.start','Start move')}",
        1,
        need,
        "Project Move exact local/preflight/start controls",
    )
    doc = _replace_in_band(
        doc,
        project_sync_start,
        project_sync_end,
        '<button class="btn" data-action="copy-project" data-ui-action-id="ui.settings.project_sync.project.preview_copy" data-availability="concept_preview_only">${icon(\'copy\')} Configure copy</button>',
        "${pm7ConsumerButton('command','cmd.project.duplicate_configuration','Copy configuration')}${pm7ConsumerButton('command','cmd.project.duplicate_with_history','Copy with history')}",
        1,
        need,
        "Project duplicate exact mode controls",
    )
    for old, new, expected, label in (
        (",'open-project-client',{id:c.id}", ",'open-project-client',{'ui-action-id':'ui.client.open_details',availability:'concept_local_controller_available','disabled-reason':'none','production-handler-status':'handler_unavailable','concept-simulation-only':'true','native-binding':'false','exact-return':'initiating_route_focus_identity_currentness','event-record':'not_emitted','runtime-receipt':'not_issued','production-mutation-dispatched':'false',id:c.id}", 2, "Project Sync client detail metadata"),
        (",'edit-project-location',{id:r.id}", ",'edit-project-location',{'command-id':'cmd.project.source_location.update',availability:'handler_unavailable','disabled-reason':'handler_unavailable','production-handler-status':'handler_unavailable','concept-simulation-only':'true','native-binding':'false','exact-return':'initiating_route_focus_identity_currentness','event-record':'not_emitted','runtime-receipt':'not_issued','production-mutation-dispatched':'false',id:r.id}", 1, "Project Sync location detail metadata"),
        (",'open-project-sync-diagnostic',{id:slug(x)}", ",'open-project-sync-diagnostic',{'ui-action-id':'ui.settings.project_sync.diagnostic.inspect',availability:'concept_preview_only',id:slug(x)}", 1, "Project Sync diagnostic detail metadata"),
        ('data-action="project-sync-tab" data-tab="clients"', 'data-action="project-sync-tab" data-ui-action-id="ui.settings.project_sync_tab.select" data-availability="available" data-tab="clients"', 1, "Project Sync direct continuity-tab metadata"),
    ):
        doc = _replace_in_band(doc, project_sync_start, project_sync_end, old, new, expected, need, label)
    doc = _replace_in_band(
        doc,
        project_sync_start,
        project_sync_end,
        "${renderProjectSyncTab()}",
        "${renderProjectSyncTab()}${pm7ProjectConsumerPanel()}",
        1,
        need,
        "Project owner-local consumer panel",
    )
    doc = _replace_once(
        doc,
        "      case 'project-sync-tab': html = renderProjectSyncTab(); break;",
        "      case 'project-sync-tab': html = renderProjectSyncTab()+pm7ProjectConsumerPanel(); break;",
        need,
        "Project Sync tab owner-local consumer panel",
    )
    source_control_start = "  function renderSourceControl(){"
    source_control_end = "  function renderNotifications(){"
    for action, attributes, expected in (
        ("create-worktree", 'data-command-id="cmd.source_control.workspace.create" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
        ("open-worktree", 'data-command-id="cmd.source_control.workspace.switch" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
    ):
        doc = _annotate_action_in_band(
            doc,
            source_control_start,
            source_control_end,
            action,
            attributes,
            expected,
            need,
            "Source Control %s exact command rebind" % action,
        )

    updates_start = "  function renderUpdates(){"
    updates_end = "  /* ----- interaction layer"
    for action, attributes, expected in (
        ("check-for-updates", 'data-command-id="cmd.update.app.check" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
        ("edit-update-settings", 'data-command-id="cmd.update.app.automatic.set_enabled" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
        ("preview-update", 'data-ui-action-id="ui.update.app.open_details" data-availability="concept_local_controller_available" data-disabled-reason="none" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false"', 1),
        ("rollback-update", 'data-command-id="cmd.update.app.rollback" data-availability="handler_unavailable" data-disabled-reason="handler_unavailable" data-production-handler-status="handler_unavailable" data-concept-simulation-only="true" data-native-binding="false" data-exact-return="initiating_route_focus_identity_currentness" data-event-record="not_emitted" data-runtime-receipt="not_issued" data-production-mutation-dispatched="false" aria-disabled="true"', 1),
    ):
        doc = _annotate_action_in_band(
            doc,
            updates_start,
            updates_end,
            action,
            attributes,
            expected,
            need,
            "Updates %s exact consumer rebind" % action,
        )
    doc = _replace_in_band(
        doc,
        updates_start,
        updates_end,
        "${renderUpdatesTab()}",
        "${renderUpdatesTab()}${pm7UpdateConsumerPanel()}",
        1,
        need,
        "Updates owner-local consumer panel",
    )

    backup_start = "  function renderBackup(){"
    backup_end = "  const PM7_DOCTOR_STATUS_CATALOG="
    doc = _replace_in_band(
        doc,
        backup_start,
        backup_end,
        "${managerTabs(tabs,state.backupTab,'backup-tab')}",
        "${managerTabs(tabs,state.backupTab,'backup-tab').replaceAll('data-action=\"backup-tab\"','data-action=\"backup-tab\" data-ui-action-id=\"ui.settings.backup_tab.select\" data-availability=\"available\"')}",
        1,
        need,
        "typed Backup manager tabs",
    )
    for action, attributes, expected in (
        ("verify-latest-backup", 'data-command-id="cmd.backup.verify" data-availability="owner_unavailable_concept_preview"', 1),
        ("run-backup", 'data-command-id="cmd.backup.server.create" data-availability="owner_unavailable_concept_preview"', 1),
        ("add-backup-destination", 'data-command-id="cmd.backup.destination.add" data-availability="owner_unavailable_concept_preview"', 1),
        ("backup-destination-menu", 'data-ui-action-id="ui.settings.backup_destination.menu.open" data-availability="available"', 1),
        ("add-backup-schedule", 'data-command-id="cmd.backup.policy.update" data-availability="owner_unavailable_concept_preview"', 1),
        ("toggle-backup-schedule", 'data-command-id="cmd.backup.policy.update" data-availability="owner_unavailable_concept_preview"', 1),
        ("edit-backup-schedule", 'data-command-id="cmd.backup.policy.update" data-availability="owner_unavailable_concept_preview"', 1),
        ("edit-backup-retention", 'data-command-id="cmd.backup.policy.update" data-availability="owner_unavailable_concept_preview"', 1),
        ("review-backup-cleanup", 'data-ui-action-id="ui.settings.backup_cleanup.inspect" data-availability="concept_preview_only"', 1),
        ("start-restore", 'data-command-id="cmd.restore.preview" data-availability="owner_unavailable_concept_preview"', 1),
        ("configure-granular-restore", 'data-command-id="cmd.restore.preview" data-availability="owner_unavailable_concept_preview"', 1),
        ("export-backup-history", 'data-ui-action-id="ui.settings.backup_history.preview_export" data-availability="concept_preview_only"', 1),
        ("open-backup-receipt", 'data-command-id="cmd.backup.open_details" data-availability="owner_unavailable_concept_preview"', 2),
        ("backup-receipt-menu", 'data-ui-action-id="ui.settings.backup_receipt.menu.open" data-availability="available"', 1),
        ("view-backup-coverage", 'data-command-id="cmd.backup.open_details" data-availability="owner_unavailable_concept_preview"', 1),
    ):
        doc = _annotate_action_in_band(
            doc,
            backup_start,
            backup_end,
            action,
            attributes,
            expected,
            need,
            "Backup %s control metadata" % action,
        )
    doc = _replace_in_band(
        doc,
        backup_start,
        backup_end,
        ",'test-backup-destination',{id:d.id}",
        ",'test-backup-destination',{'command-id':'cmd.backup.destination.test',availability:'owner_unavailable_concept_preview',id:d.id}",
        1,
        need,
        "Backup destination test metadata",
    )
    doc = _replace_in_band(
        doc,
        backup_start,
        backup_end,
        ",'open-restore-step',{id:",
        ",'open-restore-step',{'ui-action-id':'ui.settings.restore_step.inspect',availability:'concept_preview_only',id:",
        4,
        need,
        "Backup restore safeguard metadata",
    )
    doc = _replace_once(doc, "      /* Readiness projection, server claim/bootstrap, and updates */", HANDLER_CASES + "\n      /* Readiness projection, server claim/bootstrap, and updates */", need, "Doctor and plugin consumer handlers")
    doc = _replace_once(
        doc,
        "      case 'add-tool-resource': editToolResource(ds(el,'kind'));return;",
        "      case 'add-tool-resource': if(ds(el,'kind')==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.install',null);return;}editToolResource(ds(el,'kind'));return;",
        need,
        "legacy plugin add fail-closed guard",
    )
    doc = _replace_once(
        doc,
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(item)editToolResource(kind,item);return;",
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.review_changes',item);return;}if(item)editToolResource(kind,item);return;",
        need,
        "legacy plugin edit fail-closed guard",
    )
    doc = _replace_once(
        doc,
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;\n        const specifics=kind==='lsps'?",
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;\n        if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.validate',item);return;}\n        const specifics=kind==='lsps'?",
        need,
        "legacy plugin test fail-closed guard",
    )
    doc = _replace_once(
        doc,
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;confirmDialog(`Remove ${item.name}`",
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.remove',item);return;}confirmDialog(`Remove ${item.name}`",
        need,
        "legacy plugin removal fail-closed guard",
    )
    doc = _replace_once(
        doc,
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;openMenu(el,[{label:'Edit configuration'",
        "        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.open_details',item);return;}openMenu(el,[{label:'Edit configuration'",
        need,
        "legacy plugin menu fail-closed guard",
    )
    doc = _replace_once(
        doc,
        "      case 'toolchain-discover': taskDrawer('Discover project toolchain'",
        "      case 'toolchain-discover': if(state.toolTab==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.scan',null);return;}taskDrawer('Discover project toolchain'",
        need,
        "legacy plugin discovery fail-closed guard",
    )
    doc = _replace_band(
        doc,
        "      case 'manage-plugin-permissions': {",
        "      case 'toolchain-discover': if(state.toolTab==='plugins')",
        "      case 'manage-plugin-permissions': {\n        const item=toolById('plugins',ds(el,'id'));openPluginOwnerUnavailable('cmd.agent_plugin.review_changes',item);return;\n      }",
        need,
        "legacy plugin permissions mutation removal",
    )
    doc = _replace_once(doc, HOME_BACKUP_ROW, HOME_LEARN_ROWS, need, "Settings replay and tour routes")
    doc = _replace_once(doc, "Databases and owner indexes','Included')", "Databases and durable owner records','Included')", need, "backup overview durable records copy")
    doc = _replace_once(doc, "Databases and owner indexes','Included by policy']", "Databases and durable owner records','Included by policy']", need, "backup details durable records copy")
    doc = _replace_once(doc, "Databases and indexes','Included by policy')", "Databases and durable owner records','Included by policy')", need, "server backup durable records copy")
    doc = _replace_once(doc, "Protect server configuration, databases, Project and Vault metadata, histories, receipts, and owner indexes while excluding raw credentials and disposable caches.", "Protect the Server Catalog, selected or all Vault consistency, global configuration and templates, trust and policy metadata, integration definitions, and external-secret references with verification and crash-safe restore.", need, "server backup summary boundary")
    doc = _replace_once(doc, "Project and Vault metadata, histories, receipts, and indexes','Preview only", "Project and Vault consistency, histories, receipts, policies, and integration definitions','Preview only", need, "backup preview coverage")
    doc = _replace_once(doc, "No owner receipt is attached and no data changed.", "No owner receipt is attached. No data changed.", need, "restore preview no-mutation disclosure")
    doc = _replace_once(doc, "['Disposable caches','Excluded']", "['Binaries, caches, active processes, PTYs, live browser state, reconstructable payloads','Excluded by default']", need, "backup exclusion boundary")
    doc = _replace_once(doc, "['Credential material','Excluded; secure references only']", "['Ordinary secret bytes','Excluded; references only. Portable secrets require a separately encrypted user-controlled recovery envelope']", need, "backup secret boundary")
    doc = _replace_count(doc, "infoRow('Credential material','Excluded; secure references only')", "infoRow('Ordinary secret bytes','Excluded; references only')", 2, need, "backup overview secret boundary")
    doc = _replace_once(doc, "infoRow('Disposable caches','Excluded')", "infoRow('Binaries, caches, active processes, PTYs, live browser state, reconstructable payloads','Excluded by default')", need, "backup overview exclusion boundary")
    doc = _replace_once(
        doc,
        "infoRow('Projects and Vault metadata','Included by policy')}${infoRow('Ordinary secret bytes','Excluded; references only')",
        "infoRow('Project and Vault metadata','Included by policy')}${infoRow('Histories and receipts','Included by policy')}${infoRow('Ordinary secret bytes','Excluded; references only')",
        need,
        "server backup retained-history boundary",
    )
    doc = _replace_once(doc, "['Exclude raw credentials and disposable caches','Required boundary']", "['Exclude binaries, caches, active processes, PTYs, live browser state, reconstructable payloads, and ordinary secret bytes','Required default boundary']", need, "backup task exclusion boundary")
    doc = _replace_once(doc, "      setupScrollSpy();\n      if (pendingScroll && restoreTop == null) {", "      if (restoreTop != null) suppressScrollSpyUntil = performance.now() + 180;\n      setupScrollSpy();\n      if (pendingScroll && restoreTop == null) {", need, "soft rerender route preservation")
    doc = _replace_once(doc, "</body>", GLOBAL_SCRIPT + "\n" + EGOLITE_RETAINED_CONTRACT_DATA + "\n</body>", need, "systems integration script and retained contract data")

    need(doc.count('id="pm7-t46-systems-css"') == 1, "T46: CSS identity mismatch")
    need(doc.count('id="pm7-t46-systems-js"') == 1, "T46: script identity mismatch")
    need(doc.count(TRANSFORM_MARKER) == 2, "T46: marker census mismatch")
    need("Settings shows the dependency shape and routes to each owner" not in doc, "T46: placeholder Doctor body survived")
    need("Databases and owner indexes" not in doc, "T46: reconstructable index inclusion survived")
    need("AuthBrowserSession is human-only" in doc, "T46: protected AuthBrowser invariant missing")
    need(doc.count("Object.defineProperty(window,'PM7_BROWSER_PROGRAM'") == 1, "T46: Browser Program descriptor identity mismatch")
    need("projection_only:true" in doc and "runtime_state:'runtime_unavailable'" in doc, "T46: Browser Program projection boundary missing")
    need("execution_methods:0" in doc and "raw_protocol_access:false" in doc and "arbitrary_page_code:false" in doc, "T46: Browser Program non-execution boundary missing")
    need("PM-native Browser Program" in doc, "T46: PM-native Browser visible identity missing")
    need(SERVER_GAP_CONSUMERS.count('["ui.') == 39, "T46: server-gap typed-local-action denominator must remain exactly 39")
    need(SERVER_GAP_CONSUMERS.count('["adjudicated_new"') == 86, "T46: server-gap adjudicated-new command-membership denominator must remain exactly 86")
    need(SERVER_GAP_CONSUMERS.count('["egolite_retained"') == 6, "T46: server-gap retained command-membership denominator must remain exactly 6")
    need(SERVER_GAP_CONSUMERS.count('["existing_alias_target"') == 11, "T46: server-gap alias-target command-membership denominator must remain exactly 11")
    need(all(digest in SERVER_GAP_CONSUMERS for digest in (
        "c312f11bf5fb43ffb1c2d165b04de4e67a0acf55fbad6a1bacafd0f5c008427c",
        "2bf2329159401fa36bd60dd35a6726318234ff3bd8a598efb8b707d6e2abf0fa",
        "7b9c698e4579708898f4c770898fbf71e99107eda2831d285e878ad4c37bfc0f",
    )), "T46: server-gap exact-membership digest binding missing")
    need("PM7_SERVER_GAP_EXTERNAL_SCHEMA_POINTER_IDS=Object.freeze" in SERVER_GAP_CONSUMERS and "external_schema_pointer_verification_required" in SERVER_GAP_CONSUMERS, "T46: live external schema-pointer verification boundary missing")
    need(all(token in SERVER_GAP_CONSUMERS for token in ("concept_simulation_only:true", "native_binding:false", "handler_unavailable:true", "event_record:'not_emitted'", "runtime_receipt:'not_issued'", "production_mutation_dispatched:false", "exact_return:exactReturn")), "T46: typed server-gap request/result simulation boundary missing")
    need("catalog_and_headless_dispatch_require_no_synthetic_PM7_control" in SERVER_GAP_CONSUMERS and "synthetic_one_control_per_command_required:false" in SERVER_GAP_CONSUMERS, "T46: intentional catalog/headless no-synthetic-control disposition missing")
    protected_local_actions = (
        "ui.auth_session.close_secure_browser",
        "ui.auth_session.copy_device_code",
        "ui.auth_session.open_details",
    )
    for action_id in protected_local_actions:
        need("pm7ConsumerButton('local','%s'" % action_id not in SERVER_GAP_CONSUMERS and 'data-ui-action-id="%s"' % action_id not in doc, "T46: protected human-only auth action mounted in ordinary PM7: %s" % action_id)
    visible_rebound_commands = (
        "cmd.auth_profile.rename", "cmd.doctor.export_report", "cmd.execution_host.capabilities.refresh",
        "cmd.execution_host.register", "cmd.execution_host.test", "cmd.goal.pause",
        "cmd.project.duplicate_configuration", "cmd.project.duplicate_with_history",
        "cmd.project.move.preflight", "cmd.project.move.start", "cmd.project.source_location.add",
        "cmd.project.source_location.update", "cmd.source_control.workspace.create",
        "cmd.source_control.workspace.switch", "cmd.update.app.automatic.set_enabled",
        "cmd.update.app.check", "cmd.update.app.rollback",
    )
    need(len(visible_rebound_commands) == 17 and all(command_id in doc for command_id in visible_rebound_commands), "T46: exact visible same-intent command rebind census mismatch")
    doctor_closure_tags = (
        "optional_off_unused_healthy",
        "selected_task_requirement_blocks",
        "exact_return_route",
        "exact_focus_restore",
        "currentness_fence",
        "sqlite_detected_blocked",
        "sqlite_never_available",
        "server_discovery",
        "identity_dedupe",
        "claim_pairing",
        "trusted_client",
        "endpoint_currentness",
        "tailscale",
        "tailscale_connector",
        "connector_build",
        "connector_protocol",
        "connector_process",
        "connector_binding",
        "hosted_authorization",
        "headscale",
        "private_endpoint",
        "funnel",
        "product_protocol",
        "route_dedupe",
        "backup_classification",
        "nginx",
        "traefik",
        "remote_link_direct",
        "remote_link_relay",
        "remote_link_e2e",
        "remote_link_pairing",
        "manual_endpoint",
        "route_failover",
        "route_resumption",
        "route_health_independent",
        "unused_optional_route_non_degrading",
        "identity_mismatch_security",
        "public_unclaimed_security",
        "unsafe_public_surface_security",
        "untrusted_proxy_headers_security",
        "auth_url_redaction",
        "auth_code_redaction",
        "pairing_credential_redaction",
        "recovery_credential_redaction",
        "pre_auth_credential_redaction",
        "relay_credential_redaction",
        "private_key_redaction",
        "access_key_redaction",
        "sensitive_project_path_redaction",
    )
    for tag in doctor_closure_tags:
        need(tag in DOCTOR_RENDER, "T46: Doctor closure tag missing: %s" % tag)
    need("Built into Puppet Master" in DOCTOR_RENDER and "Headscale private endpoint" in DOCTOR_RENDER and "Funnel unavailable by design" in DOCTOR_RENDER, "T46: connector/private-endpoint/Headscale-Funnel boundary missing")
    need("productionRuntimeState:'unavailable'" in DOCTOR_RENDER and "nativeRuntimeState:'unavailable'" in DOCTOR_RENDER, "T46: Doctor native/production unavailable boundary missing")
    doctor_fixtures = DOCTOR_RENDER.split("const PM7_DOCTOR_FIXTURES=[", 1)[1].split("  ];", 1)[0]
    need(doctor_fixtures.count("remediationMode:'owner_command_route'") == 15, "T46: Doctor owner-command remediation census mismatch")
    need(doctor_fixtures.count("remediationMode:'typed_owner_route'") == 1, "T46: Doctor typed-owner-route remediation census mismatch")
    need(doctor_fixtures.count("remediationMode:'unavailable'") == 4, "T46: Doctor unavailable remediation census mismatch")
    need("Project Sync and Backbone owner feed" in doctor_fixtures, "T46: Project authority owner phrase drifted")
    need("freshness:'Not run'" in doctor_fixtures and "label:'Checking'" not in doctor_fixtures, "T46: idle performance truth drifted")
    need("const PM7_DOCTOR_DOMAIN_IDS=Object.freeze" in DOCTOR_RENDER and DOCTOR_RENDER.count("data-doctor-domain-ids=") == 1, "T46: Doctor exact domain catalog or row projection missing")
    need("projectId:'project:settings-lab',namedPlanId:'named-plan:concept-current'" in doctor_fixtures and "data-named-plan-id=" in DOCTOR_RENDER, "T46: Named Plan remediation lacks exact Project and Named Plan identity")
    need("id:'provider-cli'" in doctor_fixtures and "command:'cmd.settings.open'" in doctor_fixtures and "settingsDetailId:'provider-cli:cli-example'" in doctor_fixtures, "T46: provider CLI Doctor route is absent or not bound to exact Settings target")
    need(all(token in DOCTOR_RENDER for token in ("data-last-known-result=", "data-current-readiness=", "data-freshness-state=", "data-currentness-state=", "data-recovery-divergence-reason=")), "T46: Doctor freshness/currentness/history/recovery metadata incomplete")
    need("data-doctor-work-id=\"${PM7_DOCTOR_WORK_ID}\"" in DOCTOR_RENDER and "data-viewer-attached=\"true\"" in DOCTOR_RENDER and "doctor_work_projection:function()" in GLOBAL_SCRIPT, "T46: Doctor persistent work identity or view-detach projection missing")
    doctor_local_actions = (
        "ui.doctor.open",
        "ui.doctor.open_details",
        "ui.doctor.open_logs",
        "ui.doctor.open_receipt",
        "ui.doctor.open_remediation",
        "ui.doctor.refresh_visible",
        "ui.doctor.run_check",
    )
    for action_id in doctor_local_actions:
        need(
            DOCTOR_RENDER.count('data-ui-action-id="%s"' % action_id) == 1,
            "T46: exact typed Doctor local-action markup missing or duplicated: %s" % action_id,
        )
    need("PM7_DOCTOR_LOCAL_ACTIONS=Object.freeze" in DOCTOR_RENDER and "PM7_DOCTOR_EVIDENCE_LIMITS=Object.freeze" in DOCTOR_RENDER, "T46: Doctor local-action or evidence-bound registry missing")
    need("maxRows:3,maxBytes:1024" in DOCTOR_RENDER and "maxRows:1,maxBytes:2048" in DOCTOR_RENDER and "data-load-trigger=\"explicit_local_action\"" in DOCTOR_RENDER, "T46: Doctor evidence views are not explicitly lazy and bounded")
    need("data-redaction-state=\"${projection.redactionState}\"" in DOCTOR_RENDER and "data-currentness-state=\"${projection.currentnessState}\"" in DOCTOR_RENDER, "T46: Doctor evidence redaction/currentness metadata missing")
    need("data-pm-hover-label=\"Open cached Doctor summary\"" in DOCTOR_RENDER and "data-pm-hover-label=\"Open bounded logs\"" in DOCTOR_RENDER and "data-pm-hover-label=\"Open receipt\"" in DOCTOR_RENDER, "T46: Doctor local-action hover bindings missing")
    need(all("case '%s'" % action in HANDLER_CASES for action in ("doctor-open-summary", "doctor-item-logs", "doctor-item-receipt")), "T46: Doctor local-action handler missing")
    doctor_summary_handler = HANDLER_CASES.split("case 'doctor-open-summary':", 1)[1].split("case 'doctor-check-scope':", 1)[0]
    doctor_evidence_handlers = HANDLER_CASES.split("case 'doctor-item-logs':", 1)[1].split("case 'doctor-open-owner':", 1)[0]
    need(all(token not in doctor_summary_handler + doctor_evidence_handlers for token in ("saveState(", "navigate(", "dispatchSettings(", "doctorChecking=")), "T46: local Doctor evidence view attempted state mutation, owner dispatch, navigation, or check execution")
    forbidden_doctor_command_prefix = "cmd." + "doctor"
    doctor_render_without_canonical_export = DOCTOR_RENDER.replace("cmd.doctor.export_report", "")
    need(forbidden_doctor_command_prefix not in doctor_render_without_canonical_export and forbidden_doctor_command_prefix not in HANDLER_CASES, "T46: Doctor surface contains an unexpected domain command")
    need("settings.doctor.remediation.open" not in DOCTOR_RENDER and "settingsRouteUiActionId" not in HANDLER_CASES, "T46: inbound Settings action stamped on outbound Doctor control")
    need(
        "case 'doctor-return'" in HANDLER_CASES
        and all(token in HANDLER_CASES for token in ("owner_result_missing", "owner_result_status_invalid", "owner_result_identity_mismatch", "owner_result_currentness_mismatch", "returnAccepted:true", "remediationResolved:resolved")),
        "T46: exact Doctor return rejection or disposition contract missing",
    )
    need("sourceValuePersisted:false" in DOCTOR_RENDER and "displayValue:'[REDACTED]'" in DOCTOR_RENDER, "T46: Doctor redaction model missing")
    need("https://" not in DOCTOR_RENDER and "/Users/" not in DOCTOR_RENDER and "/home/" not in DOCTOR_RENDER, "T46: Doctor concept fixture contains a URL or sensitive absolute path")
    plugin_commands = (
        "cmd.agent_plugin.scan",
        "cmd.agent_plugin.install",
        "cmd.agent_plugin.update",
        "cmd.agent_plugin.enable",
        "cmd.agent_plugin.disable",
        "cmd.agent_plugin.reload",
        "cmd.agent_plugin.remove",
        "cmd.agent_plugin.validate",
        "cmd.agent_plugin.review_changes",
        "cmd.agent_plugin.rollback",
        "cmd.agent_plugin.open_details",
        "cmd.agent_plugin.open_logs",
    )
    need(PLUGIN_RENDER.count("{id:'cmd.agent_plugin.") == 12, "T46: canonical plugin command registry census mismatch")
    for command_id in plugin_commands:
        need(command_id in PLUGIN_RENDER and command_id in doc, "T46: missing plugin command consumer: %s" % command_id)
    plugin_doctor_checks = (
        "doctor.plugin.manifest_resolution",
        "doctor.plugin.conformance",
        "doctor.plugin.containment",
        "doctor.plugin.supply_chain",
        "doctor.plugin.permission_update_review",
        "doctor.plugin.runtime_bounds",
        "doctor.plugin.rollback_health",
        "doctor.plugin.promoted_routine_freshness",
    )
    for check_id in plugin_doctor_checks:
        need(doctor_fixtures.count("checkId:'%s'" % check_id) == 1, "T46: plugin Doctor check missing or duplicated: %s" % check_id)
    need(doctor_fixtures.count("ownerRouteTab:'plugins'") == 8, "T46: plugin Doctor owner-route census mismatch")
    need(
        all(token in PLUGIN_RENDER for token in (
            'data-availability="handler_unavailable"',
            'data-disabled-reason="handler_unavailable"',
            'aria-disabled="true"',
            'data-pm-hover-label=',
            'data-pm-hover-detail=',
            'data-receipt-mode="owner_receipt_only"',
            'data-event-record="not_emitted"',
            'PluginCommandResult',
            'production receipt issued',
        )),
        "T46: plugin disabled, hover, result, or no-fake-receipt boundary missing",
    )
    need(
        all(token not in PLUGIN_RENDER for token in ("saveState(", "taskDrawer(", "confirmDialog(", "editObjectDialog(")),
        "T46: plugin owner projection contains a persistent or simulated-success mutation path",
    )
    need(
        all(token in PLUGIN_RENDER for token in (
            "plugin.json",
            "pm-plugin.json",
            "legacy package tree",
            "normalized package tree",
            "OpenAI/Codex adapter",
            "Claude adapter",
            "Portable, PM target, and agent projections",
            "Complete update review",
            "Reapproval",
            "Containment & runtime bounds",
            "Supply-chain posture",
            "Known-bad checks",
            "Promoted routine",
            "Details ≤ 32 KiB",
            "Logs ≤ 64 KiB / 200 rows",
            "Receipt ≤ 16 KiB",
            "EventRecord intentionally not emitted",
        )),
        "T46: plugin owner-fact, portability, evidence, or lifecycle projection incomplete",
    )
    need("case 'plugin-owner-command'" in HANDLER_CASES and "openPluginOwnerUnavailable(commandId,item)" in HANDLER_CASES, "T46: plugin unavailable handler route missing")
    need(
        all(token in doc for token in (
            "if(ds(el,'kind')==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.install'",
            "if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.validate'",
            "if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.remove'",
            "if(kind==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.open_details'",
            "if(state.toolTab==='plugins'){openPluginOwnerUnavailable('cmd.agent_plugin.scan'",
        )),
        "T46: legacy generic plugin mutation route did not fail closed",
    )
    need(" title=" not in PLUGIN_RENDER, "T46: native title tooltip entered plugin projection")
    need(
        BROWSER_SCM_RENDER.count('data-ui-action-id="ui.settings.route.open" data-availability="available" data-domain="ai" data-workspace="web"') == 1,
        "T46: Browser Program reverse-visible owner route missing",
    )
    need("PM7_SETTINGS_COMMANDS" in doc, "T46: Settings command bridge missing")
    need("function observeWidth(element,assign)" in GLOBAL_SCRIPT and "contentRect.width" in GLOBAL_SCRIPT and "focusChanged&&window.PM7_PAGE_TAB_INK" in GLOBAL_SCRIPT,
         "T46: cached responsive-host geometry or bounded ink resync missing")
    need(doc.count('id="pm7-t48-egolite-retained-contracts"') == 1, "T46: retained Egolite contract projection missing or duplicated")
    for requirement_id in ("HBU-005", "HBU-013", "BRW-010", "BRW-011", "SCM-005", "SCM-019", "ORI-002", "ORI-020", "IRT-008", "IRT-009", "IRT-010", "IRT-011", "SEC-003", "SEC-007", "SEC-008"):
        need(EGOLITE_RETAINED_CONTRACT_DATA.count('"id":"%s"' % requirement_id) == 1, "T46: retained Egolite requirement missing or duplicated: %s" % requirement_id)
    need("AuthBrowserSession is never exportable" in EGOLITE_RETAINED_CONTRACT_DATA and '"protected_auth_exportable":false' in EGOLITE_RETAINED_CONTRACT_DATA, "T46: protected AuthBrowserSession export negative missing")
    need("URL-source scanning is never authority" in EGOLITE_RETAINED_CONTRACT_DATA, "T46: actual network-effect authority boundary missing")
    need(":has(" not in SYSTEMS_CSS, "T46: nonportable :has entered CSS")
    need("backdrop-filter" not in SYSTEMS_CSS, "T46: blur-dependent CSS entered transform")

    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        ALLOWED_EFFECT_DELTA,
        need,
        "T46",
    )
    notes.update(
        {
            "decision": "packet-authoritative operational consumers inside preserved K3 geometry",
            "doctor_contract": "typed cached-summary entry, lazy details, bounded redacted logs, exact-currentness receipt projection, selected-scope recheck, truthful freshness/confidence/requested/effective state, focus-stable local evidence drawers, and owner-routed remediation only",
            "backup_contract": "Full Server scope with reconstructable indexes/caches/processes/live browser state excluded and portable secrets requiring a separate encrypted recovery envelope",
            "consumer_contract": ["PM-native Browser", "Test Capture", "SCM and forges", "Cursor Origin Preview", "Named Plans", "full-thread performance"],
            "plugin_contract": "compact K3 owner-fact projection with exact 12 centrally registered commands; every control is handler_unavailable, receipt-only without EventRecord, hover-described, bounded/redacted, and incapable of simulated production mutation",
            "responsive_host_contract": "when the projected Settings host with global Chat mounted is below 980 physical pixels, Settings temporarily suppresses global Chat paint without changing saved Chat layout state; ResizeObserver-owned width caches keep page switches free of synchronous geometry reads",
            "settings_command_bridge": ["cmd.settings.open", "cmd.settings.transaction.preview", "cmd.settings.transaction.apply", "cmd.settings.transaction.rollback", "cmd.settings.export"],
            "egolite_retained_contract_projection": "15 exact owner-routed rows; browser concept only, runtime/native/benchmark unavailable or not run, AuthBrowserSession remains structurally excluded",
            "simulation_boundary": "browser concept only; no production owner receipt or native Slint runtime claim",
            "slint_portability": "ResizeObserver on the physical host plus ordinary model/list/overlay primitives; no viewport-only geometry, Canvas, WebGL, backdrop blur, or filter storytelling",
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
