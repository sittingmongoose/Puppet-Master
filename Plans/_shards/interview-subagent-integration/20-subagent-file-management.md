## Subagent File Management

### Current State
Legacy provider-native agent files may exist under directories such as `.claude/agents/`. They are **seed/import sources only** and are not the canonical runtime representation of Puppet Master Personas.

### Requirements
1. **Canonical runtime source:** Interview resolves Personas from canonical Persona storage defined in `Plans/Personas.md` (project-local/global `PERSONA.md` files), not from provider-native agent directories.
2. **Import/seed support:** Provider-native agent files MAY be imported/seeded into canonical Persona storage for convenience/migration.
3. **Platform-specific export (optional):** Different platforms may support exported provider-native agent files for interoperability:
   - **Cursor**: `.cursor/agents/` or `~/.cursor/agents/`
   - **Claude Code**: `.claude/agents/` or `~/.claude/agents/`
   - **Codex**: `.codex/agents/` or `~/.codex/agents/`
   - **Gemini**: Gemini is a Direct API provider; subagents are orchestrated via Puppet Master's internal Persona system (no platform agent directory)
   - **GitHub Copilot**: `.github/agents/` or `~/.copilot/agents/`
4. **Registry alignment:** Automatic interview selection may only choose Persona IDs present in the canonical 42-entry registry; imported/exported provider-native files must not create new auto-selectable IDs implicitly.

### Implementation Strategy

#### 1. Subagent Discovery Module
Create `src/interview/subagent_manager.rs`:

```rust
//! Subagent file management and discovery

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use anyhow::{Result, Context};

pub struct SubagentManager {
    project_dir: PathBuf,
    subagent_cache: HashMap<String, SubagentInfo>,
}

#[derive(Debug, Clone)]
pub struct SubagentInfo {
    pub name: String,
    pub description: String,
    pub file_path: PathBuf,
    pub platform_locations: Vec<PathBuf>,
}

impl SubagentManager {
    /// Discovers provider-native agent definitions that can be imported into canonical Persona storage.
    pub fn discover_importable_subagents(source_dir: &Path) -> Result<Vec<SubagentInfo>> {
        let agents_dir = source_dir.join(".claude/agents");
        let mut subagents = Vec::new();
        
        if agents_dir.exists() {
            for entry in std::fs::read_dir(&agents_dir)? {
                let entry = entry?;
                let path = entry.path();
                
                if path.extension().and_then(|s| s.to_str()) == Some("md") {
                    if let Some(info) = Self::parse_subagent_file(&path)? {
                        subagents.push(info);
                    }
                }
            }
        }
        
        Ok(subagents)
    }
    
    /// Imports provider-native files into canonical Persona storage after validation.
    pub fn import_subagents_into_persona_store(
        source_dir: &Path,
        persona_store_dir: &Path,
    ) -> Result<()> {
        let subagents = Self::discover_importable_subagents(source_dir)?;
        // Validate IDs, normalize schema, and write PERSONA.md to canonical storage.
        // Export back to provider-native locations is a separate optional flow.
        Ok(())
    }
    
    // DRY:FN:platform_agents_dir — Get platform-specific agents directory path
    // DRY REQUIREMENT: MUST use platform_specs::get_agents_directory_name() — NEVER hardcode platform-specific directory paths
    fn platform_agents_dir(project_dir: &Path, platform: Platform) -> PathBuf {
        // DRY: Use platform_specs to get agents directory (DRY:DATA:platform_specs)
        // DO NOT use match statements like: match platform { Platform::Cursor => ".cursor/agents", ... }
        let agents_dir_name = platform_specs::get_agents_directory_name(platform);
        project_dir.join(agents_dir_name)
    }
    
    fn parse_subagent_file(path: &Path) -> Result<Option<SubagentInfo>> {
        let content = std::fs::read_to_string(path)?;
        // Parse YAML frontmatter to extract name and description
        // ... implementation ...
        Ok(None) // Placeholder
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

#### 2. Integration into Interview Orchestrator
Interview initialization resolves Personas from canonical Persona storage. Import/export of provider-native agent files is setup/migration behavior, not a per-run prerequisite.

```rust
impl InterviewOrchestrator {
    pub fn new(config: InterviewOrchestratorConfig) -> Result<Self> {
        // Optionally import provider-native seed files into canonical Persona storage
        if let Some(subagent_cfg) = &config.subagent_config {
            if subagent_cfg.import_provider_native_agents_on_startup {
                SubagentManager::import_subagents_into_persona_store(
                    &config.base_dir,
                    &config.persona_store_dir,
                )?;
            }
        }

        // ... rest of initialization ...
    }
}
```

