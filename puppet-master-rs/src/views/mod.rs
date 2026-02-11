//! View modules for the Puppet Master GUI
//!
//! This module contains all view rendering logic, organized by page/feature.
//! Each view module exports a `view()` function that takes app state and returns
//! an Iced `Element<Message>`.

pub mod dashboard;
pub mod projects;
pub mod wizard;
pub mod config;
pub mod doctor;
pub mod tiers;
pub mod evidence;
pub mod evidence_detail;
pub mod metrics;
pub mod history;
pub mod coverage;
pub mod memory;
pub mod ledger;
pub mod login;
pub mod settings;
pub mod not_found;
pub mod setup;

// Re-export commonly used types from view modules
pub use dashboard::{CurrentItem, ProgressState, OutputLine, OutputType, BudgetDisplayInfo};
pub use projects::{ProjectInfo, ProjectStatus};
pub use doctor::{DoctorCheckResult, CheckCategory};
pub use tiers::{TierDisplayNode, TierNodeType, TierDetails};
pub use evidence::{EvidenceItem, EvidenceItemType, EvidenceFilter};
pub use history::{SessionInfo, SessionStatus};
pub use coverage::RequirementCoverage;
pub use memory::MemorySection;
pub use ledger::{LedgerEntry, EventType, LedgerFilter};
pub use login::{AuthStatus, AuthMethod};
pub use settings::{LogLevel, AutoScroll};
pub use setup::PlatformStatus;
