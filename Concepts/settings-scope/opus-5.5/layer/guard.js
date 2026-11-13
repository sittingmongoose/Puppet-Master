/* Settings that apply everywhere (Opus 5.5): the one guarded write path, the yes-points, and the run mode.

   Fix pass 2026-11-03. Every write the layer makes (a row, the panel's Change and Same as everywhere, a power action,
   Differences, Copy, a batch and its Finish, the back-online review, Undo, the managers' things, the moments) goes
   through PSX.write, which admits each part before the world changes:
     first start     nothing is kept before a computer is set up (SETTINGS-PROPOSAL 7.14)
     the device      a Member's device changes only its own screen values: level device, its own key (7.10); viewing
                     another device's screen in the header's Change never gives its rights (S.actor is the device in use, S.ctx.device
                     the screen being viewed)
     the level       a row only takes the levels it offers (1.3), and its own type, range and choices
     the writer      the computer that keeps that level must be answering; nothing is queued (7.1, 7.5)
     pairing         a phone or tablet reaches only the computers it is paired with
   An atomic write (one setting, a promotion, Only for tastebook) is refused whole; a batch (Use this everywhere,
   Differences, copy into many projects) applies the parts that are admitted and says which were not.

   Yes-points go through PSX.confirm. In Regular a sheet asks. In YOLO (the run mode `yolo`, "YOLO" on screen; never the
   Full permission profile) an ordinary yes is skipped: the same preview is shown as the report, with Undo, after the
   change. Guards YOLO never skips (o.guard) still ask, and say so. A blocker refuses in both modes.

   Every command id below names its Plans owner, or says it is a proposed command that Plans does not have yet. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.guard) return;
  const { D, DEF, DEVICES, PROJECTS, esc, mark, label, vt, placeName, list, same, clone } = PSX;
  const S = PSX.S;

  /* ------------------------------------------------------------------ owner commands: canon, or a named gap */
  const COMMANDS = {
    'cmd.settings.transaction.preview': 'Settings_System SSYS-007 (canon)',
    'cmd.settings.transaction.apply': 'Settings_System SSYS-007/009 (canon)',
    'cmd.settings.transaction.rollback': 'Settings_System SSYS-009 (canon)',
    'cmd.server.settings_home.move': 'proposed SRV-016 (NEW CANON in SETTINGS-PROPOSAL 7.2)',
    'cmd.server.settings_home.join': 'proposed SRV-016 (gap: not in Plans; SETTINGS-PROPOSAL 7.8)',
    'cmd.provider.install': 'gap: not in Plans (Multi-Account owner; SETTINGS-PROPOSAL 4.2)',
    'cmd.provider_binding.resolve_on_destination': 'SIR-024 (Plans disagree: MACS still calls it deferred)',
    'cmd.mcp.server.sign_in': 'gap: not in Plans (MCP_Integration owner)',
    'cmd.mcp.server.install': 'gap: not in Plans (MCP_Integration owner)',
    'cmd.mcp.server.copy_to_project': 'gap: not in Plans (MCP_Integration owner; SETTINGS-PROPOSAL 4.3)'
  };

  const SETTING_LEVELS = { everywhere: 1, computer: 1, device: 1, project: 1 };
  const isSetting = (x) => !!SETTING_LEVELS[x.level];
  const actor = () => S.actor || 'here';
  const actorDev = () => DEVICES[actor()];
  /* a phone or tablet reaches only the computers it is paired with; a computer's own screen reaches all of them */
  function pairedWith(dev) { const d = DEVICES[dev]; if (!d || dev === 'here' || dev === 'studio') return null; return d.paired || []; }
  function writerOf(x) {
    if (isSetting(x)) return PSX.writer(x.level, x.key);
    if (x.level === 'thing' || x.level === 'uses' || x.level === 'rules') return PSX.home();
    if (x.level === 'act') return x.key;        // an action on one computer: install, sign in, set up
    return null;
  }
  /* the row's own type, range and choices. Jared 2026-11-13 ("when i set a value for a specific project or computer, i
     can set any value i want"): the limits come from the same source as the row's main control (places.js
     PSX.places.check: Plans' inventory range, the base row's min, max and step, a slider's bounds, a list's choices, a
     model row's models and depths), read at the place the write is for, so every path refuses what the row refuses */
  function invalid(x) {
    const def = DEF[x.id]; if (!def || x.value === undefined) return null;
    if (PSX.places) {
      const ctx = x.level ? PSX.places.ctxAt(x.level, x.key) : S.ctx;
      const why = PSX.places.check(x.id, x.value, ctx);
      if (why) return why;
      if (PSX.places.limits(x.id, ctx)) return Array.isArray(PSX.DEFAULTS[x.id]) && !Array.isArray(x.value) ? 'It has to be a list' : null;
    }
    const d = PSX.DEFAULTS[x.id], s = PSX.engineSetting(x.id);
    if (typeof d === 'number') {
      if (typeof x.value !== 'number' || !Number.isFinite(x.value)) return 'It has to be a number';
      const min = s && Number.isFinite(+s.min) ? +s.min : (d >= 0 ? (def.combine === 'computer_ceiling' ? 1 : 0) : -Infinity);
      const max = s && Number.isFinite(+s.max) ? +s.max : Infinity;
      /* inventory alignment: Plans' inventory makes some limit rows computer ceilings whose own default is 0 ("no
         limit"); the row's own default is never refused, whatever floor a ceiling would otherwise get */
      if (x.value < min && x.value !== d) return `It can’t be less than ${min}`;
      if (x.value > max) return `It can’t be more than ${max}`;
      if (Number.isInteger(d) && !Number.isInteger(x.value) && def.combine === 'computer_ceiling') return 'It has to be a whole number';
    }
    // a list stays a list (choices come from the row's own control, so a value the engine holds is never refused here)
    if (Array.isArray(d) && !Array.isArray(x.value)) return 'It has to be a list';
    return null;
  }
  function offeredAt(x) {
    const def = DEF[x.id];
    /* review S1 and the inventory alignment: a row kept inside its owner (PSX.ownerHeld: Plans' inventory home: thing,
       every ordinary level set_inside_a_thing; the reviewed list only for rows it doesn't list) takes no write at
       everywhere, a computer, a device or a project */
    if (!def) return PSX.ownerHeld && PSX.ownerHeld(x.id) ? PSX.REASONS.kept_by_owner[0] : null;
    if (x.value === undefined) return null;
    const off = PSX.offered(def);
    if (x.level === 'everywhere' && !off.everywhere) return PSX.REASONS[def.reason || 'about_this_project'][0];
    if (x.level === 'computer' && !off.computer) return PSX.REASONS[def.screen ? 'about_the_screen' : (def.reason || 'same_for_you')][0];
    if (x.level === 'device' && !off.device) return PSX.REASONS.not_about_the_screen[0];
    if (x.level === 'project' && !off.project) return PSX.REASONS[def.screen ? 'about_the_screen' : (def.reason || 'same_for_you')][0];
    return null;
  }
  /* why one write can't happen now, or null */
  function why(x) {
    if (S.firstStart) return { kind: 'first', text: 'Set up Puppet Master on this computer first. Until then nothing is kept' };
    const dev = actorDev();
    if (dev && dev.limited && !(x.level === 'device' && x.key === actor())) return { kind: 'limited', text: PSX.REASONS.limited_device[0].replace(/\.$/, '') };
    if (isSetting(x)) {
      const n = offeredAt(x); if (n) return { kind: 'level', text: n.replace(/\.$/, '') };
      const v = invalid(x); if (v) return { kind: 'invalid', text: v };
    }
    const wr = writerOf(x);
    if (wr && !PSX.answering(wr)) return { kind: 'offline', wr, text: `${placeName('computer', wr)} isn’t answering` };
    const p = pairedWith(actor());
    if (wr && p && !p.includes(wr)) return { kind: 'paired', wr, text: `${dev.name} isn’t paired with ${placeName('computer', wr)}` };
    return null;
  }
  function admit(writes) {
    const ok = [], missed = [];
    writes.forEach((x) => { const y = why(x); if (y) missed.push(Object.assign({ write: x }, y)); else ok.push(x); });
    return { ok, missed, clear: !missed.length };
  }
  function refuse(missed, title) {
    const m = missed[0];
    PSX.note({ title: title || 'Not saved', body: `${m.text}. Nothing was saved or queued.`, mark: m.kind === 'offline' ? 'offline' : 'info', kind: 'refused' });
  }
  /* the one write path: admission, then the world (one transaction), then the feed */
  function write(writes, meta, o) {
    o = o || {}; meta = Object.assign({ mode: S.runMode }, meta || {});
    const a = admit(writes);
    if (!a.clear && (o.atomic !== false || !a.ok.length)) { if (!o.silent) refuse(a.missed, o.refuseTitle); return null; }
    const tx = PSX.apply(o.atomic === false ? a.ok : writes, meta);
    tx.missed = a.missed;
    if (PSX.feed && o.push !== false) PSX.feed.push();
    return tx;
  }

  /* ------------------------------------------------------------------ what a set of writes does to every project
     Each project in its own work context (its home computer, the screen in front of you), and chats with no project.
     The preview and the receipt are made from this, so they say what the whole transaction does, deletions included. */
  function simulate(writes, id) {
    const w0 = PSX.W, w1 = clone(w0);
    writes.forEach((x) => PSX.putAt(w1, x.level, x.key, x.id, x.value));
    const rows = [];
    PROJECTS.map((p) => p.id).concat(['none']).forEach((pid) => {
      const ctx = { project: pid, device: S.ctx.device, on: null };
      const a = PSX.resolve(id, ctx, w0), b = PSX.resolve(id, ctx, w1);
      if (!a || !b || a.notOffered) return;
      rows.push({ project: pid, before: a.value, after: b.value, from: b.from, was: a.from, changes: !same(a.value, b.value), keeps: same(a.value, b.value) && a.from.level !== 'everywhere' && a.from.level !== 'default' });
    });
    const def = DEF[id] || {};
    const looser = def.careful ? rows.filter((r) => r.changes && lessCareful(def, r.before, r.after)) : [];
    return { rows, changes: rows.filter((r) => r.changes && r.project !== 'none'), keeps: rows.filter((r) => r.keeps && r.project !== 'none'), looser };
  }
  /* b is less careful than a, by the row's careful order (most careful first) */
  function lessCareful(def, a, b) {
    const o = def.careful || []; const ia = o.findIndex((x) => same(x, a)), ib = o.findIndex((x) => same(x, b));
    return ia >= 0 && ib >= 0 && ib > ia;
  }
  /* a change in words, before to after, per project */
  function changeList(id, sim, max) {
    const items = sim.changes.slice(0, max || 8).map((r) => `<li class="psx-li"><span class="psx-li-name">${esc(PSX.projectName(r.project))}</span><span class="psx-li-end">${esc(vt(id, r.before))} → ${esc(vt(id, r.after))}${sim.looser.includes(r) ? ` ${PSX.st('warning', 'less careful')}` : ''}</span></li>`).join('');
    const more = sim.changes.length > (max || 8) ? `<li class="psx-li"><span class="psx-li-sub">and ${sim.changes.length - (max || 8)} more</span></li>` : '';
    return items ? `<ul class="psx-list">${items}${more}</ul>` : '';
  }

  /* ------------------------------------------------------------------ a yes-point, in Regular and in YOLO
     o: { title, kicker, sub, body, okLabel, ok() -> tx|true|null, alt: [{ label, run }], cancelLabel,
          guard: why YOLO still asks (never skipped), report: { title, body } (YOLO's after-the-fact report),
          size, id } */
  function confirm(o) {
    const yolo = S.runMode === 'yolo';
    if (yolo && !o.guard) {
      const tx = o.ok({ yolo: true });
      if (!tx) return null;
      PSX.lastYolo = { skipped: o.title };
      if (o.selfReport) return tx;      // the write's own note is the report (it says YOLO didn't ask)
      const r = o.report || {};
      const undo = tx && tx.id ? [{ label: 'Undo', run: () => PSX.undoTx(tx.id, o.undoId) }] : [];
      PSX.note({ title: r.title || 'Done.', body: `${r.body ? r.body + ' ' : ''}YOLO didn’t ask for a yes; this is the report.`, mark: 'complete', kind: 'saved', ms: 9000, actions: undo, yolo: true });
      PSX.lastYolo = { title: r.title || 'Done.', skipped: o.title };
      return tx;
    }
    const top = yolo && o.guard ? `<div class="psx-fact psx-yolo">${mark('info')}<span><b>YOLO still asks here.</b> ${esc(o.guard)}</span></div>` : '';
    const acts = [{ label: o.cancelLabel || 'Cancel', run: (s) => s.close('cancel') }, { spacer: true }]
      .concat((o.alt || []).map((a) => ({ label: a.label, run: (s) => { s.close('ok'); a.run(); } })))
      .concat(o.okLabel ? [{ label: o.okLabel, primary: true, run: (s) => { s.close('ok'); o.ok({ yolo: false }); } }] : []);
    return PSX.sheet({ id: o.id, title: o.title, kicker: o.kicker, sub: o.sub, size: o.size, body: top + (o.body || ''), actions: acts, onOpen: o.onOpen });
  }

  /* may an action on one computer (install, sign in, set up) happen now? null, or why not */
  const act = (comp) => { const y = why({ level: 'act', key: comp, id: '' }); return y ? y.text : null; };
  PSX.guard = { act, admit, why, write, simulate, confirm, lessCareful, changeList, writerOf, invalid, COMMANDS, pairedWith };
  Object.assign(PSX, { write, confirm, simulate, COMMANDS });
})(window);
