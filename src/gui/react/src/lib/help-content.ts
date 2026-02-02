/**
 * Centralized help content for RWM Puppet Master GUI
 * 
 * Provides help text for all configuration settings across all pages.
 * Organized by page and setting for easy maintenance.
 * 
 * References:
 * - AGENTS.md for platform capabilities and CLI commands
 * - REQUIREMENTS.md for system requirements and architecture
 */

export interface HelpContent {
  short: string;
  detailed?: string;
  warning?: string;
  example?: string;
  docLink?: string;
}

export const helpContent = {
  tiers: {
    platform: {
      short: 'Select the AI platform to use for this tier. Each platform has different strengths.',
      detailed: `Platforms have different capabilities and use cases:

**Cursor**: Fast iteration, unlimited auto mode (on grandfathered plans), supports Grok Code. Best for rapid development cycles and high-volume tasks.

**Codex**: Complex reasoning, higher limits than Claude, native AGENTS.md support. Best for architectural decisions and complex problem-solving.

**Claude Code**: Tight limits (1-4 prompts then 5h cooldown), excellent planning capabilities. Use sparingly for critical planning phases.

**Gemini**: Multi-modal support, sandbox execution, JSON output. Best for tasks requiring image analysis or isolated execution.

**Copilot**: GitHub integration, built-in agents (Explore, Task, Plan, Code-review). Best for GitHub-centric workflows and code reviews.

Choose based on your task complexity, quota availability, and required capabilities.`,
      example: 'For rapid iteration: Cursor\nFor complex reasoning: Codex\nFor planning: Claude',
    },
    model: {
      short: 'Select the AI model. Use "auto" for automatic selection, or choose a specific model for fine-grained control.',
      detailed: `Model selection affects performance, cost, and capabilities:

**"auto" (recommended)**: Automatically selects the best model based on task complexity and platform defaults. Simplifies configuration.

**Specific models**: Choose when you need:
- Consistent model behavior across runs
- Specific model capabilities (e.g., Claude Opus for complex reasoning)
- Cost optimization (e.g., Claude Haiku for simple tasks)

**Model characteristics**:
- **Claude Opus**: Best reasoning, highest cost, use for critical tasks
- **Claude Sonnet**: Balanced performance, good for most tasks
- **Claude Haiku**: Fast and efficient, best for simple tasks
- **GPT-5.2**: Advanced reasoning, high context window
- **Gemini Pro**: Multi-modal, good for complex analysis
- **Gemini Flash**: Fast and efficient

Cost/performance tradeoff: More capable models cost more but provide better results. Use simpler models for routine tasks, powerful models for critical work.`,
      example: 'auto - Automatic selection\nopus - Maximum capability\nhaiku - Fast and efficient',
    },
    planMode: {
      short: 'Enable plan-first behavior. Agent will plan, then execute the plan in a follow-up run.',
      detailed: `Plan mode enables a plan-first workflow:

**What it does**: Agent analyzes the task, reviews code, and creates a plan, then executes that plan in a follow-up run. Useful for:
- Understanding codebase before making changes
- Reviewing implementation approaches
- Validating task feasibility

**When to enable**:
- Phase tier: For initial planning and architecture
- Iteration tier: For review passes before implementation
- When you want a plan recorded before execution

**Platform support**:
- Cursor: Uses \`--mode=plan\` flag (best-effort)
- Claude: Uses \`--permission-mode plan\` in planning pass, then re-runs to execute
- Gemini: Uses \`--approval-mode plan\` in planning pass (requires experimental.plan), then re-runs to execute
- Copilot: Uses a plan-first prompt, then re-runs to execute
- Codex: Uses prompt-based plan then execute (single pass)

**Implications**: Planning output is captured and execution runs with full permissions. Disable when you want a single-pass execution.`,
      example: 'Enable for: Planning phases, code reviews\nDisable for: Quick fixes, single-pass execution',
    },
    askMode: {
      short: 'Enable ask mode for read-only discovery. Agent can explore codebase but cannot make changes.',
      detailed: `Ask mode provides read-only discovery capabilities:

**What it does**: Agent can read files, search codebase, and answer questions without making any changes. Useful for:
- Codebase exploration
- Understanding existing code
- Answering questions about implementation

**When to enable**:
- Discovery tasks
- Code review passes
- Documentation generation

**Platform support**: Cursor only (uses \`--mode=ask\` flag). Other platforms use plan mode for similar functionality.

**Difference from plan mode**: Ask mode is more exploratory, while plan mode focuses on creating implementation plans.`,
    },
    outputFormat: {
      short: 'Select output format: text (human-readable), json (structured), or stream-json (real-time events).',
      detailed: `Output format controls how the agent returns results:

**text** (default): Human-readable output, best for interactive use and reading results directly.

**json**: Single JSON object with structured data. Useful for:
- Programmatic processing
- Integration with other tools
- Structured data extraction

**stream-json**: JSONL events (one JSON object per line) for real-time monitoring. Useful for:
- Long-running tasks
- Progress monitoring
- Event-driven processing

**Platform support**:
- Cursor: text, json, stream-json
- Claude: text, json, stream-json
- Codex: JSONL event stream (always structured)
- Gemini: json (default for automation), stream-json
- Copilot: text only

Choose based on how you'll process the output. Use text for human review, json for automation.`,
      example: 'text - Read results directly\njson - Process programmatically\nstream-json - Monitor progress',
    },
    maxIterations: {
      short: 'Maximum number of retry attempts before escalation. Higher values allow more self-correction.',
      detailed: `Max iterations controls retry behavior:

**How it works**: If a task fails or doesn't meet acceptance criteria, the agent will retry up to this many times before escalating to the parent tier.

**Recommended values**:
- **Phase tier**: 3 (high-level planning, fewer retries)
- **Task tier**: 5 (moderate complexity, allow some retries)
- **Subtask tier**: 10 (implementation work, allow many retries)
- **Iteration tier**: 3 (single attempts, quick escalation)

**Escalation**: When max iterations is reached, the task escalates to the parent tier (e.g., subtask → task → phase). This allows higher-level agents to take over.

**Task Failure Style interaction**: Retry behavior depends on Task Failure Style. Spawn New Agent retries with fresh context, Continue With Same Agent retries in the same session (best-effort), Skip Retries escalates immediately.

**Trade-offs**: Higher values allow more self-correction but may waste time on impossible tasks. Lower values escalate faster but may miss fixable issues.`,
      example: 'Phase: 3 iterations\nTask: 5 iterations\nSubtask: 10 iterations\nIteration: 3 iterations',
      warning: 'Setting very high values (>20) may cause the agent to loop indefinitely on impossible tasks.',
    },
    taskFailureStyle: {
      short: 'Controls what happens after a failed iteration: spawn a fresh agent, continue the same agent, or skip retries.',
      detailed: `Task Failure Style governs retry behavior when a tier fails:

**Spawn New Agent (default)**:
- Equivalent to the old \`self_fix: true\`.
- Each retry launches a fresh agent process and context.
- Best for avoiding stuck contexts while still retrying up to max iterations.

**Continue With Same Agent**:
- Attempts to keep the same agent context across retries (best-effort).
- Most platforms still spawn fresh processes; use primarily for compatibility or future support.
- Use when you accept that retries may still be fresh agents.

**Skip Retries**:
- Equivalent to the old \`self_fix: false\`.
- Immediately escalates after the first failure (no retries).
- Best for planning tiers or when failures require human judgment.

**Interaction with max iterations**: Retries (when enabled) still count toward max iterations. Skip Retries bypasses those retries entirely.`,
      example: 'Default: Spawn New Agent\nUse Continue With Same Agent when you want continuity\nUse Skip Retries for immediate escalation',
    },
  },

  branching: {
    baseBranch: {
      short: 'The Git branch to create feature branches from. Typically "main" or "master".',
      detailed: `Base branch is the source for all feature branches:

**Purpose**: All new branches are created from this branch, ensuring they start from the latest stable code.

**Common values**:
- \`main\` - Modern default branch name
- \`master\` - Legacy default branch name
- \`develop\` - Development branch (if using Git Flow)

**Implications**: 
- Feature branches will include all commits from base branch
- Ensure base branch is up-to-date before creating feature branches
- Changes to base branch affect all new feature branches

**Best practices**:
- Use your project's primary development branch
- Keep base branch stable and tested
- Consider using protected branches for production`,
      example: 'main - Primary branch\nmaster - Legacy primary branch\ndevelop - Development branch',
    },
    namingPattern: {
      short: 'Pattern for branch names. Use variables: {tier}, {id}, {phase}, {task}',
      detailed: `Naming pattern defines how branches are named:

**Available variables**:
- \`{tier}\` - Tier type (phase, task, subtask, iteration)
- \`{id}\` - Item ID (e.g., PH-001, TK-001-001)
- \`{phase}\` - Phase ID (e.g., PH-001)
- \`{task}\` - Task ID (e.g., TK-001-001)

**Examples**:
- \`ralph/{tier}/{id}\` → \`ralph/task/TK-001-001\`
- \`feature/{phase}-{task}\` → \`feature/PH-001-TK-001-001\`
- \`{tier}/{id}\` → \`subtask/ST-001-001-001\`

**Best practices**:
- Include tier or ID for easy identification
- Use consistent separators (/, -, _)
- Keep names descriptive but concise
- Avoid special characters that cause Git issues

**Git compatibility**: Pattern must produce valid Git branch names (no spaces, special chars).`,
      example: 'ralph/{tier}/{id} → ralph/task/TK-001-001\nfeature/{phase}-{task} → feature/PH-001-TK-001-001',
    },
    granularity: {
      short: 'When to create new branches: single (one branch), per-phase, or per-task.',
      detailed: `Branch granularity controls when branches are created:

**single**: One branch for all work. Simplest approach, all changes in one branch.

**per-phase**: New branch for each phase. Good for:
- Large projects with distinct phases
- When phases are independent
- When you want phase-level isolation

**per-task**: New branch for each task (recommended). Good for:
- Most projects
- Task-level code review
- Independent task development
- Easier rollback of individual tasks

**Git implications**:
- More branches = more Git overhead but better isolation
- Fewer branches = simpler Git history but less isolation
- Per-task provides good balance of isolation and simplicity

**Recommendation**: Use "per-task" for most projects. Use "single" only for very small projects. Use "per-phase" for large projects with distinct phases.`,
      example: 'single - All work in one branch\nper-phase - Branch per phase\nper-task - Branch per task (recommended)',
    },
  },

  verification: {
    browserAdapter: {
      short: 'Browser automation adapter for verification. Options: dev-browser, playwright, puppeteer, selenium.',
      detailed: `Browser adapter controls how browser verification is performed:

**dev-browser** (recommended): Playwright-based, persistent sessions, ARIA snapshots for AI verification. Best for Puppet Master integration.

**playwright**: Full Playwright support, cross-browser testing. Good for comprehensive testing.

**puppeteer**: Chrome/Chromium only, good performance. Limited browser support.

**selenium**: Widest browser support, slower performance. Use when you need specific browser support.

**When to change**: Only change if you have specific browser requirements or compatibility issues.

**Performance**: dev-browser and playwright offer best performance. Selenium is slowest but most compatible.`,
      example: 'dev-browser - Recommended for Puppet Master\nplaywright - Full browser support\npuppeteer - Chrome only',
    },
    screenshotOnFailure: {
      short: 'Capture screenshots when verification fails. Helps debug browser-based test failures.',
      detailed: `Screenshot on failure captures visual evidence:

**What it captures**: Screenshot of the browser state when a verification gate fails.

**Storage**: Screenshots are saved to the evidence directory (see Evidence Directory setting).

**Use cases**:
- Debugging browser test failures
- Visual verification of UI state
- Documentation of failures
- Manual review of test results

**Performance impact**: Minimal. Screenshots are only taken on failure, not on success.

**Storage considerations**: Screenshots can consume significant disk space over time. Consider cleanup policies.

**Recommendation**: Enable for development and debugging. Can disable in production if storage is a concern.`,
      example: 'Enable - Capture failure screenshots\nDisable - Skip screenshots (faster, less storage)',
    },
    evidenceDirectory: {
      short: 'Directory for storing verification evidence: screenshots, logs, traces, and gate reports.',
      detailed: `Evidence directory stores verification artifacts:

**Contents**:
- Screenshots (if screenshot on failure enabled)
- Browser traces
- Test logs
- Gate reports
- File snapshots
- Metrics

**Default**: \`.puppet-master/evidence\`

**Structure**:
\`\`\`
evidence/
├── test-logs/
├── screenshots/
├── browser-traces/
├── file-snapshots/
├── metrics/
└── gate-reports/
\`\`\`

**Storage**: Evidence files can grow large over time. Consider:
- Regular cleanup of old evidence
- Git ignore patterns (evidence is typically not committed)
- Disk space monitoring

**Access**: Evidence files are used for:
- Debugging failed gates
- Reviewing test results
- Audit trails
- Performance analysis`,
      example: '.puppet-master/evidence - Default location\ncustom/evidence - Custom location',
    },
  },

  memory: {
    progressFile: {
      short: 'Short-term memory file. Tracks current progress and recent context for agents.',
      detailed: `Progress file provides short-term memory:

**Purpose**: Tracks current execution state, recent decisions, and immediate context for agents.

**Default**: \`progress.txt\`

**Contents**:
- Current task/subtask being worked on
- Recent decisions and rationale
- Current iteration status
- Immediate context for next agent

**Update frequency**: Updated after each iteration or significant event.

**Lifecycle**: 
- Appended to during execution
- Cleared or archived between major phases
- Used by agents to understand current state

**Best practices**:
- Keep file readable and concise
- Don't store sensitive information
- Regular cleanup to prevent bloat

**Integration**: Agents read this file to understand current context before starting work.`,
      example: 'progress.txt - Default short-term memory',
    },
    agentsFile: {
      short: 'Long-term memory file. Stores reusable knowledge, patterns, and gotchas discovered during development.',
      detailed: `Agents file provides long-term memory:

**Purpose**: Stores reusable knowledge, patterns, gotchas, and architectural decisions discovered during development.

**Default**: \`AGENTS.md\`

**Contents**:
- Architecture notes
- Codebase patterns
- Common failure modes
- Tooling rules
- Platform capabilities
- Best practices

**Update frequency**: Updated when reusable knowledge is discovered (not every iteration).

**Multi-level support**: When enabled, supports hierarchical AGENTS.md files:
- Project root: Project-wide patterns
- Subdirectories: Directory-specific patterns
- Allows context-specific knowledge

**Best practices**:
- Document patterns as they emerge
- Keep organized and searchable
- Update when gotchas are discovered
- Reference external documentation

**Integration**: Agents read this file to understand project patterns and avoid known issues.`,
      example: 'AGENTS.md - Default long-term memory',
      docLink: 'https://github.com/your-org/puppet-master/blob/main/AGENTS.md',
    },
    prdFile: {
      short: 'Work queue file. Stores the hierarchical task structure (phases, tasks, subtasks) as JSON.',
      detailed: `PRD file stores the work queue:

**Purpose**: Defines the hierarchical work structure (phases → tasks → subtasks → iterations) as structured JSON.

**Default**: \`.puppet-master/prd.json\`

**Structure**:
\`\`\`json
{
  "phases": [
    {
      "id": "PH-001",
      "title": "Phase Title",
      "tasks": [...]
    }
  ]
}
\`\`\`

**Update frequency**: Updated when:
- Work queue is modified
- Items are completed
- Status changes occur

**Lifecycle**:
- Created during planning phase
- Updated during execution
- Archived when project completes

**Best practices**:
- Keep structure consistent
- Use meaningful IDs
- Include acceptance criteria
- Track dependencies

**Integration**: Orchestrator reads this file to determine what work to execute next.`,
      example: '.puppet-master/prd.json - Default work queue',
    },
    multiLevelAgents: {
      short: 'Enable hierarchical AGENTS.md files. Allows directory-specific knowledge alongside project-wide patterns.',
      detailed: `Multi-level agents enables hierarchical knowledge:

**What it does**: Allows AGENTS.md files at multiple directory levels:
- Project root: Project-wide patterns
- Subdirectories: Directory-specific patterns
- Context-specific knowledge

**Benefits**:
- More specific knowledge closer to code
- Reduces noise in root AGENTS.md
- Better organization for large projects
- Context-aware patterns

**When to enable**:
- Large projects with distinct modules
- When directory-specific patterns emerge
- When root AGENTS.md becomes too large

**When to disable**:
- Small projects
- When you prefer single source of truth
- Simpler maintenance

**File resolution**: Agents read AGENTS.md files from:
1. Current directory
2. Parent directories (up to project root)
3. Project root

**Best practices**:
- Keep root AGENTS.md for project-wide patterns
- Use directory AGENTS.md for module-specific patterns
- Avoid duplication between levels`,
      example: 'Enable - Hierarchical knowledge\nDisable - Single AGENTS.md file',
    },
  },

  budgets: {
    maxCallsPerRun: {
      short: 'Maximum API calls allowed per execution run. Prevents runaway execution costs.',
      detailed: `Max calls per run limits execution:

**Purpose**: Prevents excessive API usage in a single execution run.

**What counts as a call**: Each agent invocation counts as one call, regardless of model or platform.

**Enforcement**: When limit is reached:
- Execution pauses
- Fallback to fallback_platform (if configured)
- Or execution stops (if no fallback)

**Recommendation**: Set based on:
- Your quota limits
- Typical run size
- Cost considerations

**Platform differences**:
- Cursor: May have unlimited auto mode (grandfathered plans)
- Codex: Higher limits than Claude
- Claude: Very tight limits (1-4 calls then cooldown)
- Gemini: Varies by quota
- Copilot: Premium requests quota

**Best practices**: Set conservatively to avoid unexpected costs. Monitor usage and adjust.`,
      example: '100 - Moderate limit\n50 - Conservative limit\n200 - High-volume projects',
      warning: 'Setting too high may result in unexpected costs. Monitor usage regularly.',
    },
    maxCallsPerHour: {
      short: 'Maximum API calls allowed per hour. Prevents rapid quota exhaustion.',
      detailed: `Max calls per hour provides rate limiting:

**Purpose**: Prevents rapid quota exhaustion within a short time period.

**Enforcement**: Tracks calls within rolling hour window. When limit reached:
- Execution pauses until hour window resets
- Or falls back to fallback_platform

**Use cases**:
- Prevent burst usage
- Smooth out API usage over time
- Comply with platform rate limits

**Recommendation**: Set based on:
- Platform rate limits
- Your quota distribution
- Typical usage patterns

**Interaction**: Works alongside max calls per run and per day. All limits must be satisfied.`,
      example: '50 - Moderate rate limit\n20 - Conservative rate limit\n100 - High-volume projects',
    },
    maxCallsPerDay: {
      short: 'Maximum API calls allowed per day. Prevents daily quota exhaustion.',
      detailed: `Max calls per day provides daily quota management:

**Purpose**: Prevents exhausting your daily quota early in the day.

**Enforcement**: Tracks calls within 24-hour window. When limit reached:
- Execution pauses until next day
- Or falls back to fallback_platform

**Use cases**:
- Daily quota management
- Budget control
- Predictable usage patterns

**Recommendation**: Set based on:
- Your daily quota
- Typical daily usage
- Cost budget

**Platform differences**:
- Cursor: May have unlimited (grandfathered plans)
- Codex: Higher daily limits
- Claude: Very tight daily limits
- Gemini: Varies by quota
- Copilot: Monthly premium requests quota

**Best practices**: Set conservatively, monitor usage, adjust based on actual needs.`,
      example: '500 - Moderate daily limit\n200 - Conservative daily limit\n1000 - High-volume projects',
      warning: 'Exceeding daily limits will pause execution until reset. Plan accordingly.',
    },
    autoModeUnlimited: {
      short: 'Cursor-specific: Indicates grandfathered unlimited auto mode plan. Enables unlimited Cursor usage.',
      detailed: `Auto mode unlimited (Cursor only):

**What it does**: Indicates you have a grandfathered Cursor plan with unlimited auto mode usage.

**When to enable**: Only if you have a Cursor plan that includes unlimited auto mode (typically older plans).

**Implications**:
- Cursor calls don't count toward quota limits
- Allows unlimited Cursor usage
- Other platforms still subject to limits

**Verification**: Check your Cursor subscription to confirm unlimited auto mode availability.

**Note**: This is a legacy feature. New Cursor plans may not include unlimited auto mode.`,
      example: 'Enable - Unlimited Cursor auto mode\nDisable - Cursor counts toward limits',
    },
  },

  advanced: {
    logLevel: {
      short: 'Minimum log level to display: debug (most verbose), info, warn, or error (least verbose).',
      detailed: `Log level controls verbosity:

**debug**: Most verbose, includes detailed execution information. Use for:
- Debugging issues
- Understanding execution flow
- Development

**info**: Standard level, includes important events. Use for:
- Normal operation
- Monitoring execution
- Most use cases

**warn**: Only warnings and errors. Use for:
- Production environments
- Reducing log noise
- Focus on issues

**error**: Only errors. Use for:
- Minimal logging
- Error tracking only

**Performance**: Lower log levels (debug, info) have minimal performance impact. Higher levels (warn, error) are faster.

**Storage**: More verbose logs consume more disk space. Consider log retention policies.`,
      example: 'debug - Most verbose\ninfo - Standard (recommended)\nwarn - Warnings only\nerror - Errors only',
    },
    processTimeout: {
      short: 'Maximum time (ms) for a single iteration before timing out. Prevents hung processes.',
      detailed: `Process timeout prevents hung processes:

**Purpose**: Kills agent processes that run longer than this duration.

**Default**: 300000ms (5 minutes)

**When timeouts occur**:
- Agent process hangs
- Agent takes too long
- System becomes unresponsive

**What happens on timeout**:
- Process is killed
- Task marked as failed
- Escalation may occur (if configured)
- Next iteration or escalation triggered

**Recommendation**: Set based on:
- Typical task duration
- Task complexity
- System performance

**Trade-offs**:
- Too low: May kill legitimate long-running tasks
- Too high: May allow hung processes to consume resources

**Platform differences**: Some platforms may have their own timeouts. This is a Puppet Master-level timeout.`,
      example: '300000 - 5 minutes (default)\n600000 - 10 minutes\n180000 - 3 minutes',
      warning: 'Setting very high values may allow hung processes to consume resources indefinitely.',
    },
    parallelIterations: {
      short: 'Number of concurrent iterations (experimental). Enables parallel execution but may cause conflicts.',
      detailed: `Parallel iterations (experimental):

**What it does**: Runs multiple iterations concurrently instead of sequentially.

**Benefits**:
- Faster execution
- Better resource utilization
- Parallel task processing

**Risks**:
- File conflicts
- Git conflicts
- Resource contention
- Unpredictable execution order

**When to use**:
- Independent tasks
- When conflicts are unlikely
- Experimental/testing

**When to avoid**:
- Tasks that modify same files
- Tasks with dependencies
- Production environments

**Recommendation**: Start with 1 (sequential). Only increase if:
- Tasks are truly independent
- You understand the risks
- You can handle conflicts

**Experimental**: This feature is experimental and may have issues. Use with caution.`,
      example: '1 - Sequential (safe)\n2-3 - Moderate parallelism\n4+ - High parallelism (risky)',
      warning: 'EXPERIMENTAL: Parallel execution may cause file conflicts, Git conflicts, and unpredictable behavior. Use with extreme caution.',
    },
    cliPaths: {
      short: 'Custom paths to platform CLI executables. Override if CLIs are installed in non-standard locations.',
      detailed: `CLI paths customize executable locations:

**Purpose**: Override default CLI command paths when platforms are installed in non-standard locations.

**Default paths**:
- Cursor: \`agent\` or \`cursor-agent\`
- Codex: \`codex\`
- Claude: \`claude\`
- Gemini: \`gemini\`
- Copilot: \`copilot\`

**When to customize**:
- CLIs installed via custom methods
- Version managers (nvm, pyenv, etc.)
- Non-standard installation paths
- Docker/container environments

**Path resolution**: 
- Absolute paths: Used as-is
- Relative paths: Resolved from working directory
- Command names: Searched in PATH

**Best practices**:
- Use absolute paths for reliability
- Test paths before saving
- Document custom paths

**Troubleshooting**: If CLIs aren't found, check:
- PATH environment variable
- CLI installation
- Path permissions`,
      example: '/usr/local/bin/agent - Absolute path\n~/bin/codex - Home directory\ncodex - PATH search',
    },
    rateLimits: {
      short: 'Rate limiting per platform. Controls calls per minute and cooldown periods to prevent quota exhaustion.',
      detailed: `Rate limits prevent rapid quota exhaustion:

**Purpose**: Throttles API calls to prevent hitting platform rate limits too quickly.

**Calls per minute**: Maximum calls allowed per minute per platform.

**Cooldown (ms)**: Minimum time between calls in milliseconds.

**Enforcement**: Puppet Master enforces these limits before making platform calls.

**Platform differences**: Different platforms have different rate limits:
- Cursor: Generally high limits
- Codex: Moderate limits
- Claude: Very tight limits
- Gemini: Varies by quota
- Copilot: Varies by plan

**Recommendation**: Set based on:
- Platform rate limits
- Your quota
- Typical usage patterns

**Best practices**:
- Start conservative
- Monitor for rate limit errors
- Adjust based on actual limits

**Interaction**: Works alongside budget limits (per run/hour/day).`,
      example: '60 calls/min, 1000ms cooldown - Moderate\n30 calls/min, 2000ms cooldown - Conservative',
    },
    executionStrategy: {
      short: 'Execution behavior: kill on failure, parallel execution settings. Controls how tasks are executed.',
      detailed: `Execution strategy controls task execution:

**Kill on failure**: When enabled, kills agent process immediately on failure. When disabled, allows process to complete.

**Parallel execution**: Experimental feature for concurrent task execution:
- Enabled: Run multiple tasks concurrently
- Max concurrency: Maximum parallel tasks
- Worktree directory: Git worktree location for isolation
- Continue on failure: Whether to continue other tasks if one fails
- Merge results: Whether to merge results from parallel tasks
- Target branch: Branch to merge results into

**When to enable parallel**:
- Independent tasks
- When conflicts are unlikely
- Experimental/testing

**Risks**: File conflicts, Git conflicts, resource contention.

**Recommendation**: Use sequential execution (parallel disabled) for most cases. Only enable parallel for truly independent tasks.`,
      example: 'Kill on failure: Enabled\nParallel: Disabled (recommended)',
      warning: 'Parallel execution is experimental and may cause conflicts. Use with extreme caution.',
    },
    checkpointing: {
      short: 'State checkpointing for recovery. Saves execution state at intervals for crash recovery.',
      detailed: `Checkpointing enables state recovery:

**Purpose**: Saves execution state periodically to allow recovery after crashes or interruptions.

**Interval**: How often (in iterations) to create checkpoints.

**Max checkpoints**: Maximum number of checkpoints to keep (older ones are deleted).

**Checkpoint on subtask complete**: Create checkpoint when subtask completes.

**Checkpoint on shutdown**: Create checkpoint when Puppet Master shuts down gracefully.

**Use cases**:
- Crash recovery
- Interruption recovery
- State inspection
- Debugging

**Storage**: Checkpoints stored in \`.puppet-master/checkpoints/\`

**Performance**: Minimal impact. Checkpoints are created asynchronously.

**Recommendation**: Enable for long-running projects. Disable for quick tasks.`,
      example: 'Interval: 10 iterations\nMax checkpoints: 10\nCheckpoint on subtask: Enabled',
    },
    loopGuard: {
      short: 'Infinite loop detection. Prevents agents from repeating the same actions indefinitely.',
      detailed: `Loop guard prevents infinite loops:

**Purpose**: Detects when agents repeat the same actions and stops execution.

**Max repetitions**: Maximum number of identical outputs before triggering loop guard.

**Suppress reply relay**: Prevents agents from echoing previous messages (common loop pattern).

**How it works**:
1. Tracks recent agent outputs
2. Detects repeated patterns
3. Triggers when max repetitions reached
4. Stops execution and escalates

**Use cases**:
- Prevents stuck agents
- Detects impossible tasks
- Saves resources

**Limitations**: May trigger on legitimate repetitive tasks. Adjust max repetitions if needed.

**Recommendation**: Enable for most cases. Adjust max repetitions based on task patterns.`,
      example: 'Max repetitions: 3\nSuppress reply relay: Enabled',
    },
    escalationChains: {
      short: 'Escalation behavior for different failure types. Defines what happens when tasks fail.',
      detailed: `Escalation chains define failure handling:

**Purpose**: Configures what happens when different types of failures occur.

**Failure types**:
- **testFailure**: Tests fail
- **acceptance**: Acceptance criteria not met
- **timeout**: Task times out
- **structural**: Structural issues (syntax errors, etc.)
- **error**: General errors

**Escalation steps**: Each chain defines a sequence of actions:
- **action**: What to do (self_fix, escalate, notify, etc.)
- **maxAttempts**: Maximum attempts before next step
- **to**: Escalate to which tier
- **notify**: Whether to notify user

**Example chain**:
1. Try self-fix (3 attempts)
2. Escalate to parent tier
3. Notify user

**Recommendation**: Use default chains for most cases. Customize only if you have specific requirements.`,
      example: 'testFailure: [self_fix (3x) → escalate → notify]\ntimeout: [retry (2x) → escalate]',
    },
  },

  settings: {
    theme: {
      short: 'Color scheme: light or dark mode. Affects all UI elements.',
      detailed: `Theme controls color scheme:

**Light mode**: Light background, dark text. Good for:
- Well-lit environments
- Daytime use
- Print-friendly views

**Dark mode**: Dark background, light text. Good for:
- Low-light environments
- Reduced eye strain
- Extended use

**Accessibility**: Both themes meet WCAG contrast requirements.

**Preference**: Choose based on your environment and preference.`,
    },
    fontSize: {
      short: 'Text size throughout the application. Adjust for readability and accessibility.',
      detailed: `Font size affects readability:

**Small**: Compact text, more content visible. Good for:
- Large screens
- Dense information
- Power users

**Medium**: Balanced size (default). Good for:
- Most users
- Standard screens
- General use

**Large**: Larger text, easier to read. Good for:
- Accessibility needs
- Small screens
- Reduced eye strain

**Accessibility**: Larger sizes improve readability for users with visual impairments.`,
    },
    animations: {
      short: 'Enable or disable UI animations. Disable for better performance on slower devices.',
      detailed: `Animations enhance UX but affect performance:

**Enabled**: Smooth transitions and animations. Good for:
- Modern devices
- Better UX
- Visual feedback

**Disabled**: No animations, instant transitions. Good for:
- Slower devices
- Performance optimization
- Reduced motion preferences

**Performance impact**: Minimal on modern devices. May improve performance on older hardware.

**Accessibility**: Disable if you prefer reduced motion.`,
    },
    notifications: {
      short: 'Browser notifications for events. Requires browser permission.',
      detailed: `Notifications alert you to events:

**Sound effects**: Audio alerts for events. Requires browser audio permission.

**Desktop notifications**: Browser notifications. Requires browser notification permission.

**Notify on complete**: Alert when tasks complete.

**Notify on error**: Alert when errors occur.

**Browser permissions**: First-time use will prompt for notification permission. Grant permission to enable.

**Privacy**: Notifications are local only, no data sent to servers.`,
    },
    defaultPlatform: {
      short: 'Preferred AI platform for new tasks. "auto" uses tier configuration.',
      detailed: `Default platform sets preference:

**auto**: Uses tier configuration (recommended). Platform selected based on tier settings.

**Specific platform**: Always use this platform unless overridden:
- Cursor: Fast iteration
- Codex: Complex reasoning
- Claude: Planning
- Gemini: Multi-modal
- Copilot: GitHub integration

**When it applies**: Used when creating new tasks without explicit platform selection.

**Override**: Tier configuration always overrides this setting.`,
    },
    debugMode: {
      short: 'Enable debug logging and features. Provides detailed execution information.',
      detailed: `Debug mode enables detailed logging:

**What it includes**:
- Detailed execution logs
- Agent prompts and responses
- Internal state information
- Performance metrics

**Use cases**:
- Debugging issues
- Understanding execution flow
- Development
- Troubleshooting

**Performance**: May slightly impact performance due to increased logging.

**Storage**: Generates more log data. Monitor disk usage.

**Recommendation**: Enable only when debugging. Disable for normal use.`,
    },
    logLevel: {
      short: 'Minimum log level to display in the UI (does not change backend logging).',
      detailed: `Log level controls filtering of logs shown in the UI:

**error**: Only errors
**warn**: Warnings + errors
**info**: Normal operational info (default)
**debug**: Most verbose UI logs

**Note**: This affects UI display verbosity. Backend logging verbosity is configured separately.

**Recommendation**: Use *info* for normal use; switch to *debug* while troubleshooting.`,
    },
    dataRetention: {
      short: 'Days to keep history and logs. Older data is automatically cleaned up.',
      detailed: `Data retention controls cleanup:

**Purpose**: Automatically removes old history and logs after specified days.

**Default**: 30 days

**What gets cleaned**:
- Execution history
- Log files
- Old checkpoints
- Archived evidence

**Recommendation**: 
- 7-14 days: Minimal storage
- 30 days: Balanced (default)
- 90+ days: Extended history

**Storage**: Longer retention uses more disk space. Adjust based on available storage.

**Recovery**: Once cleaned, data cannot be recovered. Ensure important data is backed up.`,
    },
  },

  login: {
    authenticationSummary: {
      short: 'Overview of platform authentication status. Shows how many platforms are authenticated.',
      detailed: `Authentication summary provides quick overview:

**Total Platforms**: Number of platforms configured in Puppet Master.

**Authenticated**: Platforms with valid credentials and successful authentication.

**Failed**: Platforms with authentication errors. Check credentials and try again.

**Skipped**: Platforms not yet configured or authentication skipped.

**Why authentication matters**: 
- Required for platform API access
- Enables agent execution
- Validates credentials before use

**Next steps**: 
- Authenticate failed platforms
- Verify authenticated platforms
- Configure skipped platforms as needed`,
    },
    platformStatus: {
      short: 'Status of each platform: authenticated (ready), failed (needs fixing), or skipped (not configured).',
      detailed: `Platform status indicates readiness:

**authenticated** (green): Platform is ready to use. Credentials are valid and authentication successful.

**failed** (red): Authentication failed. Common causes:
- Invalid API key
- Expired credentials
- Network issues
- Platform service issues

**skipped** (gray): Platform not yet configured or authentication skipped.

**What to do**:
- **Authenticated**: Ready to use, no action needed
- **Failed**: Click "SETUP" to reconfigure credentials
- **Skipped**: Click "SETUP" to configure platform

**Verification**: Use "REFRESH" button to update status after making changes.`,
    },
    setupInstructions: {
      short: 'Step-by-step instructions for obtaining and configuring API keys for each platform.',
      detailed: `Setup instructions guide platform configuration:

**For each platform**, instructions include:
1. How to obtain API key/credentials
2. Where to find credentials in platform dashboard
3. How to set environment variables
4. Verification steps

**Environment variables**: 
- Set in \`.env\` file (project root)
- Or system environment variables
- Format: \`PLATFORM_API_KEY=your-key\`

**Security**: 
- Never commit \`.env\` files to Git
- Use secure credential storage
- Rotate keys regularly

**Platform-specific**:
- **Cursor**: Uses \`CURSOR_API_KEY\` or local app auth
- **Codex**: Uses OpenAI subscription (no API key needed)
- **Claude**: Uses \`ANTHROPIC_API_KEY\`
- **Gemini**: Uses \`GEMINI_API_KEY\` or \`GOOGLE_API_KEY\`
- **Copilot**: Uses \`GH_TOKEN\` or \`GITHUB_TOKEN\`

**Troubleshooting**: See troubleshooting section for common issues.`,
    },
    cliAlternative: {
      short: 'Command-line alternative for authentication. Useful for headless servers or terminal preference.',
      detailed: `CLI alternative provides terminal-based setup:

**When to use**:
- Headless servers
- CI/CD environments
- Terminal preference
- Automation scripts

**Command**: \`puppet-master login [platform]\`

**Options**:
- \`puppet-master login\` - Interactive wizard for all platforms
- \`puppet-master login claude\` - Configure specific platform
- \`puppet-master login --all\` - Configure all platforms

**Benefits**:
- Works in terminal environments
- Scriptable
- No GUI required
- Same functionality as GUI

**Verification**: Use \`puppet-master doctor\` to verify authentication after CLI setup.`,
    },
  },

  ledger: {
    eventLedger: {
      short: 'SQLite database tracking all execution events. Provides audit trail and debugging information.',
      detailed: `Event ledger tracks execution history:

**Purpose**: Records all significant events during Puppet Master execution for audit trail and debugging.

**What's tracked**:
- Iteration starts/completions
- Gate passes/failures
- Phase/task/subtask events
- Errors and warnings
- Session information

**Database**: SQLite database stored in \`.puppet-master/ledger.db\`

**Use cases**:
- Debugging execution issues
- Audit trail
- Performance analysis
- Understanding execution flow

**Benefits**:
- Complete execution history
- Queryable data
- Performance metrics
- Error tracking

**Storage**: Database grows over time. Consider periodic cleanup of old events.`,
    },
    ledgerStatistics: {
      short: 'Summary statistics: total events, event types, sessions, and date range of recorded events.',
      detailed: `Ledger statistics provide overview:

**Total Events**: Total number of events recorded in ledger.

**Event Types**: Number of distinct event types (iteration_start, gate_passed, etc.).

**Sessions**: Number of distinct execution sessions.

**Date Range**: Earliest and latest event timestamps.

**Use cases**:
- Quick overview of execution history
- Understanding system usage
- Identifying patterns

**Updates**: Statistics update when you refresh the ledger view.`,
    },
    filters: {
      short: 'Filter events by type, tier ID, session ID, or limit results. Helps find specific events.',
      detailed: `Filters help find specific events:

**Event Type**: Filter by event type (iteration_start, gate_passed, error, etc.).

**Tier ID**: Filter by tier identifier (PH-001, TK-001-001, etc.).

**Session ID**: Filter by session identifier (PM-YYYY-MM-DD-...).

**Limit**: Maximum number of events to return (50, 100, 250, 500).

**Use cases**:
- Find events for specific task
- Debug specific session
- Analyze error patterns
- Review gate results

**Performance**: Lower limits improve performance. Use higher limits for comprehensive analysis.

**Combining filters**: Multiple filters work together (AND logic).`,
      example: 'Event Type: gate_failed\nTier ID: TK-001-001\nLimit: 100',
    },
    eventTypes: {
      short: 'Types of events tracked: iteration events, gate results, phase/task events, errors.',
      detailed: `Event types categorize events:

**Iteration events**:
- \`iteration_start\`: Iteration begins
- \`iteration_complete\`: Iteration succeeds
- \`iteration_failed\`: Iteration fails

**Gate events**:
- \`gate_passed\`: Verification gate passes
- \`gate_failed\`: Verification gate fails

**Tier events**:
- \`phase_start\`, \`phase_complete\`
- \`task_start\`, \`task_complete\`
- \`subtask_start\`, \`subtask_complete\`

**Error events**:
- \`error\`: General errors
- Platform-specific errors

**Use cases**: Filter by type to analyze specific event categories.`,
    },
    tierId: {
      short: 'Tier identifier format: PH-001 (phase), TK-001-001 (task), ST-001-001-001 (subtask).',
      detailed: `Tier ID format:

**Phase**: \`PH-XXX\` (e.g., PH-001)

**Task**: \`TK-XXX-XXX\` (e.g., TK-001-001)

**Subtask**: \`ST-XXX-XXX-XXX\` (e.g., ST-001-001-001)

**Iteration**: Uses parent subtask ID

**Format**: Hierarchical numbering reflects tier structure.

**Use cases**:
- Filter events for specific tier
- Track execution for specific item
- Debug specific task/subtask

**Examples**: 
- \`PH-001\` - All events for phase 1
- \`TK-001-001\` - All events for task 1 of phase 1
- \`ST-001-001-001\` - All events for subtask 1 of task 1 of phase 1`,
      example: 'PH-001 - Phase 1\nTK-001-001 - Task 1 of Phase 1\nST-001-001-001 - Subtask 1 of Task 1 of Phase 1',
    },
    sessionId: {
      short: 'Session identifier format: PM-YYYY-MM-DD-HH-MM-SS-NNN. Unique identifier for each execution session.',
      detailed: `Session ID format:

**Format**: \`PM-YYYY-MM-DD-HH-MM-SS-NNN\`

**Components**:
- \`PM\`: Puppet Master prefix
- \`YYYY-MM-DD\`: Date
- \`HH-MM-SS\`: Time
- \`NNN\`: Sequence number

**Example**: \`PM-2026-01-27-14-30-00-001\`

**Uniqueness**: Each execution session gets unique ID.

**Use cases**:
- Track all events in specific session
- Debug specific execution run
- Correlate events across tiers

**Finding session IDs**: 
- Shown in event details
- Available in execution logs
- Displayed in dashboard`,
      example: 'PM-2026-01-27-14-30-00-001 - Session from Jan 27, 2026 at 14:30:00',
    },
    limit: {
      short: 'Maximum number of events to return. Lower limits improve performance, higher limits show more history.',
      detailed: `Limit controls result size:

**Purpose**: Limits number of events returned to improve performance.

**Options**: 50, 100, 250, 500

**Performance**: 
- Lower limits: Faster queries, less data
- Higher limits: Slower queries, more data

**Use cases**:
- **50**: Quick overview, recent events
- **100**: Standard viewing (default)
- **250**: Comprehensive analysis
- **500**: Full history review

**Recommendation**: Start with 100. Increase if you need more history. Decrease for faster loading.

**Pagination**: Currently not supported. Use filters to narrow results instead.`,
      example: '50 - Quick overview\n100 - Standard (recommended)\n250 - Comprehensive\n500 - Full history',
    },
    eventData: {
      short: 'JSON data associated with each event. Contains detailed information about the event.',
      detailed: `Event data provides details:

**Contents**: JSON object with event-specific data:
- Execution context
- Error details (if error event)
- Gate results (if gate event)
- Platform information
- Timestamps

**Viewing**: Click event card to expand and view JSON data.

**Use cases**:
- Debugging specific events
- Understanding event context
- Error analysis
- Performance metrics

**Format**: Pretty-printed JSON for readability.

**Size**: Event data can be large for complex events.`,
    },
  },
} as const;
