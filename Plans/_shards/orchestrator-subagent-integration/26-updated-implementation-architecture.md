## Updated Implementation Architecture

### Platform Capability Manager

```rust
// src/core/platform_capability_manager.rs

pub struct PlatformCapabilityManager {
    cursor_skills: Vec<SkillInfo>,
    claude_plugins: Vec<PluginInfo>,
    gemini_extensions: Vec<ExtensionInfo>,
    codex_mcp_available: bool,
    copilot_skills_available: bool,
}

impl PlatformCapabilityManager {
    // DRY:FN:discover_capabilities — Discover platform-specific capabilities using platform_specs
    pub fn discover_capabilities(&self, platform: Platform) -> Result<Capabilities> {
        platform_specs::discover_platform_capabilities(platform)
    }
}
```

### Enhanced Subagent Invoker

```rust
// src/core/subagent_invoker.rs (enhanced)

impl SubagentInvoker {
    // DRY:FN:invoke_with_capabilities — Invoke subagent using platform-specific capabilities
    pub async fn invoke_with_capabilities(
        &self,
        platform: Platform,
        subagent_name: &str,
        task: &str,
        capabilities: &PlatformCapabilities,
    ) -> Result<String> {
        if !subagent_registry::is_valid_subagent_name(subagent_name) {
            return Err(anyhow!("Invalid subagent name: {}", subagent_name));
        }

        let invocation_method =
            platform_specs::get_subagent_invocation_method(platform, capabilities)?;

        match invocation_method {
            InvocationMethod::Mcp => self.invoke_via_mcp(platform, subagent_name, task).await,
            InvocationMethod::Cli => self.invoke_via_cli(platform, subagent_name, task).await,
        }
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

