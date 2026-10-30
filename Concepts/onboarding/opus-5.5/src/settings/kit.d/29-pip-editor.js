/* O55 · Pip's parts editor (SSYS-056, S1-S9; PM7 build, lane chatpip, 2026-10-29). Like NieR Mode's Plug-in Chips
   (kit.d/22-nier-chips.js): a row editor for general.visual.pip-parts, not a manager; it adds no manager id, route or
   command id. Reads and writes go through window.PM_PIP_PARTS, the one parts registry (found's head module), which
   stores the row per Project (S2) through PM_PIP_PARTS_STORE on the Settings transaction path
   (cmd.settings.transaction.preview / .apply). Parts change Pip in the chat and in setup only (S9): an agent is Pip
   under every preset, and Pip's brand mark, app icon, tray, loader and notification faces never change.
     - Where Pip appears, Faces, Motion, Look, Sound: each part a chip with its line of help, a size and On or Off; a
       click switches it at once (the chat behind follows the change)
     - the meter "On N / 25"; presets Full, Quiet, Still and Plain (S1: no Classic); a preset is a value of the row
     - a live preview: a small team drawn by the chat's own primitive (PM56_SHELL.pmxMark, so it is Pip with the parts
       now chosen), and "Play: the team works" running it from waiting to done
     - Reduce motion: a note on Motion (those parts stay still while it is on, and are kept for when it is off)
     - Sound: Pip's voice plays only while the Project's sound is on; the chat's speaker is that switch
   Local actions, which write nothing (pm7_control_bindings pip.editor.open / .close / .replay):
     ui.settings.pip_editor.open    open(): the Settings row's sheet; popup(): a dialog (the wand's "Pip…", the
                                    title-bar theme menu's "Customize Pip…")
     ui.settings.pip_editor.close   Done, the close button, Escape, the scrim
     ui.settings.pip_editor.replay  Play: the team works
   The concept's own store (localStorage pip-chat:v1) is not carried. Styles: styles.d/17-pip-editor.css. Words: copy
   pipSettings.* (copy.d/49-pip-settings.json) through o55NierCopy. */
(function o55PipEditorModule() {
  const ID = 'general.visual.pip-parts';
  const REG = () => window.PM_PIP_PARTS || null;
  const SHELL = () => window.PM56_SHELL || null;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const say = (key, fallback, vars) => (typeof o55NierCopy === 'function' ? o55NierCopy('pipSettings.' + key, fallback, vars) : fallback);
  const still = () => { try { return !!o55Still(); } catch (e) { return document.documentElement.getAttribute('data-motion') === 'reduced'; } };
  const reducedMotion = () => document.documentElement.getAttribute('data-motion') === 'reduced'
    || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- the preview: a small team, the chat's own primitive ------------------------------------------------- */
  const CAST = [
    { role: 'coordinator', seat: 'lead', state: 'idle', name: 'Coordinator' },
    { role: 'builder', seat: 1, state: 'working', name: 'Builder' },
    { role: 'builder', seat: 2, state: 'queued', name: 'Builder' },
    { role: 'checker', seat: 3, state: 'needs', name: 'Checker' },
    { role: 'critic', seat: 4, state: 'done', name: 'Critic' }
  ];
  /* Play: the team works, step by step (the four helpers; the Coordinator leads throughout) */
  const PLAY = [['queued', 'queued', 'queued', 'queued'], ['working', 'queued', 'working', 'queued'], ['working', 'working', 'done', 'queued'],
    ['done', 'working', 'done', 'needs'], ['done', 'done', 'done', 'done']];
  const WORD = { idle: 'leads', working: 'working', queued: 'waits its turn', needs: 'needs you', done: 'done' };
  function chatTheme() {
    const H = window.PM56_HOST;
    try { if (H && typeof H.theme === 'function') return H.theme(); } catch (e) { /* the chat is optional */ }
    const t = document.documentElement.getAttribute('data-theme') || 'basic-dark';
    return /^(basic|friendly|glass|retro)-(dark|light)$/.test(t) ? t : (/light/.test(t) ? 'basic-light' : 'basic-dark');
  }
  function team(step) {
    const S = SHELL(); if (!S || typeof S.pmxMark !== 'function') return '';
    return CAST.map((c, i) => {
      const state = step >= 0 && i > 0 ? PLAY[step][i - 1] : c.state;
      return `<figure class="pipe-seat" data-state="${state}">${S.pmxMark({ role: c.role, seat: c.seat === 'lead' ? 1 : c.seat, size: 36, state })}`
        + `<figcaption>${esc(say('cast.' + c.role, c.name))}<small>${esc(say('state.' + state, WORD[state]))}</small></figcaption></figure>`;
    }).join('');
  }

  /* ---------- the row: a summary that opens the editor --------------------------------------------------------------- */
  const o55peControl = renderControl;
  renderControl = function (setting, value) {
    const R = REG();
    if (!setting || setting.id !== ID || !R) return o55peControl.apply(this, arguments);
    const c = R.count(), pre = R.preset(), info = (R.PRESET_INFO || []).find(p => p.id === pre);
    const ids = new Set(R.ids());
    const cells = R.PARTS.map(p => `<i${ids.has(p.id) ? ' class="on"' : ''}></i>`).join('');
    const text = say('rowSummary', 'On {on} of {total}', c) + (info ? ' · ' + info.label : ' · ' + say('custom', 'Custom'));
    return `<button type="button" class="o55-struct pipe-open" data-action="open-structured-setting" data-setting="${esc(ID)}" aria-label="${esc(say('rowLabel', 'Customize Pip: {text}. Open the Pip editor', { text }))}">`
      + `<span class="o55-struct-copy"><span class="o55-struct-count">${esc(text)}</span><span class="pipe-rowcells" aria-hidden="true">${cells}</span></span>${icon('edit')}</button>`;
  };

  /* ---------- the editor ----------------------------------------------------------------------------------------------- */
  function chip(p) {
    return `<button type="button" class="pipe-chip" role="switch" aria-checked="false" data-pipe-part="${esc(p.id)}" aria-label="${esc(p.label)}">`
      + `<span class="pipe-chip-name">${esc(p.label)}</span><span class="pipe-chip-help">${esc(p.help)}</span>`
      + `<span class="pipe-chip-foot"><span>${esc(say('size', 'Size {n}', { n: p.size }))}</span><span class="pipe-chip-state">${esc(say('off', 'Off'))}</span></span></button>`;
  }
  let bodyN = 0;
  function body() {
    const R = REG(); if (!R) return '';
    const groups = R.GROUPS.map(g => {
      const ps = R.PARTS.filter(p => p.group === g); if (!ps.length) return '';
      const note = g === 'Motion' ? `<p class="pipe-note pipe-motion-note">${esc(say('motionNote', 'Reduce motion is on, so these stay still. Your choices are kept for when it is off.'))}</p>`
        : g === 'Sound' ? `<p class="pipe-note pipe-sound-note">${esc(say('soundNote', 'Pip sounds only while sound is on for this Project; muting the chat’s speaker mutes Pip too.'))}</p>` : '';
      return `<section class="pipe-group" data-pipe-group="${esc(g)}"><header class="pipe-ghead"><h4>${esc(say('group.' + g, g))}</h4><span class="pipe-gcount"></span></header>${note}`
        + `<div class="pipe-chips">${ps.map(chip).join('')}</div></section>`;
    }).join('');
    const presets = (R.PRESET_INFO || []).map(p => `<button type="button" class="pipe-preset" aria-pressed="false" data-pipe-preset="${esc(p.id)}"><span>${esc(say('preset.' + p.id + '.label', p.label))}</span><small>${esc(say('preset.' + p.id + '.help', p.help))}</small></button>`).join('');
    /* the stage is a labelled group, so each seat's caption (its role and state) reads; Play names why it can't run */
    const why = 'pipe-play-why-' + (++bodyN);
    return '<div class="pipe">'
      + `<div class="pipe-top"><div class="pipe-stage pm56-host" data-theme="${esc(chatTheme())}" aria-label="${esc(say('stageLabel', 'Preview: a small team in the chat'))}" role="group">${team(-1)}</div>`
      + '<div class="pipe-side">'
      + `<div class="pipe-meter"><div class="pipe-meter-head"><span>${esc(say('meterLabel', 'Pip parts'))}</span><b class="pipe-meter-n"></b></div><div class="pipe-meter-cells">${R.PARTS.map(() => '<i></i>').join('')}</div></div>`
      + `<div class="pipe-presets" role="group" aria-label="${esc(say('presets', 'Presets'))}">${presets}</div>`
      + `<button type="button" class="btn small pipe-play" data-pipe-replay data-pip-local="ui.settings.pip_editor.replay" aria-describedby="${why}"><span>${esc(say('play', 'Play: the team works'))}</span></button><p class="pipe-play-why" id="${why}"></p>`
      + '</div></div>'
      + `<p class="pipe-reach">${esc(say('reach', 'Parts change Pip in the chat and in setup. Pip’s mark, the app icon, the tray and loading signs stay as they are, and every helper is still a Pip.'))}</p>`
      + groups + '</div>';
  }
  function paint(wrap) {
    const R = REG(), box = wrap && wrap.querySelector('.pipe'); if (!box || !R) return;
    const have = new Set(R.ids()), setA = (el, name, v) => { if (el.getAttribute(name) !== v) el.setAttribute(name, v); };
    box.toggleAttribute('data-still', still());
    box.querySelectorAll('.pipe-chip').forEach(c => {
      const on = have.has(c.dataset.pipePart);
      setA(c, 'aria-checked', String(on));
      const st = c.querySelector('.pipe-chip-state'), w = on ? say('on', 'On') : say('off', 'Off'); if (st.textContent !== w) st.textContent = w;
    });
    box.querySelectorAll('.pipe-group[data-pipe-group]').forEach(g => {
      const ps = R.PARTS.filter(p => p.group === g.dataset.pipeGroup), t = `${ps.filter(p => have.has(p.id)).length} / ${ps.length}`;
      const c = g.querySelector('.pipe-gcount'); if (c && c.textContent !== t) c.textContent = t;
    });
    const n = box.querySelector('.pipe-meter-n'), c = R.count(), t = say('meter', 'On {on} / {total}', c); if (n.textContent !== t) n.textContent = t;
    box.querySelectorAll('.pipe-meter-cells > i').forEach((cell, i) => cell.classList.toggle('on', i < c.on));
    const pre = R.preset();
    box.querySelectorAll('.pipe-preset').forEach(b => setA(b, 'aria-pressed', String(b.dataset.pipePreset === pre)));
    const stage = box.querySelector('.pipe-stage');
    if (stage) { setA(stage, 'data-theme', chatTheme()); if (!wrap.__pipePlaying) stage.innerHTML = team(-1); }
    const rb = box.querySelector('[data-pipe-replay]'), why = box.querySelector('.pipe-play-why');
    const reason = !have.has('state-faces') ? say('playWhy', 'Turn on State faces to see the team work.') : '';
    /* not the disabled property: the hover-tag layer turns a disabled button into a lasting aria-disabled one */
    setA(rb, 'aria-disabled', String(!!reason)); if (why.textContent !== reason) why.textContent = reason;
  }
  /* Play: the team works (ui.settings.pip_editor.replay): the preview steps from waiting to done, then rests; it writes
     nothing. A step is a redraw of the team (the chat's own marks act once as they change state). */
  function replay(wrap) {
    const stage = wrap && wrap.querySelector('.pipe-stage'); if (!stage) return;
    clearTimeout(wrap.__pipeT);
    let step = 0; wrap.__pipePlaying = true;
    const show = () => { if (!stage.isConnected) { wrap.__pipePlaying = false; return; } stage.innerHTML = team(step); };
    const next = () => {
      step += 1;
      if (step >= PLAY.length) { wrap.__pipeT = setTimeout(() => { wrap.__pipePlaying = false; if (stage.isConnected) stage.innerHTML = team(-1); }, 1600); return; }
      show(); wrap.__pipeT = setTimeout(next, 1100);
    };
    show(); wrap.__pipeT = setTimeout(next, 1100);
  }
  function onClick(e, wrap) {
    const R = REG(), t = e.target && e.target.closest ? e.target : null; if (!t || !R) return;
    const c = t.closest('.pipe-chip');
    if (c) { R.toggle(c.dataset.pipePart); paint(wrap); return; }
    const p = t.closest('[data-pipe-preset]');
    if (p) { R.applyPreset(p.dataset.pipePreset); paint(wrap); return; }
    const r = t.closest('[data-pipe-replay]');
    if (r && r.getAttribute('aria-disabled') !== 'true') replay(wrap);
  }
  /* One editor in a host; destroy drops the registry subscription and the play timer */
  function bind(host) {
    const R = REG();
    const fire = e => onClick(e, host);
    host.addEventListener('click', fire);
    paint(host);
    let off = () => {}, dead = false;
    if (R && typeof R.on === 'function') {
      const un = R.on('change', () => { if (!host.isConnected) { destroy(); return; } paint(host); });
      if (typeof un === 'function') off = un;
    }
    function destroy() {
      if (dead) return; dead = true;
      try { off(); } catch (e) { /* already dropped */ }
      clearTimeout(host.__pipeT);
      host.removeEventListener('click', fire);
    }
    return { destroy };
  }
  /* ui.settings.pip_editor.open from the Settings row: the Settings side sheet */
  /* open() from the Settings row: the editor in Settings' side sheet. open({ from, returnFocus }) from anywhere else (the
     Demo Studio's "Adjust Pip", a menu): the same editor as the dialog popup() opens, focus going back to returnFocus */
  function open(opts) {
    if (opts && typeof opts === 'object' && (opts.from || opts.returnFocus)) return popup(opts);
    if (!REG()) return false;
    const wrap = PM51.panel({ title: say('title', 'Customize Pip'), eyebrow: say('kicker', 'Pip'), icon: 'sliders', size: 'wide', cls: 'pipe-panel', closeLabel: say('done', 'Done'),
      summary: say('lead', 'Choose where Pip appears in the chat and in setup, the faces it makes and how it moves. A change applies at once and is saved for this Project.'), body: body() });
    if (!wrap) return false;
    bind(wrap);
    return true;
  }

  /* ui.settings.pip_editor.open from the wand's "Pip…" and the theme menu's "Customize Pip…": a body-level dialog,
     focus trapped, Escape and the scrim close it (ui.settings.pip_editor.close), focus goes back where the person was */
  const POP_Z = 2147482050; /* NieR's editor dialog's layer: below the reboot cover and above the tour and the title bar */
  let popApi = null;
  const focusable = root => [...root.querySelectorAll('button, [href], input, select, textarea, [tabindex]')].filter(el => {
    if (el.disabled || el.getAttribute('aria-hidden') === 'true' || el.tabIndex < 0) return false;
    const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none';
  });
  const pick = v => { try { const el = typeof v === 'function' ? v() : v; return el && el.isConnected && typeof el.focus === 'function' && el.getClientRects().length ? el : null; } catch (e) { return null; } };
  function restoreFocus(opts) {
    for (const el of [pick(opts.returnFocus), pick(opts.from), document.getElementById('themeSelect')]) {
      if (!el) continue;
      try { el.focus(); } catch (e) { /* the menu may be closed */ }
      if (document.activeElement === el) return;
    }
  }
  function popup(opts) {
    opts = opts || {};
    if (popApi) popApi.close();
    if (!REG()) return { close() {} };
    const root = document.createElement('div');
    root.className = 'pipe-pop'; root.id = 'pipe-pop';
    root.innerHTML = `<div class="pipe-pop-scrim" data-pipe-pop="scrim" data-pip-local="ui.settings.pip_editor.close"></div>`
      + `<div class="pipe-pop-dialog pipe-host" role="dialog" aria-modal="true" aria-labelledby="pipe-pop-title" style="z-index:1">`
      + `<header class="pipe-pop-head"><div class="pipe-pop-titles"><p class="pipe-pop-eye">${esc(say('kicker', 'Pip'))}</p>`
      + `<h2 class="pipe-pop-title" id="pipe-pop-title">${esc(opts.title ? String(opts.title) : say('title', 'Customize Pip'))}</h2>`
      + `<p class="pipe-pop-lead">${esc(say('lead', 'Choose where Pip appears in the chat and in setup, the faces it makes and how it moves. A change applies at once and is saved for this Project.'))}</p></div>`
      + `<button type="button" class="pipe-pop-x" data-pipe-pop="close" data-pip-local="ui.settings.pip_editor.close" aria-label="${esc(say('close', 'Close'))}">`
      + `<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3 3 L11 11 M11 3 L3 11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
      + `</button></header><div class="pipe-pop-body">${body()}</div>`
      + `<footer class="pipe-pop-foot"><button type="button" class="btn primary pipe-pop-done" data-pipe-pop="close" data-pip-local="ui.settings.pip_editor.close">${esc(say('done', 'Done'))}</button></footer></div>`;
    root.querySelectorAll('button').forEach(el => el.setAttribute('data-pm-hover-exempt', 'true'));
    root.style.zIndex = String(POP_Z);
    const dialog = root.querySelector('.pipe-pop-dialog');
    let dead = false, session = { destroy() {} };
    function onKey(e) {
      if (dead || !root.isConnected) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = focusable(dialog);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (e.shiftKey) { if (active === first || !dialog.contains(active)) { e.preventDefault(); last.focus(); } }
      else if (active === last || !dialog.contains(active)) { e.preventDefault(); first.focus(); }
    }
    function close() {
      if (dead) return; dead = true;
      document.removeEventListener('keydown', onKey, true);
      session.destroy();
      root.remove();
      if (popApi && popApi.close === close) popApi = null;
      restoreFocus(opts);
    }
    root.addEventListener('click', e => {
      const hit = e.target && e.target.closest ? e.target.closest('[data-pipe-pop="close"], [data-pipe-pop="scrim"]') : null;
      if (hit) close();
    });
    document.addEventListener('keydown', onKey, true);
    if (reducedMotion()) root.dataset.open = 'true';
    document.body.appendChild(root);
    session = bind(dialog);
    if (!reducedMotion()) requestAnimationFrame(() => { if (root.isConnected) root.dataset.open = 'true'; });
    const x = root.querySelector('[data-pipe-pop="close"]');
    if (x) { try { x.focus(); } catch (e) { /* the dialog is still the trap */ } }
    popApi = { close };
    return popApi;
  }

  PM51.on('o55-pip-editor', () => open());
  window.PM_PIP_EDITOR = Object.freeze({
    open, popup,
    close: () => { if (popApi) popApi.close(); },
    replay: () => { const host = document.querySelector('.pipe-pop-dialog, #panel-settings .pipe-panel'); if (host) replay(host); }
  });
})();
