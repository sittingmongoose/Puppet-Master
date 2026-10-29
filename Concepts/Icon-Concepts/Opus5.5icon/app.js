/* Gallery for the Puppet Master logo concept (Opus 5.5). Every mark on the page comes from
   PMLogo.svg() in pm-logo.js; this file only lays the marks into mock surfaces and exports them. */
(function () {
  'use strict';
  const L = window.PMLogo, TH = L.THEMES, ORDER = L.THEME_ORDER;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;

  const S = {
    dir: 'pip', theme: 'friendly-dark', loader: 'swing', paused: false, reduced: false,
    dpr: (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1, ba: 'after', lock: 'auto', heroMood: 'idle'
  };
  try {
    const q = new URLSearchParams(location.search);
    if (TH[q.get('theme')]) S.theme = q.get('theme');
    if (q.get('dir') === 'mono') S.dir = 'mono';
    if (/^(swing|think|hop)$/.test(q.get('loader') || '')) S.loader = q.get('loader');
    if (q.get('reduced') === '1') S.reduced = true;
    if (q.get('dpr') === '1' || q.get('dpr') === '2') S.dpr = +q.get('dpr');
  } catch (e) { /* file:// without search is fine */ }
  if (root.getAttribute('data-reduced-motion') === '1') S.reduced = true;

  // Page surfaces per theme (the gallery chrome only; the marks take nothing from here).
  const PAGE = {
    'friendly-dark': { card: '#2A2731', page: 'radial-gradient(circle at 1px 1px, rgba(190,180,210,.07) 1px, transparent 1.5px) 0 0/18px 18px, #211E26' },
    'friendly-light': { card: '#FFFFFF', page: 'radial-gradient(circle at 1px 1px, rgba(122,109,140,.11) 1px, transparent 1.5px) 0 0/18px 18px, #FBF7F3' },
    // Glass sits on PMConcept7's own Ribbons wallpaper, under Liquid Glass's neutral sheet tint
    'glass-dark': { card: 'rgba(7,10,22,.66)', page: 'linear-gradient(rgba(4,6,13,.5), rgba(4,6,13,.5)), url(wall-ribbons-dark.webp) center / cover no-repeat, #04060D' },
    'glass-light': { card: 'rgba(255,255,255,.62)', page: 'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url(wall-ribbons-light.webp) center / cover no-repeat, #EEF1F6' },
    'basic-dark': { card: '#1E1E1E', page: '#121212' },
    'basic-light': { card: '#FFFFFF', page: '#EAECEF' },
    'retro-dark': { card: '#171A14', page: '#10120E', shadow: 'rgba(224,224,224,.45)' },
    'retro-light': { card: '#FAF7F2', page: '#F5F0E8', shadow: 'rgba(26,26,26,.35)' },
    'nier-light': { card: '#D1CDB7', page: 'repeating-linear-gradient(0deg, rgba(33,31,27,.045) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(33,31,27,.045) 0 1px, transparent 1px 28px), #CCC8B1' },
    'nier-dark': { card: '#36342C', page: 'repeating-linear-gradient(0deg, rgba(209,205,183,.04) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(209,205,183,.04) 0 1px, transparent 1px 28px), #2F2D26' }
  };
  const RADIUS = { friendly: [16, 10], glass: [18, 12], basic: [8, 6], retro: [0, 0], nier: [0, 0] };
  const MOODS = [
    ['idle', 'Idle', 'Nothing running. The default mark everywhere.'],
    ['working', 'Working', 'Agents are running. The only animated state.'],
    ['happy', 'Done', 'A run finished. Clears once you open it.'],
    ['alert', 'Needs you', 'A question or an approval is waiting.'],
    ['error', 'Error', 'A run failed or a tool broke.'],
    ['sleep', 'Paused', 'Orchestration paused, or offline.']
  ];

  /* ------------------------------------------------------------ helpers */
  const M = (o) => L.svg(Object.assign({ mark: S.dir, theme: S.theme, dpr: S.dpr, reduced: S.reduced }, o));
  const loaderOpts = () => ({ motion: S.dir === 'mono' ? 'swing' : S.loader });
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const isNier = (t) => TH[t || S.theme].family === 'nier';
  const counterpart = (scheme) => TH[S.theme].family + '-' + scheme;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 1800); }
  function lockStyle(t) {
    const th = TH[t];
    return `--wm-font:${th.font};--wm-weight:${th.weight};--wm-track:${th.track};--wm-size:14px;color:${th.text}`;
  }
  function lockup(t, opts) {
    const o = Object.assign({ px: 24, markOnly: false, motion: null }, opts || {});
    const th = TH[t];
    const svg = L.svg({ mark: S.dir, theme: t, px: o.px, dpr: S.dpr, decorative: !o.markOnly, title: 'Puppet Master' });
    return `<span class="pm-lockup${th.upper ? ' upper' : ''}" style="--mark:${o.px}px;${lockStyle(t)}"${o.markOnly ? ' title="Puppet Master"' : ''}><span class="pm-mark">${svg}</span>${o.markOnly ? '' : '<span class="pm-wm">Puppet Master</span>'}</span>`;
  }
  const ICON = {
    bell: '<svg class="sh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"/><path d="M9 17a3 3 0 0 0 6 0"/></svg>',
    search: '<svg class="sh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    moon: '<svg class="sh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    menu: '<svg class="sh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>'
  };

  /* ------------------------------------------------------------ theme */
  function applyTheme() {
    const th = TH[S.theme], pg = PAGE[S.theme];
    const set = (k, v) => root.style.setProperty(k, v);
    set('--bg', th.bg); set('--bar', th.bar); set('--text', th.text); set('--muted', th.muted); set('--line', th.line);
    set('--accent', th.accent); set('--font', th.font); set('--wm-weight', th.weight); set('--wm-track', th.track);
    set('--card', pg.card); set('--page-bg', pg.page);
    set('--radius', RADIUS[th.family][0] + 'px'); set('--radius-sm', RADIUS[th.family][1] + 'px');
    if (pg.shadow) set('--retro-shadow', pg.shadow);
    root.style.colorScheme = th.scheme;
    document.body.className = `fam-${th.family}` + (th.family === 'glass' ? ' glassy' : '') + (S.paused ? ' paused' : '');
    if (root.getAttribute('data-theme') !== S.theme) { applyTheme.self = true; root.setAttribute('data-theme', S.theme); }
    const fav = L.svg({ mark: S.dir, theme: S.theme, px: 16, tier: 'micro' });
    $('#favicon').href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fav);
  }

  /* ------------------------------------------------------------ controls */
  function buildControls() {
    $('#themeSel').innerHTML = ORDER.map((t) => `<option value="${t}">${TH[t].label}</option>`).join('');
    $('#swatches').innerHTML = ORDER.map((t) => {
      const th = TH[t], head = Array.isArray(th.head) ? th.head[1] : th.head;
      return `<button type="button" data-sw="${t}" title="${th.label}" aria-label="${th.label}" style="background:linear-gradient(135deg, ${th.bg} 50%, ${head} 50%)"></button>`;
    }).join('');
    document.addEventListener('click', (e) => {
      const b = e.target.closest('button, [data-theme-row]');
      if (!b) return;
      if (b.dataset.dir) { S.dir = b.dataset.dir; renderAll(); }
      else if (b.dataset.sw) setTheme(b.dataset.sw);
      else if (b.dataset.themeRow) setTheme(b.dataset.themeRow);
      else if (b.dataset.alt) setTheme(b.dataset.alt);
      else if (b.dataset.loader) { S.loader = b.dataset.loader; if (S.reduced && b.closest('#stylesRow')) { S.reduced = false; syncReducedAttr(); } renderAll(); }
      else if (b.dataset.reducedCard) { S.reduced = !S.reduced; syncReducedAttr(); renderAll(); }
      else if (b.dataset.dpr) { S.dpr = +b.dataset.dpr; renderAll(); }
      else if (b.dataset.ba) { S.ba = b.dataset.ba; renderTitlebar(); syncPressed(); }
      else if (b.dataset.lock) { S.lock = b.dataset.lock; renderTitlebar(); syncPressed(); }
      else if (b.dataset.mood) { S.heroMood = b.dataset.mood; renderHero(); }
      else if (b.id === 'playBtn') { S.paused = !S.paused; document.body.classList.toggle('paused', S.paused); syncPressed(); }
      else if (b.id === 'reducedBtn') { S.reduced = !S.reduced; syncReducedAttr(); renderAll(); }
      else if (b.dataset.dl) download(b.dataset.dl, b);
    });
    $('#themeSel').addEventListener('change', (e) => setTheme(e.target.value));
    // The Concept Hub drives theme and reduced motion through attributes on <html>.
    new MutationObserver(() => {
      if (applyTheme.self) { applyTheme.self = false; return; }
      const t = root.getAttribute('data-theme');
      const r = root.getAttribute('data-reduced-motion') === '1';
      let changed = false;
      if (TH[t] && t !== S.theme) { S.theme = t; changed = true; }
      if (r !== S.reduced) { S.reduced = r; changed = true; }
      if (changed) renderAll();
    }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-reduced-motion'] });
  }
  function syncReducedAttr() { root.setAttribute('data-reduced-motion', S.reduced ? '1' : '0'); }
  function setTheme(t) { if (!TH[t]) return; S.theme = t; renderAll(); }
  function syncPressed() {
    $$('[data-dir]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.dir === S.dir)));
    $$('#loaderSeg [data-loader]').forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.loader === S.loader)); b.disabled = S.dir === 'mono' && b.dataset.loader !== 'swing'; });
    $$('[data-sw]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sw === S.theme)));
    $$('[data-dpr]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.dpr === S.dpr)));
    $$('[data-ba]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ba === S.ba)));
    $$('[data-lock]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lock === S.lock)));
    $('#playBtn').setAttribute('aria-pressed', String(S.paused)); $('#playBtn').textContent = S.paused ? 'Play' : 'Pause';
    $('#reducedBtn').setAttribute('aria-pressed', String(S.reduced));
    $('#themeSel').value = S.theme;
    $('#loaderSeg').parentElement.style.opacity = S.dir === 'mono' ? .5 : 1;
  }

  /* ------------------------------------------------------------ hero */
  const PRINCIPLES = {
    pip: [
      ['ctl', '<b>The control is you.</b> The crossed marionette bar is the person running the show; the strings say Puppet Master directs the work rather than doing it blind.'],
      ['brace', '<b>The head is a pair of braces.</b> <code>{ }</code> drawn as one shape: the brace points become little ears. Code, made friendly.'],
      ['face', '<b>The face reports status.</b> Idle, working, done, needs you, error, paused. The tray icon says what is happening without a colored badge.'],
      ['px', '<b>Built for 16 px.</b> Hand-placed pixels at tray size, a heavier cut for the 40 px title bar, full detail from there up.']
    ],
    mono: [
      ['ctl', '<b>Your original idea, redrawn.</b> The crossed control and the strings stay; the X is flattened to 20 degrees so it no longer reads as a close button.'],
      ['brace', '<b>The letters are the puppet.</b> P hangs from one string and M from two, and they step in turn while work runs.'],
      ['face', '<b>No face, so no moods.</b> Status in the tray falls back to a colored dot, as most apps do.'],
      ['px', '<b>Legible at 16 px.</b> PM survives as a two-letter sprite, but loses the control and strings first.']
    ]
  };
  function prIcon(k) {
    const c = 'currentColor';
    const m = {
      ctl: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M4 5l16 6M4 11l16-6M8 9v8M16 9v8"/></svg>`,
      brace: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4c-2 0-2 1.5-2 3v2c0 1.5-1 3-2.5 3C5 12 6 13.5 6 15v2c0 1.5 0 3 2 3M16 4c2 0 2 1.5 2 3v2c0 1.5 1 3 2.5 3-1.5 0-2.5 1.5-2.5 3v2c0 1.5 0 3-2 3"/></svg>`,
      face: `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="5"/><path d="M9 10v2M15 10v2M9.5 15.5q2.5 1.6 5 0"/></svg>`,
      px: `<svg viewBox="0 0 24 24" fill="${c}"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" opacity=".55"/><path d="M10 10h4v4h-4z"/></svg>`
    };
    return `<span class="ic" style="color:var(--accent)">${m[k]}</span>`;
  }
  function renderHero() {
    const pip = S.dir === 'pip';
    const moodChips = pip ? MOODS.filter((m) => m[0] !== 'working').map(([k, n]) =>
      `<button type="button" class="chip" data-mood="${k}" aria-pressed="${S.heroMood === k}">${M({ px: 20, mood: k, decorative: true })}${n}</button>`).join('') : '';
    const heroMood = pip ? S.heroMood : 'idle';
    $('#hero').innerHTML = `
      <div>
        <p class="eyebrow">Puppet Master · identity concept</p>
        <h1>${pip ? 'Meet <em>Pip</em>.' : '<em>PM</em>, on strings.'}</h1>
        <p class="lede">${pip
          ? 'A small agent on strings, held by the crossed control of whoever is running the show. Puppet Master is the orchestrator and Pip is every agent it directs: approachable, a little mischievous, and obviously about code.'
          : 'The conservative direction: your reference mark redrawn for small sizes and real themes. It keeps the letters and gives up the character.'}</p>
        <ul class="principles">${PRINCIPLES[S.dir].map(([k, t]) => `<li>${prIcon(k)}<span>${t}</span></li>`).join('')}</ul>
      </div>
      <div class="stage">
        <div class="card pane"><span class="tag">${isNier() ? 'Static in NieR' : 'Animated loader'}</span>${M({ px: 168, ...loaderOpts() })}<span class="cap">${isNier() ? 'NieR keeps its own loader' : (S.reduced ? 'Reduced motion' : loaderName())}</span></div>
        <div class="card pane"><span class="tag static">Static mark</span>${M({ px: 168, mood: heroMood })}<span class="cap">${pip ? MOODS.find((m) => m[0] === heroMood)[1] : 'Monogram'}</span></div>
        <div class="card pane wide">
          <div class="moodbar" role="group" aria-label="Pip's mood">${moodChips || '<span class="note">The monogram has no face, so it has no moods.</span>'}</div>
          <div style="display:flex;gap:12px;align-items:center">${M({ form: 'tile', px: 64 })}${M({ px: 24 })}${M({ px: 16 })}</div>
        </div>
      </div>`;
  }
  const loaderName = () => S.dir === 'mono' ? 'Step' : { swing: 'Swing', think: 'Think', hop: 'Hop' }[S.loader];

  /* ------------------------------------------------------------ title bar */
  const SHELLS = [
    ['full', 'Full', 1240, 'Mark and name, all six tabs, search field.'],
    ['narrow', 'Narrow', 860, 'Tabs start to collapse; the lockup does not shrink.'],
    ['squeezed', 'Squeezed', 540, 'The name drops and the mark holds the corner on its own.']
  ];
  function shellHtml(kind, width) {
    const th = TH[S.theme];
    const markOnly = S.lock === 'mark' || kind === 'squeezed';
    const brand = S.ba === 'before'
      ? `<span class="old-name" style="${lockStyle(S.theme)};font-family:${th.font}">${th.upper ? 'PUPPET MASTER' : 'Puppet Master'}</span>`
      : lockup(S.theme, { markOnly });
    const tabs = kind === 'full' ? ['Home', 'Projects', 'Planning Wizard', 'Orchestrator', 'Usage', 'Settings']
      : kind === 'narrow' ? ['Home', 'Projects', 'Orchestrator', 'More ▾'] : ['Home ▾'];
    const lines = (n, hi) => Array.from({ length: n }, (_, i) => `<div class="ln${hi === i ? ' hi' : ''}" style="width:${[86, 64, 92, 48, 74, 58, 80][i % 7]}%"></div>`).join('');
    const work = M({ px: 18, ...loaderOpts(), title: 'Working' });
    return `<div class="shell ${kind}" style="width:${width}px">
      <div class="sh-title">${brand}
        <span class="sh-proj">${kind === 'squeezed' ? 'taste…' : 'tastebook'} <i>▼</i></span>
        <span class="sh-tabs">${tabs.map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${t}</span>`).join('')}</span>
        <span class="sh-gap"></span>${ICON.bell}
        ${kind === 'full' ? '<span class="sh-search">Search files, commands, settings...</span>' : ICON.search}${ICON.moon}
      </div>
      <div class="sh-body">
        <div class="sh-act"><i class="on"></i><i></i><i></i><i></i><i></i></div>
        <div class="sh-left"><span class="sh-head">Files</span>${lines(7, 2)}</div>
        <div class="sh-main"><span class="sh-head">main.rs</span>${lines(10)}</div>
        <div class="sh-chat"><span class="sh-head">Chat</span><div class="bubble">${lines(2)}</div>${lines(3)}
          <div class="working"><span class="lm">${work}</span><span>Working</span><span class="dim">· Resolving the active thread</span></div></div>
      </div>
      <div class="sh-status"><span><span class="dot"></span>Ready</span><span>~/Puppet-Master</span><span>main</span><span style="margin-left:auto">${kind === 'squeezed' ? '' : 'Runs on this computer'}</span></div>
    </div>`;
  }
  function renderTitlebar() {
    $('#titlebarSub').innerHTML = `The top-left logo is <b>static</b>: a 24 px mark in the 40 px bar beside the theme's own wordmark. Below are three widths: full, narrow, and squeezed (mark only). The chat's Working row in the same mock uses the <b>animated</b> loader, so both variants are visible side by side.`;
    $('#shells').innerHTML = SHELLS.map(([k, n, w, d]) => `<div class="shell-row"><div class="meta"><h3>${n}</h3><span class="w">${w} px</span><span class="note">${d}</span></div><div class="shell-scroll">${shellHtml(k, w)}</div></div>`).join('');
    renderTbZoom();
  }
  async function renderTbZoom() {
    const box = $('#tbZoom');
    box.innerHTML = `<div style="display:grid;gap:4px"><h3>The corner, magnified</h3><span class="note">Real pixels at 1x (24 px) and 2x (48 px), enlarged without smoothing.</span></div>
      <div class="zoomrow" id="tbZoomRow"></div>`;
    const row = $('#tbZoomRow');
    for (const d of [1, 2]) {
      const svg = L.svg({ mark: S.dir, theme: S.theme, px: 24 * d });
      const c = await magnify(svg, 24 * d, d === 1 ? 5 : 2.5, TH[S.theme].bar);
      const wrap = document.createElement('div'); wrap.className = 'pix';
      wrap.append(c); wrap.insertAdjacentHTML('beforeend', `<span>${24 * d} px · ${d}x · ${L.pickTier({ px: 24, dpr: d }, TH[S.theme])} tier</span>`);
      row.append(wrap);
    }
  }

  /* ------------------------------------------------------------ live PM7 */
  let liveFrame = null;
  // A capture of the real PMConcept7 top bar with the logo swapped in. The shareable single-file
  // build carries it inline (it cannot carry the 32 MB app), and a browser that blocks the live
  // frame shows it too.
  function liveFigure() {
    const src = (window.PM_STANDALONE && window.PM_STANDALONE.live) || 'in-pmconcept7.webp';
    return `<figure class="live-shot"><img src="${src}" width="820" height="194" alt="The real PMConcept7 top bar with Pip in place of the text wordmark, in Friendly Dark, Glass Dark, Retro Light and NieR Light">
      <figcaption class="note">Captured from the real PMConcept7 with the logo swapped in at runtime, at 2x: Friendly Dark, Glass Dark, Retro Light, NieR Light.</figcaption></figure>`;
  }
  function renderLiveShell() {
    if (window.PM_STANDALONE) {
      $('#live .sub').innerHTML = 'The real PMConcept7, with its text wordmark swapped for this logo at runtime (PMConcept7 itself is not edited). The full gallery in the repository can load PMConcept7 live; this shareable copy carries a capture instead.';
      $('#liveBox').innerHTML = liveFigure();
      return;
    }
    $('#liveBox').innerHTML = `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button type="button" class="btn" id="liveLoad">${ICON.play}Load PMConcept7 with this logo</button>
        <button type="button" class="btn ghost" id="liveMatch" disabled>Match this page's theme</button>
        <span class="note" id="liveMsg">About 32 MB; loads only when asked.</span></div><div id="liveHost"></div>`;
    $('#liveLoad').addEventListener('click', loadLive);
    $('#liveMatch').addEventListener('click', () => {
      const d = liveDoc(); if (!d) return;
      const th = TH[S.theme], h = d.documentElement;
      // NieR Mode lives in PMConcept7's own settings; writing them here would change the real
      // PMConcept7 on this origin, so NieR is left to its Settings page.
      if (th.family === 'nier') { $('#liveMsg').textContent = 'Turn on NieR Mode in PMConcept7 (Settings, General, Visual); the logo follows it.'; return; }
      h.setAttribute('data-theme', S.theme);
      if (th.family === 'glass') h.setAttribute('data-lg', 'on'); else h.removeAttribute('data-lg');
      $('#liveMsg').textContent = 'Matched ' + th.label + '.';
    });
  }
  function liveDoc() { try { return liveFrame && liveFrame.contentDocument; } catch (e) { return null; } }
  function loadLive() {
    const host = $('#liveHost'); host.innerHTML = '';
    liveFrame = document.createElement('iframe');
    liveFrame.title = 'PMConcept7 with the new logo';
    liveFrame.src = '../../PMConcept7.html?o55=off';
    host.append(liveFrame);
    $('#liveMsg').textContent = 'Loading PMConcept7…';
    liveFrame.addEventListener('load', () => {
      const d = liveDoc();
      if (!d || !d.documentElement) { $('#liveMsg').textContent = 'The browser blocks reaching into the frame from a file:// page. Open this concept through the Concept Hub to see the swap; here is a capture.'; host.innerHTML = liveFigure(); return; }
      $('#liveMatch').disabled = false;
      $('#liveMsg').textContent = 'Swapped. Use PMConcept7\'s own theme menu, or match this page.';
      const closeSetup = () => {
        const onb = d.getElementById('pm-o55-onboarding');
        if (!onb || !d.documentElement.hasAttribute('data-o55-open')) return;
        const b = Array.from(onb.querySelectorAll('button')).find((x) => /^\s*close\s*$/i.test(x.textContent));
        if (b) b.click();
      };
      [300, 1200, 2500].forEach((t) => setTimeout(closeSetup, t));
      injectLive();
      new MutationObserver(injectLive).observe(d.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
    });
  }
  function injectLive() {
    const d = liveDoc(); if (!d) return;
    const h = d.documentElement, name = d.querySelector('.title-bar .app-name');
    if (!name) return;
    if (!d.getElementById('pmx-style')) {
      const st = d.createElement('style'); st.id = 'pmx-style';
      st.textContent = '.title-bar .app-name.pmx{display:inline-flex;align-items:center;gap:8px}.title-bar .app-name.pmx svg{display:block;width:24px;height:24px;flex:0 0 auto}';
      d.head.append(st);
    }
    const pm7 = h.getAttribute('data-theme') || 'friendly-dark';
    const key = h.getAttribute('data-o55-nier') === 'on' ? 'nier-' + (/-light$/.test(pm7) ? 'light' : 'dark') : pm7;
    if (!TH[key]) return;
    const sig = S.dir + '|' + key;
    if (name.dataset.pmx === sig) return;
    const label = name.dataset.pmxLabel || name.textContent.trim() || 'Puppet Master';
    name.dataset.pmxLabel = label; name.dataset.pmx = sig; name.classList.add('pmx');
    name.innerHTML = L.svg({ mark: S.dir, theme: key, px: 24, dpr: liveFrame.contentWindow.devicePixelRatio || 1, decorative: true }) + `<span>${esc(label)}</span>`;
  }

  /* ------------------------------------------------------------ app icon */
  const PLACE = {
    folder: '<svg viewBox="0 0 64 64"><defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#2f8ae0"/></linearGradient></defs><rect width="64" height="64" rx="14.4" fill="url(#pf)"/><path d="M14 22a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff" opacity=".92"/></svg>',
    term: '<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14.4" fill="#2b2b30"/><rect x="2" y="2" width="60" height="60" rx="12.6" fill="none" stroke="#fff" stroke-opacity=".1"/><path d="M17 24l9 8-9 8" fill="none" stroke="#e8e8e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 41h15" stroke="#e8e8e8" stroke-width="4" stroke-linecap="round"/></svg>',
    globe: '<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14.4" fill="#f4f4f6"/><circle cx="32" cy="32" r="17" fill="none" stroke="#3a7bd5" stroke-width="3"/><ellipse cx="32" cy="32" rx="7.5" ry="17" fill="none" stroke="#3a7bd5" stroke-width="3"/><path d="M15 32h34M18 23h28M18 41h28" stroke="#3a7bd5" stroke-width="2.5"/></svg>',
    notes: '<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14.4" fill="#ffd45e"/><rect y="20" width="64" height="44" rx="0" fill="#fffaf0"/><rect width="64" height="64" rx="14.4" fill="none"/><path d="M14 32h36M14 40h36M14 48h24" stroke="#d9c9a8" stroke-width="2.5" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14.4" fill="#8e8e96"/><circle cx="32" cy="32" r="12" fill="none" stroke="#f2f2f2" stroke-width="6" stroke-dasharray="6 3.4"/><circle cx="32" cy="32" r="6" fill="#f2f2f2"/></svg>'
  };
  const appIcon = (t, px, extra) => px <= 24
    ? L.svg(Object.assign({ mark: S.dir, theme: t, px, dpr: S.dpr }, extra))
    : L.svg(Object.assign({ mark: S.dir, theme: t, px, dpr: S.dpr, form: 'tile' }, extra));
  function renderIcons() {
    const th = TH[S.theme];
    const dock = (scheme) => {
      const t = counterpart(scheme);
      const tiles = ['folder', 'globe', 'term'].map((k) => `<div class="app">${PLACE[k]}</div>`).join('');
      const tail = ['notes', 'gear'].map((k) => `<div class="app">${PLACE[k]}</div>`).join('');
      return `<div class="dock-scene ${scheme}"><div class="dock">${tiles}<div class="app pm"><span class="tip">Puppet Master</span>${L.svg({ mark: S.dir, theme: t, px: 64, dpr: S.dpr, form: 'tile' })}</div>${tail}</div></div>`;
    };
    const taskbar = (scheme) => {
      const t = counterpart(scheme);
      const gen = (c) => `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="${c}"/></svg>`;
      return `<div class="taskbar ${scheme}"><div class="tb">${gen(scheme === 'dark' ? '#5a5a5a' : '#b9b9b9')}</div><div class="tb">${PLACE.folder}</div><div class="tb">${PLACE.globe}</div><div class="tb on">${L.svg({ mark: S.dir, theme: t, px: 24, dpr: S.dpr })}</div><div class="tb">${PLACE.term}</div></div>`;
    };
    const ladder = [256, 128, 64, 48, 32, 24, 16].map((p) => `<div class="rung">${appIcon(S.theme, p)}<span>${p}${p <= 24 ? ' · mark' : ''}</span></div>`).join('');
    const alts = ORDER.map((t) => `<button type="button" data-alt="${t}" aria-pressed="${t === S.theme}">${L.svg({ mark: S.dir, theme: t, px: 64, form: 'tile', dpr: S.dpr })}${TH[t].label}</button>`).join('');
    $('#iconsGrid').innerHTML = `
      <div class="card" style="padding:14px;display:grid;gap:4px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h3>macOS Dock</h3><span class="note">${th.family === 'nier' || th.family === 'retro' ? th.label + ' tile' : TH[counterpart('dark')].label + ' / ' + TH[counterpart('light')].label}</span></div>
        ${dock('dark')}${dock('light')}
        <h3 style="margin:14px 0 0">Windows taskbar · 24 px, no tile</h3>${taskbar('dark')}${taskbar('light')}
      </div>
      <div style="display:grid;gap:14px;align-content:start">
        <div class="card"><div style="padding:14px 18px 0"><h3>Size ladder · ${th.label}</h3></div><div class="ladder">${ladder}</div></div>
        <div class="card"><div style="padding:14px 18px 0"><h3>Alternate app icons</h3><span class="note">One per theme. Click one to switch the page.</span></div><div class="alts" role="group" aria-label="Alternate icons">${alts}</div></div>
      </div>`;
  }

  /* ------------------------------------------------------------ tray */
  const WIFI = (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"><path d="M2.5 9a14 14 0 0 1 19 0M6 12.5a9 9 0 0 1 12 0M9.5 16a4 4 0 0 1 5 0"/><circle cx="12" cy="19" r="1.2" fill="${c}"/></svg>`;
  const BATT = (c) => `<svg width="24" height="14" viewBox="0 0 26 14"><rect x="1" y="1.5" width="21" height="11" rx="3" fill="none" stroke="${c}" stroke-opacity=".5"/><rect x="3" y="3.5" width="14" height="7" rx="1.5" fill="${c}"/><rect x="23.3" y="5" width="1.7" height="4" rx=".8" fill="${c}" opacity=".5"/></svg>`;
  const VOL = (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="${c}"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;
  const badge = (mood) => ({ happy: '#3DD68C', alert: '#FFB74D', error: '#EF5350', sleep: '#9E9E9E' })[mood];
  function trayIcon(scheme, mood, opts) {
    const ink = scheme === 'dark' ? '#FFFFFF' : '#000000';
    const working = mood === 'working';
    const o = Object.assign({ mark: S.dir, theme: S.theme, form: 'tray', ink, px: 16, dpr: S.dpr, reduced: S.reduced }, opts || {});
    if (working) o.motion = S.dir === 'mono' ? 'swing' : S.loader; else o.mood = mood;
    let s = L.svg(o);
    if (S.dir === 'mono' && badge(mood)) s = `<span style="position:relative;display:block;width:${o.px}px;height:${o.px}px">${s}<i style="position:absolute;right:-2px;top:-2px;width:7px;height:7px;border-radius:50%;background:${badge(mood)};box-shadow:0 0 0 1.5px ${scheme === 'dark' ? '#202024' : '#f6f6f6'}"></i></span>`;
    return s;
  }
  function winIcon(scheme, mood) {
    const t = counterpart(scheme);
    const o = { mark: S.dir, theme: t, px: 16, dpr: S.dpr, reduced: S.reduced };
    if (mood === 'working') o.motion = S.dir === 'mono' ? 'swing' : S.loader; else o.mood = mood;
    let s = L.svg(o);
    if (S.dir === 'mono' && badge(mood)) s = `<span style="position:relative;display:block;width:16px;height:16px">${s}<i style="position:absolute;right:-2px;top:-2px;width:7px;height:7px;border-radius:50%;background:${badge(mood)}"></i></span>`;
    return s;
  }
  function renderTray() {
    $('#traySub').innerHTML = S.dir === 'pip'
      ? 'macOS gets <b>template images</b>: one ink plus transparency, so the system tints them for light, dark and highlighted menu bars. Windows gets the <b>color</b> mark. Pip\'s face is the status, so no badge is needed, and Working is a four-frame flip a tray can actually play by swapping images.'
      : 'macOS gets <b>template images</b> and Windows the <b>color</b> mark. The monogram has no face, so status rides on a colored dot.';
    const mb = (scheme, mood, open) => {
      const c = scheme === 'dark' ? '#f2f2f2' : '#111';
      return `<div class="menubar ${scheme}"><span class="mi pm${open ? ' open' : ''}">${trayIcon(scheme, mood)}</span><span class="mi">${WIFI(c)}</span><span class="mi">${BATT(c)}</span><span>Mon 26 Oct 9:41</span></div>`;
    };
    const menu = (scheme) => `<div class="menu-pop ${scheme}"><div class="mh">${L.svg({ mark: S.dir, theme: counterpart(scheme), px: 20, dpr: S.dpr })}Puppet Master</div>
      <div class="mr">3 agents working <span>tastebook</span></div><div class="mr">Plan review needs you <span>harbor</span></div><hr>
      <div class="mr">Open Puppet Master <span>⌘O</span></div><div class="mr">Pause all runs <span>⌘.</span></div><hr><div class="mr">Quit</div></div>`;
    const wt = (scheme, mood) => {
      const c = scheme === 'dark' ? '#fff' : '#111';
      return `<div class="wintray ${scheme}"><span class="ti" style="font-size:11px">^</span><span class="ti hot">${winIcon(scheme, mood)}</span><span class="ti">${WIFI(c)}</span><span class="ti">${VOL(c)}</span><span class="clock">9:41 AM<br>10/26/2026</span></div>`;
    };
    $('#trayGrid').innerHTML = `
      <div class="card" style="padding:14px;display:grid;gap:10px"><h3>macOS menu bar · template</h3>${mb('light', 'working')}${mb('dark', 'alert', true)}${menu('dark')}</div>
      <div class="card" style="padding:14px;display:grid;gap:10px;align-content:start"><h3>Windows system tray · color</h3>${wt('light', 'idle')}${wt('dark', 'working')}${wt('dark', 'happy')}
        <span class="note">Windows draws tray icons at 16 px on a 100% display and 20 to 24 px at 125 to 150%; the generator picks the sprite or the heavier vector cut to match.</span></div>`;
    $('#stateStrip').innerHTML = MOODS.map(([k, n, d]) => `<div class="state"><div class="pair">
        <div style="background:#f6f6f6">${trayIcon('light', k)}</div><div style="background:#202024">${trayIcon('dark', k)}</div><div style="background:#1c1c1c">${winIcon('dark', k)}</div></div>
        <div><b>${n}</b>${d}</div></div>`).join('');
  }

  /* ------------------------------------------------------------ loading */
  function renderLoading() {
    const nier = isNier();
    $('#loadingSub').innerHTML = 'Loaders are separate animated files; nothing that should be still ever moves. The motion is a small rig: the control rocks, Pip hangs from it, and both strings are solved again for every frame, so they stay tied the whole way through: each one hangs from a screw eye under the bar and ends in a matching eye on Pip\'s head. Each family moves the way its theme already moves: <b>Friendly</b> springs, <b>Glass</b> glides, <b>Basic</b> eases, <b>Retro</b> flips eight pixel frames with the strings redrawn in each. With reduced motion nothing travels: ' + (S.dir === 'pip' ? 'the control fades in and out and Pip blinks.' : 'the letters fade in and out in turn.');
    $('#nierNote').innerHTML = nier ? `<div class="card nier-note" style="margin-bottom:14px">${M({ px: 40 })}<div><b>NieR keeps its own loading sequence.</b><div class="note">Pip appears static in NieR (title bar, icon, tray, states) and is never animated there. The cards below show the static mark where a loader would sit in other themes.</div></div></div>` : '';
    const lo = loaderOpts();
    const skel = (n) => Array.from({ length: n }, (_, i) => `<div class="ln" style="width:${[92, 70, 84, 56][i % 4]}%"></div>`).join('');
    $('#loadGrid').innerHTML = `
      <div class="card splash"><span class="tag">${nier ? 'Static' : 'Launch'}</span>${M({ px: 128, ...lo })}<div><div class="t">Starting Puppet Master</div><div class="s">Connecting 3 agents to tastebook</div></div><div class="bar"><i></i></div></div>
      <div class="ctxcol">
        <div class="card ctx"><div class="h"><h3>Chat · Working row</h3><span>18 px</span></div>
          <div class="working" style="margin:0"><span class="lm">${M({ px: 18, ...lo })}</span><span>Working</span><span class="dim">· Resolving the active thread</span></div></div>
        <div class="card ctx"><div class="h"><h3>Button · busy</h3><span>16 px</span></div>
          <span class="busy-btn">${M({ px: 16, ...lo })}Running plan…</span></div>
        <div class="card ctx"><div class="h"><h3>Tab · project switching</h3><span>14 px</span></div>
          <div style="display:flex;gap:8px;align-items:center;font-size:13px"><span style="display:block;width:14px;height:14px">${M({ px: 14, ...lo })}</span>harbor</div></div>
      </div>
      <div class="ctxcol">
        <div class="card ctx"><div class="h"><h3>Panel · loading</h3><span>40 px</span></div>
          <div class="panel-load">${M({ px: 40, ...lo })}<div style="display:grid;gap:7px">${skel(3)}</div></div></div>
        <div class="card ctx"><div class="h"><h3>Notification · finished</h3><span>static, 28 px</span></div>
          <div class="notif">${M({ px: 28, mood: S.dir === 'pip' ? 'happy' : 'idle' })}<div><div class="t">Run finished</div><div class="s">tastebook · 12 files changed</div></div></div>
          <div class="notif">${M({ px: 28, mood: S.dir === 'pip' ? 'alert' : 'idle' })}<div><div class="t">Approval needed</div><div class="s">harbor · plan review</div></div></div></div>
      </div>`;
    const styles = S.dir === 'mono'
      ? [['swing', 'Step', 'Letters step in turn while the control rocks.']]
      : [['swing', 'Swing', 'Pip sways on its strings and glances where it is going. The default.'], ['think', 'Think', 'The face becomes the three-dot typing indicator. For chat.'], ['hop', 'Hop', 'A small bounce on the strings. For short waits.']];
    $('#stylesRow').innerHTML = styles.map(([k, n, d]) => `<button type="button" class="card style-card" data-loader="${k}" aria-pressed="${!S.reduced && S.loader === k}">${L.svg({ mark: S.dir, theme: S.theme, px: 76, dpr: S.dpr, motion: k })}<b>${n}</b><span>${d}</span></button>`).join('') +
      `<button type="button" class="card style-card" data-reduced-card="1" aria-pressed="${S.reduced}">${L.svg({ mark: S.dir, theme: S.theme, px: 76, dpr: S.dpr, motion: S.dir === 'mono' ? 'swing' : S.loader, reduced: true })}<b>Reduced motion</b><span>Opacity only. Follows the OS setting, PMConcept7's switch and this page's toggle.</span></button>`;
  }

  /* ------------------------------------------------------------ moods */
  function renderMoods() {
    if (S.dir === 'mono') {
      $('#moodGrid').innerHTML = MOODS.map(([k, n, d]) => `<div class="card mood"><div class="ms">${k === 'working' ? M({ px: 64, motion: 'swing' }) : M({ px: 64 })}${badge(k) ? `<i style="width:10px;height:10px;border-radius:50%;background:${badge(k)}"></i>` : ''}</div><b>${n}</b><p>${d}</p></div>`).join('');
      return;
    }
    $('#moodGrid').innerHTML = MOODS.map(([k, n, d]) => {
      const big = k === 'working' ? M({ px: 72, motion: S.loader }) : M({ px: 72, mood: k });
      const s24 = k === 'working' ? M({ px: 24, motion: S.loader, tier: TH[S.theme].pixel ? 'pixel' : 'small' }) : M({ px: 24, mood: k });
      const s16 = k === 'working' ? M({ px: 16, motion: S.loader, tier: 'micro' }) : M({ px: 16, mood: k, tier: 'micro' });
      return `<div class="card mood"><div class="ms">${big}${s24}${s16}</div><b>${n}</b><p>${d}</p></div>`;
    }).join('');
  }

  /* ------------------------------------------------------------ matrix */
  function renderMatrix() {
    const rows = ORDER.map((t) => {
      const th = TH[t];
      const loader = th.noMotion ? '<span class="na">Static · NieR loader</span>' : L.svg({ mark: S.dir, theme: t, px: 32, dpr: S.dpr, reduced: S.reduced, motion: S.dir === 'mono' ? 'swing' : S.loader });
      const moods = S.dir === 'pip' ? ['happy', 'alert', 'error', 'sleep'].map((m) => L.svg({ mark: 'pip', theme: t, px: 24, dpr: S.dpr, mood: m })).join('') : '<span class="na">No moods</span>';
      return `<tr data-theme-row="${t}" style="cursor:pointer${t === S.theme ? ';outline:2px solid var(--accent);outline-offset:-2px' : ''}">
        <td><span class="tname">${th.label}</span></td>
        <td><span class="lockcell" style="background:${/^rgba/.test(th.bar) ? th.bg : th.bar};border:1px solid ${th.line}">${lockup(t)}</span></td>
        <td><span class="cellbg" style="background:${th.bg}">${L.svg({ mark: S.dir, theme: t, px: 48, dpr: S.dpr })}</span></td>
        <td><span class="cellbg" style="background:${th.bg}">${L.svg({ mark: S.dir, theme: t, px: 56, dpr: S.dpr, form: 'tile' })}</span></td>
        <td><span class="cellbg" style="background:${th.scheme === 'dark' ? '#202024' : '#f6f6f6'}">${L.svg({ mark: S.dir, theme: t, px: 16, dpr: S.dpr, form: 'tray', ink: th.scheme === 'dark' ? '#fff' : '#000' })}</span></td>
        <td><span class="cellbg" style="background:${th.bg}">${loader}</span></td>
        <td><span class="cellbg" style="background:${th.bg}">${moods}</span></td></tr>`;
    }).join('');
    $('#matrix').innerHTML = `<table><thead><tr><th>Theme</th><th>Title bar · static</th><th>Mark</th><th>App icon</th><th>Tray</th><th>Loader · animated</th><th>States</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  /* ------------------------------------------------------------ pixels */
  function rasterize(svg, size) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); x.drawImage(img, 0, 0, size, size); res(c); };
      img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  async function magnify(svg, size, k, bg) {
    const src = await rasterize(svg, size);
    const c = document.createElement('canvas'); c.width = c.height = Math.round(size * k); c.className = 'px';
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    if (bg && !/rgba/.test(bg)) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  let pixJob = 0;
  async function renderPixels() {
    const job = ++pixJob, grid = $('#pixGrid'); grid.innerHTML = '';
    const th = TH[S.theme];
    for (const p of [16, 18, 20, 24, 28, 32, 40, 48]) {
      const svg = L.svg({ mark: S.dir, theme: S.theme, px: p, dpr: 1 });
      const c = await magnify(svg, p, 112 / p, th.bg);
      if (job !== pixJob) return;
      const tier = L.pickTier({ px: p, dpr: 1 }, th);
      const cell = document.createElement('div'); cell.className = 'pix';
      cell.innerHTML = `<div class="real" style="background:${th.bg};padding:0 10px;border-radius:6px">${svg}</div>`;
      cell.append(c); cell.insertAdjacentHTML('beforeend', `<span>${p} px · ${tier}</span>`);
      grid.append(cell);
    }
    for (const ink of ['#000', '#fff']) {
      const p = 16, svg = L.svg({ mark: S.dir, theme: S.theme, px: p, form: 'tray', ink });
      const bg = ink === '#000' ? '#f6f6f6' : '#202024';
      const c = await magnify(svg, p, 7, bg);
      if (job !== pixJob) return;
      const cell = document.createElement('div'); cell.className = 'pix';
      cell.append(c); cell.insertAdjacentHTML('beforeend', `<span>tray 16 · ${ink === '#000' ? 'black' : 'white'}</span>`);
      grid.append(cell);
    }
  }

  /* ------------------------------------------------------------ specs */
  function constructionSvg() {
    const th = TH[S.theme];
    const ink = th.muted, acc = th.accent;
    const pixel = th.pixel && S.dir === 'pip';
    const mark = (pixel ? L.svg({ mark: 'pip', theme: S.theme, px: 64, tier: 'pixel', dpr: 1 }).replace(/viewBox="[^"]*"/, '') : L.svg({ mark: S.dir, theme: S.theme, px: 64, tier: 'full' }))
      .replace(/^<svg[^>]*>/, (m0) => pixel ? '<svg x="0" y="0" width="64" height="64" viewBox="0 0 32 32" shape-rendering="crispEdges">' : '<g>').replace(/<\/svg>$/, pixel ? '</svg>' : '</g>');
    const lab = (x, y, t) => `<text x="${x}" y="${y}" font-family="system-ui, sans-serif" font-size="2.5" fill="${th.text}">${t}</text>`;
    const lead = (x1, y1, x2, y2, a, b) => `<path d="M${x1} ${y1}L${x2} ${y2}H${x2 + 1}" fill="none" stroke="${acc}" stroke-width=".3"/><circle cx="${x1}" cy="${y1}" r=".7" fill="${acc}"/>` + lab(x2 + 1.6, y2 + .9, a) + (b ? lab(x2 + 1.6, y2 + 4, b) : '');
    let guides = '';
    const step = pixel ? 2 : 8;
    for (let i = 0; i <= 64; i += step) guides += `<path d="M${i} 0V64M0 ${i}H64" stroke="${ink}" stroke-opacity="${pixel ? .16 : .18}" stroke-width="${pixel ? .08 : .15}"/>`;
    guides += `<path d="M32 0V64" stroke="${acc}" stroke-opacity=".5" stroke-width=".2" stroke-dasharray="1 1"/>`;
    let notes;
    if (S.dir === 'mono') notes = lead(52, 9, 70, 8, 'Control: two sticks at ±18°') + lead(34.5, 28, 70, 24, 'Strings to the P stem and both M stems') + lead(20, 45, 70, 44, 'Monoline letters, 7 units');
    else if (pixel) notes = lead(14, 17, 70, 6, 'Sticks: 2 px staircases, the back one', 'in shade') + lead(14, 23, 70, 18, 'Strings: pixel lines from stick to head,', 'redrawn for every frame') + lead(40, 40, 70, 32, 'Face stamped out of the head') + lead(48, 49, 70, 44, 'Cheeks: Retro\'s orange or pink') + lead(32, 58, 70, 56, '32 px grid: 16 and 24 px grids', 'exist for small sizes');
    else if (th.nier) notes = lead(32, 14.5, 70, 5, 'Diamond pin where the sticks cross') + lead(52.7, 22, 70, 13, 'Square nodes where every line ends') + lead(46.9, 23.5, 70, 22, 'Strings: hairlines from a node', 'under the bar to one on the head') + lead(28, 40.6, 70, 31, 'YoRHa blindfold: idle shows no eyes;', 'other states light up on the band') + lead(55, 39, 70, 41, 'Blindfold tails past the right ear') + lead(14.6, 52, 70, 51, 'Hairline head with an inner frame,', 'chamfered corners, angled brace points');
    else notes = lead(50, 10.6, 70, 4, 'Control: two sticks at ±20°,', 'the back one in shade') + lead(32, 14.5, 70, 11.5, 'Pin where they cross') + lead(46.71, 23.76, 70, 17.5, 'Screw eye under the bar,', 'its top tucked under the stick') + lead(44.5, 32.3, 70, 25, 'Matching eye on Pip: strings run', 'eye to eye in every frame') + lead(55, 45.5, 70, 34, 'Brace points: { and } as one head') + lead(39.3, 42.7, 70, 42, 'Eyes with a catchlight') + lead(42.2, 50.2, 70, 50, th.glass ? 'Lit rim, frosted body, pink cheeks' : th.cheek ? 'Cheeks: Friendly and Glass' : 'Basic: one flat accent, no cheeks') + (th.glass ? lab(71.6, 54, 'On the app icon it refracts the wallpaper') : '');
    return `<svg viewBox="-2 -2 132 68" role="img" aria-label="Construction diagram">${guides}${mark}${notes}</svg>`;
  }
  function renderSpecs() {
    const th = TH[S.theme], mo = L.MOTION[th.family];
    const sw = (c) => `<span class="sw" style="background:${Array.isArray(c) ? `linear-gradient(${c.join(',')})` : c}"></span><code>${Array.isArray(c) ? c.join(' → ') : c}</code>`;
    $('#specGrid').innerHTML = `
      <div class="card construct">${constructionSvg()}</div>
      <div class="specs-stack">
        <div class="card"><h3 style="margin-bottom:6px">Size tiers</h3><table class="spec"><tr><th>Device pixels</th><th>Drawing</th><th>Used for</th></tr>
          <tr><td class="k">≤ 18</td><td>Pixel sprite, 16 grid; control becomes one bar</td><td>Tray, favicon, 14 to 16 px spinners</td></tr>
          <tr><td class="k">19 to 40</td><td>Vector, heavier strokes, no cheeks or gloss</td><td>Title bar at 1x, taskbar, menus</td></tr>
          <tr><td class="k">&gt; 40</td><td>Vector, every detail</td><td>Title bar at 2x, app icon, splash</td></tr>
          <tr><td class="k">Retro</td><td>Sprites on 16, 24 and 32 grids at every size</td><td>All Retro surfaces</td></tr></table></div>
        <div class="card"><h3 style="margin-bottom:6px">${th.label} palette</h3><table class="spec">
          <tr><td class="k">Control</td><td>${sw(th.ctl)}</td><td class="k">Strings</td><td>${sw(th.str)}</td></tr>
          <tr><td class="k">${S.dir === 'pip' ? 'Head' : 'Letters'}</td><td>${sw(S.dir === 'pip' ? (th.glass ? th.glass.tint : th.head) : th.letter)}</td><td class="k">Cheeks</td><td>${th.cheek ? sw(th.cheek) : '<span class="note">none</span>'}</td></tr>
          <tr><td class="k">Tile</td><td>${sw(th.tile.stops)}</td><td class="k">Edge</td><td>${sw(th.tile.edge)}</td></tr></table>
          <p class="note" style="margin:8px 0 0">Every value is a PMConcept7 token for that theme, or a step of one.</p></div>
        <div class="card"><h3 style="margin-bottom:6px">Motion</h3><table class="spec"><tr><th>Family</th><th>Cycle</th><th>Feel</th></tr>
          ${['friendly', 'glass', 'basic', 'retro'].map((f) => `<tr${f === th.family ? ' style="color:var(--accent)"' : ''}><td class="k">${f[0].toUpperCase() + f.slice(1)}</td><td>${L.MOTION[f].dur}s</td><td>${L.MOTION[f].label}</td></tr>`).join('')}
          <tr><td class="k">NieR</td><td colspan="2">Static; NieR keeps its own loader</td></tr></table>
          <p class="note" style="margin:8px 0 0">Loader SVGs carry <code>role="img"</code> and the label "Puppet Master is working". Static marks next to the wordmark are <code>aria-hidden</code>, because the name is already there.${mo ? '' : ''}</p></div>
      </div>`;
  }

  /* ------------------------------------------------------------ downloads */
  function renderDownloads() {
    const th = TH[S.theme];
    $('#dlGrid').innerHTML = `
      <div class="card dl"><h3>${th.label}</h3><p>Single files for the theme on screen.</p>
        <div class="row">
          <button type="button" class="btn" data-dl="mark">${ICON.dl}Mark SVG</button>
          <button type="button" class="btn" data-dl="tile">${ICON.dl}App tile SVG</button>
          <button type="button" class="btn" data-dl="loader"${th.noMotion ? ' disabled' : ''}>${ICON.dl}Loader SVG</button>
          <button type="button" class="btn ghost" data-dl="tray-black">${ICON.dl}Tray black</button>
          <button type="button" class="btn ghost" data-dl="tray-white">${ICON.dl}Tray white</button>
          <button type="button" class="btn ghost" data-dl="png">${ICON.dl}Tile PNG 1024</button>
        </div></div>
      <div class="card dl"><h3>App icon files</h3><p>For the installers: a Windows <code>.ico</code> (the plain mark at 16 to 24 px, the tile from 32 up), a macOS <code>.icns</code> on Apple's icon grid with its shadow, and a PNG set.</p>
        <div class="row">
          <button type="button" class="btn" data-dl="ico">${ICON.dl}.ico</button>
          <button type="button" class="btn" data-dl="icns">${ICON.dl}.icns</button>
          <button type="button" class="btn ghost" data-dl="pngset">${ICON.dl}PNG set (zip)</button>
        </div></div>
      <div class="card dl"><h3>Everything</h3><p>Every theme × mark (three tiers), tile, tray template${S.dir === 'pip' ? ', mood' : ''} and loader, as SVG, plus a manifest: ${S.dir === 'pip' ? 179 : 59} files.</p>
        <div class="row"><button type="button" class="btn" data-dl="all">${ICON.dl}SVG pack (zip)</button></div></div>`;
  }
  function saveBlob(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Saved ' + name);
  }
  const svgBlob = (s) => new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + s], { type: 'image/svg+xml' });
  const canvasPng = (c) => new Promise((r) => c.toBlob(r, 'image/png'));
  const u8 = async (b) => new Uint8Array(await b.arrayBuffer());
  async function pngOf(svg, size) { return u8(await canvasPng(await rasterize(svg, size))); }
  async function macPng(size) {
    // Apple's grid: the tile is 824/1024 of the canvas, with a soft drop shadow beneath
    const tile = await rasterize(L.svg({ mark: S.dir, theme: S.theme, px: 824, form: 'tile' }), 824);
    const c = document.createElement('canvas'); c.width = c.height = 1024;
    const x = c.getContext('2d');
    x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowBlur = 28; x.shadowOffsetY = 12;
    x.drawImage(tile, 100, 92, 824, 824);
    if (size === 1024) return u8(await canvasPng(c));
    const d = document.createElement('canvas'); d.width = d.height = size;
    const y = d.getContext('2d'); y.imageSmoothingQuality = 'high'; y.drawImage(c, 0, 0, size, size);
    return u8(await canvasPng(d));
  }
  const iconSvg = (px) => px <= 24 ? L.svg({ mark: S.dir, theme: S.theme, px, dpr: 1 }) : L.svg({ mark: S.dir, theme: S.theme, px, form: 'tile', dpr: 1 });
  async function buildIco() {
    const sizes = [16, 20, 24, 32, 48, 64, 128, 256];
    const pngs = [];
    for (const s of sizes) pngs.push(await pngOf(iconSvg(s), s));
    const head = 6 + 16 * sizes.length; let off = head;
    const total = head + pngs.reduce((a, p) => a + p.length, 0);
    const buf = new Uint8Array(total), dv = new DataView(buf.buffer);
    dv.setUint16(0, 0, true); dv.setUint16(2, 1, true); dv.setUint16(4, sizes.length, true);
    sizes.forEach((s, i) => {
      const e = 6 + i * 16;
      buf[e] = s >= 256 ? 0 : s; buf[e + 1] = s >= 256 ? 0 : s;
      dv.setUint16(e + 4, 1, true); dv.setUint16(e + 6, 32, true);
      dv.setUint32(e + 8, pngs[i].length, true); dv.setUint32(e + 12, off, true);
      buf.set(pngs[i], off); off += pngs[i].length;
    });
    return new Blob([buf], { type: 'image/x-icon' });
  }
  async function buildIcns() {
    const types = [['icp4', 16], ['icp5', 32], ['ic11', 32], ['icp6', 64], ['ic12', 64], ['ic07', 128], ['ic08', 256], ['ic13', 256], ['ic09', 512], ['ic14', 512], ['ic10', 1024]];
    const parts = [];
    for (const [t, s] of types) parts.push([t, s <= 32 ? await pngOf(L.svg({ mark: S.dir, theme: S.theme, px: s, form: 'tile', dpr: 1 }), s) : await macPng(s)]);
    const total = 8 + parts.reduce((a, p) => a + 8 + p[1].length, 0);
    const buf = new Uint8Array(total), dv = new DataView(buf.buffer);
    const tag = (o, s) => { for (let i = 0; i < 4; i++) buf[o + i] = s.charCodeAt(i); };
    tag(0, 'icns'); dv.setUint32(4, total);
    let o = 8;
    parts.forEach(([t, d]) => { tag(o, t); dv.setUint32(o + 4, 8 + d.length); buf.set(d, o + 8); o += 8 + d.length; });
    return new Blob([buf], { type: 'image/icns' });
  }
  // minimal store-only ZIP writer
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (d) => { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), chunks = [], central = []; let off = 0;
    for (const [name, data0] of files) {
      const data = typeof data0 === 'string' ? enc.encode(data0) : data0, nb = enc.encode(name), crc = crc32(data);
      const h = new Uint8Array(30 + nb.length), v = new DataView(h.buffer);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
      v.setUint16(10, 0, true); v.setUint16(12, 0x5A21, true); v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true);
      v.setUint16(26, nb.length, true); h.set(nb, 30);
      const c = new Uint8Array(46 + nb.length), w = new DataView(c.buffer);
      w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true);
      w.setUint16(12, 0, true); w.setUint16(14, 0x5A21, true); w.setUint32(16, crc, true); w.setUint32(20, data.length, true); w.setUint32(24, data.length, true);
      w.setUint16(28, nb.length, true); w.setUint32(42, off, true); c.set(nb, 46);
      chunks.push(h, data); central.push(c); off += h.length + data.length;
    }
    const cs = central.reduce((a, c) => a + c.length, 0), end = new Uint8Array(22), e = new DataView(end.buffer);
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob([...chunks, ...central, end], { type: 'application/zip' });
  }
  async function download(kind, btn) {
    const base = `puppet-master-${S.dir === 'pip' ? 'pip' : 'pm'}-${S.theme}`;
    const xml = (s) => '<?xml version="1.0" encoding="UTF-8"?>\n' + s;
    btn && (btn.disabled = true);
    try {
      if (kind === 'mark') saveBlob(svgBlob(L.svg({ mark: S.dir, theme: S.theme, px: 512, tier: 'full' })), base + '-mark.svg');
      else if (kind === 'tile') saveBlob(svgBlob(L.svg({ mark: S.dir, theme: S.theme, px: 1024, form: 'tile' })), base + '-tile.svg');
      else if (kind === 'loader') saveBlob(svgBlob(L.svg({ mark: S.dir, theme: S.theme, px: 256, motion: S.dir === 'mono' ? 'swing' : S.loader, tier: 'full' })), `${base}-loader-${S.loader}.svg`);
      else if (kind === 'tray-black' || kind === 'tray-white') saveBlob(svgBlob(L.svg({ mark: S.dir, theme: S.theme, px: 16, form: 'tray', ink: kind === 'tray-black' ? '#000000' : '#FFFFFF', tier: 'micro' })), `${base}-trayTemplate-${kind.slice(5)}.svg`);
      else if (kind === 'png') saveBlob(new Blob([await pngOf(L.svg({ mark: S.dir, theme: S.theme, px: 1024, form: 'tile' }), 1024)], { type: 'image/png' }), base + '-1024.png');
      else if (kind === 'ico') saveBlob(await buildIco(), base + '.ico');
      else if (kind === 'icns') saveBlob(await buildIcns(), base + '.icns');
      else if (kind === 'pngset') {
        const files = [];
        for (const s of [16, 20, 24, 32, 48, 64, 128, 256, 512, 1024]) files.push([`${base}/png/${s}.png`, await pngOf(iconSvg(s), s)]);
        for (const s of [16, 32]) for (const ink of ['black', 'white']) files.push([`${base}/tray/${s}-${ink}.png`, await pngOf(L.svg({ mark: S.dir, theme: S.theme, px: s, form: 'tray', ink: ink === 'black' ? '#000' : '#fff', dpr: 1 }), s)]);
        files.push([`${base}/macos/1024.png`, await macPng(1024)]);
        saveBlob(zip(files), base + '-png.zip');
      } else if (kind === 'all') {
        const files = [], man = [];
        const add = (path, svg, meta) => { files.push([path, xml(svg)]); man.push(Object.assign({ path }, meta)); };
        const dirn = S.dir === 'pip' ? 'pip' : 'pm';
        for (const t of ORDER) {
          const th = TH[t];
          add(`${dirn}/${t}/mark.svg`, L.svg({ mark: S.dir, theme: t, px: 512, tier: 'full' }), { theme: t, form: 'mark', tier: 'full' });
          add(`${dirn}/${t}/mark-small.svg`, L.svg({ mark: S.dir, theme: t, px: 24, tier: th.pixel ? 'pixel' : 'small' }), { theme: t, form: 'mark', tier: 'small', size: 24 });
          add(`${dirn}/${t}/mark-micro.svg`, L.svg({ mark: S.dir, theme: t, px: 16, tier: 'micro' }), { theme: t, form: 'mark', tier: 'micro', size: 16 });
          add(`${dirn}/${t}/tile.svg`, L.svg({ mark: S.dir, theme: t, px: 1024, form: 'tile' }), { theme: t, form: 'tile' });
          if (S.dir === 'pip') for (const m of ['happy', 'alert', 'error', 'sleep']) {
            add(`${dirn}/${t}/mood-${m}.svg`, L.svg({ mark: 'pip', theme: t, px: 256, tier: 'full', mood: m }), { theme: t, form: 'mood', mood: m });
            add(`${dirn}/${t}/mood-${m}-micro.svg`, L.svg({ mark: 'pip', theme: t, px: 16, tier: 'micro', mood: m }), { theme: t, form: 'mood', mood: m, tier: 'micro' });
          }
          if (!th.noMotion) for (const mo of (S.dir === 'pip' ? ['swing', 'think', 'hop'] : ['swing'])) {
            add(`${dirn}/${t}/loader-${mo}.svg`, L.svg({ mark: S.dir, theme: t, px: 256, tier: th.pixel ? 'pixel' : 'full', motion: mo }), { theme: t, form: 'loader', motion: mo });
            add(`${dirn}/${t}/loader-${mo}-micro.svg`, L.svg({ mark: S.dir, theme: t, px: 16, tier: 'micro', motion: mo }), { theme: t, form: 'loader', motion: mo, tier: 'micro' });
          }
        }
        for (const ink of ['black', 'white']) for (const m of (S.dir === 'pip' ? ['idle', 'happy', 'alert', 'error', 'sleep'] : ['idle'])) {
          add(`${dirn}/tray/${m}-${ink}.svg`, L.svg({ mark: S.dir, theme: 'basic-light', px: 16, tier: 'micro', form: 'tray', ink: ink === 'black' ? '#000000' : '#FFFFFF', mood: m }), { form: 'tray', mood: m, ink });
        }
        files.push([`${dirn}/manifest.json`, JSON.stringify({ generator: 'pm-logo.js ' + L.version, model: 'Opus 5.5', direction: S.dir, files: man }, null, 2)]);
        saveBlob(zip(files), `puppet-master-${dirn}-svg-pack.zip`);
      }
    } catch (err) { toast('Export failed: ' + err.message); }
    finally { btn && (btn.disabled = false); }
  }

  /* ------------------------------------------------------------ render */
  function renderTop() { $('#topLockup').outerHTML = `<span class="pm-lockup${TH[S.theme].upper ? ' upper' : ''}" id="topLockup" style="--mark:24px;${lockStyle(S.theme)}"><span class="pm-mark">${L.svg({ mark: S.dir, theme: S.theme, px: 24, dpr: S.dpr, decorative: true })}</span><span class="pm-wm">Puppet Master</span></span>`; }
  function renderAll() {
    applyTheme(); syncPressed(); renderTop(); renderHero(); renderTitlebar(); renderIcons(); renderTray();
    renderLoading(); renderMoods(); renderMatrix(); renderPixels(); renderSpecs(); renderDownloads();
    if (liveFrame) { const n = liveDoc() && liveDoc().querySelector('.title-bar .app-name'); if (n) n.dataset.pmx = ''; injectLive(); }
  }
  buildControls(); renderLiveShell(); syncReducedAttr(); renderAll();
})();
