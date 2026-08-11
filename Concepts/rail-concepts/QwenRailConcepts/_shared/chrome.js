/* rail-concepts/_shared/chrome.js
   Shared app shell for every rail concept page:
   - glass background stage (single-blur composition demo, F3-427)
   - title bar: monogram, project sprout menu, page tabs, search, THEME sprout
     menu (the canonical PM menu that replaces native selects)
   - activity bar (F3-042 inventory + group order), collapsible 72/36px
   - side panel slot + drag resizer (width canon: 240px min, 480px max)
   - simplified HOME backdrop ("the rest of the app, simplified")
   - status bar with the fit-check harness: MIN 240 / DEFAULT 280 / MAX 480
     presets, continuous slider (min 220 = adversarial test-only width),
     live px readout, reduced-motion toggle
   - FILE MANAGER panel (unchanged surface, shared by all concepts) with its
     context menu reskinned to the PM sprout family (F3-242: Slint has no
     built-in context menu)
   Panels for the 7 redesigned occupants come from each concept page's
   <template id="rail-panels">. */
(function () {
  'use strict';
  var I = window.PMIcon;
  var MIN_W = 240, DEF_W = 280;

  var THEMES = [
    ['friendly-dark', 'Friendly Dark'], ['friendly-light', 'Friendly Light'],
    ['glass-dark', 'Glass Dark'], ['glass-light', 'Glass Light'],
    ['retro-dark', 'Retro Dark'], ['retro-light', 'Retro Light'],
    ['basic-dark', 'Basic Dark'], ['basic-light', 'Basic Light']
  ];
  var PROJECTS = [
    ['tastebook', 'tastebook', 'SvelteKit + Axum + Postgres'],
    ['harbor', 'harbor', 'Next.js + Nest'],
    ['loom', 'loom', 'Rust + Slint']
  ];
  var AB = [
    { id: 'chat', icon: 'chat', label: 'CHAT', group: null },
    { id: 'dashboard', icon: 'home', label: 'HOME', group: null },
    { id: 'files', icon: 'files', label: 'FILES', group: null, target: 'panel-files' },
    { id: 'search', icon: 'search', label: 'SEARCH', group: 'Project', target: 'panel-search' },
    { id: 'source', icon: 'source', label: 'SOURCE', group: 'Project', target: 'panel-source' },
    { id: 'gh-actions', icon: 'actions', label: 'ACTIONS', group: 'Automation', target: 'panel-git' },
    { id: 'docker', icon: 'docker', label: 'DOCKER', group: 'Automation', target: 'panel-docker' },
    { id: 'testing', icon: 'tests', label: 'TESTS', group: 'Automation', target: 'panel-testing' },
    { id: 'agents', icon: 'agents', label: 'AGENTS', group: 'Communication', target: 'panel-agents' },
    { id: 'artifacts', icon: 'artifacts', label: 'ARTIFACTS', group: 'System', target: 'panel-artifacts' }
  ];

  /* ------------------------------------------------------------------ */
  /* toasts (F3-447: staged under the title bar, <=5, 3.4s TTL)          */
  var toastStack;
  function toast(msg) {
    if (!toastStack) return;
    var t = document.createElement('div');
    t.className = 'rail-toast';
    t.textContent = msg;
    toastStack.appendChild(t);
    while (toastStack.children.length > 5) toastStack.firstChild.remove();
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () {
      t.classList.remove('in');
      setTimeout(function () { t.remove(); }, 360);
    }, 3400);
  }

  /* demo-action shim: every interactive element maps to a command toast */
  function wireDemoActions(root) {
    root.querySelectorAll('[data-demo-action]').forEach(function (el) {
      if (el._demoWired) return;
      el._demoWired = true;
      el.addEventListener('click', function (ev) {
        if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
          var reason = el.getAttribute('data-demo-reason') || 'blocked';
          toast('Blocked: ' + reason + (el.getAttribute('data-demo-arg') ? ' — ' + el.getAttribute('data-demo-arg') : ''));
          ev.preventDefault();
          return;
        }
        var arg = el.getAttribute('data-demo-arg') || el.getAttribute('data-demo-action');
        toast(arg);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* FILE MANAGER (shared, not redesigned — demonstrates the reskinned   */
  /* PM context menu replacing the OS-style right-click menu)            */
  function filesPanelHTML() {
    var ctxItems = [
      ['New File', 'cmd.file.new_file -> prompting name...'],
      ['New Folder', 'cmd.file.new_folder -> prompting name...'],
      '-',
      ['Rename', 'cmd.file.rename -> prompting new name...'],
      ['Delete', 'cmd.file.delete -> confirm deletion?'],
      '-',
      ['Copy Full Path', 'cmd.file.copy_full_path -> ~/projects/tastebook/src/routes/recipes.rs'],
      ['Copy Relative Path', 'cmd.file.copy_relative_path -> src/routes/recipes.rs'],
      '-',
      ['Add to Chat', 'cmd.chat.attach_file -> src/routes/recipes.rs'],
      ['Open in Terminal', 'cmd.terminal.show -> opening at src/'],
      '-',
      ['Open Preview', 'cmd.file.open_with -> workspace_preview'],
      ['Open Diff Review', 'cmd.file.open_with -> diff_review'],
      ['Save Local Copy', 'cmd.file.save_local_copy -> ~/Downloads/']
    ];
    var menu = '<div class="pm6-tb-menu pm-ctx-menu" id="fileContextMenu" role="menu" aria-label="File actions">' +
      ctxItems.map(function (it) {
        return it === '-' ? '<div class="pm6-tb-menu-sep" role="separator"></div>'
          : '<button type="button" class="pm6-tb-menu-item" role="menuitem" data-demo-action="demo.toast" data-demo-arg="' + it[1] + '">' + it[0] + '</button>';
      }).join('') + '</div>';

    var tree = [
      ['folder', 'src/'],
      ['file', 'main.rs', 'pm6-ind1'],
      ['folder', 'routes/', 'pm6-ind1'],
      ['file', 'recipes.rs', 'pm6-ind2', 'M', 'staged'],
      ['file', 'auth.rs', 'pm6-ind2'],
      ['folder', 'services/', 'pm6-ind1'],
      ['file', 'image.rs', 'pm6-ind2', 'M', 'mod'],
      ['folder', 'migrations/'],
      ['file', '0001_init.sql', 'pm6-ind1'],
      ['folder', 'web/src/'],
      ['file', '+page.svelte', 'pm6-ind1'],
      ['file', 'RecipeCard.svelte', 'pm6-ind1', 'A', 'staged'],
      ['file', 'Cargo.toml'],
      ['file', 'docker-compose.yml'],
      ['file', 'README.md']
    ];
    var rows = tree.map(function (r) {
      if (r[0] === 'folder') {
        return '<div class="pm-fm-folder">' + I('chevD', 'pm-fm-chev') + I('folderOpen', 'pm-fm-fico') + '<span>' + r[1] + '</span></div>';
      }
      var badge = r[3] ? '<span class="pm-gs pm-gs-' + r[4] + '">' + r[3] + '</span>' : '';
      return '<div class="pm-fm-file ' + (r[2] || '') + '" data-demo-action="files.open" data-demo-arg="' + r[1] + '">' +
        I('file', 'pm-fm-fico') + '<span>' + r[1] + '</span>' + badge + '</div>';
    }).join('');

    return '<div class="side-panel-view pm-files-panel" id="panel-files">' +
      '<div class="pm-panel-head"><span class="pm-panel-title">FILE MANAGER</span>' + I('files', 'pm-panel-ico') + '</div>' +
      '<div class="pm-files-crumb"><button type="button" class="pm6-tb-menu-trigger pm-crumb-btn" aria-controls="wtRootMenu">' +
      I('branch', 'pm-crumb-ico') + '<span class="pm6-tb-menu-label">main</span>' + I('chevD', 'pm-crumb-chev') + '</button>' +
      '<span class="pm-crumb-sep">/</span><span class="pm-crumb-static">tastebook</span>' +
      '<div class="pm6-tb-menu" id="wtRootMenu" role="menu" aria-label="Worktree root" data-pm-menu-select>' +
      '<button type="button" class="pm6-tb-menu-item is-selected" role="menuitem" data-value="main" data-demo-action="demo.toast" data-demo-arg="Worktree root stays on main in this demo">main <span class="pm6-tb-menu-meta">workspace</span></button>' +
      '<button type="button" class="pm6-tb-menu-item" role="menuitem" data-value="lane-b" data-demo-action="demo.toast" data-demo-arg="Root switch: orch/lane-b-api (.worktrees/lane-b-api)">orch/lane-b-api <span class="pm6-tb-menu-meta">Orch: lane-b API</span></button>' +
      '<button type="button" class="pm6-tb-menu-item" role="menuitem" data-value="import" data-demo-action="demo.toast" data-demo-arg="Root switch: thread/import-fixes (.worktrees/import-fixes)">thread/import-fixes <span class="pm6-tb-menu-meta">Thread</span></button>' +
      '</div></div>' +
      '<div class="pm-files-filter">' + I('search', 'pm-input-ico') + '<input type="text" placeholder="Filter files..." aria-label="Filter files"></div>' +
      '<div class="pm-scroll rail-scroll pm-files-body">' +
      '<div class="pm-card"><div class="pm-card-head">WORKSPACE <span class="pm-card-meta">18 files</span></div>' +
      '<div class="pm-fm-tree" id="pmFmTree">' + rows + '</div></div>' +
      '<div class="pm-footnote">Watching 18 files · .gitignore respected · opens land in the editor</div>' +
      '</div>' + menu + '</div>';
  }

  function wireFilesContext(panel) {
    var tree = panel.querySelector('#pmFmTree');
    var menu = panel.querySelector('#fileContextMenu');
    if (!tree || !menu) return;
    tree.addEventListener('contextmenu', function (ev) {
      ev.preventDefault();
      window.PMMenu.openAt(menu, ev.clientX, ev.clientY);
    });
    menu.addEventListener('click', function () { /* items toast via demo shim */ });
  }

  /* ------------------------------------------------------------------ */
  /* simplified HOME backdrop                                            */
  function homeGhostHTML() {
    return '<div class="home-ghost" id="homeGhost">' +
      '<div class="hg-head"><span class="hg-title">HOME</span><span class="hg-sub">tastebook · run #47 in progress</span></div>' +
      '<div class="hg-metrics">' +
      '<div class="hg-card"><span class="hg-k">LANES</span><span class="hg-v">2<span class="hg-u"> active</span></span><i class="hg-bar" style="--w:66%"></i></div>' +
      '<div class="hg-card"><span class="hg-k">TESTS</span><span class="hg-v">214<span class="hg-u"> passed</span></span><i class="hg-bar ok" style="--w:92%"></i></div>' +
      '<div class="hg-card"><span class="hg-k">DOCKER</span><span class="hg-v">3<span class="hg-u"> running</span></span><i class="hg-bar" style="--w:60%"></i></div>' +
      '<div class="hg-card"><span class="hg-k">ACTIONS</span><span class="hg-v">1<span class="hg-u"> failed</span></span><i class="hg-bar err" style="--w:33%"></i></div>' +
      '</div>' +
      '<div class="hg-editor"><div class="hg-etabs"><i></i><i></i><i class="on"></i></div>' +
      '<div class="hg-lines">' + Array.from({ length: 14 }, function (_, i) { return '<i style="--w:' + (28 + ((i * 37) % 58)) + '%"></i>'; }).join('') + '</div></div>' +
      '<div class="hg-note">Simplified home backdrop — the rail is the subject of these concepts.</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  function titleBarHTML() {
    var projItems = PROJECTS.map(function (p, i) {
      return '<button type="button" class="pm6-tb-menu-item' + (i === 0 ? ' is-selected' : '') + '" role="menuitem" data-value="' + p[0] + '" data-label="' + p[1] + '" data-demo-action="demo.toast" data-demo-arg="Active project: ' + p[1] + ' (' + p[2] + ')">' + p[1] + '</button>';
    }).join('');
    var themeItems = THEMES.map(function (t, i) {
      return '<button type="button" class="pm6-tb-menu-item' + (i === 0 ? ' is-selected' : '') + '" role="menuitem" data-value="' + t[0] + '" data-label="' + t[1] + '">' + t[1] + '</button>';
    }).join('');
    var tabs = ['Home', 'Projects', 'Planning Wizard', 'Orchestrator', 'Usage', 'Settings'].map(function (t, i) {
      return '<span class="tb-page-tab' + (i === 0 ? ' active' : '') + '" role="tab" tabindex="0" data-demo-action="demo.toast" data-demo-arg="Page: ' + t + ' (simplified in these concepts)">' + t + '</span>';
    }).join('');

    return '<header class="title-bar">' +
      '<div class="tb-brand">' + I('pm', 'tb-logo') + '<span class="tb-appname">PUPPET MASTER</span></div>' +
      '<div class="pm6-tb-menu-wrap" id="projectMenuWrap"><button type="button" class="pm6-tb-menu-trigger tb-project-btn" aria-controls="projectMenu">' +
      I('files', 'tb-proj-ico') + '<span class="pm6-tb-menu-label">tastebook</span>' + I('chevD', 'tb-chev') + '</button>' +
      '<div class="pm6-tb-menu pm6-tb-menu-left" id="projectMenu" role="menu" aria-label="Project" data-pm-menu-select>' + projItems + '</div></div>' +
      '<nav class="tb-pages" aria-label="Pages">' + tabs + '</nav>' +
      '<div class="tb-search">' + I('search', 'tb-search-ico') + '<input type="text" placeholder="Search files, commands, settings..." aria-label="Global search"></div>' +
      '<div class="pm6-tb-menu-wrap" id="themeMenuWrap"><button type="button" class="pm6-tb-menu-trigger tb-theme-btn" aria-controls="themeMenu" title="Theme">' +
      '<span class="pm6-tb-menu-label" id="themeMenuLabel">Friendly Dark</span>' + I('chevD', 'tb-chev') + I('spark', 'tb-theme-ico') + '</button>' +
      '<div class="pm6-tb-menu" id="themeMenu" role="menu" aria-label="Theme" data-pm-menu-select>' + themeItems + '</div></div>' +
      '</header>';
  }

  function activityBarHTML() {
    var html = '';
    AB.forEach(function (it) {
      if (it.group) html += '<div class="ab-sep" role="separator" aria-label="' + it.group + '" title="' + it.group + '"></div>';
      html += '<div class="ab-icon' + (it.id === 'files' ? ' active' : '') + '" title="' + it.label.charAt(0) + it.label.slice(1).toLowerCase() + '" data-ab-id="' + it.id + '"' +
        (it.target ? ' data-target="' + it.target + '"' : '') + ' role="button" tabindex="0" aria-label="' + it.label + '">' +
        '<span class="ab-sym">' + I(it.icon) + '</span><span class="ab-label">' + it.label + '</span></div>';
    });
    return '<nav class="activity-bar" id="activityBar" aria-label="Activity bar">' + html +
      '<div class="ab-spacer"></div>' +
      '<div class="ab-icon ab-toggle" id="abToggle" title="Collapse" role="button" tabindex="0" aria-label="Collapse activity bar">' + I('chevR', 'ab-tgl-ico') + '</div></nav>';
  }

  function statusBarHTML() {
    return '<footer class="status-bar">' +
      '<div class="sb-chips">' +
      '<span class="sb-chip">' + I('branch', 'sb-ico') + 'main</span>' +
      '<span class="sb-chip" title="0 incoming · 2 outgoing">' + I('push', 'sb-ico') + '0<i class="sb-dotsep"></i>2</span>' +
      '<span class="sb-chip ok">' + I('search', 'sb-ico') + 'index ready</span>' +
      '<span class="sb-chip dim">' + I('docker', 'sb-ico') + '3 running</span>' +
      '</div>' +
      '<div class="sb-harness" aria-label="Panel width fit-check harness">' +
      '<span class="sb-hlabel">PANEL FIT</span>' +
      '<button type="button" class="sb-preset" data-w="min" title="240px spec floor; 220 remains a test-only adversarial width via the slider">MIN 240</button>' +
      '<button type="button" class="sb-preset" data-w="def">DEFAULT 280</button>' +
      '<button type="button" class="sb-preset" data-w="max" title="480px spec ceiling">MAX 480</button>' +
      '<input type="range" id="sbWidth" min="220" max="900" value="280" step="1" aria-label="Panel width">' +
      '<span class="sb-wread" id="sbWRead">280px</span>' +
      '<span class="sb-vsep"></span>' +
      '<button type="button" class="sb-rm" id="sbRM" title="Toggle reduced motion" aria-pressed="false">' + I('motion', 'sb-ico') + 'MOTION</button>' +
      '</div></footer>';
  }

  /* ------------------------------------------------------------------ */
  function boot(opts) {
    opts = opts || {};
    var app = document.getElementById('app');
    var panelsTpl = document.getElementById('rail-panels');
    var panelHTML = panelsTpl ? panelsTpl.innerHTML : '';

    app.innerHTML =
      '<div id="glassBg" class="glass-bg" aria-hidden="true"><i class="gb-a"></i><i class="gb-b"></i><i class="gb-c"></i></div>' +
      '<div class="app-shell">' +
      titleBarHTML() +
      '<div class="toast-stack" id="toastStack"></div>' +
      '<div class="main-area">' +
      '<div class="left-panel">' + activityBarHTML() +
      '<aside class="side-panel-slot rail-scroll" id="sidePanelSlot">' + filesPanelHTML() + panelHTML + '</aside>' +
      '<div class="resizer-col" id="leftResizer" title="Drag to resize · double-click to reset"></div>' +
      '</div>' +
      '<div class="center-column">' + homeGhostHTML() + '</div>' +
      '</div>' +
      statusBarHTML() +
      '</div>' +
      (opts.badge ? '<div class="concept-badge"><span class="cb-id">' + opts.badge.id + '</span><span class="cb-name">' + opts.badge.name + '</span><a class="cb-home" href="index.html">all concepts</a></div>' : '');

    toastStack = document.getElementById('toastStack');

    /* theme menu wiring */
    var themeWrap = document.getElementById('themeMenuWrap');
    themeWrap.addEventListener('pm-menu-pick', function (ev) {
      var v = ev.detail.value;
      if (!v) return;
      document.documentElement.setAttribute('data-theme', v);
      document.documentElement.style.colorScheme = /-dark$/.test(v) ? 'dark' : 'light';
      try { localStorage.setItem('pm.theme', v); } catch (e) {}
    });
    document.getElementById('themeMenu').addEventListener('pm-menu-pick', function (ev) {
      if (ev.detail.value) document.getElementById('themeMenuLabel').textContent = THEMES.filter(function (t) { return t[0] === ev.detail.value; })[0][1];
    });

    /* panel switching */
    var slot = document.getElementById('sidePanelSlot');
    var homeWide = false;
    function showPanel(targetId) {
      slot.classList.remove('hidden');
      homeWide = false;
      slot.querySelectorAll('.side-panel-view').forEach(function (v) {
        var on = v.id === targetId;
        var was = v.classList.contains('active');
        v.classList.toggle('active', on);
        v.classList.remove('pm-panel-enter');
        if (on && !was) {
          void v.offsetWidth;
          v.classList.add('pm-panel-enter');
          var clear = function () { v.classList.remove('pm-panel-enter'); v.removeEventListener('animationend', clear); };
          v.addEventListener('animationend', clear);
        }
      });
      document.querySelectorAll('.ab-icon').forEach(function (ic) {
        ic.classList.toggle('active', ic.getAttribute('data-target') === targetId);
      });
      document.getElementById('homeGhost').classList.remove('wide');
      requestAnimationFrame(function () { if (typeof window.PMPillFit === 'function') window.PMPillFit(); });
    }
    document.querySelectorAll('.ab-icon[data-ab-id]').forEach(function (ic) {
      ic.addEventListener('click', function () {
        var id = ic.getAttribute('data-ab-id');
        if (id === 'chat') { toast('Chat opens as a docked/floating panel in the full app — out of scope for rail concepts.'); return; }
        if (id === 'dashboard') {
          homeWide = !homeWide;
          if (homeWide) {
            slot.classList.add('hidden');
            document.getElementById('homeGhost').classList.add('wide');
            document.querySelectorAll('.ab-icon').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-ab-id') === 'dashboard'); });
          } else { showPanel('panel-files'); }
          return;
        }
        showPanel(ic.getAttribute('data-target'));
      });
      ic.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ic.click(); } });
    });
    /* Ctrl+1..8 jumps activity-bar items (F3-786) */
    document.addEventListener('keydown', function (ev) {
      if (!ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 8) {
        var icons = Array.prototype.slice.call(document.querySelectorAll('.ab-icon[data-ab-id]'));
        if (icons[n - 1]) { ev.preventDefault(); icons[n - 1].click(); }
      }
    });

    /* activity bar collapse */
    var ab = document.getElementById('activityBar');
    document.getElementById('abToggle').addEventListener('click', function () {
      ab.classList.toggle('collapsed');
      var c = ab.classList.contains('collapsed');
      document.querySelector('#abToggle .ab-tgl-ico').style.transform = c ? 'rotate(180deg)' : '';
      this.title = c ? 'Expand' : 'Collapse';
    });

    /* width harness */
    var slider = document.getElementById('sbWidth');
    var read = document.getElementById('sbWRead');
    function maxW() { return Math.min(480, Math.floor(window.innerWidth * 0.5)); }
    function remeasureOpenAccordions() {
      /* Abrupt width jumps (MAX→MIN presets) leave spring grid tracks stale
         while content wraps taller — force a remeasure so action buttons stay visible. */
      slot.querySelectorAll('[data-acc].open').forEach(function (acc) {
        var body = acc.querySelector(':scope > .sh-accb, :scope > .sh-wt-b, :scope > .cr-acc-b');
        if (!body) return;
        var inner = body.querySelector(':scope > .pm-acc-inner') || body;
        void inner.offsetHeight;
        var h = inner.scrollHeight;
        body.style.gridTemplateRows = h + 'px';
        requestAnimationFrame(function () {
          body.style.gridTemplateRows = '';
        });
      });
    }
    function setW(px, fromSlider, opts) {
      /* spec floor is MIN_W (240); the slider alone may go to 220 as an
         adversarial fit-test width, so it bypasses the floor (not the CSS
         min-width — that is overridden inline only while below the floor) */
      opts = opts || {};
      px = Math.max(fromSlider ? 220 : MIN_W, Math.min(px, maxW()));
      slot.style.width = px + 'px';
      slot.style.minWidth = px < MIN_W ? px + 'px' : '';
      /* Layout chrome tiers only (padding / icon-only generic tabs). Pill
         *labels* shorten via measure (PMPillFit), not these cutoffs. */
      slot.setAttribute('data-wtier', px < 250 ? 'min' : (px <= 400 ? 'mid' : 'wide'));
      read.textContent = px + 'px';
      slider.max = maxW();
      if (!fromSlider) slider.value = px;
      document.querySelectorAll('.sb-preset').forEach(function (b) {
        var v = b.getAttribute('data-w');
        var target = v === 'min' ? MIN_W : v === 'def' ? DEF_W : maxW();
        b.classList.toggle('on', Math.abs(px - target) < 3);
      });
      requestAnimationFrame(function () {
        /* Only remount open accordion tracks on abrupt jumps (presets /
           window resize end). Continuous slider/drag must not pulse
           gridTemplateRows px → '' every frame. */
        if (opts.remeasureAcc) remeasureOpenAccordions();
        if (typeof window.PMPillFit === 'function') window.PMPillFit();
      });
    }
    slider.addEventListener('input', function () { setW(parseInt(slider.value, 10), true); });
    document.querySelectorAll('.sb-preset').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-w');
        setW(v === 'min' ? MIN_W : v === 'def' ? DEF_W : maxW(), false, { remeasureAcc: true });
      });
    });
    window.addEventListener('resize', function () {
      setW(slot.getBoundingClientRect().width, false, { remeasureAcc: true });
    });

    /* drag resizer */
    var resizer = document.getElementById('leftResizer');
    var dragging = false;
    resizer.addEventListener('mousedown', function (ev) {
      dragging = true;
      document.body.style.cursor = 'col-resize';
      slot.classList.add('noanim');
      ev.preventDefault();
    });
    document.addEventListener('mousemove', function (ev) {
      if (!dragging) return;
      var left = document.querySelector('.left-panel').getBoundingClientRect().left;
      var abW = ab.getBoundingClientRect().width;
      setW(ev.clientX - left - abW, true);
    });
    document.addEventListener('mouseup', function () {
      if (dragging) {
        dragging = false;
        document.body.style.cursor = '';
        slot.classList.remove('noanim');
        remeasureOpenAccordions();
      }
    });
    resizer.addEventListener('dblclick', function () { setW(DEF_W, false, { remeasureAcc: true }); });

    /* reduced motion */
    document.getElementById('sbRM').addEventListener('click', function () {
      var on = document.documentElement.getAttribute('data-reduced-motion') === '1';
      document.documentElement.setAttribute('data-reduced-motion', on ? '0' : '1');
      this.setAttribute('aria-pressed', String(!on));
      this.classList.toggle('on', !on);
      toast(on ? 'Motion restored' : 'Reduced motion on — sprouts become instant');
    });

    /* hydrate <i data-ico="name" class="..."> placeholders in panel markup.
       Do NOT copy host classes onto the nested <svg> — behavioral classes
       like .sh-accchev / .fm-chevron carry transform:rotate on open, and
       applying them to both <i> and <svg> stacks to 180deg (points left). */
    document.querySelectorAll('i[data-ico]').forEach(function (el) {
      el.innerHTML = window.PMIcon(el.getAttribute('data-ico'));
    });

    /* generic accordion: [data-collapse] toggles .open on closest [data-acc].
       Headers are keyboard-operable (Enter/Space) and expose aria-expanded —
       Slint mapping: TouchArea + FocusScope delegate with accessible-role
       button and accessible-expanded bound to the row's open property. */
    function accToggle(head) {
      var acc = head.closest('[data-acc]');
      if (!acc) return;
      var open = acc.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
      requestAnimationFrame(function () { if (typeof window.PMPillFit === 'function') window.PMPillFit(acc); });
    }
    document.querySelectorAll('[data-collapse]').forEach(function (head) {
      var acc = head.closest('[data-acc]');
      if (!acc) return;
      if (!head.hasAttribute('tabindex')) head.setAttribute('tabindex', '0');
      if (!head.hasAttribute('role')) head.setAttribute('role', 'button');
      head.setAttribute('aria-expanded', String(acc.classList.contains('open')));
    });
    document.addEventListener('click', function (ev) {
      var head = ev.target.closest('[data-collapse]');
      if (head && !ev.target.closest('button, a, .pm6-tb-menu-trigger, .pm-minibtn')) accToggle(head);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var head = ev.target && ev.target.closest ? ev.target.closest('[data-collapse]') : null;
      if (head && !ev.target.closest('button, a, input, .pm6-tb-menu-trigger, .pm-minibtn')) { ev.preventDefault(); accToggle(head); }
    });

    /* generic subview tabber: [data-tab="x"] toggles [data-pane="x"] within
       the closest .side-panel-view (docker subviews etc.); keeps
       aria-selected / aria-hidden in sync with the class state. */
    document.querySelectorAll('.side-panel-view [role="tab"][data-tab]').forEach(function (t) {
      t.setAttribute('aria-selected', String(t.classList.contains('active')));
    });
    document.querySelectorAll('.side-panel-view [data-pane]').forEach(function (p) {
      if (!p.hasAttribute('role')) p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-hidden', String(p.classList.contains('pm-hidden')));
    });
    document.addEventListener('click', function (ev) {
      var tab = ev.target.closest('[data-tab]');
      if (!tab) return;
      var panel = tab.closest('.side-panel-view');
      if (!panel) return;
      var name = tab.getAttribute('data-tab');
      panel.querySelectorAll('[data-tab]').forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('active', on);
        if (t.getAttribute('role') === 'tab') t.setAttribute('aria-selected', String(on));
      });
      panel.querySelectorAll('[data-pane]').forEach(function (p) {
        var hide = p.getAttribute('data-pane') !== name;
        p.classList.toggle('pm-hidden', hide);
        p.setAttribute('aria-hidden', String(hide));
      });
    });

    window.PMMenu.init();
    wireDemoActions(document);
    wireFilesContext(document.getElementById('panel-files'));

    setW(DEF_W);
    showPanel('panel-files');
    window.PMRail = { toast: toast, setW: setW, showPanel: showPanel, wireDemoActions: wireDemoActions };

    /* ---- motion layer: spring accordions + scroll-reveal (reduced-motion safe) ---- */
    (function motionLayer() {
      var ACC_BODY_SEL = '.cr-acc-b,.sh-wt-b,.sh-accb,.sr-wt-b,.st-wt-b,.bA-accb,.bB-accb,.dA-accb,.dB-accb,.aA-accb,.aB-accb';
      document.querySelectorAll('[data-acc]').forEach(function (acc) {
        var body = acc.lastElementChild;
        if (body && body.matches && body.matches(ACC_BODY_SEL) && !body.querySelector(':scope > .pm-acc-inner')) {
          var inner = document.createElement('div');
          inner.className = 'pm-acc-inner';
          while (body.firstChild) inner.appendChild(body.firstChild);
          body.appendChild(inner);
        }
      });
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.getAttribute('data-reduced-motion') === '1';
      if (reduce) return;
      var REVEAL = '.cr-row,.cr-card,.cr-receipt,.cr-commit,.cr-file,.cr-hit,.cr-g,.cr-meter,' +
        '.sh-row,.sh-card,.sh-shelf,.sh-commit,.sh-file,.sh-hit,.sh-wt,' +
        '.st-row,.st-art,.st-file,.st-hit,.st-wt,.st-commit,.st-pane .pm-chiprow,' +
        '.pt-entry,.ad-card,.ad-row,.ad-okcard,.ad-hero,.ad-queue,' +
        '.sr-row,.sr-wt,.sr-hit,.sr-file,' +
        '.pm-fm-file,.pm-fm-folder,' +
        '.bA-row,.bA-card,.bA-col,.bB-row,.dA-tile,.dA-row,.dB-node,.dB-row,.dB-card,.aA-card,.aB-row';
      function scrollParent(el) { while (el && el !== document.body) { var oy = getComputedStyle(el).overflowY; if (oy === 'auto' || oy === 'scroll') return el; el = el.parentElement; } return null; }
      var cache = new Map();
      function obsFor(root) { var o = cache.get(root || 0); if (o) return o; o = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('in'); }); }, { root: root || null, threshold: 0.06, rootMargin: '0px 0px -5% 0px' }); cache.set(root || 0, o); return o; }
      var lastP = null, cnt = 0;
      document.querySelectorAll('#app ' + REVEAL).forEach(function (el) {
        var p = el.parentElement; if (p !== lastP) { lastP = p; cnt = 0; } else { cnt++; }
        el.style.transitionDelay = Math.min(cnt, 6) * 32 + 'ms';
        el.classList.add('pm-rev');
        obsFor(scrollParent(el)).observe(el);
      });
      window.PMRail.revealAll = function () { document.querySelectorAll('.pm-rev:not(.in)').forEach(function (e) { e.classList.add('in'); }); };
    })();

    /* gallery bridge: a parent page (index.html) can drive theme/width/panel/RM
       across every open concept at once for side-by-side comparison. */
    function applyTheme(t) {
      if (!t) return;
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.style.colorScheme = /-dark$/.test(t) ? 'dark' : 'light';
      var lbl = document.getElementById('themeMenuLabel');
      if (lbl) { var m = { 'friendly-dark': 'Friendly Dark', 'friendly-light': 'Friendly Light', 'glass-dark': 'Glass Dark', 'glass-light': 'Glass Light', 'retro-dark': 'Retro Dark', 'retro-light': 'Retro Light', 'basic-dark': 'Basic Dark', 'basic-light': 'Basic Light' }; lbl.textContent = m[t] || lbl.textContent; }
      document.querySelectorAll('#themeMenu [data-value]').forEach(function (it) { it.classList.toggle('is-selected', it.getAttribute('data-value') === t); });
    }
    window.addEventListener('message', function (e) {
      var d = e.data; if (!d || typeof d !== 'object') return;
      if (d.type === 'pm-setw' && typeof d.w === 'number') setW(d.w);
      else if (d.type === 'pm-theme') applyTheme(d.theme);
      else if (d.type === 'pm-panel' && d.panel) showPanel(d.panel);
      else if (d.type === 'pm-rm') { document.documentElement.setAttribute('data-reduced-motion', d.on ? '1' : '0'); var b = document.getElementById('sbRM'); if (b) { b.classList.toggle('on', !!d.on); b.setAttribute('aria-pressed', String(!!d.on)); } if (d.on && window.PMRail.revealAll) window.PMRail.revealAll(); }
    });
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'pm-ready' }, '*'); } catch (_) {}
  }

  window.PMChrome = { boot: boot };
})();
