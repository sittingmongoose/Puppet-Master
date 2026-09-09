/* ============================================================
   GLM Onboarding "obx" — state, scene art builders, helpers
   The Theater of Work · deterministic concept fixtures only
   ============================================================ */
(function () {
  'use strict';
  var T = window.PMX_OBX = window.PMX_OBX || {};

  /* ---------------- state ---------------- */
  T.state = {
    open: false, screen: 'welcome', stack: [],
    theme_family: null, theme_mode: null, mat: 'friendly', mode: 'dark',
    moreOpen: false, keep_more: true,
    finish_phase: 'a',
    draft: {
      where: null,              // 'this' | 'existing' | 'server'
      kind: null,               // 'new' | 'existing' | 'restore'
      name: '', slug: '',
      location: '',
      existing_source: null,    // 'folder' | 'online' | 'nas'
      restore: null,
      like: 'fresh',            // 'fresh' | 'inherit'
      like_project: null,
      safety: 'on',             // local history net
      online: null,             // {provider, repoName, visibility, account: null|{login}}
      nas: null,                // {host, transport:'ssh', auto:null|'running'|'done'}
      power: null               // provider id chosen in power phase
    },
    detected_providers: null,
    providers: {},              // id -> {state: 'detect'|'ready'|'signin'|'verify'|'install'|'installing'|'key'|'denied'}
    free_models: false,
    committed: false, receipt: null,
    started_at: null, finished_at: null
  };

  T.PROVIDERS = [
    { id: 'claude', name: 'Claude', sub: 'Pro or Max subscription', kind: 'subscription', cli: true },
    { id: 'anthropic', name: 'Anthropic', sub: 'Pay-as-you-go API key', kind: 'api' },
    { id: 'gemini', name: 'Gemini', sub: 'Google AI Studio key', kind: 'api' },
    { id: 'opencode', name: 'OpenCode', sub: 'Free runtime with Go or Zen', kind: 'subscription', cli: 'conditional' },
    { id: 'grok', name: 'Grok', sub: 'xAI subscription or API key', kind: 'subscription', cli: true }
  ];

  T.SCREENS = ['welcome','where','checks','device_ready','project_kind','new_project','existing_source','restore','keep','review','preparing','power','free_models','finish'];
  T.ACTS = { welcome:'Welcome', where:'The venue', checks:'The venue', device_ready:'The venue', project_kind:'The production', new_project:'The production', existing_source:'The production', restore:'The production', keep:'Keepsakes', review:'Dress rehearsal', preparing:'Opening night', power:'The power room', free_models:'The power room', finish:'Curtain call' };

  T.PERSIST_KEY = 'pm.glm.onboarding.v1';

  T.copy = {
    welcome: { kicker:'Welcome to the theater', title:'Turn an idea into a plan,\nthen let the work begin.', lede:'Puppet Master helps you describe what you want, reviews the plan with you, and coordinates the build. First, a little staging.', cta:'Raise the curtain' },
    where: { kicker:'Act one · the venue', title:'Where should the work happen?', lede:'Pick the simplest place that fits. You can move or add more later.', cta:'Continue' },
    checks: { kicker:'Act one · the venue', title:'Setting the stage', lede:"We're making sure this computer can run your work.", cta:'Continue' },
    device_ready: { kicker:'Act one · the venue', title:'This device is ready to meet your Puppet Master.', lede:'The stage is set. What would you like to do first?', cta:'Create a new project' },
    project_kind: { kicker:'Act two · the production', title:'How should we begin?', lede:'Every project is one body of work — its files, plans, and settings, together.', cta:'Continue' },
    new_project: { kicker:'Act two · the production', title:'Name your production.', lede:'A clear name keeps files and plans recognizable. Everything else here is a starting point you can change.', cta:'Continue' },
    existing_source: { kicker:'Act two · the production', title:'Where does the work live today?', lede:'Bring in files you already have. We will look, never change, until you say go.', cta:'Continue' },
    restore: { kicker:'Act two · the production', title:'Pick a backup to restore.', lede:'Restoring brings a saved project back exactly as it was.', cta:'Continue' },
    keep: { kicker:'Act three · keepsakes', title:'Keep every step recoverable.', lede:'A safety net catches every change. Optional keepsakes can live elsewhere — none of this is created until you confirm at the end.', cta:'Continue' },
    review: { kicker:'Act four · dress rehearsal', title:'One look before anything is real.', lede:'Nothing has been created yet. Check the plan, change anything, then commit.', cta:'Create project' },
    preparing: { kicker:'Act five · opening night', title:'Places, everyone.', lede:'Creating exactly what was reviewed — nothing more.', cta:'Continue' },
    power: { kicker:'Act six · the power room', title:'Choose what powers Puppet Master.', lede:'Use an AI account you already have, or add one later. Everything here stays reversible.', cta:'Continue' },
    free_models: { kicker:'Act six · the power room', title:'Add free models?', lede:'Free options for suitable tasks. Availability and limits can vary.', cta:'Set up free models' },
    finish: { kicker:'Curtain call', title:'Make Puppet Master feel like yours.', lede:'Pick a look — the whole theater restyles itself. Then let us show you around.', cta:'Show me around' }
  };

  T.CAPTIONS = {
    welcome: 'An empty stage, waiting for your first idea.',
    where: 'Every production needs a venue.',
    checks: 'Checking the rigging, lights, and stage door.',
    device_ready: 'The stage is yours.',
    project_kind: 'A new production, a classic revival, or a restoration.',
    new_project: 'The playbill gets its name.',
    existing_source: 'Your work arrives on its own terms.',
    restore: 'A saved production returns to the stage.',
    keep: 'The net, the cloud copy, the archive room.',
    review: 'The full set, assembled for inspection.',
    preparing: 'Lights cue. The playbill is stamped.',
    power: 'Batteries find their bays.',
    free_models: 'A little extra power, free of charge.',
    finish: 'Same show, four productions.'
  };

  /* ---------------- helpers ---------------- */
  function el(tag, cls, style) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (style) d.setAttribute('style', style);
    return d;
  }
  function star(x, y, d, tw) {
    return '<i class="ob-star ob-in' + (tw ? ' ob-twinkle' : '') + '" style="left:' + x + '%;top:' + y + '%;--i:' + (d || 0) + '"></i>';
  }
  T.star = star;
  T.el = el;
  T.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  T.slugify = function (s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'my-first-project';
  };

  /* drafting annotations (basic material reads these; others ignore) */
  T.notes = function (items) {
    return (items || []).map(function (n, i) {
      return '<span class="ob-note ob-in" style="left:' + n.x + '%;top:' + n.y + '%;--i:' + (4 + i) + '">' + n.t + '</span>';
    }).join('');
  };

  /* ---------------- scene art builders ---------------- */
  T.artWelcome = function () {
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += star(14, 16, 1, true) + star(26, 9, 2, true) + star(74, 12, 1, true) + star(86, 22, 3, true) + star(66, 20, 2, true);
    h += '<div class="ob-ground ob-in" style="--i:1"></div>';
    h += '<div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-stagefloor ob-in" style="--i:2"></div>';
    h += '<div class="ob-curtain"><i class="ob-in" style="--i:3"></i><i class="ob-in" style="--i:4"></i><i class="ob-in" style="--i:3"></i></div>';
    h += '<div class="ob-spot ob-in" style="--i:4"></div>';
    h += '<div class="ob-beam ob-in glow" style="--i:5"></div>';
    h += '<div class="ob-house" aria-hidden="true"></div>';
    h += '<div class="ob-seed ob-in bloom" style="--i:6"><i class="ob-leaf"></i></div>';
    h += T.notes([{ x: 6, y: 12, t: 'stage 01' }, { x: 66, y: 76, t: 'spot 5600k' }]);
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return h;
  };

  T.artWhere = function (shutter) {
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += star(18, 14, 1, true) + star(82, 18, 2, true);
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-desk ob-in" style="--i:2"></div>';
    h += '<div class="ob-machine ob-in" style="--i:3"></div><i class="ob-led ob-in glow" style="--i:5"></i>';
    h += '<div class="ob-node-b ob-in" style="--i:4"></div>';
    h += '<div class="ob-link ob-in draw" style="--i:5"></div>';
    h += '<div class="ob-crate ob-in" style="--i:4"></div>';
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    h += T.notes([{ x: 5, y: 84, t: 'fig. 1 — venue' }, { x: 60, y: 16, t: 'link — ssh' }]);
    if (shutter) {
      h += '<div class="ob-flash' + (shutter === 'after' ? ' go' : '') + '" data-shutter="' + shutter + '"><div class="ob-cam"></div><div class="after"></div></div>';
    }
    return h;
  };

  T.artProject = function (mode) {
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += star(20, 12, 1, true) + star(78, 16, 2, true) + star(60, 10, 3, true);
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-playbill ob-in" style="--i:3"><i class="ob-pb-line l1 ob-in" style="--i:5"></i><i class="ob-pb-line l2 ob-in" style="--i:6"></i><i class="ob-pb-line l3 ob-in" style="--i:7"></i><i class="ob-pb-line l2 ob-in" style="--i:8"></i><i class="ob-pb-line l3 ob-in" style="--i:9"></i></div>';
    if (mode === 'existing') {
      h += '<div class="ob-crate ob-in bloom" style="--i:5;right:24%;bottom:33%;left:auto"></div>';
    } else if (mode === 'restore') {
      h += '<div class="ob-reel spin ob-in" style="--i:5"></div>';
    } else {
      h += '<div class="ob-quill ob-in" style="--i:5"></div>';
    }
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return h;
  };

  T.artKeep = function (opts) {
    opts = opts || {};
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += star(16, 14, 1, true) + star(84, 12, 2, true);
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-net ob-in" style="--i:2"></div>';
    if (opts.online !== false) {
      h += '<div class="ob-cloud ob-in bloom ob-float" style="--i:3"></div><div class="ob-cloudline ob-in" style="--i:4"></div>';
    }
    if (opts.nas) {
      h += '<div class="ob-door ob-in" style="--i:3"></div><div class="ob-key ob-in bloom" style="--i:4"></div>';
    }
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return h;
  };

  T.artReview = function () {
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-node src ob-in bloom" style="--i:2"></div>';
    h += '<div class="ob-arrow a1 ob-in" style="--i:4"></div>';
    h += '<div class="ob-pack ob-in" style="--i:3"></div>';
    h += '<div class="ob-arrow a2 ob-in" style="--i:5"></div>';
    h += '<div class="ob-node run ob-in bloom" style="--i:4"></div>';
    h += '<div class="ob-route ob-in draw" style="--i:6"></div>';
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return h;
  };

  T.artCommit = function (go) {
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-bill ob-in" style="--i:2"><i class="ob-pb-line l1 ob-in" style="--i:4"></i><i class="ob-pb-line l2 ob-in" style="--i:5"></i><i class="ob-pb-line l3 ob-in" style="--i:6"></i></div>';
    h += '<div class="ob-lightcue"></div>';
    h += '<div class="ob-lightsweep" aria-hidden="true"></div>';
    h += '<div class="ob-stamp">Ready</div>';
    h += '<i class="ob-paper" style="left:34%;top:38%;--px:-34px"></i><i class="ob-paper p2" style="left:47%;top:33%;--px:-90px"></i><i class="ob-paper p3" style="left:56%;top:40%;--px:60px"></i><i class="ob-paper p4" style="left:64%;top:34%;--px:110px"></i><i class="ob-paper p5" style="left:40%;top:44%;--px:-130px"></i>';
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    if (go) h = h.replace('os-commit', 'os-commit go').replace('<div class="ob-lightcue">', '<div class="ob-lightcue on">');
    return h;
  };

  /* power room: strips + nodes + trapezoid + pulse (verified vocabulary) */
  T.artPower = function (opts) {
    opts = opts || {};
    var ready = opts.ready || 0;
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    h += '<div class="ob-rack ob-in" style="--i:2">';
    for (var i = 0; i < 3; i++) {
      h += '<div class="ob-slot ob-in' + (i < ready ? ' glow' : '') + '" style="--i:' + (3 + i) + '"></div>';
    }
    h += '</div>';
    h += '<div class="ob-trapezoid ob-in" style="--i:4;position:absolute;left:50%;bottom:47.5%;transform:translateX(-50%);width:15%;height:8%;background:color-mix(in srgb,var(--obx-accent) 12%,transparent);border:1px solid var(--obx-accent);clip-path:polygon(12% 0,88% 0,100% 100%,0 100%)"></div>';
    if (ready > 0) h += '<div class="ob-pulse ob-in" style="--i:5"></div>';
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return h;
  };

  /* finish: theme parade — phase variants per family; glass keeps photo sprites */
  T.artFinish = function (mat, phase) {
    phase = phase || 'a';
    var h = '<div class="ob-backdrop ob-in" style="--i:0"></div>';
    h += '<div class="ob-ground ob-in" style="--i:1"></div><div class="ob-horizon ob-in" style="--i:1"></div>';
    if (mat === 'glass') {
      h += '<div class="ob-swatchstack ob-in" style="--i:2">'
        + '<div class="ob-swatchcard s1 ob-in" style="--i:3"></div>'
        + '<div class="ob-swatchcard s2 ob-in" style="--i:4"></div>'
        + '<div class="ob-swatchcard s3 ob-in" style="--i:5"></div></div>';
      h += star(22, 18, 2, true) + star(76, 15, 3, true) + star(58, 11, 1, true);
    } else {
      var letters = ['a', 'b', 'c', 'd'];
      for (var li = 0; li < letters.length; li++) {
        var L = letters[li];
        h += '<span class="ob-phase ob-ph-' + L + '">'
          + '<div class="ob-swatchstack ob-in" style="--i:2">'
          + '<div class="ob-swatchcard s1 ob-in" style="--i:3"></div>'
          + '<div class="ob-swatchcard s2 ob-in" style="--i:4"></div>'
          + '<div class="ob-swatchcard s3 ob-in" style="--i:5"></div></div>'
          + '</span>';
      }
      h += star(22, 18, 2, true) + star(76, 15, 3, true) + star(58, 11, 1, true);
      h += '<i class="ob-spark ob-in ob-twinkle" style="left:30%;top:30%;--i:6"></i><i class="ob-spark ob-in ob-twinkle" style="left:66%;top:26%;--i:7"></i>';
    }
    h += '<div class="ob-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return { html: h, phase: phase };
  };

  /* ---------------- svg icons ---------------- */
  T.icon = function (name) {
    var paths = {
      check: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.2l2.6 2.7L10 3.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      arrow: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h9M8 3.6L11.4 7 8 10.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .8a7.2 7.2 0 0 0-2.3 14c.4.1.5-.2.5-.4v-1.4c-2 .4-2.4-1-2.4-1-.3-.8-.8-1-.8-1-.7-.5.1-.5.1-.5.7.1 1.1.8 1.1.8.7 1.1 1.7.8 2.1.6.1-.5.3-.8.5-1-1.6-.2-3.3-.8-3.3-3.6 0-.8.3-1.4.8-1.9-.1-.2-.3-.9.1-1.9 0 0 .6-.2 2 .8a6.8 6.8 0 0 1 3.6 0c1.4-1 2-.8 2-.8.4 1 .2 1.7.1 1.9.5.5.8 1.1.8 1.9 0 2.8-1.7 3.4-3.3 3.6.3.2.5.7.5 1.5v2.2c0 .2.1.5.5.4A7.2 7.2 0 0 0 8 .8z" fill="currentColor"/></svg>',
      shield: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2l5.4 2v4.2c0 3.3-2.3 5.7-5.4 6.9-3.1-1.2-5.4-3.6-5.4-6.9V3.2z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.6 7.6L7.4 9.4l3-3.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.4" y="7" width="9.2" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
      info: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="5" r=".9" fill="currentColor"/></svg>'
    };
    return paths[name] || paths.info;
  };

  /* ---------------- source + provider metadata ---------------- */
  T.FORGES = [
    { id: 'github', name: 'GitHub', sub: 'The most popular home for code' },
    { id: 'gitlab', name: 'GitLab', sub: 'Built for teams' },
    { id: 'bitbucket', name: 'Bitbucket', sub: 'Atlassian families' },
    { id: 'forgejo', name: 'Forgejo', sub: 'Self-hosted, yours entirely' }
  ];

  T.NAS_TRANSPORTS = [
    { id: 'ssh', name: 'SSH', sub: 'Recommended · secure and automatic', recommended: true },
    { id: 'smb', name: 'SMB share', sub: 'Windows network folder' },
    { id: 'nfs', name: 'NFS', sub: 'Unix network storage' }
  ];

  T.THEME_FAMILIES = [
    { id: 'friendly', name: 'Friendly', sub: 'Warm storybook paper' },
    { id: 'glass', name: 'Glass', sub: 'Luminous layered panes' },
    { id: 'retro', name: 'Retro', sub: 'Phosphor matinee CRT' },
    { id: 'basic', name: 'Basic', sub: 'Clean drafting-table ink' }
  ];

  T.editTo = {
    name: 'new_project', title: 'new_project', location: 'new_project', runs: 'where',
    like: 'keep', online: 'keep', nas: 'keep', source: 'existing_source', restore: 'restore'
  };

  /* detected-provider preview rows (power screen) */
  T.providersPreview = function () {
    if (!T.state.detected_providers || !T.state.detected_providers.length) return '';
    var rows = T.state.detected_providers.map(function (p) {
      return '<div class="obx-chip">' + T.icon('check') + '<b>' + T.esc(p.name) + '</b>&nbsp;ready on this device</div>';
    }).join('');
    return '<div class="obx-set" style="margin-bottom:2px"><div class="obx-set-head">' + T.icon('shield') + 'Already set up</div>' + rows + '</div>';
  };
})();
