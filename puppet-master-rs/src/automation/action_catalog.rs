//! Stable automation action catalog.

use crate::app::{LoginTextSurface, Message};
use crate::platforms::AuthTarget;
use crate::widgets::Page;

// DRY:DATA:ActionDefinition
/// Declarative action definition used by CLI/MCP listing.
#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionDefinition {
    pub id: &'static str,
    pub description: &'static str,
}

// DRY:FN:list_actions
/// Return all stable action IDs exposed to automation.
pub fn list_actions() -> Vec<ActionDefinition> {
    vec![
        ActionDefinition {
            id: "nav.dashboard",
            description: "Navigate to Dashboard page",
        },
        ActionDefinition {
            id: "nav.projects",
            description: "Navigate to Projects page",
        },
        ActionDefinition {
            id: "nav.wizard",
            description: "Navigate to Wizard page",
        },
        ActionDefinition {
            id: "nav.config",
            description: "Navigate to Config page",
        },
        ActionDefinition {
            id: "nav.doctor",
            description: "Navigate to Doctor page",
        },
        ActionDefinition {
            id: "nav.tiers",
            description: "Navigate to Tiers page",
        },
        ActionDefinition {
            id: "nav.evidence",
            description: "Navigate to Evidence page",
        },
        ActionDefinition {
            id: "nav.metrics",
            description: "Navigate to Metrics page",
        },
        ActionDefinition {
            id: "nav.history",
            description: "Navigate to History page",
        },
        ActionDefinition {
            id: "nav.coverage",
            description: "Navigate to Coverage page",
        },
        ActionDefinition {
            id: "nav.memory",
            description: "Navigate to Memory page",
        },
        ActionDefinition {
            id: "nav.ledger",
            description: "Navigate to Ledger page",
        },
        ActionDefinition {
            id: "nav.login",
            description: "Navigate to Login page",
        },
        ActionDefinition {
            id: "nav.settings",
            description: "Navigate to Settings page",
        },
        ActionDefinition {
            id: "nav.setup",
            description: "Navigate to Setup page",
        },
        ActionDefinition {
            id: "nav.interview",
            description: "Navigate to Interview page",
        },
        ActionDefinition {
            id: "orchestrator.start",
            description: "Start orchestrator",
        },
        ActionDefinition {
            id: "orchestrator.pause",
            description: "Pause orchestrator",
        },
        ActionDefinition {
            id: "orchestrator.resume",
            description: "Resume orchestrator",
        },
        ActionDefinition {
            id: "orchestrator.stop",
            description: "Stop orchestrator",
        },
        ActionDefinition {
            id: "doctor.run_all",
            description: "Run all doctor checks",
        },
        ActionDefinition {
            id: "doctor.run.state_directory",
            description: "Run doctor state-directory check",
        },
        ActionDefinition {
            id: "doctor.run.platform_cli_compatibility",
            description: "Run doctor platform-cli-compatibility check",
        },
        ActionDefinition {
            id: "doctor.fix.state_directory",
            description: "Apply doctor fix for state-directory",
        },
        ActionDefinition {
            id: "doctor.fix.state_directory_dry_run",
            description: "Preview doctor fix for state-directory",
        },
        ActionDefinition {
            id: "doctor.fix.node_runtime",
            description: "Apply doctor fix for node-runtime",
        },
        ActionDefinition {
            id: "doctor.fix.playwright_browsers",
            description: "Apply doctor fix for playwright-browsers",
        },
        ActionDefinition {
            id: "doctor.fix.codex_sdk",
            description: "Apply doctor fix for codex-sdk",
        },
        ActionDefinition {
            id: "doctor.fix.copilot_sdk",
            description: "Apply doctor fix for copilot-sdk",
        },
        ActionDefinition {
            id: "setup.run_detection",
            description: "Run setup platform detection",
        },
        ActionDefinition {
            id: "setup.complete",
            description: "Complete setup and create marker",
        },
        ActionDefinition {
            id: "login.refresh",
            description: "Refresh login/auth status page state",
        },
        ActionDefinition {
            id: "login.context.summary",
            description: "Open login summary context menu",
        },
        ActionDefinition {
            id: "login.context.cursor",
            description: "Open Cursor login card context menu",
        },
        ActionDefinition {
            id: "login.context.codex",
            description: "Open Codex login card context menu",
        },
        ActionDefinition {
            id: "login.context.claude",
            description: "Open Claude login card context menu",
        },
        ActionDefinition {
            id: "login.context.gemini",
            description: "Open Gemini login card context menu",
        },
        ActionDefinition {
            id: "login.context.copilot",
            description: "Open Copilot login card context menu",
        },
        ActionDefinition {
            id: "login.context.github",
            description: "Open GitHub login card context menu",
        },
        ActionDefinition {
            id: "login.context.git",
            description: "Open Git configuration context menu",
        },
        ActionDefinition {
            id: "login.context.cli",
            description: "Open login CLI panel context menu",
        },
        ActionDefinition {
            id: "toast.context.latest",
            description: "Open context menu for latest toast",
        },
        ActionDefinition {
            id: "context.copy",
            description: "Trigger context menu copy action",
        },
        ActionDefinition {
            id: "context.paste",
            description: "Trigger context menu paste action",
        },
        ActionDefinition {
            id: "context.paste_mock",
            description: "Trigger context menu paste with mock clipboard value",
        },
        ActionDefinition {
            id: "context.select_all",
            description: "Trigger context menu select-all action",
        },
        ActionDefinition {
            id: "context.close",
            description: "Close the active context menu",
        },
        ActionDefinition {
            id: "wizard.next",
            description: "Advance wizard to next step",
        },
        ActionDefinition {
            id: "wizard.prev",
            description: "Move wizard to previous step",
        },
        ActionDefinition {
            id: "memory.refresh",
            description: "Refresh memory view",
        },
        ActionDefinition {
            id: "ledger.refresh",
            description: "Refresh ledger view",
        },
        ActionDefinition {
            id: "metrics.refresh",
            description: "Refresh metrics view",
        },
    ]
}

// DRY:FN:resolve_action
/// Resolve a stable action ID to a concrete app message.
pub fn resolve_action(action_id: &str) -> Option<Message> {
    Some(match action_id {
        "nav.dashboard" => Message::NavigateTo(Page::Dashboard),
        "nav.projects" => Message::NavigateTo(Page::Projects),
        "nav.wizard" => Message::NavigateTo(Page::Wizard),
        "nav.config" => Message::NavigateTo(Page::Config),
        "nav.doctor" => Message::NavigateTo(Page::Doctor),
        "nav.tiers" => Message::NavigateTo(Page::Tiers),
        "nav.evidence" => Message::NavigateTo(Page::Evidence),
        "nav.metrics" => Message::NavigateTo(Page::Metrics),
        "nav.history" => Message::NavigateTo(Page::History),
        "nav.coverage" => Message::NavigateTo(Page::Coverage),
        "nav.memory" => Message::NavigateTo(Page::Memory),
        "nav.ledger" => Message::NavigateTo(Page::Ledger),
        "nav.login" => Message::NavigateTo(Page::Login),
        "nav.settings" => Message::NavigateTo(Page::Settings),
        "nav.setup" => Message::NavigateTo(Page::Setup),
        "nav.interview" => Message::NavigateTo(Page::Interview),
        "orchestrator.start" => Message::StartOrchestrator,
        "orchestrator.pause" => Message::PauseOrchestrator,
        "orchestrator.resume" => Message::ResumeOrchestrator,
        "orchestrator.stop" => Message::StopOrchestrator,
        "doctor.run_all" => Message::RunAllChecks,
        "doctor.run.state_directory" => Message::RunCheck("state-directory".to_string()),
        "doctor.run.platform_cli_compatibility" => {
            Message::RunCheck("platform-cli-compatibility".to_string())
        }
        "doctor.fix.state_directory" => Message::FixCheck("state-directory".to_string(), false),
        "doctor.fix.state_directory_dry_run" => {
            Message::FixCheck("state-directory".to_string(), true)
        }
        "doctor.fix.node_runtime" => Message::FixCheck("node-runtime".to_string(), false),
        "doctor.fix.playwright_browsers" => {
            Message::FixCheck("playwright-browsers".to_string(), false)
        }
        "doctor.fix.codex_sdk" => Message::FixCheck("codex-sdk".to_string(), false),
        "doctor.fix.copilot_sdk" => Message::FixCheck("copilot-sdk".to_string(), false),
        "setup.run_detection" => Message::SetupRunDetection,
        "setup.complete" => Message::SetupComplete,
        "login.refresh" => Message::LoadLogin,
        "login.context.summary" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::Summary),
        ),
        "login.context.cursor" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::PlatformCard(
                AuthTarget::Platform(crate::types::Platform::Cursor),
            )),
        ),
        "login.context.codex" => {
            Message::OpenContextMenu(crate::app::ContextMenuTarget::LoginSurface(
                LoginTextSurface::PlatformCard(AuthTarget::Platform(crate::types::Platform::Codex)),
            ))
        }
        "login.context.claude" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::PlatformCard(
                AuthTarget::Platform(crate::types::Platform::Claude),
            )),
        ),
        "login.context.gemini" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::PlatformCard(
                AuthTarget::Platform(crate::types::Platform::Gemini),
            )),
        ),
        "login.context.copilot" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::PlatformCard(
                AuthTarget::Platform(crate::types::Platform::Copilot),
            )),
        ),
        "login.context.github" => {
            Message::OpenContextMenu(crate::app::ContextMenuTarget::LoginSurface(
                LoginTextSurface::PlatformCard(AuthTarget::GitHub),
            ))
        }
        "login.context.git" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::GitSection),
        ),
        "login.context.cli" => Message::OpenContextMenu(
            crate::app::ContextMenuTarget::LoginSurface(LoginTextSurface::CliPanel),
        ),
        "toast.context.latest" => Message::OpenLatestToastContextMenu,
        "context.copy" => Message::ContextMenuCopy,
        "context.paste" => Message::ContextMenuPaste,
        "context.paste_mock" => {
            Message::ContextMenuPasteLoaded(Some("automation-paste-value".to_string()))
        }
        "context.select_all" => Message::ContextMenuSelectAll,
        "context.close" => Message::CloseContextMenu,
        "wizard.next" => Message::WizardNextStep,
        "wizard.prev" => Message::WizardPrevStep,
        "memory.refresh" => Message::MemoryRefresh,
        "ledger.refresh" => Message::LedgerRefresh,
        "metrics.refresh" => Message::RefreshMetrics,
        _ => return None,
    })
}

// DRY:FN:resolve_from_text
/// Best-effort text lookup for selector-based targeting.
pub fn resolve_from_text(text: &str) -> Option<Message> {
    let key = text.trim().to_lowercase();
    match key.as_str() {
        "dashboard" => resolve_action("nav.dashboard"),
        "projects" => resolve_action("nav.projects"),
        "wizard" => resolve_action("nav.wizard"),
        "config" => resolve_action("nav.config"),
        "doctor" => resolve_action("nav.doctor"),
        "doctor run all" => resolve_action("doctor.run_all"),
        "setup run detection" => resolve_action("setup.run_detection"),
        "login summary context" => resolve_action("login.context.summary"),
        "login cli context" => resolve_action("login.context.cli"),
        "latest toast context" => resolve_action("toast.context.latest"),
        "tiers" => resolve_action("nav.tiers"),
        "evidence" => resolve_action("nav.evidence"),
        "metrics" => resolve_action("nav.metrics"),
        "history" => resolve_action("nav.history"),
        "coverage" => resolve_action("nav.coverage"),
        "memory" => resolve_action("nav.memory"),
        "ledger" => resolve_action("nav.ledger"),
        "login" => resolve_action("nav.login"),
        "settings" => resolve_action("nav.settings"),
        "setup" => resolve_action("nav.setup"),
        "interview" => resolve_action("nav.interview"),
        _ => None,
    }
}
