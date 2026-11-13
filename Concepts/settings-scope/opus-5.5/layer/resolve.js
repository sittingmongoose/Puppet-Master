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
   computer's); computer_ceiling (limit rows: a computer's own value is the most any project there can use); per_item
   (the three permission rows: each item by its owner's own rule, PER_ITEM below). Reduce motion has its own named rule,
   an OR (MOTION below). */
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
  /* why a level isn't offered. Inventory alignment: a row Plans' inventory lists carries its not_offered codes
     (def.notOffered), and they win; the derived reasons below are for rows it doesn't list */
  function reasons(def) {
    const off = offered(def), r = {}, n = def.notOffered || {};
    if (!off.everywhere) r.everywhere = n.everywhere || def.reason;
    if (!off.project) r.project = n.project || (def.home === 'computer' ? def.reason : def.screen ? 'about_the_screen' : def.reason || 'same_for_you');
    if (!off.computer && !off.device) r.computer = n.computer || def.reason || 'same_for_you';
    if (!off.device) r.device = def.screen ? null : n.device || 'not_about_the_screen';
    if (def.home === 'project') { r.everywhere = n.everywhere || 'about_this_project'; r.computer = n.computer || 'about_this_project'; }
    return r;
  }
  /* who writes a level, and whether it is answering (7.1: one writer per level; Everywhere is the settings home's) */
  function writer(level, key) {
    if (level === 'everywhere') return PSX.home();
    if (level === 'computer') return HOSTS[key] ? HOSTS[key].parent : key;
    if (level === 'project') { const p = PSX.projectById(key); return p ? p.home : 'here'; }
    if (level === 'device') return null;   // a device writes its own screen values
    return null;
  }
  const w0 = () => PSX.W;

  /* ------------------------------------------------------------------ per_item (Astra max A1)
     SSYS-059: "per_item invokes the existing domain merge by stable name/ID and never invents structured field merges".
     So each per_item row in Plans' inventory names its owner's own rule here, and nothing else is merged:
       answers  safety.rules.per-tool-permissions, safety.protection.web-tool-permissions. PS-144: "first resolve each
                layer own answer for the exact permission key with existing owner matching/deny semantics, then protectively
                combine simultaneous Computer-own and Project-own declared answers with deny before ask before allow".
                So each key on its own: when this computer's own and this project's own answer for it both exist, the
                more careful is used (an answer outside deny/ask/allow: the computer's, SSYS-059's custom rule); otherwise
                the most specific own answer, then Everywhere's, then the default. Everywhere is a fallback, never an
                extra comparison (SSYS-059).
       rules    safety.rules.rule-editor, the ordered rules ("Checked top to bottom; the last matching rule wins").
                Permissions §2.4: layers "shadow lower layers on a per-rule basis, but they do NOT replace the entire lower
                ruleset"; §3.1: the last matching rule wins. So the list is the default's, Everywhere's, this computer's,
                then this project's rules, and a rule a more specific place also has (the same tool pattern, condition and
                profile) is kept only there. No protective reordering: PS-144 says its combination "is not per-field
                profile merging or a reordering of independent granular durable-rule specificity".
       nicknames ai.models.model-alias, the one Model nicknames list (Plans batch 4, DL-479; Models §6.7): "Each
                nickname resolves on its own (per_item, keyed by the normalized nickname): a project's line wins for
                that nickname, and nicknames set only Everywhere still apply in the project". Nicknames normalize per
                §6.7 (lowercase; spaces, underscores and hyphens collapse), so "Fast model" and "fast-model" are one
                line; the most specific place that has a line for it wins, spelled as that place wrote it.
     A per_item row with no rule here would be a new kind of item: it keeps the most specific value whole and says so
     (out.perItemGap), and the check fails on it. */
  const PER_ITEM = { 'safety.rules.per-tool-permissions': 'answers', 'safety.protection.web-tool-permissions': 'answers', 'safety.rules.rule-editor': 'rules', 'ai.models.model-alias': 'nicknames' };
  // a nickname's stable name (Models §6.7): lowercase, with spaces, underscores and hyphens collapsed
  const nickKey = (k) => String(k).trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  const ANSWERS = ['deny', 'ask', 'allow'];
  const RANK = { default: 0, everywhere: 1, computer: 2, device: 2, project: 3 };
  const isMap = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  // a rule's stable name: its tool pattern, condition and profile, everything but the answer ("github_*: ask (On a branch)")
  const ruleKey = (x) => {
    if (x && typeof x === 'object') return String(x.rule_id || x.id || x.pattern || JSON.stringify(x));
    const m = /^(.*?):\s*(allow|ask|deny|block)\b(.*)$/i.exec(String(x));
    return m ? (m[1] + m[3]).trim() : String(x).trim();
  };
  function perItem(kind, layers, ctx) {
    const items = [];
    let value;
    if (kind === 'answers') {
      value = {};
      const keys = [];
      layers.forEach((L) => { if (isMap(L.value)) Object.keys(L.value).forEach((k) => { if (!keys.includes(k)) keys.push(k); }); });
      const comp = layers.find((L) => L.level === 'computer'), proj = layers.find((L) => L.level === 'project');
      const own = (L, k) => (L && isMap(L.value) && has(L.value, k) ? L.value[k] : undefined);
      keys.forEach((k) => {
        const c = own(comp, k), p = own(proj, k);
        let win, careful = null;
        if (c !== undefined && p !== undefined) {
          const ci = ANSWERS.indexOf(c), pi = ANSWERS.indexOf(p);
          win = ci < 0 || pi < 0 || ci < pi ? comp : proj;
          if (win === comp && !same(c, p)) careful = { asked: clone(p), by: { level: comp.level, key: comp.key }, askedBy: { level: proj.level, key: proj.key } };
        } else win = layers.slice().reverse().find((L) => own(L, k) !== undefined);
        value[k] = clone(own(win, k));
        items.push({ key: k, value: clone(own(win, k)), from: { level: win.level, key: win.key }, careful });
      });
    } else if (kind === 'nicknames') {
      // each nickname on its own: the most specific place with a line for it wins; the others still apply
      value = {};
      const seen = new Map();
      layers.forEach((L) => { if (isMap(L.value)) Object.keys(L.value).forEach((k) => seen.set(nickKey(k), { L, k })); });
      [...seen.values()].forEach(({ L, k }) => { value[k] = clone(L.value[k]); items.push({ key: k, value: clone(L.value[k]), from: { level: L.level, key: L.key }, careful: null }); });
    } else {
      value = [];
      const lists = layers.filter((L) => Array.isArray(L.value)), names = lists.map((L) => new Set(L.value.map(ruleKey)));
      lists.forEach((L, i) => L.value.forEach((x) => {
        const k = ruleKey(x);
        if (names.slice(i + 1).some((n) => n.has(k))) return;          // a more specific place has the same rule: it shadows this one
        value.push(clone(x)); items.push({ key: k, value: clone(x), from: { level: L.level, key: L.key }, careful: null });
      }));
    }
    // the place the row's word names: the most specific one any item comes from (or the most specific own value)
    const top = items.reduce((a, i) => (!a || RANK[i.from.level] >= RANK[a.level] ? i.from : a), null) || (layers.filter((L) => L.level !== 'default').pop() || { level: 'default', key: null });
    const careful = items.filter((i) => i.careful);
    return {
      value, items, from: { level: top.level, key: top.key },
      careful: careful.length ? { items: careful.map((i) => i.key), asked: Object.fromEntries(careful.map((i) => [i.key, i.careful.asked])), used: Object.fromEntries(careful.map((i) => [i.key, i.value])), by: careful[0].careful.by, askedBy: careful[0].careful.askedBy } : null
    };
  }

  /* ------------------------------------------------------------------ Reduce motion (Astra max A4)
     SSYS-059 names it apart: "general.visual.reduce-animations is Everywhere/Device/Project, with true more careful than
     false: OR the applicable own requests (or the factory default when all are absent) with the OS preference". So its
     value is true when any own request here (Everywhere, this device, this project) is true; the default only when none
     exists. The operating system's preference is ORed after, as its own input: the strip's Reduced motion stands for
     it, on the device in use (ctx.os overrides). `value` is what Settings shows (your requests); `motion.effective` is
     the motion in use. The more_careful comparison of the other safety rows never runs for it. */
  const MOTION = 'general.visual.reduce-animations';
  function motionOr(steps, dflt, c, ctx) {
    const reqs = steps.filter((s) => s.has && (s.level === 'everywhere' || s.level === 'device' || s.level === 'project')).map((s) => ({ level: s.level, key: s.key, value: s.value === true }));
    const yes = reqs.filter((s) => s.value), asked = reqs.length ? yes.length > 0 : dflt === true;
    // the request that decides, the most specific true one (or, when none asks, the most specific own one)
    const by = asked ? yes[yes.length - 1] || null : reqs[reqs.length - 1] || null;
    const os = c && c.os !== undefined ? !!c.os : !!(PSX.S && ctx.device === PSX.S.actor && PSX.S.osReduced);
    return {
      value: asked, from: by ? { level: by.level, key: by.key } : { level: 'default', key: null },
      motion: { rule: 'or', requests: reqs, os, effective: asked || os, overruled: asked && by ? reqs.filter((s) => !s.value && RANK[s.level] > RANK[by.level]) : [] }
    };
  }
  const answering = (w, comp) => !comp || w.up[comp] !== false;
  const has = (bag, id) => !!bag && Object.prototype.hasOwnProperty.call(bag, id);

  function resolve(id, c, world) {
    const w = world || PSX.W;
    // the theme pair's second half resolves with its first: both halves always come from one level
    if (id === 'general.visual.theme-mode' && !DEF[id]) { const t = resolve('general.visual.theme', c, world); return t && Object.assign({}, t, { id, value: themePair(t.value)['general.visual.theme-mode'], pairOf: 'general.visual.theme' }); }
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
    // owner rungs (MA-073): an AI service's own value beats the project and everywhere, for that service's work. With a
    // service in the context it decides; without one the shared value is the row's, and the services' own are listed
    if (def.owner) {
      out.owners = [];
      Object.keys(w.provider || {}).forEach((key) => { if (has(w.provider[key], id)) out.owners.push({ level: 'provider', key, value: clone(w.provider[key][id]) }); });
      if (ctx.provider && has(w.provider[ctx.provider], id)) steps.push({ level: 'provider', key: ctx.provider, has: true, value: clone(w.provider[ctx.provider][id]) });
    }
    out.chain = out.chain.concat(steps);
    if (def.owner && !ctx.provider) out.owners.forEach((o) => out.chain.push(Object.assign({ has: true, rung: true }, o)));

    const top = steps.filter((s) => s.has).pop();
    if (top) { out.value = clone(top.value); out.from = { level: top.level, key: top.key }; }
    if (id === MOTION) {
      const m = motionOr(steps, dflt, c, ctx);
      out.value = m.value; out.from = m.from; out.motion = m.motion;
    } else if (def.combine === 'per_item') {
      const kind = PER_ITEM[id];
      if (kind) {
        const layers = [{ level: 'default', key: null, value: dflt }].concat(steps.filter((s) => s.has && s.level !== 'provider'));
        const m = perItem(kind, layers, ctx);
        out.value = m.value; out.from = m.from; out.items = m.items; out.perItem = kind;
        if (m.careful) out.careful = m.careful;
      } else out.perItemGap = true;
    } else if (def.combine === 'more_careful' && place && place.has && proj && proj.has) {
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
    // Changed follows the value in use here, not the asked one (SETTINGS-PROPOSAL 2.2): 4 asked under a limit of 3 is
    // a change, 6 asked under a limit of 4 when the default is 4 is not
    out.changed = !same(out.value, dflt);
    // the level that decides here, and whether it is this context's own
    out.here = out.from.level === 'project' || out.from.level === 'computer' || out.from.level === 'device' || out.from.level === 'provider';
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
    // fix pass: the owner rung, Changed under a limit, the adopted rows' safety and limit rules
    t(17, 'Switch when this much is left, harbor, for Claude’s work', () => { const r = resolve('ai.accounts.hard-switch-level', ctx('harbor', { provider: 'claude' }), fresh()); return { ok: r.value === 15 && r.from.level === 'provider' && r.from.key === 'claude', got: `${r.value} from ${r.from.level} ${r.from.key}` }; });
    t(18, 'Switch when this much is left, harbor, shared value', () => { const r = resolve('ai.accounts.hard-switch-level', ctx('harbor'), fresh()); return { ok: r.value === 10 && r.owners.length === 1 && r.varies.some((v) => v.level === 'provider'), got: `${r.value}, owners ${r.owners.map((o) => o.key + ' ' + o.value)}` }; });
    t(19, 'Helpers at once, tastebook asks 4 under This computer’s 3', () => { const w = fresh(); w.project.tastebook['branching.subagents.max-parallel'] = 4; const r = resolve('branching.subagents.max-parallel', ctx('tastebook'), w); return { ok: r.value === 3 && r.changed === true, got: `${r.value}, changed ${r.changed}` }; });
    t(20, 'Helpers at once, tastebook asks 6 under a limit of 4', () => { const w = fresh(); w.computer.here['branching.subagents.max-parallel'] = 4; const r = resolve('branching.subagents.max-parallel', ctx('tastebook'), w); return { ok: r.value === 4 && r.asked === 6 && r.changed === false, got: `${r.value}, asked ${r.asked}, changed ${r.changed}` }; });
    t(21, 'Default answer for new tools: This computer Deny, harbor Allow', () => { if (!DEF['safety.rules.default-tool-permission']) return { ok: false, got: 'not adopted' }; const w = fresh(); w.computer.here['safety.rules.default-tool-permission'] = 'deny'; w.project.harbor['safety.rules.default-tool-permission'] = 'allow'; const r = resolve('safety.rules.default-tool-permission', ctx('harbor'), w); return { ok: r.value === 'deny' && r.combine === 'more_careful', got: `${r.value}, ${r.combine}` }; });
    t(22, 'Simultaneous requests per AI provider: This computer 2, harbor 7', () => { if (!DEF['branching.subagents.provider-concurrency-cap']) return { ok: false, got: 'not adopted' }; const w = fresh(); w.computer.here['branching.subagents.provider-concurrency-cap'] = 2; w.project.harbor['branching.subagents.provider-concurrency-cap'] = 7; const r = resolve('branching.subagents.provider-concurrency-cap', ctx('harbor'), w); return { ok: r.value === 2 && !!r.ceiling, got: `${r.value}, ${r.combine}` }; });
    if (!quiet) results.forEach((r) => console.log(`[psx selfTest] ${r.ok ? 'PASS' : 'FAIL'} ${r.n}. ${r.name}: ${r.got}`));
    return { pass: results.filter((r) => r.ok).length, fail: results.filter((r) => !r.ok).length, results };
  }

  Object.assign(PSX, { resolve, offered, reasons, writer, answering: (comp) => answering(PSX.W, comp), themePair, selfTest, PER_ITEM, MOTION });
})(window);
