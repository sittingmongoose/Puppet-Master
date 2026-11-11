/* Settings managers, rethought (Fable 5.2): the plan of pages.
   Every page of the redesign except the two chapters written by hand (AI providers, Computers) is declared here with the
   settings it holds, named by PMConcept7's own section ids (SMX.sec) so each setting keeps its wording and control.
   A chapter's file in layer/pages/ then adds what a manager needs beyond rows (its summary, its lists, its tasks) with
   SMX.extend(pageId, {...}). Loaded after smx-ia.js and before the pages.

   Rules this plan follows (the review document says why):
   - one home per setting; a page that refers to a setting owned elsewhere links to it, it never draws it again;
   - a page shows what a newcomer needs first; "More options" holds the less common, "For experts" the rest;
   - a chapter is a question a person has, not a subsystem. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.planned) return;
  SMX.planned = true;
  const S = SMX.sec, D = SMX.drawn;
  const page = (id, chapter, nav, o) => SMX.page(Object.assign({ id, chapter, nav, title: nav, planned: true }, o));
  const LIST = 'Drawn as this page’s own list, not as a row.';

  /* a page declared here can be completed by a chapter file */
  SMX.extend = (id, patch) => {
    const p = SMX.pages.find((x) => x.id === id); if (!p) { W.console.error('SMX.extend: no page', id); return null; }
    p.extended = true;
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'covers') p.covers = Object.assign({}, p.covers || {}, v);
      else if (k === 'changes') p.changes = (p.changes || []).concat(v);
      else if (k === 'addSections') p.sections = (p.sections || []).concat(v);
      else if (k === 'addMore') p.more = (p.more || []).concat(v);
      else if (k === 'addExpert') p.expert = (p.expert || []).concat(v);
      else p[k] = v;
    }
    return p;
  };

  /* ================================================================== Look & feel */
  page('look', 'look', 'Theme & wallpaper', { icon: 'palette', title: 'Look & feel',
    purpose: 'Pick a look, light or dark, a wallpaper and an accent colour. Changes show at once.',
    legacy: [['general', 'app-input']], keywords: ['theme', 'dark', 'light', 'wallpaper', 'accent', 'pip', 'nier', 'glass', 'retro', 'font'],
    sections: [
      S('app-theme', { title: 'Theme', help: 'Each look has a light and a dark version.', ids: ['general.visual.theme', 'general.visual.theme-mode', 'general.visual.accent-color', 'general.visual.wallpaper', 'general.visual.app-font'] }),
      S('app-theme', { key: 'app-theme-own', title: 'Only for the look you chose', help: 'These appear for the look that has them.', ids: ['general.visual.glass-transparency', 'general.visual.retro-effects', 'general.visual.nier-parts', 'general.visual.nier-background'] }),
      { key: 'pip', title: 'Pip, the little helper', help: 'Where Pip appears, the faces it makes and whether it makes a sound.', ids: ['general.visual.pip-parts'] }
    ],
    more: [S('app-custom-themes')],
    expert: [S('app-visual-more', { title: 'Fine-tuning the look', help: 'Borders, corners, padding and retro textures.' })] });
  page('look/text', 'look', 'Text & motion', { icon: 'eye', title: 'Text & motion',
    purpose: 'Make everything easier to read, and calm the movement down if you like.',
    legacy: [['general', 'app-input']], keywords: ['font size', 'text size', 'zoom', 'contrast', 'reduce motion', 'animation', 'spacing'],
    sections: [
      S('app-visual', { title: 'Size', help: 'How big text and controls are.', ids: ['general.visual.ui-scale', 'general.visual.font-size', 'general.visual.interface-density', 'general.visual.line-height'] }),
      { key: 'motion', title: 'Motion', help: 'How much the app moves.', ids: ['general.visual.reduce-animations', 'general.visual.animation-speed'] },
      { key: 'contrast', title: 'Easier to see', help: 'Stronger edges and a clearer keyboard outline.', ids: ['general.visual.high-contrast', 'general.visual.focus-indicator'] }
    ] });
  page('look/window', 'look', 'Window & startup', { icon: 'browser', title: 'Window & startup',
    purpose: 'Where panels sit, what the app opens on, and what comes back after a crash.',
    legacy: [['general', 'app-input']], keywords: ['layout', 'panels', 'startup', 'crash', 'icons', 'tray', 'status bar'],
    sections: [
      S('app-desktop', { title: 'Window & panels', ids: ['general.interaction.panel-dock', 'general.interaction.activity-bar-order', 'general.interaction.activity-bar-labels', 'general.interaction.status-bar-words', 'general.interaction.minimize-to-tray', 'general.interaction.dashboard-widgets', 'general.startup.reset-home-layout'] }),
      S('app-startup', { title: 'When Puppet Master opens', ids: ['general.startup.first-screen', 'general.startup.restore-panel', 'general.startup.starting-layout', 'general.startup.window-state', 'general.startup.crash-restore', 'general.startup.unsaved-capture'] })
    ] });
  page('look/editor', 'look', 'Editor look', { icon: 'code', title: 'Editor look',
    purpose: 'Colours, font and guides of the code editor. Customize shows every choice on a live editor.',
    legacy: [['code', 'editor-runtime']], keywords: ['editor colors', 'editor font', 'caret', 'minimap', 'ligatures', 'indent guides'],
    sections: [S('editor-look', { title: 'The basics', help: 'The choices most people change.' })],
    more: [S('editor-look-more', { title: 'Every editor look setting', help: 'The same choices Customize shows, as a list.' })],
    moreLabel: 'All editor look settings as a list', moreHelp: 'Customize shows these on a live editor' });
  page('look/terminal', 'look', 'Terminal look', { icon: 'terminal', title: 'Terminal look',
    purpose: 'Colours, font, background and effects of the terminal. Customize shows every choice on a live terminal.',
    legacy: [['code', 'editor-runtime']], keywords: ['terminal colors', 'terminal font', 'crt', 'scanlines', 'bezel', 'cursor'],
    sections: [S('editor-terminal-look', { title: 'The basics', help: 'The choices most people change.' })],
    more: [
      { key: 'term-text', title: 'Text', ids: ['code.terminal.font-weight', 'code.terminal.line-height', 'code.terminal.letter-spacing', 'code.terminal.ligatures', 'code.terminal.bold-bright', 'code.terminal.min-contrast', 'code.terminal.scheme-pair', 'code.terminal.import-scheme'] },
      { key: 'term-cursor', title: 'Cursor', ids: ['code.terminal.cursor-shape', 'code.terminal.cursor-blink', 'code.terminal.cursor-trail'] },
      { key: 'term-bg', title: 'Background', ids: ['code.terminal.background', 'code.terminal.background-color', 'code.terminal.background-gradient', 'code.terminal.background-image', 'code.terminal.background-image-file', 'code.terminal.background-fit', 'code.terminal.background-dim', 'code.terminal.background-blur', 'code.terminal.background-desaturate', 'code.terminal.background-strength', 'code.terminal.background-scale', 'code.terminal.background-motion', 'code.terminal.opacity', 'code.terminal.padding'] },
      { key: 'term-fx', title: 'Effects', ids: ['code.terminal.effects', 'code.terminal.scanlines', 'code.terminal.scan-strength', 'code.terminal.glow', 'code.terminal.glow-strength', 'code.terminal.crt', 'code.terminal.curvature', 'code.terminal.burn-in', 'code.terminal.noise', 'code.terminal.flicker', 'code.terminal.phosphor-mask', 'code.terminal.sixtyfour-scan', 'code.terminal.sixtyfour-bleed', 'code.terminal.inactive-dim', 'code.terminal.smooth-scroll', 'code.terminal.bell'] },
      { key: 'term-bezel', title: 'Bezel', ids: ['code.terminal.bezel', 'code.terminal.bezel-width', 'code.terminal.bezel-material', 'code.terminal.bezel-reflection'] }
    ],
    moreLabel: 'All terminal look settings as a list', moreHelp: 'Customize shows these on a live terminal' });

  /* ================================================================== Chat & assistant */
  page('assistant', 'assistant', 'Sending & answering', { icon: 'chat', title: 'Chat & assistant',
    purpose: 'What happens when you send a message, and how the assistant starts and asks you things.',
    legacy: [['general', 'app-input']], keywords: ['enter', 'send', 'submit', 'mode', 'plan mode', 'agent', 'questions', 'spelling', 'spell'],
    sections: [
      S('app-chat', { title: 'Sending messages' }),
      S('app-chat-assistant', { title: 'How the assistant works' }),
      { key: 'spelling', title: 'Spelling', help: 'Spell checking for chat and notes, never for code.', ids: ['general.interaction.spellcheck', 'general.interaction.spellcheck-languages', 'general.interaction.spellcheck-words'] }
    ] });
  page('assistant/view', 'assistant', 'What the chat shows', { icon: 'eye', title: 'What the chat shows',
    purpose: 'Progress, thinking, code and pictures inside the conversation.',
    legacy: [['general', 'app-input']], keywords: ['thinking', 'activity', 'diagrams', 'history', 'copy button'],
    sections: [S('app-chat-view', { title: 'In the conversation' }), S('memory-context-meter', { title: 'How full the chat is', help: 'A small meter that shows how much the assistant can still keep in mind.' }), S('goals-progress', { title: 'Progress of long work', help: 'How a Goal’s progress is drawn.' })] });
  page('assistant/help', 'assistant', 'Help & explanations', { icon: 'info', title: 'Help & explanations',
    purpose: 'How much the app explains as you go, and in what words.',
    legacy: [['general', 'app-input']], keywords: ['plain english', 'expert', 'hints', 'tooltips', 'explain'],
    sections: [S('app-help', { title: 'Help & explanations', ids: ['general.interaction.mode', 'general.interaction.eli5-default', 'general.interaction.show-tooltips', 'general.interaction.explain-disabled'] }), S('doctor-display', { title: 'Status words around the app', help: 'Small labels that say whether something is ready, and links that fix it.' })],
    more: [S('app-help-more')],
    covers: { 'general.interaction.settings-search': 'The search box at the top of the Settings list. Today this is a row whose only button moves the cursor to that box.' } });

  /* ================================================================== Notifications & sounds */
  page('notifications', 'notifications', 'Where alerts go', { icon: 'bell', title: 'Notifications & sounds',
    purpose: 'What tells you something happened, where the message goes, and how it sounds.',
    legacy: [['general', 'notifications', 'destinations', 'notifications']], keywords: ['alerts', 'phone', 'ntfy', 'slack', 'discord', 'telegram', 'pushover', 'webhook', 'tray'],
    covers: Object.assign({}, D('notif-master', 'The switch at the top of this page.'), D('notif-destination-list', LIST)) });
  page('notifications/events', 'notifications', 'What you are told about', { icon: 'bell', title: 'What you are told about',
    purpose: 'Each kind of event, whether it reaches you, where and how loudly.',
    legacy: [['general', 'notifications', 'events', 'notifications']], keywords: ['events', 'goal finished', 'approval', 'failed'],
    sections: [S('notif-alerts', { title: 'Which alerts reach you' })],
    covers: D('notif-routing', LIST) });
  page('notifications/sounds', 'notifications', 'Sounds', { icon: 'volume', title: 'Sounds',
    purpose: 'The sound each event makes, and your own sounds.',
    legacy: [['general', 'notifications', 'sounds', 'notifications']], keywords: ['sound', 'chime', 'volume', 'mute', 'upload sound'],
    covers: D('notif-sound-defaults', LIST) });
  page('notifications/quiet', 'notifications', 'Quiet hours', { icon: 'moon', title: 'Quiet hours',
    purpose: 'Times when only urgent alerts get through.',
    legacy: [['general', 'notifications', 'quiet', 'notifications']], keywords: ['do not disturb', 'night', 'weekend', 'quiet'] });
  page('notifications/history', 'notifications', 'Past alerts', { icon: 'history', title: 'Past alerts',
    purpose: 'What was sent, where, and whether it arrived.',
    legacy: [['general', 'notifications', 'history', 'notifications']] });

  /* ================================================================== Memory & helpers */
  page('memory', 'memory', 'Memories', { icon: 'memory', title: 'Memory & helpers',
    purpose: 'What the assistant remembers between chats, the rules it follows, and the personas that help.',
    legacy: [['memory', 'context-memory', 'memories', 'memory']], keywords: ['remember', 'forget', 'memory', 'notes'],
    sections: [S('memory-fade', { title: 'How long memories last' }), S('memory-retention', { title: 'Notes that are not confirmed yet' })],
    more: [S('memory-matching', { title: 'How memories are found' }), S('memory-retrieval', { title: 'When memories are used' }), S('memory-retention-tools')],
    covers: Object.assign({}, D('memory-home', LIST), D('memory-sharing', 'A switch on this page: helpers may read memories.')) });
  page('memory/rules', 'memory', 'Rules & instructions', { icon: 'notes', title: 'Rules & instructions',
    purpose: 'Standing instructions the assistant follows in every chat, for every project or just this one.',
    legacy: [['memory', 'context-memory', 'instructions', 'memory']], keywords: ['instructions', 'rules', 'agents.md', 'prompt', 'rule pack'],
    sections: [S('memory-assembly-view', { title: 'What you can see' })],
    expert: [S('memory-assembly-safety')],
    covers: Object.assign({}, D('memory-assembly', LIST), D('memory-rulepacks', LIST)) });
  page('memory/space', 'memory', 'Working space', { icon: 'database', title: 'Working space',
    purpose: 'How much the assistant can keep in mind at once, and what happens when that fills up.',
    legacy: [['memory', 'context-memory', 'context', 'memory']], keywords: ['context', 'compaction', 'tokens', 'notebook', 'sources'],
    sections: [S('memory-limits', { title: 'When space runs low' }), S('memory-notebook')],
    more: [S('memory-limits-more'), S('memory-per-chat')],
    covers: D('memory-sources', 'The list “What can feed the working space” on this page.') });
  page('memory/personas', 'memory', 'Personas', { icon: 'user', title: 'Personas',
    purpose: 'Characters the assistant can take on: each has its own way of answering, its tools and its model.',
    legacy: [['memory', 'personas', 'personas', 'personas'], ['memory', 'personas', 'defaults', 'personas']], keywords: ['persona', 'character', 'role', 'tone'],
    sections: [S('personas-defaults', { title: 'Choosing a persona' })],
    expert: [S('personas-tools-audit')],
    covers: Object.assign({}, D('personas-home', LIST), D('personas-fields', 'On each persona’s own page.'), D('personas-model', 'On each persona’s own page.'), D('personas-tools', 'On each persona’s own page.'), D('personas-tuning', 'On each persona’s own page.'), D('personas-chat', 'On this page: personas in chats.')) });
  page('memory/crews', 'memory', 'Crews & group work', { icon: 'people', title: 'Crews & group work',
    purpose: 'Teams of personas that work together, and the ways a group can talk a problem through.',
    legacy: [['memory', 'personas', 'crews', 'personas'], ['memory', 'personas', 'workflows', 'personas']], keywords: ['crew', 'team', 'brainstorm', 'chat room', 'review', 'grill me'],
    sections: [S('personas-crew-defaults'), S('personas-crew-auto')],
    more: [S('personas-brainstorm'), S('personas-brainstorm-debate'), S('personas-chat-room'), S('personas-review')],
    moreLabel: 'BrainStorm, Chat Room and Review', moreHelp: 'How each kind of group session runs',
    covers: D('personas-crews', LIST) });
  page('memory/helpers', 'memory', 'Helper agents', { icon: 'users', title: 'Helper agents',
    purpose: 'Extra workers the assistant can start to split up a big job.',
    legacy: [['memory', 'personas', 'helpers', 'personas']], keywords: ['subagent', 'helpers', 'parallel', 'delegate'],
    sections: [S('personas-helpers'), S('personas-helper-picks'), S('personas-helper-safety')],
    expert: [S('personas-agent-limits'), S('personas-helper-tools')] });

  /* ================================================================== Planning & goals */
  page('planning', 'planning', 'Plans', { icon: 'map', title: 'Planning & goals',
    purpose: 'How the assistant plans before it builds, and how long-running Goals behave.',
    legacy: [['planning', 'planning-reference']], keywords: ['plan', 'deep plan', 'wizard', 'interview', 'grill me'],
    sections: [S('plan-modes'), S('plan-interview')],
    more: [S('plan-topics'), S('plan-helpers'), S('plan-question-limits'), S('plan-files')],
    moreLabel: 'The planning interview', moreHelp: 'Topics, helpers, question limits and files',
    expert: [S('plan-session', { title: 'Only for the wizard session that is open', help: 'These belong to one run of the Planning Wizard. They are kept here so nothing is lost; the wizard itself is where you set them.' })] });
  page('planning/goals', 'planning', 'Goals', { icon: 'target', title: 'Goals',
    purpose: 'A Goal is a big job the assistant keeps working on by itself. These are the defaults a new Goal starts with.',
    legacy: [['memory', 'goals', 'defaults', 'goals'], ['memory', 'goals', 'templates', 'goals']], keywords: ['goal', 'autonomous', 'template', 'schedule'],
    sections: [S('goals-watch'), S('goals-scheduling')],
    covers: Object.assign({}, D('goals-defaults', 'The card “A new Goal starts with” on this page.'), D('goals-template-fields', LIST)) });
  page('planning/recovery', 'planning', 'When something goes wrong', { icon: 'restore', title: 'When something goes wrong',
    purpose: 'What a Goal does when it is interrupted, when a check fails, or when you change your mind.',
    legacy: [['memory', 'goals', 'checkpoints', 'goals']], keywords: ['resume', 'retry', 'checkpoint', 'repair', 'replan'],
    sections: [S('goals-recovery'), S('goals-repair'), S('goals-replan')] });
  page('planning/proof', 'planning', 'Checking the work', { icon: 'check', title: 'Checking the work',
    purpose: 'What must be true before a Goal is called done, and the proof it keeps.',
    legacy: [['memory', 'goals', 'verification', 'goals']], keywords: ['verify', 'verification', 'receipt', 'evidence', 'review', 'code health'],
    sections: [S('goals-evidence'), S('toolchain-code-gate', { title: 'Code health check', help: 'Looks for code problems before work moves on.' })],
    more: [S('goals-verification-more')],
    covers: Object.assign({}, D('goals-verification', 'The card “Before a Goal is called done” on this page.'), D('goals-receipt', 'The receipt strength choice on this page.')) });

  /* ================================================================== Code & tools */
  page('code', 'code', 'Editor & files', { icon: 'code', title: 'Code & tools',
    purpose: 'The editor, the terminal, and the tools the assistant can pick up. How they look is under Look & feel.',
    legacy: [['code', 'editor-runtime']], keywords: ['editor', 'autosave', 'tabs', 'file tree', 'indent', 'diff', 'search index'],
    sections: [
      S('editor-open', { title: 'Saving & tabs', ids: ['code.editing.autosave', 'code.editing.default-encoding', 'general.interaction.preview-tabs', 'general.interaction.tab-sizing', 'general.interaction.max-editor-tabs', 'general.startup.max-persisted-tabs'] }),
      S('editor-files'), S('editor-editing'),
      S('editor-search-index', { title: 'Search in this project', help: 'A fast index so search and autocomplete are instant.', ids: ['web.index.enable', 'web.index.mode', 'web.index.exclusion-patterns', 'web.index.rebuild'] })
    ],
    more: [S('editor-big-files'), S('editor-search-index-more')] });
  page('code/terminal', 'code', 'Terminal', { icon: 'terminal', title: 'Terminal',
    purpose: 'Which shell runs, where it starts, and what is kept of its output.',
    legacy: [['code', 'editor-runtime']], keywords: ['shell', 'bash', 'zsh', 'powershell', 'paste', 'scrollback'],
    sections: [
      S('editor-terminal', { title: 'Starting a terminal', ids: ['code.terminal.shell', 'code.terminal.cwd', 'code.terminal.startup-command', 'code.terminal.layout-restore', 'code.terminal.kill-confirm'] }),
      S('editor-terminal-output'),
      S('editor-terminal-copy', { ids: ['code.terminal.copy-on-select', 'code.terminal.right-click-paste', 'code.terminal.copy-behavior', 'code.terminal.paste-protection'] })
    ],
    more: [S('editor-terminal-more')] });
  page('code/languages', 'code', 'Language help', { icon: 'brackets', title: 'Language help',
    purpose: 'Helpers that understand a programming language: they underline mistakes, complete what you type and tidy the code.',
    legacy: [['code', 'toolchain', 'servers', 'toolchain'], ['code', 'toolchain', 'formatters', 'toolchain']], keywords: ['lsp', 'language server', 'formatter', 'prettier', 'rustfmt', 'autocomplete'],
    sections: [S('toolchain-lsp'), S('toolchain-formatters')],
    expert: [S('toolchain-lsp-tools')],
    covers: Object.assign({}, D('toolchain-lsp-home', LIST), D('toolchain-fmt-home', LIST)) });
  page('code/skills', 'code', 'Skills', { icon: 'wand', title: 'Skills',
    purpose: 'A skill is a set of written instructions that teaches the assistant how to do one kind of job well.',
    legacy: [['code', 'skills']], keywords: ['skill', 'skills'],
    sections: [S('skills-use'), S('skills-new')],
    more: [S('skills-share'), S('skills-more')],
    covers: D('skills-home', LIST) });
  page('code/plugins', 'code', 'Plugins', { icon: 'puzzle', title: 'Plugins',
    purpose: 'A plugin adds new abilities to Puppet Master itself, made by you or by others.',
    legacy: [['code', 'plugins']], keywords: ['plugin', 'extension', 'catalog'],
    sections: [S('plugins-limits')],
    covers: Object.assign({}, D('plugins-home', LIST), D('plugins-new', 'A switch on this page.')) });
  page('code/connections', 'code', 'Tool connections (MCP)', { icon: 'plug', title: 'Tool connections',
    purpose: 'A tool connection lets the assistant use another app or service, such as GitHub or your files. The technical name is an MCP server.',
    legacy: [['code', 'mcp']], keywords: ['mcp', 'mcp server', 'tools', 'connector'],
    sections: [S('mcp-defaults')],
    more: [S('mcp-more')], expert: [S('mcp-debug')],
    covers: Object.assign({}, D('mcp-home', LIST), D('mcp-import', 'A choice on this page: connections found in other apps.')) });
  page('code/agent-tools', 'code', 'Built-in tools', { icon: 'sliders', title: 'Built-in tools',
    purpose: 'The tools the assistant has out of the box, such as the browser and the terminal.',
    legacy: [['code', 'toolchain', 'agent-tools', 'toolchain']], keywords: ['agent tools', 'browser tool'] });
  page('code/shortcuts', 'code', 'Keyboard shortcuts', { icon: 'key', title: 'Keyboard shortcuts',
    purpose: 'Every key combination, with search, and what happens when two actions share keys.',
    legacy: [['code', 'commands', 'shortcuts', 'commands']], keywords: ['shortcut', 'keybinding', 'hotkey', 'keys'],
    covers: Object.assign({}, D('commands-keys', LIST), D('commands-hints', 'Two choices at the top of the list.'), D('commands-key-tools', 'Reset and back up, under More options.')) });
  page('code/commands', 'code', 'Your commands', { icon: 'terminal', title: 'Your commands',
    purpose: 'Short commands you type with a slash, such as /release-notes, that run a prompt you wrote.',
    legacy: [['code', 'commands', 'commands', 'commands']], keywords: ['slash command', 'command', 'custom command'],
    covers: Object.assign({}, D('commands-list', LIST), D('commands-defaults', 'Defaults for new commands, under More options.'), D('commands-builtins', 'Built-in names, under For experts.')) });
  page('code/testing', 'code', 'Testing', { icon: 'flask', title: 'Testing',
    purpose: 'Whether the assistant tests its own work, how thoroughly, and when.',
    legacy: [['code', 'testing', 'profiles', 'testing'], ['code', 'testing', 'when', 'testing'], ['code', 'testing', 'browser-native', 'testing'], ['code', 'testing', 'history', 'testing']], keywords: ['test', 'tests', 'profile', 'browser test', 'simulator', 'accessibility'],
    sections: [S('testing-premerge'), S('testing-cap-backend', { title: 'Behind the scenes' })],
    expert: [S('testing-cap-tools')],
    covers: Object.assign({}, D('testing-policy', 'The switch at the top of this page.'), D('testing-session', LIST), D('testing-capabilities', 'The card “In a browser” on this page.'), D('testing-cap-apps', 'The card “Desktop and mobile apps” on this page.')) });
  page('code/debug', 'code', 'Debugging', { icon: 'test', title: 'Debugging',
    purpose: 'Setups for running your program under a debugger, and what the assistant may do while it hunts a bug.',
    legacy: [['code', 'testing', 'debug', 'testing']], keywords: ['debug', 'debugger', 'breakpoint'],
    sections: [S('testing-debug-permissions')],
    expert: [S('testing-debug-limits')],
    covers: D('testing-debug-setups', LIST) });
  page('code/browser', 'code', 'Built-in browser', { icon: 'browser', title: 'Built-in browser',
    purpose: 'The browser inside Puppet Master: what a screenshot captures, and whether it stays signed in to websites.',
    legacy: [['source', 'browser-scm']], keywords: ['browser', 'screenshot', 'devtools', 'cookies', 'login'],
    sections: [S('browser-sessions'), S('browser-capture-tools')],
    covers: D('browser-share', 'A switch at the top of this page.') });
  page('code/containers', 'code', 'Containers', { icon: 'box', title: 'Containers',
    purpose: 'Docker on this computer, the containers a project runs, and keeping their disk use in check.',
    legacy: [['code', 'code-reference']], keywords: ['docker', 'container', 'compose', 'kubernetes', 'k8s', 'helm'],
    sections: [S('exec-docker-local'), S('exec-running'), S('exec-cleanup')],
    more: [S('exec-drift'), S('exec-k8s')],
    expert: [S('exec-views-more')] });
  page('code/publishing', 'code', 'Publishing an app', { icon: 'upload', title: 'Publishing an app',
    purpose: 'Building your project into an image, sending it to a registry, and listing it in the Unraid app store.',
    legacy: [['code', 'code-reference']], keywords: ['docker hub', 'registry', 'image', 'publish', 'unraid', 'template'],
    sections: [S('exec-build', { title: 'Building images' }), S('exec-docker-registry')],
    more: [S('exec-unraid'), S('exec-unraid-listing'), S('exec-unraid-publisher')],
    moreLabel: 'Unraid app store', moreHelp: 'Templates, your store listing and your publisher profile',
    expert: [S('exec-unraid-more')] });

  /* ================================================================== Source control */
  page('source', 'source', 'Code services & accounts', { icon: 'branch', title: 'Source control',
    purpose: 'Version history keeps every saved change so you can go back. A code service such as GitHub holds a copy online.',
    legacy: [['source', 'source-manager', 'services', 'source']], keywords: ['github', 'gitlab', 'bitbucket', 'forgejo', 'gitea', 'azure devops', 'git', 'token'],
    covers: D('source-github-auth', 'On GitHub’s own page: its account, token and allowed servers.') });
  page('source/you', 'source', 'You & your key', { icon: 'user', title: 'You & your key',
    purpose: 'The name and email written on your changes, and how Git signs in to send them.',
    legacy: [['source', 'source-manager', 'defaults', 'source']], keywords: ['git name', 'git email', 'ssh key', 'signing', 'commit signing'],
    covers: D('source-git-you', 'The card “You” on this page.') });
  page('source/repos', 'source', 'Repositories & workspaces', { icon: 'folder', title: 'Repositories & workspaces',
    purpose: 'The online copies this project has, and the separate working copies chats use so they do not get in each other’s way.',
    legacy: [['source', 'source-manager', 'repos', 'source'], ['source', 'source-manager', 'tools', 'source']], keywords: ['repository', 'repo', 'worktree', 'workspace', 'fork', 'jujutsu'],
    sections: [S('source-chat-workspaces'), S('source-worktrees')],
    expert: [S('source-worktree-tools')],
    covers: Object.assign({}, D('source-new-repo', 'The card “A new online copy” on this page.'), D('source-contribute', 'The card “Contribute to someone else’s project” on this page.')) });
  page('source/rules', 'source', 'How work is saved', { icon: 'shield', title: 'How work is saved',
    purpose: 'How runs use version history, what is never saved, and the safety rules for sending work online.',
    legacy: [['source', 'source-manager', 'defaults', 'source']], keywords: ['branch', 'merge', 'push', 'force push', 'protected', 'lfs', 'ignore'],
    sections: [S('source-branches')],
    expert: [S('source-panel')],
    covers: Object.assign({}, D('source-safety', 'The card “Safety” on this page.'), D('source-git-files', 'The card “Files that need care” on this page.'), D('source-recovery', 'The button “Fix a stuck branch or workspace”.')) });
  page('source/checks', 'source', 'Online checks', { icon: 'play', title: 'Online checks',
    purpose: 'Builds and tests that a code service runs for you, such as GitHub Actions.',
    legacy: [['source', 'source-manager', 'actions', 'source']], keywords: ['actions', 'pipeline', 'ci', 'workflow'],
    sections: [S('source-actions')],
    covers: D('source-actions-pins', LIST) });

  /* ================================================================== Safety & permissions */
  page('safety', 'safety', 'What it may do', { icon: 'shield', title: 'Safety & permissions',
    purpose: 'What the assistant may do by itself, what it asks you first, and what it must never touch.',
    legacy: [['safety', 'permissions', 'profiles', 'permissions']], keywords: ['permission', 'profile', 'yolo', 'plan only', 'ask', 'allow'],
    sections: [S('permissions-freedom', { title: 'New chats and runs start with' })],
    expert: [S('permissions-freedom-more')],
    covers: D('permissions-profiles', 'The profile choice at the top of this page.') });
  page('safety/asking', 'safety', 'When it asks you', { icon: 'chat', title: 'When it asks you',
    purpose: 'What always needs your OK, where the question appears, and what happens if you do not answer.',
    legacy: [['safety', 'permissions', 'approvals', 'permissions']], keywords: ['approval', 'approve', 'ask me', 'timeout', 'pause'],
    sections: [S('permissions-always-ask'), S('permissions-answering'), S('permissions-pauses')],
    more: [S('permissions-approvals-more')] });
  page('safety/rules', 'safety', 'Rules for each action', { icon: 'sliders', title: 'Rules for each action',
    purpose: 'An answer for each kind of action: allow, ask or never. A rule here is an exception to the profile.',
    legacy: [['safety', 'permissions', 'rules', 'permissions']], keywords: ['rule', 'rules', 'allow list', 'tool permission'],
    expert: [S('permissions-rules-more')],
    covers: Object.assign({}, D('permissions-rules', LIST), D('permissions-tool-answers', LIST), D('permissions-rules-view', 'Two choices above the list.')) });
  page('safety/protected', 'safety', 'Protected files & commands', { icon: 'lock', title: 'Protected files & commands',
    purpose: 'Files the assistant must not read or change, commands it must not run, and secrets it hides.',
    legacy: [['safety', 'permissions', 'protected', 'permissions']], keywords: ['filesafe', 'secret', 'env', 'dangerous', 'rm -rf', 'redact'],
    sections: [S('permissions-protection'), S('permissions-commands'), S('permissions-outside'), S('permissions-redaction')],
    expert: [S('permissions-exceptions')] });
  page('safety/limits', 'safety', 'Limits for one run', { icon: 'clock', title: 'Limits for one run',
    purpose: 'How long, how far and how much one run may go before it stops and asks.',
    legacy: [['safety', 'permissions', 'limits', 'permissions']], keywords: ['limit', 'timeout', 'runaway', 'loop', 'budget per run'],
    sections: [S('permissions-run-limits'), S('permissions-runaway')],
    more: [S('permissions-limits-more')] });

  /* ================================================================== Backups & history */
  page('keeping', 'keeping', 'Backups', { icon: 'archive', title: 'Backups & history',
    purpose: 'A backup is a copy of your work kept somewhere else, so losing a computer does not lose the work.',
    legacy: [['system', 'backup', 'backup', 'backup']], keywords: ['backup', 'restore', 'recovery kit', 'schedule', 'encryption'] });
  page('keeping/places', 'keeping', 'Where backups go', { icon: 'cloud', title: 'Where backups go',
    purpose: 'The places a backup is sent: another computer, a NAS, or a cloud account.',
    legacy: [['system', 'backup', 'destinations', 'backup']], keywords: ['destination', 's3', 'google drive', 'onedrive', 'nas', 'sftp', 'webdav'] });
  page('keeping/restore', 'keeping', 'Get work back', { icon: 'restore', title: 'Get work back',
    purpose: 'Bring back a project, or everything, from a backup. You see what will change before anything does.',
    legacy: [['system', 'backup', 'restore', 'backup'], ['system', 'backup', 'history', 'backup']], keywords: ['restore', 'recover', 'undo'] });
  page('keeping/history', 'keeping', 'History of this project', { icon: 'history', title: 'History of this project',
    purpose: 'What happened and when: past chats and work, the files that were made, and going back to an earlier point.',
    legacy: [['projects', 'project-history', 'timeline', 'history'], ['projects', 'project-history', 'sessions', 'history'], ['projects', 'project-history', 'artifacts', 'history']], keywords: ['timeline', 'sessions', 'artifacts', 'export history'],
    covers: Object.assign({}, D('history-view', 'The choices above the timeline.'), D('history-sessions', 'A switch on the list of past sessions.'), D('history-export', 'Export and import, under More options.')) });
  page('keeping/cleanup', 'keeping', 'How long things are kept', { icon: 'clock', title: 'How long things are kept',
    purpose: 'One place for every “keep for” choice: chats, records, proof of work, results and saved web pages.',
    legacy: [['projects', 'project-history', 'cleanup', 'history']], keywords: ['retention', 'cleanup', 'delete', 'keep for', 'archive', 'storage'],
    sections: [S('history-retention', { title: 'Chats' }), S('history-records', { title: 'Records and logs' }), S('testing-evidence', { title: 'Proof that work was checked' })],
    expert: [S('history-tools')] });

  /* ================================================================== Health & updates */
  page('system', 'system', 'Checkup', { icon: 'heart', title: 'Health & updates',
    purpose: 'A checkup looks at everything Puppet Master depends on and says what to fix.',
    legacy: [['system', 'doctor']], keywords: ['doctor', 'readiness', 'checkup', 'diagnostics', 'problem'],
    sections: [S('doctor-checkups')],
    expert: [S('doctor-tools')],
    covers: D('doctor-summary', 'The checkup results at the top of this page.') });
  page('system/updates', 'system', 'Updates', { icon: 'download', title: 'Updates',
    purpose: 'New versions of Puppet Master, and the lists it keeps current, such as which AI models exist.',
    legacy: [['system', 'updates']], keywords: ['update', 'version', 'release', 'channel'],
    more: [S('updates-settings')],
    covers: Object.assign({}, D('updates-app', 'The switch “Look for updates automatically” on this page.'), D('updates-catalogs', 'The switch “Keep content up to date” on this page.')) });
  page('system/copy', 'system', 'Copy settings', { icon: 'copy', title: 'Copy settings',
    purpose: 'Bring the settings of another project here, or save them to a file. Passwords, keys and sign-ins never move.',
    legacy: [['system', 'settings-transfer']], keywords: ['transfer', 'export', 'import', 'copy settings', 'save settings'],
    expert: [S('transfer-files-more')],
    covers: D('transfer-files', 'The two tasks “Save to a file” and “Load a file” on this page.') });
  page('system/setup', 'system', 'Setup & tour', { icon: 'rocket', title: 'Setup & tour',
    purpose: 'Run the first-time setup again, take the tour, and choose what a fresh start shows.',
    legacy: [['system', 'doctor']], keywords: ['onboarding', 'tour', 'first run', 'wizard'],
    sections: [S('doctor-onboarding', { title: 'On a fresh start' })] });
  page('system/advanced', 'system', 'Privacy & troubleshooting', { icon: 'sliders', title: 'Privacy & troubleshooting',
    purpose: 'What Puppet Master shares with its makers, extra detail for hunting a problem, and starting over.',
    legacy: [['system', 'advanced']], keywords: ['telemetry', 'privacy', 'logs', 'debug', 'reset', 'renderer'],
    sections: [{ key: 'privacy', title: 'Sharing with the makers', ids: ['system.health.telemetry'] }],
    more: [S('adv-diagnostics')],
    expert: [S('adv-runtime'), { key: 'reset', title: 'Start over', help: 'Puts every setting of this project back to how it came.', ids: ['system.advanced.reset-defaults'] }] });
  page('system/all', 'system', 'Every setting, as a list', { icon: 'search', title: 'Every setting, as a list',
    purpose: 'All settings in one searchable list, for when you know the name of what you want.',
    legacy: [['projects', 'project-settings']], keywords: ['all settings', 'list', 'index'], cls: 'is-wide' });
})(window);
