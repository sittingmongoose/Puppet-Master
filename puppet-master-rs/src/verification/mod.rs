//! Verification subsystem for Puppet Master
//!
//! This module provides verification capabilities including:
//! - Gate execution and reporting
//! - Multiple verifier types (command, file, regex, script, ai, browser)
//! - Evidence collection and storage
//! - Verifier registry for pluggable verification

mod ai_verifier;
mod browser_verifier;
mod command_verifier;
mod file_exists_verifier;
mod gate_runner;
mod iced_gui_verifier;
mod regex_verifier;
mod script_verifier;
mod verification_integration;
mod verifier;

pub use ai_verifier::{AIVerifier, AIVerifierConfig};
pub use browser_verifier::{
    BrowserType, BrowserVerifier, BrowserVerifierBuilder, BrowserVerifierConfig,
};
pub use command_verifier::CommandVerifier;
pub use file_exists_verifier::FileExistsVerifier;
pub use gate_runner::{GateRunConfig, GateRunner};
pub use iced_gui_verifier::IcedGuiVerifier;
pub use regex_verifier::RegexVerifier;
pub use script_verifier::ScriptVerifier;
pub use verification_integration::VerificationIntegration;
pub use verifier::VerifierRegistry;

// Re-export common types from crate::types
pub use crate::types::{
    Criterion, CriterionResult, Evidence, GateDecision, GateReport, GateResult, Priority, TestPlan,
    TestResult, VerificationMethod, Verifier, VerifierResult,
};
