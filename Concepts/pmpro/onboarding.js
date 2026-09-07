/*
 * Puppet Master Pro concept — newbie-first onboarding and guided tour
 * Concept-only state/receipt projection. No network/provider calls are made.
 */
(() => {
  'use strict';
  if (window.PMProOnboarding?.version) return;

  const VERSION = '2026.09.04.2';
  const DRAFT_KEY = 'pmpro.project-draft.v2';
  const TOUR_KEY = 'pmpro.guided-tour.v2';
  const COMPLETE_KEY = 'pmpro.onboarding-complete.v2';
  const THEME_KEY = 'pmpro.theme.v2';
  const WORKSPACE_KEY = 'pmpro.workspace-demo.v1';
  const memory = new Map();
  const store = {
    get(key) {
      try { return window.localStorage.getItem(key); }
      catch { return memory.has(key) ? memory.get(key) : null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, String(value)); }
      catch { memory.set(key, String(value)); }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); }
      catch { memory.delete(key); }
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const fixtureMode = () => window.__PMPRO_FIXTURE__ || new URLSearchParams(location.search).get('pmproFixture') || '';
  const now = () => new Date().toISOString();
  const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const reducedMotion = () => document.documentElement.classList.contains('pmpro-force-reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const escapeAttr = escapeHtml;
  const capitalize = (value = '') => value ? value[0].toUpperCase() + value.slice(1) : '';
  const getPath = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
  const setPath = (object, path, value) => {
    const keys = path.split('.');
    let cursor = object;
    keys.slice(0, -1).forEach(key => { cursor[key] ??= {}; cursor = cursor[key]; });
    cursor[keys.at(-1)] = value;
  };

  const icon = {
    mark: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7.5 12 4l4 3.5v5L12 16l-4-3.5v-5Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 16v4M8.2 12.8 5 16m10.8-3.2L19 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.8"/><path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    device: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    server: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="4" y="14" width="16" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><circle cx="8" cy="6.5" r="1" fill="currentColor"/><circle cx="8" cy="17.5" r="1" fill="currentColor"/><path d="M12 6.5h5M12 17.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    folder: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6.5h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z" stroke="currentColor" stroke-width="1.7"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.7"/></svg>',
    cloud: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 18h11a4 4 0 0 0 .7-7.9A7 7 0 0 0 5.2 9 4.5 4.5 0 0 0 7 18Z" stroke="currentColor" stroke-width="1.7"/></svg>',
    history: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 4v4.6h4.6M12 8v5l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    key: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="15" r="4" stroke="currentColor" stroke-width="1.7"/><path d="m11 12 8-8m-3 3 3 3m-6 0 2 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    spark: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 1.4 5.2L18 10l-4.6 2.8L12 18l-1.4-5.2L6 10l4.6-2.8L12 2Z" stroke="currentColor" stroke-width="1.6"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" stroke="currentColor" stroke-width="1.4"/></svg>',
    box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 7 8-4 8 4-8 4-8-4Z" stroke="currentColor" stroke-width="1.7"/><path d="M4 7v10l8 4 8-4V7M12 11v10" stroke="currentColor" stroke-width="1.7"/></svg>',
    edit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="currentColor" stroke-width="1.7"/><path d="m13.5 6.5 4 4" stroke="currentColor" stroke-width="1.7"/></svg>',
    link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l2.2-2.2a4.5 4.5 0 0 0-6.4-6.4L11 6.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-2.2 2.2a4.5 4.5 0 1 0 6.4 6.4l1.2-1.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    palette: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.4a2.5 2.5 0 0 1-2.2-3.7l.7-1.2A2 2 0 0 0 14.4 3H12Z" stroke="currentColor" stroke-width="1.7"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="7" r="1" fill="currentColor"/><circle cx="7.5" cy="15.5" r="1" fill="currentColor"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    pause: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    move: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18m0-18-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12h18M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 10v6M12 7.3v.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'
  };

  const themeWorlds = {
    friendly: {
      name: 'Friendly', note: 'Warm, illustrated, approachable',
      dark: { accent: '#ffbf7b', accent2: '#86ead5', accent3: '#f6a6b2', scene: 'radial-gradient(circle at 38% 27%, #5a3829, #181416 69%)' },
      light: { accent: '#df6a63', accent2: '#1f847a', accent3: '#e5a04d', scene: 'radial-gradient(circle at 42% 27%, #ffd9aa, #f5e9dc 69%)' }
    },
    glass: {
      name: 'Glass', note: 'Prismatic, spatial, luminous',
      dark: { accent: '#d8b4fe', accent2: '#7dd3fc', accent3: '#9af2c0', scene: 'radial-gradient(circle at 40% 26%, #3d315d, #11131c 69%)' },
      light: { accent: '#7257d5', accent2: '#168eac', accent3: '#4fa875', scene: 'radial-gradient(circle at 42% 25%, #ded4ff, #eef3f8 70%)' }
    },
    retro: {
      name: 'Retro', note: 'Tactile CRT, practical, focused',
      dark: { accent: '#d7d269', accent2: '#9fbea0', accent3: '#cf826e', scene: 'radial-gradient(circle at 43% 27%, #394232, #111611 69%)' },
      light: { accent: '#5d6c47', accent2: '#9b574d', accent3: '#4a7478', scene: 'radial-gradient(circle at 43% 27%, #d7d5a5, #eee9cf 70%)' }
    },
    basic: {
      name: 'Basic', note: 'Quiet, architectural, precise',
      dark: { accent: '#9dbbff', accent2: '#8df2bd', accent3: '#e9c979', scene: 'radial-gradient(circle at 41% 26%, #263855, #10141b 70%)' },
      light: { accent: '#395f9f', accent2: '#328168', accent3: '#9a6b2e', scene: 'radial-gradient(circle at 41% 26%, #d5e4fa, #edf0f4 70%)' }
    }
  };

  function defaultDraft() {
    return {
      schema_id: 'project_setup_draft.v2',
      draft_id: uid('draft'),
      created_at: now(),
      updated_at: now(),
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      current_step: 'welcome',
      completed_steps: [],
      entry: 'fresh',
      theme: { family: 'friendly', tone: 'dark', reduced: false },
      device: { mode: 'local', name: 'This computer', state: 'unknown', pairing: { method: 'lan', code: '', selected: 'Studio Puppet Master', status: 'idle' } },
      project: { intent: 'create', name: 'Neighborhood Book Club', description: 'A simple website for our book club.', type: 'auto' },
      storage: {
        kind: 'local', path: '~/Puppet Master Projects',
        network: { transport: 'ssh', host: 'studio-nas.local', user: 'jared', folder: '/projects', fingerprint: 'SHA256:Z4p3Qw2m9Tn7Kf8a6Vh1cB0sE5rYxDgU', verified: false, state: 'idle', receipt: null }
      },
      source: { mode: 'local_history', service: 'github', account_state: 'not_signed_in', account_name: null, remote_name: 'neighborhood-book-club', visibility: 'private', selected_existing: null },
      inherit: { eligible: true, mode: 'fresh', from: null, groups: ['Planning preferences', 'Permissions', 'AI routes', 'Notifications', 'Testing defaults'] },
      preferences: { history: true, backup_later: true, simple_explanations: true },
      pending_side_effects: [],
      commit: { status: 'not_started', operation_id: null, phase_index: 0, receipt: null, simulated_interruption_used: false },
      provider: { selected: null, accounts: { claude: 'ready', codex: 'missing_cli', gemini: 'needs_signin', openai_api: 'needs_key' }, skipped: false },
      free_models: { selected: [], skipped: false }
    };
  }

  function mergeDraft(raw) {
    const base = defaultDraft();
    if (!raw || raw.schema_id !== base.schema_id || Date.parse(raw.expires_at || 0) < Date.now()) return base;
    return {
      ...base, ...raw,
      theme: { ...base.theme, ...(raw.theme || {}) },
      device: { ...base.device, ...(raw.device || {}), pairing: { ...base.device.pairing, ...(raw.device?.pairing || {}) } },
      project: { ...base.project, ...(raw.project || {}) },
      storage: { ...base.storage, ...(raw.storage || {}), network: { ...base.storage.network, ...(raw.storage?.network || {}) } },
      source: { ...base.source, ...(raw.source || {}) },
      inherit: { ...base.inherit, ...(raw.inherit || {}) },
      preferences: { ...base.preferences, ...(raw.preferences || {}) },
      commit: { ...base.commit, ...(raw.commit || {}) },
      provider: { ...base.provider, ...(raw.provider || {}), accounts: { ...base.provider.accounts, ...(raw.provider?.accounts || {}) } },
      free_models: { ...base.free_models, ...(raw.free_models || {}) }
    };
  }

  let draft = mergeDraft(parse(store.get(DRAFT_KEY), null));
  let stepId = draft.current_step || 'welcome';
  let direction = 'forward';
  let transitioning = false;
  let stepTransitionSerial = 0;
  let appearanceTransitionSerial = 0;
  let previousFocus = null;
  let toastTimer = null;
  let legacyHidden = [];

  function createShell() {
    if ($('#pmpro-root')) return;
    const shell = document.createElement('div');
    shell.innerHTML = `
      <div id="pmpro-root" hidden aria-hidden="true">
        <div class="pmpro-backdrop">
          <section class="pmpro-window" role="dialog" aria-modal="true" aria-labelledby="pmpro-title" tabindex="-1">
            <header class="pmpro-topbar">
              <div class="pmpro-brand">
                <span class="pmpro-brand-mark">${icon.mark}</span>
                <span class="pmpro-brand-copy"><strong>Puppet Master</strong><span id="pmpro-draft-state">A safe setup draft</span></span>
              </div>
              <div class="pmpro-progress" aria-label="Setup progress">
                <div class="pmpro-progress-dots" id="pmpro-progress-dots"></div>
                <span class="pmpro-progress-label" id="pmpro-progress-label"></span>
              </div>
              <div class="pmpro-top-actions">
                <button type="button" class="pmpro-icon-button" data-pmpro="theme-cycle" aria-label="Preview next appearance" title="Preview next appearance">${icon.palette}</button>
                <button type="button" class="pmpro-icon-button" data-pmpro="close" aria-label="Close setup">${icon.close}</button>
              </div>
            </header>
            <main class="pmpro-main">
              <div class="pmpro-visual" id="pmpro-visual">
                <div class="pmpro-film-grain"></div>
                <div class="pmpro-scene" id="pmpro-scene"></div>
                <div class="pmpro-scene-caption"><strong id="pmpro-scene-label"></strong><span id="pmpro-scene-detail"></span></div>
              </div>
              <div class="pmpro-content-wrap"><div class="pmpro-content" id="pmpro-content"></div></div>
            </main>
            <footer class="pmpro-bottom">
              <div class="pmpro-bottom-left">
                <button type="button" class="pmpro-quiet-button" data-pmpro="back">Back</button>
                <button type="button" class="pmpro-quiet-button" data-pmpro="close">Close</button>
              </div>
              <div class="pmpro-bottom-center" id="pmpro-bottom-note"></div>
              <div class="pmpro-bottom-right" id="pmpro-footer-actions"></div>
            </footer>
            <div class="pmpro-toast" id="pmpro-toast" role="status" aria-live="polite"></div>
            <div class="pmpro-modal-layer" id="pmpro-modal-layer" hidden></div>
          </section>
        </div>
      </div>
      <div id="pmpro-resume-chip" hidden>
        <span class="pmpro-resume-copy"><strong id="pmpro-resume-title">Finish setting up</strong><span id="pmpro-resume-detail">Your choices are saved.</span></span>
        <button type="button" data-pmpro="resume">Resume</button>
      </div>
      <div id="pmpro-dev-launcher" hidden>
        <button type="button" data-pmpro="launch-onboarding">Onboarding</button>
        <button type="button" data-pmpro="launch-tour">Guided Tour</button>
        <button type="button" data-pmpro="reset">Reset</button>
      </div>
      <div id="pmpro-tour-root" hidden aria-hidden="true">
        <div class="pmpro-tour-shell">
          <header class="pmpro-tour-top">
            <div class="pmpro-tour-brand"><span class="pmpro-brand-mark" style="width:28px;height:28px;border-radius:9px">${icon.mark}</span>Puppet Master</div>
            <div class="pmpro-practice-pill">${icon.shield} Practice Project · no network or AI allowance</div>
          </header>
          <nav class="pmpro-tour-rail" id="pmpro-tour-rail" aria-label="Puppet Master areas"></nav>
          <main class="pmpro-tour-workspace" id="pmpro-tour-workspace"></main>
          <footer class="pmpro-tour-status"><span>Reversible practice workspace</span><span id="pmpro-tour-proof">Local fixture · 0 provider requests · 0 usage</span></footer>
        </div>
        <div class="pmpro-tour-shade" data-shade="top"></div>
        <div class="pmpro-tour-shade" data-shade="left"></div>
        <div class="pmpro-tour-shade" data-shade="right"></div>
        <div class="pmpro-tour-shade" data-shade="bottom"></div>
        <div class="pmpro-tour-halo" id="pmpro-tour-halo"></div>
        <div class="pmpro-demo-pointer" id="pmpro-demo-pointer"></div>
        <aside class="pmpro-guide-card" id="pmpro-guide-card" role="dialog" aria-modal="false" aria-labelledby="pmpro-guide-title"></aside>
        <div class="pmpro-tour-skip-layer" id="pmpro-tour-skip-layer" hidden></div>
      </div>`;
    while (shell.firstElementChild) document.body.append(shell.firstElementChild);
  }

  createShell();

  const root = $('#pmpro-root');
  const windowEl = $('.pmpro-window', root);
  const content = $('#pmpro-content');
  const scene = $('#pmpro-scene');
  const visual = $('#pmpro-visual');
  const footer = $('#pmpro-footer-actions');
  const modalLayer = $('#pmpro-modal-layer');
  const resumeChip = $('#pmpro-resume-chip');
  const tourRoot = $('#pmpro-tour-root');
  const tourWorkspace = $('#pmpro-tour-workspace');
  const tourRail = $('#pmpro-tour-rail');
  const guideCard = $('#pmpro-guide-card');
  const tourHalo = $('#pmpro-tour-halo');
  const demoPointer = $('#pmpro-demo-pointer');
  const tourSkipLayer = $('#pmpro-tour-skip-layer');

  function saveDraft() {
    draft.current_step = stepId;
    draft.updated_at = now();
    store.set(DRAFT_KEY, JSON.stringify(draft));
    updateResumeChip();
  }

  function themeData() {
    const family = themeWorlds[draft.theme.family] ? draft.theme.family : 'friendly';
    const tone = draft.theme.tone === 'light' ? 'light' : 'dark';
    return { family, tone, ...themeWorlds[family], palette: themeWorlds[family][tone] };
  }

  function applyTheme() {
    const theme = themeData();
    root.dataset.themeFamily = theme.family;
    root.dataset.tone = theme.tone;
    root.style.setProperty('--pmpro-accent', theme.palette.accent);
    root.style.setProperty('--pmpro-accent-2', theme.palette.accent2);
    root.style.setProperty('--pmpro-accent-3', theme.palette.accent3);
    visual.style.setProperty('--pmpro-scene-background', theme.palette.scene);
    document.documentElement.classList.toggle('pmpro-force-reduced', Boolean(draft.theme.reduced));
  }

  function transitionAppearance(update, message) {
    update();
    saveDraft();
    const render = () => renderStep({ animate: false, focus: false });
    if (reducedMotion() || typeof document.startViewTransition !== 'function' || root.hidden) {
      render();
      if (message) showToast(message());
      return;
    }
    const serial = ++appearanceTransitionSerial;
    document.documentElement.dataset.pmproThemeTransition = 'true';
    const transition = document.startViewTransition(render);
    transition.finished.finally(() => {
      if (serial === appearanceTransitionSerial) delete document.documentElement.dataset.pmproThemeTransition;
      if (message && serial === appearanceTransitionSerial) showToast(message());
    });
  }

  function cycleTheme() {
    const families = Object.keys(themeWorlds);
    const current = families.indexOf(draft.theme.family);
    transitionAppearance(() => {
      draft.theme.family = families[(current + 1) % families.length];
    }, () => `${themeWorlds[draft.theme.family].name} appearance preview`);
  }

  const sceneMeta = {
    welcome: ['From an idea to a reviewed plan', 'A calm beginning with no technical checklist.'],
    device: ['Choose the computer that does the work', 'The simplest local route is already selected.'],
    pairing: ['Connect without network jargon', 'Discovery first; codes and URLs appear only when needed.'],
    device_check: ['A short readiness check', 'No Project or provider work starts here.'],
    ready: ['This device is ready', 'Create something new or bring in work you already have.'],
    project_start: ['Begin with what you recognize', 'Technical choices appear only after the matching intent.'],
    basics: ['Give the work a clear home', 'One name and one sentence are enough.'],
    appearance: ['Make the workspace feel familiar', 'Four authored worlds, each available in light and dark.'],
    storage: ['Your files stay where you choose', 'Local is easiest; network storage remains first-class.'],
    ssh: ['A verified secure tunnel', 'You approve the storage identity before a key is installed.'],
    source: ['Keep a safe history', 'Online hosting is optional and explained in plain language.'],
    source_auth: ['Sign in without creating the Project', 'Account access now; repository creation waits for review.'],
    inherit: ['Start familiar, or start clean', 'Copy only the settings that help.'],
    preferences: ['Helpful defaults, no homework', 'Advanced choices remain available later.'],
    review: ['Review before anything is created', 'Every planned effect is visible and editable.'],
    commit: ['One durable operation', 'Retry-safe, receipt-backed, and recoverable.'],
    provider: ['Add the AI after the Project exists', 'Ready accounts are recognized automatically.'],
    free_models: ['Optional free routes', 'A useful extra, never a blocker.'],
    finish: ['Your Project is ready', 'Plan the idea now, or learn the workspace safely.']
  };

  function sceneSvg(step) {
    const { family, tone, palette } = themeData();
    const dark = tone === 'dark';
    const ink = dark ? 'rgba(255,255,255,.76)' : 'rgba(25,29,36,.72)';
    const faint = dark ? 'rgba(255,255,255,.16)' : 'rgba(25,29,36,.15)';
    const panel = dark ? 'rgba(10,13,18,.63)' : 'rgba(255,255,255,.56)';
    const a = palette.accent, b = palette.accent2, c = palette.accent3;
    const defs = `<defs>
      <linearGradient id="pmga" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".54" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
      <radialGradient id="pmrg"><stop stop-color="${a}" stop-opacity=".52"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
      <filter id="pmglow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="pmsoft"><feGaussianBlur stdDeviation="20"/></filter>
    </defs>`;
    const base = `<ellipse cx="260" cy="368" rx="176" ry="22" fill="rgba(0,0,0,.20)"/><circle cx="260" cy="220" r="187" fill="url(#pmrg)" opacity=".18"/>`;

    const friendly = {
      welcome: `${base}<path d="M112 307C155 190 202 123 260 86c59 37 105 104 148 221-43 34-92 52-148 52s-105-18-148-52Z" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><path d="M169 287c27-48 58-78 91-90 34 12 64 42 91 90" fill="none" stroke="${faint}" stroke-width="3"/><circle cx="260" cy="125" r="17" fill="${a}" filter="url(#pmglow)"/><path d="M247 125h26M260 112v26" stroke="${dark ? '#172019' : '#fff'}" stroke-width="4" stroke-linecap="round"/><path d="M102 216c27-17 51-18 72-2M346 214c22-15 46-14 72 3" stroke="${b}" stroke-width="7" stroke-linecap="round" opacity=".72"/><path d="M136 330c-22-9-35-23-39-42M384 330c22-9 35-23 39-42" stroke="${c}" stroke-width="8" stroke-linecap="round" opacity=".64"/>`,
      device: `${base}<rect x="111" y="127" width="298" height="197" rx="31" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><rect x="139" y="156" width="242" height="133" rx="18" fill="${faint}"/><path d="M208 346h104M260 324v22" stroke="${ink}" stroke-width="8" stroke-linecap="round"/><circle cx="260" cy="224" r="46" fill="url(#pmrg)"/><path d="m238 224 15 15 31-38" stroke="${a}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#pmglow)"/><path d="M88 174c-17 42-16 82 4 120M432 174c17 42 16 82-4 120" stroke="${b}" stroke-width="7" stroke-linecap="round" opacity=".52"/>`,
      ready: `${base}<path d="M96 312c43-122 146-193 270-154 36 11 62 34 80 68" fill="none" stroke="url(#pmga)" stroke-width="4" stroke-dasharray="9 11"/><rect x="91" y="227" width="127" height="101" rx="24" fill="${panel}" stroke="${faint}"/><rect x="302" y="164" width="127" height="164" rx="24" fill="${panel}" stroke="${faint}"/><path d="M121 270h67M333 208h66M333 238h47" stroke="${ink}" stroke-width="7" stroke-linecap="round" opacity=".5"/><circle cx="260" cy="114" r="23" fill="${a}" filter="url(#pmglow)"/><path d="m249 114 8 8 16-20" stroke="${dark ? '#142018' : '#fff'}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
      basics: `${base}<path d="M118 91h284v272H118z" fill="${panel}" stroke="${faint}" stroke-width="2"/><path d="M152 144h144M152 180h215M152 216h171M152 305h94" stroke="${ink}" stroke-width="6" stroke-linecap="round" opacity=".34"/><path d="m308 280 94-94 30 30-94 94-45 15 15-45Z" fill="url(#pmga)" filter="url(#pmglow)"/><path d="m308 280 30 30" stroke="rgba(10,12,18,.42)" stroke-width="3"/><path d="M100 112h22m-11-11v22M397 349h22m-11-11v22" stroke="${a}" stroke-width="3" stroke-linecap="round"/>`,
      storage: `${base}<rect x="205" y="95" width="110" height="78" rx="20" fill="${panel}" stroke="${faint}"/><path d="M229 134h62" stroke="${a}" stroke-width="7" stroke-linecap="round"/><path d="M260 173v63M141 236h238M141 236v58m238-58v58" stroke="url(#pmga)" stroke-width="3" stroke-dasharray="8 9"/><rect x="75" y="281" width="132" height="79" rx="21" fill="${panel}" stroke="${faint}"/><rect x="313" y="281" width="132" height="79" rx="21" fill="${panel}" stroke="${faint}"/><circle cx="106" cy="320" r="9" fill="${a}"/><path d="M128 320h49" stroke="${ink}" stroke-width="6" stroke-linecap="round" opacity=".43"/><path d="M345 334h68c18 0 20-28 1-31-5-27-42-24-46-4-18-3-26 35-17 35" fill="none" stroke="${b}" stroke-width="4"/>`,
      ssh: `${base}<path d="M97 253C176 90 344 90 423 253" fill="none" stroke="${faint}" stroke-width="24" stroke-linecap="round"/><path d="M97 253C176 90 344 90 423 253" fill="none" stroke="url(#pmga)" stroke-width="4" stroke-dasharray="8 10"/><rect x="66" y="239" width="112" height="87" rx="21" fill="${panel}" stroke="${faint}"/><rect x="342" y="239" width="112" height="87" rx="21" fill="${panel}" stroke="${faint}"/><path d="M93 280h59M368 280h59" stroke="${ink}" stroke-width="6" stroke-linecap="round" opacity=".4"/><g transform="translate(216 174)"><rect width="88" height="74" rx="20" fill="${panel}" stroke="${a}" stroke-width="2" filter="url(#pmglow)"/><path d="M25 34v-9a19 19 0 0 1 38 0v9M19 34h50v32H19z" fill="none" stroke="${a}" stroke-width="4"/><circle cx="44" cy="50" r="5" fill="${b}"/></g>`,
      source: `${base}<path d="M102 304c56 0 67-100 129-100s74 100 132 100" fill="none" stroke="${faint}" stroke-width="3"/><circle cx="102" cy="304" r="17" fill="${a}" filter="url(#pmglow)"/><circle cx="231" cy="204" r="17" fill="${b}"/><circle cx="363" cy="304" r="17" fill="${a}"/><path d="M363 304h67" stroke="url(#pmga)" stroke-width="3" stroke-dasharray="7 8"/><rect x="383" y="152" width="98" height="98" rx="24" fill="${panel}" stroke="${faint}"/><path d="M412 201h40M432 181v40" stroke="url(#pmga)" stroke-width="8" stroke-linecap="round"/>`,
      inherit: `${base}<rect x="74" y="137" width="159" height="180" rx="23" fill="${panel}" stroke="${faint}"/><rect x="287" y="137" width="159" height="180" rx="23" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><path d="M106 185h94M106 217h67M319 185h94M319 217h67" stroke="${ink}" stroke-width="7" stroke-linecap="round" opacity=".34"/><path d="M233 230h54" stroke="url(#pmga)" stroke-width="6" stroke-linecap="round"/><path d="m271 214 16 16-16 16" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="366" cy="278" r="20" fill="${a}" filter="url(#pmglow)"/><path d="m357 278 7 7 13-16" stroke="${dark ? '#152017' : '#fff'}" stroke-width="5" stroke-linecap="round"/>`,
      review: `${base}<path d="M139 86h234l47 47v236H139V86Z" fill="${panel}" stroke="${faint}" stroke-width="2"/><path d="M373 86v47h47" fill="none" stroke="${faint}" stroke-width="2"/><path d="M181 173h182M181 215h147M181 257h167" stroke="${ink}" stroke-width="7" stroke-linecap="round" opacity=".32"/><circle cx="317" cy="321" r="37" fill="url(#pmga)" filter="url(#pmglow)"/><path d="m301 321 12 12 23-29" stroke="${dark ? '#15170f' : '#fff'}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
      commit: `${base}<circle cx="260" cy="225" r="120" fill="${panel}" stroke="${faint}" stroke-width="2"/><circle cx="260" cy="225" r="80" fill="${faint}" stroke="url(#pmga)" stroke-width="3" stroke-dasharray="8 11"/><rect x="230" y="195" width="60" height="60" rx="16" fill="url(#pmga)" filter="url(#pmglow)"/><path d="m244 225 12 12 24-29" stroke="${dark ? '#142018' : '#fff'}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M260 86v39M260 325v39M121 225h39M360 225h39M162 127l28 28M330 295l28 28M358 127l-28 28M190 295l-28 28" stroke="url(#pmga)" stroke-width="8" stroke-linecap="round"/>`,
      provider: `${base}<circle cx="260" cy="217" r="70" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><path d="m260 158 13 43 39 16-39 16-13 43-13-43-39-16 39-16 13-43Z" fill="url(#pmga)" filter="url(#pmglow)"/><rect x="65" y="122" width="108" height="76" rx="19" fill="${panel}" stroke="${faint}"/><rect x="347" y="122" width="108" height="76" rx="19" fill="${panel}" stroke="${faint}"/><rect x="65" y="259" width="108" height="76" rx="19" fill="${panel}" stroke="${faint}"/><rect x="347" y="259" width="108" height="76" rx="19" fill="${panel}" stroke="${faint}"/><path d="M173 160h47M300 160h47M173 297h47M300 297h47" stroke="url(#pmga)" stroke-width="3" stroke-dasharray="6 7"/>`,
      finish: `${base}<path d="M88 347 260 69l172 278H88Z" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><path d="M157 347 260 181l103 166H157Z" fill="${dark ? 'rgba(10,14,17,.7)' : 'rgba(255,255,255,.58)'}" stroke="${faint}"/><circle cx="260" cy="181" r="25" fill="${a}" filter="url(#pmglow)"/><path d="m248 181 8 8 18-21" stroke="${dark ? '#132018' : '#fff'}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    };

    const glass = {
      default: `${base}<g opacity=".95"><ellipse cx="260" cy="218" rx="151" ry="80" fill="none" stroke="url(#pmga)" stroke-width="2" transform="rotate(-18 260 218)"/><ellipse cx="260" cy="218" rx="151" ry="80" fill="none" stroke="${faint}" stroke-width="2" transform="rotate(42 260 218)"/><circle cx="391" cy="166" r="15" fill="${a}" filter="url(#pmglow)"/><circle cx="160" cy="304" r="12" fill="${b}"/></g><path d="m260 84 94 134-94 136-94-136 94-134Z" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><path d="m260 84 0 270M166 218h188" stroke="${faint}"/><circle cx="260" cy="218" r="30" fill="url(#pmga)" filter="url(#pmglow)"/>`,
      storage: `${base}<g><path d="M260 75v74M123 224h274M123 224v89m274-89v89" stroke="url(#pmga)" stroke-width="3" stroke-dasharray="8 9"/><path d="m260 99 48 30-48 30-48-30 48-30Z" fill="${panel}" stroke="${a}"/><path d="m91 288 62-38 62 38-62 38-62-38Z" fill="${panel}" stroke="${b}"/><path d="m305 288 62-38 62 38-62 38-62-38Z" fill="${panel}" stroke="${c}"/><circle cx="260" cy="129" r="8" fill="${a}" filter="url(#pmglow)"/><circle cx="153" cy="288" r="8" fill="${b}"/><circle cx="367" cy="288" r="8" fill="${c}"/></g>`,
      source: `${base}<path d="M94 285c80 0 91-137 166-137s87 137 166 137" fill="none" stroke="url(#pmga)" stroke-width="3"/><g fill="${panel}" stroke-width="2"><circle cx="94" cy="285" r="25" stroke="${a}"/><circle cx="260" cy="148" r="25" stroke="${b}"/><circle cx="426" cy="285" r="25" stroke="${c}"/></g><path d="m260 105 11 31 31 12-31 12-11 31-11-31-31-12 31-12 11-31Z" fill="url(#pmga)" filter="url(#pmglow)"/>`,
      commit: `${base}<g transform="translate(260 220)"><circle r="129" fill="${panel}" stroke="${faint}"/><circle r="93" fill="none" stroke="url(#pmga)" stroke-width="3" stroke-dasharray="5 12"/><circle r="56" fill="url(#pmrg)" stroke="${a}"/><path d="m-18 0 13 13 27-34" fill="none" stroke="${a}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#pmglow)"/><g fill="${b}"><circle cx="0" cy="-129" r="8"/><circle cx="112" cy="65" r="8"/><circle cx="-112" cy="65" r="8"/></g></g>`,
      finish: `${base}<g><path d="m260 64 154 280H106L260 64Z" fill="${panel}" stroke="url(#pmga)" stroke-width="2"/><path d="m260 139 84 153H176l84-153Z" fill="none" stroke="${faint}" stroke-width="2"/><circle cx="260" cy="224" r="29" fill="url(#pmga)" filter="url(#pmglow)"/><path d="m247 224 9 9 19-23" stroke="${dark ? '#11151a' : '#fff'}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`
    };

    const retro = {
      default: `${base}<rect x="95" y="92" width="330" height="255" rx="14" fill="${panel}" stroke="${a}" stroke-width="3"/><rect x="119" y="116" width="282" height="180" rx="6" fill="${dark ? '#0c110d' : '#e6e1c5'}" stroke="${faint}"/><path d="M145 152h112M145 184h191M145 216h148" stroke="${a}" stroke-width="8" stroke-linecap="square" opacity=".72"/><path d="m145 255 22 16 39-42" fill="none" stroke="${b}" stroke-width="8" stroke-linecap="square"/><circle cx="143" cy="320" r="7" fill="${a}"/><circle cx="168" cy="320" r="7" fill="${b}"/><path d="M349 320h51" stroke="${c}" stroke-width="7"/>`,
      storage: `${base}<g fill="${panel}" stroke="${a}" stroke-width="3"><rect x="83" y="249" width="142" height="90" rx="8"/><rect x="295" y="249" width="142" height="90" rx="8"/><rect x="191" y="94" width="138" height="90" rx="8"/></g><path d="M260 184v39M154 223h212M154 223v26m212-26v26" stroke="${b}" stroke-width="5" stroke-dasharray="8 6"/><path d="M110 285h87M322 285h87M218 130h84" stroke="${a}" stroke-width="8"/><g fill="${c}"><rect x="111" y="309" width="12" height="12"/><rect x="323" y="309" width="12" height="12"/><rect x="219" y="154" width="12" height="12"/></g>`,
      source: `${base}<path d="M93 303h91l38-64h76l38 64h91" fill="none" stroke="${a}" stroke-width="7" stroke-linejoin="miter"/><g fill="${panel}" stroke="${b}" stroke-width="3"><rect x="71" y="280" width="44" height="44"/><rect x="238" y="183" width="44" height="44"/><rect x="405" y="280" width="44" height="44"/></g><path d="M252 197h16v16h-16z" fill="${c}"/><path d="M82 291h22v22H82zM416 291h22v22h-22z" fill="${a}"/>`,
      commit: `${base}<rect x="122" y="86" width="276" height="271" rx="12" fill="${panel}" stroke="${a}" stroke-width="3"/><path d="M160 137h198M160 177h198M160 217h132" stroke="${a}" stroke-width="8"/><rect x="200" y="257" width="120" height="60" fill="${b}" filter="url(#pmglow)"/><path d="m225 287 20 19 48-57" stroke="${dark ? '#11150e' : '#fff'}" stroke-width="10" stroke-linecap="square" stroke-linejoin="miter"/>`,
      finish: `${base}<path d="M93 341h334L260 73 93 341Z" fill="${panel}" stroke="${a}" stroke-width="4"/><path d="M172 311h176L260 168 172 311Z" fill="none" stroke="${b}" stroke-width="4"/><rect x="238" y="218" width="44" height="44" fill="${a}" filter="url(#pmglow)"/><path d="m248 240 9 9 18-22" stroke="${dark ? '#13170e' : '#fff'}" stroke-width="6"/>`
    };

    const basic = {
      default: `${base}<g fill="none"><path d="M92 338 260 75l168 263H92Z" stroke="url(#pmga)" stroke-width="2"/><path d="M147 338 260 161l113 177M260 75v263M92 338h336" stroke="${faint}"/><circle cx="260" cy="161" r="9" fill="${a}"/><circle cx="147" cy="338" r="7" fill="${b}"/><circle cx="373" cy="338" r="7" fill="${c}"/></g><rect x="220" y="216" width="80" height="62" rx="10" fill="${panel}" stroke="${faint}"/><path d="M240 247h40" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
      storage: `${base}<g fill="${panel}" stroke-width="2"><rect x="97" y="262" width="124" height="78" rx="12" stroke="${a}"/><rect x="299" y="262" width="124" height="78" rx="12" stroke="${b}"/><rect x="198" y="101" width="124" height="78" rx="12" stroke="${c}"/></g><path d="M260 179v45M159 224h202M159 224v38m202-38v38" stroke="${faint}" stroke-width="2"/><path d="M123 299h72M325 299h72M224 138h72" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity=".4"/>`,
      source: `${base}<path d="M97 304c49 0 72-102 133-102s83 102 133 102" fill="none" stroke="${faint}" stroke-width="2"/><circle cx="97" cy="304" r="17" fill="${panel}" stroke="${a}" stroke-width="2"/><circle cx="230" cy="202" r="17" fill="${panel}" stroke="${b}" stroke-width="2"/><circle cx="363" cy="304" r="17" fill="${panel}" stroke="${c}" stroke-width="2"/><path d="M363 304h59M403 285l19 19-19 19" fill="none" stroke="${a}" stroke-width="3"/>`,
      commit: `${base}<circle cx="260" cy="220" r="121" fill="${panel}" stroke="${faint}" stroke-width="2"/><circle cx="260" cy="220" r="83" fill="none" stroke="url(#pmga)" stroke-width="2"/><path d="M260 78v59M260 303v59M118 220h59M343 220h59" stroke="${faint}" stroke-width="2"/><path d="m230 221 20 20 42-53" fill="none" stroke="${a}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#pmglow)"/>`,
      finish: `${base}<path d="M105 342 260 91l155 251H105Z" fill="${panel}" stroke="${faint}" stroke-width="2"/><path d="M184 314h152l-76-123-76 123Z" fill="none" stroke="url(#pmga)" stroke-width="3"/><circle cx="260" cy="252" r="20" fill="${a}"/><path d="m251 252 6 6 13-16" stroke="${dark ? '#11161a' : '#fff'}" stroke-width="4" stroke-linecap="round"/>`
    };

    const normalized = ({ device_check: 'device', pairing: 'device', project_start: 'ready', appearance: 'basics', source_auth: 'source', preferences: 'inherit', free_models: 'provider' }[step] || step);
    const map = family === 'friendly' ? friendly : family === 'glass' ? glass : family === 'retro' ? retro : basic;
    const body = map[normalized] || map.default || friendly[normalized] || friendly.welcome;
    return `<svg viewBox="0 0 520 430" role="img" aria-label="${escapeAttr(sceneMeta[step]?.[0] || 'Puppet Master setup illustration')}">${defs}${body}</svg>`;
  }

  function themePreviewSvg(family) {
    const config = themeWorlds[family];
    const a = config.dark.accent, b = config.dark.accent2, c = config.dark.accent3;
    if (family === 'friendly') return `<svg viewBox="0 0 150 76"><rect width="150" height="76" fill="#33231f"/><circle cx="36" cy="31" r="18" fill="${a}" opacity=".85"/><path d="M21 65c10-25 27-38 49-39 21 1 38 14 49 39" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M100 16c10 5 18 13 24 24" stroke="${c}" stroke-width="6" stroke-linecap="round"/></svg>`;
    if (family === 'glass') return `<svg viewBox="0 0 150 76"><defs><linearGradient id="ptg"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="150" height="76" fill="#17162a"/><ellipse cx="75" cy="38" rx="55" ry="22" fill="none" stroke="url(#ptg)" transform="rotate(-16 75 38)"/><path d="m75 9 27 29-27 29-27-29 27-29Z" fill="rgba(255,255,255,.1)" stroke="${a}"/><circle cx="123" cy="24" r="5" fill="${c}"/></svg>`;
    if (family === 'retro') return `<svg viewBox="0 0 150 76"><rect width="150" height="76" fill="#20271f"/><rect x="18" y="12" width="114" height="52" rx="4" fill="#10150f" stroke="${a}" stroke-width="2"/><path d="M31 27h58M31 39h86M31 51h45" stroke="${a}" stroke-width="5"/><rect x="106" y="48" width="12" height="8" fill="${c}"/></svg>`;
    return `<svg viewBox="0 0 150 76"><rect width="150" height="76" fill="#151b24"/><path d="M18 63 75 10l57 53H18Z" fill="none" stroke="${a}"/><path d="M44 63 75 34l31 29M75 10v53" stroke="rgba(255,255,255,.18)"/><circle cx="75" cy="34" r="5" fill="${b}"/></svg>`;
  }

  function setScene(step, animate = true) {
    const meta = sceneMeta[step] || sceneMeta.welcome;
    applyTheme();
    scene.innerHTML = sceneSvg(step);
    scene.className = `pmpro-scene${animate ? ' pmpro-scene-enter' : ''}`;
    $('#pmpro-scene-label').textContent = meta[0];
    $('#pmpro-scene-detail').textContent = meta[1];
  }

  function onboardingSequence() {
    const sequence = ['welcome', 'device'];
    if (draft.device.mode !== 'local') sequence.push('pairing');
    sequence.push('device_check', 'ready');
    if (draft.project.intent === 'create') sequence.push('basics', 'appearance');
    else sequence.push('project_start');
    sequence.push('storage');
    if (draft.storage.kind === 'network' && draft.storage.network.transport === 'ssh') sequence.push('ssh');
    sequence.push('source');
    if (['new_remote', 'existing_remote'].includes(draft.source.mode)) sequence.push('source_auth');
    if (draft.project.intent === 'create' && draft.inherit.eligible) sequence.push('inherit');
    sequence.push('preferences', 'review', 'commit', 'provider', 'free_models', 'finish');
    return sequence;
  }

  function stepIndex() {
    return Math.max(0, onboardingSequence().indexOf(stepId));
  }

  function nextStep() {
    const sequence = onboardingSequence();
    return sequence[Math.min(sequence.length - 1, Math.max(0, sequence.indexOf(stepId)) + 1)];
  }

  function previousStep() {
    const sequence = onboardingSequence();
    return sequence[Math.max(0, sequence.indexOf(stepId) - 1)];
  }

  function markStepComplete(step = stepId) {
    if (!draft.completed_steps.includes(step)) draft.completed_steps.push(step);
    saveDraft();
  }

  function choiceIcon(svg) {
    return `<span class="pmpro-choice-icon">${svg}</span>`;
  }

  function pill(text, kind = '') {
    return `<span class="pmpro-pill ${kind ? `pmpro-${kind}` : ''}">${escapeHtml(text)}</span>`;
  }

  function assurance(copy = 'Nothing is created until you confirm on the review screen.') {
    return `<div class="pmpro-assurance">${icon.shield}<span>${escapeHtml(copy)}</span></div>`;
  }

  function primaryButton(label = 'Continue', action = 'next', disabled = false, arrow = false) {
    return `<button type="button" class="pmpro-button pmpro-primary" data-action="${action}" ${disabled ? 'disabled' : ''}>${escapeHtml(label)}${arrow ? icon.arrow : ''}</button>`;
  }

  function secondaryButton(label, action) {
    return `<button type="button" class="pmpro-button pmpro-secondary" data-action="${action}">${escapeHtml(label)}</button>`;
  }

  function bottomNote() {
    if (stepId === 'review') return 'No Project, folder, history, online repository, or copied setting exists yet.';
    if (stepId === 'commit') return draft.commit.status === 'succeeded' ? 'Receipt saved · reopening cannot create a duplicate.' : 'Each finished phase is recorded so an interruption can resume safely.';
    if (stepId === 'provider') return 'AI setup is optional. Closing here leaves the committed Project intact.';
    if (stepId === 'free_models') return 'Free-model availability and limits can change. This setup is optional.';
    return 'Back can revise every choice before the final review. Close saves this draft.';
  }

  function progressMarkup() {
    const hidden = new Set(['welcome', 'device_check', 'commit', 'finish']);
    const visible = onboardingSequence().filter(step => !hidden.has(step));
    const index = Math.max(0, visible.indexOf(stepId));
    $('#pmpro-progress-dots').innerHTML = visible.map((step, position) => `<span class="pmpro-progress-dot" data-state="${position < index ? 'past' : position === index ? 'current' : 'future'}"></span>`).join('');
    $('#pmpro-progress-label').textContent = stepId === 'welcome' ? 'Welcome' : stepId === 'finish' ? 'Complete' : `${Math.max(1, index + 1)} of ${visible.length}`;
  }

  function statusCard(label, heading, copy, iconSvg = icon.check) {
    return `<div class="pmpro-status-card"><span class="pmpro-pill pmpro-ready">${escapeHtml(label)}</span><div style="display:flex;align-items:center;gap:12px;margin-top:12px"><span class="pmpro-choice-icon" style="margin:0">${iconSvg}</span><div><strong>${escapeHtml(heading)}</strong><p>${escapeHtml(copy)}</p></div></div></div>`;
  }

  function welcomeBody() {
    return `
      <div class="pmpro-choice-grid pmpro-one">
        <button type="button" class="pmpro-choice" data-action="begin-onboarding">
          ${choiceIcon(icon.device)}<strong>Set up this device</strong>
          <p>Choose where your first Project lives and where the work happens.</p>${pill('Recommended', 'recommended')}
        </button>
        <button type="button" class="pmpro-choice" data-action="begin-tour">
          ${choiceIcon(icon.play)}<strong>Take the Guided Tour</strong>
          <p>Practice a few real actions without changing files or using an AI plan.</p>
        </button>
      </div>
      ${assurance('The Guided Tour is local, replayable, and safe to leave at any time.')}`;
  }

  function deviceBody() {
    const selected = draft.device.mode;
    return `
      <div class="pmpro-choice-grid">
        <button type="button" class="pmpro-choice" data-select="device.mode" data-value="local" data-selected="${selected === 'local'}">
          ${choiceIcon(icon.device)}<strong>Use this computer</strong><p>Fastest setup. It can keep the Project and do the work.</p>${pill('Easiest', 'recommended')}
        </button>
        <button type="button" class="pmpro-choice" data-select="device.mode" data-value="existing" data-selected="${selected === 'existing'}">
          ${choiceIcon(icon.link)}<strong>Use a Puppet Master device I have</strong><p>Find it nearby or enter its pairing code.</p>
        </button>
        <button type="button" class="pmpro-choice" data-select="device.mode" data-value="server" data-selected="${selected === 'server'}">
          ${choiceIcon(icon.server)}<strong>Set up or restore another device</strong><p>For a home server, NAS, or always-on computer.</p>
        </button>
      </div>
      <details class="pmpro-details"><summary>What is a Puppet Master Server?</summary><div class="pmpro-details-body">It is simply the computer that keeps Puppet Master running and does the work. This computer can do that job by itself.</div></details>`;
  }

  function pairingTicket() {
    const modules = [
      [8,1],[10,1],[12,1],[8,2],[9,2],[12,2],[14,2],[9,3],[11,3],[13,3],[15,3],
      [8,5],[10,5],[11,5],[14,5],[9,6],[12,6],[15,6],[8,8],[9,8],[11,8],[13,8],[15,8],
      [1,8],[2,8],[4,8],[6,8],[2,9],[5,9],[7,9],[1,10],[3,10],[6,10],[8,10],[10,10],[12,10],[14,10],
      [9,11],[11,11],[15,11],[8,12],[10,12],[13,12],[15,12],[9,13],[12,13],[14,13],
      [1,14],[3,14],[5,14],[7,14],[8,14],[10,14],[12,14],[15,14],[2,15],[6,15],[9,15],[11,15],[13,15]
    ];
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx=".6" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".35" fill="currentColor"/>`;
    return `<svg viewBox="0 0 18 18" role="img" aria-label="Pairing QR code"><rect width="18" height="18" rx="1.6" fill="white"/><g color="#101218">${finder(1,1)}${finder(10,1)}${finder(1,10)}${modules.map(([x,y]) => `<rect x="${x}" y="${y}" width="1" height="1" rx=".14" fill="currentColor"/>`).join('')}</g></svg>`;
  }

  function pairingBody() {
    const pairing = draft.device.pairing;
    if (draft.device.mode === 'server') {
      return `
        <div class="pmpro-choice-grid">
          <button type="button" class="pmpro-choice" data-pair-route="discover" data-selected="${pairing.method === 'discover'}">${choiceIcon(icon.server)}<strong>Find a ready device</strong><p>Look on this network first.</p></button>
          <button type="button" class="pmpro-choice" data-pair-route="install" data-selected="${pairing.method === 'install'}">${choiceIcon(icon.plus)}<strong>Set up a new Server</strong><p>Choose the computer and follow its install steps.</p></button>
          <button type="button" class="pmpro-choice" data-pair-route="restore" data-selected="${pairing.method === 'restore'}">${choiceIcon(icon.history)}<strong>Restore a Server</strong><p>Use a Puppet Master backup.</p></button>
        </div>
        ${pairing.method === 'install' ? `<div class="pmpro-pair-ticket"><div class="pmpro-pair-qr">${pairingTicket()}</div><div class="pmpro-pair-copy"><span class="pmpro-pill pmpro-ready">Ready to pair</span><strong>Install Puppet Master Server on the other computer</strong><p>Open it there, then scan this code or enter the short code. Both screens will show the same confirmation before they trust one another.</p><code>PM-7K4M-92QD</code><small>Pairing address · https://pair.puppet-master.local/7K4M92QD</small></div></div><div class="pmpro-info-card">${icon.shield}<div><strong>Nothing installs silently</strong><p>The production flow uses the official package for the selected operating system. This concept stops at the explicit handoff and pairing receipt.</p></div></div>` : pairing.method === 'discover' ? `<div class="pmpro-status-card">${pill('Nearby device found','ready')}<div style="display:flex;align-items:center;gap:12px;margin-top:12px"><span class="pmpro-choice-icon" style="margin:0">${icon.server}</span><div><strong>Nearby Puppet Master Server</strong><p>Same network · ready for two-screen confirmation</p></div></div></div>` : pairing.method === 'restore' ? `<div class="pmpro-info-card">${icon.history}<div><strong>Choose a Server backup next</strong><p>The backup is inspected before any service, setting, or credential is restored.</p></div></div>` : ''}`;
    }
    return `
      <div class="pmpro-segment" style="margin-top:24px">
        <button type="button" data-select="device.pairing.method" data-value="lan" aria-pressed="${pairing.method === 'lan'}">Nearby</button>
        <button type="button" data-select="device.pairing.method" data-value="code" aria-pressed="${pairing.method === 'code'}">Pairing code</button>
        <button type="button" data-select="device.pairing.method" data-value="url" aria-pressed="${pairing.method === 'url'}">Address</button>
      </div>
      ${pairing.method === 'lan' ? `
        <div class="pmpro-service-list">
          <button type="button" class="pmpro-choice pmpro-compact" data-pair-device="Studio Puppet Master">
            ${choiceIcon(icon.server)}<span><strong>Studio Puppet Master</strong><p>Nearby · last seen now · Ready</p></span>${pill(pairing.selected === 'Studio Puppet Master' ? 'Selected' : 'Choose', pairing.selected === 'Studio Puppet Master' ? 'ready' : '')}
          </button>
          <button type="button" class="pmpro-choice pmpro-compact" data-pair-device="TrueNAS Puppet Master">
            ${choiceIcon(icon.server)}<span><strong>TrueNAS Puppet Master</strong><p>Nearby · update available</p></span>${pill(pairing.selected === 'TrueNAS Puppet Master' ? 'Selected' : 'Choose', pairing.selected === 'TrueNAS Puppet Master' ? 'ready' : '')}
          </button>
        </div>` : pairing.method === 'code' ? `
        <div class="pmpro-fields"><div class="pmpro-field"><label for="pmpro-pair-code">Pairing code</label><input id="pmpro-pair-code" data-bind="device.pairing.code" value="${escapeAttr(pairing.code)}" placeholder="ABCD-EFGH"><small>The other device shows this code or a QR code.</small></div></div>` : `
        <div class="pmpro-fields"><div class="pmpro-field"><label for="pmpro-pair-address">Puppet Master address</label><input id="pmpro-pair-address" data-bind="device.pairing.code" value="${escapeAttr(pairing.code)}" placeholder="https://puppet-master.example"><small>Use the address shown by the other device.</small></div></div>`}
      <div class="pmpro-info-card">${icon.shield}<div><strong>Pairing confirms both devices</strong><p>The real flow shows the same short code on both screens before they trust one another.</p></div></div>`;
  }

  function readinessBody() {
    const checks = [
      ['Puppet Master app', 'Ready'],
      ['Project workspace', 'Available'],
      ['Protected credentials', 'Ready'],
      [draft.device.mode === 'local' ? 'This computer' : draft.device.pairing.selected || 'Selected device', 'Reachable']
    ];
    return `<div class="pmpro-check-list">${checks.map((item, index) => `<div class="pmpro-check-row" data-state="${draft.device.state === 'ready' || index < (draft.device.check_index || 0) ? 'done' : index === (draft.device.check_index || 0) && draft.device.state === 'checking' ? 'active' : 'waiting'}"><span class="pmpro-check-icon">${draft.device.state === 'ready' || index < (draft.device.check_index || 0) ? icon.check : icon.history}</span><span><strong>${escapeHtml(item[0])}</strong><small>${escapeHtml(item[1])}</small></span><span>${draft.device.state === 'ready' || index < (draft.device.check_index || 0) ? 'Done' : index === (draft.device.check_index || 0) && draft.device.state === 'checking' ? 'Checking' : 'Waiting'}</span></div>`).join('')}</div>${assurance('This check does not create a Project or contact an AI provider.')}`;
  }

  function readyBody() {
    return `
      ${statusCard('Device ready', draft.device.name, 'Project files and work can be prepared here.', icon.device)}
      <div class="pmpro-choice-grid">
        <button type="button" class="pmpro-choice" data-intent="create">${choiceIcon(icon.spark)}<strong>Create a new Project</strong><p>Start with a name, a safe place for files, and helpful defaults.</p>${pill('Recommended', 'recommended')}</button>
        <button type="button" class="pmpro-choice" data-intent="existing">${choiceIcon(icon.folder)}<strong>Use work that already exists</strong><p>Open a folder, online source, or network location.</p></button>
        <button type="button" class="pmpro-choice" data-intent="restore">${choiceIcon(icon.history)}<strong>Restore a Project</strong><p>Recover a previous Puppet Master Project or backup.</p></button>
      </div>`;
  }

  function projectStartBody() {
    const restore = draft.project.intent === 'restore';
    return `
      <div class="pmpro-choice-grid">
        <button type="button" class="pmpro-choice" data-start-source="folder" data-selected="${draft.source.mode === 'folder'}">${choiceIcon(icon.folder)}<strong>${restore ? 'A backup file on this computer' : 'A folder on this computer'}</strong><p>${restore ? 'Inspect a saved Puppet Master backup.' : 'Use files that already live here.'}</p></button>
        <button type="button" class="pmpro-choice" data-start-source="existing_remote" data-selected="${draft.source.mode === 'existing_remote'}">${choiceIcon(icon.cloud)}<strong>${restore ? 'A cloud backup' : 'An online copy'}</strong><p>${restore ? 'Sign in only to the backup service you choose.' : 'Choose work from GitHub or another source service.'}</p></button>
        <button type="button" class="pmpro-choice" data-start-source="network" data-selected="${draft.storage.kind === 'network'}">${choiceIcon(icon.server)}<strong>A NAS or another computer</strong><p>Use a secure network connection. SSH is the default.</p></button>
        <button type="button" class="pmpro-choice" data-start-source="backup" data-selected="${draft.source.mode === 'backup'}">${choiceIcon(icon.history)}<strong>A Puppet Master backup</strong><p>Inspect it before anything is restored.</p></button>
      </div>`;
  }

  function basicsBody() {
    return `
      <div class="pmpro-fields">
        <div class="pmpro-field"><label for="pmpro-project-name">Project name</label><input id="pmpro-project-name" data-bind="project.name" maxlength="120" value="${escapeAttr(draft.project.name)}" placeholder="Neighborhood Book Club"><small>You can change this later.</small></div>
        <div class="pmpro-field"><label for="pmpro-project-description">What are you making? <span style="font-weight:500;color:var(--pmpro-faint)">Optional</span></label><textarea id="pmpro-project-description" data-bind="project.description" placeholder="A simple website for our neighborhood book club.">${escapeHtml(draft.project.description)}</textarea></div>
      </div>${assurance()}`;
  }

  function appearanceBody() {
    return `
      <div class="pmpro-theme-grid">${Object.entries(themeWorlds).map(([id, theme]) => `
        <button type="button" class="pmpro-theme-tile" data-theme-family="${id}" data-selected="${draft.theme.family === id}">
          <span class="pmpro-theme-preview">${themePreviewSvg(id)}</span><strong>${theme.name}</strong><small>${theme.note}</small>
        </button>`).join('')}</div>
      <div class="pmpro-preview-card">
        <div class="pmpro-switch-row"><div class="pmpro-switch-copy"><strong>Light appearance</strong><span>Switch the whole material world, not only the colors.</span></div><button type="button" class="pmpro-switch" data-tone-toggle aria-pressed="${draft.theme.tone === 'light'}" aria-label="Use light appearance"></button></div>
        <div class="pmpro-switch-row"><div class="pmpro-switch-copy"><strong>Reduced Motion</strong><span>Keep cause and effect clear with restrained movement.</span></div><button type="button" class="pmpro-switch" data-toggle="theme.reduced" aria-pressed="${draft.theme.reduced}" aria-label="Use Reduced Motion"></button></div>
      </div>`;
  }

  function storageBody() {
    const selected = draft.storage.kind;
    return `
      <div class="pmpro-choice-grid">
        <button type="button" class="pmpro-choice" data-select="storage.kind" data-value="local" data-selected="${selected === 'local'}">${choiceIcon(icon.device)}<strong>Keep the files on this computer</strong><p>Fast and simple. Best for most first Projects.</p>${pill('Recommended', 'recommended')}</button>
        <button type="button" class="pmpro-choice" data-select="storage.kind" data-value="existing_folder" data-selected="${selected === 'existing_folder'}">${choiceIcon(icon.folder)}<strong>Use a folder that already exists</strong><p>Choose an exact place on this computer.</p></button>
        <button type="button" class="pmpro-choice" data-select="storage.kind" data-value="network" data-selected="${selected === 'network'}">${choiceIcon(icon.server)}<strong>Use a NAS or another computer</strong><p>Puppet Master can guide the secure connection.</p></button>
        <button type="button" class="pmpro-choice" data-select="storage.kind" data-value="cloud_folder" data-selected="${selected === 'cloud_folder'}">${choiceIcon(icon.cloud)}<strong>Use a cloud-synced folder</strong><p>Another app keeps a normal folder copied online.</p></button>
      </div>
      ${selected === 'network' ? `<div class="pmpro-info-card">${icon.shield}<div><strong>Secure Shell (SSH) is selected</strong><p>SSH makes an encrypted connection and avoids mounting the whole NAS. Puppet Master can automate the keys after you verify the storage identity.</p><div class="pmpro-segment" style="margin-top:11px"><button type="button" data-select="storage.network.transport" data-value="ssh" aria-pressed="${draft.storage.network.transport === 'ssh'}">SSH · default</button><button type="button" data-select="storage.network.transport" data-value="smb" aria-pressed="${draft.storage.network.transport === 'smb'}">SMB</button><button type="button" data-select="storage.network.transport" data-value="nfs" aria-pressed="${draft.storage.network.transport === 'nfs'}">NFS</button></div></div></div>` : ''}
      <details class="pmpro-details"><summary>How these choices differ</summary><div class="pmpro-details-body">Local files are easiest. Network storage keeps files on another device. A cloud-synced folder is still a normal folder, but another app copies it online. Online source hosting is a separate choice on the next screen.</div></details>`;
  }

  function sshCheckRows() {
    const phases = [
      ['Find the storage device', 'Read only the address you entered'],
      ['Read its public identity', 'Pause before trust'],
      ['Create an Ed25519 key on this device', 'Private key never leaves this computer'],
      ['Install only the public key', 'Password is used once and discarded'],
      ['Test the selected Project folder', 'Confirm read and write access']
    ];
    const state = draft.storage.network.state;
    const index = draft.storage.network.phase_index || 0;
    return `<div class="pmpro-check-list">${phases.map((phase, position) => {
      let rowState = 'waiting';
      if (state === 'ready' || position < index) rowState = 'done';
      else if (['scanning', 'installing', 'testing'].includes(state) && position === index) rowState = 'active';
      else if (state === 'failed' && position === index) rowState = 'error';
      return `<div class="pmpro-check-row" data-state="${rowState}"><span class="pmpro-check-icon">${rowState === 'done' ? icon.check : rowState === 'error' ? icon.close : icon.history}</span><span><strong>${phase[0]}</strong><small>${phase[1]}</small></span><span>${rowState === 'done' ? 'Done' : rowState === 'active' ? 'Working' : rowState === 'error' ? 'Needs you' : 'Waiting'}</span></div>`;
    }).join('')}</div>`;
  }

  function sshBody() {
    const network = draft.storage.network;
    if (network.state === 'ready') {
      return `${statusCard('Secure connection ready', `${network.user}@${network.host}`, `${network.folder} · identity approved · public key tested`, icon.key)}${sshCheckRows()}<details class="pmpro-details"><summary>View the connection receipt</summary><div class="pmpro-details-body"><code>${escapeHtml(JSON.stringify(network.receipt, null, 2))}</code></div></details>`;
    }
    return `
      <div class="pmpro-fields">
        <div class="pmpro-field-row">
          <div class="pmpro-field"><label for="pmpro-ssh-host">NAS or computer name</label><input id="pmpro-ssh-host" data-bind="storage.network.host" value="${escapeAttr(network.host)}" placeholder="my-nas.local"></div>
          <div class="pmpro-field"><label for="pmpro-ssh-user">User name</label><input id="pmpro-ssh-user" data-bind="storage.network.user" value="${escapeAttr(network.user)}" placeholder="alex"></div>
        </div>
        <div class="pmpro-field"><label for="pmpro-ssh-folder">Project folder</label><input id="pmpro-ssh-folder" data-bind="storage.network.folder" value="${escapeAttr(network.folder)}" placeholder="/projects"><small>Puppet Master checks this location without creating the new Project folder.</small></div>
      </div>
      ${network.state === 'fingerprint' || network.state === 'failed' ? `
        <div class="pmpro-fingerprint">
          <div class="pmpro-fingerprint-art"><svg width="53" height="53" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M30 7c-10 0-18 8-18 18 0 12-2 21-7 28M30 14c-6 0-11 5-11 11 0 13-2 23-7 30M30 21c-2 0-4 2-4 4 0 14-1 24-5 31M30 7c10 0 18 8 18 18 0 12 2 21 7 28M30 14c6 0 11 5 11 11 0 13 2 23 7 30M30 21c2 0 4 2 4 4 0 14 1 24 5 31M30 28v26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div><strong>Does this identity match your storage?</strong><p>Compare it with the fingerprint shown by the NAS settings or administrator.</p><code>${escapeHtml(network.fingerprint)}</code></div>
        </div>
        <div class="pmpro-assurance" style="color:var(--pmpro-warning)">${icon.info}<span>A network scan can find a key, but it cannot prove whose key it is. You approve it before Puppet Master continues.</span></div>` : ''}
      ${['scanning', 'installing', 'testing', 'failed'].includes(network.state) ? sshCheckRows() : ''}`;
  }

  function sourceBody() {
    const selected = draft.source.mode;
    return `
      <div class="pmpro-choice-grid">
        <button type="button" class="pmpro-choice" data-select="source.mode" data-value="local_history" data-selected="${selected === 'local_history'}">${choiceIcon(icon.history)}<strong>Remember changes on this computer</strong><p>Return to earlier versions without an online account.</p>${pill('Simple start', 'recommended')}</button>
        <button type="button" class="pmpro-choice" data-select="source.mode" data-value="new_remote" data-selected="${selected === 'new_remote'}">${choiceIcon(icon.cloud)}<strong>Create a private online copy</strong><p>Sign in now. The online Project is created only after review.</p></button>
        <button type="button" class="pmpro-choice" data-select="source.mode" data-value="existing_remote" data-selected="${selected === 'existing_remote'}">${choiceIcon(icon.folder)}<strong>Use an online copy that exists</strong><p>Sign in and choose it without creating another.</p></button>
        <button type="button" class="pmpro-choice" data-select="source.mode" data-value="none" data-selected="${selected === 'none'}">${choiceIcon(icon.edit)}<strong>Decide later</strong><p>Start without Project history or an online copy.</p></button>
      </div>
      <details class="pmpro-details"><summary>What are Project history and an online source host?</summary><div class="pmpro-details-body"><strong>Project history</strong> lets you return to an earlier change. A <strong>repository</strong> is the folder plus that history. An <strong>online source host</strong>, such as GitHub, keeps an optional online copy and can help people work together. Project sync, backup, and remote access are separate features.</div></details>`;
  }

  function sourceAuthBody() {
    const services = [
      ['github', 'GH', 'GitHub', 'Popular for public and private Projects'],
      ['gitlab', 'GL', 'GitLab', 'Online or self-hosted'],
      ['bitbucket', 'BB', 'Bitbucket', 'Works with Atlassian accounts'],
      ['forgejo', 'FJ', 'Forgejo or Gitea', 'For a source host you control']
    ];
    return `
      <div class="pmpro-service-list">${services.map(([id, initials, name, note]) => {
        const ready = draft.source.service === id && draft.source.account_state === 'ready';
        return `<div class="pmpro-service-row" data-service="${id}"><span class="pmpro-service-logo">${initials}</span><span class="pmpro-service-copy"><strong>${name}</strong><span>${ready ? `Signed in as ${escapeHtml(draft.source.account_name || 'jared-example')}` : note}</span></span><span class="pmpro-service-actions">${ready ? pill('Ready', 'ready') : `<button type="button" class="pmpro-mini-button" data-source-auth="signup" data-service="${id}">Create account</button><button type="button" class="pmpro-mini-button pmpro-primary" data-source-auth="signin" data-service="${id}">Sign In</button>`}</span></div>`;
      }).join('')}</div>
      ${draft.source.mode === 'new_remote' ? `<div class="pmpro-fields"><div class="pmpro-field-row"><div class="pmpro-field"><label for="pmpro-remote-name">Online Project name</label><input id="pmpro-remote-name" data-bind="source.remote_name" value="${escapeAttr(draft.source.remote_name)}"></div><div class="pmpro-field"><span>Visibility</span><div class="pmpro-segment"><button type="button" data-select="source.visibility" data-value="private" aria-pressed="${draft.source.visibility === 'private'}">Private</button><button type="button" data-select="source.visibility" data-value="public" aria-pressed="${draft.source.visibility === 'public'}">Public</button></div></div></div></div>` : ''}
      <div class="pmpro-info-card">${icon.shield}<div><strong>Sign-in is separate from Project creation</strong><p>Signing in may list work you can access. A new online repository stays in this draft until you press ${draft.project.intent === 'create' ? 'Create Project' : draft.project.intent === 'restore' ? 'Restore Project' : 'Add Project'} on the review screen.</p></div></div>`;
  }

  function inheritBody() {
    const projects = [
      { id: 'family-planner', name: 'Family Planner', note: 'Used yesterday · same computer', groups: ['Planning preferences', 'Permissions', 'AI routes', 'Notifications', 'Testing defaults'] },
      { id: 'recipe-box', name: 'Recipe Box', note: 'Used last week · local Project', groups: ['Planning preferences', 'Notifications', 'Testing defaults'] }
    ];
    const selected = draft.inherit.mode === 'copy' ? projects.find(project => project.id === draft.inherit.from) : null;
    return `
      <div class="pmpro-choice-grid pmpro-one">
        <button type="button" class="pmpro-choice pmpro-compact" data-inherit="fresh" data-selected="${draft.inherit.mode === 'fresh'}">${choiceIcon(icon.spark)}<span><strong>Start fresh</strong><p>Use the newest recommended settings.</p></span>${pill('Default', 'recommended')}</button>
        ${projects.map(project => `<button type="button" class="pmpro-choice pmpro-compact" data-inherit="${project.id}" data-selected="${draft.inherit.mode === 'copy' && draft.inherit.from === project.id}">${choiceIcon(icon.history)}<span><strong>Start like ${project.name}</strong><p>${project.note}</p></span>${draft.inherit.from === project.id ? pill('Selected', 'ready') : ''}</button>`).join('')}
      </div>
      ${selected ? `<div class="pmpro-preview-card"><strong style="font-size:11px">What will be reused from ${escapeHtml(selected.name)}</strong><p style="margin:5px 0 0;color:var(--pmpro-muted);font-size:9px;line-height:1.5">Planning preferences, permissions, provider routes, notifications, and testing defaults. Your files, history, Goals, and Plans stay separate.</p>${selected.groups.map(group => `<div class="pmpro-switch-row"><div class="pmpro-switch-copy"><strong>${group}</strong><span>${inheritGroupDescription(group)}</span></div><button type="button" class="pmpro-switch" data-inherit-group="${group}" aria-pressed="${draft.inherit.groups.includes(group)}" aria-label="Copy ${group}"></button></div>`).join('')}</div>` : ''}
      <details class="pmpro-details"><summary>What never gets copied?</summary><div class="pmpro-details-body">Project files, source history, passwords, API keys, personal memory, unfinished work, Goals, and Plans stay with the original Project. Explicit choices in this new Project win over inherited defaults.</div></details>`;
  }

  function inheritGroupDescription(group) {
    return {
      'Planning preferences': 'Question depth, review style, and planning defaults',
      'Permissions': 'What work may read or change',
      'AI routes': 'Preferred account references; secrets are not copied',
      'Notifications': 'Which useful events get your attention',
      'Testing defaults': 'How checks and evidence are shown'
    }[group] || 'Eligible settings from the canonical Settings Transfer preview';
  }

  function preferencesBody() {
    return `<div class="pmpro-preview-card">
      <div class="pmpro-switch-row"><div class="pmpro-switch-copy"><strong>Remember changes automatically</strong><span>Return to earlier versions without learning source control.</span></div><button type="button" class="pmpro-switch" data-toggle="preferences.history" aria-pressed="${draft.preferences.history}" aria-label="Remember changes automatically"></button></div>
      <div class="pmpro-switch-row"><div class="pmpro-switch-copy"><strong>Use simpler explanations</strong><span>Technical words are explained the first time they appear.</span></div><button type="button" class="pmpro-switch" data-toggle="preferences.simple_explanations" aria-pressed="${draft.preferences.simple_explanations}" aria-label="Use simpler explanations"></button></div>
      <div class="pmpro-switch-row"><div class="pmpro-switch-copy"><strong>Remind me about backup later</strong><span>The Project works without it; backup remains a separate recoverability choice.</span></div><button type="button" class="pmpro-switch" data-toggle="preferences.backup_later" aria-pressed="${draft.preferences.backup_later}" aria-label="Remind me about backup later"></button></div>
    </div>`;
  }

  function storageSummary() {
    if (draft.storage.kind === 'network') return `on ${draft.storage.network.host} over ${draft.storage.network.transport.toUpperCase()}`;
    if (draft.storage.kind === 'existing_folder') return 'in the folder you choose on this computer';
    if (draft.storage.kind === 'cloud_folder') return 'in a cloud-synced folder on this computer';
    return 'on this computer';
  }

  function sourceSummary() {
    if (draft.source.mode === 'new_remote') return `Create one ${draft.source.visibility} ${capitalize(draft.source.service)} online repository`;
    if (draft.source.mode === 'existing_remote') return `Use the selected ${capitalize(draft.source.service)} online repository`;
    if (draft.source.mode === 'none') return 'Decide about Project history later';
    return 'Keep recoverable Project history on this computer';
  }

  function buildPendingEffects() {
    const effects = [
      { id: 'project_record', label: `${draft.project.intent === 'restore' ? 'Restore' : draft.project.intent === 'existing' ? 'Add' : 'Create'} one Puppet Master Project record` },
      { id: 'destination', label: `Prepare files ${storageSummary()}` }
    ];
    if (draft.source.mode === 'local_history' || draft.preferences.history) effects.push({ id: 'history', label: 'Start automatic local Project history' });
    effects.push({ id: 'appearance', label: `Apply the ${themeWorlds[draft.theme.family].name} ${draft.theme.tone} appearance` });
    if (draft.source.mode === 'new_remote') effects.push({ id: 'remote_create', label: `Create one ${draft.source.visibility} ${capitalize(draft.source.service)} repository` });
    if (draft.source.mode === 'existing_remote') effects.push({ id: 'remote_attach', label: `Attach the selected ${capitalize(draft.source.service)} repository` });
    if (draft.inherit.mode === 'copy') effects.push({ id: 'settings_copy', label: `Copy ${draft.inherit.groups.length} eligible settings groups` });
    draft.pending_side_effects = effects;
  }

  function reviewBody() {
    buildPendingEffects();
    const rows = [
      [icon.edit, 'Project', draft.project.name || 'Untitled', draft.project.intent === 'create' ? 'basics' : 'project_start'],
      [icon.folder, 'Files', storageSummary(), 'storage'],
      [icon.device, 'Work computer', draft.device.name, 'device'],
      [icon.history, 'Project history', sourceSummary(), 'source'],
      [icon.spark, 'Starting point', draft.inherit.mode === 'copy' ? `Start like ${draft.inherit.from === 'recipe-box' ? 'Recipe Box' : 'Family Planner'}` : 'Start fresh', 'inherit'],
      [icon.palette, 'Appearance', `${themeWorlds[draft.theme.family].name} · ${capitalize(draft.theme.tone)}`, 'appearance']
    ];
    return `
      <div class="pmpro-summary-list">${rows.map(([rowIcon, label, value, edit]) => `<div class="pmpro-summary-row">${rowIcon}<span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(value)}</small></span><button type="button" data-edit-step="${edit}">Edit</button></div>`).join('')}</div>
      <div class="pmpro-info-card">${icon.shield}<div><strong>What the final action will do</strong><p>${draft.pending_side_effects.map(effect => escapeHtml(effect.label)).join(' · ')}</p></div></div>
      ${assurance('Connections and sign-ins completed during preflight stay available if you go Back. The Project itself still does not exist.')}`;
  }

  function commitTitle() {
    if (draft.commit.status === 'succeeded') return 'Project created <em>once.</em>';
    if (draft.commit.status === 'failed') return 'The operation is safe to <em>resume.</em>';
    return `${draft.project.intent === 'restore' ? 'Restoring' : draft.project.intent === 'existing' ? 'Adding' : 'Creating'} your <em>Project.</em>`;
  }

  function commitLead() {
    if (draft.commit.status === 'succeeded') return 'The durable receipt is saved. Reopening this operation cannot create a duplicate Project.';
    if (draft.commit.status === 'failed') return 'Finished phases and the draft are intact. Retry continues the same operation instead of starting another.';
    return 'Each finished phase is recorded. There are no fabricated percentages and no hidden duplicate work.';
  }

  function commitBody() {
    buildPendingEffects();
    const phase = draft.commit.phase_index || 0;
    return `<div class="pmpro-check-list">${draft.pending_side_effects.map((effect, index) => {
      const state = draft.commit.status === 'succeeded' || index < phase ? 'done' : draft.commit.status === 'running' && index === phase ? 'active' : draft.commit.status === 'failed' && index === phase ? 'error' : 'waiting';
      return `<div class="pmpro-check-row" data-state="${state}"><span class="pmpro-check-icon">${state === 'done' ? icon.check : state === 'error' ? icon.close : icon.history}</span><span><strong>${escapeHtml(effect.label)}</strong><small>${state === 'done' ? 'Receipt recorded' : state === 'active' ? 'Current phase' : state === 'error' ? 'Can resume safely' : 'Waiting'}</small></span><span>${state === 'done' ? 'Done' : state === 'active' ? 'Working' : state === 'error' ? 'Paused' : 'Waiting'}</span></div>`;
    }).join('')}</div>${draft.commit.status === 'succeeded' ? `<div class="pmpro-receipt-card"><span class="pmpro-pill pmpro-ready">Creation receipt</span><p style="margin:10px 0 0;color:var(--pmpro-muted);font-size:10px;line-height:1.5">Operation <code>${escapeHtml(draft.commit.operation_id)}</code><br>Receipt <code>${escapeHtml(draft.commit.receipt?.receipt_id || '')}</code><br>${draft.pending_side_effects.length} unique side effects completed.</p></div>` : draft.commit.status === 'failed' ? `<div class="pmpro-info-card">${icon.info}<div><strong>The concept simulated an interruption</strong><p>No duplicate Project was created. Retry uses the same idempotency key and starts at the unfinished phase.</p></div></div>` : ''}`;
  }

  function providerBody() {
    const accounts = [
      ['claude', 'CC', 'Claude subscription', 'Installed and signed in on this computer', 'ready'],
      ['codex', 'CX', 'Codex', 'Command-line app is not installed', draft.provider.accounts.codex],
      ['gemini', 'GM', 'Gemini API', 'Account sign-in is needed', draft.provider.accounts.gemini],
      ['openai_api', 'API', 'OpenAI API', 'Uses a billed developer key', draft.provider.accounts.openai_api]
    ];
    return `
      <div class="pmpro-service-list">${accounts.map(([id, initials, name, description, state]) => `<div class="pmpro-service-row"><span class="pmpro-service-logo">${initials}</span><span class="pmpro-service-copy"><strong>${name}</strong><span>${state === 'ready' ? description : state === 'missing_cli' ? 'Official app required on this computer' : state === 'needs_signin' ? 'Installed · sign-in needed' : state === 'needs_key' ? 'Enter one protected API key' : description}</span></span><span class="pmpro-service-actions">${state === 'ready' ? pill('Ready', 'ready') : state === 'missing_cli' ? `<button type="button" class="pmpro-mini-button pmpro-primary" data-provider-action="install" data-provider="${id}">Install</button>` : state === 'needs_signin' ? `<button type="button" class="pmpro-mini-button pmpro-primary" data-provider-action="signin" data-provider="${id}">Sign In</button>` : `<button type="button" class="pmpro-mini-button pmpro-primary" data-provider-action="key" data-provider="${id}">Enter API Key</button>`}</span></div>`).join('')}</div>
      <div class="pmpro-choice-grid pmpro-one" style="margin-top:13px"><button type="button" class="pmpro-choice pmpro-compact" data-provider-action="more">${choiceIcon(icon.plus)}<span><strong>See all providers or add another account</strong><p>Additional accounts stay independent; adding one never logs another out.</p></span></button></div>
      <details class="pmpro-details"><summary>What powers Puppet Master?</summary><div class="pmpro-details-body">An AI subscription, local model, or API account supplies the AI for Assistant Chat, planning, and work. One Ready account is enough to begin. Technical path, adapter, version, endpoint, and usage-source details stay in Provider Settings.</div></details>`;
  }

  function freeModelsBody() {
    const options = [
      ['local-small', 'Local Starter', 'Runs on this computer for short private tasks'],
      ['open-router-free', 'Free hosted choices', 'Availability and limits can vary'],
      ['community', 'Community models', 'Good for experimentation and low-risk work']
    ];
    return `
      <div class="pmpro-service-list">${options.map(([id, name, note]) => `<button type="button" class="pmpro-choice pmpro-compact" data-free-model="${id}" data-selected="${draft.free_models.selected.includes(id)}">${choiceIcon(icon.spark)}<span><strong>${name}</strong><p>${note}</p></span>${draft.free_models.selected.includes(id) ? pill('Selected', 'ready') : ''}</button>`).join('')}</div>
      <div class="pmpro-info-card">${icon.info}<div><strong>Free Models are optional</strong><p>They can be useful for suitable tasks, but availability, speed, and limits can change. Puppet Master shows their actual readiness later.</p></div></div>`;
  }

  function finishBody() {
    return `
      <div class="pmpro-status-card" style="border-color:color-mix(in srgb,var(--pmpro-success) 27%,var(--pmpro-line))"><span class="pmpro-pill pmpro-ready">Project ready</span><h3 style="margin:13px 0 0;font-size:17px">${escapeHtml(draft.project.name || 'My first Project')}</h3><p>Files live ${escapeHtml(storageSummary())}. ${escapeHtml(sourceSummary())}.</p></div>
      <div class="pmpro-choice-grid">
        <button type="button" class="pmpro-choice" data-action="open-planning-wizard">${choiceIcon(icon.spark)}<strong>Open Planning Wizard</strong><p>Turn the idea into a reviewed, build-ready plan.</p>${pill('Best next step', 'recommended')}</button>
        <button type="button" class="pmpro-choice" data-action="begin-tour">${choiceIcon(icon.play)}<strong>Take the Guided Tour</strong><p>Learn by doing in a safe practice Project.</p></button>
      </div>`;
  }

  function stepDefinition(step) {
    const definitions = {
      welcome: {
        eyebrow: 'Welcome', title: 'From first idea to <em>finished work.</em>',
        lead: 'Puppet Master helps shape your idea, review the plan, and coordinate the work without making you learn developer tools first.',
        body: welcomeBody, footer: () => ''
      },
      device: {
        eyebrow: 'Device setup', title: 'Where should Puppet Master <em>do the work?</em>',
        lead: 'Most people should use this computer. You can add another work computer later.',
        body: deviceBody, footer: () => primaryButton('Continue', 'check-device', false, true)
      },
      pairing: {
        eyebrow: draft.device.mode === 'server' ? 'Server setup' : 'Connect a device',
        title: draft.device.mode === 'server' ? 'How should the other device <em>begin?</em>' : 'Find the Puppet Master you <em>already have.</em>',
        lead: draft.device.mode === 'server' ? 'Start with a nearby device, a new installation, or a backup. Details appear only for the route you choose.' : 'Nearby discovery is easiest. Pairing codes and addresses remain available when the device is elsewhere.',
        body: pairingBody,
        footer: () => primaryButton('Continue', 'check-device', (draft.device.mode === 'existing' && draft.device.pairing.method !== 'lan' && !draft.device.pairing.code.trim()) || (draft.device.mode === 'server' && !['discover', 'install', 'restore'].includes(draft.device.pairing.method)), true)
      },
      device_check: {
        eyebrow: 'Readiness check', title: draft.device.state === 'ready' ? 'This device is <em>ready.</em>' : 'Checking only what the next step <em>needs.</em>',
        lead: draft.device.state === 'ready' ? 'The readiness receipt is saved. No Project or provider work has begun.' : 'A bounded check avoids probing every service or tool at startup.',
        body: readinessBody,
        footer: () => draft.device.state === 'ready' ? primaryButton('Continue', 'next', false, true) : primaryButton('Checking…', 'none', true)
      },
      ready: {
        eyebrow: 'Device ready', title: 'This device is ready to meet your <em>Puppet Master.</em>',
        lead: 'Create something new, bring in work you already have, or restore a previous Project.',
        body: readyBody, footer: () => ''
      },
      project_start: {
        eyebrow: draft.project.intent === 'restore' ? 'Restore a Project' : 'Use existing work',
        title: draft.project.intent === 'restore' ? 'Where is the <em>backup?</em>' : 'Where is the work <em>today?</em>',
        lead: draft.project.intent === 'restore' ? 'Choose a recoverable copy. Puppet Master inspects it before restoring anything.' : 'Choose the description that feels familiar. Technical details remain hidden until needed.',
        body: projectStartBody, footer: () => primaryButton('Continue', 'next', false, true)
      },
      basics: {
        eyebrow: 'Project basics', title: 'What should we <em>call it?</em>',
        lead: 'A clear name and one sentence help Puppet Master keep every plan focused.',
        body: basicsBody, footer: () => primaryButton('Continue', 'next', !draft.project.name.trim(), true)
      },
      appearance: {
        eyebrow: 'Appearance', title: 'Make the workspace feel <em>like yours.</em>',
        lead: 'Each style changes illustration, material, shape, focus, and motion—not only the accent color.',
        body: appearanceBody, footer: () => primaryButton('Continue', 'next', false, true)
      },
      storage: {
        eyebrow: 'Project files', title: 'Where should the <em>files live?</em>',
        lead: 'Use this computer for the easiest start. A NAS or another computer works securely too.',
        body: storageBody, footer: () => primaryButton('Continue', 'next', false, true)
      },
      ssh: {
        eyebrow: 'Secure network storage', title: 'Let Puppet Master prepare the <em>SSH connection.</em>',
        lead: 'Confirm the storage identity, enter its password once, and Puppet Master can create the keys and test the folder.',
        body: sshBody,
        footer: () => {
          const state = draft.storage.network.state;
          if (state === 'ready') return primaryButton('Continue', 'next', false, true);
          if (state === 'fingerprint' || state === 'failed') return primaryButton(state === 'failed' ? 'Verify and retry' : 'Yes, this is my storage', 'verify-ssh', false);
          if (['scanning', 'installing', 'testing'].includes(state)) return primaryButton('Working securely…', 'none', true);
          return primaryButton('Check this storage', 'scan-ssh', !draft.storage.network.host.trim() || !draft.storage.network.user.trim());
        }
      },
      source: {
        eyebrow: 'Project history', title: 'How should changes be <em>kept safe?</em>',
        lead: 'Puppet Master can remember every change locally. An online source service is optional.',
        body: sourceBody, footer: () => primaryButton('Continue', 'next', false, true)
      },
      source_auth: {
        eyebrow: 'Online source account', title: 'Choose where the online copy will <em>live.</em>',
        lead: 'Sign in or create an account here. Nothing is created for this Project until the final confirmation.',
        body: sourceAuthBody, footer: () => primaryButton('Continue', 'next', draft.source.account_state !== 'ready', true)
      },
      inherit: {
        eyebrow: 'Optional shortcut', title: 'Start fresh, or borrow <em>helpful settings.</em>',
        lead: 'Copying settings does not copy another Project’s files, history, Goals, or Plans.',
        body: inheritBody, footer: () => primaryButton('Continue', 'next', false, true)
      },
      preferences: {
        eyebrow: 'Helpful defaults', title: 'A few choices. <em>No homework.</em>',
        lead: 'These defaults keep the first Project safe and easy to understand. Advanced settings stay out of the way.',
        body: preferencesBody, footer: () => primaryButton('Review Project', 'next', false, true)
      },
      review: {
        eyebrow: 'Review before creation', title: 'Everything looks ready. <em>Nothing exists yet.</em>',
        lead: 'Check the route below. The final button is the first action that may create a Project, folder, history, or online repository.',
        body: reviewBody, footer: () => primaryButton(commitLabel(), 'commit-project')
      },
      commit: {
        eyebrow: 'Project operation', title: commitTitle(), lead: commitLead(), body: commitBody,
        footer: () => draft.commit.status === 'succeeded' ? primaryButton('Choose what powers Puppet Master', 'next', false, true) : draft.commit.status === 'failed' ? primaryButton('Retry safely', 'retry-commit') : primaryButton('Working…', 'none', true)
      },
      provider: {
        eyebrow: 'Project created · AI setup', title: 'Choose what powers <em>Puppet Master.</em>',
        lead: 'Use an AI subscription or API account you already have. One Ready account is enough; you can add more later.',
        body: providerBody,
        footer: () => `${secondaryButton('Skip', 'skip-provider')}${primaryButton('Continue', 'next', false, true)}`
      },
      free_models: {
        eyebrow: 'Optional next phase', title: 'Set up <em>Free Models?</em>',
        lead: 'Add free options for suitable tasks. Availability and limits can vary.',
        body: freeModelsBody,
        footer: () => `${secondaryButton('Skip', 'skip-free-models')}${primaryButton(draft.free_models.selected.length ? 'Set up selected models' : 'Continue', 'finish-free-models', false, true)}`
      },
      finish: {
        eyebrow: 'Ready', title: 'Your Project has a <em>clear next step.</em>',
        lead: 'Open Planning Wizard to shape the idea, or practice the workspace with the Guided Tour.',
        body: finishBody, footer: () => primaryButton('Close', 'finish-close')
      }
    };
    return definitions[step] || definitions.welcome;
  }

  function commitLabel() {
    if (draft.project.intent === 'restore') return 'Restore Project';
    if (draft.project.intent === 'existing') return 'Add Project';
    return 'Create Project';
  }

  function renderStep({ animate = true, focus = true } = {}) {
    const definition = stepDefinition(stepId);
    setScene(stepId, animate);
    root.dataset.step = stepId;
    $('#pmpro-draft-state').textContent = draft.commit.status === 'succeeded' ? 'Project created · optional setup can resume' : 'Safe setup draft · saved on this device';
    content.innerHTML = `<p class="pmpro-eyebrow">${definition.eyebrow}</p><h1 id="pmpro-title" tabindex="-1">${definition.title}</h1><p class="pmpro-lead">${definition.lead}</p>${definition.body()}`;
    content.className = `pmpro-content${animate ? ' pmpro-content-enter' : ''}`;
    content.scrollTop = 0;
    footer.innerHTML = definition.footer();
    $('[data-pmpro="back"]', root).hidden = stepId === 'welcome' || stepId === 'device' || stepId === 'commit' || stepId === 'finish';
    $('#pmpro-bottom-note').textContent = bottomNote();
    progressMarkup();
    bindStepFields();
    applyTheme();
    transitioning = false;
    if (focus) requestAnimationFrame(() => $('#pmpro-title')?.focus({ preventScroll: true }));
  }

  function transitionTo(next, nextDirection = 'forward') {
    if (!next || transitioning || next === stepId) return;
    transitioning = true;
    markStepComplete(stepId);
    direction = nextDirection;

    const runEntryAction = () => {
      if (stepId === 'device_check' && draft.device.state !== 'ready') runDeviceCheck();
      if (stepId === 'commit' && draft.commit.status === 'not_started') runCommit();
    };

    if (!reducedMotion() && typeof document.startViewTransition === 'function') {
      const serial = ++stepTransitionSerial;
      document.documentElement.dataset.pmproStepTransition = 'true';
      document.documentElement.dataset.pmproStepDirection = nextDirection;
      let entryStarted = false;
      const startEntryOnce = () => {
        if (entryStarted) return;
        entryStarted = true;
        runEntryAction();
      };
      const transition = document.startViewTransition(() => {
        stepId = next;
        saveDraft();
        renderStep({ animate: false });
        transitioning = false;
      });
      transition.ready.then(startEntryOnce).catch(startEntryOnce);
      transition.finished.finally(() => {
        startEntryOnce();
        if (serial === stepTransitionSerial) {
          delete document.documentElement.dataset.pmproStepTransition;
          delete document.documentElement.dataset.pmproStepDirection;
          transitioning = false;
        }
      });
      return;
    }

    content.className = `pmpro-content ${nextDirection === 'back' ? 'pmpro-content-leave-back' : 'pmpro-content-leave-forward'}`;
    scene.className = `pmpro-scene ${nextDirection === 'back' ? 'pmpro-scene-leave-back' : 'pmpro-scene-leave-forward'}`;
    const delay = reducedMotion() ? 1 : 250;
    setTimeout(() => {
      stepId = next;
      saveDraft();
      renderStep({ animate: !reducedMotion() });
      runEntryAction();
    }, delay);
  }

  function bindStepFields() {
    $$('[data-bind]', content).forEach(element => {
      element.addEventListener('input', () => {
        setPath(draft, element.dataset.bind, element.value);
        saveDraft();
        if (element.dataset.bind === 'project.name') {
          const continueButton = $('[data-action="next"]', footer);
          if (continueButton) continueButton.disabled = !element.value.trim();
        }
        if (element.dataset.bind === 'device.pairing.code') {
          const continueButton = $('[data-action="check-device"]', footer);
          if (continueButton) continueButton.disabled = !element.value.trim();
        }
      });
    });
  }

  function hideLegacyOverlays() {
    legacyHidden = [];
    const candidates = $$('body > div, body > section, body > dialog');
    candidates.forEach(element => {
      if (element.closest('#pmpro-root, #pmpro-tour-root, #pmpro-resume-chip, #pmpro-dev-launcher')) return;
      const text = (element.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const role = element.getAttribute('role');
      const style = getComputedStyle(element);
      const likelyOverlay = role === 'dialog' || ['fixed', 'absolute'].includes(style.position) && Number(style.zIndex || 0) > 100;
      if (likelyOverlay && (text.includes('guided tour') || text.includes('welcome to puppet master') || text.includes('onboarding'))) {
        legacyHidden.push([element, element.style.display]);
        element.style.display = 'none';
      }
    });
  }

  function restoreLegacyOverlays() {
    legacyHidden.forEach(([element, display]) => { if (element.isConnected) element.style.display = display; });
    legacyHidden = [];
  }

  function openOnboarding(start = null) {
    previousFocus = document.activeElement;
    hideLegacyOverlays();
    if (start) stepId = start;
    else stepId = draft.current_step || 'welcome';
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    tourRoot.hidden = true;
    document.documentElement.style.overflow = 'hidden';
    renderStep({ animate: true });
    resumeChip.hidden = true;
    windowEl.focus({ preventScroll: true });
  }

  function closeOnboarding() {
    saveDraft();
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    restoreLegacyOverlays();
    updateResumeChip();
    previousFocus?.focus?.({ preventScroll: true });
  }

  function updateResumeChip() {
    const committedButIncomplete = draft.commit.status === 'succeeded' && !store.get(COMPLETE_KEY);
    const midDraft = draft.current_step && !['welcome', 'finish'].includes(draft.current_step);
    const show = (committedButIncomplete || midDraft) && root.hidden && tourRoot.hidden;
    resumeChip.hidden = !show;
    $('#pmpro-resume-title').textContent = committedButIncomplete ? 'Continue optional setup' : 'Finish setting up';
    $('#pmpro-resume-detail').textContent = committedButIncomplete ? 'Your Project is safe. Provider setup can resume.' : 'Your reversible choices are saved on this device.';
  }

  function showToast(message) {
    const toast = $('#pmpro-toast');
    toast.innerHTML = `${icon.check}<span>${escapeHtml(message)}</span>`;
    toast.dataset.open = 'false';
    void toast.offsetWidth;
    toast.dataset.open = 'true';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.dataset.open = 'false'; }, 3150);
  }

  function showModal({ title, copy, kicker = 'Concept-safe fixture', browser = false, field = null, primary = 'Continue', action = 'modal-confirm', secondary = 'Cancel', extra = '' }) {
    modalLayer.hidden = false;
    modalLayer.innerHTML = `<div class="pmpro-modal">${browser ? `<div class="pmpro-browser-bar"><span class="pmpro-browser-dot"></span><span class="pmpro-browser-dot"></span><span class="pmpro-browser-dot"></span><span class="pmpro-browser-address">Official account page · returns to Puppet Master</span></div>` : ''}<div class="pmpro-modal-body"><span class="pmpro-modal-kicker">${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p>${field ? `<div class="pmpro-field" style="margin-top:16px"><label>${escapeHtml(field.label)}</label><input ${field.secret ? 'type="password"' : ''} data-modal-field value="${escapeAttr(field.value || '')}" placeholder="${escapeAttr(field.placeholder || '')}"></div>` : ''}${extra}<div class="pmpro-modal-actions"><button type="button" class="pmpro-button pmpro-secondary" data-modal-action="cancel">${escapeHtml(secondary)}</button><button type="button" class="pmpro-button pmpro-primary" data-modal-action="${action}">${escapeHtml(primary)}</button></div></div></div>`;
    requestAnimationFrame(() => $('[data-modal-action]:last-child', modalLayer)?.focus());
  }

  function closeModal() {
    modalLayer.hidden = true;
    modalLayer.innerHTML = '';
  }

  function resetConcept() {
    store.remove(DRAFT_KEY);
    store.remove(TOUR_KEY);
    store.remove(COMPLETE_KEY);
    store.remove(WORKSPACE_KEY);
    store.remove(THEME_KEY);
    draft = defaultDraft();
    stepId = 'welcome';
    tourState = defaultTourState();
    tourIndex = 0;
    showExternalToast('Onboarding and Guided Tour reset.');
    if (!root.hidden) renderStep({ animate: false });
    updateResumeChip();
  }

  async function runDeviceCheck() {
    draft.device.state = 'checking';
    draft.device.check_index = 0;
    saveDraft();
    renderStep({ animate: false, focus: false });
    const total = 4;
    for (let index = 0; index < total; index += 1) {
      draft.device.check_index = index;
      saveDraft();
      renderStep({ animate: false, focus: false });
      await sleep(reducedMotion() ? 25 : 430);
    }
    draft.device.check_index = total;
    draft.device.state = 'ready';
    draft.device.name = draft.device.mode === 'local' ? 'This computer' : draft.device.mode === 'existing' ? draft.device.pairing.selected || 'Studio Puppet Master' : 'New Puppet Master Server';
    saveDraft();
    renderStep({ animate: false });
    showToast('Readiness receipt saved');
  }

  async function scanSsh() {
    const network = draft.storage.network;
    network.state = 'scanning';
    network.phase_index = 0;
    saveDraft();
    renderStep({ animate: false, focus: false });
    await sleep(reducedMotion() ? 30 : 650);
    network.phase_index = 1;
    network.state = 'fingerprint';
    saveDraft();
    renderStep({ animate: false });
    showToast('Storage found · identity still needs your approval');
  }

  function askForSshPassword() {
    draft.storage.network.verified = true;
    saveDraft();
    showModal({
      title: 'Use the storage password once',
      copy: 'Puppet Master installs only this device’s public key and then tests it. The password is never saved.',
      kicker: 'One-time approval',
      field: { label: 'Storage password', value: 'concept-password', secret: true },
      primary: 'Install public key and test',
      action: 'ssh-install'
    });
  }

  async function finishSshConnection() {
    closeModal();
    const network = draft.storage.network;
    network.state = 'installing';
    network.phase_index = 2;
    saveDraft();
    renderStep({ animate: false, focus: false });
    await sleep(reducedMotion() ? 30 : 520);
    network.phase_index = 3;
    saveDraft();
    renderStep({ animate: false, focus: false });
    showToast('Public key installed · password discarded');
    await sleep(reducedMotion() ? 30 : 560);
    network.phase_index = 4;
    network.state = 'testing';
    saveDraft();
    renderStep({ animate: false, focus: false });
    await sleep(reducedMotion() ? 30 : 580);

    const shouldFail = fixtureMode() === 'ssh-failure' && network.state !== 'failed' && !network.failure_seen;
    if (shouldFail) {
      network.state = 'failed';
      network.failure_seen = true;
      saveDraft();
      renderStep({ animate: false });
      showToast('Folder test paused · your approved identity and key are safe');
      return;
    }

    network.phase_index = 5;
    network.state = 'ready';
    network.receipt = {
      schema_id: 'ssh_connection_receipt.v1',
      operation_id: uid('ssh-op'),
      host: network.host,
      user: network.user,
      folder: network.folder,
      host_fingerprint: network.fingerprint,
      private_key_location: 'protected credential owner on this device',
      public_key_installed: true,
      write_test: 'passed',
      completed_at: now()
    };
    saveDraft();
    renderStep({ animate: false });
    showToast('Secure SSH connection ready');
  }

  function openSourceAuth(mode, service) {
    const names = { github: 'GitHub', gitlab: 'GitLab', bitbucket: 'Bitbucket', forgejo: 'Forgejo or Gitea' };
    const name = names[service] || capitalize(service);
    showModal({
      title: mode === 'signup' ? `Create your ${name} account` : `Allow Puppet Master to list your ${name} Projects`,
      copy: mode === 'signup'
        ? `The production flow opens the official ${name} account page. Puppet Master never receives your password or multi-factor code.`
        : 'Authorize only the access needed to list or prepare the selected source. You return to this exact draft step.',
      kicker: 'Trusted browser handoff · no Project creation',
      browser: true,
      primary: mode === 'signup' ? 'I created the account' : 'Authorize and return',
      action: `source-auth-complete:${service}`
    });
  }

  function completeSourceAuth(service) {
    draft.source.service = service;
    draft.source.account_state = 'ready';
    draft.source.account_name = service === 'github' ? 'jared-example' : 'first-project-owner';
    saveDraft();
    closeModal();
    renderStep({ animate: false });
    showToast('Account ready · no Project or repository created');
  }

  async function runCommit({ retry = false } = {}) {
    if (draft.commit.status === 'succeeded') {
      renderStep({ animate: false });
      return;
    }
    buildPendingEffects();
    draft.commit.operation_id ||= uid('project-op');
    draft.commit.status = 'running';
    if (!retry) draft.commit.phase_index = 0;
    saveDraft();
    renderStep({ animate: false, focus: false });

    for (let index = draft.commit.phase_index; index < draft.pending_side_effects.length; index += 1) {
      draft.commit.phase_index = index;
      saveDraft();
      renderStep({ animate: false, focus: false });
      await sleep(reducedMotion() ? 35 : 620);

      const fixtureFailure = fixtureMode() === 'commit-interruption';
      if (fixtureFailure && !draft.commit.simulated_interruption_used && index === 1) {
        draft.commit.simulated_interruption_used = true;
        draft.commit.status = 'failed';
        saveDraft();
        renderStep({ animate: false });
        showToast('Simulated interruption · retry is idempotent');
        return;
      }
    }

    draft.commit.phase_index = draft.pending_side_effects.length;
    draft.commit.status = 'succeeded';
    store.set(THEME_KEY, JSON.stringify(draft.theme));
    draft.commit.receipt = {
      schema_id: 'project_creation_receipt.v1',
      receipt_id: uid('project-receipt'),
      idempotency_key: draft.commit.operation_id,
      project_id: uid('project'),
      action: draft.project.intent,
      side_effect_ids: draft.pending_side_effects.map(effect => effect.id),
      completed_at: now()
    };
    saveDraft();
    renderStep({ animate: false });
    showToast(`${commitLabel()} completed · durable receipt saved`);
  }

  function providerName(id) {
    return { claude: 'Claude subscription', codex: 'Codex', gemini: 'Gemini API', openai_api: 'OpenAI API' }[id] || capitalize(id.replaceAll('_', ' '));
  }

  function providerAction(action, provider) {
    if (action === 'install') {
      showModal({
        title: `Install ${providerName(provider)} on ${draft.device.name}?`,
        copy: 'Puppet Master will use the vendor’s official installation method on the selected work computer. Nothing is installed silently.',
        kicker: 'Explicit vendor installation',
        primary: 'Install',
        action: `provider-install:${provider}`
      });
      return;
    }
    if (action === 'signin') {
      showModal({
        title: `Sign in to ${providerName(provider)}`,
        copy: 'The secure browser or device-code flow opens on this device and returns to this exact account operation.',
        kicker: 'Account sign-in', browser: true, primary: 'Sign in and return', action: `provider-ready:${provider}`
      });
      return;
    }
    if (action === 'key') {
      showModal({
        title: `Enter a ${providerName(provider)} key`,
        copy: 'The key is stored by the protected credential owner and never shown in chat, logs, or copied Project settings.',
        kicker: 'Protected credential entry', field: { label: 'API key', value: 'sk-concept-not-real', secret: true }, primary: 'Save and verify', action: `provider-ready:${provider}`
      });
      return;
    }
    if (action === 'more') {
      showModal({
        title: 'More accounts and providers',
        copy: 'The full searchable catalog belongs to Provider Settings. Onboarding keeps one easy first account in focus.',
        kicker: 'Secondary choice', primary: 'Done', action: 'modal-cancel', secondary: 'Close',
        extra: `<div class="pmpro-service-list" style="margin-top:16px"><div class="pmpro-service-row"><span class="pmpro-service-logo">XB</span><span class="pmpro-service-copy"><strong>Grok Build subscription</strong><span>Install only when this CLI-backed path is selected</span></span>${pill('Install', 'warn')}</div><div class="pmpro-service-row"><span class="pmpro-service-logo">QW</span><span class="pmpro-service-copy"><strong>Qwen Token Plan</strong><span>Sign In · no provider CLI install control</span></span>${pill('Sign In')}</div></div>`
      });
    }
  }

  async function installProvider(provider) {
    closeModal();
    showToast(`Installing ${providerName(provider)} from the official vendor source`);
    await sleep(reducedMotion() ? 40 : 850);
    draft.provider.accounts[provider] = 'needs_signin';
    saveDraft();
    renderStep({ animate: false });
    showToast(`${providerName(provider)} installed · Sign In is now available`);
  }

  function markProviderReady(provider) {
    closeModal();
    draft.provider.accounts[provider] = 'ready';
    draft.provider.selected ||= provider;
    saveDraft();
    renderStep({ animate: false });
    showToast(`${providerName(provider)} is Ready`);
  }

  function finishFreeModels() {
    draft.free_models.skipped = draft.free_models.selected.length === 0;
    saveDraft();
    transitionTo('finish');
  }

  function finishOnboarding() {
    store.set(COMPLETE_KEY, JSON.stringify({ completed_at: now(), project_id: draft.commit.receipt?.project_id || null }));
    store.remove(DRAFT_KEY);
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    restoreLegacyOverlays();
    resumeChip.hidden = true;
    showExternalToast('Puppet Master setup complete.');
  }

  function openPlanningWizardReal() {
    const candidates = [
      '[data-action="planning-wizard"]', '[data-command="planning-wizard"]', '[data-page="planning-wizard"]',
      '[data-route="planning-wizard"]', '[data-nav="planning"]', 'button[aria-label*="Planning Wizard" i]',
      'a[aria-label*="Planning Wizard" i]'
    ];
    let target = null;
    for (const selector of candidates) {
      const candidate = $(selector);
      if (candidate && !candidate.closest('#pmpro-root, #pmpro-tour-root')) { target = candidate; break; }
    }
    if (target) target.click();
    else location.hash = 'planning-wizard';
    showExternalToast('Planning Wizard is ready. Nothing starts until you review and approve a plan.');
  }

  function showExternalToast(message) {
    const toast = document.createElement('div');
    toast.className = 'pmpro-toast';
    toast.style.cssText = 'position:fixed;left:50%;bottom:24px;z-index:2147483200;opacity:1;transform:translateX(-50%);pointer-events:none';
    toast.dataset.open = 'true';
    toast.innerHTML = `${icon.check}<span>${escapeHtml(message)}</span>`;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function handleOnboardingAction(action) {
    if (!action || action === 'none') return;
    if (action === 'begin-onboarding') return transitionTo('device');
    if (action === 'begin-tour') { closeOnboarding(); return openTour(); }
    if (action === 'check-device') return transitionTo(draft.device.mode === 'local' ? 'device_check' : 'pairing' === stepId ? 'device_check' : 'pairing');
    if (action === 'next') return transitionTo(nextStep());
    if (action === 'scan-ssh') return scanSsh();
    if (action === 'verify-ssh') return askForSshPassword();
    if (action === 'commit-project') return transitionTo('commit');
    if (action === 'retry-commit') return runCommit({ retry: true });
    if (action === 'skip-provider') { draft.provider.skipped = true; saveDraft(); return transitionTo('free_models'); }
    if (action === 'skip-free-models') { draft.free_models.skipped = true; saveDraft(); return transitionTo('finish'); }
    if (action === 'finish-free-models') return finishFreeModels();
    if (action === 'open-planning-wizard') { closeOnboarding(); return openPlanningWizardReal(); }
    if (action === 'finish-close') return finishOnboarding();
  }

  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (action) { handleOnboardingAction(action.dataset.action); return; }

    const select = event.target.closest('[data-select]');
    if (select) {
      setPath(draft, select.dataset.select, select.dataset.value);
      if (select.dataset.select === 'storage.kind' && select.dataset.value !== 'network') draft.storage.network.state = 'idle';
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const toggle = event.target.closest('[data-toggle]');
    if (toggle) {
      setPath(draft, toggle.dataset.toggle, !getPath(draft, toggle.dataset.toggle));
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const theme = event.target.closest('button[data-theme-family]');
    if (theme) {
      const family = theme.dataset.themeFamily;
      transitionAppearance(() => { draft.theme.family = family; }, () => `${themeWorlds[family].name} world preview`);
      return;
    }

    const tone = event.target.closest('[data-tone-toggle]');
    if (tone) {
      const nextTone = draft.theme.tone === 'dark' ? 'light' : 'dark';
      transitionAppearance(() => { draft.theme.tone = nextTone; }, () => `${capitalize(nextTone)} material preview`);
      return;
    }

    const intent = event.target.closest('[data-intent]');
    if (intent) {
      draft.project.intent = intent.dataset.intent;
      if (draft.project.intent === 'create') {
        draft.source.mode = 'local_history';
        draft.storage.kind = 'local';
        transitionTo('basics');
      } else {
        draft.source.mode = draft.project.intent === 'restore' ? 'backup' : 'folder';
        transitionTo('project_start');
      }
      return;
    }

    const startSource = event.target.closest('[data-start-source]');
    if (startSource) {
      const source = startSource.dataset.startSource;
      if (source === 'network') { draft.storage.kind = 'network'; draft.storage.network.transport = 'ssh'; }
      else { draft.source.mode = source; if (source !== 'network') draft.storage.kind = 'local'; }
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const pairRoute = event.target.closest('[data-pair-route]');
    if (pairRoute) {
      draft.device.pairing.method = pairRoute.dataset.pairRoute;
      if (pairRoute.dataset.pairRoute === 'discover') draft.device.pairing.selected = 'Nearby Puppet Master Server';
      if (pairRoute.dataset.pairRoute === 'install') draft.device.pairing.selected = 'New Puppet Master Server';
      if (pairRoute.dataset.pairRoute === 'restore') draft.device.pairing.selected = 'Restored Puppet Master Server';
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const pairDevice = event.target.closest('[data-pair-device]');
    if (pairDevice) {
      draft.device.pairing.selected = pairDevice.dataset.pairDevice;
      draft.device.pairing.status = 'selected';
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const edit = event.target.closest('[data-edit-step]');
    if (edit) return transitionTo(edit.dataset.editStep, 'back');

    const sourceAuth = event.target.closest('[data-source-auth]');
    if (sourceAuth) return openSourceAuth(sourceAuth.dataset.sourceAuth, sourceAuth.dataset.service);

    const inherit = event.target.closest('[data-inherit]');
    if (inherit) {
      if (inherit.dataset.inherit === 'fresh') { draft.inherit.mode = 'fresh'; draft.inherit.from = null; }
      else { draft.inherit.mode = 'copy'; draft.inherit.from = inherit.dataset.inherit; }
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const group = event.target.closest('[data-inherit-group]');
    if (group) {
      const name = group.dataset.inheritGroup;
      const index = draft.inherit.groups.indexOf(name);
      if (index >= 0) draft.inherit.groups.splice(index, 1); else draft.inherit.groups.push(name);
      saveDraft();
      renderStep({ animate: false, focus: false });
      return;
    }

    const provider = event.target.closest('[data-provider-action]');
    if (provider) return providerAction(provider.dataset.providerAction, provider.dataset.provider);

    const freeModel = event.target.closest('[data-free-model]');
    if (freeModel) {
      const id = freeModel.dataset.freeModel;
      const index = draft.free_models.selected.indexOf(id);
      if (index >= 0) draft.free_models.selected.splice(index, 1); else draft.free_models.selected.push(id);
      saveDraft();
      renderStep({ animate: false, focus: false });
    }
  });

  root.addEventListener('input', event => {
    const field = event.target.closest('[data-bind]');
    if (!field) return;
    setPath(draft, field.dataset.bind, field.value);
    saveDraft();
    if (field.dataset.bind === 'project.name') {
      const button = $('[data-action="next"]', footer);
      if (button) button.disabled = !field.value.trim();
    }
  });

  modalLayer.addEventListener('click', event => {
    const button = event.target.closest('[data-modal-action]');
    if (!button) return;
    const action = button.dataset.modalAction;
    if (action === 'cancel' || action === 'modal-cancel') return closeModal();
    if (action === 'ssh-install') return finishSshConnection();
    if (action.startsWith('source-auth-complete:')) return completeSourceAuth(action.split(':')[1]);
    if (action.startsWith('provider-install:')) return installProvider(action.split(':')[1]);
    if (action.startsWith('provider-ready:')) return markProviderReady(action.split(':')[1]);
  });

  // ---------- Guided Tour: local deterministic practice ----------
  const tourNavItems = [
    ['assistant', 'Assistant', icon.spark],
    ['home', 'Home', icon.device],
    ['projects', 'Projects', icon.folder],
    ['orchestrator', 'Orchestrator', icon.history],
    ['tasks', 'Tasks', icon.check],
    ['crew', 'Crew', icon.cloud],
    ['models', 'Models', icon.spark],
    ['artifacts', 'Artifacts', icon.box],
    ['wizard', 'Planning', icon.edit]
  ];

  const tourSteps = [
    {
      id: 'tour.ask.send', chapter: 'Ask and understand', surface: 'assistant', target: '[data-tour-target="send"]',
      title: 'Ask in Assistant Chat',
      copy: 'Send the ready-made question. The answer is a local guided example, so it changes no files and costs nothing.',
      eli5: 'Press the arrow to ask the sample question. No paid AI is used.',
      why: 'Assistant Chat opens first because Teacher belongs inside the place where you already ask for help.',
      action: 'send'
    },
    {
      id: 'tour.ask.eli5', chapter: 'Ask and understand', surface: 'assistant', target: '[data-tour-target="eli5"]',
      title: 'Make the same answer simpler',
      copy: 'Choose ELI5. The meaning stays accurate, but the words become shorter and assume less knowledge.',
      eli5: 'ELI5 explains the same idea with easier words.', action: 'eli5'
    },
    {
      id: 'tour.workspace.dock', chapter: 'Make the workspace yours', surface: 'dock', target: '[data-tour-target="drag-handle"]',
      title: 'Move Assistant Chat',
      copy: 'Drag the Chat window to the highlighted right side. The destination reacts before the window settles.',
      eli5: 'Drag Chat to the right side.', why: 'The same Chat and thread remain open; only their place changes.', action: 'dock'
    },
    {
      id: 'tour.workspace.widget', chapter: 'Make the workspace yours', surface: 'widgets', target: '[data-tour-target="project-widget"]',
      title: 'Add a useful widget',
      copy: 'Add Project Overview so important Project information can stay nearby while you plan.',
      eli5: 'Add the Project Overview card.', action: 'widget'
    },
    {
      id: 'tour.plan.open', chapter: 'Plan before building', surface: 'widgets', target: '[data-tour-nav="wizard"]',
      title: 'Open Planning Wizard',
      copy: 'Use the real navigation route. Planning Wizard turns a rough idea into a plan you can inspect before work begins.',
      eli5: 'Open Planning Wizard from the left side.', action: 'open-wizard'
    },
    {
      id: 'tour.plan.goal', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="practice-goal"]',
      title: 'Start with the outcome',
      copy: 'Choose the practice goal. It describes what visitors should be able to do without guessing how to build it.',
      eli5: 'Choose the sample book-club website goal.', action: 'goal'
    },
    {
      id: 'tour.plan.outcomes', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="show-outcomes"]',
      title: 'See the idea become outcomes',
      copy: 'Ask the Wizard to organize the goal. It creates three observable results instead of a vague feature list.',
      eli5: 'Turn the idea into three clear results.', action: 'outcomes'
    },
    {
      id: 'tour.plan.answer', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="answer-organizers"]',
      title: 'Answer one decision that matters',
      copy: 'Choose “A few organizers.” This answer changes whether the plan needs shared sign-in and editing.',
      eli5: 'Say that a few organizers can update the site.', action: 'answer'
    },
    {
      id: 'tour.plan.why', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="why"]',
      title: 'Ask why before deciding',
      copy: 'Open “Why this matters.” Planning questions should explain the consequence, not demand blind trust.',
      eli5: 'Open the reason for this question.', action: 'why'
    },
    {
      id: 'tour.plan.review', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="review-plan"]',
      title: 'Review before anything builds',
      copy: 'Open the plan review. Outcomes, decisions, assumptions, and uncertainty remain visible together.',
      eli5: 'Open the plan and check it before building.', action: 'review'
    },
    {
      id: 'tour.plan.edit', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="edit-answer"]',
      title: 'Change one answer',
      copy: 'Edit who can update the site. Only the affected access section should move; the three outcomes stay still.',
      eli5: 'Change who can edit the site.', action: 'edit'
    },
    {
      id: 'tour.plan.consequence', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="answer-only-me"]',
      title: 'Watch the specific consequence',
      copy: 'Choose “Only me.” Shared organizer sign-in disappears while every unrelated outcome remains unchanged.',
      eli5: 'Choose “Only me” and watch only the access part change.', action: 'consequence'
    },
    {
      id: 'tour.plan.boundary', chapter: 'Plan before building', surface: 'wizard', target: '[data-tour-target="finish-practice"]',
      title: 'Stop at the approval boundary',
      copy: 'Finish the practice. No live Goal or work starts; you land on Planning Wizard ready to write your own outcome.',
      eli5: 'Finish the practice. Nothing starts by itself.', why: 'That is the planning loop: describe, answer what matters, review, edit, then choose whether work may begin.', action: 'finish', finish: true
    }
  ];

  function defaultTourState() {
    return {
      schema_id: 'guided_tour.v2',
      tour_run_id: uid('tour'),
      status: 'not_started',
      current_step_id: tourSteps[0].id,
      completed_step_ids: [],
      sandbox: true,
      network_blocked: true,
      provider_requests: 0,
      usage_increment: 0,
      workspace_snapshot: null,
      updated_at: now(),
      skipped_at: null,
      completed_at: null
    };
  }

  function mergeTourState(raw) {
    const base = defaultTourState();
    return raw?.schema_id === base.schema_id ? { ...base, ...raw } : base;
  }

  let tourState = mergeTourState(parse(store.get(TOUR_KEY), null));
  let tourIndex = Math.max(0, tourSteps.findIndex(step => step.id === tourState.current_step_id));
  let tourSurface = tourSteps[tourIndex]?.surface || 'assistant';
  let tourEli5 = false;
  let tourPreviousFocus = null;
  let guidePositionFrame = null;
  let workspace = {
    teacherSent: false,
    teacherStreaming: false,
    eli5: false,
    chatDock: null,
    widgetAdded: false,
    wizardStage: 'goal',
    goalChosen: false,
    outcomesShown: false,
    answer: null,
    whyOpen: false,
    reviewOpen: false,
    editing: false,
    consequenceSeen: false
  };

  function saveTour() {
    tourState.current_step_id = tourSteps[tourIndex]?.id || tourSteps[0].id;
    tourState.updated_at = now();
    store.set(TOUR_KEY, JSON.stringify(tourState));
  }

  function currentTourStep() {
    return tourSteps[tourIndex];
  }

  function renderTourRail() {
    tourRail.innerHTML = tourNavItems.map(([id, label, svg]) => `<button type="button" class="pmpro-tour-nav" data-tour-nav="${id}" data-active="${tourSurface === id || tourSurface === 'dock' && id === 'assistant' || tourSurface === 'widgets' && id === 'home'}" aria-label="${label}">${svg}<span>${label}</span></button>`).join('');
  }

  function genericSurface(surface) {
    const contentBySurface = {
      home: ['Home', 'Everything important, without the noise.', [['Needs you', 'One plan is ready for review.'], ['Moving now', 'Two tasks are running safely.'], ['Finished', 'Three results passed review.']]],
      projects: ['Projects', 'Separate homes for each idea and its history.', [['Practice Project', 'Guided example · local only'], ['Family Planner', 'Ready · private history'], ['New Project', 'Created only after review']]],
      orchestrator: ['Orchestrator', 'Plans, active work, review, and receipts.', [['Planning', 'Two decisions ready'], ['Working', 'Two tasks · one reviewer'], ['Evidence', 'Seven receipts saved']]],
      tasks: ['Tasks', 'Concrete work with owners and proof.', [['Define the outcome', 'Complete · reviewed'], ['Map the user flow', 'In progress · two agents'], ['Verify the plan', 'Waiting']]],
      crew: ['Crew', 'Specialists, requests, conflicts, and handoffs.', [['Planner', 'Building the first draft'], ['UX reviewer', 'Raised one clarity warning'], ['Tester', 'Preparing acceptance checks']]],
      models: ['Models', 'Requested and effective AI choices.', [['Planning route', 'Auto → Opus'], ['Research route', 'Web Research → Kimi'], ['Tour fixture', 'Built in · no allowance']]],
      artifacts: ['Artifacts', 'Plans, reports, media, builds, and evidence.', [['Reviewed plan', 'Twelve sections · current'], ['Flow map', 'Interactive diagram'], ['Verification report', 'Seven checks passed']]]
    };
    const [title, note, cards] = contentBySurface[surface] || contentBySurface.home;
    return `<section class="pmpro-tour-page" data-enter="true"><div class="pmpro-page-heading"><div><h1>${title}</h1><p>${note}</p></div><span class="pmpro-practice-pill">Practice data</span></div><div class="pmpro-page-grid">${cards.map(([heading, copy]) => `<article class="pmpro-page-panel"><h3>${heading}</h3><p>${copy}</p></article>`).join('')}</div></section>`;
  }

  function assistantSurface() {
    const regular = 'Before work begins, Puppet Master turns your request into a plan. You can review the important choices, correct anything that looks wrong, and decide when to begin. Your Project permissions still control what the work may change.';
    const simple = 'First, Puppet Master writes down what it thinks you want. You can fix the plan before anything starts. It waits for your decision to begin.';
    return `<section class="pmpro-tour-page" data-enter="true"><div class="pmpro-chat-layout">
      <div class="pmpro-chat-main">
        <header class="pmpro-chat-head"><strong>Assistant Chat · Guided example</strong><div class="pmpro-chat-tools"><button type="button" class="pmpro-tool-button" aria-pressed="true">Teacher</button><button type="button" class="pmpro-tool-button" data-tour-target="eli5" aria-pressed="${workspace.eli5}">ELI5</button></div></header>
        <div class="pmpro-chat-feed" aria-live="polite">
          ${workspace.teacherSent ? `<div class="pmpro-chat-bubble pmpro-user">What happens before Puppet Master changes my files?</div><div class="pmpro-chat-bubble ${workspace.teacherStreaming ? 'pmpro-streaming' : ''}">${workspace.eli5 ? simple : regular}</div>` : `<div class="pmpro-chat-bubble">Assistant Chat is where you ask Puppet Master for help. Teacher can explain this screen, an unfamiliar term, or why a choice matters.</div>`}
        </div>
        <div class="pmpro-chat-compose"><div class="pmpro-compose-box"><input value="What happens before Puppet Master changes my files?" readonly aria-label="Guided example question"><button type="button" data-tour-target="send" aria-label="Send guided example">${icon.arrow}</button></div></div>
      </div>
      <aside class="pmpro-chat-side"><h3>Guided example safeguards</h3><div class="pmpro-fixture-proof">Local deterministic response<br>Network blocked<br>Provider requests: 0<br>Usage increment: 0<br>Files changed: 0</div></aside>
    </div></section>`;
  }

  function dockSurface() {
    return `<section class="pmpro-tour-page" data-enter="true" style="overflow:hidden">
      <div class="pmpro-page-heading"><div><h1>Workspace</h1><p>Panels can move without losing their state.</p></div><span class="pmpro-practice-pill">Snapshot saved</span></div>
      <div class="pmpro-dock-zone pmpro-left" data-dock-zone="left">Dock left</div>
      <div class="pmpro-dock-zone pmpro-right" data-dock-zone="right">Dock right</div>
      <div class="pmpro-floating-chat" data-docked="${workspace.chatDock || ''}" data-tour-panel>
        <div class="pmpro-drag-handle" data-tour-target="drag-handle" tabindex="0"><strong>Assistant Chat · Guided example</strong>${icon.move}</div>
        <div style="padding:16px"><div class="pmpro-chat-bubble">The same Chat stays with you; only its place changes.</div></div>
      </div>
    </section>`;
  }

  function widgetsSurface() {
    return `<section class="pmpro-tour-page" data-enter="true"><div class="pmpro-page-heading"><div><h1>Home</h1><p>Keep useful Project information nearby without leaving the page.</p></div><span class="pmpro-practice-pill">Practice layout</span></div>
      ${workspace.widgetAdded ? `<div class="pmpro-widget-canvas"><article class="pmpro-widget"><strong>Project Overview</strong><p>Neighborhood Book Club · Planning practice</p><div class="pmpro-outcome-list"><div class="pmpro-outcome">${icon.check} Outcome ready</div><div class="pmpro-outcome">${icon.history} One decision remains</div></div></article><article class="pmpro-widget"><strong>Recent activity</strong><p>Nothing live has started.</p></article></div>` : `<div class="pmpro-widget-gallery"><button type="button" class="pmpro-widget-choice" data-tour-target="project-widget"><strong>Project Overview</strong><p>Outcome, planning state, and useful Project signals.</p></button><button type="button" class="pmpro-widget-choice"><strong>Recent activity</strong><p>Work, reviews, and receipts.</p></button><button type="button" class="pmpro-widget-choice"><strong>Usage</strong><p>Provider and local model activity.</p></button></div>`}
    </section>`;
  }

  function wizardSurface() {
    const stage = workspace.wizardStage;
    const stepIndex = stage === 'goal' ? 0 : stage === 'outcomes' ? 1 : stage === 'question' ? 2 : stage === 'review' || stage === 'edit' ? 4 : 3;
    const wizardSteps = ['Outcome', 'Questions', 'Research', 'Plan', 'Review'];
    let canvas = '';
    if (stage === 'goal') {
      canvas = `<h2>What should this Project accomplish?</h2><p>Describe the result. Puppet Master helps with the technical path.</p><button type="button" class="pmpro-practice-goal" data-tour-target="practice-goal"><strong>Create a simple website for my neighborhood book club.</strong><br>It should show the next meeting, the current book, and how to join.</button>`;
    } else if (stage === 'outcomes') {
      canvas = `<h2>The outcome is clear</h2><p>The Wizard can now organize the idea without starting any work.</p>${workspace.outcomesShown ? `<div class="pmpro-outcome-list"><div class="pmpro-outcome" style="animation-delay:0ms">${icon.check} Visitors can see the next meeting.</div><div class="pmpro-outcome" style="animation-delay:90ms">${icon.check} Visitors can see the current book.</div><div class="pmpro-outcome" style="animation-delay:180ms">${icon.check} New members can learn how to join.</div></div><button type="button" class="pmpro-wizard-button" data-tour-target="continue-question">Continue to the decision</button>` : `<button type="button" class="pmpro-wizard-button" data-tour-target="show-outcomes">Turn this idea into outcomes</button>`}`;
    } else if (stage === 'question') {
      canvas = `<h2>One decision changes the plan</h2><p>Answer only what materially affects the result.</p><div class="pmpro-question-card"><h3>Who should be able to update the meeting and book?</h3><div class="pmpro-question-options"><button type="button" class="pmpro-question-option" data-tour-target="answer-only-me" data-answer="only-me" data-selected="${workspace.answer === 'only-me'}">Only me</button><button type="button" class="pmpro-question-option" data-tour-target="answer-organizers" data-answer="organizers" data-selected="${workspace.answer === 'organizers'}">A few organizers</button><button type="button" class="pmpro-question-option" data-answer="unsure" data-selected="${workspace.answer === 'unsure'}">I’m not sure yet</button></div><button type="button" class="pmpro-why-button" data-tour-target="why">Why this matters</button>${workspace.whyOpen ? `<div class="pmpro-why-answer">This decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.</div>` : ''}</div>${workspace.answer && workspace.whyOpen ? `<button type="button" class="pmpro-wizard-button" data-tour-target="review-plan">Review the practice plan</button>` : ''}`;
    } else {
      canvas = `<h2>Review the practice plan</h2><p>Nothing has been built. Check the outcomes, decisions, assumptions, and uncertainty first.</p><div class="pmpro-plan-review"><section class="pmpro-plan-column"><h3>Outcomes</h3><ul><li>Show the next meeting</li><li>Show the current book</li><li>Explain how to join</li></ul></section><section class="pmpro-plan-column"><h3>Decisions and assumptions</h3><ul><li>Editors: ${workspace.answer === 'only-me' ? 'Only me' : 'A few organizers'}</li><li>Public viewing</li><li>No live work started</li></ul></section></div>${workspace.answer === 'organizers' ? `<div class="pmpro-plan-consequence">Shared organizer sign-in and editor permissions are included.</div>` : `<div class="pmpro-plan-consequence">Shared organizer sign-in was removed. The three public outcomes did not change.</div>`}<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="pmpro-wizard-button pmpro-outline" data-tour-target="edit-answer">Edit who can update</button><button type="button" class="pmpro-wizard-button" data-tour-target="finish-practice">Finish practice</button></div>`;
    }
    return `<section class="pmpro-tour-page" data-enter="true"><div class="pmpro-wizard-layout"><aside class="pmpro-wizard-steps"><strong>Planning Wizard</strong>${wizardSteps.map((label, index) => `<div class="pmpro-wizard-step" data-active="${index === stepIndex}"><span>${index + 1}</span>${label}</div>`).join('')}</aside><div class="pmpro-wizard-canvas">${canvas}</div></div></section>`;
  }

  function renderTourSurface(surface = tourSurface) {
    tourSurface = surface;
    renderTourRail();
    if (surface === 'assistant') tourWorkspace.innerHTML = assistantSurface();
    else if (surface === 'dock') tourWorkspace.innerHTML = dockSurface();
    else if (surface === 'widgets') tourWorkspace.innerHTML = widgetsSurface();
    else if (surface === 'wizard') tourWorkspace.innerHTML = wizardSurface();
    else tourWorkspace.innerHTML = genericSurface(surface);
    bindTourSurface();
    requestAnimationFrame(positionGuide);
  }

  function emitCommand(command, detail = {}) {
    const event = new CustomEvent('pmpro:command', { bubbles: true, detail: { command, ...detail, concept_fixture: true } });
    document.dispatchEvent(event);
    return event;
  }

  function isTourStepComplete(step = currentTourStep()) {
    return tourState.completed_step_ids.includes(step.id);
  }

  function completeTourStep(step = currentTourStep()) {
    if (!tourState.completed_step_ids.includes(step.id)) tourState.completed_step_ids.push(step.id);
    saveTour();
    renderGuideCard();
    tourHalo.dataset.pulse = 'false';
    void tourHalo.offsetWidth;
    tourHalo.dataset.pulse = 'true';
  }

  async function sendTeacherFixture() {
    if (workspace.teacherStreaming) return;
    emitCommand('assistant.send-guided-teacher-prompt', { provider_requests: 0, usage_increment: 0 });
    workspace.teacherSent = true;
    workspace.teacherStreaming = true;
    renderTourSurface('assistant');
    await sleep(reducedMotion() ? 30 : 740);
    workspace.teacherStreaming = false;
    renderTourSurface('assistant');
    if (currentTourStep().id === 'tour.ask.send') completeTourStep();
  }

  function applyEli5() {
    emitCommand('assistant.apply-eli5', { local_fixture: true });
    workspace.eli5 = true;
    renderTourSurface('assistant');
    if (currentTourStep().id === 'tour.ask.eli5') completeTourStep();
  }

  function dockChat(side = 'right') {
    emitCommand('workspace.dock-assistant-chat', { side });
    workspace.chatDock = side;
    const panel = $('[data-tour-panel]', tourWorkspace);
    if (panel) {
      panel.style.transform = '';
      panel.dataset.docked = side;
    }
    $$('[data-dock-zone]', tourWorkspace).forEach(zone => { zone.dataset.ready = String(zone.dataset.dockZone === side); });
    setTimeout(() => {
      $$('[data-dock-zone]', tourWorkspace).forEach(zone => { zone.dataset.ready = 'false'; });
      if (currentTourStep().id === 'tour.workspace.dock') completeTourStep();
      positionGuide();
    }, reducedMotion() ? 10 : 650);
  }

  function bindDragHandle() {
    const handle = $('[data-tour-target="drag-handle"]', tourWorkspace);
    const panel = $('[data-tour-panel]', tourWorkspace);
    if (!handle || !panel) return;
    let dragging = false;
    let origin = null;
    let delta = { x: 0, y: 0 };

    const finish = (event) => {
      if (!dragging) return;
      dragging = false;
      try { handle.releasePointerCapture(event.pointerId); } catch {}
      const rightZone = $('[data-dock-zone="right"]', tourWorkspace)?.getBoundingClientRect();
      const centerX = panel.getBoundingClientRect().left + panel.getBoundingClientRect().width / 2;
      const shouldDock = rightZone && (centerX > rightZone.left - 80 || event.clientX > innerWidth * .68);
      $$('[data-dock-zone]', tourWorkspace).forEach(zone => { zone.dataset.ready = 'false'; });
      if (shouldDock) dockChat('right');
      else panel.animate([{ transform: `translate(${delta.x}px, ${delta.y}px)` }, { transform: 'translate(0,0)' }], { duration: reducedMotion() ? 1 : 360, easing: 'cubic-bezier(.16,1,.3,1)' }).finished.finally(() => { panel.style.transform = ''; });
    };

    handle.addEventListener('pointerdown', event => {
      if (workspace.chatDock) return;
      dragging = true;
      origin = { x: event.clientX, y: event.clientY };
      delta = { x: 0, y: 0 };
      handle.setPointerCapture(event.pointerId);
      $$('[data-dock-zone]', tourWorkspace).forEach(zone => { zone.dataset.ready = 'true'; });
    });
    handle.addEventListener('pointermove', event => {
      if (!dragging) return;
      delta = { x: event.clientX - origin.x, y: event.clientY - origin.y };
      panel.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
      const right = $('[data-dock-zone="right"]', tourWorkspace);
      const ready = event.clientX > innerWidth * .72;
      if (right) right.dataset.ready = String(ready);
    });
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); dockChat('right'); }
    });
  }

  function addProjectWidget() {
    emitCommand('widgets.add', { widget: 'project-overview', practice: true });
    workspace.widgetAdded = true;
    renderTourSurface('widgets');
    if (currentTourStep().id === 'tour.workspace.widget') completeTourStep();
  }

  function openWizardFixture() {
    emitCommand('planning-wizard.open', { project: 'practice-project', live_work: false });
    tourSurface = 'wizard';
    workspace.wizardStage = 'goal';
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.open') completeTourStep();
  }

  function choosePracticeGoal() {
    emitCommand('planning-wizard.set-goal', { goal: 'Create a simple website for my neighborhood book club.' });
    workspace.goalChosen = true;
    workspace.wizardStage = 'outcomes';
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.goal') completeTourStep();
  }

  async function showOutcomes() {
    emitCommand('planning-wizard.derive-outcomes', { deterministic_fixture: true });
    workspace.outcomesShown = true;
    renderTourSurface('wizard');
    await sleep(reducedMotion() ? 30 : 900);
    workspace.wizardStage = 'question';
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.outcomes') completeTourStep();
  }

  function answerPlanningQuestion(answer) {
    emitCommand('planning-wizard.answer-question', { question: 'update-access', answer });
    workspace.answer = answer;
    if (workspace.editing && answer === 'only-me') {
      workspace.consequenceSeen = true;
      workspace.editing = false;
      workspace.whyOpen = true;
      workspace.wizardStage = 'review';
      renderTourSurface('wizard');
      if (currentTourStep().id === 'tour.plan.consequence') completeTourStep();
      return;
    }
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.answer' && answer === 'organizers') completeTourStep();
  }

  function openWhy() {
    emitCommand('planning-wizard.explain-question', { question: 'update-access' });
    workspace.whyOpen = true;
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.why') completeTourStep();
  }

  function openPlanReview() {
    emitCommand('planning-wizard.open-review', { live_work: false });
    workspace.reviewOpen = true;
    workspace.wizardStage = 'review';
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.review') completeTourStep();
  }

  function editPlanningAnswer() {
    emitCommand('planning-wizard.edit-answer', { question: 'update-access' });
    workspace.editing = true;
    workspace.whyOpen = false;
    workspace.wizardStage = 'question';
    renderTourSurface('wizard');
    if (currentTourStep().id === 'tour.plan.edit') completeTourStep();
  }

  function bindTourSurface() {
    bindDragHandle();
    const interactive = $$('[data-tour-target], [data-answer], [data-tour-nav]', tourRoot);
    interactive.forEach(element => {
      if (element.dataset.pmproBound === 'true') return;
      element.dataset.pmproBound = 'true';
    });
  }

  function guideTarget() {
    const step = currentTourStep();
    if (!step) return null;
    const primary = $(step.target, tourRoot);
    if (primary) return primary;
    if (!isTourStepComplete(step)) return null;
    const completionTarget = {
      'tour.workspace.dock': '[data-tour-panel]',
      'tour.workspace.widget': '.pmpro-widget',
      'tour.plan.open': '.pmpro-wizard-canvas',
      'tour.plan.goal': '.pmpro-wizard-canvas',
      'tour.plan.outcomes': '.pmpro-question-card',
      'tour.plan.review': '.pmpro-plan-review',
      'tour.plan.edit': '.pmpro-question-card',
      'tour.plan.consequence': '.pmpro-plan-consequence'
    }[step.id];
    return completionTarget ? $(completionTarget, tourRoot) : null;
  }

  function renderGuideCard() {
    const step = currentTourStep();
    if (!step) return;
    const complete = isTourStepComplete(step);
    const copy = tourEli5 ? step.eli5 : step.copy;
    guideCard.innerHTML = `<div class="pmpro-guide-head"><div><div class="pmpro-guide-kicker">${escapeHtml(step.chapter)} <span class="pmpro-guide-count">${tourIndex + 1} / ${tourSteps.length}</span></div><h2 id="pmpro-guide-title" tabindex="-1">${escapeHtml(step.title)}</h2></div><button type="button" class="pmpro-icon-button" data-tour-action="pause" aria-label="Resume later">${icon.pause}</button></div><p>${escapeHtml(copy)}</p>${step.why ? `<div class="pmpro-guide-why">${escapeHtml(step.why)}</div>` : ''}${complete ? `<div class="pmpro-guide-success">${icon.check} Action complete</div>` : ''}<div class="pmpro-guide-actions"><button type="button" data-tour-action="back" ${tourIndex === 0 ? 'disabled' : ''}>Back</button><button type="button" data-tour-action="eli5" aria-pressed="${tourEli5}">ELI5</button><button type="button" data-tour-action="show">Show Me</button><button type="button" data-tour-action="skip">Skip Tour</button><button type="button" class="pmpro-guide-next" data-tour-action="next" ${complete ? '' : 'disabled'}>${step.finish ? 'Finish' : 'Continue'}</button></div>`;
    requestAnimationFrame(() => {
      positionGuide();
      $('#pmpro-guide-title')?.focus({ preventScroll: true });
    });
  }

  function spotlightRect(rect) {
    const padding = 8;
    const left = Math.max(4, rect.left - padding);
    const top = Math.max(4, rect.top - padding);
    const right = Math.min(innerWidth - 4, rect.right + padding);
    const bottom = Math.min(innerHeight - 4, rect.bottom + padding);
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  function showSpotlight(rect) {
    const topShade = $('[data-shade="top"]', tourRoot);
    const leftShade = $('[data-shade="left"]', tourRoot);
    const rightShade = $('[data-shade="right"]', tourRoot);
    const bottomShade = $('[data-shade="bottom"]', tourRoot);
    Object.assign(topShade.style, { left: '0px', top: '0px', width: `${innerWidth}px`, height: `${rect.top}px`, opacity: '1' });
    Object.assign(bottomShade.style, { left: '0px', top: `${rect.bottom}px`, width: `${innerWidth}px`, height: `${Math.max(0, innerHeight - rect.bottom)}px`, opacity: '1' });
    Object.assign(leftShade.style, { left: '0px', top: `${rect.top}px`, width: `${rect.left}px`, height: `${rect.height}px`, opacity: '1' });
    Object.assign(rightShade.style, { left: `${rect.right}px`, top: `${rect.top}px`, width: `${Math.max(0, innerWidth - rect.right)}px`, height: `${rect.height}px`, opacity: '1' });
    Object.assign(tourHalo.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, opacity: '1' });
  }

  function hideSpotlight() {
    $$('.pmpro-tour-shade', tourRoot).forEach(shade => { shade.style.opacity = '0'; });
    tourHalo.style.opacity = '0';
  }

  function positionGuide() {
    cancelAnimationFrame(guidePositionFrame);
    guidePositionFrame = requestAnimationFrame(() => {
      if (tourRoot.hidden) return;
      const target = guideTarget();
      const cardWidth = Math.min(380, innerWidth - 24);
      const cardHeight = Math.min(guideCard.offsetHeight || 330, innerHeight - 24);
      guideCard.style.transform = 'none';
      if (!target || !target.isConnected || target.getClientRects().length === 0) {
        hideSpotlight();
        guideCard.style.left = `${Math.max(12, (innerWidth - cardWidth) / 2)}px`;
        guideCard.style.top = `${Math.max(12, (innerHeight - cardHeight) / 2)}px`;
        if (!isTourStepComplete() && !guideCard.querySelector('[data-tour-action="recover"]')) {
          const actions = $('.pmpro-guide-actions', guideCard);
          actions?.insertAdjacentHTML('afterbegin', '<button type="button" data-tour-action="recover">Return to step</button>');
        }
        return;
      }
      const rect = spotlightRect(target.getBoundingClientRect());
      showSpotlight(rect);
      const spaceRight = innerWidth - rect.right;
      const spaceLeft = rect.left;
      let left;
      let top;
      if (spaceRight > cardWidth + 28) {
        left = rect.right + 17;
        top = Math.max(12, Math.min(rect.top, innerHeight - cardHeight - 12));
      } else if (spaceLeft > cardWidth + 28) {
        left = rect.left - cardWidth - 17;
        top = Math.max(12, Math.min(rect.top, innerHeight - cardHeight - 12));
      } else {
        left = Math.max(12, (innerWidth - cardWidth) / 2);
        top = rect.top > innerHeight / 2 ? 12 : innerHeight - cardHeight - 12;
      }
      guideCard.style.left = `${left}px`;
      guideCard.style.top = `${Math.max(12, top)}px`;
    });
  }

  function recoverTourTarget() {
    const step = currentTourStep();
    tourSurface = step.surface;
    if (step.surface === 'wizard') {
      if (step.id === 'tour.plan.goal') workspace.wizardStage = 'goal';
      else if (step.id === 'tour.plan.outcomes') workspace.wizardStage = 'outcomes';
      else if (['tour.plan.answer', 'tour.plan.why', 'tour.plan.consequence'].includes(step.id)) workspace.wizardStage = 'question';
      else if (['tour.plan.review', 'tour.plan.edit', 'tour.plan.boundary'].includes(step.id)) workspace.wizardStage = 'review';
    }
    renderTourSurface(tourSurface);
    renderGuideCard();
  }

  async function showMe() {
    const step = currentTourStep();
    let target = guideTarget();
    if (!target) {
      recoverTourTarget();
      await sleep(50);
      target = guideTarget();
    }
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const cardRect = guideCard.getBoundingClientRect();
    let destination = { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 };
    if (step.action === 'dock') {
      const zone = $('[data-dock-zone="right"]', tourWorkspace)?.getBoundingClientRect();
      if (zone) destination = { x: zone.left + zone.width / 2, y: zone.top + zone.height / 2 };
    }
    const start = { x: cardRect.left + cardRect.width * .52, y: cardRect.top + Math.min(88, cardRect.height * .3) };
    demoPointer.style.left = `${start.x}px`;
    demoPointer.style.top = `${start.y}px`;
    demoPointer.style.opacity = '1';
    target.focus?.({ preventScroll: true });
    tourHalo.dataset.pulse = 'false';
    void tourHalo.offsetWidth;
    tourHalo.dataset.pulse = 'true';
    await sleep(reducedMotion() ? 10 : 290);

    const dx = destination.x - start.x;
    const dy = destination.y - start.y;
    const animation = demoPointer.animate([
      { opacity: 0, transform: 'translate(0,0) scale(.88)' },
      { offset: .1, opacity: 1 },
      { offset: .8, opacity: 1, transform: `translate(${dx}px,${dy}px) scale(1)` },
      { opacity: 1, transform: `translate(${dx}px,${dy}px) scale(.82)` }
    ], { duration: reducedMotion() ? 20 : step.action === 'dock' ? 1600 : 1220, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'forwards' });
    await animation.finished.catch(() => {});

    if (step.action === 'dock') dockChat('right');
    else target.click?.();
    await sleep(reducedMotion() ? 10 : 430);
    demoPointer.style.opacity = '0';
    demoPointer.getAnimations().forEach(active => active.cancel());
  }

  function advanceTour() {
    if (!isTourStepComplete()) return;
    if (currentTourStep().finish) return finishTourPrompt();
    tourIndex = Math.min(tourSteps.length - 1, tourIndex + 1);
    const step = currentTourStep();
    tourState.current_step_id = step.id;
    tourState.status = 'running';
    saveTour();
    if (tourSurface !== step.surface) renderTourSurface(step.surface);
    else renderTourSurface(tourSurface);
    renderGuideCard();
  }

  function backTour() {
    if (tourIndex === 0) return;
    tourIndex -= 1;
    tourState.current_step_id = currentTourStep().id;
    saveTour();
    recoverTourTarget();
  }

  function openTour() {
    tourPreviousFocus = document.activeElement;
    hideLegacyOverlays();
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    tourRoot.hidden = false;
    tourRoot.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    if (!tourState.workspace_snapshot) {
      tourState.workspace_snapshot = parse(store.get(WORKSPACE_KEY), { chatDock: null, widgetAdded: false, captured_at: now() });
    }
    if (tourState.status === 'finished' || tourState.status === 'skipped') {
      tourState = defaultTourState();
      tourIndex = 0;
      workspace = { teacherSent: false, teacherStreaming: false, eli5: false, chatDock: null, widgetAdded: false, wizardStage: 'goal', goalChosen: false, outcomesShown: false, answer: null, whyOpen: false, reviewOpen: false, editing: false, consequenceSeen: false };
    } else {
      tourIndex = Math.max(0, tourSteps.findIndex(step => step.id === tourState.current_step_id));
    }
    tourState.status = 'running';
    const theme = themeData();
    tourRoot.dataset.themeFamily = theme.family;
    tourRoot.dataset.tone = theme.tone;
    tourRoot.style.setProperty('--pmpro-tour-accent', theme.palette.accent);
    tourSurface = currentTourStep().surface;
    renderTourSurface(tourSurface);
    renderGuideCard();
    saveTour();
    resumeChip.hidden = true;
  }

  function pauseTour() {
    tourState.status = 'paused';
    saveTour();
    tourRoot.hidden = true;
    tourRoot.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    restoreLegacyOverlays();
    resumeChip.hidden = false;
    $('#pmpro-resume-title').textContent = 'Resume Guided Tour';
    $('#pmpro-resume-detail').textContent = `Continue from step ${tourIndex + 1} of ${tourSteps.length}.`;
    tourPreviousFocus?.focus?.({ preventScroll: true });
  }

  function skipTourPrompt() {
    tourSkipLayer.hidden = false;
    tourSkipLayer.innerHTML = `<div class="pmpro-tour-skip-card"><h3>Leave the Guided Tour?</h3><p>Resume later from this exact action, or skip it and replay it from Settings whenever you need it.</p><div class="pmpro-guide-actions"><button type="button" data-tour-skip="cancel">Keep learning</button><button type="button" data-tour-skip="pause">Resume later</button><button type="button" class="pmpro-guide-next" data-tour-skip="permanent">Skip Tour</button></div></div>`;
    requestAnimationFrame(() => $('[data-tour-skip="cancel"]', tourSkipLayer)?.focus());
  }

  function finishTourPrompt() {
    tourSkipLayer.hidden = false;
    tourSkipLayer.innerHTML = `<div class="pmpro-tour-skip-card"><span class="pmpro-pill pmpro-ready">Guided practice complete</span><h3 style="margin-top:13px">Keep the practice layout?</h3><p>Your original workspace was captured before the tour. Restore it now, or keep the docked Chat and Project Overview widget.</p><div class="pmpro-guide-actions"><button type="button" data-tour-finish="restore">Restore my layout</button><button type="button" class="pmpro-guide-next" data-tour-finish="keep">Keep this layout</button></div></div>`;
  }

  function finishTour(keepLayout) {
    emitCommand('guided-tour.finish', { keep_layout: keepLayout, live_work_started: false });
    tourState.status = 'finished';
    tourState.completed_at = now();
    tourState.current_step_id = tourSteps.at(-1).id;
    if (keepLayout) store.set(WORKSPACE_KEY, JSON.stringify({ chatDock: workspace.chatDock, widgetAdded: workspace.widgetAdded, kept_at: now() }));
    else if (tourState.workspace_snapshot) store.set(WORKSPACE_KEY, JSON.stringify(tourState.workspace_snapshot));
    saveTour();
    tourSkipLayer.hidden = true;
    tourRoot.hidden = true;
    tourRoot.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    restoreLegacyOverlays();
    resumeChip.hidden = true;
    openPlanningWizardReal();
  }

  tourRoot.addEventListener('click', event => {
    const navigation = event.target.closest('[data-tour-nav]');
    if (navigation) {
      const destination = navigation.dataset.tourNav;
      if (destination === 'wizard') {
        openWizardFixture();
      } else {
        emitCommand('shell.navigate', { surface: destination, practice: true });
        renderTourSurface(destination);
      }
      return;
    }

    const target = event.target.closest('[data-tour-target]');
    if (target) {
      const name = target.dataset.tourTarget;
      if (name === 'send') sendTeacherFixture();
      else if (name === 'eli5') applyEli5();
      else if (name === 'project-widget') addProjectWidget();
      else if (name === 'practice-goal') choosePracticeGoal();
      else if (name === 'show-outcomes') showOutcomes();
      else if (name === 'answer-organizers' || name === 'answer-only-me') answerPlanningQuestion(target.dataset.answer);
      else if (name === 'why') openWhy();
      else if (name === 'review-plan') openPlanReview();
      else if (name === 'edit-answer') editPlanningAnswer();
      else if (name === 'finish-practice') {
        emitCommand('planning-wizard.finish-practice', { live_work_started: false });
        if (currentTourStep().id === 'tour.plan.boundary') completeTourStep();
        setTimeout(finishTourPrompt, reducedMotion() ? 10 : 360);
      }
      return;
    }

    const answer = event.target.closest('[data-answer]');
    if (answer) { answerPlanningQuestion(answer.dataset.answer); return; }

    const guideAction = event.target.closest('[data-tour-action]');
    if (guideAction) {
      const action = guideAction.dataset.tourAction;
      if (action === 'back') backTour();
      else if (action === 'next') advanceTour();
      else if (action === 'show') showMe();
      else if (action === 'skip') skipTourPrompt();
      else if (action === 'pause') pauseTour();
      else if (action === 'eli5') { tourEli5 = !tourEli5; renderGuideCard(); }
      else if (action === 'recover') recoverTourTarget();
    }
  });

  tourSkipLayer.addEventListener('click', event => {
    const skip = event.target.closest('[data-tour-skip]');
    if (skip) {
      if (skip.dataset.tourSkip === 'cancel') tourSkipLayer.hidden = true;
      else if (skip.dataset.tourSkip === 'pause') { tourSkipLayer.hidden = true; pauseTour(); }
      else {
        tourState.status = 'skipped';
        tourState.skipped_at = now();
        saveTour();
        tourSkipLayer.hidden = true;
        tourRoot.hidden = true;
        tourRoot.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        restoreLegacyOverlays();
        resumeChip.hidden = true;
      }
      return;
    }
    const finish = event.target.closest('[data-tour-finish]');
    if (finish) finishTour(finish.dataset.tourFinish === 'keep');
  });

  function trapFocus(event, container) {
    if (event.key !== 'Tab') return;
    const focusable = $$('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', container).filter(element => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  document.addEventListener('keydown', event => {
    if (!modalLayer.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
      else trapFocus(event, modalLayer);
      return;
    }
    if (!tourSkipLayer.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); tourSkipLayer.hidden = true; }
      else trapFocus(event, tourSkipLayer);
      return;
    }
    if (!root.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); closeOnboarding(); }
      else trapFocus(event, windowEl);
      return;
    }
    if (!tourRoot.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); skipTourPrompt(); }
      else if (event.altKey && event.key === 'ArrowRight') { event.preventDefault(); advanceTour(); }
      else if (event.altKey && event.key === 'ArrowLeft') { event.preventDefault(); backTour(); }
      else trapFocus(event, tourRoot);
    }
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
      event.preventDefault(); openOnboarding();
    }
  });

  document.addEventListener('click', event => {
    const control = event.target.closest('[data-pmpro]');
    if (!control) return;
    const action = control.dataset.pmpro;
    if (action === 'back') transitionTo(previousStep(), 'back');
    else if (action === 'close') closeOnboarding();
    else if (action === 'theme-cycle') cycleTheme();
    else if (action === 'resume') tourState.status === 'paused' ? openTour() : openOnboarding();
    else if (action === 'launch-onboarding') openOnboarding();
    else if (action === 'launch-tour') openTour();
    else if (action === 'reset') resetConcept();
  });

  function interceptExistingEntryPoints(event) {
    const control = event.target.closest('button, a, [role="button"]');
    if (!control || control.closest('#pmpro-root, #pmpro-tour-root, #pmpro-resume-chip, #pmpro-dev-launcher')) return;
    const text = (control.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const explicitNew = control.matches('[data-new-project], [data-command="new-project"], [data-action="new-project"]');
    const onboarding = control.matches('[data-onboarding], [data-command="run-onboarding"]') || /^(run )?onboarding( again)?$/.test(text) || text.includes('make this my puppet master') || text === 'set up this device' || text === 'get started';
    const tour = control.matches('[data-guided-tour], [data-command="replay-guided-tour"]') || text.includes('guided tour') || text === 'take the tour';
    const newProject = explicitNew || /^(create|start|add) (a )?new project$/.test(text);
    if (onboarding || tour || newProject) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (tour) openTour();
      else if (newProject) {
        draft.project.intent = 'create';
        draft.device.state = 'ready';
        draft.device.name ||= 'This computer';
        stepId = 'basics';
        saveDraft();
        openOnboarding('basics');
      } else openOnboarding();
    }
  }

  document.addEventListener('click', interceptExistingEntryPoints, true);
  addEventListener('resize', () => { if (!tourRoot.hidden) positionGuide(); });

  function startup() {
    const params = new URLSearchParams(location.search);
    const mode = params.get('pmpro');
    if (mode === 'dev' || location.hash === '#pmpro-dev') $('#pmpro-dev-launcher').hidden = false;
    if (mode === 'setup' || location.hash === '#pmpro-onboarding') setTimeout(() => openOnboarding(), 80);
    else if (mode === 'tour' || location.hash === '#pmpro-tour') setTimeout(() => openTour(), 80);
    else if (mode !== 'off' && !store.get(COMPLETE_KEY) && !store.get(DRAFT_KEY)) setTimeout(() => openOnboarding(), 420);
    else updateResumeChip();
  }

  window.PMProOnboarding = {
    version: VERSION,
    open: openOnboarding,
    close: closeOnboarding,
    openTour,
    pauseTour,
    reset: resetConcept,
    getDraft: () => JSON.parse(JSON.stringify(draft)),
    getTourState: () => JSON.parse(JSON.stringify(tourState)),
    goToStep(id) { if (!stepDefinition(id)) return; stepId = id; draft.current_step = id; saveDraft(); openOnboarding(id); },
    goToTourStep(index) {
      openTour();
      tourIndex = Math.max(0, Math.min(tourSteps.length - 1, Number(index) || 0));
      tourState.current_step_id = currentTourStep().id;
      recoverTourTarget();
      saveTour();
    },
    setTheme(family, tone = draft.theme.tone) {
      if (themeWorlds[family]) draft.theme.family = family;
      draft.theme.tone = tone === 'light' ? 'light' : 'dark';
      saveDraft();
      applyTheme();
      if (!root.hidden) renderStep({ animate: true, focus: false });
    },
    setReducedMotion(value) { draft.theme.reduced = Boolean(value); saveDraft(); applyTheme(); },
    command: emitCommand
  };

  startup();
})();
