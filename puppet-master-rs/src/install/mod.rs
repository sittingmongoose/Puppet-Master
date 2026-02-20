//! App-local CLI installation module.
//!
//! This module provides the complete pipeline for installing CLI tools into the
//! Puppet Master application data directory so the app always knows the exact
//! binary path, regardless of the user's shell PATH configuration.
//!
//! # Entry Points
//!
//! Use [`install_coordinator`] functions for all installation tasks:
//!
//! ```rust,ignore
//! use puppet_master::install::install_coordinator;
//!
//! // Install Node.js system-wide
//! let outcome = install_coordinator::install_node().await;
//!
//! // Install GitHub CLI to app-local bin/
//! let outcome = install_coordinator::install_gh_cli().await;
//!
//! // Install a platform CLI (Gemini, Codex, Copilot, Claude, Cursor)
//! let outcome = install_coordinator::install_platform(Platform::Gemini).await;
//! ```

pub mod app_paths;
pub mod copilot_installer;
pub mod gemini_installer;
pub mod github_cli_installer;
pub mod install_coordinator;
pub mod node_installer;
pub mod npm_installer;
pub mod playwright_installer;
pub mod script_installer;

// Re-export the most commonly used types
pub use install_coordinator::InstallOutcome;
