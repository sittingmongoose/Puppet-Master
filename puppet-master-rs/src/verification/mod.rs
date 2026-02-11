//! Verification subsystem for RWM Puppet Master
//!
//! This module provides verification capabilities including:
//! - Gate execution and reporting
//! - Multiple verifier types (command, file, regex, script, ai, browser)
//! - Evidence collection and storage
//! - Verifier registry for pluggable verification

mod gate_runner;
mod verifier;
mod command_verifier;
mod file_exists_verifier;
mod regex_verifier;
mod script_verifier;
mod ai_verifier;
mod browser_verifier;
mod verification_integration;

pub use gate_runner::{GateRunner, GateRunConfig};
pub use verifier::VerifierRegistry;
pub use command_verifier::CommandVerifier;
pub use file_exists_verifier::FileExistsVerifier;
pub use regex_verifier::RegexVerifier;
pub use script_verifier::ScriptVerifier;
pub use ai_verifier::{AIVerifier, AIVerifierConfig};
pub use browser_verifier::{BrowserVerifier, BrowserVerifierConfig, BrowserType, BrowserVerifierBuilder};
pub use verification_integration::VerificationIntegration;

// Re-export common types from crate::types
pub use crate::types::{
    Criterion, CriterionResult, VerificationMethod, VerifierResult, 
    GateReport, GateResult, GateDecision, TestResult, Priority, Verifier,
    TestPlan, Evidence,
};
