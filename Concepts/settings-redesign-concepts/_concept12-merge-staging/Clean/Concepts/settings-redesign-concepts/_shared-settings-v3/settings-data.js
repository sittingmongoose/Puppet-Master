/* Puppet Master Settings Concept 12 — shared semantic inventory extensions.
   The canonical 828-setting inventory lives in settings-inventory.js. This file
   supplies user-facing domains, consolidated manager ownership, resources, and
   prototype fixture state shared by the Fable and Kimi K3 presentations. */
(function () {
  'use strict';

  var domains = [
    {
      id: 'general', label: 'General', icon: 'sparkles',
      description: 'Everyday application behavior, appearance, input, notifications, and getting started.',
      workspaces: [
        { id: 'ordinary', label: 'General', kind: 'ordinary', title: 'General', description: 'Everyday application behavior presented as a continuous, scannable settings document.', managers: ['m.appearance','m.desktop','m.spellcheck','m.teacher','m.onboarding'] },
        { id: 'notifications', label: 'Notifications & Sounds', kind: 'notifications', title: 'Notifications & Sounds', description: 'Destinations, notification agents, event routing, sound assignments, PeonPing packs, quiet hours, and delivery diagnostics.', managers: ['m.notifications','m.sounds'] }
      ]
    },
    {
      id: 'ai', label: 'AI & Providers', icon: 'brain',
      description: 'Providers, accounts, free models, web research, media routes, and AI oversight.',
      workspaces: [
        { id: 'providers', label: 'Providers & Accounts', kind: 'providers', title: 'Providers & Accounts', description: 'Install, connect, inspect, route, and repair every supported AI connection. Free routes remain nested under one Free Models entry.', managers: ['m.providers'] },
        { id: 'web', label: 'Web & Research', kind: 'web', title: 'Web & Research', description: 'Choose which configured capabilities handle search, fetch, crawl, browser, maps, and extraction—and in what order.', managers: ['m.web'] },
        { id: 'media', label: 'Media & Output', kind: 'media', title: 'Media & Output', description: 'Route image, vision, speech, audio, video, and artifact output through configured provider capabilities.', managers: ['m.media'] },
        { id: 'bsd', label: 'Back Seat Driver', kind: 'bsd', title: 'Back Seat Driver', description: 'Choose when the advisor observes, how strongly it intervenes, and what evidence it may inspect.', managers: ['m.bsd'] },
        { id: 'ordinary-ai', label: 'All AI Settings', kind: 'ordinary', title: 'AI & Provider Settings', description: 'A searchable, progressive-disclosure view of every AI, web, and media setting in the shared inventory.', managers: [], searchOnly: true }
      ]
    },
    {
      id: 'code', label: 'Code & Tools', icon: 'terminal',
      description: 'Editor, terminal, language tooling, commands, extensions, testing, containers, and project indexing.',
      workspaces: [
        { id: 'editor-runtime', label: 'Editor & Runtime', kind: 'ordinary', title: 'Editor & Runtime', description: 'Files, editor, terminal, execution environments, containers, and project indexing.', managers: ['m.files','m.terminal','m.containers','m.searchIndex','m.dry'] },
        { id: 'toolchain', label: 'Toolchain & Extensions', kind: 'toolchain', title: 'Toolchain & Extensions', description: 'Language servers, formatters, commands, MCP servers, skills, plugins, and agent tools in one coherent workspace.', managers: ['m.lsp','m.formatters','m.commands','m.mcp','m.skills','m.plugins','m.tools'] },
        { id: 'testing', label: 'Testing & Debug', kind: 'manager-group', title: 'Testing & Debug', description: 'Visible live testing, automatic validation, debugging, and evidence policy.', managers: ['m.testing'] }
      ]
    },
    {
      id: 'memory', label: 'Memory & Automation', icon: 'memory',
      description: 'Context assembly, durable memory, goals, personas, crews, planning, and automation.',
      workspaces: [
        { id: 'context-memory', label: 'Context & Memory', kind: 'manager-group', title: 'Context & Memory', description: 'Instructions, source composition, memory retention, compaction, and context limits.', managers: ['m.context','m.memory'] },
        { id: 'goals', label: 'Goals & Automation', kind: 'manager-group', title: 'Goals & Automation', description: 'Long-running goals, planning, verification, resumability, and automation policy.', managers: ['m.goal'] },
        { id: 'people', label: 'Personas & Crews', kind: 'manager-group', title: 'Personas & Crews', description: 'Persona libraries, role behavior, crew composition, consensus, and subagent support.', managers: ['m.personas','m.crew'] },
        { id: 'ordinary-memory', label: 'All Memory Settings', kind: 'ordinary', title: 'Memory & Automation Settings', description: 'The full memory, planning, persona, and automation setting inventory.', managers: [] }
      ]
    },
    {
      id: 'source', label: 'Source Control', icon: 'branch',
      description: 'Git, Jujutsu, hosted forges, repositories, worktrees, SSH, LFS, policies, and actions.',
      workspaces: [
        { id: 'source-control', label: 'Source Control', kind: 'source-control', title: 'Source Control', description: 'Manage local source-control tools and hosted forge connections, then configure repository behavior.', managers: ['m.sourceControl','m.actions'] },
        { id: 'ordinary-source', label: 'All Source Settings', kind: 'ordinary', title: 'Source Control Settings', description: 'A searchable, progressive-disclosure view of every source-control and worktree setting in the shared inventory.', managers: [], searchOnly: true }
      ]
    },
    {
      id: 'projects', label: 'Projects & Sync', icon: 'folder',
      description: 'Project history, artifacts, hosting, remote access, and deliberate move or sync flows.',
      workspaces: [
        { id: 'project-history', label: 'History & Artifacts', kind: 'manager-group', title: 'Project History & Artifacts', description: 'Sessions, runtime artifacts, retention, inspection, and safe cleanup.', managers: ['m.history','m.artifacts'] },
        { id: 'project-location', label: 'Location & Sync', kind: 'manager-group', title: 'Project Location & Sync', description: 'Hosting, remote access, and staged project move or synchronization flows.', managers: ['m.hosting','m.remote','m.projectSync'] },
        { id: 'ordinary-projects', label: 'All Project Settings', kind: 'ordinary', title: 'Projects & Sync Settings', description: 'The full project-oriented setting inventory and inherited behaviors.', managers: [] }
      ]
    },
    {
      id: 'safety', label: 'Safety & Permissions', icon: 'shield',
      description: 'Permissions, FileSafe, approvals, external boundaries, and runaway protection.',
      workspaces: [
        { id: 'permissions', label: 'Permissions & FileSafe', kind: 'permissions', title: 'Permissions & FileSafe', description: 'Policy presets, tool permissions, protected files, approval gates, simulations, and effective-state explanations.', managers: ['m.permissions'] },
        { id: 'ordinary-safety', label: 'All Safety Settings', kind: 'ordinary', title: 'Safety & Permissions Settings', description: 'The full safety, permission, approval, and protection setting inventory.', managers: [] }
      ]
    },
    {
      id: 'system', label: 'System', icon: 'gear',
      description: 'Health, storage, backup, lifecycle, installation, servers, cleanup, and application updates.',
      workspaces: [
        { id: 'health', label: 'System Health', kind: 'doctor', title: 'System Health', description: 'Doctor checks, environment readiness, diagnostics, and repair paths.', managers: ['m.doctor'] },
        { id: 'data', label: 'Data, Backup & Retention', kind: 'manager-group', title: 'Data, Backup & Retention', description: 'Storage, retention, backup, restore, settings lifecycle, cleanup, and whole-server backup.', managers: ['m.storage','m.backup','m.lifecycle','m.cleanup','m.serverBackup'] },
        { id: 'servers', label: 'Servers & Installation', kind: 'manager-group', title: 'Servers & Installation', description: 'Deployment, server claim, hosts, execution environments, and application updates.', managers: ['m.deployment','m.serverClaim','m.servers','m.appUpdates'] },
        { id: 'ordinary-system', label: 'Advanced Settings', kind: 'ordinary', title: 'System & Advanced Settings', description: 'The complete health, diagnostics, update, path, and power-user setting inventory.', managers: [] }
      ]
    }
  ];

  var managers = [
    { id:'m.providers', title:'AI Providers', domain:'ai', icon:'brain', archetype:'resource', summary:'Supported AI provider installations, authentication, accounts, models, plans, usage, and routing.', prefixes:['ai.'] },
    { id:'m.context', title:'Context & Instructions', domain:'memory', icon:'layers', archetype:'policy', summary:'How instructions, project sources, memory, and tool context are assembled for a run.', prefixes:['memory.assembly.'] },
    { id:'m.memory', title:'Memory', domain:'memory', icon:'memory', archetype:'resource', summary:'Durable memories, retrieval, retention, privacy, forgetting, and memory health.', prefixes:['memory.retention.'] },
    { id:'m.personas', title:'Personas', domain:'memory', icon:'users', archetype:'catalog', summary:'Core, bundled, and custom personas with model, behavior, tool, and support tuning.', prefixes:['personas.'] },
    { id:'m.goal', title:'Goals & Automation', domain:'memory', icon:'target', archetype:'workflow', summary:'Goal states, pause and resume behavior, planning, verification, evidence, and automation.', prefixes:['planning.'] },
    { id:'m.crew', title:'Crews', domain:'memory', icon:'users', archetype:'resource', summary:'Crew membership, consensus, subagent parallelism, and per-role capability requirements.', prefixes:['branching.crew.','branching.subagents.'] },
    { id:'m.permissions', title:'Permissions & FileSafe', domain:'safety', icon:'shield', archetype:'policy', summary:'Permission presets, ordered rules, protected paths, approval gates, and effective policy simulation.', prefixes:['safety.'] },
    { id:'m.bsd', title:'Back Seat Driver', domain:'ai', icon:'eye', archetype:'policy', summary:'Advisor mode, observation scope, intervention thresholds, evidence access, and health.', prefixes:['ai.','planning.'] },
    { id:'m.notifications', title:'Notifications', domain:'general', icon:'bell', archetype:'routing', summary:'Destinations, notification agents, events, routing, escalation, quiet hours, and delivery history.', prefixes:['general.interaction.notification','general.interaction.system-notification'] },
    { id:'m.sounds', title:'Sound Library', domain:'general', icon:'volume', archetype:'catalog', summary:'Built-in sounds, uploads, PeonPing packs, event mappings, previews, validation, and export.', prefixes:['general.interaction.sound'] },
    { id:'m.appearance', title:'Appearance', domain:'general', icon:'palette', archetype:'preference', summary:'Theme, typography, density, motion, scale, and visual preferences.', prefixes:['general.visual.'] },
    { id:'m.spellcheck', title:'Spellcheck & Dictionaries', domain:'general', icon:'spell', archetype:'preference', summary:'Spelling languages, dictionaries, exclusions, and composer behavior.', prefixes:['general.interaction.spell','general.interaction.dictionary'] },
    { id:'m.desktop', title:'Desktop & Window', domain:'general', icon:'window', archetype:'preference', summary:'Window behavior, panels, activity bar, startup, recovery, tray, and layout.', prefixes:['general.interaction.','general.startup.'] },
    { id:'m.teacher', title:'Teacher & Help', domain:'general', icon:'book', archetype:'catalog', summary:'Guided help, contextual explanations, tours, examples, and the built-in teacher assistant.', prefixes:['general.startup.'] },
    { id:'m.doctor', title:'Doctor', domain:'system', icon:'gauge', archetype:'health', summary:'A truthful health view built from provider, Filesafe, storage, index, backup, model, and host checks.', prefixes:['system.health.'] },
    { id:'m.files', title:'Files & Editor', domain:'code', icon:'file', archetype:'preference', summary:'Editor behavior, file handling, save, formatting, tabs, navigation, and project file boundaries.', prefixes:['code.editing.'] },
    { id:'m.terminal', title:'Terminal', domain:'code', icon:'terminal', archetype:'resource', summary:'Terminal profiles, shells, rendering, history, environment, and session behavior.', prefixes:['code.terminal.'] },
    { id:'m.lsp', title:'Language Servers', domain:'code', icon:'code', archetype:'resource', summary:'Language mappings, per-host installation, activation, restart, health, logs, and test documents.', prefixes:['code.editing.lsp'] },
    { id:'m.formatters', title:'Formatters', domain:'code', icon:'wand', archetype:'routing', summary:'Per-language formatter defaults, fallback priority, format-on-save, readiness, preview, and test.', prefixes:['code.editing.format'] },
    { id:'m.commands', title:'Commands & Shortcuts', domain:'code', icon:'command', archetype:'catalog', summary:'Searchable commands, keyboard shortcuts, recording, conflicts, reset, import, and export.', prefixes:['extensions.commands.'] },
    { id:'m.mcp', title:'MCP Servers', domain:'code', icon:'server', archetype:'resource', summary:'Server transport, command or URL, environment, authentication, tools, permissions, tests, and logs.', prefixes:['system.mcp.'] },
    { id:'m.skills', title:'Skills', domain:'code', icon:'sparkles', archetype:'catalog', summary:'Skill catalog, install or import, enablement, scope, requirements, updates, removal, and testing.', prefixes:['extensions.skills.'] },
    { id:'m.plugins', title:'Plugins', domain:'code', icon:'puzzle', archetype:'catalog', summary:'Plugin installation, permissions, enablement, updates, compatibility, diagnostics, and uninstall.', prefixes:['extensions.plugins.'] },
    { id:'m.tools', title:'Agent Tools', domain:'code', icon:'tool', archetype:'policy', summary:'Tool capability, permissions, availability, priority, tests, and owning plugin, MCP, or provider.', prefixes:['extensions.'] },
    { id:'m.testing', title:'Testing & Debug', domain:'code', icon:'flask', archetype:'workflow', summary:'Automatic testing, visible live testing, browser and native previews, evidence, and debug policy.', prefixes:['planning.testing.','planning.verification.'] },
    { id:'m.storage', title:'Storage & Retention', domain:'system', icon:'database', archetype:'health', summary:'Storage use, retention owners and minimums, holds, quarantine, compaction, and capacity.', prefixes:['system.advanced.runtime-history','system.advanced.diagnostic-history','system.advanced.released-safe','system.advanced.preserved-terminal','system.advanced.request-storage','system.advanced.inspect-holds'] },
    { id:'m.backup', title:'Backup & Restore', domain:'system', icon:'archive', archetype:'workflow', summary:'Project and settings backup, verification, encryption, schedules, restore preview, receipts, and rollback.', prefixes:['system.advanced.backup','system.advanced.restore'] },
    { id:'m.lifecycle', title:'Settings Lifecycle', domain:'system', icon:'cycle', archetype:'workflow', summary:'Import, export, validation, preview, apply, receipts, rollback, and settings migration.', prefixes:['system.advanced.config','system.advanced.legacy'] },
    { id:'m.history', title:'History & Sessions', domain:'projects', icon:'history', archetype:'catalog', summary:'Thread and session history, branching, retention, handoff, rewind, restore, and continuity.', prefixes:['system.advanced.chat-history','memory.retention.'] },
    { id:'m.artifacts', title:'Runtime Artifacts', domain:'projects', icon:'box', archetype:'resource', summary:'Generated artifacts, provenance, preview, storage destination, retention, export, and cleanup.', prefixes:['system.advanced.runtime-artifacts','media.io.'] },
    { id:'m.sourceControl', title:'Source Control', domain:'source', icon:'branch', archetype:'resource', summary:'Git, Jujutsu, hosted forges, repositories, SSH, LFS, branches, worktrees, policy, and recovery.', prefixes:['branching.worktrees.'] },
    { id:'m.actions', title:'GitHub Actions', domain:'source', icon:'bolt', archetype:'workflow', summary:'GitHub Actions connection, pinned workflows, readiness, recent runs, logs, triggers, and repair.', prefixes:['branching.'] },
    { id:'m.containers', title:'Containers & Registries', domain:'code', icon:'box', archetype:'resource', summary:'Docker, Podman, Kubernetes, registries, login, updates, resource limits, and execution policy.', prefixes:['code.execution.'] },
    { id:'m.web', title:'Web & Research', domain:'ai', icon:'globe', archetype:'routing', summary:'Provider priority and policy for search, fetch, crawl, browser, map, extraction, caching, privacy, and tests.', prefixes:['web.'] },
    { id:'m.searchIndex', title:'Project Search Index', domain:'code', icon:'search', archetype:'health', summary:'Index state, scope, ignore rules, rebuild, performance, privacy, diagnostics, and test queries.', prefixes:['web.index.'] },
    { id:'m.cleanup', title:'Workspace Cleanup', domain:'system', icon:'broom', archetype:'workflow', summary:'Dry-run cleanup plans, holds, protected artifacts, reclaimed space, receipts, and rollback.', prefixes:['system.advanced.'] },
    { id:'m.media', title:'Media & Output', domain:'ai', icon:'film', archetype:'routing', summary:'Image, vision, speech, audio, video, music, output formats, storage, fallbacks, and tests.', prefixes:['media.'] },
    { id:'m.dry', title:'DRY & Shared Systems', domain:'code', icon:'layers', archetype:'health', summary:'Shared inventories, command IDs, provider capabilities, wiring, duplicate detection, and ownership.', prefixes:['system.advanced.cache-linter'] },
    { id:'m.onboarding', title:'Onboarding', domain:'general', icon:'compass', archetype:'workflow', summary:'First-run provider setup, project setup, free models, source control, teacher tour, skip, and resume.', prefixes:['general.startup.'] },
    { id:'m.deployment', title:'Installation & Deployment', domain:'system', icon:'download', archetype:'workflow', summary:'Native and server installation, deployment targets, prerequisites, updates, verification, and rollback.', prefixes:['system.advanced.cli-path','system.advanced.binary-rescan','system.advanced.version-handshake'] },
    { id:'m.serverClaim', title:'Server Claim', domain:'system', icon:'link', archetype:'workflow', summary:'Claiming a server, trust, identity, credentials, recovery, revocation, and ownership evidence.', prefixes:['system.advanced.'] },
    { id:'m.servers', title:'Servers & Hosts', domain:'system', icon:'server', archetype:'resource', summary:'Server host, execution host, clients, capabilities, connectivity, WSL, containers, and health.', prefixes:['code.execution.','system.advanced.'] },
    { id:'m.hosting', title:'Project Hosting & Files', domain:'projects', icon:'folder', archetype:'resource', summary:'Project home, file location, execution location, storage owner, and move or sync entry points.', prefixes:['code.execution.'] },
    { id:'m.remote', title:'Remote Access', domain:'projects', icon:'link', archetype:'resource', summary:'Local, LAN, SSH, VPN, and future remote access methods with per-client policy and health.', prefixes:['code.execution.'] },
    { id:'m.projectSync', title:'Project Sync & Move', domain:'projects', icon:'route', archetype:'workflow', summary:'Staged project move, preview, pause, verification, cutover, rollback, receipts, and recovery.', prefixes:['code.execution.'] },
    { id:'m.appUpdates', title:'App Updates', domain:'system', icon:'download', archetype:'health', summary:'Automatic update toggle, channels, checks, staging, provenance, restart, history, and rollback.', prefixes:['system.advanced.'] },
    { id:'m.serverBackup', title:'Full Server Backup', domain:'system', icon:'lock', archetype:'workflow', summary:'Whole-server scheduling, encryption, verification, destinations, restore, recovery, and receipts.', prefixes:['system.advanced.'] }
  ];

  var providers = [
    { id:'claude-code', name:'Claude Code', initials:'CC', state:'active', status:'Active · 3 accounts', tone:'ok', account:'Playtr Team', product:'Personal Max + Playtr Team', models:['Claude Opus 4.1','Claude Sonnet 4.5','Claude Haiku 4.5'], install:'Installed on this Mac', auth:'Signed in', reset:'Today, 4:00 PM', capabilities:['Chat','Code','Web Search','Fetch','Browser','Vision'], note:'Included Personal Max usage is used up until the 4:00 PM reset; requests fall through to Playtr Team.' },
    { id:'openai-codex', name:'OpenAI Codex', initials:'OC', state:'active', status:'Active · 2 accounts', tone:'ok', account:'Jared · ChatGPT Pro', product:'ChatGPT Pro + API', models:['GPT-5.2','GPT-5.2 Codex','o4-mini'], install:'Connected through Puppet Master', auth:'Signed in', reset:'Tomorrow, 12:00 AM', capabilities:['Chat','Code','Web Search','Fetch','Browser','Vision','Image'], note:'Included usage is healthy. API usage remains a separate optional route.' },
    { id:'cursor', name:'Cursor', initials:'C', state:'not-installed', status:'Not installed', tone:'muted', account:'None', product:'Cursor subscription', models:[], install:'Not installed', auth:'Not signed in', reset:'Not applicable', capabilities:['Chat','Code'], note:'Install the official Cursor CLI, then sign in inside its profile.' },
    { id:'kimi-coding', name:'Kimi For Coding', initials:'KF', state:'active', status:'Active · 1 account', tone:'ok', account:'Kimi Coding Plan', product:'Kimi For Coding', models:['Kimi K3','Kimi K2.5'], install:'Installed on this Mac', auth:'Signed in', reset:'In 3h 18m', capabilities:['Chat','Code','Web Search','Fetch'], note:'Coding-plan allowance is available and eligible for routing.' },
    { id:'qwen-coding', name:'Qwen Coding Plan', initials:'QC', state:'active', status:'Active · 2 accounts', tone:'ok', account:'Primary coding plan', product:'Qwen Coding Plan', models:['Qwen 3.8 Coder','Qwen 3.6 Coder'], install:'Installed on this Mac', auth:'Signed in', reset:'In 5h 42m', capabilities:['Chat','Code','Web Search'], note:'Two accounts are available; the primary account is used first.' },
    { id:'zai-glm', name:'Z.AI GLM Coding Plan', initials:'ZG', state:'active', status:'Active · 1 account', tone:'ok', account:'GLM Coding Plan', product:'Z.AI GLM Coding Plan', models:['GLM 5.6 SOL','GLM 5.2'], install:'Installed on Home TrueNAS', auth:'Signed in', reset:'Tomorrow', capabilities:['Chat','Code','Web Search'], note:'The execution-host installation is healthy.' },
    { id:'minimax', name:'MiniMax Coding Plan', initials:'MC', state:'installed', status:'Installed · Not signed in', tone:'warning', account:'None', product:'MiniMax Coding Plan', models:['MiniMax M2.1'], install:'Installed on this Mac', auth:'Sign-in required', reset:'Unknown', capabilities:['Chat','Code'], note:'Installation is ready, but no account can be invoked until sign-in completes.' },
    { id:'github-copilot', name:'GitHub Copilot', initials:'GC', state:'installed', status:'Installed · Sign in required', tone:'warning', account:'Jared · GitHub', product:'Copilot Pro', models:['Catalog last known good'], install:'Connected app present', auth:'Subscription needs repair', reset:'Unknown', capabilities:['Chat','Code'], note:'The seat lapsed. Authentication and invocation readiness are shown separately.' },
    { id:'antigravity', name:'Antigravity CLI', initials:'AC', state:'installed', status:'Installed · Not signed in', tone:'warning', account:'None', product:'Google Antigravity', models:['Gemini 3 Pro','Gemini 3 Flash'], install:'Installed on this Mac', auth:'Google sign-in expired', reset:'Unknown', capabilities:['Chat','Code','Web Search','Vision'], note:'Open the CLI sign-in flow to reconnect; models remain listed from the last good catalog.' },
    { id:'opencode', name:'OpenCode', initials:'O', state:'active', status:'Active · 1 server', tone:'ok', account:'Managed server', product:'OpenCode', models:['Configured server catalog'], install:'Managed server running', auth:'Server trusted', reset:'Not applicable', capabilities:['Chat','Code'], note:'Puppet Master manages one OpenCode server and verifies its catalog.' },
    { id:'gemini-direct', name:'Gemini Direct', initials:'GD', state:'not-configured', status:'Not configured', tone:'muted', account:'None', product:'Gemini API', models:['Gemini 3 Pro','Gemini 3 Flash'], install:'No installation required', auth:'API key required', reset:'Per API plan', capabilities:['Chat','Vision','Image','Video','Speech'], note:'Add a Gemini API key to enable direct media and model routes.' },
    { id:'openrouter', name:'OpenRouter', initials:'OR', state:'active', status:'Active · 1 account', tone:'ok', account:'Playtr · OpenRouter', product:'OpenRouter API', models:['DeepSeek V4','Llama 4 Maverick','Qwen3 Coder','240+ more'], install:'No installation required', auth:'API key valid', reset:'Credit based', capabilities:['Chat','Code','Vision','Web Search'], note:'Catalog refresh is healthy; free routes are managed separately under Free Models.' },
    { id:'free-models', name:'Free Models', initials:'FM', state:'active', status:'Active · 6 routes', tone:'ok', account:'Nested route accounts', product:'Free and community routes', models:['96 available models'], install:'Routes configured individually', auth:'6 active routes', reset:'First reset in 5h 32m', capabilities:['Chat','Code','Vision'], note:'Free Models is one Settings provider. Enabled underlying routes remain nested here, but operational surfaces show the actual route provider.' }
  ];

  var freeRoutes = [
    { id:'hf', name:'Hugging Face Inference API', initials:'HF', enabled:true, state:'active', models:28, reset:'In 5h 32m', limit:'1,000 req/hr', daily:'10M tokens', account:'Jared · Hugging Face', auth:'Token valid', priority:1, capabilities:['Chat','Code','Vision'] },
    { id:'openrouter-free', name:'OpenRouter Free Models', initials:'OR', enabled:true, state:'active', models:31, reset:'Rolling limits', limit:'Provider dependent', daily:'Free-route quotas', account:'Playtr · OpenRouter', auth:'API key valid', priority:2, capabilities:['Chat','Code','Vision'] },
    { id:'github-models', name:'GitHub Models', initials:'GH', enabled:true, state:'active', models:14, reset:'Daily', limit:'Rate limited', daily:'Per-model', account:'Jared · GitHub', auth:'OAuth valid', priority:3, capabilities:['Chat','Code','Vision'] },
    { id:'gemini-free', name:'Google AI Studio Free Tier', initials:'GA', enabled:true, state:'active', models:8, reset:'Daily', limit:'Per model', daily:'Free tier', account:'Jared · Google', auth:'API key valid', priority:4, capabilities:['Chat','Vision','Image'] },
    { id:'cerebras-free', name:'Cerebras Free Inference', initials:'CE', enabled:true, state:'active', models:7, reset:'Rolling', limit:'Rate limited', daily:'Free account', account:'Jared · Cerebras', auth:'API key valid', priority:5, capabilities:['Chat','Code'] },
    { id:'groq-free', name:'Groq Free Tier', initials:'GQ', enabled:true, state:'active', models:8, reset:'Daily', limit:'Rate limited', daily:'Free account', account:'Jared · Groq', auth:'API key valid', priority:6, capabilities:['Chat','Code','Speech'] },
    { id:'cloudflare-ai', name:'Cloudflare Workers AI', initials:'CF', enabled:false, state:'available', models:18, reset:'Daily', limit:'Free allocation', daily:'Workers AI units', account:'Not connected', auth:'Enable to configure', priority:7, capabilities:['Chat','Vision','Image','Speech'] },
    { id:'sambanova-free', name:'SambaNova Free Developer Route', initials:'SN', enabled:false, state:'available', models:6, reset:'Daily', limit:'Developer quota', daily:'Free account', account:'Not connected', auth:'Enable to configure', priority:8, capabilities:['Chat','Code'] }
  ];

  var sounds = [
    { id:'pm-soft-chime', name:'Soft Chime', source:'Built in', duration:'0:01', assigned:['Goal completed'], frequency:660 },
    { id:'pm-attention', name:'Attention Pulse', source:'Built in', duration:'0:02', assigned:['Approval needed','Agent blocked'], frequency:440 },
    { id:'pm-success', name:'Glass Success', source:'Built in', duration:'0:02', assigned:['Build completed'], frequency:784 },
    { id:'peon-ready', name:'Peon Ready', source:'PeonPing pack', duration:'0:01', assigned:['Subagent finished'], frequency:523 },
    { id:'peon-work', name:'Work Complete', source:'PeonPing pack', duration:'0:02', assigned:['Goal completed'], frequency:587 },
    { id:'custom-studio', name:'Studio Bell', source:'Uploaded', duration:'0:03', assigned:[], frequency:698 }
  ];

  var notificationDestinations = [
    { id:'in-app', name:'In-app inbox', state:'active', status:'Active', detail:'Always available in Puppet Master.' },
    { id:'system', name:'System notifications', state:'active', status:'Active', detail:'Uses the operating system notification center.' },
    { id:'discord', name:'Discord', state:'active', status:'Connected', detail:'Build Room · webhook ending 6b2a' },
    { id:'slack', name:'Slack', state:'setup', status:'Not configured', detail:'Add a workspace and channel.' },
    { id:'ntfy', name:'ntfy', state:'active', status:'Connected', detail:'Topic: pm-home' },
    { id:'pushover', name:'Pushover', state:'setup', status:'Not configured', detail:'Add application and user keys.' },
    { id:'telegram', name:'Telegram', state:'setup', status:'Not configured', detail:'Connect a bot and target chat.' },
    { id:'webhook', name:'Custom webhook', state:'active', status:'2 endpoints', detail:'Build archive and incident relay.' }
  ];

  var sourceControl = {
    localTools: [
      { id:'git', name:'Git', state:'active', status:'Ready', version:'2.53.0', install:'System package', hosts:['This Mac','Home TrueNAS','Windows WSL'] },
      { id:'jujutsu', name:'Jujutsu', state:'active', status:'Ready', version:'0.34.0', install:'Official binary', hosts:['This Mac','Home TrueNAS'] },
      { id:'git-lfs', name:'Git LFS', state:'warning', status:'Missing on Windows WSL', version:'3.7.0', install:'System package', hosts:['This Mac','Home TrueNAS'] }
    ],
    forges: [
      { id:'github', name:'GitHub', state:'active', status:'Connected · 2 accounts', account:'sittingmongoose', scopes:'repo, workflow, read:org', repositories:18 },
      { id:'gitlab', name:'GitLab', state:'setup', status:'Not connected', account:'None', scopes:'—', repositories:0 },
      { id:'bitbucket', name:'Bitbucket', state:'setup', status:'Not connected', account:'None', scopes:'—', repositories:0 },
      { id:'azure', name:'Azure DevOps', state:'setup', status:'Not connected', account:'None', scopes:'—', repositories:0 },
      { id:'origin', name:'Cursor Origin', state:'setup', status:'Available to connect', account:'None', scopes:'—', repositories:0 }
    ],
    worktrees: [
      { id:'wt-main', name:'main', branch:'main', owner:'You', path:'/mnt/Cursor/Puppet Master', state:'clean', age:'Current' },
      { id:'wt-settings', name:'settings-concept12', branch:'concept/settings-12', owner:'Goal run', path:'/mnt/Cursor/worktrees/settings-12', state:'7 changes', age:'18m' },
      { id:'wt-audit', name:'audit-settings', branch:'audit/settings', owner:'Auditor', path:'/mnt/Cursor/worktrees/audit-settings', state:'clean', age:'2h' }
    ],
    workflows: [
      { id:'wf-gates', name:'Plan & contract gates', state:'success', last:'8m ago', branch:'concept/settings-12' },
      { id:'wf-web', name:'Web concept smoke', state:'running', last:'Running 3m', branch:'concept/settings-12' },
      { id:'wf-release', name:'Release build', state:'idle', last:'2d ago', branch:'main' }
    ]
  };

  var toolchain = {
    lsp: [
      { id:'rust-analyzer', name:'rust-analyzer', language:'Rust', state:'active', host:'Home TrueNAS', version:'2026-08-17', detail:'Attached to 3 workspaces' },
      { id:'typescript', name:'TypeScript Language Server', language:'TypeScript / JavaScript', state:'active', host:'This Mac', version:'5.9.2', detail:'Attached to Puppet Master' },
      { id:'pyright', name:'Pyright', language:'Python', state:'active', host:'Windows WSL', version:'1.1.410', detail:'Attached to 2 workspaces' },
      { id:'slint-lsp', name:'Slint LSP', language:'Slint', state:'warning', host:'Home TrueNAS', version:'1.17.1', detail:'Restart recommended after update' }
    ],
    formatters: [
      { id:'rustfmt', name:'rustfmt', language:'Rust', state:'active', priority:1, detail:'Format on save' },
      { id:'prettier', name:'Prettier', language:'JS / TS / JSON / CSS', state:'active', priority:1, detail:'Project configuration' },
      { id:'ruff', name:'Ruff formatter', language:'Python', state:'active', priority:1, detail:'Project configuration' },
      { id:'taplo', name:'Taplo', language:'TOML', state:'active', priority:1, detail:'Format on save' }
    ],
    mcp: [
      { id:'github-mcp', name:'GitHub MCP', transport:'stdio', state:'active', tools:22, detail:'Authenticated as sittingmongoose' },
      { id:'filesystem-mcp', name:'Project Files MCP', transport:'stdio', state:'active', tools:9, detail:'Project root only · FileSafe enforced' },
      { id:'docs-mcp', name:'Documentation MCP', transport:'HTTP', state:'warning', tools:6, detail:'Authentication refresh due' }
    ],
    skills: [
      { id:'ui-audit', name:'UI Visual Audit', state:'active', scope:'Project', detail:'Screenshot, motion, and interaction review' },
      { id:'plan-compiler', name:'Plan Compiler', state:'active', scope:'Built in', detail:'Plans → node-seed-ready outputs' },
      { id:'provider-doctor', name:'Provider Doctor', state:'active', scope:'Built in', detail:'Install, sign-in, catalog, and invocation checks' }
    ],
    plugins: [
      { id:'github', name:'GitHub', state:'active', permissions:'Repositories, issues, pull requests', detail:'Connected' },
      { id:'gmail', name:'Gmail', state:'available', permissions:'Mail search and actions', detail:'Not connected' },
      { id:'calendar', name:'Google Calendar', state:'available', permissions:'Calendar read and write', detail:'Not connected' }
    ],
    commands: [
      { id:'goal.start', name:'Start Goal', shortcut:'Ctrl+Shift+G', state:'active', detail:'No conflict' },
      { id:'settings.search', name:'Search Settings', shortcut:'Ctrl+,', state:'active', detail:'No conflict' },
      { id:'context.compact', name:'Compact Context', shortcut:'Ctrl+Alt+C', state:'warning', detail:'Conflicts with terminal profile' }
    ],
    tools: [
      { id:'browser', name:'Built-in Browser', state:'active', owner:'Puppet Master', detail:'Navigation, clicks, forms, screenshots, console, network' },
      { id:'shell', name:'Terminal & Shell', state:'active', owner:'Puppet Master', detail:'Project and execution-host commands' },
      { id:'image', name:'Image Generation', state:'active', owner:'AI Providers', detail:'OpenAI Codex primary · Gemini Direct fallback' },
      { id:'github-tool', name:'GitHub Operations', state:'active', owner:'GitHub plugin', detail:'Repositories, PRs, issues, actions' }
    ]
  };

  var webCapabilities = [
    { id:'search', name:'Search', description:'Find current information and relevant pages.', routes:['Claude Code','OpenAI Codex','OpenRouter'], test:'Search for Slint 1.17 migration notes' },
    { id:'fetch', name:'Fetch', description:'Read and normalize a known URL.', routes:['Built-in Fetch','Claude Code','OpenAI Codex'], test:'Fetch Puppet Master documentation URL' },
    { id:'crawl', name:'Crawl', description:'Follow a bounded set of pages under one site.', routes:['Built-in Browser','Firecrawl (not configured)'], test:'Crawl documentation section, max 20 pages' },
    { id:'browser', name:'Browser', description:'Interact with pages using the built-in browser.', routes:['Built-in Browser','Claude Code','OpenAI Codex'], test:'Open a page and verify its title' },
    { id:'map', name:'Map', description:'Discover a site structure before fetching content.', routes:['Built-in Browser','Firecrawl (not configured)'], test:'Map documentation navigation' },
    { id:'extract', name:'Extract', description:'Return structured fields from web content.', routes:['Claude Code','OpenAI Codex','Built-in Fetch'], test:'Extract title, date, author, and summary' }
  ];

  var mediaCapabilities = [
    { id:'image-gen', name:'Image generation', primary:'OpenAI Codex · GPT Image', fallback:'Gemini Direct', output:'Project artifacts/images', status:'Ready', icon:'image' },
    { id:'vision', name:'Image understanding', primary:'Claude Code · Opus 4.1', fallback:'OpenAI Codex', output:'Chat or artifact evidence', status:'Ready', icon:'eye' },
    { id:'speech-in', name:'Speech input & transcription', primary:'Groq Free · Whisper', fallback:'OpenAI Codex', output:'Thread transcript', status:'Ready', icon:'mic' },
    { id:'tts', name:'Text-to-speech', primary:'Gemini Direct', fallback:'System voice', output:'Project artifacts/audio', status:'Setup needed', icon:'volume' },
    { id:'audio', name:'Audio generation', primary:'Gemini Direct', fallback:'None', output:'Project artifacts/audio', status:'Setup needed', icon:'wave' },
    { id:'video', name:'Video generation', primary:'Gemini Direct', fallback:'None', output:'Project artifacts/video', status:'Setup needed', icon:'film' },
    { id:'documents', name:'Document & artifact output', primary:'Puppet Master', fallback:'None', output:'Project artifacts', status:'Ready', icon:'file' }
  ];

  window.PM_SETTINGS_V3_DATA = {
    version: '3.0.0-concept12',
    domains: domains,
    managers: managers,
    providers: providers,
    freeRoutes: freeRoutes,
    sounds: sounds,
    notificationDestinations: notificationDestinations,
    sourceControl: sourceControl,
    toolchain: toolchain,
    webCapabilities: webCapabilities,
    mediaCapabilities: mediaCapabilities
  };
})();
