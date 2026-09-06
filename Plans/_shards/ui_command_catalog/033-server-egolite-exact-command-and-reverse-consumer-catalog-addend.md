# Shard 033: Server/Egolite Exact Command And Reverse-Consumer Catalog Addendum - 2026-09-01

Source: `Plans/UI_Command_Catalog.md`

Source lines: L11736-L11967

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## Server/Egolite Exact Command And Reverse-Consumer Catalog Addendum - 2026-09-01


The exact machine partition is 171 packet rows: 86 new canonical commands, 43 pre-policy aliases, 39 typed local UI actions, and three rejected spellings. Six retained Egolite commands also lacked central rows. Eleven existing alias targets require the same central repair, with `cmd.source_control.workspace.create` the sole overlap with the retained six. Therefore 103 obligation references collapse to **102 unique primary command/catalog/production-intent rows**; the packet primary denominator remains 92 (`86 + 6`). Denominators must never be silently substituted for one another.

Every primary row below is static central intent. A named `handler_location` is the sole future dispatch target, not evidence that Rust code, registration, provider execution, persistence, native Slint wiring, security behavior, or runtime success exists. Initial availability remains `handler_unavailable`; the exact disabled reason is projected accessibly. All rows use receipt/projection-only effects and `expected_event_types=[]` until Event Authority separately admits an exact family. `ObservableWork` applies only where the owner contract declares asynchronous work. Exact owner permissions, generations, currentness, idempotency, cancellation, reconciliation, and exact-return rules remain intact.


### Exact 102 primary catalog rows

| Exact primary command | Human label | Owner / PlanUnit | Sole future handler target | Complete intended GUI consumers |
|---|---|---|---|---|
| `cmd.auth_profile.rename` | Auth Profile Rename | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::rename` | Settings > Integrations > Profiles; Product Onboarding owner handoff; Doctor remediation; authentication handoff surface; palette/API |
| `cmd.auth_profile.revoke` | Auth Profile Revoke | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::revoke` | Settings > Integrations > Profiles; Product Onboarding owner handoff; Doctor remediation; authentication handoff surface; palette/API |
| `cmd.auth_profile.transfer.apply` | Auth Profile Transfer Apply | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::transfer_apply` | Settings > Integrations > Profiles; Product Onboarding owner handoff; Doctor remediation; authentication handoff surface; palette/API |
| `cmd.auth_profile.transfer.preview` | Auth Profile Transfer Preview | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::transfer_preview` | Settings > Integrations > Profiles; Product Onboarding owner handoff; Doctor remediation; authentication handoff surface; palette/API |
| `cmd.browser.program.inspect` | Browser Program Inspect | `Plans/Section15_MVP_Promoted_Features_Spec.md` / `SMPFS-156` | `handlers::browser_program::inspect` | Browser Program details; Testing; Watch; Runtime Artifacts; palette/API |
| `cmd.client.access.update` | Client Access Update | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::access_update` | Settings > Servers > Clients; pairing/trust surface; Server permanent web UI; Doctor |
| `cmd.client.remove` | Client Remove | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::remove` | Settings > Servers > Clients; pairing/trust surface; Server permanent web UI; Doctor |
| `cmd.client.rename` | Client Rename | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::rename` | Settings > Servers > Clients; pairing/trust surface; Server permanent web UI; Doctor |
| `cmd.client.session.revoke` | Client Session Revoke | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::session_revoke` | Settings > Servers > Clients; pairing/trust surface; Server permanent web UI; Doctor |
| `cmd.credential_attachment.revoke` | Credential Attachment Revoke | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_revoke` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.revoke_active` | Credential Attachment Revoke Active | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_revoke_active` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.test` | Credential Attachment Test | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.transfer.apply` | Credential Attachment Transfer Apply | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_transfer_apply` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.transfer.preview` | Credential Attachment Transfer Preview | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_transfer_preview` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.add` | Credential Source Add | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::source_add` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.remove` | Credential Source Remove | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::source_remove` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.test` | Credential Source Test | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::source_test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.doctor.export_report` | Doctor Export Report | `Plans/newtools.md` / `N2-155` | `handlers::doctor_report::export_report` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.execution_environment.attach` | Execution Environment Attach | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_attach` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.discover` | Execution Environment Discover | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_discover` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.provision` | Execution Environment Provision | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_provision` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.remove` | Execution Environment Remove | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_remove` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.repair` | Execution Environment Repair | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_repair` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.resource_policy.apply` | Execution Environment Resource Policy Apply | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_resource_policy_apply` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.resource_policy.preview` | Execution Environment Resource Policy Preview | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_resource_policy_preview` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.restart` | Execution Environment Restart | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_restart` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.rollback` | Execution Environment Rollback | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_rollback` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.select` | Execution Environment Select | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_select` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.start` | Execution Environment Start | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_start` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.stop` | Execution Environment Stop | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_stop` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.update` | Execution Environment Update | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_update` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.verify` | Execution Environment Verify | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_verify` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.capabilities.refresh` | Execution Host Capabilities Refresh | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_capabilities_refresh` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.disable` | Execution Host Disable | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_disable` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.drain` | Execution Host Drain | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_drain` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.enable` | Execution Host Enable | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_enable` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.register` | Execution Host Register | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_register` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.remove` | Execution Host Remove | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_remove` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.set_default` | Execution Host Set Default | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_set_default` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.test` | Execution Host Test | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_test` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.forge.repository.create` | Forge Repository Create | `Plans/Forge_Integrations.md` / `FGI-008` | `handlers::forge::repository_create` | Projects > New from Forge; Source Control; Settings > Integrations; Product Onboarding; palette/API |
| `cmd.goal.checkpoint` | Goal Checkpoint | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::checkpoint` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.goal.continue_on_host` | Goal Continue On Host | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::continue_on_host` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.goal.handoff.cancel` | Goal Handoff Cancel | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::handoff_cancel` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.goal.handoff.retry` | Goal Handoff Retry | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::handoff_retry` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.goal.pause` | Goal Pause | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::pause` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.goal.resume_here` | Goal Resume Here | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::resume_here` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.installation.attach_external` | Installation Attach External | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::attach_external` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.detach_external` | Installation Detach External | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::detach_external` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.remove` | Installation Remove | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::remove` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.project.duplicate_configuration` | Project Duplicate Configuration | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::duplicate_configuration` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project.duplicate_with_history` | Project Duplicate With History | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::duplicate_with_history` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project.execution_host.select` | Project Execution Host Select | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::execution_host_select` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.execution_policy.set` | Project Execution Policy Set | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::execution_policy_set` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.home_server.set` | Project Home Server Set | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::home_server_set` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.move.cancel` | Project Move Cancel | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::cancel` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.move.pause` | Project Move Pause | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::pause` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.move.preflight` | Project Move Preflight | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::preflight` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.move.resume` | Project Move Resume | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::resume` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.move.retry` | Project Move Retry | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::retry` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.move.rollback` | Project Move Rollback | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::rollback` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.move.start` | Project Move Start | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::start` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.source_location.add` | Project Source Location Add | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_add` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.remove` | Project Source Location Remove | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_remove` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.set_primary` | Project Source Location Set Primary | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_set_primary` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.test` | Project Source Location Test | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_test` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.update` | Project Source Location Update | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_update` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project_template.create_project` | Project Template Create Project | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_create_project` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project_template.delete` | Project Template Delete | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_delete` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project_template.rename` | Project Template Rename | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_rename` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project_template.save` | Project Template Save | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_save` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.provider_binding.copy` | Provider Binding Copy | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::binding_copy` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.provider_binding.resolve_on_destination` | Provider Binding Resolve On Destination | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::binding_resolve_on_destination` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.source_control.backend.detect` | Source Control Backend Detect | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::backend_detect` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.source_control.backend.select` | Source Control Backend Select | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::backend_select` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.source_control.checkpoint.create` | Source Control Checkpoint Create | `Plans/Source_Control_System.md` / `SCS-008` | `handlers::source_control::checkpoint_create` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.source_control.checkpoint.inspect` | Source Control Checkpoint Inspect | `Plans/Source_Control_System.md` / `SCS-008` | `handlers::source_control::checkpoint_inspect` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.source_control.checkpoint.restore` | Source Control Checkpoint Restore | `Plans/Source_Control_System.md` / `SCS-008` | `handlers::source_control::checkpoint_restore` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.source_control.workspace.create` | Source Control Workspace Create | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::workspace_create` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.source_control.workspace.switch` | Source Control Workspace Switch | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::workspace_switch` | Source Control panel; Settings > Source Control; Projects checkout/worktree flow; Doctor; palette/API |
| `cmd.tool_package.approve_license` | Tool Package Approve License | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::package_approve_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.update.app.automatic.set_enabled` | App Automatic Set Enabled | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::automatic_set_enabled` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.cancel_download` | Update App Cancel Download | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::cancel_download` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.check` | Update App Check | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::check` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.download` | Update App Download | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::download` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.install_restart` | Update App Install Restart | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::install_restart` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.remind_later` | Update App Remind Later | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::remind_later` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.rollback` | Update App Rollback | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::rollback` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.content.activate` | Update Content Activate | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::activate` | Settings > Updates > Content; content attention/status; Doctor |
| `cmd.update.content.check` | Update Content Check | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::check` | Settings > Updates > Content; content attention/status; Doctor |
| `cmd.update.content.download` | Update Content Download | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::download` | Settings > Updates > Content; content attention/status; Doctor |
| `cmd.update.content.rollback` | Update Content Rollback | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::rollback` | Settings > Updates > Content; content attention/status; Doctor |

### Compatibility normalization metadata

| Packet/source spelling | Exact target | Target handler | Rule |
|---|---|---|---|
| `cmd.auth_session.cancel` | `cmd.authentication.cancel` | `handlers::authentication::cancel` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.open_official_page` | `cmd.auth_profile.open_official_page` | `handlers::multi_account::open_official_page` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.open_secure_browser` | `cmd.authentication.start` | `handlers::authentication::start` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.open_secure_cli` | `cmd.authentication.start` | `handlers::authentication::start` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.resume` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.resume_callback` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.retry` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.start` | `cmd.authentication.start` | `handlers::authentication::start` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.submit_code` | `cmd.auth_profile.submit_code` | `handlers::multi_account::submit_code` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.submit_redirect` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.submit_returned_code` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.add` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.disable` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.edit` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.refresh_capabilities` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.select` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.credential.add` | `cmd.credential_source.add` | `handlers::credential_broker::source_add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.git_credential_binding.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.installation.rescan` | `cmd.tool.discover` | `handlers::tool::discover` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.add_worktree` | `cmd.source_control.workspace.create` | `handlers::source_control::workspace_create` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.connect_existing` | `cmd.source_control.repository.bind` | `handlers::source_control::repository_bind` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.create` | `cmd.source_control.workspace.create` | `handlers::source_control::workspace_create` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.remove` | `cmd.source_control.workspace.remove` | `handlers::source_control::workspace_remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.verify` | `cmd.source_control.status.refresh` | `handlers::source_control::status_refresh` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.remove_registration` | `cmd.project.remove` | `handlers::project::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.settings_copy.apply` | `cmd.settings.transaction.apply` | `handlers::settings::transaction_apply` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.settings_copy.preview` | `cmd.settings.transaction.preview` | `handlers::settings::transaction_preview` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.settings_copy.rollback` | `cmd.settings.transaction.rollback` | `handlers::settings::transaction_rollback` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.add` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.edit` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_credential_binding.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.remote_access.remote_link.test` | `cmd.remote_access.route.test` | `handlers::remote_access::route_test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.add` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.disable` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.edit` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.select` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.ssh_credential_binding.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |

### Typed local presentation metadata

| Command-shaped packet spelling | Exact typed local UI action | Complete intended GUI consumers |
|---|---|---|
| `cmd.auth_profile.open_details` | `ui.auth_profile.open_details` | Settings > Integrations > Profiles; Product Onboarding owner handoff; Doctor remediation; authentication handoff surface; palette/API |
| `cmd.auth_session.close_secure_browser` | `ui.auth_session.close_secure_browser` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.copy_device_code` | `ui.auth_session.copy_device_code` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_details` | `ui.auth_session.open_details` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.client.open_details` | `ui.client.open_details` | Settings > Servers > Clients; pairing/trust surface; Server permanent web UI; Doctor |
| `cmd.credential_attachment.open_consumers` | `ui.credential_attachment.open_consumers` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.open_details` | `ui.credential_attachment.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.open_details` | `ui.credential_source.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.doctor.copy_diagnostics` | `ui.doctor.copy_diagnostics` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.open` | `ui.doctor.open` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.open_finding` | `ui.doctor.open_details` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.open_owner` | `ui.doctor.open_remediation` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.refresh` | `ui.doctor.refresh_visible` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.run_check` | `ui.doctor.run_check` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.execution_environment.open_details` | `ui.execution_environment.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.open_logs` | `ui.execution_environment.open_logs` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.open_details` | `ui.execution_host.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.goal.handoff.open_details` | `ui.goal.handoff.open_details` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.installation.open_details` | `ui.installation.open_details` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.open_logs` | `ui.installation.open_logs` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.onboarding.back` | `ui.onboarding.back` | Product Onboarding modal |
| `cmd.onboarding.cancel` | `ui.onboarding.close` | Product Onboarding modal |
| `cmd.onboarding.continue` | `ui.onboarding.next` | Product Onboarding modal |
| `cmd.onboarding.defer` | `ui.onboarding.defer` | Product Onboarding modal |
| `cmd.onboarding.finish` | `ui.onboarding.finish` | Product Onboarding modal |
| `cmd.onboarding.open_details` | `ui.onboarding.open_details` | Product Onboarding modal |
| `cmd.onboarding.resume` | `ui.onboarding.start` | Product Onboarding modal |
| `cmd.onboarding.skip` | `ui.onboarding.skip` | Product Onboarding modal |
| `cmd.project.move.open_details` | `ui.project.move.open_details` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.open_details` | `ui.project.open_details` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project.source_location.open_details` | `ui.project.source_location.open_details` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.unarchive` | `ui.project.restore_archived` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project_template.open_details` | `ui.project_template.open_details` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.tool_package.open_provenance` | `ui.tool_package.open_provenance` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.tool_package.review_license` | `ui.tool_package.review_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.update.app.open_details` | `ui.update.app.open_details` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.open_logs` | `ui.update.app.open_logs` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.open_release_notes` | `ui.update.app.open_release_notes` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.content.open_details` | `ui.update.content.open_details` | Settings > Updates > Content; content attention/status; Doctor |

### Rejected source spellings

| Rejected spelling | Reason | Replacement guidance |
|---|---|---|
| `cmd.doctor.cancel` | Doctor is a viewer/router; closing detaches the viewer and must not cancel owner ObservableWork. Cancellation remains an exact domain-owner action when that owner exposes it. | owner-specific cancellable command from remediation result; closing Doctor only detaches the viewer |
| `cmd.doctor.run_all` | An unbounded full sweep conflicts with cached-first, relevance-scoped, resource-governed Doctor scheduling. Use ui.doctor.refresh_visible or exact ui.doctor.run_check actions. | ui.doctor.refresh_visible \| ui.doctor.run_check |
| `cmd.project.create` | A generic create command would erase the current required split among new-local, forge-created, existing, Git, Jujutsu, SSH, restore, and migration registrations. Call the exact owner path instead. | cmd.project.new_local \| cmd.project.new_github_repo \| cmd.project.add_existing \| exact Source Control/Jujutsu/Restore owner command followed by cmd.project.add_existing |

### UCC-151 - Exact Server And Egolite Catalog Rows

```yaml
plan_unit_id: UCC-151
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The server/Egolite closure catalogs 102 unique primary commands with exact owner, sole future target, typed contracts, handler-unavailable projection, and complete intended consumers while keeping 43 aliases normalization-only, 39 predecessor spellings typed-local-only, and three rejections non-dispatchable.
gui_related: true
depends_on: [CS-073]
unblocks: [WM-050, UIW-016]
acceptance_criteria:
  - Each exact primary appears once in the catalog and at least once in production-intent wiring with the same command and sole target.
  - Every intended GUI consumer is preserved in the catalog and receives exact availability, disabled reason, keyboard semantics, focus return, and receipt/result projection.
  - Alias, typed-local predecessor, and rejected tokens have no primary catalog or production row.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json, scripts/pm-plans-verify.py, scripts/pm-touch-closure-verify.py]
risk_class: catalog_reverse_coverage_or_alias_promotion_drift
reasoning_tier: high
context_scope: server_egolite_ui_command_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: catalog_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-171, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#92-command-denominator]
negative_constraints: [No alias primary row., No typed-local domain command., No rejected dispatch., No native-handler claim from a target string.]
```
