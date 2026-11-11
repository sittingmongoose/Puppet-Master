/* Settings managers, rethought (Fable 5.2): the words pass.
   Every row on every page was scanned (2026-11-11) for words a newcomer would not know or that PMConcept7 uses for two
   things: "workspace" (a project), "service" (an AI provider), "token" with no explanation, "the server" (your Server).
   A chapter rewords its own rows in its own file; this file holds what was left, most of it on the lead's pages. Only
   the words change: each setting keeps its id, its value and its control. Loaded after every chapter, merged per row. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || !SMX.reword) return;
  const SERVER = 'Your Server may allow fewer.';
  SMX.reword({
    /* ---- Look & feel › Window & panels */
    'general.startup.first-screen': { options: { 'Restore last workspace': 'Where I left off' } },
    'general.startup.restore-panel': { options: { Artifacts: 'Files the work produced' } },
    'general.startup.starting-layout': { help: 'The layout a project opens in when it has no saved layout of its own: Home (a dashboard and your files over a row for terminals and tools), Build, Terminals 2x2 (four terminals) or Focus (one panel).' },
    /* ---- Look & feel › Editor look */
    'code.editing.token-colors': { label: 'Colours for one kind of word', help: 'Your own colour for one kind of word (a keyword, a number, a comment) in one colour scheme. Set them in the editor’s Customize screen, under Colors.' },
    /* ---- AI providers: "service" is an AI provider */
    'ai.models.default-provider': { label: 'AI provider tried first', help: 'Used first when more than one AI provider could do a job.' },
    'ai.models.provider-priority': { label: 'The order AI providers are tried in', help: 'Used when several AI providers could do a job.' },
    'ai.models.provider-fallback': { label: 'Move to another AI provider when one is down', help: 'Otherwise the run stops when its AI provider is down.' },
    'ai.accounts.default-account': { help: 'Each AI provider’s accounts are on its own page.', options: { 'The one I pick for each service': 'The one I pick for each AI provider' } },
    'ai.models.provider-options': { label: 'Extra options for an AI provider', help: 'Options passed straight to an AI provider, each written as a name and a value, for anything that has no switch of its own.' },
    'ai.models.per-lane-platform': { label: 'AI provider for each kind of work', help: 'A different AI provider for each kind of work in a big job.', options: { 'The everyday model’s service': 'The everyday model’s AI provider' } },
    'ai.models.per-lane-model': { label: 'Model for each kind of work', help: 'An exact model name for one kind of work, written the way its AI provider writes it. Leave it blank to use that provider’s usual model.' },
    /* ---- AI providers › Spending & warnings: a token is said once, where the number is set */
    'ai.usage.monthly-token-budget': { label: 'Monthly limit on tokens', help: 'AI use is counted in tokens: a token is a small piece of text, about three quarters of a word. This number feeds the warnings and the limits for one run. 0 means no limit.' },
    'system.advanced.cache-linter': { help: 'Warns you before a change makes every request cost more.' },
    'ai.usage.platform-filters': { label: 'AI providers on the Usage page' },
    'ai.usage.quota-management': { label: 'Limits and budgets, all in one place', help: 'One screen to review and change every limit and budget together.' },
    'ai.usage.pressure-history': { label: 'When accounts ran low', help: 'A record of the times an account came close to a limit or was slowed down. It shows an account that is always tight.' },
    'ai.usage.pricing-version': { options: { 'Each service\'s current prices': 'Each AI provider’s current prices', 'Each service’s current prices': 'Each AI provider’s current prices' } },
    /* ---- Health & updates › Setup & tour */
    'planning.interview.wizard-first-run': { help: 'Right after you connect your first AI provider.' },
    'planning.interview.provider-setup-skip': { label: 'Allow skipping the AI provider step', help: 'Setup offers “Skip for now”; you can add one later under AI providers.' },
    /* ---- Computers › Where work runs */
    'general.interaction.no-project-default-computer': { help: 'Uses your Server when it can be reached; otherwise the computer you chose as your main one.' },
    /* ---- Safety › Protected */
    'safety.protection.redaction-profile': { help: 'Patterns for things like keys, passwords and email addresses. What matches is removed from logs and from the screen before anything is shown or saved.' },
    /* ---- Memory & helpers: "the server" is your Server */
    'branching.subagents.max-parallel': { help: SERVER },
    'branching.subagents.max-total-active-agents': { help: SERVER },
    'branching.subagents.provider-concurrency-cap': { label: 'Requests to one AI provider at once', help: SERVER },
    'branching.crew.max-crews-per-platform': { help: SERVER },
    'branching.crew.max-agents-per-crew': { help: SERVER }
  });
})(window);
