use crate::theme::AppTheme;
use crate::tray::TrayAction;
use crate::types::PuppetMasterEvent;
use crate::widgets::Page;
use anyhow::Result;
use chrono::{DateTime, Utc};
use iced::{widget::text_editor, window, Element, Subscription, Task, Theme};
use std::collections::{HashMap, HashSet};
use std::hash::{Hash, Hasher};
use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

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

// Re-use Toast types from widgets module
pub use crate::widgets::{Toast, ToastManager, ToastType};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthActionKind {
    Login,
    Logout,
}

#[derive(Debug, Clone)]
pub struct GitInfoDisplay {
    pub user_name: String,
    pub user_email: String,
    pub remote_url: String,
    pub current_branch: String,
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
pub use crate::state::{MetricsCollector, MetricsSnapshot};
pub use crate::views::dashboard::{
    BudgetDisplayInfo, CurrentItem, OutputLine, OutputType, ProgressState,
};
pub use crate::views::doctor::DoctorCheckResult;
pub use crate::views::evidence::{EvidenceFilter, EvidenceItem};
pub use crate::views::history::SessionInfo;
pub use crate::views::ledger::{LedgerEntry, LedgerFilter};
pub use crate::views::login::AuthStatus;
pub use crate::views::projects::ProjectInfo;
pub use crate::views::setup::PlatformStatus;
pub use crate::views::tiers::TierDisplayNode;

// ============================================================================
// Wizard Types
// ============================================================================

/// Configuration for a single tier in the wizard
#[derive(Debug, Clone)]
pub struct WizardTierConfig {
    pub platform: String,
    pub model: String,
    pub reasoning_effort: String,
    pub plan_mode: bool,
    pub ask_mode: bool,
    pub output_format: String,
}

impl Default for WizardTierConfig {
    fn default() -> Self {
        Self {
            platform: "cursor".to_string(),
            model: "auto".to_string(),
            reasoning_effort: "medium".to_string(),
            plan_mode: true,
            ask_mode: false,
            output_format: "markdown".to_string(),
        }
    }
}

// ============================================================================
// Main App State
// ============================================================================

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
    pub terminal_editor_content: text_editor::Content,
    terminal_interaction_until: Option<std::time::Instant>,
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
    pub doctor_platform_selector_visible: bool,
    pub doctor_selected_platforms: Vec<crate::types::Platform>,
    pub doctor_expanded_checks: HashSet<String>,
    pub doctor_detail_contents: HashMap<String, text_editor::Content>,

    // Config
    pub config_text: String,
    pub config_editor_content: text_editor::Content,
    pub config_valid: bool,
    pub config_error: Option<String>,
    pub config_active_tab: usize, // 0-7 for the 8 tabs (Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML)
    pub config_is_dirty: bool,
    pub gui_config: crate::config::gui_config::GuiConfig,
    pub config_models: HashMap<String, Vec<String>>,
    pub config_git_info: Option<crate::config::gui_config::GitInfo>,

    // Tiers
    pub tier_tree: Vec<TierDisplayNode>,
    pub selected_tier: Option<String>,
    pub tier_details_content: text_editor::Content,
    pub expanded_tiers: HashSet<String>,
    pub selected_tier_details: Option<crate::views::tiers::TierDetails>,

    // Evidence
    pub evidence_items: Vec<EvidenceItem>,
    pub evidence_filter: EvidenceFilter,
    pub evidence_selected_item: Option<usize>,
    pub evidence_preview_content: text_editor::Content,
    pub evidence_preview_path: Option<String>,

    // History
    pub history_sessions: Vec<SessionInfo>,
    pub history_page: usize,
    history_active_by_item: HashMap<String, Vec<String>>,
    pub history_filter: Option<crate::views::history::SessionStatus>,
    pub history_search: String,
    pub history_items_per_page: usize,
    pub history_display_sessions: Vec<crate::views::history::SessionInfo>,
    pub history_total_pages: usize,

    // Metrics
    pub metrics: MetricsSnapshot,
    metrics_collector: MetricsCollector,

    // Ledger
    pub ledger_entries: Vec<LedgerEntry>,
    pub ledger_filter: LedgerFilter,
    pub ledger_expanded_entries: HashSet<usize>,
    pub ledger_expanded_contents: HashMap<usize, text_editor::Content>,
    pub ledger_expanded_events: HashSet<usize>,
    pub ledger_filter_tier: String,
    pub ledger_filter_session: String,

    // Login
    pub platform_auth_status: HashMap<String, AuthStatus>,
    pub login_in_progress: HashMap<crate::platforms::AuthTarget, AuthActionKind>,
    pub login_messages: HashMap<String, String>, // platform -> login result message
    pub login_auth_urls: HashMap<String, String>, // platform -> auth URL from login
    pub git_info: Option<GitInfoDisplay>,        // git user, email, remote
    pub github_auth_status: Option<String>,      // "authenticated" or "not_authenticated"
    pub setup_installing: Option<crate::types::Platform>,
    pub login_cli_content: text_editor::Content,

    // Projects
    pub new_project_name: String,
    pub new_project_path: String,
    pub show_new_project_form: bool,

    // Wizard
    pub wizard_step: usize,
    // Step 0: Project Setup
    pub wizard_is_new_project: bool,
    pub wizard_has_github_repo: bool,
    pub wizard_github_url: String,
    pub wizard_create_github_repo: bool,
    pub wizard_github_visibility: String, // "public" or "private"
    pub wizard_github_description: String,
    // Step 0.5: Quick Interview Config
    pub wizard_use_interview: bool,
    pub wizard_interaction_mode: String, // "expert" or "eli5"
    pub wizard_reasoning_level: String,  // "low", "medium", "high"
    pub wizard_generate_agents_md: bool,
    // Original wizard fields
    pub wizard_project_name: String,
    pub wizard_project_path: String,
    pub wizard_requirements_text: String,
    pub wizard_prd_platform: String,
    pub wizard_prd_model: String,
    pub wizard_prd_text: String, // generated PRD (editable in step 3)
    pub wizard_prd_editor_content: text_editor::Content,
    pub wizard_prd_preview: Option<String>, // kept for compatibility
    pub wizard_tier_configs: HashMap<String, WizardTierConfig>, // "phase"/"task"/"subtask"/"iteration"
    pub wizard_plan_text: String,
    pub wizard_generating: bool,                     // loading state
    pub wizard_models: HashMap<String, Vec<String>>, // platform -> model list
    pub wizard_requirements_preview_content: text_editor::Content,
    pub wizard_plan_content: text_editor::Content,

    // Interview
    pub interview_active: bool,
    pub interview_paused: bool,
    pub interview_current_phase: String,
    pub interview_current_question: String,
    pub interview_answers: Vec<String>,
    pub interview_phases_complete: Vec<String>,
    pub interview_answer_input: String,

    // Setup
    pub setup_platform_statuses: Vec<PlatformStatus>,
    pub setup_is_checking: bool,

    // UI State
    pub toasts: Vec<Toast>,
    pub show_modal: Option<ModalContent>,
    next_toast_id: usize,

    // Page transitions
    pub page_transition: crate::widgets::TransitionState,
    pub previous_page: Option<Page>,

    // Animation time
    pub animation_time: f32,
    last_tick_time: Option<DateTime<Utc>>,

    // Window size
    pub window_width: f32,
    pub window_height: f32,

    // Retro overlay effects
    pub retro_overlay: crate::widgets::RetroOverlay,

    // Settings
    pub minimize_to_tray: bool,
    pub settings_log_level: String,
    pub settings_auto_scroll: bool,
    pub settings_show_timestamps: bool,
    pub settings_retention_days: u32,
    pub settings_intensive_logging: bool,

    // Backend channels
    pub event_receiver: Option<crossbeam_channel::Receiver<PuppetMasterEvent>>,
    pub command_sender: Option<tokio::sync::mpsc::Sender<AppCommand>>,

    // Tray
    pub tray_action_receiver: Option<crossbeam_channel::Receiver<TrayAction>>,

    // Shutdown flag
    shutdown: Arc<AtomicBool>,

    // Memory
    pub memory_content: text_editor::Content,
    pub memory_content_string: String,
    pub memory_section: crate::views::memory::MemorySection,
    pub memory_loading: bool,

    // Metrics
    pub metrics_summary_content: text_editor::Content,

    // Coverage
    pub coverage_phase_filter: String,
    pub coverage_requirements: Vec<crate::views::coverage::RequirementCoverage>,
    pub coverage_categories: Vec<crate::views::coverage::CategoryCoverage>,
    pub coverage_overall: f32,

    // View helper data (constant placeholders stored as fields to avoid borrow issues)
    _empty_string_vec: Vec<String>,
    _no_tier_details: Option<crate::views::tiers::TierDetails>,
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
    OpenProjectFolderPicker,
    ProjectFolderSelected(Option<PathBuf>),
    ProjectsRefresh,
    ProjectsLoaded(Vec<ProjectInfo>),
    BrowseNewProjectPath,
    NewProjectPathSelected(Option<PathBuf>),
    CreateNewProject,
    ProjectCreated(Result<(), String>),

    // Config
    ConfigTextChanged(String),
    ConfigEditorAction(text_editor::Action),
    ConfigTabChanged(usize),
    ConfigFieldChanged(String, String), // field_path, new_value
    SaveConfig,
    ReloadConfig,
    ValidateConfig,
    RefreshModels,
    // New GUI config messages
    ConfigTierPlatformChanged(String, String), // tier_name, platform
    ConfigTierModelChanged(String, String),
    ConfigTierReasoningChanged(String, String),
    ConfigTierPlanModeToggled(String),
    ConfigTierAskModeToggled(String),
    ConfigTierOutputFormatChanged(String, String),
    ConfigTierMaxIterChanged(String, String),
    ConfigTierFailureStyleChanged(String, String),
    ConfigBranchingFieldChanged(String, String),
    ConfigGranularityChanged(String),
    ConfigVerificationFieldChanged(String, String),
    ConfigVerificationScreenshotToggled,
    BrowseEvidenceDirectory,
    EvidenceDirectorySelected(Option<PathBuf>),
    ConfigMemoryFieldChanged(String, String),
    ConfigMemoryMultiLevelToggled,
    BrowseMemoryProgressFile,
    BrowseMemoryAgentsFile,
    BrowseMemoryPrdFile,
    MemoryProgressFileSelected(Option<PathBuf>),
    MemoryAgentsFileSelected(Option<PathBuf>),
    MemoryPrdFileSelected(Option<PathBuf>),
    ConfigBudgetFieldChanged(String, String, String), // platform, field, value
    ConfigAdvancedFieldChanged(String, String),
    ConfigAdvancedCheckboxToggled(String),
    LoadConfigResult(Result<crate::config::gui_config::GuiConfig, String>),
    LoadGitInfo,
    GitInfoLoaded(Option<crate::config::gui_config::GitInfo>),

    // Doctor
    RunAllChecks,
    RunCheck(String),
    FixCheck(String, bool), // name, dry_run
    DoctorResultsReceived(Vec<DoctorCheckResult>),
    DoctorCheckResultReceived(DoctorCheckResult),
    DoctorRunFailed(ToastType, String),
    ToggleDoctorPlatformSelector,
    ToggleDoctorPlatform(crate::types::Platform),
    ToggleDoctorCheckExpand(String), // check name
    InstallAllMissing,

    // Wizard
    WizardNextStep,
    WizardPrevStep,
    // Step 0: Project Setup
    WizardIsNewProjectToggled(bool),
    WizardHasGithubRepoToggled(bool),
    WizardGithubUrlChanged(String),
    WizardCreateGithubRepoToggled(bool),
    WizardGithubVisibilityChanged(String),
    WizardGithubDescriptionChanged(String),
    WizardInitializeProject,
    // Step 0.5: Quick Interview Config
    WizardUseInterviewToggled(bool),
    WizardInteractionModeChanged(String),
    WizardReasoningLevelChanged(String),
    WizardGenerateAgentsMdToggled(bool),
    // Original wizard messages
    WizardProjectNameChanged(String),
    WizardProjectPathChanged(String),
    WizardRequirementsChanged(String),
    WizardPrdPlatformChanged(String),
    WizardPrdModelChanged(String),
    WizardPrdEditorAction(text_editor::Action),

    // Read-only text editor actions (for selection/copy support)
    DashboardTerminalAction(text_editor::Action),
    DoctorDetailAction(String, text_editor::Action), // check name, action
    EvidencePreviewAction(text_editor::Action),
    LedgerExpandedAction(usize, text_editor::Action), // entry id, action
    MemoryContentAction(text_editor::Action),
    TierDetailsAction(text_editor::Action),
    WizardRequirementsPreviewAction(text_editor::Action),
    WizardPlanContentAction(text_editor::Action),
    MetricsSummaryAction(text_editor::Action),
    LoginCliAction(text_editor::Action),

    WizardTierPlatformChanged(String, String), // tier, platform
    WizardTierModelChanged(String, String),    // tier, model
    WizardTierReasoningChanged(String, String), // tier, effort
    WizardTierPlanModeToggled(String, bool),   // tier, value
    WizardTierAskModeToggled(String, bool),
    WizardTierOutputFormatChanged(String, String),
    WizardBrowseProjectPath,      // opens folder picker
    WizardBrowseRequirementsFile, // opens file picker
    WizardProjectPathSelected(Option<PathBuf>),
    WizardRequirementsFileSelected(Option<PathBuf>),
    WizardGeneratePrd,
    WizardPrdGenerated(Result<String, String>),
    WizardGeneratePlan,
    WizardPlanGenerated(Result<String, String>),
    WizardStartChain,
    WizardRefreshModels,
    WizardModelsLoaded(HashMap<String, Vec<String>>),
    OpenWizardFilePicker,
    WizardFilePickerResult(Option<PathBuf>),
    WizardGenerate,
    WizardSave,

    // Interview
    StartInterview,
    InterviewQuestionReceived(String),
    InterviewAnswerSubmitted(String),
    InterviewPhaseComplete(String),
    InterviewComplete,
    InterviewPaused,
    InterviewResumed,
    NavigateToInterview,
    InterviewAnswerInputChanged(String),
    InterviewSubmitAnswer,
    InterviewTogglePause,
    InterviewEnd,

    // Interview Config UI
    ConfigInterviewFieldChanged(String, String), // field, value
    ConfigInterviewToggled(String),              // field name
    ConfigInterviewBackupChanged(usize, String, String), // index, field, value
    ConfigInterviewAddBackup,
    ConfigInterviewRemoveBackup(usize),

    // Setup
    SetupRunDetection,
    SetupDetectionComplete(Vec<PlatformStatus>),
    SetupComplete,

    // Evidence
    SelectEvidence(String),
    FilterEvidence(EvidenceFilter),
    LoadEvidence,
    EvidenceSelectItem(usize),
    EvidenceViewItem(usize),
    EvidenceDownloadItem(usize),
    EvidenceRefresh,
    EvidenceLoadContent(String),
    EvidenceContentLoaded(String, String),

    // History
    HistoryPageChanged(usize),
    SelectSession(String),
    LoadHistory,
    HistoryNextPage,
    HistoryPrevPage,
    HistoryFilterChanged(Option<crate::views::history::SessionStatus>),
    HistorySearchChanged(String),
    HistoryViewSession(String),

    // Tiers
    ToggleTierExpand(String),
    SelectTier(String),
    ExpandAllTiers,
    CollapseAllTiers,

    // Settings
    SettingsLogLevelChanged(String),
    SettingsAutoScrollToggled(bool),
    SettingsShowTimestampsToggled(bool),
    SettingsRetentionDaysChanged(String),
    SettingsMinimizeToTrayToggled(bool),
    SettingsIntensiveLoggingToggled(bool),
    SettingsClearData,
    SettingsResetDefaults,
    SettingsOpenDataDir,
    SaveSettings,

    // Memory
    MemorySectionChanged(crate::views::memory::MemorySection),
    LoadMemoryContent,
    MemoryContentLoaded(String),
    MemoryEditExternal,
    MemoryExport,
    MemoryRefresh,

    // Ledger
    FilterLedger(LedgerFilter),
    LoadLedger,
    LedgerFilterTypeChanged(Option<String>),
    LedgerFilterTierChanged(String),
    LedgerFilterSessionChanged(String),
    LedgerFilterLimitChanged(String),
    LedgerClearFilters,
    LedgerRefresh,
    LedgerExport,
    LedgerClear,
    LedgerToggleEvent(usize),

    // Config (refresh)
    LoadConfig,

    // Login (refresh auth status)
    LoadLogin,
    AuthStatusReceived(std::collections::HashMap<String, AuthStatus>),
    PlatformLogin(crate::platforms::AuthTarget),
    PlatformLogout(crate::platforms::AuthTarget),
    PlatformLoginComplete(crate::platforms::AuthTarget, Result<(), String>),
    PlatformLogoutComplete(crate::platforms::AuthTarget, Result<(), String>),
    CopyToClipboard(String),
    RefreshAuthStatus,
    LoadGitInfoForLogin,
    GitInfoForLoginLoaded(Option<GitInfoDisplay>),

    // Setup install
    SetupInstall(crate::types::Platform),
    SetupInstallComplete(crate::types::Platform, Result<(), String>),

    FixCheckComplete(String, Option<crate::types::FixResult>),

    // Doctor (refresh)
    RefreshDoctor,

    // Setup (refresh platform status)
    RefreshSetup,

    // Metrics
    RefreshMetrics,

    // Coverage
    CoverageFilterChanged(String),

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
    WindowResized(f32, f32),

    // No-op
    None,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn apply_read_only_text_editor_action(
    content: &mut text_editor::Content,
    action: text_editor::Action,
) {
    if !action.is_edit() {
        content.perform(action);
    }
}

fn default_login_cli_text() -> String {
    [
        "• Cursor: agent login",
        "• Codex: codex login",
        "• Claude: claude auth login",
        "• Gemini: gemini",
        "• Copilot: copilot",
        "• GitHub: gh auth login",
    ]
    .join("\n")
}

/// Load git information (user, email, remote, branch)
async fn load_git_info() -> Option<GitInfoDisplay> {
    use tokio::process::Command;

    // Helper to run git command and get output
    async fn git_config(key: &str) -> Option<String> {
        let output = Command::new("git")
            .args(["config", key])
            .output()
            .await
            .ok()?;

        if output.status.success() {
            let s = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if s.is_empty() {
                None
            } else {
                Some(s)
            }
        } else {
            None
        }
    }

    async fn git_remote_url() -> Option<String> {
        let output = Command::new("git")
            .args(["remote", "get-url", "origin"])
            .output()
            .await
            .ok()?;

        if output.status.success() {
            let s = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if s.is_empty() {
                None
            } else {
                Some(s)
            }
        } else {
            None
        }
    }

    async fn git_current_branch() -> Option<String> {
        let output = Command::new("git")
            .args(["branch", "--show-current"])
            .output()
            .await
            .ok()?;

        if output.status.success() {
            let s = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if s.is_empty() {
                None
            } else {
                Some(s)
            }
        } else {
            None
        }
    }

    // Fetch all git info
    let user_name = git_config("user.name").await?;
    let user_email = git_config("user.email").await?;
    let remote_url = git_remote_url()
        .await
        .unwrap_or_else(|| "No remote configured".to_string());
    let current_branch = git_current_branch()
        .await
        .unwrap_or_else(|| "No branch".to_string());

    Some(GitInfoDisplay {
        user_name,
        user_email,
        remote_url,
        current_branch,
    })
}

// ============================================================================
// App Implementation
// ============================================================================

impl App {
    /// Create a new App instance with initial state
    pub fn new(shutdown: Arc<AtomicBool>) -> (Self, Task<Message>) {
        let mut app = Self {
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
            terminal_editor_content: text_editor::Content::with_text(
                "=== RWM Puppet Master Terminal ===\n\
                 No active orchestration.\n\
                 Start a new orchestration from the Wizard page or resume from the Dashboard.\n",
            ),
            terminal_interaction_until: None,
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
            doctor_platform_selector_visible: false,
            doctor_selected_platforms: Vec::new(),
            doctor_expanded_checks: HashSet::new(),
            doctor_detail_contents: HashMap::new(),

            // Config
            config_text: String::new(),
            config_editor_content: text_editor::Content::new(),
            config_valid: true,
            config_error: None,
            config_active_tab: 0,
            config_is_dirty: false,
            gui_config: crate::config::gui_config::GuiConfig::default(),
            config_models: crate::config::gui_config::build_model_map(),
            config_git_info: None,

            // Tiers
            tier_tree: Vec::new(),
            selected_tier: None,
            tier_details_content: text_editor::Content::new(),
            expanded_tiers: HashSet::new(),
            selected_tier_details: None,

            // Evidence
            evidence_items: Vec::new(),
            evidence_filter: EvidenceFilter::default(),
            evidence_selected_item: None,
            evidence_preview_content: text_editor::Content::new(),
            evidence_preview_path: None,

            // History
            history_sessions: Vec::new(),
            history_page: 0,
            history_active_by_item: HashMap::new(),
            history_filter: None,
            history_search: String::new(),
            history_items_per_page: 10,
            history_display_sessions: Vec::new(),
            history_total_pages: 1,

            // Metrics
            metrics: MetricsSnapshot::default(),
            metrics_collector: MetricsCollector::new(),

            // Ledger
            ledger_entries: Vec::new(),
            ledger_filter: LedgerFilter::default(),
            ledger_expanded_entries: HashSet::new(),
            ledger_expanded_contents: HashMap::new(),
            ledger_expanded_events: HashSet::new(),
            ledger_filter_tier: String::new(),
            ledger_filter_session: String::new(),

            // Login
            platform_auth_status: HashMap::new(),
            login_in_progress: HashMap::new(),
            login_messages: HashMap::new(),
            login_auth_urls: HashMap::new(),
            git_info: None,
            github_auth_status: None,
            setup_installing: None,
            login_cli_content: text_editor::Content::with_text(&default_login_cli_text()),

            // Projects
            new_project_name: String::new(),
            new_project_path: String::new(),
            show_new_project_form: false,

            // Wizard
            wizard_step: 0, // Start at Step 0
            // Step 0: Project Setup
            wizard_is_new_project: true,
            wizard_has_github_repo: false,
            wizard_github_url: String::new(),
            wizard_create_github_repo: false,
            wizard_github_visibility: "public".to_string(),
            wizard_github_description: String::new(),
            // Step 0.5: Quick Interview Config
            wizard_use_interview: false,
            wizard_interaction_mode: "expert".to_string(),
            wizard_reasoning_level: "medium".to_string(),
            wizard_generate_agents_md: true,
            // Original wizard fields
            wizard_project_name: String::new(),
            wizard_project_path: String::new(),
            wizard_requirements_text: String::new(),
            wizard_prd_platform: "cursor".to_string(),
            wizard_prd_model: "auto".to_string(),
            wizard_prd_text: String::new(),
            wizard_prd_editor_content: text_editor::Content::new(),
            wizard_prd_preview: None,
            wizard_tier_configs: {
                let mut configs = HashMap::new();
                configs.insert("phase".to_string(), WizardTierConfig::default());
                configs.insert("task".to_string(), WizardTierConfig::default());
                configs.insert("subtask".to_string(), WizardTierConfig::default());
                configs.insert("iteration".to_string(), WizardTierConfig::default());
                configs
            },
            wizard_plan_text: String::new(),
            wizard_generating: false,
            wizard_models: HashMap::new(),
            wizard_requirements_preview_content: text_editor::Content::new(),
            wizard_plan_content: text_editor::Content::new(),

            // Setup
            setup_platform_statuses: Vec::new(),
            setup_is_checking: false,

            // Interview
            interview_active: false,
            interview_paused: false,
            interview_current_phase: String::new(),
            interview_current_question: String::new(),
            interview_answers: Vec::new(),
            interview_phases_complete: Vec::new(),
            interview_answer_input: String::new(),

            // UI State
            toasts: Vec::new(),
            show_modal: None,
            next_toast_id: 0,

            // Page transitions
            page_transition: crate::widgets::TransitionState::default(),
            previous_page: None,

            // Animation time
            animation_time: 0.0,
            last_tick_time: None,

            // Window size (default desktop size)
            window_width: 1280.0,
            window_height: 720.0,

            // Retro overlay effects
            retro_overlay: crate::widgets::RetroOverlay::new(
                true, // Start with dark theme
                AppTheme::Dark.ink(),
            ),

            // Settings
            minimize_to_tray: true,
            settings_log_level: "info".to_string(),
            settings_auto_scroll: true,
            settings_show_timestamps: true,
            settings_retention_days: 30,
            settings_intensive_logging: false,

            // Memory
            memory_content: text_editor::Content::new(),
            memory_content_string: String::new(),
            memory_section: crate::views::memory::MemorySection::Overview,
            memory_loading: false,

            // Metrics
            metrics_summary_content: text_editor::Content::new(),

            // Coverage
            coverage_phase_filter: "All".to_string(),
            coverage_requirements: Vec::new(),
            coverage_categories: Vec::new(),
            coverage_overall: 0.0,

            // Backend channels (will be set up in run())
            event_receiver: None,
            command_sender: None,

            // Tray
            tray_action_receiver: None,

            shutdown,

            // View helper data
            _empty_string_vec: Vec::new(),
            _no_tier_details: None,
        };

        // Ensure .puppet-master directory exists on startup
        if let Ok(cwd) = std::env::current_dir() {
            let puppet_dir = cwd.join(".puppet-master");
            let _ = std::fs::create_dir_all(&puppet_dir);
            let _ = std::fs::create_dir_all(puppet_dir.join("evidence"));
            let _ = std::fs::create_dir_all(puppet_dir.join("logs"));
            let _ = std::fs::create_dir_all(puppet_dir.join("sessions"));
            let _ = std::fs::create_dir_all(puppet_dir.join("checkpoints"));
        }

        // Initial tasks: load fonts, load projects, load config, etc.
        let font_tasks: Vec<iced::Task<Message>> = crate::theme::fonts::load_fonts()
            .into_iter()
            .map(|task| task.map(|_| Message::None))
            .collect();
        let task = Task::batch(font_tasks);

        // First-boot detection: check if setup has been completed
        let cwd = std::env::current_dir().unwrap_or_default();
        let setup_marker = cwd.join(".puppet-master").join("setup-complete");
        if !setup_marker.exists() {
            // No setup marker found - show setup wizard on first boot
            app.current_page = Page::Setup;
        }

        // Load settings from disk if they exist
        app.load_settings();

        (app, task)
    }

    /// Handle messages and update state
    pub fn update(&mut self, message: Message) -> Task<Message> {
        match message {
            // ================================================================
            // Navigation
            // ================================================================
            Message::NavigateTo(page) => {
                // Start page transition
                self.previous_page = Some(self.current_page);
                self.page_transition = crate::widgets::TransitionState::start();
                self.current_page = page;

                // Auto-load data when navigating to certain pages
                match page {
                    Page::Login => {
                        // Load auth status
                        return Task::perform(
                            async {
                                let checker = crate::platforms::AuthStatusChecker::new();
                                let mut map: HashMap<String, AuthStatus> = HashMap::new();
                                for platform in crate::types::Platform::all() {
                                    let result = checker.check_platform(*platform).await;
                                    let name = format!("{:?}", platform);
                                    map.insert(
                                        name.clone(),
                                        AuthStatus {
                                            platform: name,
                                            authenticated: result.authenticated,
                                            method: if result
                                                .message
                                                .contains("environment variable")
                                            {
                                                crate::views::login::AuthMethod::EnvVar
                                            } else {
                                                crate::views::login::AuthMethod::CliLogin
                                            },
                                            hint: result.message.clone(),
                                        },
                                    );
                                }
                                let gh = checker.check_github().await;
                                map.insert(
                                    "GitHub".to_string(),
                                    AuthStatus {
                                        platform: "GitHub".to_string(),
                                        authenticated: gh.authenticated,
                                        method: crate::views::login::AuthMethod::CliLogin,
                                        hint: gh.message.clone(),
                                    },
                                );
                                map
                            },
                            Message::AuthStatusReceived,
                        );
                    }
                    Page::Doctor => {
                        // Auto-run checks if no results yet
                        if self.doctor_results.is_empty() && !self.doctor_running {
                            return self.update(Message::RunAllChecks);
                        }
                    }
                    Page::Setup => {
                        // Auto-run detection if no results yet
                        if self.setup_platform_statuses.is_empty() && !self.setup_is_checking {
                            return self.update(Message::SetupRunDetection);
                        }
                    }
                    Page::Config => {
                        // Auto-reload config
                        if self.config_text.is_empty() {
                            return self.update(Message::ReloadConfig);
                        }
                    }
                    Page::Wizard => {
                        // Auto-load models if not loaded yet
                        if self.wizard_models.is_empty() {
                            return self.update(Message::WizardRefreshModels);
                        }
                    }
                    Page::Memory => {
                        // Auto-load memory content if empty
                        if self.memory_content_string.is_empty() {
                            return self.update(Message::LoadMemoryContent);
                        }
                    }
                    Page::History => {
                        // Load history from disk when navigating to the History page
                        self.load_history_from_disk();
                        self.recompute_history_display();
                    }
                    Page::Ledger => {
                        // Auto-load ledger data when navigating to Ledger page
                        return self.update(Message::LedgerRefresh);
                    }
                    Page::Coverage => {
                        // Compute coverage data from PRD and evidence
                        self.compute_coverage();
                    }
                    _ => {}
                }

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
                // Update retro overlay for new theme
                self.retro_overlay
                    .update(self.theme.is_dark(), self.theme.ink());
                Task::none()
            }
            Message::ToggleMinimizeToTray => {
                self.minimize_to_tray = !self.minimize_to_tray;
                Task::none()
            }

            // ================================================================
            // Settings
            // ================================================================
            Message::SettingsLogLevelChanged(level) => {
                self.settings_log_level = level;
                Task::none()
            }

            Message::SettingsAutoScrollToggled(enabled) => {
                self.settings_auto_scroll = enabled;
                Task::none()
            }

            Message::SettingsShowTimestampsToggled(enabled) => {
                self.settings_show_timestamps = enabled;
                Task::none()
            }

            Message::SettingsRetentionDaysChanged(days_str) => {
                if let Ok(days) = days_str.parse::<u32>() {
                    self.settings_retention_days = days;
                }
                Task::none()
            }

            Message::SettingsMinimizeToTrayToggled(enabled) => {
                self.minimize_to_tray = enabled;
                Task::none()
            }

            Message::SettingsIntensiveLoggingToggled(enabled) => {
                self.settings_intensive_logging = enabled;
                Task::none()
            }

            Message::SettingsClearData => {
                self.add_toast(ToastType::Warning, "Clearing all data...".to_string());
                let base = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
                let data_dir = base.join(".puppet-master");

                if data_dir.exists() {
                    // Clear evidence, logs, but keep settings
                    if let Ok(_) = std::fs::remove_dir_all(data_dir.join("evidence")) {
                        self.add_toast(ToastType::Success, "Evidence cleared".to_string());
                    }
                    if let Ok(_) = std::fs::remove_dir_all(data_dir.join("logs")) {
                        self.add_toast(ToastType::Success, "Logs cleared".to_string());
                    }
                }

                Task::none()
            }

            Message::SettingsResetDefaults => {
                self.settings_log_level = "info".to_string();
                self.settings_auto_scroll = true;
                self.settings_show_timestamps = true;
                self.settings_retention_days = 30;
                self.settings_intensive_logging = false;
                self.minimize_to_tray = true;

                // Delete settings file
                let base = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
                let settings_file = base.join(".puppet-master").join("settings.json");
                if settings_file.exists() {
                    let _ = std::fs::remove_file(&settings_file);
                }

                self.add_toast(ToastType::Success, "Settings reset to defaults".to_string());
                Task::none()
            }

            Message::SettingsOpenDataDir => {
                let base = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
                let data_dir = base.join(".puppet-master");

                // Try to open directory with platform-specific command
                #[cfg(target_os = "linux")]
                {
                    let _ = std::process::Command::new("xdg-open")
                        .arg(&data_dir)
                        .spawn();
                }
                #[cfg(target_os = "macos")]
                {
                    let _ = std::process::Command::new("open").arg(&data_dir).spawn();
                }
                #[cfg(target_os = "windows")]
                {
                    let _ = std::process::Command::new("explorer")
                        .arg(&data_dir)
                        .spawn();
                }

                self.add_toast(ToastType::Info, "Opening data directory...".to_string());
                Task::none()
            }

            Message::SaveSettings => {
                let base = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
                let data_dir = base.join(".puppet-master");
                let settings_file = data_dir.join("settings.json");

                // Create directory if needed (including parent directories)
                if let Some(parent) = settings_file.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }

                // Serialize settings
                let settings = serde_json::json!({
                    "log_level": self.settings_log_level,
                    "auto_scroll": self.settings_auto_scroll,
                    "show_timestamps": self.settings_show_timestamps,
                    "retention_days": self.settings_retention_days,
                    "intensive_logging": self.settings_intensive_logging,
                    "minimize_to_tray": self.minimize_to_tray,
                });

                if let Ok(json) = serde_json::to_string_pretty(&settings) {
                    if let Ok(_) = std::fs::write(&settings_file, json) {
                        self.add_toast(ToastType::Success, "Settings saved".to_string());
                    } else {
                        self.add_toast(ToastType::Error, "Failed to save settings".to_string());
                    }
                }

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
                            Task::batch(vec![window::minimize(id, false), window::gain_focus(id)])
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
                self.current_project = self.projects.iter().find(|p| p.name == name).cloned();
                self.add_toast(ToastType::Success, format!("Switched to project: {}", name));
                Task::none()
            }

            Message::CreateProject(name, path) => {
                let project_path = PathBuf::from(&path);
                match std::fs::create_dir_all(&project_path).and_then(|_| {
                    crate::utils::project_paths::initialize_puppet_master_dirs(&project_path)
                        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
                }) {
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
                let candidates = [
                    "pm-config.yaml",
                    "puppet-master.yaml",
                    ".puppet-master.yaml",
                ];
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
                        format!(
                            "Opened project at {} (no config found)",
                            resolved_path.display()
                        ),
                    );
                }

                Task::none()
            }

            Message::OpenProjectFolderPicker => {
                // Open folder picker dialog
                Task::perform(
                    async {
                        let result = rfd::AsyncFileDialog::new()
                            .set_title("Select Project Directory")
                            .pick_folder()
                            .await;

                        result.map(|folder| folder.path().to_path_buf())
                    },
                    Message::ProjectFolderSelected,
                )
            }

            Message::ProjectFolderSelected(path_opt) => {
                if let Some(path) = path_opt {
                    // Open the selected project folder
                    let path_str = path.display().to_string();
                    self.update(Message::OpenProject(path_str))
                } else {
                    Task::none()
                }
            }

            Message::ProjectsRefresh => {
                // Scan for projects in current directory and known locations
                let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
                let mut found_projects = Vec::new();

                // Check current directory
                if cwd.join(".puppet-master").exists() || cwd.join("prd.json").exists() {
                    found_projects.push(ProjectInfo {
                        name: cwd
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("Current Project")
                            .to_string(),
                        path: cwd.clone(),
                        status: crate::views::projects::ProjectStatus::Inactive,
                    });
                }

                // Scan for subdirectories with .puppet-master
                if let Ok(entries) = std::fs::read_dir(&cwd) {
                    for entry in entries.filter_map(Result::ok) {
                        let path = entry.path();
                        if path.is_dir() && path.join(".puppet-master").exists() {
                            found_projects.push(ProjectInfo {
                                name: path
                                    .file_name()
                                    .and_then(|n| n.to_str())
                                    .unwrap_or("Project")
                                    .to_string(),
                                path: path.clone(),
                                status: crate::views::projects::ProjectStatus::Inactive,
                            });
                        }
                    }
                }

                self.projects = found_projects;
                self.add_toast(
                    ToastType::Success,
                    format!("Found {} projects", self.projects.len()),
                );
                Task::none()
            }

            Message::ProjectsLoaded(projects) => {
                self.projects = projects;
                Task::none()
            }

            Message::BrowseNewProjectPath => Task::perform(
                async {
                    let result = rfd::AsyncFileDialog::new()
                        .set_title("Select Project Directory")
                        .pick_folder()
                        .await;

                    result.map(|folder| folder.path().to_path_buf())
                },
                Message::NewProjectPathSelected,
            ),

            Message::NewProjectPathSelected(path_opt) => {
                if let Some(path) = path_opt {
                    self.new_project_path = path.display().to_string();
                }
                Task::none()
            }

            Message::CreateNewProject => {
                // Validate inputs
                if self.new_project_name.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please enter a project name".to_string(),
                    );
                    return Task::none();
                }

                if self.new_project_path.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please select a project path".to_string(),
                    );
                    return Task::none();
                }

                let project_path = PathBuf::from(&self.new_project_path);

                // Check if path exists
                if !project_path.exists() {
                    self.add_toast(ToastType::Error, "Selected path does not exist".to_string());
                    return Task::none();
                }

                // Create project
                self.update(Message::CreateProject(
                    self.new_project_name.clone(),
                    self.new_project_path.clone(),
                ))
            }

            Message::ProjectCreated(result) => {
                match result {
                    Ok(()) => {
                        self.add_toast(
                            ToastType::Success,
                            "Project created successfully".to_string(),
                        );
                        self.show_new_project_form = false;
                        self.new_project_name.clear();
                        self.new_project_path.clear();
                    }
                    Err(e) => {
                        self.add_toast(
                            ToastType::Error,
                            format!("Failed to create project: {}", e),
                        );
                    }
                }
                Task::none()
            }

            // ================================================================
            // Config
            // ================================================================
            Message::ConfigTextChanged(text) => {
                self.config_text = text;
                self.config_is_dirty = true;
                // Auto-validate on text change
                match serde_yaml::from_str::<crate::types::PuppetMasterConfig>(&self.config_text) {
                    Ok(config) => {
                        let errors = crate::config::validate_config(&config);
                        if errors.is_empty() {
                            self.config_valid = true;
                            self.config_error = None;
                        } else {
                            self.config_valid = false;
                            let msg = errors
                                .iter()
                                .map(|e| e.to_string())
                                .collect::<Vec<_>>()
                                .join("\n");
                            self.config_error = Some(msg);
                        }
                    }
                    Err(e) => {
                        self.config_valid = false;
                        self.config_error = Some(e.to_string());
                    }
                }
                Task::none()
            }

            Message::ConfigEditorAction(action) => {
                self.config_editor_content.perform(action);
                let text = self.config_editor_content.text();
                self.update(Message::ConfigTextChanged(text))
            }

            // Read-only text editor actions - keep selection/copy while blocking edits
            Message::DashboardTerminalAction(action) => {
                self.terminal_interaction_until =
                    Some(std::time::Instant::now() + std::time::Duration::from_secs(3));
                apply_read_only_text_editor_action(&mut self.terminal_editor_content, action);
                Task::none()
            }

            Message::DoctorDetailAction(check_name, action) => {
                if let Some(content) = self.doctor_detail_contents.get_mut(&check_name) {
                    apply_read_only_text_editor_action(content, action);
                }
                Task::none()
            }

            Message::EvidencePreviewAction(action) => {
                apply_read_only_text_editor_action(&mut self.evidence_preview_content, action);
                Task::none()
            }

            Message::LedgerExpandedAction(entry_id, action) => {
                if let Some(content) = self.ledger_expanded_contents.get_mut(&entry_id) {
                    apply_read_only_text_editor_action(content, action);
                }
                Task::none()
            }

            Message::MemoryContentAction(action) => {
                apply_read_only_text_editor_action(&mut self.memory_content, action);
                Task::none()
            }

            Message::TierDetailsAction(action) => {
                apply_read_only_text_editor_action(&mut self.tier_details_content, action);
                Task::none()
            }

            Message::WizardRequirementsPreviewAction(action) => {
                apply_read_only_text_editor_action(
                    &mut self.wizard_requirements_preview_content,
                    action,
                );
                Task::none()
            }

            Message::WizardPlanContentAction(action) => {
                apply_read_only_text_editor_action(&mut self.wizard_plan_content, action);
                Task::none()
            }

            Message::MetricsSummaryAction(action) => {
                apply_read_only_text_editor_action(&mut self.metrics_summary_content, action);
                Task::none()
            }

            Message::LoginCliAction(action) => {
                apply_read_only_text_editor_action(&mut self.login_cli_content, action);
                Task::none()
            }

            Message::ConfigTabChanged(tab) => {
                self.config_active_tab = tab;
                Task::none()
            }

            Message::ConfigFieldChanged(field_path, new_value) => {
                // TODO: Update structured config when we have that implemented
                // For now, just mark as dirty
                self.config_is_dirty = true;
                self.add_toast(
                    ToastType::Info,
                    format!("Changed {}: {}", field_path, new_value),
                );
                Task::none()
            }

            Message::RefreshModels => {
                self.config_models = crate::config::gui_config::build_model_map();
                self.add_toast(ToastType::Success, "Models refreshed".to_string());
                Task::none()
            }

            Message::SaveConfig => {
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| {
                        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                    });

                let config_path = base.join("puppet-master.yaml");

                // Ensure parent directory exists
                if let Some(parent) = config_path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }

                // If on tabs 0-5, save from gui_config; if on tab 6, save from config_text
                if self.config_active_tab < 6 {
                    // Save from structured gui_config
                    match crate::config::gui_config::save_config(&config_path, &self.gui_config) {
                        Ok(()) => {
                            // Also update config_text to match
                            if let Ok(yaml) = serde_yaml::to_string(&self.gui_config) {
                                self.config_text = yaml.clone();
                                self.config_editor_content = text_editor::Content::with_text(&yaml);
                            }
                            self.config_is_dirty = false;
                            self.add_toast(
                                ToastType::Success,
                                format!("Configuration saved to {}", config_path.display()),
                            );
                        }
                        Err(e) => {
                            let friendly_msg = if e
                                .to_string()
                                .contains("No such file or directory")
                                || e.to_string().contains("cannot find the path")
                            {
                                "Could not save configuration. The parent directory may not exist."
                                    .to_string()
                            } else if e.to_string().contains("Permission denied") {
                                "Permission denied. Please check write permissions for the configuration file.".to_string()
                            } else {
                                format!("Failed to save configuration: {}", e)
                            };
                            self.add_toast(ToastType::Error, friendly_msg);
                        }
                    }
                } else {
                    // Save from YAML text
                    match std::fs::write(&config_path, &self.config_text) {
                        Ok(()) => {
                            // Try to parse back into gui_config
                            if let Ok(loaded) = crate::config::gui_config::load_config(&config_path)
                            {
                                self.gui_config = loaded;
                            }
                            self.config_is_dirty = false;
                            self.add_toast(
                                ToastType::Success,
                                format!("Configuration saved to {}", config_path.display()),
                            );
                        }
                        Err(e) => {
                            let friendly_msg = if e
                                .to_string()
                                .contains("No such file or directory")
                                || e.to_string().contains("cannot find the path")
                            {
                                "Could not save configuration. The parent directory may not exist."
                                    .to_string()
                            } else if e.to_string().contains("Permission denied") {
                                "Permission denied. Please check write permissions for the configuration file.".to_string()
                            } else {
                                format!("Failed to save configuration: {}", e)
                            };
                            self.add_toast(ToastType::Error, friendly_msg);
                        }
                    }
                }

                Task::none()
            }

            Message::ReloadConfig => {
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| {
                        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                    });

                let config_path = base.join("puppet-master.yaml");

                match std::fs::read_to_string(&config_path) {
                    Ok(text) => {
                        self.config_text = text.clone();
                        self.config_editor_content = text_editor::Content::with_text(&text);

                        // Try to load into gui_config
                        if let Ok(loaded) = crate::config::gui_config::load_config(&config_path) {
                            self.gui_config = loaded;
                        }

                        self.config_valid = true;
                        self.config_error = None;
                        self.config_is_dirty = false;
                        self.add_toast(
                            ToastType::Info,
                            format!("Reloaded configuration from {}", config_path.display()),
                        );
                    }
                    Err(e) => {
                        let friendly_msg = if e.to_string().contains("No such file or directory")
                            || e.to_string().contains("cannot find the path")
                        {
                            "No configuration file found. Create one using the Config page and click Save.".to_string()
                        } else if e.to_string().contains("Permission denied") {
                            "Permission denied. Please check read permissions for the configuration file.".to_string()
                        } else {
                            format!("Failed to load configuration. {}", e)
                        };
                        self.add_toast(ToastType::Error, friendly_msg);
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
                            self.add_toast(
                                ToastType::Success,
                                "Configuration is valid".to_string(),
                            );
                        } else {
                            self.config_valid = false;
                            let msg = errors
                                .iter()
                                .map(|e| e.to_string())
                                .collect::<Vec<_>>()
                                .join("\n");
                            self.config_error = Some(msg.clone());
                            self.add_toast(
                                ToastType::Error,
                                "Configuration validation failed".to_string(),
                            );
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

            // New GUI config messages
            Message::ConfigTierPlatformChanged(tier_name, platform) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.platform = platform.clone();
                // Reset model to first available for new platform
                if let Some(models) = self.config_models.get(&platform) {
                    if let Some(first_model) = models.first() {
                        tier.model = first_model.clone();
                    }
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigTierModelChanged(tier_name, model) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.model = model;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigTierReasoningChanged(tier_name, reasoning) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.reasoning_effort = if reasoning == "default" {
                    None
                } else {
                    Some(reasoning)
                };
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigTierPlanModeToggled(tier_name) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.plan_mode = !tier.plan_mode;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigTierAskModeToggled(tier_name) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.ask_mode = !tier.ask_mode;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigTierOutputFormatChanged(tier_name, format) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.output_format = format;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigTierMaxIterChanged(tier_name, value) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                if let Ok(num) = value.parse::<u32>() {
                    tier.max_iterations = num;
                    self.config_is_dirty = true;
                }
                Task::none()
            }

            Message::ConfigTierFailureStyleChanged(tier_name, style) => {
                let tier = match tier_name.as_str() {
                    "phase" => &mut self.gui_config.tiers.phase,
                    "task" => &mut self.gui_config.tiers.task,
                    "subtask" => &mut self.gui_config.tiers.subtask,
                    "iteration" => &mut self.gui_config.tiers.iteration,
                    _ => return Task::none(),
                };
                tier.task_failure_style = style;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigBranchingFieldChanged(field, value) => {
                match field.as_str() {
                    "base_branch" => self.gui_config.branching.base_branch = value,
                    "naming_pattern" => self.gui_config.branching.naming_pattern = value,
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigGranularityChanged(granularity) => {
                self.gui_config.branching.granularity = granularity;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigVerificationFieldChanged(field, value) => {
                match field.as_str() {
                    "browser_adapter" => self.gui_config.verification.browser_adapter = value,
                    "evidence_directory" => self.gui_config.verification.evidence_directory = value,
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigVerificationScreenshotToggled => {
                self.gui_config.verification.screenshot_on_failure =
                    !self.gui_config.verification.screenshot_on_failure;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::BrowseEvidenceDirectory => Task::perform(
                async {
                    let result = rfd::AsyncFileDialog::new()
                        .set_title("Select Evidence Directory")
                        .pick_folder()
                        .await;
                    result.map(|h| h.path().to_path_buf())
                },
                Message::EvidenceDirectorySelected,
            ),

            Message::EvidenceDirectorySelected(path_opt) => {
                if let Some(path) = path_opt {
                    if let Some(path_str) = path.to_str() {
                        self.gui_config.verification.evidence_directory = path_str.to_string();
                        self.config_is_dirty = true;
                    }
                }
                Task::none()
            }

            Message::ConfigMemoryFieldChanged(field, value) => {
                match field.as_str() {
                    "progress_file" => self.gui_config.memory.progress_file = value,
                    "agents_file" => self.gui_config.memory.agents_file = value,
                    "prd_file" => self.gui_config.memory.prd_file = value,
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigMemoryMultiLevelToggled => {
                self.gui_config.memory.multi_level_agents =
                    !self.gui_config.memory.multi_level_agents;
                self.config_is_dirty = true;
                Task::none()
            }

            Message::BrowseMemoryProgressFile => Task::perform(
                async {
                    let result = rfd::AsyncFileDialog::new()
                        .set_title("Select Progress File")
                        .add_filter("Text Files", &["txt", "md", "log"])
                        .add_filter("All Files", &["*"])
                        .pick_file()
                        .await;

                    result.map(|file| file.path().to_path_buf())
                },
                Message::MemoryProgressFileSelected,
            ),

            Message::BrowseMemoryAgentsFile => Task::perform(
                async {
                    let result = rfd::AsyncFileDialog::new()
                        .set_title("Select Agents File")
                        .add_filter("JSON/Markdown", &["json", "md"])
                        .add_filter("All Files", &["*"])
                        .pick_file()
                        .await;

                    result.map(|file| file.path().to_path_buf())
                },
                Message::MemoryAgentsFileSelected,
            ),

            Message::BrowseMemoryPrdFile => Task::perform(
                async {
                    let result = rfd::AsyncFileDialog::new()
                        .set_title("Select PRD File")
                        .add_filter("JSON Files", &["json"])
                        .add_filter("All Files", &["*"])
                        .pick_file()
                        .await;

                    result.map(|file| file.path().to_path_buf())
                },
                Message::MemoryPrdFileSelected,
            ),

            Message::MemoryProgressFileSelected(path) => {
                if let Some(p) = path {
                    self.gui_config.memory.progress_file = p.to_string_lossy().to_string();
                    self.config_is_dirty = true;
                }
                Task::none()
            }

            Message::MemoryAgentsFileSelected(path) => {
                if let Some(p) = path {
                    self.gui_config.memory.agents_file = p.to_string_lossy().to_string();
                    self.config_is_dirty = true;
                }
                Task::none()
            }

            Message::MemoryPrdFileSelected(path) => {
                if let Some(p) = path {
                    self.gui_config.memory.prd_file = p.to_string_lossy().to_string();
                    self.config_is_dirty = true;
                }
                Task::none()
            }

            Message::ConfigBudgetFieldChanged(platform, field, value) => {
                let budget = match platform.as_str() {
                    "cursor" => &mut self.gui_config.budgets.cursor,
                    "codex" => &mut self.gui_config.budgets.codex,
                    "claude" => &mut self.gui_config.budgets.claude,
                    "gemini" => &mut self.gui_config.budgets.gemini,
                    "copilot" => &mut self.gui_config.budgets.copilot,
                    _ => return Task::none(),
                };

                match field.as_str() {
                    "max_calls_per_run" => {
                        if let Ok(num) = value.parse::<u32>() {
                            budget.max_calls_per_run = num;
                        }
                    }
                    "max_calls_per_hour" => {
                        if let Ok(num) = value.parse::<u32>() {
                            budget.max_calls_per_hour = num;
                        }
                    }
                    "max_calls_per_day" => {
                        if let Ok(num) = value.parse::<u32>() {
                            budget.max_calls_per_day = num;
                        }
                    }
                    "unlimited_auto_mode" => {
                        budget.unlimited_auto_mode = value == "true";
                    }
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigAdvancedFieldChanged(field, value) => {
                match field.as_str() {
                    "log_level" => self.gui_config.advanced.log_level = value,
                    "process_timeout_ms" => {
                        if let Ok(num) = value.parse::<u64>() {
                            self.gui_config.advanced.process_timeout_ms = num;
                        }
                    }
                    "parallel_iterations" => {
                        if let Ok(num) = value.parse::<u32>() {
                            self.gui_config.advanced.parallel_iterations = num;
                        }
                    }
                    // CLI Paths
                    "cli_cursor" => self.gui_config.advanced.cli_paths.cursor = value,
                    "cli_codex" => self.gui_config.advanced.cli_paths.codex = value,
                    "cli_claude" => self.gui_config.advanced.cli_paths.claude = value,
                    "cli_gemini" => self.gui_config.advanced.cli_paths.gemini = value,
                    "cli_copilot" => self.gui_config.advanced.cli_paths.copilot = value,
                    // Execution
                    "max_parallel_phases" => {
                        if let Ok(num) = value.parse::<u32>() {
                            self.gui_config.advanced.execution.max_parallel_phases = num;
                        }
                    }
                    "max_parallel_tasks" => {
                        if let Ok(num) = value.parse::<u32>() {
                            self.gui_config.advanced.execution.max_parallel_tasks = num;
                        }
                    }
                    // Checkpointing
                    "checkpoint_interval" => {
                        if let Ok(num) = value.parse::<u64>() {
                            self.gui_config.advanced.checkpointing.interval_seconds = num;
                        }
                    }
                    "checkpoint_max" => {
                        if let Ok(num) = value.parse::<u32>() {
                            self.gui_config.advanced.checkpointing.max_checkpoints = num;
                        }
                    }
                    // Loop Guard
                    "loop_max_repetitions" => {
                        if let Ok(num) = value.parse::<u32>() {
                            self.gui_config.advanced.loop_guard.max_repetitions = num;
                        }
                    }
                    // Network
                    "allowed_origins" => self.gui_config.advanced.network.allowed_origins = value,
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::ConfigAdvancedCheckboxToggled(field) => {
                match field.as_str() {
                    "intensive_logging" => {
                        self.gui_config.advanced.intensive_logging =
                            !self.gui_config.advanced.intensive_logging;
                    }
                    "kill_on_failure" => {
                        self.gui_config.advanced.execution.kill_on_failure =
                            !self.gui_config.advanced.execution.kill_on_failure;
                    }
                    "enable_parallel" => {
                        self.gui_config.advanced.execution.enable_parallel =
                            !self.gui_config.advanced.execution.enable_parallel;
                    }
                    "checkpoint_enabled" => {
                        self.gui_config.advanced.checkpointing.enabled =
                            !self.gui_config.advanced.checkpointing.enabled;
                    }
                    "checkpoint_on_subtask" => {
                        self.gui_config.advanced.checkpointing.on_subtask_complete =
                            !self.gui_config.advanced.checkpointing.on_subtask_complete;
                    }
                    "checkpoint_on_shutdown" => {
                        self.gui_config.advanced.checkpointing.on_shutdown =
                            !self.gui_config.advanced.checkpointing.on_shutdown;
                    }
                    "loop_enabled" => {
                        self.gui_config.advanced.loop_guard.enabled =
                            !self.gui_config.advanced.loop_guard.enabled;
                    }
                    "loop_suppress_relay" => {
                        self.gui_config.advanced.loop_guard.suppress_reply_relay =
                            !self.gui_config.advanced.loop_guard.suppress_reply_relay;
                    }
                    "lan_mode" => {
                        self.gui_config.advanced.network.lan_mode =
                            !self.gui_config.advanced.network.lan_mode;
                    }
                    "trust_proxy" => {
                        self.gui_config.advanced.network.trust_proxy =
                            !self.gui_config.advanced.network.trust_proxy;
                    }
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }

            Message::LoadConfigResult(result) => {
                match result {
                    Ok(config) => {
                        self.gui_config = config;
                        self.config_is_dirty = false;
                        self.add_toast(ToastType::Success, "Configuration loaded".to_string());
                    }
                    Err(e) => {
                        self.add_toast(ToastType::Error, format!("Failed to load config: {}", e));
                    }
                }
                Task::none()
            }

            Message::LoadGitInfo => Task::perform(
                async { crate::config::gui_config::get_git_info() },
                |info| Message::GitInfoLoaded(Some(info)),
            ),

            Message::GitInfoLoaded(info) => {
                self.config_git_info = info;
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
                                        crate::types::CheckCategory::Cli => {
                                            crate::views::doctor::CheckCategory::Cli
                                        }
                                        crate::types::CheckCategory::Git => {
                                            crate::views::doctor::CheckCategory::Git
                                        }
                                        crate::types::CheckCategory::Project => {
                                            crate::views::doctor::CheckCategory::Project
                                        }
                                        crate::types::CheckCategory::Config => {
                                            crate::views::doctor::CheckCategory::Runtime
                                        }
                                        crate::types::CheckCategory::Environment => {
                                            crate::views::doctor::CheckCategory::Runtime
                                        }
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
                        Err(e) => Message::DoctorRunFailed(
                            ToastType::Error,
                            format!("Doctor checks failed: {}", e),
                        ),
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
                                crate::types::CheckCategory::Cli => {
                                    crate::views::doctor::CheckCategory::Cli
                                }
                                crate::types::CheckCategory::Git => {
                                    crate::views::doctor::CheckCategory::Git
                                }
                                crate::types::CheckCategory::Project => {
                                    crate::views::doctor::CheckCategory::Project
                                }
                                crate::types::CheckCategory::Config => {
                                    crate::views::doctor::CheckCategory::Runtime
                                }
                                crate::types::CheckCategory::Environment => {
                                    crate::views::doctor::CheckCategory::Runtime
                                }
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
                        Ok(None) => Message::DoctorRunFailed(
                            ToastType::Warning,
                            "Check not found".to_string(),
                        ),
                        Err(e) => Message::DoctorRunFailed(
                            ToastType::Error,
                            format!("Check failed: {}", e),
                        ),
                    },
                )
            }

            Message::FixCheck(name, dry_run) => {
                let action = if dry_run {
                    "Previewing fix"
                } else {
                    "Applying fix"
                };
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
                                crate::types::CheckCategory::Cli => {
                                    crate::views::doctor::CheckCategory::Cli
                                }
                                crate::types::CheckCategory::Git => {
                                    crate::views::doctor::CheckCategory::Git
                                }
                                crate::types::CheckCategory::Project => {
                                    crate::views::doctor::CheckCategory::Project
                                }
                                crate::types::CheckCategory::Config => {
                                    crate::views::doctor::CheckCategory::Runtime
                                }
                                crate::types::CheckCategory::Environment => {
                                    crate::views::doctor::CheckCategory::Runtime
                                }
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
                if let Some(existing) = self
                    .doctor_results
                    .iter_mut()
                    .find(|r| r.name == result.name)
                {
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

            Message::ToggleDoctorPlatformSelector => {
                self.doctor_platform_selector_visible = !self.doctor_platform_selector_visible;
                Task::none()
            }

            Message::ToggleDoctorPlatform(platform) => {
                if self.doctor_selected_platforms.contains(&platform) {
                    self.doctor_selected_platforms.retain(|p| p != &platform);
                } else {
                    self.doctor_selected_platforms.push(platform);
                }
                Task::none()
            }

            Message::ToggleDoctorCheckExpand(check_name) => {
                if self.doctor_expanded_checks.contains(&check_name) {
                    self.doctor_expanded_checks.remove(&check_name);
                    self.doctor_detail_contents.remove(&check_name);
                } else {
                    self.doctor_expanded_checks.insert(check_name.clone());
                    // Create text_editor::Content for the check details
                    if let Some(check) = self.doctor_results.iter().find(|c| c.name == check_name) {
                        if !check.message.is_empty() {
                            self.doctor_detail_contents.insert(
                                check_name.clone(),
                                text_editor::Content::with_text(&check.message),
                            );
                        }
                    }
                }
                Task::none()
            }

            Message::InstallAllMissing => {
                // Collect all failed checks that have fixes available
                let fixable_checks: Vec<String> = self
                    .doctor_results
                    .iter()
                    .filter(|r| !r.passed && r.fix_available)
                    .map(|r| r.name.clone())
                    .collect();

                if fixable_checks.is_empty() {
                    self.add_toast(
                        ToastType::Info,
                        "No failed checks with fixes available".to_string(),
                    );
                    return Task::none();
                }

                self.add_toast(
                    ToastType::Info,
                    format!(
                        "Installing {} missing dependencies...",
                        fixable_checks.len()
                    ),
                );

                // Mark all as fixing
                for check in &fixable_checks {
                    self.doctor_fixing.insert(check.clone());
                }

                // Create tasks to fix each check sequentially
                let tasks: Vec<Task<Message>> = fixable_checks
                    .into_iter()
                    .map(|check_name| {
                        Task::perform(
                            async move {
                                let registry = crate::doctor::CheckRegistry::default();
                                let result = registry.fix_check(&check_name, false).await;
                                (check_name, result)
                            },
                            |(name, res)| {
                                let fix_result = res.ok().and_then(|o| o.and_then(|(_, f)| f));
                                Message::FixCheckComplete(name, fix_result)
                            },
                        )
                    })
                    .collect();

                // Run all fix tasks
                Task::batch(tasks)
            }

            // ================================================================
            // Wizard
            // ================================================================
            Message::WizardNextStep => {
                // Advance to next step (max step is 8: 0, 0.5, 1-6)
                // Steps: 0 (Project Setup), 1 (Interview Config), 2 (Requirements), 3 (Generate PRD),
                // 4 (Review PRD), 5 (Configure Tiers), 6 (Generate Plan), 7 (Review Plan), 8 (Review & Start)
                if self.wizard_step < 8 {
                    self.wizard_step += 1;
                }
                Task::none()
            }

            Message::WizardPrevStep => {
                // Go back to previous step (min step is 0)
                if self.wizard_step > 0 {
                    self.wizard_step -= 1;
                }
                Task::none()
            }

            // Step 0: Project Setup
            Message::WizardIsNewProjectToggled(is_new) => {
                self.wizard_is_new_project = is_new;
                Task::none()
            }

            Message::WizardHasGithubRepoToggled(has_repo) => {
                self.wizard_has_github_repo = has_repo;
                if !has_repo {
                    self.wizard_github_url.clear();
                }
                Task::none()
            }

            Message::WizardGithubUrlChanged(url) => {
                self.wizard_github_url = url;
                Task::none()
            }

            Message::WizardCreateGithubRepoToggled(create) => {
                self.wizard_create_github_repo = create;
                Task::none()
            }

            Message::WizardGithubVisibilityChanged(visibility) => {
                self.wizard_github_visibility = visibility;
                Task::none()
            }

            Message::WizardGithubDescriptionChanged(desc) => {
                self.wizard_github_description = desc;
                Task::none()
            }

            Message::WizardInitializeProject => {
                // Validate project setup
                if self.wizard_project_name.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please enter a project name".to_string(),
                    );
                    return Task::none();
                }
                if self.wizard_project_path.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please select a project path".to_string(),
                    );
                    return Task::none();
                }
                if self.wizard_has_github_repo && self.wizard_github_url.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please enter your GitHub repository URL".to_string(),
                    );
                    return Task::none();
                }

                // Initialize git repo if needed
                let project_path = PathBuf::from(&self.wizard_project_path);

                // Create project directory
                if let Err(e) = std::fs::create_dir_all(&project_path) {
                    self.add_toast(
                        ToastType::Error,
                        format!("Failed to create project directory: {}", e),
                    );
                    return Task::none();
                }

                // Create .puppet-master directory
                let pm_dir = project_path.join(".puppet-master");
                if let Err(e) = std::fs::create_dir_all(&pm_dir) {
                    self.add_toast(
                        ToastType::Error,
                        format!("Failed to create .puppet-master directory: {}", e),
                    );
                    return Task::none();
                }

                // Initialize git repo if not already present
                let git_dir = project_path.join(".git");
                if !git_dir.exists() {
                    match Command::new("git")
                        .arg("-C")
                        .arg(&project_path)
                        .arg("init")
                        .status()
                    {
                        Ok(status) if status.success() => {
                            self.add_toast(
                                ToastType::Success,
                                "Initialized git repository".to_string(),
                            );
                        }
                        Ok(status) => {
                            self.add_toast(
                                ToastType::Error,
                                format!("Git init failed (exit {})", status.code().unwrap_or(-1)),
                            );
                            return Task::none();
                        }
                        Err(err) => {
                            self.add_toast(
                                ToastType::Error,
                                format!("Failed to run git init: {}", err),
                            );
                            return Task::none();
                        }
                    }
                }

                // Configure remote or create GitHub repo if requested
                if self.wizard_has_github_repo {
                    let remote_status = Command::new("git")
                        .arg("-C")
                        .arg(&project_path)
                        .arg("remote")
                        .arg("get-url")
                        .arg("origin")
                        .status();

                    let needs_remote = match remote_status {
                        Ok(status) => !status.success(),
                        Err(_) => true,
                    };

                    if needs_remote {
                        match Command::new("git")
                            .arg("-C")
                            .arg(&project_path)
                            .arg("remote")
                            .arg("add")
                            .arg("origin")
                            .arg(&self.wizard_github_url)
                            .status()
                        {
                            Ok(status) if status.success() => {
                                self.add_toast(
                                    ToastType::Success,
                                    "Configured git remote origin".to_string(),
                                );
                            }
                            Ok(status) => {
                                self.add_toast(
                                    ToastType::Error,
                                    format!(
                                        "Failed to add git remote (exit {})",
                                        status.code().unwrap_or(-1)
                                    ),
                                );
                                return Task::none();
                            }
                            Err(err) => {
                                self.add_toast(
                                    ToastType::Error,
                                    format!("Failed to add git remote: {}", err),
                                );
                                return Task::none();
                            }
                        }
                    }
                } else if self.wizard_create_github_repo {
                    let repo_name = self
                        .wizard_project_name
                        .trim()
                        .replace(' ', "-")
                        .to_lowercase();
                    let visibility_flag = if self.wizard_github_visibility == "private" {
                        "--private"
                    } else {
                        "--public"
                    };

                    let mut cmd = Command::new("gh");
                    cmd.arg("repo")
                        .arg("create")
                        .arg(&repo_name)
                        .arg(visibility_flag)
                        .arg("--confirm")
                        .arg("--source")
                        .arg(&project_path)
                        .arg("--remote")
                        .arg("origin");

                    if !self.wizard_github_description.trim().is_empty() {
                        cmd.arg("--description")
                            .arg(&self.wizard_github_description);
                    }

                    match cmd.status() {
                        Ok(status) if status.success() => {
                            self.add_toast(
                                ToastType::Success,
                                "GitHub repository created".to_string(),
                            );
                        }
                        Ok(status) => {
                            self.add_toast(
                                ToastType::Error,
                                format!(
                                    "GitHub repo creation failed (exit {})",
                                    status.code().unwrap_or(-1)
                                ),
                            );
                            return Task::none();
                        }
                        Err(err) => {
                            self.add_toast(
                                ToastType::Error,
                                format!("Failed to run gh repo create: {}", err),
                            );
                            return Task::none();
                        }
                    }
                }

                self.add_toast(
                    ToastType::Success,
                    "Project initialized successfully".to_string(),
                );
                self.wizard_step = 1;
                Task::none()
            }

            // Step 0.5: Quick Interview Config
            Message::WizardUseInterviewToggled(use_interview) => {
                self.wizard_use_interview = use_interview;
                Task::none()
            }

            Message::WizardInteractionModeChanged(mode) => {
                self.wizard_interaction_mode = mode;
                self.gui_config.interview.interaction_mode = self.wizard_interaction_mode.clone();
                Task::none()
            }

            Message::WizardReasoningLevelChanged(level) => {
                self.wizard_reasoning_level = level;
                self.gui_config.interview.reasoning_level = self.wizard_reasoning_level.clone();
                Task::none()
            }

            Message::WizardGenerateAgentsMdToggled(generate) => {
                self.wizard_generate_agents_md = generate;
                self.gui_config.interview.generate_initial_agents_md =
                    self.wizard_generate_agents_md;
                Task::none()
            }

            Message::WizardProjectNameChanged(name) => {
                self.wizard_project_name = name;
                Task::none()
            }

            Message::WizardProjectPathChanged(path) => {
                self.wizard_project_path = path;
                Task::none()
            }

            Message::WizardRequirementsChanged(text) => {
                self.wizard_requirements_text = text.clone();
                // Update the preview content
                self.wizard_requirements_preview_content = text_editor::Content::with_text(&text);
                Task::none()
            }

            Message::WizardPrdPlatformChanged(platform) => {
                self.wizard_prd_platform = platform.clone();
                // Auto-select first model for this platform
                if let Some(models) = self.wizard_models.get(&platform) {
                    if let Some(first_model) = models.first() {
                        self.wizard_prd_model = first_model.clone();
                    }
                }
                Task::none()
            }

            Message::WizardPrdModelChanged(model) => {
                self.wizard_prd_model = model;
                Task::none()
            }

            Message::WizardPrdEditorAction(action) => {
                self.wizard_prd_editor_content.perform(action);
                self.wizard_prd_text = self.wizard_prd_editor_content.text();
                Task::none()
            }

            Message::WizardTierPlatformChanged(tier, platform) => {
                if let Some(config) = self.wizard_tier_configs.get_mut(&tier) {
                    config.platform = platform.clone();
                    // Auto-select first model for this platform
                    if let Some(models) = self.wizard_models.get(&platform) {
                        if let Some(first_model) = models.first() {
                            config.model = first_model.clone();
                        }
                    }
                }
                Task::none()
            }

            Message::WizardTierModelChanged(tier, model) => {
                if let Some(config) = self.wizard_tier_configs.get_mut(&tier) {
                    config.model = model;
                }
                Task::none()
            }

            Message::WizardTierReasoningChanged(tier, effort) => {
                if let Some(config) = self.wizard_tier_configs.get_mut(&tier) {
                    config.reasoning_effort = effort;
                }
                Task::none()
            }

            Message::WizardTierPlanModeToggled(tier, value) => {
                if let Some(config) = self.wizard_tier_configs.get_mut(&tier) {
                    config.plan_mode = value;
                }
                Task::none()
            }

            Message::WizardTierAskModeToggled(tier, value) => {
                if let Some(config) = self.wizard_tier_configs.get_mut(&tier) {
                    config.ask_mode = value;
                }
                Task::none()
            }

            Message::WizardTierOutputFormatChanged(tier, format) => {
                if let Some(config) = self.wizard_tier_configs.get_mut(&tier) {
                    config.output_format = format;
                }
                Task::none()
            }

            Message::WizardBrowseProjectPath => {
                // Open folder picker asynchronously
                Task::perform(
                    async {
                        let result = rfd::AsyncFileDialog::new()
                            .set_title("Select Project Folder")
                            .pick_folder()
                            .await;

                        result.map(|folder| folder.path().to_path_buf())
                    },
                    Message::WizardProjectPathSelected,
                )
            }

            Message::WizardProjectPathSelected(path_opt) => {
                if let Some(path) = path_opt {
                    self.wizard_project_path = path.display().to_string();
                }
                Task::none()
            }

            Message::WizardBrowseRequirementsFile => {
                // Open file picker asynchronously
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
                    Message::WizardRequirementsFileSelected,
                )
            }

            Message::WizardRequirementsFileSelected(path_opt) => {
                if let Some(path) = path_opt {
                    // Load file content
                    match std::fs::read_to_string(&path) {
                        Ok(content) => {
                            self.wizard_requirements_text = content.clone();
                            // Update the preview content
                            self.wizard_requirements_preview_content =
                                text_editor::Content::with_text(&content);
                            self.add_toast(
                                ToastType::Success,
                                format!("Loaded file: {}", path.display()),
                            );
                            Task::none()
                        }
                        Err(e) => {
                            let friendly_msg =
                                if e.to_string().contains("No such file or directory")
                                    || e.to_string().contains("cannot find the path")
                                {
                                    format!("File not found: {}", path.display())
                                } else if e.to_string().contains("Permission denied") {
                                    format!("Permission denied reading file: {}", path.display())
                                } else {
                                    format!("Failed to read requirements file: {}", e)
                                };
                            self.add_toast(ToastType::Error, friendly_msg);
                            Task::none()
                        }
                    }
                } else {
                    Task::none()
                }
            }

            Message::WizardGeneratePrd => {
                if self.wizard_requirements_text.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please enter requirements first".to_string(),
                    );
                    return Task::none();
                }

                self.wizard_generating = true;
                let requirements = self.wizard_requirements_text.clone();

                // Generate placeholder PRD (real AI integration comes later)
                Task::perform(
                    async move {
                        tokio::time::sleep(tokio::time::Duration::from_millis(1500)).await;

                        let prd = format!(
                            "# Product Requirements Document\n\n\
                            ## Project Overview\n\n\
                            Generated from user requirements.\n\n\
                            ## Requirements\n\n\
                            {}\n\n\
                            ## Technical Specifications\n\n\
                            - Architecture: Modular\n\
                            - Technology Stack: TBD\n\
                            - Deployment: Cloud-based\n\n\
                            ## Success Criteria\n\n\
                            - All requirements met\n\
                            - Quality standards achieved\n\
                            - Timeline adhered to\n\n\
                            ## Phases\n\n\
                            1. Planning & Design\n\
                            2. Development\n\
                            3. Testing & QA\n\
                            4. Deployment\n",
                            requirements
                        );

                        Ok(prd)
                    },
                    Message::WizardPrdGenerated,
                )
            }

            Message::WizardPrdGenerated(result) => {
                self.wizard_generating = false;
                match result {
                    Ok(prd) => {
                        self.wizard_prd_text = prd.clone();
                        self.wizard_prd_editor_content = text_editor::Content::with_text(&prd);
                        self.wizard_prd_preview = Some(prd);
                        self.wizard_step = 3; // Move to review step
                        self.add_toast(
                            ToastType::Success,
                            "PRD generated successfully".to_string(),
                        );
                    }
                    Err(e) => {
                        self.add_toast(ToastType::Error, format!("Failed to generate PRD: {}", e));
                    }
                }
                Task::none()
            }

            Message::WizardGeneratePlan => {
                if self.wizard_prd_text.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "No PRD available for plan generation".to_string(),
                    );
                    return Task::none();
                }

                self.wizard_generating = true;
                let prd = self.wizard_prd_text.clone();

                // Generate placeholder plan (real AI integration comes later)
                Task::perform(
                    async move {
                        tokio::time::sleep(tokio::time::Duration::from_millis(1500)).await;

                        let plan = format!(
                            "# Execution Plan\n\n\
                            ## Overview\n\
                            Generated from PRD.\n\n\
                            ## Phase 1: Planning & Design\n\
                            - Task 1.1: Requirements Analysis\n\
                            - Task 1.2: Architecture Design\n\n\
                            ## Phase 2: Development\n\
                            - Task 2.1: Core Implementation\n\
                            - Task 2.2: Feature Development\n\n\
                            ## Phase 3: Testing & QA\n\
                            - Task 3.1: Unit Testing\n\
                            - Task 3.2: Integration Testing\n\n\
                            ## Phase 4: Deployment\n\
                            - Task 4.1: Staging Deployment\n\
                            - Task 4.2: Production Release\n\n\
                            Based on PRD:\n{}\n",
                            prd.chars().take(200).collect::<String>()
                        );

                        Ok(plan)
                    },
                    Message::WizardPlanGenerated,
                )
            }

            Message::WizardPlanGenerated(result) => {
                self.wizard_generating = false;
                match result {
                    Ok(plan) => {
                        self.wizard_plan_text = plan.clone();
                        // Update plan content for text_editor
                        self.wizard_plan_content = text_editor::Content::with_text(&plan);
                        self.add_toast(
                            ToastType::Success,
                            "Plan generated successfully".to_string(),
                        );
                    }
                    Err(e) => {
                        self.add_toast(ToastType::Error, format!("Failed to generate plan: {}", e));
                    }
                }
                Task::none()
            }

            Message::WizardStartChain => {
                // Validate all required fields
                if self.wizard_project_name.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please enter a project name".to_string(),
                    );
                    return Task::none();
                }
                if self.wizard_project_path.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please select a project path".to_string(),
                    );
                    return Task::none();
                }
                if self.wizard_prd_text.trim().is_empty() {
                    self.add_toast(
                        ToastType::Warning,
                        "Please generate a PRD first".to_string(),
                    );
                    return Task::none();
                }

                // Save PRD to project folder
                let project_path = PathBuf::from(&self.wizard_project_path);
                let prd_path = project_path.join("prd.md");

                if let Err(e) = std::fs::create_dir_all(&project_path) {
                    let friendly_msg = if e.to_string().contains("Permission denied") {
                        "Permission denied. Please check directory permissions.".to_string()
                    } else {
                        format!("Failed to create project directory: {}", e)
                    };
                    self.add_toast(ToastType::Error, friendly_msg);
                    return Task::none();
                }

                if let Err(e) = std::fs::write(&prd_path, &self.wizard_prd_text) {
                    let friendly_msg = if e.to_string().contains("Permission denied") {
                        "Permission denied. Please check write permissions for the PRD file."
                            .to_string()
                    } else {
                        format!("Failed to save PRD file: {}", e)
                    };
                    self.add_toast(ToastType::Error, friendly_msg);
                    return Task::none();
                }

                // Save plan if available
                if !self.wizard_plan_text.is_empty() {
                    let plan_path = project_path.join("plan.md");
                    let _ = std::fs::write(&plan_path, &self.wizard_plan_text);
                }

                // Navigate to dashboard and show success
                self.add_toast(
                    ToastType::Success,
                    format!(
                        "Project '{}' created successfully!",
                        self.wizard_project_name
                    ),
                );
                self.current_page = Page::Dashboard;

                // Reset wizard state for next use
                self.wizard_step = 1;
                self.wizard_project_name.clear();
                self.wizard_project_path.clear();
                self.wizard_requirements_text.clear();
                self.wizard_prd_text.clear();
                self.wizard_prd_editor_content = text_editor::Content::new();
                self.wizard_plan_text.clear();

                Task::none()
            }

            Message::WizardRefreshModels => {
                // Load hardcoded model lists
                let mut models = HashMap::new();
                models.insert(
                    "cursor".to_string(),
                    vec![
                        "auto".to_string(),
                        "claude-sonnet-4".to_string(),
                        "gpt-4o".to_string(),
                        "gemini-2.5-pro".to_string(),
                    ],
                );
                models.insert(
                    "codex".to_string(),
                    vec![
                        "gpt-5.2-codex".to_string(),
                        "gpt-5.1-codex".to_string(),
                        "gpt-4.1".to_string(),
                    ],
                );
                models.insert(
                    "claude".to_string(),
                    vec![
                        "claude-sonnet-4-5".to_string(),
                        "claude-sonnet-4".to_string(),
                        "claude-opus-4".to_string(),
                    ],
                );
                models.insert(
                    "gemini".to_string(),
                    vec![
                        "gemini-2.5-pro".to_string(),
                        "gemini-2.5-flash".to_string(),
                        "gemini-3-pro-preview".to_string(),
                    ],
                );
                models.insert(
                    "copilot".to_string(),
                    vec!["claude-sonnet-4-5".to_string(), "gpt-4o".to_string()],
                );

                Task::done(Message::WizardModelsLoaded(models))
            }

            Message::WizardModelsLoaded(models) => {
                self.wizard_models = models;
                self.add_toast(ToastType::Success, "Models loaded".to_string());
                Task::none()
            }

            Message::OpenWizardFilePicker => {
                // Alias for WizardBrowseRequirementsFile
                self.update(Message::WizardBrowseRequirementsFile)
            }

            Message::WizardFilePickerResult(path_opt) => {
                // Alias for WizardRequirementsFileSelected
                self.update(Message::WizardRequirementsFileSelected(path_opt))
            }

            Message::WizardGenerate => {
                // Alias for WizardGeneratePrd
                self.update(Message::WizardGeneratePrd)
            }

            Message::WizardSave => {
                // Alias for WizardStartChain
                self.update(Message::WizardStartChain)
            }

            // ================================================================
            // Setup
            // ================================================================
            Message::SetupRunDetection => {
                self.setup_is_checking = true;
                self.add_toast(
                    ToastType::Info,
                    "Detecting platform installations...".to_string(),
                );

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
                                instructions: if matches!(
                                    status,
                                    crate::doctor::InstallationStatus::Installed(_)
                                ) {
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

                let installed_count = self
                    .setup_platform_statuses
                    .iter()
                    .filter(|s| matches!(s.status, crate::doctor::InstallationStatus::Installed(_)))
                    .count();

                self.add_toast(
                    ToastType::Success,
                    format!(
                        "Detection complete. {} of {} platforms installed.",
                        installed_count,
                        self.setup_platform_statuses.len()
                    ),
                );

                Task::none()
            }

            Message::SetupComplete => {
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| {
                        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                    });

                let marker_dir = base.join(".puppet-master");
                let marker_file = marker_dir.join("setup-complete");

                // Create directory if it doesn't exist
                if let Err(e) = std::fs::create_dir_all(&marker_dir) {
                    let friendly_msg = if e.to_string().contains("Permission denied") {
                        "Permission denied. Please check write permissions for the project directory.".to_string()
                    } else {
                        format!("Failed to create .puppet-master directory: {}", e)
                    };
                    self.add_toast(ToastType::Error, friendly_msg);
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
                        let friendly_msg = if e.to_string().contains("Permission denied") {
                            "Permission denied. Please check write permissions for the project directory.".to_string()
                        } else {
                            format!("Failed to create setup marker file: {}", e)
                        };
                        self.add_toast(ToastType::Error, friendly_msg);
                    }
                }

                Task::none()
            }

            // ================================================================
            // Tiers
            // ================================================================
            Message::ToggleTierExpand(tier_id) => {
                if self.expanded_tiers.contains(&tier_id) {
                    self.expanded_tiers.remove(&tier_id);
                } else {
                    self.expanded_tiers.insert(tier_id.clone());
                }
                // Sync expanded state to tier_tree nodes
                for node in &mut self.tier_tree {
                    node.expanded = self.expanded_tiers.contains(&node.id);
                }
                Task::none()
            }

            Message::SelectTier(tier_id) => {
                self.selected_tier = Some(tier_id.clone());

                // Find tier details from tier_tree
                if let Some(tier) = self.tier_tree.iter().find(|t| t.id == tier_id) {
                    // Determine tier type and get platform/model from config
                    let (platform, model) = match tier.tier_type {
                        crate::views::tiers::TierNodeType::Phase => (
                            self.gui_config.tiers.phase.platform.clone(),
                            self.gui_config.tiers.phase.model.clone(),
                        ),
                        crate::views::tiers::TierNodeType::Task => (
                            self.gui_config.tiers.task.platform.clone(),
                            self.gui_config.tiers.task.model.clone(),
                        ),
                        crate::views::tiers::TierNodeType::Subtask => (
                            self.gui_config.tiers.subtask.platform.clone(),
                            self.gui_config.tiers.subtask.model.clone(),
                        ),
                    };

                    // Load dependencies from PRD if available
                    let base = self
                        .current_project
                        .as_ref()
                        .map(|p| p.path.clone())
                        .unwrap_or_else(|| {
                            std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                        });

                    let prd_path = base.join(".puppet-master").join("prd.json");
                    let mut dependencies = Vec::new();

                    if prd_path.exists() {
                        // Try to load PRD and find dependencies
                        if let Ok(content) = std::fs::read_to_string(&prd_path) {
                            if let Ok(prd) = serde_json::from_str::<crate::types::PRD>(&content) {
                                // Find the tier in PRD and extract dependencies
                                'outer: for phase in &prd.phases {
                                    if phase.id == tier.id {
                                        dependencies = phase.dependencies.clone();
                                        break 'outer;
                                    }
                                    for task in &phase.tasks {
                                        if task.id == tier.id {
                                            dependencies = task.dependencies.clone();
                                            break 'outer;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    let tier_type_str = match tier.tier_type {
                        crate::views::tiers::TierNodeType::Phase => "Phase",
                        crate::views::tiers::TierNodeType::Task => "Task",
                        crate::views::tiers::TierNodeType::Subtask => "Subtask",
                    };

                    let description = format!(
                        "Status: {}\nPlatform: {}\nModel: {}\nType: {}",
                        tier.status, platform, model, tier_type_str
                    );

                    self.selected_tier_details = Some(crate::views::tiers::TierDetails {
                        id: tier.id.clone(),
                        title: tier.title.clone(),
                        description: description.clone(),
                        status: tier.status.clone(),
                        dependencies,
                        platform,
                    });
                    // Update tier_details_content with the description
                    self.tier_details_content = text_editor::Content::with_text(&description);
                }

                Task::none()
            }

            Message::ExpandAllTiers => {
                self.expanded_tiers = self.tier_tree.iter().map(|t| t.id.clone()).collect();
                Task::none()
            }

            Message::CollapseAllTiers => {
                self.expanded_tiers.clear();
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

            Message::EvidenceSelectItem(index) => {
                self.evidence_selected_item = Some(index);
                // Auto-load preview content
                if let Some(item) = self.evidence_items.get(index) {
                    let path_str = item.path.display().to_string();
                    return self.update(Message::EvidenceLoadContent(path_str));
                }
                Task::none()
            }

            Message::EvidenceViewItem(index) => {
                self.evidence_selected_item = Some(index);
                if let Some(item) = self.evidence_items.get(index) {
                    let path_str = item.path.display().to_string();
                    return self.update(Message::EvidenceLoadContent(path_str));
                }
                Task::none()
            }

            Message::EvidenceDownloadItem(index) => {
                if let Some(item) = self.evidence_items.get(index) {
                    let source_path = item.path.clone();
                    let default_name = source_path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("evidence-item")
                        .to_string();

                    return Task::perform(
                        async move {
                            let file_handle = rfd::AsyncFileDialog::new()
                                .set_title("Save Evidence")
                                .set_file_name(&default_name)
                                .save_file()
                                .await;

                            if let Some(handle) = file_handle {
                                let dest_path = handle.path().to_path_buf();
                                match std::fs::copy(&source_path, &dest_path) {
                                    Ok(_) => Message::AddToast(
                                        ToastType::Success,
                                        format!("Saved to {}", dest_path.display()),
                                    ),
                                    Err(e) => Message::AddToast(
                                        ToastType::Error,
                                        format!("Failed to save: {}", e),
                                    ),
                                }
                            } else {
                                Message::None
                            }
                        },
                        |msg| msg,
                    );
                }
                Task::none()
            }

            Message::EvidenceRefresh => {
                // Re-scan evidence directory
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| {
                        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                    });

                let evidence_dir = base.join(".puppet-master").join("evidence");

                if evidence_dir.exists() {
                    // Scan evidence directory
                    let mut new_items = Vec::new();

                    // Define subdirectories to scan
                    let subdirs = vec![
                        (
                            "test-logs",
                            crate::views::evidence::EvidenceItemType::TestLog,
                        ),
                        (
                            "screenshots",
                            crate::views::evidence::EvidenceItemType::Screenshot,
                        ),
                        (
                            "browser-traces",
                            crate::views::evidence::EvidenceItemType::BrowserTrace,
                        ),
                        (
                            "file-snapshots",
                            crate::views::evidence::EvidenceItemType::FileSnapshot,
                        ),
                        ("metrics", crate::views::evidence::EvidenceItemType::Metrics),
                        (
                            "gate-reports",
                            crate::views::evidence::EvidenceItemType::GateReport,
                        ),
                    ];

                    for (subdir_name, ev_type) in subdirs {
                        let subdir_path = evidence_dir.join(subdir_name);
                        if subdir_path.exists() && subdir_path.is_dir() {
                            if let Ok(entries) = std::fs::read_dir(&subdir_path) {
                                for entry in entries.flatten() {
                                    if let Ok(metadata) = entry.metadata() {
                                        if metadata.is_file() {
                                            let path = entry.path();
                                            let filename = path
                                                .file_name()
                                                .and_then(|n| n.to_str())
                                                .unwrap_or("unknown")
                                                .to_string();

                                            // Skip .gitkeep files
                                            if filename == ".gitkeep" {
                                                continue;
                                            }

                                            // Extract tier ID from filename if present (e.g., TEST-003)
                                            let tier_id = filename
                                                .split('-')
                                                .take(2)
                                                .collect::<Vec<_>>()
                                                .join("-");

                                            // Get file timestamp
                                            let timestamp = metadata
                                                .modified()
                                                .ok()
                                                .and_then(|t| {
                                                    use std::time::SystemTime;
                                                    let duration = t
                                                        .duration_since(SystemTime::UNIX_EPOCH)
                                                        .ok()?;
                                                    chrono::DateTime::from_timestamp(
                                                        duration.as_secs() as i64,
                                                        0,
                                                    )
                                                })
                                                .unwrap_or_else(|| chrono::Utc::now());

                                            new_items.push(EvidenceItem {
                                                id: format!("{}-{}", tier_id, filename),
                                                tier_id,
                                                evidence_type: ev_type,
                                                summary: filename.clone(),
                                                timestamp,
                                                path,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Sort by timestamp descending (newest first)
                    new_items.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

                    self.evidence_items = new_items;
                    self.add_toast(
                        ToastType::Success,
                        format!("Found {} evidence items", self.evidence_items.len()),
                    );
                } else {
                    self.evidence_items.clear();
                    self.add_toast(ToastType::Info, "No evidence directory found".to_string());
                }

                Task::none()
            }

            Message::EvidenceLoadContent(path_str) => {
                let path = PathBuf::from(path_str.clone());
                Task::perform(
                    async move {
                        match std::fs::read_to_string(&path) {
                            Ok(content) => {
                                // Limit preview to reasonable size
                                let preview = if content.len() > 10000 {
                                    format!("{}... (truncated)", &content[..10000])
                                } else {
                                    content
                                };
                                Message::EvidenceContentLoaded(path_str, preview)
                            }
                            Err(_) => {
                                // Binary file or read error
                                Message::EvidenceContentLoaded(
                                    path_str,
                                    "[Binary file - preview not available]".to_string(),
                                )
                            }
                        }
                    },
                    |msg| msg,
                )
            }

            Message::EvidenceContentLoaded(path, content) => {
                self.evidence_preview_path = Some(path);
                self.evidence_preview_content = text_editor::Content::with_text(&content);
                Task::none()
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

            Message::LoadHistory => self.update(Message::NavigateTo(Page::History)),

            Message::HistoryNextPage => {
                let total_pages = (self.history_sessions.len() + self.history_items_per_page - 1)
                    / self.history_items_per_page;
                if self.history_page + 1 < total_pages {
                    self.history_page += 1;
                }
                self.recompute_history_display();
                Task::none()
            }

            Message::HistoryPrevPage => {
                if self.history_page > 0 {
                    self.history_page -= 1;
                }
                self.recompute_history_display();
                Task::none()
            }

            Message::HistoryFilterChanged(filter) => {
                self.history_filter = filter;
                self.history_page = 0;
                self.recompute_history_display();
                Task::none()
            }

            Message::HistorySearchChanged(search) => {
                self.history_search = search;
                self.history_page = 0;
                self.recompute_history_display();
                Task::none()
            }

            Message::HistoryViewSession(session_id) => {
                // Navigate to tiers page with the session loaded
                self.selected_tier = Some(session_id);
                self.update(Message::NavigateTo(Page::Tiers))
            }

            // ================================================================
            // Memory
            // ================================================================
            Message::MemorySectionChanged(section) => {
                self.memory_section = section;
                // Update memory_content with filtered content for the new section
                let filtered = crate::views::memory::filter_content(
                    &self.memory_content_string,
                    &self.memory_section,
                );
                self.memory_content = text_editor::Content::with_text(&filtered);
                Task::none()
            }

            Message::LoadMemoryContent => {
                self.memory_loading = true;
                Task::perform(
                    async {
                        // Try to read AGENTS.md from current directory
                        let paths = vec![
                            PathBuf::from("AGENTS.md"),
                            PathBuf::from(".puppet-master/AGENTS.md"),
                        ];

                        for path in paths {
                            if let Ok(content) = std::fs::read_to_string(&path) {
                                return Message::MemoryContentLoaded(content);
                            }
                        }

                        // Return empty or default content
                        Message::MemoryContentLoaded(String::from(
                            "# AGENTS.md\n\nNo AGENTS.md file found. This file stores learned patterns and best practices.",
                        ))
                    },
                    |msg| msg,
                )
            }

            Message::MemoryContentLoaded(content) => {
                self.memory_content_string = content.clone();
                // Update text_editor content with filtered section
                let filtered = crate::views::memory::filter_content(&content, &self.memory_section);
                self.memory_content = text_editor::Content::with_text(&filtered);
                self.memory_loading = false;
                Task::none()
            }

            Message::MemoryEditExternal => {
                let path = PathBuf::from("AGENTS.md");

                // Try to open with default editor
                #[cfg(target_os = "linux")]
                {
                    let _ = std::process::Command::new("xdg-open").arg(&path).spawn();
                }
                #[cfg(target_os = "macos")]
                {
                    let _ = std::process::Command::new("open").arg(&path).spawn();
                }
                #[cfg(target_os = "windows")]
                {
                    let _ = std::process::Command::new("cmd")
                        .args(&["/C", "start", path.to_str().unwrap_or("")])
                        .spawn();
                }

                self.add_toast(
                    ToastType::Info,
                    "Opening AGENTS.md in external editor...".to_string(),
                );
                Task::none()
            }

            Message::MemoryExport => {
                // For now, just show a toast. Could add file picker later
                self.add_toast(
                    ToastType::Info,
                    "Export functionality coming soon".to_string(),
                );
                Task::none()
            }

            Message::MemoryRefresh => self.update(Message::LoadMemoryContent),

            // ================================================================
            // Ledger
            // ================================================================
            Message::FilterLedger(filter) => {
                self.ledger_filter = filter;
                Task::none()
            }

            Message::LoadLedger => self.update(Message::NavigateTo(Page::Ledger)),

            Message::LedgerFilterTypeChanged(type_str_opt) => {
                if let Some(type_str) = type_str_opt {
                    // Parse the event type string
                    use crate::views::ledger::EventType;
                    let event_type = EventType::all()
                        .into_iter()
                        .find(|et| et.as_str() == type_str);
                    self.ledger_filter.event_type = event_type;
                } else {
                    self.ledger_filter.event_type = None;
                }
                Task::none()
            }

            Message::LedgerFilterTierChanged(tier) => {
                self.ledger_filter_tier = tier.clone();
                self.ledger_filter.tier_id = if tier.is_empty() { None } else { Some(tier) };
                Task::none()
            }

            Message::LedgerFilterSessionChanged(session) => {
                self.ledger_filter_session = session;
                Task::none()
            }

            Message::LedgerFilterLimitChanged(limit_str) => {
                if let Ok(limit) = limit_str.parse::<usize>() {
                    self.ledger_filter.limit = limit;
                }
                Task::none()
            }

            Message::LedgerClearFilters => {
                self.ledger_filter = LedgerFilter::default();
                self.ledger_filter_tier.clear();
                self.ledger_filter_session.clear();
                Task::none()
            }

            Message::LedgerRefresh => {
                // Re-read ledger data from disk - looking for usage.jsonl (JSONL format)
                let base = self
                    .current_project
                    .as_ref()
                    .map(|p| p.path.clone())
                    .unwrap_or_else(|| {
                        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                    });

                let ledger_path = base
                    .join(".puppet-master")
                    .join("usage")
                    .join("usage.jsonl");

                if ledger_path.exists() {
                    match std::fs::read_to_string(&ledger_path) {
                        Ok(content) => {
                            // Parse JSONL format (one JSON object per line)
                            let mut entries = Vec::new();
                            let mut entry_id = 0;

                            for (line_no, line) in content.lines().enumerate() {
                                if line.trim().is_empty() {
                                    continue;
                                }

                                match serde_json::from_str::<serde_json::Value>(line) {
                                    Ok(json) => {
                                        // Parse the JSON object into a LedgerEntry
                                        // Expected fields: timestamp, platform, operation, tokens_in, tokens_out, cost, etc.

                                        let timestamp = if let Some(ts_str) =
                                            json.get("timestamp").and_then(|v| v.as_str())
                                        {
                                            chrono::DateTime::parse_from_rfc3339(ts_str)
                                                .ok()
                                                .map(|dt| dt.with_timezone(&chrono::Utc))
                                                .unwrap_or_else(|| chrono::Utc::now())
                                        } else {
                                            chrono::Utc::now()
                                        };

                                        // Determine event type from operation field
                                        let event_type = if let Some(op) =
                                            json.get("operation").and_then(|v| v.as_str())
                                        {
                                            match op.to_lowercase().as_str() {
                                                "request" | "platform_request" => crate::views::ledger::EventType::PlatformRequest,
                                                "response" | "platform_response" => crate::views::ledger::EventType::PlatformResponse,
                                                _ => crate::views::ledger::EventType::StateSnapshot,
                                            }
                                        } else {
                                            crate::views::ledger::EventType::StateSnapshot
                                        };

                                        let tier_id = json
                                            .get("tier_id")
                                            .or_else(|| json.get("tier"))
                                            .and_then(|v| v.as_str())
                                            .map(|s| s.to_string());

                                        // Format the data as a readable string
                                        let data = if let Some(platform) =
                                            json.get("platform").and_then(|v| v.as_str())
                                        {
                                            let tokens_in = json
                                                .get("tokens_in")
                                                .or_else(|| json.get("input_tokens"))
                                                .and_then(|v| v.as_u64())
                                                .unwrap_or(0);
                                            let tokens_out = json
                                                .get("tokens_out")
                                                .or_else(|| json.get("output_tokens"))
                                                .and_then(|v| v.as_u64())
                                                .unwrap_or(0);
                                            let cost = json
                                                .get("cost")
                                                .and_then(|v| v.as_f64())
                                                .unwrap_or(0.0);

                                            format!(
                                                "Platform: {}, Input: {} tokens, Output: {} tokens, Cost: ${:.4}",
                                                platform, tokens_in, tokens_out, cost
                                            )
                                        } else {
                                            // Fallback to pretty JSON if we can't parse specific fields
                                            serde_json::to_string_pretty(&json)
                                                .unwrap_or_else(|_| line.to_string())
                                        };

                                        entries.push(LedgerEntry {
                                            id: entry_id,
                                            timestamp,
                                            event_type,
                                            tier_id,
                                            data,
                                        });

                                        entry_id += 1;
                                    }
                                    Err(e) => {
                                        log::warn!(
                                            "Failed to parse ledger line {}: {} - {}",
                                            line_no + 1,
                                            e,
                                            line
                                        );
                                    }
                                }
                            }

                            self.ledger_entries = entries;
                            self.add_toast(
                                ToastType::Success,
                                format!("Ledger refreshed: {} entries", self.ledger_entries.len()),
                            );
                        }
                        Err(e) => {
                            let friendly_msg = if e
                                .to_string()
                                .contains("No such file or directory")
                                || e.to_string().contains("cannot find the path")
                            {
                                "Ledger file not found. Run an orchestration to start tracking usage.".to_string()
                            } else if e.to_string().contains("Permission denied") {
                                "Permission denied. Please check read permissions for the ledger file.".to_string()
                            } else {
                                format!("Failed to read usage ledger. {}", e)
                            };
                            self.add_toast(ToastType::Error, friendly_msg);
                        }
                    }
                } else {
                    // No ledger file found - clear entries and show info
                    self.ledger_entries.clear();
                    self.add_toast(
                        ToastType::Info,
                        "No usage data yet - run an orchestration to see usage".to_string(),
                    );
                }

                Task::none()
            }

            Message::LedgerExport => {
                // Export ledger to JSON file
                Task::perform(
                    async {
                        rfd::AsyncFileDialog::new()
                            .set_title("Export Ledger")
                            .set_file_name("ledger-export.json")
                            .add_filter("JSON", &["json"])
                            .save_file()
                            .await
                    },
                    |file_handle_opt| {
                        if let Some(file_handle) = file_handle_opt {
                            let path = file_handle.path().to_path_buf();
                            Message::AddToast(
                                ToastType::Info,
                                format!("Exporting to {}", path.display()),
                            )
                        } else {
                            Message::None
                        }
                    },
                )
            }

            Message::LedgerClear => {
                // Show confirmation modal
                self.show_modal = Some(ModalContent::Confirm {
                    title: "Clear Ledger".to_string(),
                    message: "Are you sure you want to clear all ledger entries? This action cannot be undone.".to_string(),
                    on_confirm: Box::new(Message::AddToast(ToastType::Success, "Ledger cleared".to_string())),
                });
                Task::none()
            }

            Message::LedgerToggleEvent(index) => {
                if self.ledger_expanded_events.contains(&index) {
                    self.ledger_expanded_events.remove(&index);
                    self.ledger_expanded_contents.remove(&index);
                } else {
                    self.ledger_expanded_events.insert(index);
                    // Create text_editor::Content for the event data
                    if let Some(entry) = self.ledger_entries.get(index) {
                        // Pretty-print JSON data
                        let formatted_data =
                            if entry.data.starts_with('{') || entry.data.starts_with('[') {
                                // Attempt to format as JSON
                                serde_json::from_str::<serde_json::Value>(&entry.data)
                                    .and_then(|v| serde_json::to_string_pretty(&v))
                                    .unwrap_or_else(|_| entry.data.clone())
                            } else {
                                entry.data.clone()
                            };
                        self.ledger_expanded_contents
                            .insert(index, text_editor::Content::with_text(&formatted_data));
                    }
                }
                Task::none()
            }

            // ================================================================
            // Config / Login / Doctor / Setup refresh
            // ================================================================
            Message::LoadConfig => self.update(Message::ReloadConfig),

            Message::LoadLogin => {
                self.current_page = Page::Login;

                // Load both auth status and git info
                let load_auth = Task::perform(
                    async {
                        let checker = crate::platforms::AuthStatusChecker::new();
                        let mut map: HashMap<String, AuthStatus> = HashMap::new();
                        for platform in crate::types::Platform::all() {
                            let result = checker.check_platform(*platform).await;
                            let name = format!("{:?}", platform);
                            map.insert(
                                name.clone(),
                                AuthStatus {
                                    platform: name,
                                    authenticated: result.authenticated,
                                    method: if result.message.contains("environment variable") {
                                        crate::views::login::AuthMethod::EnvVar
                                    } else {
                                        crate::views::login::AuthMethod::CliLogin
                                    },
                                    hint: result.message.clone(),
                                },
                            );
                        }
                        let gh = checker.check_github().await;
                        map.insert(
                            "GitHub".to_string(),
                            AuthStatus {
                                platform: "GitHub".to_string(),
                                authenticated: gh.authenticated,
                                method: crate::views::login::AuthMethod::CliLogin,
                                hint: gh.message.clone(),
                            },
                        );
                        map
                    },
                    Message::AuthStatusReceived,
                );

                let load_git = Task::perform(
                    async { load_git_info().await },
                    Message::GitInfoForLoginLoaded,
                );

                Task::batch(vec![load_auth, load_git])
            }

            Message::AuthStatusReceived(map) => {
                self.platform_auth_status = map;

                // Update GitHub auth status from the map
                if let Some(github_status) = self.platform_auth_status.get("GitHub") {
                    self.github_auth_status = if github_status.authenticated {
                        Some("authenticated".to_string())
                    } else {
                        Some("not_authenticated".to_string())
                    };
                }

                // Populate CLI content for login view
                let cli_text = default_login_cli_text();
                self.login_cli_content = text_editor::Content::with_text(&cli_text);

                Task::none()
            }

            Message::CopyToClipboard(text) => {
                if text.trim().is_empty() {
                    return Task::none();
                }

                self.add_toast(ToastType::Success, "Copied to clipboard".to_string());
                iced::clipboard::write::<Message>(text)
            }

            Message::PlatformLogin(target) => {
                self.login_in_progress.insert(target, AuthActionKind::Login);
                let target_copy = target;
                Task::perform(
                    async move {
                        crate::platforms::spawn_login(target_copy)
                            .await
                            .map_err(|e| e.to_string())
                    },
                    move |res| Message::PlatformLoginComplete(target_copy, res),
                )
            }

            Message::PlatformLoginComplete(target, res) => {
                self.login_in_progress.remove(&target);
                match &res {
                    Ok(()) => self.add_toast(
                        ToastType::Success,
                        format!("{} login completed", target.display_name()),
                    ),
                    Err(e) => self.add_toast(
                        ToastType::Error,
                        format!("{} login failed: {}", target.display_name(), e),
                    ),
                }
                Task::perform(
                    async {
                        let checker = crate::platforms::AuthStatusChecker::new();
                        let mut map: HashMap<String, AuthStatus> = HashMap::new();
                        for platform in crate::types::Platform::all() {
                            let result = checker.check_platform(*platform).await;
                            let name = format!("{:?}", platform);
                            map.insert(
                                name.clone(),
                                AuthStatus {
                                    platform: name,
                                    authenticated: result.authenticated,
                                    method: if result.message.contains("environment variable") {
                                        crate::views::login::AuthMethod::EnvVar
                                    } else {
                                        crate::views::login::AuthMethod::CliLogin
                                    },
                                    hint: result.message.clone(),
                                },
                            );
                        }
                        let gh = checker.check_github().await;
                        map.insert(
                            "GitHub".to_string(),
                            AuthStatus {
                                platform: "GitHub".to_string(),
                                authenticated: gh.authenticated,
                                method: crate::views::login::AuthMethod::CliLogin,
                                hint: gh.message.clone(),
                            },
                        );
                        map
                    },
                    Message::AuthStatusReceived,
                )
            }

            Message::PlatformLogout(target) => {
                self.login_in_progress
                    .insert(target, AuthActionKind::Logout);
                let target_copy = target;
                Task::perform(
                    async move {
                        crate::platforms::spawn_logout(target_copy)
                            .await
                            .map_err(|e| e.to_string())
                    },
                    move |res| Message::PlatformLogoutComplete(target_copy, res),
                )
            }

            Message::PlatformLogoutComplete(target, res) => {
                self.login_in_progress.remove(&target);
                match &res {
                    Ok(()) => self.add_toast(
                        ToastType::Success,
                        format!("{} logout completed", target.display_name()),
                    ),
                    Err(e) => self.add_toast(
                        ToastType::Error,
                        format!("{} logout failed: {}", target.display_name(), e),
                    ),
                }
                Task::perform(
                    async {
                        let checker = crate::platforms::AuthStatusChecker::new();
                        let mut map: HashMap<String, AuthStatus> = HashMap::new();
                        for platform in crate::types::Platform::all() {
                            let result = checker.check_platform(*platform).await;
                            let name = format!("{:?}", platform);
                            map.insert(
                                name.clone(),
                                AuthStatus {
                                    platform: name,
                                    authenticated: result.authenticated,
                                    method: if result.message.contains("environment variable") {
                                        crate::views::login::AuthMethod::EnvVar
                                    } else {
                                        crate::views::login::AuthMethod::CliLogin
                                    },
                                    hint: result.message.clone(),
                                },
                            );
                        }
                        let gh = checker.check_github().await;
                        map.insert(
                            "GitHub".to_string(),
                            AuthStatus {
                                platform: "GitHub".to_string(),
                                authenticated: gh.authenticated,
                                method: crate::views::login::AuthMethod::CliLogin,
                                hint: gh.message.clone(),
                            },
                        );
                        map
                    },
                    Message::AuthStatusReceived,
                )
            }

            Message::RefreshAuthStatus => Task::perform(
                async {
                    let checker = crate::platforms::AuthStatusChecker::new();
                    let mut map: HashMap<String, AuthStatus> = HashMap::new();
                    for platform in crate::types::Platform::all() {
                        let result = checker.check_platform(*platform).await;
                        let name = format!("{:?}", platform);
                        map.insert(
                            name.clone(),
                            AuthStatus {
                                platform: name,
                                authenticated: result.authenticated,
                                method: if result.message.contains("environment variable") {
                                    crate::views::login::AuthMethod::EnvVar
                                } else {
                                    crate::views::login::AuthMethod::CliLogin
                                },
                                hint: result.message.clone(),
                            },
                        );
                    }
                    let gh = checker.check_github().await;
                    map.insert(
                        "GitHub".to_string(),
                        AuthStatus {
                            platform: "GitHub".to_string(),
                            authenticated: gh.authenticated,
                            method: crate::views::login::AuthMethod::CliLogin,
                            hint: gh.message.clone(),
                        },
                    );
                    map
                },
                Message::AuthStatusReceived,
            ),

            Message::LoadGitInfoForLogin => Task::perform(
                async { load_git_info().await },
                Message::GitInfoForLoginLoaded,
            ),

            Message::GitInfoForLoginLoaded(git_info) => {
                let has_git_info = git_info.is_some();
                self.git_info = git_info;

                // Also check GitHub auth status
                if has_git_info {
                    Task::perform(
                        async {
                            let checker = crate::platforms::AuthStatusChecker::new();
                            let gh = checker.check_github().await;
                            if gh.authenticated {
                                Some("authenticated".to_string())
                            } else {
                                Some("not_authenticated".to_string())
                            }
                        },
                        |_status| Message::RefreshAuthStatus,
                    )
                } else {
                    self.github_auth_status = None;
                    Task::none()
                }
            }

            Message::SetupInstall(platform) => {
                self.setup_installing = Some(platform);
                let platform_copy = platform;
                Task::perform(
                    async move {
                        let manager = crate::doctor::InstallationManager::new();
                        match manager.execute_install(platform_copy) {
                            Ok(r) => {
                                if r.success {
                                    Ok(())
                                } else {
                                    Err(r.message)
                                }
                            }
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
                    Err(e) => self.add_toast(
                        ToastType::Error,
                        format!("{} install failed: {}", platform, e),
                    ),
                }
                self.update(Message::SetupRunDetection)
            }

            Message::RefreshDoctor => self.update(Message::RunAllChecks),

            Message::RefreshSetup => self.update(Message::SetupRunDetection),

            // ================================================================
            // Metrics
            // ================================================================
            Message::RefreshMetrics => {
                self.metrics = self.metrics_collector.snapshot();
                self.add_toast(ToastType::Success, "Metrics refreshed".to_string());
                Task::none()
            }

            // ================================================================
            // Coverage
            // ================================================================
            Message::CoverageFilterChanged(phase) => {
                self.coverage_phase_filter = phase;
                Task::none()
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
            Message::Tick(now) => {
                // Calculate delta time
                let delta = if let Some(last_tick) = self.last_tick_time {
                    let duration = now.signed_duration_since(last_tick);
                    duration.num_milliseconds() as f32 / 1000.0
                } else {
                    0.016 // Default to ~60fps
                };
                self.last_tick_time = Some(now);

                // Update animation time (loops every ~1000 seconds)
                self.animation_time = (self.animation_time + delta) % 1000.0;

                // Update page transition
                if self.page_transition.update(delta) {
                    // Transition complete
                    self.previous_page = None;
                }

                // Clean up expired toasts (older than 5 seconds)
                self.toasts.retain(|t| !t.is_expired());
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

            Message::WindowResized(width, height) => {
                self.window_width = width;
                self.window_height = height;
                // Clear canvas caches when window resizes
                self.retro_overlay.clear_cache();
                Task::none()
            }

            // ================================================================
            // Interview
            // ================================================================
            Message::StartInterview => {
                self.interview_active = true;
                self.interview_paused = false;
                self.interview_current_phase = "scope_goals".to_string();
                self.interview_current_question = String::new();
                self.interview_answers.clear();
                self.interview_phases_complete.clear();
                self.current_page = Page::Interview;
                Task::none()
            }
            Message::NavigateToInterview => {
                self.previous_page = Some(self.current_page);
                self.page_transition = crate::widgets::TransitionState::start();
                self.current_page = Page::Interview;
                Task::none()
            }
            Message::InterviewQuestionReceived(question) => {
                self.interview_current_question = question;
                Task::none()
            }
            Message::InterviewAnswerSubmitted(answer) => {
                self.interview_answers.push(answer);
                self.interview_current_question = String::new();
                Task::none()
            }
            Message::InterviewPhaseComplete(phase) => {
                self.interview_phases_complete.push(phase);
                Task::none()
            }
            Message::InterviewComplete => {
                self.interview_active = false;
                Task::none()
            }
            Message::InterviewPaused => {
                self.interview_paused = true;
                Task::none()
            }
            Message::InterviewResumed => {
                self.interview_paused = false;
                Task::none()
            }
            Message::InterviewAnswerInputChanged(text) => {
                self.interview_answer_input = text;
                Task::none()
            }
            Message::InterviewSubmitAnswer => {
                if !self.interview_answer_input.trim().is_empty() {
                    let answer = self.interview_answer_input.clone();
                    self.interview_answers.push(answer.clone());
                    self.interview_answer_input.clear();

                    // Simulate receiving next question (in real implementation, this would
                    // be sent to the interview orchestrator backend)
                    self.interview_current_question = format!(
                        "Follow-up question based on: '{}'",
                        answer.chars().take(30).collect::<String>()
                    );

                    self.add_toast(ToastType::Success, "Answer submitted".to_string());
                }
                Task::none()
            }
            Message::InterviewTogglePause => {
                self.interview_paused = !self.interview_paused;
                Task::none()
            }
            Message::InterviewEnd => {
                self.interview_active = false;
                self.interview_paused = false;
                self.interview_answer_input.clear();
                self.add_toast(ToastType::Info, "Interview session ended".to_string());
                Task::none()
            }

            // ================================================================
            // Interview Config UI
            // ================================================================
            Message::ConfigInterviewFieldChanged(field, value) => {
                match field.as_str() {
                    "platform" => self.gui_config.interview.platform = value,
                    "model" => self.gui_config.interview.model = value,
                    "output_dir" => self.gui_config.interview.output_dir = value,
                    "reasoning_level" => self.gui_config.interview.reasoning_level = value,
                    "interaction_mode" => self.gui_config.interview.interaction_mode = value,
                    "max_questions_per_phase" => {
                        if let Ok(v) = value.parse::<u32>() {
                            self.gui_config.interview.max_questions_per_phase = v.clamp(3, 15);
                        }
                    }
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }
            Message::ConfigInterviewToggled(field) => {
                match field.as_str() {
                    "first_principles" => {
                        self.gui_config.interview.first_principles =
                            !self.gui_config.interview.first_principles;
                    }
                    "require_architecture_confirmation" => {
                        self.gui_config.interview.require_architecture_confirmation =
                            !self.gui_config.interview.require_architecture_confirmation;
                    }
                    "generate_playwright_requirements" => {
                        self.gui_config.interview.generate_playwright_requirements =
                            !self.gui_config.interview.generate_playwright_requirements;
                    }
                    "generate_initial_agents_md" => {
                        self.gui_config.interview.generate_initial_agents_md =
                            !self.gui_config.interview.generate_initial_agents_md;
                    }
                    _ => {}
                }
                self.config_is_dirty = true;
                Task::none()
            }
            Message::ConfigInterviewBackupChanged(idx, field, value) => {
                if let Some(entry) = self.gui_config.interview.backup_platforms.get_mut(idx) {
                    match field.as_str() {
                        "platform" => entry.platform = value,
                        "model" => entry.model = value,
                        _ => {}
                    }
                }
                self.config_is_dirty = true;
                Task::none()
            }
            Message::ConfigInterviewAddBackup => {
                self.gui_config.interview.backup_platforms.push(
                    crate::config::gui_config::BackupPlatformEntry {
                        platform: "cursor".to_string(),
                        model: String::new(),
                    },
                );
                self.config_is_dirty = true;
                Task::none()
            }
            Message::ConfigInterviewRemoveBackup(idx) => {
                if idx < self.gui_config.interview.backup_platforms.len() {
                    self.gui_config.interview.backup_platforms.remove(idx);
                }
                self.config_is_dirty = true;
                Task::none()
            }

            // ================================================================
            // No-op
            // ================================================================
            Message::None => Task::none(),
        }
    }

    /// Render the application UI
    pub fn view(&self) -> Element<'_, Message> {
        use crate::theme::tokens;
        use crate::views;
        use crate::widgets::LayoutSize;
        use iced::widget::{column, container, stack, Responsive};
        use iced::Length;

        // Wrap in Responsive widget to get available size
        Responsive::new(move |size| {
            let layout_size = LayoutSize::from_iced(size);

            // Build main content based on current page
            let content: Element<Message> = match self.current_page {
                Page::Dashboard => views::dashboard::view(
                    &self.orchestrator_status,
                    &self.current_item,
                    &self.progress,
                    &self.output_lines,
                    &self.terminal_editor_content,
                    &self.budgets,
                    &self.last_error,
                    &self.start_time,
                    &self.current_project,
                    &None::<crate::widgets::InterviewPanelData>, // TODO: Build interview data from state if needed
                    &self.theme,
                    layout_size,
                ),
                Page::Projects => views::projects::view(
                    &self.projects,
                    &self.current_project,
                    &self.new_project_name,
                    &self.new_project_path,
                    self.show_new_project_form,
                    &self.theme,
                    layout_size,
                ),
                Page::Wizard => {
                    // Clamp wizard step to valid range (0-8)
                    let wizard_step = self.wizard_step.min(8);
                    views::wizard::view(
                        wizard_step,
                        // Step 0 params
                        self.wizard_is_new_project,
                        self.wizard_has_github_repo,
                        &self.wizard_github_url,
                        self.wizard_create_github_repo,
                        &self.wizard_github_visibility,
                        &self.wizard_github_description,
                        // Step 0.5 params
                        self.wizard_use_interview,
                        &self.wizard_interaction_mode,
                        &self.wizard_reasoning_level,
                        self.wizard_generate_agents_md,
                        // Original params
                        &self.wizard_project_name,
                        &self.wizard_project_path,
                        &self.wizard_requirements_text,
                        &self.wizard_prd_platform,
                        &self.wizard_prd_model,
                        &self.wizard_prd_editor_content,
                        &self.wizard_prd_text,
                        &self.wizard_tier_configs,
                        &self.wizard_plan_text,
                        self.wizard_generating,
                        &self.wizard_models,
                        &self.wizard_requirements_preview_content,
                        &self.wizard_plan_content,
                        &self.theme,
                        layout_size,
                    )
                }
                Page::Config => views::config::view(
                    &self.gui_config,
                    &self.config_text,
                    &self.config_editor_content,
                    self.config_valid,
                    &self.config_error,
                    self.config_active_tab,
                    self.config_is_dirty,
                    &self.config_models,
                    &self.config_git_info,
                    &self.theme,
                    layout_size,
                ),
                Page::Doctor => views::doctor::view(
                    &self.doctor_results,
                    self.doctor_running,
                    &self.doctor_fixing,
                    self.doctor_platform_selector_visible,
                    &self.doctor_selected_platforms,
                    &self.doctor_expanded_checks,
                    &self.doctor_detail_contents,
                    &self.theme,
                    layout_size,
                ),
                Page::Tiers => views::tiers::view(
                    &self.tier_tree,
                    &self.selected_tier,
                    &self.selected_tier_details,
                    &self.tier_details_content,
                    &self.theme,
                    layout_size,
                ),
                Page::Evidence => views::evidence::view(
                    &self.evidence_items,
                    &self.evidence_filter,
                    &self._empty_string_vec,
                    self.evidence_selected_item,
                    &self.evidence_preview_content,
                    &self.theme,
                    layout_size,
                ),
                Page::Metrics => views::metrics::view(&self.metrics, &self.theme, layout_size),
                Page::History => views::history::view(
                    &self.history_display_sessions,
                    self.history_page,
                    self.history_total_pages,
                    self.history_filter,
                    &self.history_search,
                    &self.theme,
                    layout_size,
                ),
                Page::Coverage => views::coverage::view(
                    self.coverage_overall,
                    &self.coverage_categories,
                    &self.coverage_requirements,
                    &self.coverage_phase_filter,
                    &self.theme,
                    layout_size,
                ),
                Page::Memory => views::memory::view(
                    &self.memory_content,
                    &self.memory_content_string,
                    &self.memory_section,
                    &self.theme,
                    layout_size,
                ),
                Page::Ledger => views::ledger::view(
                    &self.ledger_entries,
                    &self.ledger_filter,
                    &self._empty_string_vec,
                    &self.ledger_expanded_events,
                    &self.ledger_expanded_contents,
                    &self.ledger_filter_tier,
                    &self.ledger_filter_session,
                    &self.theme,
                    layout_size,
                ),
                Page::Login => views::login::view(
                    &self.platform_auth_status,
                    &self.login_in_progress,
                    &self.login_messages,
                    &self.login_auth_urls,
                    &self.git_info,
                    &self.github_auth_status,
                    &self.login_cli_content,
                    &self.theme,
                    layout_size,
                ),
                Page::Settings => {
                    // Convert log level string to enum
                    let log_level = match self.settings_log_level.as_str() {
                        "error" => views::settings::LogLevel::Error,
                        "warn" => views::settings::LogLevel::Warn,
                        "debug" => views::settings::LogLevel::Debug,
                        "trace" => views::settings::LogLevel::Trace,
                        _ => views::settings::LogLevel::Info,
                    };
                    let auto_scroll = if self.settings_auto_scroll {
                        views::settings::AutoScroll::Enabled
                    } else {
                        views::settings::AutoScroll::Disabled
                    };
                    views::settings::view(
                        &self.theme,
                        log_level,
                        auto_scroll,
                        self.settings_show_timestamps,
                        self.minimize_to_tray,
                        self.settings_retention_days,
                        self.settings_intensive_logging,
                        layout_size,
                    )
                }
                Page::Setup => views::setup::view(
                    &self.setup_platform_statuses,
                    self.setup_is_checking,
                    self.setup_installing,
                    &self.login_in_progress,
                    &self.theme,
                    layout_size,
                ),
                Page::Interview => views::interview::view(
                    self.interview_active,
                    self.interview_paused,
                    &self.interview_current_phase,
                    &self.interview_current_question,
                    &self.interview_answers,
                    &self.interview_phases_complete,
                    &self.interview_answer_input,
                    &self.theme,
                    layout_size,
                ),
            };

            // Build the full layout (header + content constrained to same width as content boxes)
            // Use effective max width: full width on small screens, max 1200px on large screens
            let effective_max_width = layout_size.width.min(tokens::layout::MAX_CONTENT_WIDTH);
            let main_layout = column![self.render_header(), content].spacing(0);
            let constrained = container(main_layout)
                .width(Length::Shrink)
                .height(Length::Fill)
                .max_width(effective_max_width);

            // Wrap in full-size container for overlays (center the constrained content horizontally)
            let base = container(constrained)
                .width(iced::Length::Fill)
                .height(iced::Length::Fill)
                .align_x(iced::Alignment::Center);

            // Layer with retro overlay effects (pixel grid and scanlines)
            let with_overlay = stack![
                base,
                crate::widgets::pixel_grid_overlay(self.retro_overlay.pixel_grid()),
                crate::widgets::scanline_overlay(self.retro_overlay.scanlines()),
            ];

            // Add toasts overlay
            let with_toasts = self.render_toasts_overlay(with_overlay.into());

            // Add modal overlay if present
            if let Some(ref modal) = self.show_modal {
                self.render_modal_overlay(with_toasts, modal)
            } else {
                with_toasts
            }
        })
        .width(Length::Fill)
        .height(Length::Fill)
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

        // Timer tick - faster during transitions for smooth animations
        let tick_duration = if self.page_transition.active {
            std::time::Duration::from_millis(16) // ~60fps during transitions
        } else {
            std::time::Duration::from_secs(1) // 1fps otherwise
        };
        subscriptions.push(time::every(tick_duration).map(|_| Message::Tick(Utc::now())));

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

        // Window events (close and resize)
        subscriptions.push(iced::event::listen_with(|event, _status, id| match event {
            iced::Event::Window(window::Event::CloseRequested) => {
                Some(Message::WindowCloseRequested(id))
            }
            iced::Event::Window(window::Event::Resized(size)) => {
                Some(Message::WindowResized(size.width, size.height))
            }
            _ => None,
        }));

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
            PuppetMasterEvent::IterationStart {
                item_id,
                platform,
                model,
                reasoning_effort,
                session_id,
                timestamp,
                ..
            } => {
                self.history_active_by_item
                    .entry(item_id.clone())
                    .or_default()
                    .push(session_id.clone());

                if let Some(existing) = self
                    .history_sessions
                    .iter_mut()
                    .find(|s| s.id == *session_id)
                {
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
            PuppetMasterEvent::IterationComplete {
                item_id,
                success,
                timestamp,
                ..
            } => {
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
            PuppetMasterEvent::Progress {
                phase_progress,
                task_progress,
                subtask_progress,
                overall_progress,
                ..
            } => {
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
            PuppetMasterEvent::Output {
                line,
                source: _,
                line_type: _,
                timestamp,
            } => {
                self.output_lines.push(OutputLine {
                    timestamp: *timestamp,
                    line_type: OutputType::Stdout,
                    text: line.clone(),
                });
                // Keep only last 1000 lines
                if self.output_lines.len() > 1000 {
                    self.output_lines.remove(0);
                }
                // Sync terminal content for text selection
                self.sync_terminal_content();
            }
            PuppetMasterEvent::Error { message, .. } => {
                self.last_error = Some(message.clone());
                self.add_toast(ToastType::Error, message.clone());
            }
            PuppetMasterEvent::StartChainStep {
                step,
                total,
                description,
                ..
            } => {
                // Show progress for wizard PRD generation
                self.add_toast(
                    ToastType::Info,
                    format!("Step {}/{}: {}", step, total, description),
                );
            }
            PuppetMasterEvent::StartChainComplete {
                success, message, ..
            } => {
                if *success {
                    self.add_toast(
                        ToastType::Success,
                        message
                            .clone()
                            .unwrap_or_else(|| "PRD generation completed".to_string()),
                    );
                } else {
                    self.add_toast(
                        ToastType::Error,
                        message
                            .clone()
                            .unwrap_or_else(|| "PRD generation failed".to_string()),
                    );
                }
            }
            PuppetMasterEvent::Custom {
                event_type, data, ..
            } => {
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

    /// Sync terminal output lines to text_editor::Content for selection support
    fn sync_terminal_content(&mut self) {
        let terminal_text = self
            .output_lines
            .iter()
            .map(|line| {
                let timestamp = line.timestamp.format("%H:%M:%S");
                let prefix = match line.line_type {
                    OutputType::Stdout => "[stdout]",
                    OutputType::Stderr => "[stderr]",
                    OutputType::Info => "[system]",
                };
                format!("> {} {} {}", timestamp, prefix, line.text)
            })
            .collect::<Vec<_>>()
            .join("\n");

        if self.terminal_editor_content.text() == terminal_text {
            return;
        }

        // Preserve active selection so users can copy while output continues streaming.
        if self.terminal_editor_content.selection().is_some() {
            return;
        }

        if self
            .terminal_interaction_until
            .is_some_and(|deadline| std::time::Instant::now() < deadline)
        {
            return;
        }

        let previous_cursor = self.terminal_editor_content.cursor();
        self.terminal_editor_content = text_editor::Content::with_text(&terminal_text);
        self.terminal_editor_content.move_to(previous_cursor);
    }

    /// Compute coverage data from PRD and evidence
    fn compute_coverage(&mut self) {
        use crate::views::coverage::{CategoryCoverage, RequirementCoverage};

        // Get project path
        let base = self
            .current_project
            .as_ref()
            .map(|p| p.path.clone())
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

        let prd_path = base.join(".puppet-master").join("prd.json");
        let evidence_dir = base
            .join(".puppet-master")
            .join("evidence")
            .join("gate-reports");

        // Try to load PRD
        if !prd_path.exists() {
            self.coverage_requirements.clear();
            self.coverage_categories.clear();
            self.coverage_overall = 0.0;
            return;
        }

        let Ok(content) = std::fs::read_to_string(&prd_path) else {
            return;
        };

        let Ok(prd) = serde_json::from_str::<crate::types::PRD>(&content) else {
            return;
        };

        // Load gate reports to check verification status
        let mut gate_reports = std::collections::HashMap::new();
        if evidence_dir.exists() && evidence_dir.is_dir() {
            if let Ok(entries) = std::fs::read_dir(&evidence_dir) {
                for entry in entries.flatten() {
                    if let Ok(gate_content) = std::fs::read_to_string(entry.path()) {
                        // Extract tier ID from filename
                        if let Some(filename) = entry.file_name().to_str() {
                            gate_reports.insert(filename.to_string(), gate_content);
                        }
                    }
                }
            }
        }

        // Build requirements list from PRD
        let mut requirements = Vec::new();
        let mut category_stats = std::collections::HashMap::new();

        for phase in &prd.phases {
            // Phase-level requirements
            let phase_covered = phase.status == crate::types::ItemStatus::Passed;
            let phase_evidence_count = phase.evidence.len();

            let phase_req = RequirementCoverage {
                id: phase.id.clone(),
                description: phase.title.clone(),
                covered: phase_covered,
                evidence_count: phase_evidence_count,
                tier_ids: vec![phase.id.clone()],
            };
            requirements.push(phase_req);

            // Update category stats
            let category = "Phase";
            let entry = category_stats.entry(category.to_string()).or_insert((0, 0));
            entry.0 += 1; // total
            if phase_covered {
                entry.1 += 1; // covered
            }

            // Task-level requirements
            for task in &phase.tasks {
                let task_covered = task.status == crate::types::ItemStatus::Passed;
                let task_evidence_count = task.evidence.len();

                let task_req = RequirementCoverage {
                    id: task.id.clone(),
                    description: task.title.clone(),
                    covered: task_covered,
                    evidence_count: task_evidence_count,
                    tier_ids: vec![phase.id.clone(), task.id.clone()],
                };
                requirements.push(task_req);

                // Update category stats
                let category = "Task";
                let entry = category_stats.entry(category.to_string()).or_insert((0, 0));
                entry.0 += 1;
                if task_covered {
                    entry.1 += 1;
                }

                // Subtask-level requirements
                for subtask in &task.subtasks {
                    let subtask_covered = subtask.status == crate::types::ItemStatus::Passed;
                    let subtask_evidence_count = subtask.evidence.len();

                    let subtask_req = RequirementCoverage {
                        id: subtask.id.clone(),
                        description: subtask.title.clone(),
                        covered: subtask_covered,
                        evidence_count: subtask_evidence_count,
                        tier_ids: vec![phase.id.clone(), task.id.clone(), subtask.id.clone()],
                    };
                    requirements.push(subtask_req);

                    // Update category stats
                    let category = "Subtask";
                    let entry = category_stats.entry(category.to_string()).or_insert((0, 0));
                    entry.0 += 1;
                    if subtask_covered {
                        entry.1 += 1;
                    }
                }
            }
        }

        // Build category coverage
        let mut categories = Vec::new();
        for (name, (total, covered)) in category_stats {
            let coverage = if total > 0 {
                covered as f32 / total as f32
            } else {
                0.0
            };
            categories.push(CategoryCoverage {
                name,
                coverage,
                test_count: total,
            });
        }

        // Compute overall coverage
        let total_requirements = requirements.len();
        let covered_requirements = requirements.iter().filter(|r| r.covered).count();
        let overall = if total_requirements > 0 {
            covered_requirements as f32 / total_requirements as f32
        } else {
            0.0
        };

        self.coverage_requirements = requirements;
        self.coverage_categories = categories;
        self.coverage_overall = overall;
    }

    /// Add a toast notification
    fn add_toast(&mut self, toast_type: ToastType, message: String) {
        let id = self.next_toast_id;
        self.next_toast_id += 1;

        self.toasts.push(Toast::new(id, toast_type, message));
    }

    /// Render the header bar
    fn render_header(&self) -> Element<'_, Message> {
        crate::widgets::header::simple_header(
            self.current_page,
            &self.theme,
            Message::NavigateTo,
            Message::ToggleTheme,
        )
    }

    /// Render toast notifications overlay
    fn render_toasts_overlay<'a>(&'a self, base: Element<'a, Message>) -> Element<'a, Message> {
        // Use the new toast_overlay function from the widgets module
        crate::widgets::toast_overlay(base, &self.toasts, |id| Message::DismissToast(id))
    }

    /// Render a single toast (no longer needed - handled by widget module)
    #[allow(dead_code)]
    fn render_toast<'a>(&self, toast: &'a Toast) -> Element<'a, Message> {
        use iced::widget::{button, container, row, text};

        let icon = match toast.toast_type {
            ToastType::Success => "OK",
            ToastType::Error => "ERR",
            ToastType::Warning => "WARN",
            ToastType::Info => "INFO",
        };

        let content = row![
            text(icon),
            text(&toast.message),
            button(text("X")).on_press(Message::DismissToast(toast.id)),
        ]
        .spacing(8)
        .padding(8);

        container(content).into()
    }

    /// Render modal overlay
    fn render_modal_overlay<'a>(
        &self,
        base: Element<'a, Message>,
        modal: &'a ModalContent,
    ) -> Element<'a, Message> {
        use crate::widgets::{modal_overlay, ModalData, ModalSize};

        match modal {
            ModalContent::Confirm {
                title,
                message,
                on_confirm,
            } => {
                let modal_data = ModalData {
                    title: title.clone(),
                    body: message.clone(),
                    size: ModalSize::Small,
                    confirm_label: Some("Confirm".to_string()),
                    cancel_label: Some("Cancel".to_string()),
                };

                modal_overlay(
                    base,
                    Some(modal_data),
                    &self.theme,
                    Message::CloseModal,
                    Some((**on_confirm).clone()),
                )
            }
            ModalContent::Error { title, details } => {
                let modal_data = ModalData {
                    title: title.clone(),
                    body: details.clone(),
                    size: ModalSize::Medium,
                    confirm_label: None,
                    cancel_label: Some("Close".to_string()),
                };

                modal_overlay(
                    base,
                    Some(modal_data),
                    &self.theme,
                    Message::CloseModal,
                    None,
                )
            }
        }
    }

    fn recompute_history_display(&mut self) {
        let filtered: Vec<_> = self
            .history_sessions
            .iter()
            .filter(|s| {
                if let Some(ref filter) = self.history_filter {
                    if s.status != *filter {
                        return false;
                    }
                }
                if !self.history_search.is_empty() {
                    let search_lower = self.history_search.to_lowercase();
                    let matches_id = s.id.to_lowercase().contains(&search_lower);
                    let matches_platform = s
                        .platform
                        .as_ref()
                        .map(|p| p.to_lowercase().contains(&search_lower))
                        .unwrap_or(false);
                    if !matches_id && !matches_platform {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        self.history_total_pages = if filtered.is_empty() {
            1
        } else {
            (filtered.len() + self.history_items_per_page - 1) / self.history_items_per_page
        };
        let start = (self.history_page * self.history_items_per_page).min(filtered.len());
        let end = (start + self.history_items_per_page).min(filtered.len());
        self.history_display_sessions = filtered[start..end].to_vec();
    }

    /// Load settings from disk on startup
    fn load_settings(&mut self) {
        let base = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let settings_file = base.join(".puppet-master").join("settings.json");

        if settings_file.exists() {
            if let Ok(content) = std::fs::read_to_string(&settings_file) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                    // Load settings from JSON
                    if let Some(log_level) = json.get("log_level").and_then(|v| v.as_str()) {
                        self.settings_log_level = log_level.to_string();
                    }
                    if let Some(auto_scroll) = json.get("auto_scroll").and_then(|v| v.as_bool()) {
                        self.settings_auto_scroll = auto_scroll;
                    }
                    if let Some(show_timestamps) =
                        json.get("show_timestamps").and_then(|v| v.as_bool())
                    {
                        self.settings_show_timestamps = show_timestamps;
                    }
                    if let Some(retention_days) =
                        json.get("retention_days").and_then(|v| v.as_u64())
                    {
                        self.settings_retention_days = retention_days as u32;
                    }
                    if let Some(intensive_logging) =
                        json.get("intensive_logging").and_then(|v| v.as_bool())
                    {
                        self.settings_intensive_logging = intensive_logging;
                    }
                    if let Some(minimize_to_tray) =
                        json.get("minimize_to_tray").and_then(|v| v.as_bool())
                    {
                        self.minimize_to_tray = minimize_to_tray;
                    }

                    log::info!("Settings loaded from disk");
                }
            }
        }
    }

    /// Load history from disk (sessions and logs)
    fn load_history_from_disk(&mut self) {
        let base = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let data_dir = base.join(".puppet-master");

        // Clear existing history
        self.history_sessions.clear();

        // Try to read from logs/sessions.jsonl (one session per line)
        let sessions_file = data_dir.join("logs").join("sessions.jsonl");
        if sessions_file.exists() {
            if let Ok(content) = std::fs::read_to_string(&sessions_file) {
                for line in content.lines() {
                    if line.trim().is_empty() {
                        continue;
                    }

                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                        // Parse session info from JSON
                        let id = json
                            .get("id")
                            .or_else(|| json.get("session_id"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string();

                        let start_time = json
                            .get("start_time")
                            .or_else(|| json.get("timestamp"))
                            .and_then(|v| v.as_str())
                            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
                            .map(|dt| dt.with_timezone(&chrono::Utc))
                            .unwrap_or_else(|| chrono::Utc::now());

                        let end_time = json
                            .get("end_time")
                            .and_then(|v| v.as_str())
                            .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
                            .map(|dt| dt.with_timezone(&chrono::Utc));

                        let status = json
                            .get("status")
                            .and_then(|v| v.as_str())
                            .map(|s| match s.to_lowercase().as_str() {
                                "running" => crate::views::history::SessionStatus::Running,
                                "completed" | "success" => {
                                    crate::views::history::SessionStatus::Completed
                                }
                                "failed" | "error" => crate::views::history::SessionStatus::Failed,
                                "cancelled" | "canceled" => {
                                    crate::views::history::SessionStatus::Cancelled
                                }
                                _ => crate::views::history::SessionStatus::Completed,
                            })
                            .unwrap_or(crate::views::history::SessionStatus::Completed);

                        let items_completed = json
                            .get("items_completed")
                            .or_else(|| json.get("completed"))
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0) as usize;

                        let items_total = json
                            .get("items_total")
                            .or_else(|| json.get("total"))
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0) as usize;

                        let platform = json
                            .get("platform")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());

                        let model = json
                            .get("model")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());

                        let reasoning_effort = json
                            .get("reasoning_effort")
                            .or_else(|| json.get("reasoning"))
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());

                        let phases = json
                            .get("phases")
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|v| v.as_str())
                                    .map(|s| s.to_string())
                                    .collect()
                            })
                            .unwrap_or_else(Vec::new);

                        self.history_sessions.push(SessionInfo {
                            id,
                            start_time,
                            end_time,
                            status,
                            items_completed,
                            items_total,
                            expanded: false,
                            phases,
                            platform,
                            model,
                            reasoning_effort,
                        });
                    }
                }
            }
        }

        // Sort sessions by start time (newest first)
        self.history_sessions
            .sort_by(|a, b| b.start_time.cmp(&a.start_time));

        // Recompute display after loading
        self.recompute_history_display();

        log::info!(
            "Loaded {} history sessions from disk",
            self.history_sessions.len()
        );
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
                            let res = crate::utils::process::kill_process(
                                pid,
                                crate::utils::process::Signal::Kill,
                            );
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
                            use crate::platforms::PlatformRegistry;
                            use crate::start_chain::{
                                RequirementsInput, StartChainParams, StartChainPipeline,
                            };

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
                                RequirementsInput::Text(requirements_text),
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
                                            let _ = event_tx.send(
                                                PuppetMasterEvent::StartChainComplete {
                                                    success: false,
                                                    message: Some(format!(
                                                        "Serialization failed: {}",
                                                        e
                                                    )),
                                                    timestamp: Utc::now(),
                                                },
                                            );
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
        OrchestratorEvent::StateChanged {
            old_state,
            new_state,
        } => Some(PuppetMasterEvent::StateChanged {
            from: old_state,
            to: new_state,
            timestamp: Utc::now(),
            reason: None,
        }),
        OrchestratorEvent::IterationStarted { tier_id, iteration } => {
            Some(PuppetMasterEvent::IterationStart {
                item_id: tier_id,
                platform: config.tiers.iteration.platform,
                model: config.tiers.iteration.model.clone(),
                reasoning_effort: config.tiers.iteration.reasoning_effort.clone(),
                attempt: iteration,
                session_id: "unknown".to_string(),
                timestamp: Utc::now(),
            })
        }
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
        OrchestratorEvent::Error(message) => {
            Some(PuppetMasterEvent::error(message, "orchestrator"))
        }
        _ => None,
    }
}
