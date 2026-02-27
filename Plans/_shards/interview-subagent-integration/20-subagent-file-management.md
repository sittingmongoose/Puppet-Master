## Subagent File Management

### Current State
Subagent files are currently located in `.claude/agents/` directory (41 subagent persona files, including explore).

### Requirements
1. **Copy subagents to project:** Subagent files must be available in the Puppet Master project for use during interviews
2. **Platform-specific locations:** Different platforms expect subagents in different locations:
   - **Cursor**: `.cursor/agents/` or `~/.cursor/agents/`
   - **Claude Code**: `.claude/agents/` or `~/.claude/agents/`
   - **Codex**: `.codex/agents/` or `~/.codex/agents/`
   - **Gemini**: Gemini is a Direct API provider; subagents are orchestrated via Puppet Master's internal Persona system (no platform agent directory)
   - **GitHub Copilot**: `.github/agents/` or `~/.copilot/agents/`

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
    /// Discovers subagents from source location (.claude/agents/)
    pub fn discover_subagents(source_dir: &Path) -> Result<Vec<SubagentInfo>> {
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
    
    /// Copies subagents to platform-specific locations in project
    pub fn copy_subagents_to_project(
        source_dir: &Path,
        project_dir: &Path,
        platforms: &[Platform],
    ) -> Result<()> {
        let subagents = Self::discover_subagents(source_dir)?;
        
        for platform in platforms {
            let target_dir = Self::platform_agents_dir(project_dir, *platform);
            std::fs::create_dir_all(&target_dir)
                .context("Failed to create platform agents directory")?;
            
            for subagent in &subagents {
                let target_path = target_dir.join(format!("{}.md", subagent.name));
                std::fs::copy(&subagent.file_path, &target_path)
                    .context("Failed to copy subagent file")?;
            }
        }
        
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
Add subagent file management to orchestrator initialization:

```rust
impl InterviewOrchestrator {
    pub fn new(config: InterviewOrchestratorConfig) -> Result<Self> {
        // Copy subagents to project if configured
        if let Some(subagent_cfg) = &config.subagent_config {
            if subagent_cfg.enable_phase_subagents {
                SubagentManager::copy_subagents_to_project(
                    &config.base_dir,
                    &config.output_dir,
                    &[config.primary_platform.platform],
                )?;
            }
        }
        
        // ... rest of initialization ...
    }
}
```

