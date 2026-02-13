//! Projects module - Known projects management and persistence
//!
//! Provides storage and retrieval of known projects beyond naive filesystem scan.

pub mod persistence;

pub use persistence::{KnownProject, ProjectsPersistence};
