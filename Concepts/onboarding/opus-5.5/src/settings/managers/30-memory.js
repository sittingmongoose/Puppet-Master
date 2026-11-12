/* Memory (FO-167, 2026-11-12): the quiet Memory design Jared approved on 2026-11-11
   (share/puppet-master/2026-11-11-memory-review: PACKET section 3 and the mock, screens 01 to 10).
   - One page: the switch "Remember things between chats", one quiet line saying who else reads the notes (not a
     setting), and the saved notes: search, a level filter (All / This project / Every project) that opens as the kit's
     own dropdown popover, Add memory (a dialog with the text and "Where it's available", the same dropdown), Edit,
     Delete with one confirm, and a collapsed Archived group that search still reaches. Each note shows its words, its
     level and when it was saved. Nothing ranks, pins, checks, cites, sources or fades a note by hand: fading is
     automatic and deleting is always the person's choice.
   - The chat's Memory button and the wand's Memory row open this same page as a sheet over the chat
     (window.PM7_MEMORY.openSheet, called by the chat port's 80-quiet-memory.js); "View" after a reply that saved
     something opens it with that note lit. Both places draw the same markup from one store (PM51.s().memoryNotes)
     and run the kit's own dispatch (actions, dropdowns, dialogs); the sheet borrows Settings' look per theme from a
     copy of the #panel-settings rules its parts use (sheetLook below).
   - The rows this page drew before: placement.d/30-memory.json says where each went. This file keeps the two editors
     those rows still open: the rule documents (Personas & Crews > Defaults > Standing instructions) and the working
     space split (Advanced Settings, until Plans retires it). */
(function () {
  const ID = 'context-memory';
  const KEY = 'memory-context-instructions';
  const S = { on: 'memory.retention.enabled', appRules: 'memory.assembly.app-rules', projectRules: 'memory.assembly.project-rules', buckets: 'memory.limits.budget-buckets', immune: 'memory.limits.compaction-immune-pct' };
  const APP_RULES_SEED = 'Seeded from AGENTS.md on first run';
  /* the approved mock's notes: six current, three archived */
  const SEED = [
    { id: 'n1', text: 'API tests need the local Postgres test database on port 5433.', level: 'project', saved: 'Today' },
    { id: 'n2', text: 'Always use pnpm, not npm or yarn.', level: 'every', saved: 'Today' },
    { id: 'n3', text: 'Recipe photos go through the media pipeline, never straight to storage.', level: 'project', saved: 'Nov 8' },
    { id: 'n4', text: 'Likes short answers with the command first.', level: 'every', saved: 'Nov 4' },
    { id: 'n5', text: 'Migration dry runs go to staging, never production.', level: 'project', saved: 'Nov 3' },
    { id: 'n6', text: 'Release notes are written for home cooks, not developers.', level: 'project', saved: 'Oct 28' },
    { id: 'a1', text: 'The tenant migration is waiting on the billing team.', level: 'project', saved: 'Aug 2', archived: true },
    { id: 'a2', text: 'Trying out Bun for small scripts.', level: 'every', saved: 'Jul 19', archived: true },
    { id: 'a3', text: 'The old docs site was built with Hugo.', level: 'project', saved: 'Jun 11', archived: true }
  ];
  const HELP_ON = 'Puppet Master keeps short notes so you don’t have to repeat yourself. Notes it hasn’t used in a while move to Archived on their own. Only you delete them.';
  const HELP_OFF = 'Off: nothing new is saved and nothing is used. Your saved notes stay here.';
  const SHARE = 'Crews, reviews and the chat’s helpers can read these notes too, including notes about you.';
  const on = v => v === true || v === 'on' || v === 'true';
  const memoryOn = () => on(PM51.value(S.on));
  const projectName = () => { try { const n = window.PM7_SETTINGS_TOME && window.PM7_SETTINGS_TOME.projectLabel(); return n && n !== 'No project' ? n : ''; } catch (e) { return ''; } };
  const levelLabel = level => level === 'project' ? 'This project' : 'Every project';
  const levelPick = level => level === 'project' ? (projectName() ? `This project (${projectName()})` : 'This project') : 'Every project';
  const levelHelp = level => level === 'project' ? (projectName() ? `Only chats in ${projectName()} use it.` : 'Only chats in this project use it.') : 'Every chat, in all your projects.';
  const levelPhrase = level => level === 'project' ? 'for this project' : 'for every project';

  /* ---------- the store: one list, shared by the page, the sheet and the chat ---------- */
  function store() {
    const s = PM51.s();
    if (!s.memoryNotes || !Array.isArray(s.memoryNotes.notes)) s.memoryNotes = { v: 1, notes: clone(SEED), seq: 0 };
    return s.memoryNotes;
  }
  const notes = () => store().notes;
  const noteById = id => notes().find(n => n.id === id) || null;
  const norm = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  function addNote(text, level) {
    const words = String(text || '').trim(); if (!words) return null;
    const same = notes().find(n => norm(n.text) === norm(words));
    if (same) { Object.assign(same, { level: level || same.level, archived: false, saved: 'Today' }); saveState(); return same; }
    const st = store(); const n = { id: 'u' + (++st.seq) + '-' + Date.now().toString(36), text: words, level: level === 'every' ? 'every' : 'project', saved: 'Today' };
    notes().unshift(n); saveState(); return n;
  }

  /* ---------- what a place shows ---------- */
  const UI = { page: { q: '', level: 'all', arch: false }, sheet: { q: '', level: 'all', arch: false } };
  let flash = '', flashTimer = 0;
  function visible(place) {
    const u = UI[place], q = u.q.trim().toLowerCase();
    return notes().filter(n => (u.level === 'all' || n.level === u.level) && (!q || n.text.toLowerCase().includes(q)));
  }
  function rowHtml(n, place) {
    return `<div class="mm-row${n.archived ? ' is-archived' : ''}${flash === n.id ? ' is-flash' : ''}" data-mm-note="${a(n.id)}">`
      + `<div class="mm-row-main"><p class="mm-row-text">${h(n.text)}</p>`
      + `<div class="mm-row-meta"><span class="pm51-tag mm-level" data-level="${a(n.level)}">${icon(n.level === 'project' ? 'folder' : 'user')}${h(levelLabel(n.level))}</span>`
      + `<span class="mm-sep" aria-hidden="true">·</span><span class="mm-when">Saved ${h(n.saved === 'Today' ? 'today' : n.saved)}</span>`
      + (n.archived ? `<span class="mm-sep" aria-hidden="true">·</span><span class="mm-archived-mark">${icon('archive')}Archived</span>` : '')
      + `</div></div><div class="mm-row-actions">`
      + PM51.iconBtn({ action: 'pm51-memory-edit', data: { id: n.id, place }, icon: 'edit', label: 'Edit memory' })
      + PM51.iconBtn({ action: 'pm51-memory-delete', data: { id: n.id, place }, icon: 'trash', label: 'Delete memory', cls: 'mm-del' })
      + `</div></div>`;
  }
  function bodyHtml(place) {
    const u = UI[place], list = visible(place), onNow = memoryOn();
    const cur = list.filter(n => !n.archived), arch = list.filter(n => n.archived);
    const total = notes().filter(n => !n.archived).length;
    const searching = !!u.q.trim(), openArch = u.arch || (searching && arch.length > 0);
    const archAll = notes().filter(n => n.archived && (u.level === 'all' || n.level === u.level)).length;
    const intro = `<section class="panel-card pm51-section mm-intro" id="${place === 'page' ? 'mm-notes' : 'mm-sheet-notes'}"><div class="pm51-section-body">`
      + `<div class="setting-list o55-bound-rows">${PM51.bound.row(S.on, { help: onNow ? HELP_ON : HELP_OFF })}</div>`
      + `<p class="mm-share-line">${icon('users')}<span>${h(SHARE)}</span></p></div></section>`;
    const toolbar = `<div class="mm-toolbar">`
      + `<label class="mm-search">${icon('search')}<input type="search" data-action="pm51-memory-search" data-place="${a(place)}" placeholder="Search memories" aria-label="Search memories" value="${a(u.q)}"/></label>`
      + `<span class="mm-level">${PM51.dropdown(u.level, [{ value: 'all', label: 'All' }, { value: 'project', label: 'This project' }, { value: 'every', label: 'Every project' }], { action: 'pm51-memory-level', data: { place }, label: 'Show' })}</span>`
      + `<span class="mm-spacer"></span>`
      + (place === 'page' ? `<span class="o55-quiet-line mm-count">${total} ${total === 1 ? 'note' : 'notes'}</span>` : '')
      + PM51.btn({ label: 'Add memory', icon: 'plus', primary: true, action: 'pm51-memory-add', data: { place }, cls: 'mm-add' })
      + `</div>`;
    let listHtml = `<div class="mm-list${onNow ? '' : ' is-paused'}">`;
    if (!cur.length && !arch.length) listHtml += `<div class="mm-empty">${searching ? `No saved notes match “${h(u.q.trim())}”.` : 'Nothing saved at this level yet.'}</div>`;
    listHtml += cur.map(n => rowHtml(n, place)).join('');
    if (archAll || arch.length) {
      listHtml += `<div class="mm-archived${openArch ? ' is-open' : ''}">`
        + `<button type="button" class="mm-archived-toggle" data-action="pm51-memory-archived" data-place="${a(place)}" aria-expanded="${openArch}">${icon('chevron', 'mm-chev')}`
        + `<span class="mm-archived-title">Archived</span><span class="mm-archived-count">${searching ? `${arch.length} of ${archAll}` : archAll}</span>`
        + `<span class="mm-archived-hint">${searching ? (arch.length ? 'Archived notes that match' : 'No archived notes match') : 'Not used in a while. Still searchable.'}</span></button>`
        + (openArch ? `<div class="mm-archived-body">${arch.map(n => rowHtml(n, place)).join('')}</div>` : '')
        + `</div>`;
    }
    listHtml += `</div>`;
    return intro + toolbar + listHtml;
  }
  const mountHtml = place => `<div class="mm-mount" data-mm-place="${place}">${bodyHtml(place)}</div>`;
  /* redraw a place in place, keeping the caret in the search box or the focus on the control that had it */
  function redraw(place) {
    const mount = place === 'sheet' ? (sheet && sheet.mount) : root.querySelector('.mm-mount[data-mm-place="page"]');
    if (!mount || !mount.isConnected) return;
    const act = document.activeElement, inside = act && mount.contains(act);
    const key = inside ? (act.matches('input[type="search"]') ? 'input[type="search"]' : act.dataset.id ? `[data-action="${cssEscape(act.dataset.action || '')}"][data-id="${cssEscape(act.dataset.id)}"]` : act.dataset.action ? `[data-action="${cssEscape(act.dataset.action)}"]` : act.dataset.setting ? `[data-setting="${cssEscape(act.dataset.setting)}"]` : '') : '';
    const caret = inside && act.matches('input[type="search"]') ? act.selectionStart : null;
    mount.innerHTML = bodyHtml(place);
    if (place === 'sheet') mount.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    if (key) { const t = mount.querySelector(key); if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } if (caret != null) try { t.setSelectionRange(caret, caret); } catch (e) { /* not a text box */ } } }
  }
  const redrawAll = () => { redraw('page'); redraw('sheet'); };
  function lightUp(id) {
    flash = id || ''; clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { flash = ''; document.querySelectorAll('.mm-row.is-flash').forEach(r => r.classList.remove('is-flash')); }, 2400);
  }
  const placeOf = el => (el && el.dataset && el.dataset.place) || (el && el.closest && el.closest('.pm7-mem-sheet') ? 'sheet' : 'page');

  /* ---------- the page ---------- */
  function render() {
    store();
    return PM51.page({ id: ID, key: KEY, tabs: [], active: '', cls: 'mm-page', body: mountHtml('page') });
  }
  PM51.manager('memory', { render });
  PM51.watch(S.on, () => redrawAll());
  const mmRefreshRow = refreshSettingRow;
  refreshSettingRow = function (id) { const out = mmRefreshRow.apply(this, arguments); if (id === S.on) redrawAll(); return out; };

  /* ---------- actions (the page through the engine's own dispatch, the sheet through the same tables) ---------- */
  PM51.onInput('memory-search', el => { const place = placeOf(el); UI[place].q = el.value; redraw(place); });
  PM51.onChange('memory-level', el => { const place = placeOf(el); UI[place].level = ['project', 'every'].includes(el.value) ? el.value : 'all'; redraw(place); });
  PM51.on('memory-archived', el => { const place = placeOf(el); UI[place].arch = !UI[place].arch; redraw(place); });
  PM51.on('memory-add', el => editDialog(placeOf(el), null));
  PM51.on('memory-edit', el => { const n = noteById(ds(el, 'id')); if (n) editDialog(placeOf(el), n); });
  PM51.on('memory-delete', el => { const n = noteById(ds(el, 'id')); if (n) deleteDialog(placeOf(el), n); });

  function editDialog(place, note) {
    const isNew = !note, level = note ? note.level : 'project';
    const body = `<label class="form-field full mm-field"><span class="form-label">What should Puppet Master remember?</span>`
      + `<textarea class="form-textarea" name="text" data-autofocus placeholder="For example: release notes are written for home cooks, not developers.">${h(note ? note.text : '')}</textarea>`
      + `<div class="form-help">Write it the way you would tell a colleague.</div></label>`
      + `<div class="form-field full mm-field"><span class="form-label">Where it’s available</span>`
      + PM51.dropdown(level, [{ value: 'project', label: levelPick('project'), meta: levelHelp('project') }, { value: 'every', label: levelPick('every'), meta: levelHelp('every') }], { name: 'level', label: 'Where it’s available', cls: 'form-select' })
      + `<div class="form-help mm-level-help">${h(levelHelp(level))}</div></div>`;
    const ov = openDialog({
      title: isNew ? 'Add memory' : 'Edit memory', subtitle: isNew ? 'Something Puppet Master should keep in mind.' : '',
      body, saveLabel: isNew ? 'Add memory' : 'Save changes',
      onSave: data => {
        const text = String(data.text || '').trim(), lv = data.level === 'every' ? 'every' : 'project';
        const box = ov && ov.querySelector('textarea[name="text"]');
        if (!text) { if (box) { box.classList.add('mm-need'); box.focus(); } return false; }
        let n = note;
        if (isNew) n = addNote(text, lv);
        else Object.assign(note, { text, level: lv, archived: false });
        saveState(); lightUp(n && n.id); redrawAll();
        PM51.toast(isNew ? 'Memory added' : 'Memory saved', text.length > 60 ? text.slice(0, 57) + '…' : text);
      },
      onOpen: o => o.addEventListener('change', e => { if (e.target && e.target.name === 'level') { const help = o.querySelector('.mm-level-help'); if (help) help.textContent = levelHelp(e.target.value); } })
    });
    if (ov) ov.classList.add('mm-overlay');
    const dlg = ov && ov.querySelector('.dialog'); if (dlg) dlg.classList.add('mm-dialog');
    return ov;
  }
  function deleteDialog(place, note) {
    const body = `<blockquote class="mm-quote">${h(note.text)}<span class="mm-quote-meta">${h(levelLabel(note.level))}</span></blockquote>`
      + `<p class="mm-confirm-line">Puppet Master stops using it right away. This can’t be undone.</p>`;
    const ov = openDialog({
      title: 'Delete this memory?', body, saveLabel: 'Delete',
      onSave: () => { const i = notes().indexOf(note); if (i >= 0) notes().splice(i, 1); saveState(); redrawAll(); PM51.toast('Memory deleted', note.text.length > 60 ? note.text.slice(0, 57) + '…' : note.text, 'info'); }
    });
    if (ov) {
      ov.classList.add('mm-overlay');
      const dlg = ov.querySelector('.dialog'); if (dlg) dlg.classList.add('mm-dialog');
      const ok = ov.querySelector('.dialog-footer button[type="submit"]'); if (ok) ok.classList.add('mm-danger');
    }
    return ov;
  }

  /* ---------- the sheet over the chat (mock 10): the same page, the chat column's height under its header ---------- */
  let sheet = null, lookReady = false, portalWas = null, opener = null;
  const chatPanel = () => document.getElementById('chatPanel');
  const narrow = () => window.innerWidth <= 600;
  function ensureSheet() {
    if (sheet && sheet.layer.isConnected) return sheet;
    const layer = document.createElement('div');
    layer.className = 'pm7-mem-layer'; layer.hidden = true;
    layer.innerHTML = `<div class="pm7-mem-scrim" data-mm-sheet="close"></div>`
      + `<section class="pm7-mem-sheet" role="dialog" aria-modal="true" aria-label="Memory">`
      + `<header class="pm7-mem-head"><span class="pm7-mem-grip" aria-hidden="true"></span><h2 class="pm7-mem-title">Memory</h2>`
      + `<button type="button" class="pm51-link pm7-mem-open" data-mm-sheet="settings">Open in Settings</button>`
      + `<button type="button" class="icon-btn pm7-mem-x" data-mm-sheet="close" aria-label="Close" data-pm-hover-label="Close">${icon('close')}</button></header>`
      + `<div class="pm7-mem-body"><div class="pm-app is-ready"><div class="manager-page pm51-mgr mm-page"><div class="manager-body pm51-body"><div class="manager-scroll pm51-scroll">`
      + `<div class="mm-mount" data-mm-place="sheet"></div></div></div></div></div></div>`
      + `<div class="pm7-mem-portal"></div></section>`;
    document.body.appendChild(layer);
    sheet = { layer, el: layer.querySelector('.pm7-mem-sheet'), mount: layer.querySelector('.mm-mount'), portal: layer.querySelector('.pm7-mem-portal') };
    layer.addEventListener('click', onSheetClick);
    layer.addEventListener('input', e => { const el = e.target.closest('[data-action]'); if (el) handleInputAction(el.dataset.action, el); });
    layer.addEventListener('change', e => { const el = e.target.closest('[data-action]'); if (el) handleChangeAction(el.dataset.action, el); });
    return sheet;
  }
  /* the engine handles clicks inside Settings only; inside the sheet the same dispatch runs from here */
  function onSheetClick(e) {
    const t = e.target;
    const own = t.closest('[data-mm-sheet]');
    if (own) { e.preventDefault(); if (own.dataset.mmSheet === 'settings') { closeSheet(false); const tab = document.getElementById('tab-settings'); if (tab) tab.click(); PM51.go('memory', ID); } else closeSheet(true); return; }
    const overlay = t.closest('.overlay');
    if (overlay && t === overlay) return;
    const cb = t.closest('[data-callback]');
    if (cb) { e.preventDefault(); const fn = actionCallbacks.get(cb.dataset.callback); if (fn) fn(cb, e); return; }
    const el = t.closest('[data-action]');
    if (!el || ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;
    e.preventDefault();
    try { dispatchAction(el.dataset.action, el, e); } catch (err) { console.error(err); }
  }
  function placeSheet() {
    if (!sheet || sheet.layer.hidden) return;
    const panel = chatPanel(), r = panel && panel.getBoundingClientRect();
    if (!r || !r.width || !r.height) { closeSheet(false); return; }
    const L = sheet.layer.style;
    L.left = r.left + 'px'; L.top = r.top + 'px'; L.width = r.width + 'px'; L.height = r.height + 'px';
    const head = panel.querySelector('.chat-header');
    const hb = head && head.getBoundingClientRect();
    sheet.el.style.top = (narrow() ? 28 : hb && hb.height ? Math.round(hb.bottom - r.top) : 46) + 'px';
  }
  /* Settings' look per theme, borrowed: every #panel-settings rule that styles a part the page draws (tokens, card,
     row, switch, field, dropdown trigger, buttons, tag, dialog) is copied once with .pm7-mem-sheet in its place, in
     page order and inside the same @media / @container / @supports, so the sheet follows the look exactly. Rules on
     the panel element itself keep only its custom properties, color-scheme, container and font. */
  const PARTS = ['.toggle', '.pm51-dd', '.btn', '.icon-btn', '.pm51-icon-btn', '.pm51-tag', '.panel-card', '.pm51-section', '.setting-', '.o55-row', '.o55-bound', '.o55-quiet', '.dialog', '.overlay', '.form-', '.alert-strip', '.pm51-link', '.pm-app', '.manager-page', '.manager-body', '.manager-scroll', '.pm51-mgr', '.pm51-body', '.pm51-scroll', '.mm-', '.details-btn', '.icon', '.toast'];
  const SELF_KEEP = /^(--|color-scheme$|container|font|color$|-webkit-font-smoothing$)/;
  function sheetLook() {
    if (lookReady) return;
    lookReady = true;
    const out = [];
    const sub = sel => sel.replace(/#panel-settings(?![\w-])/g, '.pm7-mem-sheet');
    const selfOnly = sel => sel.split(',').some(s => /#panel-settings(?![\w-])[^\s>+~]*$/.test(s.trim()));
    const walk = (rules, into) => {
      for (const r of rules) {
        if (r.selectorText !== undefined) {
          const sel = r.selectorText; if (sel.indexOf('#panel-settings') < 0) continue;
          if (selfOnly(sel)) {
            const keep = []; for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (SELF_KEEP.test(p)) keep.push(`${p}: ${r.style.getPropertyValue(p)}${r.style.getPropertyPriority(p) ? ' !important' : ''}`); }
            const parts = sel.split(',').filter(s => /#panel-settings(?![\w-])[^\s>+~]*$/.test(s.trim()));
            if (keep.length) into.push(`${sub(parts.join(','))} { ${keep.join('; ')} }`);
            if (parts.length === sel.split(',').length) continue;
          }
          if (!PARTS.some(p => sel.indexOf(p) >= 0)) continue;
          into.push(sub(r.cssText.slice(0, r.cssText.indexOf('{'))) + r.cssText.slice(r.cssText.indexOf('{')));
        } else if (r.cssRules && (r.conditionText !== undefined || r.containerQuery !== undefined || r.name !== undefined)) {
          const inner = []; walk(r.cssRules, inner); if (!inner.length) continue;
          const head = r.cssText.slice(0, r.cssText.indexOf('{')).trim();
          into.push(`${head} { ${inner.join('\n')} }`);
        }
      }
    };
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules; } catch (e) { continue; }
      if (!rules || (ss.ownerNode && ss.ownerNode.id === 'pm7-mem-look')) continue;
      const inner = []; walk(rules, inner); if (!inner.length) continue;
      const media = ss.media && ss.media.mediaText;
      out.push(media && media !== 'all' ? `@media ${media} { ${inner.join('\n')} }` : inner.join('\n'));
    }
    const style = document.createElement('style'); style.id = 'pm7-mem-look';
    style.textContent = out.join('\n');
    document.head.appendChild(style);
  }
  function openSheet({ flash: id = '', from = null } = {}) {
    const panel = chatPanel(); if (!panel) return { ok: false, error: 'no_chat' };
    sheetLook();
    const s = ensureSheet();
    opener = from || document.activeElement;
    store();
    UI.sheet = { q: '', level: 'all', arch: false };
    const n = id ? noteById(id) : null;
    if (n) { lightUp(n.id); if (n.archived) UI.sheet.arch = true; }
    redraw('sheet');
    if (!portalWas) { portalWas = window.PM7_SETTINGS_TOME.portal; window.PM7_SETTINGS_TOME.portal = () => (sheet && !sheet.layer.hidden ? sheet.portal : portalWas()); }
    s.layer.hidden = false;
    s.layer.classList.toggle('is-narrow', narrow());
    placeSheet();
    requestAnimationFrame(() => { s.layer.classList.add('is-open'); });
    if (n) { const row = s.mount.querySelector(`.mm-row[data-mm-note="${cssEscape(n.id)}"]`); if (row) row.scrollIntoView({ block: 'center' }); }
    const first = s.el.querySelector('.pm7-mem-x'); if (first) try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    return { ok: true };
  }
  function closeSheet(restore = true) {
    if (!sheet || sheet.layer.hidden) return;
    popoutClose({ restoreFocus: false });
    sheet.portal.querySelectorAll('.overlay, .drawer-wrap').forEach(n => n.remove());
    const layer = sheet.layer;
    layer.classList.remove('is-open');
    const done = () => { layer.hidden = true; };
    if (motionReduced() || document.documentElement.getAttribute('data-motion') === 'reduced') done(); else setTimeout(done, 220);
    if (restore && opener && opener.isConnected) try { opener.focus({ preventScroll: true }); } catch (e) { /* gone */ }
    opener = null;
  }
  window.addEventListener('resize', () => { if (sheet && !sheet.layer.hidden) { popoutClose({ restoreFocus: false }); sheet.layer.classList.toggle('is-narrow', narrow()); placeSheet(); } });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !sheet || sheet.layer.hidden) return;
    e.stopPropagation(); e.preventDefault();
    if (pmActive) { popoutClose({ restoreFocus: true }); return; }
    if (sheet.portal.querySelector('.overlay, .drawer-wrap')) { closeOverlay(); return; }
    closeSheet(true);
  }, true);
  /* a page change, a pop-out or a hidden chat leaves no sheet floating over nothing */
  new MutationObserver(() => { if (sheet && !sheet.layer.hidden) placeSheet(); }).observe(document.body, { attributes: true, attributeFilter: ['class', 'data-view'] });

  /* ---------- the chat's handle (pm7-port/js/80-quiet-memory.js) ---------- */
  window.PM7_MEMORY = {
    openSheet, closeSheet, isOpen: () => !!(sheet && !sheet.layer.hidden),
    save: (text, level) => { const n = addNote(text, level); if (n) { lightUp(n.id); redrawAll(); } return n ? { ok: true, id: n.id, level: n.level } : { ok: false }; },
    on: memoryOn, notes: () => clone(notes()), get: id => { const n = noteById(id); return n ? clone(n) : null; },
    levelLabel, levelPhrase
  };

  /* ---------- the rule documents (Standing instructions): a real editor, never a one-line box ---------- */
  const docText = id => { const v = String(PM51.value(id) || ''); return id === S.appRules && v === APP_RULES_SEED ? '' : v; };
  PM51.on('memory-rules', el => {
    const id = ds(el, 'setting'); const s = PM51.setting(id); if (!s) return;
    const project = id === S.projectRules; const row = PM51.rowMeta(id) || {};
    PM51.panel({
      title: PM51.rowLabel(s), eyebrow: 'Standing instructions', icon: 'file', size: 'wide',
      summary: project ? 'Saved with the code in .puppet-master/project-rules.md, so everyone on the project gets the same rules.' : 'Every run reads these, in every project. The first version came from your AGENTS.md.',
      body: `<textarea class="o55-mem-editor" spellcheck="false" aria-label="${a(PM51.rowLabel(s))}" placeholder="${a(project ? 'For example:\n- Run pnpm test before saying something is done.\n- Never edit files under vendor/.' : row.placeholder || '')}" data-autofocus>${h(docText(id))}</textarea>`
        + PM51.note('Write plain sentences or a list. Keep it short: every run reads all of it.', 'info'),
      primaryLabel: 'Save', onPrimary: w => {
        const v = w.querySelector('.o55-mem-editor').value.replace(/\r\n/g, '\n');
        if (!commitSettingValue(id, v)) return false;
        saveState(); o55Notify(id, v); refreshSettingRow(id); PM51.toast('Rules saved', project ? 'Written to .puppet-master/project-rules.md (example only).' : 'Every new run reads them.');
      }
    });
  });

  /* ---------- how the working space is split (drawn in Advanced Settings until Plans retires the row) ---------- */
  const PARTS_SPLIT = [
    ['immune', 'Protected', 'Rules and the Goal. Never squeezed.'],
    ['history', 'Earlier conversation', 'What was said earlier in the chat.'],
    ['current_turn', 'The reply', 'Room for the reply being written.'],
    ['tool_results', 'Tool results', 'What tests, terminals and the browser returned.'],
    ['contingency', 'Spare', 'Kept free for surprises.']
  ];
  const SPLIT_COLORS = ['var(--k3-accent)', 'color-mix(in srgb, var(--k3-accent) 55%, var(--k3-bg-1))', 'var(--k3-green, #30a46c)', 'var(--k3-amber)', 'color-mix(in srgb, var(--k3-text-3) 55%, var(--k3-bg-1))'];
  PM51.watch(S.immune, v => {
    const b = PM51.value(S.buckets); if (!b || typeof b !== 'object') return;
    const n = Number(v); if (!Number.isFinite(n)) return;
    const next = Object.assign({}, b); const diff = n - Number(next.immune || 0); next.immune = n; if ('history' in next) next.history = Math.max(0, Number(next.history || 0) - diff);
    if (commitSettingValue(S.buckets, next)) { saveState(); refreshSettingRow(S.buckets); }
  });
  PM51.on('memory-split', () => {
    const cur = PM51.value(S.buckets); const base = cur && typeof cur === 'object' ? cur : {};
    const vals = PARTS_SPLIT.map(([k]) => Number(base[k]) || 0);
    const bar = () => `<div class="o55-mem-split-bar" aria-hidden="true">${vals.map((v, i) => `<span style="width:${Math.max(0, v)}%;background:${SPLIT_COLORS[i]}"></span>`).join('')}</div>`;
    const total = () => vals.reduce((x, y) => x + y, 0);
    const totalLine = () => { const t = total(); return `<p class="o55-mem-split-total${t === 100 ? '' : ' is-off'}" aria-live="polite">${t === 100 ? 'Adds up to 100%.' : `Adds up to ${t}%. Make it 100%.`}</p>`; };
    const wrap = PM51.panel({
      title: 'How the space is split', eyebrow: 'Memory and chat context', icon: 'layers',
      summary: 'Shares of the working space for each kind of content. Protected is the same number as "Never squeeze this share".',
      body: PM51.panelSection('Shares', `<div class="o55-mem-split-preview">${bar()}</div><div class="o55-mem-split-rows">${PARTS_SPLIT.map(([k, label, help], i) => `<div class="o55-mem-split-row"><i style="background:${SPLIT_COLORS[i]}"></i><div><div class="pm51-row-label">${h(label)}</div><div class="pm51-row-help">${h(help)}</div></div><label class="o55-num"><input class="text-control o55-mem-split-in" type="number" min="0" max="100" step="1" value="${vals[i]}" data-i="${i}" aria-label="${a(label + ' share')}"><span class="o55-unit">%</span></label></div>`).join('')}</div><div class="o55-mem-split-sum">${totalLine()}</div>`),
      primaryLabel: 'Save', onPrimary: () => {
        if (total() !== 100) { PM51.toast('Not 100% yet', `The shares add up to ${total()}%.`, 'info'); return false; }
        const next = Object.assign({}, base); PARTS_SPLIT.forEach(([k], i) => { next[k] = vals[i]; });
        if (!commitSettingValue(S.buckets, next)) return false;
        commitSettingValue(S.immune, vals[0]); saveState(); refreshSettingRow(S.buckets); refreshSettingRow(S.immune);
        PM51.toast('Split saved', `${vals[0]}% is protected from squeezing.`);
      }
    });
    wrap.addEventListener('input', e => {
      const t = e.target; if (!t.classList || !t.classList.contains('o55-mem-split-in')) return;
      vals[Number(t.dataset.i)] = Math.max(0, Math.min(100, Math.round(Number(t.value) || 0)));
      wrap.querySelector('.o55-mem-split-preview').innerHTML = bar(); wrap.querySelector('.o55-mem-split-sum').innerHTML = totalLine();
    });
  });
})();
