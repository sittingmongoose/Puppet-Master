//! State management modules
//!
//! This module provides state persistence, session tracking, and data management
//! for the RWM Puppet Master orchestrator.

pub mod agents_archive;
pub mod agents_gate_enforcer;
pub mod agents_manager;
pub mod agents_multi_level;
pub mod agents_promotion;
pub mod event_ledger;
pub mod evidence_store;
pub mod metrics_collector;
pub mod prd_manager;
pub mod progress_manager;
pub mod usage_tracker;

pub use agents_archive::{ArchiveEntry, ArchiveManager};
pub use agents_gate_enforcer::{EnforcementResult, GateEnforcer, Violation, ViolationSeverity};
pub use agents_manager::AgentsManager;
pub use agents_multi_level::{AgentEntry, MergedAgents, MultiLevelLoader};
pub use agents_promotion::{PromotionCandidate, PromotionConfig, PromotionEngine};
pub use event_ledger::{EventFilters, EventLedger, EventRecord};
pub use evidence_store::EvidenceStore;
pub use metrics_collector::{
    MetricsCollector, MetricsSnapshot, OverallMetrics, PlatformMetrics, SubtaskMetrics,
};
pub use prd_manager::PrdManager;
pub use progress_manager::ProgressManager;
pub use usage_tracker::UsageTracker;
