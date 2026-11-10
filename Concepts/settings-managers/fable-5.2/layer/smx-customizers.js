/* Settings managers, rethought (Fable 5.2): the look customizers, part two.
   smx-customizers.css keeps the example beside the options. This file makes the example answer the second complaint:
   "make sure that example section actually shows what is being changed".
   - Under the example a line names what you just changed and says where in the example to look; the example's frame
     pulses once so the eye goes there.
   - Some choices cannot be seen in a fifteen-line sample at rest (a ruler at column 80, wrapping, a scroll effect, a
     second editor that fades). For those the example turns into a close-up: a small drawing made for that one choice,
     which reads the value you picked. "Back to the example" (or the next change elsewhere) returns to the live sample.
   The dialogs are PMConcept7's; this only adds the line and the close-ups (window.SMX.cz).

   SMX.cz.note(dialog, /label pattern/, 'where to look')               a hint for a choice the sample does show
   SMX.cz.closeup(dialog, /label pattern/, {title, draw(body, info)})  a close-up for a choice it cannot show
   dialog: 'editor' | 'terminal' | 'pip' | 'nier'. info: {label, group, value, root}. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.cz) return;
  const D = W.document;
  const CZ = SMX.cz = { notes: { editor: [], terminal: [], pip: [], nier: [] }, closeups: { editor: [], terminal: [], pip: [], nier: [] } };
  CZ.note = (dialog, pattern, text) => { CZ.notes[dialog].push([pattern, text]); };
  CZ.closeup = (dialog, pattern, def) => { CZ.closeups[dialog].push([pattern, def]); };
  const esc = SMX.h;
  const T = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  /* ------------------------------------------------------------------ which choice was touched, in the words on screen */
  function describe(target, root) {
    const ctl = target.closest('button, input, select, textarea, [role="switch"], [role="radio"], [role="option"], [role="slider"], label');
    if (!ctl || ctl.closest('.pmt-cz-top, .pmt-cz-nav, .pmt-cz-head, .pmt-cz-foot, .smx-cz-closeup, .pmt-cz-ghead, .pmt-cz-findrow')) return null;
    const keyEl = ctl.closest('[data-key], [data-tok], [data-part], [data-opt]');
    const key = keyEl ? (keyEl.dataset.key || keyEl.dataset.tok || keyEl.dataset.part || keyEl.dataset.opt || '') : '';
    const group = ctl.closest('.pmt-cz-group, .o55nc-group, .pipe-group, [data-group]');
    const head = group ? group.querySelector('h3, h4, .pmt-cz-gtitle, .o55nc-gtitle') : null;
    const first = (n) => { if (!n) return ''; for (const c of n.childNodes) { const t = T(c.textContent); if (t && !(c.nodeType === 1 && /^(svg|small|i)$/i.test(c.tagName)) && !(c.classList && /specimen|swatch|demo|pv|art/.test(c.className))) return t; } return T(n.textContent); };
    let label = '';
    const field = ctl.closest('.pmt-cz-field');
    if (ctl.matches('.pmt-cz-chip')) label = first(ctl.querySelector('.pmt-cz-chipcopy, .pmt-cz-chiptext') || ctl);
    else if (ctl.matches('.pmt-cz-tile')) label = (ctl.dataset.name ? ctl.dataset.name.replace(/^./, (c) => c.toUpperCase()) : '') || T((ctl.querySelector('b, strong, .pmt-cz-tilename, .pmt-cz-tname') || {}).textContent) || T(ctl.getAttribute('aria-label'));
    else if (ctl.matches('.pmt-cz-segopt') && field) label = first(field.querySelector('.pmt-cz-flabel, .pmt-cz-fname, label, span') || field) + ': ' + (T(ctl.getAttribute('aria-label')) || first(ctl));
    else if (ctl.dataset.pmHoverLabel) label = ctl.dataset.pmHoverLabel;
    if (!label) label = T(ctl.getAttribute('aria-label')) || first(ctl.closest('label') || ctl);
    label = label.split(/ {2,}|\n/)[0].slice(0, 64);
    let value = keyEl && keyEl.dataset.value != null ? keyEl.dataset.value : '';
    if (ctl.matches('input[type="range"], input[type="number"]')) value = ctl.value;
    else if (ctl.getAttribute('aria-pressed') != null && !value) value = ctl.getAttribute('aria-pressed') === 'true' ? 'on' : 'off';
    else if (ctl.getAttribute('aria-checked') != null && !value) value = ctl.getAttribute('aria-checked') === 'true' ? 'on' : 'off';
    else if (ctl.matches('input[type="checkbox"]')) value = ctl.checked ? 'on' : 'off';
    return { key, label: label || key, group: head ? T(head.textContent).split(/ {2,}/)[0] : '', value, root, ctl };
  }

  /* ------------------------------------------------------------------ the line under the example, and close-ups */
  function said(root) { return root.querySelector('.smx-cz-said'); }
  function closeCloseup(root) { const c = root.querySelector('.smx-cz-closeup'); if (c) c.remove(); }
  function say(root, kind, info) {
    const line = said(root); if (!line) return;
    const preview = root.querySelector('.pmt-cz-preview, .pipe-stage, .o55nc-pv');
    const notes = CZ.notes[kind] || [], ups = CZ.closeups[kind] || [];
    const hay = `${info.key} ${info.label}`;
    const up = ups.find(([re]) => re.test(hay));
    const note = notes.find(([re]) => re.test(hay)) || notes.find(([re]) => info.group && re.test(info.group));
    closeCloseup(root);
    if (up && preview) {
      const box = root.querySelector('.pmt-cz-pvbox') || preview;
      const c = D.createElement('div'); c.className = 'smx-cz-closeup';
      c.innerHTML = `<div class="smx-cz-closeup-cap"><span>Close-up: <b>${esc(up[1].title || info.label)}</b></span><button type="button" data-smx-cz-back>Back to the example</button></div><div class="smx-cz-closeup-body"></div>`;
      box.appendChild(c);
      try { up[1].draw(c.querySelector('.smx-cz-closeup-body'), info); } catch (e) { W.console.error('close-up failed', e); }
      c.querySelector('[data-smx-cz-back]').addEventListener('click', () => { closeCloseup(root); line.setAttribute('data-kind', 'plain'); line.innerHTML = `<span class="smx-cz-said-mark"></span><span>Back on the live example.</span>`; });
      line.setAttribute('data-kind', 'closeup');
      line.innerHTML = `<span class="smx-cz-said-mark"></span><span>You changed <b>${esc(info.label)}</b>${info.group ? ' in ' + esc(info.group) : ''}. The sample text cannot show this one at rest, so the example is showing a close-up of it.</span>`;
    } else {
      line.setAttribute('data-kind', 'plain');
      line.innerHTML = `<span class="smx-cz-said-mark"></span><span>You changed <b>${esc(info.label)}</b>${info.group ? ' in ' + esc(info.group) : ''}. ${esc(note ? note[1] : 'The example shows it now.')}</span>`;
    }
    if (preview) { preview.classList.remove('smx-cz-pulse'); void preview.offsetWidth; preview.classList.add('smx-cz-pulse'); }
  }

  /* ------------------------------------------------------------------ attach to a dialog when it opens */
  function attach(root, kind, afterSel) {
    if (said(root)) return;
    const after = root.querySelector(afterSel); if (!after) return;
    const line = D.createElement('div'); line.className = 'smx-cz-said'; line.setAttribute('data-kind', 'plain'); line.setAttribute('aria-live', 'polite');
    line.innerHTML = '<span class="smx-cz-said-mark"></span><span>Pick anything. This example stays here and shows it at once.</span>';
    after.insertAdjacentElement('afterend', line);
    let last = 0;
    const on = (e) => {
      if (SMX.view !== 'new') return;
      const info = describe(e.target, root); if (!info || !info.label) return;
      const now = Date.now(); if (now - last < 60) return; last = now;
      W.setTimeout(() => say(root, kind, info), 30);
    };
    root.addEventListener('click', on, true);
    root.addEventListener('change', on, true);
    root.addEventListener('input', on, true);
  }
  function scan() {
    if (SMX.view !== 'new') return;
    for (const root of D.querySelectorAll('.pmt-cz:not(.pmt-cz-parked)')) {
      if (!root.querySelector('.pmt-cz-dialog') || root.getBoundingClientRect().width < 50) continue;
      attach(root, root.classList.contains('pmed-cz') ? 'editor' : 'terminal', '.pmt-cz-preview');
    }
    for (const top of D.querySelectorAll('.pipe-top')) { const root = top.closest('.pm51-drawer-wrap, [role="dialog"], .pipe-pop') || top.parentElement; if (root) attach(root, 'pip', '.pipe-top'); }
    for (const top of D.querySelectorAll('.o55nc-top')) { const root = top.closest('.pm51-drawer-wrap, [role="dialog"], .o55nc-panel') || top.parentElement; if (root) attach(root, 'nier', '.o55nc-top'); }
  }
  W.setInterval(scan, 600);

  /* ------------------------------------------------------------------ hints for choices the live sample does show */
  CZ.note('editor', /ligature/i, 'Look at -> on line 3 and != on line 7 of the example.');
  CZ.note('editor', /bracket/i, 'Look at the nested brackets on lines 6 to 8.');
  CZ.note('editor', /line numbers|relative/i, 'Look at the numbers down the left edge.');
  CZ.note('editor', /minimap/i, 'Look at the right edge of the example.');
  CZ.note('editor', /caret|cursor/i, 'Watch the caret on line 4. “Move the caret” under the example makes it travel.');
  CZ.note('editor', /highlight the current line|current line/i, 'Look at line 4, where the caret is.');
  CZ.note('editor', /italic|bold|token|keyword|comment/i, 'Look at the comment on line 1 and the coloured words below it.');
  CZ.note('editor', /font|size|weight|spacing/i, 'All the text in the example redraws with it.');
  CZ.note('terminal', /cursor|caret/i, 'Watch the cursor on the last line. “Move the cursor” under the example makes it travel.');
  CZ.note('terminal', /scanline|glow|crt|curvature|burn|grain|flicker|mask/i, 'These draw over the whole example: look at its edges and at the bright text.');
  CZ.note('terminal', /bezel/i, 'Look at the frame around the example.');
  CZ.note('terminal', /background|gradient|image|pattern|opacity|padding/i, 'Look behind the text of the example.');
  CZ.note('pip', /face|motion|look|sound|appear/i, 'Watch the five Pips at the top. “Play: the team works” runs them through their states.');

  /* ------------------------------------------------------------------ close-ups: small drawings for what the sample cannot show
     Each reads what it can from the choice just made; they stand for the real surface, which a native build would use. */
  const mono = 'font: 12px/1.6 var(--pm-font-code, ui-monospace, monospace); white-space: pre;';
  const lines = (arr) => arr.map((l, i) => `<div style="display:flex;gap:10px"><span style="opacity:.45;width:18px;text-align:right">${i + 1}</span><span>${l}</span></div>`).join('');
  CZ.closeup('editor', /ruler/i, { title: 'Rulers', draw: (b, info) => {
    const col = Number(String(info.value).replace(/\D+/g, '')) || 80;
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}">${lines(['// a line that runs past the ruler so you can see where it sits ............', 'let total = steps.iter().map(|s| s.minutes).sum::&lt;u32&gt;();', 'short();'])}<i style="position:absolute;top:0;bottom:0;left:calc(28px + ${Math.min(col, 96)} * .5ch);border-left:1px solid currentColor;opacity:.45"></i><span style="position:absolute;bottom:0;left:calc(34px + ${Math.min(col, 96)} * .5ch);font-size:11px;opacity:.7">column ${col}</span></div>`;
  } });
  CZ.closeup('editor', /wrap/i, { title: 'Wrapping long lines', draw: (b, info) => {
    const on = info.value !== 'off';
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}${on ? 'white-space:pre-wrap;' : ''}overflow:hidden"><div style="opacity:.6;margin-bottom:6px;white-space:normal;font:11px/1.4 inherit">${on ? 'On: the long line folds, so nothing runs off the side.' : 'Off: the long line runs off the side and you scroll sideways.'}</div>format!("Serves {} people and takes {} minutes from start to finish, including the time it rests", recipe.serves, recipe.total_minutes())</div>`;
  } });
  CZ.closeup('editor', /indent ?guide|guidesActive|light the guide|rainbow/i, { title: 'Indent guides', draw: (b, info) => {
    const rainbow = /rainbow/i.test(info.label + ' ' + info.value);
    const g = (n) => Array.from({ length: n }, (_, i) => `<i style="display:inline-block;width:2ch;border-left:1px solid ${rainbow ? ['#e06c75', '#e5c07b', '#98c379', '#61afef'][i % 4] : 'currentColor'};opacity:${rainbow ? .9 : .4}">&nbsp;</i>`).join('');
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}">${lines(['fn plan(recipe: &Recipe) {', g(1) + 'for step in &recipe.steps {', g(2) + 'if step.needs_oven {', g(3) + 'match step.heat {', g(4) + 'Heat::High =&gt; preheat(220),', g(3) + '}', g(2) + '}', g(1) + '}', '}'])}</div>`;
  } });
  CZ.closeup('editor', /fade editors|inactiveDim/i, { title: 'Editors you are not in', draw: (b, info) => {
    const on = info.value !== 'off';
    const pane = (name, dim) => `<div style="flex:1;border:1px solid currentColor;border-color:color-mix(in srgb, currentColor 30%, transparent);border-radius:6px;padding:8px;opacity:${dim ? .45 : 1};${mono}"><div style="font:600 11px/1.4 inherit;opacity:.7;margin-bottom:4px">${name}</div>fn scaled() {\n  serves * 2\n}</div>`;
    b.innerHTML = `<div style="position:absolute;inset:12px;display:flex;gap:10px">${pane('The editor you are in', false)}${pane('Another editor', on)}</div>`;
  } });
  CZ.closeup('editor', /sticky/i, { title: 'Sticky scroll', draw: (b) => {
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}overflow:hidden"><div style="position:absolute;left:0;right:0;top:0;padding:2px 0;border-bottom:1px solid currentColor;border-color:color-mix(in srgb, currentColor 30%, transparent);background:var(--pmt-cz-ground,#1e1e1e)">impl Recipe {  <span style="opacity:.6">← stays in view while you read inside it</span></div><div style="padding-top:28px;animation:smxCzScroll 4s ease-in-out infinite alternate">${lines(['    let k = n as f32;', '    let steps: Vec&lt;_&gt; = self.steps.iter()', '        .map(|s| s.scale(k)).collect();', '    if steps.is_empty() {', '        return self.clone();', '    }', '    Recipe { serves: n, steps }', '}'])}</div></div><style>@keyframes smxCzScroll{to{transform:translateY(-60px)}}</style>`;
  } });
  CZ.closeup('editor', /smooth ?scroll|scroll ?past|lines arrive|reveal/i, { title: 'Scrolling', draw: (b, info) => {
    b.innerHTML = `<div style="position:absolute;inset:10px 12px;${mono}overflow:hidden"><div style="opacity:.6;margin-bottom:6px;white-space:normal;font:11px/1.4 inherit">${esc(info.label)}: watch the lines move.</div><div style="animation:smxCzScroll2 2.4s ${/smooth/i.test(info.label) && info.value === 'off' ? 'steps(6)' : 'ease-in-out'} infinite alternate">${lines(Array.from({ length: 14 }, (_, i) => 'step_' + (i + 1) + '();'))}</div></div><style>@keyframes smxCzScroll2{to{transform:translateY(-110px)}}</style>`;
  } });
  CZ.closeup('terminal', /bell/i, { title: 'The terminal bell', draw: (b) => {
    b.innerHTML = `<div style="position:absolute;inset:12px;display:grid;place-items:center;text-align:center;font:12px/1.5 inherit"><div><div style="display:inline-block;width:30px;height:30px;animation:smxCzRing 1s ease-in-out infinite">${SMX.icon('bell')}</div><div style="margin-top:6px;opacity:.75;max-width:34ch">A program rings the bell to get your attention. “Ring the bell” under the example plays what you chose.</div></div></div><style>@keyframes smxCzRing{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}</style>`;
  } });
  CZ.closeup('terminal', /dim terminals|inactiveDim/i, { title: 'Terminals you are not in', draw: (b, info) => {
    const on = info.value !== 'off';
    const pane = (name, dim) => `<div style="flex:1;border:1px solid color-mix(in srgb, currentColor 30%, transparent);border-radius:6px;padding:8px;opacity:${dim ? .45 : 1};${mono}"><div style="font:600 11px/1.4 inherit;opacity:.7;margin-bottom:4px">${name}</div>~/tastebook $ cargo test\n   ok</div>`;
    b.innerHTML = `<div style="position:absolute;inset:12px;display:flex;gap:10px">${pane('The terminal you are in', false)}${pane('Another terminal', on)}</div>`;
  } });
})(window);
