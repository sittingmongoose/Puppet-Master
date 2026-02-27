## Updated Configuration

Add platform-specific invocation settings:

```rust
pub struct SubagentConfig {
    // ... existing fields ...
    
    /// Platform-specific invocation settings
    pub platform_settings: HashMap<Platform, PlatformSubagentSettings>,
}

pub struct PlatformSubagentSettings {
    /// For Claude: Use --agents flag vs automatic invocation
    pub use_dynamic_agents: bool,
    /// For Copilot: Preferred invocation type
    pub copilot_invocation_type: Option<CopilotInvocationType>,
    /// For Gemini: Require enableAgents setting
    pub require_experimental_flag: bool,
}
```

