/* wonderer-grill-demos.js - Demo Studio: Wonderer and Grill Me (DL-218, 2026-10-20). Three recorded examples, one per
 * place the decision shows that is not a BrainStorm (BrainStorm's lives in lens-wonderer-batch13.js and is offered here
 * too): a Crew that grills you before it splits the job, with the Wonderer alongside; a Chat Room whose Moderator grills
 * you before round 1; and a Deep Plan where the assistant grills you (APR-072). Everything is pre-written: no provider,
 * network or native call. Each flow drives the real owners (crew-protocol.js, room-protocol.js, the lead engine and the
 * Grill Me engine through PM56_WG), one step at a time on a 450 ms tick that waits whenever the next move is yours
 * (answering a round, Confirm, Check it), and a guide in the dock narrates the next step and can take it for you
 * ("Do this step" presses the same control you would). */
(function () {
  'use strict';
  var E = window.PM56_EXT; if (!E || !E.slot) return;
  function C() { return window.PM56_COLLAB; }
  function WG() { return window.PM56_WG; }
  function S() { return window.PM56_SHELL; }
  function ctx() { return E.ctx(); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function ms(v) { var K = window.PM56_CLOCK; return K && K.ms ? K.ms(v) : v; }
  var active = null, serial = 0, timer = 0;

  var flows = {
    crew: { label: 'A Crew that grills you first, with a Wonderer alongside', detail: 'Grill Me before the split → leads decided as they arrive → pass 2 queues for a slot → one later decision gates only the export' },
    room: { label: 'A Chat Room with a Wonderer and Grill Me', detail: 'The Moderator grills you → round 1 starts on time → the leads join between turns → you Check one → every lead in the summary' },
    brainstorm: { label: 'A BrainStorm weighs the Wonderer’s leads', detail: 'Grill Me at intake → the first pass runs then, held until every proposal is in → Write the plan waits for a pass, a decision, research' },
    deepplan: { label: 'Deep Plan with Grill Me', detail: 'The assistant grills you round by round → it waits while it looks a fact up → What we agreed → Confirm → one plan' }
  };

  /* ================================================================ fixtures */
  var GRILL = {
    crew: [
      { id: 'd-file', title: 'The file', prompt: 'Export one CSV file with a header row (id, title)?', why: 'It sets what the Integrator puts together at the end.',
        options: [{ label: 'Yes, one CSV with a header row', description: 'Most importers expect the header.' }, { label: 'A CSV without a header row' }, { label: 'An Excel workbook instead' }], recommended: 'Yes, one CSV with a header row' },
      { id: 'd-order', title: 'Row order', prompt: 'Keep the records in the order they arrive?', why: 'The order is part of what “without losing” means.',
        options: [{ label: 'Yes, keep the input order' }, { label: 'Sort by title' }, { label: 'Sort by id' }], recommended: 'Yes, keep the input order' },
      { id: 'd-trim', title: 'Titles', prompt: 'Trim the spaces around each title?', why: 'Two titles start or end with spaces.',
        options: [{ label: 'Yes, trim the outer spaces', description: 'Spaces inside a title stay.' }, { label: 'Keep titles exactly as typed' }], recommended: 'Yes, trim the outer spaces' },
      { id: 'f-ending', kind: 'fact', title: 'Line endings the importers expect' },
      { id: 'd-quote', title: 'Quoting', prompt: 'Quote only the cells that need it (commas, quotes, line breaks)?', why: 'Asked now that the file is settled.', dependsOn: ['d-file'],
        options: [{ label: 'Yes, only where needed' }, { label: 'Quote every cell' }], recommended: 'Yes, only where needed' },
      { id: 'd-ending', title: 'Line endings', prompt: 'Use CRLF line endings, the ones the importers expect?', why: 'Research found what the importers expect, so this is a choice now, not a fact to ask you.', dependsOn: ['f-ending'],
        options: [{ label: 'Yes, CRLF' }, { label: 'LF only' }], recommended: 'Yes, CRLF' }
    ],
    room: [
      { id: 'd-button', title: 'The Search button', prompt: 'Keep the visible Search button where it is?', why: 'People who never learn a shortcut still need to find search.',
        options: [{ label: 'Yes, keep it where it is' }, { label: 'Move it into the toolbar' }], recommended: 'Yes, keep it where it is' },
      { id: 'd-shortcut', title: 'A shortcut', prompt: 'Offer a keyboard shortcut as a second way in?', why: 'Frequent users asked for one.',
        options: [{ label: 'Yes, add one' }, { label: 'No shortcut' }], recommended: 'Yes, add one' },
      { id: 'f-keys', kind: 'fact', title: 'Keys the app already uses' },
      { id: 'd-key', title: 'Which key', prompt: 'Use / for the shortcut?', why: 'Research found / is free; Ctrl+K already opens the command menu.', dependsOn: ['d-shortcut', 'f-keys'],
        options: [{ label: 'Yes, use /' }, { label: 'Use Ctrl+K' }, { label: 'Use both' }], recommended: 'Yes, use /' }
    ],
    deepplan: [
      { id: 'd-where', title: 'Where search runs', prompt: 'Keep the search entirely on this device, with no upload?', why: 'It decides every option the plan can choose from.',
        options: [{ label: 'Yes, nothing leaves the device' }, { label: 'Allow an upload for big collections' }], recommended: 'Yes, nothing leaves the device' },
      { id: 'd-rank', title: 'Ranking', prompt: 'Keep today’s result ranking?', why: 'Changing it would change what people see first.',
        options: [{ label: 'Yes, keep today’s ranking' }, { label: 'Rank by recency instead' }], recommended: 'Yes, keep today’s ranking' },
      { id: 'f-size', kind: 'fact', title: 'How big a typical collection is' },
      { id: 'd-target', title: 'Size to stay fast for', prompt: 'Stay fast up to 10,000 items?', why: 'Research found a typical collection holds about 2,000 items.', dependsOn: ['f-size'],
        options: [{ label: 'Yes, up to 10,000 items' }, { label: 'Up to 100,000 items' }, { label: 'Whatever fits on the device' }], recommended: 'Yes, up to 10,000 items' },
      { id: 'd-fallback', title: 'Fallback', prompt: 'Keep the plain local filter as the fallback?', why: 'Asked now that search stays on the device.', dependsOn: ['d-where'],
        options: [{ label: 'Yes, keep it as the fallback' }, { label: 'No fallback' }], recommended: 'Yes, keep it as the fallback' },
      { id: 'd-measure', title: 'Measuring', prompt: 'Measure on the slowest supported device before choosing a default?', why: 'Asked now that the size is settled.', dependsOn: ['d-target'],
        options: [{ label: 'Yes, measure first' }, { label: 'Pick a default now' }], recommended: 'Yes, measure first' }
    ]
  };
  var FACTS = { crew: ['f-ending', 'CRLF, the line ending RFC 4180 names', 8000], room: ['f-keys', '/ is free; Ctrl+K opens the command menu', 1600], deepplan: ['f-size', 'about 2,000 items, the median of the collection stats', 7000] };
  /* Grill Me turned on mid-run (CWR-042): the decision the Coordinator or the Moderator asks at the next boundary */
  /* the Crew's question is the one the gated part turns on (Astra F8): whichever part the next claim is, the question is
     about that part, and only that part waits for its Confirm */
  var CREW_MID = {
    normalize: { id: 'd-trim-mid', title: 'Titles', prompt: 'Trim only the spaces around each title, leaving the words inside as they are?', why: 'The next part normalizes the titles. The parts already running keep going; only this one waits for you.',
      options: [{ label: 'Yes, only the outer spaces' }, { label: 'Also collapse spaces inside' }], recommended: 'Yes, only the outer spaces' },
    quoting: { id: 'd-quote-mid', title: 'Quoting', prompt: 'Quote only the cells that need it (commas, quotes, line breaks)?', why: 'The next part checks how the cells are quoted. The parts already running keep going; only this one waits for you.',
      options: [{ label: 'Yes, only where needed' }, { label: 'Quote every cell' }], recommended: 'Yes, only where needed' },
    export: { id: 'd-order-mid', title: 'Row order', prompt: 'Keep the rows in the order the collection lists them?', why: 'The next part assembles the file from the checked parts. The parts already running keep going; only this one waits for you.',
      options: [{ label: 'Yes, keep the input order' }, { label: 'Sort them by title' }], recommended: 'Yes, keep the input order' }
  };
  function crewMid(gate, r) {
    var id = String(gate || '').replace(/^part:/, ''), a = ((r && r.crew && r.crew.assignments) || []).filter(function (x) { return x.id === id; })[0];
    if (CREW_MID[id]) return [clone(CREW_MID[id])];
    if (a && a.leadId) return [{ id: 'd-lead-mid', title: a.title, prompt: 'Have the helper checking ' + a.title.replace(/^Explore /, '') + ' cite a source for what it finds?', why: 'The next part checks a Wonderer lead read-only. The parts already running keep going; only this one waits for you.',
      options: [{ label: 'Yes, cite a source' }, { label: 'Its own check is enough' }], recommended: 'Yes, cite a source' }];
    return null;
  }
  var MIDRUN = {
    crew: crewMid,
    room: [{ id: 'd-optional', title: 'The shortcut', prompt: 'Keep any shortcut optional, with a way to turn it off?', why: 'The next round weighs the shortcut. This round goes on; only the next one waits for you.',
      options: [{ label: 'Yes, optional and easy to turn off' }, { label: 'Always on' }], recommended: 'Yes, optional and easy to turn off' }]
  };
  /* a later decision asked mid-run (steer 2026-10-20): its own small round and What we agreed, gating only the export */
  var LATER = [{ id: 'd-bom', title: 'Byte order mark', prompt: 'Leave the byte order mark out of the file?', why: 'The Integrator writes the file next. Some spreadsheet apps want one for accented letters; these two titles have none. Nothing else waits on this.',
    options: [{ label: 'Yes, leave it out' }, { label: 'Add one' }], recommended: 'Yes, leave it out' }];
  var PASSES = {
    crew: [
      { summary: 'Explored the ground around exporting a small collection to CSV: where spreadsheets treat text as code, how CSV became a standard late, where size starts to matter, and what happens to a file after it leaves.',
        angles: [{ key: 'adjacent', signal: 'strong: spreadsheets run some cells' }, { key: 'history', signal: 'CSV was written down only in 2005' }, { key: 'scale', signal: 'weak for two records' }, { key: 'human', signal: 'people reopen and resave exports' }],
        leads: [
          { id: 'l1', check: { outcome: 'supported', note: 'A title starting with =, +, − or @ would run as a formula; neither title does, and the handoff now warns about it.', evidence: { label: 'OWASP: CSV injection', url: 'https://owasp.org/www-community/attacks/CSV_Injection' } }, angle: 'adjacent', title: 'Spreadsheets run a cell that starts with =, +, − or @ as a formula.', tether: 'The titles are free text, and whoever opens the export may open it in a spreadsheet.',
            source: { kind: 'url', url: 'https://owasp.org/www-community/attacks/CSV_Injection', label: 'owasp.org · CSV injection' },
            dossier: { found: 'Security guides call this CSV injection; a title like “=HYPERLINK(…)” becomes live.', why: 'It turns a text export into something that can act.', next: 'Whether either title starts with one of those characters.' } },
          { id: 'l2', check: { outcome: 'supported', note: 'RFC 4180 names the quoting rule and the CRLF line ending the importers expect; the export follows both.', evidence: { label: 'RFC 4180, section 2', url: 'https://www.rfc-editor.org/rfc/rfc4180#section-2' } }, angle: 'history', title: 'RFC 4180 wrote CSV down in 2005, after decades of tools that each quoted differently.', tether: 'The importers that read this file may each follow their own dialect.',
            source: { kind: 'url', url: 'https://www.rfc-editor.org/rfc/rfc4180', label: 'rfc-editor.org · RFC 4180' },
            dossier: { found: 'One short document names the quoting rule and the CRLF line ending.', why: 'It gives the Crew one reference to check against.', next: 'Nothing; use it as the reference.' } },
          { id: 'l3', check: { outcome: 'not_supported', note: 'At two records the whole file is a few hundred bytes; streaming changes nothing for this job.' }, angle: 'scale', title: 'At a few rows, streaming a file is overkill; at millions it is the only way.', tether: 'The job exports two records today, but the same code may export a whole library later.',
            source: { kind: 'url', url: 'https://en.wikipedia.org/wiki/Comma-separated_values', label: 'wikipedia.org · Comma-separated values' },
            dossier: { found: 'Large exports stream row by row instead of building the file in memory.', why: 'It bounds when the design would need to change.', next: 'Only if the export grows.' } },
          { id: 'l4', check: { outcome: 'supported', note: 'Opening and resaving in a spreadsheet rewrote the quotes in the sample file; the handoff note stays.', evidence: { label: 'Microsoft Support: import or export text or CSV files', url: 'https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba' } }, angle: 'human', title: 'People often open an exported CSV in a spreadsheet and save it again, which rewrites its quotes.', tether: 'Whoever receives the file may round-trip it before it reaches an importer.',
            source: { kind: 'url', url: 'https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba', label: 'support.microsoft.com · Import or export text or CSV files' },
            dossier: { found: 'Spreadsheets save CSV in their own dialect.', why: 'The quotes the Crew keeps can still be lost after it.', next: 'A note in the handoff.' } }
        ] },
      { summary: 'A second pass, asked for by the CSV specialist, around line breaks inside a cell: tools that claim CSV support but break on them, exports that dodge quoting, and what a trusted export leads to.',
        angles: [{ key: 'contradiction', signal: 'strong: “supports CSV” often means “no line breaks”' }, { key: 'inversion', signal: 'drop the quotes instead' }, { key: 'future', signal: 'an import comes next' }],
        leads: [
          { id: 'l5', check: { outcome: 'not_supported', note: 'Neither title has a line break, so nothing in this export trips over it.' }, angle: 'contradiction', title: 'Many tools that say they read CSV break on a line break inside a quoted cell.', tether: 'If a title held a line break, the export could be right and still fail to import.',
            source: { kind: 'url', url: 'https://www.rfc-editor.org/rfc/rfc4180#section-2', label: 'rfc-editor.org · RFC 4180, section 2' },
            dossier: { found: 'The standard allows line breaks in quoted cells; many readers do not.', why: 'It is the gap between correct and compatible.', next: 'Whether either title contains a line break.' } },
          { id: 'l6', check: { outcome: 'not_supported', note: 'Stripping commas and quotes would change both titles; the job forbids losing them.' }, angle: 'inversion', title: 'Some exports avoid quoting entirely by stripping commas and quotes from the text.', tether: 'It is the opposite of what the job asks: keep every comma and quote.',
            source: { kind: 'message', role: 'CSV specialist', label: 'the CSV specialist’s question' },
            dossier: { found: 'Stripping is common in quick scripts.', why: 'It names the shortcut the Crew must not take.', next: 'Nothing.' } },
          { id: 'l7', check: { outcome: 'not_supported', note: 'Nothing in this job asks for an import; the format chosen still suits one later.' }, angle: 'future', title: 'Once an export is trusted, people ask for an import of the same file.', tether: 'The format chosen now becomes the format an import must read.',
            source: { kind: 'url', url: 'https://en.wikipedia.org/wiki/Comma-separated_values', label: 'wikipedia.org · Comma-separated values' },
            dossier: { found: 'Exports and imports tend to arrive as a pair.', why: 'It argues for a format an import can trust.', next: 'Keep it for the next request.' } }
        ] }
    ],
    room: [
      { summary: 'Explored the ground around reaching search: the shortcut the web settled on, who single-key shortcuts get in the way of, how apps teach a key, and a way in that needs no key at all.',
        angles: [{ key: 'history', signal: 'strong: / became the web’s search key' }, { key: 'human', signal: 'single-key shortcuts and assistive tech' }, { key: 'adjacent', signal: 'games print the key on the button' }, { key: 'inversion', signal: 'no shortcut at all' }],
        leads: [
          { id: 'r1', dossier: { found: 'GitHub, Gmail and YouTube all move focus to search on /.', why: 'People may already know the key.', next: 'Whether / is free in this app.' }, check: { outcome: 'supported', note: 'GitHub’s and Gmail’s published shortcut lists both use / for search.', evidence: { label: 'GitHub Docs: keyboard shortcuts', url: 'https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts' } }, angle: 'history', title: 'Web apps from GitHub to Gmail settled on / to jump to search.', tether: 'The room is choosing a key for search; people may already know this one.',
            source: { kind: 'url', url: 'https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts', label: 'docs.github.com · Keyboard shortcuts' } },
          { id: 'r2', dossier: { found: 'WCAG 2.1 success criterion 2.1.4 asks that single-key shortcuts can be turned off or remapped.', why: 'A / shortcut is exactly that kind.', next: 'Put the setting in the plan.' }, check: { outcome: 'supported', note: 'Single-key shortcuts must be possible to turn off or remap, so the setting goes in the plan.', evidence: { label: 'WCAG 2.1, character key shortcuts', url: 'https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html' } }, angle: 'human', title: 'Single-key shortcuts must be possible to turn off or remap for people using speech input.', tether: 'A / shortcut is a single-key shortcut.',
            source: { kind: 'url', url: 'https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html', label: 'w3.org · Character key shortcuts' } },
          { id: 'r3', dossier: { found: 'Editors open a command palette with one shortcut and search inside it.', why: 'Search might need no key of its own.', next: 'Whether the palette is reachable without a key.' }, check: { outcome: 'not_supported', note: 'A command palette still needs a key to open, so it doesn’t replace the shortcut.' }, angle: 'inversion', title: 'Instead of a shortcut, open search from a command palette that already has a key.', tether: 'Reaching search might need no new key at all.',
            source: { kind: 'url', url: 'https://en.wikipedia.org/wiki/Command_palette', label: 'wikipedia.org · Command palette' } },
          { id: 'r4', dossier: { found: 'Games and some editors print an action’s key on its button.', why: 'The button can teach the shortcut to people who never read a list.', next: 'How the key reads on a small button.' }, check: { outcome: 'supported', note: 'A key printed on the button reads at the size of the Search button in both themes tried.', evidence: { label: 'Wikipedia: keyboard shortcut', url: 'https://en.wikipedia.org/wiki/Keyboard_shortcut' } }, angle: 'adjacent', title: 'Games print the key for an action right on its button.', tether: 'The visible Search button could teach the shortcut.',
            source: { kind: 'url', url: 'https://en.wikipedia.org/wiki/Keyboard_shortcut', label: 'wikipedia.org · Keyboard shortcut' } }
        ] },
      { summary: 'A second pass, asked for by Product, around how people find a shortcut they don’t know yet.', stopReason: 'new searches kept returning shapes it had already seen, so it stopped rather than pad the list.',
        angles: [{ key: 'human', signal: 'a hint at the moment of need' }, { key: 'adjacent', signal: 'menus that show their keys' }, { key: 'future', signal: 'nothing new' }],
        leads: [
          { id: 'r5', dossier: { found: 'Shortcuts shown at the moment someone uses the slow way are learned more often.', why: 'Clicking Search is that moment.', next: 'A hint on hover or after a click.' }, check: { outcome: 'supported', note: 'Discoverability guidance puts the hint at the moment of the slow action, which the hover card does.', evidence: { label: 'Wikipedia: discoverability', url: 'https://en.wikipedia.org/wiki/Discoverability' } }, angle: 'human', title: 'People learn a shortcut when it is shown at the moment they use the slow way.', tether: 'Clicking the Search button is that moment.',
            source: { kind: 'url', url: 'https://en.wikipedia.org/wiki/Discoverability', label: 'wikipedia.org · Discoverability' } },
          { id: 'r6', dossier: { found: 'Desktop menus list each item’s key beside it.', why: 'It is the same teaching move as the button.', next: 'Nothing new beyond the hover card.' }, check: { outcome: 'not_supported', note: 'This app has no menu for search, so the hover card already covers it.' }, angle: 'adjacent', title: 'Desktop menus list each item’s key beside it.', tether: 'A hover card on the Search button could do the same.',
            source: { kind: 'url', url: 'https://en.wikipedia.org/wiki/Menu_(computing)', label: 'wikipedia.org · Menu' } }
        ] }
    ]
  };
  /* the room's recorded replies: round 1 takes up three leads; round 2 brings two results back */
  function roomFixture() {
    return { topic: 'Make search easier to reach', summary: 'Keep a visible Search button. Offer / as an optional shortcut, show the key on the button, and let people turn the shortcut off.', rounds: [
      ['Keep the visible Search button exactly where it is, so search stays easy to find for everyone.', 'Make / the shortcut: the web already taught people that key, so it should stay optional but familiar.', 'Don’t fire the shortcut while someone is typing, and let people turn a single-key shortcut off for speech input.'],
      ['Print the / key on the Search button, the way games show their keys. Wonderer, look wider around how people find a shortcut they don’t know yet.', 'Checked the palette idea: a command palette still needs a key to open, so it doesn’t remove the question. Not a reason to drop /.', 'Checked the guideline: single-key shortcuts must be possible to turn off or remap. So the setting goes in the plan.']
    ] };
  }

  /* ================================================================ shared bits */
  function newThread(flow, base, body) {
    var c = ctx(), tid = 'wg-demo-' + flow + '-' + (++serial), t = clone(c.state.threads.filter(function (x) { return x.id === base; })[0] || c.state.threads[0]);
    Object.assign(t, { id: tid, title: flows[flow].label + ' · recorded example', status: 'ready', pinned: false, archived: false, goalId: null, messages: [{ id: tid + '-request', role: 'user', type: 'text', body: body }] });
    c.state.threads.push(t);
    Object.assign(c.state, { demoOpen: false, menu: null, dialog: null, hover: null, historyMode: 'closed', editorTabs: [], activeEditor: null, editorRevealed: false, composer: '', decision: null });
    c.state.activity.open = false; c.state.capabilities.goal = false;
    c.state.work = { step: 0, running: false, expanded: false, started: false, completed: false, elapsed: 0, openPhase: null };
    window.PM56_RUNTIME.composer.destination = null;
    return tid;
  }
  function stop() { if (timer) clearInterval(timer); timer = 0; }
  function arm() { stop(); timer = setInterval(tick, ms(450)); }
  function current() { if (!active || !active.runId) return null; return C().run(active.runId); }
  function at(key, wait) { var s = active, t = Date.now(); s.at = s.at || {}; if (s.at[key] == null) { s.at[key] = t; return false; } return t - s.at[key] >= ms(wait); }
  function say(r, body, o) { var m = C().appendMessage(r.id, Object.assign({ senderKind: 'coordinator', senderName: WG().leadName(r), messageType: 'message', body: body }, o || {})); return m; }
  function fail(code) { if (active) active.error = code; stop(); render(); }
  function render() { var c = ctx(); c.renderApp(); c.renderOverlays(); }
  /* the n-th pass this recording asked for, by the id its request returned: a pass you asked for in between never shifts
     the script (R3, M1) */
  function passOf(r, n) { var w = WG().engine.state(r), id = active && active.passIds ? active.passIds[n] : null; return w && id ? w.passes.filter(function (x) { return x.id === id; })[0] || null : null; }
  function deliverPass(r, n) {
    var pass = passOf(r, n); if (!pass) return { ok: true };
    var spec = clone(PASSES[active.flow][n]);
    spec.leads.forEach(function (l) {
      if (l.source.kind !== 'message') return;
      /* a lead that grew from the message asking for this pass cites that message; else the run's first words */
      var m = l.source.role ? r.messages.filter(function (x) { return x.id === pass.askedIn; })[0] : r.messages.filter(function (x) { return x.senderKind === 'user' || x.senderKind === 'coordinator'; })[l.source.index || 0];
      l.source = m ? { kind: 'message', messageId: m.id, label: l.source.label } : { kind: 'url', url: 'https://en.wikipedia.org/wiki/Comma-separated_values', label: 'wikipedia.org' };
    });
    return WG().deliverPass(r, pass.id, spec);
  }

  /* ================================================================ the Crew */
  var CREW_DECIDE = [
    ['l1', 'explore', 'Worth a read-only check before the export ships.', { slot: 1, finding: { outcome: 'supported', note: 'A title starting with = would run in a spreadsheet; neither title does, and the handoff now says so.', evidence: { label: 'OWASP: CSV injection', url: 'https://owasp.org/www-community/attacks/CSV_Injection' } } }],
    ['l2', 'use', 'Use RFC 4180 as the reference for quoting and line endings.'],
    ['l3', 'set_aside', 'Two records: size isn’t a risk for this job.'],
    ['l4', 'use', 'Put it in the handoff: quotes must survive a spreadsheet round trip.']
  ];
  var CREW_DECIDE2 = [
    ['l5', 'explore', 'If a title holds a line break, we need to know before export.', { slot: 0, finding: { outcome: 'not_supported', note: 'Neither title has a line break, so nothing in this export trips over it.' } }],
    ['l6', 'set_aside', 'Stripping quotes loses data; the job forbids it.'],
    ['l7', 'use', 'Worth keeping for the next request; nothing changes now.']
  ];
  function crewStart() {
    var CD = window.PM56_CREW_DEMOS, fx = CD.fixture();
    var tid = newThread('crew', 'query', fx.objective + ' Ask me what you need to know first.');
    active = { flow: 'crew', threadId: tid, runId: null, step: 0, at: {}, error: null };
    ctx().state.mode = 'Agent';
    ctx().switchThread(tid);
    crewConfigure(); arm();
  }
  function crewConfigure() {
    var CD = window.PM56_CREW_DEMOS, c = ctx(), fx = CD.fixture();
    C().openConfigure('crew');
    var d = C().draft();
    d.name = 'Prepare a collection export'; d.nameEdited = true; d.purpose = fx.objective;
    d.config.parallelism = 2; d.config.coordinator = 'parent_assistant'; d.config.assignmentStrategy = 'explicit_static';
    d.rows.forEach(function (r, i) { r.role = ['Data mapper', 'CSV specialist', 'Integrator'][i] || r.role; });
    d.crewInput = fx; d.requestKey = active.threadId + ':wg'; d.threadId = active.threadId;
    d.wonderer = true; d.grillMe = true; d.recordedSpecialists = true;
    if (C().markRecorded) C().markRecorded(d);
    c.openDialog({ type: 'collab-configure' }); c.renderApp();
  }
  document.addEventListener('pm56:crew-example-admitted', function (e) {
    if (!active || active.flow !== 'crew' || active.runId) return;
    var r = C().run(e.detail && e.detail.runId); if (!r || r.threadId !== active.threadId) return;
    active.runId = r.id;
    begin(r, 'crew');
  });
  /* the run starts: the Wonderer's first pass starts with it, and the one who talks to you starts grilling you. Each
     switch is respected (R6): with the Wonderer removed its steps are skipped, with Grill Me off nobody grills you */
  function begin(r, flow) {
    var wg = WG(); active.passIds = [];
    if (wg.wondererP(r)) {
      var p1 = wg.startPass(r, { kind: 'start' }); active.passIds[0] = p1.ok ? p1.pass.id : null;
      /* the recording asks for its one further pass itself; the leads it checks itself stay with it */
      wg.reservePasses(r, 1); wg.scriptChecks(r, flow === 'room' ? ['r2', 'r3'] : ['l1', 'l5']);
    }
    wg.setMidRunFixture(r, MIDRUN[flow]);
    if (wg.grillOn(r)) { var res = wg.begin('run:' + r.id, { by: wg.leadRole(r), subject: r.purpose, tree: clone(GRILL[flow]) }); if (!res.ok) return fail(res.error); }
    active.at = { start: Date.now() };
    arm(); render();
  }
  function hasW(r) { return !!WG().engine.state(r); }
  function envelope(r) { return { epoch: r.stopEpoch, sourceHash: r.crew.input.sourceHash }; }
  function crewTick(r) {
    var W = window.PM56_CREW, wg = WG(), s = r.grill;
    /* the interview: the fact research finds, while you answer round 1 */
    if (s && s.tree.some(function (n) { return n.id === FACTS.crew[0] && n.state === 'researching'; }) && at('fact', FACTS.crew[2])) { wg.factFound('run:' + r.id, FACTS.crew[0], FACTS.crew[1]); render(); return; }
    if (hasW(r)) wg.pump(r);
    /* the Wonderer explores alongside, from the start */
    if (passOf(r, 0) && passOf(r, 0).status === 'exploring' && at('pass1', 2600)) { if (!deliverPass(r, 0).ok) return fail('pass_1'); render(); return; }
    if (wg.holds(r) || r.status === 'paused') return;
    /* a later session gates only its own step: everything else in the script keeps going */
    if (r.status !== 'running') { if (r.status === 'completed') stop(); return; }
    var steps = active.steps || (active.steps = crewScript(r));
    var st = steps[active.step]; if (!st) { stop(); return; }
    if (st.wait && !at('step' + active.step, st.wait)) return;
    var out = st.run(r, W, wg);
    if (out === 'later') return;
    if (out && out.ok === false) {
      if (/concurrency_full|dependencies_pending|waiting_for_wonderer_first_pass|research_running|grill_me_waits_for_confirm|pass_running/.test(out.error)) return;
      return fail(out.error);
    }
    active.step++; render();
  }
  function crewScript(r) {
    var steps = [], p = function (i) { return r.participants[i]; }, key = 'run:' + r.id;
    var decide = function (x, when) {
      return { wait: 650, run: function (r, W, wg) {
        if (!hasW(r) || !wg.engine.lead(r, x[0])) return true;
        var res = wg.dispose(r, x[0], x[1], x[2]); if (!res.ok) return res;
        var l = wg.engine.lead(r, x[0]);
        say(r, 'Lead ' + l.n + ', “' + l.title.replace(/\.$/, '') + '”: ' + ({ explore: 'explore', use: 'use', set_aside: 'set aside' })[x[1]] + '. ' + x[2] + (x[1] === 'explore' ? ' It becomes a read-only part for the ' + p(x[3].slot).role + '.' : ''));
        if (x[1] === 'explore') { var a = W.addExploration(r.id, x[0], x[3].slot, x[3].finding); if (!a.ok) return a; }
        return true;
      } };
    };
    /* an exploration part exists only if its lead was explored (no Wonderer, no exploration parts) */
    var has = function (r, id) { return r.crew.assignments.some(function (a) { return a.id === id; }); };
    var claim = function (id) { return { wait: 650, run: function (r, W) { if (!has(r, id)) return true; return W.claim(r.id, id, envelope(r)); } }; };
    var deliver = function (id) { return { wait: 700, run: function (r, W) { if (!has(r, id)) return true; var x = W.deliver(r.id, id, W.payload(r.id, id)); if (hasW(r)) WG().pump(r); return x; } }; };
    /* the first pass arrived before the split; the Coordinator decides each of its leads while it splits the job */
    steps.push({ wait: 500, run: function (r) { if (!hasW(r)) return true; if (!passOf(r, 0) || passOf(r, 0).status === 'exploring') return 'later'; say(r, 'Thanks, that settles it. Before I split the job I’m deciding each of the Wonderer’s four leads.'); return true; } });
    CREW_DECIDE.forEach(function (x) { steps.push(decide(x)); });
    steps.push(claim('normalize'), claim('quoting'));
    /* both slots are taken, so the pass the CSV specialist asks for queues behind the parts (steer 2026-10-20) */
    steps.push({ wait: 800, run: function (r, W, wg) {
      var wp = wg.wondererP(r); if (!wp) return true;
      var m = C().appendMessage(r.id, { senderKind: 'participant', senderId: p(1).id, senderName: p(1).role, messageType: 'request', recipientIds: [wp.id], body: 'Wonderer, look wider around line breaks inside a cell: what do other tools do with them?' });
      var res = wg.startPass(r, { kind: 'participant', id: p(1).id, name: p(1).role }, 'line breaks inside a cell', m.id, { scripted: true });
      if (res.ok) active.passIds[1] = res.pass.id;
      return res;
    } });
    steps.push({ wait: 900, run: function (r, W, wg) {
      var m = C().appendMessage(r.id, { senderKind: 'participant', senderId: p(1).id, senderName: p(1).role, messageType: 'message', body: 'Checking the quoting cases against RFC 4180, as the Coordinator said: commas, quotes and line breaks each come back unchanged.' });
      if (hasW(r) && wg.engine.lead(r, 'l2')) wg.engine.takeUp(r, 'l2', m.id, { id: p(1).id }); return true;
    } });
    steps.push(deliver('normalize'), deliver('quoting'), claim('explore-l1'));
    /* pass 2 lands; the Coordinator decides each lead on delivery */
    steps.push({ wait: 1800, run: function (r) { var q = passOf(r, 1); if (!q) return true; if (q.status !== 'exploring') return q.status === 'queued' ? 'later' : true; return deliverPass(r, 1); } });
    steps.push({ wait: 500, run: function (r) { var q = passOf(r, 1); if (q && q.status === 'delivered') say(r, 'The Wonderer’s second pass is in. Deciding its three leads now.'); return true; } });
    CREW_DECIDE2.forEach(function (x) { steps.push(decide(x)); });
    /* a later decision asked mid-run: its own small round and What we agreed, gating only the export part */
    steps.push({ wait: 700, run: function (r) {
      /* with Grill Me off a decision only you can make would reach you as the ordinary needs-you prompt (DL-138);
         this recording's file needs none, so it goes on */
      if (!WG().grillOn(r)) return true;
      say(r, 'One decision for you before the Integrator writes the file. The explorations keep going while you answer; only the export part waits.');
      var res = WG().begin(key, { by: 'coordinator', subject: 'the export', tree: clone(LATER), gate: 'part:export', gateLabel: 'the export part' });
      return res.ok ? true : res;
    } });
    steps.push(deliver('explore-l1'), claim('explore-l5'), deliver('explore-l5'), claim('export'));
    steps.push({ wait: 300, run: function (r) {
      var later = WG().sessionsOf(r).filter(function (x) { return x.gate === 'part:export'; })[0], a = later && WG().grill.agreed(later).decisions[0];
      if (a && a.took !== 'recommended') say(r, 'Noted: “' + a.answer + '”. This recording’s file was written without one; a real Crew would follow your answer.');
      return true;
    } });
    steps.push(deliver('export'));
    steps.push({ wait: 700, run: function (r, W) { return W.finalize(r.id, envelope(r)); } });
    return steps;
  }

  /* ================================================================ the Chat Room */
  var ROOM_TAKEUP = { 1: { 1: ['r1'], 2: ['r2'] }, 2: { 0: ['r4'] } };
  /* the Moderator decides each lead as it arrives (steer 2026-10-20), between turns */
  var ROOM_DECIDE = { r1: ['use', 'Backs / as the key people already know.'], r2: ['explore', 'If a single-key shortcut must be possible to turn off, the plan has to say so.'], r3: ['set_aside', 'A palette still needs a key of its own; it doesn’t answer the question.'], r4: ['use', 'Supports printing the key on the button.'],
    r5: ['use', 'A hover card on the button is that moment; the room keeps it as a hypothesis.'], r6: ['set_aside', 'Same idea as the hover card; nothing new to weigh.'] };
  function roomStart() {
    var tid = newThread('room', 'plain', 'Talk through how people should reach search. Ask me what you need first, and don’t create any work until I pick something.');
    active = { flow: 'room', threadId: tid, runId: null, step: 0, at: {}, error: null, seen: {} };
    ctx().state.mode = 'Ask';
    ctx().switchThread(tid);
    roomConfigure(); arm();
  }
  function roomConfigure() {
    var c = ctx();
    C().openConfigure('chat_room');
    var d = C().draft();
    d.name = 'Make search easier to reach'; d.nameEdited = true; d.purpose = 'How should people reach search: a visible button, a keyboard shortcut, or both?';
    d.rows = d.rows.slice(0, 3); d.rows.forEach(function (r, i) { r.role = ['Product', 'Design', 'Engineering'][i]; r.persona = ['Product Manager', 'Architect', 'Implementer'][i]; });
    d.config.participantCount = 3; d.config.turnPolicy = 'moderated'; d.config.maxRounds = 2;
    d.roomInput = roomFixture(); d.wonderer = true; d.grillMe = true; d.recordedSpecialists = true;
    if (C().markRecorded) C().markRecorded(d);
    c.openDialog({ type: 'collab-configure' });
  }
  function roomTick(r) {
    var wg = WG(), w = wg.engine.state(r), s = r.grill;
    if (!active.begun) { active.begun = true; begin(r, 'room'); return; }
    if (s && s.tree.some(function (n) { return n.id === FACTS.room[0] && n.state === 'researching'; }) && at('fact', FACTS.room[2])) { wg.factFound('run:' + r.id, FACTS.room[0], FACTS.room[1]); render(); return; }
    if (r.status !== 'running') { if (r.status === 'completed') stop(); return; }
    /* no Wonderer on this room (you removed it): its steps are skipped (R6) */
    if (!w) return;
    var cr = r.chatRoom, replies = r.messages.filter(function (m) { return m.senderKind === 'participant' && m.roomRound; });
    /* a Chat Room never waits for the Wonderer: round 1 starts on time and the first pass joins the room when it is
       ready, between turns (here, once the first reply of round 1 has landed) */
    var p1 = passOf(r, 0), p2 = passOf(r, 1);
    if (p1 && p1.status === 'exploring' && replies.length >= 1 && at('pass1', 3000)) { deliverPass(r, 0); render(); return; }
    if (p2 && p2.status === 'exploring' && replies.length >= 5 && at('pass2', 1800)) { deliverPass(r, 1); render(); return; }
    /* the Moderator decides each lead as it arrives, between turns: every lead of a pass on the tick it lands, so no
       lead is still undecided when the room is summed up (m1) */
    var und = w.leads.filter(function (l) { return !l.disposition && wg.engine.visible(r, l.passId) && ROOM_DECIDE[l.id]; });
    if (und.length && at('decide:' + und[0].passId, 700)) {
      for (var i = 0; i < und.length; i++) {
        var l = und[i], x = ROOM_DECIDE[l.id], res = wg.dispose(r, l.id, x[0], x[1]); if (!res.ok) return fail(res.error);
        say(r, 'Lead ' + l.n + ': ' + ({ explore: 'explore', use: 'use', set_aside: 'set aside' })[x[0]] + '. ' + x[1] + (x[0] === 'explore' ? ' Engineering checks it in round 2.' : ''));
      }
      render(); return;
    }
    /* the helpers' replies that take up a lead link to it; checks come back in round 2 */
    r.messages.forEach(function (m) {
      if (active.seen[m.id] || m.senderKind !== 'participant' || !m.roomRound) return;
      active.seen[m.id] = 1;
      var slot = r.participants.findIndex(function (p) { return p.id === m.senderId; }), ids = (ROOM_TAKEUP[m.roomRound] || {})[slot] || [];
      ids.forEach(function (id) { if (wg.engine.lead(r, id)) wg.engine.takeUp(r, id, m.id, { id: m.senderId }); });
      var lr = function (id) { var l = wg.engine.lead(r, id); return l && l.research && l.research.status === 'running' ? l : null; };
      if (m.roomRound === 2 && slot === 2 && lr('r2')) wg.engine.finishResearch(r, 'r2', clone(lr('r2').check));
      if (m.roomRound === 2 && slot === 1 && lr('r3')) wg.engine.finishResearch(r, 'r3', clone(lr('r3').check));
      /* Product asks the Wonderer for a second pass in round 2; it joins between turns */
      if (m.roomRound === 2 && slot === 0 && !active.passIds[1]) { var res2 = wg.startPass(r, { kind: 'participant', id: m.senderId, name: 'Product' }, 'how people find a shortcut they don’t know yet', m.id, { queue: false, scripted: true }); if (res2.ok) active.passIds[1] = res2.pass.id; }
    });
    /* an explored lead, and the lead you sent with Check it, is researched by a participant in the next round (CWR-041) */
    if (cr.round && cr.round.number === 2 && !active.researching) {
      active.researching = true;
      [['r2', 2, 'Engineering'], ['r3', 1, 'Design']].forEach(function (x) { var l = wg.engine.lead(r, x[0]); if (l && l.research && l.research.status === 'queued') wg.engine.startResearch(r, x[0], { id: r.participants[x[1]].id, name: x[2] }); });
      render();
    }
  }

  /* ================================================================ the Deep Plan (the assistant grills you) */
  function deepStart() {
    var tid = newThread('deepplan', 'query', 'Plan offline search for the collection. Typing has to stay responsive.');
    active = { flow: 'deepplan', threadId: tid, runId: null, step: 0, at: {}, error: null };
    var c = ctx();
    c.state.mode = 'Deep Plan'; c.state.grillMe = true;
    c.switchThread(tid);
    var t = c.state.threads.filter(function (x) { return x.id === tid; })[0];
    c.appendMessage({ id: tid + '-ask', role: 'assistant', type: 'text', recordedExample: true, time: new Date().toISOString(),
      body: 'Grill Me is on, so I’ll ask the decisions first, a round at a time, each with the answer I recommend already filled in. Facts I can look up I won’t ask you. Nothing goes into the plan until you confirm what we agreed.' }, t);
    var res = WG().begin('thread:' + tid, { by: 'assistant', subject: 'Offline collection search', tree: clone(GRILL.deepplan), cap: 35, hooks: { onConfirm: function (a) { deepWrite(tid, a); } } });
    if (!res.ok) return fail(res.error);
    active.at = { start: Date.now() };
    arm(); render();
  }
  function deepTick() {
    var s = WG().threadSession(active.threadId); if (!s) return;
    if (s.tree.some(function (n) { return n.id === FACTS.deepplan[0] && n.state === 'researching'; }) && at('fact', FACTS.deepplan[2])) { WG().factFound('thread:' + active.threadId, FACTS.deepplan[0], FACTS.deepplan[1]); render(); }
  }
  /* the plan's steps follow what you confirmed, answer by answer, and say what is still open (R7): every offered
     alternative of every decision has its own wording, so the written plan never contradicts What we agreed */
  function deepSteps(a) {
    var ans = {}, open = {};
    a.decisions.forEach(function (d) { ans[d.id] = d.answer; });
    a.open.forEach(function (o) { open[o.id] = o; });
    var step = function (id, title, text, dep) { return { t: 'plan_step', plan_step_id: id, title: title, text: text, depends_on: dep || [], parallel_group_id: null, parent_step_id: null }; };
    var where = ans['d-where'], rank = ans['d-rank'], target = ans['d-target'], fallback = ans['d-fallback'], measure = ans['d-measure'];
    var upload = where === 'Allow an upload for big collections';
    var whereText = !where ? 'Where search runs is still open, so this step keeps the collection on the device until you decide.' : upload ? 'Small collections stay on the device; a big one may be uploaded to the search service, as you allowed.' : 'Nothing leaves the device.';
    var rankText = !rank ? ' Ranking is still open; results keep today’s order until you decide.' : rank === 'Rank by recency instead' ? ' Results are ranked by recency, newest first, as you chose.' : ' Today’s ranking stays as it is.';
    var size = !target ? 'the size you leave open' : target === 'Yes, up to 10,000 items' ? '10,000 items' : target === 'Up to 100,000 items' ? '100,000 items' : 'whatever fits on the device';
    var steps = [step('snapshot', upload ? 'Build a local snapshot, with an upload path for big collections' : 'Build a local snapshot of the collection', whereText + rankText),
      step('search', 'Search the snapshot off the typing path', 'Keep only the newest query’s answer, so typing stays responsive up to ' + size + '.', ['snapshot'])];
    if (fallback === 'No fallback') steps.push(step('nofallback', 'Remove the plain local filter', 'You chose no fallback, so the snapshot search is the only path once it ships.', ['search']));
    else steps.push(step('fallback', 'Keep the plain local filter as the fallback', fallback ? 'It stays the path when the snapshot is not ready.' : 'The fallback is still open; the plain filter stays until you decide.', ['search']));
    steps.push(measure === 'Pick a default now'
      ? step('default', 'Choose the default now: ' + size, 'You chose to pick the default now; the plan measures it on the slowest supported device after it ships.', ['search'])
      : step('measure', measure ? 'Measure before choosing the default' : 'Measure before choosing the default (still open)', 'On the slowest supported device, up to ' + size + '.' + (measure ? '' : ' Measuring first stays the plan until you decide.'), ['search']));
    return steps;
  }
  function deepWrite(tid, a) {
    var c = ctx(), t = c.state.threads.filter(function (x) { return x.id === tid; })[0], P = window.PM56_PLANS;
    c.appendMessage({ id: tid + '-writing', role: 'assistant', type: 'text', recordedExample: true, time: new Date().toISOString(), body: 'Thanks. Writing the plan from what we agreed: ' + a.decisions.length + ' decisions' + (a.open.length ? ', and ' + a.open.length + ' left open, which the plan names as open questions' : '') + '.' }, t);
    setTimeout(function () {
      if (!active || active.threadId !== tid || !P) return;
      var pid = 'wg-plan-' + (++serial), tpl = clone(P.fixture()['ap-index']), h = function (x) { return { t: 'heading', d: 2, text: x }; }, p = function (x) { return { t: 'paragraph', text: x }; };
      var up = a.decisions.some(function (d) { return d.id === 'd-where' && d.answer === 'Allow an upload for big collections'; }), title = up ? 'Collection search, local first' : 'Offline collection search';
      var blocks = [h('Objective'), p(up ? 'Collection search that keeps typing responsive: local first, with an upload for big collections.' : 'Offline collection search that keeps typing responsive.'), h('Decisions you made (Grill Me)'),
        { t: 'unordered_list', items: a.decisions.map(function (d) { return d.title + ': ' + d.answer; }) }].concat(a.open.length ? [h('Left open'), { t: 'unordered_list', items: a.open.map(function (o) { return o.title + ' — ' + o.why; }) }] : [])
        .concat(a.facts.length ? [h('Looked up, not asked'), { t: 'unordered_list', items: a.facts.map(function (f) { return f.title + ': ' + f.fact; }) }] : [])
        .concat([h('Steps')]).concat(deepSteps(a));
      Object.assign(tpl, { plan_id: pid, thread_id: tid, title: title, version: 1, strategy: 'Thorough', backend: 'direct', status: 'ready', current: true, view: 'rich', revisions: { 1: blocks }, grillMe: true,
        revisionLog: [], sources: [{ kind: 'creation', ref: 'grill-me:' + tid, note: 'Written after you confirmed What we agreed.' }], attachmentRefs: [], research: [], runHistory: [], approved: null, attention: null, wait: null, schedule: null,
        goalBinding: null, topology: null, planunits: [], unitsMaterialized: null, todosCreated: null });
      P.all()[pid] = tpl;
      c.appendMessage({ id: tid + '-plan', role: 'system', type: 'plan-card-v2', planId: pid, time: new Date().toISOString() }, t);
      active.planId = pid; render();
    }, ms(1200));
  }

  /* ================================================================ the tick and the guide */
  function tick() {
    if (!active) return stop();
    if (active.flow === 'deepplan') return deepTick();
    var r = current();
    if (!r && active.flow === 'room') { var x = C().runsForThread(active.threadId).filter(function (q) { return q.kind === 'chat_room'; })[0]; if (x) { active.runId = x.id; r = x; } }
    if (!r) return;
    if (active.flow === 'crew') crewTick(r); else roomTick(r);
  }
  /* how a session ended, in plain words (m2): every decision, a wrap-up, the limit, or Grill Me turned off */
  function endedWords(s) {
    var a = WG().grill.agreed(s), n = a.open.length, open = n ? ' ' + n + (n === 1 ? ' decision is' : ' decisions are') + ' left open.' : '';
    return (a.endedBy === 'wrap_up' ? 'You wrapped up.' : a.endedBy === 'cap' ? 'The question limit was reached.' : a.endedBy === 'switched_off' ? 'Grill Me is off, so the questions stopped.' : n ? 'No more questions to ask.' : 'That’s every decision.') + open + ' Read What we agreed, then Confirm.';
  }
  function who(pass) { return pass.by.kind === 'user' ? 'You' : pass.by.name || 'A helper'; }
  function step(c) {
    var a = active, flow = a.flow, r = current(), wg = WG();
    var key = flow === 'deepplan' ? 'thread:' + a.threadId : r ? 'run:' + r.id : '', s = key ? wg.sessionOf(key) : null;
    var lead = flow === 'room' ? 'the Moderator' : flow === 'deepplan' ? 'the assistant' : 'the Coordinator';
    if (a.error) return { text: 'This recording stopped here (' + a.error.replace(/_/g, ' ') + '). Everything so far is kept. Replay starts it again.', replay: true };
    /* between Start and the tick that binds the room's run, the guide says so rather than offering the sheet again */
    if (flow === 'room' && (r ? !a.begun : C().runsForThread(a.threadId).some(function (q) { return q.kind === 'chat_room'; }))) return { text: 'The room is starting.' };
    if (flow !== 'deepplan' && !r) return { text: 'Set up the ' + (flow === 'crew' ? 'Crew' : 'room') + ': the Wonderer and Grill Me are already on. Press Start.', act: { action: 'wg-demo-configure', label: 'Set it up' } };
    if (s && s.status === 'grilling') {
      var rd = wg.grill.round(s), only = s.later ? ' Only ' + (s.gateLabel || 'that step') + ' waits; everything else keeps going.' : '';
      return rd ? { text: (s.later ? 'A later decision: ' + lead + ' is grilling you before ' + (s.gateLabel || 'the next step') + '. ' : 'Round ' + rd.n + ': ' + lead + ' is grilling you. ') + 'Each answer is filled in with the recommended one; it counts once you send or accept the round. Change any, say Not sure, or accept them all.' + only + (rd.n === 1 && !s.later && s.routed.length ? ' A fact it can look up is being researched, not asked.' : ''), act: { action: 'wg-open-round', label: c.state.decision ? '' : (s.later ? 'Answer it' : 'Answer round ' + rd.n), data: { key: key } } }
        : { text: lead.charAt(0).toUpperCase() + lead.slice(1) + ' is looking a fact up. Every question left depends on it, so the session waits rather than ending early. Nothing for you yet.' };
    }
    if (s && s.status === 'agreeing') return { text: endedWords(s) + ' ' + (s.later ? 'Only ' + (s.gateLabel || 'that step') + ' waits for it.' : flow === 'crew' ? 'The split waits for it.' : flow === 'room' ? 'Round 1 waits for it.' : 'The plan isn’t written until then.'), act: { action: 'wg-confirm', label: 'Confirm', data: { key: key } } };
    if (flow === 'deepplan') return a.planId ? { text: 'The plan is written from what you agreed. Nothing has been built. Open it from its card.', replay: true } : { text: 'Writing the plan from what you agreed.' };
    var w = wg.engine.state(r), c2 = wg.counts(r);
    if (flow === 'crew') {
      if (r.status === 'completed') return { text: 'Done. Open the Crew’s panel: the result lists ' + (w ? 'every Wonderer lead and what the Crew did with it.' : 'what each part did.'), act: { action: 'crew-open-work', label: 'Open Panel', data: { run: r.id } }, replay: true };
      if (r.grillPending) return { text: 'Grill Me is on now. The Coordinator questions you at the next assignment; the parts already running keep going.' };
      var q = w && w.passes.filter(function (x) { return x.status === 'queued'; })[0], x = w && w.passes.filter(function (y) { return y.n > 1 && y.status === 'exploring'; })[0];
      if (q) return { text: who(q) + ' asked the Wonderer for pass ' + q.n + '. Both slots are busy, so it is queued behind the parts: the team keeps working, and the final result waits for it.' };
      if (x) return { text: 'A slot freed up, so pass ' + x.n + ' is exploring. The Coordinator decides each of its leads as it arrives.' };
      if (r.crew.assignments.some(function (z) { return z.leadId && z.status === 'running'; })) return { text: 'An explored lead is now a read-only part: a helper checks it and writes nothing. Watch its status change in place.' };
      if (!r.crew.assignments.some(function (z) { return z.attempt; })) return { text: !w ? 'The Coordinator splits the job. You removed the Wonderer, so there are no leads this time.' : c2.total ? 'The Coordinator decides each Wonderer lead as it splits the job: explore, use or set aside, each with a reason you can read.' : 'The Wonderer’s first pass arrives before the split.' };
      return { text: 'The Crew works. ' + (w ? 'Its card counts the leads explored, used, set aside and undecided; the final result waits until every lead is decided and back from research.' : 'Each part is checked before it counts.') };
    }
    var cr = r.chatRoom;
    if (r.status === 'completed') return { text: 'The room ended. ' + (w ? 'Its summary lists every lead, with what the room did with it or “not taken up”.' : 'Nothing became a To-Do or Plan by itself.'), replay: true };
    if (r.grillPending) return { text: 'Grill Me is on now. The Moderator questions you before the next round; this round goes on.' };
    if (!cr.roundsSoFar && !(cr.round && !cr.round.complete)) return { text: 'Start round 1. ' + (w ? 'It doesn’t wait for the Wonderer: its leads join the room between turns when they are ready, and it never takes a turn.' : 'Each helper speaks once.'), act: { action: 'collab-room-next-round', label: 'Start round 1', data: { run: r.id } } };
    if (cr.round && !cr.round.complete) return { text: w && c2.total ? 'The Wonderer’s leads joined between turns, and the Moderator decides each one as it arrives. A reply that takes up a lead links to it.' : w ? 'Each helper speaks once. The Wonderer is still exploring alongside.' : 'Each helper speaks once.' };
    var undecided = w ? w.leads.filter(function (l) { return !l.disposition && wg.engine.visible(r, l.passId); }).length : 0;
    if (cr.roundsSoFar === 1) {
      /* the guide reads lead 3's real state before it says what the Moderator did with it (M3) */
      var r3 = w && wg.engine.lead(r, 'r3');
      if (r3 && !r3.research && r3.disposition) return { text: 'The Moderator ' + (r3.disposition.kind === 'set_aside' ? 'set lead 3 aside' : r3.disposition.kind === 'use' ? 'is using lead 3 as a hypothesis' : 'chose to explore lead 3') + '. Check it sends it to research anyway: only you can do that.', act: { action: 'wg-check-it', label: 'Check lead 3', data: { run: r.id, lead: 'r3' } } };
      if (r3 && !r3.disposition && !r3.research) return { text: 'The Moderator decides lead 3 as it arrives. You can Check any lead now, whatever the room decides.' };
      return { text: 'Start round 2' + (w ? ': Engineering checks the explored lead' + (r3 && r3.research && r3.research.via === 'check_it' ? ', and Design checks the one you sent.' : '.') : '.'), act: { action: 'collab-room-next-round', label: 'Start round 2', data: { run: r.id } } };
    }
    if (cr.roundsSoFar === 2 && !cr.summary) {
      /* the guide waits the moment it takes the Moderator to decide what just arrived, so the summary it offers lists
         every lead with its decision (m1); Summarize Now on the card is never blocked */
      if (undecided) return { text: 'The Moderator is deciding the last ' + (undecided === 1 ? 'lead' : undecided + ' leads') + ' as they arrive; the summary comes next. Nothing waits on a lead: Summarize Now on the card works at any time.' };
      return { text: 'Sum it up: the summary lists every lead' + (w ? ', each with what the room did with it.' : '.') + ' Nothing waits on a lead.', act: { action: 'collab-room-summarize', label: 'Summarize Now', data: { run: r.id } } };
    }
    return { text: 'End the discussion. Nothing becomes a To-Do or Plan by itself.', act: { action: 'room-finish', label: 'End discussion', data: { run: r.id } } };
  }
  function guide(c) {
    if (!active || c.state.selectedThread !== active.threadId || c.state.dialog) return '';
    var st = step(c), acts = [];
    if (st.act && st.act.label) acts.push({ action: 'wg-demo-step', label: st.act.label === 'Confirm' ? 'Confirm' : 'Do this step' });
    if (st.replay) acts.push({ action: 'wg-demo-replay', label: 'Replay' });
    return S().pmxGuide({ key: 'wg-demo-guide', cls: 'wg-demo-guide', placement: 'dock', step: c.esc(st.text), actions: acts, close: { action: 'wg-demo-close', label: 'Close the example' } });
  }
  E.slot('composerBelow', guide);
  function start(flow) {
    if (!flows[flow]) return;
    stop(); active = null;
    if (flow === 'brainstorm') { var b = document.createElement('button'); b.dataset.flow = 'leads'; E.run('b13-start', b, new Event('click')); return; }
    if (flow === 'crew') crewStart(); else if (flow === 'room') roomStart(); else deepStart();
  }
  E.action('wg-demo-start', function (c, b) { start(b.dataset.flow); return true; });
  E.action('wg-demo-configure', function () { if (!active) return true; if (active.flow === 'crew') crewConfigure(); else if (active.flow === 'room') roomConfigure(); return true; });
  E.action('wg-demo-replay', function () { if (active) start(active.flow); return true; });
  E.action('wg-demo-close', function () { stop(); active = null; ctx().renderApp(); return true; });
  E.action('wg-demo-step', function (c) {
    if (!active) return true;
    var st = step(c); if (!st.act) return true;
    var b = document.createElement('button'); b.dataset.action = st.act.action; Object.assign(b.dataset, st.act.data || {});
    E.run(st.act.action, b, new Event('click')); c.renderApp(); return true;
  });
  E.chainAction('reset-all', function () { stop(); active = null; return false; });
  ['plan-demo-start', 'schedule-demo-start', 'review-demo-start', 'brainstorm-demo-start', 'crew-demo-start', 'room-demo-start', 'b13-start'].forEach(function (n) { E.chainAction(n, function () { stop(); active = null; return false; }); });
  var G = window.PM56_REPAIR_DEMOS, old = G.gallery;
  G.gallery = function (c) {
    return '<section class="demo-section"><h3>Wonderer and Grill Me</h3><div class="demo-section-body">' + Object.keys(flows).map(function (id) {
      return '<button class="demo-trigger" data-action="wg-demo-start" data-flow="' + id + '"><strong>' + c.esc(flows[id].label) + '</strong><small>' + c.esc(flows[id].detail) + '</small></button>';
    }).join('') + '</div></section>' + old(c);
  };
  window.PM56_WG_DEMOS = { start: start, flows: flows, fixtures: { grill: GRILL, passes: PASSES, room: roomFixture }, snapshot: function () { return active ? clone(Object.assign({}, active, { steps: undefined })) : null; }, tick: tick };
})();
