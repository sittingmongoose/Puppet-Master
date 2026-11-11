/* Settings managers, rethought (Fable 5.2): Settings Home.
   Today's Home is a search box, six shortcut rows, three warnings and nine chapter cards. Here it answers the three
   questions a newcomer has on arrival: is everything working, what needs me, and where do I go to do the common things.
   Each chapter says its own state in a few words, so the whole setup can be read in one pass. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h;

  /* what needs you, gathered from every chapter. A chapter adds a function: (st) => [{tone, title, detail, fix}] */
  SMX.needSources = SMX.needSources || [];
  const allNeeds = (st) => { const out = []; for (const f of SMX.needSources) { try { out.push(...(f(st) || [])); } catch (e) { /* a chapter that fails adds nothing */ } } return out; };
  SMX.allNeeds = allNeeds;

  SMX.page({
    id: 'home', chapter: 'home', icon: 'home',
    title: 'Settings',
    purpose: (ctx) => `Everything for ${d.project(ctx.st)} and for Puppet Master itself. Search for anything, or start with what needs you.`,
    legacy: [['general', 'home']],
    lead: (ctx) => {
      const st = ctx.st; const needs = allNeeds(st);
      const ready = d.providers(st).filter(d.providerReady).length;
      const home = d.homeServer(st); const away = d.routeAway(st);
      // the last backup that ran, in PMConcept7's own words ("Today · 2:00 AM"): only the day is said here
      const ran = (((st.backup || {}).history || [])[0] || {}).time || '';
      const backup = ran ? String(ran).split(/\s*·\s*/)[0].toLowerCase() : 'none yet';
      const MOST = 8;
      const groups = [];
      let g = null;
      for (const c of SMX.chapters) { if (!g || g.name !== c.group) { g = { name: c.group, items: [] }; groups.push(g); } g.items.push(c); }
      const card = (c) => { let s = null; try { s = c.status ? c.status(ctx) : null; } catch (e) { s = null; } return `<button type="button" class="smx-chapter" data-smx-go="${h(c.id)}"><span class="smx-chapter-icon">${SMX.icon(c.icon)}</span><span class="smx-chapter-copy"><span class="smx-chapter-name">${h(c.title)}</span><span class="smx-chapter-blurb">${h(c.blurb || '')}</span></span>${s ? `<span class="smx-chapter-status">${ui.status(s.text, s.tone)}</span>` : ''}</button>`; };
      return [
        { key: 'summary', html: ui.summary({ icon: needs.some((n) => n.tone !== 'info') ? 'alert' : 'check', tone: needs.some((n) => n.tone !== 'info') ? 'attention' : 'ready', lines: [
          needs.length ? `Puppet Master is working. ${ui.b(needs.length === 1 ? 'One thing' : needs.length + ' things')} could use a moment of yours.` : 'Everything is set up and working.',
          `${ui.word(d.plural(ready, 'AI provider'), { go: 'ai' })} ready · projects kept on ${ui.word(home ? home.name : 'no computer yet', { go: 'computers' })} · away from home ${ui.word(away ? 'works' : 'not set up', { go: 'computers/away' })} · last backup ${ui.word(backup, { go: 'keeping' })}`
        ] }) },
        { key: 'needs', html: ui.needs(needs.slice(0, MOST)) + (needs.length > MOST ? ui.note(`${needs.length - MOST} more ${needs.length - MOST === 1 ? 'is' : 'are'} on the chapters marked with a dot in the list on the left.`) : '') },
        { key: 'tasks', html: ui.tasks([
          { icon: 'brain', title: 'Add an AI provider', sub: 'Sign in to one you pay for, or try the free ones', action: 'pm51-providers-add' },
          { icon: 'phone', title: 'Use it on another device', sub: 'Pair a phone, a tablet or another computer', action: 'pm51-servers-pair' },
          { icon: 'palette', title: 'Change how it looks', sub: 'Theme, wallpaper and text size', go: 'look' },
          { icon: 'shield', title: 'Choose what it may do', sub: 'What the assistant asks you before doing', go: 'safety' }
        ], { title: 'People often come here to' }) },
        ...groups.map((grp, i) => ({ key: 'chapters-' + i, html: `<section class="smx-chapters"><h3 class="smx-kicker">${h(grp.name)}</h3><div class="smx-chapter-grid">${grp.items.map(card).join('')}</div></section>` })),
        { key: 'setup', html: ui.card({ title: 'Setup and tour', help: 'Go through the first-time setup again, or let the tour show you around.', body: `<div class="smx-btn-row">${ui.btn({ label: 'Run setup again', icon: 'refresh', action: 'replay-onboarding' })}${ui.btn({ label: 'Start the Guided Tour', icon: 'play', action: 'restart-guided-tour' })}${ui.btn({ label: 'Pick up the tour where I left it', action: 'resume-guided-tour' })}</div>` }) }
      ];
    },
    changes: [
      { was: 'Settings Home opens with a headline about search (“Find anything. Configure the essentials first.”) and a paragraph explaining Settings.', now: 'It opens with whether everything works, in one sentence, and a second line that names the four things most setups depend on. Each word is a link.' },
      { was: 'Nine chapter cards repeat the chapter list that is already in the rail beside them, with the same descriptions and no state.', now: 'The chapter cards say their state (“Working”, “1 needs you”, “Not set up”), so Home is a status board, not a second menu.' },
      { was: '“Essential setup” appears on Home and again in the rail, with a third “Settings health” box; three warnings are listed with no button to fix them.', now: 'One “Needs you” list, each line with one button. The rail has no duplicate boxes.' },
      { was: 'Three separate rows for onboarding and the tour, one of them permanently disabled (“Resume the Guided Tour — No tour to pick up”).', now: 'One card, “Setup and tour”, at the bottom.' }
    ]
  });
})(window);
