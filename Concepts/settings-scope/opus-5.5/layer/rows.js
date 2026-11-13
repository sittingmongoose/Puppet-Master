/* Settings that apply everywhere (Opus 5.5): the rows (BUILD-SPEC section 7).

   Every row's "?" (button.o55-about) keeps its element, its data-* and its aria-expanded, so the engine still opens the
   panel; what it says follows the review strip's "End of the row":
     origin  A · the origin word: "This project", "Home NAS", "Varies", or "Details" when nothing differs (S5 A)
     mark    B · "Details" at the end, and the info mark with "Set for this project" or "Varies" after the title
     line    C · "Details" at the end, and a sentence under the description ("Different in docs-site")
     more    D · "⋯ More" at the end, opening a labelled menu (it is also every row's right-click menu)
     today   the engine's round "?" untouched
   The Changed mark follows "Changed mark" through html[data-psx-changed] (rows.css). Lines under a row (a limit held
   lower, a safety value decided by the more careful rule, a source that isn't answering) show in every option.
   Rows re-render through refreshSettingRow and PM51.swapRow, so decorating is idempotent (data-psx-done holds a hash
   of what was drawn) and runs on every mutation of #pm-settings-root. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.rows) return;
  const { D, H, DEF, IDS, esc, mark, icon, label, vt, placeName, projectName, list } = PSX;
  const S = PSX.S;
  const CHEV = '<svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const scopeLabelsOn = () => { try { return !!(W.PM12_KIMI && W.PM12_KIMI.getState && PSX.resolve('general.interaction.scope-labels', S.ctx).value); } catch (e) { return false; } };

  /* ------------------------------------------------------------------ what a row says (SETTINGS-PROPOSAL 2.3) */
  function where(id, r) {
    const c = PSX.ctxFull(S.ctx), def = DEF[id];
    const out = { word: 'Details', here: false, sentence: '', mark2: '', aria: '' };
    if (!r) {
      out.aria = 'the same everywhere';
      if (S.scopeLabels) out.word = 'Everywhere';
      return out;
    }
    if (r.notOffered) { out.word = 'Each project'; out.aria = 'each project has its own; no project is open'; out.sentence = 'Set in each project'; out.mark2 = 'Set in each project'; return out; }
    const own = r.varies.filter((v) => v.level !== 'provider');
    const fromName = r.from.level === 'project' ? 'This project' : r.from.level === 'computer' ? placeName('computer', r.from.key) : r.from.level === 'device' ? placeName('device', r.from.key) : '';
    if (def.home === 'computer') {
      out.word = placeName('computer', c.host || c.on); out.here = true;
      // "Show where each setting comes from" On: a found value says where it was found (2.5)
      if (S.scopeLabels && r.from.level !== 'computer') out.word = `Found on ${out.word}`;
      out.aria = r.from.level === 'computer' ? `set for ${out.word}` : `found automatically on ${out.word}`;
      out.mark2 = r.from.level === 'computer' ? `Set for ${out.word}` : '';
      out.sentence = r.missing ? `${def.program || 'It'} isn’t installed on ${out.word}` : r.from.level === 'computer' ? `Set for ${out.word} · each computer has its own` : `Found automatically on ${out.word}`;
      return out;
    }
    if (def.home === 'project') {
      out.word = 'This project'; out.here = true; out.aria = 'this project’s own';
      out.mark2 = r.from.level === 'project' ? 'Set for this project' : '';
      out.sentence = r.from.level === 'project' ? `Set for ${c.project} · each project has its own` : '';
      return out;
    }
    if (r.here) {
      out.word = fromName; out.here = true;
      out.aria = r.from.level === 'project' ? 'set for this project' : `set for ${fromName}`;
      out.mark2 = r.from.level === 'project' ? 'Set for this project' : r.from.level === 'device' ? 'Set on this screen' : `Set for ${fromName}`;
      const elsewhere = r.everywhere !== undefined ? r.everywhere : PSX.DEFAULTS[id];
      out.sentence = `Set for ${r.from.level === 'project' ? c.project : fromName} · everywhere else ${vt(id, elsewhere)}`;
      return out;
    }
    const owners = r.owners || [];
    if (!own.length && owners.length) {
      // an AI service's own value decides for that service's work (MA-073): the row's value is the shared one
      out.word = 'Each AI service'; out.aria = `the shared value is the same everywhere; ${list(owners.map((o) => placeName('provider', o.key)))} ${owners.length === 1 ? 'has its' : 'have their'} own`;
      out.mark2 = 'Each AI service'; out.sentence = `${list(owners.map((o) => `${placeName('provider', o.key)} uses its own ${vt(id, o.value)}`))}`;
      return out;
    }
    if (own.length) {
      out.word = 'Varies'; out.aria = `from ${r.from.level === 'everywhere' ? 'everywhere' : 'the default'}, and different in ${own.length + owners.length} ${own.length + owners.length === 1 ? 'place' : 'places'}`;
      out.mark2 = 'Varies';
      const names = own.map((v) => (v.level === 'project' ? v.key : placeName(v.level, v.key))).concat(owners.map((o) => placeName('provider', o.key)));
      out.sentence = own.length <= 2 ? `Different in ${list(names)}` : `Different in ${own.length} places`;
      return out;
    }
    out.aria = r.from.level === 'everywhere' ? 'the same everywhere' : 'the default everywhere';
    if (S.scopeLabels) out.word = r.from.level === 'everywhere' ? 'Everywhere' : 'Default';
    return out;
  }

  /* lines under a row: states, not the varies indicator, so they show in every option (7.4) */
  function lines(id, r) {
    const out = [], c = PSX.ctxFull(S.ctx);
    if (!r || r.notOffered) return out;
    if (r.ceiling) out.push({ key: 'info', text: `Limited to ${vt(id, r.ceiling.value)} on ${placeName('computer', r.ceiling.key)}` });
    if (r.careful) out.push({ key: 'info', text: `For safety, ${placeName(r.careful.by.level, r.careful.by.key)}’s ${vt(id, r.value)} is used` });
    if (r.stale.length) {
      const s = r.stale.find((x) => x.level === 'project') || r.stale.find((x) => x.level === 'computer') || r.stale[0];
      const wr = placeName('computer', PSX.writer(s.level, s.key));
      if (s.level === 'everywhere') out.push({ key: 'offline', text: `As of ${PSX.W.asOf} · ${wr} isn’t answering` });
      else out.push({ key: 'offline', text: `May differ ${s.level === 'project' ? 'in ' + s.key : 'on ' + placeName('computer', s.key)} · ${wr} isn’t answering` });
    }
    if (r.missing) out.push({ key: 'off', text: `${DEF[id].program || 'It'} isn’t installed on ${placeName('computer', c.on)}` });
    if (r.owners && r.owners.length && r.from.level !== 'provider') r.owners.forEach((o) => out.push({ key: 'info', text: `${placeName('provider', o.key)} uses its own: ${vt(id, o.value)}` }));
    return out;
  }

  /* ------------------------------------------------------------------ decorating one end button */
  function rowOf(btn) { return btn.closest('.setting-row, .o55-field'); }
  function decorateButton(btn, o) {
    // the immediate pass (redrawNow) defers only Changed, and only while a change is on its way; otherwise it draws
    // everything, so the next frame's pass finds the row done and does nothing
    const sync = !!(o && o.sync) && inFlight(btn.getAttribute('data-setting') || '');
    const id = btn.getAttribute('data-setting'); if (!id) return;
    const row = rowOf(btn); if (!row) return;
    const kind = row.classList.contains('o55-field') ? 'field' : row.classList.contains('o55-scoped') ? 'scoped' : 'row';
    // provider policy fields keep their own Own and Shared; their "?" becomes the word Details, never an icon alone
    if (kind === 'field' && row.classList.contains('o55-policy-field')) {
      if (!btn.__psxOrig) btn.__psxOrig = { html: btn.innerHTML, aria: btn.getAttribute('aria-label') || '', hover: btn.getAttribute('data-pm-hover-label') || '', detail: btn.getAttribute('data-pm-hover-detail') || '' };
      const want = S.opt.end === 'today' ? btn.__psxOrig.html : `<span class="psx-end-word">Details</span>${CHEV}`;
      if (btn.innerHTML !== want) { btn.innerHTML = want; btn.classList.toggle('psx-end', S.opt.end !== 'today'); btn.classList.toggle('is-quiet', S.opt.end !== 'today'); if (S.opt.end !== 'today') btn.setAttribute('aria-label', `${(btn.__psxOrig.aria || '').replace(/^About /, '')}: details. Open what it does.`); }
      return;
    }
    if (!btn.__psxOrig) btn.__psxOrig = { html: btn.innerHTML, aria: btn.getAttribute('aria-label') || '', hover: btn.getAttribute('data-pm-hover-label') || '', detail: btn.getAttribute('data-pm-hover-detail') || '' };
    const opt = S.opt.end;
    const demo = !!DEF[id];
    const r = demo ? PSX.resolve(id, S.ctx) : null;
    const lab = demo ? label(id) : (btn.__psxOrig.aria || '').replace(/^About /, '');
    let wd = kind === 'scoped' ? { word: perWord(row), here: false, aria: 'each one has its own', sentence: '', mark2: '' } : where(id, r);
    const ln = demo && kind !== 'field' ? lines(id, r) : [];
    const changed = demo ? !!(r && r.changed && !r.notOffered) : null;
    // looking at another device's screen: a screen row shows that device's value in place of the control (Jared #11)
    const viewDev = S.ctx.device && S.ctx.device !== S.actor && opt !== 'today' && kind === 'row';
    let devv = viewDev && demo && DEF[id].screen ? { name: placeName('device', S.ctx.device), text: vt(id, r.asked !== undefined ? r.asked : r.value) } : null;
    // Light or dark is the second half of Theme: it shows the viewed device's half too
    if (viewDev && id === 'general.visual.theme-mode') devv = { name: placeName('device', S.ctx.device), text: PSX.themePair(PSX.resolve('general.visual.theme', S.ctx).value)['general.visual.theme-mode'] };
    const sig = JSON.stringify([opt, S.opt.changed, wd.word, wd.here, wd.sentence, wd.mark2, ln, changed, kind, devv]);
    // the engine's in-place redraw can patch a row back while keeping this attribute: check the drawing is still there
    if (btn.dataset.psxDone === sig && row.dataset.psxDone === sig && intact(row, btn, opt, wd, ln, sync ? null : changed, kind) && !!row.querySelector(':scope > .setting-control > .psx-devval') === !!devv) return;
    btn.dataset.psxDone = sync ? 'sync' : sig; row.dataset.psxDone = sync ? 'sync' : sig;
    // clear what an earlier option drew
    row.querySelectorAll(':scope .psx-mark2, :scope .psx-line, :scope .psx-risk').forEach((n) => { if (rowOf(n) === row) n.remove(); });
    drawDevValue(row, btn, devv, id);
    btn.classList.remove('psx-end', 'is-here', 'psx-more', 'is-quiet');
    if (opt === 'today') {
      btn.innerHTML = btn.__psxOrig.html;
      if (btn.__psxOrig.aria) btn.setAttribute('aria-label', btn.__psxOrig.aria);
      if (btn.__psxOrig.hover) btn.setAttribute('data-pm-hover-label', btn.__psxOrig.hover);
      if (btn.__psxOrig.detail) btn.setAttribute('data-pm-hover-detail', btn.__psxOrig.detail); else btn.removeAttribute('data-pm-hover-detail');
      if (!sync) syncChanged(row, id, changed, demo);
      drawLines(row, id, ln);
      return;
    }
    let word = wd.word;
    if (opt === 'mark' || opt === 'line') word = 'Details';
    if (opt === 'more') word = 'More';
    btn.classList.add('psx-end');
    if (opt === 'more') btn.classList.add('psx-more');
    if (opt === 'origin' && wd.here) btn.classList.add('is-here');
    if (opt === 'origin' && word === 'Details') btn.classList.add('is-quiet');
    btn.innerHTML = opt === 'more'
      ? `<span class="psx-end-more" aria-hidden="true">⋯</span><span class="psx-end-word">More</span>`
      : `<span class="psx-end-word">${esc(word)}</span>${CHEV}`;
    const aria = opt === 'more' ? `${lab}: more actions, including where it applies` : `${lab}: ${wd.aria || 'the same everywhere'}. Open where it applies and what it does.`;
    btn.setAttribute('aria-label', aria);
    btn.setAttribute('data-pm-hover-label', opt === 'more' ? `More for ${lab}` : `${word} · ${lab}`);
    btn.setAttribute('data-pm-hover-detail', opt === 'more' ? 'Where it applies, set it for one place, or go back to the default.' : (wd.sentence || 'Where it applies, what it does, and your choices.'));
    if (opt === 'more') btn.setAttribute('aria-haspopup', 'menu'); else btn.removeAttribute('aria-haspopup');
    // B: a second mark after the title
    const lab2 = row.querySelector(kind === 'field' ? '.o55-field-label' : '.setting-label');
    if (opt === 'mark' && wd.mark2 && lab2 && kind !== 'field') lab2.insertAdjacentHTML('beforeend', `<span class="psx-mark2" data-o55-foreign>${mark('info')}<span>${esc(wd.mark2)}</span></span>`);
    // C: a sentence under the description
    if (opt === 'line' && wd.sentence && kind === 'row') {
      const copy = row.querySelector('.setting-copy');
      if (copy) copy.insertAdjacentHTML('beforeend', `<div class="psx-line psx-src" data-o55-foreign>${mark('info')}<span>${esc(wd.sentence)}</span></div>`);
    }
    // the immediate redraw (redrawNow) leaves Changed as the base page drew it from the control's own value: the world
    // takes the change only when its save reports back, and reconciling then means the mark appears once, never on, off
    // and on again (Jared #4)
    if (!sync) syncChanged(row, id, changed, demo);
    drawLines(row, id, ln);
  }
  function drawDevValue(row, btn, devv, id) {
    const ctl = row.querySelector(':scope > .setting-control'); if (!ctl) return;
    ctl.querySelectorAll(':scope > .psx-devval').forEach((n) => n.remove());
    row.classList.toggle('psx-devview', !!devv);
    if (!devv) return;
    const el = D.createElement('span'); el.className = 'psx-devval'; el.setAttribute('data-o55-foreign', '');
    el.innerHTML = `<span class="psx-devval-v" title="${esc(devv.name)}’s screen">${esc(devv.text)}</span><button type="button" class="psx-tb" data-psx-devchange="1" aria-label="Change ${esc(label(id))} for ${esc(devv.name)}’s screen">Change</button>`;
    el.querySelector('button').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openPanel(btn); });
    ctl.appendChild(el);
  }
  function intact(row, btn, opt, wd, ln, changed, kind) {
    if (opt === 'today' ? btn.classList.contains('psx-end') : !(btn.classList.contains('psx-end') && btn.querySelector('.psx-end-word'))) return false;
    if (kind === 'field') return true;
    const lab = row.querySelector('.setting-label');
    if (lab && lab.querySelectorAll('.o55-changed:not(.o55-needed)').length > 1) return false;
    if (changed !== null && lab && !inFlight(btn.getAttribute('data-setting')) && !!lab.querySelector('.o55-changed:not(.o55-needed)') !== !!changed) return false;
    const lines = [...row.querySelectorAll('.psx-line')].filter((n) => rowOf(n) === row).length;
    if (kind === 'row' && lines !== ln.length + (opt === 'line' && wd.sentence ? 1 : 0)) return false;
    if (opt === 'mark' && wd.mark2 && lab && !lab.querySelector('.psx-mark2')) return false;
    return true;
  }
  const perWord = (row) => {
    const sc = (row.querySelector('[data-scope]') || {}).dataset || {};
    const s = String(sc.scope || '');
    return /account/.test(s) ? 'Each account' : /service|provider/.test(s) ? 'Each AI service' : /persona/.test(s) ? 'Each persona' : /template|goal/.test(s) ? 'Each Goal template' : /server/.test(s) ? 'Each computer' : 'Each one';
  };
  /* the Changed mark follows the resolver for the demo rows (the proposal's own default for "Show where each setting
     comes from" differs from the inventory's, and a value pushed from the world is not a change made here) */
  /* a change on its way: the base page holds a value the layer hasn't routed yet (the world takes it when its save
     reports back). Until then Changed stays as the base page drew it from the control's value */
  let engSt = null;   // the base page's settings, read once per task (getState copies the whole state)
  function engineSettings() {
    if (!engSt) { try { const K = W.PM12_KIMI; engSt = (K && K.getState().settings) || {}; } catch (e) { engSt = {}; } Promise.resolve().then(() => { engSt = null; }); }
    return engSt;
  }
  function inFlight(id) {
    if (!PSX.last || !Object.prototype.hasOwnProperty.call(PSX.last, id)) return false;
    const st = engineSettings();
    return JSON.stringify(st[id]) !== JSON.stringify(PSX.last[id]);
  }
  function syncChanged(row, id, changed, demo) {
    if (!demo || row.classList.contains('o55-field')) return;
    const lab = row.querySelector('.setting-label');
    // one Changed word per row, whoever drew it (Jared's screen 02 showed "Changed · Changed"; the 1920 film of the old
    // build showed it on Thinking depth, since retired by main's one-model design, and on Everyday building after a redraw)
    const all = lab ? [...lab.querySelectorAll('.o55-changed:not(.o55-needed)')] : []; all.slice(1).forEach((x) => x.remove());
    if (inFlight(id)) return;
    row.classList.toggle('is-changed', !!changed);
    if (!lab) return;
    let m = all[0] || null;
    if (changed && !m) lab.insertAdjacentHTML('beforeend', `<span class="o55-changed" title="Changed from the default" data-o55-foreign>${mark('change-modified')}<span>Changed</span></span>`);
    if (!changed && m) m.remove();
    // FileSafe off for one project carries the risk word on that row (4.4)
    if (id === 'safety.protection.filesafe-integration') {
      const r = PSX.resolve(id, S.ctx);
      if (r.value === false && !lab.querySelector('.psx-risk')) lab.insertAdjacentHTML('beforeend', `<span class="o55-risk psx-risk" data-o55-foreign>${mark('warning')}<span>${r.from.level === 'project' ? 'Off for this project' : 'Off'}</span></span>`);
    }
  }
  function drawLines(row, id, ln) {
    if (!ln.length || !row.classList.contains('setting-row')) return;
    const copy = row.querySelector('.setting-copy'); if (!copy) return;
    const ids = [];
    ln.forEach((x, i) => { const lid = 'psx-ln-' + id.replace(/[^a-z0-9]+/gi, '-') + '-' + i; ids.push(lid); copy.insertAdjacentHTML('beforeend', `<div class="psx-line" id="${lid}" data-o55-foreign>${mark(x.key)}<span>${esc(x.text)}</span></div>`); });
    const ctl = row.querySelector('.setting-control .pm51-dd-trigger, .setting-control input:not(.pm51-dd-native), .setting-control .toggle, .setting-control button');
    if (ctl) { const prev = (ctl.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && !/^psx-ln-/.test(x)); ctl.setAttribute('aria-describedby', prev.concat(ids).join(' ')); }
  }

  /* ------------------------------------------------------------------ the Projects folder demo row
     Not in the inventory (NEW CANON, Split v2 11.2): drawn with the real row markup at the top of the Servers manager's
     Home & Location tab; its end button opens the layer's own panel through the same inspector */
  function folderRow() {
    const id = 'psx.projects-folder', r = PSX.resolve(id, S.ctx), c = PSX.ctxFull(S.ctx);
    const v = r.from.level === 'computer' ? r.value : (r.found || PSX.DEFAULTS[id]);
    return `<section class="settings-section o55-group psx-folder-sec" data-psx-folder="1" data-o55-foreign><header class="o55-group-head"><h3 class="o55-group-title">Where new projects go</h3><p class="o55-group-help">Each computer keeps its own Projects folder.</p></header><div class="setting-list"><div class="setting-row o55-row${r.changed ? ' is-changed' : ''}" id="setting-psx.projects-folder" data-o55-kind="path" data-psx-demo="1">
      <div class="setting-copy"><div class="setting-label">Projects folder</div><div class="setting-description">Where a new project’s folder is made on ${esc(placeName('computer', c.on))}.</div></div>
      <div class="setting-control"><div class="path-control o55-path"><input class="text-control" value="${esc(v)}" data-psx-input="${esc(id)}" aria-label="Projects folder" autocomplete="off" spellcheck="false"><button type="button" class="btn small" data-psx-browse="1"><span>Choose</span></button></div></div>
      <button type="button" class="icon-btn details-btn o55-about" aria-expanded="false" data-psx-own-panel="1" data-setting="${esc(id)}" aria-label="About Projects folder">${icon('help')}</button>
    </div></div></section>`;
  }
  function placeFolderRow() {
    const mgr = D.querySelector('#pm-settings-root .manager-page[data-pm51-manager="servers"]'); if (!mgr) return;
    const tab = mgr.querySelector('[data-action="pm51-tab"][aria-selected="true"]');
    const onHome = !tab || tab.dataset.tab === 'home';
    const have = mgr.querySelector('[data-psx-folder]');
    if (!onHome) { if (have) have.remove(); return; }
    const scroll = mgr.querySelector('.manager-scroll'); if (!scroll) return;
    const sig = JSON.stringify([PSX.W.rev, S.ctx]);
    if (have && have.dataset.sig === sig) return;
    const tpl = D.createElement('template'); tpl.innerHTML = folderRow();
    const sec = tpl.content.firstElementChild; sec.dataset.sig = sig;
    if (have) have.replaceWith(sec); else scroll.insertBefore(sec, scroll.firstChild);
  }

  /* ------------------------------------------------------------------ the Settings header (7.7; Jared #11)
     One calm line: the Project and the Computer, each named once ("tastebook on This computer"). Your own view is the open
     project on the computer that does its work, with the screen of the device you're using; choosing another project
     opens that project (the base page's project button, which this replaces, did the same). Looking at another
     Computer, or at another device's screen, is the viewing state: the same line in the same box, framed and tinted,
     with the word Viewing and Stop viewing. Nothing in the line wraps and the box never changes size, so changing the
     view never moves the page. */
  function ownOn(c) { const p = PSX.projectById(c.project); return p ? p.home : 'here'; }
  function viewState() {
    const c = PSX.ctxFull(S.ctx);
    const comp = !!S.ctx.on && S.ctx.on !== ownOn(c);
    const dev = c.device !== S.actor;
    return { c, comp, dev, viewing: comp || dev };
  }
  PSX.viewState = viewState;
  function headLine() {
    const bar = D.querySelector('#pm-settings-root .document-toolbar'); if (!bar) return;
    const v = viewState(), c = v.c;
    const home = PSX.home(), hn = PSX.homeName();
    const proj = c.project ? c.project : 'No project';
    const using = S.actor !== 'here' && !v.dev ? `, from ${placeName('device', S.actor)}` : '';
    const ctxText = `${proj} on ${placeName('computer', c.on)}${v.dev ? `, with ${placeName('device', c.device)}’s screen` : using}`;
    /* the same words, shorter each step, and the first that fits with no ellipsis is shown (fitHead): every name stays
       whole at every width (review A-r1 finding 2); the box never changes size */
    const B = (x) => `<b>${esc(x)}</b>`, comp = placeName('computer', c.on), dev = v.dev ? placeName('device', c.device) : '', actorName = placeName('device', S.actor);
    const variants = [
      { html: `${B(proj)} on ${B(comp)}${dev ? `, with ${B(dev)}’s screen` : using ? `, from ${B(actorName)}` : ''}`, label: true },
      { html: `${B(proj)} on ${B(comp)}${dev ? `, with ${B(dev)}` : using ? `, from ${B(actorName)}` : ''}`, label: true },
      { html: `${B(proj)} on ${B(comp)}${dev ? `, with ${B(dev)}` : using ? `, from ${B(actorName)}` : ''}`, label: false },
      { html: `${B(proj)} · ${B(comp)}${dev ? ` · ${B(dev)}` : using ? ` · ${B(actorName)}` : ''}`, label: false },
      /* review A-r2 N2: the last step always fits. The same dot form may take two lines inside the same 32px box, and
         a name never splits across them (its spaces are no-break spaces) */
      { html: [proj, comp].concat(dev ? [dev] : using ? [actorName] : []).map((x) => `<b>${esc(x).replace(/ /g, '\u00a0')}</b>`).join(' · '), label: false, two: true }
    ];
    const ctxHtml = variants[0].html;
    const back = `${proj} on ${placeName('computer', ownOn(c))}`;
    const desc = v.viewing
      ? `You’re looking at ${proj}’s settings as they apply ${v.comp ? `when its work runs on ${placeName('computer', c.on)}` : `on ${placeName('computer', c.on)}`}${v.dev ? ` and on ${placeName('device', c.device)}’s screen` : ''}. Changes you make here are saved for real. Stop viewing goes back to ${back}.`
      : c.project ? `Settings for ${proj} on ${placeName('computer', c.on)}, its default computer (work: Auto, default ${placeName('computer', c.on)}). Change opens another project, or lets you look at another computer or device.`
        : `Settings for chats with no project, on ${placeName('computer', c.on)}. Changes here apply everywhere or to this computer.`;
    const lines2 = [];
    // notices that are not about the view: they are lines under the header, never a change of the header itself
    if (!PSX.answering(home)) lines2.push(`<div class="psx-head-line" data-k="offline">${mark('offline')}<span>Can’t reach ${esc(hn)}, which keeps your settings. You’re seeing them as of ${esc(PSX.W.asOf)}.</span></div>`);
    if (S.firstStart) lines2.push(`<div class="psx-head-line" data-k="first">${mark('info')}<span>Set up Puppet Master on this computer first. Until then nothing is kept, so Settings is a preview in Basic Dark.</span></div>`);
    const actorDev = PSX.DEVICES[S.actor];
    if (actorDev && actorDev.limited) lines2.push(`<div class="psx-head-line" data-k="limited">${mark('info')}<span>${esc(PSX.REASONS.limited_device[0])}</span></div>`);
    const run = S.runMode === 'yolo' ? `<span class="psx-head-run" data-k="yolo" tabindex="0" data-pm-hover-label="YOLO" data-pm-hover-detail="Changes don’t wait for a yes. Each one is reported, with Undo; the guards YOLO never skips still ask." aria-label="YOLO: changes don’t wait for a yes. Each one is reported, with Undo; the guards YOLO never skips still ask.">${mark('info')}<span>YOLO</span></span>` : '';
    const html = `<div class="psx-head-main${v.viewing ? ' is-viewing' : ''}" data-viewing="${v.viewing ? '1' : '0'}"><span class="psx-head-view" aria-hidden="${v.viewing ? 'false' : 'true'}">${mark('info')}<span>Viewing</span></span><span class="psx-head-ctx" title="${esc(ctxText)}" aria-description="${esc(desc)}">${ctxHtml}</span><span class="psx-head-gap"></span>${run}${v.viewing ? `<button type="button" class="psx-tb is-primary psx-head-stop" data-psx-head="mine" aria-label="Stop viewing; back to ${esc(back)}">Stop viewing</button>` : ''}<button type="button" class="psx-tb psx-head-btn" data-psx-head="view" aria-haspopup="menu" aria-label="Change: another project, or look at another computer or device">Change${CHEV}</button></div>${lines2.join('')}`;
    let el = bar.querySelector(':scope > .psx-head');
    // the page's own actions sit over the toolbar's right end (Page options; its project button is hidden): keep clear
    const pa = bar.querySelector(':scope > .page-actions');
    const pr = pa && getComputedStyle(pa).position === 'absolute' ? Math.max(48, pa.offsetWidth + 16) : 12;
    if (el && el.__pr !== pr) { el.style.paddingRight = pr + 'px'; el.__pr = pr; }
    if (el && el.__html === html) return;
    if (!el) { el = D.createElement('div'); el.className = 'psx-head'; el.setAttribute('data-o55-foreign', ''); el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Whose settings these are'); bar.insertBefore(el, bar.firstChild); }
    // keep the keyboard where it was when the header redraws (Change, Stop viewing)
    const had = D.activeElement && el.contains(D.activeElement) ? D.activeElement.getAttribute('data-psx-head') : null;
    el.innerHTML = html; el.__html = html; el.__variants = variants;
    if (el.__pr !== pr) { el.style.paddingRight = pr + 'px'; el.__pr = pr; }
    fitHead(el);
    if (!el.__psxRO && W.ResizeObserver) { el.__psxRO = new W.ResizeObserver(() => fitHead(el)); el.__psxRO.observe(el); }
    if (had) { const f = el.querySelector(`[data-psx-head="${had}"]`) || el.querySelector('[data-psx-head="view"]'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
  }
  function fitHead(el) {
    const main = el.querySelector('.psx-head-main'), ctx = el.querySelector('.psx-head-ctx'), vs = el.__variants;
    if (!main || !ctx || !vs) return;
    for (let i = 0; i < vs.length; i++) {
      if (ctx.innerHTML !== vs[i].html) ctx.innerHTML = vs[i].html;
      main.classList.toggle('is-compact', !vs[i].label);
      main.classList.toggle('is-two', !!vs[i].two);
      main.setAttribute('data-fit', String(i));
      if (ctx.scrollWidth <= ctx.clientWidth + 0.5 && ctx.scrollHeight <= ctx.clientHeight + 0.5) return;
    }
  }
  PSX.fitHead = () => { const el = D.querySelector('#pm-settings-root .document-toolbar > .psx-head'); if (el) fitHead(el); };
  function viewMenu(anchor) {
    const v = viewState(), c = v.c;
    // another project opens it, on its own computer, with your own device's screen (no viewing state)
    const projects = PSX.PROJECTS.map((p) => ({ label: p.id, meta: p.id === c.project ? 'open now' : `Auto (default: ${placeName('computer', p.home)})`, run: () => PSX.setCtx({ project: p.id, on: null, device: S.actor }) }))
      .concat([{ label: 'No project', meta: c.project ? 'chats with no project' : 'open now', run: () => PSX.setCtx({ project: 'none', on: null, device: S.actor }) }]);
    const comps = PSX.computerIds().map((k) => ({ label: PSX.COMPUTERS[k].name, meta: k === ownOn(c) ? (c.project ? `${c.project}’s own · ` : '') + (k === c.on ? 'shown now' : 'stop viewing') : k === c.on ? 'viewing now' : c.project ? `as if ${c.project}’s work ran there` : 'chats with no project, there', disabled: PSX.W.up[k] === false ? `${PSX.COMPUTERS[k].name} isn’t answering` : null, run: () => PSX.setCtx({ on: k === ownOn(c) ? null : k }) }));
    // another device's screen values never give that device's rights: you stay on the device you're using
    const devs = Object.keys(PSX.DEVICES).map((k) => ({ label: PSX.DEVICES[k].name, meta: k === S.actor ? (k === c.device ? 'the one you’re using' : 'the one you’re using · stop viewing') : k === c.device ? 'viewing now' : 'see its screen settings', run: () => PSX.setCtx({ device: k }) }));
    const groups = [
      { label: 'Project', items: projects },
      { label: 'Look at another computer', items: comps },
      { label: 'Look at another device’s screen', items: devs },
      // one place to see every difference (3.6), from any page
      { label: 'Everything at once', items: [{ label: 'All the differences…', meta: 'every project’s and computer’s own values', run: () => { if (PSX.moments) PSX.moments.differences(); } }] }
    ];
    if (v.viewing) groups.unshift({ label: 'Viewing', items: [{ label: 'Stop viewing', meta: `back to ${c.project || 'No project'} on ${placeName('computer', ownOn(c))}`, run: stopViewing }] });
    PSX.menu(anchor, groups, { label: 'Change', search: true, width: 300, placeholder: 'Find a project, computer or device' });
  }
  function stopViewing() { PSX.setCtx({ on: null, device: S.actor }); }
  PSX.stopViewing = stopViewing;

  /* ------------------------------------------------------------------ the row's menu: option D, right-click, long-press */
  function rowMenu(btn, at) {
    const id = btn.getAttribute('data-setting'); if (!id) return;
    const demo = !!DEF[id], c = PSX.ctxFull(S.ctx);
    const r = demo ? PSX.resolve(id, S.ctx) : null, def = DEF[id] || {};
    const items = [{ label: 'Where it applies…', run: () => openPanel(btn) }];
    if (demo && !r.notOffered) {
      const cur = r.asked !== undefined ? r.asked : r.value;
      if (def.may && def.may.includes('project') && c.project && !(r.from.level === 'project')) items.push({ label: `Set for ${c.project}`, meta: 'its own value, from now on', run: () => PSX.setOwn(id, { level: 'project', key: c.project }, cur) });
      if (def.may && def.may.includes('computer') && r.from.level !== 'computer') items.push({ label: `Set for ${placeName('computer', c.on)}`, meta: 'its own value, from now on', disabled: PSX.answering(c.on) ? null : `${placeName('computer', c.on)} isn’t answering`, run: () => PSX.setOwn(id, { level: 'computer', key: c.on }, cur) });
      if (def.may && def.may.includes('device') && r.from.level !== 'device') items.push({ label: 'Set for this screen', meta: 'this device only', run: () => PSX.setOwn(id, { level: 'device', key: c.device }, cur) });
      if (r.here && !def.home) items.push({ label: 'Same as everywhere', meta: `takes away ${placeName(r.from.level, r.from.key)}’s own`, run: () => PSX.setOwn(id, r.from, undefined) });
      else if (r.from.level === 'everywhere' && r.changed) items.push({ label: 'Go back to the default', meta: vt(id, PSX.DEFAULTS[id]), run: () => PSX.setOwn(id, { level: 'everywhere', key: null }, undefined) });
    }
    items.push({ label: 'Copy setting name', meta: id, run: () => { try { W.navigator.clipboard && W.navigator.clipboard.writeText(id); } catch (e) { /* optional */ } PSX.note({ title: 'Copied', body: id, mark: 'info' }); } });
    PSX.menu(btn, items, { label: `More for ${demo ? label(id) : (btn.__psxOrig ? btn.__psxOrig.aria.replace(/^About /, '') : id)}`, at, width: 280 });
  }
  function openPanel(btn) {
    if (btn.hasAttribute('data-psx-own-panel')) { if (PSX.panel) PSX.panel.openOwn(btn.getAttribute('data-setting'), btn); return; }
    const K = W.PM12_KIMI;
    if (btn.getAttribute('data-action') === 'setting-details' && K && K.dispatchAction) K.dispatchAction('setting-details', { setting: btn.dataset.setting, workspace: btn.dataset.workspace || '', section: btn.dataset.section || '' });
    else btn.click();
  }

  /* ------------------------------------------------------------------ events */
  function wire() {
    if (D.__psxRowsWired) return; D.__psxRowsWired = true;
    // option D and the demo row's own panel: the click is the layer's, before the engine's handlers see it
    D.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('#pm-settings-root .o55-about');
      if (btn && btn.classList.contains('psx-more')) { e.preventDefault(); e.stopImmediatePropagation(); rowMenu(btn); return; }
      if (btn && btn.hasAttribute('data-psx-own-panel')) { e.preventDefault(); e.stopImmediatePropagation(); openPanel(btn); return; }
      const head = e.target.closest && e.target.closest('[data-psx-head]');
      if (head) { e.preventDefault(); e.stopImmediatePropagation(); if (head.dataset.psxHead === 'view') viewMenu(head); else if (head.dataset.psxHead === 'diff') { if (PSX.moments) PSX.moments.differences(); } else stopViewing(); return; }
      // the setting's name opens its panel too (a bigger target, S5 A)
      const lab = e.target.closest && e.target.closest('#pm-settings-root .setting-row.o55-row .setting-label');
      if (lab && S.opt.end !== 'today' && !e.target.closest('.o55-changed, .psx-mark2, .o55-risk, a, button, input, select')) {
        const row = lab.closest('.setting-row'), b = row && [...row.querySelectorAll('.o55-about')].find((x) => rowOf(x) === row);
        if (b) { e.preventDefault(); if (b.classList.contains('psx-more')) openPanel(b); else b.click(); }
      }
    }, true);
    D.addEventListener('contextmenu', (e) => {
      const row = e.target.closest && e.target.closest('#pm-settings-root .setting-row.o55-row');
      if (!row || e.target.closest('input, textarea')) return;
      const b = [...row.querySelectorAll('.o55-about')].find((x) => rowOf(x) === row); if (!b) return;
      e.preventDefault(); rowMenu(b, [e.clientX, e.clientY]);
    }, true);
    let press = 0;
    D.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const row = e.target.closest && e.target.closest('#pm-settings-root .setting-row.o55-row'); if (!row) return;
      const b = [...row.querySelectorAll('.o55-about')].find((x) => rowOf(x) === row); if (!b) return;
      const x = e.clientX, y = e.clientY;
      press = setTimeout(() => rowMenu(b, [x, y]), 550);
    }, true);
    ['pointerup', 'pointercancel', 'pointermove'].forEach((t) => D.addEventListener(t, () => clearTimeout(press), true));
    // the demo Projects folder row writes its computer's own value
    D.addEventListener('change', (e) => {
      const inp = e.target.closest && e.target.closest('[data-psx-input]'); if (!inp) return;
      const id = inp.dataset.psxInput, c = PSX.ctxFull(S.ctx);
      PSX.setOwn(id, { level: 'computer', key: c.on }, inp.value.trim() || undefined);
    }, true);
    D.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-psx-browse]'); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      PSX.note({ title: 'Choose a folder', body: `The folder picker opens for ${placeName('computer', PSX.ctxFull(S.ctx).on)}, the computer that keeps the folder.`, mark: 'info' });
    }, true);
  }

  /* ------------------------------------------------------------------ plain words over the engine's furniture
     Where PMConcept7 says "server" for the computer Puppet Master works on, the concept says Computer (decision S1); an
     MCP server and a language server keep their protocol names. The stand-in id psx-none never shows. Text nodes only,
     so the engine's own patcher and the layer's observers are not woken */
  const GLOBAL_WORDS = [
    [/^Server & Project Location$/, 'Computers & Project Location'],
    [/your server and project location/, 'your computers and project location'],
    [/^Claude Code on your server$/, 'Claude Code on your computer'],
    [/^Wait for a server this long$/, 'Wait for an MCP server this long'],
    [/psx-none/g, 'No project']
  ];
  function plainWords(rootEl) {
    const fix = (root, rules) => {
      if (!root) return;
      const tw = D.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        if (n.parentElement && n.parentElement.closest('[data-psx-block="tech"], code, .o55-insp-tech')) continue;
        let v = n.data; rules.forEach(([re, to]) => { v = v.replace(re, to); });
        if (v !== n.data) n.data = v;
      }
    };
    fix(rootEl, GLOBAL_WORDS);
    // the Servers manager is about the computers themselves: every "server" there is one
    rootEl.querySelectorAll('.manager-page[data-pm51-manager="servers"] .manager-head, .manager-page[data-pm51-manager="servers"] .manager-scroll').forEach((m) => fix(m, [[/\bServers\b/g, 'Computers'], [/\bservers\b/g, 'computers'], [/\bServer\b/g, 'Computer'], [/\bserver\b/g, 'computer']]));
    rootEl.querySelectorAll('[data-workspace="servers"], [data-nav-workspace="servers"]').forEach((m) => fix(m, [[/\bServers\b/g, 'Computers'], [/\bServer\b/g, 'Computer']]));
  }
  PSX.plainWords = () => plainWords(PSX.root());

  /* ------------------------------------------------------------------ the end column's width (review A-r1 finding 3)
     The column is one fixed width so every control lines up (#3), and that width comes from the widest end word the
     concept can show, measured in the current look's own font: Retro's and NieR's faces are wider than Basic's, so a
     fixed 124px cut "Each AI service". It is measured once per look (and again when fonts finish loading), never per
     row, so nothing moves while you work. */
  const END_WORDS = ['Details', 'Varies', 'More', 'This project', 'Each project', 'Each account', 'Each AI service', 'Each persona', 'Each Goal template', 'Each computer', 'Each one'];
  let endKey = '';
  function fitEndColumn() {
    const host = D.getElementById('panel-settings') || PSX.root(); if (!host) return;
    const nier = !!(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on());
    const fontsReady = !D.fonts || D.fonts.status === 'loaded';
    const key = [H.getAttribute('data-theme'), nier, !!S.scopeLabels, S.opt.end, fontsReady].join('|');
    if (key === endKey) return;
    endKey = key;
    if (S.opt.end === 'today') return;
    const words = END_WORDS.concat(Object.keys(PSX.COMPUTERS).map((k) => PSX.COMPUTERS[k].name), Object.keys(PSX.DEVICES).map((k) => PSX.DEVICES[k].name));
    if (S.scopeLabels) Object.keys(PSX.COMPUTERS).forEach((k) => words.push(`Found on ${PSX.COMPUTERS[k].name}`), words.push('Everywhere', 'Default'));
    const row = D.createElement('div'); row.className = 'setting-row o55-row psx-measure'; row.setAttribute('data-o55-foreign', ''); row.setAttribute('aria-hidden', 'true');
    row.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;display:block;width:auto';
    const b = D.createElement('button'); b.type = 'button'; b.tabIndex = -1; b.className = 'icon-btn details-btn o55-about psx-end'; b.style.maxWidth = 'none';
    row.appendChild(b); host.appendChild(row);
    let max = 0;
    words.forEach((w) => { b.innerHTML = `<span class="psx-end-word">${esc(w)}</span>${CHEV}`; max = Math.max(max, b.getBoundingClientRect().width); });
    row.remove();
    const px = Math.max(96, Math.min(220, Math.ceil(max) + 2));
    H.style.setProperty('--psx-end-w', px + 'px');
    if (!fontsReady && D.fonts && !D.__psxFontsHooked) { D.__psxFontsHooked = true; D.fonts.ready.then(() => { endKey = ''; soon(); }); }
  }
  PSX.fitEndColumn = () => { endKey = ''; fitEndColumn(); return H.style.getPropertyValue('--psx-end-w'); };
  /* review A-r3 R3-2: a row's label keeps the Changed mark's place while there is no mark (rows.css), so the row never
     grows when Changed appears. The place is the mark's own size in the current look and Changed option, measured
     with a real mark in a real label, once per look (and again when the fonts finish loading) */
  let chgKey = '';
  function fitChangedSlot() {
    const host = D.getElementById('panel-settings') || PSX.root(); if (!host) return;
    const fontsReady = !D.fonts || D.fonts.status === 'loaded';
    const key = [H.getAttribute('data-theme'), !!(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on()), S.opt.changed, fontsReady].join('|');
    if (key === chgKey) return;
    chgKey = key;
    const row = D.createElement('div'); row.className = 'setting-row o55-row psx-measure'; row.setAttribute('data-o55-foreign', ''); row.setAttribute('aria-hidden', 'true');
    row.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;display:block;width:600px';
    row.innerHTML = `<div class="setting-copy"><div class="setting-label"><span>x</span><span class="o55-changed" data-psx-measure>${mark('change-modified')}<span>Changed</span></span></div></div>`;
    host.appendChild(row);
    const b = row.querySelector('[data-psx-measure]').getBoundingClientRect();
    row.remove();
    // the mark's exact size, not rounded: a slot even half a pixel taller than the mark moved the row by that much
    H.style.setProperty('--psx-chg-w', b.width + 'px');
    H.style.setProperty('--psx-chg-h', b.height + 'px');
    if (!fontsReady && D.fonts) D.fonts.ready.then(() => { chgKey = ''; soon(); });
  }
  /* review A-r3: a switch whose job is to change the page (names beside the activity-bar icons, where each setting comes
     from) reflows everything above it, and the row you clicked could jump hundreds of pixels away from the pointer. For a
     moment after a click on a switch, that row is held where it was on screen: after each layout, before it is painted
     (ResizeObserver), and on each frame. Scrolling by hand, a key or the row being redrawn ends the hold */
  function scrollersOf(el) {
    const out = [];
    for (let sc = el.parentElement; sc && sc !== D.body && sc !== H; sc = sc.parentElement) { const cs = W.getComputedStyle(sc); if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 1) out.push(sc); }
    return out;
  }
  function holdRow(row) {
    const chain = scrollersOf(row); if (!chain.length) return;
    const top0 = row.getBoundingClientRect().top, t0 = performance.now();
    let done = false;
    // the row is put back by the innermost scroller that can take the difference, then the next one out
    const fix = () => {
      if (done) return;
      if (!row.isConnected || performance.now() - t0 > 1600) { end(); return; }
      for (const sc of chain) {
        const d = row.getBoundingClientRect().top - top0;
        if (Math.abs(d) < 0.5) break;
        const was = sc.style.scrollBehavior; sc.style.scrollBehavior = 'auto'; sc.scrollTop += d; sc.style.scrollBehavior = was;
      }
    };
    const ro = new ResizeObserver(fix);
    ro.observe(row); chain.forEach((sc) => [...sc.children].forEach((c) => ro.observe(c)));
    const tick = () => { fix(); if (!done) requestAnimationFrame(tick); };
    const end = () => { done = true; ro.disconnect(); chain.forEach((sc) => { sc.removeEventListener('wheel', end); sc.removeEventListener('touchmove', end); }); D.removeEventListener('keydown', end, true); };
    chain.forEach((sc) => { sc.addEventListener('wheel', end, { passive: true }); sc.addEventListener('touchmove', end, { passive: true }); });
    D.addEventListener('keydown', end, true);
    requestAnimationFrame(tick);
  }
  D.addEventListener('click', (e) => {
    const tg = e.target && e.target.closest && e.target.closest('#pm-settings-root .setting-row .toggle');
    if (tg) holdRow(tg.closest('.setting-row'));
  }, true);
  PSX.fitChangedSlot = () => { chgKey = ''; fitChangedSlot(); return [H.style.getPropertyValue('--psx-chg-w'), H.style.getPropertyValue('--psx-chg-h')]; };

  /* ------------------------------------------------------------------ decorate everything (rAF-batched) */
  let raf = 0;
  function decorate() {
    raf = 0;
    const rootEl = PSX.root(); if (!rootEl) return;
    S.scopeLabels = scopeLabelsOn();
    if (PSX.panel) PSX.panel.install();   // the panel's host is drawn with a workspace page, not with Settings Home
    H.setAttribute('data-psx-end', S.opt.end);
    H.setAttribute('data-psx-changed', S.opt.changed);
    H.toggleAttribute('data-psx-scope-labels', !!S.scopeLabels);
    try { fitEndColumn(); } catch (e) { console.error('[psx end column]', e); }
    try { fitChangedSlot(); } catch (e) { console.error('[psx changed slot]', e); }
    if (W.PM_PAGES && W.PM_PAGES.current === 'settings') { placeFolderRow(); headLine(); }
    rootEl.querySelectorAll('.o55-about').forEach((b) => { try { decorateButton(b); } catch (e) { console.error('[psx rows]', e); } });
    try { plainWords(rootEl); } catch (e) { console.error('[psx words]', e); }
    if (PSX.managers) try { PSX.managers.decorate(); } catch (e) { console.error('[psx managers]', e); }
  }
  const soon = () => { if (!raf) raf = requestAnimationFrame(decorate); };
  /* Jared #4: toggling a setting shook the page. The base page redraws a changed row (refreshSettingRow) and puts its
     round "?" back into the end button; the layer's word came back one frame later, so for that frame the control
     jumped 40px sideways and back. The end column is now fixed (rows.css), and the rows a mutation touched are
     decorated again inside this observer callback: a microtask after the base page's own change, so no frame is ever
     painted with the "?" in it. Everything else (the header, the managers) still waits for the next frame. */
  function redrawNow(muts) {
    const btns = new Set();
    for (const m of muts) {
      const t = m.target && m.target.nodeType === 1 ? m.target : m.target && m.target.parentElement;
      const b = t && t.closest && t.closest('.o55-about');
      if (b) btns.add(b);
      const row = t && t.closest && t.closest('.setting-row.o55-row, .o55-field');
      if (row) row.querySelectorAll('.o55-about').forEach((x) => btns.add(x));
      m.addedNodes.forEach((n) => { if (n.nodeType !== 1) return; if (n.matches('.o55-about')) btns.add(n); n.querySelectorAll && n.querySelectorAll('.o55-about').forEach((x) => btns.add(x)); });
    }
    // no cap: a whole page redrawn at once (a change that re-renders Settings) is decorated in the same task too
    if (!btns.size) return false;
    btns.forEach((b) => { if (b.isConnected) try { decorateButton(b, { sync: true }); } catch (e) { console.error('[psx rows]', e); } });
    return true;
  }
  function observe() {
    const rootEl = PSX.root(); if (!rootEl || rootEl.__psxObs) return;
    rootEl.__psxObs = new MutationObserver((muts) => {
      // our own writes only touch attributes we set and nodes we add; skip mutations that are entirely ours
      if (muts.every((m) => [...m.addedNodes, ...m.removedNodes].every((n) => n.nodeType !== 1 || (n.classList && [...n.classList].some((c) => /^psx-/.test(c)))))) return;
      if (S.opt.end !== 'today' && PSX.booted) redrawNow(muts);
      soon();
    });
    rootEl.__psxObs.observe(rootEl, { childList: true, subtree: true });
    soon();   // a new root comes with its rows already in it
  }
  /* a safety net: a row the engine drew without a mutation the observer saw is decorated within a second */
  setInterval(() => {
    if (S.opt.end === 'today' || !PSX.booted) return;
    const rootEl = PSX.root(); if (!rootEl) return;
    if (!rootEl.__psxObs) observe();
    if (rootEl.querySelector('.setting-row > .o55-about:not(.psx-end), .o55-field:not(.o55-policy-field) .o55-about:not(.psx-end)')) soon();
  }, 1000);
  function refreshAll() {
    PSX.root() && PSX.root().querySelectorAll('[data-psx-done]').forEach((n) => { delete n.dataset.psxDone; });
    soon();
  }
  PSX.on('redraw', refreshAll); PSX.on('fed', refreshAll); PSX.on('ctx', refreshAll);
  // a new look sizes the end column again (fitEndColumn), on the next frame
  new MutationObserver(() => soon()).observe(H, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
  PSX.rows = { decorate, soon, observe, wire, where, lines, rowMenu, openPanel, refreshAll, headLine };
})(window);
