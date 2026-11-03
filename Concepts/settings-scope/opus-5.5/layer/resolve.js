/* Settings that apply everywhere (Opus 5.5): the one resolver, PSX.resolve(id, ctx).

   The concept's copy of DR-084's one resolver (SETTINGS-PROPOSAL 1.4). Every surface the layer draws reads it; nothing
   else applies precedence. Its output has the shape the proposal gives pm.settings_effective_value.v1:
     { value, from: { level, key }, chain: [{ level, key, has, value }], combine, asked?, ceiling?, careful?, changed,
       varies: [{ level, key, value }], stale: [{ level, key, value, asOf }], offered: { everywhere, computer, device,
       project }, reasons: { level: code }, notOffered?, found? }
   Order, least to most specific: Puppet Master's default < Everywhere < the computer (the one doing the work; the
   program's place for program and folder rows; the device in front of you for screen rows) < the project < owner
   rungs. A level with no value is absent and falls through, never a copy.
   Combine: most_specific (almost every row); more_careful (safety rows: between a computer's or a device's own value and
   a project's own value, the more careful one by the row's careful_order; a custom value with both set yields the
   computer's); computer_ceiling (limit rows: a computer's own value is the most any project there can use). */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.resolve) return;
  const { DEF, DEFAULTS, COMPUTERS, HOSTS, DEVICES, PROJECTS, same, clone } = PSX;

  function offered(def) {
    const may = def.may || [];
    return {
      everywhere: !def.home || def.home === 'everywhere',
      computer: may.includes('computer') || def.home === 'computer',
      device: may.includes('device'),
      project: may.includes('project') || def.home === 'project'
    };
  }
  function reasons(def) {
    const off = offered(def), r = {};
    if (!off.everywhere) r.everywhere = def.reason;
    if (!off.project) r.project = def.home === 'computer' ? def.reason : def.screen ? 'about_the_screen' : def.reason || 'same_for_you';
    if (!off.computer && !off.device) r.computer = def.reason || 'same_for_you';
    if (!off.device) r.device = def.screen ? null : 'not_about_the_screen';
    if (def.home === 'project') { r.everywhere = 'about_this_project'; r.computer = 'about_this_project'; }
    return r;
  }
  /* who writes a level, and whether it is answering (7.1: one writer per level; Everywhere is the settings home's) */
  function writer(level, key) {
    if (level === 'everywhere') return w0().home || 'homenas';
    if (level === 'computer') return HOSTS[key] ? HOSTS[key].parent : key;
    if (level === 'project') { const p = PSX.projectById(key); return p ? p.home : 'here'; }
    if (level === 'device') return null;   // a device writes its own screen values
    return null;
  }
  const w0 = () => PSX.W;
  const answering = (w, comp) => !comp || w.up[comp] !== false;
  const has = (bag, id) => !!bag && Object.prototype.hasOwnProperty.call(bag, id);

  function resolve(id, c, world) {
    const w = world || PSX.W;
    const def = DEF[id]; if (!def) return null;
    const ctx = PSX.ctxFull(c);
    const dflt = DEFAULTS[id];
    const off = offered(def);
    const out = {
      id, value: clone(dflt), from: { level: 'default', key: null }, chain: [{ level: 'default', key: null, has: true, value: clone(dflt) }],
      combine: def.combine || 'most_specific', changed: false, varies: [], stale: [], offered: off, reasons: reasons(def), ctx
    };
    // every own value anywhere in the world (what "Varies" means), whatever the context
    if (off.everywhere && has(w.everywhere, id)) out.everywhere = clone(w.everywhere[id]);
    ['computer', 'device', 'project'].forEach((lvl) => Object.keys(w[lvl] || {}).forEach((key) => {
      if (key === 'psx-none') return;
      if (has(w[lvl][key], id)) out.varies.push({ level: lvl, key, value: clone(w[lvl][key][id]) });
    }));
    if (def.owner) Object.keys(w.provider || {}).forEach((key) => { if (has(w.provider[key], id)) out.varies.push({ level: 'provider', key, value: w.provider[key][id] }); });
    // stale: a source whose writer isn't answering
    const staleFrom = (lvl, key) => { const wr = writer(lvl, key); return wr && !answering(w, wr); };
    if (out.everywhere !== undefined && staleFrom('everywhere')) out.stale.push({ level: 'everywhere', key: null, value: out.everywhere, asOf: w.asOf });
    out.varies.forEach((v) => { if (staleFrom(v.level, v.key)) out.stale.push(Object.assign({ asOf: w.asOf }, v)); });

    if (def.home === 'project' && !ctx.project) {
      out.notOffered = 'about_this_project'; out.value = undefined; out.from = { level: 'none', key: null };
      return out;
    }
    // the chain for this context
    const steps = [];
    if (off.everywhere) steps.push({ level: 'everywhere', key: null, has: has(w.everywhere, id), value: clone(w.everywhere[id]) });
    let place = null;
    if (off.device) place = { level: 'device', key: ctx.device };
    else if (off.computer) place = { level: 'computer', key: def.host ? (ctx.host || ctx.on) : ctx.on };
    if (place) { const bag = w[place.level][place.key]; steps.push(Object.assign(place, { has: has(bag, id), value: clone(bag ? bag[id] : undefined) })); }
    let proj = null;
    if (off.project && ctx.project) { const bag = w.project[ctx.project]; proj = { level: 'project', key: ctx.project, has: has(bag, id), value: clone(bag ? bag[id] : undefined) }; steps.push(proj); }
    out.chain = out.chain.concat(steps);
    if (def.owner) Object.keys(w.provider || {}).forEach((key) => { if (has(w.provider[key], id)) out.chain.push({ level: 'provider', key, has: true, value: w.provider[key][id], rung: true }); });

    const top = steps.filter((s) => s.has).pop();
    if (top) { out.value = clone(top.value); out.from = { level: top.level, key: top.key }; }
    if (def.combine === 'more_careful' && place && place.has && proj && proj.has) {
      const order = def.careful || [];
      const pi = order.findIndex((x) => same(x, place.value)), qi = order.findIndex((x) => same(x, proj.value));
      let win = proj;
      if (pi < 0 || qi < 0) win = place.level === 'computer' ? place : proj;   // a custom value: the computer's is used
      else if (pi < qi) win = place;
      out.value = clone(win.value); out.from = { level: win.level, key: win.key };
      if (win === place && !same(place.value, proj.value)) out.careful = { asked: clone(proj.value), by: { level: place.level, key: place.key } };
    }
    if (def.combine === 'computer_ceiling' && place && place.has && proj && proj.has && Number(proj.value) > Number(place.value)) {
      out.value = clone(place.value); out.asked = clone(proj.value); out.from = { level: 'project', key: proj.key };
      out.ceiling = { level: place.level, key: place.key, value: clone(place.value) };
    }
    // programs and folders: what was found on that computer
    if (w.found && w.found[id] && place) {
      const f = w.found[id][place.key];
      out.found = f === undefined ? undefined : f;
      if (f === null && !place.has) out.missing = true;
    }
    const shown = out.asked !== undefined ? out.asked : out.value;
    out.changed = !same(shown, dflt);
    // the level that decides here, and whether it is this context's own
    out.here = out.from.level === 'project' || out.from.level === 'computer' || out.from.level === 'device';
    return out;
  }

  /* the theme pair resolves as one unit: both halves always come from the same level */
  function themePair(value) {
    const v = String(value || 'Basic Dark');
    const mode = /light$/i.test(v) ? 'Light' : 'Dark';
    return { 'general.visual.theme': v, 'general.visual.theme-mode': mode };
  }

  /* ------------------------------------------------------------------ PSX.selfTest(): BUILD-SPEC section 5's cases */
  function selfTest(quiet) {
    const ctx = (project, extra) => Object.assign({ project, device: 'here', on: null }, extra || {});
    const results = [];
    const t = (n, name, fn) => { let ok = false, got = ''; try { const r = fn(); ok = !!r.ok; got = r.got; } catch (e) { got = String(e); } results.push({ n, name, ok, got }); };
    const fresh = () => { const keep = PSX.W; const w = PSX.freshWorld(); PSX.W = keep; return w; };
    t(1, 'Everyday model, harbor on This computer', () => { const r = resolve('ai.models.default-model', ctx('harbor'), fresh()); return { ok: r.value === 'anthropic/claude-opus-4' && r.from.level === 'everywhere' && r.varies.length === 1 && r.varies[0].key === 'docs-site', got: `${r.value} from ${r.from.level}, varies ${r.varies.map((v) => v.key)}` }; });
    t(2, 'Everyday model, docs-site', () => { const r = resolve('ai.models.default-model', ctx('docs-site'), fresh()); return { ok: r.value === 'anthropic/claude-sonnet-4' && r.from.level === 'project' && r.changed === false, got: `${r.value} from ${r.from.level}, changed ${r.changed}` }; });
    t(3, 'Helpers at once, tastebook on This computer', () => { const r = resolve('branching.subagents.max-parallel', ctx('tastebook'), fresh()); return { ok: r.value === 3 && !!r.ceiling && r.asked === 6, got: `${r.value}, ceiling ${r.ceiling && r.ceiling.value}, asked ${r.asked}` }; });
    t(4, 'Helpers at once, recipe-app on Home NAS', () => { const r = resolve('branching.subagents.max-parallel', ctx('recipe-app'), fresh()); return { ok: r.value === 8 && r.from.level === 'computer' && r.from.key === 'homenas', got: `${r.value} from ${r.from.level} ${r.from.key}` }; });
    t(5, 'Helpers at once, lighting-rig on Studio Mac', () => { const r = resolve('branching.subagents.max-parallel', ctx('lighting-rig'), fresh()); return { ok: r.value === 4 && r.from.level === 'default', got: `${r.value} from ${r.from.level}` }; });
    t(6, 'Profile in use, garden-notes on Home NAS', () => { const r = resolve('safety.rules.permission-preset', ctx('garden-notes'), fresh()); return { ok: r.value === 'plan' && r.combine === 'more_careful' && !!r.careful, got: `${r.value}, ${r.combine}, from ${r.from.level}` }; });
    t(7, 'Profile in use, experiment on This computer', () => { const r = resolve('safety.rules.permission-preset', ctx('experiment'), fresh()); return { ok: r.value === 'regular' && r.from.level === 'default', got: `${r.value} from ${r.from.level}` }; });
    t(8, 'FileSafe, experiment on This computer', () => { const r = resolve('safety.protection.filesafe-integration', ctx('experiment'), fresh()); return { ok: r.value === false && r.from.level === 'project' && !!DEF['safety.protection.filesafe-integration'].risk, got: `${r.value} from ${r.from.level}` }; });
    t(9, 'Text size, any project, device Studio Mac', () => { const r = resolve('general.visual.font-size', ctx('harbor', { device: 'studio' }), fresh()); return { ok: r.value === 16 && r.from.level === 'device', got: `${r.value} from ${r.from.level}` }; });
    t(10, 'Reduce motion, loom, device here', () => { const r = resolve('general.visual.reduce-animations', ctx('loom'), fresh()); return { ok: r.value === true && r.from.level === 'project', got: `${r.value} from ${r.from.level}` }; });
    t(11, 'Reduce motion, harbor, device iPhone', () => { const r = resolve('general.visual.reduce-animations', ctx('harbor', { device: 'iphone' }), fresh()); return { ok: r.value === true && r.from.level === 'device', got: `${r.value} from ${r.from.level}` }; });
    t(12, 'Theme, tastebook at Studio Mac (moment 11.9 on)', () => { const w = fresh(); w.project.tastebook['general.visual.theme'] = 'Retro Dark'; w.device.studio['general.visual.theme'] = 'Basic Light'; const r = resolve('general.visual.theme', ctx('tastebook', { device: 'studio' }), w); return { ok: r.value === 'Retro Dark' && r.from.level === 'project', got: `${r.value} from ${r.from.level}` }; });
    t(13, 'Claude Code app location, garden-notes', () => { const r = resolve('system.advanced.cli-path-claude', ctx('garden-notes'), fresh()); return { ok: r.value === '/usr/local/bin/claude' && r.from.level === 'computer', got: `${r.value} from ${r.from.level}` }; });
    t(14, 'Rules for this project, No project', () => { const r = resolve('memory.assembly.project-rules', ctx('none'), fresh()); return { ok: r.notOffered === 'about_this_project' && !r.offered.everywhere, got: `notOffered ${r.notOffered}` }; });
    t(15, 'Explain technical terms, No project on Home NAS', () => { const r = resolve('general.interaction.eli5-default', ctx('none', { on: 'homenas' }), fresh()); return { ok: r.value === true && r.from.level === 'everywhere', got: `${r.value} from ${r.from.level}` }; });
    t(16, 'Wait for a server, harbor; then clear harbor’s own', () => { const w = fresh(); const a = resolve('system.mcp.timeout', ctx('harbor'), w); delete w.project.harbor['system.mcp.timeout']; const b = resolve('system.mcp.timeout', ctx('harbor'), w); return { ok: a.value === 60000 && b.value === 30000 && b.from.level === 'default', got: `${a.value}, then ${b.value}` }; });
    if (!quiet) results.forEach((r) => console.log(`[psx selfTest] ${r.ok ? 'PASS' : 'FAIL'} ${r.n}. ${r.name}: ${r.got}`));
    return { pass: results.filter((r) => r.ok).length, fail: results.filter((r) => !r.ok).length, results };
  }

  Object.assign(PSX, { resolve, offered, reasons, writer, answering: (comp) => answering(PSX.W, comp), themePair, selfTest });
})(window);
