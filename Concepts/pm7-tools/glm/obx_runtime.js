/* ============================================================
   GLM Onboarding "obx" — runtime: render loop, flows, API
   ============================================================ */
(function () {
  'use strict';
  var T = window.PMX_OBX;
  var root, windowEl, content, titleEl, ledeEl, kickerEl, actEl, ctaEl, backEl, footMid, sceneEl, captionEl, progressEl, resumeBtn;
  var transitioning = false;

  /* ---------------- boot ---------------- */
  function init() {
    root = document.getElementById('pmx-onboarding');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    windowEl = root.querySelector('.obx-window');
    content = root.querySelector('#pmx-ob-content');
    titleEl = root.querySelector('#pmx-ob-title');
    ledeEl = root.querySelector('#pmx-ob-lede');
    kickerEl = root.querySelector('#pmx-ob-kicker');
    actEl = root.querySelector('#pmx-ob-act');
    ctaEl = root.querySelector('#pmx-ob-cta');
    backEl = root.querySelector('.obx-backbtn');
    footMid = root.querySelector('#pmx-ob-footmid');
    sceneEl = root.querySelector('#pmx-ob-scene');
    captionEl = root.querySelector('#pmx-ob-caption');
    progressEl = root.querySelector('#pmx-ob-progress');
    resumeBtn = document.getElementById('pm7-onboarding-resume');

    readTheme();
    observeTheme();
    bindEvents();
    load();
    if (!T.state.open && (T.state.wasOpen || shouldAutoOpen())) open({ screen: T.state.screen || 'welcome' });
    else if (!T.state.open) resumeBtn.hidden = !(T.state.screen && T.state.screen !== 'welcome' && !T.state.committed);
    exposeApi();
  }

  function shouldAutoOpen() {
    try {
      if (localStorage.getItem('pm.glm.onboarding.done')) return false;
      var seen = localStorage.getItem('pm.glm.onboarding.visited');
      if (!seen) { localStorage.setItem('pm.glm.onboarding.visited', '1'); return true; }
      return false;
    } catch (e) { return true; }
  }

  function readTheme() {
    var slug = (document.documentElement.getAttribute('data-theme') || 'friendly-dark');
    var parts = slug.split('-');
    T.state.theme_family = parts[0];
    T.state.theme_mode = parts[1] || 'dark';
    T.state.mat = T.state.theme_family;
    T.state.mode = T.state.theme_mode;
    applyMat();
  }
  function applyMat() {
    root.setAttribute('data-mat', T.state.mat);
    root.setAttribute('data-mode', T.state.mode);
  }
  function observeTheme() {
    var io = new MutationObserver(function () { readTheme(); });
    io.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ---------------- persistence ---------------- */
  function save() {
    try {
      localStorage.setItem(T.PERSIST_KEY, JSON.stringify({
        open: T.state.open,
        screen: T.state.screen, stack: T.state.stack, draft: T.state.draft,
        committed: T.state.committed, receipt: T.state.receipt,
        providers: T.state.providers, free_models: T.state.free_models
      }));
    } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(T.PERSIST_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p.draft) T.state.draft = Object.assign(T.state.draft, p.draft);
      T.state.screen = p.screen || 'welcome';
      T.state.wasOpen = !!p.open;
      T.state.stack = p.stack || [];
      T.state.committed = !!p.committed;
      T.state.receipt = p.receipt || null;
      T.state.providers = p.providers || {};
      T.state.free_models = !!p.free_models;
    } catch (e) {}
  }

  /* ---------------- render ---------------- */
  function render(next, opts) {
    opts = opts || {};
    var name = next;
    var spec = (T.screens[name] || T.screens.welcome)();
    var cp = T.copy[name] || T.copy.welcome;
    T.state.screen = name;

    /* act label + progress */
    var act = T.ACTS[name] || 'Welcome';
    if (actEl.textContent !== act) {
      actEl.classList.add('is-swapping');
      setTimeout(function () { actEl.textContent = act; actEl.classList.remove('is-swapping'); }, 120);
    }
    var idx = T.SCREENS.indexOf(name);
    var pct = Math.round(((idx + 1) / T.SCREENS.length) * 100);
    if (progressEl) progressEl.style.width = pct + '%';

    /* head + content with step transition */
    var doSwap = function () {
      kickerEl.textContent = cp.kicker;
      titleEl.innerHTML = T.esc(cp.title).replace(/\n/g, '<br>').split(/(<br>)/).map(function (part) {
        if (part === '<br>') return part;
        return part.split(' ').filter(Boolean).map(function (w, i) {
          return '<span class="obx-tw" style="--wi:' + i + '">' + w + '</span>';
        }).join(' ');
      }).join('');
      content.innerHTML = spec.html;
      content.scrollTop = 0;
      var step = content.querySelector('.obx-cstep');
      if (step) step.classList.add('is-enter');
      if (ctaEl) {
        ctaEl.textContent = spec.cta || 'Continue';
        ctaEl.setAttribute('aria-disabled', spec.ctaDisabled ? 'true' : 'false'); ctaEl.removeAttribute('data-pm-hover-was-disabled');
        ctaEl.style.display = spec.cta === null ? 'none' : '';
      }
      if (backEl) backEl.style.visibility = spec.hideBack ? 'hidden' : '';
      if (footMid) footMid.innerHTML = spec.footMid || dots(name);
      if (spec.mount) spec.mount(content);
      root.setAttribute('data-screen', name);
      swapScene(name, opts);
      save();
    };
    var cur = content.querySelector('.obx-cstep');
    if (cur && !opts.instant) {
      cur.classList.add('is-exit');
      setTimeout(doSwap, 180);
    } else doSwap();
  }
  T.render = render;

  function dots(name) {
    var major = ['welcome', 'where', 'project_kind', 'review', 'power', 'finish'];
    var cur = 0;
    for (var i = 0; i < major.length; i++) { if (T.SCREENS.indexOf(name) >= T.SCREENS.indexOf(major[i])) cur = i; }
    return '<div class="obx-dots" aria-hidden="true">' + major.map(function (m, i) {
      return '<i class="' + (i < cur ? 'on' : i === cur ? 'now' : '') + '"></i>';
    }).join('') + '</div>';
  }

  /* scene swap with mid-hold so art reads before the change */
  var sceneSwapTimer = 0;
  function swapScene(name, opts) {
    clearTimeout(sceneSwapTimer);
    var art = artFor(name);
    var caption = T.CAPTIONS[name] || '';
    var apply = function () {
      sceneEl.innerHTML = art;
      sceneEl.setAttribute('data-scene', sceneKind(name));
      captionEl.textContent = caption;
      captionEl.classList.add('on');
      if (name === 'preparing' && opts.commitGo) {
        var sc = sceneEl.querySelector('.os-commit');
        if (sc) sc.classList.add('go');
      }
    };
    if (sceneEl.childElementCount && !opts.instant) {
      sceneEl.classList.add('swap-out');
      sceneSwapTimer = setTimeout(function () {
        apply();
        sceneEl.classList.remove('swap-out');
      }, 240);
    } else apply();
  }

  function sceneKind(name) {
    if (name === 'welcome') return 'welcome';
    if (name === 'where' || name === 'checks' || name === 'device_ready') return 'where';
    if (name === 'project_kind' || name === 'new_project' || name === 'existing_source' || name === 'restore') return 'project';
    if (name === 'keep') return 'keep';
    if (name === 'review') return 'review';
    if (name === 'preparing') return 'commit';
    if (name === 'power' || name === 'free_models') return 'power';
    return 'finish';
  }
  function artFor(name) {
    var d = T.state.draft;
    switch (sceneKind(name)) {
      case 'welcome': return T.artWelcome();
      case 'where': return T.artWhere(name === 'checks' || name === 'device_ready' ? 'after' : null);
      case 'project': return T.artProject(d.kind === 'existing' ? 'existing' : d.kind === 'restore' ? 'restore' : 'new');
      case 'keep': return T.artKeep({ online: !d.online ? false : true, nas: !!d.nas });
      case 'review': return T.artReview();
      case 'commit': return T.artCommit(!!T.state.committed);
      case 'power': return T.artPower({ ready: readyCount() });
      default: {
        var fin = T.artFinish(T.state.mat, T.state.finish_phase);
        return fin.html;
      }
    }
  }
  function readyCount() {
    var n = 0, st = T.state.providers;
    Object.keys(st).forEach(function (k) { if (st[k].state === 'ready') n++; });
    return n;
  }

  /* ---------------- navigation ---------------- */
  function nav(name, opts) {
    if (transitioning) { setTimeout(function () { nav(name, opts); }, 280); return; }
    transitioning = true;
    var push = !(opts && opts.back);
    if (push && T.state.screen && T.state.screen !== name) {
      if (T.state.stack[T.state.stack.length - 1] !== T.state.screen) T.state.stack.push(T.state.screen);
    } else if (opts && opts.back) {
      T.state.stack.pop();
    }
    render(name, opts);
    setTimeout(function () { transitioning = false; }, 260);
  }
  T.nav = nav;

  function back() {
    var prev = T.state.stack.pop();
    if (!prev) { close('defer'); return; }
    render(prev, { back: true });
  }

  /* ---------------- open/close ---------------- */
  function open(opts) {
    opts = opts || {};
    T.state.open = true;
    root.hidden = false;
    resumeBtn.hidden = true;
    requestAnimationFrame(function () {
      root.setAttribute('data-open', 'true');
      setTimeout(function () { windowEl.classList.add('settle'); setTimeout(function () { windowEl.classList.remove('settle'); }, 340); }, 480);
    });
    render(opts.screen || T.state.screen || 'welcome', { instant: true });
  }
  function close(kind) {
    T.state.open = false;
    root.setAttribute('data-open', 'false');
    setTimeout(function () { root.hidden = true; }, 360);
    save();
    if (kind !== 'silent' && T.state.screen !== 'welcome' && !T.state.committed) resumeBtn.hidden = false;
    toast(kind === 'skip' ? 'Setup skipped — resume anytime' : 'Setup saved — resume anytime');
  }

  /* ---------------- toast ---------------- */
  var toastTimer = 0;
  function toast(msg) {
    var t = document.getElementById('pmx-ob-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pmx-ob-toast'; t.className = 'obx-toast'; t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  T.toast = toast;

  /* ---------------- flows ---------------- */
  T.runChecks = function () {
    var rows = document.querySelectorAll('#pmx-check-rows .obx-prep-row');
    var notes = ['18 GB free', 'no obstacles', 'ready'];
    var i = 0;
    function step() {
      if (i >= rows.length) {
        setTimeout(function () { nav('device_ready'); }, 620);
        return;
      }
      var r = rows[i];
      r.classList.add('run');
      var note = r.querySelector('.obx-prep-note');
      setTimeout(function () {
        r.classList.remove('run'); r.classList.add('done');
        var spin = r.querySelector('.obx-spin');
        if (spin) spin.outerHTML = '<span class="obx-done">' + T.icon('check') + '</span>';
        if (note) note.textContent = notes[i] || 'ok';
        i++; step();
      }, 560 + i * 120);
    }
    setTimeout(step, 420);
  };

  T.runCommit = function (steps) {
    var rows = document.querySelectorAll('#pmx-prep-rows .obx-prep-row');
    var i = 0;
    function step() {
      if (i >= rows.length) { finishCommit(); return; }
      var r = rows[i];
      r.classList.add('run');
      var note = r.querySelector('.obx-prep-note');
      if (note) note.textContent = 'working…';
      setTimeout(function () {
        r.classList.remove('run'); r.classList.add('done');
        var spin = r.querySelector('.obx-spin');
        if (spin) spin.outerHTML = '<span class="obx-done">' + T.icon('check') + '</span>';
        if (note) note.textContent = 'done';
        i++; step();
      }, 640);
    }
    function finishCommit() {
      T.state.committed = true;
      T.state.receipt = {
        id: 'proj_' + Math.random().toString(36).slice(2, 8),
        at: new Date().toISOString(),
        path: (T.state.userName ? '/Users/' + T.state.userName : '') + '/Puppet Master/' + (T.state.draft.slug || 'my-first-project')
      };
      try { localStorage.setItem('pm.glm.onboarding.done', '1'); } catch (e) {}
      var slot = document.getElementById('pmx-receipt-slot');
      if (slot) {
        slot.innerHTML = '<div class="obx-receipt">' + T.icon('check')
          + '<span><b>Project created.</b> Receipt <code>' + T.state.receipt.id + '</code> · ' + T.esc(T.state.receipt.path) + '</span></div>';
      }
      var sc = sceneEl.querySelector('.os-commit');
      if (sc) sc.classList.add('go');
      ctaEl.setAttribute('aria-disabled', 'false'); ctaEl.removeAttribute('data-pm-hover-was-disabled');
      ctaEl.textContent = 'Continue';
      toast('Project created — everything else is optional');
      save();
    }
    setTimeout(step, 480);
  };

  /* provider detection: deterministic fixture — anthropic ready, claude sign-in, grok install */
  T.detectProviders = function () {
    var st = T.state.providers;
    if (st.__detected) return;
    st.__detected = true;
    st.anthropic = { state: 'ready', login: 'sk-ant…7f2a' };
    st.claude = { state: 'signin' };
    st.gemini = { state: 'key' };
    st.grok = { state: 'install' };
    st.opencode = { state: 'ready', login: 'zen' };
    save();
    setTimeout(function () { render('power', { instant: true }); }, 900);
  };

  T.openSheet = function (kind, provider) {
    var slot = document.getElementById('pmx-sheet-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'pmx-sheet-slot';
      var content = document.getElementById('pmx-ob-content');
      if (!content) return;
      content.appendChild(slot);
      slot.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    var p = T.PROVIDERS.find(function (x) { return x.id === provider; }) || { name: provider };
    var inner = '';
    if (kind === 'signin') {
      inner = '<div class="obx-sheet-head"><span class="obx-svc">' + T.icon('github') + '</span><div><div class="obx-sheet-title">Sign in to ' + T.esc(p.name) + '</div><div class="obx-sheet-sub">You can also create an account on the next screen</div></div></div>'
        + '<p>Puppet Master gets read access to list your projects. Nothing is created yet.</p>'
        + '<ul><li>See your existing projects</li><li>Choose where the copy lives</li><li>Revoke access anytime in ' + T.esc(p.name) + ' settings</li></ul>'
        + '<div class="obx-sheet-actions"><button type="button" class="obx-cta" data-sheet="go" style="margin-left:0;padding:9px 16px;font-size:13px">Continue with ' + T.esc(p.name) + '</button>'
        + '<button type="button" class="obx-mini" data-sheet="cancel">Cancel</button>'
        + '<span class="obx-quiet">Opens in your browser</span></div>';
    } else if (kind === 'apikey') {
      inner = '<div class="obx-sheet-head"><span class="obx-svc">' + T.icon('lock') + '</span><div><div class="obx-sheet-title">Enter an ' + T.esc(p.name) + ' API key</div><div class="obx-sheet-sub">Pay-as-you-go · billed by ' + T.esc(p.name) + '</div></div></div>'
        + '<input class="obx-input" id="pmx-key-input" type="password" placeholder="Paste your key" autocomplete="off">'
        + '<p class="obx-quiet" style="margin:6px 0 0">Stored in your device keychain — never in the project.</p>'
        + '<div class="obx-sheet-actions"><button type="button" class="obx-cta" data-sheet="go" style="margin-left:0;padding:9px 16px;font-size:13px">Verify key</button><button type="button" class="obx-mini" data-sheet="cancel">Cancel</button></div>';
    } else if (kind === 'install') {
      inner = '<div class="obx-sheet-head"><span class="obx-svc">' + T.icon('shield') + '</span><div><div class="obx-sheet-title">Install the ' + T.esc(p.name) + ' command line tool</div><div class="obx-sheet-sub">The official installer, straight from ' + T.esc(p.name) + '</div></div></div>'
        + '<ul><li>Installed only on this computer</li><li>You will sign in after it is installed</li><li>Removable anytime</li></ul>'
        + '<div class="obx-sheet-actions"><button type="button" class="obx-cta" data-sheet="go" style="margin-left:0;padding:9px 16px;font-size:13px">Install</button><button type="button" class="obx-mini" data-sheet="cancel">Cancel</button></div>';
    }
    slot.innerHTML = '<div class="obx-sheet" id="pmx-sheet" data-sheet-kind="' + kind + '" data-sheet-provider="' + (provider || '') + '" data-sheet-scope="' + (T._sheetScope || 'power') + '">' + inner + '</div>';
    var sheet = slot.querySelector('#pmx-sheet');
    T._sheetScope = null;
    sheet.classList.add('is-enter');
    sheet.animate ? sheet.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)' }) : null;
  };

  T.sheetGo = function (kind, provider, scope) {
    if (scope === 'source') {
      var dd = T.state.draft;
      dd.online = Object.assign({ provider: 'github', repoName: '', visibility: 'private' }, dd.online || {});
      dd.online.account = { login: 'you@example.com' };
      var slotS = document.getElementById('pmx-sheet-slot');
      if (slotS) slotS.innerHTML = '<div class="obx-sheet"><div class="obx-prep"><div class="obx-prep-row run"><span class="obx-spin"></span><span>Finishing sign-in…</span></div></div></div>';
      setTimeout(function () {
        T.toast('Signed in — the online copy is created only when you commit');
        render('keep', { instant: true }); save();
      }, 1400);
      return;
    }
    var st = T.state.providers[provider] || (T.state.providers[provider] = {});
    if (kind === 'signin') {
      st.state = 'verify';
      render('power', { instant: true });
      var slot0 = document.getElementById('pmx-sheet-slot');
      if (slot0) slot0.innerHTML = '<div class="obx-sheet"><div class="obx-prep"><div class="obx-prep-row run"><span class="obx-spin"></span><span>Finishing sign-in…</span></div></div></div>';
      setTimeout(function () {
        st.state = 'ready'; st.login = 'you@example.com';
        T.toast(provider + ' connected');
        render('power', { instant: true }); save();
      }, 1500);
    } else if (kind === 'apikey') {
      st.state = 'verify';
      render('power', { instant: true });
      var slot1 = document.getElementById('pmx-sheet-slot');
      if (slot1) slot1.innerHTML = '<div class="obx-sheet"><div class="obx-prep"><div class="obx-prep-row run"><span class="obx-spin"></span><span>Verifying key…</span></div></div></div>';
      setTimeout(function () {
        st.state = 'ready'; st.login = 'API key';
        T.toast('Key verified');
        render('power', { instant: true }); save();
      }, 1500);
    } else if (kind === 'install') {
      st.state = 'installing';
      render('power', { instant: true });
      var slot2 = document.getElementById('pmx-sheet-slot');
      if (slot2) slot2.innerHTML = '<div class="obx-sheet"><div class="obx-prep"><div class="obx-prep-row run"><span class="obx-spin"></span><span>Running the official installer…</span></div></div></div>';
      setTimeout(function () {
        st.state = 'signin';
        T.toast('Installed — one sign-in left');
        render('power', { instant: true }); save();
      }, 2200);
    }
  };

  /* SSH auto-connect */
  T.runSshAuto = function () {
    var d = T.state.draft;
    d.nas = Object.assign({ transport: 'ssh' }, d.nas || {});
    d.nas.auto = 'running'; d.nas.autoStep = 0;
    render('keep', { instant: true });
    var iv = setInterval(function () {
      if (!d.nas || d.nas.auto !== 'running') { clearInterval(iv); return; }
      d.nas.autoStep = (d.nas.autoStep || 0) + 1;
      if (d.nas.autoStep >= 4) {
        clearInterval(iv);
        d.nas.auto = 'done';
        T.toast('Storage connected automatically');
      }
      render('keep', { instant: true });
      save();
    }, 900);
  };

  /* ---------------- theme application + finish actions ---------------- */
  function applyTheme(fam, mode, commit) {
    var slug = fam + '-' + mode;
    var changed = fam !== T.state.theme_family || mode !== T.state.theme_mode;
    T.state.theme_family = fam; T.state.theme_mode = mode;
    T.state.mat = fam; T.state.mode = mode;
    applyMat();
    document.documentElement.setAttribute('data-theme', slug);
    try { window.dispatchEvent(new CustomEvent('pm7.onboarding.theme_choice', { detail: { family: fam, mode: mode, slug: slug, committed: !!commit } })); } catch (e) {}
    try { localStorage.setItem('pm.themeFamily', fam); localStorage.setItem('pm.themeMode', mode); localStorage.setItem('pm.theme', slug); } catch (e) {}
    if (!changed) return;
    /* shutter-blink the stage, swap art at the darkest frame, sweep a shimmer */
    var stage = root.querySelector('.obx-stage');
    var shimmer = windowEl.querySelector('.obx-shimmer');
    var reducedMotion = document.documentElement.getAttribute('data-motion') === 'reduced' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reducedMotion) { sceneEl.innerHTML = T.artFinish(fam, T.state.finish_phase).html; return; }
    root.classList.add('restyling');
    if (stage) stage.classList.add('blink');
    if (shimmer) { windowEl.classList.remove('restyle'); void shimmer.offsetWidth; windowEl.classList.add('restyle'); }
    setTimeout(function () {
      sceneEl.innerHTML = T.artFinish(fam, T.state.finish_phase).html;
      sceneEl.setAttribute('data-scene', 'finish');
    }, 200);
    setTimeout(function () { if (stage) stage.classList.remove('blink'); windowEl.classList.remove('restyle'); root.classList.remove('restyling'); }, 820);
  }

  function finishAction(kind) {
    try { localStorage.setItem('pm.glm.onboarding.done', '1'); } catch (e) {}
    T.state.open = false;
    root.setAttribute('data-open', 'false');
    setTimeout(function () { root.hidden = true; }, 360);
    if (kind === 'wizard') {
      try { window.PM_PAGES && window.PM_PAGES.go('wizard'); } catch (e) {}
      toast('Planning Wizard is ready when you are');
    } else if (kind === 'tour') {
      toast('The tour begins');
      setTimeout(function () {
        try { window.PM7_GUIDED_TOUR && window.PM7_GUIDED_TOUR.start({ source: 'onboarding' }); } catch (e) {}
      }, 420);
    } else {
      toast('All set — Puppet Master is yours');
    }
  }

  /* ---------------- events ---------------- */
  function bindEvents() {
    root.addEventListener('click', function (ev) {
      var el = ev.target.closest ? ev.target.closest('[data-choice],[data-action],[data-edit],[data-transport],[data-forge],[data-provider],[data-theme],[data-mode-btn],[data-finish],[data-sheet]') : null;
      if (!el) return;
      var d = T.state.draft;

      if (el.hasAttribute('data-sheet')) {
        var sheet = el.closest('#pmx-sheet');
        var kindAttr = sheet && sheet.getAttribute('data-sheet-kind');
        var provAttr = sheet && sheet.getAttribute('data-sheet-provider');
        if (el.getAttribute('data-sheet') === 'go') T.sheetGo(kindAttr, provAttr, sheet && sheet.getAttribute('data-sheet-scope'));
        else { var s2 = document.getElementById('pmx-sheet-slot'); if (s2) s2.innerHTML = ''; }
        return;
      }
      if (el.hasAttribute('data-finish')) { finishAction(el.getAttribute('data-finish')); return; }
      if (el.hasAttribute('data-theme')) {
        var fam = el.getAttribute('data-theme');
        root.querySelectorAll('.obx-themecard').forEach(function (c) { c.setAttribute('aria-pressed', String(c === el)); });
        applyTheme(fam, T.state.theme_mode || 'dark', false);
        /* live phase shimmer while previewing */
        T.state.finish_phase = String.fromCharCode(97 + Math.floor(Math.random() * 4));
        var fin = T.artFinish(fam, T.state.finish_phase);
        sceneEl.innerHTML = fin.html;
        return;
      }
      if (el.hasAttribute('data-mode-btn')) {
        var mode = el.getAttribute('data-mode-btn');
        root.querySelectorAll('[data-mode-btn]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); });
        applyTheme(T.state.theme_family || 'friendly', mode, false);
        return;
      }
      if (el.hasAttribute('data-transport')) {
        d.nas = Object.assign({ transport: 'ssh' }, d.nas || {});
        d.nas.transport = el.getAttribute('data-transport');
        render('keep', { instant: true }); save(); return;
      }
      if (el.hasAttribute('data-forge')) {
        d.online = Object.assign({ provider: 'github', repoName: '', visibility: 'private' }, d.online || {});
        d.online.provider = el.getAttribute('data-forge');
        render('keep', { instant: true }); save(); return;
      }
      if (el.hasAttribute('data-provider')) {
        var act = el.getAttribute('data-action');
        var pid = el.getAttribute('data-provider');
        if (act === 'signin') T.openSheet('signin', pid);
        else if (act === 'apikey') T.openSheet('apikey', pid);
        else if (act === 'install') T.openSheet('install', pid);
        return;
      }
      if (el.hasAttribute('data-action')) {
        var a = el.getAttribute('data-action');
        if (a === 'signin') { T._sheetScope = 'source'; T.openSheet('signin', (d.online && d.online.provider) || 'github'); }
        else if (a === 'ssh-auto') T.runSshAuto();
        return;
      }
      if (el.hasAttribute('data-edit')) {
        var to = T.editTo[el.getAttribute('data-edit')] || T.state.stack[T.state.stack.length - 1] || 'review';
        nav(to); return;
      }
      if (el.hasAttribute('data-choice')) {
        var v = el.getAttribute('data-choice');
        handleChoice(v, el);
        return;
      }
    });

    /* footer + chrome */
    ctaEl.addEventListener('click', function () { advance(); });
    backEl.addEventListener('click', function () { back(); });
    var skipBtn = root.querySelector('[data-ui-action-id="ui.onboarding.skip"]');
    var closeBtn = root.querySelector('[data-ui-action-id="ui.onboarding.close"]');
    if (skipBtn) skipBtn.addEventListener('click', function () { close('skip'); });
    if (closeBtn) closeBtn.addEventListener('click', function () { close('defer'); });
    if (resumeBtn) resumeBtn.addEventListener('click', function () { open({ screen: T.state.screen }); });

    document.addEventListener('keydown', function (ev) {
      if (!T.state.open) return;
      if (ev.key === 'Escape') { close('defer'); return; }
      if (ev.key === 'Enter' && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT')) {
        if (ctaEl.getAttribute('aria-disabled') !== 'true') { ev.preventDefault(); advance(); }
        return;
      }
      /* roving arrows among choice/row cards */
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        var cards = Array.from(content.querySelectorAll('.obx-choice:not([disabled]),.obx-row:not([style*="cursor:default"])'));
        if (!cards.length) return;
        var focused = document.activeElement && content.contains(document.activeElement) ? cards.indexOf(document.activeElement) : -1;
        var nextIdx = ev.key === 'ArrowDown' ? focused + 1 : focused - 1;
        if (nextIdx < 0) nextIdx = cards.length - 1;
        if (nextIdx >= cards.length) nextIdx = 0;
        ev.preventDefault();
        try { cards[nextIdx].focus({ preventScroll: false }); } catch (e) {}
      }
    });

    /* window resize → keep window in bounds (CSS handles; hook for future) */
  }

  function handleChoice(v, el) {
    var d = T.state.draft;
    var scr = T.state.screen;
    if (scr === 'where') {
      d.where = v;
      if (v === 'this') { nav('checks'); return; }
      if (v === 'existing') { nav('checks'); return; }
      if (v === 'server') { nav('checks'); return; }
    }
    if (scr === 'device_ready') {
      if (v === 'new') { d.kind = 'new'; nav('project_kind'); return; }
      if (v === 'existing') { d.kind = 'existing'; nav('existing_source'); return; }
      if (v === 'look') { finishAction('done'); return; }
    }
    if (scr === 'project_kind') {
      d.kind = v;
      if (v === 'new') { if (!d.name) d.name = ''; nav('new_project'); }
      else if (v === 'existing') nav('existing_source');
      else nav('restore');
      return;
    }
    if (scr === 'existing_source') { d.existing_source = v; d.kind = 'existing'; nav('new_project'); return; }
    if (scr === 'restore') { d.restore = v; d.kind = 'restore'; nav('review'); return; }
    if (scr === 'new_project') {
      if (v === 'fresh' || v === 'inherit') { d.like = v; syncChoice(el); return; }
      return;
    }
    if (scr === 'keep') {
      if (v === 'safety') { d.safety = d.safety === 'on' ? 'off' : 'on'; }
      if (v === 'online') {
        if (d.online) { d.online = null; }
        else { d.online = { provider: 'github', repoName: '', visibility: 'private' }; d.keep_open = 'online'; }
      }
      if (v === 'nas') {
        if (d.nas) { d.nas = null; }
        else { d.nas = { transport: 'ssh' }; d.keep_open = 'nas'; }
      }
      render('keep', { instant: true }); save(); return;
    }
  }
  function syncChoice(el) {
    var group = el.parentElement.querySelectorAll('[data-choice="' + el.getAttribute('data-choice') + '"]');
    group.forEach(function (g) { g.setAttribute('aria-pressed', String(g === el)); });
  }

  function advance() {
    var scr = T.state.screen;
    var d = T.state.draft;
    if (scr === 'welcome') { nav('where'); return; }
    if (scr === 'where') { if (d.where) nav('checks'); return; }
    if (scr === 'checks') return; /* auto */
    if (scr === 'device_ready') { d.kind = 'new'; nav('project_kind'); return; }
    if (scr === 'project_kind') return; /* handled by choice */
    if (scr === 'new_project') {
      if (!d.name || !d.name.trim()) return;
      if (d.kind === 'existing' && d.existing_source) { nav('keep'); return; }
      if (d.kind === 'restore') { nav('review'); return; }
      nav('keep'); return;
    }
    if (scr === 'existing_source') { if (d.existing_source) nav('new_project'); return; }
    if (scr === 'restore') { if (d.restore) nav('review'); return; }
    if (scr === 'keep') { nav('review'); return; }
    if (scr === 'review') { nav('preparing'); return; }
    if (scr === 'preparing') { if (T.state.committed) nav('power'); return; }
    if (scr === 'power') { nav('free_models'); return; }
    if (scr === 'free_models') { T.state.free_models = true; nav('finish'); return; }
    if (scr === 'finish') { finishAction('tour'); return; }
  }

  T.syncCta = function () {
    if (T.state.screen === 'new_project') {
      ctaEl.setAttribute('aria-disabled', (T.state.draft.name && T.state.draft.name.trim()) ? 'false' : 'true');
    }
  };

  /* ---------------- API (compatible surface) ---------------- */
  function exposeApi() {
    window.PM7_ONBOARDING_CINEMATIC = {
      schema_id: 'pm.glm.onboarding.v1',
      open: function (o) { open(o); return snapshot(); },
      close: function (reason) { close(reason || 'defer'); return snapshot(); },
      skip: function () { close('skip'); return snapshot(); },
      defer: function () { close('defer'); return snapshot(); },
      back: function () { back(); return snapshot(); },
      resume: function () { open({ screen: T.state.screen }); return snapshot(); },
      replay: function (o) {
        try { localStorage.removeItem('pm.glm.onboarding.done'); } catch (e) {}
        T.state.stack = [];
        open({ screen: 'welcome' });
        return snapshot();
      },
      snapshot: snapshot
    };
  }
  function snapshot() {
    return {
      open: T.state.open, screen: T.state.screen, draft: T.state.draft,
      committed: T.state.committed, receipt: T.state.receipt,
      mat: T.state.mat, mode: T.state.mode,
      concept_only: true
    };
  }

  /* fixture context */
  T.state.userName = 'you';
  T.state.existingProjects = [{ name: 'tastebook', id: 'p-001' }];
  T.state.backupList = [
    { id: 'bk-041', name: 'Book club website', date: 'Sep 2, 2026 · 4.2 GB' },
    { id: 'bk-037', name: 'Garden sensors', date: 'Aug 28, 2026 · 810 MB' }
  ];

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
