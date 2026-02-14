//! Comprehensive model catalogs for all AI platforms
//!
//! This module provides structured information about available models across
//! all supported platforms: Cursor, Codex, Claude, Gemini, and Copilot.
//!
//! Model information includes:
//! - Model ID and display name
//! - Provider (Anthropic, OpenAI, Google, etc.)
//! - Context window size
//! - Maximum output tokens
//! - Capability flags (vision, tools, etc.)
//! - Required subscription tier

use crate::types::Platform;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Model information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    /// Model identifier
    pub id: String,
    /// Display name
    pub name: String,
    /// Model provider
    pub provider: ModelProvider,
    /// Context window size in tokens
    pub context_window: u32,
    /// Maximum output tokens
    pub max_output: u32,
    /// Supports vision/image inputs
    pub supports_vision: bool,
    /// Supports tool/function calling
    pub supports_tools: bool,
    /// Supports streaming
    pub supports_streaming: bool,
    /// Required subscription tier (if any)
    pub tier_required: Option<String>,
    /// Additional notes
    pub notes: Option<String>,
}

/// Model provider
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModelProvider {
    /// Anthropic (Claude)
    Anthropic,
    /// OpenAI (GPT)
    OpenAI,
    /// Google (Gemini)
    Google,
    /// Meta (Llama)
    Meta,
    /// Other/Unknown
    Other,
}

impl std::fmt::Display for ModelProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelProvider::Anthropic => write!(f, "Anthropic"),
            ModelProvider::OpenAI => write!(f, "OpenAI"),
            ModelProvider::Google => write!(f, "Google"),
            ModelProvider::Meta => write!(f, "Meta"),
            ModelProvider::Other => write!(f, "Other"),
        }
    }
}

/// Model catalog for a platform
#[derive(Debug, Clone)]
pub struct ModelCatalog {
    platform: Platform,
    models: Vec<ModelInfo>,
    default_model: Option<String>,
}

impl ModelCatalog {
    /// Create a new model catalog
    fn new(platform: Platform) -> Self {
        Self {
            platform,
            models: Vec::new(),
            default_model: None,
        }
    }

    /// Add a model to the catalog
    fn add_model(&mut self, model: ModelInfo) {
        self.models.push(model);
    }

    /// Set default model
    fn set_default(&mut self, model_id: impl Into<String>) {
        self.default_model = Some(model_id.into());
    }

    /// Get all models
    pub fn get_models(&self) -> &[ModelInfo] {
        &self.models
    }

    /// Get a specific model by ID
    pub fn get_model(&self, id: &str) -> Option<&ModelInfo> {
        self.models.iter().find(|m| m.id == id)
    }

    /// Get default model
    pub fn get_default(&self) -> Option<&ModelInfo> {
        self.default_model
            .as_ref()
            .and_then(|id| self.get_model(id))
    }

    /// Get models by provider
    pub fn get_by_provider(&self, provider: ModelProvider) -> Vec<&ModelInfo> {
        self.models
            .iter()
            .filter(|m| m.provider == provider)
            .collect()
    }

    /// Get models supporting vision
    pub fn get_vision_models(&self) -> Vec<&ModelInfo> {
        self.models.iter().filter(|m| m.supports_vision).collect()
    }

    /// Get models supporting tools
    pub fn get_tool_models(&self) -> Vec<&ModelInfo> {
        self.models.iter().filter(|m| m.supports_tools).collect()
    }

    /// Get platform
    pub fn platform(&self) -> Platform {
        self.platform
    }
}

/// Model catalog manager
pub struct ModelCatalogManager {
    catalogs: HashMap<Platform, ModelCatalog>,
}

impl ModelCatalogManager {
    /// Create a new model catalog manager
    pub fn new() -> Self {
        let mut manager = Self {
            catalogs: HashMap::new(),
        };

        // Initialize catalogs for all platforms
        manager.init_cursor_catalog();
        manager.init_codex_catalog();
        manager.init_claude_catalog();
        manager.init_gemini_catalog();
        manager.init_copilot_catalog();

        manager
    }

    /// Initialize Cursor model catalog
    fn init_cursor_catalog(&mut self) {
        let mut catalog = ModelCatalog::new(Platform::Cursor);

        // Claude models via Cursor
        catalog.add_model(ModelInfo {
            id: "claude-sonnet-4-5".to_string(),
            name: "Claude Sonnet 4.5".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: None,
        });

        catalog.add_model(ModelInfo {
            id: "claude-sonnet-4".to_string(),
            name: "Claude Sonnet 4".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: None,
        });

        // GPT models via Cursor
        catalog.add_model(ModelInfo {
            id: "gpt-4.1".to_string(),
            name: "GPT-4.1".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 128_000,
            max_output: 4_096,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: None,
        });

        catalog.add_model(ModelInfo {
            id: "gpt-4o".to_string(),
            name: "GPT-4o".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 128_000,
            max_output: 4_096,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: None,
        });

        // Gemini models via Cursor
        catalog.add_model(ModelInfo {
            id: "gemini-2.5-pro".to_string(),
            name: "Gemini 2.5 Pro".to_string(),
            provider: ModelProvider::Google,
            context_window: 1_000_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: None,
        });

        catalog.set_default("claude-sonnet-4-5");
        self.catalogs.insert(Platform::Cursor, catalog);
    }

    /// Initialize Codex model catalog
    fn init_codex_catalog(&mut self) {
        let mut catalog = ModelCatalog::new(Platform::Codex);

        catalog.add_model(ModelInfo {
            id: "gpt-5.2-codex".to_string(),
            name: "GPT-5.2 Codex".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 200_000,
            max_output: 16_384,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Plus".to_string()),
            notes: Some("Latest Codex model with extended context".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "gpt-5.1-codex".to_string(),
            name: "GPT-5.1 Codex".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 128_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Plus".to_string()),
            notes: None,
        });

        catalog.add_model(ModelInfo {
            id: "gpt-5.1-codex-mini".to_string(),
            name: "GPT-5.1 Codex Mini".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 128_000,
            max_output: 4_096,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: None,
            notes: Some("Faster, lighter model".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "gpt-5-codex-mini".to_string(),
            name: "GPT-5 Codex Mini".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 64_000,
            max_output: 4_096,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: None,
            notes: Some("Free tier model".to_string()),
        });

        catalog.set_default("gpt-5.2-codex");
        self.catalogs.insert(Platform::Codex, catalog);
    }

    /// Initialize Claude model catalog
    fn init_claude_catalog(&mut self) {
        let mut catalog = ModelCatalog::new(Platform::Claude);

        catalog.add_model(ModelInfo {
            id: "claude-sonnet-4-5".to_string(),
            name: "Claude Sonnet 4.5".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: Some("Best balance of speed and intelligence".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "claude-opus-4".to_string(),
            name: "Claude Opus 4".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: Some("Most capable Claude model".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "claude-sonnet-4".to_string(),
            name: "Claude Sonnet 4".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Pro".to_string()),
            notes: None,
        });

        catalog.add_model(ModelInfo {
            id: "claude-haiku-4".to_string(),
            name: "Claude Haiku 4".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: None,
            notes: Some("Fast and efficient".to_string()),
        });

        catalog.set_default("claude-sonnet-4-5");
        self.catalogs.insert(Platform::Claude, catalog);
    }

    /// Initialize Gemini model catalog
    fn init_gemini_catalog(&mut self) {
        let mut catalog = ModelCatalog::new(Platform::Gemini);

        catalog.add_model(ModelInfo {
            id: "gemini-2.5-pro".to_string(),
            name: "Gemini 2.5 Pro".to_string(),
            provider: ModelProvider::Google,
            context_window: 1_000_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Advanced".to_string()),
            notes: Some("1 million token context window".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "gemini-2.5-flash".to_string(),
            name: "Gemini 2.5 Flash".to_string(),
            provider: ModelProvider::Google,
            context_window: 1_000_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: None,
            notes: Some("Fast multimodal model".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "gemini-3-pro-preview".to_string(),
            name: "Gemini 3 Pro (Preview)".to_string(),
            provider: ModelProvider::Google,
            context_window: 2_000_000,
            max_output: 16_384,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Advanced".to_string()),
            notes: Some("Next generation model, preview access".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "gemini-2-flash".to_string(),
            name: "Gemini 2.0 Flash".to_string(),
            provider: ModelProvider::Google,
            context_window: 1_000_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: None,
            notes: Some("Free tier model".to_string()),
        });

        catalog.set_default("gemini-2.5-pro");
        self.catalogs.insert(Platform::Gemini, catalog);
    }

    /// Initialize Copilot model catalog
    fn init_copilot_catalog(&mut self) {
        let mut catalog = ModelCatalog::new(Platform::Copilot);

        catalog.add_model(ModelInfo {
            id: "claude-sonnet-4.5".to_string(),
            name: "Claude Sonnet 4.5".to_string(),
            provider: ModelProvider::Anthropic,
            context_window: 200_000,
            max_output: 8_192,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Enterprise".to_string()),
            notes: Some("Default Copilot model".to_string()),
        });

        catalog.add_model(ModelInfo {
            id: "gpt-4.1".to_string(),
            name: "GPT-4.1".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 128_000,
            max_output: 4_096,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: Some("Enterprise".to_string()),
            notes: None,
        });

        catalog.add_model(ModelInfo {
            id: "gpt-4o".to_string(),
            name: "GPT-4o".to_string(),
            provider: ModelProvider::OpenAI,
            context_window: 128_000,
            max_output: 4_096,
            supports_vision: true,
            supports_tools: true,
            supports_streaming: true,
            tier_required: None,
            notes: Some("Standard Copilot model".to_string()),
        });

        catalog.set_default("claude-sonnet-4.5");
        self.catalogs.insert(Platform::Copilot, catalog);
    }

    /// Get catalog for a platform
    pub fn get_catalog(&self, platform: Platform) -> Option<&ModelCatalog> {
        self.catalogs.get(&platform)
    }

    /// Get models for a platform
    pub fn get_models(&self, platform: Platform) -> Vec<&ModelInfo> {
        self.catalogs
            .get(&platform)
            .map(|c| c.get_models().iter().collect())
            .unwrap_or_default()
    }

    /// Get a specific model
    pub fn get_model(&self, platform: Platform, model_id: &str) -> Option<&ModelInfo> {
        self.catalogs
            .get(&platform)
            .and_then(|c| c.get_model(model_id))
    }

    /// Get default model for a platform
    pub fn get_default_model(&self, platform: Platform) -> Option<&ModelInfo> {
        self.catalogs.get(&platform).and_then(|c| c.get_default())
    }

    /// Get all platforms with catalogs
    pub fn platforms(&self) -> Vec<Platform> {
        self.catalogs.keys().copied().collect()
    }

    /// Get all models across all platforms
    pub fn get_all_models(&self) -> HashMap<Platform, Vec<&ModelInfo>> {
        self.catalogs
            .iter()
            .map(|(platform, catalog)| (*platform, catalog.get_models().iter().collect()))
            .collect()
    }
}

impl Default for ModelCatalogManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Global model catalog manager
static CATALOG_MANAGER: once_cell::sync::Lazy<ModelCatalogManager> =
    once_cell::sync::Lazy::new(ModelCatalogManager::new);

/// Get the global model catalog manager
pub fn global_catalog() -> &'static ModelCatalogManager {
    &CATALOG_MANAGER
}

/// Get models for a platform
pub fn get_models(platform: Platform) -> Vec<&'static ModelInfo> {
    global_catalog().get_models(platform)
}

/// Get a specific model
pub fn get_model(platform: Platform, model_id: &str) -> Option<&'static ModelInfo> {
    global_catalog().get_model(platform, model_id)
}

/// Get default model for a platform
pub fn get_default_model(platform: Platform) -> Option<&'static ModelInfo> {
    global_catalog().get_default_model(platform)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_catalog_creation() {
        let manager = ModelCatalogManager::new();
        assert_eq!(manager.platforms().len(), 5);
    }

    #[test]
    fn test_cursor_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Cursor);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "claude-sonnet-4-5"));
        assert!(models.iter().any(|m| m.id == "gpt-4.1"));
        assert!(models.iter().any(|m| m.id == "gemini-2.5-pro"));
    }

    #[test]
    fn test_codex_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Codex);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "gpt-5.2-codex"));
        assert!(models.iter().any(|m| m.id == "gpt-5.1-codex-mini"));
    }

    #[test]
    fn test_claude_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Claude);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "claude-sonnet-4-5"));
        assert!(models.iter().any(|m| m.id == "claude-opus-4"));
        assert!(models.iter().any(|m| m.id == "claude-haiku-4"));
    }

    #[test]
    fn test_gemini_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Gemini);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "gemini-2.5-pro"));
        assert!(models.iter().any(|m| m.id == "gemini-2.5-flash"));

        // Check 1M context window
        let gemini_pro = models.iter().find(|m| m.id == "gemini-2.5-pro").unwrap();
        assert_eq!(gemini_pro.context_window, 1_000_000);
    }

    #[test]
    fn test_copilot_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Copilot);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "claude-sonnet-4.5"));
        assert!(models.iter().any(|m| m.id == "gpt-4.1"));
    }

    #[test]
    fn test_get_model() {
        let manager = ModelCatalogManager::new();

        let model = manager
            .get_model(Platform::Cursor, "claude-sonnet-4-5")
            .unwrap();
        assert_eq!(model.name, "Claude Sonnet 4.5");
        assert_eq!(model.provider, ModelProvider::Anthropic);
        assert!(model.supports_vision);
        assert!(model.supports_tools);
    }

    #[test]
    fn test_default_models() {
        let manager = ModelCatalogManager::new();

        // Cursor default
        let cursor_default = manager.get_default_model(Platform::Cursor).unwrap();
        assert_eq!(cursor_default.id, "claude-sonnet-4-5");

        // Codex default
        let codex_default = manager.get_default_model(Platform::Codex).unwrap();
        assert_eq!(codex_default.id, "gpt-5.2-codex");

        // Claude default
        let claude_default = manager.get_default_model(Platform::Claude).unwrap();
        assert_eq!(claude_default.id, "claude-sonnet-4-5");

        // Gemini default
        let gemini_default = manager.get_default_model(Platform::Gemini).unwrap();
        assert_eq!(gemini_default.id, "gemini-2.5-pro");

        // Copilot default
        let copilot_default = manager.get_default_model(Platform::Copilot).unwrap();
        assert_eq!(copilot_default.id, "claude-sonnet-4.5");
    }

    #[test]
    fn test_vision_models() {
        let manager = ModelCatalogManager::new();
        let catalog = manager.get_catalog(Platform::Cursor).unwrap();
        let vision_models = catalog.get_vision_models();

        assert!(!vision_models.is_empty());
        for model in vision_models {
            assert!(model.supports_vision);
        }
    }

    #[test]
    fn test_tool_models() {
        let manager = ModelCatalogManager::new();
        let catalog = manager.get_catalog(Platform::Codex).unwrap();
        let tool_models = catalog.get_tool_models();

        assert!(!tool_models.is_empty());
        for model in tool_models {
            assert!(model.supports_tools);
        }
    }

    #[test]
    fn test_get_by_provider() {
        let manager = ModelCatalogManager::new();
        let catalog = manager.get_catalog(Platform::Cursor).unwrap();

        let anthropic_models = catalog.get_by_provider(ModelProvider::Anthropic);
        assert!(!anthropic_models.is_empty());
        for model in anthropic_models {
            assert_eq!(model.provider, ModelProvider::Anthropic);
        }

        let openai_models = catalog.get_by_provider(ModelProvider::OpenAI);
        assert!(!openai_models.is_empty());
        for model in openai_models {
            assert_eq!(model.provider, ModelProvider::OpenAI);
        }
    }

    #[test]
    fn test_global_catalog() {
        let models = get_models(Platform::Cursor);
        assert!(!models.is_empty());

        let model = get_model(Platform::Cursor, "claude-sonnet-4-5");
        assert!(model.is_some());

        let default = get_default_model(Platform::Claude);
        assert!(default.is_some());
    }
}
