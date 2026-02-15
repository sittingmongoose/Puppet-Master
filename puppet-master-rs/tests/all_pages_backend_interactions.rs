use chrono::Utc;
use puppet_master::app::{App, Message};
use puppet_master::platforms::AuthTarget;
use puppet_master::theme::AppTheme;
use puppet_master::types::Platform;
use puppet_master::views::doctor::{CheckCategory, DoctorCheckResult};
use puppet_master::views::evidence::{EvidenceFilter, EvidenceItem, EvidenceItemType};
use puppet_master::views::history::{SessionInfo, SessionStatus};
use puppet_master::views::ledger::{EventType, LedgerEntry};
use puppet_master::views::memory::MemorySection;
use puppet_master::views::tiers::{TierDisplayNode, TierNodeType};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::AtomicBool;

// DRY:HELPER:new_test_app -- Build app instance for backend interaction tests.
fn new_test_app() -> App {
    let (app, _task) = App::new(Arc::new(AtomicBool::new(false)));
    app
}

struct SettingsFileGuard {
    path: PathBuf,
    backup: Option<Vec<u8>>,
}

impl Drop for SettingsFileGuard {
    fn drop(&mut self) {
        if let Some(bytes) = &self.backup {
            let _ = fs::write(&self.path, bytes);
        } else if self.path.exists() {
            let _ = fs::remove_file(&self.path);
        }
    }
}

#[test]
fn dashboard_projects_wizard_and_config_controls_work() {
    let mut app = new_test_app();

    // Dashboard controls
    let _ = app.update(Message::StartOrchestrator);
    let _ = app.update(Message::PauseOrchestrator);
    let _ = app.update(Message::ResumeOrchestrator);
    let _ = app.update(Message::StopOrchestrator);
    assert!(
        app.toasts.iter().any(|t| t.message.contains("Starting orchestrator")),
        "dashboard start action should emit toast"
    );

    // Projects page controls
    let _ = app.update(Message::ShowNewProjectForm(true));
    let _ = app.update(Message::NewProjectNameChanged("Alpha".to_string()));
    let _ = app.update(Message::NewProjectPathChanged("/tmp/alpha".to_string()));
    assert!(app.show_new_project_form);
    assert_eq!(app.new_project_name, "Alpha");
    assert_eq!(app.new_project_path, "/tmp/alpha");
    let _ = app.update(Message::ShowNewProjectForm(false));
    assert!(!app.show_new_project_form);
    assert!(app.new_project_name.is_empty());
    assert!(app.new_project_path.is_empty());

    // Wizard page controls
    let initial_step = app.wizard_step;
    let _ = app.update(Message::WizardNextStep);
    assert_eq!(app.wizard_step, initial_step + 1);
    let _ = app.update(Message::WizardPrevStep);
    assert_eq!(app.wizard_step, initial_step);
    let _ = app.update(Message::WizardUseInterviewToggled(true));
    let _ = app.update(Message::WizardGenerateAgentsMdToggled(false));
    let _ = app.update(Message::WizardProjectNameChanged("My Project".to_string()));
    assert!(app.wizard_use_interview);
    assert!(!app.wizard_generate_agents_md);
    assert_eq!(app.wizard_project_name, "My Project");

    // Config page controls
    let initial_plan_mode = app.gui_config.tiers.phase.plan_mode;
    let initial_ask_mode = app.gui_config.tiers.phase.ask_mode;
    let initial_screenshot = app.gui_config.verification.screenshot_on_failure;
    let initial_memory_multi = app.gui_config.memory.multi_level_agents;
    let initial_intensive_logging = app.gui_config.advanced.intensive_logging;
    let initial_first_principles = app.gui_config.interview.first_principles;

    let _ = app.update(Message::ConfigTabChanged(3));
    let _ = app.update(Message::ConfigTierPlanModeToggled("phase".to_string()));
    let _ = app.update(Message::ConfigTierAskModeToggled("phase".to_string()));
    let _ = app.update(Message::ConfigVerificationScreenshotToggled);
    let _ = app.update(Message::ConfigMemoryMultiLevelToggled);
    let _ = app.update(Message::ConfigAdvancedCheckboxToggled(
        "intensive_logging".to_string(),
    ));
    let _ = app.update(Message::ConfigInterviewToggled("first_principles".to_string()));

    assert_eq!(app.config_active_tab, 3);
    assert_eq!(app.gui_config.tiers.phase.plan_mode, !initial_plan_mode);
    assert_eq!(app.gui_config.tiers.phase.ask_mode, !initial_ask_mode);
    assert_eq!(
        app.gui_config.verification.screenshot_on_failure,
        !initial_screenshot
    );
    assert_eq!(app.gui_config.memory.multi_level_agents, !initial_memory_multi);
    assert_eq!(
        app.gui_config.advanced.intensive_logging,
        !initial_intensive_logging
    );
    assert_eq!(
        app.gui_config.interview.first_principles,
        !initial_first_principles
    );
    assert!(app.config_is_dirty);
}

#[test]
fn doctor_tiers_and_setup_controls_work() {
    let mut app = new_test_app();

    // Doctor controls and selected-platform install filtering
    app.doctor_results = vec![
        DoctorCheckResult {
            category: CheckCategory::Cli,
            name: "codex-cli".to_string(),
            passed: false,
            message: "missing".to_string(),
            fix_available: true,
            fix_command: None,
        },
        DoctorCheckResult {
            category: CheckCategory::Cli,
            name: "cursor-cli".to_string(),
            passed: false,
            message: "missing".to_string(),
            fix_available: true,
            fix_command: None,
        },
        DoctorCheckResult {
            category: CheckCategory::Git,
            name: "github-cli".to_string(),
            passed: false,
            message: "missing".to_string(),
            fix_available: true,
            fix_command: None,
        },
    ];

    let _ = app.update(Message::ToggleDoctorPlatformSelector);
    assert!(app.doctor_platform_selector_visible);

    let _ = app.update(Message::ToggleDoctorPlatform(Platform::Codex));
    assert!(app.doctor_selected_platforms.contains(&Platform::Codex));

    let _ = app.update(Message::InstallAllMissing);
    assert!(app.doctor_fixing.contains("codex-cli"));
    assert!(!app.doctor_fixing.contains("cursor-cli"));
    assert!(!app.doctor_fixing.contains("github-cli"));

    // Tiers controls
    app.tier_tree = vec![TierDisplayNode {
        id: "PH-001".to_string(),
        title: "Phase 1".to_string(),
        tier_type: TierNodeType::Phase,
        status: "pending".to_string(),
        depth: 0,
        expanded: false,
        has_children: true,
        acceptance_criteria: vec![],
        iteration_count: 0,
    }];

    let _ = app.update(Message::ToggleTierExpand("PH-001".to_string()));
    assert!(app.expanded_tiers.contains("PH-001"));
    assert!(app.tier_tree[0].expanded);
    let _ = app.update(Message::CollapseAllTiers);
    assert!(app.expanded_tiers.is_empty());

    // Setup controls
    let _ = app.update(Message::SetupRunDetection);
    assert!(app.setup_is_checking);
    assert!(
        app.toasts
            .iter()
            .any(|t| t.message.contains("Detecting platform installations")),
        "setup detection action should emit toast"
    );
}

#[test]
fn evidence_history_memory_ledger_and_coverage_controls_work() {
    let mut app = new_test_app();

    // Evidence controls
    app.evidence_items = vec![EvidenceItem {
        id: "ev-1".to_string(),
        tier_id: "PH-001".to_string(),
        evidence_type: EvidenceItemType::TestLog,
        summary: "log".to_string(),
        timestamp: Utc::now(),
        path: PathBuf::from("/tmp/does-not-exist.log"),
    }];
    let _ = app.update(Message::FilterEvidence(EvidenceFilter {
        evidence_type: Some(EvidenceItemType::TestLog),
        tier_id: Some("PH-001".to_string()),
    }));
    let _ = app.update(Message::EvidenceSelectItem(0));
    assert!(matches!(
        app.evidence_filter.evidence_type,
        Some(EvidenceItemType::TestLog)
    ));
    assert_eq!(app.evidence_selected_item, Some(0));

    // History controls
    app.history_items_per_page = 1;
    app.history_sessions = vec![
        SessionInfo {
            id: "S1".to_string(),
            start_time: Utc::now(),
            end_time: None,
            status: SessionStatus::Running,
            items_completed: 0,
            items_total: 1,
            expanded: false,
            phases: vec![],
            platform: None,
            model: None,
            reasoning_effort: None,
        },
        SessionInfo {
            id: "S2".to_string(),
            start_time: Utc::now(),
            end_time: None,
            status: SessionStatus::Completed,
            items_completed: 1,
            items_total: 1,
            expanded: false,
            phases: vec![],
            platform: None,
            model: None,
            reasoning_effort: None,
        },
    ];
    let _ = app.update(Message::HistoryNextPage);
    assert_eq!(app.history_page, 1);
    let _ = app.update(Message::HistoryPrevPage);
    assert_eq!(app.history_page, 0);
    let _ = app.update(Message::HistorySearchChanged("S2".to_string()));
    assert_eq!(app.history_search, "S2");
    let _ = app.update(Message::HistoryFilterChanged(Some(SessionStatus::Completed)));
    assert_eq!(app.history_filter, Some(SessionStatus::Completed));

    // Memory controls
    app.memory_content_string = "# Overview\nhello".to_string();
    let _ = app.update(Message::MemorySectionChanged(MemorySection::Full));
    assert_eq!(app.memory_section, MemorySection::Full);

    // Ledger controls
    app.ledger_entries = vec![LedgerEntry {
        id: 0,
        timestamp: Utc::now(),
        event_type: EventType::StateSnapshot,
        tier_id: Some("PH-001".to_string()),
        data: "{\"ok\":true}".to_string(),
    }];
    let _ = app.update(Message::LedgerFilterTierChanged("PH-001".to_string()));
    let _ = app.update(Message::LedgerFilterSessionChanged("session-a".to_string()));
    let _ = app.update(Message::LedgerFilterLimitChanged("25".to_string()));
    let _ = app.update(Message::LedgerToggleEvent(0));
    assert_eq!(app.ledger_filter.tier_id.as_deref(), Some("PH-001"));
    assert_eq!(app.ledger_filter_session, "session-a");
    assert_eq!(app.ledger_filter.limit, 25);
    assert!(app.ledger_expanded_events.contains(&0));

    // Coverage controls
    let _ = app.update(Message::CoverageFilterChanged("Phase 1".to_string()));
    assert_eq!(app.coverage_phase_filter, "Phase 1");
}

#[test]
fn login_settings_metrics_and_interview_controls_work() {
    let mut app = new_test_app();

    // Login controls
    let target = AuthTarget::Platform(Platform::Codex);
    let _ = app.update(Message::PlatformLogin(target));
    assert!(app.login_in_progress.contains_key(&target));
    let _ = app.update(Message::PlatformLoginComplete(target, Ok(())));
    assert!(!app.login_in_progress.contains_key(&target));
    assert!(
        app.toasts
            .iter()
            .any(|t| t.message.contains("login completed")),
        "login completion should emit toast"
    );

    // Settings controls
    let _ = app.update(Message::SettingsLogLevelChanged("debug".to_string()));
    let _ = app.update(Message::SettingsAutoScrollToggled(false));
    let _ = app.update(Message::SettingsShowTimestampsToggled(false));
    let _ = app.update(Message::SettingsRetentionDaysChanged("14".to_string()));
    let _ = app.update(Message::SettingsMinimizeToTrayToggled(false));
    let _ = app.update(Message::SettingsIntensiveLoggingToggled(true));
    let _ = app.update(Message::SetTheme(AppTheme::Light));
    assert_eq!(app.settings_log_level, "debug");
    assert!(!app.settings_auto_scroll);
    assert!(!app.settings_show_timestamps);
    assert_eq!(app.settings_retention_days, 14);
    assert!(!app.minimize_to_tray);
    assert!(app.settings_intensive_logging);
    assert_eq!(app.theme, AppTheme::Light);

    // Metrics controls
    let _ = app.update(Message::RefreshMetrics);
    assert!(
        app.toasts
            .iter()
            .any(|t| t.message.contains("Metrics refreshed")),
        "metrics refresh should emit toast"
    );

    // Interview controls
    let _ = app.update(Message::InterviewPaused);
    assert!(app.interview_paused);
    let _ = app.update(Message::InterviewResumed);
    assert!(!app.interview_paused);
    let _ = app.update(Message::InterviewAnswerInputChanged("answer".to_string()));
    assert_eq!(app.interview_answer_input, "answer");
    let _ = app.update(Message::InterviewTogglePause);
    assert!(app.interview_paused);
    let _ = app.update(Message::InterviewEnd);
    assert!(!app.interview_active);
}

#[test]
fn settings_changes_save_and_reload() {
    let cwd = std::env::current_dir().expect("cwd");
    let data_dir = cwd.join(".puppet-master");
    let settings_path = data_dir.join("settings.json");
    fs::create_dir_all(&data_dir).expect("create .puppet-master");

    let backup = fs::read(&settings_path).ok();
    let _guard = SettingsFileGuard {
        path: settings_path.clone(),
        backup,
    };

    let mut app = new_test_app();
    let _ = app.update(Message::SettingsLogLevelChanged("warn".to_string()));
    let _ = app.update(Message::SettingsAutoScrollToggled(false));
    let _ = app.update(Message::SettingsShowTimestampsToggled(false));
    let _ = app.update(Message::SettingsRetentionDaysChanged("21".to_string()));
    let _ = app.update(Message::SettingsMinimizeToTrayToggled(false));
    let _ = app.update(Message::SettingsIntensiveLoggingToggled(true));
    let _ = app.update(Message::SetTheme(AppTheme::Light));
    let _ = app.update(Message::SaveSettings);

    let raw = fs::read_to_string(&settings_path).expect("read settings");
    let json: Value = serde_json::from_str(&raw).expect("parse settings json");
    assert_eq!(json.get("theme").and_then(|v| v.as_str()), Some("light"));
    assert_eq!(json.get("log_level").and_then(|v| v.as_str()), Some("warn"));
    assert_eq!(json.get("auto_scroll").and_then(|v| v.as_bool()), Some(false));
    assert_eq!(
        json.get("show_timestamps").and_then(|v| v.as_bool()),
        Some(false)
    );
    assert_eq!(json.get("retention_days").and_then(|v| v.as_u64()), Some(21));
    assert_eq!(
        json.get("minimize_to_tray").and_then(|v| v.as_bool()),
        Some(false)
    );
    assert_eq!(
        json.get("intensive_logging").and_then(|v| v.as_bool()),
        Some(true)
    );

    let reloaded = new_test_app();
    assert_eq!(reloaded.theme, AppTheme::Light);
    assert_eq!(reloaded.settings_log_level, "warn");
    assert!(!reloaded.settings_auto_scroll);
    assert!(!reloaded.settings_show_timestamps);
    assert_eq!(reloaded.settings_retention_days, 21);
    assert!(!reloaded.minimize_to_tray);
    assert!(reloaded.settings_intensive_logging);
}
