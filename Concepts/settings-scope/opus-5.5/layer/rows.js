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
  function decorateButton(btn) {
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
    const sig = JSON.stringify([opt, S.opt.changed, wd.word, wd.here, wd.sentence, wd.mark2, ln, changed, kind]);
    // the engine's in-place redraw can patch a row back while keeping this attribute: check the drawing is still there
    if (btn.dataset.psxDone === sig && row.dataset.psxDone === sig && intact(row, btn, opt, wd, ln, changed, kind)) return;
    btn.dataset.psxDone = sig; row.dataset.psxDone = sig;
    // clear what an earlier option drew
    row.querySelectorAll(':scope .psx-mark2, :scope .psx-line, :scope .psx-risk').forEach((n) => { if (rowOf(n) === row) n.remove(); });
    btn.classList.remove('psx-end', 'is-here', 'psx-more', 'is-quiet');
    if (opt === 'today') {
      btn.innerHTML = btn.__psxOrig.html;
      if (btn.__psxOrig.aria) btn.setAttribute('aria-label', btn.__psxOrig.aria);
      if (btn.__psxOrig.hover) btn.setAttribute('data-pm-hover-label', btn.__psxOrig.hover);
      if (btn.__psxOrig.detail) btn.setAttribute('data-pm-hover-detail', btn.__psxOrig.detail); else btn.removeAttribute('data-pm-hover-detail');
      syncChanged(row, id, changed, demo);
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
    syncChanged(row, id, changed, demo);
    drawLines(row, id, ln);
  }
  function intact(row, btn, opt, wd, ln, changed, kind) {
    if (opt === 'today' ? btn.classList.contains('psx-end') : !(btn.classList.contains('psx-end') && btn.querySelector('.psx-end-word'))) return false;
    if (kind === 'field') return true;
    const lab = row.querySelector('.setting-label');
    if (changed !== null && lab && !!lab.querySelector('.o55-changed:not(.o55-needed)') !== !!changed) return false;
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
  function syncChanged(row, id, changed, demo) {
    if (!demo || row.classList.contains('o55-field')) return;
    row.classList.toggle('is-changed', !!changed);
    const lab = row.querySelector('.setting-label'); if (!lab) return;
    let m = lab.querySelector('.o55-changed:not(.o55-needed)');
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

  /* ------------------------------------------------------------------ the Settings head line (7.7) */
  function headLine() {
    const bar = D.querySelector('#pm-settings-root .document-toolbar'); if (!bar) return;
    const c = PSX.ctxFull(S.ctx), dev = PSX.DEVICES[S.actor] || PSX.DEVICES.here;
    const youre = S.actor === 'here' ? 'This computer' : dev.name;
    const proj = c.project ? c.project : 'No project';
    const home = PSX.home(), hn = PSX.homeName();
    const lines2 = [];
    // the settings home, whichever computer it is (7.2); a project's work computer that isn't answering is the row's line
    if (!PSX.answering(home)) lines2.push(`<div class="psx-head-line" data-k="offline">${mark('offline')}<span>Can’t reach ${esc(hn)}, which keeps your settings. You’re seeing them as of ${esc(PSX.W.asOf)}.</span></div>`);
    if (S.firstStart) lines2.push(`<div class="psx-head-line" data-k="first">${mark('info')}<span>Set up Puppet Master on this computer first. Until then nothing is kept, so Settings is a preview in Basic Dark.</span></div>`);
    else if (!c.project) lines2.push(`<div class="psx-head-line" data-k="none">${mark('info')}<span>No project is open. Changes here apply everywhere or on this computer.</span></div>`);
    if (S.viewAs || c.view || c.device !== S.actor) lines2.push(`<div class="psx-head-line" data-k="view">${mark('info')}<span>You’re changing settings as ${esc(c.project || 'No project')} on ${esc(placeName('computer', c.on))}${c.device !== S.actor ? `, with ${esc(placeName('device', c.device))}’s screen` : ''}.</span><button type="button" class="psx-tb" data-psx-head="mine">Back to my view</button></div>`);
    if (dev && dev.limited) lines2.push(`<div class="psx-head-line" data-k="limited">${mark('info')}<span>${esc(PSX.REASONS.limited_device[0])}</span></div>`);
    if (S.runMode === 'yolo') lines2.push(`<div class="psx-head-line" data-k="yolo">${mark('info')}<span>YOLO: changes don’t wait for a yes. Each one is reported, with Undo; the guards YOLO never skips still ask.</span></div>`);
    const html = `<div class="psx-head-main"><span class="psx-head-ctx"><b>${esc(proj)}</b><span aria-hidden="true">·</span><span>works on ${esc(placeName('computer', c.on))}</span><span aria-hidden="true">·</span><span>you’re on ${esc(youre)}</span></span><button type="button" class="psx-tb psx-head-btn" data-psx-head="view" aria-haspopup="menu">Change view${CHEV}</button></div>${lines2.join('')}`;
    let el = bar.querySelector(':scope > .psx-head');
    // the page's own actions (the project button, Page options) sit over the toolbar's right end: keep the line clear of them
    const pa = bar.querySelector(':scope > .page-actions');
    const pr = pa && getComputedStyle(pa).position === 'absolute' ? pa.offsetWidth + 16 : 12;
    if (el && el.__pr !== pr) { el.style.paddingRight = pr + 'px'; el.__pr = pr; }
    if (el && el.__html === html) return;
    if (!el) { el = D.createElement('div'); el.className = 'psx-head'; el.setAttribute('data-o55-foreign', ''); el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Whose settings you’re seeing'); bar.insertBefore(el, bar.firstChild); }
    el.innerHTML = html; el.__html = html;
    if (el.__pr !== pr) { el.style.paddingRight = pr + 'px'; el.__pr = pr; }
  }
  function viewMenu(anchor) {
    const c = PSX.ctxFull(S.ctx);
    const projects = PSX.PROJECTS.map((p) => ({ label: p.id, meta: `works on ${placeName('computer', p.home)}`, run: () => { S.viewAs = p.id !== 'tastebook'; PSX.setCtx({ project: p.id, on: null }); } }));
    const comps = PSX.computerIds().map((k) => ({ label: PSX.COMPUTERS[k].name, meta: c.project ? `${c.project} as if it worked there` : 'chats with no project', disabled: PSX.W.up[k] === false ? `${PSX.COMPUTERS[k].name} isn’t answering` : null, run: () => { S.viewAs = true; PSX.setCtx({ on: k }); } }));
    // viewing another device's screen values never gives that device's rights: you stay on the device you're using
    const devs = Object.keys(PSX.DEVICES).map((k) => ({ label: PSX.DEVICES[k].name, meta: k === S.actor ? 'the one you’re using' : 'see its screen settings', run: () => PSX.setCtx({ device: k }) }));
    PSX.menu(anchor, [
      { label: 'Another project', items: projects },
      { label: 'Another computer', items: comps },
      { label: 'Another device', items: devs },
      { label: 'No project', items: [{ label: 'No project', meta: 'chats with no project', run: () => { S.viewAs = false; PSX.setCtx({ project: 'none', on: null }); } }] },
      // one place to see every difference (3.6), from any page
      { label: 'Everything at once', items: [{ label: 'All the differences…', meta: 'every project’s and computer’s own values', run: () => { if (PSX.moments) PSX.moments.differences(); } }] }
    ], { label: 'Change view', search: true, width: 300 });
  }

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
      if (head) { e.preventDefault(); e.stopImmediatePropagation(); if (head.dataset.psxHead === 'view') viewMenu(head); else if (head.dataset.psxHead === 'diff') { if (PSX.moments) PSX.moments.differences(); } else { S.viewAs = false; PSX.setCtx({ project: 'tastebook', on: null, device: S.actor }); } return; }
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

  /* ------------------------------------------------------------------ decorate everything (rAF-batched) */
  let raf = 0;
  function decorate() {
    raf = 0;
    const rootEl = PSX.root(); if (!rootEl) return;
    S.scopeLabels = scopeLabelsOn();
    if (PSX.panel) PSX.panel.install();   // the panel's host is drawn with a workspace page, not with Settings Home
    H.setAttribute('data-psx-end', S.opt.end);
    H.setAttribute('data-psx-changed', S.opt.changed);
    if (W.PM_PAGES && W.PM_PAGES.current === 'settings') { placeFolderRow(); headLine(); }
    rootEl.querySelectorAll('.o55-about').forEach((b) => { try { decorateButton(b); } catch (e) { console.error('[psx rows]', e); } });
    try { plainWords(rootEl); } catch (e) { console.error('[psx words]', e); }
    if (PSX.managers) try { PSX.managers.decorate(); } catch (e) { console.error('[psx managers]', e); }
  }
  const soon = () => { if (!raf) raf = requestAnimationFrame(decorate); };
  function observe() {
    const rootEl = PSX.root(); if (!rootEl || rootEl.__psxObs) return;
    rootEl.__psxObs = new MutationObserver((muts) => {
      // our own writes only touch attributes we set and nodes we add; skip mutations that are entirely ours
      if (muts.every((m) => [...m.addedNodes, ...m.removedNodes].every((n) => n.nodeType !== 1 || (n.classList && [...n.classList].some((c) => /^psx-/.test(c)))))) return;
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
  PSX.rows = { decorate, soon, observe, wire, where, lines, rowMenu, openPanel, refreshAll, headLine };
})(window);
