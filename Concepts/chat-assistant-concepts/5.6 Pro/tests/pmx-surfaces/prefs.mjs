/* PREFS surfaces (DESIGN-SPEC 8.13, 8.14, 7.11): the ELI5 sheet in the states that matter, ELI5 in the chat
   (the "Simple explanation" tick and the change-point dividers after two flips), the recorded example's
   evidence page, the New chat defaults sheet (as it opens, after each row changes, and with an unavailable
   naming model beside an open Thought Stream: the tallest state), and the chat's name in the header (named,
   named by you, couldn't be named, and named after choosing another way from the warning). Owner: PREFS. New file under tests/: the root .gitignore ignores tests/, so landing needs
   `git add -f tests/pmx-surfaces/prefs.mjs`.

   ELI5 in the chat is driven through the real composer: the recorded example (eli5-demo-start override) makes
   two chats; Chat A is set to Simple through the ELI5 sheet, the question is sent, then Chat A follows its usual
   setting again and a second question is sent. That leaves exactly two dividers ("Simple explanations from here",
   "Back to standard explanations") and one reply marked "Simple explanation". */

const Q1 = 'Explain the retry limit.', Q2 = 'What does the zero limit do?';
/* DOM clicks (the same click path as a pointer click through the app's delegated handler), so a hover card or a
   leaving ghost over a button never stalls the harness on Playwright's actionability wait */
const tap = (h, sel) => h.ev(sel => { const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null); if (el) el.click(); return !!el; }, sel);

async function send(h, text) {
  await h.page.fill('textarea[data-input="composer"]', text);
  await h.wait(80);
  await tap(h, '[data-action="send"]');
  /* the recorded reply lands after the app's short think: wait until the last message is a finished reply */
  for (let i = 0; i < 60; i++) {
    const last = await h.ev(() => { const ms = window.PM56_EXT.ctx().thread.messages || []; const m = ms[ms.length - 1]; return m ? m.role + ':' + !!m.streaming : ''; });
    if (last === 'assistant:false' && i > 2) break;
    await h.wait(100);
  }
  await h.wait(150);
}
async function chooseInSheet(h, sel) {
  await tap(h, '.eli5-demo-guide [data-action="eli5-open"]');
  await h.wait(500);
  await tap(h, '#pmOverlayRoot ' + sel);
  await h.wait(300);
  await tap(h, '#pmOverlayRoot .pmx-primary');
  await h.wait(350);
}
async function twoFlips(h) {
  await chooseInSheet(h, '.pmx-switch-opt[data-value="on"]');
  await send(h, Q1);
  await chooseInSheet(h, '.pmx-word[data-value="inherit"]');
  await send(h, Q2);
  await h.ev(() => { const t = document.querySelector('.transcript'); if (t) t.scrollTop = t.scrollHeight; });
}

/* the reduced-motion census's state change for the chat: the style flips and one more turn arrives, so a new
   divider is created (appended directly: the census judges the divider and its turn, not the composer's send flight) */
async function flipTurn(h) {
  await h.ev(() => {
    const c = window.PM56_EXT.ctx(), E = window.PM56_ELI5, t = c.thread;
    E.setThread(t.id, !E.resolve(t.id).effective);
    const snap = JSON.stringify(E.resolve(t.id)), id = c.uid('pmxv-eli5');
    t.messages.push({ id: id + '-u', role: 'user', type: 'text', body: 'And once more, briefly?', explanationPreference: JSON.parse(snap) },
      { id: id + '-a', role: 'assistant', type: 'text', body: 'The limit you give is kept, even 0; 3 is used only when none is given.', explanationPreference: JSON.parse(snap) });
    c.renderApp();
  });
}

/* ---- New chat defaults (8.14). Its choices are the app's own settings, so every surface puts them back after
   itself (the ELI5 surfaces read "Off, set for all chats"). A choice goes through the preserved dropdown; the
   reduced-motion census's change goes through PM56_FEATURES.setDefault (the same guarded path, without the
   dropdown, whose own preserved motion is not the specimens' and is not judged here). */
async function pickIn(h, trigger, value) {
  await tap(h, '#pmOverlayRoot ' + trigger);
  await h.wait(420);
  await tap(h, '.overlay-menu [data-action="shared-choice-pick"][data-value="' + value + '"]');
  await h.wait(160);
}
const resetDefaults = h => h.ev(() => {
  const F = window.PM56_FEATURES && window.PM56_FEATURES.state(), c = window.PM56_EXT.ctx();
  if (F) { F.title.policy = 'default'; if (window.PM56_ELI5) window.PM56_ELI5.setApplication(false); else F.eli5.appDefault = false; }
  c.state.capabilities.thought = 'Auto';
  if (c.state.dialog && c.state.dialog.type === 'af-settings') c.renderApp();
});
function defaults(wand, id, o) {
  const s = wand(id, Object.assign({ group: 'preferences', sel: '[data-action="af-settings-open"]', canon: ['Thought Stream'] }, o, {
    async then(h) { await resetDefaults(h); await h.wait(60); if (o.then) await o.then(h); } }));
  const after = s.after;
  s.after = async h => { await resetDefaults(h); await after(h); };
  if (o.change) s.change = o.change;
  return s;
}
/* ---- the chat's name in the header (8.14, F0b's hooks): a new chat, its first message through the composer, then
   the state; `change` (the reduced-motion census) is "Name it for me", which names it again (the shimmer, then the
   new words and the width FLIP: all instant under reduced motion). Each open makes its own chat; after() removes it
   and goes back to the chat it started from. */
async function newChatAndAsk(h, text) {
  const was = await h.ev(() => { const id = window.PM56_EXT.ctx().thread.id; if (!window.__pmxvTitleHome) window.__pmxvTitleHome = id; return id; });
  /* any visible New thread button (the header's hides while the history drawer is pinned); failing that, the same
     new chat app.js's new-thread makes */
  await tap(h, '[data-action="new-thread"]');
  await h.wait(300);
  await h.ev(was => {
    const c = window.PM56_EXT.ctx();
    if (c.thread.id === was) {
      const id = c.uid('thread');
      c.state.threads.unshift({ id, title: 'New chat', status: 'idle', pinned: false, archived: false, updated: 'now', unread: 0, model: c.model && c.model.name, summary: 'New assistant conversation', messages: [] });
      c.switchThread(id); c.renderApp();
    }
    window.PM56_EXT.ctx().thread.pmxvTitle = true;
  }, was);
  await h.wait(120);
  await h.page.fill('textarea[data-input="composer"]', text);
  await h.wait(60);
  await tap(h, '[data-action="send"]');
  for (let i = 0; i < 60; i++) {
    const last = await h.ev(() => { const ms = window.PM56_EXT.ctx().thread.messages || []; const m = ms[ms.length - 1]; return m ? m.role + ':' + !!m.streaming : ''; });
    if (last === 'assistant:false' && i > 2) break;
    await h.wait(100);
  }
  await h.wait(700);
}
const nameAgain = h => h.ev(() => {
  const c = window.PM56_EXT.ctx(), F = window.PM56_FEATURES.state();
  if (F.title.policy !== 'default' && F.title.policy !== 'none' && !/^model:(haiku46|sonnet46)$/.test(F.title.policy)) F.title.policy = 'default';
  const b = document.createElement('button'); b.dataset.value = c.thread.id;
  window.PM56_EXT._actions['af-title-regenerate'](c, b, new Event('click'));
});
function titleSurface(id, title, setup) {
  return {
    id, title, kind: 'chat', tags: ['app', 'prefs'], canon: [], layouts: ['pinned', 'closed', 'w391', 'w311'],
    async open(h) { await h.closeAll(); await setup(h); await h.settle(); },
    change: nameAgain,
    async after(h) {
      await h.closeAll();
      await h.ev(() => {
        const c = window.PM56_EXT.ctx(), F = window.PM56_FEATURES.state(), home = window.__pmxvTitleHome;
        F.title.policy = 'default';
        const list = c.state.threads, gone = list.filter(t => t.pmxvTitle && t.id !== home).map(t => t.id);
        if (home && list.some(t => t.id === home)) c.switchThread(home);
        else if (gone.includes(c.thread && c.thread.id)) { const keep = list.find(t => !gone.includes(t.id)); if (keep) c.switchThread(keep.id); }
        for (let i = list.length - 1; i >= 0; i--) if (gone.includes(list[i].id)) list.splice(i, 1);
        gone.forEach(tid => { delete F.title.locks[tid]; delete F.title.attempts[tid]; delete F.title.pending[tid]; });
        c.renderApp();
      });
    }
  };
}

export default ({ wand, demo }) => [
  /* the sheet as it opens: the two voices, Follow my usual setting and the How it's decided trace (open unless the
     reader folds it; it fits the fixed 560 px) */
  wand('prefs:eli5', { group: 'assist', sel: '[data-action="eli5-open"]', title: 'ELI5 sheet: the two voices and How it’s decided (8.13)', canon: [] }),
  /* after a choice: Simple chosen (its words re-set once), then Follow my usual setting (one pulse along the trace) */
  wand('prefs:eli5-chosen', { group: 'assist', sel: '[data-action="eli5-open"]', title: 'ELI5 sheet after choosing Simple, then Follow my usual setting', canon: [],
    async then(h) {
      await h.clickVisible('#pmOverlayRoot .pmx-switch-opt[data-value="on"]'); await h.wait(700);
      await h.clickVisible('#pmOverlayRoot .pmx-word[data-value="inherit"]'); await h.wait(900);
    } }),
  /* How it's decided folded: the sheet keeps its height, the trace is gone */
  wand('prefs:eli5-folded', { group: 'assist', sel: '[data-action="eli5-open"]', title: 'ELI5 sheet with How it’s decided folded', canon: [],
    async then(h) { await h.clickVisible('#pmOverlayRoot .pmx-eli5-how > summary'); await h.wait(300); } }),
  /* the stale state: the chat changed while the sheet was open */
  wand('prefs:eli5-stale', { group: 'assist', sel: '[data-action="eli5-open"]', title: 'ELI5 sheet after the chat changed underneath it', canon: [], ledger: false,
    async then(h) {
      await h.ev(() => { const c = window.PM56_EXT.ctx(); const other = c.state.threads.find(t => t.id !== c.thread.id); if (c.state.dialog && other) { c.state.dialog.threadId = other.id; c.renderOverlays(); } });
      await h.wait(300);
    } }),
  /* in the chat: two flips leave two dividers and one reply marked Simple */
  demo('prefs:eli5-chat', { action: 'eli5-demo-start', flow: 'override', title: 'ELI5 in the chat: dividers where the style changes, the Simple explanation tick', canon: ['ELI5'],
    then: twoFlips, change: flipTurn }),
  /* the recorded example's evidence page (G-26): "Your code, unchanged" */
  demo('prefs:eli5-evidence', { action: 'eli5-demo-start', flow: 'override', kind: 'view', title: 'ELI5 evidence page: Your code, unchanged (G-26)', canon: ['ELI5'] }),

  /* New chat defaults as it opens: three questions, one plate of specimens */
  defaults(wand, 'prefs:defaults', { title: 'New chat defaults sheet (8.14)' }),
  /* after one change on each row: the voice re-sets, the thinking opens, the name plays its naming once; the census
     change picks the other voice (its re-set is instant under reduced motion) */
  defaults(wand, 'prefs:defaults-changed', { title: 'New chat defaults after a change on each row',
    async then(h) {
      await pickIn(h, '[data-field="eli5"]', 'on'); await h.wait(500);
      await pickIn(h, '[data-field="thought"]', 'Expanded'); await h.wait(500);
      await pickIn(h, '[data-action="af-title-pick-policy"]', 'model:haiku46'); await h.wait(900);
    },
    change: h => h.ev(() => window.PM56_FEATURES.setDefault('eli5', 'off')) }),
  /* the tallest state: a naming model that isn't available (the note under the row) beside an open Thought Stream;
     it is where "Choose another way" in the header lands, so it must not scroll either */
  defaults(wand, 'prefs:defaults-unavailable', { title: 'New chat defaults with an unavailable naming model and Always open',
    async then(h) {
      await pickIn(h, '[data-field="thought"]', 'Expanded'); await h.wait(500);
      await pickIn(h, '[data-action="af-title-pick-policy"]', 'model:opus5-personal'); await h.wait(900);
    },
    change: h => h.ev(() => { window.PM56_FEATURES.setDefault('title', 'model:haiku46'); window.PM56_FEATURES.setDefault('thought', 'Auto'); }) }),

  /* the chat's name in the header: named for you; named by you (the lock); couldn't be named (the warning) */
  titleSurface('prefs:title-named', 'Header: a new chat named after its first message', h => newChatAndAsk(h, 'Can you help me speed up the tenant analytics dashboard?')),
  titleSurface('prefs:title-locked', 'Header: a chat you named yourself (the lock)', async h => {
    await newChatAndAsk(h, 'Can you help me speed up the tenant analytics dashboard?');
    await h.ev(() => {
      const c = window.PM56_EXT.ctx(); c.state.dialog = { type: 'rename', threadId: c.thread.id, value: 'Dashboard speed notes' };
      window.PM56_EXT._actions['save-thread-name'](c, document.createElement('button'), new Event('click')); c.renderApp();
    });
    await h.wait(400);
  }),
  titleSurface('prefs:title-unavailable', 'Header: a chat that could not be named (the warning)', async h => {
    await h.ev(() => { window.PM56_FEATURES.state().title.policy = 'model:opus5-personal'; });
    await newChatAndAsk(h, 'Why is the export slow?');
  }),
  /* "Choose another way" ends in a name (review cycle 1): the warning opens New chat defaults, the reader picks
     Automatic, Done, and the chat is named (shimmer, then the words); the surface is the named header, and it
     fails outright if the chat is still unnamed or still warns */
  titleSurface('prefs:title-recovered', 'Header: a chat named after choosing another way from the warning', async h => {
    await h.ev(() => { window.PM56_FEATURES.state().title.policy = 'model:opus5-personal'; });
    await newChatAndAsk(h, 'Why is the export slow?');
    await tap(h, '.chat-header .pmx-chat-title-mark');
    await h.wait(700);
    await pickIn(h, '[data-action="af-title-pick-policy"]', 'default');
    await h.wait(300);
    await tap(h, '#pmOverlayRoot .pmx-primary');
    await h.wait(2400);
    const got = await h.ev(() => ({ title: window.PM56_EXT.ctx().thread.title, state: document.querySelector('.chat-header .chat-title')?.getAttribute('data-pmx-title-state') }));
    if (got.title === 'New chat' || got.state !== 'idle') throw new Error('title recovery: still ' + JSON.stringify(got));
  })
];
