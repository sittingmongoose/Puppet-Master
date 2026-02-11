//! State management modules
//!
//! This module provides state persistence, session tracking, and data management
//! for the RWM Puppet Master orchestrator.

pub mod agents_manager;
pub mod agents_archive;
pub mod agents_promotion;
pub mod agents_gate_enforcer;
pub mod agents_multi_level;
pub mod event_ledger;
pub mod evidence_store;
pub mod prd_manager;
pub mod progress_manager;
pub mod usage_tracker;
pub mod metrics_collector;

pub use agents_manager::AgentsManager;
pub use agents_archive::{ArchiveManager, ArchiveEntry};
pub use agents_promotion::{PromotionEngine, PromotionConfig, PromotionCandidate};
pub use agents_gate_enforcer::{GateEnforcer, EnforcementResult, Violation, ViolationSeverity};
pub use agents_multi_level::{MultiLevelLoader, MergedAgents, AgentEntry};
pub use event_ledger::{EventLedger, EventFilters, EventRecord};
pub use evidence_store::EvidenceStore;
pub use prd_manager::PrdManager;
pub use progress_manager::ProgressManager;
pub use usage_tracker::UsageTracker;
pub use metrics_collector::{MetricsCollector, MetricsSnapshot, OverallMetrics, PlatformMetrics, SubtaskMetrics};
