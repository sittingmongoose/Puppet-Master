//! Verifier registry for pluggable verification system

use crate::types::{Criterion, Verifier, VerifierResult};
use anyhow::{Result, anyhow};
use std::collections::HashMap;
use std::sync::Arc;

use super::{
    AIVerifier, BrowserVerifier, CommandVerifier, FileExistsVerifier, IcedGuiVerifier,
    RegexVerifier, ScriptVerifier,
};

// DRY:DATA:VerifierRegistry
/// Registry of verifier implementations
#[derive(Clone)]
pub struct VerifierRegistry {
    verifiers: HashMap<String, Arc<dyn Verifier>>,
}

impl VerifierRegistry {
    // DRY:FN:new
    /// Create a new empty registry
    pub fn new() -> Self {
        Self {
            verifiers: HashMap::new(),
        }
    }

    // DRY:FN:register
    /// Register a verifier
    pub fn register(&mut self, verifier: Arc<dyn Verifier>) {
        let verifier_type = verifier.verifier_type().to_string();
        self.verifiers.insert(verifier_type, verifier);
    }

    // DRY:FN:register_defaults
    /// Register all default verifiers
    pub fn register_defaults(&mut self) {
        self.register(Arc::new(AIVerifier::new()));
        self.register(Arc::new(BrowserVerifier::new()));
        self.register(Arc::new(CommandVerifier::new()));
        self.register(Arc::new(FileExistsVerifier::new()));
        self.register(Arc::new(IcedGuiVerifier::new()));
        self.register(Arc::new(RegexVerifier::new()));
        self.register(Arc::new(ScriptVerifier::new()));
    }

    // DRY:FN:get
    /// Get a verifier by type
    pub fn get(&self, verifier_type: &str) -> Option<&Arc<dyn Verifier>> {
        self.verifiers.get(verifier_type)
    }

    // DRY:FN:verify
    /// Verify a criterion using the appropriate verifier
    pub async fn verify(&self, criterion: &Criterion) -> Result<VerifierResult> {
        // Use verification_method string to determine verifier type
        let verifier_type = criterion
            .verification_method
            .as_deref()
            .unwrap_or("command");

        let verifier = self
            .get(verifier_type)
            .ok_or_else(|| anyhow!("No verifier found for type: {}", verifier_type))?;

        Ok(verifier.verify(criterion).await)
    }

    // DRY:FN:list_verifiers
    /// List all registered verifier types
    pub fn list_verifiers(&self) -> Vec<String> {
        self.verifiers.keys().cloned().collect()
    }
}

impl Default for VerifierRegistry {
    fn default() -> Self {
        let mut registry = Self::new();
        registry.register_defaults();
        registry
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_registry_creation() {
        let registry = VerifierRegistry::new();
        assert_eq!(registry.list_verifiers().len(), 0);
    }

    #[test]
    fn test_registry_defaults() {
        let registry = VerifierRegistry::default();
        assert!(registry.list_verifiers().len() >= 6);
        assert!(registry.get("ai").is_some());
        assert!(registry.get("browser").is_some());
        assert!(registry.get("command").is_some());
        assert!(registry.get("file_exists").is_some());
        assert!(registry.get("iced_gui").is_some());
        assert!(registry.get("regex").is_some());
        assert!(registry.get("script").is_some());
    }
}
