/* Settings that apply everywhere (Opus 5.5): feeding PMConcept7, and routing changes back (BUILD-SPEC section 6).

   PMConcept7 shows one project's values at a time. The layer keeps the real model (the world) and, for the current
   context, writes each demo setting's resolved value into what the engine reads, so every engine row, control and
   manager shows the right value with its own markup:
     window.PM_SETTINGS_PROJECT_SNAPSHOTS[project]   read by the Tome's load() before localStorage (supplied fixture)
     window.PM_ACTIVE_PROJECT_ID + PM12_KIMI.reloadProject()   switch project (any id, not only the title-bar three)
     PM12_KIMI.setSettingFromHost(id, value, false, false)   push one value without a reload
   PM7_SETTINGS_TOME.dispatch is never used to write a value (it is a command preview, BUILD-SPEC 3).

   When the person changes something, the router diffs the engine's state (PM51.watch does not fire for ordinary rows),
   decides the level by SETTINGS-PROPOSAL 3.2 (change it where it comes from), writes the world, adds History, and shows
   the layer's note; the engine's own "Saved" toast for that change is held back, so there is only ever one note. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.feed) return;
  const { D, H, IDS, DEF, DEFAULTS, PROJECTS, COMPUTERS, DEVICES, same, clone, esc, label, vt, placeName, projectName, list } = PSX;
  const S = PSX.S;
  const kimi = () => (W.PM12_KIMI && typeof W.PM12_KIMI.getState === 'function' ? W.PM12_KIMI : null);
  /* the engine ids the feed owns: every demo row, the theme pair's second half; the demo Projects folder row is the
     layer's own and never reaches the engine */
  const ENGINE_IDS = IDS.filter((id) => !DEF[id].demoRow).concat('general.visual.theme-mode');

  /* ------------------------------------------------------------------ every other Settings row follows the ladder too
     The demo world names 17 rows; every other row of the inventory is adopted with a rule from SETTINGS-PROPOSAL 1.3,
     decided here by a heuristic over its id, control and canon scope (a CONCEPT HEURISTIC: the reviewed classification
     of all 1010 rows is a Plans task). Its everywhere value is what the open project had when the concept started, so
     nothing you see changes. Rows that belong to one thing (scope only account, provider, persona or run) stay the
     engine's per-thing rows; credentials, the wallpaper and the glass transparency are never fed. */
  const SKIP = /^(general\.visual\.(wallpaper|glass-background-mode|glass-transparency|chat-layout-mode|basic-color-scheme|theme-mode))$/;
  /* credentials never join the ladder: keys, tokens, passwords, secrets, sign-in headers. A token budget, a token
     colour or "cache with OAuth" is not a credential (fix pass: the old pattern dropped ten such rows) */
  const CRED = /(api-key|apikey|access-token|auth-token|refresh-token|bearer|credentials?$|credential-|password|passphrase|secret|remote-headers|private-key|(^|[.-])token$|(^|[.-])auth$)/;
  /* the rows the reviews named, classified by hand (fix pass 2026-11-03); the heuristic after it is for the rest. The
     reviewed classification of all 1010 rows is still a Plans task: PSX.classReport() prints what this concept did */
  const REVIEWED = {
    device: ['general.interaction.minimize-to-tray', 'general.interaction.notification-method', 'general.interaction.tray-notifications', 'general.interaction.show-tooltips', 'general.interaction.auto-follow', 'general.interaction.unread-marker',
      'extensions.commands.keyboard-layout', 'extensions.commands.text-editing-keys', 'extensions.commands.variant-cycling-key', 'code.terminal.shortcuts', 'code.terminal.font-size', 'code.terminal.font-rendering',
      'code.editing.font-size', 'code.editing.line-height', 'code.terminal.copy-on-select', 'code.terminal.right-click-paste', 'code.terminal.bell'],
    project: ['code.execution.build-context', 'safety.protection.custom-patterns-path'],
    thing: ['system.mcp.remote-url', 'system.mcp.transport', 'system.mcp.server-scope', 'system.mcp.server-enabled', 'system.mcp.tool-toggle', 'extensions.commands.command-scope', 'extensions.commands.command-mode',
      'extensions.commands.command-model', 'extensions.commands.command-persona', 'extensions.commands.command-permissions', 'ai.accounts.gcp-project-id', 'safety.rules.rule-editor', 'safety.rules.per-tool-permissions',
      'safety.protection.web-tool-permissions'],
    computerOnly: ['system.advanced.auto-update', 'system.advanced.update-frequency', 'system.advanced.release-channel', 'system.advanced.catalog-updates'],
    /* Jared #8: libraries were on the device rule, which offered "Set for a device" on rows that are not about a screen.
       A library (your own themes, your sounds) is the same everywhere, kept with your settings */
    library: ['general.visual.manage-custom-themes', 'general.visual.custom-theme-base', 'general.interaction.sound-catalog', 'general.interaction.sound-management'],
    ceiling: ['branching.subagents.provider-concurrency-cap', 'memory.assembly.memory-capsule-budget']
  };
  /* a safety answer's careful order, most careful first, from its choices; a row whose order can't be told keeps the
     computer's own when both are set (the conservative fallback of 1.4) */
  function carefulOrder(s, id) {
    if (id === 'safety.approvals.auto-continue') return [false, true];
    const o = Array.isArray(s.options) ? s.options.map((x) => (x && typeof x === 'object' ? (x.value != null ? x.value : x.id) : x)) : [];
    if (!o.length) return [];
    const rank = (v) => (/deny|block|never|off|none|read/i.test(String(v)) ? 0 : /ask|prompt|confirm|plan|review/i.test(String(v)) ? 1 : /allow|always|auto|full|yes/i.test(String(v)) ? 2 : -1);
    if (o.some((v) => rank(v) < 0)) return [];
    return o.slice().sort((a, b) => rank(a) - rank(b));
  }
  function classify(ref, s) {
    const id = ref.id, sc = ref.scope || [];
    if (REVIEWED.thing.includes(id)) return null;
    /* Jared #8: a row the reference marks only "for a single run" still holds the value each run starts with, so it
       follows the ladder like every other row; its panel says a run can choose its own (it was off the ladder and showed
       the base page's own Where it applies) */
    if (sc.length && sc.every((x) => x === 'run')) { const r = classify(Object.assign({}, ref, { scope: [] }), s); return r ? Object.assign(r, { run: true }) : r; }
    if (sc.length && sc.every((x) => ['account', 'provider', 'persona', 'run'].includes(x))) return null;
    if ((sc.includes('account') || sc.includes('persona')) && !sc.includes('global')) return null;   // a field of one thing
    if (REVIEWED.library.includes(id)) return { home: 'everywhere', reason: 'your_library', reviewed: true };
    if (REVIEWED.device.includes(id)) return { may: ['device'], screen: true, reviewed: true };
    if (REVIEWED.project.includes(id)) return { home: 'project', reason: 'about_this_project', reviewed: true };
    if (REVIEWED.computerOnly.includes(id)) return { may: ['computer'], reviewed: true };
    if (REVIEWED.ceiling.includes(id)) return { may: ['computer', 'project'], combine: 'computer_ceiling', reviewed: true };
    if (/^(general\.interaction\.scope-labels|ai\.usage\.usage-retention)$/.test(id)) return { home: 'everywhere', reason: 'same_for_you' };
    if (/(project-rules|compose-file|dockerfile|^web\.index\.|worktree-base-dir|artifacts-location|project-instructions|repo-url|remote-url)/.test(id)) return { home: 'project', reason: 'about_this_project' };
    if (/(proxy|\.port$|-port$|bind-address|listen-)/.test(id)) return { home: 'computer', host: true, reason: 'about_the_network' };
    if (/(gpu|vram|cpu-cores|memory-limit-mb|hardware)/.test(id)) return { home: 'computer', host: true, reason: 'about_hardware' };
    if (s.control === 'path' || /(cli-path|binary-path|-binary$|executable|terminal\.shell$|launch-config|docker-host|socket-path)/.test(id)) return { home: 'computer', host: true, reason: /(dir|folder|location)$/.test(id) && !/cli|binary/.test(id) ? 'names_a_folder' : 'names_a_program' };
    if (/^general\.visual\./.test(id) || /^general\.interaction\.(sound|submit-key|haptic)/.test(id) || /^general\.startup\.window/.test(id) || /(keyboard-shortcuts|font-family|ui-scale|zoom-level)/.test(id)) return { may: ['device'], screen: true };
    // a safety row: the more careful of a computer's and a project's own (1.4)
    if (/^safety\./.test(id) && !Array.isArray(s.value) && (typeof s.value !== 'object' || s.value === null)) return { may: ['computer', 'project'], combine: 'more_careful', careful: carefulOrder(s, id), safety: true };
    return { may: ['computer', 'project'] };
  }
  PSX.classReport = () => {
    const out = { adopted: 0, reviewed: 0, byRule: {}, safety: [], ceiling: [], device: [], project: [], computer: [] };
    Object.keys(DEF).forEach((id) => {
      const d = DEF[id]; if (!d.adopted) return;
      out.adopted++; if (d.reviewed) out.reviewed++;
      const k = d.home ? 'home:' + d.home : (d.may || []).join('+') + (d.combine ? ' ' + d.combine : '');
      out.byRule[k] = (out.byRule[k] || 0) + 1;
      if (d.safety) out.safety.push(id); if (d.combine === 'computer_ceiling') out.ceiling.push(id);
      if (d.screen) out.device.push(id); if (d.home === 'project') out.project.push(id); if (d.home === 'computer') out.computer.push(id);
    });
    return out;
  };
  const SEED = {};
  PSX.reseedAdopted = () => { Object.keys(SEED).forEach((id) => { const x = SEED[id]; PSX.putAt(PSX.W, x.level, x.key, id, x.value); }); };
  function adopt(id, everywhereValue) {
    if (DEF[id]) return true;
    if (SKIP.test(id) || CRED.test(id)) return false;
    const s = W.PM51 && W.PM51.setting ? W.PM51.setting(id) : null; if (!s) return false;
    const ref = (PSX.REF || {})[id] || { id, scope: [] };
    if (ref.credential_ref_only || s.credentialRefOnly) return false;
    const rule = classify(ref, s); if (!rule) return false;
    DEF[id] = Object.assign({ adopted: true }, rule);
    DEFAULTS[id] = clone(s.value);
    if (everywhereValue !== undefined && !same(everywhereValue, s.value)) {
      const seed = rule.home === 'computer' ? { level: 'computer', key: 'here' } : rule.home === 'project' ? { level: 'project', key: 'tastebook' } : { level: 'everywhere', key: null };
      SEED[id] = Object.assign(seed, { value: clone(everywhereValue) });
      PSX.putAt(PSX.W, seed.level, seed.key, id, everywhereValue);
    }
    IDS.push(id); ENGINE_IDS.push(id);
    return true;
  }
  function adoptAll() {
    const K = kimi(); if (!K) return 0;
    PSX.REF = {};
    Object.values((W.PM12_REFERENCE && W.PM12_REFERENCE.byCat) || {}).forEach((c) => (c.settings || []).forEach((r) => { PSX.REF[r.id] = r; }));
    const st = K.getState().settings || {};
    let n = 0;
    Object.keys(PSX.REF).forEach((id) => { if (!DEF[id] && adopt(id, st[id])) n++; });
    // rows Settings draws that the reference doesn't list (Animation speed, Accent color, Autosave and the rest): the same
    // rule, decided from the id and the control (Jared #8: none of them may keep a different Where it applies)
    const placed = (W.PM51 && W.PM51.placement && W.PM51.placement.byId) || {};
    Object.keys(placed).forEach((id) => { if (DEF[id] || PSX.REF[id]) return; const s0 = W.PM51.setting ? W.PM51.setting(id) : null; if (!s0 || /^(resource|action)$/.test(String(s0.control || ''))) return; if (adopt(id, st[id])) n++; });
    PSX.adopted = n;
    return n;
  }
  PSX.adopt = (id) => { if (DEF[id]) return true; const K = kimi(); const st = K ? K.getState().settings || {} : {}; return adopt(id, st[id]); };
  const NONE = 'psx-none';      // Concept mechanic: the engine needs a project to accept writes; the product never uses one

  /* ------------------------------------------------------------------ the values one context feeds */
  function engineValues(ctx) {
    const out = {}, changed = {};
    /* looking at another device's screen (Jared #11): your own screen keeps painting with your own screen values, so
       nothing on it moves; the rows show that device's values themselves (rows.js, psx-devval) */
    const actorCtx = ctx && ctx.device && ctx.device !== S.actor ? Object.assign({}, ctx, { device: S.actor }) : null;
    IDS.forEach((id) => {
      if (DEF[id].demoRow) return;
      const r = PSX.resolve(id, actorCtx && DEF[id].screen ? actorCtx : ctx);
      let v = r.notOffered ? DEFAULTS[id] : (r.asked !== undefined ? r.asked : r.value);
      if (id === 'general.visual.theme') { const pair = PSX.themePair(v); Object.assign(out, pair); changed['general.visual.theme'] = r.changed; changed['general.visual.theme-mode'] = r.changed; return; }
      out[id] = clone(v); changed[id] = !!r.changed && !r.notOffered;
    });
    return { settings: out, changed };
  }

  /* each project's own engine state that the layer doesn't model (every other setting, which page is open, the
     managers' state), so switching projects keeps what the person did there; read once from the engine's own store */
  const REST = {};
  let uiBase = null;
  function captureCurrent() {
    const K = kimi(); if (!K) return;
    const st = K.getState();
    const p = engineProject();
    const settings = Object.assign({}, st.settings || {}), changed = Object.assign({}, st.changed || {});
    ENGINE_IDS.forEach((id) => { delete settings[id]; delete changed[id]; });
    if (p) REST[p] = { settings, changed };
    const ui = Object.assign({}, st);
    ['settings', 'changed', 'settingsProjectionSource', 'settingsProjectionReadOnly', 'detailSetting', 'home'].forEach((k) => delete ui[k]);
    uiBase = ui;
    uiBase.home = st.home;
  }
  function engineProject() { const p = W.PM7_SETTINGS_TOME && W.PM7_SETTINGS_TOME.project(); return p ? p.id : null; }
  function snapshotFor(pid, ctx) {
    const vals = engineValues(Object.assign({}, ctx, { project: pid === NONE ? 'none' : pid }));
    const rest = REST[pid] || { settings: {}, changed: {} };
    return Object.assign(clone(uiBase || {}), {
      label: projectName(pid),
      settings: Object.assign({}, rest.settings, vals.settings),
      changed: Object.assign({}, rest.changed, vals.changed),
      detailSetting: null
    });
  }
  function writeSnapshots() {
    const snaps = W.PM_SETTINGS_PROJECT_SNAPSHOTS = W.PM_SETTINGS_PROJECT_SNAPSHOTS || {};
    const ctx = S.ctx;
    PROJECTS.map((p) => p.id).concat(NONE).forEach((pid) => { snaps[pid] = snapshotFor(pid, ctx); });
  }

  /* ------------------------------------------------------------------ feeding a context (6.2) */
  let feeding = 0;
  PSX.last = {};
  function remember() {
    const K = kimi(); if (!K) return;
    const st = K.getState().settings || {};
    PSX.last = {}; ENGINE_IDS.forEach((id) => { PSX.last[id] = clone(st[id]); });
  }
  function setTitle(pid) {
    const lab = D.getElementById('projectMenuLabel');
    const want = pid === NONE ? 'No project' : pid;
    if (lab && lab.textContent.trim() !== want) lab.textContent = want;
    // the title bar's own menu marks the chosen project when it has it
    D.querySelectorAll('#projectMenu .pm6-tb-menu-item[data-project]').forEach((b) => b.classList.toggle('is-selected', b.getAttribute('data-project') === pid));
  }
  /* switch the engine to the context's project and feed every snapshot; a context change that keeps the project
     (another device, Home NAS answering or not) pushes only what changed */
  function full(opts) {
    const K = kimi(); if (!K) return false;
    opts = opts || {};
    feeding++;
    try {
      captureCurrent();
      writeSnapshots();
      const pid = S.ctx.project && S.ctx.project !== 'none' ? S.ctx.project : NONE;
      W.PM_ACTIVE_PROJECT_ID = pid;
      setTitle(pid);
      K.reloadProject();
      verify();
      remember();
      PSX.emit('fed', { full: true });
    } finally { feeding--; }
    return true;
  }
  /* after a reload, every demo id must hold its resolved value; push any the engine ignored (6.2 step 3) */
  function verify() {
    const K = kimi(); if (!K) return 0;
    const want = engineValues(S.ctx).settings, st = K.getState().settings || {};
    let n = 0;
    Object.keys(want).forEach((id) => { if (!same(st[id], want[id])) { K.setSettingFromHost(id, want[id], false, false); n++; } });
    if (n) K.renderApp({ soft: true });
    PSX.feedPushed = n;
    return n;
  }
  /* push only what differs, without a reload (the world changed, or the device changed) */
  function push() {
    const K = kimi(); if (!K) return 0;
    feeding++;
    let n = 0;
    try {
      writeSnapshots();
      const want = engineValues(S.ctx).settings, st = K.getState().settings || {};
      const ids = Object.keys(want).filter((id) => !same(st[id], want[id]));
      ids.forEach((id) => { K.setSettingFromHost(id, want[id], false, false); n++; });
      if (ids.includes('general.visual.theme') || ids.includes('general.visual.theme-mode')) { try { W.PM7_SETTINGS_TOME.applyPaint(K.getState()); } catch (e) { /* paint later */ } }
      ids.forEach((id) => { try { if (W.PM51 && W.PM51.refreshSavedRow) W.PM51.refreshSavedRow(id); } catch (e) { /* the row is on another page */ } });
      remember();
      PSX.emit('fed', { full: false, ids });
    } finally { feeding--; }
    return n;
  }
  /* PMConcept7 paints Reduce Motion from the project's own value; the review strip's Reduced motion stands for the
     operating system's, so it is kept on after each paint */
  new MutationObserver(() => {
    if (S.osReduced && H.getAttribute('data-motion') !== 'reduced') H.setAttribute('data-motion', 'reduced');
  }).observe(H, { attributes: true, attributeFilter: ['data-motion'] });

  /* ------------------------------------------------------------------ the router (6.3) */
  let diffTimer = 0, inputTimer = 0;
  const router = { source: null, pendingToasts: [] };
  function schedule(src) {
    if (feeding) return;
    if (src) router.source = src;
    clearTimeout(diffTimer);
    requestAnimationFrame(() => { diffTimer = setTimeout(diff, 60); });
  }
  function hook(el) {
    if (!el || el.__psxRouted) return; el.__psxRouted = true;
    el.addEventListener('change', (e) => schedule(srcOf(e.target)), true);
    el.addEventListener('input', (e) => { clearTimeout(inputTimer); const src = srcOf(e.target); inputTimer = setTimeout(() => schedule(src), 250); }, true);
    el.addEventListener('click', (e) => schedule(srcOf(e.target)), true);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') schedule(srcOf(e.target)); }, true);
  }
  const srcOf = (t) => (t && t.closest && t.closest('.detail-inspector') && t.closest('.o55-insp-choice') ? 'panel' : t && t.closest && t.closest('#themeMenu') ? 'theme' : 'row');
  function diff() {
    const K = kimi(); if (!K || feeding) return;
    const st = K.getState().settings || {};
    const moved = ENGINE_IDS.filter((id) => !same(st[id], PSX.last[id]));
    if (!moved.length) { router.source = null; return; }
    const src = router.source; router.source = null;
    // the theme pair is one change
    const ids = moved.filter((id) => id !== 'general.visual.theme-mode');
    if (moved.includes('general.visual.theme-mode') && !ids.includes('general.visual.theme')) ids.push('general.visual.theme');
    ids.forEach((id) => {
      const nv = id === 'general.visual.theme' ? themeOf(st) : clone(st[id]);
      const ov = id === 'general.visual.theme' ? themeOf(PSX.last) : clone(PSX.last[id]);
      route(id, nv, ov, src);
    });
  }
  const themeOf = (s) => { const t = String(s['general.visual.theme'] || 'Basic Dark'), fam = t.split(/\s+/)[0], m = String(s['general.visual.theme-mode'] || '').toLowerCase(); return m === 'light' || m === 'dark' ? `${fam} ${m[0].toUpperCase()}${m.slice(1)}` : t; };

  /* where a change goes (SETTINGS-PROPOSAL 3.2): where the value in use comes from; the panel's own target when the
     change came from its choices */
  function targetFor(id, r, ctx, src) {
    const def = DEF[id], c = PSX.ctxFull(ctx);
    if (src === 'panel' && S.targets[id]) return S.targets[id];
    if (def.home === 'computer') return { level: 'computer', key: def.host ? (c.host || c.on) : c.on };
    if (def.home === 'project') return c.project ? { level: 'project', key: c.project } : null;
    if (def.home === 'everywhere') return { level: 'everywhere', key: null };
    if (r.from.level === 'project') return { level: 'project', key: r.from.key };
    if (r.from.level === 'computer') return { level: 'computer', key: r.from.key };
    if (r.from.level === 'device') return { level: 'device', key: r.from.key };
    return { level: 'everywhere', key: null };
  }
  /* the engine back to what the world says, without a note (a refused or cancelled change) */
  function revert() { push(); }

  function route(id, nv, ov, src) {
    const ctx = S.ctx, c = PSX.ctxFull(ctx);
    const before = PSX.resolve(id, ctx);
    // a change the review strip made (the Look) lands where the value lives, silently
    if (S.reviewChange || src === 'theme' && S.reviewChange) {
      const tg = targetFor(id, before, ctx);
      PSX.apply([{ level: tg.level, key: tg.key, id, value: nv }], { history: false });
      push(); return;
    }
    if (PSX.moments && PSX.moments.intercept && PSX.moments.intercept(id, nv, ov, before) === true) return;
    const tg = targetFor(id, before, ctx, src);
    if (!tg) { revert(); return; }
    const writes = [{ level: tg.level, key: tg.key, id, value: nv }];
    // the one admission (guard.js): first start, the device in use, the level, the value, the writer, pairing
    const a = PSX.guard.admit(writes);
    if (!a.clear) {
      revert();
      const m = a.missed[0];
      if (m.kind === 'first') PSX.note({ title: 'Set up Puppet Master on this computer first.', body: 'Nothing can be kept until a computer is set up, so Settings is a preview.', mark: 'info', kind: 'refused' });
      else if (m.kind === 'offline' && tg.level === 'everywhere') offlineEverywhere(id, nv, ov, c);
      else if (m.kind === 'offline') PSX.note({ title: 'Not saved', body: tg.level === 'project' ? `${projectName(tg.key)}’s settings can be changed when ${placeName('computer', m.wr)} answers. Nothing was queued.` : `${placeName('computer', m.wr)} isn’t answering. Its own settings can be changed when it’s back. Nothing was queued.`, mark: 'offline', kind: 'offline' });
      else PSX.note({ title: 'Not saved', body: m.text + '.', mark: 'info', kind: 'refused' });
      return;
    }
    // an Everywhere change is checked against every context that follows it (1.7), and safety rows are previewed
    if (tg.level === 'everywhere' && PSX.check) {
      const blocked = PSX.check.everywhere(id, nv);
      if (blocked) { revert(); PSX.check.refuse(id, nv, ov, blocked); return; }
    }
    if (PSX.check && PSX.check.needs(id, writes)) { revert(); PSX.check.preview(id, writes, (o) => commit(id, nv, ov, tg, { src, yolo: o && o.yolo }), { narrow: c.project && tg.level === 'everywhere' ? { level: 'project', key: c.project } : null }); return; }
    commit(id, nv, ov, tg, { src });
  }
  /* the settings home isn't answering: nothing is saved or queued; a change for now is offered only where it reaches
     this context and its computer answers (the work computer, or this screen) */
  function offlineEverywhere(id, nv, ov, c) {
    const def = DEF[id], acts = [], home = PSX.homeName();
    let body = `${home} keeps your settings and isn’t answering. Nothing was saved or queued.`;
    if (def.screen && (def.may || []).includes('device')) {
      if (c.device === S.actor) acts.push({ label: 'Just this screen for now', primary: true, run: () => commit(id, nv, ov, { level: 'device', key: c.device }, { offline: true }) });
    } else if ((def.may || []).includes('computer')) {
      if (PSX.answering(c.on)) acts.push({ label: c.on === 'here' ? 'Just this computer for now' : `Just ${placeName('computer', c.on)} for now`, primary: true, run: () => commit(id, nv, ov, { level: 'computer', key: c.on }, { offline: true }) });
      else body += ` ${c.project || 'This chat'} works on ${placeName('computer', c.on)}, which isn’t answering either, so nothing can change for it now.`;
    }
    acts.push({ label: `Change it when ${home} is back`, hover: `Nothing is saved or queued now. Change it again once ${home} answers.`, run: () => {} });
    PSX.note({ title: 'Not changed everywhere', body, mark: 'offline', actions: acts, kind: 'offline', ms: 9000 });
  }

  /* write the world, add History, re-feed, and say where it went: through the one write path (guard.js) */
  function commit(id, nv, ov, tg, o) {
    o = o || {};
    const tx = PSX.write([{ level: tg.level, key: tg.key, id, value: nv }], { by: o.by || 'you', offline: !!o.offline, yolo: !!o.yolo });
    if (!tx) { revert(); return null; }
    // a change made while the settings home is away remembers exactly where it went, for the back-online review
    if (o.offline) PSX.W.awayWrites = (PSX.W.awayWrites || []).concat([{ id, value: nv, level: tg.level, key: tg.key, tx: tx.id }]);
    consumeToast(id);
    if (o.quiet) return tx;
    sayWhere(id, tg, tx, o);
    return tx;
  }
  /* the note's words (SETTINGS-PROPOSAL 3.2) */
  function sayWhere(id, tg, tx, o) {
    o = o || {};
    const c = PSX.ctxFull(S.ctx), def = DEF[id];
    const after = PSX.resolve(id, S.ctx);
    const undoAct = { label: 'Undo', run: () => undoTx(tx.id, id) };
    let title, body = '', actions = [undoAct];
    if (tg.level === 'everywhere') {
      title = 'Saved for everywhere.';
      const keep = after.varies.filter((v) => v.level === 'project' || v.level === 'computer' || v.level === 'device');
      const names = keep.map((v) => placeName(v.level, v.key));
      if (names.length === 1) body = `${names[0]} keeps its own.`;
      else if (names.length > 1) body = `${list(names, 3)} keep their own.`;
      const narrow = [];
      if (c.project && def.may && def.may.includes('project')) narrow.push({ label: `Only for ${c.project}`, primary: true, run: () => onlyFor(id, tx, { level: 'project', key: c.project }) });
      else if (def.screen && def.may.includes('device')) narrow.push({ label: 'Only on this screen', primary: true, run: () => onlyFor(id, tx, { level: 'device', key: c.device }) });
      else if (!c.project && def.may && def.may.includes('computer')) narrow.push({ label: `Only on ${placeName('computer', c.on)}`, primary: true, run: () => onlyFor(id, tx, { level: 'computer', key: c.on }) });
      actions = narrow.concat(actions);
    } else if (tg.level === 'project') title = `Saved for ${tg.key}.`;
    else if (tg.level === 'device') title = tg.key === c.device ? 'Saved for this screen.' : `Saved for ${placeName('device', tg.key)}.`;
    else title = `Saved for ${placeName(tg.level, tg.key)}.`;
    if (o.offline) body = `Just ${tg.level === 'device' ? 'this screen' : placeName(tg.level, tg.key)} for now. When ${PSX.homeName()} is back you can make it everywhere.`;
    if (o.yolo) body = (body ? body + ' ' : '') + 'YOLO didn’t ask for a yes.';
    if (o.by === 'assistant') title = `The assistant set ${label(id)} to ${vt(id, after.asked !== undefined ? after.asked : after.value)} ${tg.level === 'project' ? 'for ' + tg.key : 'everywhere'}.`;
    const first = !S.tipShown;
    if (first) { S.tipShown = true; PSX.store.save({ tipShown: true }); }
    PSX.note({ title, body, actions, kind: 'saved', tip: first ? 'Settings apply to all your projects and computers. To change one project only, use the word at the end of the row.' : '' });
  }
  /* "Only for tastebook" is one transaction: Everywhere back, tastebook's own written (3.2) */
  function onlyFor(id, tx, tg) {
    const w = PSX.W;
    const x = tx.writes[0], back = tx.undo[0].value;
    if (!same(PSX.getAt(w, x.level, x.key, x.id), x.value)) { PSX.note({ title: 'Already changed again', body: 'It was changed after that note, so nothing moved.', mark: 'info' }); return; }
    const t2 = PSX.write([{ level: 'everywhere', key: null, id, value: back }, { level: tg.level, key: tg.key, id, value: x.value }], { batch: 'only-for', text: `${label(id)}: only for ${placeName(tg.level, tg.key)}` });
    if (!t2) return;
    PSX.undoMerge = null;
    const where = tg.level === 'device' ? 'this screen' : placeName(tg.level, tg.key);
    PSX.note({ title: `Saved for ${where}.`, body: `Everywhere else keeps ${vt(id, back === undefined ? DEFAULTS[id] : back)}.`, actions: [{ label: 'Undo', run: () => undoTx(t2.id, id) }], kind: 'saved' });
  }
  /* Undo is a write too: what it puts back is admitted first (the computer must answer; nothing is queued), and a batch's
     finished parts are undone with it */
  function undoTx(txId, id) {
    const tx = PSX.W.batches[txId];
    if (!tx || tx.undone) { PSX.note({ title: 'Nothing to undo', body: 'That change was already undone.', mark: 'info' }); return; }
    const all = [tx].concat((tx.links || []).map((l) => PSX.W.batches[l]).filter((x) => x && !x.undone));
    const inverse = []; all.forEach((t) => t.undo.forEach((u) => inverse.push(u)));
    const a = PSX.guard.admit(inverse);
    if (!a.clear) { const m = a.missed[0]; PSX.note({ title: 'Not undone', body: `${m.text}, so nothing was put back and nothing was queued. Undo again once it can be.`, mark: m.kind === 'offline' ? 'offline' : 'info', kind: 'refused' }); return; }
    const r = PSX.undo(txId);
    push();
    if (!r.ok) { PSX.note({ title: 'Nothing to undo', body: 'That change was already undone.', mark: 'info' }); return; }
    if (r.later && r.later.length) PSX.note({ title: 'Put back, except one setting', body: `${label(r.later[0])} was changed again after that, so it was left as it is.`, mark: 'info' });
    else PSX.note({ title: 'Put back', body: id ? `${label(id)} is ${vt(id, PSX.resolve(id, S.ctx).value)} again here.` : 'Everything it changed is as it was.', mark: 'complete', kind: 'undo' });
  }

  /* ------------------------------------------------------------------ one note per change: the engine's own toast
     PMConcept7's Settings says "Saved · <label>: <value>." through PM Notify (showToast reads PM_TITLEBAR_NOTIFY on
     every call). A Saved toast for a demo row is held for 400 ms; if the router routes that change, it is dropped. */
  const labelIds = () => { const m = {}; IDS.forEach((id) => { m[label(id)] = id; }); m['Light or dark'] = 'general.visual.theme'; return m; };
  function consumeToast(id) {
    router.pendingToasts.forEach((p) => { if (p.id === id || (id === 'general.visual.theme' && p.id === 'general.visual.theme')) p.drop = true; });
  }
  function wrapNotify() {
    const N = W.PM_TITLEBAR_NOTIFY;
    if (!N || typeof N.push !== 'function' || N.push.__psx) return !!(N && N.push && N.push.__psx);
    const base = N.push;
    const wrapped = function (payload) {
      try {
        const t = payload && String(payload.title || '');
        if (/^(Saved|Back to the default)$/.test(t)) {
          const body = String(payload.body || ''), map = labelIds();
          const name = Object.keys(map).find((l) => body.startsWith(l + ':'));
          if (name) {
            const p = { id: map[name], payload, drop: false };
            router.pendingToasts.push(p);
            setTimeout(() => { router.pendingToasts = router.pendingToasts.filter((x) => x !== p); if (!p.drop) base.call(N, payload); else PSX.toastsSwallowed = (PSX.toastsSwallowed || 0) + 1; }, 400);
            return undefined;
          }
        }
        // the engine refuses writes in its own no-project context: First start says it in the layer's words
        if (S.firstStart && /^Select or create a project$/.test(t)) { PSX.toastsSwallowed = (PSX.toastsSwallowed || 0) + 1; return undefined; }
      } catch (e) { /* fall through to the real toast */ }
      return base.apply(this, arguments);
    };
    wrapped.__psx = true;
    N.push = wrapped;
    return true;
  }

  /* ------------------------------------------------------------------ the title bar's own project menu
     PM_ACTIVE_PROJECT_ID wins over the menu, so a pick there is read here and becomes the context */
  function watchTitleMenu() {
    const menuEl = D.getElementById('projectMenu'); if (!menuEl || menuEl.__psx) return; menuEl.__psx = true;
    menuEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-project]'); if (!b) return;
      const pid = b.getAttribute('data-project');
      setTimeout(() => { if (pid && pid !== S.ctx.project) PSX.setCtx({ project: pid }); }, 30);
    }, true);
  }

  /* ------------------------------------------------------------------ context changes */
  PSX.setCtx = function (patch, opts) {
    const prev = Object.assign({}, S.ctx);
    Object.assign(S.ctx, patch);
    if (patch.project !== undefined && patch.project !== prev.project && patch.on === undefined) S.ctx.on = null;
    S.targets = {};
    const projectMoved = S.ctx.project !== prev.project;
    if (projectMoved || (opts && opts.reload)) full(); else push();
    PSX.emit('ctx', { prev, ctx: Object.assign({}, S.ctx) });
    PSX.report('state');
  };

  PSX.on('world', () => { if (!feeding) PSX.emit('redraw'); });
  Object.assign(PSX, { offLadder: { look: SKIP, credential: CRED, thing: REVIEWED.thing }, feed: { full, push, verify, writeSnapshots, engineValues, wrapNotify, watchTitleMenu, hook, captureCurrent, adoptAll, diff, ENGINE_IDS, NONE }, router, route, commit, sayWhere, onlyFor, undoTx, targetFor });
})(window);
