/* Settings managers, rethought (Fable 5.2): the look customizers, part two.
   smx-customizers.css keeps the example beside the options, at full size, for as long as a dialog is open. (PMConcept7
   leaves its example at the top of one long scroll and lets a small copy, 389 by 176, follow you down.) This file
   does the rest of what the owner asked for: "make sure that example section actually shows what is being changed".
   - The options are tabs, one group at a time, instead of one scroll eight windows long ("Everything" still shows the
     long list).
   - A line under the example names what you just changed, in the words on screen, and says where in the example to
     look. PMConcept7's own notes (it has one for rulers and one for indentation) are quoted in that line.
   - Where PMConcept7 already has a "Try it" for that kind of change (move the caret, type, go to a problem, step
     back, ring the bell) it is run for you.
   - What the example shows by itself was measured in this layout, option by option (the share of the example's
     pixels that change). Most options show well. A few change very little (ligatures 0.13 %, indent guides 0.33 %) or
     nothing (rulers, how changes are laid out, tab size): for those a close-up appears under the example. It never
     covers the example.
   - Customize Pip and Adjust NieR keep their picture at the top of the sheet, with the same line under it.
   The dialogs are PMConcept7's own; nothing in them is rebuilt (window.SMX.cz). */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.cz) return;
  const D = W.document;
  const CZ = SMX.cz = { paused: false };   // paused: a test is measuring what a dialog shows by itself
  const esc = SMX.h;
  const T = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const txt = (n, sel) => { const x = n && n.querySelector(sel); return x ? T(x.textContent) : ''; };
  /* the first words written on a control, past any drawing it carries (a tile's little picture is not its name) */
  const firstText = (n) => { const w = D.createTreeWalker(n, W.NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { const s = T(t.nodeValue); if (s && !t.parentElement.closest('svg, [aria-hidden="true"], [class*="art"], [class*="demo"], [class*="pv"]')) return s; } return ''; };

  /* ------------------------------------------------------------------ which choice was touched, in the words on screen */
  function describe(target, root) {
    // a preset of the Pip editor (Full, Quiet, Still, Plain): a plain button with no key, and the choice a newcomer is
    // most likely to press. It said nothing (review R1, F11).
    const preset = target.closest && target.closest('[data-pipe-preset]');
    if (preset) return { key: 'preset', name: 'Preset', choice: firstText(preset) || T(preset.textContent), help: txt(preset, 'small'), kind: 'preset', group: 'Presets', groupKey: '', root, ctl: preset, value: preset.dataset.pipePreset || '' };
    const ctl = target.closest('button, input, select, textarea, [role="switch"], [role="radio"], [role="option"], [role="slider"]');
    if (!ctl || ctl.closest('.pmt-cz-top, .pmt-cz-nav, .pmt-cz-head, .pmt-cz-foot, .smx-cz-closeup, .smx-cz-said, .pmt-cz-ghead, .pmt-cz-findrow, .pipe-top, .o55nc-top, .pipe-ghead')) return null;
    const keyEl = ctl.closest('[data-key], [data-tok], [data-pipe-part], [data-o55nc-key], [data-part], [data-chip], [data-opt]');
    const key = keyEl ? (keyEl.dataset.key || keyEl.dataset.tok || keyEl.dataset.pipePart || keyEl.dataset.o55ncKey || keyEl.dataset.part || keyEl.dataset.chip || keyEl.dataset.opt || '') : '';
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
    return { key, name: name.slice(0, 60), choice: choice.split(/ {2,}/)[0].slice(0, 40), help, kind, group, groupKey: groupEl ? (groupEl.dataset.group || '') : '', root, ctl, value: keyEl && keyEl.dataset.value != null ? keyEl.dataset.value : '' };
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
    if (info.kind === 'preset') return `You chose the preset <b>${esc(info.choice)}</b>.`;
    if (info.kind === 'switch') return `You turned <b>${esc(info.name)}</b> ${info.on ? 'on' : 'off'}.`;
    if (info.kind === 'amount') return `<b>${esc(info.name)}</b> is now <b>${esc(info.choice)}</b>.`;
    if (info.choice && info.choice.toLowerCase() === info.name.toLowerCase()) return `You chose <b>${esc(info.choice)}</b>.`;   // "Blink is now Blink"
    return info.choice ? `<b>${esc(info.name)}</b> is now <b>${esc(info.choice)}</b>.` : `You changed <b>${esc(info.name)}</b>.`;
  };

  /* ------------------------------------------------------------------ what the example does for each option
     Measured 2026-11-11 in this layout with PMConcept7's own live example (share of its pixels that change when the
     option is switched; a still example changes 0.02 %):
       editor    smooth scrolling 20.7, scroll past end 16.2, text glow 10.5, scanlines 7.4, fade editors 4.7,
                 highlight the line 3.4, wrap 2.4, bold keywords 0.8, bracket pairs 0.5, indent guides 0.33,
                 line numbers 0.25, show spaces 0.2, ligatures 0.13, problems 0.13; nothing: rulers, how changes are
                 laid out, saving by itself, tab size, tabs or spaces
       terminal  bezel 26.8, phosphor glow 11.7, full CRT 10.7, dim terminals 5.5, font rendering 2.4, scanlines 2.0,
                 minimum contrast 1.1, bold as bright 0.4; nothing at rest: cursor shape and trail (they show when
                 the cursor moves), flicker (it is slow and faint), the bell, copy on highlight
     try:    PMConcept7's own "Try it" button that shows the change; it is pressed for you
     where:  where in the example to look
     small:  the change is real but tiny; the close-up shows it larger
     none:   the example cannot show it; the close-up (or the plain truth) stands in
     up:     the close-up drawn under the example */
  const EDITOR = [
    [/^caret/, { try: 'try-move', where: 'The caret just moved through the example so you can see it.' }],
    [/^(font|fontSize|fontWeight|lineHeight|letterSpacing)$/, { try: 'try-type', where: 'A few letters were just typed into the example in it.' }],
    [/^ligatures$/, { small: true, where: 'Look at -> on line 3 and != on line 7 of the example.', up: 'ligatures' }],
    [/^(scheme|schemePair|syntax|contrast|italicComments|boldKeywords)$|^tok/, { where: 'Look at the comment on line 1 and the coloured words below it.' }],
    [/^bracketPairs$/, { where: 'Look at the nested brackets on lines 6 to 8.' }],
    [/^lineNumberMode$/, { where: 'Look at the numbers down the left edge.' }],
    [/^lineHighlight$/, { where: 'Look at line 4, where the caret is.' }],
    [/^(indentGuides|activeIndent)$/, { small: true, where: 'Look at the thin lines down the left of lines 4 to 9.', up: 'guides' }],
    [/^whitespace$/, { where: 'Look for the faint dots between the words, and at the ends of lines.' }],
    [/^rulers$/, { none: true, up: 'rulers' }],
    [/^(wordWrap|wrapColumn)$/, { where: 'Look at the long line near the bottom: it folds, or runs off the side.' }],
    [/^minimap$/, { where: 'Look at the right edge of the example.' }],
    [/^(stickyScroll|stickyLines)$/, { none: true, up: 'sticky', why: 'The sample is too short to scroll.' }],
    [/^(smoothScroll|scrollPastEnd|reveal)$/, { where: 'The example scrolls by itself to show it.' }],
    [/^inactiveDim$/, { try: 'try-dim', where: 'The example just dimmed the way an editor you are not in will.' }],
    [/^(scanlines|glow)$/, { where: 'It draws over the whole example.' }],
    [/^(diagnostics|gotoHighlightMs)$/, { try: 'try-problem', where: 'The example just jumped to a problem to show it.' }],
    [/^diffLayout$/, { none: true, up: 'diff' }],
    [/^tabSize$/, { none: true, up: 'tabs' }],
    [/^(autosave|insertSpaces|detectIndent)$/, { none: true, why: 'This one changes how the editor behaves, not how it looks.' }]
  ];
  const TERMINAL = [
    [/^cursor/, { try: 'try-cursor', where: 'The cursor just moved through the example so you can see it.' }],
    [/^bell$/, { try: 'try-bell', where: 'The bell just rang in the example.', off: 'A bell was just sent to the example, and it stayed quiet.' }],
    [/^inactiveDim$/, { try: 'try-dim', where: 'The example just dimmed the way a terminal you are not in will.' }],
    [/^(crt|curvature)$/, { try: 'degauss', where: 'Look at the curved glass and the corners of the example.' }],
    [/^flicker$/, { where: 'It is slow and faint on purpose: watch the example for a few seconds.' }],
    [/^(scanlines|scanStrength|glow|glowStrength|burnIn|crtMask|noise|effects)$/, { where: 'It draws over the whole example: look at the bright text and the edges.' }],
    [/^bezel/, { where: 'Look at the frame around the example.' }],
    [/^(ground|bg|opacity|padding)/, { where: 'Look behind the text of the example.' }],
    [/^(scheme|schemePair|minContrast|font|fontSize|fontWeight|lineHeight|letterSpacing|fontRendering|ligatures|boldBright|sixtyfour)/, { where: 'All the text in the example redraws with it.' }],
    [/^(copyOnSelect|stickyHeader|smoothScroll)$/, { none: true, why: 'This one changes how the terminal behaves, not how it looks.' }]
  ];
  const ruleFor = (kind, key) => { const hit = (kind === 'editor' ? EDITOR : kind === 'terminal' ? TERMINAL : []).find(([re]) => re.test(key)); return hit ? hit[1] : null; };
  function pressTry(root, act) {
    const b = root.querySelector(`.pmt-cz-top [data-act="${act}"]`);
    if (!b || b.hidden || b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
    W.setTimeout(() => { if (b.isConnected) b.click(); }, 220);
    return true;
  }

  /* ------------------------------------------------------------------ the line under the example, and close-ups */
  const said = (root) => root.querySelector('.smx-cz-said');
  const setSaid = (line, kind, html) => { line.setAttribute('data-kind', kind); line.querySelector('.smx-cz-said-text').innerHTML = html; };
  const closeCloseup = (root) => { const c = root.querySelector('.smx-cz-closeup'); if (c) c.remove(); };
  /* PMConcept7's own notes about an option (rulers, indentation): whatever it says now that it did not say before */
  const notesOf = (root) => [...root.querySelectorAll('.pmt-cz-note, .pmt-cz-pnote')].map((n) => T(n.textContent)).filter(Boolean);
  const dot = (t) => { const x = T(t); return !x || /[.!?…]$/.test(x) ? x : x + '.'; };   // PMConcept7's short helps end without a full stop
  function say(root, kind, info, before) {
    const line = said(root); if (!line) return;
    settle(info);
    const preview = root.querySelector('.pmt-cz-preview, .pipe-stage, .o55nc-pv');
    closeCloseup(root);
    if (kind === 'pip') {
      const play = root.querySelector('.pipe-play');
      const can = play && play.getAttribute('aria-disabled') !== 'true' && (info.kind === 'preset' || /faces|motion|look/i.test(info.group));
      if (can) W.setTimeout(() => { if (play.isConnected) play.click(); }, 220);
      setSaid(line, 'plain', `${sentence(info)} ${esc(dot(info.help))} ${can ? 'The five Pips above are playing it now.' : /sound/i.test(info.group) ? 'This one you hear, not see.' : 'It shows in the app itself, where Pip appears.'}`);
    } else if (kind === 'nier') {
      setSaid(line, 'plain', `${sentence(info)} ${esc(dot(info.help))} ${/look|pointer/i.test(info.group) ? 'Look at the small menu above, and at the page behind this sheet.' : 'It shows in the app itself: look at the page behind this sheet.'}`);
    } else {
      const rule = ruleFor(kind, info.key) || {};
      const own = notesOf(root).find((t) => !before.includes(t));                          // the dialog's own note, if it wrote one
      const ownText = own ? ` The dialog says: “${esc(own)}”` : '';
      const off = info.on === false || /^(off|none)$/i.test(info.choice);
      let where = '';
      if (rule.try && pressTry(root, rule.try)) where = (off && rule.off) || rule.where;
      else if (rule.none) where = rule.why || 'The sample cannot show this one.';
      else if (rule.small) where = `It is a small change. ${rule.where}`;
      else where = rule.where || (info.groupKey === 'behavior' ? 'This one changes how it behaves, not how it looks, so the example stays as it is.' : 'The example shows it now.');
      const up = rule.up && UPS[rule.up];
      if (up) {
        const c = D.createElement('div'); c.className = 'smx-cz-closeup';
        c.innerHTML = `<div class="smx-cz-closeup-cap"><span>Close-up: <b>${esc(up.title)}</b></span><button type="button" data-smx-cz-back>Hide</button></div><div class="smx-cz-closeup-body"></div>`;
        line.insertAdjacentElement('afterend', c);
        try { up.draw(c.querySelector('.smx-cz-closeup-body'), info); } catch (e) { W.console.error('close-up failed', e); }
        c.querySelector('[data-smx-cz-back]').addEventListener('click', () => closeCloseup(root));
        // stacked (a narrow dialog) the close-up takes the example's place, so the sentence does not send you to the example
        const bodyEl = root.querySelector('.pmt-cz-body');
        const stacked = !!bodyEl && W.getComputedStyle(bodyEl).gridTemplateColumns.trim().split(/\s+/).length < 2;
        if (stacked) where = rule.none ? `${rule.why || 'The sample cannot show this one.'} A close-up shows it; “Hide” brings the example back.` : 'It is a small change, so a close-up shows it larger; “Hide” brings the example back.';
        else where += rule.none ? ' A close-up shows it.' : ' The close-up shows it larger.';
      }
      setSaid(line, up ? 'closeup' : 'plain', `${sentence(info)} ${esc(where)}${ownText}`);
      bringLines(root, where);
    }
    if (preview) { preview.classList.remove('smx-cz-pulse'); void preview.offsetWidth; preview.classList.add('smx-cz-pulse'); }
  }

  /* When the dialog is narrow the example sits above the options and shows about six lines of its sample. A sentence
     that says "look at line 7" then points outside it (review R1, F10): the sample is scrolled, inside its own box, so
     that the lines named are in it. A full-size example shows every line and is left alone. */
  function bringLines(root, text) {
    const sc = root.querySelector('.pmt-cz-preview .pmw-ed-scroll'); if (!sc || sc.scrollHeight <= sc.clientHeight + 4) return;
    const nums = []; String(text || '').replace(/lines? (\d+)(?: (?:to|and) (?:line )?(\d+))?/gi, (m, a, b) => { nums.push(Number(a)); if (b) nums.push(Number(b)); return m; });
    if (!nums.length) return;
    const lh = parseFloat(W.getComputedStyle(sc).lineHeight) || 20;
    const first = Math.min(...nums), last = Math.max(...nums);
    const mid = ((first + last) / 2 - 0.5) * lh, span = (last - first + 1) * lh;
    const top = span >= sc.clientHeight ? (first - 1) * lh : mid - sc.clientHeight / 2;
    sc.scrollTop = Math.max(0, Math.min(sc.scrollHeight - sc.clientHeight, Math.round(top)));
  }
  /* The options jump to a group by scrolling it to the top of their box. Stacked under the example, "the top" is behind
     the example, so the group's heading was hidden: the jump lands under the example instead. */
  function landUnder(root) {
    const body = root.querySelector('.pmt-cz-body'), top = root.querySelector('.pmt-cz-body > .pmt-cz-top'); if (!body || !top) return;
    const stacked = W.getComputedStyle(body).gridTemplateColumns.trim().split(/\s+/).length < 2;
    const want = stacked ? `${Math.round(top.getBoundingClientRect().height) + 14}px` : '';
    if (body.style.scrollPaddingTop !== want) body.style.scrollPaddingTop = want;
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
      if (SMX.view !== 'new' || CZ.paused) return;
      const info = describe(e.target, root); if (!info) return;
      const now = Date.now(); if (now - last < 60) return; last = now;
      const before = notesOf(root);
      W.setTimeout(() => say(root, kind, info, before), 60);
    };
    root.addEventListener('click', on, true);
    root.addEventListener('change', on, true);
  }
  function scan() {
    if (SMX.view !== 'new') return;
    for (const root of D.querySelectorAll('.pmt-cz:not(.pmt-cz-parked)')) {
      if (!root.querySelector('.pmt-cz-dialog') || root.getBoundingClientRect().width < 50) continue;
      attach(root, root.classList.contains('pmed-cz') ? 'editor' : 'terminal', '.pmt-cz-preview');
      landUnder(root);
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

  /* ------------------------------------------------------------------ close-ups: small drawings for what the sample cannot show,
     or shows too small to notice. They sit under the example, never over it, and read what was just chosen. */
  const mono = 'font: 12px/1.6 var(--pm-font-code, ui-monospace, monospace); white-space: pre;';
  const lines = (arr) => arr.map((l, i) => `<div style="display:flex;gap:10px"><span style="opacity:.45;width:18px;text-align:right">${i + 1}</span><span>${l}</span></div>`).join('');
  const caption = (text) => `<div style="opacity:.75;margin-bottom:6px;white-space:normal;font:11.5px/1.4 var(--body-font, inherit)">${text}</div>`;
  const isOff = (info) => info.on === false || /^(off|false|none|0)$/i.test(String(info.value));
  const UPS = {
    ligatures: { title: 'Ligatures', draw: (b, info) => {
      const on = !isOff(info);
      const pair = (label, glyphs, chosen) => `<div style="flex:1;border:1px solid color-mix(in srgb, currentColor ${chosen ? 70 : 22}%, transparent);border-radius:6px;padding:6px 10px"><div style="font:600 11px/1.4 var(--body-font, inherit);opacity:.75;margin-bottom:2px">${label}${chosen ? ' (your choice)' : ''}</div><div style="font:26px/1.2 ui-monospace, 'JetBrains Mono', monospace;white-space:pre">${glyphs}</div></div>`;
      b.innerHTML = `<div style="display:grid;gap:6px;padding:8px 10px">${caption('The same four pairs, drawn large. With ligatures on, each pair joins into one symbol; you still type two characters.')}<div style="display:flex;gap:8px">${pair('On', '→  ≠  ⇒  ≥', on)}${pair('Off', '-&gt;  !=  =&gt;  &gt;=', !on)}</div></div>`;
    } },
    rulers: { title: 'Rulers', draw: (b, info) => {
      const cols = String(info.value || info.choice).split(/[^\d]+/).map(Number).filter(Boolean);
      const col = cols[0] || 0;
      b.innerHTML = `<div style="position:relative;padding:8px 10px;${mono}">${caption(cols.length ? `A faint line at column ${cols.join(' and ')}, to show where a line gets long. The sample is narrower than that.` : 'No ruler.')}${lines(['// a line that runs past the ruler so you can see where it sits ............', 'let total = steps.iter().map(|s| s.minutes).sum::&lt;u32&gt;();', 'short();'])}${col ? `<i style="position:absolute;top:30px;bottom:6px;left:calc(38px + ${Math.min(col, 96)} * .5ch);border-left:1px solid currentColor;opacity:.5"></i>` : ''}</div>`;
    } },
    guides: { title: 'Indent guides', draw: (b, info) => {
      const hay = (info.choice + ' ' + info.value).toLowerCase();
      const off = /off|none/.test(hay) && info.key === 'indentGuides', rainbow = /rainbow/.test(hay);
      const g = (n) => Array.from({ length: n }, (_, i) => `<i style="display:inline-block;width:2ch;border-left:1px solid ${off ? 'transparent' : rainbow ? ['var(--k3-red)', 'var(--k3-amber)', 'var(--k3-green)', 'var(--k3-blue)'][i % 4] : 'currentColor'};opacity:${rainbow ? .9 : .4}">&nbsp;</i>`).join('');
      b.innerHTML = `<div style="padding:8px 10px;${mono}">${caption('The thin lines that show how deep each line sits, here five levels deep.')}${lines(['fn plan(recipe: &Recipe) {', g(1) + 'for step in &recipe.steps {', g(2) + 'if step.needs_oven {', g(3) + 'match step.heat {', g(4) + 'Heat::High =&gt; preheat(220),', g(3) + '}'])}</div>`;
    } },
    sticky: { title: 'Sticky scroll', draw: (b) => {
      b.innerHTML = `<div style="position:relative;height:118px;padding:8px 10px;${mono}overflow:hidden"><div style="position:absolute;left:10px;right:10px;top:8px;padding:2px 0;border-bottom:1px solid color-mix(in srgb, currentColor 30%, transparent);background:var(--pmt-cz-ground,Canvas);z-index:1">impl Recipe {  <span style="opacity:.6">← stays in view while you read inside it</span></div><div style="padding-top:26px;animation:smxCzScroll 4s ease-in-out infinite alternate">${lines(['    let k = n as f32;', '    let steps: Vec&lt;_&gt; = self.steps.iter()', '        .map(|s| s.scale(k)).collect();', '    if steps.is_empty() {', '        return self.clone();', '    }', '    Recipe { serves: n, steps }'])}</div></div><style>@keyframes smxCzScroll{to{transform:translateY(-60px)}}</style>`;
    } },
    tabs: { title: 'Tab size', draw: (b, info) => {
      const n = Number(String(info.choice || info.value).replace(/\D+/g, '')) || 4;
      const pad = (k) => '<span style="opacity:.4">' + '·'.repeat(n * k) + '</span>';
      b.innerHTML = `<div style="padding:8px 10px;${mono}">${caption(`Each level is pushed in by ${n} spaces. The sample file keeps its own indentation, so it does not move.`)}${lines(['fn plan() {', pad(1) + 'for step in steps {', pad(2) + 'cook(step);', pad(1) + '}', '}'])}</div>`;
    } },
    diff: { title: 'How changes are shown', draw: (b, info) => {
      const side = /side/i.test(info.choice + info.value);
      const pane = (t, add) => `<div style="flex:1;border:1px solid color-mix(in srgb, currentColor 25%, transparent);border-radius:6px;padding:6px 8px;${mono}"><div style="font:600 11px/1.4 var(--body-font, inherit);opacity:.7;margin-bottom:4px">${t}</div>${add}</div>`;
      const del = '<div style="background:rgb(240 80 80 / .18)">- serves: 2</div>', ins = '<div style="background:rgb(60 200 120 / .18)">+ serves: 4</div>';
      b.innerHTML = `<div style="display:grid;gap:6px;padding:8px 10px">${caption(side ? 'Side by side: the old file on the left, the new one on the right. You see it when you open a change, not in this sample.' : 'In one column: the removed line above the line that replaced it. You see it when you open a change, not in this sample.')}<div style="display:flex;gap:8px">${side ? pane('Before', del) + pane('After', ins) : pane('Changes', del + ins)}</div></div>`;
    } }
  };
})(window);
