use crate::theme::AppTheme;
use crate::types::PuppetMasterEvent;
use crate::widgets::Page;
use crate::tray::TrayAction;
use anyhow::Result;
use chrono::{DateTime, Utc};
use iced::{
    window, Element, Subscription, Task, Theme,
};
use std::collections::{HashMap, HashSet};
use std::hash::{Hash, Hasher};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;

// ============================================================================
// Subscriptions
// ============================================================================

#[derive(Clone)]
struct BackendEventSubscription {
    receiver: crossbeam_channel::Receiver<PuppetMasterEvent>,
}

impl Hash for BackendEventSubscription {
    fn hash<H: Hasher>(&self, state: &mut H) {
        std::any::TypeId::of::<PuppetMasterEvent>().hash(state);
        "backend-event".hash(state);
    }
}

fn backend_event_stream(
    sub: &BackendEventSubscription,
) -> futures::stream::BoxStream<'static, PuppetMasterEvent> {
    let receiver = sub.receiver.clone();

    futures::StreamExt::boxed(futures::stream::unfold(receiver, |receiver| async move {
        loop {
            if let Ok(event) = receiver.try_recv() {
                return Some((event, receiver));
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        }
    }))
}

#[derive(Clone)]
struct TrayActionSubscription {
    receiver: crossbeam_channel::Receiver<TrayAction>,
}

impl Hash for TrayActionSubscription {
    fn hash<H: Hasher>(&self, state: &mut H) {
        std::any::TypeId::of::<TrayAction>().hash(state);
        "tray-action".hash(state);
    }
}

fn tray_action_stream(
    sub: &TrayActionSubscription,
) -> futures::stream::BoxStream<'static, TrayAction> {
    let receiver = sub.receiver.clone();

    futures::StreamExt::boxed(futures::stream::unfold(receiver, |receiver| async move {
        loop {
            if let Ok(action) = receiver.try_recv() {
                return Some((action, receiver));
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        }
    }))
}

// ============================================================================
// Helper Types (only types not already defined in view modules)
// ============================================================================

#[derive(Debug, Clone)]
pub struct Toast {
    pub id: usize,
    pub toast_type: ToastType,
    pub message: String,
    pub created: Instant,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToastType {
    Success,
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthActionKind {
    Login,
    Logout,
}

#[derive(Debug, Clone)]
pub enum ModalContent {
    Confirm {
        title: String,
        message: String,
        on_confirm: Box<Message>,
    },
    Error {
        title: String,
        details: String,
    },
}

#[derive(Debug, Clone)]
pub enum AppCommand {
    Start,
    Pause,
    Resume,
    Stop,
    Reset,

    Retry(String),
    Replan(String),
    Reopen(String),
    Kill(u32),
    
    StartChainPipeline(String), // requirements text
}

// ============================================================================
// Main App State
// ============================================================================

// Re-use types from view modules for App state to avoid conversion
pub use crate::views::dashboard::{
    CurrentItem, ProgressState, OutputLine, OutputType, BudgetDisplayInfo,
};
pub use crate::views::projects::ProjectInfo;
pub use crate::views::doctor::DoctorCheckResult;
pub use crate::views::tiers::TierDisplayNode;
pub use crate::views::evidence::{EvidenceItem, EvidenceFilter};
pub use crate::views::history::SessionInfo;
pub use crate::views::ledger::{LedgerEntry, LedgerFilter};
pub use crate::state::{MetricsCollector, MetricsSnapshot};
pub use crate::views::login::AuthStatus;
pub use crate::views::setup::PlatformStatus;

pub struct App {
    // Navigation
    pub current_page: Page,

    // Theme
    pub theme: AppTheme,

    // Orchestrator state (snapshot for display)
    pub orchestrator_status: String,
    pub current_item: Option<CurrentItem>,
    pub progress: ProgressState,
    pub output_lines: Vec<OutputLine>,
    pub last_error: Option<String>,
    pub start_time: Option<DateTime<Utc>>,

    // Projects
    pub current_project: Option<ProjectInfo>,
    pub projects: Vec<ProjectInfo>,

    // Budgets
    pub budgets: HashMap<String, BudgetDisplayInfo>,

    // Doctor
    pub doctor_results: Vec<DoctorCheckResult>,
    pub doctor_running: bool,
    pub doctor_fixing: HashSet<String>,

    // Config
    pub config_text: String,
    pub config_valid: bool,
    pub config_error: Option<String>,

    // Tiers
    pub tier_tree: Vec<TierDisplayNode>,
    pub selected_tier: Option<String>,

    // Evidence
    pub evidence_items: Vec<EvidenceItem>,
    pub evidence_filter: EvidenceFilter,

    // History
    pub history_sessions: Vec<SessionInfo>,
    pub history_page: usize,
    history_active_by_item: HashMap<String, Vec<String>>,

    // Metrics
    pub metrics: MetricsSnapshot,
    metrics_collector: MetricsCollector,

    // Ledger
    pub ledger_entries: Vec<LedgerEntry>,
    pub ledger_filter: LedgerFilter,

    // Login
    pub platform_auth_status: HashMap<String, AuthStatus>,
    pub login_in_progress: HashMap<crate::platforms::AuthTarget, AuthActionKind>,
    pub setup_installing: Option<crate::types::Platform>,

    // Wizard
    pub wizard_step: usize,
    pub wizard_requirements_text: String,
    pub wizard_prd_preview: Option<String>,

    // Setup
    pub setup_platform_statuses: Vec<PlatformStatus>,
    pub setup_is_checking: bool,

    // UI State
    pub toasts: Vec<Toast>,
    pub show_modal: Option<ModalContent>,
    next_toast_id: usize,

    // Settings
    pub minimize_to_tray: bool,

    // Backend channels
    pub event_receiver: Option<crossbeam_channel::Receiver<PuppetMasterEvent>>,
    pub command_sender: Option<tokio::sync::mpsc::Sender<AppCommand>>,

    // Tray
    pub tray_action_receiver: Option<crossbeam_channel::Receiver<TrayAction>>,

    // Shutdown flag
    shutdown: Arc<AtomicBool>,

    // View helper data (constant placeholders stored as fields to avoid borrow issues)
    _empty_string_vec: Vec<String>,
    _no_tier_details: Option<crate::views::tiers::TierDetails>,
    _empty_coverage: Vec<crate::views::coverage::RequirementCoverage>,
    _memory_section: crate::views::memory::MemorySection,
}

// ============================================================================
// Message Enum
// ============================================================================

#[derive(Debug, Clone)]
pub enum Message {
    // Navigation
    NavigateTo(Page),

    // Theme
    ToggleTheme,
    ToggleMinimizeToTray,

    // Orchestrator controls
    StartOrchestrator,
    PauseOrchestrator,
    ResumeOrchestrator,
    StopOrchestrator,
    ResetOrchestrator,
    ConfirmRestart,
    RetryItem(String),
    ReplanItem(String),
    ReopenItem(String),
    KillProcess(u32),

    // Events from backend
    EventReceived(PuppetMasterEvent),

    // Tray
    TrayAction(TrayAction),

    // Projects
    SelectProject(String),
    CreateProject(String, String), // name, path
    OpenProject(String),

    // Config
    ConfigTextChanged(String),
    SaveConfig,
    ReloadConfig,
    ValidateConfig,

    // Doctor
    RunAllChecks,
    RunCheck(String),
    FixCheck(String, bool), // name, dry_run
    DoctorResultsReceived(Vec<DoctorCheckResult>),
    DoctorCheckResultReceived(DoctorCheckResult),
    DoctorRunFailed(ToastType, String),

    // Wizard
    WizardNextStep,
    WizardPrevStep,
    WizardRequirementsChanged(String),
    WizardFileSelected(Option<PathBuf>),
    WizardGenerate,
    WizardSave,

    // Setup
    SetupRunDetection,
    SetupDetectionComplete(Vec<PlatformStatus>),
    SetupComplete,

    // Evidence
    SelectEvidence(String),
    FilterEvidence(EvidenceFilter),
    LoadEvidence,

    // History
    HistoryPageChanged(usize),
    SelectSession(String),
    LoadHistory,

    // Ledger
    FilterLedger(LedgerFilter),
    LoadLedger,

    // Config (refresh)
    LoadConfig,

    // Login (refresh auth status)
    LoadLogin,
    AuthStatusReceived(std::collections::HashMap<String, AuthStatus>),
    PlatformLogin(crate::platforms::AuthTarget),
    PlatformLogout(crate::platforms::AuthTarget),
    PlatformLoginComplete(crate::platforms::AuthTarget, Result<(), String>),
    PlatformLogoutComplete(crate::platforms::AuthTarget, Result<(), String>),

    // Setup install
    SetupInstall(crate::types::Platform),
    SetupInstallComplete(crate::types::Platform, Result<(), String>),

    FixCheckComplete(String, Option<crate::types::FixResult>),

    // Doctor (refresh)
    RefreshDoctor,

    // Setup (refresh platform status)
    RefreshSetup,

    // Toasts
    DismissToast(usize),
    AddToast(ToastType, String),

    // Modal
    OpenModal(ModalContent),
    CloseModal,

    // Tick (for animations, elapsed time)
    Tick(DateTime<Utc>),

    // Window events
    WindowCloseRequested(window::Id),

    // No-op
    None,
}

// ============================================================================
// App Implementation
// ============================================================================

impl App {
    /// Create a new App instance with initial state
    pub fn new(shutdown: Arc<AtomicBool>) -> (Self, Task<Message>) {
        let app = Self {
            // Navigation
            current_page: Page::Dashboard,

            // Theme
            theme: AppTheme::Dark,

            // Orchestrator state
            orchestrator_status: "idle".to_string(),
            current_item: None,
            progress: ProgressState {
                phase_current: 0,
                phase_total: 0,
                task_current: 0,
                task_total: 0,
                subtask_current: 0,
                subtask_total: 0,
                overall_percent: 0.0,
            },
            output_lines: Vec::new(),
            last_error: None,
            start_time: None,

            // Projects
            current_project: None,
            projects: Vec::new(),

            // Budgets
            budgets: HashMap::new(),

            // Doctor
            doctor_results: Vec::new(),
            doctor_running: false,
            doctor_fixing: HashSet::new(),

            // Config
            config_text: String::new(),
            config_valid: true,
            config_error: None,

            // Tiers
            tier_tree: Vec::new(),
            selected_tier: None,

            // Evidence
            evidence_items: Vec::new(),
            evidence_filter: EvidenceFilter::default(),

            // History
            history_sessions: Vec::new(),
            history_page: 0,
            history_active_by_item: HashMap::new(),

            // Metrics
            metrics: MetricsSnapshot::default(),
            metrics_collector: MetricsCollector::new(),

            // Ledger
            ledger_entries: Vec::new(),
            ledger_filter: LedgerFilter::default(),

            // Login
            platform_auth_status: HashMap::new(),
            login_in_progress: HashMap::new(),
            setup_installing: None,

            // Wizard
            wizard_step: 0,
            wizard_requirements_text: String::new(),
            wizard_prd_preview: None,

            // Setup
            setup_platform_statuses: Vec::new(),
            setup_is_checking: false,

            // UI State
            toasts: Vec::new(),
            show_modal: None,
            next_toast_id: 0,

            // Settings
            minimize_to_tray: true,

            // Backend channels (will be set up in run())
            event_receiver: None,
            command_sender: None,

            // Tray
            tray_action_receiver: None,

            shutdown,

            // View helper data
            _empty_string_vec: Vec::new(),
            _no_tier_details: None,
            _empty_coverage: Vec::new(),
            _memory_section: crate::views::memory::MemorySection::Overview,
        };

        // Initial tasks: load projects, load config, etc.
        let task = Task::batch(vec![
            // Could add tasks here to load initial data
        ]);

        (app, task)
    }

    /// Handle messages and update state
    pub fn update(&mut self, message: Message) -> Task<Message> {
        match message {
            // ================================================================
            // Navigation
            // ================================================================
            Message::NavigateTo(page) => {
                self.current_page = page;
                Task::none()
            }

            // ================================================================
            // Theme
            // ================================================================
            Message::ToggleTheme => {
                self.theme = match self.theme {
                    AppTheme::Light => AppTheme::Dark,
                    AppTheme::Dark => AppTheme::Light,
                };
                Task::none()
            }
            Message::ToggleMinimizeToTray => {
                self.minimize_to_tray = !self.minimize_to_tray;
                Task::none()
            }

            // ================================================================
            // Orchestrator Controls
            // ================================================================
            Message::StartOrchestrator => {
                self.send_command(AppCommand::Start);
                self.add_toast(ToastType::Info, "Starting orchestrator...".to_string());
                Task::none()
            }

            Message::PauseOrchestrator => {
                self.send_command(AppCommand::Pause);
                self.add_toast(ToastType::Info, "Pausing orchestrator...".to_string());
                Task::none()
            }

            Message::ResumeOrchestrator => {
                self.send_command(AppCommand::Resume);
                self.add_toast(ToastType::Info, "Resuming orchestrator...".to_string());
                Task::none()
            }

            Message::StopOrchestrator => {
                self.send_command(AppCommand::Stop);
                self.add_toast(ToastType::Warning, "Stopping orchestrator...".to_string());
                Task::none()
            }

            Message::ResetOrchestrator => {
                self.send_command(AppCommand::Reset);
                self.add_toast(ToastType::Info, "Resetting orchestrator...".to_string());
                Task::none()
            }

            Message::ConfirmRestart => {
                self.show_modal = None;
                self.send_command(AppCommand::Stop);
                self.send_command(AppCommand::Start);
                self.add_toast(ToastType::Info, "Puppet Master restarting...".to_string());
                Task::none()
            }

            Message::RetryItem(id) => {
                self.send_command(AppCommand::Retry(id.clone()));
                self.add_toast(ToastType::Info, format!("Retrying item: {}", id));
                Task::none()
            }

            Message::ReplanItem(id) => {
                self.send_command(AppCommand::Replan(id.clone()));
                self.add_toast(ToastType::Info, format!("Replanning item: {}", id));
                Task::none()
            }

            Message::ReopenItem(id) => {
                self.send_command(AppCommand::Reopen(id.clone()));
                self.add_toast(ToastType::Info, format!("Reopening item: {}", id));
                Task::none()
            }

            Message::KillProcess(pid) => {
                self.send_command(AppCommand::Kill(pid));
                self.add_toast(ToastType::Warning, format!("Killing process: {}", pid));
                Task::none()
            }

            // ================================================================
            // Events from Backend
            // ================================================================
            Message::EventReceived(event) => {
                self.handle_backend_event(event);
                Task::none()
            }

            // ================================================================
            // Tray Actions
            // ================================================================
            Message::TrayAction(action) => {
                match action {
                    TrayAction::OpenGui => {
                        // Restore window from tray
                        return window::latest().and_then(|id| {
                            Task::batch(vec![
                                window::minimize(id, false),
                                window::gain_focus(id),
                            ])
                        });
                    }
                    TrayAction::Quit => {
                        self.shutdown.store(true, Ordering::SeqCst);
                        // Stop orchestrator processes before exiting
                        self.send_command(AppCommand::Stop);
                        return iced::exit();
                    }
                    TrayAction::RestartApp => {
                        // Show confirmation modal instead of auto-restarting
                        self.show_modal = Some(ModalContent::Confirm {
                            title: "Restart Puppet Master".to_string(),
                            message: "Are you sure you want to restart Puppet Master? This will stop all running tasks.".to_string(),
                            on_confirm: Box::new(Message::ConfirmRestart),
                        });
                    }
                }
                Task::none()
            }

            // ================================================================
            // Projects
            // ================================================================
            Message::SelectProject(name) => {
                // Update current project
                for project in &mut self.projects {
                    project.status = if project.name == name {
                        crate::views::projects::ProjectStatus::Active
                    } else {
                        crate::views::projects::ProjectStatus::Inactive
                    };
                }
                self.current_project = self.projects.iter()
                    .find(|p| p.name == name)
                    .cloned();
                self.add_toast(ToastType::Success, format!("Switched to project: {}", name));
                Task::none()
            }

            Message::CreateProject(name, path) => {
                let project_path = PathBuf::from(&path);
                match std::fs::create_dir_all(&project_path)
                    .and_then(|_| crate::utils::project_paths::initialize_puppet_master_dirs(&project_path).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e)))
                {
                    Ok(()) => {
                        let config_path = project_path.join("puppet-master.yaml");
                        let cfg = crate::config::ConfigManager::new();
                        let _ = cfg.save_to(&config_path);

                        let info = ProjectInfo {
                            name: name.clone(),
                            path: project_path.clone(),
                            status: crate::views::projects::ProjectStatus::Active,
                        };

                        // Mark all others inactive
                        for project in &mut self.projects {
                            project.status = crate::views::projects::ProjectStatus::Inactive;
                        }
                        self.projects.push(info.clone());
                        self.current_project = Some(info);

                        self.add_toast(
                            ToastType::Success,
                            format!("Created project '{}' at {}", name, project_path.display()),
                        );
                    }
                    Err(e) => {
                        self.add_toast(
                            ToastType::Error,
                            format!("Failed to create project '{}': {}", name, e),
                        );
                    }
                }
                Task::none()
            }

            Message::OpenProject(project_or_path) => {
                // First try to resolve as a known project name
                let resolved_path = self
                    .projects
                    .iter()
                    .find(|p| p.name == project_or_path)
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| PathBuf::from(&project_or_path));

                // Mark project active/inactive
                for project in &mut self.projects {
                    project.status = if project.path == resolved_path {
                        crate::views::projects::ProjectStatus::Active
                    } else {
                        crate::views::projects::ProjectStatus::Inactive
                    };
                }

                // Ensure it's in the list
                if !self.projects.iter().any(|p| p.path == resolved_path) {
                    self.projects.push(ProjectInfo {
                        name: project_or_path.clone(),
                        path: resolved_path.clone(),
                        status: crate::views::projects::ProjectStatus::Active,
                    });
                }

                self.current_project = self
                    .projects
                    .iter()
                    .find(|p| p.path == resolved_path)
                    .cloned();

                // Check for setup completion marker
                let setup_marker = resolved_path.join(".puppet-master").join("setup-complete");
                if !setup_marker.exists() {
                    // Setup not complete, navigate to setup wizard
                    self.current_page = Page::Setup;
                    self.add_toast(
                        ToastType::Info,
                        "First-time setup required. Please complete the setup wizard.".to_string(),
                    );
                    return Task::none();
                }

                // Best-effort config load
                let candidates = ["pm-config.yaml", "puppet-master.yaml", ".puppet-master.yaml"];
                let mut loaded = None;
                for name in candidates {
                    let p = resolved_path.join(name);
                    if p.exists() {
                        loaded = Some(p);
                        break;
                    }
                }

                if let Some(config_path) = loaded {
                    match std::fs::read_to_string(&config_path) {
                        Ok(text) => {
                            self.config_text = text;
                            self.config_valid = true;
                            self.config_error = None;
                            self.add_toast(
                                ToastType::Success,
                                format!("Opened project at {}", resolved_path.display()),
                            );
                        }
                        Err(e) => {
                            self.add_toast(
                                ToastType::Warning,
                                format!("Opened project, but failed to read config: {}", e),
                            );
                        }
                    }
                } else {
                    self.add_toast(
                        ToastType::Info,
                        format!("Opened project at {} (no config found)", resolved_path.display()),
                    );
                }

                Task::none()
            }

            // ================================================================
            // Config
            // ================================================================
            Message::ConfigTextChanged(text) => {
                self.config_text = text;
                Task::none()
            }

            Message::SaveConfig => {
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

                let config_path = base.join("puppet-master.yaml");

                match std::fs::write(&config_path, &self.config_text) {
                    Ok(()) => {
                        self.add_toast(
                            ToastType::Success,
                            format!("Configuration saved to {}", config_path.display()),
                        );
                    }
                    Err(e) => {
                        self.add_toast(
                            ToastType::Error,
                            format!("Failed to save config: {}", e),
                        );
                    }
                }

                Task::none()
            }

            Message::ReloadConfig => {
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

                let config_path = base.join("puppet-master.yaml");

                match std::fs::read_to_string(&config_path) {
                    Ok(text) => {
                        self.config_text = text;
                        self.config_valid = true;
                        self.config_error = None;
                        self.add_toast(
                            ToastType::Info,
                            format!("Reloaded configuration from {}", config_path.display()),
                        );
                    }
                    Err(e) => {
                        self.add_toast(
                            ToastType::Error,
                            format!("Failed to reload config: {}", e),
                        );
                    }
                }

                Task::none()
            }

            Message::ValidateConfig => {
                match serde_yaml::from_str::<crate::types::PuppetMasterConfig>(&self.config_text) {
                    Ok(config) => {
                        let errors = crate::config::validate_config(&config);
                        if errors.is_empty() {
                            self.config_valid = true;
                            self.config_error = None;
                            self.add_toast(ToastType::Success, "Configuration is valid".to_string());
                        } else {
                            self.config_valid = false;
                            let msg = errors
                                .iter()
                                .map(|e| e.to_string())
                                .collect::<Vec<_>>()
                                .join("\n");
                            self.config_error = Some(msg.clone());
                            self.add_toast(ToastType::Error, "Configuration validation failed".to_string());
                        }
                    }
                    Err(e) => {
                        self.config_valid = false;
                        self.config_error = Some(e.to_string());
                        self.add_toast(ToastType::Error, "Invalid YAML configuration".to_string());
                    }
                }

                Task::none()
            }

            // ================================================================
            // Doctor
            // ================================================================
            Message::RunAllChecks => {
                self.doctor_running = true;
                self.add_toast(ToastType::Info, "Running all checks...".to_string());

                Task::perform(
                    async {
                        let registry = crate::doctor::CheckRegistry::default();
                        registry.run_all().await
                    },
                    |res| match res {
                        Ok(report) => {
                            let results = report
                                .checks
                                .into_iter()
                                .map(|check| DoctorCheckResult {
                                    category: match check.category {
                                        crate::types::CheckCategory::Cli => crate::views::doctor::CheckCategory::Cli,
                                        crate::types::CheckCategory::Git => crate::views::doctor::CheckCategory::Git,
                                        crate::types::CheckCategory::Project => crate::views::doctor::CheckCategory::Project,
                                        crate::types::CheckCategory::Config => crate::views::doctor::CheckCategory::Runtime,
                                        crate::types::CheckCategory::Environment => crate::views::doctor::CheckCategory::Runtime,
                                    },
                                    name: check.name,
                                    passed: check.result.passed,
                                    message: check
                                        .result
                                        .details
                                        .clone()
                                        .unwrap_or_else(|| check.result.message.clone()),
                                    fix_available: check.result.can_fix,
                                    fix_command: None,
                                })
                                .collect();
                            Message::DoctorResultsReceived(results)
                        }
                        Err(e) => Message::DoctorRunFailed(ToastType::Error, format!("Doctor checks failed: {}", e)),
                    },
                )
            }

            Message::RunCheck(name) => {
                self.doctor_running = true;
                self.add_toast(ToastType::Info, format!("Running check: {}", name));

                Task::perform(
                    async move {
                        let registry = crate::doctor::CheckRegistry::default();
                        registry.run_check(&name).await
                    },
                    |res| match res {
                        Ok(Some(check)) => Message::DoctorCheckResultReceived(DoctorCheckResult {
                            category: match check.category {
                                crate::types::CheckCategory::Cli => crate::views::doctor::CheckCategory::Cli,
                                crate::types::CheckCategory::Git => crate::views::doctor::CheckCategory::Git,
                                crate::types::CheckCategory::Project => crate::views::doctor::CheckCategory::Project,
                                crate::types::CheckCategory::Config => crate::views::doctor::CheckCategory::Runtime,
                                crate::types::CheckCategory::Environment => crate::views::doctor::CheckCategory::Runtime,
                            },
                            name: check.name,
                            passed: check.result.passed,
                            message: check
                                .result
                                .details
                                .clone()
                                .unwrap_or_else(|| check.result.message.clone()),
                            fix_available: check.result.can_fix,
                            fix_command: None,
                        }),
                        Ok(None) => Message::DoctorRunFailed(ToastType::Warning, "Check not found".to_string()),
                        Err(e) => Message::DoctorRunFailed(ToastType::Error, format!("Check failed: {}", e)),
                    },
                )
            }

            Message::FixCheck(name, dry_run) => {
                let action = if dry_run { "Previewing fix" } else { "Applying fix" };
                self.doctor_fixing.insert(name.clone());
                self.add_toast(ToastType::Info, format!("{}: {}", action, name));

                let name_for_complete = name.clone();
                Task::perform(
                    async move {
                        let registry = crate::doctor::CheckRegistry::default();
                        registry.fix_check(&name, dry_run).await
                    },
                    move |res| {
                        let fix_result = res.ok().and_then(|o| o.and_then(|(_, f)| f));
                        Message::FixCheckComplete(name_for_complete, fix_result)
                    },
                )
            }

            Message::FixCheckComplete(name, fix_result) => {
                self.doctor_fixing.remove(&name);
                match &fix_result {
                    Some(fix) => {
                        if fix.success {
                            self.add_toast(ToastType::Success, fix.message.clone());
                        } else {
                            self.add_toast(ToastType::Error, fix.message.clone());
                        }
                    }
                    None => {
                        self.add_toast(ToastType::Warning, "No fix available".to_string());
                    }
                }
                let name_for_refresh = name;
                Task::perform(
                    async move {
                        let registry = crate::doctor::CheckRegistry::default();
                        registry.run_check(&name_for_refresh).await
                    },
                    move |res| match res {
                        Ok(Some(check)) => Message::DoctorCheckResultReceived(DoctorCheckResult {
                            category: match check.category {
                                crate::types::CheckCategory::Cli => crate::views::doctor::CheckCategory::Cli,
                                crate::types::CheckCategory::Git => crate::views::doctor::CheckCategory::Git,
                                crate::types::CheckCategory::Project => crate::views::doctor::CheckCategory::Project,
                                crate::types::CheckCategory::Config => crate::views::doctor::CheckCategory::Runtime,
                                crate::types::CheckCategory::Environment => crate::views::doctor::CheckCategory::Runtime,
                            },
                            name: check.name,
                            passed: check.result.passed,
                            message: check.result.details.clone().unwrap_or_else(|| check.result.message.clone()),
                            fix_available: check.result.can_fix,
                            fix_command: None,
                        }),
                        _ => Message::None,
                    },
                )
            }

            Message::DoctorResultsReceived(results) => {
                self.doctor_running = false;
                self.doctor_results = results;
                Task::none()
            }

            Message::DoctorCheckResultReceived(result) => {
                self.doctor_running = false;
                if let Some(existing) = self.doctor_results.iter_mut().find(|r| r.name == result.name) {
                    *existing = result;
                } else {
                    self.doctor_results.push(result);
                }
                Task::none()
            }

            Message::DoctorRunFailed(toast_type, message) => {
                self.doctor_running = false;
                self.add_toast(toast_type, message);
                Task::none()
            }

            // ================================================================
            // Wizard
            // ================================================================
            Message::WizardNextStep => {
                self.wizard_step += 1;
                Task::none()
            }

            Message::WizardPrevStep => {
                if self.wizard_step > 0 {
                    self.wizard_step -= 1;
                }
                Task::none()
            }

            Message::WizardRequirementsChanged(text) => {
                self.wizard_requirements_text = text;
                Task::none()
            }

            Message::WizardFileSelected(path_opt) => {
                // Open file dialog if None, otherwise load the provided path
                if path_opt.is_none() {
                    // Open file dialog asynchronously
                    Task::perform(
                        async {
                            let result = rfd::AsyncFileDialog::new()
                                .add_filter("Text/Markdown", &["txt", "md", "markdown"])
                                .add_filter("All Files", &["*"])
                                .set_title("Select Requirements File")
                                .pick_file()
                                .await;
                            
                            result.map(|file| file.path().to_path_buf())
                        },
                        Message::WizardFileSelected,
                    )
                } else if let Some(path) = path_opt {
                    // Load file content
                    match std::fs::read_to_string(&path) {
                        Ok(content) => {
                            self.wizard_requirements_text = content;
                            self.add_toast(ToastType::Success, format!("Loaded file: {}", path.display()));
                            Task::none()
                        }
                        Err(e) => {
                            self.add_toast(ToastType::Error, format!("Failed to read file: {}", e));
                            Task::none()
                        }
                    }
                } else {
                    Task::none()
                }
            }

            Message::WizardGenerate => {
                // Kick off StartChainPipeline asynchronously
                if self.wizard_requirements_text.trim().is_empty() {
                    self.add_toast(ToastType::Warning, "Please enter requirements first".to_string());
                    return Task::none();
                }
                
                // Send command to backend to generate PRD
                self.send_command(AppCommand::StartChainPipeline(self.wizard_requirements_text.clone()));
                self.add_toast(ToastType::Info, "Generating PRD...".to_string());
                
                // Advance to step 3 (preview)
                self.wizard_step = 3;
                
                Task::none()
            }

            Message::WizardSave => {
                // Save PRD to config.paths.prd_path
                if self.wizard_prd_preview.is_none() {
                    self.add_toast(ToastType::Warning, "No PRD to save yet".to_string());
                    return Task::none();
                }
                
                // Get the base path from current project or current directory
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
                
                let prd_path = base.join("prd.json");
                
                // Write PRD to file
                if let Some(ref prd_content) = self.wizard_prd_preview {
                    match std::fs::write(&prd_path, prd_content) {
                        Ok(()) => {
                            self.add_toast(
                                ToastType::Success,
                                format!("PRD saved to {}", prd_path.display()),
                            );
                            
                            // Advance to step 4
                            self.wizard_step = 4;
                        }
                        Err(e) => {
                            self.add_toast(
                                ToastType::Error,
                                format!("Failed to save PRD: {}", e),
                            );
                        }
                    }
                } else {
                    self.add_toast(ToastType::Warning, "No PRD content to save".to_string());
                }
                
                Task::none()
            }

            // ================================================================
            // Setup
            // ================================================================
            Message::SetupRunDetection => {
                self.setup_is_checking = true;
                self.add_toast(ToastType::Info, "Detecting platform installations...".to_string());

                Task::perform(
                    async {
                        use crate::doctor::InstallationManager;
                        
                        
                        let manager = InstallationManager::new();
                        let results = manager.check_all_platforms();
                        
                        results
                            .into_iter()
                            .map(|(platform, status)| PlatformStatus {
                                platform,
                                status: status.clone(),
                                instructions: if matches!(status, crate::doctor::InstallationStatus::Installed(_)) {
                                    String::new()
                                } else {
                                    manager.get_installation_instructions(platform)
                                },
                            })
                            .collect::<Vec<_>>()
                    },
                    Message::SetupDetectionComplete,
                )
            }

            Message::SetupDetectionComplete(statuses) => {
                self.setup_is_checking = false;
                self.setup_platform_statuses = statuses;
                
                let installed_count = self.setup_platform_statuses.iter()
                    .filter(|s| matches!(s.status, crate::doctor::InstallationStatus::Installed(_)))
                    .count();
                
                self.add_toast(
                    ToastType::Success,
                    format!("Detection complete. {} of {} platforms installed.", installed_count, self.setup_platform_statuses.len()),
                );
                
                Task::none()
            }

            Message::SetupComplete => {
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
                
                let marker_dir = base.join(".puppet-master");
                let marker_file = marker_dir.join("setup-complete");
                
                // Create directory if it doesn't exist
                if let Err(e) = std::fs::create_dir_all(&marker_dir) {
                    self.add_toast(
                        ToastType::Error,
                        format!("Failed to create .puppet-master directory: {}", e),
                    );
                    return Task::none();
                }
                
                // Create marker file
                match std::fs::write(&marker_file, "") {
                    Ok(()) => {
                        self.add_toast(
                            ToastType::Success,
                            "Setup complete! You can now use Puppet Master.".to_string(),
                        );
                        
                        // Navigate to dashboard
                        self.current_page = Page::Dashboard;
                    }
                    Err(e) => {
                        self.add_toast(
                            ToastType::Error,
                            format!("Failed to create setup marker: {}", e),
                        );
                    }
                }
                
                Task::none()
            }

            // ================================================================
            // Evidence
            // ================================================================
            Message::SelectEvidence(_id) => {
                // Navigate to evidence page
                self.current_page = Page::Evidence;
                Task::none()
            }

            Message::FilterEvidence(filter) => {
                self.evidence_filter = filter;
                Task::none()
            }

            Message::LoadEvidence => {
                // Re-navigate to trigger data refresh
                self.update(Message::NavigateTo(Page::Evidence))
            }

            // ================================================================
            // History
            // ================================================================
            Message::HistoryPageChanged(page) => {
                self.history_page = page;
                Task::none()
            }

            Message::SelectSession(session_id) => {
                if let Some(session) = self
                    .history_sessions
                    .iter_mut()
                    .find(|s| s.id == session_id)
                {
                    session.expanded = !session.expanded;
                }

                Task::none()
            }

            Message::LoadHistory => {
                self.update(Message::NavigateTo(Page::History))
            }

            // ================================================================
            // Ledger
            // ================================================================
            Message::FilterLedger(filter) => {
                self.ledger_filter = filter;
                Task::none()
            }

            Message::LoadLedger => {
                self.update(Message::NavigateTo(Page::Ledger))
            }

            // ================================================================
            // Config / Login / Doctor / Setup refresh
            // ================================================================
            Message::LoadConfig => {
                self.update(Message::ReloadConfig)
            }

            Message::LoadLogin => {
                self.current_page = Page::Login;
                Task::perform(
                    async {
                        let checker = crate::platforms::AuthStatusChecker::new();
                        let mut map: HashMap<String, AuthStatus> = HashMap::new();
                        for platform in crate::types::Platform::all() {
                            let result = checker.check_platform(*platform).await;
                            let name = format!("{:?}", platform);
                            map.insert(name.clone(), AuthStatus {
                                platform: name,
                                authenticated: result.authenticated,
                                method: if result.message.contains("environment variable") {
                                    crate::views::login::AuthMethod::EnvVar
                                } else {
                                    crate::views::login::AuthMethod::CliLogin
                                },
                                hint: result.message.clone(),
                            });
                        }
                        let gh = checker.check_github().await;
                        map.insert("GitHub".to_string(), AuthStatus {
                            platform: "GitHub".to_string(),
                            authenticated: gh.authenticated,
                            method: crate::views::login::AuthMethod::CliLogin,
                            hint: gh.message.clone(),
                        });
                        map
                    },
                    Message::AuthStatusReceived,
                )
            }

            Message::AuthStatusReceived(map) => {
                self.platform_auth_status = map;
                Task::none()
            }

            Message::PlatformLogin(target) => {
                self.login_in_progress.insert(target, AuthActionKind::Login);
                let target_copy = target;
                Task::perform(
                    async move {
                        crate::platforms::spawn_login(target_copy).await
                            .map_err(|e| e.to_string())
                    },
                    move |res| Message::PlatformLoginComplete(target_copy, res),
                )
            }

            Message::PlatformLoginComplete(target, res) => {
                self.login_in_progress.remove(&target);
                match &res {
                    Ok(()) => self.add_toast(ToastType::Success, format!("{} login completed", target.display_name())),
                    Err(e) => self.add_toast(ToastType::Error, format!("{} login failed: {}", target.display_name(), e)),
                }
                Task::perform(
                    async {
                        let checker = crate::platforms::AuthStatusChecker::new();
                        let mut map: HashMap<String, AuthStatus> = HashMap::new();
                        for platform in crate::types::Platform::all() {
                            let result = checker.check_platform(*platform).await;
                            let name = format!("{:?}", platform);
                            map.insert(name.clone(), AuthStatus {
                                platform: name,
                                authenticated: result.authenticated,
                                method: if result.message.contains("environment variable") {
                                    crate::views::login::AuthMethod::EnvVar
                                } else {
                                    crate::views::login::AuthMethod::CliLogin
                                },
                                hint: result.message.clone(),
                            });
                        }
                        let gh = checker.check_github().await;
                        map.insert("GitHub".to_string(), AuthStatus {
                            platform: "GitHub".to_string(),
                            authenticated: gh.authenticated,
                            method: crate::views::login::AuthMethod::CliLogin,
                            hint: gh.message.clone(),
                        });
                        map
                    },
                    Message::AuthStatusReceived,
                )
            }

            Message::PlatformLogout(target) => {
                self.login_in_progress.insert(target, AuthActionKind::Logout);
                let target_copy = target;
                Task::perform(
                    async move {
                        crate::platforms::spawn_logout(target_copy).await
                            .map_err(|e| e.to_string())
                    },
                    move |res| Message::PlatformLogoutComplete(target_copy, res),
                )
            }

            Message::PlatformLogoutComplete(target, res) => {
                self.login_in_progress.remove(&target);
                match &res {
                    Ok(()) => self.add_toast(ToastType::Success, format!("{} logout completed", target.display_name())),
                    Err(e) => self.add_toast(ToastType::Error, format!("{} logout failed: {}", target.display_name(), e)),
                }
                Task::perform(
                    async {
                        let checker = crate::platforms::AuthStatusChecker::new();
                        let mut map: HashMap<String, AuthStatus> = HashMap::new();
                        for platform in crate::types::Platform::all() {
                            let result = checker.check_platform(*platform).await;
                            let name = format!("{:?}", platform);
                            map.insert(name.clone(), AuthStatus {
                                platform: name,
                                authenticated: result.authenticated,
                                method: if result.message.contains("environment variable") {
                                    crate::views::login::AuthMethod::EnvVar
                                } else {
                                    crate::views::login::AuthMethod::CliLogin
                                },
                                hint: result.message.clone(),
                            });
                        }
                        let gh = checker.check_github().await;
                        map.insert("GitHub".to_string(), AuthStatus {
                            platform: "GitHub".to_string(),
                            authenticated: gh.authenticated,
                            method: crate::views::login::AuthMethod::CliLogin,
                            hint: gh.message.clone(),
                        });
                        map
                    },
                    Message::AuthStatusReceived,
                )
            }

            Message::SetupInstall(platform) => {
                self.setup_installing = Some(platform);
                let platform_copy = platform;
                Task::perform(
                    async move {
                        let manager = crate::doctor::InstallationManager::new();
                        match manager.execute_install(platform_copy) {
                            Ok(r) => if r.success { Ok(()) } else { Err(r.message) },
                            Err(e) => Err(e.to_string()),
                        }
                    },
                    move |res| Message::SetupInstallComplete(platform_copy, res),
                )
            }

            Message::SetupInstallComplete(platform, res) => {
                self.setup_installing = None;
                match &res {
                    Ok(()) => self.add_toast(ToastType::Success, format!("{} installed", platform)),
                    Err(e) => self.add_toast(ToastType::Error, format!("{} install failed: {}", platform, e)),
                }
                self.update(Message::SetupRunDetection)
            }

            Message::RefreshDoctor => {
                self.update(Message::RunAllChecks)
            }

            Message::RefreshSetup => {
                self.update(Message::SetupRunDetection)
            }

            // ================================================================
            // Toasts
            // ================================================================
            Message::DismissToast(id) => {
                self.toasts.retain(|t| t.id != id);
                Task::none()
            }

            Message::AddToast(toast_type, message) => {
                self.add_toast(toast_type, message);
                Task::none()
            }

            // ================================================================
            // Modal
            // ================================================================
            Message::OpenModal(content) => {
                self.show_modal = Some(content);
                Task::none()
            }

            Message::CloseModal => {
                self.show_modal = None;
                Task::none()
            }

            // ================================================================
            // Tick
            // ================================================================
            Message::Tick(_now) => {
                // Clean up old toasts (older than 5 seconds)
                let cutoff = Instant::now() - std::time::Duration::from_secs(5);
                self.toasts.retain(|t| t.created > cutoff);
                Task::none()
            }

            // ================================================================
            // Window Events
            // ================================================================
            Message::WindowCloseRequested(_id) => {
                if self.minimize_to_tray {
                    // Minimize to tray instead of exiting
                    window::latest().and_then(|id| window::minimize(id, true))
                } else {
                    // Fully exit
                    self.shutdown.store(true, Ordering::SeqCst);
                    self.send_command(AppCommand::Stop);
                    iced::exit()
                }
            }

            // ================================================================
            // No-op
            // ================================================================
            Message::None => Task::none(),
        }
    }

    /// Render the application UI
    pub fn view(&self) -> Element<'_, Message> {
        use crate::views;
        use iced::widget::{column, container};

        // Build main content based on current page
        let content: Element<Message> = match self.current_page {
            Page::Dashboard => views::dashboard::view(
                &self.orchestrator_status,
                &self.current_item,
                &self.progress,
                &self.output_lines,
                &self.budgets,
                &self.last_error,
                &self.start_time,
                &self.theme,
            ),
            Page::Projects => views::projects::view(
                &self.projects, &self.current_project, "", "", false, &self.theme,
            ),
            Page::Wizard => views::wizard::view(
                self.wizard_step, &self.wizard_requirements_text, &self.wizard_prd_preview, &self.theme,
            ),
            Page::Config => views::config::view(
                &self.config_text, self.config_valid, &self.config_error, &self.theme,
            ),
            Page::Doctor => views::doctor::view(&self.doctor_results, self.doctor_running, &self.doctor_fixing, &self.theme),
            Page::Tiers => views::tiers::view(&self.tier_tree, &self.selected_tier, &self._no_tier_details, &self.theme),
            Page::Evidence => views::evidence::view(&self.evidence_items, &self.evidence_filter, &self._empty_string_vec, &self.theme),
            Page::Metrics => views::metrics::view(&self.metrics, &self.theme),
            Page::History => views::history::view(&self.history_sessions, self.history_page, 1, &self.theme),
            Page::Coverage => views::coverage::view(0.0, &self._empty_coverage, &self.theme),
            Page::Memory => views::memory::view("", &self._memory_section, &self.theme),
            Page::Ledger => views::ledger::view(&self.ledger_entries, &self.ledger_filter, &self._empty_string_vec, &self.theme),
            Page::Login => views::login::view(&self.platform_auth_status, &self.login_in_progress, &self.theme),
            Page::Settings => views::settings::view(
                &self.theme, views::settings::LogLevel::Info, views::settings::AutoScroll::Enabled, true,
                self.minimize_to_tray,
            ),
            Page::Setup => views::setup::view(
                &self.setup_platform_statuses,
                self.setup_is_checking,
                self.setup_installing,
                &self.login_in_progress,
                &self.theme,
            ),
        };

        // Build the full layout
        let main_layout = column![
            self.render_header(),
            content,
        ]
        .spacing(0);

        // Wrap in container
        let base = container(main_layout)
            .width(iced::Length::Fill)
            .height(iced::Length::Fill);

        // Add toasts overlay
        let with_toasts = self.render_toasts_overlay(base.into());

        // Add modal overlay if present
        if let Some(ref modal) = self.show_modal {
            self.render_modal_overlay(with_toasts, modal)
        } else {
            with_toasts
        }
    }

    /// Get the current theme
    pub fn theme(&self) -> Theme {
        match self.theme {
            AppTheme::Light => Theme::Light,
            AppTheme::Dark => Theme::Dark,
        }
    }

    /// Set up subscriptions for events
    pub fn subscription(&self) -> Subscription<Message> {
        use iced::time;

        let mut subscriptions = vec![];

        // Timer tick every second
        subscriptions.push(
            time::every(std::time::Duration::from_secs(1))
                .map(|_| Message::Tick(Utc::now()))
        );

        // Backend event receiver
        if let Some(ref receiver) = self.event_receiver {
            subscriptions.push(
                Subscription::<PuppetMasterEvent>::run_with(
                    BackendEventSubscription {
                        receiver: receiver.clone(),
                    },
                    backend_event_stream,
                )
                .map(Message::EventReceived),
            );
        }

        // Tray action receiver
        if let Some(ref receiver) = self.tray_action_receiver {
            subscriptions.push(
                Subscription::<TrayAction>::run_with(
                    TrayActionSubscription {
                        receiver: receiver.clone(),
                    },
                    tray_action_stream,
                )
                .map(Message::TrayAction),
            );
        }

        // Window close events
        subscriptions.push(
            iced::event::listen_with(|event, _status, id| {
                if let iced::Event::Window(window::Event::CloseRequested) = event {
                    Some(Message::WindowCloseRequested(id))
                } else {
                    None
                }
            })
        );

        Subscription::batch(subscriptions)
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    /// Send a command to the backend orchestrator
    fn send_command(&self, command: AppCommand) {
        if let Some(ref sender) = self.command_sender {
            let sender = sender.clone();
            tokio::spawn(async move {
                let _ = sender.send(command).await;
            });
        }
    }

    /// Handle an event from the backend
    fn handle_backend_event(&mut self, event: PuppetMasterEvent) {
        self.metrics_collector.record_event(&event);
        self.metrics = self.metrics_collector.snapshot();

        match &event {
            PuppetMasterEvent::StateChanged { from: _, to, .. } => {
                self.orchestrator_status = format!("{:?}", to);
            }
            PuppetMasterEvent::IterationStart { item_id, platform, model, reasoning_effort, session_id, timestamp, .. } => {
                self.history_active_by_item
                    .entry(item_id.clone())
                    .or_default()
                    .push(session_id.clone());

                if let Some(existing) = self.history_sessions.iter_mut().find(|s| s.id == *session_id) {
                    existing.start_time = *timestamp;
                    existing.end_time = None;
                    existing.status = crate::views::history::SessionStatus::Running;
                    existing.platform = Some(format!("{:?}", platform));
                    existing.model = Some(model.clone());
                    existing.reasoning_effort = reasoning_effort.clone();
                } else {
                    self.history_sessions.insert(
                        0,
                        SessionInfo {
                            id: session_id.clone(),
                            start_time: *timestamp,
                            end_time: None,
                            status: crate::views::history::SessionStatus::Running,
                            items_completed: 0,
                            items_total: 1,
                            expanded: false,
                            phases: vec![format!("Item: {}", item_id)],
                            platform: Some(format!("{:?}", platform)),
                            model: Some(model.clone()),
                            reasoning_effort: reasoning_effort.clone(),
                        },
                    );

                    if self.history_sessions.len() > 200 {
                        self.history_sessions.truncate(200);
                    }
                }

                self.current_item = Some(CurrentItem {
                    phase_id: item_id.clone(),
                    phase_name: "Iteration".to_string(),
                    task_id: None,
                    task_name: None,
                    subtask_id: None,
                    subtask_name: None,
                    iteration: 0,
                    status: "running".to_string(),
                    platform: Some(format!("{:?}", platform)),
                    model: Some(model.clone()),
                    reasoning_effort: reasoning_effort.clone(),
                });
            }
            PuppetMasterEvent::IterationComplete { item_id, success, timestamp, .. } => {
                if let Some(ref item) = self.current_item {
                    if item.phase_id == *item_id {
                        self.current_item = None;
                    }
                }

                let session_id = if let Some(stack) = self.history_active_by_item.get_mut(item_id) {
                    let sid = stack.pop();
                    if stack.is_empty() {
                        self.history_active_by_item.remove(item_id);
                    }
                    sid
                } else {
                    None
                };

                if let Some(sid) = session_id {
                    if let Some(session) = self.history_sessions.iter_mut().find(|s| s.id == sid) {
                        session.end_time = Some(*timestamp);
                        session.status = if *success {
                            crate::views::history::SessionStatus::Completed
                        } else {
                            crate::views::history::SessionStatus::Failed
                        };
                        session.items_total = 1;
                        session.items_completed = if *success { 1 } else { 0 };
                    }
                }
            }
            PuppetMasterEvent::Progress { phase_progress, task_progress, subtask_progress, overall_progress, .. } => {
                self.progress = ProgressState {
                    phase_current: *phase_progress as usize,
                    phase_total: 100,
                    task_current: *task_progress as usize,
                    task_total: 100,
                    subtask_current: *subtask_progress as usize,
                    subtask_total: 100,
                    overall_percent: *overall_progress as f32,
                };
            }
            PuppetMasterEvent::Output { line, source: _, line_type: _, timestamp } => {
                self.output_lines.push(OutputLine {
                    timestamp: *timestamp,
                    line_type: OutputType::Stdout,
                    text: line.clone(),
                });
                // Keep only last 1000 lines
                if self.output_lines.len() > 1000 {
                    self.output_lines.remove(0);
                }
            }
            PuppetMasterEvent::Error { message, .. } => {
                self.last_error = Some(message.clone());
                self.add_toast(ToastType::Error, message.clone());
            }
            PuppetMasterEvent::StartChainStep { step, total, description, .. } => {
                // Show progress for wizard PRD generation
                self.add_toast(
                    ToastType::Info,
                    format!("Step {}/{}: {}", step, total, description)
                );
            }
            PuppetMasterEvent::StartChainComplete { success, message, .. } => {
                if *success {
                    self.add_toast(
                        ToastType::Success,
                        message.clone().unwrap_or_else(|| "PRD generation completed".to_string())
                    );
                } else {
                    self.add_toast(
                        ToastType::Error,
                        message.clone().unwrap_or_else(|| "PRD generation failed".to_string())
                    );
                }
            }
            PuppetMasterEvent::Custom { event_type, data, .. } => {
                // Handle WizardPrdGenerated event
                if event_type == "WizardPrdGenerated" {
                    if let Some(prd_json) = data.get("prd").and_then(|v| v.as_str()) {
                        self.wizard_prd_preview = Some(prd_json.to_string());
                    }
                }
            }
            // Ignore other events
            _ => {}
        }
    }

    /// Add a toast notification
    fn add_toast(&mut self, toast_type: ToastType, message: String) {
        let id = self.next_toast_id;
        self.next_toast_id += 1;

        self.toasts.push(Toast {
            id,
            toast_type,
            message,
            created: Instant::now(),
        });
    }

    /// Render the header bar
    fn render_header(&self) -> Element<'_, Message> {
        use iced::widget::{button, container, row, text};

        let nav_buttons = row![
            self.nav_button("Dashboard", Page::Dashboard),
            self.nav_button("Projects", Page::Projects),
            self.nav_button("Wizard", Page::Wizard),
            self.nav_button("Config", Page::Config),
            self.nav_button("Doctor", Page::Doctor),
            self.nav_button("Tiers", Page::Tiers),
            self.nav_button("Evidence", Page::Evidence),
            self.nav_button("Metrics", Page::Metrics),
            self.nav_button("History", Page::History),
            self.nav_button("Ledger", Page::Ledger),
            self.nav_button("Login", Page::Login),
            self.nav_button("Settings", Page::Settings),
        ]
        .spacing(4);

        let theme_button = button(text("🌓"))
            .on_press(Message::ToggleTheme);

        let header = row![
            nav_buttons,
            theme_button,
        ]
        .spacing(16)
        .padding(8);

        container(header)
            .width(iced::Length::Fill)
            .into()
    }

    /// Create a navigation button
    fn nav_button<'a>(&self, label: &'a str, page: Page) -> Element<'a, Message> {
        use iced::widget::{button, text};

        let _is_active = self.current_page == page;
        let btn = button(text(label))
            .on_press(Message::NavigateTo(page));

        // TODO: Apply different styling for active button
        btn.into()
    }

    /// Render toast notifications overlay
    fn render_toasts_overlay<'a>(&'a self, base: Element<'a, Message>) -> Element<'a, Message> {
        use iced::widget::{column, container, stack};

        if self.toasts.is_empty() {
            return base;
        }

        let toasts_column = column(
            self.toasts.iter().map(|toast| {
                self.render_toast(toast)
            })
        )
        .spacing(8)
        .padding(16);

        let toasts_container = container(toasts_column)
            .width(iced::Length::Shrink)
            .height(iced::Length::Shrink);

        stack![base, toasts_container].into()
    }

    /// Render a single toast
    fn render_toast<'a>(&self, toast: &'a Toast) -> Element<'a, Message> {
        use iced::widget::{button, container, row, text};

        let icon = match toast.toast_type {
            ToastType::Success => "✓",
            ToastType::Error => "✗",
            ToastType::Warning => "⚠",
            ToastType::Info => "ℹ",
        };

        let content = row![
            text(icon),
            text(&toast.message),
            button(text("✕")).on_press(Message::DismissToast(toast.id)),
        ]
        .spacing(8)
        .padding(8);

        container(content).into()
    }

    /// Render modal overlay
    fn render_modal_overlay<'a>(&self, base: Element<'a, Message>, modal: &'a ModalContent) -> Element<'a, Message> {
        use iced::widget::{button, column, container, stack, text};

        let modal_content = match modal {
            ModalContent::Confirm { title, message, on_confirm } => {
                column![
                    text(title),
                    text(message),
                    button(text("Confirm")).on_press((**on_confirm).clone()),
                    button(text("Cancel")).on_press(Message::CloseModal),
                ]
                .spacing(8)
                .padding(16)
            }
            ModalContent::Error { title, details } => {
                column![
                    text(title),
                    text(details),
                    button(text("Close")).on_press(Message::CloseModal),
                ]
                .spacing(8)
                .padding(16)
            }
        };

        let modal_container = container(modal_content)
            .width(iced::Length::Shrink)
            .height(iced::Length::Shrink);

        stack![base, modal_container].into()
    }
}

// ============================================================================
// Entry Point
// ============================================================================

/// Run the Iced application
pub fn run(shutdown: Arc<AtomicBool>) -> Result<()> {
    // Create tray icon (keep manager alive for app lifetime)
    let (_tray_manager, tray_action_rx) = crate::tray::create_tray_icon()?;

    // Orchestrator command/event channels
    let (event_tx, event_rx) = crossbeam_channel::unbounded::<PuppetMasterEvent>();
    let (command_tx, command_rx) = tokio::sync::mpsc::channel::<AppCommand>(32);

    spawn_orchestrator_backend(command_rx, event_tx);

    // Ensure receivers are moved into the App exactly once (avoid competing clones)
    let event_rx = Arc::new(Mutex::new(Some(event_rx)));
    let tray_action_rx = Arc::new(Mutex::new(Some(tray_action_rx)));

    // Launch Iced application
    let shutdown_clone = shutdown.clone();
    iced::application(
        move || {
            let (mut app, task) = App::new(shutdown_clone.clone());
            app.command_sender = Some(command_tx.clone());
            app.event_receiver = event_rx.lock().unwrap().take();
            app.tray_action_receiver = tray_action_rx.lock().unwrap().take();
            (app, task)
        },
        App::update,
        App::view,
    )
    .title("RWM Puppet Master")
    .theme(App::theme)
    .subscription(App::subscription)
    .window_size(iced::Size::new(1280.0, 800.0))
    .run()?;

    Ok(())
}

fn spawn_orchestrator_backend(
    mut command_rx: tokio::sync::mpsc::Receiver<AppCommand>,
    event_tx: crossbeam_channel::Sender<PuppetMasterEvent>,
) {
    std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_multi_thread()
            .enable_all()
            .build()
            .expect("Failed to create tokio runtime");

        rt.block_on(async move {
            let config_manager = crate::config::ConfigManager::discover().unwrap_or_default();
            let config = config_manager.get_config();

            let orchestrator = match crate::core::Orchestrator::new(config.clone()) {
                Ok(o) => Arc::new(o),
                Err(e) => {
                    let _ = event_tx.send(PuppetMasterEvent::error(
                        format!("Failed to create orchestrator: {}", e),
                        "orchestrator",
                    ));
                    return;
                }
            };

            // Best-effort PRD load (if present)
            if let Ok(content) = std::fs::read_to_string(&config.paths.prd_path) {
                if let Ok(prd) = serde_json::from_str::<crate::types::PRD>(&content) {
                    let _ = orchestrator.load_prd(&prd).await;
                }
            }

            // Forward orchestrator events to GUI event channel
            let orch_rx = orchestrator.event_receiver().clone();
            let event_tx_clone = event_tx.clone();
            let config_clone = config.clone();
            tokio::spawn(async move {
                loop {
                    match orch_rx.try_recv() {
                        Ok(ev) => {
                            if let Some(mapped) = map_orchestrator_event(ev, &config_clone) {
                                let _ = event_tx_clone.send(mapped);
                            }
                        }
                        Err(crossbeam_channel::TryRecvError::Empty) => {
                            tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
                        }
                        Err(crossbeam_channel::TryRecvError::Disconnected) => break,
                    }
                }
            });

            let mut run_handle: Option<tokio::task::JoinHandle<()>> = None;

            while let Some(cmd) = command_rx.recv().await {
                match cmd {
                    AppCommand::Start => {
                        if run_handle.as_ref().is_some_and(|h| !h.is_finished()) {
                            continue;
                        }

                        let orch = orchestrator.clone();
                        let event_tx = event_tx.clone();
                        run_handle = Some(tokio::spawn(async move {
                            if let Err(e) = orch.run().await {
                                let _ = event_tx.send(PuppetMasterEvent::error(
                                    format!("Orchestrator run failed: {}", e),
                                    "orchestrator",
                                ));
                            }
                        }));
                    }
                    AppCommand::Pause => {
                        if let Err(e) = orchestrator.pause().await {
                            let _ = event_tx.send(PuppetMasterEvent::error(
                                format!("Pause failed: {}", e),
                                "orchestrator",
                            ));
                        }
                    }
                    AppCommand::Resume => {
                        if let Err(e) = orchestrator.resume().await {
                            let _ = event_tx.send(PuppetMasterEvent::error(
                                format!("Resume failed: {}", e),
                                "orchestrator",
                            ));
                        }
                    }
                    AppCommand::Stop => {
                        if let Err(e) = orchestrator.stop().await {
                            let _ = event_tx.send(PuppetMasterEvent::error(
                                format!("Stop failed: {}", e),
                                "orchestrator",
                            ));
                        }
                    }
                    AppCommand::Reset => {
                        if let Err(e) = orchestrator.reset().await {
                            let _ = event_tx.send(PuppetMasterEvent::error(
                                format!("Reset failed: {}", e),
                                "orchestrator",
                            ));
                        }
                    }
                    AppCommand::Retry(item_id) => {
                        let _ = event_tx.send(PuppetMasterEvent::log(
                            crate::types::LogLevel::Info,
                            format!("Retry requested for {}", item_id),
                            "gui",
                        ));
                    }
                    AppCommand::Replan(item_id) => {
                        let _ = event_tx.send(PuppetMasterEvent::log(
                            crate::types::LogLevel::Info,
                            format!("Replan requested for {}", item_id),
                            "gui",
                        ));
                    }
                    AppCommand::Reopen(item_id) => {
                        let _ = event_tx.send(PuppetMasterEvent::log(
                            crate::types::LogLevel::Info,
                            format!("Reopen requested for {}", item_id),
                            "gui",
                        ));
                    }
                    AppCommand::Kill(pid) => {
                        let event_tx = event_tx.clone();
                        tokio::task::spawn_blocking(move || {
                            let res = crate::utils::process::kill_process(pid, crate::utils::process::Signal::Kill);
                            let msg = match res {
                                Ok(()) => PuppetMasterEvent::ProcessKilled {
                                    pid,
                                    reason: "Killed via GUI".to_string(),
                                    timestamp: Utc::now(),
                                },
                                Err(e) => PuppetMasterEvent::error(
                                    format!("Failed to kill process {}: {}", pid, e),
                                    "process",
                                ),
                            };
                            let _ = event_tx.send(msg);
                        });
                    }
                    AppCommand::StartChainPipeline(requirements_text) => {
                        let event_tx = event_tx.clone();
                        let config_clone = config.clone();
                        
                        tokio::spawn(async move {
                            use crate::start_chain::{StartChainPipeline, StartChainParams, RequirementsInput};
                            use crate::platforms::PlatformRegistry;
                            
                            // Convert event_tx to tokio unbounded sender by spawning a forwarding task
                            let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();
                            let event_tx_clone = event_tx.clone();
                            tokio::spawn(async move {
                                while let Some(event) = rx.recv().await {
                                    let _ = event_tx_clone.send(event);
                                }
                            });
                            
                            // Create platform registry for AI execution
                            let platform_registry = Arc::new(PlatformRegistry::new());
                            if let Err(e) = platform_registry.init_default().await {
                                let _ = event_tx.send(PuppetMasterEvent::error(
                                    format!("Failed to initialize platform registry: {}", e),
                                    "start_chain",
                                ));
                            }
                            
                            // Create pipeline with config and dependencies
                            let pipeline = StartChainPipeline::new(config_clone.clone().into())
                                .with_platform_registry(platform_registry)
                                .with_event_tx(tx);
                            
                            // Setup parameters - use a simple project name from requirements
                            let project_name = requirements_text
                                .lines()
                                .find(|l| l.starts_with('#'))
                                .and_then(|l| l.strip_prefix('#').map(|s| s.trim()))
                                .unwrap_or("Project")
                                .to_string();
                            
                            let params = StartChainParams::new(
                                project_name,
                                RequirementsInput::Text(requirements_text)
                            );
                            
                            // Run pipeline
                            match pipeline.run(params).await {
                                Ok(result) => {
                                    // Serialize PRD to JSON for preview
                                    match serde_json::to_string_pretty(&result.prd) {
                                        Ok(prd_json) => {
                                            // Send custom event with PRD preview
                                            let _ = event_tx.send(PuppetMasterEvent::Custom {
                                                event_type: "WizardPrdGenerated".to_string(),
                                                data: serde_json::json!({
                                                    "prd": prd_json
                                                }),
                                                timestamp: Utc::now(),
                                            });
                                        }
                                        Err(e) => {
                                            let _ = event_tx.send(PuppetMasterEvent::error(
                                                format!("Failed to serialize PRD: {}", e),
                                                "start_chain",
                                            ));
                                            let _ = event_tx.send(PuppetMasterEvent::StartChainComplete {
                                                success: false,
                                                message: Some(format!("Serialization failed: {}", e)),
                                                timestamp: Utc::now(),
                                            });
                                        }
                                    }
                                }
                                Err(e) => {
                                    let _ = event_tx.send(PuppetMasterEvent::error(
                                        format!("Pipeline failed: {}", e),
                                        "start_chain",
                                    ));
                                    let _ = event_tx.send(PuppetMasterEvent::StartChainComplete {
                                        success: false,
                                        message: Some(format!("Pipeline error: {}", e)),
                                        timestamp: Utc::now(),
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });
    });
}

fn map_orchestrator_event(
    event: crate::core::state_machine::OrchestratorEvent,
    config: &crate::types::PuppetMasterConfig,
) -> Option<PuppetMasterEvent> {
    use crate::core::state_machine::OrchestratorEvent;

    match event {
        OrchestratorEvent::StateChanged { old_state, new_state } => Some(PuppetMasterEvent::StateChanged {
            from: old_state,
            to: new_state,
            timestamp: Utc::now(),
            reason: None,
        }),
        OrchestratorEvent::IterationStarted { tier_id, iteration } => Some(PuppetMasterEvent::IterationStart {
            item_id: tier_id,
            platform: config.tiers.iteration.platform,
            model: config.tiers.iteration.model.clone(),
            reasoning_effort: config.tiers.iteration.reasoning_effort.clone(),
            attempt: iteration,
            session_id: "unknown".to_string(),
            timestamp: Utc::now(),
        }),
        OrchestratorEvent::IterationCompleted {
            tier_id,
            iteration: _,
            success,
        } => Some(PuppetMasterEvent::IterationComplete {
            item_id: tier_id,
            success,
            duration_ms: 0,
            output_summary: None,
            timestamp: Utc::now(),
        }),
        OrchestratorEvent::OutputLine {
            tier_id,
            line,
            line_type,
        } => Some(PuppetMasterEvent::Output {
            line,
            source: tier_id,
            line_type,
            timestamp: Utc::now(),
        }),
        OrchestratorEvent::Error(message) => Some(PuppetMasterEvent::error(message, "orchestrator")),
        _ => None,
    }
}
