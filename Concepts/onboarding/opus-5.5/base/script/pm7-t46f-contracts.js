
{
  "schema_id":"pm.pmconcept7.forge_backup_post_integration_contract_projection.v1",
  "browser_concept_only":true,
  "production_runtime_state":"unavailable",
  "native_runtime_state":"unavailable",
  "visual_motion_performance_evidence":"deferred_until_user_approval",
  "requirements":["GUI-001","GUI-002","GUI-003","GUI-004","GUI-005","GUI-006","GUI-007","GUI-008","BGUI-001","BGUI-002","BGUI-003","BGUI-004","BGUI-005"],
  "activity_bar_migration":{"canonical_id":"repository_automation","aliases":["github_actions","gh-actions","git"],"panel_id_preserved":"panel-git","position_order_width_hidden_keyboard_and_undocked_state_preserved_by_alias" : true},
  "source_control":{"single_occupant":true,"engines":["git","jj_git"],"git_staging_visible_only_for_git":true,"jj_operation_history_distinct_from_backup":true},
  "automation":{"single_occupant":true,"providers":["github","gitlab","azure_devops","bitbucket","forgejo","gitea","origin_connected_checks","generic_git"],"origin_actions_engine_fabricated":false,"missing_step_api_invents_steps":false},
  "backup":{"single_owner_projection":true,"account_and_decryption_state_separate":true,"browse_is_read_only":true,"secret_fixture_values_present":false},
  "pipeline_open_in_browser":{
    "command_id":"cmd.forge.pipeline.open_in_browser",
    "native_availability":"handler_unavailable",
    "concept_availability":"owner_unavailable_concept_preview",
    "concept_navigates_external_pages":false,
    "destinations":[
      {"label":"Open artifacts in service","official_destination_kind":"automation_run_artifacts","requires":["provider","service_kind","instance_ref","automation_binding_ref","pipeline_id","automation_run_id","allowed_origin_ref","official_page_route_ref"],"optional":["job_id"],"forbids":["hosted_setting_scope_ref"],"run_identity":"exact run: immutable automation_run_id plus pipeline/definition; job binding applies when a job row is selected"},
      {"label":"Open service settings","official_destination_kind":"hosted_service_settings","requires":["provider","service_kind","instance_ref","automation_binding_ref","hosted_setting_scope_ref","allowed_origin_ref","official_page_route_ref"],"forbids":["pipeline_id","automation_run_id","job_id"],"run_identity":"none"},
      {"label":"Open in <provider>","official_destination_kind":"automation_service_overview","requires":["provider","service_kind","instance_ref","automation_binding_ref","allowed_origin_ref","official_page_route_ref"],"forbids":["pipeline_id","automation_run_id","job_id","hosted_setting_scope_ref"],"run_identity":"none"}
    ],
    "provider_bindings":[
      {"service":"gitlab","provider":"gitlab","service_kind":"gitlab_pipelines"},
      {"service":"azure","provider":"azure_devops","service_kind":"azure_pipelines"},
      {"service":"bitbucket","provider":"bitbucket_cloud","service_kind":"bitbucket_pipelines"},
      {"service":"forgejo","provider":"forgejo","service_kind":"forgejo_actions"},
      {"service":"gitea","provider":"gitea","service_kind":"gitea_actions"}
    ],
    "origin_unavailable":{"service":"origin","reason":"github_automation_binding_unavailable","official_destination_kind":null,"carries_binding_refs":false,"count_as_valid_requests":false,"detail":"Origin-mirror checks are GitHub-owned per FGI-014 and Cursor_Origin Integration 1.2: the exact automation binding is the connected GitHub service binding with GitHub official UI plus an independent Origin repository binding, which has no exact fixture here, so the three open_in_browser destinations stay preview-disabled with no destination kind and no refs"},
    "binding_choices":"bitbucket Pipelines reads as bitbucket_cloud (Data Center has no Pipelines); instance variants stay owner and probe truth and are not asserted here",
    "official_ui_origin":{"source":"profile_allowlisted_allowed_origin_ref","may_differ_from_normalized_api_host":true,"hardcoded_hosts_or_urls":false},
    "generic_no_service":{"label":"Connect automation","setup_intent":{"ui_action_id":"ui.settings.route.open","availability":"available","domain":"source","workspace":"source-manager"},"official_destination_kind":null,"carries_binding_refs":false,"dispatches_pipeline_request":false,"detail":"Connect automation is a setup/local navigation intent resolving through the existing Settings Source Control Code Services route (owner Hosting Services) with a working concept handler; it carries no destination kind and no refs and dispatches no pipeline request"},
    "generic_preview_disabled_controls":{"disabled_reason":"automation_service_not_configured","carries_binding_refs":false,"count_as_valid_requests":false,"detail":"remaining no-service controls (Open job/logs, Retry, Open artifacts in service, Review gate, Open service settings) stay preview-disabled with automation_service_not_configured, carry no destination kind or refs, and are not valid requests"},
    "first_card_overview":{"label":"Open in <provider>","official_destination_kind":"automation_service_overview","requires":["provider","service_kind","instance_ref","automation_binding_ref","allowed_origin_ref","official_page_route_ref"],"forbids":["pipeline_id","automation_run_id","job_id","hosted_setting_scope_ref"],"run_identity":"none","note":"selected first-card control preserved under FGI-021 with exact automation binding and approved official UI route; no fabricated run or scope"},
    "native_capability_fallback":{"artifact_download_import":"owner lane cmd.forge.pipeline.artifact.download; concept offers the automation_run_artifacts destination per FGI-015","secret_variable_mutation":"owner lane cmd.forge.pipeline.secret.set/remove and cmd.forge.pipeline.variable.set/remove; concept offers the hosted_service_settings destination per FGI-015; secret values never appear in concept state, refs, or fixtures"},
    "owner_refs":["Plans/Forge_Integrations.md#FGI-015","Plans/Forge_Integrations.md#FGI-021","Plans/forge_integration_contracts.schema.json#/$defs/command_target/properties/official_destination_kind","Plans/FinalGUISpec.md#F3-529"]
  }
}
