/* Projects concepts (Opus 5.5): shared parts, window.PJX.parts.

   The pieces every concept draws the same way, so the three differ in layout only:
     st(key, word)                       the status slot: one PMG mark and one word, toned (never a pill)
     tone(key)                           a status key's ink family (blocked, attention, working, done, paused, idle)
     safeLine(p, { compact })            History · Online copy · Backup, each a mark, a label and a word
     notice(p, att, { compact })         an attention block with its labelled actions (core ACTIONS)
     attentionButtons(p, att)            just the labelled buttons for an attention item
     repair(id, { move })                Find the folder: the missing-folder repair (dialog), or Move or change folder
     repairBody(p, ctx)                  the same, as a node, for a concept that shows it in place
     resume(id)                          Setup didn't finish: Continue setup without making anything twice
     confirmRemove(id), confirmDelete(id), rename(id)
     undoStrip()                         "Removed x from your list · Undo", for the most recent removal
   PJX.parts.handle(concept) wires the core's need-* events to these unless the concept handles them itself. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.parts) return;
  const { h, esc, icon, mark, tip, ACT, ACTIONS, ENV } = PJX;
  const F = () => PJX.flow;

  /* ------------------------------------------------------------------ status */
  const TONES = { waiting: 'attention', blocked: 'blocked', failed: 'blocked', offline: 'attention', warning: 'attention', recovering: 'working', working: 'working', reviewing: 'working', pending: 'idle', paused: 'paused', info: 'paused', complete: 'done', idle: 'idle', off: 'paused', skipped: 'paused' };
  function tone(key) {
    try { const s = W.PM56_NEON && W.PM56_NEON.STATUS && W.PM56_NEON.STATUS[key]; if (s && s.tone) return s.tone; } catch (e) { /* the registry may be absent */ }
    return TONES[key] || 'idle';
  }
  function st(key, word, opts) {
    opts = opts || {};
    const el = h('span', { class: ['pjx-st', opts.cls], 'data-tone': tone(key), 'data-key': key },
      // marks are lit and still in lists (F3-658); opts.moving lets one move
      h('span.pjx-st-mark', { html: opts.moving ? mark(key, 14) : PJX.calm(key, 14), 'aria-hidden': 'true' }),
      opts.noWord ? null : h('span.pjx-st-word', { text: word || PJX.statusWord(key) }));
    if (opts.noWord) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', word || PJX.statusWord(key)); tip(el, word || PJX.statusWord(key), opts.detail); }
    return el;
  }

  /* ------------------------------------------------------------------ the Safe line */
  function safeLine(p, opts) {
    opts = opts || {};
    const s = PJX.safety(p);
    const cell = (x, k) => {
      const c = h('div.pjx-safe-cell', { 'data-tone': tone(x.key), 'data-part': k },
        h('span.pjx-st-mark', { html: PJX.calm(x.key, 14), 'aria-hidden': 'true' }),
        h('span.pjx-safe-label', { text: x.label }),
        h('span.pjx-safe-word', { text: opts.compact ? x.short : (x.word === 'None' || x.word === 'Off' ? x.text : x.short) }));
      tip(c, x.label + ': ' + x.text);
      return c;
    };
    return h('div.pjx-safe', { role: 'group', 'aria-label': 'Kept safe' }, cell(s.history, 'history'), cell(s.online, 'online'), cell(s.backup, 'backup'));
  }

  /* ------------------------------------------------------------------ attention */
  function attentionButtons(p, att, opts) {
    opts = opts || {};
    return (att.actions || []).map((a, i) => {
      const def = ACTIONS[a]; if (!def) return null;
      const label = a === 'open_online' && p.online.service ? 'Open on ' + p.online.service : def.label;
      const b = h('button', { type: 'button', class: [opts.cls || 'pjx-btn', i === 0 && 'is-primary'], 'data-pm-hover-visual-suppressed': 'true', html: (opts.icons === false ? '' : icon(def.icon, 15)) + '<span>' + esc(label) + '</span>' });
      b.addEventListener('click', (e) => { e.stopPropagation(); def.run(p.id); });
      return b;
    }).filter(Boolean);
  }
  function notice(p, att, opts) {
    opts = opts || {};
    // role=alert only when asked (opts.live): a notice redrawn on every world change must not be announced again each time
    const el = h('div.pjx-notice', { 'data-tone': tone(att.key), role: opts.live && (att.key === 'blocked' || att.key === 'waiting') ? 'alert' : null },
      h('span.pjx-notice-mark', { html: PJX.calm(att.key, 16), 'aria-hidden': 'true' }),
      h('div.pjx-notice-title', { text: att.title }),
      opts.compact ? null : h('div.pjx-notice-text', { text: att.text }),
      h('div.pjx-notice-acts', null, ...attentionButtons(p, att, opts)));
    return el;
  }

  /* ------------------------------------------------------------------ Find the folder (cmd.project.source_location.test -> .update) */
  function repairBody(p, ctx) {
    ctx = ctx || {};
    const box = h('div.pjx-repair');
    const st0 = ctx.state || (ctx.state = { way: ctx.move ? 'find' : null, path: null, probe: null, checking: false, treeAt: '~/Code', browsing: false, place: ENV.projectsRoot + '/' + p.name, again: null });
    /* a redraw keeps the focused control: the chosen choice (by value), a text field (by key) or a button (by its words) */
    const draw = () => {
      const a = W.document.activeElement, inBox = a && box.contains(a);
      const by = inBox ? (a.getAttribute('data-v') ? '[data-v="' + CSS.escape(a.getAttribute('data-v')) + '"]' : a.getAttribute('data-pjx-key') ? '[data-pjx-key="' + a.getAttribute('data-pjx-key') + '"]' : null) : null;
      const words = inBox && !by ? a.textContent.trim() : null;
      box.innerHTML = ''; fill(); if (ctx.onChange) ctx.onChange(st0);
      if (!inBox) return;
      let el = by ? box.querySelector(by) : null;
      if (!el && words) el = Array.from(box.querySelectorAll('button')).find((b) => b.textContent.trim() === words) || null;
      (el || box.querySelector('.pjx-choice.is-on') || box.querySelector('button, input')).focus({ preventScroll: true });
    };
    function fill() {
      if (!ctx.move && !ctx.noNotice) box.appendChild(h('div.pjx-notice', { 'data-tone': 'blocked' },
        h('span.pjx-notice-mark', { html: PJX.calm('blocked', 16), 'aria-hidden': 'true' }),
        h('div.pjx-notice-title', { text: 'Nothing is at ' + p.where.path }),
        h('div.pjx-notice-text', { text: 'It may have been moved or renamed, or it is on a drive that isn’t connected. Its history, online copy and backups are safe.' })));
      const ways = ctx.move
        ? [
          { id: 'find', glyph: 'folder-search', title: 'It already moved: point to it', sub: 'Puppet Master checks it is the same project, then uses the new place' },
          { id: 'moveit', glyph: 'move', title: 'Move it for me…', sub: 'Puppet Master copies it, checks the copy, then switches over' }
        ]
        : [
          { id: 'find', glyph: 'folder-search', title: 'Find the folder', sub: 'Point to where it is now. Puppet Master checks it is the same project.', tag: 'Most likely' },
          p.online.service ? { id: 'clone', glyph: 'download', title: 'Get a fresh copy from ' + p.online.service, sub: 'Copies ' + p.online.repo + ' into a new folder. Changes that were never sent are not in it.' } : null,
          p.backup.dest && p.backup.last ? { id: 'restore', glyph: 'history', title: 'Restore from the last backup', sub: p.backup.dest + ' · ' + p.backup.last + ', checked. Brings back its files, history, plans and chats as they were then.' } : null,
          { id: 'drive', glyph: 'plug', title: 'It’s on a drive that isn’t connected', sub: 'Connect it, then check again' }
        ].filter(Boolean);
      box.appendChild(F().group(ctx.move ? 'How' : 'What happened?', F().choices(ways, st0.way, (v) => { st0.way = v; st0.probe = null; draw(); }, { label: 'How to fix it', cls: 'pjx-choices-list' })));
      if (st0.way === 'find') {
        const sugg = Object.keys(ENV.probes).map((path) => ({ id: path, glyph: 'folder', title: path.split('/').pop(), sub: path }));
        box.appendChild(F().group('Likely places', F().choices(sugg, st0.path, (v) => check(v), { label: 'Likely places', cls: 'pjx-choices-list' })));
        const br = h('button.pjx-btn.is-quiet', { type: 'button', html: icon('folder-search', 15) + '<span>Browse…</span>' });
        br.addEventListener('click', () => { st0.browsing = !st0.browsing; draw(); });
        box.appendChild(h('div.pjx-row', null, br));
        if (st0.browsing) {
          const sess = { ui: { treeAt: st0.treeAt }, changed() { st0.treeAt = sess.ui.treeAt; draw(); } };
          box.appendChild(F().picker(sess, (path) => { st0.browsing = false; check(path); }));
        }
        if (st0.checking) box.appendChild(h('div.pjx-checking', { role: 'status', html: mark('working', 14) + '<span>Looking inside ' + esc(st0.path) + '…</span>' }));
        else if (st0.probe) {
          const pr = st0.probe;
          box.appendChild(F().group('What’s there', F().facts(pr.same
            ? [{ key: 'complete', text: 'The same project: ' + pr.note + '.' }, pr.changed ? { key: 'info', text: pr.changed + ' change' + (pr.changed > 1 ? 's' : '') + ' not saved in its history yet. They stay as they are.' } : null, { key: 'info', text: 'Only the place changes. Nothing is copied or deleted.' }]
            : [{ key: 'blocked', text: pr.note ? pr.note + '.' : 'No project history here.' }, { key: 'info', text: 'Choose another folder, or get a fresh copy instead.' }])));
        }
      }
      if (st0.way === 'clone') box.appendChild(F().group('Put the copy in', F().field('Folder', F().keyed(F().textInput(st0.place, '', (v) => { st0.place = v; }), 'repair-place'), 'A new folder. The missing one is not recreated.')));
      if (st0.way === 'restore') box.appendChild(F().group('What comes back', F().facts([{ key: 'complete', text: 'Its files with their full history, as of ' + p.backup.last }, { key: 'complete', text: 'Its plans, chats, notes and settings' }, { key: 'info', text: 'Into ' + st0.place + '. Passwords and keys never come back from a backup.' }])));
      if (st0.way === 'drive') {
        if (st0.again === 'checking') box.appendChild(h('div.pjx-checking', { role: 'status', html: mark('working', 14) + '<span>Checking ' + esc(p.where.path) + '…</span>' }));
        else if (st0.again === 'missing') box.appendChild(F().facts([{ key: 'blocked', text: 'Still nothing at ' + p.where.path + '. If the drive is connected, the folder may have moved: try Find the folder.' }]));
      }
      if (st0.way === 'moveit') box.appendChild(F().group('Move to', F().field('New folder', F().keyed(F().textInput(st0.place, '', (v) => { st0.place = v; }), 'move-place'), 'Puppet Master copies it there, checks the copy, then switches over. The old folder is removed only after that, and only if you say so.')));
    }
    async function check(path) {
      st0.path = path; st0.checking = true; st0.probe = null; draw();
      st0.probe = await ACT.testFolder(p.id, path); st0.checking = false; draw();
    }
    fill();
    box.pjxPrimary = () => {
      if (st0.way === 'find') return { label: 'Use this folder', disabled: !(st0.probe && st0.probe.same) ? 'Choose a folder that holds this project' : null, run: () => ACT.relocate(p.id, st0.path) };
      if (st0.way === 'clone') return { label: 'Copy it', run: () => ACT.cloneAgain(p.id, st0.place) };
      if (st0.way === 'restore') return { label: 'Restore', run: () => ACT.restoreSame(p.id, st0.place) };
      if (st0.way === 'drive') return { label: 'Check again', keep: true, run: async () => { st0.again = 'checking'; draw(); await PJX.wait(PJX.reduced() ? 200 : 900); st0.again = 'missing'; draw(); } };
      if (st0.way === 'moveit') return { label: 'Move it', run: () => PJX.run(p.id, 'move', 'Moving', [{ label: 'Checking there is room', ms: 500 }, { label: 'Copying to ' + st0.place, ms: 1400 }, { label: 'Checking the copy', ms: 700 }, { label: 'Switching over', ms: 400 }], () => { p.where = Object.assign({}, p.where, { path: st0.place }); }, { cmd: 'cmd.project.move.start' }).then(() => PJX.toast(p.name + ' moved', 'Now at ' + st0.place + '. The old folder is still there until you remove it.', 'success')) };
      return { label: 'Choose one', disabled: 'Choose how to fix it' };
    };
    return box;
  }
  function repair(id, opts) {
    opts = opts || {};
    const p = PJX.get(id); if (!p) return null;
    const ctx = { move: !!opts.move };
    let dlg = null;
    const body = repairBody(p, Object.assign(ctx, { onChange: () => paint() }));
    function paint() {
      if (!dlg) return;
      const pr = body.pjxPrimary();
      dlg.setActions([
        { label: 'Remove from list…', quiet: true, run: () => { dlg.close('remove'); confirmRemove(id); } },
        { spacer: true },
        { label: 'Cancel', run: () => dlg.close('cancel') },
        { label: pr.label, primary: true, disabled: pr.disabled, run: () => { pr.run(); if (!pr.keep) dlg.close('done'); } }
      ]);
    }
    dlg = PJX.dialog({ title: (ctx.move ? 'Move or change the folder of ' : 'Find ') + p.name + (ctx.move ? '' : '’s folder'), kicker: ctx.move ? p.where.path : 'Folder missing', body, wide: true });
    paint();
    return dlg;
  }

  /* ------------------------------------------------------------------ Setup didn't finish (cmd.project.resume_creation) */
  function resume(id) {
    const p = PJX.get(id); if (!p || !p.recovery) return null;
    const rec = { settled: p.recovery.settled.slice(), remaining: p.recovery.remaining.slice(), text: (p.attention[0] || {}).text || '' };
    const states = rec.remaining.map(() => 'pending');
    const body = h('div');
    const draw = () => {
      body.innerHTML = '';
      const done = states.every((x) => x === 'complete');
      body.appendChild(done
        ? h('div.pjx-notice', { 'data-tone': 'done' }, h('span.pjx-notice-mark', { html: PJX.calm('complete', 16), 'aria-hidden': 'true' }), h('div.pjx-notice-title', { text: p.name + ' is ready' }), h('div.pjx-notice-text', { text: 'Setup finished. Nothing was made twice.' }))
        : h('div.pjx-notice', { 'data-tone': 'attention' }, h('span.pjx-notice-mark', { html: PJX.calm('waiting', 16), 'aria-hidden': 'true' }), h('div.pjx-notice-title', { text: 'Setup stopped part-way' }), h('div.pjx-notice-text', { text: rec.text })));
      body.appendChild(F().group('Already done', F().facts(rec.settled.map((x) => ({ key: 'complete', text: x.label + (x.ref ? ' · ' + x.ref : '') })))));
      body.appendChild(F().group(states.every((x) => x === 'complete') ? 'Done now' : 'Still to do', F().phaseList(rec.remaining, states)));
      body.appendChild(h('div.pjx-hint', { text: 'Continue setup does only what is left. The repository on ' + (p.online.service || 'the service') + ' is never made a second time.' }));
    };
    draw();
    let running = false;
    const dlg = PJX.dialog({
      title: 'Finish setting up ' + p.name, kicker: 'Setup didn’t finish', body, wide: true,
      actions: [
        { label: 'Open on ' + (p.online.service || 'the service'), quiet: true, icon: 'globe', run: () => ACT.openOnline(id) },
        { label: 'Remove from list…', quiet: true, run: () => { dlg.close('remove'); confirmRemove(id); } },
        { spacer: true },
        { label: 'Later', run: () => dlg.close('later') },
        { label: 'Continue setup', primary: true, icon: 'play', run: async () => {
          if (running) return; running = true;
          const off = PJX.on('op', (op) => { if (op.id !== id || op.kind !== 'resume') return; states.forEach((_, i) => { states[i] = i < op.i ? 'complete' : i === op.i && !op.done ? 'working' : op.done ? 'complete' : 'pending'; }); draw(); });
          await ACT.resume(id); off(); states.fill('complete'); draw();
          dlg.setActions([{ spacer: true }, { label: 'Close', run: () => dlg.close('done') }, { label: 'Open ' + p.name, primary: true, run: () => { dlg.close('open'); ACT.open(id); } }]);
        } }
      ]
    });
    return dlg;
  }

  /* ------------------------------------------------------------------ confirmations */
  function confirmRemove(id) {
    const p = PJX.get(id); if (!p) return null;
    const body = h('div', null,
      h('p.pjx-q-lead', { text: 'Nothing is deleted. Its folder, history, online copy and backups stay where they are.' }),
      F().facts([{ key: 'info', text: 'Add it back any time: New Project › A folder on this computer.' }, p.where.missing ? { key: 'info', text: 'Its backups on ' + (p.backup.dest || 'your backup place') + ' are kept by their own schedule.' } : null]));
    const dlg = PJX.dialog({ title: 'Remove ' + p.name + ' from your list?', body, actions: [{ spacer: true }, { label: 'Cancel', run: () => dlg.close('cancel') }, { label: 'Remove from list', primary: true, run: () => { dlg.close('ok'); ACT.remove(id); } }] });
    return dlg;
  }
  /* cmd.project.delete_data: Storage's strong confirmation, never worded like Remove, never next to it */
  function confirmDelete(id) {
    const p = PJX.get(id); if (!p) return null;
    let typed = '';
    const body = h('div');
    const inp = F().textInput('', p.name, (v) => { typed = v; paint(); });
    body.appendChild(h('p.pjx-q-lead', { text: 'This can’t be undone. It deletes what Puppet Master keeps for this Project.' }));
    body.appendChild(F().group('Deleted', F().facts([{ key: 'failed', text: 'Its plans, chats, notes, Goals, settings and run history' }, { key: 'failed', text: 'Puppet Master’s copy of its evidence and artifacts' }])));
    body.appendChild(F().group('Not touched', F().facts([{ key: 'complete', text: 'Its folder ' + p.where.path }, p.online.service ? { key: 'complete', text: 'Its online copy on ' + p.online.service } : null, p.backup.dest ? { key: 'complete', text: 'Its backups on ' + p.backup.dest + ' (they expire by their own schedule)' } : null])));
    body.appendChild(F().facts([{ key: 'info', text: 'If something must keep it for a while (a retention hold), deletion waits and says why.' }]));
    body.appendChild(F().field('Type ' + p.name + ' to confirm', inp));
    let dlg = null;
    function paint() { dlg && dlg.setActions([{ spacer: true }, { label: 'Cancel', run: () => dlg.close('cancel') }, { label: 'Delete Puppet Master’s data', danger: true, icon: 'trash', disabled: typed.trim() !== p.name ? 'Type the name first' : null, run: () => { dlg.close('ok'); ACT.deleteData(id); } }]); }
    dlg = PJX.dialog({ title: 'Delete Puppet Master’s data for ' + p.name + '?', kicker: 'Delete data', body });
    paint();
    return dlg;
  }
  function rename(id) {
    const p = PJX.get(id); if (!p) return null;
    let name = p.name;
    const body = h('div');
    let dlg = null;
    const problem = () => { const v = name.trim(); if (!v) return 'Give it a name'; if (v.length > 60) return 'Use 60 characters or fewer'; const t = PJX.all().find((x) => x !== p && x.name.toLowerCase() === v.toLowerCase()); return t ? t.name + ' is already a Project' : ''; };
    const draw = () => {
      body.innerHTML = '';
      body.appendChild(F().field('Name', F().keyed(F().textInput(name, p.name, (v) => { name = v; draw(); paint(); }, { autofocus: true }), 'rename'), 'Only the name you see changes. Its folder, history and online copy keep theirs.', name !== p.name ? problem() : ''));
      const el = body.querySelector('[data-pjx-key="rename"]'); if (el && W.document.activeElement !== el) { el.focus(); el.setSelectionRange(name.length, name.length); }
    };
    function paint() { dlg && dlg.setActions([{ spacer: true }, { label: 'Cancel', run: () => dlg.close('cancel') }, { label: 'Rename', primary: true, disabled: name === p.name || problem() ? 'Type a new name' : null, run: () => { dlg.close('ok'); ACT.rename(id, name.trim()); } }]); }
    dlg = PJX.dialog({ title: 'Rename ' + p.name, body });
    draw(); paint();
    return dlg;
  }

  /* ------------------------------------------------------------------ the undo strip for the latest removal */
  let lastRemoval = null;
  PJX.on('change', (e) => { if (e && e.why === 'remove') lastRemoval = { id: e.id, at: Date.now() }; if (e && e.why === 'undo') lastRemoval = null; });
  function undoStrip() {
    const rem = PJX.S.world.removed;
    if (!lastRemoval || Date.now() - lastRemoval.at > 15000) return null;
    const p = rem.find((x) => x.id === lastRemoval.id); if (!p) return null;
    const b = h('button.pjx-link', { type: 'button', text: 'Undo' });
    b.addEventListener('click', () => ACT.undoRemove(p.id));
    return h('div.pjx-undo', { role: 'status' }, h('span.pjx-st-mark', { html: mark('info', 14), 'aria-hidden': 'true' }), h('span', { text: 'Removed ' + p.name + ' from your list. Nothing was deleted.' }), b);
  }

  /* ------------------------------------------------------------------ default wiring */
  function handle(c) {
    c = c || {};
    const offs = [
      PJX.on('need-repair', (e) => { if (PJX.S.mounted && !(c.onRepair && c.onRepair(e))) repair(e.id, { move: e.move }); }),
      PJX.on('need-resume', (e) => { if (PJX.S.mounted && !(c.onResume && c.onResume(e))) resume(e.id); }),
      PJX.on('need-remove', (e) => { if (PJX.S.mounted) confirmRemove(e.id); }),
      PJX.on('need-delete', (e) => { if (PJX.S.mounted) confirmDelete(e.id); }),
      PJX.on('need-rename', (e) => { if (PJX.S.mounted) rename(e.id); }),
      PJX.on('need-new', (e) => { if (PJX.S.mounted && c.openNew) c.openNew(e || {}); }),
      PJX.on('need-details', (e) => { if (PJX.S.mounted && c.openProject) c.openProject(e.id); })
    ];
    return () => offs.forEach((f) => f());
  }

  PJX.parts = { tone, st, safeLine, notice, attentionButtons, repair, repairBody, resume, confirmRemove, confirmDelete, rename, undoStrip, handle };
})(window);
