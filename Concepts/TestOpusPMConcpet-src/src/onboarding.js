/* =====================================================================
   PMO ONBOARDING — the window controller.

   One idea per screen, conditional branches, and a draft that stays
   reversible until the single commit. The stage plate on the left is a
   persistent object: it re-draws between beats rather than cutting.
   ===================================================================== */
(function () {
  'use strict';
  if (window.PMO_ONBOARDING) return;

  var FLOW = window.PMO_FLOW, ART = window.PMO_ART;
  var root, slots = {}, mounted = false;
  var current = null, history = [], commitCtl = null, providerCache = null;
  var paintedScreen = null;

  /* ------------------------------------------------------------ icons */

  var I = {
    computer: '<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="4" width="19" height="12.5" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 20h8M12 16.5V20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    devices:  '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.8" stroke="currentColor" stroke-width="1.7"/><rect x="15.5" y="9" width="6.5" height="11" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M5 17.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    server:   '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3.5" width="18" height="7" rx="1.8" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="13.5" width="18" height="7" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M6.5 7h.01M6.5 17h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    spark:    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v5M12 16v5M4.5 12h5M14.5 12h5M6.7 6.7l3.5 3.5M13.8 13.8l3.5 3.5M17.3 6.7l-3.5 3.5M10.2 13.8l-3.5 3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    folder:   '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6.5A1.5 1.5 0 014.5 5h4l2 2.5h9A1.5 1.5 0 0121 9v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V6.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    cloud:    '<svg viewBox="0 0 24 24" fill="none"><path d="M7 18.5h10a4 4 0 00.5-7.97 5.5 5.5 0 00-10.6-1.2A3.75 3.75 0 007 18.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    network:  '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="6" rx="1.6" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="14" width="18" height="6" rx="1.6" stroke="currentColor" stroke-width="1.7"/><path d="M6.5 7h.01M6.5 17h.01M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    clock:    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    restore:  '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 108-8 8 8 0 00-5.7 2.4L4 8.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4.5V9h4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    seed:     '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21v-8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.2-5.5-5.5-5.5 0 3 2.2 5.5 5.5 5.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    check:    '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    key:      '<svg viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 12h9M18 12v3.5M15.5 12v2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    shield:   '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7.5 3v5.5c0 4.4-3 8.3-7.5 9.5-4.5-1.2-7.5-5.1-7.5-9.5V6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    warn:     '<svg viewBox="0 0 16 16" fill="none"><path d="M8 5v4M8 11.2h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  function h(str) { return String(str === null || str === undefined ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* --------------------------------------------------- small builders */

  function choice(o) {
    return '<button type="button" class="pmo-choice" data-pmo-act="' + o.act + '" data-arg="' + h(o.arg) + '"' +
      ' aria-pressed="' + (o.on ? 'true' : 'false') + '">' +
      '<span class="pmo-choice-ic">' + (o.icon || '') + '</span>' +
      '<span><span class="pmo-choice-t">' + h(o.title) + '</span>' +
      '<span class="pmo-choice-d">' + h(o.detail) + '</span></span>' +
      (o.tag ? '<span class="pmo-choice-tag">' + h(o.tag) + '</span>'
             : '<span class="pmo-choice-check">' + I.check + '</span>') +
      '</button>';
  }

  function switchRow(o) {
    return '<div class="pmo-switch-row">' +
      '<span><span class="pmo-choice-t">' + h(o.title) + '</span>' +
      '<span class="pmo-choice-d">' + h(o.detail) + '</span></span>' +
      '<button type="button" class="pmo-switch" role="switch" aria-checked="' + (o.on ? 'true' : 'false') +
      '" data-pmo-act="' + o.act + '" aria-label="' + h(o.title) + '"></button></div>';
  }

  function reviewRow(k, v, edit) {
    return '<div class="pmo-review-row"><span class="pmo-review-k">' + h(k) + '</span>' +
      '<span class="pmo-review-v">' + v + '</span>' +
      (edit ? '<button type="button" class="pmo-edit" data-pmo-act="goto" data-arg="' + edit + '">Change</button>' : '<span></span>') +
      '</div>';
  }

  /* ------------------------------------------------------------ screens
     Each returns { chapter, scene, cap, eyebrow, h, sub, body, actions,
     noBack }.  `actions` are footer buttons.
     ------------------------------------------------------------------ */

  var SCREENS = {

    /* ---------------------------------------------------- 1. welcome */
    welcome: function () {
      return {
        chapter: 'start', scene: 'marionette', cap: 'You direct. It does the work.',
        eyebrow: 'Welcome',
        h: 'Say what you want.<br>Check the plan. Then let it work.',
        sub: 'Puppet Master turns an idea into a plan you can read — and it waits for your go-ahead before anything is made or changed.',
        body: '<p class="pmo-note">Setting up takes about a minute. Nothing is created until the last step, and you can stop at any point.</p>',
        actions: [{ label: 'Get started', act: 'next', primary: true }],
        noBack: true
      };
    },

    /* ------------------------------------------ 2. where work happens */
    where: function (d) {
      return {
        chapter: 'start', scene: 'workbench', cap: 'One computer does the work.',
        eyebrow: 'Step 1',
        h: 'Which computer should do the work?',
        sub: 'Puppet Master needs one computer to actually run things. It can be this one.',
        body: '<div class="pmo-choices">' +
          choice({ act: 'where', arg: 'this-device', on: d.where === 'this-device', icon: I.computer,
                   title: 'This computer', detail: 'Everything runs right here. Nothing else to set up.',
                   tag: d.where === 'this-device' ? 'Chosen' : null }) +
          choice({ act: 'where', arg: 'existing-device', on: d.where === 'existing-device', icon: I.devices,
                   title: 'A Puppet Master I already have', detail: 'Connect to one running somewhere else — a spare machine, or one in another room.' }) +
          choice({ act: 'where', arg: 'new-server', on: d.where === 'new-server', icon: I.server,
                   title: 'Set up another computer', detail: 'Turn a spare machine or home server into the one that does the work.' }) +
          '</div>',
        actions: [{ label: 'Continue', act: 'next', primary: true }]
      };
    },

    /* ------------------------------------------------------- pairing */
    pair: function (d) {
      var code = d.pairCode || 'PM-4K7-92B';
      return {
        chapter: 'start', scene: 'workbench', cap: 'Two devices, one code.',
        eyebrow: 'Connecting',
        h: 'Type this code on the other device.',
        sub: 'Open Puppet Master over there and choose “Add a device”. This code proves the two belong to you.',
        body: '<div class="pmo-inline" style="justify-content:center;padding:22px">' +
                '<span class="pmo-inline-v" style="font-size:30px;letter-spacing:.18em;font-weight:700">' + h(code) + '</span>' +
              '</div>' +
              '<div class="pmo-choices" style="margin-top:16px">' +
                FLOW.fixtures.devices.map(function (dev) {
                  return choice({ act: 'pick-device', arg: dev.id, on: d.device && d.device.id === dev.id,
                                  icon: I.server, title: dev.name, detail: dev.detail,
                                  tag: dev.ready ? 'Found' : null });
                }).join('') +
              '</div>' +
              '<p class="pmo-note">Already see the device above? Choose it and carry on — the code is only needed for a device Puppet Master has never met.</p>',
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !d.device }]
      };
    },

    /* ----------------------- device ready — the fork the brief asked for */
    'device-ready': function (d) {
      var name = (d.device && d.device.name) || 'This device';
      return {
        chapter: 'start', scene: 'curtain', cap: 'Connected.',
        eyebrow: 'Connected',
        h: name + ' is ready to meet your Puppet Master.',
        sub: 'The two can now talk to each other. From here you can start something new, or stop and come back later.',
        body: '<div class="pmo-choices">' +
          choice({ act: 'from-ready', arg: 'new', icon: I.seed,
                   title: 'Create a new project', detail: 'Give it a name and choose where the files live. Takes about a minute.',
                   tag: 'Recommended' }) +
          choice({ act: 'from-ready', arg: 'existing', icon: I.folder,
                   title: 'Use work that already exists', detail: 'Point Puppet Master at files you have here, online, or on another device.' }) +
          choice({ act: 'from-ready', arg: 'finish', icon: I.check,
                   title: 'That is all for now', detail: 'Finish setup. You can add a project whenever you like.' }) +
          '</div>',
        actions: []
      };
    },

    /* --------------------------------------- 3. how the project begins */
    begin: function (d) {
      return {
        chapter: 'project', scene: 'origin', cap: 'Three ways to begin.',
        eyebrow: 'Step 2',
        h: 'What are we starting with?',
        sub: 'A project keeps one body of work together — its files, its plans, and its history.',
        body: '<div class="pmo-choices">' +
          choice({ act: 'begin', arg: 'new', on: d.begin === 'new', icon: I.seed,
                   title: 'Something new', detail: 'I have an idea. Start from an empty project.' }) +
          choice({ act: 'begin', arg: 'existing', on: d.begin === 'existing', icon: I.folder,
                   title: 'Work that already exists', detail: 'Files on this computer, on another computer, or stored online.' }) +
          choice({ act: 'begin', arg: 'restore', on: d.begin === 'restore', icon: I.restore,
                   title: 'Bring back a project', detail: 'Restore one from a backup or from another Puppet Master.' }) +
          '</div>',
        actions: [{ label: 'Continue', act: 'next', primary: true }]
      };
    },

    /* --------------------------------- where existing work lives today */
    source: function (d) {
      return {
        chapter: 'project', scene: 'origin', cap: 'Where the work lives now.',
        eyebrow: 'Step 2',
        h: 'Where is that work right now?',
        sub: 'Puppet Master will read it where it is. Nothing moves or changes until you confirm.',
        body: '<div class="pmo-choices">' +
          choice({ act: 'source', arg: 'folder', on: d.source === 'folder', icon: I.folder,
                   title: 'A folder on this computer', detail: 'Pick the folder the work already sits in.' }) +
          choice({ act: 'source', arg: 'online', on: d.source === 'online', icon: I.cloud,
                   title: 'Stored online', detail: 'On a service like GitHub — often how work is shared with other people.' }) +
          choice({ act: 'source', arg: 'network', on: d.source === 'network', icon: I.network,
                   title: 'On another computer or storage device', detail: 'A home server, a network drive, or a machine you reach over the network.' }) +
          '</div>',
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !d.source }]
      };
    },

    /* ------------------------------------------- existing local folder */
    'source-folder': function (d) {
      var p = d.folderPath || '';
      return {
        chapter: 'project', scene: 'origin', cap: 'A folder you already have.',
        eyebrow: 'Existing work',
        h: 'Which folder holds the work?',
        sub: 'Puppet Master reads what is there. It will not move or rename anything.',
        body: '<div class="pmo-field"><label class="pmo-label" for="pmo-folder">Folder</label>' +
              '<input class="pmo-input" id="pmo-folder" data-pmo-input="folderPath" value="' + h(p) +
              '" placeholder="~/Documents/book-club-site" autocomplete="off" spellcheck="false"></div>' +
              (p ? '<div class="pmo-inline"><span class="pmo-inline-k">Found</span>' +
                   '<span class="pmo-inline-v">' + h(p) + '</span>' +
                   '<span class="pmo-ready pmo-inline-act">' + I.check + ' Readable</span></div>' : '') +
              '<p class="pmo-note">Not sure? Choose the folder that contains everything for this one piece of work.</p>',
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !p.trim() }]
      };
    },

    /* ----------------------- online source, with just-in-time sign-in */
    'source-online': function (d) {
      var o = d.online, host = o.host;
      var body = '';
      if (!host) {
        body = '<div class="pmo-choices">' + FLOW.fixtures.onlineHosts.map(function (x) {
          return choice({ act: 'online-host', arg: x.id, on: false, icon: I.cloud, title: x.name, detail: x.detail });
        }).join('') + '</div>';
      } else if (!o.signedIn) {
        body = '<div class="pmo-acct" data-state="signin">' +
            '<span class="pmo-acct-logo">' + h(FLOW.hostName(host).slice(0, 1)) + '</span>' +
            '<span><span class="pmo-acct-n">' + h(FLOW.hostName(host)) + '</span>' +
            '<span class="pmo-acct-d">Puppet Master needs permission to read your work.</span></span>' +
            '<span></span></div>' +
          '<div style="display:flex;gap:9px;margin-top:14px;flex-wrap:wrap">' +
            '<button type="button" class="pmo-btn pmo-btn--primary" data-pmo-act="online-signin">Sign in to ' + h(FLOW.hostName(host)) + '</button>' +
            '<button type="button" class="pmo-btn" data-pmo-act="online-create">Create an account</button>' +
            '<button type="button" class="pmo-btn pmo-btn--ghost" data-pmo-act="online-host" data-arg="">Choose a different service</button>' +
          '</div>' +
          '<p class="pmo-note">This signs you in to ' + h(FLOW.hostName(host)) +
          ' only. It does not set up anything else, and your project is still not created.</p>';
      } else {
        body = '<div class="pmo-acct" data-state="ready">' +
            '<span class="pmo-acct-logo">' + h(FLOW.hostName(host).slice(0, 1)) + '</span>' +
            '<span><span class="pmo-acct-n">' + h(o.account) + '<span class="pmo-acct-plan">' + h(FLOW.hostName(host)) + '</span></span>' +
            '<span class="pmo-acct-d">Signed in</span></span>' +
            '<span class="pmo-ready">' + I.check + ' Ready</span></div>' +
          '<div class="pmo-field" style="margin-top:16px"><label class="pmo-label" for="pmo-repo">Which work should Puppet Master bring in?</label>' +
          '<input class="pmo-input" id="pmo-repo" data-pmo-input="online.repo" value="' + h(o.repo || '') +
          '" placeholder="book-club-site" autocomplete="off" spellcheck="false"></div>';
      }
      return {
        chapter: 'project', scene: 'origin', cap: 'Work kept online.',
        eyebrow: 'Existing work',
        h: host ? (o.signedIn ? 'Choose the work to bring in.' : 'Sign in to ' + FLOW.hostName(host) + '.')
                : 'Where is it stored online?',
        sub: host ? (o.signedIn ? 'Puppet Master will copy it to this computer when you confirm at the end.'
                                : 'Signing in lets Puppet Master see what is there. You can also make a new account now.')
                  : 'These services keep work online so it is safe and can be shared. Pick the one you use.',
        body: body,
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !(host && o.signedIn && (o.repo || '').trim()) }]
      };
    },

    /* ------- another computer or storage device — SSH first, keys automated */
    'source-network': function (d) {
      var n = d.network;
      var protos = '<div class="pmo-choices" style="margin-bottom:16px">' + FLOW.fixtures.networkProtocols.map(function (p) {
        return choice({ act: 'net-proto', arg: p.id, on: n.protocol === p.id, icon: I.network,
                        title: p.name, detail: p.detail, tag: p.recommended && n.protocol === p.id ? 'Default' : null });
      }).join('') + '</div>';

      var found = '';
      if (!n.address) {
        found = '<p class="pmo-label">Found on your network</p><div class="pmo-choices" style="margin-bottom:16px">' +
          FLOW.fixtures.networkDevices.map(function (dev) {
            return choice({ act: 'net-device', arg: dev.id, on: false, icon: I.server, title: dev.name, detail: dev.detail });
          }).join('') + '</div>';
      }

      var conn = '';
      if (n.address) {
        if (n.tested) {
          conn = '<div class="pmo-acct" data-state="ready">' +
              '<span class="pmo-acct-logo">' + I.shield + '</span>' +
              '<span><span class="pmo-acct-n">' + h(n.address) + '</span>' +
              '<span class="pmo-acct-d">Secure key installed — no password needed from now on.</span></span>' +
              '<span class="pmo-ready">' + I.check + ' Connected</span></div>' +
            '<div class="pmo-field" style="margin-top:14px"><label class="pmo-label" for="pmo-netpath">Folder on that device</label>' +
            '<input class="pmo-input" id="pmo-netpath" data-pmo-input="network.path" value="' + h(n.path || '') +
            '" placeholder="/volume1/projects/book-club" autocomplete="off" spellcheck="false"></div>';
        } else {
          conn = '<div class="pmo-field"><label class="pmo-label" for="pmo-netaddr">Address</label>' +
              '<input class="pmo-input" id="pmo-netaddr" data-pmo-input="network.address" value="' + h(n.address) + '" autocomplete="off" spellcheck="false"></div>' +
            '<div class="pmo-field"><label class="pmo-label" for="pmo-netuser">Your name on that device</label>' +
              '<input class="pmo-input" id="pmo-netuser" data-pmo-input="network.user" value="' + h(n.user || '') + '" placeholder="sam" autocomplete="off" spellcheck="false"></div>' +
            '<div class="pmo-field"><label class="pmo-label" for="pmo-netpass">Password</label>' +
              '<input class="pmo-input" id="pmo-netpass" type="password" data-pmo-input="network.password" placeholder="Only needed this once" autocomplete="off"></div>' +
            '<button type="button" class="pmo-btn pmo-btn--primary" data-pmo-act="net-connect"' +
              (n.user ? '' : ' disabled') + '>Connect</button>' +
            '<p class="pmo-note">Enter your password once. Puppet Master makes a secure key, puts it on the device for you, and checks it works — so you will not be asked again.</p>';
        }
      }

      return {
        chapter: 'project', scene: 'workbench', cap: 'Another machine on your network.',
        eyebrow: 'Existing work',
        h: n.tested ? 'Which folder on ' + (n.address || 'that device') + '?' : 'Which device, and how?',
        sub: n.tested ? 'Puppet Master can reach it. Point it at the folder the work lives in.'
                      : 'SSH is the usual choice — it is secure and works with almost any device.',
        body: (n.tested ? '' : protos + found) + conn,
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !(n.tested && (n.path || '').trim()) }]
      };
    },

    /* ------------------------------------------------------- restore */
    restore: function (d) {
      return {
        chapter: 'project', scene: 'vault', cap: 'Everything, as it was.',
        eyebrow: 'Restore',
        h: 'Which project should come back?',
        sub: 'Restoring brings back the files, the plans, and the history exactly as they were saved.',
        body: '<div class="pmo-choices">' +
          choice({ act: 'restore-pick', arg: 'tastebook-backup', on: d.restoreFrom === 'tastebook-backup', icon: I.clock,
                   title: 'Tastebook', detail: 'Backed up 3 days ago · 1.2 GB · from Studio' }) +
          choice({ act: 'restore-pick', arg: 'ledger-backup', on: d.restoreFrom === 'ledger-backup', icon: I.clock,
                   title: 'Ledger', detail: 'Backed up last month · 340 MB · from this computer' }) +
          '</div>',
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !d.restoreFrom }]
      };
    },

    /* -------------------------- 4. the project itself, in one calm screen */
    project: function (d) {
      var loc = d.location || '';
      return {
        chapter: 'project', scene: 'vault', cap: 'Named, placed, protected.',
        eyebrow: 'Step 3',
        h: 'Your project',
        sub: 'Give it a name you will recognise. Everything else here has a sensible default.',
        body: '<div class="pmo-field"><label class="pmo-label" for="pmo-name">What are you making?</label>' +
              '<input class="pmo-input" id="pmo-name" data-pmo-input="name" value="' + h(d.name) +
              '" placeholder="Book club website" autocomplete="off" spellcheck="false"></div>' +
              '<div class="pmo-field"><span class="pmo-label">Where the files will live</span>' +
                '<div class="pmo-inline"><span class="pmo-inline-k">Folder</span>' +
                  '<span class="pmo-inline-v">' + h(loc || 'Choose a name first') + '</span>' +
                  '<button type="button" class="pmo-btn pmo-btn--sm pmo-btn--ghost pmo-inline-act" data-pmo-act="edit-location">Change</button>' +
                '</div></div>' +
              switchRow({ act: 'toggle-history', on: d.history, title: 'Keep a history of every change',
                          detail: 'So you can look back, compare, or undo anything. Strongly recommended.' }) +
              switchRow({ act: 'toggle-onlinecopy', on: d.onlineCopy, title: 'Also keep a copy online',
                          detail: 'A safety copy off this computer, and the way you would share the work with someone else.' }),
        actions: [{ label: 'Continue', act: 'next', primary: true, disabled: !d.name.trim() }]
      };
    },

    /* --------------------------------- 5. start like another project? */
    inherit: function (d) {
      var pv = d.inherit ? FLOW.inheritPreview(d.inherit) : null;
      return {
        chapter: 'project', scene: 'route', cap: 'Reuse what already works.',
        eyebrow: 'Optional',
        h: 'Start like another project?',
        sub: 'Reuse the setup you already trust, or begin fresh. Your new files and plans stay separate either way.',
        body: '<div class="pmo-choices">' +
            choice({ act: 'inherit', arg: '', on: !d.inherit, icon: I.seed,
                     title: 'Start fresh', detail: 'Use Puppet Master’s normal defaults.',
                     tag: !d.inherit ? 'Default' : null }) +
            FLOW.fixtures.projects.map(function (p) {
              return choice({ act: 'inherit', arg: p.id, on: d.inherit === p.id, icon: I.folder,
                              title: 'Like ' + p.name, detail: p.detail });
            }).join('') +
          '</div>' +
          (pv ? '<div class="pmo-inline" style="margin-top:14px;display:block">' +
                  '<p class="pmo-choice-d" style="margin:0 0 8px">' + h(pv.summary) + '</p>' +
                  '<button type="button" class="pmo-btn pmo-btn--sm pmo-btn--ghost" data-pmo-act="inherit-groups">Choose which settings</button>' +
                '</div>' : ''),
        actions: [{ label: 'Continue', act: 'next', primary: true }]
      };
    },

    /* ------------------------------------------------------ 6. review */
    review: function (d) {
      var pf = FLOW.preflight();
      var rows = '';
      rows += reviewRow('Project', '<strong>' + h(d.name || 'Untitled') + '</strong>', 'project');
      rows += reviewRow('Files go to', h(d.location || '—'), 'project');
      rows += reviewRow('Work runs on', d.where === 'this-device' ? 'This computer' : h((d.device && d.device.name) || 'Another device'), 'where');
      rows += reviewRow('Starting from', d.begin === 'new' ? 'A new, empty project'
        : d.begin === 'restore' ? 'A restored backup'
        : d.source === 'online' ? ('Work on ' + h(FLOW.hostName(d.online.host)) + ' (' + h(d.online.repo || '') + ')')
        : d.source === 'network' ? ('Work on ' + h(d.network.address))
        : ('The folder ' + h(d.folderPath || '')), 'begin');
      rows += reviewRow('History', d.history ? 'Kept, so anything can be undone' : 'Not kept', 'project');
      if (d.onlineCopy) rows += reviewRow('Online copy', 'Yes', 'project');
      rows += reviewRow('Settings', d.inherit ? ('Copied from ' + h(FLOW.projectName(d.inherit))) : 'Fresh defaults', 'inherit');

      var willDo = FLOW.commitPhases().map(function (p) { return '<li>' + h(p.label) + '</li>'; }).join('');

      return {
        chapter: 'review', scene: 'route', cap: 'Nothing exists yet.',
        eyebrow: 'Last look',
        h: 'Here is what will happen.',
        sub: 'Nothing has been created so far. Everything below happens when you press the button — and not before.',
        body: '<div class="pmo-review">' + rows + '</div>' +
              '<div class="pmo-inline" style="display:block">' +
                '<p class="pmo-label" style="margin-bottom:6px">When you confirm, Puppet Master will</p>' +
                '<ul class="pmo-choice-d" style="margin:0;padding-left:18px;line-height:1.7">' + willDo + '</ul>' +
              '</div>' +
              (pf.ok ? '' : '<p class="pmo-note" style="color:var(--accent-warning)">' +
                            'Something still needs attention before this can be created.</p>'),
        actions: [{ label: d.begin === 'restore' ? 'Restore project' : d.begin === 'existing' ? 'Add project' : 'Create project',
                    act: 'commit', primary: true, disabled: !pf.ok }]
      };
    },

    /* ------------------------------------------------------ 7. commit */
    commit: function (d) {
      var phases = (commitCtl && commitCtl.phases) || FLOW.commitPhases();
      var st = commitState;
      var list = phases.map(function (p, i) {
        var state = st.failed && st.index === i ? 'failed' : i < st.index ? 'done' : i === st.index ? 'running' : 'idle';
        return '<div class="pmo-phase" data-state="' + state + '" data-phase="' + p.id + '">' +
          '<span class="pmo-phase-dot">' + (state === 'failed' ? I.warn : I.check) + '</span>' +
          '<span>' + h(p.label) + '</span></div>';
      }).join('');

      var done = st.done && !st.failed;
      return {
        chapter: 'review', scene: done ? 'curtain' : 'route',
        cap: done ? 'It exists now.' : st.failed ? 'Stopped, and nothing half-made.' : 'Building it.',
        eyebrow: done ? 'Created' : st.failed ? 'Stopped' : 'Working',
        h: done ? h(d.name) + ' is ready.' : st.failed ? 'That step did not finish.' : 'Setting up ' + h(d.name) + '…',
        sub: done ? 'Your project exists. Next, choose what will power it — you can also stop here and come back.'
           : st.failed ? ((st.failure ? st.failure.reason + ' ' : '') + (st.failure ? st.failure.recovery : 'Nothing was left half-made.'))
           : 'This takes a few seconds. You can watch what is happening below.',
        body: '<div class="pmo-phases">' + list + '</div>' +
              (st.failed ? '<div style="display:flex;gap:9px;margin-top:16px">' +
                  '<button type="button" class="pmo-btn pmo-btn--primary" data-pmo-act="retry-commit">Try that step again</button>' +
                  '<button type="button" class="pmo-btn" data-pmo-act="goto" data-arg="review">Change something first</button>' +
                '</div>' : '') +
              (done && d.receipt ? '<p class="pmo-note">Saved as receipt <span class="pmo-inline-v">' + h(d.receipt.idempotency_key) + '</span>. ' +
                'Running setup again will not create a second copy.</p>' : ''),
        actions: done ? [{ label: 'Choose what powers it', act: 'next', primary: true }] : [],
        noBack: !st.failed
      };
    },

    /* ------------------------------------------------- 8. what powers it */
    power: function (d) {
      var list = providerCache;
      if (!list) {
        return { chapter: 'power', scene: 'constellation', cap: 'Looking around.',
          eyebrow: 'Step 4', h: 'Checking what you already have…',
          sub: 'Puppet Master looks for accounts already set up on this computer, so you do not have to repeat yourself.',
          body: '<div class="pmo-phases"><div class="pmo-phase" data-state="running">' +
                '<span class="pmo-phase-dot">' + I.check + '</span><span>Checking this computer</span></div></div>',
          actions: [] };
      }
      var rows = list.map(function (p) {
        var connected = d.providers.indexOf(p.id) >= 0;
        var right;
        if (connected || p.state === 'ready') right = '<span class="pmo-ready">' + I.check + ' Ready</span>';
        else if (p.state === 'install') right = '<button type="button" class="pmo-btn pmo-btn--sm" data-pmo-act="prov-install" data-arg="' + p.id + '">Install</button>';
        else if (p.state === 'signin') right = '<button type="button" class="pmo-btn pmo-btn--sm" data-pmo-act="prov-signin" data-arg="' + p.id + '">Sign In</button>';
        else right = '<button type="button" class="pmo-btn pmo-btn--sm" data-pmo-act="prov-key" data-arg="' + p.id + '">Enter API Key</button>';
        return '<div class="pmo-acct" data-state="' + (connected || p.state === 'ready' ? 'ready' : p.state) + '">' +
          '<span class="pmo-acct-logo">' + h(p.name.slice(0, 1)) + '</span>' +
          '<span><span class="pmo-acct-n">' + h(p.name) + '<span class="pmo-acct-plan">' + h(p.plan) + '</span></span>' +
          '<span class="pmo-acct-d">' + h(p.note) + '</span></span>' + right + '</div>';
      }).join('');

      var any = d.providers.length > 0 || list.some(function (p) { return p.state === 'ready'; });
      return {
        chapter: 'power', scene: 'constellation', cap: 'Accounts, not plumbing.',
        eyebrow: 'Step 4',
        h: 'Choose what powers Puppet Master.',
        sub: 'Use an AI subscription or account you already have. One is enough to start — you can add more later.',
        body: rows + '<p class="pmo-note">Anything already signed in on this computer is marked Ready automatically. ' +
              'Subscriptions and pay-as-you-go accounts are billed separately, so they are listed separately.</p>',
        actions: [{ label: any ? 'Continue' : 'Skip for now', act: 'next', primary: any }]
      };
    },

    /* ------------------------------------------------- 9. free models */
    free: function (d) {
      return {
        chapter: 'power', scene: 'constellation', cap: 'Free options too.',
        eyebrow: 'Optional',
        h: 'Add free models?',
        sub: 'Free options can handle smaller jobs so your paid plan lasts longer. Availability and limits vary.',
        body: '<div class="pmo-choices">' + FLOW.fixtures.freeModels.map(function (m) {
            return choice({ act: 'free-toggle', arg: m.id, on: d.freeModels, icon: I.spark, title: m.name, detail: m.detail });
          }).join('') + '</div>',
        actions: [{ label: 'Set up free models', act: 'free-accept', primary: true },
                  { label: 'Not now', act: 'next' }]
      };
    },

    /* ------------------------------------------------------ 10. done */
    done: function (d) {
      return {
        chapter: 'done', scene: 'curtain', cap: 'Ready when you are.',
        eyebrow: 'All set',
        h: d.committed ? 'You are ready to go.' : 'Setup is done.',
        sub: d.committed
          ? 'Would you like a quick look around first? It takes a few minutes, uses nothing from your AI plan, and you can stop at any point.'
          : 'You can create a project whenever you like — the button is on the Home screen.',
        body: '<div class="pmo-choices">' +
            choice({ act: 'start-tour', arg: '', icon: I.spark, title: 'Show me around',
                     detail: 'Learn the three things that matter, by doing them. About four minutes.', tag: 'Recommended' }) +
            choice({ act: 'go-wizard', arg: '', icon: I.seed, title: 'Take me to Planning Wizard',
                     detail: 'Skip the tour and start describing what you want to make.' }) +
          '</div>',
        actions: [{ label: 'Close', act: 'finish' }],
        noBack: true
      };
    }
  };

  var commitState = { index: 0, done: false, failed: false, failure: null };

  /* ----------------------------------------------------- flow routing */

  var CHAPTERS = [
    { id: 'start',   name: 'Where' },
    { id: 'project', name: 'Project' },
    { id: 'review',  name: 'Review' },
    { id: 'power',   name: 'Power' },
    { id: 'done',    name: 'Done' }
  ];

  function nextOf(id, d) {
    switch (id) {
      case 'welcome': return 'where';
      case 'where':
        if (d.where === 'this-device') return 'begin';
        return 'pair';
      case 'pair': return 'device-ready';
      case 'device-ready': return 'begin';
      case 'begin':
        if (d.begin === 'existing') return 'source';
        if (d.begin === 'restore') return 'restore';
        return 'project';
      case 'source':
        return d.source === 'online' ? 'source-online'
             : d.source === 'network' ? 'source-network' : 'source-folder';
      case 'source-folder': case 'source-online': case 'source-network': return 'project';
      case 'restore': return 'project';
      case 'project':
        return (d.begin === 'new' && FLOW.fixtures.projects.length) ? 'inherit' : 'review';
      case 'inherit': return 'review';
      case 'review': return 'commit';
      case 'commit': return 'power';
      case 'power': return 'free';
      case 'free': return 'done';
      default: return 'done';
    }
  }

  /* --------------------------------------------------------- rendering */

  function el(sel) { return root ? root.querySelector(sel) : null; }

  function renderRail(chapter) {
    var out = '';
    var idx = CHAPTERS.map(function (c) { return c.id; }).indexOf(chapter);
    for (var i = 0; i < CHAPTERS.length; i++) {
      var state = i < idx ? 'done' : i === idx ? 'current' : 'todo';
      if (i) out += '<span class="pmo-rail-sep"></span>';
      out += '<span class="pmo-rail-item" data-state="' + state + '">' +
        '<span class="pmo-rail-pip"></span><span class="pmo-rail-name">' + CHAPTERS[i].name + '</span></span>';
    }
    slots.rail.innerHTML = out;
  }

  var lastScene = null, outTimer = null, contentOutTimer = null;
  function restart(node) { node.style.animation = 'none'; void node.offsetWidth; node.style.animation = ''; }

  function renderArt(scene, cap) {
    if (scene === lastScene) { slots.platecap.textContent = cap || ''; return; }
    /* The outgoing drawing stays on screen while the new one arrives, so the
       plate cross-dissolves. It must never go empty between two beats. */
    var out = slots['art-out'];
    if (lastScene && out) {
      out.innerHTML = slots.art.innerHTML;
      out.style.display = 'grid';
      restart(out);
      clearTimeout(outTimer);
      outTimer = setTimeout(function () { out.style.display = 'none'; out.innerHTML = ''; }, 500);
    }
    lastScene = scene;
    slots.art.innerHTML = ART.scene(scene, {});
    restart(slots.art);
    slots.platecap.textContent = cap || '';
    root.setAttribute('data-motion', 'scene');
    setTimeout(function () { if (root) root.setAttribute('data-motion', 'idle'); }, 740);
  }

  function render(reason) {
    if (!mounted || !current) return;
    var d = FLOW.draft;
    var build = SCREENS[current];
    if (!build) return;
    var s = build(d);

    root.setAttribute('data-screen', current);
    root.setAttribute('data-phase', s.chapter);
    renderArt(s.scene, s.cap);
    renderRail(s.chapter);

    var parts = [];
    if (s.eyebrow) parts.push('<p class="pmo-eyebrow">' + s.eyebrow + '</p>');
    if (s.h) parts.push('<h2 class="pmo-h" id="pmo-title">' + s.h + '</h2>');
    if (s.sub) parts.push('<p class="pmo-sub">' + s.sub + '</p>');
    if (s.body) parts.push(s.body);
    var staged = parts.map(function (p, i) {
      return p.replace(/^<(\w+)/, '<$1 style="--i:' + i + '"');
    }).join('');
    /* Only a genuine change of beat earns the choreographed entrance. Redrawing
       the same screen (a toggle, a phase, a keystroke) must not replay it. */
    var quiet = paintedScreen === current;
    if (!quiet && paintedScreen !== null && slots['content-out']) {
      var co = slots['content-out'];
      co.innerHTML = slots.content.innerHTML;
      co.scrollTop = slots.content.scrollTop;
      co.style.display = 'flex';
      restart(co);
      clearTimeout(contentOutTimer);
      contentOutTimer = setTimeout(function () { co.style.display = 'none'; co.innerHTML = ''; }, 280);
    }
    slots.content.innerHTML = '<div class="pmo-step"' + (quiet ? ' data-quiet="true"' : '') + '>' + staged + '</div>';
    if (!quiet) slots.content.scrollTop = 0;
    paintedScreen = current;

    slots.actions.innerHTML = (s.actions || []).map(function (a) {
      return '<button type="button" class="pmo-btn' + (a.primary ? ' pmo-btn--primary' : '') + '"' +
        ' data-pmo-act="' + a.act + '"' + (a.arg ? ' data-arg="' + h(a.arg) + '"' : '') +
        (a.disabled ? ' disabled' : '') + '>' + h(a.label) + '</button>';
    }).join('');

    var back = el('.pmo-back');
    if (back) back.hidden = !!s.noBack || history.length === 0;

    /* keep focus predictable without stealing it from a field being typed in */
    if (reason !== 'input') {
      var f = slots.content.querySelector('.pmo-input');
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} }
    }
  }

  function go(id, opts) {
    opts = opts || {};
    if (!SCREENS[id]) return;
    if (current && !opts.replace && current !== id) history.push(current);
    current = id;
    if (FLOW.draft.visited.indexOf(id) < 0) FLOW.draft.visited.push(id);
    FLOW.persist();
    render('go');
  }

  function back() {
    if (!history.length) return;
    current = history.pop();
    render('back');
  }

  /* ------------------------------------------------------- theme swap */

  function applyTheme(family, mode) {
    /* The shell owns the theme; onboarding asks it to change, it does not
       paint over the top. The plate then re-draws in the new language. */
    var applied = false;
    if (window.PM_THEME) {
      try {
        if (typeof PM_THEME.setFamily === 'function') { PM_THEME.setFamily(family); applied = true; }
        if (typeof PM_THEME.setMode === 'function') { PM_THEME.setMode(mode); applied = true; }
      } catch (e) { applied = false; }
    }
    if (!applied) document.documentElement.setAttribute('data-theme', family + '-' + mode);
    root.setAttribute('data-mode', mode);
    /* the plate is a live drawing, so redraw it in the new language */
    lastScene = null;
    if (current) { var s = SCREENS[current](FLOW.draft); renderArt(s.scene, s.cap); }
    renderLooks();
  }

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme') || 'friendly-dark';
    var p = t.split('-');
    return { family: p[0] || 'friendly', mode: p[1] || 'dark' };
  }

  function renderLooks() {
    if (!slots.looks) return;
    var cur = currentTheme();
    slots.looks.innerHTML = ['friendly', 'glass', 'retro', 'basic'].map(function (f) {
      return '<button type="button" class="pmo-look-chip" data-family="' + f + '" data-pmo-act="set-family" data-arg="' + f + '"' +
        ' aria-pressed="' + (cur.family === f ? 'true' : 'false') + '" aria-label="' + f + ' look"><i></i></button>';
    }).join('');
    root.setAttribute('data-mode', cur.mode);
  }

  /* ----------------------------------------------------------- actions */

  /* Advancing a phase only re-labels the dots. Rebuilding the column would
     restart every entrance animation and make the screen flicker. */
  function paintPhases() {
    if (!slots.content) return;
    var nodes = slots.content.querySelectorAll('.pmo-phase');
    for (var i = 0; i < nodes.length; i++) {
      var state = commitState.failed && commitState.index === i ? 'failed'
                : i < commitState.index ? 'done'
                : i === commitState.index ? 'running' : 'idle';
      if (nodes[i].getAttribute('data-state') !== state) nodes[i].setAttribute('data-state', state);
    }
  }

  function runCommit(failAt) {
    commitState = { index: 0, done: false, failed: false, failure: null };
    go('commit');
    commitCtl = FLOW.commit({ fail: failAt }, function (ph, i) {
      commitState.index = i; paintPhases();
    }, function (err) {
      if (err) { commitState.failed = true; commitState.failure = err; }
      else { commitState.done = true; commitState.index = 999; }
      paintPhases();
      /* the outcome is a new beat, so this one does get a full render */
      render('commit-outcome');
    });
  }

  var ACTIONS = {
    next: function () { go(nextOf(current, FLOW.draft)); },
    back: back,
    goto: function (arg) { go(arg); },
    close: function () { close('close'); },
    skip: function () { close('skip'); },
    resume: function () { open('resume'); },
    scrim: function () { /* a click outside must not lose the draft silently */ },

    'set-family': function (arg) { applyTheme(arg, currentTheme().mode); },
    'toggle-mode': function () { var c = currentTheme(); applyTheme(c.family, c.mode === 'dark' ? 'light' : 'dark'); },

    where: function (arg) { FLOW.set({ where: arg }); render(); },
    'pick-device': function (arg) {
      var dev = FLOW.fixtures.devices.filter(function (x) { return x.id === arg; })[0];
      FLOW.set({ device: dev }); render();
    },
    'from-ready': function (arg) {
      if (arg === 'finish') { go('done'); return; }
      FLOW.set({ begin: arg === 'new' ? 'new' : 'existing' });
      go(arg === 'new' ? 'project' : 'source');
    },
    begin: function (arg) { FLOW.set({ begin: arg }); render(); },
    source: function (arg) { FLOW.set({ source: arg }); render(); },
    'restore-pick': function (arg) { FLOW.set({ restoreFrom: arg, name: FLOW.draft.name || (arg.split('-')[0].replace(/^./, function (c) { return c.toUpperCase(); })) }); render(); },

    'online-host': function (arg) {
      var o = FLOW.draft.online; o.host = arg || null; o.signedIn = false; o.account = null;
      FLOW.set({ online: o }); render();
    },
    'online-signin': function () {
      var o = FLOW.draft.online;
      setStatus('Opening ' + FLOW.hostName(o.host) + ' to sign in…');
      setTimeout(function () {
        o.signedIn = true; o.account = 'sam@example.com';
        FLOW.set({ online: o }); setStatus(''); render();
      }, 1100);
    },
    'online-create': function () {
      var o = FLOW.draft.online;
      setStatus('Opening ' + FLOW.hostName(o.host) + ' to make a new account…');
      setTimeout(function () {
        o.signedIn = true; o.creating = true; o.account = 'sam@example.com';
        FLOW.set({ online: o }); setStatus(''); render();
      }, 1400);
    },

    'net-proto': function (arg) { var n = FLOW.draft.network; n.protocol = arg; FLOW.set({ network: n }); render(); },
    'net-device': function (arg) {
      var dev = FLOW.fixtures.networkDevices.filter(function (x) { return x.id === arg; })[0];
      var n = FLOW.draft.network;
      n.device = dev; n.address = dev.detail.split('·').pop().trim(); n.user = dev.suggestedUser;
      FLOW.set({ network: n }); render();
    },
    'net-connect': function () {
      var n = FLOW.draft.network;
      setStatus('Making a secure key for this computer…');
      setTimeout(function () {
        setStatus('Adding it to ' + n.address + '…');
        setTimeout(function () {
          setStatus('Testing the connection…');
          setTimeout(function () {
            n.keyInstalled = true; n.tested = true;
            FLOW.set({ network: n }); setStatus(''); render();
          }, 700);
        }, 700);
      }, 700);
    },

    'edit-location': function () {
      var d = FLOW.draft;
      var v = window.prompt('Where should the files live?', d.location || '');
      if (v !== null && v.trim()) FLOW.set({ location: v.trim(), locationCustom: true });
      render();
    },
    'toggle-history': function () { FLOW.set({ history: !FLOW.draft.history }); render(); },
    'toggle-onlinecopy': function () { FLOW.set({ onlineCopy: !FLOW.draft.onlineCopy }); render(); },
    inherit: function (arg) { FLOW.set({ inherit: arg || null }); render(); },
    'inherit-groups': function () {
      var pv = FLOW.inheritPreview(FLOW.draft.inherit);
      if (pv) setStatus('Settings groups: ' + pv.groups.join(', '));
    },

    commit: function () { runCommit(null); },
    'retry-commit': function () { runCommit(null); },

    'prov-install': function (arg) { providerStep(arg, 'Installing from the official installer…', 'signin'); },
    'prov-signin':  function (arg) { providerStep(arg, 'Opening the sign-in page…', 'ready'); },
    'prov-key':     function (arg) { providerStep(arg, 'Checking that key…', 'ready'); },

    'free-toggle': function () { FLOW.set({ freeModels: !FLOW.draft.freeModels }); render(); },
    'free-accept': function () { FLOW.set({ freeModels: true }); go('done'); },

    'start-tour': function () {
      close('tour');
      setTimeout(function () {
        if (window.PMO_TOUR && window.PMO_TOUR.start) window.PMO_TOUR.start({ source: 'onboarding' });
      }, 460);
    },
    'go-wizard': function () {
      close('wizard');
      setTimeout(function () { if (window.PM_PAGES && PM_PAGES.go) PM_PAGES.go('wizard'); }, 420);
    },
    finish: function () { close('finish'); }
  };

  function providerStep(id, msg, nextState) {
    setStatus(msg);
    setTimeout(function () {
      providerCache = (providerCache || []).map(function (p) {
        if (p.id !== id) return p;
        return { id: p.id, name: p.name, plan: p.plan, binary: p.binary, note: nextState === 'ready' ? 'Ready to use' : p.note, state: nextState };
      });
      if (nextState === 'ready') {
        var ids = FLOW.draft.providers.slice();
        if (ids.indexOf(id) < 0) ids.push(id);
        FLOW.set({ providers: ids });
      }
      setStatus(''); render();
    }, 1000);
  }

  var statusTimer = null;
  function setStatus(msg) {
    var box = el('.pmo-foot-actions');
    var existing = el('.pmo-status-line');
    if (!msg) { if (existing) existing.remove(); return; }
    if (!existing) {
      existing = document.createElement('span');
      existing.className = 'pmo-status-line pmo-choice-d';
      existing.setAttribute('role', 'status');
      existing.style.marginRight = 'auto';
      box.parentNode.insertBefore(existing, box);
    }
    existing.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { if (existing && existing.parentNode) existing.remove(); }, 6000);
  }

  /* ------------------------------------------------------ open / close */

  function open(source) {
    if (!mounted) mount();
    if (!root) return false;
    root.hidden = false;
    void root.offsetWidth;
    root.setAttribute('data-open', 'true');
    document.documentElement.setAttribute('data-pmo-open', 'true');
    var resume = document.getElementById('pm7-onboarding-resume');
    if (resume) resume.hidden = true;
    if (!current) { current = 'welcome'; }
    renderLooks();
    render('open');
    return true;
  }

  function close(reason) {
    if (!root) return false;
    root.setAttribute('data-open', 'false');
    document.documentElement.removeAttribute('data-pmo-open');
    setTimeout(function () { if (root && root.getAttribute('data-open') === 'false') root.hidden = true; }, 460);
    var d = FLOW.draft;
    var unfinished = !d.committed && (d.name || d.visited.length > 2);
    var resume = document.getElementById('pm7-onboarding-resume');
    if (resume) resume.hidden = !(unfinished && reason !== 'finish');
    return true;
  }

  function replay(opts) {
    FLOW.reset();
    history = []; current = 'welcome'; providerCache = null;
    commitState = { index: 0, done: false, failed: false, failure: null };
    return open((opts && opts.source_surface) || 'replay');
  }

  /* ------------------------------------------------------------ mount */

  function onClick(e) {
    var t = e.target.closest ? e.target.closest('[data-pmo-act]') : null;
    if (!t || !root.contains(t)) return;
    var act = t.getAttribute('data-pmo-act');
    if (t.disabled) return;
    var fn = ACTIONS[act];
    if (fn) { e.preventDefault(); fn(t.getAttribute('data-arg') || ''); }
  }

  function onInput(e) {
    var t = e.target;
    var key = t.getAttribute && t.getAttribute('data-pmo-input');
    if (!key) return;
    var d = FLOW.draft;
    if (key.indexOf('.') > 0) {
      var parts = key.split('.'), obj = d[parts[0]];
      obj[parts[1]] = t.value;
      var patch = {}; patch[parts[0]] = obj; FLOW.set(patch);
    } else {
      var p2 = {}; p2[key] = t.value; FLOW.set(p2);
    }
    /* re-evaluate the primary action without rebuilding the field under the cursor */
    var s = SCREENS[current](FLOW.draft);
    var btn = slots.actions.querySelector('.pmo-btn--primary');
    if (btn && s.actions && s.actions[0]) btn.disabled = !!s.actions[0].disabled;
    /* the location preview follows the name live */
    var locEl = slots.content.querySelector('.pmo-inline-v');
    if (locEl && current === 'project') locEl.textContent = d.location || 'Choose a name first';
  }

  function onKey(e) {
    if (!root || root.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close('escape'); }
  }

  function mount() {
    root = document.getElementById('pmo');
    if (!root) return false;
    slots.content = root.querySelector('[data-pmo-slot="content"]');
    slots.actions = root.querySelector('[data-pmo-slot="actions"]');
    slots.rail    = root.querySelector('[data-pmo-slot="rail"]');
    slots.art     = root.querySelector('[data-pmo-slot="art"]');
    slots['art-out'] = root.querySelector('[data-pmo-slot="art-out"]');
    slots.platecap = root.querySelector('[data-pmo-slot="platecap"]');
    slots.looks   = root.querySelector('[data-pmo-slot="looks"]');
    slots['content-out'] = root.querySelector('[data-pmo-slot="content-out"]');
    if (!slots.content) return false;
    document.addEventListener('click', onClick, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKey, true);
    var resume = document.getElementById('pm7-onboarding-resume');
    if (resume) resume.addEventListener('click', function () { open('resume'); });
    /* provider discovery is bounded and only runs when that phase is reached */
    FLOW.subscribe(function (d, reason) {
      if (reason === 'commit' && !providerCache) FLOW.detectProviders(function (list) { providerCache = list; render('providers'); });
    });
    mounted = true;
    if (FLOW.restore() && FLOW.draft.visited.length) {
      var last = FLOW.draft.visited[FLOW.draft.visited.length - 1];
      if (SCREENS[last]) current = last;
      if (!FLOW.draft.committed && FLOW.draft.name && resume) resume.hidden = false;
    }
    return true;
  }

  function boot() {
    if (mount()) return;
    var mo = new MutationObserver(function () { if (mount()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  /* ---------------------------------------------------------- exports */

  window.PMO_ONBOARDING = {
    schema_id: 'pmo.onboarding.controller.v1',
    concept_simulation_only: true,
    open: open, close: close, replay: replay, go: go, back: back,
    get screen() { return current; },
    get draft() { return FLOW.draft; },
    screens: Object.keys(SCREENS),
    applyTheme: applyTheme,
    _render: render
  };

  /* Back-compat: the shell's Home menu and Settings still call these. */
  window.PM7_ONBOARDING_CINEMATIC = {
    schema_id: 'pmo.onboarding.compat.v1',
    replay: function (o) { return replay(o); },
    start: function (o) { return open((o && o.source) || 'compat'); },
    close: function () { return close('compat'); }
  };
})();
