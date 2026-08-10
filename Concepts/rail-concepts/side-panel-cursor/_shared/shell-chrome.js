/* Shell / lab bootstrap for side-panel prototypes. */
(function (global) {
  var THEMES = (window.SPData && SPData.themes) || [
    'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light',
    'retro-dark', 'retro-light', 'basic-dark', 'basic-light'
  ];
  var WIDTHS = [220, 260, 420];
  var STORE = 'pm.sidePanelProto';
  var PANEL_IDS = ['search', 'source', 'actions', 'docker', 'tests', 'agents', 'artifacts'];

  function toast(msg) {
    var host = document.getElementById('toastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toastHost';
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  function reducedMotion() {
    return document.body.getAttribute('data-reduced') === '1' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function bootTheme() {
    var t = localStorage.getItem(STORE + '.theme');
    if (THEMES.indexOf(t) === -1) t = 'friendly-dark';
    document.documentElement.setAttribute('data-theme', t);
    return t;
  }

  function setTheme(t) {
    if (THEMES.indexOf(t) === -1) return;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORE + '.theme', t);
    document.querySelectorAll('[data-theme-chip]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-theme-chip') === t ? 'true' : 'false');
    });
  }

  function setWidth(px) {
    document.documentElement.style.setProperty('--panel-w', px + 'px');
    localStorage.setItem(STORE + '.width', String(px));
    document.querySelectorAll('[data-width-chip]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-width-chip') === String(px) ? 'true' : 'false');
    });
    var slot = document.getElementById('sideSlot');
    if (slot) slot.style.width = px + 'px';
    try {
      document.body.setAttribute('data-panel-narrow', px <= 240 ? '1' : '0');
    } catch (e) { /* */ }
  }

  function bootWidth() {
    var w = parseInt(localStorage.getItem(STORE + '.width') || '260', 10);
    if (WIDTHS.indexOf(w) === -1 && (w < 220 || w > 480)) w = 260;
    setWidth(w);
    return w;
  }

  function wireResizer(handle, target) {
    if (!handle || !target) return;
    var dragging = false;
    var startX = 0;
    var startW = 0;
    handle.addEventListener('pointerdown', function (e) {
      dragging = true;
      startX = e.clientX;
      startW = target.getBoundingClientRect().width;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var w = Math.max(220, Math.min(Math.min(480, window.innerWidth * 0.5), startW + (e.clientX - startX)));
      setWidth(Math.round(w));
    });
    handle.addEventListener('pointerup', function () { dragging = false; });
    handle.addEventListener('dblclick', function () { setWidth(260); });
  }

  function wireInteractions(root) {
    root = root || document;
    root.querySelectorAll('[data-toast]').forEach(function (el) {
      if (el._spToast) return;
      el._spToast = true;
      el.addEventListener('click', function (e) {
        if (e.target.closest('.sp-sprout-menu') || e.target.closest('.sp-sprout-trigger')) return;
        toast(el.getAttribute('data-toast'));
      });
    });
    root.querySelectorAll('[data-toggle="flag"]').forEach(function (btn) {
      if (btn._spFlag) return;
      btn._spFlag = true;
      btn.addEventListener('click', function () {
        btn.classList.toggle('active');
        toast((btn.getAttribute('title') || 'Flag') + ': ' + (btn.classList.contains('active') ? 'on' : 'off'));
      });
    });
    root.querySelectorAll('[data-toggle-id]').forEach(function (btn) {
      if (btn._spTog) return;
      btn._spTog = true;
      btn.addEventListener('click', function () {
        var el = document.getElementById(btn.getAttribute('data-toggle-id'));
        if (el) el.classList.toggle('hidden');
      });
    });
    root.querySelectorAll('.sp-seg button, .lab-ribbon-btn, .lab-rt-toggle button, .lab-policy button').forEach(function (btn) {
      if (btn._spSeg) return;
      btn._spSeg = true;
      btn.addEventListener('click', function () {
        var seg = btn.parentElement;
        seg.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
    root.querySelectorAll('[data-ladder]').forEach(function (btn) {
      if (btn._spLad) return;
      btn._spLad = true;
      btn.addEventListener('click', function () {
        var body = btn.nextElementSibling;
        var rootLadder = btn.closest('.layout-ladder') || btn.parentElement;
        rootLadder.querySelectorAll('.sp-ladder-body').forEach(function (b) { b.classList.remove('open'); });
        if (body) body.classList.add('open');
      });
    });
    root.querySelectorAll('.sp-spine button').forEach(function (btn) {
      if (btn._spSpine) return;
      btn._spSpine = true;
      btn.addEventListener('click', function () {
        var spine = btn.parentElement;
        spine.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
    root.querySelectorAll('[data-sheet-title]').forEach(function (row) {
      if (row._spSheet) return;
      row._spSheet = true;
      row.addEventListener('click', function () {
        var panel = row.closest('.sp-panel');
        if (!panel) return;
        panel.querySelectorAll('.sp-row.selected, .lab-wt-card.selected').forEach(function (r) { r.classList.remove('selected'); });
        row.classList.add('selected');
        var sheet = panel.querySelector('.sp-sheet');
        if (!sheet) return;
        sheet.classList.add('open');
        var h = sheet.querySelector('h3');
        var p = sheet.querySelector('p');
        if (h) h.textContent = row.getAttribute('data-sheet-title') || '';
        if (p) p.textContent = row.getAttribute('data-sheet-body') || '';
      });
    });
  }

  function showPanel(id) {
    document.querySelectorAll('.sp-panel').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-panel') === id);
    });
    document.querySelectorAll('.ab-btn[data-panel]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-panel') === id);
    });
    localStorage.setItem(STORE + '.panel', id);
  }

  function buildProtoBar(opts) {
    opts = opts || {};
    var themeChips = THEMES.map(function (t) {
      return '<button type="button" class="proto-chip" data-theme-chip="' + t + '">' + (SPData.themeLabels[t] || t) + '</button>';
    }).join('');
    var widthChips = WIDTHS.map(function (w) {
      return '<button type="button" class="proto-chip" data-width-chip="' + w + '">' + w + 'px</button>';
    }).join('');
    var density = (SPData.density === 'comfortable') ? 'comfortable' : 'crowded';
    var densityChips =
      '<button type="button" class="proto-chip" data-density-chip="comfortable"' +
        (density === 'comfortable' ? ' aria-pressed="true"' : '') + '>Comfortable</button>' +
      '<button type="button" class="proto-chip" data-density-chip="crowded"' +
        (density === 'crowded' ? ' aria-pressed="true"' : '') + '>Crowded</button>';
    var shellLinks = '';
    if (opts.shellNav) {
      shellLinks = SPData.shells.map(function (s) {
        var href = (opts.shellBase || '') + s.file;
        var active = opts.shellId === s.id ? ' primary' : '';
        return '<a class="proto-btn' + active + '" href="' + href + '">' + s.id + ' ' + s.name + '</a>';
      }).join('');
    }
    var variantChips = '';
    if (opts.variants) {
      variantChips = '<span class="proto-variants" id="protoVariants">' + opts.variants.map(function (v, i) {
        return '<button type="button" class="proto-chip" data-variant="' + i + '"' + (i === 0 ? ' aria-pressed="true"' : '') + '>' + (i + 1) + ' ' + v.name + '</button>';
      }).join('') + '</span>';
    } else if (opts.variantSlot) {
      variantChips = '<span class="proto-variants" id="protoVariants"></span>';
    }
    return (
      '<div class="proto-bar">' +
        '<span class="brand">PM Side Panels</span>' +
        '<a class="proto-btn" href="' + (opts.home || '../index.html') + '">Index</a>' +
        (opts.studioLink ? '<a class="proto-btn primary" href="' + opts.studioLink + '">Lab studio</a>' : '') +
        (shellLinks ? '<span class="sep"></span>' + shellLinks : '') +
        (variantChips ? '<span class="sep"></span>' + variantChips : '') +
        '<span class="sep"></span>' +
        '<span class="proto-chip muted">Density</span>' + densityChips +
        '<span class="sep"></span>' +
        '<span class="proto-chip muted">Width</span>' + widthChips +
        '<span class="sep"></span>' +
        '<span class="proto-chip muted">Theme</span>' + themeChips +
      '</div>'
    );
  }

  function buildActivityBar(active) {
    var stub = '<button type="button" class="ab-btn stub" title="Files (stub)" disabled>' + SPIcons.svg('files', 18) + '<span>Files</span></button>';
    var btns = SPData.panels.map(function (p) {
      return '<button type="button" class="ab-btn' + (p.id === active ? ' active' : '') + '" data-panel="' + p.id + '">' +
        SPIcons.svg(p.id, 18) + '<span>' + p.label + '</span></button>';
    }).join('');
    return '<div class="activity-bar">' + stub + btns + '</div>';
  }

  function buildMainStub(opts) {
    opts = opts || {};
    var title = opts.title || 'Home';
    var blurb = opts.blurb || 'Side panel prototypes — simplified chrome.';
    var lines = [
      'fn parse_quantity(raw: &str) -> Result<Qty> {',
      '    let parts = raw.split_whitespace();',
      '    // normalize mixed fractions before scale',
      '    normalize_units(quantity, unit)',
      '}',
      '',
      'pub struct Ingredient {',
      '    pub quantity: f32,',
      '    pub unit: Unit,',
      '}'
    ];
    var code = lines.map(function (ln, i) {
      return '<div class="stub-code-line"><span class="stub-ln">' + (i + 1) + '</span><span class="stub-code">' +
        (ln ? ln.replace(/</g, '&lt;') : '&nbsp;') + '</span></div>';
    }).join('');
    return (
      '<div class="main-stub" id="mainStub">' +
        '<div class="stub-workspace">' +
          '<div class="stub-tabs">' +
            '<button type="button" class="stub-tab active">Home</button>' +
            '<button type="button" class="stub-tab">import.rs</button>' +
            '<button type="button" class="stub-tab">recipes.rs</button>' +
            '<span class="stub-tab-meta">' + title + '</span>' +
          '</div>' +
          '<div class="stub-editor">' +
            '<div class="stub-editor-note">' + blurb + ' Non-target chrome is simplified for scale judgment.</div>' +
            '<div class="stub-code-pane">' + code + '</div>' +
          '</div>' +
          '<div class="stub-status">' +
            '<span>main</span><span class="dot"></span>' +
            '<span>tastebook</span><span class="dot"></span>' +
            '<span>Ready</span><span class="dot"></span>' +
            '<span>Friendly · concept</span>' +
          '</div>' +
        '</div>' +
        '<aside class="stub-chat-rail" title="Chat (stub)" aria-hidden="true">' +
          '<div class="stub-chat-pill">Chat</div>' +
        '</aside>' +
      '</div>'
    );
  }

  function syncDensityChips() {
    var d = SPData.density || 'crowded';
    document.querySelectorAll('[data-density-chip]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-density-chip') === d ? 'true' : 'false');
    });
  }

  function wireChromeControls(onDensity) {
    document.querySelectorAll('[data-theme-chip]').forEach(function (btn) {
      btn.addEventListener('click', function () { setTheme(btn.getAttribute('data-theme-chip')); });
    });
    document.querySelectorAll('[data-width-chip]').forEach(function (btn) {
      btn.addEventListener('click', function () { setWidth(parseInt(btn.getAttribute('data-width-chip'), 10)); });
    });
    document.querySelectorAll('[data-density-chip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-density-chip');
        SPData.setDensity(mode);
        syncDensityChips();
        if (typeof onDensity === 'function') onDensity(mode);
      });
    });
  }

  function bootDensity() {
    if (SPData && typeof SPData.bootDensity === 'function') return SPData.bootDensity();
    return 'crowded';
  }

  var hostAnimToken = 0;
  function animateHost(host, fn) {
    if (!host) { fn(); return; }
    if (reducedMotion()) { fn(); return; }
    var token = ++hostAnimToken;
    host.classList.add('is-exiting');
    setTimeout(function () {
      if (token !== hostAnimToken) return;
      fn();
      host.classList.remove('is-exiting');
      host.classList.add('is-entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (token !== hostAnimToken) return;
          host.classList.remove('is-entering');
        });
      });
    }, 200);
  }

  function mountShell(opts) {
    opts = opts || {};
    var layout = opts.layout || 'stacked';
    var shellId = opts.shellId || '01';
    var title = opts.title || 'Shell';
    var active = localStorage.getItem(STORE + '.panel') || 'search';
    if (!SPData.panels.some(function (p) { return p.id === active; })) active = 'search';

    bootTheme();
    bootDensity();
    document.body.setAttribute('data-shell-layout', layout);
    document.body.innerHTML =
      '<div class="app">' +
        buildProtoBar({ shellNav: true, shellId: shellId, shellBase: '', home: '../index.html', studioLink: '../labs/studio.html' }) +
        '<div class="workspace">' +
          buildActivityBar(active) +
          '<div class="side-slot" id="sideSlot">' +
            '<div id="panelHost" class="panel-host"></div>' +
            '<div class="side-resizer" id="sideResizer"></div>' +
          '</div>' +
          buildMainStub({ title: title, blurb: opts.blurb || '' }) +
        '</div>' +
      '</div>' +
      '<div class="toast-host" id="toastHost"></div>';

    var host = document.getElementById('panelHost');

    function paintShellPanels() {
      host.innerHTML = SPPanels.renderAll(layout, shellId);
      host.querySelectorAll('.sp-panel').forEach(function (p) {
        p.style.flex = '1';
        p.style.minHeight = '0';
      });
      var cur = localStorage.getItem(STORE + '.panel') || active;
      if (!SPData.panels.some(function (p) { return p.id === cur; })) cur = active;
      showPanel(cur);
      SPSprout.scan(host);
      wireInteractions(host);
    }

    paintShellPanels();

    document.querySelectorAll('.ab-btn[data-panel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-panel');
        animateHost(host, function () { showPanel(id); });
      });
    });
    wireChromeControls(function () {
      animateHost(host, paintShellPanels);
    });
    bootWidth();
    setTheme(document.documentElement.getAttribute('data-theme'));
    syncDensityChips();
    wireResizer(document.getElementById('sideResizer'), document.getElementById('sideSlot'));
    SPSprout.scan(document);
    wireInteractions(document);
  }

  function metaFor(panelId) {
    if (global.SPLab && SPLab.meta[panelId]) {
      return SPLab.meta[panelId].map(function (m) {
        return { id: m.id, name: m.name, note: m.note };
      });
    }
    return [];
  }

  function parseQuery() {
    var q = {};
    (location.search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return q;
  }

  function mountLab(opts) {
    opts = opts || {};
    var q = parseQuery();
    var panelId = opts.panelId || q.panel || localStorage.getItem(STORE + '.labPanel') || 'search';
    if (PANEL_IDS.indexOf(panelId) === -1) panelId = 'search';

    bootTheme();
    bootDensity();
    document.body.removeAttribute('data-shell-layout');
    document.body.setAttribute('data-mode', 'lab-studio');

    document.body.innerHTML =
      '<div class="app">' +
        buildProtoBar({ home: '../index.html', variantSlot: true }) +
        '<div class="lab-note-bar" id="labNote">Pick a concept variant above. Switch panels from the activity bar. Use Crowded density to stress lists.</div>' +
        '<div class="workspace">' +
          buildActivityBar(panelId) +
          '<div class="side-slot" id="sideSlot">' +
            '<div id="panelHost" class="panel-host"></div>' +
            '<div class="side-resizer" id="sideResizer"></div>' +
          '</div>' +
          buildMainStub({
            title: 'Lab studio',
            blurb: 'All seven side panels share this shell. Use the activity bar to jump Search ↔ Docker ↔ Artifacts while judging scale against the editor.'
          }) +
        '</div>' +
      '</div>' +
      '<div class="toast-host" id="toastHost"></div>';

    var host = document.getElementById('panelHost');
    var variants = [];
    var currentPanel = panelId;
    var currentVariant = 0;

    function rebuildVariantChips(activeIndex) {
      var wrap = document.getElementById('protoVariants');
      if (!wrap) return;
      wrap.innerHTML = variants.map(function (v, i) {
        return '<button type="button" class="proto-chip" data-variant="' + i + '"' +
          (i === activeIndex ? ' aria-pressed="true"' : '') + '>' + (i + 1) + ' ' + v.name + '</button>';
      }).join('');
      wrap.querySelectorAll('[data-variant]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          showVariant(parseInt(btn.getAttribute('data-variant'), 10));
        });
      });
    }

    function syncLabUrl(panel, variantIndex) {
      try {
        var url = new URL(location.href);
        url.searchParams.set('panel', panel);
        url.searchParams.set('variant', String(variantIndex));
        history.replaceState(null, '', url.pathname + url.search);
      } catch (e) { /* file:// */ }
    }

    function renderVariant(i) {
      var v = variants[i];
      if (!v) return;
      var vid = v.id || v.layout;
      var html;
      if (global.SPLab && SPLab.variants[currentPanel] && SPLab.variants[currentPanel][vid]) {
        html = SPLab.render(currentPanel, vid, currentPanel + '-lab' + i);
      } else {
        html = SPPanels.render(currentPanel, v.layout || 'stacked', currentPanel + '-lab' + i);
      }
      host.innerHTML = html;
      var live = host.querySelector('.sp-panel');
      if (live) {
        live.classList.add('active');
        live.style.flex = '1';
        live.style.minHeight = '0';
        live.style.height = '100%';
      }
      var note = document.getElementById('labNote');
      if (note) {
        note.textContent = (v.note || v.name) + ' · Panel: ' + currentPanel +
          ' · Use activity bar to switch panels without leaving this page.';
      }
      document.querySelectorAll('#protoVariants [data-variant]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-variant') === String(i) ? 'true' : 'false');
      });
      SPSprout.scan(host);
      wireInteractions(host);
      currentVariant = i;
      localStorage.setItem(STORE + '.lab.' + currentPanel, String(i));
      localStorage.setItem(STORE + '.labPanel', currentPanel);
      syncLabUrl(currentPanel, i);
    }

    function showVariant(i) {
      if (isNaN(i) || i < 0 || i >= variants.length) i = 0;
      // Update chip pressed state immediately so rapid clicks feel responsive
      document.querySelectorAll('#protoVariants [data-variant]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-variant') === String(i) ? 'true' : 'false');
      });
      animateHost(host, function () { renderVariant(i); });
    }

    function switchPanel(nextId) {
      if (PANEL_IDS.indexOf(nextId) === -1) return;
      currentPanel = nextId;
      variants = metaFor(currentPanel);
      if (!variants.length && opts.variants && opts.panelId === nextId) variants = opts.variants;
      document.querySelectorAll('.ab-btn[data-panel]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-panel') === nextId);
      });
      var start = parseInt(localStorage.getItem(STORE + '.lab.' + currentPanel) || '0', 10);
      if (isNaN(start) || start < 0 || start >= variants.length) start = 0;
      if (q.panel === nextId && q.variant != null && opts._appliedQuery !== true) {
        var qv = parseInt(q.variant, 10);
        if (!isNaN(qv) && qv >= 0 && qv < variants.length) start = qv;
        opts._appliedQuery = true;
      }
      rebuildVariantChips(start);
      syncLabUrl(nextId, start);
      animateHost(host, function () { renderVariant(start); });
    }

    document.querySelectorAll('.ab-btn[data-panel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchPanel(btn.getAttribute('data-panel'));
      });
    });
    wireChromeControls(function () {
      animateHost(host, function () { renderVariant(currentVariant); });
    });
    bootWidth();
    setTheme(document.documentElement.getAttribute('data-theme'));
    syncDensityChips();
    wireResizer(document.getElementById('sideResizer'), document.getElementById('sideSlot'));

    // Initial paint (no double animation)
    variants = metaFor(currentPanel);
    if ((!variants || !variants.length) && opts.variants) variants = opts.variants;
    var start = parseInt(localStorage.getItem(STORE + '.lab.' + currentPanel) || '0', 10);
    if (q.variant != null) {
      var qv0 = parseInt(q.variant, 10);
      if (!isNaN(qv0)) start = qv0;
    }
    if (isNaN(start) || start < 0 || start >= variants.length) start = 0;
    rebuildVariantChips(start);
    renderVariant(start);
    opts._appliedQuery = true;
  }

  global.SPProto = {
    toast: toast,
    mountShell: mountShell,
    mountLab: mountLab,
    setTheme: setTheme,
    setWidth: setWidth,
    themes: THEMES,
    widths: WIDTHS
  };
})(window);
