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
//!
//! Also provides dynamic model caching with persistent storage and CLI-based refresh.

use crate::platforms::platform_specs;
use crate::types::Platform;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

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

    // DRY:FN:init_catalog_from_specs — Build static catalog entries directly from platform_specs fallback models.
    fn init_catalog_from_specs(&mut self, platform: Platform) {
        let spec = platform_specs::get_spec(platform);
        let mut catalog = ModelCatalog::new(platform);

        for fallback_model in spec.fallback_models {
            catalog.add_model(ModelInfo {
                id: fallback_model.id.to_string(),
                name: fallback_model.display_name.to_string(),
                provider: infer_provider(platform, fallback_model.id),
                context_window: fallback_context_window(platform),
                max_output: fallback_max_output(platform),
                supports_vision: fallback_model.supports_vision,
                supports_tools: true,
                supports_streaming: true,
                tier_required: None,
                notes: Some(format!("Fallback model from {}", spec.display_name)),
            });
        }

        if let Some(default_model) = platform_specs::default_model_for(platform) {
            catalog.set_default(default_model);
        } else if let Some(first_model) = catalog.models.first() {
            catalog.set_default(first_model.id.clone());
        }

        self.catalogs.insert(platform, catalog);
    }

    /// Initialize Cursor model catalog
    fn init_cursor_catalog(&mut self) {
        self.init_catalog_from_specs(Platform::Cursor);
    }

    /// Initialize Codex model catalog
    fn init_codex_catalog(&mut self) {
        self.init_catalog_from_specs(Platform::Codex);
    }

    /// Initialize Claude model catalog
    fn init_claude_catalog(&mut self) {
        self.init_catalog_from_specs(Platform::Claude);
    }

    /// Initialize Gemini model catalog
    fn init_gemini_catalog(&mut self) {
        self.init_catalog_from_specs(Platform::Gemini);
    }

    /// Initialize Copilot model catalog
    fn init_copilot_catalog(&mut self) {
        self.init_catalog_from_specs(Platform::Copilot);
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

fn fallback_context_window(platform: Platform) -> u32 {
    match platform {
        Platform::Gemini => 1_000_000,
        Platform::Cursor | Platform::Codex | Platform::Claude | Platform::Copilot => 200_000,
    }
}

fn fallback_max_output(platform: Platform) -> u32 {
    match platform {
        Platform::Codex => 16_384,
        Platform::Cursor | Platform::Claude | Platform::Gemini | Platform::Copilot => 8_192,
    }
}

fn infer_provider(platform: Platform, model_id: &str) -> ModelProvider {
    let lower = model_id.to_ascii_lowercase();
    if lower.contains("claude")
        || lower.contains("sonnet")
        || lower.contains("opus")
        || lower.contains("haiku")
        || lower.contains("anthropic")
        || matches!(platform, Platform::Claude)
    {
        return ModelProvider::Anthropic;
    }
    if lower.contains("gpt")
        || lower.contains("o1")
        || lower.contains("o3")
        || lower.contains("o4")
        || lower.contains("codex")
        || lower.contains("openai")
        || matches!(platform, Platform::Codex)
    {
        return ModelProvider::OpenAI;
    }
    if lower.contains("gemini") || lower.contains("google") || matches!(platform, Platform::Gemini)
    {
        return ModelProvider::Google;
    }
    ModelProvider::Other
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

// ─── Dynamic Model Cache ──────────────────────────────────────────────────

/// How a model list was obtained.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ModelSource {
    /// Freshly fetched from the platform CLI/SDK.
    Dynamic,
    /// Loaded from platform_specs fallback (CLI unavailable).
    Fallback,
    /// Loaded from persistent disk cache.
    Cached,
    /// Fetched via SDK bridge (Node.js SDK).
    Sdk,
}

/// A cached list of models for a single platform.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedModelList {
    pub models: Vec<String>,
    pub display_names: Vec<String>,
    pub last_refreshed: Option<DateTime<Utc>>,
    pub source: ModelSource,
}

impl CachedModelList {
    /// Create a fallback list from platform_specs.
    pub fn from_fallback(platform: Platform) -> Self {
        let spec = platform_specs::get_spec(platform);
        let models: Vec<String> = spec
            .fallback_models
            .iter()
            .map(|m| m.id.to_string())
            .collect();
        let display_names: Vec<String> = spec
            .fallback_models
            .iter()
            .map(|m| m.display_name.to_string())
            .collect();
        Self {
            models,
            display_names,
            last_refreshed: None,
            source: ModelSource::Fallback,
        }
    }

    /// Whether the cache is stale based on the platform's configured TTL.
    pub fn is_stale(&self, platform: Platform) -> bool {
        let ttl_minutes = platform_specs::get_spec(platform)
            .model_discovery
            .cache_ttl_minutes;
        match self.last_refreshed {
            Some(ts) => {
                let age = Utc::now().signed_duration_since(ts);
                age.num_minutes() > ttl_minutes as i64
            }
            None => true,
        }
    }
}

/// Persistent cache file format.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct PersistentModelCache {
    platforms: HashMap<String, CachedModelList>,
}

/// Get the path to the persistent model cache file.
fn cache_file_path() -> Option<PathBuf> {
    directories::BaseDirs::new().map(|dirs| {
        dirs.home_dir()
            .join(".puppet-master")
            .join("model_cache.json")
    })
}

/// Load cached models from disk for all platforms.
pub fn load_persistent_cache() -> HashMap<Platform, CachedModelList> {
    let mut result = HashMap::new();
    let Some(path) = cache_file_path() else {
        return result;
    };
    let Ok(data) = std::fs::read_to_string(&path) else {
        return result;
    };
    let Ok(cache) = serde_json::from_str::<PersistentModelCache>(&data) else {
        return result;
    };
    for (key, mut list) in cache.platforms {
        if let Some(platform) = platform_from_str(&key) {
            list.source = ModelSource::Cached;
            result.insert(platform, list);
        }
    }
    result
}

/// Save cached models to disk.
pub fn save_persistent_cache(cache: &HashMap<Platform, CachedModelList>) {
    let Some(path) = cache_file_path() else {
        return;
    };
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let persistent = PersistentModelCache {
        platforms: cache
            .iter()
            .map(|(p, list)| (platform_to_str(*p).to_string(), list.clone()))
            .collect(),
    };
    if let Ok(json) = serde_json::to_string_pretty(&persistent) {
        let _ = std::fs::write(&path, json);
    }
}

/// Attempt to discover models from a platform CLI (blocking — call from async).
pub fn refresh_models_blocking(platform: Platform) -> CachedModelList {
    if platform_specs::has_sdk(platform) {
        return refresh_models_with_sdk_fallback(platform);
    }

    refresh_models_cli_blocking(platform)
}

/// Attempt to discover models from a platform CLI only (blocking — call from async).
fn refresh_models_cli_blocking(platform: Platform) -> CachedModelList {
    let spec = platform_specs::get_spec(platform);
    let discovery = &spec.model_discovery;

    // If no CLI discovery command, return fallback.
    let Some(cli_cmd) = discovery.cli_command else {
        return CachedModelList::from_fallback(platform);
    };

    // Check if the CLI binary is available.
    if which::which(cli_cmd).is_err() {
        log::warn!(
            "CLI binary '{}' not found for {:?} model discovery, using fallback",
            cli_cmd,
            platform
        );
        return CachedModelList::from_fallback(platform);
    }

    // Run the discovery command.
    let output = std::process::Command::new(cli_cmd)
        .args(discovery.cli_args)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let models: Vec<String> = stdout
                .lines()
                .map(|l| l.trim().to_string())
                .filter(|l| !l.is_empty())
                .collect();

            if models.is_empty() {
                log::warn!("Empty model list from {:?} CLI, using fallback", platform);
                return CachedModelList::from_fallback(platform);
            }

            // Display names default to model IDs.
            let display_names = models.clone();

            CachedModelList {
                models,
                display_names,
                last_refreshed: Some(Utc::now()),
                source: ModelSource::Dynamic,
            }
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr);
            log::warn!(
                "Model discovery failed for {:?}: {}",
                platform,
                stderr.trim()
            );
            CachedModelList::from_fallback(platform)
        }
        Err(e) => {
            log::warn!("Failed to run model discovery for {:?}: {}", platform, e);
            CachedModelList::from_fallback(platform)
        }
    }
}

/// DRY:FN:refresh_models_via_sdk — Attempt model discovery via Node.js SDK bridge.
/// Falls back to CLI discovery or platform_specs fallback if SDK is unavailable.
pub fn refresh_models_with_sdk_fallback(platform: Platform) -> CachedModelList {
    // Only try SDK for platforms that have one
    if !platform_specs::has_sdk(platform) {
        return refresh_models_cli_blocking(platform);
    }

    // Try SDK bridge (requires Node.js)
    let Some(bridge) = super::sdk_bridge::SdkBridge::new() else {
        log::info!(
            "Node.js not available for {:?} SDK, falling back to CLI",
            platform
        );
        return refresh_models_cli_blocking(platform);
    };

    // Run SDK listing in a new tokio runtime (we're in a blocking context)
    let sdk_result = std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().ok()?;
        rt.block_on(bridge.list_models(platform)).ok()
    })
    .join()
    .ok()
    .flatten();

    match sdk_result {
        Some(models) if !models.is_empty() => {
            let display_names = models.clone();
            log::info!(
                "SDK discovered {} model(s) for {:?}",
                models.len(),
                platform
            );
            CachedModelList {
                models,
                display_names,
                last_refreshed: Some(chrono::Utc::now()),
                source: ModelSource::Sdk,
            }
        }
        _ => {
            log::info!("SDK returned empty for {:?}, falling back to CLI", platform);
            refresh_models_cli_blocking(platform)
        }
    }
}

/// Build the initial model map for all platforms using platform_specs fallback data.
/// Replaces the old hardcoded `gui_config::build_model_map()`.
pub fn build_model_map_from_specs() -> HashMap<String, Vec<String>> {
    let mut map = HashMap::new();
    for platform in Platform::all() {
        let key = platform_to_str(*platform).to_string();
        let models: Vec<String> = platform_specs::fallback_model_ids(*platform)
            .into_iter()
            .map(|s| s.to_string())
            .collect();
        map.insert(key, models);
    }
    map
}

fn platform_to_str(p: Platform) -> &'static str {
    match p {
        Platform::Cursor => "cursor",
        Platform::Codex => "codex",
        Platform::Claude => "claude",
        Platform::Gemini => "gemini",
        Platform::Copilot => "copilot",
    }
}

fn platform_from_str(s: &str) -> Option<Platform> {
    match s {
        "cursor" => Some(Platform::Cursor),
        "codex" => Some(Platform::Codex),
        "claude" => Some(Platform::Claude),
        "gemini" => Some(Platform::Gemini),
        "copilot" => Some(Platform::Copilot),
        _ => None,
    }
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
        assert!(models.iter().any(|m| m.id == "auto"));
        assert!(models.iter().any(|m| m.id == "sonnet-4.5-thinking"));
        assert!(models.iter().any(|m| m.id == "gpt-4.1"));
    }

    #[test]
    fn test_codex_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Codex);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "gpt-5.3-codex"));
    }

    #[test]
    fn test_claude_models() {
        let manager = ModelCatalogManager::new();
        let models = manager.get_models(Platform::Claude);

        assert!(!models.is_empty());
        assert!(models.iter().any(|m| m.id == "sonnet"));
        assert!(models.iter().any(|m| m.id == "opus"));
        assert!(models.iter().any(|m| m.id == "haiku"));
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
        assert!(models.iter().any(|m| m.id == "gpt-5"));
    }

    #[test]
    fn test_get_model() {
        let manager = ModelCatalogManager::new();

        let model = manager
            .get_model(Platform::Cursor, "sonnet-4.5-thinking")
            .unwrap();
        assert_eq!(model.name, "Sonnet 4.5 Thinking");
        assert_eq!(model.provider, ModelProvider::Anthropic);
        assert!(model.supports_vision);
        assert!(model.supports_tools);
    }

    #[test]
    fn test_default_models() {
        let manager = ModelCatalogManager::new();

        // Cursor default
        let cursor_default = manager.get_default_model(Platform::Cursor).unwrap();
        assert_eq!(
            cursor_default.id,
            platform_specs::default_model_for(Platform::Cursor).unwrap()
        );

        // Codex default
        let codex_default = manager.get_default_model(Platform::Codex).unwrap();
        assert_eq!(
            codex_default.id,
            platform_specs::default_model_for(Platform::Codex).unwrap()
        );

        // Claude default
        let claude_default = manager.get_default_model(Platform::Claude).unwrap();
        assert_eq!(
            claude_default.id,
            platform_specs::default_model_for(Platform::Claude).unwrap()
        );

        // Gemini default
        let gemini_default = manager.get_default_model(Platform::Gemini).unwrap();
        assert_eq!(
            gemini_default.id,
            platform_specs::default_model_for(Platform::Gemini).unwrap()
        );

        // Copilot default
        let copilot_default = manager.get_default_model(Platform::Copilot).unwrap();
        assert_eq!(
            copilot_default.id,
            platform_specs::default_model_for(Platform::Copilot).unwrap()
        );
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

        let model = get_model(Platform::Cursor, "auto");
        assert!(model.is_some());

        let default = get_default_model(Platform::Claude);
        assert!(default.is_some());
    }

    #[test]
    fn test_refresh_with_sdk_fallback_non_sdk_platform() {
        // Claude doesn't have SDK, should fall back to CLI/specs
        let result = refresh_models_with_sdk_fallback(Platform::Claude);
        assert!(!result.models.is_empty());
        // Should be Fallback or Dynamic, NOT Sdk
        assert!(matches!(
            result.source,
            ModelSource::Fallback | ModelSource::Dynamic
        ));
    }

    #[test]
    fn test_refresh_models_blocking_sdk_platform_returns_models() {
        // SDK-capable platforms should still return models even when SDK is unavailable,
        // because refresh_models_blocking now routes through SDK fallback.
        let result = refresh_models_blocking(Platform::Codex);
        assert!(!result.models.is_empty());
        assert!(matches!(
            result.source,
            ModelSource::Sdk | ModelSource::Dynamic | ModelSource::Fallback
        ));
    }

    #[test]
    fn test_model_source_sdk_variant() {
        // Verify the Sdk variant exists and can be matched
        let source = ModelSource::Sdk;
        assert!(matches!(source, ModelSource::Sdk));
    }
}
