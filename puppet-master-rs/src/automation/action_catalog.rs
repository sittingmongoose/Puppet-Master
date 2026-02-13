//! Stable automation action catalog.

use crate::app::Message;
use crate::widgets::Page;

/// Declarative action definition used by CLI/MCP listing.
#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionDefinition {
    pub id: &'static str,
    pub description: &'static str,
}

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
        "wizard.next" => Message::WizardNextStep,
        "wizard.prev" => Message::WizardPrevStep,
        "memory.refresh" => Message::MemoryRefresh,
        "ledger.refresh" => Message::LedgerRefresh,
        "metrics.refresh" => Message::RefreshMetrics,
        _ => return None,
    })
}

/// Best-effort text lookup for selector-based targeting.
pub fn resolve_from_text(text: &str) -> Option<Message> {
    let key = text.trim().to_lowercase();
    match key.as_str() {
        "dashboard" => resolve_action("nav.dashboard"),
        "projects" => resolve_action("nav.projects"),
        "wizard" => resolve_action("nav.wizard"),
        "config" => resolve_action("nav.config"),
        "doctor" => resolve_action("nav.doctor"),
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
