//! Central tooltip text store
//!
//! Provides tooltip text for all fields in the application with both
//! Expert and ELI5 (Explain Like I'm 5) variants.

use std::collections::HashMap;

/// Tooltip variant - Expert (concise, technical) or ELI5 (friendly, detailed)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TooltipVariant {
    Expert,
    Eli5,
}

/// Tooltip text entry with both Expert and ELI5 variants
#[derive(Debug, Clone)]
pub struct TooltipEntry {
    pub expert: &'static str,
    pub eli5: &'static str,
}

impl TooltipEntry {
    pub const fn new(expert: &'static str, eli5: &'static str) -> Self {
        Self { expert, eli5 }
    }

    pub fn get(&self, variant: TooltipVariant) -> &'static str {
        match variant {
            TooltipVariant::Expert => self.expert,
            TooltipVariant::Eli5 => self.eli5,
        }
    }
}

/// Get tooltip text for a given key and variant
pub fn get_tooltip(key: &str, variant: TooltipVariant) -> Option<&'static str> {
    TOOLTIPS.get(key).map(|entry| entry.get(variant))
}

// Lazy static map of all tooltips
use once_cell::sync::Lazy;

static TOOLTIPS: Lazy<HashMap<&'static str, TooltipEntry>> = Lazy::new(|| {
    let mut map = HashMap::new();

    // ═══════════════════════════════════════════════════════════════
    // Interview Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
            "interview.primary_platform",
            TooltipEntry::new(
                "AI service provider for interview conductor",
                "The AI service that will conduct your interview. Different platforms have different strengths. Claude is great for detailed analysis, Cursor is fast for code-related questions."
            )
        );

    map.insert(
            "interview.vision_provider",
            TooltipEntry::new(
                "Preferred vision provider for image references",
                "If you attach images as reference materials, this setting chooses which platform should be preferred for vision-capable work. The UI will only offer platforms that are detected as vision-capable."
            )
        );

    map.insert(
            "interview.primary_model",
            TooltipEntry::new(
                "Model identifier (e.g., claude-sonnet-4-5-20250929)",
                "The specific AI model to use. For Claude, try 'claude-sonnet-4-5-20250929' for a good balance of speed and quality, or 'claude-opus-4-6' for maximum thoroughness."
            )
        );

    map.insert(
            "interview.reasoning_level",
            TooltipEntry::new(
                "Inference depth: low (fast) to max (thorough)",
                "How hard the AI thinks about each question. 'Low' is fast but may miss nuance. 'High' takes longer but catches more edge cases. 'Max' is the most thorough but slowest and uses the most quota."
            )
        );

    map.insert(
            "interview.backup_platforms",
            TooltipEntry::new(
                "Fallback providers for quota exhaustion",
                "If your primary AI runs out of quota (usage limit), the system automatically switches to these backup platforms in order. Add at least one backup to avoid interruptions."
            )
        );

    map.insert(
            "interview.max_questions_per_phase",
            TooltipEntry::new(
                "Question count per domain (3-15, default 8)",
                "How many questions the AI asks in each interview domain (like 'Security' or 'Architecture'). More questions = more thorough but longer interview. 8 is a good balance."
            )
        );

    map.insert(
            "interview.first_principles",
            TooltipEntry::new(
                "Challenge assumptions before acceptance",
                "When enabled, the AI challenges your assumptions before accepting them. Instead of just asking 'which database?', it first asks 'do you actually need a database? what problem are you solving?' Recommended for new projects where requirements aren't fully baked."
            )
        );

    map.insert(
            "interview.architecture_confirmation",
            TooltipEntry::new(
                "Verify version compatibility and dependencies",
                "When enabled, the AI double-checks every technology version and dependency for compatibility. Catches gotchas like 'React 19 doesn't work with that CSS library version.' Strongly recommended - these small mismatches cause BIG problems later."
            )
        );

    map.insert(
            "interview.playwright_requirements",
            TooltipEntry::new(
                "Generate E2E test specifications",
                "When enabled, the interview generates ready-to-implement Playwright end-to-end test specifications. Playwright is a tool that simulates a real user clicking through your app to verify everything works. Essential for the autonomous build process."
            )
        );

    map.insert(
            "interview.generate_agents_md",
            TooltipEntry::new(
                "Create starter guide for AI agents",
                "Creates a starter guide document for the AI agents based on your interview answers. This helps agents know your preferences, tech stack, and conventions from the very first task."
            )
        );

    map.insert(
            "interview.interaction_mode",
            TooltipEntry::new(
                "Expert (concise) vs ELI5 (explained) mode",
                "Expert mode: concise questions, assumes you know technical terms. ELI5 (Explain Like I'm 5) mode: every question comes with a plain-English explanation of what it means and why it matters."
            )
        );

    map.insert(
            "interview.output_dir",
            TooltipEntry::new(
                "Interview results output directory",
                "Directory where interview results and generated artifacts will be saved. Defaults to .puppet-master/interview in your project."
            )
        );

    // ═══════════════════════════════════════════════════════════════
    // Wizard Step 0: Project Setup
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "wizard.project_type",
        TooltipEntry::new(
            "Choose between greenfield or existing codebase",
            "New Project: Starting fresh from scratch. Existing Project: Adding features or making changes to code that already exists."
        )
    );

    map.insert(
        "wizard.project_name",
        TooltipEntry::new(
            "Project identifier (lowercase, hyphens ok)",
            "The name of your project. Use lowercase letters and hyphens instead of spaces, like 'my-awesome-app'. This becomes your folder name and GitHub repo name."
        )
    );

    map.insert(
        "wizard.project_path",
        TooltipEntry::new(
            "Local directory where project files will live",
            "The folder on your computer where all your project files will be stored. The system will create this folder if it doesn't exist yet."
        )
    );

    map.insert(
        "wizard.github_repo",
        TooltipEntry::new(
            "Link to GitHub for version control and collaboration",
            "A GitHub repository is like a shared folder in the cloud where all your code lives. It tracks every change, lets multiple people work together, and keeps backups. You can create one automatically or connect an existing one."
        )
    );

    map.insert(
        "wizard.github_url",
        TooltipEntry::new(
            "GitHub repository URL (https://github.com/user/repo)",
            "The web address of your GitHub repository. Should look like 'https://github.com/your-username/your-repo-name'. Copy and paste this from your browser."
        )
    );

    map.insert(
        "wizard.github_visibility",
        TooltipEntry::new(
            "Public (anyone can see) or Private (invite-only)",
            "Public: Anyone on the internet can see your code. Private: Only people you invite can see it. Most personal projects start private until ready to share."
        )
    );

    map.insert(
        "wizard.use_interview",
        TooltipEntry::new(
            "Enable interactive AI-driven requirements gathering",
            "When enabled, an AI interviewer will ask you detailed questions to build a complete project specification. This ensures zero ambiguity and catches requirements gaps early. Recommended for all new projects. If disabled, you'll provide requirements as a text document."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Wizard Tier Configuration
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "tier.platform",
        TooltipEntry::new(
            "AI service provider for this tier",
            "The AI service used at this level. Different tiers can use different AI services. Claude is best for complex reasoning, Cursor is fast for code, Copilot is good for quick iterations."
        )
    );

    map.insert(
        "tier.model",
        TooltipEntry::new(
            "Specific AI model identifier",
            "The exact AI brain to use. Each platform offers different models with different capabilities. Larger models are smarter but slower and more expensive."
        )
    );

    map.insert(
        "tier.reasoning",
        TooltipEntry::new(
            "Inference depth: low/medium/high",
            "How hard the AI thinks before responding. Low is fast but simple. Medium balances speed and quality. High takes longer but catches edge cases and thinks more deeply about problems."
        )
    );

    map.insert(
        "tier.plan_mode",
        TooltipEntry::new(
            "Enable multi-step planning before execution",
            "When enabled, the AI creates a detailed plan before writing code. This prevents mistakes but adds thinking time. Recommended for complex tasks, optional for simple iterations."
        )
    );

    map.insert(
        "tier.ask_mode",
        TooltipEntry::new(
            "Allow AI to ask clarifying questions",
            "When enabled, the AI can ask you questions if something is unclear or ambiguous. This prevents wrong assumptions but requires you to be available. Turn off for overnight autonomous runs."
        )
    );

    map.insert(
        "tier.output_format",
        TooltipEntry::new(
            "Response format: markdown/json/yaml",
            "How the AI formats its responses. Markdown is human-readable text with formatting. JSON is structured data for machines. YAML is structured but easier to read than JSON."
        )
    );

    map.insert(
        "tier.task_failure_style",
        TooltipEntry::new(
            "Retry strategy when a tier fails",
            "What to do when the AI fails at this tier. Spawn new agent is safest; continue same agent can preserve context; skip retries moves on quickly."
        )
    );

    map.insert(
        "tier.max_iterations",
        TooltipEntry::new(
            "Maximum attempts per item",
            "How many times the system will retry before giving up on this tier item. Higher is more resilient but can burn quota."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Budget Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "budget.max_calls_per_run",
        TooltipEntry::new(
            "API call limit per orchestration session",
            "Maximum number of times the system can call AI services in a single run. Each question to the AI is one call. Set limits to prevent runaway costs. 100 calls can cost $5-50 depending on the model."
        )
    );

    map.insert(
        "budget.max_calls_per_hour",
        TooltipEntry::new(
            "API call rate limit per hour",
            "Maximum AI calls allowed per hour. Prevents burning through your budget too quickly. Useful for long-running autonomous builds that span multiple hours."
        )
    );

    map.insert(
        "budget.max_calls_per_day",
        TooltipEntry::new(
            "API call rate limit per day",
            "Maximum AI calls allowed in a 24-hour period. Safety net for multi-day autonomous builds. Set this based on your monthly AI service budget divided by 30."
        )
    );

    map.insert(
        "budget.unlimited_auto_mode",
        TooltipEntry::new(
            "Disable budget limits (use with caution)",
            "WARNING: When enabled, the system ignores all budget limits and keeps calling AI services until the task completes. Only use if you trust the AI completely and have unlimited funds. Can get very expensive."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Orchestrator Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "orchestrator.log_level",
        TooltipEntry::new(
            "Verbosity: error/warn/info/debug/trace",
            "How much detail to log. Error: only failures. Warn: problems that didn't stop execution. Info: major milestones. Debug: detailed step-by-step. Trace: everything including internal plumbing."
        )
    );

    map.insert(
        "orchestrator.process_timeout",
        TooltipEntry::new(
            "Max milliseconds before killing hung processes",
            "How long to wait before forcibly terminating a stuck AI agent or subprocess. Set higher for slow models or complex tasks. 60000ms = 1 minute."
        )
    );

    map.insert(
        "orchestrator.parallel_iterations",
        TooltipEntry::new(
            "Enable concurrent execution of independent tasks",
            "When enabled, multiple AI agents can work on different parts of your project simultaneously. Faster but uses more resources and can be harder to debug if something goes wrong."
        )
    );

    map.insert(
        "orchestrator.intensive_logging",
        TooltipEntry::new(
            "Log all AI prompts and responses to disk",
            "Records every single conversation with the AI to files. Essential for debugging why the AI made certain decisions, but generates massive log files quickly."
        )
    );

    map.insert(
        "orchestrator.kill_agent_on_failure",
        TooltipEntry::new(
            "Terminate stuck agents rather than retry",
            "When enabled, failed agents are immediately killed instead of retrying. Prevents infinite loops but may abandon recoverable tasks."
        )
    );

    map.insert(
        "orchestrator.enable_parallel",
        TooltipEntry::new(
            "Allow parallel phase/task execution",
            "Execute multiple phases or tasks at the same time when they don't depend on each other. Dramatically faster but requires more system resources."
        )
    );

    map.insert(
        "orchestrator.max_parallel_phases",
        TooltipEntry::new(
            "Maximum concurrent phases (0 = unlimited)",
            "How many high-level project phases can run at once. Higher = faster but harder to track. Most projects run 1-3 phases in parallel."
        )
    );

    map.insert(
        "orchestrator.max_parallel_tasks",
        TooltipEntry::new(
            "Maximum concurrent tasks (0 = unlimited)",
            "How many individual tasks can run simultaneously. Each task is one AI agent working on one problem. Higher = faster but more resource-intensive."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Memory (Checkpointing) Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "memory.enabled",
        TooltipEntry::new(
            "Enable periodic state snapshots",
            "Save progress snapshots so you can resume if the system crashes or you stop the build. Like video game save points. Strongly recommended for long builds."
        )
    );

    map.insert(
        "memory.interval_seconds",
        TooltipEntry::new(
            "Seconds between automatic checkpoints",
            "How often to save progress. Shorter intervals mean less lost work if something crashes, but more disk writes. 300 seconds (5 minutes) is a good balance."
        )
    );

    map.insert(
        "memory.max_checkpoints",
        TooltipEntry::new(
            "Number of checkpoint files to retain",
            "How many old snapshots to keep. Older checkpoints are deleted. 10 checkpoints at 5-minute intervals gives you a 50-minute undo history."
        )
    );

    map.insert(
        "memory.on_subtask_complete",
        TooltipEntry::new(
            "Save after each subtask finishes",
            "Create a checkpoint every time a subtask completes successfully. More granular save points but more disk writes. Recommended for critical builds."
        )
    );

    map.insert(
        "memory.on_shutdown",
        TooltipEntry::new(
            "Save state when orchestrator stops",
            "Always save progress when the system shuts down gracefully. Ensures you can resume even if you manually stop the build."
        )
    );

    map.insert(
        "memory.progress_file",
        TooltipEntry::new(
            "Path to progress.txt",
            "Where the orchestrator writes short-term progress notes (a running narrative of what’s happening)."
        )
    );

    map.insert(
        "memory.agents_file",
        TooltipEntry::new(
            "Path to AGENTS.md",
            "Where long-term agent guidance lives (project rules, gotchas, patterns). Agents read this to stay consistent."
        )
    );

    map.insert(
        "memory.prd_file",
        TooltipEntry::new(
            "Path to prd.json work queue",
            "The PRD/work-queue file the orchestrator reads to decide what to do next."
        )
    );

    map.insert(
        "memory.multi_level_agents",
        TooltipEntry::new(
            "Enable per-tier agent memory",
            "When enabled, each tier can have its own agent context/memory behavior. Leave on for most runs."
        )
    );

    map.insert(
        "checkpointing.enabled",
        TooltipEntry::new(
            "Enable periodic checkpoints",
            "Save state snapshots periodically so you can resume safely if the run crashes or is stopped."
        )
    );

    map.insert(
        "checkpointing.interval_seconds",
        TooltipEntry::new(
            "Seconds between automatic checkpoints",
            "How often to write checkpoint files. Smaller numbers = safer but more disk writes."
        )
    );

    map.insert(
        "checkpointing.max_checkpoints",
        TooltipEntry::new(
            "How many checkpoints to keep",
            "Older checkpoints beyond this count are deleted to avoid filling disk."
        )
    );

    map.insert(
        "checkpointing.on_subtask_complete",
        TooltipEntry::new(
            "Checkpoint on subtask completion",
            "When enabled, write a checkpoint every time a subtask completes successfully."
        )
    );

    map.insert(
        "checkpointing.on_shutdown",
        TooltipEntry::new(
            "Checkpoint on shutdown",
            "When enabled, write a checkpoint when the orchestrator shuts down cleanly."
        )
    );

    map.insert(
        "loop_guard.enabled",
        TooltipEntry::new(
            "Enable loop detection",
            "Detect repeated failures/retries and stop the run before it burns unlimited quota."
        )
    );

    map.insert(
        "loop_guard.max_repetitions",
        TooltipEntry::new(
            "Max repeated cycles",
            "How many times the system can repeat the same pattern before the loop guard stops execution."
        )
    );

    map.insert(
        "loop_guard.suppress_reply_relay",
        TooltipEntry::new(
            "Hide repeated reply relays",
            "When enabled, the UI/network relay will suppress repetitive reply spam while a loop is detected."
        )
    );

    map.insert(
        "cli_paths.cursor",
        TooltipEntry::new(
            "Path to Cursor CLI binary",
            "Override where the system looks for the Cursor CLI. Leave blank to use auto-detection from PATH."
        )
    );

    map.insert(
        "cli_paths.codex",
        TooltipEntry::new(
            "Path to Codex CLI binary",
            "Override where the system looks for the Codex CLI. Leave blank to use auto-detection from PATH."
        )
    );

    map.insert(
        "cli_paths.claude",
        TooltipEntry::new(
            "Path to Claude CLI binary",
            "Override where the system looks for the Claude Code CLI. Leave blank to use auto-detection from PATH."
        )
    );

    map.insert(
        "cli_paths.gemini",
        TooltipEntry::new(
            "Path to Gemini CLI binary",
            "Override where the system looks for the Gemini CLI. Leave blank to use auto-detection from PATH."
        )
    );

    map.insert(
        "cli_paths.copilot",
        TooltipEntry::new(
            "Path to Copilot CLI binary",
            "Override where the system looks for the Copilot CLI. Leave blank to use auto-detection from PATH."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Network Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "network.enabled",
        TooltipEntry::new(
            "Enable PWA server for remote control",
            "Turn on the web server that lets you control the build from a browser on any device. Essential for the mobile PWA and remote monitoring."
        )
    );

    map.insert(
        "network.max_repetitions",
        TooltipEntry::new(
            "Retry limit for failed requests",
            "How many times to retry a network request before giving up. Protects against temporary internet hiccups. 3-5 is typical."
        )
    );

    map.insert(
        "network.suppress_reply_relay",
        TooltipEntry::new(
            "Skip echoing responses back to requester",
            "Advanced: Don't send confirmation messages back after processing requests. Reduces network traffic but makes debugging harder."
        )
    );

    map.insert(
        "network.lan_mode",
        TooltipEntry::new(
            "Local network only, no internet exposure",
            "Restricts the PWA server to your local network only. Safe for home use. Turn off if you need to access the build from outside your network (requires VPN or port forwarding)."
        )
    );

    map.insert(
        "network.trust_proxy",
        TooltipEntry::new(
            "Accept X-Forwarded-For headers from reverse proxy",
            "Advanced: Trust proxy servers to tell us the real client IP address. Enable if you're behind Cloudflare, nginx, or similar. Leave off otherwise."
        )
    );

    map.insert(
        "network.allowed_origins",
        TooltipEntry::new(
            "CORS whitelist for browser requests",
            "List of websites allowed to connect to your build server. Prevents random websites from controlling your build. Use '*' for public access (not recommended) or specific domains for security."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Verification Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "verification.required_checks",
        TooltipEntry::new(
            "Mandatory verification gates before merging",
            "Tests and checks that MUST pass before code is accepted. Examples: unit tests, linting, type checking, security scans. Prevents broken code from being merged."
        )
    );

    map.insert(
        "verification.auto_fix_enabled",
        TooltipEntry::new(
            "Allow AI to automatically fix failed checks",
            "When tests fail, let the AI try to fix them automatically. Fast but may introduce unexpected changes. Turn off if you want manual review of all fixes."
        )
    );

    map.insert(
        "verification.max_auto_fix_attempts",
        TooltipEntry::new(
            "Retry limit for automated fixes",
            "How many times the AI can try to fix a failing test before giving up and asking for human help. 3-5 prevents infinite fix loops."
        )
    );

    map.insert(
        "verification.browser_adapter",
        TooltipEntry::new(
            "Browser automation backend (e.g., playwright)",
            "Which tool will drive the browser for end-to-end checks. Playwright is the default recommendation."
        )
    );

    map.insert(
        "verification.evidence_directory",
        TooltipEntry::new(
            "Where verification evidence is written",
            "Folder where screenshots, logs, traces, and other proof from verification runs are saved."
        )
    );

    map.insert(
        "verification.screenshot_on_failure",
        TooltipEntry::new(
            "Capture screenshots on verification failure",
            "When enabled, the system saves a screenshot whenever a verification step fails, which makes debugging much faster."
        )
    );

    // ═══════════════════════════════════════════════════════════════
    // Branching Tab Tooltips
    // ═══════════════════════════════════════════════════════════════

    map.insert(
        "branching.strategy",
        TooltipEntry::new(
            "Git workflow: main-only/feature-branch/gitflow",
            "How the system manages code branches. Main-only: everything committed directly (fast, risky). Feature-branch: each task gets its own branch (safe, organized). Gitflow: multiple long-lived branches (complex, enterprise-grade)."
        )
    );

    map.insert(
        "branching.base_branch",
        TooltipEntry::new(
            "Primary branch (usually 'main' or 'master')",
            "The main trunk of your project. All features eventually merge back here. This is the 'production' or 'published' version of your code."
        )
    );

    map.insert(
        "branching.use_worktrees",
        TooltipEntry::new(
            "Enable parallel work via git worktrees",
            "Let multiple AI agents work on different branches simultaneously without conflicts. Like having multiple desks instead of one. Highly recommended for parallel execution."
        )
    );

    map.insert(
        "branching.auto_merge_on_success",
        TooltipEntry::new(
            "Merge passing branches automatically",
            "When all tests pass, merge the branch back to main without waiting for approval. Fast but removes human oversight. Only enable if you trust your verification gates completely."
        )
    );

    map.insert(
        "branching.delete_on_merge",
        TooltipEntry::new(
            "Clean up merged branches automatically",
            "Delete feature branches after merging to keep your repo tidy. Standard practice. Turn off if you want to keep branch history forever."
        )
    );

    map.insert(
        "branching.naming_pattern",
        TooltipEntry::new(
            "Branch name template",
            "Pattern used to generate new branch names. Use placeholders like {tier} and {id} to keep branches organized."
        )
    );

    map.insert(
        "branching.granularity",
        TooltipEntry::new(
            "When to create new branches",
            "Choose whether to work on one branch for the whole run, or to create separate branches per phase or per task."
        )
    );

    map
});
