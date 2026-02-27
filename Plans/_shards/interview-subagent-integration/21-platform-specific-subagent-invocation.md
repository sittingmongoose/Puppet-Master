## Platform-Specific Subagent Invocation

### Recent Release Notes (February 2026)

#### Cursor CLI (v2.5 - Feb 17, 2026)
- **Async Subagents:** Subagents can run asynchronously, parent agent continues working
- **Subagent Trees:** Subagents can spawn their own subagents
- **Performance:** Lower latency, better streaming feedback
- **Known Issue:** `/subagent-name` syntax currently broken in CLI (works in editor)

**Invocation Method:**
```bash
# Syntax: /subagent-name <task>
# Example in prompt:
"/product-manager Research target users for this feature"
```

**Implementation:**
```rust
// Cursor subagent invocation
fn invoke_cursor_subagent(
    subagent_name: &str,
    task: &str,
    platform: Platform,
) -> String {
    format!("/{} {}", subagent_name, task)
}
```

#### Codex CLI (v0.104.0 - Feb 18, 2026)
- **Protocol Updates:** Distinct approval IDs for command approvals to support multiple approvals within single shell command execution
- **App-Server v2:** Emits notifications when threads are archived/unarchived, enabling clients to react without polling
- **WebSocket Proxy:** Added `WS_PROXY`/`WSS_PROXY` environment support (including lowercase variants) for websocket proxying
- **Multi-Agent Roles:** Customizable via config (from 0.102.0)
- **MCP Server:** Codex exposed as MCP server for multi-agent workflows
- **Bug Fixes:** Reduced false-positive safety-check downgrade behavior, fixed Ctrl+C/Ctrl+D in cwd-change prompt

**Invocation Method:**
Codex uses MCP (Model Context Protocol) server tools:
- `codex` tool - Creates new Codex session
- `codex-reply` tool - Continues existing session

**Implementation:**
```rust
// Codex subagent invocation via MCP
fn invoke_codex_subagent(
    subagent_name: &str,
    task: &str,
) -> ExecutionRequest {
    // Codex subagents are invoked via MCP server tools
    // Requires running: codex mcp-server
    ExecutionRequest::new(
        Platform::Codex,
        "default".to_string(),
        format!(
            r#"Use the {} agent to: {}"#,
            subagent_name, task
        ),
        // ... working_dir ...
    )
}
```

#### Claude Code CLI (v2.1.45 - Feb 17-18, 2026)
- **Agent Teams Fix:** Fixed skills invoked by subagents appearing in main session
- **Bedrock/Vertex Support:** Fixed Agent Teams teammates failing on Bedrock, Vertex, Foundry
- **Performance:** Improved memory usage, startup performance

**Invocation Methods:**

**Method 1: --agents JSON flag (Dynamic)**
```bash
claude --agents '{
  "product-manager": {
    "description": "Product strategy expert",
    "prompt": "You are a product manager..."
  }
}' -p "Research target users"
```

**Method 2: Automatic invocation (File-based)**
Subagents defined in `.claude/agents/*.md` are automatically invoked when task matches description.

**Implementation:**
```rust
// Claude Code subagent invocation
fn invoke_claude_subagent(
    subagent_name: &str,
    task: &str,
    subagent_defs: &HashMap<String, SubagentDef>,
) -> Vec<String> {
    // Option 1: Use --agents flag with JSON
    let mut args = vec!["--agents".to_string()];
    let agents_json = serde_json::json!({
        subagent_name: subagent_defs.get(subagent_name)
    });
    args.push(agents_json.to_string());
    args.push("-p".to_string());
    args.push(format!("{}", task));
    args
    
    // Option 2: Rely on automatic invocation based on description
    // Just include subagent name in prompt naturally
}
```

#### Gemini (direct-provider)
Gemini is a **Direct-provider** in Puppet Master: it is used as a model provider via the Google Gemini API, not as a CLI-bridged platform.

**Invocation method:** Puppet Master subagents are internal/orchestrator-level. The Gemini provider receives the final prompt produced by the orchestrator; there are no provider-native agent directories and no provider-specific subagent flags.

**Configuration:**
- Google Gemini API key (Settings)
- Model selection in Settings (and Media toggles/models per `Plans/Media_Generation_and_Capabilities.md`)

#### GitHub Copilot CLI (v0.0.411 - Feb 17, 2026)
**Latest Stable:** v0.0.411 (Feb 17, 2026)  
**Pre-release:** v0.0.412-1 (Feb 18, 2026)

- **Fleets Feature:** `/fleet` command for parallel subagents (now available to all users in v0.0.411)
- **Delegation:** `/delegate` for background tasks
- **Custom Agents:** `/agent AGENT-NAME` for explicit invocation
- **Autopilot Mode:** Now available to all users (v0.0.411)
- **SDK APIs:** Added for plan mode, autopilot, fleet, and workspace files
- **Cross-Session Memory:** Ask about past work, files, and PRs across sessions (experimental, v0.0.412)
- **Memory Improvements:** Reduced memory usage in alt-screen mode during long sessions

**Invocation Methods:**

**Method 1: /fleet (Parallel subagents)**
```bash
copilot -p "/fleet Implement authentication system"
```

**Method 2: /delegate (Background task)**
```bash
copilot -p "/delegate Review security implementation"
```

**Method 3: /agent (Explicit invocation)**
```bash
copilot -p "/agent security-auditor Review authentication code"
```

**Implementation:**
```rust
// Copilot subagent invocation
fn invoke_copilot_subagent(
    subagent_name: &str,
    task: &str,
    invocation_type: CopilotInvocationType,
) -> String {
    match invocation_type {
        CopilotInvocationType::Fleet => {
            format!("/fleet {}", task)
        }
        CopilotInvocationType::Delegate => {
            format!("/delegate {}", task)
        }
        CopilotInvocationType::Explicit => {
            format!("/agent {} {}", subagent_name, task)
        }
    }
}

enum CopilotInvocationType {
    Fleet,      // Parallel subagents
    Delegate,   // Background task
    Explicit,   // Explicit agent name
}
```

### Platform-Specific Invocation Wrapper

Create unified interface for platform-specific invocation:

```rust
// src/interview/subagent_invoker.rs

use crate::types::Platform;

pub struct SubagentInvoker;

impl SubagentInvoker {
    /// Invokes a subagent using platform-specific syntax
    // DRY:FN:invoke_subagent — Build platform-specific subagent invocation prompt
    // DRY REQUIREMENT: MUST use platform_specs::get_subagent_invocation_format() — NEVER hardcode platform-specific invocation formats
    pub fn invoke_subagent(
        platform: Platform,
        subagent_name: &str,
        task: &str,
        context: &SubagentContext,
    ) -> String {
        // DRY: Use platform_specs to get subagent invocation format (DRY:DATA:platform_specs)
        // DO NOT use match statements like: match platform { Platform::Cursor => format!("/{} {}", ...), ... }
        let invocation_format = platform_specs::get_subagent_invocation_format(platform)
            .unwrap_or_else(|| {
                // Fallback: use generic format if platform_specs doesn't have specific format
                format!("As {}, {}", subagent_name, task)
            });
        
        // Format invocation using platform-specific format from platform_specs
        invocation_format
            .replace("{subagent}", subagent_name)
            .replace("{task}", task)
            // Handle platform-specific context (e.g., Copilot fleet/delegate)
            .replace("{context}", &format_context_for_platform(platform, context))
                    }
                }
            }
        }
    }
}

pub struct SubagentContext {
    pub use_dynamic_agents: bool,
    pub copilot_invocation_type: Option<CopilotInvocationType>,
}

pub enum CopilotInvocationType {
    Fleet,
    Delegate,
    Explicit,
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

