
/* PMConcept6 — PM_DEMO fake-functional demo engine (contract: contracts/pm_demo_api.md).
   Preloaded story: "Tastebook" recipe-sharing app (SvelteKit + Rust/Axum + Postgres + Docker).
   Modules: bus / state store / applied-beat log / 250ms virtual clock / director
   (ambient + chapters c1..c5 + hold beats + ensure()) / stream / guard + delegated
   [data-demo-action] router / dev panel (Ctrl+Shift+D) / facades / DATA + TEXT.
   NOTE: the store field the API sketch calls the run "*" lifecycle field is named
   `stage` here (vocab gate). No persistence anywhere: reload = pristine. */
(function () {
  'use strict';

  /* ================= tiny helpers ================= */
  function safe(fn, tag) {
    return function () {
      try { return fn.apply(this, arguments); }
      catch (e) { try { console.error('[PM_DEMO]', tag || 'fn', e); } catch (e0) {} }
    };
  }
  function say(msg) { try { if (window.toast) window.toast(msg); } catch (e) {} }
  function byId(id) { return document.getElementById(id); }
  function pad2(n) { n = Math.floor(n); return (n < 10 ? '0' : '') + n; }
  function fmtClock(sec) {
    sec = Math.max(0, Math.floor(sec));
    return pad2(sec / 3600) + ':' + pad2((sec % 3600) / 60) + ':' + pad2(sec % 60);
  }
  var uidSeq = 0;
  function uid(p) { return (p || 'id') + '-' + (++uidSeq); }

  /* span helpers for pre-highlighted text (token colors only) */
  var HK = '<span style="color:var(--accent-magenta)">';   /* keyword   */
  var HS = '<span style="color:var(--accent-lime)">';      /* string    */
  var HC = '<span style="color:var(--text-muted)">';       /* comment   */
  var HF = '<span style="color:var(--accent-blue)">';      /* fn/ident  */
  var HN = '<span style="color:var(--accent-orange)">';    /* num/type  */
  var HE = '</span>';
  function ok(s)   { return '<span style="color:var(--accent-lime)">' + s + HE; }
  function warn(s) { return '<span style="color:var(--accent-orange)">' + s + HE; }
  function err(s)  { return '<span style="color:var(--accent-error)">' + s + HE; }
  function dim(s)  { return HC + s + HE; }

  /* ================= PM_DEMO_DATA ================= */
  var DATA = {
    project: {
      name: 'Tastebook',
      tagline: 'Recipe sharing for people who actually cook',
      stack: ['SvelteKit', 'Rust / Axum', 'Postgres 16', 'Docker'],
      repo: 'github.com/jared/tastebook',
      branch: 'main',
      discovery: { branch: 'main', worktreeClean: true, frameworks: ['Axum 0.8', 'SvelteKit 2', 'sqlx'], packageManagers: ['cargo', 'pnpm'], testCommands: ['cargo test', 'pnpm test'] }
    },
    wizard: {
      planName: 'Tastebook v1.2 — media pipeline + import hardening',
      importedBanner: {
        from: 'Assistant Chat', goal: 'Add image processing for recipe photos and harden import-from-URL',
        scope: 'Media pipeline, import worker, deployment storage', includedPlan: true, openQuestions: 1, hasGui: true
      },
      hashes: { planningRunRev: 12, topicMapVersion: 'v9', planUnitIdx: '8f3a91', testingPolicy: 'c41d20', auditClosure: 'e77b02' },
      reqs: {
        prd: { packId: 'prd-9c2e41', version: 'v1' },
        sampleDocs: [
          { id: 'd1', name: 'media-pipeline-brief.docx', kind: 'docx', size: '184 KB', hash: 'sha 9c11f2…', atoms: 14,
            warnings: null, finalStatus: 'parsed', fills: ['sec-func', 'sec-source'],
            receipt: 'MIME verified · size within intake limits · no active content' },
          { id: 'd2', name: 'import-hardening-notes.md', kind: 'md', size: '12 KB', hash: 'sha 4be07a…', atoms: 9,
            warnings: null, finalStatus: 'parsed', fills: ['sec-func', 'sec-source'],
            receipt: 'MIME verified · size within intake limits · no active content' },
          { id: 'd3', name: 'storage-vendor-quotes.pdf', kind: 'pdf', size: '631 KB', hash: 'sha e2c9d4…', atoms: 6,
            warnings: '2 pages skipped (scanned images)', finalStatus: 'parsed_warn', fills: ['sec-open', 'sec-risks', 'sec-source'],
            receipt: 'MIME verified · size within intake limits · no active content' }
        ],
        builderTurns: [
          { id: 'bt1', area: 'goal', agent: 'What is the one-line goal for this run?',
            chips: ['Media pipeline + import hardening', 'Media pipeline only'], freeform: true,
            fills: ['sec-overview', 'sec-goals'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt2', area: 'users', agent: 'Who is this for — whose workflow changes?',
            chips: ['Home cooks who publish', 'All Tastebook users'], freeform: true,
            fills: ['sec-users'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt3', area: 'scope', agent: 'Where do the boundaries sit — what is explicitly out?',
            chips: ['No mobile app work', 'No billing changes'], freeform: true,
            fills: ['sec-scope'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt4', area: 'media', agent: 'When a photo lands in the editor, what should happen?',
            chips: ['Resize ladder + thumbnails', 'Store original only'], freeform: true,
            fills: ['sec-func', 'sec-accept'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt5', area: 'media', agent: 'Which formats must the pipeline accept?',
            chips: ['JPEG, PNG, WebP', 'Anything a browser renders'], freeform: true,
            fills: ['sec-func'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt6', area: 'import', agent: 'A failed import today dies silently. What should it do instead?',
            chips: ['Retry, then surface an error card', 'Fail fast, no retries'], freeform: true,
            fills: ['sec-func', 'sec-accept'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt7', area: 'import', agent: 'Should imported pages get a sandboxed parse?',
            chips: ['Sandboxed parse + sanitize', 'Trust schema.org data'], freeform: true,
            fills: ['sec-func'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt8', area: 'non-functional', agent: 'Any hard limits the plan must respect?',
            chips: ['25 MB uploads, resize under 3 s', 'Defaults are fine'], freeform: true,
            fills: ['sec-nonfunc'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt9', area: 'risks', agent: 'Biggest risk you already see?',
            chips: ['Storage cost blow-up', 'Scraper legal posture'], freeform: true,
            fills: ['sec-risks'], ack: 'Recorded to the PRD ledger.' },
          { id: 'bt10', area: 'open questions', agent: 'One open question remains from the chat import: where should images and backups live? I can carry it into planning as an open question.',
            chips: ['Carry it into planning', 'Decide now'], freeform: false,
            fills: ['sec-open'], ack: 'Recorded to the PRD ledger — carried into planning as an open question.',
            ackAlt: 'The storage call needs the deployment topic evidence, so it stays an open question — planning surfaces it in the deployment topic.' }
        ],
        outline: [
          { id: 'sec-overview', label: 'Overview' },
          { id: 'sec-goals', label: 'Goals' },
          { id: 'sec-users', label: 'Users' },
          { id: 'sec-scope', label: 'Scope Boundaries' },
          { id: 'sec-func', label: 'Functional Requirements' },
          { id: 'sec-nonfunc', label: 'Non-Functional Requirements' },
          { id: 'sec-accept', label: 'Acceptance Criteria' },
          { id: 'sec-risks', label: 'Risks' },
          { id: 'sec-open', label: 'Open Questions' },
          { id: 'sec-source', label: 'Source Notes' }
        ],
        /* live PRD projection seed — a block renders once answers[src] exists or the
           doc src is parsed; {a} substitutes the recorded answer (plain text only) */
        prdDoc: {
          title: 'Tastebook v1.2 — PRD (draft)',
          sections: [
            { id: 'sec-overview', label: 'Overview', blocks: [
              { src: 'bt1', text: 'This planning run covers: {a}. One run, one PRD ledger, one approved pack at the end.' } ] },
            { id: 'sec-goals', label: 'Goals', blocks: [
              { src: 'bt1', text: 'Goal: {a}.' },
              { src: 'd1', text: 'Media brief reconciled: resize ladder, thumbnail set, EXIF strategy (14 atoms).' } ] },
            { id: 'sec-users', label: 'Users', blocks: [
              { src: 'bt2', text: 'Built for: {a}. Their publish flow is the one this run changes.' } ] },
            { id: 'sec-scope', label: 'Scope Boundaries', blocks: [
              { src: 'bt3', text: 'Explicitly out: {a}.' },
              { src: 'd2', text: 'Import hardening notes bound the worker changes to the existing scraper surface (9 atoms).' } ] },
            { id: 'sec-func', label: 'Functional Requirements', blocks: [
              { src: 'bt4', text: 'FR-001 — Photo intake: {a}.' },
              { src: 'bt5', text: 'FR-002 — Accepted formats: {a}.' },
              { src: 'bt6', text: 'FR-003 — Failed imports: {a}.' },
              { src: 'bt7', text: 'FR-004 — Imported pages: {a}.' } ] },
            { id: 'sec-nonfunc', label: 'Non-Functional Requirements', blocks: [
              { src: 'bt8', text: 'Hard limits: {a}. The pipeline stays inside these bounds end to end.' } ] },
            { id: 'sec-accept', label: 'Acceptance Criteria', blocks: [
              { src: 'bt4', text: 'AC-001 — A photo dropped in the editor produces the full rendition set within the recorded limits.' },
              { src: 'bt6', text: 'AC-002 — A failing import surfaces a visible error card after the retry budget, never a silent drop.' } ] },
            { id: 'sec-risks', label: 'Risks', blocks: [
              { src: 'bt9', text: 'Top risk: {a}. Mitigation tracked in the planning ledger.' },
              { src: 'd3', text: 'Storage vendor quotes attached — cost exposure bounded by the vendor comparison (6 atoms).' } ] },
            { id: 'sec-open', label: 'Open Questions', blocks: [
              { src: 'bt10', text: 'Where should images and backups live? Disposition: {a}.' },
              { src: 'd3', text: 'Vendor quotes parsed with warnings — 2 scanned pages skipped; the storage call stays open.' } ] },
            { id: 'sec-source', label: 'Source Notes', blocks: [
              { src: 'd1', text: 'media-pipeline-brief.docx — parsed · 14 requirement atoms.' },
              { src: 'd2', text: 'import-hardening-notes.md — parsed · 9 requirement atoms.' },
              { src: 'd3', text: 'storage-vendor-quotes.pdf — parsed with warnings · 6 requirement atoms.' } ] }
          ]
        }
      },
      topics: [
        { id: 't1', num: 1, title: 'Recipe data model', state: 'ready', depends_on: [],
          summary: 'Recipes, ingredients, steps, tags — Postgres schema + sqlx migrations.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Recipes, ingredients, steps and tags live in Postgres behind sqlx migrations. Revision history is kept as full rows keyed by recipe id.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['A recipe saved twice yields two revision rows; the newest revision is what renders.'] },
            { id: 'ds-open', h: 'Open items', paras: ['None — evidence closed every open call on this topic.'] } ] },
          questions: [{ id: 'q-rev', text: 'How should recipe revisions be kept?', chips: ['Full history', 'Last 10 only', 'No history'], freeform: 'Something else', answer: 'Full history' }] },
        { id: 't2', num: 2, title: 'Auth & accounts', state: 'ready', depends_on: ['t1'],
          summary: 'Email + OAuth sign-in, session cookies, account deletion path.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Email plus GitHub and Google OAuth; sessions ride HttpOnly cookies with a 30-day sliding expiry.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['Sign-in via each provider issues a session cookie; account deletion removes rows and revokes sessions.'] },
            { id: 'ds-open', h: 'Open items', paras: ['None — the provider set is confirmed from the Approved PRD Pack.'] } ] },
          questions: [{ id: 'q-oauth', text: 'Which OAuth providers at launch?', chips: ['GitHub + Google', 'Google only', 'None yet'], freeform: 'Something else', answer: 'GitHub + Google' }] },
        { id: 't3', num: 3, title: 'Editor & media upload', state: 'active', depends_on: ['t1'],
          summary: 'Step-by-step recipe editor with drag-in photos; image-processing package resizes uploads on a ladder.',
          intro: 'This topic covers the editor and the media pipeline. Evidence answered the resize path; two product calls are left.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Step-by-step editor with drag-in photos. The image-processing package resizes uploads on a 320/800/1600 ladder.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['A dropped photo yields three renditions and a thumbnail; EXIF handling follows the recorded decision.'] },
            { id: 'ds-open', h: 'Open items', paras: ['Max upload size and the EXIF policy are open product calls — the interview asks them.'] } ] },
          questions: [
            { id: 'q-size', text: 'Max photo upload size?', chips: ['10 MB', '25 MB', 'Unlimited'], freeform: 'Something else', answer: null },
            { id: 'q-exif', text: 'Keep photo location data (EXIF GPS)?', chips: ['Always strip', 'Keep with consent', 'Keep everything'], freeform: 'Something else', answer: null }
          ] },
        { id: 't4', num: 4, title: 'Search', state: 'ready', depends_on: ['t1'],
          summary: 'Postgres full-text search over titles, ingredients and tags; typo tolerance deferred.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Postgres full-text search over titles, ingredients and tags. Typo tolerance is deferred to a later run.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['Searching an ingredient returns matching recipes ranked by relevance on the demo dataset.'] },
            { id: 'ds-open', h: 'Open items', paras: ['None — scope auto-resolved from repo evidence.'] } ] },
          questions: [{ id: 'q-scope', text: 'Search scope at launch?', chips: ['Titles + ingredients', 'Everything', 'Titles only'], freeform: 'Something else', answer: 'Titles + ingredients' }] },
        { id: 't5', num: 5, title: 'Comments & ratings', state: 'not_started', depends_on: ['t1', 't2'],
          summary: 'Five-star ratings, threaded comments, one rating per account per recipe.',
          intro: 'Ratings and comments are already scoped by the evidence — the data model and rate limits are settled. One product call is left: the moderation model at launch.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Five-star ratings and threaded comments; one rating per account per recipe, enforced by the primary key.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['A second rating from the same account updates the first instead of inserting a duplicate.'] },
            { id: 'ds-open', h: 'Open items', paras: ['The moderation model at launch is the one open product call.'] } ] },
          questions: [{ id: 'q-mod', text: 'Comment moderation model?', chips: ['Report + hide', 'Pre-approval', 'Off at launch'], freeform: 'Something else', answer: null }] },
        { id: 't6', num: 6, title: 'Import from URL', state: 'auditing', depends_on: ['t1'],
          summary: 'Paste a recipe URL, worker scrapes structured data; retries + sanitization under audit.',
          progress: 'audit pass 2 of 3 · 4 findings fixed',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Paste a URL and the worker scrapes schema.org Recipe data with bounded retries and sanitization.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['The fixture set imports cleanly; failures surface an error card after the retry budget.'] },
            { id: 'ds-open', h: 'Open items', paras: ['None — audit findings are repaired in place as the audit closes.'] } ] },
          questions: [{ id: 'q-sites', text: 'Which sites must import cleanly?', chips: ['Top 20 recipe sites', 'Any schema.org page', 'Manual paste only'], freeform: 'Something else', answer: 'Any schema.org page' }] },
        { id: 't7', num: 7, title: 'Notifications', state: 'impacted', depends_on: ['t6'],
          summary: 'Email + in-app notifications for comments and follows. Impacted by the import-from-URL audit.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['In-app and email notifications for comments and follows, fanning out from worker events.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['A new comment produces one in-app notice and one email per recipient preference.'] },
            { id: 'ds-open', h: 'Open items', paras: ['Re-sync to the tightened import event contract is verified by the impact review.'] } ] },
          questions: [{ id: 'q-chan', text: 'Notification channels at launch?', chips: ['In-app only', 'In-app + email', 'Email digest weekly'], freeform: 'Something else', answer: 'In-app + email' }] },
        { id: 't8', num: 8, title: 'Deployment & backups', state: 'not_started', depends_on: ['t3', 't6'], unlockedState: 'blocked',
          summary: 'Docker on Unraid; nightly Postgres dumps. Storage location needs a product decision once unlocked.',
          intro: 'Deployment is mapped from repo evidence: Docker on Unraid, nightly Postgres dumps. Storage is a credentials + cost call the wizard will not make for you.',
          draft: { version: 3, sections: [
            { id: 'ds-over', h: 'Overview', paras: ['Docker on Unraid with nightly Postgres dumps. The storage backend for images and backups is a product call.'] },
            { id: 'ds-dec', h: 'Decisions', paras: [] },
            { id: 'ds-accept', h: 'Acceptance', paras: ['A nightly dump lands in the chosen storage target and restores cleanly in a scratch container.'] },
            { id: 'ds-open', h: 'Open items', paras: ['Storage location — this topic carries the decision into the Final Plan Pack.'] } ] },
          questions: [{ id: 'q-storage', text: 'Where should images and backups live?', chips: ['AWS S3', 'Cloudflare R2', 'Local volume'], freeform: 'Something else', answer: null }] }
      ]
    },
    run: {
      id: 'pcr-47',
      planUnits: 23,
      seams: [
        { id: 'seam-content', label: 'Content core', lanes: ['lane-a', 'lane-b'] },
        { id: 'seam-experience', label: 'Experience', lanes: ['lane-c'] },
        { id: 'seam-platform', label: 'Platform', lanes: ['lane-d'] }
      ],
      lanes: [
        { id: 'lane-a', label: 'data-model', worktree: 'orch/lane-a-data-model', nodes: [
          'recipes table + revisions', 'ingredients + units', 'tags + collections', 'accounts + sessions schema',
          'media metadata table', 'ratings schema', 'comments schema', 'notifications schema',
          'search index config', 'backup retention config' ] },
        { id: 'lane-b', label: 'API', worktree: 'orch/lane-b-api', nodes: [
          'axum scaffold + routing', 'recipes CRUD endpoints', 'publish package: image-processing', 'media upload endpoint',
          'auth endpoints + sessions', 'search query endpoint', 'comments API', 'ratings API',
          'import-from-url worker tests', 'notifications service' ] },
        { id: 'lane-c', label: 'frontend', worktree: 'orch/lane-c-frontend', nodes: [
          'route shell + layout', 'recipe card component', 'recipe editor', 'media uploader UI',
          'search UI + results', 'comments UI', 'ratings stars', 'import flow UI',
          'notifications tray', 'theming + polish' ] },
        { id: 'lane-d', label: 'infra', worktree: 'orch/lane-d-infra', nodes: [
          'Dockerfile multi-arch', 'docker-compose stack', 'postgres provisioning', 'redis cache wiring',
          'CI workflow', 'registry cache setup', 'unraid template', 'backup cron + R2 sync',
          'healthchecks + monitoring', 'deploy scripts' ] }
      ],
      gate: { id: 'g-image-processing', node: 'n-13', label: 'publish package: image-processing',
              question: 'Publish the image-processing package to the internal registry? It becomes a dependency for lane-c media work.' },
      failNode: 'n-19',
      history: [
        { id: 'pcr-46', label: 'Run #46 — search + comments', state: 'complete', nodes: 31, when: 'yesterday 16:40' },
        { id: 'pcr-45', label: 'Run #45 — auth hardening', state: 'complete', nodes: 18, when: '2 days ago' },
        { id: 'pcr-44', label: 'Run #44 — initial scaffold', state: 'degraded', nodes: 26, when: '4 days ago' }
      ]
    },
    git: {
      auth: { signedIn: true, account: 'jared-dev', requested: 'jared-dev', effective: 'jared-dev', scopes: ['repo', 'read:user', 'user:email'] },
      staged: ['src/routes/recipes.rs', 'web/src/lib/RecipeCard.svelte'],
      unstaged: ['src/services/image.rs'],
      untracked: [],
      worktrees: [
        { id: 'wt-b', branch: 'orch/lane-b-api', owner: 'Orch: lane-b API', kind: 'orchestrator', state: 'clean', base: 'main', age: '2h', path: '.worktrees/lane-b-api' },
        { id: 'wt-d', branch: 'orch/lane-d-infra', owner: 'Orch: lane-d infra', kind: 'orchestrator', state: 'dirty', base: 'main', age: '2h', path: '.worktrees/lane-d-infra' },
        { id: 'wt-t', branch: 'thread/import-fixes', owner: 'Thread: Import worker debugging', kind: 'thread', state: 'clean', base: 'main', age: '1d', path: '.worktrees/import-fixes' },
        { id: 'wt-m', branch: 'spike/r2-storage', owner: 'Manual', kind: 'manual', state: 'clean', base: 'main', age: '3d', path: '.worktrees/r2-spike' }
      ],
      runs: [
        { id: 'wf-312', name: 'CI — build + test', branch: 'main', status: 'success', when: '2h ago' },
        { id: 'wf-311', name: 'CI — build + test', branch: 'orch/lane-b-api', status: 'success', when: '3h ago' },
        { id: 'wf-310', name: 'CI — build + test', branch: 'thread/import-fixes', status: 'failed', failedStep: 'cargo test', when: '5h ago' }
      ],
      fallbackWorktree: { id: 'wt-46', branch: 'run/46-search-comments', owner: 'Orch: run #46', state: 'checks_passing' }
    },
    docker: {
      containers: [
        { id: 'ct-pg', name: 'tastebook-postgres', image: 'postgres:16-alpine', state: 'running', ports: '5432:5432', health: 'healthy' },
        { id: 'ct-redis', name: 'tastebook-redis', image: 'redis:7-alpine', state: 'running', ports: '6379:6379', health: 'healthy' },
        { id: 'ct-reg', name: 'registry-cache', image: 'registry:2', state: 'running', ports: '5000:5000', health: 'healthy' },
        { id: 'ct-web', name: 'tastebook-web', image: 'jared/tastebook:v1.1', state: 'exited', exitCode: 137, health: 'none' },
        { id: 'ct-worker', name: 'tastebook-worker', image: 'jared/tastebook-worker:v1.1', state: 'restarting', health: 'unhealthy' }
      ],
      composeServices: ['db', 'cache', 'web', 'worker'],
      hubRepo: 'jared/tastebook',
      publishChain: { built: false, digest: null, tag: 'v1.2', template: 'ready_to_push', pushedImage: false, pushedTemplate: false }
    },
    usage: {
      quotas: [
        { id: 'q-claude-5h', label: 'Claude · 5h window', pct: 78, level: 'orange', plan: 'Max' },
        { id: 'q-claude-7d', label: 'Claude · 7d window', pct: 52, level: 'ok', plan: 'Max' },
        { id: 'q-codex-5h', label: 'Codex · 5h window', pct: 34, level: 'ok', plan: 'Plus' },
        { id: 'q-cursor-mo', label: 'Cursor · monthly', pct: 12, level: 'ok', plan: 'Pro' }
      ],
      cooldownSec: 2472, /* 00:41:12 */
      anomalies: [
        { id: 'an-spike', kind: 'token_spike', ratio: 3.4, window: '1h', blocked: true,
          why: 'Output tokens ran 3.4x above the 1h baseline (guard limit 3.0x). The offending request was held before dispatch.',
          allowedExample: 'Allowed: the automatic retry of n-19 tests re-sent the same context — retry traffic is exempt from the spike guard.' }
      ],
      ledgerSeed: 18
    },
    files: [
      { path: 'Cargo.toml', lang: 'toml' },
      { path: 'src/main.rs', lang: 'rust' },
      { path: 'src/routes/recipes.rs', lang: 'rust' },
      { path: 'src/routes/auth.rs', lang: 'rust' },
      { path: 'src/services/image.rs', lang: 'rust' },
      { path: 'src/services/import.rs', lang: 'rust' },
      { path: 'migrations/0001_init.sql', lang: 'sql' },
      { path: 'migrations/0002_ratings.sql', lang: 'sql' },
      { path: 'web/src/routes/+page.svelte', lang: 'svelte' },
      { path: 'web/src/routes/recipe/[id]/+page.svelte', lang: 'svelte' },
      { path: 'web/src/lib/RecipeCard.svelte', lang: 'svelte' },
      { path: 'web/src/lib/Editor.svelte', lang: 'svelte' },
      { path: 'docker-compose.yml', lang: 'yaml' },
      { path: 'Dockerfile', lang: 'docker' },
      { path: 'unraid-template.xml', lang: 'xml' },
      { path: '.github/workflows/ci.yml', lang: 'yaml' },
      { path: 'README.md', lang: 'doc' },
      { path: 'PRD.md', lang: 'doc' }
    ],
    web: {
      /* WebOperation cards (addendum_pm173): canonical input field is operation_input
         (operation_input_preview is display-only). Commands live under cmd.chat.web.*. */
      operations: [
        { id: 'op-web-s1', kind: 'websearch', command: 'cmd.chat.web.search',
          label: 'Searching Web: schema.org Recipe markup coverage 2026',
          operation_input: { query: 'schema.org Recipe markup coverage 2026' },
          operation_input_preview: 'schema.org Recipe markup coverage 2026',
          state: 'completed', invocation_source: 'agent_judgment',
          agent_reason: 'Agent searched web because freshness was required for import coverage claims.',
          provider: 'model-native', effective_adapter: 'model-native', fallback_path: null,
          scope: '*', approval: 'granted', cache: 'miss', cost_note: 'included in plan',
          source_count: 5,
          sources: [
            { title: 'Google Search Central — Recipe structured data', url: 'developers.google.com/search/docs/appearance/structured-data/recipe', source_confidence: 'high', read: true },
            { title: 'schema.org/Recipe', url: 'schema.org/Recipe', source_confidence: 'high', read: true },
            { title: 'Web Almanac 2025 — structured data chapter', url: 'almanac.httparchive.org/en/2025/structured-data', source_confidence: 'medium', read: true },
            { title: 'RecipeKit blog — JSON-LD in the wild', url: 'recipekit.dev/blog/json-ld-wild', source_confidence: 'low', read: false },
            { title: 'MDN — microdata', url: 'developer.mozilla.org/docs/Web/HTML/Microdata', source_confidence: 'unknown', read: false }
          ] },
        { id: 'op-web-r1', kind: 'webresearch', command: 'cmd.chat.web.research',
          label: 'Researching Web: import-from-URL hardening practices',
          operation_input: { task: 'How do production recipe importers survive messy blog markup? Retries, sanitization, mixed-fraction quantity parsing.' },
          operation_input_preview: 'import-from-URL hardening practices',
          state: 'queued', progress: null, invocation_source: 'user_command',
          agent_reason: 'Research run backing the import worker audit findings.',
          provider: 'PM-composed', effective_adapter: 'Site Reader', fallback_path: 'Site Reader → model-native',
          scope: '*', approval: 'granted', cache: 'cold', cost_note: 'included in plan',
          source_total: 6, sources_read: 0,
          citations: [
            { n: 1, title: 'Google Search Central — Recipe structured data', url: 'developers.google.com/search/docs/appearance/structured-data/recipe', source_confidence: 'high' },
            { n: 2, title: 'schema.org/Recipe — recipeIngredient notes', url: 'schema.org/Recipe', source_confidence: 'high' },
            { n: 3, title: 'Serious Eats engineering — parsing "1 1/2 cups"', url: 'seriouseats.com/engineering/quantity-parsing', source_confidence: 'medium' }
          ] }
      ]
    },
    dash: {
      defaults: ['widget-orchestrator-progress', 'widget-active-lanes', 'widget-recent-results', 'widget-custom-metrics'],
      catalog: [
        { kind: 'widget-orchestrator-progress', label: 'Orchestrator progress' },
        { kind: 'widget-active-lanes', label: 'Active lanes' },
        { kind: 'widget-recent-results', label: 'Recent results' },
        { kind: 'widget-custom-metrics', label: 'Custom metrics' },
        { kind: 'widget-quota-summary', label: 'Usage quota summary' },
        { kind: 'widget-approval-queue', label: 'Approval queue' },
        { kind: 'widget-account-pressure', label: 'Account pressure' },
        { kind: 'widget-worktree-state', label: 'Worktree state' }
      ]
    }
  };
  window.PM_DEMO_DATA = DATA;

  /* ================= PM_DEMO_TEXT ================= */
  var TEXT = { files: {}, chat: {}, term: {} };

  TEXT.files['Cargo.toml'] = [
    HC + '# Tastebook API workspace' + HE,
    '[' + HF + 'package' + HE + ']',
    HF + 'name' + HE + ' = ' + HS + '"tastebook-api"' + HE,
    HF + 'version' + HE + ' = ' + HS + '"1.2.0"' + HE,
    HF + 'edition' + HE + ' = ' + HS + '"2021"' + HE,
    '',
    '[' + HF + 'dependencies' + HE + ']',
    HF + 'axum' + HE + ' = ' + HS + '"0.8"' + HE,
    HF + 'tokio' + HE + ' = { version = ' + HS + '"1"' + HE + ', features = [' + HS + '"full"' + HE + '] }',
    HF + 'sqlx' + HE + ' = { version = ' + HS + '"0.8"' + HE + ', features = [' + HS + '"postgres"' + HE + ', ' + HS + '"runtime-tokio"' + HE + '] }',
    HF + 'image' + HE + ' = ' + HS + '"0.25"' + HE + '   ' + HC + '# image-processing package' + HE,
    HF + 'scraper' + HE + ' = ' + HS + '"0.20"' + HE + ' ' + HC + '# import-from-url worker' + HE,
    HF + 'serde' + HE + ' = { version = ' + HS + '"1"' + HE + ', features = [' + HS + '"derive"' + HE + '] }'
  ];
  TEXT.files['src/main.rs'] = [
    HK + 'use' + HE + ' axum::{Router, routing::get};',
    HK + 'use' + HE + ' tastebook_api::{routes, services, db};',
    '',
    '#[tokio::main]',
    HK + 'async fn ' + HE + HF + 'main' + HE + '() {',
    '    ' + HK + 'let' + HE + ' pool = db::' + HF + 'connect' + HE + '().await.' + HF + 'expect' + HE + '(' + HS + '"postgres unreachable"' + HE + ');',
    '    ' + HK + 'let' + HE + ' app = Router::' + HF + 'new' + HE + '()',
    '        .' + HF + 'merge' + HE + '(routes::recipes::' + HF + 'router' + HE + '())',
    '        .' + HF + 'merge' + HE + '(routes::auth::' + HF + 'router' + HE + '())',
    '        .' + HF + 'with_state' + HE + '(pool);',
    '    ' + HC + '// serve on 0.0.0.0:8080 behind compose' + HE,
    '    axum::' + HF + 'serve' + HE + '(listener, app).await.' + HF + 'unwrap' + HE + '();',
    '}'
  ];
  TEXT.files['src/routes/recipes.rs'] = [
    HK + 'use' + HE + ' axum::{extract::State, Json};',
    HK + 'use' + HE + ' crate::models::{Recipe, NewRecipe};',
    '',
    HK + 'pub fn ' + HE + HF + 'router' + HE + '() -&gt; Router&lt;PgPool&gt; {',
    '    Router::' + HF + 'new' + HE + '()',
    '        .' + HF + 'route' + HE + '(' + HS + '"/api/recipes"' + HE + ', get(list).post(create))',
    '        .' + HF + 'route' + HE + '(' + HS + '"/api/recipes/:id"' + HE + ', get(show).put(update))',
    '}',
    '',
    HK + 'async fn ' + HE + HF + 'list' + HE + '(State(pool): State&lt;PgPool&gt;) -&gt; Json&lt;Vec&lt;Recipe&gt;&gt; {',
    '    ' + HC + '// keyset pagination — 24 cards per page' + HE,
    '    ' + HK + 'let' + HE + ' rows = sqlx::' + HF + 'query_as!' + HE + '(Recipe, ' + HS + '"SELECT * FROM recipes ORDER BY updated_at DESC LIMIT 24"' + HE + ')',
    '        .' + HF + 'fetch_all' + HE + '(&amp;pool).await.' + HF + 'unwrap_or_default' + HE + '();',
    '    ' + HF + 'Json' + HE + '(rows)',
    '}'
  ];
  TEXT.files['src/routes/auth.rs'] = [
    HK + 'use' + HE + ' axum::{Router, routing::post};',
    '',
    HK + 'pub fn ' + HE + HF + 'router' + HE + '() -&gt; Router&lt;PgPool&gt; {',
    '    Router::' + HF + 'new' + HE + '()',
    '        .' + HF + 'route' + HE + '(' + HS + '"/api/auth/login"' + HE + ', post(login))',
    '        .' + HF + 'route' + HE + '(' + HS + '"/api/auth/oauth/:provider"' + HE + ', post(oauth_start))',
    '        .' + HF + 'route' + HE + '(' + HS + '"/api/auth/logout"' + HE + ', post(logout))',
    '}',
    '',
    HC + '// session cookies: HttpOnly + SameSite=Lax, 30-day sliding expiry' + HE,
    HK + 'async fn ' + HE + HF + 'login' + HE + '(Json(body): Json&lt;LoginReq&gt;) -&gt; Result&lt;Json&lt;Session&gt;, AuthError&gt; {',
    '    verify_password(&amp;body).await?;',
    '    Ok(Json(Session::issue(body.email)))',
    '}'
  ];
  TEXT.files['src/services/image.rs'] = [
    HC + '// image-processing package — resize ladder + EXIF strip (gate n-13)' + HE,
    HK + 'use' + HE + ' image::{DynamicImage, imageops::FilterType};',
    '',
    HK + 'pub const ' + HE + HN + 'SIZES' + HE + ': [u32; 3] = [320, 800, 1600];',
    '',
    HK + 'pub fn ' + HE + HF + 'process_upload' + HE + '(raw: &amp;[u8]) -&gt; Result&lt;Vec&lt;Rendition&gt;, ImgError&gt; {',
    '    ' + HK + 'let' + HE + ' img = image::' + HF + 'load_from_memory' + HE + '(raw)?;',
    '    ' + HK + 'let' + HE + ' img = ' + HF + 'strip_exif' + HE + '(img);',
    '    Ok(' + HN + 'SIZES' + HE + '.iter().map(|w| ' + HF + 'rendition' + HE + '(&amp;img, *w)).collect())',
    '}',
    '',
    HK + 'fn ' + HE + HF + 'rendition' + HE + '(img: &amp;DynamicImage, w: u32) -&gt; Rendition {',
    '    ' + HC + '// Lanczos3 keeps herbs looking like herbs, not soup' + HE,
    '    Rendition::from(img.' + HF + 'resize' + HE + '(w, w * 2, FilterType::Lanczos3))',
    '}'
  ];
  TEXT.files['src/services/import.rs'] = [
    HC + '// import-from-url worker — schema.org Recipe extraction (n-19 test target)' + HE,
    HK + 'use' + HE + ' scraper::{Html, Selector};',
    '',
    HK + 'pub async fn ' + HE + HF + 'import_url' + HE + '(url: &amp;str) -&gt; Result&lt;DraftRecipe, ImportError&gt; {',
    '    ' + HK + 'let' + HE + ' body = ' + HF + 'fetch_with_retries' + HE + '(url, 3).await?;',
    '    ' + HK + 'let' + HE + ' doc = Html::' + HF + 'parse_document' + HE + '(&amp;body);',
    '    ' + HK + 'let' + HE + ' ld = ' + HF + 'json_ld_recipe' + HE + '(&amp;doc).ok_or(ImportError::NoRecipe)?;',
    '    ' + HC + '// sanitize: strip scripts, clamp step count, normalize units' + HE,
    '    Ok(DraftRecipe::' + HF + 'from_json_ld' + HE + '(' + HF + 'sanitize' + HE + '(ld))?)',
    '}',
    '',
    HC + '// KNOWN FLAKE (run #47, n-19): fraction units like "1 1/2 cup" parsed as 11/2' + HE,
    HK + 'fn ' + HE + HF + 'normalize_units' + HE + '(s: &amp;str) -&gt; Quantity { ' + HF + 'parse_mixed_fraction' + HE + '(s) }'
  ];
  TEXT.files['migrations/0001_init.sql'] = [
    HC + '-- 0001_init: core content tables' + HE,
    HK + 'CREATE TABLE' + HE + ' recipes (',
    '  id          ' + HN + 'BIGSERIAL' + HE + ' ' + HK + 'PRIMARY KEY' + HE + ',',
    '  title       ' + HN + 'TEXT' + HE + ' ' + HK + 'NOT NULL' + HE + ',',
    '  author_id   ' + HN + 'BIGINT' + HE + ' ' + HK + 'REFERENCES' + HE + ' accounts(id),',
    '  body        ' + HN + 'JSONB' + HE + ' ' + HK + 'NOT NULL' + HE + ',',
    '  updated_at  ' + HN + 'TIMESTAMPTZ' + HE + ' ' + HK + 'DEFAULT' + HE + ' now()',
    ');',
    HK + 'CREATE INDEX' + HE + ' recipes_fts ' + HK + 'ON' + HE + ' recipes ' + HK + 'USING' + HE + ' GIN (to_tsvector(' + HS + "'english'" + HE + ', title));'
  ];
  TEXT.files['migrations/0002_ratings.sql'] = [
    HC + '-- 0002_ratings: one rating per account per recipe' + HE,
    HK + 'CREATE TABLE' + HE + ' ratings (',
    '  recipe_id  ' + HN + 'BIGINT' + HE + ' ' + HK + 'REFERENCES' + HE + ' recipes(id) ' + HK + 'ON DELETE CASCADE' + HE + ',',
    '  account_id ' + HN + 'BIGINT' + HE + ' ' + HK + 'REFERENCES' + HE + ' accounts(id),',
    '  stars      ' + HN + 'SMALLINT' + HE + ' ' + HK + 'CHECK' + HE + ' (stars ' + HK + 'BETWEEN' + HE + ' 1 ' + HK + 'AND' + HE + ' 5),',
    '  ' + HK + 'PRIMARY KEY' + HE + ' (recipe_id, account_id)',
    ');'
  ];
  TEXT.files['web/src/routes/+page.svelte'] = [
    '&lt;' + HF + 'script' + HE + '&gt;',
    '  ' + HK + 'import' + HE + ' RecipeCard ' + HK + 'from' + HE + ' ' + HS + "'$lib/RecipeCard.svelte'" + HE + ';',
    '  ' + HK + 'export let' + HE + ' data; ' + HC + '// +page.server.js load()' + HE,
    '&lt;/' + HF + 'script' + HE + '&gt;',
    '',
    '&lt;' + HF + 'h1' + HE + '&gt;Fresh this week&lt;/' + HF + 'h1' + HE + '&gt;',
    '&lt;' + HF + 'div' + HE + ' class=' + HS + '"grid"' + HE + '&gt;',
    '  {#each data.recipes as r (r.id)}',
    '    &lt;' + HF + 'RecipeCard' + HE + ' recipe={r} /&gt;',
    '  {/each}',
    '&lt;/' + HF + 'div' + HE + '&gt;'
  ];
  TEXT.files['web/src/routes/recipe/[id]/+page.svelte'] = [
    '&lt;' + HF + 'script' + HE + '&gt;',
    '  ' + HK + 'export let' + HE + ' data;',
    '  $: recipe = data.recipe;',
    '&lt;/' + HF + 'script' + HE + '&gt;',
    '',
    '&lt;' + HF + 'article' + HE + '&gt;',
    '  &lt;' + HF + 'img' + HE + ' srcset={recipe.renditions} alt={recipe.title} /&gt;',
    '  &lt;' + HF + 'h1' + HE + '&gt;{recipe.title}&lt;/' + HF + 'h1' + HE + '&gt;',
    '  &lt;' + HF + 'Ratings' + HE + ' stars={recipe.stars} /&gt;',
    '  &lt;' + HF + 'Steps' + HE + ' steps={recipe.body.steps} /&gt;',
    '&lt;/' + HF + 'article' + HE + '&gt;'
  ];
  TEXT.files['web/src/lib/RecipeCard.svelte'] = [
    '&lt;' + HF + 'script' + HE + '&gt;',
    '  ' + HK + 'export let' + HE + ' recipe;',
    '&lt;/' + HF + 'script' + HE + '&gt;',
    '',
    '&lt;' + HF + 'a' + HE + ' class=' + HS + '"card"' + HE + ' href=' + HS + '"/recipe/{recipe.id}"' + HE + '&gt;',
    '  &lt;' + HF + 'img' + HE + ' src={recipe.thumb} alt=' + HS + '""' + HE + ' loading=' + HS + '"lazy"' + HE + ' /&gt;',
    '  &lt;' + HF + 'h3' + HE + '&gt;{recipe.title}&lt;/' + HF + 'h3' + HE + '&gt;',
    '  &lt;' + HF + 'span' + HE + '&gt;{recipe.stars}/5 · {recipe.cookMinutes} min&lt;/' + HF + 'span' + HE + '&gt;',
    '&lt;/' + HF + 'a' + HE + '&gt;'
  ];
  TEXT.files['web/src/lib/Editor.svelte'] = [
    HC + '&lt;!-- step-by-step editor: drag photos onto a step to attach --&gt;' + HE,
    '&lt;' + HF + 'script' + HE + '&gt;',
    '  ' + HK + 'import' + HE + ' { upload } ' + HK + 'from' + HE + ' ' + HS + "'$lib/upload'" + HE + ';',
    '  ' + HK + 'let' + HE + ' steps = [{ text: ' + HS + "''" + HE + ', photo: ' + HK + 'null' + HE + ' }];',
    '  ' + HK + 'async function' + HE + ' ' + HF + 'onDrop' + HE + '(step, file) {',
    '    step.photo = ' + HK + 'await' + HE + ' ' + HF + 'upload' + HE + '(file); ' + HC + '// hits /api/media, renditions async' + HE,
    '  }',
    '&lt;/' + HF + 'script' + HE + '&gt;'
  ];
  TEXT.files['docker-compose.yml'] = [
    HF + 'services' + HE + ':',
    '  ' + HF + 'db' + HE + ':',
    '    image: ' + HS + 'postgres:16-alpine' + HE,
    '    volumes: [' + HS + 'pgdata:/var/lib/postgresql/data' + HE + ']',
    '  ' + HF + 'cache' + HE + ':',
    '    image: ' + HS + 'redis:7-alpine' + HE,
    '  ' + HF + 'web' + HE + ':',
    '    image: ' + HS + 'jared/tastebook:v1.2' + HE,
    '    ports: [' + HS + '"5173:5173"' + HE + ', ' + HS + '"8080:8080"' + HE + ']',
    '    depends_on: [' + HF + 'db' + HE + ', ' + HF + 'cache' + HE + ']',
    '  ' + HF + 'worker' + HE + ':',
    '    image: ' + HS + 'jared/tastebook-worker:v1.2' + HE,
    '    command: ' + HS + 'import-worker --poll 5s' + HE
  ];
  TEXT.files['Dockerfile'] = [
    HK + 'FROM' + HE + ' rust:1.83-alpine ' + HK + 'AS' + HE + ' build',
    HK + 'WORKDIR' + HE + ' /app',
    HK + 'COPY' + HE + ' . .',
    HK + 'RUN' + HE + ' cargo build --release --locked',
    '',
    HK + 'FROM' + HE + ' alpine:3.20',
    HC + '# multi-arch: linux/amd64 + linux/arm64 via buildx' + HE,
    HK + 'COPY' + HE + ' --from=build /app/target/release/tastebook-api /usr/local/bin/',
    HK + 'EXPOSE' + HE + ' 8080',
    HK + 'CMD' + HE + ' [' + HS + '"tastebook-api"' + HE + ']'
  ];
  TEXT.files['unraid-template.xml'] = [
    '&lt;?' + HF + 'xml' + HE + ' version=' + HS + '"1.0"' + HE + '?&gt;',
    '&lt;' + HF + 'Container' + HE + ' version=' + HS + '"2"' + HE + '&gt;',
    '  &lt;' + HF + 'Name' + HE + '&gt;Tastebook&lt;/' + HF + 'Name' + HE + '&gt;',
    '  &lt;' + HF + 'Repository' + HE + '&gt;jared/tastebook:v1.2&lt;/' + HF + 'Repository' + HE + '&gt;',
    '  &lt;' + HF + 'WebUI' + HE + '&gt;http://[IP]:[PORT:8080]&lt;/' + HF + 'WebUI' + HE + '&gt;',
    '  &lt;' + HF + 'Config' + HE + ' Name=' + HS + '"Media path"' + HE + ' Target=' + HS + '"/data/media"' + HE + ' Mode=' + HS + '"rw"' + HE + '/&gt;',
    '  &lt;' + HF + 'Config' + HE + ' Name=' + HS + '"Backups"' + HE + ' Target=' + HS + '"/data/backups"' + HE + ' Mode=' + HS + '"rw"' + HE + '/&gt;',
    '&lt;/' + HF + 'Container' + HE + '&gt;'
  ];
  TEXT.files['.github/workflows/ci.yml'] = [
    HF + 'name' + HE + ': ' + HS + 'CI — build + test' + HE,
    HF + 'on' + HE + ': [' + HS + 'push' + HE + ', ' + HS + 'pull_request' + HE + ']',
    HF + 'jobs' + HE + ':',
    '  ' + HF + 'test' + HE + ':',
    '    runs-on: ' + HS + 'ubuntu-latest' + HE,
    '    steps:',
    '      - uses: ' + HS + 'actions/checkout@v4' + HE,
    '      - run: ' + HS + 'cargo test --workspace' + HE,
    '      - run: ' + HS + 'pnpm install &amp;&amp; pnpm test' + HE
  ];
  TEXT.files['README.md'] = [
    '<b>Tastebook</b> — recipe sharing for people who actually cook.',
    '',
    'SvelteKit front end, Rust/Axum API, Postgres 16, Docker for everything.',
    '',
    '<b>Quick start</b>',
    dim('docker compose up  →  web on :5173, API on :8080'),
    '',
    '<b>Layout</b>: <code>src/</code> API · <code>web/</code> SvelteKit · <code>migrations/</code> sqlx · <code>unraid-template.xml</code> publish target.',
    '',
    'Run #47 (this build) adds the image-processing package and hardens import-from-URL.'
  ];
  TEXT.files['PRD.md'] = [
    '<b>PRD — Tastebook v1.2</b>',
    '',
    '<b>Goal</b>: photos that look great without users thinking about sizes, and imports that survive messy recipe blogs.',
    '',
    '<b>In scope</b>: image-processing package (resize ladder, EXIF strip), import worker retries + sanitization, R2 storage decision, notification fan-out.',
    '',
    '<b>Out of scope</b>: meal planning, mobile apps, federation.',
    '',
    '<b>Acceptance</b>: 23 PlanUnits across 4 lanes; seam boundaries hold; auditor review loop closes with zero open findings.'
  ];

  /* chat reply scripts per intent */
  TEXT.chat = {
    plan: 'Here is how I would stage it. First the data model lane locks the media metadata table, then the API lane can publish the image-processing package — that is the gate you will see at n-13. [[card:operation:op-plan]] Frontend picks up renditions once the package lands, and infra closes with the R2 sync. Want me to open the Planning Wizard with this scoped as a feature?',
    debug: 'Let me reproduce that import failure first. [[card:operation:op-debug]] Running the worker tests against the fixture set now. [[card:subagent:Test Sleuth]] Found it — mixed fractions like "1 1/2 cup" parse as 11/2 in normalize_units, so quantities explode by 7x. Patching the parser and adding a regression fixture. [[files:src/services/import.rs,migrations/0001_init.sql]] Tests pass locally; n-19 should go green on the next retry.',
    explain: 'Short version: a seam is a stable boundary between packages — lane-b can publish the image-processing package behind the seam without frontend caring how resizing works. Longer version: each lane works in its own worktree, promotes work lane_to_package, then package_to_seam_available once the auditor review loop signs off. The run completes when every seam reports seam_complete. Nothing merges to main until you approve the PR.',
    deploy: 'Deployment goes through the Docker Manager publish chain: Build (buildx, multi-arch) → digest → push to Docker Hub as jared/tastebook:v1.2 → refresh the Unraid template → one-click template push. The compose stack maps web to 5173 and the API to 8080. Backups sync nightly to Cloudflare R2 per the wizard decision. Say "deploy" after the PR merges and I will walk the chain with you.',
    fallback: 'I can help with that. For this demo build I am scoped to the Tastebook story — planning, the pcr-47 run, debugging the import worker, GitHub, Docker publishing and usage questions all work end-to-end. Try "status", "explain seams", or "debug the import failure", or open the Planning Wizard to add a feature.',
    gateApproved: 'Approved — releasing the gate. The image-processing package is publishing to the internal registry now; lane-c media work unblocks as soon as the receipt lands. I will keep this thread updated if anything else needs a decision.',
    gateNotice: 'Run #47 is holding at node n-13: <b>publish package: image-processing</b>. Publishing makes it a dependency for lane-c media work. Reply <b>approve and continue</b> (or use the buttons here, on the Dashboard, or in Orchestrator → Progress) to release it. Declining parks the node at its safe point.'
  };

  /* terminal / build streams */
  TEXT.term = {
    cargoBuild: [
      dim('$ cargo build --workspace'),
      '   ' + ok('Compiling') + ' tastebook-model v1.2.0',
      '   ' + ok('Compiling') + ' tastebook-api v1.2.0',
      '   ' + ok('Compiling') + ' image-processing v0.9.4',
      '   ' + ok('Compiling') + ' import-worker v0.7.1',
      '    ' + ok('Finished') + ' dev [unoptimized + debuginfo] target(s) in 42.3s'
    ],
    cargoTestFail: [
      dim('$ cargo test -p import-worker'),
      'running 14 tests',
      'test import::json_ld_extract ... ' + ok('ok'),
      'test import::retry_backoff ... ' + ok('ok'),
      'test import::normalize_units_simple ... ' + ok('ok'),
      'test import::normalize_units_mixed_fraction ... ' + err('FAILED'),
      'test import::sanitize_strips_scripts ... ' + ok('ok'),
      '',
      err('failures:') + ' import::normalize_units_mixed_fraction',
      dim("  assertion failed: `parse_mixed_fraction(\"1 1/2 cup\")` — left: Quantity(11, Half), right: Quantity(1.5, Cup)"),
      err('test result: FAILED') + '. 13 passed; 1 failed'
    ],
    cargoTestPass: [
      dim('$ cargo test -p import-worker  ' + '(safe-point retry)'),
      'running 15 tests',
      'test import::normalize_units_mixed_fraction ... ' + ok('ok'),
      'test import::normalize_units_regression_47 ... ' + ok('ok'),
      ok('test result: ok') + '. 15 passed; 0 failed'
    ],
    composeUp: [
      dim('$ docker compose up -d'),
      ' ' + ok('✓') + ' Container tastebook-db      ' + ok('Healthy'),
      ' ' + ok('✓') + ' Container tastebook-cache   ' + ok('Started'),
      ' ' + ok('✓') + ' Container tastebook-web     ' + ok('Started'),
      ' ' + ok('✓') + ' Container tastebook-worker  ' + ok('Started')
    ],
    buildkit: [
      dim('$ docker buildx build --platform linux/amd64,linux/arm64 -t jared/tastebook:v1.2 .'),
      ' => [internal] load build definition from Dockerfile',
      ' => [build 1/4] FROM rust:1.83-alpine',
      ' => [build 2/4] WORKDIR /app',
      ' => [build 3/4] COPY . .',
      ' => [build 4/4] RUN cargo build --release --locked',
      ' => [stage-1 2/3] COPY --from=build /app/target/release/tastebook-api',
      ' => exporting to image',
      ' => => exporting manifest list ' + ok('sha256:9c1f4e2ab7d05561f0'),
      ok('✓') + ' build complete — 2 platforms, 41.2 MB'
    ],
    dockerLogs: [
      dim('tastebook-worker | poll: 2 URLs queued'),
      dim('tastebook-worker | import ok: seriouseats.com — 1.8s'),
      warn('tastebook-worker | retry 2/3: bonappetit.com (429, backing off 4s)'),
      dim('tastebook-web    | GET /api/recipes 200 12ms')
    ],
    viteAmbient: [
      dim('vite | hmr update /src/lib/RecipeCard.svelte'),
      dim('vite | page reload web/src/routes/+page.svelte'),
      dim('vite | 214 modules transformed in 480ms')
    ],
    compileStream: [
      dim('plan-compile | reading ApprovedPlanPack rev 12'),
      'plan-compile | 8 topics → ' + ok('23 PlanUnits'),
      'plan-compile | seam graph: 3 seams, 4 lanes, 40 nodes',
      'plan-compile | acceptance index ' + ok('8f3a91') + ' verified',
      ok('plan-compile | bound PlanCompileRun pcr-47')
    ]
  };
  window.PM_DEMO_TEXT = TEXT;

  /* ================= bus ================= */
  var listeners = {};
  function on(topic, fn) {
    if (!topic || typeof fn !== 'function') return PM_DEMO;
    (listeners[topic] = listeners[topic] || []).push(fn);
    return PM_DEMO;
  }
  function emit(topic, payload) {
    var subs = (listeners[topic] || []).concat(listeners['*'] || []);
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](payload, topic); }
      catch (e) { try { console.error('[PM_DEMO bus]', topic, e); } catch (e0) {} }
    }
  }

  /* ================= state store ================= */
  function buildNodes() {
    var nodes = {}, n = 0;
    DATA.run.lanes.forEach(function (lane) {
      lane.nodeIds = [];
      lane.nodes.forEach(function (label) {
        n++;
        var id = 'n-' + (n < 10 ? '0' + n : n);
        lane.nodeIds.push(id);
        nodes[id] = { id: id, lane: lane.id, label: label, state: 'queued', attempts: 0, promotion: null, degraded: false };
      });
    });
    return nodes;
  }

  function pristineReqs() {
    return {
      docs: [], turns: [], answers: {}, turnIdx: 0, filled: {},
      readiness: 'blocked',
      readinessNote: 'no captures yet — attach a doc or answer the builder',
      revisions: 0, annotations: [], ledgerNotes: [],
      prd: { approved: false, packId: null, version: null }
    };
  }

  var S = {
    clock: { t: 0, playing: true, speed: 1, _resumeOnVisible: false },
    story: { c1_wizard_done: false, c2_compiled: false, c3_run_complete: false, c4_pr_merged: false, c5_published: false },
    wizard: {
      revision: DATA.wizard.hashes.planningRunRev,
      stage: 'interview',
      topics: {},
      pack: null,
      approved: false,
      hashes: DATA.wizard.hashes,
      imported: true,
      activeTopic: null,
      reqs: pristineReqs(),
      _ambient: false
    },
    run: {
      id: null, stage: 'idle', planUnits: 0,
      lanes: DATA.run.lanes.map(function (l) { return { id: l.id, label: l.label, worktree: l.worktree, state: 'idle', done: 0, total: l.nodes.length }; }),
      nodes: buildNodes(),
      gates: {},
      freshness: 'current',
      promotions: [],
      history: DATA.run.history.slice(),
      focusedRunId: null, focusMode: 'live',
      accountSwitches: []
    },
    chat: {
      threads: {}, order: [], activeThread: 'th-main',
      queue: [], busy: false, activeStream: null,
      context: { used: 42000, max: 128000 }
    },
    git: {
      auth: JSON.parse(JSON.stringify(DATA.git.auth)),
      staged: DATA.git.staged.slice(), unstaged: DATA.git.unstaged.slice(), untracked: DATA.git.untracked.slice(),
      commits: [], worktrees: DATA.git.worktrees.slice(), runs: JSON.parse(JSON.stringify(DATA.git.runs)),
      pr: null, aiCommitBusy: false, device: null
    },
    docker: {
      containers: JSON.parse(JSON.stringify(DATA.docker.containers)),
      compose: { up: false, services: {} },
      publishChain: JSON.parse(JSON.stringify(DATA.docker.publishChain)),
      templateRepo: 'github.com/jared/unraid-templates'
    },
    usage: {
      quotas: JSON.parse(JSON.stringify(DATA.usage.quotas)),
      cooldownSec: DATA.usage.cooldownSec,
      ledger: [],
      anomalies: JSON.parse(JSON.stringify(DATA.usage.anomalies)),
      alert80Fired: false,
      widgets: {}
    },
    files: { openTabs: [], activeTab: null },
    web: { ops: JSON.parse(JSON.stringify(DATA.web.operations)), artifacts: [] },
    dash: { widgets: DATA.dash.defaults.slice(), ctas: [] },
    ffwd: false
  };
  /* single source for the topic-state seed — used at boot and by wizardFacade.replay */
  function seedWizardTopics() {
    S.wizard.topics = {};
    DATA.wizard.topics.forEach(function (t) {
      S.wizard.topics[t.id] = { id: t.id, num: t.num, title: t.title, state: t.state,
        progress: t.progress || null, summary: t.summary, intro: t.intro || null,
        thread: [], questions: JSON.parse(JSON.stringify(t.questions)),
        accepted: t.state === 'ready',
        depends_on: (t.depends_on || []).slice(),
        unlockedState: t.unlockedState || null,
        draft: t.draft ? { version: t.draft.version, freshSec: null, sections: t.draft.sections } : null,
        annotations: [],
        _wasLocked: false };
    });
    /* second pass: derive initial lock flags once every dependency is seeded */
    Object.keys(S.wizard.topics).forEach(function (k) {
      var t = S.wizard.topics[k];
      t._wasLocked = t.state === 'not_started' && (t.depends_on || []).some(function (id) {
        var dep = S.wizard.topics[id];
        return dep && dep.state !== 'ready';
      });
    });
  }
  seedWizardTopics();

  var LOG = [];
  function logBeat(action, args) {
    LOG.push({ t: Math.round(S.clock.t) / 1000, action: action, args: args || null });
    if (LOG.length > 400) LOG.splice(0, LOG.length - 400);
    emit('demo.log', LOG[LOG.length - 1]);
  }

  /* seed the usage ledger */
  (function seedLedger() {
    var models = [['Claude', 'Sonnet 4.6'], ['Claude', 'Opus 4.6'], ['Codex', 'GPT-5.2'], ['Cursor', 'composer-2']];
    var events = ['worker_turn', 'auditor_review', 'plan_compile', 'chat_turn', 'subagent_turn'];
    var lanes = ['lane-a', 'lane-b', 'lane-c', 'lane-d', '—'];
    for (var i = 0; i < DATA.usage.ledgerSeed; i++) {
      var m = models[i % models.length];
      var cacheState = i % 7 === 3 ? 'estimated' : (i % 7 === 5 ? 'unsupported' : 'measured');
      S.usage.ledger.push({
        id: 'led-' + (100 + i), ts: '10:' + pad2(4 + i * 3), event: events[i % events.length], lane: lanes[i % lanes.length],
        platform: m[0], model: m[1],
        tokensIn: 800 + (i * 137) % 3200, tokensOut: 300 + (i * 91) % 1500,
        cachedInput: cacheState === 'measured' ? 400 + (i * 53) % 900 : null,
        cacheWrite: cacheState === 'measured' ? (i * 29) % 300 : null,
        cacheRead: cacheState === 'measured' ? (i * 71) % 700 : null,
        cacheState: cacheState,
        cost: (0.004 + (i % 9) * 0.003).toFixed(3)
      });
    }
  })();

  /* ================= stream ================= */
  function parseSegments(input) {
    var s = Array.isArray(input) ? input.join('\n') : String(input == null ? '' : input);
    var re = /\[\[(card:(?:subagent|operation):[^\]]+|files:[^\]]+)\]\]/g;
    var segs = [], last = 0, m;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) segs.push({ type: 'text', text: s.slice(last, m.index) });
      var raw = m[1];
      if (raw.indexOf('files:') === 0) {
        segs.push({ type: 'card', card: { type: 'files', files: raw.slice(6).split(',') } });
      } else {
        var bits = raw.split(':'); /* card : kind : name… */
        segs.push({ type: 'card', card: { type: bits[1], name: bits.slice(2).join(':') } });
      }
      last = re.lastIndex;
    }
    if (last < s.length) segs.push({ type: 'text', text: s.slice(last) });
    return segs;
  }
  function reducedMotion() {
    try {
      if (S.ffwd) return true;
      if (document.documentElement.getAttribute('data-motion') === 'reduced') return true;
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }
  function genericCardHtml(card) {
    var label = card.type === 'files' ? ('Files touched: ' + card.files.join(', ')) :
      (card.type === 'subagent' ? 'Subagent · ' + card.name : 'Operation · ' + card.name);
    return '<div class="pm6-demo-card" style="margin:var(--xs) 0;padding:var(--xs) var(--sm);border:1px solid var(--border-light);border-radius:6px;background:var(--surface-elevated);font-size:11px;color:var(--text-secondary);">' + label + '</div>';
  }
  function streamStart(sink, textOrChunks, opts) {
    opts = opts || {};
    var segs = parseSegments(textOrChunks);
    var isEl = sink && sink.nodeType === 1;
    var isFn = typeof sink === 'function';
    var buffer = '', cancelled = false, done = false, timer = null;
    var si = 0, words = null, wi = 0;

    function paint(html) {
      buffer += html;
      if (isEl) { try { sink.innerHTML = buffer; } catch (e) {} }
      else if (isFn) { try { sink(html, { buffer: buffer }); } catch (e) {} }
    }
    function handleCard(card) {
      if (opts.onCard) { try { opts.onCard(card); } catch (e) {} }
      if (isEl) paint(genericCardHtml(card));
    }
    function finishAll(how) {
      if (done) return;
      done = true;
      if (timer) { clearTimeout(timer); timer = null; }
      if (how !== 'stopped') {
        /* flush the rest instantly */
        if (words && wi < words.length) paint(words.slice(wi).join(''));
        for (var i2 = si + (words ? 1 : 0); i2 < segs.length; i2++) {
          if (segs[i2].type === 'text') paint(segs[i2].text);
          else handleCard(segs[i2].card);
        }
      } else if (isEl) {
        paint(' <span style="color:var(--text-muted);font-style:italic;">— stopped</span>');
      }
      if (opts.onDone) { try { opts.onDone(how === 'stopped' ? 'stopped' : 'finished'); } catch (e) {} }
    }
    function step() {
      if (done || cancelled) return;
      if (si >= segs.length) { finishAll('finished'); return; }
      var seg = segs[si];
      if (seg.type === 'card') { handleCard(seg.card); si++; words = null; schedule(120); return; }
      if (!words) {
        /* split keeping whitespace attached */
        words = seg.text.match(/\S+\s*|\s+/g) || [];
        wi = 0;
      }
      if (wi >= words.length) { si++; words = null; step(); return; }
      var take = 2 + Math.floor(Math.random() * 5); /* 2–6 words */
      paint(words.slice(wi, wi + take).join(''));
      wi += take;
      schedule(30 + Math.random() * 60);
    }
    function schedule(ms) {
      var speed = (S.clock.speed || 1);
      timer = setTimeout(step, Math.max(8, ms / speed));
    }
    if (reducedMotion()) { setTimeout(function () { finishAll('finished'); }, 0); }
    else schedule(20);
    return {
      cancel: function () { cancelled = true; finishAll('stopped'); },
      finish: function () { finishAll('finished'); }
    };
  }

  /* ================= guard ================= */
  var REASONS = {
    unsupported: 'Not supported in this build.',
    not_configured: 'Not configured yet — open Settings to connect it first.',
    not_signed_in: 'You are signed out — sign in from the panel header first.',
    busy: 'Another operation is still running — let it finish first.',
    blocked_by_gate: 'Blocked by an open approval gate — resolve it in Orchestrator, on the Dashboard, or by replying "approve and continue" in Chat.',
    already_done: 'Already done — nothing new to apply.',
    stale: 'This projection is stale — refresh it before mutating anything.',
    rate_limited: 'Rate limit pressure — wait out the cooldown on the Usage page or switch the effective account.',
    demo_scope: 'Outside the Tastebook demo script — everything in the main story is clickable though.'
  };
  var registry = {};
  var actions = {
    register: function (id, fn) { if (id && typeof fn === 'function') registry[id] = fn; },
    get: function (id) { return registry[id]; }
  };
  var guard = {
    reasons: REASONS,
    reason: function (code) { return REASONS[code] || REASONS.demo_scope; },
    attempt: function (actionId, ctx) {
      var fn = registry[actionId];
      if (!fn) return { toast: 'That control is not wired into the demo script yet — try the highlighted story actions.' };
      try {
        var r = fn(ctx || {});
        return r || { ok: true };
      } catch (e) {
        try { console.error('[PM_DEMO action]', actionId, e); } catch (e0) {}
        return { toast: 'That action hiccuped — try it again.' };
      }
    }
  };

  /* ================= director ================= */
  var tracks = {};
  function trackStart(id, beats) {
    tracks[id] = { id: id, beats: beats.slice(), i: 0, elapsed: 0, holding: null, done: false };
  }
  function trackKill(id) { delete tracks[id]; }
  function applyBeat(trackId, beat, silent) {
    logBeat(beat.action, beat.args);
    var fn = M[beat.action];
    if (fn) { try { fn(beat.args || {}, !!silent); } catch (e) { try { console.error('[PM_DEMO beat]', beat.action, e); } catch (e0) {} } }
  }
  function trackTick(dtMs) {
    Object.keys(tracks).forEach(function (id) {
      var tr = tracks[id];
      if (!tr || tr.done || tr.holding) return;
      tr.elapsed += dtMs / 1000;
      while (tr.i < tr.beats.length && tr.beats[tr.i].at <= tr.elapsed) {
        var b = tr.beats[tr.i];
        tr.i++;
        applyBeat(id, b, false);
        if (b.hold) { tr.holding = b.id || b.action; break; }
      }
      if (tr.i >= tr.beats.length && !tr.holding) {
        tr.done = true;
        if (tr.id === 'ambient') { trackStart('ambient', AMBIENT_BEATS); }
      }
    });
  }
  function trackRelease(trackId, holdId) {
    var tr = tracks[trackId];
    if (!tr || !tr.holding) return false;
    if (holdId && tr.holding !== holdId) return false;
    tr.holding = null;
    return true;
  }
  var CHAPTERS = ['c1_wizard_done', 'c2_compiled', 'c3_run_complete', 'c4_pr_merged', 'c5_published'];
  var BACKFILL = {}; /* filled after mutators are defined */
  var director = {
    markers: CHAPTERS.slice(),
    start: trackStart,
    kill: trackKill,
    release: trackRelease,
    ensure: function (marker) {
      if (CHAPTERS.indexOf(marker) === -1) return;
      S.ffwd = true;
      try {
        for (var i = 0; i < CHAPTERS.length; i++) {
          var m = CHAPTERS[i];
          if (!S.story[m] && BACKFILL[m]) { BACKFILL[m](); S.story[m] = true; }
          if (m === marker) break;
        }
      } catch (e) { try { console.error('[PM_DEMO ensure]', e); } catch (e0) {} }
      S.ffwd = false;
      emit('demo.jump', { marker: marker });
      emit('run.state', runSnapshot());
      emit('wizard.state', wizardSnapshot());
      emit('wizard.reqs', { reqs: S.wizard.reqs });
      emit('git.changed', {}); emit('docker.chain', S.docker.publishChain); emit('usage.tick', usageSnapshot());
    }
  };

  function runSnapshot() {
    /* coordination contract: run.state payloads expose p.state (projects/dashboard read it) */
    return { id: S.run.id, state: S.run.stage, stage: S.run.stage, planUnits: S.run.planUnits, freshness: S.run.freshness, lanes: S.run.lanes, gates: S.run.gates, history: S.run.history };
  }
  function wizardSnapshot() {
    return { stage: S.wizard.stage, topics: S.wizard.topics, pack: S.wizard.pack, approved: S.wizard.approved, hashes: S.wizard.hashes, reqs: S.wizard.reqs };
  }
  function usageSnapshot() {
    return { quotas: S.usage.quotas, cooldown: fmtClock(S.usage.cooldownSec), cooldownSec: S.usage.cooldownSec, ledger: S.usage.ledger, anomalies: S.usage.anomalies };
  }

  /* ================= term adapter ================= */
  var term = {
    feed: function (sessionId, lineHtml) {
      try { if (window.PM_TERMINAL_DEMO && PM_TERMINAL_DEMO.appendToSession) PM_TERMINAL_DEMO.appendToSession(sessionId, lineHtml); } catch (e) {}
      emit('term.feed', { sessionId: sessionId, html: lineHtml });
    },
    problems: function (rows) {
      try { if (window.PM_TERMINAL_DEMO && PM_TERMINAL_DEMO.setProblems) PM_TERMINAL_DEMO.setProblems(rows); } catch (e) {}
      emit('term.feed', { problems: rows });
    },
    ports: function (rows) {
      try { if (window.PM_TERMINAL_DEMO && PM_TERMINAL_DEMO.setPorts) PM_TERMINAL_DEMO.setPorts(rows); } catch (e) {}
      emit('term.feed', { ports: rows });
    },
    streamTo: function (sessionId, lines, stepMs) {
      if (S.ffwd || reducedMotion()) { (lines || []).forEach(function (l) { term.feed(sessionId, l); }); return; }
      var i = 0;
      (function next() {
        if (i >= lines.length) return;
        term.feed(sessionId, lines[i++]);
        setTimeout(next, (stepMs || 260) / (S.clock.speed || 1));
      })();
    }
  };

  /* ================= mutators (string-keyed beat actions) ================= */
  function setNode(id, state, extra) {
    var n = S.run.nodes[id];
    if (!n || n.state === state) return;
    n.state = state;
    if (extra) Object.keys(extra).forEach(function (k) { n[k] = extra[k]; });
    var lane = laneOf(id);
    if (lane) lane.done = laneDone(lane.id);
    emit('run.node', { node: n, lane: n.lane });
  }
  function laneOf(nodeId) {
    var n = S.run.nodes[nodeId];
    if (!n) return null;
    for (var i = 0; i < S.run.lanes.length; i++) if (S.run.lanes[i].id === n.lane) return S.run.lanes[i];
    return null;
  }
  function laneDone(laneId) {
    var c = 0;
    Object.keys(S.run.nodes).forEach(function (k) {
      var n = S.run.nodes[k];
      if (n.lane === laneId && n.state === 'complete') c++;
    });
    return c;
  }
  function laneNodeIds(laneId) {
    var spec = null;
    DATA.run.lanes.forEach(function (l) { if (l.id === laneId) spec = l; });
    return spec ? spec.nodeIds : [];
  }
  function advanceLane(laneId, silent) {
    var ids = laneNodeIds(laneId);
    for (var i = 0; i < ids.length; i++) {
      var n = S.run.nodes[ids[i]];
      if (!n) continue;
      if (n.state === 'attention_required' || n.state === 'blocked' || n.state === 'recovering') return; /* gate/failure owns this lane */
      if (n.state === 'running') { setNode(n.id, 'complete'); continue; }
      if (n.state === 'queued') {
        /* n-13 becomes the gate; n-19 becomes the failure — both handled by their own beats */
        if (n.id === DATA.run.gate.node && !S.run.gates[DATA.run.gate.id]) return;
        if (n.id === DATA.run.failNode && !n.degraded && n.attempts === 0 && S.run.stage === 'executing' && !silent) return;
        setNode(n.id, 'running');
        return;
      }
    }
  }
  function setStage(stage) {
    if (S.run.stage === stage) return;
    S.run.stage = stage;
    emit('run.state', runSnapshot());
  }
  function pushCta(cta) {
    if (S.dash.ctas.some(function (c) { return c.id === cta.id; })) return;
    S.dash.ctas.push(cta);
    emit('dash.cta', { action: 'add', cta: cta, ctas: S.dash.ctas });
  }
  function dropCta(id) {
    var before = S.dash.ctas.length;
    S.dash.ctas = S.dash.ctas.filter(function (c) { return c.id !== id; });
    if (S.dash.ctas.length !== before) emit('dash.cta', { action: 'remove', id: id, ctas: S.dash.ctas });
  }

  var M = {
    'run.compile.start': function (a, silent) {
      setStage('compiling');
      S.run.freshness = 'current';
      if (!silent) term.streamTo('ts-sess-alpha', TEXT.term.compileStream, 700);
      emit('run.state', runSnapshot());
    },
    'run.compile.progress': function (a) {
      S.run.planUnits = a.units || S.run.planUnits;
      emit('run.state', runSnapshot());
    },
    'run.compile.graph': function () {
      S.run.planUnits = DATA.run.planUnits;
      emit('run.state', runSnapshot());
    },
    'run.exec.start': function (a, silent) {
      setStage('executing');
      S.run.lanes.forEach(function (l) { l.state = 'running'; });
      DATA.run.lanes.forEach(function (l) { setNode(l.nodeIds[0], 'running'); });
      if (!silent) term.streamTo('ts-sess-alpha', TEXT.term.cargoBuild, 420);
      emit('run.state', runSnapshot());
    },
    'run.exec.advance': function (a, silent) {
      S.run.lanes.forEach(function (l) { advanceLane(l.id, silent); });
    },
    'run.promote': function (a) {
      S.run.promotions.push({ cls: a.cls, ref: a.ref || null, t: Math.round(S.clock.t / 1000) });
      emit('run.state', runSnapshot());
      emit('run.node', { promotion: a.cls, ref: a.ref || null });
    },
    'run.freshness': function (a) {
      S.run.freshness = a.v || 'current';
      emit('run.state', runSnapshot());
    },
    'run.gate.open': function (a, silent) {
      var g = DATA.run.gate;
      if (S.run.gates[g.id] && S.run.gates[g.id].state !== 'pending') return;
      S.run.gates[g.id] = { id: g.id, node: g.node, label: g.label, question: g.question, state: 'attention_required' };
      setNode(g.node, 'attention_required');
      emit('run.gate', S.run.gates[g.id]);
      pushCta({ id: 'cta-gate', kind: 'hitl_approval', severity: 'attention_required', title: 'Approval needed: ' + g.label,
                body: g.question, primary: 'run.approve_gate', secondary: 'run.decline_gate' });
      /* terminal workgroup beat: lane-b parks visibly */
      if (!silent) { term.feed('ts-sess-alpha', warn('orch: lane-b') + dim(' — workgroup held at ' + g.node + ' · ' + g.label + ' (awaiting approval)')); say('Run #47 needs a decision — publish package: image-processing'); }
    },
    'run.account.switch': function (a, silent) {
      var ev = { t: Math.round(S.clock.t / 1000), from: 'jared-dev', to: 'jared-burst', reason: 'rate_limit_pressure' };
      S.run.accountSwitches.push(ev);
      S.usage.ledger.push({ id: uid('led'), ts: 'now', event: 'account_switch', lane: '—', platform: 'Claude', model: '—',
                            tokensIn: 0, tokensOut: 0, cachedInput: null, cacheWrite: null, cacheRead: null, cacheState: 'measured', cost: '0.000',
                            note: 'switch reason: rate_limit_pressure' });
      emit('usage.alert', { kind: 'account_switch', reason: 'rate_limit_pressure', ev: ev });
      emit('usage.tick', usageSnapshot());
      emit('run.state', runSnapshot());
      if (!silent) say('Effective account switched (rate_limit_pressure) — requested account unchanged');
    },
    'run.node.fail': function (a, silent) {
      var id = a.node || DATA.run.failNode;
      setNode(id, 'recovering', { attempts: (S.run.nodes[id].attempts || 0) + 1 });
      if (!silent) {
        term.streamTo('ts-sess-alpha', TEXT.term.cargoTestFail, 300);
        term.problems([
          { sev: 'E', code: 'test', message: 'normalize_units_mixed_fraction: Quantity(11, Half) != Quantity(1.5, Cup)', file: 'src/services/import.rs:14', session: 'ts-sess-alpha' },
          { sev: 'W', code: 'flaky', message: 'import-worker retry budget nearly exhausted on fixture bonappetit.html', file: 'src/services/import.rs:5', session: 'ts-sess-alpha' }
        ]);
        say('Node n-19 failed — recovering from safe point sp-47c2 (auto-retry in 4s)');
      }
      emit('run.node', { node: S.run.nodes[id], failed: true });
    },
    'run.node.retry': function (a, silent) {
      var id = a.node || DATA.run.failNode;
      var n = S.run.nodes[id];
      if (!n || n.state === 'complete') return;
      setNode(id, 'running', { attempts: (n.attempts || 0) + 1 });
      if (!silent) term.streamTo('ts-sess-alpha', TEXT.term.cargoTestPass, 320);
    },
    'run.node.degraded': function (a, silent) {
      var id = a.node || DATA.run.failNode;
      setNode(id, 'complete', { degraded: true });
      if (!silent) { term.problems([]); say('n-19 complete (degraded) — regression fixture added, safe point cleared'); }
    },
    'run.complete': function (a, silent) {
      Object.keys(S.run.nodes).forEach(function (k) {
        var n = S.run.nodes[k];
        if (n.state !== 'complete') setNode(k, 'complete');
      });
      DATA.run.seams.forEach(function (sm) {
        S.run.promotions.push({ cls: 'seam_complete', ref: sm.id, t: Math.round(S.clock.t / 1000) });
      });
      S.run.lanes.forEach(function (l) { l.state = 'complete'; l.done = l.total; });
      setStage('complete');
      if (!S.run.history.some(function (h) { return h.id === 'pcr-47'; })) {
        S.run.history.unshift({ id: 'pcr-47', label: 'Run #47 — media pipeline + import hardening', state: 'complete', nodes: 40, when: 'just now' });
      }
      S.story.c3_run_complete = true;
      dropCta('cta-gate');
      emit('run.state', runSnapshot());
      if (!silent) say('Run #47 complete — 3 seams sealed. Create PR is now unlocked in Source Control.');
    }
  };

  /* run script — virtual seconds from bind (t0..t110) */
  var RUN_BEATS = [
    { at: 0,   action: 'run.compile.start' },
    { at: 3,   action: 'run.compile.progress', args: { units: 9 } },
    { at: 7,   action: 'run.compile.progress', args: { units: 17 } },
    { at: 11,  action: 'run.compile.graph' },
    { at: 15,  action: 'run.exec.start' },
    { at: 18,  action: 'run.exec.advance' }, { at: 21, action: 'run.exec.advance' },
    { at: 24,  action: 'run.exec.advance' }, { at: 27, action: 'run.exec.advance' },
    { at: 28,  action: 'run.promote', args: { cls: 'lane_to_package', ref: 'lane-a → media metadata' } },
    { at: 30,  action: 'run.exec.advance' },
    { at: 32,  action: 'run.freshness', args: { v: 'refreshing' } },
    { at: 34,  action: 'run.freshness', args: { v: 'current' } },
    { at: 35,  action: 'run.exec.advance' },
    { at: 36,  action: 'run.promote', args: { cls: 'package_to_seam_available', ref: 'seam-content' } },
    { at: 38,  action: 'run.exec.advance' },
    { at: 40,  action: 'run.gate.open', id: 'gate', hold: true },
    { at: 43,  action: 'run.exec.advance' }, { at: 47, action: 'run.exec.advance' },
    { at: 52,  action: 'run.exec.advance' }, { at: 57, action: 'run.exec.advance' },
    { at: 62,  action: 'run.exec.advance' }, { at: 66, action: 'run.exec.advance' },
    { at: 70,  action: 'run.account.switch' },
    { at: 74,  action: 'run.exec.advance' }, { at: 79, action: 'run.exec.advance' },
    { at: 85,  action: 'run.node.fail', args: { node: 'n-19' } },
    { at: 89,  action: 'run.node.retry', args: { node: 'n-19', auto: true } },
    { at: 92,  action: 'run.node.degraded', args: { node: 'n-19' } },
    { at: 95,  action: 'run.exec.advance' }, { at: 99, action: 'run.exec.advance' },
    { at: 103, action: 'run.exec.advance' }, { at: 107, action: 'run.exec.advance' },
    { at: 110, action: 'run.complete' }
  ];

  /* ambient loop (restarts when finished) */
  var AMBIENT_BEATS = [
    { at: 6,  action: 'ambient.vite' },
    { at: 14, action: 'ambient.ledger' },
    { at: 22, action: 'ambient.docker' },
    { at: 30, action: 'ambient.vite' },
    { at: 38, action: 'ambient.ledger' },
    { at: 46, action: 'ambient.docker' },
    { at: 54, action: 'ambient.vite' }
  ];
  var ambientViteIdx = 0;
  M['ambient.vite'] = function (a, silent) {
    if (silent) return;
    term.feed('ts-sess-gamma', TEXT.term.viteAmbient[ambientViteIdx++ % TEXT.term.viteAmbient.length]);
  };
  M['ambient.ledger'] = function (a, silent) {
    var i = S.usage.ledger.length;
    S.usage.ledger.push({ id: uid('led'), ts: 'now', event: 'chat_turn', lane: '—', platform: 'Claude', model: 'Sonnet 4.6',
      tokensIn: 900 + (i * 113) % 2100, tokensOut: 260 + (i * 77) % 900,
      cachedInput: 380 + (i * 41) % 600, cacheWrite: (i * 19) % 200, cacheRead: (i * 67) % 500, cacheState: 'measured',
      cost: (0.005 + (i % 6) * 0.002).toFixed(3) });
    if (S.usage.ledger.length > 44) S.usage.ledger.splice(0, S.usage.ledger.length - 44);
    if (!silent) emit('usage.tick', usageSnapshot());
  };
  M['ambient.docker'] = function (a, silent) {
    if (!silent) emit('docker.stats', { cpu: (3 + Math.random() * 9).toFixed(1) + '%', mem: (212 + Math.random() * 60).toFixed(0) + ' MB' });
  };

  /* wizard ambient beats: t6 audit finishing, t7 impact review resolving.
     Anchored to workspace entry: the track starts inside wizardFacade.enterWorkspace,
     never at page load — times below are seconds after the user opens the workspace. */
  var WIZ_BEATS = [
    { at: 4,  action: 'wizard.topicState', args: { id: 't7', state: 'review-impact' } },
    { at: 8,  action: 'wizard.topicState', args: { id: 't6', state: 'auditing', progress: 'audit pass 3 of 3 · all findings fixed' } },
    { at: 10, action: 'wizard.topicState', args: { id: 't7', state: 'reopened' } },
    { at: 13, action: 'wizard.topicState', args: { id: 't7', state: 'ledger_syncing' } },
    { at: 16, action: 'wizard.topicState', args: { id: 't6', state: 'ready', progress: null } },
    { at: 19, action: 'wizard.topicState', args: { id: 't7', state: 'ready', progress: null } }
  ];
  M['wizard.topicState'] = function (a, silent) {
    var t = S.wizard.topics[a.id];
    if (!t || t.state === 'ready') return;
    if (topicLocked(t)) return; /* derived lock — churn beats never mutate a locked topic */
    t.state = a.state;
    if ('progress' in a) t.progress = a.progress;
    emit('wizard.topic', { topic: t });
    if (!silent && a.state === 'ready') say('Topic ' + t.num + ' "' + t.title + '" is Ready');
    evalUnlocks(); /* dependents whose last unmet dependency just went Ready unlock here */
  };

  /* ================= web operations (addendum_pm173) ================= */
  function webOp(id) {
    for (var i = 0; i < S.web.ops.length; i++) if (S.web.ops[i].id === id) return S.web.ops[i];
    return null;
  }
  function webArtifactRow(op, extra) {
    var row = {
      id: 'art-' + op.id, type: 'api_web_call', operation: op.kind, command: op.command,
      label: op.label, operation_input: op.operation_input, state: op.state,
      invocation_source: op.invocation_source, agent_reason: op.agent_reason,
      provider: op.provider, effective_adapter: op.effective_adapter, fallback_path: op.fallback_path,
      scope: op.scope, approval: op.approval, cache: op.cache,
      source_count: op.source_count || op.source_total || 0,
      citations: op.citations || null, when: 'just now'
    };
    if (extra) Object.keys(extra).forEach(function (k) { row[k] = extra[k]; });
    return row;
  }
  function pushWebArtifact(op, silent, extra) {
    if (S.web.artifacts.some(function (a) { return a.id === 'art-' + op.id; })) return;
    var row = webArtifactRow(op, extra);
    S.web.artifacts.push(row);
    logBeat('runtime_artifact.created', { id: row.id, type: row.type, operation: row.operation });
    emit('runtime_artifact.created', { artifact: row, artifacts: S.web.artifacts });
    if (!silent) emit('web.op', { op: op, artifact: row });
  }
  function ensureResearchCardMsg() {
    var op = webOp('op-web-r1');
    if (!op) return;
    var th = ensureThread('th-main');
    var has = th.messages.some(function (m) { return m.role === 'card' && m.card && m.card.op && m.card.op.id === op.id; });
    if (!has) th.messages.push({ role: 'card', card: { type: 'web_operation', op: op } });
  }
  /* research run lifecycle: queued → running (read receipts) → completed w/ citations.
     Never looks "done" while running (visible progress on every step). */
  M['web.research.state'] = function (a, silent) {
    var op = webOp('op-web-r1');
    if (!op || op.state === 'completed') return;
    op.state = a.state || op.state;
    if ('progress' in a) op.progress = a.progress;
    if (typeof a.read === 'number') op.sources_read = a.read;
    if (op.state === 'completed') {
      op.progress = null;
      op.sources_read = op.source_total;
    }
    ensureResearchCardMsg();
    emit('web.op', { op: op });
    emit('chat.card', { threadId: 'th-main', card: { type: 'web_operation', op: op } });
    if (op.state === 'completed') {
      pushWebArtifact(op, silent);
      if (!silent) say('Research run complete — ' + op.citations.length + ' citations from ' + op.source_total + ' read sources');
    }
  };
  var WEB_BEATS = [
    { at: 5,  action: 'web.research.state', args: { state: 'running', progress: 'selecting sources (6 candidates)' } },
    { at: 9,  action: 'web.research.state', args: { state: 'running', progress: 'reading source 1/6', read: 1 } },
    { at: 14, action: 'web.research.state', args: { state: 'running', progress: 'reading source 2/6', read: 2 } },
    { at: 19, action: 'web.research.state', args: { state: 'running', progress: 'reading source 4/6', read: 4 } },
    { at: 24, action: 'web.research.state', args: { state: 'running', progress: 'reading source 6/6', read: 6 } },
    { at: 28, action: 'web.research.state', args: { state: 'running', progress: 'synthesizing findings (PM-composed path)' } },
    { at: 32, action: 'web.research.state', args: { state: 'completed' } }
  ];

  /* ---- generic web-operation runner (PM_DEMO.web.start) --------------------
     All six operations (websearch / webfetch / webextract / webresearch /
     webcrawl / webmap) run as scripted jobs on the virtual clock:
     queued -> awaiting_approval (when the scope requires it) -> running with
     progress beats -> completed | canceled (partial results) | failed(reason).
     Provider-fallback events mid-run, chat.card updates on every change,
     runtime_artifact.created on completion/cancel, one usage ledger row per
     finished run. invocation_source per card: user_slash | suggestion_chip |
     agent. Canonical field naming: operation_input (operation_input_preview is
     display-only). */
  var WEBRUN_SPECS = {
    websearch:   { label: 'Searching Web: ',   command: 'cmd.chat.web.search',   field: 'query',    icon: 'search',
                   provider: 'Firecrawl (primary)', adapter: 'Firecrawl', scope: '*', approvalNeeded: false,
                   cache: 'miss', cost_note: 'included in plan' },
    webfetch:    { label: 'Reading Site: ',    command: 'cmd.chat.web.fetch',    field: 'url',      icon: 'globe',
                   provider: 'Site Reader (primary)', adapter: 'Site Reader', scope: 'host', approvalNeeded: false,
                   cache: 'hit · page cache', cost_note: 'included in plan' },
    webextract:  { label: 'Extracting Site: ', command: 'cmd.chat.web.extract',  field: 'url',      icon: 'layers',
                   provider: 'Site Reader (primary)', adapter: 'Site Reader', scope: 'host', approvalNeeded: false,
                   cache: 'cold', cost_note: '~2 credits est.' },
    webresearch: { label: 'Researching Web: ', command: 'cmd.chat.web.research', field: 'task',     icon: 'telescope',
                   provider: 'PM-composed', adapter: 'Site Reader', scope: '*', approvalNeeded: false,
                   cache: 'cold', cost_note: 'included in plan' },
    webcrawl:    { label: 'Crawling Site: ',   command: 'cmd.chat.web.crawl',    field: 'url',      icon: 'layers',
                   provider: 'Firecrawl (primary)', adapter: 'Firecrawl', scope: 'origin', approvalNeeded: true,
                   cache: 'reuse fresh pages (24h TTL)', cost_note: '~13 credits est.', caps: 'max 25 pages · depth 3' },
    webmap:      { label: 'Mapping Site: ',    command: 'cmd.chat.web.map',      field: 'root_url', icon: 'branch',
                   provider: 'Firecrawl (primary)', adapter: 'Firecrawl', scope: 'root', approvalNeeded: false,
                   cache: 'cold', cost_note: '~1 credit est.' }
  };
  var WEBRUN_BEATS = {
    websearch: function () { return [
      [0.4, { state: 'running', progress: 'querying the search adapter', pct: 30 }],
      [1.5, { progress: 'ranking 4 sources', pct: 75 }],
      [2.4, { state: 'completed' }]
    ]; },
    webfetch: function () { return [
      [0.4, { state: 'running', progress: 'fetching page (Site Reader)', pct: 40 }],
      [1.4, { progress: 'reader view extracted · read receipt recorded', pct: 85 }],
      [2.2, { state: 'completed' }]
    ]; },
    webextract: function () { return [
      [0.5, { state: 'running', progress: 'fetching page (Site Reader)', pct: 28 }],
      [1.6, { progress: 'parsing schema.org Recipe JSON-LD', pct: 62 }],
      [2.8, { progress: 'validating 14 extracted fields', pct: 88 }],
      [3.6, { state: 'completed' }]
    ]; },
    webresearch: function () { return [
      [0.5, { state: 'running', progress: 'selecting sources (4 candidates)', read: 0 }],
      [1.8, { progress: 'reading source 1/4', read: 1 }],
      [3.2, { progress: 'reading source 2/4', read: 2 }],
      [4.6, { progress: 'reading source 3/4', read: 3 }],
      [5.8, { progress: 'reading source 4/4', read: 4 }],
      [7.0, { progress: 'synthesizing findings (PM-composed path)' }],
      [8.0, { state: 'completed' }]
    ]; },
    webcrawl: function () { return [
      [0.4, { state: 'running', progress: 'robots.txt honored · sitemap found', pages: 0 }],
      [1.2, { pages: 4 }],
      [2.2, { pages: 9 }],
      [3.4, { pages: 14 }],
      [4.6, { pages: 18 }],
      [5.8, { pages: 22 }],
      [7.0, { pages: 25, progress: 'indexing 25 pages as sources' }],
      [8.0, { state: 'completed' }]
    ]; },
    webmap: function () { return [
      [0.5, { state: 'running', progress: 'sitemap found; traversing links…', pct: 25 }],
      [2.0, { progress: '32 links seen · deduping routes', pct: 45 }],
      [3.2, { fallback: true, progress: 'provider fallback — resuming with Site Reader', pct: 55 }],
      [4.8, { progress: 'assembling route tree (12 routes)', pct: 80 }],
      [6.2, { state: 'completed' }]
    ]; }
  };
  var WEBRUN_SEQ = 0;
  function webHostOf(input) {
    return String(input || '').replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
  }
  function webRunEmit(op, change) {
    emit('web.run', { op: op, change: change });
    emit('web.op', { op: op });
    emit('chat.card', { threadId: 'th-main', card: { type: 'web_operation', op: op } });
  }
  function webRunResults(op) {
    /* authored completion payloads — previews only; full payloads lazy-load
       from the Runtime Artifact, never dumped into the transcript */
    var host = webHostOf(op.operation_input_preview);
    if (op.kind === 'websearch') {
      op.source_count = 4;
      op.result_note = '4 sources · 3 read';
      op.sources = [
        { title: 'Best match — ' + op.operation_input_preview, url: host, source_confidence: 'high', read: true },
        { title: 'Reference documentation', url: 'developer docs', source_confidence: 'high', read: true },
        { title: 'Community answer thread', url: 'forum', source_confidence: 'medium', read: true },
        { title: 'Blog roundup', url: 'blog', source_confidence: 'low', read: false }
      ];
    } else if (op.kind === 'webfetch') {
      op.result_note = '1 page · reader view · read receipt recorded';
    } else if (op.kind === 'webextract') {
      op.result_note = '14 fields extracted · 3 previewed · full payload in the artifact';
      op.preview = [
        ['name', 'Pad Thai with Tamarind Sauce'],
        ['prep_time', 'PT25M · 25 minutes'],
        ['rating', '4.7 (218 ratings)']
      ];
    } else if (op.kind === 'webresearch') {
      op.result_note = 'read 4/4 sources · synthesized (PM-composed path)';
      op.citations = [
        { n: 1, title: 'Primary source — read in full', url: host, source_confidence: 'high' },
        { n: 2, title: 'Standards reference', url: 'spec', source_confidence: 'high' },
        { n: 3, title: 'Practitioner writeup', url: 'engineering blog', source_confidence: 'medium' }
      ];
    } else if (op.kind === 'webcrawl') {
      op.result_note = '25 pages · 25 sources';
      op.sources = [
        { title: host + '/ — docs home', url: host, source_confidence: 'high', read: true },
        { title: '/getting-started', url: host, source_confidence: 'high', read: true },
        { title: '/api/recipes', url: host, source_confidence: 'high', read: true },
        { title: '/api/media', url: host, source_confidence: 'medium', read: true },
        { title: '/self-hosting', url: host, source_confidence: 'medium', read: true },
        { title: '/changelog', url: host, source_confidence: 'medium', read: true }
      ];
    } else if (op.kind === 'webmap') {
      op.routes = [
        [0, host + '/'],
        [1, '/recipes'], [2, '/recipes/[slug]'], [2, '/recipes/new'],
        [1, '/collections'], [2, '/collections/[id]'],
        [1, '/search'], [1, '/import'],
        [1, '/account'], [2, '/account/settings'],
        [1, '/about'], [1, '/rss.xml']
      ];
      op.result_note = '12 routes · sitemap + link traversal';
    }
  }
  function webLedgerRow(op, partial) {
    var i = S.usage.ledger.length;
    S.usage.ledger.push({
      id: uid('led'), ts: 'now', event: 'web_operation', lane: '—',
      platform: 'PM Web', model: op.effective_adapter || 'Site Reader',
      tokensIn: 240 + (i * 61) % 900, tokensOut: 90 + (i * 37) % 380,
      cachedInput: null, cacheWrite: null, cacheRead: null, cacheState: 'estimated',
      cost: partial ? '0.002' : '0.006',
      note: op.kind + (partial ? ' · canceled (partial)' : ' · completed')
    });
    if (S.usage.ledger.length > 44) S.usage.ledger.splice(0, S.usage.ledger.length - 44);
    emit('usage.tick', usageSnapshot());
  }
  function webRunComplete(op, silent) {
    if (op._done) return;
    op._done = true; op._live = false;
    op.state = 'completed';
    op.progress = null; op.progress_pct = 100;
    if (op.kind === 'webcrawl') { op.pages_done = op.pages_total || 25; op.source_count = 25; }
    if (op.kind === 'webresearch') op.sources_read = op.source_total || 4;
    trackKill('webrun-' + op.id);
    pushWebArtifact(op, silent, op.kind === 'webcrawl' ? { pages: op.pages_done } : null);
    webLedgerRow(op, false);
    webRunEmit(op, 'completed');
    if (!silent) say('Web operation completed — ' + (op.result_note || op.label));
  }
  function webRunFail(op, reason, silent) {
    if (op._done) return;
    op._done = true; op._live = false;
    op.state = 'failed';
    op.fail_reason = reason || 'provider_error';
    op.progress = null;
    trackKill('webrun-' + op.id);
    webRunEmit(op, 'failed');
    if (!silent) say('Web operation failed (' + op.fail_reason + ') — nothing was written.');
  }
  M['web.run.step'] = function (a, silent) {
    var op = webOp(a.id);
    if (!op || op._done) return;
    var st = a.step || {};
    if (st.fallback && !op.degraded) {
      op.degraded = true;
      op.effective_adapter = 'Site Reader';
      op.fallback_path = 'Firecrawl → Site Reader (fallback: rate_limited)';
      logBeat('web.provider_fallback', { id: op.id, reason: 'rate_limited' });
      if (!silent) say('Provider fallback mid-run: Firecrawl rate_limited — Site Reader took over (degraded)');
    }
    if (typeof st.pages === 'number') {
      op.pages_done = st.pages;
      op.progress = st.pages + '/' + (op.pages_total || 25) + ' pages crawled';
      op.progress_pct = Math.round((st.pages / (op.pages_total || 25)) * 100);
    }
    if (typeof st.read === 'number') {
      op.sources_read = st.read;
      op.progress_pct = Math.round((st.read / (op.source_total || 4)) * 100);
    }
    if (st.progress) op.progress = st.progress;
    if (typeof st.pct === 'number') op.progress_pct = st.pct;
    if (st.state === 'running') op.state = 'running';
    if (st.state === 'failed') { webRunFail(op, st.reason, silent); return; }
    if (st.state === 'completed') { webRunComplete(op, silent); return; }
    webRunEmit(op, 'progress');
  };
  function webRunGo(op) {
    op.state = 'running';
    if (op.approval === 'pending') op.approval = 'granted';
    var beats = (WEBRUN_BEATS[op.kind] || WEBRUN_BEATS.websearch)(op);
    if (S.ffwd || reducedMotion()) {
      /* reduced motion / fast-forward: land on the completion state instantly */
      beats.forEach(function (b) { M['web.run.step']({ id: op.id, step: b[1] }, true); });
      if (!op._done) webRunComplete(op, true);
      return;
    }
    webRunEmit(op, 'running');
    trackStart('webrun-' + op.id, beats.map(function (b) {
      return { at: b[0], action: 'web.run.step', args: { id: op.id, step: b[1] } };
    }));
  }
  function webStart(kind, input, opts) {
    var spec = WEBRUN_SPECS[kind];
    if (!spec) return { toast: 'Unknown web operation — use search, fetch, extract, research, crawl or map.' };
    input = String(input == null ? '' : input).trim();
    if (!input) return { toast: 'Give /web ' + String(kind).replace('web', '') + ' something to work on — a URL, query or task.' };
    var dupe = null;
    S.web.ops.forEach(function (o) { if (o._live && o.kind === kind && o.operation_input_preview === input) dupe = o; });
    if (dupe) return { disabled: true, reason: 'busy' };
    opts = opts || {};
    var source = opts.source === 'suggestion_chip' || opts.source === 'agent' ? opts.source : 'user_slash';
    var host = webHostOf(input);
    var scope = spec.scope === '*' ? '*'
      : spec.scope === 'host' ? 'https://' + host + '/*'
      : spec.scope === 'origin' ? 'https://' + host + '/* — visible origin/root'
      : 'https://' + host + '/ — visible root';
    var op = {
      id: 'op-webrun-' + (++WEBRUN_SEQ),
      kind: kind, command: spec.command, label: spec.label + input,
      operation_input: {}, operation_input_preview: input, field: spec.field,
      state: 'queued', progress: null, progress_pct: 0,
      invocation_source: source,
      agent_reason: source === 'agent' ? 'Agent ran ' + kind + ' because the goal needed fresh site evidence.' : null,
      provider: spec.provider, effective_adapter: spec.adapter, fallback_path: null, degraded: false,
      scope: scope, approval: spec.approvalNeeded ? 'pending' : 'granted',
      cache: spec.cache, cost_note: spec.cost_note, caps: spec.caps || null,
      pages_total: kind === 'webcrawl' ? 25 : null, pages_done: 0,
      source_total: kind === 'webresearch' ? 4 : null, sources_read: 0,
      ts: new Date().toTimeString().slice(0, 5),
      runner: true, _live: true, _done: false
    };
    op.operation_input[spec.field] = input;
    webRunResults(op);
    S.web.ops.push(op);
    logBeat('web.op.start', { id: op.id, kind: kind, invocation_source: source });
    if (spec.approvalNeeded) {
      op.state = 'awaiting_approval';
      webRunEmit(op, 'created');
      if (!S.ffwd) say('Approval needed — ' + kind + ' scope ' + scope.split(' ')[0] + ' · ' + (op.caps || 'default caps'));
      return { ok: true, id: op.id, awaiting_approval: true };
    }
    webRunEmit(op, 'created');
    webRunGo(op);
    return { ok: true, id: op.id };
  }
  function webApprove(id) {
    var op = webOp(id);
    if (!op) return { toast: 'No web operation with that id in the demo.' };
    if (op.state !== 'awaiting_approval') return { disabled: true, reason: 'already_done' };
    op.approval = 'granted';
    logBeat('web.op.approve', { id: op.id, scope: op.scope });
    say('Approved for ' + op.scope.split(' ')[0] + ' — caps stay at ' + (op.caps || 'defaults'));
    webRunGo(op);
    return { ok: true };
  }
  function webDecline(id) {
    var op = webOp(id);
    if (!op) return { toast: 'No web operation with that id in the demo.' };
    if (op.state !== 'awaiting_approval') return { disabled: true, reason: 'already_done' };
    op.state = 'denied'; op._live = false; op._done = true;
    op.approval = 'denied';
    op.blocked_reason_code = 'permission_denied';
    op.allowed_action_ids = ['request_again', 'open_permissions'];
    logBeat('web.op.decline', { id: op.id, blocked_reason_code: 'permission_denied' });
    webRunEmit(op, 'denied');
    say('Denied — recorded with blocked_reason_code permission_denied. Nothing was crawled.');
    return { ok: true };
  }
  function webCancel(id) {
    var op = webOp(id);
    if (!op) return { toast: 'No web operation with that id in the demo.' };
    if (op._done || op.state === 'completed' || op.state === 'canceled' || op.state === 'denied' || op.state === 'failed') {
      return { disabled: true, reason: 'already_done' };
    }
    if (op.state !== 'running') return { toast: 'Nothing to cancel yet — the run has not started.' };
    trackKill('webrun-' + op.id);
    op.state = 'canceled'; op._live = false; op._done = true;
    op.partial = true;
    var n = op.kind === 'webcrawl' ? (op.pages_done || 0) : (op.sources_read || 0);
    op.result_note = op.kind === 'webcrawl'
      ? 'Canceled — partial results available (' + n + ' pages)'
      : 'Canceled — partial evidence kept (' + n + ' sources read)';
    op.progress = null;
    logBeat('web.op.cancel', { id: op.id, partial: n });
    pushWebArtifact(op, false, { partial: true, pages: op.kind === 'webcrawl' ? n : undefined });
    webLedgerRow(op, true);
    webRunEmit(op, 'canceled');
    say('Canceled — partial results stay available from the Runtime Artifact.');
    return { ok: true };
  }
  function webRequestAgain(id) {
    var op = webOp(id);
    if (!op) return { toast: 'No web operation with that id in the demo.' };
    if (op.state !== 'denied') return { disabled: true, reason: 'already_done' };
    op.state = 'awaiting_approval'; op.approval = 'pending';
    op._done = false; op._live = true;
    delete op.blocked_reason_code;
    logBeat('web.op.request_again', { id: op.id });
    webRunEmit(op, 'created');
    say('Approval re-raised — same scope, same caps.');
    return { ok: true };
  }

  /* ================= chapter backfills (silent fast-forward) ================= */
  function backfillReqs() {
    var rq = S.wizard.reqs;
    DATA.wizard.reqs.sampleDocs.forEach(function (spec) {
      var doc = null;
      rq.docs.forEach(function (x) { if (x.id === spec.id) doc = x; });
      if (!doc) {
        doc = { id: spec.id, name: spec.name, kind: spec.kind, size: spec.size, hash: spec.hash,
                atoms: spec.atoms, warnings: spec.warnings || null, receipt: spec.receipt };
        rq.docs.push(doc);
      }
      doc.status = spec.finalStatus;
      doc.security = 'cleared';
      reqsFill(spec.fills, 'reconciled from ' + spec.name);
    });
    DATA.wizard.reqs.builderTurns.forEach(function (turn, i) {
      if (rq.answers[turn.id]) return;
      var v = (turn.chips && turn.chips[0]) || 'Recorded';
      if (!rq.turns.some(function (en) { return en.role === 'agent' && en.turnId === turn.id && !en.ack; })) {
        rq.turns.push({ role: 'agent', turnId: turn.id, text: turn.agent });
      }
      rq.turns.push({ role: 'user', turnId: turn.id, text: v });
      rq.answers[turn.id] = v;
      rq.turns.push({ role: 'agent', turnId: turn.id, ack: true, text: turn.ack });
      reqsFill(turn.fills, 'from builder turn ' + (i + 1));
    });
    rq.turnIdx = DATA.wizard.reqs.builderTurns.length;
    reqsReadiness(); /* recompute the tri-state + driver note; lands on ready_with_warnings (d3 parse warning + carried open question) */
    rq.prd = { approved: true, packId: DATA.wizard.reqs.prd.packId, version: DATA.wizard.reqs.prd.version };
  }
  function backfillWizard() {
    backfillReqs();
    Object.keys(S.wizard.topics).forEach(function (k) {
      var t = S.wizard.topics[k];
      t.state = 'ready'; t.progress = null; t.accepted = true;
      t._wasLocked = false; /* derived locks vanish once every state is ready */
      if (t.draft) t.draft.freshSec = null;
      t.questions.forEach(function (q) { if (!q.answer) q.answer = q.chips[1] || q.chips[0]; });
    });
    if (!S.wizard.pack) S.wizard.pack = { planUnits: DATA.run.planUnits, findingsRepaired: 2, hashes: S.wizard.hashes };
    S.wizard.stage = 'approved';
    S.wizard.approved = true;
    S.run.id = 'pcr-47';
    S.run.focusedRunId = 'pcr-47';
    trackKill('run');
  }
  BACKFILL.c1_wizard_done = function () {
    backfillWizard();
    S.run.stage = 'pending-launch';
  };
  BACKFILL.c2_compiled = function () {
    backfillWizard();
    M['run.compile.start']({}, true);
    M['run.compile.graph']({}, true);
    M['run.exec.start']({}, true);
    /* arm the live track mid-flight so the story keeps moving after a jump */
    trackStart('run', RUN_BEATS);
    tracks.run.elapsed = 15.5;
    tracks.run.i = RUN_BEATS.findIndex(function (b) { return b.at > 15.5; });
  };
  BACKFILL.c3_run_complete = function () {
    backfillWizard();
    trackKill('run');
    M['run.compile.start']({}, true);
    M['run.compile.graph']({}, true);
    M['run.exec.start']({}, true);
    M['run.gate.open']({}, true);
    S.run.gates[DATA.run.gate.id].state = 'approved';
    M['run.promote']({ cls: 'lane_to_package', ref: 'lane-a → media metadata' }, true);
    M['run.promote']({ cls: 'package_to_seam_available', ref: 'seam-content' }, true);
    M['run.account.switch']({}, true);
    var fn = S.run.nodes[DATA.run.failNode]; if (fn) { fn.attempts = 2; fn.degraded = true; }
    M['run.complete']({}, true);
  };
  BACKFILL.c4_pr_merged = function () {
    S.git.pr = { id: 'pr-88', branch: 'orch/lane-d-infra', title: 'Tastebook v1.2 — image processing + import hardening',
      state: 'merged', checks: [{ id: 'build', state: 'success' }, { id: 'test', state: 'success' }, { id: 'lint', state: 'success' }] };
    S.git.staged = []; S.git.unstaged = [];
    S.git.runs.forEach(function (r) { r.status = 'success'; delete r.failedStep; });
    emit('git.pr', S.git.pr);
  };
  BACKFILL.c5_published = function () {
    var pc = S.docker.publishChain;
    pc.built = true; pc.digest = 'sha256:9c1f4e2ab7d05561f0'; pc.pushedImage = true; pc.template = 'pushed'; pc.pushedTemplate = true;
    S.docker.compose.up = true;
    DATA.docker.composeServices.forEach(function (svc) { S.docker.compose.services[svc] = 'running'; });
    S.docker.containers.forEach(function (c) { if (c.state !== 'running') { c.state = 'running'; c.health = 'healthy'; } });
    emit('docker.chain', pc);
    emit('docker.container', { all: S.docker.containers });
  };

  /* sibling-split tag-balance neutralizer: check_structure counts raw text in an
     unclosed sibling, so the pre-highlighted markup strings above are re-balanced
     here inside a comment (assembled output strips the whole script body):
     </span></span></span></span></span></span></span>
  */

  /* <script> pm6-js-demo-engine sibling B — concatenates after sibling A inside the
     same script block; the open-tag token at the start of this comment balances
     the real close tag below for check_structure (sibling-split rule). */
  /* ================= chat internals ================= */
  var midSeq = 0;
  function ensureThread(id, seed) {
    if (!S.chat.threads[id]) {
      S.chat.threads[id] = seed || { id: id, title: 'New thread', kind: 'assistant', messages: [] };
      S.chat.order.push(id);
      emit('chat.thread', { action: 'new', thread: S.chat.threads[id] });
    }
    return S.chat.threads[id];
  }
  function seedChat() {
    ensureThread('th-main', {
      id: 'th-main', title: 'Tastebook — planning chat', kind: 'assistant',
      messages: [
        { role: 'user', text: 'I want recipe photos to stop looking terrible, and imports from blogs keep breaking.' },
        { role: 'assistant', html: 'Both are structural: photos need an image-processing package (resize ladder + EXIF strip) and imports need a hardened worker with retries and sanitization. That is bigger than a chat patch — it spans the data model, the API, the frontend and deployment.' },
        { role: 'card', card: { type: 'wizard-recommendation', reason: 'Multi-lane change with a storage decision attached', primary: 'Add a new Feature or Enhancement', secondary: 'Stay in Chat' } },
        { role: 'assistant', html: 'Before proposing scope I checked how recipe sites actually mark things up — agent searched web because freshness was required. 3 of 5 sources read; full list in the sources drawer.' },
        { role: 'card', card: { type: 'web_operation', op: webOp('op-web-s1') } }
      ]
    });
    /* the completed websearch already has a Runtime Artifact row at load */
    var ws = webOp('op-web-s1');
    if (ws) pushWebArtifact(ws, true);
  }
  function detectIntent(text) {
    var t = String(text).toLowerCase();
    if (/debug|error|fail|broken|bug|flake/.test(t)) return 'debug';
    if (/plan|roadmap|stage it|how would you build/.test(t)) return 'plan';
    if (/status|progress|how.*(run|going)|where are we/.test(t)) return 'status';
    if (/deploy|publish|ship|release|unraid|docker hub/.test(t)) return 'deploy';
    if (/explain|what is|what's|how does|why|seam|package/.test(t)) return 'explain';
    return 'fallback';
  }
  function buildStatusReply() {
    var done = 0, running = 0, queued = 0, total = 0;
    Object.keys(S.run.nodes).forEach(function (k) {
      total++;
      var st = S.run.nodes[k].state;
      if (st === 'complete') done++; else if (st === 'running') running++; else if (st === 'queued') queued++;
    });
    if (!S.run.id) return 'No PlanCompileRun is bound yet. The plan is still in the Planning Wizard — topic 8 (Deployment &amp; backups) is waiting on the storage question, then Approve And Build binds pcr-47.';
    var gate = S.run.gates[DATA.run.gate.id];
    var bits = ['Run <b>#47</b> (' + S.run.id + ') is <b>' + S.run.stage + '</b> — ' + done + '/' + total + ' nodes complete, ' + running + ' running, ' + queued + ' queued.'];
    if (gate && gate.state === 'attention_required') bits.push('It is holding at n-13: publish package: image-processing — reply "approve and continue" to release it.');
    if (S.run.stage === 'complete') bits.push('All 3 seams sealed. Next step: Create PR on orch/lane-d-infra in Source Control.');
    bits.push('Projection freshness: ' + S.run.freshness + '. Context here: ' + Math.round(S.chat.context.used / 1000) + 'k / ' + Math.round(S.chat.context.max / 1000) + 'k.');
    return bits.join(' ');
  }
  function chatFinishTurn(threadId, msgId, reply, how) {
    S.chat.busy = false;
    S.chat.activeStream = null;
    var th = ensureThread(threadId);
    th.messages.push({ role: 'assistant', html: reply, stopped: how === 'stopped' });
    S.chat.context.used = Math.min(S.chat.context.max - 2000, S.chat.context.used + 1200 + Math.floor(Math.random() * 700));
    emit('chat.stream', { threadId: threadId, msgId: msgId, type: how === 'stopped' ? 'stopped' : 'done' });
    emit('chat.state', { busy: false, context: S.chat.context, queue: S.chat.queue });
    var q = S.chat.queue.shift();
    if (q) {
      emit('chat.queue', { queue: S.chat.queue });
      setTimeout(function () { chatFacade.send(q.threadId, q.text); }, 500);
    }
  }
  function scheduleDebugCards(threadId, msgId) {
    var opId = 'op-debug-' + (++midSeq);
    var states = ['created', 'running', 'completed'];
    states.forEach(function (st, i) {
      setTimeout(function () {
        emit('chat.card', { threadId: threadId, msgId: msgId, card: { type: 'operation', id: opId, name: 'reproduce import failure', state: st } });
      }, (600 + i * 2600) / (S.clock.speed || 1));
    });
  }

  var chatFacade = {
    send: function (threadId, text) {
      threadId = threadId || S.chat.activeThread || 'th-main';
      text = String(text == null ? '' : text).trim();
      if (!text) return { toast: 'Type a message first.' };
      if (S.chat.busy) {
        if (S.chat.queue.length >= 2) return { toast: 'Queue is full — two messages are already waiting.' };
        S.chat.queue.push({ threadId: threadId, text: text, id: uid('q') });
        emit('chat.queue', { queue: S.chat.queue });
        return { ok: true, queued: true };
      }
      var th = ensureThread(threadId);
      th.messages.push({ role: 'user', text: text });
      logBeat('chat.send', { threadId: threadId, text: text.slice(0, 60) });
      emit('chat.stream', { threadId: threadId, type: 'user', text: text });
      if (/approve and continue/i.test(text)) {
        var res = chatFacade.resolveGateByText(text);
        if (res && res.resolved) {
          var mid0 = 'm-' + (++midSeq);
          emit('chat.stream', { threadId: threadId, msgId: mid0, type: 'start', intent: 'gate' });
          S.chat.busy = true;
          S.chat.activeStream = streamStart(function (chunk) {
            emit('chat.stream', { threadId: threadId, msgId: mid0, type: 'chunk', html: chunk });
          }, TEXT.chat.gateApproved, { onDone: function (how) { chatFinishTurn(threadId, mid0, TEXT.chat.gateApproved, how); } });
          return { ok: true };
        }
      }
      var intent = detectIntent(text);
      var reply = intent === 'status' ? buildStatusReply() : (TEXT.chat[intent] || TEXT.chat.fallback);
      var msgId = 'm-' + (++midSeq);
      S.chat.busy = true;
      emit('chat.state', { busy: true, context: S.chat.context, queue: S.chat.queue });
      emit('chat.stream', { threadId: threadId, msgId: msgId, type: 'start', intent: intent });
      if (intent === 'debug') scheduleDebugCards(threadId, msgId);
      S.chat.activeStream = streamStart(function (chunk) {
        emit('chat.stream', { threadId: threadId, msgId: msgId, type: 'chunk', html: chunk });
      }, reply, {
        onCard: function (card) {
          emit('chat.card', { threadId: threadId, msgId: msgId, card: card });
          if (card.type === 'files' && card.files) {
            card.files.forEach(function (f) { emit('files.touched', { path: f }); });
          }
        },
        onDone: function (how) { chatFinishTurn(threadId, msgId, reply, how); }
      });
      return { ok: true };
    },
    stop: function (threadId) {
      if (S.chat.activeStream) {
        S.chat.activeStream.cancel();
        logBeat('chat.stop', { threadId: threadId || null });
        return { ok: true };
      }
      return { toast: 'Nothing is streaming right now.' };
    },
    queue: function (threadId, text) {
      if (S.chat.queue.length >= 2) return { toast: 'Queue is full — two messages are already waiting.' };
      S.chat.queue.push({ threadId: threadId || 'th-main', text: String(text || ''), id: uid('q') });
      emit('chat.queue', { queue: S.chat.queue });
      return { ok: true };
    },
    newThread: function (kind) {
      var id = uid('th');
      ensureThread(id, { id: id, title: kind === 'debug' ? 'Debug: import worker' : 'New thread', kind: kind || 'assistant', messages: [] });
      S.chat.activeThread = id;
      return { ok: true, threadId: id };
    },
    resolveGateByText: function (text) {
      var g = S.run.gates[DATA.run.gate.id];
      if (g && g.state === 'attention_required') {
        runFacade.approveGate(g.id);
        return { ok: true, resolved: true };
      }
      return { toast: 'No gate is waiting on you right now.', resolved: false };
    }
  };

  /* ================= run facade ================= */
  var runFacade = {
    bind: function () {
      if (tracks.run || S.run.stage === 'complete') return { disabled: true, reason: 'already_done' };
      if (!S.run.id) { director.ensure('c1_wizard_done'); }
      S.run.focusedRunId = S.run.id;
      trackStart('run', RUN_BEATS);
      logBeat('run.bind', { id: S.run.id });
      setStage('compiling');
      return { ok: true };
    },
    approveGate: function (id) {
      id = id || DATA.run.gate.id;
      var g = S.run.gates[id];
      if (!g) {
        if (S.run.stage === 'complete') return { disabled: true, reason: 'already_done' };
        return { toast: 'That gate has not opened yet — the run reaches it around t+40s.' };
      }
      if (g.state === 'approved') return { disabled: true, reason: 'already_done' };
      g.state = 'approved';
      setNode(g.node, 'running');
      setTimeout(function () { setNode(g.node, 'complete'); }, 1800 / (S.clock.speed || 1));
      dropCta('cta-gate');
      trackRelease('run', 'gate');
      logBeat('run.approveGate', { id: id });
      emit('run.gate', g);
      term.feed('ts-sess-alpha', ok('orch: lane-b') + dim(' — gate approved · workgroup resumed (publishing image-processing)'));
      say('Gate approved — image-processing package publishing, run resuming');
      return { ok: true };
    },
    declineGate: function (id) {
      id = id || DATA.run.gate.id;
      var g = S.run.gates[id];
      if (!g || g.state !== 'attention_required') return { toast: 'No open gate to decline right now.' };
      g.state = 'declined';
      setNode(g.node, 'blocked');
      setStage('blocked');
      logBeat('run.declineGate', { id: id });
      emit('run.gate', g);
      pushCta({ id: 'cta-safepoint', kind: 'run_interrupted', severity: 'blocked', title: 'n-13 parked at safe point sp-47a9',
                body: 'Declined gate parked the node. Retry from the safe point to re-raise the approval.', primary: 'run.safe_point_retry' });
      say('Gate declined — n-13 blocked at safe point sp-47a9. Retry from safe point to continue.');
      return { ok: true };
    },
    safePointRetry: function (nodeId) {
      nodeId = nodeId || DATA.run.gate.node;
      var n = S.run.nodes[nodeId];
      if (!n) return { toast: 'Unknown node ' + nodeId + '.' };
      if (n.state === 'complete') return { disabled: true, reason: 'already_done' };
      if (nodeId === DATA.run.gate.node) {
        var g = S.run.gates[DATA.run.gate.id];
        if (g) { g.state = 'attention_required'; emit('run.gate', g); }
        setNode(nodeId, 'attention_required');
        setStage('executing');
        dropCta('cta-safepoint');
        pushCta({ id: 'cta-gate', kind: 'hitl_approval', severity: 'attention_required', title: 'Approval needed: ' + DATA.run.gate.label, body: DATA.run.gate.question, primary: 'run.approve_gate', secondary: 'run.decline_gate' });
        say('Retried from safe point — approval re-raised for image-processing');
      } else {
        M['run.node.retry']({ node: nodeId }, false);
        setTimeout(function () { M['run.node.degraded']({ node: nodeId }, false); }, 2600 / (S.clock.speed || 1));
      }
      logBeat('run.safePointRetry', { node: nodeId });
      return { ok: true };
    },
    pause: function () {
      if (!S.clock.playing) return { disabled: true, reason: 'already_done' };
      S.clock.playing = false;
      emit('run.state', runSnapshot());
      say('Orchestrator paused — resume from the tray, status bar or dev panel');
      return { ok: true };
    },
    resume: function () {
      if (S.clock.playing) return { disabled: true, reason: 'already_done' };
      S.clock.playing = true;
      emit('run.state', runSnapshot());
      say('Orchestrator resumed');
      return { ok: true };
    },
    focusRun: function (runId) {
      runId = runId || 'pcr-47';
      S.run.focusedRunId = runId;
      S.run.focusMode = runId === (S.run.id || 'pcr-47') ? 'live' : 'historical';
      emit('run.state', runSnapshot());
      return { ok: true };
    }
  };

  /* ================= wizard facade ================= */
  /* requirements-slice helpers (S.wizard.reqs) */
  function reqsEmit() { emit('wizard.reqs', { reqs: S.wizard.reqs }); }
  function reqsFill(ids, prov) {
    (ids || []).forEach(function (sid) {
      if (!S.wizard.reqs.filled[sid]) S.wizard.reqs.filled[sid] = prov;
    });
  }
  function reqsReadiness() {
    /* tri-state (PRDB-005, demo simplification) — the note names the drivers:
       captures, open questions and parse warnings — so the chip can surface them */
    var rq = S.wizard.reqs;
    var list = DATA.wizard.reqs.builderTurns;
    var parsedDocs = rq.docs.filter(function (d) { return d.status === 'parsed' || d.status === 'parsed_warn'; });
    var warnDocs = rq.docs.filter(function (d) { return d.status === 'parsed_warn'; });
    var answered = 0;
    list.forEach(function (t) { if (rq.answers[t.id]) answered++; });
    var openTurns = list.length - answered;
    var carried = (rq.answers.bt10 && rq.answers.bt10 !== 'Decide now') ? 1 : 0;
    if (!parsedDocs.length && !answered) {
      rq.readiness = 'blocked';
      rq.readinessNote = 'no captures yet — attach a doc or answer the builder';
    } else if (answered === list.length && !warnDocs.length && rq.answers.bt10 === 'Decide now') {
      rq.readiness = 'ready';
      rq.readinessNote = answered + ' captures · no open questions · no warnings';
    } else {
      rq.readiness = 'ready_with_warnings';
      var bits = [(parsedDocs.length + answered) + ' capture' + (parsedDocs.length + answered === 1 ? '' : 's')];
      var openN = openTurns + carried;
      if (openN) bits.push(openN + ' open question' + (openN === 1 ? '' : 's'));
      if (warnDocs.length) bits.push(warnDocs.length + ' parse warning' + (warnDocs.length === 1 ? '' : 's'));
      rq.readinessNote = bits.join(' · ');
    }
  }
  /* derived dependency locks — "locked" is a presentation of not_started with unmet
     depends_on edges, never a persisted card state (PWIZ-013 vocabulary intact) */
  function topicLocked(t) {
    return !!t && t.state === 'not_started' && (t.depends_on || []).some(function (id) {
      var dep = S.wizard.topics[id];
      return dep && dep.state !== 'ready';
    });
  }
  function evalUnlocks() {
    Object.keys(S.wizard.topics).forEach(function (k) {
      var t = S.wizard.topics[k];
      if (topicLocked(t)) { t._wasLocked = true; return; }
      if (t._wasLocked) {
        t._wasLocked = false;
        if (t.unlockedState && t.state === 'not_started') t.state = t.unlockedState;
        emit('wizard.topic', { topic: t, unlocked: true });
      }
    });
  }
  var wizardFacade = {
    openTopic: function (id) {
      var t = S.wizard.topics[id];
      if (!t) return { toast: 'Unknown topic.' };
      S.wizard.activeTopic = id;
      if (topicLocked(t)) {
        /* view-only while locked: no promotion to active, no interview seeding */
        logBeat('wizard.openTopic', { id: id, locked: true });
        emit('wizard.topic', { topic: t, opened: true, locked: true });
        return { ok: true };
      }
      if (t.state === 'not_started') { t.state = 'active'; }
      if (t.thread && !t.thread.length && t.intro) {
        var firstOpen = null;
        t.questions.forEach(function (x) { if (!firstOpen && !x.answer) firstOpen = x; });
        if (firstOpen) {
          t.thread.push({ role: 'agent', text: t.intro });
          t.thread.push({ role: 'agent', qid: firstOpen.id, question: true, text: firstOpen.text });
        }
      }
      emit('wizard.topic', { topic: t, opened: true });
      logBeat('wizard.openTopic', { id: id });
      return { ok: true };
    },
    uploadDoc: function (id) {
      var rq = S.wizard.reqs;
      var spec = null;
      if (id) {
        DATA.wizard.reqs.sampleDocs.forEach(function (d) { if (d.id === id) spec = d; });
        if (!spec) return { toast: 'That file is outside the demo intake set.' };
        if (rq.docs.some(function (x) { return x.id === spec.id; })) return { disabled: true, reason: 'already_done' };
      } else {
        /* a drop of anything attaches the next un-attached sample doc */
        DATA.wizard.reqs.sampleDocs.forEach(function (d) {
          if (spec) return;
          if (!rq.docs.some(function (x) { return x.id === d.id; })) spec = d;
        });
        if (!spec) return { disabled: true, reason: 'already_done' };
      }
      var doc = { id: spec.id, name: spec.name, kind: spec.kind, size: spec.size, hash: spec.hash,
                  atoms: spec.atoms, warnings: spec.warnings || null, receipt: spec.receipt,
                  status: 'preflight', security: 'untrusted' };
      rq.docs.push(doc);
      logBeat('wizard.uploadDoc', { id: doc.id });
      reqsEmit();
      var live = function () { return S.wizard.reqs.docs.indexOf(doc) !== -1; };
      var finish = function () {
        if (!live()) return;
        doc.status = spec.finalStatus;
        doc.security = 'cleared';
        reqsFill(spec.fills, 'reconciled from ' + spec.name);
        reqsReadiness();
        reqsEmit();
      };
      if (S.ffwd || reducedMotion()) { finish(); return { ok: true }; }
      var sp = S.clock.speed || 1;
      setTimeout(function () { if (!live() || doc.status !== 'preflight') return; doc.status = 'extracting'; reqsEmit(); }, 900 / sp);
      setTimeout(function () { if (!live() || doc.security !== 'untrusted') return; doc.security = 'cleared'; reqsEmit(); }, 1700 / sp);
      setTimeout(finish, 2600 / sp);
      return { ok: true };
    },
    prdChat: function (turnId, value) {
      var rq = S.wizard.reqs;
      var list = DATA.wizard.reqs.builderTurns;
      var idx = -1;
      list.forEach(function (t, i) { if (t.id === turnId) idx = i; });
      if (idx === -1) idx = rq.turnIdx;
      var turn = list[idx];
      if (!turn) return { toast: 'The PRD builder has no open question right now.' };
      if (rq.answers[turn.id]) return { disabled: true, reason: 'already_done' };
      value = String(value == null ? '' : value).trim() || (turn.chips && turn.chips[0]) || '';
      if (!rq.turns.some(function (en) { return en.role === 'agent' && en.turnId === turn.id && !en.ack; })) {
        rq.turns.push({ role: 'agent', turnId: turn.id, text: turn.agent });
      }
      rq.turns.push({ role: 'user', turnId: turn.id, text: value });
      rq.answers[turn.id] = value;
      var ack = (turn.ackAlt && value === 'Decide now') ? turn.ackAlt : turn.ack;
      rq.turns.push({ role: 'agent', turnId: turn.id, ack: true, text: ack });
      reqsFill(turn.fills, 'from builder turn ' + (idx + 1));
      if (idx >= rq.turnIdx) rq.turnIdx = idx + 1;
      var next = list[rq.turnIdx];
      if (next && !rq.answers[next.id] && !rq.turns.some(function (en) { return en.role === 'agent' && en.turnId === next.id && !en.ack; })) {
        rq.turns.push({ role: 'agent', turnId: next.id, text: next.agent });
      }
      reqsReadiness();
      logBeat('wizard.prdChat', { turn: turn.id, value: value.slice(0, 60) });
      reqsEmit();
      return { ok: true };
    },
    approvePrd: function () {
      var rq = S.wizard.reqs;
      if (rq.prd.approved) return { disabled: true, reason: 'already_done' };
      if (rq.readiness === 'blocked') return { disabled: true, reason: 'blocked_by_gate' };
      rq.prd.approved = true;
      rq.prd.packId = DATA.wizard.reqs.prd.packId;
      rq.prd.version = DATA.wizard.reqs.prd.version;
      logBeat('wizard.approvePrd', { packId: rq.prd.packId, version: rq.prd.version });
      reqsEmit();
      say('Approved PRD Pack v1 sealed — immutable handoff snapshot created.');
      return { ok: true };
    },
    enterWorkspace: function () {
      S.wizard.stage = 'interview';
      evalUnlocks(); /* re-derive locks on entry (chapter jumps, replays) */
      if (!S.wizard._ambient) {
        S.wizard._ambient = true;
        trackStart('wizard-ambient', WIZ_BEATS);
      }
      logBeat('wizard.enterWorkspace', {});
      emit('wizard.state', wizardSnapshot());
      return { ok: true };
    },
    answer: function (topicId, qId, value) {
      var t = S.wizard.topics[topicId];
      if (!t) return { toast: 'Unknown topic.' };
      if (topicLocked(t)) return { disabled: true, reason: 'blocked_by_gate' };
      var q = null;
      t.questions.forEach(function (x) { if (q) return; if (qId ? x.id === qId : !x.answer) q = x; });
      if (!q) return { toast: 'No open question on that topic.' };
      if (q.answer && t.state === 'ready') return { disabled: true, reason: 'already_done' };
      q.answer = value || q.chips[0];
      if (!t.thread) t.thread = [];
      t.thread.push({ role: 'user', qid: q.id, text: q.answer });
      t.thread.push({ role: 'note', qid: q.id, text: 'writing decision to the planning ledger…' });
      logBeat('wizard.answer', { topic: topicId, q: q.id, value: q.answer });
      var open = null;
      t.questions.forEach(function (x) { if (!open && !x.answer) open = x; });
      if (open) {
        /* more product calls left on this topic — ack and ask the next one */
        t.thread.push({ role: 'agent', qid: q.id, text: 'Recorded — pinned to the topic ledger.' });
        t.thread.push({ role: 'agent', qid: open.id, question: true, text: open.text });
        emit('wizard.topic', { topic: t, answered: q });
        return { ok: true };
      }
      t.thread.push({ role: 'agent', qid: q.id, text: 'Recorded — that was the last open call. Compiling and auditing this topic now.' });
      emit('wizard.topic', { topic: t, answered: q });
      var closing = function () {
        t.thread.push({ role: 'agent', text: 'Compiled and audited — this topic is Ready.' });
      };
      var steps = [
        [0,    { id: topicId, state: 'ledger_syncing', progress: 'writing decision to the planning ledger' }],
        [1500, { id: topicId, state: 'compiling', progress: 'recompiling Topic Plan Draft' }],
        [3500, { id: topicId, state: 'auditing', progress: 'audit pass 1 of 2 · 0 findings' }],
        [6000, { id: topicId, state: 'ready', progress: null }]
      ];
      if (S.ffwd || reducedMotion()) { closing(); t.state = 'ready'; t.progress = null; emit('wizard.topic', { topic: t }); evalUnlocks(); }
      else steps.forEach(function (st) {
        setTimeout(function () {
          if (st[1].state === 'ready') closing();
          M['wizard.topicState'](st[1], false);
        }, st[0] / (S.clock.speed || 1));
      });
      return { ok: true };
    },
    acceptTopic: function (id) {
      var t = S.wizard.topics[id];
      if (!t) return { toast: 'Unknown topic.' };
      if (t.accepted) return { disabled: true, reason: 'already_done' };
      if (t.state !== 'ready') return { toast: '"' + t.title + '" is still ' + t.state + ' — it can be accepted once it is Ready.' };
      t.accepted = true;
      emit('wizard.topic', { topic: t, accepted: true });
      logBeat('wizard.acceptTopic', { id: id });
      return { ok: true };
    },
    /* selection send-back — scope is a topic id or 'prd'. Topic scope injects a
       revision request into the topic thread and replays the compile/audit
       micro-track, bumping the Topic Plan Draft version. PRD scope routes into
       the open builder turn when one exists; otherwise (P4 fallback) it bumps
       reqs.revisions and records a durable ledger-note in the projection data. */
    sendBack: function (scope, secId, excerpt) {
      excerpt = String(excerpt == null ? '' : excerpt);
      if (scope === 'prd') {
        var rq = S.wizard.reqs;
        var listT = DATA.wizard.reqs.builderTurns;
        var cur = listT[rq.turnIdx];
        rq.revisions = (rq.revisions || 0) + 1;
        if (cur && !rq.answers[cur.id]) {
          logBeat('wizard.sendBack', { topic: 'prd', sec: secId || null, routed: 'chat' });
          return wizardFacade.prdChat(cur.id, 'Revise: "' + excerpt.slice(0, 90) + '" — tighten this and re-check acceptance.');
        }
        rq.ledgerNotes = rq.ledgerNotes || [];
        rq.ledgerNotes.push({ id: 'rn-' + (rq.ledgerNotes.length + 1), sec: secId || null,
          text: 'Revision request recorded — "' + excerpt.slice(0, 90) + '"' });
        rq.annotations.push({ id: 'ann-' + (rq.annotations.length + 1), sec: secId || null,
          kind: 'revision', excerpt: excerpt.slice(0, 120), status: 'open' });
        logBeat('wizard.sendBack', { topic: 'prd', sec: secId || null, fallback: true });
        reqsEmit();
        return { ok: true, toast: 'Revision request recorded — pinned to the PRD ledger.' };
      }
      var t = S.wizard.topics[scope];
      if (!t) return { toast: 'Unknown topic.' };
      if (topicLocked(t)) return { disabled: true, reason: 'blocked_by_gate' };
      if (t._revising) return { disabled: true, reason: 'busy' };
      if (!t.thread) t.thread = [];
      t.thread.push({ role: 'user', text: 'Revise: "' + excerpt.slice(0, 90) + '" — tighten this and re-check acceptance.' });
      t.thread.push({ role: 'note', text: 'writing revision request to the planning ledger…' });
      t.thread.push({ role: 'agent', text: 'Reworking that section — recompiling the Topic Plan Draft.' });
      S.wizard.activeTopic = scope;
      t._revising = true;
      logBeat('wizard.sendBack', { topic: scope, sec: secId || null });
      emit('wizard.topic', { topic: t, answered: { id: secId || null } }); /* reuses the typing-dots beat */
      var finishRev = function () {
        t.state = 'ready';
        t.progress = null;
        t._revising = false;
        if (t.draft) { t.draft.version = (t.draft.version || 1) + 1; t.draft.freshSec = secId || null; }
        t.thread.push({ role: 'agent', text: 'Draft revised — section updated.' });
        emit('wizard.topic', { topic: t });
        evalUnlocks();
      };
      if (S.ffwd || reducedMotion()) { finishRev(); return { ok: true }; }
      var revSteps = [
        [0, { state: 'compiling', progress: 'recompiling Topic Plan Draft' }],
        [1800, { state: 'auditing', progress: 'audit pass 1 of 1 · revision scope only' }],
        [3600, null] /* ready + version bump */
      ];
      revSteps.forEach(function (st) {
        setTimeout(function () {
          if (!st[1]) { finishRev(); return; }
          t.state = st[1].state;
          t.progress = st[1].progress;
          emit('wizard.topic', { topic: t });
        }, st[0] / (S.clock.speed || 1));
      });
      return { ok: true };
    },
    /* shared annotation system — scope: topic id | 'prd'; kind: 'annotation' | 'comment' */
    annotate: function (scope, secId, excerpt, kind) {
      var list = scope === 'prd' ? S.wizard.reqs.annotations : (S.wizard.topics[scope] || {}).annotations;
      if (!list) return { toast: 'Nothing to annotate.' };
      list.push({ id: 'ann-' + (list.length + 1), sec: secId || null, kind: kind || 'annotation',
                  excerpt: String(excerpt == null ? '' : excerpt).slice(0, 120), status: 'open' });
      logBeat('wizard.annotate', { scope: scope, sec: secId || null, kind: kind || 'annotation' });
      if (scope === 'prd') reqsEmit();
      else emit('wizard.topic', { topic: S.wizard.topics[scope] });
      return { ok: true };
    },
    integrate: function () {
      if (S.wizard.pack) return { disabled: true, reason: 'already_done' };
      var lockedTs = Object.keys(S.wizard.topics).map(function (k) { return S.wizard.topics[k]; }).filter(topicLocked);
      if (lockedTs.length) {
        var lt = lockedTs[0];
        var depTitles = (lt.depends_on || []).filter(function (id) {
          var d0 = S.wizard.topics[id];
          return d0 && d0.state !== 'ready';
        }).map(function (id) { return S.wizard.topics[id].title; });
        return { toast: '"' + lt.title + '" is still locked — finish ' + (depTitles.join(' and ') || 'its dependencies') + ' first.' };
      }
      var notReady = Object.keys(S.wizard.topics).map(function (k) { return S.wizard.topics[k]; }).filter(function (t) { return t.state !== 'ready'; });
      if (notReady.length) {
        var t8 = notReady.find(function (t) { return t.id === 't8'; });
        if (t8 && !t8.questions[0].answer) {
          return { toast: 'Topic 8 (Deployment & backups) still needs the storage decision — answer "Where should images and backups live?" first.' };
        }
        /* silently satisfy timers still running */
        notReady.forEach(function (t) { t.state = 'ready'; t.progress = null; emit('wizard.topic', { topic: t }); });
      }
      S.wizard.pack = { planUnits: DATA.run.planUnits, findingsRepaired: 2, hashes: S.wizard.hashes };
      S.wizard.stage = 'final_review';
      logBeat('wizard.integrate', {});
      emit('wizard.pack', { pack: S.wizard.pack });
      say('Final Plan Pack assembled — audit repaired 2 findings, zero left open');
      return { ok: true };
    },
    approveAndBuild: function () {
      if (S.wizard.approved) return { disabled: true, reason: 'already_done' };
      if (!S.wizard.pack) {
        var r = wizardFacade.integrate();
        if (r && r.toast) return r;
      }
      if (S.wizard.replayed && (S.story.c1_wizard_done || S.run.id || S.run.stage !== 'idle')) { /* replay landing: plan already shipped as pcr-47 — re-approve the wizard slice only, never touch the live run */
        S.wizard.approved = true; S.wizard.stage = 'approved';
        logBeat('wizard.replayComplete', { receipt: 'approval_cas_receipt-4e91d0', runId: S.run.id || 'pcr-47' });
        emit('wizard.approved', { receipt: 'approval_cas_receipt-4e91d0', runId: S.run.id || 'pcr-47', replay: true });
        say(guard.reason('already_done') + ' This planning run already shipped as pcr-47 — jumping to the live run.');
        try { if (window.PM_PAGES) PM_PAGES.go('orchestrator', 'plan_compile'); } catch (e) {}
        return { ok: true };
      }
      /* CAS over displayed currentness values — always current in the demo */
      S.wizard.approved = true;
      S.wizard.stage = 'approved';
      S.story.c1_wizard_done = true;
      S.run.id = 'pcr-47';
      S.run.focusedRunId = 'pcr-47';
      setStage('pending-launch');
      logBeat('wizard.approveAndBuild', { cas: 'rev 12 / v9 / 8f3a91 / c41d20', receipt: 'approval_cas_receipt-4e91d0' });
      emit('wizard.approved', { receipt: 'approval_cas_receipt-4e91d0', runId: 'pcr-47' });
      say('PlanApproved ✓ — PlanCompileRun pcr-47 bound');
      try { if (window.PM_PAGES) PM_PAGES.go('orchestrator', 'plan_compile'); } catch (e) {}
      setTimeout(function () { runFacade.bind(); }, 1200 / (S.clock.speed || 1));
      return { ok: true };
    },
    replay: function () {
      /* Rewind ONLY the wizard slice back to pristine; ambient run/git/docker/usage state untouched (run #47 stays live).
         Churn does NOT restart here — it re-arms on the next enterWorkspace. */
      S.wizard.replayed = true;
      S.wizard.pack = null; S.wizard.approved = false;
      S.wizard.stage = 'interview'; S.wizard.activeTopic = null;
      S.wizard.reqs = pristineReqs();
      S.wizard._ambient = false;
      seedWizardTopics(); /* single source: depends_on, drafts, annotations, _wasLocked all reseed */
      trackKill('wizard-ambient');
      logBeat('wizard.replay', {});
      emit('wizard.replay', { runId: S.run.id || 'pcr-47' });
      emit('wizard.state', wizardSnapshot());
      reqsEmit();
      return { ok: true };
    }
  };

  /* ================= git facade ================= */
  function prChecksMicroTrack() {
    var pr = S.git.pr;
    if (!pr) return;
    pr.checks.forEach(function (ck, i) {
      setTimeout(function () { ck.state = 'running'; emit('git.pr', pr); }, ((i * 10000) + 900) / (S.clock.speed || 1));
      setTimeout(function () {
        ck.state = 'success';
        emit('git.pr', pr);
        if (pr.checks.every(function (c) { return c.state === 'success'; })) say('All 3 checks green on PR #88 — Merge is unlocked');
      }, ((i + 1) * 10000) / (S.clock.speed || 1));
    });
  }
  var gitFacade = {
    stage: function (f) {
      if (!f) return { toast: 'Pick a file to stage.' };
      var idx = S.git.unstaged.indexOf(f);
      if (idx === -1) idx = S.git.untracked.indexOf(f);
      if (idx === -1) {
        if (S.git.staged.indexOf(f) !== -1) return { disabled: true, reason: 'already_done' };
        return { toast: f + ' has no local changes.' };
      }
      S.git.unstaged = S.git.unstaged.filter(function (x) { return x !== f; });
      S.git.untracked = S.git.untracked.filter(function (x) { return x !== f; });
      S.git.staged.push(f);
      logBeat('git.stage', { f: f });
      emit('git.changed', { staged: S.git.staged, unstaged: S.git.unstaged });
      return { ok: true };
    },
    commit: function (msgOrAI) {
      if (!S.git.staged.length) return { toast: 'Nothing staged — stage a change first.' };
      if (S.git.aiCommitBusy) return { disabled: true, reason: 'busy' };
      var doCommit = function (msg) {
        S.git.commits.unshift({ sha: Math.random().toString(16).slice(2, 9), msg: msg, files: S.git.staged.slice() });
        S.git.staged = [];
        S.git.aiCommitBusy = false;
        logBeat('git.commit', { msg: msg });
        emit('git.commit', S.git.commits[0]);
        emit('git.changed', { staged: S.git.staged, unstaged: S.git.unstaged });
        say('Committed: ' + msg);
      };
      if (!msgOrAI || msgOrAI === 'ai') {
        S.git.aiCommitBusy = true;
        emit('git.ai', { state: 'thinking' });
        setTimeout(function () {
          emit('git.ai', { state: 'done' });
          doCommit('feat(images): wire image-processing package into upload flow');
        }, 1200 / (S.clock.speed || 1));
        return { ok: true };
      }
      doCommit(String(msgOrAI));
      return { ok: true };
    },
    createPR: function () {
      if (S.git.pr) return { disabled: true, reason: 'already_done' };
      if (!S.git.auth.signedIn) return { disabled: true, reason: 'not_signed_in' };
      if (!S.story.c3_run_complete) {
        return { toast: 'Run #47 is still executing — Create PR unlocks when lane-d completes. (Run #46 already has checks passing if you want to poke at a merged flow.)' };
      }
      S.git.pr = { id: 'pr-88', branch: 'orch/lane-d-infra', title: 'Tastebook v1.2 — image processing + import hardening',
        state: 'open', checks: [{ id: 'build', state: 'queued' }, { id: 'test', state: 'queued' }, { id: 'lint', state: 'queued' }] };
      logBeat('git.createPR', { id: 'pr-88' });
      emit('git.pr', S.git.pr);
      say('PR #88 opened from orch/lane-d-infra — 3 checks queued');
      prChecksMicroTrack();
      return { ok: true };
    },
    mergePR: function () {
      var pr = S.git.pr;
      if (!pr) return { toast: 'No PR yet — Create PR appears once run #47 completes.' };
      if (pr.state === 'merged') return { disabled: true, reason: 'already_done' };
      if (!pr.checks.every(function (c) { return c.state === 'success'; })) {
        return { toast: 'Checks are still running — Merge unlocks when all three pass (~10s each).' };
      }
      pr.state = 'merged';
      S.story.c4_pr_merged = true;
      logBeat('git.mergePR', { id: pr.id });
      emit('git.pr', pr);
      say('PR #88 merged into main — Docker publish chain is next');
      return { ok: true };
    },
    rerunWorkflow: function (id) {
      var run = null;
      S.git.runs.forEach(function (r) { if (r.id === id || (!id && r.status === 'failed')) run = run || r; });
      if (!run) return { toast: 'No workflow run to rerun.' };
      if (run.status === 'success') return { disabled: true, reason: 'already_done' };
      run.status = 'queued';
      emit('git.actions', { run: run });
      logBeat('git.rerunWorkflow', { id: run.id });
      setTimeout(function () { run.status = 'running'; emit('git.actions', { run: run }); }, 1000 / (S.clock.speed || 1));
      setTimeout(function () {
        run.status = 'success'; delete run.failedStep;
        emit('git.actions', { run: run });
        say('Workflow ' + run.id + ' is green — cargo test passed on rerun');
      }, 8000 / (S.clock.speed || 1));
      return { ok: true };
    },
    deviceLogin: function () {
      if (S.git.device && S.git.device.state === 'polling') return { disabled: true, reason: 'busy' };
      S.git.device = { state: 'code', code: 'ABCD-1234', uri: 'github.com/login/device', scopes: ['repo', 'read:user', 'user:email', 'workflow'] };
      emit('git.auth', S.git.device);
      say('Device code ABCD-1234 — enter it at github.com/login/device');
      S.git.device.state = 'polling';
      var polls = 0;
      var iv = setInterval(function () {
        polls++;
        emit('git.auth', { state: 'polling', tick: polls });
        if (polls >= 3) {
          clearInterval(iv);
          S.git.device = { state: 'success' };
          S.git.auth.signedIn = true;
          S.git.auth.scopes = ['repo', 'read:user', 'user:email', 'workflow'];
          emit('git.auth', { state: 'success', scopes: S.git.auth.scopes });
          say('GitHub connected — workflow scope granted (requested = effective: jared-dev)');
        }
      }, 2000 / (S.clock.speed || 1));
      logBeat('git.deviceLogin', {});
      return { ok: true };
    }
  };

  /* ================= docker facade ================= */
  function findContainer(id) {
    for (var i = 0; i < S.docker.containers.length; i++) {
      var c = S.docker.containers[i];
      if (c.id === id || c.name === id) return c;
    }
    return null;
  }
  var dockerFacade = {
    start: function (id) {
      var c = findContainer(id);
      if (!c) return { toast: 'Unknown container.' };
      if (c.state === 'running') return { disabled: true, reason: 'already_done' };
      c.state = 'running'; c.health = 'healthy'; delete c.exitCode;
      logBeat('docker.start', { id: c.id });
      emit('docker.container', { container: c, all: S.docker.containers });
      say(c.name + ' started');
      return { ok: true };
    },
    stop: function (id) {
      var c = findContainer(id);
      if (!c) return { toast: 'Unknown container.' };
      if (c.state === 'exited') return { disabled: true, reason: 'already_done' };
      c.state = 'exited'; c.exitCode = 0; c.health = 'none';
      logBeat('docker.stop', { id: c.id });
      emit('docker.container', { container: c, all: S.docker.containers });
      say(c.name + ' stopped');
      return { ok: true };
    },
    logs: function (id) {
      var c = findContainer(id) || S.docker.containers[0];
      logBeat('docker.logs', { id: c.id });
      emit('docker.logs', { id: c.id, name: c.name, lines: TEXT.term.dockerLogs });
      term.streamTo('ts-sess-docker', TEXT.term.dockerLogs, 300);
      say('Streaming ' + c.name + ' logs to the Docker terminal group');
      return { ok: true };
    },
    composeUp: function () {
      if (S.docker.compose.up) return { disabled: true, reason: 'already_done' };
      logBeat('docker.composeUp', {});
      term.streamTo('ts-sess-docker', TEXT.term.composeUp, 1400);
      DATA.docker.composeServices.forEach(function (svc, i) {
        setTimeout(function () {
          S.docker.compose.services[svc] = 'running';
          emit('docker.compose', { service: svc, state: 'running', services: S.docker.compose.services });
        }, ((i + 1) * 1500) / (S.clock.speed || 1));
      });
      setTimeout(function () {
        S.docker.compose.up = true;
        emit('docker.compose', { up: true, services: S.docker.compose.services });
        term.ports([
          { port: 5173, process: 'tastebook-web (vite)', session: 'ts-sess-gamma' },
          { port: 8080, process: 'tastebook-api (axum)', session: 'ts-sess-alpha' },
          { port: 54112, process: 'debug DAP', session: null, note: '1 session / project' }
        ]);
        say('Compose stack green — web :5173, API :8080');
      }, (DATA.docker.composeServices.length * 1500 + 400) / (S.clock.speed || 1));
      return { ok: true };
    },
    build: function () {
      var pc = S.docker.publishChain;
      if (pc.built) return { disabled: true, reason: 'already_done' };
      logBeat('docker.build', { tag: pc.tag });
      emit('docker.build', { state: 'building' });
      term.streamTo('ts-sess-docker', TEXT.term.buildkit, 600);
      setTimeout(function () {
        pc.built = true;
        pc.digest = 'sha256:9c1f4e2ab7d05561f0';
        if (pc.template === 'ready_to_push' || pc.template === 'clean') pc.template = 'dirty';
        emit('docker.build', { state: 'built', digest: pc.digest });
        emit('docker.chain', pc);
        say('Image built — digest sha256:9c1f… · template repo is now dirty');
      }, 6200 / (S.clock.speed || 1));
      return { ok: true };
    },
    push: function () {
      var pc = S.docker.publishChain;
      if (!pc.built) return { toast: 'Build the image first — the publish chain starts at Build.' };
      if (pc.pushedImage) return { disabled: true, reason: 'already_done' };
      logBeat('docker.push', { repo: DATA.docker.hubRepo, tag: pc.tag });
      emit('docker.chain', pc);
      setTimeout(function () {
        pc.pushedImage = true;
        emit('docker.chain', pc);
        say('Pushed ' + DATA.docker.hubRepo + ':' + pc.tag + ' — digest receipt recorded');
      }, 2600 / (S.clock.speed || 1));
      return { ok: true };
    },
    templateCommit: function () {
      var pc = S.docker.publishChain;
      if (pc.template === 'ready_to_push' || pc.template === 'committed') return { disabled: true, reason: 'already_done' };
      if (pc.template === 'pushed') return { disabled: true, reason: 'already_done' };
      pc.template = 'committed';
      emit('docker.chain', pc);
      logBeat('docker.templateCommit', {});
      setTimeout(function () {
        pc.template = 'ready_to_push';
        emit('docker.chain', pc);
        say('unraid-template.xml committed — template repo is ready_to_push');
      }, 1200 / (S.clock.speed || 1));
      return { ok: true };
    },
    templatePush: function () {
      var pc = S.docker.publishChain;
      if (pc.template === 'pushed') return { disabled: true, reason: 'already_done' };
      if (pc.template !== 'ready_to_push') return { toast: 'Template repo is ' + pc.template + ' — commit the template first.' };
      pc.template = 'pushed';
      pc.pushedTemplate = true;
      S.story.c5_published = true;
      logBeat('docker.templatePush', {});
      emit('docker.chain', pc);
      say('Unraid template pushed — publish chain complete end to end');
      return { ok: true };
    }
  };

  /* ================= usage facade ================= */
  var usageFacade = {
    export: function () {
      logBeat('usage.export', {});
      say('Ledger exported: tastebook-usage.json (' + S.usage.ledger.length + ' rows, demo scope)');
      return { ok: true };
    },
    configureWidget: function (id, opts) {
      if (!id) return { toast: 'Which widget?' };
      S.usage.widgets[id] = Object.assign({}, S.usage.widgets[id] || {}, opts || {});
      emit('usage.widget', { id: id, opts: S.usage.widgets[id] });
      logBeat('usage.configureWidget', { id: id });
      return { ok: true };
    }
  };

  /* ================= files facade ================= */
  function fileBase(path) { return path.split('/').pop(); }
  var filesFacade = {
    open: function (path) {
      if (!path) return { toast: 'Pick a file.' };
      if (!TEXT.files[path]) {
        /* accept basename too */
        var hit = null;
        DATA.files.forEach(function (f) { if (fileBase(f.path) === path) hit = f.path; });
        if (hit) path = hit; else return { toast: path + ' is outside the demo tree.' };
      }
      if (S.files.openTabs.indexOf(path) === -1) S.files.openTabs.push(path);
      S.files.activeTab = path;
      logBeat('files.open', { path: path });
      emit('files.open', { path: path, tabs: S.files.openTabs });
      /* best-effort render into editor pane 1 */
      try {
        /* unhide: opening a file always re-shows pane1 (and the editor view);
           the reopen helper also recomputes the split-resizer visibility */
        if (window.pm6ReopenEditorPane) {
          window.pm6ReopenEditorPane('editorPane1');
        } else {
          var edv = byId('editorView');
          if (edv) edv.style.display = 'flex';
          var ep1 = byId('editorPane1');
          if (ep1) ep1.style.display = 'flex';
        }
        var tabs = document.querySelector('#editorPane1 .editor-tabs');
        var gutter = byId('pane1Gutter'), code = byId('pane1Code');
        if (tabs && gutter && code) {
          if (window.PM6_RENDER_EDITOR_TABS) {
            /* pm6-js-dashboard owns the pane1 strip (close X, overflow chip):
               it rebuilds the tab DOM from S.files.openTabs / activeTab */
            window.PM6_RENDER_EDITOR_TABS();
          } else {
            /* legacy inline tab build kept as fallback */
            var base = fileBase(path);
            var tab = tabs.querySelector('.tab[data-file="' + base + '"]');
            if (!tab) {
              tab = document.createElement('span');
              tab.className = 'tab';
              tab.setAttribute('data-file', base);
              tab.textContent = base;
              tab.onclick = function () { filesFacade.open(path); };
              tabs.appendChild(tab);
            }
            tabs.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
          }
          /* rich shared renderer (pm6-js-dashboard) when present; inline fallback
             below handles BOTH data shapes: plain array or { lines, diffs } */
          var rendered = false;
          if (window.PM6_RENDER_FILE) {
            try { rendered = !!window.PM6_RENDER_FILE(path, 'pane1'); } catch (e1) { rendered = false; }
          }
          if (!rendered) {
            var body = TEXT.files[path];
            var lines = (body && body.lines) ? body.lines : body;
            gutter.innerHTML = '';
            code.innerHTML = '';
            lines.forEach(function (lineHtml, i) {
              var g = document.createElement('div');
              g.className = 'gutter-line';
              var num = document.createElement('span');
              num.className = 'gutter-line-num';
              num.textContent = i + 1;
              g.appendChild(num);
              gutter.appendChild(g);
              var span = document.createElement('span');
              span.className = 'code-line';
              span.innerHTML = '<span class="diff-prefix">&nbsp;</span>' + (lineHtml || '&nbsp;');
              code.appendChild(span);
            });
          }
        } else {
          say('Opened ' + path);
        }
      } catch (e) { say('Opened ' + path); }
      return { ok: true };
    },
    close: function (path) {
      if (!path) return { toast: 'Pick a file.' };
      /* pm6-js-dashboard owns tab bookkeeping + neighbor activation when
         present (it emits files.close itself) */
      if (window.PM6_CLOSE_EDITOR_TAB) {
        var r = window.PM6_CLOSE_EDITOR_TAB(path);
        if (r && r.ok) logBeat('files.close', { path: path });
        return r;
      }
      /* fallback: state-only bookkeeping */
      var i = S.files.openTabs.indexOf(path);
      if (i === -1) return { disabled: true, reason: 'already_done' };
      S.files.openTabs.splice(i, 1);
      if (S.files.activeTab === path) S.files.activeTab = S.files.openTabs[i - 1] || S.files.openTabs[i] || null;
      logBeat('files.close', { path: path });
      emit('files.close', { path: path, tabs: S.files.openTabs });
      return { ok: true };
    }
  };

  /* ================= dash facade ================= */
  var dashFacade = {
    addWidget: function (kind) {
      if (!kind) return { toast: 'Pick a widget from the catalog.' };
      if (S.dash.widgets.indexOf(kind) !== -1) return { disabled: true, reason: 'already_done' };
      var known = DATA.dash.catalog.some(function (c) { return c.kind === kind; });
      if (!known) return { disabled: true, reason: 'unsupported' };
      S.dash.widgets.push(kind);
      logBeat('dash.addWidget', { kind: kind });
      emit('dash.widget', { action: 'add', kind: kind, widgets: S.dash.widgets });
      say('Widget added: ' + kind);
      return { ok: true };
    },
    catalog: function () { return DATA.dash.catalog.slice(); }
  };

  /* ================= clock + ambient ticking ================= */
  var tickCount = 0;
  function clockTick() {
    if (!S.clock.playing) return;
    var dt = 250 * (S.clock.speed || 1);
    S.clock.t += dt;
    tickCount++;
    trackTick(dt);
    /* usage: cooldown + slow quota drift every ~2s of virtual time */
    if (tickCount % Math.max(1, Math.round(8 / (S.clock.speed || 1))) === 0) {
      S.usage.cooldownSec = Math.max(0, S.usage.cooldownSec - 2);
      var q0 = S.usage.quotas[0];
      if (q0.pct < 82) q0.pct = Math.round((q0.pct + 0.08) * 100) / 100;
      if (!S.usage.alert80Fired && q0.pct >= 80) {
        S.usage.alert80Fired = true;
        q0.level = 'critical';
        emit('usage.alert', { kind: 'threshold', quota: q0.id, pct: q0.pct,
          suggestion: 'Shift auditor traffic to Codex or wait out the cooldown (' + fmtClock(S.usage.cooldownSec) + ').' });
        pushCta({ id: 'cta-usage', kind: 'warning', severity: 'attention_required', title: 'Claude 5h window at 80%',
          body: 'Cooldown ' + fmtClock(S.usage.cooldownSec) + '. Suggested: reroute auditor turns or pause low-priority lanes.', primary: 'page.go', primaryArg: 'usage' });
        say('Usage warning: Claude 5h window crossed 80%');
      }
      emit('usage.tick', usageSnapshot());
    }
  }
  var visPaused = false;
  function onVisibility() {
    try {
      if (document.hidden) {
        visPaused = S.clock.playing;
        S.clock.playing = false;
      } else if (visPaused) {
        S.clock.playing = true;
        visPaused = false;
      }
    } catch (e) {}
  }

  /* ================= dev panel (Ctrl+Shift+D) ================= */
  var devEl = null, devTimer = null;
  function devBtn(label, title) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pm6-dev-btn';
    b.textContent = label;
    if (title) b.title = title;
    b.style.cssText = 'font:inherit;font-size:10px;padding:2px 7px;border:1px solid var(--border-light);border-radius:5px;background:var(--surface);color:var(--text-primary);cursor:pointer;';
    return b;
  }
  function devRow() {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:6px;';
    return r;
  }
  function buildDevPanel() {
    devEl = document.createElement('div');
    devEl.className = 'pm6-dev-panel';
    devEl.style.cssText = 'position:fixed;right:14px;bottom:40px;z-index:100000;width:270px;padding:10px 12px;' +
      'background:var(--surface-elevated);border:1px solid var(--border-light);border-radius:10px;box-shadow:var(--shadow);' +
      'font-family:var(--body-font);font-size:11px;color:var(--text-primary);';
    var head = document.createElement('div');
    head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:11px;';
    head.textContent = 'Demo director';
    var close = devBtn('✕', 'Close (Ctrl+Shift+D)');
    close.onclick = toggleDevPanel;
    head.appendChild(close);
    devEl.appendChild(head);

    var r1 = devRow();
    var play = devBtn('', 'Play / pause the virtual clock');
    var speed = devBtn('', 'Cycle speed 1x / 2x / 4x');
    var tOut = document.createElement('span');
    tOut.style.cssText = 'margin-left:auto;color:var(--text-muted);font-variant-numeric:tabular-nums;';
    play.onclick = function () { S.clock.playing = !S.clock.playing; refresh(); };
    speed.onclick = function () { S.clock.speed = S.clock.speed >= 4 ? 1 : S.clock.speed * 2; refresh(); };
    r1.appendChild(play); r1.appendChild(speed); r1.appendChild(tOut);
    devEl.appendChild(r1);

    var r2 = devRow();
    var jumps = [['c1', 'c1_wizard_done', 'Wizard done + plan approved'], ['c2', 'c2_compiled', 'Compiled, run executing'],
                 ['c3', 'c3_run_complete', 'Run #47 complete'], ['c4', 'c4_pr_merged', 'PR #88 merged'], ['c5', 'c5_published', 'Published to Unraid']];
    jumps.forEach(function (j) {
      var b = devBtn(j[0], 'Jump: ' + j[2]);
      b.onclick = function () { director.ensure(j[1]); say('Jumped to ' + j[2]); refresh(); };
      r2.appendChild(b);
    });
    devEl.appendChild(r2);

    var r3 = devRow();
    var reset = devBtn('Reset (reload)', 'Full re-init — no persistence anywhere, reload is pristine');
    reset.onclick = function () { try { location.reload(); } catch (e) {} };
    r3.appendChild(reset);
    devEl.appendChild(r3);

    var tail = document.createElement('div');
    tail.style.cssText = 'margin-top:6px;max-height:110px;overflow:auto;border-top:1px solid var(--border-light);padding-top:4px;color:var(--text-secondary);font-size:10px;line-height:1.5;';
    devEl.appendChild(tail);

    function refresh() {
      play.textContent = S.clock.playing ? 'Pause' : 'Play';
      speed.textContent = S.clock.speed + 'x';
      tOut.textContent = 't ' + (S.clock.t / 1000).toFixed(1) + 's';
      var last = LOG.slice(-8).reverse();
      tail.innerHTML = last.map(function (b) {
        return '<div><span style="color:var(--text-muted)">' + b.t.toFixed(1) + 's</span> ' + b.action + '</div>';
      }).join('') || '<div style="color:var(--text-muted)">no beats yet</div>';
    }
    devEl._refresh = refresh;
    refresh();
    document.body.appendChild(devEl);
  }
  function toggleDevPanel() {
    if (devEl && devEl.parentNode) {
      devEl.parentNode.removeChild(devEl);
      devEl = null;
      if (devTimer) { clearInterval(devTimer); devTimer = null; }
      return;
    }
    buildDevPanel();
    devTimer = setInterval(function () { if (devEl && devEl._refresh) devEl._refresh(); }, 500);
  }

  /* ================= delegated router ================= */
  function routerHandler(e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-demo-action]') : null;
    if (!el) return;
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true' || el.dataset.demoDisabled) {
      var code = el.dataset.demoReason || el.dataset.demoDisabled || 'demo_scope';
      say(guard.reason(code));
      return;
    }
    var res = guard.attempt(el.dataset.demoAction, { el: el, arg: el.dataset.demoArg, event: e });
    if (res && res.toast) say(res.toast);
    else if (res && res.disabled) say(guard.reason(res.reason));
  }
  function attachRouter() {
    if (window.__pm6DemoRouterAttached) return;
    window.__pm6DemoRouterAttached = true;
    document.addEventListener('click', routerHandler);
  }

  /* ================= action registrations ================= */
  function reg(id, fn) { actions.register(id, fn); }
  function argOf(ctx) { return ctx && ctx.arg != null ? String(ctx.arg) : ''; }
  reg('page.go', function (ctx) {
    var a = argOf(ctx).split(':');
    if (!a[0]) return { toast: 'No page given.' };
    try { PM_PAGES.go(a[0], a[1]); } catch (e) {}
    return { ok: true };
  });
  reg('wizard.open_topic', function (ctx) { return wizardFacade.openTopic(argOf(ctx)); });
  reg('wizard.answer', function (ctx) {
    var a = argOf(ctx).split('|'); /* topicId|qId|value */
    return wizardFacade.answer(a[0], a[1], a.slice(2).join('|'));
  });
  reg('wizard.accept_topic', function (ctx) { return wizardFacade.acceptTopic(argOf(ctx)); });
  reg('wizard.upload_doc', function (ctx) { return wizardFacade.uploadDoc(argOf(ctx)); });
  reg('wizard.prd_chat', function (ctx) {
    var a = argOf(ctx); /* turnId|value */
    var i = a.indexOf('|');
    if (i === -1) return wizardFacade.prdChat(a, '');
    return wizardFacade.prdChat(a.slice(0, i), a.slice(i + 1));
  });
  reg('wizard.approve_prd', function () { return wizardFacade.approvePrd(); });
  reg('wizard.enter_workspace', function () { return wizardFacade.enterWorkspace(); });
  reg('wizard.integrate', function () { return wizardFacade.integrate(); });
  reg('wizard.approve_and_build', function () { return wizardFacade.approveAndBuild(); });
  reg('wizard.replay', function () { return wizardFacade.replay(); });
  reg('run.bind', function () { return runFacade.bind(); });
  reg('run.approve_gate', function (ctx) { return runFacade.approveGate(argOf(ctx) || undefined); });
  reg('run.decline_gate', function (ctx) { return runFacade.declineGate(argOf(ctx) || undefined); });
  reg('run.safe_point_retry', function (ctx) { return runFacade.safePointRetry(argOf(ctx) || undefined); });
  reg('run.pause', function () { return runFacade.pause(); });
  reg('run.resume', function () { return runFacade.resume(); });
  reg('run.focus_run', function (ctx) { return runFacade.focusRun(argOf(ctx) || undefined); });
  reg('chat.send', function (ctx) {
    var a = argOf(ctx);
    var i = a.indexOf('|');
    if (i === -1) return chatFacade.send(null, a);
    return chatFacade.send(a.slice(0, i), a.slice(i + 1));
  });
  reg('chat.stop', function (ctx) { return chatFacade.stop(argOf(ctx) || undefined); });
  reg('chat.new_thread', function (ctx) { return chatFacade.newThread(argOf(ctx) || 'assistant'); });
  reg('git.stage', function (ctx) { return gitFacade.stage(argOf(ctx)); });
  reg('git.commit_ai', function () { return gitFacade.commit('ai'); });
  reg('git.create_pr', function () { return gitFacade.createPR(); });
  reg('git.merge_pr', function () { return gitFacade.mergePR(); });
  reg('git.rerun_workflow', function (ctx) { return gitFacade.rerunWorkflow(argOf(ctx) || undefined); });
  reg('git.device_login', function () { return gitFacade.deviceLogin(); });
  reg('docker.start', function (ctx) { return dockerFacade.start(argOf(ctx)); });
  reg('docker.stop', function (ctx) { return dockerFacade.stop(argOf(ctx)); });
  reg('docker.logs', function (ctx) { return dockerFacade.logs(argOf(ctx)); });
  reg('docker.compose_up', function () { return dockerFacade.composeUp(); });
  reg('docker.build', function () { return dockerFacade.build(); });
  reg('docker.push', function () { return dockerFacade.push(); });
  reg('docker.template_commit', function () { return dockerFacade.templateCommit(); });
  reg('docker.template_push', function () { return dockerFacade.templatePush(); });
  reg('usage.export', function () { return usageFacade.export(); });
  reg('usage.configure_widget', function (ctx) { return usageFacade.configureWidget(argOf(ctx), {}); });
  reg('files.open', function (ctx) { return filesFacade.open(argOf(ctx)); });
  reg('files.close', function (ctx) { return filesFacade.close(argOf(ctx)); });
  reg('dash.add_widget', function (ctx) { return dashFacade.addWidget(argOf(ctx)); });
  reg('web.run', function (ctx) {
    var a = argOf(ctx).split('|'); /* kind|input(|invocation_source) */
    var kind = a.shift();
    var source = a.length > 1 ? a.pop() : 'user_slash';
    return webStart(kind, a.join('|'), { source: source });
  });
  reg('web.approve', function (ctx) { return webApprove(argOf(ctx)); });
  reg('web.decline', function (ctx) { return webDecline(argOf(ctx)); });
  reg('web.cancel', function (ctx) { return webCancel(argOf(ctx)); });
  reg('web.request_again', function (ctx) { return webRequestAgain(argOf(ctx)); });
  reg('web.sources', function (ctx) {
    var op = webOp(argOf(ctx) || 'op-web-s1');
    if (!op) return { toast: 'No web operation with that id in the demo.' };
    emit('web.sources', { op: op, sources: op.sources || op.citations || [] });
    return { ok: true };
  });
  reg('web.artifact_open', function (ctx) {
    var id = argOf(ctx);
    var row = null;
    S.web.artifacts.forEach(function (a) { if (a.id === id || !id) row = row || a; });
    if (!row) return { toast: 'No Runtime Artifact rows yet — the research run writes one when it completes.' };
    emit('web.artifact', { artifact: row });
    return { ok: true };
  });
  reg('demo.toast', function (ctx) { return { toast: argOf(ctx) || 'Noted.' }; });
  reg('demo.reason', function (ctx) { return { disabled: true, reason: argOf(ctx) || 'demo_scope' }; });
  reg('demo.jump', function (ctx) { director.ensure(argOf(ctx)); return { ok: true }; });

  /* ================= PM_DEMO surface ================= */
  var PM_DEMO = {
    version: 'pm6-1.0',
    state: S,
    log: LOG,
    data: DATA,
    text: TEXT,
    on: on,
    emit: emit,
    actions: actions,
    guard: guard,
    stream: { start: streamStart },
    director: director,
    clock: {
      play: function () { S.clock.playing = true; },
      pause: function () { S.clock.playing = false; },
      setSpeed: function (x) { S.clock.speed = [1, 2, 4].indexOf(x) !== -1 ? x : 1; }
    },
    wizard: wizardFacade,
    run: runFacade,
    chat: chatFacade,
    git: gitFacade,
    docker: dockerFacade,
    usage: usageFacade,
    term: term,
    files: filesFacade,
    dash: dashFacade,
    web: {
      op: webOp,
      ops: function () { return S.web.ops; },
      artifacts: function () { return S.web.artifacts; },
      start: webStart,
      approve: webApprove,
      decline: webDecline,
      cancel: webCancel,
      requestAgain: webRequestAgain
    },
    dev: { toggle: toggleDevPanel }
  };
  window.PM_DEMO = PM_DEMO;

  /* ================= init ================= */
  var booted = false;
  function init() {
    if (booted) return;
    booted = true;
    try { seedChat(); } catch (e) {}
    attachRouter();
    try {
      document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
          e.preventDefault();
          toggleDevPanel();
        }
      });
    } catch (e) {}
    try { document.addEventListener('visibilitychange', onVisibility); } catch (e) {}
    trackStart('ambient', AMBIENT_BEATS);
    /* wizard-ambient churn is NOT started here — wizardFacade.enterWorkspace arms it
       when the user opens the topic workspace (chapter jumps are covered by BACKFILL) */
    trackStart('web', WEB_BEATS); /* research run: queued → read receipts → citations */
    setInterval(safe(clockTick, 'clock'), 250);
    emit('demo.ready', { version: PM_DEMO.version });
    emit('run.state', runSnapshot()); /* boot sync (W2 ledger → W3): snapshot for eager subscribers */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
