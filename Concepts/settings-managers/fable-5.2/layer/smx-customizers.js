/* Settings managers, rethought (Fable 5.2): the look customizers, part two.
   smx-customizers.css keeps the example beside the options. This file makes the example answer the second complaint:
   "make sure that example section actually shows what is being changed".
   - The options are tabs, one group at a time, instead of one scroll eight windows long ("Everything" still shows the
     long list).
   - A line under the example names what you just changed, in the words on screen, and says where to look.
   - The example then proves it. Where PMConcept7 already has a "Try it" for that kind of change (move the caret, type,
     go to a problem, step back, ring the bell) it is run for you. Where the sample cannot show the choice at rest (a
     ruler at column 80, ligatures at 13 px, wrapping) the example turns into a close-up drawn for that one choice.
   - Customize Pip and Adjust NieR keep their example at the top of the sheet, with the same line under it.
   The dialogs are PMConcept7's own; nothing in them is rebuilt (window.SMX.cz).

   SMX.cz.note(dialog, /key or label/, 'where to look')               a hint for a choice the sample does show
   SMX.cz.closeup(dialog, /key or label/, {title, draw(body, info)})  a close-up for a choice it cannot show
   dialog: 'editor' | 'terminal' | 'pip' | 'nier'. info: {key, name, choice, value, on, group, help, root}. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.cz) return;
  const D = W.document;
  const CZ = SMX.cz = { notes: { editor: [], terminal: [], pip: [], nier: [] }, closeups: { editor: [], terminal: [], pip: [], nier: [] } };
  CZ.note = (dialog, pattern, text) => { CZ.notes[dialog].push([pattern, text]); };
  CZ.closeup = (dialog, pattern, def) => { CZ.closeups[dialog].push([pattern, def]); };
  const esc = SMX.h;
  const T = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const txt = (n, sel) => { const x = n && n.querySelector(sel); return x ? T(x.textContent) : ''; };
  /* the first words written on a control, past any drawing it carries (a tile's little picture is not its name) */
  const firstText = (n) => { const w = D.createTreeWalker(n, W.NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { const s = T(t.nodeValue); if (s && !t.parentElement.closest('svg, [aria-hidden="true"], [class*="art"], [class*="demo"], [class*="pv"]')) return s; } return ''; };

  /* ------------------------------------------------------------------ which choice was touched, in the words on screen */
  function describe(target, root) {
    const ctl = target.closest('button, input, select, textarea, [role="switch"], [role="radio"], [role="option"], [role="slider"]');
    if (!ctl || ctl.closest('.pmt-cz-top, .pmt-cz-nav, .pmt-cz-head, .pmt-cz-foot, .smx-cz-closeup, .smx-cz-said, .pmt-cz-ghead, .pmt-cz-findrow, .pipe-top, .o55nc-top, .pipe-ghead')) return null;
    const keyEl = ctl.closest('[data-key], [data-tok], [data-pipe-part], [data-part], [data-chip], [data-opt]');
    const key = keyEl ? (keyEl.dataset.key || keyEl.dataset.tok || keyEl.dataset.pipePart || keyEl.dataset.part || keyEl.dataset.chip || keyEl.dataset.opt || '') : '';
    const groupEl = ctl.closest('.pmt-cz-group, .o55nc-group, .pipe-group');
    const group = groupEl ? (groupEl.dataset.pipeGroup || txt(groupEl, 'h3, h4, .pmt-cz-gtitle') || '').split(/ {2,}|\d/)[0].trim() : '';
    const set = ctl.closest('[role="radiogroup"]');
    const field = ctl.closest('.pmt-cz-field');
    let name = '', choice = '', help = '', kind = 'pick';
    if (ctl.matches('[role="switch"]')) {            // a chip: on or off
      kind = 'switch';
      name = txt(ctl, '.pmt-cz-chipname, .pipe-chip-name, [class*="chip-name"], [class*="chipname"], b, strong') || T(ctl.getAttribute('aria-label'));
      help = txt(ctl, '.pmt-cz-chiphelp, .pipe-chip-help, [class*="chip-help"], [class*="chiphelp"]');
    } else if (ctl.matches('input[type="range"], input[type="number"]')) {
      kind = 'amount';
      name = T(ctl.getAttribute('aria-label')) || txt(field, '.pmt-cz-flabel') || txt(ctl.closest('label'), 'span');
    } else if (ctl.matches('[role="radio"], .pmt-cz-tile, .pmt-cz-segopt')) {
      name = (set && T(set.getAttribute('aria-label'))) || txt(field, '.pmt-cz-flabel');
      choice = firstText(ctl) || T(ctl.getAttribute('aria-label')) || T(ctl.textContent);
      help = txt(field, '.pmt-cz-fhelp');
    } else {
      name = T(ctl.getAttribute('aria-label')) || T(ctl.textContent);
      if (!key) return null;                           // a plain button that sets nothing (Import, Reset, a search field)
    }
    if (!name) name = key;
    if (!name) return null;
    return { key, name: name.slice(0, 60), choice: choice.split(/ {2,}/)[0].slice(0, 40), help, kind, group, root, ctl, value: keyEl && keyEl.dataset.value != null ? keyEl.dataset.value : '' };
  }
  /* read the state the control ended in (a chip's on or off, a slider's number) once PMConcept7 has applied it */
  function settle(info) {
    const c = info.ctl;
    if (!c || !c.isConnected) return info;
    if (info.kind === 'switch') { info.on = c.getAttribute('aria-checked') === 'true' || c.getAttribute('aria-pressed') === 'true'; info.value = info.on ? 'on' : 'off'; }
    else if (info.kind === 'amount') { info.value = c.value; const out = c.closest('.pmt-cz-field, label, div'); const unit = out ? txt(out, 'output, .pmt-cz-fval, [class*="val"]') : ''; info.choice = unit || c.value; }
    return info;
  }
  const sentence = (info) => {
    if (info.kind === 'switch') return `You turned <b>${esc(info.name)}</b> ${info.on ? 'on' : 'off'}.`;
    if (info.kind === 'amount') return `<b>${esc(info.name)}</b> is now <b>${esc(info.choice)}</b>.`;
    return info.choice ? `<b>${esc(info.name)}</b> is now <b>${esc(info.choice)}</b>.` : `You changed <b>${esc(info.name)}</b>.`;
  };

  /* ------------------------------------------------------------------ PMConcept7's own "Try it", run for the change it shows */
  const TRY = {
    editor: [['try-move', /^caret/, 'The caret just moved through the example so you can see it.'], ['try-type', /^(font|fontSize|fontWeight|lineHeight|letterSpacing)$/, 'A few letters were just typed into the example in it.'], ['try-problem', /^(lineHighlight|diagnostics|gotoHighlightMs)$/, 'The example just jumped to a problem to show it.'], ['try-dim', /^inactiveDim$/, 'The example just dimmed the way an editor you are not in will.']],
    terminal: [['try-cursor', /^cursor/, 'The cursor just moved through the example so you can see it.'], ['try-bell', /^bell$/, 'The bell just rang in the example.'], ['try-dim', /^inactiveDim$/, 'The example just dimmed the way a terminal you are not in will.'], ['degauss', /^(crt|curvature)$/, 'The tube in the example just wobbled, the way an old monitor settles.']]
  };
  function tryIt(root, kind, info) {
    for (const [act, re, text] of (TRY[kind] || [])) {
      if (!re.test(info.key)) continue;
      const b = root.querySelector(`.pmt-cz-top [data-act="${act}"]`);
      if (!b || b.hidden || b.disabled || b.getAttribute('aria-disabled') === 'true') return '';
      W.setTimeout(() => { if (b.isConnected) b.click(); }, 220);
      if (info.key === 'bell' && /off|none/i.test(info.choice + ' ' + info.value)) return 'A bell was just sent to the example, and it stayed quiet.';
      return text;
    }
    return '';
  }

  /* ------------------------------------------------------------------ the line under the example, and close-ups */
  const said = (root) => root.querySelector('.smx-cz-said');
  const setSaid = (line, kind, html) => { line.setAttribute('data-kind', kind); line.querySelector('.smx-cz-said-text').innerHTML = html; };
  function closeCloseup(root) { const c = root.querySelector('.smx-cz-closeup'); if (c) c.remove(); }
  function say(root, kind, info) {
    const line = said(root); if (!line) return;
    settle(info);
    const preview = root.querySelector('.pmt-cz-preview, .pipe-stage, .o55nc-pv');
    const hay = `${info.key} ${info.name}`;
    const up = (CZ.closeups[kind] || []).find(([re]) => re.test(hay));
    const note = (CZ.notes[kind] || []).find(([re]) => re.test(hay));
    closeCloseup(root);
    if (up && preview) {
      const box = root.querySelector('.pmt-cz-pvbox') || preview;
      const c = D.createElement('div'); c.className = 'smx-cz-closeup';
      c.innerHTML = `<div class="smx-cz-closeup-cap"><span>Close-up: <b>${esc(up[1].title || info.name)}</b></span><button type="button" data-smx-cz-back>Back to the example</button></div><div class="smx-cz-closeup-body"></div>`;
      box.appendChild(c);
      try { up[1].draw(c.querySelector('.smx-cz-closeup-body'), info); } catch (e) { W.console.error('close-up failed', e); }
      c.querySelector('[data-smx-cz-back]').addEventListener('click', () => { closeCloseup(root); setSaid(line, 'plain', 'Back on the live example.'); });
      setSaid(line, 'closeup', `${sentence(info)} The sample cannot show this one at rest, so the example is showing a close-up of it.`);
    } else if (kind === 'pip') {
      const play = root.querySelector('.pipe-play');
      const can = play && play.getAttribute('aria-disabled') !== 'true' && /faces|motion|look/i.test(info.group);
      if (can) W.setTimeout(() => { if (play.isConnected) play.click(); }, 220);
      setSaid(line, 'plain', `${sentence(info)} ${esc(info.help)} ${can ? 'The five Pips above are playing it now.' : /sound/i.test(info.group) ? 'This one you hear, not see.' : 'It shows in the app itself, where Pip appears.'}`);
    } else if (kind === 'nier') {
      setSaid(line, 'plain', `${sentence(info)} ${esc(info.help)} ${/look|pointer/i.test(info.group) ? 'Look at the small menu above, and at the page behind this sheet.' : 'It shows in the app itself: look at the page behind this sheet.'}`);
    } else {
      const ran = tryIt(root, kind, info);
      setSaid(line, 'plain', `${sentence(info)} ${esc(ran || (note ? note[1] : info.group === 'Behavior' ? 'This one changes how it behaves, not how it looks, so the example stays as it is.' : 'The example shows it now.'))}`);
    }
    if (preview) { preview.classList.remove('smx-cz-pulse'); void preview.offsetWidth; preview.classList.add('smx-cz-pulse'); }
  }

  /* ------------------------------------------------------------------ the options as tabs, one group at a time */
  function tabs(root) {
    const body = root.querySelector('.pmt-cz-body'), nav = root.querySelector('.pmt-cz-nav');
    if (!body || !nav) return;
    const jumps = [...nav.querySelectorAll('[data-jump]')];
    if (!jumps.length) return;
    let all = nav.querySelector('[data-smx-all]');
    const show = (g) => {
      body.setAttribute('data-smx-tab', g);
      for (const b of jumps) b.setAttribute('data-smx-on', String(b.dataset.jump === g));
      all.setAttribute('data-smx-on', String(g === '*'));
      all.textContent = g === '*' ? 'One group at a time' : 'Everything';
      body.scrollTop = 0;
    };
    if (all) { if (!body.getAttribute('data-smx-tab')) show(jumps[0].dataset.jump); return; }
    all = D.createElement('button'); all.type = 'button'; all.className = 'pmt-textbtn smx-cz-all'; all.setAttribute('data-smx-all', '');
    jumps[jumps.length - 1].insertAdjacentElement('afterend', all);
    let lastTab = jumps[0].dataset.jump;
    nav.addEventListener('click', (e) => {
      if (SMX.view !== 'new') return;
      const b = e.target.closest('[data-jump], [data-smx-all]'); if (!b) return;
      const cur = body.getAttribute('data-smx-tab');
      if (b.hasAttribute('data-smx-all')) { show(cur === '*' ? lastTab : '*'); return; }
      if (cur === '*') return;                           // in the long list the buttons jump to their group, as PMConcept7 made them
      e.stopPropagation(); e.preventDefault(); lastTab = b.dataset.jump; show(lastTab);
    }, true);
    show(lastTab);
  }

  /* ------------------------------------------------------------------ attach to a dialog when it opens */
  function attach(root, kind, afterSel) {
    if (kind === 'editor' || kind === 'terminal') {
      tabs(root);
      const t = root.querySelector('.pmt-cz-top [data-act^="try-"]'); if (t && t.parentElement) t.parentElement.classList.add('smx-cz-try');
    }
    if (said(root)) return;
    const after = root.querySelector(afterSel); if (!after) return;
    const line = D.createElement('div'); line.className = 'smx-cz-said'; line.setAttribute('data-kind', 'plain'); line.setAttribute('aria-live', 'polite');
    line.innerHTML = '<span class="smx-cz-said-mark"></span><span class="smx-cz-said-text">Pick anything. This example stays here and shows it at once.</span>';
    after.insertAdjacentElement('afterend', line);
    if (kind === 'pip' || kind === 'nier') root.style.setProperty('--smx-cz-pin', (after.offsetHeight + 8) + 'px');
    let last = 0;
    const on = (e) => {
      if (SMX.view !== 'new') return;
      const info = describe(e.target, root); if (!info) return;
      const now = Date.now(); if (now - last < 60) return; last = now;
      W.setTimeout(() => say(root, kind, info), 40);
    };
    root.addEventListener('click', on, true);
    root.addEventListener('change', on, true);
  }
  function scan() {
    if (SMX.view !== 'new') return;
    for (const root of D.querySelectorAll('.pmt-cz:not(.pmt-cz-parked)')) {
      if (!root.querySelector('.pmt-cz-dialog') || root.getBoundingClientRect().width < 50) continue;
      attach(root, root.classList.contains('pmed-cz') ? 'editor' : 'terminal', '.pmt-cz-preview');
    }
    for (const stage of D.querySelectorAll('.pipe-top .pipe-stage')) { const root = stage.closest('.pipe'); if (root) attach(root, 'pip', '.pipe-stage'); }
    for (const pv of D.querySelectorAll('.o55nc-top .o55nc-pv')) { const root = pv.closest('.o55nc-top').parentElement; if (root) attach(root, 'nier', '.o55nc-pv'); }
  }
  /* PMConcept7 shows the Terminal's Customize over the page that has a terminal, and leaves you there when it closes.
     Opened from these pages, closing it brings you back to the page of Settings you were on. */
  let cameFrom = '';
  D.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#smx-root [data-action$="-customize"], #smx-root [data-action="open-structured-setting"]');
    if (b && SMX.view === 'new') cameFrom = SMX.route;
  }, true);
  /* really showing: PMConcept7 keeps a prepared, unseen copy of the editor's dialog in the page */
  const showing = (n) => {
    if (!n.isConnected || !n.checkVisibility || !n.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false;
    for (let p = n; p && p.nodeType === 1; p = p.parentElement) if (p.inert) return false;
    const r = n.getBoundingClientRect();
    return r.width > 50 && r.height > 50 && r.right > 0 && r.bottom > 0 && r.left < W.innerWidth && r.top < W.innerHeight;
  };
  const anyOpen = () => [...D.querySelectorAll('.pmt-cz:not(.pmt-cz-parked) .pmt-cz-dialog, .pipe-panel, .o55nc-panel')].some(showing);
  let wasOpen = false;
  function comeBack() {
    const open = anyOpen();
    if (wasOpen && !open && cameFrom) {
      const route = cameFrom; cameFrom = '';
      try { if (W.PM_PAGES && W.PM_PAGES.current !== 'settings') { W.PM_PAGES.go('settings'); W.setTimeout(() => SMX.go(route, { replace: true }), 120); } } catch (e) { /* stay where PMConcept7 left us */ }
    }
    wasOpen = open;
  }
  W.setInterval(() => { scan(); comeBack(); }, 400);

  /* ------------------------------------------------------------------ hints for choices the live sample does show */
  CZ.note('editor', /bracket/i, 'Look at the nested brackets on lines 6 to 8.');
  CZ.note('editor', /lineNumber|line numbers/i, 'Look at the numbers down the left edge.');
  CZ.note('editor', /minimap/i, 'Look at the right edge of the example.');
  CZ.note('editor', /scheme|syntax|contrast|italic|bold|token/i, 'Look at the comment on line 1 and the coloured words below it.');
  CZ.note('terminal', /scanline|glow|crt|curvature|burn|grain|noise|flicker|mask/i, 'It draws over the whole example: look at its edges and at the bright text.');
  CZ.note('terminal', /bezel/i, 'Look at the frame around the example.');
  CZ.note('terminal', /ground|bg|opacity|padding/i, 'Look behind the text of the example.');
  CZ.note('terminal', /scheme|contrast|font|weight|spacing|height|rendering|bold/i, 'All the text in the example redraws with it.');

  /* ------------------------------------------------------------------ close-ups: small drawings for what the sample cannot show
     Each reads what it can from the choice just made; they stand for the real surface, which a native build would use. */
  const mono = 'font: 12px/1.6 var(--pm-font-code, ui-monospace, monospace); white-space: pre;';
  const lines = (arr) => arr.map((l, i) => `<div style="display:flex;gap:10px"><span style="opacity:.45;width:18px;text-align:right">${i + 1}</span><span>${l}</span></div>`).join('');
  const caption = (text) => `<div style="opacity:.7;margin-bottom:8px;white-space:normal;font:11.5px/1.4 var(--body-font, inherit)">${text}</div>`;
  const isOff = (info) => info.on === false || /^(off|false|none|0)$/i.test(String(info.value));
  CZ.closeup('editor', /ligature/i, { title: 'Ligatures', draw: (b, info) => {
    const on = !isOff(info);
    // drawn, not set in the font, so the difference shows whatever face is loaded here
    const pair = (label, glyphs, chosen) => `<div style="flex:1;border:1px solid color-mix(in srgb, currentColor ${chosen ? 70 : 22}%, transparent);border-radius:6px;padding:10px 12px"><div style="font:600 11px/1.4 var(--body-font, inherit);opacity:.75;margin-bottom:6px">${label}${chosen ? ' (your choice)' : ''}</div><div style="font:30px/1.2 ui-monospace, 'JetBrains Mono', monospace;white-space:pre">${glyphs}</div></div>`;
    b.innerHTML = `<div style="position:absolute;inset:12px;display:grid;align-content:start;gap:8px">${caption('The same four pairs of characters, drawn large. With ligatures on, each pair joins into one symbol; you still type two characters.')}<div style="display:flex;gap:10px">${pair('On', '→  ≠  ⇒  ≥', on)}${pair('Off', '-&gt;  !=  =&gt;  &gt;=', !on)}</div></div>`;
  } });
  CZ.closeup('editor', /^rulers|ruler/i, { title: 'Rulers', draw: (b, info) => {
    const cols = String(info.value || info.choice).split(/[^\d]+/).map(Number).filter(Boolean);
    const col = cols[0] || 80;
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}">${caption(cols.length ? `A faint line at column ${cols.join(' and ')}: a reminder of where a line gets long. The sample is too narrow to reach it.` : 'No ruler.')}${lines(['// a line that runs past the ruler so you can see where it sits ............', 'let total = steps.iter().map(|s| s.minutes).sum::&lt;u32&gt;();', 'short();'])}${cols.length ? `<i style="position:absolute;top:34px;bottom:0;left:calc(28px + ${Math.min(col, 96)} * .5ch);border-left:1px solid currentColor;opacity:.5"></i>` : ''}</div>`;
  } });
  CZ.closeup('editor', /wordWrap|wrapColumn|wrap/i, { title: 'Wrapping long lines', draw: (b, info) => {
    const on = !isOff(info);
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}${on ? 'white-space:pre-wrap;' : ''}overflow:hidden">${caption(on ? 'On: the long line folds, so nothing runs off the side.' : 'Off: the long line runs off the side and you scroll sideways to read it.')}format!("Serves {} people and takes {} minutes from start to finish, including the time it rests", recipe.serves, recipe.total_minutes())</div>`;
  } });
  CZ.closeup('editor', /indentGuides|activeIndent|indent ?guide/i, { title: 'Indent guides', draw: (b, info) => {
    const hay = (info.choice + ' ' + info.value).toLowerCase();
    const off = /off|none/.test(hay) && info.key === 'indentGuides', rainbow = /rainbow/.test(hay);
    const g = (n) => Array.from({ length: n }, (_, i) => `<i style="display:inline-block;width:2ch;border-left:1px solid ${off ? 'transparent' : rainbow ? ['#e06c75', '#e5c07b', '#98c379', '#61afef'][i % 4] : 'currentColor'};opacity:${rainbow ? .9 : .4}">&nbsp;</i>`).join('');
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}">${caption('Guides are the thin lines that show how deep each line sits. Five levels deep, so you can see them.')}${lines(['fn plan(recipe: &Recipe) {', g(1) + 'for step in &recipe.steps {', g(2) + 'if step.needs_oven {', g(3) + 'match step.heat {', g(4) + 'Heat::High =&gt; preheat(220),', g(3) + '}', g(2) + '}', g(1) + '}', '}'])}</div>`;
  } });
  CZ.closeup('editor', /whitespace|show spaces/i, { title: 'Showing spaces', draw: (b, info) => {
    const v = (info.choice + ' ' + info.value).toLowerCase();
    const dot = '<span style="opacity:.55">·</span>';
    const all = /all|everywhere/.test(v), ends = all || /trail|end/.test(v), between = all || /bound|between/.test(v), sel = /select/.test(v);
    const sp = (show) => (show ? dot : ' ');
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}">${caption('Spaces are invisible. This draws a faint dot where each one is.')}${lines([`let${sp(between)}total${sp(between)}=${sp(between)}1;${ends ? dot + dot + dot : '   '}`, `<span style="${sel ? 'background:color-mix(in srgb, currentColor 22%, transparent)' : ''}">serve(${sp(all || sel)}total${sp(all || sel)});</span>`])}</div>`;
  } });
  CZ.closeup('editor', /stickyScroll|stickyLines|sticky/i, { title: 'Sticky scroll', draw: (b) => {
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}overflow:hidden"><div style="position:absolute;left:0;right:0;top:0;padding:2px 0;border-bottom:1px solid color-mix(in srgb, currentColor 30%, transparent);background:var(--pmt-cz-ground,#1e1e1e)">impl Recipe {  <span style="opacity:.6">← stays in view while you read inside it</span></div><div style="padding-top:28px;animation:smxCzScroll 4s ease-in-out infinite alternate">${lines(['    let k = n as f32;', '    let steps: Vec&lt;_&gt; = self.steps.iter()', '        .map(|s| s.scale(k)).collect();', '    if steps.is_empty() {', '        return self.clone();', '    }', '    Recipe { serves: n, steps }', '}'])}</div></div><style>@keyframes smxCzScroll{to{transform:translateY(-60px)}}</style>`;
  } });
  CZ.closeup('editor', /smoothScroll|scrollPastEnd|reveal/i, { title: 'Scrolling', draw: (b, info) => {
    const stepped = info.key === 'smoothScroll' && isOff(info);
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}overflow:hidden">${caption(info.key === 'scrollPastEnd' ? 'Lets the last line travel up the window, leaving empty room under it.' : info.key === 'reveal' ? 'New lines ease in as they arrive.' : stepped ? 'Off: the text jumps a few lines at a time.' : 'On: the text glides when you scroll.')}<div style="animation:smxCzScroll2 2.4s ${stepped ? 'steps(6)' : 'ease-in-out'} infinite alternate">${lines(Array.from({ length: 14 }, (_, i) => 'step_' + (i + 1) + '();'))}</div></div><style>@keyframes smxCzScroll2{to{transform:translateY(-110px)}}</style>`;
  } });
  CZ.closeup('editor', /^(scanlines|glow)|text glow/i, { title: 'Screen effects', draw: (b, info) => {
    const on = !isOff(info), scan = info.key === 'scanlines';
    b.innerHTML = `<div style="position:absolute;inset:12px;display:grid;align-content:start;gap:8px">${caption(scan ? 'Thin dark lines across the text, like an old screen. Drawn large here.' : 'A soft light around the letters. Drawn large here.')}<div style="position:relative;padding:12px 14px;border-radius:6px;border:1px solid color-mix(in srgb, currentColor 22%, transparent);font:28px/1.3 var(--pm-font-code, ui-monospace, monospace);${!scan && on ? 'text-shadow:0 0 10px currentColor, 0 0 2px currentColor;' : ''}">fn scaled()${scan && on ? '<i style="position:absolute;inset:0;border-radius:6px;background:repeating-linear-gradient(to bottom, transparent 0 3px, rgb(0 0 0 / .32) 3px 4px)"></i>' : ''}</div><div style="font:11.5px/1.4 var(--body-font, inherit);opacity:.7">${on ? 'On' : 'Off'}</div></div>`;
  } });
  CZ.closeup('editor', /tabSize|insertSpaces|detectIndent/i, { title: 'Indentation', draw: (b, info) => {
    const n = Number(String(info.choice || info.value).replace(/\D+/g, '')) || 4;
    const pad = (k) => '<span style="opacity:.4">' + '·'.repeat(n * k) + '</span>';
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}">${caption(info.key === 'tabSize' ? `Each level is pushed in by ${n} spaces.` : info.key === 'insertSpaces' ? 'Whether pressing Tab types spaces or one tab character. It looks the same; other tools may care.' : 'Reads each file and keeps the indentation it already uses.')}${lines(['fn plan() {', pad(1) + 'for step in steps {', pad(2) + 'cook(step);', pad(1) + '}', '}'])}</div>`;
  } });
  CZ.closeup('editor', /diffLayout/i, { title: 'How changes are shown', draw: (b, info) => {
    const side = /side/i.test(info.choice + info.value);
    const pane = (t, add) => `<div style="flex:1;border:1px solid color-mix(in srgb, currentColor 25%, transparent);border-radius:6px;padding:6px 8px;${mono}"><div style="font:600 11px/1.4 var(--body-font, inherit);opacity:.7;margin-bottom:4px">${t}</div>${add}</div>`;
    const del = '<div style="background:rgb(240 80 80 / .18)">- serves: 2</div>', ins = '<div style="background:rgb(60 200 120 / .18)">+ serves: 4</div>';
    b.innerHTML = `<div style="position:absolute;inset:12px;display:grid;align-content:start;gap:8px">${caption(side ? 'Side by side: the old file on the left, the new one on the right.' : 'In one column: the removed line above the line that replaced it.')}<div style="display:flex;gap:10px">${side ? pane('Before', del) + pane('After', ins) : pane('Changes', del + ins)}</div></div>`;
  } });
})(window);
