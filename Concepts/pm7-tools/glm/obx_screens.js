/* ============================================================
   GLM Onboarding "obx" — screens
   Each screen: one main idea, plain language, reversible draft.
   ============================================================ */
(function () {
  'use strict';
  var T = window.PMX_OBX;
  var S = T.screens = {};

  function choiceCard(o) {
    return '<button type="button" class="obx-choice" data-choice="' + o.value + '" aria-pressed="' + (o.on ? 'true' : 'false') + '">'
      + '<span class="obx-dot"></span>'
      + '<span class="obx-choice-main"><span class="obx-choice-title">' + o.title + '</span>'
      + (o.sub ? '<span class="obx-choice-sub">' + o.sub + '</span>' : '') + '</span>'
      + '<span class="obx-check">' + T.icon('check') + '</span></button>';
  }
  function rowCard(o) {
    return '<button type="button" class="obx-row" data-choice="' + o.value + '" aria-pressed="' + (o.on ? 'true' : 'false') + '">'
      + '<span class="obx-dot"></span>'
      + '<span class="obx-row-main"><span class="obx-row-title">' + o.title + '</span>'
      + (o.sub ? '<span class="obx-row-sub">' + o.sub + '</span>' : '') + '</span></button>';
  }
  function setCard(head, rows) {
    return '<div class="obx-set"><div class="obx-set-head">' + T.icon('check') + head + '</div>' + rows.join('') + '</div>';
  }
  function choiceRowOk(label) {
    return '<div class="obx-set-row"><span class="obx-ok">' + T.icon('check') + '</span>' + label + '</div>';
  }

  /* ---------------- welcome ---------------- */
  S.welcome = function () {
    return {
      html: '<div class="obx-cstep">'
        + setCard('In the next two minutes', [
          choiceRowOk('Choose where the work happens'),
          choiceRowOk('Set up your first project — nothing is created until you confirm'),
          choiceRowOk('Optionally connect an AI account')
        ])
        + '</div>',
      cta: 'Raise the curtain', ctaDisabled: false
    };
  };

  /* ---------------- where ---------------- */
  S.where = function () {
    var d = T.state.draft;
    var serverCard = choiceCard({ value: 'server', on: d.where === 'server', title: 'Set up a new Puppet Master server', sub: 'Turn another computer into the stage. For later, when your productions grow.' });
    return {
      html: '<div class="obx-cstep">'
        + choiceCard({ value: 'this', on: d.where === 'this', title: 'This computer', sub: 'The simplest start. Puppet Master works here while this machine is on.' })
        + choiceCard({ value: 'existing', on: d.where === 'existing', title: 'A Puppet Master device I already have', sub: 'Connect to a stage you have already set up elsewhere.' })
        + '<details class="obx-disclosure"' + (T.state.moreOpen ? ' open' : '') + '><summary id="pmx-more-toggle">Show one more way</summary>' + serverCard + '</details>'
        + '</div>',
      cta: 'Continue', ctaDisabled: !d.where,
      mount: function (root) {
        var det = root.querySelector('details');
        if (det) det.addEventListener('toggle', function () { T.state.moreOpen = det.open; });
      }
    };
  };

  /* ---------------- checks (auto-run) ---------------- */
  S.checks = function () {
    var rows = [
      { id: 'disk', label: 'Room for scenery', note: 'checking storage…' },
      { id: 'perm', label: 'Stage-door keys', note: 'checking permissions…' },
      { id: 'runtime', label: 'House lights', note: 'checking runtime…' }
    ];
    return {
      html: '<div class="obx-cstep"><div class="obx-prep" id="pmx-check-rows">'
        + rows.map(function (r) { return '<div class="obx-prep-row" data-check="' + r.id + '"><span class="obx-spin"></span><span>' + r.label + '</span><span class="obx-prep-note">' + r.note + '</span></div>'; }).join('')
        + '</div></div>',
      cta: 'Continue', ctaDisabled: true, hideBack: true,
      mount: function () { T.runChecks(); }
    };
  };

  /* ---------------- device ready ---------------- */
  S.device_ready = function () {
    var d = T.state.draft;
    var whereLabel = d.where === 'existing' ? 'Connected to your Puppet Master device' : d.where === 'server' ? 'Your new server is staged' : 'Working on this computer';
    return {
      html: '<div class="obx-cstep">'
        + setCard('Setup complete', [choiceRowOk(whereLabel), choiceRowOk('Ready to open your first project')])
        + '<div class="obx-grouplabel">Next</div>'
        + choiceCard({ value: 'new', on: true, title: 'Create a new project', sub: 'A clean stage for your next idea.' })
        + rowCard({ value: 'existing', on: false, title: 'Use work that already exists', sub: 'Files on this computer, online, or on network storage.' })
        + rowCard({ value: 'look', on: false, title: 'Just look around first', sub: 'Skip setup for now — you can start a project anytime.' })
        + '</div>',
      cta: 'Create a new project', ctaDisabled: false
    };
  };

  /* ---------------- project kind ---------------- */
  S.project_kind = function () {
    var d = T.state.draft;
    return {
      html: '<div class="obx-cstep">'
        + choiceCard({ value: 'new', on: d.kind === 'new', title: 'Start a new project', sub: 'Begin with a clean space — name it, choose keepsakes later.' })
        + choiceCard({ value: 'existing', on: d.kind === 'existing', title: 'Use work that already exists', sub: 'A folder here, a project stored online, or files on network storage.' })
        + choiceCard({ value: 'restore', on: d.kind === 'restore', title: 'Restore a project', sub: 'Bring back a saved backup exactly as it was.' })
        + '</div>',
      cta: 'Continue', ctaDisabled: !d.kind
    };
  };

  /* ---------------- new project ---------------- */
  S.new_project = function () {
    var d = T.state.draft;
    var location = d.location || (T.state.userName ? '/Users/' + T.state.userName : '') + '/Puppet Master/' + (d.slug || 'my-first-project');
    var hostLabel = d.where === 'this' ? 'This computer' : d.where === 'existing' ? 'Your Puppet Master device' : 'Your server';
    var likeBlock = '';
    if (T.state.existingProjects && T.state.existingProjects.length) {
      var proj = T.state.existingProjects[0];
      var inheriting = d.like === 'inherit';
      likeBlock = '<div class="obx-grouplabel">Start like another project?</div>'
        + rowCard({ value: 'fresh', on: !inheriting, title: 'Start fresh', sub: 'Default settings, nothing carried over.' })
        + rowCard({ value: 'inherit', on: inheriting, title: 'Like ' + T.esc(proj.name), sub: 'Reuses its planning preferences, permissions, and provider routes. Files and history stay separate.' });
    }
    return {
      html: '<div class="obx-cstep"><div class="obx-form">'
        + '<div class="obx-field"><label for="pmx-name">Project name</label>'
        + '<input class="obx-input" id="pmx-name" type="text" value="' + T.esc(d.name) + '" placeholder="e.g. Book club website" autocomplete="off" spellcheck="false" maxlength="48">'
        + '<p class="obx-hint">Files will live at <code>' + T.esc(location) + '</code></p></div>'
        + '<div class="obx-field"><label>Runs on</label>'
        + '<div class="obx-row" aria-pressed="true" style="cursor:default"><span class="obx-dot" style="border-color:var(--obx-accent)"></span><span class="obx-row-main"><span class="obx-row-title">' + hostLabel + '</span><span class="obx-row-sub">Chosen in act one · change anytime in settings</span></span></div>'
        + '</div>'
        + likeBlock
        + '</div></div>',
      cta: 'Continue', ctaDisabled: !d.name || !d.name.trim(),
      mount: function (root) {
        var input = root.querySelector('#pmx-name');
        if (input) {
          input.addEventListener('input', function () {
            T.state.draft.name = input.value;
            T.state.draft.slug = T.slugify(input.value);
            var hint = root.querySelector('.obx-hint code');
            if (hint) hint.textContent = (T.state.userName ? '/Users/' + T.state.userName : '') + '/Puppet Master/' + (T.state.draft.slug || 'my-first-project');
            T.syncCta();
          });
          setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 240);
        }
      }
    };
  };

  /* ---------------- existing source ---------------- */
  S.existing_source = function () {
    var d = T.state.draft;
    return {
      html: '<div class="obx-cstep">'
        + choiceCard({ value: 'folder', on: d.existing_source === 'folder', title: 'A folder on this computer', sub: 'Point us at it — we look, never change, until you say go.' })
        + choiceCard({ value: 'online', on: d.existing_source === 'online', title: 'A project stored online', sub: 'GitHub and friends. Sign in to browse your projects there.' })
        + choiceCard({ value: 'nas', on: d.existing_source === 'nas', title: 'Files on network storage', sub: 'A NAS or shared drive. SSH keeps the connection secure and automatic.' })
        + '</div>',
      cta: 'Continue', ctaDisabled: !d.existing_source
    };
  };

  /* ---------------- restore ---------------- */
  S.restore = function () {
    var d = T.state.draft;
    var backups = T.state.backupList || [
      { id: 'bk-041', name: 'Book club website', date: 'Sep 2, 2026 · 4.2 GB' },
      { id: 'bk-037', name: 'Garden sensors', date: 'Aug 28, 2026 · 810 MB' }
    ];
    return {
      html: '<div class="obx-cstep">'
        + backups.map(function (b) {
          return rowCard({ value: b.id, on: d.restore === b.id, title: T.esc(b.name), sub: T.esc(b.date) + ' · ' + b.id });
        }).join('')
        + '</div>',
      cta: 'Continue', ctaDisabled: !d.restore
    };
  };

  /* ---------------- keep (safety net + optional keepsakes) ---------------- */
  S.keep = function () {
    var d = T.state.draft;
    var online = d.online, nas = d.nas;
    var onlineRows = '';
    if (d.keep_open === 'online' || online) {
      var forge = (online && online.provider) || 'github';
      var signedIn = online && online.account;
      onlineRows = '<div class="obx-grouplabel">Online copy — ' + (T.FORGES.find(function (f) { return f.id === forge; }) || T.FORGES[0]).name + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:6px">'
        + T.FORGES.map(function (f) {
          return '<button type="button" class="obx-row" data-forge="' + f.id + '" aria-pressed="' + ((online && online.provider) === f.id) + '"><span class="obx-dot"></span><span class="obx-row-main"><span class="obx-row-title">' + f.name + '</span><span class="obx-row-sub">' + f.sub + '</span></span></button>';
        }).join('')
        + (signedIn
          ? '<div class="obx-receipt">' + T.icon('check') + '<span>Signed in as <b>' + T.esc(online.account.login) + '</b> · the online copy is created only when you commit</span></div>'
          : '<button type="button" class="obx-mini" data-action="signin" style="align-self:flex-start">Sign in or create an account</button>')
        + '</div>';
    }
    var nasRows = '';
    if (d.keep_open === 'nas' || nas) {
      var transport = (nas && nas.transport) || 'ssh';
      var auto = nas && nas.auto;
      nasRows = '<div class="obx-grouplabel">Network storage connection</div>'
        + '<div style="display:flex;flex-direction:column;gap:6px">'
        + T.NAS_TRANSPORTS.map(function (tr) {
          return '<button type="button" class="obx-row" data-transport="' + tr.id + '" aria-pressed="' + (transport === tr.id) + '"><span class="obx-dot"></span><span class="obx-row-main"><span class="obx-row-title">' + tr.name + (tr.recommended ? ' — recommended' : '') + '</span><span class="obx-row-sub">' + tr.sub + '</span></span></button>';
        }).join('')
        + (auto === 'done'
          ? '<div class="obx-receipt">' + T.icon('check') + '<span>Connected automatically · a dedicated key now opens this door</span></div>'
          : auto === 'running'
          ? '<div class="obx-prep" id="pmx-ssh-rows">' + T.sshRows() + '</div>'
          : '<button type="button" class="obx-mini" data-action="ssh-auto" style="align-self:flex-start">Connect automatically</button>')
        + '</div>';
    }
    return {
      html: '<div class="obx-cstep">'
        + choiceCard({ value: 'safety', on: d.safety === 'on', title: 'Safety net', sub: 'Every change is saved as a recoverable step. Strongly recommended.' })
        + choiceCard({ value: 'online', on: !!online, title: 'An online copy', sub: 'Keep a spare copy of your project on GitHub or friends.' })
        + choiceCard({ value: 'nas', on: !!nas, title: 'Network storage archive', sub: 'A NAS or shared drive at home, reached over SSH.' })
        + ((onlineRows || nasRows) ? '<div class="obx-stage-note-space"></div>' + onlineRows + nasRows : '')
        + '</div>',
      cta: 'Continue', ctaDisabled: false
    };
  };

  T.sshRows = function () {
    var steps = [
      { id: 'find', label: 'Find your storage on the network' },
      { id: 'key', label: 'Create a dedicated backstage key' },
      { id: 'pass', label: 'Enter the storage password once' },
      { id: 'verify', label: 'Open the door and remember it' }
    ];
    var done = (T.state.draft.nas && T.state.draft.nas.autoStep) || 0;
    return steps.map(function (s, i) {
      var cls = i < done ? 'done' : i === done ? 'run' : '';
      var mark = i < done ? '<span class="obx-done">' + T.icon('check') + '</span>' : '<span class="obx-spin" style="' + (i === done ? '' : 'visibility:hidden') + '"></span>';
      return '<div class="obx-prep-row ' + cls + '">' + mark + '<span>' + s.label + '</span></div>';
    }).join('');
  };

  /* ---------------- review ---------------- */
  S.review = function () {
    var d = T.state.draft;
    var userName = T.state.userName ? '/Users/' + T.state.userName : '';
    var isRestore = d.kind === 'restore';
    var isExisting = d.kind === 'existing';
    var path = d.location || userName + '/Puppet Master/' + (d.slug || 'my-first-project');
    var hostLabel = d.where === 'this' ? 'This computer' : d.where === 'existing' ? 'Your Puppet Master device' : 'Your new server';
    var keeps = [];
    if (d.safety === 'on') keeps.push('safety net');
    if (d.online) keeps.push('online copy on ' + ((T.FORGES.find(function (f) { return f.id === d.online.provider; }) || T.FORGES[0]).name));
    if (d.nas) keeps.push('NAS archive over ' + String(d.nas.transport || 'ssh').toUpperCase());
    var kindLabel = isRestore ? 'Restored from backup' : isExisting ? 'Existing files' : d.like === 'inherit' ? 'New · like ' + (T.state.existingProjects ? T.state.existingProjects[0].name : 'another project') : 'Brand new';
    var title = d.name || 'Untitled';
    var desc = isRestore ? 'Everything comes back exactly as it was.' : isExisting ? 'Your files arrive exactly as they are.' : 'A clean stage for your idea.';
    function sec(label, value, sub, edit) {
      return '<section><span class="obx-review-label">' + label + '</span><span class="obx-review-value">' + value + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (edit ? '<button type="button" class="obx-edit" data-edit="' + edit + '">Edit</button>' : '') + '</section>';
    }
    return {
      html: '<div class="obx-cstep">'
        + '<div class="obx-reviewcard">'
        + sec('Project', '<b>' + T.esc(title) + '</b>', desc, 'name')
        + sec('Files', '<code style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px">' + T.esc(path) + '</code>', null, 'location')
        + sec('Runs on', hostLabel, null, 'runs')
        + sec('Starting point', kindLabel, null, 'like')
        + sec('Keepsakes', keeps.length ? keeps.join(' · ') : 'None — you can add later', null, keeps.length ? 'online' : null)
        + '</div>'
        + '<div class="obx-review-note">' + T.icon('shield') + '<span><b>Nothing exists yet.</b> One tap creates exactly this — folder, safety net' + (d.online ? ', online copy' : '') + (d.nas ? ', archive link' : '') + '. Nothing more.</span></div>'
        + '</div>',
      cta: isRestore ? 'Restore project' : isExisting ? 'Add project' : 'Create project', ctaDisabled: false
    };
  };

  /* ---------------- preparing (commit) ---------------- */
  S.preparing = function () {
    var d = T.state.draft;
    var steps = [
      { id: 'folder', label: 'Create the project folder' },
      { id: 'net', label: 'Set up the safety net' }
    ];
    if (d.online) steps.push({ id: 'online', label: 'Create the online copy' });
    if (d.nas) steps.push({ id: 'nas', label: 'Link the network archive' });
    steps.push({ id: 'card', label: 'Write the project card' });
    return {
      html: '<div class="obx-cstep"><div class="obx-prep" id="pmx-prep-rows">'
        + steps.map(function (s) {
          return '<div class="obx-prep-row" data-prep="' + s.id + '"><span class="obx-spin"></span><span>' + s.label + '</span><span class="obx-prep-note">waiting…</span></div>';
        }).join('')
        + '</div><div id="pmx-receipt-slot"></div></div>',
      cta: 'Continue', ctaDisabled: true, hideBack: true,
      mount: function () { T.runCommit(steps); }
    };
  };

  /* ---------------- power ---------------- */
  S.power = function () {
    var st = T.state.providers;
    var detected = T.providersPreview();
    var rows = T.PROVIDERS.map(function (p) {
      var ps = st[p.id] || { state: 'detect' };
      var action = '', state = '';
      if (ps.state === 'ready') {
        state = '<span class="obx-chip">' + T.icon('check') + 'Ready' + (ps.login ? ' · ' + T.esc(ps.login) : '') + '</span>';
      } else if (ps.state === 'signin' || ps.state === 'verify') {
        state = '<span class="obx-chip">Sign in needed</span>';
        action = '<button type="button" class="obx-mini" data-provider="' + p.id + '" data-action="signin">Sign in</button>';
      } else if (ps.state === 'key') {
        state = '<span class="obx-chip">API key needed</span>';
        action = '<button type="button" class="obx-mini" data-provider="' + p.id + '" data-action="apikey">Enter API key</button>';
      } else if (ps.state === 'install' || ps.state === 'installing') {
        state = '<span class="obx-chip">Install needed</span>';
        action = '<button type="button" class="obx-mini" data-provider="' + p.id + '" data-action="install"' + (ps.state === 'installing' ? ' aria-disabled="true"' : '') + '>' + (ps.state === 'installing' ? 'Installing…' : 'Install ' + p.name + ' CLI') + '</button>';
      } else if (ps.state === 'denied') {
        state = '<span class="obx-chip">Not signed in</span>';
        action = '<button type="button" class="obx-mini" data-provider="' + p.id + '" data-action="signin">Try again</button>';
      }
      return '<div class="obx-row" style="cursor:default" data-provider-row="' + p.id + '">'
        + '<span class="obx-row-main"><span class="obx-row-title">' + p.name + '</span><span class="obx-row-sub">' + p.sub + '</span></span>'
        + state + ' ' + action + '</div>';
    }).join('');
    var anyReady = Object.keys(st).some(function (k) { return st[k].state === 'ready'; });
    return {
      html: '<div class="obx-cstep">'
        + (detected || '')
        + '<div class="obx-grouplabel">Accounts</div>'
        + rows
        + '<div id="pmx-sheet-slot"></div>'
        + '</div>',
      cta: anyReady ? 'Continue' : 'Skip for now', ctaDisabled: false,
      quiet: anyReady ? 'Skip for now' : null,
      mount: function () { T.detectProviders(); }
    };
  };

  /* ---------------- free models ---------------- */
  S.free_models = function () {
    var free = [
      { name: 'OpenCode Zen', sub: 'Free · community models for small tasks' },
      { name: 'Gemini Flash', sub: 'Free tier · fast, light work' }
    ];
    return {
      html: '<div class="obx-cstep">'
        + setCard('Already free on this device', free.map(function (f) { return choiceRowOk(f.name + ' · ' + f.sub); }))
        + '<p class="obx-lde" style="font-size:13px">Puppet Master will use free options for suitable tasks and your chosen account for the rest.</p>'
        + '</div>',
      cta: 'Set up free models', ctaDisabled: false,
      quiet: 'Skip this'
    };
  };

  /* ---------------- finish (theme picker + actions) ---------------- */
  S.finish = function () {
    var fam = T.state.theme_family || 'friendly';
    var mode = T.state.theme_mode || 'dark';
    return {
      html: '<div class="obx-cstep">'
        + '<div class="obx-themegrid">'
        + T.THEME_FAMILIES.map(function (f) {
          return '<button type="button" class="obx-themecard" data-theme="' + f.id + '" aria-pressed="' + (fam === f.id) + '">'
            + '<span class="obx-swatch" aria-hidden="true"><i></i><i></i><i></i></span>'
            + '<span class="obx-theme-name">' + f.name + '</span><span class="obx-theme-sub">' + f.sub + '</span></button>';
        }).join('')
        + '</div>'
        + '<div class="obx-modeline">'
        + '<button type="button" data-mode-btn="light" aria-pressed="' + (mode === 'light') + '">Light</button>'
        + '<button type="button" data-mode-btn="dark" aria-pressed="' + (mode === 'dark') + '">Dark</button>'
        + '</div>'
        + '<div class="obx-finish-actions">'
        + '<button type="button" class="obx-cta" data-finish="tour">Show me around</button>'
        + '<button type="button" class="obx-mini" data-finish="wizard" style="text-align:center">Start planning instead</button>'
        + '<button type="button" class="obx-mini" data-finish="done" style="text-align:center">I am done for now</button>'
        + '</div>'
        + '</div>',
      cta: null, ctaDisabled: false
    };
  };
})();
