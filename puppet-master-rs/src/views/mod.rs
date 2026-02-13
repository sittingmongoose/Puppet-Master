//! View modules for the Puppet Master GUI
//!
//! This module contains all view rendering logic, organized by page/feature.
//! Each view module exports a `view()` function that takes app state and returns
//! an Iced `Element<Message>`.

pub mod config;
pub mod coverage;
pub mod dashboard;
pub mod doctor;
pub mod evidence;
pub mod evidence_detail;
pub mod history;
pub mod interview;
pub mod ledger;
pub mod login;
pub mod memory;
pub mod metrics;
pub mod not_found;
pub mod projects;
pub mod settings;
pub mod setup;
pub mod tiers;
pub mod wizard;

// Re-export commonly used types from view modules
pub use coverage::RequirementCoverage;
pub use dashboard::{BudgetDisplayInfo, CurrentItem, OutputLine, OutputType, ProgressState};
pub use doctor::{CheckCategory, DoctorCheckResult};
pub use evidence::{EvidenceFilter, EvidenceItem, EvidenceItemType};
pub use history::{SessionInfo, SessionStatus};
pub use ledger::{EventType, LedgerEntry, LedgerFilter};
pub use login::{AuthMethod, AuthStatus};
pub use memory::MemorySection;
pub use projects::{ProjectInfo, ProjectStatus};
pub use settings::{AutoScroll, LogLevel};
pub use setup::PlatformStatus;
pub use tiers::{TierDetails, TierDisplayNode, TierNodeType};
