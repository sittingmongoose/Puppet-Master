(() => {
  'use strict';

  const details = (what, why, example, applies, related = [], notes = '') => ({
    what, why, example, applies, related, notes
  });

  const setting = (id, label, description, control, value, detail, extra = {}) => ({
    id, label, description, control, value, detail, ...extra
  });

  const appInputSections = [
    {
      id: 'appearance', label: 'Appearance', eyebrow: 'Interface',
      description: 'Shape the visual density, color, typography, and motion of Puppet Master.',
      settings: [
        setting('theme', 'Theme', 'Choose the overall color system for Puppet Master.', 'select', 'Purple Dark', details(
          'Changes the application palette, surfaces, contrast, syntax colors, charts, and system chrome as one coordinated theme.',
          'Use a theme that remains comfortable through long sessions and preserves contrast in your display environment.',
          'Purple Dark keeps the current Puppet Master identity. Glass themes add translucency, while Friendly themes favor softer contrast.',
          'This project by default; you can promote the choice to the application default.',
          ['Accent color', 'Interface density', 'Editor theme']
        ), { options: ['Purple Dark', 'Purple Light', 'Glass Dark', 'Glass Light', 'Friendly Dark', 'Friendly Light', 'Retro Olive'] }),
        setting('accent', 'Accent color', 'Set the color used for selection, focus, progress, and primary actions.', 'swatches', 'Violet', details(
          'Changes interactive emphasis without replacing the rest of the selected theme.',
          'A distinct accent makes focus and selected states easier to track across dense workspaces.',
          'Choose Cyan when the purple theme needs a higher-contrast focus color.',
          'All windows in this project.',
          ['Theme', 'High-contrast focus rings']
        ), { options: ['Violet', 'Cyan', 'Rose', 'Amber', 'Emerald'] }),
        setting('density', 'Interface density', 'Adjust the spacing and control size used throughout the interface.', 'segmented', 'Comfortable', details(
          'Changes row heights, padding, toolbar spacing, and the amount of information visible at once.',
          'Compact is useful on smaller displays; Relaxed adds breathing room when scanability matters more than density.',
          'Comfortable is the balanced default used by this concept.',
          'All project views. Changes take effect immediately.',
          ['Sidebar width', 'Font size', 'Zoom']
        ), { options: ['Compact', 'Comfortable', 'Relaxed'] }),
        setting('font-size', 'Interface font size', 'Scale application text without changing editor code size.', 'stepper', 14, details(
          'Changes labels, help text, menus, lists, and settings text while keeping code-editor typography independent.',
          'Increase it when secondary text is difficult to scan or decrease it when you need denser operational views.',
          'Set 15 px for comfortable reading on a high-resolution desktop monitor.',
          'Application interface only.',
          ['Editor font size', 'Zoom', 'Interface density']
        ), { min: 12, max: 20, unit: 'px' }),
        setting('motion', 'Interface motion', 'Control the amount of transition and spatial feedback.', 'select', 'Full', details(
          'Controls page transitions, list reordering, drawers, hover previews, progress motion, and state changes.',
          'Motion can clarify where objects came from and where they went, but should never block input or flash the screen.',
          'Reduced keeps functional spatial cues while removing decorative movement.',
          'All windows. The operating system reduced-motion preference can override Full.',
          ['Animation speed', 'Reduce transparency']
        ), { options: ['Full', 'Reduced', 'Off'] }),
        setting('animation-speed', 'Animation speed', 'Choose how quickly interface transitions complete.', 'segmented', 'Measured', details(
          'Adjusts the duration curve used by drawers, page changes, expanding details, menus, and reordered objects.',
          'Measured provides enough time to perceive continuity without making routine settings changes feel delayed.',
          'Use Fast for repetitive administrative work; use Measured when evaluating motion and hierarchy.',
          'Interface transitions only, not task execution.',
          ['Interface motion']
        ), { options: ['Fast', 'Measured', 'Cinematic'] }),
        setting('contrast', 'High-contrast focus rings', 'Make keyboard focus and selected controls more prominent.', 'toggle', true, details(
          'Adds a brighter, thicker focus treatment around keyboard-targeted controls and selected manager resources.',
          'This helps track keyboard navigation and reduces ambiguity in dense inspectors.',
          'Turn it on when using Settings primarily with the keyboard.',
          'Application interface.',
          ['Accent color', 'Keyboard shortcuts']
        ))
      ]
    },
    {
      id: 'desktop-window', label: 'Desktop & Window', eyebrow: 'Workspace',
      description: 'Control window restoration, side panels, navigation, and startup behavior.',
      settings: [
        setting('startup-view', 'Startup destination', 'Choose what Puppet Master opens after launch.', 'select', 'Restore last workspace', details(
          'Selects whether launch restores your previous project and view, opens Settings Home, or shows the project picker.',
          'Restoring context saves time, while the project picker is safer on shared machines.',
          'Choose Settings Home during configuration work so provider and source-control health are visible immediately.',
          'This device.', ['Restore window positions', 'Open last project']), { options: ['Restore last workspace', 'Settings Home', 'Project picker', 'Assistant Chat'] }),
        setting('restore-window', 'Restore window positions', 'Remember size, placement, maximized state, and auxiliary windows.', 'toggle', true, details(
          'Persists the primary window and detachable panels independently for each display arrangement.',
          'It prevents repeated layout setup when switching between a desk display and a laptop-only session.',
          'A disconnected monitor falls back to the nearest visible display rather than restoring off-screen.',
          'This device.', ['Startup destination', 'Restore panel layout'])),
        setting('sidebar-order', 'Sidebar icon order', 'Reorder application destinations with a structured list.', 'reorder', ['Home', 'Assistant', 'Goals', 'Projects', 'Usage', 'Settings'], details(
          'Controls the order of primary destination icons and whether optional destinations remain visible.',
          'A reorderable list avoids memorizing internal names or typing an invalid comma-separated value.',
          'Move Usage beside Assistant when you monitor quotas frequently.',
          'This project unless promoted to the application default.', ['Sidebar visibility', 'Restore default layout'])),
        setting('sidebar-labels', 'Expanded sidebar labels', 'Show text labels beside primary navigation icons.', 'toggle', true, details(
          'Keeps destination names visible when the main rail has sufficient width.',
          'Labels improve recognition for new users; icons-only preserves workspace width.',
          'The sidebar can still collapse temporarily with the standard rail control.',
          'This project.', ['Sidebar icon order', 'Interface density'])),
        setting('panel-restore', 'Restore panel layout', 'Remember panel size, order, visibility, and dock location.', 'toggle', true, details(
          'Restores editors, terminal, dashboard, assistant pop-out, and inspector panels for each project.',
          'This supports continuity without forcing every project to share one global arrangement.',
          'Use Restore default layout in Advanced Settings when the saved layout becomes inconvenient.',
          'Per project.', ['Restore window positions', 'Restore default layout']))
      ]
    },
    {
      id: 'input', label: 'Spellcheck & Input', eyebrow: 'Writing',
      description: 'Configure dictionaries, text correction, keyboard input, and command entry.',
      settings: [
        setting('spellcheck', 'Spellcheck prose', 'Check natural-language content without marking source code.', 'toggle', true, details(
          'Checks chat messages, goals, documentation, commit descriptions, and other prose surfaces.',
          'It keeps writing assistance separate from language-server diagnostics in code.',
          'Identifiers inside fenced code blocks are ignored.',
          'This project.', ['Dictionary languages', 'Code diagnostics'])),
        setting('dictionaries', 'Dictionary languages', 'Select all languages used for spellchecking.', 'multiselect', ['English (US)'], details(
          'Loads one or more dictionaries and merges their suggestions while preserving language-specific capitalization.',
          'Multiple dictionaries help multilingual projects but may produce more ambiguous suggestions.',
          'English (US) and English (UK) can be enabled together for mixed-source documentation.',
          'This project.', ['Custom dictionary']), { options: ['English (US)', 'English (UK)', 'French', 'German', 'Spanish', 'Japanese'] }),
        setting('custom-words', 'Custom dictionary', 'Review words Puppet Master should always accept.', 'resource', '42 words', details(
          'Stores project terms, product names, acronyms, and intentional spellings excluded from warnings.',
          'Managing the list explicitly prevents a one-click “Add word” action from becoming irreversible.',
          'Add PlanUnit, WorkNode, and FileSafe as project terminology.',
          'This project; exportable with Settings Transfer.', ['Dictionary languages'])),
        setting('command-confirm', 'Confirm destructive command entry', 'Require a second action before submitting high-impact slash commands.', 'toggle', true, details(
          'Adds confirmation to commands that delete, reset, revoke, disconnect, or overwrite state.',
          'This reduces accidental activation from keyboard completion or pasted command text.',
          'A command such as /settings restore-defaults opens a preview instead of executing immediately.',
          'All command-entry surfaces.', ['Permission approvals', 'Command catalog']))
      ]
    },
    {
      id: 'assistant-chat', label: 'Assistant Chat', eyebrow: 'Conversation',
      description: 'Control how assistant work in progress is presented inside the chat transcript.',
      settings: [
        setting('working-activity-style', 'Working activity style', 'Choose how in-progress assistant activity is displayed while a turn is running.', 'segmented', 'Orbit', details(
          'Changes the presentation of tool calls, file reads, web work, and subagents while the assistant is working: subjects appear as they start, stream their detail rows, and collapse to a compact summary you can reopen per subject.',
          'Orbit is the default — an animated dial with a live detail panel. Step Rail is the simplified option: the same engine as a plain rail of step discs, for people who do not want the full animation.',
          'Choose Step Rail when you want a quieter transcript during long agentic runs; every subject stays one click away in both styles.',
          'This project. Takes effect on the next assistant turn.',
          ['Show Activity Cards', 'Interface motion', 'Contextual help level']), { options: ['Orbit', 'Step Rail'], searchTerms: ['activity', 'progress', 'working', 'tool calls', 'orbit', 'step rail', 'transcript', 'animation'] })
      ]
    },
    {
      id: 'help', label: 'Help & Getting Started', eyebrow: 'Learning',
      description: 'Choose how Puppet Master teaches features and surfaces contextual help.',
      settings: [
        setting('teacher', 'Demo Teacher Assistant', 'Keep the built-in teacher available for guided walkthroughs.', 'toggle', true, details(
          'Adds a non-destructive teaching assistant that can point to controls, explain concepts, and launch demo flows.',
          'It gives new users an integrated path from explanation to the exact setting or manager.',
          'Ask “show me how provider fallback works” to open a guided provider route demonstration.',
          'This project.', ['Contextual help', 'Onboarding state'])),
        setting('help-level', 'Contextual help level', 'Choose how frequently inline guidance appears.', 'segmented', 'Helpful', details(
          'Controls first-run callouts, empty-state coaching, and explanations for unfamiliar status terms.',
          'Helpful keeps guidance available without repeatedly interrupting experienced users.',
          'Verbose adds more examples and definitions throughout setup managers.',
          'This user.', ['Demo Teacher Assistant']), { options: ['Minimal', 'Helpful', 'Verbose'] }),
        setting('onboarding', 'Onboarding progress', 'Review completed, skipped, and remaining setup steps.', 'resource', '7 of 9 complete', details(
          'Shows the setup journey and lets you reopen individual steps without restarting onboarding.',
          'This makes skipped provider, source-control, or backup setup recoverable later.',
          'Reopen “Connect source control” after you create a GitHub account.',
          'This user on this device.', ['Provider setup', 'Source Control', 'Backups']))
      ]
    }
  ];

  const editorRuntimeSections = [
    { id: 'files-editor', label: 'Files & Editor', description: 'Editor behavior, saves, navigation, and file safety.', settings: [
      setting('autosave', 'Auto save', 'Save edited files after a short idle delay.', 'select', 'After 1 second', details('Controls when dirty editor buffers are written to disk.','Use an explicit delay to reduce data loss without writing on every keystroke.','After 1 second balances safety and formatter churn.','Per project.',['Format on save','FileSafe'] ), { options: ['Off', 'After 500 ms', 'After 1 second', 'On focus change'] }),
      setting('format-save', 'Format on save', 'Run the configured formatter before a file is committed to disk.', 'toggle', true, details('Invokes the formatter selected for the file language and waits for a validated result.','Consistent formatting reduces noisy diffs, but a failing formatter should not silently discard edits.','A TypeScript file uses the project Prettier route configured in Toolchain & Extensions.','Per project.',['Formatters','Auto save'])),
      setting('large-file', 'Large file threshold', 'Avoid expensive editor services above a configurable file size.', 'stepper', 10, details('Disables or limits syntax analysis, minimap rendering, and semantic features for unusually large files.','This keeps the editor responsive and makes the reduced feature state explicit.','At 10 MB the editor asks before enabling language-server features.','Per project.',['Language Servers']), { min: 1, max: 100, unit: 'MB' }),
      setting('file-encoding', 'Default file encoding', 'Choose the encoding used when a file does not declare one.', 'select', 'UTF-8', details('Defines the fallback decoder and new-file encoding.','A visible fallback prevents silent corruption in repositories with mixed legacy encodings.','Use UTF-8 unless the project explicitly requires another format.','Per project.',['Line endings']), { options: ['UTF-8', 'UTF-8 with BOM', 'UTF-16 LE', 'Windows-1252'] })
    ]},
    { id: 'terminal', label: 'Terminal', description: 'Shell profiles, environments, startup, and command handling.', settings: [
      setting('terminal-profile', 'Default terminal profile', 'Select the shell used for new integrated terminals.', 'select', 'Project default', details('Chooses a detected local, WSL, SSH, or container shell profile.','A project default can follow the selected execution host while still allowing per-terminal overrides.','On Windows, Project default can resolve to WSL when the project execution backend is WSL.','Per project.',['Execution host','Environment variables']), { options: ['Project default', 'PowerShell 7', 'Command Prompt', 'WSL · Ubuntu', 'bash', 'zsh'] }),
      setting('terminal-restore', 'Restore terminal sessions', 'Recreate terminal tabs and working directories after restart.', 'toggle', true, details('Restores metadata and opens fresh shells at their prior paths; it does not replay secrets or unsafe process state.','This preserves context without pretending a terminated process is still running.','A terminal titled “Build” reopens at the repository root.','Per project.',['Startup destination'])),
      setting('paste-protect', 'Multi-line paste protection', 'Preview pasted commands that contain multiple lines or shell control operators.', 'toggle', true, details('Intercepts potentially surprising terminal pastes and shows exactly what will execute.','It reduces accidental execution of hidden newlines or chained destructive commands.','A four-line install script opens a confirmation sheet with each command separated.','All integrated terminals.',['Permissions','Command confirmation']))
    ]},
    { id: 'containers', label: 'Containers & Registries', description: 'Container tool detection, registry authentication, and project defaults.', settings: [
      setting('container-engine', 'Preferred container engine', 'Choose among detected Docker and Podman installations.', 'select', 'Auto-detect', details('Selects the engine used for project tasks and tool setup when more than one is available.','Automatic detection favors a healthy authenticated installation on the chosen execution host.','Choose Podman explicitly for a rootless Linux workflow.','Per project and execution host.',['Registry accounts','Execution host']), { options: ['Auto-detect', 'Docker', 'Podman'] }),
      setting('registry', 'Registry accounts', 'Manage Docker Hub and other supported registry sign-ins.', 'resource', '2 connected', details('Stores references to provider-owned credentials and verifies pull/push capability.','Registry state needs separate authentication and permission checks, not merely an installed CLI.','A Docker Hub account can be connected for pulls while push permission remains disabled.','Per user; credentials stay in the credential store.',['Preferred container engine']))
    ]},
    { id: 'search-index', label: 'Project Search Index', description: 'Control code indexing, exclusions, freshness, and resource use.', settings: [
      setting('index-mode', 'Index mode', 'Balance search freshness against CPU and disk use.', 'segmented', 'Balanced', details('Controls file watching, parse depth, symbol extraction, and refresh cadence.','Large repositories may need a lighter index while active code navigation benefits from fresh symbols.','Balanced indexes changed files immediately and defers low-priority deep parsing.','Per project.',['Index exclusions','Memory budget']), { options: ['Light', 'Balanced', 'Deep'] }),
      setting('index-exclusions', 'Index exclusions', 'Review directories and patterns omitted from project search.', 'resource', '8 patterns', details('Applies structured glob rules with previews of matched files.','An explicit list avoids accidentally excluding source through a malformed free-form string.','node_modules, target, .git, and generated artifact directories are excluded by default.','Per project.',['File exclusions']))
    ]}
  ];

  const projectSettingsSections = [
    { id: 'identity', label: 'Identity & Defaults', description: 'Project name, purpose, defaults, and inheritance.', settings: [
      setting('project-name', 'Project display name', 'Change the name shown throughout Puppet Master without renaming the folder.', 'text', 'Puppet Master', details('Updates the project-facing label while preserving repository and filesystem identity.','A display name can be clearer than the directory name and can include spaces.','Keep “Puppet Master” even when the repository directory uses a different slug.','Per project.',['Project location','Repository remote'])),
      setting('project-description', 'Project description', 'Explain what the project is and how Puppet Master should approach it.', 'textarea', 'Agentic coding platform and orchestration environment.', details('Provides concise project context to assistants, onboarding, search, and project switching.','A clear description reduces ambiguity when several repositories have similar names.','Mention the main product and the role of this repository, not a full PRD.','Per project.',['Project instructions','Personas'])),
      setting('inheritance', 'Settings inheritance', 'Choose how this project receives future application-default changes.', 'segmented', 'Copy then diverge', details('Controls whether project values stay linked, inherit only untouched defaults, or remain a fixed copy.','Copy then diverge makes project customization predictable and prevents surprise changes.','A newly added default can still appear, while an edited project value remains independent.','Per project.',['Copy settings from project','Reset category']), { options: ['Follow defaults', 'Copy then diverge', 'Fully independent'] }),
      setting('default-persona', 'Default persona', 'Choose the persona used for new assistant threads in this project.', 'select', 'Puppet Master', details('Sets the initial persona while allowing each thread or Goal to override it.','A project-specific default aligns tone, tools, and planning behavior with the repository.','Use Frontend Craft for a UI-only prototype project.','Per project.',['Personas & Crews','Goal defaults']), { options: ['Puppet Master', 'Generalist', 'Frontend Craft', 'Backend Systems', 'Security Auditor', 'Documentation'] })
    ]},
    { id: 'execution', label: 'Execution & Routing', description: 'Choose project hosts, environments, and default AI routes.', settings: [
      setting('execution-host', 'Default execution host', 'Select where new project tasks run unless a Goal overrides it.', 'select', 'Server host', details('Routes commands, tools, containers, and file operations to a registered execution environment.','A project may be stored remotely while executing on another host, so the distinction must remain visible.','Use Windows WSL for Windows-hosted projects that require Linux toolchains.','Per project.',['Server host','Terminal profile']), { options: ['Server host', 'This device', 'Windows · WSL Ubuntu', 'Linux container host'] }),
      setting('ai-route', 'Default AI route', 'Choose the model route used for ordinary assistant work.', 'select', 'Balanced coding route', details('References a configured provider/model route rather than a provider-wide capability.','A named route can switch accounts or fallbacks without changing every project setting.','Balanced coding route uses a capable primary model with a lower-cost fallback.','Per project.',['AI Providers','Back Seat Driver','Goal route']), { options: ['Balanced coding route', 'Highest quality route', 'Low-cost route', 'Ask each time'] }),
      setting('environment', 'Project environment variables', 'Manage non-secret and secret environment values by host.', 'resource', '18 values · 6 secret', details('Provides a structured key/value manager with scope, host, masking, validation, and import controls.','Separating secret references from plain values reduces accidental exposure in logs and exports.','DATABASE_URL can reference a credential-store secret while RUST_LOG remains plain text.','Per project and host.',['MCP environment','Terminal environment']))
    ]},
    { id: 'assistant', label: 'Assistant & Goal Behavior', description: 'Defaults for context, automation, verification, and interruptions.', settings: [
      setting('goal-mode', 'Default Goal mode', 'Choose whether multi-step requests automatically enter Goal mode.', 'segmented', 'Auto', details('Controls when the assistant creates a tracked Goal with phases, To-Dos, subagents, and verification.','Auto preserves simple chat while giving larger work a durable execution structure.','A repository-wide refactor enters Goal mode; a one-line explanation remains chat.','Per project.',['Goals & Automation']), { options: ['Off', 'Auto', 'Always'] }),
      setting('verification', 'Default verification level', 'Set the minimum checks expected before work is reported complete.', 'select', 'Thorough', details('References the Testing & Debug profile used by Goals and direct build work.','A project-level floor prevents a fast route from skipping required validation.','Thorough can require static checks, targeted tests, browser smoke, and evidence review.','Per project.',['Testing profiles','Goal verification']), { options: ['Fast', 'Standard', 'Thorough', 'Custom profile'] }),
      setting('interruptions', 'Interruption policy', 'Choose when the assistant pauses to ask for guidance.', 'select', 'Only true blockers', details('Defines whether ambiguity, risk, cost, or destructive actions interrupt autonomous progress.','A hands-off default still needs explicit approval for boundaries that cannot be inferred safely.','The assistant continues through reversible choices but pauses before deleting a production database.','Per project.',['Permissions','Goal checkpoints']), { options: ['Ask often', 'Balanced', 'Only true blockers'] })
    ]},
    { id: 'files-sync', label: 'Files, Sync & History', description: 'Project data placement, continuity, and retained activity.', settings: [
      setting('project-files', 'Project file authority', 'Identify the canonical project location and synchronization mode.', 'resource', 'NAS workspace · Healthy', details('Shows the authoritative path or remote source, local cache, sync state, and conflict policy.','Users need to know which copy is authoritative before moving or resuming work elsewhere.','The NAS workspace remains authoritative while this device uses a managed cache.','Per project.',['Project Location & Sync','Backup destination'])),
      setting('history-retention', 'Conversation and Goal history', 'Choose how long project activity remains searchable.', 'select', 'Keep indefinitely', details('Controls retained threads, Goal receipts, subagent histories, and user-visible activity metadata.','Long retention helps continuity but increases storage and privacy exposure.','Keep indefinitely for an active development repository with full audit history.','Per project.',['Data retention','Memory retention']), { options: ['30 days', '90 days', '1 year', 'Keep indefinitely'] }),
      setting('artifact-policy', 'Generated artifact policy', 'Choose where previews, exports, and build artifacts are stored.', 'select', 'Project artifacts', details('Routes generated files into a managed project directory, temporary storage, or a user-selected destination.','A predictable destination prevents files from being scattered across the repository and downloads folder.','Concept screenshots can go to project artifacts while final exports are copied explicitly.','Per project.',['Runtime Artifacts','Cleanup']), { options: ['Project artifacts', 'Temporary until approved', 'Ask each time'] })
    ]}
  ];

  const advancedSections = [
    { id: 'behavior', label: 'Advanced Behavior', description: 'Expert application behavior that should rarely need changing.', settings: [
      setting('telemetry', 'Diagnostic telemetry', 'Choose what anonymous diagnostic information may leave the device.', 'select', 'Crash reports only', details('Controls crash diagnostics, performance traces, and optional usage metrics independently from project content.','Clear categories make data sharing explicit and reversible.','Crash reports can include stack traces while excluding prompts, file contents, and credentials.','Application-wide.',['Privacy','Redaction']), { options: ['Off', 'Crash reports only', 'Crash and performance', 'Custom'] }),
      setting('feature-flags', 'Experimental features', 'Review individually named preview features and their risks.', 'resource', '3 available', details('Shows explicit flags with descriptions, compatibility, rollback behavior, and required restart state.','A structured manager avoids hidden comma-separated flags or undocumented environment variables.','Enable a preview only after reviewing its migration and fallback behavior.','Application-wide.',['Update channel'])),
      setting('developer-mode', 'Developer diagnostics', 'Expose internal identifiers, command IDs, and additional logs.', 'toggle', false, details('Adds technical metadata to inspectors and diagnostic exports without changing ordinary behavior.','This is useful for implementation and support but creates visual noise for most users.','A setting row can reveal its canonical setting ID and owning command.','Application-wide.',['Diagnostic logs']))
    ]},
    { id: 'recovery', label: 'Restore & Recovery', description: 'Reset selected settings safely with a preview and rollback receipt.', settings: [
      setting('restore-defaults', 'Restore default settings', 'Preview and restore defaults by domain, workspace, or entire application.', 'action', 'Open restore preview', details('Compares current values with defaults, lets you select scope, and creates a rollback receipt before applying changes.','A preview prevents a vague “reset” action from unexpectedly clearing unrelated provider or project configuration.','Restore only Appearance while preserving accounts, permissions, and project overrides.','Selected scope; secrets and accounts are excluded unless explicitly chosen.',['Settings Transfer','Backups']))
    ]}
  ];

  const providers = [
    {
      id: 'claude-code', name: 'Claude Code', kind: 'CLI', status: 'active', statusLabel: 'Active · 2 accounts', installed: true, signedIn: true,
      version: 'Detected CLI', installSource: 'Official provider installer', defaultAccount: 'work-claude', product: 'Claude subscription',
      accounts: [
        { id: 'work-claude', nickname: 'Work Claude', identity: 'Playty Team', active: true, default: true, method: 'Provider CLI sign-in', health: 'Healthy', usage: 'Included window available' },
        { id: 'personal-claude', nickname: 'Personal', identity: 'Personal Max', active: true, default: false, method: 'Provider CLI sign-in', health: 'Limit reached', usage: 'Resets at 4:00 PM' }
      ],
      models: [
        { id: 'claude-opus', name: 'Claude Opus', plan: 'Included', enabled: true, caps: ['code', 'reasoning', 'vision', 'tools', 'long-context'], context: 'Large', health: 'Ready' },
        { id: 'claude-sonnet', name: 'Claude Sonnet', plan: 'Included', enabled: true, caps: ['code', 'reasoning', 'vision', 'tools'], context: 'Large', health: 'Ready' },
        { id: 'claude-haiku', name: 'Claude Haiku', plan: 'Included', enabled: true, caps: ['code', 'vision', 'tools'], context: 'Standard', health: 'Ready' }
      ],
      routing: { defaultModel: 'claude-sonnet', accountOrder: ['work-claude', 'personal-claude'], exhaustion: 'Try next eligible account, then fallback route', paidOverage: false },
      diagnostics: ['CLI detected on this device', 'Both accounts authenticated', 'Personal included window currently exhausted']
    },
    {
      id: 'openai-codex', name: 'OpenAI Codex', kind: 'Account', status: 'active', statusLabel: 'Active · 1 account', installed: true, signedIn: true,
      version: 'Direct sign-in', installSource: 'Puppet Master account connection', defaultAccount: 'jared-openai', product: 'ChatGPT plan',
      accounts: [{ id: 'jared-openai', nickname: 'Jared', identity: 'ChatGPT account', active: true, default: true, method: 'Browser sign-in', health: 'Healthy', usage: 'Included usage healthy' }],
      models: [
        { id: 'gpt-codex', name: 'Codex coding model', plan: 'Included', enabled: true, caps: ['code', 'reasoning', 'tools', 'browser'], context: 'Large', health: 'Ready' },
        { id: 'gpt-general', name: 'GPT general model', plan: 'Included', enabled: true, caps: ['reasoning', 'vision', 'tools', 'browser'], context: 'Large', health: 'Ready' },
        { id: 'gpt-image', name: 'GPT Image', plan: 'Metered', enabled: true, caps: ['image-generation', 'image-editing'], context: 'N/A', health: 'Ready' }
      ],
      routing: { defaultModel: 'gpt-codex', accountOrder: ['jared-openai'], exhaustion: 'Ask before paid usage, otherwise fallback', paidOverage: false },
      diagnostics: ['Account token valid', 'Model catalog refreshed recently', 'Invocation test passed']
    },
    {
      id: 'cursor-cli', name: 'Cursor CLI', kind: 'CLI', status: 'not-installed', statusLabel: 'Not installed', installed: false, signedIn: false,
      version: 'Not detected', installSource: 'Official provider installer only', defaultAccount: null, product: 'Not detected', accounts: [], models: [],
      routing: { defaultModel: null, accountOrder: [], exhaustion: 'Not applicable', paidOverage: false },
      diagnostics: ['Cursor CLI was not found on this execution host']
    },
    {
      id: 'kimi-coding', name: 'Kimi For Coding', kind: 'Account', status: 'active', statusLabel: 'Active · 1 account', installed: true, signedIn: true,
      version: 'Connected account', installSource: 'Puppet Master sign-in', defaultAccount: 'kimi-primary', product: 'Coding plan',
      accounts: [{ id: 'kimi-primary', nickname: 'Primary', identity: 'Kimi coding account', active: true, default: true, method: 'Browser sign-in', health: 'Healthy', usage: 'Plan available' }],
      models: [
        { id: 'kimi-k3', name: 'Kimi K3', plan: 'Included', enabled: true, caps: ['code', 'reasoning', 'tools', 'long-context'], context: 'Very large', health: 'Ready' },
        { id: 'kimi-fast', name: 'Kimi Fast', plan: 'Included', enabled: true, caps: ['code', 'tools'], context: 'Large', health: 'Ready' }
      ],
      routing: { defaultModel: 'kimi-k3', accountOrder: ['kimi-primary'], exhaustion: 'Fallback to balanced coding route', paidOverage: false },
      diagnostics: ['Account healthy', 'Catalog current']
    },
    {
      id: 'qwen-coding', name: 'Qwen Coding Plan', kind: 'Account', status: 'active', statusLabel: 'Active · 2 accounts', installed: true, signedIn: true,
      version: 'Connected accounts', installSource: 'Puppet Master sign-in', defaultAccount: 'qwen-work', product: 'Coding plan',
      accounts: [
        { id: 'qwen-work', nickname: 'Work', identity: 'Qwen account', active: true, default: true, method: 'Browser sign-in', health: 'Healthy', usage: 'Plan available' },
        { id: 'qwen-personal', nickname: 'Personal', identity: 'Qwen account', active: true, default: false, method: 'Browser sign-in', health: 'Healthy', usage: 'Plan available' }
      ],
      models: [
        { id: 'qwen-coder', name: 'Qwen Coder', plan: 'Included', enabled: true, caps: ['code', 'reasoning', 'tools'], context: 'Large', health: 'Ready' },
        { id: 'qwen-vision', name: 'Qwen Vision', plan: 'Included', enabled: true, caps: ['vision', 'reasoning', 'tools'], context: 'Large', health: 'Ready' }
      ],
      routing: { defaultModel: 'qwen-coder', accountOrder: ['qwen-work', 'qwen-personal'], exhaustion: 'Try next account, then fallback', paidOverage: false },
      diagnostics: ['Two accounts eligible', 'Invocation test passed']
    },
    {
      id: 'github-copilot', name: 'GitHub Copilot', kind: 'Account', status: 'attention', statusLabel: 'Signed in · Cannot invoke', installed: true, signedIn: true,
      version: 'Connected account', installSource: 'GitHub sign-in', defaultAccount: 'github-jared', product: 'Seat unavailable',
      accounts: [{ id: 'github-jared', nickname: 'Jared', identity: 'GitHub account', active: true, default: true, method: 'Browser sign-in', health: 'Subscription error', usage: 'No active Copilot seat' }],
      models: [{ id: 'copilot-catalog', name: 'Last known catalog', plan: 'Unavailable', enabled: false, caps: ['code', 'tools'], context: 'Unknown', health: 'Invocation blocked' }],
      routing: { defaultModel: null, accountOrder: ['github-jared'], exhaustion: 'Stop and wait', paidOverage: false },
      diagnostics: ['Authentication valid', 'Latest model invocation returned a subscription error', 'Reconnect after seat renewal']
    },
    {
      id: 'antigravity', name: 'Google Antigravity', kind: 'CLI', status: 'attention', statusLabel: 'Installed · Sign in', installed: true, signedIn: false,
      version: 'Detected CLI', installSource: 'Official provider installer', defaultAccount: null, product: 'Last known catalog', accounts: [],
      models: [
        { id: 'gemini-pro-last', name: 'Gemini Pro · last known', plan: 'Unknown', enabled: false, caps: ['reasoning', 'vision', 'tools', 'browser'], context: 'Large', health: 'Sign-in required' },
        { id: 'gemini-flash-last', name: 'Gemini Flash · last known', plan: 'Unknown', enabled: false, caps: ['reasoning', 'vision', 'tools'], context: 'Large', health: 'Sign-in required' }
      ],
      routing: { defaultModel: null, accountOrder: [], exhaustion: 'Stop and wait', paidOverage: false },
      diagnostics: ['CLI installed', 'Provider sign-in expired', 'Catalog is shown from the last successful refresh']
    },
    {
      id: 'openrouter', name: 'OpenRouter', kind: 'API', status: 'active', statusLabel: 'Active · 1 key', installed: true, signedIn: true,
      version: 'API connection', installSource: 'Credential store', defaultAccount: 'openrouter-main', product: 'Pay-as-you-go',
      accounts: [{ id: 'openrouter-main', nickname: 'Main key', identity: 'OpenRouter API key', active: true, default: true, method: 'API key', health: 'Healthy', usage: 'Credit available' }],
      models: [
        { id: 'or-deepseek', name: 'DeepSeek route', plan: 'Metered', enabled: true, caps: ['code', 'reasoning', 'tools'], context: 'Large', health: 'Ready' },
        { id: 'or-llama', name: 'Llama route', plan: 'Metered', enabled: true, caps: ['reasoning', 'tools'], context: 'Large', health: 'Ready' }
      ],
      routing: { defaultModel: 'or-deepseek', accountOrder: ['openrouter-main'], exhaustion: 'Stop at configured credit guard', paidOverage: true },
      diagnostics: ['Key valid', 'Credit guard enabled', 'Catalog refresh running in background']
    },
    {
      id: 'free-models', name: 'Free Models', kind: 'Grouped routes', status: 'active', statusLabel: 'Active · 4 routes', installed: true, signedIn: true,
      version: 'Managed collection', installSource: 'Nested route setup', defaultAccount: null, product: 'Free and community terms', accounts: [], models: [],
      routing: { defaultModel: 'free-auto', accountOrder: [], exhaustion: 'Try next eligible free route', paidOverage: false },
      diagnostics: ['Four routes enabled', 'One enabled route needs attention', 'Disabled routes have no configuration controls until enabled']
    }
  ];

  const freeRoutes = [
    { id: 'free-openrouter', name: 'OpenRouter Free Models', provider: 'OpenRouter', enabled: true, status: 'active', signIn: 'Uses configured OpenRouter key', models: ['Free coder route', 'Free general route'], priority: 1, limit: 'Provider-defined availability', terms: 'Models and limits can change without notice.' },
    { id: 'free-github-models', name: 'GitHub Models', provider: 'GitHub', enabled: true, status: 'active', signIn: 'GitHub account connected', models: ['Community coding model', 'Community vision model'], priority: 2, limit: 'Daily request allowance', terms: 'Subject to GitHub Models terms.' },
    { id: 'free-cerebras', name: 'Cerebras Free Tier', provider: 'Cerebras', enabled: true, status: 'attention', signIn: 'Reconnect required', models: ['Fast coding model'], priority: 3, limit: 'Rate-limited', terms: 'Free-tier availability varies.' },
    { id: 'free-groq', name: 'Groq Free Tier', provider: 'Groq', enabled: true, status: 'active', signIn: 'API key healthy', models: ['Fast general model'], priority: 4, limit: 'Rate-limited', terms: 'Free-tier limits apply.' },
    { id: 'free-hf', name: 'Hugging Face Inference', provider: 'Hugging Face', enabled: false, status: 'disabled', signIn: 'Not configured', models: [], priority: null, limit: 'Varies by model', terms: 'Enable to reveal setup and provider controls.' },
    { id: 'free-community', name: 'Community Relay', provider: 'Community', enabled: false, status: 'disabled', signIn: 'Not configured', models: [], priority: null, limit: 'Best effort', terms: 'Enable only after reviewing privacy and reliability terms.' }
  ];

  const webRoutes = [
    {
      id: 'search', name: 'Search', icon: 'search', status: 'ready', description: 'Find relevant sources and current information.',
      primary: { type: 'model', provider: 'OpenAI Codex', model: 'GPT general model', account: 'Jared', mode: 'Search tool + model synthesis' },
      fallbacks: [
        { type: 'model', provider: 'Google Antigravity', model: 'Gemini Pro · last known', account: 'Sign-in required', enabled: false },
        { type: 'tool', provider: 'Built-in', model: 'Search adapter', account: 'No account', enabled: true }
      ],
      policy: { maxSources: 12, timeout: 45, citations: 'Required', privacy: 'Standard', costGuard: 'Prefer included usage' }
    },
    {
      id: 'fetch', name: 'Fetch', icon: 'download', status: 'ready', description: 'Retrieve a specific page or document.',
      primary: { type: 'tool', provider: 'Built-in', model: 'HTTP Fetch', account: 'No account', mode: 'Deterministic tool' },
      fallbacks: [{ type: 'model', provider: 'OpenAI Codex', model: 'GPT general model', account: 'Jared', enabled: true }],
      policy: { maxSize: '20 MB', timeout: 30, robots: 'Respect', certificates: 'Strict', cache: '15 minutes' }
    },
    {
      id: 'crawl', name: 'Crawl', icon: 'network', status: 'setup', description: 'Traverse multiple pages within a permitted scope.',
      primary: { type: 'tool', provider: 'Built-in', model: 'Crawl adapter', account: 'No account', mode: 'Deterministic tool' },
      fallbacks: [], policy: { maxPages: 50, maxDepth: 3, timeout: 180, robots: 'Respect', concurrency: 4 }
    },
    {
      id: 'browser', name: 'Browser', icon: 'browser', status: 'ready', description: 'Use an interactive browser with model-directed actions.',
      primary: { type: 'model', provider: 'OpenAI Codex', model: 'Codex coding model', account: 'Jared', mode: 'Built-in browser + model' },
      fallbacks: [{ type: 'model', provider: 'Claude Code', model: 'Claude Sonnet', account: 'Work Claude', enabled: true }],
      policy: { profile: 'Isolated project profile', downloads: 'Ask', credentials: 'Never expose', timeout: 300, screenshots: 'On failure' }
    },
    {
      id: 'map', name: 'Map', icon: 'map', status: 'ready', description: 'Build a structured site or repository content map.',
      primary: { type: 'model', provider: 'Claude Code', model: 'Claude Haiku', account: 'Work Claude', mode: 'Fetch + model classification' },
      fallbacks: [{ type: 'model', provider: 'Kimi For Coding', model: 'Kimi Fast', account: 'Primary', enabled: true }],
      policy: { output: 'Structured JSON', maxNodes: 500, deduplicate: true, includeMetadata: true }
    },
    {
      id: 'extract', name: 'Extract', icon: 'brackets', status: 'ready', description: 'Turn pages and documents into validated structured data.',
      primary: { type: 'model', provider: 'Claude Code', model: 'Claude Sonnet', account: 'Work Claude', mode: 'Schema-guided extraction' },
      fallbacks: [{ type: 'model', provider: 'OpenAI Codex', model: 'GPT general model', account: 'Jared', enabled: true }],
      policy: { validation: 'Strict schema', retries: 2, citations: 'Preserve source offsets', pii: 'Redact in logs' }
    }
  ];

  const mediaRoutes = [
    { id: 'image-generation', name: 'Image Generation', icon: 'image', status: 'ready', primary: { provider: 'OpenAI Codex', model: 'GPT Image', account: 'Jared' }, fallbacks: [], output: { format: 'PNG', quality: 'High', destination: 'Project artifacts/images', metadata: 'Preserve prompt receipt' } },
    { id: 'image-understanding', name: 'Image Understanding', icon: 'eye', status: 'ready', primary: { provider: 'Claude Code', model: 'Claude Opus', account: 'Work Claude' }, fallbacks: [{ provider: 'OpenAI Codex', model: 'GPT general model', account: 'Jared' }], output: { detail: 'Adaptive', ocr: 'Only when needed', retention: 'Project policy' } },
    { id: 'transcription', name: 'Speech & Transcription', icon: 'mic', status: 'setup', primary: { provider: 'OpenAI Codex', model: 'Transcription model', account: 'Jared' }, fallbacks: [], output: { format: 'Text + timestamps', language: 'Auto-detect', speakers: 'Detect when supported' } },
    { id: 'text-to-speech', name: 'Text to Speech', icon: 'volume', status: 'ready', primary: { provider: 'OpenAI Codex', model: 'Speech model', account: 'Jared' }, fallbacks: [], output: { voice: 'Neutral', format: 'WAV', destination: 'Project artifacts/audio' } },
    { id: 'audio-generation', name: 'Audio Generation', icon: 'wave', status: 'setup', primary: { provider: 'Not configured', model: 'Choose a supported model', account: 'None' }, fallbacks: [], output: { format: 'WAV', duration: 'Ask', destination: 'Project artifacts/audio' } },
    { id: 'video-generation', name: 'Video Generation', icon: 'video', status: 'setup', primary: { provider: 'Not configured', model: 'Choose a supported model', account: 'None' }, fallbacks: [], output: { format: 'MP4', quality: '1080p', destination: 'Project artifacts/video' } },
    { id: 'artifact-output', name: 'Document & Artifact Output', icon: 'file', status: 'ready', primary: { provider: 'Built-in', model: 'Artifact renderer', account: 'No account' }, fallbacks: [], output: { formats: 'PDF, DOCX, PPTX, XLSX', destination: 'Project artifacts/exports', overwrite: 'Never without approval' } }
  ];

  const bsd = {
    mode: 'Auto', provider: 'Claude Code', model: 'Claude Sonnet', account: 'Work Claude',
    fallbackProvider: 'OpenAI Codex', fallbackModel: 'Codex coding model', sensitivity: 'Balanced',
    usageBoundary: 'Use included plans only', intervention: 'Interrupt only when advice is actionable',
    contexts: ['Long-running Goals', 'Risky source-control operations', 'Repeated failures', 'Architecture drift']
  };

  const toolchain = {
    lsps: [
      { id: 'rust-analyzer', name: 'rust-analyzer', language: 'Rust', source: 'Auto-detected toolchain', command: 'rust-analyzer', args: [], rootMarkers: ['Cargo.toml', 'rust-project.json'], status: 'ready', scope: 'Project', lastTest: 'Passed' },
      { id: 'typescript', name: 'TypeScript Language Server', language: 'TypeScript / JavaScript', source: 'Workspace package', command: 'node_modules/.bin/typescript-language-server', args: ['--stdio'], rootMarkers: ['package.json', 'tsconfig.json'], status: 'ready', scope: 'Project', lastTest: 'Passed' },
      { id: 'pyright', name: 'Pyright', language: 'Python', source: 'Managed tool', command: 'pyright-langserver', args: ['--stdio'], rootMarkers: ['pyproject.toml', 'requirements.txt'], status: 'attention', scope: 'Project', lastTest: 'Restart required' }
    ],
    formatters: [
      { id: 'prettier', name: 'Prettier', languages: ['JavaScript', 'TypeScript', 'JSON', 'CSS', 'Markdown'], source: 'Workspace package', executable: 'node_modules/.bin/prettier', args: ['--stdin-filepath', '${file}'], config: '.prettierrc', ignore: '.prettierignore', onSave: true, onPaste: false, changedLines: false, status: 'ready' },
      { id: 'rustfmt', name: 'rustfmt', languages: ['Rust'], source: 'Rust toolchain', executable: 'rustfmt', args: ['--edition', '2024'], config: 'rustfmt.toml', ignore: 'None', onSave: true, onPaste: false, changedLines: false, status: 'ready' },
      { id: 'ruff-format', name: 'Ruff Format', languages: ['Python'], source: 'Project environment', executable: '.venv/bin/ruff', args: ['format', '--stdin-filename', '${file}', '-'], config: 'pyproject.toml', ignore: '.gitignore', onSave: true, onPaste: false, changedLines: true, status: 'ready' }
    ],
    mcps: [
      { id: 'github-mcp', name: 'GitHub MCP', transport: 'stdio', command: 'github-mcp-server', args: ['stdio'], env: ['GITHUB_TOKEN → credential store'], url: '', headers: [], status: 'ready', tools: 21, permissions: 'Ask for writes', scope: 'Project' },
      { id: 'filesystem-mcp', name: 'Filesystem MCP', transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '${projectRoot}'], env: [], url: '', headers: [], status: 'ready', tools: 12, permissions: 'FileSafe boundaries', scope: 'Project' },
      { id: 'linear-mcp', name: 'Linear MCP', transport: 'http', command: '', args: [], env: [], url: 'https://mcp.example.invalid/linear', headers: ['Authorization → credential store'], status: 'attention', tools: 0, permissions: 'Read only until tested', scope: 'User' }
    ],
    commands: [
      { id: 'goal-new', name: 'Create Goal', command: '/goal', shortcut: 'Ctrl+Shift+G', category: 'Goals', enabled: true },
      { id: 'context-compact', name: 'Compact Context', command: '/context compact', shortcut: 'Ctrl+Alt+C', category: 'Context', enabled: true },
      { id: 'test-current', name: 'Test Current File', command: '/test current', shortcut: 'Ctrl+Alt+T', category: 'Testing', enabled: true },
      { id: 'provider-check', name: 'Check Provider Connection', command: '/provider check', shortcut: '', category: 'Providers', enabled: true }
    ],
    skills: [
      { id: 'frontend-polish', name: 'Frontend Polish', source: 'Built-in', status: 'enabled', scope: 'Project', version: '1.0', requirements: 'Browser capability' },
      { id: 'repo-audit', name: 'Repository Audit', source: 'Built-in', status: 'enabled', scope: 'Project', version: '1.2', requirements: 'Source control read access' },
      { id: 'release-notes', name: 'Release Notes', source: 'Imported', status: 'disabled', scope: 'User', version: '0.8', requirements: 'Git history' }
    ],
    plugins: [
      { id: 'github', name: 'GitHub', status: 'enabled', version: 'Built-in', permissions: ['Repositories', 'Pull requests', 'Actions'], update: 'Managed with app' },
      { id: 'calendar', name: 'Calendar Connector', status: 'disabled', version: 'Optional', permissions: ['Calendar events'], update: 'Available' },
      { id: 'gmail', name: 'Gmail Connector', status: 'disabled', version: 'Optional', permissions: ['Email read', 'Drafts', 'Send with approval'], update: 'Available' }
    ],
    agentTools: [
      { id: 'browser', name: 'Built-in Browser', owner: 'Puppet Master', status: 'ready', permission: 'Ask for sensitive actions', priority: 1 },
      { id: 'github-tools', name: 'GitHub Tools', owner: 'GitHub plugin', status: 'ready', permission: 'Ask for writes', priority: 2 },
      { id: 'filesystem-tools', name: 'Filesystem Tools', owner: 'Filesystem MCP', status: 'ready', permission: 'FileSafe', priority: 3 }
    ]
  };

  const testProfiles = [
    { id: 'fast', name: 'Fast feedback', description: 'Static checks and tests nearest the changed files.', trigger: 'After meaningful edits', stages: ['Compile/type check', 'Targeted unit tests', 'Changed-file lint'], browser: 'Smoke only when GUI-related', native: 'Build check', evidence: 'Failures and summary', status: 'ready' },
    { id: 'thorough', name: 'Thorough verification', description: 'Repository-aware testing plus visual and runtime inspection.', trigger: 'Before completion', stages: ['Static analysis', 'Unit and integration tests', 'Browser interaction QA', 'Visual inspection', 'Artifact verification'], browser: 'Required for GUI-related work', native: 'Launch and smoke', evidence: 'Receipts, logs, screenshots on failure', status: 'default' },
    { id: 'release', name: 'Release candidate', description: 'Full supported matrix and packaging verification.', trigger: 'Manual or release Goal', stages: ['Clean build', 'Full tests', 'Platform matrix', 'Migration checks', 'Package integrity'], browser: 'Full workflow suite', native: 'Supported host matrix', evidence: 'Retained release receipt', status: 'ready' }
  ];

  const debugProfiles = [
    { id: 'native', name: 'Native application', adapter: 'Detected native debugger', program: 'Current build target', args: '', env: 'Project environment', cwd: '${projectRoot}', status: 'ready' },
    { id: 'web', name: 'Web GUI', adapter: 'Browser devtools', program: 'WASM dev server', args: '--inspect', env: 'Development', cwd: '${projectRoot}', status: 'ready' },
    { id: 'test', name: 'Current test', adapter: 'Language-aware', program: 'Selected test', args: '--nocapture', env: 'Test', cwd: '${projectRoot}', status: 'ready' }
  ];

  const memories = [
    { id: 'm1', title: 'Repository authority order', store: 'Project', type: 'Rule', source: 'User instruction', updated: 'Today', confidence: 'Explicit', pinned: true, text: 'The current repository owns source structure and build scripts; approved polished concepts own visual behavior.' },
    { id: 'm2', title: 'Provider CLI installation rule', store: 'Project', type: 'Decision', source: 'Planning record', updated: 'Yesterday', confidence: 'Confirmed', pinned: true, text: 'Provider CLIs are installed only from official providers after an explicit user action.' },
    { id: 'm3', title: 'Preferred UI motion', store: 'User', type: 'Preference', source: 'Conversation', updated: '3 days ago', confidence: 'Explicit', pinned: false, text: 'Animations should be slow enough to communicate continuity, smooth, and free of black flashes.' },
    { id: 'm4', title: 'Temporary build path', store: 'Thread', type: 'Working context', source: 'Tool output', updated: '8 minutes ago', confidence: 'Observed', pinned: false, text: '/mnt/data/... is temporary and should not become a durable project memory.' },
    { id: 'm5', title: 'WorkNodes timing', store: 'Project', type: 'Decision', source: 'Project history', updated: '2 weeks ago', confidence: 'Confirmed', pinned: false, text: 'WorkNodes implementation follows the Plans and orchestration foundation.' }
  ];

  const goalTemplates = [
    { id: 'implementation', name: 'Implementation Goal', description: 'Plan, build, test, visually inspect when applicable, and produce a clean deliverable.', persona: 'Puppet Master', route: 'Balanced coding route', phases: ['Understand', 'Plan', 'Build', 'Verify', 'Deliver'], checkpoints: ['Before irreversible operations'], subagents: 'Automatic by workload', verification: 'Thorough', evidence: 'Retain compact receipt' },
    { id: 'audit', name: 'Audit & Repair', description: 'Inspect an existing implementation, identify omissions, repair them, and certify the result.', persona: 'Repository Auditor', route: 'Highest quality route', phases: ['Inventory', 'Audit', 'Repair', 'Re-audit', 'Certify'], checkpoints: ['When authority conflicts'], subagents: 'Use independent auditor', verification: 'Thorough', evidence: 'Detailed findings' },
    { id: 'research', name: 'Research & Decision', description: 'Gather current primary evidence, compare alternatives, and record a decision.', persona: 'Research Lead', route: 'Research route', phases: ['Frame', 'Research', 'Compare', 'Decide'], checkpoints: ['Before paid or high-risk access'], subagents: 'Parallel sources', verification: 'Source review', evidence: 'Citations and decision record' }
  ];

  const activeGoals = [
    { id: 'g1', name: 'Settings Concept 12 · Kimi refinement', state: 'Running', phase: 'Verify', progress: 82, route: 'Claude Code · Claude Sonnet', persona: 'Frontend Craft', checkpoint: 'None', updated: 'Now' },
    { id: 'g2', name: 'Provider architecture audit', state: 'Paused', phase: 'Repair', progress: 58, route: 'OpenAI Codex · Codex coding model', persona: 'Repository Auditor', checkpoint: 'Waiting for resume', updated: 'Yesterday' }
  ];

  const personas = [
    { id: 'puppet-master', name: 'Puppet Master', group: 'Core', locked: true, description: 'Default orchestration persona for end-to-end project work.', tone: 'Focused, explanatory, proactive', route: 'Balanced coding route', tools: ['All approved project tools'], prompt: 'Coordinate work, preserve authority, use subagents when useful, and verify before delivery.', crews: ['Default Crew'] },
    { id: 'generalist', name: 'Generalist', group: 'Core', locked: true, description: 'Flexible assistant for ordinary questions and mixed tasks.', tone: 'Clear, adaptive', route: 'Balanced route', tools: ['Standard tools'], prompt: 'Solve the user’s request directly and adapt depth to the task.', crews: [] },
    { id: 'planner', name: 'Planning Compiler', group: 'Core', locked: true, description: 'Turns goals and requirements into coherent Plans and acceptance criteria.', tone: 'Structured, exacting', route: 'Highest quality route', tools: ['Repository read', 'Planning tools'], prompt: 'Resolve ambiguity, preserve requirements, and produce executable plans.', crews: ['Planning Crew'] },
    { id: 'auditor', name: 'Repository Auditor', group: 'Core', locked: true, description: 'Independently verifies implementation, evidence, and governance.', tone: 'Skeptical, precise', route: 'Highest quality route', tools: ['Repository read', 'Testing', 'Source control'], prompt: 'Verify claims against source and runtime behavior. Repair or clearly record failures.', crews: ['Audit Crew'] },
    { id: 'frontend', name: 'Frontend Craft', group: 'Bundled', locked: false, description: 'UI engineering, accessibility, interaction, and motion specialist.', tone: 'Design-literate, detail-oriented', route: 'Visual coding route', tools: ['Browser', 'Files', 'Testing'], prompt: 'Build polished, accessible interfaces and inspect motion and responsive behavior.', crews: ['UI Crew'] },
    { id: 'motion', name: 'Motion Director', group: 'Bundled', locked: false, description: 'Reviews animation continuity, timing, easing, and visual defects.', tone: 'Observant, cinematic', route: 'Vision route', tools: ['Browser', 'Video inspection'], prompt: 'Use motion to communicate spatial continuity. Reject flashes, jumps, and unreadable transitions.', crews: ['UI Crew'] },
    { id: 'backend', name: 'Backend Systems', group: 'Bundled', locked: false, description: 'Systems architecture, APIs, persistence, and concurrency.', tone: 'Technical, pragmatic', route: 'Systems coding route', tools: ['Terminal', 'Files', 'Testing'], prompt: 'Favor explicit contracts, safe concurrency, and operational clarity.', crews: ['Runtime Crew'] },
    { id: 'security', name: 'Security Auditor', group: 'Bundled', locked: false, description: 'Threat modeling, permissions, secrets, and dependency review.', tone: 'Cautious, evidence-driven', route: 'Highest quality route', tools: ['Repository read', 'Security scanners'], prompt: 'Identify trust boundaries and validate that safeguards are enforceable.', crews: ['Audit Crew'] },
    { id: 'testing', name: 'Test Engineer', group: 'Bundled', locked: false, description: 'Builds realistic automated and exploratory verification.', tone: 'Methodical, adversarial', route: 'Coding route', tools: ['Testing', 'Browser', 'Terminal'], prompt: 'Test behavior, not only implementation details; preserve useful failure evidence.', crews: ['Audit Crew'] },
    { id: 'research', name: 'Research Lead', group: 'Bundled', locked: false, description: 'Current, source-grounded technical and product research.', tone: 'Analytical, citation-focused', route: 'Research route', tools: ['Web', 'Documents'], prompt: 'Use authoritative current sources and separate evidence from inference.', crews: ['Research Crew'] },
    { id: 'docs', name: 'Documentation', group: 'Bundled', locked: false, description: 'Writes product, architecture, and user-facing documentation.', tone: 'Accessible, organized', route: 'Writing route', tools: ['Files', 'Repository read'], prompt: 'Explain the right level of detail with accurate terminology and examples.', crews: [] },
    { id: 'source-control', name: 'Source Control Steward', group: 'Bundled', locked: false, description: 'Git, Jujutsu, branches, worktrees, recovery, and forge workflows.', tone: 'Careful, procedural', route: 'Coding route', tools: ['Source control', 'GitHub'], prompt: 'Preserve work, explain state transitions, and avoid destructive history changes.', crews: ['Runtime Crew'] },
    { id: 'perf', name: 'Performance Engineer', group: 'Bundled', locked: false, description: 'Profiles CPU, memory, startup, and rendering performance.', tone: 'Quantitative, disciplined', route: 'Systems coding route', tools: ['Profiler', 'Testing'], prompt: 'Measure before optimizing and keep regressions reproducible.', crews: ['Runtime Crew'] },
    { id: 'product', name: 'Product Designer', group: 'Bundled', locked: false, description: 'User journeys, information architecture, and product coherence.', tone: 'User-centered, decisive', route: 'Visual reasoning route', tools: ['Browser', 'Images'], prompt: 'Organize around user tasks and reduce cognitive overhead without hiding capability.', crews: ['UI Crew'] },
    { id: 'custom-pm', name: 'Puppet Master Maintainer', group: 'Custom', locked: false, description: 'Custom repository maintainer tuned to this project’s governance.', tone: 'Direct, thorough', route: 'Highest quality route', tools: ['All project tools'], prompt: 'Respect canonical ownership, update generated artifacts through their build pipeline, and audit for dropped details.', crews: ['Default Crew'] },
    { id: 'custom-ux', name: 'Settings UX Reviewer', group: 'Custom', locked: false, description: 'Custom persona for Settings readability and manager completeness.', tone: 'Constructive, exacting', route: 'Visual coding route', tools: ['Browser', 'Vision', 'Testing'], prompt: 'Audit every manager for setup, management, testing, recovery, and removal while preserving scanability.', crews: ['UI Crew'] }
  ];

  const crews = [
    { id: 'default', name: 'Default Crew', members: ['Puppet Master', 'Puppet Master Maintainer'], lead: 'Puppet Master', route: 'Per persona', handoff: 'Structured task receipt', concurrency: 3 },
    { id: 'ui', name: 'UI Crew', members: ['Frontend Craft', 'Motion Director', 'Product Designer', 'Settings UX Reviewer'], lead: 'Frontend Craft', route: 'Visual coding route', handoff: 'Screens + interaction findings', concurrency: 4 },
    { id: 'audit', name: 'Audit Crew', members: ['Repository Auditor', 'Security Auditor', 'Test Engineer'], lead: 'Repository Auditor', route: 'Highest quality route', handoff: 'Independent evidence', concurrency: 3 },
    { id: 'runtime', name: 'Runtime Crew', members: ['Backend Systems', 'Source Control Steward', 'Performance Engineer'], lead: 'Backend Systems', route: 'Systems coding route', handoff: 'Contracts and test receipts', concurrency: 3 }
  ];

  const sourceControl = {
    tools: [
      { id: 'git', name: 'Git', kind: 'Local tool', host: 'Server host', version: '2.51', status: 'ready', source: 'System package', default: true },
      { id: 'jj', name: 'Jujutsu', kind: 'Local tool', host: 'Server host', version: '0.33', status: 'ready', source: 'Official release', default: false },
      { id: 'git-lfs', name: 'Git LFS', kind: 'Local tool', host: 'Server host', version: '3.7', status: 'ready', source: 'System package', default: false }
    ],
    forges: [
      { id: 'github', name: 'GitHub', status: 'active', accounts: 1, defaultAccount: 'sittingmongoose', scopes: ['Repository', 'Pull requests', 'Actions'], ssh: 'Healthy', lastTest: 'Passed' },
      { id: 'gitlab', name: 'GitLab', status: 'not-connected', accounts: 0, defaultAccount: 'None', scopes: [], ssh: 'Not tested', lastTest: 'Not run' },
      { id: 'azure', name: 'Azure DevOps', status: 'not-connected', accounts: 0, defaultAccount: 'None', scopes: [], ssh: 'Not tested', lastTest: 'Not run' },
      { id: 'bitbucket', name: 'Bitbucket', status: 'not-connected', accounts: 0, defaultAccount: 'None', scopes: [], ssh: 'Not tested', lastTest: 'Not run' }
    ],
    repositories: [
      { name: 'Puppet-Master', forge: 'GitHub', remote: 'origin', branch: 'main', state: 'Clean', protection: 'Protected', lfs: 'Ready' },
      { name: 'Concept scratch', forge: 'Local', remote: 'None', branch: 'settings-concept', state: '3 changed', protection: 'None', lfs: 'Not needed' }
    ],
    worktrees: [
      { name: 'main', path: '/mnt/Cursor/Puppet Master', branch: 'main', owner: 'User', state: 'Clean', lease: 'Persistent' },
      { name: 'settings-concept', path: '/mnt/Cursor/.worktrees/settings-concept', branch: 'concept/settings-12', owner: 'Goal g1', state: '3 changed', lease: 'Active Goal' },
      { name: 'audit-temp', path: '/mnt/Cursor/.worktrees/audit-temp', branch: 'audit/settings', owner: 'No active owner', state: 'Clean', lease: 'Stale · 3 days' }
    ],
    actions: [
      { name: 'Build and test', workflow: 'ci.yml', status: 'passing', trigger: 'Push and pull request', pinned: true, lastRun: '8 minutes ago' },
      { name: 'Concept visual QA', workflow: 'concept-qa.yml', status: 'passing', trigger: 'Manual', pinned: true, lastRun: 'Yesterday' },
      { name: 'Release', workflow: 'release.yml', status: 'not-run', trigger: 'Tag', pinned: false, lastRun: 'Never' }
    ]
  };

  const notifications = {
    destinations: [
      { id: 'in-app', name: 'In-app', type: 'Built-in', status: 'active', address: 'Activity center', urgent: true },
      { id: 'system', name: 'System notifications', type: 'Operating system', status: 'active', address: 'This device', urgent: true },
      { id: 'discord', name: 'Project Discord', type: 'Discord webhook', status: 'active', address: '••••/pm-alerts', urgent: false },
      { id: 'ntfy', name: 'Phone alerts', type: 'ntfy', status: 'attention', address: 'pm-private-topic', urgent: true }
    ],
    agents: [
      { id: 'completion', name: 'Goal completion agent', events: ['Goal completed', 'Goal failed'], destinations: ['In-app', 'System notifications'], escalation: 'Discord after 5 minutes', status: 'active' },
      { id: 'approval', name: 'Approval agent', events: ['Approval required', 'Agent blocked'], destinations: ['System notifications', 'Phone alerts'], escalation: 'Repeat urgent after 10 minutes', status: 'active' },
      { id: 'provider', name: 'Provider health agent', events: ['Usage exhausted', 'Authentication expired'], destinations: ['In-app'], escalation: 'None', status: 'active' }
    ],
    events: [
      { name: 'Goal completed', enabled: true, destinations: ['In-app', 'System notifications'], sound: 'Peon ready', priority: 'Normal' },
      { name: 'Approval required', enabled: true, destinations: ['System notifications', 'Phone alerts'], sound: 'Attention chime', priority: 'Urgent' },
      { name: 'Agent blocked', enabled: true, destinations: ['System notifications', 'Phone alerts'], sound: 'Peon warning', priority: 'Urgent' },
      { name: 'Provider usage exhausted', enabled: true, destinations: ['In-app'], sound: 'Soft warning', priority: 'Normal' },
      { name: 'Backup failed', enabled: true, destinations: ['System notifications', 'Project Discord'], sound: 'Failure pulse', priority: 'Urgent' },
      { name: 'Update available', enabled: false, destinations: ['In-app'], sound: 'None', priority: 'Low' }
    ],
    sounds: [
      { id: 'peon-ready', name: 'Peon ready', source: 'PeonPing pack', duration: '0:01.4', format: 'WAV', assignments: 1, volume: 70 },
      { id: 'peon-warning', name: 'Peon warning', source: 'PeonPing pack', duration: '0:01.8', format: 'WAV', assignments: 1, volume: 78 },
      { id: 'attention', name: 'Attention chime', source: 'Built-in', duration: '0:02.1', format: 'WAV', assignments: 1, volume: 75 },
      { id: 'soft-warning', name: 'Soft warning', source: 'Built-in', duration: '0:01.2', format: 'WAV', assignments: 1, volume: 58 },
      { id: 'failure', name: 'Failure pulse', source: 'Custom upload', duration: '0:02.7', format: 'MP3', assignments: 1, volume: 80 }
    ],
    packs: [
      { id: 'peonping', name: 'PeonPing Essentials', source: 'Imported compatible pack', sounds: 12, status: 'active', license: 'Verified', version: '1.1' }
    ],
    quiet: { enabled: true, start: '10:30 PM', end: '8:00 AM', urgentOverride: true, weekends: 'Same schedule' },
    history: [
      { time: '10:42 AM', event: 'Goal completed', destination: 'System notifications', result: 'Delivered', latency: '180 ms' },
      { time: '9:15 AM', event: 'Provider usage exhausted', destination: 'In-app', result: 'Delivered', latency: '24 ms' },
      { time: 'Yesterday', event: 'Approval required', destination: 'Phone alerts', result: 'Retrying', latency: 'Timeout' }
    ]
  };

  const permissionProfiles = [
    { id: 'hands-off', name: 'Hands-off development', description: 'Autonomous within project boundaries; asks for external or destructive actions.', status: 'default', rules: 24, scope: 'Project' },
    { id: 'review-first', name: 'Review-first', description: 'Requires approval before writes, commands, network access, and source-control changes.', status: 'available', rules: 31, scope: 'Project' },
    { id: 'read-only', name: 'Read-only audit', description: 'Repository and web reads only; no writes or external mutations.', status: 'available', rules: 18, scope: 'Session' }
  ];

  const permissionRules = [
    { action: 'Read project files', decision: 'Allow', condition: 'Inside project root', source: 'Hands-off development' },
    { action: 'Write project files', decision: 'Allow', condition: 'Inside FileSafe boundary; preserve protected paths', source: 'Hands-off development' },
    { action: 'Run project tests', decision: 'Allow', condition: 'No privileged host access', source: 'Hands-off development' },
    { action: 'Install project dependency', decision: 'Ask', condition: 'Show package, source, version, and target environment', source: 'Supply-chain rule' },
    { action: 'Provider CLI installation', decision: 'Ask', condition: 'Official provider source only', source: 'Provider CLI rule' },
    { action: 'Force push', decision: 'Deny', condition: 'Protected branches; override requires explicit temporary rule', source: 'Source-control policy' },
    { action: 'Send external message', decision: 'Ask', condition: 'Preview recipient and content', source: 'External actions' }
  ];

  const fileSafePaths = [
    { path: '${projectRoot}', access: 'Read and write', inheritance: 'Project root', status: 'active' },
    { path: '${projectRoot}/.git', access: 'Source-control tools only', inheritance: 'Protected', status: 'active' },
    { path: '${projectRoot}/Plans', access: 'Read and write through owner workflows', inheritance: 'Protected owners', status: 'active' },
    { path: '/mnt/data', access: 'Temporary artifacts only', inheritance: 'Session', status: 'active' },
    { path: '~/.ssh', access: 'Deny direct read', inheritance: 'Credential boundary', status: 'active' }
  ];

  const backupState = {
    destinations: [
      { id: 'truenas', name: 'TrueNAS backup', type: 'Network storage', path: 'Backups/Puppet-Master', status: 'ready', encryption: 'On', lastVerified: 'Yesterday' },
      { id: 'local', name: 'Local recovery cache', type: 'This device', path: 'Managed app data', status: 'ready', encryption: 'OS protected', lastVerified: 'Today' }
    ],
    schedules: [
      { id: 'daily', name: 'Daily incremental', when: '2:00 AM', destination: 'TrueNAS backup', retention: '30 daily', enabled: true },
      { id: 'weekly', name: 'Weekly full', when: 'Sunday · 3:00 AM', destination: 'TrueNAS backup', retention: '12 weekly', enabled: true }
    ],
    history: [
      { time: 'Today · 2:00 AM', type: 'Incremental', destination: 'TrueNAS backup', size: '182 MB', result: 'Verified', receipt: 'BKP-2048' },
      { time: 'Yesterday · 2:00 AM', type: 'Incremental', destination: 'TrueNAS backup', size: '96 MB', result: 'Verified', receipt: 'BKP-2047' },
      { time: 'Sunday · 3:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.4 GB', result: 'Verified', receipt: 'BKP-2042' }
    ],
    retention: { conversations: 'Keep indefinitely', goalReceipts: '1 year', logs: '30 days', testEvidence: '90 days', temporaryArtifacts: '7 days' }
  };

  /* ---- Canonical inventory adapter (window.PM12_REFERENCE) -------------- */
  const REFERENCE_PLACEMENT = [
    { cat: 'general',    domain: 'general', workspace: 'general-reference' },
    { cat: 'ai',         domain: 'ai',      workspace: 'ai-reference' },
    { cat: 'web',        domain: 'ai',      workspace: 'web-reference' },
    { cat: 'media',      domain: 'ai',      workspace: 'media-reference' },
    { cat: 'code',       domain: 'code',    workspace: 'code-reference' },
    { cat: 'extensions', domain: 'code',    workspace: 'extensions-reference' },
    { cat: 'memory',     domain: 'memory',  workspace: 'memory-reference' },
    { cat: 'personas',   domain: 'memory',  workspace: 'personas-reference' },
    { cat: 'planning',   domain: 'planning', workspace: 'planning-reference' },
    { cat: 'branching',  domain: 'planning', workspace: 'branching-reference' },
    { cat: 'safety',     domain: 'safety',  workspace: 'safety-reference' },
    { cat: 'system',     domain: 'system',  workspace: 'system-reference' }
  ];

  const normalizeLabel = (label) => String(label || '').trim().toLowerCase();
  const labelsOf = (sections) => {
    const labels = new Set();
    for (const section of sections || []) for (const s of section.settings || []) labels.add(normalizeLabel(s.label));
    return labels;
  };
  const firstSentence = (text) => {
    const match = /\S.*?(?:[.!?](?=\s|$))/.exec(String(text || ''));
    return match ? match[0].trim() : String(text || '');
  };
  const refControlFor = (row) => {
    switch (row.type) {
      case 'toggle': return 'toggle';
      case 'select': return 'select';
      case 'radio': return 'segmented';
      case 'number': case 'slider': return 'stepper';
      case 'action': return 'action';
      case 'multiselect': return Array.isArray(row.options) && row.options.length ? 'multiselect' : 'textarea';
      case 'text': case 'path': case 'list': case 'keyvalue': return 'textarea';
      default: return 'text';
    }
  };
  const refUnitFromLabel = (label) => {
    const m = /\(([^()]{1,6})\)\s*:?\s*$/.exec(String(label || ''));
    return m && /^[a-z%]{1,6}$/i.test(m[1]) ? m[1].toLowerCase() : undefined;
  };
  const refValueFor = (row, control) => {
    const d = row.default;
    switch (control) {
      case 'toggle': return Boolean(d);
      case 'stepper': { const n = Number(d); return Number.isFinite(n) ? n : 0; }
      case 'select': case 'segmented': return String(d ?? row.options?.[0] ?? '');
      case 'multiselect': return Array.isArray(d) ? d : [];
      case 'action': return row.label;
      default: return typeof d === 'string' ? d : (d == null ? '' : JSON.stringify(d));
    }
  };
  const buildReferenceWorkspaces = () => {
    const reference = typeof window !== 'undefined' ? window.PM12_REFERENCE : null;
    if (!reference || !reference.byCat) return null;
    const skipped = [];
    const seenByDomain = {
      general: labelsOf(appInputSections),
      code: labelsOf(editorRuntimeSections),
      system: labelsOf(advancedSections)
    };
    const workspacesByCat = {};
    for (const placement of REFERENCE_PLACEMENT) {
      const category = reference.byCat[placement.cat];
      if (!category) continue;
      const rowsBySub = {};
      for (const row of category.settings) (rowsBySub[row.sub] || (rowsBySub[row.sub] = [])).push(row);
      const seenLabels = seenByDomain[placement.domain] || (seenByDomain[placement.domain] = new Set());
      const sections = category.subgroups.map(sub => {
        const rows = rowsBySub[sub.id] || [];
        return {
          id: `${placement.workspace}-${sub.id}`,
          label: sub.title,
          eyebrow: sub.id,
          description: `${rows.length} canonical settings from the Puppet Master settings inventory.`,
          settings: rows.map(row => {
            if (seenLabels.has(normalizeLabel(row.label))) { skipped.push(row.id); return null; }
            seenLabels.add(normalizeLabel(row.label));
            const control = refControlFor(row);
            const extra = { searchTerms: Array.isArray(row.search) ? row.search.slice() : [] };
            if (Array.isArray(row.options) && (control === 'select' || control === 'segmented' || control === 'multiselect')) extra.options = row.options.slice();
            if (control === 'stepper') { const unit = refUnitFromLabel(row.label); if (unit) extra.unit = unit; }
            return setting(row.id, row.label, row.desc || '', control, refValueFor(row, control), details(
              firstSentence(row.desc),
              row.recommended != null ? `Recommended: ${row.recommended}` : '',
              row.default != null ? String(typeof row.default === 'object' ? JSON.stringify(row.default) : row.default) : '',
              (row.legacyScope || []).join(', '),
              Array.isArray(row.related_features) ? row.related_features.slice() : [],
              [row.tier, ...(row.badges || [])].filter(Boolean).join(' · ')
            ), extra);
          }).filter(Boolean)
        };
      });
      workspacesByCat[placement.cat] = { placement, category, sections };
    }
    if (skipped.length) console.info('[PM12 reference] skipped duplicates:', skipped);
    return workspacesByCat;
  };
  const referenceBuild = buildReferenceWorkspaces();
  const planningDomain = referenceBuild ? (() => {
    const plan = referenceBuild.planning;
    const branch = referenceBuild.branching;
    return {
      id: 'planning',
      label: 'Chat & Planning',
      icon: 'map',
      summary: 'Planning interviews, verification, branch worktrees, crews, and subagents.',
      defaultWorkspace: 'planning-reference',
      workspaces: [
        { id: 'planning-reference', label: plan.category.title, type: 'settings', sections: plan.sections, reference: true },
        { id: 'branching-reference', label: branch.category.title, type: 'settings', sections: branch.sections, reference: true }
      ]
    };
  })() : null;

  const domains = [
    { id: 'general', label: 'General', icon: 'home', summary: 'Appearance, desktop behavior, input, notifications, sounds, and help.', defaultWorkspace: 'app-input', workspaces: [
      { id: 'app-input', label: 'App & Input', type: 'settings', sections: appInputSections },
      { id: 'notifications', label: 'Notifications & Sounds', type: 'notifications' }
    ]},
    { id: 'ai', label: 'AI & Providers', icon: 'brain', summary: 'Provider connections, exact model routes, web, media, and Back Seat Driver.', defaultWorkspace: 'providers', workspaces: [
      { id: 'providers', label: 'Providers & Accounts', type: 'providers' },
      { id: 'web', label: 'Web & Research', type: 'webRoutes' },
      { id: 'media', label: 'Media & Output', type: 'mediaRoutes' },
      { id: 'bsd', label: 'Back Seat Driver', type: 'bsd' }
    ]},
    { id: 'code', label: 'Code & Tools', icon: 'code', summary: 'Editor, terminal, toolchains, extensions, testing, and debugging.', defaultWorkspace: 'editor-runtime', workspaces: [
      { id: 'editor-runtime', label: 'Editor & Runtime', type: 'settings', sections: editorRuntimeSections },
      { id: 'toolchain', label: 'Toolchain & Extensions', type: 'toolchain' },
      { id: 'testing', label: 'Testing & Debug', type: 'testing' }
    ]},
    { id: 'memory', label: 'Memory & Automation', icon: 'memory', summary: 'Context, memories, Goals, personas, crews, and ownership.', defaultWorkspace: 'context-memory', workspaces: [
      { id: 'context-memory', label: 'Context & Memory', type: 'memory' },
      { id: 'goals', label: 'Goals & Automation', type: 'goals' },
      { id: 'personas', label: 'Personas & Crews', type: 'personas' },
      { id: 'owners', label: 'Single Owners', type: 'owners' }
    ]},
    { id: 'source', label: 'Source Control', icon: 'branch', summary: 'Git, Jujutsu, hosted forges, repositories, worktrees, recovery, and Actions.', defaultWorkspace: 'source-manager', workspaces: [
      { id: 'source-manager', label: 'Source Control Manager', type: 'sourceControl' }
    ]},
    { id: 'projects', label: 'Projects & Sync', icon: 'folder', summary: 'All project settings, locations, sync behavior, histories, and artifacts.', defaultWorkspace: 'project-settings', workspaces: [
      { id: 'project-settings', label: 'All Project Settings', type: 'settings', sections: projectSettingsSections },
      { id: 'project-sync', label: 'Project Location & Sync', type: 'projectSync' },
      { id: 'project-history', label: 'History & Artifacts', type: 'projectHistory' }
    ]},
    { id: 'safety', label: 'Safety & Permissions', icon: 'shield', summary: 'Permission profiles, FileSafe, approvals, runaway protection, and audit.', defaultWorkspace: 'permissions', workspaces: [
      { id: 'permissions', label: 'Permissions & Safety', type: 'permissions' }
    ]},
    { id: 'system', label: 'System', icon: 'system', summary: 'Settings transfer, backups, Doctor, hosts, updates, and advanced recovery.', defaultWorkspace: 'settings-transfer', workspaces: [
      { id: 'settings-transfer', label: 'Settings Transfer', type: 'settingsTransfer' },
      { id: 'backup', label: 'Data, Backup & Retention', type: 'backup' },
      { id: 'doctor', label: 'Doctor', type: 'doctor' },
      { id: 'servers', label: 'Servers & Installation', type: 'servers' },
      { id: 'updates', label: 'App Updates', type: 'updates' },
      { id: 'advanced', label: 'Advanced Settings', type: 'settings', sections: advancedSections }
    ]}
  ];

  if (referenceBuild) {
    for (const built of Object.values(referenceBuild)) {
      if (built.placement.domain === 'planning') continue;
      const target = domains.find(d => d.id === built.placement.domain);
      if (target) target.workspaces.push({ id: built.placement.workspace, label: built.category.title, type: 'settings', sections: built.sections, reference: true });
    }
    const memoryIndex = domains.findIndex(d => d.id === 'memory');
    domains.splice(memoryIndex >= 0 ? memoryIndex + 1 : domains.length, 0, planningDomain);
  }

  window.PM12_DATA = {
    details, setting, domains, providers, freeRoutes, webRoutes, mediaRoutes, bsd, toolchain,
    testProfiles, debugProfiles, memories, goalTemplates, activeGoals, personas, crews,
    sourceControl, notifications, permissionProfiles, permissionRules, fileSafePaths, backupState
  };
})();
