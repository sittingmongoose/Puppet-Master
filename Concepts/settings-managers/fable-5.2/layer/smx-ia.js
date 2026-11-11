/* Settings managers, rethought (Fable 5.2): the chapters, and readers for the demo data the pages share.
   Chapters are grouped the way a newcomer arrives: first what must work (AI, computers), then what makes it theirs,
   then what building needs, then safety and upkeep. Each chapter's pages are in layer/pages/. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.d) return;

  /* ------------------------------------------------------------------ readers over the Settings engine's demo state */
  const d = SMX.d = {};
  d.sp = (st) => (st.pm51 && st.pm51.serverProject) || { servers: [], devices: [], pending: [], remoteAccess: { routes: [] }, sshFolders: [], sshKeys: [], continuity: {}, conflicts: {}, status: {}, pairing: {}, move: { history: [] }, sourceLocation: {} };
  /* The SSH keys and what uses each one come from the Servers manager's own functions (PM51.sysSsh), so these pages
     always say what that manager says. PMConcept7 moves its example keys into the setting code.execution.ssh-keys the
     first time they are asked for; the plain readers below are only for a build that lacks those functions. */
  d.sshKeys = (st) => {
    try { const k = W.PM51.sysSsh.keys(); if (Array.isArray(k)) return k; } catch (e) { /* older build */ }
    const v = SMX.val('code.execution.ssh-keys'); if (Array.isArray(v) && v.length) return v;
    const s = d.sp(st).sshKeys; return Array.isArray(s) ? s : [];
  };
  d.sshKeyUses = (st, id) => { try { const u = W.PM51.sysSsh.keyUses(id); if (Array.isArray(u)) return u; } catch (e) { /* older build */ } return null; };
  d.homeServer = (st) => { const S = d.sp(st); return S.servers.find((s) => s.id === S.homeServer) || S.servers[0] || null; };
  d.thisComputer = (st) => d.sp(st).servers.find((s) => s.role === 'This computer') || null;
  d.routes = (st) => (d.sp(st).remoteAccess.routes || []).slice().sort((a, b) => a.priority - b.priority);
  d.routeNow = (st) => { const R = d.sp(st).remoteAccess; return d.routes(st).find((r) => r.id === R.actual) || d.routes(st)[0] || null; };
  d.routeAway = (st) => d.routes(st).find((r) => r.kind !== 'lan' && r.enabled && (r.status === 'ready' || r.status === 'active')) || null;
  d.ROUTE_STATUS = { active: ['In use', 'ready'], ready: ['Ready', 'ready'], 'not-set-up': ['Not set up', 'off'], 'needs-sign-in': ['Needs sign-in', 'attention'], 'needs-attention': ['Needs attention', 'attention'], testing: ['Testing', 'info'], offline: ['Offline', 'blocked'], off: ['Off', 'off'] };
  d.runOptions = (st) => {
    const S = d.sp(st); const opts = [['Automatic', 'Auto']];
    for (const s of S.servers) if (s.claimed !== false && s.runsWork !== false) opts.push([s.id, s.name]);
    for (const dv of S.devices) if (/runs work/i.test(dv.role) && !opts.some((o) => o[1].startsWith(dv.name))) opts.push(['device:' + dv.id, dv.name]);
    return opts;
  };
  d.runLabel = (st) => { const S = d.sp(st); const o = d.runOptions(st).find((x) => x[0] === S.executionHost); return o ? o[1] : String(S.executionHost || 'Auto'); };
  d.providers = (st) => st.providers || [];
  d.providerReady = (p) => /^(active|ready|ok)$/i.test(String(p.status || ''));
  d.project = (st) => { try { return W.PM7_SETTINGS_TOME.projectLabel() || 'this project'; } catch (e) { return 'this project'; } };
  d.plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  SMX.projectLine = (st) => `Project: ${d.project(st)}`;

  /* ------------------------------------------------------------------ PMConcept7's sections, by id
     SMX.sec('app-theme') is that section as PMConcept7 has it (its title, its help line, its settings in its order),
     less any setting another page names outright. Pass {title, help} to reword it, {ids} to name the settings. */
  const kit = () => W.PM51;
  let META = null;
  const meta = () => {
    if (META) return META;
    META = {};
    try { const P = kit().placement; for (const id of Object.keys(P.byId)) { const sec = P.sectionOf(id); if (sec && sec.id && !META[sec.id]) META[sec.id] = { label: sec.label || '', help: sec.description || '', ids: (sec.settings || []).map((x) => x.id) }; if (sec && sec.id && !META[sec.id].ids.includes(id)) META[sec.id].ids.push(id); } } catch (e) { /* placement not ready */ }
    return META;
  };
  SMX.sec = (sid, o = {}) => { const m = meta()[sid] || { label: sid, help: '' }; return Object.assign({ key: o.key || sid, title: o.title != null ? o.title : m.label, help: o.help != null ? o.help : m.help, ids: o.ids || SMX.from(sid) }, o.when ? { when: o.when } : {}); };
  /* the settings of a section that PMConcept7's manager draws itself (a list, a per-thing switch): the page that draws
     them here says how, so search and "Everything that moved" can point at it */
  SMX.drawn = (sid, how, o = {}) => { const out = {}; const m = meta()[sid]; for (const id of (m ? m.ids : [])) if (!(o.minus || []).includes(id)) out[id] = how; return out; };
  SMX.sectionIds = (sid) => ((meta()[sid] || {}).ids || []).slice();
  /* rows PMConcept7 draws by hand on its plain pages: they are settings like any other and are placed like any other */
  SMX.handIds = ['general.visual.accent-color', 'general.visual.animation-speed', 'general.interaction.activity-bar-labels', 'general.startup.first-screen', 'general.interaction.spellcheck', 'general.interaction.spellcheck-languages', 'general.interaction.spellcheck-words', 'code.editing.autosave', 'code.editing.default-encoding', 'code.terminal.paste-protection', 'web.index.mode'];
  SMX.handHomes = { 'general.visual.accent-color': ['app-input', 'Theme & colors'], 'general.visual.animation-speed': ['app-input', 'Size & readability'], 'general.interaction.activity-bar-labels': ['app-input', 'Window & panels'], 'general.startup.first-screen': ['app-input', 'When Puppet Master opens'], 'general.interaction.spellcheck': ['app-input', 'Spelling'], 'general.interaction.spellcheck-languages': ['app-input', 'Spelling'], 'general.interaction.spellcheck-words': ['app-input', 'Spelling'], 'code.editing.autosave': ['editor-runtime', 'Saving & tabs'], 'code.editing.default-encoding': ['editor-runtime', 'Saving & tabs'], 'code.terminal.paste-protection': ['editor-runtime', 'Copy & paste'], 'web.index.mode': ['editor-runtime', 'Project search index'] };

  /* ------------------------------------------------------------------ chapters */
  const sp = (ctx) => d.sp(ctx.st);
  SMX.chapter({ id: 'ai', title: 'AI providers', icon: 'brain', group: 'Start here',
    blurb: 'The AI that does the work, your accounts, and what happens when one runs out.',
    status: (ctx) => { const ps = d.providers(ctx.st); const bad = ps.filter((p) => /attention|needs/i.test(String(p.status) + ' ' + String(p.statusLabel || ''))).length; return bad ? { tone: 'attention', text: `${bad} need${bad === 1 ? 's' : ''} you` } : { tone: 'ready', text: 'Working' }; } });
  SMX.chapter({ id: 'computers', title: 'Computers & remote access', icon: 'computer', group: 'Start here',
    blurb: 'Where your projects are kept, which computers do the work, and how you get in from anywhere.',
    status: (ctx) => { const S = sp(ctx); const bad = S.servers.filter((s) => !/connected/i.test(s.state)).length; return bad ? { tone: 'attention', text: 'A computer is not answering' } : { tone: 'ready', text: 'Connected' }; } });
  SMX.chapter({ id: 'look', title: 'Look & feel', icon: 'palette', group: 'Make it yours', blurb: 'Theme, wallpaper, text size, motion and the layout of the window.' });
  SMX.chapter({ id: 'assistant', title: 'Chat & assistant', icon: 'chat', group: 'Make it yours', blurb: 'How you talk to the assistant and how it answers.' });
  SMX.chapter({ id: 'notifications', title: 'Notifications & sounds', icon: 'bell', group: 'Make it yours', blurb: 'What tells you something happened, where, and how it sounds.' });
  SMX.chapter({ id: 'memory', title: 'Memory & helpers', icon: 'memory', group: 'Make it yours', blurb: 'What the assistant remembers, the rules it follows, and the personas that help.' });
  SMX.chapter({ id: 'planning', title: 'Planning & goals', icon: 'map', group: 'Building', blurb: 'How plans are made and how long-running Goals behave.' });
  SMX.chapter({ id: 'code', title: 'Code & tools', icon: 'code', group: 'Building', blurb: 'The editor, the terminal, and the tools the assistant can use.' });
  SMX.chapter({ id: 'source', title: 'Source control', icon: 'branch', group: 'Building', blurb: 'Version history and the online services that hold a copy of your code.' });
  SMX.chapter({ id: 'safety', title: 'Safety & permissions', icon: 'shield', group: 'Safety & upkeep', blurb: 'What the assistant may do without asking, and what it must never touch.' });
  SMX.chapter({ id: 'keeping', title: 'Backups & history', icon: 'archive', group: 'Safety & upkeep', blurb: 'Copies of your work, what is kept and for how long.' });
  SMX.chapter({ id: 'system', title: 'Health & updates', icon: 'heart', group: 'Safety & upkeep', blurb: 'Checkups, updates, copying settings, and the expert corner.' });
})(window);
