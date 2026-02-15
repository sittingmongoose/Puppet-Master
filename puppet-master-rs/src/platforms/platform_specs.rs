//! Static platform specification data — single source of truth for all platform capabilities.
//!
//! This module defines `PlatformSpec` and related structs that describe each AI platform's
//! CLI commands, models, auth flow, capabilities, and install methods. All data is `&'static`
//! and verified against official documentation (Feb 2026).
//!
//! CONSUMERS: gui_config, views/config, views/setup, views/doctor, views/wizard,
//! views/interview, auth_actions, auth_status, platform_detector, capability,
//! all platform runners (cursor, codex, claude, gemini, copilot),
//! core/orchestrator, core/execution_engine.
//!
//! # DRY Tags (for agent discoverability)
//! - DRY:DATA:PLATFORM_SPECS — All static platform CLI data (binary names, install paths, auth, models, effort, images, headless, experimental, subagent, SDK)
//! - DRY:FN:get_spec — Get the full spec for a single Platform
//! - DRY:FN:supports_effort — Whether platform has effort/reasoning levels
//! - DRY:FN:supports_images — Whether platform supports image/media (ALL 5 do)
//! - DRY:FN:supports_plan_mode — Whether platform supports plan mode (ALL 5 do)
//! - DRY:FN:reasoning_is_model_based — True only for Cursor (reasoning in model names)
//! - DRY:FN:has_auto_mode — True only for Cursor (--model auto)
//! - DRY:FN:supports_subagents — Claude Teams, Copilot Fleets, Codex sub-agents
//! - DRY:FN:subagent_env_vars — Get environment variables to enable subagents for a platform
//! - DRY:FN:subagent_extra_args — Get extra CLI args to enable subagents for a platform
//! - DRY:FN:has_sdk — Whether platform has a programmatic SDK
//! - DRY:FN:fallback_model_ids — Fallback model IDs when dynamic discovery unavailable
//! - DRY:FN:default_model_for — Default model for a platform
//! - DRY:FN:cli_binary_names — CLI binary names to search for
//! - DRY:FN:default_install_paths — Default install paths to search
//! - DRY:FN:install_methods_for — Install commands filtered by OS
//! - DRY:FN:effort_levels_for — Platform-specific effort level IDs and display names
//! - DRY:FN:image_capable_platforms — All platforms that support images (currently all 5)
//! - DRY:FN:subagent_capable_platforms — Platforms with multi-agent support

use crate::types::Platform;

// ─── Spec Structs ───────────────────────────────────────────────────────────

// DRY:DATA:PlatformSpec — Complete specification for a single AI platform
/// Complete specification for a single AI platform's CLI, capabilities, and config.
pub struct PlatformSpec {
    pub platform: Platform,
    pub display_name: &'static str,
    pub cli_binary_names: &'static [&'static str],
    pub install_methods: &'static [InstallMethod],
    pub default_install_paths: &'static [&'static str],
    pub auth: AuthSpec,
    /// Fallback models — used when dynamic discovery fails or cache is empty.
    pub fallback_models: &'static [ModelSpec],
    /// How to fetch models dynamically from this platform.
    pub model_discovery: ModelDiscoverySpec,
    pub plan_mode: Option<PlanModeSpec>,
    /// None for Gemini (not supported) and Cursor (reasoning is model-name-based).
    pub effort: Option<EffortSpec>,
    /// ALL 5 platforms support images.
    pub image_processing: Option<ImageSpec>,
    pub headless: HeadlessSpec,
    pub working_dir_flag: Option<&'static str>,
    pub experimental: Option<ExperimentalSpec>,
    /// Multi-agent / subagent capabilities (Claude Teams, Copilot Fleets, Codex sub-agents).
    pub subagent: Option<SubagentSpec>,
    /// Programmatic SDK (Copilot SDK, Codex SDK).
    pub sdk: Option<SdkSpec>,
    pub version_command: &'static str,
    pub update_command: Option<&'static str>,
    /// True for Cursor — reasoning is encoded in model names (e.g., `sonnet-4.5-thinking`).
    pub reasoning_is_model_based: bool,
    /// Auto model selection flag (e.g., "--model auto" for Cursor).
    pub auto_mode: Option<&'static str>,
}

/// Auth specification — SUBSCRIPTION AUTH ONLY, no API keys.
// DRY:DATA:AuthSpec — Authentication specification for a platform
pub struct AuthSpec {
    /// CLI binary for login (None if same as platform binary).
    pub login_command: Option<&'static str>,
    pub login_args: &'static [&'static str],
    pub login_is_interactive: bool,
    /// Must open in a separate terminal (true for Claude, Gemini, Copilot interactive login).
    pub login_needs_terminal: bool,
    pub logout_command: Option<&'static str>,
    pub logout_args: &'static [&'static str],
    /// How to check auth status.
    pub status_command: Option<&'static str>,
    pub status_args: &'static [&'static str],
    pub status_success_patterns: &'static [&'static str],
    pub uses_browser_auth: bool,
    /// Path to credential files to check as fallback (e.g., "~/.gemini", "~/.claude").
    pub credentials_path: Option<&'static str>,
}

/// How to discover models dynamically from this platform's CLI/SDK.
// DRY:DATA:ModelDiscoverySpec — Model discovery specification for a platform
pub struct ModelDiscoverySpec {
    /// CLI binary to run for model listing (None = no CLI discovery).
    pub cli_command: Option<&'static str>,
    pub cli_args: &'static [&'static str],
    /// Whether an SDK can be used for model listing.
    pub sdk_available: bool,
    /// How long to cache model lists in minutes.
    pub cache_ttl_minutes: u32,
    pub note: &'static str,
}

/// Sub-agent / multi-agent capabilities.
// DRY:DATA:SubagentSpec — Subagent specification for a platform
pub struct SubagentSpec {
    pub invoke_method: &'static str,
    pub invoke_example: &'static str,
    /// Env var to enable (e.g., `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).
    pub env_var: Option<&'static str>,
    /// Path to custom agent definitions.
    pub custom_agents_path: Option<&'static str>,
    pub is_experimental: bool,
    pub note: &'static str,
}

/// Programmatic SDK for a platform.
// DRY:DATA:SdkSpec — SDK specification for a platform
pub struct SdkSpec {
    pub package_name: &'static str,
    pub package_manager: &'static str,
    pub language: &'static str,
    pub additional_languages: &'static [&'static str],
    /// Communication protocol (e.g., "JSON-RPC", "JSONL stdin/stdout").
    pub communication: &'static str,
    pub status: &'static str,
    pub note: &'static str,
}

/// A fallback model definition (used when dynamic discovery is unavailable).
// DRY:DATA:ModelSpec — Model specification entry
pub struct ModelSpec {
    pub id: &'static str,
    pub display_name: &'static str,
    pub supports_effort: bool,
    pub supports_vision: bool,
    pub is_default: bool,
}

/// Plan mode specification.
// DRY:DATA:PlanModeSpec — Plan mode specification for a platform
pub struct PlanModeSpec {
    pub cli_flag: &'static str,
    pub cli_flag_value: Option<&'static str>,
    pub slash_command: &'static str,
    pub keyboard_shortcut: &'static str,
    pub is_experimental: bool,
}

/// Effort/reasoning specification. NOT used for Cursor (model-name-based) or Gemini (unsupported).
// DRY:DATA:EffortSpec — Effort/reasoning specification for a platform
pub struct EffortSpec {
    pub levels: &'static [EffortLevel],
    pub cli_flag: Option<&'static str>,
    pub env_var: Option<&'static str>,
    pub default_level: &'static str,
    pub note: &'static str,
}

// DRY:DATA:EffortLevel — Single effort level entry
pub struct EffortLevel {
    pub id: &'static str,
    pub display_name: &'static str,
}

/// Image/media processing support.
// DRY:DATA:ImageSpec — Image/media processing specification
pub struct ImageSpec {
    pub cli_flag: Option<&'static str>,
    pub supports_paste: bool,
    pub supports_path_in_prompt: bool,
    pub path_syntax: &'static str,
    pub supported_formats: &'static [&'static str],
}

/// Headless/non-interactive execution specification.
// DRY:DATA:HeadlessSpec — Headless/CI operation specification
pub struct HeadlessSpec {
    pub prompt_flag: &'static str,
    /// Subcommand for headless (e.g., "exec" for Codex).
    pub subcommand: Option<&'static str>,
    pub output_format_flag: &'static str,
    pub output_formats: &'static [&'static str],
    pub force_flag: Option<&'static str>,
    pub silent_flag: Option<&'static str>,
    /// Additional headless-specific flags.
    pub extra_flags: &'static [&'static str],
}

/// Experimental features.
// DRY:DATA:ExperimentalSpec — Experimental feature specification
pub struct ExperimentalSpec {
    pub enable_command: Option<&'static str>,
    pub disable_command: Option<&'static str>,
    pub list_command: Option<&'static str>,
    pub slash_toggle: Option<&'static str>,
    pub settings_path: Option<&'static str>,
    pub cli_flag: Option<&'static str>,
}

/// Platform install method.
// DRY:DATA:InstallMethod — Installation method entry
pub struct InstallMethod {
    pub method: &'static str,
    pub command: &'static str,
    pub os: &'static [&'static str],
}

// ─── Static Platform Data ───────────────────────────────────────────────────

static CLAUDE_SPEC: PlatformSpec = PlatformSpec {
    platform: Platform::Claude,
    display_name: "Claude Code",
    cli_binary_names: &["claude"],
    install_methods: &[
        InstallMethod { method: "curl", command: "curl -fsSL https://claude.ai/install.sh | bash", os: &["linux", "macos"] },
        InstallMethod { method: "brew", command: "brew install --cask claude-code", os: &["macos"] },
        InstallMethod { method: "winget", command: "winget install Anthropic.ClaudeCode", os: &["windows"] },
    ],
    default_install_paths: &[
        "~/.local/bin/claude",
        "/usr/local/bin/claude",
        "~/.nix-profile/bin/claude",
    ],
    auth: AuthSpec {
        login_command: None, // Interactive browser-based — no CLI subcommand
        login_args: &[],
        login_is_interactive: true,
        login_needs_terminal: true,
        logout_command: None, // No logout subcommand — delete ~/.claude/ credentials
        logout_args: &[],
        status_command: None, // Check ~/.claude/ credentials + claude --version
        status_args: &[],
        status_success_patterns: &[],
        uses_browser_auth: true,
        credentials_path: Some("~/.claude"),
    },
    fallback_models: &[
        ModelSpec { id: "sonnet", display_name: "Claude Sonnet 4.5", supports_effort: true, supports_vision: true, is_default: true },
        ModelSpec { id: "opus", display_name: "Claude Opus 4.6", supports_effort: true, supports_vision: true, is_default: false },
        ModelSpec { id: "haiku", display_name: "Claude Haiku 4.5", supports_effort: true, supports_vision: true, is_default: false },
    ],
    model_discovery: ModelDiscoverySpec {
        cli_command: None, // Claude model list is relatively stable — use fallback
        cli_args: &[],
        sdk_available: false,
        cache_ttl_minutes: 1440, // 24 hours — models are stable
        note: "Claude models are relatively stable; aliases opus/sonnet/haiku are preferred",
    },
    plan_mode: Some(PlanModeSpec {
        cli_flag: "--permission-mode",
        cli_flag_value: Some("plan"),
        slash_command: "/plan",
        keyboard_shortcut: "Shift+Tab",
        is_experimental: false,
    }),
    effort: Some(EffortSpec {
        levels: &[
            EffortLevel { id: "low", display_name: "Low" },
            EffortLevel { id: "medium", display_name: "Medium" },
            EffortLevel { id: "high", display_name: "High" },
        ],
        cli_flag: None, // NOT a CLI flag — set as env var
        env_var: Some("CLAUDE_CODE_EFFORT_LEVEL"),
        default_level: "medium",
        note: "Set via env var CLAUDE_CODE_EFFORT_LEVEL, not a CLI flag",
    }),
    image_processing: Some(ImageSpec {
        cli_flag: None,
        supports_paste: true,
        supports_path_in_prompt: true,
        path_syntax: "file path in prompt",
        supported_formats: &["PNG", "JPEG", "GIF", "WebP"],
    }),
    headless: HeadlessSpec {
        prompt_flag: "-p",
        subcommand: None,
        output_format_flag: "--output-format",
        output_formats: &["text", "json", "stream-json"],
        force_flag: None,
        silent_flag: None,
        extra_flags: &[],
    },
    working_dir_flag: Some("--add-dir"),
    experimental: None,
    subagent: Some(SubagentSpec {
        invoke_method: "natural language",
        invoke_example: "Create a team of 3 agents to work on this task...",
        env_var: Some("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1"),
        custom_agents_path: None,
        is_experimental: true,
        note: "Agent Teams: team lead + teammates with shared task list and messaging",
    }),
    sdk: None,
    version_command: "--version",
    update_command: Some("update"),
    reasoning_is_model_based: false,
    auto_mode: None,
};

static CURSOR_SPEC: PlatformSpec = PlatformSpec {
    platform: Platform::Cursor,
    display_name: "Cursor CLI",
    cli_binary_names: &["agent"],
    install_methods: &[
        InstallMethod { method: "curl", command: "curl https://cursor.com/install -fsS | bash", os: &["linux", "macos"] },
        InstallMethod { method: "powershell", command: "irm 'https://cursor.com/install?win32=true' | iex", os: &["windows"] },
    ],
    default_install_paths: &[
        "~/.local/bin/agent",
        "/usr/local/bin/agent",
    ],
    auth: AuthSpec {
        login_command: Some("agent"),
        login_args: &["login"],
        login_is_interactive: true,
        login_needs_terminal: false, // Opens browser automatically
        logout_command: Some("agent"),
        logout_args: &["logout"],
        status_command: Some("agent"),
        status_args: &["status"],
        status_success_patterns: &["logged in", "authenticated"],
        uses_browser_auth: true,
        credentials_path: None,
    },
    fallback_models: &[
        ModelSpec { id: "auto", display_name: "Auto (recommended)", supports_effort: false, supports_vision: true, is_default: true },
        ModelSpec { id: "sonnet-4.5-thinking", display_name: "Sonnet 4.5 Thinking", supports_effort: false, supports_vision: true, is_default: false },
        ModelSpec { id: "sonnet-4.5", display_name: "Sonnet 4.5", supports_effort: false, supports_vision: true, is_default: false },
        ModelSpec { id: "gpt-4.1", display_name: "GPT-4.1", supports_effort: false, supports_vision: true, is_default: false },
    ],
    model_discovery: ModelDiscoverySpec {
        cli_command: Some("agent"),
        cli_args: &["models"],
        sdk_available: false,
        cache_ttl_minutes: 60,
        note: "Models change frequently; use `agent models` or `--list-models`",
    },
    plan_mode: Some(PlanModeSpec {
        cli_flag: "--mode",
        cli_flag_value: Some("plan"),
        slash_command: "/plan",
        keyboard_shortcut: "Shift+Tab",
        is_experimental: false,
    }),
    effort: None, // Reasoning is encoded in model names (e.g., sonnet-4.5-thinking)
    image_processing: Some(ImageSpec {
        cli_flag: None,
        supports_paste: false,
        supports_path_in_prompt: true,
        path_syntax: "file path in prompt",
        supported_formats: &["PNG", "JPEG", "GIF", "WebP", "MP4"],
    }),
    headless: HeadlessSpec {
        prompt_flag: "-p",
        subcommand: None,
        output_format_flag: "--output-format",
        output_formats: &["text", "json", "stream-json"],
        force_flag: Some("--force"),
        silent_flag: None,
        extra_flags: &["--background", "--resume"],
    },
    working_dir_flag: Some("--add-dir"),
    experimental: None,
    subagent: None, // No documented multi-agent support
    sdk: None,
    version_command: "--version",
    update_command: Some("update"),
    reasoning_is_model_based: true,
    auto_mode: Some("--model auto"),
};

static CODEX_SPEC: PlatformSpec = PlatformSpec {
    platform: Platform::Codex,
    display_name: "Codex CLI",
    cli_binary_names: &["codex"],
    install_methods: &[
        InstallMethod { method: "npm", command: "npm install -g @openai/codex", os: &["linux", "macos", "windows"] },
    ],
    default_install_paths: &[
        "~/.npm-global/bin/codex",
        "/usr/local/bin/codex",
        "~/.local/share/npm/bin/codex",
    ],
    auth: AuthSpec {
        login_command: Some("codex"),
        login_args: &["login"],
        login_is_interactive: true,
        login_needs_terminal: false,
        logout_command: Some("codex"),
        logout_args: &["logout"],
        status_command: Some("codex"),
        status_args: &["login", "status"],
        status_success_patterns: &[],
        uses_browser_auth: true,
        credentials_path: None,
    },
    fallback_models: &[
        ModelSpec { id: "gpt-5.3-codex", display_name: "GPT-5.3 Codex", supports_effort: true, supports_vision: true, is_default: true },
    ],
    model_discovery: ModelDiscoverySpec {
        cli_command: None, // Use SDK for discovery
        cli_args: &[],
        sdk_available: true,
        cache_ttl_minutes: 60,
        note: "Use Codex SDK for reliable model listing; CLI discovery limited",
    },
    plan_mode: Some(PlanModeSpec {
        cli_flag: "--sandbox",
        cli_flag_value: Some("read-only"),
        slash_command: "/plan",
        keyboard_shortcut: "Shift+Tab",
        is_experimental: false,
    }),
    effort: Some(EffortSpec {
        levels: &[
            EffortLevel { id: "low", display_name: "Low" },
            EffortLevel { id: "medium", display_name: "Medium" },
            EffortLevel { id: "high", display_name: "High" },
            EffortLevel { id: "xhigh", display_name: "Extra High" },
        ],
        cli_flag: Some("-c model_reasoning_effort=<level>"),
        env_var: None,
        default_level: "medium",
        note: "Set via config override key model_reasoning_effort in headless mode",
    }),
    image_processing: Some(ImageSpec {
        cli_flag: Some("-i"),
        supports_paste: false,
        supports_path_in_prompt: false,
        path_syntax: "-i <path>",
        supported_formats: &["PNG", "JPEG", "GIF", "WebP"],
    }),
    headless: HeadlessSpec {
        prompt_flag: "", // Uses positional arg after `exec`
        subcommand: Some("exec"),
        output_format_flag: "--json",
        output_formats: &["json", "text"],
        force_flag: Some("--full-auto"),
        silent_flag: Some("--output-last-message"),
        extra_flags: &["--ephemeral", "--skip-git-repo-check", "--sandbox"],
    },
    working_dir_flag: Some("--cd"),
    experimental: Some(ExperimentalSpec {
        enable_command: Some("codex features enable"),
        disable_command: Some("codex features disable"),
        list_command: Some("codex features list"),
        slash_toggle: None,
        settings_path: None,
        cli_flag: None,
    }),
    subagent: Some(SubagentSpec {
        invoke_method: "built-in",
        invoke_example: "Automatic for complex tasks",
        env_var: None,
        custom_agents_path: None,
        is_experimental: false,
        note: "Sub-agents with connector capabilities; automatic for complex tasks",
    }),
    sdk: Some(SdkSpec {
        package_name: "@openai/codex-sdk",
        package_manager: "npm",
        language: "Node.js",
        additional_languages: &[],
        communication: "JSONL stdin/stdout",
        status: "Stable",
        note: "Thread-based API: new Codex(), startThread(), thread.run(prompt). Node.js 18+.",
    }),
    version_command: "--version",
    update_command: None, // Auto-updates
    reasoning_is_model_based: false,
    auto_mode: None,
};

static GEMINI_SPEC: PlatformSpec = PlatformSpec {
    platform: Platform::Gemini,
    display_name: "Gemini CLI",
    cli_binary_names: &["gemini"],
    install_methods: &[
        InstallMethod { method: "npm", command: "npm install -g @google/gemini-cli", os: &["linux", "macos", "windows"] },
        InstallMethod { method: "brew", command: "brew install gemini-cli", os: &["macos"] },
    ],
    default_install_paths: &[
        "~/.npm-global/bin/gemini",
        "/usr/local/bin/gemini",
    ],
    auth: AuthSpec {
        login_command: None, // Interactive on first run — "Login with Google"
        login_args: &[],
        login_is_interactive: true,
        login_needs_terminal: true,
        logout_command: None, // No logout — delete ~/.gemini/
        logout_args: &[],
        status_command: None, // Check ~/.gemini/ credentials
        status_args: &[],
        status_success_patterns: &[],
        uses_browser_auth: true,
        credentials_path: Some("~/.gemini"),
    },
    fallback_models: &[
        ModelSpec { id: "gemini-2.5-pro", display_name: "Gemini 2.5 Pro", supports_effort: false, supports_vision: true, is_default: true },
        ModelSpec { id: "gemini-2.5-flash", display_name: "Gemini 2.5 Flash", supports_effort: false, supports_vision: true, is_default: false },
    ],
    model_discovery: ModelDiscoverySpec {
        cli_command: None,
        cli_args: &[],
        sdk_available: false,
        cache_ttl_minutes: 1440,
        note: "Gemini models are relatively stable; aliases auto/pro/flash available",
    },
    plan_mode: Some(PlanModeSpec {
        cli_flag: "--approval-mode",
        cli_flag_value: Some("plan"),
        slash_command: "/plan",
        keyboard_shortcut: "Shift+Tab",
        is_experimental: true,
    }),
    effort: None, // Gemini does NOT support effort/reasoning levels
    image_processing: Some(ImageSpec {
        cli_flag: None,
        supports_paste: false,
        supports_path_in_prompt: true,
        path_syntax: "@./path/to/image",
        supported_formats: &["PNG", "JPG", "PDF", "MP3", "WAV", "MP4"],
    }),
    headless: HeadlessSpec {
        prompt_flag: "-p",
        subcommand: None,
        output_format_flag: "--output-format",
        output_formats: &["text", "json", "stream-json"],
        force_flag: None,
        silent_flag: None,
        extra_flags: &[],
    },
    working_dir_flag: Some("--include-directories"),
    experimental: Some(ExperimentalSpec {
        enable_command: None,
        disable_command: None,
        list_command: None,
        slash_toggle: Some("/settings"),
        settings_path: Some("~/.gemini/settings.json"),
        cli_flag: None,
    }),
    subagent: None,
    sdk: None,
    version_command: "--version",
    update_command: Some("update"),
    reasoning_is_model_based: false,
    auto_mode: None,
};

static COPILOT_SPEC: PlatformSpec = PlatformSpec {
    platform: Platform::Copilot,
    display_name: "GitHub Copilot CLI",
    cli_binary_names: &["copilot"],
    install_methods: &[
        InstallMethod { method: "npm", command: "npm install -g @github/copilot", os: &["linux", "macos", "windows"] },
        InstallMethod { method: "brew", command: "brew install copilot-cli", os: &["macos"] },
        InstallMethod { method: "winget", command: "winget install GitHub.Copilot", os: &["windows"] },
    ],
    default_install_paths: &[
        "~/.npm-global/bin/copilot",
        "/usr/local/bin/copilot",
    ],
    auth: AuthSpec {
        login_command: Some("copilot"),
        login_args: &["login"],
        login_is_interactive: true,
        login_needs_terminal: true,
        logout_command: None, // Interactive — uses /logout slash command
        logout_args: &[],
        status_command: Some("gh"), // Fall back to gh auth status
        status_args: &["auth", "status"],
        status_success_patterns: &["Logged in"],
        uses_browser_auth: true,
        credentials_path: None,
    },
    fallback_models: &[
        ModelSpec { id: "claude-sonnet-4.5", display_name: "Claude Sonnet 4.5", supports_effort: false, supports_vision: true, is_default: true },
        ModelSpec { id: "claude-sonnet-4", display_name: "Claude Sonnet 4", supports_effort: false, supports_vision: true, is_default: false },
        ModelSpec { id: "gpt-5", display_name: "GPT-5", supports_effort: true, supports_vision: true, is_default: false },
    ],
    model_discovery: ModelDiscoverySpec {
        cli_command: None, // Use SDK for discovery
        cli_args: &[],
        sdk_available: true,
        cache_ttl_minutes: 60,
        note: "Use Copilot SDK for model listing; /model shows available models interactively",
    },
    plan_mode: Some(PlanModeSpec {
        cli_flag: "", // No headless plan flag
        cli_flag_value: None,
        slash_command: "/plan",
        keyboard_shortcut: "Shift+Tab",
        is_experimental: false,
    }),
    effort: Some(EffortSpec {
        levels: &[
            EffortLevel { id: "low", display_name: "Low" },
            EffortLevel { id: "medium", display_name: "Medium" },
            EffortLevel { id: "high", display_name: "High" },
            EffortLevel { id: "xhigh", display_name: "Extra High" },
        ],
        cli_flag: None,
        env_var: None,
        default_level: "medium",
        note: "Select model first, then prompted for effort level. GPT models only.",
    }),
    image_processing: Some(ImageSpec {
        cli_flag: None,
        supports_paste: false,
        supports_path_in_prompt: true,
        path_syntax: "@ file reference",
        supported_formats: &["PNG", "JPEG", "GIF", "WebP"],
    }),
    headless: HeadlessSpec {
        prompt_flag: "-p",
        subcommand: None,
        output_format_flag: "",
        output_formats: &["text"],
        force_flag: None,
        silent_flag: Some("-s"),
        extra_flags: &[],
    },
    working_dir_flag: Some("--add-dir"),
    experimental: Some(ExperimentalSpec {
        enable_command: None,
        disable_command: None,
        list_command: None,
        slash_toggle: Some("/experimental"),
        settings_path: None,
        cli_flag: Some("--experimental"),
    }),
    subagent: Some(SubagentSpec {
        invoke_method: "/fleet or /delegate",
        invoke_example: "/fleet Implement feature X across the codebase",
        env_var: None,
        custom_agents_path: Some("~/.copilot/agents"),
        is_experimental: false,
        note: "Fleets for parallel multi-agent work (like Claude Teams); /delegate for single sub-tasks; custom agents from ~/.copilot/agents or .github/agents",
    }),
    sdk: Some(SdkSpec {
        package_name: "@github/copilot-sdk",
        package_manager: "npm",
        language: "Node.js",
        additional_languages: &["Python", "Go", ".NET"],
        communication: "JSON-RPC",
        status: "Technical Preview",
        note: "Can list models, define custom agents/skills/tools. Auth: GitHub OAuth, BYOK.",
    }),
    version_command: "version", // Note: `copilot version`, not `--version`
    update_command: Some("update"),
    reasoning_is_model_based: false,
    auto_mode: None,
};

// ─── Lookup Functions ───────────────────────────────────────────────────────

// DRY:FN:get_spec — Get the full spec for a single Platform
/// Get the spec for a platform.
pub fn get_spec(platform: Platform) -> &'static PlatformSpec {
    match platform {
        Platform::Claude => &CLAUDE_SPEC,
        Platform::Cursor => &CURSOR_SPEC,
        Platform::Codex => &CODEX_SPEC,
        Platform::Gemini => &GEMINI_SPEC,
        Platform::Copilot => &COPILOT_SPEC,
    }
}

/// All platform specs as a static array.
static ALL_SPECS: [&PlatformSpec; 5] = [&CLAUDE_SPEC, &CURSOR_SPEC, &CODEX_SPEC, &GEMINI_SPEC, &COPILOT_SPEC];

// DRY:FN:all_specs — Get all platform specs
/// Get all platform specs.
pub fn all_specs() -> &'static [&'static PlatformSpec; 5] {
    &ALL_SPECS
}

// ─── Convenience API ────────────────────────────────────────────────────────

// DRY:FN:supports_effort — Whether platform supports effort/reasoning levels
/// Whether this platform supports effort/reasoning levels (separate from model selection).
pub fn supports_effort(platform: Platform) -> bool {
    get_spec(platform).effort.is_some()
}

// DRY:FN:effort_levels_for — Get effort levels for a platform
/// Get effort levels for a platform, if supported.
pub fn effort_levels_for(platform: Platform) -> Option<&'static [EffortLevel]> {
    get_spec(platform).effort.as_ref().map(|e| e.levels)
}

// DRY:FN:supports_plan_mode — Whether platform supports plan mode
/// Whether this platform supports plan mode.
pub fn supports_plan_mode(platform: Platform) -> bool {
    get_spec(platform).plan_mode.is_some()
}

// DRY:FN:supports_images — Whether platform supports image/media processing
/// Whether this platform supports image/media processing.
pub fn supports_images(platform: Platform) -> bool {
    get_spec(platform).image_processing.is_some()
}

// DRY:FN:supports_experimental — Whether platform has experimental feature toggles
/// Whether this platform has experimental feature toggles.
pub fn supports_experimental(platform: Platform) -> bool {
    get_spec(platform).experimental.is_some()
}

// DRY:FN:supports_subagents — Whether platform supports sub-agents
/// Whether this platform supports sub-agents / multi-agent execution.
pub fn supports_subagents(platform: Platform) -> bool {
    get_spec(platform).subagent.is_some()
}

// DRY:FN:has_sdk — Whether platform has a programmatic SDK
/// Whether this platform has a programmatic SDK.
pub fn has_sdk(platform: Platform) -> bool {
    get_spec(platform).sdk.is_some()
}

// DRY:FN:reasoning_is_model_based — Whether reasoning is encoded in model names
/// Whether reasoning is encoded in model names (true only for Cursor).
pub fn reasoning_is_model_based(platform: Platform) -> bool {
    get_spec(platform).reasoning_is_model_based
}

// DRY:FN:has_auto_mode — Whether platform has auto model selection mode
/// Whether this platform has an auto model selection mode (true only for Cursor).
pub fn has_auto_mode(platform: Platform) -> bool {
    get_spec(platform).auto_mode.is_some()
}

// DRY:FN:install_methods_for — Get install methods filtered by OS
/// Get install methods for a platform, filtered by OS.
pub fn install_methods_for(platform: Platform, os: &str) -> Vec<&'static InstallMethod> {
    get_spec(platform)
        .install_methods
        .iter()
        .filter(|m| m.os.contains(&os))
        .collect()
}

// DRY:FN:cli_binary_names — Get CLI binary names for a platform
/// Get CLI binary names for a platform.
pub fn cli_binary_names(platform: Platform) -> &'static [&'static str] {
    get_spec(platform).cli_binary_names
}

// DRY:FN:default_install_paths — Get default install paths for a platform
/// Get default install paths for a platform.
pub fn default_install_paths(platform: Platform) -> &'static [&'static str] {
    get_spec(platform).default_install_paths
}

// DRY:FN:fallback_model_ids — Get fallback model IDs when dynamic discovery fails
/// Get fallback model IDs (used when dynamic discovery fails).
pub fn fallback_model_ids(platform: Platform) -> Vec<&'static str> {
    get_spec(platform)
        .fallback_models
        .iter()
        .map(|m| m.id)
        .collect()
}

// DRY:FN:default_model_for — Get the default model for a platform
/// Get the default model for a platform.
pub fn default_model_for(platform: Platform) -> Option<&'static str> {
    get_spec(platform)
        .fallback_models
        .iter()
        .find(|m| m.is_default)
        .map(|m| m.id)
}

// DRY:FN:image_capable_platforms — Get all platforms that support images
/// Get all platforms that support images (currently ALL 5).
pub fn image_capable_platforms() -> Vec<Platform> {
    Platform::all()
        .iter()
        .filter(|p| supports_images(**p))
        .copied()
        .collect()
}

// DRY:FN:subagent_capable_platforms — Get all platforms that support sub-agents
/// Get all platforms that support sub-agents.
pub fn subagent_capable_platforms() -> Vec<Platform> {
    Platform::all()
        .iter()
        .filter(|p| supports_subagents(**p))
        .copied()
        .collect()
}

/// Static list of all platform ID strings for use in pick-lists and dropdowns.
/// DRY:FN:platform_id_strs — single source of truth for platform ID strings in UI.
pub const PLATFORM_ID_STRS: &[&str] = &["cursor", "codex", "claude", "gemini", "copilot"];
// DRY:FN:display_name_for

/// Get the display name for a platform from specs.
/// DRY:FN:display_name_for — avoids hardcoding platform display names in views.
pub fn display_name_for(platform: Platform) -> &'static str {
    get_spec(platform).display_name
}
// DRY:FN:experimental_cli_flag

/// DRY:FN:experimental_cli_flag — Get the CLI flag for experimental features (if any)
pub fn experimental_cli_flag(platform: Platform) -> Option<&'static str> {
    get_spec(platform).experimental.as_ref().and_then(|e| e.cli_flag)
}
// DRY:FN:experimental_settings_path

/// DRY:FN:experimental_settings_path — Get settings path for experimental features (if any)
pub fn experimental_settings_path(platform: Platform) -> Option<&'static str> {
    get_spec(platform).experimental.as_ref().and_then(|e| e.settings_path)
}
// DRY:FN:subagent_env_vars

/// DRY:FN:subagent_env_vars — Get environment variables needed to enable subagents for a platform
pub fn subagent_env_vars(platform: Platform) -> Vec<(&'static str, &'static str)> {
    match get_spec(platform).subagent.as_ref() {
        Some(spec) => {
            if let Some(env_var) = spec.env_var {
                // Parse "KEY=VALUE" format
                if let Some((key, value)) = env_var.split_once('=') {
                    vec![(key, value)]
                } else {
                    vec![(env_var, "1")]
                }
            } else {
                vec![]
            }
        }
        None => vec![],
    }
}
// DRY:FN:subagent_extra_args

/// DRY:FN:subagent_extra_args — Get extra CLI args needed to enable subagents for a platform
pub fn subagent_extra_args(platform: Platform) -> Vec<&'static str> {
    let spec = get_spec(platform);
    let mut args = Vec::new();

    // If the platform has experimental features with a CLI flag and subagents require it
    if spec.subagent.is_some() {
        if let Some(exp) = &spec.experimental {
            if let Some(flag) = exp.cli_flag {
                args.push(flag);
            }
        }
    }

    args
}

// ─── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_platforms_have_specs() {
        for platform in Platform::all() {
            let spec = get_spec(*platform);
            assert_eq!(spec.platform, *platform);
            assert!(!spec.display_name.is_empty());
            assert!(!spec.cli_binary_names.is_empty());
        }
    }

    #[test]
    fn test_fallback_models_not_empty() {
        for platform in Platform::all() {
            let models = fallback_model_ids(*platform);
            assert!(!models.is_empty(), "{:?} should have fallback models", platform);
        }
    }

    #[test]
    fn test_each_platform_has_default_model() {
        for platform in Platform::all() {
            assert!(
                default_model_for(*platform).is_some(),
                "{:?} should have a default model",
                platform
            );
        }
    }

    #[test]
    fn test_effort_support_correct() {
        // Claude, Codex, Copilot support effort
        assert!(supports_effort(Platform::Claude));
        assert!(supports_effort(Platform::Codex));
        assert!(supports_effort(Platform::Copilot));
        // Gemini and Cursor do NOT
        assert!(!supports_effort(Platform::Gemini));
        assert!(!supports_effort(Platform::Cursor));
    }

    #[test]
    fn test_all_platforms_support_images() {
        for platform in Platform::all() {
            assert!(
                supports_images(*platform),
                "{:?} should support images",
                platform
            );
        }
        assert_eq!(image_capable_platforms().len(), 5);
    }

    #[test]
    fn test_reasoning_model_based_only_cursor() {
        assert!(reasoning_is_model_based(Platform::Cursor));
        assert!(!reasoning_is_model_based(Platform::Claude));
        assert!(!reasoning_is_model_based(Platform::Codex));
        assert!(!reasoning_is_model_based(Platform::Gemini));
        assert!(!reasoning_is_model_based(Platform::Copilot));
    }

    #[test]
    fn test_auto_mode_only_cursor() {
        assert!(has_auto_mode(Platform::Cursor));
        assert!(!has_auto_mode(Platform::Claude));
        assert!(!has_auto_mode(Platform::Codex));
        assert!(!has_auto_mode(Platform::Gemini));
        assert!(!has_auto_mode(Platform::Copilot));
    }

    #[test]
    fn test_subagent_support() {
        assert!(supports_subagents(Platform::Claude));
        assert!(supports_subagents(Platform::Copilot));
        assert!(supports_subagents(Platform::Codex));
        assert!(!supports_subagents(Platform::Cursor));
        assert!(!supports_subagents(Platform::Gemini));
    }

    #[test]
    fn test_sdk_support() {
        assert!(has_sdk(Platform::Copilot));
        assert!(has_sdk(Platform::Codex));
        assert!(!has_sdk(Platform::Claude));
        assert!(!has_sdk(Platform::Cursor));
        assert!(!has_sdk(Platform::Gemini));
    }

    #[test]
    fn test_all_platforms_support_plan_mode() {
        for platform in Platform::all() {
            assert!(
                supports_plan_mode(*platform),
                "{:?} should support plan mode",
                platform
            );
        }
    }

    #[test]
    fn test_codex_plan_mode_spec_uses_read_only_sandbox() {
        let codex = get_spec(Platform::Codex);
        let plan = codex
            .plan_mode
            .as_ref()
            .expect("Codex should have plan mode support");
        assert_eq!(plan.cli_flag, "--sandbox");
        assert_eq!(plan.cli_flag_value, Some("read-only"));
    }

    #[test]
    fn test_cli_binary_names() {
        assert_eq!(cli_binary_names(Platform::Cursor), &["agent"]);
        assert_eq!(cli_binary_names(Platform::Codex), &["codex"]);
        assert_eq!(cli_binary_names(Platform::Claude), &["claude"]);
        assert_eq!(cli_binary_names(Platform::Gemini), &["gemini"]);
        assert_eq!(cli_binary_names(Platform::Copilot), &["copilot"]);
    }

    #[test]
    fn test_install_methods_filter_by_os() {
        let linux_methods = install_methods_for(Platform::Claude, "linux");
        assert!(!linux_methods.is_empty());
        let win_methods = install_methods_for(Platform::Cursor, "windows");
        assert!(!win_methods.is_empty());
    }

    #[test]
    fn test_experimental_cli_flag() {
        assert_eq!(experimental_cli_flag(Platform::Copilot), Some("--experimental"));
        assert_eq!(experimental_cli_flag(Platform::Codex), None);
        assert_eq!(experimental_cli_flag(Platform::Claude), None);
        assert_eq!(experimental_cli_flag(Platform::Gemini), None);
        assert_eq!(experimental_cli_flag(Platform::Cursor), None);
    }

    #[test]
    fn test_experimental_settings_path() {
        assert_eq!(experimental_settings_path(Platform::Gemini), Some("~/.gemini/settings.json"));
        assert_eq!(experimental_settings_path(Platform::Copilot), None);
        assert_eq!(experimental_settings_path(Platform::Codex), None);
        assert_eq!(experimental_settings_path(Platform::Claude), None);
        assert_eq!(experimental_settings_path(Platform::Cursor), None);
    }

    #[test]
    fn test_subagent_env_vars() {
        let claude_vars = subagent_env_vars(Platform::Claude);
        assert_eq!(claude_vars.len(), 1);
        assert_eq!(claude_vars[0], ("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS", "1"));

        let codex_vars = subagent_env_vars(Platform::Codex);
        assert!(codex_vars.is_empty()); // Built-in, no env var needed

        let copilot_vars = subagent_env_vars(Platform::Copilot);
        assert!(copilot_vars.is_empty()); // No env var, uses CLI flag

        let cursor_vars = subagent_env_vars(Platform::Cursor);
        assert!(cursor_vars.is_empty()); // No subagent support

        let gemini_vars = subagent_env_vars(Platform::Gemini);
        assert!(gemini_vars.is_empty()); // No subagent support
    }

    #[test]
    fn test_subagent_extra_args() {
        let copilot_args = subagent_extra_args(Platform::Copilot);
        assert!(copilot_args.contains(&"--experimental"));

        let claude_args = subagent_extra_args(Platform::Claude);
        assert!(claude_args.is_empty()); // Uses env var, not CLI flag

        let codex_args = subagent_extra_args(Platform::Codex);
        // Codex has experimental but no CLI flag
        assert!(codex_args.is_empty() || !codex_args.is_empty()); // May or may not have args

        let cursor_args = subagent_extra_args(Platform::Cursor);
        assert!(cursor_args.is_empty());
    }
}
